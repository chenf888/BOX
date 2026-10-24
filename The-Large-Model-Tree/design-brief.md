# Design Brief — 大模型之树 The Large Model Tree

> 献给 1024 程序员节（2026-10-24）。一行需求驱动，无人值守模式生成；
> 采访问题按 The-Solar-Terms-Tree 先例自答，全部记录在 §2。
> Sources: `assets/blueprints.json` (medium), `assets/balance-defaults.json`, `assets/fun-quota.json`.

## 1. Identity

| Field | Value |
|---|---|
| Game name | 大模型之树 The Large Model Tree（纪念 1024 程序员节） |
| Author | chenf888（用户 GitHub ID；无人值守模式下的默认，未发明） |
| Points name (`modInfo.pointsName`) | **token**（用户明确指定） |
| Language mode (Q7) | T2 双语：`window.chinesemode` 三元式，默认中文（1024 节是中文社区节日）；override `main-display` |
| One-line pitch | 从点击「生成下一个 token」开始，沿着 LLM 生命周期爬树：上下文 → 参数/注意力 → 数据/算力 → 训练/部署 → 涌现，最终在 1024 个 AGI 里程碑达成通用人工智能。 |

## 2. Interview record (answers → parameters)

无人值守自答（Solar Terms 先例）；每条给出理由，供用户事后否决。

| # | Question | Answer (self) | Locked parameter |
|---|---|---|---|
| Q1 | Theme-structure confirmation | 见下方三行 recap | theme = structure (P14)：LLM 训练管线 = 树拓扑 |
| Q2 | Scale | **medium**（一行需求未指定 → 参照 Solar Terms/Braille 先例；medium 是 skill 蓝图的中间档，10–30h） | `blueprints.medium` 全参数 |
| Q3 | Natural ceilings | **no hard ceilings**（token 数无上界；1024 是终局里程碑不是货币上限） | 无 hard cap；仅 P12 反失控 softcap |
| Q4 | Pacing | **balanced**（纪念作品面向普通玩家，既要挂机也要有事做） | 标准蓝图 + fun quota + 8 步自动化 |
| Q5 | Side content | **full**（基准测试成就层 + 4 个训练病理挑战） | challenges + achievements 8×4 grid |
| Q6 | Automation & timewalls | **Automate everything eventually; no long walls**（纪念作品不应劝退） | 8 步阶梯，墙 < 15 min |
| Q7 | Language & style | **T2 双语，默认中文**；配色 = 代码编辑器暗色主题（GitHub Dark/Dracula 色系），字体/图标用编程符号 | P17 三元式；N-CONTRAST 全亮色 |

Q1 recap（theme = structure）：

- **Currencies (in order):** token（点击采样+流式输出）→ 上下文 context → 参数 parameters / 注意力 attention → 数据 data / 算力 compute(FLOPs) → 训练 run（预训练+后训练合一）/ 部署 deployment → 涌现 emergence → AGI（终局，1024 达成）
- **Layer topology:** c 重置 token；p、a 重置 c；d 消耗 p、f 消耗 a（重置 c/p/a）；tr 消耗 d+f（重置 row≤2）、dep 消耗 tr（重置 row≤2）；em 消耗 tr（重置 row≤3）；agi 消耗 em（重置 row≤4，赢在 1024）
- **Ceilings:** 无硬上限；AGI 1024 = `isEndgame()` 条件

## 2b. Game type profile (Q4b)

| Field | Value |
|---|---|
| Type | **active-click**（`--explicit`，exit-3 后自答：LLM 的天然离散动词是「生成下一个 token」= next-token sampling；Q4=balanced 要求有事可做） |
| User confirmation (verbatim) | 无人在场——按 Solar Terms 先例自答（design-brief §2），理由如上，脚本 margin 0.54 |
| Confidence + margin | explicit floor 0.75 / margin 0.54（board 关键词 0.21 为「模型」误报，已忽略） |
| Mandatory components | clickables（canClick + onClick，状态 number/string，startData 初始化）——t 采样按钮 |
| Forbidden components | clickable 状态用 Decimal；onClick 用箭头函数取 this |
| Rules exempt | 无豁免（D-NOUPDATE 仍生效 → 游戏必须 ≥1 个 update()，本作有 3 个：c/tr/bench） |
| requireRules | T-CLICKABLE, N-GHOSTFIELD, D-MICROTABS |

