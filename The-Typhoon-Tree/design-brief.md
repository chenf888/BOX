# Design Brief — The Typhoon Tree 台风树

> Stage 2 产物（SKILL.md）。所有默认数字来自 `assets/blueprints.json`（medium）与
> `assets/balance-defaults.json`；每处偏离都在 §10 记了被覆盖的默认与理由。

## 1. Identity

| Field | Value |
|---|---|
| Game name | The Typhoon Tree（台风树） |
| Author | chenf888（用户指定，Stage 2 确认门时落账） |
| Points name (`modInfo.pointsName`) | Water Vapor（水汽） |
| Language mode (Q7) | Bilingual（T2，P17 `window.chinesemode` 三元约定） |
| Default language (Q7) | **English**（`chinesemode` 初始 false；翻转会重写所有存档玩家偏好，此后不得静默更改） |
| One-line pitch | 从一片暖海的一缕水汽开始，把一次热带扰动喂成超强台风，然后在巅峰时刻亲手送它登陆。 |

## 2. Interview record — the question ledger（台账即凭据）

| # | Question | Answer（用户原话 / 明确确认） | Locked parameter |
|---|---|---|---|
| S0 | Theme | 「使用TMTSKILL制作一个游戏，台风树」 | theme = 台风 → Q1 |
| Q1 | Theme-structure confirmation | 「按此结构确认」 | 三行结构映射 §3（P14） |
| Q2 | Scale | 「中型 10–16 层（推荐）」 | blueprint `medium`（10–30 h，rows 0–3/4） |
| Q3 | Natural ceilings | 「混合（推荐）」 | cap table §8：水汽饱和**硬帽** + MPI **软帽** + 风级门槛阶梯 |
| Q4 | Pacing | 「均衡（推荐）」 | 标准蓝图行为 + fun-quota 机制表；P15 环形层 ≤1 |
| Q4b | Type + modifiers | 「有事做混合23」→ 核心动词「进度条为核 active-tick（推荐）」；修饰器「score-attack + minigame（推荐）」+「story 章节（已承诺）, casino 赌场」；显式重跑 classify --explicit active-tick 通过 | §2b；点击降为修饰性内容（P28 冷却爆发按钮） |
| Q5 | Side content | 「Full（推荐）」 | 挑战（M2 枢纽）+ 成就 5×10 + 剧情/仪表盘侧层 |
| Q6 | Automation & timewalls | 「经典节奏（推荐）」 | 4–6 步核心阶梯 + 行末打包（P4 打包是收尾 QoL 标准）；墙 ≤30 min |
| Q7 | Language & style | 「T2 双语一开关（推荐）」+ 默认语言「英文默认」 | 三元式 + main-display 覆写；描述/标题/tooltip/winText 全部函数 |
| Q8 | Endgame flavor | 「可消耗重置·登陆式」 | M19：终局动词 = 登陆（烧掉全部积累，四项逐条计价） |

Q1 recap（用户确认原文）：

- **Currencies:** 海面蒸发的水汽 → 凝结成云团 → 旋转组织成涡旋 → 强度/风速等级（热带低压→超强台风 6 级分类阶梯）
- **Layer topology:** 蒸发层(row 0) → 对流层(row 1，重置水汽) → 涡旋层(row 2，重置云团) → 眼墙层(row 3，重置涡旋) → 登陆层(row 4，终局枢纽) + 气象观测成就侧层
- **Ceilings:** 风速分类是硬性门槛；水汽有饱和上限、顶层强度受最大潜在强度(MPI)约束

## 2b. Game type profile（Q4b）

| Field | Value |
|---|---|
| Type | **active-tick**（tick 生产循环；条为核，点击为修饰） |
| User confirmation (verbatim) | 「有事做混合23」→「进度条为核 active-tick（推荐）」；explicit 路由 `classify.js --explicit active-tick` exit 0（confidence 0.75 / margin 0.32） |
| Confidence + margin | 0.75 / 0.32（passive-prestige 0.43 居次） |
| Mandatory modules | `update()`（addPoints，禁直写 points）、bars（`progress()` 防 ÷0）、`doNotCallTheseFunctionsEveryTick` 注册全部自定义动作函数 |
| Forbidden | tick 内大指数 `Decimal.pow`；clickable 状态用 Decimal；箭头函数组件（N-ARROWTHIS） |
| Rules required | N-POINTSWRITE、M-DNC、T-TICKREG（自定义动作全部登记） |

