# scope skill — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `skills/` 下落地两个新 skill —— `auto-using-skills`（强制总入口）和 `scope`（需求拷问 skill），让今天 grill 出来的体系真正运行起来。

**Architecture:** 直接基于 `skills.bak/using-superpowers/SKILL.md` 改写出 `skills/auto-using-skills/SKILL.md`；从零撰写 `skills/scope/SKILL.md`，体现今天讨论的所有决策（探索 + grill + 落 spec/不落 spec 两条出口）。`skills/writing-plans/` 已存在不动。

**Tech Stack:** Markdown，YAML frontmatter。

---

## File Structure

将创建的文件：

- **Create:** `skills/auto-using-skills/SKILL.md` —— 总入口 skill，每次对话强制加载，把需求类话题路由到 scope
- **Create:** `skills/scope/SKILL.md` —— 需求拷问 skill，三阶段流程（判断规模 → grill → 分支处理）

不会修改的文件：

- `skills/writing-plans/SKILL.md` —— 原版直接拷过来，本阶段不动
- `skills/writing-plans/plan-document-reviewer-prompt.md` —— 同上
- `skills.bak/`、`skills-zh/` —— 仅作参考，不动

---

## Task 1: 创建 auto-using-skills/SKILL.md

**Files:**
- Read: `skills.bak/using-superpowers/SKILL.md`（参考来源）
- Create: `skills/auto-using-skills/SKILL.md`

- [ ] **Step 1: 读取原版 using-superpowers**

读 `skills.bak/using-superpowers/SKILL.md` 全文，确认要改写的段落位置。

- [ ] **Step 2: 撰写 auto-using-skills/SKILL.md**

按以下结构改写。

**frontmatter（必填）：**
```yaml
---
name: auto-using-skills
description: 在每次对话开始时强制加载。规定"哪怕只有 1% 可能某个 skill 适用，就必须调用 Skill 工具"，并把需求类话题（加 feature、修 bug、改东西、新建系统）自动路由到 scope skill。
---
```

**正文必须包含的章节：**

1. `<SUBAGENT-STOP>` 块 —— 如果是 subagent 被派遣执行特定任务，跳过本 skill
2. `<EXTREMELY-IMPORTANT>` 块 —— "1% 适用就必须调用"的强制声明
3. **指令优先级**章节 —— 三层（用户指令 > skill > 默认 system prompt）
4. **如何访问 skill** —— 单独一段说"使用 Skill 工具，绝不要对 skill 文件用 Read 工具"。**砍掉**原版的 Copilot CLI / Gemini CLI / 跨平台说明
5. **使用 skill** 章节，含决策树流程图（dot 格式）。流程图节点把原版的 "Already brainstormed?" 改为 "Already scoped?"，"Invoke brainstorming skill" 改为 "Invoke scope skill"
6. **红色警示**章节 —— 完整保留原版的"自我合理化念头对照表"
7. **skill 优先级**章节 —— 改成 "scope 优先"，原版 "先 brainstorming、debugging" 改为 "先 scope"
8. **skill 类型** —— 完整保留（刚性 / 灵活）
9. **用户指令** —— 完整保留

**改写规则：**
- 所有 "Superpowers" 字眼 → 删去或改成"本 skill 体系"
- 所有 "superpowers:xxx" 引用 → 简化为 "xxx skill"
- 所有 "brainstorming" → "scope"（但保留原版 "brainstorming" 一词在历史叙述中作为对比时除外，本文档不需要这种对比）
- 砍掉 "Platform Adaptation"、"references/" 引用、"Copilot CLI"、"Gemini CLI"、"在 Codex 中" 等跨平台段落
- 保留"announce skill 使用"的要求（明确写在流程图节点 "Announce: 'Using [skill] to [purpose]'" 中）

整篇用中文撰写（与 scope/SKILL.md 保持一致），但 frontmatter 的 `name` 字段保留英文 `auto-using-skills`，技术术语（skill、subagent、agent、prompt 等）保留英文夹在中文里。

