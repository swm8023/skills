---
name: skill-judge
description: 根据官方规范与最佳实践评估 Agent Skill 的设计质量。在审查、审计或改进 SKILL.md 文件与 skill 包时使用，提供多维评分和可执行的改进建议。
---

# Skill Judge

根据官方规范及从 17 个以上官方示例中归纳的模式，评估 Agent Skills。

---

## Core Philosophy

### What is a Skill?

Skill 不是教程，而是**知识外化机制**。

传统 AI 的知识固化在模型参数中。要教会它新能力：
```
Traditional: Collect data → GPU cluster → Train → Deploy new version
Cost: $10,000 - $1,000,000+
Timeline: Weeks to months
```

Skills 改变了这一点：
```
Skill: Edit SKILL.md → Save → Takes effect on next invocation
Cost: $0
Timeline: Instant
```

这是从“训练 AI”到“教育 AI”的范式转变，像无需训练、可以热插拔的 LoRA 适配器。用自然语言编辑 Markdown 文件，模型的行为就会改变。

### The Core Formula

> **好 Skill = 专家独有知识 − Claude 已知内容**

Skill 的价值通过**知识增量**衡量，即它提供的内容与模型已有知识之间的差距。

- **专家独有知识**：决策树、取舍、边界情况、反模式、领域专属思维框架；这些通常需要多年经验积累
- **Claude 已知内容**：基本概念、标准库用法、常见编程模式、通用最佳实践

如果 skill 解释“什么是 PDF”或“怎样写 for 循环”，它就在压缩 Claude 已经拥有的知识。这是**浪费 tokens**：上下文窗口是共享资源，系统提示、对话历史、其他 skills 和用户请求都要使用。

### Tool vs Skill

| 概念 | 本质 | 作用 | 示例 |
|---------|---------|----------|---------|
| **Tool** | 模型能做什么 | 执行动作 | bash, read_file, write_file, WebSearch |
| **Skill** | 模型知道如何做什么 | 指导决策 | PDF 处理、MCP 构建、前端设计 |

工具定义能力边界：没有 bash 工具，模型就无法执行命令。
Skills 注入知识：没有 frontend-design skill，模型容易生成泛化的 UI。

**关系式**：
```
General Agent + Excellent Skill = Domain Expert Agent
```

同一个 Claude 模型加载不同的 skills，就能扮演不同专家。

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
| 0-5 | 解释 Claude 已知的基础知识（什么是 X、怎样写代码、标准库教程） |
| 6-10 | 混合内容：部分专家知识被显而易见的内容稀释 |
| 11-15 | 主要为专家知识，冗余很少 |
| 16-20 | 纯粹的知识增量，每段都值得占用相应 tokens |

**危险信号**（直接判为 ≤5 分）：
- “什么是[基本概念]”章节
- 标准操作的逐步教程
- 解释常用库的用法
- 通用最佳实践（“写整洁代码”“处理错误”）
- 定义行业通用术语

**良好信号**（高知识增量的表现）：
- 针对不明显选择的决策树（“X 失败时，尝试 Y，因为 Z”）
- 只有专家才知道的取舍（“A 更快，但 B 能处理边界情况 C”）
- 来自实际经验的边界情况
- “绝不做 X，因为[不明显的原因]”
- 领域专属思维框架

**评估问题**：
1. 对每节内容，问：“Claude 已经知道这些吗？”
2. 遇到解释，问：“这是在教 Claude，还是在替 Claude 准备要输出的解释？”
3. 统计 Expert、Activation、Redundant 段落的数量

---

### D2: Mindset + Appropriate Procedures (15 points)

Skill 是否同时传递专家**思维模式**和**必要的领域专属流程**？

专家与新手的差别，不在于知道怎样操作，而在于怎样思考问题。但如果 Claude 缺少某领域的操作知识，只提供思维模式也不够。

