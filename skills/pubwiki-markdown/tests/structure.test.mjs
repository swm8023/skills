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
  const upstream = await readFile(await mustExist('references/UPSTREAM.md'), 'utf8');
  assert.match(active, /name:\s*pubwiki-markdown/u);
  assert.match(active, /wiki\.config\.yaml/u);
  assert.doesNotMatch(active, /knowledge\.yaml/u);
  assert.match(active, /wheelmaker wiki publish/u);
  assert.match(upstream, /a1dc48e68138490d522c04cbf5822214c6eb1202/u);
  assert.doesNotMatch(active, /(?:^|[\/`])(?:lookup-knowledge|publish-knowledge)(?:$|[\/`])/u);
  assert.doesNotMatch(active, /--(?:config|data)\b/u);
});
