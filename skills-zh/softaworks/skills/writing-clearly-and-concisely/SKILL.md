---
name: writing-clearly-and-concisely
description: 在撰写面向人类读者的文字时使用，包括文档、commit message、错误信息、解释、报告或 UI 文案。应用 Strunk 的写作规则，让表达更清晰、有力、专业。
---

# Writing Clearly and Concisely

## Overview

表达要清晰有力。本 skill 同时说明应该怎样写（Strunk 的原则），以及应该避免什么（AI 写作模式）。

## When to Use This Skill

凡是为人类读者撰写文字，都可以使用本 skill：

- 文档、README 文件、技术说明
- commit message、pull request 描述
- 错误信息、UI 文案、帮助文字、注释
- 报告、摘要或其他说明
- 为提高清晰度而编辑文本

**只要是在写供人阅读的句子，就使用本 skill。**

## Limited Context Strategy

上下文紧张时：

1. 根据自己的判断写出初稿
2. 将初稿和相关章节文件交给一个 subagent
3. 请 subagent 编辑文字，并返回修订稿

只加载一个章节（约 1,000–4,500 tokens），而不是全部资料，可以显著节省上下文。

## Elements of Style

William Strunk Jr. 的 *The Elements of Style*（1918）教你写得清楚，并坚决删去冗余。

### Rules

**基本用法规则（语法与标点）**：

1. 单数名词的所有格加 's
2. 并列项中，最后一项之前的每一项后面都加逗号
3. 用逗号括起插入语
4. 引出并列分句的连词前加逗号
5. 不要用逗号连接独立分句
6. 不要把一个句子拆成两个
7. 句首分词短语应修饰句子的语法主语

**基本行文原则**：

8. 一个段落只讲一个主题
9. 用主题句开始段落
10. **使用主动语态**
11. **采用肯定表达**
12. **使用明确、具体的语言**
13. **删去不必要的词**
14. 避免连续使用松散句
15. 以相似形式表达并列思想
16. **把相关的词放在一起**
17. 摘要中保持时态一致
18. **把需要强调的词放在句末**

### Reference Files

上面的规则概括自 Strunk 原著。完整解释和示例见下表：

| 章节 | 文件 | 约 Tokens |
|---------|------|---------|
| 语法、标点与逗号规则 | `02-elementary-rules-of-usage.md` | 2,500 |
| 段落结构、主动语态与简洁表达 | `03-elementary-principles-of-composition.md` | 4,500 |
| 标题、引文与格式 | `04-a-few-matters-of-form.md` | 1,000 |
| 选词与常见错误 | `05-words-and-expressions-commonly-misused.md` | 4,000 |

**多数任务只需 `03-elementary-principles-of-composition.md`** -- 它涵盖主动语态、肯定表达、具体语言以及删去多余用词。

## AI Writing Patterns to Avoid

LLM 容易回归统计平均，生成空泛、浮夸的文字。避免：

- **夸大措辞：** pivotal、crucial、vital、testament、enduring legacy
- **空泛的“-ing”短语：** ensuring reliability、showcasing features、highlighting capabilities
- **宣传性形容词：** groundbreaking、seamless、robust、cutting-edge
- **AI 常用词：** delve、leverage、multifaceted、foster、realm、tapestry
- **过度排版：** 滥用项目列表、装饰性 emoji，或隔几个词就加粗

具体说明它实际做什么，不要夸大其词。

关于这些模式为何出现的完整研究，见 `signs-of-ai-writing.md`。Wikipedia 编辑为识别 AI 生成的投稿而编写了该指南，其中的模式有详细记录，并经过实践检验。

## Bottom Line

为人类读者写作时，加载 `elements-of-style/` 中的相关章节并应用规则。对多数任务，`03-elementary-principles-of-composition.md` 已涵盖最重要的内容。
