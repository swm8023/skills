#!/usr/bin/env node

import { execFile as execFileCallback } from 'node:child_process';
import { mkdir, readFile, readdir, realpath, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

export const DEFAULT_KNOWLEDGE_YAML = `# Content configuration only; data and index roots are fixed by the Skill.
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
`;

function mergedEnvironment(env) {
  return { ...process.env, ...(env || {}) };
}

export function resolveHome({ env = process.env } = {}) {
  const candidate = process.platform === 'win32'
    ? (env.USERPROFILE || env.HOME)
    : (env.HOME || env.USERPROFILE);
  return path.resolve(candidate || os.homedir());
}

export function resolveWikiPaths({ env = process.env } = {}) {
  const home = resolveHome({ env });
  const wiki = path.join(home, '.wheelmaker', 'wiki');
  const data = path.join(wiki, 'data');
  return {
    home,
    wiki,
    data,
    config: path.join(data, 'knowledge.yaml'),
    content: path.join(data, 'content'),
    assets: path.join(data, 'content', 'assets'),
    index: path.join(wiki, '.index'),
    quartz: path.join(wiki, 'quartz'),
    output: path.join(wiki, '.output'),
  };
}

async function pathExists(filename) {
  try {
    await stat(filename);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

async function isDirectoryEmpty(directory) {
  try {
    return (await readdir(directory)).length === 0;
  } catch (error) {
    if (error?.code === 'ENOENT') return true;
    throw error;
  }
}

export async function runGit(args, { cwd, env = process.env } = {}) {
  try {
    const result = await execFile('git', args, {
      cwd,
      env: mergedEnvironment(env),
      windowsHide: true,
      maxBuffer: 2 * 1024 * 1024,
    });
    return { ...result, code: 0 };
  } catch (error) {
    const detail = [error?.stdout, error?.stderr].filter(Boolean).join('\n').trim();
    const wrapped = new Error(detail || error?.message || `git ${args.join(' ')} failed`);
    wrapped.cause = error;
    wrapped.code = error?.code;
    wrapped.stdout = error?.stdout || '';
    wrapped.stderr = error?.stderr || '';
    throw wrapped;
  }
}

async function samePath(left, right) {
  const resolvedLeft = await realpath(left);
  const resolvedRight = await realpath(right);
  const normalizedLeft = process.platform === 'win32' ? resolvedLeft.toLowerCase() : resolvedLeft;
  const normalizedRight = process.platform === 'win32' ? resolvedRight.toLowerCase() : resolvedRight;
  return normalizedLeft === normalizedRight;
}

export async function inspectGit(data, { env = process.env } = {}) {
  try {
    const result = await runGit(['-C', data, 'rev-parse', '--show-toplevel'], { env });
    const root = result.stdout.trim();
    return {
      valid: Boolean(root) && await samePath(root, data),
      root,
      reason: Boolean(root) && await samePath(root, data)
        ? ''
        : `Git root is not the fixed data directory: ${root || '(unknown)'}`,
    };
  } catch (error) {
    return { valid: false, root: '', reason: error.message };
  }
}

function parsePorcelainEntry(entry) {
  if (!entry) return null;
  const status = entry.slice(0, 2);
  let relativePath = entry.slice(3);
  if (status.includes('R') || status.includes('C')) {
    const separator = relativePath.indexOf(' -> ');
    if (separator >= 0) relativePath = relativePath.slice(separator + 4);
  }
  return {
    status,
    relativePath: normalizeGitPath(relativePath),
    staged: status[0] !== ' ' && status[0] !== '?',
    workingTree: status[1] !== ' ' && status[1] !== '?',
  };
}

function normalizeGitPath(value) {
  return String(value || '').replace(/\\/gu, '/').replace(/^\.\//u, '');
}

export function parseGitStatus(output) {
  return String(output || '').split('\0').map(parsePorcelainEntry).filter(Boolean);
}

export async function readGitStatus(data, { env = process.env } = {}) {
  const result = await runGit(['-C', data, 'status', '--porcelain=v1', '--untracked-files=all', '-z'], { env });
  return parseGitStatus(result.stdout);
}

export async function syncCleanWiki(data, { env = process.env } = {}) {
  const entries = await readGitStatus(data, { env });
  if (entries.length) {
    throw new Error('Wiki Git worktree is not clean; refusing to stash or rebase over existing changes.');
  }
  await runGit(['-C', data, 'pull', '--rebase'], { env });
  return readGitStatus(data, { env });
}

async function ensureDefaultConfig(config) {
  try {
    await writeFile(config, DEFAULT_KNOWLEDGE_YAML, { encoding: 'utf8', flag: 'wx' });
    return true;
  } catch (error) {
    if (error?.code === 'EEXIST') return false;
    throw error;
  }
}

export async function validateKnowledgeConfig(config) {
  const source = await readFile(config, 'utf8');
  const lines = source.replace(/^\uFEFF/u, '').split(/\r?\n/u);
  let lastIndent = 0;
  for (const [index, raw] of lines.entries()) {
    if (!raw.trim() || raw.trimStart().startsWith('#')) continue;
    if (/\t/u.test(raw)) throw new Error(`knowledge.yaml line ${index + 1} uses tabs for indentation`);
    const indent = raw.length - raw.trimStart().length;
    const text = raw.trim();
    if (text.startsWith('- ')) {
      if (indent === 0 || lastIndent < indent) lastIndent = indent;
      continue;
    }
    if (!/^[^:#][^:]*:\s*(?:.*)$/u.test(text)) throw new Error(`knowledge.yaml line ${index + 1} is not a YAML mapping`);
    lastIndent = indent;
  }
  return true;
}

export async function ensureWikiState({ env = process.env, gitUrl = '' } = {}) {
  const paths = resolveWikiPaths({ env });
  const exists = await pathExists(paths.data);
  const empty = exists ? await isDirectoryEmpty(paths.data) : true;
  let cloned = false;

  if (!exists || empty) {
    if (!String(gitUrl || '').trim()) {
      return {
        status: 'needs-git-url',
        cloned: false,
        paths,
        message: `The fixed Wiki data directory is ${exists ? 'empty' : 'missing'}; provide its Git URL to clone it.`,
      };
    }
    await mkdir(paths.wiki, { recursive: true });
    try {
      await runGit(['clone', '--', String(gitUrl).trim(), paths.data], { env });
      cloned = true;
    } catch (error) {
      return {
        status: 'blocked',
        cloned: false,
        paths,
        message: `Unable to clone the Wiki Git repository into the fixed data directory: ${error.message}`,
      };
    }
  }

  const git = await inspectGit(paths.data, { env });
  if (!git.valid) {
    return {
      status: 'blocked',
      cloned,
      paths,
      message: `The fixed Wiki data directory is not a Git worktree rooted at data/: ${git.reason}`,
    };
  }

  const configCreated = await ensureDefaultConfig(paths.config);
  try {
    await validateKnowledgeConfig(paths.config);
  } catch (error) {
    return { status: 'blocked', cloned, paths, configCreated, message: `knowledge.yaml is malformed: ${error.message}` };
  }
  await mkdir(paths.content, { recursive: true });
  await mkdir(paths.assets, { recursive: true });
  return {
    status: 'ready',
    cloned,
    configCreated,
    paths,
    gitRoot: git.root,
  };
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  const result = await ensureWikiState({ gitUrl: process.argv[2] || '' });
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== 'ready') process.exitCode = 2;
}
