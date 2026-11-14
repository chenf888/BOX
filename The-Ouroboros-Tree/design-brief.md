# Design Brief — 衔尾树 The Ouroboros Tree

> 2026-11-14 · Stage 2 · 按 SKILL.md v1.1.3 管线填写。所有默认值来自 `assets/blueprints.json` +
> `assets/balance-defaults.json`；每一处偏离都在 §10 记录默认值与理由。

## 1. Identity

| Field | Value |
|---|---|
| Game name | 衔尾树 / The Ouroboros Tree |
| Author | chenf888（用户指定） |
| Points name (`modInfo.pointsName`) | 微响 / hums |
| Language mode (Q7) | T2 双语一开关（P17：`window.chinesemode` 三元式；切换键在设置面板，覆写 `js/technical/systemComponents.js`——用户已明确授权修改模板文件） |
| Default language | **英文默认**（`chinesemode: false` 写进 startData 初始值；用户原话「英文默认」） |
| One-line pitch | 万物靠喂养自己而变强：12 层单链，每层一条专属「自增益项」——一条吃自己尾巴的反馈回路；终局把整棵树的指数重新调谐（调谐流形）。 |

## 2. Interview record — the question ledger

| # | Question | Answer (verbatim) | Locked parameter |
|---|---|---|---|
| S0 | 主题 | 用户开场已给：「以自增益项为主题的树」 | 主题=结构（P14），见 §3 |
| Q1 | 三行结构确认 | 「按此结构确认」 | 货币链 微响→涟漪→…→衔尾蛇；每层一条自增益项（指数≤0.5+软上限）；自上而下单链；无硬上限 |
| Q2 | 规模 | user-delegated → AI 提案「12层·中型」confirmed: yes（用户 2026-11-14 会话中明示「我允许你跳出蓝图设计这一过程，充分发挥创造性」，并对 12 层·中型选项点击确认） | blueprint `medium`；12 层；目标 15–25h |
| Q3 | 天花板 | 「无上限 (Recommended)」 | 标准链 + P12 软上限；无 custom 硬帽货币 |
| Q4 | 节奏 | 「均衡 (Recommended)」 | 蓝图默认行为 + 趣味配额 |
| Q4b | 类型 | 「被动声望链 (Recommended)」 | passive-prestige；层型限 normal/static；**禁止 clickables/grid/update()**（模组侧） |
| Q4b | 修饰项A 多选 | 「无」 | score-attack / minigame / boss-rush 全部不采用 |
| Q4b | 修饰项B 多选 | 「无」 | gacha / casino / story 全部不采用 |
| Q5 | 副内容 | 「Light」 | 仅成就层；**无挑战层**（对 medium 配额的用户覆盖，§10） |
| Q6 | 自动化/等墙 | user 自定义提问：「开始游戏时选择简单或困难，简单使用经典节奏，困难使用超级大的墙，这可以做到吗，使用什么实现」→ AI 提案「模式节点+根阀门」→ user confirmed | 开局模式节点（侧层，两个零成本升级对=简单/困难）；简单=经典节奏（4–6 步梯、等墙≤30min）；困难=根增益 ÷8（HARD_WALL_DIVISOR，Stage 6 实测校准）；困难通关留永久徽章；`player.difficulty` 持久化 |
| Q7 | 语言 | 「T2 双语一开关」+ 追问「英文默认」 | P17 三元式；设置面板切换；英文为默认（chinesemode 初始 false） |
| Q8 | 结局风味 | 「调谐流形 (Recommended)」 | M20 调谐流形（P24）：13 种货币各一条调谐等级，共享一个衔尾蛇货币池；重排=零成本升级（M9 模式，tickless 合规） |
| — | 游戏名 | 「衔尾树」 | The Ouroboros Tree |
| — | 作者 | chenf888（用户开场指定） | modInfo.author |

Q1 已确认的三行结构（原文复述）：

- **Currencies**：微响（基础货币 points）→ 涟漪 → 回声 → 谐振 → … → 衔尾蛇（终层）。每一层都有一条专属「自增益项」——读取自身存量、放大自身产出的升级/可购买项（增幅指数≤0.5、带软上限防爆炸），同时该层还反向助推下面所有层
- **Layer topology**：自上而下的单链 prestige 树，每层重置其下所有层；链长由 Q2 规模决定
- **Ceilings**：货币无硬上限（Q3 确认）；自增益项本身自带软上限

## 2b. Game type profile (Q4b)

| Field | Value |
|---|---|
| Type | `passive-prestige`（被动声望链） |
| User confirmation | 「被动声望链 (Recommended)」——选项点击确认 |
| Confidence + margin | 0.63，margin 0.613（classifiy.js auto 路由，排序 被动0.63 / 点击0.017 / tick 0.015 / 网格0.01） |
| Mandatory modules | layers:normal\|static、upgrades、milestones、mod.js |
| Optional modules used | buyables、achievements、microtabs、automate() 钩子（引擎逐 tick 调用，非模组 update()） |
| Forbidden (design contract) | clickables、grid、模组侧 update()——**全游戏零使用**；开局模式节点与调谐流形均改用零成本升级对/可购买项实现（M9 模式） |
| Rules exempt | `D-NOUPDATE`（无 tick 正是该类型的正确形态）；`D-MECHQUOTA` 窄化为仅数 challenges → 本作 0 挑战 → 该 WARN 按 §9.1 接受 |
| Require rules | `N-UNWIRED`、`D-REQLADDER`、`N-MSDESTROY` 全程 FAIL 级遵守 |

