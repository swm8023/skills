#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

const turnsPerFile = 256;
const preambleSize = 8;
const slotSize = 8;
const headerSize = preambleSize + turnsPerFile * slotSize;
const sessionStatusNames = {
  0: "active",
  1: "suspended",
  2: "persisted",
};
const requiredSessionColumns = [
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

function main() {
  let db;
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      process.stdout.write(helpText());
      return;
    }
    if (options.output && existsSync(options.output) && !options.force) {
      throw new ExportError(
        `output file already exists: ${options.output}; use --force to overwrite`,
        2,
      );
    }

    const databasePath = join(options.wheelmakerHome, "db", "client.sqlite3");
    db = openDatabase(databasePath);
    validateSessionsSchema(db, databasePath);
    const target = loadSessionByID(db, options.sessionId);
    if (!target) {
      throw new ExportError(`Session not found in active storage: ${options.sessionId}`, 2);
    }

    const projectRows = listProjectSessions(db, target.project_name);
    const targetSync = parseRequiredJSON(target.session_sync_json, "session_sync_json");
    const rootID = resolveRootID(target, targetSync, projectRows);
    const errors = [];
    const members = collectMembers(rootID, projectRows, errors, databasePath);
    if (!members.some((row) => row.id === target.id)) {
      throw new ExportError(`Session relationship is not a valid active member: ${target.id}`, 2);
    }

    const sessions = members.map((record) => exportSessionRecord(
      record,
      options.wheelmakerHome,
      errors,
      databasePath,
    ));
    const outputPath = options.output || defaultOutputPath(rootID);
    const bundle = buildBundle({
      options,
      databasePath,
      rootID,
      sessions,
      errors,
    });
    writeBundle(outputPath, bundle, options.force);

    const stats = bundle.stats;
    process.stdout.write(
      `Wrote ${stats.sessionCount} sessions and ${stats.turnCount} turns to ${outputPath}\n`,
    );
    if (errors.length > 0) {
      process.stdout.write(`Export completed with ${errors.length} error(s).\n`);
      process.exitCode = 1;
    }
  } catch (error) {
    process.stderr.write(`export-session: ${error.message}\n`);
    process.exitCode = error instanceof ExportError ? error.exitCode : 2;
  } finally {
    db?.close();
  }
}

class ExportError extends Error {
  constructor(message, exitCode = 2) {
    super(message);
    this.name = "ExportError";
    this.exitCode = exitCode;
  }
}

function parseArgs(args) {
  let sessionId = "";
  let wheelmakerHome = join(homedir(), ".wheelmaker");
  let output = "";
  let force = false;
  let help = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--wheelmaker-home") {
      wheelmakerHome = requireOptionValue(args, ++index, arg);
    } else if (arg === "--output") {
      output = requireOptionValue(args, ++index, arg);
    } else if (arg === "--force") {
      force = true;
    } else if (arg === "--help" || arg === "-h") {
      help = true;
    } else if (arg.startsWith("-")) {
      throw new ExportError(`unknown option: ${arg}`, 2);
    } else if (sessionId) {
      throw new ExportError(`unexpected argument: ${arg}`, 2);
    } else {
      sessionId = arg;
    }
  }

  if (help) {
    return { help: true };
  }
  if (!sessionId) {
    throw new ExportError("session ID is required", 2);
  }
  return {
    sessionId,
    wheelmakerHome: resolve(wheelmakerHome),
    output: output ? resolve(output) : "",
    force,
    help: false,
  };
}

function requireOptionValue(args, index, option) {
  const value = args[index];
  if (!value || value.startsWith("-")) {
    throw new ExportError(`${option} requires a value`, 2);
  }
  return value;
}

function helpText() {
  return [
    "Usage: node export-session.mjs <session-id> [options]",
    "",
    "Options:",
    "  --wheelmaker-home <path>  Override ~/.wheelmaker",
    "  --output <path>           Write JSON to a file",
    "  --force                   Overwrite an existing output file",
    "  -h, --help                Show this help",
    "",
  ].join("\n");
}

