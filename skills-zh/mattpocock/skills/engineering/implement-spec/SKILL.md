---
name: implement-spec
description: "将 /to-spec 和 /to-tickets 的结果实现为代码。"
disable-model-invocation: true
---

你已收到一份 spec。它应该有相关 ticket，描述如何实现这份 spec。

issue tracker 应已提供给你。如果没有，告诉用户运行 `/setup-matt-pocock-skills`。

目标是在一个 **integration branch** 上实现整个 spec，并按 issue tracker 的结项方式解决每个 ticket。

ticket 不是步骤清单，而是带有阻塞关系的 **task graph**。因此始终存在一组已准备好、可领取的 ticket，称为 **frontier**。

与 subagent 的往返通信应该精简。主要通过 **context pointer** 交流：指向 spec、ticket、研究笔记和已有 commit。不要重复 pointer 已经能提供的信息。

尽可能在后台运行 **implementer subagent**，以获得最大并发。

## Steps

1. 阅读 spec 和 ticket，理解 task graph。

2. （可选）使用 **exploration subagent** 完成 ticket 所需的探索：相关代码库文件或外部文档。确保它能够保存文件；它应把 Markdown 笔记放到仓库外、未来所有 subagent 都能访问的目录。这样 **implementer subagent** 就能专注实施，而非探索。

3. 创建 integration branch。如果 issue tracker 通过 PR 结项，或用户要求 PR，在步骤 5 首次合并后打开 draft PR（没有超出 main 的 commit 的 branch 无法开 PR），标明它将关闭 spec 和 ticket。

4. 使用 **implementer subagent** 实施各个 ticket，每个使用自己的 worktree 和 branch。每个 implementer subagent：
   - 开始前确认 worktree 基于 integration branch，否则 reset 到该分支；
   - 调用 Skill 工具加载 `tdd` 来实施 ticket；
   - 在报告完成前，将 integration branch 的最新提交合并到自己的 branch

5. **implementer subagent** 完成后，用 **merger subagent** 将其工作合并到 integration branch。

6. 如果可用 ticket 的 **frontier** 发生变化，启动更多 **implementer subagent** 处理新的 ticket。这样可以最大化并发。

7. 所有 ticket 完成后，对 integration branch 调用 Skill 工具加载 `code-review`。让一个 **implementer subagent** 修复代码审查提出的全部问题。

8. 如果存在 draft PR，将其标记为 ready for review。否则按 issue tracker 的方式解决各个 ticket，并报告 integration branch。

9. 清理所有 **implementer subagent** 的 worktree。
