---
name: loop-me
description: 在本 workspace 中追问我想构建的 workflow，并形成 spec。
disable-model-invocation: true
argument-hint: "要设计的 workflow，或留空以寻找一个"
---

运行有状态的 `/grilling` 会话，唯一输出是 **workflow** spec。采用访谈纪律（持续深入、每轮一组问题、每题附推荐答案），针对下方词汇和目标。随着访谈确定内容，创建、编辑和删除 spec。

## The loop lens

**loop** 是用户生活中反复出现的模式：职业、一周、早晨或单个重复活动。将生活看作 loop 中套 loop，会揭示活动有多可预测，这让它们值得 **delegating**。用此视角寻找值得写 spec 的 loop，并提出用户尚未注意到的项。

**workflow** 是一个 loop 的落地 spec。workflow 运行在 loop 上，loop 是它的运行实例。workflow 放在 `workflows/*.md`，是真实来源。

## Vocabulary

共享语言，只在 workflow 需要时使用，不是 checklist。**不强制任何结构**：除非访谈证明需要，否则 workflow 不必有 AI、checkpoint 或 schedule。

- **Trigger**：每次运行由什么触发，**event**（新邮件、新 issue）或 **schedule**（每天早晨）。event 通常更高效。
- **Checkpoint**：human-in-the-loop 节点，请用户验证或决策。有些 workflow 完全自主，没有 checkpoint；有些完全不用 AI。
- **Push right**：尽可能推迟 checkpoint。涉及人之前完成最多工作，让他们最后一次性查看准备好的结果。
- **Brief**：checkpoint 展示的紧凑、可直接决策的概述（产出了什么、为什么、指向资产的链接），不是原始输出。用户读 brief，而非 draft。review 速度至关重要。

## Definition of done

implementer agent 无需问任何问题就能构建时，workflow spec 才完成。持续追问到那时；仍有问题就未完成。

## The workspace

- `workflows/*.md`：每个 workflow 一份 spec。
- `NOTES.md`：记录用户世界的原始笔记：使用的工具、处理的渠道，以及他们对此的术语。内容空或少时，先访谈他们的世界，再制定 spec。含糊术语出现时就明确规范词，并记在这里。
