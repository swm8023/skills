# Skill Judge

这是一套全面的评估框架，依据官方规范与 best practices 评估 Agent Skill 的质量。本 skill 为 SKILL.md 文件和 skill 包提供多维评分以及可执行的改进建议。

## Purpose

Skill Judge 要解决一个关键问题：**大多数 Skills 将 tokens 浪费在 Claude 已经掌握的知识上**。

本 skill 通过衡量“knowledge delta”，帮助你评估 Skill 是否真正增加价值；它指 Skill 提供的内容与 Claude 已有知识之间的差距。好的 Skill 应当是浓缩的专家头脑，而不是教程。

### The Core Formula

> **好 Skill = 专家独有知识 - Claude 已知内容**

本 skill 帮助识别：
- 浪费 tokens 的冗余内容（Claude 已经知道的东西）
- 真正增加价值的专家知识
- 妨碍 skill 被触发或有效使用的结构问题

## When to Use

需要以下工作时使用 Skill Judge：

- **发布前审查 Skill**：评估质量并找出改进点
- **审计现有 Skills**：依据 best practices 系统评估
- **改进 SKILL.md**：获取具体、可执行的建议
- **学习 Skill design patterns**：理解优秀 skill 的特征
- **比较 Skills**：用一致标准评估相对质量

**触发短语**：
- “评估这个 skill”
- “检查我的 SKILL.md”
- “审计这个 skill”
- “给这个 skill 打分”
- “怎样改进我的 skill？”
- “这个 skill 设计得好吗？”

## How It Works

### Evaluation Protocol

1. **第一遍 - Knowledge Delta Scan**：阅读 SKILL.md，并将每节归类为：
   - **[E] Expert**：Claude 确实不知道的内容（增加价值）
   - **[A] Activation**：Claude 知道，但简短提醒有用（可接受）
   - **[R] Redundant**：Claude 明确知道的内容（应删除）

2. **Structure Analysis**：检查 frontmatter 的有效性、行数、reference files、design pattern 和 loading triggers

3. **逐维评分**：依据具体证据和理由评估 8 个维度

4. **计算总分和等级**：合计分数（满分 120）并确定等级

5. **生成报告**：输出含分数、关键问题与改进建议的结构化报告

### The 8 Evaluation Dimensions (120 points total)

| 维度 | 满分 | 衡量内容 |
|-----------|------------|------------------|
| **D1: Knowledge Delta** | 20 | Skill 是否提供真正的专家知识？（核心维度） |
| **D2: Mindset + Procedures** | 15 | 是否传递专家 thinking patterns 和 domain-specific workflows？ |
| **D3: Anti-Pattern Quality** | 15 | 是否有有效的 NEVER 清单，并附具体原因？ |
| **D4: Specification Compliance** | 15 | frontmatter 是否有效？description 是否完整？ |
| **D5: Progressive Disclosure** | 15 | 内容是否分层，以便按需加载？ |
| **D6: Freedom Calibration** | 15 | 具体程度是否适合 task fragility？ |
| **D7: Pattern Recognition** | 10 | 是否遵循既有官方模式？ |
| **D8: Practical Usability** | 15 | Agent 能否真正有效使用该 skill？ |

### Grading Scale

| 等级 | 百分比 | 含义 |
|-------|------------|---------|
| A | 90%+ (108+) | 优秀：可投入生产的专家 skill |
| B | 80-89% (96-107) | 良好：需要少量改进 |
| C | 70-79% (84-95) | 合格：改进路径明确 |
| D | 60-69% (72-83) | 低于平均：存在明显问题 |
| F | <60% (<72) | 较差：需要根本性重新设计 |

## Key Features

### Knowledge Classification System

本 skill 将内容区分为三类：

| 类型 | 定义 | 处理方式 |
|------|------------|-----------|
| **Expert** | Claude 确实不知道 | 必须保留，这是 skill 的价值所在 |
| **Activation** | Claude 知道，但未必会主动想起 | 简短时保留，发挥提醒作用 |
| **Redundant** | Claude 明确知道 | 应删除，避免浪费 tokens |

### Five Official Design Patterns

Skill Judge 识别五种既有 patterns，并据此评估：

| 模式 | 行数 | 适用场景 | 示例 |
|---------|-------|----------|---------|
| **Mindset** | ~50 | 需要品味的创作任务 | frontend-design |
| **Navigation** | ~30 | 多个不同的场景 | internal-comms |
| **Philosophy** | ~150 | 需要原创性的艺术或创作 | canvas-design |
| **Process** | ~200 | 多步骤复杂项目 | mcp-builder |
| **Tool** | ~300 | 对特定格式进行精确操作 | docx, pdf, xlsx |

