import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Quartz assets include a virtual home emitter without a source index.md', async () => {
  const config = await readFile(path.join(skillRoot, 'assets', 'quartz', 'quartz.config.ts'), 'utf8');
  await access(path.join(skillRoot, 'assets', 'quartz', 'quartz', 'emitters', 'KnowledgeHomePage.tsx'));
  assert.match(config, /KnowledgeHomePage/u);
  assert.doesNotMatch(config, /content\/index\.md/u);
});