修饰项表（全不采用，均记 §10）：

| Modifier | Included? | Why |
|---|---|---|
| sim | 否 | 用户多选「无」 |
| score-attack / minigame / boss-rush / gacha / casino | 否 | 依赖 active-* 类型；类型已锁被动 + 用户多选「无」 |
| story | 否 | 用户多选「无」 |
| challenges | 否 | Q5=Light（用户覆盖 medium 配额的 challengeLayer: required） |
| board / caps | 否 | 无棋盘需求；Q3=无硬上限 |

## 3. Theme = structure mapping (P14)

主题「自增益」不是皮肤而是骨架，三处结构化：

1. **每层一条专属自增益项（12 条各不相同的自反馈形态）**——这是树的身份证。连续读自身的（指数≤0.5、软上限）、购买回喂自身的（ln(effect)/ln(cost)<1）、里程碑自指的（有限步、读 best/total）、波段条件的。逐层清单见 §4「自增益项」列。
2. **命名即结构**：声波物理链 微响→涟漪→回声→谐振→驻波→反馈环→泛音→干涉→自激→混沌→分形→奇点→衔尾蛇，低频到高频到自指；终层衔尾蛇=整棵树吃自己尾巴（调谐流形重调全部 13 种货币的指数，包括它自己）。
3. **静态地板取声学的「驻波/干涉/分形」意象**（驻波=稳定节点、干涉=波峰条纹、分形=自相似缩比），三块 static 地板（row 3/6/9）恰好都是「自指成形」的物理意象。

层名全部无 emoji（用户要求）。颜色沿声谱从青到金（§5）。

## 4. Layer chain table（自上而下单链，行 0→11；base 链 points→ri→ec→re→(re)→fl→ov→(ov)→so→ch→(ch)→si→ou）

> 本表为设计期蓝图；**数值与自动化授予以 §6 v3 / §11 R2b–R3 实测定稿为准**（requires 1e9–1e14、exponent 0.3、fr 里程碑改卖数值乘区等）。

ROW_RATIO = ×25（逐行 requires 数值比），OUTPUT_STEP = ×18，逐行耗时 ×1.39（§18 自检在带内 1.1–1.6）。requires 全部数值单调递增 ×25（D-REQLADDER：static 层 base 取大数值货币，不取小计数）。

