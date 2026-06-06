# 中文文案评测规约

目标：给 skill 更新提供回归测试，避免规则越改越玄学。

## 1. 评分维度

每条文案按五项判断：

- `promptContract`: 生成前是否已经把句法骨架、语体、项目名位置和禁用骨架写进 prompt。
- `definitionOpening`: 工具、开源项目、GitHub repo、README 项目是否先用带量词的项目名定义句建立对象。
- `freeOpening`: 首句之后是否自由展开，而不是套用固定分析句式。
- `backbone`: 主语、谓语、宾语、结果是否能指出。
- `chineseFactDraft`: 是否先把事实改成正常中文。
- `translationeseRisk`: 是否保留英文产品页骨架。
- `concreteness`: 是否写清具体动作和省掉的麻烦。
- `aspectMarker`: 发布、接入、上线、可用等状态变化是否用了自然的完成体 / 变化标记。
- `registerFit`: 语体是否符合场景、对象和关系距离。
- `batchRisk`: 放进批次后是否像模板换名。
- `knownBadGeneration`: 已知错误是否在生成前被排除在候选空间之外。
- `hardFilter`: 最终候选是否经过硬规则过滤，且没有把过滤当成事后擦除。
- `candidateDiscard`: 内部候选命中已知错误时是否直接废弃并从事实稿重建。
- `typeFidelity`: 是否符合用户要求的文案类型，没有把产品更新、活动通知、社媒短帖等写成工具介绍或规则说明。
- `publishability`: 是否能直接给目标读者和目标渠道使用，而不是只满足机器校验。

通过条件：

```json
{
  "promptContract": "pass",
  "definitionOpening": "pass",
  "freeOpening": "pass",
  "backbone": "pass",
  "chineseFactDraft": "pass",
  "translationeseRisk": "low",
  "concreteness": "pass",
  "aspectMarker": "pass",
  "registerFit": "pass",
  "batchRisk": "low",
  "knownBadGeneration": "pass",
  "hardFilter": "pass",
  "candidateDiscard": "pass-or-not-needed",
  "typeFidelity": "pass",
  "publishability": "pass"
}
```

## 2. 单条评测格式

```markdown
### Case 名称

Facts:
- ...

Bad:
`...`

Failure:
- ...

Pass:
`...`

Expected tags:
- ...
```

## 3. 基础样例

### Repo 名硬当主语

Facts:

- UI-TARS-desktop 是一个让 AI 操作桌面应用的项目。
- 读者想测试 AI 是否能真正执行桌面任务。

Bad:

```text
UI-TARS-desktop 可以重点看一下。
```

Failure:

- 项目名被硬塞成主语。
- 读者动作不清楚。
- 没写明为什么要看。

Pass:

```text
UI-TARS-desktop 是一个让 AI 操作桌面应用的项目。桌面任务看实际操作：点按钮、切窗口、处理弹窗；点开 repo 后，先看这些动作怎么接到模型输出上。
```

Expected tags:

- `definition-first`
- `backbone-pass`

### 长定语堆功能

Facts:

- 一个工具支持多模型协作。
- 它主要解决上下文管理问题。

Bad:

```text
这个支持多模型上下文管理的自动化协作能力工具很值得关注。
```

Failure:

- 长定语压住中心动作。
- `能力工具` 是空泛名词组合。
- 没说省掉什么麻烦。

Pass:

```text
它主要解决多模型协作时的上下文管理问题。几个模型轮流干活时，项目背景不容易丢。
```

Expected tags:

- `long-modifier`
- `nominalization`
- `concrete-result`

### 抽象判断代替动作

Facts:

- 一个 agent memory 工具把项目背景留在 MCP 里。
- 用户下次继续任务时不用重新解释背景。

Bad:

```text
这类工具的价值就在这，开始接近真正的组织能力。
```

Failure:

- `价值`、`组织能力` 都没有具体动作。
- 金句式结论过满。
- 没写出用户省掉的麻烦。

Pass:

```text
它能把项目背景留在 MCP 里。下次继续改同一个项目时，不用从头解释一遍。
```

Expected tags:

- `abstract-noun`
- `fake-insight`
- `saved-trouble`

### 裸不只是铺垫

Facts:

- AI 编程工具开始进入企业开发环境。
- agent 会改文件、装依赖、跑命令、提 PR。
- 团队需要检查运行环境、权限和审计记录。

Bad:

```text
AI 编程这件事，已经不只是“谁写代码更快”了。
```

Failure:

- `不只是 A` 虽然没有写出 `而是 B`，但已经形成固定对比姿态。
- 句子只否定旧判断，没有写出团队下一步要检查什么。
- `这件事` 是含混指代。

Pass:

```text
AI 编程工具进入企业环境后，团队会先检查三处：agent 在哪里跑、能碰哪些文件、每一步有没有记录。
```

Expected tags:

- `bare-not-only`
- `contrast-frame-removed`
- `concrete-checkpoints`

