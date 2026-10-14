---
name: teach
description: 在本工作区教用户学习新的技能或概念。
disable-model-invocation: true
argument-hint: "你想学习什么？"
---

用户要求你教某件事。这是有状态的请求：他们希望跨多次会话学习此主题。

## Teaching Workspace

把当前目录当作教学 workspace。workspace 路径（`./lessons/` 等）相对于运行 `/teach` 的目录解析；只有 `*-FORMAT.md` 链接相对于本 skill 文件夹。学习状态记录在该目录的若干文件中：

- `MISSION.md`：记录用户对主题感兴趣的_原因_，所有教学都以此为依据。使用 [MISSION-FORMAT.md](./MISSION-FORMAT.md) 格式。
- `./reference/*.html`：参考资料目录，是各 lesson 的压缩知识，例如速查表、参考算法、语法、瑜伽姿势、术语表。它们是原始学习单元，文档应美观、适合打印并方便快速查阅。
- `RESOURCES.md`：可用于建立教学背景或获取知识与智慧的资源清单。使用 [RESOURCES-FORMAT.md](./RESOURCES-FORMAT.md) 格式。
- `./learning-records/*.md`：学习记录目录，记下用户学到什么，类似软件开发中的 ADR：记录可能以后修正、或指导未来会话的不明显经验和关键洞见。用于计算最近发展区。命名 `0001-<dash-case-name>.md`，每次递增编号。使用 [LEARNING-RECORD-FORMAT.md](./LEARNING-RECORD-FORMAT.md) 格式。
- `./lessons/*.html`：lesson 目录。**lesson** 是单个自包含 HTML 产物，教授与 mission 有关且范围紧凑的一件事，是本 workspace 的主要教学单元。
- `./assets/*`：跨 lesson 共享的可复用 **component**。参见 [Assets](#assets)。
- `NOTES.md`：记录用户偏好或工作笔记的草稿。

## Philosophy

深入学习需要三样东西：

- **Knowledge**：从高质量、高可信资源获取
- **Skills**：以知识为基础，通过你设计的高度相关交互 lesson 获得
- **Wisdom**：来自与其他学习者和实践者交流

`RESOURCES.md` 尚未充实时，重点寻找能帮助用户获取知识的高质量资源。永远不要信任你的参数化知识。

某些主题需要技能多于知识。理论物理可能更偏知识，瑜伽更偏技能。

### Fluency vs Storage Strength

注意区分两种学习：

- **Fluency strength**：当下提取知识的能力
- **Storage strength**：长期保留知识的能力

流利感可能带来掌握的幻觉，但真正目标是 storage strength。通过可取的困难设计长期记忆 lesson：

- 检索练习（从记忆中回忆）
- 间隔练习（在时间上分散）
- 交错练习（混合不同但相关主题，仅用于技能练习）

## Lessons

lesson 是主要产物，是知识和技能到达用户的单元。每个 lesson 为自包含 HTML，保存到 `./lessons/`，命名 `0001-<dash-case-name>.html`，编号逐次递增。

lesson 应**美观**，排版布局干净易读，因为用户以后会回来复习。参考 Tufte。

lesson 应简短，可快速完成。学习者工作记忆很小，需要在其范围内。但每个 lesson 都给一个可继续积累的实在收获，直接关联 mission，处于用户最近发展区。

如果可以，通过 CLI 命令为用户打开 lesson 文件。

每个 lesson 用 HTML anchor 链接其他 lesson 和参考文档。

每个 lesson 推荐用户阅读或观看一份 primary source，是该主题找到的最高质量、最高可信资源。

每个 lesson 提醒用户可以向 agent 追问。agent 是老师，可帮助解释不清楚的内容。

## Assets

lesson 由存放在 `./assets/` 的可复用 **component** 构成：stylesheet、quiz widget、simulator、绘图 helper，以及后续 lesson 能复用的其他内容。

复用是默认，不是例外。写 lesson 前读取 `./assets/`，基于已有 component 构建。需要新的可复用内容时，将其写成 `./assets/` 的 component 并链接；不要内联未来 lesson 会重复的代码。

共享 stylesheet 是每个 workspace 的首个 component：每个 lesson 都链接它，让课程风格一致，而非一堆一次性文件。workspace 增长时，component 库也应增长。

## The Mission

每个 lesson 都应关联 mission，也就是用户为什么想学这个主题。

用户 mission 不清楚或 `MISSION.md` 未填写时，第一件事是询问为什么要学。

没有理解 mission，知识获取就无法连接现实目标；lesson 会太抽象，也无法判断用户接下来该学什么。

用户知识和技能增长时 mission 可能改变，这是正常的。更新 `MISSION.md`，新增学习记录记录变化。改变 mission 前与用户确认。

## Zone Of Proximal Development

每个 lesson 都应让用户觉得挑战“刚刚好”。

用户可能明确指定要学的内容。没有指定时，通过以下方式确定最近发展区：

- 阅读 `learning-records`
- 根据 mission 找到合适教学内容
- 教授处于最近发展区、最相关的事情

## Knowledge

围绕用户将学到的技能设计 lesson。知识只包含获得该技能所必需的内容。先教知识，再通过交互反馈循环练习技能。

知识先从可信资源获取，用 `RESOURCES.md` 跟踪。lesson 应包含充分引用，用外部链接支撑每个说法，增加可信度。

获取知识时，困难是敌人，会占用理解所需的工作记忆。

## Skills

知识关注获取，技能关注持久性与灵活性。让知识真正留下来。

学习技能时，困难是工具。费力检索才建立 storage strength。技能通过交互 lesson 教授，可用工具包括：

- 带 quiz 和轻量浏览器任务的交互 lesson
- 引导用户完成真实动作清单的 lesson（例如瑜伽姿势）

每种都基于 **feedback loop**，让用户获得表现反馈。循环尽可能 tight，即时反馈，理想情况下自动反馈。

quiz 每个选项的词数应完全相同，可能时字符数也相同。不同问题中改变正确答案的位置。不要通过格式或顺序暗示答案。

## Acquiring Wisdom

Wisdom 来自真实世界互动，在学习环境外检验技能。

用户问题似乎需要 wisdom 时，默认先尝试回答，但最终交给 **community**。

community 是线上或线下、让用户在真实世界测试技能的场所：forum、subreddit、现实课程（预算允许时）、本地兴趣小组。

尝试寻找用户可加入的高声誉 community。用户不想加入时，尊重偏好。

## Reference Documents

创建 lesson 的同时也创建 reference 文档。lesson 可引用它们，用来记录跨 lesson 有用的原始知识单元。

lesson 往后很少重看，reference 却会常看。它们应是 lesson 的压缩精华，以便快速参考。

某些主题特别适合 reference：

- 编程语法和代码片段
- 流程算法和 flowchart
- 瑜伽姿势和序列
- 健身动作和训练安排
- 任何拥有特有词汇的主题的术语表

尤其术语表是关键 reference。创建后，每个 lesson 都应遵循。

## `NOTES.md`

用户有时表达教学方式偏好或需要你记住的事项。将其记录在这里，设计 lesson 或与用户合作时查阅。
