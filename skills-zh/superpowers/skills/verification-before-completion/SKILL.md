---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always
---

# 完成前的验证 / Verification Before Completion

## 概述

在没有验证的情况下声称工作已完成，是不诚实，而不是效率。

**核心原则：** 永远先有证据，再有结论。

**违反这条规则的字面含义，就是违反这条规则的精神。**

## 铁律 / The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

如果你在这条消息中没有运行过验证命令，你就不能声称它通过了。

## 守门函数 / The Gate Function

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

## 常见失败 / Common Failures

| 声称 | 所需证据 | 不足以作为证据 |
|-------|----------|----------------|
| 测试通过 | 测试命令输出：0 个失败 | 之前的运行结果，"应该会通过" |
| Linter 干净 | Linter 输出：0 个错误 | 局部检查、外推推断 |
| 构建成功 | 构建命令：exit 0 | Linter 通过、日志看起来不错 |
| Bug 已修复 | 针对原始症状的测试：通过 | 改了代码，假定已修好 |
| 回归测试有效 | 已验证 red-green 循环 | 测试通过过一次 |
| Agent 已完成 | VCS diff 显示了改动 | Agent 报告"成功" |
| 满足需求 | 逐条核对清单 | 测试通过 |

## 红色警报 —— 停下 / Red Flags - STOP

- 使用 "should"、"probably"、"seems to" 这样的字眼
- 在验证之前就表达满意（"Great!"、"Perfect!"、"Done!" 等）
- 即将在没有验证的情况下 commit/push/PR
- 信任 agent 给出的成功报告
- 依赖局部验证
- 想着"就这一次"
- 感到疲惫，想赶紧把活干完
- **任何在没有运行验证的情况下暗示成功的措辞**

## 防止合理化 / Rationalization Prevention

| 借口 | 实际情况 |
|--------|---------|
| "现在应该能工作了" | 去 RUN 验证命令 |
| "我有信心" | 信心 ≠ 证据 |
| "就这一次" | 没有例外 |
| "Linter 通过了" | Linter ≠ 编译器 |
| "Agent 说成功了" | 独立验证 |
| "我累了" | 疲惫 ≠ 借口 |
| "局部检查就够了" | 局部什么也证明不了 |
| "措辞不同所以规则不适用" | 精神高于字面 |

## 关键模式 / Key Patterns

**测试：**
```
✅ [Run test command] [See: 34/34 pass] "All tests pass"
❌ "Should pass now" / "Looks correct"
```

**回归测试（TDD Red-Green）：**
```
✅ Write → Run (pass) → Revert fix → Run (MUST FAIL) → Restore → Run (pass)
❌ "I've written a regression test" (without red-green verification)
```

**构建：**
```
✅ [Run build] [See: exit 0] "Build passes"
❌ "Linter passed" (linter doesn't check compilation)
```

**需求：**
```
✅ Re-read plan → Create checklist → Verify each → Report gaps or completion
❌ "Tests pass, phase complete"
```

**Agent 委派：**
```
✅ Agent reports success → Check VCS diff → Verify changes → Report actual state
❌ Trust agent report
```

## 为什么这很重要 / Why This Matters

来自 24 条失败记忆：
- 你的人类伙伴说过 "I don't believe you" —— 信任已破裂
- 未定义的函数被发布出去 —— 会崩溃
- 缺失需求被发布出去 —— 功能不完整
- 时间浪费在虚假的"完成"上 → 被重新指向 → 返工
- 违反："Honesty is a core value. If you lie, you'll be replaced."

## 何时适用 / When To Apply

**永远要在以下行为之前应用：**
- 任何形式的成功/完成声明
- 任何表达满意的措辞
- 任何关于工作状态的正面陈述
- commit、PR 创建、任务完成
- 进入下一项任务
- 委派给 agent

**该规则适用于：**
- 原文短语
- 改述与同义表达
- 暗示成功
- 任何暗示完成/正确性的表达

## 结论 / The Bottom Line

**验证不能走捷径。**

运行命令。阅读输出。**然后再**声称结果。

这一点没有商量余地。
