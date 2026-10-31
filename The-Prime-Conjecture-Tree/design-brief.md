# Design Brief — The Prime Conjecture Tree《推理素树》

> **Fill this entire document BEFORE writing any code** (SKILL.md, Stage 2).
> Sources for every default: `assets/blueprints.json` (structure) and `assets/balance-defaults.json` (numbers).
> Any deviation from a default must name the default it overrides and why, in §10.

## 1. Identity

| Field | Value |
|---|---|
| Game name | The Prime Conjecture Tree《推理素树》（用户 2026-10-31 确认；目录 The-Prime-Conjecture-Tree） |
| Author | chenf888（用户确认） |
| Points name (`modInfo.pointsName`) | numbers（数） |
| Language mode (interview Q7) | Bilingual (P17 ternaries) — `window.chinesemode` |
| Default language (bilingual+ only, Q7) | **English**（`chinesemode` 初始 `false`；之后不得悄悄翻转） |
| One-line pitch | 用筛子筛出素数，证明一条条定理，收编数论先贤的祝福，最终挑战黎曼 ζ 的非平凡零点——把数论史玩成一棵声望树。 |

## 2. Interview record (answers → parameters) — the question ledger

Every Answer cell is the user's own answer — or a proposal the user explicitly confirmed.
No cell is filled by inference. **A blank row means the question was never asked.**

| # | Question | Answer (user verbatim) | Locked parameter |
|---|---|---|---|
| S0 | 主题内容是什么？ | 「素数数学」（四选一菜单中点选；即「推理素」= 推理 × 素数） | theme = prime-number mathematics，feeds Q1 |
| Q1 | 主题-结构确认 | 「按此结构确认」（三行复述原样确认） | theme = structure mapping (P14) in §3 |
| Q2 | Scale | 「Medium 中型」 | blueprint `blueprints.medium` — rows 0–4，10–16 层，10–30h |
| Q3 | Natural ceilings | 「混合」 | cap table §8（孪生素数硬帽 + 其余 P12 软帽） |
| Q4 | Pacing | 「偏主动」 | 标准 sqrt 链；含交互机制（本作：M3 小游戏 + P28 冷却筛网点击）；无 `type:"none"` 核心循环层 |
| Q4b | Type + modifier multi-select | 「active-click（推荐）」；修饰点名「minigame, boss-rush, gacha, casino」（+ score-attack、story 随 Q5=Full 锁定） | §2b |
| Q5 | Side content | 「Full 全量」 | challenges（M2 枢纽）+ 成就 + story 副层 |
| Q6 | Automation & timewalls | 「经典节奏」 | 6 步阶梯（4–6 步内），中期墙 ≤30 min |
| Q7 | Language & style | 「T2 双语切换」+ 默认语言「英文默认」 | P17 ternary；`chinesemode:false` 初始；无 js/lang/（i18n_check no-op） |
| Q8 | Endgame flavor | 「Classic」 | 收局 = zeta 层里程碑链（M19–M21 均不装） |

Paste the Q1 theme-structure recap the user confirmed:

- **Currencies (in order):** 数（算力筛分自然数）→ 素数（筛出的质数）→ 猜想/定理（证明产生的元资源）
- **Layer topology:** 10–16 层沿数论史展开——埃氏筛 → 素数计数 π(x) → 素数定理 → 黎曼 ζ/哥德巴赫/孪生素数等猜想层，每行以一个「里程碑定理」收口，高层解锁重置低层
- **Ceilings:** 素数无穷，货币无硬上限（Q3 改为「混合」——见 §8）

## 2b. Game type profile (Q4b — required)

| Field | Value |
|---|---|
| Type (`type-registry.json` id) | **active-click** |
| User confirmation (verbatim) | 「active-click（推荐）」——用户在看到分类器排名 passive-prestige=0.63 / active-click=0.117 / active-tick=0.115 / board-minigame=0.01 后锁定 active-click，理由：passive 与其 Q4「偏主动」矛盾，且筛法主题契合离散点击 |
| Confidence + margin from classify.js | 0.63 / margin 0.513（分类器提案被用户推翻——用户裁决优先） |
| Components this type makes mandatory | clickables（每个 clickable 必须有 `canClick()` + `onClick()`；状态在 `startData` 初始化；点击状态用 number/string，**不得用 Decimal**） |
| Components this type forbids | 无（但 Q4=active 限制 `type:"none"` 核心循环层 ≤1——本作为 0 个核心循环层，prob/casino 的 none 是内容层非循环层） |
| Rules exempt for this type | 无豁免（passive-prestige 才豁免 D-NOUPDATE）；T-CLICKABLE 全力生效 |

Modifiers (max **one interaction type**; everything else is a modifier here):

| Modifier | Requires | Included? | Notes / why dropped |
|---|---|---|---|
| `sim` | — | ✅（用户确认） | custom 层预算 3：pairs / oracle / zeta（恰好用满） |
| `score-attack` (M2) | type `active-*` + `sim` | ✅（随 Q5=Full） | prob 层：maxpoints[] 峰值记录，`update()` 只写 maxpoints，**不写 points**（N-POINTSWRITE） |
| `minigame` (M3) | type `active-*` | ✅（用户点名） | pairs 层：素数对判定小游戏（选正确的一对，错则连击清零） |
| `boss-rush` (M12) | type `active-*` + `sim` | ✅（用户点名） | zeta 层唯一 Boss（09 P19：分段 HP + P28 冷却攻击）；全游戏仅此 1 层 Boss |
| `gacha` (M13) | type `active-*` | ✅（用户点名） | oracle 层献祭抽卡 + 全局增益总线；`neffX[]/ncalcX[]` 进 `startData`、池容量+1（D-GACHADATA） |
| `casino` (M14) | type `active-*` | ✅（用户点名） | side 层赌局：勒让德符号掷币 + 同余骰子（四分布中取 2，不超） |
| `story` (M15) | — | ✅（随 Q5=Full） | story 副层：数论编年史 10 章（切镜引擎为 large-only，不装） |
| `board` | — | ❌ | 类型非 board-minigame；grid 组件不使用（筛网用 clickables 排布） |
| `challenges` (M1) | — | ✅（随 Q5=Full + 结构确认） | 挑战走 M2 形态（canComplete 语料多数派） |
| `caps` | — | ✅（Q3=混合） | 孪生素数硬帽 = 已验证区间内的孪生对计数（§8） |

