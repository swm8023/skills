---
name: diagnosing-bugs
description: 难解 bug 和性能回退的诊断循环。当用户说 "diagnose"/"debug this"，或报告损坏、抛错、失败、变慢时使用。
---

# Diagnosing Bugs

处理难解 bug 的纪律。只有明确说明理由时，才跳过阶段。

探索代码库时，阅读 `GLOSSARY.md`（若存在）来建立相关模块的清晰心智模型，并查看涉及区域的 ADR。

## Redact

本 skill 要求展示命令、输出和捕获的产物。**先脱敏每个 secret**：用 `<REDACTED>` 替代。循环使用环境变量，让凭证留在环境中，而不进入展示内容。捕获产物可能含认证 header：只引用承载有效信号的行。

如果脱敏输出不足以诊断 bug，明确说明并询问用户。

## Phase 1: Build a feedback loop

**这就是本 skill 的核心。** 其余都是机械操作。如果拥有 bug 的 **tight** 成功/失败信号（在_这个_ bug 上变 red），就能找到原因；二分、假设检验和 instrumentation 都只是使用这个信号。没有它，盯代码再久也没用。

在这里投入远多于其他步骤的精力。**积极尝试，发挥创造力，拒绝放弃。**

### Ways to construct one, in roughly this order

1. 在能够触发 bug 的 seam 上编写 **failing test**：单元、集成或 e2e。
2. 对运行中的 dev server 使用 **Curl / HTTP script**。
3. 用 fixture 输入执行 **CLI invocation**，将 stdout 与已知正确的 snapshot 做 diff。
4. **Headless browser script**（Playwright / Puppeteer）：驱动 UI，对 DOM、console、network 断言。
5. **重放捕获的 trace。** 将真实网络请求、payload、event log 保存到磁盘，隔离重放对应代码路径。
6. **Throwaway harness。** 启动系统的最小子集（一个服务及 mock 依赖），用一次函数调用走过 bug 路径。
7. **Property / fuzz loop。** 如果 bug 是“有时输出错误”，运行 1000 个随机输入来寻找失败模式。
8. **Bisection harness。** 如果 bug 出现在两个已知状态（commit、数据集、版本）之间，自动化“在状态 X 启动、检查、重复”，使它可用于 `git bisect run`。
9. **Differential loop。** 用同一输入运行新旧版本（或两套配置），对输出做 diff。
10. **HITL bash script。** 最后手段。如果必须人工点击，用 `scripts/hitl-loop.template.sh` 驱动_人_，保持循环结构化。捕获的输出反馈给你。

构建正确的反馈循环，bug 就已经修好了 90%。

### Tighten the loop

把循环当产品。一旦有_一个_循环，就继续 **tighten**：

- 能否更快？（缓存准备、跳过无关初始化、缩小测试范围。）
- 能否让信号更明确？（断言具体症状，而不是“没崩溃”。）
- 能否更确定？（固定时间、随机种子，隔离文件系统，冻结网络。）

30 秒且 flaky 的循环几乎不比没有好；2 秒且确定的循环才是 tight，是调试的强大能力。

### Non-deterministic bugs

目标不是完全干净的复现，而是 **更高的复现率**。触发 100 次、并行、施压、缩小时间窗口、注入 sleep。50% 概率的 flaky bug 可以调试；1% 不行，所以持续提高复现率，直到可调试。

### When you genuinely cannot build a loop

停止并明确说明。列出尝试过的办法。向用户请求：(a) 可复现环境的访问权限；(b) 已脱敏的捕获产物（HAR、日志、core dump、带时间戳的录屏）；或 (c) 添加临时生产 instrumentation 的权限。没有循环，**不要**进入假设阶段。

### Completion criterion: a tight loop that goes red

循环 **tight** 且 **red-capable** 时，阶段 1 才算完成：你能指出**一个命令**（脚本路径、测试调用或 curl），你**已经至少运行过一次**（展示脱敏的调用及输出），并且它满足：

