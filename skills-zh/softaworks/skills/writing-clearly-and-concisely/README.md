# Writing Clearly and Concisely

本 skill 应用 William Strunk Jr. 历久有效的写作原则，写出更清晰、有力、专业的 prose，同时避免常见 AI writing patterns。

## Purpose

本 skill 帮助你为人类读者写出更好的 prose，依据来自两部分：

1. **The Elements of Style**（Strunk，1918）-- 经时间检验的清晰、有力写作规则
2. **AI Pattern Avoidance** — 以研究为依据，指导如何避免 LLM 容易生成的笼统、浮夸语言

无论撰写文档、commit message、错误信息，还是其他供人阅读的文字，本 skill 都能帮助你删去赘词，准确表达意思。

## When to Use

每当撰写供人阅读的 prose 时，使用本 skill：

- **文档** -- README 文件、API 文档、技术说明
- **Git workflow** — commit message、pull request 描述
- **User-facing text** — 错误信息、UI 文案、帮助文字、tooltip
- **Code comments** — 内联文档、docstring
- **报告和摘要** -- 状态更新、分析、解释
- **编辑** -- 提高现有文字的清晰度

**触发短语：**
- "Write documentation for..."（“为……编写文档”）
- "Draft a README"（“起草一份 README”）
- "Edit this for clarity"（“编辑这段文字，让它更清楚”）
- "Make this more concise"（“让它更简洁”）
- "Review this commit message"（“检查这条 commit message”）

## How It Works

1. 面向人类读者写作时，**加载本 skill**
2. **应用 Strunk 的核心原则** — active voice、positive form、concrete language、删去不必要的词
3. **避免 AI patterns** — 不夸大，不写空泛 phrases，不使用 promotional adjectives
4. 涉及具体规则时，**查阅详细指南**

### Context-Efficient Approach

本 skill 使用 progressive disclosure 节省 context：

- **SKILL.md**（约 1,000 tokens）首先加载，提供核心规则
- **参考文件**（每份 1,000–4,500 tokens）仅在需要时加载
- **多数任务只需一个文件**：`03-elementary-principles-of-composition.md`

context 紧张时，将初稿和相关章节文件交给一个 subagent。

## Key Features

### Strunk's Core Rules

本 skill 强调 *The Elements of Style* 中的以下原则：

| 规则 | 原则 |
|------|-----------|
| 10 | 使用 active voice |
| 11 | 以 positive form 表述 |
| 12 | 使用明确、具体的语言 |
| 13 | 删去不必要的词 |
| 16 | 把相关的词放在一起 |
| 18 | 把需要强调的词放在句末 |

### AI Pattern Detection

本 skill 识别并去除常见的 LLM writing patterns：

- **Puffery**：pivotal、crucial、vital、testament、enduring legacy
- **空泛的 "-ing" phrases**：ensuring reliability、showcasing features
- **Promotional adjectives**：groundbreaking、seamless、robust、cutting-edge
- **过度使用的 AI vocabulary**：delve、leverage、multifaceted、foster、realm、tapestry
- **过度排版**：滥用 bullets、装饰性 emoji，或隔一个词就加 bold

## Reference Files

| 章节 | 文件 | Tokens | 内容 |
|---------|------|--------|---------|
| Grammar 与 punctuation | `02-elementary-rules-of-usage.md` | ~2,500 | comma 规则、possessives、句子结构 |
| Composition principles | `03-elementary-principles-of-composition.md` | ~4,500 | active voice、简洁表达、段落结构 |
| 格式 | `04-a-few-matters-of-form.md` | ~1,000 | 标题、引文、格式约定 |
| 选词 | `05-words-and-expressions-commonly-misused.md` | ~4,000 | 常见错误、词语选择 |
| AI patterns | `signs-of-ai-writing.md` | ~25,000 | Wikipedia editors 用于 AI detection 的 field guide |

## Usage Examples

### Example 1: Tightening a Commit Message

**修改前：**
> This commit implements the functionality for ensuring that user authentication is properly handled, showcasing robust error handling capabilities.（这个 commit 实现了确保妥善处理 user authentication 的功能，展示了 robust error handling 能力。）

**修改后：**
> Add user authentication with error handling（添加 user authentication，并处理错误。）

### Example 2: Rewriting Documentation

**修改前：**
> This groundbreaking feature leverages cutting-edge technology to deliver a seamless experience, fostering better engagement and driving impactful results.（这个 groundbreaking 功能运用 cutting-edge 技术提供 seamless 体验，促进更好的参与，并推动产生有影响力的结果。）

**修改后：**
> This feature uses WebSocket connections to update the dashboard in real time.（这个功能使用 WebSocket connections 实时更新 dashboard。）

### Example 3: Fixing Passive Voice

**修改前：**
> The configuration file is read by the application at startup.（configuration file 在启动时由 application 读取。）

**修改后：**
> The application reads the configuration file at startup.（application 在启动时读取 configuration file。）

### Example 4: Removing Hedging

**修改前：**
> It is important to note that the API might potentially return an error in certain situations.（需要特别注意，API 在某些情况下可能有可能返回错误。）

**修改后：**
> The API returns an error when the token expires.（token 到期时，API 返回错误。）

## Best Practices

1. **具体说明，不要夸大** -- 说明它实际做什么，而非强调它有多重要
2. **先删再加** -- 删除文字，直到影响意思，再补回必要部分
3. **优先 active voice** — "The function returns X"（函数返回 X）优于 "X is returned by the function"（X 由函数返回）
4. **使用 positive form** — "He forgot"（他忘了）优于 "He did not remember"（他没有记住）
5. **使用 concrete language** — "The server crashed"（server 崩溃了）优于 "An issue occurred"（发生了一个问题）
6. **节制加载参考文件** -- 多数任务只需 `03-elementary-principles-of-composition.md`

## Directory Structure

```
writing-clearly-and-concisely/
  SKILL.md                 # 主要 skill 定义
  README.md                # 本文件
  signs-of-ai-writing.md   # AI pattern detection 指南
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
- AI pattern 研究来自 Wikipedia 用于 AI-generated content detection 的 field guide
