# Upstream material and local extensions

This Skill incorporates and extends the following pinned open-source material.

## Obsidian Markdown

- Repository: <https://github.com/kepano/obsidian-skills>
- Source path: `skills/obsidian-markdown/`
- Pinned commit: `a1dc48e68138490d522c04cbf5822214c6eb1202`
- Copied files: `obsidian-format.md` (renamed locally from upstream `SKILL.md`),
  `CALLOUTS.md`, `EMBEDS.md`, `PROPERTIES.md`, and the repository MIT license
  under `obsidian-markdown/`.
- License: MIT; the copied license and copyright notice remain with the copied
  material.

The active `pubwiki-markdown/SKILL.md` preserves the upstream syntax coverage
and adds fixed Hub discovery, content classification, confirmation, link mapping,
Git safety, and WheelMaker static publishing.

## Local extension boundary

The copied upstream files are reference material and are not fetched at runtime.
The active Skill's fixed-path rules take precedence where an upstream example uses
an arbitrary Vault path, manual index setup, a different Skill name, or a different
publishing workflow. The local `OBSIDIAN-WIKI-PATTERNS.md` reference further defines
how the syntax is selected during knowledge generation, including confirmed
Wikilinks, derived backlinks, feature prompts, and preview diagnostics; it is a
local workflow extension, not upstream syntax material.

Writing and revision route to the sibling [write-doc skill](../../write-doc/SKILL.md),
which supplies the before-writing references, post-draft optimization, and bundled
Mermaid guidance. The Wiki reference gives diagrams priority for hierarchies,
flows, interactions, state changes, data relationships, and dependencies. Candidate
prose and diagrams return to the existing note preview and publication flow;
this routing does not grant access to private Wiki source or alter publication
boundaries.

## Built-in WheelMaker reader

The independent DocHub-derived reader and its behavior tests moved to WheelMaker
on 2026-10-29. The maintained source is `server/internal/wiki/reader/`, with its
original provenance in `ORIGIN.md` and Node tests in `server/internal/wiki/tests/`.
The migration baseline was this repository's commit
`cc06f41560f0e30b5c93b229dd126e680b3762d8`.

WheelMaker embeds the source and pinned dependency manifests in its Go program;
Go prepares the real `~/.wheelmaker/wiki/reader/` on first preview or publication.
This Skill no longer carries, binds, installs or runs the exporter. Its operational
scripts delegate to the trusted Go CLI. Go also owns scoped note Git publication,
private configuration parsing, loopback preview serving and public projection.
Raw Vaults and user configuration never become exporter inputs. Registry serves
the validated static website and an independent Share profile from the same
embedded browser source.
