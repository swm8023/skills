---
name: technical-writing
description: "分层 technical-writing 规范：Diátaxis 组织文档结构，Google developer style 指导句子表达，STE 约束操作指令，Global English 消除语法歧义。显式调用 /technical-writing，或撰写、审阅文档、RFC、README、PR 描述和 commit message 时使用。"
disable-model-invocation: true
---

# Technical writing

写出的文档，要让疲惫的工程师也能一遍读懂。四个层次的规则都要应用。

以下三条原则统领这四个层次：

- **删掉不起作用的词。** 删去某个词后，句子仍然成立，就删掉它。"In order to"（为了）改成 "to"（为）；"It is important to note that"（需要特别指出的是）可以直接删除。
- **使用简短、日常的词。** 用 "Use"（用），不用 "utilize"（使用）；用 "Help"（帮），不用 "facilitate"（促进）；用 "Do"（做），不用 "perform"（执行）。使用较长的词，必须能表达得更准确。
- **如果规则让句子变差，就换一种改法，或保留原句。** 一个句子即使符合所有规则，只要读起来像机器写的，就仍然不合格。

名称以 codebase 为准。使用实际的符号名、文件名、flag 或命令名，不要换成同义词或描述性说法。

不要生造术语（jargon）。使用开发者平时会说的词，比如 "move"（移动）、"delete"（删除）、"a budget that only decreases"（只会减少的预算），不要用 "evacuate"（撤离）、"ratchet"（棘轮）或 "endgame"（终局）。采用有名称的 pattern 时，要在首次出现时解释其含义。发现新的问题用语时，在回复中给出它及其替代说法的 diff，建议加入 `unslop` 的 abstract-metaphor rule。不要直接编辑那个 skill。

## Vary the rhythm

文档即使遵守了每一层规则，也可能读起来仍像机器写的：每句都刻意缩短，没有任何判断，也没有具体内容。

- 有意识地变化句子长短。短句突出要点，长句承载事实及其条件或后果。
- 一句一个意思，不等于每句一样长。包含两个意思的句子要拆开；较长的句子只承载一个意思时，就保留它。
- 文档类型允许时，要表达判断。Explanation 需要权衡取舍，应说明你的判断，而不是只列优缺点。Reference 保持客观、平实。
- 表达要具体，避免空泛。把 "schema changes can cause issues"（schema 变更可能引发问题）改成 "a column rename fails the build"（重命名列会使 build 失败）。

## Pick the mode first (Diátaxis)

一份文档只采用一种模式。用两个问题判断：内容是帮助行动（doing），还是帮助理解（thinking）？它服务于学习（learning），还是实际工作（work）？

- 行动 + 学习：**tutorial**。
- 行动 + 工作：**how-to**。
- 理解 + 工作：**reference**。
- 理解 + 学习：**explanation**。

这套判断方法既适用于整篇文档，也适用于单个句子。

**Tutorial：通过实践学习。** 帮助学习者成功是你的责任。开头说明学习者将做出什么，而不是将 "learn"（学会）什么。每一步都要产生可见结果，并尽早、频繁地呈现。告诉读者应该看到什么：预期输出、prompt 的变化或某条日志。解释压缩为一个分句和一个链接。内容保持具体。以 "we"（我们）为叙述人称，用指令表达："First, do x. Now, do y."（先做 x。现在做 y。）

**How-to：达成目标的步骤。** 解决读者面临的问题，而不是描述机器能执行的某项操作。假定读者具备所需能力，不再教学。只写操作，不插入旁支内容或背景，也不为求全面而增加内容；这些资料用链接提供。允许分支和判断："If you want x, do y."（如果想实现 x，就做 y。）用任务为指南命名："How to calibrate the radar array"（如何校准雷达阵列），而不是 "Radar array calibration"（雷达阵列校准）。

**Reference：供查阅的事实。** 只描述，不指导、不劝说、不表达观点。内容客观、完整、确定。直接说明事实、选项、限制和错误，不含糊其辞。组织方式与所描述对象的结构一致，让读者能在代码和文档之间对应查找。把资料放在读者预期的位置。能从代码生成时，就从代码生成。

**Explanation：理解原理与原因。** 每篇限定一个主题，离开产品界面也能读懂。每个标题前面都应能自然加上 "About..."（关于……）。围绕一个实际的“为什么”展开。提供背景，包括设计决策、历史、约束和替代方案。只有这种类型允许表达观点。

不要混合模式：tutorial 中不放 reference 表格，reference 中不加入 tutorial 式的逐步引导，how-to 中不展开论辩。将它们拆开，用链接关联。

## Write sentences to the reader (Google developer style)

