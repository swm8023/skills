#!/usr/bin/env node

import { execFile as execFileCallback } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { ensureWikiState, readGitStatus, runGit } from './wiki-state.mjs';

const execFile = promisify(execFileCallback);

function normalizePath(value) {
  const normalized = path.posix.normalize(String(value || '').replace(/\\/gu, '/').replace(/^\.\//u, ''));
  if (!normalized || normalized === '.' || normalized.startsWith('../') || normalized.startsWith('/') || normalized.includes('/../') || normalized.startsWith('-')) return '';
  return normalized;
}

function allowedPath(relativePath, requestedPaths) {
  return requestedPaths.some((requested) => relativePath === requested || relativePath.startsWith(`${requested}/`));
}

function parseNameList(output) {
  return String(output || '').split('\0').map(normalizePath).filter(Boolean);
}

function publishMode(source) {
  for (const line of String(source || '').split(/\r?\n/u)) {
    const clean = line.replace(/\s+#.*$/u, '').trim();
    const match = clean.match(/^(?:publish\.mode|mode):\s*([a-z-]+)/iu);
    if (match) return match[1].toLowerCase();
  }
  return 'auto';
}

async function invokeWheelmaker(args = ['wiki', 'publish'], { env = process.env } = {}) {
  const command = env.WHEELMAKER_CLI || 'wheelmaker';
  try {
    await execFile(command, args, {
      env: { ...process.env, ...(env || {}) },
      windowsHide: true,
      maxBuffer: 2 * 1024 * 1024,
    });
  } catch (error) {
    const detail = [error?.stdout, error?.stderr].filter(Boolean).join('\n').trim();
    throw new Error(detail || error?.message || 'wheelmaker wiki publish failed', { cause: error });
  }
}

export async function inspectPublishPreflight({ data, requestedPaths, env = process.env } = {}) {
  const normalizedPaths = [...new Set((requestedPaths || []).map(normalizePath).filter(Boolean))];
  if (!normalizedPaths.length) return { ok: false, paths: [], entries: [], message: 'At least one approved Wiki path is required.' };
  const entries = await readGitStatus(data, { env });
  const staged = entries.filter((entry) => entry.staged);
  if (staged.length) {
    return {
      ok: false,
      paths: normalizedPaths,
      entries,
      message: `Pre-existing staged Git entries found (${staged.map((entry) => entry.relativePath).join(', ')}); refusing to mix changes.`,
    };
  }
  const unrelated = entries.filter((entry) => !allowedPath(entry.relativePath, normalizedPaths));
  if (unrelated.length) {
    return {
      ok: false,
      paths: normalizedPaths,
      entries,
      message: `Git changes outside the approved path list: ${unrelated.map((entry) => entry.relativePath).join(', ')}`,
    };
  }
  return { ok: true, paths: normalizedPaths, entries, message: '' };
}

async function stagedNames(data, { env = process.env } = {}) {
  const result = await runGit(['-C', data, 'diff', '--cached', '--name-only', '-z'], { env });
  return parseNameList(result.stdout);
}

export async function publishWiki({
  env = process.env,
  gitUrl = '',
  requestedPaths = [],
  message = 'knowledge: update Wiki',
  push = true,
  pull = true,
  force = false,
  invokeWheelmaker: invoke = invokeWheelmaker,
} = {}) {
  if (force) return { status: 'blocked', message: 'Force-push is not permitted for Wiki publishing.' };
  let state;
  try {
    state = await ensureWikiState({ env, gitUrl });
  } catch (error) {
    return { status: 'blocked', message: error.message };
  }
  if (state.status !== 'ready') return { status: 'blocked', ...state };
  const requested = [...requestedPaths];
  if (state.configCreated) requested.push('knowledge.yaml');
  let preflight;
  try {
    preflight = await inspectPublishPreflight({ data: state.paths.data, requestedPaths: requested, env });
  } catch (error) {
    return { status: 'blocked', paths: state.paths, message: `Unable to inspect Wiki Git state: ${error.message}` };
  }
  if (!preflight.ok) return { status: 'blocked', paths: state.paths, ...preflight };
  if (!preflight.entries.some((entry) => allowedPath(entry.relativePath, preflight.paths))) {
    return { status: 'blocked', paths: state.paths, message: 'No changes were found in the approved Wiki paths.' };
  }

  try {
    await runGit(['-C', state.paths.data, 'add', '--', ...preflight.paths], { env });
    const staged = await stagedNames(state.paths.data, { env });
    const unexpected = staged.filter((relativePath) => !allowedPath(relativePath, preflight.paths));
    if (unexpected.length) {
      return { status: 'blocked', paths: state.paths, message: `Git staged unexpected paths: ${unexpected.join(', ')}` };
    }
    if (!staged.length) return { status: 'blocked', paths: state.paths, message: 'Git did not stage any approved Wiki path.' };
    await runGit(['-C', state.paths.data, 'commit', '-m', String(message || 'knowledge: update Wiki')], { env });
    if (pull) await runGit(['-C', state.paths.data, 'pull', '--rebase'], { env });
    if (push) await runGit(['-C', state.paths.data, 'push'], { env });
    const config = await readFile(state.paths.config, 'utf8');
    const mode = publishMode(config);
    if (mode === 'manual' || mode === 'disabled' || mode === 'off' || mode === 'false') {
      return { status: 'committed', paths: state.paths, staged, pushed: push, mode };
    }
    await invoke(['wiki', 'publish'], { env, paths: state.paths });
    return { status: 'published', paths: state.paths, staged, pushed: push, mode: 'auto' };
  } catch (error) {
    return { status: 'blocked', paths: state.paths, message: `Wiki Git/publish phase failed: ${error.message}` };
  }
}

function parseCli(argv) {
  const values = { paths: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--paths') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--paths requires a repository-relative path');
      values.paths.push(value);
      index += 1;
    } else if (flag === '--message') {
      values.message = argv[index + 1] || '';
      if (!values.message || values.message.startsWith('--')) throw new Error('--message requires a value');
      index += 1;
    } else if (flag === '--git-url') {
      values.gitUrl = argv[index + 1] || '';
      if (!values.gitUrl || values.gitUrl.startsWith('--')) throw new Error('--git-url requires a value');
      index += 1;
    } else throw new Error(`unknown Wiki publish argument ${flag}`);
  }
  if (!values.paths.length) throw new Error('usage: node publish-wiki.mjs --paths <repo-relative-path> ...');
  return values;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = await publishWiki(parseCli(process.argv.slice(2)));
    console.log(JSON.stringify(result, null, 2));
    if (result.status === 'blocked') process.exitCode = 2;
  } catch (error) {
    console.error(error?.stack || error?.message || error);
    process.exitCode = 1;
  }
}
