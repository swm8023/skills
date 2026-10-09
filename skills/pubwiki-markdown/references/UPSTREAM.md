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
Git safety, and WheelMaker/Quartz publishing.

## Local extension boundary

The copied upstream files are reference material and are not fetched at runtime.
The active Skill's fixed-path rules take precedence where an upstream example uses
an arbitrary Vault path, manual index setup, a different Skill name, or a different
publishing workflow. The local `OBSIDIAN-WIKI-PATTERNS.md` reference further defines
how the syntax is selected during knowledge generation, including confirmed
Wikilinks, derived backlinks, feature prompts, and preview diagnostics; it is a
local workflow extension, not upstream syntax material.

## Quartz runtime and local adapter

- Repository: <https://github.com/jackyzha0/quartz>
- Pinned release: `v5.0.0` (commit
  `ab346fa66a895e12d63a308e70ce330ba795822a`)
- The Skill installs this release into the private
  `~/.wheelmaker/wiki/quartz/` directory when it is absent, then overlays the
  checked-in `assets/quartz/` YAML configuration, TypeScript entrypoint, and
  WheelMaker local v5 plugins. The runtime uses the pinned upstream core;
  `quartz.ts` applies the local reader layout and resource finalization wrappers.
  The setup helper restores Community plugins from the checked-in
  `assets/quartz/quartz.lock.json` and prepares the generated plugin index.
- `ensure-quartz.mjs --link-skill` binds the local plugin to this installed
  Skill's assets. The Hub supplies Node's `--preserve-symlinks` flag and preloads
  the plugin before invoking Quartz. Runtime preparation and update commands
  are documented in [the active Skill](../SKILL.md#git-和发布).
- Quartz 5 uses `quartz.config.yaml`, plugin manifests, and per-plugin layout
  declarations. WheelMaker provides virtual home, directory, and tag result
  pages, the reader navigation, and the search index and interface.
- The local resource wrapper finalizes emitted HTML, shared token styles,
  heading SVG symbols and content-hashed assets. Search uses a candidate index
  and separate article text files. Performance comparisons follow
  [the metrics procedure](../scripts/wiki-metrics.md).
- The runtime is a private build dependency. Hub's embedded fixed exporter
  invokes it, and Hub's Publisher handles archive upload and authentication.
  Registry serves the published static site and applies its caching policy.
