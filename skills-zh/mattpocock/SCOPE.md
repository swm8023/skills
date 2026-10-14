# Scope

本仓库收录我每天使用的 skill，经过精选。欢迎想法，每项按下方门槛判断。Issue 跟踪 skill 变化，问题和讨论进入 [GitHub Discussions](https://github.com/mattpocock/skills/discussions)。

## The bar

想法或反馈 issue 只有**同时**符合两项才保持开放：

1. **Observed failure。** 描述真实会话中发生的问题：运行了什么、skill 做了什么、期望什么。假想改进（“如果……会更好”）不合格。
2. **Fits the philosophy。** 不属于 [`.out-of-scope/`](./.out-of-scope/) 或历史拒绝，不是配置选项、harness 专属分支，或适应个人 workflow 的调整。这些应放自己的 `CLAUDE.md` / `AGENTS.md` 或 fork（skills.sh 提供可编辑副本）。

规模无关：改一个词与重写遵循同一门槛。reaction 和 +1 comment 不计入。

## By bucket

- **`engineering/`、`productivity/`、`in-progress/`**：上面的门槛。
- **`misc/`**：冻结、不维护，所有 issue 关闭。参见 [`frozen-misc-skills.md`](./.out-of-scope/frozen-misc-skills.md)。
- **New skills**：提案和贡献关闭。能组合既有 skill 实现的行为，不新增 skill。参见 [`new-skills.md`](./.out-of-scope/new-skills.md)。

## Already decided

[`.out-of-scope/`](./.out-of-scope/) 每个文件记录一种拒绝概念及原因，提交前阅读：

- [`frozen-misc-skills.md`](./.out-of-scope/frozen-misc-skills.md)
- [`harness-name-collisions.md`](./.out-of-scope/harness-name-collisions.md)
- [`mainstream-issue-trackers-only.md`](./.out-of-scope/mainstream-issue-trackers-only.md)
- [`native-question-tool.md`](./.out-of-scope/native-question-tool.md)
- [`new-skills.md`](./.out-of-scope/new-skills.md)
- [`question-limits.md`](./.out-of-scope/question-limits.md)
- [`setup-skill-verify-mode.md`](./.out-of-scope/setup-skill-verify-mode.md)
- [`subagent-recursion.md`](./.out-of-scope/subagent-recursion.md)

## Unclear issues

无法按门槛判断的 issue 会收到一轮问题并标 `needs-info`。报告者 14 天未答则关闭；拒绝以“not planned”关闭。
