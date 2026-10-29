#!/usr/bin/env node
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { invokeWikiCLI } from './wiki-runtime.mjs';

export function publishWiki({ requestedPaths = [], message, gitUrl, force = false, push = true, pull = true, ...options } = {}) {
  if (force || !push || !pull) return Promise.resolve({ status: 'blocked', message: 'Wiki publication requires the standard Go Git workflow; force-push and partial Git phases are unsupported.' });
  const args = ['wiki', 'publish-notes'];
  for (const name of requestedPaths) args.push('--paths', name);
  if (message) args.push('--message', message);
  if (gitUrl) args.push('--git-url', gitUrl);
  return invokeWikiCLI(args, options);
}

export function parseCli(argv) {
  const values = { requestedPaths: [] };
  for (let index = 0; index < argv.length; index++) {
    const flag = argv[index], value = argv[++index];
    if (!value || value.startsWith('--')) throw new Error('Wiki publish argument requires a value');
    if (flag === '--paths') values.requestedPaths.push(value);
    else if (flag === '--message') values.message = value;
    else if (flag === '--git-url') values.gitUrl = value;
    else throw new Error('Unknown Wiki publish argument');
  }
  if (!values.requestedPaths.length) throw new Error('Usage: publish-wiki.mjs --paths <repo-relative-file> ...');
  return values;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = await publishWiki(parseCli(process.argv.slice(2)));
    console.log(JSON.stringify(result, null, 2));
    if (result.status === 'blocked') process.exitCode = 2;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