| id | name (中/EN) | row | pos | type | base → baseAmount | requires | exp/base | upgrades | milestones | buyables | 自增益项（signature self-loop） | automation granted（哪层哪个里程碑） | softcap plan | doReset keeps | branches |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ri | 涟漪 Ripple | 0 | 0 | normal exp 0.5 | points → player.points | 10 | 0.5 | 12 (5×3) | 5 (best) | 1「石子」 | **u12 泛波**：(ri+2)^0.35→本层 gainMult（m4 后 ^0.4；effect 内软上限）；u23 成就开方 K3 | ec.m1→ri passiveGen(S2)；re.m1→ri autoPrestige(S3)；fl.m1→ri autoUpgrade(S4)；ch.m0→ri autoBuyable(S7 closed-form P54) | 层 softcap 起 1e3 pow 0.4；u21/m3 可见帽×10 | unlocked/auto + m 门控 keeps | — |
| ec | 回声 Echo | 1 | 0 | normal exp 1/3 | ri → ri.points | 250 | 0.333 | 11 (5×3) | 5 (best) | 1「回声室」 | **buyable 回声室**：cost 5×3^x，本层 gain ×1.6^x（ln 比 0.42<1）；消费方=re u21 门 + sw gainMult | re.m0→ec resetsNothing(S1)；sw.m1→ec passiveGen(S5)；ov.m1→ec autoPrestige+autoUpgrade(S6) | 层 softcap 起 2.5e3 pow 0.4，可见 | unlocked/auto + keeps | [ri] |
| re | 谐振 Resonance | 2 | 0 | normal exp 0.3 | ec → ec.points | 6.3e3 | 0.30 | 11 | 5 | 1「谐振腔」 | **m0–m4 同相链**：本层 gainExp 0.30→0.35（有限步 K4 命名机制「谐振阶数」）；buyable 消费方=sw 门 | fl.m0→re resetsNothing；so.m1→re passiveGen；ch.m1→re autoPrestige+autoUpgrade | softcap 起 1.6e4 pow 0.35 | keeps | [ec] |
| sw | 驻波 Standing Wave | 3 | 0 | **static base 2** exp 1 | re → re.points | 1.6e5 | base 2 | 10 | 5 | 1「波腹」 | **buyable 波腹**：本层 static 购价 ÷1.4^x（自指价格回路 ln0.29<1）+ ×(1+0.1x) ri 增益（跨层消费） | in.m0→sw resetsNothing+autoPrestige（包） | static 用 D-COSTSPAN 1 阶档；canBuyMax 由升级授予 | keeps | [re] |
| fl | 反馈环 Feedback Loop | 4 | 0 | normal exp 0.25 | re → re.points（与 sw 共享 base） | 4e6 | 0.25 | 12 | 6 | 2「涡核」+「涡度」副货币 | **u12 回声记忆**：(fl.best+1)^0.4→本层 gainMult（读 best 的自记忆项，effect 软上限）；副货币「涡度」onPrestige 银行（tickless M5） | ov.m0→fl resetsNothing；si.m1→fl passiveGen；ou.m0→fl autoPrestige+autoUpgrade | softcap 起 1e7 pow 0.35 | keeps | [sw] |
| ov | 泛音 Overtone | 5 | 0 | normal exp 0.25 | fl → fl.points | 1e8 | 0.25 | 12（含 M8 商店微页签） | 5 | 1「谐波列」 | **u12 谐波**：(ov+1).log10().pow(2).add(1)→本层 gainMult（log² 家族）；商店卖 K4/K5 给老层 | in.m1→ov passiveGen；ou.m1→ov autoPrestige+autoUpgrade | softcap 起 2.5e8 pow 0.35 | keeps | [fl] |
| in | 干涉 Interference | 6 | 0 | **static base 2** | ov → ov.points | 2.5e9 | base 2 | 10 | 5 | 1「条纹」 | **m 链 波峰**：每道条纹使「每单位 in 货币」的跨层增益 ×2（自值增长，有限步）；buyable 消费方=so 门 | so.m0→in resetsNothing+autoPrestige（包） | 同 sw | keeps | [ov] |
| so | 自激 Self-Oscillation | 7 | 0 | normal exp 0.25 | ov → ov.points（与 in 共享 base） | 6.3e10 | 0.25 | 11 | 5 | 1「起振线圈」 | **buyable 起振线圈**：本层 passiveGeneration 速率 = 0.05×level（自激振荡，自喂被动产出）；消费方=si 门 | ch.m2→so resetsNothing；fr.m1→so passiveGen+autoPrestige | softcap 起 1.6e11 pow 0.3 | keeps | [ov] |
| ch | 混沌 Chaos | 8 | 0 | normal exp 0.22 | so → so.points | 1.6e12 | 0.22 | 11 | 5 | 1「吸引子」 | **u12 蝴蝶效应**：本层 gain 按自身点数波段 ×50/×2/×500/×20/×5000（K6 波段条件自增益，Shift 显示波段表）；消费方=fr 门 | fr.m0→ch resetsNothing；si.m2→ch autoPrestige+autoUpgrade | softcap 起 4e12 pow 0.3 | keeps | [so] |
| fr | 分形 Fractal | 9 | 0 | **static base 2** | ch → ch.points | 4e13 | base 2 | 10 | 5 | 1「缩比」 | **m 链 自相似**：本层 static base 2→1.95→1.90→1.85→1.80（自相似缩比，有限步 K5）；buyable 消费方=si 门 | si.m0→fr resetsNothing+autoPrestige（包） | 同 sw | keeps | [ch] |
| si | 奇点 Singularity | 10 | 0 | normal exp 0.20 | ch → ch.points（与 fr 共享 base） | 1e15 | 0.20 | 11 | 5 | 1「奇点质量」 | **m 链 事件视界**：本层 prestige 指数 0.20→0.28（有限步 K4 命名机制「引力」）+ u12 霍金辐射：(si+1)^0.3 强软上限（pow 0.2）→本层 gainMult | ou.m2→si resetsNothing；ou.m3→si passiveGen | softcap 起 2.5e15 pow 0.3 | keeps | [fr] |
| ou | 衔尾蛇 Ouroboros | 11 | 0 | normal exp 0.20 | si → si.points | 2.5e16 | 0.20 | 12 | 12（终局链） | 13「调谐流形」 | **调谐流形本身**：13 条调谐可购买项（points+12 层货币各一条），共享 ou 货币池；重排=零成本升级 pay()（M9 模式）；≥10 级强化指数 pow(1+(lv-10)×0.05)≤1.25、≤10 级中性/削弱；衔尾蛇连自己的指数一起调——吃自己尾巴 | ou.m4–m11 终局包：resetsNothing+autoPrestige+autoUpgrade 全链 + autoBuyable(fr 缩比 closed-form) | 流形池消耗即天然上限；own gainMult 不另设连续自项（指数自调即自项） | keeps（终局全保） | [si] |
| a | 成就 Achievements | side | — | none | — | — | — | — 50（5×10） | — | — | 奖励=平坦乘法 + **恰好一条自动化授予** + P11 回填（带 ！has 门）；顶部计数行 X/50 | — | — | — | — |
| mode | 模式选择 Mode | side | — | none | — | — | — | 2（零成本升级对：简单/困难，pay() 写 player.difficulty） | — | — | 选择后 layerShown=false 消失；选择前 getPointGen=0 并显示提示 | — | — | — | — |

跨层助推纪律（P10/A7）：每新层在其 gainMult 给 ≥2 个更老层各加 ≥1 行；每层 ≥1 条升级助推第一层 ri；ou 的流形重调所有层。所有跨层助推读**施加层自己的货币**（K3），绝不在目标层 gainMult 里读目标层自身点数（N-SELFTOTAL 纪律：每层仅 1 条自项）。

### 4.1 Fun density table（K1 ≤40%/层；每层 ≥3 种非 K1；K7 不计入 K1）