### 已知错误不能进入交付

Facts:

- 规则库已经把 `不是 A，而是 B` 标为 hard fail。
- 内部候选稿写出了这个结构。
- 最终交付前必须从中文事实稿重建候选。

Bad:

```text
先交付这句，后面再修掉 `不是 A，而是 B`。
```

Failure:

- 已知错误被当成可修补文本，而不是生成禁区。
- 审核被放在生成后面，不能阻止旧结构进入交付面。
- 这类流程会让用户变成最后一道 QA。

Pass:

```text
候选稿命中已知 hard 规则时，直接废弃。下一版从事实、动作、对象和结果重新生成，不沿用失败句。
```

Expected tags:

- `known-bad-generation-ban`
- `candidate-discard`
- `no-post-hoc-cleanup`

### 状态变化少了了

Facts:

- Google 把 Managed Agents 接入 Gemini API。
- 这是这次更新里已经发生的产品状态变化。
- Copilot Studio 的 computer-using agents 从预览 / 不可用状态变成正式可用。

Bad:

```text
Google 这次把 Managed Agents 放进 Gemini API。
Copilot Studio 的 computer-using agents 已经正式可用。
```

Failure:

- 第一句在写接入动作已经完成，但少了完成体标记。
- 第二句在写状态变化，但 `已经正式可用` 少了句末变化标记。
- 去掉 `了` 后像公告标题或机器摘要，少了中文里的状态变化感。

Pass:

```text
Google 这次把 Managed Agents 放进了 Gemini API。
Copilot Studio 的 computer-using agents 已经正式可用了。
```

Expected tags:

- `aspect-marker`
- `state-change-le`
- `no-english-tense-mapping`

### 数量前置翻译腔

Facts:

- llmfit 用于在下载模型前检查本机硬件、模型规格和 provider 选择。
- 读者关心本机能跑哪些模型，下载前能不能先看清。

Bad:

```text
模型和 provider 一多，麻烦通常出在下载前：
```

Failure:

- `X 一多，麻烦通常出在 Y` 把条件和抽象判断压在主动作前面。
- 读者先看到范围和姿态，后面才知道该做什么。
- 句子像英文条件从句换成中文词。

Pass:

```text
下载模型前，先查本机硬件、模型规格和 provider 选择。
```

Expected tags:

- `english-logic`
- `quantity-fronted-trouble`
- `action-first`

### 命令容器翻译腔

Facts:

- llmfit 可以用一个命令查询模型、provider 和硬件限制。
- 输出目的是说明它把下载前检查做得更集中。

Bad:

```text
llmfit 把 models、providers 和硬件限制放到一个命令里查。
```

Failure:

- 命令被写成容器，动作关系不符合中文。
- `把 A 放到一个命令里查` 像英文产品说明硬翻。
- 句子没有写清读者用命令查到什么结果。

Pass:

```text
llmfit 可以用一个命令查本机硬件、模型规格和 provider 选择。
```

Expected tags:

- `english-logic`
- `command-container`
- `concrete-query-action`

### 后台判断泄漏

Facts:

- Google 把 Managed Agents 接入 Gemini API。
- 这是产品更新中已经发生的动作。
- 用户要的是产品更新正文，不是规则解释。

Bad:

```text
Google 这次把 Managed Agents 放进了 Gemini API。

这句话要带“了”，因为它写的是接入动作已经发生。
```

Failure:

- 第二句是后台评审，不是产品正文。
- 它解释为什么用某个字，破坏了正文语境。
- 产品更新只保留事实、变化、入口和边界。

Pass:

```text
Google 这次把 Managed Agents 接进了 Gemini API。
```

Expected tags:

- `meta-leak`
- `final-copy-only`
- `review-text-separated`

### 课程资料主谓不搭

Facts:

- 一套课程共有 12 节内容。
- 每节内容配套 Notebook。

Bad:

```text
12 节课按顺序往下走。
```

Failure:

- `课` 不能执行 `往下走`。
- 真实动作属于学习的人，或属于课程安排。
- 这不是口语简化，而是主语和谓语不搭。

Pass:

```text
课程安排了 12 节内容，每节都配 Notebook。
```

Expected tags:

- `subject-predicate-mismatch`
- `course-not-actor`
- `predicate-fit`

### 前置读者短语逗号

Facts:

- 读者刚开始补 Agent 基础。
- 课程按章节覆盖工具调用、规划和多 agent 协作。

Bad:

```text
刚补 Agent 基础的人，先按章节跑工具调用、规划和多 agent 协作。
```

Failure:

- 读者范围放在主动作前面，又被逗号断开。
- 主动作被推迟，句子像英文从句换成中文词。
- 这类句子如果必须保留前置读者短语，中间不能用逗号。

Pass:

```text
刚补 Agent 基础的人可以先按章节跑工具调用、规划和多 agent 协作。
```

Expected tags:

- `front-loaded-reader-condition`
- `comma-removed`
- `action-attached`

### 批次模板化

