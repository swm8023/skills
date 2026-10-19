export function searchDocuments(documents, values = {}) {
  const query = String(values.q ?? '').trim().toLocaleLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);
  const directory = String(values.directory ?? '');
  const tag = String(values.tag ?? '').replace(/^#/, '').toLocaleLowerCase();
  const offset = Math.max(0, Math.trunc(Number(values.offset) || 0));
  const limit = Math.max(1, Math.min(100, Math.trunc(Number(values.limit) || 20)));
  const score = doc => terms.reduce((sum, term) => sum +
    (doc.title.toLocaleLowerCase().includes(term) ? 8 : 0) +
    (doc.tags.some(value => value.toLocaleLowerCase().includes(term)) ? 4 : 0), 0);
  const matches = documents.filter(doc =>
    (!directory || doc.directory === directory || doc.directory.startsWith(directory + '/')) &&
    (!tag || doc.tags.some(value => value.toLocaleLowerCase() === tag ||
      values.tag_descendants && value.toLocaleLowerCase().startsWith(tag + '/'))) &&
    terms.every(term => [doc.title, doc.description, doc.text, ...doc.tags].join(' ').toLocaleLowerCase().includes(term)));
  const sort = values.sort || (query ? 'relevance' : 'title');
  matches.sort((a, b) => (sort === 'relevance' ? score(b) - score(a) : sort === 'date'
    ? (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0) : 0) || a.title.localeCompare(b.title, 'zh-CN'));
  return { results: matches.slice(offset, offset + limit).map(doc => {
    const text = doc.text || doc.description || '';
    const found = terms.length ? Math.max(0, text.toLocaleLowerCase().indexOf(terms[0]) - 35) : 0;
    return { ...doc, snippet: text.slice(found, found + 180) };
  }), total: matches.length, offset, limit, index_status: 'ready' };
}
