#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFile as execFileCallback } from 'node:child_process';
import { mkdir, readFile, readdir, realpath, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

export const WIKI_CONFIG_FILENAME = 'wiki.config.yaml';

export const DEFAULT_WIKI_CONFIG = `# Content configuration only; data and index roots are fixed by the Skill.
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
#   git:
#     sync: rebase
#     commit: auto
#     push: auto
#   quartz:
#     refresh: explicit
site:
  title: WheelMaker Knowledge
  description: Browse the WheelMaker knowledge base.
`;

export class WikiCoreError extends Error {
  constructor(message, { code = 'WIKI_CORE_ERROR', cause } = {}) {
    super(String(message), cause === undefined ? {} : { cause });
    this.name = 'WikiCoreError';
    this.code = code;
  }
}

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
  const fingerprint = createHash('sha256').update(data).digest('hex').slice(0, 24);
  const indexRoot = path.join(wiki, '.index');
  const indexDir = path.join(indexRoot, fingerprint);
  return {
    home,
    wiki,
    data,
    config: path.join(data, WIKI_CONFIG_FILENAME),
    content: path.join(data, 'content'),
    assets: path.join(data, 'content', 'assets'),
    index: indexRoot,
    indexRoot,
    indexDir,
    database: path.join(indexDir, 'index.db'),
    manifest: path.join(indexDir, 'manifest.json'),
    lock: path.join(indexDir, 'update.lock'),
    quartz: path.join(wiki, 'quartz'),
    output: path.join(wiki, '.output'),
  };
}

export function normalizeRelativePath(value) {
  const normalized = path.posix.normalize(String(value || '').replace(/\\/gu, '/').replace(/^\.\//u, ''));
  if (!normalized || normalized === '.' || normalized.startsWith('../') || normalized === '..'
    || normalized.startsWith('/') || normalized.includes('/../') || normalized.startsWith('-')) return '';
  return normalized;
}

export function normalizeGitPath(value) {
  return String(value || '').replace(/\\/gu, '/').replace(/^\.\//u, '');
}

export async function runCommand(command, args = [], {
  cwd,
  env = process.env,
  timeout,
  maxBuffer = 2 * 1024 * 1024,
  shell = false,
} = {}) {
  try {
    return await execFile(command, args, {
      cwd,
      env: mergedEnvironment(env),
      timeout,
      shell,
      windowsHide: true,
      maxBuffer,
    });
  } catch (error) {
    const detail = [error?.stdout, error?.stderr].filter(Boolean).join('\n').trim();
    const wrapped = new WikiCoreError(detail || error?.message || `${command} ${args.join(' ')} failed`, {
      code: 'COMMAND_FAILED',
      cause: error,
    });
    wrapped.stdout = error?.stdout || '';
    wrapped.stderr = error?.stderr || '';
    wrapped.command = command;
    wrapped.args = [...args];
    throw wrapped;
  }
}

export async function runGit(args, options = {}) {
  return runCommand('git', args, options);
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
    const valid = Boolean(root) && await samePath(root, data);
    return {
      valid,
      root,
      reason: valid ? '' : `Git root is not the fixed data directory: ${root || '(unknown)'}`,
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

export function parseGitStatus(output) {
  return String(output || '').split('\0').map(parsePorcelainEntry).filter(Boolean);
}

export async function readGitStatus(data, { env = process.env } = {}) {
  const result = await runGit(['-C', data, 'status', '--porcelain=v1', '--untracked-files=all', '-z'], { env });
  return parseGitStatus(result.stdout);
}

export async function syncCleanWiki(data, { env = process.env } = {}) {
  const entries = await readGitStatus(data, { env });
  if (entries.length) throw new WikiCoreError('Wiki Git worktree is not clean; refusing to stash or rebase over existing changes.', { code: 'WIKI_DIRTY' });
  await runGit(['-C', data, 'pull', '--rebase'], { env });
  return readGitStatus(data, { env });
}

export async function digestFile(filename) {
  return createHash('sha256').update(await readFile(filename)).digest('hex');
}

function errorAt(filename, line, message) {
  throw new WikiCoreError(`${filename} line ${line}: ${message}`, { code: 'INVALID_YAML' });
}

function isEscaped(source, index) {
  let slashes = 0;
  for (let cursor = index - 1; cursor >= 0 && source[cursor] === '\\'; cursor -= 1) slashes += 1;
  return slashes % 2 === 1;
}

function stripComment(source) {
  let quote = '';
  const stack = [];
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === quote && (quote !== '"' || !isEscaped(source, index))) {
        if (quote === "'" && source[index + 1] === "'") index += 1;
        else quote = '';
      }
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '[' || character === '{') {
      stack.push(character);
      continue;
    }
    if (character === ']' || character === '}') {
      const expected = character === ']' ? '[' : '{';
      if (stack.pop() !== expected) throw new WikiCoreError(`unbalanced YAML flow delimiter ${character}`, { code: 'INVALID_YAML' });
      continue;
    }
    if (character === '#' && (index === 0 || /\s/u.test(source[index - 1])) && stack.length === 0) return source.slice(0, index).trimEnd();
  }
  if (quote) throw new WikiCoreError('unterminated YAML quote', { code: 'INVALID_YAML' });
  if (stack.length) throw new WikiCoreError('unterminated YAML flow collection', { code: 'INVALID_YAML' });
  return source.trimEnd();
}

function splitTopLevel(source, separator = ',') {
  const values = [];
  let start = 0;
  let quote = '';
  const stack = [];
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === quote && (quote !== '"' || !isEscaped(source, index))) {
        if (quote === "'" && source[index + 1] === "'") index += 1;
        else quote = '';
      }
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === '[' || character === '{') stack.push(character);
    else if (character === ']' || character === '}') {
      const expected = character === ']' ? '[' : '{';
      if (stack.pop() !== expected) throw new WikiCoreError(`unbalanced YAML flow delimiter ${character}`, { code: 'INVALID_YAML' });
    } else if (character === separator && stack.length === 0) {
      values.push(source.slice(start, index).trim());
      start = index + 1;
    }
  }
  if (quote) throw new WikiCoreError('unterminated YAML quote', { code: 'INVALID_YAML' });
  if (stack.length) throw new WikiCoreError('unterminated YAML flow collection', { code: 'INVALID_YAML' });
  values.push(source.slice(start).trim());
  return values;
}

