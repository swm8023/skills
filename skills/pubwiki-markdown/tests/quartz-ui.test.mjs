import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetRoot = path.join(skillRoot, 'assets', 'quartz');

test('WheelMaker home lists only real knowledge pages and uses a full-width card layout', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz', 'wheelmaker', 'home.mjs'), 'utf8');

  assert.match(source, /slug !== "404"/u);
  assert.match(source, /slug\.endsWith\("\/index"\)/u);
  assert.match(source, /knowledge-home-grid/u);
  assert.match(source, /grid-template-columns:\s*repeat\(auto-fit/u);
});

test('WheelMaker home uses the validated site settings for the shared title and description', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz', 'wheelmaker', 'home.mjs'), 'utf8');

  assert.match(source, /WHEELMAKER_WIKI_SITE_TITLE/u);
  assert.match(source, /WHEELMAKER_WIKI_SITE_DESCRIPTION/u);
  assert.match(source, /cfg\.pageTitle\s*=\s*site\.title/u);
  assert.match(source, /title:\s*site\.title/u);
  assert.match(source, /data:\s*\{\s*description:\s*site\.description\s*\}/u);
  assert.match(source, /title:\s*fileData\.title \|\| site\.title/u);
  assert.equal([...source.matchAll(/WheelMaker Knowledge/gu)].length, 1);
});

test('WheelMaker home plugin renders generated folders as directory article pages', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz', 'wheelmaker', 'home.mjs'), 'utf8');

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
  assert.match(source, /split\("\/"\)/u);
});

test('WheelMaker home layout removes Quartz folder metadata chrome', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz.config.yaml'), 'utf8');

  assert.match(source, /home:\s*[\s\S]*?positions:\s*[\s\S]*?beforeBody:\s*\[\]/u);
});

test('WheelMaker sidebar rewrites Quartz root content-index requests to the Wiki mount', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz', 'wheelmaker', 'components.mjs'), 'utf8');

  assert.match(source, /Component\.beforeDOMLoaded/u);
  assert.match(source, /const marker = "\/wiki\/"/u);
  assert.match(source, /lastIndexOf\(marker\)/u);
  assert.match(source, /contentIndex\.json/u);
  assert.match(source, /window\.fetch/u);
});

test('WheelMaker sidebar keeps Quartz root-relative navigation inside the Wiki mount', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz', 'wheelmaker', 'components.mjs'), 'utf8');

  assert.match(source, /rewriteNavigation/u);
  assert.match(source, /MutationObserver/u);
  assert.match(source, /startsWith\(wikiRoot\)/u);
});

test('WheelMaker sidebar owns a responsive toolbar layout', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz', 'wheelmaker', 'components.mjs'), 'utf8');

  assert.match(source, /grid-template-areas/u);
  assert.match(source, /@media \(max-width: 800px\)/u);
  assert.match(source, /min-width: 0/u);
});

test('WheelMaker mobile sidebar wins the Quartz flex-layout cascade', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz', 'wheelmaker', 'components.mjs'), 'utf8');

  assert.match(source, /\.sidebar\.left:has\(> \.knowledge-sidebar-switch\):has\(> \.explorer\)/u);
  assert.match(source, /sidebar\.left:has\(> \.knowledge-sidebar-switch\):has\(> \.explorer\)[\s\S]*?display: grid/u);
});

test('WheelMaker mobile Explorer toggle remains single-shot after Quartz nav events', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz', 'wheelmaker', 'components.mjs'), 'utf8');

  assert.match(source, /wheelmakerMobileExplorerBound/u);
  assert.match(source, /stopImmediatePropagation\(\)/u);
});

test('WheelMaker bundle composes the sidebar switch and hierarchical tag sidebar', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz', 'wheelmaker', 'components.mjs'), 'utf8');
  const tags = await readFile(path.join(assetRoot, 'quartz', 'wheelmaker', 'tags.mjs'), 'utf8');

  assert.match(source, /KnowledgeTagSidebar/u);
  assert.match(source, /export const WheelMakerSidebar/u);
  assert.match(source, /h\(SidebarSwitch, props\)/u);
  assert.match(source, /h\(TagSidebar, props\)/u);
  assert.match(tags, /export const KnowledgeTagSidebar/u);
  assert.match(tags, /tags\/\$\{node\.path\}/u);
});
