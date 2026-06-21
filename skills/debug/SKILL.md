---
name: debug
description: Use when the user reports a bug, test failure, exception, broken behavior, flaky behavior, performance regression, build failure, integration failure, or any unexpected behavior.
---

# debug

## 概览

debug 是处理 bug 的默认入口。核心纪律是：先建立可靠反馈回路，先找到 root cause，再修复。没有复现、没有证据、没有可证伪假设时，不要提出修复方案。

如果用户要的是新功能、产品行为设计、需求澄清或非 bug 的改动，使用 `scope`。如果用户描述的是"坏了、报错、测试失败、变慢、偶发失败、行为不符合预期"，使用本 skill，不要先走 `scope`。

## 铁律

```
NO FIXES WITHOUT A FEEDBACK LOOP AND ROOT CAUSE INVESTIGATION
```

违反流程的字面规定，就是违反调试精神。尤其不要：

- 看到症状就改代码
- 同时改多处再跑测试
- 在没有复现的情况下推测原因
- 用 workaround 代替 root cause
- 在两次失败修复后继续"再试一个"

## 阶段 1：构建反馈回路

这是真正的 skill。只要有一个快速、确定、agent 能运行的 pass/fail 信号，后续的 bisect、假设检验和 instrumentation 都只是消费这个信号。没有这样的信号，盯代码只会制造猜测。

按以下顺序尝试构建回路：

1. 在能触及 bug 的 seam 写一个失败测试：unit、integration、e2e 都可以。
2. 用 curl 或 HTTP 脚本打正在运行的 dev server。
3. 用 CLI fixture 输入触发，并把 stdout/stderr 与已知正确输出 diff。
4. 用 Playwright/Puppeteer 驱动 UI，断言 DOM、console、network。
5. 回放真实 trace：HAR、payload、event log、日志片段。
6. 写一次性 harness：启动最小系统子集，用单次调用触发代码路径。
7. 对非确定性输出跑 property/fuzz 循环，寻找失败模式。
8. 对版本、数据集或配置差异写 bisection harness，用 `git bisect run` 或等价脚本定位。
9. 对旧版/新版、配置 A/B 做 differential loop，比较同一输入的输出。
10. 如果必须人手操作，使用 HITL 脚本把人工步骤结构化，并捕获可解析输出。

把回路当成产品迭代：

- 更快：缓存 setup，缩小测试范围，跳过无关初始化。
- 更尖锐：断言用户描述的具体症状，不满足于"没崩"。
- 更确定：固定时间、seed RNG、隔离 filesystem、冻结 network。

非确定性 bug 的目标不是一次干净复现，而是提高复现率。循环 100 次、并行化、加压力、缩小时序窗口、注入 sleep，直到复现率足以调试。

如果确实构不出回路，停下来说明你尝试过什么，并向用户要以下之一：可复现环境、捕获 artifact、生产临时 instrumentation 许可。没有回路时不要进入假设阶段。

## 阶段 2：复现并调查 root cause

跑反馈回路，看着 bug 出现。确认：

- 失败模式就是用户描述的那个 bug，不是附近的另一个失败。
- 多次运行能复现，或非确定性 bug 的复现率足以支持调试。
- 已捕获精确症状：错误消息、错误输出、慢时序、错误状态。

然后做 root cause 调查：

1. 完整阅读 error、warning、stack trace、错误码与路径。
2. 检查最近改动：`git diff`、相关 commit、依赖、配置、环境差异。
3. 对多组件系统，在每个边界记录输入、输出、配置传播和状态。
4. 追踪数据流：错误值从哪里来，被谁传下去，在哪个边界变坏。
5. 如果错误出现在 call stack 深处，沿调用链向上追到最初触发点。需要时读 `root-cause-tracing.md`。

不要在症状出现的位置修复，除非已经证明那就是源头。

## 阶段 3：模式分析

在提出修复前，先找可工作的相邻模式：

- 同一 codebase 里有没有类似但正常工作的实现？
- 参考实现是否被完整阅读，而不是凭印象套用？
- 好的路径和坏的路径有哪些差异？
- 依赖、配置、初始化顺序、环境假设有什么不同？

列出差异，不要预设"这个小差别不可能有影响"。

## 阶段 4：假设与 instrumentation

先生成 3-5 个有排序的可证伪假设。每个假设都必须给出预测：

