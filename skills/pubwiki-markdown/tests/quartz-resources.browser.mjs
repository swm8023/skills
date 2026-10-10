// Run against a synthetic Quartz export with plain.md linking to note.md,
// where note.md contains a formula, a heading anchor and highlighted code.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: Object.fromEntries(['site', 'playwright', 'browser'].map(name => [name, { type: 'string' }])) });
for (const name of ['site', 'playwright']) assert.ok(values[name], `--${name} is required`);
const root = path.resolve(values.site);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    let relative = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/^\/wiki\//, '');
    if (!relative) relative = 'index.html';
    if (!path.extname(relative)) relative += '.html';
    const file = path.resolve(root, relative);
    assert.ok(file.startsWith(root + path.sep));
    response.setHeader('Content-Type', types[path.extname(file)] || 'application/json');
    response.end(await readFile(file));
  } catch { response.writeHead(404); response.end('not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/wiki/`;
const { chromium } = await import(pathToFileURL(path.resolve(values.playwright)).href);
const browser = await chromium.launch({ headless: true, ...(values.browser ? { executablePath: values.browser } : {}) });
try {
  const page = await browser.newPage();
  const requests = [], errors = [];
  page.on('request', request => requests.push(new URL(request.url()).pathname));
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + 'plain');
  await page.waitForLoadState('networkidle');
  assert.equal(requests.filter(url => /katex|copy-tex|\.woff2/.test(url)).length, 0);
  const initialDocuments = requests.filter(url => url.endsWith('/plain')).length;
  await page.locator('article a.internal').filter({ hasText: 'Formula' }).hover();
  await page.waitForTimeout(400);
  await page.waitForLoadState('networkidle');
  assert.equal(requests.filter(url => url.endsWith('/note')).length, 0, 'body link hover does not download an article');
  assert.equal(await page.locator('.popover').count(), 0, 'body links have no preview popup');
  await page.locator('article a.internal').filter({ hasText: 'Formula' }).click();
  await page.waitForURL('**/wiki/note');
  await page.waitForLoadState('networkidle');
  assert.equal(requests.filter(url => url.endsWith('/note')).length, 1, 'click downloads the article once');
  await page.waitForFunction(() => window.__wheelmakerCopyTexLoaded && !!document.querySelector('.katex'));
  assert.equal(await page.locator('.katex').first().evaluate(node => getComputedStyle(node).fontFamily.includes('KaTeX_Main')), true);
  assert.equal(await page.locator('.wm-heading-icon use').first().evaluate(node => {
    const href = node.getAttribute('href');
    return href.startsWith('#wm-icon-') && !!document.querySelector(href);
  }), true);
  assert.equal(await page.locator('pre code span[class^="wm-token-"]').first().evaluate(node => !!getComputedStyle(node).getPropertyValue('--shiki-dark').trim()), true);
  assert.equal(requests.filter(url => /copy-tex.*\.js$/.test(url)).length, 1);
  await page.goBack();
  await page.waitForURL('**/wiki/plain');
  await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('link[href*="katex.min"]').count(), 0);
  await page.locator('article a.internal').filter({ hasText: 'Formula' }).click();
  await page.waitForURL('**/wiki/note');
  await page.waitForLoadState('networkidle');
  assert.equal(requests.filter(url => /copy-tex.*\.js$/.test(url)).length, 1);
  assert.equal(requests.filter(url => url.endsWith('/plain')).length, initialDocuments + 1, 'back navigation fetches HTML through the SPA');
  assert.deepEqual(errors, []);
  console.log('PASS zero hover article requests, click navigation, conditional math resources, shared heading symbols and Shiki colors');
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
