---
name: scaffold-exercises
description: 创建包含 section、problem、solution 和 explainer 的练习目录，使其通过 lint。用户希望创建练习结构、练习 stub 或新课程章节时使用。
---

# Scaffold Exercises

创建能通过 `pnpm ai-hero-cli internal lint` 的练习目录，再通过 `git commit` 提交。

## Directory naming

- **Sections**：`exercises/` 下 `XX-section-name/`（例如 `01-retrieval-skill-building`）
- **Exercises**：section 内 `XX.YY-exercise-name/`（例如 `01.03-retrieval-with-bm25`）
- section 编号 = `XX`，exercise 编号 = `XX.YY`
- 名称使用 dash-case（小写加连字符）

## Exercise variants

每个 exercise 至少有以下一个子目录：

- `problem/`：含 TODO 的学生 workspace
- `solution/`：参考 implementation
- `explainer/`：概念材料，无 TODO

创建 stub 时，plan 未另行指定则默认 `explainer/`。

## Required files

每个子目录（`problem/`、`solution/`、`explainer/`）需要一份 `readme.md`，要求：

- **非空**，必须有实际内容，仅一行标题也可以
- 没有失效链接

stub 创建最小 readme，包含标题和描述：

```md
# Exercise Title

Description here
```

子目录有代码时，还需要 `main.ts`（超过一行）。但 stub 仅 readme 也可以。

## Workflow

1. **Parse the plan**：提取 section 名、exercise 名和 variant 类型
2. **创建目录**：每个路径使用 `mkdir -p`
3. **创建 stub readme**：每 variant 目录一份带标题的 `readme.md`
4. **运行 lint**：`pnpm ai-hero-cli internal lint` 验证
5. **修复错误**：迭代到 lint 通过

## Lint rules summary

linter（`pnpm ai-hero-cli internal lint`）检查：

- 每个 exercise 有子目录（`problem/`、`solution/`、`explainer/`）
- 至少存在 `problem/`、`explainer/`、`explainer.1/` 之一
- 主要子目录有非空 `readme.md`
- 没有 `.gitkeep`
- 没有 `speaker-notes.md`
- readme 没有失效链接
- readme 没有 `pnpm run exercise` 命令
- 除 readme-only 外，每个子目录都需要 `main.ts`

## Moving/renaming exercises

重新编号或移动 exercise 时：

1. 用 `git mv`（不是 `mv`）重命名目录，保留 Git 历史
2. 更新数字前缀以保持顺序
3. 移动后重跑 lint

示例：

```bash
git mv exercises/01-retrieval/01.03-embeddings exercises/01-retrieval/01.04-embeddings
```

## Example: stubbing from a plan

给定以下 plan：

```
Section 05: Memory Skill Building
- 05.01 Introduction to Memory
- 05.02 Short-term Memory (explainer + problem + solution)
- 05.03 Long-term Memory
```

创建：

```bash
mkdir -p exercises/05-memory-skill-building/05.01-introduction-to-memory/explainer
mkdir -p exercises/05-memory-skill-building/05.02-short-term-memory/{explainer,problem,solution}
mkdir -p exercises/05-memory-skill-building/05.03-long-term-memory/explainer
```

然后创建 readme stub：

```
exercises/05-memory-skill-building/05.01-introduction-to-memory/explainer/readme.md -> "# Introduction to Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/explainer/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/problem/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/solution/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.03-long-term-memory/explainer/readme.md -> "# Long-term Memory"
```
