---
description: 精选的 software engineering principles 目录。分析代码变更前加载，以便将观察结果对应到有名称的 principles。
---

# Software Engineering Principles

将本文件作为 lookup table。在 diff 中发现 pattern 时，在这里查找对应的 principle。每一项都包含**代码信号**，说明实际变更中要留意什么。

## Design Principles (SOLID)

**Single Responsibility Principle (SRP)**
一个 module 应当只有一个变化的理由。
代码信号：一个 class/file 被拆成两个。一个 function 被提取出来。一个 component 不再同时处理 UI 和 data fetching。

**Open/Closed Principle (OCP)**
对 extension 开放，对 modification 关闭。
代码信号：不修改既有代码就增加了新行为。引入了 plugin/hook/callback 系统。使用 Strategy pattern 或 configuration 替代 conditionals。

**Liskov Substitution Principle (LSP)**
subtypes 必须能够替代其 base types。
代码信号：引入一个 interface 来统一 implementations。subclass override 改变了行为，导致 callers 无法正常工作（违反原则）。增加了 type narrowing 或 guards。

**Interface Segregation Principle (ISP)**
任何 client 都不应依赖自己不使用的 methods。
代码信号：一个大 interface 被拆成多个较小的 interface。从 interface 中移除 optional methods。一个庞大的 props object 被拆成多个聚焦的 object。

**Dependency Inversion Principle (DIP)**
依赖 abstractions，而非 concretions。
代码信号：一个 concrete dependency 被 interface/injection 替代。引入了 factory 或 provider pattern。import paths 从具体 implementations 转向 abstract layers。

**Composition over Inheritance**
优先使用 object composition，而非 class inheritance。
代码信号：以 delegation 替代 inheritance hierarchy。以 hooks 或 composition 替代 Mixins 或 HOCs。移除了一个 base class。

## Simplicity Principles

**DRY (Don't Repeat Yourself)**
每项知识都应有单一的 representation。
代码信号：重复代码提取为 shared function。以 constant 替代重复的 literals。以 template/generator 替代复制粘贴的 boilerplate。

**KISS (Keep It Simple, Stupid)**
能够奏效的最简单方案就是最好的方案。
代码信号：以直接的 implementation 替代复杂的 abstraction。移除了不必要的 indirection。以可读代码替代巧妙的 one-liner。

**YAGNI (You Aren't Gonna Need It)**
实际需要之前，不要构建。
代码信号：移除了猜测未来需求而添加的 features。删除了未使用的 configuration options。将过度设计的方案简化，使其符合 actual requirements。

**Rule of Three**
等到第三次 duplication 时再进行 abstraction。
代码信号：两处存在类似代码，未作处理（良好做法）。仅使用一次就引入了 premature abstraction（违反原则）。第三次出现时触发了 extraction（典型应用）。

**Principle of Least Surprise**
代码的行为应符合大多数用户的预期。
代码信号：重命名 function，使其更好地说明自己的功能。使 return types 一致。使 side effects 明确，或移除它们。

## Structural Principles

**Separation of Concerns**
不同职责应放在不同的 modules 中。
代码信号：从 UI components 中提取 business logic。将 data access 与 domain logic 分开。将 configuration 与 behavior 分开。将一个 god file 拆成聚焦的 modules。

**High Cohesion**
相关功能应放在一起。
代码信号：将分散的相关 functions 集中到一个 module 中。将 utility file 拆分，让每一部分靠近其 consumers。创建了 feature folder。

**Loose Coupling**
modules 之间应尽可能少地相互依赖。
代码信号：以 events/callbacks 替代 direct imports。移除了一个 shared dependency。modules 通过定义清楚的 interfaces 通信，而非访问彼此的 internals。

**Encapsulation**
隐藏内部细节，只暴露必要内容。
代码信号：减少 public methods。将 internal helpers 设为 private。缩小某个 module 的 API surface。通过 facade 隐藏 implementation details。

**Information Hiding**
modules 不应暴露自己的 internal data structures。
代码信号：以 accessor methods 包装 raw data structures。将 internal state 设为 private。将 data transformation 移入拥有该数据的 module 内。

## Pragmatic Principles

**Boy Scout Rule**
让代码在你离开时比接手时更好。
代码信号：在 feature 变更的同时做小清理。为清晰起见重命名一个 variable。移除了一个 dead code path。更新了过时的 comment。

**Fail Fast**
尽早检测并报告错误。
代码信号：在 entry points 增加 input validation。为 invariants 增加 assertions。以 early returns 替代 deep nesting。将 error handling 移到更靠近源头的位置。

**Defensive Programming**
预判意外输入，并妥善处理。
代码信号：增加 null checks。提供 default values。处理 edge cases。引入 error boundaries。

**Premature Optimization (avoiding it)**
测量之前，不要进行 optimization。
代码信号：选择简单 implementation，而不是“更快”但复杂的 implementation。优先考虑 readability，而非 micro-performance。在 optimization 工作之前，增加 profiling 步骤。

## Refactoring Patterns

**Extract Method/Function**
代码信号：将 long function 拆成 named sub-functions。以命名良好的 call 替代 inline logic。

**Extract Class/Module**
代码信号：将一个文件拆成多个文件。将一个 class 拆成职责不同的两个 class。

**Replace Conditional with Polymorphism**
代码信号：以 Strategy pattern 或 subclass dispatch 替代 switch/if-else chain。引入 type map。

**Introduce Parameter Object**
代码信号：将多个相关 parameters 归入单个 options/config object。简化 function signatures。