- [ ] **Step 3: 验证 auto-using-skills/SKILL.md**

文件存在性 + 内容必备项检查：

```bash
test -f /e/_Code/skills/skills/auto-using-skills/SKILL.md && echo OK_EXISTS
grep -c "name: auto-using-skills" /e/_Code/skills/skills/auto-using-skills/SKILL.md
grep -c "scope" /e/_Code/skills/skills/auto-using-skills/SKILL.md
grep -c "1%" /e/_Code/skills/skills/auto-using-skills/SKILL.md
grep -c "指令优先级" /e/_Code/skills/skills/auto-using-skills/SKILL.md
grep -c "红色警示" /e/_Code/skills/skills/auto-using-skills/SKILL.md
grep -c "Already scoped" /e/_Code/skills/skills/auto-using-skills/SKILL.md
grep -ic "superpowers" /e/_Code/skills/skills/auto-using-skills/SKILL.md
grep -ic "Copilot\|Gemini\|Codex" /e/_Code/skills/skills/auto-using-skills/SKILL.md
```

Expected:
- `OK_EXISTS`
- `name: auto-using-skills` 出现 ≥ 1 次
- `scope` 出现 ≥ 5 次
- `1%` 出现 ≥ 1 次
- 各章节标题各出现 ≥ 1 次
- `superpowers`（不区分大小写）出现 0 次
- `Copilot/Gemini/Codex` 出现 0 次

任一项不满足 → 修改 SKILL.md，再次验证。

---

## Task 2: 创建 scope/SKILL.md

**Files:**
- Read: `docs/2026-06-18-scope-skill/spec-scope-skill.md`（决策来源）
- Read: `skills.bak/brainstorming/SKILL.md`（参考流程图风格）
- Read: `skills.bak/grill-me/SKILL.md`（参考极简风格）
- Create: `skills/scope/SKILL.md`

- [ ] **Step 1: 重读 spec 与参考来源**

确认待写入 SKILL.md 的所有决策已经在 spec 的 Decisions 章节中明确。

- [ ] **Step 2: 撰写 scope/SKILL.md**

**frontmatter：**
```yaml
---
name: scope
description: 你必须在任何创造性工作之前使用本 skill —— 创建 feature、构建组件、添加功能、修改行为、设计新系统等。通过对抗式 Q&A 与推荐答案沿决策树深挖，直到每个分支被解决，然后让用户选择"对话内 plan 立即执行"或"落 spec 进入正式实施流程"。
---
```

**正文必须包含的章节：**

1. **概览** —— 一段，说明 scope 是几乎所有需求开始前的默认入口；它结合了 brainstorming 的探索与 grill-me 的对抗式提问；产物是"已确认决策集合"，最终落成对话内 plan 或 spec.md。

2. **HARD-GATE** —— 类似原版 brainstorming 的硬性 gate：在用户选择出口（落 spec 或不落）之前，绝不调用任何实施 skill、绝不写代码、绝不搭脚手架。

3. **流程**（核心章节，三阶段）：

   **阶段 1：判断规模 + 探索**
   - scope 自己判断需求是"小需求"还是"中大需求"
   - 小需求（边界清晰、单文件级修改、明显简单）跳过探索，直接进入阶段 2
   - 中大需求做主题相关的快速 codebase 探索（grep / glob 关键词、读相关文件，30 秒级别）
   - grill 过程中遇到具体问题再按需补查

   **阶段 2：grill 式连续提问**
   - **一次一题**（不要把多个问题塞进同一条消息）
   - **每题给推荐答案**（让用户从"创造者"变成"审核者"，决策成本骤降）
   - **决策树式深挖**（A 的回答决定接下来问 B 还是 B'）
   - **能查 codebase 的不问用户**（用户已经写在仓库里的事实不要拿来当问题问）
   - **不再有"提 2-3 方案"环节**（由"推荐答案"机制吸收）
   - **不再有 visual companion**

   **阶段 3：询问出口 + 分支处理**
   - 决策完成后问用户："要落 spec 吗？"
   - 不落 → 在对话里直接生成 plan，用户确认后执行，docs/ 下零文档
   - 落 → 写 `docs/<YYYY-MM-DD>-<short-slug>/spec-<short-slug>.md`，self-review，请用户审阅，调用 writing-plans skill

