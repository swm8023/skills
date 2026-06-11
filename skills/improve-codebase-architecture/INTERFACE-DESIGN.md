# Interface Design

当用户希望为某个已选定的深化候选项探索备选 interface 时，使用这种并行 sub-agent 模式。基于 "Design It Twice"（Ousterhout）—— 你的第一个想法不太可能是最好的。

使用 [LANGUAGE.md](LANGUAGE.md) 中的术语 —— **module**、**interface**、**seam**、**adapter**、**leverage**。

## 流程

### 1. 框定问题空间

在 spawn sub-agent 之前，为所选候选项写一份面向用户的问题空间说明：

- 任何新 interface 需要满足的约束
- 它会依赖的依赖项，以及它们属于哪一类（见 [DEEPENING.md](DEEPENING.md)）
- 一份粗略的示意性代码草图，用来落实这些约束 —— 这不是一个提案，只是把约束具体化的一种方式

把这份内容展示给用户，然后立即进入第 2 步。用户在阅读和思考的同时，sub-agent 在并行工作。

### 2. Spawn sub-agent

使用 Agent tool 并行 spawn 3 个或以上的 sub-agent。每个 sub-agent 都必须为深化后的 module 产出一个**根本不同**的 interface。

用一份独立的技术 brief（文件路径、耦合细节、来自 [DEEPENING.md](DEEPENING.md) 的依赖类别、seam 后面是什么）来 prompt 每一个 sub-agent。这份 brief 独立于第 1 步中面向用户的问题空间说明。给每个 agent 一个不同的设计约束：

- Agent 1：“把 interface 最小化 —— 目标是最多 1–3 个入口点。最大化每个入口点的 leverage。”
- Agent 2：“最大化灵活性 —— 支持多种用例与扩展。”
- Agent 3：“为最常见的 caller 优化 —— 让默认情况变得 trivial。”
- Agent 4（如适用）：“围绕跨 seam 依赖，按 ports & adapters 来设计。”

在 brief 中同时包含 [LANGUAGE.md](LANGUAGE.md) 中的术语和 CONTEXT.md 中的术语，以便每个 sub-agent 在命名时与架构语言以及项目的领域语言保持一致。

每个 sub-agent 输出：

1. Interface（类型、方法、参数 —— 以及不变量、顺序、错误模式）
2. 使用示例，展示 caller 如何使用它
3. 实现在 seam 后面隐藏了什么
4. 依赖策略与 adapter（见 [DEEPENING.md](DEEPENING.md)）
5. Trade-off —— 哪里 leverage 高、哪里 leverage 薄弱

### 3. 呈现与比较

按顺序呈现各个设计，让用户能够逐一消化，然后用文字对它们进行比较。从**depth**（interface 处的 leverage）、**locality**（变化集中在哪里）和 **seam 放置**这三个角度进行对比。

比较之后，给出你自己的推荐：你认为哪个设计最强，以及为什么。如果不同设计中的某些元素能够很好地组合起来，就提出一个混合方案。要有鲜明的观点 —— 用户想要的是一个有力的判断，而不是一份菜单。
