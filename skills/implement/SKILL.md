---
name: implement
description: Implement approved product, code, or bug-fix work end to end after the user has approved a spec, confirmed scope's in-conversation implementation contract, or approved debug's evidence-backed fix contract. Create new persisted plans only for spec-backed work, then execute, verify, and complete the configured Git workflow. Do not use while requirements, root cause, or approval are unresolved.
---

# implement —— 实施已确认工作

## 概览

把已确认的实施契约一次完成：审查输入、形成可执行计划、实现、验证，并按项目 Git 偏好收尾。计划是执行所需的内部工作项，不是单独出口，除非用户明确只要计划文本。

**开始时声明：** “我正在使用 implement skill 来规划并实施这份已确认范围的工作。”

## 输入关口

只接受以下四个参数：

- `source_kind`：`approved-spec`、`confirmed-conversation` 或 `approved-fix`。
- `source`：已批准 spec 路径、当前对话已确认的完整实施契约，或已批准的完整修复契约。
- `wiki_target`：已确认的 wiki 目标或 `none`。
- `git_state`：`prepared` 或 `unprepared`。

不传递单独的 approval 参数。`approved-spec` 的 `source` 必须指向头部带有 `> 状态：已批准 <日期>` 的 `docs/scope/<YYYY-MM-DD>-<slug>.md`；`confirmed-conversation` 必须来自当前对话；`approved-fix` 必须包含 debug 已证实并获用户批准的根因与修复契约。

如果需求仍未明确、spec 尚未批准，返回 `scope`。如果 bug 根因或修复方案尚未确认，返回 `debug`。只有零散要求或用户最初的“修一下”时，不得自行认定为 `confirmed-conversation` 或 `approved-fix`。

`confirmed-conversation` 与 `approved-fix` 契约只存在于对话中，会话中断后无法恢复；此时不得凭残缺记忆执行，返回 `scope` 或 `debug` 重新确认契约。

## 阶段 1：加载与审查

1. 按 `source_kind` 加载 `source`。approved-spec 先核对头部状态行，未标记 `已批准` 时（含状态行缺失的旧 spec）返回 scope，不在 implement 内批准或改写；confirmed-conversation 核对当前对话中的完整确认记录；approved-fix 核对根因、证据、repro、fix scope、验收、验证、风险和诊断产物。
2. 检查输入是否完整、一致、可由一个实施流程完成。多个独立子系统应拆成多个 spec 或多个 plan，每个 plan 都必须能产出可工作、可测试的软件。
3. 先规划文件结构：哪些文件会创建或修改、每个文件负责什么、边界和接口在哪里。预估改动面只作为代码探索起点，可以依据仓库事实补充或修正精确文件而不请求二次确认。遵循既有代码模式；只在被修改文件已经难以维护时，把拆分纳入计划。
4. 有实质歧义、缺失决定、危险动作、计划过时或仓库事实冲突时，在写入前提出并等待用户决定；不要用实现细节替用户补产品决策。
5. 按 `git_state` 接管 Git：`prepared` 时核对当前任务已有的 `prepare` 结果并继承其文件所有权，不重复 `prepare`；状态与实际上下文不一致时停止并报告。`unprepared` 时在写 plan、wiki、测试或代码前调用 `git-workflow` 的 `prepare` 阶段。

直接以 `source` 为唯一事实来源，不生成中间契约副本。approved-spec 与 confirmed-conversation 中，决策基线是硬约束，功能与技术设计是可按代码事实细化的实施基线，预估改动面是探索起点，验收及其验证证据是完成条件；旧结构按语义读取。approved-fix 中，根因和 fix scope 是修复边界，修复方案是实施基线，acceptance、原始 repro、回归测试和相关测试是完成条件。

只有需要改变 `source` 中的需求边界、技术决策、修复边界、验收，或引入新的实质风险时才回到用户决策；局部实现结构、精确文件和任务顺序由 plan/Todo 自行确定。

## 阶段 2：形成执行计划

### approved-spec

根据 spec 编写详细计划并保存：

- spec：`docs/scope/<YYYY-MM-DD>-<slug>.md`
- plan 目录：`docs/plans/<YYYY-MM-DD>-<slug>/`
- 默认 plan：`docs/plans/<YYYY-MM-DD>-<slug>/plan-<slug>.md`
- 一个 spec 需要多个计划时，都放在同一目录并使用有意义的 `plan-<part>.md` 名称。
- 目录中已有 plan 时先读取；同一实施可更新复用，独立实施新建文件，不得盲目覆盖或删除其他计划。

