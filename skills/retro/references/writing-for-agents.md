# Writing for Agents

编写任何 agent 消费文档的参考：skill、`AGENTS.md` / `CLAUDE.md`、通过 pointer 读取的文档。包装不同，写作相同：同样的手段让它们可预测，使 agent 每次采用相同_过程_，而非产生相同输出。

正在写 skill 时，阅读 [`SKILL-MECHANICS.md`](SKILL-MECHANICS.md)，了解 frontmatter、调用方式和 router skill。

## Context pointers

**context pointer** 是保存在 agent context 中的引用，命名 context 外的材料，并编码读取它的条件。skill description 是一种；`AGENTS.md` 中命名文档的一行也是。pointer 的_措辞_，而非目标，决定 agent 何时读取及其可靠程度。必要材料被弱措辞 pointer 隐藏，是行为方差 bug：先明确措辞，仍失败才内联材料。

pointer 有两个作用：说明材料是什么，列出触发读取的 **branch**（文档处理的不同情形，使不同运行走不同路径）。始终加载的 pointer 每个词每轮都耗费成本，因此比正文更需要删减：

- **把 leading word 放前面**：pointer 是它发挥触发作用的位置。
- **每个 branch 一个触发条件。** 对同一 branch 换同义词，只是重复写了同一个分支；合并，只保留真正不同的 branch。
- **删除正文已经表达的身份说明。**

## The two loads

添加的每份文档和 pointer 都会消耗两种预算之一：

- **Context load** 是始终加载材料对 agent window 的成本：`AGENTS.md` 一行、skill description，以及每轮都在 context 中、无论是否触发都消耗 token 和注意力的内容。
- **Cognitive load** 是人的成本：记住哪些文档存在、何时查哪份。人就是索引。这不是应一概最小化的成本，而是人类自主权的代价；人的判断有价值时投入，否则移除。

仅通过 pointer 读取的材料，用 pointer 自身一行的代价避免 context load；完全没有 pointer 的材料全靠 cognitive load。

## Information hierarchy

文档由两类内容构成：**step**（agent 按顺序执行的动作）与 **reference**（按需查阅的定义、规则、事实）。可任意混合：全是 step（操作配方）、全是 reference（review 规则、本 skill），或两者兼有。核心是每份内容在 **information hierarchy** 中的位置，即按 agent 需要的即时程度排列的阶梯：

1. **文件内 step** 是主要层级：做什么、按什么顺序。
2. **文件内 reference** 按需查阅。常是平等的同级集合（review 各规则同一层），这是合理结构，不是 smell。
3. **Disclosed reference** 移到单独文件，经 context pointer 读取，只在触发时加载。包括同文件夹兄弟文件，以及任何文档都能指向的完全外部材料。

下放太少，顶层膨胀；下放太多，隐藏 agent 真正需要的材料。整个决策就是这项张力。

**Progressive disclosure** 是向下移动材料（从主文件移到 pointer 后），让顶层清晰。不主要是 token 优化，而是保护层级。按 branch 判断最有效：所有 branch 都需要的内联，部分 branch 才需的置于 pointer 后。文档有 step 时，应下放却留在正文的 reference 会埋掉 step，使 agent 是否关注它们变成碰运气；这是方差问题，不只关乎可读性。

**Co-location** 是文件内的对应原则：阶梯决定*放多低*，co-location 决定*旁边放什么*。概念的定义、规则、例外放同一标题下，不四处散落，让读到一部分就带出邻近内容。标准是文档读起来像写给 agent 的说明；分组材料有这种效果，散落材料没有。（不同于 duplication：后者是同一意思出现在两处；散落则把一个意思拆到多处。）

这里的失败模式是 **sprawl**：即使每行有效且独特，文档仍过长。注意力随多余内容变薄，每行也多一份维持相关性的负担。解决方式是阶梯：用 pointer 下放 reference，按 branch 或 sequence 拆分，让每条路径只带所需内容。

## Steps and completion criteria

每个 step 以 **completion criterion** 结束，即 agent 判断工作完成的条件。两个性质使它成为有效手段：

