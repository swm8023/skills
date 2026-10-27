import assert from 'node:assert/strict';
import test from 'node:test';
import { documentPage, homePage } from '../assets/dochub/web-templates.mjs';

const navigation = { documents: [], directories: [], tags: [], total: 0 };
const article = () => documentPage({ document_id: 'guide', metadata: { title: 'Guide' }, body: 'Guide' }, {
  prefix: '/wiki', navigation, html: '<h2 id="setup">Setup</h2>', outline: [{ id: 'setup', title: 'Setup', depth: 2 }],
});

test('article secondary actions belong to one native more popover', () => {
  const html = article();
  const menu = /<div[^>]*id="wiki-more-menu"[^>]*popover="auto"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/header>/.exec(html);
  assert.ok(menu, 'the reader must expose one native auto popover');
  for (const action of ['data-copy-link', 'data-toggle-width', 'data-toggle-theme', 'data-wiki-host-actions']) {
    assert.ok(menu[1].includes(action), `${action} belongs inside more`);
  }
  assert.equal((html.match(/data-open-directory\b/g) || []).length, 1, 'directory remains a single direct control');
  assert.equal((html.match(/popovertarget="wiki-more-menu"/g) || []).length, 1);
  assert.match(html, /data-wiki-host-actions[^>]*hidden/);
  assert.doesNotMatch(html, /data-preview-action="(?:publish|refresh-wiki)"/);
});

test('library keeps direct navigation and omits article-only menu actions', () => {
  const html = homePage({ prefix: '/wiki', navigation });
  assert.match(html, /popovertarget="wiki-more-menu"/);
  assert.match(html, /data-open-directory/);
  assert.match(html, /data-open-search/);
  assert.match(html, /data-toggle-theme/);
  assert.doesNotMatch(html, /data-copy-link|data-toggle-width|class="outline-menu"/);
  assert.match(html, /data-wiki-host-actions[^>]*hidden/);
});
