---
name: claude-handoff
description: 将当前对话交给新的 background agent，让它立即接着工作。
argument-hint: "下一次会话将用于什么？"
disable-model-invocation: true
---

编写当前对话的 handoff 摘要，让新的 agent 能继续工作。保存到用户操作系统的临时目录，再以摘要为 prompt 启动 background agent：`claude --bg --name "<descriptive name>" -- "$(cat <summary file>)"`。通过文件传入可避免 shell 执行摘要中的反引号或展开 `$`。它在当前工作目录启动并立即返回；用户使用 `claude agents` 管理它。

始终通过 `-n`/`--name` 传入有描述性的名称（例如 `--name "Fix login bug"`）；它设置任务列表、会话选择器和终端标题中显示的名称。

在摘要中加入“suggested skills”一节，说明下一个 agent 应调用 Skill 工具加载哪些 skill。

不要重复其他产物（spec、plan、ADR、issue、commit、diff）已经记录的内容。通过路径或 URL 引用它们。

脱敏 API key、密码、个人身份信息等敏感信息，因为摘要将成为 agent 的 prompt。

如果用户传入参数，将其视为对下一次会话重点的描述，并据此调整摘要。
