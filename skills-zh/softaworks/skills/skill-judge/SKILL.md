---
name: skill-judge
description: 根据官方规范与 best practices 评估 Agent Skill 的设计质量。在 review、audit 或改进 SKILL.md 文件和 skill 包时使用。提供多维评分和可执行的改进建议。
---

# Skill Judge

根据官方规范及从 17 个以上官方示例中归纳的模式，评估 Agent Skills。

---

## Core Philosophy

### What is a Skill?

Skill 不是教程。Skill 是一种 **knowledge externalization mechanism**。

传统 AI 的知识锁在 model parameters 中。要传授新能力：
```
传统方式：收集数据 → GPU cluster → 训练 → 部署新版本
成本：$10,000 - $1,000,000+
时间：几周到几个月
```

Skills 改变了这一点：
```
Skill：编辑 SKILL.md → 保存 → 下次调用生效
成本：$0
时间：立即
```

这是从“训练 AI”到“教育 AI”的范式转变——就像无需训练、可以热插拔的 LoRA adapter。用自然语言编辑 Markdown 文件，model 的行为就会改变。

### The Core Formula

> **好 Skill = 专家独有知识 − Claude 已知内容**

Skill 的价值通过其 **knowledge delta** 衡量——即它提供的内容与 model 已有知识之间的差距。

- **Expert-only knowledge**：decision trees、trade-offs、edge cases、anti-patterns、domain-specific thinking frameworks——需要多年经验才能积累的内容
- **What Claude already knows**：基本概念、standard library 用法、常见 programming patterns、通用 best practices

当 Skill 解释“什么是 PDF”或“怎样写 for-loop”时，它就在压缩 Claude 已有的知识。这是 **token 浪费**——context window 是共享资源，system prompts、对话历史、其他 Skills 和用户请求都要使用。

### Tool vs Skill

| 概念 | 本质 | 作用 | 示例 |
|---------|---------|----------|---------|
| **Tool** | model 能做什么 | 执行动作 | bash, read_file, write_file, WebSearch |
| **Skill** | model 知道如何做什么 | 指导决策 | PDF 处理、MCP 构建、frontend design |

Tools 定义 capability boundaries——没有 bash tool，model 就不能执行命令。
Skills 注入知识——没有 frontend-design Skill，model 就会生成 generic UI。

**关系式**：
```
General Agent + Excellent Skill = Domain Expert Agent
```

同一个 Claude model 加载不同的 Skills，就会成为不同的专家。

### Three Types of Knowledge in Skills

评估时，将每节内容分类：

| 类型 | 定义 | 处理方式 |
|------|------------|-----------|
| **Expert** | Claude 确实不知道的内容 | 必须保留，这是 skill 的价值所在 |
| **Activation** | Claude 知道，但未必会主动想起 | 简短时保留，发挥提醒作用 |
| **Redundant** | Claude 明确知道的内容 | 应删除，避免浪费 tokens |

Skill 设计的要点是尽量增加 Expert 内容，节制使用 Activation，坚决删除 Redundant。

---

## Evaluation Dimensions (120 points total)

### D1: Knowledge Delta (20 points) — THE CORE DIMENSION

这是最重要的维度：skill 是否增加了真正的专家知识？

| 分数 | 标准 |
|-------|----------|
| 0-5 | 解释 Claude 已知的基础知识（什么是 X、怎样写代码、standard library 教程） |
| 6-10 | 混合内容：部分专家知识被显而易见的内容稀释 |
| 11-15 | 主要为专家知识，冗余很少 |
| 16-20 | 纯粹的 knowledge delta——每一段都值得占用它的 tokens |

**Red flags**（直接判为 ≤5 分）：
- “什么是[基本概念]”章节
- 标准操作的逐步教程
- 解释常用库的用法
- 通用 best practices（“写整洁代码”“处理错误”）
- 定义行业通用术语

**Green flags**（高 knowledge delta 的迹象）：
- 针对不明显选择的 decision trees（“X 失败时，尝试 Y，因为 Z”）
- 只有专家才知道的 trade-offs（“A 更快，但 B 能处理 edge case C”）
- 来自实际经验的 edge cases
- “绝不做 X，因为[不明显的原因]”
- 领域专属 thinking frameworks

