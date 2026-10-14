---
name: improve-codebase-architecture
description: 扫描代码库的加深机会，展示为可视化 HTML 报告，再围绕选中的候选项深入追问。
disable-model-invocation: true
---

# Improve Codebase Architecture

发现架构摩擦并提出 **deepening opportunity**：将 shallow module 转为 deep module 的重构。目标是可测试性和 AI 可导航性。

本命令由项目的 domain model _提供背景_，并建立在共享设计词汇上：

- 调用 Skill 工具加载 "codebase-design"，获取架构词汇（**module**、**interface**、**depth**、**seam**、**adapter**、**leverage**、**locality**）及原则（删除测试法、“interface 就是测试面”、“一个 adapter = 假设 seam，两个 = 真实”）。每条建议准确使用这些术语，不漂移到“component”“service”“API”或“boundary”。
- `GLOSSARY.md` 的领域语言为好 seam 命名；`docs/adr/` 的 ADR 记录不应由本命令重新争论的决策。

## Process

### 1. Explore

**扫描前先定 scope：YAGNI。** 加深 module 的价值是让未来改动更容易，因此特别关注最近改动的区域。先决定*看哪里*，再开始看：

- 用户指定方向（module、子系统、痛点）时，采用它，跳过下方推断。
- 否则向前查看较长一段 commit 历史（`git log --oneline`），找代码库热点、反复出现的文件和区域，优先关注它们。改动分散、无明显热点时，扩大范围。

先读项目领域术语表（`GLOSSARY.md`）及相关区域的 ADR。

再启动 sub-agent 走查代码库。不要遵循僵硬启发式，自然探索并记录摩擦：

- 理解一个概念时，哪里需要在多个小 module 之间跳转？
- 哪里 module 很 **shallow**，interface 几乎和 implementation 一样复杂？
- 哪里纯函数只为可测试性被提取，但真实 bug 隐藏在调用方式中（没有 **locality**）？
- 哪里紧耦合 module 跨 seam 泄漏？
- 哪些区域没测试，或很难通过现有 interface 测试？

对疑似 shallow 的项应用 **删除测试法**：删除它会集中复杂性，还是只是搬移复杂性？“会集中”就是所需信号。

### 2. Present candidates as an HTML report

将自包含 HTML 写到操作系统临时目录，不放进仓库。使用 `$TMPDIR`，不存在则 `/tmp`（Windows 使用 `%TEMP%`），写为 `<tmpdir>/architecture-review-<timestamp>.html`，让每次运行生成新文件。为用户打开（Linux 用 `xdg-open <path>`，macOS 用 `open <path>`，Windows 用 `start <path>`），并说明绝对路径。

报告使用 **Tailwind CDN** 进行布局和样式，**Mermaid CDN** 绘制能可靠表达结构的图、流程或时序。混用 Mermaid 与手写 CSS/SVG：关系适合图结构（调用图、依赖、时序）时用 Mermaid，更适合编辑式呈现（体量图、剖面、折叠动画）时用 div/SVG。每个候选项都有 **before/after 可视化**。用视觉表达。

每个候选项渲染为卡片，包含：

- **Files**：涉及的文件/module
- **Problem**：当前架构为何产生摩擦
- **Solution**：用平实语言说明会改变什么
- **Benefits**：用 locality 和 leverage 解释收益，以及测试如何改善
- **Before / After diagram**：并排、定制绘图，说明浅度及加深结果
- **Recommendation strength**：`Strong`、`Worth exploring`、`Speculative` 之一，显示为 badge

结尾加入 **Top recommendation**：最先处理哪个候选项，为什么。

**领域使用 GLOSSARY.md 词汇，架构使用 `/codebase-design` 词汇。** 如果 `GLOSSARY.md` 定义“Order”，说“Order intake module”，而不是“FooBarHandler”或“Order service”。

**ADR 冲突**：候选项违背既有 ADR 时，只有摩擦足以值得重访 ADR 才展示。卡片清楚标记（例如警示：“违背 ADR-0007，但因……值得重新讨论”）。不要列出 ADR 禁止的所有理论重构。

完整 HTML scaffold、绘图模式和样式建议参见 [HTML-REPORT.md](HTML-REPORT.md)。

暂时不要提出 interface。文件写好后询问用户：“你想探索哪一个？”

### 3. Grilling loop

用户选定候选项后，调用 Skill 工具加载 "grilling"，共同走过决策树：约束、依赖、deep module 形状、seam 后的内容、哪些测试保留。

决策明确时立即产生相关更新；调用 Skill 工具加载 "domain-modeling"，随过程维护 domain model：

- **用 `GLOSSARY.md` 没有的概念命名加深后的 module？** 添加术语到 `GLOSSARY.md`。文件不存在时按需创建。
- **对话中明确一个含糊术语？** 当场更新 `GLOSSARY.md`。
- **用户因关键理由拒绝候选项？** 提议 ADR：“要记录为 ADR，让未来架构 review 不再建议它吗？”只有未来探索者确实需要该理由来避免重复建议时才提；跳过临时理由（“现在不值得”）或显而易见的理由。
- **希望探索 deep module 的替代 interface？** 调用 Skill 工具加载 "codebase-design"，使用其 design-it-twice 并行 sub-agent 模式。
