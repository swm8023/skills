# WheelMaker npm CHANGELOG 格式

每个活动 npm 包使用一个文件，文件名由 `inspect_npm_policy.py` 输出的 `fileName` 决定。版本章节最新在前，不为没有变化的分类创建空小节。

```markdown
# @scope/package

> WheelMaker agent runtime npm changelog

## 1.2.3

### Added / 新增

- 用中文概括新增能力，以及它是否改变 WheelMaker 可见行为。

### Changed / 修改

- 用中文概括行为、API、CLI、依赖或运行环境变化。

### Fixed / 修复

- 用中文概括与 WheelMaker 运行路径有关的修复。

### WheelMaker integration

- 结论：无需动作 / 需回归验证 / 需调整接入 / 暂不建议升级。
- 说明影响的安装、启动、ACP provider、配置、认证、Node engine 或平台边界。
```

## 分类规则

- `Added / 新增`：新命令、新参数、新 provider 能力、新 API 或新平台支持。
- `Changed / 修改`：默认值、行为、输出、依赖、engine、配置或兼容边界变化。
- `Fixed / 修复`：bug、安全修复、崩溃、安装失败、路径和平台修复。
- `Deprecated / 弃用`：上游宣布将移除或不再建议使用的能力。
- `Removed / 移除`：已经删除的命令、参数、API 或平台支持。
- `Security / 安全`：安全修复、权限、凭据处理或供应链相关变化。
- `WheelMaker integration`：必须给出面向 WheelMaker 的结论；上游变化若不影响接入，直接写“无需动作”。

不要把 release note 原文大段复制进文档，也不要为了完整而写无法从公开材料或 tarball diff 确认的内部推断。
