// Theme ownership must be established before any asynchronous index or diagram work.
export function initializeTheme(view = window, onChange = () => {}) {
  const root = view.document.documentElement;
  const button = view.document.querySelector('[data-toggle-theme]');
  const media = view.matchMedia('(prefers-color-scheme: dark)');
  let embedded = false;
  const mode = () => root.dataset.theme || (media.matches ? 'dark' : 'light');
  function apply(value, host = false) {
    if (host) {
      embedded = true;
      root.dataset.embedded = 'true';
      if (button) button.hidden = true;
    }
    root.dataset.theme = value;
    onChange(value);
  }
  view.addEventListener('message', event => {
    if (view.parent === view || event.source !== view.parent || event.origin !== view.location.origin
      || event.data?.type !== 'wheelmaker-theme' || !['light', 'dark'].includes(event.data.mode)) return;
    apply(event.data.mode, true);
  });
  try {
    if (view.parent !== view && view.frameElement?.classList.contains('wiki-preview-frame')) {
      const scheme = view.getComputedStyle(view.parent.document.documentElement).colorScheme;
      apply(scheme === 'dark' ? 'dark' : 'light', true);
    }
  } catch { /* Cross-origin embedding cannot inspect the host theme. */ }
  if (!embedded) {
    try {
      const saved = view.localStorage.getItem('dochub:theme');
      if (saved === 'light' || saved === 'dark') apply(saved);
    } catch { /* Preferences are optional. */ }
  }
  button?.addEventListener('click', () => {
    if (embedded) return;
    apply(mode() === 'dark' ? 'light' : 'dark');
    try { view.localStorage.setItem('dochub:theme', mode()); } catch { /* Preferences are optional. */ }
  });
  media.addEventListener('change', () => { if (!embedded && !root.dataset.theme) onChange(mode()); });
  return mode;
}
