# 可视化伴随指南

基于浏览器的可视化头脑风暴伴随工具，用于展示 mockup、diagram 和选项。

## 何时使用

按问题决定，而非按 session 决定。判断标准：**用户通过看而非读，是否能更好地理解这个内容？**

**使用浏览器**——当内容本身是视觉性的：

- **UI mockup** —— 线框图、布局、导航结构、组件设计
- **Architecture diagram** —— 系统组件、数据流、关系图
- **并排视觉对比** —— 对比两种布局、两种配色方案、两种设计方向
- **设计打磨** —— 当问题关于外观与质感、间距、视觉层级
- **空间关系** —— 状态机、流程图、以图形渲染的实体关系

**使用 terminal**——当内容是文本或表格：

- **需求与范围问题** —— "X 是什么意思？"、"哪些功能在范围内？"
- **概念性的 A/B/C 选择** —— 在用文字描述的方案之间挑选
- **权衡列表** —— 优劣对比、对照表
- **技术决策** —— API 设计、数据建模、架构方案选择
- **澄清性问题** —— 任何答案是文字、而非视觉偏好的内容

一个*关于* UI 主题的问题不会自动变成一个视觉问题。"你想要什么样的 wizard？"是概念性的——使用 terminal。"这些 wizard 布局里你觉得哪个对？"是视觉性的——使用浏览器。

## 工作原理

server 监视一个目录中的 HTML 文件，并把最新的那个提供给浏览器。你把 HTML 内容写入 `screen_dir`，用户在浏览器中看到它，并可以点击选择选项。选择会被记录到 `state_dir/events`，你在下一轮读取。

**内容片段 vs 完整文档：** 如果你的 HTML 文件以 `<!DOCTYPE` 或 `<html>` 开头，server 会原样提供它（仅注入辅助脚本）。否则，server 会自动把你的内容包装到 frame 模板中——添加 header、CSS 主题、选择指示器，以及全部交互基础设施。**默认写内容片段。** 仅当你需要完全控制页面时才写完整文档。

## 启动 session

```bash
# 启动带持久化的 server（mockup 保存在项目里）
scripts/start-server.sh --project-dir /path/to/project

# 返回：{"type":"server-started","port":52341,"url":"http://localhost:52341",
#           "screen_dir":"/path/to/project/.superpowers/brainstorm/12345-1706000000/content",
#           "state_dir":"/path/to/project/.superpowers/brainstorm/12345-1706000000/state"}
```

从响应中保存 `screen_dir` 与 `state_dir`。让用户打开 URL。

**查找连接信息：** server 会把启动 JSON 写入 `$STATE_DIR/server-info`。如果你在后台启动了 server 而没有捕获 stdout，读取该文件以获取 URL 与 port。使用 `--project-dir` 时，请检查 `<project>/.superpowers/brainstorm/` 下的 session 目录。

**注意：** 把项目根目录作为 `--project-dir` 传入，使 mockup 持久化在 `.superpowers/brainstorm/` 中并能在 server 重启后保留。不传它时，文件会进入 `/tmp` 并被清理。如果尚未添加，请提醒用户把 `.superpowers/` 加到 `.gitignore`。

**按平台启动 server：**

**Claude Code（macOS / Linux）：**
```bash
# 默认模式可用——脚本会自行让 server 后台运行
scripts/start-server.sh --project-dir /path/to/project
```

**Claude Code（Windows）：**
```bash
# Windows 自动检测并使用前台模式，这会阻塞 tool 调用。
# 在 Bash tool 调用上设置 run_in_background: true，
# 让 server 在多轮对话间存活。
scripts/start-server.sh --project-dir /path/to/project
```
通过 Bash tool 调用此命令时，设置 `run_in_background: true`。然后下一轮读取 `$STATE_DIR/server-info` 以获取 URL 与 port。

**Codex：**
```bash
# Codex 会回收后台进程。脚本会自动检测 CODEX_CI 并
# 切换到前台模式。正常运行即可——无需额外 flag。
scripts/start-server.sh --project-dir /path/to/project
```

