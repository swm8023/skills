// Lucide paths, matching the existing reader's outlined icon style.
const paths = {
  expand: 'm15 15 6 6M15 9l6-6m0 13v5h-5m5-13V3h-5M3 16v5h5m-5 0 6-6M3 8V3h5m1 6L3 3',
  wrap: 'm16 16-2 2 2 2M3 12h15a3 3 0 1 1 0 6h-4M3 18h7M3 6h18',
  lines: 'M11 5h10M11 12h10M11 19h10M4 4h1v5M4 9h2m.5 11H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02',
  reset: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5',
  minus: 'M5 12h14', plus: 'M5 12h14m-7-7v14', close: 'm18 6-12 12M6 6l12 12',
};
export function controlButton(name, label) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'reader-control';
  button.title = label; button.setAttribute('aria-label', label);
  button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
  return button;
}
