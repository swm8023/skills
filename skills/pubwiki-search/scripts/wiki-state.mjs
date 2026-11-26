#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFile as execFileCallback } from 'node:child_process';
import { realpath, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

function environment(env) {
  return { ...process.env, ...(env || {}) };
}

export function resolveHome({ env = process.env } = {}) {
  const candidate = process.platform === 'win32' ? (env.USERPROFILE || env.HOME) : (env.HOME || env.USERPROFILE);
  return path.resolve(candidate || os.homedir());
}

export function resolveWikiPaths({ env = process.env } = {}) {
  const home = resolveHome({ env });
  const stateRoot = path.join(home, '.wheelmaker');
  const wiki = path.join(stateRoot, 'wiki');
  const data = path.join(wiki, 'data');
  const fingerprint = createHash('sha256').update(data).digest('hex').slice(0, 24);
  const indexRoot = path.join(stateRoot, '.tmp', 'wiki', 'index');
  const indexDir = path.join(indexRoot, fingerprint);
  return {
    home,
    wiki,
    data,
    content: path.join(data, 'content'),
    assets: path.join(data, 'content', 'assets'),
    indexRoot,
    indexDir,
    database: path.join(indexDir, 'index.db'),
    manifest: path.join(indexDir, 'manifest.json'),
    lock: path.join(indexDir, 'update.lock'),
  };
}

async function exists(filename) {
  try { await stat(filename); return true; } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

async function git(args, { env = process.env } = {}) {
  try {
    return await execFile('git', args, { env: environment(env), windowsHide: true, maxBuffer: 2 * 1024 * 1024 });
  } catch (error) {
    const detail = [error?.stdout, error?.stderr].filter(Boolean).join('\n').trim();
    throw new Error(detail || error?.message || `git ${args.join(' ')} failed`, { cause: error });
  }
}

async function samePath(left, right) {
  const a = await realpath(left);
  const b = await realpath(right);
  return (process.platform === 'win32' ? a.toLowerCase() : a) === (process.platform === 'win32' ? b.toLowerCase() : b);
}

async function gitRoot(data, { env = process.env } = {}) {
  try {
    const result = await git(['-C', data, 'rev-parse', '--show-toplevel'], { env });
    const root = result.stdout.trim();
    return { valid: Boolean(root) && await samePath(root, data), root };
  } catch { return { valid: false, root: '' }; }
}

// Search may refresh its private index, but never initialize or mutate the Vault.
export async function ensureWikiState({ env = process.env } = {}) {
  const paths = resolveWikiPaths({ env });
  if (!await exists(paths.data)) {
    return { status: 'needs-setup', paths, message: 'The fixed Wiki Vault is missing; run wheelmaker cmd --command wiki --action prepare --git-url URL before searching.' };
  }
  const root = await gitRoot(paths.data, { env });
  if (!root.valid) return { status: 'blocked', paths, message: 'The fixed Wiki data directory is not a Git worktree rooted at data/.' };
  return { status: 'ready', paths, gitRoot: root.root };
}

export { git };
