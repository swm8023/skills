import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';

import { ensureWikiState, readGitStatus, resolveWikiPaths, runGit } from '../scripts/wiki-state.mjs';
import { publishWiki } from '../scripts/publish-wiki.mjs';

const run = promisify(execFile);

async function fixture(t) {
  const home = await import('node:fs/promises').then(({ mkdtemp }) => mkdtemp(path.join(os.tmpdir(), 'knowledge-publish-home-')));
  t.after(() => import('node:fs/promises').then(({ rm }) => rm(home, { recursive: true, force: true })));
  const env = { USERPROFILE: home, HOME: home };
  const paths = resolveWikiPaths({ env });
  await mkdir(paths.data, { recursive: true });
  await run('git', ['init', '--initial-branch=main', paths.data]);
  await run('git', ['-C', paths.data, 'config', 'user.email', 'test@example.invalid']);
  await run('git', ['-C', paths.data, 'config', 'user.name', 'Knowledge Test']);
  await ensureWikiState({ env });
  await run('git', ['-C', paths.data, 'add', '--', 'wiki.config.yaml']);
  await run('git', ['-C', paths.data, 'commit', '-m', 'initialize Wiki']);
  return { env, paths };
}

async function callPublish(fixtureValue, options = {}) {
  const calls = [];
  const events = [];
  const ensureQuartz = options.ensureQuartz || (async (quartzOptions) => {
    events.push({ type: 'quartz', options: quartzOptions });
    return { status: 'ready', version: 'test' };
  });
  const runGitFn = options.runGitFn || (async (args, runOptions) => {
    events.push({ type: 'git', args });
    return runGit(args, runOptions);
  });
  const readGitStatusFn = options.readGitStatusFn || (async (data, statusOptions) => {
    events.push({ type: 'read-status' });
    return readGitStatus(data, statusOptions);
  });
  const result = await publishWiki({
    env: fixtureValue.env,
    requestedPaths: ['content/repo/note.md'],
    push: false,
    pull: false,
    invokeWheelmaker: async (args) => { calls.push(args); },
    ensureQuartz,
    runGitFn,
    readGitStatusFn,
    ...options,
  });
  return { result, calls, events };
}

test('stages and commits only the approved paths before invoking WheelMaker publish', async (t) => {
  const value = await fixture(t);
  const note = path.join(value.paths.data, 'content', 'repo', 'note.md');
  await mkdir(path.dirname(note), { recursive: true });
  await writeFile(note, '---\ntitle: Note\n---\n\nbody\n');

  const { result, calls, events } = await callPublish(value);
  assert.equal(result.status, 'published', result.message);
  assert.deepEqual(calls, [['wiki', 'publish']]);
  const quartzIndex = events.findIndex((event) => event.type === 'quartz');
  const addIndex = events.findIndex((event) => event.type === 'git' && event.args.includes('add'));
  const readIndex = events.findIndex((event) => event.type === 'read-status');
  assert.equal(events[quartzIndex].options.refresh, false);
  assert.equal(readIndex >= 0 && readIndex < quartzIndex, true);
  assert.equal(quartzIndex >= 0 && quartzIndex < addIndex, true);
  assert.deepEqual(await readGitStatus(value.paths.data, { env: value.env }), []);
  assert.equal((await run('git', ['-C', value.paths.data, 'show', '--stat', '--oneline', '-1'])).stdout.includes('note.md'), true);
});

test('does not create Git or WheelMaker side effects when publishing is disabled', async (t) => {
  const value = await fixture(t);
  await writeFile(value.paths.config, `version: 1
content:
  root: content
  assets: content/assets
  directories:
    mode: ai
publish:
  mode: off
`);
  const note = path.join(value.paths.data, 'content', 'repo', 'note.md');
  await mkdir(path.dirname(note), { recursive: true });
  await writeFile(note, 'note\n');

  const { result, calls, events } = await callPublish(value);
  assert.equal(result.status, 'skipped', result.message);
  assert.equal(result.mode, 'off');
  assert.deepEqual(calls, []);
  assert.equal(events.some((event) => event.type === 'quartz'), false);
  assert.equal((await readGitStatus(value.paths.data, { env: value.env })).some((entry) => entry.relativePath === 'content/repo/note.md'), true);
});

test('stops when an existing staged entry is present', async (t) => {
  const value = await fixture(t);
  const note = path.join(value.paths.data, 'content', 'repo', 'note.md');
  await mkdir(path.dirname(note), { recursive: true });
  await writeFile(note, 'note\n');
  await run('git', ['-C', value.paths.data, 'add', '--', 'content/repo/note.md']);

  const { result, calls } = await callPublish(value);
  assert.equal(result.status, 'blocked');
  assert.match(result.message, /staged/u);
  assert.deepEqual(calls, []);
  assert.equal((await readGitStatus(value.paths.data, { env: value.env })).length, 1);
});

test('stops when a dirty data path is outside the approved path list', async (t) => {
  const value = await fixture(t);
  const note = path.join(value.paths.data, 'content', 'repo', 'note.md');
  const unrelated = path.join(value.paths.data, 'content', 'other', 'unrelated.md');
  await mkdir(path.dirname(note), { recursive: true });
  await mkdir(path.dirname(unrelated), { recursive: true });
  await writeFile(note, 'note\n');
  await writeFile(unrelated, 'unrelated\n');

  const { result, calls } = await callPublish(value);
  assert.equal(result.status, 'blocked');
  assert.match(result.message, /outside the approved path list/u);
  assert.deepEqual(calls, []);
  assert.equal(await readFile(unrelated, 'utf8'), 'unrelated\n');
});

