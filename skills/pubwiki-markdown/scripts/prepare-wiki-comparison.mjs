// Reuse published HTML for before/after comparisons without reading Markdown.
// --published <snapshot> --resources <fresh synthetic Quartz output>
// --output <new directory> --runtime <pinned Quartz>
import { cp, mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
const { values } = parseArgs({ options: Object.fromEntries(['published', 'resources', 'output', 'runtime'].map(name => [name, { type: 'string' }])) });
for (const name of ['published', 'resources', 'output', 'runtime']) if (!values[name]) throw new Error(`--${name} is required`);
const output = path.resolve(values.output);
try { await stat(output); throw new Error('Comparison output must not already exist') } catch (error) { if (error.code !== 'ENOENT') throw error }
registerHooks({ resolve(specifier, context, next) {
  return next(specifier, specifier === 'parse5' ? { ...context, parentURL: pathToFileURL(path.join(path.resolve(values.runtime), 'package.json')).href } : context);
} });
const { optimizeSite } = await import('../assets/quartz/quartz/wheelmaker/resources.mjs');
const { buildSearchIndex } = await import('../assets/quartz/quartz/wheelmaker/search-index.mjs');
await cp(path.resolve(values.published), output, { recursive: true });
for (const file of ['index.css', 'prescript.js', 'postscript.js']) await cp(path.join(path.resolve(values.resources), file), path.join(output, file));
const records = JSON.parse(await readFile(path.join(output, 'static/searchIndex.json'), 'utf8'));
if (records.version === 2) throw new Error('Use a pre-optimization published snapshot as baseline');
const { index, texts } = buildSearchIndex(records);
await mkdir(path.join(output, 'static/search-text'), { recursive: true });
for (const [file, data] of Object.entries(texts)) await writeFile(path.join(output, file), JSON.stringify(data));
await writeFile(path.join(output, 'static/searchIndex.json'), JSON.stringify(index));
const result = await optimizeSite(output, { runtime: path.resolve(values.runtime) });
console.log(JSON.stringify({ pages: result.pages, tokenStyles: result.styles, searchDocuments: index.documents.length, fullTextFiles: Object.keys(texts).length, candidateIndexBytes: Buffer.byteLength(JSON.stringify(index)) }));
