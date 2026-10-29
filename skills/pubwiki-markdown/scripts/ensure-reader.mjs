#!/usr/bin/env node
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function ensureReader() {
  throw new Error('The Wiki reader is built-in to WheelMaker. Update WheelMaker and run wheelmaker wiki preview or publish; preparation is automatic. Legacy --install, --bind and --source are retired.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { await ensureReader(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