Modifiers（唯一交互类型 = active-tick；其余全是修饰器）：

| Modifier | Requires | Included? | Notes |
|---|---|---|---|
| `sim` | — | ✅（结构性） | score-attack 的硬依赖；custom 层预算 ≤3 → **mon / eyew / land 恰好用满 3** |
| `score-attack` (M2) | active-* + sim | ✅ | env 挑战枢纽：`maxpoints[]` 记峰值，`challengeEffect()` 读峰值（引擎无 scoreAttack API，手写惯例） |
| `minigame` (M3) | active-* | ✅ | conv 层「对流爆发」：可点击目标组 + style() 反馈 + run 状态入 startData |
| `boss-rush` (M12) | active-* + sim | ❌ | 用户未选（修饰器 A 组钉死为 score-attack + minigame） |
| `gacha` (M13) | active-* | ❌ | 用户未选；与主题贴合度低 |
| `casino` (M14) | active-* | ✅ | cas 侧层：四分布中取 **2**（骰子 + 硬币），各带独立软帽（P38） |
| `story` (M15) | — | ✅ | 台风日记侧层（Q5=Full 已承诺，勾选确认保留）；切景引擎（P32）large-only 不用 |
| `board` | — | ❌ | 无棋盘玩法 |
| `challenges` (M1) | — | ✅（经 env M2 枢纽承载） | 目标走 update() 累积态（P65 合法变体），`canComplete()` |
| `caps` | — | ✅ | Q3 混合天花板 → §8 |

## 3. Theme = structure mapping（P14）

台风的一生 = 树的行阶：暖海蒸发（row 0 起源）→ 深对流组织化（row 1）→ 雨带/涡旋/环境搏斗（row 2）→ 眼墙强化到风级阶梯（row 3）→ 登陆消耗一生（row 4 终局）。副热带高压是贯穿的「引导」商店（M8）；季风槽是持续输送水汽的 tick 管线（active-tick 核心动词）；垂直风切变、干空气、冷海温、藤原效应是真实的风暴杀手 → 挑战条目（M2）。风速 6 级分类（17.2/24.5/32.7/41.5/51.0 m/s）是眼墙层的门槛阶梯；登陆只在「台风强度」以上才可能。

## 4. Layer chain table（代码生成合同，自底向上）

