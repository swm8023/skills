import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { registerHooks } from 'node:module';
import { homedir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';

// These behavior tests use the same pinned dependencies as the exporter.
const runtime = process.env.QUARTZ_TEST_RUNTIME || path.join(homedir(), '.wheelmaker/wiki/quartz');
let ready = true;
try { await access(path.join(runtime, 'node_modules/preact/package.json')); } catch { ready = false; }
const behavior = (name, run) => test(name, { skip: !ready && 'Set QUARTZ_TEST_RUNTIME to a prepared Quartz runtime' }, run);
if (ready) registerHooks({ resolve(specifier, context, next) {
  return next(specifier, !specifier.startsWith('.') && !specifier.startsWith('/')
    && !specifier.startsWith('#') && !specifier.includes(':') ? { ...context, parentURL: pathToFileURL(path.join(runtime, 'package.json')).href } : context);
} });

async function processing() {
  return import('../assets/quartz/quartz/wheelmaker/processing.mjs');
}

behavior('Quartz YAML and plugin factories load all five WheelMaker responsibilities', async () => {
  const { parse } = await import('yaml');
  const config = parse(await readFile(new URL('../assets/quartz/quartz.config.yaml', import.meta.url), 'utf8'));
  const entry = config.plugins.find(plugin => plugin.source === './quartz/wheelmaker');
  assert.equal(entry.order, 70);
  assert.deepEqual(entry.layout, { position: 'left', priority: 40 });
  assert.equal(config.plugins.length, 15);
  const factories = await import('../assets/quartz/quartz/wheelmaker/index.mjs');
  for (const method of ['htmlPlugins', 'markdownPlugins', 'shouldPublish', 'emit', 'match']) {
    assert.ok(Object.values(factories).some(factory => {
      if (typeof factory !== 'function') return false;
      return typeof factory()?.[method] === 'function';
    }), `plugin must register ${method}`);
  }
});

behavior('draft filtering excludes boolean and string true before all emitters', async () => {
  const { WheelMakerRemoveDrafts } = await processing();
  const filter = WheelMakerRemoveDrafts();
  for (const draft of [true, 'true']) assert.equal(filter.shouldPublish({}, [null, { data: { frontmatter: { draft } } }]), false);
  for (const draft of [false, 'false', undefined]) assert.equal(filter.shouldPublish({}, [null, { data: { frontmatter: { draft } } }]), true);
  assert.equal(filter.shouldPublish({}, [null, {}]), true);
});

behavior('TOC keeps Chinese and duplicate heading anchors, depth and frontmatter controls', async () => {
  const { WheelMakerContent } = await processing();
  const { unified } = await import('unified');
  const { default: parse } = await import('remark-parse');
  const markdown = '# 标题\n\n## 重复\n\n### **重复**\n\n#### 深层\n';
  const tree = unified().use(parse).parse(markdown);
  const transform = WheelMakerContent().markdownPlugins()[0]() ;
  const file = { data: { frontmatter: {} } };
  await transform(tree, file);
  assert.deepEqual(file.data.toc, [
    { depth: 0, text: '标题', slug: '标题' },
    { depth: 1, text: '重复', slug: '重复' },
    { depth: 2, text: '重复', slug: '重复-1' },
  ]);
  const hidden = { data: { frontmatter: { enableToc: false } } };
  await transform(tree, hidden);
  assert.equal(hidden.data.toc, undefined);
  const short = { data: {} };
  await transform(unified().use(parse).parse('# Only'), short);
  assert.equal(short.data.toc, undefined);
  const repeated = { data: {} };
  await transform(tree, repeated);
  assert.deepEqual(repeated.data.toc, file.data.toc, 'slug state is isolated per file');
});

behavior('description keeps explicit summaries and full search text with upstream escaping and limits', async () => {
  const { WheelMakerContent } = await processing();
  const transform = WheelMakerContent().htmlPlugins()[0]();
  const tree = { type: 'root', children: [{ type: 'element', tagName: 'p', properties: {}, children: [
    { type: 'text', value: '正文 < & > https://example.com/path?q=1. More text.' },
  ] }] };
  const explicit = { data: { frontmatter: { description: '自定义摘要' } } };
  await transform(tree, explicit);
  assert.equal(explicit.data.description, '自定义摘要');
  assert.equal(explicit.data.text, '正文 &lt; &amp; &gt; example.com/path More text.');
  const generated = { data: {} };
  await transform({ type: 'root', children: [{ type: 'text', value: '中'.repeat(400) }] }, generated);
  assert.equal(generated.data.description, '中'.repeat(300) + '...');
  assert.equal(generated.data.text.length, 400, 'search text is not truncated to summary length');
});

behavior('directory tree renders only folders, with relative links and natural ordering', async () => {
  const { WheelMakerExplorer, buildDirectoryTree } = await import('../assets/quartz/quartz/wheelmaker/explorer.mjs');
  const { h } = await import('preact');
  const { render } = await import('preact-render-to-string');
  const allFiles = ['index', 'guide/part10/a', 'guide/part2/b', 'guide/index', 'tags/topic', 'root-note'].map(slug => ({ slug }));
  allFiles.push({ slug: 'private/secret', frontmatter: { draft: true } });
  const tree = buildDirectoryTree(allFiles);
  assert.deepEqual(tree.map(node => node.path), ['guide']);
  assert.deepEqual(tree[0].children.map(node => node.path), ['guide/part2', 'guide/part10']);
  const html = render(h(WheelMakerExplorer(), { allFiles, fileData: { slug: 'guide/part2/b' } }));
  assert.match(html, /data-folderpath="guide\/part2"/);
  assert.match(html, /folder-outer/);
  assert.doesNotMatch(html, /secret|root-note|tags\/topic/);
  assert.match(html, /href="\.\.\/\.\.\/guide/);
});

behavior('reader layout supplies TOC and footer without changing empty page sidebars', async () => {
  const { withWheelMakerReader, WheelMakerTableOfContents } = await import('../assets/quartz/quartz/wheelmaker/reader.mjs');
  const { h } = await import('preact');
  const { render } = await import('preact-render-to-string');
  const backlinks = () => null;
  const layout = withWheelMakerReader({ defaults: { right: [backlinks] }, byPageType: { home: { right: [] }, '404': { right: [] } } });
  assert.equal(layout.defaults.right.length, 2);
  assert.equal(layout.defaults.right[1], backlinks);
  assert.deepEqual(layout.byPageType.home.right, []);
  assert.equal(layout.byPageType['404'].footer, layout.defaults.footer);
  assert.match(render(h(layout.defaults.footer, { cfg: { locale: 'zh-CN' } })), /Quartz/);
  const toc = WheelMakerTableOfContents();
  assert.equal(render(h(toc, { fileData: {} })), '');
  const html = render(h(toc, { fileData: { toc: [{ depth: 1, text: '<unsafe>', slug: '安全' }], collapseToc: true }, cfg: { locale: 'zh-CN' } }));
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /href="#安全"/);
  assert.match(html, /&lt;unsafe/);
  assert.doesNotMatch(html, /<unsafe>/);
});
