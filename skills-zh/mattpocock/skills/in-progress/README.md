# In Progress

Beta。这些 skill 有意公开：试用并反馈问题。转正到稳定区前，不进入 plugin 或顶层 README，没有 docs 页面，并可能不预告地改变或消失。

plugin 不提供这些 skill，直接安装单项：

```bash
npx skills@latest add mattpocock/skills --skill=<name>
```

- **[loop-me](./loop-me/SKILL.md)**：跨会话访谈可实施 workflow spec，用当前目录作有状态 workspace。用户手动调用。
- **[writing-beats](./writing-beats/SKILL.md)**：把文章写成自选冒险式 beat 旅程，选起始 beat，只写该段，再逐段转向，直到自然结束。
- **[writing-fragments](./writing-fragments/SKILL.md)**：访谈挖掘异质写作 fragment，追加单一文档，为未来文章备料。
- **[writing-shape](./writing-shape/SKILL.md)**：将原材料 Markdown 逐段塑造成文章，每步讨论格式选择。
- **[claude-handoff](./claude-handoff/SKILL.md)**：通过 `claude --bg` 给新的 background agent handoff 摘要，让它立即接手。用户手动调用。
- **[setup-ts-deep-modules](./setup-ts-deep-modules/SKILL.md)**：接入 dependency-cruiser，让每个 TypeScript package 成为 deep module，子目录 implementation 隐藏，仅通过入口访问和测试。用户手动调用。