**关键区别**：
| 类型 | 示例 | 价值 |
|------|---------|-------|
| **思维模式** | “设计之前先问：什么会让它令人难忘？” | 高，影响决策方式 |
| **领域专属流程** | “OOXML 流程：解包 → 编辑 XML → 校验 → 打包” | 高，Claude 可能不知道 |
| **通用流程** | “第 1 步：打开文件；第 2 步：编辑；第 3 步：保存” | 低，Claude 已经知道 |

| 分数 | 标准 |
|-------|----------|
| 0-3 | 只有 Claude 已知的通用流程 |
| 4-7 | 有领域流程，但缺少思考框架 |
| 8-11 | 平衡良好：思维模式与领域专属流程兼具 |
| 12-15 | 专家水平：既塑造思维，又提供 Claude 不知道的操作流程 |

**有价值的流程包括**：
- Claude 未受过训练的流程（新工具、专有系统）
- 不明显的正确顺序（例如“打包前校验，而非打包后”）
- 容易遗漏的关键步骤（例如“编辑后必须重新计算公式”）
- 领域专属步骤序列（例如 MCP server 的四阶段开发流程）

**冗余流程包括**：
- 通用文件操作（打开、读取、写入、保存）
- 标准编程模式（循环、条件判断、错误处理）
- 已有完善文档的常用库用法

**专家思维模式示例**：
```markdown
Before [action], ask yourself:
- **Purpose**: What problem does this solve? Who uses it?
- **Constraints**: What are the hidden requirements?
- **Differentiation**: What makes this solution memorable?
```

**有价值的领域流程示例**：
```markdown
### Redlining Workflow (Claude wouldn't know this sequence)
1. Convert to markdown: `pandoc --track-changes=all`
2. Map text to XML: grep for text in document.xml
3. Implement changes in batches of 3-10
4. Pack and verify: check ALL changes were applied
```

**冗余的通用流程示例**：
```markdown
Step 1: Open the file
Step 2: Find the section
Step 3: Make the change
Step 4: Save and test
```

**检查方法**：
1. 是否告诉 Claude 应考虑什么？（思维模式）
2. 是否告诉 Claude 如何完成其原本不知道的操作？（领域流程）

好的 skill 会在需要时同时提供二者。

---

### D3: Anti-Pattern Quality (15 points)

Skill 是否有有效的 NEVER 清单？

**重要原因**：专家知识有一半是知道不要做什么。资深设计师看到白底紫色渐变，会本能地觉得“太像 AI 生成”。这种对禁忌的直觉来自无数次踩坑。

Claude 没踩过这些坑，不知道 Inter 字体被过度使用，也不知道紫色渐变成了 AI 内容的标志。好的 skill 必须明确写出这些“绝不”。

| 分数 | 标准 |
|-------|----------|
| 0-3 | 完全没有提及反模式 |
| 4-7 | 只有泛泛警告（“避免错误”“小心”“考虑边界情况”） |
| 8-11 | 有具体 NEVER 清单，并附部分理由 |
| 12-15 | 专家级反模式与原因，包含只有经验才能教会的知识 |

**专家反模式**（具体做法与原因）：
```markdown
NEVER use generic AI-generated aesthetics like:
- Overused font families (Inter, Roboto, Arial)
- Cliched color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Default border-radius on everything
```

**薄弱的反模式**（模糊、没有理由）：
```markdown
Avoid making mistakes.
Be careful with edge cases.
Don't write bad code.
```

**检查方法**：专家读完反模式清单，会说“我吃过亏才学会这些”，还是“这谁都知道”？

---

### D4: Specification Compliance — Especially Description (15 points)

Skill 是否符合官方格式要求？**重点检查 description 的质量。**

| 分数 | 标准 |
|-------|----------|
| 0-5 | 缺少 frontmatter，或格式无效 |
| 6-10 | 有 frontmatter，但 description 模糊或不完整 |
| 11-13 | frontmatter 有效，description 说明了做什么，但何时使用不充分 |
| 14-15 | 完整：description 同时包含功能、使用场景和触发关键词 |

