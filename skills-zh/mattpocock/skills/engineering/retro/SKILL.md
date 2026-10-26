---
name: retro
description: "对一次编码会话进行复盘。"
disable-model-invocation: true
---

用户要求进行一次 **复盘**。你要针对编码 agent 的 **工作环境**提出改进建议，让它在后续运行中表现得更好。

## Steps

1. 调用 Skill 工具加载 `writing-for-agents`，获取写作风格指南。

2. 阅读用户指定会话的一手资料。这可能需要搜索本机上的会话日志。如果用户没有指定会话，就默认使用当前会话。

3. 从以下类别中寻找可以改进的地方。

- **Navigation**：agent 找到所需文件是否方便？文件之间是否存在隐含依赖？增加 **navigation pointer** 是否能让查找更容易？_适用情况_：会话中花了很长时间才找到某条信息。
- **Automated checks**：有没有自动化检查能够捕获 agent 犯的错误？例如 lint、类型检查、测试或文件系统 linter？先阅读仓库自己的检查命令（`package.json` 或构建工具中的 `lint`/`check` 脚本，以及 CI workflow），这样才能发现已有检查只是尚未接入或已悄然失效，而不是重新造一套。仓库没有任何 **guardrail**（既没有 pre-commit hook，也没有运行 lint/typecheck/test 命令的 CI job）本身就是一项发现：缺少 lint 意味着一项改进机会始终未被利用，而不是一种中性的默认状态。_适用情况_：agent 犯了自动化检查本可捕获的错误，或者仓库根本没有 guardrail。
- **Coding standards**：是否应该给 **reviewer agent** 增加一条需要检查的规则？是否应该删除或澄清已有规则？先判断违规属于哪一类：**mechanical** 违规（固定的语法模式、禁用的 API、import 形式、文件位置规则）必须通过确定性检查来处理：在仓库自己的 linter 中增加自定义规则、新增 pre-commit hook，或新增 CI job，具体选择取决于仓库的语言和已有 guardrail，采用成本最低的方式。默认应构建检查，而不是编写规则。`CODING_STANDARDS.md` 应留给真正的 **judgement calls**（跨文件的一致性、“符合周围代码的风格”，以及任何无法用 guardrail 代替的判断）。_适用情况_：reviewer agent 没有发现某个错误。
- **Global AGENTS.md**：是否有一些引导指令，应该移到编码规范或自动化检查中？_适用情况_：仓库内或用户全局的 AGENTS.md 文件特别大。
- **Tool economy**：agent 是否进行过可以简化的高成本工具调用？是否有特别浪费 token 的自定义工具（CLI、MCP）？_适用情况_：agent 进行过高成本的工具调用。
- **No-ops**：查找引导文件中那些并不会改变 agent 行为的指令。_适用情况_：引导文件庞大而难以使用。
- **Information access**：寻找让 agent 获得更多信息的机会。例如，将 dev server 日志通过 tee 分流，或提供对第三方服务的只读访问。_适用情况_：agent 无法获得某条关键信息。

4. 按严重程度排序，向用户展示这些改进候选项。

## Reference

### Implementation vs Review

记住，所有工作都分为两个阶段：实现和审查。负责实现的 agent 承受着最大的 **context pressure**。它需要负责探索、编写代码和调试失败。

负责审查的 agent 承受的 context pressure 最小：它接收的是 diff，因此无需探索。它通常也不需要编写代码或调试。

这意味着，检查代码是否遵守编码规范的责任应由审查 agent 承担，而不是实现 agent。

### Files

你可以访问仓库中的几类文件：

- `CLAUDE.md`/`AGENTS.md`：这些文件会被放进所有在本仓库工作的 agent 的 context window 中。应非常克制地使用它们，通常只用来放置指向其他文件的 **navigation pointer**。
- `CODING_STANDARDS.md`：这份文件在审查时读取，而不是在实现时读取。如果规范文件超过 1,000 行，就加入指向文档目录的 **navigation pointer**。
- Docs：将文档作为参考文件，由其他文件指向它们。编写新文档之前，先寻找已有文档。
- Skills：将 skill 用作参考文档（因为它的 description 会进入 agent 的 context window），或者用作由用户调用的命令。遵循 `writing-for-agents` skill 中的建议。
