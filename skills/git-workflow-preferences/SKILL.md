---
name: git-workflow-preferences
description: 在开始工程文件写入或实现、决定是否拉分支或 worktree、以及功能完成后决定 commit、push、merge、删除分支或清理 worktree 时使用；读取或创建 docs/user-preferences.md 中的用户 Git 工作流习惯。
---

# git-workflow-preferences

## 目标

让 agent 在做 Git 工作流决策前先读取用户习惯，而不是每次重新询问或凭默认值猜。

偏好文件固定为当前 workspace 下的 `docs/user-preferences.md`。该文件记录用户对分支、worktree、commit、push、merge 和清理动作的长期偏好。

## 基本规则

- 先读 `docs/user-preferences.md`，再决定 Git 工作流。
- 规划、诊断、审查阶段只读取已存在的偏好文件；文件不存在时不要打断流程。
- 进入实现或执行 Git 动作前，文件不存在时进行一轮询问；用户回答后创建文件并记录答案。
- 文件存在但缺少当前决策所需信息时，只补问缺失项，然后更新文件。
- 当次用户指令优先于偏好文件；偏好文件只提供默认行为。
- 破坏性操作仍要单独确认，例如删除 branch、删除 worktree、丢弃改动、force push。

## 放置位置

这是横切 gate，但入口必须收敛，不能散落在每个实施 skill 里。

只放在少数明确入口：

1. `scope` 阶段 3：用户选择落 spec 时，写 spec 文件前；用户选择不落 spec 时，开始执行改代码前。
2. `debug` 修复入口：用户确认根因与修复方案后，进入 TDD 修复前。
3. `executing-plans` 或用户直接要求工程实现 / Git 操作：没有经过前两个入口时，在第一次改文件、建 branch/worktree、commit、push、PR、merge 或清理前。

不要在 `writing-plans` 中拉分支、创建 worktree 或初始化偏好文件；写 plan 只消费已经准备好的 workspace。

### 文件写入 / 实现前关口

在第一次写工程文件、生产代码、搭脚手架、切分支或创建 worktree 前使用。`scope` 落 spec 会写文件，也要先过这个关口。

### Git 动作关口

在执行 commit、push、创建 PR、merge、删除 branch、删除 worktree、丢弃改动或 force push 前使用。

如果只是生成 spec、写 plan、调查 bug 或只读审查，不触发本关口；这些阶段最多读取已存在的偏好文件作为约束。

## 偏好范围

开始工程前：

- 是否从主干或当前分支拉新分支。
- 从哪个基线分支拉。
- 什么情况下必须拉分支，什么情况下可以直接在当前分支做。
- 是否创建独立 worktree，以及 worktree 的命名和位置。
- 是否在开始前 pull/rebase 基线分支。

完成功能后：

- 是否默认 commit。
- commit 粒度和 message 风格。
- 是否默认 push。
- 是否创建 PR。
- 是否合并回主干。
- 是否删除分支或清理 worktree。

## 文件不存在时的询问

在文件写入 / 实现前关口或 Git 动作关口，如果 `docs/user-preferences.md` 不存在，一次性问完以下问题，允许用户简答：

1. 开始新任务时，默认要不要先从某个基线分支拉 feature branch？基线通常是哪一个？
2. 哪些任务必须拉新分支？哪些小改动可以沿用当前分支？
3. 是否默认创建 worktree？如果创建，放在哪里、如何命名？
4. 开始前是否要更新基线分支，例如 pull、fetch、rebase？
5. 功能完成后是否默认 commit？commit 粒度和 message 风格是什么？
6. 完成后是否默认 push？是否创建 PR？
7. 是否允许 agent 合并回主干？如果允许，什么条件下允许？
8. 完成后是否删除分支或 worktree？哪些清理动作必须再次确认？

用户回答不足时，只记录已确认内容，未确认项写成 `待确认`。不要因为文件不存在就阻塞当前任务；如果当前任务马上需要某个未确认决策，单独询问该项。

## 文件模板

创建 `docs/user-preferences.md` 时使用这个结构：

```markdown
> 摘要：记录本项目中用户对 Git 分支、worktree、提交、推送、合并和清理动作的工作流偏好。

# User Preferences

## Git: 开始工程前

- 基线分支：
- 是否默认拉 feature branch：
- 必须拉新分支的场景：
- 可以沿用当前分支的场景：
- 开始前是否更新基线：

## Git: Worktree

- 是否默认创建 worktree：
- worktree 位置：
- worktree 命名：
- 复用或清理规则：

## Git: 完成功能后

- 是否默认 commit：
- commit 粒度：
- commit message 风格：
- 是否默认 push：
- 是否默认创建 PR：
- 是否允许合并主干：
- 是否删除分支：
- 是否删除 worktree：

## 必须再次确认

- 删除 branch：
- 删除 worktree：
- 丢弃改动：
- force push：
- 合并主干：

## 备注

- 最后更新：
```

## 使用方式

读到偏好后，用一句话说明将采用的默认工作流，例如：

`我会按 docs/user-preferences.md：从 main 拉 feature branch，不建 worktree；完成后先提交，不自动 push。`

如果当前动作与偏好文件冲突，先说明冲突并按用户当次指令执行。执行后可询问是否把这次选择更新为长期偏好。