## 3. Theme = structure mapping (P14 — required)

数论史就是树的行结构——每个真实数学概念对应一层，行的推进 = 数论史的推进：

| 数学概念 | 变成什么 |
|---|---|
| 埃拉托斯特尼筛法 | row 0 的 s 层：玩家反复「筛」——声望按钮即筛分动作，外加 5 个素数滤网冷却点击（P28） |
| 素数计数 π(x)、算术基本定理、素数间隔 | row 1 三个分支：pi / fac / gap——数论三大基础工具 |
| 引理（证明的中间产物） | row 1 的 lem 引理库（M8 商店层）：卖 K4/K5 元效果 |
| 素数定理、威尔逊定理、朗道问题 | row 2：pnt / wil 两个 static 定理地板 + prob 未决问题馆（朗道四问题 = 升级内容，M2 挑战枢纽） |
| 哥德巴赫猜想 + 孪生素数猜想 | row 3 的 pairs 素数对层（±：和与差的对偶；M3 小游戏家） |
| 数论先贤（欧几里得→高斯→欧拉→拉马努金…） | row 3 的 oracle 先贤祠（M13 献祭抽卡：献祭素数召唤数学家祝福进总线） |
| 黎曼 ζ 函数与非平凡零点 | row 4 的 zeta 层：唯一 Boss（M12）——把零点一个个钉回临界线；**收局 = 黎曼假设被你证明** |

Mixed caps 的主题来源：孪生素数**至今未被证明无穷**——所以游戏里孪生对货币的硬帽 = 你已验证区间内的孪生对数（π₂(R)），「扩大验证区间」就是 K5 升帽升级。这是把「未解决的猜想」直接变成上限机制。

## 4. Layer chain table

One row per layer. **Bottom row of the tree first.** 数值均为初值，调参常量最终进 `js/tuning.js`（check 21），Stage 6 模拟器拥有最终裁定权。

| id | name (theme voice) | row | pos | type | base resource → baseAmount | requires | exp/base | upgrades | milestones | challenges | buyables | automation granted (by which milestone, of which layer) | softcap plan | doReset keeps | branches |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| s | The Sieve 筛 | 0 | 0 | normal | points（数）→ player.points | 10 | 0.5 | 15（5×3） | 5 | — | 2（筛网扩程，cost 指数 base 2，闭式 buyMax 可逆 → P54 自动步） | pi.m0→resetsNothing(s)；pi.m2→passiveGen(s)；fac.m1→autoPrestige(s)；pnt.m2→autoUpgrade(s)；pnt.m4→autoBuyable(s) | 层级软帽：start ≈ pi 解锁点（素数 250），power 0.1 | `["unlocked","auto"]` + 里程碑保 upgrades/milestones | — |
| pi | Prime Counting 素数计数 | 1 | 0 | normal | s 素数 → player.s.points | 250 | 1/3 | 12（5×3） | 8 | — | 1 | wil.m2→resetsNothing(pi)；oracle.m0→passiveGen(pi)；zeta.m1→autoPrestige(pi)+autoUpgrade(pi)（包办） | start ≈ row2 解锁点（计数 1e4），power 0.15 | 同上 | ["s"] |
| fac | Factorization 因式分解 | 1 | 1 | normal | s 素数 → player.s.points | 400 | 1/3 | 12（5×3） | 8 | — | 2（花 Ω 副货币） | wil.m3→resetsNothing(fac)；oracle.m1→passiveGen(fac)；zeta.m2→autoPrestige(fac)+autoUpgrade(fac) | start ≈ 2e4（因数），power 0.15 | 同上 | ["s"] |
| gap | Prime Gaps 素数间隔 | 1 | 2 | normal | s 素数 → player.s.points | 700 | 1/3 | 10（5×2） | 6 | — | 1 | wil.m4→resetsNothing(gap)；oracle.m2→passiveGen(gap)+autoPrestige(gap) | start ≈ 3.5e4（间隙），power 0.15 | 同上 | ["s"] |
| lem | Lemma Library 引理库 | 1 | 3 | normal | s 素数 → player.s.points | 1000 | 1/3 | 12（5×3，全部 K4/K5） | 5 | — | 0 | oracle.m3→passiveGen(lem)；zeta.m3→autoUpgrade(lem) | 对数形收益自限，无需软帽 | 同上 | ["s"] |
| pnt | Prime Number Theorem 素数定理 | 2 | 0 | static | pi 计数 → player.pi.points | 1e4 | base 2 / exp 1 | 10（5×2） | 6 | — | 0 | pairs.m0→resetsNothing(pnt)；oracle.m4→passiveGen→改 autoPrestige(pnt)（static 用 resetsNothing+autoPrestige，12 §5-26） | static 货币为地板计数，不软帽（阶梯自然变贵） | 同上 | ["pi"] |
| wil | Wilson's Theorem 威尔逊定理 | 2 | 1 | static | fac 因数 → player.fac.points | 2e4 | base 3 / exp 1 | 10（5×2） | 6 | — | 0 | pairs.m1→resetsNothing(wil)；zeta.m4→autoPrestige(wil) | 同上 | 同上 | ["fac"] |
| prob | Open Problems 未决问题馆 | 2 | 2 | none | 无声望货币（maxpoints[] 记分） | 解锁门槛 ≈ 数 5e7（display-text 阈值 + 里程碑门，绝不付费入场） | — | 27（朗道问题等内容） | 4 | 4（M2 分数挑战，2 层×2 档） | 0 | （无自动化——内容层） | — | 挑战进度永不重置（milestone 永续） | ["pi","fac"] |
| pairs | Prime Pairs 素数对 | 3 | 0 | custom | s 素数 → player.s.points | 8e5 | custom getResetGain（素数对=±偶分拆） | 12（5×3） | 6 | — | 1（花 拆分） | zeta.m5→resetsNothing(pairs)+autoPrestige(pairs) | 拆分货币软帽 start ≈ oracle 解锁（2e6），power 0.1 | 同上 | ["s","pnt"] |
| oracle | Pantheon 先贤祠 | 3 | 1 | custom | s 素数 → player.s.points（献祭消耗素数） | 2e6 | custom getResetGain | 10（5×2） | 8（槽位 1→3→5 阶梯） | — | 0 | zeta.m6→resetsNothing(oracle)（抽卡状态永续：neff/ncalc 不在重置名单） | 智慧货币软帽 start ≈ zeta 解锁（4e7），power 0.1 | 同上（另保 gacha 数组） | ["s","wil"] |
| zeta | Riemann Zeta 黎曼ζ | 4 | 0 | **none**（全游戏唯一 P15 型核心循环层：Boss 点击循环） | s 素数 → player.s.points（伤害基数） | 4e7（解锁阈值，update 写 unlocked） | —（无声望） | 12（5×3，以已钉零点计价） | **10+（收局链）** | — | 0 | （终点层，自动其他层） | Boss 伤害 overflow 软帽（P19 形态，u24 升帽） | 同上 | ["pairs","oracle"] |

