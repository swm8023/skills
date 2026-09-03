#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import { ensureFresh, queryIndex } from './index.mjs';

export async function dataviewQuery({ sql, env = process.env, gitUrl = '' } = {}) {
  const index = await ensureFresh({ env, gitUrl });
  const result = await queryIndex(sql, { env });
  return { mode: result.mode, index: index.paths.indexDir, rows: result.rows };
}

function parseCli(argv) {
  let sql = '';
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] !== '--sql') throw new Error(`unknown Dataview argument ${argv[index]}`);
    sql = argv[index + 1] || '';
    if (!sql || sql.startsWith('--')) throw new Error('--sql requires a read-only query');
    index += 1;
  }
  if (!sql) throw new Error('usage: node dataview.mjs --sql "SELECT ..."');
  return { sql };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    console.log(JSON.stringify(await dataviewQuery(parseCli(process.argv.slice(2))), null, 2));
  } catch (error) {
    console.error(error?.stack || error?.message || error);
    process.exitCode = 1;
  }
}
