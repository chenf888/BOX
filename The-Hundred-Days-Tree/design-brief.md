# Design Brief — The-Hundred-Days-Tree《百日誓师》

> **Status: 待用户确认（Stage 2 门）。** 本文先于任何代码；每一处与技能默认值的偏离都在 §10 落账。
> 参照资产：`assets/blueprints.json` (medium)、`assets/balance-defaults.json`、`assets/fun-quota.json`、`assets/type-registry.json`。

## 1. Identity

| Field | Value |
|---|---|
| Game name | The-Hundred-Days-Tree（显示名：**百日誓师**） |
| Author | chenf888 |
| Points name (`modInfo.pointsName`) | 时间 |
| Language mode (Q7) | **T1 单语言·中文**（题库本身即中文高考题，翻译无收益） |
| Default language | 中文（T1 下无切换） |
| One-line pitch | 把树的基础分数换成真实的 24 小时制时钟：一名高三普通学生在百日誓师之后的每一天——按时上课签到、课间真题抢答、晚修押题抽卡，100 个真实日夜后走进考场。 |

**核心机制（Q-sync，用户原话：严格实时）**：游戏时钟＝电脑真实时钟，逐秒同步。一天＝真实一天；5:40 起床 → 22:20 晚修结束按真实课表推进；22:20–5:40 为睡眠时段；5:40 自动翻入新的一天，倒计时 −1。首玩日＝誓师日＝第 1 天，第 100 天触发高考终局。

## 2. Interview record — the question ledger（问答台账）

| # | Question | Answer（用户原话/确认） | Locked parameter |
|---|---|---|---|
| S0 | 主题 | 「将tree基础分数改为时间（24小时制）与现实同步，游戏内容为中国高三百日誓师后普通学生的一天」＋完整课表 | feeds Q1 |
| Q1 | 三行结构确认 | 「确认如所述」 | 主题=结构映射 §3 |
| Q-sync | 「与现实同步」的含义 | 「严格实时，可以在每一节课之间添加真实题目或知识」 | 时钟＝真实时钟；课间题库机制 |
| 日程结构 | 22:20 之后 | 「每日循环→高考」 | 睡觉＝日切换；倒计时递减；高考终局 |
| Q2 | 体量 | 「Medium（10–16 层，10–30h）」 | blueprint `medium`（结构沿用；数值因硬上限+实时而偏离，见 §10） |
| 题目定位 | 课间真实题目 | 「随机题库（量大）」：每科 30+ 题共 180+，每日随机抽答记熟练度，长期影响分数上限加成 | 题库规格 §4b/附录 A |
| Q3 | 天花板 | 「硬上限 (推荐)」 | 单科 150 / 总分 750 / 每日 24h（P8a Gaokao 模式，`softcap(x,cap,0)`） |
| Q4 | 互动节奏 | 「课间主动＋上课挂机 (推荐)」 | 上课自动积累，课间/作息主动窗口 |
| Q4b | 游戏类型 | 路由 exit-3 原话询问 → 用户选「active-click 离散操作 (推荐)」→ `--explicit` 重跑 confidence 0.75 / margin 0.535 | type `active-click`，契约 §2b |
| Q4b-修饰 | 风味修饰符 | 1/2「无」；2/2「gacha 抽卡」 | M13 押题抽卡（挂晚修层）；score-attack/minigame/boss-rush/casino/story 未选（§10 落账） |
| Q4b-结构 | 结构修饰符推导 | 「确认推导」 | sim=有（真实时钟 tick）；challenges=有（Q5）；caps=有（Q3）；board=无 |
| Q5 | 侧内容 | 「Standard」 | 挑战(M1)＋成就；无剧情侧层（誓师面板为 P13 元进度侧层，非剧情层） |
| Q6 | 自动化节奏 | 「经典节奏 (推荐)」4–6 步阶梯；签到与答题永远手动 | 自动化阶梯 §6 |
| Q7 | 语言 | 「T1 单语言·中文」＋默认「中文」 | 全中文，无 i18n 层 |
| Q8 | 终局风味 | 「消耗式重置 (推荐)」 | M19 消耗式「走进考场」 |
| 倒计时锚 | 通关周期 | 「百日叙事」：首玩日=誓师日，第 100 天高考 | 天数锚定 §7 |
| 题目难度 | 题库分布 | 「真题梯度」基础 40% / 中档 40% / 压轴 20% | 附录 A |
| 游戏名 | — | 「The-Hundred-Days-Tree」 | 文件夹与 modInfo.id |
| 作者 | — | 「chenf888」 | scaffold `--author` |
| 错过时段 | 出席制 | 「出席制」：需上线签到才算出勤，缺席科目当天收益打折 | 缺席补结 ×0.3（比例待确认，§10 开放问题 OQ-2） |

**Q1 三行复述（用户确认「如所述」）：**

- **货币**：主货币＝时间本身（24 小时制时钟，自 5:40 起走动，严格实时同步）；课堂把时间转化为专注与各科知识/分数；距高考天数（百日倒计时）作长线记分。
- **拓扑**：按时间表逐节点解锁——作息活动与六个科目层；限时训练/错题整理/晚修作高难或机制内容；睡觉＝日切换重置环。
- **天花板**：单科 150 / 总分 750 / 每日 24 小时 / 倒计时 ≥0。

## 2b. Game type profile（Q4b）

| Field | Value |
|---|---|
| Type | **active-click**（离散操作：签到、答题、作息活动、抽卡全是「一次一下」的动词） |
| User confirmation | 「active-click 离散操作 (推荐)」（exit-3 原话询问后选定，`--explicit active-click` 复核 0.75/0.535） |
| Confidence + margin | 0.75 / 0.535 |
| 强制组件 | clickables 全部定义 `canClick()`+`onClick()`；状态在 `startData()` 初始化；状态用 number/string 不用 Decimal（硬规则 11）；T-CLICKABLE 生效 |
| 禁止组件 | —（active-click 无禁用项；grid 不用） |
| 豁免规则 | 无（passive-prestige 的 D-NOUPDATE 豁免不适用——本作有真实 tick，update() 大量使用且必须全部保真） |