4. **流程图（dot 格式）** —— 把上面三阶段画成 graphviz dot diagram，节点形状沿用原版 brainstorming 的约定（box、diamond、doublecircle）。

5. **spec.md 模板** —— 完整列出 8 节结构：
   - Goal（背景 + 目标合并的一两段）
   - Decisions（一问一答形式，AI 把零碎 grill 问题归并成更高阶 Q+A）
   - Architecture
   - Components
   - Data Flow
   - Error Handling
   - Testing
   - Out of Scope

   并给出极简示例（占位符级别、不要实际示例代码）。

6. **Self-Review（4 项检查）** —— 写完 spec 后立刻自审：
   1. 占位符扫描（TBD / TODO / 含糊需求）
   2. 内部一致性（章节互相矛盾？架构与 feature 描述一致？）
   3. Scope（是否聚焦到单一计划？还是需要拆子项目？）
   4. 歧义（需求能否被解读成两种含义？）

   就地修复，无需二次 review。

7. **用户审阅 Gate** —— self-review 通过后，发出审阅请求模板：
   > "Spec written and committed to `<path>`. Please review it and let me know if you want to make any changes before we start writing out the implementation plan."

   等待用户响应。如有改动需求，更新 spec，重跑 self-review。只有用户批准后才继续。

8. **过渡到 writing-plans** —— 用户批准 spec 后，明确调用 writing-plans skill：
   > "I'm using the writing-plans skill to create the implementation plan."

   不要调用任何其他 skill。writing-plans 是 scope 的下一步。

9. **关键原则** —— 列出 5-7 条核心原则：
   - 一次一个问题
   - 每题都给推荐答案
   - 无情地 YAGNI
   - 决策树式深挖
   - codebase 能答的不问用户
   - 增量式验证（呈现决策、获得批准再继续）

10. **目录与文件命名** —— 一段，说明命名规则：
    - **目录**：`docs/<YYYY-MM-DD>-<short-slug>/`，日期 + AI 生成的短英文 slug（kebab-case），slug 由 AI 根据决策内容自动生成，用户在 scope 末尾可改
    - **文件**：`<doctype>-<slug>.md`，带 doctype 前缀和 slug 但**不**带日期（日期已经在目录上）。例如 `spec-scope-skill.md`、`plan-scope-skill.md`。这样在多 tab 编辑、grep、最近文件列表等场景下，光看文件名就能知道是"什么主题的什么文档"

整篇用中文撰写。frontmatter `name` 用英文 `scope`。技术术语保留英文（grill、spec、plan、self-review、HARD-GATE、kebab-case、subagent 等）。

- [ ] **Step 3: 验证 scope/SKILL.md**

文件存在性 + 内容必备项检查：

```bash
test -f /e/_Code/skills/skills/scope/SKILL.md && echo OK_EXISTS
grep -c "name: scope" /e/_Code/skills/skills/scope/SKILL.md
grep -c "HARD-GATE" /e/_Code/skills/skills/scope/SKILL.md
grep -c "一次一题\|一次一个问题" /e/_Code/skills/skills/scope/SKILL.md
grep -c "推荐答案" /e/_Code/skills/skills/scope/SKILL.md
grep -c "决策树" /e/_Code/skills/skills/scope/SKILL.md
grep -c "落 spec" /e/_Code/skills/skills/scope/SKILL.md
grep -c "self-review\|Self-Review" /e/_Code/skills/skills/scope/SKILL.md
grep -c "writing-plans" /e/_Code/skills/skills/scope/SKILL.md
grep -c "Architecture\|Components\|Data Flow\|Error Handling\|Testing\|Out of Scope" /e/_Code/skills/skills/scope/SKILL.md
grep -c "spec-<slug>\|spec-<short-slug>\|<doctype>" /e/_Code/skills/skills/scope/SKILL.md
grep -ic "visual companion\|2-3 方案\|2-3 approaches" /e/_Code/skills/skills/scope/SKILL.md
```

