import { mkdir, writeFile, readFile, readdir, lstat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { homePage, documentPage } from './web-templates.mjs';
import { renderWebArticle, markdownText, escapeText } from './web-markdown.mjs';
import { inside, loadVault, prepareMarkdown, regularFiles } from './vault.mjs';
import { searchDocuments } from './public/search.mjs';
import { highlightCodeBlocks } from './code-highlight.mjs';
import { staticAssets } from './static-assets.mjs';

export async function exportVault({ input, output, prefix = '/wiki' } = {}) {
  input = path.resolve(input); output = path.resolve(output);
  if (inside(input, output) || inside(output, input)) throw new Error('Output must be outside the Vault');
  if (!/^\/(?:[A-Za-z0-9._~-]+\/)*[A-Za-z0-9._~-]+$/.test(prefix) || prefix.includes('..')) throw new Error('Invalid site prefix');
  if ((await lstat(input)).isSymbolicLink()) throw new Error('Vault root must not be a link');
  try { if ((await lstat(output)).isSymbolicLink() || (await readdir(output)).length) throw new Error('Output must be an empty regular directory'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  let config;
  try { config = JSON.parse(await readFile(path.join(input, 'public-input.json'), 'utf8')); }
  catch { throw new Error('PubWiki requires a Hub-prepared public projection; update WheelMaker and use wiki preview or wiki publish'); }
  if (config.format !== 'wheelmaker-public-vault-v1') throw new Error('Unsupported public Wiki input');
  try { await lstat(path.join(input, 'wiki.config.yaml')); throw new Error('Private Wiki configuration must not reach the reader'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const site = { title: 'WheelMaker Knowledge', description: 'Browse the WheelMaker knowledge base.' };
  for (const field of ['title', 'description']) if (config.site?.[field] !== undefined) {
    if (typeof config.site[field] !== 'string' || !config.site[field].trim()) throw new Error(`Public Wiki site.${field} must be a non-empty string`);
    site[field] = config.site[field].trim();
  }
  const vault = await loadVault(input, prefix), diagnostics = [];
  const records = vault.notes.map(note => ({ document_id: note.document_id, title: note.title, description: note.description,
    directory: note.directory, tags: note.tags, date: note.date, author: note.author, url: note.url,
    text: markdownText(note.body) }));
  const directories = new Map(), tags = new Map();
  for (const note of vault.notes) {
    const parts = note.directory.split('/').filter(Boolean);
    parts.forEach((_, i) => { const name = parts.slice(0, i + 1).join('/'); directories.set(name, (directories.get(name) || 0) + 1); });
    note.tags.forEach(tag => tags.set(tag, (tags.get(tag) || 0) + 1));
  }
  const navigation = { documents: records, total: records.length,
    directories: [...directories].map(([directory, count]) => ({ directory, count })),
    tags: [...tags].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count) };
  const prepared = [];
  let hasMath = false, hasMermaid = false;
  for (const note of vault.notes) {
    const body = await prepareMarkdown(note, vault, diagnostics);
    const article = renderWebArticle(body, { documentId: note.document_id, documentTitle: note.title, publicBasePath: prefix });
    article.html = await highlightCodeBlocks(article.html);
    hasMath ||= article.html.includes('class="katex"');
    hasMermaid ||= article.html.includes('<pre class="mermaid">');
    prepared.push({ note, article });
  }
  const emit = async (name, bytes) => {
    const destination = path.join(output, name);
    if (!inside(output, destination)) throw new Error(`Unsafe output path: ${name}`);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes);
  };
  const assets = await staticAssets(prefix, hasMermaid);
  const require = createRequire(import.meta.url);
  const katexVersion = hasMath ? require('katex/package.json').version : '';
  const occupied = new Set(vault.notes.map(note => `${note.slug}.html`));
  const adjust = html => {
    const diagramPage = html.includes('<pre class="mermaid">');
    const renderedDirectory = /<html[^>]*data-directory="([^"]*)"/.exec(html)?.[1] || '';
    const imports = { ...assets.readerImports, ...(diagramPage ? assets.mermaidImports : {}) };
    let result = html.replace('<html lang="zh-CN"', `<html lang="zh-CN" data-pubwiki-engine="dochub" data-static-directory="${renderedDirectory}" data-static-catalog="${prefix}/static/catalog.json" data-static-index="${prefix}/static/search.json"${diagramPage ? ` data-mermaid-entry="${assets.mermaidEntry}"` : ''}`)
      .replace(/<form method="post" action="[^"]*\/logout">[\s\S]*?<\/form>/g, '')
      .replace('<script src=', '<script type="module" src=')
      .replace(/href="[^"]*\/assets\/dochub\.css\?v=[^"]*"/, `href="${assets.style}"`)
      .replace(/src="[^"]*\/assets\/dochub\.js\?v=[^"]*"/, `src="${assets.script}"`)
      .replace('<link rel="stylesheet"', `<script type="importmap">${JSON.stringify({ imports })}</script><link rel="stylesheet"`)
      .replace('<span>WheelMaker Wiki</span>', `<span>${escapeText(site.title)}</span>`)
      .replace('aria-label="WheelMaker Wiki 文档总览"', `aria-label="${escapeText(site.title)} 文档总览"`)
      .replace(/<title>([\s\S]*?) · WheelMaker Wiki<\/title>/, (_match, title) => `<title>${title} · ${escapeText(site.title)}</title>`)
      .replaceAll('团队知识库', escapeText(site.title))
      .replace('<h1 class="library-title">文档库</h1>', `<h1 class="library-title">${escapeText(site.title)}</h1>`);
    if (result.includes('class="katex"')) result = result.replace('</head>', `<link rel="stylesheet" href="${prefix}/assets/katex/${katexVersion}/katex.min.css"></head>`);
    for (const note of vault.notes) result = result.replaceAll(`${prefix}/document/${note.document_id}`, note.url);
    result = result.replace(/href="([^"<>]*)"/g, (attribute, href) => {
      if (!href.startsWith(`${prefix}/?`)) return attribute;
      const params = new URLSearchParams(href.slice(prefix.length + 2).replaceAll('&amp;', '&'));
      const directory = params.get('directory');
      if (!directory || !directories.has(directory) || occupied.has(`${directory}/index.html`)) return attribute;
      if ([...params].some(([key, value]) => key !== 'directory' && !(key === 'limit' && value === '20'))) return attribute;
      return `href="${prefix}/${directory.split('/').map(encodeURIComponent).join('/')}/index.html"`;
    });
    return result;
  };
  const first = searchDocuments(records, { limit: 20 });
  await emit('index.html', adjust(homePage({ ...first, prefix, navigation })));
  for (const directory of directories.keys()) {
    const name = `${directory}/index.html`;
    if (!occupied.has(name)) await emit(name, adjust(homePage({
      ...searchDocuments(records, { directory, limit: 20 }), directory, prefix, navigation })));
  }
  const allTags = new Set();
  for (const tag of tags.keys()) tag.split('/').forEach((_, i, parts) => allTags.add(parts.slice(0, i + 1).join('/')));
  for (const tag of allTags) {
    const name = `tags/${tag}.html`;
    if (!occupied.has(name)) await emit(name, adjust(homePage({
      ...searchDocuments(records, { tag, tag_descendants: true, limit: 20 }), tag, prefix, navigation }))
      .replace('data-pubwiki-engine="dochub"', `data-static-tag="${escapeText(tag)}" data-tag-descendants="true" data-pubwiki-engine="dochub"`));
  }
  for (const { note, article } of prepared) {
    const html = adjust(documentPage({ document_id: note.document_id, body: note.body, metadata: note, assets: [] },
      { ...article, prefix, navigation }));
    await emit(`${note.slug}.html`, html);
  }
  await emit('static/search.json', JSON.stringify({ version: 1, documents: records }));
  const catalog = records.map(({ text, ...metadata }) => ({ ...metadata, description: metadata.description || text.slice(0, 180) }));
  await emit('static/catalog.json', JSON.stringify({ version: 1, documents: catalog }));
  for (const [name, bytes] of assets.files) await emit(name, bytes);
  for (const asset of vault.assets.values()) await emit(`static/assets/${asset.name}`, asset.bytes);
  if (hasMath) {
    const root = path.dirname(require.resolve('katex/package.json'));
    await emit(`assets/katex/${katexVersion}/katex.min.css`, await readFile(path.join(root, 'dist/katex.min.css')));
    await emit(`assets/katex/${katexVersion}/LICENSE`, await readFile(path.join(root, 'LICENSE')));
    for (const name of await regularFiles(path.join(root, 'dist/fonts')))
      await emit(`assets/katex/${katexVersion}/fonts/${name}`, await readFile(path.join(root, 'dist/fonts', name)));
  }
  return { documents: records.length, assets: vault.assets.size, diagnostics };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2), values = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--input', '--output'].includes(args[i]) || !args[i + 1]) throw new Error('Usage: exporter.mjs --input <public projection> --output <empty directory>');
    values[args[i].slice(2)] = args[i + 1];
  }
  if (!values.input || !values.output) throw new Error('Both --input and --output are required');
  console.log(JSON.stringify(await exportVault(values)));
}
