import assert from 'node:assert/strict';
import { chmod, cp, lstat, mkdir, readFile, readdir, realpath, rename, stat, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

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
  assert.equal((await readdir(paths.wiki)).some((entry) => entry.startsWith('.quartz-stage-')), false);
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

async function copySkill(home, name = 'installed-skill') {
  const root = path.join(home, name);
  const original = fileURLToPath(new URL('../', import.meta.url));
  for (const directory of ['scripts', 'assets']) {
    await cp(path.join(original, directory), path.join(root, directory), { recursive: true });
  }
  return {
    ensure: (await import(pathToFileURL(path.join(root, 'scripts', 'ensure-quartz.mjs')).href)).ensureQuartz,
    plugin: path.join(root, 'assets', 'quartz', 'quartz', 'wheelmaker'),
  };
}

test('linked installation reads Skill edits without reinstalling Quartz', async (t) => {
  const home = await makeHome(t);
  const skill = await copySkill(home);
  const env = { USERPROFILE: home, HOME: home };
  const result = await skill.ensure({ env, linkSkill: true, installer: fakeInstaller, pluginInstaller: fakePluginInstaller });
  assert.equal(result.status, 'ready', result.message);
  const local = path.join(result.runtime, 'quartz', 'wheelmaker');
  const cached = path.join(result.runtime, '.quartz', 'plugins', 'wheelmaker');
  assert.equal((await lstat(local)).isSymbolicLink(), true);
  assert.equal(await realpath(cached), await realpath(skill.plugin));
  await writeFile(path.join(skill.plugin, 'components.mjs'), 'export const revision = 2;\n');
  const ready = await skill.ensure({ env, installer: () => assert.fail('must not reinstall') });
  assert.equal(ready.status, 'ready', ready.message);
  assert.equal(await readFile(path.join(cached, 'components.mjs'), 'utf8'), 'export const revision = 2;\n');
});

test('opt-in migrates a valid snapshot and preserves the core and dependencies', async (t) => {
  const home = await makeHome(t);
  const skill = await copySkill(home);
  const env = { USERPROFILE: home, HOME: home };
  const initial = await skill.ensure({ env, installer: fakeInstaller, pluginInstaller: fakePluginInstaller });
  assert.equal(initial.status, 'ready', initial.message);
  assert.equal((await lstat(path.join(initial.runtime, 'quartz', 'wheelmaker'))).isSymbolicLink(), false);
  const marker = path.join(initial.runtime, 'node_modules', 'keep.txt');
  await writeFile(marker, 'installed dependencies');
  const config = await readFile(initial.config, 'utf8');
  const result = await skill.ensure({ env, linkSkill: true, installer: () => assert.fail('must not reinstall') });
  assert.equal(result.status, 'ready', result.message);
  assert.equal(result.linked, true);
  assert.equal(await realpath(path.join(result.runtime, 'quartz', 'wheelmaker')), await realpath(skill.plugin));
  assert.equal(await readFile(marker, 'utf8'), 'installed dependencies');
  assert.equal(await readFile(result.config, 'utf8'), config);
});

test('missing bound Skill is actionable and explicit relinking repairs a moved installation', async (t) => {
  const home = await makeHome(t);
  const skill = await copySkill(home);
  const replacement = await copySkill(home, 'replacement-skill');
  const env = { USERPROFILE: home, HOME: home };
  await skill.ensure({ env, linkSkill: true, installer: fakeInstaller, pluginInstaller: fakePluginInstaller });
  await rename(skill.plugin, `${skill.plugin}-moved`);
  const missing = await skill.ensure({ env });
  assert.equal(missing.status, 'blocked');
  assert.match(missing.message, /link-skill/);
  const repaired = await replacement.ensure({ env, linkSkill: true });
  assert.equal(repaired.status, 'ready', repaired.message);
  assert.equal(await realpath(path.join(repaired.runtime, '.quartz', 'plugins', 'wheelmaker')), await realpath(replacement.plugin));
});

test('invalid source cannot disturb a working snapshot during migration', async (t) => {
  const home = await makeHome(t);
  const skill = await copySkill(home);
  const env = { USERPROFILE: home, HOME: home };
  const initial = await skill.ensure({ env, installer: fakeInstaller, pluginInstaller: fakePluginInstaller });
  const metadata = await readFile(initial.release, 'utf8');
  await rename(path.join(skill.plugin, 'index.mjs'), path.join(skill.plugin, 'index.mjs-missing'));
  const result = await skill.ensure({ env, linkSkill: true });
  assert.equal(result.status, 'blocked');
  assert.equal(await readFile(initial.release, 'utf8'), metadata);
  assert.equal((await lstat(path.join(initial.runtime, 'quartz', 'wheelmaker'))).isSymbolicLink(), false);
  assert.equal((await skill.ensure({ env })).status, 'ready');
});

test('failed refresh leaves the original runtime and linked source intact', async (t) => {
  const home = await makeHome(t);
  const skill = await copySkill(home);
  const env = { USERPROFILE: home, HOME: home };
  const initial = await skill.ensure({ env, linkSkill: true, installer: fakeInstaller, pluginInstaller: fakePluginInstaller });
  const result = await skill.ensure({ env, refresh: true, installer: () => { throw new Error('offline'); } });
  assert.equal(result.status, 'blocked');
  assert.equal(await stat(initial.cli).then((info) => info.isFile()), true);
  assert.equal(await stat(path.join(skill.plugin, 'index.mjs')).then((info) => info.isFile()), true);
});

test('explicit relinking repairs missing cache links and is idempotent when healthy', async (t) => {
  const home = await makeHome(t);
  const skill = await copySkill(home);
  const env = { USERPROFILE: home, HOME: home };
  const initial = await skill.ensure({ env, linkSkill: true, installer: fakeInstaller, pluginInstaller: fakePluginInstaller });
  const cache = path.join(initial.runtime, '.quartz', 'plugins', 'wheelmaker');
  await unlink(cache);
  const repaired = await skill.ensure({ env, linkSkill: true });
  assert.equal(repaired.status, 'ready', repaired.message);
  assert.equal(await realpath(cache), await realpath(skill.plugin));
  const before = (await stat(repaired.release)).mtimeMs;
  const ready = await skill.ensure({ env, linkSkill: true });
  assert.equal(ready.status, 'ready', ready.message);
  assert.equal((await stat(ready.release)).mtimeMs, before);
});

test('failed activation restores the old snapshot after the runtime was swapped', async (t) => {
  const home = await makeHome(t);
  const skill = await copySkill(home);
  const env = { USERPROFILE: home, HOME: home };
  const initial = await skill.ensure({ env, installer: fakeInstaller, pluginInstaller: fakePluginInstaller });
  const metadata = await readFile(initial.release, 'utf8');
  const result = await skill.ensure({ env, refresh: true, linkSkill: true, installer: fakeInstaller,
    pluginInstaller: async (stage) => {
      await fakePluginInstaller(stage);
      // Simulate an unexpected cache entry created by the upstream restore process.
      await mkdir(path.join(stage, '.quartz', 'plugins', 'wheelmaker'));
    },
  });
  assert.equal(result.status, 'blocked');
  assert.equal(await readFile(initial.release, 'utf8'), metadata);
  assert.equal((await skill.ensure({ env })).status, 'ready');
});

test('manifest changes need explicit refresh and refresh retains linked mode', async (t) => {
  const home = await makeHome(t);
  const skill = await copySkill(home);
  const env = { USERPROFILE: home, HOME: home };
  const initial = await skill.ensure({ env, linkSkill: true, installer: fakeInstaller, pluginInstaller: fakePluginInstaller });
  const manifest = path.join(skill.plugin, 'package.json');
  await writeFile(manifest, `${await readFile(manifest, 'utf8')}\n`);
  const blocked = await skill.ensure({ env, linkSkill: true });
  assert.equal(blocked.status, 'blocked');
  assert.match(blocked.message, /--refresh/);
  const refreshed = await skill.ensure({ env, refresh: true, installer: fakeInstaller, pluginInstaller: fakePluginInstaller });
  assert.equal(refreshed.status, 'ready', refreshed.message);
  assert.equal(refreshed.linked, true);
  assert.equal(await realpath(path.join(initial.runtime, 'quartz', 'wheelmaker')), await realpath(skill.plugin));
});

test('Windows metadata activation failure rolls back both plugin links', { skip: process.platform !== 'win32' }, async (t) => {
  const home = await makeHome(t);
  const skill = await copySkill(home);
  const env = { USERPROFILE: home, HOME: home };
  const initial = await skill.ensure({ env, installer: fakeInstaller, pluginInstaller: fakePluginInstaller });
  const metadata = await readFile(initial.release, 'utf8');
  // Replacing a read-only file fails on Windows, after the plugin links have switched.
  await chmod(initial.release, 0o444);
  try {
    const result = await skill.ensure({ env, linkSkill: true });
    assert.equal(result.status, 'blocked');
    assert.equal(await readFile(initial.release, 'utf8'), metadata);
    const local = path.join(initial.runtime, 'quartz', 'wheelmaker');
    assert.equal((await lstat(local)).isSymbolicLink(), false);
    assert.equal(await realpath(path.join(initial.runtime, '.quartz', 'plugins', 'wheelmaker')), await realpath(local));
    assert.equal((await skill.ensure({ env })).status, 'ready');
    assert.equal((await readdir(initial.runtime)).some((name) => name.startsWith('.wheelmaker-plugin-stage-')), false);
  } finally {
    await chmod(initial.release, 0o666);
  }
});
