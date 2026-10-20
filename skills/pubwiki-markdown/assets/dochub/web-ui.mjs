import { escapeText } from './web-markdown.mjs';

export function route(prefix, suffix = '/') {
  const base = String(prefix || '/').replace(/\/+$/u, '') || '/';
  if (suffix === '/') return base === '/' ? '/' : `${base}/`;
  return `${base === '/' ? '' : base}${suffix}`;
}

export function queryUrl(prefix, values = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value !== '' && value !== null && value !== undefined) params.set(key, String(value));
  const query = params.toString();
  return escapeText(route(prefix) + (query ? `?${query}` : ''));
}

export function documentUrl(prefix, id) {
  return escapeText(route(prefix, `/document/${encodeURIComponent(id)}`));
}

export function highlightText(value, query = '') {
  const text = String(value ?? '');
  if (!query) return escapeText(text);
  const lower = text.toLocaleLowerCase('en-US'), needle = String(query).toLocaleLowerCase('en-US');
  let position = 0, result = '', match;
  while ((match = lower.indexOf(needle, position)) !== -1) {
    result += escapeText(text.slice(position, match)) + `<mark>${escapeText(text.slice(match, match + needle.length))}</mark>`;
    position = match + needle.length;
  }
  return result + escapeText(text.slice(position));
}

const paths = {
  outline: '<path d="M8 6h12M8 12h9M8 18h11M3 6h.01M3 12h.01M3 18h.01"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  folder: '<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  library: '<path d="M4 4v16M8 4v16M12 4v16m4-15 5 14"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  theme: '<path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z"/>',
  panel: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  focus: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  width: '<path d="M4 8v8M20 8v8M4 12h16m-4-4 4 4-4 4M8 8l-4 4 4 4"/>',
  link: '<path d="m10 13 4-4m-6 6-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m4 2 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 0)"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  up: '<path d="M12 20V4m-6 6 6-6 6 6"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  logout: '<path d="M9 3H4v18h5m5-14 5 5-5 5M8 12h11"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>'
};

export function icon(name) {
  return `<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.file}</svg>`;
}

export function dateText(value) {
  if (!value) return '';
  const raw = value instanceof Date ? value.toISOString() : String(value);
  return escapeText(/^\d{4}-\d{2}-\d{2}/u.exec(raw)?.[0] ?? raw);
}

export function sizeText(value) {
  const bytes = Number(value) || 0;
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : bytes >= 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${bytes} B`;
}
