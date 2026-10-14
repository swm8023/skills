# Domain Docs

工程 skill 探索代码库时应如何使用本仓库的领域文档。

## Before exploring, read these

- 根目录的 **`GLOSSARY.md`**，或者
- 根目录 **`GLOSSARY-MAP.md`**（若存在）：它指向每个 context 的 `GLOSSARY.md`，阅读与话题有关的各份。
- **`docs/adr/`**：阅读涉及将要工作区域的 ADR。多 context 仓库还要检查 `src/<context>/docs/adr/` 的局部决策。

文件不存在时，**安静继续**。不提示缺失，也不建议预先创建。`/domain-modeling`（由 `/grill-with-docs` 和 `/improve-codebase-architecture` 使用）在术语或决策真正确定时按需创建。

## File structure

单 context 仓库（大多数仓库）：

```
/
├── GLOSSARY.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

多 context 仓库（根目录存在 `GLOSSARY-MAP.md`）：

```
/
├── GLOSSARY-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   ├── GLOSSARY.md
    │   └── docs/adr/                  ← context-specific decisions
    └── billing/
        ├── GLOSSARY.md
        └── docs/adr/
```

## Use the glossary's vocabulary

输出命名领域概念时（issue 标题、重构建议、假设、测试名），使用 `GLOSSARY.md` 定义的术语，不漂移到其中明确避免的同义词。

所需概念尚不在术语表时，这是一条信号：可能在创造项目不使用的语言（重新考虑），也可能真有缺口（记给 `/domain-modeling`）。

## Flag ADR conflicts

输出违背已有 ADR 时，明确指出，而不是静默覆盖：

> _违背 ADR-0007（事件溯源订单），但因……值得重新讨论。_
