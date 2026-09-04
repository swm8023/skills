#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFile as execFileCallback } from 'node:child_process';
import { mkdir, readFile, readdir, realpath, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { parseWikiConfig } from './yaml.mjs';

const execFile = promisify(execFileCallback);

export const WIKI_CONFIG_FILENAME = 'wiki.config.yaml';

const DEFAULT_WIKI_CONFIG = `# Content configuration only; data and index roots are fixed by the Skill.
# version: 1
# content:
#   root: content
#   assets: content/assets
#   repo:
#     rename: {}
#   directories:
#     mode: ai
#     create: confirm
#   tags:
#     lookup: current-repo-first
#     create: confirm
# publish:
#   mode: auto
#   quartz: auto
#   git:
#     sync: rebase
#     commit: auto
#     push: auto
site:
  title: WheelMaker Knowledge
  description: Browse the WheelMaker knowledge base.
`;

function environment(env) {
  return { ...process.env, ...(env || {}) };
}

export function resolveHome({ env = process.env } = {}) {
  const candidate = process.platform === 'win32' ? (env.USERPROFILE || env.HOME) : (env.HOME || env.USERPROFILE);
  return path.resolve(candidate || os.homedir());
}

export function resolveWikiPaths({ env = process.env } = {}) {
  const home = resolveHome({ env });
  const wiki = path.join(home, '.wheelmaker', 'wiki');
  const data = path.join(wiki, 'data');
  const fingerprint = createHash('sha256').update(data).digest('hex').slice(0, 24);
  const indexDir = path.join(wiki, '.index', fingerprint);
  return {
    home,
    wiki,
    data,
    config: path.join(data, WIKI_CONFIG_FILENAME),
    content: path.join(data, 'content'),
    assets: path.join(data, 'content', 'assets'),
    indexRoot: path.join(wiki, '.index'),
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

async function empty(directory) {
  try { return (await readdir(directory)).length === 0; } catch (error) {
    if (error?.code === 'ENOENT') return true;
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

async function createConfig(config) {
  try {
    await writeFile(config, DEFAULT_WIKI_CONFIG, { encoding: 'utf8', flag: 'wx' });
    return true;
  } catch (error) {
    if (error?.code === 'EEXIST') return false;
    throw error;
  }
}

async function validateConfig(config) {
  const source = await readFile(config, 'utf8');
  parseWikiConfig(source, config);
  return true;
}

export async function ensureWikiState({ env = process.env, gitUrl = '' } = {}) {
  const paths = resolveWikiPaths({ env });
  const present = await exists(paths.data);
  const isEmpty = present ? await empty(paths.data) : true;
  let cloned = false;
  if (!present || isEmpty) {
    if (!String(gitUrl || '').trim()) return { status: 'needs-git-url', paths, cloned: false };
    await mkdir(paths.wiki, { recursive: true });
    try {
      await git(['clone', '--', String(gitUrl).trim(), paths.data], { env });
      cloned = true;
    } catch (error) {
      return { status: 'blocked', paths, cloned: false, message: `Unable to clone the Wiki Git repository: ${error.message}` };
    }
  }
  const root = await gitRoot(paths.data, { env });
  if (!root.valid) return { status: 'blocked', paths, cloned, message: 'The fixed Wiki data directory is not a Git worktree rooted at data/.' };
  const configCreated = await createConfig(paths.config);
  try { await validateConfig(paths.config); } catch (error) {
    return { status: 'blocked', paths, cloned, configCreated, message: `${WIKI_CONFIG_FILENAME} is malformed: ${error.message}` };
  }
  await mkdir(paths.content, { recursive: true });
  await mkdir(paths.assets, { recursive: true });
  return { status: 'ready', paths, cloned, configCreated, gitRoot: root.root };
}

export { git };