**Modifiers**：

| Modifier | Requires | Included? | Notes |
|---|---|---|---|
| `sim` | — | ✅（推导确认） | 真实时钟 tick；type:"custom" 于科目层/作息层/高考层（≤3 层预算内：chi…六科同构模板 + life + gk —— **custom 层为同构模板复用，非独立手写系统**） |
| `score-attack` (M2) | active-* + sim | ❌ 用户未选 | §10 |
| `minigame` (M3) | active-* | ❌ 用户未选 | 答题/错题重做是独立内容机制，不按 M3 打包 |
| `boss-rush` (M12) | active-* + sim | ❌ 用户未选 | — |
| `gacha` (M13) | active-* | ✅ 用户选定 | **「押题卷」挂晚修层 microtab**；buff-bus 数组在 eve.startData 声明（D-GACHADATA，尺寸=池上限+1） |
| `casino` (M14) | active-* | ❌ 用户未选 | — |
| `story` (M15) | — | ❌ 用户未选 | 誓师面板是倒计时/统计 dashboard，不含章节剧情 |
| `board` | — | ❌ 推导 | 无 2D 棋盘需求 |
| `challenges` (M1) | — | ✅（Q5 Standard） | canComplete() 方言（45/57 corpus 多数派） |
| `caps` | — | ✅（Q3 硬上限） | `softcap(x, 150, 0)` 形式 |

## 3. Theme = structure mapping（P14）

| 现实概念 | 树结构 |
|---|---|
| 课表时段（早读/第一节/…/晚修四） | 当前时段函数 `currentPeriod()`：决定专注流向哪科、哪个活动开放、签到窗口 |
| 时间本身 | 基础分数 `player.points`＝今日 00:00 起秒数，逐秒对齐真实时钟；主显示覆写为 HH:MM:SS＋当前时段＋倒计时 |
| 六门课 | 六个科目层（P8a custom，同构模板、参数各异）：掌握 → 派生分数，硬帽 150 |
| 起床/跑操/三餐/午休 | 作息层：精力经济（bar＋活动 clickables），就寝结算元气 |
| 限时训练（16:30–17:10） | 挑战层：真实时限内刷分的 M1 挑战 ×4 |
| 晚修（18:15–22:20） | static 自习层（P5 楼层）＋押题抽卡（M13）＋自动化阶梯主场 |
| 错题本 | 错题层：错题池→重做小玩法→吃透转化 |
| 高考 | row-3 capstone：M7 考试仪式层＋M19 消耗式「走进考场」 |
| 百日誓师 | 侧层 dashboard：倒计时、誓师宣言、今日格言、统计 |

**差异化声明**（对参照作 Gaokao Tree）：它没有实时概念——本作的「节奏」是真实课表本身；它的科目随时可刷——本作科目产出被时段与出勤门控。

## 4. Layer chain table（自底向上；代码生成合同）

> 同构说明：六科层由**同一模板 + 每科参数表**生成（速度/解锁时段/特色升级不同），不是六份独立手写代码——防止「生成器两条代码路径」事故（F 类教训）。

| id | name | row | pos | type | base resource → baseAmount | requires | exp | upgrades | milestones | challenges | buyables | automation granted（哪个层的哪个里程碑） | softcap plan | doReset keeps | branches |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| chi | 语文 | 0 | 0 | custom (P8a) | 语文专注 `player.chi.att` → 本节积累 | **0**（随时可结算，Gaokao chi 先例） | — | 10（5×2） | 4 | — | 1（教辅·五年高考） | eve m3: autoPrestige(下课自动结算)；eve m4: autoUpgrade | 分数 120 起软帽 power 0.5→0.1，**熟练度推迟帽点，硬帽 150 power 0** | resetsNothing=true（分数永不重置） | — |
| mat | 数学 | 0 | 1 | custom | 数学专注 | 0 | — | 10 | 4 | — | 1（错题教辅联动） | 同上（同构） | 同构 | resetsNothing | — |
| eng | 英语 | 0 | 2 | custom | 英语专注 | 0 | — | 10 | 4 | — | 1 | 同上 | 同构 | resetsNothing | — |
| phy | 物理 | 1 | 0 | custom | 物理专注 | 0（**解锁门槛**：首次物理课 10:15 到达） | — | 10 | 4 | — | 1 | 同上 | 同构 | resetsNothing | — |
| chem | 化学 | 1 | 1 | custom | 化学专注 | 0（11:05 解锁） | — | 10 | 4 | — | 1 | 同上 | 同构 | resetsNothing | — |
| bio | 生物 | 1 | 2 | custom | 生物专注 | 0（14:00 解锁） | — | 10 | 4 | — | 1 | 同上 | 同构 | resetsNothing | — |
| life | 作息 | 1 | 3 | custom | 今日作息恢复累计 `player.life.rested` | 0（首日即用） | — | 10 | 5 | — | **2**（营养品/闹钟——**autoBuyable driver 目标**，P54 闭式 buyMax；消费者=六科效率公式读 `buyableEffect('life',id)`，N-BUYABLEDEAD ✓） | eve m0: resetsNothing（就寝不清元气）；eve m1: passiveGeneration（自习补精力） | 精力上限 100 硬帽（营养品可提升上限，cap 提升可见——作者 #12 教义） | vigour 跨日保留；gk 终局重置时清 | — |
| train | 限时训练 | 2 | 0 | none | —（挑战容器） | 解锁门槛：任一科分数 ≥ 60 | — | 6 | 3 | **4**（语/数/英/理综模拟；canComplete 目标=挑战内 update() 自增的得分——D-CHALOWNRES 合法变体 B；nerf 经 inChallenge() 注入旧层公式 P16） | — | — | — | 挑战完成记录不清（keep completions） | — |
| wrong | 错题本 | 2 | 1 | none | — | 解锁门槛：累计错题 ≥ 5 | — | 8 | 3 | — | — | — | 错题池无上限（天然受产出限制） | 升级跨日保留 | — |
| eve | 晚修 | 2 | 2 | **static** (P5) | 晚修专注 `player.eve.att` | 解锁门槛：第一次晚修（18:15 后） | 1, **base 2**, roundUpCost, canBuyMax()（由本层升级解锁——作者 #24 static 早 buyMax） | 8 | **8**（自动化阶梯主场） | — | 2（押题券兑换/自习加成） | 见 §6 全表 | 楼层为计数（floor count），无 runaway | completions/buyables/`yzBuff`/`yzVal`（D-GACHADATA）跨日保留 | — |
| gk | 高考 | 3 | 0 | custom (M7+M19) | 六科分数快照 → baseAmount()=Σmin(score,150) | 解锁门槛：**第 100 天（锁死，OQ-4）** | — | 25（5×5 模考商店） | 10（capstone 链） | — | — | — | 总分 = Σ六科，750 硬帽 | **M19 消耗式**：走进考场燃烧六科掌握/分数/熟练度/错题/普通升级（清单化 UI）；保留：成就、天数、「录取通知书」NG+ 奖励 | — |
| oath | 誓师·倒计时 | side | — | none | — | — | — | 0 | 0 | — | — | — | — | — | P13 dashboard：倒计时 X/100、誓师宣言、今日格言、出勤/答题统计 |
| a | 成就 | side | — | none | — | — | — | — | — | — | — | P11 后备自动化路径（!hasUpgrade/!hasMilestone 守卫） | — | — | 50 个普通学生日常成就，5×10 grid，含显式 X/50 计数行 |
| stats | 统计 | side | — | none | — | — | — | — | — | — | — | — | — | — | 出勤率/答题正确率/总学习时长/历史最高总分 |

