# 来源与中文适配

本 skill 是面向中文技术文档的本地适配版。原文归档和忠实译文分别保留，便于核对来源。

## 上游

- 仓库：[cursor/plugins](https://github.com/cursor/plugins)。
- 路径：`pstack/skills/technical-writing/SKILL.md`。
- 固定提交：`4dd1d05818d19792e7cd6e818f1667f95f7e1dbe`。
- Git blob：`3e6d26109376cd66439c87ed48b4033df8d78a3a`。
- 原文 SHA-256：`61fe9c424a798ebf36ad94941f87be049cb8827bdf86d21474a0dde37b513c43`。
- 原文：[备份](../../../skills.bak/pstack/skills/technical-writing/SKILL.md)；中文逐句译文：[翻译归档](../../../skills-zh/pstack/skills/technical-writing/SKILL.md)。
- 许可证：MIT，上游版权声明保存在本包的 [LICENSE](../LICENSE)。
- 适配日期：2026-10-30。

## 适配范围

保留读者任务、文档用途、术语一致、操作条件、预期结果和消除歧义等原则。以中文说明重写入口，提供中文改写示例，并把新写、改写、只审阅的范围分别写清。

英语的冠词、时态、分词形式、英文词数阈值和标题大小写要求，替换为中文语序、主语省略、长定语、否定与数量范围、状态表达以及中英混排规则。标点、代码缩进和文档章节安排优先遵循项目约定。

文档类型用于安排内容，同页可按读者用途分区；是否拆页取决于篇幅与维护需要。中文审校步骤内置于正文，采用最小必要修改并核对语义，不依赖 `unslop` 或 `humanizer-zh` 的运行时安装。

通过入口 description 和 `agents/openai.yaml` 中的 `allow_implicit_invocation: false`，保留显式调用方式。使用 `$technical-writing` 启动；本 skill 负责文档写作，不接管调用方的开发、Git 或发布流程。

## 写作参考

- [Diátaxis](https://diataxis.fr/)：按读者需求区分教程、操作指南、参考资料和原理说明。设计评审稿的用途说明是本地补充。
- [humanizer-zh](https://github.com/op7418/Humanizer-zh/blob/f4518a8eab97b8bfebc66a89d34320a89bef6930/SKILL.md)：参考其中文语序、文体判断和保留事实与限定条件的审校原则。
- [中文文案排版指北](https://github.com/sparanoid/chinese-copywriting-guidelines/blob/master/README.zh-Hans.md)：参考中英混排、标点与名称大小写约定；具体格式以项目和领域规范为准。
