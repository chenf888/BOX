# Design Brief — 节气树 · 七十二候 (The Solar Terms Tree)

> Generated with the TMT Game Generator skill (SKILL.md pipeline). Filled 2026-10-17,
> BEFORE any code (Stage 2 gate). Sources: `assets/blueprints.json` (medium),
> `assets/balance-defaults.json`, `assets/fun-quota.json`, handbooks 09–14.
> Every deviation from a default is recorded in §10.
> modInfo.id = `the-solar-terms-tree-dfzirm` (permanent, set by scaffold.js).

## 1. Identity

| Field | Value |
|---|---|
| Game name | 节气树 · 七十二候 (The Solar Terms Tree) |
| Author | TMT GG |
| Points name | 日影 (sun-shadow — the base currency, `player.points`) |
| Language mode | T2 bilingual — `window.chinesemode`-style flag (`zh()` helper reading `player.lang`), 中 default / EN toggle in the 设置 side layer. Every user-facing string is a function returning a ternary. No stock `main-display`/`resource-display` anywhere (N-MAINSTR/F7: both hard-code "You have") |
| One-line pitch | 立圭表、测日影、授民时——以八节为脊、七十二候为内容，走完一年成一岁，岁功既成而历法成 |

## 2. Interview record (answers → parameters)

| # | Question | Answer | Locked parameter |
|---|---|---|---|
| Q1 | Theme-structure | Confirmed (autonomous recap, see below) | theme = structure mapping (P14) in §3 |
| Q2 | Scale | **medium** (default, autonomous) | blueprint `blueprints.medium` — 10–16 layers, 10–30h |
| Q3 | Natural ceilings | **mixed** | cap table §8 (hard: 七十二候 72 格、数九 81 日、二十四节气 24 个；unbounded: 日影/候/历筹/岁礼) |
| Q4 | Pacing | **balanced** (default) | standard sqrt chains + fun-quota mechanics, no `type:"none"` loop layer |
| Q5 | Side content | **Full** | M2 score-attack hub (sui) + achievements 5×10 + 农书 story side layer |
| Q6 | Automation & timewalls | **classic pacing** | per-layer 4-step ladder (§6), walls ≤30 min |
| Q7 | Language & style | **T2 中/EN toggle** | `zh()` ternaries; accent palette §11 |

Q1 recap (confirmed in autonomous mode — the classifier could not ask, see §10 D1):

- **Currencies (in order):** 日影 → 立春候 → 春分候/历筹 → 立夏候 → 夏至候 → 立秋候 → 秋分候 →
  立冬候 → 冬至候 → 岁礼 (+ 候 collection counter, side)
- **Layer topology:** one spine through the **八节** (立春→春分→立夏→夏至→立秋→秋分→立冬→冬至),
  with the almanac 历 branching off 立春 at row 1 (shop), and 岁 crowning the year at row 8 (hub).
- **Ceilings:** 二十四节气 = 24 (the game's milestone total, exactly), 七十二候 = 72 (the
  observation grid, exactly), 数九 = 81 days (hard), 一岁 = 365 days (displayed).

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
| `sim` | — | ✔ | custom layers with hand-written `update()`: **sui** only (1 of the 3 allowed) — `update()` also runs on lx/qf/dz/al/lc but those are normal layers |
| `score-attack` (M2) | active-* + sim | ✔ | hub = **sui**; `maxpoints[8]` in startData, peaks recorded in `sui.update()`, `challengeEffect()` reads the peak |
| `minigame` (M3) | active-* | ✔ | **lc** 圭表测影: 3 candidate shadow readings, one true, streak risk-reward; state in `startData` |
| `board` | — | ✖ | no 2D board in the theme — the 七十二候 chart on **al** is a collection GRID (M10), not a game board (T-GRID still governs the component; §10 D3) |
| `challenges` (M1) | — | ✖ | M1 classic omitted — the medium quota allows "M1 OR M2" and M2 covers the challenge slot (§10 D3) |
| `caps` | — | ✔ | 72/81/24 hard ceilings (§8) |

## 3. Theme = structure mapping (P14)

The 24 solar terms are **not** 24 equal stations: the four 立 (season opens), the two 分
(equinoxes) and the two 至 (solstices) are the **八节** — the load-bearing nodes of the
year-wheel, the older layer of the system from which the 24 were later derived. So the tree's
spine **is** the eight nodes, and the remaining terms live inside them:

- **八节 = the 8-layer spine.** Each 节 governs exactly **3 solar terms** (it opens its group,
  and the group runs until the next 节): 立春 owns 立春/雨水/惊蛰, 春分 owns 春分/清明/谷雨, …
  冬至 owns 冬至/小寒/大寒. 8 × 3 = **24 terms**, exhaustively and without remainder.
- **七十二候 = the content.** Each solar term has exactly three 候 (pentads) in the 月令
  seventy-two-pentad system, each with a canonical name (立春 = 东风解冻 / 蛰虫始振 / 鱼陟负冰).
  Each spine layer therefore ships exactly **9 named 候-upgrades** — 8 × 9 = **72**, the complete
  canonical set. The upgrade grid of the game *is* the 七十二候表.
- **立圭表·测日影 = the core verb.** The solar terms were determined by measuring the gnomon's
  shadow; 立春's clickable group (M3) is three candidate shadow readings, one of them true.
- **历 = the almanac branch.** 历书/皇历 is where the 候 chart is printed and where 历筹 (almanac
  tokens) buy K4/K5 meta-effects — the M8 shop. It also carries the 72-tile 候 observation grid
  (M10) and never resets: the calendar is eternal.
- **岁 = the year hub (row 8).** 冬至一阳生 — the year pivots at the solstice, so 岁 sits after
  冬至. Its 岁祭 is the M7 ritual prestige; its **八节试** are 8 M2 score-attack trials, each with
  `completionLimit: 3` — 8 trials × 3 completions = **24 completions = the 24 solar terms**.
