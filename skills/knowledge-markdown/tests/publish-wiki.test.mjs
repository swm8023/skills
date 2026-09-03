import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';

import { ensureWikiState, readGitStatus, resolveWikiPaths } from '../scripts/wiki-state.mjs';
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
  await run('git', ['-C', paths.data, 'add', '--', 'knowledge.yaml']);
  await run('git', ['-C', paths.data, 'commit', '-m', 'initialize Wiki']);
  return { env, paths };
}

async function callPublish(fixtureValue, options = {}) {
  const calls = [];
  const result = await publishWiki({
    env: fixtureValue.env,
    requestedPaths: ['content/repo/note.md'],
    push: false,
    pull: false,
    invokeWheelmaker: async (args) => { calls.push(args); },
    ...options,
  });
  return { result, calls };
}

test('stages and commits only the approved paths before invoking WheelMaker publish', async (t) => {
  const value = await fixture(t);
  const note = path.join(value.paths.data, 'content', 'repo', 'note.md');
  await mkdir(path.dirname(note), { recursive: true });
  await writeFile(note, '---\ntitle: Note\n---\n\nbody\n');

  const { result, calls } = await callPublish(value);
  assert.equal(result.status, 'published', result.message);
  assert.deepEqual(calls, [['wiki', 'publish']]);
  assert.deepEqual(await readGitStatus(value.paths.data, { env: value.env }), []);
  assert.equal((await run('git', ['-C', value.paths.data, 'show', '--stat', '--oneline', '-1'])).stdout.includes('note.md'), true);
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

test('refuses a force-push request', async (t) => {
  const value = await fixture(t);
  const { result, calls } = await callPublish(value, { force: true });
  assert.equal(result.status, 'blocked');
  assert.match(result.message, /force/iu);
  assert.deepEqual(calls, []);
});
