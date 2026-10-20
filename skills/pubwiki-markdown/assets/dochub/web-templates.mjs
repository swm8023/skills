import { escapeText } from './web-markdown.mjs';
import { webAssets } from './web-assets.mjs';
import { sidebar } from './web-navigation.mjs';
import { bootstrapTheme } from './public/theme.mjs';
import { renderLocation } from './public/location.mjs';
import { route, queryUrl, documentUrl, highlightText, icon, dateText, sizeText } from './web-ui.mjs';

function brand(prefix, { subtitle = false } = {}) {
  return `<a class="brand" href="${escapeText(route(prefix))}" aria-label="WheelMaker Wiki 文档总览"><span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span><span>WheelMaker Wiki</span>${subtitle ? '<small>团队知识库</small>' : ''}</a>`;
}

function layout(title, body, { prefix = '/docs', page = 'standalone', directory = '' } = {}) {
  const asset = name => escapeText(route(prefix, `/assets/${name}?v=${webAssets.get(name).version}`));
  return `<!doctype html>
<html lang="zh-CN" data-page="${page}" data-base-path="${escapeText(prefix)}" data-directory="${escapeText(directory)}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<script>(${bootstrapTheme.toString()})(window);</script>
<style>:root{color-scheme:light dark;background:light-dark(#fffefa,#1e1e1e)}html[data-theme="light"]{color-scheme:light}html[data-theme="dark"]{color-scheme:dark}html[data-embedded="true"] [data-toggle-theme]{display:none}</style>
<meta name="color-scheme" content="light dark"><title>${escapeText(title)} · WheelMaker Wiki</title>
<link rel="stylesheet" href="${asset('dochub.css')}"><script src="${asset('dochub.js')}" defer></script></head>
<body>${body}<div class="toast" role="status" aria-live="polite" hidden></div></body></html>`;
}

function directoryButton() {
  return `<button class="icon-button directory-toggle" type="button" data-open-directory aria-label="收起知识目录" title="收起知识目录" aria-expanded="true" aria-controls="knowledge-directory"><span data-directory-close-icon>${icon('panel-close')}</span><span data-directory-open-icon hidden>${icon('panel-open')}</span></button>`;
}

function header(prefix, { standalone = false, page = '', directory = '', title = '', outline = [] } = {}) {
  const tools = page === 'document' ? `<button class="icon-button secondary-tool" type="button" data-copy-link aria-label="复制当前章节链接" title="复制当前章节链接">${icon('link')}</button><button class="icon-button reading-width-toggle secondary-tool" type="button" data-toggle-width aria-label="切换宽屏阅读" aria-pressed="false" title="宽屏阅读">${icon('width')}</button>${directoryButton()}<details class="outline-menu"><summary class="icon-button" aria-label="本页大纲" title="本页大纲" aria-controls="article-outline">${icon('outline')}</summary><section class="outline-popover" id="article-outline" aria-label="本页大纲"><div class="outline-heading"><strong>本页大纲</strong><span>${outline.length} 个章节</span></div>${outline.length ? `<nav aria-label="章节导航">${outlineLinks(outline)}</nav>` : '<p class="outline-empty">本文没有章节标题</p>'}<div class="outline-foot"><span data-reading-progress>阅读进度 0%</span><div class="reading-progress" role="progressbar" aria-label="阅读进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div></div></section></details>` : '';
  return `<header class="topbar"><div class="topbar-start">${standalone ? brand(prefix) : `<span class="reader-mark" aria-hidden="true"><span class="brand-mark"><span></span><span></span><span></span></span></span><div class="document-location" title="${escapeText([directory, title].filter(Boolean).join(' / '))}">${renderLocation(prefix, directory, page === 'document' ? title : '')}</div>`}</div><div class="topbar-actions">
    ${standalone ? '' : `<button type="button" class="search-trigger" data-open-search aria-label="搜索文档">${icon('search')}<span>搜索文档、内容、标签…</span><kbd>Ctrl K</kbd></button>`}
    ${tools}${!standalone && page !== 'document' ? directoryButton() : ''}<button type="button" class="icon-button" data-toggle-theme aria-label="切换明暗主题" title="切换明暗主题">${icon('theme')}</button>
    ${standalone ? '' : `<form method="post" action="${escapeText(route(prefix, '/logout'))}"><button class="icon-button logout-button" type="submit" aria-label="退出登录" title="退出登录">${icon('logout')}</button></form>`}
  </div></header>`;
}

