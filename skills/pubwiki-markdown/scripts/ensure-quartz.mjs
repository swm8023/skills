#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFile as execFileCallback } from 'node:child_process';
import { cp, lstat, mkdir, mkdtemp, readdir, readFile, realpath, rename, rm, rmdir, stat, symlink, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { resolveWikiPaths } from './wiki-state.mjs';

const execFile = promisify(execFileCallback);
export const QUARTZ_VERSION = 'v5.0.0';
export const QUARTZ_COMMIT = 'ab346fa66a895e12d63a308e70ce330ba795822a';
export const QUARTZ_REPOSITORY = 'https://github.com/jackyzha0/quartz.git';
export const QUARTZ_RELEASE_FILE = '.wheelmaker-quartz-release.json';
export const QUARTZ_CLONE_ARGS = ['clone', '--branch', QUARTZ_VERSION, '--depth', '1', '--single-branch'];
const CUSTOM_ASSETS = [
  ['quartz.lock.json'],
  ['quartz', 'wheelmaker', 'package.json'],
  ['quartz', 'wheelmaker', 'index.mjs'],
  ['quartz', 'wheelmaker', 'home.mjs'],
  ['quartz', 'wheelmaker', 'components.mjs'],
  ['quartz', 'wheelmaker', 'tags.mjs'],
];
const LOCAL_PLUGIN_NAMES = ['wheelmaker'];
const OPTIONAL_PLUGIN_COMPATIBILITY = 'export const CustomOgImagesEmitterName = "CustomOgImages";';
const ASSET_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'quartz');
const LINK_HELP = 'Run ensure-quartz.mjs --link-skill from the installed Skill to repair its binding; update the Hub before enabling linked plugins.';

function requireQuartzNode() {
  const major = Number.parseInt(process.versions.node.split('.')[0], 10);
  if (!Number.isInteger(major) || major < 22) {
    throw new Error(`Quartz ${QUARTZ_VERSION} requires Node.js 22 or newer (found ${process.versions.node}).`);
  }
}