| id | name | row/pos | type | base → baseAmount | requires | exp/base | U | M | C | B | automation granted（哪个里程碑） | softcap plan | doReset keeps | branches |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| evap | 蒸发 Evaporation | 0/0 | normal | points(水汽) → player.points | 10 | 0.5 | 15 (5×3) | 5 | — | — | resetsNothing←conv m0；passiveGen←mon m1+ach44；autoPrestige←band m0；autoUpgrade←vor m1 | 潜热无帽（P12：成本整形优先） | unlocked,auto,best,total + m3:upgrades | — |
| conv | 对流 Convection | 1/0 | normal | 潜热 → evap.points | 300（×30） | 1/3 | 15 (5×3) | 6 | — | 2 | （被 eyew m3 打包：resetsNothing+autoPrestige） | 每层 ≤1 自缩放项（pow≤0.5 帽内） | 同上 + m2:upgrades | ["evap"] |
| mon | 季风槽 Monsoon Trough | 1/1 | custom(sim) | 潜热 → evap.points | 500（×50） | getResetGain = flux 对数曲线 | 12 (5×3 中 12) | 6 | — | 2 | autoPrestige+autoUpgrade+resetsNothing←land m0（打包） | tank 硬帽 1e6（§8） | 同上 + m2:tank | ["evap"] |
| band | 螺旋雨带 Spiral Rainbands | 2/0 | static | 云团 → conv.points | 1e4（×33） | base 2, exp 1 | 10 | 5 | — | — | autoPrestige+resetsNothing←land m3（打包）；canBuyMax←自身 u15 | 静态 1 阶成本阶梯（D-COSTSPAN 豁免形） | 同上 + m2:upgrades | ["conv"] |
| vor | 涡旋 Vortex | 2/1 | normal | 云团 → conv.points | 2e4（×67） | 0.25 | 10 | 5 | — | — | autoPrestige+resetsNothing←land m3（打包） | ≤1 自缩放项 | 同上 + m2:upgrades | ["conv","mon"] |
| env | 恶劣环境 Hostile Environment | 2/2 | none(M2 枢纽) | —（危险评分在 update() 内累积） | 解锁门：云团 ≥ 5e7 | — | 10 | 5 | 5 | — | — | 峰值奖励各自软帽（P38 形） | unlocked + maxpoints 常驻 | ["conv","mon"] |
| eye | 暖心风眼 Warm Core Eye | 3/0 | static | 涡度 → vor.points | 1e6（×50） | base 3, exp 1 | 10 | 4 | — | — | autoBuyable(conv b11, P54 闭式)←eye m0 | — | 同上 + m2:upgrades | ["vor"] |
| eyew | 眼墙 Eyewall | 3/1 | custom(sim) | 雨带+涡度 → band/vor | canReset: 雨带≥10 ∧ 涡度≥100 | 能量曲线；m/s 显示变换 | 15 (5×3) | 8（=风级阶梯） | — | 2 | conv 打包←m3 | **MPI 软帽 85 m/s（可见，§8）** | 同上 + m1:upgrades, m5:band/vor 资源 | ["band","vor","eye"] |
| suh | 副热带高压 Subtropical High | 3/2 | none(M8 商店) | —（引导气流由 update() 从强度/云团派生） | — | — | 12 | 4 | — | — | — | — | unlocked + upgrades 常驻（登陆保留） | ["eyew","eye"] |
| land | 登陆 Landfall | 4/0 | custom(sim, M19) | 全树燃料（四项计价） | canReset: 风速 ≥ 32.7 m/s（台风级） | 四项项化和 | 15 (5×3) | 10（顶石链） | — | 1 | mon 打包←m0；band/vor 打包←m3 | 每项 ×50/次软帽（P38） | M19 选择性保留（里程碑解锁 keeps） | ["eyew","suh"] |
| ach | 气象观测站 | side | none | — | — | — | 50 成就 (5×10) | — | — | — | ach44→evap passiveGen 备路（P11 带守卫回填 ×3） | — | — | — |
| story | 台风日记 | side | none | — | — | — | 10 章节 | — | — | — | — | — | — | — |
| cas | 路径赌局 Forecast Odds | side | none+clickables | 押注货币 = 潜热 | — | — | 2 局 | — | — | — | — | 双局各自软帽 | — | — |

行数核验：主层 10（medium 10–16 ✓），rows 0–4 连续（A2 ✓），side ×3。

### 关键门槛与节奏常数（§4.1 of handbook 11）

- `REQ_RATIO = ×25–×50/行`（10 → 300/500 → 1e4/2e4 → 1e6 → …）
- `OUTPUT_STEP ≈ ×20/行`（区组合成：新层解锁 + 升级梯 + 里程碑乘区）
- **每行时间倍 = 25÷20 ≈ ×1.25**（目标带 ×1.1–×1.6 内）
- 常数落点：`js/tuning.js` 的 `TUNING` 对象（REQ_RATIO、OUTPUT_STEP、SAT_CAP、PUMP_CD、WIND 映射、LANDFALL 项权重…）——游戏与模拟器同读。

## 4.1 Fun density table（per layer，K = effect kind）

