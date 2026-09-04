#!/usr/bin/env node

import { execFile as execFileCallback } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { ensureWikiState, normalizeRelativePath, parseWikiConfig, readGitStatus, runGit } from './pubwiki-core.mjs';
import { ensureQuartz as ensureQuartzRuntime } from './ensure-quartz.mjs';

const execFile = promisify(execFileCallback);

function allowedPath(relativePath, requestedPaths) {
  return requestedPaths.some((requested) => relativePath === requested);
}

function parseNameList(output) {
  return String(output || '').split('\0').map(normalizeRelativePath).filter(Boolean);
}

function publishMode(config) {
  if (config?.publish === false) return 'false';
  if (typeof config?.publish?.mode === 'boolean') return config.publish.mode ? 'auto' : 'false';
  return typeof config?.publish?.mode === 'string' ? config.publish.mode.toLowerCase() : 'auto';
}

async function missingGitIdentity(data, { env = process.env, runGitFn = runGit } = {}) {
  const missing = [];
  for (const field of ['user.name', 'user.email']) {
    try {
      const result = await runGitFn(['-C', data, 'config', '--get', field], { env });
      if (!result.stdout.trim()) missing.push(field);
    } catch {
      missing.push(field);
    }
  }
  return missing;
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

export async function inspectPublishPreflight({ data, requestedPaths, env = process.env, readGitStatusFn = readGitStatus } = {}) {
  const normalizedPaths = [...new Set((requestedPaths || []).map(normalizeRelativePath).filter(Boolean))];
  if (!normalizedPaths.length) return { ok: false, paths: [], entries: [], message: 'At least one approved Wiki path is required.' };
  const entries = await readGitStatusFn(data, { env });
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

async function stagedNames(data, { env = process.env, runGitFn = runGit } = {}) {
  const result = await runGitFn(['-C', data, 'diff', '--cached', '--name-only', '-z'], { env });
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
  ensureQuartz: ensure = ensureQuartzRuntime,
  runGitFn = runGit,
  readGitStatusFn = readGitStatus,
} = {}) {
  if (force) return { status: 'blocked', message: 'Force-push is not permitted for Wiki publishing.' };
  let state;
  try {
    state = await ensureWikiState({ env, gitUrl });
  } catch (error) {
    return { status: 'blocked', message: error.message };
  }
  if (state.status !== 'ready') return { status: 'blocked', ...state };
  let mode;
  try {
    mode = publishMode(parseWikiConfig(await readFile(state.paths.config, 'utf8'), state.paths.config));
  } catch (error) {
    return { status: 'blocked', paths: state.paths, message: `${path.basename(state.paths.config)} is malformed: ${error.message}` };
  }
  if (mode === 'manual' || mode === 'disabled' || mode === 'off' || mode === 'false') {
    return { status: 'skipped', paths: state.paths, mode, pushed: false };
  }
  const requested = [...requestedPaths];
  if (state.configCreated) requested.push(path.basename(state.paths.config));
  let preflight;
  try {
    preflight = await inspectPublishPreflight({ data: state.paths.data, requestedPaths: requested, env, readGitStatusFn });
  } catch (error) {
    return { status: 'blocked', paths: state.paths, message: `Unable to inspect Wiki Git state: ${error.message}` };
  }
  if (!preflight.ok) return { status: 'blocked', paths: state.paths, ...preflight };
  if (!preflight.entries.some((entry) => allowedPath(entry.relativePath, preflight.paths))) {
    return { status: 'blocked', paths: state.paths, message: 'No changes were found in the approved Wiki paths.' };
  }
  const missingIdentity = await missingGitIdentity(state.paths.data, { env, runGitFn });
  if (missingIdentity.length) {
    return {
      status: 'blocked',
      paths: state.paths,
      message: `Git author identity is not configured (${missingIdentity.join(', ')}); configure it before Wiki publishing.`,
    };
  }

  let quartz;
  try {
    quartz = await ensure({ env, refresh: false });
  } catch (error) {
    return { status: 'blocked', paths: state.paths, message: `Quartz preflight failed: ${error.message}` };
  }
  if (!quartz || quartz.status !== 'ready') {
    return {
      status: 'blocked',
      paths: state.paths,
      quartz,
      message: `Quartz preflight failed: ${quartz?.message || quartz?.status || 'runtime is not ready'}`,
    };
  }

  try {
    await runGitFn(['-C', state.paths.data, 'add', '--', ...preflight.paths], { env });
    const staged = await stagedNames(state.paths.data, { env, runGitFn });
    const unexpected = staged.filter((relativePath) => !allowedPath(relativePath, preflight.paths));
    if (unexpected.length) {
      return { status: 'blocked', paths: state.paths, message: `Git staged unexpected paths: ${unexpected.join(', ')}` };
    }
    if (!staged.length) return { status: 'blocked', paths: state.paths, message: 'Git did not stage any approved Wiki path.' };
    await runGitFn(['-C', state.paths.data, 'commit', '-m', String(message || 'knowledge: update Wiki')], { env });
    if (pull) await runGitFn(['-C', state.paths.data, 'pull', '--rebase'], { env });
    if (push) await runGitFn(['-C', state.paths.data, 'push'], { env });
    await invoke(['wiki', 'publish'], { env, paths: state.paths });
    return { status: 'published', paths: state.paths, staged, pushed: push, mode };
  } catch (error) {
    return { status: 'blocked', paths: state.paths, message: `Wiki Git/publish phase failed: ${error.message}` };
  }
}

export function parseCli(argv) {
  const values = { requestedPaths: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--paths') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--paths requires a repository-relative path');
      values.requestedPaths.push(value);
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
  if (!values.requestedPaths.length) throw new Error('usage: node publish-wiki.mjs --paths <repo-relative-path> ...');
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
