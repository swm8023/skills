# Productivity

通用 workflow 工具，不限定代码工作。

## User-invoked

仅在用户键入名称时可调用（Claude Code：`disable-model-invocation: true`；Codex：`agents/openai.yaml` 中 `policy.allow_implicit_invocation: false`）。

- **[grill-me](./grill-me/SKILL.md)**：持续访谈 plan 或 design，直到 design tree 每个分支都确定。
- **[handoff](./handoff/SKILL.md)**：压缩当前对话为 handoff，让另一个 agent 继续工作。
- **[teach](./teach/SKILL.md)**：用当前目录作有状态教学 workspace，跨多会话学习技能或概念。
- **[to-questionnaire](./to-questionnaire/SKILL.md)**：将无法独自回答的决策转为 Markdown 问卷，给能回答的人异步填写或会议共同完成。
- **[wait-what](./wait-what/SKILL.md)**：消息没讲明白时使用；补缺失背景，以简单语言和 `GLOSSARY.md` 词汇重新解释。

## Model-invoked

模型或用户均可调用，丰富触发措辞让模型能自行使用。

- **[grilling](./grilling/SKILL.md)**：持续追问 plan、decision 或 idea，直到 design tree 每个分支都确定。
- **[writing-for-agents](./writing-for-agents/SKILL.md)**：为 agent 编写 skill、AGENTS.md/CLAUDE.md，以及通过 pointer 读取的文档。