| id | 内容件数 | effect-kind 计划（关键件） | organization | mechanics |
|---|---|---|---|---|
| evap | 15U+5M | u12=K2 pow(0.45 自项·帽内)、u14=K2 log、u15=K6 条件、u21=K8 潜热+1/s、u31=K4 蒸发效率^1.05、u23=**K1×10（key 降价 7）**、u25/u35=K7；K1 4/15≈27% | tab：main/btn/ctx + microtabs（Upgrades\|Milestones） | — |
| conv | 15U+6M+2B+小游戏 | u12=K2、u13=K3(源潜热)、u16=K4 对流组织化、u15=K7、u21=K8 水汽+5%/级、u32=**key 5**；K1 5/15≈33% | microtabs：Upgrades\|对流爆发(小游戏)\|Milestones | M3 小游戏、M8 供货 |
| mon | 12U+6M+2B+1bar+1clickable | 输送条 + 人工增雨（P28 冷却爆发）；u 组：K8×3、K2×2、K6×2、K4 输送效率、K1×2、K7×2 | microtabs：输送线\|Upgrades\|Milestones；副货币 tank 大字读数 | M4、M5、K9 状态效果 |
| band | 10U+5M | 静态层；K2 log×2、K3×2、K6×2、K7×1、K8×1；K1 3/10 | tab + upgrades 1×10 条 | — |
| vor | 10U+5M | K2×3（旋转曲线）、K3×2、K4 科氏增强、K6、K7；K1 2/10 | microtabs：Upgrades\|Milestones | — |
| env | 10U+5M+5C | 挑战=11风切变/12干空气/21冷涌/22藤原/31超级考验(countsAs,completionLimit 3)；u：K6×3(按通关数)、K4×2、K2、K1×2、K7×2；reward 用 `rewardDescription`（`reward:` 是幽灵字段） | microtabs：Challenges\|Adaptation(商店) | **M2 分数攻击**、M1 注入式惩罚 |
| eye | 10U+4M | K5 MPI 墙可见、K3×2、K2×2、K6、K7；K1 3/10 | tab | — |
| eyew | 15U+8M+2B | **风级阶梯里程碑 m0–m7（17.2/24.5/32.7/41.5/51.0/61/72/85）**；u：K2×3、K3×2、K4×2(眼墙对流/ERC 强化)、K5 MPI+10 可见、K6×2、K7×2(登陆门=阈值 m2)；K1 3/15 | microtabs：主显示\|Upgrades\|Buyables\|Milestones；m/s 大字 + 风级徽章 | M7 变体、ERC 主题声望 |
| suh | 12U+4M | 商店：K4×4（四条**具名**机制指数 ^1.1）、K5×2、K6×2、K7×2、K1×2 | tab：引导气流读数 + upgrades | M8 |
| land | 15U+10M+1B | M19 四项计价 UI（水汽/云团/涡度/能量各一行）；u：K3×3、K8×2、K2×2、K6×2、K7×2、K1×4；里程碑 = 登陆次数链（best 门） | microtabs：登陆台\|Upgrades\|Milestones | **M19 终局**、M9 形保留 |
| ach | 50A | 40×K1 平乘 + 7×K7 + 1 自动化（ach44）；回填 ×3 带 `!has` 守卫 | **计数行 X / 50 置顶** + 5×10 grid | M10 |
| story | 10 章 | 条件数组 `storyPending()` + storyUnlocked 计数 | 章节列表，解锁门槛显示 | M15 |
| cas | 2 局 | 路径骰（2d6 乘积赔付，独立软帽）+ 强度硬币（连击对称软帽） | 两块局板 | M14（4 分布取 2） |

## 4b. Game-level fun plan（vs `fun-quota.json` medium 行）

| Quota (medium) | Planned | Where |
|---|---|---|
| Distinct mechanics ≥4 | 9：M2、M3、M4、M5、M7、M8、M14、M15、M19 | §4.1 |
| Challenge layer（M1 或 M2 枢纽） | ✅ M2 分数攻击枢纽 ×5 挑战 | env |
| Clickable group ≥1 | 3 组：增雨泵（P28）、小游戏目标组、赌局按钮 | mon / conv / cas |
| Bar ≥1 | 2：水汽输送条 + tank 余量条（progress() 防 ÷0） | mon |
| update() 层 ≥3 | 4：mon、env、suh、cas（land 仅登陆瞬间跑，非 tick 主循环） | — |
| Secondary currency ≥1 | 2：mon.tank（饱和硬帽）、cas.forecastXP | mon / cas |
| Shop layer | ✅ | suh |
| Custom ritual（可选） | ✅ land（M19 仪式） | land |
| Story presentation | ✅ 台风日记侧层，解锁门控 | story |
| autoBuyableDrivers ≥1 | 1：eye m0 → conv b11 闭式 buyMax（P54，base3 指数可逆） | eye |
| maxK1Share ≤0.4 | 每层已核（表内百分比） | §4.1 |
| microtabs at ≥12 件 | 全部达标层已布 | §4.1 |

## 5. Tree sketch

```
row4:                                                      [land 陆]
row3:                            [eye 眼]  [eyew 墙]  [suh 高]
row2:                 [band 带]  [vor 旋]  [env 险]
row1:            [conv 云]  [mon 流]
row0:                 [evap 汽]
side:   (ach ★50)  (story 记)  (cas 骰)
```

## 6. Automation ladder（P4 序；跨层授权）

