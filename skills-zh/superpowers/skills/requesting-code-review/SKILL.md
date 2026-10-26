---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
---

# 请求 Code Review

派发一个 code reviewer subagent，在问题级联之前把它们抓住。reviewer 拿到的是为评审精心构造的 context —— 而不是你 session 的历史。这让 reviewer 专注于工作产出本身，而不是你的思考过程，同时也保留了你自己的 context 以便继续工作。

**核心原则：** 尽早 review，频繁 review。

## 何时请求 Review

**强制：**
- subagent-driven development 中每个 task 之后
- 完成重要 feature 之后
- merge 到 main 之前

**可选但有价值：**
- 卡住时（获得新视角）
- refactor 前（建立基线检查）
- 修复复杂 bug 后

## 如何请求

**1. 获取 git SHA：**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # 或 origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. 派发 code reviewer subagent：**

使用 Task tool，类型为 `general-purpose`，填写 `code-reviewer.md` 中的模板

**占位符：**
- `{DESCRIPTION}` - 简要概述你构建了什么
- `{PLAN_OR_REQUIREMENTS}` - 它应该做什么
- `{BASE_SHA}` - 起始 commit
- `{HEAD_SHA}` - 结束 commit

**3. 根据反馈采取行动：**
- 立即修复 Critical 问题
- 在继续之前修复 Important 问题
- 把 Minor 问题记录下来稍后处理
- 如果 reviewer 不对就反驳（附上理由）

## 示例

```
[刚刚完成 Task 2: Add verification function]

You: Let me request code review before proceeding.

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Dispatch code reviewer subagent]
  DESCRIPTION: Added verifyIndex() and repairIndex() with 4 issue types
  PLAN_OR_REQUIREMENTS: Task 2 from docs/superpowers/plans/deployment-plan.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661

[Subagent returns]:
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready to proceed

You: [Fix progress indicators]
[Continue to Task 3]
```

## 与 Workflow 的集成

**Subagent-Driven Development：**
- 在每个 task 之后 review
- 在问题累积之前抓住它们
- 修复后再进入下一个 task

**Executing Plans：**
- 在每个 task 之后或在自然检查点 review
- 获取反馈，应用，继续

**Ad-Hoc Development：**
- merge 之前 review
- 卡住时 review

## 危险信号

**绝对不要：**
- 因为"它很简单"而跳过 review
- 忽略 Critical 问题
- 在 Important 问题未修复的情况下继续推进
- 与有效的技术反馈争辩

**如果 reviewer 错了：**
- 用技术理由反驳
- 展示能证明它可行的 code/tests
- 请求澄清

模板见：requesting-code-review/code-reviewer.md
