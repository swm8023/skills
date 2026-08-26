import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import test from "node:test";

const scriptPath = fileURLToPath(new URL("./export-session.mjs", import.meta.url));
const turnsPerFile = 256;
const headerSize = 8 + turnsPerFile * 8;

test("exports a child request as its complete active root tree", async (t) => {
  const home = await makeWheelmakerHome(t);
  const sessions = makeTreeSessions();
  createSessionDatabase(home, sessions);
  await writeTurnFiles(home, "Demo", "root-1", [
    { method: "prompt_request", param: { text: "root prompt" } },
    { method: "prompt_done", param: { stopReason: "end_turn" } },
  ]);
  await writeTurnFiles(home, "Demo", "child-a", [
    {
      method: "prompt_done",
      param: {
        stopReason: "end_turn",
        artifacts: [{
          artifactId: "diff-abc",
          type: "diff",
          format: "unified-diff",
          fileCount: 1,
          files: [{ path: "a.txt", status: "M" }],
        }],
      },
    },
  ]);
  await writeTurnFiles(home, "Demo", "grand-child", [
    { method: "agent_message_chunk", param: { text: "grandchild" } },
  ]);
  const artifactFile = artifactPath(home, "Demo", "child-a", "diff-abc");
  await mkdir(dirname(artifactFile), { recursive: true });
  await writeFile(artifactFile, "DO_NOT_EXPORT_ARTIFACT_BODY", "utf8");

  const outputPath = join(home, "bundle.json");
  const result = runExporter([
    "child-a",
    "--wheelmaker-home",
    home,
    "--output",
    outputPath,
  ]);

  assert.equal(result.status, 0, result.stderr);
  const bundle = await readJSON(outputPath);
  assert.equal(bundle.requestedSessionId, "child-a");
  assert.equal(bundle.rootSessionId, "root-1");
  assert.deepEqual(
    bundle.sessions.map((session) => session.id),
    ["root-1", "grand-child", "child-a"],
  );
  assert.equal(bundle.source.scope, "active");
  assert.equal(bundle.source.includesArchive, false);
  assert.equal(bundle.source.includesLiveTail, false);
  assert.equal(bundle.source.redacted, false);
  assert.equal(bundle.source.containsSensitiveData, true);
  assert.equal(bundle.sessions[0].raw.id, "root-1");
  assert.equal(bundle.sessions[0].agent.agentInfo.name, "codex");
  assert.equal(bundle.sessions[0].sessionSync.latestPersistedTurnIndex, 2);
  assert.equal(bundle.sessions[0].turns[0].content.method, "prompt_request");
  assert.equal(bundle.sessions[0].turns[0].finished, true);
  assert.equal(bundle.sessions[2].artifactRefs[0].artifactId, "diff-abc");
  assert.equal(JSON.stringify(bundle).includes("DO_NOT_EXPORT_ARTIFACT_BODY"), false);
  assert.deepEqual(bundle.errors, []);
});

test("reads every durable turn across WMT2 files", async (t) => {
  const home = await makeWheelmakerHome(t);
  createSessionDatabase(home, [makeSession({
    id: "many-turns",
    projectName: "Demo",
    sync: { latestPersistedTurnIndex: 257 },
  })]);
  await writeTurnFiles(home, "Demo", "many-turns", Array.from({ length: 257 }, (_, index) => ({
    method: index === 0 ? "prompt_request" : "agent_message_chunk",
    param: { text: `message-${index + 1}` },
  })));

  const outputPath = join(home, "many.json");
  const result = runExporter(["many-turns", "--wheelmaker-home", home, "--output", outputPath]);

  assert.equal(result.status, 0, result.stderr);
  const bundle = await readJSON(outputPath);
  assert.equal(bundle.sessions[0].turns.length, 257);
  assert.equal(bundle.sessions[0].turns[0].content.param.text, "message-1");
  assert.equal(bundle.sessions[0].turns[256].turnIndex, 257);
  assert.equal(bundle.sessions[0].turns[256].content.param.text, "message-257");
  assert.equal(bundle.stats.turnCount, 257);
});

