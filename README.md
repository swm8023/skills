# skills

Personal skills repository for WheelMaker.

Add skills under `skills/<skill-name>/SKILL.md`, then push the repo.

WheelMaker tracks this folder as a Project at `D:\Code\skills`. If the GitHub repository is public, or the local `skills` CLI can access it with Git credentials, it can also be used as a remote Skill Source with `swm8023/skills`.

## Chinese technical writing

[`technical-writing`](skills/technical-writing/SKILL.md) is the local Chinese
adaptation for drafting, restructuring, and reviewing technical documents.
Invoke it explicitly with `$technical-writing`. It includes Chinese examples,
document-type guidance, and a final wording and meaning check. Source provenance
and adaptation choices are in its [source record](skills/technical-writing/references/UPSTREAM.md).

## Reference archive organization

Original references live in `skills.bak/<source>/`; Chinese references mirror
them in `skills-zh/<source>/`. Each source keeps its skill packages under the
upstream-style `skills/` hierarchy, with a source or translation manifest beside
the source folder. These archives are separate from active project `skills/`.

| Source | Original reference | Chinese reference | Scope |
| --- | --- | --- | --- |
| Matt Pocock | [mattpocock](skills.bak/mattpocock/README.md) | [mattpocock](skills-zh/mattpocock/README.md) | Existing complete repository snapshot; 38 skills |
| Superpowers | [superpowers](skills.bak/superpowers/README.md) | [superpowers](skills-zh/superpowers/README.md) | Existing 13 skill packages, reorganized without refreshing their contents |
| Caveman | [caveman](skills.bak/caveman/README.md) | [caveman](skills-zh/caveman/README.md) | Existing historical skill, reorganized without content changes |
| Softaworks Agent Toolkit | [softaworks](skills.bak/softaworks/README.md) | [softaworks](skills-zh/softaworks/README.md) | Four selected packages: skill-judge, writing-clearly-and-concisely, lesson-learned, mermaid-diagrams |
| pstack (Cursor plugins) | [pstack](skills.bak/pstack/README.md) | [pstack](skills-zh/pstack/README.md) | Selected technical-writing package and LICENSE; sentence-aligned Chinese translation reviewed with humanizer-zh |

Softaworks is pinned to `3027f20f3181758385a1bb8c022d4041dfb4de84`
(verified 2026-10-26). Its four packages contain all 23 upstream Markdown files,
including supporting references, with sentence-aligned Chinese translations and
English technical terms retained. Source manifests record original hashes and file modes;
translation manifests also record translated hashes and preservation rules.

pstack is pinned to Cursor plugins commit `4dd1d05818d19792e7cd6e818f1667f95f7e1dbe`
(verified 2026-10-30). The selection contains the complete `technical-writing`
package and pstack LICENSE. Its 106-line Chinese translation preserves the
upstream structure, English headings, technical examples, and invocation policy,
with a final wording review using the pinned `humanizer-zh` rules. The adjacent
manifests record the source paths, hashes, and editorial provenance.

Historical documents may refer to the former flat paths. Superpowers packages
formerly at `skills.bak/<skill>/` or `skills-zh/<skill>/` now live under
`<archive-root>/superpowers/skills/<skill>/`. Caveman now lives under
`<archive-root>/caveman/skills/caveman/`. All 92 relocated original/translated
files retain their previous bytes. The exact historical upstream commits for
these two sources were not recorded; their manifests explicitly retain the
known local baseline instead of claiming a current upstream version.

## Matt Pocock reference archives

