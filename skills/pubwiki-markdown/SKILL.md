---
name: pubwiki-markdown
description: 在固定的 WheelMaker Wiki Vault 中创建、导入、分类、规范化并发布长期知识。用户要求记录项目知识、导入 Markdown 或 Wiki 材料、整理笔记、维护标签或发布已确认笔记时使用。
---

# pubwiki-markdown

本 Skill 将完整的 Obsidian Markdown 规范（`references/obsidian-markdown/obsidian-format.md` 及其引用的三个参考文件）与下面的 WheelMaker 知识工作流结合起来。编辑 Obsidian 特有语法时要阅读上游参考文件；下面的规则额外规定仓库目录、确认和发布契约。

## 固定工作区

唯一允许的数据根目录是：

```text
~/.wheelmaker/wiki/data/
```

把它视为一个 Obsidian Vault。不要发现或使用其他 Vault，不要扫描当前工作目录，也不要接受调用方指定的数据根目录。Wiki 的 Git 根目录必须就是 `data/` 目录。

读取或写入知识前，先运行固定路径准备助手：

```text
node <this-skill>/scripts/prepare-wiki.mjs
```

助手会在检查配置或内容之前先检查 Git。如果路径不存在或为空，向用户索要 Git URL，并把该 URL 传给助手。如果路径非空但不是 Git worktree，立即停止；不要删除、移动或覆盖任何内容。如果没有 URL，告诉用户自行准备或初始化 Git worktree；不要自动运行 `git init`。

计划发布时，在已确认的笔记写入之前，先同步干净的 Git worktree：

```text
node <this-skill>/scripts/prepare-wiki.mjs --sync
```

此命令不会在已有修改上自动 stash 或 rebase；发生 rebase 或远程冲突时，要报告给用户处理。

Git 检查成功后，助手只会在缺失时创建带注释的 `wiki.config.yaml`、`content/` 和 `content/assets/`。不会静默替换已有配置。数据根目录是唯一的内容配置根；AI 索引和 Quartz runtime 位于其外部。

## 内容目录

使用以下布局：

```text
data/
├── wiki.config.yaml
└── content/
    ├── <repo>/                 # 第一级项目边界
    │   └── <directory>/        # AI 选择的嵌套页面目录
    │       └── note.md
    └── assets/                 # 共享图片和被引用的资源
```

### 必须用 Git 命令确定实际的 repo

目录图中的 `<repo>` 只是占位符，不能原样写入路径，也不能省略第一级项目目录。处理来源项目时，必须先执行以下步骤：

1. 确定来源项目目录（即来源文件所属的项目目录）。
2. 在来源项目目录上执行 Git 命令，取得真正的 Git 根目录。

PowerShell：

```powershell
$repoRoot = (git -C "<来源项目目录>" rev-parse --show-toplevel).Trim()
$repo = Split-Path -Leaf $repoRoot.TrimEnd('\', '/')
```

POSIX shell：

```sh
repo_root="$(git -C "<来源项目目录>" rev-parse --show-toplevel)"
repo="$(basename "$repo_root")"
```

例如，若命令返回 `D:\Code\WheelMaker`，实际的 `repo` 就是 `WheelMaker`，目标必须形如：

```text
content/WheelMaker/<directory>/note.md
```

如果 Git 命令失败，才可以退回使用来源项目目录名；必须在预览中明确报告这是 Git 解析失败后的 fallback。解析出来源 Git 根目录后，才应用 `wiki.config.yaml` 中的可选重命名映射。整个分类、预览、写入和发布流程都必须使用最终的实际 repo 名称。

`repo` 默认取来源 Git 根目录的名称；只有无法解析 Git 根目录时才取来源项目目录名称，也可以通过 `wiki.config.yaml` 重命名。不要引入必需的 `kind`、`slug`、`project`、`projects` 或 `references` 属性。页面关系放在 Markdown 链接或 Wikilinks 中。

`wiki.config.yaml` 中可选的 `site` 块控制公开 Wiki 的标题和描述：

```yaml
site:
  title: WheelMaker Knowledge
  description: Browse the WheelMaker knowledge base.
```

如果提供这两个值，必须都是非空字符串。标题会同时用于公开首页标题、Quartz 页面标题、虚拟首页元数据和站点元数据。不会读取或迁移旧版配置文件名。

不要为根目录、repo 或普通目录创建 `index.md`。Quartz 会在构建时创建公开的虚拟首页和目录列表。

## 创建、导入和分类