| Step | Grants | Granted by | Threshold |
|---|---|---|---|
| 1 | evap resetsNothing | conv m0 | 云团 ≥ 600 |
| 2 | evap passiveGeneration（水汽自增） | mon m1（+ach44 备路） | flux ≥ 1e3 |
| 3 | evap autoPrestige | band m0 | 雨带 ≥ 20 |
| 4 | evap autoUpgrade | vor m1 | 涡度 ≥ 1e4 |
| 5 | **autoBuyable conv b11**（P54 闭式 buyMax） | eye m0 | 暖心 ≥ 5 |
| 6 | conv resetsNothing + autoPrestige（同里程碑成对，N-AUTOWIPE 集蕴含） | eyew m3 | 风速 ≥ 41.5 m/s |
| P1（打包） | mon autoPrestige + autoUpgrade + resetsNothing | land m0 | 首次登陆 |
| P2（打包） | band + vor autoPrestige + resetsNothing | land m3 | 第 5 次登陆 |

核心 6 步 + 2 个 P4 行末打包（Q6「经典节奏 4–6 步」+ 打包是 09 §3.2 标准收尾动作）。

## 7. Endgame definition（M19）

- `isEndgame()`：`hasMilestone('land', 9)`——「完美风暴」：第 25 次登陆且登陆瞬间风速 ≥ 51 m/s（done() 双轨：登陆次数 OR 风速，mini-technique）。
- land 里程碑链 10 步（登陆次数 1/2/3/5/7/10/14/18/25·≥51）；land.currency = 四项燃料和（水汽项 + 云团项 + 涡度项 + 能量项，各 `add(1).log10().pow(w_i)×mult_i`，UI 逐项显示）。
- Reachability estimate：row-0 产出 P ≈ 1–5/s 起，阶梯 ×25 需求 / ×20 产出 → 10 主层 + M19 链，纸面 **12–18 h**（目标带 10–30 h；Stage 6 模拟为唯一权威，§11 记实测）。
- `winText`：EN "The storm has made landfall. Somewhere far inland, rain is still falling from a sky that remembers you." / 中文「台风登陆了。遥远内陆的雨里，还留着它记给你的最后一笔。」

## 8. Cap table（Q3 混合）

| Currency | Ceiling? | Cap mechanism | Where |
|---|---|---|---|
| mon.tank（水汽储存） | **yes（硬帽）** | `softcap(tank, TUNING.SAT_CAP, 0)` 饱和冻结，阶梯在帽处止；帽**可见**（余量条 + 文案） | mon.update() |
| 风速显示值 | **软帽** | MPI：`softcap(wind, 85, 0.4)`，eye u? / K5 可见出售 +10（85→95，仅一次） | eyew.points() |
| 各层货币循环 | no | 成本整形优先（author 2022-07-04）；≤1 自缩放项/层（pow≤0.5、帽内、Σ≤0.6） | 各层 gainMult |
| 赌局/挑战峰值赔付 | yes | 各自独立软帽（P38：每个赔付公式自带帽） | cas / env challengeEffect |

水汽饱和帽的映射说明：物理「相对湿度 100%」若直接帽 player.points 会掐死 requires 阶梯（A1 风险），故映射到唯一以「储存量」形态存在的水汽——季风槽 tank，见 §10。

## 9. Self-check results（23 项）

- [x] 1 requires 单调 ×10–×100（10→300/500→1e4/2e4→1e6→…）；A1 无
- [x] 2 首层 requires = 10（众数）
- [x] 3 主层全部 ≥10U + ≥3M（最薄 eye 10U+4M）
- [x] 4 每新层 gainMult 给 ≥2 个更老层加行；conv/mon/land 各有升级直达水汽（层 1 永不孤立，A7 无）
- [x] 5 阶梯 6 核心 + 2 打包，P4 序，一步一事，全跨层
- [x] 6 无界循环：各层 ≤1 自缩放项（帽内、Σ≤0.6）；tank 硬帽；MPI 软帽
- [x] 7 A1–A10 清点：无（env 挑战密度例外记 §10）
- [x] 8 每层 K1 ≤40%、≥3 种非 K1（§4.1 逐层标注）
- [x] 9 tabFormat 全主层；microtabs ≥3 内容组处；ctx 文案（base/best/软帽预警）置顶
- [x] 10 全局 fun quota 达标（§4b 逐行）
- [x] 11 乘区预算：自缩放项只进产出不进 gainMult；行 0 末保证性平坦区乘积 ≪1e4
- [x] 12 wiring：token/gate vs value 双栏齐（§4.1 kind 表 = 分类；value 件全部有具名消费者）
- [x] 13 成本梯 ≥6 阶（静态层 1 阶豁免形）；每层 ≥1 key 降价（evap u23=7、conv u32=5、vor u26=7、land u24=7…）；≥30% pow/log
- [x] 14 密度 8–30/层；env 挑战占比例外 → §10
- [x] 15 author pacing：首个提升 ≤10 s（u11 cost 1、水汽 1/s）；>1 min 的重置必有产出；登陆从第一秒提速
- [x] 16 单升级单产出；无升级升另一升级的暗数；全部阈值门（无付费进层）
- [x] 17 成本先于软帽；只卖看得见的帽（MPI 帽显式显示 + 出售 +10）
- [x] 18 行节奏双常数：REQ_RATIO ×25–50、OUTPUT_STEP ×20 → ×1.25/行（均在本文件 §4）
- [x] 19 生命周期：里程碑全走 best/total；doReset keeps 含 best/total（N-MSDESTROY）；autoPrestige 集蕴含 resetsNothing 集（6/P1/P2 均成对或先行）；update() 不直写 points（内部态 tank/flux/hazard 除外——它们不是 points）；band/eye 都有 canBuyMax()
- [x] 20 类型合同：update 用 addPoints、 DNC 注册、progress 防 ÷0；clickable 状态 number/string；禁项无
- [x] 21 测量计划：js/tuning.js 双读；全部节奏量可调用
- [x] 22 台账完整（§2 十行全原话/确认）
- [x] 23 buyable 全部跨层消费者（b11→eyew、b12→getPointGen、mon b21/b22→getPointGen/gainMult、eyew b31/b32→band/vor、land b41→eyew）；autoBuyable ≥1