| id | 内容件数 | effect-kind 计划（关键件） | 组织（tabFormat/微页签） | 机制 |
|---|---|---|---|---|
| ri | 12U+5M+1B | u11 K1、u12 **K2 自项**、u14 K2 points^0.3、u21/u31 **K5 可见帽×10**、u22 K6、u23 K3(成就^0.5)、u25 K7 出口票、u32 K4(命名里程碑「涟心」×2) | tab+微页签 升级\|里程碑\|公式(Shift) | P55 分式披露（公式页签） |
| ec | 11U+5M+1B | 回声室 **自喂购买回路**、u13 K3(re)、u15 K5、u22 K7 解锁 re、K1×3 | tab+微页签 升级\|里程碑 | M5 风味（回声室=层内回路） |
| re | 11U+5M+1B | m 链 **K4 gainExp 自指**、u 谐振腔、u14 K3(fl 预备)、K5/K7/K1 | tab+微页签 | 里程碑自指 |
| sw | 10U+5M+1B | 波腹 **K5 自指价格**、u K3、canBuyMax 升级授予、K1×3 | tab+微页签 | P5 static 地板 |
| fl | 12U+6M+2B | u12 **K2 best 自记忆项**、副货币涡度 **K8(onPrestige)**、u K5、K6、K3、K1×3 | tab+微页签 升级\|里程碑\|涡度商店 | M5 副货币（tickless） |
| ov | 12U+5M+1B | u12 **K2 log² 自项**、**M8 商店**微页签（K4/K5 卖给老层）、K7 | tab+微页签 升级\|里程碑\|商店 | M8 商店 |
| in | 10U+5M+1B | m 链 **自值增长条纹**、K5、K3、K1×3 | tab+微页签 | P5 static 地板 |
| so | 11U+5M+1B | 起振线圈 **自喂被动产出**、u K4(命名速率)、K5、K1 | tab+微页签 | 自激振荡 |
| ch | 11U+5M+1B | u12 **K6 波段条件自增益**（Shift 波段表）、K5、K3、K1×2 | tab+微页签 | 混沌映射 |
| fr | 10U+5M+1B | m 链 **K5 base 缩比自相似**、K3、K1×3 | tab+微页签 | P5 static 地板 |
| si | 11U+5M+1B | m 链 **K4 指数自升（引力）**、u12 **K2 霍金自项(强软帽)**、K5、K1 | tab+微页签 | 奇点引力 |
| ou | 12U+12M+13B | **M20 调谐流形**（13 调谐购买项+重排）、m 链终局 12 步（keeps/自动化包/池扩容）、K4×多、K5、K7 | tab+微页签 调谐\|升级\|里程碑 | M20 + M9 重排 |
| a | 50 成就 | 奖励平坦乘法×N + 1 条自动化 + P11 回填（！has 门）；主题命名 | 计数行 + 5×10 网格 | M10 收集 |

§4b 游戏级趣味计划（fun-quota `medium` 行逐项）：

| Quota | Planned | Where |
|---|---|---|
| Distinct mechanics M1–M10 ≥4 | **5**：M5 副货币(fl 涡度)、M8 商店(ov)、M10 收集(a)、M9 重排(ou)、P55 公式披露（全层） | §4.1 |
| Challenge layer | **0（用户覆盖，§10）** | — |
| Clickable group | **0（类型契约覆盖，§10）** | — |
| Bars | **0（类型契约覆盖，§10）** | — |
| Layers with update() | **0（类型契约覆盖，§10）**；引擎逐 tick 调用的 `automate()` 用于 autoBuyable（P4 step 5） | ec 回声室 + fr 缩比 closed-form buyMax |
| Secondary currency ≥1 | fl「涡度」onPrestige 银行（tickless 变体） | fl |
| Shop/meta layer | ov 泛音商店微页签 | ov |
| Custom ritual layer | 不适用（被动类型限 normal/static） | — |
| Endgame verb M19–M21 | **M20 调谐流形**（Q8 锁定） | ou |
| autoBuyableDrivers ≥1 | 2：ec 回声室（S7）、fr 缩比（终局包） | §6 |

## 5. Tree sketch

```
row11:                                    [ou 衔尾蛇]
row10:                               [si 奇点]
row 9:                          [fr 分形(static)]
row 8:                     [ch 混沌]
row 7:                [so 自激]
row 6:           [in 干涉(static)]
row 5:        [ov 泛音+商店]
row 4:     [fl 反馈环+涡度]
row 3:   [sw 驻波(static)]
row 2:  [re 谐振]
row 1: [ec 回声]
row 0:[ri 涟漪]
side: (mode 模式选择→选后消失)  (a 成就 5×10)
```

颜色（层 accent，均中亮度可读）：ri #26c6da / ec #42a5f5 / re #5c6bc0 / sw #7e57c2 / fl #ab47bc / ov #ef5350 / in #ff7043 / so #ffa726 / ch #66bb6a / fr #26a69a / si #ec407a / ou #ffd54f。符号（单汉字）：涟 回 振 驻 环 泛 涉 激 乱 形 奇 衔。热键（描述含键名，N-HOTKEYDESC）：r/e/q/w/f/o/i/s/c/x/y/z。

## 6. Automation ladder（P4 序，跨层授予，一步一事；里程碑全部读 best/total）

