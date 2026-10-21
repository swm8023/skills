import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

export const runWikiCLI = async (args, { env = process.env } = {}) => promisify(execFile)(env.WHEELMAKER_CLI || process.env.WHEELMAKER_CLI || 'wheelmaker', args,
  { env: { ...process.env, ...env }, windowsHide: true, timeout: 600000, maxBuffer: 1024 * 1024 });

export async function inspectWikiConfiguration({ env = process.env, runCLI = runWikiCLI } = {}) {
  const { stdout } = await runCLI(['wiki', 'status'], { env });
  const result = JSON.parse(stdout);
  if (result.status !== 'ready' || !['auto', 'manual', 'off', 'disabled', 'false'].includes(result.publishMode))
    throw new Error('WheelMaker did not return a valid Wiki policy; update WheelMaker');
  return { publishMode: result.publishMode };
}