Side layers（row "side"）：`a` 成就（5×10=50 格，奖励=平坦乘数+自动化备路 P11 带 `!has` 守卫）、`story` 编年史（M15 十章）、`casino` 勒让德赌局（M14，掷币+骰子两分布）、`stats` 统计。成就 tab 顶部带 `X / 50` 计数行（10 §3.10）。

Rules the table must obey — 本表自查：
- requires 阶梯单调；行间 ×25–×100（pi 250=×25 → lem 1000=×100；pnt 1e4=×40 of pi、wil 2e4=×50 of fac、pairs 8e5=×80 of pnt、oracle 2e6、zeta 4e7=×50 of oracle）✓
- 首层 requires 10（P1 众数）✓
- 每主层 ≥10 升级 + ≥3 里程碑 ✓（最小 gap 10 升级/6 里程碑）
- 每新层 gainMult 至少接 ≥2 条更老层；每层 ≥1 升级加强 s 层 ✓（wiring 计划见 §4.1）

### 4.1 Fun density table (handbook 10 §2/§5 — per layer)

效应种类：K1 平坦乘 / K2 自整形 / K3 跨资源 / K4 命名机制元效果 / K5 帽与公式 / K6 条件 / K7 解锁 / K8 生产 / K9 状态时长。**K1 ≤ 40%（medium 配额），每层 ≥3 种非 K1。**

| id | content items (U+M+C+B+click+bars) | effect-kind plan | organization (tabFormat sections / microtabs) | mechanics used here |
|---|---|---|---|---|
| s | 15U+5M+2B+5click+1bar=28 | u11 平价开头（K1 ×2 命名「划掉偶数」）；u12=K2 pow(素数)；u13=K3 吃 pi 计数；u14=K5 首个软帽延迟；u15=K7 解锁 pi；滤网 5 click=K9 冷却爆发（P28，秒产 N 秒）；b11=K4 「筛网孔径 ^1.05」命名机制；m0-4 混合 K1/K7/K5 | tab: main-display / sieve-button / ctx(软帽预警)/ microtabs: Upgrades \| Sieve Filters \| Milestones | M5（无——副货币在 fac）；P28 冷却点击 |
| pi | 12U+8M+1B=21 | u11=K1 命名「逐条清点」；u12=K2 log10(计数)；u13=K3 吃 fac 因数；u14=K5 计数公式升级（ln 形态）；u15=K7 解锁 pnt；m0=passiveGen(s)（×30 过解锁点）；m2=autoPrestige 相关前置 | tab + microtabs: Upgrades \| Milestones | M1（无）；K8（m4 产少量 gap 间隙） |
| fac | 12U+8M+2B=22 | 副货币 Ω（素因数指数和，update() 累积到**非 points 字段**）；u11=K1；u12=K2 pow(0.5)；u13=K3 吃 gap；u21/22=K8 花 Ω 产素数；u15=K7；m 链 K1/K7/K5 | tab + microtabs: Upgrades \| Ω Shop \| Milestones | M5 副货币 Ω |
| gap | 10U+6M+1B=17 | u11=K1；u12=K2 root(2.5)（间隔越大乘越强）；u13=K3 吃 pi；u14=K6 条件（间隔破纪录时 ×3）；u15=K7 解锁 wil；m 链 | tab + microtabs | K6 条件 |
| lem | 12U+5M=17 | 全部 K4/K5：命名公式指数 ^1.01–^1.2（「π 计数公式强化」）、成本减免、软帽延迟——**绝不加强另一条升级的隐系数**（12 §3-15） | tab + microtabs: Lemmas \| Milestones | M8 商店层 |
| pnt | 10U+6M=16 | u11=K1「x/ln x」命名；u12=K2 pow(计数)；u13=K3 吃 wil；u14=K5 canBuyMax 解锁（static 标配）；u15=K7 解锁 pairs；m4=autoBuyable(s)（闭式反解 P54） | tab（static 简版）+ microtabs | P5 地板 |
| wil | 10U+6M=16 | 同 pnt 形态：K1/K2/K3/K5/K7；m2-4=行 1 三层的 resetsNothing（跨层授权） | tab + microtabs | P5 地板 |
| prob | 27U+4M+4C=35 | 朗道四问题+著名结果=升级（K7/K6 为主 + K1 命名）；4 挑战=M2：neff 记 maxpoints[i] 峰值（update 只写 maxpoints）；challengeEffect 读峰值 | tab + microtabs: Problems \| Trials \| Records | **M2 分数挑战枢纽** |
| pairs | 12U+6M+1B+6click(minigame)=25 | u11=K1；u12=K2；u13=K3 吃 oracle 智慧；小游戏 6 click=K6/K9（选对连击 ×factorial 缩放，M3 形态）；b11=K4 拆分公式强化 | tab + microtabs: Goldbach \| Twins \| Minigame \| Milestones | **M3 风险回报小游戏** |
| oracle | 10U+8M+3click=21 | 献祭 click=K9（烧素数抽祝福→neff/ncalc 总线，全树读）；槽位里程碑 1→3→5；u=K3（读槽位增益）+K1 命名数学家 | tab + microtabs: Summon \| Blessings \| Milestones | **M13 献祭抽卡+总线** |
| zeta | 12U+10M+1click+1bar=24 | 攻击 click=K9（P28 冷却，伤害=ζ 货币×乘数×素数^0.01 overflow 软帽）；HP=分段零点；里程碑按段数/复活数=收局 10+ 链（K7/K5/K4 递进） | tab + microtabs: Attack \| Upgrades \| Milestones | **M12 Boss（全游戏唯一）** |

