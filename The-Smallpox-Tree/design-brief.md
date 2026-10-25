# Design Brief — 《天花树》The Smallpox Tree

> 纪念 1979-10-25 人类天花绝迹日。树从天花病毒的起源开始，随历史弧线推进到根除认证。
> 本文档在写任何代码之前完成（SKILL.md Stage 2）。所有默认值来自
> `assets/blueprints.json` 与 `assets/balance-defaults.json`；偏离项在 §10 记录。

## 1. Identity

| Field | Value |
|---|---|
| Game name | 天花树（The Smallpox Tree）；游戏目录 `The-Smallpox-Tree` |
| Author | chenf888（用户确认） |
| Points name (`modInfo.pointsName`) | 病例 |
| Language mode (Q7) | **T2 双语切换**：`window.chinesemode` 三元（P17 惯例）；覆盖 main-display（07 Part F7）；引擎自带 chrome 字符串保持英文（T2 范围，见 §10） |
| One-line pitch | 三千年瘟疫如何在一场全球协作中被按下归零键——从跨种溢出的第一例病例，到日内瓦的根除证书。 |

## 2. Interview record (answers → parameters) — the question ledger

| # | Question | Answer（用户原话） | Locked parameter |
|---|---|---|---|
| S0 | Theme（用户直接给出主题） | 「使用TMTSKILL制作一个游戏，主题为天花，纪念1979年10月25日人类天花绝迹日」 | 主题锁定，进 Q1 |
| Q1 | Theme-structure confirmation | 「游戏名为天花树，制作这个树是为了纪念10-25。因此这个树从天花病毒的起源开始」 | 游戏名=天花树；树的叙事从病毒起源开始（见下方三行 recap） |
| Q2 | Scale | 「Medium（推荐）」 | blueprint `blueprints.medium`（10–16 层，10–30h） |
| Q3 | Natural ceilings | 「Mixed 混合（推荐）」 | §8 cap 表逐资源定：覆盖率/反弹压强硬上限，其余无界 |
| Q4 | Pacing | 「Balanced 均衡（推荐）」 | 默认蓝图行为 + 蓝图趣味配额 |
| Q4b | Type + modifier multi-select | 类型：「纯挂机声望链（推荐）」；修饰符：「score-attack, 这个M2得分挑战可以理解为这个天花一会不管控得病率就又上升了」+「story（推荐）」 | §2b；score-attack 按用户定义实装为**疫病反弹机制**（§3/§10 偏离1） |
| Q5 | Side content | 「Full（推荐）」 | 挑战 + 成就 + 剧情/仪表盘侧层 |
| Q6 | Automation & timewalls | 「全自动终可达（推荐）」 | 完整 8 步阶梯（§6），长墙 < 15 min |
| Q7 | Language & style | 「T2 双语切换（推荐）」 | P17 chinesemode 三元；main-display 覆写 |
| Q8 | Endgame flavor | 「消耗式重置（推荐）」 | M19 消耗式重置：根除认证行动逐项消耗库存后签发印章（§7） |

（作者署名另问并确认：「chenf888（推荐）」→ modInfo.author = chenf888。）

**Q1 三行 recap（用户确认后吸收其修改：游戏名=天花树，从病毒起源开始）：**

- **Currencies (in order):** 病例（病毒起源期即开始增长的基础点数）→ 接种者（人痘层）→ 免疫公民（牛痘层，含"覆盖率%"子进度硬上限 100%）→ 疫苗剂量/病毒认知/协作资金（三支持分支）→ 围堵行动/冷链节点/接种队（三静态支柱）→ 战役进度（min 汇流）→ 认证印章（终局）
- **Layer topology:** 10 主层 = row0 `var` 锚点 → row1 `vac/pro/knw/int` 四分支 → row2 `sur/cc/mob` 三静态 → row3 `cmp` min 汇流枢纽 → row4 `cert` M19 发射层；侧层 `hist`（成就 5×10 + 剧情章节）+ `dash`（疫情档案仪表盘，P13）
- **Ceilings:** 覆盖率 % 硬上限 100；反弹压强 % 硬上限 100；其余资源无界（cost-shaping 为主，软上限仅防失控环）

## 2b. Game type profile (Q4b)

`node scripts/classify.js` 首跑 exit 3（脚本原问已原样转问用户），用户答后 `--explicit passive-prestige` 复跑 exit 0。

| Field | Value |
|---|---|
| Type | `passive-prestige`（声望+静态为主，累积/解锁/重置） |
| User confirmation (verbatim) | 「纯挂机声望链（推荐）」 |
| Confidence + margin | 0.75 / 0.733（explicit 显式锁定） |
| Mandatory components | `normal` + `static` 层 |
| Forbidden components | `clickables`、`grid`；核心循环不用 `update()`——但见 §10 偏离 1（用户原话要求时变反弹机制 → 覆盖通道） |
| Rules exempt for this type | `D-NOUPDATE`（**因偏离 1 依规弃权**：tick 必须真实，全部 T-* 规则保持激活） |

Modifiers（max 1 interaction type；其余皆修饰符）：

| Modifier | Requires | Included? | Notes / why dropped |
|---|---|---|---|
| `sim` | — | **是** | 承载反弹机制的 `update()`（sur 层主 tick + cmp 自动买驱动），≤3 层预算内 |
| `score-attack` (M2) | type `active-*` + `sim` | **否（scaffold 依硬依赖降级）** | 降级原因（scaffold 原话）：`requires type active-tick or active-click, type is passive-prestige`。**用户的设计意图不受影响**：反弹机制（压强/峰值/zeroTime）作为 `sim` 修饰符内容完整实装（§3 规格不变），只是注册表语义上不再挂 M2 名分；见 §10 偏离 1 |
| `minigame` (M3) | type `active-*` | 否 | 用户未选；且 passive 禁 clickables |
| `boss-rush` (M12) | type `active-*` + `sim` | 否 | 用户未选 |
| `gacha` (M13) | type `active-*` | 否 | 用户未选 |
| `casino` (M14) | type `active-*` | 否 | 用户未选 |
| `story` (M15) | — | **是** | 编年史章节侧层（hist 内 unlock-gated 微页签），切割场景引擎为 large-only 不使用 |
| `board` | — | 否 | 非网格玩法 |
| `challenges` (M1) | — | **是** | Q5 Full；`canComplete()` 主方言 |
| `caps` | — | **是** | Q3 Mixed；§8 cap 表 |

