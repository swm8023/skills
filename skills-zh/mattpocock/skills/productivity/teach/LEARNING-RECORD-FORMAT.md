# Learning Record Format

学习记录放在 `./learning-records/`，按 `0001-slug.md`、`0002-slug.md` 递增编号。目录按需创建，只在写首条记录时创建。

它们是教学中的 ADR，记录不明显的经验、关键洞见和已陈述的先验知识，指导以后会话，并用于计算最近发展区。

## Template

```md
# {Short title of what was learned or established}

{1-3 sentences: what was learned (or what prior knowledge was established), and why it matters for future sessions.}
```

这就是完整格式。学习记录可以只有一段，价值是记录_现在已知_什么及_为什么_它改变后续教学，而非填满章节。

## Optional sections

只有增加实际价值时才包含这些，大多数记录不需要。

- **Status** frontmatter（`active | superseded by LR-NNNN`）：旧理解错误并被替代时有用。
- **Evidence**：用户如何展示理解（回答问题、完成练习、提供过往经验）。以后可能重访该说法时有用。
- **Implications**：为以后会话解锁或排除什么。不明显时值得记录。

## Numbering

扫描 `./learning-records/`，找到最大编号并加一。

## When to write a learning record

满足任一项时编写记录：

1. **用户展示了对非简单内容的真实理解**：不是仅接触，而是证明能正确使用概念。这给后续教学建立新起点。
2. **用户透露先验知识**：“我已经知道 X。”记录，避免以后重复教学，也记录声称的_深度_。
3. **纠正了误解**：用户以前认为某事错误，现在理解原因。这些价值高，可预测相关主题的绊脚点。
4. **mission 随学习改变**：用户发现真正关心的内容与原想法不同。交叉链接 [[MISSION.md]] 并更新。

### What does _not_ qualify

- 仅仅讲过的内容。覆盖不等于学习，等待证据。
- 已在 [[GLOSSARY.md]] 以术语定义简洁记录的内容。不重复。
- 每次会话活动日志。学习记录不是日记，而是足以指导决策的洞见。

## Supersession

后续记录与旧记录冲突（用户理解加深或纠正）时，将旧记录标为 `Status: superseded by LR-NNNN`，而非删除。理解如何演变的历史本身也有价值。
