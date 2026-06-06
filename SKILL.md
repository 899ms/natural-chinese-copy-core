---
name: natural-chinese-copy-core
description: "Use this whenever the user uses the stable Chinese trigger phrase 中文才是最屌的， followed by a request, for example 中文才是最屌的，帮我写个稿子. Also use whenever the task involves 中文文案, 中文写作, 中文稿, 稿子, 稿件, 写文案, 写稿子, 写几篇, 写一版, 改稿, 改文案, 润色文案, 审稿, 评稿, 即评, 推文, 帖子, 社媒文案, 中文介绍, or requests like 根据资料/链接/项目/README/GitHub repo/素材 帮我写个文案/稿子/介绍/推荐/摘要. Also use when Chinese copy must avoid AI味, 翻译腔, 英文语感, 模板感, fake conversational tone, or English-shaped sentence logic, or when users rate copy, 标出坏句, 做坏句反馈, mark bad sentences, compare draft quality, or want feedback saved as samples and rule-evolution proposals. It provides Chinese-first fact restatement, sentence-structure critique, register selection, colloquial sentence shaping, anti-translationese checks, batch repetition review, feedback capture, and research-backed rule distillation. Other skills should call this core instead of copying long Chinese writing rules. It does not gather sources, generate images, publish content, own product-specific facts, or automatically turn ratings into hard rules."
---

# Natural Chinese Copy Core

This skill is the shared Chinese writing core. It turns facts into natural Chinese copy by rebuilding the sentence logic in Chinese before any polish happens.

## Rule Ownership

This skill owns:

- 中文句法顺序
- 中文结构总地图
- 主语 / 谓语 / 宾语 / 定语 / 状语 / 补语 / 结果检查
- 中文体态和状态变化标记
- 句子后台结构标注和显性结构标注稿
- prompt-first generation and known-bad-forbidden candidate generation
- 中文事实稿流程
- 事实和数据来源约束
- 中文语体选择
- 正式 / 平实 / 日常 / 熟人聊天结构
- 口语省略、短句、停顿和语气边界
- 翻译腔结构识别
- AI 腔和假口语识别
- repo / 产品名 / 项目名在中文句子里的位置规则
- 工具 / 开源项目 / GitHub repo / README 项目首句定义规则
- 批次重复度审查
- 好坏例沉淀
- 用户反馈采集、样本沉淀和规则进化提案流程

Automation prompts and product-specific skills should not copy long writing rules. They should call this skill and keep their own prompt focused on facts, workflow, and output destination.

## Boundaries

This skill does not:

- gather sources
- verify source freshness
- generate images
- publish content
- decide product strategy
- own workflow-specific fields beyond the reusable copy contract
- turn user ratings or a single bad sentence into hard rules without human review and regression tests

If a downstream workflow needs stricter fields, keep those fields in that workflow and reuse this skill only for the Chinese copy layer.

## Required References

Before writing or judging copy, read the task-relevant sections from:

- `references/chinese_structure_map.md`
- `references/chinese_native_reconstruction.md`
- `references/chinese_sentence_structure.md`
- `references/register_selection.md`
- `references/chinese_register_modes.md`
- `references/colloquial_sentence_structure.md`
- `references/natural_usage_structure.md`
- `references/conversation_move_cases.jsonl`
- `references/platform_registers.md`
- `references/platform_sample_cases.jsonl`
- `references/internet_slang_lifecycle.md`
- `references/slang_freshness_policy.md`
- `references/source_quality_policy.md`
- `references/slang_observations_2026.jsonl`
- `references/anti_translationese_patterns.md`
- `references/blacklist_patterns.md`
- `references/template_fallback_guard.md`
- `references/chinese_tool_copy_examples.md`
- `references/technical_project_copy.md`
- `references/technical_project_cases.jsonl`
- `references/publishability_review.md`
- `references/non_tool_copy_cases.jsonl`
- `references/self_evolution_cases.jsonl`
- `references/feedback_evolution.md`
- `references/feedback_sample_cases.jsonl`
- `references/external_model_reviewers.md` only when the user explicitly asks an external reviewer or multi-model discussion to participate
- `references/spoken_copy_examples.md`
- `references/batch_repetition_review.md`
- `references/batch_sample_cases.jsonl`

