---
name: auto-using-skills
description: Select skills that materially match the current task. Route bugs to debug and unresolved changes to scope, reuse existing authorization, and respect explicit-only invocation policies.
---

# auto-using-skills

被派遣执行特定任务的 subagent 跳过本 skill。

## 选择与授权

- 任务开始或目标实质变化时，按用户意图和实际能力选择一个主流程；辅助 skill 仅在能改变决策或完成必要操作时加载，不因关键词、description 相似或引用自动调用。参考目录的上游材料不作为独立 skill。
- 遵循宿主指令层级与仓库约定，保留用户目标、范围和已有授权；跨阶段、skill 转交不重复确认。仅分析、审阅或等待确认时不实施；新实质决策或越权动作才询问。进入 scope 后仍须完成设计确认、出口选择和契约批准，一般实施意愿不代表未决选择已确认。
- 用环境可用的 Skill／文件／资源工具读取；本任务已读且未变化的版本直接复用。

## 路由

先应用触发限制，再按顺序选择：

- 仅手动触发的 skill（`disable-model-invocation: true`、`agents/openai.yaml` 的 `allow_implicit_invocation: false` 或文字限制）须由用户以 `$skill-name`、`/skill-name` 或明确要求使用来点名。普通“review／审查／audit”不等于点名 `review-spec`／`review-code`。

1. **用户点名** → 先调用指定 skill。
2. **WheelMaker session ID**：继续、总结、交接或未说明导出目的 → `handoff`；仅明确点名 `export-session` 且要求诊断 JSON 时导出，ID 本身不触发导出。
3. **已确认实施**：已批准或明确要求执行指定 spec、scope 对话实施契约已确认、或 debug 已形成有根因证据且边界获授权的修复契约 → `implement`。spec 缺状态行不重问批准；bug 传 `source_kind: approved-fix`，优先于下一条。
4. **新 bug / failure**：错误、测试／构建失败、flaky、性能退化或行为异常，尚无上述修复契约 → `debug`，不先走 scope。明确要求修复即授权边界内的后续实施；查证根因后交给 implement，不在 debug 内改代码。
5. **知识库**：仓库 `docs/wiki` → `wiki`；固定 WheelMaker Vault 检索 → `pubwiki-search`，写入／发布 → `pubwiki-markdown`。按目标和路径选择，不启动两套写入流程。
6. **未定需求**：功能、行为／交互设计、新系统、重构、规划或 review 的范围未定 → `scope`。
7. **其他** → 按实际能力匹配 skill。

生产代码统一交给 `implement`，按其内置契约选择与变更相称的验证。

## Git 生命周期

- 普通仓库修改由 `git-workflow` 独占：首次写入前 `prepare`，独立工作单元验证后按需 `checkpoint`，结束或外部 handoff 前 `finalize`。转交继承 `git_state: prepared`，仅 `unprepared` 才 prepare；调用须明确阶段或所有者。
- 只读、讨论、不落盘计划、仓库外私有搜索索引不启动生命周期。用户点名的 `git-check` 按授权清单独立管理对应操作；PubWiki 数据仓库由专用 helper 管理，不叠加通用 Git 流程。
- 按偏好完成 commit／push，否则报告明确 blocker。

## 执行

- 告知所用 skill 及目的，将适用 checklist 记入 Todo；无专用工具则用简短对话工作项，不为此安装工具或生成计划文件。
- 在授权范围内执行并报告有意义的进展。
