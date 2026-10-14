# Issue tracker: Local Markdown

本仓库的 issue 和 spec 是 `.scratch/` 下的 Markdown 文件。

## Conventions

- 每个功能一个目录：`.scratch/<feature-slug>/`
- spec 位于 `.scratch/<feature-slug>/spec.md`
- implementation issue 每个 ticket 一个文件：`.scratch/<feature-slug>/issues/<NN>-<slug>.md`，从 `01` 编号，不合成单个 ticket 总文件
- triage 状态记录在每个 issue 文件靠顶部的 `Status:` 行（角色字符串见 `triage-labels.md`）
- comment 和对话历史追加在文件底部 `## Comments` 标题下

## When a skill says "publish to the issue tracker"

在 `.scratch/<feature-slug>/` 下创建新文件，必要时先创建目录。

## When a skill says "fetch the relevant ticket"

读取引用路径的文件。用户通常直接提供路径或 issue 编号。

## Wayfinding operations

由 `/wayfinder` 使用。**map** 是一个文件，每个 ticket 一个 **child** 文件。

- **Map**：`.scratch/<effort>/map.md`（Notes / Decisions-so-far / Fog 正文）。
- **Child ticket**：`.scratch/<effort>/issues/NN-<slug>.md`，从 `01` 编号，正文是问题。`Type:` 记录类型（`research`/`prototype`/`grilling`/`task`），`Status:` 记录 `claimed`/`resolved`。
- **Blocking**：靠顶部的 `Blocked by: NN, NN` 行。列出的每个文件都 `resolved` 后，ticket 无阻塞。
- **Frontier**：扫描 `.scratch/<effort>/issues/`，找开放、无阻塞、未认领文件；编号最前的优先。
- **Claim**：任何工作前先设置 `Status: claimed` 并保存。
- **Resolve**：在 `## Answer` 下追加答案，设 `Status: resolved`，再向 `map.md` 的 Decisions-so-far 追加 context pointer（概述与链接）。
