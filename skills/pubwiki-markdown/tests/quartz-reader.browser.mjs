// Validate migrated reader components in Chromium without building or publishing.
// node tests/quartz-reader.browser.mjs --runtime <quartz> --playwright <index.mjs> --browser <executable>
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir } from 'node:fs/promises';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: Object.fromEntries(
  ['runtime', 'playwright', 'browser', 'artifacts'].map(name => [name, { type: 'string' }]),
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
const { WheelMakerHomePage } = await import('../assets/quartz/quartz/wheelmaker/pages.mjs');
const { chromium } = await import(pathToFileURL(path.resolve(values.playwright)).href);
const sidebar = WheelMakerSidebar();
const toc = WheelMakerTableOfContents();
const footer = WheelMakerFooter();
const content = WheelMakerHomePage().body();
if (values.artifacts) await mkdir(values.artifacts, { recursive: true });
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
  const isList = slug === 'index' || slug.endsWith('/index') || slug.startsWith('tags/');
  const fileData = { slug, toc: !isList && slug !== 'reference/one' ? [{ depth: 0, text: '第一节', slug: '第一节' }, { depth: 1, text: '第二节', slug: '第二节' }] : [] };
  const props = { cfg, fileData, allFiles };
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.end(`<!doctype html><html saved-theme="light"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>
    :root { --light: #fff; --dark: #222; --darkgray: #444; --gray: #888; --lightgray: #ddd; --secondary: #405a72; --highlight: #eef; --bodyFont: sans-serif; --headerFont: sans-serif; }
    :root[saved-theme="dark"] { --light: #171719; --dark: #eee; --darkgray: #ccc; --gray: #999; --lightgray: #38383a; --highlight: #30303b; --secondary: #b4c9df; }
    * { box-sizing: border-box; } body { margin: 0; font-family: sans-serif; color: var(--dark); background: var(--light); } #quartz-body { display: grid; grid-template-columns: 260px 1fr 220px; gap: 5px; } .sidebar.left { grid-area: grid-sidebar-left; } .sidebar.right { grid-area: grid-sidebar-right; } .center article { grid-area: grid-center; } .page-header { grid-area: grid-header; } footer { grid-area: grid-footer; }
    ${sidebar.css}\n${toc.css}\n${footer.css}\n${content.css}
    </style><script>${sidebar.beforeDOMLoaded}</script></head><body><div class="page"><div id="quartz-body">
    <aside class="sidebar left">${render(h(sidebar, props))}<button class="darkmode" aria-label="切换主题"><svg class="dayIcon"></svg><svg class="nightIcon"></svg></button></aside>
    <main class="center"><div class="page-header"><div class="popover-hint">${isList ? '' : '<h1 class="article-title">阅读示例</h1><ul class="tags"><li><a href="./tags/topic">topic</a></li></ul>'}</div></div>${isList ? render(h(content, props)) : '<article><h1 id="第一节">第一节</h1><p style="height: 100vh">正文</p><h2 id="第二节">第二节</h2><p style="height: 100vh">后续正文</p></article>'}</main>
    <aside class="sidebar right">${render(h(toc, props))}</aside>${render(h(footer, props))}
    </div></div><script>document.querySelector('.darkmode').onclick = () => document.documentElement.setAttribute('saved-theme', document.documentElement.getAttribute('saved-theme') === 'dark' ? 'light' : 'dark');\n${sidebar.afterDOMLoaded};\n${toc.afterDOMLoaded}</script></body></html>`);
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
    await page.goto(base + 'guide/part2/note');
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
    assert.equal(await page.locator('.knowledge-mobile-capsule').count(), 1, 'mobile uses a single capsule');
    assert.equal(await page.locator('.knowledge-mobile-bar').count(), 0, 'no persistent title bar');
    await page.locator('.knowledge-mobile-capsule').click();
    const dialog = page.locator('#knowledge-mobile-panel');
    assert.equal(await dialog.evaluate(el => el.open), true);
    await dialog.locator('[data-knowledge-pane="directory"]').click();
    await dialog.locator('[data-folderpath="guide"] button').click();
    assert.equal(await dialog.locator('[data-folderpath="guide/part2"] a').isVisible(), true);
    await dialog.locator('[data-knowledge-view="tags"]').click();
    assert.equal(await dialog.locator('.knowledge-tags-sidebar').isVisible(), true);
    await page.keyboard.press('Escape');
    assert.equal(await dialog.evaluate(el => el.open), false);
    await page.locator('.knowledge-mobile-capsule').click();
    await dialog.locator('[data-knowledge-pane="search"]').click();
    await dialog.locator('input').fill('正文搜索');
    await page.locator('.result-card').first().waitFor();
    assert.equal(await page.locator('.result-card').count(), 3);
    assert.equal(await page.locator('.wheelmaker-footer').isVisible(), false);
  });
  for (const [width, height] of [[320, 568], [390, 844], [768, 500], [800, 390]]) {
    await check(`mobile ${width}×${height}: default pane, reading space, scroll, focus and heading navigation`, { width, height }, async page => {
      const capsule = page.locator('.knowledge-mobile-capsule');
      const panel = page.locator('#knowledge-mobile-panel');
      assert.equal((await page.locator('.sidebar.left').boundingBox()).height, 0);
      assert.ok((await page.locator('.knowledge-page-card').first().boundingBox()).y < 100, 'home starts without a toolbar row');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (values.artifacts && width === 390) await page.screenshot({ path: path.join(values.artifacts, 'home.png') });
      await capsule.click();
      assert.equal(await panel.locator('[data-knowledge-pane="directory"]').getAttribute('aria-selected'), 'true');
      assert.equal(await panel.locator('[data-knowledge-pane="toc"]').isDisabled(), true);
      const bounds = await panel.boundingBox();
      assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= height - 40, 'panel leaves some page visible');
      await page.mouse.click(width - 2, height - 2);
      assert.equal(await panel.isVisible(), false);
      assert.equal(await capsule.evaluate(el => el === document.activeElement), true);
      await page.goto(base + 'guide/part2/note');
      assert.equal(await page.locator('.article-title').isVisible(), true);
      if (values.artifacts && width === 390) await page.screenshot({ path: path.join(values.artifacts, 'article.png') });
      await page.evaluate(() => window.scrollTo(0, 400));
      const readingPosition = await page.evaluate(() => window.scrollY);
      assert.ok((await capsule.boundingBox()).y < 20, 'capsule stays fixed when reading');
      for (const dismiss of ['Escape', 'button', 'backdrop']) {
        await capsule.click();
        assert.equal(await panel.locator('[data-knowledge-pane="toc"]').getAttribute('aria-selected'), 'true');
        assert.equal(await page.evaluate(() => getComputedStyle(document.body).position), 'fixed');
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('Tab');
          assert.equal(await page.evaluate(() => document.activeElement === document.body || !!document.activeElement.closest('dialog[open]')), true);
        }
        if (dismiss === 'Escape') await page.keyboard.press('Escape');
        else if (dismiss === 'button') await panel.locator('[data-knowledge-close]').click();
        else await page.mouse.click(width - 2, height - 2);
        assert.equal(await page.evaluate(() => window.scrollY), readingPosition, `${dismiss} preserves scroll`);
        assert.equal(await capsule.evaluate(el => el === document.activeElement), true);
      }
      await capsule.click();
      await panel.locator('[data-knowledge-pane="search"]').click();
      await page.keyboard.press('Escape');
      await capsule.click();
      assert.equal(await panel.locator('[data-knowledge-pane="toc"]').getAttribute('aria-selected'), 'true', 'each opening resets context');
      if (values.artifacts && width === 390) await page.screenshot({ path: path.join(values.artifacts, 'toc.png') });
      await panel.locator('.toc a').nth(1).click();
      assert.equal(await panel.isVisible(), false);
      assert.equal(decodeURIComponent(new URL(page.url()).hash), '#第二节');
      assert.ok((await page.locator('h2#第二节').boundingBox()).y >= (await capsule.boundingBox()).y + 44, 'heading clears capsule');
      await page.goto(base + 'reference/one');
      await capsule.click();
      assert.equal(await panel.locator('[data-knowledge-pane="directory"]').getAttribute('aria-selected'), 'true', 'no TOC falls back to directory');
      await panel.locator('[data-folderpath="guide"] a').click();
      await page.waitForURL(url => url.pathname.includes('/guide/'));
      assert.equal(await panel.isVisible(), false, 'directory navigation closes panel');
    });
  }
  await check('mobile search feedback, viewport contraction, theme and responsive restoration', { width: 390, height: 844 }, async page => {
    await page.goto(base + 'guide/part2/note');
    const capsule = page.locator('.knowledge-mobile-capsule');
    const panel = page.locator('#knowledge-mobile-panel');
    await page.route('**/static/searchIndex.json', route => route.fulfill({ status: 503, body: 'unavailable' }));
    await capsule.click();
    await panel.locator('[data-knowledge-pane="search"]').click();
    assert.equal(await panel.locator('input').evaluate(el => el === document.activeElement), true);
    await panel.locator('input').fill('正文搜索');
    await panel.getByRole('button', { name: '重试', exact: true }).waitFor();
    await page.unroute('**/static/searchIndex.json');
    await panel.getByRole('button', { name: '重试', exact: true }).click();
    await panel.locator('.result-card:not(.no-match)').first().waitFor();
    await panel.locator('input').fill('zzznomatch');
    await panel.getByText('没有找到结果', { exact: true }).waitFor();
    await panel.locator('input').fill('正文搜索');
    await panel.locator('.result-card:not(.no-match)').first().waitFor();
    await page.setViewportSize({ width: 390, height: 380 });
    await page.waitForFunction(() => document.querySelector('#knowledge-mobile-panel').style.getPropertyValue('--knowledge-viewport-height') === visualViewport.height + 'px');
    const bounds = await panel.boundingBox();
    const input = await panel.locator('input').boundingBox();
    assert.ok(bounds.y + bounds.height <= 380 && input.y + input.height < 380, 'search fits a contracted viewport');
    const searchPanel = panel.locator('[data-knowledge-panel="search"]');
    assert.ok(await searchPanel.evaluate(el => el.scrollHeight > el.clientHeight), 'results scroll inside panel');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await panel.locator('.darkmode').click();
    assert.equal(await page.locator('html').getAttribute('saved-theme'), 'dark');
    assert.equal(await panel.evaluate(el => el.getAnimations().length), 0);
    if (values.artifacts) await page.screenshot({ path: path.join(values.artifacts, 'search-compact-dark.png') });
    await panel.locator('.result-card:not(.no-match)').last().click();
    await page.waitForURL(base + 'reference/one');
    assert.equal(await panel.isVisible(), false);
    await page.keyboard.press('Control+k');
    assert.equal(await panel.isVisible(), true, 'search shortcut opens shared panel');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForFunction(() => !!document.querySelector('.sidebar.left > .flex-component .search'));
    assert.equal(await capsule.isVisible(), false);
    assert.equal(await page.locator('.page-header .tags').count(), 1);
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).position), 'fixed');
    await page.goto(base + 'guide/part2/note');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(() => !!document.querySelector('#knowledge-mobile-panel .toc'));
    await capsule.click();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForFunction(() => !!document.querySelector('.sidebar.right > .toc'));
    assert.equal(await page.locator('.sidebar.right .toc a').count(), 2);
    if (values.artifacts) await page.screenshot({ path: path.join(values.artifacts, 'desktop.png') });
  });
  await check('mobile SPA lifecycle replaces and reuses nodes without losing controls', { width: 390, height: 844 }, async page => {
    for (const slug of ['guide/part2/note', 'reference/one', 'index', 'guide/part2/note']) {
      await page.locator('.knowledge-mobile-capsule').click();
      // Exercise Quartz's prenav -> body replacement -> nav contract with real SSR components.
      await page.evaluate(async target => {
        const html = new DOMParser().parseFromString(await (await fetch(target)).text(), 'text/html');
        document.dispatchEvent(new Event('prenav'));
        document.body.replaceWith(html.body);
        history.pushState({}, '', target);
        document.dispatchEvent(new Event('nav'));
      }, base + slug);
      for (let i = 0; i < 3; i++) await page.evaluate(() => document.dispatchEvent(new Event('nav')));
      assert.equal(await page.locator('.knowledge-mobile-capsule').count(), 1);
      assert.equal(await page.locator('#knowledge-mobile-panel .search').count(), 1);
      await page.locator('.knowledge-mobile-capsule').click();
      await page.locator('[data-knowledge-pane="search"]').click();
      await page.locator('#knowledge-mobile-panel input').fill('正文搜索');
      await page.locator('.result-card').first().waitFor();
      await page.keyboard.press('Escape');
      assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).position), 'fixed');
    }
  });
  await check('embedded theme follows host and standalone retains its control', { width: 390, height: 844 }, async page => {
    await page.evaluate(url => {
      const iframe = document.createElement('iframe');
      iframe.src = url; iframe.style.cssText = 'width: 390px; height: 844px';
      document.body.replaceChildren(iframe);
    }, base + 'guide/part2/note');
    const iframe = page.frameLocator('iframe');
    await iframe.locator('.knowledge-mobile-capsule').click();
    await page.evaluate(() => document.querySelector('iframe').contentWindow.postMessage({ type: 'wheelmaker-theme', mode: 'dark' }, location.origin));
    await iframe.locator('html[saved-theme="dark"]').waitFor({ state: 'attached' });
    assert.equal(await iframe.locator('.knowledge-mobile-theme-control').isVisible(), false);
    await page.goto(base);
    await page.locator('.knowledge-mobile-capsule').click();
    assert.equal(await page.locator('.knowledge-mobile-theme-control').isVisible(), true);
  });
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
assert.deepEqual(failures, []);