- 用 "you"（你）直接面向读者，使用 present tense。只有确实在之后发生的事情才用 "Will"（将会）。
- 讲清谁做什么：用 "the compiler checks"（编译器检查），不用 "is checked"（被检查）。只有执行者未知或与当前内容无关时，才使用 passive voice。
- 把操作指令写成命令句："Click Submit."（点击 Submit。）直接陈述事实，不用 "should be done"（应当被执行）。
- 先说明条件，再给出操作："To delete the document, click Delete."（要删除文档，点击 Delete。）
- 先写常见情况，再写例外。
- 语气像一位熟悉问题的朋友。不用 buzzword 或比喻，操作指令中不加 "please"（请），也不用 "simply"（只需）、"easy"（容易）或 "quickly"（快速）。读者来查文档，本就说明这件事对他并不简单。
- 不提前宣布尚未实现的功能，如 "we will soon support..."（我们即将支持……），也不要连续用相同短语起句。
- 链接文字应说明目标内容，使用页面标题或简短描述，不用 "click here"（点击这里）。能在当前页面用一句话补足背景时，优先这样做，而不是让读者跳到别处。
- 标题应直接表达要点，而不只是话题：用 "Pick the mode first"（先选模式），不用 "Modes"（模式）。使用 sentence case。任务标题采用以动词开头的短语，如 "Create an instance"（创建实例）；概念标题使用名词短语。每页只有一个 h1，不跳过标题层级。
- 有先后顺序的步骤使用编号列表，其余使用 bullets。用完整句子引出列表，列表项保持平行结构。
- 代码使用 code font，UI 元素使用粗体。使用 serial comma。删去 "etc."（等等），在列举前说明列表并不完整。

## Make statements load one at a time (STE rules)

- 操作指令每句只写一个动作，其他句子每句只表达一个意思。
- 指令超过约 20 个英文词、其他句子超过约 25 个英文词时，拆开。
- 警告或条件放在它所约束的步骤之前："If hot oil touches your skin, injuries can occur."（热油接触皮肤可能造成伤害。）
- 保留 "the" 和 "a" 这样的 article。"Remove backup file"（删除备份文件）的解读可能有歧义；"Remove the backup file"（删除该备份文件）指向明确。
- 每个词只承担一种含义和一种作用，并保持一致。如果 "check" 表示 inspect（检查），就不要再用它表示 restrain（抑制）。
- 同一个动作固定用一个词：统一用 "start"（启动），不要这里用 "start"，那里又用 "initiate"（启动）。
- 把操作步骤写成直接指令，不用叙述句或 passive voice：用 "Install the component"（安装组件），不用 "the component must be installed"（组件必须被安装）。
- 尽量避免 "-ing" 形式的词。

## Leave no sentence open to two readings (Global English)

- 把 "only"（仅）和 "not"（不）紧挨着它们限定的词。"only fails on growth"（增长时只会失败）与 "fails only on growth"（只在增长时失败）含义不同。
- 拆开冗长的名词串：把 "the proto import budget check script"（proto 导入预算检查脚本）改为 "the script that checks the proto-import budget"（检查 proto 导入预算的脚本）。
- 每个 "it"（它）、"they"（它们）和 "this"（这个）都应有一个明确的指代对象。拿不准时，重复名词。不要用 "this" 或 "which" 指代整个分句。
- 不要省略动词。"Phase 1 moves the converters and Phase 2 the runtime"（阶段 1 移动 converters，阶段 2 移动 runtime）省略了 Phase 2 的动词，应补全。
- 保留体现句子结构的小词，比如 "that"，它出现在 "Ensure that the switch is off"（确保开关已关闭）中。不要为了减少词数牺牲清晰度。
- 并列结构中，重复 article 可以防止误读。指两个不同对象时，写 "the client and the host"（客户端和主机），不要写 "the client and host"（客户端和主机）。
- 如果句子的并列关系可能有两种分组方式，明确 "and"（和）或 "or"（或）连接的是哪些部分。"Both...and"（两者都）、"either...or"（两者之一）和 "if...then"（如果……那么……）都可以用来消除歧义。
- 用句号，不用分号。把 em dash 改为新句子。
- 括号里的内容应是语法完整的表达，或另写成一句。不要用 "(s)" 表示复数。
- 不用 slash：写 "a, b, or both"（a、b 或两者），不要写 "a/b" 或 "and/or"（和／或）。
- 同一个事物始终使用同一个名称。一份文档把同一事物分别叫作 "the gate"（关卡）、"the ratchet"（棘轮）和 "the budget check"（预算检查），会让读者以为有三个概念。对象没变，就不要反复换名。
- 不用 idiom、口语化表达、Latin abbreviation 或比喻。

## Voice and repo specifics

- 本 skill 处理的每份文档都要应用 **unslop** skill。AI 用词（AI vocabulary）、赘语（filler）、不确定性表达（hedging）和格式痕迹（formatting tells）等 slop-pattern 清单由它负责。
- PR 描述和 commit message 也属于写作；除 Diátaxis 外，各层规则都适用。PR 正文应是一份 reviewer 能在一分钟内读完的简报。不要粘贴 swarm 日志、SHA 列表或指标表格，提供链接即可。
- 产品 UI 文案不属于文档，遵循产品自己的文案规范。
- 代码片段使用 tab 缩进。写出真实路径。文档中的数量和 tree 描述，都必须与最终合入的 commit 一致，并附上重新生成这些结果的命令。

## Worked example

改写前：

> Configuration of the proto import ratchet budget script parameters is performed via budget.json. Note that it's important to remember that running with --write, which updates the committed budget to reflect the current count, should only be done when lowering it. If exceeded, CI fails.（中文：proto import ratchet budget 脚本通过 budget.json 配置参数。需要特别记住，运行 --write 会更新已提交的 budget，使其反映当前数量，因此只有降低 budget 时才应运行。超限时，CI 会失败。）

改写后：

> `budget.mjs` reads the committed budget from `budget.json` and counts the files that import protos. If the count exceeds the budget, CI fails. Run `budget.mjs --write` only to lower the budget.（中文：budget.mjs 从 budget.json 读取已提交的 budget，并统计导入 proto 的文件数。如果数量超过 budget，CI 就会失败。只在降低 budget 时运行 budget.mjs --write。）
