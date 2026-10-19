import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, readFile, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ensureReader } from '../scripts/ensure-reader.mjs';

test('links the maintained Skill reader outside the Vault and is idempotent', async t => {
  const home = await mkdtemp(path.join(tmpdir(), 'pubwiki-link-'));
  t.after(() => rm(home, { recursive: true, force: true }));
  const env = { ...process.env, USERPROFILE: home, HOME: home };
  const result = await ensureReader({ env });
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
  await assert.rejects(ensureReader({ env: { ...process.env, USERPROFILE: home, HOME: home } }), /Refusing to replace/);
});
