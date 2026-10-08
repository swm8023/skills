import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSearchIndex, searchCandidates } from '../assets/quartz/quartz/wheelmaker/search-index.mjs';

test('candidate index preserves short, CJK, mixed, punctuation and substring queries', () => {
  const records = {
    a: { title: 'Rust tools', tags: ['rust/tools'], content: '工具链 Cargo.toml rustup café 🦀 𠮷' },
    b: { title: 'Another', tags: ['misc'], content: 'argo.tom + cargo.to + go.toml' },
    c: { title: 'Empty virtual page', tags: [], content: '' },
  };
  const { index, texts } = buildSearchIndex(records);
  assert.equal(index.version, 2);
  assert.equal(index.documents.length, 3);
  assert.equal(index.documents[2].text, undefined);
  for (const terms of [['cargo.toml'], ['go'], ['a'], ['工', '具'], ['rustup', '链'], ['café'], ['🦀'], ['𠮷'], ['missing']]) {
    const expected = Object.entries(records).filter(([, record]) => terms.every(term =>
      [record.title, record.tags.join(' '), record.content].some(text => text.toLocaleLowerCase().includes(term)))).map(([slug]) => slug);
    const candidates = searchCandidates(index, terms);
    for (const slug of expected) assert.ok(candidates.some(record => record.slug === slug), `${terms}: lost ${slug}`);
    const verified = candidates.filter(record => terms.every(term => [record.title, record.tags.join(' '), texts[record.text]?.content || ''].some(text => text.toLocaleLowerCase().includes(term)))).map(record => record.slug);
    assert.deepEqual(verified, expected, String(terms));
  }
  assert.deepEqual(searchCandidates(index, ['rust'], true).map(record => record.slug), ['a']);
  assert.deepEqual(searchCandidates(index, ['工具'], true), []);
});

test('full text is lossless, hashed and kept outside the small candidate index', () => {
  const content = '  assert_eq!("中文 < & >", 1);\n';
  const { index, texts } = buildSearchIndex({ a: { content }, b: { content } });
  assert.equal(Object.keys(texts).length, 1);
  assert.equal(texts[index.documents[0].text].content, content);
  assert.equal(index.documents[0].text, index.documents[1].text);
  assert.equal(index.documents[0].content, undefined);
  assert.match(index.documents[0].text, /^static\/search-text\/[a-f0-9]{64}\.json$/);
});
