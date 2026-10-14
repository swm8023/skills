---
name: grilling
description: 围绕计划、决策或想法持续追问用户。当用户希望对思考进行压力测试，或使用任何 'grill' 触发短语时使用。
---

持续追问用户，直到达成共同理解。把它映射为一棵 **design tree**：每个决策都向依赖它的决策分叉。

分 **rounds** 推进这棵树。**frontier** 是所有前置决策已确定的决策，也就是无需猜测尚未听到的答案、_现在_ 就能问的问题。一轮问完整个 frontier：给每个问题编号并提供推荐答案。然后等待用户回答，再进入下一轮。

一轮问题采用以下格式：

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

措辞要让用户回答“是”时表示接受你的推荐答案。

用户每轮回答都会重塑这棵树：已确定的决策将 frontier 向外推进，并解锁依赖它的问题。重新计算 frontier，再问下一轮。如果一个问题的答案依赖本轮另一个尚未确定的问题，它应该放在_后续_轮次，而不是本轮。

查明_事实_是你的工作，永远不是用户的工作。如果 frontier 中的问题需要环境事实（文件系统、工具等），派 sub-agent 查明；能自行查询的事情就不要问用户。不要因此阻塞：正在进行的探索属于尚未确定的前置条件，所以只让它下游的问题等待 sub-agent 汇报，其他 frontier 问题现在就问。_决策_由用户作出：逐一交给用户，并等待回答。

frontier 为空时，会话才算完成：design tree 的每个分支都已走过，没有默默作出的假设。在用户确认已经达成共同理解前，不要据此执行。