**Frontmatter 要求**：
- `name`：仅小写字母、数字和连字符，不超过 64 个字符
- `description`：**最关键的字段**，决定 skill 是否会被使用

---

**为什么 description 是最重要的字段**：

```
┌─────────────────────────────────────────────────────────────────────┐
│  SKILL ACTIVATION FLOW                                              │
│                                                                     │
│  User Request → Agent sees ALL skill descriptions → Decides which  │
│                 (only descriptions, not bodies!)     to activate    │
│                                                                     │
│  If description doesn't match → Skill NEVER gets loaded            │
│  If description is vague → Skill might not trigger when it should  │
│  If description lacks keywords → Skill is invisible to the Agent   │
└─────────────────────────────────────────────────────────────────────┘
```

**现实是**：内容再好，description 不佳的 skill 也**没有用**，因为它不会被激活。description 是告诉 Agent“在这些场景使用我”的**唯一机会**。

---

**Description 必须回答三个问题**：

1. **WHAT**：skill 做什么？（功能）
2. **WHEN**：什么情况下应使用？（触发场景）
3. **KEYWORDS**：哪些词应触发这个 skill？（可检索词）

**优秀 description**（三个要素齐全）：
```yaml
description: "Comprehensive document creation, editing, and analysis with support
for tracked changes, comments, formatting preservation, and text extraction.
When Claude needs to work with professional documents (.docx files) for:
(1) Creating new documents, (2) Modifying or editing content,
(3) Working with tracked changes, (4) Adding comments, or any other document tasks"
```

分析：
- WHAT：创建、编辑、分析、修订跟踪、批注
- WHEN：“当 Claude 需要处理……，用于：(1)……(2)……(3)……”
- KEYWORDS：.docx 文件、修订跟踪、专业文档

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
description: "A helpful skill for various tasks"
```

这没有作用：Agent 不知道何时应该激活它。

---

**Description 质量清单**：
- [ ] 列出具体能力，而不是仅说“帮助处理 X”
- [ ] 包含明确触发场景（“Use when…”、“When user asks for…”）
- [ ] 包含可检索关键词（文件扩展名、领域术语、动作动词）
- [ ] 足够具体，让 Agent 精确知道何时使用
- [ ] 包含必须使用的情形，而非仅说“可以使用”

---

### D5: Progressive Disclosure (15 points)

Skill 是否实现了合理的内容分层？

Skill 的加载分为三层：
```
Layer 1: Metadata (always in memory)
         Only name + description
         ~100 tokens per skill

Layer 2: SKILL.md Body (loaded after triggering)
         Detailed guidelines, code examples, decision trees
         Ideal: < 500 lines

Layer 3: Resources (loaded on demand)
         scripts/, references/, assets/
         No limit
```

| 分数 | 标准 |
|-------|----------|
| 0-5 | 所有内容都塞在 SKILL.md 中（超过 500 行，没有结构） |
| 6-10 | 有参考资料，但不清楚何时加载 |
| 11-13 | 分层合理，并提供强制加载条件 |
| 14-15 | 完整：决策树、明确触发条件和“不要加载”指导 |

**有 references 目录的 skills**，应检查加载触发条件的质量：

| 触发条件质量 | 特征 |
|-----------------|-----------------|
| 差 | 文末只列参考资料，没有加载指导 |
| 一般 | 有部分触发条件，但未嵌入流程 |
| 好 | 在流程步骤中给出强制触发条件 |
| 优秀 | 场景识别、条件触发与“不要加载”指导兼备 |

**加载问题**：
```
Loading too little ◄─────────────────────────────────► Loading too much
- References sit unused                    - Wastes context space
- Agent doesn't know when to load          - Irrelevant info dilutes key content
- Knowledge is there but never accessed    - Unnecessary token overhead
```

**好的加载条件**（嵌入流程）：
```markdown
### Creating New Document

**MANDATORY - READ ENTIRE FILE**: Before proceeding, you MUST read
[`docx-js.md`](docx-js.md) (~500 lines) completely from start to finish.
**NEVER set any range limits when reading this file.**

