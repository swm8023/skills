---
name: domain-modeling
description: 建立并打磨项目的 domain model。在讨论代码库术语、编写或编辑 GLOSSARY.md，以及记录或编辑 ADR 时使用。
---

# Domain Modeling

设计过程中主动建立并打磨项目的 domain model。这是*主动*实践：挑战术语、构造边界场景，并在术语和决策明确的当下记录它们。（仅为了解词汇而*阅读* `GLOSSARY.md` 不属于本 skill：这是任何 skill 都能做到的一行习惯。本 skill 用于改变 model，而不只是使用它。）

## File structure

大多数仓库只有一个 context：

```
/
├── GLOSSARY.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

如果根目录存在 `GLOSSARY-MAP.md`，仓库就有多个 context。这份 map 指向各个 context 所在的位置：

```
/
├── GLOSSARY-MAP.md
├── docs/
│   └── adr/                          ← system-wide decisions
├── src/
│   ├── ordering/
│   │   ├── GLOSSARY.md
│   │   └── docs/adr/                 ← context-specific decisions
│   └── billing/
│       ├── GLOSSARY.md
│       └── docs/adr/
```

按需创建文件：有内容可写才创建。如果没有 `GLOSSARY.md`，在第一个术语确定时创建；如果没有 `docs/adr/`，在需要第一个 ADR 时创建。

## During the session

### Challenge against the glossary

用户使用的术语与 `GLOSSARY.md` 中既有语言冲突时，立即指出：“你的术语表将 'cancellation' 定义为 X，但你似乎指 Y。究竟是哪一个？”

### Sharpen fuzzy language

用户使用含糊或重载术语时，提出精确的规范术语：“你说 'account'，指 Customer 还是 User？它们是不同的东西。”

### Discuss concrete scenarios

讨论领域关系时，用具体场景进行压力测试。构造探查边界的场景，要求用户明确概念之间的界限。

### Cross-reference with code

用户说明某事如何运行时，检查代码是否一致。发现矛盾就指出：“代码取消的是整个 Order，但你刚说可以部分取消。哪个是正确的？”

### Update GLOSSARY.md inline

术语确定时立即更新 `GLOSSARY.md`，不要攒到最后：发生时就记录。使用 [GLOSSARY-FORMAT.md](./GLOSSARY-FORMAT.md) 的格式。

`GLOSSARY.md` 应完全不含 implementation 细节。不要把 `GLOSSARY.md` 当 spec、草稿或 implementation 决策仓库。它只能是术语表。

### Offer ADRs sparingly

只有同时满足以下三项时，才提出创建 ADR：

1. **难以逆转**：以后改变主意有实质成本
2. **没有背景会令人意外**：未来读者会问“为什么这样做？”
3. **真实权衡的结果**：确实存在替代方案，而你因具体理由选了一个

任何一项不满足，就跳过 ADR。使用 [ADR-FORMAT.md](./ADR-FORMAT.md) 的格式。
