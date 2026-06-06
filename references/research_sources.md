# 研究来源摘要

目标：保存可追溯来源，并把来源压缩成可执行的中文文案规则。

不要把这里当论文笔记。每条资料只保留对 skill 有用的结论。

## 1. Translated Chinese 的句法特征

来源：

- ACL Anthology: *Detecting Syntactic Features of Translated Chinese*  
  https://aclanthology.org/W18-1603.pdf

可用结论：

- 译文中文和原创中文可以通过句法特征区分。
- 译文中文更容易出现受源语言影响的结构。
- 相关特征包括主语位置代词、`NP + 的` 修饰结构、并列名词或动词等。

转成规则：

- 不要只看词，要检查句子骨架。
- 长定语和连续 `的` 是高风险信号。
- 主语显得过满、过显式时，检查是不是英文句法迁移。
- 并列功能堆叠要拆成动作和结果。

落位：

- `chinese_sentence_structure.md`
- `anti_translationese_patterns.md`
- validator 的长定语和连续 `的` 检查

## 2. Translated Chinese variants

来源：

- Cambridge Natural Language Engineering: *Investigating translated Chinese and its variants using machine learning*  
  https://www.cambridge.org/core/journals/natural-language-engineering/article/abs/investigating-translated-chinese-and-its-variants-using-machine-learning/E640C7C90BB48C36694AD0A01E2A5049

可用结论：

- 译文中文和非译文中文可以通过机器学习区分。
- 不同源语言会留下不同的语言痕迹。
- 翻译腔不只是单词问题，也包括结构问题。

转成规则：

- 审查时先看结构，再删词。
- 对英文来源材料，必须先写中文事实稿，不能顺着英文原句润色。
- 不同来源材料不能共用同一套中文模板。

落位：

- `SKILL.md` 的中文事实稿流程
- `rule_distillation_method.md`
- `batch_repetition_review.md`

## 3. 中文话题结构

来源：

- Frontiers in Communication: topic structure in Chinese discourse  
  https://www.frontiersin.org/journals/communication/articles/10.3389/fcomm.2021.650659/full

可用结论：

- 中文表达常依赖话题和述题的组织方式。
- 读者已知信息、场景和话题可以先出现，再接动作和结果。

转成规则：

- 首句不必硬用项目名做主语。
- 优先从读者、场景、任务、痛点进入。
- 关键句必须能还原“谁在什么场景做什么，得到什么结果”。

落位：

- `chinese_sentence_structure.md`
- `chinese_tool_copy_examples.md`

## 4. LLM 译文的同质化

来源：

- PLOS One: human and LLM translation distinction using dependency triplets  
  https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0339769

可用结论：

- 人译和 LLM 译文可以通过依存结构模式区分。
- 机器输出容易在结构层面趋同。

转成规则：

- 批次审查不能只查重复词，还要查句法入口、段落顺序、动作类型。
- 多条文案如果去掉项目名还能互换，就说明具体事实没有进入句子。

落位：

- `batch_repetition_review.md`
- `copy_eval_rubric.md`

## 5. 口语语料与真实日常中文

来源：

- BCC 语料库帮助页，北京语言大学语料库中心  
  https://bcc.blcu.edu.cn/help.html
- CCL 语料库检索系统，北京大学中国语言学研究中心  
  https://corpus.pku.edu.cn/
- CALLHOME Mandarin Chinese Speech, Linguistic Data Consortium  
  https://catalog.ldc.upenn.edu/LDC96S34
- MagicData-RAMC Mandarin Conversational Speech Dataset  
  https://arxiv.org/abs/2203.16844

可用结论：

- 真实中文不能只从正式书面材料里学。
- 口语材料包含大量省略、短句、回合结构、重复确认和关系距离变化。
- 电话、聊天、问答这类语料更适合学习日常表达的结构。
- 书面语料和口语语料要分开看，不能把正式论文句法当成自然中文的唯一标准。

转成规则：