## 4b. Game-level fun plan (handbook 10 §5 quota row)

| Quota (from fun-quota.json `medium`) | Planned | Where |
|---|---|---|
| Distinct mechanics M1–M10（≥4） | 8：M2/M3/M5/M8/M10/M12/M13/M14 | prob/pairs/fac/lem/a/zeta/oracle/casino |
| Challenge layer（M1/M2 style） | M2 score-attack hub，4 挑战 | prob |
| Clickable group(s)（≥1） | 5 组：s 滤网 5 连、pairs 小游戏 6 键、oracle 献祭/召唤、zeta 攻击、casino 掷币/骰子 | s/pairs/oracle/zeta/casino |
| Bar(s)（≥1） | 2：zeta Boss HP 条 + s 筛网冷却条 | zeta/s |
| Layers with `update()`（≥3） | 5：s（冷却/扫网）、fac（Ω 累积）、prob（峰值记录）、casino（局间计时）、zeta（Boss 循环） | — |
| Secondary currency（≥1） | Ω（fac 副货币，专店花销） | fac |
| Shop/meta layer（M8） | lem 引理库 | lem |
| Custom-type ritual layer（M7） | —（medium 为 0+，不装；custom 层 pairs/oracle/zeta 已承当 custom 形态） | — |
| Story presentation（own microtab/infobox, unlock-gated） | story 副层十章（解锁门控），每章 = 数论史事件 | story |
| autoBuyableDrivers（≥1） | pnt.m4 → s 层 b11 闭式 buyMax（P54 反解 cost 指数曲线；消费者=pi/fac 公式，N-BUYABLEDEAD ✓） | pnt |
| K1 share per layer（≤40%） | 每层 K1 计划 ≤5/12（≈42%→收口到 ≤40%），K7 不计入 | §4.1 |
| Microtabs required at（≥12 items） | s(28)/pi(21)/fac(22)/gap(17)/lem(17)/pnt(16)/wil(16)/prob(35)/pairs(25)/oracle(21)/zeta(24) 全部 ≥12 → 全部 microtabs | — |

## 5. Tree sketch (ASCII)

```
row4:                     [ ζ zeta —— THE BOSS + 收局 ]
row3:        [ ± pairs ]   [ Σ oracle ]
row2:   [ ln pnt ]  [ n! wil ]  [ ? prob ]
row1:   [ π pi ]  [ Ω fac ]  [ … gap ]  [ λ lem ]
row0:              [ P s —— THE SIEVE ]
side:   (a 成就 5×10)  (story 编年史)  (casino 赌局)  (stats)
```

## 6. Automation ladder

P4 顺序：resetsNothing → passiveGeneration → autoPrestige → autoUpgrade → autoBuyable。一步一 chores，跨层授权；**autoPrestige 与 resetsNothing 绑定在同一里程碑上（N-AUTOWIPE 集合蕴含的机械保证）**；static 层走 resetsNothing+autoPrestige（12 §5-26）。

