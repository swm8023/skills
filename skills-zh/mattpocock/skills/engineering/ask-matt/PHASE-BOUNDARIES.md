# Phase boundaries

**phase** 是会话内一段工作：访谈、implementation、QA。定义有意模糊：当你认为*“好，这部分完成了”*时，phase 结束。

**phase boundary** 是两阶段之间的间隙，也是本决策唯一该发生的地方。阶段中途无需选择：继续，或把剩余工作分给 subagent。中途 compact 会让 agent 丢掉思路线索。

## The five options

| 选项 | 作用 |
| ------------ | --------------------------------------------------------------- |
| **Continue** | 留在本会话，完全不切换 context。 |
| **`/clear`** | 清空 context window，从零开始。 |
| **`/handoff`** | 写可携带 Markdown，用它初始化任意位置的新会话。 |
| **Subagent** | 将任务送入独立 context window，接收报告。 |
| **`/compact`** | 压缩当前 context，以摘要初始化新会话。 |

## The tree

在边界处从上到下判断，第一个**是**决定选择。

**1. 能在本会话继续吗？** 两种情况可答是：下一阶段需要本阶段作为 **primary source**，或剩余 [smart zone](https://www.aihero.dev/ai-coding-dictionary/smart-zone)（约 150k token）足以容纳下一阶段。访谈 → implementation 通常答是，因为 implementation 需要原始推理，而非摘要。Continue 零成本、不丢信息，所以先排除它再考虑其他。

**2. context 与下一阶段无关吗？** 本会话所有内容（探索、决策、死路）都可丢弃吗？是就 **`/clear`**。这是最便宜动作，不耗时且拿回整窗空间。`/clear` 也不永久终止旧会话，仍可恢复。

判断错的成本是单向的。清除*相关* context 就丢掉构建背后的 **why**，再读 diff 也找不回来。

**3. 需要 handoff 吗？** `/handoff` 范围很窄，仅在以下情况需要：

- 切换到 **new harness**（Claude → Codex），
- 移到 **新目录**或仓库，
- 把工作交给 **同事**，
- 或在 **phase 中途**分出侧任务，同时保持当前主线。

这就是完整适用条件。`/handoff` 带来 **portability**，即能够移动的文件。没有内容要迁移，就不需要。

**4. 任务能 AFK 完成吗？** scope 是否足够紧凑，可以在你离开键盘、无需指导时运行？是就交给 **subagent**，当前会话保持不动。自动 review 是典型：agent 读 diff 并报告，过程不需要你。

**5. 否则 `/compact`。** context 相关、harness 和目录相同、还需你参与：树落到这里，且很常见。给它指令（`/compact we're going to QA this area`），让摘要保留下一阶段所需。

`/compact` 是 **默认，而非首选起手**。它在树底，因为上面四个选择都更便宜或更精准。直接从这里开始的失败模式是：新会话自信地误读了被摘要压平的决策。

## Primary and secondary sources

除 **Continue** 外，每个动作都会把 **primary source** 变为 **secondary source**：真实发生的会话被摘要替代，权衡形状总是相同：

| 来源 | 信息 | 噪声 | 可用空间 |
| --------------------------------- | ----------- | ----- | ------------ |
| Primary（Continue） | 完整 | 多 | 少 |
| Secondary（`/compact`、`/handoff`） | 有损 | 少 | 多 |

这就是问题 1 最先问的原因。只有留下的成本高于收益，才支付有损压缩成本。

## These are judgement calls

这些问题并非客观，各有判断口味，同一边界在不同日期可能选不同方式。价值在**按顺序**、在边界询问，而不是工作中途。