function openDatabase(databasePath) {
  if (!existsSync(databasePath)) {
    throw new ExportError(`WheelMaker database not found: ${databasePath}`, 2);
  }
  try {
    return new DatabaseSync(databasePath, { readOnly: true });
  } catch (error) {
    throw new ExportError(`cannot open WheelMaker database ${databasePath}: ${error.message}`, 2);
  }
}

function validateSessionsSchema(db, databasePath) {
  let columns;
  try {
    columns = db.prepare("PRAGMA table_info(sessions)").all();
  } catch (error) {
    throw new ExportError(`cannot inspect WheelMaker database ${databasePath}: ${error.message}`, 2);
  }
  const actual = new Set(columns.map((column) => column.name));
  const missing = requiredSessionColumns.filter((column) => !actual.has(column));
  if (missing.length > 0) {
    throw new ExportError(
      `unsupported WheelMaker sessions schema; missing: ${missing.join(", ")}`,
      2,
    );
  }
}

function loadSessionByID(db, sessionId) {
  return db.prepare(`
    SELECT id, project_name, status, agent_type, agent_json,
           session_sync_json, title, created_at, updated_at
    FROM sessions
    WHERE id = ?
    LIMIT 1
  `).get(sessionId);
}

function listProjectSessions(db, projectName) {
  return db.prepare(`
    SELECT id, project_name, status, agent_type, agent_json,
           session_sync_json, title, created_at, updated_at
    FROM sessions
    WHERE project_name = ?
  `).all(projectName);
}

function resolveRootID(target, targetSync, projectRows) {
  const declaredRootID = typeof targetSync.rootSessionId === "string"
    ? targetSync.rootSessionId.trim()
    : "";
  const isSubagent = targetSync.sessionKind === "subagent"
    || Boolean(targetSync.parentSessionId)
    || Boolean(declaredRootID && declaredRootID !== target.id);
  if (isSubagent && !declaredRootID) {
    throw new ExportError(`subagent session has no rootSessionId: ${target.id}`, 2);
  }
  const rootID = declaredRootID || target.id;
  const root = projectRows.find((row) => row.id === rootID);
  if (!root) {
    throw new ExportError(
      `root session not found in active project: ${rootID}`,
      2,
    );
  }
  const rootSync = parseRequiredJSON(root.session_sync_json, "session_sync_json");
  const rootIsSubagent = rootSync.sessionKind === "subagent"
    || Boolean(rootSync.parentSessionId);
  const rootDeclaredRootID = typeof rootSync.rootSessionId === "string"
    ? rootSync.rootSessionId.trim()
    : "";
  if (rootIsSubagent || (rootDeclaredRootID && rootDeclaredRootID !== rootID)) {
    throw new ExportError(`root session is not a valid root: ${rootID}`, 2);
  }
  if (isSubagent && targetSync.sessionKind !== "subagent") {
    throw new ExportError(`invalid subagent relationship: ${target.id}`, 2);
  }
  return rootID;
}

function collectMembers(rootID, projectRows, errors, databasePath) {
  const root = projectRows.find((row) => row.id === rootID);
  const children = [];
  for (const row of projectRows) {
    if (row.id === rootID) continue;
    let sync;
    try {
      sync = parseRequiredJSON(row.session_sync_json, "session_sync_json");
    } catch (error) {
      addError(errors, {
        code: "invalid_member_session_sync",
        scope: "member_relation",
        sessionId: row.id,
        path: databasePath,
        message: error.message,
      });
      continue;
    }

    const rowRootID = typeof sync.rootSessionId === "string"
      ? sync.rootSessionId.trim()
      : "";
    if (sync.sessionKind === "subagent" && rowRootID === rootID) {
      children.push({ row, sync });
    } else if (sync.sessionKind === "subagent" && !rowRootID) {
      addError(errors, {
        code: "invalid_member_relation",
        scope: "member_relation",
        sessionId: row.id,
        path: databasePath,
        message: "subagent session has no rootSessionId",
      });
    } else if (rowRootID === rootID) {
      addError(errors, {
        code: "invalid_member_relation",
        scope: "member_relation",
        sessionId: row.id,
        path: databasePath,
        message: "session claims this root without sessionKind=subagent",
      });
    }
  }
  children.sort((left, right) => {
    const leftSequence = safeInteger(left.sync.spawnSequence, 0);
    const rightSequence = safeInteger(right.sync.spawnSequence, 0);
    if (leftSequence !== rightSequence) return leftSequence - rightSequence;
    return left.row.id.localeCompare(right.row.id);
  });
  return [root, ...children.map((child) => child.row)];
}

