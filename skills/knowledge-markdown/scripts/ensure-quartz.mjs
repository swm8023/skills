#!/usr/bin/env node

import { execFile as execFileCallback } from 'node:child_process';
import { cp, mkdir, mkdtemp, readdir, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { resolveWikiPaths } from './wiki-state.mjs';

const execFile = promisify(execFileCallback);
export const QUARTZ_VERSION = 'v4.5.2';
export const QUARTZ_REPOSITORY = 'https://github.com/jackyzha0/quartz.git';

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
  };
}

async function expectedRuntime(runtime) {
  const files = expectedFiles(runtime);
  return (await Promise.all(Object.values(files).map(exists))).every(Boolean);
}

async function runCommand(command, args, options = {}) {
  try {
    return await execFile(command, args, {
      cwd: options.cwd,
      env: { ...process.env, ...(options.env || {}) },
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
  await runCommand('npm', ['ci', '--ignore-scripts'], { cwd: stage, env });
}

async function materializeAssets(stage) {
  const assets = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'quartz');
  if (!(await exists(assets))) throw new Error(`Quartz configuration assets are missing: ${assets}`);
  await cp(assets, stage, { recursive: true, force: true });
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
    if (!(await expectedRuntime(stage))) throw new Error('Pinned Quartz installer did not produce the expected CLI/configuration files.');
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
