import assert from 'node:assert/strict';
import {readFileSync, mkdtempSync, writeFileSync, rmSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {basename, dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import test from 'node:test';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('handoff uses one CLI export and has no retired storage extractor', () => {
  const skill = readFileSync(join(skillRoot, 'SKILL.md'), 'utf8');
  const examples = [...skill.matchAll(/^[ \t]*```text\r?\n([\s\S]*?)\r?\n[ \t]*```/gm)].map(match => match[1]);
  const commands = examples.filter(example => example.includes('wheelmaker cmd'));
  assert.equal(commands.length, 1);
  for (const part of ['--command handoff', '--action export', '--session-id SESSION_ID', '--output TEMP_JSON_PATH']) assert(commands[0].includes(part));
  assert(!existsSync(join(skillRoot, 'scripts/read-session.mjs')));
  assert(!existsSync(join(skillRoot, 'scripts/read-session.test.mjs')));
  assert(!skill.includes('node:sqlite'));
  assert(examples.some(example => example.includes('read-text-chunk.mjs') && example.includes('--start 0') && example.includes('--max-bytes 12000')));
});

test('JSON history can be completely read across UTF-8 byte boundaries', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'handoff-json-'));
  try {
    const document = {formatVersion: 1, snapshot: {storedTurns: 2, latestPersistedTurnIndex: 2}, turns: [{turnIndex: 1, param: {text: '中文🙂'.repeat(7000)}}, {turnIndex: 2, param: {text: 'finished'}}]};
    const original = Buffer.from(JSON.stringify(document) + '\n');
    const path = join(temporary, 'history.json');
    writeFileSync(path, original);
    let start = 0;
    const parts = [];
    while (start < original.length) {
      const run = spawnSync(process.execPath, [join(skillRoot, 'scripts/read-text-chunk.mjs'), path, '--start', String(start), '--max-bytes', '4093'], {encoding: 'utf8', windowsHide: true});
      assert.equal(run.status, 0, run.stderr);
      const header = /^--- bytes (\d+)-(\d+) of (\d+); next=(\d+) ---\r?\n/.exec(run.stdout);
      assert(header);
      const end = Number(header[2]);
      assert.equal(Number(header[1]), start);
      assert.equal(Number(header[3]), original.length);
      assert.equal(Number(header[4]), end);
      assert(end > start);
      const content = Buffer.from(run.stdout.slice(header[0].length, run.stdout.lastIndexOf('--- end chunk ---')));
      parts.push(content.subarray(0, end - start));
      start = end;
    }
    const complete = Buffer.concat(parts);
    assert.deepEqual(complete, original);
    const parsed = JSON.parse(complete.toString('utf8'));
    assert.equal(parsed.turns.length, parsed.snapshot.storedTurns);
    assert.equal(parsed.turns.length, parsed.snapshot.latestPersistedTurnIndex);
    const bad = spawnSync(process.execPath, [join(skillRoot, 'scripts/read-text-chunk.mjs'), path, '--start', String(original.length + 1)], {encoding: 'utf8', windowsHide: true});
    assert.notEqual(bad.status, 0);
  } finally {
    assert.equal(dirname(resolve(temporary)), resolve(tmpdir()));
    assert(basename(temporary).startsWith('handoff-json-'));
    rmSync(temporary, {recursive: true});
  }
});