**Do NOT load** `ooxml.md` or `redlining.md` for this task.
```

**差的加载条件**（仅列出来）：
```markdown
## References
- docx-js.md - for creating documents
- ooxml.md - for editing
- redlining.md - for tracking changes
```

**简单 skills**（没有 references，少于 100 行）：根据简洁程度及是否自成体系评分。

---

### D6: Freedom Calibration (15 points)

指令的精细程度，是否匹配任务对错误的敏感程度？

不同任务需要不同约束程度，关键在于让自由度与任务脆弱程度匹配。

| 分数 | 标准 |
|-------|----------|
| 0-5 | 严重不匹配：创作任务使用僵硬脚本，易出错操作却只有模糊指导 |
| 6-10 | 部分合适，仍有不匹配之处 |
| 11-13 | 大部分场景的自由度校准良好 |
| 14-15 | 全篇自由度校准准确 |

**自由度范围**：

| 任务类型 | 所需自由度 | 原因 | Skill 示例 |
|-----------|-------------|-----|---------------|
| 创作与设计 | 高 | 有多种有效方案，差异化本身有价值 | frontend-design |
| 代码审查 | 中 | 有原则可循，但仍需判断 | code-review |
| 文件格式操作 | 低 | 一个错误字节就可能损坏文件，一致性至关重要 | docx, xlsx, pdf |

**高自由度**（文字指令）：
```markdown
Commit to a BOLD aesthetic direction. Pick an extreme: brutally minimal,
maximalist chaos, retro-futuristic, organic natural...
```

**中自由度**（伪代码或参数化指令）：
```markdown
Review priority:
1. Security vulnerabilities (must fix)
2. Logic errors (must fix)
3. Performance issues (should fix)
4. Maintainability (optional)
```

**低自由度**（具体脚本、精确步骤）：
```markdown
**MANDATORY**: Use exact script in `scripts/create-doc.py`
Parameters: --title "X" --author "Y"
Do NOT modify the script.
```

**检查方法**：问“如果 Agent 出错，会造成什么后果？”
- 后果严重 → 低自由度
- 后果较轻 → 高自由度

---

### D7: Pattern Recognition (10 points)

Skill 是否遵循既有官方模式？

通过分析 17 个官方 skills，我们识别出五种主要设计模式：

| 模式 | 约行数 | 关键特征 | 示例 | 使用时机 |
|---------|--------|---------------------|---------|-------------|
| **Mindset** | ~50 | 思维重于技巧，强有力的 NEVER 清单，高自由度 | frontend-design | 需要品味的创作任务 |
| **Navigation** | ~30 | 精简 SKILL.md，分流至子文件 | internal-comms | 多个不同场景 |
| **Philosophy** | ~150 | 两步：理念 → 表达，重视工艺 | canvas-design | 需要原创性的艺术或创作 |
| **Process** | ~200 | 分阶段流程、检查点、中等自由度 | mcp-builder | 多步骤复杂项目 |
| **Tool** | ~300 | 决策树、代码示例、低自由度 | docx, pdf, xlsx | 对特定格式做精确操作 |

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
| 14-15 | 覆盖全面，包括边界情况与错误处理 |

**检查内容**：
- **决策树**：多路径场景下，是否清楚说明应选择哪条路径？
- **代码示例**：它们是否真的能运行？还是会出错的伪代码？
- **错误处理**：主要方案失败时怎么办？是否提供替代方案？
- **边界情况**：是否覆盖少见但真实存在的场景？
- **可执行性**：Agent 能否立即行动，还是需要自行摸索？

**可用性好的示例**（决策树与替代方案）：
```markdown
| Task | Primary Tool | Fallback | When to Use Fallback |
|------|-------------|----------|----------------------|
| Read text | pdftotext | PyMuPDF | Need layout info |
| Extract tables | camelot-py | tabula-py | camelot fails |

