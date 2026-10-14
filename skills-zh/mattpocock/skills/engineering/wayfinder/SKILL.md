---
name: wayfinder
description: 将超出单次 agent 会话容量的大量工作规划为 issue tracker 上的共享决策 ticket 地图，逐项解决，直到通往目标的路径清晰。
disable-model-invocation: true
---

一个模糊想法出现，超出一次 agent 会话容量，笼罩在迷雾中：从这里到 **destination** 的路径还看不清。Wayfinding 负责寻找路径，而不是直接冲向目标。本 skill 在仓库 issue tracker 上绘制 **shared map**，再逐个处理 **decision ticket**（解决后产生决策的问题，而不是待实施的构建 slice），直到路线清晰。

每项工作的 destination 不同，为它命名是绘图的第一步，它决定每个 ticket 的形状。目标可能是可交接并迭代的 spec、规划前必须锁定的决策，或数据结构迁移这样的现场改动。map 不限定领域，工程、课程内容等符合形状的工作都可以。

## Plan, don't do

Wayfinder 默认负责 **planning**：每个 ticket 解决一个决策；当路线清晰、执行前没有未决事项时，map 就完成了。想直接动手通常说明你已抵达地图边缘，该交接了。某项工作可以在其 **Notes** 中覆盖此规则，将执行纳入 map；否则产出决策，而非交付物。

## Refer by name

每个 map 和 ticket 都是 issue，因此有一个 **name**，即标题。凡是人要阅读的内容（叙述、map 的 Decisions-so-far），都按名称引用，而不用裸 id、编号或 slug。满屏 `#42, #43, #44` 难以阅读；名称一眼能看懂。id 和 URL 不消失，名称包裹链接，它们位于名称_内部_，不代替名称。

## The Map

map 是本仓库 issue tracker 上的单个 issue，带 `wayfinder:map` 标签，是规范产物。ticket 是它的 child issue。

map 是 **index**，不是存储库。它列出已作出的决策，指向承载细节的 ticket；决策只存在于一个地方，就是其 ticket，因此 map 只概述并链接，不重复叙述。

**map、child ticket、blocking 和 frontier 查询的实际位置取决于 tracker。** issue tracker 应已提供给你。如果没有，告诉用户运行 `/setup-matt-pocock-skills`。查阅 tracker 文档的“Wayfinding operations”一节，了解_本_仓库的表达方式。如果仍未提供 tracker，默认使用 local-markdown tracker。

### The map body

每次会话加载一次整个 map 的低分辨率视图。未关闭 ticket **不列在这里**，它们是通过查询找到的开放 child issue。

```markdown
## Destination

<what reaching the end of this map looks like: the spec, decision, or change this effort is finding its way to. One or two lines; every session orients to it before choosing a ticket.>

## Notes

<domain; skills every session should consult; standing preferences for this effort>

## Decisions so far

<!-- the index: one line per closed ticket, enough to judge relevance, then zoom the link for the detail the ticket holds -->

- [<closed ticket title>](link): <one-line gist of the answer>

## Not yet specified

<!-- see "Fog of war": in-scope fog you can't ticket yet; graduates as the frontier advances -->

## Out of scope

<!-- see "Out of scope": work ruled beyond the destination; closed, never graduates -->
```

### Tickets

每个 ticket 是 map 的 **child issue**，以 tracker issue id 为身份。正文是问题，大小适合一次 100K token 的 agent 会话：

```markdown
## Question

<the decision or investigation this ticket resolves>
```

