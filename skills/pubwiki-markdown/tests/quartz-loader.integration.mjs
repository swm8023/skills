// Load the real Quartz configuration and registry; do not build a website.
// node --preserve-symlinks tests/quartz-loader.integration.mjs --runtime <quartz>
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { runtime: { type: 'string' }, entry: { type: 'string' } } });
assert.ok(values.runtime, '--runtime is required');
const runtime = path.resolve(values.runtime);
const entry = values.entry ? path.resolve(values.entry) : path.join(runtime, 'quartz.ts');
const requireRuntime = createRequire(path.join(runtime, 'package.json'));
const { build } = requireRuntime('esbuild');
const { h } = requireRuntime('preact');
const render = requireRuntime('preact-render-to-string');
const directory = await mkdtemp(path.join(runtime, '.wheelmaker-config-test-'));
const previousDirectory = process.cwd();
try {
  process.chdir(runtime);
  const filename = path.join(directory, 'config.mjs');
  // Only compile the Node configuration module. Browser resources remain strings.
  await build({ stdin: { contents: await readFile(entry, 'utf8'), resolveDir: runtime, sourcefile: 'quartz.ts', loader: 'ts' }, outfile: filename,
    bundle: true, platform: 'node', format: 'esm', packages: 'external',
    jsx: 'automatic', jsxImportSource: 'preact', loader: { '.scss': 'text' },
    plugins: [{ name: 'inline-resource-text', setup(builder) {
      builder.onLoad({ filter: /\.inline\.(ts|js)$/ }, async args => ({ contents: await readFile(args.path, 'utf8'), loader: 'text' }));
    } }],
  });
  const { default: config, layout } = await import(pathToFileURL(filename).href);
  const names = kind => config.plugins[kind].map(plugin => plugin.name);
  assert.ok(names('transformers').includes('WheelMakerContent'));
  assert.deepEqual(names('filters'), ['WheelMakerRemoveDrafts']);
  assert.ok(names('emitters').includes('WheelMakerContentIndex'));
  assert.ok(names('pageTypes').includes('WheelMakerHomePage'));
  assert.ok(names('pageTypes').includes('ContentPage'), 'ordinary content pages must remain registered');
  for (const required of ['NoteProperties', 'CreatedModifiedDate', 'SyntaxHighlighting', 'ObsidianFlavoredMarkdown', 'GitHubFlavoredMarkdown', 'LinkProcessing', 'Latex']) {
    assert.ok(names('transformers').includes(required), `${required} must remain registered`);
  }
  for (const retired of ['Description', 'TableOfContents', 'RemoveDrafts', 'AliasRedirects']) {
    assert.ok(!['transformers', 'filters', 'emitters'].some(kind => names(kind).includes(retired)), `${retired} still registered`);
  }
  const props = { cfg: config.configuration, allFiles: [{ slug: 'guide/note', frontmatter: { title: 'Note', tags: [] } }],
    fileData: { slug: 'guide/note', toc: [{ depth: 0, text: 'Heading', slug: 'heading' }] } };
  const article = config.plugins.pageTypes.find(plugin => plugin.name === 'ContentPage');
  assert.match(render(h(article.body(), { ...props, tree: { type: 'root', children: [{ type: 'text', value: 'Article fixture' }] } })), /Article fixture/);
  const left = layout.defaults.left.map(component => render(h(component, props))).join('');
  assert.equal((left.match(/class="explorer"/g) || []).length, 1);
  assert.match(left, /data-folderpath="guide"/);
  assert.match(layout.defaults.right.map(component => render(h(component, props))).join(''), /wheelmaker-toc/);
  assert.match(render(h(layout.defaults.footer, props)), /wheelmaker-footer/);
  assert.deepEqual(layout.byPageType['404'].right, []);
  // The config loader creates the real emitter before quartz.ts exports its layout.
  // Verify that emitter, not only the separately exported layout used above.
  const dispatchers = config.plugins.emitters.filter(plugin => plugin.name === 'PageTypeDispatcher');
  assert.equal(dispatchers.length, 1, 'only one dispatcher may emit pages');
  for (const pageType of config.plugins.pageTypes) {
    const ctx = { cfg: { ...config, plugins: { ...config.plugins, pageTypes: [pageType] } } };
    const components = dispatchers[0].getQuartzComponents(ctx);
    assert.ok(components.every(component => typeof component === 'function'), `${pageType.name}: publishing must not collect undefined components`);
    assert.ok(components.includes(layout.defaults.footer), `${pageType.name}: publisher must use the WheelMaker footer`);
    const expected = layout.byPageType[pageType.layout] ?? layout.defaults;
    for (const component of [...expected.left, ...expected.right]) {
      assert.ok(components.includes(component), `${pageType.name}: publisher must collect the configured sidebars`);
    }
    const resources = components.flatMap(component => [component.css, component.beforeDOMLoaded, component.afterDOMLoaded]);
    assert.ok(resources.some(Boolean), `${pageType.name}: component resources must be available`);
  }
  console.log('PASS real Quartz loader: transformer, filter, emitter, page type, explorer, TOC and footer');
} finally {
  process.chdir(previousDirectory);
  assert.equal(path.dirname(directory), runtime, 'temporary cleanup must remain inside the runtime');
  await rm(directory, { recursive: true, force: true });
}