保存后对照 spec 自审并修正。自审通过后，调用 `git-workflow` 的 `checkpoint` 阶段，只处理该 plan 和同一工作单元明确拥有的文档。

### confirmed-conversation

使用对话 Todo 记录任务、关键步骤和验证，不创建 `docs/scope/`、`docs/plans/` 或其他计划文档。快速检查范围、验收、风险和测试后直接执行。

### approved-fix

使用对话 Todo 执行已批准修复，不创建 spec 或 plan 文档。Todo 必须从原始 repro 开始，以重跑原始 repro、回归测试和相关测试结束；只实施契约中的 root-cause 修复，不扩展为功能或无关重构。把 debug 交接的诊断产物纳入继承或新建的文件所有权。

## 计划质量标准

计划面向“熟练但对本代码库零上下文”的执行者：写明每个任务涉及的文件、关键代码、测试、文档和验证。遵循 DRY、YAGNI 和下述测试先行契约。按 Git 偏好设置 checkpoint。

### 计划头部

每个持久化 plan 必须以此头部开始：

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SKILL: Use implement to execute this plan task-by-task. Respect the handed-off git_state: inherit prepared, otherwise prepare; use git-workflow for checkpoint/finalize. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds]

**Scope Source:** [Approved spec path or source note]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

**Verification:** [Primary commands or checks]

