# HTML 报告格式

架构评审被渲染为一个独立自包含的 HTML 文件，放在操作系统的临时目录中。Tailwind 和 Mermaid 都从 CDN 加载。Mermaid 可靠地处理图状的 diagram；手工构建的 div 和内联 SVG 处理更具编辑性的视觉表现（mass diagram、cross-section）。两者混用——不要凡事都依赖 Mermaid，否则会显得千篇一律。

## 脚手架 / Scaffold

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Architecture review — {{repo name}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      mermaid.initialize({ startOnLoad: true, theme: "neutral", securityLevel: "loose" });
    </script>
    <style>
      /* 针对 Tailwind 不便覆盖的小细节的自定义样式层：
         虚线 seam、手绘风格的箭头等。 */
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

## 头部 / Header

repo 名称、日期，以及一个紧凑的图例：实线方框 = module，虚线 = seam，红色箭头 = leakage，粗深色边框方框 = deep module。不要写引言段落——直接进入候选项。

## 候选卡片 / Candidate card

diagram 承担主要叙述。文字稀疏、朴素，并直接使用术语表（[LANGUAGE.md](LANGUAGE.md)）中的词汇，不加修饰。

每个候选项是一个 `<article>`：

- **标题** —— 简短，命名此次 deepening（例如 "Collapse the Order intake pipeline"）。
- **徽章行** —— 推荐强度（`Strong` = emerald，`Worth exploring` = amber，`Speculative` = slate），加上依赖类别的标签（`in-process`、`local-substitutable`、`ports & adapters`、`mock`）。
- **文件** —— 等宽字体列表，`font-mono text-sm`。
- **Before / After diagram** —— 核心。两列并排。见下方 pattern。
- **Problem** —— 一句话。痛在哪里。
- **Solution** —— 一句话。改了什么。
- **Wins** —— bullet，每条 ≤6 个词。例如 "Tests hit one interface"、"Pricing logic stops leaking"、"Delete 4 shallow wrappers"。
- **ADR callout**（若适用）—— 在一个 amber 色调的方框中写一行。

不要写解释性段落。如果 diagram 需要一段文字才能看懂，那就重画 diagram。

## Diagram pattern

挑选适合该候选项的 pattern。混合使用。不要让每个 diagram 都长一个样——多样性正是要点之一。

### Mermaid graph（依赖关系 / 调用流的主力）

当要点是 "X 调用 Y、Y 调用 Z，看看这一团乱麻" 时，使用 Mermaid 的 `flowchart` 或 `graph`。把它包在 Tailwind 风格的卡片里，免得显得格格不入。用 classDef 把 leakage 边染成红色，把 deep module 染成深色。Sequence diagram 适合表现 "before: 6 次往返；after: 1 次"。

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

### 手工构建 boxes-and-arrows（当 Mermaid 的布局不听话时）

把 module 表现为带边框和标签的 `<div>`。箭头用内联 SVG 的 `<line>` 或 `<path>`，绝对定位到一个 relative 容器之上。当你想让 "after" diagram 看起来像一个粗边框的 deep module、内部细节灰暗化时，就用这种方式——Mermaid 渲染不出那种正确的视觉重量。

### Cross-section（适合表现分层 shallowness）

堆叠水平条带（`h-12 border-l-4`）来展示一次调用经过的若干层。Before：6 条薄薄的层，每层都没干啥。After：1 条粗带，标注上整合后的职责。

### Mass diagram（适合 "interface 与 implementation 一样宽"）

每个 module 画两个矩形——一个表示 interface 的表面积，一个表示 implementation。Before：interface 矩形几乎和 implementation 矩形一样高（shallow）。After：interface 矩形短，implementation 矩形高（deep）。

### Call-graph collapse

Before：把一棵函数调用树渲染为嵌套的方框。After：同一棵树坍缩为一个方框，里面以淡化方式显示如今已成为内部的调用。

## 样式指引 / Style guidance

- 偏编辑刊物的风格，不要企业仪表盘风。慷慨留白。标题可选用衬线字体（`font-serif` 与 stone/slate 配合得很好）。
- 颜色克制：一个强调色（emerald 或 indigo），加上红色用于 leakage、amber 用于警告。
- diagram 高度保持在约 320px，让 before/after 能舒服地并排放下，不需要滚动。
- diagram 内的 module 标签使用 `text-xs uppercase tracking-wider`——它们应像示意图标记，而不像 UI 文字。
- 仅有的脚本是 Tailwind CDN 和 Mermaid 的 ESM 导入。报告其余部分都是静态的——没有应用代码，除 Mermaid 自身渲染外没有交互。

## 顶级推荐区段 / Top recommendation section

一张更大的卡片。候选项名称、一句话说明原因、跳转到其卡片的锚点链接。仅此而已。

## 语调 / Tone

朴素英语，简洁——但架构相关的名词与动词必须直接来自 [LANGUAGE.md](LANGUAGE.md)。简洁不是漂移的借口。

**严格使用：** module、interface、implementation、depth、deep、shallow、seam、adapter、leverage、locality。

**绝不替换：** component、service、unit（替代 module）· API、signature（替代 interface）· boundary（替代 seam）· layer、wrapper（在你本意是 module 时替代 module）。

**契合该风格的措辞：**

- "Order intake module is shallow — interface nearly matches the implementation."
- "Pricing leaks across the seam."
- "Deepen: one interface, one place to test."
- "Two adapters justify the seam: HTTP in prod, in-memory in tests."

**Wins bullet** 用术语表的词来命名收益：*"locality: bugs concentrate in one module"*、*"leverage: one interface, N call sites"*、*"interface shrinks; implementation absorbs the wrappers"*。不要写 *"easier to maintain"* 或 *"cleaner code"*——这些词不在术语表里，配不上一席之地。

不要含糊其辞，不要清嗓子式的开场，不要 "it's worth noting that…"。如果一句话可以做成 bullet，就做成 bullet。如果一个 bullet 可以删掉，就删掉。如果某个词不在 [LANGUAGE.md](LANGUAGE.md) 里，先去找一个在术语表里的词，再考虑发明新词。
