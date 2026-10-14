---
name: to-tickets
description: 将 plan、spec 或当前对话拆成一组 tracer-bullet ticket，每项声明 blocking edge，发布到已配置 tracker（本地每个文件一项、以文字记录边，真实 tracker 使用原生阻塞链接）。
disable-model-invocation: true
---

# To Tickets

将 plan、spec 或对话拆成一组 **ticket**：tracer-bullet vertical slice，每项声明**阻塞**它的其他 ticket。

issue tracker 和 triage 标签词汇应已提供给你。如果没有，告诉用户运行 `/setup-matt-pocock-skills`。

## Process

### 1. Gather context

使用对话 context 中已有的内容。如果用户通过参数给出引用（spec 路径、issue 编号或 URL），获取并阅读完整正文和评论。

### 2. Explore the codebase (optional)

若尚未探索代码库，先了解代码现状。ticket 标题和描述使用项目领域术语表的词汇，并遵守涉及区域的 ADR。

寻找可以先做 prefactor、使实施更容易的机会。“先让改动变容易，再完成容易的改动。”

### 3. Draft vertical slices

把工作拆成 **tracer bullet** ticket。

<vertical-slice-rules>

- 每个 slice 穿过所有层（schema、API、UI、测试），路径狭窄但完整：是垂直的，不是某一层的水平 slice
- 完成的 slice 可以单独演示或验证
- 每个 slice 的大小适合一个全新的 context window
- 任何 prefactor 都应先完成

</vertical-slice-rules>

给每个 ticket 指定 **blocking edge**：必须在它开始前完成的其他 ticket。没有 blocker 的 ticket 可以立即开始。

**Wide refactor 是 vertical slice 的例外。** **wide refactor** 指一种机械改动（重命名列、改变共享符号类型），其 **blast radius** 覆盖整个代码库，一次编辑就让数千调用点失效，任何 vertical slice 都无法单独以 green 落地。不要强塞进 tracer bullet；按 **expand–contract** 排序。先 expand：在旧形式旁新增新形式，保持不破坏。再按 blast radius 分批迁移调用点（按 package 或目录），每批独立为 ticket，依赖 expand；旧形式仍在，批次之间 CI 保持 green。最后 contract：没有旧调用方后，删除旧形式，这个 ticket 依赖全部迁移批次。如果连批次都无法独立 green，仍保留顺序，但共享 integration branch，并全部阻塞最终的 integrate-and-verify ticket；只有那里承诺 green。

### 4. Quiz the user

以编号列表展示建议拆分。每个 ticket 展示：

- **Title**：简短描述性名称
- **Blocked by**：必须先完成哪些其他 ticket（若有）
- **What it delivers**：本 ticket 使哪些端到端行为可用

询问用户：

- 粒度合适吗？（太粗 / 太细）
- blocking edge 正确吗？每个 ticket 是否只依赖真正阻止它开始的项？
- 是否应合并或进一步拆分某些 ticket？

迭代，直到用户批准拆分。

### 5. Publish the tickets to the configured tracker

发布已批准的 ticket。**方式**取决于 `/setup-matt-pocock-skills` 配置的 tracker；ticket 内容相同，只有 blocking edge 的表达形式不同：

- **本地文件** → 在 `.scratch/<feature-slug>/issues/<NN>-<slug>.md` 下每个 ticket 一个文件，从 `01` 开始按依赖顺序编号（blocker 在前）。每个文件的“Blocked by”列出依赖项编号或标题。使用下方单 ticket 模板：始终一项一个文件，不合成单个总文件。
- **真实 issue tracker（GitHub、Linear 等）** → 按依赖顺序每个 ticket 发布一个 issue（blocker 在前），让 blocking edge 引用真实标识。平台支持时使用原生 blocking 关系，否则在每个 ticket 的“Blocked by”记录阻塞 issue。如果来源是已有 issue，将每个 ticket 设为其 sub-issue（使用 tracker 文档的对应操作）。除非另有指示，添加 `ready-for-agent` triage 标签；ticket 在构造时就适合 agent 领取。

处理 **frontier**：所有 blocker 都已完成的 ticket。纯线性链就是从上到下。

不要关闭或修改任何 parent issue。

<local-ticket-template>

# <NN>: <Ticket title>

**What to build：** 从用户视角说明本 ticket 使哪些端到端行为可用，不列逐层 implementation 清单。

**Blocked by：** 阻塞本项的 ticket 编号/标题，或“None (can start immediately)”。

**Status:** ready-for-agent

- [ ] 验收标准 1
- [ ] 验收标准 2

</local-ticket-template>

<issue-template>

## Parent

tracker 上 parent issue 的引用（若来源是已有 issue；否则省略本节）。

## What to build

从用户视角说明本 ticket 使哪些端到端行为可用，而非逐层 implementation。

## Acceptance criteria

- [ ] 标准 1
- [ ] 标准 2

## Blocked by

- 每个阻塞 ticket 的引用，或“None (can start immediately)”。若 blocker 已设为原生 edge，省略本节。

</issue-template>

两种形式都避免具体文件路径或代码片段，因为它们很快过时。例外：prototype 若产生比文字更准确表达决策的片段（状态机、reducer、schema、类型形状），可以内联，并简要注明来自 prototype。只保留承载决策的部分，不要完整可运行 demo，只要重要内容。
