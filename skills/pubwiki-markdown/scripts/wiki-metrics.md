# Wiki loading metrics

Measure exported HTML snapshots only. Do not pass a vault, Markdown input,
configuration file or credentials to the benchmark browser.

## Repeatable comparison

1. Keep the previous published export as the baseline.
2. Export the new version. To isolate asset changes without reading Markdown,
   `prepare-wiki-comparison.mjs` can combine the baseline HTML with assets from a
   synthetic Quartz build. Its output directory must not exist.
3. Run `measure-wiki.mjs` against each export using the same browser executable,
   viewport and query. Use three runs; compare medians.
4. Run `compare-wiki-metrics.mjs`. It writes the comparison and exits nonzero if
   a structural or transfer budget fails.

```powershell
node scripts/measure-wiki.mjs --root before-export --article FalxEngine/RustStudy/Lesson-A.html --playwright playwright/index.mjs --browser msedge.exe --report before.json --runs 3 --query rustup
node scripts/measure-wiki.mjs --root after-export --article FalxEngine/RustStudy/Lesson-A.html --playwright playwright/index.mjs --browser msedge.exe --report after.json --runs 3 --query rustup
node scripts/compare-wiki-metrics.mjs --before before.json --after after.json --report comparison.json
```

Replace the export, Playwright and browser paths with local installed paths.
Repeat with `--query cargo` to cover a broad query. The recorded numeric
comparison is in `tests/fixtures/wiki-load-comparison.json`.

## Definitions and budgets

| Metric | Definition | Budget relative to the original export |
| --- | --- | --- |
| HTML bytes | Decoded response, including inline data | At least 20% smaller |
| Cold body bytes | Compressed bodies; excludes headers and host app | At least 15% smaller |
| Cold requests | Network requests, excluding memory/disk cache hits | At most 5 |
| Initial elements | DOM after scripts initialize | At least 10% fewer |
| Empty search | Opening search without entering text | Zero requests |
| Tag panel | First opening; tree builds from inline compact data | Zero requests |
| Warm reload | Current HTML revalidated; hashed assets cached | At most 1 request, zero body bytes |
| Navigation card | Hover followed by click | At most 1 request |

Warm and navigation budgets emulate the new Registry caching policy. Until that
server change is deployed, hashed assets still revalidate online. Authentication
continues to apply; HTML, metadata and search text remain `private, no-cache`.

Search transfer compares **opening plus the first query**, because the previous
version fetched its whole index on opening. Report request count as well as bytes:
the candidate index reduces transfer but needs individual text requests. Preserve
the same result order and top eight; stop fetching only when a score upper bound
proves remaining candidates cannot enter those results. Queries with many false
candidates may still fetch substantial text.

Timing and CPU metrics are diagnostic, not pass/fail budgets. The first query now
includes a 150 ms input debounce and lazy index loading; the previous query timing
was measured after its index had already loaded on opening. Cold timings can be
affected by external resources in the baseline. Do not compare local gzip numbers
directly with a single remote zstd capture or claim a stable warm CPU improvement.

Detailed reports include resource rows and three raw samples. Repository fixtures
retain only numbers, environments and gates, without article bodies or credentials.
