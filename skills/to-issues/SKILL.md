---
name: to-issues
description: 使用 tracer-bullet 垂直切片把 plan、spec 或 PRD 拆分为可在项目 issue tracker 上独立认领的 issue。当用户想把 plan 转换为 issue、创建实施工单或把工作拆分为 issue 时使用。
---

# To Issues

使用垂直切片（tracer bullet）把 plan 拆分为可独立认领的 issue。

issue tracker 和 triage label 的词汇表应当已经提供给你 —— 如果没有，运行 `/setup-matt-pocock-skills`。

## 流程

### 1. 收集 context

从对话 context 中已有的内容入手。如果用户把一个 issue 引用（issue 编号、URL 或路径）作为参数传入，从 issue tracker 拉取它，并阅读其完整正文与评论。

### 2. 探索 codebase（可选）

如果你尚未探索过 codebase，请先探索以理解代码当前的状态。issue 的标题与描述应使用该项目的领域术语词汇表，并尊重你所触及区域的 ADR。

### 3. 起草垂直切片

把 plan 拆分为 **tracer bullet** issue。每个 issue 都是一条贯穿所有集成层的端到端的细薄垂直切片，**不是**某一层的横向切片。

切片可以是 'HITL' 或 'AFK'。HITL 切片需要人工交互，例如架构决策或设计评审。AFK 切片可以在无人工交互的情况下被实现并 merge。尽可能优先选用 AFK 而不是 HITL。

<vertical-slice-rules>
- 每个切片提供一条狭窄但 COMPLETE 的、贯穿每一层（schema、API、UI、tests）的路径
- 一个完成的切片应当可以单独 demo 或验证
- 宁可多个细薄切片，也不要少数厚重切片
</vertical-slice-rules>

### 4. 向用户提问

把建议的拆分方案以编号列表的形式呈现。对每个切片展示：

- **Title**：简短的描述性名称
- **Type**：HITL / AFK
- **Blocked by**：哪些其他切片（如果有）必须先完成
- **User stories covered**：本切片涵盖了哪些 user story（如果源材料中有的话）

向用户询问：

- 粒度是否合适？（太粗 / 太细）
- 依赖关系是否正确？
- 是否有切片应当被合并或进一步拆分？
- 标记为 HITL 和 AFK 的切片是否正确？

迭代直至用户批准该拆分方案。

### 5. 把 issue 发布到 issue tracker

对每个被批准的切片，向 issue tracker 发布一个新的 issue。使用下方的 issue body 模板。这些 issue 被视为已为 AFK agent 准备就绪，因此除非另有指示，请使用正确的 triage label 发布它们。

按依赖顺序（blocker 优先）发布 issue，这样你就可以在 "Blocked by" 字段中引用真实的 issue 标识符。

<issue-template>
## Parent

对 issue tracker 上 parent issue 的引用（如果源材料是一个已有的 issue，否则省略本节）。

## What to build

对该垂直切片的简明描述。描述端到端的行为，而不是逐层的实现。

避免给出具体的文件路径或代码片段 —— 它们很快就会过时。例外：如果某个 prototype 产出了一个比文字描述更精确地编码某项决策的片段（state machine、reducer、schema、type shape），就把它内联在此处，并简短说明它来自一个 prototype。修剪至富含决策的部分 —— 不是一个可工作的 demo，只保留重要的部分。

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- 对阻塞工单的引用（如果有）

或者在没有 blocker 时写 "None - can start immediately"。

</issue-template>

不要关闭或修改任何 parent issue。
