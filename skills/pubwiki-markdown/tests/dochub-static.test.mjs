import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { runInNewContext } from 'node:vm';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const engineURL = new URL('../assets/dochub/exporter.mjs', import.meta.url);
async function engine() {
  const module = await import(engineURL).catch(error => {
    if (error.code === 'ERR_MODULE_NOT_FOUND' && error.url === engineURL.href) return {};
    throw error;
  });
  assert.equal(typeof module.exportVault, 'function', 'the reader must export a local Obsidian Vault');
  return module.exportVault;
}
async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'pubwiki-reader-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const input = path.join(root, 'data'), output = path.join(root, 'out');
  await mkdir(path.join(input, 'content', 'Project', 'Guides'), { recursive: true });
  await mkdir(path.join(input, 'content', 'assets', 'Project'), { recursive: true });
  await writeFile(path.join(input, 'public-input.json'), JSON.stringify({ format: 'wheelmaker-public-vault-v1', site: { title: 'My Notes', description: 'A local Vault' } }));
  const note = path.join(input, 'content', 'Project', 'Guides', 'start.md');
  await writeFile(note, '---\ntitle: Start\ntags: [UE/render]\ndate: 2026-10-19\n---\n# Start\n\n## Setup\n\nSearchable schema. [[Other|Next guide]]\n\n![[assets/Project/picture.png]]\n');
  await writeFile(path.join(input, 'content', 'Project', 'Guides', 'other.md'), '---\ntitle: Other\naliases: [Second guide]\n---\n# Other\n\n## Detail\n\nHello.');
  await writeFile(path.join(input, 'content', 'Project', 'Guides', 'draft.md'), '---\ntitle: Secret\ndraft: true\n---\nprivate-draft-body');
  await writeFile(path.join(input, 'content', 'assets', 'Project', 'picture.png'), Buffer.from('fixture-image'));
  await writeFile(path.join(input, 'content', 'assets', 'unused.txt'), 'private-unreferenced-attachment');
  return { root, input, output, note };
}
async function files(root, prefix = '') {
  const result = [];
  for (const entry of await readdir(path.join(root, prefix), { withFileTypes: true })) {
    const name = path.posix.join(prefix, entry.name);
    result.push(...(entry.isDirectory() ? await files(root, name) : [name]));
  }
  return result;
}

function readerModule(html, name) {
  const imports = JSON.parse(/<script type="importmap">([\s\S]*?)<\/script>/.exec(html)[1]).imports;
  return imports[`pubwiki-reader/${name}`].slice('/wiki/'.length);
}

test('reader rejects raw Vaults and private configuration rather than silently filtering them', async t => {
  const exportVault = await engine(), f = await fixture(t);
  await rm(path.join(f.input, 'public-input.json'));
  await writeFile(path.join(f.input, 'wiki.config.yaml'), 'private: never-export-this-setting');
  await assert.rejects(exportVault({ input: f.input, output: f.output }), /Hub-prepared public projection/);
  await writeFile(path.join(f.input, 'public-input.json'), JSON.stringify({ format: 'wheelmaker-public-vault-v1', site: {} }));
  await assert.rejects(exportVault({ input: f.input, output: f.output }), /Private Wiki configuration/);
  await assert.rejects(readdir(f.output), { code: 'ENOENT' });
});

