> 本文件记录本项目跨会话生效的 Git 工作流偏好。

# Git Preferences

- 基线：使用 `main`，禁止任何删除基线分支的操作。
- Branch/Worktree：仅落 spec 的任务创建 feature branch，并绑定创建项目根目录 `.worktree/<branch-name>`；不落 spec 的任务和 bug 修复沿用当前分支，同时确保 `.worktree/` 被 Git 忽略。
- Sync：prepare 时先刷新并同步远端最新状态；提交后、push 前再次刷新并 rebase 到远端最新状态；明确冲突自动解决，存在语义歧义时询问用户。
- Commit：checkpoint 或 finalize 时，当前工作单元完成且验证通过后自动 commit；未完成或验证失败时不提交。
- Merge：不创建 PR；任务完成后，本地 `main` 工作树干净则自动合入，存在修改则暂不合入。
- Push：finalize 时 push 当前分支并核对实际远端 SHA；若随后成功合入 `main`，再自动 push 并核对 `main`；因 `main` 存在修改而暂缓合并时，仍 push 当前分支。
- Cleanup：任务分支成功合入并 push `main` 后，自动删除干净的任务 worktree、本地任务分支和远端任务分支；合并暂缓或存在未提交修改时全部保留；永不删除基线。
- 最后更新：2026-08-07。