When improving this skill or adding rules, also read:

- `references/rule_language_guard.md`
- `references/rule_distillation_method.md`
- `references/research_sources.md`
- `references/copy_eval_rubric.md`

Read only the reference sections needed for the task. Keep `SKILL.md` as the flow controller and keep detailed rules, evidence, and examples in `references/`.

## Reference Role

Do not dump raw papers or long style notes into `SKILL.md`.

- `SKILL.md` contains only the reusable execution protocol.
- `references/` contains distilled rules, evidence summaries, examples, and eval cases.
- Raw source material becomes useful only after it is converted into an observable sentence problem and a rewrite action.
- Promote a rule into `SKILL.md` only when every normal invocation needs it.

## Hard Gate Contract

Every generation link is a hard gate, not a writing hint. A copy item can move to the next link only after the current link has an explicit `pass` judgment.

- Known-bad generation gate: every hard rule in `blacklist_patterns.md`, `anti_translationese_patterns.md`, `template_fallback_guard.md`, and `validate_chinese_copy.mjs` is a generation ban. A candidate that matches a known-bad rule is invalid by definition; discard it and rebuild from facts instead of polishing it.
- Prompt contract gate: fail if the selected register, native-reconstruction profile, information order, sentence skeleton requirements, project-name position rule, forbidden skeletons, or annotation requirement is missing.
- Tool/project definition opening gate: for tool, open-source project, GitHub repo, or README introductions, fail if the first sentence does not start with `project name + 是 + measure word + type / purpose / ownership`.
- Chinese fact draft gate: fail if the draft keeps English source order, contains placeholder copy, or cannot answer reader, situation, action, object, result, saved trouble, and boundary.
- Sentence skeleton gate: fail if any key sentence has no recoverable subject, no concrete predicate, no concrete object or result, or a grammatical subject that cannot perform the predicate.
- Predicate real-action gate: fail if any key predicate does not match what the grammatical subject can actually do in Chinese. Do not use fake actions, translated verbs, empty movement verbs, vague improvement verbs, or container verbs to fill a sentence slot.
- Real-verb gate: fail if the predicate is only a translated motion, abstract push, fake improvement verb, subject-predicate trace mismatch, or container relation instead of a real Chinese action; every key verb must answer who does what to which object and with what result.
- Counterexample contrast gate: fail if the sentence first invents a negative foil, old judgment, or wrong direction only to support the real point. If the point can be written as a fact, action, result, or boundary, write it directly and remove the counterexample.
- Hard blacklist gate: fail on every hard rule from `blacklist_patterns.md` and `validate_chinese_copy.mjs`, including bare contrast setup such as `不只是...`.
- Front-loaded comma gate: fail if a condition, time phrase, or reader phrase is placed before the main action and then split off with a comma, such as `刚补 Agent 基础的人，先...` or `下载模型前，先...`.
- Meta and subject-predicate gate: fail if internal critique text leaks into final copy, or if a subject such as a course, document, repo, or product cannot perform the predicate used in the sentence.
- Fact grounding gate: fail if dates, numbers, versions, named actors, locations, actions, or event consequences are not present in the source material.
- Register gate: fail if the copy uses a relationship distance that does not match the reader, channel, risk, or context.
- Publishability gate: fail if the copy only passes machine validation but is not ready for the requested channel, text type, reader, or publishing context.
- Type fidelity gate: fail if the user asked for a non-tool copy type but the output is still shaped like a tool intro, rule explanation, validator report, or internal review note.
- Native naturalness gate: fail if a concrete sentence-level native-speaker review identifies a deterministic unnatural expression for the requested text type, including abstract decision frames, risky `不稀奇` contrast setups, hard-stuffed verbs, ambiguous subtitle compression, missing-preposition status changes, self-centered comparative judgments such as `我更在意 / 我更关心`, `比 A 更 B` benefit frames, unnatural abbreviations such as `日会`, actorless `页面能跑，只说明...。先看...` frames, object-only `工作内容是...页面 / 后台 / 系统`, object-list responsibility suffixes such as `你会负责活动报名页、候补名单页面和运营后台的页面开发`, internal meeting words such as `走查`, or missing result aspect markers such as `提交成功后能看到报名状态`; keep boundary calls and fact-changing suggestions out of hard rules.
- External reviewer availability gate: when the user asks external reviewers to participate, each participant must have an explicit `pass`, `configured`, `unavailable`, or `error` status. Do not claim that an unavailable provider participated, and do not turn a model comment into a hard rule before user confirmation and regression samples.
- Candidate discard gate: if any internal candidate hits a known-bad rule, do not treat it as a draft to fix. Throw it away, tighten the prompt contract, and generate a new candidate from the Chinese fact draft.
- Handoff gate: final delivery is allowed only when all previous gates pass. Until then, the item remains `draft` or `fail`.
- Feedback evolution gate: user feedback is training evidence, not an automatic rule edit. A bad sentence can become a rule only after it is captured with source facts, classified, turned into a proposal, and validated against old pass samples.
- Recurring issue coverage gate: when the user says a problem is an old repeated issue, it is not considered fixed until `legacy_issue_registry.jsonl` records the issue and the required validator / feedback / publishability / self-evolution evidence is in place.
- Self-evolution coverage gate: when this skill is tuned after copy failures, fail the tuning pass if the self-evolution lab does not cover multiple real text types, or if the required tail rounds are not `hard 0 / warn 0 / publishability 0`.

