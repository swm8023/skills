---
name: do-scoped
description: Implement already-scoped product or code work end to end after the user has approved a spec or confirmed scope's in-conversation implementation contract. Also accepts an existing plan only through the executing-plans compatibility entry point. Create persisted plans only for spec-backed work, then execute, verify, and complete the configured Git workflow. Do not use while requirements are still unclear or while a spec is awaiting approval.
---

# 执行已确认范围

## 概览

把已确认的实施契约一次完成：建立可执行计划、实现、验证，并按项目 Git 偏好提交和推送。规划与执行是本 skill 内部的连续阶段，不在计划生成后默认停下等待第二次调用。

**开始时声明：** “I'm using the do-scoped skill to plan and implement this scoped work.”

## 输入关口

只接受以下一种输入，并记录来源类型：

1. **approved-spec**：用户已批准的 `docs/scope/<YYYY-MM-DD>-<slug>.md`。
2. **confirmed-conversation**：scope 已在当前对话中整理并获得用户确认的实施契约。
3. **legacy-plan**：由 `executing-plans` 兼容入口传入的现有 plan 路径。

如果需求仍未明确、spec 尚未批准，返回 `scope`。如果只有零散要求而没有 scope 的确认记录，不得把它自行认定为 confirmed-conversation。

## 阶段 1：加载与审查

1. 读取 approved-spec 或 legacy-plan；confirmed-conversation 则复述已确认的目标、范围、验收标准和测试要求。
2. 检查输入是否完整、内部一致、可由一个实施流程完成。
3. 有实质歧义、缺失决定或不可执行风险时，在写入前提出；不要用计划细节替用户补产品决策。
4. 如果会持久化修改，调用 `git-workflow-preferences` 的 `prepare` 阶段。即使 scope 或兼容入口提供过 Git 上下文，也要核对 branch、worktree、远端和任务开始前已有修改，建立本次执行的明确所有权。prepare 必须在进入阶段 2 前完成，不得推迟到写 plan、wiki、测试或代码时再补。

## 阶段 2：形成执行计划

### approved-spec

根据 spec 编写详细计划并保存：

- spec：`docs/scope/<YYYY-MM-DD>-<slug>.md`
- plan 目录：`docs/plans/<YYYY-MM-DD>-<slug>/`
- 默认 plan：`docs/plans/<YYYY-MM-DD>-<slug>/plan-<slug>.md`
- 一个 spec 需要多个计划时，都放在同一目录并使用有意义的 `plan-<part>.md` 名称。
- 目录中已有 plan 时先读取并判断是否属于当前实施；同一实施可更新复用，独立实施新建 `plan-<part>.md`，不得盲目覆盖或删除其他计划。

计划必须包含精确文件路径、逐步实现动作、TDD 切入点、验证命令和 Git checkpoint。禁止 `TBD`、`TODO`、泛化的“补错误处理”或没有具体断言的“编写测试”。保存后对照 spec 检查覆盖度、占位符、类型/命名一致性和任务顺序，并就地修复。

计划验证通过后，它是一个可独立提交的工作单元；调用 `git-workflow-preferences` 的 `checkpoint` 阶段，只处理该 plan 和同一工作单元明确拥有的文档。

### confirmed-conversation

使用对话 Todo 记录任务、关键步骤和验证，不创建 `docs/scope/`、`docs/plans/` 或其他计划文档。快速检查范围、验收、风险和测试后直接进入执行。

### legacy-plan

沿用现有 plan，不复制、不迁移、不生成替代计划。把未完成任务转成当前 Todo；若 plan 与当前仓库事实冲突，先提出问题。

## 阶段 3：执行

1. 如果 scope 传入了已确认的 wiki 目标，先调用 `wiki`，只同步该目标；`不更新 wiki` 时跳过。
2. 逐项执行计划或 Todo，同时只允许一个任务处于 in_progress。
3. 写生产代码或改变现有行为前调用 `test-driven-development`，先取得 RED，再做最小 GREEN 和必要重构。
4. 按计划运行验证，读取实际输出和 exit code。
5. 每个独立工作单元验证通过后，调用 `git-workflow-preferences` 的 `checkpoint` 阶段；只 stage 本工作单元拥有的文件，不绕过偏好硬编码 commit/push。
6. 发现关键缺口、语义冲突或反复失败时停止猜测，保留证据并进入真实的未完成收尾。

## 阶段 4：完成

1. 对照输入契约逐项确认没有漏项。
2. 运行能证明完成状态的最终验证。
3. 检查 `git status -sb` 和实际 diff，区分任务修改与 prepare 前已有修改。
4. 调用 `git-workflow-preferences` 的 `finalize` 阶段，传入 `complete`、`blocked`、`verification_failed` 或 `awaiting_review` 中的真实结果。
5. finalize 返回前，不得把持久化修改任务报告为完成。

完成报告必须包含：变更摘要、验证结果、剩余风险、branch/worktree、相关 commit hash + subject、push 远端分支、PR/merge/cleanup 状态，以及每个未执行 Git 动作的原因。

## 兼容边界

- `writing-plans`：仅用于用户明确要求“只写计划、不执行”的场景。
- `executing-plans`：仅用于显式执行已有或历史 plan；它把 plan 作为 legacy-plan 转交本 skill。
- 新的 scope 主链路不再依次调用 `writing-plans` 和 `executing-plans`。
