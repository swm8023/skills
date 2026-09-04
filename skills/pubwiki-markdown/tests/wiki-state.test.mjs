import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { access, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';

import { ensureWikiState, resolveWikiPaths } from '../scripts/wiki-state.mjs';
import { parseKnowledgeConfig } from '../scripts/yaml.mjs';

const run = promisify(execFile);

async function makeHome(t) {
  const home = await import('node:fs/promises').then(({ mkdtemp }) => mkdtemp(path.join(os.tmpdir(), 'pubwiki-markdown-home-')));
  t.after(() => import('node:fs/promises').then(({ rm }) => rm(home, { recursive: true, force: true })));
  return home;
}

async function initGit(directory) {
  await mkdir(directory, { recursive: true });
  await run('git', ['init', '--initial-branch=main', directory]);
  await run('git', ['-C', directory, 'config', 'user.email', 'test@example.invalid']);
  await run('git', ['-C', directory, 'config', 'user.name', 'Knowledge Test']);
  await writeFile(path.join(directory, '.gitkeep'), 'fixture\n');
  await run('git', ['-C', directory, 'add', '.gitkeep']);
  await run('git', ['-C', directory, 'commit', '-m', 'fixture']);
}

test('fixed state stops before creating data for a missing Git worktree', async (t) => {
  const home = await makeHome(t);
  const result = await ensureWikiState({ env: { USERPROFILE: home, HOME: home } });
  const paths = resolveWikiPaths({ env: { USERPROFILE: home, HOME: home } });
  assert.equal(result.status, 'needs-git-url');
  await assert.rejects(() => stat(paths.data), { code: 'ENOENT' });
});

test('empty fixed data can be cloned from an explicitly supplied Git URL', async (t) => {
  const home = await makeHome(t);
  const source = path.join(home, 'source.git');
  await initGit(source);
  const paths = resolveWikiPaths({ env: { USERPROFILE: home, HOME: home } });
  await mkdir(paths.data, { recursive: true });

  const result = await ensureWikiState({
    env: { USERPROFILE: home, HOME: home },
    gitUrl: source,
  });
  assert.equal(result.status, 'ready');
  assert.equal(result.cloned, true);
  assert.equal(await stat(path.join(paths.data, '.git')).then((info) => info.isDirectory()), true);
  assert.match(await readFile(paths.config, 'utf8'), /publish:\s*$/mu);
});

test('nonempty non-Git data is not changed', async (t) => {
  const home = await makeHome(t);
  const paths = resolveWikiPaths({ env: { USERPROFILE: home, HOME: home } });
  await mkdir(paths.data, { recursive: true });
  const marker = path.join(paths.data, 'keep.txt');
  await writeFile(marker, 'do not touch\n');

  const result = await ensureWikiState({
    env: { USERPROFILE: home, HOME: home },
    gitUrl: path.join(home, 'does-not-matter.git'),
  });
  assert.equal(result.status, 'blocked');
  assert.equal(await readFile(marker, 'utf8'), 'do not touch\n');
  await assert.rejects(() => stat(paths.config), { code: 'ENOENT' });
});

test('a valid Git data root creates only missing default directories and config', async (t) => {
  const home = await makeHome(t);
  const paths = resolveWikiPaths({ env: { USERPROFILE: home, HOME: home } });
  await initGit(paths.data);

  const result = await ensureWikiState({ env: { USERPROFILE: home, HOME: home } });
  assert.equal(result.status, 'ready');
  assert.equal(result.cloned, false);
  assert.equal(await stat(paths.content).then((info) => info.isDirectory()), true);
  assert.equal(await stat(paths.assets).then((info) => info.isDirectory()), true);
  assert.equal(await stat(paths.config).then((info) => info.isFile()), true);
  assert.match(await readFile(paths.config, 'utf8'), /^site:\s*$/mu);
  assert.match(await readFile(paths.config, 'utf8'), /title:\s*WheelMaker Knowledge/u);
  await assert.rejects(() => stat(path.join(paths.data, 'knowledge.yaml')), { code: 'ENOENT' });
});

test('a legacy knowledge.yaml is ignored by the hard-cutover state path', async (t) => {
  const home = await makeHome(t);
  const paths = resolveWikiPaths({ env: { USERPROFILE: home, HOME: home } });
  await initGit(paths.data);
  await writeFile(path.join(paths.data, 'knowledge.yaml'), 'this legacy file is ignored\n');

  const result = await ensureWikiState({ env: { USERPROFILE: home, HOME: home } });
  assert.equal(result.status, 'ready');
  assert.equal(result.paths.config, path.join(paths.data, 'wiki.config.yaml'));
  assert.equal(await stat(paths.config).then((info) => info.isFile()), true);
  assert.equal(await readFile(path.join(paths.data, 'knowledge.yaml'), 'utf8'), 'this legacy file is ignored\n');
});

test('a malformed existing wiki.config.yaml stops before content initialization', async (t) => {
  const home = await makeHome(t);
  const paths = resolveWikiPaths({ env: { USERPROFILE: home, HOME: home } });
  await initGit(paths.data);
  await writeFile(paths.config, 'this is not yaml\n');

  const result = await ensureWikiState({ env: { USERPROFILE: home, HOME: home } });
  assert.equal(result.status, 'blocked');
  assert.match(result.message, /malformed/u);
  await assert.rejects(() => stat(paths.content), { code: 'ENOENT' });
});

test('validates site settings as non-empty strings', () => {
  const config = parseKnowledgeConfig(`site:\n  title: My Knowledge Base\n  description: A custom description\n`, 'wiki.config.yaml');
  assert.deepEqual(config.site, {
    title: 'My Knowledge Base',
    description: 'A custom description',
  });

  assert.throws(
    () => parseKnowledgeConfig('site:\n  title: 42\n', 'wiki.config.yaml'),
    /wiki\.config\.yaml site\.title.*string/u,
  );
  assert.throws(
    () => parseKnowledgeConfig('site:\n  description: "  "\n', 'wiki.config.yaml'),
    /wiki\.config\.yaml site\.description.*non-empty/u,
  );
});

test('rejects syntactically invalid YAML instead of accepting any line with a colon', async (t) => {
  const home = await makeHome(t);
  const paths = resolveWikiPaths({ env: { USERPROFILE: home, HOME: home } });
  await initGit(paths.data);
  await writeFile(paths.config, 'publish: [\n');

  const result = await ensureWikiState({ env: { USERPROFILE: home, HOME: home } });
  assert.equal(result.status, 'blocked');
  assert.match(result.message, /malformed|YAML|bracket/iu);
  await assert.rejects(() => stat(paths.content), { code: 'ENOENT' });
});
