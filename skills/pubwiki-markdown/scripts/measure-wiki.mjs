// Benchmark already exported static files, never a vault or user configuration.
// node scripts/measure-wiki.mjs --root <output> --article <relative.html>
//   --playwright <index.mjs> --browser <executable> --report <json> [--runs 3] [--query rustup]
import { readFile, writeFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: Object.fromEntries(['root', 'article', 'playwright', 'browser', 'report', 'runs', 'query'].map(name => [name, { type: 'string' }])) });
for (const name of ['root', 'article', 'playwright', 'report']) if (!values[name]) throw new Error(`--${name} is required`);
const root = path.resolve(values.root), article = values.article.replaceAll('\\', '/');
if (!article.endsWith('.html') || article.split('/').includes('..')) throw new Error('Article must be a relative exported HTML path');
const runs = Number(values.runs || 3);
const query = values.query || 'rustup';
if (!Number.isInteger(runs) || runs < 1 || runs > 10) throw new Error('Runs must be between 1 and 10');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    let relative = decodeURIComponent(url.pathname).replace(/^\/wiki\//, '');
    if (!relative) relative = 'index.html';
    if (relative.endsWith('/')) relative += 'index.html';
    if (!path.extname(relative)) relative += '.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) throw new Error('Invalid path');
    const info = await stat(file);
    const content = await readFile(file);
    const modified = info.mtime.toUTCString();
    response.setHeader('Last-Modified', modified);
    response.setHeader('Cache-Control', /^static\/wm-assets\/[^/]+\.[a-f0-9]{64}\.(css|js|svg|woff2)$/.test(relative) ? 'private, max-age=86400, immutable' : 'private, no-cache');
    response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    if (request.headers['if-modified-since'] === modified) { response.writeHead(304); response.end(); return }
    const compress = /\.(html|css|js|json|svg)$/.test(file);
    const bytes = compress ? gzipSync(content) : content;
    if (compress) { response.setHeader('Content-Encoding', 'gzip'); response.setHeader('Vary', 'Accept-Encoding') }
    response.setHeader('Content-Length', bytes.length);
    response.end(bytes);
  } catch { response.writeHead(404); response.end('not found') }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/wiki/`;
const { chromium } = await import(pathToFileURL(path.resolve(values.playwright)).href);
const browser = await chromium.launch({ headless: true, ...(values.browser ? { executablePath: values.browser } : {}) });
const samples = [];
try {
  for (let run = 0; run < runs; run++) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage(), rows = [], byID = new Map(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable'); await cdp.send('Performance.enable');
    cdp.on('Network.requestWillBeSent', event => {
      const url = new URL(event.request.url);
      const row = { path: url.origin === new URL(base).origin ? url.pathname : url.hostname + url.pathname, type: event.type, status: 0, cached: false, encodedBodyBytes: 0 };
      rows.push(row); byID.set(event.requestId, row);
    });
    cdp.on('Network.requestServedFromCache', event => { const row = byID.get(event.requestId); if (row) row.cached = true });
    cdp.on('Network.responseReceived', event => { const row = byID.get(event.requestId); if (row) { row.status ||= event.response.status; row.cached ||= event.response.fromDiskCache; row.encoding = event.response.headers['Content-Encoding'] || event.response.headers['content-encoding'] || ''; row.contentLength = Number(event.response.headers['Content-Length'] || event.response.headers['content-length'] || 0) } });
    cdp.on('Network.responseReceivedExtraInfo', event => { const row = byID.get(event.requestId); if (row) row.status = event.statusCode });
    cdp.on('Network.dataReceived', event => { const row = byID.get(event.requestId); if (row && !row.cached && row.status !== 304) row.encodedBodyBytes += event.encodedDataLength });
    cdp.on('Network.loadingFinished', event => { const row = byID.get(event.requestId); if (row && !row.cached && row.status !== 304 && !row.encodedBodyBytes) row.encodedBodyBytes = row.contentLength });
    const settle = async () => { await page.waitForLoadState('networkidle'); await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))) };
    const snapshot = async start => {
      await settle();
      const requests = rows.slice(start);
      const live = await page.evaluate(() => ({ elements: document.querySelectorAll('*').length, tagElements: document.querySelector('.knowledge-tags-sidebar')?.querySelectorAll('*').length || 0 }));
      return { requests: requests.filter(row => !row.cached).length, conditionalRequests: requests.filter(row => row.status === 304).length,
        encodedBodyBytes: requests.reduce((sum, row) => sum + row.encodedBodyBytes, 0), ...live, resources: requests };
    };
    const sample = { run: run + 1 };
    await page.goto(base + article.slice(0, -5).split('/').map(encodeURIComponent).join('/'));
    sample.cold = await snapshot(0);
    sample.cold.navigation = await page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return { ttfbMs: n.responseStart - n.requestStart, domContentLoadedMs: n.domContentLoadedEventEnd, loadMs: n.loadEventEnd } });
    const performanceMetrics = (await cdp.send('Performance.getMetrics')).metrics;
    sample.cold.cpuMs = Object.fromEntries(performanceMetrics.filter(metric => ['LayoutDuration', 'RecalcStyleDuration', 'ScriptDuration', 'TaskDuration'].includes(metric.name)).map(metric => [metric.name, metric.value * 1000]));
    let start = rows.length;
    await page.locator('[data-knowledge-pane="search"]').click();
    sample.searchOpen = await snapshot(start);
    start = rows.length;
    const queryStart = Date.now();
    await page.locator('.search-bar').fill(query);
    await page.waitForFunction(() => !!document.querySelector('.result-card') && !document.querySelector('.search-loading'));
    const resultLatencyMs = Date.now() - queryStart;
    sample.firstQuery = await snapshot(start);
    sample.firstQuery.resultLatencyMs = resultLatencyMs;
    sample.firstQuery.results = await page.locator('.result-card:not(.no-match)').count();
    sample.firstQuery.resultSlugs = await page.locator('.result-card:not(.no-match)').evaluateAll(cards => cards.map(card => card.dataset.slug));
    sample.firstQuery.query = query;
    start = rows.length;
    await page.locator('[data-knowledge-pane="tags"]').click();
    sample.tagsOpen = await snapshot(start);
    start = rows.length;
    await page.reload(); sample.warm = await snapshot(start);
    sample.warm.navigation = await page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return { domContentLoadedMs: n.domContentLoadedEventEnd, loadMs: n.loadEventEnd } });
    await page.goto(base); await settle(); start = rows.length;
    const card = page.locator('a.knowledge-page-card-link').filter({ has: page.locator('h2') }).filter({ hasText: 'Lesson A' }).first();
    await card.hover(); await page.waitForTimeout(350); await card.click();
    await page.waitForFunction(articlePath => location.pathname.endsWith(articlePath), article.slice(0, -5));
    sample.hoverThenClick = await snapshot(start);
    sample.errors = errors;
    if (errors.length) throw new Error('Page errors: ' + errors.join('; '));
    samples.push(sample); await context.close();
  }
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)) }
const median = numbers => [...numbers].sort((a, b) => a - b)[Math.floor(numbers.length / 2)];
const html = await readFile(path.join(root, article));
const summary = { htmlBytes: html.length, htmlGzipBytes: gzipSync(html).length };
for (const phase of ['cold', 'searchOpen', 'firstQuery', 'tagsOpen', 'warm', 'hoverThenClick']) {
  summary[phase] = Object.fromEntries(['requests', 'conditionalRequests', 'encodedBodyBytes', 'elements', 'tagElements'].map(key => [key, median(samples.map(sample => sample[phase][key]))]));
  if (samples[0][phase].navigation) summary[phase].navigation = Object.fromEntries(Object.keys(samples[0][phase].navigation).map(key => [key, median(samples.map(sample => sample[phase].navigation[key]))]));
  if (samples[0][phase].resultLatencyMs !== undefined) summary[phase].resultLatencyMs = median(samples.map(sample => sample[phase].resultLatencyMs));
  if (samples[0][phase].cpuMs) summary[phase].cpuMs = Object.fromEntries(Object.keys(samples[0][phase].cpuMs).map(key => [key, median(samples.map(sample => sample[phase].cpuMs[key]))]));
}
const report = { version: 1, recordedAt: new Date().toISOString(), environment: { browser: browser.version(), runs, query, compression: 'local gzip; external resources retain origin encoding', viewport: '1440x900', scope: 'exported Wiki only, no host application', cache: 'fingerprinted presentation assets emulate Registry cache policy', timing: 'local medians; do not compare to single remote captures' }, summary, samples };
await writeFile(path.resolve(values.report), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
