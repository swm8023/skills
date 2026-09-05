// Run against an existing local Quartz export without building or publishing:
// node quartz-mobile.browser.mjs --site <static-output> --runtime <quartz-runtime>
//   --playwright <playwright/index.mjs> --browser <chromium-executable> --artifacts <directory>
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

const { values } = parseArgs({ options: Object.fromEntries(
  ['site', 'runtime', 'playwright', 'browser', 'artifacts'].map(name => [name, { type: 'string' }]),
) });
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
      const props = { allFiles, fileData: { slug, ...(slug === 'index' ? site : {}) }, cfg: { pageTitle: site.title } };
      const document = parse(data.toString());
      const replaceComponents = node => {
        const classes = node.attrs?.find(attr => attr.name === 'class')?.value.split(' ') || [];
        let component;
        if (classes.includes('knowledge-sidebar-switch')) component = sidebar;
        if (classes.includes('knowledge-tags-sidebar')) component = tags;
        if (classes.includes('knowledge-home') || classes.includes('knowledge-directory')) {
          component = content;
          if (slug !== 'index' && !slug.endsWith('/index')) props.fileData.slug = slug + '/index';
        }
        if (component) {
          const replacement = parseFragment(render(h(component, props))).childNodes[0];
          replacement.parentNode = node.parentNode;
          node.parentNode.childNodes.splice(node.parentNode.childNodes.indexOf(node), 1, replacement);
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
      data = data.toString().replaceAll('".knowledge-sidebar-switch"', '".wiki-preview-retired-switch"')
        + '\n' + sidebar.afterDOMLoaded;
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
  for (const width of [320, 390, 768, 800, 801, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, isMobile: width <= 800, hasTouch: width <= 800 });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await page.locator('.explorer-ul .folder-container').first().waitFor({ state: 'attached' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: page overflow`);
    if (width <= 800) {
      const directoryButton = page.locator('[data-knowledge-view="directory"]');
      const tagsButton = page.locator('[data-knowledge-view="tags"]');
      assert.equal(await directoryButton.getAttribute('aria-expanded'), 'false');
      const firstCard = await page.locator('.knowledge-page-card').first().boundingBox();
      assert.ok(firstCard.y < 390, `${width}: first card starts at ${firstCard.y}`);
      console.log(`${width}px first card: ${Math.round(firstCard.y)}px`);
      for (const selector of ['.search-button', '.darkmode', '[data-knowledge-view="directory"]', '[data-knowledge-view="tags"]']) {
        assert.ok((await page.locator(selector).first().boundingBox()).height >= 44, `${width}: small target ${selector}`);
      }
      await directoryButton.click();
      assert.equal(await page.locator('.explorer').getAttribute('data-knowledge-visible'), 'true');
      await tagsButton.click();
      assert.equal(await page.locator('.explorer').isVisible(), false);
      assert.ok((await page.locator('.knowledge-tags-sidebar').boundingBox()).height <= 844 * 0.45 + 1);
      assert.equal(await page.evaluate(() => document.documentElement.classList.contains('mobile-no-scroll')), false);
      await tagsButton.click();
      assert.equal(await page.locator('.knowledge-tags-sidebar').isVisible(), false);
      if (artifacts && width === 390) await page.screenshot({ path: path.join(artifacts, 'after-home.png') });
      await directoryButton.click();
      if (artifacts && width === 390) await page.screenshot({ path: path.join(artifacts, 'after-directory.png') });
      await page.locator('.explorer .folder-container a').first().click();
      await page.waitForURL(current => current.pathname !== '/wiki/');
      assert.equal(await directoryButton.getAttribute('aria-expanded'), 'false', 'SPA navigation closes mobile navigation');
      await tagsButton.click();
      assert.equal(await tagsButton.getAttribute('aria-expanded'), 'true', 'SPA switch still works');
      await tagsButton.click();
      await page.locator('.knowledge-page-card-link').first().click();
      await page.locator('.article-title').waitFor();
      assert.equal(await page.locator('.center article > h1:first-child').isVisible(), false, 'duplicate article title is hidden');
      await tagsButton.click();
      assert.equal(await tagsButton.getAttribute('aria-expanded'), 'true', 'article switch works');
      if (artifacts && width === 390) await page.screenshot({ path: path.join(artifacts, 'after-tags.png') });
      await tagsButton.click();
      if (artifacts && width === 390) await page.screenshot({ path: path.join(artifacts, 'after-article.png') });
      await page.locator('.search-button').click();
      const input = page.locator('.search-space input');
      await input.fill(allFiles.find(file => !file.slug.endsWith('/index'))?.frontmatter.title || 'ACP');
      await page.locator('.result-card').first().waitFor();
      assert.ok((await input.boundingBox()).y >= 0, 'search input stays inside viewport');
      await page.keyboard.press('Escape');
      await page.locator('.darkmode').click();
      assert.equal(await page.locator('html').getAttribute('saved-theme'), 'dark');
      await page.waitForFunction(() => getComputedStyle(document.querySelector('.page-title a')).color === 'rgb(145, 171, 193)');
      if (artifacts && width === 390) await page.screenshot({ path: path.join(artifacts, 'after-dark.png') });
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
      // Repeat our initializer as Quartz can include component resources more than once.
      await page.evaluate(sidebar.afterDOMLoaded);
      await directoryButton.click();
      assert.equal(await directoryButton.getAttribute('aria-expanded'), 'true', 'repeated nav does not duplicate handlers');
      await page.setViewportSize({ width: 1200, height: 844 });
      await page.waitForFunction(() => !document.querySelector('[data-knowledge-view="directory"]').hasAttribute('aria-expanded'));
      assert.equal(await directoryButton.getAttribute('aria-expanded'), null);
      assert.equal(await page.evaluate(() => document.documentElement.classList.contains('mobile-no-scroll')), false);
      await page.setViewportSize({ width, height: 844 });
      await page.waitForFunction(() => document.querySelector('[data-knowledge-view="directory"]').getAttribute('aria-expanded') === 'false');
      assert.equal(await directoryButton.getAttribute('aria-expanded'), 'false');
    } else {
      assert.equal(await page.locator('.explorer').isVisible(), true);
      await page.locator('[data-knowledge-view="tags"]').click();
      assert.equal(await page.locator('.knowledge-tags-sidebar').isVisible(), true);
      if (artifacts && width === 1440) await page.screenshot({ path: path.join(artifacts, 'after-desktop.png') });
    }
    console.log(`PASS ${width}px: layout, navigation and reading controls`);
    await page.close();
  }
  assert.deepEqual(errors, [], 'no browser runtime errors');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
