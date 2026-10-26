# Skill mechanics

[`writing-for-agents`](writing-for-agents.md) 的 skill 专属分支：文档是 skill 时有何变化（frontmatter、调用方式、router skill）。其他写作内容都是 `writing-for-agents.md` 中的通用参考。

## Invocation

两个选择，在两种 load 之间权衡：

- **model-invoked** skill 保留 `description`，agent 能自动使用，其他 skill 也能调用。用户仍可键入名称：自动调用始终_包含_人的使用；description 只增加 agent 发现能力，不移除人的。description 是顶层 context pointer，始终加载，以永久 context load 换可发现性。纯 reference 的自动 skill 也能存共享参考：其他 skill 能调用，多个 skill 所需参考可只存一处。机制：省略 `disable-model-invocation`，编写面向模型、包含各触发 branch 的 description（完整遵循 `writing-for-agents.md` 的 pointer 规则）。
- **user-invoked** skill 将 description 移出 agent 可达范围，只有人键入名称能使用，其他 skill 不能调用。零 context load，但增加 cognitive load：用户是必须记住它的索引。机制：设置 `disable-model-invocation: true`；`description` 改为面向人的一行概述，去掉触发清单。

只有 agent 必须自主使用，或其他 skill 必须调用时，才选 model-invocation。始终手动使用的设为 user-invoked，避免 context load。

两个 user-invoked skill 都需要的共享参考不能放在任何一方，因为没有 description，不能互调。移到 skill 系统外的普通文件，让任何 skill 都能指向它。

## Splitting by invocation

按 invocation 拆分（按 sequence 见 `writing-for-agents.md`）：有明确、能独立触发的 leading word（用户 prompt 中实际使用的词），或其他 skill 必须调用时，才拆出自动 skill。新 description 增加永久 context load，因此独立可达的价值必须足够。

## Router skills

user-invoked skill 多到记不住时，用 **router skill** 缓解 cognitive load：一个手动 skill 命名其他手动 skill 及适用时机，让人只需记住一个。它只能提示，不能自动启动它们，因为 user-invoked skill 没有可供 agent 发现的 description，只有人能调用。
