# When to Mock

只在 **system boundary** 上 mock：

- 外部 API（支付、邮件等）
- 数据库（有时可以，但优先使用测试数据库）
- 时间与随机性
- 文件系统（有时可以）

不要 mock：

- 自己的类或模块
- 内部协作者
- 任何由你控制的东西

## Designing for Mockability

在系统边界上，设计易于 mock 的接口：

**1. 使用依赖注入**

传入外部依赖，而不是在内部创建：

```typescript
// Easy to mock
function processPayment(order, paymentClient) {
  return paymentClient.charge(order.total);
}

// Hard to mock
function processPayment(order) {
  const client = new StripeClient(process.env.STRIPE_KEY);
  return client.charge(order.total);
}
```

**2. 优先使用 SDK 风格接口，而不是通用 fetcher**

为每项外部操作创建具体函数，而不是一个带条件逻辑的通用函数：

```typescript
// GOOD: Each function is independently mockable
const api = {
  getUser: (id) => fetch(`/users/${id}`),
  getOrders: (userId) => fetch(`/users/${userId}/orders`),
  createOrder: (data) => fetch('/orders', { method: 'POST', body: data }),
};

// BAD: Mocking requires conditional logic inside the mock
const api = {
  fetch: (endpoint, options) => fetch(endpoint, options),
};
```

SDK 方式意味着：
- 每个 mock 只返回一种明确的数据形状
- 测试准备不需要条件逻辑
- 更容易看出测试覆盖了哪些 endpoint
- 每个 endpoint 都有类型安全保障
