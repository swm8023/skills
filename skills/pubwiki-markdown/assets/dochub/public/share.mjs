// Capture before enhancement so code tools, diagram dialogs and host portals are
// rebuilt in the independent document instead of copying their live DOM state.
export function initializeShareCapture(view = window) {
  const document = view.document;
  if (document.documentElement.dataset.page !== 'document' || document.documentElement.dataset.wikiShare) return;
  const title = document.querySelector('.article-title')?.textContent?.trim();
  if (!title || !document.querySelector('#article-body')) return;
  const pristine = document.cloneNode(true);
  view.wheelmakerWikiShare = Object.freeze({version: 1, capture() {
    const snapshot = pristine.cloneNode(true);
    const root = snapshot.documentElement;
    for (const attribute of [...root.attributes]) {
      if (attribute.name.startsWith('data-static-') || ['data-embedded', 'data-theme', 'data-theme-source', 'data-directory', 'data-base-path', 'data-outline-layout'].includes(attribute.name)) root.removeAttribute(attribute.name);
    }
    root.dataset.wikiShare = '1';
    snapshot.body.className = '';
    snapshot.body.removeAttribute('style');
    snapshot.querySelectorAll('#knowledge-directory,.drawer-shade,#document-search,.related-documents,.adjacent-documents,.page-foot,[data-open-directory],[data-open-search],[data-wiki-host-actions],.wiki-preview-page-actions,.wiki-menu-group[aria-label="账号"]').forEach(node => node.remove());
    const start = snapshot.querySelector('.topbar-start');
    if (start) {
      const label = snapshot.createElement('span');
      label.className = 'document-location'; label.textContent = title; label.title = title;
      start.replaceChildren(label);
    }
    snapshot.querySelectorAll('.tags a').forEach(link => {
      const text = snapshot.createElement('span'); text.className = link.className;
      text.textContent = link.textContent; link.replaceWith(text);
    });
    return {title, html: '<!doctype html>\n' + root.outerHTML};
  }});
}
