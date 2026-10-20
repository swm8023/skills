import { searchDocuments } from './search.mjs';
import { bootstrapLocation } from './location.mjs';

let indexPromise;
export function staticSearch(values) {
  indexPromise ??= fetch(document.documentElement.dataset.staticIndex, { credentials: 'same-origin' })
    .then(response => { if (!response.ok) throw new Error('Static search index unavailable'); return response.json(); })
    .catch(error => { indexPromise = undefined; throw error; });
  return indexPromise.then(index => searchDocuments(index.documents, values));
}
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function link(href, text, className) {
  const node = element('a', text, className); node.href = href; return node;
}
function highlighted(tag, text, query, className) {
  const node = element(tag, undefined, className), value = String(text || '');
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (!terms.length) { node.textContent = value; return node; }
  const needle = terms[0].toLocaleLowerCase(), start = value.toLocaleLowerCase().indexOf(needle);
  if (start < 0) node.textContent = value;
  else node.append(value.slice(0, start), element('mark', value.slice(start, start + needle.length)), value.slice(start + needle.length));
  return node;
}
export async function prepareStaticLibrary() {
  const root = document.documentElement;
  if (!root.dataset.staticIndex || root.dataset.page !== 'library') return;
  bootstrapLocation(globalThis);
  const params = new URLSearchParams(location.search), values = Object.fromEntries(params);
  values.directory ??= root.dataset.directory || '';
  values.tag ??= root.dataset.staticTag || '';
  values.tag_descendants = root.dataset.tagDescendants === 'true';
  const query = values.q || '', directory = values.directory || '', tag = values.tag || '';
  const form = document.querySelector('.library-search');
  for (const name of ['q', 'directory', 'sort']) {
    const field = form?.elements.namedItem(name);
    if (field) field.value = values[name] || '';
  }
  if (tag && form && !form.elements.namedItem('tag')) {
    const field = element('input'); field.type = 'hidden'; field.name = 'tag'; field.value = tag; form.append(field);
  }
  let data;
  try { data = await staticSearch(values); }
  catch {
    const message = document.querySelector('.list-heading p');
    if (message) message.textContent = '搜索数据加载失败，请刷新重试。';
    return;
  }
  const list = element('ul', undefined, 'document-list');
  for (const item of data.results) {
    const row = element('li', undefined, 'document-row');
    const copy = element('div', undefined, 'document-row-copy');
    copy.append(element('div', item.directory || '根目录', 'document-path'));
    const title = element('h2');
    const titleLink = link(item.url, ''); titleLink.append(highlighted('span', item.title, query)); title.append(titleLink); copy.append(title);
    if (item.description) copy.append(highlighted('p', item.description, query, 'document-description'));
    if (query && item.snippet) copy.append(highlighted('p', item.snippet, query, 'document-snippet'));
    const meta = element('div', undefined, 'document-row-meta');
    if (item.date) meta.append(element('time', String(item.date).slice(0, 10)));
    if (item.author) meta.append(element('span', item.author));
    const tags = element('div', undefined, 'tags');
    for (const value of item.tags) {
      const url = new URL(document.documentElement.dataset.basePath + '/', location.origin);
      url.search = new URLSearchParams({ directory, tag: value });
      tags.append(link(url.href, '# ' + value, 'tag'));
    }
    meta.append(tags); copy.append(meta); row.append(element('span', '▤', 'document-symbol'), copy, link(item.url, '→', 'document-open'));
    list.append(row);
  }
  let old = document.querySelector('.document-list, .library-page > .empty-state');
  if (!data.results.length) {
    list.className = 'empty-state'; list.append(element('h2', '没有找到匹配文档'), element('p', '试试其他关键词，或清除筛选。'));
  }
  old?.replaceWith(list);
  const heading = document.querySelector('.list-heading');
  heading?.replaceChildren(element('p', `共找到 ${data.total} 篇文档，本页显示 ${data.results.length} 篇`));
  if (query || directory || tag) heading?.append(link(root.dataset.basePath + '/', '清除筛选'));
  document.querySelector('.pagination')?.remove();
  if (data.total > data.limit) {
    const pages = element('nav', undefined, 'pagination'); pages.setAttribute('aria-label', '分页');
    const pageURL = offset => { const next = new URL(location.href); next.searchParams.set('offset', offset); return next.href; };
    pages.append(data.offset ? link(pageURL(Math.max(0, data.offset - data.limit)), '← 上一页') : element('span'));
    pages.append(element('span', `第 ${Math.floor(data.offset / data.limit) + 1} / ${Math.ceil(data.total / data.limit)} 页`));
    pages.append(data.offset + data.limit < data.total ? link(pageURL(data.offset + data.limit), '下一页 →') : element('span'));
    list.after(pages);
  }
  document.querySelectorAll('.filter-tags a').forEach(node => {
    const url = new URL(node.href), selectedTag = url.searchParams.get('tag') || '';
    const next = new URL(location.href); next.searchParams.delete('offset');
    selectedTag ? next.searchParams.set('tag', selectedTag) : next.searchParams.delete('tag');
    node.href = next.href;
    if (selectedTag === tag) node.setAttribute('aria-current', 'page'); else node.removeAttribute('aria-current');
  });
}