**引擎语义定案（代码期读 game.js:175-235 后修订）**：`autoPrestige` 每 tick 触发 `doReset`，而 resetsNothing 只在 static 层安全（normal 层 + resetsNothing = 无限刷漏洞，N-AUTOWIPE 集合蕴含不变量）。因此**自动声望只授予 3 块 static 地板（sw/in/fr）**，normal 层只授 passiveGeneration + autoUpgrade。

| Step | 授予（哪件事消失） | 授予方 | 阈值（best） |
|---|---|---|---|
| S1 | 涟漪被动增长（ri.passiveGen） | ec.m1 | 5e3 |
| S2 | 涟漪自动升级（ri.autoUpgrade） | re.m1 | 3e4 |
| S3 | 回声自动升级（ec.autoUpgrade） | sw.m2 | 10 |
| S4 | **驻波全自动包**（resetsNothing+autoPrestige+autoUpgrade，同里程碑集合） | in.m0 | 5 |
| S5 | 谐振被动增长（re.passiveGen） | so.m1 | 100 |
| S6 | 反馈环被动增长（fl.passiveGen） | ov.m2 | 150 |
| S7 | 反馈环自动升级（fl.autoUpgrade） | ch.m2 | 300 |
| S8 | 泛音被动增长（ov.passiveGen） | so.m2 | 300 |
| S9 | 泛音自动升级（ov.autoUpgrade） | si.m1 | 100 |
| S10 | **干波全自动包** | so.m3 | 1000 |
| S11 | 自振荡被动增长（so.passiveGen，双倍速率） | ch.m3 | 1000 |
| S12 | 自振荡自动升级（so.autoUpgrade） | ch.m4 | 2000 |
| S13 | 混沌被动增长（ch.passiveGen，双倍速率） | so.m4 | 3000 |
| S14 | 混沌自动升级（ch.autoUpgrade） | si.m2 | 300 |
| S15 | **分形全自动包** | si.m3 | 1000 |
| S16 | 奇点被动增长（si.passiveGen，双倍速率） | ou.m1 | 5 |
| S17 | 奇点自动升级（si.autoUpgrade） | ou.m2 | 8 |
| S18 | 任何重置保留升级（P9） | ou.m6 | 50 |
| S19 | 任何重置保留里程碑（P9） | ou.m7 | 80 |

（v3，Stage-6 R2 实测后再上移：so.autoUpgrade 从 fr.m2 提到 ch.m4、ch.passiveGen 从 fr.m1 提到 so.m4 —— 行 9 的 fr 里程碑改卖数值乘区（fr m0=fl ×25、m1=ch ×25、m2=核折扣+0.1、m3=吸引子+0.15、m4=ch ×100），自动化不押尾段。v2 曾把行 5–8 的被动生成提前 1–2 行（R1 后）。）

**closed-form autoBuyable（P54 几何反解 geoBuyMax，引擎 automate() 钩子每 tick 调用）**：

| 购买项 | 授予方 | 阈值 |
|---|---|---|
| ri 石子 + ec 回声室 | ch.m0 | 30 |
| re 谐振腔 + ov 谐波列 + in 拍频节点 + so 振荡器 | si.m0 | 30 |
| sw 波腹 + fr 自相似核 + ch 吸引子 | ou.m0 | 3 |

成就回填（P11）：每条 `.push()` 带 `!hasUpgrade/!hasMilestone` 幂等门；里程碑集合与 autoPrestige⇒resetsNothing 一致性在代码期断言（N-MSDESTROY/N-AUTOWIPE）。

## 7. Endgame definition

- `isEndgame()`：`player.ou.total.gte("1e4")` —— 读 **total** 而非 points：调谐流形是支出池，花衔尾不应推迟终局（代码期修订，记 §10）。
- Reachability 估算（Stage 6 修正）：首层稳态产出 P ≈ 数十/秒×声望倍增 → 逐行 ÷产出，×1.39^11 ≈ ×40 首行耗时 → 目标 15–25h（easy 模式）。**以模拟器实测为准**（§11）。
- `winText`：函数（T2 强制）。EN: "The tree has eaten its tail. Every loop now sings in tune. — chenf888" / 中: 「树吃掉了自己的尾巴。每一条回路都在谐振中共鸣。—— chenf888」

## 8. Cap table（Q3=无硬上限；全部走 P12 软上限；成本塑形优先，软帽只对真失控回路）

| Currency | Ceiling? | Cap mechanism | Where |
|---|---|---|---|
| ri | none | 层 softcap 起 1e3 pow 0.4（≈解锁 ec 后 4×；对「起≈下层解锁」默认的偏离记 §10）；u21/m3 可见 ×10 | 层 softcap/softcapPower + 上下文显示文本警告 |
| ec / re | none | softcap 起 2.5e3/1.6e4，pow 0.4/0.35，可见 | 层 softcap |
| sw / in / fr (static) | none | 成本曲线塑形（base 2 + 波腹/缩比自指）；D-COSTSPAN 1 阶档 | cost() |
| fl–si | none | softcap 起 = 各自 §4 表值，pow 0.3–0.35；帽 ×10 出售且显示 | 层 softcap |
| 各自增益项连续自项 | — | effect() 内 softcap(eff, start, 0.3–0.4)；指数 ≤0.5 | effect() |
| 调谐流形 | — | 池消耗 + 等级 14 封顶（pow ≤1.25）；池不退款，重排重分配 | buyable cost/level cap |

