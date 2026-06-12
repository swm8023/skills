# Skill 编写最佳实践

> 学习如何编写 Claude 能够发现并成功使用的有效 Skill。

好的 Skill 简洁、结构良好，并经过真实使用测试。本指南提供实用的编写决策建议，帮助你编写 Claude 能够发现并有效使用的 Skill。

关于 Skill 工作原理的概念性背景，请参阅 [Skills 概览](/en/docs/agents-and-tools/agent-skills/overview)。

## 核心原则

### 简洁是关键

[context window](https://platform.claude.com/docs/en/build-with-claude/context-windows) 是公共资源。你的 Skill 与 Claude 需要知道的所有其他内容共享 context window，包括：

* 系统 prompt
* 对话历史
* 其他 Skill 的 metadata
* 你的实际请求

并非你 Skill 中的每个 token 都有立即的成本。在启动时，只有所有 Skill 的 metadata（name 和 description）会被预加载。Claude 仅在 Skill 变得相关时才读取 SKILL.md，并仅在需要时读取额外文件。然而，在 SKILL.md 中保持简洁仍然重要：一旦 Claude 加载它，每个 token 都会与对话历史和其他 context 竞争。

**默认假设**：Claude 已经非常聪明

只添加 Claude 尚不具备的 context。质询每条信息：

* "Claude 真的需要这个解释吗？"
* "我能假设 Claude 已经知道这个吗？"
* "这一段是否对得起它消耗的 token 成本？"

**好的示例：简洁**（约 50 个 token）：

````markdown  theme={null}
## Extract PDF text

Use pdfplumber for text extraction:

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
````

**坏的示例：过于啰嗦**（约 150 个 token）：

```markdown  theme={null}
## Extract PDF text

PDF (Portable Document Format) files are a common file format that contains
text, images, and other content. To extract text from a PDF, you'll need to
use a library. There are many libraries available for PDF processing, but we
recommend pdfplumber because it's easy to use and handles most cases well.
First, you'll need to install it using pip. Then you can use the code below...
```

简洁的版本假设 Claude 知道 PDF 是什么以及库如何工作。

### 设置合适的自由度

将具体性级别与任务的脆弱性和可变性匹配。

**高自由度**（基于文本的指令）：

适用于：

* 多种方法都有效
* 决策依赖于 context
* 启发式规则指导方法

示例：

```markdown  theme={null}
## Code review process

1. Analyze the code structure and organization
2. Check for potential bugs or edge cases
3. Suggest improvements for readability and maintainability
4. Verify adherence to project conventions
```

**中等自由度**（伪代码或带参数的脚本）：

适用于：

* 存在首选模式
* 可以接受一些变化
* 配置会影响行为

示例：

````markdown  theme={null}
## Generate report

Use this template and customize as needed:

```python
def generate_report(data, format="markdown", include_charts=True):
    # Process data
    # Generate output in specified format
    # Optionally include visualizations
```
````

**低自由度**（具体脚本，少量或没有参数）：

适用于：

* 操作脆弱且易出错
* 一致性至关重要
* 必须遵循特定顺序

示例：

````markdown  theme={null}
## Database migration

Run exactly this script:

```bash
python scripts/migrate.py --verify --backup
```

Do not modify the command or add additional flags.
````

**类比**：把 Claude 想象成一个在路径上探索的机器人：

* **两侧是悬崖的狭窄桥梁**：只有一条安全的前进路线。提供具体的护栏和精确指令（低自由度）。例如：必须按精确顺序运行的数据库迁移。
* **没有危险的开阔田野**：许多路径都能通向成功。给出大致方向，并相信 Claude 能找到最佳路线（高自由度）。例如：context 决定最佳方式的 code review。

### 用你计划使用的所有模型进行测试

Skill 作为模型的补充，因此其有效性取决于底层模型。用你计划使用的所有模型测试你的 Skill。

**按模型分类的测试考量**：

* **Claude Haiku**（快速、经济）：Skill 是否提供了足够的指导？
* **Claude Sonnet**（平衡）：Skill 是否清晰高效？
* **Claude Opus**（强大推理）：Skill 是否避免过度解释？

对 Opus 完美的内容可能对 Haiku 需要更多细节。如果你计划在多个模型中使用 Skill，目标是让指令对所有这些模型都效果良好。

## Skill 结构

<Note>
  **YAML Frontmatter**：SKILL.md 的 frontmatter 需要两个字段：

  * `name` - Skill 的人类可读名称（最多 64 个字符）
  * `description` - 一行描述说明 Skill 做什么以及何时使用（最多 1024 个字符）

  完整的 Skill 结构详情请参阅 [Skills 概览](/en/docs/agents-and-tools/agent-skills/overview#skill-structure)。
</Note>

### 命名约定

使用一致的命名模式，让 Skill 更容易被引用和讨论。我们推荐使用 **gerund 形式**（动词 + -ing）作为 Skill 名称，因为它清晰地描述了 Skill 提供的活动或能力。

**好的命名示例（gerund 形式）**：

* "Processing PDFs"
* "Analyzing spreadsheets"
* "Managing databases"
* "Testing code"
* "Writing documentation"

**可接受的替代方案**：

* 名词短语："PDF Processing"、"Spreadsheet Analysis"
* 动作导向："Process PDFs"、"Analyze Spreadsheets"

**避免**：

* 模糊的名称："Helper"、"Utils"、"Tools"
* 过于通用："Documents"、"Data"、"Files"
* 在你的 skill 集合中模式不一致

一致的命名让以下事情更容易：

* 在文档和对话中引用 Skill
* 一眼理解 Skill 的功能
* 组织和搜索多个 Skill
* 维护专业、连贯的 skill 库

### 编写有效的描述

`description` 字段使 Skill 能被发现，应该同时包含 Skill 做什么以及何时使用它。

<Warning>
  **始终用第三人称书写**。description 会被注入系统 prompt，不一致的视角会导致发现问题。

  * **好：** "Processes Excel files and generates reports"
  * **避免：** "I can help you process Excel files"
  * **避免：** "You can use this to process Excel files"
</Warning>

**具体并包含关键术语**。同时包含 Skill 的功能以及使用它的具体触发器/context。

每个 Skill 恰好有一个 description 字段。该 description 对 skill 选择至关重要：Claude 用它从可能多达 100+ 个可用 Skill 中选出正确的那个。你的 description 必须提供足够的细节让 Claude 知道何时选择此 Skill，而 SKILL.md 的其余部分提供实现细节。

有效的示例：

**PDF Processing skill：**

```yaml  theme={null}
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

**Excel Analysis skill：**

```yaml  theme={null}
description: Analyze Excel spreadsheets, create pivot tables, generate charts. Use when analyzing Excel files, spreadsheets, tabular data, or .xlsx files.
```

**Git Commit Helper skill：**

```yaml  theme={null}
description: Generate descriptive commit messages by analyzing git diffs. Use when the user asks for help writing commit messages or reviewing staged changes.
```

避免如下含糊的 description：

```yaml  theme={null}
description: Helps with documents
```

```yaml  theme={null}
description: Processes data
```

```yaml  theme={null}
description: Does stuff with files
```

### 渐进式披露模式

SKILL.md 充当概览，按需把 Claude 指向更详细的资料，就像 onboarding 指南中的目录。关于渐进式披露的工作原理，请参阅概览中的 [Skill 工作原理](/en/docs/agents-and-tools/agent-skills/overview#how-skills-work)。

**实用指引：**

* 将 SKILL.md 正文保持在 500 行以下以获得最佳性能
* 接近此限制时把内容拆分到独立文件
* 使用下面的模式有效地组织指令、代码和资源

#### 可视化概览：从简单到复杂

一个基础 Skill 仅以包含 metadata 和指令的 SKILL.md 文件开始：

<img src="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=87782ff239b297d9a9e8e1b72ed72db9" alt="展示 YAML frontmatter 和 markdown 正文的简单 SKILL.md 文件" data-og-width="2048" width="2048" data-og-height="1153" height="1153" data-path="images/agent-skills-simple-file.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=280&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=c61cc33b6f5855809907f7fda94cd80e 280w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=560&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=90d2c0c1c76b36e8d485f49e0810dbfd 560w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=840&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=ad17d231ac7b0bea7e5b4d58fb4aeabb 840w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=1100&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=f5d0a7a3c668435bb0aee9a3a8f8c329 1100w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=1650&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=0e927c1af9de5799cfe557d12249f6e6 1650w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=2500&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=46bbb1a51dd4c8202a470ac8c80a893d 2500w" />

随着 Skill 增长，你可以打包额外内容，让 Claude 仅在需要时加载：

<img src="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=a5e0aa41e3d53985a7e3e43668a33ea3" alt="打包额外参考文件如 reference.md 和 forms.md。" data-og-width="2048" width="2048" data-og-height="1327" height="1327" data-path="images/agent-skills-bundling-content.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=280&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=f8a0e73783e99b4a643d79eac86b70a2 280w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=560&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=dc510a2a9d3f14359416b706f067904a 560w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=840&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=82cd6286c966303f7dd914c28170e385 840w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=1100&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=56f3be36c77e4fe4b523df209a6824c6 1100w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=1650&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=d22b5161b2075656417d56f41a74f3dd 1650w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=2500&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=3dd4bdd6850ffcc96c6c45fcb0acd6eb 2500w" />

完整的 Skill 目录结构可能如下所示：

```
pdf/
├── SKILL.md              # Main instructions (loaded when triggered)
├── FORMS.md              # Form-filling guide (loaded as needed)
├── reference.md          # API reference (loaded as needed)
├── examples.md           # Usage examples (loaded as needed)
└── scripts/
    ├── analyze_form.py   # Utility script (executed, not loaded)
    ├── fill_form.py      # Form filling script
    └── validate.py       # Validation script
```

#### 模式 1：高层指南配引用

````markdown  theme={null}
---
name: PDF Processing
description: Extracts text and tables from PDF files, fills forms, and merges documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---

# PDF Processing

## Quick start

Extract text with pdfplumber:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

## Advanced features

**Form filling**: See [FORMS.md](FORMS.md) for complete guide
**API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
**Examples**: See [EXAMPLES.md](EXAMPLES.md) for common patterns
````

Claude 仅在需要时加载 FORMS.md、REFERENCE.md 或 EXAMPLES.md。

#### 模式 2：按领域组织

对于具有多个领域的 Skill，按领域组织内容以避免加载无关 context。当用户询问销售指标时，Claude 只需读取销售相关的 schema，而不是 finance 或 marketing 数据。这使 token 用量保持低水平，并使 context 聚焦。

```
bigquery-skill/
├── SKILL.md (overview and navigation)
└── reference/
    ├── finance.md (revenue, billing metrics)
    ├── sales.md (opportunities, pipeline)
    ├── product.md (API usage, features)
    └── marketing.md (campaigns, attribution)
```

````markdown SKILL.md theme={null}
# BigQuery Data Analysis

## Available datasets

**Finance**: Revenue, ARR, billing → See [reference/finance.md](reference/finance.md)
**Sales**: Opportunities, pipeline, accounts → See [reference/sales.md](reference/sales.md)
**Product**: API usage, features, adoption → See [reference/product.md](reference/product.md)
**Marketing**: Campaigns, attribution, email → See [reference/marketing.md](reference/marketing.md)

## Quick search

Find specific metrics using grep:

```bash
grep -i "revenue" reference/finance.md
grep -i "pipeline" reference/sales.md
grep -i "api usage" reference/product.md
```
````

#### 模式 3：条件式细节

展示基础内容，链接到进阶内容：

```markdown  theme={null}
# DOCX Processing

## Creating documents

Use docx-js for new documents. See [DOCX-JS.md](DOCX-JS.md).

## Editing documents

For simple edits, modify the XML directly.

**For tracked changes**: See [REDLINING.md](REDLINING.md)
**For OOXML details**: See [OOXML.md](OOXML.md)
```

Claude 仅在用户需要这些功能时才读取 REDLINING.md 或 OOXML.md。

### 避免深度嵌套的引用

当文件从其他被引用的文件中再次被引用时，Claude 可能会部分读取它们。遇到嵌套引用时，Claude 可能使用 `head -100` 等命令预览内容而不是读取整个文件，导致信息不完整。

**保持引用距 SKILL.md 一层深度**。所有参考文件应直接从 SKILL.md 链接，以确保 Claude 在需要时读取完整文件。

**坏的示例：太深**：

```markdown  theme={null}
# SKILL.md
See [advanced.md](advanced.md)...

# advanced.md
See [details.md](details.md)...

# details.md
Here's the actual information...
```

**好的示例：一层深度**：

```markdown  theme={null}
# SKILL.md

**Basic usage**: [instructions in SKILL.md]
**Advanced features**: See [advanced.md](advanced.md)
**API reference**: See [reference.md](reference.md)
**Examples**: See [examples.md](examples.md)
```

### 用目录组织较长的参考文件

对于超过 100 行的参考文件，在顶部包含一个目录。这样即使在使用部分读取预览时，Claude 也能看到可用信息的完整范围。

**示例**：

```markdown  theme={null}
# API Reference

## Contents
- Authentication and setup
- Core methods (create, read, update, delete)
- Advanced features (batch operations, webhooks)
- Error handling patterns
- Code examples

## Authentication and setup
...

## Core methods
...
```

之后 Claude 可以读取完整文件，或按需跳到特定部分。

关于这种基于文件系统的架构如何实现渐进式披露的细节，请参阅下面"进阶"部分的 [Runtime environment](#runtime-environment) 一节。

## workflow 与反馈回路

### 用 workflow 处理复杂任务

将复杂操作拆分为清晰的顺序步骤。对于特别复杂的 workflow，提供一个 Claude 可以复制到其响应中并在过程中勾选的清单。

**示例 1：研究综合 workflow**（用于不含代码的 Skill）：

````markdown  theme={null}
## Research synthesis workflow

Copy this checklist and track your progress:

```
Research Progress:
- [ ] Step 1: Read all source documents
- [ ] Step 2: Identify key themes
- [ ] Step 3: Cross-reference claims
- [ ] Step 4: Create structured summary
- [ ] Step 5: Verify citations
```

**Step 1: Read all source documents**

Review each document in the `sources/` directory. Note the main arguments and supporting evidence.

**Step 2: Identify key themes**

Look for patterns across sources. What themes appear repeatedly? Where do sources agree or disagree?

**Step 3: Cross-reference claims**

For each major claim, verify it appears in the source material. Note which source supports each point.

**Step 4: Create structured summary**

Organize findings by theme. Include:
- Main claim
- Supporting evidence from sources
- Conflicting viewpoints (if any)

**Step 5: Verify citations**

Check that every claim references the correct source document. If citations are incomplete, return to Step 3.
````

此示例展示了 workflow 如何应用于不需要代码的分析任务。清单模式适用于任何复杂的多步骤过程。

**示例 2：PDF 表单填写 workflow**（用于含代码的 Skill）：

````markdown  theme={null}
## PDF form filling workflow

Copy this checklist and check off items as you complete them:

```
Task Progress:
- [ ] Step 1: Analyze the form (run analyze_form.py)
- [ ] Step 2: Create field mapping (edit fields.json)
- [ ] Step 3: Validate mapping (run validate_fields.py)
- [ ] Step 4: Fill the form (run fill_form.py)
- [ ] Step 5: Verify output (run verify_output.py)
```

**Step 1: Analyze the form**

Run: `python scripts/analyze_form.py input.pdf`

This extracts form fields and their locations, saving to `fields.json`.

**Step 2: Create field mapping**

Edit `fields.json` to add values for each field.

**Step 3: Validate mapping**

Run: `python scripts/validate_fields.py fields.json`

Fix any validation errors before continuing.

**Step 4: Fill the form**

Run: `python scripts/fill_form.py input.pdf fields.json output.pdf`

**Step 5: Verify output**

Run: `python scripts/verify_output.py output.pdf`

If verification fails, return to Step 2.
````

清晰的步骤防止 Claude 跳过关键的验证。清单帮助 Claude 和你跟踪多步骤 workflow 的进度。

### 实现反馈回路

**常见模式**：运行验证器 → 修复错误 → 重复

此模式极大地提升输出质量。

**示例 1：风格指南合规性**（用于不含代码的 Skill）：

```markdown  theme={null}
## Content review process

1. Draft your content following the guidelines in STYLE_GUIDE.md
2. Review against the checklist:
   - Check terminology consistency
   - Verify examples follow the standard format
   - Confirm all required sections are present
3. If issues found:
   - Note each issue with specific section reference
   - Revise the content
   - Review the checklist again
4. Only proceed when all requirements are met
5. Finalize and save the document
```

这展示了使用参考文档而非脚本的验证回路模式。"验证器"是 STYLE\_GUIDE.md，Claude 通过阅读和比较来执行检查。

**示例 2：文档编辑流程**（用于含代码的 Skill）：

```markdown  theme={null}
## Document editing process

1. Make your edits to `word/document.xml`
2. **Validate immediately**: `python ooxml/scripts/validate.py unpacked_dir/`
3. If validation fails:
   - Review the error message carefully
   - Fix the issues in the XML
   - Run validation again
4. **Only proceed when validation passes**
5. Rebuild: `python ooxml/scripts/pack.py unpacked_dir/ output.docx`
6. Test the output document
```

验证回路能尽早捕获错误。

## 内容指引

### 避免时效性信息

不要包含会过时的信息：

**坏的示例：时效性**（会变错）：

```markdown  theme={null}
If you're doing this before August 2025, use the old API.
After August 2025, use the new API.
```

**好的示例**（使用 "old patterns" 部分）：

```markdown  theme={null}
## Current method

Use the v2 API endpoint: `api.example.com/v2/messages`

## Old patterns

<details>
<summary>Legacy v1 API (deprecated 2025-08)</summary>

The v1 API used: `api.example.com/v1/messages`

This endpoint is no longer supported.
</details>
```

old patterns 部分提供历史 context，而不会让主要内容变得杂乱。

### 使用一致的术语

选择一个术语并贯穿整个 Skill 使用：

**好 - 一致**：

* 始终用 "API endpoint"
* 始终用 "field"
* 始终用 "extract"

**坏 - 不一致**：

* 混用 "API endpoint"、"URL"、"API route"、"path"
* 混用 "field"、"box"、"element"、"control"
* 混用 "extract"、"pull"、"get"、"retrieve"

一致性帮助 Claude 理解并遵循指令。

## 常见模式

### 模板模式

为输出格式提供模板。将严格程度匹配到你的需要。

**对于严格的要求**（如 API 响应或数据格式）：

````markdown  theme={null}
## Report structure

ALWAYS use this exact template structure:

```markdown
# [Analysis Title]

## Executive summary
[One-paragraph overview of key findings]

## Key findings
- Finding 1 with supporting data
- Finding 2 with supporting data
- Finding 3 with supporting data

## Recommendations
1. Specific actionable recommendation
2. Specific actionable recommendation
```
````

**对于灵活的指引**（当适配有用时）：

````markdown  theme={null}
## Report structure

Here is a sensible default format, but use your best judgment based on the analysis:

```markdown
# [Analysis Title]

## Executive summary
[Overview]

## Key findings
[Adapt sections based on what you discover]

## Recommendations
[Tailor to the specific context]
```

Adjust sections as needed for the specific analysis type.
````

### 示例模式

对于输出质量取决于看到示例的 Skill，像普通 prompt 一样提供 input/output 对：

````markdown  theme={null}
## Commit message format

Generate commit messages following these examples:

**Example 1:**
Input: Added user authentication with JWT tokens
Output:
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

**Example 2:**
Input: Fixed bug where dates displayed incorrectly in reports
Output:
```
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation
```

**Example 3:**
Input: Updated dependencies and refactored error handling
Output:
```
chore: update dependencies and refactor error handling

- Upgrade lodash to 4.17.21
- Standardize error response format across endpoints
```

Follow this style: type(scope): brief description, then detailed explanation.
````

示例比单纯的描述更清晰地帮助 Claude 理解所需的风格和细节级别。

### 条件 workflow 模式

引导 Claude 通过决策点：

```markdown  theme={null}
## Document modification workflow

1. Determine the modification type:

   **Creating new content?** → Follow "Creation workflow" below
   **Editing existing content?** → Follow "Editing workflow" below

2. Creation workflow:
   - Use docx-js library
   - Build document from scratch
   - Export to .docx format

3. Editing workflow:
   - Unpack existing document
   - Modify XML directly
   - Validate after each change
   - Repack when complete
```

<Tip>
  如果 workflow 变得很大或步骤很多很复杂，考虑把它们推到独立文件中，并告诉 Claude 根据手头任务读取相应文件。
</Tip>

## 评估与迭代

### 先构建评估

**在编写大量文档之前先创建评估。** 这能确保你的 Skill 解决真实问题，而不是为想象的问题写文档。

**评估驱动开发：**

1. **识别差距**：在没有 Skill 的情况下让 Claude 处理代表性任务。记录具体的失败或缺失的 context
2. **创建评估**：构建测试这些差距的三个场景
3. **建立基线**：测量 Claude 在没有 Skill 时的表现
4. **编写最少指令**：创建恰好足够的内容来填补差距并通过评估
5. **迭代**：执行评估，与基线比较，并改进

这种方法确保你解决的是实际问题，而不是为可能永远不会出现的需求做准备。

**评估结构**：

```json  theme={null}
{
  "skills": ["pdf-processing"],
  "query": "Extract all text from this PDF file and save it to output.txt",
  "files": ["test-files/document.pdf"],
  "expected_behavior": [
    "Successfully reads the PDF file using an appropriate PDF processing library or command-line tool",
    "Extracts text content from all pages in the document without missing any pages",
    "Saves the extracted text to a file named output.txt in a clear, readable format"
  ]
}
```

<Note>
  此示例展示了带有简单测试评分标准的数据驱动评估。我们目前不提供运行这些评估的内置方式。用户可以创建自己的评估系统。评估是衡量 Skill 有效性的真理来源。
</Note>

### 与 Claude 一起迭代地开发 Skill

最有效的 Skill 开发流程涉及 Claude 自身。与一个 Claude 实例（"Claude A"）一起工作来创建一个将被其他实例（"Claude B"）使用的 Skill。Claude A 帮你设计和优化指令，而 Claude B 在真实任务中测试它们。这之所以可行，是因为 Claude 模型既理解如何编写有效的 agent 指令，也理解 agent 需要哪些信息。

**创建新 Skill：**

1. **不使用 Skill 完成一个任务**：用普通 prompt 与 Claude A 解决一个问题。在工作过程中，你会自然地提供 context、解释偏好并分享流程性知识。注意你反复提供的信息是哪些。

2. **识别可复用的模式**：完成任务后，识别你提供的哪些 context 对未来类似任务有用。

   **示例**：如果你完成了一次 BigQuery 分析，你可能提供了表名、字段定义、过滤规则（如"始终排除测试账户"）以及常见的查询模式。

3. **要求 Claude A 创建一个 Skill**："Create a Skill that captures this BigQuery analysis pattern we just used. Include the table schemas, naming conventions, and the rule about filtering test accounts."

   <Tip>
     Claude 模型本身就理解 Skill 的格式和结构。你不需要特殊的系统 prompt 或"writing skills"skill 才能让 Claude 帮你创建 Skill。只需要求 Claude 创建一个 Skill，它就会生成结构正确的 SKILL.md 内容，带有合适的 frontmatter 和正文。
   </Tip>

4. **审阅简洁性**：检查 Claude A 是否添加了不必要的解释。问："Remove the explanation about what win rate means - Claude already knows that."

5. **改进信息架构**：要求 Claude A 更有效地组织内容。例如："Organize this so the table schema is in a separate reference file. We might add more tables later."

6. **在类似任务上测试**：在相关用例上用 Claude B（一个加载了该 Skill 的全新实例）使用此 Skill。观察 Claude B 是否找到正确的信息、正确应用规则并成功处理任务。

7. **基于观察迭代**：如果 Claude B 遇到困难或遗漏了某些东西，带着具体细节回到 Claude A："When Claude used this Skill, it forgot to filter by date for Q4. Should we add a section about date filtering patterns?"

**对现有 Skill 进行迭代：**

改进 Skill 时这种分层模式仍然继续。你在以下三者之间交替：

* **与 Claude A 协作**（帮助优化 Skill 的专家）
* **与 Claude B 一起测试**（使用 Skill 执行真实工作的 agent）
* **观察 Claude B 的行为**并将见解带回 Claude A

1. **在真实 workflow 中使用 Skill**：给 Claude B（已加载该 Skill）实际任务，而不是测试场景

2. **观察 Claude B 的行为**：注意它在哪里挣扎、成功或做出意外选择

   **示例观察**："When I asked Claude B for a regional sales report, it wrote the query but forgot to filter out test accounts, even though the Skill mentions this rule."

3. **回到 Claude A 进行改进**：分享当前的 SKILL.md 并描述你观察到的内容。问："I noticed Claude B forgot to filter test accounts when I asked for a regional report. The Skill mentions filtering, but maybe it's not prominent enough?"

4. **审阅 Claude A 的建议**：Claude A 可能建议重新组织以使规则更突出，使用更强势的语言如 "MUST filter" 而不是 "always filter"，或重构 workflow 部分。

5. **应用并测试更改**：用 Claude A 的改进更新 Skill，然后再次用 Claude B 在类似请求上测试

6. **基于使用情况重复**：在遇到新场景时持续这种观察-改进-测试循环。每次迭代都基于真实 agent 行为而非假设来改进 Skill。

**收集团队反馈：**

1. 与团队成员分享 Skill 并观察其使用
2. 询问：Skill 是否在预期时被激活？指令是否清晰？缺少什么？
3. 整合反馈以解决你自身使用模式中的盲点

**为什么这种方法有效**：Claude A 理解 agent 的需求，你提供领域专长，Claude B 通过真实使用揭示差距，迭代改进基于观察到的行为而非假设来提升 Skill。

### 观察 Claude 如何浏览 Skill

在迭代 Skill 时，注意 Claude 在实践中如何使用它们。注意：

* **意外的探索路径**：Claude 是否以你未预料的顺序读取文件？这可能表明你的结构没有你想的那么直观
* **错过的连接**：Claude 是否未能跟随对重要文件的引用？你的链接可能需要更明确或更突出
* **过度依赖某些部分**：如果 Claude 反复读取同一文件，考虑该内容是否应放在主 SKILL.md 中
* **被忽略的内容**：如果 Claude 从不访问某个 bundle 文件，它可能不必要或在主指令中信号不足

基于这些观察迭代而非基于假设。Skill metadata 中的 'name' 和 'description' 尤其关键。Claude 在决定是否针对当前任务触发 Skill 时使用它们。确保它们清晰描述 Skill 做什么以及何时应被使用。

## 应避免的反模式

### 避免 Windows 风格的路径

始终在文件路径中使用正斜杠，即使在 Windows 上：

* ✓ **好**：`scripts/helper.py`、`reference/guide.md`
* ✗ **避免**：`scripts\helper.py`、`reference\guide.md`

Unix 风格的路径在所有平台上都有效，而 Windows 风格的路径在 Unix 系统上会导致错误。

### 避免提供过多选项

除非必要，不要提供多种方法：

````markdown  theme={null}
**Bad example: Too many choices** (confusing):
"You can use pypdf, or pdfplumber, or PyMuPDF, or pdf2image, or..."

**Good example: Provide a default** (with escape hatch):
"Use pdfplumber for text extraction:
```python
import pdfplumber
```

For scanned PDFs requiring OCR, use pdf2image with pytesseract instead."
````

## 进阶：含可执行代码的 Skill

下面的部分关注包含可执行脚本的 Skill。如果你的 Skill 仅使用 markdown 指令，请直接跳到 [有效 Skill 检查清单](#checklist-for-effective-skills)。

### 解决问题，不要推卸

为 Skill 编写脚本时，处理错误条件而不是把问题推给 Claude。

**好的示例：显式处理错误**：

```python  theme={null}
def process_file(path):
    """Process a file, creating it if it doesn't exist."""
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        # Create file with default content instead of failing
        print(f"File {path} not found, creating default")
        with open(path, 'w') as f:
            f.write('')
        return ''
    except PermissionError:
        # Provide alternative instead of failing
        print(f"Cannot access {path}, using default")
        return ''
```

**坏的示例：推给 Claude**：

```python  theme={null}
def process_file(path):
    # Just fail and let Claude figure it out
    return open(path).read()
```

配置参数也应被论证并记录文档，以避免"voodoo constants"（Ousterhout 法则）。如果你不知道正确的值，Claude 又怎么能确定它呢？

**好的示例：自我说明**：

```python  theme={null}
# HTTP requests typically complete within 30 seconds
# Longer timeout accounts for slow connections
REQUEST_TIMEOUT = 30

# Three retries balances reliability vs speed
# Most intermittent failures resolve by the second retry
MAX_RETRIES = 3
```

**坏的示例：魔法数字**：

```python  theme={null}
TIMEOUT = 47  # Why 47?
RETRIES = 5   # Why 5?
```

### 提供工具脚本

即使 Claude 能够编写脚本，预先制作的脚本也提供了优势：

**工具脚本的好处**：

* 比生成的代码更可靠
* 节省 token（无需在 context 中包含代码）
* 节省时间（无需代码生成）
* 确保跨使用场景的一致性

<img src="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=4bbc45f2c2e0bee9f2f0d5da669bad00" alt="将可执行脚本与指令文件一起打包" data-og-width="2048" width="2048" data-og-height="1154" height="1154" data-path="images/agent-skills-executable-scripts.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=280&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=9a04e6535a8467bfeea492e517de389f 280w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=560&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=e49333ad90141af17c0d7651cca7216b 560w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=840&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=954265a5df52223d6572b6214168c428 840w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=1100&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=2ff7a2d8f2a83ee8af132b29f10150fd 1100w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=1650&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=48ab96245e04077f4d15e9170e081cfb 1650w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=2500&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=0301a6c8b3ee879497cc5b5483177c90 2500w" />

上图展示了可执行脚本如何与指令文件协同工作。指令文件（forms.md）引用脚本，而 Claude 可以执行它而无需把其内容加载进 context。

**重要区分**：在你的指令中明确 Claude 应该：

* **执行脚本**（最常见）："Run `analyze_form.py` to extract fields"
* **作为参考阅读**（用于复杂逻辑）："See `analyze_form.py` for the field extraction algorithm"

对于大多数工具脚本，执行更受推崇，因为它更可靠和高效。脚本执行如何工作的细节请参阅下面的 [Runtime environment](#runtime-environment) 部分。

**示例**：

````markdown  theme={null}
## Utility scripts

**analyze_form.py**: Extract all form fields from PDF

```bash
python scripts/analyze_form.py input.pdf > fields.json
```

Output format:
```json
{
  "field_name": {"type": "text", "x": 100, "y": 200},
  "signature": {"type": "sig", "x": 150, "y": 500}
}
```

**validate_boxes.py**: Check for overlapping bounding boxes

```bash
python scripts/validate_boxes.py fields.json
# Returns: "OK" or lists conflicts
```

**fill_form.py**: Apply field values to PDF

```bash
python scripts/fill_form.py input.pdf fields.json output.pdf
```
````

### 使用视觉分析

当输入可以被渲染为图像时，让 Claude 分析它们：

````markdown  theme={null}
## Form layout analysis

1. Convert PDF to images:
   ```bash
   python scripts/pdf_to_images.py form.pdf
   ```

2. Analyze each page image to identify form fields
3. Claude can see field locations and types visually
````

<Note>
  在此示例中，你需要自己编写 `pdf_to_images.py` 脚本。
</Note>

Claude 的视觉能力有助于理解布局和结构。

### 创建可验证的中间输出

当 Claude 执行复杂、开放式任务时，可能会犯错。"plan-validate-execute"模式让 Claude 先以结构化格式创建计划，然后用脚本验证该计划，再执行它，从而尽早捕获错误。

**示例**：想象要求 Claude 基于一份 spreadsheet 更新 PDF 中的 50 个表单字段。如果没有验证，Claude 可能引用不存在的字段、创建冲突的值、错过必填字段或错误应用更新。

**解决方案**：使用上面所示的 workflow 模式（PDF 表单填写），但添加一个中间 `changes.json` 文件，在应用更改之前对其进行验证。workflow 变成：分析 → **创建计划文件** → **验证计划** → 执行 → 验证。

**为什么此模式有效：**

* **尽早捕获错误**：验证在更改应用前发现问题
* **机器可验证**：脚本提供客观验证
* **可逆的规划**：Claude 可以在不触碰原件的情况下迭代计划
* **清晰的调试**：错误消息指向具体问题

**何时使用**：批量操作、破坏性更改、复杂验证规则、高风险操作。

**实现提示**：让验证脚本带详细的错误消息，如 "Field 'signature\_date' not found. Available fields: customer\_name, order\_total, signature\_date\_signed"，以帮助 Claude 修复问题。

### 包依赖

Skill 在代码执行环境中运行，具有平台特定的限制：

* **claude.ai**：可以从 npm 和 PyPI 安装包并从 GitHub repo 拉取
* **Anthropic API**：没有网络访问，也没有运行时包安装

在你的 SKILL.md 中列出所需的包，并在 [code execution tool 文档](/en/docs/agents-and-tools/tool-use/code-execution-tool) 中确认它们可用。

### Runtime environment

Skill 在具有文件系统访问、bash 命令和代码执行能力的代码执行环境中运行。该架构的概念性解释请参阅概览中的 [Skills 架构](/en/docs/agents-and-tools/agent-skills/overview#the-skills-architecture)。

**这如何影响你的编写：**

**Claude 如何访问 Skill：**

1. **metadata 预加载**：在启动时，所有 Skill 的 YAML frontmatter 中的 name 和 description 被加载到系统 prompt
2. **按需读取文件**：Claude 在需要时使用 bash Read 工具从文件系统访问 SKILL.md 和其他文件
3. **脚本高效执行**：工具脚本可通过 bash 执行而无需把其完整内容加载进 context。只有脚本的输出消耗 token
4. **大文件无 context 代价**：参考文件、数据或文档在实际被读取之前不消耗 context token

* **文件路径很重要**：Claude 像浏览文件系统一样浏览你的 skill 目录。使用正斜杠（`reference/guide.md`），而不是反斜杠
* **描述性地命名文件**：使用能表明内容的名称：`form_validation_rules.md`，而不是 `doc2.md`
* **为发现而组织**：按领域或功能组织目录结构
  * 好：`reference/finance.md`、`reference/sales.md`
  * 坏：`docs/file1.md`、`docs/file2.md`
* **打包全面的资源**：包含完整的 API 文档、丰富的示例、大型数据集；在被访问之前没有 context 代价
* **优先使用脚本进行确定性操作**：编写 `validate_form.py`，而不是要求 Claude 生成验证代码
* **明确执行意图**：
  * "Run `analyze_form.py` to extract fields"（执行）
  * "See `analyze_form.py` for the extraction algorithm"（作为参考阅读）
* **测试文件访问模式**：通过用真实请求测试，验证 Claude 能浏览你的目录结构

**示例：**

```
bigquery-skill/
├── SKILL.md (overview, points to reference files)
└── reference/
    ├── finance.md (revenue metrics)
    ├── sales.md (pipeline data)
    └── product.md (usage analytics)
```

当用户询问 revenue 时，Claude 读取 SKILL.md，看到对 `reference/finance.md` 的引用，并调用 bash 仅读取该文件。sales.md 和 product.md 文件保留在文件系统上，在需要之前消耗零 context token。这种基于文件系统的模型正是渐进式披露能够实现的原因。Claude 可以按需浏览并选择性地仅加载每个任务所需的内容。

关于技术架构的完整细节，请参阅 Skills 概览中的 [Skill 工作原理](/en/docs/agents-and-tools/agent-skills/overview#how-skills-work)。

### MCP tool 引用

如果你的 Skill 使用 MCP（Model Context Protocol）tool，始终使用完全限定的工具名称以避免 "tool not found" 错误。

**格式**：`ServerName:tool_name`

**示例**：

```markdown  theme={null}
Use the BigQuery:bigquery_schema tool to retrieve table schemas.
Use the GitHub:create_issue tool to create issues.
```

其中：

* `BigQuery` 和 `GitHub` 是 MCP server 名称
* `bigquery_schema` 和 `create_issue` 是这些 server 内的 tool 名称

如果没有 server 前缀，Claude 可能找不到该工具，尤其是当多个 MCP server 可用时。

### 不要假设工具已安装

不要假设包已可用：

````markdown  theme={null}
**Bad example: Assumes installation**:
"Use the pdf library to process the file."

**Good example: Explicit about dependencies**:
"Install required package: `pip install pypdf`

Then use it:
```python
from pypdf import PdfReader
reader = PdfReader("file.pdf")
```"
````

## 技术说明

### YAML frontmatter 要求

SKILL.md 的 frontmatter 需要 `name`（最多 64 个字符）和 `description`（最多 1024 个字符）字段。完整的结构详情请参阅 [Skills 概览](/en/docs/agents-and-tools/agent-skills/overview#skill-structure)。

### Token 预算

将 SKILL.md 正文保持在 500 行以下以获得最佳性能。如果你的内容超过此限制，使用前面描述的渐进式披露模式将其拆分到独立文件。架构细节请参阅 [Skills 概览](/en/docs/agents-and-tools/agent-skills/overview#how-skills-work)。

## 有效 Skill 检查清单

在分享 Skill 之前，请验证：

### 核心质量

* [ ] description 具体且包含关键术语
* [ ] description 同时包括 Skill 做什么以及何时使用它
* [ ] SKILL.md 正文在 500 行以下
* [ ] 额外细节在独立文件中（如有需要）
* [ ] 没有时效性信息（或在 "old patterns" 部分中）
* [ ] 整个文档术语一致
* [ ] 示例具体而非抽象
* [ ] 文件引用为一层深度
* [ ] 适当地使用渐进式披露
* [ ] workflow 步骤清晰

### 代码与脚本

* [ ] 脚本解决问题而非推给 Claude
* [ ] 错误处理显式且有用
* [ ] 没有 "voodoo constants"（所有值都被论证）
* [ ] 在指令中列出了所需的包并已验证为可用
* [ ] 脚本有清晰的文档
* [ ] 没有 Windows 风格的路径（全部为正斜杠）
* [ ] 关键操作有验证/校验步骤
* [ ] 对质量关键任务包含反馈回路

### 测试

* [ ] 至少创建了三个评估
* [ ] 用 Haiku、Sonnet 和 Opus 测试过
* [ ] 用真实使用场景测试过
* [ ] 已整合团队反馈（如适用）

## 后续步骤

<CardGroup cols={2}>
  <Card title="开始使用 Agent Skills" icon="rocket" href="/en/docs/agents-and-tools/agent-skills/quickstart">
    创建你的第一个 Skill
  </Card>

  <Card title="在 Claude Code 中使用 Skill" icon="terminal" href="/en/docs/claude-code/skills">
    在 Claude Code 中创建和管理 Skill
  </Card>

  <Card title="通过 API 使用 Skill" icon="code" href="/en/api/skills-guide">
    以编程方式上传和使用 Skill
  </Card>
</CardGroup>
