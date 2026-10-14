# Deepening

如何根据依赖安全加深一簇 shallow module。假定你已了解 [SKILL.md](SKILL.md) 中的词汇：**module**、**interface**、**seam**、**adapter**。

## Dependency categories

评估加深候选项时，对依赖分类。类别决定如何跨 seam 测试加深后的 module。

### 1. In-process

纯计算、内存状态，无 I/O。总能加深：合并 module，直接通过新 interface 测试。不需要 adapter。

### 2. Local-substitutable

拥有本地测试替身的依赖（Postgres 使用 PGLite、内存文件系统）。如果有替身，就能加深。测试套件运行替身来测试加深后的 module。seam 位于内部；module 的 external interface 不需要 port。

### 3. Remote but owned (Ports & Adapters)

跨网络边界的自有服务（微服务、内部 API）。在 seam 上定义 **port**（interface）。deep module 拥有逻辑，传输机制以 **adapter** 注入。测试使用内存 adapter，生产使用 HTTP/gRPC/队列 adapter。

推荐表达：*“在 seam 上定义 port，实现生产用 HTTP adapter 和测试用内存 adapter，让逻辑位于同一个 deep module，即使它跨网络部署。”*

### 4. True external (Mock)

你无法控制的第三方服务（Stripe、Twilio 等）。加深后的 module 将外部依赖作为 port 注入；测试提供 mock adapter。

## Seam discipline

- **一个 adapter 意味着假设的 seam，两个 adapter 才意味着真实的 seam。** 除非至少两个 adapter 有充分理由（通常是生产与测试），否则不要引入 port。只有一个 adapter 的 seam 只是间接层。
- **Internal seam 与 external seam。** deep module 可以同时拥有 internal seam（implementation 私有，供自身测试使用）和 interface 的 external seam。不要仅因为测试使用 internal seam，就通过 interface 暴露它。

## Testing strategy: replace, don't layer

- 一旦 deep module interface 的测试存在，原 shallow module 的单元测试就成了负担；删除它们。
- 在加深后的 module interface 上编写新测试。**interface 就是测试面**。
- 测试通过 interface 断言可观察结果，而不是内部状态。
- 测试描述行为而不是 implementation，因此应该经受内部重构。如果 implementation 改变时必须改测试，它就在测试 interface 之后的内部。
