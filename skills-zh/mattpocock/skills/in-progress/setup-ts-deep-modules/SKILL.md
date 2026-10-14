---
name: setup-ts-deep-modules
description: 将 dependency-cruiser 接入 TypeScript 仓库，让每个 package 成为 deep module：implementation 藏在子目录，只能通过入口文件访问。用户手动调用。
disable-model-invocation: true
---

# Setup TS Deep Modules

让每个 package 成为 **deep module**：小 interface 后有大量行为。package 的公共表面是 **entry point**（根目录文件），全部子目录内容隐藏。本 skill 安装 [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) 和入口唯一可访问的规则，再证明规则真的有效。

调用 Skill 工具加载 "codebase-design"，获取词汇（deep module、interface、seam、depth），全程使用。

## The shape this enforces

```
src/packages/
  <name>/
    index.ts        ← an entry point (public). Import this from outside.
    client.ts       ← another entry point. Packages may expose SEVERAL.
    lib/            ← implementation: hidden from outside, free to import each other.
    tests/          ← co-located tests + fixtures (a subfolder, so private).
```

公共表面是 package 的 **根文件**，不是指定的一个 `index.ts`。约定 implementation 放 `lib/`，测试放 `tests/`，使每个 package 都有相同两目录形状。但规则本身通用：*任意*子目录中的*一切*都是私有，因此新文件夹不需扩展配置。

四条规则，全部为 `error`：

1. **Entry-point boundary**：package 外代码（app 或其他 package）只可 import 根文件入口，不可 import 子目录内容。
2. **Intra-package freedom**：同 package 的文件可自由相互 import。
3. **Tests through the entry points**：`<pkg>/tests/` 下文件可 import 任意 package 的入口和自身 `tests/` fixture，但不能 import 任意 package 的子目录内部，自己的也不行。跨 package 集成测试可以，deep import 不行。
4. **No cycles**：不允许依赖循环。

**入口，不是 barrel。** 公共表面是*每个*根文件，所以 package 可暴露多个小入口（`index.ts`、`client.ts`、`server.ts`），而非全部汇入巨型 `index.ts`。不推荐重导出整个子树的 barrel；保持入口小，把 implementation 藏在子目录。

Layering（哪些 package 可依赖哪些）是*另一件事*，配置中留了注释 stub，供仓库自行填写。

## Steps

### 1. Detect the environment

- **Package manager**：`pnpm-lock.yaml` → pnpm，`yarn.lock` → yarn，`bun.lockb` → bun，否则 npm。下方全部命令用对应工具（`pnpm`/`yarn`/`npm run`/`bunx`）。
- **Packages root**：存在 `src/` 就用 `src/packages`，否则 `packages`。仓库已有其他明显约定时与用户确认。
- **Existing config**：检查 `.dependency-cruiser.*`。存在时**不覆盖**，合入四条规则和选项，并告诉用户新增了什么。

**完成条件：** 已明确 package manager、packages root 和已有配置情况。

### 2. Install dependency-cruiser

用检测出的 package manager 将 `dependency-cruiser` 安装为 devDependency。

**完成条件：** `dependency-cruiser` 已在 `devDependencies`。

### 3. Write the config

复制 [`dependency-cruiser.config.cjs`](./dependency-cruiser.config.cjs) 到根目录 `.dependency-cruiser.cjs`。将 `PACKAGES_ROOT` 设为步骤 1 检测的根路径。规则按路径深度判断，与扩展名无关，不需其他适配。

**完成条件：** `.dependency-cruiser.cjs` 存在，`PACKAGES_ROOT` 正确，四条禁止规则都在。

### 4. Wire it into the checks

- 添加 `lint:boundaries` 脚本：`depcruise <packages-root>`（或 `depcruise src`）。
- 接入仓库已有、会运行 typecheck 的综合检查命令（例如 `check` / `ci` / `validate`）。**不要**改 `tsconfig` 或添加 path alias。
- 没有综合脚本时添加 `lint:boundaries`，告诉用户将其接入 CI。

**完成条件：** `lint:boundaries` 存在，且与 typecheck 在同一命令中运行。

### 5. Scaffold the example package

创建并 commit `<packages-root>/example/`，作为可复制模板：

- `index.ts` 是入口。导出一个委派内部文件的函数，让 package 显然是 *deep*，而非转发壳。
- `lib/impl.ts`：**子目录**中的内部文件，由 `index.ts` import，外部不可访问。
- `tests/example.test.ts` **只** import `../index`（入口），对公共函数断言。

告诉用户这是可复制或删除的起始模板。

**完成条件：** example package 存在，通过根入口暴露行为，`impl` 隐藏于子目录。

### 6. Prove the rules bite

这是整个 skill 的完成标准：遇到违规却不失败的配置没有价值。

1. 运行 `lint:boundaries`，干净 example 必须**通过**。
2. 临时给 `tests/example.test.ts` 加 deep import（例如 `import { thing } from "../lib/impl"`）。再运行 `lint:boundaries`，必须因 `tests-through-entrypoints` **失败**。
3. 撤回 deep import，再运行一次，必须**通过**。

**完成条件：** 已观察通过、deep import 失败、再次通过。步骤 2 不失败则接线错误，结束前修复。

### 7. Document the convention

在 **packages 文件夹内**写 `README.md`（`<packages-root>/README.md`，位于其管理的 package 旁边），说明 `src/packages/<name>/` 布局（根文件为入口，`lib/` 实现，`tests/` 测试）、“仅通过 package 的根入口文件 import”，以及如何运行 `lint:boundaries`。明确**不推荐 barrel**：暴露多个小入口，不要通过一个 index 重导出整棵子树。只保留复制模板及四条规则，每条一段。

再从仓库 agent 指令文件（优先已有 `CLAUDE.md`，否则 `AGENTS.md`；都没有时创建 `AGENTS.md`）加入 **context pointer**。一行即可，例如 `Packages are deep modules: see [src/packages/README.md](./src/packages/README.md) before adding or importing one.`。让 agent 能发现边界规则，而不是撞上才知道。

**完成条件：** `<packages-root>/README.md` 存在且反对 barrel，仓库 `CLAUDE.md`/`AGENTS.md` 链接它。

## Notes

- 配置的 `$1` 反向引用（dependency-cruiser 分组匹配）允许 package 访问自身内部、同时阻止外部访问。不要拍平成每 package 单独规则。
- 公开或私有按 **depth** 决定：根文件是入口，子目录一律私有。约定子目录 `lib/`（implementation）和 `tests/`，但规则不写死它们；新文件夹无需改配置。添加入口只需增加根文件，不需 barrel。
- package 是 **flat** 的：根目录下只有一级直接子 package。内部可任意嵌套，package 不能包含另一个 package。
- 使用 `.cjs`（不是 `.js`），让 `module.exports` 在 `"type": "module"` 的仓库也能用。