## Process

For each item, run every step as a hard gate:

1. Read the facts only.
2. Ignore placeholder copy.
3. Throw away English source sentence order.
4. Choose a register: `auto`, `formal`, `plain`, `casual`, or `close-chat`.
5. Identify reader, situation, action, object, result, and saved trouble.
6. Select the native-reconstruction profile: text type, reader, purpose, tone, rewrite strength, and whether the original structure must be preserved.
7. Compile the known-bad generation ban list from hard references and validators. Treat every known-bad pattern as outside the candidate space.
8. Build a generation prompt contract before drafting. It must name the selected register, native-reconstruction profile, information order, sentence skeleton requirements, project-name position rule, tool/project definition opening requirement when relevant, forbidden skeletons, known-bad generation bans, and visible annotation requirement if the output is long-form.
9. Write a neutral Chinese fact draft under that prompt contract.
10. Rebuild the information order as scene / problem / action / result / boundary when the source order is English-shaped.
11. Build a hidden sentence skeleton for every key sentence: subject, predicate, object, attribute, adverbial, complement, result, and omitted subject if any.
12. Check the fact draft with Chinese sentence structure rules.
13. For tool, open-source project, GitHub repo, or README introductions, make the first sentence a project-name definition sentence with a measure word such as `一个`, `一款`, `一套`, `一种`, `一份`, or `一组`.
14. Check Chinese aspect and state-change markers for release, launch, integration, availability, completion, and status-change facts. Add `了` only where the Chinese sentence needs completion or changed-state marking.
15. Generate only candidates that stay inside the prompt contract and outside the known-bad ban list.
16. Discard any candidate that hits a known-bad rule, then regenerate from the Chinese fact draft with a tighter prompt contract.
17. Rebuild the sentence skeleton for the surviving candidate and discard any sentence whose grammar role does not match its real actor.
18. Run predicate real-action audit: every key predicate must match the real action or state change of its subject. Reject fake action fillers such as `往前推了一步`, `托起来`, `顺一些`, `往前追`, `追上下文`, and `放到一条调用里接着做`.
19. Run native-reconstruction review: nominalization, abstract outcome, template connector, English-shaped audience frame, English heavy-light metaphor, English conditional adverbial opening, abstract decision frame, risky `不稀奇` contrast setup, hard-stuffed verb, contrast skeleton, counterexample contrast, and register fit.
20. Run fact grounding review: dates, times, money amounts, percentages, versions, file sizes, named actors, locations, release scopes, and concrete event details must appear in the source material or be removed.
21. Run register fit review.
22. Run anti-translationese review.
23. Run blacklist review.
24. Run template fallback guard.
25. Run batch repetition review if there are multiple items.
26. Run hard validation. Use `validate_chinese_copy.mjs --require-tool-project-opening` for tool, open-source project, GitHub repo, or README introductions; otherwise use the validator without that flag. If no validator exists, run the same hard checklist manually.
27. If hard validation catches a known-bad pattern, mark the candidate invalid and rebuild from facts. Do not deliver the failed candidate or describe it as reviewed.
28. Run publishability review from `references/publishability_review.md`. This gate is manual and mandatory: ask whether the copy can be directly published for the requested type and channel. Validator pass is only a prerequisite.
29. Before final delivery, run a final predicate real-action check again. This is a重点核查 item: each subject must be able to perform its predicate, and every predicate must name a real action, state change, or clear relation.
30. If publishability review fails, discard the candidate, record the failure type, and rebuild from the selected text type. Do not only rewrite the visible copy without updating samples or rules when the failure is new.
31. For reports, introductions, README copy, GUIDE copy, tool descriptions, or any long-form output, attach a visible structure annotation draft after the final copy.
32. Hand off only copy that passed every gate without known-bad drift and with `publishabilityReview.status = "pass"`.
33. If the user scores the copy or marks a bad sentence, use the feedback evolution flow. Capture the exact bad sentence, the source facts, the problem type, and any better rewrite. Do not edit rules directly from the feedback record.
34. When tuning this skill, run the self-evolution lab with a required stable-zero tail. Do not mark the tuning as reviewed until the required final rounds all pass with no validator hard issue, no validator warning, and no publishability issue.
35. When the user asks for multi-model review, run the external reviewer flow after local hard validation. Treat configured external models as review inputs only; record unavailable/error states explicitly and show new issues to the user before changing rules. Every external issue must be adjudicated as `accepted`, `misjudgment`, `sample-only`, `hard-rule-candidate`, or `boundary` before it can affect copy, samples, or validators.

