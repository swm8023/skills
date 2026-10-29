import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const upgradeMessage = 'Unable to use the built-in Wiki commands; update WheelMaker and check the authenticated CLI.';

export async function runWikiCLI(args, { env = process.env } = {}) {
  let result;
  try {
    result = await promisify(execFile)(env.WHEELMAKER_CLI || process.env.WHEELMAKER_CLI || 'wheelmaker', args,
      { env: { ...process.env, ...env }, windowsHide: true, timeout: 600000, maxBuffer: 1024 * 1024 });
  } catch (error) {
    // Only the Go command's bounded JSON result can cross this boundary.
    result = { stdout: error.stdout || '' };
  }
  try {
    const value = JSON.parse(result.stdout);
    if (!['ready', 'published', 'skipped', 'blocked'].includes(value.status)) throw new Error();
    return { stdout: result.stdout };
  } catch {
    throw new Error(upgradeMessage);
  }
}

export async function invokeWikiCLI(args, { env = process.env, runCLI = runWikiCLI } = {}) {
  try {
    const { stdout } = await runCLI(args, { env });
    const result = JSON.parse(stdout);
    if (!['ready', 'published', 'skipped', 'blocked'].includes(result.status)) throw new Error();
    return result;
  } catch {
    throw new Error(upgradeMessage);
  }
}

export async function inspectWikiConfiguration(options = {}) {
  const result = await invokeWikiCLI(['wiki', 'status'], options);
  if (result.status !== 'ready' || !['auto', 'manual', 'off', 'disabled', 'false'].includes(result.publishMode))
    throw new Error('WheelMaker did not return a valid Wiki policy; update WheelMaker');
  return { publishMode: result.publishMode };
}

export function serveWikiPreview({ env = process.env } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(env.WHEELMAKER_CLI || process.env.WHEELMAKER_CLI || 'wheelmaker', ['wiki', 'preview', '--serve'],
      { env: { ...process.env, ...env }, windowsHide: true, stdio: 'inherit' });
    const interrupt = () => child.kill('SIGINT');
    const terminate = () => child.kill('SIGTERM');
    process.on('SIGINT', interrupt);
    process.on('SIGTERM', terminate);
    const cleanup = () => { process.off('SIGINT', interrupt); process.off('SIGTERM', terminate); };
    child.once('error', () => { cleanup(); reject(new Error(upgradeMessage)); });
    child.once('exit', (code, signal) => {
      cleanup();
      if (code === 0 || signal === 'SIGINT' || signal === 'SIGTERM') resolve();
      else reject(new Error(upgradeMessage));
    });
  });
}