## 3. Theme = structure mapping (P14)

**树的叙事弧线 = 天花三千年史。** 起点 = 病毒起源：基础点数"病例"从 0 开始自然增长，`var` 层最早的升级/里程碑是起源与传播史事件（跨种溢出、农耕定居、拉美西斯五世木乃伊、安东尼瘟疫、丝路商队）。第一次声望 = 人类第一次反制（人痘接种），**每次重置就是一次接种/围堵行动**（病例被压下去），而病毒会随时间反弹（用户定义的反弹机制）——声望循环本身就是"疫情—压制—反弹"的流行病学节律。终点 = 1979-10-25 绝迹日的根除认证（M19 发射）。

主题→机制映射表：

| 历史事实 | 游戏机制 |
|---|---|
| 起源 ~1 万年前，最早证据拉美西斯五世（前1157） | points=病例的初始增长；var 早期升级 |
| 人痘接种（明代中国→1721 欧洲） | row0 锚点层 var |
| 牛痘（詹纳 1796-05-14）、1805 牛痘入华（邱熺）、Balmis 远征 | vac 分支 + 覆盖率% 子进度（硬上限 100） |
| 小牛淋巴→甘油苗→Collier 冻干苗、双叉针（Rubin 1965） | pro 分支：疫苗剂量；分装线 buyable |
| 冷链与后勤（冻干耐热苗使热带战役可行） | cc 静态层：冷链节点（消耗剂量建造） |
| 国际协作（1950 泛美、1959 WHA、1967 强化计划、苏美捐苗） | int 分支 = M8 商店层（协作资金买全局增幅） |
| 病毒学关键事实：单一宿主、无隐性带毒、终身免疫、特征性皮疹 | knw 分支：里程碑=四大事实，每条给永久全局增幅 |
| 监测-围堵（Foege 尼日利亚 1967 环状接种、电报报告、悬赏） | sur 静态层 + **反弹压强** + 监测奖励金（M5 副货币） |
| 战役前线：巴西 1971→南亚 1975→埃塞 1976→索马里 1977-10-26 最后一例（Ali Maow Maalin） | cmp min 汇流枢纽的 12 级里程碑链 |
| 两年零病例监测期、区域认证、1979-12-09 全球委员会、1980-05-08 WHA33.3 | cert 12 级认证里程碑链 + M19 发射 |

**反弹压强机制（Q4b score-attack 用户变体，实装规格）：**
- 状态在 `sur.startData()`：`pressure`（反弹压强，0–100 硬上限）与 `peak`（历史最高发病率，M2 maxpoints 同构）+ `zeroTime`（零病例累计时长）。
- `sur.update(diff)`：`pressure += PRESSURE_RATE×diff×(1−减速项)`；压强 > 30% 时病例产出 ×(1+pressure)（**"不管控，得病率就又上升"**，用户原话）；压强 > 70% 时 vac/pro 产出 ×0.5（疫情拖慢接种行动）。
- 压制动作 = sur 的静态声望本身（开展围堵行动）：`onPrestige` 置 `pressure=0`、`peak=max(peak,pressure)`；后期里程碑自动围堵（autoPrestige）。
- 峰值回报：sur 升级「以史为鉴」效果=f(peak)（K3/K6），峰值越高围堵越强——风险与回报同源。
- 终局联动：cert 发射要求 `pressure ≤ 1`（LAUNCH_PRESSURE_LIMIT）；「连续两年零病例」里程碑读 `zeroTime`（压强 ≤ 0.1 时累计，ZERO_TIME_PRESSURE_LIMIT）。
- HUD：sur 层 1 根压强进度条（`progress()=pressure/100`，显示型，非核心循环）。

## 4. Layer chain table

（自下而上；底行先列。数量满足 blueprint.medium：10 主层，row1 [2,4]、row2 [2,3]、row3 [1,2]、rows 0–4。）

