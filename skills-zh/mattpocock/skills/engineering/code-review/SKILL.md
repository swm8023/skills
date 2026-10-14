---
name: code-review
description: "沿两个维度审查自固定点（commit、branch、tag 或 merge-base）以来的改动：Standards（代码是否符合本仓库记录的编码规范）和 Spec（代码是否符合原始 issue/spec 的要求）。通过并行 sub-agent 运行两项审查，分别报告。当用户希望审查 branch、PR、进行中的改动，或要求 review since X 时使用。"
---

对 `HEAD` 与用户提供的固定点之间的 diff 进行双维度审查：

- **Standards**：代码是否符合本仓库文档中的编码规范？
- **Spec**：代码是否忠实实现原始 issue / spec？

两个维度通过 **parallel sub-agent** 运行，避免相互污染 context，然后由本 skill 汇总发现。

issue tracker 应已提供给你。如果没有，告诉用户运行 `/setup-matt-pocock-skills`。

## Process

### 1. Pin the fixed point

以用户指定的内容为固定点（commit SHA、branch 名、tag、`main`、`HEAD~5` 等）。如果用户没有指定，询问。

一次性确定 diff 命令：`git diff <fixed-point>...HEAD`（三点语法，与 merge-base 比较）。同时通过 `git log <fixed-point>..HEAD --oneline` 记录 commit 列表。

继续之前，确认固定点可解析（`git rev-parse <fixed-point>`），并且 diff 非空。无效引用或空 diff 应在这里失败，而不是在两个并行 sub-agent 内才失败。

### 2. Identify the spec source

按以下顺序寻找原始 spec：

1. commit 消息中的 issue 引用（`#123`、`Closes #45`、GitLab `!67` 等），按 tracker 文档中的 workflow 获取。
2. 用户通过参数提供的路径。
3. `docs/`、`specs/` 或 `.scratch/` 下与 branch 名或功能对应的 spec 文件。
4. 如果没有找到，询问用户 spec 在哪里。如果用户说没有，**Spec** sub-agent 跳过，并报告“no spec available”。

### 3. Identify the standards sources

在仓库中搜索所有记录代码编写方式的文件。存在 `CODING_STANDARDS.md` 或 `CONTRIBUTING.md` 时，必须加入清单。

除了仓库记录的规范，Standards 维度始终包含下方 **smell baseline**：一组固定的 Fowler code smell（_Refactoring_ 第 3 章），即使仓库没有规范也适用。遵循两条规则：

- **仓库规范优先。** 仓库明确记录的规范始终胜出；若它认可 baseline 会标记的做法，抑制对应 smell。
- **始终需要判断。** 每个 smell 都是带标签的启发式提示（“possible Feature Envy”），不是硬性违规。和其他规范一样，跳过工具已经强制执行的事项。

每个 smell 按*是什么* → *如何修复*描述；用它对照 diff：

- **Mysterious Name**：函数、变量或类型名称无法说明其功能或承载内容。→ 重命名；如果找不到真实准确的名字，设计本身就不清楚。
- **Duplicated Code**：改动中的多个 hunk 或文件出现相同逻辑形状。→ 提取公共形状，让两处调用它。
- **Feature Envy**：一个方法访问其他对象的数据多于自身数据。→ 把方法移到它依赖的数据所属对象上。
- **Data Clumps**：同一组字段或参数总是一起出现（暗示应有一个类型）。→ 将它们打包成一个类型，并传递该类型。
- **Primitive Obsession**：用基本类型或字符串代替本应拥有独立类型的领域概念。→ 给该概念一个小型专用类型。
- **Repeated Switches**：针对同一类型的 `switch`/`if` 链在改动中反复出现。→ 使用多态，或让两处共享同一张映射表。
- **Shotgun Surgery**：一个逻辑改动迫使 diff 中多个文件分散修改。→ 将一同变化的内容聚到一个模块。
- **Divergent Change**：一个文件或模块因多个无关原因被修改。→ 拆分，使每个模块只有一个变化原因。
- **Speculative Generality**：为 spec 没有的需求添加抽象、参数或 hook。→ 删除；先内联回去，直到真实需求出现。
- **Message Chains**：调用方不应依赖的长 `a.b().c().d()` 导航链。→ 用第一个对象上的一个方法隐藏遍历。
- **Middle Man**：类或函数主要只是继续转发。→ 删除，直接调用真正的目标。
- **Refused Bequest**：子类或实现类忽略或覆盖大多数继承内容。→ 放弃继承，使用组合。

### 4. Spawn both sub-agents in parallel

在前台同时发起两个 sub-agent 调用，并汇总它们返回的报告。

**Standards sub-agent prompt** 应包含：

- 完整 diff 命令与 commit 列表。
- 步骤 3 找到的规范来源文件清单，**以及完整粘贴步骤 3 的 smell baseline**（sub-agent 没有其他获取途径）。
- 任务说明：“按相关文件/hunk 报告：(a) diff 中违反文档规范的每个位置，引用规范（文件和规则）；(b) 发现的 baseline smell，注明名称并引用 hunk。区分硬性违规和需要判断的事项：文档规范违背可能是硬性违规，但 baseline smell 始终是判断事项，且仓库文档规范覆盖 baseline。跳过工具已经执行的事项。少于 400 词。”

**Spec sub-agent prompt** 应包含：

- diff 命令与 commit 列表。
- spec 路径或已获取的内容。
- 任务说明：“报告：(a) spec 要求但缺失或只完成部分的需求；(b) diff 中未被要求的行为（scope creep）；(c) 看似实现但实现方式可能错误的需求。每项发现都引用对应 spec 行。少于 400 词。”

如果没有 spec，跳过 Spec sub-agent，并在最终报告中注明。

### 5. Aggregate

在 `## Standards` 和 `## Spec` 标题下分别展示两份报告，原样保留或轻度整理。**不要**合并发现或重新排序，因为两个维度是有意分开的（参见 _Why two axes_）。

结尾用一行说明每个维度的发现总数，以及_各维度内部_最严重的问题（若有）。不要跨维度挑选一个最严重项：维度分离就是为了避免这种重新排序。

## Why two axes

一项改动可能通过一个维度，却不通过另一个：

- 代码遵循全部规范，但实现了错误的事情 → **Standards 通过，Spec 不通过。**
- 代码完全满足 issue 要求，但违反项目约定 → **Spec 通过，Standards 不通过。**

分别报告可以避免一个维度掩盖另一个。
