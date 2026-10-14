---
name: tdd
description: 测试驱动开发。当用户希望先写测试来构建功能或修复 bug、提到 "red-green-refactor"，或需要集成测试时使用。
---

# Test-Driven Development

TDD 就是 red → green 循环。本 skill 是让循环产出值得保留的测试的参考：什么是好测试、测试放在哪里、反模式及循环规则。每一节都适用于每次循环：在循环之前和过程中查阅，而不是完成后再看。

探索代码库时，阅读 `GLOSSARY.md`（若存在），让测试名称和接口术语符合项目的领域语言，并遵守涉及区域的 ADR。

## What a good test is

测试通过公共接口验证行为，而不是实现细节。代码可以完全改变，测试不应随之改变。好测试读起来像一份规格："user can checkout with valid cart" 准确说明了系统具有的能力，而且它不关心内部结构，所以能经受重构。

示例参见 [tests.md](tests.md)，mock 指南参见 [mocking.md](mocking.md)。

## Seams: where tests go

**seam** 是进行测试的公共边界：无需进入内部就能观察行为的接口。测试应位于 seam，而不是针对内部结构。

**只在预先约定的 seam 上测试。** 写任何测试前，记录要测的 seam 并与用户确认。不在未经确认的 seam 上写测试。你无法测试所有事情，因此预先约定 seam，才能让测试投入集中于关键路径和复杂逻辑，而不是每一个边界情况。

询问：“公共接口是什么，应测试哪些 seam？”给每个候选 seam 附一句说明，指出它能发现什么、会遗漏什么。

如果接口形状本身尚未确定（模块有多深、seam 应放在哪里、接口应暴露什么），调用 Skill 工具加载 "codebase-design"，获取相关词汇。它是 module、interface、depth、seam、adapter、leverage 和 locality 的共享定义来源，是要查阅的参考，不是要运行的一场会话。

## Anti-patterns

- **Implementation-coupled**：mock 内部协作者、测试私有方法，或通过旁路验证（直接查询数据库，而不是使用接口）。判断信号：行为没有改变，重构却使测试失败。
- **Tautological**：断言用与代码相同的方式重新计算预期值（`expect(add(a, b)).toBe(a + b)`、用同样方法手工推导的 snapshot、断言常量等于自身），因此它必然通过，永远不能与代码产生分歧。预期值必须来自独立事实来源：已知正确的字面值、推导实例或 spec。
- **Horizontal slicing**：先写完所有测试，再写完所有实现。批量测试验证的是_想象中的_行为：你测的是事物的_形状_，而不是面向用户的行为；测试对真实改动不敏感，而且在理解实现前就固定了测试结构。改用 **vertical slice**：一个测试 → 一个实现 → 重复；每个测试都是一颗 **tracer bullet**，回应上一轮带来的发现。

## Rules of the loop

- **先 red，再 green。** 先写失败测试，再只写足够使它通过的代码。不要预判后续测试或添加猜测性功能。
- **每次一个 slice。** 每轮一个 seam、一个测试、一个最小实现。
- **重构不属于这个循环。** 它属于 review 阶段（参见 `code-review` skill），而不是 red → green 的实施循环。
