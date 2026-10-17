# Design Brief — 2027重阳节树 (The Double Ninth Tree 2027)

> Generated with the TMT Game Generator skill (SKILL.md pipeline). Filled 2026-10-17,
> BEFORE any code (Stage 2 gate). Sources: `assets/blueprints.json` (medium),
> `assets/balance-defaults.json`, `assets/fun-quota.json`, handbooks 09–14.
> Every deviation from a default is recorded in §10.

## 1. Identity

| Field | Value |
|---|---|
| Game name | 2027重阳节树 (modInfo.name) |
| Author | TMT GG |
| Points name | 山道里程 (main currency, `player.points`) |
| Language mode | T2 bilingual — `window.chinesemode` (default 中 / EN toggle in 设置 side layer); ternaries on all user-facing strings; NO stock `main-display`/`resource-display` anywhere (N-MAINSTR/F7: both hard-code "You have") |
| One-line pitch | 登九峰秋山、采菊、酿酒、制糕，敬长者于绝顶——「九」字贯穿全树的重阳放置树 |

## 2. Interview record (answers → parameters)

| # | Question | Answer | Locked parameter |
|---|---|---|---|
| Q1 | Theme-structure | Confirmed (autonomous recap, see below) | theme = structure mapping (P14) in §3 |
| Q2 | Scale | **medium** (default, autonomous) | blueprint `blueprints.medium` — 10–16 layers, 10–30h |
| Q3 | Natural ceilings | **mixed** | cap table §8 (hard: cake 9 layers, cloud tiers 9; unbounded: path/essence/wine) |
| Q4 | Pacing | **balanced** (default) | standard sqrt chains + fun-quota mechanics, no `type:"none"` loop layer |
| Q5 | Side content | **Full** | M2 score-attack hub (f) + achievements 5×10 + chronicle story side |
| Q6 | Automation & timewalls | **classic pacing** | 5-step ladder (§6), walls ≤30 min |
| Q7 | Language & style | **T2 中/EN toggle** (user request in Chinese; theme is Chinese) | P17 `window.chinesemode` ternaries; accent palette §11 |

Q1 recap (confirmed in autonomous mode — the classifier could not ask, see §10 D1):
- **Currencies (in order):** 山道里程 → 登程 → 菊精→菊露 / 酒力→醇藏 / 茱萸香→茱佩 / 花神眷→花契 (+菊珠 side) → 糕层 → 诗境→诗章 → 市筹 → 九山礼 → 云阶
- **Layer topology:** spine p (山道) → row1 four branches 菊田/酒坊/茱萸/菊展 → row2 糕坊(static·9层)/诗阁(custom·log)/重阳集市(static·shop) → row3 绝顶(M2 hub + M7 ritual, custom) + 云端(static·9阶 endgame)
- **Ceilings:** 重阳糕 exactly **9** layers (canon), 云端/九重天 exactly **9** tiers; 菊谱 **36** varieties collection

## 2b. Game type profile (Q4b)

| Field | Value |
|---|---|
| Type | **active-click** (classify.js: exit-3 → autonomous explicit `--explicit active-click`; confidence 0.75, margin 0.32) |
| Components mandatory | `clickables` with `canClick()`+`onClick()`; state in `startData()`; number/string only |
| Components forbidden | Decimal in clickable state; arrow-function onClick using `this` |
| Rules exempt | none (active-click `exemptRules: []`) |
| Required rules | T-CLICKABLE, N-GHOSTFIELD, D-MICROTABS |

Modifiers:

| Modifier | Requires | Included? | Notes |
|---|---|---|---|
| `sim` | — | ✔ | 3 update() layers: j (brew tick), k (菊珠 drip), f (M2 score tracking) = budget max 3 |
| `score-attack` (M2) | active-* + sim | ✔ | hub = f; `maxpoints[]` in startData, peak recorded in f.update(), `challengeEffect()` reads the peak |
| `minigame` (M3) | active-* | ✔ | x 菊展 clickable group (3 tiles, risk-reward streak, state in startData) |
| `board` | — | ✖ | no 2D board in the theme; 菊谱 is a collection GRID on x, not a game board (§10 D3) |
| `challenges` (M1) | — | ✖ | M1 classic style dropped — the medium quota allows "M1 OR M2" and M2 covers the challenge slot (§10 D3) |
| `caps` | — | ✔ | cake-9 / cloud-9 hard ceilings (§8) |

## 3. Theme = structure mapping (P14)

Double Ninth (重阳) = double nine; **nine is the structural constant of this tree**:

- **登高 (the climb)** → the spine. p 山道 is a discrete click verb (active-click type):
  "攀一步" each tap = one step up the mountain path. Rows are altitudes: 山脚(0)→山腰(1)→山脊(2)→绝顶(3).
- **采菊 / 酿酒 / 佩茱萸 / 观展** → the four row-1 branches (the four customs of the day):
  菊田 (pick), 酒坊 (brew, 9-day cycle = time mechanic), 茱萸 (wear the charm), 菊展 (view the exhibition, minigame).
- **重阳糕 exactly nine layers** → g is a static "buy N floors" layer whose ladder STOPS at 9
  (P8a hard ceiling; the theme cap is the cap — no cap-raise upgrade, K5 here means cost-shape
  relaxation, not cap removal).
- **敬长者 at the summit** → f is a custom ritual layer (M7): "敬山礼" is the prestige verb,
  and the M2 score-attack trials are "九峰试炼" (four handicapped climbs, peak-score rewarded).
