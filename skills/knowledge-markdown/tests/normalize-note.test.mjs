import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildPathMap,
  collectTags,
  normalizeNote,
  rewriteLinks,
} from '../scripts/normalize-note.mjs';

test('normalizes the physical summary line and the minimum publish frontmatter', () => {
  const result = normalizeNote({
    source: '> 摘要：这是可公开的摘要。\n\n# Release Plan\n\n正文。\n',
    sourcePath: 'legacy/release.md',
    targetPath: 'wheelmaker/engineering/release.md',
    date: '2026-09-03',
  });
  assert.equal(result.metadata.description, '这是可公开的摘要。');
  assert.equal(result.metadata.draft, false);
  assert.equal(result.metadata.date, '2026-09-03');
  assert.equal(result.body.startsWith('> 摘要：'), false);
  assert.match(result.content, /^---\ntitle: Release Plan\ndescription: /u);
  assert.match(result.content, /tags: \[\]\ndraft: false\n/u);
});

test('collects frontmatter and inline hierarchical tags without adding aliases', () => {
  const tags = collectTags({ tags: ['system', '#runtime'] }, '正文 #runtime #system/agent and #new/tag\n');
  assert.deepEqual(tags, ['system', 'runtime', 'system/agent', 'new/tag']);
  const result = normalizeNote({
    source: '---\ntitle: Existing\ntags: [system]\naliases: []\n---\n\n正文 #runtime\n',
    sourcePath: 'existing.md',
    targetPath: 'repo/existing.md',
    date: '2026-09-03',
  });
  assert.deepEqual(result.metadata.tags, ['system', 'runtime']);
  assert.equal(Object.hasOwn(result.metadata, 'aliases'), false);
});

test('creates date and English slug for a new note while preserving existing aliases', () => {
  const result = normalizeNote({
    source: '正文。\n',
    title: 'Quartz Publishing Guide',
    aliases: ['发布指南'],
    date: '2026-09-03',
  });
  assert.equal(result.filename, '2026-09-03-quartz-publishing-guide.md');
  assert.deepEqual(result.metadata.aliases, ['发布指南']);
  assert.equal(result.metadata.title, 'Quartz Publishing Guide');
});

test('builds a source-to-target map and rewrites Wikilinks, Markdown links, and assets', () => {
  const { map, collisions } = buildPathMap([
    { sourcePath: 'legacy/one.md', targetPath: 'repo/guide/one.md' },
    { sourcePath: 'legacy/two.md', targetPath: 'repo/reference/two.md' },
    { sourcePath: 'legacy/image.png', targetPath: 'content/assets/image.png' },
  ]);
  assert.deepEqual(collisions, []);
  const rewritten = rewriteLinks(
    '[[two|Two]]\n![image](image.png)\n[guide](two.md#part)\n',
    map,
    { sourcePath: 'legacy/one.md', targetPath: 'repo/guide/one.md' },
  );
  assert.match(rewritten.content, /\[\[\.\.\/reference\/two\|Two\]\]/u);
  assert.match(rewritten.content, /!\[image\]\(\.\.\/\.\.\/content\/assets\/image\.png\)/u);
  assert.match(rewritten.content, /\[guide\]\(\.\.\/reference\/two\.md#part\)/u);
  assert.deepEqual(rewritten.unresolved, []);
});

test('reports unresolved local links and target collisions', () => {
  const { collisions } = buildPathMap([
    { sourcePath: 'a.md', targetPath: 'repo/note.md' },
    { sourcePath: 'b.md', targetPath: 'repo/note.md' },
  ]);
  assert.equal(collisions.length, 1);
  const rewritten = rewriteLinks('[[missing]]\n[missing](missing.md)\n', new Map(), {
    sourcePath: 'repo/current.md',
    targetPath: 'repo/current.md',
  });
  assert.equal(rewritten.unresolved.length, 2);
});
