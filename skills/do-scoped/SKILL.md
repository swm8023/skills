---
name: do-scoped
description: Implement already-scoped product or code work end to end after the user has approved a spec or confirmed scope's in-conversation implementation contract. Also accepts an existing plan only through the executing-plans compatibility entry point. Create persisted plans only for spec-backed work, then execute, verify, and complete the configured Git workflow. Do not use while requirements are still unclear or while a spec is awaiting approval.
---

# 执行已确认范围

## 概览

把已确认的实施契约一次完成：审查输入、形成可执行计划、实现、验证，并按项目 Git 偏好收尾。本 skill 内置原 `writing-plans` 与 `executing-plans` 的核心职责；计划不是单独出口，除非用户明确只要计划。

**开始时声明：** “I'm using the do-scoped skill to plan and implement this scoped work.”

## 输入关口

只接受以下一种输入，并记录来源类型：

1. **approved-spec**：用户已批准的 `docs/scope/<YYYY-MM-DD>-<slug>.md`。
2. **confirmed-conversation**：`scope` 已在当前对话中整理并获得用户确认的实施契约。
3. **legacy-plan**：由 `executing-plans` 兼容入口传入的现有 plan 路径。

如果需求仍未明确、spec 尚未批准，返回 `scope`。如果只有零散要求而没有明确确认记录，不得自行认定为 `confirmed-conversation`。

## 阶段 1：加载与审查

1. 读取 approved-spec 或 legacy-plan；confirmed-conversation 则复述已确认的目标、范围、验收标准、测试要求和排除项。
2. 检查输入是否完整、一致、可由一个实施流程完成。多个独立子系统应拆成多个 spec 或多个 plan，每个 plan 都必须能产出可工作、可测试的软件。
3. 先规划文件结构：哪些文件会创建或修改、每个文件负责什么、边界和接口在哪里。遵循既有代码模式；只在被修改文件已经难以维护时，把拆分纳入计划。
4. 有实质歧义、缺失决定、危险动作、计划过时或仓库事实冲突时，在写入前提出并等待用户决定；不要用实现细节替用户补产品决策。
5. 如果会持久化修改，调用 `git-workflow-preferences` 的 `prepare` 阶段。即使 scope 或兼容入口提供过 Git 上下文，也要核对 branch、worktree、远端和任务开始前已有修改，建立本次执行的文件所有权。prepare 必须在写 plan、wiki、测试或代码前完成。

## 阶段 2：形成执行计划

### approved-spec

根据 spec 编写详细计划并保存：

- spec：`docs/scope/<YYYY-MM-DD>-<slug>.md`
- plan 目录：`docs/plans/<YYYY-MM-DD>-<slug>/`
- 默认 plan：`docs/plans/<YYYY-MM-DD>-<slug>/plan-<slug>.md`
- 一个 spec 需要多个计划时，都放在同一目录并使用有意义的 `plan-<part>.md` 名称。
- 目录中已有 plan 时先读取；同一实施可更新复用，独立实施新建文件，不得盲目覆盖或删除其他计划。

保存后对照 spec 自审并修正。计划验证通过后，调用 `git-workflow-preferences` 的 `checkpoint` 阶段，只处理该 plan 和同一工作单元明确拥有的文档。

### confirmed-conversation

使用对话 Todo 记录任务、关键步骤和验证，不创建 `docs/scope/`、`docs/plans/` 或其他计划文档。快速检查范围、验收、风险和测试后直接执行。

### legacy-plan

读取现有 plan 全文，沿用其结构，不复制、不迁移、不生成替代计划。把未完成任务转成当前 Todo；若 plan 缺少目标、文件、测试、Git 行为或与当前仓库冲突，先在阶段 1 处理，不静默补齐。

## 计划质量标准

计划面向“熟练但对本代码库零上下文”的执行者：写明每个任务涉及的文件、关键代码、测试、文档和验证。DRY。YAGNI。TDD。按 Git 偏好设置 checkpoint。

### 计划头部

