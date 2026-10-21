import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, readFile, realpath, rm, writeFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ensureReader } from '../scripts/ensure-reader.mjs';

test('links the maintained Skill reader outside the Vault and is idempotent', async t => {
  const home = await mkdtemp(path.join(tmpdir(), 'pubwiki-link-'));
  t.after(() => rm(home, { recursive: true, force: true }));
  const env = { ...process.env, USERPROFILE: home, HOME: home };
  const result = await ensureReader({ env, bind: true });
  assert.equal(result.status, 'ready');
  assert.equal(await realpath(result.runtime), result.source);
  assert.equal((await ensureReader({ env })).source, result.source);
  const binding = JSON.parse(await readFile(path.join(home, '.wheelmaker/wiki/.pubwiki-reader.json'), 'utf8'));
  assert.equal(binding.source, result.source);
  assert.match(binding.manifestDigest, /^[0-9a-f]{64}$/);
});
test('does not overwrite an existing regular runtime directory', async t => {
  const home = await mkdtemp(path.join(tmpdir(), 'pubwiki-link-owned-'));
  t.after(() => rm(home, { recursive: true, force: true }));
  await mkdir(path.join(home, '.wheelmaker/wiki/reader'), { recursive: true });
  await assert.rejects(ensureReader({ env: { ...process.env, USERPROFILE: home, HOME: home }, bind: true }), /Refusing to replace/);
});

test('readiness preserves an explicitly bound checkout and never rewrites metadata', async t => {
  const home = await mkdtemp(path.join(tmpdir(), 'pubwiki-link-custom-'));
  t.after(() => rm(home, { recursive: true, force: true }));
  const env = { ...process.env, USERPROFILE: home, HOME: home };
  const source = path.join(home, 'development-reader');
  await mkdir(source);
  await writeFile(path.join(source, 'package.json'), '{"name":"pubwiki-reader","dependencies":{}}');
  await writeFile(path.join(source, 'exporter.mjs'), 'export function exportVault() {}');
  await ensureReader({ env, source, bind: true });
  const metadata = path.join(home, '.wheelmaker/wiki/.pubwiki-reader.json');
  const before = await readFile(metadata, 'utf8'), modified = (await stat(metadata)).mtimeMs;
  const result = await ensureReader({ env });
  assert.equal(result.source, await realpath(source));
  assert.equal(await readFile(metadata, 'utf8'), before);
  assert.equal((await stat(metadata)).mtimeMs, modified);
  await writeFile(path.join(source, 'package-lock.json'), '{}');
  await assert.rejects(ensureReader({ env }), /lockfile changed/);
  await rm(path.join(source, 'package-lock.json'));
  await writeFile(path.join(source, 'package.json'), '{"name":"pubwiki-reader","version":"2","dependencies":{}}');
  await assert.rejects(ensureReader({ env }), /manifest changed/);
  assert.equal(await readFile(metadata, 'utf8'), before);
});

test('readiness on an unconfigured home fails without creating a runtime', async t => {
  const home = await mkdtemp(path.join(tmpdir(), 'pubwiki-link-missing-'));
  t.after(() => rm(home, { recursive: true, force: true }));
  const env = { ...process.env, USERPROFILE: home, HOME: home };
  await assert.rejects(ensureReader({ env }), /not linked/);
  await assert.rejects(stat(path.join(home, '.wheelmaker/wiki')), { code: 'ENOENT' });
});
