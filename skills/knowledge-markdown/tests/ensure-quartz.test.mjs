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
  await writeFile(path.join(stage, 'quartz.ts'), 'export default {};\n');
  await writeFile(path.join(stage, 'quartz.config.yaml'), 'configuration: {}\nplugins: []\n');
  await writeFile(path.join(stage, 'quartz.lock.json'), '{}\n');
  for (const relativePath of [
    'quartz.lock.json',
    'quartz/wheelmaker-home/package.json',
    'quartz/wheelmaker-home/index.mjs',
    'quartz/wheelmaker-sidebar/package.json',
    'quartz/wheelmaker-sidebar/index.mjs',
    'quartz/wheelmaker-sidebar/components.mjs',
    'quartz/wheelmaker-tags/package.json',
    'quartz/wheelmaker-tags/index.mjs',
    'quartz/wheelmaker-tags/components.mjs',
  ]) {
    await mkdir(path.dirname(path.join(stage, relativePath)), { recursive: true });
    await writeFile(path.join(stage, relativePath), `${relativePath}\n`);
  }
}

async function fakePluginInstaller(stage) {
  const lock = JSON.parse(await readFile(path.join(stage, 'quartz.lock.json'), 'utf8'));
  for (const [name, entry] of Object.entries(lock.plugins || {})) {
    if (entry?.commit === 'local') continue;
    await mkdir(path.join(stage, '.quartz', 'plugins', name, 'dist'), { recursive: true });
    await writeFile(path.join(stage, '.quartz', 'plugins', name, 'package.json'), '{}\n');
    await writeFile(path.join(stage, '.quartz', 'plugins', name, 'dist', 'index.d.ts'), 'export {}\n');
    await writeFile(path.join(stage, '.quartz', 'plugins', name, 'dist', 'index.js'), 'export {}\n');
  }
}

test('installs the pinned Quartz runtime atomically into the private Wiki root', async (t) => {
  const home = await makeHome(t);
  const env = { USERPROFILE: home, HOME: home };
  const result = await ensureQuartz({ env, installer: fakeInstaller, pluginInstaller: fakePluginInstaller });
  const paths = resolveWikiPaths({ env });
  assert.equal(result.status, 'ready', result.message);
  assert.equal(result.version, 'v5.0.0');
  assert.equal(await stat(path.join(paths.quartz, 'quartz', 'bootstrap-cli.mjs')).then((info) => info.isFile()), true);
  assert.equal(await stat(path.join(paths.quartz, 'quartz.config.yaml')).then((info) => info.isFile()), true);
  assert.equal(await stat(path.join(paths.quartz, 'quartz.ts')).then((info) => info.isFile()), true);
  assert.equal(await stat(path.join(paths.quartz, '.quartz', 'plugins', 'wheelmaker-home')).then((info) => info.isDirectory()), true);
  assert.equal((await readdir(paths.wiki)).some((entry) => entry.startsWith('.quartz-stage-')), false);
});

test('refuses an existing runtime whose release metadata is not the pinned version', async (t) => {
  const home = await makeHome(t);
  const env = { USERPROFILE: home, HOME: home };
  const paths = resolveWikiPaths({ env });
  await mkdir(path.join(paths.quartz, 'quartz'), { recursive: true });
  await mkdir(path.join(paths.quartz, 'node_modules'), { recursive: true });
  await writeFile(path.join(paths.quartz, 'quartz', 'bootstrap-cli.mjs'), 'export {};\n');
  await writeFile(path.join(paths.quartz, 'quartz.config.yaml'), 'configuration: {}\nplugins: []\n');
  await writeFile(path.join(paths.quartz, 'quartz.ts'), 'export default {};\n');
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