无同层里程碑争同一自动化授权（对照 P4 表逐行唯一）。

## 9.1 Static-warning acceptance（Stage 5 后填）

| Check | Layers | Why accepted (or: fixed — how) |
|---|---|---|
| D-LOCALWIRE | band | 静态层语义：band 自身 gainMult 是反向成本（小=便宜），其 3 个带 effect 升级（13/14/19）按 P10 全部馈入更老层（conv/evap/vor）——「对本层无效」的前提不成立于 static 层；全游戏挑战占比与 wiring 均正常 |
| D-EFFECTMONO | suh | K4 四条 ^1.1 指数按「单一接线点」原则写在消费端（mod.js getPointGen、tuning.js monsoonCycleGain/monsoonSpeed、layers4 vor.gainExp、layers6 eyew.gainExp），检查器看不见跨层 pow 形状；且 u17 为 K6 门、u19 为 K7 条件、u21 为容量 ×2，实际种类 ≥6；固定为接受项 |
| （fixed）C-CONTENT1ELEM | eyew/land/ach | `["buyables"]`/`["achievements"]` 1 元数组引擎不渲染 → 改裸字符串（3 处） |
| （fixed）N-CONTRAST | land | #B03A2E 3.2:1 过暗 → #EC7063 |

## 10. Deviations & open questions

| Default overridden | Value used | Why |
|---|---|---|
| Q1 拓扑逐字版（涡旋=row2 前） | 涡旋=vor row 2、眼墙=eyew row 3、登陆=row 4 | Q2 中型扩写授权（「同一气象骨架上扩写/收缩」），主链骨架逐字保留 |
| 水汽饱和帽落点 | mon.tank（1e6 硬帽） | 帽 player.points 会掐死 requires 阶梯（A1）；tank 是唯一「储存态水汽」，物理映射在 §8 |
| 挑战 ≤15% 升级数 | env 层 5C/10U=50% | env 是 M2 专职枢纽（春节树 `e` 同形）；语料全游戏占比 1.8% 不变 |
| Q6 阶梯 4–6 步 | 6 核心 + 2 打包 | P4 打包 = 09 §3.2 medium「packageDealAtRow3」标准形态 |
| casino 主题贴合 | 路径赌局（预报不确定性的骰/币二局） | 用户在 Q4b 明确勾选（台账）；以「预报赌局」贴近主题 |
| 阶梯语义修正：resetsNothing 落在重置者层 | conv.resetsNothing()←conv m0；conv 自动化 = passiveGeneration←eyew m3（author #26：normal 层用 passiveGeneration，非 autoPrestige） | 引擎 game.js:211 证实 resetsNothing 是「本层声望不清空他人」；land m3 打包改为 band(autoPrestige+resetsNothing, static ✓) + vor passiveGeneration |
| none 型层永远无法自解锁 | mon/env/suh/cas 的解锁写入器集中在 getPointGen 尾部（阈值/里程碑门） | 引擎唯一 unlocked=true 写入点是声望成功（game.js:199），none 型层无声望 → 必须有 mod 侧写入器（N-UNLOCKDEAD） |
| mon 升级以 flux 支付 | currencyLocation 三件套指向 player.mon.flux | 引擎默认用层 points（强度）支付；内部货币计价必须显式声明 |
| blueprints.medium challengeUnlockPoint ~5e7×首层货币 | env 解锁 = 云团 ≥ 5e7 | 同值（首层货币=潜热 ×5e7 处，换算成云团门槛） |