**评估问题**：
1. 对每节内容，问：“Claude 已经知道这些吗？”
2. 如果在解释某事，问：“这是在向 Claude 解释，还是在替 Claude 解释？”
3. 统计 Expert、Activation、Redundant 段落的数量

---

### D2: Mindset + Appropriate Procedures (15 points)

Skill 是否同时传递专家的 **thinking patterns** 和 **必要的 domain-specific procedures**？

专家与新手的差别，不在于“知道怎样操作”，而在于“怎样思考问题”。但当 Claude 缺少 domain-specific procedural knowledge 时，单靠 thinking patterns 并不够。

**关键区别**：
| 类型 | 示例 | 价值 |
|------|---------|-------|
| **Thinking patterns** | “设计之前，先问：什么会让它令人难忘？” | 高——影响决策方式 |
| **Domain-specific procedures** | “OOXML workflow：解包 → 编辑 XML → 验证 → 打包” | 高——Claude 可能不知道 |
| **Generic procedures** | “第 1 步：打开文件；第 2 步：编辑；第 3 步：保存” | 低——Claude 已经知道 |

| 分数 | 标准 |
|-------|----------|
| 0-3 | 只有 Claude 已知的 generic procedures |
| 4-7 | 有 domain procedures，但缺少 thinking frameworks |
| 8-11 | 平衡良好：thinking patterns + domain-specific workflows |
| 12-15 | 专家水平：既塑造思维，又提供 Claude 不知道的 procedures |

**有价值的流程包括**：
- Claude 未受过相关训练的 workflows（新 tools、专有系统）
- 不明显的正确顺序（例如“打包前验证，而不是打包后”）
- 容易遗漏的关键步骤（例如“编辑后必须重新计算公式”）
- Domain-specific sequences（例如 MCP server 的四阶段开发过程）

**冗余流程包括**：
- 通用文件操作（打开、读取、写入、保存）
- 标准 programming patterns（loops、conditionals、error handling）
- 已有完善文档的常用 library 用法

**专家 thinking patterns 的示例**：
```markdown
在 [行动] 之前，先问自己：
- **Purpose**：这解决什么问题？谁使用它？
- **Constraints**：有哪些隐藏要求？
- **Differentiation**：什么会让这个方案令人难忘？
```

**有价值的领域流程示例**：
```markdown
### Redlining Workflow (Claude wouldn't know this sequence)
1. 转换为 markdown：`pandoc --track-changes=all`
2. 将文本映射到 XML：在 document.xml 中 grep 文本
3. 每批实施 3-10 项变更
4. 打包并验证：检查所有变更均已应用
```

**冗余的通用流程示例**：
```markdown
第 1 步：打开文件
第 2 步：找到相关章节
第 3 步：作出变更
第 4 步：保存并测试
```

**检查方法**：
1. 是否告诉 Claude 应考虑什么？（thinking patterns）
2. 是否告诉 Claude 如何完成其原本不知道的操作？（domain procedures）

好的 skill 会在需要时同时提供二者。

---

### D3: Anti-Pattern Quality (15 points)

Skill 是否有有效的 NEVER 清单？

**重要原因**：专家知识有一半是知道不要做什么。资深设计师看到白色背景上的紫色 gradient，会本能地反感——“太像 AI 生成了”。这种“绝对不要做什么”的直觉来自无数次踩坑。

Claude 没踩过这些坑。它不知道 Inter font 被过度使用，也不知道紫色 gradients 是 AI 生成内容的特征。好的 Skills 必须明确写出这些“绝不”。

| 分数 | 标准 |
|-------|----------|
| 0-3 | 未提及 anti-patterns |
| 4-7 | 泛泛的警告（“避免错误”“小心”“考虑 edge cases”） |
| 8-11 | 有具体 NEVER 清单，并附部分理由 |
| 12-15 | 专家级 anti-patterns，附带 WHY——只有经验才能教会的内容 |

**专家 anti-patterns**（具体做法 + 原因）：
```markdown
绝不采用千篇一律的 AI 生成审美，例如：
- 过度使用的 font families（Inter、Roboto、Arial）
- 陈旧的 color schemes（尤其是白色背景上的紫色 gradients）
- 可预见的 layouts 和 component patterns
- 给所有东西都用默认 border-radius
```

