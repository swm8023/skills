import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const scriptPath = fileURLToPath(new URL("./read-session.mjs", import.meta.url));
const chunkScriptPath = fileURLToPath(new URL("./read-text-chunk.mjs", import.meta.url));
const headerSize = 16;

test("extracts every stored turn across gzip and raw WMT3 frames", async (t) => {
  const wheelmakerHome = await makeWheelmakerHome(t);
  const sessionId = "session-257";
  const projectName = "Project/One";
  const turns = Array.from({ length: 257 }, (_, index) => ({
    method: index === 0 ? "prompt_request" : "agent_message_chunk",
    param: index === 0
      ? { contentBlocks: [{ type: "text", text: "build the feature" }] }
      : { text: `message ${index + 1} 世界`, messageComplete: true },
  }));

  createSessionDatabase(wheelmakerHome, {
    id: sessionId,
    projectName,
    latestPersistedTurnIndex: turns.length,
  });
  await writeSessionFile(wheelmakerHome, projectName, sessionId, turns);

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
  assert.match(transcript, /"text": "message 257 世界"/);
  assert.equal((transcript.match(/^### Turn /gm) ?? []).length, 257);
});

test("writes the transcript to stdout when output is omitted", async (t) => {
  const wheelmakerHome = await makeWheelmakerHome(t);
  createSessionDatabase(wheelmakerHome, {
    id: "stdout-session",
    projectName: "Demo",
    latestPersistedTurnIndex: 1,
  });
  await writeSessionFile(wheelmakerHome, "Demo", "stdout-session", [
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

test("rejects a corrupt WMT3 header", async (t) => {
  const wheelmakerHome = await makeWheelmakerHome(t);
  createSessionDatabase(wheelmakerHome, {
    id: "corrupt-session",
    projectName: "Demo",
    latestPersistedTurnIndex: 1,
  });
  const turnPath = sessionFilePath(wheelmakerHome, "Demo", "corrupt-session");
  await mkdir(dirname(turnPath), { recursive: true });
  await writeFile(turnPath, Buffer.alloc(headerSize));

  const result = runExtractor([
    "corrupt-session",
    "--wheelmaker-home",
    wheelmakerHome,
  ]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /invalid WMT3 magic/);
});

test("reads only the SQLite persisted prefix even inside a frame", async (t) => {
  const root = await makeWheelmakerHome(t);
  createSessionDatabase(root, { id: "prefix", projectName: "Demo", latestPersistedTurnIndex: 1 });
  await writeSessionFile(root, "Demo", "prefix", [
    { method: "prompt_done", param: { stopReason: "end_turn" } },
    { method: "prompt_request", param: { text: "not committed to SQLite" } },
  ]);
  const result = runExtractor(["prefix", "--wheelmaker-home", root]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Stored turns: 1/);
  assert.doesNotMatch(result.stdout, /not committed to SQLite|### Turn 2/);
});

test("rejects a SQLite cursor beyond the WMT3 turn count", async (t) => {
  const root = await makeWheelmakerHome(t);
  createSessionDatabase(root, { id: "ahead", projectName: "Demo", latestPersistedTurnIndex: 2 });
  await writeSessionFile(root, "Demo", "ahead", [{ method: "prompt_done" }]);
  const result = runExtractor(["ahead", "--wheelmaker-home", root]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /persisted turn index 2 exceeds WMT3 turn count 1/);
  assert.equal(result.stdout, "");
});

test("does not fall back to legacy WMT2 files", async (t) => {
  const root = await makeWheelmakerHome(t);
  createSessionDatabase(root, { id: "legacy", projectName: "Demo", latestPersistedTurnIndex: 1 });
  const path = join(dirname(sessionFilePath(root, "Demo", "legacy")), "turns", "t000000.bin");
  const body = Buffer.from(JSON.stringify({ method: "prompt_done" }));
  const legacyHeader = Buffer.alloc(8 + 256 * 8);
  legacyHeader.write("WMT2");
  legacyHeader.writeUInt16LE(2, 4);
  legacyHeader.writeUInt32LE(legacyHeader.length, 8);
  legacyHeader.writeUInt32LE(body.length, 12);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, Buffer.concat([legacyHeader, body]));
  const result = runExtractor(["legacy", "--wheelmaker-home", root]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /missing WMT3 session file/);
  assert.match(result.stderr, /WMT2 is not supported/);
  assert.equal(result.stdout, "");
});

const invalidFiles = [
  ["short file header", (raw) => raw.subarray(0, 12), /WMT3 header too short/],
  ["legacy magic", (raw) => { raw.write("WMT2"); return raw; }, /invalid WMT3 magic/],
  ["unknown version", (raw) => { raw[4] = 4; return raw; }, /unsupported WMT3 version/],
  ["reserved bytes", (raw) => { raw[5] = 1; return raw; }, /reserved bytes/],
  ["unknown file codec", (raw) => { raw.writeUInt32LE(2, 12); return raw; }, /file codec/],
  ["short frame header", (raw) => raw.subarray(0, 20), /frame header too short/],
  ["truncated payload", (raw) => raw.subarray(0, raw.length - 1), /frame.*exceeds file/],
  ["zero frame turns", (raw) => { raw.writeUInt32LE(0, 24); return raw; }, /invalid WMT3 frame header/],
  ["unknown frame codec", (raw) => { raw.writeUInt32LE(5, 28); return raw; }, /frame codec/],
  ["gzip corruption", (raw) => { raw[32] = 0; return raw; }, /cannot decompress WMT3 frame/],
  ["uncompressed length mismatch", (raw) => { raw.writeUInt32LE(999, 20); return raw; }, /uncompressed length/],
  ["frame turn count mismatch", (raw) => { raw.writeUInt32LE(2, 24); return raw; }, /payload turn count/],
  ["file turn count mismatch", (raw) => { raw.writeUInt32LE(2, 8); return raw; }, /header turn count/],
  ["invalid JSON", () => makeWMT3([makeFrame(Buffer.from("[invalid"), 1, 0)], 1), /invalid JSON in WMT3/],
  ["non-array JSON", () => makeWMT3([makeFrame(Buffer.from("{}"), 1, 0)], 1), /payload must be an array/],
  ["invalid turn", () => makeWMT3([makeFrame(Buffer.from("[null]"), 1, 0)], 1), /invalid WMT3 turn 1/],
];

for (const [name, mutate, expectedError] of invalidFiles) {
  test(`rejects ${name} without writing a partial transcript`, async (t) => {
    const root = await makeWheelmakerHome(t);
    createSessionDatabase(root, { id: "invalid", projectName: "Demo", latestPersistedTurnIndex: 1 });
    const path = sessionFilePath(root, "Demo", "invalid");
    await writeSessionFile(root, "Demo", "invalid", [{ method: "prompt_done" }]);
    await writeFile(path, mutate(await readFile(path)));
    const output = join(root, "transcript.md");
    await writeFile(output, "existing transcript");
    const result = runExtractor(["invalid", "--wheelmaker-home", root, "--output", output]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, expectedError);
    assert.equal(await readFile(output, "utf8"), "existing transcript");
    assert.equal(result.stdout, "");
  });
}

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

async function writeSessionFile(wheelmakerHome, projectName, sessionId, turns) {
  const frames = [];
  for (let first = 0; first < turns.length; first += 128) {
    const chunk = turns.slice(first, first + 128);
    frames.push(makeFrame(Buffer.from(JSON.stringify(chunk)), chunk.length, frames.length % 2 === 0 ? 1 : 0));
  }
  const path = sessionFilePath(wheelmakerHome, projectName, sessionId);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, makeWMT3(frames, turns.length));
}

function makeWMT3(frames, turnCount) {
  const header = Buffer.alloc(headerSize);
  header.write("WMT3");
  header.writeUInt16LE(3, 4);
  header.writeUInt32LE(turnCount, 8);
  header.writeUInt32LE(1, 12);
  return Buffer.concat([header, ...frames]);
}

function makeFrame(payload, turnCount, codec) {
  const stored = codec === 1 ? gzipSync(payload) : payload;
  const header = Buffer.alloc(headerSize);
  header.writeUInt32LE(stored.length, 0);
  header.writeUInt32LE(payload.length, 4);
  header.writeUInt32LE(turnCount, 8);
  header.writeUInt32LE(codec, 12);
  return Buffer.concat([header, stored]);
}

function sessionFilePath(wheelmakerHome, projectName, sessionId) {
  return join(
    wheelmakerHome,
    "db",
    "session",
    safeHistoryPathPart(projectName),
    safeHistoryPathPart(sessionId),
    "session.wmt3",
  );
}

function safeHistoryPathPart(value) {
  return value.replace(/[\\/:*?"<>|]/g, "_");
}
