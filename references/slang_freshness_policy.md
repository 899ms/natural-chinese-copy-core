# 网络用语新鲜度策略

目标：避免 skill 使用过时热词，也避免把网络词误当自然中文。

## 1. 默认禁用

网络词默认不自动使用。

只有满足以下任一条件才可使用：

- 用户明确要求“网络一点”“像小红书 / B站 / 微博”。
- 目标平台本身需要该语体。
- 词已经进入 `mainstream`，不再依赖热点语境。

## 2. 必查日期

使用网络词前必须确认：

- 当前日期。
- 词的最近可见使用时间。
- 来源发布时间。
- 平台语境。

如果最近证据超过 180 天，标记为 `stale` 或 `needs-check`。

## 3. 状态字段

记录格式使用 JSONL，见 `slang_observations_2026.jsonl`：

```json
{
  "term": "",
  "observedAt": "YYYY-MM-DD",
  "source": "",
  "platform": "",
  "status": "emerging | current | mainstream | stale | ironic | platform-bound | needs-check",
  "autoUse": false,
  "notes": ""
}
```

## 4. 自动使用规则

- `emerging`: 不自动使用。
- `current`: 只在对应平台使用。
- `mainstream`: 可以谨慎使用。
- `stale`: 禁止自动使用。
- `ironic`: 禁止自动使用。
- `platform-bound`: 只在对应平台使用。
- `needs-check`: 查证前不用。

修改观察表后必须运行：

```bash
node natural-chinese-copy-core/scripts/validate_slang_observations.mjs --file natural-chinese-copy-core/references/slang_observations_2026.jsonl
```

## 5. 语义替换

网络词不用时，不要硬换同义网络词。先还原它的语用功能：

- 表示惊讶：写具体意外点。
- 表示认同：写具体赞同哪一步。
- 表示吐槽：写具体哪里别扭。
- 表示轻松推荐：写具体省了什么事。
- 表示反讽：除非用户要求，不自动使用。

## 6. 文案自检

1. 这个词现在还新吗？
2. 目标读者会不会觉得土？
3. 离开平台语境还能懂吗？
4. 有没有遮住事实？
5. 用户有没有要求这种语体？

任意一项不确定，改成普通自然中文。