---
```

### 任务粒度

把任务拆成 2-5 分钟可执行动作。每个任务应是自包含变更，单独看也合理；一起变化的文件放在同一任务里。

生产行为变更按下列测试先行步骤展开。纯文档、说明性元数据、文件镜像或搬移、仅同步生成产物，以及经 source 明确确认不改变可执行行为的配置整理，用明确的针对性验证步骤替换 RED/GREEN，不伪造失败测试。

````markdown
### Task N: [Component or Behavior]

**Files:**
- Create: `exact/path/to/file.ext`
- Modify: `exact/path/to/existing.ext`
- Test/Verify: `tests/exact/path/to/test.ext` or an exact validation command

**Acceptance:** [Specific observable result]

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_specific_behavior -v`
Expected: FAIL for the missing or incorrect behavior being introduced.

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_specific_behavior -v`
Expected: PASS.

- [ ] **Step 5: Run focused regression checks**

Run: `[exact command]`
Expected: PASS or known acceptable output.

- [ ] **Step 6: Git checkpoint**

After verification passes, invoke `git-workflow` in `checkpoint` mode for this task's files. Record commit hash + subject, or the reason the checkpoint was skipped.
````

### 禁止占位符

计划失败信号：

- `TBD`、`TODO`、`implement later`、`fill in details`
- “add appropriate error handling” / “add validation” / “handle edge cases”
- “write tests for the above”，但没有实际测试代码或断言
- “similar to Task N”，但没有重复写出本任务需要的具体内容
- 只描述要做什么，却不给涉及代码的具体路径、接口、命令或预期输出
- 后续任务引用了前面从未定义的类型、函数、方法或字段

### 自我审查

写完计划后重新对照输入：

1. **覆盖度**：每项需求边界、技术决策、关键设计合同和验收都能指向对应任务；旧 spec 的需求、决策和排除项按同样语义检查。
2. **占位符**：搜索并消除上文禁止项。
3. **一致性**：类型、函数名、路径、命令和测试名称前后一致。
4. **顺序**：先测试再实现；共享基础设施先于依赖它的任务；每个 checkpoint 前都有验证信号。
5. **边界**：计划不违反决策基线或扩大已确认结果，不夹带无关重构；预估改动面可以按代码事实细化，不要求文件清单逐字一致。

发现问题就地修复，再进入执行。

## 测试先行执行契约

本 skill 直接拥有测试先行流程，不再转交其他 skill。

### 适用边界

- 新功能、bug 修复、重构或其他可观察生产行为变更必须执行 RED、最小 GREEN、必要重构和相关回归。
- `approved-fix` 优先复用 debug 已交接的失败测试、repro 或诊断脚本作为 RED；仅在 source 要求的回归覆盖仍缺失时新增测试。
- 纯文档、说明性元数据、文件镜像或搬移、仅同步生成产物，以及经 source 明确确认不改变可执行行为的配置整理不要求 RED，但必须运行能证明结果正确的针对性验证。
- 生产行为变更无法建立可靠自动化 RED 时停止并请求用户确认替代验证；不得自行把测试先行降级为事后测试。

### RED

1. 在修改生产代码前写一个聚焦于可观察行为的最小测试，或使用 approved-fix 的原始 repro。
2. 运行实际测试命令并确认它失败而不是报错；失败信息必须符合预期，原因必须是功能缺失或已证实根因，而不是语法、fixture 或环境错误。
3. 测试意外通过、错误原因不符或无法解释失败时，先修正测试、repro 或假设，不进入实现。

### GREEN

1. 只写让 RED 通过所需的最小生产改动，不夹带未要求功能或无关重构。
2. 重跑同一命令并确认通过；失败时修实现，不通过削弱测试来迁就当前代码。若测试暴露 source 或根因假设错误，按停止条件退回用户或 debug。

### REFACTOR 与回归

1. 只在 GREEN 后消除重复、改进命名或提取 helper，不添加新行为。
2. 重跑聚焦测试保持 GREEN，再运行 source 指定的原始 repro、相关测试和必要回归。
3. 在 Todo、plan checkbox、checkpoint 或最终验收证据中记录 RED 与 GREEN 的实际命令、关键结果和相关回归结果。

测试应验证真实行为而不是 mock 本身。新增或修改 mock、test double，或考虑给生产代码添加测试专用 API 时，先阅读 [测试反模式](references/testing-anti-patterns.md)。

## 阶段 3：执行

1. `wiki_target` 不是 `none` 时先调用 `wiki`，只同步该目标；为 `none` 时跳过。
2. 把 plan 或 `source` 转成 Todo；只允许一个任务处于 `in_progress`。
3. 每个任务开始前读取相关文件和测试，确认计划仍匹配当前代码。
4. 对适用任务执行上面的测试先行契约；不适用时记录原因并执行针对性验证。不能先改生产行为再补测试。
5. 按任务执行命令，读取实际输出和 exit code。失败时先判断是预期 RED、实现问题、环境问题还是计划错误。
6. 持久化 plan 存在 checkbox 时，完成一个步骤就更新对应 checkbox；不要等到最后一次性勾完。
7. 一个独立工作单元验证通过后，调用 `git-workflow` 的 `checkpoint` 阶段。只 stage prepare 后确认属于本任务的文件，不使用会夹带无关修改的命令。
8. 执行中发现计划需要调整时，先记录原因，再更新 plan 或 Todo。精确文件、局部实现结构和任务顺序的调整无需二次确认；如果调整改变需求边界、技术决策、验收或引入新的实质风险，先向用户确认。

## 停止条件

出现以下情况时停止猜测，保留证据并汇报：

- 输入契约互相冲突，或验收标准无法同时满足。
- 当前代码事实推翻了计划的关键假设。
- 测试或构建持续失败，且失败原因不再是预期 RED。
- 需要破坏性 Git 操作、删除用户修改、强推、丢弃未提交文件或扩大 scope。
- 依赖外部服务、权限、密钥或用户决策，且无法用本地替代验证推进。

## 阶段 4：完成

1. 确认 Plan/Todo 必须覆盖 `source`，实施结果没有违反其中的硬约束或修复边界。
2. 回顾实施过程：如果产生了已确认 wiki 目标范围内的新知识（实施中沉淀的决策背景、约定修订、架构事实），调用 `wiki` 补充同步；只写入用户已确认的目标，要新增目标文件先向用户确认。
3. 执行 `source` 要求的验证，并为每项验收记录结果与证据；生产行为变更还必须保留 RED、GREEN 和相关回归的实际证据。存在必需验收或验证失败、未执行时，不得以 `complete` 结束。
4. 检查 `git status -sb` 和实际 diff，区分任务修改与 prepare 前已有修改。
5. 调用 `git-workflow` 的 `finalize` 阶段，传入 `complete`、`blocked`、`verification_failed` 或 `awaiting_review` 中的真实结果。
6. finalize 返回前，不得把持久化修改任务报告为完成。

完成报告必须包含：变更摘要、逐项验收结果与验证证据、剩余风险、branch/worktree、相关 commit hash + subject、push 远端分支、PR/merge/cleanup 状态，以及每个未执行 Git 动作的原因。

## 兼容边界

- `debug`：负责复现、根因和用户批准；批准后把 `approved-fix` 交给本 skill，不再自行实施。
