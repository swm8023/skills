---
name: write-doc
description: 新写、重组、润色或审阅中文文档、RFC、README、PR 描述和 commit message 时使用。以 Diátaxis 组织技术文档结构，参考 Google developer style、STE 和 Global English 的中文适用原则检查句子表达、操作指令和语法歧义；成稿后优化中文表达，需要图示时加载 Mermaid 参考。
---

# write-doc

按下面的顺序完成任务。

1. **按任务读取参考。**
   - 新写或重组技术文档（含 RFC、README）：先读 [write-technical](references/write-technical.md)，再读 [write-zh](references/write-zh.md)，然后起草。
   - 新写或重组其他中文文档、PR 描述或 commit message：先读 [write-zh](references/write-zh.md)，然后起草。
   - 润色或审阅已有稿：读 [optimize-zh](references/optimize-zh.md)。只审阅时使用其中的标注模式，不改正文。
   - 仅绘图或修改图：读 [Mermaid](references/mermaid-diagrams/index.md)，再按图类型读取其中的参考，完成绘图后交付。
2. **完成正文并审校。** 新写或重组的初稿完成后，再读 [optimize-zh](references/optimize-zh.md) 并审校。写作中需要图示时，按第 1 步的绘图分支读取参考。保留事实、限定和受保护内容，不为润色补造信息。
3. **独立复核完整文档。** 新写或重组文章、RFC、README 等完整文档时，按 [独立复核](references/review-process.md) 调用一个只读子代理，检查成稿和适用流程；处理问题后再交付。简短润色、只审阅、PR 描述和 commit message 默认自行核对，用户要求独立复核时也执行。子代理不可用时自行核对，并如实说明未做独立复核。

交付以用户要求的正文、文件修改或审阅意见为主。复核记录留在任务内部；仅在影响交付时简短说明未解决的问题或证据缺口。