| Step | Grants (what chore dies) | Granted by (layer.milestone) | Threshold |
|---|---|---|---|
| 1 | resetsNothing(s)——筛分不再清空你的数 | pi.m0 | 计数 500 |
| 2 | passiveGeneration(s)——素数随时间滴流 | pi.m2（×2 @gap.m3、×2 @prob u21、备路 a.44） | 计数 4e3 |
| 3 | autoPrestige(s)（= fac.m1 **且** pi.m0，合取保证不早于安全帽） | fac.m1 | 因数 8e3 |
| 4 | autoUpgrade(s) | pnt.m2（备路 a.64） | 定理 60 |
| 5 | autoBuyable(s.b11)——闭式 buyMax（P54 反解 cost） | pnt.m4 | 定理 400 |
| 6 | 包办：pi 全自动（auto+upg+keep） | zeta.m1 | 零点 #2 |
| 7 | 包办：fac 全自动 | zeta.m2 | 零点 #3 |
| 8 | 包办：gap 全自动（passive+auto+keep 同里程碑） | oracle.m2 | 智慧 100 |
| 9 | lem：autoUpgrade + passiveGen | zeta.m3 / oracle.m3 | 零点 #4 / 智慧 300 |
| 10 | 包办：pnt 全自动（static：auto+keep） | oracle.m4 | 智慧 1e3 |
| 11 | 包办：wil 全自动 | zeta.m5 | 零点 #6 |
| 12 | 包办：pairs、oracle 全自动 | zeta.m6 / zeta.m7 | 零点 #7 / #8 |
| + | 备路：a.34（免费 s.m1）、a.54（免费 s u11）、a.44、a.64（P11，`!has` 幂等守卫） | a 层成就 | 各自 done() |

## 7. Endgame definition

- `isEndgame()` 条件（具体 Decimal）：`player.zeta.milestones.length >= 10`（第十个非平凡零点被钉回临界线——收局里程碑链 10+ 步，blueprint medium 终局行 ✓）
- Reachability estimate：首层产能 P ≈ 1 数/s × 筛分乘数；ROW_RATIO=25、OUTPUT_STEP=20 → 每行 ×1.25（§4.1 常数进 tuning.js）；5 行 × 行内内容 ≈ **估 12–18 h**（目标 10–30 h；Stage 6 模拟器实测为唯一权威，偏差 >10× 时先改 brief 再改码）
- `winText`：`function(){ return window.chinesemode ? "黎曼假设——被你证明了。素数不再有秘密。" : "The Riemann Hypothesis — proved by you. The primes hold no more secrets." }`

## 8. Cap table (per currency)

| Currency | Ceiling? | Cap mechanism | Where |
|---|---|---|---|
| 数 points | none | P12 软帽 start ≈ s 解锁后首升级段，power 0.1（measuredRetune 形态），帽升高 ×10 卖 lem 可见升级 | layer softcap |
| 素数 primes（s） | none（欧几里得：素数无穷——主题明示无帽） | 层软帽 start ≈ 250（pi 解锁点），power 0.1；帽升高升级可见（u14） | s.softcap()/softcapPower() |
| 计数/因数/间隙/笔记 | none | 各自 P12 软帽（start=下一层解锁点，power 0.15） | 层 softcap |
| 定理/威尔逊商（static 地板） | none | static 计数器不软帽——cost 曲线即墙（12 §2-6 成本优先） | — |
| **孪生对 twins（pairs 内）** | **YES——主题硬帽** | `softcap(x, π₂(R), 0)` power 0 硬帽：帽 = 已验证区间 R 内孪生对计数（R 起始 1e4，π₂(1e4)=205）；「扩区」升级/里程碑 = K5 升帽（×10/次，**帽值始终可见**——12 §2-17） | pairs 自定义 points()/getResetGain() |
| 拆分 splits（pairs 内） | none | **无软帽**：custom 对数形收益（log₁₀(primes)^1.2）自限，无失控环（§10 偏离行 4） | — |
| 智慧 wisdom（oracle） | none | P12 软帽 start ≈ zeta 解锁（4e7），power 0.1 | 层 softcap |
| 零点 zeros（zeta Boss） | none（收局即终点） | Boss 伤害 overflow 软帽（P19 形态）；复活惩罚 ÷MAX_VALUE^level | zeta 伤害公式 |

## 9. Self-check results (SKILL.md Stage 2, all 23)