function splitMapping(source, { flow = false } = {}) {
  let quote = '';
  const stack = [];
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === quote && (quote !== '"' || !isEscaped(source, index))) {
        if (quote === "'" && source[index + 1] === "'") index += 1;
        else quote = '';
      }
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === '[' || character === '{') stack.push(character);
    else if (character === ']' || character === '}') {
      const expected = character === ']' ? '[' : '{';
      if (stack.pop() !== expected) throw new WikiCoreError(`unbalanced YAML flow delimiter ${character}`, { code: 'INVALID_YAML' });
    } else if (character === ':' && stack.length === 0
      && (flow || index + 1 === source.length || /\s/u.test(source[index + 1]))) {
      const key = source.slice(0, index).trim();
      if (key) return { key, value: source.slice(index + 1).trim() };
    }
  }
  if (quote) throw new WikiCoreError('unterminated YAML quote', { code: 'INVALID_YAML' });
  if (stack.length) throw new WikiCoreError('unterminated YAML flow collection', { code: 'INVALID_YAML' });
  return null;
}

function parseKey(source) {
  const key = parseScalar(source);
  if (key === null || key === undefined || typeof key === 'object') throw new WikiCoreError('YAML mapping keys must be scalar values', { code: 'INVALID_YAML' });
  return String(key);
}