| id | name | row | pos | type | base resource → baseAmount | requires | exp/base | upgrades | milestones | challenges | buyables | automation granted（哪层哪里程碑） | softcap plan | doReset keeps | branches |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| var | 人痘接种 | 0 | 0 | normal | 病例 → player.points | 10 | 0.5 | 5×3=15 | 5 | — | 1（接种点，效果回流病例产出） | vac m0 保留升级；vac m2 passiveGen；pro m2 autoPrestige；pro m4 autoUpgrade；ach47 autoUpgrade 备路 | 层级软上限 start≈vac 解锁点，power 0.1（measured-retune 形态） | 常规 keep=["unlocked","auto"]+里程碑门控 | — |
| vac | 牛痘疫苗 | 1 | 0 | normal | 接种者 → player.var.points | 1e5（×1e4，跨货币） | 1/3 | 5×4=20 | 6 | 2 | 1（免疫证书，效果进 covPct） | int m3 autoPrestige→passiveGen；cmp m8 打包 | 自缩放升级 1 枚（pow 0.4 + 软上限 start 1e9, power 0.1）；覆盖率% 硬上限 100（softcap(x,100,0)） | keep unlocked/auto/milestones→upgrades | [var] |
| pro | 疫苗生产 | 1 | 1 | normal | 接种者 → player.var.points | 1e8 | 1/3 | 5×4=20 | 5 | — | 1（分装线，剂量引擎） | var autoPrestige/autoUpgrade 授予者；cmp m8 打包 | 分装线 ln(eff)/ln(cost)<1（成本 2^x 效果 1.5^x） | keep unlocked/auto | [var] |
| knw | 病毒研究 | 1 | 2 | normal | 接种者 → player.var.points | 1e11 | 1/3 | 5×3=15 | 6（四大事实链） | — | — | cmp m8 打包；knw m3 授予 autoBuyable(pro 11) | 认知增益 log10 形（K2） | keep unlocked/auto | [var] |
| int | 全球协作 | 1 | 3 | normal | 接种者 → player.var.points | 1e14 | 1/3 | 5×4=20 | 6 | 1 | 1（双边协定） | int m3 → vac passiveGen；cmp m8 打包 | 商店升级 K4/K5 为主，无自缩放 | keep unlocked/auto | [var] |
| sur | 监测围堵 | 2 | 0 | static | 接种者 → player.var.points（偏离11） | 1e5（2^L 等级成本为主闸门） | base 2, exp 1 | 5×4=20 | 6 | 3 | — | cmp m4 打包（resetsNothing+autoPrestige） | canBuyMax() 由升级解锁（N-STATICMAX）；反弹压强硬上限 100 | keep unlocked/auto/milestones | [var,vac] |
| cc | 冷链后勤 | 2 | 1 | static | 疫苗剂量 → player.pro.points | 1e11 | base 2, exp 1 | 5×3=15 | 5 | — | — | cmp m4 打包 | canBuyMax() 由升级解锁 | keep unlocked/auto/milestones | [pro] |
| mob | 接种动员 | 2 | 2 | static | 免疫公民 → player.vac.points | 1e9 | base 3, exp 1 | 5×3=15 | 5 | — | — | cmp m4 打包 | canBuyMax() 由升级解锁 | keep unlocked/auto/milestones | [vac] |
| cmp | 全球战役 | 3 | 0 | custom | min(围堵行动, 冷链节点, 接种队) → P53 汇流 | 100（汇流单位） | getResetGain：pow 0.4，乘区置于 pow 两侧（P8） | 5×3=15 | 12（战役前线链） | — | — | m2 授予 autoBuyable(pro 11) 闭式驱动（P54，驱动在 cmp.update）；m4 row2 打包；m8 row1 打包 | 战役进度软上限 start≈cert 解锁，power 0.1 | keep unlocked/auto/milestones | [sur,cc,mob] |
| cert | 根除认证 | 4 | 0 | custom | 战役进度 → player.cmp.points | 50 | M19 发射：消耗 剂量≥A ∧ 资金≥B ∧ 围堵≥C ∧ 战役≥D（逐项 UI）+ pressure≤1 + 监测期 ladder | 5×3=15 | 12（认证链，末位=绝迹日印章） | — | — | cert m2 全局 autoUpgrade 终点 | 发射消耗逐项列出（P42）；无自缩放 | 发射重置 ≤3 行（里程碑门控保留） | [cmp] |
| hist | 历史档案 | side | — | none | — | — | — | — | — | — | — | 50 成就（5×10）；P11 回填带 ！has 守卫；ach47=autoUpgrade(var) 备路 | — | 不重置 | — |
| dash | 疫情档案 | side | — | none | — | — | — | — | — | — | — | 发病率/峰值/覆盖率/纪年仪表盘（P13，主层喂入）+ 剧情章节微页签（M15，unlock-gated） | — | 不重置 | — |

合计（Stage 6 引擎实数，冻结构建）：10 主层 + 2 侧层；升级 135、里程碑 68、挑战 6、buyable 5、bar 1、clickable 0。（实装相对纸面计划的差值来自 K2/K3 转换与 cmp 升级收敛——Stage 4 内完成，README 表以本数为准）

**规则遵守（自检 1–5、19 的表格级承诺）**：requires 阶梯单调（10→1e5/1e8/1e11/1e14→row2 1e5/1e11/1e9→cmp/cert 动态）；**跨货币拉宽**（Stage 6 实测 ×1e2–1e4，D-REQRATIO ×1e4/×1 已在 §9.1 接受——corpus 带宽假定单货币，本树 row1 共用接种者、row2 各吃下游产出，真正的闸门是 static 2^L 等级成本与发射价位）；首层 requires 10（P1）；每主层 ≥15 升级 + ≥5 里程碑（A4）；**每个新层在其 gainMult 至少给 2 个更老层各加 ≥1 行，且 ≥1 个升级反哺 var**（P10/A7，逐层 wiring 见 §12-wiring 列与 Stage 4 代码）；阶梯 8 步（§6）；所有无界环有软上限计划（§8）。

### 4.1 Fun density table (handbook 10 §2/§5)

效果种类配额：medium `maxK1SharePerLayer=0.4`；每层 ≥3 种非 K1；K7 不计 K1 份额。

| id | content items | effect-kind plan（示例，代码按此分类） | organization | mechanics |
|---|---|---|---|---|
| var | 15U+5M+1B=21 | u11 K1（首升级 cost 1，≤10s 首增幅）；u12 K2 pow(0.5)；u13 K3（源 vac）；u15 K8（病例产出/秒）；m0 K1×2.5；m4 K7（解锁 knw 叙事页）；B11 K1→K4（接种点命名机制） | tabFormat：main-display/prestige-button/上下文 display-text（base+best+软上限预警）/microtabs（升级\|里程碑） | — |
| vac | 20U+6M+1B+2C=29 | u21 K2（自缩放 pow0.5+软上限，本层唯一自缩放）；u22 K3（源 pro 剂量）；u23 K5（覆盖率上限提升 90→95→100，上限可见）；u25 K7 解锁 pro 页签；C×2 inChallenge 注入老层 | microtabs：升级\|覆盖率\|里程碑\|挑战 | M5 覆盖率子进度 |
| pro | 20U+5M+1B=26 | u31 K1；u32 K2 log10；u33 K3（源 cc）；u35 K7；B11 分装线 K4（剂量引擎，跨层消费：vac.gainMult 读 getBuyableAmount('pro',11)、cmp 汇流、cert 发射消耗） | microtabs：升级\|生产线\|里程碑 | — |
| knw | 15U+6M=21 | m2–m5=四大事实（K4 命名机制：单一宿主→病例产出效率^1.1 等）；u41 K3；u42 K2；u44 K5 | microtabs：研究\|事实\|升级 | — |
| int | 20U+6M+1B+1C=28 | 商店层：u51–u54 K4/K5（双叉针效率^1.1、冷链时效、监测奖励×2、认证折扣）；u55 K7；B11 K1 | microtabs：商店\|协定\|里程碑 | M8 商店 |
| sur | 20U+6M+3C=29 | 反弹压强（K9 状态：pressure/peak/zeroTime）；u61 以史为鉴 K3/K6（f(peak)）；u62 K5（压强增速减半）；u63 K8（监测奖励金产出）；C3 用 inChallenge 调压强速率/断冷链 | microtabs：围堵\|压强（HUD bar）\|升级\|挑战 | M1×3、M2 变体（peak）、M5 奖励金、K9 反弹 |
| cc | 15U+5M=20 | u71 K2；u72 K3（源 mob）；u73 K4（冷链时效，命名机制）；m2 K7 解锁 mob；M 节点数回流出行 | tabFormat 基础款 | — |
| mob | 15U+5M=20 | u81 K2；u82 K3（源 var 接种者）；u83 K5；m2 K7 | tabFormat 基础款 | — |
| cmp | 15U+12M=27 | 里程碑=前线链（K7 解锁+K1/K4 奖励交替：巴西 1971/南亚 1975/非洲之角 1976/索马里 1977）；u91 K3（min 汇流显示）；u92 K2；m11 K7 解锁 cert | microtabs：战役\|前线\|里程碑 | M7 custom（min 汇流） |
| cert | 15U+12M=27 | M19 发射（逐项消耗清单）；里程碑=认证链（末位 1979-10-25 印章）；u12x K5（发射折扣） | microtabs：认证\|发射\|里程碑 | M19 消耗式重置 |
| hist | 50A | 成就=史实编年 + 机制梗（双语）；奖励=平乘 + 唯一自动化备路（ach47） | 5×10 网格 + 剧情章节微页签 | M10、M15 |
| dash | 0U | 纪年（P13 主层喂入）、发病率/峰值/覆盖率读数、剧情章节列表 | display-text 群 | P13 仪表盘 |

