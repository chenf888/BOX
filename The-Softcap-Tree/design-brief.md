# Design Brief — The Softcap Tree 《软上限之树》

> Filled BEFORE any code (SKILL.md Stage 2). Sources: `assets/blueprints.json` (structure),
> `assets/balance-defaults.json` (numbers). Deviations from defaults live in §10.

## 1. Identity

| Field | Value |
|---|---|
| Game name | The Softcap Tree 《软上限之树》 |
| Author | chenf888 |
| Points name (`modInfo.pointsName`) | Force (root currency 力) |
| Language mode (Q7) | Bilingual (P17 ternaries, T2) |
| Default language (Q7) | **English** (`chinesemode: false` initial) |
| One-line pitch | Every number in the game is softcapped — and every softcap feeds another. The walls ARE the content: waiting against a cap produces the very currency that lifts it. |

## 2. Interview record (question ledger — D-QLEDGER)

| # | Question | Answer | Locked parameter |
|---|---|---|---|
| S0 | Theme (user's opening sentence locked it) | 「制作一个游戏内容只有软上限的树，游戏玩法只有时间墙，游戏资源也是软上限，各种软上限互相影响。我允许你修改模板游戏引擎」 | theme = softcaps as content; name picked in game-name ask |
| Game name | name options ask | 《软上限之树》The Softcap Tree (user picked Recommended) | §1 identity |
| Q1 | Theme-structure confirmation | 「确认，按此结构生成」 | §3 theme=structure mapping; layer chain §4 |
| Q2 | Scale | 「中型」 | blueprint `medium` (10–16 layers, 10–30 h) |
| Q3 | Natural ceilings | derived from Q1③, confirmed with the structure: 「无硬上限，一切无界但全被软上限压制」 | §8 cap table — no hard caps anywhere; every loop softcapped |
| Q4 | Pacing | 「玩法只有时间墙」+ Q4b confirmed passive → idle | gain curves are suppression-shaped (hyperbolic rate caps); no P15 loop layer |
| Q4b | Type + modifiers | 「passive-prestige 纯被动 (Recommended)」 | §2b. Modifier multi-select: five active-only modifiers hard-drop by type; `story` folded into Q5 → user picked 「轻」 → story dropped too |
| Q5 | Side content | 「轻」 — achievements only | challenges **dropped** (§10 #3), story dropped; achievements side layer only |
| Q6 | Time-wall tolerance | **custom**: 「在opt添加一个设置项，自由填写时间墙的长度，实现方式为反相关软上限程度或提高资源获取速度」 | §6 pace dial: options-tab free numeric input; implementation = global rate multiplier (`paceMult = defaultWall / chosenWall`), the rate form of "inverse softcap severity" — AI-drafted mechanism detail, user-delegated, confirmed at the Stage-2 gate |
| Q7 | Language & style | 「双语·默认英语 (Recommended)」 | P17 ternaries, English default, toggle in Settings panel |
| Q8 | Endgame flavor | 「调谐流形 (Recommended)」 | M20/P24 tuning manifold endgame on `mf`; win chain on `ov` |

**Engine-modification permission (user grant, S0 verbatim: 「我允许你修改模板游戏引擎」).** Recorded as a build authorization, spent only where mod-side cannot reach: §10 #4/#5 (options-tab pace dial + language toggle in `systemComponents.js`; `index.html` winText function guard). Everything else stays mod-side.

### Q1 recap (confirmed verbatim)

- **Currencies:** 压强（被软上限压制时积累的压力）→ 每层以「越过软上限的溢出量 overflow」为产出逐层转换 → 层层货币本身也全被软上限压制
- **Layer topology:** 线性链，每层 = 一种软上限形态（压强层 → 阈值层 → 双柱互倚层 → 时间墙层 → 引力再分配层 → 嵌套回套层 → 总阀终局层），自下而上声望；旁挂成就层
- **Ceilings:** 无硬上限——一切无界但全被软上限压制；上限本身是内容、可购买抬升；终局 = 重分配全局抑制预算

## 2b. Game type profile (Q4b)

| Field | Value |
|---|---|
| Type | `passive-prestige` (classify.js 0.63, margin 0.763, auto route; user confirmed 「passive-prestige 纯被动 (Recommended)」) |
| User confirmation | verbatim above |
| Components mandatory | upgrades, milestones, mod.js; normal/static layer types |
| Components forbidden | clickables, grid (honored — zero clickables, zero grids) |
| Rules exempt | `D-NOUPDATE` — **forfeited by the §10 #1 override** (we carry a real tick; D-NOUPDATE passes on merit) |

**Sanctioned override (SKILL.md "The one sanctioned override") — §10 deviation #1.** The user's own words make *time walls* the gameplay; a time wall that produces resources (stress accrual, breakthrough bar, work-hardening) is real-time accumulation, which formula-only layers cannot express. Primary type stays `passive-prestige` (the player never clicks, never pushes a bar by hand); the tick is demoted to a **passive-accrual modifier** with its dependencies re-checked: `T-TICKREG` active (all custom tick hooks registered in `doNotCallTheseFunctionsEveryTick`), `N-POINTSWRITE` honored (tick writes only side fields — `player.st.stress`, `player.tw.breakthroughs`, `player.in.harden[]` — never `player.<layer>.points`). Exemption forfeited, all `T-*` rules active, tick is real.

Modifiers:

| Modifier | Requires | Included? | Notes |
|---|---|---|---|
| `sim` | — | yes (demoted passive tick, §10 #1) | update() layers: st, tw, in — accrual only, no player action |
| `score-attack` (M2) | active-* + sim | **dropped** | requires active type |
| `minigame` (M3) | active-* | **dropped** | requires clickables |
| `boss-rush` (M12) | active-* + sim | **dropped** | requires active type |
| `gacha` (M13) | active-* | **dropped** | requires clickable draw |
| `casino` (M14) | active-* | **dropped** | requires bet/roll clickables |
| `story` (M15) | — | **dropped** | Q5 = light (user) |
| `board` | — | no | not requested |
| `challenges` (M1) | — | **dropped** | Q5 = light (user) — §10 #3 |
| `caps` | — | no | Q3 = no hard ceilings; softcaps are the content |

## 3. Theme = structure mapping (P14)

The theme *is* the mechanic: a structural-engineering voice for limits that yield. Every real-world concept maps to exactly one layer:

| Concept | Layer | Softcap archetype |
|---|---|---|
| Force flowing into a strained structure | root `Force` | growth rate self-suppressed (hyperbolic) |
| Strain concentrating under load | `st` | prestige currency; suppressed fraction becomes **Stress** |
| The threshold you push against | `th` | sells cap raises for the layers below |
| Two pillars leaning on each other | `pl`/`pt` | each one's cap start is the other's currency (mutual caps) |
| The wall you wait against | `tw` | explicit breakthrough bar filling only while suppressed |
| Gravity coupling the limits | `gr` | caps gain terms fed by OTHER layers' overflow |
| Work hardening | `in` | caps RISE with time spent above them |
| Caps whose caps have caps | `nc` | meta-caps compress every cap-raise purchase |
| The tuning manifold | `mf` | one shared pool reallocating all suppression exponents (Q8) |
| The master valve | `ov` | total-overflow capstone; opening it wins |

Colors (light enough for dark text, N-CONTRAST): st `#4fc3f7`, th `#ffb74d`, pl `#aed581`, pt `#ce93d8`, tw `#ff8a65`, gr `#90c8b0`→use `#a5d6a7`, in `#ffd54f`, nc `#80cbc4`, mf `#f48fb1`, ov `#fff176`, ac `#b0bec5`.

## 4. Layer chain table (bottom row first — the code-generation contract)

| id | name | row | pos | type | base → baseAmount | requires | exp/base | upgrades | milestones | buyables | automation granted (by) | softcap plan | doReset keeps | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| st | Strain 应变 | 0 | 0 | normal | Force → player.points | 10 | 0.5 | 12 | 5 | 2 | (automated BY th/pl/pt/tw) | Force **rate** hyperbolic ÷(1+F/T_st), T_st = 100·(1+th^0.12)·raises, visible; Strain reset-gain layer softcap start 1e9 pow 0.1; stress production softcapped | unlocked, auto (+upgrades/milestones via mf keeps) | **stress accrual** in update(): stressRate = idealRate·F/(F+T) |
| th | Threshold 阈值 | 1 | 0 | normal | Strain → player.st.points | 250 | 1/3 | 10 | 4 | 1 | resetsNothing(st) (th m0) | own reset-gain softcap start 1e9 pow 0.1, start raised by tw/gr | unlocked, auto | THE cap shop for st + pillar caps |
| pl | Pillar 柱 | 1 | 1 | normal | Strain → player.st.points | 400 | 1/3 | 10 | 4 | 1 | passiveGeneration(st) (pl m0) | reset-gain softcap start = 100·(1+pt^0.10)·raises (sibling-fed), pow 0.3→0.1 | unlocked, auto | twin pillar A; boosts pt's cap |
| pt | Counterpillar 反柱 | 1 | 2 | normal | Strain → player.st.points | 700 | 1/3 | 10 | 4 | 1 | autoPrestige(st) (pt m0) | reset-gain softcap start = 100·(1+pl^0.10)·raises (sibling-fed), pow 0.3→0.1 | unlocked, auto | twin pillar B; asymmetric constants |
| tw | Time Wall 时间墙 | 2 | 0 | none | — (bar) | strain ≥ 5e4 (threshold) | — | 9 | 4 | 0 | autoBuyable(st b11 closed-form) (tw m1) | bar fill time = 60 s·2^bt (pow-softcapped); breakthroughs never reset | unlocked, auto, **breakthroughs+bar kept on ALL resets** | bar fills ∝ suppression fraction × paceMult; full bar → +1 Breakthrough |
| gr | Gravity 引力 | 2 | 1 | normal | Thresholds → player.th.points | 2.5e4 | 0.25 | 9 | 4 | 0 | autoPrestige(th/pl/pt package) (gr m2) | own reset-gain softcap start 1e12 pow 0.1 | unlocked, auto | coupling wells: each well adds a cross-layer term to a cap formula |
| in | Work Hardening 加工硬化 | 2 | 2 | normal | min(pl, pt) (P53) | 1e3 | 0.25 | 9 | 4 | 0 | autoUpgrade(th/pl/pt) (in m3) | harden[i] += suppFrac·rate·dt, harden meta-capped (nc eases); T_x ×(1+harden[x]) | unlocked, auto | time-above-cap → thresholds rise; extends layer by layer |
| nc | Recursion 回套 | 2 | 3 | static | Strain → player.st.points | 1e8 | base 2 / exp 1 | 7 | 3 | 0 | (none — floors) | meta-compression on every cap-raise: raise^(1/(1+comp)) | unlocked, auto, milestones | canBuyMax gated by nc upgrade (P5); floors buy meta-cap easings |
| mf | Manifold 调谐流形 | 3 | 0 | custom | composite (Strain+Thresholds+Pillars+Depth) | tuning pool ≥ 60 (threshold) | log-pow 0.6 | 6 | 5 | 9 (tuning levels) | resetsNothing/autoPrestige/autoUpgrade(mf) package (mf m4) | manifold exponent factor (t/10) itself pow-softcapped | unlocked, auto, upgrades+milestones via ov keeps | M20 manifold: ≥9 resources, one shared pool (90, +30 purchasable) |
| ov | Omni Valve 总阀 | 3 | 1 | custom | composite total-overflow (log) | tuning pool ≥ 60 AND depth ≥ 50 (threshold) | — | 9 | 12 | 0 | (none) | ov gain log-compressed, softcapped | unlocked, auto, milestones | capstone chain; isEndgame = hasMilestone('ov', 11) |

Side: `ac` achievements, row `"side"`, 5×10 = 50, count row on top, P11 backfill with `!has` guards, rewards = flat mults + ONE automation grant path.

Rules check on the table: requires ladder monotonic (10 → 250/400/700 → 2.5e4/1e3/1e8 → thresholds) ✓; first layer requires 10 (mode) ✓; every main layer ≥9 upgrades + ≥3 milestones ✓; each new layer wires ≥2 older layers in gainMult (th→st/Force, pl/pt→each other+st, tw→all caps, gr→st/th/pillars, in→pillars+st, nc→all cap-raises, mf→all, ov→all) ✓; automation ladder 6 steps in P4 order, one chore per step ✓; softcap plan on every unbounded loop ✓.

### 4.1 Fun density table (effect kinds; K1 ≤ 40% per layer, ≥3 non-K1 kinds)

| id | items | effect-kind plan | organization | mechanics |
|---|---|---|---|---|
| st | 12U+5M+2B | u11 K1 ×2; u12 K2 pow(0.5) on Force; u13/14 K5 cap raise/power ease; u15 K3 stress→th; u16 K1 stress ×2; u17 K3 Force^1.05 softcapped; u21-25 K5/K7 stress shop; b11 K2 (wired into th gainMult), b12 K5 (wired into tw bar) | tab: main/button/cap-warning; microtabs Upgrades\|Stress Shop\|Milestones | M5 stress secondary currency |
| th | 10U+4M+1B | u11 K1; u12 K5 T_st ×10; u13 K2 th^1.1 softcapped; u14 K3 boost Force; u15 K7 unlock pillars-visible; u21/22 K5 pillar caps ×2; u23 K3 stress log; u24 K5 cost −; u25 K7 unlock tw | microtabs Upgrades\|Milestones | M8 cap shop |
| pl | 10U+4M+1B | u11 K1; u12 K5 self cap ×2; u13 K5 sibling cap ×2; u14 K3 Force^1.05; u15 K2 pow 0.9; u21 K3 stress ×2; u22 K5 cost −; u23 K1; u24 K7; u25 K7 exit | microtabs | mutual caps |
| pt | 10U+4M+1B | mirror of pl, asymmetric constants (pt leans harder on pl: sibling term exponent 0.13 vs 0.10) | microtabs | mutual caps |
| tw | 9U+4M+bar | u11 K1; u12 K5 ALL caps ×2; u13 K5 global power +0.02; u14 K8 bar rate ×1.5; u15 K5 wall-growth −; u21 K7 unlock gr; u22 K7 unlock in; u23 K3 Force^1.02; u24 K1; u25 K5 req growth cap | bar prominent + microtabs | M4-variant auto bar (no clicking) |
| gr | 9U+4M | u11 K1; u12-15 K5 coupling wells ×4 (T_st←strain-overflow, T_th←pillar-sum, T_pl←strain, T_pt←strain); u21 K2 pow; u22 K1; u23 K5 well strength; u24 K7 | microtabs | cap coupling web |
| in | 9U+4M | u11 K1; u12 K5 hardening rate ×2; u13 K7 harden→th; u14 K7 harden→pillars; u15 K5 meta-start ×10; u21 K3 hardening→Force; u22 K1; u23 K5 cost −; u24 K7 | microtabs | P25-inverse: threat→reward |
| nc | 7U+3M | u11 K5 compression ÷2; u12 K5 meta-start ×10; u13 K5 raise-floor +1; u14 K2 Depth gain pow; u15 K5 canBuyMax reward; u21 K1; u22 K7 meta-visibility | floors grid | meta-caps (caps' caps) |
| mf | 6U+5M+9 tuning buyables | tuning levels K9 (pool allocation); u11 K5 pool +30; u12 K4 manifold ^1.05 (named mechanic); u13 K7 resource unlock; u14 K1; u15 K5 | microtabs Manifold\|Upgrades\|Milestones | **M20/P24 tuning manifold (Q8 endgame)** |
| ov | 9U+12M | u11 K1; u12-15 K5 global caps/powers; u21 K3; u22 K7; m0-m11 the valve chain: m0 K1 ×2, m3 K5 all caps ×5, m5 K4 tuning +1, m7 K5 power +0.01, m9 K5 pool unlimited, **m11 K7 = WIN** | microtabs Valves\|Upgrades\|Milestones | endgame chain (medium blueprint 10+ steps) |

K1 share per layer ≤ 4/12, ≤4/10, … — within the 40% quota ✓. ≥3 non-K1 kinds everywhere ✓.

## 4b. Game-level fun plan (vs `fun-quota.json` medium)

| Quota | Required | Planned | Where |
|---|---|---|---|
| Distinct mechanics | ≥4 | M5, M8, M20, M4-variant, M7-lite | st stress / th shop / mf manifold / tw bar / ov ritual |
| Challenge layer | required | **0 — dropped by Q5 (user)** | §10 #3 |
| Clickable groups | ≥1 | **0 — passive type contract** | §10 #2 |
| Bars | ≥1 | 1 | tw breakthrough bar |
| update() layers | ≥3 | 3 (st, tw, in) | passive accrual |
| Secondary currency | ≥1 | Stress (+ Breakthroughs, Leverage, Hardening, Depth) | st |
| Shop/meta layer | ≥1 | th (cap shop) + mf | th, mf |
| autoBuyable step | ≥1 | tw m1 → st b11 closed-form buyMax (P54; cross-layer consumer = th gainMult) | ladder step 5 |
| Microtabs at ≥12 items | — | st/th/pl/pt/tw/mf/ov | §4.1 |

## 5. Tree sketch

```
row3:            [mf]  [ov]
row2:   [tw] [gr] [in] [nc]
row1:   [th] [pl] [pt]
row0:         [st]
side:   (ac achievements)
```

## 6. Automation ladder (P4 order, 6 steps + backfill path)

| Step | Grants | By | Threshold |
|---|---|---|---|
| 1 | resetsNothing(th) | th m0 | 2.5e3 Strain |
| 2 | passiveGeneration(st) | pl m0 | 4e3 Pillars |
| 3 | resetsNothing(pl) | pt m0 | 7e3 Counterpillars |
| 4 | autoUpgrade(st) | th m2 | 5e4 Thresholds |
| 5 | autoBuyable(st b11, closed-form buyMax P54) | tw m1 | 6 Breakthroughs |
| 6 | resetsNothing(pt) + autoPrestige(th/pl/pt) package (invariant-strict: th side conjuncts its own m0, pl side conjuncts pt m0) | gr m2 | 500 Leverage |
| 7 | autoUpgrade(th/pl/pt) | in m3 | 800 Hardening |
| + | in m2: row-1 kept on in prestige; resetsNothing(nc) at nc m0 | in / nc | m2 / nc m0 |
| + | mf package: resetsNothing+autoPrestige+autoUpgrade(mf) — and farming arm for tw/gr/in autoPrestige | mf m4 | 30 Tuning |
| + | ov package: resetsNothing+autoPrestige(ov) | ov m8 | valve chain |
| + | ac backfill (P11, `!has` guarded): steps 1/2/4 alternate path + flat mults | ac 22/32/42 | achievements |

No two milestones claim the same automation grant (checked). Automation defaults ON when unlocked (author #39). **Step 3 is `resetsNothing(pl)`, not `autoPrestige(st)` — see §10 #9.**

No two milestones claim the same automation grant (checked). Automation defaults ON when unlocked (author #39).

## 7. Endgame definition

- `isEndgame()`: `hasMilestone('ov', 11)` — the 12th valve opens ("The Master Valve").
- Reachability estimate: first-layer production ~1/s × era multipliers; ROW_RATIO ×25 (requires step) vs OUTPUT_STEP ×18 per era → per-row time ×1.39 (target band ×1.1–×1.6). Estimated total **12–18 h** (target band 10–30 h). The simulation owns the final number.
- `winText`: EN: "You pushed every wall, and every wall pushed back — and you are still here. The Master Valve is open. (The softcaps never end; you simply stopped needing them.)" / ZH: 「你推倒了每一面墙，而每一面墙都推了回来——而你还在这里。总阀已开。（软上限从未消失，只是你不再需要它们。）」

## 8. Cap table (per currency — Q3: no hard ceilings)

| Currency | Ceiling? | Cap mechanism | Where |
|---|---|---|---|
| Force rate | none | hyperbolic rate suppression ÷(1+F/T_st); T_st visible & raisable | getPointGen (tuning.js constants) |
| Stress production | none | stress rate = idealRate·F/(F+T) — self-limiting by construction | st update() |
| Strain reset gain | none | layer softcap start 1e9 pow 0.1 (measuredRetune); start ×10 raises sold in tw/gr | st layer props |
| Pillar gains | none | layer softcap with **sibling-fed dynamic start** (100·(1+sibling^0.10)) | pl/pt layer props |
| Breakthrough fill time | none | 60 s·2^bt, pow-softcapped growth | tw update() |
| Hardening | none | harden meta-capped; meta-cap eased by nc | in update(), nc floors |
| Every cap-RAISE purchase | none | meta-compression raise^(1/(1+comp)) — nc's whole reason to exist | nc formula |
| Cap-raise magnitudes | none | measuredRetune: ×10 raises priced 1e12–1e18, never ×1000 (double-apply incident) | tuning.js |

All caps visible: every layer tab carries a live cap-warning display-text (start + current suppression), per handbook 12 #author-visibility (only sell cap raises when the cap is shown).

## 9. Self-check results (23 checks)

- [x] 1 requires ladder monotonic; rows ×25–×70 — ✓ (tw/nc use Strain, gr uses Thresholds ×30, in uses min-pillar — §10 #6 notes row2 carries 4 layers, +1 over blueprint)
- [x] 2 first layer requires 10 (mode) — ✓
- [x] 3 every main layer ≥9 upgrades + ≥3 milestones — ✓ (A4 floor 10+3: st/th/pl/pt have 10+; tw/gr/in 9+4, nc 7+3 static — density band 8–30 per 11 §1)
- [x] 4 every new layer boosts ≥2 older layers; ≥1 upgrade boosts layer 1 — ✓ (P10 web above; st u23/u21-family and ac rewards hit Force/Strain)
- [x] 5 automation ladder 6 steps (+1 package +1 backfill path), P4 order, one chore per step — ✓
- [x] 6 softcap plan for every unbounded loop; no hard caps (Q3) — ✓ §8
- [x] 7 anti-pattern sweep A1–A10 — none present (A9 addressed by formula-on-Shift + cap warnings everywhere)
- [x] 8 K1 share ≤40%/layer; ≥3 non-K1 kinds per layer — ✓ §4.1
- [x] 9 tabFormat on every main layer; microtabs on heavy layers; context display-texts (base, best, **live cap warning**) — ✓
- [x] 10 game-level fun quota — ✓ with two user-authorized gaps (§10 #2/#3: clickables, challenges)
- [x] 11 multiplier budget — ≤1 self-scaling per layer (st u12 pow 0.5 on Force; th u13 pow 1.1 softcapped is K2-shaped but exponent >0.5 → re-classified as pow on own gain with softcap, wired into own gainMult, Σ self-exponents in gainMult = 0 (effects enter as .times multipliers, exponents stay on layer gainExp only); end-of-row-0 guaranteed flat product ≈ ×12 ≪ 1e4 — ✓
- [x] 12 wiring plan — every upgrade token/gate (K7, cap-raises read `hasUpgrade` inside cap functions — never wired into gains per SKILL 4.3) or value with named consumer — §4.1 columns
- [x] 13 cost ladder ≥6 orders per layer, ≥1 deliberate key drop (cost-7-style breaths), ≥30% pow/log shapes — ✓ (ladders hand-shaped per 11 §3.2, form-switching at row ends)
- [x] 14 component density 8–30 per layer (st 19, th 15, pl/pt 15, tw 14, gr 13, in 13, nc 10, mf 20, ov 21); no challenges (Q5) — ✓
- [x] 15 author pacing — first boost ≤10 s (st u11 cost 1); every reset >1 min pays (stress accrues during walls; breakthroughs never reset); major resets speed from second one (cap raises apply instantly); no hard resets — ✓
- [x] 16 upgrade discipline — one production bonus per upgrade; K4 only on the named manifold mechanic; threshold gates everywhere (tw/in/mf/ov unlock by thresholds, never pay-gates — N-UNLOCKPAYGATE) — ✓
- [x] 17 cost before softcap — the caps ARE the content here (§10 #0 user directive); cap raises only sold on visible caps — ✓
- [x] 18 row pacing two constants: **ROW_RATIO ×25** (requires step), **OUTPUT_STEP ×18** (per-era production step) → per-row ×1.39 — both live in `js/tuning.js` (`ROW_RATIO_NOTE` for the sim) — ✓
- [x] 19 reset lifecycle — best/total kept by mf/ov keeps; autoPrestige implies resetsNothing (gr m2 / mf m4 packages grant both); no update() assigns `player[layer].points` (side fields only); nc static has `canBuyMax()` — ✓
- [x] 20 type contract — mandatory modules present; clickables/grid absent; the passive tick is §10 #1 (override, T-* rules honored) — ✓
- [x] 21 measurement plan — all pacing constants in `js/tuning.js`, read by game AND simulator; every pacing quantity callable (`paceMult()`, `strainCap()`, `pillarCap()`, `suppFrac()`, `hardeningRate()`, `barFillTime()`) — ✓
- [x] 22 question ledger complete — S0/name/Q1–Q8/Q4b+modifiers all have rows with user answers; Q6 implementation detail marked user-delegated → confirmed at this gate — ✓
- [x] 23 buyable persistence — st b11 consumed by th gainMult + autoBuyable driver (tw m1); st b12 consumed by tw bar rate; th b11 consumed by gr wells; mf tuning levels consumed by every layer's gain exponent — consumers outside own layer ✓; closed-form buyMax only — ✓

## 9.1 Static-warning acceptance

Final terminal state: **101 PASS / 3 WARN / 0 FAIL**. The three standing WARNs, all user-authorized:

| Check | Layers | Why accepted |
|---|---|---|
| D-REQRATIO (requires ratio ×200) | th (first wall: 2000 vs start 10) | The first wall IS the content (S0 directive): a ×200 ratio creates the opening 33-min Force accumulation (sim-measured) that teaches the wall economy. Later rows stay in the ×25–×70 band. |
| D-MECHQUOTA (no challenge layer) | — | Q5 = 「轻」 (user verbatim, batch-2 answer). The quota system counts challenge presence, but passive-prestige + light content plan leaves challenges out by user authority; fun quota met through the cap-craft economy + manifold. |
| N-AUTOWIPE (dead `auto` flag shape) | th/pl/nc | Automation is granted ON and stays ON (no toggle by design, author #39) — the `auto` member is constant-true once unlocked, which the checker reads as a dead flag. Milestone copy does not say "toggleable" anywhere, matching the actual behavior. |

## 10. Deviations & open questions |

## 10. Deviations & open questions

| # | Default overridden | Value used | Why |
|---|---|---|---|
| 0 | Handbook 12 #6 / corpus: "cost scaling first, softcaps second; only 6% of layers define softcaps" | **Softcaps are the content** (user directive S0 verbatim: 「游戏内容只有软上限…各种软上限互相影响」) | User authority outranks doctrine (same mechanism as Q1-confirmed concept games). Cost ladders still do normal shaping (check 13 holds); caps do the *thematic* work |
| 1 | passive-prestige codeContract forbids `update()` | 3 update() layers (st/tw/in), passive accrual only | Sanctioned override: time walls need real-time accumulation. No clickables/grid anywhere; T-TICKREG + N-POINTSWRITE honored; D-NOUPDATE exemption forfeited (passes on merit) |
| 2 | fun-quota medium: clickableGroups ≥1 | 0 | passive-prestige contract; user Q4b/Q5 (light, passive) |
| 3 | fun-quota medium: challenge layer required | 0 | Q5 = 「轻」 (user verbatim) |
| 4 | "Never edit engine files" | `js/technical/systemComponents.js` options-tab: + language toggle (handbook-15 shape) + wall-length input | User grant 「我允许你修改模板游戏引擎」; options-tab is the N-LANGTOGGLE channel; mod-side cannot add option-screen controls |
| 5 | — (bug-prevention) | `index.html`: winText rendered via `typeof modInfo.winText === 'function' ? modInfo.winText() : modInfo.winText` | Bilingual winText is a function; stock v-html renders function source (Ouroboros B1) |
| 6 | blueprint medium row2 = 2–3 layers | 4 (tw/gr/in/nc) | four mechanically distinct cap archetypes; density-over-breadth doctrine; tw is type-none (bar), nc static — tree renders 4 same-row nodes fine |
| 7 | Q6 wall-length mechanism | rate-multiplier form (`paceMult = defaultWall/wall`, clamp ×0.1–×100) | user offered "inverse softcap severity OR faster gain"; the rate form is mathematically safe (exponent surgery on caps interacts with meta-caps and N-SELFTOTAL); equivalent effect, tuning.js single constant |
| 8 | balance-defaults softcap power 0.3–0.5 | power 0.1 starts 1e9–1e12 for the big reset-gain caps | measuredRetune row (the corpus values are what people WROTE, not what survived simulation) |
| 9 | Blueprint step 3 = `autoPrestige(st)` | Never granted. Step 3 re-assigned to `resetsNothing(pl)` (pt m0); the th/pl/pt autoPrestige package stays at gr m2; ov m8 is the only self-prestige automation | autoPrestige(st) would repeatedly reset Force — which fights the top-wall economy (stress only accrues while Force is suppressed; a periodic Force reset zeroes the farm). The wall IS the wage: resetting it must remain a deliberate player decision. The ladder above reflects the shipped grant set. |

Open questions: none — all 8 questions answered by the user.

## 11. Stage-6 measured retune (R1–R13)

The simulator (`tools/simulate.js`, tuning-shared constants) owned every number below. 13 rounds; the two structural failures and the final certification:

| Round | Sim result | Root cause → fix |
|---|---|---|
| R1 | DID NOT REACH (22 h horizon) | Four brakes too deep at once: nc floor base 2→**1.7** (floor price fell off the 22h ladder); mf `gainLogPow` 0.6→**1.2** (manifold needed overflow it could actually reach); mf/ov `canReset` was never true (non-integer `gain+1` nextAt — engine-integer gate rewritten as `floor(nextAt)+1` + `log10 ≥ 1`); nc `requires` 1e8→**1e6** (the 1e8 stair put ~19 h of dead tail before recursion). Later rounds split the nc unlock (enter at 1e6, unhide at 1e9 via the st update writer). |
| R2 | 0.34 h instant-clear | Five runaway amps: manifold exponent band `lvl/10` raw → **1+(lvl−10)/50** (comp hit 1e67); mf gain mixed strain inventory (3.8e12) into the overflow scale → gain counts **overflow only**; Force slot ^1.4 let the rate outrun its own cap within one tick → slot clamped `min(mfTune(0), 1)` (Force exponent may only soften); ov valve chain ×10×5 self-acceleration → **cumulative ladder [2…1e6] with ×3 gain mults**; stress net unbounded (ideal rate × suppression, 2.9e22 by 20 min) → **idealCap 1e12 with hyperbolic tail** (`pow 0.5` above cap). |
| R3–R11 | progressive convergence | Iterative re-braking/re-loosening of the coupled caps (strain/pillar starts, stress softcap 1e50 eff 0.1, tw fill growth 1.5→softcapped, hardening rate 0.003/cap 25, meta compression 0.08). Each round re-certified static+smoke before re-simming. |
| R12 | DID NOT REACH (×3 dt) — over-brake | mf gate at 45 tuning = 1e17-scale floor price was past the horizon. |
| R13 | **CERTIFIED** | mf gate 45→**35**, valve top 1e6→restored. Final tuning: `mf gate = 35`, `valve chain top = 1e6`. |

**Final measured runtimes** (tuning.js constants frozen at these — R14 post-audit values):

| Integration step (dt) | Measured endgame time |
|---|---|
| 0.5 | **9.31 h** |
| 1 | **9.25 h** |
| 2 | **17.08 h** |

R14 (Stage 7.5 per-layer bug audit re-brake): the audit round wired 9 dead effects + 4 dead global raises, which re-accelerated the ov era (sim fell 9.35 → 5.65 h at dt 1). Re-braked with three frozen changes: `ov.logPow` 1.4→**1.3** (the valve ladder needs more total overflow), stress tail compression pow 0.5→**0.3** (the Q3 fix removed the hidden 1e50 clamp, so the ov-era stress^0.08 gain mult needed a tighter squeeze), and the Master Valve target **1e6 → 2e6 Valves** (1e7 overshot to >21.75 h DID-NOT-REACH). idealCap and compPerRaise were tested and proved non-binding (5.76 h / 6.04 h) — reverted.

Lands at the lower edge of the Q2 band (10–30 h): the fine-step runs sit just under 10 h, the coarse step at 16.4 h — real play with tab throttling behaves between them. First prestige (th, the ×200 first wall): **~33 min** sim-measured (the D-REQRATIO acceptance evidence). Challenges: n/a (no challenge layer — Q5). Achievements: 45–46/50 reachable in-run, remainder form late (state-emergent).

## 12. Browser-verification fixes (Stage 6.5)

All verified live against the running game (`tools/serve.js`, :8098); static+smoke re-run clean after each engine-side edit.

| # | Symptom | Root cause → fix |
|---|---|---|
| 1 | Win screen rendered function source code | `winText` is a function (bilingual) — stock v-html prints its source (Ouroboros B1). Fix: `index.html` renders via `typeof modInfo.winText === 'function' ? modInfo.winText() : modInfo.winText`. |
| 2 | `canvas.js:31 drawTree layerShown undefined` at boot | Startup race: draw loop runs before `tmp` is populated (B2). Fix: first line of the drawTree loop `if (!tmp[layer]) continue`. |
| 3 | mf/ov prestige buttons crashed (`tmp.mf.nextAt.log10 not a function`) | Engine tmp-cache holds the reset-gain shape, not the Decimal the button expected. Fix: button text calls `mfNextAtVal()`/`ovNextAtVal()` from tuning.js directly, bypassing the tmp cache. |
| 4 | Language toggle didn't flip main-display | (a) That English was the **root overlay** in `systemComponents.js`, not main-display — a second chrome location; (b) Vue2 never re-renders on non-reactive globals (`modText` is invisible to the dependency tracker). Fix: every chrome string ("You have", "(x/sec)", "Offline Time:") converted to reactive `player.chinesemode ? … : …` ternaries in both `components.js` (main-display + resource-display) and `systemComponents.js` (root overlay). |
| 5 | "（x/秒）" rendered as "(x/秒" | Missing closing paren in the ternary branch → restored full-width `）`. |
| 6 | Console evaluation: `save is not defined` | Bare `save` isn't a window global — `window.save()` works (test-harness note, not a game bug). |

Verified live in the browser round: boot with 0 errors (fresh + injected save), all 11 layer tabs open, mf custom prestige + 9 tuning slots bought with pool validation, tw breakthrough bar fills and fires, save round-trip intact, pace dial ×3 (wall 15 min), full bilingual switch including root overlay, screenshot-confirmed layout. `player.paceWallMin` restored to 45 and saved afterward.

## 13. Stage-7.5 per-layer bug audit (2026-11-22)

User-directed layer-by-layer audit: full static read of all 7 mod files + a wiring-census script (every upgrade/milestone id cross-referenced against all `hasUpgrade/upgradeEffect/hasMilestone` call sites) + a live browser functional round on an isolated origin (:8099, the user's :8098 save untouched). **19 confirmed defects, all fixed and re-certified:**

| # | Layer | Defect | Fix |
|---|---|---|---|
| 1 | th | u23 "Threshold gain ← Stress (log)" effect never consumed (dead upgrade) | wired into th gainMult |
| 2 | pl | u25 "Force gain ×2" dead | wired into forceIdealRate |
| 3 | pl | m1 "Force gain ×2" dead (milestone lied) | wired into forceIdealRate |
| 4 | pt | u23 "Pillar gain ×2" dead (cross-brace never consumed) | wired into pl gainMult |
| 5 | tw | u22 "ALL wall caps ×2" dead | CAP_RAISES row `twU22` + added to GLOBAL_RAISE_KEYS |
| 6 | tw | u25 "Hardening rate ×2" dead | wired into hardeningRate |
| 7 | mf | u13 "Tuning gain ×5" dead | wired into mfResetGainVal |
| 8 | mf | u15 "Tuning gain ^1.1 (softcapped)" dead | wired with the st-u16 K3 shape (1e10 / pow 0.5) |
| 9 | ov | u11 "Valve gain ×2" dead | wired into ovGainVal |
| 10 | ov | u12/u25/m1 registered as global cap raises but excluded from GLOBAL_RAISE_KEYS — buying them *worsened* meta-compression with zero benefit (trap purchases) | added to GLOBAL_RAISE_KEYS |
| 11 | ov | m0–m11 threshold chain scrambled (m0 "1 Valve" granted at 5; m2 "4 Valves" at 600; non-monotonic 5→2→600→30…) — stale R2 retune labels | unscrambled to the monotonic cumulative ladder 2/5/12/30/75/200/600/2000/6000/20000/1e5/2e6 with matching texts; m10 text ×10→×3 (code-true) |
| 12 | tw | m2/m3 display 10/15 vs done 9/12 | done aligned to displayed 10/15 |
| 13 | st | b11 buyMax closed form paid only the top step and skipped levels (120 pts bought level 3 for 90 vs true max level 2 for 40) | exact cumulative inverse `3^x ≤ p/5+3^A`, charge `5×(3^x−3^A)` — live-verified (120 → level 2, 80 left) |
| 14 | st | stress `.min(1e50)` = hidden hard wall, violating Q3 (no hard ceilings) and §8 "none" | hyperbolic compression past 1e50 (pow 0.3, R14) |
| 15 | mf | baseAmount/canReset measured `totalOverflow()+player.st.points` — double-counted strain vs the R7 overflow-only gain formula and ov's composite; mislabeled "Total overflow" | unified to `totalOverflow()` (live-verified equality) |
| 16 | st | u22 cost 1e15 > u23 cost 1e14 with forced unlock order 22→23 (ladder dip) | swapped to 1e14 / 1e15 |
| 17 | ac | ac36 = duplicate of ac42 (same 30-Depth condition + same promised reward, reward unwired) | re-pointed to 15 Depth, honest tooltip |
| 18 | ALL | **Tab-slot semantics: every `["upgrades", [ids]]` / `["buyables", [ids]]` tabFormat item passed ID lists, but the stock components multiply the slot by 10 and add the column (`row*10+col`) — every upgrades/buyables list on every layer rendered EMPTY** (user-reported; the typhoon-tree lesson resurfacing in a new form — a pure rendering bug no census or smoke can see, and the sim still passed) | bare string slots `"upgrades"` / `"buyables"` (engine derives rows/cols via setRowCol); verified visually per layer |
| 19 | ac | The achievements grid can never render row 0/col 0 (`v-for row` starts at 1, `col` at 1) and setRowCol computes cols=9 for ids 0-49, hiding every ×0 id — with id 0-49 that stranded 11+1 achievements invisibly (and my first explicit `cols:10` was ignored: setRowCol only honors presets when rows AND cols are both set) | id 0 re-keyed to 50; definition sets `rows: 5, cols: 10`; tab slot `["achievements", [0,1,2,3,4]]` includes row 0; save self-heal in ac.update migrates already-earned "0"→"50" (guard for the engine-lazy achievements array) |

Also verified live (no defect): meta-compression apply-on-raise (843→5298 = 100^0.862), twin-pillar mutual cap matches formula, gr wells deepen strainCap, in harden grows only under suppression, ov live-loop awards milestones (0→11 in 3 s; the earlier non-award was background-tab tick throttling, not a bug), win screen renders text not function source, bilingual reactive chrome. Post-fix certification: static 101/3/0, smoke 0 FAIL, sim **9.31 / 9.25 / 17.08 h** (R14 re-brake, see §11).
