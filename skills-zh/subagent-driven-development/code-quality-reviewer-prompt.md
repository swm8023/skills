# 代码质量审查者 Prompt 模板

在派发代码质量审查 subagent 时使用此模板。

**目的：** 验证实现是否构建良好（整洁、已测试、可维护）

**仅在 spec 合规性审查通过之后才派发。**

```
Task tool (general-purpose):
  Use template at requesting-code-review/code-reviewer.md

  DESCRIPTION: [task summary, from implementer's report]
  PLAN_OR_REQUIREMENTS: Task N from [plan-file]
  BASE_SHA: [commit before task]
  HEAD_SHA: [current commit]
```

**除了标准的代码质量关注点之外，审查者还应检查：**
- 每个文件是否具有一个清晰的职责，并带有定义良好的 interface？
- 各个单元是否被分解得可以独立地被理解和测试？
- 实现是否遵循了 plan 中的文件结构？
- 此次实现是否创建了已经过大的新文件，或显著增大了已有文件？（不要标记预先存在的文件大小 —— 关注此次变更所贡献的部分。）

**代码审查者返回：** 优点（Strengths）、问题（Issues，Critical/Important/Minor）、评估（Assessment）