- **Clarity**：能区分完成与未完成吗？模糊标准（“达成理解”）会诱发 **premature completion**：step 未真正完成就结束，注意力滑向_完成这件事_。可见的后续 step（**post-completion step**）提供拉力，标准的清晰度提供阻力。防御顺序：**先明确边界**（局部、低成本）；仅在边界确实模糊且_观察到_赶进度时，通过拆分 sequence 隐藏后续步骤。隐藏只在真实 context 边界（handoff 或 subagent 派遣）有效；内联调用让后续 step 仍在 context 中，无法清除。
- **Demand**：要求做多少。“每个修改 model 都被核对”迫使彻底工作，“产出改动清单”没有。Demand 驱动 **legwork**（工作内部的调查，由措辞引发，而非单独列成步骤），且不限于 step：“每条规则都应用”约束 reference，正如“每步都完成”约束序列，所以纯 reference 文档也能有完整性标准。

最强标准既可检查，又全面。

## When to split

将一份文档拆成两份，会增加某一种 load，只有拆分收益足够时才做：

- **按 sequence**：当后续 step 诱惑 agent 草草完成当前步骤时，拆开。隐藏后续内容促进当前步骤内部的 legwork。反过来合并 sequence 会暴露后续 step，诱发 premature completion。
- **按 invocation**，仅适用于 skill：参见 [`SKILL-MECHANICS.md`](SKILL-MECHANICS.md)。

## Leading words

**leading word** 是模型预训练已有、运行文档时能用来思考的紧凑概念（_lesson_、_fog of war_、_tracer bullets_）。反复使用词，而不重复句子，让分布式定义逐渐形成，用最少 token 锚定整片行为，调动模型已有先验。自造词定义清楚也能用，但没有先验，需要额外定义 token；优先寻找已有词。

它两次形成锚定。正文中锚定_执行_：每次词出现，agent 都使用同种行为；纯 reference 中它聚焦一类待找问题。pointer 中锚定_调用_：用户 prompt、文档和代码库共同使用该词，使 agent 更可靠地连接并读取材料。

寻找用 leading word 重构的机会。在三处展开的三元描述、pointer 花一整句暗示同一意思，都是应缩为一个 token 的段落：

- “快、确定、低开销” → _tight_（一个 _tight_ loop）。
- “你相信的循环” → _red_，将模糊关卡变成二值可观察状态（循环在 bug 上变 _red_，或不变）。

获得双重收益：token 更少，agent 思考的钩子更精准。假定每份文档都含 leading word 能取代的复述，去找出来。

旁边的失败模式是 **negation**：用禁止引导，会把被禁行为带进 context，使它_更_可用。_不要想大象_，脑中却只剩大象；否定是弱修饰，被强激活概念压过，禁令半像执行指令。用**正向**目标（“写一行注释”），避免提起被禁行为。只有无法正向表达的硬 guardrail 才值得禁止；即便如此，也搭配正向目标，让注意力落在该做什么。

## Pruning

- 每个意思只留一个 **single source of truth**，行为变化只需改一个地方。**Duplication**（同一意思多处出现）增加维护与 token 成本，还把它的显著度抬到超过真实层级的位置。（它是 leading word 的意外反面：后者有意重复词，从不重复整个意思。）
- **Environment** 也是真实来源（`package.json` 脚本、配置、目录布局、`--help` 输出）。文档复述环境事实就是 **cache**，复制查询结果；只有查询昂贵才值得占用 context。缓存 agent 查不到的东西：未写明的约定、选择背后的原因、配置未揭示的陷阱。一次读文件或跑命令就能得知的事实，留在环境里，避免过时。
- 检查每行的 **relevance**：是否仍与文档任务有关？无关介绍或本应下放的 branch，从一开始就不相关；行为或世界变化也会让内容过时。短文档更易保持相关。没有删减纪律，默认结局是 **sediment**：添加看似安全，删除看似冒险，陈旧层不断沉积，直到必须钻穿它们才能找到仍有效的内容。
- 逐句寻找 **no-op**：模型默认已经遵循的指令，只付 load、不改行为。测试“相对默认行为是否有改变”取决于模型，而非读者；两个人争论是否 no-op，其实在争默认行为，应运行文档验证，而不是辩论。句子不通过就整句删除，不只是删词。测试也适用于 leading word：弱到无法改变默认行为的词（agent 已较认真时说 _be thorough_）是 no-op，解法是更强词（_relentless_），而非换技术。