- skill 必须有 `register`，不能默认正式中文。
- 口语化优先学习省略、短句、停顿和上下文承接，而不是学习网络口头禅。
- 熟人聊天可以更短，但必须保证新信息不丢。
- 技术推荐默认用 `plain`，不是 `formal`。

落位：

- `register_selection.md`
- `chinese_register_modes.md`
- `colloquial_sentence_structure.md`
- `spoken_copy_examples.md`

## 6. 汉语省略与话题承接

来源：

- *Pronouns, null arguments, and ellipsis in Mandarin Chinese*  
  https://ojs.ub.uni-konstanz.de/sub/index.php/sub/article/view/507
- *A Study of Zero Anaphora Resolution in Chinese Discourse*  
  https://pmc.ncbi.nlm.nih.gov/articles/PMC8581763/

可用结论：

- 汉语里主语、宾语或代词省略与上下文关系很强。
- 中文理解常依赖话题延续和语篇层面的承接。
- 省略不是随便删词；上下文不够时，省略会造成歧义。

转成规则：

- 口语化时可以省主语，但只能省双方已知的信息。
- 新工具、新限制、新风险不能省。
- 连续对话可以更短；公开文案要保留更多上下文。
- `close-chat` 不是默认语体，它依赖熟人关系和共享语境。

落位：

- `colloquial_sentence_structure.md`
- `register_selection.md`
- `copy_eval_rubric.md`

## 7. 待补来源

## 7. 自然用语与网络用语来源

来源：

- BCC 语料库帮助页，北京语言大学语料库中心  
  https://bcc.blcu.edu.cn/help.html
- “汉语盘点2025”年度字词相关发布，商务印书馆  
  https://www.cp.com.cn/Content/2025/12-19/1402410592.html
- 2025 年度十大网络流行语相关报道，新华社  
  https://www.news.cn/book/20251212/83e4aed3aff145959bf5a06243280302/c.html

可用结论：

- 自然用语要从口语、社交、技术社区和平台语体里分别学习，不能只看正式报告。
- 网络词有明显时间属性，年度榜单不能直接当长期词库。
- 网络词应记录来源、观察日期、平台、人群、语用功能和新鲜度状态。

转成规则：

- 新增 `natural_usage_structure.md`，学习回应、确认、补充、追问、提醒、转向、收束。
- 新增 `platform_registers.md`，区分技术社区、小红书、B站、微博、知乎、朋友圈、群聊。
- 新增 `internet_slang_lifecycle.md` 和 `slang_freshness_policy.md`，禁止把过时热词自动写入文案。
- 新增 `source_quality_policy.md` 和 `slang_observations_2026.jsonl`，把来源质量和网络词观察分开记录。
- 新增 `platform_sample_cases.jsonl`，把平台语体变成 bad/pass 回归样本。
- 新增 `conversation_move_cases.jsonl`，把回应、确认、追问、提醒、纠错、拒绝、承认、转向、解释、收束做成样本。
- 新增 `batch_sample_cases.jsonl`，把批次模板化、边界重复、段落顺序重复做成 bad/pass 样本。
- 新增 `technical_project_copy.md` 和 `technical_project_cases.jsonl`，覆盖 README 摘要、Trending 推荐、开源项目推荐、工具对比、稳定性边界、部署说明、README 宣传词过滤、功能列表转使用路径。

落位：

- `natural_usage_structure.md`
- `platform_registers.md`
- `internet_slang_lifecycle.md`
- `slang_freshness_policy.md`
- `source_quality_policy.md`
- `slang_observations_2026.jsonl`
- `platform_sample_cases.jsonl`
- `conversation_move_cases.jsonl`
- `batch_sample_cases.jsonl`
- `technical_project_copy.md`
- `technical_project_cases.jsonl`

后续优先补这些方向：

- 中文信息结构、话题链、零主语的语言学资料。
- 英汉翻译中名词化、被动结构、连接词显化的研究。
- 中文商业文案和技术传播里的可读性研究。
- 真实业务输出中的 validator 拦截日志。
