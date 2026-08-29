#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const turnsPerFile = 256;
const preambleSize = 8;
const slotSize = 8;
const headerSize = preambleSize + turnsPerFile * slotSize;

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
  const turnDirectory = join(
    wheelmakerHome,
    "db",
    "session",
    safeHistoryPathPart(projectName),
    safeHistoryPathPart(sessionId),
    "turns",
  );
  if (expectedTurnCount === 0) {
    return [];
  }

  const turns = [];
  const lastFileNo = Math.floor((expectedTurnCount - 1) / turnsPerFile);
  for (let fileNo = 0; fileNo <= lastFileNo; fileNo += 1) {
    const path = join(turnDirectory, `t${String(fileNo).padStart(6, "0")}.bin`);
    if (!existsSync(path)) {
      throw new Error(`missing WMT2 turn file: ${path}`);
    }
    const raw = readFileSync(path);
    validateHeader(raw, path);
    const slotsInFile = Math.min(
      turnsPerFile,
      expectedTurnCount - fileNo * turnsPerFile,
    );
    for (let slot = 0; slot < slotsInFile; slot += 1) {
      const turnIndex = fileNo * turnsPerFile + slot + 1;
      const metadataOffset = preambleSize + slot * slotSize;
      const bodyOffset = raw.readUInt32LE(metadataOffset);
      const bodyLength = raw.readUInt32LE(metadataOffset + 4);
      if (bodyOffset === 0 || bodyLength === 0) {
        throw new Error(`missing WMT2 turn ${turnIndex} in ${path}`);
      }
      const bodyEnd = bodyOffset + bodyLength;
      if (bodyOffset < headerSize || bodyEnd > raw.length) {
        throw new Error(`WMT2 turn ${turnIndex} points outside ${path}`);
      }
      const contentRaw = raw.toString("utf8", bodyOffset, bodyEnd);
      let content;
      try {
        content = JSON.parse(contentRaw);
      } catch (error) {
        throw new Error(`invalid JSON in WMT2 turn ${turnIndex}: ${error.message}`);
      }
      turns.push({ turnIndex, ...content });
    }
  }
  return turns;
}

function validateHeader(raw, path) {
  if (raw.length < headerSize) {
    throw new Error(`WMT2 header too short: ${path}`);
  }
  if (raw.toString("ascii", 0, 4) !== "WMT2") {
    throw new Error(`invalid WMT2 magic: ${path}`);
  }
  const version = raw.readUInt16LE(4);
  if (version !== 2) {
    throw new Error(`unsupported WMT2 version ${version}: ${path}`);
  }
  if (raw[6] !== 0 || raw[7] !== 0) {
    throw new Error(`unsupported WMT2 header flags: ${path}`);
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