**薄弱的 anti-patterns**（模糊，没有原因）：
```markdown
避免犯错。
小心处理 edge cases。
不要写糟糕的代码。
```

**检查方法**：专家读完 anti-pattern 清单，会说“没错，我吃过亏才学会这些”，还是“这对所有人都显而易见”？

---

### D4: Specification Compliance — Especially Description (15 points)

Skill 是否符合官方格式要求？**重点检查 description 的质量。**

| 分数 | 标准 |
|-------|----------|
| 0-5 | 缺少 frontmatter，或格式无效 |
| 6-10 | 有 frontmatter，但 description 模糊或不完整 |
| 11-13 | frontmatter 有效，description 说明了做什么，但何时使用不充分 |
| 14-15 | 完美：全面的 description，包含 WHAT、WHEN 和 trigger keywords |

**Frontmatter 要求**：
- `name`：仅小写字母、数字和连字符，不超过 64 个字符
- `description`：**最关键的字段**，决定 skill 是否会被使用

---

**为什么 description 是最重要的字段**：

```
┌─────────────────────────────────────────────────────────────────────┐
│  SKILL 激活流程                                                     │
│                                                                     │
│  用户请求 → Agent 看到所有 skill descriptions → 决定激活哪个       │
│                 （只有 descriptions，没有正文！）                   │
│                                                                     │
│  description 不匹配 → Skill 绝不会被加载                           │
│  description 模糊 → Skill 可能未在应当触发时触发                   │
│  description 缺少 keywords → Skill 对 Agent 不可见                 │
└─────────────────────────────────────────────────────────────────────┘
```

**残酷的事实**：内容完美但 description 不佳的 Skill **毫无用处**——它永远不会被激活。description 是告诉 Agent“在这些场景使用我”的**唯一机会**。

---

**Description 必须回答三个问题**：

1. **WHAT**：skill 做什么？（功能）
2. **WHEN**：什么情况下应使用？（触发场景）
3. **KEYWORDS**：哪些词应触发这个 skill？（可检索词）

**优秀 description**（三个要素齐全）：
```yaml
description: "全面的文档创建、编辑和分析，支持
tracked changes、comments、保留格式以及提取文本。
当 Claude 需要处理专业文档（.docx 文件），用于：
(1) 创建新文档，(2) 修改或编辑内容，
(3) 处理 tracked changes，(4) 添加 comments，或任何其他文档任务时使用"
```

分析：
- WHAT：创建、编辑、分析、tracked changes、comments
- WHEN：“当 Claude 需要处理……，用于：(1)……(2)……(3)……”
- KEYWORDS：.docx 文件、tracked changes、专业文档

**较差的 description**（缺少要素）：
```yaml
description: "处理文档相关功能"
```

问题：
- WHAT：模糊（“文档相关功能”具体是什么？）
- WHEN：缺失（Agent 何时应该使用？）
- KEYWORDS：缺失（没有“.docx”，也没有具体场景）

**另一个较差示例**：
```yaml
description: "帮助处理各种任务的 skill"
```

这没有作用：Agent 不知道何时应该激活它。

---

**Description 质量清单**：
- [ ] 列出具体能力，而不是仅说“帮助处理 X”
- [ ] 包含明确的触发场景（“在……时使用”、“当用户要求……”）
- [ ] 包含可检索关键词（文件扩展名、领域术语、动作动词）
- [ ] 足够具体，让 Agent 精确知道何时使用
- [ ] 包含必须使用的情形，而非仅说“可以使用”

---

### D5: Progressive Disclosure (15 points)

Skill 是否实现了恰当的 content layering？

Skill 的加载分为三层：
```
第 1 层：Metadata（始终驻留内存）
         只有 name + description
         每个 skill 约 100 tokens

第 2 层：SKILL.md 正文（触发后加载）
         详细指导、代码示例、decision trees
         理想情况：< 500 行

第 3 层：Resources（按需加载）
         scripts/, references/, assets/
         无限制
```

| 分数 | 标准 |
|-------|----------|
| 0-5 | 所有内容都塞在 SKILL.md 中（超过 500 行，没有结构） |
| 6-10 | 有 references，但不清楚何时加载 |
| 11-13 | 分层良好，且有强制 triggers |
| 14-15 | 完美：decision trees + 明确的 triggers + “不要加载”指导 |

