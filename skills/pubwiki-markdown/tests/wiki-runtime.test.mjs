import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectWikiConfiguration } from '../scripts/wiki-runtime.mjs';

test('configuration inspection receives only bounded publication policy from the local CLI', async () => {
  const policy = await inspectWikiConfiguration({ runCLI: async args => {
    assert.deepEqual(args, ['wiki', 'status']);
    return { stdout: JSON.stringify({ status: 'ready', publishMode: 'manual', privateConfiguration: 'must-not-propagate' }) };
  } });
  assert.deepEqual(policy, { publishMode: 'manual' });
});

test('unknown policy and failed configuration checks cannot become an automatic publish', async () => {
  await assert.rejects(inspectWikiConfiguration({ runCLI: async () => ({ stdout: '{"status":"ready","publishMode":"private-secret"}' }) }), /valid Wiki policy/);
  await assert.rejects(inspectWikiConfiguration({ runCLI: async () => { throw new Error('private-error-canary'); } }), /update WheelMaker/);
});
