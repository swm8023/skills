// Validate migrated reader components in Chromium without building or publishing.
// node tests/quartz-reader.browser.mjs --runtime <quartz> --playwright <index.mjs> --browser <executable>
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: Object.fromEntries(
  ['runtime', 'playwright', 'browser', 'artifacts', 'base-css', 'check'].map(name => [name, { type: 'string' }]),
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
const baseCSS = values['base-css'] ? await readFile(values['base-css'], 'utf8') : '';
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
  const progress = slug === 'guide/progress/note';
  const fileData = { slug, toc: progress
    ? Array.from({ length: 5 }, (_, i) => ({ depth: i % 2, text: `第 ${i + 1} 节`, slug: `progress-${i}` }))
    : !isList && slug !== 'reference/one' ? [{ depth: 0, text: '第一节', slug: '第一节' }, { depth: 1, text: '第二节', slug: '第二节' }] : [] };
  const article = progress
    ? '<article>' + fileData.toc.map(entry => `<h2 id="${entry.slug}">${entry.text}</h2><p class="progress-gap" style="height: 1200px">正文</p>`).join('') + '</article>'
    : '<article><h1 id="第一节">第一节</h1><p style="height: 100vh">正文</p><h2 id="第二节">第二节</h2><p style="height: 100vh">后续正文</p></article>';
  const props = { cfg, fileData, allFiles };
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.end(`<!doctype html><html saved-theme="light"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>
    ${baseCSS}
    :root { --light: #fff; --dark: #222; --darkgray: #444; --gray: #888; --lightgray: #ddd; --secondary: #405a72; --highlight: #eef; --bodyFont: sans-serif; --headerFont: sans-serif; }
    :root[saved-theme="dark"] { --light: #171719; --dark: #eee; --darkgray: #ccc; --gray: #999; --lightgray: #38383a; --highlight: #30303b; --secondary: #b4c9df; }
    /* Quartz base link styles must not leak into sidebar navigation. */
    a { font-weight: 600; text-decoration: none; color: var(--secondary); }
    a.internal { background-color: var(--highlight); padding: 0 0.1rem; border-radius: 5px; line-height: 1.4rem; }
    * { box-sizing: border-box; } body { margin: 0; font-family: sans-serif; color: var(--dark); background: var(--light); } #quartz-body { display: grid; grid-template-columns: 260px 1fr 220px; gap: 5px; } .sidebar.left { grid-area: grid-sidebar-left; } .sidebar.right { grid-area: grid-sidebar-right; } .center article { grid-area: grid-center; } .page-header { grid-area: grid-header; } footer { grid-area: grid-footer; }
    ${sidebar.css}\n${toc.css}\n${footer.css}\n${content.css}
    </style><script>${sidebar.beforeDOMLoaded}</script></head><body><div class="page"><div id="quartz-body">
    <aside class="sidebar left">${render(h(sidebar, props))}<button class="darkmode" aria-label="切换主题"><svg class="dayIcon"></svg><svg class="nightIcon"></svg></button></aside>
    <main class="center"><div class="page-header"><div class="popover-hint">${isList ? '' : '<h1 class="article-title">阅读示例</h1><ul class="tags"><li><a href="./tags/topic">topic</a></li></ul>'}</div></div>${isList ? render(h(content, props)) : article}</main>
    <aside class="sidebar right">${render(h(toc, props))}</aside>${render(h(footer, props))}
    </div></div><script>document.querySelector('.darkmode').onclick = () => document.documentElement.setAttribute('saved-theme', document.documentElement.getAttribute('saved-theme') === 'dark' ? 'light' : 'dark');\n${sidebar.afterDOMLoaded};\n${toc.afterDOMLoaded}</script></body></html>`);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/mount/wiki/`;
const browser = await chromium.launch({ headless: true, ...(values.browser ? { executablePath: values.browser } : {}) });
const failures = [];
async function check(name, viewport, run) {
  if (values.check && !name.includes(values.check)) return;
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
  for (const width of [390, 1440]) await check(`TOC progress at ${width}px stays contiguous across jumps and layout changes`, { width, height: 844 }, async page => {
    await page.goto(base + 'guide/progress/note');
    // Disable browser anchoring so content growth really changes the reading
    // position instead of being compensated by an automatic scroll adjustment.
    await page.evaluate(() => { document.documentElement.style.overflowAnchor = 'none'; });
    const highlighted = () => page.locator('.toc a').evaluateAll(links => links.map(link => link.classList.contains('in-view')));
    const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const jump = index => page.evaluate(index => window.scrollTo({ top: document.getElementById(`progress-${index}`).getBoundingClientRect().top + scrollY - 79, behavior: 'instant' }), index);
    await settle();
    await jump(2);
    await settle();
    assert.deepEqual(await highlighted(), [true, true, true, false, false], 'skipped headings are included, later headings are excluded');
    assert.equal(await page.locator('.toc a[aria-current="location"]').getAttribute('data-for'), 'progress-2');
    await jump(4);
    await settle();
    assert.deepEqual(await highlighted(), [true, true, true, true, true]);
    await jump(1);
    await settle();
    assert.deepEqual(await highlighted(), [true, true, false, false, false], 'jumping upward clears future progress');
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'instant' }));
    await settle();
    assert.deepEqual(await highlighted(), [true, true, false, false, false], 'a long section stays current after its title leaves view');
    if (width <= 800) {
      await page.locator('.knowledge-mobile-capsule').click();
      await settle();
      assert.deepEqual(await highlighted(), [true, true, false, false, false], 'locking the article for the drawer preserves progress');
      await page.setViewportSize({ width, height: 700 });
      await settle();
      assert.deepEqual(await highlighted(), [true, true, false, false, false]);
      await page.keyboard.press('Escape');
      await page.setViewportSize({ width, height: 844 });
    } else await page.locator('[data-knowledge-pane="toc"]').click();
    if (width <= 800) await page.locator('.knowledge-mobile-capsule').click();
    await page.locator('.toc a').nth(3).click();
    await page.waitForFunction(() => document.querySelector('.toc a[aria-current="location"]')?.dataset.for === 'progress-3');
    assert.deepEqual(await highlighted(), [true, true, true, true, false], 'fragment navigation updates the complete prefix');
    await jump(2);
    await settle();
    assert.deepEqual(await highlighted(), [true, true, true, false, false]);
    await page.locator('.progress-gap').first().evaluate(el => { el.style.height = '2000px'; });
    await page.waitForFunction(() => document.querySelector('.toc a[aria-current="location"]')?.dataset.for === 'progress-1');
    assert.deepEqual(await highlighted(), [true, true, false, false, false], 'content growth updates progress without another scroll');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await settle();
    assert.deepEqual(await highlighted(), [true, false, false, false, false]);
    await page.locator('.progress-gap').last().evaluate(el => { el.style.height = '0px'; });
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await settle();
    assert.deepEqual(await highlighted(), [true, true, true, true, true], 'the final section is current at the end of the page');
    await page.evaluate(async target => {
      const html = new DOMParser().parseFromString(await (await fetch(target)).text(), 'text/html');
      document.dispatchEvent(new Event('prenav'));
      document.body.replaceWith(html.body);
      history.pushState({}, '', target);
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.dispatchEvent(new Event('nav'));
      document.dispatchEvent(new Event('render'));
    }, base + 'guide/part2/note');
    await settle();
    assert.deepEqual(await highlighted(), [true, false], 'SPA navigation rebuilds heading references');
  });
  for (const width of [320, 390, 800]) await check(`mobile article rows at ${width}px fill the page with inset text`, { width, height: 844 }, async page => {
    for (const slug of ['', 'guide/index', 'tags/topic']) {
      await page.goto(base + slug);
      await page.locator('.knowledge-page-card').first().evaluate(el => {
        for (let i = 0; i < 20; i++) el.parentElement.append(el.cloneNode(true));
      });
      const row = page.locator('.knowledge-page-card-link').first();
      const bounds = await row.boundingBox();
      const pageWidth = await page.evaluate(() => document.documentElement.clientWidth);
      assert.ok(Math.abs(bounds.x) < 1, 'highlight and divider start at the page edge');
      assert.ok(Math.abs(bounds.x + bounds.width - pageWidth) < 1, 'highlight and divider reach the opposite edge');
      assert.ok((await row.locator('h2').boundingBox()).x >= 16, 'text retains its reading inset');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'full-width rows do not overflow');
      await row.focus();
      assert.notEqual(await row.evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'focus highlights the entire row');
      assert.ok(await row.evaluate(el => parseFloat(getComputedStyle(el).outlineOffset) <= 0), 'focus outline stays inside the page edges');
      if (values.artifacts && !slug) await page.screenshot({ path: path.join(values.artifacts, `full-width-row-${width}.png`) });
    }
  });
  await check('shared wide sidebar keeps navigation and search state across viewport changes', { width: 1440, height: 900 }, async page => {
    await page.goto(base + 'guide/part2/note');
    const panel = page.locator('#knowledge-mobile-panel');
    assert.equal(await panel.isVisible(), true, 'wide navigation is always visible');
    assert.equal(await panel.evaluate(el => el.matches(':modal')), false);
    assert.equal(await panel.getAttribute('role'), 'complementary');
    assert.equal(await page.locator('.sidebar.right').isVisible(), false);
    assert.equal(await page.locator('[role="tablist"]:visible').count(), 1);
    await panel.locator('[data-knowledge-pane="directory"]').click();
    assert.equal(await panel.locator('[data-folderpath="guide"] button').getAttribute('aria-expanded'), 'true');
    await panel.locator('[data-knowledge-pane="toc"]').click();
    await panel.locator('.toc a').nth(1).click();
    assert.equal(await panel.isVisible(), true, 'wide heading navigation leaves the sidebar open');
    await panel.locator('[data-knowledge-pane="search"]').click();
    await panel.locator('input').fill('正文搜索');
    await panel.locator('.result-card').first().waitFor();
    assert.equal(await panel.locator('.preview-container').isVisible(), false);
    await page.evaluate(() => { window.sharedSearchInput = document.querySelector('#knowledge-mobile-panel input'); });
    await page.setViewportSize({ width: 390, height: 844 });
    await panel.waitFor({ state: 'hidden' });
    await page.keyboard.press('Control+k');
    assert.equal(await panel.locator('[data-knowledge-pane="search"]').getAttribute('aria-selected'), 'true');
    assert.equal(await panel.locator('input').inputValue(), '正文搜索');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForFunction(() => !document.querySelector('#knowledge-mobile-panel').matches(':modal') && document.body.style.position !== 'fixed');
    assert.equal(await panel.isVisible(), true);
    assert.equal(await panel.locator('input').inputValue(), '正文搜索');
    assert.equal(await panel.locator('input').evaluate(el => el === window.sharedSearchInput), true, 'one set of live controls');
    assert.equal(await panel.locator('.result-card').count(), 3);
    await page.keyboard.press('Escape');
    assert.equal(await panel.isVisible(), true);
    await page.keyboard.press('Control+k');
    assert.equal(await panel.locator('input').evaluate(el => el === document.activeElement), true);
    await panel.locator('[data-knowledge-pane="directory"]').click();
    assert.equal(await panel.locator('[data-folderpath="guide"] button').getAttribute('aria-expanded'), 'true');
    if (values.artifacts) await page.screenshot({ path: path.join(values.artifacts, 'shared-wide.png') });
  });
  for (const width of [801, 1024, 1920]) {
    await check(`wide ${width}px: two columns and independent sidebar scrolling`, { width, height: 800 }, async page => {
      const panel = page.locator('#knowledge-mobile-panel');
      assert.equal(await panel.isVisible(), true);
      assert.equal(await panel.evaluate(el => el.matches(':modal')), false);
      assert.equal(await page.locator('.knowledge-mobile-capsule').isVisible(), false);
      assert.equal(await page.locator('.sidebar.right').isVisible(), false);
      const side = await panel.boundingBox();
      const center = await page.locator('.center').boundingBox();
      assert.ok(center.x >= side.x + side.width, 'sidebar does not cover the page');
      await panel.locator('[data-knowledge-pane="tags"]').click();
      const tagsPanel = panel.locator('[data-knowledge-panel="tags"]');
      await tagsPanel.evaluate(el => {
        const list = el.querySelector('ul');
        for (let i = 0; i < 60; i++) list.append(list.firstElementChild.cloneNode(true));
        el.scrollTop = el.scrollHeight;
      });
      assert.ok(await tagsPanel.evaluate(el => el.scrollTop > 0 && el.scrollHeight > el.clientHeight));
      assert.equal(await page.evaluate(() => scrollY), 0, 'scrolling tags does not scroll the article');
      assert.ok((await panel.locator('[role="tablist"]').boundingBox()).y >= 0);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.locator('.knowledge-page-card-link').first().focus();
      assert.equal(await page.evaluate(() => !!document.activeElement.closest('.center')), true, 'wide navigation does not trap focus');
    });
  }
  for (const width of [390, 1440]) for (const theme of ['light', 'dark']) {
    await check(`directory layout at ${width}px in ${theme} theme`, { width, height: 844 }, async page => {
      await page.goto(base + 'guide/part2/note');
      await page.evaluate(theme => document.documentElement.setAttribute('saved-theme', theme), theme);
      if (width <= 800) {
        await page.locator('.knowledge-mobile-capsule').click();
        await page.locator('[data-knowledge-pane="directory"]').click();
        await page.waitForFunction(() => document.querySelector('#knowledge-mobile-panel').getAnimations().length === 0);
      }
      const row = page.locator('[data-folderpath="guide/part2"]');
      const link = row.locator('a');
      const count = row.locator('.knowledge-tag-count');
      if (values.artifacts) await page.screenshot({ path: path.join(values.artifacts, `directory-${width}-${theme}.png`) });
      assert.equal(await link.evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'directory names have no article-link chip');
      const rowBounds = await row.boundingBox();
      const linkBounds = await link.boundingBox();
      const countBounds = await count.boundingBox();
      assert.ok(Math.abs(linkBounds.x + linkBounds.width - rowBounds.x - rowBounds.width) < 1, 'link fills the row');
      assert.ok(Math.abs(rowBounds.x + rowBounds.width - countBounds.x - countBounds.width - 8) < 1, 'count aligns to the right inset');
      assert.ok(linkBounds.height >= (width <= 800 ? 44 : 36), 'whole row remains a usable navigation target');
      assert.equal(await link.getAttribute('aria-current'), 'location');
      assert.notEqual(await row.evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'active directory highlights the row');
      const label = link.locator('.knowledge-nav-label');
      await label.evaluate(el => { el.textContent = 'kuaishou-ue5-engine-tools-with-a-very-long-directory-name'; });
      assert.equal(await label.evaluate(el => getComputedStyle(el).textOverflow), 'ellipsis');
      assert.ok(await label.evaluate(el => el.scrollWidth > el.clientWidth), 'long names truncate inside the label');
      const longCountBounds = await count.boundingBox();
      const labelBounds = await label.boundingBox();
      assert.ok(labelBounds.x + labelBounds.width + 7 <= longCountBounds.x, 'long name never overlaps the count');
      assert.ok(Math.abs(longCountBounds.x - countBounds.x) < 1, 'count stays aligned when the name grows');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    });
  }
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
    await page.locator('[data-knowledge-pane="tags"]').click();
    assert.equal(await page.locator('.explorer').isVisible(), false);
    await page.locator('[data-knowledge-pane="directory"]').click();
    assert.equal(await page.locator('.explorer').isVisible(), true);
  });
  await check('TOC toggle, fragment navigation, SPA rebinding and footer', { width: 1440, height: 900 }, async page => {
    await page.goto(base + 'guide/part2/note');
    await page.locator('[data-knowledge-pane="toc"]').click();
    assert.equal(await page.locator('.toc-content').isVisible(), true);
    await page.evaluate(() => { document.dispatchEvent(new Event('nav')); document.dispatchEvent(new Event('render')); });
    await page.locator('[data-knowledge-pane="toc"]').click();
    assert.equal(await page.locator('.toc-content').isVisible(), true);
    await page.locator('.toc a').nth(1).click();
    assert.equal(decodeURIComponent(new URL(page.url()).hash), '#第二节');
    assert.equal(await page.locator('.wheelmaker-footer a').textContent(), 'Quartz');
  });
  await check('mobile directory/tag navigation, saved folders and search', { width: 390, height: 844 }, async page => {
    assert.equal(await page.locator('.knowledge-mobile-capsule').count(), 1, 'mobile uses a single capsule');
    assert.equal((await page.locator('.knowledge-mobile-capsule').textContent()).trim(), '', 'entry is icon-only');
    assert.equal(await page.locator('.knowledge-mobile-bar').count(), 0, 'no persistent title bar');
    assert.equal(await page.locator('[data-knowledge-close]').count(), 0, 'header contains only the four navigation tabs');
    await page.locator('.knowledge-mobile-capsule').click();
    const dialog = page.locator('#knowledge-mobile-panel');
    assert.equal(await dialog.evaluate(el => el.open), true);
    await dialog.locator('[data-knowledge-pane="directory"]').click();
    await dialog.locator('[data-folderpath="guide"] button').click();
    assert.equal(await dialog.locator('[data-folderpath="guide/part2"] a').isVisible(), true);
    assert.equal(await dialog.locator('[role="tablist"]').count(), 1, 'one level of navigation tabs');
    assert.deepEqual(await dialog.locator('[data-knowledge-pane]').evaluateAll(tabs => tabs.map(tab => tab.getAttribute('aria-label'))), ['目录', '标签', '大纲', '搜索']);
    await dialog.getByRole('tab', { name: '标签', exact: true }).click();
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
      const capsuleBounds = await capsule.boundingBox();
      assert.ok(capsuleBounds.x > width / 2 && Math.abs(width - capsuleBounds.x - capsuleBounds.width - 12) < 1, 'capsule stays at the right inset');
      assert.equal((await page.locator('.sidebar.left').boundingBox()).height, 0);
      const homeCount = await page.locator('.knowledge-home .knowledge-page-meta').boundingBox();
      assert.ok(homeCount.x + homeCount.width < capsuleBounds.x, 'home article count remains visible beside the capsule');
      assert.ok((await page.locator('.knowledge-page-card').first().boundingBox()).y < 100, 'home starts without a toolbar row');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (values.artifacts && width === 390) await page.screenshot({ path: path.join(values.artifacts, 'home.png') });
      await capsule.click();
      assert.equal(await panel.locator('[data-knowledge-pane="directory"]').getAttribute('aria-selected'), 'true');
      assert.equal(await panel.locator('[data-knowledge-pane="toc"]').isDisabled(), true);
      await page.waitForFunction(() => document.querySelector('#knowledge-mobile-panel').getAnimations().length === 0);
      const bounds = await panel.boundingBox();
      assert.equal(bounds.x, 0, 'drawer attaches to the left edge');
      assert.equal(bounds.y, 0);
      assert.ok(bounds.height >= height - 1, 'drawer uses the full available height');
      assert.ok(bounds.width <= width - 44, 'drawer leaves a strip of the page visible');
      await page.mouse.click(width - 2, height - 2);
      await panel.waitFor({ state: 'hidden' });
      assert.equal(await panel.isVisible(), false);
      assert.equal(await capsule.evaluate(el => el === document.activeElement), true);
      await page.goto(base + 'guide/part2/note');
      assert.equal(await page.locator('.article-title').isVisible(), true);
      const title = page.locator('.article-title');
      const titleText = 'Lesson A：环境、工具链与第一次编译';
      // Exceed balanced wrapping's short-heading limit to measure available line width.
      await title.evaluate((el, text) => { el.textContent = text.repeat(10); }, titleText);
      const titleLayout = await title.evaluate(el => {
        const range = document.createRange(); range.selectNodeContents(el);
        return { left: el.getBoundingClientRect().left, lines: [...range.getClientRects()].map(rect => ({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom })) };
      });
      assert.ok(Math.abs(titleLayout.lines[0].left - titleLayout.left) < 1, 'title starts at the article edge');
      const buttonBounds = await capsule.boundingBox();
      assert.ok(titleLayout.lines.every(line => line.bottom <= buttonBounds.y || line.top >= buttonBounds.y + buttonBounds.height || line.right <= buttonBounds.x - 4), 'title never overlaps the button');
      assert.ok(titleLayout.lines.some(line => line.top >= buttonBounds.y + buttonBounds.height && line.right > buttonBounds.x), 'later title lines regain the full reading width');
      await title.evaluate((el, text) => { el.textContent = text; }, titleText);
      if (values.artifacts && width === 390) await page.screenshot({ path: path.join(values.artifacts, 'article.png') });
      await page.evaluate(() => window.scrollTo(0, 400));
      const readingPosition = await page.evaluate(() => window.scrollY);
      assert.ok((await capsule.boundingBox()).y < 20, 'capsule stays fixed when reading');
      for (const dismiss of ['Escape', 'backdrop']) {
        await capsule.click();
        assert.equal(await panel.locator('[data-knowledge-pane="toc"]').getAttribute('aria-selected'), 'true');
        assert.equal(await page.evaluate(() => getComputedStyle(document.body).position), 'fixed');
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('Tab');
          assert.equal(await page.evaluate(() => document.activeElement === document.body || !!document.activeElement.closest('dialog[open]')), true);
        }
        if (dismiss === 'Escape') await page.keyboard.press('Escape');
        else await page.mouse.click(width - 2, height - 2);
        await panel.waitFor({ state: 'hidden' });
        assert.equal(await page.evaluate(() => window.scrollY), readingPosition, `${dismiss} preserves scroll`);
        assert.equal(await capsule.evaluate(el => el === document.activeElement), true);
      }
      await capsule.click();
      await panel.locator('[data-knowledge-pane="search"]').click();
      await page.keyboard.press('Escape');
      await capsule.click();
      assert.equal(await panel.locator('[data-knowledge-pane="toc"]').getAttribute('aria-selected'), 'true', 'each opening resets context');
      await page.waitForFunction(() => document.querySelector('#knowledge-mobile-panel').getAnimations().length === 0);
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
  await check('drawer interruption, reversal and exit cleanup', { width: 390, height: 844 }, async page => {
    await page.goto(base + 'guide/part2/note');
    await page.evaluate(() => window.scrollTo(0, 400));
    // Pause native animations to exercise interruption at a deterministic visible position.
    const state = await page.evaluate(() => {
      const panel = document.querySelector('#knowledge-mobile-panel');
      const click = selector => document.querySelector(selector).dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, clientX: innerWidth - 1, clientY: innerHeight - 1 }));
      const pause = progress => {
        const animation = panel.getAnimations().find(item => item.effect.getKeyframes().some(frame => frame.transform));
        animation.pause();
        animation.currentTime = animation.effect.getTiming().duration * progress;
        return animation;
      };
      click('.knowledge-mobile-capsule');
      const entering = pause(0.2);
      const entryX = panel.getBoundingClientRect().x;
      const visible = getComputedStyle(panel).transform;
      click('#knowledge-mobile-panel');
      const exiting = pause(0.25);
      const exitStart = exiting.effect.getKeyframes()[0].transform;
      const exitVisible = getComputedStyle(panel).transform;
      const locked = panel.matches(':modal') && document.body.style.position === 'fixed';
      click('[data-knowledge-pane="tags"]');
      const reversed = pause(0.5);
      const reverseStart = reversed.effect.getKeyframes()[0].transform;
      reversed.finish();
      return { entryX, width: panel.getBoundingClientRect().width, visible, exitStart, exitVisible, reverseStart, locked,
        enterDuration: entering.effect.getTiming().duration, exitDuration: exiting.effect.getTiming().duration };
    });
    assert.ok(state.entryX < 0 && state.entryX > -state.width);
    assert.equal(state.enterDuration, 280);
    assert.equal(state.exitDuration, 180);
    assert.equal(state.exitStart, state.visible, 'closing starts at the visible entry position');
    assert.equal(state.reverseStart, state.exitVisible, 'reopening starts at the visible exit position');
    assert.equal(state.locked, true, 'focus trap and body lock survive the exit animation');
    const panel = page.locator('#knowledge-mobile-panel');
    await page.waitForFunction(() => document.querySelector('#knowledge-mobile-panel').getAnimations().length === 0);
    assert.equal(await panel.isVisible(), true, 'cancelled exit cannot close the reopened drawer');
    assert.equal(await panel.locator('[data-knowledge-pane="tags"]').getAttribute('aria-selected'), 'true');
    assert.equal(await panel.locator('[data-knowledge-slot="article-tags"] .tags').isVisible(), true);
    if (values.artifacts) await page.screenshot({ path: path.join(values.artifacts, 'tags.png') });
    for (const action of ['escape', 'breakpoint', 'prenav']) {
      const readingPosition = await page.evaluate(() => -parseFloat(document.body.style.top));
      await page.evaluate(() => {
        document.querySelector('#knowledge-mobile-panel').dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, clientX: innerWidth - 1, clientY: innerHeight - 1 }));
        document.querySelector('#knowledge-mobile-panel').getAnimations().forEach(animation => animation.pause());
      });
      if (action === 'escape') await page.keyboard.press('Escape');
      if (action === 'breakpoint') await page.setViewportSize({ width: 1440, height: 900 });
      if (action === 'prenav') await page.evaluate(() => document.dispatchEvent(new Event('prenav')));
      if (action !== 'breakpoint') await panel.waitFor({ state: 'hidden' });
      await page.waitForFunction(() => document.body.style.position !== 'fixed' && !document.querySelector('#knowledge-mobile-panel').matches(':modal'));
      if (action === 'breakpoint') assert.equal(await panel.isVisible(), true);
      // Resizing and prenav restore nodes and reflow the page; only dismissal preserves its layout.
      if (action === 'escape') assert.equal(await page.evaluate(() => scrollY), readingPosition);
      assert.equal(await panel.evaluate(el => el.getAnimations().length), 0);
      if (action === 'breakpoint') await page.setViewportSize({ width: 390, height: 844 });
      await page.evaluate(() => document.dispatchEvent(new Event('nav')));
      await page.locator('.knowledge-mobile-capsule').click();
    }
  });
  await check('drawer timing survives CSS time unit minification', { width: 390, height: 844 }, async page => {
    for (const [enter, exit] of [['280ms', '180ms'], ['.28s', '.18s']]) {
      const timings = await page.evaluate(({ enter, exit }) => {
        const panel = document.querySelector('#knowledge-mobile-panel');
        panel.style.setProperty('--motion-emphasized', enter);
        panel.style.setProperty('--motion-exit', exit);
        const click = selector => document.querySelector(selector).dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, clientX: innerWidth - 1, clientY: innerHeight - 1 }));
        const duration = () => {
          const animation = panel.getAnimations().find(item => item.effect.getKeyframes().some(frame => frame.transform));
          animation.pause();
          return animation.effect.getTiming().duration;
        };
        click('.knowledge-mobile-capsule');
        const opening = duration();
        click('#knowledge-mobile-panel');
        return { opening, closing: duration() };
      }, { enter, exit });
      assert.equal(timings.opening, 280, `${enter} retains the intended entry duration`);
      assert.equal(timings.closing, 180, `${exit} retains the intended exit duration`);
      await page.keyboard.press('Escape');
    }
  });
  await check('drawer keyboard tabs and reduced motion', { width: 390, height: 844 }, async page => {
    const capsule = page.locator('.knowledge-mobile-capsule');
    const panel = page.locator('#knowledge-mobile-panel');
    await capsule.focus();
    await page.keyboard.press('Enter');
    assert.equal(await panel.evaluate(el => el.getAnimations().length), 0, 'keyboard opening is immediate');
    await page.keyboard.press('ArrowRight');
    assert.equal(await panel.locator('[data-knowledge-pane="tags"]').getAttribute('aria-selected'), 'true');
    await page.keyboard.press('ArrowRight');
    assert.equal(await panel.locator('input').evaluate(el => el === document.activeElement), true, 'arrows skip unavailable outline and focus search');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Control+k');
    assert.equal(await panel.evaluate(el => el.getAnimations().length), 0);
    await page.keyboard.press('Escape');
    for (const phase of ['entry', 'exit']) {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.evaluate(phase => {
        document.querySelector('.knowledge-mobile-capsule').dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, clientX: innerWidth - 1, clientY: innerHeight - 1 }));
        if (phase === 'exit') document.querySelector('#knowledge-mobile-panel').dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, clientX: innerWidth - 1, clientY: innerHeight - 1 }));
        document.querySelector('#knowledge-mobile-panel').getAnimations().forEach(animation => animation.pause());
      }, phase);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => document.querySelector('#knowledge-mobile-panel').getAnimations().length === 0);
      assert.equal(await panel.isVisible(), phase === 'entry');
      await page.keyboard.press('Escape');
    }
    await capsule.click();
    assert.equal(await panel.evaluate(el => el.getAnimations().length), 0, 'reduced-motion pointer opening is immediate');
    await page.mouse.click(389, 843);
    assert.equal(await panel.isVisible(), false);
  });
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
    await page.waitForFunction(() => document.querySelector('#knowledge-mobile-panel').getAttribute('role') === 'complementary');
    assert.equal(await capsule.isVisible(), false);
    assert.equal(await page.locator('#knowledge-mobile-panel .tags').count(), 1);
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).position), 'fixed');
    await page.goto(base + 'guide/part2/note');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(() => !!document.querySelector('#knowledge-mobile-panel .toc'));
    await capsule.click();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForFunction(() => document.querySelector('#knowledge-mobile-panel').getAttribute('role') === 'complementary');
    assert.equal(await page.locator('#knowledge-mobile-panel .toc a').count(), 2);
    assert.equal(await page.locator('.sidebar.right').isVisible(), false);
    if (values.artifacts) await page.screenshot({ path: path.join(values.artifacts, 'desktop.png') });
  });
  for (const width of [390, 1440]) await check(`SPA lifecycle at ${width}px replaces and reuses nodes without losing controls`, { width, height: 844 }, async page => {
    for (const slug of ['guide/part2/note', 'reference/one', 'index', 'guide/part2/note']) {
      if (width <= 800) await page.locator('.knowledge-mobile-capsule').click();
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
      if (width <= 800) await page.locator('.knowledge-mobile-capsule').click();
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