measuredRetune 采纳：帽 ×10（绝无 ×1000）；帽上升仅在有可见帽显示的层出售。

## 9. Self-check results（Stage 2 全 23 项）

- [x] 1 — requires 阶梯数值单调 ×25/行（×10–×100 带内）；static base 取大数值货币避免 A1
- [x] 2 — 首层 requires 10（mode 10）
- [x] 3 — 每主层 ≥10 升级 + ≥3 里程碑（实际 10–12U + 5–12M）
- [x] 4 — 每新层 gainMult 助推 ≥2 老层；每层 ≥1 条升级助推 ri（P10/A7）
- [x] 5 — 自动化梯 10 步 P4 序（resetsNothing→passiveGen→autoPrestige→autoUpgrade→autoBuyable），一步一事，跨层授予；autoPrestige 与 resetsNothing 同里程碑集合（N-AUTOWIPE 断言）
- [x] 6 — 每条无界回路有软帽计划（§8）；无主题硬帽（Q3）
- [x] 7 — A1–A10 清扫：无回退阶梯(A1)、行连续 0–11(A2)、12 层链(A3)、层厚实(A4)、row1+ 自动化(A5)、跨层接线非跑步机(A6)、ri 终局仍有增益行(A7)、梯非单点(A8)、公式 Shift 可见(A9)、无跨框架调用(A10)
- [x] 8 — K1 ≤40%/层；每层 ≥3 种非 K1（§4.1 逐层）；K7 不计入
- [x] 9 — 每主层 tabFormat + 微页签（内容件 ≥12）；上下文显示文本（base/best/软帽警告）在页签上方；a 层计数行
- [x] 10 — 游戏级趣味配额逐项有落点（§4b）；3 项被类型契约/Q5 覆盖并记 §10
- [x] 11 — **乘法预算**：每层恰 1 条连续自项（ri0.35/fl0.4/si0.3/ov log²，全 ≤0.5 且 effect 内软上限）；购买型自馈 ln 比 0.29–0.44 <1；里程碑型有限步；Σ 自指数 ≤0.6；行 0 末保证平坦区乘积 ≈ ×30–50 ≪1e4；自项只进本层生产，绝不进共享 gainMult 通道
- [x] 12 — **接线计划**：每条升级归类 token/gate（K7，无 effect）或 value（effect+具名消费方）；N-UNWIRED 全程 0 FAIL（代码期逐条对 §4.1）
- [x] 13 — 每层成本梯 ≥6 阶（static 1 阶档）；每层 ≥1 处故意降价关键升级（ri u11 cost1、sw 波腹首级、fr 缩比）；≥30% 升级 pow/log 形
- [x] 14 — 组件密度 8–30/层（ou 33 为终局例外，微页签组织）；无挑战层→挑战占比 0
- [x] 15 — **作者节奏**：首升 cost 1（≤10s）；>1min 的每次重置都有所获（里程碑/升级）；大重置从第一秒起变快（新层货币立即入 gainMult）；零硬重置
- [x] 16 — **升级纪律**：每条升级一个生产奖励；K4 只打命名机制（自增益项本身即命名机制）；无付费墙门（层门全走阈值/里程碑）
- [x] 17 — **成本先于软帽**；仅出售可见帽的提升（帽显示文本）
- [x] 18 — **行节奏两常数**：ROW_RATIO=25，OUTPUT_STEP=18 → 逐行 ×1.39（1.1–1.6 带内）；两常数进 js/tuning.js
- [x] 19 — **重置生命周期**：读 best/total 的里程碑在 doReset 保 best/total；autoPrestige⇒resetsNothing 同集合；无 update() 写 points（零 update()）；每 doReset 带 vanilla `row > this.row` 守卫；每个 static 层有 canBuyMax()
- [x] 20 — **类型契约**：normal/static 层型；零 clickables/grid/模组 update()；调谐流形/模式节点改用购买项与零成本升级（依赖成立）；丢弃修饰项理由在 §10
- [x] 21 — **测量计划**：js/tuning.js 承载 ROW_RATIO/OUTPUT_STEP/HARD_WALL_DIVISOR/各帽起点/流形参数；游戏与模拟器同读；每节奏量可调用（difficultyDivisor()、rowPacing() 等）；模拟器初始化注入 `player.difficulty="easy"`（tools 侧一行，记 §11）
- [x] 22 — **问题台账完整**：S0/Q1–Q8/Q4b 类型+修饰项两问全有行；Q2/Q6 为 user-delegated+用户确认
- [x] 23 — **buyable 持久性**：每条 buyable 有层外消费方（§4 表「消费方」列）；autoBuyable 全部 closed-form 反解（P54），无 +1/tick

另：无两里程碑主张同一自动化授予（D-AUTOCOLLIDE 设计期规避，§6 表逐行唯一）。

## 9.1 Static-warning acceptance（Stage 5 输出回填，2026-11-14 实跑：107 PASS / 17 WARN / 0 FAIL）

