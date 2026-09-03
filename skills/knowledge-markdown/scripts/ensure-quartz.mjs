#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFile as execFileCallback } from 'node:child_process';
import { cp, mkdir, mkdtemp, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { resolveWikiPaths } from './wiki-state.mjs';

const execFile = promisify(execFileCallback);
export const QUARTZ_VERSION = 'v4.5.2';
export const QUARTZ_COMMIT = '4923affa7722dfc751f1074348e6dad214fe0c08';
export const QUARTZ_REPOSITORY = 'https://github.com/jackyzha0/quartz.git';
export const QUARTZ_RELEASE_FILE = '.wheelmaker-quartz-release.json';
const CUSTOM_ASSETS = [
  ['quartz', 'emitters', 'KnowledgeHomePage.tsx'],
  ['quartz', 'components', 'KnowledgeSidebarSwitch.tsx'],
  ['quartz', 'components', 'KnowledgeTagSidebar.tsx'],
];

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
    config: path.join(runtime, 'quartz.config.ts'),
    layout: path.join(runtime, 'quartz.layout.ts'),
    dependencies: path.join(runtime, 'node_modules'),
    release: path.join(runtime, QUARTZ_RELEASE_FILE),
    assets: CUSTOM_ASSETS.map((segments) => path.join(runtime, ...segments)),
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

async function expectedRuntime(runtime) {
  const files = expectedFiles(runtime);
  if (!(await Promise.all([files.cli, files.config, files.layout, files.release, ...files.assets].map(exists))).every(Boolean)) return false;
  if (!(await isDirectory(files.dependencies))) return false;
  try {
    const release = JSON.parse(await readFile(files.release, 'utf8'));
    return release?.version === QUARTZ_VERSION
      && release?.commit === QUARTZ_COMMIT
      && release?.repository === QUARTZ_REPOSITORY
      && release?.configDigest === await digest(files.config)
      && release?.layoutDigest === await digest(files.layout)
      && JSON.stringify(release?.assetDigests || {}) === JSON.stringify(Object.fromEntries(await Promise.all(
        files.assets.map(async (filename, index) => [CUSTOM_ASSETS[index].join('/'), await digest(filename)]),
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
  await runCommand('git', ['clone', '--branch', QUARTZ_VERSION, '--depth', '1', QUARTZ_REPOSITORY, stage], { env });
  const revision = (await runCommand('git', ['-C', stage, 'rev-parse', 'HEAD'], { env })).stdout.trim();
  if (revision !== QUARTZ_COMMIT) {
    throw new Error(`Quartz ${QUARTZ_VERSION} resolved to ${revision}, expected ${QUARTZ_COMMIT}.`);
  }
  await runCommand(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['ci', '--ignore-scripts'], { cwd: stage, env });
}

async function materializeAssets(stage) {
  const assets = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'quartz');
  if (!(await exists(assets))) throw new Error(`Quartz configuration assets are missing: ${assets}`);
  await cp(assets, stage, { recursive: true, force: true });
}

async function writeReleaseMetadata(stage) {
  const files = expectedFiles(stage);
  await writeFile(files.release, `${JSON.stringify({
    version: QUARTZ_VERSION,
    commit: QUARTZ_COMMIT,
    repository: QUARTZ_REPOSITORY,
    configDigest: await digest(files.config),
    layoutDigest: await digest(files.layout),
    assetDigests: Object.fromEntries(await Promise.all(
      files.assets.map(async (filename, index) => [CUSTOM_ASSETS[index].join('/'), await digest(filename)]),
    )),
  }, null, 2)}\n`, 'utf8');
}

export async function ensureQuartz({ env = process.env, refresh = false, installer = defaultInstaller } = {}) {
  const paths = resolveWikiPaths({ env });
  const runtime = paths.quartz;
  if (!refresh && await expectedRuntime(runtime)) {
    return { status: 'ready', version: QUARTZ_VERSION, installed: false, refreshed: false, runtime, ...expectedFiles(runtime) };
  }
  if (!refresh && await nonempty(runtime)) {
    return {
      status: 'blocked',
      version: QUARTZ_VERSION,
      runtime,
      message: 'The private Quartz runtime directory is nonempty but does not contain the expected pinned runtime; refusing to overwrite it.',
    };
  }
  await mkdir(paths.wiki, { recursive: true });
  const stage = await mkdtemp(path.join(paths.wiki, '.quartz-stage-'));
  let backup = '';
  try {
    await installer(stage, { env, version: QUARTZ_VERSION, repository: QUARTZ_REPOSITORY });
    await materializeAssets(stage);
    await writeReleaseMetadata(stage);
    if (!(await expectedRuntime(stage))) throw new Error('Pinned Quartz installer did not produce the expected CLI, dependencies, configuration, or release metadata.');
    if (await exists(runtime)) {
      if (refresh) {
        backup = `${runtime}.previous-${Date.now()}`;
        await rename(runtime, backup);
      } else {
        await rm(runtime, { recursive: false });
      }
    }
    await rename(stage, runtime);
    if (backup) await rm(backup, { recursive: true, force: true });
    return { status: 'ready', version: QUARTZ_VERSION, installed: true, refreshed: Boolean(backup), runtime, ...expectedFiles(runtime) };
  } catch (error) {
    if (backup && !(await exists(runtime))) {
      try { await rename(backup, runtime); } catch { /* preserve the original failure */ }
    }
    await rm(stage, { recursive: true, force: true });
    return { status: 'blocked', version: QUARTZ_VERSION, runtime, message: error.message };
  }
}

function parseCli(argv) {
  let refresh = false;
  for (const flag of argv) {
    if (flag === '--refresh') refresh = true;
    else throw new Error(`unknown Quartz setup argument ${flag}`);
  }
  return { refresh };
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