function searchDialog(prefix, directory) {
  return `<dialog class="search-dialog" id="document-search" aria-label="搜索文档">
    <form method="get" action="${escapeText(route(prefix))}" class="dialog-search-form">
      <label class="dialog-input">${icon('search')}<input type="search" name="q" aria-label="全站搜索" placeholder="输入关键词，搜索团队知识…" autocomplete="off" maxlength="1000" aria-controls="search-results" autofocus></label>
      <input type="hidden" name="directory" value=""><button class="icon-button" type="button" data-close-search aria-label="关闭搜索">${icon('close')}</button>
    </form>
    <div class="search-scopes"><button type="button" data-search-scope="all" aria-pressed="true">全部知识库</button>${directory ? `<button type="button" data-search-scope="directory" aria-pressed="false">当前目录</button>` : ''}</div>
    <div class="search-caption"><span data-search-status role="status" aria-live="polite">输入关键词查找文档</span><span>标题 · 正文 · 标签</span></div>
    <ul class="search-results" id="search-results" aria-label="搜索结果"></ul>
    <div class="search-all" hidden><a href="${escapeText(route(prefix))}" data-search-all>查看全部结果 ${icon('arrow')}</a></div>
    <footer class="search-footer"><span><kbd>↑</kbd> <kbd>↓</kbd> 选择 &nbsp; <kbd>Enter</kbd> 打开</span><span><kbd>Esc</kbd> 关闭</span></footer>
  </dialog>`;
}

function workspace(body, { prefix, directory = '', documentId = '', tag = '', navigation, indexStatus = 'ready', page = 'library', outline = [] }) {
  return layout(page === 'library' ? '文档' : body.title, `<a class="skip-link" href="#main-content">跳到正文</a>
  <div class="workspace">${header(prefix, { page, directory, title: body.title || '', outline })}<div class="workspace-body">${sidebar(navigation, { prefix, directory, documentId, tag })}
    <main id="main-content">${indexStatus === 'stale' ? '<div class="sync-warning" role="status">暂时无法同步文档，当前显示最近一次已确认快照。</div>' : ''}${typeof body === 'string' ? body : body.html}</main>
  </div></div>${searchDialog(prefix, directory)}`, { prefix, page, directory });
}

function tagHtml(tags = [], { prefix = '/docs', directory = '' } = {}) {
  return tags.length ? `<div class="tags">${tags.map(tag => `<a class="tag" href="${queryUrl(prefix, { directory, tag })}"># ${escapeText(tag)}</a>`).join('')}</div>` : '';
}

export function loginPage({ error = '', prefix = '/docs' } = {}) {
  return layout('登录', `${header(prefix, { standalone: true })}<main class="access-page"><section class="access-panel">
    <span class="access-symbol">${icon('lock')}</span><h1>登录知识库</h1><p class="access-description">请输入访问密钥。</p>
    ${error ? `<p class="error-message" role="alert">${escapeText(error)}</p>` : ''}
    <form method="post" action="${escapeText(route(prefix, '/login'))}"><label for="token">共享访问密钥</label><input id="token" name="token" type="password" autocomplete="current-password" required autofocus><button class="primary-button" type="submit">进入知识库 ${icon('arrow')}</button></form>
    <p class="access-foot">${icon('lock')}只读访问 · 登录状态在连续 30 天未使用后过期</p>
  </section></main>`, { prefix });
}

