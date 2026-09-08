import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
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

test('WheelMaker Wiki accepts host themes only when embedded and keeps standalone theme ownership', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz', 'wheelmaker', 'components.mjs'), 'utf8');

  assert.match(source, /window\.parent !== window/u);
  assert.match(source, /event\.source !== window\.parent/u);
  assert.match(source, /event\.origin !== window\.location\.origin/u);
  assert.match(source, /message\??\.type === "wheelmaker-theme"/u);
  assert.match(source, /document\.documentElement\.setAttribute\("saved-theme", mode\)/u);
  assert.match(source, /data-wheelmaker-theme-source/u);
  assert.match(source, /data-wheelmaker-theme-source="host"[\s\S]*?\.darkmode/u);
});

test('WheelMaker Wiki theme bridge validates embedded messages and ignores standalone pages', async () => {
  const source = await readFile(path.join(assetRoot, 'quartz', 'wheelmaker', 'components.mjs'), 'utf8');
  const startMarker = '  Component.beforeDOMLoaded = `';
  const endMarker = '`\n\n  Component.afterDOMLoaded = `';
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0 && end > start, 'WheelMaker sidebar must expose its before-DOM script');
  const script = source.slice(start + startMarker.length, end);

  const createRuntime = embedded => {
    const origin = 'https://wiki.example.test';
    const parent = {};
    const listeners = new Map();
    const attributes = new Map();
    const html = {
      setAttribute(name, value) { attributes.set(name, value); },
      getAttribute(name) { return attributes.get(name) ?? null; },
    };
    const document = { documentElement: html };
    const window = {
      parent: embedded ? parent : null,
      location: { origin, pathname: '/wiki/' },
      fetch() {},
      addEventListener(type, listener) { listeners.set(type, listener); },
    };
    if (!embedded) window.parent = window;
    class MutationObserver {
      observe() {}
    }
    runInNewContext(script, { URL, MutationObserver, document, window });
    return {
      attributes,
      emit(message) { listeners.get('message')?.(message); },
      origin,
      parent,
    };
  };

  const embedded = createRuntime(true);
  assert.equal(embedded.attributes.get('data-wheelmaker-theme-source'), 'host');
  embedded.emit({ source: {}, origin: embedded.origin, data: { type: 'wheelmaker-theme', mode: 'light' } });
  assert.equal(embedded.attributes.get('saved-theme'), undefined, 'untrusted source is ignored');
  embedded.emit({ source: embedded.parent, origin: 'https://attacker.example.test', data: { type: 'wheelmaker-theme', mode: 'light' } });
  assert.equal(embedded.attributes.get('saved-theme'), undefined, 'untrusted origin is ignored');
  embedded.emit({ source: embedded.parent, origin: embedded.origin, data: { type: 'wheelmaker-theme', mode: 'light' } });
  assert.equal(embedded.attributes.get('saved-theme'), 'light');

  const standalone = createRuntime(false);
  assert.equal(standalone.attributes.get('data-wheelmaker-theme-source'), undefined);
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
