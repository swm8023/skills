# Copilot CLI 工具对照表

skill 使用 Claude Code 的 tool 名称。当你在某个 skill 中遇到这些名称时，请使用你所在平台的等价工具：

| skill 中的引用 | Copilot CLI 等价工具 |
|-----------------|----------------------|
| `Read`（读取文件） | `view` |
| `Write`（创建文件） | `create` |
| `Edit`（编辑文件） | `edit` |
| `Bash`（执行命令） | `bash` |
| `Grep`（搜索文件内容） | `grep` |
| `Glob`（按名称搜索文件） | `glob` |
| `Skill` tool（调用某个 skill） | `skill` |
| `WebFetch` | `web_fetch` |
| `Task` tool（派发 subagent） | `task`，配合 `agent_type: "general-purpose"` 或 `"explore"` |
| 多次 `Task` 调用（parallel） | 多次 `task` 调用 |
| Task 状态 / 输出 | `read_agent`、`list_agents` |
| `TodoWrite`（任务跟踪） | `sql`，配合内置的 `todos` 表 |
| `WebSearch` | 无等价工具 —— 使用 `web_fetch` 配合搜索引擎 URL |
| `EnterPlanMode` / `ExitPlanMode` | 无等价工具 —— 保持在主 session 中 |

## 异步 shell session

Copilot CLI 支持持久化的异步 shell session，这在 Claude Code 中没有直接的等价物：

| Tool | 用途 |
|------|---------|
| `bash` 配合 `async: true` | 在后台启动一个长时间运行的命令 |
| `write_bash` | 向正在运行的异步 session 发送输入 |
| `read_bash` | 从异步 session 读取输出 |
| `stop_bash` | 终止一个异步 session |
| `list_bash` | 列出所有活跃的 shell session |

## 其他 Copilot CLI 工具

| Tool | 用途 |
|------|---------|
| `store_memory` | 持久化关于 codebase 的事实，供未来 session 使用 |
| `report_intent` | 用当前意图更新 UI 状态栏 |
| `sql` | 查询 session 的 SQLite 数据库（todos、元数据） |
| `fetch_copilot_cli_documentation` | 查阅 Copilot CLI 文档 |
| GitHub MCP 工具（`github-mcp-server-*`） | 原生 GitHub API 访问（issues、PR、代码搜索） |