test("writes a partial bundle and non-zero status for corrupt WMT2 data", async (t) => {
  const home = await makeWheelmakerHome(t);
  createSessionDatabase(home, [makeSession({
    id: "corrupt-session",
    projectName: "Demo",
    sync: { latestPersistedTurnIndex: 1 },
  })]);
  const path = turnFilePath(home, "Demo", "corrupt-session", 0);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, Buffer.alloc(headerSize));

  const outputPath = join(home, "partial.json");
  const result = runExporter(["corrupt-session", "--wheelmaker-home", home, "--output", outputPath]);

  assert.notEqual(result.status, 0);
  const bundle = await readJSON(outputPath);
  assert.equal(bundle.sessions[0].id, "corrupt-session");
  assert.ok(bundle.errors.length > 0);
  assert.equal(bundle.errors[0].sessionId, "corrupt-session");
});

test("keeps valid members when another member relation is corrupt", async (t) => {
  const home = await makeWheelmakerHome(t);
  createSessionDatabase(home, [
    makeSession({ id: "relation-root", projectName: "Demo" }),
    makeSession({
      id: "valid-child",
      projectName: "Demo",
      sync: {
        sessionKind: "subagent",
        parentSessionId: "relation-root",
        rootSessionId: "relation-root",
        spawnSequence: 1,
      },
    }),
    makeSession({
      id: "corrupt-child",
      projectName: "Demo",
      sync: "not-an-object",
    }),
  ]);

  const outputPath = join(home, "relation.json");
  const result = runExporter([
    "relation-root",
    "--wheelmaker-home",
    home,
    "--output",
    outputPath,
  ]);

  assert.notEqual(result.status, 0);
  const bundle = await readJSON(outputPath);
  assert.deepEqual(
    bundle.sessions.map((session) => session.id),
    ["relation-root", "valid-child"],
  );
  assert.ok(bundle.errors.some((error) => error.sessionId === "corrupt-child"));
});

test("does not fall back to archive data for an active-only export", async (t) => {
  const home = await makeWheelmakerHome(t);
  createSessionDatabase(home, [makeSession({ id: "active-session", projectName: "Demo" })]);
  const archiveProject = join(home, "db", "session-archive", "Demo");
  await mkdir(archiveProject, { recursive: true });
  await writeFile(
    join(archiveProject, "manifest.json"),
    JSON.stringify({ version: 2, sessions: { "archived-only": { sessionId: "archived-only" } } }),
    "utf8",
  );

  const outputPath = join(home, "archive-only.json");
  const result = runExporter(["archived-only", "--wheelmaker-home", home, "--output", outputPath]);

  assert.notEqual(result.status, 0);
  assert.equal(await exists(outputPath), false);
  assert.match(`${result.stderr}\n${result.stdout}`, /not found|active/i);
});

test("protects an existing output unless force is explicit", async (t) => {
  const home = await makeWheelmakerHome(t);
  createSessionDatabase(home, [makeSession({ id: "collision", projectName: "Demo" })]);
  const outputPath = join(home, "collision.json");
  await writeFile(outputPath, "keep-me", "utf8");

  const refused = runExporter(["collision", "--wheelmaker-home", home, "--output", outputPath]);
  assert.notEqual(refused.status, 0);
  assert.equal(await readFile(outputPath, "utf8"), "keep-me");

  const forced = runExporter([
    "collision",
    "--wheelmaker-home",
    home,
    "--output",
    outputPath,
    "--force",
  ]);
  assert.equal(forced.status, 0, forced.stderr);
  const bundle = await readJSON(outputPath);
  assert.equal(bundle.rootSessionId, "collision");
});

test("uses the custom WheelMaker home and preserves raw sensitive content", async (t) => {
  const home = await makeWheelmakerHome(t);
  createSessionDatabase(home, [makeSession({
    id: "custom-home",
    projectName: "Custom",
    agent: { secret: "token-should-remain" },
    sync: { latestPersistedTurnIndex: 1 },
  })]);
  await writeTurnFiles(home, "Custom", "custom-home", [
    { method: "agent_message_chunk", param: { text: "token-should-remain" } },
  ]);

  const result = runExporter(["custom-home", "--wheelmaker-home", home]);

  assert.equal(result.status, 0, result.stderr);
  const outputName = (await readdir(process.cwd())).find((name) => name.startsWith("export-session-custom-home-"));
  assert.ok(outputName, "default output file should be created in the current directory");
  const outputPath = join(process.cwd(), outputName);
  t.after(() => rm(outputPath, { force: true }));
  const bundle = await readJSON(outputPath);
  assert.equal(bundle.sessions[0].agent.secret, "token-should-remain");
  assert.equal(bundle.sessions[0].turns[0].content.param.text, "token-should-remain");
  assert.equal(bundle.source.redacted, false);
});

