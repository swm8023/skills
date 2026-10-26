---
description: 精选的软件工程原则目录。分析代码变更前加载，以便将观察结果对应到具体原则。
---

# Software Engineering Principles

将本文件作为查询表。在 diff 中发现某种模式时，在这里查找对应原则。每一项都包含**代码信号**，说明实际变更中应关注什么。

## Design Principles (SOLID)

**Single Responsibility Principle（SRP，单一职责原则）**
一个模块应当只有一个变化的理由。
代码信号：一个类或文件拆成两个；提取出一个函数；组件不再同时处理 UI 和数据获取。

**Open/Closed Principle（OCP，开闭原则）**
对扩展开放，对修改关闭。
代码信号：不修改既有代码就增加了新行为；引入 plugin、hook 或 callback 系统；使用策略模式或配置替代条件分支。

**Liskov Substitution Principle（LSP，里氏替换原则）**
子类型必须能够替代其基类型。
代码信号：引入接口统一实现；子类覆写改变行为并破坏调用方（违反原则）；增加类型收窄或守卫。

**Interface Segregation Principle（ISP，接口隔离原则）**
调用方不应依赖自己不使用的方法。
代码信号：大接口拆成小接口；删除接口中的可选方法；庞大的 props 对象拆成职责集中的多个对象。

**Dependency Inversion Principle（DIP，依赖倒置原则）**
依赖抽象，而非具体实现。
代码信号：用接口或注入替代具体依赖；引入工厂或 provider 模式；导入路径从具体实现转向抽象层。

**Composition over Inheritance（组合优于继承）**
优先使用对象组合，而非类继承。
代码信号：用委托替代继承层级；用 hook 或组合替代 mixin、HOC；移除基类。

## Simplicity Principles

**DRY（Don't Repeat Yourself，不要重复自己）**
每项知识都应有唯一的表达。
代码信号：重复代码提取为共享函数；用常量替代反复出现的字面量；用模板或生成器替代复制粘贴的样板代码。

**KISS（Keep It Simple, Stupid，保持简单）**
能够奏效的最简单方案就是最好的方案。
代码信号：用直接实现替代复杂抽象；移除不必要的间接层；用可读代码替代炫技的一行写法。

**YAGNI（You Aren't Gonna Need It，不做尚不需要的功能）**
真正需要之前，不要先构建。
代码信号：移除猜测未来需求而添加的功能；删除未使用的配置项；简化过度设计，使其匹配实际需求。

**Rule of Three（三次法则）**
等到第三次重复时再抽象。
代码信号：两处相似代码暂不处理（良好做法）；仅使用一次就引入抽象（违反原则）；第三次出现时才提取（典型应用）。

**Principle of Least Surprise（最小惊讶原则）**
代码的行为应符合大多数用户的预期。
代码信号：重命名函数以更准确地说明功能；统一返回类型；明确或消除副作用。

## Structural Principles

**Separation of Concerns（关注点分离）**
不同职责应放在不同模块中。
代码信号：从 UI 组件中提取业务逻辑；将数据访问与领域逻辑分开；将配置与行为分开；把“上帝文件”拆成职责集中的模块。

**High Cohesion（高内聚）**
相关功能应放在一起。
代码信号：将分散的相关函数集中到一个模块；拆分工具文件，让各部分靠近其使用方；建立功能目录。

**Loose Coupling（低耦合）**
模块之间应尽量少地相互依赖。
代码信号：用事件或 callback 替代直接导入；移除共享依赖；通过定义清楚的接口通信，而非深入访问内部实现。

**Encapsulation（封装）**
隐藏内部细节，只暴露必要内容。
代码信号：减少公开方法；将内部辅助函数设为私有；缩小模块的 API 面；用门面隐藏实现细节。

**Information Hiding（信息隐藏）**
模块不应暴露内部数据结构。
代码信号：用访问方法包装原始数据结构；将内部状态设为私有；把数据转换移入拥有该数据的模块。

## Pragmatic Principles

**Boy Scout Rule（童子军法则）**
让代码在你离开时比接手时更好。
代码信号：实现功能时顺手做小清理；为清晰起见重命名变量；删除死代码路径；更新过时注释。

**Fail Fast（快速失败）**
尽早检测并报告错误。
代码信号：在入口处增加输入校验；为不变量增加断言；用提前返回替代深层嵌套；将错误处理移到源头附近。

**Defensive Programming（防御式编程）**
预判意外输入，并妥善处理。
代码信号：增加空值检查；提供默认值；处理边界情况；引入错误边界。

**Premature Optimization（避免过早优化）**
测量之前不要优化。
代码信号：选择简单实现，而不是复杂却“更快”的实现；将可读性置于微小性能收益之前；优化前先增加性能分析步骤。

## Refactoring Patterns

**Extract Method/Function（提取方法或函数）**
代码信号：将长函数拆成具名子函数；用命名清楚的调用替代内联逻辑。

**Extract Class/Module（提取类或模块）**
代码信号：将一个文件拆成多个文件；将一个类拆成职责明确的两个类。

**Replace Conditional with Polymorphism（以多态替代条件分支）**
代码信号：用策略模式或子类分派替代 switch/if-else 链；引入类型映射表。

**Introduce Parameter Object（引入参数对象）**
代码信号：将多个相关参数归入一个 options/config 对象；简化函数签名。