function exportSessionRecord(record, wheelmakerHome, errors, databasePath) {
  const raw = {
    id: record.id,
    project_name: record.project_name,
    status: record.status,
    agent_type: record.agent_type,
    agent_json: record.agent_json,
    session_sync_json: record.session_sync_json,
    title: record.title,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
  const agent = parseOptionalJSON(record.agent_json, "agent_json", record.id, errors, databasePath);
  const sessionSync = parseOptionalJSON(
    record.session_sync_json,
    "session_sync_json",
    record.id,
    errors,
    databasePath,
  );
  const title = parseJSONOrText(record.title);
  const state = buildState(record, sessionSync);
  const turns = [];
  const latestPersistedTurnIndex = sessionSync && typeof sessionSync === "object"
    && Object.prototype.hasOwnProperty.call(sessionSync, "latestPersistedTurnIndex")
    ? sessionSync.latestPersistedTurnIndex
    : 0;

  if (!Number.isSafeInteger(latestPersistedTurnIndex) || latestPersistedTurnIndex < 0) {
    addError(errors, {
      code: "invalid_latest_persisted_turn_index",
      scope: "session",
      sessionId: record.id,
      path: turnDirectoryPath(wheelmakerHome, record.project_name, record.id),
      message: `invalid latestPersistedTurnIndex: ${latestPersistedTurnIndex}`,
    });
  } else {
    readTurns(
      wheelmakerHome,
      record.project_name,
      record.id,
      latestPersistedTurnIndex,
      turns,
      errors,
    );
  }

  return {
    id: record.id,
    projectName: record.project_name,
    status: record.status,
    agentType: record.agent_type,
    title,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    raw,
    agent,
    sessionSync,
    state,
    turns,
    artifactRefs: collectArtifactRefs(
      turns,
      wheelmakerHome,
      record.project_name,
      record.id,
    ),
  };
}

function buildState(record, sessionSync) {
  const sync = sessionSync && typeof sessionSync === "object" ? sessionSync : {};
  const sessionKind = sync.sessionKind === "subagent" ? "subagent" : "root";
  return {
    lifecycleStatus: {
      code: record.status,
      name: sessionStatusNames[record.status] || "unknown",
    },
    sessionKind,
    parentSessionId: sync.parentSessionId || null,
    rootSessionId: sync.rootSessionId || (sessionKind === "root" ? record.id : null),
    readOnly: Boolean(sync.readOnly),
    subagentStatus: sync.subagentStatus || null,
    spawnSequence: safeIntegerOrNull(sync.spawnSequence),
    latestPersistedTurnIndex: safeIntegerOrNull(sync.latestPersistedTurnIndex),
    lastDoneTurnIndex: safeIntegerOrNull(sync.lastDoneTurnIndex),
    lastDoneSuccess: typeof sync.lastDoneSuccess === "boolean" ? sync.lastDoneSuccess : null,
    lastReadTurnIndex: safeIntegerOrNull(sync.lastReadTurnIndex),
    providerReplay: sync.providerReplay || null,
  };
}

function readTurns(wheelmakerHome, projectName, sessionId, expectedTurnCount, turns, errors) {
  if (expectedTurnCount === 0) return;
  const lastFileNo = Math.floor((expectedTurnCount - 1) / turnsPerFile);
  for (let fileNo = 0; fileNo <= lastFileNo; fileNo += 1) {
    const path = turnFilePath(wheelmakerHome, projectName, sessionId, fileNo);
    const firstTurnIndex = fileNo * turnsPerFile + 1;
    const slotsInFile = Math.min(
      turnsPerFile,
      expectedTurnCount - fileNo * turnsPerFile,
    );
    let raw;
    let fileErrorIndex = null;
    try {
      raw = readFileSync(path);
      validateHeader(raw, path);
    } catch (error) {
      fileErrorIndex = addError(errors, {
        code: error.code || "invalid_turn_file",
        scope: "turn_file",
        sessionId,
        path,
        turnIndex: firstTurnIndex,
        message: error.message,
      });
    }

    for (let slot = 0; slot < slotsInFile; slot += 1) {
      const turnIndex = firstTurnIndex + slot;
      if (fileErrorIndex !== null) {
        turns.push({
          turnIndex,
          finished: true,
          content: null,
          errorRef: fileErrorIndex,
        });
        continue;
      }
      const metadataOffset = preambleSize + slot * slotSize;
      const bodyOffset = raw.readUInt32LE(metadataOffset);
      const bodyLength = raw.readUInt32LE(metadataOffset + 4);
      if (bodyOffset === 0 || bodyLength === 0) {
        const errorIndex = addError(errors, {
          code: "missing_turn_slot",
          scope: "turn",
          sessionId,
          turnIndex,
          path,
          message: `missing WMT2 turn ${turnIndex}`,
        });
        turns.push({ turnIndex, finished: true, content: null, errorRef: errorIndex });
        continue;
      }
      const bodyEnd = bodyOffset + bodyLength;
      if (bodyOffset < headerSize || bodyEnd > raw.length) {
        const errorIndex = addError(errors, {
          code: "turn_out_of_bounds",
          scope: "turn",
          sessionId,
          turnIndex,
          path,
          message: `WMT2 turn ${turnIndex} points outside ${path}`,
        });
        turns.push({ turnIndex, finished: true, content: null, errorRef: errorIndex });
        continue;
      }
      const contentRaw = raw.toString("utf8", bodyOffset, bodyEnd);
      try {
        turns.push({
          turnIndex,
          finished: true,
          content: JSON.parse(contentRaw),
        });
      } catch (error) {
        const errorIndex = addError(errors, {
          code: "invalid_turn_json",
          scope: "turn",
          sessionId,
          turnIndex,
          path,
          message: `invalid JSON in WMT2 turn ${turnIndex}: ${error.message}`,
        });
        turns.push({ turnIndex, finished: true, content: null, errorRef: errorIndex });
      }
    }
  }
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

function collectArtifactRefs(turns, wheelmakerHome, projectName, sessionId) {
  const refs = new Map();
  for (const turn of turns) {
    const artifacts = turn.content?.param?.artifacts;
    if (!Array.isArray(artifacts)) continue;
    for (const artifact of artifacts) {
      if (!artifact || typeof artifact !== "object") continue;
      const artifactID = typeof artifact.artifactId === "string" ? artifact.artifactId : "";
      const key = artifactID || JSON.stringify(artifact);
      if (refs.has(key)) continue;
      const ref = {};
      for (const field of ["artifactId", "type", "format", "fileCount", "files"]) {
        if (Object.prototype.hasOwnProperty.call(artifact, field)) {
          ref[field] = artifact[field];
        }
      }
      if (artifactID && validArtifactID(artifactID)) {
        ref.expectedPath = artifactPath(wheelmakerHome, projectName, sessionId, artifactID);
      }
      refs.set(key, ref);
    }
  }
  return [...refs.values()];
}

function buildBundle({ options, databasePath, rootID, sessions, errors }) {
  const turnCount = sessions.reduce((sum, session) => sum + session.turns.length, 0);
  const artifactRefCount = sessions.reduce((sum, session) => sum + session.artifactRefs.length, 0);
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    requestedSessionId: options.sessionId,
    rootSessionId: rootID,
    source: {
      wheelmakerHome: options.wheelmakerHome,
      databasePath,
      scope: "active",
      includesArchive: false,
      includesLiveTail: false,
      redacted: false,
      containsSensitiveData: true,
    },
    sessions,
    stats: {
      sessionCount: sessions.length,
      turnCount,
      artifactRefCount,
      errorCount: errors.length,
    },
    errors,
  };
}

function writeBundle(outputPath, bundle, force) {
  mkdirSync(dirname(outputPath), { recursive: true });
  if (existsSync(outputPath) && !force) {
    throw new ExportError(
      `output file already exists: ${outputPath}; use --force to overwrite`,
      2,
    );
  }
  const temporaryPath = `${outputPath}.${process.pid}.${Date.now()}.tmp`;
  try {
    writeFileSync(temporaryPath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
    if (force && existsSync(outputPath)) unlinkSync(outputPath);
    renameSync(temporaryPath, outputPath);
  } catch (error) {
    if (existsSync(temporaryPath)) unlinkSync(temporaryPath);
    throw new ExportError(`cannot write output ${outputPath}: ${error.message}`, 2);
  }
}

function parseRequiredJSON(raw, field) {
  if (typeof raw !== "string" || raw === "") {
    throw new ExportError(`invalid JSON in sessions.${field}: empty value`, 2);
  }
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("expected a JSON object");
    }
    return value;
  } catch (error) {
    throw new ExportError(`invalid JSON in sessions.${field}: ${error.message}`, 2);
  }
}