Facts:

- 三个不同工具分别解决浏览器调试、记忆保存、规则清单。

Bad:

```text
如果你想提升浏览器调试效率，可以看看 A。
如果你想提升项目记忆效率，可以看看 B。
如果你想提升 agent 落地效率，可以看看 C。
```

Failure:

- 三条开头形状相同。
- 都用 `提升效率` 抹平差异。
- 去掉项目名后可以互换。

Pass:

```text
排查前端问题时，A 能让 agent 直接看 Console 和 Network。
长期改同一个项目的人，可以用 B 把背景留住。
C 更像一份上线前清单，适合检查审批、状态和日志有没有漏。
```

Expected tags:

- `batch-opening-repeat`
- `interchangeable-copy`
- `specific-action`

### 语体不匹配

Facts:

- 对方是熟人。
- 早上刚打开聊天。
- 想问他找自己干什么。

Bad:

```text
早上好，请问有什么需要我协助处理的吗？
```

Failure:

- 语体过于正式。
- 熟人聊天不需要完整礼貌结构。
- 关系距离不匹配。

Pass:

```text
早，干啥？
```

Expected tags:

- `register-close-chat`
- `ellipsis-ok`
- `relationship-distance-pass`

### 过度口语化

Facts:

- 面向公开读者解释一个工具的使用边界。
- 一次性 demo 不需要使用。
- 长期项目才适合。

Bad:

```text
demo 别上，长期项目再说。
```

Failure:

- 语体过于熟人聊天。
- 公开读者缺少上下文。
- `再说` 太含糊。

Pass:

```text
只做一次 demo 的话不用上这一套。长期改同一个项目时，它才比较有用。
```

Expected tags:

- `register-plain`
- `public-context`
- `boundary-clear`

### BilldDesk 模板回退

Facts:

- BilldDesk 是远程桌面控制项目。
- 它把 Web、桌面端、Android、WebRTC、Electron、Flutter、Node 等部分放在一起。
- 功能包括远程控制、文件传输、多屏、设备分组、屏幕墙、批量群控和私有化部署。
- 开源版 README 提醒目前不是稳定版，不建议直接用于生产。

Bad:

```text
如果你想自己搭一套远程桌面，而不是完全依赖 ToDesk、向日葵这类现成服务，可以看一下 BilldDesk。对开发者来说，更值得看的不是“功能很多”这件事，而是它把 WebRTC、Electron、Flutter、Node 这一套远控链路放在一个项目里，适合拿来研究远程控制、游戏串流或者私有化部署。
```

Failure:

- `如果你想...可以看一下` 是固定推荐开头。
- `更值得看的不是 A，而是 B` 是翻译腔对比骨架。
- `这件事`、`链路`、`适合拿来研究` 都是抽象收束。
- 第一段没有从远控工具的真实麻烦进入。

Pass:

```text
远程桌面项目先看三处：设备怎么连、画面和控制指令怎么走、权限和文件传输怎么管。

BilldDesk 把浏览器、桌面端和 Android 端放在同一个项目里。WebRTC 负责控制和观看，文件传输、多屏、设备分组、屏幕墙、批量群控都有对应入口。看源码时，先拆建连和控制，再看文件传输和设备管理。

README 说明开源版还不是稳定版。准备部署前，先单独压连接稳定性、权限控制和设备管理。
```

Expected tags:

- `template-fallback-blocked`
- `concrete-scene-entry`
- `contrast-frame-removed`
- `boundary-clear`

### BilldDesk AI 腔残留

Facts:

- BilldDesk 是远程桌面控制项目。
- 它支持浏览器、桌面端和 Android 端。
- 它包含 WebRTC 控制和观看、文件传输、多屏、设备分组、屏幕墙、批量群控。
- README 提醒开源版不是稳定版。

Bad:

```text
自建远控，光把屏幕传过去还不够。BilldDesk 做的是这套底子，旁边还补了文件传输、多屏、设备分组、屏幕墙、批量群控这些东西。拆它时，可以先看连接、控制、传输和设备管理这几块。但别直接拿去生产，真要放到实际环境，先压连接稳定性。
```

Failure:

- `光...还不够` 是 AI 腔对比。
- `这套底子`、`这些东西`、`这几块` 是含混指代。
- `旁边还补了` 像模型总结，不像自然中文。
- `真要放到实际环境` 是模板化收尾。

Pass:

```text
看 BilldDesk，先拆远控流程。浏览器、桌面端和 Android 端都在项目里，控制和观看走 WebRTC，文件传输、多屏、设备分组、屏幕墙、批量群控也各有入口。

看代码时可以分三步：先看设备怎么建连，再看控制指令和画面怎么走，最后看文件传输和设备管理怎么接进去。README 已经说明开源版还不是稳定版，实际部署前要单独压连接稳定性和权限控制。
```

Expected tags:

- `ai-slop-blacklist`
- `specific-object-reference`
- `clear-action-sequence`
- `validator-pass`