**共 11 主层 + 3 侧层（medium 蓝图 10–16 ✓）。**

### 科目层模板（六科同构，参数表驱动）

```
player.<subj> = { points: 掌握(跨日), total: 累计掌握(升级货币,可花费), att: 本节专注池,
                  best: 引擎自动, mastery: 熟练度(答题累积), scoreShown: 派生 }
当前时段 = 该科课 → update(): att += 速率(精力系数×升级乘量×出勤系数) × diff
prestige「下课结算」: gain = f(att × 效率) → points += gain; att 归零; total 累计
分数显示 points() = 100×log10(1+掌握)/log10(1+基准) 形式的派生链 → 120 软帽(0.5) → 135 软帽(0.1) → 150 硬帽(0)
熟练度每级推迟软帽起点（K5 cap-play：0-10 级 → 软帽点 120→150）；掌握不消费，升级花 total
```

> 经济语义：**本节专注 att（日内池）→ 下课结算 → 掌握 points（长期）+ total（升级货币）**；分数是掌握的派生显示，永不因消费倒退。`total` 花费降的是升级货币，不是分数——与「分数是最终成果」的主题一致。

## 4.1 Fun density table（每层效果种类规划）

| id | 内容件数 (U+M+C+B+click) | effect-kind plan（≥3 非 K1/层；K1 ≤ 40%） | organization | mechanics |
|---|---|---|---|---|
| chi | 10U+4M+1B+签到click | u11 早读加成(K3←oath 时段)、u12 掌握自形(K2 ^0.5)、u13 熟练度^K4(具名「语感」)、u15 解锁(K7)、M2 全勤奖励(K6)、B 教辅(K1) | tabFormat：时钟/结算/课间；microtabs：升级\|里程碑\|教辅 | M5(专注池)、签到动词 |
| mat | 同构+错题联动(K3←wrong) | …u「错题反哺」K3、u「压轴手感」K4 | 同构 | 同构+错题经济 |
| eng | 同构 | u「早读狂热」K6(仅早读时段)… | 同构 | 同构 |
| phy/chem/bio | 同构 | 理综联动 K3（晚修三·理综三科同结算） | 同构 | 同构 |
| life | 10U+5M+2B+4活动click+精力bar | 活动按钮(K8 产出精力)、u「生物钟」K5(精力上限)、u「深度睡眠」K4(恢复^1.1) | tabFormat：精力条/活动/就寝 | **M4 bar+clickable**、M5(精力) |
| train | 6U+3M+4C | 挑战 nerf=K6 注入、奖励=hasChallenge 乘量(K1 少量)+K4 | tabFormat：挑战格 2×2 | **M1 经典挑战** |
| wrong | 8U+3M+重做click | 重做=K6、u「错而复得」K3(→各科)、「吃透」K5(熟练度加成) | tabFormat：错题池/重做/升级 | M5(错题货币)+M10(收集) |
| eve | 8U+8M+2B+抽卡click | 楼层 static 语义、u「自习纪律」K2、押题 buff bus(K9 状态) | microtabs：自习\|**押题**\|里程碑 | **P5 static、M13 gacha、自动化主场** |
| gk | 25U+10M | 模考商店 K4/K5 为主（商店=多样性，M8 先例）、M19 燃烧清单(K9) | tabFormat：倒计时/模考/考场 | **M7 仪式层、M19 消耗式终局、M8 商店** |
| oath | 倒计时面板 | — | 展示层 | P13 dashboard |
| a | 50 成就 | 奖励=全局乘量+1 条自动化后备（P11 守卫） | X/50 计数行 | M10 |

