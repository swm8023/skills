const escapeHTML = value => String(value).replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const svg = (path, size) => `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const folder = svg('<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>', 16);
const separator = `<span class="path-separator">${svg('<path d="m9 5 7 7-7 7"/>', 12)}</span>`;

// Shared by exported HTML and query-driven library pages.
export function renderLocation(prefix, directory = '', title = '') {
  const parts = directory.split('/').filter(Boolean);
  const parents = title ? parts : parts.slice(0, -1);
  const current = title || parts.at(-1) || '全部文档';
  const base = String(prefix).replace(/\/$/, '');
  const path = parents.map((part, i) => {
    const href = `${base}/?${new URLSearchParams({ directory: parts.slice(0, i + 1).join('/') })}`;
    return `<a href="${escapeHTML(href)}">${escapeHTML(part)}</a>${separator}`;
  }).join('');
  return `<span class="path-symbol">${folder}</span><nav class="document-parents" aria-label="文档路径">${path}</nav>${title
    ? `<h1 class="toolbar-title">${escapeHTML(current)}</h1>`
    : `<span class="toolbar-title" data-library-location>${escapeHTML(current)}</span>`}`;
}
