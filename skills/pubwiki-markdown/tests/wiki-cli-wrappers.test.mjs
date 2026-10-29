import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';
import { prepareWiki } from '../scripts/prepare-wiki.mjs';
import { publishWiki, parseCli } from '../scripts/publish-wiki.mjs';
import { ensureReader } from '../scripts/ensure-reader.mjs';
import { runWikiCLI } from '../scripts/wiki-runtime.mjs';

// A real subprocess stands in for the separately distributed Go CLI. It never
// reads Wiki files; Go's real Git/configuration suites cover those operations.
async function fixture(t, result, exitCode = 0) {
  const root = await mkdtemp(path.join(tmpdir(), 'wiki-cli-boundary-'));
  t.after(() => rm(root, { recursive: true, force: true, maxRetries: 10 }));
  const record = path.join(root, 'args.json');
  const entry = path.join(root, 'cli.mjs');
  await writeFile(entry, `import {writeFileSync} from 'node:fs';
import path from 'node:path';
if (path.basename(process.argv[1]) === 'wiki') {
writeFileSync(process.env.WM_TEST_CLI_RECORD, JSON.stringify([path.basename(process.argv[1]), ...process.argv.slice(2)]));
console.log(process.env.WM_TEST_CLI_RESULT);
console.error('private-stderr-canary');
process.exit(Number(process.env.WM_TEST_CLI_EXIT)); }`);
  const env = { USERPROFILE: root, HOME: root, WHEELMAKER_CLI: process.execPath,
    NODE_OPTIONS: `--import=${pathToFileURL(entry).href}`, WM_TEST_CLI_RECORD: record,
    WM_TEST_CLI_RESULT: JSON.stringify(result), WM_TEST_CLI_EXIT: String(exitCode) };
  return { env, args: async () => JSON.parse(await readFile(record, 'utf8')) };
}

test('preparation delegates the explicit URL and clean sync to Go without reading a vault', async t => {
  const value = await fixture(t, { status: 'ready', publishMode: 'auto', paths: { data: 'from-go' }, synced: true });
  const result = await prepareWiki({ env: value.env, gitUrl: 'https://example.invalid/notes.git', sync: true });
  assert.equal(result.status, 'ready');
  assert.equal(result.paths.data, 'from-go');
  assert.deepEqual(await value.args(), ['wiki', 'prepare', '--git-url', 'https://example.invalid/notes.git', '--sync']);
});

test('publication delegates repeated exact paths and literal commit messages to Go', async t => {
  const value = await fixture(t, { status: 'published', pushed: true });
  const result = await publishWiki({ env: value.env, requestedPaths: ['content/repo/a.md', 'content/assets/repo/a.png'], message: 'note: `literal` $(literal)' });
  assert.equal(result.status, 'published');
  assert.deepEqual(await value.args(), ['wiki', 'publish-notes', '--paths', 'content/repo/a.md', '--paths', 'content/assets/repo/a.png', '--message', 'note: `literal` $(literal)']);
});

test('Go policy skips and structured failures survive the process exit status', async t => {
  for (const [status, code] of [['skipped', 0], ['blocked', 2]]) {
    const value = await fixture(t, { status, mode: 'off', message: 'approved safe message' }, code);
    const result = await publishWiki({ env: value.env, requestedPaths: ['content/repo/a.md'] });
    assert.equal(result.status, status);
    assert.doesNotMatch(JSON.stringify(result), /private-stderr-canary/);
  }
});

test('an outdated CLI or malformed response fails with an upgrade message', async t => {
  const value = await fixture(t, {}, 1);
  await assert.rejects(runWikiCLI(['wiki', 'prepare'], { env: value.env }), /update WheelMaker/i);
});

test('legacy reader installation and binding options fail before invoking a CLI', async () => {
  for (const options of [{ install: true }, { bind: true }, { source: 'private-source-canary' }]) {
    await assert.rejects(ensureReader(options), /built.in|内置/i);
  }
});

test('preview proxy launches only the Go loopback-serving command', async t => {
  const value = await fixture(t, { status: 'ready', preview: 'http://127.0.0.1:1234/wiki/' });
  const entry = new URL('../scripts/preview-reader.mjs', import.meta.url);
  const { stdout } = await promisify(execFile)(process.execPath, [entry.pathname.replace(/^\/(\w:)/, '$1')],
    { env: { ...process.env, ...value.env }, windowsHide: true });
  assert.equal(JSON.parse(stdout).preview, 'http://127.0.0.1:1234/wiki/');
  assert.deepEqual(await value.args(), ['wiki', 'preview', '--serve']);
});

test('publication parser preserves repeated paths and refuses missing or unknown arguments', () => {
  assert.deepEqual(parseCli(['--paths', 'content/a.md', '--paths', 'content/b.md', '--message', 'approved']),
    { requestedPaths: ['content/a.md', 'content/b.md'], message: 'approved' });
  for (const args of [[], ['--paths'], ['--data', 'private'], ['--force', 'yes']]) assert.throws(() => parseCli(args));
});

test('unsupported force or partial Git requests never invoke the CLI', async () => {
  for (const options of [{ force: true }, { pull: false }, { push: false }]) {
    const result = await publishWiki({ ...options, runCLI: () => { throw new Error('must not run'); } });
    assert.equal(result.status, 'blocked');
  }
});
