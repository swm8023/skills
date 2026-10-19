import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import katex from 'katex';

function escapeText(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function safeDocumentId(value) {
  return /^doc_[a-f0-9]{32}$/u.test(String(value ?? '')) ? value : '';
}

function safeAssetUrl(documentId, filename, publicBasePath = '/docs') {
  const id = safeDocumentId(documentId);
  if (!id || typeof filename !== 'string' || filename.includes('/') || filename.includes('\\')) return null;
  const base = String(publicBasePath || '/docs').replace(/\/+$/u, '') || '/';
  return `${base === '/' ? '' : base}/document/${id}/asset/${encodeURIComponent(filename)}`;
}

function normalizeObsidian(source, { documentId, publicBasePath = '/docs' } = {}) {
  const lines = String(source ?? '').split(/(\r?\n)/u);
  let inFence = false;
  let fenceMarker = null;
  return lines
    .map((line) => {
      if (/^\r?\n$/u.test(line)) return line;
      const fence = line.match(/^\s*(`{3,}|~{3,})/u);
      if (fence) {
        if (!inFence) {
          inFence = true;
          fenceMarker = fence[1][0];
        } else if (fence[1][0] === fenceMarker) {
          inFence = false;
          fenceMarker = null;
        }
        return line;
      }
      if (inFence) return line;
      let normalized = line
        .replace(/!\[\[assets\/([^\]|#?]+)(?:[#?][^\]|]*)?(?:\|([^\]]*))?\]\]/gu, (full, filename, alias = '') => {
          const url = safeAssetUrl(documentId, filename, publicBasePath);
          return url ? `![${alias || filename}](${url})` : escapeText(full);
        })
        .replace(/!\[\[([^\]|#?]+)(?:[#?][^\]|]*)?(?:\|([^\]]*))?\]\]/gu, (full, target, alias = '') => {
          return escapeText(alias || target);
        })
        .replace(/\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]/gu, (_full, target, alias = '') => {
          return escapeText(alias || target);
        });
      normalized = normalized.replace(
        /(!?\[[^\]]*\]\()(\.\.\/assets\/[^)#?\s]+)([?#][^)]*)?(\))/gu,
        (full, prefix, target, suffix = '', close) => {
          const filename = target.slice('../assets/'.length);
          const url = safeAssetUrl(documentId, filename, publicBasePath);
          return url ? `${prefix}${url}${suffix}${close}` : full;
        }
      );
      return normalized;
    })
    .join('');
}

const allowedTags = [
  'a',
  'blockquote',
  'br',
  'code',
  'del',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul',
  'mark',
  'sup',
  'sub', 'span'
];

const allowedAttributes = {
  a: ['href', 'title', 'target', 'rel'],
  code: ['class'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  td: ['align'],
  th: ['align'],
  ...Object.fromEntries(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(tag => [tag, ['id']])),
  div: ['class'], blockquote: ['class'], p: ['class', 'id'], span: ['id'], pre: ['class']
};

function sanitizeRenderedHtml(html, { publicBasePath = '/docs' } = {}) {
  const base = String(publicBasePath || '/docs').replace(/\/+$/u, '') || '/';
  return sanitizeHtml(html, {
    allowedTags: [...allowedTags, 'div'],
    allowedAttributes,
    allowedClasses: {
      div: ['table-scroll'], pre: ['mermaid'], p: ['callout-title'],
      blockquote: ['callout', 'callout-note', 'callout-tip', 'callout-warning', 'callout-danger']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    allowRelativeUrls: true,
    disallowedTagsMode: 'discard',
    parser: { lowerCaseTags: true },
    transformTags: {
      a: (tagName, attribs) => {
        const next = { ...attribs };
        if (next.href && /^https?:/iu.test(next.href)) {
          next.target = '_blank';
          next.rel = 'noopener noreferrer';
        }
        return { tagName, attribs: next };
      },
      img: (tagName, attribs) => {
        const source = String(attribs.src ?? '');
        if (!source.startsWith(`${base === '/' ? '' : base}/`)) return { tagName: 'span', attribs: {} };
        return { tagName, attribs };
      }
    }
  });
}

export function renderWebMarkdown(source, options = {}) {
  const formulas = [];
  const protectedSource = String(source).split(/(`{3,}[\s\S]*?`{3,}|~{3,}[\s\S]*?~{3,}|`[^`\n]+`)/g)
    .map((part, index) => index % 2 ? part : part.replace(/\$\$([\s\S]+?)\$\$|(?<!\\)\$(?!\s)([^$\n]+?)(?<!\s)\$/g,
      (_match, display, inline) => {
        const token = `PUBWIKIMATH${formulas.length}TOKEN`;
        formulas.push(katex.renderToString(display ?? inline, { displayMode: display !== undefined, throwOnError: false, trust: false, strict: 'ignore' }));
        return token;
      })).join('');
  const normalized = normalizeObsidian(protectedSource, options);
  const renderer = new marked.Renderer();
  renderer.html = ({ raw }) => escapeText(raw);
  const code = renderer.code;
  renderer.code = function (token) {
    return token.lang?.trim() === 'mermaid' ? `<pre class="mermaid">${escapeText(token.text)}</pre>` : code.call(this, token);
  };
  renderer.paragraph = function ({ tokens }) {
    let html = this.parser.parseInline(tokens), id = '';
    html = html.replace(/(?:\s|<br>)+\^([\w-]+)\s*$/, (_match, value) => { id = ` id="block-${value}"`; return ''; });
    return `<p${id}>${html}</p>\n`;
  };
  if (Array.isArray(options.outline)) {
    const used = new Set();
    let firstHeading = true;
    const plain = tokens => tokens.map(token => token.tokens ? plain(token.tokens) : token.text ?? '').join('');
    renderer.heading = function ({ tokens, depth }) {
      const title = plain(tokens).trim();
      const duplicateTitle = firstHeading && depth === 1 && title === options.documentTitle;
      firstHeading = false;
      if (duplicateTitle) return '';
      const slug = title.normalize('NFC').toLocaleLowerCase('en-US')
        .replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/gu, '').slice(0, 100) || 'heading';
      const base = `section-${slug}`;
      let id = base, suffix = 2;
      while (used.has(id)) id = `${base}-${suffix++}`;
      used.add(id);
      options.outline.push({ id, title, depth });
      return `<span id="${escapeText(id.replace(/^section-/, ''))}"></span><h${depth} id="${escapeText(id)}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
    };
    const blockquote = renderer.blockquote;
    renderer.blockquote = function (token) {
      const content = this.parser.parse(token.tokens);
      const marker = /^<p>\[!([\w-]+)\][+-]?[ \t]*([^\n]*)(?:\n|$)/u.exec(content);
      if (!marker) return blockquote.call(this, token);
      const type = marker[1].toLocaleLowerCase('en-US');
      const kind = ['warning', 'caution'].includes(type) ? 'warning'
        : ['danger', 'error', 'bug'].includes(type) ? 'danger'
        : ['tip', 'success'].includes(type) ? 'tip' : 'note';
      const closed = marker[2].endsWith('</p>');
      const title = marker[2].replace(/<\/p>$/u, '').trim() || ({ note: '提示', tip: '建议', warning: '注意', danger: '警告' })[kind];
      const rest = content.slice(marker[0].length);
      return `<blockquote class="callout callout-${kind}"><p class="callout-title">${title}</p>${rest && !closed ? '<p>' : ''}${rest}</blockquote>\n`;
    };
    const table = renderer.table;
    renderer.table = function (token) { return `<div class="table-scroll">${table.call(this, token)}</div>`; };
  }
  const rendered = marked.parse(normalized, {
    async: false,
    gfm: true,
    breaks: false,
    headerIds: false,
    mangle: false,
    renderer
  });
  let html = sanitizeRenderedHtml(rendered, options);
  formulas.forEach((formula, index) => { html = html.replaceAll(`PUBWIKIMATH${index}TOKEN`, formula); });
  return html;
}

export function renderWebArticle(source, options = {}) {
  const outline = [];
  const html = renderWebMarkdown(source, { ...options, outline });
  return { html, outline };
}

// Search excerpts show the document's visible text, rather than Markdown control syntax.
export function markdownText(source) {
  const collect = (tokens, separator = '') => tokens.map(token => {
    if (token.type === 'list') return token.items.map(item => collect(item.tokens, ' ')).join(' ');
    if (token.type === 'table') return [token.header, ...token.rows]
      .map(row => row.map(cell => collect(cell.tokens)).join(' ')).join(' ');
    if (token.type === 'blockquote') return collect(token.tokens, ' ').replace(/^\[![\w-]+\][+-]?[ \t]*/u, '');
    if (token.tokens) return collect(token.tokens);
    return token.text ?? token.raw ?? '';
  }).join(separator);
  return collect(marked.lexer(String(source ?? '')), ' ').replace(/\s+/gu, ' ').trim();
}

export { escapeText, normalizeObsidian, safeAssetUrl, sanitizeRenderedHtml };