test('rejects directory pathspecs instead of staging every file below them', async (t) => {
  const value = await fixture(t);
  const first = path.join(value.paths.data, 'content', 'repo', 'first.md');
  const second = path.join(value.paths.data, 'content', 'repo', 'second.md');
  await mkdir(path.dirname(first), { recursive: true });
  await writeFile(first, 'first\n');
  await writeFile(second, 'second\n');

  const { result, calls } = await callPublish(value, { requestedPaths: ['content/repo'] });
  assert.equal(result.status, 'blocked');
  assert.match(result.message, /outside|exact|directory/iu);
  assert.deepEqual(calls, []);
  assert.equal((await readGitStatus(value.paths.data, { env: value.env })).length, 2);
});

test('refuses a force-push request', async (t) => {
  const value = await fixture(t);
  const { result, calls } = await callPublish(value, { force: true });
  assert.equal(result.status, 'blocked');
  assert.match(result.message, /force/iu);
  assert.deepEqual(calls, []);
});

test('checks Git author identity before staging approved paths', async (t) => {
  const value = await fixture(t);
  const note = path.join(value.paths.data, 'content', 'repo', 'note.md');
  await mkdir(path.dirname(note), { recursive: true });
  await writeFile(note, 'note\n');
  await run('git', ['-C', value.paths.data, 'config', '--local', '--unset', 'user.name']);
  await run('git', ['-C', value.paths.data, 'config', '--local', '--unset', 'user.email']);
  value.env.GIT_CONFIG_GLOBAL = path.join(value.env.HOME, 'missing-global-config');
  value.env.GIT_CONFIG_NOSYSTEM = '1';

  const { result, calls, events } = await callPublish(value);
  assert.equal(result.status, 'blocked');
  assert.match(result.message, /user\.name|user\.email|identity/iu);
  assert.deepEqual(calls, []);
  assert.equal(events.some((event) => event.type === 'quartz'), false);
  assert.deepEqual(await readGitStatus(value.paths.data, { env: value.env }), [
    { status: '??', relativePath: 'content/repo/note.md', staged: false, workingTree: false },
  ]);
});

test('blocks before the first Git write when Quartz preflight is not ready', async (t) => {
  const value = await fixture(t);
  const note = path.join(value.paths.data, 'content', 'repo', 'note.md');
  await mkdir(path.dirname(note), { recursive: true });
  await writeFile(note, 'note\n');

  const quartzEvents = [];
  const { result, calls, events } = await callPublish(value, {
    ensureQuartz: async (options) => {
      quartzEvents.push(options);
      return { status: 'blocked', message: 'Quartz runtime is unavailable' };
    },
  });
  assert.equal(result.status, 'blocked');
  assert.match(result.message, /Quartz runtime is unavailable/u);
  assert.deepEqual(calls, []);
  assert.equal(quartzEvents[0].refresh, false);
  assert.equal(events.some((event) => event.type === 'git' && ['add', 'commit', 'pull', 'push'].some((command) => event.args.includes(command))), false);
  assert.equal((await readGitStatus(value.paths.data, { env: value.env })).some((entry) => entry.relativePath === 'content/repo/note.md'), true);
});

test('blocks before Git writes when normal Quartz readiness rejects a nonempty runtime', async (t) => {
  const value = await fixture(t);
  const note = path.join(value.paths.data, 'content', 'repo', 'note.md');
  await mkdir(path.dirname(note), { recursive: true });
  await writeFile(note, 'note\n');
  await mkdir(value.paths.quartz, { recursive: true });
  await writeFile(path.join(value.paths.quartz, 'user-owned.txt'), 'keep me\n');

  const events = [];
  const calls = [];
  const result = await publishWiki({
    env: value.env,
    requestedPaths: ['content/repo/note.md'],
    push: false,
    pull: false,
    runGitFn: async (args, runOptions) => {
      events.push({ type: 'git', args });
      return runGit(args, runOptions);
    },
    invokeWheelmaker: async (args) => { calls.push(args); },
  });
  assert.equal(result.status, 'blocked');
  assert.match(result.message, /nonempty|overwrite|expected/iu);
  assert.deepEqual(calls, []);
  assert.equal(events.some((event) => ['add', 'commit', 'pull', 'push'].some((command) => event.args.includes(command))), false);
  assert.equal((await readGitStatus(value.paths.data, { env: value.env })).some((entry) => entry.relativePath === 'content/repo/note.md'), true);
});

test('CLI parser forwards repeated approved paths to publishWiki', async () => {
  const module = await import('../scripts/publish-wiki.mjs');
  assert.equal(typeof module.parseCli, 'function');
  assert.deepEqual(module.parseCli([
    '--paths', 'wiki.config.yaml',
    '--paths', 'content/repo/note.md',
    '--message', 'knowledge: test',
  ]), {
    requestedPaths: ['wiki.config.yaml', 'content/repo/note.md'],
    message: 'knowledge: test',
  });
});
