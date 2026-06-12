# 领域文档

工程类 skill 在探索代码库时，应如何使用本 repo 的领域文档。

## 探索之前，先读这些

- **`CONTEXT.md`**，位于 repo 根目录，或者
- **`CONTEXT-MAP.md`**，位于 repo 根目录（如果存在）——它会指向每个 context 各自的一份 `CONTEXT.md`。把所有与当前话题相关的都读一遍。
- **`docs/adr/`** —— 阅读那些涉及你即将动手区域的 ADR。在多 context 的 repo 中，也要检查 `src/<context>/docs/adr/`，那里放着 context 范围内的决策。

如果这些文件中有任何一个不存在，**静默继续**。不要标注它们的缺失；不要一上来就建议创建它们。生产者 skill（`/grill-with-docs`）会在术语或决策真正落定时按需懒创建它们。

## 文件结构

单 context 的 repo（大多数 repo）：

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

多 context 的 repo（根目录存在 `CONTEXT-MAP.md`）：

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← 系统级决策
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← context 专属决策
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## 使用术语表的词汇

当你的输出中出现某个领域概念（在 issue 标题、重构提案、假设、测试名称里），请使用 `CONTEXT.md` 中定义的术语。不要漂移到术语表明确避免的同义词上。

如果你需要的概念还不在术语表里，这是一个信号 —— 要么你在为项目并不使用的事物发明语言（请重新考虑），要么这里存在真正的空缺（记录下来交给 `/grill-with-docs`）。

## 标记 ADR 冲突

如果你的输出与既有 ADR 矛盾，请显式地把它揭示出来，而不是默默地覆盖：

> _与 ADR-0007（event-sourced orders）矛盾 —— 但值得重新讨论，因为……_
