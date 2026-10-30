---
name: write-doc
description: 新写、重组、润色或审阅中文文档时使用。按任务阶段加载技术文结构、中文写作和成稿优化参考；需要图示或修改 Mermaid 图时加载包内绘图参考。
license: MIT
---

# write-doc

本入口只负责选择、读取和安排本包内的参考文件。

## 按任务选择

| 任务 | 写前读取 | 成稿后读取 |
| --- | --- | --- |
| 新写或重组技术文档 | [write-technical](references/write-technical.md)，再读 [write-zh](references/write-zh.md) | [optimize-zh](references/optimize-zh.md) |
| 新写或重组其他中文文档 | [write-zh](references/write-zh.md) | [optimize-zh](references/optimize-zh.md) |
| 仅润色已有稿，或只审阅、不改写 | 已有成稿，直接进入成稿后阶段 | [optimize-zh](references/optimize-zh.md) |
| 仅绘图或修改图 | [mermaid-diagrams](references/mermaid-diagrams/SKILL.md) | 按绘图参考完成 |

## 调用顺序

1. 根据用户请求选择表中的任务，只读取对应参考文件。写前参考在起草或重组正文前读取。
2. 按已加载的参考完成正文。需要图示，或需要修改已有图时，读取 [mermaid-diagrams](references/mermaid-diagrams/SKILL.md)，再按其中的指引读取所需图类型的参考；处理图之后继续当前写作阶段。
3. 正文成稿后读取 [optimize-zh](references/optimize-zh.md) 并完成对应处理。已有稿只需润色或审阅时直接执行这一步；“只审阅”的请求使用该参考中的标注模式。

以上路径均指向本包内文件；三个写作参考不作为独立入口，也不要求安装同名外部 skill。

## 来源优先级

`optimize-zh` 以标记为 `source: humanizer-zh` 的来源块为主，`source: shuorenhua` 的来源块及其辅助参考作为兼容补充。发生冲突时按 `humanizer-zh` 执行；用户明确指定的范围和要求按该参考中的优先级处理。

## 来源核对

需要核对搬运范围或原文时，再读取 [片段与文件映射](references/REORGANIZATION.json)。其中记录三个参考文件的来源行、原文快照、链接路径调整，以及 Mermaid 文件哈希。