1. 判断材料是否属于长期项目知识。不要把临时日志、凭据、私有配置或未经批准的推测放入 Vault。
2. 对来源 Wiki 页面，读取其物理第一行。匹配 `> 摘要：...` 的行作为候选 `description`；规范化为笔记时，从正文中移除原始摘要行。绝不能把标题后的任意段落当作 description。如果没有摘要，起草候选摘要并展示给用户。
3. 解析完整的 Obsidian Markdown 表面：frontmatter/properties、Wikilinks、块和标题目标、嵌入、callout、注释、高亮、标签、脚注、数学、Mermaid、GFM、代码块和外部链接。除非具体目标链接或渲染器要求安全等价写法，否则保留原语法。
4. 提议目录前先搜索已有笔记和标签。先搜索当前 `repo`，再搜索其他 repo。合适时复用已有的规范多级标签或目录。
5. 要求模型根据内容、摘要、来源、相似笔记、`repo` 和嵌套目录，逐个独立分类导入文件。不要把一批导入强行放入同一目录。默认保留来源文件名；任何重命名都需要确认。新目录或新标签都需要确认。
6. 写入一批导入内容前，建立来源到目标的路径映射。将映射应用到 Wikilinks、相对 Markdown 链接和资源链接。在预览中报告无法解析的目标、重复目标和资源冲突。
7. 新笔记使用 `YYYY-MM-DD-english-title.md`。创建日期是首次创建日期，后续编辑不得改变。标题存放在 frontmatter 中。

在模型准备好逐文件目录预览后，使用 `scripts/normalize-note.mjs` 对 frontmatter、摘要、标签、日期和链接映射做确定性规范化。该脚本只是格式化和诊断助手；分类和确认对话仍由本 Skill 负责。

## Frontmatter 和确认

每篇新建或规范化后要发布的笔记至少包含以下 frontmatter：

```yaml
---
title: ...
description: ...
date: YYYY-MM-DD
tags: []
draft: false
---
```

保留仍有意义的来源属性。只有来源中已有 `aliases` 或用户要求时才保留它；绝不要添加空的 aliases 数组。标签可以写在 frontmatter 或行内写成 `#tag`，也可以使用 `a/b` 这样的层级形式。`draft: true` 表示本地/私有内容，不会输出到公开 Quartz 站点。

存在相似笔记时，展示候选笔记并让用户选择更新、合并或新建；除非当前请求或此前批准已经明确给出该选择，否则不得静默覆盖。准备预览前先读取相关候选笔记。

### 确认时点和确认范围

把以下内容放在同一个完整预览中展示：

- frontmatter；
- description；
- 正文变更；
- 实际的 repo 名称和完整目标路径（`content/<实际repo>/<directory>/<filename>.md`）；
- 目录；
- 标签；
- 重复笔记处理选择；
- 资源移动；
- 链接改写；
- 本次操作是仅本地保存，还是保存并发布。

展示预览后必须停下来，等待用户对该预览作出明确确认。正式确认前，不得正式写入笔记或资源，也不得执行 Git add、commit、pull、push、发布助手或 `wheelmaker wiki publish`。如果用户在当前请求中已经明确批准了完全相同的内容、路径和处理方式，或此前已批准且预览没有实质变化，可以继承该批准。

用户最初说“发布 Wiki”可以确定本次操作的发布模式，但不能把尚未展示的 frontmatter、摘要、目录、标签或重复处理结果当成已确认。预览得到确认后，不要再为了 Git 同步、提交或发布单独增加一轮确认；这正是“已确认发布”的后续执行阶段。不要把仅本地保存的指令转换成发布。

正式写入前取消时，来源笔记必须保持不变；如果已经做过准备工作或更新了私有派生状态，要报告实际做过的事情，不要声称这些操作从未发生。

## Git 和发布

保存和发布都属于本 Skill。对于已获授权的发布，只用本次操作变更的路径调用发布助手。仅本地保存时，保存并校验笔记，不调用发布助手，也不改变长期发布偏好。固定 `data/` 仓库的 Git 生命周期由专用准备/发布助手负责；不要同时用 `git-workflow` 或 `git-check` 对同一批变更执行 prepare、commit、push 或 cleanup。普通来源仓库仍使用自己的 Git 生命周期。发布助手强制执行以下边界：

- 开始前检查 worktree 和 index；
- 如果 `data/` 下已有预先暂存的文件或无关修改，则停止；
- 绝不自动 stash、清理用户修改或 force-push；
- pull --rebase，暂存精确的已批准路径，commit，然后 push；
- rebase、commit 或 push 冲突时停止；
- 只有 Git 阶段成功后，才调用 `wheelmaker wiki publish`。