每个持久化 plan 必须以此头部开始：

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SKILL: Use do-scoped to execute this plan task-by-task. Invoke git-workflow-preferences through prepare/checkpoint/finalize. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds]

**Scope Source:** [Approved spec path or source note]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

**Verification:** [Primary commands or checks]

---
```

### 任务粒度

把任务拆成 2-5 分钟可执行动作。每个任务应是自包含变更，单独看也合理；一起变化的文件放在同一任务里。

````markdown
### Task N: [Component or Behavior]

**Files:**
- Create: `exact/path/to/file.ext`
- Modify: `exact/path/to/existing.ext`
- Test: `tests/exact/path/to/test.ext`

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

After verification passes, invoke `git-workflow-preferences` in `checkpoint` mode for this task's files. Record commit hash + subject, or the reason the checkpoint was skipped.
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

1. **覆盖度**：每个需求、验收标准和排除项都能指向对应任务。
2. **占位符**：搜索并消除上文禁止项。
3. **一致性**：类型、函数名、路径、命令和测试名称前后一致。
4. **顺序**：先测试再实现；共享基础设施先于依赖它的任务；每个 checkpoint 前都有验证信号。
5. **边界**：计划只包含本 scope 文件，不夹带无关重构。

发现问题就地修复，再进入执行。

## 阶段 3：执行

1. 如果 scope 传入了已确认的 wiki 目标，先调用 `wiki`，只同步该目标；用户已确认“不更新 wiki”时跳过。
2. 把 plan 或对话契约转成 Todo；只允许一个任务处于 `in_progress`。
3. 每个任务开始前读取相关文件和测试，确认计划仍匹配当前代码。
4. 写生产代码、重构或改变现有行为前调用 `test-driven-development`：先 RED，再最小 GREEN，再必要重构。不能先改实现再补测试。
5. 按任务执行命令，读取实际输出和 exit code。失败时先判断是预期 RED、实现问题、环境问题还是计划错误。
6. 持久化 plan 存在 checkbox 时，完成一个步骤就更新对应 checkbox；不要等到最后一次性勾完。
7. 一个独立工作单元验证通过后，调用 `git-workflow-preferences` 的 `checkpoint` 阶段。只 stage prepare 后确认属于本任务的文件，不使用会夹带无关修改的命令。
8. 执行中发现计划需要调整时，先记录原因，再更新 plan 或 Todo；如果调整改变目标、验收或风险，先向用户确认。

## 停止条件

出现以下情况时停止猜测，保留证据并汇报：

- 输入契约互相冲突，或验收标准无法同时满足。
- 当前代码事实推翻了计划的关键假设。
- 测试或构建持续失败，且失败原因不再是预期 RED。
- 需要破坏性 Git 操作、删除用户修改、强推、丢弃未提交文件或扩大 scope。
- 依赖外部服务、权限、密钥或用户决策，且无法用本地替代验证推进。

## 阶段 4：完成

1. 对照输入契约、plan/Todo 和 wiki 目标逐项确认没有漏项。
2. 运行能证明完成状态的最终验证；无法运行时说明原因和替代证据。
3. 检查 `git status -sb` 和实际 diff，区分任务修改与 prepare 前已有修改。
4. 调用 `git-workflow-preferences` 的 `finalize` 阶段，传入 `complete`、`blocked`、`verification_failed` 或 `awaiting_review` 中的真实结果。
5. finalize 返回前，不得把持久化修改任务报告为完成。

完成报告必须包含：变更摘要、验证结果、剩余风险、branch/worktree、相关 commit hash + subject、push 远端分支、PR/merge/cleanup 状态，以及每个未执行 Git 动作的原因。

## 兼容边界

- `writing-plans`：仅用于用户明确要求“只写计划、不执行”的场景。
- `executing-plans`：仅用于显式执行已有或历史 plan；它把 plan 作为 `legacy-plan` 转交本 skill。
- 新的 scope 主链路不再依次调用 `writing-plans` 和 `executing-plans`。
