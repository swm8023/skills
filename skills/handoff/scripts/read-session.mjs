#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { gunzipSync } from "node:zlib";

const headerSize = 16;
const frameHeaderSize = 16;

main();

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const session = readSessionMetadata(options.wheelmakerHome, options.sessionId);
    const expectedTurnCount = latestPersistedTurnIndex(session.sessionSync);
    const turns = readAllTurns(
      options.wheelmakerHome,
      session.projectName,
      session.id,
      expectedTurnCount,
    );
    const transcript = renderTranscript(session, turns);

    if (options.output) {
      mkdirSync(dirname(options.output), { recursive: true });
      writeFileSync(options.output, transcript, "utf8");
      process.stdout.write(`Wrote ${turns.length} turns to ${options.output}\n`);
      return;
    }
    process.stdout.write(transcript);
  } catch (error) {
    process.stderr.write(`handoff: ${error.message}\n`);
    process.exitCode = 1;
  }
}

function parseArgs(args) {
  let sessionId = "";
  let wheelmakerHome = join(homedir(), ".wheelmaker");
  let output = "";

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--wheelmaker-home") {
      wheelmakerHome = requireOptionValue(args, ++index, arg);
    } else if (arg === "--output") {
      output = requireOptionValue(args, ++index, arg);
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write([
        "Usage: node read-session.mjs <session-id> [options]",
        "",
        "Reads persisted WMT3 sessions only; WMT2 and archives are not supported.",
        "",
        "Options:",
        "  --wheelmaker-home <path>  Override ~/.wheelmaker",
        "  --output <path>           Write Markdown to a file",
        "  -h, --help                Show this help",
        "",
      ].join("\n"));
      process.exit(0);
    } else if (arg.startsWith("-")) {
      throw new Error(`unknown option: ${arg}`);
    } else if (sessionId) {
      throw new Error(`unexpected argument: ${arg}`);
    } else {
      sessionId = arg;
    }
  }

  if (!sessionId) {
    throw new Error("session ID is required");
  }
  return {
    sessionId,
    wheelmakerHome: resolve(wheelmakerHome),
    output: output ? resolve(output) : "",
  };
}

function requireOptionValue(args, index, option) {
  const value = args[index];
  if (!value || value.startsWith("-")) {
    throw new Error(`${option} requires a value`);
  }
  return value;
}

function readSessionMetadata(wheelmakerHome, sessionId) {
  const dbPath = join(wheelmakerHome, "db", "client.sqlite3");
  if (!existsSync(dbPath)) {
    throw new Error(`WheelMaker database not found: ${dbPath}`);
  }

  let db;
  try {
    db = new DatabaseSync(dbPath, { readOnly: true });
    const columns = db.prepare("PRAGMA table_info(sessions)").all();
    const required = [
      "id",
      "project_name",
      "status",
      "agent_type",
      "agent_json",
      "session_sync_json",
      "title",
      "created_at",
      "updated_at",
    ];
    const actual = new Set(columns.map((column) => column.name));
    const missing = required.filter((column) => !actual.has(column));
    if (missing.length > 0) {
      throw new Error(`unsupported WheelMaker sessions schema; missing: ${missing.join(", ")}`);
    }

    const row = db.prepare(`
      SELECT id, project_name, status, agent_type, agent_json,
             session_sync_json, title, created_at, updated_at
      FROM sessions
      WHERE id = ?
      LIMIT 1
    `).get(sessionId);
    if (!row) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    return {
      id: row.id,
      projectName: row.project_name,
      status: row.status,
      agentType: row.agent_type,
      title: parseJSONOrText(row.title),
      agent: parseStoredJSON(row.agent_json, "agent_json"),
      sessionSync: parseStoredJSON(row.session_sync_json, "session_sync_json"),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      databasePath: dbPath,
    };
  } catch (error) {
    if (error.message.startsWith("Session not found:") ||
        error.message.startsWith("unsupported WheelMaker") ||
        error.message.startsWith("invalid JSON")) {
      throw error;
    }
    throw new Error(`cannot read WheelMaker database ${dbPath}: ${error.message}`);
  } finally {
    db?.close();
  }
}

function parseStoredJSON(raw, field) {
  if (typeof raw !== "string" || raw === "") {
    return raw;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`invalid JSON in sessions.${field}: ${error.message}`);
  }
}

function parseJSONOrText(raw) {
  if (typeof raw !== "string" || raw === "") {
    return raw;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function latestPersistedTurnIndex(sessionSync) {
  const value = sessionSync?.latestPersistedTurnIndex ?? 0;
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`invalid latestPersistedTurnIndex: ${value}`);
  }
  return value;
}

