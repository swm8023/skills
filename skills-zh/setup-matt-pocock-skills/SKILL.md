---
name: setup-matt-pocock-skills
description: 在 AGENTS.md/CLAUDE.md 以及 `docs/agents/` 中搭建 `## Agent skills` 区块，让 engineering skills 知晓本 repo 的 issue tracker（GitHub 或本地 markdown）、triage label 词表，以及领域文档布局。请在首次使用 `to-issues`、`to-prd`、`triage`、`diagnose`、`tdd`、`improve-codebase-architecture` 或 `zoom-out` 之前运行——或者当这些 skill 看起来缺少关于 issue tracker、triage labels 或领域文档的 context 时运行。
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

为 engineering skills 所假设的 per-repo 配置进行脚手架搭建：

- **Issue tracker** —— issue 存放的位置（默认 GitHub；本地 markdown 也开箱即用受支持）
- **Triage labels** —— 五个标准 triage 角色所使用的字符串
- **Domain docs** —— `CONTEXT.md` 与 ADR 存放的位置，以及读取它们的 consumer 规则

这是一个由 prompt 驱动的 skill，而不是确定性脚本。先探索、呈现你的发现、与用户确认，然后再写入。

## Process

### 1. Explore

查看当前 repo 以了解其起始状态。读取已存在的内容；不要假设：

- `git remote -v` 和 `.git/config` —— 这是一个 GitHub repo 吗？是哪一个？
- repo 根目录下的 `AGENTS.md` 与 `CLAUDE.md` —— 它们是否存在其中之一？是否其中已经有一个 `## Agent skills` 区段？
- repo 根目录下的 `CONTEXT.md` 与 `CONTEXT-MAP.md`
- `docs/adr/` 以及任意 `src/*/docs/adr/` 目录
- `docs/agents/` —— 此 skill 此前的输出是否已经存在？
- `.scratch/` —— 表明本地 markdown issue tracker 约定已经被使用的迹象

### 2. Present findings and ask

总结哪些已经存在、哪些缺失。然后**一次一个**地引导用户走过这三个决策——呈现一节、获取用户的回答、再进入下一节。不要一次性把三个全部抛出来。

假设用户并不知道这些术语意味着什么。每一节都以一段简短的解释开头（它是什么、为什么这些 skill 需要它、如果他们做不同的选择会有什么改变）。然后展示选择和默认值。

**Section A —— Issue tracker。**

> 解释：The "issue tracker" 是本 repo 中 issue 存放的位置。诸如 `to-issues`、`triage`、`to-prd` 和 `qa` 之类的 skill 会从中读取并向其写入——它们需要知道是要调用 `gh issue create`、在 `.scratch/` 下写一个 markdown 文件，还是遵循你描述的某种其他 workflow。挑选你实际为本 repo 跟踪工作的位置。

默认姿态：这些 skill 是为 GitHub 设计的。如果某个 `git remote` 指向 GitHub，就提议它。如果某个 `git remote` 指向 GitLab（`gitlab.com` 或自托管 host），就提议 GitLab。否则（或者如果用户更倾向于其它），提供：

- **GitHub** —— issue 存放在该 repo 的 GitHub Issues 中（使用 `gh` CLI）
- **GitLab** —— issue 存放在该 repo 的 GitLab Issues 中（使用 [`glab`](https://gitlab.com/gitlab-org/cli) CLI）
- **Local markdown** —— issue 作为本 repo 中 `.scratch/<feature>/` 下的文件存在（适合个人项目或没有 remote 的 repo）
- **Other**（Jira、Linear 等）—— 让用户用一段话描述其 workflow；skill 会以自由形式的散文记录下来

**Section B —— Triage label 词表。**

> 解释：当 `triage` skill 处理一个新进来的 issue 时，它会让该 issue 经过一个状态机——needs evaluation、waiting on reporter、ready for an AFK agent to pick up、ready for a human，或 won't fix。为此，它需要应用与*你实际配置过的*字符串相匹配的 label（或在你的 issue tracker 中等价的东西）。如果你的 repo 已经使用了不同的 label 名（例如 `bug:triage` 而不是 `needs-triage`），在此处把它们映射好，这样 skill 就会应用正确的那些，而不是创建重复的。

五个标准角色：

- `needs-triage` —— 需要 maintainer 评估
- `needs-info` —— 等待 reporter
- `ready-for-agent` —— 已完整规格化、AFK-ready（agent 可以在没有人类 context 的情况下接手）
- `ready-for-human` —— 需要人类实现
- `wontfix` —— 不会被处理

默认：每个角色的字符串等于其名称。询问用户是否想覆盖其中任何一个。如果他们的 issue tracker 没有已存在的 label，默认值就可以。

**Section C —— Domain docs。**

> 解释：某些 skill（`improve-codebase-architecture`、`diagnose`、`tdd`）会读取一个 `CONTEXT.md` 文件来了解项目的领域语言，并读取 `docs/adr/` 来了解过往的架构决策。它们需要知道该 repo 是有一个全局 context 还是多个（例如一个 monorepo 有分别的 frontend/backend context），以便去正确的位置查找。

确认布局：

- **Single-context** —— 一个位于 repo 根目录的 `CONTEXT.md` + `docs/adr/`。大多数 repo 都是这样。
- **Multi-context** —— 根目录有 `CONTEXT-MAP.md`，指向各个 context 的 `CONTEXT.md` 文件（典型情况是 monorepo）。

### 3. Confirm and edit

向用户展示一份草稿，包含：

- 要添加到 `CLAUDE.md` / `AGENTS.md` 中被编辑的那一份的 `## Agent skills` 区块（关于选择规则参见第 4 步）
- `docs/agents/issue-tracker.md`、`docs/agents/triage-labels.md`、`docs/agents/domain.md` 的内容

让他们在写入之前进行编辑。

### 4. Write

**挑选要编辑的文件：**

- 如果 `CLAUDE.md` 存在，编辑它。
- 否则，如果 `AGENTS.md` 存在，编辑它。
- 如果两者都不存在，询问用户要创建哪一个——不要替他们做决定。

当 `CLAUDE.md` 已经存在时绝不要创建 `AGENTS.md`（反之亦然）—— 始终编辑那个已经存在的。

如果在所选文件中已经存在一个 `## Agent skills` 区块，就地更新其内容，而不是追加一个重复的。不要覆盖用户对周围区段的编辑。

该区块：

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of the label vocabulary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout — "single-context" or "multi-context"]. See `docs/agents/domain.md`.
```

然后使用此 skill 文件夹中的种子模板作为起点写入这三个文档文件：

- [issue-tracker-github.md](./issue-tracker-github.md) —— GitHub issue tracker
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md) —— GitLab issue tracker
- [issue-tracker-local.md](./issue-tracker-local.md) —— 本地 markdown issue tracker
- [triage-labels.md](./triage-labels.md) —— label 映射
- [domain.md](./domain.md) —— 领域文档 consumer 规则 + 布局

对于"其他"的 issue tracker，使用用户的描述从零写入 `docs/agents/issue-tracker.md`。

### 5. Done

告诉用户 setup 已完成，以及哪些 engineering skill 现在将从这些文件中读取。提到他们之后可以直接编辑 `docs/agents/*.md` —— 只有当他们想切换 issue tracker 或从零重新开始时，才需要再次运行此 skill。
