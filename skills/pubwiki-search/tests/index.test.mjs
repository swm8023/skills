import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';

import { atomicReplace, ensureFresh, readIndexRows, sqliteSupported } from '../scripts/index.mjs';
import { resolveWikiPaths } from '../scripts/wiki-state.mjs';

const run = promisify(execFile);

async function fixture(t) {
  const home = await import('node:fs/promises').then(({ mkdtemp }) => mkdtemp(path.join(os.tmpdir(), 'pubwiki-search-index-')));
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

test('ensureFresh creates a private index and scans only allowed Markdown content', async (t) => {
  const value = await fixture(t);
  await note(value.paths, 'content/repo/one.md', '---\ntitle: One\ntags: [system]\n---\n\nOne body #runtime\n');
  await note(value.paths, 'content/repo/nested/two.md', '---\ntitle: Two\ndraft: true\n---\n\nTwo body\n');
  await note(value.paths, 'content/.obsidian/private.md', 'private\n');
  await note(value.paths, 'content/assets/ignored.md', 'asset\n');
  await note(value.paths, 'content/repo/readme.txt', 'not Markdown\n');

  const result = await ensureFresh({ env: value.env });
  const manifest = JSON.parse(await readFile(result.paths.manifest, 'utf8'));
  assert.equal(result.status, 'ready');
  assert.equal(await import('../scripts/index.mjs').then(({ sqliteSupported: supported }) => supported()), sqliteSupported());
  assert.equal(await import('node:fs/promises').then(({ stat }) => stat(result.paths.database).then((info) => info.isFile())), true);
  assert.deepEqual(manifest.files.map((entry) => entry.relativePath), [
    'content/repo/nested/two.md',
    'content/repo/one.md',
  ]);
  const rows = await readIndexRows({ env: value.env });
  assert.equal(rows.length, 2);
  assert.equal(rows.find((row) => row.title === 'Two').draft, true);
  assert.deepEqual(rows.find((row) => row.title === 'One').tags, ['system', 'runtime']);
});

test('ensureFresh handles add, change, delete, rename, version changes, and concurrent callers', async (t) => {
  const value = await fixture(t);
  await note(value.paths, 'content/repo/one.md', '---\ntitle: One\n---\n\nold\n');
  const first = await ensureFresh({ env: value.env });
  await note(value.paths, 'content/repo/one.md', '---\ntitle: One Updated\n---\n\nnew\n');
  await note(value.paths, 'content/repo/two.md', '---\ntitle: Two\n---\n\nadded\n');
  await import('node:fs/promises').then(({ rm }) => rm(path.join(value.paths.data, 'content/repo/one.md')));
  await note(value.paths, 'content/repo/renamed.md', '---\ntitle: Renamed\n---\n\nrenamed\n');
  const second = await ensureFresh({ env: value.env });
  const [concurrent] = await Promise.all([
    ensureFresh({ env: value.env }),
    ensureFresh({ env: value.env }),
  ]);
  assert.equal(second.status, 'ready');
  assert.equal(concurrent.status, 'ready');
  assert.equal(first.manifest.parserVersion, second.manifest.parserVersion);
  assert.ok(second.changedPaths.deleted.includes('content/repo/one.md'));
  assert.ok(second.changedPaths.changed.includes('content/repo/two.md'));
  assert.ok(second.changedPaths.changed.includes('content/repo/renamed.md'));
  const versionChanged = await ensureFresh({ env: value.env, parserVersion: 'test-parser-v2' });
  assert.equal(versionChanged.rebuilt, true);
  const rows = await readIndexRows({ env: value.env });
  assert.deepEqual(rows.map((row) => row.path), ['content/repo/renamed.md', 'content/repo/two.md']);
});

test('retains the previous valid manifest and rows when an index update fails', async (t) => {
  const value = await fixture(t);
  await note(value.paths, 'content/repo/one.md', '---\ntitle: One\n---\n\nold\n');
  const first = await ensureFresh({ env: value.env });
  const previousManifest = await readFile(first.paths.manifest, 'utf8');
  await note(value.paths, 'content/repo/one.md', '---\ntitle: One\n---\n\nnew\n');
  await assert.rejects(
    () => ensureFresh({
      env: value.env,
      atomicReplaceFn: async (filename) => {
        if (filename === value.paths.manifest) throw new Error('injected manifest failure');
        return atomicReplace(filename, '');
      },
    }),
    /injected manifest failure/u,
  );
  assert.equal(await readFile(value.paths.manifest, 'utf8'), previousManifest);
  assert.equal((await readIndexRows({ env: value.env }))[0].body.includes('old'), true);
});

test('rebuilds when an old fallback database file is present on a SQLite runtime', async (t) => {
  const value = await fixture(t);
  await note(value.paths, 'content/repo/one.md', '---\ntitle: One\n---\n\nnew\n');
  await mkdir(value.paths.indexDir, { recursive: true });
  await writeFile(value.paths.database, JSON.stringify({ schema: 1, backend: 'lexical-json', notes: {} }));
  await writeFile(value.paths.manifest, JSON.stringify({
    schema: 1,
    sourceRoot: value.paths.data,
    parserVersion: 'pubwiki-search-parser-1',
    indexVersion: 'pubwiki-search-index-1',
    modelVersion: 'lexical-only-1',
    backend: 'lexical-json',
    files: [],
  }));

  const result = await ensureFresh({ env: value.env });
  assert.equal(result.status, 'ready');
  assert.equal((await readIndexRows({ env: value.env }))[0].title, 'One');
});
