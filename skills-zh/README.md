# Skill 中文参考库

按来源保存中文参考资料，与 `../skills.bak/` 的来源目录对应。
项目运行时 skill 位于 `../skills/`。

| 来源 | 中文资料 | 翻译记录 | 范围 |
| --- | --- | --- | --- |
| Matt Pocock | [mattpocock/](mattpocock/README.md) | [记录](mattpocock.TRANSLATION.json) | 现有完整副本中的全部 38 个 skill |
| Superpowers | [superpowers/](superpowers/README.md) | [记录](superpowers.TRANSLATION.json) | 原有 13 个 skill 包的译文，仅移动目录 |
| Caveman | [caveman/](caveman/README.md) | [记录](caveman.TRANSLATION.json) | 原有历史译文，仅移动目录 |
| Softaworks Agent Toolkit | [softaworks/](softaworks/README.md) | [记录](softaworks.TRANSLATION.json) | 四个完整 skill 包，23 份 Markdown |
| pstack（Cursor plugins） | [pstack/](pstack/README.md) | [记录](pstack.TRANSLATION.json) | technical-writing 完整包，逐句翻译后按 humanizer-zh 润色 |

## 目录和历史资料

各来源采用 `<source>/skills/<skill-name>/` 层次，保留配套资料及内部相对路径。
Superpowers 原有平铺目录现统一放在 `superpowers/skills/`；Caveman 放在
`caveman/skills/caveman/`。原文件逐字节保留，未更新版本或重译。
这两组历史资料的上游提交未记录，清单明确保存已知本地基线和旧路径。

`legacy-mattpocock-2026-06/` 保留以前平铺的 13 个旧 skill 中文版本，仅作历史参考。
新版 Matt Pocock 材料及其清单没有变动，仍对应上游
`49dd158d1076134a641b33efb035946536778336`，2026-10-14 核对。

## 翻译范围

Matt Pocock 的 `skills/` 内全部 66 份 Markdown，以及根目录 `README.md`、
`GLOSSARY.md`、`SCOPE.md` 已按原有约定逐行翻译。英文标题、anchor、代码、路径、
调用策略和其余上游维护文件的保留规则，以其现有翻译记录为准。

Softaworks 对应上游 `3027f20f3181758385a1bb8c022d4041dfb4de84`，2026-10-26 核对。
选取 `skill-judge`、`writing-clearly-and-concisely`、`lesson-learned`、
`mermaid-diagrams`，包含正文、README 和全部配套参考文件，共 23 份 Markdown。
解释、操作指引、自然语言 description 和 Markdown 模板逐句译为中文，
专业术语保留 English，完整保留原句含义、条件、量词与语气。保持原行、空行、
标题与 anchor、段落、列表和表格结构，不概括、删减或添加原文没有的说明。
真实代码、命令、行内代码、链接目标、footnote ID、调用策略及参考文献条目保留。
普通证据引文也逐句翻译；用于英语语法与文体辨析的英文原句保留，并在同一行提供
对应中文，不增加段落、列表项或表格行。LICENSE 原样保留。

这些文件均为参考资料；本地正在使用的定制 `skills/mermaid-diagrams/` 独立保留。

pstack 对应 Cursor plugins 提交 `4dd1d05818d19792e7cd6e818f1667f95f7e1dbe`，
2026-10-30 核对。选取完整 `technical-writing` 包及 pstack LICENSE。
106 行正文按原文逐句翻译，再按 `humanizer-zh` 规则润色中文措辞；
标题、行结构、英语辨析原句、技术示例和调用策略保留。
原有 `unslop` 引用作为配套依赖记录，LICENSE 原样保留。