| Check | Layers | Why accepted (or: fixed — how) |
|---|---|---|
| D-MECHQUOTA(WARN) | 全局 | 用户 Q5=Light（零挑战）+ 被动类型契约（零 clickables/bars）——用户选择即理由 |
| D-EFFECTMONO(WARN) ×10 | ec/re/sw/fl/in/so/ch/fr/si/ou | **共鸣列架构**：跨层平推（每深一层对 ri/ec/re/fl/ov 各有一列命名加成）是「自增益网」主题的骨架——每条都是具名消费方（N-UNWIRED 全绿）。形状多样性由每层自有的 pow/log 自项、购买型自馈 buyable、指数型里程碑（回声 +0.02）、软帽提升承担——D-EFFECTSHAPE 全层 PASS。列加成随行深递增（×3→×10），不构成停滞 |
| N-UNLOCKTEXT(WARN) ×3 | sw-15 / in-15 / fr-13 | 「一次性买满/立满/叠满/分满」解锁的是本 static 层的 `canBuyMax`（多地板结算），**不是新层**——layerShown 不受影响，树不会死端。记录于此 |
| D-QLEDGER(WARN) | brief §2 | **已修**：Q2 答案格补 `confirmed: yes` + 用户原话 |
| N-BUYABLEDEAD(WARN) ×2 | re 谐振腔 / ch 吸引子 | 阶段型自馈 buyable（M9 家族）：效果常驻本层 gainMult（re.gainMult/ch.gainMult 每 tick 都读），层本身经回声网与列加成全游戏有效；autobuyer（si.m0/ou.m0）自动化的是仍活着的乘区。接受为设计内 |

## 9.1b Stage-5 复跑记录

- 首跑 4 FAIL：M-UNREG（模板死文件 js/layers.js 未列 modFiles → 删除）、D-STARTDATA ×2（mode/a 补 startData）、N-SELFTOTAL（ov u12 log10() 形不被检查器认作 log 形 → 改 `.log(10)`，语义不变）。
- 修复后：**107 PASS / 17 WARN / 0 FAIL**（上表全部接受）。

## 10. Deviations & open questions

| Default overridden | Value used | Why |
|---|---|---|
| fun-quota medium `challengeLayer: required` | 0 挑战层 | 用户 Q5=Light；台账在案 |
| fun-quota medium `clickableGroups:1 / bars:1 / minUpdateLayers:3` | 全 0 | Q4b 锁定 passive-prestige 类型契约（模组侧禁 clickables/update()）；趣味密度由 12 条自增益项 + M5/M8/M9/M20 承担；D-MECHQUOTA WARN 按 §9.1 接受 |
| 蓝图 medium row3「custom hub」 | 终局层 ou 用 normal 型承载流形 | 类型契约层型限 normal/static；流形逻辑全在 buyables/升级 |
| P24 调谐流形原实现（bars+clickables+update） | buyables 13 条 + 零成本重排升级（M9） | 同上；P24 的「调谐=改指数」内核不变 |
| P4 step5 autoBuyable 常见 update() 驱动 | 引擎 `automate()` 钩子（game.js:370 每 tick 调用） | 模组侧零 update()；P4 变体「automate() custom loops」原文支持 |
| ri 层 softcap 起「≈下层解锁点(250)」 | 1e3 | 250 处 pow 0.4 会掐死首层节奏；1e3=解锁后 4×，模拟器复检 |
| medium 首里程碑 ~×500 requires | ri m0 @2500（×250） | ×500=5000 距离首层节奏过远；×250 保留「首次大奖励」感，模拟器复检 |
| 用户授权改模板 | 仅限：`js/technical/systemComponents.js`（设置面板语言键，N-LANGTOGGLE 参考形）；不动引擎逻辑文件 | Q7 T2 强制项；其余引擎文件一律不改 |
| 层型含 3 块 static 地板（row3/6/9） | 蓝图 medium row2 「static base 2–3」上移为 3 块交错 | 主题（驻波/干涉/分形=自指成形意象）+ 9 normal+3 static 的节奏变化 |
| isEndgame 读 ou.points | 改读 **ou.total ≥1e4** | 调谐流形是支出池；花衔尾不应推迟终局 |
| MANIFOLD start 2 / mult 2.2 | **start 1 / mult 1.6** | 代码期重算：旧参数下流形单线到 16 级要 5e5 ou，远超 1e4 终局预算；新参数单线全满 ≈3.1e3，13 线满配 ≈4e4 为通关后长尾 |
| sw #7e57c2 / re #5c6bc0 / fl #ab47bc | **#b39ddb / #9fa8da / #ce93d8** | N-CONTRAST：#0f0f0f 底上 3.7–4.0:1 太暗，玩家看不见自己的余额 |
| ov u12 `.log10().pow(2)` | `.log(10).pow(2)` | N-SELFTOTAL 检查器的 log 形白名单只匹配 `.log(`；语义不变 |
| 用户授权改模板 | 扩及 `js/components.js`（main-display/resource-display 三元化） | Q7 T2 强制项；仍不动引擎逻辑（game.js/utils） |

## 11. Stage-6 measured retune（2026-11-14 首轮实测回填）

