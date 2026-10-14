---
name: codebase-design
description: 设计 deep module 的共享词汇。当用户希望设计或改进模块接口、寻找加深机会、确定 seam 位置、提升可测试性或 AI 可导航性，或其他 skill 需要 deep-module 词汇时使用。
---

# Codebase Design

设计 **deep module**：在一个干净的 seam 上，用小接口承载大量行为，并通过该接口测试。凡是在设计或重组代码，都使用这些词汇和原则。目标是为调用方提供 leverage、为维护者提供 locality，并让所有人都容易测试。

## Glossary

准确使用这些术语，不要替换成“component”“service”“API”或“boundary”。语言一致就是核心目的。

**Module**：任何同时具有 interface 和 implementation 的东西。有意不限定规模：函数、类、package 或跨层 slice 都可以。_避免_：unit、component、service。

**Interface**：调用方正确使用 module 所需了解的全部内容：不仅是类型签名，还有不变量、顺序约束、错误模式、必要配置和性能特征。_避免_：API、signature（过窄，只指类型层面的表面）。

**Implementation**：module 内部的代码。不同于 **Adapter**：一个东西可以是小 adapter、大 implementation（Postgres repo），也可以是大 adapter、小 implementation（内存 fake）。讨论 seam 时使用“adapter”，其他时候使用“implementation”。

**Depth**：interface 上的 leverage。调用方（或测试）每学习一单位 interface，能够驱动多少行为。小 interface 背后有大量行为时，module 是 **deep** 的；interface 几乎和 implementation 一样复杂时，则是 **shallow** 的。

**Seam** _（Michael Feathers）_：无需在该处修改代码，就能改变其行为的地方；也就是 module interface 所在的*位置*。seam 放在哪里是独立的设计决策，与其背后放什么不同。_避免_：boundary（与 DDD 的 bounded context 含义重叠）。

**Adapter**：在 seam 上满足某个 interface 的具体事物。描述的是*角色*（填入哪个位置），而非本质（内部是什么）。

**Leverage**：调用方从 depth 中获得的收益。每学习一单位 interface，就获得更多能力。一份 implementation 在 N 个调用点和 M 个测试中持续产生收益。

**Locality**：维护者从 depth 中获得的收益。改动、bug、知识和验证集中在一个地方，而不是散布到调用方。修复一次，处处生效。

## Deep vs shallow

**Deep module** = 小 interface + 大量 implementation：

```
┌─────────────────────┐
│   Small Interface   │  ← Few methods, simple params
├─────────────────────┤
│                     │
│  Deep Implementation│  ← Complex logic hidden
│                     │
└─────────────────────┘
```

**Shallow module** = 大 interface + 少量 implementation（应避免）：

```
┌─────────────────────────────────┐
│       Large Interface           │  ← Many methods, complex params
├─────────────────────────────────┤
│  Thin Implementation            │  ← Just passes through
└─────────────────────────────────┘
```

设计 interface 时询问：

- 能否减少方法数量？
- 能否简化参数？
- 能否在内部隐藏更多复杂性？

## Principles

- **Depth 是 interface 的属性，不是 implementation 的属性。** deep module 内部可以由小型、可 mock、可替换的部件组成，只是这些部件不属于 interface。module 可以同时拥有 **internal seam**（implementation 私有，供自身测试使用）和位于 interface 的 **external seam**。
- **删除测试法。** 想象删除这个 module。如果复杂性随之消失，它只是转发层。如果复杂性重新出现在 N 个调用方，它就有存在价值。
- **interface 就是测试面。** 调用方和测试跨越同一个 seam。如果想测试 interface *之后*的内部，module 形状很可能不对。
- **一个 adapter 意味着假设的 seam，两个 adapter 才意味着真实的 seam。** 只有确实有东西在 seam 两侧发生变化时，才引入它。

## Designing for testability

好的 interface 让测试自然发生：

1. **接收依赖，而不是创建依赖。**

   ```typescript
   // Testable
   function processOrder(order, paymentGateway) {}

   // Hard to test
   function processOrder(order) {
     const gateway = new StripeGateway();
   }
   ```

2. **返回结果，而不是产生副作用。**

   ```typescript
   // Testable
   function calculateDiscount(cart): Discount {}

   // Hard to test
   function applyDiscount(cart): void {
     cart.total -= discount;
   }
   ```

3. **小表面。** 方法越少，需要的测试越少；参数越少，测试准备越简单。

## Relationships

- 一个 **Module** 恰有一个 **Interface**（它向调用方和测试展示的表面）。
- **Depth** 是 **Module** 的属性，相对于其 **Interface** 衡量。
- **Seam** 是 **Module** 的 **Interface** 所在的位置。
- **Adapter** 位于 **Seam**，并满足 **Interface**。
- **Depth** 为调用方带来 **Leverage**，为维护者带来 **Locality**。

## Rejected framings

- **将 Depth 定义为 implementation 行数与 interface 行数之比**（Ousterhout）：这会奖励把 implementation 写长。我们改用 depth-as-leverage。
- **把“Interface”理解为 TypeScript 的 `interface` 关键字或类的公共方法**：过窄；这里的 interface 包含调用方必须了解的所有事实。
- **“Boundary”**：与 DDD 的 bounded context 重叠。使用 **seam** 或 **interface**。

## Going deeper

- **结合依赖加深一个模块簇**，参见 [DEEPENING.md](DEEPENING.md)：依赖分类、seam 纪律，以及替换而非叠加测试。
- **探索不同 interface**，参见 [DESIGN-IT-TWICE.md](DESIGN-IT-TWICE.md)：启动并行 sub-agent，设计几种根本不同的 interface，再比较 depth、locality 和 seam 位置。
