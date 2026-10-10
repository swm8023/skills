import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { registerHooks } from 'node:module';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';

const runtime = process.env.QUARTZ_TEST_RUNTIME || path.join(homedir(), '.wheelmaker/wiki/quartz');
registerHooks({ resolve(specifier, context, next) {
  return next(specifier, specifier === 'parse5' ? { ...context, parentURL: pathToFileURL(path.join(runtime, 'package.json')).href } : context);
} });
const { compactHTML, optimizeSite } = await import('../assets/quartz/quartz/wheelmaker/resources.mjs');
const { parse } = await import('parse5');
const allNodes = node => [node, ...(node.childNodes || []).flatMap(allNodes)];
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');
const fixture = math => `<!doctype html><html><head><link rel="preconnect" href="https://cdnjs.cloudflare.com"><link rel="stylesheet" href="../../index.css"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" data-persist="true"><script src="../../prescript.js"></script><script>const fetchData = fetch("../../static/contentIndex.json").then(data => data.json())</script><link rel="icon" href="../../static/icon.png"></head><body><article><h2 id="heading">标题<a role="anchor" href="#heading"><svg viewBox="0 0 24 24"><path d="M0 0L2 2"></path></svg></a></h2><pre><code><span style="--shiki-light:#123456;--shiki-dark:#abcdef">  assert_eq!(&lt;a&gt;, 1);\n</span></code></pre>${math ? '<span class="katex">x</span>' : ''}</article><div class="knowledge-tags-sidebar"><div data-knowledge-tag="a"><span class="knowledge-tag-count">2</span></div></div><a class="knowledge-page-card-link internal" href="other">Other</a><script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/copy-tex.min.js"></script><script src="../../postscript.js"></script></body></html>`;

test('compaction preserves code text, heading IDs and navigation, omits unused resources', () => {
  const input = fixture(false), output = compactHTML(input);
  const article = source => allNodes(parse(source)).find(node => node.tagName === 'article');
  assert.equal(text(article(output.html)), text(article(input)));
  assert.match(output.html, /id="heading"/);
  assert.match(output.html, /href="#heading"/);
  assert.match(output.html, /<symbol id="wm-icon-/);
  assert.match(output.html, /class="wm-heading-icon"/);
  assert.doesNotMatch(output.html, /fetchData|cdnjs|katex.min.css|copy-tex.min.js|style="--shiki/);
  assert.equal(output.styles.size, 1);
  assert.match(output.html, /\[\["a",2\]\]/);
  assert.doesNotMatch(output.html, /data-knowledge-tag="a"/);
});

test('math article keeps formula resources and formula markup', () => {
  const output = compactHTML(fixture(true));
  assert.equal(output.hasMath, true);
  assert.match(output.html, /katex.min.css/);
  assert.match(output.html, /copy-tex.min.js/);
  assert.match(output.html, /class="katex"/);
});

for (const math of [false, true]) test(`resource references use real content hashes and local formula assets: math=${math}`, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'wheelmaker-resource-test-'));
  await mkdir(path.join(root, 'guide/sub'), { recursive: true });
  await writeFile(path.join(root, 'guide/sub/note.html'), fixture(math));
  for (const [file, data] of Object.entries({ 'index.css': 'body{color:red}', 'prescript.js': 'void 0', 'postscript.js': 'void 1' })) await writeFile(path.join(root, file), data);
  const result = await optimizeSite(root, { runtime });
  const html = await readFile(path.join(root, 'guide/sub/note.html'), 'utf8');
  assert.doesNotMatch(html, /https:\/\/cdn|fetchData|static\/icon.png/);
  for (const [name, file] of Object.entries(result.assets)) {
    const bytes = await readFile(path.join(root, file));
    assert.ok(file.includes(createHash('sha256').update(bytes).digest('hex')), name);
  }
  assert.match(html, /href="..\/..\/static\/wm-assets\/index\.[a-f0-9]{64}\.css"/);
  const css = await readFile(path.join(root, result.assets['index.css']), 'utf8');
  assert.match(css, /--shiki-light:#123456/);
  if (math) {
    assert.match(html, /katex\.min\.[a-f0-9]{64}\.css"[^>]*>/);
    assert.doesNotMatch(html.match(/<link[^>]*katex[^>]*>/)[0], /data-persist/);
    const css = await readFile(path.join(root, result.assets['katex.min.css']), 'utf8');
    assert.doesNotMatch(css, /\.ttf|\.woff\)/);
    assert.match(css, /[a-f0-9]{64}\.woff2/);
  }
});