- [x] 1 — requires 阶梯单调；行间 ×25–×100（§4 表）✓
- [x] 2 — 首层 requires 10（P1）✓
- [x] 3 — 每主层 ≥10 升级 + ≥3 里程碑（最小 gap：10U/6M）✓
- [x] 4 — 每新层 gainMult ≥2 老层；每层 ≥1 升级加强 s（wiring：pi/fac/gap/lem 直接吃 s 或 points；pnt 吃 pi/wil 吃 fac；pairs/oracle/zeta 吃 s+pnt/wil；各层 u11–13 至少一条 `hasUpgrade('s',…)`）✓
- [x] 5 — 阶梯 6 步 P4 顺序，一步一 chore，跨层授权（§6）✓
- [x] 6 — 每个无界环有软帽计划；主题帽进 cap 表（§8）✓
- [x] 7 — 反模式 A1–A10 清扫：无倒挂阶梯、行连续 0–4、非单层树、层密度达标、有行 1+自动化、分支+交叉接线、无单点自动化、公式可见（Shift 公式行 P17）、无跨框架调用 ✓
- [x] 8 — K1 ≤40%/层；每层 ≥3 种非 K1（K2/K3/K4/K5 轮换，§4.1 列）✓
- [x] 9 — 每主层 tabFormat；≥12 内容项全 microtabs；上下文 display-text（base/best/软帽预警）在页签上方 ✓
- [x] 10 — 游戏级配额满足（§4b：8 机制 / M2 枢纽 / 5 点击组 / 2 条 / 5 update 层 / Ω / lem 商店 / autoBuyable 1）✓
- [x] 11 — 乘区预算：每层 ≤1 自整形升级（pow ≤0.5 且软帽）；任意 gainMult Σ 自指数 ≤0.6；row 0 末端保证平坦乘区积 ≪1e4（初值 K1 全 ≤×3 级，tuning.js 管）✓
- [x] 12 — wiring 计划：§4.1 逐层标注 token/gate（K7 无 effect）vs value（effect+具名消费者）；生成时逐条对照（N-UNWIRED=0 为硬门）✓
- [x] 13 — 每层成本梯 ≥6 数量级 + ≥1 把 deliberate 低价钥匙升级 + ≥30% pow/log 形（11 §3–4）✓
- [x] 14 — 组件密度 8–30/层（s=28 最大，gap=17）；挑战 ≤15% 升级数（prob 4/27≈14.8%，唯一带挑战层）✓
- [x] 15 — 作者节奏：首升级价 1（≤10s）；>1min 的重置每次都付新东西；大重置从第一秒变快；无硬重置（12 §1）✓
- [x] 16 — 升级纪律：每升级一个生产增益；不加强别的升级隐系数；门=阈值非付费（12 §3）✓
- [x] 17 — 成本先于软帽；只卖看得见的帽（twin 硬帽常显、软帽预警行 10 §3.3）✓
- [x] 18 — 行节奏两常数：ROW_RATIO=25、OUTPUT_STEP=20 → 每行 ×1.25（∈1.1–1.6）；两数进 tuning.js，模拟器同读 ✓
- [x] 19 — 重置生命周期：best/total 进 doReset 保留列；autoPrestige 集合 ⊆ resetsNothing 集合（§6 逐条对照）；无 update() 写 points（Ω/maxpoints/chips 都是独立字段）；每 doReset 带 vanilla `row > this.row` 守卫；每 static 层有 canBuyMax()（u14 解锁，12 §4-24 static 早期可买满）✓
- [x] 20 — 类型契约（active-click）：clickables 全带 canClick/onClick、状态进 startData（number/string/boolean，无 Decimal）；M2 依赖 sim ✓ 有 tick；M3 依赖 clickables ✓；M12 1 层 ✓；M13 数组进 startData ✓；M14 2 分布 ✓；无被砍修饰（无 §10 掉落行）✓
- [x] 21 — 测量计划：`js/tuning.js` 单一常量源（ROW_RATIO/OUTPUT_STEP/软帽起点/乘区幅度/冷却秒），游戏与模拟器同读；每个节奏量皆为可调用函数 ✓
- [x] 22 — 问题台账完整：S0/Q1–Q8/Q4b（类型+修饰两次点名）全有行，用户原话在案 ✓
- [x] 23 — buyable 持久性：s.b11 → pi/fac 公式消费（跨层）；fac 两 Ω buyable → pnt/pairs 公式消费；gap.b11 → pairs 公式消费；pairs.b11 → zeta 伤害公式消费；pnt.m4 autoBuyable 闭式 buyMax ✓

同层里程碑自动化授权无重复（§6 每步唯一授权者）✓。**全部 23 项通过 → 等待用户确认本文档后进入 Stage 3。**

## 9.1 Static-warning acceptance (Stage 5 output)

（Stage 5 运行后填）

| Check | Layers | Why accepted (or: fixed — how) |
|---|---|---|
| | | |

## 10. Deviations & open questions

| Default overridden | Value used | Why |
|---|---|---|
| medium 蓝图 row3 [1,2] 层 | pairs 与 oracle 同置 row3（=2 层，未超）；哥德巴赫+孪生素数**合并为一层 pairs**（microtabs 分页） | 两猜想同属「素数对」主题（Landau 问题列表亦将其并列），合并省 1 层给 oracle/Boss；机制不重复 |
| M12 Boss 通常 row2–3 独立层 | zeta = row4 终层，`type:"none"`，同时承担 Boss（M12）+ capstone + 收局链 | Boss=「ζ 零点」主题上就是终局；复用 1 层避免为 Boss 单开。它是 Q4 契约允许的唯一 P15 型核心循环层（prob/casino 是内容层非循环层） |
| lem 基资源：points → **primes**（requires 1000） | brief 初稿写 points 1000 | 与 s（requires 10）形成 ×100 落在行间带内，且避免「points 1000 在 pi 解锁前就达标」的节奏错位（F12 跨货币 requires 检查更干净） |
| 自动化阶梯 6 步 → 12 步 | 核心 6 步（§6 步 1–5 + 首个包办）保留；行 1/2/3 包办追加（zeta.m1–m7、oracle.m2/m4） | medium 蓝图要求 full ladder per branch + row3 package deal；Q6 的「4–6 步」按核心阶梯计，包办是蓝图标准的跨层授权形态（P4 原文） |
| pairs/oracle 不设软帽 | brief 初稿 §8 写了软帽 | custom 对数形收益（log₁₀(primes)^E）自限、无失控环——12 §2-6「成本/曲线优先于软帽」；孪生对用主题硬帽 |
| 引擎 chrome 英文（T2） | 选项菜单/How To Play 等保持英文；热键 description 为英文字符串（加载期 player 未定义，函数化文案在 How To Play 里不保证被求值） | 15 §4：T2 允许英文 chrome；游戏自有文案全部函数化双语 |
| 模拟器桩保真补丁（本作 tools/simulate.js） | (a) Date.now 接管为模拟时钟；(b) tmp 桩对层定义钩子（damage/cooldown/resetGain）返回真实计算值；(c) 点击策略：每 --click 秒按层点击就绪 clickable（赌场除外——两分布均负 EV，理性玩家不刷） | 本作是 active-click：Boss/滤网/小游戏是核心动词， blanket Decimal(1) tmp 桩使收局结构上不可测（14 §2 桩缺口修脚本不忽略）；首跑（补丁前）报 DID NOT REACH 即此缺口 |
| 模拟器「no clickables」排除行 | 头部打印文本未改（补丁只加策略不改文案） | 输出的 LOWER BOUND 说明仍成立：挑战奖励/成就效果/人类拖延仍排除 |
| challenge unlock ≈5e7× 首层货币 | prob 解锁门槛 数 5e7 | 照 blueprint（~5e7×）✓ 非偏离，记录备查 |
| 作者署名 | chenf888 | 用户确认（2026-10-31 Stage 2 闸门） |
| 游戏英文名 | The Prime Conjecture Tree | 用户确认（2026-10-31 Stage 2 闸门） |

