import assert from 'node:assert/strict';
import test from 'node:test';
import { staticAssets } from '../assets/dochub/static-assets.mjs';

test('published reader graph carries the clean article capture capability', async () => {
  const assets = await staticAssets('/wiki', false);
  const entry = assets.readerImports['pubwiki-reader/share.mjs'];
  assert.ok(entry, 'a published reader must carry its share capture module');
  assert.ok(assets.files.has(entry.slice('/wiki/'.length)), 'capture is a hashed local presentation asset');
  const main = assets.files.get(assets.readerImports['pubwiki-reader/dochub.js'].slice('/wiki/'.length)).toString();
  assert.match(main, /pubwiki-reader\/share\.mjs/);
});
