#!/usr/bin/env node
import { createServer } from 'node:http';
import { mkdtemp, mkdir, stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveWikiPaths } from './wiki-state.mjs';
import { ensureReader } from './ensure-reader.mjs';

const paths = resolveWikiPaths();
await ensureReader();
await mkdir(path.join(paths.wiki, '.previews'), { recursive: true });
const output = await mkdtemp(path.join(paths.wiki, '.previews', 'reader-'));
const { exportVault } = await import(pathToFileURL(path.join(paths.wiki, 'reader', 'exporter.mjs')).href);
const result = await exportVault({ input: paths.data, output });
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    if (url.pathname === '/') { response.writeHead(302, { location: '/wiki/' }); response.end(); return; }
    if (!url.pathname.startsWith('/wiki/')) throw new Error('Not found');
    let relative = decodeURIComponent(url.pathname.slice('/wiki/'.length));
    if (!relative) relative = 'index.html';
    const filename = path.resolve(output, relative);
    if (!filename.startsWith(output + path.sep)) throw new Error('Not found');
    let actual = filename;
    try { if (!(await stat(actual)).isFile()) actual = path.join(actual, 'index.html'); }
    catch { actual += '.html'; }
    response.writeHead(200, { 'content-type': types[path.extname(actual)] || 'application/octet-stream',
      'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
    response.end(await readFile(actual));
  } catch { response.writeHead(404); response.end('Not found'); }
});
server.listen(0, '127.0.0.1', () => {
  console.log(JSON.stringify({ preview: `http://127.0.0.1:${server.address().port}/wiki/`, documents: result.documents,
    unresolvedLinks: result.diagnostics.length, output }));
});
process.on('SIGINT', () => server.close());
process.on('SIGTERM', () => server.close());