Never generate a mechanical English-shaped draft first and then polish it into Chinese. The first real draft should already be a Chinese proposition.

## Register Contract

Use one of these registers:

- `auto`: infer from task, channel, audience, and examples.
- `formal`: reports, announcements, professional documents, public-facing institutional copy.
- `plain`: default normal Chinese; clear, direct, not stiff.
- `casual`: social posts, group messages, friendly recommendations, light product notes.
- `close-chat`: familiar chat; short, elliptical, direct, and relationship-dependent.

When the user names a tone, obey it. When the task gives no clue, use `plain`. Do not use `formal` as the default.

口语化不是把正式句子缩短，也不是加网络口头禅。必须先重建自然口语里的省略、短句、直接动词、共享语境和关系距离。

## Chinese Fact Draft

Before final copy, answer these questions in Chinese:

- 谁会遇到这个问题？
- 他现在想做什么？
- 这个工具 / 方案 / 材料帮他做哪一步？
- 它省掉什么麻烦？
- 为什么现在要打开这份材料？
- 谁不用急着看？

The fact draft can be plain and short. It must read like normal Chinese before it is polished.

## Fact Grounding

Concrete facts must survive rewriting, but new facts must not be invented.

Hard fail if the output adds a source-absent:

- date, time, maintenance window, deadline, or schedule
- money amount, percentage, ranking, user count, market figure, or performance number
- version number, file size, platform support claim, release scope, or compatibility claim
- person, company, institution, location, action, decision, patch detail, or event consequence

If the source is incomplete, write the boundary instead of filling the gap.

## Prompt-First Generation Pipeline

Use the rules twice, in this order:

1. Prompt contract before generation: tell the model which Chinese skeleton to use, where the repo or product name may appear, which sentence shapes are outside the candidate space, and whether a visible structure annotation is required.
2. Candidate generation under constraints: generate from the Chinese fact draft, not from an English-shaped draft or a failed candidate.
3. Candidate rejection after generation: run the validator or manual hard checklist against the internal candidate. If it hits a known-bad rule, discard it and regenerate from facts with a tighter prompt contract.
4. Final pass: re-run the same validator or hard checklist on the surviving candidate. If it still fails, report a rule execution failure or a rule coverage gap instead of polishing around it.
5. Publishability pass: run the manual publishability checklist. If it fails, the validator result remains useful evidence but the copy is still not reviewed.