## 4b. Game-level fun plan（对 fun-quota.json `medium` 行）

| Quota (medium) | Planned | Where |
|---|---|---|
| Distinct mechanics ≥4 | **7**：M1 挑战、M4 bar+clickable、M5 副货币(精力/错题)、M7 仪式层、M8 商店、M13 gacha、M19 消耗式终局 | §4.1 各行 |
| Challenge layer (M1/M2) | M1 ×4 挑战 | train |
| Clickable group(s) ≥1 | **4 组**：签到、题库答题(A/B/C/D)、作息活动、押题/错题重做 | 各层 |
| Bar(s) ≥1 | **2**：精力条、课堂进度条 | life / oath |
| Layers with update() ≥3 | **≥10**（六科同构+life+eve+wrong+gk+oath——全部保真 `new Decimal(diff)` 归一，D-DIFFNUM 自查） | 全树 |
| Secondary currency ≥1 | **2**：精力、错题（另每科 att 池） | life / wrong |
| Shop layer (M8) | gk 模考商店 | gk |
| autoBuyableDrivers ≥1 | life 营养品（P54 闭式 buyMax；消费者=六科效率公式） | life |
| K1 share ≤40%/层 | 每层效果表已按 K2/K3/K4/K5/K6/K7/K9 轮配 | §4.1 |
| Gacha bus 数组（D-GACHADATA） | `eve.startData: yzBuff[7], yzVal[7]`（池 6+1） | eve |

## 5. Tree sketch

```
row3:                     [ gk 高考 ]
row2:    [ train 限时训练 ] [ wrong 错题本 ] [ eve 晚修 ]
row1:    [ phy 物理 ] [ chem 化学 ] [ bio 生物 ] [ life 作息 ]
row0:    [ chi 语文 ] [ mat 数学 ] [ eng 英语 ]
side:    (oath 誓师·倒计时) (a 成就) (stats 统计)
```

## 6. Automation ladder（P4 顺序；经典节奏 4–6 步 → 取 6 步）

| Step | Grants（消灭哪件家务） | Granted by | Threshold |
|---|---|---|---|
| 1 | resetsNothing：就寝不再清元气/就寝奖励（life） | eve m0 | 自习楼层 ≥ 4 |
| 2 | passiveGeneration：科目基础听课积累（离线/不在场也有 30% 底效率——**与出席制并存**：签到仍是 ×1.0 全效率的唯一来源） | eve m1 | 楼层 ≥ 8 |
| 3 | autoPrestige：下课自动结算（缺勤折扣依旧；全勤手按仍最优） | eve m3 | 楼层 ≥ 16 |
| 4 | autoUpgrade：科目 total 升级自动购买 | eve m4 | 楼层 ≥ 32 |
| 5 | **autoBuyable**：life 营养品闭式 buyMax（P54） | eve m5 | 楼层 ≥ 64 |
| 6 | autoPrestige+autoUpgrade+resetsNothing 打包（就寝自动化：22:20 自动结算当日作息） | gk m3 | 模考积分档位 |

> 签到与答题**永远手动**（Q6 用户确认）——自动化的边界即出席制的边界。
> 成就侧后备路径（P11）：a 层 3 个成就以 `!hasUpgrade/!hasMilestone` 守卫回填 eve m1/m3、life resetsNothing。

## 7. Endgame definition（Q8＝消耗式重置）

- **倒计时**：`day = 1 + 已过誓师日次数`；`倒计时 = 100 − day + 1`；每天 5:40 自动 +1（含玩家离线——真实日历）。
- `gk` 解锁：**仅第 100 天**（OQ-4 锁死，不可提前交卷）；第 1–99 天的 gk 页显示倒计时与模考排名预测（纯氛围+小奖励）。
- **走进考场（M19 消耗式）**：进场瞬间对六科分数/熟练度/错题/普通升级做**清单化燃烧**（UI 逐项列出「语文 128 分 → 已上缴」），按燃烧总量结算高考总分（上限 750）。
- `isEndgame()`：完成走进考场（gk.customState.examDone = true）。
- **结局分档**（winText 按总分）：750 满分状元 / ≥700 顶尖 / ≥600 重点 / ≥500 本科 / ≥400 大专 / <400 **复读**（= NG+：M9 式保留「录取通知书」纪念与少量全局加成，重开百日）。
- **可达性**（真实日历语义）：通关周期＝真实 100 天（Q2 的「10–30h」在此主题下被「百日叙事」覆盖——见 §10 D-3）。中途每日 active 时长 ≈ 课间碎片 15–30 分钟。
- `winText`：「六月的考场上，你放下了笔。（高考总分 XXX）」＋分档评语。

## 8. Cap table（每货币天花板）

| Currency | Ceiling? | Cap mechanism | Where |
|---|---|---|---|
| 时间（points） | 是（每日 86400s） | 时钟语义自然封顶；跨 0:00 归零重计（天数在 5:40 翻转，与时钟解耦） | mod.js 时钟对齐函数 |
| 六科分数 | **是，150** | `points()` 派生链：120 软帽(0.5) → 135 软帽(0.1) → 150 **硬帽 power 0**；熟练度把软帽起点从 120 推向 150（K5，可见——作者 #12 教义） | 各科 `points()` |
| 总分 | **是，750** | 六科分数之和，gk 层读取 | gk baseAmount |
| 精力 | 是，100（营养品+上限，可见） | 硬帽 | life |
| 掌握/元气/错题/楼层 | 否 | 成本阶梯塑形（作者 #6：cost scaling first）；无 runaway 回路（掌握→分数是单调派生，无自馈） | — |

