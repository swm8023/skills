---
name: git-check
description: 检查并汇报仓库、分支与 worktree 状态，评估合入风险，并在用户确认执行清单后安全提交、合入和清理。
---

# Git Check

分两个回合工作：先只检查并汇报；再按用户明确确认的执行清单改变 Git 状态。初次调用只授权检查，不授权提交、合入、推送、删除或清理。

## 阶段一：检查

### 1. 确定仓库与主干

1. 找到仓库根目录；若当前路径不在 Git 仓库中，停止并汇报。
2. 按以下优先级确定主干：用户指定；仓库说明或 `docs/user/git-preferences.md`；远端默认分支；唯一存在的 `main` 或 `master`。存在歧义时先询问，不猜测。
3. 记录当前 branch、HEAD、upstream、仓库根目录和当前 worktree。明确回答当前是否在主干；detached HEAD 单独标记。
4. 有远端时运行不带 prune 的 fetch 以刷新观察数据。fetch 失败时继续本地检查，但标记远端信息可能过期。不要在检查阶段 pull、rebase 或更新本地 branch。

完成条件：主干来源明确，当前位置和数据新鲜度均已记录。

### 2. 检查所有修改

对每个 worktree 使用 porcelain 状态，并结合以下证据检查：

- staged：`git diff --cached --name-status`、`git diff --cached --stat` 和实际 patch；
- unstaged：`git diff --name-status`、`git diff --stat` 和实际 patch；
- untracked：`git ls-files --others --exclude-standard`，按需读取安全的文本文件；
- conflicts：unmerged entries；
- submodules：提交指针和子模块自身 dirty 状态。

不能只列文件名。逐个文件归类为 staged、unstaged、untracked、conflicted 或 submodule，并用一句话概括实际内容变化；二进制文件只报告类型、大小和路径。不要输出密钥、token、凭据或疑似秘密文件的内容，只报告其路径和风险。

完成条件：明确回答仓库是否 clean；若不 clean，每个 worktree 的每项变化都已归属并概括。

### 3. 清点分支与 worktree

列出所有本地分支，不遗漏未 checkout 的分支。每个分支记录：

- short HEAD、upstream 及 upstream ahead/behind；
- 相对主干的 ahead/behind；
- 是否为主干祖先，即是否严格已合入；
- 非祖先提交是否与主干 patch-equivalent，例如被 squash 或 rebase 后内容等价；
- 关联 worktree、locked/prunable 状态及其 clean 状态。

使用 `git worktree list --porcelain` 清点所有 worktree。路径缺失、detached、同一提交多分支或 branch 被 worktree 占用时明确标记。

完成条件：所有本地分支和 worktree 均在清单中；“已合入”“仅内容等价”“未合入”三种状态不混淆。

### 4. 评估合入与清理风险

对每个未合入分支做无工作区写入的 merge-base、提交/文件差异和 merge-tree 冲突检查；多个分支还要评估建议合入顺序造成的叠加冲突。检查仓库规定的测试、构建、迁移、依赖锁文件、生成物、二进制和敏感配置风险。

风险使用以下等级并给证据：

- **低**：已合入且 worktree clean，或可 fast-forward 且验证明确；
- **中**：无预测冲突，但包含独立提交、广泛改动、patch-equivalent 判断、未知验证或顺序依赖；
- **高**：预测冲突、主干分叉、关键基础设施/迁移/依赖变化、失败验证或跨分支重叠明显；
- **阻塞**：存在未解决冲突、待合入内容只存在于未确认的 dirty worktree、主干不明确，或安全合入所需信息缺失。

风险低不代表正确性已验证。把静态合并风险和功能回归风险分开报告。

完成条件：每个可操作分支都有风险等级、证据、验证缺口和建议策略。

## 汇报与确认闸门

按以下顺序汇报：

1. **结论**：当前是否在主干、是否 clean、是否所有本地分支都已合入；
2. **修改明细**：按 worktree 和 staged/unstaged/untracked/conflicted 分类；
3. **分支表**：upstream、相对主干 ahead/behind、合入状态、worktree；
4. **worktree 表**：路径、branch/HEAD、clean、locked/prunable；
5. **风险**：逐分支风险、整体顺序风险、验证缺口；
6. **拟执行清单**：精确列出提交范围与 commit message、目标主干、合入顺序与策略、验证命令、push 决策、要删除的 worktree/本地分支/远端分支。

随后停止改变 Git 状态并请求一次明确确认。默认不 push、不删除远端分支；只有拟执行清单明确写出且用户确认时才做。用户只说“检查”“继续看看”或最初调用本 skill，不算执行确认。用户修改清单后，重述最终清单并再次确认。

## 阶段二：执行已确认清单

### 1. 重验快照

重新检查所有相关 HEAD、status、upstream 和 worktree。与确认时快照不一致时，不执行旧清单；更新报告并重新确认。

### 2. 提交获批修改

1. 只处理清单中逐项列出的路径；不要使用可能夹带其他修改的全量 stage。
2. 提交前检查实际 staged diff，确认无未批准内容和疑似秘密。
3. 运行清单中的相关验证。验证失败时保留用户修改、不提交，并汇报。
4. 使用已确认的 commit message 提交；记录 commit hash 与 subject。没有获批修改时跳过。

### 3. 合入主干

1. 确保主干 worktree clean，并按确认清单刷新/同步主干；主干分叉或同步冲突时停止。
2. 按确认顺序逐分支合入：能 fast-forward 时使用 `--ff-only`；需要 merge commit 时仅使用清单确认的 `--no-ff` 策略。不要擅自 rebase 或改写历史。
3. 合入前再次确认 source HEAD 未变化。发生冲突时中止本次 merge，安全执行 `git merge --abort`，不自动选择语义不明确的冲突结果。
4. 合入后运行清单中的主干验证。失败时停止清理和 push，保留证据并汇报当前状态。

### 4. 清理与可选 push

仅在分支提交已是主干祖先且主干验证通过后清理：

1. 只删除 clean、已确认的非当前 worktree，不使用强制删除；
2. 只用安全删除移除已合入的本地分支；永不删除主干；
3. 清理已确认的 stale worktree metadata；
4. 仅在清单明确确认时 push 或删除远端分支，并在操作后核对远端 SHA。

任一前置条件不满足时保留对应 branch/worktree，不把“未清理”伪装成成功。

## 不可违反的安全规则

- 不使用 hard reset、force push、强制 branch/worktree 删除、`git clean`、丢弃式 restore/checkout 或自动 stash。
- 不丢弃、覆盖、移动或提交未获用户确认的修改。
- 不把 patch-equivalent 当作严格已合入后直接删除；必须在执行清单中单独说明并确认。
- 不自动解决存在语义选择的冲突。
- 不因一个 worktree clean 就推断其他 worktree clean。
- 不清理仍含 untracked、ignored 或 submodule 修改的 worktree。

## 完成报告

报告实际执行结果，不复述计划：每个新 commit 的 hash 与 subject、每次合入结果、主干最终 HEAD、验证命令与结果、push 目标及远端 SHA、删除或保留的 branch/worktree，以及所有未执行动作的具体原因。最后再次明确主干是否 clean、所有本地分支是否已合入，以及剩余风险。
