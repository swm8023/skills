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
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
async function lockDigest(source) {
  try { return digest(await readFile(path.join(source, 'package-lock.json'))); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function inspectSource(source) {
  source = await realpath(source);
  const manifest = await readFile(path.join(source, 'package.json'));
  const pkg = JSON.parse(manifest);
  if (pkg.name !== 'pubwiki-reader') throw new Error('Not a PubWiki reader runtime');
  await lstat(path.join(source, 'exporter.mjs'));
  return { source, manifest, pkg };
}
async function checkDependencies(source, pkg) {
  for (const name of Object.keys(pkg.dependencies || {}))
    await lstat(path.join(source, 'node_modules', name, 'package.json')).catch(() => { throw new Error('Reader dependencies are missing; run ensure-reader.mjs --install'); });
}
async function readBinding(paths) {
  try { return JSON.parse(await readFile(path.join(paths.wiki, '.pubwiki-reader.json'), 'utf8')); }
  catch (error) {
    if (error.code === 'ENOENT') return null;
    throw new Error('Invalid PubWiki reader binding; explicitly bind the maintained reader again');
  }
}
export async function ensureReader({ env = process.env, source, install = false, bind = false } = {}) {
  const paths = resolveWikiPaths({ env });
  let previousBinding;
  try { previousBinding = await readBinding(paths); }
  catch (error) { if (!bind) throw error; }
  const target = path.join(paths.wiki, 'reader');
  if (!install && !bind) {
    if (source) throw new Error('Changing reader source requires --bind or --install');
    if (!previousBinding) throw new Error('PubWiki reader is not linked; run ensure-reader.mjs --install');
    if (previousBinding.formatVersion !== 1 || !path.isAbsolute(previousBinding.source || '')) throw new Error('Invalid PubWiki reader binding');
    const inspected = await inspectSource(previousBinding.source);
    if (!(await lstat(target)).isSymbolicLink() || await realpath(target) !== inspected.source) throw new Error('PubWiki reader link does not match its binding');
    if (digest(inspected.manifest) !== previousBinding.manifestDigest) throw new Error('Reader manifest changed; run ensure-reader.mjs --install');
    if (previousBinding.lockfileDigest !== undefined && previousBinding.lockfileDigest !== await lockDigest(inspected.source))
      throw new Error('Reader lockfile changed; run ensure-reader.mjs --install');
    await checkDependencies(inspected.source, inspected.pkg);
    return { status: 'ready', source: inspected.source, runtime: target, linked: true };
  }
  // Installing dependencies preserves an existing development binding unless explicitly replaced.
  const inspected = await inspectSource(source || (!bind && previousBinding?.source) || defaultSource);
  source = inspected.source;
  const { manifest, pkg } = inspected;
  if (install) await run(process.platform === 'win32' ? 'cmd.exe' : 'npm',
    process.platform === 'win32' ? ['/d', '/s', '/c', 'npm ci --ignore-scripts --no-audit --no-fund']
      : ['ci', '--ignore-scripts', '--no-audit', '--no-fund'],
    { cwd: source, windowsHide: true, env: { ...process.env, ...env } });
  await checkDependencies(source, pkg);
  await mkdir(paths.wiki, { recursive: true });
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
    manifestDigest: digest(manifest), lockfileDigest: await lockDigest(source) };
  const filename = path.join(paths.wiki, '.pubwiki-reader.json'), temp = filename + `.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(binding, null, 2) + '\n', { mode: 0o600 });
  await rename(temp, filename);
  return { status: 'ready', source, runtime: target, linked: true };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2), options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--install') options.install = true;
    else if (args[i] === '--bind') options.bind = true;
    else if (args[i] === '--source' && args[i + 1] && path.isAbsolute(args[i + 1])) options.source = args[++i];
    else throw new Error('Usage: ensure-reader.mjs [--install] [--bind] [--source <absolute reader directory>]');
  }
  console.log(JSON.stringify(await ensureReader(options), null, 2));
}
