---
name: tdd
description: Test-driven development with red-green-refactor loop. Use when user wants to build features or fix bugs using TDD, mentions "red-green-refactor", wants integration tests, or asks for test-first development.
---

# 测试驱动开发 / Test-Driven Development

## 理念

**核心原则**：测试应该通过公开接口验证行为，而不是验证实现细节。代码可以彻底改变；测试不应改变。

**好的测试**是 integration 风格的：它们通过公开的 API 走真实的代码路径。它们描述系统_做什么_，而不是_怎么做_。一个好的测试读起来就像一份 specification —— "user can checkout with valid cart" 准确地告诉你存在什么能力。这些测试能在 refactor 中存活下来，因为它们不关心内部结构。

**坏的测试**与实现耦合。它们 mock 内部协作者、测试私有方法，或者通过外部手段（例如直接查询数据库而不是使用接口）来验证。警示信号：你 refactor 时测试坏了，但行为并没有变。如果你重命名了一个内部函数而测试失败了，那些测试测的是实现，而不是行为。

参见 [tests.md](tests.md) 中的示例，以及 [mocking.md](mocking.md) 中的 mocking 指南。

## 反模式：横向切分 / Horizontal Slices

**不要先写完所有测试，再写所有实现。** 这是"横向切分"—— 把 RED 当成"写所有测试"，把 GREEN 当成"写所有代码"。

这样会产生**糟糕的测试**：

- 批量写出的测试测的是_想象中的_行为，而不是_实际的_行为
- 你最终在测试事物的_形状_（数据结构、函数签名），而不是面向用户的行为
- 测试对真实变化变得不敏感 —— 行为坏掉时它们仍然通过，行为正常时它们却失败
- 你跑过了自己的车灯，在理解实现之前就把自己锁定到某种测试结构上

**正确做法**：通过 tracer bullet 进行纵向切分。一个测试 → 一份实现 → 重复。每个测试都响应你从上一个循环中学到的东西。因为代码是你刚写的，你确切知道什么行为重要、如何去验证。

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
```

## 工作流程

### 1. 规划

在探索代码库时，使用项目的领域术语表，使测试名称和接口词汇与项目使用的语言一致，并尊重你所触及区域的 ADR。

在写任何代码之前：

- [ ] 与用户确认需要哪些接口变更
- [ ] 与用户确认要测试哪些行为（按优先级排序）
- [ ] 识别 [deep modules](deep-modules.md)（小接口、深实现）的机会
- [ ] 为可测试性 [testability](interface-design.md) 设计接口
- [ ] 列出要测试的行为（不是实现步骤）
- [ ] 让用户对计划点头同意

询问："公开接口应该长什么样？哪些行为最重要、最值得测试？"

**你没法测试一切。** 与用户确切确认哪些行为最重要。把测试精力聚焦在关键路径和复杂逻辑上，而不是每一种可能的边界情况。

### 2. Tracer Bullet

写**一个**测试，确认系统的**一件事**：

```
RED:   Write test for first behavior → test fails
GREEN: Write minimal code to pass → test passes
```

这就是你的 tracer bullet —— 证明端到端的路径是通的。

### 3. 增量循环

对剩余的每个行为：

```
RED:   Write next test → fails
GREEN: Minimal code to pass → passes
```

规则：

- 一次只写一个测试
- 只写恰好够让当前测试通过的代码
- 不要预先考虑未来的测试
- 让测试聚焦在可观察的行为上

### 4. Refactor

当所有测试都通过后，寻找 [refactor candidates](refactoring.md)：

- [ ] 提取重复
- [ ] 加深模块（把复杂性藏在简单接口背后）
- [ ] 在自然的地方应用 SOLID 原则
- [ ] 思考新代码对现有代码揭示了什么
- [ ] 每一步 refactor 之后都运行测试

**绝不在 RED 状态下 refactor。** 先回到 GREEN。

## 每个循环的清单

```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] Code is minimal for this test
[ ] No speculative features added
```
