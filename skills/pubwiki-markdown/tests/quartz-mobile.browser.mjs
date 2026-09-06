// Run against an existing local Quartz export without building or publishing:
// node quartz-mobile.browser.mjs --site <static-output> --runtime <quartz-runtime>
//   --playwright <playwright/index.mjs> --browser <chromium-executable> --artifacts <directory>
// Add --desktop-only for the desktop navigation, result-page and density checks.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

const { values } = parseArgs({ options: {
  ...Object.fromEntries(['site', 'runtime', 'playwright', 'browser', 'artifacts'].map(name => [name, { type: 'string' }])),
  'desktop-only': { type: 'boolean', default: false },
} });
for (const name of ['site', 'runtime', 'playwright']) assert.ok(values[name], `--${name} is required`);
const root = path.resolve(values.site);
const runtimeURL = pathToFileURL(path.join(path.resolve(values.runtime), 'package.json')).href;
registerHooks({ resolve(specifier, context, next) {
  return next(specifier, ['preact', 'preact-render-to-string', '@quartz-community/utils', 'parse5'].includes(specifier)
    ? { ...context, parentURL: runtimeURL } : context);
} });
const { chromium } = await import(pathToFileURL(path.resolve(values.playwright)).href);
const { h } = await import('preact');
const { render } = await import('preact-render-to-string');
const { parse, parseFragment, serialize } = await import('parse5');
const { KnowledgeSidebarSwitch, KnowledgeTagSidebar } = await import('../assets/quartz/quartz/wheelmaker/components.mjs');
const { WheelMakerHomePage } = await import('../assets/quartz/quartz/wheelmaker/home.mjs');
const sidebar = KnowledgeSidebarSwitch();
const tags = KnowledgeTagSidebar();
const content = WheelMakerHomePage().body();
const index = JSON.parse(await readFile(path.join(root, 'static/contentIndex.json'), 'utf8'));
const allFiles = Object.entries(index).map(([slug, entry]) => ({
  ...entry, slug, frontmatter: { title: entry.title, tags: entry.tags || [] },
}));
const textContent = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(textContent).join('');
const walk = (node, visit) => { visit(node); node.childNodes?.forEach(child => walk(child, visit)); };
if (values['desktop-only']) {
  const sampleFiles = [
    { slug: 'sample/a', frontmatter: { title: 'First article', tags: ['topic/one', 'topic/two', 'topic/one'] } },
    { slug: 'sample/b', frontmatter: { title: 'Second article', tags: ['topic/one'] } },
    { slug: 'tags/topic', frontmatter: { title: 'Generated tag page', tags: ['topic'] } },
  ];
  const tagDocument = parseFragment(render(h(tags, { allFiles: sampleFiles, fileData: { slug: 'index' } })));
  const counts = {};
  walk(tagDocument, node => {
    const href = node.attrs?.find(attr => attr.name === 'href')?.value;
    if (href) counts[href] = textContent(node).trim();
  });
  assert.equal(counts['./tags/topic'], 'topic2', 'parent tags count distinct articles, not tag assignments');
  const pageType = WheelMakerHomePage();
  assert.equal(pageType.match({ slug: 'tags/topic', fileData: {} }), true, 'tag results share the owned page renderer');
  const generated = pageType.generate({ cfg: {}, content: sampleFiles.slice(0, 2).map(data => [null, { data }]) });
  assert.equal(generated.filter(page => page.slug === 'tags/topic').length, 1, 'one virtual page per parent tag');
  assert.throws(() => pageType.generate({ cfg: {}, content: [], ctx: { cfg: { plugins: { pageTypes: [{ name: 'TagPage' }] } } } }), /--refresh/, 'old pinned configuration cannot silently emit duplicate tag pages');
  const tagProps = { allFiles: sampleFiles, fileData: { slug: 'tags/topic' } };
  const firstRender = render(h(content, tagProps));
  const secondRender = render(h(content, { ...tagProps, tree: { type: 'root', children: [{ type: 'text', value: firstRender }] } }));
  assert.equal(secondRender, firstRender, 'pre-rendered virtual page content is not recursively included');
}
const originalHome = parse(await readFile(path.join(root, 'index.html'), 'utf8'));
const site = {};
walk(originalHome, node => {
  const classes = node.attrs?.find(attr => attr.name === 'class')?.value.split(' ') || [];
  if (classes.includes('knowledge-page-title')) site.title = textContent(node);
  if (classes.includes('knowledge-page-lede')) site.description = textContent(node);
  if (classes.includes('knowledge-page-card-link')) {
    const href = node.attrs.find(attr => attr.name === 'href')?.value;
    const slug = decodeURIComponent(new URL(href, 'http://localhost/wiki/').pathname).replace(/^\/wiki\//, '').replace(/\.html$/, '');
    const page = allFiles.find(file => file.slug === slug);
    const description = node.childNodes?.find(child => child.tagName === 'p');
    if (page && description) page.description = textContent(description);
  }
});
const artifacts = values.artifacts && path.resolve(values.artifacts);
if (artifacts) await mkdir(artifacts, { recursive: true });

// Reuse the emitted Quartz shell, CSS, search and SPA runtime; replace only the
// WheelMaker components under test with their current source-rendered resources.
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/^\/wiki\/?/, '');
    let file = path.resolve(root, pathname || 'index.html');
    if (!file.startsWith(root + path.sep)) throw new Error('Invalid path');
    if (!path.extname(file)) file += '.html';
    let data;
    try { data = await readFile(file); }
    catch { file = path.resolve(root, pathname, 'index.html'); data = await readFile(file); }
    const extension = path.extname(file);
    if (extension === '.html') {
      const slug = pathname.replace(/\.html$/, '').replace(/\/$/, '/index') || 'index';
      const props = { allFiles, fileData: { ...allFiles.find(file => file.slug === slug), slug, ...(slug === 'index' ? site : {}) }, cfg: { pageTitle: site.title } };
      const document = parse(data.toString());
      const replaceComponents = node => {
        const classes = node.attrs?.find(attr => attr.name === 'class')?.value.split(' ') || [];
        const tagPage = slug === 'tags' || slug.startsWith('tags/');
        if (tagPage && classes.includes('page-header')) node.childNodes = [];
        if (classes.includes('knowledge-mobile-bar') || classes.includes('knowledge-mobile-dialog')) {
          node.parentNode.childNodes.splice(node.parentNode.childNodes.indexOf(node), 1);
          return;
        }
        let component;
        if (classes.includes('knowledge-sidebar-switch')) component = sidebar;
        if (classes.includes('knowledge-tags-sidebar')) component = tags;
        if (classes.includes('knowledge-home') || classes.includes('knowledge-directory')) {
          component = content;
          if (slug !== 'index' && !slug.endsWith('/index')) props.fileData.slug = slug + '/index';
        }
        if (tagPage && classes.includes('popover-hint') && node.parentNode?.attrs?.some(attr => attr.name === 'class' && attr.value.split(' ').includes('center'))) component = content;
        if (component) {
          const replacements = parseFragment(render(h(component, props))).childNodes;
          replacements.forEach(replacement => { replacement.parentNode = node.parentNode; });
          node.parentNode.childNodes.splice(node.parentNode.childNodes.indexOf(node), 1, ...replacements);
        } else node.childNodes?.slice().forEach(replaceComponents);
      };
      replaceComponents(document);
      // Remove the previous custom rules before adding current ones: otherwise
      // deleted selectors (for example touch :hover) would survive in the preview.
      const resetCSS = `(() => {
        const clean = sheet => {
          for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
            const rule = sheet.cssRules[i];
            if (rule.selectorText?.includes('knowledge')) sheet.deleteRule(i);
            else if (rule.cssRules) clean(rule);
          }
        };
        for (const sheet of document.styleSheets) { try { clean(sheet); } catch {} }
      })()`;
      data = serialize(document).replace('</head>', () => `<script>${resetCSS}</script><style>${[sidebar.css, tags.css, content.css].join('\n')}</style></head>`);
    } else if (path.basename(file) === 'postscript.js') {
      // Disable only the previously exported switch, leaving Quartz plugins intact.
      data = 'window.__wheelmakerSidebarBound = true;\n'
        + data.toString().replaceAll('".knowledge-sidebar-switch"', '".wiki-preview-retired-switch"')
        + '\ndelete window.__wheelmakerSidebarBound;\n' + sidebar.afterDOMLoaded;
    }
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
    response.setHeader('Content-Type', types[extension] || 'application/octet-stream');
    response.end(data);
  } catch { response.writeHead(404); response.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/wiki/`;
let browser;
const errors = [];
try {
  browser = await chromium.launch({ headless: true, ...(values.browser ? { executablePath: values.browser } : {}) });
  for (const width of (values['desktop-only'] ? [801, 1024, 1280, 1440, 1920] : [320, 390, 768, 800, 801, 1440])) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, isMobile: width <= 800, hasTouch: width <= 800 });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await page.locator('.explorer-ul .folder-container').first().waitFor({ state: 'attached' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: page overflow`);
    if (width <= 800) {
      const bar = page.locator('.knowledge-mobile-bar');
      const menu = page.locator('[data-knowledge-open="navigation"]');
      const search = page.locator('[data-knowledge-open="search"]');
      const navigation = page.locator('#knowledge-mobile-navigation');
      const searchDialog = page.locator('#knowledge-mobile-search');
      const directoryButton = page.locator('[data-knowledge-view="directory"]');
      const tagsButton = page.locator('[data-knowledge-view="tags"]');
      const chrome = await page.locator('.sidebar.left').boundingBox();
      assert.ok(chrome.height <= 64, width + ': mobile chrome must be one toolbar, got ' + chrome.height + 'px');
      assert.equal(await directoryButton.isVisible(), false, 'navigation is not in the reading flow');
      const firstCard = await page.locator('.knowledge-page-card').first().boundingBox();
      assert.ok(firstCard.y <= 128, width + ': articles must start directly below the toolbar');
      console.log(width + 'px toolbar: ' + chrome.height + 'px; first article: ' + Math.round(firstCard.y) + 'px');
      for (const button of [menu, search]) assert.ok((await button.boundingBox()).height >= 44);
      if (artifacts && width === 390) await page.screenshot({ path: path.join(artifacts, 'after-home.png') });
      await menu.click();
      assert.equal(await navigation.evaluate(dialog => dialog.matches(':modal')), true);
      assert.equal(await menu.getAttribute('aria-expanded'), 'true');
      assert.equal((await page.locator('.knowledge-page-card').first().boundingBox()).y, firstCard.y, 'drawer never pushes content');
      await directoryButton.click();
      assert.equal(await page.locator('.mobile-explorer').isVisible(), false, 'the drawer has no redundant menu button');
      if (artifacts && width === 390) await page.screenshot({ path: path.join(artifacts, 'after-directory.png') });
      await page.mouse.click(width - 4, 100);
      assert.equal(await navigation.isVisible(), false, 'backdrop dismisses the drawer');
      await menu.click();
      await tagsButton.click();
      assert.equal(await page.locator('.explorer').isVisible(), false);
      assert.equal(await page.locator('.knowledge-tags-sidebar').isVisible(), true);
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(() => document.activeElement === document.body || !!document.activeElement?.closest('dialog[open]')), true, 'background controls cannot receive focus while modal');
      }
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.querySelector('#knowledge-mobile-navigation').open);
      assert.equal(await menu.evaluate(button => button === document.activeElement), true, 'close returns focus to its trigger');
      await menu.click();
      await directoryButton.click();
      await page.locator('.explorer .folder-container a').first().click();
      await page.waitForURL(current => current.pathname !== '/wiki/');
      assert.equal(await navigation.isVisible(), false, 'folder navigation closes the drawer');
      assert.ok((await page.locator('.sidebar.left').boundingBox()).height <= 64);
      await menu.click();
      await tagsButton.click();
      await page.locator('.knowledge-tag-row:has(.knowledge-tree-toggle) .knowledge-tag-link').first().click();
      await page.waitForURL(current => current.pathname.includes('/tags/'));
      assert.equal(await navigation.isVisible(), false, 'tag navigation closes the drawer');
      await bar.locator('a').click();
      await page.waitForURL(url);
      await page.locator('.knowledge-page-card-link').first().click();
      await page.locator('.article-title').waitFor();
      assert.equal(await page.locator('.center article > h1:first-child').isVisible(), false);
      assert.equal(await page.locator('.page-header .tags').count(), 0, 'article tags move out of the reading header');
      assert.ok((await page.locator('.center article').boundingBox()).y < 180, 'article body starts near the toolbar');
      if (artifacts && width === 390) await page.screenshot({ path: path.join(artifacts, 'after-article.png') });
      await page.evaluate(() => window.scrollTo(0, 600));
      assert.equal((await bar.boundingBox()).y, 0, 'toolbar stays available while reading');
      const readingScroll = await page.evaluate(() => window.scrollY);
      await menu.click();
      assert.equal(await page.locator('.knowledge-mobile-article-tags').isVisible(), true);
      if (artifacts && width === 390) await page.screenshot({ path: path.join(artifacts, 'after-tags.png') });
      await navigation.locator('[data-knowledge-close]').click();
      assert.equal(await page.evaluate(() => window.scrollY), readingScroll, 'dismissal preserves the reading position');
      await menu.click();
      await page.locator('.darkmode').click();
      assert.equal(await page.locator('html').getAttribute('saved-theme'), 'dark');
      await navigation.locator('[data-knowledge-close]').click();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForFunction(() => getComputedStyle(document.querySelector('.knowledge-mobile-title')).color === 'rgb(238, 238, 239)');
      if (artifacts && width === 390) await page.screenshot({ path: path.join(artifacts, 'after-dark.png') });
      await search.click();
      assert.equal(await searchDialog.evaluate(dialog => dialog.matches(':modal')), true);
      const input = page.locator('.search-space input');
      assert.equal(await input.evaluate(element => element === document.activeElement), true, 'search is ready to type');
      await input.fill(allFiles.find(file => !file.slug.endsWith('/index'))?.frontmatter.title || 'ACP');
      await page.locator('.result-card:not(.no-match)').first().waitFor();
      assert.ok((await page.locator('.result-card > p').first().boundingBox()).height <= 73, 'results show a short excerpt, not a full article');
      if (artifacts && width === 390) await page.screenshot({ path: path.join(artifacts, 'after-search.png') });
      assert.ok((await input.boundingBox()).y >= 56);
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.querySelector('#knowledge-mobile-search').open);
      assert.equal(await search.evaluate(button => button === document.activeElement), true);
      await search.click();
      assert.equal(await input.inputValue(), '', 'closing clears the old query');
      await input.fill('Codex');
      await page.locator('.result-card:not(.no-match)').first().click();
      await page.waitForURL(current => current.pathname.includes('codex'));
      assert.equal(await searchDialog.isVisible(), false, 'search result navigation closes the search');
      await page.keyboard.press('Control+k');
      await page.waitForFunction(() => document.querySelector('#knowledge-mobile-search').open);
      await searchDialog.locator('[data-knowledge-close]').click();
      await page.evaluate(sidebar.afterDOMLoaded);
      await menu.click();
      await navigation.locator('[data-knowledge-close]').click();
      await menu.click();
      assert.equal(await navigation.evaluate(dialog => dialog.open), true);
      await page.setViewportSize({ width: 1200, height: 844 });
      await page.waitForFunction(() => !document.querySelector('#knowledge-mobile-navigation').open);
      assert.equal(await page.locator('.sidebar.left > .knowledge-sidebar-switch').isVisible(), true);
      assert.equal(await page.locator('.sidebar.left > .flex-component .search').count(), 1);
      assert.equal(await page.locator('.page-header .tags').count(), 1, 'desktop metadata is restored');
      assert.notEqual(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY), 'hidden');
      await page.setViewportSize({ width, height: 844 });
      await page.waitForFunction(() => !!document.querySelector('#knowledge-mobile-search .search'));
      assert.equal(await page.locator('.knowledge-mobile-bar').count(), 1);
      assert.equal(await directoryButton.isVisible(), false);
      await page.evaluate(() => {
        const article = document.querySelector('.center article');
        const heading = document.createElement('h2');
        heading.textContent = 'LongUnbrokenHeading'.repeat(16);
        const paragraph = document.createElement('p');
        paragraph.textContent = 'https://example.test/' + 'long-path-segment'.repeat(30);
        const pre = document.createElement('pre');
        pre.textContent = 'unbroken_code_value'.repeat(40);
        const wrapper = document.createElement('div');
        wrapper.className = 'table-container';
        const table = document.createElement('table');
        const row = table.insertRow();
        for (let i = 0; i < 10; i++) row.insertCell().textContent = 'Wide table cell';
        wrapper.append(table);
        article.append(heading, paragraph, pre, wrapper);
      });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'long reading content stays inside the page');
      assert.ok(await page.evaluate(() => {
        const pre = document.querySelector('.center article > pre:last-of-type');
        const table = document.querySelector('.center article > .table-container:last-child');
        return pre.scrollWidth > pre.clientWidth && table.scrollWidth > table.clientWidth;
      }), 'wide code and tables scroll locally');
    } else {
      assert.equal(await page.locator('.explorer').isVisible(), true);
      await page.locator('.explorer .knowledge-tree-toggle').first().waitFor();
      const directoryTab = page.locator('[data-knowledge-view="directory"]');
      const tagsTab = page.locator('[data-knowledge-view="tags"]');
      await directoryTab.focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await tagsTab.getAttribute('aria-selected'), 'true');
      assert.equal(await tagsTab.evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('Home');
      assert.equal(await directoryTab.getAttribute('aria-selected'), 'true');
      await page.keyboard.press('End');
      assert.equal(await tagsTab.getAttribute('aria-selected'), 'true');
      assert.equal(await page.locator('.knowledge-tags-sidebar').isVisible(), true);
      const tagToggle = page.locator('.knowledge-tags-sidebar .knowledge-tree-toggle').first();
      await tagToggle.focus();
      const expanded = await tagToggle.getAttribute('aria-expanded');
      await page.keyboard.press('Space');
      assert.notEqual(await tagToggle.getAttribute('aria-expanded'), expanded, 'tag branches toggle with keyboard');
      const savedExpanded = await tagToggle.getAttribute('aria-expanded');
      await page.locator('.knowledge-tag-row:has(.knowledge-tree-toggle) .knowledge-tag-link').first().click();
      await page.waitForURL(current => current.pathname.includes('/tags/'));
      await page.locator('.knowledge-tag-page').waitFor();
      assert.equal(await page.locator('.knowledge-tags-sidebar .knowledge-tree-toggle').first().getAttribute('aria-expanded'), savedExpanded, 'tag expansion survives SPA navigation');
      assert.equal(await page.locator('.knowledge-tag-link[aria-current="page"]').count(), 1);
      assert.equal(await page.locator('.page-listing').count(), 0, 'tag page has no duplicated upstream result listing');
      assert.ok(await page.locator('.knowledge-page-card').count() > 0);
      if (artifacts && width === 1440) await page.screenshot({ path: path.join(artifacts, 'after-desktop-tags.png') });
      await page.goto(url);
      await directoryTab.click();
      const toggle = page.locator('.explorer .knowledge-tree-toggle').first();
      await toggle.waitFor();
      await toggle.focus();
      const before = await toggle.getAttribute('aria-expanded');
      await page.keyboard.press('Space');
      assert.notEqual(await toggle.getAttribute('aria-expanded'), before, 'directory branches toggle with keyboard');
      if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.click();
      const folderRow = page.locator('.explorer .folder-container').first();
      const tagRow = page.locator('.knowledge-tag-row').first();
      const dirStyle = await folderRow.evaluate(el => ({ top: el.getBoundingClientRect().y, height: el.getBoundingClientRect().height, size: getComputedStyle(el.querySelector('a')).fontSize }));
      await tagsTab.click();
      const tagStyle = await tagRow.evaluate(el => ({ top: el.getBoundingClientRect().y, height: el.getBoundingClientRect().height, size: getComputedStyle(el.querySelector('a')).fontSize }));
      assert.deepEqual(tagStyle, dirStyle, 'directory and tag rows use the same visual metrics');
      await directoryTab.click();
      const firstCard = await page.locator('.knowledge-page-card').first().boundingBox();
      assert.ok(firstCard.y < 260, 'desktop content starts without a large hero gap');
      if (width >= 1280) {
        assert.ok(await page.locator('.center').evaluate(el => el.getBoundingClientRect().width) > width * 0.6, 'empty right rail returns space to the collection');
      }
      if (artifacts && width === 1440) await page.screenshot({ path: path.join(artifacts, 'after-desktop-home.png') });
      if (width === 1440) {
        console.log(JSON.stringify({ width, row: dirStyle, firstArticleY: firstCard.y,
          contentWidth: await page.locator('.center').evaluate(el => el.getBoundingClientRect().width) }));
        const theme = await page.locator('html').getAttribute('saved-theme');
        await page.locator('.sidebar.left .darkmode').click();
        await page.waitForFunction(previous => document.documentElement.getAttribute('saved-theme') !== previous, theme);
        await page.waitForFunction(() => getComputedStyle(document.querySelector('.folder-container a')).color === getComputedStyle(document.querySelector('.knowledge-tag-count')).color);
        const contrast = await page.evaluate(() => {
          const luminance = color => color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => {
            const channel = value / 255;
            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
          }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
          const background = luminance(getComputedStyle(document.body).backgroundColor);
          return ['.page-title a', '.folder-title', '.knowledge-tag-link'].map(selector => {
            const foreground = luminance(getComputedStyle(document.querySelector(selector)).color);
            return (Math.max(background, foreground) + 0.05) / (Math.min(background, foreground) + 0.05);
          });
        });
        assert.ok(contrast.every(value => value >= 4.5), 'dark sidebar labels remain legible after the theme transition');
        if (artifacts) await page.screenshot({ path: path.join(artifacts, 'after-desktop-dark.png') });
        await page.locator('.sidebar.left .darkmode').click();
        await page.locator('.sidebar.left .search-button').click();
        const searchInput = page.locator('.search-container input');
        await searchInput.fill('acp');
        await page.locator('.result-card').first().waitFor();
        assert.ok((await page.locator('.result-card > p').first().boundingBox()).height <= 66, 'desktop results use short excerpts');
        await page.locator('.preview-container .article-title').waitFor();
        await page.waitForFunction(() => document.querySelector('.preview-container article > h1:first-child')?.dataset.knowledgeRepeatedTitle === 'true');
        assert.equal(await page.locator('.preview-container article > h1:first-child').isVisible(), false, 'search previews do not repeat the title');
        if (artifacts) await page.screenshot({ path: path.join(artifacts, 'after-desktop-search.png') });
        await page.keyboard.press('Escape');
        await page.locator('.search-container').waitFor({ state: 'hidden' });
      }
      await page.locator('.explorer .folder-container a').first().click();
      await page.waitForURL(current => current.pathname !== '/wiki/');
      await page.locator('.explorer [aria-current="page"]').waitFor();
      await page.locator('.knowledge-page-card-link').first().click();
      await page.locator('.article-title').waitFor();
      await page.locator('.explorer [aria-current="location"]').waitFor();
      if (artifacts && width === 1440) await page.screenshot({ path: path.join(artifacts, 'after-desktop-article.png') });
      // A long tag list scrolls inside the sidebar without covering its controls.
      await tagsTab.click();
      await page.locator('.knowledge-tags-sidebar').evaluate(el => {
        const list = el.querySelector('ul');
        for (let i = 0; i < 60; i++) list.append(list.firstElementChild.cloneNode(true));
        el.scrollTop = el.scrollHeight;
      });
      assert.ok(await page.locator('.knowledge-tags-sidebar').evaluate(el => el.scrollHeight > el.clientHeight));
      assert.ok((await tagsTab.boundingBox()).y >= 0);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    console.log(`PASS ${width}px: layout, navigation and reading controls`);
    await page.close();
  }
  assert.deepEqual(errors, [], 'no browser runtime errors');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
