# Upstream material and local changes

- Repository: <https://github.com/softaworks/agent-toolkit>
- Source path: `skills/mermaid-diagrams/`
- Pinned commit: `3027f20f3181758385a1bb8c022d4041dfb4de84`
- Imported on: 2026-10-26
- License: MIT; the repository license and copyright notice are retained in `../LICENSE`.

The upstream skill directory was imported with its README and seven references:
`class-diagrams.md`, `sequence-diagrams.md`, `flowcharts.md`, `erd-diagrams.md`,
`c4-diagrams.md`, `architecture-diagrams.md`, and `advanced-features.md`.
Those reference files and the README retain upstream content; line endings and
insignificant trailing whitespace are normalized to repository conventions.

The local `index.md` adapts invocation guidance, adds mind-map selection,
uses Markdown code blocks as the default document output, and replaces mandatory
diagramming and online validation advice with focused diagrams and local checks.
Its rules preserve the calling workflow's source access, paths, preview, Git,
publication, and private-data boundaries. Upstream optional renderer examples
do not establish support in the calling application's renderer.

`mindmaps.md` is a local reference informed by the official Mermaid documentation.
This import does not add a runtime network dependency or change any renderer.