> 本作**没有指数自馈回路**（掌握不喂回专注速率的循环被切断：专注速率只受精力/出勤/升级影响，升级花 total 不花掌握）——P12 软帽仅在分数派生链上出现（主题硬帽）。

## 9. Self-check results（23 项）

- [x] 1 — requires 阶梯：科目层 requires=0（P8a Gaokao 先例，corpus 真实 8.0 分游戏同形）；机制层（train/wrong/eve/gk）用**天数/分数/错题计数门槛**单调递进。×10–×100 比值检查对 requires=0 分数层 **N/A**（§10 D-1 落账）
- [x] 2 — 首层 2–10：科目结算随时可按（requires 0 语义下「首声望 <1 分钟」精神满足；首升级 cost≈10 att 约 2 分钟）
- [x] 3 — 每主层 ≥10 升级 + ≥3 里程碑：科目 10U+4M ✓；life 10+5 ✓；train 6U+3M（挑战容器，低于 10U——§10 D-2：内容件数=6U+4C+3M=13 件 ≥8–30 密度带）；wrong 8U+3M（+重做玩法，件数 12）；eve 8U+8M+2B=18 ✓；gk 25U+10M ✓
- [x] 4 — P10 网：每层 gainMult 列出 ≥2 个更旧层（六科互boost+chi 锚；life→六科；train/wrong/eve→全科+chi）；每科 ≥1 升级 boost chi（「通用学习法」）；六科任一掌握喂 chi 专注速率（「审题能力」）
- [x] 5 — 自动化 6 步 P4 顺序（含 step5 autoBuyable+P54）+ P11 成就后备；无一里程碑多授（§6 表无重复授权）
- [x] 6 — 软帽计划：见 §8（唯一无界值均无自馈回路，成本塑形即可）
- [x] 7 — 反模式扫 A1–A10：A1 无（门槛单调）；A2 行号连续 0-3+side ✓；A3 无（11 主层）；A4 密度见 D-2 说明；A5 无（有 row2+自动化）；A6 机制 7 种>4 配额；A7 锚定 chi（P10）；A8 一步一家务；A9 公式 Shift 展示（P17：分数派生链、效率公式 on-Shift）；A10 全 Decimal、无 ExpantaNum
- [x] 8 — K1 配额：每层 ≤40%，非 K1 ≥3 种（§4.1）
- [x] 9 — 组织：每主层 tabFormat；≥3 内容组层上 microtabs（科目 3 组、eve 3 组、gk 3 组）；上下文 display-text（当前时段/出勤状态/软帽预警/倒计时）在页首
- [x] 10 — 游戏级配额（§4b 表）：7 机制 ≥4 ✓；挑战/点击组/条/副货币/商店/autoBuyable 全达标
- [x] 11 — 乘区预算：**全游戏 ≤1 个自形升级/层（^0.5，仅在科目层）；Σ 自形指数 0.5 < 0.6**；无指数自馈回路（§8）；乘区皆小（×1.5–×3/件）且产出端日清零——终局面乘积受 750 硬帽物理封顶，ladder-fiction 不适用
- [x] 12 — 接线计划：每升级在 §4/§4.1 标注 token/gate 或 value+消费者（生成时逐条执行 N-UNWIRED）
- [x] 13 — 成本阶梯：科目升级 cost 走 total（每日产出量级），跨度 ≥3 orders（D-COSTSPAN 阈值）；关键 drop=每科第 5 件「教辅解锁」刻意便宜；pow/log 形状 ≥30%（§4.1 K2/K4）
- [x] 14 — 组件密度 8–30/层 ✓（train/wrong 见 D-2）；挑战 4 ≤ 15%×科目升级数 ✓（挑战集中容器层，四挑战 vs 全游戏 110 升级 = 3.6%）
- [x] 15 — 作者节奏：进游戏 10 秒内可签到/可答题（首 boost ✓）；下课结算 >1 分钟必有所得（att 全勤必产出）；睡觉=大重置，次日精力加成第一秒生效；**无任何硬重置**（复读是 M9 自愿 NG+）
- [x] 16 — 升级纪律：一件升级一个产出加成（≤2 且跨不同资源）；无升级藏叠另一升级；全部门槛解锁（无付费墙 N-UNLOCKPAYGATE：train/wrong/eve/gk 均为 threshold gate）
- [x] 17 — cost before softcap：分数派生链的帽是主题帽（150）非塑形帽；升级帽点提升=熟练度玩法，帽位显示在页首（可见 ✓）
- [x] 18 — 行节奏两常数：**N/A——本作「行推进」由真实日历驱动**（1 天=1 真实天，无指数 ladder 可调；模拟器量「每日产出曲线」代替 rows-per-hour）。§10 D-3 落账
- [x] 19 — 重置生命周期：科目层 best/total 全保留（resetsNothing）；life vigour 跨日；eve completions+gacha 数组跨日；**update() 对 player.points 的时钟对齐写入 = N-POINTSWRITE 书面接受**（§9.1：points 语义=真实时间，非生产回路，无 runaway 可能）；static eve 有 canBuyMax ✓；所有 doReset 带行守卫（`row > this.row` 原版守卫，接力树 D15 教训）
- [x] 20 — 类型契约：active-click 强制件全计划（canClick/onClick/startData 初始化/number 状态）；无禁用件；gacha 依赖（clickable 写 bus 数组）成立；D-GACHADATA 声明计划 ✓
- [x] 21 — 测量计划：**`js/tuning.js` 暴露 `TMT_NOW()` 时钟钩子**（默认 Date.now，模拟器覆写虚拟时钟）＋全部节奏常数（速率/折扣/帽点/精力表）集中于 tuning.js，游戏与模拟器共读；模拟策略=虚拟 100 天跑（签到/答题按时自动触发）
- [x] 22 — 问答台账：S0/Q1/Q2/Q3/Q4/Q4b(type+修饰×2)/Q5/Q6/Q7/Q8 + 扩展行（Q-sync/日程结构/题目定位/难度/倒计时锚/游戏名/作者/错过时段）**全部有行**，无空白
- [x] 23 — buyable 持久性：life 营养品消费者=六科效率公式（跨层 ✓）；教辅 buyable 消费者=下一行层公式；autoBuyable driver ≥1 ✓；无 `+1/tick` 反形（P54 闭式）

