import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(new URL("./read-session.mjs", import.meta.url));
const chunkScriptPath = fileURLToPath(new URL("./read-text-chunk.mjs", import.meta.url));
const turnsPerFile = 256;
const headerSize = 8 + turnsPerFile * 8;

test("extracts every stored turn across WMT2 files", async (t) => {
  const wheelmakerHome = await makeWheelmakerHome(t);
  const sessionId = "session-257";
  const projectName = "Project/One";
  const turns = Array.from({ length: 257 }, (_, index) => ({
    method: index === 0 ? "prompt_request" : "agent_message_chunk",
    param: index === 0
      ? { contentBlocks: [{ type: "text", text: "build the feature" }] }
      : { text: `message ${index + 1}`, messageComplete: true },
  }));

  createSessionDatabase(wheelmakerHome, {
    id: sessionId,
    projectName,
    latestPersistedTurnIndex: turns.length,
  });
  await writeTurnFiles(wheelmakerHome, projectName, sessionId, turns);

  const outputPath = join(wheelmakerHome, "transcript.md");
  const result = runExtractor([
    sessionId,
    "--wheelmaker-home",
    wheelmakerHome,
    "--output",
    outputPath,
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Wrote 257 turns to/);
  const transcript = await readFile(outputPath, "utf8");
  assert.match(transcript, /# WheelMaker Session Transcript/);
  assert.match(transcript, /- Session ID: `session-257`/);
  assert.match(transcript, /- Project: `Project\/One`/);
  assert.match(transcript, /- Stored turns: 257/);
  assert.match(transcript, /### Turn 1 — `prompt_request`/);
  assert.match(transcript, /"text": "build the feature"/);
  assert.match(transcript, /### Turn 257 — `agent_message_chunk`/);
  assert.match(transcript, /"text": "message 257"/);
});

test("writes the transcript to stdout when output is omitted", async (t) => {
  const wheelmakerHome = await makeWheelmakerHome(t);
  createSessionDatabase(wheelmakerHome, {
    id: "stdout-session",
    projectName: "Demo",
    latestPersistedTurnIndex: 1,
  });
  await writeTurnFiles(wheelmakerHome, "Demo", "stdout-session", [
    { method: "system", param: { text: "context" } },
  ]);

  const result = runExtractor([
    "stdout-session",
    "--wheelmaker-home",
    wheelmakerHome,
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /### Turn 1 — `system`/);
  assert.match(result.stdout, /"text": "context"/);
});

test("preserves a plain-text session title", async (t) => {
  const wheelmakerHome = await makeWheelmakerHome(t);
  createSessionDatabase(wheelmakerHome, {
    id: "named-session",
    projectName: "Demo",
    latestPersistedTurnIndex: 0,
    title: "Named session",
  });

  const result = runExtractor([
    "named-session",
    "--wheelmaker-home",
    wheelmakerHome,
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /"title": "Named session"/);
});

test("reports an unknown session without scanning unrelated project code", async (t) => {
  const wheelmakerHome = await makeWheelmakerHome(t);
  createSessionDatabase(wheelmakerHome, {
    id: "known-session",
    projectName: "Demo",
    latestPersistedTurnIndex: 0,
  });

  const result = runExtractor([
    "missing-session",
    "--wheelmaker-home",
    wheelmakerHome,
  ]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /^handoff: Session not found: missing-session/);
  assert.match(result.stderr, /Session not found: missing-session/);
});

test("rejects a corrupt WMT2 header", async (t) => {
  const wheelmakerHome = await makeWheelmakerHome(t);
  createSessionDatabase(wheelmakerHome, {
    id: "corrupt-session",
    projectName: "Demo",
    latestPersistedTurnIndex: 1,
  });
  const turnPath = turnFilePath(wheelmakerHome, "Demo", "corrupt-session", 0);
  await mkdir(dirname(turnPath), { recursive: true });
  await writeFile(turnPath, Buffer.alloc(headerSize));

  const result = runExtractor([
    "corrupt-session",
    "--wheelmaker-home",
    wheelmakerHome,
  ]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /invalid WMT2 magic/);
});

test("reads transcript chunks without splitting UTF-8 characters", async (t) => {
  const root = await makeWheelmakerHome(t);
  const path = join(root, "chunk.txt");
  await writeFile(path, "abcdef世界ghij", "utf8");

  const result = spawnSync(process.execPath, [
    chunkScriptPath,
    path,
    "--start",
    "0",
    "--max-bytes",
    "7",
  ], {
    encoding: "utf8",
    windowsHide: true,
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout,
    "--- bytes 0-6 of 16; next=6 ---\nabcdef\n--- end chunk ---\n",
  );
});

function runExtractor(args) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    encoding: "utf8",
    windowsHide: true,
  });
}

async function makeWheelmakerHome(t) {
  const root = await mkdtemp(join(tmpdir(), "handoff-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "db"), { recursive: true });
  return root;
}

function createSessionDatabase(wheelmakerHome, session) {
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
  db.prepare(`
    INSERT INTO sessions (
      id, project_name, status, agent_type, agent_json,
      session_sync_json, title, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    session.id,
    session.projectName,
    0,
    "codex",
    JSON.stringify({ agentInfo: { name: "codex" } }),
    JSON.stringify({
      latestPersistedTurnIndex: session.latestPersistedTurnIndex,
      lastDoneTurnIndex: session.latestPersistedTurnIndex,
      lastDoneSuccess: true,
    }),
    session.title ?? JSON.stringify({ first: "first prompt", last: "last prompt" }),
    "2026-08-06T08:00:00Z",
    "2026-08-06T09:00:00Z",
  );
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
  return value.replace(/[\\/:*?"<>|]/g, "_");
}