function parseScalar(source) {
  const value = stripComment(String(source || '').trim());
  if (value === '' || value === 'null' || value === '~') return null;
  if (/^(?:true|false)$/iu.test(value)) return value.toLowerCase() === 'true';
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/u.test(value)) return Number(value);
  if (value.startsWith('"')) {
    if (!value.endsWith('"') || isEscaped(value, value.length - 1)) throw new WikiCoreError('unterminated YAML double-quoted scalar', { code: 'INVALID_YAML' });
    try { return JSON.parse(value); } catch (error) { throw new WikiCoreError(`invalid YAML double-quoted scalar: ${error.message}`, { code: 'INVALID_YAML', cause: error }); }
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'")) throw new WikiCoreError('unterminated YAML single-quoted scalar', { code: 'INVALID_YAML' });
    return value.slice(1, -1).replace(/''/gu, "'");
  }
  if (value.startsWith('[')) {
    if (!value.endsWith(']')) throw new WikiCoreError('unterminated YAML sequence', { code: 'INVALID_YAML' });
    const inner = value.slice(1, -1).trim();
    return inner ? splitTopLevel(inner).map(parseScalar) : [];
  }
  if (value.startsWith('{')) {
    if (!value.endsWith('}')) throw new WikiCoreError('unterminated YAML mapping', { code: 'INVALID_YAML' });
    const result = {};
    const inner = value.slice(1, -1).trim();
    if (!inner) return result;
    for (const entry of splitTopLevel(inner)) {
      const pair = splitMapping(entry, { flow: true });
      if (!pair) throw new WikiCoreError(`invalid YAML flow mapping entry: ${entry}`, { code: 'INVALID_YAML' });
      const key = parseKey(pair.key);
      if (Object.prototype.hasOwnProperty.call(result, key)) throw new WikiCoreError(`duplicate YAML key: ${key}`, { code: 'INVALID_YAML' });
      result[key] = parseScalar(pair.value);
    }
    return result;
  }
  if (/[\[\]{}]/u.test(value)) throw new WikiCoreError(`invalid YAML scalar: ${value}`, { code: 'INVALID_YAML' });
  return value;
}

function tokenize(source, filename) {
  return String(source || '').replace(/^\uFEFF/u, '').split(/\r?\n/u).map((raw, index) => {
    if (/\t/u.test(raw)) errorAt(filename, index + 1, 'tabs are not allowed for YAML indentation');
    const uncommented = stripComment(raw);
    const text = uncommented.trim();
    return {
      raw,
      line: index + 1,
      indent: uncommented.length - uncommented.trimStart().length,
      text,
      blank: text === '',
    };
  });
}

function nextMeaningful(lines, start) {
  let index = start;
  while (index < lines.length && lines[index].blank) index += 1;
  return index;
}

function blockScalar(lines, start, parentIndent, folded, chomping) {
  let index = start;
  let blockIndent = null;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.blank) {
      if (line.indent <= parentIndent) break;
      blockIndent ??= line.indent;
    }
    index += 1;
  }
  if (blockIndent === null) return ['', index];
  const values = [];
  for (let cursor = start; cursor < index; cursor += 1) {
    const line = lines[cursor];
    values.push(line.blank ? '' : line.raw.slice(Math.min(blockIndent, line.raw.length)));
  }
  let result = folded ? values.join('\n').replace(/([^\n])\n([^\n])/gu, '$1 $2') : values.join('\n');
  if (chomping !== '-') result += '\n';
  if (chomping === '+') result += '\n';
  return [result, index];
}

