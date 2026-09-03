#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import { ensureWikiState, syncCleanWiki } from './wiki-state.mjs';

function parseCli(argv) {
  let gitUrl = '';
  let sync = false;
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--sync') {
      sync = true;
      continue;
    }
    if (flag !== '--git-url') throw new Error(`unknown Wiki preparation argument ${flag}`);
    gitUrl = argv[index + 1] || '';
    if (!gitUrl || gitUrl.startsWith('--')) throw new Error('--git-url requires a value');
    index += 1;
  }
  return { gitUrl, sync };
}

export async function prepareWiki(options = {}) {
  const result = await ensureWikiState(options);
  if (result.status !== 'ready' || !options.sync) return result;
  try {
    const statusAfterSync = await syncCleanWiki(result.paths.data, options);
    return { ...result, synced: true, statusAfterSync };
  } catch (error) {
    return { ...result, status: 'blocked', synced: false, message: error.message };
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = await prepareWiki(parseCli(process.argv.slice(2)));
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'ready') process.exitCode = 2;
  } catch (error) {
    console.error(error?.stack || error?.message || error);
    process.exitCode = 1;
  }
}