## 9.1 Static-warning acceptance（Stage 5 后填写）

| Check | Layers | Why accepted (or: fixed — how) |
|---|---|---|
| N-POINTSWRITE（预期） | mod.js | 时钟对齐是本作核心机制：player.points 语义=真实时间而非生产回路；对齐为幂等赋值，无 runaway 可能 |
| D-REQLADDER / D-REQRATIO（预期） | 六科 | requires=0 为 P8a Gaokao 模式（corpus 8.0 分先例）；机制层用天数/计数门槛 |
| N-BUYABLEDEAD ×7 | 六科 + eve | checker 只认字面 `getBuyableAmount("chi", 11)` 形态；六科教辅实际由 `subjectAccrualMult(id)` 以动态 id 消费、life 营养品/闹钟由 `globalAttMult` 跨层消费（checker 可见不计）、eve 加练卷被 eve 自身 update rate 消费、押题券包=tickets 生产者（gacha clickable 消费）。活性消费者全部在代码中，属 checker 静态视野限制 → 接受 |
| N-AUTOWIPE ×7 | 六科 + eve | resetsNothing() 恒 true 无里程碑门 = 本作重置架构基石（日常下课结算永不级联；燃烧只在 gk onPrestige 手动执行，见 §7/架构注记）。防滥用由三重门承担：canReset（att≥1 / 高考日）+ autoPrestige 内字面 `hasMilestone("eve", 3)` + onPrestige 手动清池。若给 resetsNothing 加条件门，引擎 doReset 级联反而可能在结算日误放行 → 接受 |
| D-LOCALWIRE ×2 | gk, life | 货架型层的效果全部外接：gk 商店 → tuning.gkSettleMult/gkVigourMult + energyMax/quizOptClick/duds/procSpeed/train rate/rollover 12+ 消费点；life 14/24 → energyLowLine/energyFactor。现实隐喻：买的是「文具/用品」，改变的是上课状态而非商店本身。乘区汇聚点在六科（六科 gainMult 全接满）→ 接受 |
| D-EFFECTMONO ×3 | gk, life, wrong | 货架型层升级 = 平坦乘区是 §4.1 的可读性决定（一件用品=固定小提升）；数值深度在六科乘区与软帽曲线（settle pow 0.7、score softcap 0.4、教辅 1.15^x）→ 接受 |
| D-EFFECTSHAPE ×1 | gk | 同 D-EFFECTMONO；gk 41/42/45 实为软帽起点/熟练度帽/护体等非纯乘区效果，checker 按多数字面归类 → 接受 |
| D-UPDATELOCK ×1 | gk | **已修（2026-10-31）**：update() 首行加 `if (!player.gk.unlocked) return` 守卫（P64 防御习惯），复检该条消失 |

## 10. Deviations & open questions

**D-偏离账：**

| # | Default overridden | Value used | Why |
|---|---|---|---|
| D-1 | blueprints.medium 数值面（requires ×10–×100 指数阶梯、指数声望 0.5→0.25） | P8a Gaokao 模式：分数层 custom+requires 0+硬帽 150；机制层天数门槛 | Q3 硬上限 + 严格实时；`blueprints.json.selectionRules.ceilingOverride` 明文授权 |
| D-2 | train 6U / wrong 8U 低于「每主层 ≥10U」字面 | 内容件数 13/12（含 4 挑战、重做玩法）在 8–30 密度带内 | 挑战容器与错题玩法的动词在 clickables/challenges，不在升级格 |
| D-3 | Q2「10–30h」游玩时长 | **通关周期=真实 100 天**，每日主动 15–30 分钟 | 「百日叙事」是用户明选（Q-倒计时锚）；Medium 蓝图的结构面（层数/密度/自动化/终局链）全部保留 |
| D-4 | offlineLimit 1h 默认 | 保持 1h 但**不构成惩罚**：时钟对齐绕过 diff 积累，离线=时间照过，缺席按补结折扣 | 时钟同步架构 |
| D-5 | mod.js update() 写 player.points（N-POINTSWRITE） | 接受并书面记录 | 见 §9.1 |
| D-6 | 题型含默写填空/数值填空 | **184 题全部四选一**（含默写类改为「四选一默写选项」） | 抢答 UI 只有 4 个 clickable 选项位（quizOptClick 21–24）；逐题核验 + 选项重排（答案分布均匀化）已做 |
| D-7 | OQ-2「×0.3 补结语义在结算端」 | 补结折扣落在**积累端**（absentFloor() 作为 rate 乘区 0.3→m1 后 0.5） | 与「专注随时间积累」的实时架构一致；结算端无时间轴可补 |
| D-8 | 精力/休息/错题池挂层名下 | player.energy / player.rested / player.wrongPool / player.wrongLog 为全局值（addedPlayerData） | 跨层消费（tree 扣耗、life 结算、wrong 消化、树页显示）需要单一数据源；规避 D-TMPPOINTS 类层属性外读风险 |
| D-9 | 模板文件不可动 | **两处引擎 diff（用户已授权「允许修改模板文件」）**：① js/technical/systemComponents.js——displayThings 顶部资源条 span 包 `!modInfo.hidePointsDisplay &&`（F7：英文硬编码「You have X 时间」让位于时钟展示）；② index.html win 覆盖层中文化（D-9b）："Please check the Discord" 删除、"It took you…" 译为中文、"Play Again/Keep Going" → 「彻底重来（清空所有进度）/带着录取通知书继续」、移除两处硬编码 TMT Discord 链接（T1 中文） |
| D-10 | win 屏只在通关瞬间出现一次 | 复读 pay() 重置 oathDay0=今日、lastRollover=-1、player.keepGoing=false、tmp.gameEnded=false | 引擎 win 层条件 `tmp.gameEnded && !player.keepGoing`（game.js:328–336）：不复位 tmp.gameEnded 会在复读后回弹覆盖层，不复位 keepGoing 会让下一次高考不再弹终局屏——双向修复已浏览器实测 |