### 4b. Game-level fun plan（quota: fun-quota.json `medium`）

| Quota | Planned | Where |
|---|---|---|
| Distinct mechanics ≥4 | **7**：M1 挑战、M2 变体（peak 得分）、M5 副货币、M7 custom 汇流、M8 商店、M19 消耗发射、K9 反弹压强 | §4.1 |
| Challenge layer | 6 个 M1 经典挑战（sur×3、vac×2、int×1），`canComplete()` 方言 | sur/vac/int |
| Clickable group(s) | **0** —— passive-prestige 类型契约禁止（§10 偏离 2；D-MECHQUOTA 对 passive 收窄为仅挑战项） | — |
| Bar(s) ≥1 | 1：反弹压强 HUD 条（progress()=pressure/100） | sur |
| update() 层 ≥3 | 3：sur（反弹主 tick）、cmp（autoBuyable 闭式驱动 + 打包调度）、hist（P11 回填） | §4.1 |
| Secondary currency ≥1 | 1：监测奖励金（sur.update 产出、sur 升级消费） | sur |
| Shop/meta layer | int 全球协作（K4/K5 为主） | int |
| Custom-type ritual layer | cmp（min 汇流）+ cert（M19） | row3/4 |
| Story presentation | hist/dash 剧情章节微页签，unlock-gated | hist, dash |
| autoBuyableDrivers ≥1 | 1：cmp m2 → pro.11 闭式 buyMax（成本 2^x → log 逆解，P54） | cmp.update |

## 5. Tree sketch

```
row4:                        [ cert 根除认证 ]
row3:                        [ cmp 全球战役 ]
row2:      [ sur 监测围堵 ] [ cc 冷链后勤 ] [ mob 接种动员 ]
row1: [ vac 牛痘 ] [ pro 生产 ] [ knw 病毒研究 ] [ int 协作 ]
row0:                   [ var 人痘接种 ]
side:      ( hist 历史档案·成就 5×10·剧情 )   ( dash 疫情档案·仪表盘 )
```

## 6. Automation ladder（8 步 + P11 备路；跨层授予；一阶一务）

| Step | Grants（哪项家务消失） | Granted by | Threshold |
|---|---|---|---|
| 1 | var 重置不再清空升级/里程碑（doReset keep 门控） | vac m0 | 500 接种者 |
| 2 | var passiveGeneration（自动接种） | vac m2 | 2e3 |
| 3 | var autoPrestige（自动接种行动） | pro m2 | 2e3 剂量 |
| 4 | var autoUpgrade | pro m4 | 1e5 剂量 |
| 5 | **autoBuyable(pro 11)**：cmp.update 内闭式 buyMax（P54 log 逆解；仅因 N-BUYABLEDEAD 跨层消费者成立） | knw m3 | 5e3 认知 |
| 6 | vac autoPrestige | int m3 | 5e4 资金 |
| 7 | row2 打包：sur/cc/mob autoPrestige + resetsNothing | cmp m4 | 500 战役进度 |
| 8 | row1 打包：vac/pro/knw/int autoPrestige+autoUpgrade+resetsNothing | cmp m8 | 1e4 战役进度 |

- **autoPrestige ⊃ resetsNothing 集合律**（03 §4.1）：授予 autoPrestige 的里程碑集合必须蕴含授予 resetsNothing 的集合——step 7/8 同一里程碑同时授予两 flag；var 的 autoPrestige（step 3）晚于其 keep 门控（step 1），集合比较通过。
- P11 备路：hist ach47 → autoUpgrade(var)（带 `!hasUpgrade` 幂等守卫）；若干成就回填里程碑（同守卫）。
- 阈值间距 ~×2 早期 → ×5–10 后期（blueprint medium）。

## 7. Endgame definition

- **isEndgame()**: `hasMilestone("cert", 8)` —— 里程碑 #8 = 「★印章 9 —— 1979-10-25 人类天花绝迹日★」（`done() = cert.best ≥ 9`，即第 9 发认证发射）；#9–#11（全球委员会 1979-12-09、WHA33.3 1980-05-08、档案封卷）为 post-win 内容。cert 里程碑链：最后一例康复(1977-10-26) → 两年零病例监测（zeroTime）→ 区域委员会逐区认证 ×4 → 绝迹日 1979-10-25 → 全球委员会签署 1979-12-09 → WHA33.3 1980-05-08 → 实验室封存（CDC+VECTOR 两处）→ 档案封卷。
- **M19 发射（cert.getResetGain / canReset，第 n 印 = `player.cert.points`）**：逐项清单（tabFormat 列出，绿/红着色）——疫苗剂量 ≥ `1e7×12^n`、协作资金 ≥ `1e5×6.3^n`（2026-10-25 6→6.3，§12 #12）（int u41/c11/buyable11 折扣）、围堵行动 ≥ `10+5n`、战役进度 ≥ `50×2.5^n`（cmp m10 ×0.75）、发射瞬间压强 ≤ 1、且**累计零病例监测期 ≥ `600(n+1)+300·n(n+1)/2` 秒**（首印免监测；逐发递增=「最后一英里」节奏阀）。发射重置 row ≤3（里程碑门控保留）。曲线全部入 tuning.js（LAUNCH_* 常数），游戏与模拟器同读。
- **winText**（双语函数）：「1979年10月25日，人类天花绝迹日。1980年5月8日，世界卫生大会正式宣布：天花——被消灭。谨以此树纪念三千年瘟疫的终结，与所有为之奋斗的人。」
- ROW_RATIO = ×25（requires 阶梯）；OUTPUT_STEP = ×18（每行累计乘区）→ **每行时间 ×1.39**（11 §4.1 目标带 ×1.1–×1.6；5 行总漂移 ×5.2）。两常数入 `js/tuning.js`，游戏与模拟器同读（自检 21）。目标总时长 12–20h（medium），Stage 6 实测为准。

