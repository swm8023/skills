# Writing Clearly and Concisely

本 skill 应用 William Strunk Jr. 的写作原则，帮助写出更清晰、有力、专业的文字，并避免常见 AI 写作模式。

## Purpose

本 skill 帮助你改善面向人类读者的文字，依据来自两部分：

1. **The Elements of Style**（Strunk，1918）-- 经时间检验的清晰、有力写作规则
2. **避免 AI 写作模式** -- 根据研究，避免 LLM 容易生成的空泛、浮夸语言

无论撰写文档、commit message、错误信息，还是其他供人阅读的文字，本 skill 都能帮助你删去赘词，准确表达意思。

## When to Use

凡是为人类读者撰写文字，都可以使用本 skill：

- **文档** -- README 文件、API 文档、技术说明
- **Git 工作流** -- commit message、pull request 描述
- **用户可见文字** -- 错误信息、UI 文案、帮助文字、提示
- **代码注释** -- 内联文档、docstring
- **报告和摘要** -- 状态更新、分析、解释
- **编辑** -- 提高现有文字的清晰度

**触发短语：**
- “为……编写文档”
- “起草一份 README”
- “编辑这段文字，让它更清楚”
- “写得更简洁一些”
- “检查这条 commit message”

## How It Works

1. 面向人类读者写作时，**加载本 skill**
2. **应用 Strunk 的核心原则** -- 主动语态、肯定表达、具体语言、删去赘词
3. **避免 AI 写作模式** -- 不夸大，不写空泛短语，不使用宣传性形容词
4. 涉及具体规则时，**查阅详细指南**

### Context-Efficient Approach

本 skill 使用渐进披露来节省上下文：

- **SKILL.md**（约 1,000 tokens）首先加载，提供核心规则
- **参考文件**（每份 1,000–4,500 tokens）仅在需要时加载
- **多数任务只需一个文件**：`03-elementary-principles-of-composition.md`

上下文紧张时，将初稿和相关章节文件交给 subagent。

## Key Features

### Strunk's Core Rules

本 skill 强调 *The Elements of Style* 中的以下原则：

| 规则 | 原则 |
|------|-----------|
| 10 | 使用主动语态 |
| 11 | 使用肯定表达 |
| 12 | 使用明确、具体的语言 |
| 13 | 删去不必要的词 |
| 16 | 把相关的词放在一起 |
| 18 | 把需要强调的词放在句末 |

### AI Pattern Detection

本 skill 识别并去除常见的 LLM 写作模式：

- **夸大措辞**：pivotal、crucial、vital、testament、enduring legacy
- **空泛的“-ing”短语**：ensuring reliability、showcasing features
- **宣传性形容词**：groundbreaking、seamless、robust、cutting-edge
- **AI 常用词**：delve、leverage、multifaceted、foster、realm、tapestry
- **过度排版**：滥用项目列表、装饰性 emoji，或隔几个词就加粗

## Reference Files

| 章节 | 文件 | Tokens | 内容 |
|---------|------|--------|---------|
| 语法与标点 | `02-elementary-rules-of-usage.md` | ~2,500 | 逗号规则、所有格、句子结构 |
| 行文原则 | `03-elementary-principles-of-composition.md` | ~4,500 | 主动语态、简洁表达、段落结构 |
| 格式 | `04-a-few-matters-of-form.md` | ~1,000 | 标题、引文、格式约定 |
| 选词 | `05-words-and-expressions-commonly-misused.md` | ~4,000 | 常见错误、词语选择 |
| AI 写作模式 | `signs-of-ai-writing.md` | ~25,000 | Wikipedia 编辑识别 AI 内容的实用指南 |

## Usage Examples

### Example 1: Tightening a Commit Message

**修改前：**
> This commit implements the functionality for ensuring that user authentication is properly handled, showcasing robust error handling capabilities.

**修改后：**
> Add user authentication with error handling

### Example 2: Rewriting Documentation

**修改前：**
> This groundbreaking feature leverages cutting-edge technology to deliver a seamless experience, fostering better engagement and driving impactful results.

**修改后：**
> This feature uses WebSocket connections to update the dashboard in real time.

### Example 3: Fixing Passive Voice

**修改前：**
> The configuration file is read by the application at startup.

**修改后：**
> The application reads the configuration file at startup.

### Example 4: Removing Hedging

**修改前：**
> It is important to note that the API might potentially return an error in certain situations.

**修改后：**
> The API returns an error when the token expires.

## Best Practices

1. **具体说明，不要夸大** -- 说明它实际做什么，而非强调它有多重要
2. **先删再加** -- 删除文字，直到影响意思，再补回必要部分
3. **优先主动语态** -- "The function returns X" 优于 "X is returned by the function"
4. **使用肯定表达** -- "He forgot" 优于 "He did not remember"
5. **使用具体语言** -- "The server crashed" 优于 "An issue occurred"
6. **节制加载参考文件** -- 多数任务只需 `03-elementary-principles-of-composition.md`

## Directory Structure

```
writing-clearly-and-concisely/
  SKILL.md                 # Main skill definition
  README.md                # This file
  signs-of-ai-writing.md   # AI pattern detection guide
  elements-of-style/
    01-introductory.md
    02-elementary-rules-of-usage.md
    03-elementary-principles-of-composition.md
    04-a-few-matters-of-form.md
    05-words-and-expressions-commonly-misused.md
```

## Installation

**Claude Code:**
```bash
cp -r skills/writing-clearly-and-concisely ~/.claude/skills/
```

**Claude.ai:**
将 skill 加入项目知识，或将 SKILL.md 的内容粘贴到对话中。

## Attribution

- 原始 skill 由 @joshuadavidthomas 编写，来自 [joshuadavidthomas/agent-skills](https://github.com/joshuadavidthomas/agent-skills)（MIT）
- 改编自 [obra/the-elements-of-style](https://github.com/obra/the-elements-of-style)
- 写作原则来自 William Strunk Jr. 的 *The Elements of Style*（1918）
- AI 写作模式研究来自 Wikipedia 的 AI 生成内容识别指南