Modifiers: **sim**（2 个 custom 层：tr 带手写 update(epoch 进度条)、agi；≤3 预算 ✓）· **challenges**（M1 classic，canComplete 方言，4 个挑战全在 tr）。
Dropped: score-attack（需要 maxpoints[] 逐挑战记峰，本作挑战是阈值制）· minigame（无随机挑选目标玩法）· board（无 2D 棋盘）· caps（Q3 无硬上限）。

## 3. Theme = structure mapping (P14)

真实的 LLM 生命周期逐级映射为树的每一行；每层里程碑引用真实工程史实（上下文窗口 1K→1M、参数 1e7→1e12+、GPU 集群 8 卡→1024 卡、checkpoint→SFT→RLHF、ICL→CoT→推理模型）。**1024 作为母题贯穿**：胜利条件 = 1024 AGI；上下文里程碑全部取 2 的幂（1024/4096/…/1048576）；f 层 static base 2 使 GPU 集群档位天然落在 2^n（第 10 档 = 1024 卡）；温度 buyable 顶价 1024；成就 32 枚 = 2^5；胜利文案点题 1024。配色语言 = 代码编辑器暗色主题（t #79c0ff / c #7ee787 / p #ff79c6 / a #d2a8ff / d #ffa657 / f #ff7b72 / tr #e3b341 / dep #56d364 / em #d2a8ff→改 #a5d6ff / agi #ffcc00 / bench #8b949e），象征「在编辑器里训练大模型」。

## 4. Layer chain table

底行在前。**player.points = token**（主货币，getPointGen + 点击采样产出，不是独立层）。

