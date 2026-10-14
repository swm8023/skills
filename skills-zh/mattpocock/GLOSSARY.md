# Matt Pocock Skills

由 Claude Code 加载的一组 agent skill（slash command 和行为）。skill 按 bucket 组织，通过 `/setup-matt-pocock-skills` 生成的仓库级配置使用。

## Language

**Issue tracker**：
承载仓库 issue 的工具：GitHub Issues、Linear、本地 `.scratch/` Markdown 约定等。`to-tickets`、`to-spec`、`triage` 读写它。
_避免_：backlog manager、backlog backend、issue host

**Issue**：
**Issue tracker** 中单个被跟踪工作单元：bug、task、spec，或 `to-tickets` 生成的 slice。
_避免_：ticket（仅引用外部系统称呼，或下方 **Decision ticket** 时使用）

**Decision ticket**：
`wayfinder` 单元：`wayfinder:map` 的 child **Issue**，承载解决后产生决策的*问题*，而非待执行的构建 slice。**decision** 限定让它区别于 implementation ticket；`wayfinder` 先引入该词，再简称“ticket”。

**Triage role**：
triage 期间应用于 **Issue** 的规范状态机标签（例如 `needs-triage`、`ready-for-afk`）。每个角色通过 `docs/agents/triage-labels.md` 映射到 **Issue tracker** 的实际 label。

## Relationships

- 一个 **Issue tracker** 承载多个 **Issue**
- 一个 **Issue** 同时拥有一个 **Triage role**
- **Decision ticket** 是 **Issue**（`wayfinder:map` 的 child）

## Flagged ambiguities

- 以前“backlog”同时表示托管 issue 的*工具*及其中*全部工作*。已解决：工具称 **Issue tracker**，不再使用“backlog”作领域术语。
- “backlog backend” / “backlog manager” 已统一为 **Issue tracker**。
