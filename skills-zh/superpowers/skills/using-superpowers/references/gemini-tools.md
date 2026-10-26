# Gemini CLI tool 映射

Skill 使用的是 Claude Code 的 tool 名称。当你在 skill 中遇到这些名称时，请使用你所在平台的对应物：

| Skill 中的引用 | Gemini CLI 对应物 |
|-----------------|----------------------|
| `Read`（读取文件） | `read_file` |
| `Write`（创建文件） | `write_file` |
| `Edit`（编辑文件） | `replace` |
| `Bash`（运行命令） | `run_shell_command` |
| `Grep`（搜索文件内容） | `grep_search` |
| `Glob`（按文件名搜索） | `glob` |
| `TodoWrite`（任务追踪） | `write_todos` |
| `Skill` tool（调用某个 skill） | `activate_skill` |
| `WebSearch` | `google_web_search` |
| `WebFetch` | `web_fetch` |
| `Task` tool（派发 subagent） | `@agent-name`（参见 [Subagent 支持](#subagent-support)） |

## Subagent 支持

Gemini CLI 通过 `@` 语法原生支持 subagent。使用内置的 `@generalist` agent 可以派发任意任务 —— 它可以访问所有 tool，并遵循你提供的 prompt。

当一个 skill 要求派发某种命名类型的 agent 时，请使用 `@generalist` 并附上该 skill 的 prompt 模板中填好的完整 prompt：

| Skill 指令 | Gemini CLI 对应物 |
|-------------------|----------------------|
| `Task tool (superpowers:implementer)` | `@generalist` 加上填好的 `implementer-prompt.md` 模板 |
| `Task tool (superpowers:spec-reviewer)` | `@generalist` 加上填好的 `spec-reviewer-prompt.md` 模板 |
| `Task tool (superpowers:code-reviewer)` | `@code-reviewer`（捆绑的 agent）或 `@generalist` 加上填好的 review prompt |
| `Task tool (superpowers:code-quality-reviewer)` | `@generalist` 加上填好的 `code-quality-reviewer-prompt.md` 模板 |
| `Task tool (general-purpose)` 加上内联 prompt | `@generalist` 加上你的内联 prompt |

### Prompt 填充

Skill 提供的 prompt 模板带有像 `{WHAT_WAS_IMPLEMENTED}` 或 `[FULL TEXT of task]` 这样的占位符。请填充所有占位符，并将完整的 prompt 作为 message 传递给 `@generalist`。Prompt 模板本身已经包含 agent 的角色、review 标准以及预期的输出格式 —— `@generalist` 会按其执行。

### 并行派发

Gemini CLI 支持 parallel subagent 派发。当一个 skill 要求你 parallel 派发多个互相独立的 subagent 任务时，请在同一个 prompt 中一并请求所有这些 `@generalist` 或命名 subagent 任务。互相有依赖的任务保持串行，但不要仅仅为了让历史记录更简单而把互相独立的 subagent 任务串行化。

## 额外的 Gemini CLI tool

以下 tool 在 Gemini CLI 中可用，但在 Claude Code 中没有对应物：

| Tool | 用途 |
|------|---------|
| `list_directory` | 列出文件与子目录 |
| `save_memory` | 跨 session 把事实持久化到 GEMINI.md |
| `ask_user` | 向用户请求结构化输入 |
| `tracker_create_task` | 丰富的任务管理（创建、更新、列出、可视化） |
| `enter_plan_mode` / `exit_plan_mode` | 在做出更改之前切换到只读的研究模式 |