Expected:
- `OK_EXISTS`
- `name: scope` 出现 ≥ 1 次
- `HARD-GATE` 出现 ≥ 1 次
- "一次一题/一次一个问题" 出现 ≥ 1 次
- "推荐答案" 出现 ≥ 1 次
- "决策树" 出现 ≥ 1 次
- "落 spec" 出现 ≥ 1 次
- "self-review/Self-Review" 出现 ≥ 1 次
- `writing-plans` 出现 ≥ 1 次
- spec 8 节标题各出现 ≥ 1 次
- "spec-<slug>" 或 "<doctype>" 等文件命名规则提示出现 ≥ 1 次
- "visual companion" / "2-3 方案" 出现 0 次（确认这两个被砍掉的特性确实没写进来）

任一项不满足 → 修改 SKILL.md，再次验证。

---

## Task 3: Self-Review 整体一致性

**Files:**
- Read: `docs/2026-06-18-scope-skill/spec-scope-skill.md`
- Read: `skills/auto-using-skills/SKILL.md`
- Read: `skills/scope/SKILL.md`

- [ ] **Step 1: Spec 覆盖度检查**

对照 spec 的 Decisions 章节每一条 Q&A，确认在两个 SKILL.md 里都能找到对应实现：

| Spec 决策 | 应体现于 |
|---|---|
| scope 三阶段流程 | scope/SKILL.md "流程"章节 |
| 一次一题、推荐答案、决策树 | scope/SKILL.md "阶段 2" + "关键原则" |
| 砍 2-3 方案、砍 visual companion | scope/SKILL.md（不存在这些章节）|
| 两条出口（落/不落 spec） | scope/SKILL.md "阶段 3" |
| spec.md 8 节模板 | scope/SKILL.md "spec.md 模板" |
| self-review 4 项 | scope/SKILL.md "Self-Review" |
| 调用 writing-plans | scope/SKILL.md "过渡到 writing-plans" |
| 主题型目录 + 文件名带 slug | scope/SKILL.md "目录与文件命名" |
| auto-using-skills 强制路由 | auto-using-skills/SKILL.md `<EXTREMELY-IMPORTANT>` + 流程图 |
| 1% 强制规则 | auto-using-skills/SKILL.md |
| 指令优先级三层 | auto-using-skills/SKILL.md |
| 红色警示表 | auto-using-skills/SKILL.md |

如果发现 gap，回到对应 Task 修复，重跑该 Task 的 Step 3 验证。

- [ ] **Step 2: 占位符扫描**

```bash
grep -n "TBD\|TODO\|implement later\|fill in details\|XXX\|FIXME" /e/_Code/skills/skills/auto-using-skills/SKILL.md /e/_Code/skills/skills/scope/SKILL.md
```

Expected: 无输出。

如有命中 → 修复，重跑。

- [ ] **Step 3: 类型 / 名称一致性**

检查两个 SKILL.md 互相引用的"skill 名"是否一致：

```bash
grep -h "scope\|writing-plans\|auto-using-skills" /e/_Code/skills/skills/auto-using-skills/SKILL.md /e/_Code/skills/skills/scope/SKILL.md | head -30
```

人工 review：
- 引用 scope 的地方必须叫 `scope`，不能叫 `Scope` / `scope-skill` / `brainstorming` 等
- 引用 writing-plans 的地方必须叫 `writing-plans`，不能叫 `writing-plan` / `write-plans`
- 引用本 skill 自己的地方必须叫 `auto-using-skills`

如有不一致 → 修复，重跑。

- [ ] **Step 4: 交叉链接验证**

