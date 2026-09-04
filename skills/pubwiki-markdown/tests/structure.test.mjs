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

test('pubwiki-markdown contains its active instructions and complete upstream material', async () => {
  const required = [
    'SKILL.md',
    'agents/openai.yaml',
    'references/UPSTREAM.md',
    'references/obsidian-markdown/obsidian-format.md',
    'references/obsidian-markdown/CALLOUTS.md',
    'references/obsidian-markdown/EMBEDS.md',
    'references/obsidian-markdown/PROPERTIES.md',
    'scripts/wiki-state.mjs',
    'scripts/prepare-wiki.mjs',
    'scripts/normalize-note.mjs',
    'scripts/publish-wiki.mjs',
    'scripts/ensure-quartz.mjs',
    'scripts/yaml.mjs',
    'scripts/pubwiki-core.mjs',
    'assets/quartz/quartz.config.yaml',
    'assets/quartz/quartz.ts',
    'assets/quartz/quartz.lock.json',
    'assets/quartz/quartz/wheelmaker/package.json',
    'assets/quartz/quartz/wheelmaker/index.mjs',
    'assets/quartz/quartz/wheelmaker/home.mjs',
    'assets/quartz/quartz/wheelmaker/components.mjs',
    'assets/quartz/quartz/wheelmaker/tags.mjs',
  ];
  await Promise.all(required.map(mustExist));

  const active = await readFile(await mustExist('SKILL.md'), 'utf8');
  const state = await readFile(await mustExist('scripts/wiki-state.mjs'), 'utf8');
  const yaml = await readFile(await mustExist('scripts/yaml.mjs'), 'utf8');
  const bundledCorePath = await mustExist('scripts/pubwiki-core.mjs');
  const bundledCore = await readFile(bundledCorePath, 'utf8');
  const canonicalCore = await readFile(path.join(skillRoot, '..', 'pubwiki-core', 'index.mjs'), 'utf8');
  const upstream = await readFile(await mustExist('references/UPSTREAM.md'), 'utf8');
  assert.match(active, /name:\s*pubwiki-markdown/u);
  assert.match(active, /wiki\.config\.yaml/u);
  assert.doesNotMatch(active, /knowledge\.yaml/u);
  assert.match(active, /wheelmaker wiki publish/u);
  assert.match(state, /pubwiki-core/u);
  assert.match(yaml, /pubwiki-core/u);
  assert.equal(bundledCore.trimEnd(), canonicalCore.trimEnd());
  assert.doesNotMatch(`${active}\n${bundledCore}`, /(?:D:\\Code\\skills|C:\\Users\\)/u);
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'pubwiki-markdown-structure-'));
  try {
    const isolatedSkill = path.join(tempRoot, 'skill');
    await cp(skillRoot, isolatedSkill, { recursive: true });
    const core = await import(`${pathToFileURL(path.join(isolatedSkill, 'scripts', 'pubwiki-core.mjs')).href}?structure-test=${Date.now()}`);
    assert.equal(core.WIKI_CONFIG_FILENAME, 'wiki.config.yaml');
    assert.equal(typeof core.resolveWikiPaths, 'function');
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
  assert.match(upstream, /a1dc48e68138490d522c04cbf5822214c6eb1202/u);
  assert.doesNotMatch(active, /(?:^|[\/`])(?:lookup-knowledge|publish-knowledge)(?:$|[\/`])/u);
  assert.doesNotMatch(active, /--(?:config|data)\b/u);
});
