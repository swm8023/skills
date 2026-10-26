---
name: lesson-learned
description: "通过 git history 分析近期代码变更，提炼 software engineering 经验。当用户询问 'what is the lesson here?'、'what can I learn from this?'、'engineering takeaway'、'what did I just learn?'、'reflect on this code'，或希望从近期工作中提炼原则时使用。"
---

# Lesson Learned

从实际代码变更中提炼具体、有依据的 software engineering 经验。不是讲课，而是一面镜子。向用户展示其代码已经体现的东西。

## Before You Begin

**先加载 principles 参考资料。**

1. 读取 `references/se-principles.md`，使 principle 目录可供使用
2. 如果怀疑变更中存在可改进之处，可选择读取 `references/anti-patterns.md`
3. 确定分析范围（见 Phase 1）

**至少加载 `se-principles.md` 后，才能继续。**

## Phase 1: Determine Scope

询问用户，或根据上下文推断要分析什么。

| 范围 | Git 命令 | 使用时机 |
|-------|-------------|-------------|
| Feature branch | `git log main..HEAD --oneline` + `git diff main...HEAD` | 用户位于非 main branch 时（默认） |
| 最近 N 次 commit | `git log --oneline -N` + `git diff HEAD~N..HEAD` | 用户指定范围，或位于 main 时（默认 N=5） |
| 特定 commit | `git show <sha>` | 用户提及某个具体 commit |
| Working changes | `git diff` + `git diff --cached` | 用户在 commit 前询问“这些变更怎么样？” |

**默认行为：**
- 位于 feature branch 时：分析 branch 中的 commit 与 main 的差异
- 位于 main：分析最近 5 次 commit
- 用户指定其他范围时，采用用户给出的范围

## Phase 2: Gather Changes

1. 按确定的范围运行 `git log`，获取 commit 列表及 message
2. 运行 `git diff`，获取范围内的完整 diff
3. diff 较大（超过 500 行）时，先运行 `git diff --stat`，再选择性读取变更最多的 3–5 个文件
4. **仔细阅读 commit message** -- 其中包含原始 diff 未能体现的意图
5. 只读取发生变更的文件。不要读取整个 repo。

## Phase 3: Analyze

识别**主导模式** -- 这些变更中最有启发性的单个要点。

关注：
- **结构决策** -- 代码如何组织？为什么这样划分边界？
- **所做取舍** -- 获得了什么，牺牲了什么？（readability 与 performance、DRY 与 clarity、speed 与 correctness）
- **解决的问题** -- 变更前后有何不同？是什么让“变更后”更好？
- **错过的机会** -- 代码哪里可以改进？（温和地表述为“下次可以考虑……”）

将发现对应到 `references/se-principles.md` 中的具体 principles。必须具体：引用实际代码，指明实际文件名及变更行。

## Phase 4: Present the Lesson

使用以下模板：

```markdown
## Lesson: [Principle Name]

**代码中发生了什么：**
[用 2-3 句话描述具体变更，并引用文件与 commit]

**体现的 principle：**
[用 1-2 句话解释该 SE principle]

**为什么重要：**
[用 1-2 句话说明实际后果：没有这种做法会出什么问题，或者因为它而产生什么良好结果]

**下次可应用的经验：**
[一个具体、可执行的句子，用户可以将其应用于今后的工作]
```

如果还有第二条值得提出的经验（最多额外 2 条）：

```markdown
---

### Also worth noting: [Principle Name]

**代码中的体现：** [1 句话]
**对应的 principle：** [1 句话]
**可应用的经验：** [1 句话]
```

## What NOT to Do

| 避免 | 原因 | 替代做法 |
|-------|-----|---------|
| 列举所有仅笼统相关的 principles | 信息过载，泛泛而谈 | 选择最相关的 1-2 条 |
| 分析未发生变更的文件 | Scope creep | 围绕 diff 分析 |
| 忽略 commit message | 其中包含 diff 未能体现的意图 | 将其作为主要上下文阅读 |
| 提出脱离代码的抽象建议 | 无法落实 | 始终引用具体文件或行 |
| 只提供负面反馈 | 打击积极性 | 先说明有效之处，再建议改进 |
| 超过 3 条经验 | 冲淡见解 | 一条有充分依据的经验胜过七条模糊经验 |

## Conversation Style

- **重在反思，而非规定做法。** 以用户自己的代码为主要证据。
- **绝不说“你本应该……”** -- 改为“这里的做法体现了……”或“下次遇到这种情况，可以考虑……”。
- **代码写得好，就明确指出。** 并非每条经验都在讨论哪里出了问题。识别良好模式，也会强化这些模式。
- **变更很简单时**（例如仅调整一个 config 或修复一个 typo），应诚实说明，而不是硬凑经验。“这些变更很直接，没有深层经验，只是良好的日常维护。”
- **必须具体。** 泛泛的建议没有价值。每个判断都必须指向具体代码变更。
