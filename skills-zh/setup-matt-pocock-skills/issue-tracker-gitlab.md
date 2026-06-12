# Issue tracker：GitLab

本 repo 的 issue 与 PRD 以 GitLab issue 的形式存在。所有操作请使用 [`glab`](https://gitlab.com/gitlab-org/cli) CLI。

## 约定

- **创建 issue**：`glab issue create --title "..." --description "..."`。多行描述请使用 heredoc。传入 `--description -` 可打开编辑器。
- **查看 issue**：`glab issue view <number> --comments`。使用 `-F json` 获取机器可读输出。
- **列出 issue**：`glab issue list -F json`，配合合适的 `--label` 过滤器。
- **在 issue 上评论**：`glab issue note <number> --message "..."`。GitLab 把评论称为 "notes"。
- **添加 / 移除 label**：`glab issue update <number> --label "..."` / `--unlabel "..."`。多个 label 可用逗号分隔，或重复传入该 flag。
- **关闭**：`glab issue close <number>`。`glab issue close` 不接受关闭评论，因此请先用 `glab issue note <number> --message "..."` 发布说明，然后再关闭。
- **Merge requests**：GitLab 把 PR 称为 "merge requests"。使用 `glab mr create`、`glab mr view`、`glab mr note` 等等 —— 形式与 `gh pr ...` 相同，只是把 `pr` 替换为 `mr`，把 `comment`/`--body` 替换为 `note`/`--message`。

repo 可从 `git remote -v` 推断 —— `glab` 在 clone 内运行时会自动完成此步。

## 当某个 skill 说 "publish to the issue tracker" 时

创建一个 GitLab issue。

## 当某个 skill 说 "fetch the relevant ticket" 时

运行 `glab issue view <number> --comments`。
