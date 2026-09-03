#!/usr/bin/env node

import { execFile as execFileCallback } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { ensureFresh, readIndexRows } from './index.mjs';
import { ensureWikiState, resolveWikiPaths } from './wiki-state.mjs';

const execFile = promisify(execFileCallback);

function parseNativePayload(raw) {
  let value;
  try { value = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return null; }
  const entries = Array.isArray(value) ? value : (Array.isArray(value?.results) ? value.results : (Array.isArray(value?.files) ? value.files : null));
  if (!entries) return null;
  return entries.map((entry) => {
    if (typeof entry === 'string') return { path: entry, matches: [] };
    if (!entry || typeof entry !== 'object') return null;
    const relativePath = entry.path || entry.file || entry.filename || entry.relativePath;
    if (!relativePath) return null;
    return {
      path: String(relativePath).replace(/\\/gu, '/'),
      matches: entry.matches || entry.match || entry.lines || [],
      title: entry.title,
    };
  }).filter(Boolean);
}

export async function runObsidianSearch(query, { data, env = process.env, timeoutMs = 3500 } = {}) {
  const command = env.OBSIDIAN_CLI || 'obsidian';
  try {
    const result = await execFile(command, ['search', `query=${String(query || '')}`, 'format=json'], {
      cwd: data,
      env: { ...process.env, ...(env || {}) },
      timeout: timeoutMs,
      windowsHide: true,
      maxBuffer: 2 * 1024 * 1024,
    });
    const results = parseNativePayload(result.stdout);
    if (!results) return { available: false, reason: 'Obsidian CLI returned unsupported search output.' };
    return { available: true, results };
  } catch (error) {
    const detail = [error?.stderr, error?.stdout].filter(Boolean).join('\n').trim();
    return { available: false, reason: detail || error?.message || 'Obsidian CLI is unavailable.' };
  }
}

function queryParts(query) {
  const raw = String(query || '').trim();
  const filters = { tags: [], folder: '', draft: null, title: '', properties: {} };
  const text = [];
  for (const token of raw.split(/\s+/u).filter(Boolean)) {
    const tag = token.match(/^tag:(.+)$/iu);
    const folder = token.match(/^folder:(.+)$/iu);
    const draft = token.match(/^draft:(true|false)$/iu);
    const title = token.match(/^title:(.+)$/iu);
    const property = token.match(/^([A-Za-z_][\w.-]*):(.+)$/u);
    if (tag) filters.tags.push(tag[1].toLowerCase());
    else if (folder) filters.folder = folder[1].replace(/\\/gu, '/').toLowerCase();
    else if (draft) filters.draft = draft[1].toLowerCase() === 'true';
    else if (title) filters.title = title[1].toLowerCase();
    else if (property && !/^(?:https?|file|mailto)$/iu.test(property[1])) filters.properties[property[1]] = queryValue(property[2]);
    else text.push(token.toLowerCase());
  }
  return { raw, filters, terms: text };
}