**Gemini CLI：**
```bash
# 使用 --foreground，并在你的 shell tool 调用上设置 is_background: true，
# 以便进程在多轮间存活
scripts/start-server.sh --project-dir /path/to/project --foreground
```

**其他环境：** server 必须在多轮对话间持续在后台运行。如果你的环境会回收 detached 进程，请使用 `--foreground` 并用所在平台的后台执行机制启动该命令。

如果浏览器无法访问该 URL（在远程／容器化环境中常见），可以绑定一个非 loopback 主机：

```bash
scripts/start-server.sh \
  --project-dir /path/to/project \
  --host 0.0.0.0 \
  --url-host localhost
```

使用 `--url-host` 控制返回 URL JSON 中打印的 hostname。

## 主循环

1. **检查 server 是否存活**，然后**写 HTML** 到 `screen_dir` 中的新文件：
   - 每次写入前，检查 `$STATE_DIR/server-info` 是否存在。如果不存在（或 `$STATE_DIR/server-stopped` 存在），表示 server 已关闭——继续之前请用 `start-server.sh` 重启。server 在 30 分钟无活动后会自动退出。
   - 使用语义化文件名：`platform.html`、`visual-style.html`、`layout.html`
   - **绝不复用文件名** —— 每个屏幕都是一个新文件
   - 使用 Write tool —— **绝不使用 cat/heredoc**（会向 terminal 输出噪音）
   - server 自动提供最新的文件

2. **告诉用户预期，然后结束你的回合：**
   - 提醒他们 URL（每一步都提，不只是第一次）
   - 给一段简短的文字摘要说明屏幕上是什么（例如，"展示首页的 3 种布局选项"）
   - 让他们在 terminal 里回复："看一下并告诉我你的想法。如愿意，可以点击选择某个选项。"

3. **下一轮**——在用户在 terminal 中回复之后：
   - 如果 `$STATE_DIR/events` 存在则读取——其中以 JSON 行的形式记录了用户的浏览器交互（点击、选择）
   - 与用户的 terminal 文本合并以获得完整图景
   - terminal 消息是主要反馈；`state_dir/events` 提供结构化的交互数据

4. **迭代或推进** —— 如果反馈改变了当前屏幕，写一个新文件（例如 `layout-v2.html`）。仅在当前步骤验证通过后再进入下一个问题。

5. **回到 terminal 时卸载** —— 当下一步不需要浏览器时（例如澄清性问题、权衡讨论），推送一个等待屏幕以清除过时内容：

   ```html
   <!-- filename: waiting.html (or waiting-2.html, etc.) -->
   <div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
     <p class="subtitle">Continuing in terminal...</p>
   </div>
   ```

   这样可以避免用户在已解决的选择上继续盯着，而对话已经向前推进。下一个视觉问题出现时，照常推送一个新的内容文件。

6. 重复直到完成。

## 编写内容片段

只写进入页面内的内容。server 会自动把它包装进 frame 模板（header、主题 CSS、选择指示器，以及全部交互基础设施）。

**最小示例：**

```html
<h2>Which layout works better?</h2>
<p class="subtitle">Consider readability and visual hierarchy</p>

<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>Single Column</h3>
      <p>Clean, focused reading experience</p>
    </div>
  </div>
  <div class="option" data-choice="b" onclick="toggleSelect(this)">
    <div class="letter">B</div>
    <div class="content">
      <h3>Two Column</h3>
      <p>Sidebar navigation with main content</p>
    </div>
  </div>
</div>
```

就这样。不需要 `<html>`、不需要 CSS、不需要 `<script>` 标签。server 提供这一切。

## 可用的 CSS 类

frame 模板为你的内容提供以下 CSS 类：

### Options（A/B/C 选择）

```html
<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>Title</h3>
      <p>Description</p>
    </div>
  </div>
</div>
```

