---
name: handoff
description: 将当前对话压缩为一份 handoff 文档，供另一个 agent 接手继续工作。
argument-hint: "下一个 session 将用于什么？"
---

撰写一份 handoff 文档，对当前对话进行总结，使一个全新的 agent 能够继续这项工作。

将文档保存到当前 workspace 的 `docs/handoff/` 目录下。文件名使用 `YYYY-MM-DD-<topic>-handoff.md`；如果主题不明确，使用 `YYYY-MM-DD-handoff.md`。

不要重复其他工件（PRD、plan、ADR、issue、commit、diff）中已经记录的内容。改为通过路径或 URL 引用它们。

对任何敏感信息进行编辑屏蔽，例如 API key、密码或可识别个人身份的信息。

如果用户传入了参数，请将其视为对下一个 session 关注重点的描述，并相应地调整文档内容。
