---
name: pubwiki-search
description: Search the fixed local WheelMaker Obsidian Vault using Obsidian first and an automatically maintained local index second. Use for keyword or metadata note search, tag/folder/property lookup, related knowledge, and Dataview-style queries.
---

# pubwiki-search

This Skill incorporates the complete copied `vault-search` Skill, README, and
scripts under `references/upstream-vault-search/`. Read that material when the
request needs its semantic-search or Dataview examples. The active implementation
below extends it with fixed local discovery, Obsidian-first lookup, automatic
freshness, and a dependency-free local fallback. The active local fallback is
lexical and metadata-based in this release; it does not install or invoke an
embedding model.

## Fixed target and safety

The only Vault is:

```text
~/.wheelmaker/wiki/data/
```

The `data/` directory must itself be a valid Git worktree. Check Git before reading
configuration or building an index. A missing `knowledge.yaml` is initialized with
the same commented default used by `pubwiki-markdown`; a non-Git nonempty path is
never changed. Do not search another Vault, the current working directory, or the
whole machine.

The persistent search index is private and outside the Wiki repository:

```text
~/.wheelmaker/wiki/.index/<data-root-fingerprint>/
├── index.db
└── manifest.json
```

Never put this index, a Quartz runtime, credentials, or generated site files into
`data/` or the public Quartz output.

## Search order

1. For a plain text request that Obsidian can express, run the official Obsidian
   CLI from the fixed data directory and return its paths/results. The CLI must be
   available and the target Vault must answer within a short timeout.
2. If Obsidian is unavailable, the request needs metadata/semantic behavior the
   CLI cannot express, or the CLI response cannot be parsed, call the local
   fallback. The fallback automatically runs `ensureFresh` before querying.
3. Do not ask the user to create, rebuild, or repair the index as a normal search
   step. Report an actionable error only when both native search and the local
   fallback cannot operate. If refresh fails but a previous local index is valid,
   return its results with an explicit stale warning.

Use the active scripts from this Skill directory:

```text
node <this-skill>/scripts/search.mjs --query "..."
node <this-skill>/scripts/dataview.mjs --sql "SELECT ..."
```

The active interface discovers all paths itself. It does not accept a caller
selected Vault or database path.

## Index contract

The scanner accepts only Markdown below `data/content/`. It excludes `.git/`,
`.obsidian/`, `content/assets/`, and derived/private directories. Drafts remain
searchable locally. Each note records its relative path, folder, filename, title,
description, date, draft state, tags, frontmatter, body text, size, modification
time, and content digest.

The indexer stores a SQLite FTS5 text index when the local Node runtime supports
it, with a pure local lexical fallback if it does not. Keyword, tag, folder,
property, and full-text search are supported locally; embedding/semantic vectors
are an explicit future extension, not an implicit dependency. Queries never
download a model or call a remote API.

`manifest.json` records `sourceRoot`, `relativePath`, `size`, `modified`,
`contentDigest`, `parserVersion`, `indexVersion`, and `modelVersion`. On each
query, `ensureFresh` detects additions, changes, deletions, renames, and version
changes. It updates only changed records after scanning the fixed content root,
removes deleted records, and rebuilds internally when a version change requires it.
A single-root lock, SQLite transaction,
and atomic manifest replacement preserve the last valid result after interruption.

## Result contract

Return paths relative to the fixed `data/` root together with title, folder, tags,
matching text, and relevance when available. Native Obsidian results retain their
native match information. Local results explicitly identify lexical/degraded mode.
Local drafts may appear; public Quartz
content and its `contentIndex.json` must never be treated as the local AI index.

## Dataview-compatible queries

Preserve the upstream Dataview-style SQL use cases for note metadata, tags, folders,
status, dates, and arbitrary stored frontmatter. The active script ensures the
index is fresh first and uses the fixed private database. Do not expose or request
machine-specific upstream paths. SQL errors are returned without modifying the
Vault or index.

## Scope boundary

This Skill is read-only with respect to notes and Git content. It may create or
update only its private derived index. It does not publish, open an editor, modify
WheelMaker UI, or call Registry upload APIs.
