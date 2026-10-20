import assert from 'node:assert/strict';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { layout } from '../assets/dochub/web-templates.mjs';

async function initialize() {
  const module = await import('../assets/dochub/public/theme.mjs').catch(error => {
    if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
    throw error;
  });
  assert.equal(typeof module.initializeTheme, 'function', 'reader theme ownership must initialize synchronously');
  return module.initializeTheme;
}

function browser({ embedded = false, stored = 'dark', hostTheme = 'light' } = {}) {
  const view = new EventTarget(), button = new EventTarget(), media = new EventTarget();
  const settings = new Map([['dochub:theme', stored]]);
  const root = { dataset: {} };
  Object.assign(button, { hidden: false });
  Object.assign(media, { matches: false });
  Object.assign(view, {
    document: { documentElement: root, querySelector: () => button },
    location: { origin: 'https://wiki.example' },
    localStorage: { getItem: key => settings.get(key), setItem: (key, value) => settings.set(key, value) },
    matchMedia: () => media,
    getComputedStyle: () => ({ colorScheme: hostTheme }),
    frameElement: embedded ? { classList: { contains: name => name === 'wiki-preview-frame' } } : null,
  });
  view.parent = embedded ? { document: { documentElement: {} } } : view;
  const message = (data, source = view.parent, origin = view.location.origin) => {
    view.dispatchEvent(Object.assign(new Event('message'), { data, source, origin }));
  };
  return { view, root, button, settings, media, message };
}

test('standalone reader restores and saves its own theme preference', async () => {
  const init = await initialize(), f = browser();
  const mode = init(f.view);
  assert.equal(mode(), 'dark');
  assert.equal(f.button.hidden, false);
  f.button.dispatchEvent(new Event('click'));
  assert.equal(mode(), 'light');
  assert.equal(f.settings.get('dochub:theme'), 'light');
});

test('WheelMaker embedding takes precedence without changing standalone preferences', async () => {
  const init = await initialize(), f = browser({ embedded: true });
  const mode = init(f.view);
  assert.equal(mode(), 'light');
  assert.equal(f.button.hidden, true);
  f.button.dispatchEvent(new Event('click'));
  assert.equal(mode(), 'light');
  assert.equal(f.settings.get('dochub:theme'), 'dark');
  f.message({ type: 'wheelmaker-theme', mode: 'dark' });
  assert.equal(mode(), 'dark');
});

test('host theme events apply immediately and reject other sources, origins and invalid modes', async () => {
  const init = await initialize(), f = browser({ embedded: true });
  const mode = init(f.view);
  f.message({ type: 'wheelmaker-theme', mode: 'dark' });
  assert.equal(mode(), 'dark');
  f.message({ type: 'wheelmaker-theme', mode: 'light' }, {});
  f.message({ type: 'wheelmaker-theme', mode: 'light' }, f.view.parent, 'https://other.example');
  f.message({ type: 'wheelmaker-theme', mode: 'invalid' });
  assert.equal(mode(), 'dark');
  f.message({ type: 'wheelmaker-theme', mode: 'light' });
  assert.equal(mode(), 'light');
});

test('standalone messages cannot lock its theme control', async () => {
  const init = await initialize(), f = browser();
  const mode = init(f.view);
  f.message({ type: 'wheelmaker-theme', mode: 'light' });
  assert.equal(mode(), 'dark');
  assert.equal(f.button.hidden, false);
});

for (const embedded of [false, true]) {
  test(`HTML establishes ${embedded ? 'host' : 'saved'} theme before external modules load`, () => {
    const html = layout('First paint', '');
    const script = /<script>([\s\S]*?)<\/script>/.exec(html);
    assert.ok(script, 'first paint cannot wait for the module graph');
    assert.ok(script.index < html.indexOf('<link rel="stylesheet"'));
    const f = browser({ embedded });
    runInNewContext(script[1], { window: f.view });
    assert.equal(f.root.dataset.theme, embedded ? 'light' : 'dark');
    assert.equal(f.settings.get('dochub:theme'), 'dark');
  });
}

test('unavailable preferences fall back to the system and continue following it', async () => {
  const init = await initialize(), f = browser();
  f.view.localStorage.getItem = () => { throw new Error('storage blocked'); };
  const mode = init(f.view);
  assert.equal(mode(), 'light');
  f.media.matches = true;
  f.media.dispatchEvent(new Event('change'));
  assert.equal(mode(), 'dark');
});
