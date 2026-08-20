---
name: npm-changelog
description: 追踪并记录 WheelMaker 通过 Hub 管理的 agent runtime npm 包版本更新，按版本整理中文 CHANGELOG 并分析对安装、更新、CLI、ACP provider 和运行时接入的影响。用户要求检查 WheelMaker 关注的 npm 更新、补充 docs/changelog、汇总开源 Git/changelog 或闭源 npm 包 diff 时使用。
---

# WheelMaker npm Changelog

## 目标

把 WheelMaker 的 agent runtime npm 更新转换为可持续维护的中文版本记录。只处理 `server/internal/hub/tools/npm.go` 的活动 `runtimeNPMPackages`，不把 `app/package.json` 依赖或 deprecated policy 当作关注清单。

## 运行前检查

1. 读取仓库根目录 `AGENTS.md`、`CLAUDE.md`，遵守当前仓库的 Git 和文件规则。
2. 确认工作树状态；只修改用户要求的 skill、`docs/changelog/`、必要的 `docs/README.md` 和计划文件，不覆盖任务外修改。
3. 使用 helper 读取活动清单：

   ```powershell
   python .agents/skills/npm-changelog/scripts/inspect_npm_policy.py .
   ```

   以 JSON 中的 `packageName`、`registry` 和 `fileName` 为准。不要手工维护第二份包名清单。

## 版本范围

为每个活动包映射到 `docs/changelog/<fileName>`：

- 文件已存在：读取最新的 `##` 版本标题，收集该版本之后的所有已发布版本，按最新到最旧补齐，不重复已有章节。
- 文件不存在：使用 npm `latest` dist-tag 对应的稳定版本，并向前取最多 10 个可获得的发布版本；可获得版本少于 10 个时全部记录。
- 优先使用公开的正式版本；只有官方发布历史把预发布版本作为当前支持线时才纳入。
- 没有新版本时保持文件不变，并在运行摘要中报告“无更新”。不要为了填充文件制造版本章节。

## 查询记录

每次运行都必须生成一份查询记录，不论是否发现更新、部分包失败或全部包失败。记录属于 WheelMaker 仓库，不写入本 skill source repo：

- 目录固定为 `docs/changelog/query-records/`；目录不存在时创建。
- 文件名使用本次运行本地时间的 `YYYY-MM-DD-HHmmss.md`；同一秒已有文件时追加 `-2`、`-3` 等后缀，不覆盖历史记录。
- 完成 policy 扫描和各包处理后写入记录；即使 policy、registry、Git 或 tarball 处理失败，也要写入记录并说明失败阶段和原因。
- 以 policy JSON 的活动 `runtime` 包列表为准，为每个包保留一行，不能只记录有更新的包。

记录至少包含以下内容：

```markdown
# npm changelog query record

- 查询时间：<本地时间和时区>
- 运行状态：完成 / 部分失败 / 失败

| npm 包 | 上次记录版本 | 本次查询最新版本 | 本次新增版本 | 状态 | 说明 |
| --- | --- | --- | --- | --- | --- |
| <package> | <latest ## version 或未记录> | <version 或未查询> | <version list 或无> | 已升级 / 无更新 / 查询失败 | <接入影响或失败原因> |
```

- “上次记录版本”只读取对应 `docs/changelog/<fileName>` 的最新版本标题；首次记录写 `未记录`，不能把上一次查询记录当作版本事实。
- “本次新增版本”列出上次记录之后实际研究并写入 changelog 的版本；无更新写 `无`，失败写 `未查询`，不要猜测版本或变更。
- 记录写入前检查每个 active package 都出现且只出现一次，并确认运行状态能反映成功、部分失败或全失败。

## 研究流程

### 1. 建立来源判断

读取 npm package metadata 的 `repository`、`homepage`、`versions`、`time`、`engines`、`bin`、`dependencies` 和 `dist.tarball`。如果 `repository` 指向可访问的公开 Git 仓库且能找到对应源码，走开源流程；仓库不存在、不可访问或没有包含已发布实现时，走 npm 包 diff 流程。不要因为 package 名称或 README 自称开源就跳过验证。

