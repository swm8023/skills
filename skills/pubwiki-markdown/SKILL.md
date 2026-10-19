---
name: pubwiki-markdown
description: 在固定的 WheelMaker Wiki Vault 中创建、导入、分类、规范化并发布长期知识。用户要求记录项目知识、导入 Markdown 或 Wiki 材料、整理笔记、维护标签或发布已确认笔记时使用。
---

# pubwiki-markdown

本 Skill 将完整的 Obsidian Markdown 规范（`references/obsidian-markdown/obsidian-format.md` 及其引用的三个参考文件）与下面的 WheelMaker 知识工作流结合起来。编辑 Obsidian 特有语法时要阅读上游参考文件；起草或规范化 Wiki 页面时还要遵循 `references/OBSIDIAN-WIKI-PATTERNS.md`，把语法能力转化为有依据的知识网络关系。下面的规则额外规定仓库目录、确认和发布契约。

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

Git 检查成功后，助手只会在缺失时创建带注释的 `wiki.config.yaml`、`content/` 和 `content/assets/`。不会静默替换已有配置。数据根目录是唯一的内容配置根；AI 索引和 阅读器 runtime 位于其外部。

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

### 必须用 Git 命令确定远程仓库名

目录图中的 `<repo>` 只是占位符，不能原样写入路径，也不能用本地 checkout 目录名代替。处理来源项目时，必须从该项目的远程 URL 取得仓库名；`git rev-parse --show-toplevel` 只能用于确认来源项目属于哪个 worktree，不能用来确定 `<repo>`。

1. 确定来源项目目录（即来源文件所属的项目目录）。
2. 默认读取名为 `origin` 的 remote；如果用户明确指定了其他 remote，就使用用户指定的 remote。
3. 执行 `git remote get-url`，从 URL 最后一段取得仓库名，并去掉末尾的 `.git`。

PowerShell（默认使用 `origin`）：

```powershell
$remoteName = "origin"
$remoteUrl = (git -C "<来源项目目录>" remote get-url $remoteName 2>$null).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($remoteUrl)) {
  throw "无法读取来源项目的远程仓库 URL：请配置 origin，或明确指定正确的 remote。"
}
$repo = (($remoteUrl.TrimEnd('/', '\') -split '[/\\:]')[-1] -replace '\.git$', '')
if ([string]::IsNullOrWhiteSpace($repo)) { throw "无法从远程 URL 解析仓库名。" }
```

POSIX shell（默认使用 `origin`）：

```sh
remote_name="origin"
remote_url="$(git -C "<来源项目目录>" remote get-url "$remote_name")" || {
  echo "无法读取来源项目的远程仓库 URL：请配置 origin，或明确指定正确的 remote。" >&2
  exit 1
}
repo="$(basename "${remote_url%/}")"
repo="${repo%.git}"
test -n "$repo" || { echo "无法从远程 URL 解析仓库名。" >&2; exit 1; }
```

例如，本地项目目录是 `D:\Code\wm`，但 `origin` URL 是 `git@github.com:swm8023/WheelMaker.git`，实际的 `repo` 必须是 `WheelMaker`，目标必须形如：

```text
content/WheelMaker/<directory>/note.md
```

如果没有可用的 remote、`origin` 不存在或 URL 无法解析，必须停止并报告，不能退回使用本地目录名，也不能猜测仓库名。没有配置映射时，`repo` 默认就是远程 URL 的仓库名；只有 `wiki.config.yaml` 明确配置了重命名映射时，才使用映射后的 Wiki 一级目录名，并在预览中同时展示远程仓库名和最终目录名。整个分类、预览、写入和发布流程都必须使用最终确定的实际 repo 名称。

不要引入必需的 `kind`、`slug`、`project`、`projects` 或 `references` 属性。页面关系放在 Markdown 链接或 Wikilinks 中。

`wiki.config.yaml` 中可选的 `site` 块控制公开 Wiki 的标题和描述：

```yaml
site:
  title: WheelMaker Knowledge
  description: Browse the WheelMaker knowledge base.
```

如果提供这两个值，必须都是非空字符串。标题会同时用于公开首页标题和站点元数据。

不要为根目录、repo 或普通目录创建 `index.md`。静态阅读器在构建时创建首页，目录通过页面筛选浏览。

## 创建、导入和分类

