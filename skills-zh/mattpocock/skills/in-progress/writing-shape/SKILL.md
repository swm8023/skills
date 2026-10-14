---
name: writing-shape
description: "写作的 exploit 阶段：逐段把原材料塑造成文章。"
disable-model-invocation: true
---

<what-to-do>

用户已提供或将提供原材料 Markdown，视为输入堆：整齐 fragment 列表、无结构长文或转录都可以。格式不重要，做任何事前从头读到尾。

然后开展塑形会话，产出独立文章文档。这是 **exploit**：探索完成、材料确定；选定结构，再挖掘材料填充。不要编辑原材料文件，本 skill 对它只读。

用户未说明文章保存位置时，问一次并记住。

</what-to-do>

<supporting-info>

## The loop

1. **Read the pile。** 完整阅读输入，形成对内容的理解。
2. **Establish the prerequisites。** 与用户确认读者入场已知什么，即起始已 **grounded** 的概念。其他内容必须先由 block 建立，后面的 block 才能使用。参见 [Grounding](#grounding)。
3. **起草 2–3 个开头候选。** 每个暗示不同主张或角度，全部展示。要求用户选择或合成混合。选中的开头决定余下文章必须做什么。
4. **逐段生长。** 开头确定后问：“基于这个开头，读者接下来需要知道什么？”从材料取内容回答。下一 block 只能依赖已 grounded 概念，并建立新概念。讨论它的形式：段落、列表、表格、callout、引文、代码块。每个格式选择都应有意且能说明理由。
5. **边写边追加文章。** 不批量攒着，每个确定的段或 block 立即写入，让用户看到文章成形。
6. **循环步骤 4，直到完成。** 由用户决定何时完成。

## Grounding

每个 **concept** 必须先 **grounded**，block 才能依赖：读者入场已知，或之前 block 已介绍。依赖未建立概念会丢掉读者。单位是概念而非词，没术语也可能依赖读者缺少的想法。概念有名称（**term**）时，grounding 同时建立想法和术语。

概念以两种方式获得基础：

- **Prerequisite**：开头前已建立，读者自带，起始确定。
- **Introduced**：block 建立，此后整篇都可用。

持续记录已 grounded 的集合。问“读者接下来需要知道什么”时，下一步依赖的未建立概念就是答案：先在这里或前面的 block 建立，否则不能推进。这是 [Pulling from the pile](#pulling-from-the-pile) 的缺口命名上升一层：那里缺材料，这里缺基础。

杠杆是哪些设为 prerequisite、哪些在文章内部建立。前置要求过多会排除读者，内部建立过多会让开头淹没在定义中。确定 prerequisite 时与用户协商。

## Conversational feel

这是反向访谈。构思时问“你究竟观察到什么”；这里问“文章究竟论证什么，读者按什么顺序理解”。提出异议，不放过弱转场。段落不值得存在就删。

持续使用这些动作：

- “这一段为读者做了什么，是上一段没做的？”
- “删掉它会破坏什么？”
- “该写成 prose，还是 list？为什么 prose？”
- “这个句子做两件事，拆开或只选一件。”
- “开头承诺 X，现在漂到 Y。重新串主线，或改变开头。”

## Pulling from the pile

把原材料当采石场，而非脚本。提取 fragment，重写以适应邻段，再放进去。可拆成多段、合并或转述。材料堆负责被挖掘，文章负责读起来像同一个声音。

材料缺文章所需内容时，明确指出 gap：“这里需要例子，材料没有。现在给一个，否则删这节。”

## Format arguments to actually have

选择 block 呈现方式时，向用户说出并讨论权衡，不要默默决定：

- **Prose vs. list。** prose 承载论证，list 承载平行项。并非真正平行时用 prose，是平行时 list 更易扫读。
- **Inline vs. callout。** tip、warning、aside 放 callout（`> [!TIP]`、`> [!NOTE]`），但只有内联确会打断主论证时才做，否则留 inline。
- **Table vs. repeated structure。** 同字段、同形状重复至少 3 次，用 table；否则 prose 加粗开头。
- **Quote vs. paraphrase。** 原始措辞重要时引用，仅想法重要时转述。
- **Code block vs. inline code。** 多行、可运行、示意内容 → block；单个 token 或标识符 → inline。

## Writing rhythm

每个 block 确认后追加文章。每次写入前重读磁盘，用户可能期间编辑，不盲目覆盖。要求重写某段时，只原位改该段，其余保留。

## Out of scope

- 挖掘材料堆外的新 fragment（缺口按“Pulling from the pile”处理）。
- 编辑原材料文件。
- 发布、为特定平台格式化，或添加用户未要求的 frontmatter。

</supporting-info>
