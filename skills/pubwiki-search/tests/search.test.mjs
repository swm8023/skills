import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';

import { searchKnowledge } from '../scripts/search.mjs';
import { dataviewQuery } from '../scripts/dataview.mjs';
import { resolveWikiPaths } from '../scripts/wiki-state.mjs';

const run = promisify(execFile);

async function fixture(t) {
  const home = await import('node:fs/promises').then(({ mkdtemp }) => mkdtemp(path.join(os.tmpdir(), 'pubwiki-search-query-')));
  t.after(() => import('node:fs/promises').then(({ rm }) => rm(home, { recursive: true, force: true })));
  const env = { USERPROFILE: home, HOME: home };
  const paths = resolveWikiPaths({ env });
  await mkdir(paths.data, { recursive: true });
  await run('git', ['init', '--initial-branch=main', paths.data]);
  await run('git', ['-C', paths.data, 'config', 'user.email', 'test@example.invalid']);
  await run('git', ['-C', paths.data, 'config', 'user.name', 'Knowledge Test']);
  return { env, paths };
}

async function note(paths, relativePath, body) {
  const filename = path.join(paths.data, relativePath.replace(/\//gu, path.sep));
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, body);
}

async function sourceSnapshot(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const snapshot = {};
  for (const entry of entries) {
    if (entry.name === '.git') continue;
    const filename = path.join(directory, entry.name);
    snapshot[entry.name] = entry.isDirectory()
      ? await sourceSnapshot(filename)
      : (await readFile(filename)).toString('base64');
  }
  return snapshot;
}

for (const mode of ['native', 'fallback', 'dataview']) {
  test(`${mode} lookup preserves source files and Git state without a config`, async (t) => {
    const { env, paths } = await fixture(t);
    await note(paths, 'content/repo/note.md', '---\ntitle: Readonly\n---\n\nSearchable knowledge\n');
    await run('git', ['-C', paths.data, 'add', 'content/repo/note.md']);
    await note(paths, 'content/repo/note.md', '---\ntitle: Readonly\n---\n\nSearchable updated knowledge\n');
    const before = await sourceSnapshot(paths.data);
    const gitBefore = await run('git', ['-C', paths.data, 'status', '--porcelain=v1']);
    if (mode === 'dataview') {
      const result = await dataviewQuery({ env, sql: 'SELECT title FROM notes' });
      assert.equal(result.rows[0].title, 'Readonly');
    } else {
      const result = await searchKnowledge({
        env,
        query: 'Readonly',
        runNative: async () => mode === 'native'
          ? { available: true, results: [{ path: 'content/repo/note.md' }] }
          : { available: false },
      });
      assert.equal(result.mode, mode === 'native' ? 'obsidian' : 'lexical');
      assert.equal(result.results[0].path, 'content/repo/note.md');
    }
    assert.deepEqual(await sourceSnapshot(paths.data), before);
    assert.equal((await run('git', ['-C', paths.data, 'status', '--porcelain=v1'])).stdout, gitBefore.stdout);
    await assert.rejects(() => stat(paths.config), { code: 'ENOENT' });
    await assert.rejects(() => stat(paths.assets), { code: 'ENOENT' });
    if (mode !== 'native') assert.ok((await stat(paths.manifest)).isFile());
  });
}

test('searching an empty Git Vault does not create content directories', async (t) => {
  const { env, paths } = await fixture(t);
  const result = await searchKnowledge({ env, query: 'missing', structured: true });
  assert.equal(result.mode, 'lexical');
  assert.deepEqual(result.results, []);
  assert.deepEqual(await sourceSnapshot(paths.data), {});
});

test('search does not clone or initialize an absent Vault even when passed a Git URL', async (t) => {
  const { paths } = await fixture(t);
  const targetHome = path.join(paths.home, 'uninitialized');
  const env = { HOME: targetHome, USERPROFILE: targetHome };
  const result = await searchKnowledge({ env, gitUrl: paths.data, query: 'missing', structured: true });
  assert.equal(result.mode, 'unavailable');
  await assert.rejects(() => stat(resolveWikiPaths({ env }).wiki), { code: 'ENOENT' });
});

test('uses Obsidian first and does not build the fallback index after a valid native response', async (t) => {
  const value = await fixture(t);
  await note(value.paths, 'content/repo/native.md', 'native\n');
  let received;
  const result = await searchKnowledge({
    query: 'native',
    env: value.env,
    runNative: async (query, options) => {
      received = { query, data: options.data };
      return { available: true, results: [{ path: 'content/repo/native.md', matches: [{ line: 1 }] }] };
    },
  });
  assert.equal(result.mode, 'obsidian');
  assert.deepEqual(result.results[0].matches, [{ line: 1 }]);
  assert.deepEqual(received, { query: 'native', data: value.paths.data });
  await assert.rejects(() => import('node:fs/promises').then(({ stat }) => stat(value.paths.manifest)), { code: 'ENOENT' });
});

test('falls back to a fresh local lexical index for unavailable or structured native search', async (t) => {
  const value = await fixture(t);
  await note(value.paths, 'content/repo/normal.md', '---\ntitle: Quartz Guide\ntags: [system/runtime]\nstatus: open\n---\n\nQuartz local search #docs\n');
  await note(value.paths, 'content/repo/draft.md', '---\ntitle: Private Draft\ndraft: true\n---\n\nQuartz draft\n');
  await note(value.paths, 'content/assets/ignored.md', 'Quartz ignored\n');
  await note(value.paths, 'content/.obsidian/ignored.md', 'Quartz ignored\n');
  let nativeCalls = 0;
  const runNative = async () => {
    nativeCalls += 1;
    return { available: false, reason: 'fixture unavailable' };
  };
  const result = await searchKnowledge({ query: 'Quartz', env: value.env, runNative });
  assert.equal(result.mode, 'lexical');
  assert.equal(result.degraded, true);
  assert.equal(nativeCalls, 1);
  assert.deepEqual(result.results.map((item) => item.path), ['content/repo/normal.md', 'content/repo/draft.md']);
  assert.equal(result.results.find((item) => item.path.endsWith('/draft.md')).draft, true);
  assert.match(result.results[0].snippet, /Quartz/u);

  const structured = await searchKnowledge({ query: 'tag:system/runtime', structured: true, env: value.env, runNative });
  assert.equal(structured.mode, 'lexical');
  assert.deepEqual(structured.results.map((item) => item.path), ['content/repo/normal.md']);
  assert.equal(nativeCalls, 1);

  const property = await searchKnowledge({ query: 'status:open', structured: true, env: value.env, runNative });
  assert.equal(property.mode, 'lexical');
  assert.deepEqual(property.results.map((item) => item.path), ['content/repo/normal.md']);
});

test('returns the previous local results when refreshing the index fails', async (t) => {
  const value = await fixture(t);
  const filename = path.join(value.paths.data, 'content', 'repo', 'normal.md');
  await note(value.paths, 'content/repo/normal.md', '---\ntitle: Stable Note\n---\n\nStable body\n');
  const first = await searchKnowledge({ query: 'Stable', structured: true, env: value.env });
  assert.equal(first.mode, 'lexical');
  await writeFile(filename, '---\ntitle: [\n---\n\nBroken\n');

  const stale = await searchKnowledge({ query: 'Stable', structured: true, env: value.env });
  assert.equal(stale.mode, 'lexical');
  assert.equal(stale.stale, true);
  assert.match(stale.warning, /previous index|refreshed/iu);
  assert.deepEqual(stale.results.map((item) => item.path), ['content/repo/normal.md']);
});