function makeTreeSessions() {
  return [
    makeSession({
      id: "root-1",
      projectName: "Demo",
      agent: { agentInfo: { name: "codex" }, secret: "root-secret" },
      sync: {
        latestPersistedTurnIndex: 2,
        lastDoneTurnIndex: 2,
        lastDoneSuccess: true,
        lastReadTurnIndex: 1,
        nextSubagentSequence: 3,
      },
    }),
    makeSession({
      id: "child-a",
      projectName: "Demo",
      title: "Second child",
      sync: {
        latestPersistedTurnIndex: 1,
        sessionKind: "subagent",
        parentSessionId: "root-1",
        rootSessionId: "root-1",
        readOnly: true,
        spawnSequence: 2,
        subagentName: "Second",
        subagentStatus: "completed",
        providerReplay: { lastCompletedTurnId: "provider-2" },
      },
    }),
    makeSession({
      id: "grand-child",
      projectName: "Demo",
      sync: {
        latestPersistedTurnIndex: 1,
        sessionKind: "subagent",
        parentSessionId: "child-a",
        rootSessionId: "root-1",
        readOnly: true,
        spawnSequence: 1,
        subagentStatus: "completed",
      },
    }),
  ];
}

function makeSession({
  id,
  projectName,
  title = JSON.stringify({ first: `${id} first`, last: `${id} last` }),
  status = 2,
  agent = { agentInfo: { name: "codex" } },
  sync = {},
}) {
  return {
    id,
    projectName,
    status,
    agentType: "codex",
    agent,
    sync,
    title,
    createdAt: "2026-08-26T01:00:00.000Z",
    updatedAt: "2026-08-26T02:00:00.000Z",
  };
}

function createSessionDatabase(wheelmakerHome, sessions) {
  const db = new DatabaseSync(join(wheelmakerHome, "db", "client.sqlite3"));
  db.exec(`
    CREATE TABLE sessions (
      id TEXT PRIMARY KEY,
      project_name TEXT NOT NULL,
      status INTEGER NOT NULL,
      agent_type TEXT NOT NULL,
      agent_json TEXT NOT NULL,
      session_sync_json TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  const insert = db.prepare(`
    INSERT INTO sessions (
      id, project_name, status, agent_type, agent_json,
      session_sync_json, title, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const session of sessions) {
    insert.run(
      session.id,
      session.projectName,
      session.status,
      session.agentType,
      JSON.stringify(session.agent),
      JSON.stringify(session.sync),
      session.title,
      session.createdAt,
      session.updatedAt,
    );
  }
  db.close();
}

async function writeTurnFiles(wheelmakerHome, projectName, sessionId, turns) {
  for (let fileNo = 0; fileNo * turnsPerFile < turns.length; fileNo += 1) {
    const first = fileNo * turnsPerFile;
    const chunk = turns.slice(first, first + turnsPerFile);
    const bodies = chunk.map((turn) => Buffer.from(JSON.stringify(turn), "utf8"));
    const header = Buffer.alloc(headerSize);
    header.write("WMT2", 0, "ascii");
    header.writeUInt16LE(2, 4);
    let offset = headerSize;
    for (let slot = 0; slot < bodies.length; slot += 1) {
      header.writeUInt32LE(offset, 8 + slot * 8);
      header.writeUInt32LE(bodies[slot].length, 8 + slot * 8 + 4);
      offset += bodies[slot].length;
    }
    const path = turnFilePath(wheelmakerHome, projectName, sessionId, fileNo);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, Buffer.concat([header, ...bodies]));
  }
}

function runExporter(args) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    windowsHide: true,
  });
}

async function makeWheelmakerHome(t) {
  const root = await mkdtemp(join(tmpdir(), "export-session-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "db"), { recursive: true });
  return root;
}

async function readJSON(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function exists(path) {
  try {
    await readFile(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function artifactPath(wheelmakerHome, projectName, sessionId, artifactId) {
  return join(
    wheelmakerHome,
    "db",
    "session",
    safeHistoryPathPart(projectName),
    safeHistoryPathPart(sessionId),
    "artifacts",
    `${artifactId}.diff`,
  );
}

function turnFilePath(wheelmakerHome, projectName, sessionId, fileNo) {
  return join(
    wheelmakerHome,
    "db",
    "session",
    safeHistoryPathPart(projectName),
    safeHistoryPathPart(sessionId),
    "turns",
    `t${String(fileNo).padStart(6, "0")}.bin`,
  );
}

function safeHistoryPathPart(value) {
  return String(value).replace(/[\\/:*?"<>|]/g, "_");
}
