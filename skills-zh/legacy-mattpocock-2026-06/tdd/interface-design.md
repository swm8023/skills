# 面向可测试性的 interface 设计

好的 interface 让测试变得自然：

1. **接受依赖，不要自己创建依赖**

   ```typescript
   // 可测试
   function processOrder(order, paymentGateway) {}

   // 难以测试
   function processOrder(order) {
     const gateway = new StripeGateway();
   }
   ```

2. **返回结果，不要产生副作用**

   ```typescript
   // 可测试
   function calculateDiscount(cart): Discount {}

   // 难以测试
   function applyDiscount(cart): void {
     cart.total -= discount;
   }
   ```

3. **小的暴露面**
   - 更少的方法 = 需要写的测试更少
   - 更少的参数 = 测试准备更简单
