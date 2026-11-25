---
name: pubwiki-markdown
description: 在固定的 WheelMaker Wiki Vault 中创建、导入、分类、规范化并发布长期知识。正文写作调用 write-doc，优先用图表达层级、流程和依赖关系。用户要求记录项目知识、导入 Markdown 或 Wiki 材料、整理笔记、维护标签或发布已确认笔记时使用。
---

# pubwiki-markdown

本 Skill 将完整的 Obsidian Markdown 规范（`references/obsidian-markdown/obsidian-format.md` 及其引用的三个参考文件）与下面的 WheelMaker 知识工作流结合起来。编辑 Obsidian 特有语法时要阅读上游参考文件；起草或规范化 Wiki 页面时还要遵循 `references/OBSIDIAN-WIKI-PATTERNS.md`，把语法能力转化为有依据的知识网络关系。下面的规则额外规定仓库目录、确认和发布契约。

## 固定工作区

唯一允许的数据根目录是：

```text
~/.wheelmaker/wiki/data/
```

把它视为一个 Obsidian Vault。不要发现或使用其他 Vault，不要扫描当前工作目录，也不要接受调用方指定的数据根目录。Wiki 的 Git 根目录必须就是 `data/` 目录。

开始工作前，直接调用 CLI 准备固定工作区：

```text
wheelmaker cmd --command wiki --action prepare
```

如果用户已提供 Git URL，首次调用带上 `--git-url "<URL>"`。使用本地 Git 已配置的认证方式。CLI 若报告路径不存在或为空且缺少 URL，再向用户询问远程仓库地址。非空目录若不是以 `data/` 为根的 Git worktree，停止并保留其中的文件。没有 URL 时由用户准备现有 worktree，Skill 不运行 `git init`。

Go 先验证 Git 根目录，再补齐缺失的默认配置、`content/` 和 `content/assets/`。读取配置及安装阅读器依赖由 WheelMaker 负责。

收到发布批准后，先查 `status` 的 `data.publishMode`。需要自动发布时，在正式写入已确认的文件之前运行同步：

```text
wheelmaker cmd --command wiki --action prepare --sync
```

同步需要可用的 Git upstream。原样生成且尚未跟踪的默认配置不阻断首次同步，其他未提交修改、Git 操作或远端冲突仍需按实际错误处理。同步后若相关公开参考或目标状态发生实质变化，重新核对受影响的预览。

## 发布准备的输入

准备发布的分类、查重、链接、资源和写作只使用用户已批准用于本次发布的公开材料，以及已发布的公开目录或候选摘录。发布前不得调用 `pubwiki-search`、Obsidian 本地搜索或私有索引，也不得读取原始 Vault、用户配置、项目路由或凭据。

可检查已确认目标路径是否存在。若无法从公开材料确认目标内容、图片来源或重复关系，请用户提供可披露的摘录、目录或精确路径；同名目标的内容未经确认时保留原文件。完整配置校验和发布输入筛选由 Go 完成。

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

如果没有可用的 remote、`origin` 不存在或 URL 无法解析，必须停止并报告，不能退回使用本地目录名，也不能猜测仓库名。`repo` 默认使用远程仓库名；已有目录与它不同时，沿用当前会话已确认的公开目标目录，否则请用户确认对应目标。不要读取或枚举私有配置中的项目路由。整个分类、预览、写入和发布流程使用同一份已确认的实际 repo 名称。

不要引入必需的 `kind`、`slug`、`project`、`projects` 或 `references` 属性。页面关系放在 Markdown 链接或 Wikilinks 中。

`wiki.config.yaml` 中可选的 `site` 块控制公开 Wiki 的标题和描述：

```yaml
site:
  title: WheelMaker Knowledge
  description: Browse the WheelMaker knowledge base.
```

如果提供这两个值，必须都是非空字符串。标题会同时用于公开首页标题和站点元数据。

不要为根目录、repo 或普通目录创建 `index.md`。静态阅读器生成首页和各级目录的 `index.html`，并支持标签、搜索和筛选浏览。

## 创建、导入和分类

1. 判断材料是否属于长期项目知识。不要把临时日志、凭据、私有配置或未经批准的推测放入 Vault。
2. 对来源 Wiki 页面，读取其物理第一行。匹配 `> 摘要：...` 的行作为候选 `description`；规范化为笔记时，从正文中移除原始摘要行。绝不能把标题后的任意段落当作 description。如果没有摘要，起草候选摘要并展示给用户。
3. 解析完整的 Obsidian Markdown 表面：frontmatter/properties、Wikilinks、块和标题目标、嵌入、callout、注释、高亮、标签、脚注、数学、Mermaid、GFM、代码块和外部链接。除非具体目标链接或渲染器要求安全等价写法，否则保留原语法。
4. 提议目录前，从本次操作可使用的材料中查找已有笔记和标签。先查当前 `repo`，再查其他 repo。合适时复用已有的规范多级标签或目录。
5. 要求模型根据内容、摘要、来源、相似笔记、`repo` 和嵌套目录，逐个独立分类导入文件。不要把一批导入强行放入同一目录。默认保留来源文件名；任何重命名都需要确认。新目录或新标签都需要确认。
6. 写入一批导入内容前，建立来源到目标的路径映射。将映射应用到 Wikilinks、相对 Markdown 链接和资源链接。在预览中报告无法解析的目标、重复目标和资源冲突。
7. 新笔记使用 `YYYY-MM-DD-english-title.md`。创建日期是首次创建日期，后续编辑不得改变。标题存放在 frontmatter 中。

