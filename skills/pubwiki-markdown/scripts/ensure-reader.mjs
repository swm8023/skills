#!/usr/bin/env node
import { lstat, readFile, realpath, mkdir, symlink, unlink, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolveWikiPaths } from './wiki-state.mjs';

const run = promisify(execFile);
const defaultSource = fileURLToPath(new URL('../assets/dochub', import.meta.url));
export async function ensureReader({ env = process.env, source = defaultSource, install = false } = {}) {
  const paths = resolveWikiPaths({ env });
  source = await realpath(source);
  const manifest = await readFile(path.join(source, 'package.json'));
  const pkg = JSON.parse(manifest);
  if (pkg.name !== 'pubwiki-reader') throw new Error('Not a PubWiki reader runtime');
  await lstat(path.join(source, 'exporter.mjs'));
  if (install) await run(process.platform === 'win32' ? 'cmd.exe' : 'npm',
    process.platform === 'win32' ? ['/d', '/s', '/c', 'npm ci --ignore-scripts --no-audit --no-fund']
      : ['ci', '--ignore-scripts', '--no-audit', '--no-fund'],
    { cwd: source, windowsHide: true, env: { ...process.env, ...env } });
  for (const name of Object.keys(pkg.dependencies))
    await lstat(path.join(source, 'node_modules', name, 'package.json')).catch(() => { throw new Error('Reader dependencies are missing; run ensure-reader.mjs --install'); });
  await mkdir(paths.wiki, { recursive: true });
  const target = path.join(paths.wiki, 'reader');
  let existing;
  try { existing = await lstat(target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (existing && !existing.isSymbolicLink()) throw new Error(`Refusing to replace a regular directory: ${target}`);
  const unchanged = existing && await realpath(target).catch(() => '') === source;
  const previous = existing ? await realpath(target).catch(() => '') : '';
  if (!unchanged) {
    if (existing) await unlink(target);
    try { await symlink(source, target, process.platform === 'win32' ? 'junction' : 'dir'); }
    catch (error) { if (previous) await symlink(previous, target, process.platform === 'win32' ? 'junction' : 'dir'); throw error; }
  }
  const binding = { formatVersion: 1, source,
    manifestDigest: createHash('sha256').update(manifest).digest('hex') };
  const filename = path.join(paths.wiki, '.pubwiki-reader.json'), temp = filename + `.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(binding, null, 2) + '\n', { mode: 0o600 });
  await rename(temp, filename);
  return { status: 'ready', source, runtime: target, linked: true };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--install')) throw new Error('Usage: ensure-reader.mjs [--install]');
  console.log(JSON.stringify(await ensureReader({ install: args.includes('--install') }), null, 2));
}