## 8. Cap table

| Currency | Ceiling? | Cap mechanism | Where |
|---|---|---|---|
| 病例/接种者/免疫公民/疫苗剂量/协作资金/病毒认知/围堵行动/冷链节点/接种队/战役进度 | 无界 | **cost-shaping 为主**（作者规则 #6）；仅 vac 自缩放升级与战役进度设软上限：start≈下层解锁点，power 0.1（measured-retune），上限可见、升级 ×10 提升（1e12–1e18 价位） | layer softcap / effect() 内 softcap() |
| 覆盖率 % | **是** | 硬上限 `softcap(x, 100, 0)`；阶梯止于 100 | vac 显示与里程碑门控 |
| 反弹压强 % | **是** | 硬上限 100（满值=全面爆发） | sur.update |
| 发病率峰值 peak | 无界（记录型） | 无（仅 max 跟踪） | sur |

## 9. Self-check results（SKILL.md Stage 2 全部 23 项）

- [x] 1 — requires 阶梯单调，相邻行 ×25–×100（§4）
- [x] 2 — 首层 requires 10（P1 模式值）
- [x] 3 — 每主层 ≥15 升级 + ≥5 里程碑（major 层 cmp/cert 各 12）(A4)
- [x] 4 — 每新层 gainMult 反哺 ≥2 更老层；每层 ≥1 升级反哺 var（§4 承诺，Stage 4 逐层 wiring 表落实）
- [x] 5 — 阶梯 8 步、P4 序（resetsNothing→passiveGen→autoPrestige→autoUpgrade→autoBuyable）、一阶一务、跨层授予（§6）
- [x] 6 — 无界环软上限计划（§8）；主题硬上限（覆盖率/压强）softcap(x,cap,0)
- [x] 7 — A1–A10 扫描：无反向阶梯、无跳行、≥3 主层、无薄层、无单点自动化、公式有显示（Shift 公式 QoL）、无跨框架调用（§10 记录例外）
- [x] 8 — K1 ≤40%/层；每层 ≥3 非种 K（§4.1 逐层）
- [x] 9 — 每主层 tabFormat；≥3 内容组上 microtabs（全部主层）；上下文 display-text（base/best/软上限预警）
- [x] 10 — 游戏级趣味配额达标（§4b，7 种机制）
- [x] 11 — 乘区预算：每层 ≤1 自缩放（pow ≤0.5 + 软上限）；Σ自缩放指数 ≤0.6；row0 末平坦乘区积 ≈×10 ≪1e4
- [x] 12 — wiring 计划：170 升级逐一枚分类 token/gate（K7 无 effect）或 value（effect + §4.1 指名消费者）；无双列皆无
- [x] 13 — 每层成本阶梯 ≥6 数量级 + 至少 1 处刻意的"钥匙廉价升级"；≥30% pow/log 形（11 §3–4）
- [x] 14 — 组件密度 20–29/层；挑战 ≤15% 升级数（sur 3/20=15% 顶格、vac 2/20、int 1/20）；无界环层软上限（§8）
- [x] 15 — 作者节奏：首升级 cost 1（≤10s）；>1min 的重置每次都有新购买；大重置从第一秒起变快；无硬重置（12 §1）
- [x] 16 — 一升级一生产加成（≤2 且跨异类资源才允许 2）；无升级增强另一升级隐藏数值（K4 仅命名机制）；阈值门控无付费门（N-UNLOCKPAYGATE：层解锁走里程碑阈值）
- [x] 17 — cost 造阶优先；软上限仅防失控且可见（measured-retune 形态）
- [x] 18 — ROW_RATIO=25 / OUTPUT_STEP=18 → 每行 ×1.39（§7，两常数入 tuning.js）
- [x] 19 — 读 best/total 的里程碑层 startData 含 best+total 且 doReset 保留两者；autoPrestige⊃resetsNothing 集合律（§6）；无 update() 写 player[x].points（反弹写 sur 自有状态字段，非 points）；doReset 带 vanilla `row > this.row` 守卫；静态层全部有 canBuyMax()
- [x] 20 — 类型契约：passive 必备 normal+static ✓、禁 clickables/grid ✓（0 clickable、0 grid）；update() 因偏离 1 为真实 tick（T-TICKREG：所有 hook 有定义、DNC 清单登记）；修饰符依赖成立（sim ✓ / score-attack 经覆盖通道）/未选者记 §10
- [x] 21 — 计量计划：PACING 常数居 `js/tuning.js`（ROW_RATIO/OUTPUT_STEP/PRESSURE_RATE/COVERAGE 常数/发射价位），游戏与 `tools/simulate.js` 同读；所有节奏量可调用
- [x] 22 — 问题台账完整：S0/Q1–Q8/Q4b（类型+修饰符多选）+ 作者署名，全部用户原话（§2/§2b），无空白行、无未确认代答
- [x] 23 — buyable 持久性：4 个 buyable 各有跨层消费者（§4.1 指名）；autoBuyable 阶梯第 5 步闭式驱动（§6 step 5）；无 +1/tick 反模式（D-AUTOINVERT）

## 9.1 Static-warning acceptance（Stage 5 输出）

