# Lesson Learned

从近期的代码变更中提炼 software engineering 经验。

## Purpose

大多数 developer 交付代码后就继续前进。但成长最快的方法，是停下来反思：我刚才应用了什么原则？做了什么取舍？我会怎样换一种做法？

这个 skill 分析近期的 git history，揭示你刚完成的工作中蕴含的 engineering lesson。

## When to Use

- 完成一个 feature 或 PR 后
- 完成一次 debugging session 后
- 完成一次 refactor 后
- 希望复盘近期工作时
- 触发短语："what is the lesson here?"、"what can I learn from this?"、"engineering takeaway"

## How It Works

1. **确定范围** -- 检测你当前位于 feature branch（分析 branch 与 main 的差异）还是 main（分析最近 5 次 commit）。你也可以指定 commit 范围或具体 SHA。
2. **收集变更** -- 读取 git log、diff 和 commit message。diff 较大时，选择性读取变更最多的文件。
3. **分析模式** -- 识别结构决策、取舍和已解决的问题。将观察结果对应到有名称的 SE principles。
4. **呈现经验** -- 给出 1-3 条具体、有代码依据的经验，包含 principle 名称、它如何体现、为什么重要，以及一个可执行的下一步。

## Key Features

- **由 Git history 驱动** -- 根据实际代码变更分析，而非假想情况
- **以 principle 为依据** -- 将观察结果对应到有名称的 SE principles（SOLID、DRY、KISS、YAGNI 等）
- **具体，而非泛泛而谈** -- 每个见解都引用 diff 中的实际文件与行
- **保持平衡** -- 既指出可改进之处，也识别良好的模式
- **可配置范围** -- feature branch、最近 N 次 commit、特定 SHA 或 working changes

## Output Format

```markdown
## Lesson: Separation of Concerns

**代码中发生了什么：**
`AuthController` 被拆成 `AuthController` 和 `UserService`，对应
commit abc123 和 def456。authentication logic 留在 controller 中，而
用户的 CRUD 操作移入专门的 service。

**体现的 principle：**
Separation of Concerns -- 不同职责应放在不同的
module 中，使它们能够各自独立变化。

**为什么重要：**
拆分前，user management 的任何变化都可能破坏 authentication。
现在各个 module 可以独立演进，彼此之间有清楚的 interface。

**下次可应用的经验：**
当一个文件处理两种不同的职责时，应尽早拆分；这比
以后再将二者解开成本更低。
```

## Prerequisites

- 必须位于具有 commit history 的 git repository 中
- commit message 具有描述性时，效果最好

## Related Files

- `references/se-principles.md` -- 精选的 SE principles 目录
- `references/anti-patterns.md` -- 在 diff 中检测的常见 anti-patterns