async function exists(filename) {
  try {
    await stat(filename);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

async function nonempty(directory) {
  try { return (await readdir(directory)).length > 0; } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

function expectedFiles(runtime) {
  return {
    cli: path.join(runtime, 'quartz', 'bootstrap-cli.mjs'),
    config: path.join(runtime, 'quartz.config.yaml'),
    entry: path.join(runtime, 'quartz.ts'),
    lockfile: path.join(runtime, 'quartz.lock.json'),
    dependencies: path.join(runtime, 'node_modules'),
    pluginIndex: path.join(runtime, '.quartz', 'plugins', 'index.ts'),
    release: path.join(runtime, QUARTZ_RELEASE_FILE),
    assets: CUSTOM_ASSETS.map((segments) => path.join(runtime, ...segments)),
    localPlugins: LOCAL_PLUGIN_NAMES.map((name) => path.join(runtime, '.quartz', 'plugins', name)),
  };
}

async function isDirectory(filename) {
  try { return (await stat(filename)).isDirectory(); } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

async function digest(filename) {
  return createHash('sha256').update(await readFile(filename)).digest('hex');
}

async function restoredPluginsPresent(runtime) {
  try {
    const lock = JSON.parse(await readFile(path.join(runtime, 'quartz.lock.json'), 'utf8'));
    const plugins = Object.entries(lock?.plugins || {}).filter(([, entry]) => entry?.commit !== 'local');
    return (await Promise.all(plugins.map(async ([name]) => {
      const plugin = path.join(runtime, '.quartz', 'plugins', name);
      return (await exists(path.join(plugin, 'package.json')))
        && (await exists(path.join(plugin, 'dist', 'index.d.ts')))
        && (await exists(path.join(plugin, 'dist', 'index.js')));
    }))).every(Boolean);
  } catch {
    return false;
  }
}

async function readRelease(runtime) {
  try { return JSON.parse(await readFile(expectedFiles(runtime).release, 'utf8')); } catch { return null; }
}

async function validateSkillPlugin(source) {
  if (typeof source !== 'string' || !path.isAbsolute(source)) throw new Error('Skill plugin source must be an absolute directory.');
  for (const segments of CUSTOM_ASSETS.slice(1)) {
    const filename = path.join(source, segments.at(-1));
    if (!(await lstat(filename)).isFile()) throw new Error(`Skill plugin file must be a regular file: ${filename}`);
  }
  const manifest = JSON.parse(await readFile(path.join(source, 'package.json'), 'utf8'));
  if (manifest.name !== 'wheelmaker' || manifest.type !== 'module'
    || manifest.exports?.['.'] !== './index.mjs' || manifest.exports?.['./components'] !== './components.mjs'
    || manifest.quartz?.quartzVersion !== QUARTZ_VERSION.slice(1)) {
    throw new Error('Skill plugin manifest is not compatible with the pinned Quartz runtime.');
  }
  return digest(path.join(source, 'package.json'));
}

async function validateBinding(runtime, release) {
  const binding = release.pluginBinding;
  const manifestDigest = await validateSkillPlugin(binding?.source);
  if (binding.manifestDigest !== manifestDigest) throw new Error('Skill plugin manifest changed; refresh the pinned runtime explicitly.');
  const source = await realpath(binding.source);
  for (const entry of [path.join(runtime, 'quartz', 'wheelmaker'), ...expectedFiles(runtime).localPlugins]) {
    if (!(await lstat(entry)).isSymbolicLink() || await realpath(entry) !== source) {
      throw new Error(`Skill plugin link does not match its recorded source: ${entry}`);
    }
  }
}

async function expectedRuntime(runtime, { requireLocalPlugins = true, skipBinding = false } = {}) {
  const files = expectedFiles(runtime);
  const release = await readRelease(runtime);
  if (!release || (release.formatVersion !== undefined && release.formatVersion !== 2)) return false;
  const assets = release.formatVersion === 2 ? files.assets.slice(0, 1) : files.assets;
  const requiredFiles = [files.cli, files.config, files.entry, files.lockfile, files.pluginIndex, files.release, ...assets];
  if (requireLocalPlugins && !(skipBinding && release.formatVersion === 2)) requiredFiles.push(...files.localPlugins);
  if (!(await Promise.all(requiredFiles.map(exists))).every(Boolean)) return false;
  if (!(await isDirectory(files.dependencies))) return false;
  if (!(await restoredPluginsPresent(runtime))) return false;
  try {
    if (release.formatVersion === 2 && !skipBinding) await validateBinding(runtime, release);
    return release?.version === QUARTZ_VERSION
      && release?.commit === QUARTZ_COMMIT
      && release?.repository === QUARTZ_REPOSITORY
      && release?.configDigest === await digest(files.config)
      && release?.entryDigest === await digest(files.entry)
      && release?.lockDigest === await digest(files.lockfile)
      && release?.pluginIndexDigest === await digest(files.pluginIndex)
      && JSON.stringify(release?.assetDigests || {}) === JSON.stringify(Object.fromEntries(await Promise.all(
        assets.map(async (filename, index) => [CUSTOM_ASSETS[index].join('/'), await digest(filename)]),
      )));
  } catch {
    return false;
  }
}

async function runCommand(command, args, options = {}) {
  try {
    return await execFile(command, args, {
      cwd: options.cwd,
      env: { ...process.env, ...(options.env || {}) },
      // Windows exposes npm as npm.cmd; execFile cannot spawn .cmd directly
      // without the shell shim. The command and arguments here are constants.
      shell: process.platform === 'win32' && command.toLowerCase().endsWith('.cmd'),
      windowsHide: true,
      maxBuffer: 4 * 1024 * 1024,
    });
  } catch (error) {
    const detail = [error?.stdout, error?.stderr].filter(Boolean).join('\n').trim();
    throw new Error(detail || error?.message || `${command} ${args.join(' ')} failed`, { cause: error });
  }
}

async function defaultInstaller(stage, { env = process.env } = {}) {
  await runCommand('git', [...QUARTZ_CLONE_ARGS, QUARTZ_REPOSITORY, stage], { env });
  const revision = (await runCommand('git', ['-C', stage, 'rev-parse', 'HEAD'], { env })).stdout.trim();
  if (revision !== QUARTZ_COMMIT) {
    throw new Error(`Quartz ${QUARTZ_VERSION} resolved to ${revision}, expected ${QUARTZ_COMMIT}.`);
  }
  await runCommand(process.platform === 'win32' ? 'npm.cmd' : 'npm', [
    'ci',
    '--no-audit',
    '--no-fund',
  ], { cwd: stage, env: { ...env, npm_config_audit: 'false', npm_config_fund: 'false' } });
}

async function defaultPluginInstaller(stage, { env = process.env } = {}) {
  await runCommand(process.execPath, [
    path.join(stage, 'quartz', 'bootstrap-cli.mjs'),
    'plugin',
    'restore',
  ], { cwd: stage, env: { ...env, npm_config_audit: 'false', npm_config_fund: 'false' } });
}

async function materializeAssets(stage) {
  if (!(await exists(ASSET_ROOT))) throw new Error(`Quartz configuration assets are missing: ${ASSET_ROOT}`);
  await cp(ASSET_ROOT, stage, { recursive: true, force: true });
}

async function ensurePluginIndex(stage) {
  const filename = path.join(stage, '.quartz', 'plugins', 'index.ts');
  if (!(await exists(filename))) throw new Error('Quartz plugin restore did not produce .quartz/plugins/index.ts.');
  const source = await readFile(filename, 'utf8');
  if (source.includes('CustomOgImagesEmitterName')) return;
  await writeFile(
    filename,
    `${source}${source.endsWith('\n') ? '' : '\n'}\n// Quartz Head references this optional emitter symbol even when OG image generation is disabled.\n${OPTIONAL_PLUGIN_COMPATIBILITY}\n`,
    'utf8',
  );
}

async function materializeLocalPlugins(runtime) {
  const pluginRoot = path.join(runtime, '.quartz', 'plugins');
  await mkdir(pluginRoot, { recursive: true });
  for (const name of LOCAL_PLUGIN_NAMES) {
    const source = path.join(runtime, 'quartz', name);
    const target = path.join(pluginRoot, name);
    await symlink(source, target, process.platform === 'win32' ? 'junction' : 'dir');
  }
}

async function writeReleaseMetadata(stage) {
  const files = expectedFiles(stage);
  await writeFile(files.release, `${JSON.stringify({
    version: QUARTZ_VERSION,
    commit: QUARTZ_COMMIT,
    repository: QUARTZ_REPOSITORY,
    configDigest: await digest(files.config),
    entryDigest: await digest(files.entry),
    lockDigest: await digest(files.lockfile),
    pluginIndexDigest: await digest(files.pluginIndex),
    assetDigests: Object.fromEntries(await Promise.all(
      files.assets.map(async (filename, index) => [CUSTOM_ASSETS[index].join('/'), await digest(filename)]),
    )),
  }, null, 2)}\n`, 'utf8');
}

async function bindSkillPlugin(runtime) {
  const source = await realpath(path.join(ASSET_ROOT, 'quartz', 'wheelmaker'));
  const manifestDigest = await validateSkillPlugin(source);
  const files = expectedFiles(runtime);
  const originalMetadata = await readFile(files.release, 'utf8');
  const release = JSON.parse(originalMetadata);
  const previousManifest = release.formatVersion === 2
    ? release.pluginBinding?.manifestDigest : release.assetDigests?.['quartz/wheelmaker/package.json'];
  if (manifestDigest !== previousManifest) {
    throw new Error('Skill plugin manifest changed; use --refresh --link-skill to update the pinned runtime explicitly.');
  }
  const local = path.join(runtime, 'quartz', 'wheelmaker');
  const entries = [
    { target: local, source },
    { target: files.localPlugins[0], source: local },
  ];
  // A snapshot directory is installer-owned; linked mode only replaces links.
  for (const [index, entry] of entries.entries()) {
    try {
      const info = await lstat(entry.target);
      if (!(index === 0 && release.formatVersion === undefined && info.isDirectory()) && !info.isSymbolicLink()) {
        throw new Error(`Refusing to replace an unexpected local plugin directory: ${entry.target}`);
      }
      entry.present = true;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  if (release.formatVersion === 2 && release.pluginBinding.source === source && await expectedRuntime(runtime)) return;
  const stage = await mkdtemp(path.join(runtime, '.wheelmaker-plugin-stage-'));
  let metadataWritten = false;
  try {
    for (const [index, entry] of entries.entries()) {
      entry.next = path.join(stage, `next-${index}`);
      entry.backup = path.join(stage, `previous-${index}`);
      await symlink(entry.source, entry.next, process.platform === 'win32' ? 'junction' : 'dir');
    }
    await writeFile(path.join(stage, 'release.json'), `${JSON.stringify({
      ...release,
      formatVersion: 2,
      assetDigests: { 'quartz.lock.json': release.lockDigest },
      pluginBinding: { source, manifestDigest },
    }, null, 2)}\n`, 'utf8');
    for (const entry of entries) {
      if (entry.present) {
        await rename(entry.target, entry.backup);
        entry.moved = true;
      }
      await rename(entry.next, entry.target);
      entry.linked = true;
    }
    await rename(path.join(stage, 'release.json'), files.release);
    metadataWritten = true;
    if (!(await expectedRuntime(runtime))) throw new Error('Linked Skill plugin validation failed.');
  } catch (error) {
    try {
      for (const entry of [...entries].reverse()) {
        if (entry.linked) await unlink(entry.target);
        if (entry.moved) await rename(entry.backup, entry.target);
      }
      if (metadataWritten) {
        await writeFile(path.join(stage, 'restore.json'), originalMetadata, 'utf8');
        await rename(path.join(stage, 'restore.json'), files.release);
      }
    } catch (rollbackError) {
      throw new Error(`${error.message}; rollback failed: ${rollbackError.message}. Original plugin backups: ${stage}`, { cause: error });
    }
    await rm(stage, { recursive: true, force: true });
    throw error;
  }
  await rm(stage, { recursive: true, force: true });
}

export async function ensureQuartz({
  env = process.env,
  refresh = false,
  linkSkill = false,
  installer = defaultInstaller,
  pluginInstaller = defaultPluginInstaller,
} = {}) {
  requireQuartzNode();
  const paths = resolveWikiPaths({ env });
  const runtime = paths.quartz;
  const previousRelease = await readRelease(runtime);
  const blocked = (message) => ({ status: 'blocked', version: QUARTZ_VERSION, runtime, message });
  if (!refresh && await expectedRuntime(runtime, { skipBinding: linkSkill })) {
    if (linkSkill) {
      try { await bindSkillPlugin(runtime); } catch (error) { return blocked(`${error.message} ${LINK_HELP}`); }
    }
    return { status: 'ready', version: QUARTZ_VERSION, installed: false, refreshed: false,
      linked: linkSkill || previousRelease?.formatVersion === 2, runtime, ...expectedFiles(runtime) };
  }
  if (!refresh && await nonempty(runtime)) {
    return {
      status: 'blocked',
      version: QUARTZ_VERSION,
      runtime,
      message: `The private Quartz runtime directory is nonempty but does not contain the expected pinned runtime; refusing to overwrite it. ${previousRelease?.formatVersion === 2 ? LINK_HELP + ' If the manifest changed, use --refresh --link-skill.' : ''}`.trim(),
    };
  }
  await mkdir(paths.wiki, { recursive: true });
  const stage = await mkdtemp(path.join(paths.wiki, '.quartz-stage-'));
  let backup = '';
  let activated = false;
  let result;
  try {
    await installer(stage, { env, version: QUARTZ_VERSION, repository: QUARTZ_REPOSITORY });
    await materializeAssets(stage);
    await pluginInstaller(stage, { env });
    await ensurePluginIndex(stage);
    await writeReleaseMetadata(stage);
    if (!(await expectedRuntime(stage, { requireLocalPlugins: false }))) throw new Error('Pinned Quartz installer did not produce the expected CLI, dependencies, configuration, or release metadata.');
    if (await exists(runtime)) {
      if (refresh) {
        backup = `${runtime}.previous-${Date.now()}`;
        await rename(runtime, backup);
      } else {
        await rmdir(runtime);
      }
    }
    await rename(stage, runtime);
    activated = true;
    await materializeLocalPlugins(runtime);
    if (!(await expectedRuntime(runtime))) throw new Error('Pinned Quartz installer did not produce the expected CLI, dependencies, configuration, custom assets, or local plugins.');
    const linked = linkSkill || previousRelease?.formatVersion === 2;
    if (linked) await bindSkillPlugin(runtime);
    result = { status: 'ready', version: QUARTZ_VERSION, installed: true, refreshed: Boolean(backup), linked, runtime, ...expectedFiles(runtime) };
  } catch (error) {
    if (activated) await rm(runtime, { recursive: true, force: true });
    if (backup && await exists(backup)) {
      try { await rename(backup, runtime); } catch (rollbackError) {
        return blocked(`${error.message}; runtime rollback failed: ${rollbackError.message}. Original runtime backup: ${backup}`);
      }
    }
    await rm(stage, { recursive: true, force: true });
    return { status: 'blocked', version: QUARTZ_VERSION, runtime, message: error.message };
  }
  // Cleanup failure must not roll back an already validated installation.
  if (backup) {
    try { await rm(backup, { recursive: true, force: true }); } catch (error) {
      result.cleanupWarning = `The previous runtime remains at ${backup}: ${error.message}`;
    }
  }
  return result;
}

function parseCli(argv) {
  let refresh = false;
  let linkSkill = false;
  for (const flag of argv) {
    if (flag === '--refresh') refresh = true;
    else if (flag === '--link-skill') linkSkill = true;
    else throw new Error(`unknown Quartz setup argument ${flag}`);
  }
  return { refresh, linkSkill };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = await ensureQuartz(parseCli(process.argv.slice(2)));
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'ready') process.exitCode = 2;
  } catch (error) {
    console.error(error?.stack || error?.message || error);
    process.exitCode = 1;
  }
}