- [ ] **Red-capable**：驱动实际 bug 路径，断言**用户的确切症状**，因此能在此 bug 上变 red，修复后变 green。不是“运行不报错”；必须能_捕获这个特定 bug_。
- [ ] **Deterministic**：每次运行结论一致（flaky bug：按前文固定到较高复现率）。
- [ ] **Fast**：按秒计算，而非分钟。
- [ ] **Agent-runnable**：能无人值守运行；只有通过 `scripts/hitl-loop.template.sh` 才引入人工参与。

如果这个命令尚不存在，你就开始读代码形成理论，**停止：直接跳到假设正是本 skill 要防止的失败。** 没有 red-capable 命令，就没有阶段 2。

## Phase 2: Reproduce + minimise

运行循环，观察 bug 出现时变 red。

确认：

- [ ] 循环产生的是**用户**描述的失败模式，而不是碰巧在附近的另一个失败。错误 bug = 错误修复。
- [ ] 多次运行能复现（非确定性 bug 则具有足以调试的高复现率）。
- [ ] 已捕获确切症状（错误消息、错误输出、慢耗时），让后续阶段能验证修复确实针对它。

### Minimise

变 red 后，把复现缩到 **仍会变 red 的最小场景**。对输入、调用方、配置、数据和步骤**每次只删一个**，每删一次就重跑循环，只保留导致失败不可缺少的内容。

原因：最小复现缩小阶段 3 的假设空间（可疑因素更少），并在阶段 5 成为清晰的回归测试。

当 **每个剩余元素都不可缺少** 时，才算完成：删除其中任何一个，循环都会变 green。

完成复现**和**最小化前，不要继续。

## Phase 3: Hypothesise

测试任何假设之前，先生成 **3–5 个排序后的假设**。只生成一个假设，会锚定第一个看似合理的想法。

每个假设必须 **可证伪**：说明它作出的预测。

> 格式：“如果 <X> 是原因，那么 <改变 Y> 将使 bug 消失 / <改变 Z> 将使 bug 更严重。”

无法明确预测的假设只是直觉：丢弃或使其更精确。

**测试前向用户展示排序清单。** 用户常有领域知识，能立即改变排序（“我们刚部署了影响第 3 项的改动”），或知道已排除哪些假设。这是低成本但能省大量时间的检查点。不要等待阻塞；用户 AFK 时按自己的排序推进。

## Phase 4: Instrument

每个探针必须对应阶段 3 的一个明确预测。**每次只改变一个变量。**

工具优先级：

1. 环境支持时使用 **Debugger / REPL inspection**。一个断点胜过十条日志。
2. 在能区分假设的边界上添加 **targeted log**。
3. 永远不要“记录所有东西再 grep”。

**每条调试日志都加唯一前缀**，例如 `[DEBUG-a4f2]`。结束时一次 grep 就能清理。没标签的日志会残留，有标签的会被删掉。

**Perf branch。** 性能回退通常不适合用日志。改为先建立基线测量（计时 harness、`performance.now()`、profiler、query plan），再二分。先测量，后修复。

## Phase 5: Fix + regression test

在**修复之前**写回归测试，但前提是存在 **正确的 seam**。

正确 seam 上的测试应覆盖 bug 在调用点发生的 **真实模式**。若唯一可用 seam 太浅（bug 需要多个调用方，测试却只有一个；单元测试无法重现触发链），这样的回归测试会带来虚假信心。

**没有正确 seam，本身就是发现。** 记录它。代码库架构阻碍了对 bug 的约束验证。将此问题标给下一阶段。

如果存在正确 seam：

1. 将最小复现转为该 seam 上的失败测试。
2. 观察它失败。如果通过修改代码或 fixture 强制制造 red，在相信它之前，用 `diff` 对比干净副本，证明修改确实生效。
3. 应用修复。
4. 观察它通过。
5. 针对原始（未最小化）场景重新运行阶段 1 的反馈循环。

## Phase 6: Cleanup

声明完成前必须满足：

- [ ] 原始复现不再出现（重新运行阶段 1 循环）
- [ ] 回归测试通过（或已记录缺少 seam）
- [ ] 移除所有 `[DEBUG-...]` instrumentation（用 `grep` 搜索前缀）
- [ ] 删除临时 prototype（或移到明确标记的 debug 位置）
- [ ] 在 commit / PR 消息中说明最终正确的假设，让下一个调试者能学习