| Check | Layers | Why accepted (or: fixed — how) |
|---|---|---|
| N-AUTOWIPE | cc/mob/sur/var（auto 标志跨重置保留但无读取者） | **接受（系统性设计）**：Q6 全自动终可达——自动化为里程碑门控的**常开**行为（引擎 game.js:369 无开关路径），所有里程碑/升级文案只说"自动"从不承诺"可切换"，玩家预期一致。4 层 checked 全部 autoPrestige⊃resetsNothing 同里程碑授予。 |
| D-REQRATIO ×1e4 | row0→row1（cases 10 → 接种者 1e5） | **接受（跨货币）**：corpus 带宽 ×10–×100 假定相邻行同一货币；本树 row1 全部吃 var.points，cases 只是 row0 的显示货币。实测拉宽见 §11 #1。 |
| D-REQRATIO ×1 | row1→row2（1e5 → 1e5/1e11/1e9） | **接受（多货币静态阶梯）**：row2 三静态各吃不同下游产出（接种者/剂量/公民），requires 只定首级行情，真正的闸门是 2^L 等级成本曲线与发射链；sur 取 1e5 与 vac 同档避免 D-REQLADDER 倒挂。 |
| D-EFFECTMONO ×6（初跑） | var/vac/pro/sur/cc/mob | **已修复（非接受）**：33 个平乘升级转为 K2/K3 形态（log/pow 于 best/total/跨层资源），复跑 102 PASS / 1 WARN。 |
| N-BUYABLEDEAD（初跑 vac.11） | vac | **已修复（非接受）**：免疫证书效果接入 mod.js covPct()（层外消费者）。 |
| D-COSTSPAN（静态层口径） | sur/cc/mob | 静态层货币是地板计数（个位数~几百），按 `fun-quota.json costSpanMinOrdersStatic=1` 的静态口径执行（checker PASS）；brief §9 第 13 项的"≥6 数量级"只适用于 normal 层。 |

复跑终值：**static 102 PASS / 1 WARN / 0 FAIL**（checker 报告 + 本表 = 完整账）。

## 10. Deviations & open questions

| Default overridden | Value used | Why |
|---|---|---|
| 偏离1（合法覆盖通道，13 §3） | 主类型 passive-prestige 保持不变；`sim` 修饰符承载 1 个真实 update() 层（sur 反弹主 tick + cmp 驱动 + hist 回填 ≤3 层）；`D-NOUPDATE` 豁免**依规弃权**，全部 T-* 规则激活 | 用户原话为 score-attack 赋予主题定义：「这个M2得分挑战可以理解为这个天花一会不管控得病率就又上升了」——时变反弹机制必须有真实 tick；M2 硬依赖（active-*+sim）中的 sim 已满足，tick 真实。**用户在 Stage 2 brief 确认门对此签字**。另：scaffold 阶段 score-attack 修饰符被依硬依赖降级（`requires type active-tick or active-click, type is passive-prestige`），降级已记录；反弹机制作为 sim 内容实装，不受名分影响 |
| 偏离2 | fun-quota medium `clickableGroups=1` 放弃（0 clickables） | 13 §1 passive-prestige 契约禁止 clickables（用户选「纯挂机声望链」）；类型契约优先于配额（D-MECHQUOTA 对 passive 收窄为仅挑战项）；bar/update 配额以偏离1 的真实 tick 达成 |
| 偏离3 | 行分布 row0×1 / row1×4 / row2×3 / row3×1 / row4×1（blueprint row3 [1,2]、rows last [3,4] 允许） | 历史弧线是线性主干，row1 四分支=四条反制路线（科学/生产/认知/协作） |
| 偏离4 | T2 范围：引擎自带 chrome（Save/Options 等按钮）保持英文 | P17 惯例只覆盖 mod 字符串；T3 的 t() 文本层+chrome 打包方法不适用于 T2 |
| 偏离5 | 层解锁一律走里程碑/阈值（unlocked() 读 hasMilestone/best），不用"付费解锁层"exit-ticket 升级 | 作者规则 #16/#28 与 N-UNLOCKPAYGATE 优先于语料惯例（P7 exit-ticket 形态弃用） |
| 偏离6 | 游戏机制中的历史日期采用可考史实（1796-05-14、1805、1965、1967、1971、1975、1976、1977-10-26、1979-10-25、1979-12-09、1980-05-08）；「1979-10-25 人类天花绝迹日」按用户给定前提作为纪念锚点 | 纪念性质游戏：剧情文本对史实负责，机制自由度归玩法 |
| 偏离7 | 发射价位/压强速率等节奏常数集中于 js/tuning.js | 自检 21 + 14 §3.3（模拟器必须能读同一常数） |
| 偏离8（Stage 6 实测修正） | `LAUNCH_CMP_GROWTH`：战役进度需求增长率终值 **×2.5/印章**（tuning.js；r1 ×2 → r9 ×2.5） | 首跑模拟显示 ×10/印章远超战役进度产量 → 终局不可达（14 §3.4）；×2.5 时第 9 印 ≈ 12.2 万，与 cmp 汇流产量匹配 |
| 偏离9（Stage 6 实测修正） | requires 拉宽（r1 初版 → r9 终值）：vac 250→**1e5**、pro 2500→**1e8**、knw 7500→**1e11**、int 25000→**1e14**、cc 1e6→**1e11**、mob 2.5e5→**1e9**、sur（r5 新基）→**1e5**；initialStartPoints 0→1（零号病人） | 首跑模拟显示全层 4 分钟内解锁；拉宽后乘数堆叠仍把 row1 压在 ~3–9 分钟（乘数堆叠跨 30 个量级 vs 纸面阶梯 2 个量级），终值由 r2–r9 测量收敛（§11） |
| 偏离10 | 挑战入场 onEnter 清空己方货币（sur c12/c13、vac c11/c12、int c11） | 防止"带着存量进挑战秒过"（canComplete 读活值）；TMT 惯例入场清场 |
| 偏离11（Stage 6 实测修正） | **sur 的 base 由「病例」改为「接种者」（player.var.points）**，requires 1e6→1e5 | r3–r4 模拟：row-1 声望按引擎规则清空根货币（`player.points = getStartPoints()`，game.js doReset），sur 建在病例上会随自身清扫饿死；接种者经 vac m1 keep 存活，且与 row1 同货币使监测围堵的行情可读 |
| 偏离12（Stage 6 实测修正） | 发射链终值重造（tuning.js）：doses `1e7×12^n`、funds `1e5×6^n→6.3^n`（2026-10-25：cc 修复后 funds 成唯一硬门，§12 #12）、sweeps `10+5n`、cmpReq `50×2.5^n`、**监测期 ladder `600(n+1)+300·n(n+1)/2`s**、发射瞬间 `pressure ≤ 1`、zeroTime 计入窗 `≤0.1`、sur 流调专项成本 `2^x`（原 3^x） | r4–r9 实测：① divide 型抑制永不为零，「按住两年」只能靠把回升速率压小、拉长 ≤0.1 的窗口——成本 3^x 买不起深度；② sur 2^L 等级墙掐断 cmp m4 自动清扫 → pressure 回不到发射窗 → 第 2 印死锁 44h（r4 教训：自动化供应层必须全程可按）；③ 监测期逐发递增把「最后一英里」做成终局主时钟（9 发合计 4.5h 纯监测下限），资源曲线让位于它 |

