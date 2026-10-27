export function initializeMoreMenu(view = window, closePanels = () => {}) {
  const document = view.document;
  const menu = document.querySelector('#wiki-more-menu');
  const trigger = document.querySelector('[data-open-more]');
  if (!menu || !trigger) return () => {};
  const close = () => { if (menu.matches(':popover-open')) menu.hidePopover(); };
  function updateGroups() {
    const groups = [...menu.querySelectorAll('.wiki-menu-group')];
    for (const group of groups) {
      if (!group.hasAttribute('data-wiki-host-actions')) group.hidden = !group.querySelector('button:not([hidden])');
      group.classList.remove('has-separator');
    }
    groups.filter(group => !group.hidden && view.getComputedStyle(group).display !== 'none')
      .forEach((group, index) => group.classList.toggle('has-separator', index > 0));
    trigger.hidden = !groups.some(group => !group.hidden && view.getComputedStyle(group).display !== 'none');
    if (trigger.hidden) close();
  }
  menu.addEventListener('beforetoggle', event => {
    const opening = event.newState === 'open';
    trigger.setAttribute('aria-expanded', String(opening));
    if (!opening) return;
    closePanels();
    updateGroups();
    const rect = trigger.getBoundingClientRect();
    const top = Math.max(8, Math.min(rect.bottom + 8, view.innerHeight - 84));
    menu.style.top = `${top}px`;
    menu.style.right = `${Math.max(12, view.innerWidth - rect.right)}px`;
    menu.style.maxHeight = `${Math.max(60, view.innerHeight - top - 12)}px`;
  });
  // Close before a row opens a dialog, so native focus restoration cannot steal its focus.
  document.addEventListener('click', event => {
    const button = event.target.closest?.('button, summary');
    if (!button || button.disabled || button === trigger) return;
    if (menu.contains(button) || button.matches('[data-open-search], [data-open-directory], .outline-menu > summary')) close();
  }, true);
  view.addEventListener('resize', close);
  new view.MutationObserver(updateGroups).observe(menu, { childList: true, subtree: true });
  updateGroups();
  return close;
}
