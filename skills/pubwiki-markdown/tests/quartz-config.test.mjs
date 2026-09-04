import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Quartz 5 assets use YAML configuration and local plugins without a source index.md', async () => {
  const assets = path.join(skillRoot, 'assets', 'quartz');
  const config = await readFile(path.join(assets, 'quartz.config.yaml'), 'utf8');
  const lock = JSON.parse(await readFile(path.join(assets, 'quartz.lock.json'), 'utf8'));
  const wheelmaker = JSON.parse(await readFile(path.join(assets, 'quartz', 'wheelmaker', 'package.json'), 'utf8'));
  await access(path.join(assets, 'quartz.ts'));
  await access(path.join(assets, 'quartz', 'wheelmaker', 'package.json'));
  await access(path.join(assets, 'quartz', 'wheelmaker', 'index.mjs'));
  await access(path.join(assets, 'quartz', 'wheelmaker', 'home.mjs'));
  await access(path.join(assets, 'quartz', 'wheelmaker', 'components.mjs'));
  await access(path.join(assets, 'quartz', 'wheelmaker', 'tags.mjs'));
  await assert.rejects(() => access(path.join(assets, 'quartz.config.ts')));
  await assert.rejects(() => access(path.join(assets, 'quartz.layout.ts')));
  assert.match(config, /source:\s*github:quartz-community\/obsidian-flavored-markdown/u);
  assert.match(config, /source:\s*\.\/quartz\/wheelmaker\s*$/mu);
  assert.doesNotMatch(config, /source:\s*\.\/quartz\/wheelmaker-(?:home|sidebar|tags)/u);
  assert.deepEqual(wheelmaker.quartz.category, ['pageType', 'component']);
  assert.ok(wheelmaker.quartz.components.WheelMakerSidebar);
  assert.doesNotMatch(config, /source:\s*.*content\/index\.md/u);
  assert.doesNotMatch(config, /source:\s*github:quartz-community\/reader-mode/u);
  for (const source of config.matchAll(/^\s+- source:\s+(github:\S+)/gmu)) {
    assert.ok(Object.values(lock.plugins).some((entry) => entry.source === source[1]), `missing lock entry for ${source[1]}`);
  }
});
