# Codex 工具映射

skill 使用 Claude Code 的 tool 名称。当你在某个 skill 中遇到这些名称时，请使用你所在平台的等价工具：

| skill 中的引用 | Codex 等价物 |
|-----------------|------------------|
| `Task` tool（dispatch subagent） | `spawn_agent`（见 [Subagent dispatch requires multi-agent support](#subagent-dispatch-requires-multi-agent-support)） |
| 多次 `Task` 调用（parallel） | 多次 `spawn_agent` 调用 |
| Task 返回结果 | `wait_agent` |
| Task 自动完成 | `close_agent` 释放槽位 |
| `TodoWrite`（任务追踪） | `update_plan` |
| `Skill` tool（调用某个 skill） | skill 原生加载 —— 直接按说明执行即可 |
| `Read`、`Write`、`Edit`（文件） | 使用你的原生文件 tool |
| `Bash`（运行命令） | 使用你的原生 shell tool |

## Subagent dispatch requires multi-agent support

在你的 Codex config（`~/.codex/config.toml`）中添加：

```toml
[features]
multi_agent = true
```

这会为 `dispatching-parallel-agents` 和 `subagent-driven-development` 之类的 skill 启用 `spawn_agent`、`wait_agent` 和 `close_agent`。

历史说明：早于 `rust-v0.115.0` 的 Codex 构建将 spawned-agent
的等待暴露为 `wait`。当前 Codex 对 spawned agent 使用 `wait_agent`。而
`wait` 这个名字现在属于 code-mode 的 `exec/wait`，用于按 `cell_id` 恢复一个已 yield 的 exec
cell；它不是 spawned-agent 的结果获取 tool。

## 环境检测

会创建 worktree 或结束 branch 的 skill，应在继续之前用只读的 git 命令
检测自己的环境：

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

- `GIT_DIR != GIT_COMMON` → 已经在一个 linked worktree 中（跳过创建）
- `BRANCH` 为空 → detached HEAD（无法在 sandbox 中执行 branch/push/PR）

参见 `using-git-worktrees` 的 Step 0 与 `finishing-a-development-branch`
的 Step 1，了解每个 skill 如何使用这些信号。

## Codex App 收尾

当 sandbox 阻止 branch/push 操作时（在一个外部托管的 worktree 中处于
detached HEAD），agent 会 commit 所有工作并告知
用户使用 App 的原生控件：

- **"Create branch"** —— 为 branch 命名，然后通过 App UI 进行 commit/push/PR
- **"Hand off to local"** —— 将工作转移到用户本地 checkout

agent 仍然可以运行测试、stage 文件，并输出建议的 branch
名称、commit message 与 PR 描述供用户复制。