**有 references 目录的 Skills**，检查 Loading Trigger Quality：

| Trigger Quality | 特征 |
|-----------------|-----------------|
| 差 | 在末尾列出 references，没有加载指导 |
| 一般 | 有些 triggers，但未嵌入 workflow |
| 好 | workflow 步骤中有强制 triggers |
| 优秀 | 场景检测 + 条件 triggers + “不要加载” |

**加载问题**：
```
加载过少 ◄─────────────────────────────────► 加载过多
- References 闲置未用                  - 浪费 context 空间
- Agent 不知道何时加载                 - 无关信息稀释关键内容
- 知识虽在，却从未访问                 - 不必要的 token 开销
```

**好的 loading trigger**（嵌入 workflow）：
```markdown
### Creating New Document

**强制 - 阅读整个文件**：继续之前，你必须完整阅读
[`docx-js.md`](docx-js.md)（约 500 行），从头到尾。
**阅读这个文件时，绝不设置任何范围限制。**

本任务**不要加载** `ooxml.md` 或 `redlining.md`。
```

**差的 loading trigger**（仅列出来）：
```markdown
## References
- docx-js.md - 用于创建文档
- ooxml.md - 用于编辑
- redlining.md - 用于 tracked changes
```

**简单 skills**（没有 references，少于 100 行）：根据简洁程度及是否自成体系评分。

---

### D6: Freedom Calibration (15 points)

具体程度是否适合 task fragility？

不同任务需要不同程度的约束。这是为了让 freedom 与 fragility 匹配。

| 分数 | 标准 |
|-------|----------|
| 0-5 | 严重不匹配（创作任务使用僵硬的 scripts，易出错的操作却只有模糊指导） |
| 6-10 | 部分合适，仍有不匹配之处 |
| 11-13 | 大部分场景的 Freedom Calibration 良好 |
| 14-15 | 全篇 Freedom Calibration 完美 |

**freedom 范围**：

| 任务类型 | 应具有的条件 | 原因 | Skill 示例 |
|-----------|-------------|-----|---------------|
| 创作/设计 | High freedom | 多种有效方法，差异化就是价值 | frontend-design |
| Code review | Medium freedom | 有原则可循，但仍需判断 | code-review |
| 文件格式操作 | Low freedom | 一个错误字节就会损坏文件，一致性至关重要 | docx, xlsx, pdf |

**High freedom**（文字指令）：
```markdown
坚持大胆的 aesthetic direction。选择一种极端：brutally minimal、
maximalist chaos、retro-futuristic、organic natural……
```

**Medium freedom**（pseudocode 或参数化指令）：
```markdown
Review 优先级：
1. Security vulnerabilities（必须修复）
2. Logic errors（必须修复）
3. Performance issues（应当修复）
4. Maintainability（可选）
```

**Low freedom**（具体 scripts、精确步骤）：
```markdown
**强制**：使用 `scripts/create-doc.py` 中的原样 script
参数：--title "X" --author "Y"
不要修改 script。
```

**检查方法**：问“如果 Agent 出错，会造成什么后果？”
- 后果严重 → Low freedom
- 后果较轻 → High freedom

---

### D7: Pattern Recognition (10 points)

Skill 是否遵循既有官方模式？

通过分析 17 个官方 skills，我们识别出五种主要 design patterns：

| 模式 | 约行数 | 关键特征 | 示例 | 使用时机 |
|---------|--------|---------------------|---------|-------------|
| **Mindset** | ~50 | 思维重于技巧，强有力的 NEVER 清单，高 freedom | frontend-design | 需要品味的创作任务 |
| **Navigation** | ~30 | 精简 SKILL.md，分流至子文件 | internal-comms | 多个不同场景 |
| **Philosophy** | ~150 | 两步：Philosophy → Express，强调工艺 | canvas-design | 需要原创性的艺术或创作 |
| **Process** | ~200 | 分阶段 workflow、checkpoints、medium freedom | mcp-builder | 多步骤复杂项目 |
| **Tool** | ~300 | decision trees、代码示例、low freedom | docx, pdf, xlsx | 对特定格式做精确操作 |