**Common issues**:
- Scanned PDF: pdftotext returns blank → Use OCR first
- Encrypted PDF: Permission error → Use PyMuPDF with password
```

**可用性差的示例**（模糊）：
```markdown
Use appropriate tools for PDF processing.
Handle errors properly.
Consider edge cases.
```

---

## NEVER Do When Evaluating

- **绝不**因为“看起来专业”或排版精美就打高分
- **绝不**忽视 token 浪费，每段冗余内容都应扣分
- **绝不**被篇幅打动，43 行的 skill 可以优于 500 行的 skill
- **绝不**跳过在脑中检验决策树：它们真能引向正确选择吗？
- **绝不**用“提供了有用背景”为解释基础知识开脱
- **绝不**忽略缺失的反模式，没有 NEVER 清单就是明显缺口
- **绝不**认为所有流程都有价值，应区分领域流程与通用流程
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
[ ] Check frontmatter validity
[ ] Count total lines in SKILL.md
[ ] List all reference files and their sizes
[ ] Identify which pattern the Skill follows
[ ] Check for loading triggers (if references exist)
```

### Step 3: Score Each Dimension

对 8 个维度逐一处理：
1. 找到具体证据（引用相关行）
2. 评分，并用一句话说明理由
3. 未得满分时，记录具体改进建议

### Step 4: Calculate Total & Grade

```
Total = D1 + D2 + D3 + D4 + D5 + D6 + D7 + D8
Max = 120 points
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
- **Verdict**: [One sentence assessment]

## Dimension Scores

| Dimension | Score | Max | Notes |
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
[List must-fix problems that significantly impact the Skill's effectiveness]

## Top 3 Improvements
1. [Highest impact improvement with specific guidance]
2. [Second priority improvement]
3. [Third priority improvement]

## Detailed Analysis
[For each dimension scoring below 80%, provide:
- What's missing or problematic
- Specific examples from the Skill
- Concrete suggestions for improvement]
```

---

## Common Failure Patterns

### Pattern 1: The Tutorial
```
Symptom: Explains what PDF is, how Python works, basic library usage
Root cause: Author assumes Skill should "teach" the model
Fix: Claude already knows this. Delete all basic explanations.
     Focus on expert decisions, trade-offs, and anti-patterns.
```

### Pattern 2: The Dump
```
Symptom: SKILL.md is 800+ lines with everything included
Root cause: No progressive disclosure design
Fix: Core routing and decision trees in SKILL.md (<300 lines ideal)
     Detailed content in references/, loaded on-demand
```

### Pattern 3: The Orphan References
```
Symptom: References directory exists but files are never loaded
Root cause: No explicit loading triggers
Fix: Add "MANDATORY - READ ENTIRE FILE" at workflow decision points
     Add "Do NOT Load" to prevent over-loading
```

### Pattern 4: The Checkbox Procedure
```
Symptom: Step 1, Step 2, Step 3... mechanical procedures
Root cause: Author thinks in procedures, not thinking frameworks
Fix: Transform into "Before doing X, ask yourself..."
     Focus on decision principles, not operation sequences
```

### Pattern 5: The Vague Warning
```
Symptom: "Be careful", "avoid errors", "consider edge cases"
Root cause: Author knows things can go wrong but hasn't articulated specifics
Fix: Specific NEVER list with concrete examples and non-obvious reasons
     "NEVER use X because [specific problem that takes experience to learn]"
```

### Pattern 6: The Invisible Skill
```
Symptom: Great content but skill rarely gets activated
Root cause: Description is vague, missing keywords, or lacks trigger scenarios
Fix: Description must answer WHAT, WHEN, and include KEYWORDS
     "Use when..." + specific scenarios + searchable terms

Example fix:
BAD:  "Helps with document tasks"
GOOD: "Create, edit, and analyze .docx files. Use when working with
       Word documents, tracked changes, or professional document formatting."
```