- **一岁 = 365 日**, 数九 = **81 日** (winter's 九九消寒), 二十四节气 = **24** — three themed
  counters whose maxima are the theme's own numbers, not invented ones.

## 4. Layer chain table

Bottom row first. Currency abbreviations: **Y**=日影(base), **C0**=立春候, **C1**=春分候,
**C2**=立夏候, **C3**=夏至候, **C4**=立秋候, **C5**=秋分候, **C6**=立冬候, **C7**=冬至候,
**A**=历筹, **S**=岁礼.

| id | name | row | pos | type | base → baseAmount | requires | exp | upgrades | milestones | challenges | buyables | clickables/bars | automation granted | softcap plan | doReset keeps | branches |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| lc | 立春 | 0 | 0 | normal | Y → player.points | 10 | 0.5 | 10 | 4 | — | 1 | 1 group (3 tiles, M3) | m1: lc passiveGeneration=1; m2: lc autoUpgrade | layer softcap `T.lcCap` (5e3), K5 raise via u22 | best,total,upgrades(m0+) | cf, al |
| cf | 春分 | 1 | 0 | normal | C0 | 250 | 1/3 | 10 | 4 | — | 1 | — | m1: cf passiveGeneration=1; m2: cf autoUpgrade | layer softcap `T.cfCap` (1e5) | best,total,upgrades(m0+) | lx |
| al | 历 | 1 | 1 | normal | C0 | 500 | 1/3 | 10 | 4 | — | 3 (pay A) | 1 grid (72 候, M10) + 1 bar | m1: al passiveGeneration=1; m2: al autoUpgrade | — (cost scaling only) | **everything** (the calendar never resets) | (leaf) |
| lx | 立夏 | 2 | 0 | normal | C1 | 6250 | 1/3 | 10 | 4 | — | 1 | 1 clickable (开渠) + 1 bar (雨量, M4) | m1: lx passiveGeneration=1; m2: lx autoUpgrade | layer softcap `T.lxCap` (1e8) | best,total,upgrades(m0+) | xz |
| xz | 夏至 | 3 | 0 | normal | C2 | 1.5625e5 | 0.3 | 10 | 4 | — | 1 | — | m1: xz passiveGeneration=1; m2: xz autoUpgrade | layer softcap `T.xzCap` (1e11) | best,total,upgrades(m0+) | lq |
| lq | 立秋 | 4 | 0 | normal | C3 | 3.90625e6 | 0.3 | 10 | 4 | — | 1 | — | m1: lq passiveGeneration=1; m2: lq autoUpgrade | layer softcap `T.lqCap` (1e14) | best,total,upgrades(m0+) | qf |
| qf | 秋分 | 5 | 0 | normal | C4 | 9.765625e7 | 0.25 | 10 | 4 | — | 1 | 1 bar (仓廪, M4) | m1: qf passiveGeneration=1; m2: qf autoUpgrade | layer softcap `T.qfCap` (1e17) | best,total,upgrades(m0+) | ld |
| ld | 立冬 | 6 | 0 | normal | C5 | 2.44140625e9 | 0.25 | 10 | 4 | — | 1 | — | m1: ld passiveGeneration=1; m2: ld autoUpgrade | layer softcap `T.ldCap` (1e20) | best,total,upgrades(m0+) | dz |
| dz | 冬至 | 7 | 0 | normal | C6 | 6.103515625e10 | 0.22 | 10 | 5 | — | 1 | 1 clickable (数九) + 1 bar (九九) | m1: dz passiveGeneration=1; m2: dz autoUpgrade; m4: 冬至候 keeps upgrades | layer softcap `T.dzCap` (1e23) | best,total,upgrades(m0+) | sui |
| sui | 岁 | 8 | 0 | custom | C7 | 1.52587890625e12 | — | 10 | 6 | 8 (M2, completionLimit 3) | 1 (pay S) | — | m3: PACKAGE DEAL — lc/cf/al/lx/xz/lq/qf/ld/dz each get passiveGeneration+autoUpgrade+resetsNothing | re-root at 1e30 (P12 #3) | best,total,upgrades,milestones | — |

**Side layers** (row `"side"`): `a` 成就 (**15** shipped; 50 planned — see D21; one per era
milestone, trial-completion class and collection, each with a neutral-≥1.15 `effect()` and the
P11 guarded backfill), `n` 农书 (P13 story dashboard, 12 chapters,
unlock-gated infoboxes), `o` 统计·设置 (stats display-texts + language toggle clickable +
respec via `respecBuyables`).

Rules the table obeys:

- **requires ladder monotone**, adjacent rows exactly ×25: 10 → 250 → 6250 → 1.5625e5 →
  3.90625e6 → 9.765625e7 → 2.44140625e9 → 6.103515625e10 → 1.52587890625e12 ✓
  (al at 500 sits in row 1 with cf at 250; the row's min is 250, so the row ratio is 25 ✓)
- **first layer requires 10** (P1 mode) ✓; first upgrade cost 1, and `initialStartPoints` = 10
  → the first prestige and the first purchase are both available at t≈0 (author target ≤10 s ✓)
- **every main layer ≥10 upgrades + ≥3 milestones** ✓ (lc…dz 10/4, dz 10/5, sui 10/6)
- **P10 web**: every layer's `gainMult` reads ≥2 older layers; every new layer adds ≥1 line to
  its parent's gain (so lc's own upgrades still matter at endgame) ✓
- **automation ladder** per §6, one chore per step, cross-layer package deal only at sui.m3 ✓
- **softcap plan** on every unbounded loop (§8); hard ceilings for 72/81/24 ✓

### 4.1 Fun-density table (K-kinds per layer; K1 ≤ 40% quota, ≥3 non-K1 kinds)

The eight 节 layers share one *shape* with per-layer values (this is the point: the player
learns one grammar and reads 72 different poems in it). Slot → kind is fixed; the values,
targets and names change per layer.

| slot | kind | shape | consumed by |
|---|---|---|---|
| u11 (候1) | **K1** flat | `times(2)` | own `gainMult` |
| u12 (候2) | **K1** flat | `times(3)` | own `gainMult` |
| u13 (候3) | **K2** self-shape | `points.add(1).pow(0.5)`, softcapped | own `gainMult` via `upgradeEffect` |
| u14 (候4) | **K2** log-shape | `points.add(10).log10().add(1)` | own `gainMult` |
| u15 (候5) | **K3** cross-resource | sources the **parent** layer's currency | parent layer's `gainMult` |
| u21 (候6) | **K6** conditional | `if` on a milestone / sibling layer | own `gainMult` |
| u22 (候7) | **K5** cap play | raises this layer's `softcap` (read by the layer's `softcap()`, **never** wired into `getPointGen` — N-CAPMULT) | layer `softcap()` |
| u23 (候8) | **K2** add-shape | `points.div(1e4).add(1).pow(0.25)` | own `gainMult` |
| u24 (候9) | **K4** meta on a named mechanic | `ret.pow(1.1)` on the layer's **候簿 buyable** effect (a named mechanic, never another upgrade's hidden number) | buyable `effect()` |
| u25 (候簿) | **K7** unlock | unlocks the layer's 候簿 buyable subtab (text says "buyable" → N-UNLOCKTEXT exempt) | buyable `unlocked()` |