export function homePage({ results = [], query = '', directory = '', tag = '', sort = '', directories = [], total = results.length, offset = 0, limit = 20, indexStatus = 'ready', prefix = '/docs', navigation = { documents: results, directories, tags: [], total } } = {}) {
  const values = { q: query, directory, tag, sort, limit };
  const list = results.map(item => `<li class="document-row"><span class="document-symbol">${icon('file')}</span><div class="document-row-copy"><div class="document-path">${escapeText(item.directory || '根目录')}</div>
    <h2><a href="${documentUrl(prefix, item.document_id)}">${highlightText(item.title, query)}</a></h2>
    ${item.description ? `<p class="document-description">${highlightText(item.description, query)}</p>` : ''}
    ${query && item.snippet ? `<p class="document-snippet">${highlightText(item.snippet, query)}</p>` : !item.description && item.snippet ? `<p class="document-description">${escapeText(item.snippet)}</p>` : ''}
    <div class="document-row-meta">${item.date ? `<time>${dateText(item.date)}</time>` : ''}${item.author ? `<span>${escapeText(item.author)}</span>` : ''}${tagHtml(item.tags, { prefix, directory })}</div></div><a class="document-open" href="${documentUrl(prefix, item.document_id)}" aria-label="打开 ${escapeText(item.title)}">${icon('arrow')}</a></li>`).join('');
  const pages = Math.max(1, Math.ceil(total / limit));
  const body = `<section class="library-page" aria-label="文档总览">
    <div class="library-heading"><h1 class="library-title">文档库</h1></div>
    <form class="library-search" method="get" action="${escapeText(route(prefix))}"><label class="library-input">${icon('search')}<input type="search" name="q" value="${escapeText(query)}" aria-label="搜索文档库" placeholder="搜索标题、正文或标签…" maxlength="1000"></label>
      <div class="library-selects"><label><span class="sr-only">目录</span><select name="directory" aria-label="目录"><option value="">全部目录</option>${navigation.directories.map(entry => typeof entry === 'string' ? entry : entry.directory).map(path => `<option value="${escapeText(path)}"${path === directory ? ' selected' : ''}>${escapeText(path)}</option>`).join('')}</select></label>
      <label><span class="sr-only">文档排序</span><select name="sort" aria-label="文档排序"><option value=""${sort === '' ? ' selected' : ''}>默认排序</option><option value="title"${sort === 'title' ? ' selected' : ''}>按标题排序</option><option value="date"${sort === 'date' ? ' selected' : ''}>最近日期优先</option><option value="relevance"${sort === 'relevance' ? ' selected' : ''}>搜索相关度</option></select></label>
      ${tag ? `<input type="hidden" name="tag" value="${escapeText(tag)}">` : ''}<button class="primary-button" type="submit">搜索</button></div></form>
    <div class="filter-tags"><a class="tag" href="${queryUrl(prefix, { ...values, tag: '' })}"${!tag ? ' aria-current="page"' : ''}>全部标签</a>${(navigation.tags ?? []).slice(0, 8).map(entry => `<a class="tag" href="${queryUrl(prefix, { ...values, tag: entry.tag })}"${tag.toLocaleLowerCase('en-US') === entry.tag.toLocaleLowerCase('en-US') ? ' aria-current="page"' : ''}># ${escapeText(entry.tag)}</a>`).join('')}${tag && !(navigation.tags ?? []).slice(0, 8).some(entry => entry.tag.toLocaleLowerCase('en-US') === tag.toLocaleLowerCase('en-US')) ? `<span class="tag" aria-current="page"># ${escapeText(tag)}</span>` : ''}</div>
    <div class="list-heading"><p>共找到 <strong>${total}</strong> 篇文档${total ? `，本页显示 ${results.length} 篇` : ''}</p>${query || directory || tag ? `<a href="${queryUrl(prefix)}">清除筛选</a>` : ''}</div>
    ${results.length ? `<ul class="document-list">${list}</ul>` : `<div class="empty-state">${icon('search')}<h2>${navigation.total === 0 ? '知识库还没有文档' : '没有找到匹配文档'}</h2><p>${navigation.total === 0 ? '发布文档后，文章和目录会显示在这里。' : '试试其他关键词，或清除目录与标签筛选。'}</p></div>`}
    ${total > limit ? `<nav class="pagination" aria-label="分页">${offset > 0 ? `<a href="${queryUrl(prefix, { ...values, offset: Math.max(0, offset - limit) })}">← 上一页</a>` : '<span></span>'}<span>第 ${Math.floor(offset / limit) + 1} / ${pages} 页</span>${offset + limit < total ? `<a href="${queryUrl(prefix, { ...values, offset: offset + limit })}">下一页 →</a>` : '<span></span>'}</nav>` : ''}
    </section>`;
  return workspace(body, { prefix, directory, tag, navigation, indexStatus });
}

function outlineLinks(outline) {
  const base = Math.min(...outline.map(entry => entry.depth));
  return outline.map(entry => `<a href="#${escapeText(entry.id)}" data-heading="${escapeText(entry.id)}" class="outline-depth-${Math.min(3, entry.depth - base)}">${escapeText(entry.title || '未命名章节')}</a>`).join('');
}

export function documentPage(document, { html, outline = [], indexStatus = 'ready', prefix = '/docs', navigation = { documents: [], directories: [], tags: [], total: 0 } } = {}) {
  const metadata = document.metadata ?? {}, directory = metadata.directory ?? '';
  const minutes = Math.max(1, Math.ceil(String(document.body ?? '').length / 450));
  const assets = (document.assets ?? []).map(asset => `<a class="attachment" href="${escapeText(route(prefix, `/document/${encodeURIComponent(document.document_id)}/asset/${encodeURIComponent(asset.filename)}`))}">${icon('file')}<span><strong>${escapeText(asset.filename)}</strong><small>${escapeText(asset.mime_type)} · ${sizeText(asset.size)}</small></span>${icon('download')}</a>`).join('');
  const peers = navigation.documents.filter(entry => entry.directory === directory);
  const position = peers.findIndex(entry => entry.document_id === document.document_id);
  const adjacent = [peers[position - 1], peers[position + 1]];
  const neighbors = adjacent.some(Boolean) ? `<nav class="adjacent-documents" aria-label="相邻文档">${adjacent.map((entry, i) => entry ? `<a href="${documentUrl(prefix, entry.document_id)}"><small>${i ? '下一篇 →' : '← 上一篇'}</small><span>${escapeText(entry.title)}</span></a>` : '<span></span>').join('')}</nav>` : '';
  const related = navigation.documents.filter(entry => entry.document_id !== document.document_id && !adjacent.includes(entry) && entry.tags.some(tag => (metadata.tags ?? []).some(current => current.toLocaleLowerCase('en-US') === tag.toLocaleLowerCase('en-US')))).slice(0, 3);
  const content = `<div class="reading-layout"><div class="reading-column"><header class="article-header">${metadata.description ? `<p class="article-description">${escapeText(metadata.description)}</p>` : ''}
    <div class="article-meta">${metadata.author ? `<span><span class="author-avatar" aria-hidden="true">${escapeText(Array.from(metadata.author)[0])}</span>${escapeText(metadata.author)}</span>` : ''}${metadata.date ? `<time>${icon('calendar')}${dateText(metadata.date)}</time>` : ''}<span>${icon('clock')}约 ${minutes} 分钟</span></div>${tagHtml(metadata.tags, { prefix, directory })}
  </header>
  <article class="article-body" id="article-body">${html ?? ''}</article>
  ${assets ? `<section class="attachments" aria-label="附件"><h2>附件 <span>${document.assets.length}</span></h2>${assets}</section>` : ''}
  ${related.length ? `<section class="related-documents" aria-label="延伸阅读"><h2>延伸阅读</h2>${related.map(entry => `<a href="${documentUrl(prefix, entry.document_id)}">${icon('file')}<span>${escapeText(entry.title)}</span>${icon('arrow')}</a>`).join('')}</section>` : ''}${neighbors}
  <footer class="page-foot"><a href="${queryUrl(prefix, { directory })}">返回文档列表</a></footer></div>
  <aside class="docked-outline"></aside></div>`;
  return workspace({ title: metadata.title || '文档', html: content }, { prefix, directory, documentId: document.document_id, navigation, indexStatus, page: 'document', outline });
}

export function errorPage(title, message, status = 500, prefix = '/docs') {
  return layout(title, `${header(prefix, { standalone: true })}<main class="access-page"><section class="access-panel"><p class="page-description">错误 ${status}</p><h1>${escapeText(title)}</h1><p class="error-message" role="alert">${escapeText(message)}</p><a class="primary-button" href="${escapeText(route(prefix))}">返回文档站 ${icon('arrow')}</a></section></main>`, { prefix });
}

export { layout, route, tagHtml };
