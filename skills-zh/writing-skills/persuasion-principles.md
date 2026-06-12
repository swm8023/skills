# skill 设计中的说服原则

## 概述

LLM 对说服原则的反应与人类一致。理解这种心理机制能帮助你设计更有效的 skill —— 不是为了操纵，而是为了确保关键实践即便在压力下也能被遵守。

**研究基础：** Meincke 等人（2025）以 N=28,000 次 AI 对话测试了 7 种说服原则。说服技巧使依从率提升了一倍以上（33% → 72%，p < .001）。

## 七项原则

### 1. 权威（Authority）
**它是什么：** 对专业知识、资质或官方来源的服从。

**它在 skill 中如何起作用：**
- 命令式语言："YOU MUST"、"Never"、"Always"
- 不容讨价还价的表述："No exceptions"
- 消除决策疲劳和自我合理化

**何时使用：**
- 强制纪律的 skill（TDD、verification 要求）
- 安全关键的实践
- 已确立的最佳实践

**示例：**
```markdown
✅ Write code before test? Delete it. Start over. No exceptions.
❌ Consider writing tests first when feasible.
```

### 2. 承诺（Commitment）
**它是什么：** 与先前行为、声明或公开宣告保持一致。

**它在 skill 中如何起作用：**
- 要求声明："Announce skill usage"
- 强制明确选择："Choose A, B, or C"
- 使用追踪机制：用 TodoWrite 维护检查清单

**何时使用：**
- 确保 skill 真的被遵循
- 多步骤流程
- 问责机制

**示例：**
```markdown
✅ When you find a skill, you MUST announce: "I'm using [Skill Name]"
❌ Consider letting your partner know which skill you're using.
```

### 3. 稀缺（Scarcity）
**它是什么：** 来自时间限制或可得性受限的紧迫感。

**它在 skill 中如何起作用：**
- 时限性要求："Before proceeding"
- 顺序依赖："Immediately after X"
- 防止拖延

**何时使用：**
- 即时 verification 要求
- 时间敏感的 workflow
- 防止"我之后再做"

**示例：**
```markdown
✅ After completing a task, IMMEDIATELY request code review before proceeding.
❌ You can review code when convenient.
```

### 4. 社会认同（Social Proof）
**它是什么：** 顺从他人行为或被视为常态的事物。

**它在 skill 中如何起作用：**
- 普适模式："Every time"、"Always"
- 失败模式："X without Y = failure"
- 确立规范

**何时使用：**
- 记录普适实践
- 警告常见失败
- 强化标准

**示例：**
```markdown
✅ Checklists without TodoWrite tracking = steps get skipped. Every time.
❌ Some people find TodoWrite helpful for checklists.
```

### 5. 同体感（Unity）
**它是什么：** 共享身份、"我们感"、内群体归属。

**它在 skill 中如何起作用：**
- 协作式语言："our codebase"、"we're colleagues"
- 共同目标："we both want quality"

**何时使用：**
- 协作型 workflow
- 建立团队文化
- 非层级化的实践

**示例：**
```markdown
✅ We're colleagues working together. I need your honest technical judgment.
❌ You should probably tell me if I'm wrong.
```

### 6. 互惠（Reciprocity）
**它是什么：** 回报已收到恩惠的义务感。

**它如何起作用：**
- 谨慎使用 —— 可能让人觉得被操纵
- 在 skill 中很少需要

**何时避免：**
- 几乎总是避免（其他原则更有效）

### 7. 喜好（Liking）
**它是什么：** 倾向于与我们喜欢的人合作。

**它如何起作用：**
- **不要用于强制依从**
- 与诚实反馈的文化相冲突
- 制造谄媚

**何时避免：**
- 在纪律强制场景下，永远避免

## 按 skill 类型组合原则

| skill 类型 | 使用 | 避免 |
|------------|-----|-------|
| 强制纪律型 | Authority + Commitment + Social Proof | Liking、Reciprocity |
| 指导/技巧型 | 适度 Authority + Unity | 重度权威 |
| 协作型 | Unity + Commitment | Authority、Liking |
| 参考型 | 仅追求清晰 | 所有说服手段 |

## 为何有效：心理学解释

**清晰边界规则减少自我合理化：**
- "YOU MUST" 消除决策疲劳
- 绝对化语言消除"这算不算例外？"的疑问
- 显式的反合理化条款堵住具体漏洞

**实施意图创造自动行为：**
- 明确触发条件 + 必需动作 = 自动执行
- "When X, do Y" 比 "generally do Y" 更有效
- 降低依从所需的认知负担

**LLM 是类人的（parahuman）：**
- 训练数据中的人类文本包含这些模式
- 在训练数据中，权威语言通常先于依从出现
- 承诺序列（声明 → 行动）被频繁建模
- 社会认同模式（人人都做 X）确立规范

## 合乎伦理的使用

**正当用途：**
- 确保关键实践被遵守
- 创建有效的文档
- 防止可预见的失败

**不正当用途：**
- 为个人利益操纵他人
- 制造虚假紧迫感
- 基于内疚的依从

**判断标准：** 如果用户完全了解这项技巧，它是否仍然服务于用户的真实利益？

## 研究引用

**Cialdini, R. B. (2021).** *Influence: The Psychology of Persuasion (New and Expanded).* Harper Business.
- 七项说服原则
- 影响力研究的实证基础

**Meincke, L., Shapiro, D., Duckworth, A. L., Mollick, E., Mollick, L., & Cialdini, R. (2025).** Call Me A Jerk: Persuading AI to Comply with Objectionable Requests. University of Pennsylvania.
- 以 N=28,000 次 LLM 对话测试 7 项原则
- 使用说服技巧后依从率从 33% 提升至 72%
- Authority、Commitment、Scarcity 最为有效
- 验证了 LLM 行为的类人（parahuman）模型

## 快速参考

设计一个 skill 时，请自问：

1. **它属于哪种类型？**（纪律型 vs 指导型 vs 参考型）
2. **我想改变什么行为？**
3. **哪些原则适用？**（纪律型通常用 authority + commitment）
4. **我是不是组合了太多原则？**（不要七项全用）
5. **这样做合乎伦理吗？**（是否服务于用户的真实利益？）