| id | name (theme voice) | row | pos | type | base resource → baseAmount | requires | exp/base | upgrades | milestones | challenges | buyables | automation granted (by which milestone) | softcap plan | doReset keeps | branches |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| c | 上下文 Context | 0 | 0 | normal | token → player.points | 10 | 0.5 | 12 (5×3) | 6 (1K/4K/32K/128K/1M/16M) | — | 3 (上下文压缩@ctx；KV缓存/投机解码@bytes) + **采样 clickable** | m0: keep c upgrades (自身 doReset)；m1: passiveGen(c)；m2+m1: resetsNothing(c)+autoPrestige(c)（由 p m3 代发） | layer softcap @1e9, pow 0.4, 升级 ×10 抬升 | unlocked, milestones, best, total, (upgrades@m0), bytes | — |
| p | 参数 Parameters | 1 | 0 | normal | 上下文 → player.c.points | 250 | 1/3 | 10 (5×2) | 5 (1e7/1e9/1e11/1e13/1e15 参数量级) | — | 1 (微调) | m2: resetsNothing(c)+autoPrestige(c)；m4: autoUpgrade(c) | effect 内 pow 形态；无失控环 | unlocked, milestones, best, total | — |
| a | 注意力 Attention | 1 | 1 | normal | 上下文 → player.c.points | 2500 | 1/3 | 10 (5×2) | 5 (MHA→MQA→GQA→FlashAttn→MLA) | — | 2 (多头扩展, FlashAttention) | m3: autoPrestige(p)+resetsNothing(p)（p→d 通道）；m4: passiveGen(p) | 同上 | unlocked, milestones, best, total | c |
| d | 数据 Data | 2 | 0 | normal | 参数 → player.p.points | 2500 | 0.25 | 10 (5×2) | 5 (清洗/配比/合成/去重/蒸馏数据) | — | 1 (数据配比) | m3: autoPrestige(a)+resetsNothing(a)；m4: passiveGen(a) | layer softcap @1e12 pow 0.3 | unlocked, milestones, best, total | p |
| f | 算力 Compute | 2 | 1 | static | 注意力 → player.a.points | 2500 | base 2, exp 1 | 10 (5×2) | 5 (8卡/64卡/512卡/**1024卡**/1万卡) | — | 1 (互联带宽) | m2+m1: autoPrestige(d)+resetsNothing(d)；m3: autoUpgrade(d) | static → 无 layer softcap；canBuyMax 由 u15 解锁 | unlocked, milestones, best, total, (points@m1) | a |
| tr | 训练 Training | 3 | 0 | **custom** | 数据×算力 → d.points+f.points | (getNextAt 自写) | 自写 (双资源 scaling law) | 12 (5×3) | 8 (预训练→SFT→RLHF→DPO→… checkpoints) | **4** (过拟合/梯度消失/灾难性遗忘/模式崩溃, completionLimit 2) | 2 (学习率, batch size) | m3: autoPrestige(f)+resetsNothing(f)；m4: autoUpgrade(f)；m7: 全自动化 package (tr 自身) | getResetGain 内 staged re-root（P12-3） | unlocked, milestones, best, total, epochs, (upgrades@里程碑) | d, f |
| dep | 部署 Deployment | 3 | 1 | normal | 训练 → player.tr.points | 2500 | 0.25 | 10 (5×2) | 4 (INT8/INT4/蒸馏/边缘端) | — | 3 (量化, KV缓存, 推测解码) — **M8 shop** | 无失控环（单向消耗 tr） | unlocked, milestones, best, total | tr |
| em | 涌现 Emergence | 4 | 0 | normal | 训练 → player.tr.points | 25000 | 0.25 | 10 (5×2) | 6 (ICL/CoT/SC/工具使用/反思/长推理) | — | 1 (思维树分支) | m3: autoPrestige(dep)+resetsNothing(dep)；m5: 全 ladder 终局 package | layer softcap @1e15 pow 0.3 | unlocked, milestones, best, total | tr |
| agi | AGI | 5 | 0 | **custom** | 涌现 → player.em.points | (getNextAt 自写) | 自写 | 8 (4×2) | 3 (512 半程/1020 冲刺/**1024 达成**) | — | 0 | —（终局层无自动化） | getResetGain 硬路径 | unlocked, milestones, best, total | em |
| bench | 基准 Benchmarks | side | — | none | — | — | — | — | — | — | — | **32 成就 (8×4)**：真实基准名 + 程序员梗；奖励 = flat mults + P11 backfill（带 !has 守卫）+ 1 个自动化补发 | — | — | — |

Rules the table must obey：
- requires 字面值阶梯（同货币可比处）：10 (c, token) → 250 (p, c) → 2500 (a, c；同层内 ×10) → 2500 (d, p) → 2500 (f, a) → dep 2500 (tr) → em 25000 (tr)。相邻行 ×10–×100 ✓（§9.1 接受 f 的同值平档：不同货币，无×比意义）。
- 每主层 ≥10 upgrades + ≥3 milestones ✓（bench 除外，side 层）。
- 每新层 gainMult 增 ≥2 条旧层线；≥1 个 upgrade 增强 token（A7 检查：c u12、p u11、d u11、f u11、tr u11、dep u11、em u11 均有 token/上下文增益线）。

### 4.1 Fun density table

| id | content items | effect-kind plan | organization | mechanics |
|---|---|---|---|---|
| c | 12U+6M+3B+1click | u11=K1, u12=K2 (pow .5 on tokens), u13=K3 (from c.best), u15=K5 (softcap 抬升), u21=K6 (里程碑条件), u22=K2 (log), KV 2B=K4 (named: KV缓存/投机解码), m 奖励 K7/K8 混合 | tab: main/**clickable**/button/ctx; microtabs: 升级\|里程碑\|购买\|日志 | **M5 KV bytes + M4 自动采样 update** |
| p | 10U+5M+1B | u11=K1, u12=K2 (pow), u13=K3 (from a), u14=K4 (参数量级 named mechanic ^1.05), u15=K7 unlock, u22=K2 log | microtabs: 升级\|里程碑 | M5 微调 buyable |
| a | 10U+5M+2B | u11=K1, u12=K2, u13=K3 (from d), u14=K4 (注意力头 named), u21=K5 (f 成本降), u15=K7 | microtabs | M5 |
| d | 10U+5M+1B | u11=K1, u12=K2, u13=K3 (from f), u14=K4 (数据配比 named), u15=K7, u22=K6 (合成数据条件) | microtabs | M5 |
| f | 10U+5M+1B | u11=K1, u12=K2, u13=K3 (from tr.best), u14=K5 (canBuyMax), u15=K7, u22=K6 | microtabs | static floors (P5) |
| tr | 12U+8M+4C+2B+1bar | u11=K1, u12=K2 (双资源 pow), u13=K3, u14=K4 (scaling law named), u15=K5 (re-root 延迟), challenges 奖励 K6 条件族, m5=K8 (epochs 产出) | tab: main/bar/ctx; microtabs: 升级\|里程碑\|挑战\|训练室 | **M1 challenges ×4, M4 bar+update, M7 custom ritual** |
| dep | 10U+4M+3B | u11=K1, u12=K2, u13=K3, u14=K4 (^1.05 tr), u15=K5 (成本降), u21=K7 | microtabs: 升级\|商店 | **M8 shop** |
| em | 10U+6M+1B | u11=K1, u12=K2, u13=K3 (from agi.best), u14=K4, u15=K5, u22=K6 (CoT 条件) | microtabs | M5 |
| agi | 8U+3M | u11=K1, u12=K2, u13=K3 (agi 自身 scaling), u21=K7, 其余 K1→K2 混合 | tab: main/button/ctx | 终局 ritual |
| bench | 32A | 成就奖励 K1 flat + K7 backfill | grid 8×4 | M10 collection |

K1 份额逐层 ≤40% ✓（每层 K1 ≤ 5/12 或 4/10）；每层 ≥3 种非 K1 kind ✓。

## 4b. Game-level fun plan (medium quota)

| Quota (medium) | Planned | Where |
|---|---|---|
| Distinct mechanics ≥4 | **7**：M1 挑战、M4 bar+update、M5 次要货币、M7 custom ritual、M8 shop、M10 collection、P11 backfill | tr/d/f、tr、c(KV bytes)、tr、dep、bench、bench |
| Challenge layer (M1) | tr 层 4 挑战，canComplete 方言，completionLimit 2 | tr |
| Clickable group(s) ≥1 | c 层采样 clickable（canClick/onClick/状态 number） | c tab 顶部 |
| Bar(s) ≥1 | tr epoch 收敛进度条（progress 不除零） | tr |
| Layers with update() ≥3 | **3**：c（自动采样+流式+KV bytes）、tr（epoch bar）、bench（P11 backfill） | — |
| Secondary currency (M5) ≥1 | **KV 缓存字节 (c.bytes)**：update() 产出 ∝ token 流，2 个 buyable 消耗 | c |
| Shop/meta layer (M8) | dep 层：量化/KV/推测解码 3 buyable + K4/K5 upgrades | dep |
| Custom ritual (M7) | tr custom getResetGain（「启动新一轮训练」）+ agi | tr/agi |
| Story presentation | c 层 microtab「日志」：解锁制训练日志（unlock-gated 段落） | c |

## 5. Tree sketch

```
row5:                        [AGI]
row4:                        [EM]
row3:              [TR]   [DEP]
row2:       [D]          [F]
row1:       [P]          [A]
row0:              [C]        ← 基础 points = token
side:            (BENCH 基准)
```

## 6. Automation ladder

P4 顺序、一次一 chore、跨层授予（resetsNothing 恒先于 autoPrestige；N-AUTOWIPE 集合蕴含 ✓）。**下表是 Stage 6 实测后的最终接线，由代码反查回写（生成期草案已作废）**：

| Step | Chore 死亡 | Granted by | Threshold |
|---|---|---|---|
| 1 | c 升级重置保留 | c m0 | c.best ≥ 1024（1K 上下文） |
| 2 | c 自动声望 + resetsNothing(c) | p m1 | p.best ≥ 50 |
| 3 | a 自动声望 + resetsNothing(a) | a m0（并联备份：f m1 @5 卡） | a.best ≥ 250 |
| 4 | p 自动声望 + resetsNothing(p)；keep d 升级 | d m0 | d.best ≥ 10 |
| 5 | autoUpgrade(p) | d m1 | d.best ≥ 50 |
| 6 | autoUpgrade(c) | a m1 | a.best ≥ 2500 |
| 7 | p、d 随时间自然增长（passiveGeneration 0.1） | d m2 | d.best ≥ 500 |
| 8 | autoUpgrade(d) | d m4 | d.best ≥ 5e4 |
| 9 | f 升级重置保留 + 成本 ×0.85 | f m0 | f.best ≥ 1（首卡上机） |
| 10 | autoUpgrade(f) + 解锁「互联带宽」 | f m4 | f.best ≥ 20 卡 |
| 11 | a/d/f 全自动 package（声望 + 保留 + 升级） | tr m3 | tr.best ≥ 1000（SFT 完成） |
| 12 | tr/dep/em 终局 package（含 em 自身声望包） | em m3 | em.best ≥ 1e5（工具使用涌现） |

奖励型里程碑（非 chore）：c m1 token×3、c m2 流式×5、c m5 2²⁴ 彩蛋、p m0 ctx×2、a m4 FA-2、f m2 token×3、tr m2/m7、em m1/m5、agi 128/512。

成就补发（P11，全部带 `!has` 守卫）：bench 21 → 补发 c m0；bench 25 → 补发 p m1；bench 31 → 补发 a m1。

Stage 6 文案-接线一致性修复：f m2 原文案「自动购买参数升级」是死承诺（d m1 更早已授，全代码无 f m2 消费者）→ 已删；f m4「自动购买算力升级」原未接线 → 已真接 `f.autoUpgrade() = tr m3 ‖ f m4`；f 里程碑标签原用「32卡/1024卡/32768卡/百万卡」但静态层 ×2 成本下物理不可达 → 改为与阈值一致（1/5/10/15/20 卡，m4 保留「百万卡之梦」风味）。

## 7. Endgame definition

- `isEndgame()`: `player.agi.points.gte(1024)` —— **1024 = 胜利数字**。
- Reachability estimate：token 产出起步 1/click + 0.2/s；×25 requires 阶梯 ×6 行，行间 OUTPUT_STEP≈×18（ROW_RATIO ×25 ÷ OUTPUT ×18 ≈ ×1.39/行，目标带 ×1.1–×1.6 ✓）；纸面估算 ~7 行 × 40–70 min ≈ 5–8 sim h → 真人 15–25h（medium 目标 10–30h ✓）。Stage 6 实测为准（§11）。
- `winText`: 「你把 1024 个涌现里程碑连成了通用智能。1024 程序员节快乐 —— 愿 token 与你同在。/ You aligned 1024 emergence milestones into a general intelligence. Happy 1024 Programmer's Day — may the tokens be with you.」

## 8. Cap table

| Currency | Ceiling? | Cap mechanism | Where |
|---|---|---|---|
| token (points) | none | 无失控环（clickPower 不自指）；仅 UPG_MULT 平乘区 | getPointGen |
| c 上下文 | none | layer softcap @1e9 pow 0.4；u15 抬升 ×10（可见：ctx display-text 常显 cap 警告） | layer softcap |
| p 参数 | none | effect 内 pow ≤0.5 + K4 ^1.05；无 layer cap（增长温和） | upgrades |
| d 数据 | none | layer softcap @1e12 pow 0.3 | layer softcap |
| a 注意力 | none | 同 p | upgrades |
| tr 训练 | none | custom getResetGain staged re-root（1e10/1e30/1e90 三阶） | getResetGain |
| em 涌现 | none | layer softcap @1e15 pow 0.3 | layer softcap |
| agi | **win, not cap** | 无 cap；1024 = isEndgame | mod.js |

## 9. Self-check results (21 项)

- [x] 1 — requires 阶梯单调 ×10–×100 ✓（f 平档与 custom 层见 §9.1/§10）
- [x] 2 — 首层 requires 10 ✓（c @10 token，mode 10）
- [x] 3 — 每主层 ≥10U + ≥3M ✓（agi 8U+3M：终局层豁免薄层判定，见 §10 偏差 D3）
- [x] 4 — 每新层 gainMult ≥2 条旧层线；每层 ≥1 upgrade 增强第一层 ✓（见 §4 表注）
- [x] 5 — 自动化 8 步、P4 顺序、一 chore 一步、跨层授予 ✓（§6）
- [x] 6 — 无界环 softcap 计划齐全 ✓（§8；clickPower/getPointGen 无自指环）
- [x] 7 — A1–A10 扫描：无 backwards ladder（A1）、行连续（A2）、≥3 主层（A3）、薄层（A4，agi 声明豁免）、平树（A5）、无自动化（A8）；A6 靠 7 种机制与跨层 wiring 规避 ✓
- [x] 8 — K1 逐层 ≤40%；每层 ≥3 非 K1 kinds ✓（§4.1）
- [x] 9 — 每主层 tabFormat；≥3 内容组开 microtabs；ctx display-text（base/best/softcap 警告）✓
- [x] 10 — 游戏级 quota 7 种机制全落地 ✓（§4b）
- [x] 11 — 乘区预算：每层至多 1 个自指升级（tr u12 双资源 pow，非自指）；Σ self-exp in gainMult ≤ 0.6；row-0 末平乘区积 ≈ ×640 ≪ 1e4 ✓（数值全部进 TUNING.UPG_MULT）
- [x] 12 — wiring 计划：每个 upgrade 标注 token/gate 或 value+具名消费者（gainMult/gainExp/pointGen/epoch 公式）——生成时同步写消费侧 ✓
- [x] 13 — 每层成本梯 ≥6 数量级 + 至少 1 次刻意 drop（如 tr u24 定价 1024）；≥30% pow/log 形态 ✓
- [x] 14 — 组件密度 8–30/层 ✓；挑战 ≤15% upgrades（tr: 4/12 = 33% —— **超标**，见 §10 D4：tr 是挑战宿主层，4 个病理挑战是主题核心，接受该偏离并保持全游戏挑战占比 4/102 = 3.9% ≈ 语料 1.8% 量级）
- [x] 15 — author pacing：首 boost ≤10s（首 upgrade 定价 1 token，一次点击即得）；>1min 的重置必有所得（里程碑阶梯）；大重置立刻变快（旧层 gainMult 线）✓
- [x] 16 — 一 upgrade 一生产加成；无 upgrade 增强另一 upgrade 隐藏数值（K4 只打 named mechanic/资源）；门槛解锁不付费 ✓
- [x] 17 — 成本塑形优先；softcap 仅反失控且全部可见显示 ✓
- [x] 18 — **ROW_RATIO = ×25，OUTPUT_STEP = ×18 → 每行 ×1.39** ✓（两常数入 TUNING，Stage 6 实测修正）
- [x] 19 — reset 生命周期：所有里程碑读 best/total 且 doReset 恒 keep；autoPrestige 旗标 = resetsNothing 条件 AND（集合蕴含）；无 update() 赋值 points（用 addPoints/自定义字段）；static f 有 canBuyMax ✓；全部 doReset 带 vanilla guard `row > this.row`
- [x] 20 — type contract：clickable 组 ✓（c 层采样）、update ≥1 ✓（3 个）、D-NOUPDATE 满足、被弃修饰符已记录 ✓
- [x] 21 — 测量计划：全部 pacing 常数住 `js/tuning.js`（TUNING），层文件/模拟器/显示文案三方同读 ✓

## 9.1 Static-warning acceptance

（Stage 5 终态：**77 PASS / 2 WARN / 0 FAIL**，两 WARN 书面接受如下）

| Check | Layers | Why accepted (or: fixed — how) |
|---|---|---|
| D-REQRATIO | a（row1→row2 需求比 ×1） | d/f 的 requires 消耗 p/a 层货币（跨货币），与 a 的 ctx-requires 求数值比无意义。曾试 F12 函数式 requires escape，被 D-PRESTIGE（仅认字面量）判 FAIL —— 两规则冲突时取字面量，按 WARN 接受。同货币段阶梯均在带内：p 100→a 500（×5，同行分支间距）、d 2500→tr（自定义基数）→dep 2500→em 25000（×10） |
| D-LOCALWIRE | f | 静态层惯例（语料同款）：f 的 gainMult 是**成本乘数**（卡更便宜），其 4 个 effect() 升级全部跨层 wiring（a/d boost、tokenBoost）——「算力惠及全树」正是主题；本层自身成长由 canBuyMax + 成本下降承担 |

## 10. Deviations & open questions

| # | Default overridden | Value used | Why |
|---|---|---|---|
| D1 | blueprint medium rows last [3,4] | rows 0–5，10 主层 | P14：LLM 生命周期 6 级级联是主题结构；同排只放不互相重置的兄弟层（p/a、d/f、tr/dep）。10 层 = medium 下限，7 机制密度防「竖条单调」（A6） |
| D2 | medium row1 [2,4] 层 | row1 只有 p、a（2 层） | 生命周期该级就两个概念；宽度由 row2/row3 补 |
| D3 | agi 薄层豁免（8U+3M） | 终局 ritual 层 | 终局层是仪式不是刷子（Mario Maker the_end 模式）；agi 点数 1024 的长跑由 getResetGain 曲线承担 |
| D4 | 挑战 ≤15% upgrades | tr 层 4/12 = 33% | tr 是挑战宿主层（训练病理是主题核心）；全游戏挑战/升级 = 4/92 ≈ 4.3%，符合语料 1.8% 量级 |
| D5 | row1 exponent [0.3,0.33] | p/a/d/dep 用 0.4，em 0.45，c 0.5（row0） | Stage 6 实测：0.33 使 6 层级联压缩过度（压缩链病，§11 #6）；0.4 是行间 OUTPUT ×1.39 目标的实测解 |
| D6 | 首层 requires mode 10 | 10 ✓ | 无偏离 |
| D7 | 作者名 | chenf888 | 用户 GitHub ID（skill repo 所有者），非发明；交付时告知可改 |
| D8 | 采访自答 | 全部 7 问 | 无人值守模式（Solar Terms 先例）；每条附理由供否决 |
| D9 | tr「训练」合并预训练+对齐（原设计 11 层 → 10 层） | SFT/RLHF 成为 tr 里程碑 | 避免 row4/row5 单列薄层；对齐病理放挑战槽 |
| D10 | 流式输出设计为里程碑 | c u13 升级门控（getPointGen 内 hasUpgrade），速率随采样强度成长 | 命名机制要可买可成长（K2 习语）；里程碑槽全留给自动化 chore |
| D11 | f 里程碑标签用卡数阈值 1/5/10/15/20 | 原「1024 卡/百万卡」标签物理不可达（静态层 ×2 成本） | 标签必须与机制一致（N-UNLOCKTEXT 类纪律）；1024 主题由 win@1024 / c m0 / agi 1024 承担 |
| D12 | F12 函数式 requires escape | 未采用（字面量 + §9.1 接受） | D-PRESTIGE 仅认字面量，两规则冲突时 FAIL 劣于 WARN |
| Q | 「token」作为 pointsName 显示格式 | formatWhole | 引擎默认；英文复数不作特判 |

## 11. Stage-6 measured retune

（权威数据；模拟器 = 游戏内 tools/simulate.js + tools/smoke.js，模拟器改动均以 `ADAPT:` 注释）

| # | Finding (measured) | Root cause | Fix, and where the constant lives |
|---|---|---|---|
| 1 | 首测 238h，收入 0 | 模拟器缺 `global.layers` 别名，getPointGen 抛错被静默 catch 吞掉 | simulate.js ADAPT：`global.layers = LAYERS` + 去静默 |
| 2 | 收入仍 0，层不声望 | autoPrestige 未移植 | simulate.js ADAPT：移植 game.js 循环的 prestige 段（`__apFires` 计数） |
| 3 | 贪心按压 1/s 永久 wipe 低排，a/f 死层 | tick 顺序购买在声望后 + 微收益也按压 | tick 重排（产出→被动→update→里程碑→声望→购买）；手动按压加 worthIt 栏（gainOf ≥ 池 2%） |
| 4 | 低排被根清空钉在 0 | resetsNothing 未豁免根 wipe | doPrestige 模拟 respects resetsNothing（与 N-AUTOWIPE 不变量同源） |
| 5 | buyable 白嫖、等级卡死 | buyables 不经 currency 字段自动扣费 | payer 读 currencyLayer/currencyInternalName；1 级/层/tick 节流 |
| 6 | 55h：6 层级联压缩 ≈ ×6e-4，AGI 增益 ×1.014 | 压缩指数（self）+ shape 指数过低 | TUNING.SELF / TUNING.SHAPE 全面上调（c16 0.4、p13 1.5、d13/tr12/dep13 1.6 等，**全部常数住 tuning.js**） |
| 7 | 大重置循环中层效应被钉在 0（雪崩死） | 层效应读 `.points`（每轮被 wipe） | **结构修复：全部层效应改读 `.best`**（doReset 恒 keep）——本作最重要的一处修复 |
| 8 | 1 Hz 决策饥饿：buyable 起价 5 被锯齿锁死 | 20 Hz 实机回血快 20× | p/a/d buyable 起价 5→50；1 Hz 粒度列为 sim 排除项 |
| 9 | 终态 2.80h，时间线健康 | — | **冻结** |

迭代轨迹：238h → 55h → 51h → 23.6h → 15.5h → 8.5h → 6.3h → 5.6h → 3.0h → **2.80h**（每步只动 TUNING，不动代码逻辑；#7 除外——那是 wiring 层修复）。

Measured timeline：first purchase **1 s**；c @10s、p @363s、d @2353s、a @3171s、tr @3210s、dep @5201s、em @6206s、agi @9696s；peak income 1.19e26 @10082s；upgrades/milestones **49/92、32**。Total to `isEndgame()` **2.80 h**。Sim exclusions：无成就奖励（32 个）、无挑战奖励（4×2 次）、无 clickable 手操、1 Hz 决策粒度（f 分支在 sim 中 0 触发，20 Hz 实机会启用）→ 真人 ≈ ×3–4 ≈ **8–12 h**。低于 §7 原估 15–25h（medium 10–30h 下沿）：接受——1024 纪念作定位「一个长周日能通关」，且全部 sim 排除项都会给真人加时。

## 12. Browser-verification fixes (Stage 6.5)

（Stage 6.5 实测：真实浏览器全项通过——bootErrors 全程为空；c/p/a/d/em 声望、f 静态（nextAt 递增）、tr/agi 自定义（agi 收益 (em/1e5)^0.6 吻合）；c u11 点击 ×2 实测 +6/3 击；c 买able token 价 ✓、f 买able a 价跨货币（F9）✓；c m0 重置保升级 ✓；p m1 自动声望在真实循环触发 ✓；tr 挑战进入→完成→退出 ✓；bench 层渲染、19 成就自然达成、中英切换 ✓；存档→重载全部持久 ✓；agi 1024 胜利画面（winText + 用时）✓）

| # | Symptom | Root cause | Fix |
|---|---|---|---|
| 1 | 打开任意层 tab，整个右栏内容区消失（`InvalidCharacterError: createElement('你有 <h2…>0</h2> 上下文')`） | mainLineFn/baseLineFn 是**工厂函数**，在 tabFormat 里写成裸行被 TMT 当组件名解析 | 16 处（9×mainLineFn + 7×baseLineFn）包成 `["display-text", …]`。静态检查/smoke/模拟器都看不到渲染层，**只有浏览器能抓到**——Stage 6.5 不可省略的实证 |
| 2 | 上述真实报错被遮蔽为 "Script error."，无法定位 | Vue 2 从 unpkg 跨域加载，异常被安全策略脱敏 | `js/vue.min.js` 本地化 + index.html 改本地引用（顺带获得离线可玩性）；smoke 的 ENGINE 正则同步排除 vue |
| 3 | f 里程碑标签「32卡/1024卡/32768卡/百万卡」与阈值 5/10/15/20 不符；f m2 文案「自动购买参数升级」无消费者 | 生成期文案未随 Stage 6 接线演进同步 | 标签改为与阈值一致（1/5/10/15/20 卡，m4 保留「百万卡之梦」）；f m2 删死文案；f m4 真接 `f.autoUpgrade() = tr m3 ‖ f m4` |
| 备注 | 验证环境定时器 ~10× 节流（100ms 定时器 2.8s 只触发 3 次） | Chrome 对失焦/遮挡标签页强制节流（hasFocus=false） | **非游戏缺陷**——真人前台游玩 20Hz 正常；测试时以 `updateTemp+updateTabFormats+gameLoop` 手动驱动同一代码路径 |
| 4 | 用户验收：英文模式下资源名/微页签/里程碑/购买项/成就等仍是中文；要求默认英文 | 237 处描述字段在**装载期**求值（`field: L(...)` 静态串）——L() 再动态也只反映装载时的模式；微页签键名/资源名是静态串；tab-buttons 等零依赖组件只在挂载时渲染一次（挂载早于存档加载，永远定格默认语言） | **全量 i18n 改造**：① L() 改为默认英文（chinesemode===true 才中文）+ bench startData 默认 false；② 237 处静态字段包成函数——引擎 updateTempData 每 tick 重调全部函数型字段写 tmp，语言切换即时生效；③ resource/baseResource→函数、9 个微页签键改英文 ID + tabLabel() 查表（tab-buttons 模板加 chinesemode 响应式绑定——零依赖组件的惯用法）；④ 6 层新增本地化 prestigeButtonText（引擎显示串本就英文）；⑤ 热键条 run() 化 + 热键描述包函数；⑥ toggleAuto 翻转后强制 updateTemp+updateTabFormats；⑦ 引擎残留英文标签（Cost:/Currently:/Time Played/Hotkeys）本地化。D-PRESTIGE 同样只认字面量 → baseResource 回退字面量（仅锁定悬停提示消费），prestigeButtonText 承担本地化。浏览器实测：默认英文全通、真实点击切换双向即时翻转（微页签/费用/里程碑/购买项/成就/挑战/热键/树节点提示）、bootErrors 全程为空 |
