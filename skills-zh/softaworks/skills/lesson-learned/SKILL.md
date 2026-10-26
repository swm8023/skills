---
name: lesson-learned
description: "通过 git 历史分析近期代码变更，提炼软件工程经验。当用户询问 'what is the lesson here?'、'what can I learn from this?'、'engineering takeaway'、'what did I just learn?'、'reflect on this code'，或希望从近期工作中提炼原则时使用。"
---

# Lesson Learned

从真实代码变更中提炼具体、有依据的软件工程经验。用代码映照实践，而非讲课；向用户展示其代码已经体现的东西。

## Before You Begin

**先加载原则参考资料。**

1. 读取 `references/se-principles.md`，准备好原则目录
2. 如果怀疑变更中存在可改进之处，可选读 `references/anti-patterns.md`
3. 确定分析范围（见 Phase 1）

**至少加载 `se-principles.md` 后，才能继续。**

## Phase 1: Determine Scope

询问用户，或根据上下文推断要分析什么。

| 范围 | Git 命令 | 使用时机 |
|-------|-------------|-------------|
| Feature branch | `git log main..HEAD --oneline` + `git diff main...HEAD` | 用户位于非 main 分支时（默认） |
| 最近 N 次 commit | `git log --oneline -N` + `git diff HEAD~N..HEAD` | 用户指定范围，或位于 main 时（默认 N=5） |
| 特定 commit | `git show <sha>` | 用户提及某个具体 commit |
| 工作区变更 | `git diff` + `git diff --cached` | 提交前用户询问“这些变更怎么样？” |

**默认行为：**
- 位于 feature branch：分析当前分支相对于 main 的 commit
- 位于 main：分析最近 5 次 commit
- 用户指定其他范围时，采用用户给出的范围

## Phase 2: Gather Changes

1. 按确定的范围运行 `git log`，获取 commit 列表和信息
2. 运行 `git diff`，获取范围内的完整 diff
3. diff 较大（超过 500 行）时，先运行 `git diff --stat`，再选择性读取变更最多的 3–5 个文件
4. **仔细阅读 commit message** -- 其中包含原始 diff 无法体现的意图
5. 只读取发生变更的文件，不要读取整个仓库。

## Phase 3: Analyze

识别**主导模式** -- 这些变更中最有启发性的一点。

关注：
- **结构决策** -- 代码如何组织？为什么这样划分边界？
- **所做取舍** -- 获得了什么，又牺牲了什么？（可读性与性能、DRY 与清晰度、速度与正确性）
- **解决的问题** -- 变更前后有何不同？改进后的方案好在哪里？
- **错过的机会** -- 代码还有哪些改进空间？（温和地表述为“下次可以考虑……”）

将发现对应到 `references/se-principles.md` 中的具体原则。必须具体：引用真实代码，指明实际文件名及变更行。

## Phase 4: Present the Lesson

使用以下模板：

```markdown
## Lesson: [Principle Name]

**What happened in the code:**
[2-3 sentences describing the specific change, referencing files and commits]

**The principle at work:**
[1-2 sentences explaining the SE principle]

**Why it matters:**
[1-2 sentences on the practical consequence -- what would go wrong without this, or what goes right because of it]

**Takeaway for next time:**
[One concrete, actionable sentence the user can apply to future work]
```

如果还有第二条值得提出的经验（最多额外两条）：

```markdown
---

### Also worth noting: [Principle Name]

**In the code:** [1 sentence]
**The principle:** [1 sentence]
**Takeaway:** [1 sentence]
```

## What NOT to Do

| 避免 | 原因 | 替代做法 |
|-------|-----|---------|
| 列举所有勉强相关的原则 | 信息过载，缺少针对性 | 选择最相关的 1–2 条 |
| 分析未发生变更的文件 | 范围蔓延 | 围绕 diff 分析 |
| 忽略 commit message | 其中包含 diff 没有表达的意图 | 将其作为首要上下文阅读 |
| 提出脱离代码的抽象建议 | 无法落实 | 始终引用具体文件或行号 |
| 只提供负面反馈 | 打击积极性 | 先说明有效之处，再建议改进 |
| 提出超过 3 条经验 | 冲淡重点 | 一条有充分依据的经验胜过七条模糊建议 |

## Conversation Style

- **复盘，而非说教。** 以用户自己的代码为主要证据。
- **不要说“你本应该……”** -- 改为“这里的做法体现了……”或“下次遇到这种情况，可以考虑……”。
- **代码写得好，就明确指出。** 经验不总来自错误；识别良好模式也能强化它们。
- **变更很简单时**（例如调整一个配置或修复拼写），诚实说明，不要硬凑教训。“这些变更很直接，没有深层经验，属于良好的日常维护。”
- **必须具体。** 泛泛的建议没有价值；每个判断都必须指向具体代码变更。
