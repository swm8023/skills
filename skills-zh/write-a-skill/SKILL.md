---
name: write-a-skill
description: Create new agent skills with proper structure, progressive disclosure, and bundled resources. Use when user wants to create, write, or build a new skill.
---

# 编写 Skill

## 流程

1. **收集需求** —— 向用户询问：
   - 该 skill 覆盖什么任务/领域？
   - 它应处理哪些具体用例？
   - 是否需要可执行脚本，还是仅需说明文档？
   - 是否需要包含任何参考材料？

2. **起草 skill** —— 创建：
   - 含简洁说明的 SKILL.md
   - 当内容超过 500 行时补充额外的参考文件
   - 当需要确定性操作时补充工具脚本

3. **与用户一起审阅** —— 展示草稿并询问：
   - 这是否覆盖了你的用例？
   - 有没有缺漏或不清楚之处？
   - 是否有某些部分应当写得更详尽/更简略？

## Skill 结构

```
skill-name/
├── SKILL.md           # Main instructions (required)
├── REFERENCE.md       # Detailed docs (if needed)
├── EXAMPLES.md        # Usage examples (if needed)
└── scripts/           # Utility scripts (if needed)
    └── helper.js
```

## SKILL.md 模板

```md
---
name: skill-name
description: Brief description of capability. Use when [specific triggers].
---

# Skill Name

## Quick start

[Minimal working example]

## Workflows

[Step-by-step processes with checklists for complex tasks]

## Advanced features

[Link to separate files: See [REFERENCE.md](REFERENCE.md)]
```

## description 字段要求

description 是你的 agent 在决定加载哪个 skill 时**唯一能看到的内容**。它会与所有已安装的其他 skill 一起出现在 system prompt 中。你的 agent 会阅读这些 description，并根据用户的请求挑选相关的 skill。

**目标**：给你的 agent 刚好够用的信息，使其知道：

1. 该 skill 提供什么能力
2. 何时/为何触发它（具体的关键词、context、文件类型）

**格式**：

- 最多 1024 字符
- 用第三人称撰写
- 第一句：它做什么
- 第二句："Use when [具体触发条件]"

**好的示例**：

```
Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when user mentions PDFs, forms, or document extraction.
```

**糟糕的示例**：

```
Helps with documents.
```

糟糕的示例没有给你的 agent 任何方式将其与其他文档相关的 skill 区分开。

## 何时添加脚本

在以下情况下添加工具脚本：

- 操作是确定性的（校验、格式化）
- 相同的代码会被反复生成
- 错误需要显式处理

相比生成式代码，脚本可以节省 token 并提升可靠性。

## 何时拆分文件

在以下情况下拆分为多个文件：

- SKILL.md 超过 100 行
- 内容涉及不同领域（finance 与 sales 的 schema）
- 高级功能很少被使用

## 审阅清单

起草完成后，请确认：

- [ ] description 包含触发条件（"Use when..."）
- [ ] SKILL.md 不超过 100 行
- [ ] 没有时效性信息
- [ ] 术语保持一致
- [ ] 包含具体示例
- [ ] 引用层级仅一层
