---
name: migrate-to-shoehorn
description: 将测试文件中的 `as` 类型断言迁移到 @total-typescript/shoehorn。用户提及 shoehorn、希望替换测试的 `as`，或需要不完整测试数据时使用。
---

# Migrate to Shoehorn

## Why shoehorn?

`shoehorn` 允许测试传入部分数据，同时保持 TypeScript 类型检查通过。它用类型安全替代方式取代 `as` 断言。

**只用于测试代码。** 生产代码永远不使用 shoehorn。

测试中 `as` 的问题：

- 被训练为不应使用它
- 必须手动指定目标类型
- 故意错误的数据需要 double-as（`as unknown as Type`）

## Install

```bash
npm i @total-typescript/shoehorn
```

## Migration patterns

### Large objects with few needed properties

迁移前：

```ts
type Request = {
  body: { id: string };
  headers: Record<string, string>;
  cookies: Record<string, string>;
  // ...20 more properties
};

it("gets user by id", () => {
  // Only care about body.id but must fake entire Request
  getUser({
    body: { id: "123" },
    headers: {},
    cookies: {},
    // ...fake all 20 properties
  });
});
```

迁移后：

```ts
import { fromPartial } from "@total-typescript/shoehorn";

it("gets user by id", () => {
  getUser(
    fromPartial({
      body: { id: "123" },
    }),
  );
});
```

### `as Type` → `fromPartial()`

迁移前：

```ts
getUser({ body: { id: "123" } } as Request);
```

迁移后：

```ts
import { fromPartial } from "@total-typescript/shoehorn";

getUser(fromPartial({ body: { id: "123" } }));
```

### `as unknown as Type` → `fromAny()`

迁移前：

```ts
getUser({ body: { id: 123 } } as unknown as Request); // wrong type on purpose
```

迁移后：

```ts
import { fromAny } from "@total-typescript/shoehorn";

getUser(fromAny({ body: { id: 123 } }));
```

## When to use each

| 函数 | 用途 |
| --------------- | -------------------------------------------------- |
| `fromPartial()` | 传入部分数据，仍保持类型检查 |
| `fromAny()` | 传入故意错误的数据，保留自动补全 |
| `fromExact()` | 强制完整对象，以后可换 fromPartial |

## Workflow

1. **Gather requirements**，询问：
   - 哪些测试文件的 `as` 断言造成问题？
   - 是否是只关心少量字段的大对象？
   - 是否需要为错误测试故意传入错误数据？

2. **安装并迁移**：
   - [ ] 安装：`npm i @total-typescript/shoehorn`
   - [ ] 查找有 `as` 断言的测试：`grep -r " as [A-Z]" --include="*.test.ts" --include="*.spec.ts"`
   - [ ] 将 `as Type` 替换为 `fromPartial()`
   - [ ] 将 `as unknown as Type` 替换为 `fromAny()`
   - [ ] 添加 `@total-typescript/shoehorn` import
   - [ ] 运行类型检查验证