The complete [mattpocock/skills](https://github.com/mattpocock/skills) repository
snapshot is in [`skills.bak/mattpocock/`](skills.bak/mattpocock/README.md).
The Chinese skill library is in
[`skills-zh/mattpocock/`](skills-zh/mattpocock/README.md).
Both contain all 38 skills, including stable, experimental, and frozen buckets,
and all 190 upstream files with their original directory structure.

Verified on 2026-10-14 against upstream `main` at
[`49dd158d1076134a641b33efb035946536778336`](https://github.com/mattpocock/skills/commit/49dd158d1076134a641b33efb035946536778336)
(2026-10-09). The latest release tag and package/plugin version are `v1.3.1` /
`1.3.1`; this main snapshot also includes changes after that release.
[`skills.bak/mattpocock.UPSTREAM.json`](skills.bak/mattpocock.UPSTREAM.json)
records the exact source commit, file modes, and source hashes.
[`skills-zh/mattpocock.TRANSLATION.json`](skills-zh/mattpocock.TRANSLATION.json)
records the same source plus per-file translation status and hashes.
The original snapshot is unchanged upstream content under the upstream
[MIT license](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/LICENSE).

`writing-for-agents` is now model-invoked and covers skills, `AGENTS.md`,
`CLAUDE.md`, and other documents consumed by agents. Its former glossary is
merged into `SKILL.md`, while skill-specific invocation and frontmatter guidance
lives in `SKILL-MECHANICS.md`. It also adds guidance about avoiding stale copies
of environment facts and stating the desired behavior positively.

All 66 Markdown files inside upstream `skills/`, plus its root `README.md`,
`GLOSSARY.md`, and `SCOPE.md`, are translated line by line. Code blocks, inline
code, paths, links, identifiers, headings/anchors, and invocation-policy fields
are preserved. The remaining upstream website pages, release history,
maintenance instructions, configuration, and scripts are retained verbatim;
this is a complete Chinese **skill library**, not a translation of every
repository maintenance file.

The outdated English Matt Pocock backup from June was removed from `skills.bak/`;
its previous contents remain available in Git history. Older Chinese translations
remain under `skills-zh/legacy-mattpocock-2026-06/`. Other sources are now grouped
as documented above. Use the `mattpocock/` snapshots for the verified Matt Pocock material.

These are reference archives. The repository's own `skills/` workflows,
including `scope`, `implement`, `debug`, and `handoff`, keep their existing names
and behavior. The mistaken active `writing-for-agents` installation from commit
`2d91555` was removed, and both installation lock files were restored to their
previous contents. Archive versions are tracked by the adjacent manifests.

## Upstream changes since v1.0.0

The stable `engineering/` and `productivity/` buckets grew from **19 to 27
skills**. Counting experimental and other buckets, the repository grew from
34 to 38 `SKILL.md` files. These counts describe the upstream catalog, not the
number activated in this repository.

| New stable skill | Purpose |
| --- | --- |
| `code-review` | Review coding standards and spec compliance on separate axes. |
| `implement-spec` | Implement a whole spec as a ticket graph with parallel worktrees and an integration branch. |
| `pr` | Write a PR body with a small visual, before/after evidence, and merge risk. |
| `research` | Investigate a question using primary sources and save cited findings. |
| `retro` | Suggest improvements to the agent's environment after a coding session. |
| `wizard` | Generate an interactive Bash guide for steps requiring human action. |
| `to-questionnaire` | Prepare questions for an external decision maker. |
| `wait-what` | Re-explain an unclear response in plain language and project terminology. |

Other migrations:

- `to-prd` becomes `to-spec`; `to-issues` becomes `to-tickets`.
- `writing-great-skills` becomes `writing-for-agents`, with no old-name alias.
- Experimental `decision-mapping` becomes stable `wayfinder`: resolve a large
  project's decision tickets and their dependencies across sessions.
- `resolving-merge-conflicts` is removed without a replacement skill.
- Deprecated `design-an-interface`, `qa`, `request-refactor-plan`, and
  `ubiquitous-language`, personal `edit-article` and `obsidian-vault`, and
  experimental `review` are removed from the tree.
- New experimental directories include `chief-of-staff`, `claude-handoff`,
  `loop-me`, and `setup-ts-deep-modules`. The first is present in the tree but
  not yet listed in the experimental README. Existing `writing-beats`,
  `writing-fragments`, and `writing-shape` remain experimental.
- `misc/` contains four frozen, unmaintained skills. Experimental and misc
  skills are excluded from the stable plugin bundle.

## Current upstream workflow

The invocation split already existed at `v1.0.0`. It now has matching Claude
frontmatter and Codex `agents/openai.yaml` metadata: user-invoked skills require
an explicit user request; model-invoked skills may also be reached automatically.
A workflow may call model-invoked skills, while another user-invoked workflow
must be requested by the human.

User-invoked stable skills:

- Engineering: `ask-matt`, `grill-with-docs`, `triage`,
  `improve-codebase-architecture`, `setup-matt-pocock-skills`, `to-spec`,
  `to-tickets`, `implement`, `implement-spec`, `wayfinder`, `retro`.
- Productivity: `grill-me`, `handoff`, `teach`, `to-questionnaire`, `wait-what`.

Model-invoked stable skills:

- Engineering: `prototype`, `diagnosing-bugs`, `research`, `tdd`,
  `domain-modeling`, `codebase-design`, `code-review`, `pr`, `wizard`.
- Productivity: `grilling`, `writing-for-agents`.

A typical engineering flow is repository setup, requirements discussion with
`grill-with-docs`, synthesis with `to-spec`, decomposition with `to-tickets`,
implementation with `implement` or `implement-spec`, code review, and optional
`retro`. Domain vocabulary now lives in `GLOSSARY.md` / `GLOSSARY-MAP.md`,
replacing `CONTEXT.md` / `CONTEXT-MAP.md`.

Existing workflows also changed: `prototype` can produce a self-contained HTML
demo retained as evidence; `implement` uses TDD and closes with code review;
`diagnosing-bugs` requires a demonstrated red feedback loop; `tdd` explains what
each proposed test seam catches and misses. Main after `v1.3.1` additionally
fixes tracker setup, ticket references and sub-issues, review discovery,
handoff paths, recommended-answer handling, and wizard script behavior.

Upstream now recommends self-updating plugins where supported, or editable
copies through `skills.sh`. Editable copies need explicit updates, and newly
added skills need a fresh selection. The copies here are archived reference
material, not an installed upstream plugin.

Sources: [version comparison](https://github.com/mattpocock/skills/compare/v1.0.0...49dd158d1076134a641b33efb035946536778336),
[changelog](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/CHANGELOG.md),
[catalog and installation](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/README.md).
