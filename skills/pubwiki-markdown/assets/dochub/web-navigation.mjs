import { escapeText } from './web-markdown.mjs';
import { icon, queryUrl, documentUrl } from './web-ui.mjs';

export function directoryTree(navigation, { prefix, directory = '', documentId = '' }) {
  const root = { children: new Map(), documents: [] };
  function ensure(path) {
    let node = root;
    for (const part of path.split('/').filter(Boolean)) {
      if (!node.children.has(part)) node.children.set(part, { children: new Map(), documents: [] });
      node = node.children.get(part);
    }
    return node;
  }
  for (const entry of navigation.directories ?? []) ensure(typeof entry === 'string' ? entry : entry.directory);
  for (const document of navigation.documents ?? []) ensure(document.directory ?? '').documents.push(document);
  function render(node, parent = '') {
    return [...node.children].sort(([a], [b]) => a.localeCompare(b, 'zh-CN')).map(([name, child]) => {
      const path = parent ? `${parent}/${name}` : name;
      const open = !parent || path === directory || directory.startsWith(`${path}/`);
      const current = !documentId && directory === path ? ' aria-current="page"' : '';
      return `<details class="directory-group"${open ? ' open' : ''}><summary>${icon('chevron')}${icon('folder')}<a href="${queryUrl(prefix, { directory: path })}" title="${escapeText(path)}"${current}>${escapeText(name)}</a></summary><div class="directory-children">${render(child, path)}</div></details>`;
    }).join('') + node.documents.map(document => `<a class="document-tree-link" href="${documentUrl(prefix, document.document_id)}" title="${escapeText(document.title)}"${document.document_id === documentId ? ' aria-current="page"' : ''}>${icon('file')}<span>${escapeText(document.title)}</span></a>`).join('');
  }
  return render(root);
}

export function sidebar(navigation, options) {
  const { prefix, tag = '' } = options;
  return `<button class="drawer-shade" type="button" data-close-directory aria-label="关闭知识目录" hidden></button>
  <aside class="knowledge-directory" id="knowledge-directory" aria-label="知识目录">
    <div class="directory-mobile-head"><span>知识目录</span><button class="icon-button" type="button" data-close-directory aria-label="关闭知识目录">${icon('close')}</button></div>
    <div class="sidebar-section-label directory-title">知识目录<span class="directory-total">${navigation.total ?? navigation.documents?.length ?? 0} 篇</span></div>
    <nav class="directory-tree" aria-label="文章目录">${directoryTree(navigation, options) || '<p class="sidebar-empty">发布文档后，目录会显示在这里。</p>'}</nav>
    ${(navigation.tags?.length ?? 0) > 0 ? `<div class="sidebar-section-label">常用标签</div><div class="sidebar-tags">${navigation.tags.slice(0, 12).map(entry => `<a class="tag" href="${queryUrl(prefix, { tag: entry.tag })}"${tag.toLocaleLowerCase('en-US') === entry.tag.toLocaleLowerCase('en-US') ? ' aria-current="page"' : ''}># ${escapeText(entry.tag)}<span>${entry.count}</span></a>`).join('')}</div>` : ''}
    <div class="sidebar-foot"><span class="readonly-dot"></span>只读知识库</div>
  </aside>`;
}

export function breadcrumbs(prefix, directory = '') {
  const parts = directory.split('/').filter(Boolean);
  return `<nav class="breadcrumbs" aria-label="面包屑"><a href="${queryUrl(prefix)}">知识库</a>${parts.map((part, i) => `<span aria-hidden="true">/</span><a href="${queryUrl(prefix, { directory: parts.slice(0, i + 1).join('/') })}">${escapeText(part)}</a>`).join('')}${!parts.length ? '<span aria-hidden="true">/</span><span>全部文档</span>' : ''}</nav>`;
}