test('exports content-addressed presentation modules and lazy Mermaid import maps', async t => {
  const exportVault = await engine(), f = await fixture(t);
  await writeFile(f.note, '# Start\n\n```mermaid\nflowchart LR\n A-->B\n```');
  await exportVault({ input: f.input, output: f.output });
  const article = await readFile(path.join(f.output, 'Project/Guides/start.html'), 'utf8');
  const home = await readFile(path.join(f.output, 'index.html'), 'utf8');
  const mapping = /<script type="importmap">([\s\S]*?)<\/script>/.exec(article);
  assert.ok(mapping, 'browser dependencies must resolve to immutable content-addressed files');
  const imports = JSON.parse(mapping[1]).imports;
  const { init, parse } = createRequire(engineURL)('es-module-lexer');
  await init;
  assert.ok(Object.keys(imports).some(name => name.startsWith('pubwiki-reader/')));
  assert.ok(Object.keys(imports).some(name => name.startsWith('pubwiki-mermaid/')));
  assert.match(article, /data-mermaid-entry="\/wiki\/static\/wm-assets\/[^"/]+\.[a-f0-9]{64}\.js"/);
  assert.doesNotMatch(home, /pubwiki-mermaid\/|data-mermaid-entry/);
  const urls = new Set([...Object.values(imports), ...[...article.matchAll(/(?:href|src)="(\/wiki\/static\/wm-assets\/[^"?]+)"/g)].map(match => match[1])]);
  for (const url of urls) {
    const match = /\/static\/wm-assets\/[^/]+\.([a-f0-9]{64})\.(?:js|css)$/.exec(url);
    assert.ok(match, `invalid immutable asset URL: ${url}`);
    const bytes = await readFile(path.join(f.output, url.slice('/wiki/'.length)));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), match[1]);
    assert.ok(bytes.length <= 8 * 1024 * 1024, 'existing Registry asset retention limit must hold');
    if (url.endsWith('.js')) {
      const [dependencies] = parse(bytes.toString());
      for (const dependency of dependencies) if (dependency.n)
        assert.ok(imports[dependency.n], `module dependency must resolve locally: ${dependency.n}`);
    }
  }
  assert.ok(!(await files(f.output)).includes('assets/mermaid.min.js'), 'the all-diagram UMD bundle must not be shipped');
});

test('exports a lightweight catalog without full article text', async t => {
  const exportVault = await engine(), f = await fixture(t);
  await writeFile(f.note, '---\ntitle: Start\n---\n# Start\n\n' + 'searchable-body-marker '.repeat(2000));
  await exportVault({ input: f.input, output: f.output });
  const index = await readFile(path.join(f.output, 'static/search.json'), 'utf8');
  const catalog = await readFile(path.join(f.output, 'static/catalog.json'), 'utf8').catch(() => '');
  assert.ok(catalog, 'directory browsing must not depend on the full-text index');
  assert.ok(catalog.length < index.length / 10);
  assert.equal(JSON.parse(catalog).documents.length, 2);
  assert.ok(JSON.parse(catalog).documents.every(document => !Object.hasOwn(document, 'text')));
  const html = await readFile(path.join(f.output, 'index.html'), 'utf8');
  assert.match(html, /data-static-catalog="\/wiki\/static\/catalog.json"/);
  assert.match(html, /href="\/wiki\/Project\/Guides\/index.html"/);
});

test('initial static library preserves its exported rows without fetching a search index', async t => {
  const previous = { document: globalThis.document, location: globalThis.location, fetch: globalThis.fetch };
  t.after(() => Object.assign(globalThis, previous));
  const root = { dataset: { page: 'library', basePath: '/wiki', staticIndex: '/wiki/static/search.json', staticCatalog: '/wiki/static/catalog.json', staticDirectory: '', directory: '' } };
  const locationElement = { dataset: { directory: '' } };
  globalThis.document = { documentElement: root, querySelector: selector => selector === '.document-location' ? locationElement : null };
  globalThis.location = new URL('https://wiki.example/wiki/');
  let fetches = 0;
  globalThis.fetch = async () => { fetches++; throw new Error('Unexpected initial index request'); };
  const { prepareStaticLibrary } = await import('../assets/dochub/public/library.mjs');
  await prepareStaticLibrary();
  assert.equal(fetches, 0, 'already-rendered lists must not download or rebuild the full index');
});

