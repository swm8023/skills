---
name: knowledge-markdown
description: Create, import, classify, normalize, and publish durable knowledge in the fixed WheelMaker Wiki Vault. Use when a user asks to record project knowledge, import Markdown or Wiki material, organize notes, maintain tags, or publish confirmed notes.
---

# knowledge-markdown

This Skill combines the complete Obsidian Markdown guidance in
`references/obsidian-markdown/obsidian-format.md` and its three linked references
with the WheelMaker knowledge workflow below. Read the upstream reference when
editing Obsidian-specific syntax; the rules below add the repository, confirmation,
and publishing contract.

## Fixed workspace

The only data root is:

```text
~/.wheelmaker/wiki/data/
```

Treat it as an Obsidian Vault. Do not discover another Vault, scan the current
working directory, or accept a caller-selected data root. The Wiki Git root must
be the `data/` directory itself.

Run the fixed-path preparation helper before reading or writing knowledge:

```text
node <this-skill>/scripts/prepare-wiki.mjs
```

The helper checks Git before configuration or content. If the path is missing or
empty, ask for a Git URL and pass that URL to the helper. If the path is nonempty
and not a Git worktree, stop without deleting, moving, or overwriting anything.
Without a URL, tell the user to prepare or initialize the Git worktree themselves;
do not run `git init` automatically.

When a publish operation is planned, synchronize the clean Git worktree before
the confirmed note write:

```text
node <this-skill>/scripts/prepare-wiki.mjs --sync
```

This command refuses to stash or rebase over existing changes. A rebase or remote
conflict is reported for the user to resolve.

After Git succeeds, the helper creates a commented `knowledge.yaml`,
`content/`, and `content/assets/` only when they are missing. Existing configuration
is never silently replaced. The data root is the only content configuration root;
the AI index and Quartz runtime live outside it.

## Content layout

Use this layout:

```text
data/
├── knowledge.yaml
└── content/
    ├── <repo>/                 # first-level project boundary
    │   └── <directory>/        # AI-selected nested page directory
    │       └── note.md
    └── assets/                 # shared images and referenced resources
```

`repo` defaults to the source Git root name, then the source project directory
name, and can be renamed through `knowledge.yaml`. Do not introduce required
`kind`, `slug`, `project`, `projects`, or `references` properties. Page relations
belong in Markdown links or Wikilinks.

Do not create `index.md` files for the root, repo, or directories. Quartz creates
the public virtual home and folder listings at build time.

## Create, import, and classify

1. Decide whether the material is durable project knowledge. Keep transient logs,
   credentials, private configuration, and unapproved speculation out of the Vault.
2. For a source Wiki page, read its physical first line. A line matching
   `> 摘要：...` becomes the candidate `description`; when normalized into a note,
   remove that original line from the body. Never use an arbitrary paragraph after
   a title as the description. If no summary exists, draft a candidate and show it.
3. Parse the complete Obsidian Markdown surface: frontmatter/properties, Wikilinks,
   block and heading targets, embeds, callouts, comments, highlights, tags,
   footnotes, math, Mermaid, GFM, code blocks, and external links. Preserve syntax
   unless a concrete target link or renderer requires a safe equivalent.
4. Search existing notes and tags before proposing placement. Search the current
   `repo` first, then other repos. Reuse an existing canonical multi-level tag or
   directory when it fits.
5. Ask the model to classify each imported file independently by content, summary,
   source, similar notes, repo, and nested directory. Do not force an import batch
   into one directory. Preserve the source filename by default; any rename needs
   confirmation. A new directory or new tag needs confirmation.
6. Before writing an import batch, build a source-to-target path map. Apply the map
   to Wikilinks, relative Markdown links, and asset links. Report unresolved targets,
   duplicate destinations, and resource conflicts in the preview.
7. For a new note, use `YYYY-MM-DD-english-title.md`. The creation date is the
   first creation date and must not change on later edits. The title is stored in
   frontmatter.

Use `scripts/normalize-note.mjs` for deterministic frontmatter, summary, tag,
date, and link-map normalization after the model has prepared the per-file
placement preview. The script is a formatter and diagnostic helper; the Skill
still owns classification and the confirmation conversation.

## Frontmatter and confirmation

Every new or normalized published note starts with frontmatter containing at least:

```yaml
---
title: ...
description: ...
date: YYYY-MM-DD
tags: []
draft: false
---
```

Preserve source properties that remain meaningful. Keep `aliases` only when the
source has them or the user requests them; never add an empty aliases array. Tags
may be in frontmatter or inline as `#tag`, including hierarchical forms such as
`a/b`. `draft: true` is local/private and is excluded from public Quartz output.

When a similar note exists, show the candidate and let the user choose update,
merge, or new. Never silently overwrite. Before any formal write, show and obtain
confirmation for the frontmatter, description, body change, repo, directory, tags,
duplicate choice, resource moves, and link rewrites. Cancellation leaves both
source data and derived state unchanged.

## Git and publish

After confirmation, run the publish helper with only the paths changed by this
operation. The helper enforces the following boundary:

- inspect worktree and index before starting;
- stop when there are pre-existing staged files or unrelated changes under `data/`;
- never stash automatically, clean user changes, or force-push;
- pull with rebase, stage exact approved paths, commit, and push;
- stop on rebase, commit, or push conflict;
- invoke `wheelmaker wiki publish` only after the Git phase succeeds.

Use:

```text
node <this-skill>/scripts/publish-wiki.mjs --paths <repo-relative-path> ...
```

The publish helper commits only those approved paths, performs the configured
rebase/push phase, and then invokes the existing `wheelmaker wiki publish`
command. It never calls a separate Hub upload command.

`publish.mode` in `knowledge.yaml` controls whether this final phase runs. With
the default `auto`, the Skill calls the existing WheelMaker Wiki command. Values
`off`, `disabled`, `manual`, and `false` return `skipped` before staging, commit,
pull, push, or WheelMaker invocation. That
command invokes its built-in `default.mjs`; the MJS calls the Skill-prepared Quartz
runtime with `data/content/` as input and the Hub output directory as output. The
same WheelMaker command validates, archives, authenticates, and uploads the static
result to `/wiki/`. Quartz never uploads directly and receives no WheelMaker
credentials.

Before publishing, ensure the pinned Quartz runtime is available:

```text
node <this-skill>/scripts/ensure-quartz.mjs
```

This installs or verifies the private runtime under `~/.wheelmaker/wiki/quartz/`
and keeps its configuration outside the Git data root. The runtime is Quartz
`v5.0.0`: its YAML configuration, `quartz.ts` entrypoint, plugin lockfile, and
WheelMaker local plugins are checked as one pinned runtime. The setup helper
restores Quartz Community plugins from that lockfile before a build; it does not
leave those generated plugin directories in Wiki `data/`. There is no file
watcher; editing and saving in Obsidian does not publish implicitly. Quartz 5
requires Node.js 22 or newer.

## Scope boundary

This Skill does not provide a WheelMaker editor button, an Obsidian URI opener, or
a second upload protocol. It only maintains plain Markdown data, local runtime
resources, and the confirmed WheelMaker publish flow.
