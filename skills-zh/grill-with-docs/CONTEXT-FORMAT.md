# CONTEXT.md 格式

## 结构

```md
# {Context Name}

{One or two sentence description of what this context is and why it exists.}

## Language

**Order**:
{A one or two sentence description of the term}
_Avoid_: Purchase, transaction

**Invoice**:
A request for payment sent to a customer after delivery.
_Avoid_: Bill, payment request

**Customer**:
A person or organization that places orders.
_Avoid_: Client, buyer, account
```

## 规则

- **要有主见。** 当同一概念存在多个词时，挑选最佳的一个，并将其他词列在 `_Avoid_` 下。
- **定义要简洁。** 最多一到两句话。定义它"是什么"，而不是它"做什么"。
- **只收录该项目 context 特有的术语。** 通用编程概念（timeout、错误类型、工具模式）即使项目大量使用也不属于此处。在添加一个术语之前，先问：这是该 context 独有的概念，还是一个通用编程概念？只有前者才属于这里。
- **当出现自然的聚类时，将术语按子标题分组。** 如果所有术语都属于一个内聚的领域，扁平列表也可以。

## 单 context 与多 context 仓库

**单 context（大多数 repo）：** 在 repo 根目录放置一个 `CONTEXT.md`。

**多 context：** 在 repo 根目录放置一个 `CONTEXT-MAP.md`，列出各个 context、它们所在的位置以及它们彼此之间的关系：

```md
# Context Map

## Contexts

- [Ordering](./src/ordering/CONTEXT.md) — receives and tracks customer orders
- [Billing](./src/billing/CONTEXT.md) — generates invoices and processes payments
- [Fulfillment](./src/fulfillment/CONTEXT.md) — manages warehouse picking and shipping

## Relationships

- **Ordering → Fulfillment**: Ordering emits `OrderPlaced` events; Fulfillment consumes them to start picking
- **Fulfillment → Billing**: Fulfillment emits `ShipmentDispatched` events; Billing consumes them to generate invoices
- **Ordering ↔ Billing**: Shared types for `CustomerId` and `Money`
```

该 skill 会推断适用哪种结构：

- 如果存在 `CONTEXT-MAP.md`，则读取它以查找各个 context
- 如果只存在根目录的 `CONTEXT.md`，则视为单 context
- 如果两者都不存在，则在第一个术语被解析时惰性创建一个根目录 `CONTEXT.md`

当存在多个 context 时，推断当前话题与哪一个相关。如果不清楚，则询问。
