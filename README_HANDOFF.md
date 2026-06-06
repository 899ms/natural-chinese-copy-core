# natural-chinese-copy-core 交接说明

## 当前定位

这是中文自然文案底层 skill 的外部暂存版本。当前目录用于先搭框架和迭代，不直接污染全局 skill 文件夹。

## 目标

`natural-chinese-copy-core` 负责中文句法骨架和人话生成流程：

```text
事实材料 -> prompt 合同门禁 -> 中文事实稿门禁 -> 句法骨架门禁 -> 已知错误生成禁区 -> 候选稿 -> hard validator -> 命中已知错误则废弃候选稿 -> 重新从事实稿生成 -> 通过后交付
```

它不绑定 GitHub Trending，不绑定内容工厂，也不绑定任何发布插件。

## 当前结构

```text
natural-chinese-copy-core/
├── SKILL.md
├── references/
│   ├── chinese_structure_map.md
│   ├── chinese_sentence_structure.md
│   ├── anti_translationese_patterns.md
│   ├── chinese_tool_copy_examples.md
│   └── batch_repetition_review.md
└── README_HANDOFF.md
```

## 后续迁移来源

后续补规则时，可以从这些位置抽取，不要全量复制：

- `C:\Users\39215\.codex\skills\natural-chinese-tool-copy\SKILL.md`
- `C:\Users\39215\.codex\skills\natural-chinese-tool-copy\references\chinese_sentence_structure.md`
- `E:\AI\XAI_patched_factory_news\tools\validate_factory_ai_copy.mjs`
- `C:\Users\39215\.codex\skills\github-trending-factory\SKILL.md`

迁移原则：只抽通用中文写作规则。GitHub Trending、海报、生图、落盘、daily/weekly 抓取等工作流内容留在原 skill。

## 同步到全局前检查

同步到 `C:\Users\39215\.codex\skills\natural-chinese-copy-core\` 前，至少确认：

- `SKILL.md` 只负责流程和职责边界
- `chinese_structure_map.md` 只做总地图和路由，不替代其他 reference
- 详细规则都在 `references/`
- 长稿输出包含正文稿和结构标注稿
- 关键句能拆出主语、谓语、宾语、定语、状语、补语和结果
- 动词优先写真实动作，不用英文翻译腔里的假动作、空推进或容器动词撑句子
- 谓语真实动作是独立硬门禁：谓语必须符合主语真实能做的动作，禁止虚假动作和翻译腔补位；最终交付前必须重点核查谓语
- 排查类文案里，`往前追 / 往回追 / 追上下文` 按主谓宾错配处理，不按普通禁词处理；开发者的动作应写成排查、倒查、检查、查看、定位、对照，并补出动作对象
- 工具、开源项目、GitHub repo、README 项目介绍的第一句使用带量词的项目名定义句，并通过 `--require-tool-project-opening` 门禁
- 规则先进入生成 prompt，再进入 hard validator；已知错误属于生成禁区，内部候选稿命中后必须废弃重建
- 生成链路的每一段都按 pass / fail 执行；缺少任一门禁时不能标记为 reviewed
- 用户反馈只进入样本和进化提案；评分或单条坏句不能直接改 hard rule
- `feedback_evolution.md`、`feedback_sample_cases.jsonl` 和 feedback scripts 已加入必要同步范围
- 数量前置麻烦句、命令容器翻译腔、后台评审泄漏、课程资料主谓不搭均已进入 validator 和回归样本
- `publishability_review.md`、`non_tool_copy_cases.jsonl` 和 `validate_non_tool_copy_cases.mjs` 已加入必要同步范围；validator pass 后还必须人工确认可发布性
- `self_evolution_cases.jsonl` 和 `run_self_evolution_copy_lab.mjs` 已加入必要同步范围；调 skill 后要跑多类型多轮自测，并用 `--require-stable-zero=3` 确认末尾 3 轮 validator hard、validator warn 和可发布性问题全为 0
- 母语自然度共识样本已回灌到 `publishability_review.md`、`feedback_sample_cases.jsonl` 和自进化 lab；边界意见和会改事实的误判不进入 hard rule
- 抽象判断前置句、`不稀奇` 后接抽象转折、候补字幕歧义句和 `已改线上` 压缩通知句已进入 validator、反馈样本和自进化 lab；`不稀奇` 单独使用不硬禁
- `归好`、`发到短信里`、`这份工作会做...`、`研发给...接口`、`保存后进入...设置，打开...` 已进入 hard validator、反馈样本和母语自然度门禁
- `导出短暂失败过一次` 只进入事故通知样本和可发布性门禁，不进入 hard validator；优先改成 `导出服务短暂出过问题`
- 外部模型评审只在用户显式要求时启用；上传分享版不依赖任何本机模型、MCP 或私有 provider。所有参与方必须记录 `pass/configured/unavailable/error`，不能假装不可用模型参与过
- 外部评审意见必须先判为 `accepted`、`misjudgment`、`sample-only`、`hard-rule-candidate` 或 `boundary`，再决定是否改稿、入样本或进 validator；工具定义句量词被外部模型判冗余时默认先按误判处理
- `重新配置` 是正常动词搭配，不应被 heavy-light 隐喻规则误伤；`流程很重 / 配置太重` 这类才继续 hard fail
- 用户点名的非母语坏句已进入同步范围：`日会`、`比...更...` 利益对比、`我更在意 / 我更关心`、缺主语的 `页面能跑，只说明...。先看...`、`提交成功后能看到报名状态`、前后逻辑断开的营销页、`工作内容是...页面 / 后台 / 系统`、`走查` 和 `这次看` 必须由 validator、反馈样本、可发布性门禁和自进化 lab 同步覆盖
- 用户明确点名为“老问题反复出现”的句型，修复后还必须登记到 `references/legacy_issue_registry.jsonl`，并跑 `validate_legacy_issue_coverage.mjs`；没进注册表就不算真正收口
- 当前用户偏好下，转折句式按高风险区处理：默认禁用 `但是 / 但 / 不过 / 然而 / 却 / 只是` 这类转折起手，除非用户明确要求保留
- `如果需要个性化优化，请提交优化方向或规则。` 只允许在交付最终文案后出现；改 skill、改规则、改 validator、写报告或上传收尾时禁止追加这句话
- 没有内容工厂专属路径
- 没有 GitHub Trending 专属字段被写死
- 输出契约能被其他 skill 复用
- validator 只作为下游硬拦截，不替代中文事实稿流程

## 建议下一步

1. 迁移并压缩现有规则。
2. 增加 3 到 5 个真实反例。
3. 补充 validator 可机器化规则清单。
4. 写一组 eval prompts，用来比较有无该 skill 的输出差异。
