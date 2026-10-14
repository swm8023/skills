---
name: setup-matt-pocock-skills
description: "为工程 skill 配置本仓库：设置 issue tracker、triage 标签词汇和领域文档布局。首次使用其他工程 skill 前运行一次。"
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

建立工程 skill 依赖的仓库级配置：

- **Issue tracker**：issue 存放位置（默认 GitHub，也直接支持本地 Markdown）
- **Triage label**：五个规范 triage 角色所用的字符串
- **Domain doc**：`GLOSSARY.md` 和 ADR 的位置，以及读取规则

这是 prompt 驱动的 skill，不是确定性脚本。先探索、展示发现、与用户确认，再写入。

## Process

### 1. Explore

查看当前仓库，了解起始状态。读取已有内容，不作假设：

- `git remote -v` 和 `.git/config`：是否 GitHub 仓库？是哪一个？
- 根目录 `AGENTS.md` 和 `CLAUDE.md`：是否存在？是否已有 `## Agent skills`？
- 根目录 `GLOSSARY.md` 和 `GLOSSARY-MAP.md`
- `docs/adr/` 以及任何 `src/*/docs/adr/` 目录
- `docs/agents/`：本 skill 以前的产物是否存在？
- `.scratch/`：表明可能已经使用本地 Markdown issue tracker 约定
- 是否安装 `triage` skill？（旁边的 `triage` 文件夹，或可用 skill 清单中的 `triage`。）这决定是否执行 Section B。
- monorepo 信号：`pnpm-workspace.yaml`、`package.json` 的 `workspaces`，或含自身 `src/` 的实际 `packages/*`。真正大型多 package 仓库才有这些；不存在则采用 single-context，几乎所有仓库都如此。

### 2. Present findings and ask

概述已有和缺失内容，再按顺序处理各 section。每次一节、一个回答，再到下一节。

每节先给推荐答案，让用户一个词即可接受。只有选择确有分支才附一句解释；探索已确定时整节跳过（未安装 `triage` 时跳 B，没有 monorepo 时跳 C）。

**Section A：Issue tracker。**

> 解释：“issue tracker”是本仓库存放 issue 的地方。`to-tickets`、`triage`、`to-spec` 等 skill 会读写它。它们需要知道应调用 `gh issue create`、写入 `.scratch/` 的 Markdown，还是按你描述的其他 workflow。选择本仓库真正跟踪工作的地方。

默认立场：这些 skill 为 GitHub 设计。如果 `git remote` 指向 GitHub，推荐 GitHub；如果 `git remote` 指向 GitLab（`gitlab.com` 或自托管），推荐 GitLab。否则，或用户更偏好其他方式时，提供：

- **GitHub**：issue 放在仓库的 GitHub Issues（使用 `gh` CLI）
- **GitLab**：issue 放在 GitLab Issues（使用 [`glab`](https://gitlab.com/gitlab-org/cli) CLI）
- **Local markdown**：issue 是仓库 `.scratch/<feature>/` 下的文件（适合个人项目或没有 remote 的仓库）
- **Other**（Jira、Linear 等）：请用户用一段话描述 workflow；skill 记录为自由文字

把选择记录到 `docs/agents/issue-tracker.md`。GitHub/GitLab 模板含“PRs as a request surface”开关，默认**关闭**。保持关闭，不主动提出；希望将外部 PR 加入 triage 队列的用户以后可自行修改。

**Section B：Triage 标签词汇。** 未安装 `triage` 时整节跳过，探索已确定；没有安装的 skill 不需要标签。

如果已安装，只问一个问题：

> 是否保留默认 triage 标签？（推荐：**是**）

默认是五个规范角色，标签字符串等于角色名：`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`。回答**是**时原样写入。只有用户说否，通常是 tracker 已用其他名字（例如 `needs-triage` 对应 `bug:triage`），才收集覆盖值，让 `triage` 使用现有标签而非创建重复。

**Section C：Domain doc。** 默认 **single-context**（根目录一份 `GLOSSARY.md` 加 `docs/adr/`）。适合几乎所有仓库，直接写入，不提问。

只有探索发现 monorepo 信号时，才提供 **multi-context**（根目录 `GLOSSARY-MAP.md` 指向各 context 的 `GLOSSARY.md`），再确认所需布局。

### 3. Confirm and edit

向用户展示以下草稿：

- 要加入正在编辑的 `CLAUDE.md` / `AGENTS.md` 的 `## Agent skills` block（选文件规则见步骤 4）
- `docs/agents/issue-tracker.md`、`docs/agents/domain.md`、`docs/agents/triage-labels.md` 内容（最后一项仅在安装 `triage` 时）

写入前让用户修改。

### 4. Write

**选择编辑的文件：**

- 存在 `CLAUDE.md` 就编辑它。
- 否则存在 `AGENTS.md` 就编辑它。
- 都不存在时询问用户创建哪一个，不替用户选。

存在 `CLAUDE.md` 时绝不另建 `AGENTS.md`，反之亦然；始终编辑已有的那个。

选定文件已有 `## Agent skills` 时，原位更新，不追加重复。不要覆盖周围章节的用户修改。

block 如下：

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of the label vocabulary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout: "single-context" or "multi-context"]. See `docs/agents/domain.md`.
```

仅当安装 `triage` 且执行了 Section B 时，加入 `### Triage labels` 子块并写入 `docs/agents/triage-labels.md`。否则两者都省略。

GitHub/GitLab 执行 Section B 后，创建 tracker 缺少的每个配置标签（`gh label create` / `glab label create`）。

再以本 skill 文件夹内的种子模板为起点，写入文档：

- [issue-tracker-github.md](./issue-tracker-github.md)：GitHub issue tracker
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md)：GitLab issue tracker
- [issue-tracker-local.md](./issue-tracker-local.md)：本地 Markdown issue tracker
- [triage-labels.md](./triage-labels.md)：标签映射（仅当安装 `triage`）
- [domain.md](./domain.md)：领域文档读取规则与布局

“Other” tracker 根据用户描述，从零编写 `docs/agents/issue-tracker.md`。

### 5. Done

告诉用户设置完成，以及哪些工程 skill 会读取这些文件。说明以后可直接编辑 `docs/agents/*.md`；只有想切换 tracker 或重新设置时才需重跑本 skill。