### Common Failure Pattern Detection

本 skill 识别 9 种常见失败模式：

1. **The Tutorial**：解释 Claude 已经知道的基础知识
2. **The Dump**：把所有内容塞进一个 800 行以上的文件
3. **The Orphan References**：从不被加载的 reference files
4. **The Checkbox Procedure**：机械步骤，没有 thinking frameworks
5. **The Vague Warning**：只说“注意”，不给具体指导
6. **The Invisible Skill**：内容优秀，description 却很差
7. **The Wrong Location**：触发信息写在正文，而非 description
8. **The Over-Engineered**：存在不必要的辅助文件
9. **The Freedom Mismatch**：freedom 级别与任务类型不匹配

## Usage Examples

### Basic Evaluation

```
评估 skills/my-new-skill/SKILL.md 中的 skill
```

### Comparative Analysis

```
比较 skills/skill-a 与 skills/skill-b 的质量
```

### Targeted Improvement

```
如何改进我的 skill 的 knowledge delta？
```

### Pattern Identification

```
这个 skill 遵循哪种 pattern，这个选择是否恰当？
```

## Output

Skill Judge 输出结构化评估报告：

```markdown
# Skill Evaluation Report: [Skill Name]

## Summary
- **Total Score**: X/120 (X%)
- **Grade**: [A/B/C/D/F]
- **Pattern**: [Mindset/Navigation/Philosophy/Process/Tool]
- **Knowledge Ratio**: E:A:R = X:Y:Z
- **Verdict**: [一句话评估]

## Dimension Scores
[包含全部 8 个维度分数的表格]

## Critical Issues
[必须修复的问题]

## Top 3 Improvements
[按优先级排序的改进建议]

## Detailed Analysis
[对得分低于 80% 的维度深入分析]
```

## Best Practices

### When Evaluating Skills

**应该：**
- 始终先检查 description 字段，它最关键
- 阅读每节时都问：“Claude 已经知道这些吗？”
- 查找具体的 anti-patterns，以及不明显的原因
- 验证 decision trees 确实能引向正确选择
- 检查 loading triggers 是否嵌入 workflows

**绝不：**
- 因为内容看起来专业就打高分
- 忽视冗余解释带来的 token 浪费
- 被篇幅打动（43 行可能优于 500 行）
- 将基础知识的重复解释宽容地视为“有用背景”
- 只在正文中说明“何时使用”

### The Meta-Question

评估任何 skill 时，始终自问：

> “领域专家看到这份 skill，是否会说：‘没错，这里捕捉到了我花费多年才学到的知识’？”

如果是，skill 就有真实价值；否则，它只是在压缩 Claude 已经知道的内容。

## Quick Reference Checklist

```
SKILL 评估速查

KNOWLEDGE DELTA（最重要）：
  [ ] 不解释“什么是 X”等基本概念
  [ ] 不为标准操作提供逐步教程
  [ ] 有针对不明显选择的 decision trees
  [ ] 有只有专家才知道的 trade-offs
  [ ] 有来自实际经验的 edge cases

MINDSET + PROCEDURES:
  [ ] 传递 thinking patterns（如何思考问题）
  [ ] 有“做 X 之前，先问自己……”的框架
  [ ] 包含 Claude 不知道的 domain-specific procedures

ANTI-PATTERNS:
  [ ] 有明确的 NEVER 清单
  [ ] Anti-patterns 具体，而非模糊
  [ ] 包含 WHY（不明显的原因）

SPECIFICATION:
  [ ] YAML frontmatter 有效
  [ ] Description 回答 WHAT、WHEN、KEYWORDS
  [ ] Description 足够具体，能让 Agent 激活

STRUCTURE:
  [ ] SKILL.md < 500 行（理想为 < 300）
  [ ] Loading triggers 嵌入 workflow
  [ ] 有“不要加载”指导，防止加载过多内容

FREEDOM:
  [ ] 创作任务 -> High freedom（原则）
  [ ] 易出错的操作 -> Low freedom（精确的 scripts）

USABILITY:
  [ ] 针对多路径场景提供 decision trees
  [ ] 可运行的代码示例
  [ ] Error handling 和 fallbacks
```

## Prerequisites

无。Skill Judge 自成体系，不需要外部 tools 或依赖。

## Related Concepts

- **Tool vs Skill**：Tools 定义 capability boundaries（Claude 能做什么）。Skills 注入知识（Claude 知道如何做）。
- **Progressive Disclosure**：三层加载系统（metadata -> SKILL.md 正文 -> resources）
- **Freedom Calibration**：让约束程度与 task fragility 匹配