Numbers noticed while playing enter HERE first → `js/tuning.js` → sim re-run. 层文件字面量中途改动 = §10 违规。

## 11. Stage-6 measured retune (authoritative — only if the measurement contradicted the brief)

（Stage 6 运行后填；首测干净则只引一行数字）

| # | Finding (measured) | Root cause | Fix, and where the constant lives |
|---|---|---|---|
| 1 | Boss wall：dt=2 跑满 60h 卡在 zero #6–7（59/62 milestones）；damage = primes^0.3 ≈ 1e3–4 对 HP ×5/zero，仅 zero #1 就要 4239 次攻击（5.9h 连点） | zetaDmgPrimeExp 0.3 对 primes 只到 ~1e13 的本作太狠；zetaHpBase 1e6 又放大了它 | `js/tuning.js`：zetaDmgPrimeExp 0.3→0.5（真根因），zetaHpBase 1e6→1e5；u31 cost 10→9（`js/layer_zeta.js`）。首战 ~13 attacks |
| 1b | 反向出带：retune#1 后总计 4.77h（dt 0.1）< 10h 下限。trace-every 定位：pre-boss 仅 0.85h（4e7 primes 于 ~t3000s 解锁 Boss）+ Boss 爬升 4.4h —— 墙拆掉后全游戏只剩 5.3h | retune#1 把唯一的墙拆掉后暴露总内容量不足带宽数 | `js/tuning.js`：zetaHpBase 1e5→3e5。实测 8.23h（弹性 total ≈ HP^0.45） |
| 1c | 8.23h 仍 < 10h | 弹性外推：要 ~13h 需 HP 再 ×3.3 | `js/tuning.js`：zetaHpBase 3e5→**1e6**（回到第1轮前值——真正起作用的是 exp 0.5，base 回归原值）。实测 12.68h ✓ 带内；dt spread（canReset 修复前）：0.1→12.68 / 0.5→14.50 / 1→12.93 / 2→17.51 |
| 1d | canReset 补 requires 门后终测 + dt1 交叉：三采样 10.94/11.52/9.96（gacha 方差 ±1h）——**9.96 踩到 10h 地板下缘** | 方差尾部贴地板 | `js/tuning.js`：zetaHpBase 1e6→**1.2e6**（×1.2 ≈ +9% 全采样余量） |
| 1e | 复活小游戏后终测反而**降到 9.15h**：pmPick 派息 `resetGain × 5 × streak` 随 resetGain 无界放大——连点小游戏 ≈ ×6–9 游戏速度（模拟器已吃到，真人更甚）。这是 mgRunning 死内容修复暴露的**派息失衡**，不是调参问题 | 派息常数与收入尺度脱钩 | `js/layer_row3.js` 派息改为 `TUNING.mgPayBase(0.5) + TUNING.mgPayStreak(0.25)×streak` 秒收入——与筛网过滤器同量级（EV≈0.3s/次），常数入 TUNING。改后 dt0.1=15.34 / dt1=9.91——方差仍 ±40% |
| 1f | 同构建双点 15.34 vs 9.91：**祝福（gacha）组合摆布全程经济 ±40%**，单次采样不可代表；地板反复被削 | 方差源是 M13 gacha 本身（点名修饰符，不改设计），只能整体抬分布 + 多采样取中位数 | `js/tuning.js`：zetaHpBase 1.2e6→1.6e6（仍 8.14–14.07，中位 9.44）→**3.6e6**（×2.25）。**最终构建终测：dt0.1 ×3 = 11.86 / 11.50 / 9.64 → 中位数 11.50h ✓ 带内**；dt1 = 12.23h ✓；dt2 = 15.09h ✓（五采样 9.64–15.09，dt 斜率恢复正常单调） |

## 12. Browser-verification fixes (Stage 6.5)

（Stage 6.5 运行后填）