**重置架构注记（源码确认，game.js doReset）**：各层 resetsNothing() 恒 true + onPrestige 手动消耗池 → 日常结算零级联；gk 考试 doReset 中 onPrestige 先于 addPoints(gain) 执行，受害层 resetsNothing 拦截引擎级联，燃烧清单在 gk onPrestige 手写（掌握/专注/科目升级/楼层/押题 buff/错题池），引擎随后的 addPoints 把高考总分自动折入模考积分（接受为「成绩换商店额度」语义）。保留面：熟练度、笔记、元气、模考商店、成就、录取通知书。

**开放问题（OQ）——已全部裁定（2026-10-31 用户确认）：**

- **OQ-1** ✅「接受张力」：手勤全勤收益永远高于自动化（签到 ×1.0 vs 底效率 ×0.3），自动化只是下限保障。
- **OQ-2** ✅「×0.3」：缺席课的专注按 30% 自动补结。
- **OQ-3** ✅「<40」：精力 <40 触发犯困惩罚；惩罚力度未单独提出，按推荐值 **×0.5** 记录（最终确认门可否决）。
- **OQ-4** ✅「锁死第 100 天」：考场仅第 100 天开放，不可提前交卷；结局由届时分数决定；考后可自愿复读（M9 式 NG+）。

**游玩中发现数字不对 → §10 追行 → tuning.js 常数 → 模拟器重跑**（不做中途代码字面量修改）。

## 11. Stage-6 measured retune（2026-10-31 虚拟 100 天实测）

**模拟器结论**：--max-hours 2400（虚拟 100 天，勤勉玩家策略=按时签到+做满 5 活动+autoPrestige，无抢答/挑战/错题的下界）→ 第 99 天（gameDay0=99）高考日「走进考场」触发 → isEndgame 达成，**考试总分 base=750（满分结构精确达成）**；六科 10/10 升级、life 99 晚就寝+营养品 4+闹钟 2、eve 8 层+8 里程碑、train 3 升级、gk 商店 13/25（41–45 档 1e8+ 留给复读 NG+ —— 多周目长线成立）。wrong 层零 = 下界预期（错题池只来自抢答答错，模拟器无抢答策略）。

| # | Finding (measured) | Root cause | Fix, and where the constant lives |
|---|---|---|---|
| R-1 | 六科结算可被热键连发刷分：连发秒结收益 ≈ 等 40 分钟全结的 8 倍 | 结算曲线 (att/60)^0.7 为凹函数（p<1），子可加性 → 小步快结严格占优 | 新增 `TUNING.SETTLE_COOLDOWN: 60`（tuning.js）+ 六科 canReset 首行 `resetTime < 60` 门（引擎自维护 resetTime，game.js:351/360 源码确认）；冷却后连发收益 < 等满一节课，自然节奏占优 |
| R-2 | 一局只睡 1 次：usedToday 永不重置，作息活动 day 2 起全部失效 | 翻日块（tree-tab.update）漏清 life.usedToday（浏览器单日门禁测不出） | tree.js 翻日块加 `player.life.usedToday = []`；修复后 sleeps=99/99 晚、life m0–m3、营养品 4 级 |
| R-3 | train 升级经济死锁：成本挂 eve.att（2000/20000/1e5），但 eve autoPrestige 无条件烧光专注 | 楼层自动上楼与 train 升级共用一个池，自动方永远优先 | eve autoPrestige 加 `!hasMilestone("eve", 7)` 门（8 层里程碑达成前自动，之后专注归玩家取舍）；修复后 train 3 件全购 |
| R-4 | 高考总分 base=900 > 用户确认的 750 总帽 | 六科各 150 帽 ×6 = 900，与 750 矛盾（真实高考=语数英 150×3+理综 300） | **理综三科按 2/3 折入总分**（450→300）：subjectScore 保留 150 满分成长曲线（熟练度/软帽杠杆不失效），totalScore() 折算 + min 750；stats 面板与理综页签加折算说明 |
| R-5 | 模拟器对本作三处失真 | ①无虚拟时钟（真实凌晨=夜间时段全空转）②tree.js 被模板规则排除（本作 tree.js 有真逻辑）③tmp 垫片/poolFor 不认识本作用到的引擎形态 | tools/simulate.js（游戏内副本）HDT-ADAPT 块：__FAKETIME 虚拟时钟+oathDay0 注入、勤勉玩家策略（签到/活动/autoPrestige 驱动/resetTime 维护/守卫版 doReset）、解除 tree.js 排除、tmp.eve.nextAt 特判（3000×2^楼层）、poolFor 支持 currencyLocation()、报告加 byLayer 终态；上游值得回流（记 §12 待办） |

（模拟器口径：虚拟时钟 100 天全速跑，`--probe gk` 看终局门富余；节奏量=每日产出曲线+首结算时刻，非小时总时长。）

## 12. Browser-verification fixes（Stage 6.5 后填写）

