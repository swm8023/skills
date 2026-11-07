---
name: write-doc
description: 新写、重组、润色或审阅中文文档、RFC、README、PR 描述和 commit message 时使用。以 Diátaxis 组织技术文档结构，参考 Google developer style、STE 和 Global English 的中文适用原则检查句子表达、操作指令和语法歧义；成稿后按任务优化和复核，需要图示时加载 Mermaid 参考。
---

# write-doc

## 调用约定

新写或重组的文稿默认成稿后优化。用户或调用方可指定跳过（如 `optimize_zh: false`）；文稿或调用方明确声明供 Agent 阅读时也跳过，仅提到 Agent 不算受众声明。用户明确要求优化、润色或使用 `optimize-zh` 时仍执行；单纯写作或修改不视为要求优化。该约定只作用于当前文稿；跳过不影响写前参考、基本审校和适用的独立复核。

写前仅在材料存在且允许访问时比较同目录文档；没有可用的同目录或可比文档时，使用已提供的材料，不扫描授权范围之外的内容。

## 流程

1. **按任务读取参考。**
   - 新写或重组技术文档（含 RFC、README）：先读 [write-technical](references/write-technical.md)，再读 [write-zh](references/write-zh.md)，然后起草。
   - 新写或重组其他中文文档、PR 描述或 commit message：先读 [write-zh](references/write-zh.md)，然后起草。
   - 润色已有稿：按第 2 步优化。只审阅或只提建议：读 [optimize-zh](references/optimize-zh.md)，按标注模式返回意见，不改正文。
   - 仅绘图或修改图：读 [Mermaid](references/mermaid-diagrams/index.md)，再按图类型读取其中的参考，完成绘图后交付。
2. **成稿后优化。** 需要优化时，将允许披露的稿件或授权文件路径、受众、编辑范围和必要材料交给子代理，按 [optimize-zh](references/optimize-zh.md) 处理。子代理只读取交接材料和按需参考，可修改授权文件，不启动 Git 工作流或派生子代理。主代理保留优化前稿件，等待完成后对照核查；期间不并发修改同一文稿。子代理不可用时自行优化并说明未由子代理执行。

   无论是否优化，都核对事实、限定和受保护内容。需要图示时，按第 1 步读取绘图参考。
3. **独立复核完整文档。** 优化完成或跳过后，新写、重组或全面润色的完整文档由未参与起草和优化的只读子代理按 [review-doc](references/review-doc.md) 复核。简短润色、只审阅、PR 描述和 commit message 默认自行核对；用户要求独立复核时也执行。子代理不可用时自行核对并说明未独立复核。

交付以用户要求的正文、文件修改或审阅意见为主。复核记录留在任务内部；仅在影响交付时简短说明未解决的问题或证据缺口。
