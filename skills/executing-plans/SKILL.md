---
name: executing-plans
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints
---

# 执行计划

## 概述

加载 plan，批判性地审查，执行所有任务，完成后报告。

**开始时声明：** "I'm using the executing-plans skill to implement this plan."

## 流程

### 第 1 步：加载并审查 plan
1. 读取 plan 文件
2. 批判性地审查 —— 识别对该 plan 的任何疑问或顾虑
3. 如果存在顾虑：在开始之前与你的人类伙伴提出
4. 如果没有顾虑且本次执行会持久化修改仓库，调用 `git-workflow-preferences` 的 `prepare` 阶段；每次执行 plan 都重新建立本任务的 Git 上下文，不沿用含糊的“workspace 已决策”状态
5. 创建 TodoWrite 并继续

### 第 2 步：执行任务

对每个任务：
1. 标记为 in_progress
2. 严格按每一步执行（plan 中的步骤是细化拆分的）
3. 如果某一步会写生产代码或改变现有行为，先调用 `test-driven-development`，确认已有失败测试或按 TDD 补齐 RED 步骤
4. 按指定方式运行 verifications
5. 如果 plan 要求 Git checkpoint，在验证通过后调用 `git-workflow-preferences` 的 `checkpoint` 阶段，不直接绕过偏好执行硬编码的 commit/push
6. 标记为 completed

### 第 3 步：完成开发

在所有任务完成并验证之后：
1. 重新核对用户要求、spec 或 plan，确认没有漏项。
2. 运行能证明完成状态的验证命令，读取输出和 exit code。
3. 检查 `git status -sb` 和实际 diff，确认改动范围。
4. 调用 `git-workflow-preferences` 的 `finalize` 阶段并传入 `complete`；根据用户偏好和当次指令处理 commit、push、PR、merge、删除分支或清理 worktree。
5. finalize 返回后给出完成报告：变更摘要、验证命令和结果、剩余风险，以及 Git 状态。finalize 未完成偏好要求的动作时，不得把任务报告为已完成。

完成报告必须包含：

- 当前分支和 worktree 路径。
- 本次相关提交：commit hash + subject；没有提交就明确写“未提交”。
- 是否已 push；如已 push，写明远端分支。
- 是否创建 PR、是否 merge、是否清理分支或 worktree。
- 未执行的 Git 动作和原因。

## 何时停下并寻求帮助

**遇到以下情况立即停止执行：**
- 撞上 blocker（缺少依赖、测试失败、指令不清晰）
- plan 存在关键缺口，导致无法开始
- 你看不懂某条指令
- verification 反复失败

**应当寻求澄清，而不是凭猜测继续。**

如果 blocker 出现前已经产生持久化修改，在寻求帮助或 handoff 前调用 `git-workflow-preferences` 的 `finalize` 阶段并传入真实的未完成结果。

## 何时回到更早的步骤

**回到审查阶段（第 1 步）的时机：**
- 伙伴根据你的反馈更新了 plan
- 根本性的方案需要重新思考

**不要强行突破 blocker** —— 停下并询问。

## 牢记
- 先批判性地审查 plan
- 严格按 plan 的步骤执行
- 写生产代码前调用 test-driven-development
- 不要跳过 verifications
- 当 plan 要求时引用对应的 skills
- 被 block 时停下，不要猜测
- 执行 plan 是实现入口，开始持久化修改前必须调用 Git `prepare`，验证检查点按 plan 调用 `checkpoint`，交还控制权前必须调用 `finalize`

## 集成

**必需的工作流 skills：**
- **writing-plans** —— 创建本 skill 要执行的 plan
- **git-workflow-preferences** —— 执行 plan 时必须按 `prepare`、`checkpoint`、`finalize` 三阶段调用
