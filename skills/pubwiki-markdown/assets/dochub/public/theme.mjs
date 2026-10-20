// This self-contained function is also embedded in the HTML head before first paint.
export function bootstrapTheme(view = window) {
  const root = view.document.documentElement;
  let value, source = 'system';
  try {
    if (view.parent !== view && view.frameElement?.classList.contains('wiki-preview-frame')) {
      value = view.getComputedStyle(view.parent.document.documentElement).colorScheme === 'dark' ? 'dark' : 'light';
      source = 'host';
      root.dataset.embedded = 'true';
    }
  } catch { /* Cross-origin embedding cannot inspect the host theme. */ }
  if (!value) {
    try {
      const saved = view.localStorage.getItem('dochub:theme');
      if (saved === 'light' || saved === 'dark') { value = saved; source = 'saved'; }
    } catch { /* Preferences are optional. */ }
  }
  root.dataset.theme = value || (view.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  root.dataset.themeSource = source;
}

export function initializeTheme(view = window, onChange = () => {}) {
  bootstrapTheme(view);
  const root = view.document.documentElement;
  const button = view.document.querySelector('[data-toggle-theme]');
  const media = view.matchMedia('(prefers-color-scheme: dark)');
  let embedded = root.dataset.embedded === 'true';
  if (embedded && button) button.hidden = true;
  const mode = () => root.dataset.theme || (media.matches ? 'dark' : 'light');
  function apply(value, host = false) {
    if (host) {
      embedded = true;
      root.dataset.embedded = 'true';
      if (button) button.hidden = true;
    }
    root.dataset.theme = value;
    root.dataset.themeSource = host ? 'host' : 'saved';
    onChange(value);
  }
  view.addEventListener('message', event => {
    if (view.parent === view || event.source !== view.parent || event.origin !== view.location.origin
      || event.data?.type !== 'wheelmaker-theme' || !['light', 'dark'].includes(event.data.mode)) return;
    apply(event.data.mode, true);
  });
  button?.addEventListener('click', () => {
    if (embedded) return;
    apply(mode() === 'dark' ? 'light' : 'dark');
    try { view.localStorage.setItem('dochub:theme', mode()); } catch { /* Preferences are optional. */ }
  });
  media.addEventListener('change', () => {
    if (embedded || root.dataset.themeSource !== 'system') return;
    root.dataset.theme = media.matches ? 'dark' : 'light';
    onChange(mode());
  });
  return mode;
}
