# 深化（Deepening）

如何在考虑依赖的前提下，安全地深化一组浅 module。假定你已熟悉 [LANGUAGE.md](LANGUAGE.md) 中的术语 —— **module**、**interface**、**seam**、**adapter**。

## 依赖分类

在评估一个深化候选时，先对它的依赖进行分类。类别决定了深化后的 module 如何跨 seam 进行测试。

### 1. 进程内（In-process）

纯计算、内存状态、无 I/O。永远可深化 —— 合并 module 并直接通过新 interface 进行测试。不需要 adapter。

### 2. 本地可替代（Local-substitutable）

存在本地测试替身的依赖（用 PGLite 替代 Postgres、用内存 filesystem 替代真实文件系统）。如果替身存在则可深化。深化后的 module 在测试套件中以替身运行的方式被测试。该 seam 是内部的；module 的对外 interface 上不暴露 port。

### 3. 远程但自有（Ports & Adapters）

你自己的服务横跨网络边界（microservices、内部 API）。在 seam 处定义一个 **port**（interface）。深 module 拥有逻辑；transport 作为 **adapter** 被注入。测试使用内存 adapter。生产使用 HTTP/gRPC/queue adapter。

推荐表述形式：*"在 seam 处定义一个 port，为生产实现一个 HTTP adapter，为测试实现一个内存 adapter，这样即便逻辑跨网络部署，它仍然位于一个深 module 中。"*

### 4. 真正的外部（Mock）

你无法控制的第三方服务（Stripe、Twilio 等）。深化后的 module 把外部依赖作为注入的 port 接收；测试提供 mock adapter。

## Seam 纪律

- **一个 adapter 意味着假想的 seam。两个 adapter 才意味着真实的 seam。** 除非至少有两个 adapter 是合理的（通常是生产 + 测试），否则不要引入 port。只有单个 adapter 的 seam 不过是一层间接。
- **内部 seam 与外部 seam。** 一个深 module 既可以有内部 seam（私有于其实现，被其自身测试使用），也可以在其 interface 处有外部 seam。不要仅仅因为测试用到内部 seam 就把它通过 interface 暴露出来。

## 测试策略：替换，而非叠加

- 一旦在深化 module 的 interface 层面已经有了测试，针对浅 module 的旧 unit 测试就成了冗余 —— 删掉它们。
- 在深化 module 的 interface 处编写新的测试。**interface 就是测试面（test surface）**。
- 测试应通过 interface 断言可观察的结果，而不是内部状态。
- 测试应当能够在内部 refactor 之后依然存活 —— 它们描述行为，而非实现。如果一个测试在实现改变时也必须改变，那它就测试到了 interface 之外。