| # | Symptom | Root cause | Fix |
|---|---|---|---|
| B-1 | gk 商店 25 槽全空渲染（ARIA 快照只见微页签按钮无内容） | upgrades 组件的数组参数是「行号」不是升级 ID（components.js `v-for="row in data"`） | gk.js 五个微页签改 `["upgrades", [N]]` 行号引用 + 注释防复发 |
| B-2 | N-UNWIRED FAIL：gk 31/32/33/34/44 定义 effect() 但消费者用硬编码常数 | 消费点分散 | 单点化 gkSettleMult/gkVigourMult 进 tuning.js（跨层接线之家；放 gk.js 层 span 外 checker 不可见） |
| B-3 | 成就 73–75 崩溃 some is not a function | player.train.challenges 是 `{挑战id: 次数}` 对象（game.js:295 completeChallenge 语义） | side.js 改 Object.keys 语义读取 |
| B-4 | 复读后 win 层回弹 + 下次高考不再弹 | tmp.gameEnded 残留 + keepGoing 未复位（game.js:328–336） | 复读 pay() 复位 oathDay0/lastRollover/keepGoing/tmp.gameEnded 四件套（实测 NG+ 回第 1 天） |
| B-5 | IAB 指针探测对 TMT 升级按钮 click 超时 | tooltip 内层遮挡 | 验收改走与 v-on:click 相同的引擎调用；按钮渲染态（.can）确认 UI 路径 |

**五项门结果（2026-10-31）**：①boot errors 0 ✓ ②15 主页签+全部微页签 sweep issues [] ✓ ③每类 prestige 一次实测——科目结算 23.2（att 3000 公式值）、就寝 vigour 4.18（=(100/50)^0.8×2×1.2 精确）、上楼 floor 1+m0、考试燃烧/win 屏/复读全链路（gk 门禁）、抢答 +30、签到 ✓ ④存档往返 PASS（楼层/元气/签到/模考积分跨 reload 保真）✓ ⑤console 清洁（boot 0+运行时 0）✓

**手感观察（feel，非调参信号）**：严格实时秒级对齐课表；FAKETIME 跳变不补积专注=挂机语义正确（缺席/离线按补结折扣不白给）；60s 结算冷却下手动热键课中 60s 后可用、下课 autoPrestige 兜底——「手勤优于挂机」张力保留；抢答 +30 专注带解析弹窗节奏合适；精力 day 1 全活动午后 ~70 晚修 ~50 不触犯困线、模拟 99 天长期 121 健康；750 满分结构与理综 2/3 折算在 stats/gk 有说明。

---

## 附录 A：题库规格（180+ 题，我出题并逐题核验）

**抽答机制**：每个课间（10 min 窗口）+ 大课间（25 min）自动弹出 1 题（科目=刚下课的科目轮换）；答对 → 该科 att+、熟练度+1；答错/不答 → 该科错题池 +1（错题重做可挽回）。每日 ≈ 10 题；同一题不重复直到当日科池抽尽。

**难度梯度（真题梯度 40/40/20）**：难度 1（基础）熟练度 +1；难度 2（中档）+2；难度 3（压轴）+3。熟练度 → 科目软帽点推迟 + 分数结算效率（每 10 级结算 ×1.1，上限 10 级后的收益递减 softcap）。

**题型（客观可判定）**：

| 科 | 题型 | 数量 |
|---|---|---|
| 语文 | 古诗文默写（填空）、文学常识（选择）、成语/病句（选择） | 32 |
| 数学 | 集合/复数/向量（选择）、函数/数列/立几（填空数值）、导数/圆锥曲线（填空数值） | 32 |
| 英语 | 语法选择、词汇辨析、短文填空单空 | 30 |
| 物理 | 力学/电磁学选择、数值填空 | 30 |
| 化学 | 选择（概念/推断/实验）、方程式配平数值 | 30 |
| 生物 | 选择（细胞/遗传/生态） | 30 |
| 合计 | | **184** |

**样题（供确认方向；全量在 Stage 4 生成于 `js/questions.js`，modFiles 注册）：**

1. 〔语文·难度1〕《劝学》中「不积跬步，无以至千里」的下两句是「____，____」。答案：不积小流，无以成江海
2. 〔数学·难度2〕等比数列 {aₙ} 中 a₁=3，公比 q=2，则 a₅ = ? 答案：48
3. 〔物理·难度2〕物体从静止自由下落 3 s（g 取 10 m/s²），下落高度为 ? 答案：45 m
4. 〔化学·难度3〕0.1 mol/L 的醋酸溶液 pH≈3，说明醋酸是____电解质（弱）；稀释 10 倍后 pH 变化____于 1（填「大/小」）。答案：弱；小

**正确性保证**：全部题目为可客观判定的确定性知识（默写/数值/单选），生成后逐题交叉核验；有争议表述直接弃题换题。

## 附录 B：QA 与工程要点（生成期纪律）

- 时钟钩子 `TMT_NOW()`（tuning.js）——模拟器唯一节奏权威（check 21）。
- 严格实时微门禁适配：测某时段行为时用 tuning.js 临时覆写 TMT_NOW（仅测试分支，上线路径只读真实时钟——覆写代码不进发布文件，或以 URL 参数 `?faketime=` 门控）。
- update() 内对 diff 只做数值算术（rate × diff），Decimal 只用于 addPoints/att 聚合（D-DIFFNUM 实测 PASS）；update() 首行统一 unlocked 守卫。
- 层顶层属性用花括号深度扫描自查（D-TMPPOINTS）：只读 `player.<id>.<x>` 与层内已定义 props。
- 成就计数行 X/50 显式渲染（Smallpox 反馈教训）。
- serve.js（no-store）本地服务；CSS `?v=N`。
- 保存键 `modInfo.id` 由 scaffold 生成后终身不变；跨 100 天存档为一级质量门（Stage 6.5 存档往返+模拟器 --save-at 注入）。
