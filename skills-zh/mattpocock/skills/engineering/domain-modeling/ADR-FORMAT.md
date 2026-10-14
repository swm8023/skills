# ADR Format

ADR 放在 `docs/adr/`，使用递增编号：`0001-slug.md`、`0002-slug.md` 等。

按需创建 `docs/adr/`：在需要第一个 ADR 时才创建。

## Template

```md
# {Short title of the decision}

{1-3 sentences: what's the context, what did we decide, and why.}
```

仅此而已。ADR 可以只有一段。价值在于记录*作出了*决策以及*原因*，而不是填满各个章节。

## Optional sections

只有确实增加价值时才包含这些内容。大多数 ADR 不需要。

- **Status** frontmatter（`proposed | accepted | deprecated | superseded by ADR-NNNN`）：重新考虑决策时有用
- **Considered Options**：仅在被否决的替代方案值得记住时使用
- **Consequences**：仅在需要指出不明显的下游影响时使用

## Numbering

扫描 `docs/adr/`，找到现有最大编号并加一。

## When to offer an ADR

以下三项必须同时成立：

1. **难以逆转**：以后改变主意有实质成本
2. **没有背景会令人意外**：未来读者看到代码会问“到底为什么这样做？”
3. **真实权衡的结果**：确实有替代方案，而你因具体理由选了一个

决策易于逆转就跳过，因为可以直接改回去；不令人意外，就没人会问原因；没有真实替代方案，就只有“我们采取了显而易见的做法”，无需额外记录。

### What qualifies

- **架构形状。** “我们使用 monorepo。”“write model 使用事件溯源，read model 投影到 Postgres。”
- **context 之间的集成模式。** “Ordering 和 Billing 通过 domain event 通信，而不是同步 HTTP。”
- **带来锁定效应的技术选择。** 数据库、message bus、认证提供方、部署目标。不是每个库，只记录那些替换需要一个季度的。
- **边界与 scope 决策。** “Customer 数据归 Customer context 所有，其他 context 只能按 ID 引用。”明确排除的内容和允许的内容同样有价值。
- **有意偏离常规路径。** “因为 X，我们用手写 SQL 而不用 ORM。”任何理性读者会自然作出相反假设的地方。这样下一位工程师不会把有意的设计‘修复’掉。
- **代码中看不到的约束。** “由于合规要求，不能使用 AWS。”“由于伙伴 API 契约，响应必须小于 200ms。”
- **原因不明显的被否决方案。** 如果因细微原因考虑 GraphQL 后选了 REST，就记录下来；否则半年后又会有人建议 GraphQL。