test('browsing uses metadata while full-text search downloads and reuses the body index', async t => {
  const previous = { document: globalThis.document, fetch: globalThis.fetch };
  t.after(() => Object.assign(globalThis, previous));
  globalThis.document = { documentElement: { dataset: { staticCatalog: '/index-test/catalog.json', staticIndex: '/index-test/search.json' } } };
  const metadata = { title: 'Start', description: 'Guide', directory: 'Project', tags: [], url: '/wiki/start.html' };
  const requests = [];
  globalThis.fetch = async url => {
    requests.push(url);
    return { ok: true, json: async () => ({ documents: [url.endsWith('search.json') ? { ...metadata, text: 'body-only-needle' } : metadata] }) };
  };
  const { staticSearch } = await import('../assets/dochub/public/library.mjs');
  assert.equal((await staticSearch({ directory: 'Project' })).total, 1);
  assert.deepEqual(requests, ['/index-test/catalog.json']);
  assert.equal((await staticSearch({ q: 'body-only-needle' })).total, 1);
  assert.equal((await staticSearch({ q: 'body-only-needle' })).total, 1);
  assert.deepEqual(requests, ['/index-test/catalog.json', '/index-test/search.json']);
});

test('exports adaptive Shiki colors, language aliases and safe plain-text fallback before browser scripts', async t => {
  const exportVault = await engine(), f = await fixture(t);
  await writeFile(f.note, '---\ntitle: Code\n---\n# Code\n\n```ts\nconst answer: number = 42;\nconsole.log("<script>alert(1)</script>");\n```\n\n```unknown-lang\na < b && c > d\n```\n\n```cpp\nint main() { return 0; }\n```');
  await exportVault({ input: f.input, output: f.output });
  const html = await readFile(path.join(f.output, 'Project/Guides/start.html'), 'utf8');
  assert.match(html, /--shiki-dark:/);
  assert.match(html, /--shiki-light:/);
  assert.match(html, /data-language="ts"/);
  assert.match(html, /data-language="cpp"/);
  assert.match(html, /data-language="unknown-lang"/);
  const plainCode = html.match(/<pre[^>]*data-language="unknown-lang"[^>]*>([\s\S]*?)<\/pre>/)[1]
    .replace(/<[^>]*>/g, '').replace(/&#x([\da-f]+);/gi, (_, value) => String.fromCodePoint(parseInt(value, 16)))
    .replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
  assert.equal(plainCode, 'a < b && c > d');
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.doesNotMatch(html, /src="https?:\/\//);
  for (const name of ['reader-code.mjs', 'reader-diagrams.mjs', 'reader-controls.mjs', 'mermaid-viewport.mjs'])
    assert.ok((await readFile(path.join(f.output, readerModule(html, name)))).length, `${name} must be available without the host app`);
});

test('exports unchanged nested Vault notes, reader pages, links, referenced assets and private-free search', async t => {
  const exportVault = await engine(), f = await fixture(t);
  const before = await readFile(f.note, 'utf8');
  const result = await exportVault({ input: f.input, output: f.output });
  assert.equal(result.documents, 2);
  assert.equal(await readFile(f.note, 'utf8'), before);
  const home = await readFile(path.join(f.output, 'index.html'), 'utf8');
  assert.match(home, /My Notes/);
  assert.doesNotMatch(home, /logout|api\/search|private-draft-body/);
  const article = await readFile(path.join(f.output, 'Project/Guides/start.html'), 'utf8');
  assert.match(article, /Next guide<\/a>/);
  assert.match(article, /reading-progress/);
  assert.match(article, /section-setup/);
  assert.equal((article.match(/<h1\b/g) || []).length, 2, 'the toolbar and article header each show the title, without repeating the source heading');
  assert.match(article, /<h1 class="toolbar-title">Start<\/h1>/);
  assert.match(article, /<h1 class="article-title">Start<\/h1>/);
  assert.match(await readFile(path.join(f.output, readerModule(article, 'theme.mjs')), 'utf8'), /export function initializeTheme/);
  assert.match(await readFile(path.join(f.output, 'Project/Guides/index.html'), 'utf8'), /data-directory="Project\/Guides"/);
  const directory = await readFile(path.join(f.output, 'Project/Guides/index.html'), 'utf8');
  const location = /<div class="document-location"[^>]*>([\s\S]*?)<\/div>/.exec(directory)?.[1];
  assert.match(location, /class="path-symbol"/, 'directory and article locations share the folder icon');
  assert.match(location, />Project<\/a>/);
  assert.match(location, /data-library-location>Guides<\/span>/);
  assert.match(await readFile(path.join(f.output, 'tags/UE.html'), 'utf8'), /data-static-tag="UE"/);
  const index = JSON.parse(await readFile(path.join(f.output, 'static/search.json'), 'utf8'));
  assert.equal(index.documents.length, 2);
  const all = (await files(f.output));
  assert.ok(all.some(name => name.endsWith('.png')));
  assert.ok(!all.some(name => /draft|wiki\.config|\.obsidian|\.md$|unused/.test(name)));
  const publicText = (await Promise.all(all.filter(name => /\.(html|json)$/.test(name)).map(name => readFile(path.join(f.output, name), 'utf8')))).join('\n');
  assert.doesNotMatch(publicText, /private-draft-body|never-export-this-setting|private-unreferenced-attachment/);
});

test('filters, ranks and paginates the public browser index', async () => {
  const { searchDocuments } = await import('../assets/dochub/public/search.mjs').catch(() => ({}));
  assert.equal(typeof searchDocuments, 'function', 'static search must work without an MCP server');
  const docs = [
    { document_id: 'a', title: 'Schema', directory: 'UE/render', tags: ['render'], text: 'schema setup', date: '2026-10-19' },
    { document_id: 'b', title: 'Guide', directory: 'UE', tags: ['render'], text: 'schema setup', date: '2026-10-18' },
    { document_id: 'c', title: 'Other', directory: 'Other', tags: ['render'], text: 'schema setup' }
  ];
  const result = searchDocuments(docs, { q: 'schema setup', directory: 'UE', tag: 'render', limit: 1 });
  assert.equal(result.total, 2);
  assert.equal(result.results[0].document_id, 'a');
  assert.equal(searchDocuments(docs, { directory: 'UE', offset: 1, limit: 1 }).results.length, 1);
});

test('article header displays an escaped title even when Markdown has no title heading', async t => {
  const exportVault = await engine(), f = await fixture(t);
  await writeFile(f.note, '---\ntitle: Guide & <example>\n---\n## Setup\n\nArticle content.');
  await exportVault({ input: f.input, output: f.output });
  const html = await readFile(path.join(f.output, 'Project/Guides/start.html'), 'utf8');
  assert.match(html, /<h1 class="article-title">Guide &amp; &lt;example&gt;<\/h1>/);
});

test('query-driven locations escape directory and article labels', async () => {
  const { renderLocation } = await import('../assets/dochub/public/location.mjs');
  const location = renderLocation('/wiki', 'Project/A&B/<script>', '<img src=x onerror=alert(1)>');
  assert.doesNotMatch(location, /<script>|<img /);
  assert.match(location, /A&amp;B/);
  assert.match(location, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(location, /directory=Project%2FA%26B/);
});

test('query-driven location updates even when the search index is unavailable', async t => {
  const previous = { document: globalThis.document, location: globalThis.location, fetch: globalThis.fetch };
  t.after(() => Object.assign(globalThis, previous));
  const root = { dataset: { page: 'library', basePath: '/wiki', staticIndex: '/wiki/static/search.json' } };
  const locationElement = { innerHTML: '', title: '', dataset: {} };
  globalThis.document = { documentElement: root, querySelector: selector => selector === '.document-location' ? locationElement : null };
  globalThis.location = new URL('https://wiki.example/wiki/?directory=Project%2FGuides');
  globalThis.fetch = async () => { throw new Error('offline'); };
  const { prepareStaticLibrary } = await import('../assets/dochub/public/library.mjs');
  await prepareStaticLibrary();
  assert.equal(root.dataset.directory, 'Project/Guides');
  assert.match(locationElement.innerHTML, />Project<\/a>/);
  assert.match(locationElement.innerHTML, /data-library-location>Guides<\/span>/);
});

test('query location is correct before deferred modules and is not replaced again', async t => {
  const exportVault = await engine(), f = await fixture(t);
  await exportVault({ input: f.input, output: f.output });
  const html = await readFile(path.join(f.output, 'index.html'), 'utf8');
  const bootstrap = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .find(match => match[1].includes('bootstrapLocation'));
  assert.ok(bootstrap, 'the initial library title must not wait for deferred modules');
  const root = { dataset: { page: 'library', basePath: '/wiki', staticIndex: '/wiki/static/search.json', directory: '' } };
  let writes = 0, markup = '全部文档';
  const locationElement = { dataset: { directory: '' }, title: '',
    get innerHTML() { return markup; }, set innerHTML(value) { writes++; markup = value; } };
  const view = { document: { documentElement: root, querySelector: () => locationElement },
    location: new URL('https://wiki.example/wiki/?directory=Project%2FGuides') };
  runInNewContext(bootstrap[1], { window: view, URLSearchParams });
  assert.match(markup, /data-library-location>Guides<\/span>/);
  assert.equal(root.dataset.directory, 'Project/Guides');
  const { bootstrapLocation } = await import('../assets/dochub/public/location.mjs');
  bootstrapLocation(view);
  assert.equal(writes, 1, 'module initialization must retain the existing title nodes');
});

test('rejects content links and output paths that escape the Vault', async t => {
  const exportVault = await engine(), f = await fixture(t);
  await assert.rejects(exportVault({ input: f.input, output: path.join(f.input, 'content', 'out') }), /output|inside/i);
  await writeFile(f.note, '# Start\n\n![unsafe](../../../outside.txt)');
  await writeFile(path.join(f.root, 'outside.txt'), 'private');
  await assert.rejects(exportVault({ input: f.input, output: f.output }), /outside|escape|asset/i);
});

test('renders math, Mermaid source, aliases, embeds and block links without Quartz', async t => {
  const exportVault = await engine(), f = await fixture(t);
  await writeFile(f.note, '---\ntitle: Start\n---\n# Start\n\n[[Second guide#Detail|Alias link]]\n\n![[Other#Detail]]\n\nInline $E=mc^2$.\n\n```mermaid\ngraph TD\n A-->B\n```\n\nA block. ^stable\n\n[[#^stable|Block link]]\n\n`$notmath$`');
  await exportVault({ input: f.input, output: f.output });
  const html = await readFile(path.join(f.output, 'Project/Guides/start.html'), 'utf8');
  assert.match(html, /class="katex"/);
  assert.match(html, /class="mermaid"/);
  assert.match(html, /section-detail[^\"]*">Alias link/);
  assert.match(html, /id="block-stable"/);
  assert.match(html, /block-stable[^\"]*">Block link/);
  assert.match(html, /Hello\./);
  assert.match(html, /<code>\$notmath\$<\/code>/);
});

test('inline tags ignore fenced examples and code spans', async t => {
  const exportVault = await engine(), f = await fixture(t);
  await writeFile(f.note, '---\ntitle: Start\n---\n# Start\n\n#real/topic\n\n`#not-a-tag`\n\n```cpp\n#include <vector>\n```');
  await exportVault({ input: f.input, output: f.output });
  const index = JSON.parse(await readFile(path.join(f.output, 'static/search.json'), 'utf8'));
  assert.deepEqual(index.documents.find(note => note.title === 'Start').tags, ['real/topic']);
});
