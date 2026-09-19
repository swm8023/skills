// Exercise the actual search component and mount-path fetch bridge in Chromium.
// node tests/quartz-search.browser.mjs --runtime <quartz> --playwright <index.mjs> --browser <executable>
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
const { WheelMakerSearch } = await import('../assets/quartz/quartz/wheelmaker/search.mjs');
const { KnowledgeSidebarSwitch } = await import('../assets/quartz/quartz/wheelmaker/layout.mjs');
const { chromium } = await import(pathToFileURL(path.resolve(values.playwright)).href);
const documents = {
  'search-fixture/a': { title: 'ACP alpha <b>', tags: ['protocol/acp'], content: 'ACP 正文 中文测试 <img onerror=alert(1)>' },
  'search-fixture/b': { title: 'ACP beta', tags: ['protocol/other'], content: 'ACP beta 正文 中文测试' },
};
const article = slug => `<article class="popover-hint" data-fixture="${slug}">
  <h1>ACP ${slug}</h1><p>ACP 正文</p><a class="relative" href="./related">ACP related</a>
  <a class="fragment" href="#section">section</a><img src="../assets/image.png" alt="fixture">
  <picture><source srcset="../assets/small.png 1x, ../assets/large.png 2x"></picture>
  <code>ACP code</code><script type="text/plain">ACP literal</script>
</article>`;
const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname.endsWith('/static/searchIndex.json')) {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(documents));
  } else if (url.pathname.includes('/search-fixture/')) {
    response.setHeader('Content-Type', 'text/html');
    response.end(article(url.pathname.endsWith('/a') ? 'a' : 'b'));
  } else if (url.pathname.endsWith('.png')) {
    response.writeHead(204); response.end();
  } else {
    const props = { cfg: { locale: 'zh-CN' }, enablePreview: url.searchParams.get('preview') !== 'false' };
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(`<!doctype html><html><head><style>${WheelMakerSearch.css}</style>
      <script>${KnowledgeSidebarSwitch().beforeDOMLoaded}</script></head><body>
      ${render(h(WheelMakerSearch, props))}<script>${WheelMakerSearch.afterDOMLoaded}</script></body></html>`);
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/mount/wiki/`;
const browser = await chromium.launch({ headless: true, ...(values.browser ? { executablePath: values.browser } : {}) });
const failures = [];
const pageErrors = [];
async function check(name, run, options = {}) {
  const page = await browser.newPage({ viewport: { width: options.mobile ? 390 : 1440, height: 844 } });
  page.setDefaultTimeout(3000);
  const requests = [];
  page.on('request', request => requests.push(new URL(request.url()).pathname));
  page.on('pageerror', error => pageErrors.push(error.message));
  const query = async term => {
    await page.locator('.search-bar').fill(term);
    await page.locator('.result-card').first().waitFor();
  };
  try {
    await page.goto(base + (options.preview === false ? '?preview=false' : ''));
    await run(page, query, requests);
    console.log(`PASS ${name}`);
  } catch (error) { failures.push(name); console.error(`FAIL ${name}: ${error.message}`); }
  finally { await page.close(); }
}
try {
  await check('lazy loading, safe highlighting, cached reopen and CJK/tag queries', async (page, query, requests) => {
    assert.equal(requests.filter(url => url.endsWith('searchIndex.json')).length, 0);
    await page.locator('.search-button').click();
    await query('acp');
    assert.equal(await page.locator('.result-card').count(), 2);
    assert.ok(await page.locator('.result-card h3 .highlight').count() > 0);
    assert.ok(await page.locator('.result-card > p .highlight').count() > 0);
    assert.equal(await page.locator('.result-card img, .result-card b').count(), 0);
    await page.locator('.preview-container .highlight').first().waitFor();
    assert.equal(await page.locator('.preview-container script .highlight').count(), 0);
    await page.keyboard.press('Escape');
    await page.locator('.search-button').click();
    await query('中文');
    await page.waitForFunction(() => [...document.querySelectorAll('.result-card > p .highlight')].some(el => el.textContent === '中'));
    assert.equal(await page.locator('.result-card').count(), 2);
    await query('ACP <b>');
    await page.waitForFunction(() => document.querySelectorAll('.result-card').length === 1);
    assert.equal(await page.locator('.result-card h3').textContent(), 'ACP alpha <b>');
    assert.equal(await page.locator('.result-card b').count(), 0);
    await query('#protocol/acp');
    await page.waitForFunction(() => document.querySelectorAll('.result-card').length === 1);
    assert.ok(await page.locator('.tags .highlight').count() > 0);
    assert.equal(requests.filter(url => url.endsWith('searchIndex.json')).length, 1);
  });
  await check('keyboard selection, Tab and Enter open the selected result', async (page, query) => {
    await page.keyboard.press('Control+k'); await query('acp');
    await page.locator('.search-bar').press('ArrowDown');
    assert.equal(await page.locator('.result-card.focus').getAttribute('data-slug'), 'search-fixture/b');
    await page.locator('.search-bar').press('Shift+Tab');
    assert.equal(await page.locator('.result-card.focus').getAttribute('data-slug'), 'search-fixture/a');
    await page.locator('.search-bar').press('Tab');
    await page.locator('.search-bar').press('Enter');
    await page.waitForURL('**/search-fixture/b');
  });
  await check('tag shortcut, Escape from a result and cleared reopen', async (page, query) => {
    await page.keyboard.press('Control+Shift+k');
    assert.equal(await page.locator('.search-bar').inputValue(), '#');
    await query('acp'); await page.locator('.result-card').last().focus();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.search-container').isVisible(), false);
    assert.equal(await page.locator('.search-button').evaluate(el => el === document.activeElement), true);
    await page.keyboard.press('Control+k');
    assert.equal(await page.locator('.search-bar').inputValue(), '');
  });
  await check('preview URL normalization and per-document caching', async (page, query, requests) => {
    await page.locator('.search-button').click(); await query('acp');
    await page.locator('.preview-container [data-fixture="a"]').waitFor();
    assert.equal(await page.locator('.preview-container .relative').getAttribute('href'), new URL('search-fixture/related', base).href);
    assert.equal(await page.locator('.preview-container .fragment').getAttribute('href'), new URL('search-fixture/a#section', base).href);
    assert.equal(await page.locator('.preview-container img').getAttribute('src'), new URL('assets/image.png', base).href);
    assert.equal(await page.locator('.preview-container source').getAttribute('srcset'), `${new URL('assets/small.png', base).href} 1x, ${new URL('assets/large.png', base).href} 2x`);
    await page.locator('.result-card').last().dispatchEvent('mouseenter');
    await page.locator('.preview-container [data-fixture="b"]').waitFor();
    await page.locator('.result-card').first().dispatchEvent('mouseenter');
    await page.locator('.preview-container [data-fixture="a"]').waitFor();
    assert.equal(requests.filter(url => url.endsWith('/search-fixture/a')).length, 1);
  });
  await check('no matches clears the previous preview', async (page, query) => {
    await page.locator('.search-button').click(); await query('acp');
    await page.locator('.preview-container article').waitFor();
    await query('no-such-document'); await page.locator('.no-match').waitFor();
    assert.equal(await page.locator('.preview-container article').count(), 0);
  });
  await check('late preview cannot overwrite a newer selection or a closed search', async (page, query) => {
    let release; const hold = new Promise(resolve => { release = resolve; });
    await page.route('**/search-fixture/a', async route => { await hold; await route.fulfill({ contentType: 'text/html', body: article('a') }); });
    try {
      await page.locator('.search-button').click(); await query('acp');
      await page.locator('.result-card').last().dispatchEvent('mouseenter');
      await page.locator('.preview-container [data-fixture="b"]').waitFor();
      const returned = page.waitForResponse('**/search-fixture/a'); release(); await returned;
      await page.waitForTimeout(60);
      assert.equal(await page.locator('.preview-container article').getAttribute('data-fixture'), 'b');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.preview-container article').count(), 0);
    } finally { release(); }
  });
  await check('closing or navigating away discards in-flight preview work', async (page, query) => {
    let release; const hold = new Promise(resolve => { release = resolve; });
    await page.route('**/search-fixture/a', async route => { await hold; await route.fulfill({ contentType: 'text/html', body: article('a') }); });
    try {
      await page.locator('.search-button').click(); await query('acp');
      await page.keyboard.press('Escape');
      await page.evaluate(() => document.dispatchEvent(new Event('prenav')));
      const returned = page.waitForResponse('**/search-fixture/a'); release(); await returned;
      await page.waitForTimeout(60);
      assert.equal(await page.locator('.preview-container article').count(), 0);
      assert.equal(await page.locator('.result-card').count(), 0);
      assert.equal(await page.locator('.search-container').isVisible(), false);
    } finally { release(); }
  });
  await check('preview failures can retry without discarding search results', async (page, query) => {
    let attempts = 0;
    await page.route('**/search-fixture/a', route => {
      attempts++;
      return route.fulfill(attempts === 1 ? { status: 503, body: 'unavailable' }
        : { contentType: 'text/html', body: article('a') });
    });
    await page.locator('.search-button').click(); await query('acp');
    await page.waitForFunction(() => document.querySelector('.preview-container')?.textContent.includes('预览暂时无法加载'));
    assert.equal(await page.locator('.result-card').count(), 2);
    await page.locator('.result-card').first().dispatchEvent('mouseenter');
    await page.locator('.preview-container article').waitFor();
    assert.equal(attempts, 2);
  });
  for (const malformed of [false, true]) await check(`index ${malformed ? 'invalid JSON' : 'HTTP 503'} exposes an error and retries`, async (page, query) => {
    let attempts = 0;
    await page.route('**/static/searchIndex.json', route => {
      attempts++;
      return route.fulfill(attempts === 1
        ? { status: malformed ? 200 : 503, body: malformed ? '{invalid' : 'unavailable' }
        : { contentType: 'application/json', body: JSON.stringify(documents) });
    });
    await page.locator('.search-button').click();
    await page.locator('.search-error').waitFor();
    assert.equal(await page.locator('.no-match').count(), 0);
    if (malformed) await page.locator('.search-error button').click();
    await query('acp'); await page.locator('.result-card:not(.search-error)').first().waitFor();
    assert.equal(await page.locator('.result-card:not(.search-error)').count(), 2);
    assert.equal(attempts, 2);
  });
  await check('shared metadata accepts URL inputs and evicts failed HTTP responses', async page => {
    let attempts = 0;
    await page.route('**/static/contentIndex.json', route => {
      attempts++;
      return route.fulfill(attempts === 1 ? { status: 503, body: 'unavailable' }
        : { contentType: 'application/json', body: JSON.stringify({ ready: true }) });
    });
    const data = await page.evaluate(async () => {
      const first = await fetch('/static/contentIndex.json');
      const retry = await Promise.all([
        fetch(new URL('/static/contentIndex.json', location.origin)),
        fetch('/static/contentIndex.json'),
      ]);
      return { status: first.status, retry: await Promise.all(retry.map(response => response.json())) };
    });
    assert.deepEqual(data, { status: 503, retry: [{ ready: true }, { ready: true }] });
    assert.equal(attempts, 2);
  });
  for (const options of [{ mobile: true }, { preview: false }]) await check(`no preview download: ${JSON.stringify(options)}`, async (page, query, requests) => {
    await page.locator('.search-button').click(); await query('acp');
    await page.waitForTimeout(60);
    assert.equal(requests.filter(url => url.includes('/search-fixture/')).length, 0);
    assert.equal(await page.locator('.preview-container article').count(), 0);
  }, options);
  await check('repeated navigation events do not duplicate keyboard handlers or keep stale work', async (page, query, requests) => {
    await page.evaluate(() => {
      for (let i = 0; i < 3; i++) document.dispatchEvent(new Event('nav'));
    });
    await page.keyboard.press('Control+k'); await query('acp');
    await page.locator('.search-bar').press('ArrowDown');
    assert.equal(await page.locator('.result-card.focus').getAttribute('data-slug'), 'search-fixture/b');
    assert.equal(requests.filter(url => url.endsWith('searchIndex.json')).length, 1);
  });
  assert.deepEqual(pageErrors, [], 'no browser runtime errors');
  assert.deepEqual(failures, [], 'search behavior regressions');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