每个 ticket 带一个 `wayfinder:<type>` 标签，类型为 `research`、`prototype`、`grilling`、`task`（参见 [Ticket Types](#ticket-types)）。map 和 ticket 只使用 `wayfinder:` 标签，绝不使用 `ready-for-agent` 等 triage 标签：它们是决策，而非实施工作。

会话开始任何工作**之前**，先将 ticket 分配给推动 map 的开发者，作为 **claim**，让并行会话跳过它。assignee _就是_ claim；开放且未分配的 ticket 未被认领。

Blocking 使用 tracker 的 **原生**依赖关系：它在 tracker UI 中_直观_呈现 frontier，让人无需打开 map 就看到可处理项。只有不支持原生 blocking 的 tracker 才退回正文约定。当所有 blocker 都关闭时，ticket 是 **unblocked**；**frontier** 是开放、无阻塞且未认领的 child issue，是已知区域的边缘。

答案不属于正文，而在解决时记录（参见 [Work through the map](#work-through-the-map)）。解决 ticket 时创建的资产从 issue 链接，不直接粘贴进去。

## Ticket Types

每个 ticket 属于 **HITL**（human in the loop，与能代表自己意见的人共同处理）或 **AFK**（agent 独立推进）。HITL ticket 只能通过实时交流解决；agent 永远不能代替人回答（访谈 agent 回答自己的问题就违反了这一点）。

- **Research**（AFK）：阅读文档、第三方 API 或知识库等本地资源，寻找决策等待的事实。由调用 Skill 工具加载 "research" 的 subagent 解决。需要当前工作目录之外的知识时使用。
- **Prototype**（HITL）：调用 Skill 工具加载 "prototype"，制作低成本、粗略但具体的产物（提纲、初步意见、stub 或 UI/logic 代码），提高讨论精度，便于反馈。将 prototype 链为资产。关键问题是“应该长什么样”或“应该如何运行”时使用。
- **Grilling**（HITL）：对话，是默认类型。始终分别调用两次 Skill 工具，加载 "grilling" 和 "domain-modeling"。
- **Task**（HITL 或 AFK）：在作出_决策_前必须完成的手工工作。无需决策、prototype 或 research，但讨论被这项工作阻塞。比如注册服务来评估 API、配置访问权限、搬移数据来观察形状。这是唯一负责_做_而非决策的类型，它因解锁决策而存在，不是为交付 destination。agent 能独立完成时采用 AFK，否则给人准确清单（HITL）。工作完成时解决；答案记录已做的事情和后续 ticket 依赖的事实（凭证位置、新 URL、行数）。

## Fog of war

map _有意_不完整：不要画还看不清的东西。当前 ticket 之外是 **fog of war**：隐约知道将来的决策和调查，但因依赖未决问题，还无法确定。解决一个 ticket 会清除前方迷雾，把已可准确描述的内容逐个升级为新 ticket，直到通往 destination 的路径清晰且没有剩余 ticket。

map 的 **Not yet specified** 记录这些模糊内容：疑似问题、以后重访的区域。它是_朝向_ destination 的未发现 frontier；这里都在 scope 内，只是还不够准确，无法写 ticket。根据视野写得简略或充分，它也为协作者指示工作方向。

**Fog 还是 ticket？** 标准是现在能否准确提出问题，_不是_现在能否回答。

- **写 ticket 的条件**：问题已经明确，即使被阻塞、还无法行动。
- **放入 Not yet specified 的条件**：还无法准确表述。不要预先把 fog 切成 ticket 大小：它更粗，frontier 抵达后，一个区域可能变为多个 ticket，也可能没有。

**Not yet specified** 不包含已决内容（Decisions so far）、已有 live ticket 或 out of scope 内容（下一节）。

## Out of scope

Fog 只朝 destination 聚集。destination 确定 scope，所以超出目标的工作属于 **out of scope**：不是 fog，也不属于 **Not yet specified**。它进入 map 独立的 **Out of scope** 一节，记录你明确排除在_本次_工作之外的内容。决定放在这里的是 scope，而非清晰度。

out-of-scope 工作永不转正（frontier 在 destination 停止），只在重新定义目标时回来，而且作为新工作，而不是恢复原工作。

划为 out of scope 是确定范围，不是路线上的一步。如果已有 ticket 被发现位于 destination 之外（绘图时误纳入，或在解决问题后暴露），**关闭它**（关闭项明确不属于 frontier），在 **Out of scope** 留一行概述及理由，链接该 ticket。不加入 **Decisions so far**，那里记录真正走过的路线；范围边界不是路线上的一步。

## Invocation

两种模式。无论哪一种，**每次会话永远不解决超过一个 ticket**，research ticket 除外。

### Chart the map

用户带着模糊想法调用。

1. **命名 destination。** 分别调用两次 Skill 工具，加载 "grilling" 和 "domain-modeling"，明确 map 要到达的 spec、决策或改动。destination 确定 scope，所以先确定它。
2. **绘制 frontier。** 再访谈，这次 **breadth-first**：向整个空间展开，而非深挖一条线，找出未决事项和现在能走的第一步。**如果没有 fog**（路线已清晰，整个工作足够一次会话完成），就不需要 map。停止并询问用户如何继续。
3. **创建 map**（`wayfinder:map` 标签）：填 Destination 和 Notes，Decisions-so-far 留空，把 fog 勾画到 **Not yet specified**。
4. **将现在能明确描述的 ticket 建为 map 的 child issue**，再**第二遍**连 blocking edge（issue 有 id 后才能相互引用）。也在第二遍用真实 id 写交叉引用：占位 `#<n>` 会自动链接到无关 issue。连线将它们区分为 frontier 和 blocked；无法明确描述的保留在 fog，即 **Not yet specified**。
5. **启动 research subagent。** 对每个刚创建的 `research` ticket，启动调用 Skill 工具加载 "research" 的 subagent 并行解决，将发现保存在临时 `research/<name>` branch，从 ticket 放 context pointer。push branch，但不开 PR，因为它永不合并。
6. 停止：绘图就是一次会话的工作，不手动解决任何 ticket。

### Work through the map

用户携带 map（URL 或编号）调用。ticket **可选**：未指定时，由你选下一项决策，不是用户选。

1. 加载 **map**：低分辨率视图，而不是所有 ticket 正文。
2. 选择 ticket。用户指定就使用该项，否则按顺序取第一个 frontier ticket。**Claim 它**：工作前先分配给自己。
3. 按 `wayfinder:<type>` 标签的类型解决（参见 [Ticket Types](#ticket-types)）。读标签，不只读正文，因为正文不会说明类型。**按需放大**：需要时获取相关或已关闭 ticket 的完整正文；按 `## Notes` 调用 Skill 工具加载对应 skill。拿不准时，分别调用两次，加载 "grilling" 和 "domain-modeling"。
4. 记录解决结果：以 **resolution comment** 发布答案，**关闭** issue，向 map 的 Decisions-so-far **追加 context pointer**。
5. 添加新发现 ticket（先创建，后连线）；将答案使其明确的 fog 转为 ticket，并从 **Not yet specified** 清除该区域，使它只存在于新 ticket。答案若暴露某个 ticket（当前或其他）超出 destination，将它**划为 out of scope**，而不是作为路线上的解决项。如果决策使 map 其他部分失效，更新或删除对应 ticket。

用户可能并行处理无阻塞 ticket，因此应预期其他会话同时编辑 tracker。