| 分数 | 标准 |
|-------|----------|
| 0-3 | 无法识别模式，结构混乱 |
| 4-6 | 部分遵循某种模式，但偏差明显 |
| 7-8 | 模式清晰，偏差很小 |
| 9-10 | 熟练应用适当模式 |

**模式选择指南**：

| 任务特征 | 推荐模式 |
|---------------------------|---------------------|
| 需要品味和创造力 | Mindset（约 50 行） |
| 需要原创性和工艺质量 | Philosophy（约 150 行） |
| 包含多个不同子场景 | Navigation（约 30 行） |
| 多步骤复杂项目 | Process（约 200 行） |
| 对特定格式做精确操作 | Tool（约 300 行） |

---

### D8: Practical Usability (15 points)

Agent 能否真正有效使用这个 skill？

| 分数 | 标准 |
|-------|----------|
| 0-5 | 指导混乱、不完整、矛盾，或未经检验 |
| 6-10 | 可以使用，但有明显缺口 |
| 11-13 | 常见场景的指导清楚 |
| 14-15 | 覆盖全面，包括 edge cases 和 error handling |

**检查内容**：
- **Decision trees**：多路径场景下，是否清楚说明应选择哪条路径？
- **Code examples**：它们是否确实能运行？还是会出错的 pseudocode？
- **Error handling**：主要方法失败时怎么办？是否提供 fallbacks？
- **Edge cases**：是否覆盖少见但真实的场景？
- **Actionability**：Agent 能否立即行动，还是需要自行摸索？

**可用性好的示例**（decision tree + fallback）：
```markdown
| 任务 | 主要 Tool | Fallback | 何时使用 Fallback |
|------|-------------|----------|----------------------|
| 读取文本 | pdftotext | PyMuPDF | 需要布局信息 |
| 提取表格 | camelot-py | tabula-py | camelot 失败 |

**常见问题**：
- 扫描 PDF：pdftotext 返回空白 → 先使用 OCR
- 加密 PDF：Permission error → 使用 PyMuPDF 并提供密码
```

**可用性差的示例**（模糊）：
```markdown
使用合适的 tools 处理 PDF。
妥善处理 errors。
考虑 edge cases。
```

---

## NEVER Do When Evaluating

- **绝不**仅因为“看起来专业”或格式良好就打高分
- **绝不**忽视 token 浪费，每段冗余内容都应扣分
- **绝不**被篇幅打动，43 行的 skill 可以优于 500 行的 skill
- **绝不**跳过在脑中检验 decision trees：它们真能引向正确选择吗？
- **绝不**用“但它提供了有用的 context”为解释基础知识开脱
- **绝不**忽视缺失的 anti-patterns——没有 NEVER 清单就是明显缺口
- **绝不**认为所有 procedures 都有价值——应区分 domain-specific 与 generic
- **绝不**低估 description 字段，description 差就意味着 skill 不会被使用
- **绝不**只在正文说明何时使用，Agent 加载前只能看到 description

---

## Evaluation Protocol

### Step 1: First Pass — Knowledge Delta Scan

完整阅读 SKILL.md，对每节自问：
> “Claude 已经知道这些吗？”

将每节标记为：
- **[E] Expert**：Claude 确实不知道，增加价值
- **[A] Activation**：Claude 知道，但简短提醒有用，可以保留
- **[R] Redundant**：Claude 明确知道，应删除

估算 E:A:R 的比例
- 好 Skill：Expert >70%，Activation <20%，Redundant <10%
- 一般 Skill：Expert 40-70%，Activation 较多
- 差 Skill：Expert <40%，Redundant 较多

### Step 2: Structure Analysis

```
[ ] 检查 frontmatter 的有效性
[ ] 统计 SKILL.md 的总行数
[ ] 列出全部 reference files 及其大小
[ ] 识别 Skill 遵循的 pattern
[ ] 检查 loading triggers（如果存在 references）
```

### Step 3: Score Each Dimension

对 8 个维度逐一处理：
1. 找到具体证据（引用相关行）
2. 评分，并用一句话说明理由
3. 未得满分时，记录具体改进建议

### Step 4: Calculate Total & Grade

