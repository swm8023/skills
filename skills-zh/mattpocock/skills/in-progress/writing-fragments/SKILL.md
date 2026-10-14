---
name: writing-fragments
description: "写作的 explore 阶段：挖掘原始 fragment，暂不确定结构。"
disable-model-invocation: true
---

<what-to-do>

这是纯 **explore**：扩大可写空间，不承诺结构。承诺结构是 _exploit_，属于另一个 skill。开展产出 fragment 的访谈，对用户想写的任何内容持续追问。强加阶段、提纲或文章结构不在本 scope。

对话任一方产生 fragment 时，追加到单个 Markdown 文件。

用户未给路径时，问一次文档保存位置，并在余下会话记住。

从用户最早的话开始捕获 fragment，包括最初 prompt。

首次写入只在顶部放一个 H1 工作标题（以后可变），不加 metadata、TOC 或日期。

</what-to-do>

<supporting-info>

## What is a fragment

fragment 是任何可能进入最终文章的文本。必须_作者可读_（作者知道什么意思），但无需定义术语或让初次读者理解。标准是“是不是一段好文字”，不是“是不是独立完整论证”。

fragment 有意异质，可以包括：

- 想在某处使用、却还不知道放哪的锐利句子。
- 带一句理由的断言。
- 小故事：发生的事情、代码片段、场景、类比。
- 半个想法：“X 怎样像 Y，之后再推敲。”
- 引文、对话、偶然听到的话。
- 感觉相互关联的观察清单。
- 抱怨、坦白、包袱。
- **leading word**：能承载整篇的紧凑比喻或造词，一个词命名想法，如 _tracer bullets_ 或 _fog of war_ 命名整个模式。

其中 leading word 最有价值，是承重材料：explore 时选对词，会塑造后面的结构、转场和标题，在整个 exploit 阶段持续产生收益。对话绕着某想法反复转时，推动为它命名。

以小说家的日记为模型：多年无结构观察，后来挖掘为原材料。fragment 就是观察。

## File format

```markdown
# Working title

A first fragment lives here.

It can be multiple paragraphs. It can include lists, code, quotes: whatever
shape the fragment naturally takes.

---

A second fragment.

---

> A quoted line that the user wants to keep around.

A reaction to it.

---

- A cluster of related observations
- That hang together by feel
- And want to be near each other
```

fragment 用水平线（`\n---\n`）分隔。正文无标题、无标签，除追加顺序外无其他排序。

## Writing rhythm

安静追加，不为每个 fragment 请求权限。随口提及新增了什么（“加上了”），不以保存对话框打断交流。

每次写入前重读磁盘文件。用户可能在轮次之间编辑、调序或删除，保留其改动。不要整体覆盖，只追加；用户要求时才原位改具体 fragment。

用户可随时说“删最后一个”“把这段写得更锋利”“合并这两段”。将其视为正式指令。

</supporting-info>