function queryValue(value) {
  const clean = String(value || '').replace(/^['"]|['"]$/gu, '');
  if (/^(?:true|false)$/iu.test(clean)) return clean.toLowerCase() === 'true';
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/u.test(clean)) return Number(clean);
  return clean.toLowerCase();
}

function propertyValue(row, key) {
  const metadata = row.frontmatter;
  if (!metadata || typeof metadata !== 'object') return undefined;
  if (Object.prototype.hasOwnProperty.call(metadata, key)) return metadata[key];
  return key.split('.').reduce((value, segment) => (
    value && typeof value === 'object' ? value[segment] : undefined
  ), metadata);
}

function propertyMatches(actual, expected) {
  if (Array.isArray(actual)) return actual.some((value) => propertyMatches(value, expected));
  if (actual && typeof actual === 'object') return JSON.stringify(actual).toLowerCase() === String(expected).toLowerCase();
  if (typeof expected === 'boolean' || typeof expected === 'number') return actual === expected;
  return String(actual ?? '').toLowerCase() === String(expected).toLowerCase();
}

function matchesFilter(row, filters) {
  if (filters.draft !== null && row.draft !== filters.draft) return false;
  if (filters.folder && !row.folder.toLowerCase().startsWith(filters.folder)) return false;
  if (filters.title && !row.title.toLowerCase().includes(filters.title)) return false;
  if (!filters.tags.every((tag) => row.tags.some((value) => value.toLowerCase() === tag || value.toLowerCase().startsWith(`${tag}/`)))) return false;
  return Object.entries(filters.properties).every(([key, expected]) => propertyMatches(propertyValue(row, key), expected));
}

function snippet(row, terms) {
  const source = `${row.description || ''}\n${row.body || ''}`.replace(/\s+/gu, ' ').trim();
  if (!source) return '';
  const lowered = source.toLowerCase();
  const position = terms.map((term) => lowered.indexOf(term)).filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? 0;
  const start = Math.max(0, position - 80);
  const end = Math.min(source.length, start + 220);
  return `${start > 0 ? '…' : ''}${source.slice(start, end)}${end < source.length ? '…' : ''}`;
}

function score(row, terms, filters) {
  const title = row.title.toLowerCase();
  const description = (row.description || '').toLowerCase();
  const tags = row.tags.join(' ').toLowerCase();
  const body = (row.body || '').toLowerCase();
  return terms.reduce((total, term) => total
    + (title.includes(term) ? 100 : 0)
    + (tags.includes(term) ? 60 : 0)
    + (description.includes(term) ? 30 : 0)
    + (body.includes(term) ? 10 : 0), 0)
    + filters.tags.length * 25
    + Object.keys(filters.properties).length * 25
    + (filters.folder ? 15 : 0);
}

export async function searchFallback({ query, env = process.env, gitUrl = '', limit = 50 } = {}) {
  let index;
  let stale = false;
  let warning = '';
  try {
    index = await ensureFresh({ env, gitUrl });
  } catch (error) {
    const existing = await readIndexRows({ env });
    if (!existing.length) throw error;
    stale = true;
    warning = `The local knowledge index could not be refreshed; showing the previous index: ${error.message}`;
    const paths = resolveWikiPaths({ env });
    index = { backend: 'stale', paths };
  }
  const rows = await readIndexRows({ env });
  const parts = queryParts(query);
  const results = rows.filter((row) => {
    if (!matchesFilter(row, parts.filters)) return false;
    if (!parts.terms.length) return true;
    const haystack = `${row.title} ${row.description || ''} ${row.tags.join(' ')} ${row.body || ''} ${JSON.stringify(row.frontmatter || {})}`.toLowerCase();
    return parts.terms.every((term) => haystack.includes(term));
  }).map((row) => ({
    path: row.path,
    title: row.title,
    folder: row.folder,
    tags: row.tags,
    draft: row.draft,
    description: row.description,
    snippet: snippet(row, parts.terms),
    relevance: score(row, parts.terms, parts.filters),
  })).sort((left, right) => right.relevance - left.relevance || left.path.localeCompare(right.path)).slice(0, limit);
  return {
    mode: 'lexical',
    degraded: true,
    backend: index.backend,
    index: index.paths.indexDir,
    stale,
    ...(warning ? { warning } : {}),
    results,
  };
}

export async function searchKnowledge({ query = '', env = process.env, gitUrl = '', structured = false, limit = 50, runNative = runObsidianSearch } = {}) {
  const state = await ensureWikiState({ env, gitUrl });
  if (state.status !== 'ready') return { mode: 'unavailable', status: state.status, message: state.message || 'Wiki data is not ready.' };
  if (!structured) {
    const native = await runNative(query, { data: state.paths.data, env });
    if (native?.available && Array.isArray(native.results)) return { mode: 'obsidian', degraded: false, results: native.results };
  }
  try {
    return await searchFallback({ query, env, gitUrl, limit });
  } catch (error) {
    return { mode: 'unavailable', status: 'blocked', message: error.message };
  }
}

function parseCli(argv) {
  const values = { query: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--query') {
      values.query = argv[index + 1] || '';
      if (!values.query || values.query.startsWith('--')) throw new Error('--query requires a value');
      index += 1;
    } else if (flag === '--structured') values.structured = true;
    else throw new Error(`unknown search argument ${flag}`);
  }
  if (!values.query) throw new Error('usage: node search.mjs --query <text>');
  return values;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = await searchKnowledge(parseCli(process.argv.slice(2)));
    console.log(JSON.stringify(result, null, 2));
    if (result.mode === 'unavailable') process.exitCode = 2;
  } catch (error) {
    console.error(error?.stack || error?.message || error);
    process.exitCode = 1;
  }
}