使用：

```text
node <this-skill>/scripts/publish-wiki.mjs --paths content/<实际repo>/<目录>/<文件>.md ...
```

发布助手只提交这些已批准的路径，执行配置的 rebase/push 阶段，然后调用现有的 `wheelmaker wiki publish` 命令。它不会调用单独的 Hub 上传命令。

`wiki.config.yaml` 中的 `publish.mode` 控制最后阶段是否运行。默认值 `auto` 下，Skill 调用现有 WheelMaker Wiki 命令。`off`、`disabled`、`manual` 和 `false` 会在暂存、commit、pull、push 或 WheelMaker 调用之前返回 `skipped`。该命令调用内置的 `default.mjs`；MJS 使用由 Skill 准备的 Quartz runtime，以 `data/content/` 为输入、Hub 输出目录为输出。同一个 WheelMaker 命令负责校验、归档、认证，并把静态结果上传到 `/wiki/`。Quartz 从不直接上传，也不会接收 WheelMaker 凭据。

发布前确保固定版本的 Quartz runtime 可用：

```text
node <this-skill>/scripts/ensure-quartz.mjs
```

该命令会在 `~/.wheelmaker/wiki/quartz/` 下安装或校验私有 runtime，并将其配置放在 Git 数据根目录之外。runtime 固定为 Quartz `v5.0.0`；其 YAML 配置、`quartz.ts` 入口、插件 lockfile 和生成的插件索引保持固定。默认情况下，WheelMaker UI 插件会被复制，并与安装快照比对，以兼容旧版 Hub。准备助手会根据 lockfile 恢复 Quartz Community 插件，不会把生成的插件目录留在 Wiki `data/` 中。没有文件 watcher；在 Obsidian 中编辑和保存不会隐式发布。Quartz 5 要求 Node.js 22 或更高版本。

### 将 UI 插件连接到本 Skill

将 Hub 更新到支持 Skill 插件绑定的版本后，在没有 Wiki 发布或其他 setup 运行时执行一次：

```text
node <this-skill>/scripts/ensure-quartz.mjs --link-skill
```

对于有效的现有 runtime，该命令只替换 WheelMaker 插件目录和缓存链接，保留 Quartz、配置和 `node_modules`。Windows 使用目录 junction；其他平台使用目录 symlink。来源取自当前安装的 Skill，不是硬编码的 checkout 路径。重复执行是安全的，可以修复缺失链接或重新绑定移动后的 Skill 安装。不会覆盖意外目录；激活失败时会恢复旧插件和元数据。

连接后，绑定 Skill 的 UI MJS 文件在下一次正常的 Hub UI/CLI 发布时生效。没有 watcher 或自动发布，Hub 也不会在每次发布时运行 Skill helper。固定导出器使用 Node 的 `--preserve-symlinks`，从 Quartz 解析插件依赖；`--import` 会预加载插件，因此语法或导入失败会在 Quartz 可能静默跳过插件之前终止进程。不需要修改 Quartz 源码，也不需要在 Skill 目录安装 `node_modules`。

Release 元数据会记录本地来源，并将插件 manifest 与实时 UI 文件分开固定。每次构建前后，导出器都会检查目录链接并计算插件树指纹；来源缺失、manifest 改变、嵌套链接或构建期间发生编辑都会使发布失败，而不是使用过时副本。来源路径和元数据都位于 `data/` 之外，也不会进入发布站点。

修改插件 manifest、Quartz 配置或依赖 lockfile 时，需要显式执行 `--refresh --link-skill`；refresh 会在启用后保持链接模式。旧版 Hub 无法发布 linked runtime，因此迁移前先更新 Hub。后续只修改 UI 文件时，不需要再次更新 Hub 或重新安装 Quartz。

桌面端导航使用匹配的目录/标签行、分离的展开按钮和链接、每篇文章计数、当前位置指示器以及支持键盘操作的标签页。较长的导航列表在侧栏内部滚动。WheelMaker 自己负责首页、目录结果页和标签结果页，使它们共享相同渲染方式，避免递归嵌入上游标签页的预渲染列表。仍启用外部 `tag-page` 插件的安装，需要一次 `--refresh --link-skill` 才能采用更新后的固定配置；页面插件会明确报告这一点，而不是生成互相竞争的标签页。

## 范围边界

本 Skill 不提供 WheelMaker 编辑器按钮、Obsidian URI opener 或第二套上传协议。它只维护纯 Markdown 数据、本地 runtime 资源以及已确认的 WheelMaker 发布流程。
