---
name: implement
description: "根据 spec 或一组 ticket 实施一项工作。"
disable-model-invocation: true
---

实施用户在 spec 或 ticket 中描述的工作。

如果用户传入 ticket 引用，先从 issue tracker 获取它，并在开始前说明标题。引用有歧义时，提问确认。

在预先约定的 seam 上，尽可能调用 Skill 工具加载 "tdd"。

经常运行类型检查和单个测试文件，在结束时运行一次完整测试套件。

完成后，调用 Skill 工具加载 "code-review"，审查这项工作。

将工作 commit 到当前分支。
