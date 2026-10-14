# Writing Agent Briefs

agent brief 是 GitHub issue 或 PR 转到 `ready-for-agent` 时发布的结构化 comment，是 AFK agent 实施时依据的权威规格。原始正文和讨论只是背景，agent brief 才是契约。

brief 说明 **agent 应该做什么**，覆盖两个入口：issue 是从无到有构建改动；PR 是对*已有 diff*还需做什么，如完成、补缺口、回应 review。两者原则相同，下方 PR 示例展示差别。

## Principles

### Durability over precision

issue 可能在 `ready-for-agent` 停留几天或几周，代码库期间会变化。brief 应在文件重命名、移动或重构后仍有用。

- **应该**描述 interface、type 和行为契约
- **应该**命名 agent 需查找或修改的具体 type、函数签名或配置形状
- **不要**引用文件路径，它们会过时
- **不要**引用行号
- **不要**假定当前 implementation 结构保持不变

### Behavioral, not procedural

描述系统应**做什么**，而非**如何实现**。agent 会重新探索代码库，并自行作出 implementation 决策。

- **好：** “`SkillConfig` 类型应该接受可选的 `schedule` 字段，类型为 `CronExpression`。”
- **差：** “打开 src/types/skill.ts，在第 42 行添加 schedule 字段。”
- **好：** “用户不带参数运行 `/triage` 时，应看到需要关注的 issue 概览。”
- **差：** “在 main handler 函数里加一个 switch。”

### Complete acceptance criteria

agent 需要知道何时完成。每份 brief 必须有具体、可测试的验收标准，每项可独立验证。

- **好：** “运行 `gh issue list --label needs-triage` 返回已经初步分类的 issue。”
- **差：** “Triage 应该正常工作。”

### Explicit scope boundaries

说明 out of scope，避免 agent 过度打磨或假设相邻功能。

## Template

```markdown
## Agent Brief

**Category:** bug / enhancement
**Summary:** one-line description of what needs to happen

**Current behavior:**
Describe what happens now. For bugs, this is the broken behavior.
For enhancements, this is the status quo the feature builds on.

**Desired behavior:**
Describe what should happen after the agent's work is complete.
Be specific about edge cases and error conditions.

**Key interfaces:**
- `TypeName`: what needs to change and why
- `functionName()` return type: what it currently returns vs what it should return
- Config shape: any new configuration options needed

**Acceptance criteria:**
- [ ] Specific, testable criterion 1
- [ ] Specific, testable criterion 2
- [ ] Specific, testable criterion 3

**Out of scope:**
- Thing that should NOT be changed or addressed in this issue
- Adjacent feature that might seem related but is separate
```

## Examples

### Good agent brief (bug)

```markdown
## Agent Brief

**Category:** bug
**Summary:** Skill description truncation drops mid-word, producing broken output

**Current behavior:**
When a skill description exceeds 1024 characters, it is truncated at exactly
1024 characters regardless of word boundaries. This produces descriptions
that end mid-word (e.g. "Use when the user wants to confi").

**Desired behavior:**
Truncation should break at the last word boundary before 1024 characters
and append "..." to indicate truncation.

**Key interfaces:**
- The `SkillMetadata` type's `description` field: no type change needed,
  but the validation/processing logic that populates it needs to respect
  word boundaries
- Any function that reads SKILL.md frontmatter and extracts the description

**Acceptance criteria:**
- [ ] Descriptions under 1024 chars are unchanged
- [ ] Descriptions over 1024 chars are truncated at the last word boundary
      before 1024 chars
- [ ] Truncated descriptions end with "..."
- [ ] The total length including "..." does not exceed 1024 chars

**Out of scope:**
- Changing the 1024 char limit itself
- Multi-line description support
```

### Good agent brief (enhancement)

```markdown
## Agent Brief

**Category:** enhancement
**Summary:** Add `.out-of-scope/` directory support for tracking rejected feature requests

**Current behavior:**
When a feature request is rejected, the issue is closed with a `wontfix` label
and a comment. There is no persistent record of the decision or reasoning.
Future similar requests require the maintainer to recall or search for the
prior discussion.

**Desired behavior:**
Rejected feature requests should be documented in `.out-of-scope/<concept>.md`
files that capture the decision, reasoning, and links to all issues that
requested the feature. When triaging new issues, these files should be
checked for matches.

**Key interfaces:**
- Markdown file format in `.out-of-scope/`: each file should have a
  `# Concept Name` heading, a `**Decision:**` line, a `**Reason:**` line,
  and a `**Prior requests:**` list with issue links
- The triage workflow should read all `.out-of-scope/*.md` files early
  and match incoming issues against them by concept similarity

**Acceptance criteria:**
- [ ] Closing a feature as wontfix creates/updates a file in `.out-of-scope/`
- [ ] The file includes the decision, reasoning, and link to the closed issue
- [ ] If a matching `.out-of-scope/` file already exists, the new issue is
      appended to its "Prior requests" list rather than creating a duplicate
- [ ] During triage, existing `.out-of-scope/` files are checked and surfaced
      when a new issue matches a prior rejection

**Out of scope:**
- Automated matching (human confirms the match)
- Reopening previously rejected features
- Bug reports (only enhancement rejections go to `.out-of-scope/`)
```

### Good agent brief (PR)

对 PR，“Current behavior”描述 diff 的状态，brief 要求 agent 完成或修复它，而不是从零构建。

```markdown
## Agent Brief

**Category:** enhancement
**Summary:** Finish the contributor's `--json` output flag for `triage list`

**Current behavior:**
The PR adds a `--json` flag that serializes the issue list to JSON. The happy
path works and the diff matches the project's command structure. Two gaps
remain: errors are still printed as human text (not JSON), and the new flag has
no test coverage.

**Desired behavior:**
With `--json`, all output (including errors) is well-formed JSON on stdout,
and the command's exit codes are unchanged. The existing human-readable output
is untouched when the flag is absent.

**Key interfaces:**
- The command's error path should emit `{ "error": string }` under `--json`
  instead of the plain-text error
- Reuse the existing serializer the PR already added; don't introduce a second

**Acceptance criteria:**
- [ ] `triage list --json` emits valid JSON for both success and error cases
- [ ] Exit codes match the non-JSON command
- [ ] A test covers the `--json` success output and one error case
- [ ] Default (non-JSON) output is byte-for-byte unchanged

**Out of scope:**
- Adding `--json` to any other command
- Changing the JSON shape of the success payload the PR already defined
```

### Bad agent brief

```markdown
## Agent Brief

**Summary:** Fix the triage bug

**What to do:**
The triage thing is broken. Look at the main file and fix it.
The function around line 150 has the issue.

**Files to change:**
- src/triage/handler.ts (line 150)
- src/types.ts (line 42)
```

这是坏例子，因为：
- 没有 category
- 描述含糊（“triage 那东西坏了”）
- 引用会过时的文件路径和行号
- 没有验收标准
- 没有 scope 边界
- 没有说明当前行为和期望行为
