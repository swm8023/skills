---
name: to-prd
description: Turn the current conversation context into a PRD and publish it to the project issue tracker. Use when user wants to create a PRD from the current context.
---

本 skill 接收当前对话 context 以及对 codebase 的理解，生成一份 PRD。**不要**对用户进行访谈 —— 只需基于你已经掌握的信息进行综合即可。

issue tracker 以及 triage 标签词表应该已经提供给你 —— 如果没有，请运行 `/setup-matt-pocock-skills`。

## 流程

1. 如果你尚未了解 codebase 的当前状态，先探索 repo 以获取理解。在整份 PRD 中使用项目的领域术语词表，并遵守你所改动区域内的所有 ADR。

2. 勾画出你将用来测试该 feature 的接缝（seam）。应优先使用已有的 seam，而不是新建。使用尽可能高层次的 seam。如果确实需要新的 seam，请在尽可能高的位置提出。

与用户确认这些 seam 是否符合他们的预期。

3. 使用下面的模板撰写 PRD，然后将其发布到项目的 issue tracker 上。打上 `ready-for-agent` triage 标签 —— 不需要额外 triage。

<prd-template>

## Problem Statement

从用户视角出发，用户当前面临的问题。

## Solution

从用户视角出发，针对该问题的解决方案。

## User Stories

一份**很长**的、带编号的 user story 列表。每条 user story 应采用如下格式：

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

这份 user story 列表应当极其详尽，覆盖该 feature 的方方面面。

## Implementation Decisions

已经做出的实现决策列表。可以包括：

- 将要构建/修改的模块
- 将被修改的这些模块的接口
- 来自开发者的技术澄清
- 架构决策
- Schema 变更
- API 契约
- 具体的交互方式

**不要**包含具体的文件路径或代码片段。它们可能很快就会过时。

例外：如果某个 prototype 产出了一个比文字更精确地表达某个决策的片段（state machine、reducer、schema、type shape），可以将其内联到相关决策中，并简短说明它来自一个 prototype。仅保留与决策密切相关的部分 —— 不是一个可运行的 demo，只是重要的几段。

## Testing Decisions

已经做出的测试决策列表。包括：

- 对什么是好测试的描述（只测试外部行为，不测试实现细节）
- 将要测试哪些模块
- 测试方面的 prior art（即 codebase 中类似类型的已有测试）

## Out of Scope

对哪些内容超出本 PRD 范围的描述。

## Further Notes

关于该 feature 的任何其他备注。

</prd-template>
