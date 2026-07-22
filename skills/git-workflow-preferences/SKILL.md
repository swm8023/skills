---
name: git-workflow-preferences
description: 通过 docs/user-preferences.md 获取并维护用户的 Git 工作流行为；配置不存在时创建，行为不明确时逐项询问并回写。
---

# git-workflow-preferences

读取当前 workspace 的 `docs/user-preferences.md`，按其中配置决定 Git 行为。文件不存在时按下方模板创建；当前任务需要的行为缺失、含糊或为 `待确认` 时询问用户。当次用户指令优先于配置。

## 核心问题

只从以下问题中选择当前任务需要且尚未明确的项：

1. 基础分支是什么？
2. 何时创建 branch/worktree？创建时两者是否绑定；worktree 放在哪里、如何命名？
3. 是否自动 commit？
4. 是否自动合回主干？
5. 何时 push？
6. push 后是否保留 branch/worktree？

有多个问题时，先展示本次问题清单供用户删减，再一次只问一个。不要询问与当前任务无关的字段，也不要重复询问已有答案。

## 问题与配置字段

| 问题 | 更新字段 |
| --- | --- |
| 基础分支 | `基线分支` |
| 创建 branch/worktree | `创建 branch/worktree 的场景`、`branch 与 worktree 是否绑定`、`worktree 位置与命名` |
| 自动 commit | `是否自动 commit` |
| 合回主干 | `是否自动合并主干` |
| push 时机 | `push 时机` |
| push 后保留资源 | `push 后是否保留 branch`、`push 后是否保留 worktree` |

## 回写配置

1. 每得到一个回答，立即更新对应字段和“最后更新”日期，再询问下一个问题。
2. 回答只覆盖部分字段时，写入已确认内容，其余保留 `待确认`。
3. 用户表示某项永久不适用时写为 `不适用`；仅本次不需要时不修改该字段。
4. 用户明确长期采用当次指令时，将其写回对应字段。
5. 保留配置文件中与本次问题无关的内容和原有结构。
6. 删除 branch/worktree、丢弃改动、force push 等破坏性操作仍需针对本次动作明确确认。

## 配置模板

```markdown
> 摘要：记录本项目中用户的 Git 工作流偏好。

# User Preferences

## Git

- 基线分支：待确认
- 创建 branch/worktree 的场景：待确认
- branch 与 worktree 是否绑定：待确认
- worktree 位置与命名：待确认
- 是否自动 commit：待确认
- 是否自动合并主干：待确认
- push 时机：待确认
- push 后是否保留 branch：待确认
- push 后是否保留 worktree：待确认
- 最后更新：YYYY-MM-DD
```