```
Total = D1 + D2 + D3 + D4 + D5 + D6 + D7 + D8
Max = 120 分
```

**等级标准**（按百分比）：
| 等级 | 百分比 | 含义 |
|-------|------------|---------|
| A | 90%+ (108+) | 优秀：可投入生产的专家 skill |
| B | 80-89% (96-107) | 良好：需要少量改进 |
| C | 70-79% (84-95) | 合格：改进路径明确 |
| D | 60-69% (72-83) | 低于平均：存在明显问题 |
| F | <60% (<72) | 较差：需要根本性重新设计 |

### Step 5: Generate Report

```markdown
# Skill Evaluation Report: [Skill Name]

## Summary
- **Total Score**: X/120 (X%)
- **Grade**: [A/B/C/D/F]
- **Pattern**: [Mindset/Navigation/Philosophy/Process/Tool]
- **Knowledge Ratio**: E:A:R = X:Y:Z
- **Verdict**: [一句话评估]

## Dimension Scores

| 维度 | 分数 | 满分 | 备注 |
|-----------|-------|-----|-------|
| D1: Knowledge Delta | X | 20 | |
| D2: Mindset vs Mechanics | X | 15 | |
| D3: Anti-Pattern Quality | X | 15 | |
| D4: Specification Compliance | X | 15 | |
| D5: Progressive Disclosure | X | 15 | |
| D6: Freedom Calibration | X | 15 | |
| D7: Pattern Recognition | X | 10 | |
| D8: Practical Usability | X | 15 | |

## Critical Issues
[列出明显影响 Skill 效用、必须修复的问题]

## Top 3 Improvements
1. [影响最大的改进，附具体指导]
2. [第二优先级的改进]
3. [第三优先级的改进]

## Detailed Analysis
[对于每个得分低于 80% 的维度，说明：
- 缺失或有问题的内容
- Skill 中的具体示例
- 具体的改进建议]
```

---

## Common Failure Patterns

### Pattern 1: The Tutorial
```
现象：解释 PDF 是什么、Python 如何工作、library 的基本用法
根因：作者认为 Skill 应“教会”model
修复：Claude 已经知道这些。删除所有基础解释。
     聚焦专家决策、trade-offs 和 anti-patterns。
```

### Pattern 2: The Dump
```
现象：SKILL.md 超过 800 行，所有内容都塞在里面
根因：没有 Progressive Disclosure 设计
修复：核心 routing 和 decision trees 放在 SKILL.md 中（理想为 <300 行）
     详细内容放在 references/ 中，按需加载
```

### Pattern 3: The Orphan References
```
现象：References 目录存在，但文件从不被加载
根因：没有明确的 loading triggers
修复：在 workflow 决策点添加“强制 - 阅读整个文件”
     添加“不要加载”指导，防止加载过多内容
```

### Pattern 4: The Checkbox Procedure
```
现象：第 1 步、第 2 步、第 3 步……机械的 procedures
根因：作者只考虑 procedures，不考虑 thinking frameworks
修复：转换为“做 X 之前，先问自己……”
     聚焦决策原则，而非操作顺序
```

### Pattern 5: The Vague Warning
```
现象：“小心”“避免错误”“考虑 edge cases”
根因：作者知道可能出错，但没有明确说出具体内容
修复：具体的 NEVER 清单，附具体示例及不明显的原因
     “绝不使用 X，因为[需要经验才能认识到的具体问题]”
```

### Pattern 6: The Invisible Skill
```
现象：内容优秀，但 skill 很少被激活
根因：Description 模糊、缺少 keywords，或缺少触发场景
修复：Description 必须回答 WHAT、WHEN，并包含 KEYWORDS
     “在……时使用” + 具体场景 + 可检索词

修复示例：
差：  “帮助处理文档任务”
好： “创建、编辑并分析 .docx 文件。在处理
       Word 文档、tracked changes 或专业文档格式时使用。”
```

### Pattern 7: The Wrong Location
```
现象：正文中有“何时使用本 Skill”章节，而 description 中没有
根因：误解了三层加载机制
修复：将全部触发信息移至 description 字段
     正文只在作出触发决定之后才加载
```

