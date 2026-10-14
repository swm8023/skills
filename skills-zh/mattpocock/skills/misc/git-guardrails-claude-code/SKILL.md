---
name: git-guardrails-claude-code
description: 设置 Claude Code hook，在执行前阻止危险 Git 命令（push、reset --hard、clean、branch -D 等）。用户希望防止破坏性 Git 操作、添加安全 hook 或禁止 Claude Code push/reset 时使用。
---

# Setup Git Guardrails

设置 PreToolUse hook，在 Claude 执行前拦截并阻止危险 Git 命令。

## What Gets Blocked

- `git push`（包括 `--force` 在内的所有形式）
- `git reset --hard`
- `git clean -f` / `git clean -fd`
- `git branch -D`
- `git checkout .` / `git restore .`

阻止时，Claude 看到消息，说明它无权访问这些命令。

## Steps

### 1. Ask scope

询问用户：仅用于 **本项目**（`.claude/settings.json`），还是 **全部项目**（`~/.claude/settings.json`）？

### 2. Copy the hook script

随附脚本位于 [scripts/block-dangerous-git.sh](scripts/block-dangerous-git.sh)。

按 scope 复制到目标位置：

- **Project**：`.claude/hooks/block-dangerous-git.sh`
- **Global**：`~/.claude/hooks/block-dangerous-git.sh`

通过 `chmod +x` 设为可执行。

### 3. Add hook to settings

添加到对应 settings 文件：

**Project**（`.claude/settings.json`）：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

**Global**（`~/.claude/settings.json`）：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

settings 已存在时，将 hook 合入现有 `hooks.PreToolUse` 数组，不覆盖其他设置。

### 4. Ask about customization

询问是否需要增删阻止列表模式，据此修改复制后的脚本。

### 5. Verify

运行快速测试：

```bash
echo '{"tool_input":{"command":"git push origin main"}}' | <path-to-script>
```

应以退出码 2 结束，并向 stderr 输出 BLOCKED 消息。