## 11. Stage-6 measured retune（权威——实测后填写）

| # | Finding (measured) | Root cause | Fix, and where the constant lives |
|---|---|---|---|
| 1 | 首跑（纸面数值）0.67h 触底 endgame；requires ×400 只把 vac 首声望推迟 14s（178→192s） | 乘数堆叠跨 ~30 个量级，固定 requires 阶梯（2 个量级）拦不住——income/声望乘区链式穿透 | requires 拉宽至 1e5–1e14（偏离9 终值）；**真正的节奏阀不是 requires 而是**：static 2^L 等级成本、发射链曲线、监测期 ladder |
| 2 | r1 后 40h 全冻结：var=65、sur 免费白拿等级 | 模拟器 static 闸门用 gain≥1（引擎 base<requires 时 getResetGain 恰返回 1），放行了引擎 canReset（base ≥ nextAt，game.js:124）不允许的按压 | `tools/simulate.js` 补 `staticNextAt()` + canPrestige 引擎闸门（带 game.js 行号注释）——harness 缺口，非游戏缺陷 |
| 3 | r3/r5：cert 第 2 印死锁 27–44h，pressure 回不到发射窗 | sur 2^L 等级墙掐断 cmp m4 自动清扫 → pressure 永不归零 → zeroTime 只在清扫瞬间累计（72000s 涨 380s） | sur requires 1e8→1e5（自动化供应层全程可按）；见偏离12 |
| 4 | r4：「按住两年零病例」机制性不可能——pressureRate 恒正、divide 型抑制渐近不为零 | 抑制走 `÷1.25^L` 只能逼近零；成本 3^x 又买不起深度 | zeroTime 计入窗放宽为常数 `ZERO_TIME_PRESSURE_LIMIT=0.1`；流调专项成本 `2^x`（tuning.js：PRESSURE_SUPPRESS_*） |
| 5 | r7–r9：链尾资源等待盖过监测期（每印 ~5.9h） | funds ×10^n / cmp ×3^n 在 n=8 时超出 int/cmp 经济 1–2 个量级 | funds `6^n`、cmpReq `2.5^n`、doses `12^n`（tuning.js LAUNCH_*_GROWTH）；监测期 ladder 成为终局主时钟 |

Measured timeline（greedy, `--click 1 --dt 1`，**总时长 = 14.96h**，medium 目标带 10–30h ✓；dt 0.5→12.38h、dt 2→19.74h，harness 敏感度 ±25%，引用 dt1 值）:
- 首次可购升级 10s（作者规则 <10s ✓，零号病人开局 1 例）
- 首声望：var 8s → sur 192s / vac 192s / pro 198s / mob 203s / cc 207s / knw 207s / cmp 268s / int 502s / **cert 1897s**
- cert 链（9 发）≈ 0.5h→14.96h：每发节奏 = 监测期 ladder（600/1800/3600/…s 累计）+ 剂量/资金/战役等待；峰值收入 4.6e32/s @10800s
- 终局：cert m8（印章 9 = ★1979-10-25 绝迹日★，`best ≥ 9`）

Sim exclusions（lower bound 方向）: 挑战奖励、成就效果（hist 11–55 至 ×10 cases / 双倍层增益）、clickable、离线时间、人类迟疑。Sim 不含成就 → 真实进程更快、人类迟疑 → 更慢，两者相抵后实测值视为真实时长的中位估计；作者规则（首购 <10s）在 sim 早期时间线上已验证。

## 12. Browser-verification fixes（Stage 6.5 实录，2026-10-24）

| # | 浏览器专属缺陷 | 修法 | 教训（下一作继承） |
|---|---|---|---|
| 1 | 启动即崩 `layers[layer].getNextAt is not a function`，Vue 卡 Loading | cmp/cert 补 `getNextAt()`（custom 层引擎每帧必调，game.js type=="custom" 分支） | **custom 层必须实现 getNextAt**——static/smoke 都不调它，只有真浏览器每帧 temp 重算会踩 |
| 2 | `diff.times is not a function`（sur 解锁后每帧抛） | sur.update 顶部 `diff = new Decimal(diff)`（引擎 gameLoop 传数值 diff） | 引擎 hook 入参类型与模拟器可以不同——模拟器传 Decimal 掩盖了数值路径；update() 一律先归一化 |
| 3 | Vue/字体走 unpkg/fonts.googleapis，沙箱与离线环境不可靠 | vue@2.7.16 本地化为 `js/vue.min.js`；删除 Google Fonts 外链（回落 monospace） | **T2+ 游戏一律本地化 Vue**（Large Model Tree 同教训第二次命中） |
| 4 | `__bootErrors` 只存 message，难定位 | 收集器升级为附栈首行（index.html 一行） | 每作自带可定位的 boot 错误收集器 |
| 5 | 一次性 `reading 'times'`（仅在乱序注入状态时出现） | 不可在 boot/存档重载/导出导入任一真实路径复现；判定为测试注入伪影，留观察 | 测试注入状态后要等一帧再断言——tmp 每帧重算，同帧读写会撞旧值（与 #2 同根） |

五项检查全绿：boot 无错；12 层页签全渲染；四类声望各一次（var normal / sur·cc·mob static / cmp custom / cert M19 消耗式）+ 升级 u11 + buyable var.11 各购一次；存档重载与 export/import 往返通过（导出串 ASCII 安全）；控制台干净。

**第二轮（2026-10-25，玩家实测反馈，均已活页面验证）**

