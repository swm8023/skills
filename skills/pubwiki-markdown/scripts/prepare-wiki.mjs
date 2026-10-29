#!/usr/bin/env node
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ensureWikiState } from './wiki-state.mjs';

export function parseCli(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index++) {
    const flag = argv[index];
    if (flag === '--sync') options.sync = true;
    else if (flag === '--git-url' && argv[index + 1] && !argv[index + 1].startsWith('--')) options.gitUrl = argv[++index];
    else throw new Error('Usage: prepare-wiki.mjs [--git-url <URL>] [--sync]');
  }
  return options;
}

export const prepareWiki = options => ensureWikiState(options);

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = await prepareWiki(parseCli(process.argv.slice(2)));
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'ready') process.exitCode = 2;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
