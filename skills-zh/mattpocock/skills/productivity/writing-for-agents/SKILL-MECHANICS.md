# Skill mechanics

这是 [`writing-for-agents`](SKILL.md) 中专门针对 skill 的部分：当你编写的文档是 skill 时，有哪些不同（frontmatter、调用方式的选择和 router skill）。其他写作原则都在 `SKILL.md` 这份通用参考中。

## Invocation

有两种选择，分别在两种 load 之间作取舍：

- **model-invoked** skill 保留 `description`，让 agent 能主动调用它，其他 skill 也能调用它。你仍然可以输入名称来使用它：model-invocation 始终_包含_用户调用的能力；description 只会增加 agent 发现它的机会，不会移除人的调用能力。description 是 skill 的顶层 context pointer，必须一直保留在 context 中：以持续的 context load 换取可发现性。内容全为 reference 的 model-invoked skill 也可以承载共享参考：其他 skill 能调用它，因此多个 skill 所需的参考可以只放在一处。具体做法：省略 `disable-model-invocation`，编写面向模型、包含触发 branch 的 description（完整遵循 `SKILL.md` 中编写 pointer 的规则）。
- **user-invoked** skill 会让 description 对 agent 不可见：只有人输入名称才能调用它，其他 skill 都不能调用。它不产生 context load，但会产生 cognitive load：你就是必须记住它存在的索引。具体做法：设置 `disable-model-invocation: true`；`description` 改为面向人的一行概述，去掉触发条件清单。

只有 agent 必须主动使用某个 skill，或其他 skill 必须调用它时，才选择 model-invocation。如果它始终由人手动调用，就将其设为 user-invoked，避免 context load。

两个 user-invoked skill 都需要的共享 reference，不能放在其中任何一个 skill 内：它们的 description 对模型不可见，因此彼此无法调用。将它移到 skill 系统外的普通文件中，作为任何 skill 都能指向的 external reference。

## Splitting by invocation

这是按调用方式拆分的情况（按顺序拆分见 `SKILL.md`）：如果有一个明确的 leading word 应该独立触发某项能力（也就是你确实会在 prompt 中使用的触发词），或者其他 skill 必须调用这项能力，就将其拆成 model-invoked skill。新增、始终加载的 description 会带来 context load，因此这种独立可达性必须值得这份成本。

## Router skills

当 user-invoked skill 多到记不住时，可以用一个 **router skill** 缓解累积的 cognitive load：它本身也由用户调用，列出其他 user-invoked skill 的名称和适用时机，让人只需记住一个 skill。它只能提示，不能调用其他手动 skill：user-invoked skill 的 description 对模型不可见，因此只有人能调用它们。
