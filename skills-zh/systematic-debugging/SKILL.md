---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# 系统化调试

## 概述

随意修补浪费时间，并制造新的 bug。临时补丁掩盖深层问题。

**核心原则：** 在尝试任何修复之前，永远先找到 root cause。只修症状就是失败。

**违反这一流程的字面规定，就是违反调试的精神。**

## 铁律

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

如果你没有完成 Phase 1，就不能提出修复方案。

## 何时使用

适用于任何技术问题：
- 测试失败
- 生产环境的 bug
- 意外行为
- 性能问题
- 构建失败
- 集成问题

**尤其在以下情况要使用：**
- 时间压力下（紧急情况让人忍不住乱猜）
- 看起来"只是一个简单修复"
- 你已经尝试了多次修复
- 上一次修复没有生效
- 你并不完全理解这个问题

**不要在以下情况跳过：**
- 问题看起来很简单（简单 bug 也有 root cause）
- 你赶时间（仓促保证返工）
- 经理希望"现在就修好"（系统化反而比反复折腾更快）

## 四个阶段

你必须完成每一个阶段，才能进入下一阶段。

### Phase 1：Root Cause 调查

**在尝试任何修复之前：**

1. **仔细阅读错误信息**
   - 不要跳过 error 或 warning
   - 它们往往包含确切的解决方案
   - 完整阅读 stack trace
   - 记下行号、文件路径、错误码

2. **稳定复现**
   - 你能可靠地触发它吗？
   - 具体的步骤是什么？
   - 每次都发生吗？
   - 如果无法复现 → 收集更多数据，不要乱猜

3. **检查最近的改动**
   - 哪些改动可能导致了这个问题？
   - git diff、最近的 commit
   - 新的依赖、配置变更
   - 环境差异

4. **在多组件系统中收集证据**

   **当系统具有多个组件时（CI → build → signing，API → service → database）：**

   **在提出修复方案之前，先添加诊断 instrumentation：**
   ```
   For EACH component boundary:
     - Log what data enters component
     - Log what data exits component
     - Verify environment/config propagation
     - Check state at each layer

   Run once to gather evidence showing WHERE it breaks
   THEN analyze evidence to identify failing component
   THEN investigate that specific component
   ```

   **示例（多层系统）：**
   ```bash
   # Layer 1: Workflow
   echo "=== Secrets available in workflow: ==="
   echo "IDENTITY: ${IDENTITY:+SET}${IDENTITY:-UNSET}"

   # Layer 2: Build script
   echo "=== Env vars in build script: ==="
   env | grep IDENTITY || echo "IDENTITY not in environment"

   # Layer 3: Signing script
   echo "=== Keychain state: ==="
   security list-keychains
   security find-identity -v

   # Layer 4: Actual signing
   codesign --sign "$IDENTITY" --verbose=4 "$APP"
   ```

   **这会揭示：** 哪一层失败了（secrets → workflow ✓，workflow → build ✗）

5. **追踪数据流**

   **当 error 位于 call stack 深处时：**

   完整的反向追踪技术，请参见本目录中的 `root-cause-tracing.md`。

   **简短版本：**
   - 错误的值最初来源于哪里？
   - 是谁用错误的值调用了它？
   - 持续往上追踪，直到找到源头
   - 在源头修复，而不是在症状处修复

### Phase 2：模式分析

**在修复前先找到 pattern：**

1. **找到可工作的示例**
   - 在同一 codebase 中定位类似的、能正常工作的代码
   - 哪些与坏掉的代码相似但运行正常？

2. **对照参考实现**
   - 如果在实现某个 pattern，请完整阅读参考实现
   - 不要走马观花——逐行阅读
   - 在套用之前完全理解这个 pattern

3. **找出差异**
   - 可工作的与坏掉的之间有什么不同？
   - 列出每一处差异，再小也要列
   - 不要预设"这点小差别不可能有影响"

4. **理解依赖关系**
   - 它还需要哪些其他组件？
   - 需要哪些设置、config、环境？
   - 它做了哪些假设？

### Phase 3：假设与测试

**科学方法：**

1. **形成单一假设**
   - 清晰陈述：「我认为 X 是 root cause，因为 Y」
   - 把它写下来
   - 要具体，不要含糊

2. **以最小改动测试**
   - 做最小可能的改动来测试假设
   - 一次只改变一个变量
   - 不要一次性修多处

3. **继续之前先验证**
   - 生效了吗？是 → Phase 4
   - 没生效？形成新的假设
   - 不要在原修复之上再叠修复

4. **当你不知道时**
   - 直说「我不理解 X」
   - 不要装懂
   - 寻求帮助
   - 进一步研究

### Phase 4：实施

**修 root cause，不修症状：**

1. **创建失败的测试用例**
   - 最简单可能的复现
   - 尽量自动化测试
   - 如果没有 framework，就写一次性测试脚本
   - 修复前必须有
   - 使用 `superpowers:test-driven-development` skill 来撰写正确的失败测试

