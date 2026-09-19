import assert from 'node:assert/strict';
import test from 'node:test';
import { buildIndexes } from '../assets/quartz/quartz/wheelmaker/content-index.mjs';

function entry(slug, data) {
  return [{ type: 'root', children: [] }, { data: { slug, ...data } }];
}

test('WheelMaker splits graph metadata from lazy full-text search data', () => {
  const { metadata, search } = buildIndexes([
    entry('guide/one', {
      relativePath: 'guide/one.md',
      text: '全文内容',
      frontmatter: { title: 'One', tags: ['guide'] },
      links: ['guide/two'],
    }),
    entry('virtual/page', {
      text: 'virtual content',
      frontmatter: {},
    }),
    entry('', { text: 'ignored' }),
  ]);

  assert.deepEqual(metadata['guide/one'], {
    slug: 'guide/one',
    filePath: 'guide/one.md',
    title: 'One',
    links: ['guide/two'],
    tags: ['guide'],
  });
  assert.equal(metadata['guide/one'].content, undefined);
  assert.deepEqual(search['guide/one'], {
    slug: 'guide/one',
    title: 'One',
    tags: ['guide'],
    content: '全文内容',
  });
  assert.equal(search['virtual/page'].content, 'virtual content');
  assert.equal(metadata[''], undefined);
});
