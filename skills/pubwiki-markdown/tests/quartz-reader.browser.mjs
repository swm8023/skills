// Validate migrated reader components in Chromium without building or publishing.
// node tests/quartz-reader.browser.mjs --runtime <quartz> --playwright <index.mjs> --browser <executable>
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: Object.fromEntries(
  ['runtime', 'playwright', 'browser'].map(name => [name, { type: 'string' }]),
) });
for (const name of ['runtime', 'playwright']) assert.ok(values[name], `--${name} is required`);
const runtimeURL = pathToFileURL(path.join(path.resolve(values.runtime), 'package.json')).href;
registerHooks({ resolve(specifier, context, next) {
  return next(specifier, ['preact', 'preact-render-to-string', '@quartz-community/utils'].includes(specifier)
    ? { ...context, parentURL: runtimeURL } : context);
} });
const { h } = await import('preact');
const { render } = await import('preact-render-to-string');
const { WheelMakerSidebar } = await import('../assets/quartz/quartz/wheelmaker/layout.mjs');
const { WheelMakerTableOfContents, WheelMakerFooter } = await import('../assets/quartz/quartz/wheelmaker/reader.mjs');
const { chromium } = await import(pathToFileURL(path.resolve(values.playwright)).href);
const sidebar = WheelMakerSidebar();
const toc = WheelMakerTableOfContents();
const footer = WheelMakerFooter();
const cfg = { locale: 'zh-CN', pageTitle: 'Reader fixture' };
const allFiles = ['guide/part2/note', 'guide/part10/other', 'reference/one'].map(slug => ({ slug, frontmatter: { title: slug, tags: ['topic/sub'] } }));
const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname.endsWith('/static/searchIndex.json')) {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(Object.fromEntries(allFiles.map(file => [file.slug, { title: file.frontmatter.title, content: '正文搜索', tags: ['topic/sub'] }]))));
    return;
  }
  const slug = url.pathname.replace(/^\/mount\/wiki\//, '').replace(/\/$/, '/index') || 'index';
  const fileData = { slug, toc: [{ depth: 0, text: '第一节', slug: '第一节' }, { depth: 1, text: '第二节', slug: '第二节' }] };
  const props = { cfg, fileData, allFiles };
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.end(`<!doctype html><html saved-theme="light"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>
    :root { --light: #fff; --dark: #222; --darkgray: #444; --gray: #888; --lightgray: #ddd; --secondary: #405a72; --highlight: #eef; --bodyFont: sans-serif; --headerFont: sans-serif; }
    * { box-sizing: border-box; } body { margin: 0; font-family: sans-serif; } .page { padding: 1rem; } #quartz-body { display: grid; grid-template-columns: 260px 1fr 220px; gap: 2rem; } .sidebar.left { grid-column: 1; } .center { grid-column: 2; } .sidebar.right { grid-column: 3; }
    ${sidebar.css}\n${toc.css}\n${footer.css}
    </style><script>${sidebar.beforeDOMLoaded}</script></head><body><div class="page"><div id="quartz-body">
    <aside class="sidebar left">${render(h(sidebar, props))}</aside>
    <main class="center"><article><h1 id="第一节">第一节</h1><p style="height: 100vh">正文</p><h2 id="第二节">第二节</h2></article></main>
    <aside class="sidebar right">${render(h(toc, props))}</aside>${render(h(footer, props))}
    </div></div><script>${sidebar.afterDOMLoaded};\n${toc.afterDOMLoaded}</script></body></html>`);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/mount/wiki/`;
const browser = await chromium.launch({ headless: true, ...(values.browser ? { executablePath: values.browser } : {}) });
const failures = [];
async function check(name, viewport, run) {
  const page = await browser.newPage({ viewport });
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(base);
    await run(page);
    assert.deepEqual(errors, []);
    console.log(`PASS ${name}`);
  } catch (error) { failures.push(name); console.error(`FAIL ${name}: ${error.stack}`); }
  finally { await page.close(); }
}
try {
  await check('desktop directory expansion, persistence, mounted links and active ancestors', { width: 1440, height: 900 }, async page => {
    const guide = page.locator('[data-folderpath="guide"]');
    const toggle = guide.locator('button');
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    await page.reload();
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    const links = page.locator('[data-folderpath="guide/part2"] a');
    assert.match(await links.getAttribute('href'), /guide\/part2/);
    await links.click();
    assert.ok(page.url().startsWith(base));
    assert.equal(await page.locator('[data-folderpath="guide/part2"] a').getAttribute('aria-current'), 'page');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    // Repeated SPA lifecycle events must not duplicate labels or handlers.
    await page.evaluate(() => { for (let i = 0; i < 3; i++) document.dispatchEvent(new Event('nav')); });
    assert.equal(await guide.locator('.knowledge-tag-count').count(), 1);
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    await page.evaluate(() => {
      history.pushState({}, '', '/mount/wiki/guide/part10/other');
      document.dispatchEvent(new Event('nav'));
    });
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true', 'SPA navigation opens ancestors even when the sidebar DOM is reused');
    assert.equal(await page.locator('[data-folderpath="guide/part10"] a').getAttribute('aria-current'), 'location');
    await page.locator('[data-knowledge-view="tags"]').click();
    assert.equal(await page.locator('.explorer').getAttribute('aria-hidden'), 'true');
    await page.locator('[data-knowledge-view="directory"]').click();
    assert.equal(await page.locator('.explorer').getAttribute('aria-hidden'), 'false');
  });
  await check('TOC toggle, fragment navigation, SPA rebinding and footer', { width: 1440, height: 900 }, async page => {
    await page.locator('.toc-header').click();
    assert.equal(await page.locator('.toc-content').isVisible(), false);
    await page.evaluate(() => { document.dispatchEvent(new Event('nav')); document.dispatchEvent(new Event('render')); });
    await page.locator('.toc-header').click();
    assert.equal(await page.locator('.toc-content').isVisible(), true);
    await page.locator('.toc a').nth(1).click();
    assert.equal(decodeURIComponent(new URL(page.url()).hash), '#第二节');
    assert.equal(await page.locator('.wheelmaker-footer a').textContent(), 'Quartz');
  });
  await check('mobile directory/tag navigation, saved folders and search', { width: 390, height: 844 }, async page => {
    await page.locator('[data-knowledge-open="navigation"]').click();
    const dialog = page.locator('#knowledge-mobile-navigation');
    assert.equal(await dialog.evaluate(el => el.open), true);
    await dialog.locator('[data-folderpath="guide"] button').click();
    assert.equal(await dialog.locator('[data-folderpath="guide/part2"] a').isVisible(), true);
    await dialog.locator('[data-knowledge-view="tags"]').click();
    assert.equal(await dialog.locator('.knowledge-tags-sidebar').isVisible(), true);
    await page.keyboard.press('Escape');
    assert.equal(await dialog.evaluate(el => el.open), false);
    await page.locator('[data-knowledge-open="search"]').click();
    await page.locator('#knowledge-mobile-search input').fill('正文搜索');
    await page.locator('.result-card').first().waitFor();
    assert.equal(await page.locator('.result-card').count(), 3);
    assert.equal(await page.locator('.wheelmaker-footer').isVisible(), false);
  });
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
assert.deepEqual(failures, []);
