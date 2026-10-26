---
name: executing-plans
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints
---

# 执行计划

## 概述

加载 plan，批判性地审查，执行所有任务，完成后报告。

**开始时声明：** "I'm using the executing-plans skill to implement this plan."

**注意：** 告诉你的人类伙伴，Superpowers 在能够访问 subagent 时表现要好得多。如果运行在支持 subagent 的平台上（比如 Claude Code 或 Codex），其工作质量会显著更高。如果 subagent 可用，请使用 superpowers:subagent-driven-development 而不是本 skill。

## 流程

### 第 1 步：加载并审查 plan
1. 读取 plan 文件
2. 批判性地审查 —— 识别对该 plan 的任何疑问或顾虑
3. 如果存在顾虑：在开始之前与你的人类伙伴提出
4. 如果没有顾虑：创建 TodoWrite 并继续

### 第 2 步：执行任务

对每个任务：
1. 标记为 in_progress
2. 严格按每一步执行（plan 中的步骤是细化拆分的）
3. 按指定方式运行 verifications
4. 标记为 completed

### 第 3 步：完成开发

在所有任务完成并验证之后：
- 声明："I'm using the finishing-a-development-branch skill to complete this work."
- **必需的子 skill：** 使用 superpowers:finishing-a-development-branch
- 按该 skill 执行：验证测试、给出选项、执行所选方案

## 何时停下并寻求帮助

**遇到以下情况立即停止执行：**
- 撞上 blocker（缺少依赖、测试失败、指令不清晰）
- plan 存在关键缺口，导致无法开始
- 你看不懂某条指令
- verification 反复失败

**应当寻求澄清，而不是凭猜测继续。**

## 何时回到更早的步骤

**回到审查阶段（第 1 步）的时机：**
- 伙伴根据你的反馈更新了 plan
- 根本性的方案需要重新思考

**不要强行突破 blocker** —— 停下并询问。

## 牢记
- 先批判性地审查 plan
- 严格按 plan 的步骤执行
- 不要跳过 verifications
- 当 plan 要求时引用对应的 skills
- 被 block 时停下，不要猜测
- 在未获得用户明确同意前，绝不在 main/master branch 上开始实现

## 集成

**必需的工作流 skills：**
- **superpowers:using-git-worktrees** —— 确保隔离的工作空间（创建一个或确认已存在）
- **superpowers:writing-plans** —— 创建本 skill 要执行的 plan
- **superpowers:finishing-a-development-branch** —— 在所有任务完成后收尾开发
