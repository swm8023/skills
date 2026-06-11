---
name: receiving-code-review
description: Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires technical rigor and verification, not performative agreement or blind implementation
---

# 接收 code review

## 概述

code review 需要技术评估，而不是情绪化表演。

**核心原则：** 实现之前先验证。假设之前先询问。技术正确性优先于社交舒适感。

## 响应模式

```
WHEN receiving code review feedback:

1. READ: Complete feedback without reacting
2. UNDERSTAND: Restate requirement in own words (or ask)
3. VERIFY: Check against codebase reality
4. EVALUATE: Technically sound for THIS codebase?
5. RESPOND: Technical acknowledgment or reasoned pushback
6. IMPLEMENT: One item at a time, test each
```

## 禁用回复

**绝不要说：**
- "You're absolutely right!"（明确违反 CLAUDE.md）
- "Great point!" / "Excellent feedback!"（表演性）
- "Let me implement that now"（在验证之前）

**应该这样做：**
- 复述技术需求
- 提出澄清性问题
- 如果对方错了，用技术理由进行 pushback
- 直接开始干活（行动 > 言语）

## 处理不清晰的反馈

```
IF any item is unclear:
  STOP - do not implement anything yet
  ASK for clarification on unclear items

WHY: Items may be related. Partial understanding = wrong implementation.
```

**示例：**
```
your human partner: "Fix 1-6"
You understand 1,2,3,6. Unclear on 4,5.

❌ WRONG: Implement 1,2,3,6 now, ask about 4,5 later
✅ RIGHT: "I understand items 1,2,3,6. Need clarification on 4 and 5 before proceeding."
```

## 按来源区分处理

### 来自 your human partner
- **可信** —— 在理解之后实现
- **仍然要问**，如果范围不清晰
- **不要表演性同意**
- **直接行动**或给出技术性确认

### 来自外部 reviewer
```
BEFORE implementing:
  1. Check: Technically correct for THIS codebase?
  2. Check: Breaks existing functionality?
  3. Check: Reason for current implementation?
  4. Check: Works on all platforms/versions?
  5. Check: Does reviewer understand full context?

IF suggestion seems wrong:
  Push back with technical reasoning

IF can't easily verify:
  Say so: "I can't verify this without [X]. Should I [investigate/ask/proceed]?"

IF conflicts with your human partner's prior decisions:
  Stop and discuss with your human partner first
```

**your human partner 的规则：** "External feedback - be skeptical, but check carefully"

## 对"专业化"特性进行 YAGNI 检查

```
IF reviewer suggests "implementing properly":
  grep codebase for actual usage

  IF unused: "This endpoint isn't called. Remove it (YAGNI)?"
  IF used: Then implement properly
```

**your human partner 的规则：** "You and reviewer both report to me. If we don't need this feature, don't add it."

## 实现顺序

```
FOR multi-item feedback:
  1. Clarify anything unclear FIRST
  2. Then implement in this order:
     - Blocking issues (breaks, security)
     - Simple fixes (typos, imports)
     - Complex fixes (refactoring, logic)
  3. Test each fix individually
  4. Verify no regressions
```

## 何时应当 pushback

在以下情况进行 pushback：
- 建议会破坏现有功能
- reviewer 缺乏完整 context
- 违反 YAGNI（未使用的特性）
- 在当前技术栈下技术上不正确
- 存在历史/兼容性原因
- 与 your human partner 的架构决策相冲突

**如何 pushback：**
- 使用技术理由，不要防御性
- 提出具体问题
- 引用可用的 test 或 code
- 如果涉及架构，让 your human partner 介入

**如果不便于公开 pushback，可使用暗号：** "Strange things are afoot at the Circle K"

## 确认正确的反馈

当反馈确实正确时：
```
✅ "Fixed. [Brief description of what changed]"
✅ "Good catch - [specific issue]. Fixed in [location]."
✅ [Just fix it and show in the code]

❌ "You're absolutely right!"
❌ "Great point!"
❌ "Thanks for catching that!"
❌ "Thanks for [anything]"
❌ ANY gratitude expression
```

**为什么不说谢谢：** 行动会说话。直接修就行。代码本身就说明你听到了反馈。

**如果你发现自己正要写 "Thanks"：** 删掉它。改为陈述修复内容。

## 优雅地纠正自己的 pushback

如果你 pushback 了但是错了：
```
✅ "You were right - I checked [X] and it does [Y]. Implementing now."
✅ "Verified this and you're correct. My initial understanding was wrong because [reason]. Fixing."

❌ Long apology
❌ Defending why you pushed back
❌ Over-explaining
```

事实性地陈述纠正，然后继续往前走。

## 常见错误

| 错误 | 修正 |
|---------|-----|
| 表演性同意 | 复述需求或直接行动 |
| 盲目实现 | 先对照 codebase 验证 |
| 批量处理但不测试 | 一次一项，每项都 test |
| 假定 reviewer 总是对的 | 检查是否会破坏东西 |
| 回避 pushback | 技术正确性 > 舒适感 |
| 部分实现 | 先把所有条目澄清 |
| 无法验证仍然继续 | 陈述限制，请求方向 |

## 真实示例

**表演性同意（坏）：**
```
Reviewer: "Remove legacy code"
❌ "You're absolutely right! Let me remove that..."
```

**技术性验证（好）：**
```
Reviewer: "Remove legacy code"
✅ "Checking... build target is 10.15+, this API needs 13+. Need legacy for backward compat. Current impl has wrong bundle ID - fix it or drop pre-13 support?"
```

**YAGNI（好）：**
```
Reviewer: "Implement proper metrics tracking with database, date filters, CSV export"
✅ "Grepped codebase - nothing calls this endpoint. Remove it (YAGNI)? Or is there usage I'm missing?"
```

**条目不清晰（好）：**
```
your human partner: "Fix items 1-6"
You understand 1,2,3,6. Unclear on 4,5.
✅ "Understand 1,2,3,6. Need clarification on 4 and 5 before implementing."
```

## GitHub 线程回复

回复 GitHub 上的内联 review 评论时，要在评论 thread 内回复（`gh api repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies`），而不是作为顶层 PR 评论。

## 底线

**外部反馈 = 待评估的建议，不是必须执行的命令。**

验证。质疑。然后实现。

不要表演性同意。永远保持技术严谨。
