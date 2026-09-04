#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { copyFile, mkdir, open, readdir, readFile, rename, rm, stat, writeFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

import { ensureWikiState, resolveWikiPaths } from './wiki-state.mjs';
import { parseYamlDocument } from './yaml.mjs';

let DatabaseSync;
try {
  ({ DatabaseSync } = await import('node:sqlite'));
} catch {
  DatabaseSync = null;
}

export const PARSER_VERSION = 'pubwiki-search-parser-1';
export const INDEX_VERSION = 'pubwiki-search-index-1';
export const MODEL_VERSION = 'lexical-only-1';

function normalizePath(value) {
  return String(value || '').replace(/\\/gu, '/').replace(/^\.\//u, '');
}

async function exists(filename) {
  try { await stat(filename); return true; } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

async function optionalRead(filename) {
  try { return await readFile(filename, 'utf8'); } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function parseNote(source, filename) {
  const normalized = String(source || '').replace(/^\uFEFF/u, '').replace(/\r\n/gu, '\n');
  let metadata = {};
  let body = normalized;
  if (normalized.startsWith('---\n')) {
    const boundary = normalized.indexOf('\n---\n', 4);
    if (boundary < 0) throw new Error(`${filename}: unterminated YAML frontmatter`);
    metadata = parseYamlDocument(normalized.slice(4, boundary), `${filename} frontmatter`) ?? {};
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) throw new Error(`${filename}: frontmatter must be a YAML mapping`);
    body = normalized.slice(boundary + '\n---\n'.length).replace(/^\n/u, '');
  }
  const heading = body.match(/^#{1,6}\s+(.+?)\s*#*$/mu);
  const title = typeof metadata.title === 'string' && metadata.title.trim()
    ? metadata.title.trim()
    : (heading?.[1]?.replace(/[\*_`~]/gu, '').trim() || path.posix.basename(filename, path.posix.extname(filename)));
  const description = typeof metadata.description === 'string' ? metadata.description.trim() : '';
  const tags = [];
  const addTag = (value) => {
    if (typeof value !== 'string') return;
    const tag = value.trim().replace(/^#+/u, '').replace(/\\/gu, '/').replace(/\s+/gu, '-');
    if (tag && !tags.includes(tag)) tags.push(tag);
  };
  const frontmatterTags = Array.isArray(metadata.tags) ? metadata.tags : (typeof metadata.tags === 'string' ? [metadata.tags] : []);
  for (const tag of frontmatterTags) addTag(tag);
  const textWithoutCode = body.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1\s*$/gmu, '');
  for (const match of textWithoutCode.matchAll(/(?:^|\s)#([^\s#.,;!?()[\]{}<>]+)/gmu)) addTag(match[1]);
  return { metadata, body, title, description, tags, draft: metadata.draft === true };
}

async function scanMarkdown(paths) {
  const result = [];
  async function visit(directory, relativeDirectory = '') {
    let entries;
    try { entries = await readdir(directory, { withFileTypes: true }); } catch (error) {
      if (error?.code === 'ENOENT') return;
      throw error;
    }
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const filename = path.join(directory, entry.name);
      const relative = normalizePath(path.posix.join(relativeDirectory, entry.name));
      if (entry.isDirectory()) {
        if (entry.name === '.git' || entry.name === '.obsidian' || (!relativeDirectory && entry.name === 'assets')) continue;
        await visit(filename, relative);
        continue;
      }
      const info = await lstat(filename);
      if (info.isSymbolicLink() || !info.isFile() || !entry.name.toLowerCase().endsWith('.md')) continue;
      const source = await readFile(filename, 'utf8');
      const relativePath = normalizePath(path.posix.join('content', relative));
      const note = parseNote(source, relativePath);
      result.push({
        relativePath,
        size: info.size,
        modified: info.mtimeMs,
        contentDigest: createHash('sha256').update(source).digest('hex'),
        filename: entry.name,
        folder: path.posix.dirname(relative),
        title: note.title,
        description: note.description,
        date: typeof note.metadata.date === 'string' ? note.metadata.date : '',
        draft: note.draft,
        tags: note.tags,
        frontmatter: note.metadata,
        body: note.body,
      });
    }
  }
  await visit(paths.content);
  return result;
}

function manifestFile(candidate) {
  return {
    relativePath: candidate.relativePath,
    size: candidate.size,
    modified: candidate.modified,
    contentDigest: candidate.contentDigest,
  };
}

function sameManifestFile(left, right) {
  return Boolean(left && right
    && left.relativePath === right.relativePath
    && left.size === right.size
    && left.modified === right.modified
    && left.contentDigest === right.contentDigest);
}

async function atomicReplace(filename, contents) {
  await mkdir(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`;
  await writeFile(temporary, contents, 'utf8');
  if (process.platform !== 'win32') {
    await rename(temporary, filename);
    return;
  }
  const backup = `${filename}.bak-${process.pid}-${Math.random().toString(16).slice(2)}`;
  let moved = false;
  try {
    if (await exists(filename)) {
      await rename(filename, backup);
      moved = true;
    }
    await rename(temporary, filename);
    if (moved) await rm(backup, { force: true });
  } catch (error) {
    await rm(temporary, { force: true });
    if (moved && !(await exists(filename))) {
      try { await rename(backup, filename); } catch { /* retain the original error */ }
    }
    throw error;
  }
}

async function restoreFile(filename, previous) {
  if (previous === null) {
    await rm(filename, { force: true });
  } else {
    await atomicReplace(filename, previous);
  }
}

async function acquireLock(filename) {
  await mkdir(path.dirname(filename), { recursive: true });
  for (let attempt = 0; attempt < 400; attempt += 1) {
    try {
      const handle = await open(filename, 'wx');
      await handle.writeFile(JSON.stringify({ pid: process.pid, created: Date.now() }));
      return async () => {
        await handle.close();
        await rm(filename, { force: true });
      };
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      try {
        const info = await stat(filename);
        if (Date.now() - info.mtimeMs > 10 * 60 * 1000) await rm(filename, { force: true });
      } catch (inspectError) {
        if (inspectError?.code !== 'ENOENT') throw inspectError;
      }
      await delay(25);
    }
  }
  throw new Error(`Timed out waiting for the local knowledge index lock: ${filename}`);
}

const SQLITE_BASE_COLUMNS = new Set([
  'path', 'folder', 'filename', 'title', 'description', 'date', 'draft',
  'tags', 'frontmatter', 'body', 'size', 'modified', 'content_digest',
]);

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/gu, '""')}"`;
}

function jsonPath(value) {
  return `$."${String(value).replace(/"/gu, '""')}"`;
}

function quoteSqlString(value) {
  return String(value).replace(/'/gu, "''");
}

function sqliteObjectType(db, name) {
  return db.prepare('SELECT type FROM sqlite_master WHERE name = ?').get(name)?.type || null;
}

function frontmatterKeys(db) {
  const keys = new Set();
  for (const row of db.prepare('SELECT frontmatter FROM notes_base').all()) {
    try {
      const metadata = JSON.parse(row.frontmatter || '{}');
      if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
        for (const key of Object.keys(metadata)) if (!SQLITE_BASE_COLUMNS.has(key)) keys.add(key);
      }
    } catch { /* an indexed row will still remain searchable through its base fields */ }
  }
  return [...keys].sort((left, right) => left.localeCompare(right));
}

function refreshNotesView(db) {
  const extra = frontmatterKeys(db)
    .map((key) => `json_extract(b.frontmatter, '${quoteSqlString(jsonPath(key))}') AS ${quoteIdentifier(key)}`)
    .join(', ');
  db.exec('DROP VIEW IF EXISTS notes');
  db.exec(`CREATE VIEW notes AS SELECT b.*${extra ? `, ${extra}` : ''} FROM notes_base AS b`);
}

function sqliteSchema(db) {
  const notesType = sqliteObjectType(db, 'notes');
  const baseType = sqliteObjectType(db, 'notes_base');
  if (notesType === 'table' && !baseType) db.exec('ALTER TABLE notes RENAME TO notes_base');
  else if (notesType === 'table' && baseType) throw new Error('SQLite index contains both legacy and current notes tables.');
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes_base (
      path TEXT PRIMARY KEY,
      folder TEXT NOT NULL,
      filename TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      draft INTEGER NOT NULL,
      tags TEXT NOT NULL,
      frontmatter TEXT NOT NULL,
      body TEXT NOT NULL,
      size INTEGER NOT NULL,
      modified REAL NOT NULL,
      content_digest TEXT NOT NULL
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
      path UNINDEXED,
      title,
      description,
      tags,
      body
    );
  `);
  refreshNotesView(db);
}

function sqliteConnection(paths) {
  if (!DatabaseSync) return null;
  const db = new DatabaseSync(paths.database);
  sqliteSchema(db);
  return db;
}

function rowValues(candidate) {
  return [
    candidate.relativePath,
    candidate.folder,
    candidate.filename,
    candidate.title,
    candidate.description,
    candidate.date,
    candidate.draft ? 1 : 0,
    JSON.stringify(candidate.tags),
    JSON.stringify(candidate.frontmatter),
    candidate.body,
    candidate.size,
    candidate.modified,
    candidate.contentDigest,
  ];
}

function upsertSqlite(db, candidate) {
  db.prepare(`
    INSERT INTO notes_base (path, folder, filename, title, description, date, draft, tags, frontmatter, body, size, modified, content_digest)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(path) DO UPDATE SET
      folder=excluded.folder, filename=excluded.filename, title=excluded.title,
      description=excluded.description, date=excluded.date, draft=excluded.draft,
      tags=excluded.tags, frontmatter=excluded.frontmatter, body=excluded.body,
      size=excluded.size, modified=excluded.modified, content_digest=excluded.content_digest
  `).run(...rowValues(candidate));
  db.prepare('DELETE FROM notes_fts WHERE path = ?').run(candidate.relativePath);
  db.prepare('INSERT INTO notes_fts (path, title, description, tags, body) VALUES (?, ?, ?, ?, ?)').run(
    candidate.relativePath,
    candidate.title,
    candidate.description,
    candidate.tags.join(' '),
    candidate.body,
  );
}

function deleteSqlite(db, relativePath) {
  db.prepare('DELETE FROM notes_base WHERE path = ?').run(relativePath);
  db.prepare('DELETE FROM notes_fts WHERE path = ?').run(relativePath);
}

function rowToNote(row) {
  return {
    path: row.path,
    relativePath: row.path,
    folder: row.folder,
    filename: row.filename,
    title: row.title,
    description: row.description,
    date: row.date,
    draft: Boolean(row.draft),
    tags: JSON.parse(row.tags || '[]'),
    frontmatter: JSON.parse(row.frontmatter || '{}'),
    body: row.body,
    size: row.size,
    modified: row.modified,
    contentDigest: row.content_digest,
  };
}

async function updateSqlite(paths, candidates, previous, nextManifest, changedPaths, rebuild, replaceManifest = atomicReplace) {
  const oldManifest = await optionalRead(paths.manifest);
  const db = sqliteConnection(paths);
  let committed = false;
  try {
    db.exec('BEGIN IMMEDIATE');
    if (rebuild) {
      db.exec('DELETE FROM notes_base');
      db.exec('DELETE FROM notes_fts');
    } else {
      for (const relativePath of changedPaths.deleted) deleteSqlite(db, relativePath);
    }
    for (const candidate of candidates) {
      if (rebuild || changedPaths.changed.has(candidate.relativePath)) upsertSqlite(db, candidate);
    }
    refreshNotesView(db);
    db.exec('COMMIT');
    committed = true;
    await replaceManifest(paths.manifest, `${JSON.stringify(nextManifest, null, 2)}\n`);
  } catch (error) {
    if (!committed) {
      try { db.exec('ROLLBACK'); } catch { /* preserve the original failure */ }
    }
    try { await restoreFile(paths.manifest, oldManifest); } catch { /* preserve the original failure */ }
    throw error;
  } finally {
    db.close();
  }
  return { backend: 'sqlite-fts5', previous };
}

async function readFallbackIndex(paths) {
  const raw = await optionalRead(paths.database);
  if (!raw) return { notes: {} };
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && parsed.notes ? parsed : { notes: {} };
  } catch { return { notes: {} }; }
}

async function updateFallback(paths, candidates, nextManifest, changedPaths, rebuild, replaceManifest = atomicReplace) {
  const oldDatabase = await optionalRead(paths.database);
  const oldManifest = await optionalRead(paths.manifest);
  const previous = await readFallbackIndex(paths);
  const notes = rebuild ? {} : { ...previous.notes };
  for (const relativePath of changedPaths.deleted) delete notes[relativePath];
  for (const candidate of candidates) {
    if (rebuild || changedPaths.changed.has(candidate.relativePath)) notes[candidate.relativePath] = candidate;
  }
  try {
    await replaceManifest(paths.database, `${JSON.stringify({ schema: 1, backend: 'lexical-json', notes }, null, 2)}\n`);
    await replaceManifest(paths.manifest, `${JSON.stringify(nextManifest, null, 2)}\n`);
  } catch (error) {
    try { await restoreFile(paths.database, oldDatabase); } catch { /* preserve the original failure */ }
    try { await restoreFile(paths.manifest, oldManifest); } catch { /* preserve the original failure */ }
    throw error;
  }
  return { backend: 'lexical-json' };
}

async function readManifest(paths) {
  const raw = await optionalRead(paths.manifest);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch { return null; }
}

async function databaseFormat(filename) {
  let raw;
  try { raw = await readFile(filename); } catch (error) {
    if (error?.code === 'ENOENT') return 'missing';
    throw error;
  }
  if (raw.subarray(0, 16).equals(Buffer.from('SQLite format 3\0'))) return 'sqlite';
  try {
    const parsed = JSON.parse(raw.toString('utf8'));
    if (parsed?.backend === 'lexical-json' && parsed.notes && typeof parsed.notes === 'object') return 'json';
  } catch { /* classify malformed or foreign files as incompatible */ }
  return 'unknown';
}

async function prepareDatabase(paths, backend, shouldBackup) {
  const format = await databaseFormat(paths.database);
  if (format === 'missing') return null;
  const expected = backend === 'sqlite-fts5' ? 'sqlite' : 'json';
  const backup = `${paths.database}.previous-${process.pid}-${Math.random().toString(16).slice(2)}`;
  if (format === expected && !(backend === 'sqlite-fts5' && shouldBackup)) return null;
  if (format === expected) await copyFile(paths.database, backup);
  else await rename(paths.database, backup);
  return { backup };
}

async function finishDatabaseBackup(paths, state, restore) {
  if (!state) return;
  if (restore) {
    await rm(paths.database, { force: true });
    await rename(state.backup, paths.database);
  } else {
    await rm(state.backup, { force: true });
  }
}

export async function ensureFresh({ env = process.env, gitUrl = '', parserVersion = PARSER_VERSION, indexVersion = INDEX_VERSION, modelVersion = MODEL_VERSION, atomicReplaceFn = atomicReplace } = {}) {
  const state = await ensureWikiState({ env, gitUrl });
  if (state.status !== 'ready') throw new Error(state.message || `Wiki state is not ready: ${state.status}`);
  const paths = resolveWikiPaths({ env });
  await mkdir(paths.indexDir, { recursive: true });
  const releaseLock = await acquireLock(paths.lock);
  try {
    const candidates = await scanMarkdown(paths);
    const previous = await readManifest(paths);
    const backend = DatabaseSync ? 'sqlite-fts5' : 'lexical-json';
    const currentDatabaseFormat = await databaseFormat(paths.database);
    const compatibleDatabase = currentDatabaseFormat === (backend === 'sqlite-fts5' ? 'sqlite' : 'json');
    const rebuild = !previous
      || previous.sourceRoot !== paths.data
      || previous.parserVersion !== parserVersion
      || previous.indexVersion !== indexVersion
      || previous.modelVersion !== modelVersion
      || previous.backend !== backend
      || !compatibleDatabase;
    const previousFiles = new Map((previous?.files || []).map((entry) => [entry.relativePath, entry]));
    const currentFiles = new Map(candidates.map(manifestFile).map((entry) => [entry.relativePath, entry]));
    const changed = new Set();
    for (const candidate of candidates) {
      const old = previousFiles.get(candidate.relativePath);
      if (rebuild || !sameManifestFile(old, manifestFile(candidate))) changed.add(candidate.relativePath);
    }
    const deleted = [...previousFiles.keys()].filter((relativePath) => !currentFiles.has(relativePath));
    const changedPaths = { changed, deleted };
    const nextManifest = {
      schema: 1,
      sourceRoot: paths.data,
      parserVersion,
      indexVersion,
      modelVersion,
      backend,
      files: candidates.map(manifestFile),
    };
    const databaseBackup = await prepareDatabase(paths, backend, rebuild || changed.size > 0 || deleted.length > 0);
    try {
      if (backend === 'sqlite-fts5') await updateSqlite(paths, candidates, previous, nextManifest, changedPaths, rebuild, atomicReplaceFn);
      else await updateFallback(paths, candidates, nextManifest, changedPaths, rebuild, atomicReplaceFn);
      await finishDatabaseBackup(paths, databaseBackup, false);
    } catch (error) {
      try { await finishDatabaseBackup(paths, databaseBackup, true); } catch { /* preserve the original failure */ }
      throw error;
    }
    return {
      status: 'ready',
      backend,
      paths,
      manifest: nextManifest,
      changedPaths: { changed: [...changed], deleted },
      rebuilt: rebuild,
    };
  } finally {
    await releaseLock();
  }
}

export async function readIndexRows({ env = process.env } = {}) {
  const paths = resolveWikiPaths({ env });
  if (DatabaseSync && await databaseFormat(paths.database) === 'sqlite') {
    const db = sqliteConnection(paths);
    try { return db.prepare('SELECT * FROM notes ORDER BY path').all().map(rowToNote); } finally { db.close(); }
  }
  const index = await readFallbackIndex(paths);
  return Object.values(index.notes || {}).map((note) => ({ ...note, relativePath: note.relativePath || note.path })).sort((left, right) => left.path.localeCompare(right.path));
}

export function sqliteSupported() {
  return Boolean(DatabaseSync);
}

export { atomicReplace };

function assertReadOnlyQuery(sql) {
  const normalized = String(sql || '').trim();
  if (!/^(?:SELECT|WITH)\b/iu.test(normalized) || /\b(?:INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|REPLACE|PRAGMA|VACUUM|ATTACH|DETACH)\b/iu.test(normalized)) {
    throw new Error('Dataview queries must be read-only SELECT/WITH statements.');
  }
  return normalized;
}

function frontmatterValue(row, column) {
  if (Object.prototype.hasOwnProperty.call(row, column)) return row[column];
  const metadata = row.frontmatter;
  if (!metadata || typeof metadata !== 'object') return undefined;
  if (Object.prototype.hasOwnProperty.call(metadata, column)) return metadata[column];
  return column.split('.').reduce((value, segment) => (
    value && typeof value === 'object' ? value[segment] : undefined
  ), metadata);
}

function fallbackValue(row, column) {
  const value = frontmatterValue(row, column);
  return value && typeof value === 'object' ? JSON.stringify(value) : value;
}

function fallbackQuery(sql, rows) {
  const match = sql.match(/^SELECT\s+(.+?)\s+FROM\s+notes(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+([\w]+)(?:\s+(ASC|DESC))?)?(?:\s+LIMIT\s+(\d+))?\s*$/iu);
  if (!match) throw new Error('SQLite is unavailable and this Dataview query is outside the local fallback subset.');
  const columns = match[1].trim() === '*' ? null : match[1].split(',').map((column) => column.trim());
  let selected = [...rows];
  if (match[2]) {
    const condition = match[2].trim().match(/^([\w]+)\s*(=|LIKE)\s*(?:['"]([^'"]*)['"]|(true|false|\d+))$/iu);
    if (!condition) throw new Error('Fallback Dataview WHERE supports column = value and LIKE value.');
    const [, column, operator, quoted, literal] = condition;
    const expected = (quoted ?? literal).toLowerCase();
    selected = selected.filter((row) => {
      const value = String(fallbackValue(row, column) ?? '').toLowerCase();
      return operator.toUpperCase() === 'LIKE' ? value.includes(expected.replace(/%/gu, '')) : value === expected;
    });
  }
  if (match[3]) {
    const column = match[3];
    selected.sort((left, right) => String(fallbackValue(left, column) ?? '').localeCompare(String(fallbackValue(right, column) ?? '')));
    if (match[4]?.toUpperCase() === 'DESC') selected.reverse();
  }
  if (match[5]) selected = selected.slice(0, Number(match[5]));
  return selected.map((row) => {
    if (!columns) return row;
    return Object.fromEntries(columns.map((column) => [column, fallbackValue(row, column)]));
  });
}

export async function queryIndex(sql, { env = process.env } = {}) {
  const normalized = assertReadOnlyQuery(sql);
  const paths = resolveWikiPaths({ env });
  if (DatabaseSync && await databaseFormat(paths.database) === 'sqlite') {
    const db = sqliteConnection(paths);
    try {
      return { mode: 'sqlite', rows: db.prepare(normalized).all().map((row) => Object.fromEntries(Object.entries(row))) };
    } finally { db.close(); }
  }
  return { mode: 'lexical-json', rows: fallbackQuery(normalized, await readIndexRows({ env })) };
}
