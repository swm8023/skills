# MISSION.md Format

`MISSION.md` 放在 workspace 根目录，记录用户学习本主题的_原因_。每个教学决策（接下来教什么、展示哪些资源、设计什么练习）都应能追溯到它。

## Template

```md
# Mission: {Topic}

## Why
{1-3 sentences. The concrete real-world goal the user is chasing. What changes in their life or work when they have this skill? Avoid abstract framings like "to understand X"; push for the underlying outcome.}

## Success looks like
- {A specific, observable thing the user will be able to do}
- {Another specific thing}
- {…}

## Constraints
- {Time, budget, prior commitments, learning preferences, anything that bounds the approach}

## Out of scope
- {Adjacent topics the user explicitly does not want to chase right now, protecting the zone of proximal development}
```

## Rules

- **每个 workspace 一个 mission。** 想学两件无关事情就用两个 workspace。
- **具体优于抽象。** “10 月前跑完半马”好于“更健康”；“给团队发布 Rust CLI”好于“学 Rust”。
- **挑战含糊。** 用户说不清原因时，先访谈再写。糟糕的 mission 比没有更坏。
- **现实变化时修订。** mission 会改变。用户目标变化时更新本文件，不让旧目标指导以后会话。
- **保持简短。** `MISSION.md` 超过一屏时，它就不再是指南针，而变成了 plan。
