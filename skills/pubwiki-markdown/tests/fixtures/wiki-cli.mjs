import { readFile } from 'node:fs/promises';
import { parseWikiConfig } from '../../scripts/yaml.mjs';
import { resolveWikiPaths } from '../../scripts/wiki-state.mjs';

// Substitute only the external CLI boundary in synthetic Git workflow fixtures.
// The corresponding Go tests cover real private configuration parsing.
export async function fixtureWikiCLI(args, { env }) {
  if (args.join(' ') !== 'wiki status') throw new Error('Unexpected fixture CLI operation');
  const paths = resolveWikiPaths({ env });
  const config = parseWikiConfig(await readFile(paths.config, 'utf8'));
  let mode = config.publish === false ? 'false' : config.publish?.mode ?? 'auto';
  mode = typeof mode === 'boolean' ? mode ? 'auto' : 'false' : mode.toLowerCase();
  return { stdout: JSON.stringify({ status: 'ready', publishMode: mode }) };
}
