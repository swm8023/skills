# Upstream material and local extensions

This Skill incorporates and extends the following pinned open-source material.

## Vault search

- Repository: <https://github.com/Roasbeef/obsidian-claude-code>
- Source path: `skills/vault-search/`
- Pinned commit: `03a22a8b563d1657cd1840b9f65000347a15a3b4`
- Copied files: `README.md`, `SKILL.md`, `scripts/dataview.py`,
  `scripts/index.py`, and `scripts/search.py` under `upstream-vault-search/`.
- License: the pinned repository README declares MIT. The repository did not
  contain a root license file at this commit; the source and attribution are
  retained here.

The active `knowledge-search/SKILL.md` preserves the upstream semantic-search and
Dataview workflows while replacing manual rebuilds, arbitrary personal paths, and
required Python/vector dependencies with the fixed local automatic index and
Obsidian-first adapter.

## Local extension boundary

The copied upstream files are reference material and are not fetched at runtime.
The active Skill's fixed Vault, private index, automatic freshness, and no-network
rules take precedence over upstream examples that use a different path, manual
commands, or a required embedding installation.
