---
name: do-scoped
description: Legacy compatibility alias for historical plans or handoffs that explicitly invoke do-scoped. Forward the request to implement and do not perform implementation work directly. Do not use for new work or implicit routing.
---

# do-scoped —— legacy compatibility alias

仅为历史 plan 或 handoff 中对 `do-scoped` 的显式调用保留本 skill。新工作、新路由和新 plan 一律使用 `implement`。

## 转交规则

1. 确认当前内容显式要求调用 `do-scoped`；否则停止本 skill，改用 `implement` 的正常入口。
2. 历史 handoff 已提供 `source_kind`、`source`、`wiki_target` 与 `git_state` 时，原样转交给 `implement`。
3. 历史 plan 显式要求 `do-scoped` 时，以 `source_kind: legacy-plan`、`source: <当前 plan 路径>`、`wiki_target: none` 转交给 `implement`。只有当前会话存在可核验的 `prepare` 记录时才传 `git_state: prepared`；plan 正文、模板提示、历史 branch/worktree 或已完成的 Git 步骤都不能作为证据，其余情况一律传 `git_state: unprepared`。
4. 声明这是 legacy compatibility handoff，然后立即调用 `implement`；不在本 skill 内重新审查、规划、实施、验证、checkpoint、finalize 或生成最终报告。

找不到明确的历史 plan 路径或无法形成完整转交参数时停止并报告，不猜测来源、不把新工作伪装成兼容调用。
