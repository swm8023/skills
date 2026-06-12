# Issue tracker：GitHub

本 repo 的 issue 和 PRD 都以 GitHub issue 的形式存在。所有操作请使用 `gh` CLI。

## 约定

- **创建 issue**：`gh issue create --title "..." --body "..."`。多行正文请使用 heredoc。
- **读取 issue**：`gh issue view <number> --comments`，使用 `jq` 过滤评论，并同时获取标签。
- **列出 issue**：`gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`，并配合相应的 `--label` 和 `--state` 过滤器。
- **在 issue 上评论**：`gh issue comment <number> --body "..."`
- **添加 / 移除标签**：`gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **关闭**：`gh issue close <number> --comment "..."`

通过 `git remote -v` 推断 repo —— 在 clone 内运行时 `gh` 会自动完成此操作。

## 当某个 skill 说"publish to the issue tracker"时

创建一个 GitHub issue。

## 当某个 skill 说"fetch the relevant ticket"时

运行 `gh issue view <number> --comments`。
