import os from 'node:os';
import path from 'node:path';
import { invokeWikiCLI } from './wiki-runtime.mjs';

export const WIKI_CONFIG_FILENAME = 'wiki.config.yaml';

export function resolveHome({ env = process.env } = {}) {
  const candidate = process.platform === 'win32' ? (env.USERPROFILE || env.HOME) : (env.HOME || env.USERPROFILE);
  return path.resolve(candidate || os.homedir());
}

// Pure paths remain available to note-writing helpers; Go owns all preparation.
export function resolveWikiPaths(options = {}) {
  const home = resolveHome(options), wiki = path.join(home, '.wheelmaker', 'wiki'), data = path.join(wiki, 'data');
  return { home, wiki, data, config: path.join(data, WIKI_CONFIG_FILENAME), content: path.join(data, 'content'),
    assets: path.join(data, 'content', 'assets'), index: path.join(wiki, '.index'),
    reader: path.join(wiki, 'reader'), output: path.join(wiki, '.output') };
}

export function ensureWikiState({ gitUrl = '', sync = false, ...options } = {}) {
  const args = ['wiki', 'prepare'];
  if (gitUrl) args.push('--git-url', gitUrl);
  if (sync) args.push('--sync');
  return invokeWikiCLI(args, options);
}
