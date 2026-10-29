#!/usr/bin/env node
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { serveWikiPreview } from './wiki-runtime.mjs';

export const previewReader = options => serveWikiPreview(options);

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    if (process.argv.length > 2) throw new Error('Usage: preview-reader.mjs');
    await previewReader();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
