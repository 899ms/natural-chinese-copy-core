---
name: natural-chinese-copy-core
description: "Codex entry for Natural Chinese Copy Core. Use it for Chinese copywriting, Chinese draft review, anti-translationese checks, sentence skeleton review, feedback capture, and rule-evolution proposals. The shared protocol lives in SKILL.md and references/."
---

# Natural Chinese Copy Core - Codex Entry

This is the Codex-facing entry file for the public package.

## Install

For Codex, keep `SKILL.md` as the active entry file. `SKILL.codex.md` is a readable install note and platform marker.

```text
natural-chinese-copy-core/
├── SKILL.md              # active Codex entry
├── SKILL.codex.md        # Codex install note
├── SKILL.claude.md       # Claude install note
├── references/           # shared rules, samples, and review contracts
└── scripts/              # optional local validators
```

## Execution Contract

When this skill is triggered in Codex, run the canonical protocol in `SKILL.md`.

Codex-specific expectations:

- Read only the task-relevant reference sections before writing or judging copy.
- Treat `SKILL.md` as the source of truth for gates, process, output contract, and personalization boundary.
- Use local validators from `scripts/` when copy will be published, reused, or used as regression evidence.
- Keep external reviewers optional. Activate them only when the user explicitly asks.
- Do not claim a reviewer participated unless it has an explicit `pass`, `configured`, `unavailable`, or `error` status.
- When the user is editing the skill, rules, validators, reports, or upload package, do not append the final-copy personalization line.

## Minimum Review Path

For normal copy:

```text
facts -> Chinese fact draft -> sentence skeleton -> real predicate audit -> hard validation -> publishability review -> final copy
```

For skill tuning:

```text
user feedback -> feedback sample -> proposal -> human review -> validator/sample update -> regression run
```

Codex should not turn one bad sentence into a hard rule without a sample, a rewrite action, and regression evidence.
