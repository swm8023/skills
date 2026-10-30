---
name: write-doc
description: 新写、重组、润色或审阅中文文档、RFC、README、PR 描述和 commit message 时使用。以 Diátaxis 组织技术文档结构，参考 Google developer style、STE 和 Global English 的中文适用原则检查句子表达、操作指令和语法歧义；成稿后优化中文表达，需要图示时加载 Mermaid 参考。
---

# write-doc

Diátaxis 的结构参考放在 [write-technical](references/write-technical.md)；Google developer style（句子表达）、STE（操作指令）和 Global English（语法消歧）的中文适用原则放在 [write-zh](references/write-zh.md)。

| 任务 | 写前读取 | 成稿后读取 |
| --- | --- | --- |
| 新写或重组技术文档（含 RFC、README） | [write-technical](references/write-technical.md)，再读 [write-zh](references/write-zh.md) | [optimize-zh](references/optimize-zh.md) |
| 新写或重组其他中文文档 | [write-zh](references/write-zh.md) | [optimize-zh](references/optimize-zh.md) |
| 新写或重组 PR 描述、commit message | [write-zh](references/write-zh.md) | [optimize-zh](references/optimize-zh.md) |
| 润色或审阅已有稿 | — | [optimize-zh](references/optimize-zh.md) |
| 仅绘图或修改图 | [Mermaid](references/mermaid-diagrams/index.md) | — |

起草或重组正文前读取写前参考，成稿后读取优化参考。只审阅时使用 `optimize-zh` 中的标注模式。

写作中需要图示或修改图时，按需读取 [Mermaid](references/mermaid-diagrams/index.md)，再按图类型读取其中的参考。
