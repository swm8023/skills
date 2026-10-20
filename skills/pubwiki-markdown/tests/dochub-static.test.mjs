import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

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
  await writeFile(path.join(input, 'wiki.config.yaml'), 'site:\n  title: My Notes\n  description: A local Vault\nprivate: never-export-this-setting\n');
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
  assert.equal((article.match(/<h1\b/g) || []).length, 1, 'the fixed toolbar owns the article title');
  assert.match(article, /<h1 class="toolbar-title">Start<\/h1>/);
  assert.match(await readFile(path.join(f.output, 'assets/theme.mjs'), 'utf8'), /export function initializeTheme/);
  assert.match(await readFile(path.join(f.output, 'Project/Guides/index.html'), 'utf8'), /data-directory="Project\/Guides"/);
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
