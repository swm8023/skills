---
name: using-superpowers
description: 在开始任何对话时使用 —— 它确立了如何查找并使用 skill，要求在任何回复（包括澄清性提问）之前必须先调用 Skill 工具
---

<SUBAGENT-STOP>
如果你是作为 subagent 被派遣来执行某个特定任务，请跳过这个 skill。
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
如果你认为某个 skill 哪怕只有 1% 的可能适用于你正在做的事情，你绝对必须调用该 skill。

如果某个 skill 适用于你的任务，你没有选择余地。你必须使用它。

这一点不可商量。这一点不是可选项。你不能用任何理由说服自己绕过它。
</EXTREMELY-IMPORTANT>

## 指令优先级

Superpowers skill 会覆盖默认 system prompt 的行为，但**用户的指令始终具有最高优先级**：

1. **用户的明确指令**（CLAUDE.md、GEMINI.md、AGENTS.md、直接请求）—— 最高优先级
2. **Superpowers skill** —— 在与默认 system 行为冲突的地方覆盖默认行为
3. **默认 system prompt** —— 最低优先级

如果 CLAUDE.md、GEMINI.md 或 AGENTS.md 说"不要使用 TDD"，而某个 skill 说"始终使用 TDD"，请遵循用户的指令。控制权在用户手中。

## 如何访问 skill

**在 Claude Code 中：** 使用 `Skill` 工具。当你调用一个 skill 时，它的内容会被加载并呈现给你 —— 直接遵循即可。绝不要对 skill 文件使用 Read 工具。

**在 Copilot CLI 中：** 使用 `skill` 工具。Skill 会从已安装的插件中自动发现。`skill` 工具的工作方式与 Claude Code 的 `Skill` 工具相同。

**在 Gemini CLI 中：** Skill 通过 `activate_skill` 工具激活。Gemini 在会话开始时加载 skill 元数据，并在需要时激活完整内容。

**在其他环境中：** 查看你所用平台的文档以了解 skill 是如何加载的。

## 平台适配

Skill 使用 Claude Code 的工具名称。非 CC 平台：参见 `references/copilot-tools.md`（Copilot CLI）、`references/codex-tools.md`（Codex）以获取工具对应关系。Gemini CLI 用户会通过 GEMINI.md 自动加载工具映射。

# 使用 skill

## 规则

**在任何回复或动作之前，先调用相关或被请求的 skill。** 哪怕只有 1% 的可能某个 skill 适用，你都应该调用该 skill 以作检查。如果调用后发现该 skill 并不适合当前情境，你可以不使用它。

```dot
digraph skill_flow {
    "User message received" [shape=doublecircle];
    "About to EnterPlanMode?" [shape=doublecircle];
    "Already brainstormed?" [shape=diamond];
    "Invoke brainstorming skill" [shape=box];
    "Might any skill apply?" [shape=diamond];
    "Invoke Skill tool" [shape=box];
    "Announce: 'Using [skill] to [purpose]'" [shape=box];
    "Has checklist?" [shape=diamond];
    "Create TodoWrite todo per item" [shape=box];
    "Follow skill exactly" [shape=box];
    "Respond (including clarifications)" [shape=doublecircle];

    "About to EnterPlanMode?" -> "Already brainstormed?";
    "Already brainstormed?" -> "Invoke brainstorming skill" [label="no"];
    "Already brainstormed?" -> "Might any skill apply?" [label="yes"];
    "Invoke brainstorming skill" -> "Might any skill apply?";

    "User message received" -> "Might any skill apply?";
    "Might any skill apply?" -> "Invoke Skill tool" [label="yes, even 1%"];
    "Might any skill apply?" -> "Respond (including clarifications)" [label="definitely not"];
    "Invoke Skill tool" -> "Announce: 'Using [skill] to [purpose]'";
    "Announce: 'Using [skill] to [purpose]'" -> "Has checklist?";
    "Has checklist?" -> "Create TodoWrite todo per item" [label="yes"];
    "Has checklist?" -> "Follow skill exactly" [label="no"];
    "Create TodoWrite todo per item" -> "Follow skill exactly";
}
```

## 红色警示

下面这些念头意味着停下 —— 你正在自我合理化：

| 念头 | 真相 |
|---------|---------|
| "这只是一个简单的问题" | 提问也是任务。先检查 skill。 |
| "我需要先获取更多 context" | skill 检查在澄清性提问之前。 |
| "让我先探索一下 codebase" | skill 会告诉你怎么去探索。先检查。 |
| "我可以快速看看 git/文件" | 文件缺少对话 context。先检查 skill。 |
| "让我先收集信息" | skill 会告诉你怎么去收集信息。 |
| "这事不需要正式的 skill" | 如果有 skill，就用它。 |
| "我记得这个 skill" | skill 会演进。读当前版本。 |
| "这算不上一个任务" | 行动 = 任务。先检查 skill。 |
| "这个 skill 太重了" | 简单的事情会变复杂。用它。 |
| "我先做这一件事就好" | 在做任何事情之前先检查。 |
| "这感觉很有效率" | 没有纪律的行动浪费时间。skill 防止这种情况。 |
| "我知道那是什么意思" | 知道概念 ≠ 使用 skill。调用它。 |

## skill 优先级

当多个 skill 都可能适用时，按以下顺序使用：

1. **流程类 skill 优先**（brainstorming、debugging）—— 这些决定了**如何**着手处理任务
2. **实现类 skill 其次**（frontend-design、mcp-builder）—— 这些指导执行

"我们来构建 X" → 先 brainstorming，然后才是实现类 skill。
"修复这个 bug" → 先 debugging，然后才是领域专属的 skill。

## skill 类型

**刚性**（TDD、debugging）：严格遵循。不要把纪律性变通掉。

**灵活**（模式类）：根据 context 灵活调整原则。

skill 自身会告诉你它属于哪一类。

## 用户指令

指令说的是**做什么**，不是**怎么做**。"添加 X"或"修复 Y"并不意味着可以跳过 workflow。
