---
name: improve-codebase-architecture
description: 在 codebase 中寻找深化机会，参考 CONTEXT.md 中的领域语言以及 docs/adr/ 中记录的决策。当用户希望改进架构、寻找重构机会、合并紧耦合的 module、或让 codebase 更具可测试性和 AI 可导航性时使用。
---

# 改进 Codebase 架构

浮现架构上的摩擦，并提出**深化机会（deepening opportunities）**——把浅 module 转化为深 module 的重构。目标是可测试性与 AI 可导航性。

## 术语表

请在每条建议中**精确**使用这些术语。保持语言一致正是关键——不要漂移到 "component"、"service"、"API" 或 "boundary"。完整定义见 [LANGUAGE.md](LANGUAGE.md)。

- **Module** —— 任何拥有 interface 与 implementation 的东西（函数、类、包、slice）。
- **Interface** —— 调用方使用该 module 必须了解的一切：types、invariants、error modes、ordering、config。不仅仅是类型签名。
- **Implementation** —— 内部代码。
- **Depth（深度）** —— interface 处的 leverage（杠杆）：在很小的 interface 背后藏着大量 behaviour。**Deep（深）**＝高 leverage。**Shallow（浅）**＝interface 几乎与 implementation 一样复杂。
- **Seam（缝）** —— interface 所在之处；可以在不就地编辑的情况下改变 behaviour 的位置。（请使用此词，而非 "boundary"。）
- **Adapter** —— 在 seam 处满足某个 interface 的具体事物。
- **Leverage（杠杆）** —— 调用方从 depth 中获得的好处。
- **Locality（局部性）** —— 维护者从 depth 中获得的好处：变更、bug、知识都集中在同一处。

关键原则（完整列表见 [LANGUAGE.md](LANGUAGE.md)）：

- **Deletion test（删除测试）**：设想删除该 module。如果复杂度消失，那它只是一个 pass-through。如果复杂度在 N 个 caller 中重新出现，那它是在挣自己的饭钱。
- **Interface 即 test surface（测试表面）。**
- **一个 adapter ＝ 假想的 seam。两个 adapter ＝ 真正的 seam。**

本 skill _受_ 项目领域模型的指引。领域语言为好的 seam 命名；ADR 记录的决策是本 skill 不该重新争论的。

## 流程

### 1. Explore（探索）

先阅读项目的领域术语表，以及你将要触碰区域的所有 ADR。

然后用 Agent 工具（`subagent_type=Explore`）走读 codebase。不要依赖死板的启发式——有机地探索，并记录你在哪里感受到了摩擦：

- 在哪里理解一个概念需要在许多小 module 之间反复跳转？
- 哪里的 module 是 **shallow** 的——interface 几乎与 implementation 一样复杂？
- 哪里只是为了可测试性而抽出了纯函数，但真正的 bug 却藏在它们如何被调用（缺乏 **locality**）？
- 紧耦合的 module 在哪里跨过 seam 发生泄漏？
- codebase 的哪些部分没有测试，或难以通过其当前 interface 来测试？

对一切你怀疑是 shallow 的东西应用 **deletion test**：删掉它会让复杂度集中，还是只是搬家？"会，集中"才是你想要的信号。

### 2. 以 HTML 报告呈现候选项

向操作系统临时目录写入一个自包含的 HTML 文件，这样不会有任何东西落在 repo 里。临时目录从 `$TMPDIR` 解析，回退到 `/tmp`（Windows 上回退到 `%TEMP%`），并写入 `<tmpdir>/architecture-review-<timestamp>.html`，让每次运行都得到一份新文件。为用户打开它——Linux 上用 `xdg-open <path>`，macOS 上用 `open <path>`，Windows 上用 `start <path>`——并告诉他们绝对路径。

报告使用 **Tailwind via CDN** 做布局与样式，并使用 **Mermaid via CDN** 在 graph/flow/sequence 能可靠传达结构的地方画图。把 Mermaid 与手工打造的 CSS/SVG 视觉混合使用——当关系是图形态时（call graph、dependencies、sequence）用 Mermaid，当你想要更具编辑感的东西（mass diagram、cross-section、collapse 动画）时用手工 div/SVG。每个候选项都获得一份**before/after 可视化**。要有视觉。

对每个候选项，使用与之前相同的模板，但渲染为一张卡片：

- **Files** —— 涉及哪些 file/module
- **Problem** —— 当前架构为何造成摩擦
- **Solution** —— 用平实的英语描述将要改变什么
- **Benefits** —— 用 locality 与 leverage 解释，以及测试将如何改进
- **Before / After 图** —— 并排展示，定制绘制，呈现 shallowness 与 deepening
- **Recommendation strength（推荐强度）** —— `Strong`、`Worth exploring`、`Speculative` 之一，渲染为 badge

报告以一个 **Top recommendation** 段落收尾：你会先动哪个候选项，以及原因。

**对领域使用 CONTEXT.md 的词汇，对架构使用 [LANGUAGE.md](LANGUAGE.md) 的词汇。** 如果 `CONTEXT.md` 定义了 "Order"，那就谈论 "the Order intake module"——而不是 "the FooBarHandler"，也不是 "the Order service"。

**ADR 冲突**：如果某个候选项与现有 ADR 矛盾，只有当摩擦真实到值得重新审视该 ADR 时才浮现它。在卡片中清楚标注（例如一个警告 callout：_"contradicts ADR-0007 — but worth reopening because…"_）。不要把某个 ADR 禁止的每一项理论上的重构都列出来。

完整的 HTML 脚手架、图表模式与样式指南见 [HTML-REPORT.md](HTML-REPORT.md)。

此时**不要**提出 interface。文件写好后，向用户提问："Which of these would you like to explore?"

### 3. Grilling 循环

一旦用户选定某个候选项，进入一段 grilling 对话。和他们一起走过设计树——constraints、dependencies、深化后 module 的形态、seam 之后藏着什么、哪些测试得以幸存。

副作用随着决策结晶在对话中即时发生：

- **要把深化后的 module 用一个 `CONTEXT.md` 中没有的概念命名？** 把该术语加到 `CONTEXT.md` 里——纪律与 `/grill-with-docs` 相同（见 [CONTEXT-FORMAT.md](../grill-with-docs/CONTEXT-FORMAT.md)）。如果文件不存在就懒创建。
- **在对话中锐化一个模糊术语？** 立刻更新 `CONTEXT.md`。
- **用户基于一个承重的理由拒绝该候选项？** 提出写一条 ADR，以这种方式提出：_"Want me to record this as an ADR so future architecture reviews don't re-suggest it?"_ 仅当该理由确实会被未来的 explorer 用到、以避免再次提出同一件事时才提出——跳过短期理由（"现在不值得"）以及自明的理由。见 [ADR-FORMAT.md](../grill-with-docs/ADR-FORMAT.md)。
- **想为深化后的 module 探索备选 interface？** 见 [INTERFACE-DESIGN.md](INTERFACE-DESIGN.md)。
