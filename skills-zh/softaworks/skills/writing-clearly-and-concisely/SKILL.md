---
name: writing-clearly-and-concisely
description: 在撰写供人阅读的 prose 时使用，包括文档、commit message、错误信息、解释、报告或 UI 文案。应用 Strunk 历久有效的规则，让文字更清晰、有力、专业。
---

# Writing Clearly and Concisely

## Overview

文字要清晰有力。本 skill 同时说明应该怎样写（Strunk 的原则），以及不应该怎样写（AI patterns）。

## When to Use This Skill

每当撰写供人阅读的 prose 时，使用本 skill：

- 文档、README 文件、技术说明
- commit message、pull request 描述
- 错误信息、UI 文案、帮助文字、注释
- 报告、摘要或其他说明
- 为提高清晰度而编辑文本

**只要是在写供人阅读的句子，就使用本 skill。**

## Limited Context Strategy

context 紧张时：

1. 根据自己的判断写出初稿
2. 将初稿和相关章节文件交给一个 subagent
3. 请 subagent 做 copyedit，并返回修订稿

只加载一个章节（约 1,000–4,500 tokens），而不是全部内容，可以显著节省 context。

## Elements of Style

William Strunk Jr. 的 *The Elements of Style*（1918）教你写得清楚，并坚决删去冗余。

### Rules

**Elementary Rules of Usage（Grammar/Punctuation）**：

1. singular possessive 加 's
2. series 中除最后一项外，每一项后都加 comma
3. 用 comma 括起 parenthetic expressions
4. 引出 co-ordinate clause 的 conjunction 前加 comma
5. 不要用 comma 连接 independent clauses
6. 不要把一个句子拆成两个
7. 句首 participial phrase 指向 grammatical subject

**Elementary Principles of Composition**：

8. 一个段落只讲一个主题
9. 用 topic sentence 开始段落
10. **使用 active voice**
11. **采用 positive form 表述**
12. **使用明确、具体的语言**
13. **删去不必要的词**
14. 避免接连使用 loose sentences
15. 以相似形式表达 co-ordinate ideas
16. **把相关的词放在一起**
17. 摘要中保持 tense 一致
18. **把需要强调的词放在句末**

### Reference Files

上面的规则概括自 Strunk 原著。完整解释和示例见下表：

| 章节 | 文件 | 约 Tokens |
|---------|------|---------|
| Grammar、punctuation 与 comma 规则 | `02-elementary-rules-of-usage.md` | 2,500 |
| 段落结构、active voice 与简洁表达 | `03-elementary-principles-of-composition.md` | 4,500 |
| 标题、引文与格式 | `04-a-few-matters-of-form.md` | 1,000 |
| 选词与常见错误 | `05-words-and-expressions-commonly-misused.md` | 4,000 |

**多数任务只需 `03-elementary-principles-of-composition.md`** — 它涵盖 active voice、positive form、concrete language，以及删去不必要的词。

## AI Writing Patterns to Avoid

LLM 会 regress to statistical means，生成笼统、浮夸的 prose。避免：

- **Puffery：** pivotal、crucial、vital、testament、enduring legacy
- **空泛的 "-ing" phrases：** ensuring reliability、showcasing features、highlighting capabilities
- **Promotional adjectives：** groundbreaking、seamless、robust、cutting-edge
- **过度使用的 AI vocabulary：** delve、leverage、multifaceted、foster、realm、tapestry
- **过度排版：** 滥用 bullets、装饰性 emoji，或隔一个词就加 bold

要具体，不要夸大。说明它实际做什么。

关于这些 patterns 为何出现的完整研究，见 `signs-of-ai-writing.md`。Wikipedia editors 编写这份指南以识别 AI-generated submissions；其中的 patterns 有充分记录，并经实地检验。

## Bottom Line

为人类读者写作？加载 `elements-of-style/` 中的相关章节，并应用规则。对多数任务，`03-elementary-principles-of-composition.md` 已涵盖最重要的内容。