function parseBlock(lines, start, indent, filename) {
  let index = nextMeaningful(lines, start);
  if (index >= lines.length || lines[index].indent < indent) return [null, index];
  if (lines[index].indent !== indent) errorAt(filename, lines[index].line, 'unexpected YAML indentation');
  const array = lines[index].text === '-' || lines[index].text.startsWith('- ');
  const result = array ? [] : {};
  while (true) {
    index = nextMeaningful(lines, index);
    if (index >= lines.length || lines[index].indent < indent) break;
    const line = lines[index];
    if (line.indent > indent) errorAt(filename, line.line, 'unexpected YAML indentation');
    const sequence = line.text === '-' || line.text.startsWith('- ');
    if (sequence !== array) errorAt(filename, line.line, 'cannot mix YAML sequence and mapping entries');
    if (array) {
      const rest = line.text.slice(1).trim();
      index += 1;
      if (!rest) {
        const child = nextMeaningful(lines, index);
        if (child < lines.length && lines[child].indent > indent) {
          const [value, next] = parseBlock(lines, child, lines[child].indent, filename);
          result.push(value);
          index = next;
        } else result.push(null);
        continue;
      }
      const pair = splitMapping(rest);
      if (!pair) {
        result.push(parseScalar(rest));
        const child = nextMeaningful(lines, index);
        if (child < lines.length && lines[child].indent > indent) errorAt(filename, lines[child].line, 'a scalar YAML item cannot have nested entries');
        continue;
      }
      const item = {};
      const key = parseKey(pair.key);
      item[key] = parseEntryValue(lines, index, indent, pair.value, filename, (next) => { index = next; }, true);
      let child = nextMeaningful(lines, index);
      if (child < lines.length && lines[child].indent > indent) {
        const continuationIndent = lines[child].indent;
        while (true) {
          child = nextMeaningful(lines, index);
          if (child >= lines.length || lines[child].indent < continuationIndent) break;
          if (lines[child].indent > continuationIndent) errorAt(filename, lines[child].line, 'unexpected YAML indentation');
          const continuation = splitMapping(lines[child].text);
          if (!continuation) errorAt(filename, lines[child].line, 'expected a YAML mapping entry');
          const continuationKey = parseKey(continuation.key);
          if (Object.prototype.hasOwnProperty.call(item, continuationKey)) errorAt(filename, lines[child].line, `duplicate YAML key: ${continuationKey}`);
          index = child + 1;
          item[continuationKey] = parseEntryValue(lines, index, continuationIndent, continuation.value, filename, (next) => { index = next; });
        }
      }
      result.push(item);
      continue;
    }
    const pair = splitMapping(line.text);
    if (!pair) errorAt(filename, line.line, 'expected a YAML mapping entry');
    const key = parseKey(pair.key);
    if (Object.prototype.hasOwnProperty.call(result, key)) errorAt(filename, line.line, `duplicate YAML key: ${key}`);
    index += 1;
    result[key] = parseEntryValue(lines, index, indent, pair.value, filename, (next) => { index = next; });
  }
  return [result, index];
}

function parseEntryValue(lines, start, parentIndent, rawValue, filename, setIndex, allowContinuation = false) {
  const value = stripComment(rawValue.trim());
  if (/^[|>][+-]?[1-9]?$/u.test(value)) {
    const [parsed, next] = blockScalar(lines, start, parentIndent, value[0] === '>', value.includes('-') ? '-' : (value.includes('+') ? '+' : ''));
    setIndex(next);
    return parsed;
  }
  if (value !== '') {
    const parsed = parseScalar(value);
    const child = nextMeaningful(lines, start);
    if (!allowContinuation && child < lines.length && lines[child].indent > parentIndent) errorAt(filename, lines[child].line, 'a scalar YAML value cannot have nested entries');
    return parsed;
  }
  const child = nextMeaningful(lines, start);
  if (child < lines.length && lines[child].indent > parentIndent) {
    const [parsed, next] = parseBlock(lines, child, lines[child].indent, filename);
    setIndex(next);
    return parsed;
  }
  return null;
}

export function parseYamlDocument(source, filename = 'YAML') {
  const lines = tokenize(source, filename);
  const first = nextMeaningful(lines, 0);
  if (first >= lines.length) return null;
  if (lines[first].text === '---') {
    if (first !== 0) errorAt(filename, lines[first].line, 'a YAML document marker must be first');
    const last = nextMeaningful(lines, first + 1);
    if (last < lines.length && lines[last].text === '...') return parseYamlDocument(lines.slice(first + 1, last).map((line) => line.raw).join('\n'), filename);
  }
  const [value, next] = parseBlock(lines, first, lines[first].indent, filename);
  const trailing = nextMeaningful(lines, next);
  if (trailing < lines.length && lines[trailing].text !== '...') errorAt(filename, lines[trailing].line, 'unexpected YAML content');
  return value;
}

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new WikiCoreError(`${label} must be a YAML mapping`, { code: 'INVALID_WIKI_CONFIG' });
}

