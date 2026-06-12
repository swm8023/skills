---
name: prototype
description: Build a throwaway prototype to flesh out a design before committing to it. Routes between two branches — a runnable terminal app for state/business-logic questions, or several radically different UI variations toggleable from one route. Use when the user wants to prototype, sanity-check a data model or state machine, mock up a UI, explore design options, or says "prototype this", "let me play with it", "try a few designs".
---

# Prototype

prototype 是**用来回答某个问题的一次性代码**。问题决定了它的形态。

## 选择分支

判断当前要回答的是哪一类问题——从用户的 prompt、周围的代码中识别，或者在用户在场时直接询问：

- **"这套逻辑 / 状态模型感觉对吗？"** → [LOGIC.md](LOGIC.md)。构建一个极小的交互式终端 app，把状态机推到那些在纸上难以推演的 case 中跑一遍。
- **"这东西看起来应该是什么样？"** → [UI.md](UI.md)。在同一个路由上生成若干个差异极大的 UI 变体，通过 URL search param 和一个悬浮的底部栏来切换。

这两个分支产出的工件截然不同——选错会让整个 prototype 白费。如果问题确实模棱两可且用户不在场，则默认选择与周围代码更匹配的那个分支（后端模块 → logic；页面或组件 → UI），并在 prototype 顶部写明这个假设。

## 两个分支共同遵循的规则

1. **从第一天起就是一次性的，并且明确标记为一次性。** 把 prototype 代码放在它实际将被使用的地方附近（紧挨着它正在为之做原型的模块或页面），这样上下文一目了然——但要为它取一个能让任何顺手翻阅的人一眼看出它是 prototype 而非生产代码的名字。对于一次性的 UI 路由，遵循项目已有的路由约定；不要发明新的顶层结构。
2. **一条命令即可运行。** 无论项目现有的 task runner 支持的是什么——`pnpm <name>`、`python <path>`、`bun <path>` 等等。用户必须不假思索就能把它跑起来。
3. **默认不做持久化。** 状态存在内存里。持久化恰恰是 prototype 要 _检验_ 的东西，而不是它应该依赖的东西。如果问题明确涉及数据库，那就连一个临时的 scratch DB 或一个本地文件，并起一个清晰的 "PROTOTYPE — wipe me" 之类的名字。
4. **跳过抛光。** 不写测试、不做超出 _让 prototype 跑得起来_ 所必需的错误处理、不做抽象。重点是快速学到点东西然后把它删掉。
5. **暴露状态。** 在每一个动作之后（logic 分支），或在每一次变体切换时（UI 分支），打印或渲染出完整的相关状态，让用户看清楚发生了什么变化。
6. **完成后删除或吸收。** 当 prototype 已经回答了它要回答的问题之后，要么把它删掉，要么把验证过的决策融入到真实代码中——不要任由它在 repo 里腐烂。

## 完成之后

从一个 prototype 里唯一值得保留的东西是 _答案_。把它连同它所回答的问题一起，记录在某个能持久保存的地方（commit message、ADR、issue，或者紧挨着 prototype 的一个 `NOTES.md`）。如果用户在场，这个记录的过程就是一段简短的对话；如果不在，就留一个占位符，以便他们（或者下一轮的你）在删除 prototype 之前把结论填进去。
