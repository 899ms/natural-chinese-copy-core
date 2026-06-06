# 反馈进化机制

目标：把用户对文案的评分、坏句标注和改写建议，沉淀成可验证样本，再由人审决定是否升级为规则。

## 1. 反馈输入

触发：用户在看完文案后给出评分、圈出坏句、指出问题类型，或给出一版更好的写法。

判断：评分本身只是弱信号。真正可训练的是具体坏句、原始事实、问题类型和用户认可的改写。

处理：每条反馈记录至少保留这些字段：

- `copyText`：被评价的完整文案。
- `sourceFacts`：生成文案时使用的事实材料；没有事实材料时写明为空。
- `rating`：1 到 5 分，可为空。
- `badSentence`：用户指出的原句。
- `betterSentence`：用户给出的改写，可为空。
- `problemTypes`：问题类型数组。
- `note`：用户的解释。

## 2. 问题类型

固定类型：

- `english-logic`：英文句序、英文条件状语、名词化或翻译腔。
- `template-feel`：批量稿出现固定推进方式或可互换表达。
- `flat-writing`：句子没有具体动作，只在做空判断。
- `tense-aspect`：发布、接入、上线、可用等状态变化少了中文体态标记。
- `measure-word`：工具项目定义句少量词。
- `meta-leak`：后台评审、规则解释、句法判断泄漏进最终正文。
- `subject-predicate-mismatch`：主语不能执行谓语，或对象和动作关系不成立。
- `fact-error`：出现来源材料没有的事实。
- `angle-error`：文案角度和读者任务不匹配。
- `register-mismatch`：语体和读者关系不匹配。
- `batch-repetition`：同批文案入口、第二句或收束方式重复。
- `publishability-fail`：机器校验通过，但正文不能直接给目标读者或目标渠道使用。
- `type-mismatch`：输出不符合用户要求的文案类型，例如要产品更新却写成工具介绍或规则说明。
- `other`：暂时无法归类的问题。

## 3. 归因分层

确定错误：`fact-error`、`measure-word`、`tense-aspect`、`english-logic`、`meta-leak`、`subject-predicate-mismatch` 中能被具体句子和改写证明的问题，可以进入硬门禁候选。

审美问题：`template-feel`、`flat-writing`、`angle-error`、`register-mismatch`、`batch-repetition`、`publishability-fail`、`type-mismatch` 默认先进入样本库。只有同类坏句反复出现，并且能写出明确触发条件、判断方式和改写动作时，才进入规则提案。

未知问题：`other` 先进入待归因样本，不直接转成规则。

## 4. 准入顺序

每条反馈按这个顺序处理：

1. 保存原文、事实、坏句、改写和评分。
2. 校验反馈记录是否完整；低分反馈必须有坏句或说明。
3. 生成进化提案，标注 `hard-gate-candidate`、`sample-only` 或 `needs-human-triage`。
4. 人工复核提案。
5. 若升级为规则，补充 bad/pass 样本和 validator 条件。
6. 运行回归测试。坏例必须 fail；旧好例必须 pass；批量样本不能更格式化。
7. 回归通过后才更新 skill 版本。

## 5. 禁止自动改规则

用户评分不能直接改 `blacklist_patterns.md`、`anti_translationese_patterns.md` 或 `validate_chinese_copy.mjs`。

坏句也不能直接变成正则。必须先回答：

- 这句话的可观察症状是什么。
- 它损害了事实、语序、语体、读者动作还是批量变化。
- 更好的写法解决了哪个具体问题。
- 同类好句是否会被误杀。
- 需要进入 hard gate，还是只进入样本库。

## 6. 脚本

采集反馈：

```bash
node natural-chinese-copy-core/scripts/capture_copy_feedback.mjs --copy-file output.txt --bad-sentence-file bad.txt --better-sentence-file good.txt --problem english-logic --rating 2 --store .tmp/copy_feedback.jsonl
```

校验反馈：

```bash
node natural-chinese-copy-core/scripts/validate_feedback_cases.mjs --file .tmp/copy_feedback.jsonl
```

生成进化提案：

```bash
node natural-chinese-copy-core/scripts/propose_feedback_evolution.mjs --file .tmp/copy_feedback.jsonl --out .tmp/feedback_evolution.md
```

## 7. 交付提示

当输出可被用户评价的文案时，可以在交付后给一个轻提示：

```text
如果哪句不顺，直接圈出原句并说明问题类型；这条反馈可以进入样本库，后续用来提升规则。
```

这个提示只在用户正在评稿或调 skill 时使用。普通一次性文案交付不强制打扰用户。

## 8. Personalized Skill Exit

Use this single follow-up only after delivering a final copy draft. Do not use it while the current task is changing the skill, rules, validators, reports, or upload package.

```text
如果需要个性化优化，请提交优化方向或规则。
```

Interpretation:

- “优化方向” means draft-level preference such as tone, brevity, or wording direction.
- “规则” means a reusable style constraint, recurring issue, or personal skill preference that should be evaluated for sample, validator, publishability, or regression coverage.
