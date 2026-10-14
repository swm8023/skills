---
name: to-spec
description: "把当前对话转为 spec 并发布到项目 issue tracker：不做访谈，只综合已经讨论的内容。"
disable-model-invocation: true
---

本 skill 使用当前对话 context 和对代码库的理解产出 spec。不要访谈用户，只综合已经知道的内容。

issue tracker 和 triage 标签词汇应已提供给你。如果没有，告诉用户运行 `/setup-matt-pocock-skills`。

## Process

1. 若尚未探索仓库，先了解代码库现状。整个 spec 使用项目领域术语表的词汇，并遵守涉及区域的 ADR。

2. 勾画测试功能所用的 seam。优先使用现有 seam，而不是新建。使用尽可能高层的 seam；必须新建时，也在尽可能高的位置提出。代码库中的 seam 越少越好，理想数量是一个。

与用户确认这些 seam 符合其预期。

3. 使用下方模板编写 spec，再发布到项目 issue tracker。添加 `ready-for-agent` triage 标签，无需再次 triage。

<spec-template>

## Problem Statement

从用户视角描述用户面临的问题。

## Solution

从用户视角描述问题的解决方案。

## User Stories

一份很长的、编号排列的 user story 清单。每项使用以下格式：

1. 作为 <角色>，我希望 <功能>，以便 <收益>

<user-story-example>
1. 作为手机银行客户，我希望查看各账户余额，以便更明智地决定支出
</user-story-example>

user story 清单应非常全面，覆盖功能的所有方面。

## Implementation Decisions

已确定的 implementation 决策清单，可以包括：

- 将构建或修改的 module
- 将修改的 module interface
- 开发者给出的技术澄清
- 架构决策
- schema 变更
- API 契约
- 具体交互

不要包含具体文件路径或代码片段，它们可能很快过时。

例外：如果 prototype 生成了比文字更准确表达决策的片段（状态机、reducer、schema、类型形状），将其内联到相关决策中，并简要注明来自 prototype。只保留承载决策的部分，而不是可运行 demo，只需重要内容。

## Testing Decisions

已确定的测试决策清单，包括：

- 什么是好测试（只测试外部行为，不测试 implementation 细节）
- 哪些 module 将被测试
- 测试先例（例如代码库中相似类型的测试）

## Out of Scope

描述不属于本 spec scope 的内容。

## Further Notes

关于该功能的其他备注。

</spec-template>
