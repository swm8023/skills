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
- Pinned release: `v4.5.2` (tag object
  `624b297576877d7feddbbda8ad2b48f1205e4bfa`, peeled commit
  `4923affa7722dfc751f1074348e6dad214fe0c08`)
- The Skill installs this release into the private
  `~/.wheelmaker/wiki/quartz/` directory when it is absent, then overlays the
  checked-in `assets/quartz/` configuration, layout, and sidebar components.
- The runtime is a build dependency, not Wiki content. It is never copied into
  `data/` or public output, and Quartz receives no WheelMaker credentials.
