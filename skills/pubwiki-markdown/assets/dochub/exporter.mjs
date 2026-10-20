import { mkdir, writeFile, readFile, readdir, lstat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { parse } from 'yaml';
import { homePage, documentPage } from './web-templates.mjs';
import { renderWebArticle, markdownText, escapeText } from './web-markdown.mjs';
import { inside, loadVault, prepareMarkdown, regularFiles } from './vault.mjs';
import { searchDocuments } from './public/search.mjs';

export async function exportVault({ input, output, prefix = '/wiki' } = {}) {
  input = path.resolve(input); output = path.resolve(output);
  if (inside(input, output) || inside(output, input)) throw new Error('Output must be outside the Vault');
  if (!/^\/(?:[A-Za-z0-9._~-]+\/)*[A-Za-z0-9._~-]+$/.test(prefix) || prefix.includes('..')) throw new Error('Invalid site prefix');
  if ((await lstat(input)).isSymbolicLink()) throw new Error('Vault root must not be a link');
  try { if ((await lstat(output)).isSymbolicLink() || (await readdir(output)).length) throw new Error('Output must be an empty regular directory'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const config = parse(await readFile(path.join(input, 'wiki.config.yaml'), 'utf8')) ?? {};
  const site = { title: 'WheelMaker Knowledge', description: 'Browse the WheelMaker knowledge base.' };
  for (const field of ['title', 'description']) if (config.site?.[field] !== undefined) {
    if (typeof config.site[field] !== 'string' || !config.site[field].trim()) throw new Error(`wiki.config.yaml site.${field} must be a non-empty string`);
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
    hasMath ||= article.html.includes('class="katex"');
    hasMermaid ||= article.html.includes('class="mermaid"');
    prepared.push({ note, article });
  }
  const emit = async (name, bytes) => {
    const destination = path.join(output, name);
    if (!inside(output, destination)) throw new Error(`Unsafe output path: ${name}`);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes);
  };
  const adjust = html => {
    let result = html.replace('<html lang="zh-CN"', `<html lang="zh-CN" data-pubwiki-engine="dochub" data-static-index="${prefix}/static/search.json"`)
      .replace(/<form method="post" action="[^"]*\/logout">[\s\S]*?<\/form>/g, '')
      .replace('<script src=', '<script type="module" src=')
      .replace('<span>WheelMaker Wiki</span>', `<span>${escapeText(site.title)}</span>`)
      .replace('aria-label="WheelMaker Wiki 文档总览"', `aria-label="${escapeText(site.title)} 文档总览"`)
      .replace(/<title>([\s\S]*?) · WheelMaker Wiki<\/title>/, (_match, title) => `<title>${title} · ${escapeText(site.title)}</title>`)
      .replaceAll('团队知识库', escapeText(site.title))
      .replaceAll('知识，随手可得。', escapeText(site.title))
      .replaceAll('从项目约定到问题解法，找到下一步需要的答案。', escapeText(site.description));
    if (result.includes('class="katex"')) result = result.replace('</head>', `<link rel="stylesheet" href="${prefix}/assets/katex/katex.min.css"></head>`);
    for (const note of vault.notes) result = result.replaceAll(`${prefix}/document/${note.document_id}`, note.url);
    return result;
  };
  const first = searchDocuments(records, { limit: 20 });
  await emit('index.html', adjust(homePage({ ...first, prefix, navigation })));
  const occupied = new Set(vault.notes.map(note => `${note.slug}.html`));
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
  for (const name of ['dochub.css', 'dochub.js', 'search.mjs', 'library.mjs'])
    await emit(`assets/${name}`, await readFile(new URL(`./public/${name}`, import.meta.url)));
  for (const asset of vault.assets.values()) await emit(`static/assets/${asset.name}`, asset.bytes);
  const require = createRequire(import.meta.url);
  if (hasMath) {
    const root = path.dirname(require.resolve('katex/package.json'));
    await emit('assets/katex/katex.min.css', await readFile(path.join(root, 'dist/katex.min.css')));
    await emit('assets/katex/LICENSE', await readFile(path.join(root, 'LICENSE')));
    for (const name of await regularFiles(path.join(root, 'dist/fonts')))
      await emit(`assets/katex/fonts/${name}`, await readFile(path.join(root, 'dist/fonts', name)));
  }
  if (hasMermaid) {
    const root = path.dirname(require.resolve('mermaid/package.json'));
    await emit('assets/mermaid.min.js', await readFile(path.join(root, 'dist/mermaid.min.js')));
    await emit('assets/mermaid-LICENSE', await readFile(path.join(root, 'LICENSE')));
  }
  return { documents: records.length, assets: vault.assets.size, diagnostics };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2), values = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--input', '--output'].includes(args[i]) || !args[i + 1]) throw new Error('Usage: exporter.mjs --input <Vault> --output <empty directory>');
    values[args[i].slice(2)] = args[i + 1];
  }
  if (!values.input || !values.output) throw new Error('Both --input and --output are required');
  console.log(JSON.stringify(await exportVault(values)));
}
