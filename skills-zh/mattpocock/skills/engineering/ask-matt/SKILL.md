---
name: ask-matt
description: 询问哪个 skill 或 flow 适合当前情况，是本仓库 skill 的路由入口。
disable-model-invocation: true
---

# Ask Matt

不必记住每个 skill，直接问。

说明某 skill 的作用或建议跳过步骤前，先读它的 SKILL.md；这里的概述仅用于定位。

**flow** 是穿过 skill 的路径。大多数路径沿一条 **main flow**，两条 **on-ramp** 汇入；其他是独立工具，或底层词汇层。

## The main flow: idea → ship

多数工作走这条路：有个想法，希望构建出来。

1. **`/grill-with-docs`** 通过访谈打磨想法。只要**在工作目录中工作**就从这里开始：它有状态，将所学保存在 `GLOSSARY.md` 和 ADR。（没有工作目录时用 `/grill-me`，见 Standalone。两者运行同一 `/grilling` 原语；有仓库可存档时，`grill-with-docs` 留下记录，因此更合适。）
2. **分支：所有问题都能通过对话确定吗？** 需要可运行答案（状态、业务逻辑、必须看到的 UI）时，绕行 prototype，双向用 **`/handoff`** 桥接（prototype 有自己的目录，正是 `/handoff` 的用途；见 Phase boundaries）：
   - 用 **`/handoff`** 交出，再基于文件打开新会话，
   - 用 **`/prototype`** 通过临时代码回答问题，
   - 用 **`/handoff`** 带回发现，从原想法对话引用它。
3. **分支：构建会跨多次会话吗？**
   - **是** → **`/to-spec`** 将对话转为 spec，再 **`/to-tickets`** 拆为 tracer-bullet ticket，每项声明 **blocking edge**。接着有两种实施方式：
     - 每个 ticket 一个 **`/implement`**，**各项之间 `/clear` context**。本地 tracker 是 `.scratch/<feature>/issues/` 下每项一个文件，人工先做 blocker；真实 tracker 用原生阻塞链接，所有 blocker 完成的项可直接领取。ticket 自包含，上一项 context 可以丢弃。
     - **`/implement-spec`** 一次构建整个 spec。将 ticket 作为 **task graph**，在已准备的 **frontier** 并行运行 implementer subagent，全部落到一个 **integration branch**。希望统筹而不是亲自驱动每个 ticket 时使用。
   - **否** → 在当前 context window 直接 **`/implement`**。

   两种方式都用 **`/tdd`**（每次一个 red-green slice）构建，再用 **`/code-review`** 对 diff 做 Standards + Spec 双维度审查。`/implement` 每项都运行两者；`/implement-spec` 的各 implementer 跑 `/tdd`，最后对 integration branch 跑一次 `/code-review`。只想先测试构建具体行为、不需完整 spec 时单用 **`/tdd`**；审查 branch 或 PR 相对固定点的改动时单用 **`/code-review`**。

   以 PR 发布时，**`/pr`** 塑造正文：讲清变化的最小可视化、前后有效证据、单向门或双向门判断。它是自动 skill，agent 写 PR 时可使用。

4. **`/retro`** 闭环。构建后，尤其过程不顺时，回看会话，建议改变 agent 的 **environment** 而非代码：navigation pointer、自动检查、`/code-review` 执行的编码规范、引导文件和工具。机械错误变确定性检查，判断事项变规范，让下一次从更好环境开始。

### Context hygiene

步骤 1–3 保持在 **一个未中断 context window**（`/to-tickets` 完成前不 compact 或 clear），让访谈、spec 和 ticket 使用同一思考。每个 `/implement` 再从 ticket 重新开始。clear 前在原会话运行 `/retro`；已 clear 时指向旧 session log。

