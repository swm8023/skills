# Upstream material and local extensions

This Skill incorporates and extends the following pinned open-source material.

## Obsidian Markdown

- Repository: <https://github.com/kepano/obsidian-skills>
- Source path: `skills/obsidian-markdown/`
- Pinned commit: `a1dc48e68138490d522c04cbf5822214c6eb1202`
- Copied files: `SKILL.md`, `CALLOUTS.md`, `EMBEDS.md`, `PROPERTIES.md`, and the
  repository MIT license under `upstream-obsidian-markdown/`.
- License: MIT; the copied license and copyright notice remain with the copied
  material.

The active `knowledge-markdown/SKILL.md` preserves the upstream syntax coverage
and adds fixed Hub discovery, content classification, confirmation, link mapping,
Git safety, and WheelMaker/Quartz publishing.

## Local extension boundary

The copied upstream files are reference material and are not fetched at runtime.
The active Skill's fixed-path rules take precedence where an upstream example uses
an arbitrary Vault path, manual index setup, a different Skill name, or a different
publishing workflow.

## Quartz runtime and local adapter

- Repository: <https://github.com/jackyzha0/quartz>
- Pinned release: `v5.0.0` (commit
  `ab346fa66a895e12d63a308e70ce330ba795822a`)
- The Skill installs this release into the private
  `~/.wheelmaker/wiki/quartz/` directory when it is absent, then overlays the
  checked-in `assets/quartz/` YAML configuration, TypeScript entrypoint, and
  WheelMaker local v5 plugins. The setup helper restores the v5 Community
  plugins from the upstream `quartz.lock.json` before the runtime is used.
- Quartz 5 replaces the v4 `quartz.config.ts`/`quartz.layout.ts` pair with
  `quartz.config.yaml`, plugin manifests, and per-plugin layout declarations.
  The local home page is a v5 virtual page type, so no `content/index.md` is
  generated or required.
- The runtime is a build dependency, not Wiki content. It is never copied into
  `data/` or public output, and Quartz receives no WheelMaker credentials.