2. **实施单一修复**
   - 针对识别出的 root cause
   - 一次只做一处改动
   - 不要捎带"既然在这里就顺便改一下"
   - 不要打包做 refactoring

3. **验证修复**
   - 测试现在通过了吗？
   - 没有破坏其他测试吗？
   - 问题真的解决了吗？

4. **如果修复无效**
   - 停下来
   - 计数：你已经尝试了多少次修复？
   - 如果 < 3：回到 Phase 1，结合新信息重新分析
   - **如果 ≥ 3：停下来并质疑 architecture（下面的第 5 步）**
   - 不要在没有架构层面讨论的情况下尝试第 4 次修复

5. **如果 3+ 次修复失败：质疑 architecture**

   **表明架构问题的模式：**
   - 每次修复都在不同位置揭示出新的共享 state / 耦合 / 问题
   - 修复需要"大规模 refactoring"才能实施
   - 每次修复都在别处带来新的症状

   **停下来，质疑根本假设：**
   - 这个 pattern 在根本上是否合理？
   - 我们是不是"仅凭惯性在死撑"？
   - 我们应该重构 architecture，还是继续修症状？

   **在尝试更多修复之前，先与你的人类伙伴讨论。**

   这并不是一个失败的假设——这是一个错误的 architecture。

## 红旗信号——停下并遵循流程

如果你抓到自己在想：
- 「先临时修一下，回头再调查」
- 「先随便改改 X，看看会不会好」
- 「同时改多处，跑测试」
- 「跳过测试，我手动验证一下」
- 「八成是 X 的问题，我去修一下」
- 「我没完全理解，但这样可能就行」
- 「pattern 说是 X，但我换个方式套用」
- 「这里是主要问题：[未经调查就列出修复]」
- 在追踪数据流之前就开始提解决方案
- **「再试一次修复」（在已经尝试 2+ 次后）**
- **每次修复都在不同位置揭示出新问题**

**以上每一种都意味着：停下。回到 Phase 1。**

**如果 3+ 次修复失败：** 质疑 architecture（见 Phase 4.5）

## 你的人类伙伴发出的"你做错了"的信号

**留意以下重定向语句：**
- "Is that not happening?" —— 你没有验证就做出了假设
- "Will it show us...?" —— 你本应添加证据收集
- "Stop guessing" —— 你在没有理解的情况下提出修复
- "Ultrathink this" —— 质疑根本，不只是症状
- "We're stuck?"（带挫败感） —— 你的方法不奏效

**当你看到这些时：** 停下。回到 Phase 1。

## 常见的合理化借口

| 借口 | 现实 |
|--------|---------|
| "问题简单，不需要流程" | 简单问题也有 root cause。流程对简单 bug 也很快。 |
| "紧急情况，没时间走流程" | 系统化调试比反复猜测更快。 |
| "先试这个，再去调查" | 第一次修复决定了路径。一开始就要做对。 |
| "等修复确认有效后再写测试" | 没测试的修复站不住。先有测试才能证明有效。 |
| "一次改多处省时间" | 无法分辨是哪一处生效。还会引入新 bug。 |
| "参考太长了，我适配一下 pattern 就行" | 局部理解必然带来 bug。完整阅读。 |
| "我看到问题了，让我修一下" | 看到症状 ≠ 理解 root cause。 |
| "再试一次修复"（在 2+ 次失败之后） | 3+ 次失败 = 架构问题。质疑 pattern，而不是再修一次。 |

## 速查参考

| 阶段 | 关键活动 | 成功标准 |
|-------|---------------|------------------|
| **1. Root Cause** | 读 error、复现、检查变更、收集证据 | 理解 WHAT 与 WHY |
| **2. Pattern** | 找可工作示例、比对 | 找出差异 |
| **3. Hypothesis** | 形成理论、最小化测试 | 验证或新假设 |
| **4. Implementation** | 创建测试、修复、验证 | bug 解决、测试通过 |

## 当流程显示"没有 root cause"时

如果系统化调查表明问题确实是环境性、时序相关或外部因素：

1. 你已经走完流程
2. 记录你调查过的内容
3. 实施合适的处理（retry、timeout、error message）
4. 为日后调查添加 monitoring/logging

**但是：** 95% 的"没有 root cause"案例其实是调查不充分。

## 配套技术

这些技术是系统化调试的一部分，存放于本目录：

- **`root-cause-tracing.md`** —— 沿 call stack 反向追踪 bug，找到最初的触发点
- **`defense-in-depth.md`** —— 在找到 root cause 之后，在多层添加校验
- **`condition-based-waiting.md`** —— 用条件轮询替代任意 timeout

**相关 skill：**
- **superpowers:test-driven-development** —— 用于创建失败的测试用例（Phase 4，Step 1）
- **superpowers:verification-before-completion** —— 在宣称成功之前先验证修复确实生效

## 真实世界的影响

来自调试会话的数据：
- 系统化方法：15-30 分钟修复
- 随机修复方法：2-3 小时反复折腾
- 一次修复成功率：95% vs 40%
- 引入的新 bug：几乎为零 vs 常见
