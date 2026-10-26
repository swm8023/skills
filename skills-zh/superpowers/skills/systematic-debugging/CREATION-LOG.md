# 创建日志：Systematic Debugging Skill

提取、组织、加固一个关键 skill 的参考示例。

## 源材料

从 `~/.claude/CLAUDE.md` 中提取的 debugging 框架：
- 四阶段系统化流程（Investigation → Pattern Analysis → Hypothesis → Implementation）
- 核心要求：永远寻找 root cause，绝不修复 symptom
- 规则的设计目的是抵御时间压力和自我合理化

## 提取决策

**包含哪些内容：**
- 完整的四阶段框架及其所有规则
- 反捷径条款（"NEVER fix symptom"、"STOP and re-analyze"）
- 抗压语言（"even if faster"、"even if I seem in a hurry"）
- 每个阶段的具体步骤

**舍弃哪些内容：**
- 项目特定上下文
- 同一规则的重复变体
- 叙事性解释（浓缩为原则）

## 遵循 skill-creation/SKILL.md 的结构

1. **丰富的 when_to_use** —— 包含症状与反模式
2. **Type: technique** —— 具有明确步骤的具体流程
3. **关键词** —— "root cause"、"symptom"、"workaround"、"debugging"、"investigation"
4. **流程图** —— "fix failed" 的决策点 → 重新分析 vs 增加更多修复
5. **逐阶段拆解** —— 可快速扫读的 checklist 格式
6. **反模式章节** —— 列出不应该做什么（对该 skill 至关重要）

## 加固元素

该框架的设计目的是抵御压力下的自我合理化：

### 语言选择
- "ALWAYS" / "NEVER"（而不是 "should" / "try to"）
- "even if faster" / "even if I seem in a hurry"
- "STOP and re-analyze"（显式暂停）
- "Don't skip past"（针对真实存在的行为）

### 结构性防御
- **Phase 1 必须执行** —— 不能直接跳到 implementation
- **单一 hypothesis 规则** —— 强制思考，防止散弹式修复
- **显式失败模式** —— "IF your first fix doesn't work" 并附带强制动作
- **反模式章节** —— 准确展示捷径长什么样

### 冗余设计
- root cause 这一要求出现在概述 + when_to_use + Phase 1 + 实现规则中
- "NEVER fix symptom" 在不同语境下出现了 4 次
- 每个阶段都有显式的 "don't skip" 指引

## 测试方法

按照 skills/meta/testing-skills-with-subagents 创建了 4 个验证测试：

### 测试 1：学术情境（无压力）
- 简单 bug，无时间压力
- **结果：** 完全合规，完整完成调查

### 测试 2：时间压力 + 显眼的快速修复
- 用户"在赶时间"，symptom 修复看起来非常容易
- **结果：** 抵抗住了捷径，遵循完整流程，找到了真正的 root cause

### 测试 3：复杂系统 + 不确定性
- 多层级故障，不确定能否找到 root cause
- **结果：** 系统化调查，逐层追踪，找到源头

### 测试 4：首次修复失败
- Hypothesis 不奏效，诱惑去增加更多修复
- **结果：** 停下来，重新分析，形成新的 hypothesis（没有散弹）

**所有测试通过。** 未发现任何自我合理化。

## 迭代过程

### 初始版本
- 完整的四阶段框架
- 反模式章节
- "fix failed" 决策的流程图

### 增强 1：TDD 引用
- 增加了到 skills/testing/test-driven-development 的链接
- 说明 TDD 的 "simplest code" ≠ debugging 的 "root cause"
- 避免两种方法论之间产生混淆

## 最终成果

一个加固后的 skill，特点是：
- ✅ 明确强制 root cause 调查
- ✅ 抵御时间压力下的自我合理化
- ✅ 为每个阶段提供具体步骤
- ✅ 显式展示反模式
- ✅ 在多种压力情境下经过测试
- ✅ 阐明了与 TDD 的关系
- ✅ 可投入使用

## 关键洞见

**最重要的加固：** 反模式章节明确展示了那些在当下看起来合情合理的捷径。当 Claude 心想"我就加这一个快速修复吧"时，看到这个相同的模式被列为错误做法，会产生认知摩擦。

## 使用示例

遇到 bug 时：
1. 加载 skill：skills/debugging/systematic-debugging
2. 阅读概述（10 秒）—— 重新意识到使命
3. 按 Phase 1 checklist 执行 —— 强制进行调查
4. 如果想跳过 —— 看到反模式，停下
5. 完成所有阶段 —— 找到 root cause

**时间投入：** 5–10 分钟
**节省时间：** 数小时的 symptom 打地鼠

---

*创建日期：2025-10-03*
*用途：skill 提取与加固的参考示例*