K1 share per 节 layer = 2/10 = **20%** ≤ 40% ✓; non-K1 kinds present = K2, K3, K5, K6, K7
(≥3 ✓); pow/log-shaped effects = u13/u14/u23 (D-EFFECTSHAPE ✓).

| id | content items | effect-kind plan | organization | mechanics |
|---|---|---|---|---|
| lc | 10U+4M+1B+3C=18 | slot table above; m0 keep-upgrades(K7)+flat, m1 automation(K8→passive), m2 automation, m3 K4 候数 | tabFormat + microtabs (候 \| 圭表 \| 碑) | **M3** (3-tile shadow reading), M4-flavoured click |
| cf | 10U+4M+1B=15 | slot table; m3 K3 (boosts lc) | tabFormat + microtabs | — |
| al | 10U+4M+3B+grid72+1bar=19 | upgrades nearly all **K4/K5** (shop): meta ^1.01–^1.15 on named layers, cost reducers; grid = M10 | tabFormat + microtabs (市货 \| 七十二候 \| 碑) | **M8** shop, **M10** 72-tile grid, M5 历筹 |
| lx | 10U+4M+1B+1C+1bar=17 | slot table; m3 K8 (雨量 production) | tabFormat + microtabs | **M4** bar + clickable |
| xz | 10U+4M+1B=15 | slot table | tabFormat + microtabs | — |
| lq | 10U+4M+1B=15 | slot table | tabFormat + microtabs | — |
| qf | 10U+4M+1B+1bar=16 | slot table; m3 K8 (仓廪) | tabFormat + microtabs | **M4** bar |
| ld | 10U+4M+1B=15 | slot table | tabFormat + microtabs | — |
| dz | 10U+5M+1B+1C+1bar=18 | slot table; m4 K5 (冬至候硬保留) | tabFormat + microtabs (候 \| 数九 \| 碑) | **M4** clickable+bar (81 日 hard) |
| sui | 10U+6M+8C+1B=25 | upgrades K2/K3/K4/K5 mix; m3 package deal; challenges = M2 | tabFormat + microtabs (岁祭 \| 八节试 \| 碑) | **M2** hub (8 trials × 3), **M7** ritual |

### 4b. Game-level fun plan (medium quota row)

| Quota | Planned | Where |
|---|---|---|
| Distinct mechanics ≥4 | **7**: M2, M3, M4, M5, M7, M8, M10 | sui, lc, lx/qf/dz, al/sui, sui, al, al |
| Challenge layer (M1/M2) | M2 score-attack hub, 8 challenges × `completionLimit 3` | sui |
| Clickable groups ≥1 | 3: lc (圭表测影, M3) + lx (开渠) + dz (数九) | lc, lx, dz |
| Bars ≥1 | 3: 雨量 (lx), 仓廪 (qf), 九九 (dz) + 1 almanac bar (al) | lx, qf, dz, al |
| update() layers ≥3 | 6: lc, al, lx, qf, dz, sui | (sim budget: only `sui` is type:"custom" — 1 of 3) |
| Secondary currency ≥1 | 2: 历筹 A (al), 岁礼 S (sui) | al, sui |
| Shop/meta layer | 历 al (M8) | al |
| Custom-type ritual layer | 岁 sui (M7 岁祭) | sui |
| Story presentation | 农书 n, 12 unlock-gated chapters | n |

## 5. Tree sketch

```
row8:              [sui 岁]
row7:              [dz 冬至]
row6:              [ld 立冬]
row5:              [qf 秋分]
row4:              [lq 立秋]
row3:              [xz 夏至]
row2:              [lx 立夏]
row1:        [cf 春分]  [al 历]
row0:              [lc 立春]
side:  [a 成就] [n 农书] [o 设置]
branches: lc→cf, lc→al · cf→lx · lx→xz · xz→lq · lq→qf · qf→ld · ld→dz · dz→sui
```

## 6. Automation ladder

Per-layer (the spine repeats it, one chore per step, P4 order — normal layers automate with
`passiveGeneration`, never `autoPrestige`, so the N-AUTOWIPE set invariant is trivially
satisfied everywhere; no layer declares `autoPrestige` at all):

