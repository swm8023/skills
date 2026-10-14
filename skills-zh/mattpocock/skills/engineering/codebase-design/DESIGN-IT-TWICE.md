# Design It Twice

当用户希望为选中的加深候选项探索替代 interface 时，使用这个并行 sub-agent 模式。它基于 Ousterhout 的“Design It Twice”：第一个想法很可能不是最好的。

使用 [SKILL.md](SKILL.md) 中的词汇：**module**、**interface**、**seam**、**adapter**、**leverage**。

## Process

### 1. Frame the problem space

启动 sub-agent 前，为选中候选项写一段面向用户的问题空间说明：

- 任何新 interface 必须满足的约束
- 它依赖什么，以及这些依赖属于哪一类（参见 [DEEPENING.md](DEEPENING.md)）
- 用一个粗略代码草图把约束讲具体；它不是方案，只是让约束具体化的方式

展示给用户，然后立即进入步骤 2。用户阅读和思考的同时，sub-agent 并行工作。

### 2. Spawn sub-agents

并行启动至少 3 个 sub-agent。每个必须为加深后的 module 设计一个**根本不同**的 interface。

为每个 sub-agent 提供独立技术说明（文件路径、耦合细节、[DEEPENING.md](DEEPENING.md) 中的依赖类别、seam 后方的内容）。它独立于步骤 1 面向用户的问题空间说明。给每个 agent 不同的设计约束：

- Agent 1：“最小化 interface：最多 1–3 个入口，最大化每个入口的 leverage。”
- Agent 2：“最大化灵活性：支持多种用例和扩展。”
- Agent 3：“为最常见调用方优化：让默认情况最简单。”
- Agent 4（如适用）：“围绕 port 和 adapter 设计跨 seam 依赖。”

在说明中同时提供 [SKILL.md](SKILL.md) 的词汇和 GLOSSARY.md 的词汇，让每个 sub-agent 的命名符合架构语言和项目领域语言。

每个 sub-agent 输出：

1. Interface（类型、方法、参数，以及不变量、顺序和错误模式）
2. 展示调用方如何使用的示例
3. implementation 在 seam 后隐藏了什么
4. 依赖策略与 adapter（参见 [DEEPENING.md](DEEPENING.md)）
5. 权衡：哪些地方 leverage 高，哪些地方薄弱

### 3. Present and compare

逐个展示设计，让用户消化每一项，再用文字比较。按 **depth**（interface 上的 leverage）、**locality**（改动集中在哪里）和 **seam placement** 比较。

比较后给出自己的推荐：哪个设计最强，为什么。如果不同设计的元素能很好组合，提出混合方案。给出明确判断：用户需要有力的意见，而不是菜单。
