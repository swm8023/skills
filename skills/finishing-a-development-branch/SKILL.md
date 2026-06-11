---
name: finishing-a-development-branch
description: 当实现已完成、所有测试通过、并且你需要决定如何整合工作成果时使用 —— 通过呈现 merge、PR 或清理的结构化选项来引导开发工作的收尾
---

# 完成一个开发分支

## 概览

通过呈现清晰的选项并处理所选 workflow，引导开发工作的收尾。

**核心原则：** 验证测试 → 检测环境 → 呈现选项 → 执行选择 → 清理。

**开始时声明：** "I'm using the finishing-a-development-branch skill to complete this work."

## 流程

### 第 1 步：验证测试

**在呈现选项之前，先验证测试通过：**

```bash
# 运行项目的测试套件
npm test / cargo test / pytest / go test ./...
```

**如果测试失败：**
```
Tests failing (<N> failures). Must fix before completing:

[Show failures]

Cannot proceed with merge/PR until tests pass.
```

停止。不要进入第 2 步。

**如果测试通过：** 继续进入第 2 步。

### 第 2 步：检测环境

**在呈现选项之前确定 workspace 的状态：**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

这决定要展示哪个菜单以及清理如何工作：

| 状态 | 菜单 | 清理 |
|-------|------|---------|
| `GIT_DIR == GIT_COMMON`（普通 repo） | 标准 4 个选项 | 无 worktree 需要清理 |
| `GIT_DIR != GIT_COMMON`，命名 branch | 标准 4 个选项 | 基于来源（见第 6 步） |
| `GIT_DIR != GIT_COMMON`，detached HEAD | 精简的 3 个选项（无 merge） | 不清理（外部管理） |

### 第 3 步：确定 base branch

```bash
# 尝试常见的 base branch
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

或者询问： "This branch split from main - is that correct?"

### 第 4 步：呈现选项

**普通 repo 和命名 branch 的 worktree —— 完全按以下 4 个选项呈现：**

```
Implementation complete. What would you like to do?

1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
4. Discard this work

Which option?
```

**Detached HEAD —— 完全按以下 3 个选项呈现：**

```
Implementation complete. You're on a detached HEAD (externally managed workspace).

1. Push as new branch and create a Pull Request
2. Keep as-is (I'll handle it later)
3. Discard this work

Which option?
```

**不要添加解释** —— 保持选项简洁。

### 第 5 步：执行选择

#### 选项 1：本地 merge

```bash
# 获取主 repo 根目录以保证 CWD 安全
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"

# 先 merge —— 在删除任何东西之前确认成功
git checkout <base-branch>
git pull
git merge <feature-branch>

# 在 merge 后的结果上验证测试
<test command>

# 只有在 merge 成功后：清理 worktree（第 6 步），然后删除 branch
```

随后：清理 worktree（第 6 步），然后删除 branch：

```bash
git branch -d <feature-branch>
```

#### 选项 2：Push 并创建 PR

```bash
# Push branch
git push -u origin <feature-branch>

# 创建 PR
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<2-3 bullets of what changed>

## Test Plan
- [ ] <verification steps>
EOF
)"
```

**不要清理 worktree** —— 用户需要它保持存在以便对 PR 反馈进行迭代。

#### 选项 3：保持原样

报告： "Keeping branch <name>. Worktree preserved at <path>."

**不要清理 worktree。**

#### 选项 4：丢弃

**先确认：**
```
This will permanently delete:
- Branch <name>
- All commits: <commit-list>
- Worktree at <path>

Type 'discard' to confirm.
```

等待精确的确认。

如果已确认：
```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
```

随后：清理 worktree（第 6 步），然后强制删除 branch：
```bash
git branch -D <feature-branch>
```

### 第 6 步：清理 workspace

**仅在选项 1 和 4 时运行。** 选项 2 和 3 始终保留 worktree。

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

**如果 `GIT_DIR == GIT_COMMON`：** 普通 repo，没有 worktree 需要清理。完成。

**如果 worktree 路径位于 `.worktrees/`、`worktrees/` 或 `~/.config/superpowers/worktrees/` 之下：** Superpowers 创建了这个 worktree —— 由我们负责清理。

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
git worktree remove "$WORKTREE_PATH"
git worktree prune  # 自我修复：清理任何陈旧的注册项
```

**否则：** 宿主环境（harness）拥有这个 workspace。不要删除它。如果你的平台提供了 workspace 退出工具，请使用它。否则，原样保留 workspace。

## 速查表

| 选项 | Merge | Push | 保留 Worktree | 清理 Branch |
|--------|-------|------|---------------|----------------|
| 1. 本地 merge | yes | - | - | yes |
| 2. 创建 PR | - | yes | yes | - |
| 3. 保持原样 | - | - | yes | - |
| 4. 丢弃 | - | - | - | yes (force) |

## 常见错误

**跳过测试验证**
- **问题：** merge 了有问题的代码，创建了失败的 PR
- **修复：** 在提供选项之前始终验证测试

**开放式问题**
- **问题：** "What should I do next?" 含糊不清
- **修复：** 完全按 4 个结构化选项呈现（detached HEAD 时为 3 个）

**对选项 2 清理 worktree**
- **问题：** 删除了用户在 PR 迭代时需要的 worktree
- **修复：** 仅在选项 1 和 4 时清理

**在删除 worktree 之前删除 branch**
- **问题：** `git branch -d` 失败，因为 worktree 仍然引用着该 branch
- **修复：** 先 merge，再删除 worktree，然后删除 branch

**在 worktree 内部运行 git worktree remove**
- **问题：** 当 CWD 位于正在被删除的 worktree 内部时，命令会静默失败
- **修复：** 在 `git worktree remove` 之前始终 `cd` 到主 repo 根目录

**清理 harness 拥有的 worktree**
- **问题：** 删除 harness 创建的 worktree 会导致幻影状态
- **修复：** 仅清理位于 `.worktrees/`、`worktrees/` 或 `~/.config/superpowers/worktrees/` 之下的 worktree

**丢弃时没有确认**
- **问题：** 意外删除了工作成果
- **修复：** 要求输入 "discard" 进行确认

## 红线

**绝不要：**
- 在测试失败的情况下继续推进
- 在没有验证 merge 结果上的测试时就 merge
- 在没有确认的情况下删除工作成果
- 在没有明确请求的情况下 force-push
- 在确认 merge 成功之前就删除 worktree
- 清理不是你创建的 worktree（来源检查）
- 在 worktree 内部运行 `git worktree remove`

**始终：**
- 在提供选项之前验证测试
- 在呈现菜单之前检测环境
- 完全按 4 个选项呈现（detached HEAD 时为 3 个）
- 对选项 4 获取输入式确认
- 仅对选项 1 和 4 清理 worktree
- 在删除 worktree 之前 `cd` 到主 repo 根目录
- 在删除后运行 `git worktree prune`