游玩中注意到的数字 → 先进本表 → 再进 `js/tuning.js` → 再跑模拟。中途直改层文件字面量 = 违规。

## 11. Stage-6 measured retune（模拟权威，Stage 6 后填）

| # | Finding (measured) | Root cause | Fix, and where the constant lives |
|---|---|---|---|
| 1 | **ERC 指数失控**：dt0.5 全程跑峰值收入 1e279 @320s，纸面 endgame 0.09 h | eyew.onPrestige 把环流 gain 直接 `add` 进 band/vor 楼层；band 楼层是 `2^band` 能量通量的指数底 → 免费楼层 × 指数通量 = 正反馈环 | **设计修复**（非旋钮）：删除楼层注入，改为置换次数的有帽乘区——band 成本 ×max(0.4, 1−0.01×cycles)、vor 产出 ×min(3, 1+0.05×cycles)（layers4 band/vor gainMult 内联读 `player.eyew.cycles`，模拟器沙盒无 `layers` 全局故不用跨层函数）；楼层必须照常花云团购买 |
| 2 | 修复后 dt1 复跑峰值仍 1e263；**浏览器同态交叉验证**（注入 t≈416 状态：latent 2.33e15 / cloud 7.38e31 / vort 3.7e31 / band 93）：引擎 convGain 1.58e8、vorGain 1.56e7、收入 27k/s —— 全部健康 | 模拟器通用 buyable 策略在 1/s 全按 + 即时购买下把乘区堆叠推到该状态（脚本自带 NOT CALIBRATED 判词）；early timeline 才是政策无关可信段 | 不改游戏。按脚本规程：只信 timeline，总时长待真人锚点校准；已在 §12 补 purchaseLimit 引擎坑（buyBuyable 对无 purchaseLimit 的 buyable 恒拒） |
| 3 | dt 不变性检验：首购 11s/12s、evap 9s/8s、conv 270s/280s（dt1 vs dt2） | — | 通过——关键时间线不随步长漂移，模拟器量的是游戏不是自己的步长 |

Measured timeline（dt1、click 1s、即时购买政策）：first purchase 11 s（作者线 <10 s；实测真机 1–2 s， Vapor 1/s 对 u11 价 1）；首声望级联 evap 9s → conv 270s（4.5 min）→ mon 352s → band 369s / vor 371s → eye 394s → land 402s → eyew 404s。row0→row1 4.5 min、row1→row3 共 2.2 min（政策压缩效应，真人无全自动化远慢于此）。首按公式输入全部健康（gain 1–330、gainMult 1）。总时长：**未校准**（无真人锚点；纸面估计 12–18 h 待 Stage 6.5 手测校准后回填）。

## 12. Browser-verification fixes（Stage 6.5 后填）

