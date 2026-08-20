# WheelMaker npm 接入检查清单

## 安装与更新

- `server/internal/hub/tools/npm.go` 中的 `npmPackagePolicy` 是否仍匹配包名、显示名、agent type 和 binary name。
- `npm install -g`、update、reinstall、uninstall 的包名、版本、registry 参数是否仍可用。
- npm prefix、全局 bin、`exec.LookPath` 和重启提示是否会受到 engine 或安装布局变化影响。
- `npm list -g --depth=0 --json` 和 latest 查询返回的数据形状是否仍兼容。

## Agent/ACP 启动

- provider 启动命令、`--acp`/stdio 参数、子命令和默认入口是否改变。
- CLI 的环境变量、认证文件、配置目录、模型选择或能力声明是否改变。
- ACP 初始化、session 恢复、streaming、tool call、Steer/Goal 或输出格式是否需要回归。
- package 的 `engines`、平台架构、原生模块和 Node/npm 最低版本是否覆盖 WheelMaker 发布目标。

## 风险判断

- 仅文档、内部重构或与 WheelMaker 未使用的功能变化：`无需动作`。
- CLI/输出/依赖/engine 有变化但接口仍兼容：`需回归验证`。
- binary、启动参数、环境变量、配置、认证或 ACP contract 改变：`需调整接入`。
- 无法确认包内容、安装失败、私有 registry 不可达或存在明显破坏性变化：`暂不建议升级`。

只在变更确实影响判断时展开分析；不要把所有上游 commit 都转写成 WheelMaker 风险。
