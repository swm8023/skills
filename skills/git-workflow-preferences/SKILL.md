---
name: git-workflow-preferences
description: 在会持久化修改仓库的任务开始、验证检查点和结束时，通过 docs/user/git-preferences.md 决定并执行 branch/worktree、同步、commit、push、merge 和 cleanup；配置不存在或行为不明确时初始化或逐项询问。
---

# Git 工作流偏好

配置文件固定为当前 workspace 的 `docs/user/git-preferences.md`。

## 调用契约

调用方必须明确指定以下阶段之一，不能只写“参考 Git 偏好”或笼统地“调用 Git skill”：

- **prepare**：首次持久化写入前调用。加载偏好、刷新远端、记录任务开始前已有修改，并决定 branch/worktree 和同步行为。
- **checkpoint**：一个独立、已验证的工作单元结束后调用。按 Commit 偏好决定是否创建阶段性提交；默认不执行最终 push、merge 或 cleanup。
- **finalize**：产生持久化修改后，在本次 Git 生命周期结束或 handoff 前调用。根据任务结果和偏好处理剩余 commit、push、merge、cleanup，并报告未执行动作。

纯只读调查、需求讨论和不落盘的计划不调用本 skill。一旦写入 spec、plan、wiki、测试、代码或其他仓库文件，就必须先有本任务的 `prepare` 结果，并在本次 Git 生命周期结束前执行 `finalize`。`scope` 将 spec 审阅声明为连续生命周期时，等待和修改期间沿用 `prepare` 结果，不重复 `prepare` 或 `finalize`；spec 获批后以 `complete` 调用 `finalize`。流程取消、阻塞、验证失败或 handoff 时，按真实结果提前调用 `finalize`。

### prepare

1. 执行下文配置读取和初始化流程。
2. 检查当前仓库、branch、worktree、upstream、`git status -sb` 和实际远端状态；按 Sync 偏好先刷新远端，不能用未刷新的 tracking ref 判断同步。
3. 记录任务开始前已有的 modified、staged 和 untracked 文件。它们默认不属于当前任务；归属不明确时先询问用户。
4. 按 Branch/Worktree 和 Sync 偏好创建或沿用工作区。遇到会覆盖未提交修改、语义不明确的冲突或不安全的同步时暂停。
5. 返回并在当前任务中保留：仓库根目录、branch、worktree、base/upstream、开始时已有修改、Commit/Push/Merge/Cleanup 决策。

### checkpoint

1. 确认工作单元已有对应验证信号且验证通过。
2. 对照 prepare 记录检查实际 diff，只 stage 当前工作单元明确拥有的文件；存在任务外修改时禁止使用 `git add -A`。
3. 按 Commit 偏好创建或跳过提交。跳过时记录偏好或阻塞原因。
4. 返回 commit hash + subject，或“未提交”及明确原因。

### finalize

1. 接收任务结果：`complete`、`blocked`、`verification_failed` 或 `awaiting_review`，以及已执行验证的结果。
2. 对照 prepare 记录检查 `git status -sb` 和实际 diff，区分本任务修改与任务开始前已有修改。
3. 仅当任务结果和 Commit 偏好允许时，stage 当前任务文件并提交；不得夹带任务外修改。
4. 按 Sync、Push、Merge 和 Cleanup 偏好执行后续动作。push 遇到 non-fast-forward 时刷新远端，按 Sync 偏好 rebase/merge 后重试一次；语义冲突时暂停并询问用户。
5. push 后检查实际远端分支，不能只依赖本地 tracking ref。删除未合并分支、丢弃修改、强制推送等破坏性动作仍需单独确认。
6. 返回固定收尾结果：当前 branch/worktree、commit hash + subject、push 远端分支、merge/PR、cleanup，以及每个未执行动作的原因。

调用方在 finalize 返回前不得声称持久化修改任务已经完成。若偏好要求自动 commit/push 而动作未完成，最终状态必须是 blocked 或明确的部分完成，不能把“未提交”当作无理由的正常出口。

## 主流程

1. 读取配置文件。
2. 文件不存在时，按模板创建并进入初始化流程；初始化完成且冲突检查通过后，再执行 Git 操作。
3. 文件存在时，跳过初始化并读取当前任务所需的 Git 行为；已明确的直接采用，缺失、含糊或标记为“待确认”的按问问题的流程询问并记录。
4. 用户明确指定当次 Git 操作时，优先采用用户指定；当次指定不自动写回，只有用户明确要求长期采用时才写回。
5. 每次写入后检查整份配置是否冲突；有冲突时暂停后续 Git 操作，交给用户重新选择，写回后再次检查。
6. 删除未合并分支、丢弃修改、强制推送等破坏性操作仍需单独确认。

## 初始化流程

1. 使用配置模板创建文件并写入当前日期；模板内容是默认答案，不代表已经确认。
2. 先展示全部七个预设问题，再按问问题的流程逐项提问；不得因默认答案已写入而跳过任何问题。
3. 用户确认全部问题且整份配置无冲突后，结束初始化。

## 预设问题

1. 基线：基础分支是什么？
2. Branch/Worktree：何时创建 branch/worktree；创建时两者是否绑定；worktree 放在哪里、如何命名？
3. Sync：何时同步远端；使用 rebase 还是 merge；冲突如何处理？
4. Commit：是否自动 commit？
5. Merge：是否自动合回基线；是否创建 PR？
6. Push：何时 push？
7. Cleanup：push 后是否保留 branch/worktree？

## 问问题的流程

1. 初始化时依次询问全部七个预设问题；日常使用时只询问当前操作所需但尚未明确的问题。
2. 初始化提问前展示完整问题清单；每题附上模板中的当前默认答案，允许用户回答“采用预设”。
3. 一次只问一个问题，不把多个待确认项合并提问，也不跳过初始化问题。
4. 用户回答后，立即用一句话更新对应操作，并更新“最后更新”日期；采用预设时保留该操作原文。
5. 回答不完整时，在同一句中记录已确认内容，并将剩余内容标记为“待确认”；永久无需配置时记录为“不适用”。
6. 回写时只修改对应操作，保留配置文件中的其他内容与原有结构。
7. 每次写入后检查整份配置；若有冲突，一次处理一个冲突，列出冲突项和可选方案，让用户选择后回写并重新检查。

## 冲突检查

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
