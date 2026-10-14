---
name: setup-pre-commit
description: 在当前仓库设置 Husky pre-commit hook，运行 lint-staged（Prettier）、类型检查和测试。用户希望添加 pre-commit、设置 Husky/lint-staged，或提交时格式化、类型检查、测试时使用。
---

# Setup Pre-Commit Hooks

## What This Sets Up

- **Husky** pre-commit hook
- **lint-staged** 对所有 staged 文件运行 Prettier
- **Prettier** 配置（若缺失）
- pre-commit 内 **typecheck** 和 **test** 脚本

## Steps

### 1. Detect package manager

检测 `package-lock.json`（npm）、`pnpm-lock.yaml`（pnpm）、`yarn.lock`（yarn）、`bun.lockb`（bun），使用已有对应工具。不明确时默认 npm。

### 2. Install dependencies

安装为 devDependency：

```
husky lint-staged prettier
```

### 3. Initialize Husky

```bash
npx husky init
```

这会创建 `.husky/` 并在 package.json 添加 `prepare: "husky"`。

### 4. Create `.husky/pre-commit`

写入此文件（Husky v9+ 无需 shebang）：

```
npx lint-staged
npm run typecheck
npm run test
```

**Adapt**：将 `npm` 替换为检测出的 package manager。package.json 没有 `typecheck` 或 `test` 时，省略对应行并告知用户。

### 5. Create `.lintstagedrc`

```json
{
  "*": "prettier --ignore-unknown --write"
}
```

### 6. Create `.prettierrc` (if missing)

只有不存在 Prettier 配置时创建，使用这些默认值：

```json
{
  "useTabs": false,
  "tabWidth": 2,
  "printWidth": 80,
  "singleQuote": false,
  "trailingComma": "es5",
  "semi": true,
  "arrowParens": "always"
}
```

### 7. Verify

- [ ] `.husky/pre-commit` 存在且可执行
- [ ] `.lintstagedrc` 存在
- [ ] package.json 的 `prepare` 为 `"husky"`
- [ ] `prettier` 配置存在
- [ ] 运行 `npx lint-staged` 验证

### 8. Commit

stage 所有修改或新增文件，以 `Add pre-commit hooks (husky + lint-staged + prettier)` 为消息 commit。

这会通过新 pre-commit hook，是很好的 smoke test。

## Notes

- Husky v9+ 的 hook 无需 shebang
- `prettier --ignore-unknown` 跳过 Prettier 不能解析的文件（图片等）
- pre-commit 先运行 lint-staged（快，仅 staged），再完整 typecheck 和测试
