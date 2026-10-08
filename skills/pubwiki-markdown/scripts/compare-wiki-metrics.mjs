// Compare reports from measure-wiki.mjs using the same browser and compression.
// node scripts/compare-wiki-metrics.mjs --before <json> --after <json> --report <json>
import { readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: Object.fromEntries(['before', 'after', 'report'].map(name => [name, { type: 'string' }])) });
for (const name of ['before', 'after', 'report']) if (!values[name]) throw new Error(`--${name} is required`);
const before = JSON.parse(await readFile(values.before, 'utf8'));
const after = JSON.parse(await readFile(values.after, 'utf8'));
for (const key of ['browser', 'compression', 'viewport', 'scope']) {
  if (before.environment[key] !== after.environment[key]) throw new Error(`Incomparable environment: ${key}`);
}
const query = after.environment.query || after.samples[0].firstQuery.query;
if ((before.environment.query || before.samples[0].firstQuery.query) !== query) throw new Error('Queries must match');
const a = before.summary, b = after.summary;
const change = (old, current) => ({ before: old, after: current, changePercent: old ? Math.round((current / old - 1) * 1000) / 10 : null });
const searchBytes = summary => summary.searchOpen.encodedBodyBytes + summary.firstQuery.encodedBodyBytes;
const searchRequests = summary => summary.searchOpen.requests + summary.firstQuery.requests;
const metrics = {
  htmlBytes: change(a.htmlBytes, b.htmlBytes),
  htmlGzipBytes: change(a.htmlGzipBytes, b.htmlGzipBytes),
  coldBodyBytes: change(a.cold.encodedBodyBytes, b.cold.encodedBodyBytes),
  coldRequests: change(a.cold.requests, b.cold.requests),
  initialElements: change(a.cold.elements, b.cold.elements),
  initialTagElements: change(a.cold.tagElements, b.cold.tagElements),
  emptySearchBodyBytes: change(a.searchOpen.encodedBodyBytes, b.searchOpen.encodedBodyBytes),
  searchThroughFirstResultBodyBytes: change(searchBytes(a), searchBytes(b)),
  searchThroughFirstResultRequests: change(searchRequests(a), searchRequests(b)),
  firstQueryLatencyMs: change(a.firstQuery.resultLatencyMs, b.firstQuery.resultLatencyMs),
  warmRequests: change(a.warm.requests, b.warm.requests),
  warmBodyBytes: change(a.warm.encodedBodyBytes, b.warm.encodedBodyBytes),
  hoverThenClickRequests: change(a.hoverThenClick.requests, b.hoverThenClick.requests),
  coldDOMContentLoadedMs: change(a.cold.navigation.domContentLoadedMs, b.cold.navigation.domContentLoadedMs),
  warmDOMContentLoadedMs: change(a.warm.navigation.domContentLoadedMs, b.warm.navigation.domContentLoadedMs),
};
const gates = [
  ['HTML at least 20% smaller', b.htmlBytes <= a.htmlBytes * 0.8],
  ['Cold body at least 15% smaller', b.cold.encodedBodyBytes <= a.cold.encodedBodyBytes * 0.85],
  ['At most 5 cold requests', b.cold.requests <= 5],
  ['Initial DOM at least 10% smaller', b.cold.elements <= a.cold.elements * 0.9],
  ['No empty search requests', b.searchOpen.requests === 0 && b.searchOpen.encodedBodyBytes === 0],
  ['No requests to open tags', b.tagsOpen.requests === 0],
  ['One warm validation with no body download', b.warm.requests <= 1 && b.warm.encodedBodyBytes === 0],
  ['One request for navigation card hover and click', b.hoverThenClick.requests <= 1],
].map(([criterion, passed]) => ({ criterion, passed }));
const report = { version: 1, recordedAt: new Date().toISOString(), query, environment: after.environment, metrics, gates,
  notes: ['Network bytes exclude transport headers and the host application.', 'Warm cache results require the Registry cache change to be deployed.', 'Search compares opening plus the first query; candidate text increases request count.', 'Timing is diagnostic, has no pass/fail threshold and includes the search debounce.'] };
await writeFile(values.report, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (gates.some(gate => !gate.passed)) process.exitCode = 1;