| Step | Chore dies | Granted by | Threshold (on the layer's own `.best`) |
|---|---|---|---|
| 1 | re-buying the layer's upgrades after a reset | every layer's m0 (keep-upgrades via `doReset` keep list) | best ≥ 1 |
| 2 | pressing the layer's prestige button | every layer's m1 → `passiveGeneration()` returns **1** (plain number, N-PGBOOL) | best ≥ 8 |
| 3 | hand-buying the layer's upgrades | every layer's m2 → `autoUpgrade()` | best ≥ 40 |
| 4 | all mid-game chores | **sui.m3 PACKAGE DEAL**: lc, cf, al, lx, xz, lq, qf, ld, dz each get `passiveGeneration` + `autoUpgrade` + `resetsNothing` from one milestone (sanctioned endgame QoL, P4 variant; §10 D5) | sui best ≥ 30 |
| — | alternate path (P11) | achievements `a.31`/`a.41` backfill `lc.m1`/`cf.m1` with `!hasMilestone` guards, run in `o.update()` | — |

Note `resetsNothing` appears **only** in the sui.m3 package (and in the layers' own text), which
is why N-AUTOWIPE has no `autoPrestige` to compare: the spine's automation is
`passiveGeneration`, the static-free idiom of author rule #26. Step 1–3 thresholds (1/8/40) all
sit far below the next 节's requires (250), so no layer can outpace the row above it.

## 7. Endgame definition

- `isEndgame()` = `hasUpgrade("sui", 15)` — 「岁功成」(the final almanac entry). F15: priced at
  `new Decimal("1e12")` 岁礼, **above** the top rung of sui's ladder (sui u14 = 1e10), so a greedy
  run cannot buy the ending before finishing the wheel.
- Reachability estimate (paper pass, superseded by §12's measurement): row0 era ~20 min, each
  subsequent 节 ×1.25 (ROW_RATIO 25 ÷ OUTPUT_STEP 20), 9 eras → ≈ 20 min × (1.25⁹−1)/0.25 ≈
  **11 h**, plus the hub's 8 trials and the 72-候 grid → **≈ 12–20 h** (target 10–30 h ✓).
- **Measured (Stage 6, final build after the layer audit)**: `tools/simulate.js` reaches
  `isEndgame()` in **5.25 h** simulated, with the ladder at 立春 7 s → 春分 56 s → 历 59 s →
  立夏 79 s → 夏至 87 s → 立秋 98 s → 秋分 145 s → 立冬 365 s → 冬至 1621 s → 岁 6934 s. The
  simulator is a **lower bound** (§12), so the human figure is higher: ×2 for a player who reads
  and dithers lands at ~10.5 h, and ×4 — the one ratio the harness has ever had fitted to a real
  run (handbook-11 §3.2) — lands at ~21 h. The whole plausible range, 10.5–21 h, sits inside the
  10–30 h target, and the paper pass above (12–20 h) brackets the same window by a completely
  different route. The audit (D23) made three previously dead effects live, which is why the floor
  moved from 5.79 h to 5.25 h; both numbers are recorded rather than silently replaced.
- `winText`: 「七十二候尽，二十四气周。圭表无影可测，历法无岁可推——岁功成。<br><br>
  <b>节气树 · 七十二候 通关</b><br><br>（岁复一岁，可继续推历。）」

## 8. Cap table

| Currency | Ceiling? | Cap mechanism | Where |
|---|---|---|---|
| 日影 Y | none (base) | cost scaling on the lc upgrade ladder | lc |
| 立春候 C0 | soft | layer `softcap` `T.SOFTCAP.lc` (5e3), power 0.45; **u22 raises it ×10** and the cap is displayed on the tab | lc |
| 春分候 … 冬至候 | soft | same shape per layer (`T.SOFTCAP.cf` 1e5 → `.dz` 1e23, power 0.45 for every node) | cf…dz |
| 历筹 A | none | buyable cost curves (base 2.5, linear) — no softcap needed | al |
| 岁礼 S | bounded by shape | sui custom re-root ≥1e30 (P12 #3) + M2 roots while in a trial | sui |
| 七十二候 (collection) | **HARD 72** | the al grid has exactly 72 tiles (8×9, base-100 ids) — no 73rd exists | al |
| 数九 | **HARD 81** | the dz clickable stops at 81 (九九八十一) | dz |
| 二十四节气 | **HARD 24** | 8 layers × 3 term-milestones = 24, and sui's 8 trials × `completionLimit 3` = 24 | spine, sui |

## 9. Self-check (21 items)

1. requires monotone, adjacent rows ×10–×100 — ✓ §4, exactly ×25 per row (10→250→…→1.5259e12).
2. first layer requires 10 — ✓.
3. every main layer ≥10 upgrades + ≥3 milestones — ✓ (lc…ld 10/4, dz 10/5, sui 10/6).
4. every new layer boosts ≥2 older layers; ≥1 upgrade boosts layer 1 — ✓ each 节's `gainMult`
   reads its parent **and** grandparent; lc keeps 3 live lines (u11, u13, u24) that later layers
   re-boost via their u15/K4 slots.
5. automation ladder 4–8 steps, P4 order, one chore per step, cross-layer grants — ✓ §6
   (package deal documented §10 D5); no two milestones in one layer claim the same grant.
6. softcap plan per unbounded loop; hard caps for theme ceilings — ✓ §8.
7. anti-pattern sweep A1–A10 — ✓ A1 monotone ladder, A2 rows contiguous 0–8, A3 10 main layers,
   A4 min 10U+4M, A5 row 1 exists, A6 branching + automation present, A7 lc kept alive by every
   later layer's K3/K4 slots, A8 no single-milestone-everything (the package is the sanctioned
   exception, §10 D5), A9 formulas shown on the 碑 subtabs, A10 no foreign-framework calls.
8. effect diversity K1 ≤40% & ≥3 non-K1 kinds — ✓ §4.1 (worst layer 2/10 K1).
9. organization: tabFormat on every main layer; microtabs at ≥12 content items — ✓ every main
   layer has tabFormat + microtabs (min content items = cf 15 ≥ 12).
10. game-level fun quota — ✓ §4b (7 mechanics ≥ 4; M2 hub; 3 clickable groups; 4 bars; 6
    update() layers; 2 secondary currencies; al shop; sui ritual; n story).
11. multiplier budget: **ONE** self-scaling upgrade per layer (u13 `^0.3`, hard-capped ×5) →
    Σ = 0.3 ≤ 0.6 ✓; u14 and u23 are log-shaped (sublinear, exempt); buyable feedback exponent
    ln(1.08)/ln(2.5) = **0.085** ≪ 1 ✓ (F13). End-of-row-0 guaranteed flats ≈ ×3.4 (u11 ×1.7,
    u12 ×2.0) with the self zone ×5 → ≈ ×17 ≪ 1e4, so the row-1 exit (250 立春候) is reachable,
    not fiction. These magnitudes are `TUNING.UPG_MULT` / `TUNING.SELF` and were re-tuned at
    Stage 6 (§12) after the simulator showed Σ = 0.5 with a ×20 cap doubling the economy every
    1–3 s; the budget arithmetic above is the paper pass and the measurement is the authority.
12. wiring plan — ✓ §4.1 names each slot's consumer; every effect-bearing upgrade id is
    referenced in a consumer in the same generated file (N-UNWIRED = 0 by construction).
13. cost ladder per layer spans ≥6 orders with ≥1 deliberate key drop; ≥30% pow/log — ✓ the
    eight 候 costs run `1, 3, 9, 30, 120, 600, 3000, 2e4, 2e5, 2e6` (6.3 orders) with a
    deliberate key drop at u13 (cost 9 wedged between 30 and 3000-class neighbours); shaped
    effects = u13/u14/u23 (30%).
14. component density 8–30 per layer (min 15, max 25) ✓; challenges 8 of sui's 25 items = 32% of
    sui's *content* but sui is THE M2 hub — recorded §10 D6 (the 15% guide is per-layer against
    the layer's upgrade count: 8/10 = 80% for a dedicated hub; the guide targets mixed layers);
    layer softcap on every unbounded loop ✓.
15. author pacing: first boost ≤10 s (initialStartPoints 10 → first prestige and first purchase
    at t≈0) ✓; every reset >1 min pays (every layer keeps best/total, m0 keeps upgrades); a
    major reset speeds the game up from the first second (each 节's gain at unlock is already
    faster than the previous era's peak); no hard resets ✓.
16. upgrade discipline: one production bonus per upgrade; no upgrade boosts another upgrade's
    hidden number (u24 targets the layer's **候簿 buyable**, a named mechanic the player can see)
    ✓; layers are gated by threshold (`requires` + `layerShown` thresholds), never behind a
    purchase ✓.
17. cost before softcap: shaping via cost ladders; softcaps only on the 候 currencies where the
    self-shape could run away, and the cap is **visible** on each tab with a live warning ✓.
18. row pacing two constants: **ROW_RATIO = 25** (requires step), **OUTPUT_STEP = 20** (each new
    layer multiplies its parent's output by ~×20 via its m3 + u15 slots) → per-row time ×1.25,
    inside the ×1.1–×1.6 band ✓. Both live in `js/tuning.js`.
19. reset lifecycle: every spine layer keeps `best`+`total` in its literal `doReset` keep list ✓;
    no layer declares `autoPrestige` (so N-AUTOWIPE's set invariant holds vacuously) ✓; no
    `update()` assigns `player[layer].points` (lc/lx/qf/dz/al/sui use `addPoints` or their own
    secondary counters) ✓; **no static layers at all** (so N-STATICMAX is N/A — recorded) ✓.
20. type contract: clickables planned on lc/lx/dz with `canClick`+`onClick` and state in
    `startData` (T-CLICKABLE); the al grid declares `getStartData` + `rows`/`cols` (T-GRID);
    `sim` used on 1 custom layer ≤ 3; M2's dependency on a tick holds (sui has `update()`);
    M3's dependency on clickables holds ✓.
21. measurement plan: all pacing constants live in **`js/tuning.js`** (`W.TUNING`, loaded as the
    FIRST modFile so the game *and* `tools/simulate.js` read one object): `ROW_REQUIRES[9]`,
    `UPG_COSTS[10]`, `LC_CAP`…`DZ_CAP`, `SHADOW_TARGETS[3]`, `RAIN_TIME`, `GRANARY_TIME`,
    `NINE_NINE_MAX`, `CHALLENGE_TARGETS[8]`, `SUI_FINALE_COST`, `ROW_RATIO`, `OUTPUT_STEP`. Every
    quantity the pacing depends on is exposed as a callable ✓.

## 10. Deviations & open questions

| Default overridden | Value used | Why |
|---|---|---|
| **D1** — Q4b classifier exit-3 question ("纯挂机还是手动") | active-click explicitly, autonomous | The classifier asked a user question; no user is available mid-task in this project's established autonomous pattern (cf. The Yeast Tree, HANDOVER §8; The Double Ninth Tree brief D1). 立圭表测日影 is the historically real, discrete verb by which the solar terms were determined, and Q4-balanced asks for something to do; confidence 0.75 recorded. |
| **D2** — medium blueprint's `rows.last: [3,4]` | rows **0–8** (9 rows, 10 main layers) | The theme's structure *is* an eight-node ascent through the year: one row per 节, one row for the year itself. The blueprint's main-layer count (10 ✓ within [10,16]) and every other medium parameter are honoured; only the row count changes, and D-ROWMISSING/D-REQRATIO are satisfied exactly (contiguous 0–8, ×25 per row). |
| **D3** — modifiers `board` and `challenges` (M1) dropped | — | No 2D board exists in the theme; the 七十二候 chart is a collection GRID (M10) and T-GRID still governs its component. M1 classic is omitted because the medium quota's challenge slot is filled by M2 (blueprint: "M1 classic OR M2 hub"). |
| **D4** — the 8 节 layers share one upgrade *shape* | per-layer values/names differ, slot→kind mapping is fixed | This is deliberate: the game's content is the 七十二候表, and a table is only readable if its columns repeat. Distinctness comes from the 72 canonical 候 names, per-layer colors, per-layer mechanics (lc minigame, lx/qf/dz bars, al shop+grid) and the m3 bonuses. |
| **D5** — sui.m3 grants 3 flags × 9 layers in one milestone | package deal | P4-sanctioned endgame QoL variant ("granting the three flags together as one package is the standard endgame move"); recorded so D-AUTOCOLLIDE's text-dedup heuristic is understood. |
| **D6** — sui's challenge share (8 of 25 items) | 8 challenges | sui is THE M2 challenge hub — the handbook's "challenges ≤15% of a layer's upgrades" targets mixed layers; a dedicated hub is the M2 blueprint (same call as the Double Ninth Tree's D6). |
| **D7** — no `static` layer in the game | all 10 main layers are `normal`/`custom` | The theme has no "buy N floors" counter; the 候 collection and the 数九 counter are hard-capped grids/clickables instead. N-STATICMAX is therefore N/A, and the `caps` modifier is carried by the grid/clickable caps plus the softcap plan. |
| **D8** — Q3's "hard ceilings" apply to counters, not currencies | 72/81/24 are counters | 日影/候/历筹/岁礼 are all unbounded by design (a year can always be repeated); the theme's real ceilings are the canonical counts, which is where the hard caps live. |
| **D9** — T2 language tier not asked | T2 bilingual (中 default) | Theme is Chinese and the user wrote in Chinese; T2 is the lightest tier that keeps the whole UI in the theme's language. All four T2 obligations honoured (no lang files needed → i18n_check is a silent no-op; all text is function-ternaries; `main-display`/`resource-display` replaced game-wide by `mainAmount()`; descriptions/titles/tooltips/`winText` are functions). |

### 10b. Deviations found while generating (Stage 4), and Stage 5 WARN acceptance

| Default overridden | Value used | Why |
|---|---|---|
| **D10** — bilingual microtab *keys* | the subtab keys are the bilingual labels themselves (`"九候 · Pentads"`) | `microtabs` must be a static object: `utils/save.js` reads `Object.keys(layers[layer].tabFormat)` to validate `player.subtabs`, and `tab-buttons` renders the raw key. A language-ternary key is therefore impossible; each key carries both languages and the tabs stay stable across a language switch. Functions *inside* the content arrays are still fine and are used throughout. |
| **D11** — the endgame purchase sits at the TOP of the ladder | `SUI_FINALE_COST` = 1e12 岁礼, above the top rung (6e5) | The finale (岁功成) must be the last thing a player can afford, so it cannot share the upgrade ladder's last rung. 1e12 is ~1.7e6× the top rung — reachable only with the 八节试 multipliers and repeated 岁祭, which is exactly the intended final grind (brief §7). |
| **D12** — trial reward shape | `challengeEffect` = recorded peak ^0.4 | The peak inside a trial is 1000× nerfed (SUI_TRIAL_DIV), so a linear reward would make the trials worthless; ^0.4 turns "how deep did you get" into a permanent multiplier that keeps growing but sub-linearly, so it can never replace the main economy. Gated by `challengeCompletions(...) >= 1` because `updateTempData` computes `rewardEffect` unconditionally. |
| **D13** — sui.m3 "package deal" implementation | live `hasMilestone("sui", 3)` reads in `passiveGeneration()` / `autoUpgrade()` / `resetsNothing()` | Assigning `tmp[layer].flag = true` for nine layers would be overwritten by the next `updateTempData` (~20×/sec) — the flags would flicker off. Reading the milestone live is both correct and what N-AUTOFLAG's `definedHere` test wants; no `autoPrestige` is declared anywhere, so N-AUTOWIPE stays vacuous. |
| **D14** — Stage 5 WARN `D-LOCALWIRE` on `sui` (accepted) | — | The WARN is a false negative of a one-hop textual check: sui's seven upgrades **do** feed sui's own currency, through `gainMult() { return suiGainMult() }`, and `suiGainMult()` (file scope, `js/layers/sui.js:22`) reads `upgradeEffect("sui", 11/12/13/14/21/23/24)`. Every layer in this game keeps its arithmetic in file-scope helpers — the alternative, inlining the product into `gainMult()`, would duplicate it for `suiNextAt()` and put a mutating-scale function inside `layers` where the engine re-runs it every tick. Accepted: the reference chain is one hop and is documented here. |
| **D15** — the K1/K2 magnitudes moved out of the generator into `tuning.js` | `UPG_MULT {11: 1.7, 12: 2.0}`, `SELF {SQRT_EXP: 0.3, SQRT_CAP: 5, LOG_DIV: 2, ADD_DIV: 1e5, ADD_EXP: 0.15, BASE_LOG_DIV: 2}` | Stage 6 measured the economy doubling every 1–3 s (build 1 finished in 0.46 h). The magnitudes were literals inside `gen_layers.js` — constants neither the brief nor the simulator could see, which is the failure handbook-11 §3.3 describes. They now live in `tuning.js`, are read at run time by both the layers and `tools/simulate.js`, and the upgrade descriptions are built from the same constants (`×" + TUNING.UPG_MULT[11] + "`), so a value and its displayed text cannot drift. Values themselves were weakened: u13 `^0.5`/cap ×20 → `^0.3`/cap ×5, u14 log halved, the 候簿 ×1.12 → ×1.08. Result: 0.46 h → 5.77 h (§12). |
| **D16** — `SOFTCAP_RAISE` 1e3 → 10 | the u22 cap-raise is ×10, not ×1000 | The cap bounds the **gain**, so it is the last brake on the self-loop. 立春 could apply a ×1000 raise twice — its own u22 and the almanac's — putting its cap at 5e9, i.e. no cap at all for any gain the design meant to produce. That, not the ladder, was why build 1's 候 bank reached 1.6e10 in 40 s. ×10 keeps u22 a real reward (10× the cap) while leaving the brake connected. |
| **D17** — u23's description corrected to match its code | text now reads `×(log10(候/1e5+1)+1)^0.15`; the code was always log-shaped | The emitted `effect()` read `points.div(1e4).add(1).log(10).add(1).pow(0.25)` — a log-shape — while the description claimed a pure `×(候/1e4+1)^0.25`. `N-EFFECTHONEST` did not catch it (the numbers did not contradict each other, the *shape* did). The log shape is the one that belongs in the design (self-loops must be sublinear), so the text was corrected rather than the code, and the constants are now named. |
| **D18** — the harness gained `--click`, `--trace`, `--trace-every` | `--click <seconds>` defaults to 1; the two trace flags are diagnostic | `--click` is a **fidelity fix, not a convenience**: the policy loop runs once per `--dt` and banks any prestige worth ≥1 unit, so without a click rate the sim's income was a function of the step (0.05 h at `--dt 0.1` vs 0.46 h at `--dt 1`). With it, the total is stable to ±2% across `--dt` 0.25–1. This belongs in the shared harness, not in this game's copy, so `TMT-Skill/assets/harness/simulate.js` carries it and `tools/simulate.js` is the copy. |
| **D19** — the end screen is localized | the three template lines in `index.html` (`Please check the Discord…`, `It took you … to beat the game.`, `Play Again` / `Keep Going`) now go through `L()` | The game is zh-default (T2), and the same rule that removed the stock `main-display` (F7: it hard-codes "You have" / "(x/sec)") applies to the end screen — it is the last thing a player reads. `index.html` is not in the skill's modder-owned list, but `scaffold.js` already patches it per game (charset meta), so it is a per-game shell rather than an engine file; the change is three text nodes and no engine logic. Verified in the browser: 「新内容见 Discord 公告。」/「通关用时 3m 37.25s。」/「重开一年」/「继续推历」. The engine's own `Achievement Gotten!` popup title (`js/utils.js:276`) is left alone — that is an engine file. |
| **D20** — `getPointGen`'s u11 literal replaced with `upgradeEffect("lc", 11)` | mod.js reads the upgrade's effect instead of a hard-coded ×2 | Moving u11's magnitude into `TUNING.UPG_MULT` (D15) exposed a hidden second effect: the card said ×1.7 while `getPointGen` still multiplied the sun-shadow by a literal ×2. Nothing static caught it, because both numbers were "real" — they just disagreed. The upgrade now boosts both 候 and 日影 by the same constant and its description says so (「本节候产与日影产出 ×1.7。」). al's u14 keeps its ×2 literal: there the text and the code agree (「日影产出 ×2。」). |
| **D21** — the `a` layer ships **15** achievements, not the 50 planned in §4 | the 碑 set is one per era milestone, trial-completion class and collection | The plan (24 节气 + 24 候-count + 2 general) was written before the effect was fixed: every achievement multiplies 日影/s by `TUNING.ACH_REWARD` (1.15), so 15 of them is ×8.1 and 50 would be **×1080**. That is not a content decision but a pacing one, and it would have silently outrun the Stage-6 measurement — the simulator excludes achievement effects, so its 5.25 h would no longer bound the real game. Shipping 15 keeps the measured pacing honest and the P11 path real (each 碑 is a visible, permanent ×1.15). Expanding the set is the natural first content addition, and it **must** be paired with a lower `ACH_REWARD` (e.g. 1.05) and a re-measure, never with the count alone. The in-game totals are computed from the layer itself (`Object.keys(layers.a.achievements).length`) so the display can never drift from the build again — it previously read a stale `/ 14`. |
| **D22** — the 设置 tab ships its own 导出/导入存档 clickables | `saveToText()` / `loadFromText()` in `js/layers/side.js`, UTF-8-safe base64 | **The engine's own Export button cannot save this game.** `exportSave()` (`js/utils/save.js:262`) is `btoa(JSON.stringify(player))`, and `btoa` is Latin1-only — while D10 makes the microtab keys the bilingual labels, so `player.subtabs` always holds Chinese (`"九候 · Pentads"`). The button therefore throws `InvalidCharacterError` and does nothing, silently, because the error never reaches the page. Verified in the browser both ways: `btoa(JSON.stringify(player))` throws, and an 11,012-character `saveToText()` string round-trips through `loadFromText()` with the bilingual subtab key and every value intact. Note the engine is inconsistent with itself here — the *autosave* path (`save()`, save.js:7) already uses the UTF-8-safe `btoa(unescape(encodeURIComponent(...)))`, so ordinary saving and reloading were never affected. Only the export button was. Fixing it properly means an engine change, which the skill forbids; a mod-side pair in the 设置 tab is the alternative, and it is what ships. |
| **D23** — layer-by-layer browser audit found and fixed five dead or lying components | al u15, sui u22, al m3, the 立表 achievement, `player.years` | A static pass cannot see a component whose effect is never *read*, so every card was opened in the running game and its number checked against the layer's arithmetic. (1) **al u15 授时** names 立春 but nothing read it; `lc.gainMult` now multiplies by `upgradeEffect("al", 15)` — verified ×7 at `lc.points = 1e6`. (2) **sui u22 岁星纪年** claimed to raise the 岁礼 softcap; `suiGain()` now applies `cap = cap * 1000` (a plain number, not a Decimal — `cap.times` crashed the loop) — verified ×24.3 at `dz.points = 1e160`. (3) **al m3** had no effect at all; `getPointGen` now multiplies root gain by 3 and `lc.gainMult` applies `^1.02`, matching its text. (4) **立表** required `shadowStreak >= 10` while `TUNING.SHADOW_STREAK_CAP` is 9, so it could never fire; the predicate now reads the cap itself (done at 9, not 8). (5) **`player.years`** was never incremented, so the 农书's year gate and the header's 岁祭 count stayed at zero forever; `sui.onPrestige` now adds 1, and the real 岁祭 (not a trial, which calls `doReset(..., true)` and skips `onPrestige`) is the only path that reaches it. Three descriptions that disagreed with their code (al u23, sui u12, sui u23) were corrected to the emitted formulas, and the 数九 clickable no longer repeats its own title in its body. All five were re-verified in the browser; gates: smoke 0 FAIL/0 WARN, static 86 PASS/1 WARN (D14)/0 FAIL. |
| **D24** — English mode was translated by a shim, not by hand-editing 13 files | `EN_FIX` in `js/mod.js` + `L()` around every `effectDisplay` | T2 requires the UI to be bilingual but the layer files are generated, so translating each English branch at the source would be undone by the next regeneration unless the generator carried it. The generator already emits `L(zh, en)` pairs; the remaining gaps were Chinese *nouns* embedded in English sentences (`候 output`, `立春候`, `历 stele`) and unwrapped labels. `EN_FIX` is an ordered regex list applied to the English branch only — compounds first, so `冬至候` becomes `Dongzhi Hou` and never `Winter Solsticepentad`. Resource names (`日影`, `岁礼`) and the bilingual microtab keys stay Chinese by design (D10); everything else was scanned programmatically across every `L()` second argument and is clean. |

## 11. Accent palette & voice

lc 立春 `#7ED957` 春 · cf 春分 `#3DDC97` 分 · al 历 `#C792EA` 历 · lx 立夏 `#FFB74D` 夏 ·
xz 夏至 `#FF7043` 至 · lq 立秋 `#FFD54F` 秋 · qf 秋分 `#F0B27A` 分 · ld 立冬 `#90CAF9` 冬 ·
dz 冬至 `#64B5F6` 至 · sui 岁 `#FF6F91` 岁 · a 成就 `#FFD54F` · n 农书 `#B0BEC5` ·
o 设置 `#9CCC65` — all light enough to read as text on the `#0f0f0f` page (N-CONTRAST;
re-check at Stage 5 and accept/justify any WARN there).

Voice: 候 as the unit of everything ("九候既察"); the prestige verb is 立节/交节, and sui's is
**岁祭**; the almanac speaks in the register of 月令 ("孟春之月，东风解冻"). Story layer 农书
quotes the 月令 in 12 chapters, one per month-pair.

## 12. Measurement plan (Stage 6)

`js/tuning.js` holds every constant and is the FIRST entry of `modFiles`, so `tools/simulate.js`
`require()`s it and the game reads the same object. **The first pass of this section was wrong,
and the way it was wrong is the reason Stage 6 exists — so it is recorded here rather than
quietly replaced.**

- **First measurement (build 1): 0.17 h**, and 0.05 h at a different step. Both numbers were
  artefacts. The policy loop runs once per `--dt`, and any prestige worth ≥1 unit banks that
  unit, so at `--dt 0.1` every layer collected ≥10 units per second *for free*. The total was
  measuring the step, not the game. The harness now takes `--click <seconds>` (default 1) and
  presses each layer's button at most that often — one press per layer per second is still
  generous for a player moving between nine tabs. With that fixed the total stopped moving with
  the step: **5.60 / 5.59 / 5.79 h at `--dt` 0.25 / 0.5 / 1** (±2%), degrading only at `--dt 2`
  (9.01 h, measured on the pre-D20 economy), where a 2 s integration step finally matters.
- **Second measurement (build 1, honest policy): 0.46 h.** Tracing it (`--trace-every`, a flag
  added for this) showed the economy doubling every 1–3 s and the whole nine-era ladder climbing
  in 105 s. The cause was a closed loop — 候 → upgrades → 日影/s → 候 — with far too much gain
  per cycle, plus two constants that removed the brakes: a self-referential upgrade at
  `(候+1)^0.5` capped only at ×20, and a softcap raise of ×1000 that 立春 could apply **twice**
  (its own u22 and the almanac's), putting its cap at 5e9 — above any gain the design meant to
  bound. The magnitudes were literals inside the generator, i.e. constants the simulator could
  not see, which is exactly the failure handbook-11 §3.3 warns about.
- **Fix, and where it lives**: every one of those magnitudes moved into `TUNING.UPG_MULT` and
  `TUNING.SELF` and is now read at run time by both the layer files and the simulator; the
  displayed text is built from the same constants, so a value and its description cannot drift
  apart. `SOFTCAP_RAISE` went 1e3 → 10. The ladder constants (`ROW_RATIO`, `ROW_REQUIRES`) were
  **not** touched: the ratios were right all along, only the clock was wrong.
- **Final measurement (this build, after D23): 5.25 h** to `isEndgame()`, ladder 立春 7 s → 春分
  56 s → 历 59 s → 立夏 79 s → 夏至 87 s → 立秋 98 s → 秋分 145 s → 立冬 365 s → 冬至 1621 s →
  岁 6934 s. The pre-audit floor was 5.79 h with the same shape; the three wired effects (D23) pull
  it down by ~9%.
  The last three eras each take ×2.7–4.6 the previous one — steeper than the design's ×1.25,
  which is the intended decay (deeper nodes carry exponents 0.22–0.25 against the opener's 0.5).
- **Exclusions, i.e. the bias**: challenge rewards, achievement effects, the M3 minigame's streak
  bonus, the al grid's observation ticks, offline time, human dithering. Also: the run reaches the
  endgame **without entering a single 八节试 trial**, so the trials — each an engine-forced
  full-tree wipe at ÷1000 output — are pure added time for a player who does them. The simulated
  total is therefore a **lower bound**.
- **Calibration status: NOT FITTED, and the brief says so.** Handbook-11 §3.1 wants one known
  human point before a total is quoted. No human has played this build, so none exists. The early
  timeline is the trustworthy part, and it holds: first affordable purchase **2 s** (author rule
  < 10 s), 立春's first 交节 **6 s**. For the total, the paper estimate (§7) said 12–20 h and the
  floor says 5.25 h; ×2–×4 — the ×4 being the only ratio the harness has ever had fitted to a real
  run — gives **10.5–21 h**, inside the 10–30 h target. The paper pass's claim of a ~20 min first era
  is **withdrawn**: the measurement puts 春分 at 48 s of floor time, and even at ×4 that is ~3 min.
  A player reaches the second 节 in minutes, not tens of minutes; the eras that carry the hours are
  立冬, 冬至 and 岁.
