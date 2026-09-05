import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const REQUIRED_EXTERNAL_PLUGINS = [
  'created-modified-date',
  'syntax-highlighting',
  'obsidian-flavored-markdown',
  'github-flavored-markdown',
  'crawl-links',
  'description',
  'latex',
  'note-properties',
  'remove-draft',
  'alias-redirects',
  'content-index',
  'content-page',
  'tag-page',
  'explorer',
  'search',
  'backlinks',
  'graph',
  'article-title',
  'content-meta',
  'tag-list',
  'page-title',
  'darkmode',
  'footer',
];

const REMOVED_EXTERNAL_PLUGINS = [
  'table-of-contents',
  'favicon',
  'og-image',
  'canvas-page',
  'folder-page',
  'reader-mode',
  'breadcrumbs',
  'spacer',
];

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
  assert.match(config, /source:\s*github:quartz-community\/note-properties[\s\S]*?hidePropertiesView:\s*true[\s\S]*?order:\s*5/u);
  assert.match(config, /pageTitle:\s*WheelMaker Knowledge/u);
  assert.match(config, /source:\s*\.\/quartz\/wheelmaker\s*$/mu);
  assert.doesNotMatch(config, /source:\s*\.\/quartz\/wheelmaker-(?:home|sidebar|tags)/u);
  assert.deepEqual(wheelmaker.quartz.category, ['pageType', 'component']);
  assert.ok(wheelmaker.quartz.components.WheelMakerSidebar);
  assert.doesNotMatch(config, /source:\s*.*content\/index\.md/u);
  const configuredNames = [...config.matchAll(/^\s+- source:\s+github:quartz-community\/([^\s#]+)/gmu)]
    .map(([, name]) => name)
    .sort();
  assert.deepEqual(configuredNames, [...REQUIRED_EXTERNAL_PLUGINS].sort());
  assert.deepEqual(Object.keys(lock.plugins).sort(), [...REQUIRED_EXTERNAL_PLUGINS].sort());
  assert.equal(lock.plugins['note-properties']?.commit, 'e68145b9f11b31d3168ed2755bd74f36a67dbed7');
  for (const name of REMOVED_EXTERNAL_PLUGINS) {
    assert.doesNotMatch(config, new RegExp(`source:\\s+github:quartz-community/${name}(?:\\s|$)`, 'u'));
    assert.equal(lock.plugins[name], undefined, `removed plugin remains locked: ${name}`);
  }
  assert.match(config, /enableSiteMap:\s*false/u);
  assert.match(config, /enableRSS:\s*false/u);
  assert.doesNotMatch(config, /enableSiteMap:\s*true|enableRSS:\s*true/u);
});
