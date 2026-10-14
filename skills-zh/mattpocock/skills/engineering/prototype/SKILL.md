---
name: prototype
description: 构建用完即弃的 prototype 来回答设计问题。当用户希望验证状态模型或逻辑是否合理，或探索 UI 应该是什么样子时使用。
---

# Prototype

prototype 是 **回答一个问题的临时代码**。问题决定它的形状。

## Pick a branch

根据用户 prompt、周围代码，或在用户在线时直接询问，确定要回答哪个问题：

- **“这套逻辑 / 状态模型合理吗？”** → [LOGIC.md](LOGIC.md)。构建一份可分享 HTML 文件（自由操作按钮和标签页引导步骤），推动状态机走过纸上难以推演的场景，让非开发者也能操作。
- **“它应该长什么样？”** → [UI.md](UI.md)。在同一路由生成几个根本不同的 UI 变体，通过 URL search param 和底部悬浮栏切换。

两个分支产物差别很大，选错就浪费整个 prototype。如果问题确实有歧义且无法联系用户，默认选更符合周围代码的分支（后端 module → logic；页面或组件 → UI），并在 prototype 顶部说明假设。

## Rules that apply to both

1. **从第一天就是临时代码，并明确标记。** 放在未来实际使用位置附近（所模拟 module 或页面旁边），使背景清楚；命名让普通读者也知道这是 prototype 而非生产代码。临时 UI 路由遵循项目既有路由约定，不另造顶层结构。
2. **运行简单。** UI prototype 从项目 task runner 的一个命令启动：`pnpm <name>`、`python <path>`、`bun <path>` 等。逻辑 demo 是用户双击即可打开的单个 HTML 文件。两者都无需思考如何启动。
3. **默认不持久化。** 状态保存在内存中。持久化是 prototype _验证的内容_，不应成为它的依赖。如果问题明确涉及数据库，使用临时 DB 或名称清楚标有“PROTOTYPE, wipe me”的本地文件。
4. **跳过打磨。** 不写测试，错误处理只做到_能运行_，不做抽象。目的是快速学到东西。
5. **展示状态。** 每次动作（logic）或切换变体（UI）后，打印或渲染全部相关状态，让用户看到变化。
6. **完成后保存证据。** 把验证后的决策融入真实代码，再把 prototype 自身保存为 **primary source**：commit 到 main 之外的临时 branch，并在 implementation issue 留下指向该 branch 的 context pointer。也把答案（结论及其回答的问题）记录在 issue 或 commit。main 只保留验证后的决策。