在模型准备好逐文件目录预览后，使用 `scripts/normalize-note.mjs` 对 frontmatter、摘要、标签、日期和链接映射做确定性规范化。该脚本只是格式化和诊断助手；分类和确认对话仍由本 Skill 负责。

## 写作指导与图表

正文写作委托同一 skill 库中的 [write-doc](../write-doc/SKILL.md) 完成。交接读者、写作目标、编辑范围、已确认的术语与关系，以及 `references/OBSIDIAN-WIKI-PATTERNS.md` 中的表达要求。来源含义、Obsidian 语法和本次授权范围作为成稿约束；图中的节点、关系和正文结论都以材料为依据。

`write-doc` 及其子代理的交接材料限于本次公开输出所需且允许披露的最小事实、候选内容和写作要求，授权路径限于本次获准的公开候选稿与可披露的参考。

接收完成优化和复核的候选正文与图表，将 `mermaid` 代码块嵌入正文，并把图表理由与验证状态纳入同一份完整预览。本 Skill 负责来源边界、Obsidian 语法、目标路径、资源、确认、正式写入、Git 和发布。

若 `write-doc` 未安装，说明实际情况并用已有能力完成基础写作和图表，不自动联网安装。

## 图片与资源发布规则

含图片的创建、导入、迁移和发布，把 Markdown 与其引用的本地图片作为同一批内容处理。图片语法参考 `references/obsidian-markdown/EMBEDS.md`，资源处理遵循以下规则：

