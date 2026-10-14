---
name: grill-with-docs
description: Grilling session，对照既有的 domain model 挑战你的 plan，打磨术语，并在决策逐步明朗时同步更新文档（CONTEXT.md、ADR）。当用户希望基于项目自身的语言与已记录的决策来对 plan 进行压力测试时使用。
---

<what-to-do>

围绕这份 plan 的每一个方面对我进行不间断的追问，直到我们达成共同理解。沿着 design tree 的每一个分支逐步深入，逐个解决决策之间的依赖关系。对每一个问题，都给出你推荐的答案。

每次只问一个问题，等待对该问题的反馈后再继续。

如果某个问题可以通过探索 codebase 来回答，那就去探索 codebase，而不是提问。

</what-to-do>

<supporting-info>

## Domain awareness

在探索 codebase 时，同时寻找已有的文档：

### 文件结构

大多数 repo 只有单一 context：

```
/
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

如果根目录存在 `CONTEXT-MAP.md`，则该 repo 拥有多个 context。这份 map 指明每个 context 所在的位置：

```
/
├── CONTEXT-MAP.md
├── docs/
│   └── adr/                          ← system-wide decisions
├── src/
│   ├── ordering/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                 ← context-specific decisions
│   └── billing/
│       ├── CONTEXT.md
│       └── docs/adr/
```

按需懒创建文件 —— 只有在确实有内容要写时才创建。如果没有 `CONTEXT.md`，在第一个术语被确定时再创建。如果没有 `docs/adr/`，在需要第一个 ADR 时再创建。

## 会话进行中

### 对照 glossary 进行挑战

当用户使用的术语与 `CONTEXT.md` 中既有的语言相冲突时，立即指出来。"你的 glossary 把 'cancellation' 定义为 X，但你的意思看起来是 Y —— 到底是哪一个？"

### 打磨模糊的语言

当用户使用含糊或被过度使用的术语时，提出一个精确的、规范的术语。"你说的是 'account' —— 你指的是 Customer 还是 User？这两个是不同的东西。"

### 讨论具体场景

当涉及 domain 关系的讨论时，用具体场景进行压力测试。设计能够探测 edge case 的场景，迫使用户对各概念之间的边界给出精确的说法。

### 与代码相互印证

当用户陈述某件事的工作方式时，去检查代码是否与之一致。如果发现矛盾，把它摆出来："你的代码会取消整个 Order，但你刚才说部分 cancellation 是可能的 —— 哪个是对的？"

### 同步更新 CONTEXT.md

当一个术语被确定时，立刻就地更新 `CONTEXT.md`。不要把这些更新攒到一起 —— 在它们发生的当下就记录下来。使用 [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md) 中的格式。

`CONTEXT.md` 应当完全不含实现细节。不要把 `CONTEXT.md` 当作 spec、草稿本或实现决策的仓库。它就是一份 glossary，仅此而已。

### 谨慎地提议 ADR

只有在以下三点同时成立时才提议创建 ADR：

1. **Hard to reverse** —— 之后改变主意的代价是可观的
2. **Surprising without context** —— 未来的读者会想"他们当初为什么要这样做？"
3. **The result of a real trade-off** —— 当时确实存在多个备选方案，你出于特定理由选择了其中一个

如果三者中缺少任何一项，就不要写 ADR。使用 [ADR-FORMAT.md](./ADR-FORMAT.md) 中的格式。

</supporting-info>
