# UI Prototype

在单一路由生成 **几个根本不同的 UI 变体**，通过底部悬浮栏切换。用户在浏览器中切换、选一个（或各取部分），再舍弃其余。

问题如果是 logic/state，而不是外观，本分支不适用。使用 [LOGIC.md](LOGIC.md)。

## When this is the right shape

- “这个页面应该长什么样？”
- “确定之前，我想看看 dashboard 的几个方案。”
- “给设置页面试一种不同布局。”
- 任何用户原本会花一天在脑海中三个模糊 mockup 之间选择的情况。

## Two sub-shapes: strongly prefer sub-shape A

UI prototype **与 app 的其他部分放在一起**时更容易判断：真实 header、sidebar、数据和密度。单独临时路由是空环境，每个变体独立看都不错。有合理现有页面能承载时，默认子形状 A；只有 prototype 确实没有邻近位置时，才用 B。

### Sub-shape A: adjustment to an existing page (preferred)

路由已经存在。变体渲染在 **同一路由**，由 `?variant=` URL search param 控制。保留现有数据获取、参数和认证，仅切换渲染。这是默认做法，除非有明确理由。

如果 prototype 没有自己的页面，但*自然会放在已有页面内部*（dashboard 的新区块、设置页的新卡片、现有流程的新步骤），仍用 A，把变体挂在宿主页面内。

### Sub-shape B: a new page (last resort)

只有被模拟的内容确实无法放进已有页面时才使用（例如全新的顶层界面，或不能合理嵌入任何位置的流程）。

按项目既有路由约定创建 **throwaway route**，不另造顶层结构。命名应显然是 prototype（例如路径或文件名含 `prototype`）。同样使用 `?variant=` 模式。

选 B 前再次检查：真的没有可嵌入的现有页面吗？空路由会隐藏完整页面本能暴露的设计问题。

两个子形状的底部悬浮栏完全相同。

## Process

### 1. State the question and pick N

默认 **3 个变体**。超过 5 个就不再是根本不同，而会成为噪声，所以最多 5 个。

在 prototype 所在位置或文件顶部注释中，用一行写下计划：

> “设置页面三个变体，在现有 `/settings` 路由通过 `?variant=` 切换。”

不论用户是否在场提出异议，这都有效。

### 2. Generate radically different variants

起草各变体。每个都应满足：

- 页面的目的和可访问数据。
- 项目组件库 / 样式系统（TailwindCSS、shadcn、MUI、纯 CSS 等）。
- 清楚的导出组件名称，例如 `VariantA`、`VariantB`、`VariantC`。

变体必须 **结构不同**：布局、信息层级和主要操作入口不同，不只是颜色不同。三个轻微改动的卡片网格不是 UI prototype，只是换壁纸。若两个草稿太像，明确要求“不使用卡片网格”，重做其中一个。

### 3. Wire them together

在路由上创建单个 switcher 组件：

```tsx
// pseudo-code, adapt to the project's framework
const variant = searchParams.get('variant') ?? 'A';
return (
  <>
    {variant === 'A' && <VariantA {...data} />}
    {variant === 'B' && <VariantB {...data} />}
    {variant === 'C' && <VariantC {...data} />}
    <PrototypeSwitcher variants={['A','B','C']} current={variant} />
  </>
);
```

子形状 A（现有页面）：保留 switcher 上方全部现有数据获取；每个变体只改变渲染子树。

子形状 B（新页面）：`/prototype/<name>` 下的临时路由挂载同一个 switcher。

### 4. Build the floating switcher

屏幕底部居中的小型固定栏，包含三部分：

- **左箭头**：循环切到前一个变体。
- **变体标签**：显示当前变体 key；若导出名称，也显示名称，例如 `B (Sidebar layout)`。
- **右箭头**：循环切到后一个变体。

行为：

- 点击箭头更新 URL search param（使用 framework router，例如 Next 的 `router.replace`、React Router 的 `navigate`），让变体可分享、刷新后稳定。
- 键盘：`←` 和 `→` 也能切换。焦点在 `<input>`、`<textarea>` 或 `[contenteditable]` 时，不拦截方向键。
- 视觉上与页面区分（例如高对比胶囊、轻微阴影），清楚表明它不是被评估设计的一部分。
- 生产构建隐藏：使用 `process.env.NODE_ENV !== 'production'` 或等效判断，避免意外合并 prototype 后把控制栏发布给用户。

把 switcher 放在单个共享组件中，让两个子形状复用。放到项目的共享 UI 位置。

### 5. Hand it over

展示 URL（以及 `?variant=` key）。用户有空会切换探索。最有用的反馈通常是 **“我想要 B 的 header 配 C 的 sidebar”**，那才是实际想要的设计。

### 6. Capture the answer and clean up

一个变体胜出后，保存答案（哪个变体及原因），再按 [SKILL](SKILL.md) 保存 prototype。将胜者融入真实代码，其余移到临时 branch，而不是 main：

- **子形状 A**：将胜者融入现有页面，从 main 移除失败变体和 switcher。
- **子形状 B**：将胜者升级为真实路由，从 main 移除临时路由和 switcher。

完整变体集是一手证据，应进入临时 branch 而非垃圾桶。留在 main 的变体组件和 switcher 会很快腐化，困扰后续读者。

## Anti-patterns

- **只改变颜色或文案的变体。** 那是微调，不是 prototype。真正的变体在结构上有分歧。
- **变体共享过多代码。** 共享 `<Header>` 可以，共享 `<Layout>` 会破坏目的。每个变体应能自由抛弃布局。
- **把变体接到真实 mutation。** 只读 prototype 可以。需要 mutation 时连接 stub：问题是“应该长什么样”，不是“后端是否正常”。
- **直接把 prototype 提升到生产。** 变体代码按 prototype 约束编写（无测试、最小错误处理）。正式融入时应重新认真编写。
