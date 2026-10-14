# 语言

本 skill 提出的每一条建议所共享的词汇表。请严格使用这些术语 —— 不要替换为 "component"、"service"、"API" 或 "boundary"。语言的一致性正是关键所在。

## 术语

**Module（模块）**
任何同时具备 interface 与 implementation 的事物。刻意做到与规模无关 —— 同样适用于一个函数、一个类、一个 package，或一个跨层切片。
_避免使用_：unit、component、service。

**Interface（接口）**
调用者要正确使用该模块所必须知道的一切。包括类型签名，但也包括 invariants（不变量）、ordering constraints（顺序约束）、error modes（错误模式）、required configuration（必需的配置），以及 performance characteristics（性能特征）。
_避免使用_：API、signature（过于狭窄 —— 它们仅指类型层面的表面）。

**Implementation（实现）**
模块内部的内容 —— 它的代码本体。与 **Adapter** 不同：一个事物可以是小 adapter 配大 implementation（如 Postgres repo），也可以是大 adapter 配小 implementation（如内存中的 fake）。当话题是接缝时使用 "adapter"；其他情况使用 "implementation"。

**Depth（深度）**
接口处的 leverage —— 调用者（或 test）相对于他们必须学习的接口单元，所能行使的行为量。当大量行为隐藏在一个小接口背后时，模块就是 **deep（深）**。当接口几乎和 implementation 一样复杂时，模块就是 **shallow（浅）**。

**Seam（接缝）** _（出自 Michael Feathers）_
一个无须在该处编辑代码就能改变行为的地方。模块的 interface 所栖身的*位置*。决定把 seam 放在哪里本身就是一项设计决策，与其背后放什么是不同的问题。
_避免使用_：boundary（与 DDD 的 bounded context 含义重叠）。

**Adapter（适配器）**
在 seam 处满足某个 interface 的具体事物。描述的是*角色*（它填补哪个槽位），而不是实质（其内部是什么）。

**Leverage（杠杆）**
调用者从 depth 中获得的东西。每一单位需要学习的 interface 带来更多能力。一份 implementation 在 N 个调用点和 M 个 test 之间反复回报。

**Locality（局部性）**
维护者从 depth 中获得的东西。变更、bug、知识与验证都集中在同一个地方，而不是散落到各个调用者身上。一次修复，处处修复。

## 原则

- **Depth 是 interface 的属性，而不是 implementation 的属性。** 一个 deep 模块的内部完全可以由小的、可 mock、可替换的部件组成 —— 它们只是不属于 interface 的一部分。一个模块可以同时拥有 **internal seams**（对其 implementation 私有，由它自己的 test 使用）以及位于其 interface 处的 **external seam**。
- **删除测试（the deletion test）。** 想象删掉这个模块。如果复杂度消失了，那么模块原本并没有隐藏任何东西（它只是一个 pass-through）。如果复杂度在 N 个调用者那里重新冒了出来，那么这个模块就在挣它的口粮。
- **Interface 就是 test 的表面。** 调用者和 test 跨越的是同一道 seam。如果你想测试 interface *之外*的东西，那这个模块的形状很可能不对。
- **一个 adapter 只意味着假设性的 seam。两个 adapter 才意味着真实的 seam。** 除非真的有东西在其上变化，否则不要引入 seam。

## 关系

- 一个 **Module** 恰好拥有一个 **Interface**（它呈现给调用者和 test 的表面）。
- **Depth** 是 **Module** 的属性，相对于其 **Interface** 度量。
- **Seam** 是 **Module** 的 **Interface** 所栖身之处。
- **Adapter** 位于 **Seam** 处并满足该 **Interface**。
- **Depth** 为调用者带来 **Leverage**，为维护者带来 **Locality**。

## 被拒绝的表述

- **将 depth 定义为 implementation 行数与 interface 行数之比**（Ousterhout）：这会奖励往 implementation 里灌水。我们改用 depth-as-leverage（深度即杠杆）。
- **将 "Interface" 等同于 TypeScript 的 `interface` 关键字或某个类的 public 方法**：过于狭窄 —— 这里的 interface 包括调用者必须知道的每一项事实。
- **"Boundary"**：与 DDD 的 bounded context 含义重叠。请使用 **seam** 或 **interface**。