function readAllTurns(wheelmakerHome, projectName, sessionId, expectedTurnCount) {
  const path = join(
    wheelmakerHome,
    "db",
    "session",
    safeHistoryPathPart(projectName),
    safeHistoryPathPart(sessionId),
    "session.wmt3",
  );
  if (expectedTurnCount === 0) {
    return [];
  }

  if (!existsSync(path)) {
    throw new Error(`missing WMT3 session file: ${path}; WMT2 is not supported`);
  }
  const raw = readFileSync(path);
  validateHeader(raw, path);
  const totalTurnCount = raw.readUInt32LE(8);
  if (expectedTurnCount > totalTurnCount) {
    throw new Error(`persisted turn index ${expectedTurnCount} exceeds WMT3 turn count ${totalTurnCount}: ${path}`);
  }

  const turns = [];
  let offset = headerSize;
  let storedTurnCount = 0;
  while (offset < raw.length) {
    if (raw.length - offset < frameHeaderSize) {
      throw new Error(`WMT3 frame header too short at offset ${offset}: ${path}`);
    }
    const storedLength = raw.readUInt32LE(offset);
    const uncompressedLength = raw.readUInt32LE(offset + 4);
    const turnCount = raw.readUInt32LE(offset + 8);
    const codec = raw.readUInt32LE(offset + 12);
    if (storedLength === 0 || uncompressedLength === 0 || turnCount === 0) {
      throw new Error(`invalid WMT3 frame header at offset ${offset}: ${path}`);
    }
    if (codec !== 0 && codec !== 1) {
      throw new Error(`unsupported WMT3 frame codec ${codec} at offset ${offset}: ${path}`);
    }
    const end = offset + frameHeaderSize + storedLength;
    if (end > raw.length) {
      throw new Error(`WMT3 frame at offset ${offset} exceeds file: ${path}`);
    }

    // Decode only frames intersecting the SQLite snapshot, like the Hub reader.
    if (storedTurnCount < expectedTurnCount) {
      const payload = raw.subarray(offset + frameHeaderSize, end);
      const contents = decodeFrame(payload, codec, uncompressedLength, turnCount, offset);
      const included = Math.min(contents.length, expectedTurnCount - storedTurnCount);
      for (let index = 0; index < included; index += 1) {
        const turnIndex = storedTurnCount + index + 1;
        const content = contents[index];
        if (!content || typeof content !== "object" || Array.isArray(content)) {
          throw new Error(`invalid WMT3 turn ${turnIndex}: expected a SessionContent object`);
        }
        turns.push({ ...content, turnIndex });
      }
    }
    storedTurnCount += turnCount;
    offset = end;
  }
  if (storedTurnCount !== totalTurnCount) {
    throw new Error(`WMT3 header turn count ${totalTurnCount} differs from frame count ${storedTurnCount}: ${path}`);
  }
  return turns;
}

function decodeFrame(payload, codec, uncompressedLength, turnCount, offset) {
  let decoded = payload;
  if (codec === 1) {
    try {
      decoded = gunzipSync(payload, { maxOutputLength: uncompressedLength });
    } catch (error) {
      throw new Error(`cannot decompress WMT3 frame at offset ${offset}: ${error.message}`);
    }
  }
  if (decoded.length !== uncompressedLength) {
    throw new Error(`WMT3 uncompressed length ${decoded.length}, expected ${uncompressedLength} at offset ${offset}`);
  }
  let contents;
  try {
    contents = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(decoded));
  } catch (error) {
    throw new Error(`invalid JSON in WMT3 frame at offset ${offset}: ${error.message}`);
  }
  if (!Array.isArray(contents)) {
    throw new Error(`WMT3 frame payload must be an array at offset ${offset}`);
  }
  if (contents.length !== turnCount) {
    throw new Error(`WMT3 payload turn count ${contents.length}, expected ${turnCount} at offset ${offset}`);
  }
  return contents;
}

function validateHeader(raw, path) {
  if (raw.length < headerSize) {
    throw new Error(`WMT3 header too short: ${path}`);
  }
  if (!raw.subarray(0, 4).equals(Buffer.from("WMT3"))) {
    throw new Error(`invalid WMT3 magic: ${path}; WMT2 is not supported`);
  }
  const version = raw[4];
  if (version !== 3) {
    throw new Error(`unsupported WMT3 version ${version}: ${path}`);
  }
  if (raw[5] !== 0 || raw[6] !== 0 || raw[7] !== 0) {
    throw new Error(`non-zero WMT3 header reserved bytes: ${path}`);
  }
  const codec = raw.readUInt32LE(12);
  if (codec !== 0 && codec !== 1) {
    throw new Error(`unsupported WMT3 file codec ${codec}: ${path}`);
  }
}

function safeHistoryPathPart(value) {
  const normalized = String(value).trim();
  return (normalized || "_").replace(/[\\/:*?"<>|]/g, "_");
}

function renderTranscript(session, turns) {
  const lines = [
    "# WheelMaker Session Transcript",
    "",
    `- Session ID: \`${session.id}\``,
    `- Project: \`${session.projectName}\``,
    `- Agent type: \`${session.agentType}\``,
    `- Status: ${session.status}`,
    `- Created at: \`${session.createdAt}\``,
    `- Updated at: \`${session.updatedAt}\``,
    `- Stored turns: ${turns.length}`,
    `- Database: \`${session.databasePath}\``,
    "",
    "## Session metadata",
    "",
    "```json",
    JSON.stringify({
      title: session.title,
      agent: session.agent,
      sessionSync: session.sessionSync,
    }, null, 2),
    "```",
    "",
    "## Turns",
    "",
  ];

  for (const turn of turns) {
    const method = typeof turn.method === "string" ? turn.method : "unknown";
    lines.push(
      `### Turn ${turn.turnIndex} — \`${method}\``,
      "",
      "```json",
      JSON.stringify(turn, null, 2),
      "```",
      "",
    );
  }
  return `${lines.join("\n")}\n`;
}