function parseOptionalJSON(raw, field, sessionId, errors, databasePath) {
  if (typeof raw !== "string" || raw === "") return raw;
  try {
    return JSON.parse(raw);
  } catch (error) {
    addError(errors, {
      code: `invalid_${field}`,
      scope: "session",
      sessionId,
      path: databasePath,
      message: `invalid JSON in sessions.${field}: ${error.message}`,
    });
    return null;
  }
}

function parseJSONOrText(raw) {
  if (typeof raw !== "string" || raw === "") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function addError(errors, error) {
  errors.push({
    index: errors.length,
    ...error,
  });
  return errors.length - 1;
}

function safeInteger(value, fallback) {
  return Number.isSafeInteger(value) ? value : fallback;
}

function safeIntegerOrNull(value) {
  return Number.isSafeInteger(value) ? value : null;
}

function defaultOutputPath(rootID) {
  const timestamp = new Date().toISOString().replace(/[.:]/g, "-");
  return resolve(process.cwd(), `export-session-${safeFilenamePart(rootID)}-${timestamp}.json`);
}

function safeFilenamePart(value) {
  const normalized = String(value).trim() || "session";
  return normalized.replace(/[\\/:*?"<>|]/g, "_");
}

function turnDirectoryPath(wheelmakerHome, projectName, sessionId) {
  return join(
    wheelmakerHome,
    "db",
    "session",
    safeHistoryPathPart(projectName),
    safeHistoryPathPart(sessionId),
    "turns",
  );
}

function turnFilePath(wheelmakerHome, projectName, sessionId, fileNo) {
  return join(
    turnDirectoryPath(wheelmakerHome, projectName, sessionId),
    `t${String(fileNo).padStart(6, "0")}.bin`,
  );
}

function artifactPath(wheelmakerHome, projectName, sessionId, artifactID) {
  return join(
    wheelmakerHome,
    "db",
    "session",
    safeHistoryPathPart(projectName),
    safeHistoryPathPart(sessionId),
    "artifacts",
    `${artifactID}.diff`,
  );
}

function validArtifactID(value) {
  return value !== "" && /^[A-Za-z0-9._-]+$/.test(value);
}

function safeHistoryPathPart(value) {
  const normalized = String(value).trim();
  return (normalized || "_").replace(/[\\/:*?"<>|]/g, "_");
}

main();
