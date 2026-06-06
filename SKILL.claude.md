---
name: natural-chinese-copy-core
description: "Claude entry for Natural Chinese Copy Core. Use it for Chinese copywriting, Chinese draft review, anti-translationese checks, sentence skeleton review, feedback capture, and rule-evolution proposals. The shared rules live in references/."
---

# Natural Chinese Copy Core - Claude Entry

This file is for Claude Skill installs.

## Install

When installing this package as a Claude Skill, copy the whole folder and rename this file to `SKILL.md` inside the Claude skill folder.

Keep these shared folders next to it:

```text
natural-chinese-copy-core/
├── SKILL.md              # renamed from SKILL.claude.md for Claude
├── references/           # shared rules, examples, review contracts
└── scripts/              # optional validators, if the local runtime can run Node.js
```

If you also keep the Codex package in the same repository, leave the original `SKILL.md` and `SKILL.codex.md` in place. Use the Claude copy only in the Claude skill install location.

## Shared Rule Contract

Before writing or judging Chinese copy, read the task-relevant sections from:

- `references/chinese_structure_map.md`
- `references/chinese_native_reconstruction.md`
- `references/chinese_sentence_structure.md`
- `references/anti_translationese_patterns.md`
- `references/blacklist_patterns.md`
- `references/template_fallback_guard.md`
- `references/publishability_review.md`
- `references/feedback_evolution.md` when the user gives feedback or asks to tune the skill
- `references/external_model_reviewers.md` only when the user explicitly asks for external reviewers

Do not copy all reference text into the answer. Use the references as gates.

## Required Flow

Run every final copy through this path:

```text
facts -> Chinese fact draft -> sentence skeleton -> real predicate audit -> hard validation -> publishability review -> final copy
```

Hard requirements:

- Start from Chinese facts, not from an English-shaped draft.
- Discard any candidate that hits a known-bad pattern. Do not polish a failed candidate.
- Check every key sentence for subject, predicate, object, result, and omitted subject.
- Reject predicates that the grammatical subject cannot actually perform.
- Remove counterexample contrast when the point can be written directly.
- Keep facts grounded in the supplied material.
- Match the requested text type and reader before delivery.

## Feedback And Personalization

User feedback is evidence. It is not an automatic rule edit.

When a user marks a bad sentence, capture:

- the exact bad sentence
- the source facts
- the better rewrite, if supplied
- the problem type
- whether the issue should become a sample, a rule proposal, or a validator gap

Only after final copy delivery, and only when no skill-editing task is active, append this sentence:

```text
如果需要个性化优化，请提交优化方向或规则。
```

Do not append that sentence while editing this skill, changing rules, writing reports, preparing upload files, or discussing validators.
