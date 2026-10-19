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

## Independent reader

The reader in assets/dochub was copied from DocHub and is maintained independently.
See [reader provenance](../assets/dochub/ORIGIN.md). It uses pinned npm dependencies
and does not install or invoke Quartz. Hub owns artifact validation, authentication
and upload; Registry continues to serve the resulting static website.