### 2. 开源包

按版本核对官方 changelog/release notes 与对应 Git tag/commit：

1. 先用仓库自己的 CHANGELOG、release 页面或版本说明建立候选变化。
2. 对影响 API、CLI、启动方式、依赖、Node engine、环境变量或协议的内容，回到 tag/commit 检查实际代码。
3. 只把与版本确实对应的变化归入该版本；合并重复的 release note 和 commit 描述。
4. 对官方说明与代码不一致的地方，以可见代码行为为准，并只在会改变 WheelMaker 判断时简短说明限制。

### 3. 闭源或私有包

使用 npm tarball 做版本间 diff，不用猜测代替源码分析：

1. 从 policy JSON 读取 registry；`@myflicker/cli` 必须使用 `https://npm.corp.kuaishou.com`，不得用 public registry 的同名结果替代。
2. 对相邻版本执行 `npm pack <package>@<version> --pack-destination <temporary-directory>`，在临时目录解包。
3. 比较 `package.json`、`bin`、入口文件、运行时代码、依赖、内置资源和 engine 字段；过滤压缩包时间戳、生成目录、source map 和其他纯打包噪声。
4. 将可见差异归入新增、修改、修复、弃用或安全影响；看不到的内部行为不要臆测。
5. 删除临时目录前保留足够的分析结果；不要把 tarball、解包目录或 npm cache 写入仓库。

## WheelMaker 接入分析

每个版本都创建 `### WheelMaker integration` 小节。按需读取 [integration-checklist.md](references/integration-checklist.md)，至少检查：

- `npm.go` 中的 package policy、agent type、binary name、registry 特例和最新版本查询。
- 全局 `npm install -g`、update、reinstall、uninstall、`LookPath` 与 npm prefix/bin 行为。
- 对应 ACP provider 的启动命令、参数、环境变量、认证、模型/能力声明和 session 兼容性。
- Node/npm `engines`、依赖变化、平台/架构限制、权限、网络和安全变化。
- 对 WheelMaker 的行动判断：`无需动作`、`需回归验证`、`需调整接入` 或 `暂不建议升级`，并说明直接原因。

只记录对 WheelMaker 有用的结论；不要求每条变更附来源、commit 或日期。研究来源用于校验事实，而不是增加 changelog 噪声。

## 写入格式

按 [changelog-format.md](references/changelog-format.md) 写中文 Markdown：

- 文件标题保持完整 npm 包名。
- 版本章节使用 `## <version>`，最新版本在前。
- 使用适用的 `### Added / 新增`、`### Changed / 修改`、`### Fixed / 修复`、`### Deprecated / 弃用`、`### Removed / 移除`、`### Security / 安全`。
- 每个版本必须有 `### WheelMaker integration`，即使结论是“无需动作”。
- 不创建空的分类小节，不重复版本，不改写已存在的历史结论。
- 不确定且不影响接入判断的细节直接省略；会影响升级决定时，明确写出分析限制。

## 失败处理与验证

- 单个包的 registry、Git、官方 changelog 或 tarball 失败时，保留其他包的成功结果；该包不生成未经确认的版本条目，运行摘要列出失败原因。
- 已有文件更新采用临时内容并在结构验证通过后写回；失败时保留原文件。
- 无论处理结果如何，都保留本次 `docs/changelog/query-records/` 记录；记录失败包、无更新包和实际新增版本。
- 完成后运行：

  ```powershell
  python -B -m unittest discover -s .agents/skills/npm-changelog/scripts/tests -v
  python -B -X utf8 C:\Users\suweimin\.codex\skills\.system\skill-creator\scripts\quick_validate.py .agents/skills/npm-changelog
  python -B .agents/skills/npm-changelog/scripts/inspect_npm_policy.py .
  python -B .agents/skills/npm-changelog/scripts/validate_changelog.py .
  git diff --check
  ```

- 先报告新增版本、无更新包和失败包，再交付结果。不要修改 WheelMaker npm 安装逻辑、协议版本或产品代码。
