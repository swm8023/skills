---
name: retro
description: "对一次编码会话进行复盘。"
disable-model-invocation: true
---

用户要求进行 **retrospective**。你正在建议改进编码 agent 的 **environment**，以提升未来运行表现。

## Steps

1. 阅读随附的 [writing-for-agents 中文写作指南](references/writing-for-agents.md)。只有准备提出 skill、`AGENTS.md` 或 `CLAUDE.md` 的具体改进时，再阅读其中链接的 skill 机制参考。

2. 阅读用户指定会话的一手记录，可能需要搜索本机 session log。用户未指定会话时，默认当前会话。

3. 在以下类别寻找改进候选项。

- **Navigation**：agent 找到正确文件容易吗？文件之间有隐藏依赖吗？**navigation pointer** 能否让查找更容易？_使用时机_：会话花很久才找到某条信息。
- **Automated checks**：能否用自动检查捕获 agent 犯的错？lint、类型检查、测试、文件系统 lint？先读仓库自己的检查命令（`package.json`/构建工具中的 `lint`/`check` 脚本、CI workflow），这样已有却未接入或默默失效的检查才是发现，而非重新发明。仓库完全没有 **guardrail**（没有 pre-commit hook，也没有 CI job 运行 lint/typecheck/test）本身就是发现：未 lint 的仓库长期错失机会，不是中性默认。_使用时机_：agent 犯了自动检查能抓到的错，或仓库完全没有 guardrail。
- **Coding standards**：是否应给 **reviewer agent** 新规则？是否应删掉或澄清现有规则？先分类违规：**mechanical** 违规（固定语法模式、禁用 API、import 形状、文件位置规则）必须用确定性检查解决：仓库 linter 自定义规则、新 pre-commit hook 或新 CI job，选择与语言和现有 guardrail 最匹配、成本最低的方式。默认构建检查，而非写规则。`CODING_STANDARDS.md` 留给真正的 **judgement call**（跨文件一致性、“符合周围风格”、无法用 guardrail 代替的判断）。_使用时机_：reviewer agent 漏掉了错误。
- **Global AGENTS.md**：是否有引导指令应该移到编码规范或自动检查？_使用时机_：仓库或用户全局的 AGENTS.md 特别大。
- **Tool economy**：agent 是否进行了可以简化的昂贵工具调用？是否有特别浪费 token 的自定义工具（CLI、MCP）？_使用时机_：agent 做了昂贵调用。
- **No-op**：寻找引导文件中不改变 agent 行为的指令。_使用时机_：引导文件庞大难用。
- **Information access**：寻找增加 agent 信息访问能力的机会，例如 tee dev server 日志、第三方服务只读访问。_使用时机_：agent 无法获得关键信息。

4. 按严重程度排序，向用户展示这些候选项。

## Reference

### Implementation vs Review

记住所有工作有两个阶段：implementation 和 review。implementation agent 承受最大 **context pressure**，负责探索、写代码和调试失败。

review agent 的 context pressure 最小：它接收 diff，无需探索，通常也不用写代码或调试。

因此应由 review agent 负责施加编码规范，而不是 implementation agent。

### Files

你能访问仓库中的几类文件：

- `CLAUDE.md`/`AGENTS.md`：任何在本仓库工作的 agent 都会在 context window 中收到这些文件。极其克制地使用，通常仅放指向其他文件的 **navigation pointer**。
- `CODING_STANDARDS.md`：review 时读取，implementation 时不读。规范超过 1,000 行时，加入指向文档目录的 **navigation pointer**。
- Docs：作为被其他文件指向的参考。写新文档前先找已有文档。
- Skills：可用于文档（description 进入 agent 的 context window），或用户手动调用的命令。遵循随附 [writing-for-agents 中文写作指南](references/writing-for-agents.md) 的建议。
