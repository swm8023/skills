import { staticSearch, prepareStaticLibrary } from './library.mjs';

(async () => {
  'use strict';
  await prepareStaticLibrary();
  const root = document.documentElement;
  root.classList.add('has-js');
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const base = (root.dataset.basePath || '/docs').replace(/\/$/, '');
  const currentDirectory = root.dataset.directory || '';
  const readSetting = key => { try { return localStorage.getItem(`dochub:${key}`); } catch { return null; } };
  const saveSetting = (key, value) => { try { localStorage.setItem(`dochub:${key}`, value); } catch { /* Preferences are optional. */ } };
  const storedTheme = readSetting('theme');
  if (storedTheme === 'light' || storedTheme === 'dark') root.dataset.theme = storedTheme;
  const media = matchMedia('(max-width: 650px)');
  const prefersDark = matchMedia('(prefers-color-scheme: dark)');
  let toastTimer;
  const diagrams = $$('.mermaid');
  if (diagrams.length) {
    const script = document.createElement('script');
    script.src = `${base}/assets/mermaid.min.js`;
    script.onload = () => {
      globalThis.mermaid.initialize({ startOnLoad: false, securityLevel: 'strict',
        theme: (root.dataset.theme || (prefersDark.matches ? 'dark' : 'light')) === 'dark' ? 'dark' : 'default' });
      globalThis.mermaid.run({ nodes: diagrams }).catch(() => toast('部分图表未能渲染，请检查 Mermaid 语法。'));
    };
    document.head.append(script);
  }
  addEventListener('message', event => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.type !== 'wheelmaker-theme'
      || !['light', 'dark'].includes(event.data.mode)) return;
    root.dataset.theme = event.data.mode;
    root.dataset.embedded = 'true';
    $('[data-toggle-theme]')?.setAttribute('hidden', '');
  });

  function toast(message) {
    const target = $('.toast');
    if (!target) return;
    clearTimeout(toastTimer);
    target.textContent = message;
    target.hidden = false;
    toastTimer = setTimeout(() => { target.hidden = true; }, 3200);
  }

  $('[data-toggle-theme]')?.addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : prefersDark.matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    saveSetting('theme', root.dataset.theme);
  });

  function focusMode(enabled) {
    document.body.classList.toggle('reading-focused', enabled);
    $('[data-toggle-focus]')?.setAttribute('aria-pressed', String(enabled));
    requestAnimationFrame(updateReading);
  }
  if (root.dataset.page === 'document') focusMode(readSetting('focus') === 'true');
  $('[data-toggle-focus]')?.addEventListener('click', () => {
    const enabled = !document.body.classList.contains('reading-focused');
    focusMode(enabled);
    saveSetting('focus', String(enabled));
  });

  function wideMode(enabled) {
    document.body.classList.toggle('reading-wide', enabled);
    const button = $('[data-toggle-width]');
    button?.setAttribute('aria-pressed', String(enabled));
    if (button) button.title = enabled ? '恢复标准行宽' : '宽屏阅读';
    requestAnimationFrame(updateReading);
  }
  if (root.dataset.page === 'document') wideMode(readSetting('wide') === 'true');
  $('[data-toggle-width]')?.addEventListener('click', () => {
    const enabled = !document.body.classList.contains('reading-wide');
    wideMode(enabled);
    saveSetting('wide', String(enabled));
  });

  let copyDialog;
  async function copy(text, message) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(text);
      toast(message);
      return true;
    } catch {
      if (!copyDialog) {
        copyDialog = document.createElement('dialog');
        copyDialog.className = 'manual-copy-dialog';
        copyDialog.setAttribute('aria-label', '手动复制');
        const title = document.createElement('h2');
        title.textContent = '请手动复制';
        const explanation = document.createElement('p');
        explanation.textContent = '浏览器未允许自动复制。请选择下方内容并复制。';
        const field = document.createElement('textarea');
        field.readOnly = true;
        field.setAttribute('aria-label', '待复制内容');
        const form = document.createElement('form');
        form.method = 'dialog';
        const button = document.createElement('button');
        button.className = 'primary-button';
        button.textContent = '完成';
        form.append(button);
        copyDialog.append(title, explanation, field, form);
        document.body.append(copyDialog);
      }
      copyDialog.querySelector('textarea').value = text;
      copyDialog.showModal();
      copyDialog.querySelector('textarea').select();
      return false;
    }
  }

  $$('.article-body pre').forEach(pre => {
    const code = pre.querySelector('code');
    if (!code) return;
    const block = document.createElement('div');
    block.className = 'code-block';
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    const label = document.createElement('span');
    label.textContent = [...code.classList].find(name => name.startsWith('language-'))?.slice(9).toUpperCase() || 'TEXT';
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '复制代码';
    button.addEventListener('click', async () => {
      if (await copy(code.textContent, '代码已复制')) {
        button.textContent = '已复制';
        setTimeout(() => { button.textContent = '复制代码'; }, 2200);
      }
    });
    toolbar.append(label, button);
    pre.before(block);
    block.append(toolbar, pre);
  });

  const headings = $$('.article-body h1[id], .article-body h2[id], .article-body h3[id], .article-body h4[id], .article-body h5[id], .article-body h6[id]');
  const headingLinks = $$('[data-heading]');
  const article = $('#article-body');
  let activeHeading = headings[0]?.id || '', readingFrame = 0;
  function updateReading() {
    readingFrame = 0;
    if (!article) return;
    const top = media.matches ? 90 : 110;
    let active = headings[0];
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= top + 32) active = heading;
      else break;
    }
    activeHeading = active?.id || '';
    headingLinks.forEach(link => {
      if (link.dataset.heading === activeHeading) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const rect = article.getBoundingClientRect();
    const range = rect.height - (innerHeight - top);
    const value = Math.round(Math.max(0, Math.min(100, range <= 0 ? (rect.top < innerHeight ? 100 : 0) : (top - rect.top) / range * 100)));
    const progress = $('.reading-progress');
    if (progress) {
      progress.setAttribute('aria-valuenow', String(value));
      progress.querySelector('span').style.width = `${value}%`;
      $('[data-reading-progress]').textContent = `阅读进度 ${value}%`;
    }
  }
  const scheduleReading = () => { if (!readingFrame) readingFrame = requestAnimationFrame(updateReading); };
  addEventListener('scroll', scheduleReading, { passive: true });
  addEventListener('resize', scheduleReading, { passive: true });
  if (article && globalThis.ResizeObserver) new ResizeObserver(scheduleReading).observe(article);
  updateReading();
  headingLinks.forEach(link => link.addEventListener('click', () => {
    const details = link.closest('.mobile-outline');
    if (details) details.open = false;
    requestAnimationFrame(updateReading);
  }));
  $('[data-copy-link]')?.addEventListener('click', () => {
    const url = new URL(location.href);
    url.hash = activeHeading;
    copy(url.href, '章节链接已复制');
  });

  const directory = $('#knowledge-directory');
  const directoryToggle = $('[data-open-directory]');
  const shade = $('.drawer-shade');
  let directoryOpener;
  function closeDirectory(restore = true) {
    if (!directory) return;
    document.body.classList.remove('directory-is-open');
    directory.removeAttribute('role');
    directory.removeAttribute('aria-modal');
    directoryToggle?.setAttribute('aria-expanded', 'false');
    shade.hidden = true;
    $('#main-content').inert = false;
    $('.topbar').inert = false;
    if (restore && directoryOpener?.isConnected) directoryOpener.focus({ preventScroll: true });
    directoryOpener = null;
  }
  directoryToggle?.addEventListener('click', () => {
    if (!media.matches) return;
    directoryOpener = document.activeElement;
    document.body.classList.add('directory-is-open');
    directory.setAttribute('role', 'dialog');
    directory.setAttribute('aria-modal', 'true');
    directoryToggle.setAttribute('aria-expanded', 'true');
    shade.hidden = false;
    $('#main-content').inert = true;
    $('.topbar').inert = true;
    directory.querySelector('[data-close-directory]').focus({ preventScroll: true });
  });
  $$('[data-close-directory]').forEach(button => button.addEventListener('click', () => closeDirectory()));
  media.addEventListener('change', () => { closeDirectory(false); updateReading(); });

  const dialog = $('#document-search');
  let searchTimer, searchController, searchSequence = 0, searchIndex = 0, searchScope = 'all', searchOpener;
  const searchInput = dialog?.querySelector('input[type="search"]');
  const searchList = $('#search-results');
  function fullSearchUrl(query, selectedDirectory) {
    const url = new URL(`${base}/`, location.origin);
    if (query) url.searchParams.set('q', query);
    if (selectedDirectory) url.searchParams.set('directory', selectedDirectory);
    url.searchParams.set('sort', 'relevance');
    return url;
  }
  function highlight(parent, value, query) {
    const text = String(value ?? ''), needle = query.toLocaleLowerCase();
    let position = 0, match;
    while (needle && (match = text.toLocaleLowerCase().indexOf(needle, position)) >= 0) {
      parent.append(document.createTextNode(text.slice(position, match)));
      const mark = document.createElement('mark');
      mark.textContent = text.slice(match, match + needle.length);
      parent.append(mark);
      position = match + needle.length;
    }
    parent.append(document.createTextNode(text.slice(position)));
  }
  function selectSearchResult(index) {
    const links = $$('.search-result');
    if (!links.length) return;
    searchIndex = (index + links.length) % links.length;
    links.forEach((link, i) => link.classList.toggle('is-selected', i === searchIndex));
    links[searchIndex].scrollIntoView({ block: 'nearest' });
  }
  function searchMessage(message, login = false) {
    searchList.replaceChildren();
    const row = document.createElement('li');
    row.className = 'search-result-message';
    row.textContent = message;
    if (login) {
      const link = document.createElement('a');
      link.href = `${base}/login`;
      link.textContent = ' 重新登录';
      row.append(link);
    }
    searchList.append(row);
  }
  async function runSearch() {
    if (!dialog?.open) return;
    searchController?.abort();
    searchController = new AbortController();
    const sequence = ++searchSequence;
    const query = searchInput.value.trim();
    const selectedDirectory = searchScope === 'directory' ? currentDirectory : '';
    const url = new URL(`${base}/api/search`, location.origin);
    url.search = new URLSearchParams({ q: query, directory: selectedDirectory, limit: '8', sort: 'relevance' });
    $('[data-search-status]').textContent = '正在搜索…';
    $('.search-all').hidden = true;
    searchList.replaceChildren();
    dialog.querySelector('input[name="directory"]').value = selectedDirectory;
    try {
      const response = root.dataset.staticIndex ? null : await fetch(url, { credentials: 'same-origin', signal: searchController.signal, headers: { accept: 'application/json' } });
      if (sequence !== searchSequence || !dialog.open) return;
      if (response?.status === 401) {
        $('[data-search-status]').textContent = '需要登录';
        searchMessage('登录已过期，请重新登录后搜索。', true);
        return;
      }
      if (response && !response.ok) throw new Error('search failed');
      const data = response ? await response.json() : await staticSearch(Object.fromEntries(url.searchParams));
      if (sequence !== searchSequence || !dialog.open) return;
      if (!Array.isArray(data.results)) throw new Error('invalid results');
      $('[data-search-status]').textContent = `${query ? `找到 ${data.total} 篇匹配文档` : `浏览文档 · 共 ${data.total} 篇`}${data.index_status === 'stale' ? ' · 最近一次已确认快照' : data.index_status === 'degraded' ? ' · 关键词检索' : ''}`;
      for (const item of data.results) {
        const row = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'search-result';
        link.href = item.url || `${base}/document/${encodeURIComponent(item.document_id)}`;
        const title = document.createElement('strong');
        highlight(title, item.title, query);
        const path = document.createElement('small');
        path.textContent = item.directory || '根目录';
        const snippet = document.createElement('p');
        highlight(snippet, item.snippet || item.description, query);
        link.append(title, path, snippet);
        row.append(link);
        searchList.append(row);
      }
      searchIndex = 0;
      $$('.search-result')[0]?.classList.add('is-selected');
      if (!data.results.length) searchMessage('没有找到匹配文档。试试其他关键词，或扩大搜索范围。');
      if (data.total > data.results.length) {
        $('[data-search-all]').href = fullSearchUrl(query, selectedDirectory).href;
        $('.search-all').hidden = false;
      }
    } catch (error) {
      if (error.name === 'AbortError' || sequence !== searchSequence || !dialog.open) return;
      $('[data-search-status]').textContent = '搜索暂时不可用';
      searchMessage('请稍后重试，也可以关闭搜索后浏览文档目录。');
    }
  }
  function openSearch() {
    if (!dialog || dialog.open) return;
    closeDirectory(false);
    searchOpener = document.activeElement;
    searchInput.value = '';
    searchScope = 'all';
    $$('[data-search-scope]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.searchScope === 'all')));
    dialog.showModal();
    searchInput.focus({ preventScroll: true });
    runSearch();
  }
  $$('[data-open-search]').forEach(button => button.addEventListener('click', openSearch));
  $('[data-close-search]')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('close', () => {
    clearTimeout(searchTimer);
    searchSequence++;
    searchController?.abort();
    if (searchOpener?.isConnected) searchOpener.focus({ preventScroll: true });
  });
  dialog?.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  searchInput?.addEventListener('input', () => {
    searchSequence++;
    searchController?.abort();
    searchList.replaceChildren();
    $('.search-all').hidden = true;
    $('[data-search-status]').textContent = '正在搜索…';
    clearTimeout(searchTimer);
    searchTimer = setTimeout(runSearch, 160);
  });
  $$('[data-search-scope]').forEach(button => button.addEventListener('click', () => {
    searchScope = button.dataset.searchScope;
    $$('[data-search-scope]').forEach(entry => entry.setAttribute('aria-pressed', String(entry === button)));
    clearTimeout(searchTimer);
    runSearch();
  }));
  searchInput?.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectSearchResult(searchIndex + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Enter' && $$('.search-result').length) {
      event.preventDefault();
      $$('.search-result')[searchIndex].click();
    }
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'k' && dialog) {
      event.preventDefault();
      dialog.open ? dialog.close() : openSearch();
    }
    if (event.key === 'Escape' && document.body.classList.contains('directory-is-open')) closeDirectory();
    if (event.key === 'Tab' && document.body.classList.contains('directory-is-open')) {
      const targets = [...directory.querySelectorAll('a, button, summary')].filter(el => el.getClientRects().length);
      if (!targets.length) return;
      const first = targets[0], last = targets.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();