The hard-rule filter is not a cleanup tool. It is a guardrail that proves the generator stayed inside the allowed candidate space. The prompt contract is the primary generation constraint.

If any pipeline link is skipped, the item cannot be marked as reviewed. Use `copyCritique.status = "draft"` when the text is unfinished and `copyCritique.status = "fail"` when a gate has failed.

## Critique Loop

Generate candidates until the copy passes these checks:

- The selected register matches the audience, channel, and relationship.
- For tool, open-source project, GitHub repo, or README introductions, the first key sentence starts with `project name + 是 + measure word + type / purpose / ownership`.
- For other text types, the first key sentence starts from a natural Chinese topic, scene, reader, or action.
- The key sentence has a visible or inherited subject.
- The verb is a normal Chinese action verb.
- The object or result is concrete.
- Every key sentence has a checked skeleton: subject, predicate, object, attribute, adverbial, complement, and result.
- If the subject is omitted, the omitted subject must be recoverable from the previous sentence or shared scene.
- The grammatical subject must be able to perform the predicate in real Chinese.
- Predicate real-action audit is mandatory before final delivery. The copy fails if a predicate is only filling space, translating an English verb, or pretending that an object can perform an action it cannot actually perform.
- The predicate must be a real action verb or a valid state-change verb. Do not pass fake verbs such as `往前推了一步`, `托起来`, `顺一些`, `往前追`, `往回追`, `追上下文`, or container relations such as `放到一条调用里接着做`.
- A phrase such as `BilldDesk 先看远控流程` fails because the omitted actor should be `我们`, while `BilldDesk` is only an attribute inside `BilldDesk 的远控流程`.
- A phrase such as `12 节课按顺序往下走` fails because lessons cannot perform the walking predicate; rewrite it as course arrangement or reader learning action.
- Final copy does not include internal review language such as why a word was used, which rule fired, or what the sentence is trying to say.
- The copy does not use `要判断 / 决定 / 评估 X，还得 / 需要看 Y`. Put the concrete checks first, then place the decision or result at the end.
- The copy does not use `不稀奇` as a launcher for `真正 / 关键 / 决定` style contrast. `不稀奇` can stay only when the following sentence continues with concrete action, not abstract judgment.
- The copy does not use hard-stuffed action relations such as `归好`, `发到短信里`, `这份工作会做...`, `研发给...接口`, or `保存后进入...设置，打开...`.
- Video subtitles do not use ambiguous compressed phrases such as `候补又对错了`; write the visible state, such as `候补名单又乱了` or `候补名单又对不上了`.
- Notices and push messages do not use compressed status phrases such as `已改线上`; write the missing relation, such as `改为线上`.
- The repo / product / project name is not forced into the subject position.
- Long modifiers are split into shorter sentences.
- English-style nominalization is replaced with concrete action when possible.
- Abstract nouns do not replace concrete actions.
- Casual copy uses real spoken structure, not fake catchphrases.
- The copy does not contain hard blacklist phrases from `blacklist_patterns.md`.
- The copy does not fall back to canned recommendation openings or contrast frames.
- The copy does not depend on English product-page skeletons.
- The copy does not split front-loaded condition, time, or reader phrases from the main action with a comma.
- The copy does not reuse the same opening shape across a batch.
- The copy matches the requested type: product update, course material, social post, release note, event notice, announcement, short commentary, customer support reply, marketing landing copy, onboarding guide, changelog, incident notice, recruitment post, community update, newsletter brief, video script, app-store release note, FAQ answer, policy update, email invite, meeting summary, push notification, crisis response, or other requested format.
- The copy can be directly shown to the intended reader without exposing validator, skill, rule, sample, or review language.
- The copy is not merely grammatically legal; it contains enough concrete information for the reader to act, understand the change, or decide whether to continue.

Stop after three candidate rebuilds and report the unresolved issue if the copy still cannot pass.