### Pattern 7: The Wrong Location
```
Symptom: "When to use this Skill" section in body, not in description
Root cause: Misunderstanding of three-layer loading
Fix: Move all triggering information to description field
     Body is only loaded AFTER triggering decision is made
```

### Pattern 8: The Over-Engineered
```
Symptom: README.md, CHANGELOG.md, INSTALLATION_GUIDE.md, CONTRIBUTING.md
Root cause: Treating Skill like a software project
Fix: Delete all auxiliary files. Only include what Agent needs for the task.
     No documentation about the Skill itself.
```

### Pattern 9: The Freedom Mismatch
```
Symptom: Rigid scripts for creative tasks, vague guidance for fragile operations
Root cause: Not considering task fragility
Fix: High freedom for creative (principles, not steps)
     Low freedom for fragile (exact scripts, no parameters)
```

---

## Quick Reference Checklist

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SKILL EVALUATION QUICK CHECK                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  KNOWLEDGE DELTA (most important):                                      │
│    [ ] No "What is X" explanations for basic concepts                   │
│    [ ] No step-by-step tutorials for standard operations                │
│    [ ] Has decision trees for non-obvious choices                       │
│    [ ] Has trade-offs only experts would know                           │
│    [ ] Has edge cases from real-world experience                        │
│                                                                         │
│  MINDSET + PROCEDURES:                                                  │
│    [ ] Transfers thinking patterns (how to think about problems)        │
│    [ ] Has "Before doing X, ask yourself..." frameworks                 │
│    [ ] Includes domain-specific procedures Claude wouldn't know         │
│    [ ] Distinguishes valuable procedures from generic ones              │
│                                                                         │
│  ANTI-PATTERNS:                                                         │
│    [ ] Has explicit NEVER list                                          │
│    [ ] Anti-patterns are specific, not vague                            │
│    [ ] Includes WHY (non-obvious reasons)                               │
│                                                                         │
│  SPECIFICATION (description is critical!):                              │
│    [ ] Valid YAML frontmatter                                           │
│    [ ] name: lowercase, ≤64 chars                                       │
│    [ ] description answers: WHAT does it do?                            │
│    [ ] description answers: WHEN should it be used?                     │
│    [ ] description contains trigger KEYWORDS                            │
│    [ ] description is specific enough for Agent to know when to use     │
│                                                                         │
│  STRUCTURE:                                                             │
│    [ ] SKILL.md < 500 lines (ideal < 300)                               │
│    [ ] Heavy content in references/                                     │
│    [ ] Loading triggers embedded in workflow                            │
│    [ ] Has "Do NOT Load" for preventing over-loading                    │
│                                                                         │
│  FREEDOM:                                                               │
│    [ ] Creative tasks → High freedom (principles)                       │
│    [ ] Fragile operations → Low freedom (exact scripts)                 │
│                                                                         │
│  USABILITY:                                                             │
│    [ ] Decision trees for multi-path scenarios                          │
│    [ ] Working code examples                                            │
│    [ ] Error handling and fallbacks                                     │
│    [ ] Edge cases covered                                               │
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

最好的 skills 是**浓缩的专家知识**：将设计师十年积累的审美判断浓缩成 43 行，或将文档专家的操作经验浓缩成 200 行决策树。

被压缩的内容必须是 Claude 原本没有的知识，否则这种压缩没有价值。

---

## Self-Evaluation Note

这个 skill（skill-judge）自身也应通过评估：

- **Knowledge Delta**：提供 Claude 不会自行生成的具体评估标准
- **Mindset**：塑造评价 skill 质量的思路，而不只是列出清单
- **Anti-Patterns**：“NEVER Do When Evaluating”章节给出具体禁忌
- **Specification**：frontmatter 有效，description 完整
- **Progressive Disclosure**：自成体系，不需要外部参考资料
- **Freedom**：中等自由度，适合评估任务
- **Pattern**：遵循 Tool 模式，提供决策框架
- **Usability**：协议、报告模板和速查资料清楚



用本 skill 评估它自身，作为校准练习。
