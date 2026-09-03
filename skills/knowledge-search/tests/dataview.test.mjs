import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';

import { dataviewQuery } from '../scripts/dataview.mjs';
import { resolveWikiPaths } from '../scripts/wiki-state.mjs';

const run = promisify(execFile);

async function fixture(t) {
  const home = await import('node:fs/promises').then(({ mkdtemp }) => mkdtemp(path.join(os.tmpdir(), 'knowledge-dataview-')));
  t.after(() => import('node:fs/promises').then(({ rm }) => rm(home, { recursive: true, force: true })));
  const env = { USERPROFILE: home, HOME: home };
  const paths = resolveWikiPaths({ env });
  await mkdir(paths.data, { recursive: true });
  await run('git', ['init', '--initial-branch=main', paths.data]);
  await run('git', ['-C', paths.data, 'config', 'user.email', 'test@example.invalid']);
  await run('git', ['-C', paths.data, 'config', 'user.name', 'Knowledge Test']);
  await mkdir(path.join(paths.data, 'content', 'repo'), { recursive: true });
  await writeFile(path.join(paths.data, 'content', 'repo', 'draft.md'), '---\ntitle: Draft\ndraft: true\n---\n\nDraft\n');
  return { env, paths };
}

test('runs read-only Dataview-style SQL against the fresh fixed index', async (t) => {
  const value = await fixture(t);
  const result = await dataviewQuery({
    sql: 'SELECT path, title, draft FROM notes WHERE draft = 1 ORDER BY path',
    env: value.env,
  });
  assert.equal(result.mode, 'sqlite');
  assert.deepEqual(result.rows, [{ path: 'content/repo/draft.md', title: 'Draft', draft: 1 }]);
});

test('does not allow a Dataview query to mutate the local index', async (t) => {
  const value = await fixture(t);
  await assert.rejects(
    () => dataviewQuery({ sql: 'DELETE FROM notes', env: value.env }),
    /read-only/u,
  );
});

