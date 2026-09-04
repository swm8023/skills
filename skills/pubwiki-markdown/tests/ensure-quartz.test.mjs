import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { ensureQuartz, QUARTZ_CLONE_ARGS } from '../scripts/ensure-quartz.mjs';
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
    'quartz/wheelmaker/package.json',
    'quartz/wheelmaker/index.mjs',
    'quartz/wheelmaker/home.mjs',
    'quartz/wheelmaker/components.mjs',
    'quartz/wheelmaker/tags.mjs',
  ]) {
    await mkdir(path.dirname(path.join(stage, relativePath)), { recursive: true });
    await writeFile(path.join(stage, relativePath), `${relativePath}\n`);
  }
}

async function fakePluginInstaller(stage) {
  const lock = JSON.parse(await readFile(path.join(stage, 'quartz.lock.json'), 'utf8'));
  await mkdir(path.join(stage, '.quartz', 'plugins'), { recursive: true });
  for (const [name, entry] of Object.entries(lock.plugins || {})) {
    if (entry?.commit === 'local') continue;
    await mkdir(path.join(stage, '.quartz', 'plugins', name, 'dist'), { recursive: true });
    await writeFile(path.join(stage, '.quartz', 'plugins', name, 'package.json'), '{}\n');
    await writeFile(path.join(stage, '.quartz', 'plugins', name, 'dist', 'index.d.ts'), 'export {}\n');
    await writeFile(path.join(stage, '.quartz', 'plugins', name, 'dist', 'index.js'), 'export {}\n');
  }
  await writeFile(path.join(stage, '.quartz', 'plugins', 'index.ts'), 'export {}\n');
}

async function exists(filename) {
  try { await stat(filename); return true; } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

async function assertNoTransactionArtifacts(paths) {
  const entries = await readdir(paths.wiki);
  assert.equal(entries.some((entry) => entry.startsWith('.quartz-stage-')), false);
  assert.equal(entries.some((entry) => entry.includes('.previous-')), false);
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
  assert.equal(await stat(path.join(paths.quartz, '.quartz', 'plugins', 'wheelmaker')).then((info) => info.isDirectory()), true);
  assert.match(await readFile(path.join(paths.quartz, '.quartz', 'plugins', 'index.ts'), 'utf8'), /CustomOgImagesEmitterName/u);
  await assertNoTransactionArtifacts(paths);
});

test('uses a single-branch shallow clone for the pinned Quartz source', () => {
  assert.deepEqual(QUARTZ_CLONE_ARGS, ['clone', '--branch', 'v5.0.0', '--depth', '1', '--single-branch']);
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

test('failed initial installation leaves no partial runtime or transaction artifacts', async (t) => {
  const home = await makeHome(t);
  const env = { USERPROFILE: home, HOME: home };
  const paths = resolveWikiPaths({ env });
  const result = await ensureQuartz({
    env,
    installer: async (stage) => {
      await writeFile(path.join(stage, 'partial-download.txt'), 'partial\n');
      throw new Error('installer failed');
    },
    pluginInstaller: fakePluginInstaller,
  });
  assert.equal(result.status, 'blocked');
  assert.match(result.message, /installer failed/u);
  assert.equal(await exists(paths.quartz), false);
  await assertNoTransactionArtifacts(paths);
});

test('failed plugin installation leaves an existing empty runtime untouched', async (t) => {
  const home = await makeHome(t);
  const env = { USERPROFILE: home, HOME: home };
  const paths = resolveWikiPaths({ env });
  await mkdir(paths.quartz, { recursive: true });
  const result = await ensureQuartz({
    env,
    installer: fakeInstaller,
    pluginInstaller: async (stage) => {
      await writeFile(path.join(stage, 'partial-plugin.txt'), 'partial\n');
      throw new Error('plugin restore failed');
    },
  });
  assert.equal(result.status, 'blocked');
  assert.match(result.message, /plugin restore failed/u);
  assert.equal(await readdir(paths.quartz).then((entries) => entries.length), 0);
  await assertNoTransactionArtifacts(paths);
});

test('failed refresh preserves the previously active runtime', async (t) => {
  const home = await makeHome(t);
  const env = { USERPROFILE: home, HOME: home };
  const paths = resolveWikiPaths({ env });
  const installed = await ensureQuartz({ env, installer: fakeInstaller, pluginInstaller: fakePluginInstaller });
  assert.equal(installed.status, 'ready', installed.message);
  const marker = path.join(paths.quartz, 'keep-during-refresh.txt');
  await writeFile(marker, 'keep me\n');

  const result = await ensureQuartz({
    env,
    refresh: true,
    installer: async () => { throw new Error('refresh download failed'); },
    pluginInstaller: fakePluginInstaller,
  });
  assert.equal(result.status, 'blocked');
  assert.match(result.message, /refresh download failed/u);
  assert.equal(await readFile(marker, 'utf8'), 'keep me\n');
  await assertNoTransactionArtifacts(paths);
});

test('activation failure restores the previously active runtime', async (t) => {
  const home = await makeHome(t);
  const env = { USERPROFILE: home, HOME: home };
  const paths = resolveWikiPaths({ env });
  const installed = await ensureQuartz({ env, installer: fakeInstaller, pluginInstaller: fakePluginInstaller });
  assert.equal(installed.status, 'ready', installed.message);
  const marker = path.join(paths.quartz, 'keep-after-activation-failure.txt');
  await writeFile(marker, 'keep me\n');

  const result = await ensureQuartz({
    env,
    refresh: true,
    installer: fakeInstaller,
    pluginInstaller: fakePluginInstaller,
    renameFn: async (source, target) => {
      if (path.basename(source).startsWith('.quartz-stage-')) throw new Error('activation failed');
      return rename(source, target);
    },
  });
  assert.equal(result.status, 'blocked');
  assert.match(result.message, /activation failed/u);
  assert.equal(await readFile(marker, 'utf8'), 'keep me\n');
  await assertNoTransactionArtifacts(paths);
});

test('post-activation validation failure restores the previously active runtime', async (t) => {
  const home = await makeHome(t);
  const env = { USERPROFILE: home, HOME: home };
  const paths = resolveWikiPaths({ env });
  const installed = await ensureQuartz({ env, installer: fakeInstaller, pluginInstaller: fakePluginInstaller });
  assert.equal(installed.status, 'ready', installed.message);
  const marker = path.join(paths.quartz, 'keep-after-validation-failure.txt');
  await writeFile(marker, 'keep me\n');

  const result = await ensureQuartz({
    env,
    refresh: true,
    installer: fakeInstaller,
    pluginInstaller: fakePluginInstaller,
    runtimeValidator: async (filename) => filename !== paths.quartz,
  });
  assert.equal(result.status, 'blocked');
  assert.match(result.message, /local plugins|validation|expected/iu);
  assert.equal(await readFile(marker, 'utf8'), 'keep me\n');
  await assertNoTransactionArtifacts(paths);
});