1. 判断材料是否属于长期项目知识。不要把临时日志、凭据、私有配置或未经批准的推测放入 Vault。
2. 对来源 Wiki 页面，读取其物理第一行。匹配 `> 摘要：...` 的行作为候选 `description`；规范化为笔记时，从正文中移除原始摘要行。绝不能把标题后的任意段落当作 description。如果没有摘要，起草候选摘要并展示给用户。
3. 解析完整的 Obsidian Markdown 表面：frontmatter/properties、Wikilinks、块和标题目标、嵌入、callout、注释、高亮、标签、脚注、数学、Mermaid、GFM、代码块和外部链接。除非具体目标链接或渲染器要求安全等价写法，否则保留原语法。
4. 提议目录前先搜索已有笔记和标签。先搜索当前 `repo`，再搜索其他 repo。合适时复用已有的规范多级标签或目录。
5. 要求模型根据内容、摘要、来源、相似笔记、`repo` 和嵌套目录，逐个独立分类导入文件。不要把一批导入强行放入同一目录。默认保留来源文件名；任何重命名都需要确认。新目录或新标签都需要确认。
6. 写入一批导入内容前，建立来源到目标的路径映射。将映射应用到 Wikilinks、相对 Markdown 链接和资源链接。在预览中报告无法解析的目标、重复目标和资源冲突。
7. 新笔记使用 `YYYY-MM-DD-english-title.md`。创建日期是首次创建日期，后续编辑不得改变。标题存放在 frontmatter 中。

在模型准备好逐文件目录预览后，使用 `scripts/normalize-note.mjs` 对 frontmatter、摘要、标签、日期和链接映射做确定性规范化。该脚本只是格式化和诊断助手；分类和确认对话仍由本 Skill 负责。

## 图片与资源发布规则

含图片的创建、导入、迁移和发布，把 Markdown 与其引用的本地图片作为同一批内容处理。图片语法参考 `references/obsidian-markdown/EMBEDS.md`，资源处理遵循以下规则：

1. **清点与映射**：检查 Markdown 图片、引用式图片、Obsidian 嵌入及已有 HTML 图片引用；代码示例中的图片语法不作为实际依赖。为实际引用的本地图片建立来源到最终路径的映射，与笔记共用同一批次。导入默认复制并保留来源；发布引用不能依赖本机绝对路径、`file://` 或会话附件临时路径。外链图片保留为外链并标明外部依赖，不擅自下载归档。
2. **按最终分类保存**：新导入的项目图片默认放在 `content/assets/<实际repo>/<directory>/`，沿用笔记最终确认的 repo 和嵌套分类。已有的共享资源可以原路径复用，不为符合新布局批量迁移。确需移动资源时，先检查整个 Vault 的引用，将受影响页面的链接改写纳入同一预览；仍被其他页面引用的资源不得直接删除。
3. **重名与缺失检查**：确认本地图片来源存在、目标可确定；复用已有资源前核对内容。相同目标路径但内容不同、同名文件导致解析歧义时，在预览中提出保留、复用或重命名方案，不静默覆盖。未解决的缺失资源、重名歧义或资源冲突会阻止本批发布。
4. **按运行配置改写引用**：读取当前 阅读器 runtime 的链接解析配置；Skill 随附配置使用 `markdownLinkResolution: shortest`，不能假定所有图片都按当前页面的相对路径解析。采用能唯一指向目标的路径，保留 alt、标题和尺寸信息；不硬编码构建产物 URL。规范化助手未覆盖的引用形式需另行核查和改写，助手没有诊断不代表图片已验证。
5. **同批保存、提交和发布**：预览中逐项列出 Markdown 与资源的新增、修改、移动、删除路径；移动要包含旧、新路径。确认后一起写入并校验，再将所有发生变更的精确文件路径交给发布助手。已跟踪且未变化的复用资源不必重复提交，但必须验证仍存在且引用可解析。

这些规则复用下方的同一份完整预览与确认，不另加图片确认轮次。构建和发布后的图片验证见「构建与发布验证」。

## Obsidian 知识网络生成

生成或更新页面时，必须把页面视为固定 Vault 中的知识节点，而不是孤立的 Markdown 文件。读取 `references/OBSIDIAN-WIKI-PATTERNS.md`，并在逐文件分类和预览阶段完成以下检查：

1. 先检查同一 `repo`，再检查其他 `repo` 的已有笔记、标题、`aliases`、标签和相似内容。
2. 为每篇页面识别有内容依据的关联目标，通常加入约 2–5 个高价值 Wikilinks；没有合适目标时不得强行添加。
3. 内部笔记使用已确认目标的 `[[Wikilinks]]`；需要精确引用时再使用标题链接或稳定的块链接。外部目标继续使用普通 Markdown 链接。
4. 明确区分出链和反向链接：不写 `backlinks` 属性；仅当已有笔记确实应指向新页面时，提出该已有笔记的修改建议。
5. 按语义提示使用 Properties、层级标签、Callout 和 Embed；不为了展示语法而添加特性，也不默认引入 Bases、Canvas 或 Dataview 文件。
6. 将新增出链、反向链接建议、特性选择、未解析链接、重复目标和资源冲突放进同一份完整预览。反向链接建议与新页面修改共用当前确认，不增加单独确认轮次。

这套规则不要求链接人为双向对称，也不允许批量改写整个 Vault；关系不清晰时报告候选或明确不添加。

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

