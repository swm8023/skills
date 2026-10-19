import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Only these application-owned files are served; user input never becomes a filesystem path.
export const webAssets = new Map([
  ['dochub.css', 'text/css; charset=utf-8'],
  ['dochub.js', 'text/javascript; charset=utf-8']
].map(([name, type]) => {
  const bytes = readFileSync(new URL(`./public/${name}`, import.meta.url));
  return [name, { bytes, type, version: createHash('sha256').update(bytes).digest('hex').slice(0, 16) }];
}));