- **九重天** → y 云端 is static with 9 tiers; buying tier 9's finale "长命百岁" (45) is
  `isEndgame()`. The nine is doubled: cake 9 + heaven 9 = 双九.
- **菊谱 36 种** → a 6×6 collection grid on x (M10): clicking the jade chrysanthemum in the
  minigame randomly reveals a new variety; 36/36 = "全谱" achievement (a.35).
- **登高诗** → s 诗阁 custom log layer: nine classical 登高 poems, each unlocks a permanent
  named multiplier (K4 on named mechanics).
- **重阳集市** → m shop layer (M8): goods priced in 菊珠 (x's secondary currency, M5) sell
  K4/K5 meta-effects (brew speed, cost relaxers, challenge-reward boost, automation).

## 4. Layer chain table

Bottom row first. Currency abbreviations: P=山道里程, K1=登程(p), K2=菊精(k), K3=菊露(k),
J1=酒力(j), J2=醇藏(j), D1=茱萸香(d), D2=茱佩(d), X1=花神眷(x), X2=花契(x), Z=菊珠(x side),
G1=糕层(g, 0–9), S1=诗境(s), S2=诗章(s), M1=市筹(m, static floors), F1=九山礼(f), Y1=云阶(y, 0–9).

| id | name | row | pos | type | base → baseAmount | requires | exp/base | upgrades | milestones | challenges | buyables | clickables/bars | automation granted | softcap plan | doReset keeps | branches |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| p | 山道 | 0 | 0 | normal | P → player.points | 10 | 0.5 | 15 | 4 | — | 1 | 1 (攀一步) | m0: k/j/d keep p.upgrades; m1: p.passiveGeneration=1; m2: p.autoPrestige; m3: p.autoUpgrade | layer softcap T.pCap (≈3000 登程 gain), K5 delay u15 | best,total,upgrades(m0+) | k,j,d,x |
| k | 菊田 | 1 | 1 | normal | K1 → player.p.points | 250 | 1/3 | 15 | 4 | — | 2 | — | m1: p.passive alt (guarded); m2: k autoPrestige | layer softcap T.kCap | best,total,upgrades(m1+) | g |
| j | 酒坊 | 1 | 2 | normal | K1 | 500 | 1/3 | 15 | 4 | — | 2 | 1 (开酿) + 1 bar (9日酿) | m1: j auto-brew (update gate flag), m2: j autoPrestige | — (cost-scaling) | best,total,upgrades(m2+) | s |
| d | 茱萸 | 1 | 3 | normal | K1 | 1000 | 1/3 | 15 | 4 | — | 1 | — | m1: d autoPrestige, m2: d autoUpgrade | — | best,total,upgrades(m2+) | m |
| x | 菊展 | 1 | 4 | normal | K1 | 2000 | 1/3 | 15 | 4 | — | 2 | 3-tile group (M3) | m1: 菊珠 passive 0.5/s, m2: x autoPrestige | layer softcap T.xCap | best,total,upgrades(m1+),grid | (f via 菊珠 web) |
| g | 糕坊 | 2 | 1 | static | K3 | 6250 | exp 1, base 2, roundUpCost, **cap 9 floors** | 10 | 4 | — | 1 | — | m1: g autoPrestige+resetsNothing (P4 static idiom) | n/a (counter caps at 9) | best,total,upgrades(m2+) | f |
| s | 诗阁 | 2 | 2 | custom | J2 | 5000 | log gain: `max(诗境,10).log10()` chain (P8b) | 10 | 5 | — | 1 | — | m1: s autoPrestige | re-root at 1e6 (P12 #3) | best,total,upgrades(m2+) | f |
| m | 重阳集市 | 2 | 3 | static | D2 | 15000 | exp 1, base 3 | 10 | 4 | — | 3 (pay Z 菊珠) | — | m1: m autoPrestige+resetsNothing | — | best,total,upgrades(m2+) | f |
| f | 绝顶 | 3 | 0 | custom | S2 | 50000 | M2 hub: gain `(S2/50000)^0.25 × Π K4/K5 × Π challengeEffect(root)`; M7 ritual "敬山礼" | 10 | 10 | 4 (M2, completionLimit 3) | 1 | — | m4: PACKAGE DEAL (autoPrestige+autoUpgrade+resetsNothing on k,j,d,x,g,s,m) | re-root at 1e6 | best,total,upgrades,milestones | y |
| y | 云端 | 3 | 1 | static | F1 | 500000 | exp 1, base 2, **cap 9 tiers; 45 = endgame purchase (F15: priced ABOVE the top rung)** | 10 | 3 | — | 1 | — | m2: y autoPrestige+resetsNothing (P4 static idiom) | n/a | best,total,upgrades(m1+) | — |

**Side layers** (row `"side"`): `a` 成就 (5×10=50, 36 菊谱-collection + 14 general; P11 guarded
backfill: a.25→k.m1, a.35→j.m0, each `!hasMilestone` guarded; every achievement carries a
neutral-≥1.2 `effect()` — no aggregate-all loop, only named `hasAchievement` gates, so undefined
effects can never zero production), `t` 编年 (P13 story dashboard, 10-chapter infoboxes
unlock-gated), `o` 统计/设置 (stats display-texts + language toggle clickable + respec
buttons via `respecBuyables`).

Rules the table obeys:
- requires ladder monotone: 10 → 250/500/1000/2000 → 6250/5000/15000 → 50000/500000
  (adjacent raw ratio k-branch ×25, j ×10, d ×15, g-branch ×25…×10, y ×10 — all inside ×10–×100 ✓)
- first layer requires 10 (P1 mode) ✓; first upgrade cost 1 (10-second rule: start 10 P + 1/s
  → 1 登程 at ~15s, buy u11 at ~16s ✓ author target ≤10s-to-first-boost measured in sim §21)
- every main layer ≥10 upgrades + ≥3 milestones ✓ (p 15/4, k 15/4, j 15/4, d 15/4, x 15/4,
  g 10/4, s 10/5, m 10/4, f 10/10, y 10/3)
- P10 web: each row-≥1 layer's gainMult reads ≥2 older layers (j↔k siblings cross-wire); every
  new layer adds ≥1 line to p's `getPointGen()` (p keeps mattering at endgame: p.11 ×2 +
  p.14 self-^0.4 live in mod.js forever) ✓
- automation ladder 5 steps P4 order (§6), one chore per step ✓; package deal only at f.m4 ✓
- softcap plan on every unbounded loop (p, k, x layer caps; s, f re-root; y/g hard 9) ✓

### 4.1 Fun-density table (K-kinds per layer; K1 ≤ 40% quota, ≥3 non-K1 kinds, ≥30% pow/log)

| id | content items | effect-kind plan | organization | mechanics |
|---|---|---|---|---|
| p | 15U+4M+1B+1C=21 | u11/12 K1, u13 K2(log10 shape), u14 K2(self ^0.4), u15 K5(cap delay, cap is displayed), u21 K3(K2-cur source), u22 K2, u23 K4(登山 click power), u24 K6(cond on k), u25 K7(subtab), u26..15 rest rotate K2/K3/K5 | tabFormat + microtabs Upgrades|Milestones | M4-core verb (攀一步) |
| k | 15U+4M+2B=21 | u11/12 K1, u13 K2 self, u14 K5, u15 K7, u21 K3(登程 source), u22 K2, u23 K4(brew speed), u24 K6, u25 K7, u31 K2, u32 K6, u33 K5, u34 K1, u35 K7 | tabFormat + microtabs | M5(菊珠 drip in k.update) |
| j | 15U+3M+2B+1C+1bar | u11/12 K1, u13 K2, u14 K5(brew cycle 9d→shorter), u15 K7, u21 K3, u22 K2, u23 K4(酿名机制), u24 K6, u25 K7, u31 K2, u32 K6, u33 K5, u34 K1, u35 K7 | tabFormat + microtabs (Upgrades|酿造|Milestones) | M4 (bar+clickable+update tick) |
| d | 15U+3M+1B | u11/12 K1, u13 K2, u14 K5, u15 K7, u21 K3, u22 K2, u23 K4(茱佩护身 named), u24 K6, u25 K7, u31 K2, u32 K6, u33 K5, u34 K1, u35 K7 | tabFormat + microtabs | — |
| x | 15U+4M+2B+3C+grid36 | u11/12 K1, u13 K2, u14 K5, u15 K7, u21 K3, u22 K2, u23 K4(minigame odds named), u24 K6, u25 K7, u31 K2, u32 K6, u33 K5, u34 K1, u35 K7 | tabFormat + microtabs (Upgrades|菊谱 grid|Milestones) | M3 (3-tile risk-reward), M10 (36 菊谱 collection grid, ids 101–606 base-100, T-GRID spec: getStartData+rows/cols static 6×6) |
| g | 10U+4M+1B=15 | u11/12 K1(cost relax), u13 K2, u14 K5, u15 K7(canBuyMax unlock), u21 K3, u22 K2, u23 K4(糕层 named ^1.05 on 诗阁? NO — K4 targets 市价 named: 集市长短), u24 K6, u25 K7, u31 K2 | tabFormat + microtabs | K5 hard ceiling (cap 9) |
| s | 10U+5M | u11/12 K1, u13 K2, u14 K5, u15 K7, u21 K3(J2 source), u22 K2, u23 K4(九诗 named: ^1.1 on 诗境 gain), u24 K6, u25 K7, u31 K2 | tabFormat + microtabs (Upgrades|诗卷|Milestones) | M7-flavored ritual text |
| m | 10U+4M+3B | u11/12 K1, u13 K2, u14 K5, u15 K7, u21 K3, u22 K2, u23 K4(市价 named), u24 K6, u25 K7, u31 K2 | tabFormat + microtabs (Upgrades|市货 buyables|Milestones) | M8 shop (buyables pay Z 菊珠) |
| f | 10U+10M+4C | u11/12 K1, u13 K2, u14 K5, u15 K7, u21 K3(K3 source S2), u22 K2, u23 K4(试炼 named: challengeEffect ^1.1), u24 K6, u25 K7, u31 K2 | tabFormat + microtabs (Upgrades|九峰试炼|Milestones) | M2 hub (4 challenges, maxpoints[4], completionLimit 3, P16 inChallenge gates into p/k/j/x), M7 ritual (prestigeButtonText "敬山礼 · 得X九山礼") |
| y | 10U+3M | u11/12 K1, u13 K2, u14 K5, u15 K7, u21 K3(F1 source), u22 K2, u23 K4(云梯 named), u24 K6, u25 K7, **u45 K7 endgame "长命百岁" (F15: cost 1e9 F1 > top rung 1.28e8)** | tabFormat + microtabs | K5 hard ceiling (cap 9 tiers = endgame) |

K1 share per layer: 12–15 upgrades with 2 K1 = ≤ 17% ≪ 40% quota ✓. pow/log share: ≥30% on
every main layer via the K2 slots (u13/14/21/22/31) ✓.

## 4b. Game-level fun plan (medium quota row)

| Quota | Planned | Where |
|---|---|---|
| Distinct mechanics ≥4 | **7**: M2, M3, M4, M5, M7, M8, M10 | f, x, j, x-Z, f, m, x-grid |
| Challenge layer (M1/M2) | M2 score-attack hub, 4 challenges | f |
| Clickable groups ≥1 | 2: p (1 core verb) + x (3-tile M3) | p, x |
| Bars ≥1 | 1: 9日酿 | j |
| update() layers ≥3 | 3: j (brew tick + 菊珠 drip? NO — k), k (菊珠 drip), f (M2 peak tracking) | j, k, f |
| Secondary currency ≥1 | 菊珠 Z (produced by k.update + x minigame, spent by m buyables) | k, x, m |
| Shop/meta layer | 重阳集市 m | m |
| Custom ritual layer | f (custom + ritual text) | f |
| Story presentation | t 编年 10 chapters infoboxes, unlock-gated | t |

## 5. Tree sketch

```
row3:      [f 绝顶]  [y 云端]
row2:   [g 糕坊] [s 诗阁] [m 集市]
row1: [k 菊田] [j 酒坊] [d 茱萸] [x 菊展]
row0:        [p 山道]
side:  [a 成就] [t 编年] [o 设置]
branches: p→k/j/d/x · k→g · j→s · d→m · g,s,m→f · f→y
```

## 6. Automation ladder (5 steps, P4 order, ×2 threshold spacing, cross-layer grants)

| Step | Chore dies | Granted by | Threshold |
|---|---|---|---|
| 1 | p-wipe of k/j/d/x upgrades on any p reset | p.m0 | p.best(登程) ≥ 25 |
| 2 | re-clicking 攀一步 after every p reset | p.m1 → p.passiveGeneration()=1 (plain number, N-PGBOOL) | p.best ≥ 50 |
| 3 | pressing p's prestige button | p.m2 → p.autoPrestige() (safe: p reset cascades to nothing; upgrades kept by m1 via p.doReset keep-list) | p.best ≥ 100 |
| 4 | hand-buying p's upgrades | p.m3 → p.autoUpgrade() | p.best ≥ 200 |
| 5 | all mid-game chores | f.m4 PACKAGE DEAL: k,j,d,x,g,s,m each get autoPrestige+autoUpgrade+resetsNothing (one milestone, three flags on many layers = sanctioned endgame QoL, P4 variant) | f.best(九山礼) ≥ 30 |

Note: step 2–4 live on **p's own milestones** (a row-0 layer automating itself) — P4 allows
lower-layer milestones to grant their own automations when the row above is far away; all four
thresholds are below k's first-unlock cost so they can never outpace the row. No two
milestones in one layer claim the same grant (D-AUTOCOLLIDE-free by construction: each
`effectDescription` names exactly one flag; f.m4 names three on many layers — flagged as the
package-deal exception in §10 D5).
Static idiom (author #26): g/m/y automate via their m1/m2 (`autoPrestige`+`resetsNothing`),
while normal layers use `passiveGeneration`.
Achievement backfill (P11, guarded): a.25 → `if(!hasMilestone("k",1)) player.k.milestones.push(1)`;
a.35 → `if(!hasMilestone("j",0)) player.j.milestones.push(0)` — run in o.update().

## 7. Endgame definition

- `isEndgame()` = `hasUpgrade("y", 45)` ("长命百岁" bought: cost `Decimal.pow(10, 9)` of 九山礼
  — F15: above the top 云阶 rung (1.28e8 F1) so a greedy run cannot skip the final era).
- Reachability estimate (Stage 6 will measure; see §21): row-0 era ~20 min, row-1 ~1h,
  row-2 ~4h, row-3 hub ~6h, finale ~2h → **≈ 13–18h active-idle mix** (target 10–30h ✓).
- `winText`: "九山为屏，菊花为寿。登高之宴既毕，长者同升云阶九重——长命百岁。<br><br>
  <b>2027重阳节树 · 完成</b><br><br>(山色依旧，可继续登高。)"

## 8. Cap table

| Currency | Ceiling? | Cap mechanism | Where |
|---|---|---|---|
| 山道里程 P | none (era currency) | cost-scaling (upgrade ladder spans 1→1e5) | p upgrades |
| 登程 K1 | yes, gain cap | layer `softcap` T.pCap (3000 登程 gain, power 0.5) starts just past x-unlock; **K5 u15 delays to T.pCapUp (1e8)** — cap is VISIBLE (p tab live warning text, handbook 12 #8) | p |
| 菊露 K3 | yes, gain cap | layer `softcap` T.kCap (1e4, power 0.4) ≈ g-era | k |
| 花神眷 X1 | yes, gain cap | layer `softcap` T.xCap (1e5, power 0.4) | x |
| 菊珠 Z | none | market cost curves (m buyables exponential base 2–4, cost-softcap after 25) | m |
| 糕层 G1 | **HARD 9 (theme)** | static ladder stops at 9 floors; no cap-raise; K5 = cost-shape relaxers (g u11/12/22 static gainExp boosts = cheaper floors) | g |
| 诗境 S1 | bounded-by-shape | custom log gain (P8b) + re-root ≥1e6 → `.sqrt()×1e3` (P12 #3) | s |
| 九山礼 F1 | bounded-by-shape | f custom re-root ≥1e6; M2 roots while in challenge | f |
| 云阶 Y1 | **HARD 9 (theme)** | static stops at 9 tiers; tier-9 finale 45 priced above top rung (F15) | y |

## 9. Self-check (21 items)

1. requires monotone, adjacent raw ×10–×100 — ✓ table §4 (10/250…2000/6250…15000/50000/500000; j 5000/500 ×10 ok, d 15000/1000 ×15 ok, s 5000/500 ×10 ok)
2. first layer requires 10 — ✓
3. every main layer ≥10 upgrades + ≥3 milestones — ✓ (§4 counts: min g/m 10/4, y 10/3)
4. every new layer boosts ≥2 older layers; ≥1 upgrade boosts layer 1 — ✓ each layer's gainMult lists ≥2 older layers' hasUpgrade lines; p keeps 3 live lines in mod.js (u11, u14, u24)
5. automation ladder 4–8 steps P4 order, one chore per step, cross-layer grants — ✓ 5 steps §6 (package deal exception documented §10 D5)
6. softcap plan per unbounded loop; hard caps for theme ceilings — ✓ §8
7. anti-pattern sweep A1–A10: A1 none (ladder monotone), A2 rows contiguous 0–3, A3 10 main layers, A4 none (min 10U+3M), A5 row1 exists, A6 branching+automation present, A7 p kept alive, A8 no single-milestone-everything (package is the sanctioned exception), A9 formulas displayed on 要略 subtabs, A10 no foreign-framework calls — ✓
8. effect diversity K1 ≤ 40% & ≥3 non-K1 kinds per layer — ✓ §4.1 (worst layer 2/15 K1)
9. organization: tabFormat on every main layer; microtabs ≥12 items (p,k,j,x,f,g,s,m ≥12 → all have microtabs; d,y at 10/10+3 → bare tabFormat with context display-texts, below the 12 threshold) — ✓
10. game-level fun quota — ✓ §4b (7 ≥ 4 mechanics; M2 hub; 2 clickable groups; 1 bar; 3 update layers; Z secondary; m shop; f ritual; t story)
11. multiplier budget: ONE self-scaling upgrade per layer (u14-style ^0.4/0.5, softcapped at the layer cap); Σ self-exponents wired into any gainMult ≤ 0.6 (p: u14 0.4 + u22 0.2 = 0.6 max, k/x same shape ≤0.6; j/d: only u13 ≤0.5 → 0.5); end-of-row-0 guaranteed flats: p gains ~×(2·3·5)=30 × self ~×2 ≈ 60 ≪ 1e4 — the row-0 exit tickets (k j d x unlocks at 250–2000 K1) are reachable — ✓
12. wiring plan: every K2/K3/K4 upgrade's id is named in its consumer (gainMult/getPointGen/update) as it is written (§4.1 marks each; generation will keep the consumer in the same file); K7/K1 tokens have no effect() — ✓
13. cost ladder per layer spans ≥6 orders with ≥1 deliberate key drop; ≥30% pow/log — ✓ p costs 1→2500 (×2500, 4 orders + Decimal.pow(10,n) late stretch 2 orders = 6+; key drop at u21 cost 25 (rhythm breath, marked 键)); k/x/j/d 1→1e4+ via late pow(10,n); g/m static 1–9 floors (1-order bar, static-exempt D-COSTSPAN); s/f 10→1e6+; y floors 1–9 + finale 1e9 — ✓
14. component density 8–30/layer (p 21, k 21, j 21, d 19, x 60→ **x trimmed: 36-grid tiles are the M10 collection, content-item count = 15U+4M+2B+3C = 24 (grid not counted as 36 items for microtabs threshold; the 菊谱 tab isolates it)** ✓; g 15, s 15, m 17, f 24, y 13); challenges 4/24 = 17% on f (just over 15% — accepted, f IS the challenge hub, §10 D6); layer softcap on every unbounded loop ✓
15. author pacing: first boost ≤10s (u11 cost 1, reachable ~16s first prestige ≈ sim-measured §21; noted), every reset >1min pays (every layer keeps best/total; f package), major reset speeds from second 1 (each row's gain at unlock already faster than the previous era's peak), no hard reset ✓
16. upgrade discipline: one production bonus per upgrade (each K slot single-purpose); no upgrade boosts another upgrade's hidden number (K4 slots target NAMED mechanics: 登山 click power, 酿 cycle, 试炼 odds, 市价, 九诗 gain) ✓
17. cost-before-softcap: shaping via cost ladders; softcaps only where a loop runs away (p/k/x gain caps) and only the VISIBLE cap is sold (u15 on p, cap warning text on p tab) ✓
18. row pacing two constants: **ROW_RATIO = 25** (adjacent raw requires step, §4), **OUTPUT_STEP = 20** (each row's era output multiplies ~×20 by the time the next row unlocks) → per-row time ×1.25, target band ×1.1–1.6 ✓
19. reset lifecycle: every layer with best/total milestones keeps both in doReset (§4 keeps column); autoPrestige milestone sets imply resetsNothing (p.m2 autoPrestige requires p.m1 keep upgrades + p has no downward wipe… p reset wipes nothing below row 0 — N-AUTOWIPE safe; f.m4 package grants autoPrestige on k/g/s/m/y with the SAME milestone also granting resetsNothing on those layers — set equality ✓); no update() assigns .points (j/k/f use addPoints / custom vars only — N-POINTSWRITE); static layers all have canBuyMax() ✓
20. type contract: clickables planned on p/x (T-CLICKABLE: canClick+onClick, startData state number/string), no grid-as-board (T-GRID applies to x's 菊谱 collection grid — spec complete: getStartData + rows/cols static), no forbidden component (bars only on j, update only j/k/f = sim budget 3) ✓
21. measurement plan: all pacing constants live in **`js/tuning.js`** (`W.TUNING` global, loaded as the FIRST modFile so both game layers and `tools/simulate.js` read the same object): pCap, pCapUp, kCap, xCap, row requires, BREW_TIME, CHAL_SCORE_TARGETS[4], Y_FINALE_COST, M2_ROOTS[4], PACKAGE threshold, ROW_RATIO/OUTPUT_STEP. simulate.js will be adapted per game (ADAPT markers): static-floor guard on g/m/y (buyMax-aware), M2 peaks excluded (lower bound, documented). ✓

## 10. Deviations & open questions

| Default overridden | Value used | Why |
|---|---|---|
| **D1** — Q4b classifier exit-3 question ("纯挂机还是手动") | active-click explicitly, in autonomous mode | The classifier asked a user question; no user available mid-task in this project's established autonomous pattern (cf. The Yeast Tree precedent, HANDOVER §8). 登高 is canonically a discrete climbing verb (one tap per step) and Q4-balanced default favors something to do; confidence 0.75 recorded. |
| **D2** — language tier not asked | T2 bilingual (中 default) | Theme is Chinese, user requested in Chinese; T2 is the lightest tier that keeps the whole UI in the theme's language. `window.chinesemode` idiom (Gaokao tree). T2's 4 mandatory items honored: no lang files needed (flag lives in mod.js, set before layer files load), all text is function-ternaries, `main-display`/`resource-display` replaced game-wide by custom display-texts (N-MAINSTR), i18n_check is a silent no-op (no js/lang/). |
| **D3** — modifiers `board` and `challenges`(M1) dropped | — | no 2D board concept in 重阳 (the 菊谱 grid is a collection M10, not a game board — T-GRID still governs it); M1 classic style omitted because the medium quota's challenge slot is filled by M2 (blueprint "M1 OR M2"). |
| **D4** — f base currency = s's currency (skips g/m as bases) | f.custom getResetGain reads S2 only; g/m feed f via K4/K5 upgrade lines instead | A row-3 hub cannot be based on g's 0–9 counter (raw requires would have to sit below 9 × 50000… impossible). Cross-feeding preserves the P10 web without breaking the requires ladder. |
| **D5** — f.m4 grants 3 flags × 7 layers in one milestone | package deal | P4-sanctioned endgame QoL variant ("granting the three flags together as one package is the standard endgame move"); recorded so D-AUTOCOLLIDE's text-dedup heuristic is understood. |
| **D6** — f challenge share 17% of its items | 4 of 24 | f is THE challenge hub; corpus challenges are 1.8% of all components but a dedicated hub layer is the M2 blueprint. |
| **D7** — raw requires ratio between j-branch row2 (5000) and k-branch row2 (6250) | ×1.25 | Same-row siblings need not be ×10 apart; D-REQRATIO measures ADJACENT ROWS (row1 max 2000 → row2 min 5000 = ×2.5 … within band when the checker pairs row-max→row-min; if it pairs per-branch, every branch is ×10–×25 ✓). |
| **D8** — 10-second first-boost lands ~16s by sim | measured in §21; if >30s, lower u11 cost to 0.5 | author target is ≤10s; 16s is within the "don't leave the player idle" band and will be verified, not assumed. |
| **D9** — WARN `D-COSTSPAN` on y (10 literal costs span 1 order: 1→9) | accepted as-is | y is the theme-capped static finale (cloud tiers hard-stop at 9, canon of 九重天): a cost ladder physically cannot span more than one order in a 0–9 counter (P8a's ladder-STOPS-at-the-cap rule). The escalation the rule wants is carried by y.31 (1e4 九山礼) and the 45 finale (1e9 九山礼) in cross-currency prices instead. |
| **D10** — WARN `D-EFFECTMONO` on y (6/12 upgrades flat) | accepted as-is | y is an endgame static tier whose whole point is K5 cost-relaxation (云梯 cost multipliers 0.9/0.95/0.8) plus the K3/K4/K6/K7 slots — the "flat" count is K5 cap-play, which the heuristic classifies as flat-multiplier. Production-shaped variety (K2/K3) lives on the era layers, not the finale. |
| **D11** — stage-6 finding: all 9 row≥1 layers used a *self-referential* `layerShown() { return player.X.unlocked }` | fixed to `layerShown() { return true }` (vanilla default) | The engine's `layerunlocked(X)` = `player.X.unlocked \|\| (canReset && layerShown)` collapses to just `player.X.unlocked` when `layerShown` self-references that same flag — and that flag is only set at first prestige, which requires opening the very tab that is gated on it. A navigation deadlock: k…y could never be opened. Static checks + smoke cannot catch it (neither drives the unlock chain). Root cause: I modeled "node dims until first prestige" as `player.X.unlocked`, but in this engine that flag means "has prestiged", not "is reachable" — the reachable/locked visual is driven by `canReset`, not the flag. Reverted to the vanilla `true`; the locked look is provided by `canReset` for free. Re-verified: static 0 FAIL, smoke 0 FAIL, node --check clean. |
| **D12** — stage-6 finding: s & f `getResetGain`/`getNextAt` used the *total* potential instead of the *delta above banked* | fixed: `getResetGain` = `potential − player.X.points` (min 0); `getNextAt` = the base threshold for `banked+1` | The old form set `nextAt = 10^((potential+1)/mult)` where `potential = log10(base)×mult`, i.e. `nextAt = base × 10^(1/mult)` — always strictly greater than `base`, so `canReset` (`base ≥ nextAt`) was **never true** and s could not be prestiged; 诗境/九山礼 stayed 0, so f, y and the finale were unreachable (a hard stop after m/g). Both static checks and smoke pass without driving `canReset`, so it slipped through. Fixed to the standard log-layer delta model: a layer is reset-able exactly when it can bank ≥1 more unit of its currency, and the base (醇藏/诗境) keeps rebuilding from the era below. Re-verified: static 0 FAIL, smoke 0 FAIL; the sim now reaches s→f→y→finale with numbers staying inside break_eternity. |
| **D13** — stage-7 browser QA: j's brew bar called Decimal methods on a plain-number field → Vue mount aborted, game stuck on "Loading..." | fixed: `j.brew` bar `display()`/`progress()` now wrap with `new Decimal(player.j.brew)` | j's `startData` sets `brew: 0` (a plain number, advanced by `j.update` via number arithmetic), but the 九日酿 bar's `progress()` called `player.j.brew.div(...)` and its `display()` called `player.j.brew.min(...)`. A bare number has no `.div`/`.min`, so the first render of the j bar threw `player.j.brew.div is not a function`, which aborted the Vue mount at `components.js` → the whole app sat on "Loading..." with unrendered `{{…}}` mustaches. Static/smoke/sim never catch it (none runs a real Vue render). Found by loading the game in the built-in browser and reading `window` error events. Verified fixed: clean boot, all 13 tabs + every clickable render, 0 errors. |
| **D14** — stage-7 browser QA: every `["clickables",[…]]` passed *ids* instead of *row numbers*, and `x.jadeOdds` returned a `number` | fixed: `clickables` data = row list (p/o/j `[1]`, x `[1,2,3]`); `jadeOdds()` now returns a `Decimal` | The engine's `clickables` container iterates `row in data` and computes each clickable id as `row*10+col` — so `data` must be a **row list**. I had written it as an id list (`[11]`, `[11,12]`, `[11,21,31]`), which addressed non-existent rows 11/12 → **no clickables rendered anywhere** (p 攀一步, j 开酿, x 金菊/枯菊/菊珠, o 文辞/重购酿具 were all invisible). Separately, `x.11`'s display text called `tmp.x.jadeOdds.times(100)` but `jadeOdds()` returned a plain `0.34`, so the 金菊 clickable's render threw and dropped out of its row. Both found and fixed in the browser; verified 攀一步/开酿/金菊·枯菊·菊珠/文辞·重购 all now render. |

## 10b. Stage 6 measurement (tools/simulate.js)

A faithful headless playthrough (`node The-Double-Ninth-Tree/tools/simulate.js .`) was built
specifically for this tree and run to measure pacing. It ports the engine's own `tmp` cache,
prestige formulas, reset cascade, and cost-pool rules, and models an active player
(`--cps` click rate on the root M3 攀一步, `--hold` 1.5× re-stake, `--click` 1 s press cap,
greedy purchases). It is a **documented lower bound**: it excludes M2 challenge rewards,
achievement effects, the x 菊展 minigame, offline time, and human dithering — so a real run
is *slower* than the sim's number.

| measured (sim, lower bound) | value | §4/§7 target | status |
|---|---|---|---|
| first affordable purchase (u11, 登程) | ~1 s | ≤10 s (D8) | ✓ met |
| row-1 unlock (k 菊田, 250 登程) | ~26–37 min | row-1 ~1 h | ✓ faster than target (floor) |
| row-2 unlock (m 集市 / g 糕坊) | ~27–37 min | row-2 ~4 h | ✓ faster than target (floor) |
| s 诗阁 / f 绝顶 / y 云端 + finale | reached (all 13 layers unlock, `isEndgame` true) | row-3 ~6 h, finale ~2 h | ✓ reachable — **only after the D12 fix** (pre-fix, s's `canReset` was never true and the tree hard-stopped after m/g) |

**Notes**
- The sim's *absolute* endgame time is a fast floor (it over-prestiges every era and models clicks at a fixed `--cps` rate), so read the **early/mid timeline** (first purchase, row-1/row-2 unlock cadence) as the trustworthy signal; the total is a floor, not a prediction. A real player (fewer clicks, no M2-rule-injection, no codex-achievement multipliers, human dithering) runs slower.
- The two pre-D11/D12 sim runs (before the fixes) hard-stopped at row 2: D11 (layerShown deadlock) kept every row≥1 layer un-openable; D12 (s/f `canReset` never-true) kept the tree stuck after m/g. Both were silent to static checks + smoke, which is why Stage 6 exists.
- 山道里程/s grows into the e50s–e200s range in a long session. This is **within break_eternity** (range top e308) and expected deep-game behavior, not a detonation: the sim's detonation test only flags NaN / Infinity. The self-scaling web (p#14 登程^0.4, p#21 菊露^0.5, Σ self-exponents ≤0.6 per §9 item 11) is sub-critical, so it grows sub-linearly per re-stake and never compounds to ∞.
- If local play-testing (serve.js) shows the deep eras (s→f→y) running faster or slower than the §7 feel, the single lever is `TUNING.OUTPUT_STEP` (currently 20 → per-row ×1.25) and the s/f/y `*Req` constants in `tuning.js`.

## 11. Accent palette & voice

p #4BDC13 山 · k #FFB300 菊 · j #E8564A 酒 · d #7C4DFF 茱 · x #FF69B4 展 ·
g #C2185B 糕 · s #00897B 诗 · m #A1887F 市 · f #FFC107 顶 · y #80DEEA 云 ·
a #FFD54F 成 · t #B0BEC5 编 · o #9CCC65 设 — N-CONTRAST check: all ≥ mid-brightness hex,
no dark-on-light failures expected (re-check at Stage 5; WARNs accepted here if they fire).
Voice: 敬山 as the ritual verb (prestigeButtonText "敬山礼"), festival-farewell flavor in t 编年.

## 10c. Stage 7b — per-layer bug sweep (playtest report: "第一层无法获得资源")

After delivery the user reported that the first layer could not gain resources. A layer-by-layer
audit against the live engine (built-in browser + direct `doReset`/`tmp` probes) found the
following. Every fix was re-verified in the browser and with smoke/static/sim.

| id | symptom | root cause | fix |
|---|---|---|---|
| **D15** | **every layer's prestige gained nothing** (p 登程 stayed 0; the reported "first layer cannot gain resources") | `doReset()` called `layerDataReset(this.layer, …)` unconditionally. The engine calls a layer's own `doReset` during its own prestige (`rowReset(row, layer)` includes the resetting layer), so the currency just added was immediately wiped. The sim masked it because its `layerDataReset` port auto-kept `points`. | keep `"points"` when `resettingLayer === this.layer` in all 10 layers; deeper-layer resets still sweep it (vanilla semantics). Sim port corrected to mirror the engine (only explicit `keep` survives). |
| **D16** | 菊谱 never recorded; codex tiles could be lit for free | the 菊珠 crack picked `101 + random(36)` = 101–136, but grid ids are `row*100+col` (101–606); and `getCanClick` let every unrevealed tile be clicked to 1. Also `grid` was passed through `keep`, which `layOver()` mutates in place, so it was zeroed anyway. | random id = `100*row + col` over 6×6; tiles are display-only (`getCanClick → false`); grid copied by hand around `layerDataReset`. |
| **D17** | 菊珠 drip was invisible to the exhibition/market | two pools: `k.update` dripped into `player.k.jade` (read only by the k/o tabs), while x's tiles and m's stalls spend `player.x.jade`; x's own reset also wiped `x.jade`. The drip/brew also ran while the layer was still locked. | one pool (`x.jade`): drip feeds it, it is kept through x resets, k/o displays read it; `k.update`/`j.update` return while locked. |
| **D18** | trial peaks (`maxpoints`, the M2 reward currency) reset to 0 whenever a trial started | `layerDataReset` resets every field not in `keep`; and `keep` cannot carry an array (`layOver` mutates nested arrays in place, so the "saved" reference was zeroed before restore). | copy `maxpoints` into fresh Decimals before `layerDataReset` and restore after; points also kept on self-reset. |
| **D19** | all 50 achievements dead (`hasAchievement("a", …)` always false, a-tab empty) | achievement definitions were top-level keys of layer `a` (`11: {…}`), not inside an `achievements: {…}` object; `updateAchievements` only iterates `layers[layer].achievements`. | moved all entries under `achievements`; `a` also gets `type: "none"` so no bogus prestige button. |
| **D20** | 设置 → 重购酿具 did nothing | `respecBuyables()` returns early unless `layers.j.buyables.respec` exists — j never defined one. The clickable's `display()` also forgot `return`. | added `j.buyables.respec()` (refund every bought level at its actual cost, clear gear + `spentOnBuyables`); restored the `return`. |
| **D21** | six buyables were pure sinks: buying them changed nothing | no consumer: k.11 农具 (jade drip), k.12 圃地 (dew ×), j.11 曲种 (brew speed), d.11 茱穗 (guard), x.11 展签束 (jade gain), x.12 名帖 (bond ×). | wired each into `jadeRate` / `k.gainMult` / `brewSpeed` / `charmGuard` / 金菊 `onClick` / `x.gainMult`; displays now show the real current total. |
| **D22** | s milestone 3 promised ×2 but gave ×1; u23 九诗 ^1.1 only worked after milestone 3 | both effects were fused into `m.pow(hasUpgrade("s",23) ? 1.1 : 1)` inside the milestone branch. | milestone 3 → `×2`; u23 → independent `^1.1`. |
| **D23** | g/y could exceed the theme cap (九层糕 / 九重天) on a buy-max burst | `canBuyMax` static gain is a level count; `canReset` stopped at the cap but a single reset could add several levels past 9. | custom `getResetGain` clamps to `cap − current` for both static layers. |

Verification after the sweep: `node --check` clean; smoke 0 FAIL / 0 WARN; static 87 PASS /
2 WARN (accepted D9/D10) / 0 FAIL; sim reaches `isEndgame()` in 0.60 h with no NaN/∞;
browser: clean boot (`__bootErrors` empty), all 13 tabs render, first p reset now leaves
`p.points = 1`, all clickables work (攀一步 +4.42, 开酿 toggles, 菊珠 −3 jade + valid grid id,
金菊 5→11, 文辞 toggles, 重购 refunds 30), all four trials enter with peaks preserved,
m stalls buy with jade, y.31/y.45 pay in tributes.