For hard validation failures caused by known-bad patterns, do not repair the failed wording. Discard the candidate, regenerate from the Chinese fact draft, then validate again.

For publishability failures after validator pass, do not claim the text was reviewed. Treat it as a missing review gate or missing sample coverage, then update `publishability_review.md`, `non_tool_copy_cases.jsonl`, or the relevant reference before producing another batch.

## Hard Validation

For every final copy, run the manual hard checklist. When output will be published, reused, or used to update a pipeline, also run:

```bash
node natural-chinese-copy-core/scripts/validate_chinese_copy.mjs --file <copy-file>
node natural-chinese-copy-core/scripts/validate_chinese_copy.mjs --require-tool-project-opening --file <tool-copy-file>
```

If the validator reports any `hard` issue, do not mark `copyCritique.status` as `pass`.

If the validator reports a known-bad pattern on a final candidate, treat it as generation failure, not copy feedback. The candidate must not be handed off.

When source material and output text are both available, also run:

```bash
node natural-chinese-copy-core/scripts/validate_fact_grounding.mjs --source <source-file> --output <output-file>
```

If the fact validator reports `ungrounded data claim`, remove the claim or add an explicit boundary. Do not replace it with a guessed number.

When changing this skill's own rules, also run:

```bash
node natural-chinese-copy-core/scripts/validate_rule_language.mjs --file <reference-file>
```

If the rule validator reports slogan-style rules outside examples or blacklists, rewrite the rule as `trigger -> judgment -> rewrite action`.

When adding network slang observations, run:

```bash
node natural-chinese-copy-core/scripts/validate_slang_observations.mjs --file natural-chinese-copy-core/references/slang_observations_2026.jsonl
```

Do not set `autoUse: true` unless the observation passes the freshness and source-quality checks.

When adding platform sample cases, run:

```bash
node natural-chinese-copy-core/scripts/validate_platform_cases.mjs --file natural-chinese-copy-core/references/platform_sample_cases.jsonl
```

Every `pass` sample must also pass `validate_chinese_copy.mjs`; bad samples may fail by design.

When adding natural conversation move cases, run:

```bash
node natural-chinese-copy-core/scripts/validate_conversation_cases.mjs --file natural-chinese-copy-core/references/conversation_move_cases.jsonl
```

Every `pass` sample must pass the copy validator and must name the conversation move it trains.

When adding batch sample cases, run:

```bash
node natural-chinese-copy-core/scripts/validate_batch_cases.mjs --file natural-chinese-copy-core/references/batch_sample_cases.jsonl
```

Every `passItems` entry must pass the copy validator and the batch must vary entry types.

When adding technical project copy cases, run:

```bash
node natural-chinese-copy-core/scripts/validate_technical_project_cases.mjs --file natural-chinese-copy-core/references/technical_project_cases.jsonl
```

Every `pass` sample must pass the copy validator and must name the technical-copy task it trains.

When adding non-tool copy cases such as product updates, course material, social posts, release notes, or event notices, run:

```bash
node natural-chinese-copy-core/scripts/validate_non_tool_copy_cases.mjs --file natural-chinese-copy-core/references/non_tool_copy_cases.jsonl
```

Every `pass` sample must pass the copy validator and must list the manual publishability criteria it trains.

When tuning this skill after user feedback, run the self-evolution lab:

```bash
node natural-chinese-copy-core/scripts/run_self_evolution_copy_lab.mjs --file natural-chinese-copy-core/references/self_evolution_cases.jsonl --out .tmp/self_evolution_copy_lab.md --json-out .tmp/self_evolution_copy_lab.json --require-stable-zero=3
```

Use it to compare issue counts across rounds. A successful tuning pass should show fewer validator failures and fewer publishability failures, then end with the required stable-zero tail. The lab counts validator hard issues, validator warnings, and publishability issues. The lab does not edit rules by itself; it produces evidence for Codex to summarize and then update references, validators, or samples explicitly.

When adding user feedback samples or preparing a rule proposal from user feedback, run:

```bash
node natural-chinese-copy-core/scripts/validate_feedback_cases.mjs --file natural-chinese-copy-core/references/feedback_sample_cases.jsonl
node natural-chinese-copy-core/scripts/propose_feedback_evolution.mjs --file natural-chinese-copy-core/references/feedback_sample_cases.jsonl --out .tmp/feedback_evolution.md
node natural-chinese-copy-core/scripts/validate_legacy_issue_coverage.mjs
```

Feedback can suggest a hard gate only when it includes a concrete bad sentence, a better rewrite, and a deterministic problem type such as `fact-error`, `measure-word`, `tense-aspect`, `english-logic`, `meta-leak`, or `subject-predicate-mismatch`. Feedback about taste, angle, register, or batch repetition stays sample-first unless repeated evidence produces a stable trigger and a safe regression set.

## Feedback Evolution

When the task is skill evaluation, public skill usage, copy QA, or batch copy tuning, invite compact feedback after the copy is delivered:

```text
If any sentence feels wrong, mark the sentence and the problem type. I can save that as a feedback sample for future rule proposals.
```

Use this flow only when feedback is useful in context. Do not add this prompt to every normal one-off copy request.

When the user is preparing to upload, freeze, or finalize this skill, do not stop at fixing the visible draft. Offer one short sentence asking whether the issue should become personalized skill optimization input.

Feedback handling steps:

1. Record the full copy, source facts, rating, bad sentence, better sentence, problem type, and user note.
2. Validate the feedback record with `validate_feedback_cases.mjs`.
3. Generate an evolution proposal with `propose_feedback_evolution.mjs`.
4. Human-review the proposal before changing references or validators.
5. Add bad/pass cases and run the relevant validators before changing the skill version.

The feedback scripts write samples and proposals only. They never edit `SKILL.md`, references, or validators by themselves.

## Personalization Loop

This follow-up is only for final copy delivery. Do not use it while editing this skill, changing rules, writing reports, discussing validators, or doing upload/finalization maintenance.

When a final copy draft has been delivered to the user and no rule-editing task is currently active, append this single follow-up:

```text
如果需要个性化优化，请提交优化方向或规则。
```

Rules:

1. Prefer this single-sentence follow-up over menus, numbered options, or open-ended “还要不要优化”.
2. If the user is asking to change the skill, rules, validators, reports, or upload package, do not append this sentence.
3. If the user gives a rule, preference, or repeated issue pattern, route it through feedback samples, recurring issue coverage, or upload-finalization cleanup as appropriate.
4. This loop must remain usable without any external reviewer.

## Rule Distillation

When adding or changing rules, use this path:

```text
source material -> sentence symptom -> copy failure -> rewrite action -> validator check -> eval case
```

Do not add a rule only because a phrase feels bad. Add it only when the failure can be observed, explained, and tested against at least one bad example and one acceptable rewrite.

Rules inside this skill must also pass `references/rule_language_guard.md`. Do not write rules as slogans such as `要 A，不要 B`; write the trigger, the judgment, and the rewrite action.

Network slang and platform-specific expressions must follow `references/slang_freshness_policy.md`. Do not use a network term only because it appears in a past annual list; check recency, platform, audience, and whether the user explicitly wants that register.

## Output Contract

Each reviewed item should include:

- `text`
- `content` equal to `text`
- `selectedRegister`
- `chineseFactDraft`
- `generationPromptContract`
- `knownBadGeneration.status`
- `sentenceSkeletonReview` with subject, predicate, object, attribute, adverbial, complement, omitted subject, and judgment for each key sentence
- `hardValidation.status`
- `publishabilityReview.status`
- `candidateDiscard.status` when an internal candidate hits a known-bad rule
- `copyCritique.status = "pass"`

For reports, introductions, README copy, GUIDE copy, tool descriptions, or any long-form output, the visible response should include:

- `正文稿`
- `结构标注稿`

When used inside publishable pipelines, also set:

- `copyStatus = "codex_reviewed"`

When the user is in skill-tuning or upload-finalization mode, also include:

- `personalizationOffer.status = "shown"` when the one-line follow-up has been offered
- `skillEvolutionAction` when the follow-up changed samples, legacy issue coverage, validators, or regression evidence

Do not mark copy as reviewed if the critique is only partially satisfied.
