---
name: git-workflow
description: 执行会持久化仓库修改的 Git 工作流。prepare 时读取 docs/user/git-preferences.md 并建立本次 Git 上下文，checkpoint 和 finalize 继承该上下文，管理 branch/worktree、同步、commit、push、merge 和 cleanup；配置缺失或行为不明确时初始化或逐项询问。
---

# Git 工作流

配置文件固定为当前 workspace 的 `docs/user/git-preferences.md`。

## 生命周期

调用时明确指定阶段，不能只说“参考 Git 偏好”：

- **prepare**：首次持久化写入前执行；建立本任务的工作区、同步状态和文件所有权。
- **checkpoint**：独立工作单元验证通过后按需执行；处理阶段性 commit，不做最终 push、merge 或 cleanup。
- **finalize**：产生持久化修改后，在 Git 生命周期结束或外部 handoff 前执行；完成剩余 commit、push、merge、cleanup 和结果报告。

纯只读调查、需求讨论和不落盘计划不调用本 skill。写入 spec、plan、wiki、测试、代码或其他仓库文件前必须完成 `prepare`；任务完成、取消、阻塞、验证失败或 handoff 前必须按真实结果 `finalize`。

同一任务的连续审阅和 Skill 转交沿用现有生命周期。只传递 `git_state`：`prepared` 继承现有上下文和文件所有权，`unprepared` 在首次写入前执行 `prepare`；传入 `prepared` 但上下文缺失或不一致时停止并报告。

## 通用约束

- `prepare` 读取配置、检查冲突并固化本次 Git 生命周期的有效决策；`checkpoint` 和 `finalize` 直接继承。用户明确修改本次决策时只更新当前上下文；上下文缺失或不一致时停止并报告，新的 Git 生命周期由 `prepare` 重新读取。
- 同步判断前刷新远端；push 后核对实际远端分支，不能依赖陈旧 tracking ref。
- `prepare` 记录任务开始前的 modified、staged 和 untracked 文件；后续阶段只处理本任务文件。存在任务外修改时禁止 `git add -A`。
- 会覆盖修改、存在语义歧义或不安全时暂停并询问用户。删除未合并分支、丢弃修改、强制推送等破坏性操作需单独确认。

## 阶段

### prepare

1. 检查仓库、branch、worktree、upstream、`git status -sb` 和实际远端状态，按 Sync 偏好刷新并同步。
2. 记录任务开始前已有修改，归属不明时询问用户。
3. 按 Branch/Worktree 偏好创建或沿用工作区。
4. 返回并保留：仓库根目录、branch、worktree、base/upstream、开始时已有修改、Commit/Push/Merge/Cleanup 决策。

### checkpoint

1. 确认当前工作单元已有验证信号且通过。
2. 对照 `prepare` 检查 diff，只 stage 当前工作单元文件，并按 Commit 偏好提交或跳过。
3. 返回 commit hash + subject，或“未提交”及原因。

### finalize

1. 接收任务结果 `complete`、`blocked`、`verification_failed` 或 `awaiting_review`，以及验证结果。
2. 对照 `prepare` 检查 `git status -sb` 和 diff；仅在任务结果与 Commit 偏好允许时提交本任务文件。
3. 按 Sync、Push、Merge、Cleanup 偏好收尾。push 遇到 non-fast-forward 时刷新远端，按偏好 rebase/merge 后重试一次；语义冲突时暂停。
4. 核对实际远端分支。
5. 返回：当前 branch/worktree、commit hash + subject、push 远端分支、merge/PR、cleanup，以及每个未执行动作的原因。

finalize 返回前不得声称持久化修改任务已完成。偏好要求的 commit 或 push 未完成时，报告 blocked 或明确的部分完成，不能无理由以“未提交”结束。

## 配置流程

`prepare` 读取配置后，配置存在、无冲突且本次生命周期所需项均已明确时，直接固化决策，不进入本流程、不提问、不回写。

仅以下情况进入本流程：

- 配置不存在：按模板创建并写入当前日期，然后完成全部初始化问题；模板内容只是默认答案。
- 所需项缺失、含糊或标记“待确认”：逐项询问并记录。
- 配置存在冲突：按下文规则一次处理一个。
- 用户明确要求修改长期偏好：询问并回写对应项。

用户仅指定本次操作时，直接覆盖当前上下文，不进入本流程、不回写。

### 预设问题

1. 基线：基础分支是什么？
2. Branch/Worktree：何时创建 branch/worktree；创建时两者是否绑定；worktree 放在哪里、如何命名？
3. Sync：何时同步远端；使用 rebase 还是 merge；冲突如何处理？
4. Commit：是否自动 commit？
5. Merge：是否自动合回基线；是否创建 PR？
6. Push：何时 push？
7. Cleanup：push 后是否保留 branch/worktree？

### 提问与回写

1. 初始化先展示全部七个问题，再一次一题且不跳过；非初始化只问本次生命周期所需的未决项或用户要求修改的长期偏好，也一次一题。
2. 每题附当前默认答案，允许用户回答“采用预设”。
3. 回答后只更新对应操作和“最后更新”日期；回答不完整时记录已确认内容并将其余标记“待确认”，永久无需配置时记为“不适用”。
4. 每次写入后检查整份配置；有冲突时一次处理一个，列出冲突项和可选方案，用户选择后回写并复查。
5. 全部初始化问题已确认且无冲突后，才执行 Git 操作。

### 冲突检查

以下情况视为冲突：同一操作存在互斥规则；某项操作依赖的前置行为被明确禁止；清理规则与保留或复用规则矛盾；合并目标与基线不一致且没有明确例外。无法判断时按“不明确”处理并询问用户。

## 配置模板

```markdown
> 本文件记录本项目跨会话生效的 Git 工作流偏好。

# Git Preferences

- 基线：使用 `main`，禁止任何删除基线分支的操作。
- Branch/Worktree：仅落 spec 的任务创建 feature branch，并绑定创建项目根目录 `.worktree/<branch-name>`；不落 spec 的任务和 bug 修复沿用当前分支，同时确保 `.worktree/` 被 Git 忽略。
- Sync：prepare 时先刷新并同步远端最新状态；提交后、push 前再次刷新并 rebase 到远端最新状态；明确冲突自动解决，存在语义歧义时询问用户。
- Commit：checkpoint 或 finalize 时，当前工作单元完成且验证通过后自动 commit；未完成或验证失败时不提交。
- Merge：不创建 PR；任务完成后，本地 `main` 工作树干净则自动合入，存在修改则暂不合入。
- Push：finalize 时 push 当前分支并核对实际远端 SHA；若随后成功合入 `main`，再自动 push 并核对 `main`；因 `main` 存在修改而暂缓合并时，仍 push 当前分支。
- Cleanup：任务分支成功合入并 push `main` 后，自动删除干净的任务 worktree、本地任务分支和远端任务分支；合并暂缓或存在未提交修改时全部保留；永不删除基线。
- 最后更新：YYYY-MM-DD。
```
