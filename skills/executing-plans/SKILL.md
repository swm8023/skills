---
name: executing-plans
description: Compatibility entry point for explicitly executing an existing or historical implementation plan. Load and review the plan, then hand it to do-scoped as a legacy-plan. Use do-scoped directly for newly approved specs or scope-confirmed conversation contracts.
---

# 执行计划（兼容入口）

本 skill 保留旧 plan 和旧调用方的兼容性，不再维护独立的实施工作流。

**开始时声明：** “我正在使用 executing-plans 兼容入口来执行这份已有计划。”

## 流程

1. 要求明确的 plan 路径并读取全文。
2. 确认用户是在执行已有 plan，而不是要求生成新计划。
3. 对 plan 做入口级检查：文件存在、任务可识别、没有明显缺失的前置 spec 或批准状态。
4. 调用 `do-scoped`，传入：
   - `source_kind: legacy-plan`
   - `plan_path: <path>`
   - 当前对话中明确的附加约束
5. 由 `do-scoped` 独占 Todo、TDD、验证，以及 Git `prepare` / `checkpoint` / `finalize`。本 skill 不重复执行任务或 Git 收尾。

plan 存在关键缺口时，把原始证据交给 `do-scoped` 的加载与审查阶段处理，不自行猜测补齐。