1. **清点与映射**：检查 Markdown 图片、引用式图片、Obsidian 嵌入及已有 HTML 图片引用；代码示例中的图片语法不作为实际依赖。为实际引用的本地图片建立来源到最终路径的映射，与笔记共用同一批次。导入默认复制并保留来源；发布引用不能依赖本机绝对路径、`file://` 或会话附件临时路径。外链图片保留为外链并标明外部依赖，不擅自下载归档。
2. **按最终分类保存**：新导入的项目图片默认放在 `content/assets/<实际repo>/<directory>/`，沿用笔记最终确认的 repo 和嵌套分类。已有的共享资源可以原路径复用，不为符合新布局批量迁移。确需移动资源时，先核对当前操作可使用的引用，将受影响页面的链接改写纳入同一预览；仍被其他页面引用的资源不得直接删除。
3. **重名与缺失检查**：确认本地图片来源存在、目标可确定；复用已有资源前核对内容。相同目标路径但内容不同、同名文件导致解析歧义时，在预览中提出保留、复用或重命名方案，不静默覆盖。未解决的缺失资源、重名歧义或资源冲突会阻止本批发布。
4. **默认缩放并压缩**。对本次获准发布的新增或替换静态位图，先在本地临时目录生成发布副本，保留来源文件。用户指定的尺寸、格式和保真要求优先。默认以 `1600 × 900` 像素（宽 × 高）为上限，按阅读需要缩小，保持长宽比和完整画面。原图已小于上限时无需放大，密集文字或图表需要更多像素时可保留足够的分辨率。SVG 和动画沿用原格式。
   - 逐图比较不同质量的有损 WebP 和无损 WebP。在实际阅读尺寸下检查文字、细线、颜色和透明度，从合格候选中选体积最小的一份。使用 [`cwebp`](https://developers.google.com/speed/webp/docs/cwebp) 时，有损候选用 `-m 6` 并逐步降低 `-q`，无损候选用 `-lossless -m 6 -q 100`。需要像素级保真时保留原始分辨率并验证解码后的像素值。若原件符合本次要求，且体积更小或本地工具无法产出合格候选，沿用原件。
5. **按阅读器规则改写引用**。本地资源先按笔记相对路径、再按 `content/` 内路径解析；仅有文件名时，必须在内容树中唯一。优先使用能明确定位的相对路径或内容路径，保留 alt、标题和尺寸信息。转换格式后使用成品路径和扩展名更新引用；不硬编码构建产物 URL。重名歧义或缺失引用由 Hub 在交给阅读器前拦截。规范化助手未覆盖的引用形式需另行核查，助手没有诊断不代表图片已验证。
6. **同批保存、提交和发布**。预览中逐项列出 Markdown 与资源的新增、修改、移动、删除路径，移动要包含旧、新路径。压缩或缩放过的图片同时列出处理前后的格式、尺寸和字节数。确认后一起写入并校验，再将所有发生变更的精确文件路径传给 `wheelmaker cmd --command wiki --action publish --commit`。已跟踪且未变化的复用资源不必重复提交，但必须验证仍存在且引用可解析。

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

存在相似笔记时，展示候选笔记并让用户选择更新、合并或新建；除非当前请求或此前批准已经明确给出该选择，否则不得静默覆盖。准备预览前先核对可使用的候选摘录；发布时使用本次获准的公开材料。

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

展示预览后必须停下来，等待用户对该预览作出明确确认。正式确认前，不得正式写入笔记或资源，也不得执行 Git add、commit、pull、push 或任何 Wiki 发布命令。如果用户在当前请求中已经明确批准了完全相同的内容、路径和处理方式，或此前已批准且预览没有实质变化，可以继承该批准。

用户最初说“发布 Wiki”可以确定本次操作的发布模式，但不能把尚未展示的 frontmatter、摘要、目录、标签或重复处理结果当成已确认。预览得到确认后，不要再为了 Git 同步、提交或发布单独增加一轮确认；这正是“已确认发布”的后续执行阶段。不要把仅本地保存的指令转换成发布。

正式写入前取消时，来源笔记必须保持不变；如果已经做过准备工作或更新了私有派生状态，要报告实际做过的事情，不要声称这些操作从未发生。

## Git 和发布

本 Skill 直接调用已安装的 WheelMaker CLI。工作区准备、阅读器、运行依赖、导出和发布流程均由 WheelMaker 管理。Skill 负责准备已授权的内容和资源、确认及命令调用，随附脚本用于规范化笔记。

| 操作 | Go 命令 |
| --- | --- |
| 准备固定工作区 | `wheelmaker cmd --command wiki --action prepare`，首次需要时附加 `--git-url "<URL>"` |
| 发布前同步干净仓库 | `wheelmaker cmd --command wiki --action prepare --sync` |
| 检查发布策略 | `wheelmaker cmd --command wiki --action status`，只使用其返回的受限发布模式 |
| 保存并发布已确认文件 | `wheelmaker cmd --command wiki --action publish --commit --paths "<文件>" ...` |
| 重新发布已有内容 | `wheelmaker cmd --command wiki --action publish`，须已有发布授权 |

CLI 返回 `ok`、`data` 和 `error`。先检查退出码与 `ok`；成功时从 `data.publishMode` 读取准备和状态的发布策略，失败时查看 `error.code`、`error.message` 及已有的部分结果。`data.paths` 是固定布局，`data.staged` 是已暂存文件，批准范围仍以本次 `--paths` 为准。`data.pushed` 为 true 表示 Git 已经推送；如后续发布失败，查发布任务，不要重复提交。

CLI 不存在、命令不受支持或调用失败时，报告实际结果并按需提示更新 WheelMaker。Skill 不自行实现安装、Git 发布或原始 Vault 导出，不读取完整用户配置。

### 保存并发布

仅本地保存时，只写入并校验已确认的笔记和资源。保存并发布时，将精确的已批准文件路径直接传给 Go：

```text
wheelmaker cmd --command wiki --action publish --commit --paths "content/<实际repo>/<目录>/<文件>.md" --paths "content/assets/<实际repo>/<目录>/<图片>.png"
```

每个文件分别传 `--paths`，不传目录或通配符；移动和删除也包括旧路径。Go 管理固定 data 仓库的 Git 生命周期，提交批准路径，并可在首次提交中附带原样生成的默认配置，然后同步、推送和发布；普通 `publish` 不自动提交或推送笔记。

冲突或失败保留现场并报告，不强推、不自动 stash，也不覆盖用户修改。先用 `wheelmaker cmd --command wiki --action status` 检查受限发布模式；若 `data.publishMode` 为 `off`、`disabled`、`manual` 或 `false`，按策略跳过自动发布，不读取配置全文。

### 发布验证

重新发布现有内容时直接调用 `wheelmaker cmd --command wiki --action publish`，仍遵守本次操作已有的发布授权。

发布不得修改源 Markdown。检查对应的目录、标签、搜索、Wikilinks、别名、标题与块链接，以及本批引用图片和附件的实际可读性；代码、公式和 Mermaid 图表应正常显示和交互。

固定导出器仅接收 Go 筛选后的公开投影。Skill 的输入遵守发布准备边界，CLI 只返回受限状态和操作结果。线上验证使用已认证入口，就绪检查不能替代线上发布成功的证据。

## 范围边界

本 Skill 维护 Obsidian Markdown 数据、知识创作规范和已确认的 Go CLI 调用。研发测量工具在 WheelMaker 仓库维护，Skill 不携带阅读器、运行环境或发布转发脚本。
