# Lesson Learned

从最近的代码变更中提炼软件工程经验。

## Purpose

许多开发者交付代码后就继续下一项工作。但快速成长的方法，是停下来复盘：刚才应用了什么原则？做了什么取舍？下次会有什么不同？

这个 skill 分析近期 git 历史，找出刚完成的工作中蕴含的工程经验。

## When to Use

- 完成一个功能或 PR 后
- 完成一轮调试后
- 完成一次重构后
- 希望复盘近期工作时
- 触发短语："what is the lesson here?"、"what can I learn from this?"、"engineering takeaway"

## How It Works

1. **确定范围** -- 判断当前位于 feature branch（比较当前分支与 main）还是 main（分析最近 5 次 commit）。也可以指定 commit 范围或具体 SHA。
2. **收集变更** -- 读取 git log、diff 和 commit message。diff 较大时，选择性读取变更最多的文件。
3. **分析模式** -- 识别结构决策、取舍和已解决的问题，将观察结果对应到具体的软件工程原则。
4. **呈现经验** -- 给出 1–3 条有实际代码依据的具体经验，说明原则名称、在代码中的体现、价值，以及可执行的下一步。

## Key Features

- **由 Git 历史驱动** -- 根据真实代码变更分析，而非假设情形
- **以原则为依据** -- 将观察对应到具体的软件工程原则（SOLID、DRY、KISS、YAGNI 等）
- **具体而非泛泛而谈** -- 每个观点都引用 diff 中的实际文件与行号
- **保持平衡** -- 既指出可改进之处，也识别良好的模式
- **范围可配置** -- feature branch、最近 N 次 commit、特定 SHA 或工作区变更

## Output Format

```markdown
## Lesson: Separation of Concerns

**What happened in the code:**
The `AuthController` was split into `AuthController` and `UserService` across
commits abc123 and def456. Authentication logic stayed in the controller while
user CRUD operations moved to a dedicated service.

**The principle at work:**
Separation of Concerns -- different responsibilities should live in different
modules so each can change independently.

**Why it matters:**
Before the split, any change to user management risked breaking authentication.
Now each module can evolve independently with a clear interface between them.

**Takeaway for next time:**
When a file handles two distinct responsibilities, split early -- it's cheaper
than untangling them later.
```

## Prerequisites

- 必须位于具有 commit 历史的 git 仓库中
- commit message 越能说明意图，效果越好

## Related Files

- `references/se-principles.md` -- 精选的软件工程原则目录
- `references/anti-patterns.md` -- 在 diff 中识别的常见反模式
