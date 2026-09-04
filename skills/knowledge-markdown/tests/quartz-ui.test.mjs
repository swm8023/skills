import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetRoot = path.join(skillRoot, 'assets', 'quartz');

test('WheelMaker home lists only real knowledge pages and uses a full-width card layout', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz', 'wheelmaker-home', 'index.mjs'), 'utf8');

  assert.match(source, /slug !== "404"/u);
  assert.match(source, /slug\.endsWith\("\/index"\)/u);
  assert.match(source, /knowledge-home-grid/u);
  assert.match(source, /grid-template-columns:\s*repeat\(auto-fit/u);
});

test('WheelMaker home plugin renders generated folders as directory article pages', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz', 'wheelmaker-home', 'index.mjs'), 'utf8');

  assert.match(source, /function isFolderPage/u);
  assert.match(source, /function pagesForFolder/u);
  assert.match(source, /wheelmakerDirectory/u);
  assert.match(source, /title: folder/u);
  assert.match(source, /knowledge-directory-grid/u);
  assert.match(source, /slug === "index" \|\| isFolderPage\(fileData\)/u);
});

test('WheelMaker explorer keeps directory navigation focused on folders', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz.config.yaml'), 'utf8');

  assert.match(source, /filterFn:\s*\|[\s\S]*?node\.isFolder/u);
  assert.match(source, /mapFn:\s*\|[\s\S]*?node\.slug\.replace/u);
});

test('WheelMaker home layout removes Quartz folder metadata chrome', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz.config.yaml'), 'utf8');

  assert.match(source, /home:\s*[\s\S]*?positions:\s*[\s\S]*?beforeBody:\s*\[\]/u);
});

test('WheelMaker sidebar rewrites Quartz root content-index requests to the Wiki mount', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz', 'wheelmaker-sidebar', 'components.mjs'), 'utf8');

  assert.match(source, /Component\.beforeDOMLoaded/u);
  assert.match(source, /const marker = "\/wiki\/"/u);
  assert.match(source, /lastIndexOf\(marker\)/u);
  assert.match(source, /contentIndex\.json/u);
  assert.match(source, /window\.fetch/u);
});

test('WheelMaker sidebar keeps Quartz root-relative navigation inside the Wiki mount', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz', 'wheelmaker-sidebar', 'components.mjs'), 'utf8');

  assert.match(source, /rewriteNavigation/u);
  assert.match(source, /MutationObserver/u);
  assert.match(source, /startsWith\(wikiRoot\)/u);
});

test('WheelMaker sidebar owns a responsive toolbar layout', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz', 'wheelmaker-sidebar', 'components.mjs'), 'utf8');

  assert.match(source, /grid-template-areas/u);
  assert.match(source, /@media \(max-width: 800px\)/u);
  assert.match(source, /min-width: 0/u);
});
