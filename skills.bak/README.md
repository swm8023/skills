# Original skill archives

Reference material is grouped by source. Active project skills live in `../skills/`.

| Source | Archive | Manifest | Scope |
| --- | --- | --- | --- |
| [mattpocock/skills](https://github.com/mattpocock/skills) | [mattpocock/](mattpocock/README.md) | [source](mattpocock.UPSTREAM.json) | Existing complete snapshot: 190 files, 38 skills |
| [obra/superpowers](https://github.com/obra/superpowers) | [superpowers/](superpowers/README.md) | [source](superpowers.UPSTREAM.json) | 13 existing local skill packages, content unchanged |
| [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) | [caveman/](caveman/README.md) | [source](caveman.UPSTREAM.json) | Existing historical local skill, content unchanged |
| [softaworks/agent-toolkit](https://github.com/softaworks/agent-toolkit) | [softaworks/](softaworks/README.md) | [source](softaworks.UPSTREAM.json) | Four complete selected packages, 23 Markdown files plus LICENSE |
| [cursor/plugins: pstack](https://github.com/cursor/plugins/tree/4dd1d05818d19792e7cd6e818f1667f95f7e1dbe/pstack) | [pstack/](pstack/README.md) | [source](pstack.UPSTREAM.json) | Complete technical-writing package, one Markdown file plus pstack LICENSE |

## Layout and provenance

Packages use `<source>/skills/<skill-name>/`, retaining supporting files and
their internal relative paths. The [Chinese archive](../skills-zh/README.md)
mirrors the source grouping. The Superpowers and Caveman packages were moved
from the former flat layout without changing their bytes or refreshing versions.
Their exact upstream commits are unknown; manifests record the known local
baseline, original paths, modes, and hashes rather than claiming an upstream pin.

Softaworks is pinned to `3027f20f3181758385a1bb8c022d4041dfb4de84`, verified
2026-10-26. The selection is `skill-judge`, `writing-clearly-and-concisely`,
`lesson-learned`, and `mermaid-diagrams`, including every file in those packages.

pstack is pinned to Cursor plugins commit
`4dd1d05818d19792e7cd6e818f1667f95f7e1dbe`, verified 2026-10-30. The selected
`technical-writing` package retains its original bytes and `unslop` reference;
the companion skill is outside this archive selection.

The Matt Pocock snapshot remains at `49dd158d1076134a641b33efb035946536778336`,
verified 2026-10-14: 27 stable, 7 experimental, and 4 frozen skills. The obsolete
June English backup was removed earlier; previous versions remain in Git history.
Its upstream `AGENTS.md` symlink blob is represented as a regular file containing
`CLAUDE.md` on Windows, with mode `120000` recorded in its manifest.
