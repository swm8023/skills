import assert from 'node:assert/strict';
import { access, cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function mustExist(relativePath) {
  const filename = path.join(skillRoot, relativePath);
  await access(filename);
  return filename;
}

test('pubwiki-search contains its active instructions and complete upstream material', async () => {
  const required = [
    'SKILL.md',
    'agents/openai.yaml',
    'references/UPSTREAM.md',
    'references/upstream-vault-search/README.md',
    'references/upstream-vault-search/SKILL.md',
    'references/upstream-vault-search/scripts/dataview.py',
    'references/upstream-vault-search/scripts/index.py',
    'references/upstream-vault-search/scripts/search.py',
    'scripts/wiki-state.mjs',
    'scripts/index.mjs',
    'scripts/search.mjs',
    'scripts/dataview.mjs',
    'scripts/yaml.mjs',
    'scripts/pubwiki-core.mjs',
  ];
  await Promise.all(required.map(mustExist));

  const active = await readFile(await mustExist('SKILL.md'), 'utf8');
  const state = await readFile(await mustExist('scripts/wiki-state.mjs'), 'utf8');
  const yaml = await readFile(await mustExist('scripts/yaml.mjs'), 'utf8');
  const bundledCorePath = await mustExist('scripts/pubwiki-core.mjs');
  const bundledCore = await readFile(bundledCorePath, 'utf8');
  const canonicalCore = await readFile(path.join(skillRoot, '..', 'pubwiki-core', 'index.mjs'), 'utf8');
  const upstream = await readFile(await mustExist('references/UPSTREAM.md'), 'utf8');
  assert.match(active, /name:\s*pubwiki-search/u);
  assert.match(active, /Obsidian/u);
  assert.match(active, /index/u);
  assert.match(active, /wiki\.config\.yaml/u);
  assert.doesNotMatch(active, /knowledge\.yaml/u);
  assert.match(state, /pubwiki-core/u);
  assert.match(yaml, /pubwiki-core/u);
  assert.equal(bundledCore.trimEnd(), canonicalCore.trimEnd());
  assert.match(bundledCore, /wiki\.config\.yaml/u);
  assert.doesNotMatch(bundledCore, /knowledge\.yaml/u);
  assert.doesNotMatch(`${active}\n${bundledCore}`, /(?:D:\\Code\\skills|C:\\Users\\)/u);
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'pubwiki-search-structure-'));
  try {
    const isolatedSkill = path.join(tempRoot, 'skill');
    await cp(skillRoot, isolatedSkill, { recursive: true });
    const core = await import(`${pathToFileURL(path.join(isolatedSkill, 'scripts', 'pubwiki-core.mjs')).href}?structure-test=${Date.now()}`);
    assert.equal(core.WIKI_CONFIG_FILENAME, 'wiki.config.yaml');
    assert.equal(typeof core.resolveWikiPaths, 'function');
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
  assert.match(bundledCore, /site\.title/u);
  assert.match(upstream, /03a22a8b563d1657cd1840b9f65000347a15a3b4/u);
  assert.doesNotMatch(active, /(?:^|[\/`])(?:lookup-knowledge|publish-knowledge)(?:$|[\/`])/u);
  assert.doesNotMatch(active, /--(?:config|data)\b/u);
});
