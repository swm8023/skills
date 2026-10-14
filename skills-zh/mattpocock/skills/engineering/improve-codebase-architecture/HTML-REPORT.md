# HTML Report Format

架构 review 渲染为操作系统临时目录的单个自包含 HTML 文件。Tailwind 和 Mermaid 都来自 CDN。Mermaid 可靠处理图结构；手写 div 和内联 SVG 处理编辑式视觉（体量图、剖面）。混用两者，不要全靠 Mermaid，否则会显得模板化。

## Scaffold

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Architecture review for {{repo name}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      mermaid.initialize({ startOnLoad: true, theme: "neutral", securityLevel: "loose" });
    </script>
    <style>
      /* small custom layer for things Tailwind doesn't cover cleanly:
         dashed seam lines, hand-drawn-feeling arrow heads, etc. */
      .seam { stroke-dasharray: 4 4; }
      .leak { stroke: #dc2626; }
      .deep { background: linear-gradient(135deg, #0f172a, #1e293b); }
    </style>
  </head>
  <body class="bg-stone-50 text-slate-900 font-sans">
    <main class="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <header>...</header>
      <section id="candidates" class="space-y-10">...</section>
      <section id="top-recommendation">...</section>
    </main>
  </body>
</html>
```

## Header

仓库名称、日期及简短图例：实线框 = module，虚线 = seam，红箭头 = 泄漏，粗深色框 = deep module。不写介绍段，直接进入候选项。

## Candidate card

图承担主要表达。文字稀少、平实，直接使用 `/codebase-design` skill 的术语表词汇。

每个候选项是一个 `<article>`：

- **Title**：简短，说明加深动作（例如“合并 Order intake pipeline”）。
- **Badge row**：推荐强度（`Strong` = emerald，`Worth exploring` = amber，`Speculative` = slate），以及依赖类别标签（`in-process`、`local-substitutable`、`ports & adapters`、`mock`）。
- **Files**：等宽列表，`font-mono text-sm`。
- **Before / After diagram**：中心内容，双列并排。参见下方模式。
- **Problem**：一句话，说清痛点。
- **Solution**：一句话，说清改变。
- **Wins**：列表，每项不超过 6 词，例如“测试只触达一个 interface”“Pricing 逻辑停止泄漏”“删除 4 个 shallow wrapper”。
- **ADR callout**（若适用）：浅 amber 框内的一行。

不写解释长段落。如果图需要一段话才能理解，重画图。

## Diagram patterns

选择符合候选项的模式，混合使用。不要所有图都一样；多样性也是目标。

### Mermaid graph (the workhorse for dependencies / call flow)

重点是“X 调 Y 再调 Z，看看有多乱”时，使用 Mermaid `flowchart` 或 `graph`。包在 Tailwind 卡片里，避免突兀。用 classDef 将泄漏边标红、deep module 标深色。表达“之前 6 次往返，之后 1 次”时，时序图很好用。

```html
<div class="rounded-lg border border-slate-200 bg-white p-4">
  <pre class="mermaid">
    flowchart LR
      A[OrderHandler] --> B[OrderValidator]
      B --> C[OrderRepo]
      C -.leak.-> D[PricingClient]
      classDef leak stroke:#dc2626,stroke-width:2px;
      class C,D leak
  </pre>
</div>
```

### Hand-built boxes-and-arrows (when Mermaid's layout fights you)

module 用带边框和标签的 `<div>`；箭头用绝对定位在相对容器上的内联 SVG `<line>` 或 `<path>`。希望 after 图是粗边框 deep module、内部灰显时使用，因为 Mermaid 无法呈现合适视觉重量。

### Cross-section (good for layered shallowness)

叠放横带（`h-12 border-l-4`）展示一次调用穿过的层。Before：6 个无实质作用的薄层。After：一个粗带，标明合并后的职责。

### Mass diagram (good for "interface as wide as implementation")

每个 module 两个矩形：一个表示 interface 表面，一个表示 implementation。Before：两者高度接近（shallow）。After：interface 短，implementation 高（deep）。

### Call-graph collapse

Before：嵌套框中的函数调用树。After：同一棵树收为一个框，现已内部化的调用在其中淡显。

## Style guidance

- 风格偏编辑式，而非企业 dashboard。宽裕留白。标题可用 serif（`font-serif` 配 stone/slate 很合适）。
- 克制用色：一种强调色（emerald 或 indigo），红表示泄漏，amber 表示警告。
- 图高度约 320px，使 before/after 舒适并排，无需滚动。
- 图中 module 标签使用 `text-xs uppercase tracking-wider`，使其像结构图，而不是 UI。
- 唯一脚本是 Tailwind CDN 和 Mermaid ESM import。报告其余部分静态：无 app 代码，除 Mermaid 自身渲染外无交互。

## Top recommendation section

一个更大的卡片：候选名、一句理由、指向其卡片的 anchor。仅此而已。

## Tone

语言平实简短，但架构名词和动词直接来自 `/codebase-design` skill。简短不是术语漂移的借口。

**准确使用：** module、interface、implementation、depth、deep、shallow、seam、adapter、leverage、locality。

**绝不替换：** component、service、unit（替代 module）· API、signature（替代 interface）· boundary（替代 seam）· layer、wrapper（本意是 module 时）。

**符合风格的表达：**

- “Order intake module 很 shallow：interface 几乎等同 implementation。”
- “Pricing 跨 seam 泄漏。”
- “加深：一个 interface，一个测试位置。”
- “两个 adapter 使 seam 合理：生产 HTTP，测试 in-memory。”

**Wins 列表**用词汇表术语说明收益：*“locality：bug 集中在一个 module”*、*“leverage：一个 interface，N 个调用点”*、*“interface 缩小，implementation 吸收 wrapper”*。不要写*“更易维护”*或*“代码更干净”*，这些词不在术语表，也没有实际表达价值。

不含犹豫修饰、套话或“值得注意的是……”。句子能成为 bullet 就用 bullet；bullet 能删就删。术语不在 `/codebase-design` 词汇表时，先找已有词，再考虑新造。