| # | Symptom | Root cause | Fix |
|---|---|---|---|
| 1 | 整局静默冻结、无控制台报错 | 微页签 `unlocked()` 用 `this.layer`——07 硬规则 13（无绑定运行）→ getBuyableAmount(undefined) 在 interval 体内抛错 → 引擎 `ticking` 旗标卡 true（P64 机制实测复现） | 全部微页签级 unlocked() 用字面层 id；mod.js 常驻看门狗（10s 停滞 + 可见页 + 未终局 → 释放 ticking 并记入 __bootErrors） |
| 2 | 同上冻结类 | tuning.js 助手（monsoonCycleGain）跨层 hasUpgrade 无守卫，未生成的层（band/land）读取即抛 | tuning.js 全部跨层读加 `player.X &&` 守卫；后续每层同纪律 |
| 5 | **Vue 渲染管线整树死亡**：切到 mon 页签后全 app 永久无 patch（右栏从 DOM 消失、无任何 console 报错、gameLoop 照常跑、vapor 照常涨） | `["blank","10px"]` 误写成两个独立条目 `"blank", "10px"` → column 裸字符串分支 `v-bind:is="10px"` → `createElement('10px')` 抛错 → 根渲染 watcher 死亡（P64 的 DOM 变体：逻辑照跑、画面永冻）。共 2 处（mon 主微页签、conv 小游戏微页签——恰是玩家最先看到的页签） | 修成 `["blank", "10px"]` / `["blank", "8px"]` 二元组；诊断法：装 `Vue.config.errorHandler`（错误走 errorHandler 不走 console）+ 监视 `#app` children 数（8→7 即根级死亡）；全项目裸字符串条目白名单复扫（仅 buyables/clickables/achievements/blank/milestones） |
| 6 | clickables 渲染 0 格（["clickables", [11,12]] 传法） | 引擎 clickables 组件按 `row*10+col` 反查 id，data=[11,12] 会被当行号→ 111/112 | 全项目改裸 `"clickables"`（rows/cols 由 setRowCol 自动派生） |
| 7 | 自动买满 CAPE 驱动永不触发；所有 buyable 经 buyBuyable 拒买 | 引擎 canBuyBuyable 里 `amount.lt(b.purchaseLimit)`——无 purchaseLimit 字段时 lt(undefined) 恒 false | 全部 5 个 buyable 补 `purchaseLimit: new Decimal(Infinity)`；修后 P54 闭式买满实测命中（cloud 1e5 → b11=9 级，效应 4.6×） |
| 8 | ERC 后 band/vor 楼层白拿（Sim §11#1 的引擎面） | onPrestige 直接 add 楼层 | 已改有帽乘区（见 §11#1） |
| 9 | **用户实测：所有 Upgrades 等页组件全不显示** | tabFormat 的 `["upgrades", [id 数组]]` 传法错误——引擎该槽是**行号列表**，id 数组被当行号 ×10+col 全查空（与 clickables 同型陷阱）；且 band/env/eye 的 id 11–20 中 20 落 col 10，setRowCol 派生 cols=9 会漏渲染 | 全部改裸 `"upgrades"`（rows/cols 由 setRowCol 派生）；band/env/eye 显式 `rows:1, cols:10`、suh `2×10`、其余 `3×5`；env challenges 显式 `3×5` |
| 10 | **用户实测：设置页无语言切换键** | 先按 F7 用 mod 侧重注册 options-tab——实测 **Vue 在 new Vue 时把全局组件表快照进实例，post-hoc Vue.component 永远到不了已挂载树**；改为 Sub.options.template 就地替换也会被 boot 尾部重建吞掉 | **采用参考游戏 The-Prime-Conjecture-Tree 的落地模式：直接在 js/technical/systemComponents.js 的 options-tab 模板加一行同款 .opt 语言键**（`toggleChinese()` 在 tuning.js，翻 `player.chinesemode` 持久化字段）；ui-overrides.js 整个移除（其四个 chrome 覆写从未生效过——同类死代码）；chrome 文案保持英文与参考同边界 |
| 3 | 设状态后立即操作被静默拒绝 | F4 实测：购买按 50ms 前的 tmp 缓存判定 | 门禁每步等待 ≥300ms（2+ tick）再操作 |
| 4 | buyBuyable/buyUpgrade 拒绝但数值足够 | 升级计价货币非层 points 时引擎按 points 判定 | 内部货币计价统一 currencyLocation 三件套 |

Feel table（§5.3 观察项，非调参信号）：①开档 1 秒内首升级（水汽 1/s 对价 1）✓；②evap→conv 首次重置 ~4 分钟有产出跃迁感（模拟器 270s）✓；③眼墙页签大字风速 + 风级徽章 + MPI 墙预警变黄（≥80 m/s）——触墙时刻有「抵墙」实感 ✓；④ERC 按下瞬间风坍缩、雨带楼层变便宜、涡度变强——「拆了重建更强」闭环可感 ✓；⑤登陆页签燃烧清单逐项显示水汽/云团/涡度/能量贡献（M19 计价可见）✓；⑥赌局 3 秒冷却 + 赔付逐字回显（「掷出 4+6=24 —— 押 100,000，返还 192,000」）✓；⑦语言开关热切换 EN↔中文（升级/里程碑即时变）✓。

Final gates：static 95 PASS / 2 WARN（§9.1 已记接受理由）/ 0 FAIL；smoke 0 FAIL 0 WARN（13 层全载入）；measured 未校准（无真人锚点；early timeline 见 §11，纸面 12–18 h 待手测回填）。