**多选：** 在容器上加 `data-multiselect`，让用户可以选择多个选项。每次点击切换该项。指示器栏会显示数量。

```html
<div class="options" data-multiselect>
  <!-- same option markup — users can select/deselect multiple -->
</div>
```

### Cards（视觉设计）

```html
<div class="cards">
  <div class="card" data-choice="design1" onclick="toggleSelect(this)">
    <div class="card-image"><!-- mockup content --></div>
    <div class="card-body">
      <h3>Name</h3>
      <p>Description</p>
    </div>
  </div>
</div>
```

### Mockup 容器

```html
<div class="mockup">
  <div class="mockup-header">Preview: Dashboard Layout</div>
  <div class="mockup-body"><!-- your mockup HTML --></div>
</div>
```

### 分屏视图（并排）

```html
<div class="split">
  <div class="mockup"><!-- left --></div>
  <div class="mockup"><!-- right --></div>
</div>
```

### Pros/Cons

```html
<div class="pros-cons">
  <div class="pros"><h4>Pros</h4><ul><li>Benefit</li></ul></div>
  <div class="cons"><h4>Cons</h4><ul><li>Drawback</li></ul></div>
</div>
```

### Mock 元素（线框图构建块）

```html
<div class="mock-nav">Logo | Home | About | Contact</div>
<div style="display: flex;">
  <div class="mock-sidebar">Navigation</div>
  <div class="mock-content">Main content area</div>
</div>
<button class="mock-button">Action Button</button>
<input class="mock-input" placeholder="Input field">
<div class="placeholder">Placeholder area</div>
```

### 排版与分区

- `h2` —— 页面标题
- `h3` —— 区段标题
- `.subtitle` —— 标题下方的次要文本
- `.section` —— 带底部 margin 的内容块
- `.label` —— 小号大写的 label 文本

## 浏览器事件格式

当用户在浏览器中点击选项时，他们的交互会被记录到 `$STATE_DIR/events`（每行一个 JSON 对象）。当你推送新屏幕时，该文件会被自动清空。

```jsonl
{"type":"click","choice":"a","text":"Option A - Simple Layout","timestamp":1706000101}
{"type":"click","choice":"c","text":"Option C - Complex Grid","timestamp":1706000108}
{"type":"click","choice":"b","text":"Option B - Hybrid","timestamp":1706000115}
```

完整事件流展示了用户的探索路径——他们可能在最终决定之前点击多个选项。最后一个 `choice` 事件通常是最终选择，但点击模式可能揭示出值得追问的犹豫或偏好。

如果 `$STATE_DIR/events` 不存在，说明用户没有与浏览器交互——只使用他们的 terminal 文本。

## 设计建议

- **让保真度匹配问题** —— 布局问题用线框图，打磨问题用打磨稿
- **在每页解释问题** —— "哪个布局更专业？"，而不仅仅是 "Pick one"
- **推进前先迭代** —— 如果反馈改变了当前屏幕，写一个新版本
- **每屏最多 2-4 个选项**
- **重要场合使用真实内容** —— 摄影 portfolio 应使用真实图片（Unsplash）。占位内容会掩盖设计问题。
- **保持 mockup 简洁** —— 关注布局与结构，而非像素级完美设计

## 文件命名

- 使用语义化名称：`platform.html`、`visual-style.html`、`layout.html`
- 绝不复用文件名 —— 每个屏幕必须是一个新文件
- 迭代时：追加版本后缀，如 `layout-v2.html`、`layout-v3.html`
- server 按修改时间提供最新文件

## 清理

```bash
scripts/stop-server.sh $SESSION_DIR
```

如果该 session 使用了 `--project-dir`，mockup 文件会持久化在 `.superpowers/brainstorm/` 中以便后续参考。只有 `/tmp` session 会在 stop 时被删除。

## 参考

- Frame 模板（CSS 参考）：`scripts/frame-template.html`
- 辅助脚本（客户端）：`scripts/helper.js`