### Pattern 8: The Over-Engineered
```
现象：README.md、CHANGELOG.md、INSTALLATION_GUIDE.md、CONTRIBUTING.md
根因：把 Skill 当成软件项目
修复：删除全部辅助文件。只包含 Agent 执行任务所需的内容。
     不写关于 Skill 本身的文档。
```

### Pattern 9: The Freedom Mismatch
```
现象：创作任务使用僵硬的 scripts，易出错操作却只有模糊指导
根因：没有考虑 task fragility
修复：创作任务采用 high freedom（原则，而非步骤）
     易出错操作采用 low freedom（精确 scripts，无参数）
```

---

## Quick Reference Checklist

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SKILL 评估速查                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  KNOWLEDGE DELTA（最重要）：                                            │
│    [ ] 不解释“什么是 X”等基本概念                                       │
│    [ ] 不为标准操作提供逐步教程                                         │
│    [ ] 有针对不明显选择的 decision trees                                │
│    [ ] 有只有专家才知道的 trade-offs                                    │
│    [ ] 有来自实际经验的 edge cases                                      │
│                                                                         │
│  MINDSET + PROCEDURES:                                                  │
│    [ ] 传递 thinking patterns（如何思考问题）                           │
│    [ ] 有“做 X 之前，先问自己……”的框架                                  │
│    [ ] 包含 Claude 不知道的 domain-specific procedures                  │
│    [ ] 区分有价值的 procedures 与 generic procedures                    │
│                                                                         │
│  ANTI-PATTERNS:                                                         │
│    [ ] 有明确的 NEVER 清单                                              │
│    [ ] Anti-patterns 具体，而非模糊                                     │
│    [ ] 包含 WHY（不明显的原因）                                         │
│                                                                         │
│  SPECIFICATION（description 至关重要！）：                              │
│    [ ] YAML frontmatter 有效                                            │
│    [ ] name：小写，≤64 字符                                             │
│    [ ] description 回答：WHAT，它做什么？                               │
│    [ ] description 回答：WHEN，应在何时使用？                           │
│    [ ] description 包含触发 KEYWORDS                                    │
│    [ ] description 足够具体，让 Agent 知道何时使用                      │
│                                                                         │
│  STRUCTURE:                                                             │
│    [ ] SKILL.md < 500 行（理想为 < 300）                                │
│    [ ] 大量内容放在 references/ 中                                      │
│    [ ] Loading triggers 嵌入 workflow                                   │
│    [ ] 有“不要加载”指导，防止加载过多内容                               │
│                                                                         │
│  FREEDOM:                                                               │
│    [ ] 创作任务 → High freedom（原则）                                  │
│    [ ] 易出错操作 → Low freedom（精确 scripts）                         │
│                                                                         │
│  USABILITY:                                                             │
│    [ ] 针对多路径场景提供 decision trees                                │
│    [ ] 可运行的代码示例                                                 │
│    [ ] Error handling 和 fallbacks                                      │
│    [ ] 覆盖 edge cases                                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## The Meta-Question

评估任何 skill 时，始终回到这个根本问题：

> **“领域专家看到这个 skill，会不会说：**
> **‘没错，这里捕捉到了我花费多年才学到的知识’？”**

如果答案是“会” → skill 就有真实价值。
如果答案是“不会” → 它只是在压缩 Claude 已知的内容。

最好的 Skills 是**浓缩的专家头脑**——把设计师 10 年积累的审美浓缩成 43 行，或把文档专家的操作经验浓缩成 200 行 decision tree。

被压缩的内容必须是 Claude 没有的东西。否则，就是垃圾压缩。

---

## Self-Evaluation Note

这个 skill（skill-judge）自身也应通过评估：

- **Knowledge Delta**：提供 Claude 不会自行生成的具体评估标准
- **Mindset**：塑造评价 skill 质量的思路，而不只是列出清单
- **Anti-Patterns**：“NEVER Do When Evaluating”章节给出具体禁忌
- **Specification**：frontmatter 有效，description 完整
- **Progressive Disclosure**：自成体系，不需要外部 references
- **Freedom**：中等 freedom，适合评估任务
- **Pattern**：遵循 Tool pattern，提供决策框架
- **Usability**：清楚的 protocol、报告模板和 quick reference



用本 skill 评估它自身，作为校准练习。