scope/SKILL.md 应当**不**直接调用 subagent-driven-development、executing-plans 等当前不存在的 skill（这些是原版的，我们没拷过来）。

```bash
grep -ic "subagent-driven-development\|executing-plans\|finishing-a-development-branch\|using-git-worktrees" /e/_Code/skills/skills/scope/SKILL.md
```

Expected: 0。

如有命中 → 修复（要么删除引用，要么 fall back 到 writing-plans）。

---

## Task 4: 落地验证（dry run）

**Files:**
- Read: `skills/auto-using-skills/SKILL.md`
- Read: `skills/scope/SKILL.md`

- [ ] **Step 1: 阅读两个 SKILL.md 全文**

以一个新进入的 reader 视角（假设零 context）通读两个文件，检查：

1. 单读 auto-using-skills/SKILL.md，能否理解何时该调 scope？
2. 单读 scope/SKILL.md，能否完整执行三阶段流程？知道何时落 spec、何时不落？知道 spec 模板长什么样？
3. 两个文件之间是否存在循环依赖（A 说看 B，B 说看 A，永远进不去）？

如发现任何"读不懂 / 流程缺环 / 循环依赖" → 修复。

- [ ] **Step 2: 与 spec 的 Testing 章节对齐**

spec 的 Testing 章节列出了 3 个验收 case 和 4 个反例信号。逐项核对当前实现是否能通过：

| 验收项 | 当前是否满足 |
|---|---|
| Case 1: spec 自我验证（本文档存在 + 5 节齐全 + 4 项 self-review 通过）| ✅ 已完成 |
| Case 2: 完整链路 dry run（不落 spec / 落 spec 两条路径）| 实际跑一遍才知道，本 plan 不强制 |
| Case 3: auto-using-skills 强制路由 | 实际跑一遍才知道，本 plan 不强制 |
| 反例 1: AI 没调 scope 直接回答 | scope/SKILL.md 的 HARD-GATE 是否够明显？|
| 反例 2: scope 一次问多个问题 | 关键原则是否够强？|
| 反例 3: spec 出现 TBD/TODO | self-review 4 项是否足够？|
| 反例 4: 文档落在 docs/specs/ 而不是 docs/<topic>/ 或文件没带 slug 前缀 | "目录与文件命名"章节是否够明确？|

如发现某反例信号在 SKILL.md 里防御不够 → 加强相应章节。

---

## Task 5: 报告完成

- [ ] **Step 1: 列出本次产出**

```bash
ls -la /e/_Code/skills/skills/auto-using-skills/ /e/_Code/skills/skills/scope/
wc -l /e/_Code/skills/skills/auto-using-skills/SKILL.md /e/_Code/skills/skills/scope/SKILL.md
```

输出预期：两个目录各包含一个 SKILL.md，行数合理（auto-using-skills 约 80-120 行，scope 约 150-250 行）。

- [ ] **Step 2: 向用户汇报**

汇报内容包含：
- 创建的两个 SKILL.md 路径
- 每个文件的行数
- self-review 与 dry run 的结果
- 两个 SKILL.md 是否需要用户审阅 / 是否可以直接进入下一步使用

询问用户：
- 是否要审阅两个 SKILL.md 的具体内容？
- 是否需要 git commit & push？
- 是否要立即用一个真实需求 dry run 一下整个流程？

---

## Self-Review

我对照 spec 跑了一遍：

**1. Spec 覆盖度** —— Decisions 章节每条 Q&A 都映射到了 Task 1 / Task 2 的 Step 2 实现要点表格，Task 3 Step 1 还做了一次显式核对。✅

**2. 占位符扫描** —— 本 plan 文档无 TBD / TODO / "implement later" 等。✅

**3. 类型一致性** —— 两个 SKILL.md 的 frontmatter `name` 字段、互相引用的 skill 名、文件路径在 plan 中均一致（`auto-using-skills`、`scope`、`writing-plans`）。✅

无 gap 需要修复，可以开始执行。