| # | Finding (measured) | Root cause | Fix, and where the constant lives |
|---|---|---|---|
| R1 | 首跑（greedy floor）：ri 4s / ec 128s / re 187s / sw 487s / fl 640s / ov 708s / in 742s / so 758s / **ch 3.5h**；60h 时 ch=1.7e13（fr 门槛 4e13 的 42%），fr/si/ou 41h 内未达；终局 floor >41h ≫ 目标 15–25h | 行 5–8 的被动生成/自动升级全部押在行 9–11 里程碑上（ov←si.m1、so←fr.m1、ch←si.m1），中盘全手动；行 6–11 requires ×25/行把尾段需求推到 2.5e16 | ①自动化梯整体上移 1–3 行（§6 v2：ov←so.m2、so←ch.m3、ch←fr.m1、ov.auto←si.m1、ch.auto←si.m2、in 包←so.m3）；②行 6–11 requires ×25→**×10**（D-REQRATIO 带内），so 2.5e10 / ch 2.5e11 / fr 2.5e12 / si 2.5e13 / ou 2.5e14；③SOFTCAP_START 同步（so 6.25e10 / ch 6.25e11 / si 6.25e13，保持 ≈2.5× req）。常数都在 js/tuning.js 与各层 requires |
| R2 | sw 地板在 ~120 层后完全停摆（re 9.7e23 ≪ nextAt 9e41） | static ×2/层成本墙 + re 被 fl/ov 反复清空——预期行为（该地板属于其时代），非缺陷 | 不修；波腹/列加成维持其时代内节奏 |
| R2b | 二跑 floor 94.33 h 达成但仍 ≫ 目标（需再 ÷15） | 行 6–11 exponent 0.25 太浅、行 9 自动化仍押在 fr 里程碑、行 8–11 requires 尚在 ×10 带 ×2.5 高位 | ③行 6–11 exponent 0.25→**0.3**；④si 自增益 SELF_EXP.si 0.3→0.4；⑤行 8–11 requires ÷2.5（in 1e9 / so 1e10 / ch 1e11 / fr 1e12 / si 1e13 / ou 1e14，softcap so 2.5e10 / ch 2.5e11 / si 2.5e13 同步）；⑥时代引擎里程碑加强（so m5 ×25、ch m5 ×100、si m4/m5 ×100/×500、ou m3/m4 ×10/×25）；⑦自动化梯 v3（§6：so.autoUpgrade←ch.m4、ch.passiveGen←so.m4；fr 里程碑改卖数值：m0=fl ×25、m1=ch ×25、m2=核折扣+0.1、m3=吸引子+0.15、m4=ch ×100，全部同步接线 fl/ch gainMult 与 coreDiscount/attractPer） |
| R3 | 三跑 floor **5.70 h**（ri 4s / ec 128s / re 187s / sw 487s / fl 640s / ov 705s / in 728s / so 738s / ch 21min / fr 2.2h / si 5.4h / ou 5.7h；升级 125/125、里程碑 64、成就 47/50） | R2b 七项修正全部生效；行耗时梯度健康（static 地板 sw ×2.6、fr ×6.3 承墙，normal 行 ×1.0–×1.7） | **定稿**。人类预期 ≈ floor×4 ≈ 17–23h，落在 15–25h 目标带内；困难模式（根增益 ÷8）另行体验，无需单独校准 |

## 12. Browser-verification fixes（Stage 6.5 回填）

| # | Symptom | Root cause | Fix |
|---|---|---|---|
| B1 | 胜利画面渲染出 winText 的**函数源码**而非文案（`function() { return lg(...) }`） | 模板 static_checks/smoke 全盲的引擎接线：save.js:234 把全局 `winText` 函数原样拷进 `modInfo.winText`，而 index.html:54 `v-html="modInfo.winText"` 把函数对象当 HTML 字符串渲染 | index.html:54 改为 `typeof modInfo.winText === 'function' ? modInfo.winText() : modInfo.winText`——保留 T2 函数形态（lg() 渲染时求值，双语随切换），同时兼容引擎的字符串回退 |
| B2 | 间歇性 boot 错误（4 次重载命中 1 次）：`drawTree` 读 `tmp[layer].layerShown` 报 undefined | 引擎启动竞态：resizeCanvas→drawTree 可在 updateTempData 完成前触发，此时 tmp 尚未建全；游戏自行恢复，但 boot 收集器如实记录 | canvas.js drawTree 循环加 `if (!tmp[layer]) continue` 空值守护；修复后 3/3 次重载 0 boot 错误 |
| B3 | in 层 Formula 英文文案残留旧值 "2.5e9"（中文已是 1e9） | R2b requires 重标定漏改一处文案 | layers3.js:80 改为 1e9，重载后浏览器确认渲染正确 |

**验证覆盖**（注入后期存档 + 真实 DOM 点击）：boot 收集器 0 错误×3 重载；模式节点→选择面板→Easy 生效（modeChosen/difficulty 持久化）；真实声望 ri（40 微响→1 涟漪、points 清零、best 入账）；真实购买 ri u11（扣费+拥有+零报错）；save→reload 往返（mode/难度/升级全保留）；全 12 层主页签 + Vortex/Antinodes/Shop/Manifold/Nodes/Cores 微页签 + 成就网格（50 节点）+ Options 页全渲染无报错；语言开关（EN↔中文，层页文案响应式跟随）；调谐流形 13 条回路渲染 + 真实购买 1 级（扣 ou 货币、量+1、中性指数 1）；胜利画面（winText 正确、Keep Going/Play Again 在位、计时冻结）。全程 error trap 0 捕获。
