---
name: wizard
description: 生成交互式 Bash wizard，引导人完成只有人能做的步骤。用于基础设施配置、凭证或 CI secret 设置、陌生第三方控制台操作、一次性迁移或切换。Agent 能自行完成的步骤不使用。
---

# Wizard

**wizard** 是 Bash 脚本，逐步引导人完成手工操作很繁琐、每次向 AI 重新说明也很繁琐的流程。它打开各 URL，准确说明点击和复制什么，获取值，写入正确位置（`.env`、GitHub secret），每阶段确认，并显示剩余阶段数量。它可能配置第三方服务、运行一次性迁移，或把项目从一种状态移到另一种。

[template.sh](template.sh) 已解决易用体验：逐阶段进度、确认关卡、跨平台 URL 打开（含 WSL）、隐藏 secret 输入、幂等 `.env` upsert、`gh secret`/`gh variable` 写入，以及结束总结。**你的工作只是确定流程范围并编写各阶段。** `STAGES` 标记上方的库在每个 wizard 中完全一致；一致性就是目的，永远不要手工编辑它。

wizard 默认是临时的：为一次执行构建，保存到 scratch 或 `scripts/`，工作完成后删除。只有用户希望保留可重复的设置路径时才 commit。

## Process

### 1. Scope the procedure

明确人必须完成的每个手工步骤和每个需要获取的值。先读仓库，不要毫无背景地提问：

- 设置流程：`.env`、`.env.example`、`.env.*`、`README`、`docker-compose*`、framework 配置和 `.github/workflows/*`（每个 `secrets.*` / `vars.*` 引用都是 wizard 必须产生的值）。
- 迁移或转换：当前状态、目标状态及中间的不可逆动作。

再向用户展示按顺序排列的阶段和每阶段产生的值，确认后用户可以增加、删除或调序。

**完成条件：** 每阶段按顺序命名，对每个捕获值都知道：(a) 人从哪里获得；(b) 写到哪里（`.env`、GitHub secret、两者或不写；有些阶段只有动作）；(c) 是 secret（隐藏输入）还是公开值。

### 2. Map each stage's journey

对每阶段写出人应走的准确路径：打开哪个 URL、在那里做什么、值显示在哪里、填入哪个变量，例如“Dashboard → Developers → API keys → Reveal test key → copy”。不知道当前 UI 或准确命令时，说明并询问用户或查文档，永远不要编造可能不存在的步骤。

**完成条件：** 每阶段都有陌生人也能遵循的具体指令。

### 3. Author the wizard

把 `template.sh` 复制到目标路径。按依赖顺序，每步一个 `stage`，替换示例阶段。使用库 helper：`stage`、`say`/`step`、`open_url`、`ask`/`ask_secret`、`write_env`、`set_secret`/`set_var`、`pause`/`confirm`。将 `TOTAL_STAGES` 设为实际阶段数。

遵循模板标准：先打开 URL 再询问值；任何 secret 使用 `ask_secret`；所有持久化值通过 `write_env`；仅 CI 确实需要的值使用 `set_secret`；任何不可逆动作前使用 `confirm`。每个 `stage` 清屏，只显示当前步骤；每阶段聚焦一项任务，避免人需要的信息滚出屏幕。不要改标记上方的库。

### 4. Verify and hand off

- `bash -n <script>`；如果可用，运行 `shellcheck`。
- `chmod +x <script>`。
- 不要自行端到端运行：它会打开浏览器并等待人工输入。改用静态检查：步骤 1 的每个值都被获取并落到约定位置，每个 `set_secret` 名都与 CI 中 `secrets.*` 引用准确一致。
- 告诉用户如何运行。若是可重复的设置路径，commit 并从 README 链接，让下一个人直接运行脚本，而不是再问 AI。