| # | 缺陷 | 修法 | 教训 |
|---|---|---|---|
| 6 | 未完成成就整个不可见（玩家报"没有白底"）——本作引擎副本 `js/technical/displays.js` 的 `achievementStyle` 对未完成成就写内联 `visibility: hidden`（技能模板同行为灰度 0.7+透明度 0.55，scaffold 来源不同副本） | 游戏自有 `css/components.css` 追加 `.achievement.locked { visibility: visible !important; background:#e6e6e6; opacity:.8; 深色文字 }`——样式表 `!important` 压过内联样式，不碰引擎文件 | 引擎副本间有差异： scaffold 后要 diff 引擎文件与模板；`!important` 是不改引擎文件时对抗内联样式的合法通路 |
| 7 | 成就页无 X/Y 计数（引擎 achievements 组件本就不渲染计数） | hist.js 加显式 tabFormat：计数行（`player.hist.achievements.length / 50`，双语）+ blank + achievements | 玩家对成就页的默认预期含计数行；T2 游戏自己补 |
| 8 | 默认语言为中文 | dash startData `chinesemode: false`（Q7 只定了"双语切换"没定默认；2026-10-25 用户指定默认英文），并把玩家现存档的偏好一次性切英文 | 默认语言也是要问的产品决策；localStorage 按 origin 隔离——同 origin 带查询串刷新可保存档破缓存 |
| 9 | components.css 改动被 Chrome 启发式缓存吞掉 | index.html 的样式表链接加 `?v=2` 版本参数 | 改 CSS 后要给链接加版本参数，否则验证与玩家都会看到旧样式 |

**第三轮（2026-10-25，玩家存档实测反馈：《新建 文本文档 (2)》卡死 + CX 挑战完成不了，均已活页面验证）**

| # | 缺陷 | 根因 | 修法 |
|---|---|---|---|
| 10 | 载入存档后整局静默冻结（timePlayed/root 全停，控制台无报错） | mod.js `pressureRate()` 读 `tmp.cc.points`——引擎 tmp 只缓存层文件定义过的**函数**返回值，cc 层没有 `points()` → 恒 undefined → `.times` 每帧抛错；引擎主循环 `ticking` 标志在异常时永远停在 `true`（game.js interval），一帧抛错 = 永久停摆且首错发生在错误监听挂载前，故"无报错"。模拟器 layerStub 对任意属性返回 Decimal(1)，掩盖了这一类缺陷 | 改读 `player.cc.points`（玩家态恒有 Decimal）；8395 换 `tools/serve.js`（`Cache-Control: no-store`）——python http.server 无缓存头，修复后刷新仍跑旧 mod.js（与 #9 同类，但引擎 loader 加载的 modFiles 无法加 `?v=`，只能从服务器侧解） |
| 11 | CX（vac）挑战 11/12 完成不了（sur 12、int 11 同病） | 引擎语义：**prestige 挑战层自身会立刻带上一帧缓存判定退出挑战**（doReset→completeChallenge，game.js:216，canComplete 读的是按压前缓存的 false）——目标建立在挑战层自身 prestige 资源上（覆盖率/vac.points、sur.points、int.points）的挑战数学上不可完成：层内资源唯一来源是被禁止的 prestige，被动增长又不存在 | 四挑战加"挑战内被动增长"：vac/sur/int `passiveGeneration()` 各加 `inChallenge` 分支（tuning `CHALLENGE_PASSIVE_GEN 0.1` normal 层 / `_STATIC 0.5` static 层），目标资源层内自爬、达标后点挑战框领取；sur 注意 cmp m4 走 autoPrestige 不能再加 passive 防止终局双计；挑战描述补"别在本层 prestige"提示。sur 11（var.points，低行资源）与 sur 13（pressure，update 自增）本就合法，未动 |
| 12 | cc 压强除数修复后 pacing 越带（9.29h < 10h 下限） | 修复前模拟器 stub 让 cc 恒为 1，修复后真实 cc 节点数参与压强抑制 → 压强更低 → 资源链更快走完 | `LAUNCH_FUNDS_GROWTH 6→6.3`。两轮试错（DOSES 12→14、ZERO 阶梯 +17%）全部无效后加 cert 发射探针（simulate.js `SIM_CERT_PROBE=1`）实锤：**funds 是 2–9 号印章唯一硬门**（发射瞬间富余 <0.1%），DOSES/ZERO 富余 50×+；单旋钮 6.3 → **10.08h 回带**。无效改动已全部回退 |
| 13 | （次生）挑战修复后的奖励使真实玩家更快 | 模拟器政策不进挑战（下界语义不变） | 接受：sim 仍为下界；10.08h 为不带挑战奖励的测量值 |

第三轮验证：用户存档载入后循环存活（ticking=false、无 boot 错误、压强恢复爬升）；vac 11 实际完成（覆盖率 91.3% 时点框领取）、vac 12 实际完成（8 秒被动涨至 15.8 万公民 ≥ 1e4）→ `{"11":1,"12":1}` 落入存档；奖励接线核对（cc ×0.9 / vac ×1.25 / var ×1.5 / cert ×0.85）；static 100 PASS/3 WARN/0 FAIL、smoke 0/0 复跑全绿。

## 13. Final gates（Stage 7 交付线，全部实测）

- Stage 5 static_checks：**104 PASS / 3 WARN / 0 FAIL**（WARN：N-AUTOWIPE、D-REQRATIO ×1e4、D-REQRATIO ×1——§9.1 均有书面接受；2026-10-25 复跑口径：第三轮 +D-TMPPOINTS/D-CHALOWNRES 两护栏，同日再 +D-CUSTOMNEXTAT/D-DIFFNUM 两护栏，PASS 数随之 100→102→104，本作均为阴性）
- Stage 5.5 smoke：**0 FAIL / 0 WARN**
- Stage 6 simulate：**10.08h**（2026-10-25 第三轮复测；cc 压强修复前为 14.96h——两次均在带内，见 §12 #12）（`--click 1 --dt 1`；dt 0.5/2 → 12.38/19.74h；下界排除项见 §11）
- Stage 6.5 browser：**5/5 通过**（§12 实录）
- 交付物：`index.html` + `js/`（Vue 已本地化）+ `css/` + `design-brief.md` + `README.md` + `tools/`（不入 modFiles）
