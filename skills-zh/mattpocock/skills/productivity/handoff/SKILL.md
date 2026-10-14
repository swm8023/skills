---
name: handoff
description: 将当前对话压缩为 handoff 文档，供另一个 agent 接手。
argument-hint: "下一次会话将用于什么？"
disable-model-invocation: true
---

编写总结当前对话的 handoff 文档，让新的 agent 能继续工作。保存到用户操作系统的临时目录（`$TMPDIR`，否则 `/tmp`；Windows 使用 `%TEMP%`），而不是当前工作区。

在文档中加入“suggested skills”一节，说明下一个 agent 应调用 Skill 工具加载哪些 skill。

不要重复其他产物（spec、plan、ADR、issue、commit、diff）已经记录的内容。通过路径或 URL 引用它们。

脱敏 API key、密码、个人身份信息等敏感信息。

如果用户传入参数，将其视为对下一次会话重点的描述，并据此调整文档。
