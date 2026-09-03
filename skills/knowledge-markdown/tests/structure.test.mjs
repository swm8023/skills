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

test('knowledge-markdown contains its active instructions and complete upstream material', async () => {
  const required = [
    'SKILL.md',
    'agents/openai.yaml',
    'references/UPSTREAM.md',
    'references/upstream-obsidian-markdown/SKILL.md',
    'references/upstream-obsidian-markdown/CALLOUTS.md',
    'references/upstream-obsidian-markdown/EMBEDS.md',
    'references/upstream-obsidian-markdown/PROPERTIES.md',
    'scripts/wiki-state.mjs',
    'scripts/prepare-wiki.mjs',
    'scripts/normalize-note.mjs',
    'scripts/publish-wiki.mjs',
    'scripts/ensure-quartz.mjs',
    'assets/quartz/quartz.config.ts',
    'assets/quartz/quartz.layout.ts',
    'assets/quartz/quartz/components/KnowledgeSidebarSwitch.tsx',
    'assets/quartz/quartz/components/KnowledgeTagSidebar.tsx',
  ];
  await Promise.all(required.map(mustExist));

  const active = await readFile(await mustExist('SKILL.md'), 'utf8');
  const upstream = await readFile(await mustExist('references/UPSTREAM.md'), 'utf8');
  assert.match(active, /name:\s*knowledge-markdown/u);
  assert.match(active, /knowledge\.yaml/u);
  assert.match(active, /wheelmaker wiki publish/u);
  assert.match(upstream, /a1dc48e68138490d522c04cbf5822214c6eb1202/u);
  assert.doesNotMatch(active, /(?:^|[\/`])(?:lookup-knowledge|publish-knowledge)(?:$|[\/`])/u);
  assert.doesNotMatch(active, /--(?:config|data)\b/u);
});
