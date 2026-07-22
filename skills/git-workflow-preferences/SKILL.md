---
name: git-workflow-preferences
description: 通过 docs/user-preferences.md 获取并维护用户的 Git 工作流行为；配置不存在时创建，行为不明确时逐项询问并回写。
---

# git-workflow-preferences

1. 读取当前 workspace 的 `docs/user-preferences.md`。
2. 文件不存在时立即创建；只记录已知偏好，未知行为写为 `待确认`，不要预先询问所有 Git 配置。
3. 从文件中获取当前任务需要的 Git 行为，包括 branch、基线、worktree、更新方式、commit、push、PR、merge 和清理。
4. 当所需行为缺失、含糊、冲突或为 `待确认` 时询问用户；不要询问与当前任务无关的字段，也不要重复询问已明确的偏好。
5. 有多个待确认行为时，先列出本次准备询问的问题供用户删减，然后一次只问一个。每得到一个回答，立即写回对应字段并更新“最后更新”日期，再处理下一个。
6. 用户表示某项永久不适用时写为 `不适用`；仅本次不需要时保留 `待确认`。
7. 当次用户指令优先于配置。若用户希望长期采用本次选择，将其写回配置。
8. 删除 branch/worktree、丢弃改动、force push 等破坏性操作仍需针对本次动作明确确认。

新建文件时使用最小结构，并按实际需要增加字段：

```markdown
> 摘要：记录本项目的 Git 工作流偏好。

# User Preferences

## Git

- 最后更新：YYYY-MM-DD
```
