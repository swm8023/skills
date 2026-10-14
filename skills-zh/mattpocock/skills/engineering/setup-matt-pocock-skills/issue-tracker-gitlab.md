# Issue tracker: GitLab

本仓库的 issue 和 spec 存为 GitLab issue。所有操作使用 [`glab`](https://gitlab.com/gitlab-org/cli) CLI。

## Conventions

- **创建 issue**：`glab issue create --title "..." --description "..."`。多行 description 使用 heredoc。传 `--description -` 打开编辑器。
- **读取 issue**：`glab issue view <number> --comments`。使用 `-F json` 获取机器可读输出。
- **列出 issue**：`glab issue list -O json`，配合适当 `--label` 筛选。
- **comment**：`glab issue note <number> --message "..."`。GitLab 将 comment 称为“note”。
- **添加 / 移除 label**：`glab issue update <number> --label "..."` / `--unlabel "..."`。多个 label 可用逗号分隔或重复 flag。
- **关闭**：`glab issue close <number>`。`glab issue close` 不接受关闭 comment，因此先用 `glab issue note <number> --message "..."` 解释，再关闭。
- **Merge request**：GitLab 把 PR 称为“merge request”。使用 `glab mr create`、`glab mr view`、`glab mr note` 等，形状与 `gh pr ...` 相同，只是 `pr` 换为 `mr`，`comment`/`--body` 换为 `note`/`--message`。

从 `git remote -v` 推断仓库；`glab` 在 clone 内运行会自动完成。

## Merge requests as a triage surface

**MRs as a request surface: no.** _（仓库把外部 MR 视为功能请求时改为 `yes`；`/triage` 读取该开关。）_

设为 `yes` 后，MR 使用相同 label 和 state，通过 `glab mr` 对应命令：

- **读取 MR**：`glab mr view <number> --comments`，diff 使用 `glab mr diff <number>`。
- **列出待 triage 外部 MR**：`glab mr list -F json`，只保留作者不是项目 member/owner 的 MR（贡献者 MR，而非维护者进行中的工作）。
- **comment / label / close**：`glab mr note`、`glab mr update --label`/`--unlabel`、`glab mr close`。

不同于 GitHub，GitLab 的 issue 和 MR 分别编号，因此知道维护者所指入口后，`#42` 没有歧义。

## When a skill says "publish to the issue tracker"

创建 GitLab issue。

## When a skill says "fetch the relevant ticket"

运行 `glab issue view <number> --comments`。

## Wayfinding operations

由 `/wayfinder` 使用。**map** 是单个 issue，ticket 是 **child** issue。

- **Map**：带 `wayfinder:map` 标签的单个 issue，承载 Notes / Decisions-so-far / Fog 正文。`glab issue create --label wayfinder:map`。（支持原生 epic 的 GitLab 等级也可用 epic 承载 map；带标签 issue 在各版本都可用。）
- **Child ticket**：description 顶部写 `Part of #<map>`，带 `wayfinder:<type>` 标签（`research`/`prototype`/`grilling`/`task`）。认领后分配给推动工作的开发者。
- **Blocking**：GitLab **原生 blocking link**，是规范、UI 可见表达。通过 note 发布 `/blocked_by #<n>` quick action（`glab issue note <child> --message "/blocked_by #<blocker>"`）。原生 blocking link 属于 Premium/Ultimate 功能；免费版或不可用时退回 description 顶部 `Blocked by: #<n>, #<n>`。所有 blocker 关闭后无阻塞。
- **Frontier query**：`glab issue list -O json` 限制到 map 的 child，排除有开放 blocker 的项：原生 `blocked_by` 指向开放 issue（`glab api projects/:id/issues/<child-iid>/links`）、`Blocked by` 行有开放 issue，或已有 assignee；按 map 顺序优先。
- **Claim**：`glab issue update <n> --assignee @me`，是会话首次写入。
- **Resolve**：`glab issue note <n> --message "<answer>"`，再 `glab issue close <n>`，然后向 map 的 Decisions-so-far 追加 context pointer（概述与链接）。
