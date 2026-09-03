import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { ensureQuartz } from '../scripts/ensure-quartz.mjs';
import { resolveWikiPaths } from '../scripts/wiki-state.mjs';

async function makeHome(t) {
  const home = await import('node:fs/promises').then(({ mkdtemp }) => mkdtemp(path.join(os.tmpdir(), 'knowledge-quartz-home-')));
  t.after(() => import('node:fs/promises').then(({ rm }) => rm(home, { recursive: true, force: true })));
  return home;
}

async function fakeInstaller(stage) {
  await mkdir(path.join(stage, 'quartz'), { recursive: true });
  await mkdir(path.join(stage, 'node_modules'), { recursive: true });
  await writeFile(path.join(stage, 'quartz', 'bootstrap-cli.mjs'), 'export {};\n');
}

test('installs the pinned Quartz runtime atomically into the private Wiki root', async (t) => {
  const home = await makeHome(t);
  const env = { USERPROFILE: home, HOME: home };
  const result = await ensureQuartz({ env, installer: fakeInstaller });
  const paths = resolveWikiPaths({ env });
  assert.equal(result.status, 'ready');
  assert.equal(result.version, 'v4.5.2');
  assert.equal(await stat(path.join(paths.quartz, 'quartz', 'bootstrap-cli.mjs')).then((info) => info.isFile()), true);
  assert.equal(await stat(path.join(paths.quartz, 'quartz.config.ts')).then((info) => info.isFile()), true);
  assert.equal((await readdir(paths.wiki)).some((entry) => entry.startsWith('.quartz-stage-')), false);
});

test('refuses an existing runtime whose release metadata is not the pinned version', async (t) => {
  const home = await makeHome(t);
  const env = { USERPROFILE: home, HOME: home };
  const paths = resolveWikiPaths({ env });
  await mkdir(path.join(paths.quartz, 'quartz'), { recursive: true });
  await mkdir(path.join(paths.quartz, 'node_modules'), { recursive: true });
  await writeFile(path.join(paths.quartz, 'quartz', 'bootstrap-cli.mjs'), 'export {};\n');
  await writeFile(path.join(paths.quartz, 'quartz.config.ts'), 'export default {};\n');
  await writeFile(path.join(paths.quartz, 'quartz.layout.ts'), 'export default {};\n');
  await writeFile(path.join(paths.quartz, '.wheelmaker-quartz-release.json'), JSON.stringify({ version: 'v4.5.1', commit: 'wrong' }));

  const result = await ensureQuartz({ env, installer: fakeInstaller });
  assert.equal(result.status, 'blocked');
  assert.match(result.message, /pinned|version|metadata/iu);
});

test('refuses to overwrite a nonempty unexpected runtime directory', async (t) => {
  const home = await makeHome(t);
  const env = { USERPROFILE: home, HOME: home };
  const paths = resolveWikiPaths({ env });
  await mkdir(paths.quartz, { recursive: true });
  const marker = path.join(paths.quartz, 'user-owned.txt');
  await writeFile(marker, 'keep me\n');
  const result = await ensureQuartz({ env, installer: fakeInstaller });
  assert.equal(result.status, 'blocked');
  assert.match(result.message, /unexpected|overwrite/u);
  assert.equal(await readFile(marker, 'utf8'), 'keep me\n');
});
