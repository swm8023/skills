# Issue tracker：本地 Markdown

本 repo 的 issue 与 PRD 以 markdown 文件形式存放在 `.scratch/` 目录下。

## 约定

- 每个 feature 一个目录：`.scratch/<feature-slug>/`
- PRD 文件为 `.scratch/<feature-slug>/PRD.md`
- 实施 issue 为 `.scratch/<feature-slug>/issues/<NN>-<slug>.md`，从 `01` 开始编号
- triage 状态以 `Status:` 行的形式记录在每个 issue 文件的顶部附近（角色字符串参见 `triage-labels.md`）
- 评论与对话历史追加到文件底部的 `## Comments` 标题之下

## 当某个 skill 说 "publish to the issue tracker" 时

在 `.scratch/<feature-slug>/` 下创建一个新文件（必要时创建该目录）。

## 当某个 skill 说 "fetch the relevant ticket" 时

读取所引用路径处的文件。用户通常会直接传入路径或 issue 编号。
