# GLOSSARY.md Format

## Structure

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

## Rules

- **明确取舍。** 同一概念有多个词时，选最合适的，其余列入 `_Avoid_`。
- **定义紧凑。** 最多一两句话。定义它是什么，而不是它做什么。
- **只包含本项目 context 特有的术语。** 通用编程概念（timeout、错误类型、工具模式）不属于这里，即使项目大量使用它们。添加术语前问：它是此 context 独有的概念，还是通用编程概念？只有前者应该进入。
- 形成自然分组时，**用小标题组织术语**。若所有术语都属于一个紧密领域，平铺列表也可以。

## Single vs multi-context repos

**单 context（大多数仓库）：** 仓库根目录一份 `GLOSSARY.md`。

**多 context：** 仓库根目录的 `GLOSSARY-MAP.md` 列出各 context、位置及相互关系：

```md
# Glossary Map

## Contexts

- [Ordering](./src/ordering/GLOSSARY.md): receives and tracks customer orders
- [Billing](./src/billing/GLOSSARY.md): generates invoices and processes payments
- [Fulfillment](./src/fulfillment/GLOSSARY.md): manages warehouse picking and shipping

## Relationships

- **Ordering → Fulfillment**: Ordering emits `OrderPlaced` events; Fulfillment consumes them to start picking
- **Fulfillment → Billing**: Fulfillment emits `ShipmentDispatched` events; Billing consumes them to generate invoices
- **Ordering ↔ Billing**: Shared types for `CustomerId` and `Money`
```

skill 自行推断适用结构：

- 存在 `GLOSSARY-MAP.md` 时，阅读它寻找 context
- 只有根目录 `GLOSSARY.md` 时，采用单 context
- 两者都没有时，在第一个术语确定后按需创建根目录 `GLOSSARY.md`

存在多个 context 时，推断当前话题属于哪个；不明确就询问。
