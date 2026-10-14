# Out-of-Scope 知识库

repo 中的 `.out-of-scope/` 目录用于持久化记录被拒绝的功能请求。它有两个用途：

1. **机构记忆** —— 记录某个功能为何被拒绝，这样在 issue 关闭后，决策的推理过程不会丢失
2. **去重** —— 当新进来的 issue 匹配到先前的拒绝记录时，skill 可以呈现先前的决策，而不是重新争论一遍

## 目录结构

```
.out-of-scope/
├── dark-mode.md
├── plugin-system.md
└── graphql-api.md
```

每个**概念**对应一个文件，而不是每个 issue 一个文件。请求同一件事的多个 issue 会被归到同一个文件下。

## 文件格式

文件应当以一种轻松、可读的风格书写 —— 更像一份简短的设计文档，而不是一条数据库条目。使用段落、代码示例和例子，让推理过程对第一次接触它的人来说清晰且有用。

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

- #42 — "Add dark mode support"
- #87 — "Night theme for accessibility"
- #134 — "Dark theme option"
```

### 命名文件

为概念使用一个简短、描述性的 kebab-case 名称：`dark-mode.md`、`plugin-system.md`、`graphql-api.md`。这个名称应当足够易于识别，让浏览该目录的人无需打开文件就能理解什么被拒绝了。

### 写明理由

理由应当是实质性的 —— 不是"我们不想要这个"，而是为什么。好的理由会引用：

- 项目范围或理念（"本项目专注于 X；theming 是下游关心的事"）
- 技术约束（"支持它需要 Y，而 Y 与我们的 Z 架构冲突"）
- 战略决策（"我们选择使用 A 而不是 B，因为……"）

理由应当是持久的。避免引用临时性的情况（"我们现在太忙了"）—— 那些不是真正的拒绝，而是延期。

## 何时查看 `.out-of-scope/`

在 triage 期间（步骤 1：收集 context），读取 `.out-of-scope/` 中的所有文件。在评估新的 issue 时：

- 检查该请求是否匹配现有的 out-of-scope 概念
- 匹配是按概念相似度，而不是按关键字 —— "night theme" 匹配 `dark-mode.md`
- 如果有匹配，将其呈现给维护者："这与 `.out-of-scope/dark-mode.md` 类似 —— 我们之前因为 [原因] 拒绝过它。你现在仍然这么认为吗？"

维护者可能会：

- **确认** —— 新的 issue 会被添加到现有文件的 "Prior requests" 列表中，然后关闭
- **重新考虑** —— 删除或更新 out-of-scope 文件，issue 进入正常的 triage 流程
- **不同意** —— 这些 issue 相关但不同，继续走正常的 triage 流程

## 何时向 `.out-of-scope/` 写入

仅当一个**增强请求**（不是 bug）被拒绝为 `wontfix` 时。流程：

1. 维护者判定某个功能请求超出范围
2. 检查是否已经存在匹配的 `.out-of-scope/` 文件
3. 如果存在：将新的 issue 追加到 "Prior requests" 列表
4. 如果不存在：创建一个新文件，包含概念名称、决策、理由，以及第一个 prior request
5. 在 issue 上发表评论，解释决策并提及 `.out-of-scope/` 文件
6. 给该 issue 打上 `wontfix` 标签并关闭

## 更新或移除 out-of-scope 文件

如果维护者对先前被拒绝的概念改变了主意：

- 删除该 `.out-of-scope/` 文件
- skill 不需要重新打开旧的 issue —— 它们是历史记录
- 触发重新考虑的新 issue 走正常的 triage 流程