限制是 **[smart zone](https://www.aihero.dev/ai-coding-dictionary/smart-zone)**：模型仍能锐利推理的窗口（先进模型约 150k token）。`/to-tickets` 前接近它时，不在退化状态硬推；在最近 phase boundary `/compact` 再继续（见 Phase boundaries）。

## On-ramps

某种起始情况产生工作，再汇入 main flow。

- **Bug 和请求积压** → **`/triage`**。沿 triage 角色推进 issue，产出后续 **`/implement`** 可接手的 agent-ready issue。

  Triage 只处理 **不是你创建的** issue：bug 报告、外部功能请求、原始输入。`/to-tickets` 的 ticket 已是 agent-ready，**不要再 triage**。

- **某事坏了** → **`/diagnosing-bugs`**。用于难题：一眼看不出的 bug、间歇性 flaky、两个已知正常状态之间悄然出现的 regression。有 **tight feedback loop**（一个已经在*本* bug 上 red 的命令）前拒绝理论推测，然后用回归测试修复。修复后，同会话运行 **`/retro`**，寻找何种措施本可预防；若真正问题是没有能锁住 bug 的好 seam，则交给 **`/improve-codebase-architecture`**。

- **庞大且模糊的工作：新项目或巨型功能，一次会话装不下** → **`/wayfinder`**，这里认知负担最大的 flow。路线不清时，在 tracker 绘制 **decision ticket** 的 **shared map**，逐个解决，产出**决策而非交付物**，直到迷雾散开。**`/grill-with-docs`** 打磨一次会话能承载的想法；wayfinder 处理承载不了的，更慢更密集，保留给这种情况，而非范围清楚的普通功能。

  map 清晰后，**交接而非构建**：从 **`/to-spec`** 汇入 main flow，把关联决策压缩为可构建 plan，再正常 `/to-tickets` 和 `/implement`。直接将 map 送入 `/implement` 会跳过压缩并丢掉关联细节；只有工作最终很小时才直接 `/implement`。

## Codebase health

不是功能开发，而是维护。

- **`/improve-codebase-architecture`** 有空就可运行，让 agent 更易操作代码库。发现 **deepening opportunity**，选一个就_产生想法_，可从 `/grill-with-docs` 进入 main flow。它是寻找候选的调查；下方 **`/codebase-design`** 是设计选定候选的工作台。

## Vocabulary underneath

两个运行在其他 skill *下方*的自动 reference，各自是对应词汇唯一来源。问题是**用词**而非流程时直接使用，或让上层 skill 加载。

- **`/domain-modeling`**：打磨项目*领域*语言，挑战含糊术语、解决一词多义（“account”承担三种职责）、把难逆转决策记为 ADR。`/grill-with-docs` 驱动这项主动实践，让 `GLOSSARY.md` 保持干净。
- **`/codebase-design`** 是 deep-module 词汇（module、interface、depth、seam、adapter、leverage、locality），用于设计 module *形状*：干净 seam 上的小 interface 承载大量行为。`/tdd` 和 `/improve-codebase-architecture` 都使用它。

## Phase boundaries

**phase** 是会话内一段工作：访谈、implementation、QA。两个 phase 的 **boundary** 有五个选项，选择它们是整张 map 最模糊的决策：

- **Continue**：留下，零成本、无损失。
- **`/clear`**：这里一切与下一步无关时，清空 window。
- **`/handoff`** 写可携带 Markdown，范围窄：仅用于 **new harness**、**new directory**、**colleague**，或 **phase 中途**分叉侧任务。收益是 portability。
- **Subagent**：给紧凑任务独立 window，收报告。
- **`/compact`** 压缩 context 来初始化新会话，是树底的**默认**，不是首个选择。

阅读 [PHASE-BOUNDARIES.md](PHASE-BOUNDARIES.md)，查看有序决策树：五个问题、各分支理由，以及为什么 primary source 的损失成本使 **Continue** 最先被排除。在边界**处**决策；phase 中途继续或将剩余工作交给 subagent。

## Standalone

完全在 main flow 之外。

- **`/grill-me`**：与 `/grill-with-docs` 同样深入访谈，但 **stateless**：不本地保存、不建立 `GLOSSARY.md`。**不在工作目录中工作**时使用（打磨 plan、design、写作，任何没有仓库的内容）。有工作目录时改用 `/grill-with-docs`，同样访谈并留下记录，因此更合适。
- **`/grilling`** 是访谈原语：round、frontier，事实由 agent 查、决策由你作。`/grill-me` 和 `/grill-with-docs` 是两个入口；`/triage`、`/wayfinder`、`/improve-codebase-architecture` 内部都运行它。只想无包装访谈时才直接用。
- **`/prototype`** 是回答一个设计问题的小临时程序：状态模型是否合理、UI 应长什么样。临时性约束代码写法，不承诺销毁：答案进入真实代码，prototype 自身作为 **primary source** 留在 main 外的 `prototype/<name>` branch，由 implementation issue 指向。它是主流程步骤 2 的绕路，纸上难以确定设计时随时可用。
- **`/research`**：把阅读调查交给 **background agent**，对照 **primary source** 研究问题，留下带引用 Markdown。它读时你继续工作。产物带入 `/grill-with-docs` 的 main flow，因为 research 为思考提供材料，不替代思考。
- **`/to-questionnaire`**：阻塞信息不在你脑中或代码库，而在**别人脑中**时，写问卷给对方。它是 `/grill-me` 的反向：不访谈主题，而访谈 **send**（给谁、需返回什么），问题针对知识缺口。返回材料供 `/grill-with-docs` 或 `/to-spec` 使用。
- **`/wizard`** 处理只有**人**能做的步骤：基础设施配置、凭证或 CI secret 设置、陌生第三方 dashboard、一次性迁移或切换。生成交互 Bash，打开 URL、获取值并写入 `.env` 和 GitHub secret，不必每次向 agent 重讲流程。自动调用，agent 碰到只有人能通过的障碍时可使用。能自行做的就自行做，本 skill 只用于真需人的情况。
- **`/wait-what`** 修正没讲明白的消息。对话中、其他 skill 内都可使用，让 agent 补背景、用简单语言及 `GLOSSARY.md` 词汇重新解释。它是事后修正；`/grill-with-docs` 是事前办法，早早建立共享语言可避免术语困扰。
- **`/teach`**：跨多会话学习概念，用当前目录作有状态 workspace。
- **`/writing-for-agents`** 是编写 agent 消费文档的参考：skill、AGENTS.md、pointer 指向的文档。

## Precondition

**`/setup-matt-pocock-skills`**：首次工程 flow 前运行，配置其他 skill 假定的 tracker、triage label 和文档布局。也支持自定义 tracker。
