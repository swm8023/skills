---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# 编写计划

## 概览

撰写全面的实现计划，假设工程师对我们的代码库零上下文，且品味存疑。把他们需要知道的一切都写下来：每个任务要改动哪些文件、代码、测试、可能需要查阅的文档、如何测试。把整个计划以一口大小的任务（bite-sized tasks）形式交给他们。DRY。YAGNI。TDD。频繁 commit。

假设他们是熟练的开发者，但对我们的工具集或问题域几乎一无所知。假设他们对优秀的测试设计也不太熟悉。

**开始时声明：** "I'm using the writing-plans skill to create the implementation plan."

**Context：** 如果在隔离的 worktree 中工作，沿用当前 worktree，不要在写计划阶段切换目录。

**保存计划至：**
- 如果来自 spec：保存到 spec 同目录，文件名为 `plan-<slug>.md`。例如 `docs/scope/YYYY-MM-DD-<slug>/plan-<slug>.md`
- 如果没有 spec：保存到 `docs/plans/YYYY-MM-DD-<slug>-plan.md`
- （用户对计划位置的偏好会覆盖此默认值）

## 范围检查

如果 spec 涵盖多个独立的子系统，那么在 brainstorming 阶段就应该被拆分为子项目 spec。如果没拆，建议把它拆成多个独立的计划——每个子系统一个。每个计划自身应能产出可工作、可测试的软件。

## 文件结构

在定义任务之前，先规划好哪些文件将被创建或修改，以及每个文件各自负责什么。这是分解决策被锁定下来的地方。

- 设计具有清晰边界和良好定义接口的单元。每个文件应当只有一个清晰的职责。
- 你对能一次性纳入 context 的代码推理得最好，并且当文件聚焦时你的编辑也更可靠。优先选择更小、更聚焦的文件，而不是做太多事的大文件。
- 一起变化的文件应当放在一起。按职责拆分，而不是按技术分层拆分。
- 在已有代码库中，遵循既有模式。如果代码库使用大文件，不要单方面重构——但如果你正在修改的某个文件已经变得难以驾驭，把拆分纳入计划也是合理的。

这一结构会指导任务分解。每个任务应当产出独立成立、单独看也合理的自包含变更。

## 一口大小的任务粒度

**每一步是一个动作（2-5 分钟）：**
- "Write the failing test" - 一步
- "Run it to make sure it fails" - 一步
- "Implement the minimal code to make the test pass" - 一步
- "Run the tests and make sure they pass" - 一步
- "Commit" - 一步

## 计划文档头部

**每个计划必须以此头部开始：**

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

---
```

## 任务结构

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

## 不允许占位符

每一步都必须包含工程师所需的实际内容。以下是**计划失败**的标志——绝不要写这些：
- "TBD"、"TODO"、"implement later"、"fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above"（没有实际测试代码）
- "Similar to Task N"（重复代码——工程师可能会乱序阅读任务）
- 只描述要做什么却没展示怎么做的步骤（涉及代码的步骤必须有代码块）
- 引用了在任何任务中都未定义的类型、函数或方法

## 牢记
- 始终给出精确的文件路径
- 每一步都给出完整代码——如果一步会改动代码，就把代码展示出来
- 精确的命令以及预期输出
- DRY、YAGNI、TDD、频繁 commit

## 自我审查

在写完整个计划后，用全新的眼光再看一遍 spec，并对照 spec 检查计划。这是你自己跑的检查清单——不是 subagent 派发。

**1. Spec 覆盖度：** 浏览 spec 的每个章节/需求。你能指向某个实现它的任务吗？列出所有缺口。

**2. 占位符扫描：** 在你的计划里搜索危险信号——上文 "不允许占位符" 章节中列出的任何模式。修掉它们。

**3. 类型一致性：** 你在后续任务里使用的类型、方法签名、属性名，是否与你在更早任务里定义的一致？在 Task 3 里叫 `clearLayers()` 而在 Task 7 里叫 `clearFullLayers()` 的函数就是 bug。

如果发现问题，就地修复。无需重新审查——修完继续往下走。如果发现某个 spec 需求没有对应的任务，补上这个任务。

## 执行交接

在保存计划后，给出执行选项：

**"Plan complete and saved to `<plan-path>`. Execute it with executing-plans when you're ready."**

**REQUIRED SUB-SKILL：** Use executing-plans
- 批量执行，带 review 检查点
- 如果平台提供通用 subagent，可把计划审查或独立研究任务委派出去；执行计划本身仍以 executing-plans 为准。
