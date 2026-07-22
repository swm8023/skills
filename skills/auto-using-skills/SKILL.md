---
name: auto-using-skills
description: Use when starting any conversation or task so the agent selects the right skill before acting. Routes bug reports to debug and unclear feature/change requests to scope.
---

<SUBAGENT-STOP>
如果你是作为 subagent 被派遣来执行某个特定任务，请跳过这个 skill。
</SUBAGENT-STOP>

# auto-using-skills

## 核心规则

在任何回复、澄清、读文件、写代码或运行命令之前，先检查 skill。只要某个 skill 有 1% 的可能适用，就必须调用 Skill 工具读取它。

用户指令始终最高优先级；skill 决定的是**怎么做**，不覆盖用户明确说的**做什么**。如果调用后发现某个 skill 不适用，说明原因并继续检查其他 skill。

## 路由

按顺序判断：

1. **用户点名 skill**：先调用被点名的 skill。
2. **bug / failure**：用户说坏了、报错、测试失败、build 失败、flaky、变慢、性能退化或行为不符合预期，调用 `debug`。不要先走 `scope`。
3. **项目知识 / wiki**：用户要沉淀、查找、整理或迁移项目长期知识，维护 `docs/wiki`，调用 `wiki`。
4. **未定需求**：用户要加 feature、设计行为、改交互、新建系统、重构、规划或 review，且范围还没钉清，调用 `scope`。
5. **Git 工作流**：涉及文件写入、branch/worktree、commit、push、merge 或清理时，参考 `git-workflow-preferences`；需求澄清、bug 诊断和写 plan 阶段不要因此打断。
6. **即将写生产代码**：如果下一步会实现新行为、重构或改现有行为，先调用 `test-driven-development`。bug 修复只有在 `debug` 已提交根因和修复方案并获得用户明确确认后，才进入 `test-driven-development`。
7. **其他匹配 skill**：任何 skill 的 description 命中当前任务，就调用它。

## 调用后

调用 skill 后：

1. 告诉用户：`Using [skill] to [purpose]`。
2. 如果 skill 有 checklist，把每项登记为 todo。
3. 严格按 skill 内容执行，再回复用户。

## 警示信号

出现这些想法时，停下来重新检查 skill：

- "先问个澄清问题再说"：澄清前也要检查 skill。
- "先看文件 / 跑命令"：行动前也要检查 skill。
- "这很简单"：简单任务也可能有适用 skill。
- "我记得这个 skill"：读取当前版本，不凭记忆执行。
- "用户说了修 bug，所以直接修"：用户说的是目标，不是允许跳过 debug。
- "已经 scoped / debug 过了，可以直接写代码"：写生产代码前仍要检查 TDD。
