import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';

import { searchKnowledge } from '../scripts/search.mjs';
import { resolveWikiPaths } from '../scripts/wiki-state.mjs';

const run = promisify(execFile);

async function fixture(t) {
  const home = await import('node:fs/promises').then(({ mkdtemp }) => mkdtemp(path.join(os.tmpdir(), 'knowledge-search-query-')));
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
  await note(value.paths, 'content/repo/normal.md', '---\ntitle: Quartz Guide\ntags: [system/runtime]\n---\n\nQuartz local search #docs\n');
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
});
