# Issue tracker: GitHub

本仓库的 issue 和 spec 存为 GitHub issue。所有操作使用 `gh` CLI。

## Conventions

- **创建 issue**：`gh issue create --title "..." --body "..."`。多行正文使用 heredoc。
- **读取 issue**：`gh issue view <number> --json number,title,body,labels,comments`。
- **列出 issue**：`gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`，配合适当 `--label` 和 `--state` 筛选。
- **将 issue 设为 parent 的 sub-issue**：`gh issue create --parent <parent> ...`，或之后 `gh issue edit <parent> --add-sub-issue <child>`（`gh` 2.94+）。旧版 `gh`：`gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>`（数据库 id，见下方 **Blocking**）。不支持 sub-issue 时，在 child 正文顶部写 `Part of #<parent>`。
- **comment**：`gh issue comment <number> --body "..."`
- **添加 / 移除标签**：`gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **关闭**：`gh issue close <number> --comment "..."`

从 `git remote -v` 推断仓库；`gh` 在 clone 内运行会自动完成。

## Pull requests as a triage surface

**PRs as a request surface: no.** _（仓库把外部 PR 视为功能请求时改为 `yes`；`/triage` 读取该开关。）_

设为 `yes` 后，PR 使用相同 label 和 state，通过 `gh pr` 对应命令：

- **读取 PR**：`gh pr view <number> --comments`，diff 使用 `gh pr diff <number>`。
- **列出待 triage 的外部 PR**：`gh api --paginate 'repos/{owner}/{repo}/pulls?state=open' --jq '.[] | select(.author_association | IN("OWNER","MEMBER","COLLABORATOR") | not) | {number, title, author: .user.login, author_association, labels: [.labels[].name]}'`。
- **comment / label / close**：`gh pr comment`、`gh pr edit --add-label`/`--remove-label`、`gh pr close`。

GitHub 的 issue 和 PR 共用编号空间，裸 `#42` 可能是任一类型；先用 `gh pr view 42` 解析，失败退回 `gh issue view 42`。

## When a skill says "publish to the issue tracker"

创建 GitHub issue。

## When a skill says "fetch the relevant ticket"

按上文 **Read an issue** 读取。

## Wayfinding operations

由 `/wayfinder` 使用。**map** 是一个 issue，ticket 是 **child** issue。

- **Map**：带 `wayfinder:map` 标签的单个 issue，承载 Notes / Decisions-so-far / Fog 正文。`gh issue create --label wayfinder:map`。
- **Child ticket**：作为 GitHub sub-issue 链接 map（参见 **Make an issue a sub-issue of a parent**）。不支持时加入 map 正文的 task list，并在 child 顶部写 `Part of #<map>`。标签 `wayfinder:<type>`（`research`/`prototype`/`grilling`/`task`）。认领后分配给推动工作的开发者。
- **Blocking**：GitHub **原生 issue dependency**，是规范、UI 可见的表达。用 `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>` 添加边，其中 `<blocker-db-id>` 是 blocker 的数字 **database id**（`gh api repos/<owner>/<repo>/issues/<n> --jq .id`，_不是_ `#number` 或 `node_id`）。GitHub 返回 `issue_dependencies_summary.blocked_by`（仅开放 blocker，是真实关卡）。依赖不可用时，退回 child 顶部的 `Blocked by: #<n>, #<n>`。所有 blocker 关闭后无阻塞。
- **Frontier query**：列出 map 的开放 child（`gh issue list --state open`，限制到 map 的 sub-issue / task list），排除有开放 blocker（`issue_dependencies_summary.blocked_by > 0`，或 `Blocked by` 行的开放 issue）及 assignee 的项；按 map 顺序优先。
- **Claim**：`gh issue edit <n> --add-assignee @me`，是会话首次写入。
- **Resolve**：`gh issue comment <n> --body "<answer>"`，再 `gh issue close <n>`，然后向 map 的 Decisions-so-far 追加 context pointer（概述与链接）。
