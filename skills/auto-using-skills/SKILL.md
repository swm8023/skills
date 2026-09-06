---
name: auto-using-skills
description: Select skills that materially match the current task. Route bugs to debug and unresolved changes to scope, reuse existing authorization, and respect explicit-only invocation policies.
---

<SUBAGENT-STOP>
如果你是作为 subagent 被派遣来执行某个特定任务，请跳过这个 skill。
</SUBAGENT-STOP>

# auto-using-skills

## 核心规则

在任务开始或目标实质变化时，依据用户意图和 skill 的实际能力选择一个主流程；只有辅助 skill 能改变当前决策或完成必要操作时才加载。不要仅因关键词重叠、description 相似或很小的适用可能就调用。

遵循宿主指令层级和适用的仓库约定；skill 不覆盖用户明确的目标、范围和授权。读取适用 skill 时使用当前环境提供的 Skill 工具或文件／资源读取工具；本任务已经读过且未变化的版本直接复用，不把工具名称或重复读取变成前置关口。

已有授权随当前任务和 skill 转交继承。用户明确要求修复时，debug 查证根因后可在已授权边界内交给 implement；用户明确要求执行指定 spec 时，不因状态行缺失而重问批准。只要求分析、审阅或等待确认时不实施；新的实质决策或超出已有授权的动作才需要询问。正常进入 scope 后仍保留其设计确认、出口选择和契约批准流程，不将一般实施意愿当成所有未决选择的答案。

## 路由

按顺序判断：

1. **用户点名 skill**：先调用被点名的 skill。
2. **仅限手动触发**：遵守 skill 的显式限制，包括 `disable-model-invocation: true`、`agents/openai.yaml` 中的 `allow_implicit_invocation: false` 或仅限手动触发的说明。`$skill-name`、`/skill-name` 或明确要求使用该 skill 才算点名；普通的“review”“审查”“audit”不等于点名 `review-spec` 或 `review-code`。参考目录中的上游材料不作为独立 skill 路由。
3. **执行已确认范围或修复**：用户已批准或明确要求执行指定 spec、scope 已取得对话内实施契约确认，或 debug 已形成有根因证据且修复边界获授权的契约时，调用 `implement`。bug 使用 `source_kind: approved-fix`；此项优先于通用 bug 路由，即使确认消息再次提到“bug”“失败”或“修复”。
4. **新的 bug / failure**：用户报告坏了、报错、测试失败、build 失败、flaky、变慢、性能退化或行为不符合预期，且尚无证据充分的修复契约时，调用 `debug`。先调查而不是先走 `scope`；调查完成后是否实施由已有授权决定。
5. **项目知识 / wiki**：维护仓库 `docs/wiki` 时调用 `wiki`；固定 WheelMaker Vault 的检索用 `pubwiki-search`，写入和发布用 `pubwiki-markdown`。按用户目标和已有路径确定知识库，不同时启动两套写入流程。
6. **未定需求**：用户要加 feature、设计行为、改交互、新建系统、重构、规划或 review，且范围还没钉清，调用 `scope`。
7. **Git 工作流**：普通仓库修改由 `git-workflow` 独占生命周期：首次写入前 `prepare`，已验证的独立工作单元按需 `checkpoint`，生命周期结束或外部 handoff 前 `finalize`。转交时继承 `git_state: prepared`，只有 `unprepared` 才执行 prepare。纯只读调查、对话讨论、不落盘计划和仓库外私有搜索索引不启动 Git 生命周期。用户点名的 `git-check` 按其已授权清单独立负责对应 Git 操作；PubWiki 数据仓库由专用 helper 负责，不再叠加通用 prepare/checkpoint/finalize。调用时写明阶段或所有者，不能只说“参考 Git 偏好”。
8. **即将写生产代码**：统一由 `implement` 按内置验证契约执行；验证方法与变更相称。bug 必须先由 debug 形成证据充分且在用户授权范围内的 `approved-fix`，不能以授权代替根因调查。
9. **其他匹配 skill**：仅在实际能力与当前任务实质匹配时调用，不绕过第 2 条，也不因阅读到引用就自动执行另一个流程。

## 调用后

调用 skill 后：

1. 告诉用户：`Using [skill] to [purpose]`。
2. 把本任务适用的 checklist 记入当前 Todo；没有专用 Todo 工具时使用简短对话内工作项，不为此安装工具或生成计划文件。
3. 在用户授权范围内执行适用流程，持续报告有意义的进展；不因内部阶段或 skill 切换重复请求确认。

## 警示信号

出现这些想法时，停下来重新检查 skill：

- "关键词命中了，全部 skill 都读一遍"：按实际任务匹配，辅助能力按需加载。
- "已经读过，但每次行动前还得重读"：本任务版本未变化时复用。
- "缺少 Skill / Todo 工具，所以无法继续"：使用环境原生读取工具和对话内工作项。
- "用户说了修 bug，所以直接修"：用户说的是目标，不是允许跳过 debug。
- "已经 scoped / debug 过了，可以直接写代码"：交给 implement 继承授权、接管 Git 并按变更选择验证方式。
- "用户确认了 bug 方案，直接开始修"：先把 `approved-fix` 交给 implement，不在 debug 内实施。
- "开始时已经调用过 Git skill，结束时不用再调"：prepare 不能替代 finalize。
- "写一句未提交就可以结束"：如果偏好要求自动提交或推送，必须完成动作或给出明确 blocker。
