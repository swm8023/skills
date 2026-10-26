---
description: 在代码 diff 中检测的常见 anti-patterns。与 se-principles.md 配合，进行平衡分析：principles 展示哪些做法好，anti-patterns 展示需要留意什么。
---

# Anti-Patterns

分析 diff 时，检查这些信号。温和地呈现发现，把它们表述为机会，而不是失败。

## God Object / God Class

一个 module 做得太多。
**Diff 信号：** 单个文件包含大量无关变更。某个 class/module 被到处 import。某个超过 500 行的文件仍在不断增长。
**建议：** 将职责提取到聚焦的 modules 中（SRP）。

## Shotgun Surgery

一次逻辑变更分散在许多文件中。
**Diff 信号：** 单个 feature 或 fix 修改至少 10 个文件。同类编辑在多处重复。一次 rename 或 config 变更涉及几十个文件。
**建议：** 将分散的 logic 集中起来。如果一次变更需要编辑许多文件，abstraction boundaries 可能不对。

## Feature Envy

一个 function 使用其他 module 的数据，比使用自身的数据还多。
**Diff 信号：** 大量 cross-module imports。某个 function 深入访问另一个 object 的 properties。某些 utility functions 只服务于另一个 module 中的一个 caller。
**建议：** 将 function 移到它所使用的数据附近。

## Premature Abstraction

尚未出现多个具体案例，就开始 abstraction。
**Diff 信号：** 一个 interface 恰好只有一个 implementation。一个 factory 只创建一种 type。为只出现一次的问题设计通用方案。
**建议：** 等出现第二或第三个 use case，再进行 abstraction（Rule of Three）。

## Copy-Paste Programming

有细微差异的重复 code blocks。
**Diff 信号：** diff 的多处出现类似代码。某些 functions 仅相差一两个 parameter。重复 patterns 可以进行 parameterization。
**建议：** 提取共享 logic，将差异 parameterize。

## Magic Numbers / Strings

缺乏解释的 literal values。
**Diff 信号：** conditions 中硬编码的数字（`if (retries > 3)`）。用作 keys 或 identifiers 的 string literals。timeouts、limits 或 thresholds 没有对应的 named constants。
**建议：** 提取为 named constants，解释“为什么”。

## Long Method

做得太多的 functions。
**Diff 信号：** 新的 functions 超过 40-50 行。functions 有多层 nesting。functions 需要滚动才能读完。
**建议：** 将子步骤提取为 named functions。每个 function 应只做一件事。

## Excessive Comments

comments 解释“是什么”，而非“为什么”。
**Diff 信号：** 重复代码内容的 comments（`// increment counter`）。直白代码前有大段 comment blocks。commented-out code 留在原处。
**建议：** 通过更好的命名，让代码 self-documenting。comments 只用于说明“为什么”：意图、取舍及不明显的 constraints。