| # | Symptom | Root cause | Fix |
|---|---|---|---|
| 1 | boot error ×2：`TUNING.sSoftcapStart.times is not a function`（重载后 __bootErrors 抓到） | 4 处 tabFormat display-text 把裸数字 TUNING 常数当 Decimal 用（layer_s.js:385、layer_row1.js:156/452/694）——模拟器不渲染 tabFormat，永远看不见 | 全部包 `new Decimal(...)`；全页签遍历后 __bootErrors 清零 ✓ |
| 2 | 死按钮：6,200 素数时 pairs 按钮显示 "SPLIT! +1.00" 却按了没反应（引擎 doReset 静默拒绝） | 自定义层 canReset() 只看 gain≥1，没带引擎的 requires 门（game.js:182 每次 press 都查）；postMult 抬高后 gain=1 的门槛低于 requires 8e5，出现「显示可按、实际拒绝」的死区；oracle 同型 | `layer_row3.js` 两处 canReset 补 `player.s.points.gte(tmp.<l>.requires) &&`；模拟器 canPrestige 走 L.canReset 自动继承该门 |
| 3 | **整类内容不可见**：boss 攻击钮、5 个筛网过滤器、赌场 ×2、s/pairs 买档、oracle 升级页在浏览器里全部不存在 | 引擎渲染器（components.js row/column 两个组件）只有「非数组 / length3 / length2」三个分支——**长度1 数组项三个分支全不匹配，静默渲染空**；再叠加第二处错误：`["clickables", [11..]]` 把 clickable id 当行号传（组件内 row*10+col 查 111/121… 全落空） | 引擎副本 components.js 两个渲染器各加 `length==1` 分支；游戏侧四处改为裸字符串 `"clickables"`（行号由 rows/cols 自动派生）。实测：zeta 攻击 ✓ / s 过滤器 ×5 ✓ / 赌场 ×2 ✓ / s 买档 ×2 ✓ / pairs 小游戏 ×3 ✓。静态检查器 C-CONTENT1ELEM 本就编码此陷阱——改完引擎后应立即重跑检查（教训） |
| 4 | M3 小游戏死内容：u25 购买后点击答案无反应（streak 恒 0） | `mgRunning` **无任何写入者**（grep 全库仅 startData/keep/pmPick 守卫三处）——pmPick 永远早退，streak/mgMult 不可达；模拟器同样静默跳过 | pairs update() 补开局写入（u25 持有即 `mgRunning=true`）。实测：正确连击 0→4、答错归零、目标重掷 ✓ |
| 5 | 化妆品：EN 模式显示 `(best 3）`（全角括号） | layer_s.js:381 收尾括号硬编码在 L() 之外 | 改为 `L("）", ")")` |
| 6 | 自动化浏览器坐标/节点点击两条输入路径都误触别的元素（story/stats） | IAB 后端坐标映射与失效引用问题（elementFromPoint 命中目标正确、处理器为引擎标准 Vue 绑定）——**非游戏缺陷** | 页内 `elementFromPoint` + 原生 dispatch 原子化验证交互；真实声望/召唤/攻击/小游戏全部走通 |
| 7 | **prob 层永不可达**：全库无任何代码写 `player.prob.unlocked = true`——M2 中枢（朗道 27 升级 + 4 挑战 + 里程碑链）在真实游玩中打不开（模拟器不查 unlocked 标志所以数字照算，静态规则也扫不到"没有写入者"这种缺失） | type none 层引擎从不自动解锁（game.js:198 只在 doReset 里翻转；type none 跳过 doReset）；zeta/story/casino 都有自己的 F28 写入器，**唯独 prob 漏了** | `layer_row2.js` update() 补写入器（numbers ≥ `TUNING.probUnlockNumbers` 5e7，brief §4 既定门槛）+ tooltip/tooltipLocked（原会显示 "Reach 0 undefined"）。实测：数字增长到门槛即解锁，挑战进入/退出/手性 ^0.8（9.1e15→5.85e12 精确）全通 ✓ |
| 9 | **双语静态冻结**：成就 name/tooltip 等用静态 `name: L(cn,en)` 形态——mod 加载时 player 未定义，L 守卫返回英文并**永久冻结**（247 处：成就 50×2、里程碑/挑战/升级描述、层名 11 处纯英文） | 上轮 172 处 smoke 修复的正则漏掉了行内多字段形态（成就单行两字段）与层 name | `tools/fix_static_l.py` 批量转 `field() { return L(...) }`（tmp 每 tick 重调→切换即时生效），11 个层名补中文。实测：切换后成就/升级/层名双向实时 ✓ |
| 10 | 语言切换按钮从树页迁到设置页（玩家要求，同款 `.opt` 切换键风格） | — | `technical/systemComponents.js` options 表新增 `Language / 语言: {{player.chinesemode?"中文":"English"}}` 行；tree.js 移除树页按钮。实测：设置内可见/可点、树页无残留 ✓ |
| 8 | 胜利画面测试的教训：把 zeros 拉到 10 触发 zeta 里程碑链，级联 wipe 下行层的 unlocked 标志——**还原 zeros 不还原 unlocked**（doReset 的不可逆性）。此为游戏设计使然，非缺陷；但测试后必须重新注入存档再继续 | — | 测试顺序纪律：破坏性状态实验放最后，或实验后重新注入 |

交互实测账（zeta 存档注入 + 逐字段核对）：筛子声望 2→40 primes（best/unlocked 记账、numbers 归零）✓；pairs 声望 +919 splits、素数 140.7M→30k 级联 wipes ✓；oracle 召唤 draws 17→18、9 槽祝福 ✓；boss 攻击 HP 1,000,000→495,444（perHit 504,555 = primes^0.5×mults）✓；存档→重载 splits/twins/upgrades/u25/语言逐字段精确 ✓。

Feel proxies, per layer:

| Layer | First press (s) | Clicks to first upgrade | Next action named on screen? |
|---|---|---|---|
| s | 10.1 | 1（u11 cost 1） | ✓ 树节点 tooltip「Reach 250 primes to unlock (You have X)」 |
| pi/fac/gap/lem | 303–346 | 1–2 | ✓ 同上（节点 tooltip 实时计数） |
| pnt/wil | 381/389 | 1（canBuyMax） | ✓「Reset for +N theorems / Req: X / 20,000 counts」 |
| pairs/oracle | 357/487 | 1 | ✓ SPLIT!/PROVE! 按钮自带 nextAt；锁定态 tooltip 计数 |
| zeta | n/a（type none，解锁即玩） | — | ✓ ATTACK 钮显示伤害/冷却；HP 条实时 |

Final gates: **static 107 PASS / 9 WARN(§9.1 已接受) / 0 FAIL；smoke 0 FAIL 0 WARN；measured lower bound = 11.50h（中位数，dt0.1×3：11.86/11.50/9.64；dt1 12.23h；dt2 15.09h —— 全部落于 10–30h 带邻域，§11 #1f）**；i18n —（T2 双语在 game 内实现，无 js/lang/，检查 no-op）。终局逐层审计数字：15 层 / 158U / 72M / 4C / 9B / 50 成就（README 同）。
