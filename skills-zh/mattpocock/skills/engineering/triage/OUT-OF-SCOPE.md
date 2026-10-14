# Out-of-Scope Knowledge Base

仓库中的 `.out-of-scope/` 存放被拒绝功能请求的持久记录，有两个目的：

1. **Institutional memory**：记录功能为何被拒绝，避免 issue 关闭后丢失理由
2. **Deduplication**：新 issue 与旧拒绝相符时，展示以前的决策，而不是重新争论

## Directory structure

```
.out-of-scope/
├── dark-mode.md
├── plugin-system.md
└── graphql-api.md
```

每个 **concept** 一个文件，而非每个 issue 一个。请求相同内容的多个 issue 归入同一文件。

## File format

以轻松易读风格写，更像短设计文档，而非数据库条目。使用段落、代码和示例，让第一次遇到的人也能理解理由并获益。

```markdown
# Dark Mode

This project does not support dark mode or user-facing theming.

## Why this is out of scope

The rendering pipeline assumes a single color palette defined in
`ThemeConfig`. Supporting multiple themes would require:

- A theme context provider wrapping the entire component tree
- Per-component theme-aware style resolution
- A persistence layer for user theme preferences

This is a significant architectural change that doesn't align with the
project's focus on content authoring. Theming is a concern for downstream
consumers who embed or redistribute the output.

```ts
// The current ThemeConfig interface is not designed for runtime switching:
interface ThemeConfig {
  colors: ColorPalette; // single palette, resolved at build time
  fonts: FontStack;
}
```

## Prior requests

- #42: "Add dark mode support"
- #87: "Night theme for accessibility"
- #134: "Dark theme option"
```

### Naming the file

概念文件使用简短、描述性的 kebab-case 名：`dark-mode.md`、`plugin-system.md`、`graphql-api.md`。浏览目录的人不打开文件，也应能认出拒绝了什么。

### Writing the reason

理由应有实质内容，不是“我们不想做”，而是解释为什么。好的理由引用：

- 项目 scope 或理念（“项目聚焦 X；主题是下游问题”）
- 技术约束（“支持它需要 Y，与我们的 Z 架构冲突”）
- 战略决策（“我们选 A 而非 B，因为……”）

理由应持久。避免临时情境（“现在太忙”）；那不是拒绝，而是延期。

## When to check `.out-of-scope/`

triage 期间（步骤 1：Gather context），阅读 `.out-of-scope/` 中所有文件。评估新 issue 时：

- 检查请求是否匹配已有 out-of-scope 概念
- 按概念相似度匹配，而非关键词：“night theme”匹配 `dark-mode.md`
- 匹配时告诉维护者：“这与 `.out-of-scope/dark-mode.md` 类似。以前因 [理由] 拒绝。你现在仍这样认为吗？”

维护者可以：

- **Confirm**：将新 issue 加入既有文件的“Prior requests”，再关闭
- **Reconsider**：删除或更新 out-of-scope 文件，issue 正常 triage
- **Disagree**：请求相关但不同，继续正常 triage

## When to write to `.out-of-scope/`

只在 **enhancement**（不是 bug）被*拒绝*为 `wontfix` 时写入。enhancement PR 与 issue 一样：记录被拒绝 PR，避免同一请求以新代码再次出现。

因为**已实现**而以 `wontfix` 关闭时，**不要**写入。那是已有功能，而不是拒绝；记录会污染去重检查，造成虚假拒绝。关闭 comment 应指向功能已有位置。

流程：

1. 维护者确定功能请求 out of scope
2. 检查是否已有匹配的 `.out-of-scope/` 文件
3. 如果有，将新 issue 追加到“Prior requests”
4. 如果没有，新建文件，记录概念名、决策、理由及首个历史请求
5. 在 issue 发 comment 说明决策并提及 `.out-of-scope/` 文件
6. 使用 `wontfix` 标签关闭 issue

## Updating or removing out-of-scope files

维护者改变对以前拒绝概念的看法时：

- 删除 `.out-of-scope/` 文件
- skill 不必重新打开旧 issue，它们是历史记录
- 触发重新考虑的新 issue 走正常 triage