> 如果 X 是原因，那么改变 Y 会让 bug 消失，或改变 Z 会让 bug 更明显。

把排序后的假设列表给用户看。用户可能知道哪些刚刚改过、哪些已经被排除。如果用户 AFK，按你的排序继续。

每轮只测试当前 top 1 假设。instrumentation 必须对应某个预测，一次只改一个变量。

工具偏好：

1. 能用 debugger/REPL 就用，断点胜过大量日志。
2. 在能区分假设的边界打有针对性的日志。
3. 不要"全部打日志再 grep"。

给每条临时日志加唯一 tag，例如 `[DEBUG-a4f2]`，收尾时用同一个 tag 清理。

性能 regression 分支：先建立 baseline 测量，再定位。优先 profiler、query plan、计时 harness、bisect。不要先靠日志猜性能原因。

## 阶段 5：修复与回归测试

在修复前写回归测试，但只写在正确 seam 上。正确 seam 是能以真实 bug 模式触发问题的调用点；太浅的测试只会制造虚假信心。

开始写任何生产修复代码前，调用 `test-driven-development`。本阶段已有的最小 repro / 回归测试就是 RED 输入；仍要按 TDD 验证它先失败，再写最少修复代码让它通过。

如果没有正确 seam，这本身就是发现：架构阻止这个 bug 被锁死。记录下来，修复后再提出架构改进建议。

执行顺序：

1. 把最小 repro 转成失败测试或可重复脚本。
2. 看着它失败。
3. 实施单一 root-cause 修复。
4. 看着它通过。
5. 重新跑原始反馈回路，确认用户场景不再复现。
6. 跑相关测试，确认没有回归。

如果修复无效，停下来回到阶段 2 或阶段 4，不要在失败 fix 上继续叠补丁。三次修复失败后，先质疑架构或根本假设，并和用户讨论后再继续。

## 阶段 6：纵深防御与收尾

如果 bug 来自非法数据、危险状态或错误环境，仅在一处加检查通常不够。沿数据流增加防御：

- 入口校验：API 边界拒绝明显非法输入。
- 业务校验：操作前确认状态对该行为成立。
- 环境守卫：测试、生产、临时目录、权限等上下文约束。
- 取证埋点：在危险操作前保留必要上下文。

完整模式见 `defense-in-depth.md`。

如果 bug 是 race、flaky 测试或异步时序问题，优先等待条件而不是猜 sleep 时间。完整模式见 `condition-based-waiting.md`。

宣布完成前必须确认：

- 原始 repro 不再复现。
- 回归测试或可重复脚本通过。
- 相关测试通过。
- 所有 `[DEBUG-...]` instrumentation 已清理。
- 一次性 harness 已删除，或挪到明确标记的调试位置。
- 最终 root cause 和被证实的假设写进 commit/PR message 或最终说明。

## 红旗：看到就停下

以下念头意味着你正在猜：

| 念头 | 现实 |
| --- | --- |
| "先临时修一下" | 这是 workaround，不是 root cause。 |
| "八成是 X，我直接改" | 没有预测和证据就不是假设。 |
| "一次改多处省时间" | 你将无法知道哪一处有效。 |
| "问题简单，不需要流程" | 简单 bug 也有 root cause。 |
| "测试后面再补" | 没有失败测试，无法证明修复针对原 bug。 |
| "再试一个 fix" | 两次失败后要重新调查；三次失败后质疑架构。 |
| "日志全打上再说" | instrumentation 必须服务于具体预测。 |

用户说 "Stop guessing"、"Will it show us...?"、"Is that not happening?" 或类似话时，立即回到 root cause 调查。

## 参考材料

- `root-cause-tracing.md`：当错误出现在 call stack 深处时，沿调用链反向追到最初触发点。
- `find-polluter.sh`：当测试污染或副作用来源不明时，逐个运行测试定位污染者。
- `defense-in-depth.md`：当 root cause 是非法数据或危险状态时，在多层添加校验，让 bug 结构上更难复发。
- `condition-based-waiting.md`：当失败涉及 race、flaky、timeout 或异步等待时，用条件轮询替代任意 sleep。
- `condition-based-waiting-example.ts`：条件等待 helper 的完整 TypeScript 示例。
- `scripts/hitl-loop.template.sh`：当复现必须由人点击或观察时，把人工步骤结构化并捕获输出。
