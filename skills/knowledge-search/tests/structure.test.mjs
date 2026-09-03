import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function mustExist(relativePath) {
  const filename = path.join(skillRoot, relativePath);
  await access(filename);
  return filename;
}

test('knowledge-search contains its active instructions and complete upstream material', async () => {
  const required = [
    'SKILL.md',
    'agents/openai.yaml',
    'references/UPSTREAM.md',
    'references/upstream-vault-search/README.md',
    'references/upstream-vault-search/SKILL.md',
    'references/upstream-vault-search/scripts/dataview.py',
    'references/upstream-vault-search/scripts/index.py',
    'references/upstream-vault-search/scripts/search.py',
  ];
  await Promise.all(required.map(mustExist));

  const active = await readFile(await mustExist('SKILL.md'), 'utf8');
  const upstream = await readFile(await mustExist('references/UPSTREAM.md'), 'utf8');
  assert.match(active, /name:\s*knowledge-search/u);
  assert.match(active, /Obsidian/u);
  assert.match(active, /index/u);
  assert.match(upstream, /03a22a8b563d1657cd1840b9f65000347a15a3b4/u);
  assert.doesNotMatch(active, /(?:^|[\/`])(?:lookup-knowledge|publish-knowledge)(?:$|[\/`])/u);
  assert.doesNotMatch(active, /--(?:config|data)\b/u);
});
