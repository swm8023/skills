# Engineering

我每天用于代码工作的 skill。

## User-invoked

仅在用户键入名称时可调用（Claude Code：`disable-model-invocation: true`；Codex：`agents/openai.yaml` 中 `policy.allow_implicit_invocation: false`）。

- **[ask-matt](./ask-matt/SKILL.md)**：询问哪个 skill 或 flow 适合情况，本仓库手动 skill 的路由。
- **[grill-with-docs](./grill-with-docs/SKILL.md)**：访谈同时建立 domain model，打磨术语，并即时更新 `GLOSSARY.md` 与 ADR。
- **[triage](./triage/SKILL.md)**：通过 triage 角色状态机推进 issue。
- **[improve-codebase-architecture](./improve-codebase-architecture/SKILL.md)**：扫描加深机会，展示 HTML 可视化报告，再追问选中项。
- **[setup-matt-pocock-skills](./setup-matt-pocock-skills/SKILL.md)**：配置 tracker、triage 标签和领域文档布局，每个仓库运行一次。
- **[to-spec](./to-spec/SKILL.md)**：将当前对话转为 spec，发布到 issue tracker。
- **[to-tickets](./to-tickets/SKILL.md)**：将 plan、spec 或对话拆成 tracer-bullet ticket，每项声明 blocking edge，本地写入文件，真实 tracker 用原生阻塞链接。
- **[implement](./implement/SKILL.md)**：实施 spec 或 ticket，在预先约定 seam 驱动 `/tdd`，commit 前以 `/code-review` 收尾。
- **[implement-spec](./implement-spec/SKILL.md)**：在一个 integration branch 实施整个 spec。按 task graph 在 ready frontier 并行运行 implementer subagent，最后 `/code-review`。
- **[wayfinder](./wayfinder/SKILL.md)**：把超出单次会话的大工作规划为 tracker 上的共享 decision-ticket map，逐项解决，直到路线清楚。
- **[retro](./retro/SKILL.md)**：会话后按严重程度建议改进 agent 环境：导航、自动检查、规范、引导文件、工具。

## Model-invoked

模型或用户均可调用，丰富触发措辞让模型能自行使用。

- **[prototype](./prototype/SKILL.md)**：用临时 prototype 回答设计问题：state/logic 使用单个可分享 HTML，UI 使用几个可切换变体。

- **[diagnosing-bugs](./diagnosing-bugs/SKILL.md)**：难解 bug 和性能回退的纪律循环：建立能在本 bug 上 red 的反馈 → 最小化 → 假设 → instrumentation → 修复 → 回归测试。
- **[research](./research/SKILL.md)**：background agent 查高可信一手来源，保存带引用 Markdown。
- **[tdd](./tdd/SKILL.md)**：red-green-refactor 测试驱动开发，每次一个 vertical slice 构建功能或修复 bug。
- **[domain-modeling](./domain-modeling/SKILL.md)**：挑战术语、用场景压力测试、立即更新 `GLOSSARY.md` 和 ADR，主动建立 domain model。
- **[codebase-design](./codebase-design/SKILL.md)**：deep module 设计纪律与共享词汇：小 interface、干净 seam、通过 interface 测试。
- **[code-review](./code-review/SKILL.md)**：固定点以来 diff 的双维度审查：**Standards**（仓库规范及 Fowler smell baseline）与 **Spec**（忠实实现 issue/spec），通过并行 sub-agent 运行。
- **[pr](./pr/SKILL.md)**：PR 正文形状：讲清变化的最小可视化、有效的前后证据、合并风险判断（单向门或双向门，加 blast radius）。
- **[wizard](./wizard/SKILL.md)**：生成交互 Bash，引导人完成只有人能做的步骤：基础设施、凭证或 CI secret、陌生控制台、一次性迁移或切换。