function assertRelativePath(value, label) {
  if (value === undefined) return;
  if (typeof value !== 'string' || !value.trim() || value.includes('\0') || value.startsWith('/') || /^[A-Za-z]:[\\/]/u.test(value)) {
    throw new WikiCoreError(`${label} must be a relative path`, { code: 'INVALID_WIKI_CONFIG' });
  }
  const normalized = value.replace(/\\/gu, '/');
  if (normalized === '..' || normalized.startsWith('../') || normalized.includes('/../')) throw new WikiCoreError(`${label} cannot escape the data directory`, { code: 'INVALID_WIKI_CONFIG' });
}

function assertNonEmptyString(value, label) {
  if (typeof value !== 'string') throw new WikiCoreError(`${label} must be a string`, { code: 'INVALID_WIKI_CONFIG' });
  if (!value.trim()) throw new WikiCoreError(`${label} must be non-empty`, { code: 'INVALID_WIKI_CONFIG' });
}

export function parseWikiConfig(source, filename = WIKI_CONFIG_FILENAME) {
  const config = parseYamlDocument(source, filename) ?? {};
  assertObject(config, `${filename} root`);
  if (config.version !== undefined && !((typeof config.version === 'number' && Number.isInteger(config.version)) || typeof config.version === 'string')) {
    throw new WikiCoreError(`${filename} version must be a scalar`, { code: 'INVALID_WIKI_CONFIG' });
  }
  if (config.content !== undefined) {
    assertObject(config.content, `${filename} content`);
    assertRelativePath(config.content.root, `${filename} content.root`);
    assertRelativePath(config.content.assets, `${filename} content.assets`);
    for (const key of ['repo', 'directories', 'tags']) {
      if (config.content[key] !== undefined) assertObject(config.content[key], `${filename} content.${key}`);
    }
  }
  if (config.site !== undefined) {
    assertObject(config.site, `${filename} site`);
    if (config.site.title !== undefined) assertNonEmptyString(config.site.title, `${filename} site.title`);
    if (config.site.description !== undefined) assertNonEmptyString(config.site.description, `${filename} site.description`);
  }
  if (config.publish !== undefined && typeof config.publish !== 'boolean') assertObject(config.publish, `${filename} publish`);
  const publish = typeof config.publish === 'object' && config.publish !== null ? config.publish : {};
  if (publish.mode !== undefined && typeof publish.mode !== 'string' && typeof publish.mode !== 'boolean') {
    throw new WikiCoreError(`${filename} publish.mode must be a string or boolean`, { code: 'INVALID_WIKI_CONFIG' });
  }
  if (typeof publish.mode === 'string' && !['auto', 'manual', 'off', 'disabled', 'false'].includes(publish.mode.toLowerCase())) {
    throw new WikiCoreError(`${filename} publish.mode has unsupported value: ${publish.mode}`, { code: 'INVALID_WIKI_CONFIG' });
  }
  if (publish.git !== undefined) assertObject(publish.git, `${filename} publish.git`);
  return config;
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

async function ensureDefaultConfig(config) {
  try {
    await writeFile(config, DEFAULT_WIKI_CONFIG, { encoding: 'utf8', flag: 'wx' });
    return true;
  } catch (error) {
    if (error?.code === 'EEXIST') return false;
    throw error;
  }
}

export async function validateWikiConfig(config) {
  const source = await readFile(config, 'utf8');
  parseWikiConfig(source, config);
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
    await validateWikiConfig(paths.config);
  } catch (error) {
    return { status: 'blocked', cloned, paths, configCreated, message: `${WIKI_CONFIG_FILENAME} is malformed: ${error.message}` };
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

