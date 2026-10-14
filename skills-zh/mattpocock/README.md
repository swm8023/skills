<p>
  <a href="https://www.aihero.dev/s/skills-newsletter">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://res.cloudinary.com/total-typescript/image/upload/v1777382277/skills-repo-dark_2x.png">
      <source media="(prefers-color-scheme: light)" srcset="https://res.cloudinary.com/total-typescript/image/upload/v1777382277/skill-repo-light_2x.png">
      <img alt="Skills" src="https://res.cloudinary.com/total-typescript/image/upload/v1777382277/skill-repo-light_2x.png" width="369">
    </picture>
  </a>
</p>

# Skills For Real Engineers

[![skills.sh](https://skills.sh/b/mattpocock/skills)](https://skills.sh/mattpocock/skills)

我每天用于真正工程开发的 agent skill，而不是 vibe coding。

开发真实应用很难。GSD、BMAD、Spec-Kit 等方式试图包办流程来帮助你，但也拿走控制权，让流程本身出 bug 时难以解决。

这些 skill 小巧、易改、可组合，适用于任何 model，基于几十年的工程经验。自由修改，变成自己的工具，享受使用。

想跟进改动和新 skill，可以与约 60,000 名开发者一起订阅 newsletter：

[订阅 newsletter](https://www.aihero.dev/s/skills-newsletter)

## Installation (30-second setup)

plugin 自动更新。[skills.sh](https://skills.sh/mattpocock/skills) 将可编辑文件复制进项目，由你手动更新。每个 agent 只选一种方式，否则每个 skill 都会出现两份。

### 1. Get the skills

<details>
<summary><strong>Claude Code</strong></summary>

```bash
claude plugin install mattpocock-skills@claude-plugins-official
```

默认自动更新。

</details>

<details>
<summary><strong>Codex</strong></summary>

```bash
codex plugin marketplace add mattpocock/skills
codex plugin add mattpocock-skills@mattpocock
```

启动时自动更新。

</details>

<details>
<summary><strong>GitHub Copilot</strong>（CLI 和 VS Code）</summary>

```bash
copilot plugin marketplace add mattpocock/skills
copilot plugin install mattpocock-skills@mattpocock
```

然后一次性加入 `~/.copilot/settings.json`：

```json
{
  "extraKnownMarketplaces": {
    "mattpocock": { "source": { "source": "github", "repo": "mattpocock/skills" }, "autoUpdate": true }
  }
}
```

VS Code 中运行 **Chat: Install Plugin From Source**，输入 `https://github.com/mattpocock/skills`。每天更新。

</details>

<details>
<summary><strong>Gemini CLI</strong>（手动更新）</summary>

```bash
gemini skills install https://github.com/mattpocock/skills.git --path skills/engineering
gemini skills install https://github.com/mattpocock/skills.git --path skills/productivity
```

重新运行两个命令即可更新。

</details>

<details>
<summary><strong>其他 agent，或可编辑文件副本</strong>（手动更新）</summary>

```bash
npx skills@latest add mattpocock/skills -a <agent>  # cursor, opencode, devin, windsurf, amp, pi; omit -a to choose
```

安装器询问选哪些 skill 时，包含 `setup-matt-pocock-skills`。更新用 `npx skills@latest update`，新 skill 需要再次运行 `add` 选择。

</details>

### 2. Run `/setup-matt-pocock-skills`

在 agent 中，每个仓库运行一次。它会：

- 询问使用哪个 issue tracker（GitHub、GitLab、本地文件或描述的其他方式）
- 询问 triage ticket 所用标签（`/triage` 使用这些标签）
- 询问生成的文档保存在哪里

### 3. Bam - you're ready to go.

## Why These Skills Exist

这些 skill 用来修正我在 Claude Code、Codex 和其他 coding agent 中观察到的常见失败模式。

### #1: The Agent Didn't Do What I Want

> “没有人准确知道自己想要什么。”
>
> David Thomas & Andrew Hunt，[The Pragmatic Programmer](https://www.amazon.co.uk/Pragmatic-Programmer-Anniversary-Journey-Mastery/dp/B0833F1T3V)

**问题**：软件开发最常见的失败是未对齐。你以为开发者知道你的需求，看到成品后才发现对方完全没理解。

AI 时代也一样，你和 agent 有沟通缺口。解决方式是 **grilling session**，让 agent 对准备构建的东西提出详细问题。

**办法**是使用：

- [`/grill-me`](./skills/productivity/grill-me/SKILL.md)：用于非代码工作
- [`/grill-with-docs`](./skills/engineering/grill-with-docs/SKILL.md)：与 [`/grill-me`](./skills/productivity/grill-me/SKILL.md) 相同，但增加更多能力（见下文）

这是最受欢迎的 skill，帮助开始前与 agent 对齐，并深入思考改动。_每次_想改东西都可以使用。

### #2: The Agent Is Way Too Verbose

> 有了通用语言，开发者之间的对话和代码表达都来自同一个 domain model。
>
> Eric Evans，[Domain-Driven-Design](https://www.amazon.co.uk/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215)

**问题**：项目起步时，开发者与领域专家通常说着不同语言。

我与 agent 也有这种张力：它们突然进入项目，边做边猜术语，结果本可用一个词的意思说了 20 个词。

**办法**是共享语言，用一份文档帮助 agent 理解项目术语。

<details>
<summary>
示例
</summary>

这是 `course-video-manager` 仓库的 [glossary](https://github.com/mattpocock/course-video-manager/blob/076a5a7a182db0fe1e62971dd7a68bcadf010f1c/CONTEXT.md) 示例（固定 commit 时仍叫 `CONTEXT.md`，早于命名约定迁移）。哪种更容易读？

- **BEFORE**：“课程 section 中的一节 lesson 变成真实内容，也就是在文件系统获得位置时，有一个问题。”
- **AFTER**：“materialization cascade 有一个问题。”

这种简洁跨会话持续产生收益。

</details>

它内置在 [`/grill-with-docs`](./skills/engineering/grill-with-docs/SKILL.md) 中：访谈同时建立共享语言，并用 ADR 记录难以解释的决策。

很难讲清它有多强，也许是本仓库最有用的技术之一。试试看。

> [!TIP]
> 共享语言除了减少冗长，还有更多收益：
>
> - **变量、函数和文件命名一致**，共同使用这套语言
> - 因此 agent **更容易导航代码库**
> - 因为语言紧凑，agent **思考也用更少 token**

### #3: The Code Doesn't Work

> “始终采取小而刻意的步骤。反馈速度就是速度限制，永远不要接太大的任务。”
>
> David Thomas & Andrew Hunt，[The Pragmatic Programmer](https://www.amazon.co.uk/Pragmatic-Programmer-Anniversary-Journey-Mastery/dp/B0833F1T3V)

**问题**：即使已经对齐要构建什么，agent 仍可能产出糟糕代码。

这时应查看 feedback loop。没有关于实际运行的反馈，agent 就是盲飞。

**办法**：静态类型、浏览器访问、自动测试等常规反馈。

自动测试中，red-green-refactor 循环关键：先写失败测试，再修正它。持续反馈能让 agent 产出远更好的代码。

我构建了可放进任意项目的 **[`/tdd`](./skills/engineering/tdd/SKILL.md) skill**，鼓励 red-green-refactor，并充分解释好坏测试。

调试则有 **[`/diagnosing-bugs`](./skills/engineering/diagnosing-bugs/SKILL.md)**，把最佳实践封装为逐阶段设关卡的纪律循环。

### #4: We Built A Ball Of Mud

> “_每天_投入系统设计。”
>
> Kent Beck，[Extreme Programming Explained](https://www.amazon.co.uk/Extreme-Programming-Explained-Embrace-Change/dp/0321278658)

> “最好的 module 是 deep 的，以简单 interface 提供大量功能。”
>
> John Ousterhout，[A Philosophy Of Software Design](https://www.amazon.co.uk/Philosophy-Software-Design-2nd/dp/173210221X)

**问题**：多数 agent 构建的 app 很复杂，难以改变。agent 加速编码，也以前所未有的速度加速软件熵。

**办法**：AI 开发中一个根本方法，认真关心代码设计。

这些 skill 的每一层都包含这种考虑：

- [`/to-spec`](./skills/engineering/to-spec/SKILL.md) 创建 spec 前会确认涉及哪些 module

而 [`/improve-codebase-architecture`](./skills/engineering/improve-codebase-architecture/SKILL.md) 会调查加深机会并展示候选。建议隔几天运行一次。它是调查而非救援：旧代码库会有真实候选，但它不会替你解开所有混乱。

### Summary

软件工程基本功比以往更重要。这些 skill 努力将基本功浓缩为可重复实践，帮助交付更好的 app。

## Reference

只按一个维度划分：谁能调用。**User-invoked** 仅用户键入名称可用（例如 `/grill-me`），负责统筹；**Model-invoked** 用户可用，agent 也能在任务适合时自动使用，承载可复用纪律。手动 skill 能调用自动 skill，但不能调用其他手动 skill。

### Engineering

我每天用于代码工作的 skill。

**User-invoked**

- **[ask-matt](./skills/engineering/ask-matt/SKILL.md)**：询问哪个 skill 或 flow 适合，本仓库手动 skill 路由。
- **[grill-with-docs](./skills/engineering/grill-with-docs/SKILL.md)**：访谈同时构建 domain model，打磨术语，即时更新 `GLOSSARY.md` 和 ADR。
- **[triage](./skills/engineering/triage/SKILL.md)**：通过 triage 角色状态机推进 issue。
- **[improve-codebase-architecture](./skills/engineering/improve-codebase-architecture/SKILL.md)**：扫描加深机会，展示 HTML 可视化报告，再追问选中项。
- **[setup-matt-pocock-skills](./skills/engineering/setup-matt-pocock-skills/SKILL.md)**：配置 tracker、triage 标签和领域文档，每仓库在首次其他工程 skill 前运行一次。
- **[to-spec](./skills/engineering/to-spec/SKILL.md)**：将当前对话综合为 spec，发布到 tracker，不再访谈。
- **[to-tickets](./skills/engineering/to-tickets/SKILL.md)**：把 plan、spec 或对话拆为 tracer-bullet ticket，各项声明 blocking edge，本地文字记录或 tracker 原生链接。
- **[implement](./skills/engineering/implement/SKILL.md)**：实施 spec 或 ticket，在预先约定 seam 运行 `/tdd`，commit 前 `/code-review`。
- **[implement-spec](./skills/engineering/implement-spec/SKILL.md)**：在 integration branch 实施整个 spec，按 task graph 在 ready frontier 并行运行 implementer subagent，最后 `/code-review`。
- **[wayfinder](./skills/engineering/wayfinder/SKILL.md)**：将超出单次会话的大工作绘为 tracker 共享 decision-ticket map，逐项解决，直到路线清晰。
- **[retro](./skills/engineering/retro/SKILL.md)**：会话后按严重性建议改善 agent 环境（导航、自动检查、规范、引导文件、工具）。

**Model-invoked**

- **[prototype](./skills/engineering/prototype/SKILL.md)**：临时程序回答设计问题，state/logic 使用可分享单 HTML，UI 使用同一路由的不同变体。
- **[diagnosing-bugs](./skills/engineering/diagnosing-bugs/SKILL.md)**：难解 bug 与性能 regression 的纪律循环：能在本 bug 上 red 的反馈 → 最小化 → 假设 → instrumentation → 修复 → 回归测试。
- **[research](./skills/engineering/research/SKILL.md)**：background agent 查高可信 primary source，保存带引用 Markdown。
- **[tdd](./skills/engineering/tdd/SKILL.md)**：red-green-refactor 测试驱动开发，每次一个 vertical slice 构建功能或修复 bug。
- **[domain-modeling](./skills/engineering/domain-modeling/SKILL.md)**：挑战术语、用场景测试边界、即时更新 `GLOSSARY.md` 和 ADR，主动构建 domain model。
- **[codebase-design](./skills/engineering/codebase-design/SKILL.md)**：deep module 的共享设计词汇与纪律：小 interface 后大量行为、干净 seam、通过 interface 测试。
- **[code-review](./skills/engineering/code-review/SKILL.md)**：固定点以来 diff 的 **Standards**（规范及 Fowler smell baseline）与 **Spec**（忠实符合 issue/spec）双轴审查，并行 sub-agent 分别运行。
- **[pr](./skills/engineering/pr/SKILL.md)**：PR 正文形状：最小可视化、前后有效证据、合并风险（单向门或双向门及 blast radius）。
- **[wizard](./skills/engineering/wizard/SKILL.md)**：交互 Bash 向导，让人完成独有步骤：基础设施、凭证和 CI secret、陌生 dashboard、一次性迁移或切换。

### Productivity

通用 workflow 工具，不限定代码。

**User-invoked**

- **[grill-me](./skills/productivity/grill-me/SKILL.md)**：持续访谈 plan/design，直到 design tree 全部分支确定。
- **[handoff](./skills/productivity/handoff/SKILL.md)**：压缩对话为 handoff，让另一 agent 继续。
- **[teach](./skills/productivity/teach/SKILL.md)**：用当前目录作有状态教学 workspace，跨会话学习技能或概念。
- **[to-questionnaire](./skills/productivity/to-questionnaire/SKILL.md)**：给能回答的人写 Markdown 问卷，异步或会议填写；追问发送目的，而不是主题本身。
- **[wait-what](./skills/productivity/wait-what/SKILL.md)**：没讲明白时重述，补背景，以简单语言和 `GLOSSARY.md` 词汇解释。

**Model-invoked**

- **[grilling](./skills/productivity/grilling/SKILL.md)**：持续访谈 plan、decision、idea，走遍 design tree，是 `grill-me`、`grill-with-docs`、`triage`、`wayfinder` 和 `improve-codebase-architecture` 的原语。
- **[writing-for-agents](./skills/productivity/writing-for-agents/SKILL.md)**：为 agent 写 skill、AGENTS.md/CLAUDE.md，以及通过 pointer 读取的文档。
