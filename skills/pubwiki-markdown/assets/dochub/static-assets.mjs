import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { init, parse } from 'es-module-lexer';

const readerRoot = fileURLToPath(new URL('./public/', import.meta.url));
const readerModules = ['dochub.js', 'search.mjs', 'library.mjs', 'theme.mjs', 'location.mjs',
  'reader-code.mjs', 'reader-controls.mjs', 'reader-diagrams.mjs', 'mermaid-viewport.mjs', 'more-menu.mjs', 'share.mjs'];
let readerPromise, mermaidPromise;

function address(name, bytes, extension) {
  const digest = createHash('sha256').update(bytes).digest('hex');
  return `static/wm-assets/${name}.${digest}.${extension}`;
}

async function modules(root, names, namespace) {
  await init;
  const known = new Set(names), files = new Map(), imports = {};
  for (const name of names) {
    let source = await readFile(path.join(root, name), 'utf8');
    const [dependencies] = parse(source);
    // Stable import-map IDs break filename cycles, so each file's SHA describes
    // its final bytes even when diagram loaders import their shared core again.
    for (const dependency of dependencies.reverse()) {
      if (!dependency.n) continue;
      if (!dependency.n.startsWith('.')) throw new Error(`Unexpected external presentation dependency: ${dependency.n}`);
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(name), dependency.n));
      if (!known.has(target)) throw new Error(`Missing presentation dependency: ${target}`);
      const id = `${namespace}/${target}`;
      source = source.slice(0, dependency.s) + (dependency.d >= 0 ? JSON.stringify(id) : id) + source.slice(dependency.e);
    }
    const bytes = Buffer.from(source);
    const stem = path.posix.basename(name).replace(/\.(?:mjs|js)$/, '');
    const relative = address(`${namespace}-${stem}`, bytes, 'js');
    files.set(relative, bytes); imports[`${namespace}/${name}`] = relative;
  }
  return { files, imports };
}

async function reader() {
  const result = await modules(readerRoot, readerModules, 'pubwiki-reader');
  const css = await readFile(path.join(readerRoot, 'dochub.css'));
  result.style = address('pubwiki-reader', css, 'css'); result.files.set(result.style, css);
  return result;
}

async function mermaid() {
  const require = createRequire(import.meta.url);
  const root = path.join(path.dirname(require.resolve('mermaid/package.json')), 'dist');
  const directory = 'chunks/mermaid.esm.min';
  const chunks = (await readdir(path.join(root, directory))).filter(name => name.endsWith('.mjs')).sort();
  const result = await modules(root, ['mermaid.esm.min.mjs', ...chunks.map(name => `${directory}/${name}`)], 'pubwiki-mermaid');
  result.files.set('assets/mermaid-LICENSE', await readFile(path.join(root, '../LICENSE')));
  return result;
}

export async function staticAssets(prefix, withMermaid) {
  readerPromise ??= reader();
  const common = await readerPromise;
  const diagrams = withMermaid ? await (mermaidPromise ??= mermaid()) : null;
  const urls = entries => Object.fromEntries(Object.entries(entries).map(([name, file]) => [name, `${prefix}/${file}`]));
  return { files: new Map([...common.files, ...(diagrams?.files || [])]),
    readerImports: urls(common.imports), mermaidImports: urls(diagrams?.imports || {}),
    style: `${prefix}/${common.style}`, script: `${prefix}/${common.imports['pubwiki-reader/dochub.js']}`,
    mermaidEntry: diagrams ? `${prefix}/${diagrams.imports['pubwiki-mermaid/mermaid.esm.min.mjs']}` : '' };
}