保留仍有意义的来源属性。只有来源中已有 `aliases` 或用户要求时才保留它；绝不要添加空的 aliases 数组。标签可以写在 frontmatter 或行内写成 `#tag`，也可以使用 `a/b` 这样的层级形式。`draft: true` 表示本地/私有内容，不会输出到公开静态站点。

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
- 图片及其他资源的来源、最终路径和新增、复用、移动、删除方式；
- 本批新增、修改、移动、删除的精确文件清单（包含受影响页面，移动包含旧、新路径）；
- 链接改写；
- Obsidian 特性选择和知识网络变更（新增出链、反向链接建议、特性理由及诊断）；
- 本次操作是仅本地保存，还是保存并发布。

展示预览后必须停下来，等待用户对该预览作出明确确认。正式确认前，不得正式写入笔记或资源，也不得执行 Git add、commit、pull、push、发布助手或 `wheelmaker wiki publish`。如果用户在当前请求中已经明确批准了完全相同的内容、路径和处理方式，或此前已批准且预览没有实质变化，可以继承该批准。

用户最初说“发布 Wiki”可以确定本次操作的发布模式，但不能把尚未展示的 frontmatter、摘要、目录、标签或重复处理结果当成已确认。预览得到确认后，不要再为了 Git 同步、提交或发布单独增加一轮确认；这正是“已确认发布”的后续执行阶段。不要把仅本地保存的指令转换成发布。

正式写入前取消时，来源笔记必须保持不变；如果已经做过准备工作或更新了私有派生状态，要报告实际做过的事情，不要声称这些操作从未发生。

## Git 和发布

### 准备独立阅读器

阅读器源码位于本 Skill 的 `assets/dochub/`，最初从 DocHub 复制，之后独立维护。
运行时不连接 NeoExporter、DocHub MCP 或 DocHub Git checkout，也不安装 Quartz。

首次使用或依赖变化时执行：

```text
node <this-skill>/scripts/ensure-reader.mjs --install
```

助手在阅读器自身目录执行固定 lockfile 的 npm ci，并建立：

```text
~/.wheelmaker/wiki/reader -> <this-skill>/assets/dochub
~/.wheelmaker/wiki/.pubwiki-reader.json
```

Windows 使用 Junction，其他平台使用目录符号链接。链接、依赖和私有索引均在 Vault 外。
已有普通 reader 目录不会被覆盖。Hub 的固定导出入口必须先升级到支持 PubWiki reader 的版本；
仅运行安装助手不会更新正在运行的 Hub。

普通发布前运行不带 --install 的就绪检查。JS、CSS 和导出代码通过链接在下一次导出中生效；
package.json 或依赖变化后重新执行 --install。构建中改变源码会使本次构建失败。

### 保存并发布

仅本地保存时，只写入并校验已确认的笔记和资源。保存并发布时，使用精确的已批准文件路径：

```text
node <this-skill>/scripts/publish-wiki.mjs --paths "content/<实际repo>/<目录>/<文件>.md" --paths "content/assets/<实际repo>/<目录>/<图片>.png"
```

每个文件分别传 --paths，不传目录或通配符；移动和删除也包括旧路径。
固定 data 仓库的 Git 生命周期只由本 Skill 的准备、发布助手管理。
发布助手在 Git 写入前检查 reader 就绪状态、已有暂存和本批之外的修改，然后仅提交批准路径，
执行 pull --rebase、push，最后调用 wheelmaker wiki publish。
冲突或失败保留现场并报告，不强推、不自动 stash，也不覆盖用户修改。
用户配置 publish.mode 为 off、disabled、manual 或 false 时返回 skipped。

### 本地预览与重新发布

本地预览只读取 Vault，在独立 .previews 目录生成站点，并监听 127.0.0.1；不上传、不修改笔记：

```text
node <this-skill>/scripts/preview-reader.mjs
```

纯阅读器修改或已存在内容的重新发布，在已有发布授权时调用：

```text
wheelmaker wiki publish
```

Hub 使用固定输入 data、固定输出 .output 和链接的阅读器进行构建、校验、打包及上传；
Registry 仍在 /wiki/ 提供静态站点，沿用现有应用鉴权和独立阅读入口。
构建失败不得覆盖当前发布版本。

### 验证

导出必须保留源 Markdown、目录和附件布局；草稿、已删除文章、用户配置、索引和凭据不得进入产物。
检查目录、筛选分页、浏览器搜索、Wikilinks、别名、标题/块链接及本批引用的图片。
公式由本地 KaTeX 渲染，Mermaid 使用随产物提供的资源，不依赖 CDN 或 MCP。
涉及图片时核对实际产物文件和页面 src，线上验证必须使用已认证入口。
就绪检查和本地导出不能替代线上发布成功的证据。

## 范围边界

本 Skill 维护纯 Obsidian Markdown 数据、自带阅读器代码和已确认的 WheelMaker 静态发布流程。
