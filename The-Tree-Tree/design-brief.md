# Design Brief — The Tree Tree

> Filled BEFORE any code (SKILL.md Stage 2). Sources: `assets/blueprints.json` (medium) +
> `assets/balance-defaults.json`. Deviations from defaults live in §10 with reasons.

## 1. Identity

| Field | Value |
|---|---|
| Game name | The Tree Tree（THE TREE TREE — 以树为主题的树） |
| Author | *(pending user confirmation at brief gate — scaffolder default is "AI")* |
| Points name (`modInfo.pointsName`) | Leaves（树叶） |
| Language mode (Q7) | T2 Bilingual — `window.chinesemode` ternaries (P17) |
| Default language (Q7) | **English** (`chinesemode: false` initial; toggle switches to Chinese) |
| One-line pitch | You are a tree. The tree diagram IS the tree: grow leaves into wood, wood into branches and roots, mature into bark, blossom and sap, seed a canopy — then plant new trees in a grove until the World Tree itself — THE TREE TREE — is grown. |

## 2. Interview record — the question ledger

| # | Question | Answer (verbatim) | Locked parameter |
|---|---|---|---|
| S0 | Theme | （用户给出主题）「以树为主题的树：THE TREE TREE」 | feeds Q1 |
| Q1 | Theme-structure confirmation | 「确认如上结构」 | three-line recap below; theme = structure mapping in §3 |
| Q2 | Scale | 「Medium」 | blueprint `blueprints.medium` — all rows/components/automation/endgame params |
| Q3 | Natural ceilings | 「无上限」 | no hard caps; P12 softcaps only, cost-scaling first (handbook 12 §2) |
| Q4 | Pacing | 「挂机为主」 | idle-first: log/custom gains preferred where legal (P8b) on rows ≥2; full automation ladder; wood row-0 stays P1 Normal(0.5) opener (`[required]`) — see §10 |
| Q4b | Type + modifier multi-select | 「passive-prestige（推荐）」+「选入 story」 | §2b rows |
| Q5 | Side content | 「Full」→ 形态修正「确认 M1 经典枢纽（推荐）」 | M1 classic challenge hub (M2 blocked by type) + achievements 5×10 + stats + stories side layer |
| Q6 | Automation & timewalls | 「全自动化无长墙」 | full ladder per branch (medium blueprint), walls < 15 min |
| Q7 | Language & style | 「双语言一键切换」+ default「English 默认」 | P17 ternaries; `chinesemode:false`; main-display overridden; T2+ mandatory items |
| Q8 | Endgame flavor | 「消耗型重置」 | M19 consumable reset = the grove "Plant a Tree" ritual; final goal = worldtree milestone chain |

**Q1 recap the user confirmed:**

- **Currencies (in order):** leaves 树叶 (base currency, the tree grows them passively) → wood 木头 (pressed fallen leaves) → branch 树枝 + root 树根 (sprout from wood — up and down in parallel) → bark 树皮 / blossom 花 / sap 树液 (the mature tree) → seed 种子 (the capstone) → grove 树林 (seeds planted become new trees).
- **Layer topology:** single spine wood(row 0, resets leaves) → branch/root (row 1) → bark/blossom/sap (row 2) → canopy/seed (row 3) → grove/worldtree (row 4) + achievements/stats/stories side layers — the tree diagram itself is the tree; every node is a part of the tree.
- **Ceilings:** none — trees grow unboundedly.

## 2b. Game type profile (Q4b)

| Field | Value |
|---|---|
| Type | **passive-prestige**（被动声望链） |
| User confirmation (verbatim) | 「passive-prestige（推荐）」— selected after the classify.js exit-3 verbatim question（「进度条只是显示状态，还是玩家真正在推的进度？」）; explicit re-run `--explicit passive-prestige` exit 0 |
| Confidence + margin | 0.75, margin 0.535 (auto route on the explicit re-run; the user's own pick locked it) |
| Mandatory components | layers `normal`/`static`, upgrades, milestones, mod.js |
| **Forbidden** | `clickables`, `grid`, `update()` — enforced by T-* rules via `.tmt-profile.json` |
| Rules exempt | `D-NOUPDATE` (no tick is the correct shape); D-MECHQUOTA narrows to challenges-only |

Modifiers:

| Modifier | Requires | Included? | Notes / why dropped |
|---|---|---|---|
| `sim` | — | **No** | needs `type:"custom"` + hand-written `update()`; passive-prestige forbids `update()` → dependency-dropped |
| `score-attack` (M2) | active-type + `sim` | **No** | requiresType active-tick/active-click; also needs `update()` peak recording → dependency-dropped |
| `minigame` (M3) | active-type | **No** | built on clickable groups; type forbids clickables → dependency-dropped |
| `boss-rush` (M12) | active-type + `sim` | **No** | needs a tick for the revive/overflow loop → dependency-dropped |
| `gacha` (M13) | active-type | **No** | draw clickables write the bus arrays; no clickables → dependency-dropped |
| `casino` (M14) | active-type | **No** | every casino game is a bet/roll clickable → dependency-dropped |
| `story` (M15) | — | **YES** | 「选入 story」— `stories` side layer, numbered chapters (P51), no cutscene engine (large-only) |
| `board` | — | No | type-derived; passive-prestige has no grid |
| `challenges` (M1) | — | **YES** | classic, `canComplete()` dialect (corpus majority 45/57); M2 hub form blocked by type — user confirmed the M1 substitution |
| `caps` | — | No | Q3 answered no ceilings → nothing to hard-cap |

## 3. Theme = structure mapping (P14)

| Tree anatomy | Game structure |
|---|---|
| Leaves falling and pressing into trunk | row-0 prestige: leaves → wood (Normal 0.5) |
| One trunk, growing up AND down | row-1 fork: branch (production arm) + root (base arm) |
| A mature tree's armor / flowers / sap | row-2 trio: bark (static floors = armor layers), blossom (static floors = counted blooms), sap (custom shop = the tree's blood) |
| Crown competing for light; seeds concentrating the years | row-3 pair: canopy (challenge hub — light trials), seed (capstone hub) |
| A seed planted becomes a whole new tree | row-4 grove: the M19 consumable reset — planting burns the itemized tree to grow a new one |
| The world-tree that all trees grow on | row-4 worldtree: THE TREE TREE, a 15-milestone endgame chain |

Tree-view edges mirror botany: branch/root root into wood; bark/blossom/sap grow from the arms; canopy shades blossom+sap; seed condenses the trio; grove follows seed; worldtree crowns the grove.

## 4. Layer chain table (bottom row first)

| id | name (theme voice) | row | pos | type | base resource → baseAmount | requires | exp/base | upgrades | milestones | challenges | buyables | automation granted (by which milestone, of which layer) | softcap plan | doReset keeps | branches |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| wood | Wood（木） | 0 | 0 | normal | leaves → `player.points` | 10 | 0.5 | 15 (5×3) | 10 | 2 | 2 | m0 ×2.5 wood; receives ALL ladder steps from higher layers | layer softcap @~1e4 (start ≈ branch unlock), power 0.1, bark u12 raises ×10 (visible) | unlocked, best, total; +upgrades (root m4 keeps via milestone gate), +milestones (root m2) | — |
| branch | Branch（枝） | 1 | 0 | normal | wood → `player.wood.points` | 250 | 1/3 | 12 (5×3+2) | 8 | 0 | 1 | grants: resetsNothing(wood) m0, passiveGeneration(wood) m2 | layer softcap @~5e4 (≈ row-2 unlock), power 0.1 | unlocked, best, total; milestone-gated upgrades/milestones | wood |
| root | Root（根） | 1 | 1 | normal | wood → `player.wood.points` | 400 | 1/3 | 12 (5×3+2) | 8 | 0 | 1 | grants: autoPrestige(wood) m1, autoUpgrade(wood) m4 | layer softcap @~8e4, power 0.1 | same as branch | wood |
| bark | Bark（皮） | 2 | 0 | static | branch → `player.branch.points` | 4000 | base 2, exp 1 | 10 (5×2) | 6 | 0 | 0 | grants: autoBuyable(wood,12 closed-form P54) m3; canBuyMax() upgrade reward u10 | floors are the content (no softcap; static) | unlocked, best, total | branch |
| blossom | Blossom（花） | 2 | 1 | static | root → `player.root.points` | 6000 | base 3, exp 1 | 10 (5×2) | 6 | 0 | 0 | grants: resetsNothing(branch,root) m1, autoPrestige(branch,root) m4 | static | same | root |
| sap | Sap（汁） | 2 | 2 | custom | min(branch, root) (P53 convergent) | 2500 | log-based getResetGain (P8b) | 12 (5×3) | 5 | 0 | 1 | grants: passiveGeneration(branch,root) m1, autoUpgrade(branch,root) m4 | double softcap in getResetGain (Gaokao-sm shape, visible) | unlocked, best, total | branch, root |
| canopy | Canopy（冠） | 3 | 0 | custom | blossom → `player.blossom.points` | 1.2e4 | log-based, exp-tuned | 25 (5×5) | 6 | 3 | 0 | grants: milestones unlock the challenge microtab (m1) + canopy QoL | softcap @~1e6 | unlocked, best, total; milestone-gated keeps | blossom, sap |
| seed | Seed（籽） | 3 | 1 | custom | min(blossom, sap) (P53) | 3e4 | custom getResetGain | 25 (5×5) | 8 | 3 | 0 | grants: THE package deal (autoPrestige+autoUpgrade+resetsNothing for bark/blossom/sap) m6, autoBuyable(sap,11) m8, resetsNothing(canopy) m2 | softcap @~1e7 | unlocked, best, total; milestone-gated keeps | blossom, sap |
| grove | Grove（林） | 4 | 0 | custom | the whole tree → itemized burn (P42) | first tree at ~sum-1 | M19 plant ritual (getResetGain ≥ 1) | 8 (5×2) | 5 | 0 | 0 | **never automated by design** — the plant decision is the endgame decision | trees are integers (floor) | unlocked, trees | seed |
| worldtree | World Tree（界树） | 4 | 1 | custom | grove trees → `player.grove.points` | unlock at grove ≥ 1 | growth from tree count × all-currency synergy | 10 (5×2) | 15 | 0 | 0 | grants: full-automation package (canopy + all remaining) m2 | growth curve has its own staged softcap (P45-lite, visible) | unlocked, best, total | grove |

Side layers: `achievements` (row "side", 5×10 = 50, rewards = flat mults + exactly ONE automation grant as the alternate ladder path, P11 backfill with `!has` guards), `stats` (row "side", type none), `stories` (row "side", 12 unlock-gated chapters, M15/P51).

Rules the table obeys: requires ladder monotonic (10 → 250/400 → 4000/6000/2500 → 1.2e4/3e4 → grove/worldtree gate on stage objects); adjacent-row ratios ×16–×40 (inside ×10–×100, P2); first layer requires 10 (P1 mode); every main layer ≥10 upgrades + ≥3 milestones (canopy/seed 25+6/8, grove 8+5 — grove is the one dense-ritual exception, justified §10); every new layer wires ≥2 older layers (P10 — see gainMult plan per layer); automation in P4 order, one chore per step (§6).

### 4.1 Fun density table

Kinds: K1 flat mult · K2 self-shape · K3 cross-resource · K4 meta on named mechanic/resource · K5 cap & formula play · K6 conditional · K7 unlock · K8 production · K9 state/duration. Quota (medium): K1 ≤ 40%/layer, ≥3 distinct non-K1 kinds per layer, K7 excluded from the K1 count.

| id | content items | effect-kind plan | organization | mechanics used |
|---|---|---|---|---|
| wood | 15u+10m+2c+2b = 29 | u11 K1 ×2 leaf-gen (cost 1 — first boost ≤10 s); u12 K2 leaves.pow(0.5)-shaped wood boost; u13 K3 sources branch; u14 K5 delay wood softcap (visible); u15 K7 unlock branch; c11 K6 "bare branches" (branch gain off); c12 K6 "woodless" (goal on leaves); b11 K1 fert (×leaf-gen/level, wired into root gainMult = cross-layer consumer); b12 K2 growth-rings pow on wood gain (consumed by sap + worldtree) | tab: main-display / prestige-button / ctx-texts / microtabs(Upgrades \| Milestones \| Trials) | M5 via b11, M1 c11/c12, M19-feeding b12 |
| branch | 12u+8m+1b = 21 | u11 K1 ×2 wood gain; u12 K2 cbrt-shape; u13 K3 sources root; u14 K4 named "leaf growth rate" exp +0.02; u15 K7 unlock bark; b11 K1 buds (consumed by wood gainMult) | tab + microtabs(Upgrades \| Milestones) | — |
| root | 12u+8m+1b = 21 | u11 K1 ×2 leaf-gen; u12 K2; u13 K3 sources branch; u14 K4 named "wood density" exp; u15 K7 unlock blossom; b11 K3 mycorrhiza (root amount → point-gen, consumed in mod.js getPointGen) | tab + microtabs | M5-flavored b11 |
| bark | 10u+6m = 16 | u11 K1; u12 K5 raise wood softcap ×10 (visible cap); u13 K5 reduce branch cost scaling; u14 K4 named "bark armor" (leaf-gen ^1.05); u15 K7 unlock sap; u10 K7 canBuyMax reward | tab + microtabs | P5 static floors, author #24 buy-max early |
| blossom | 10u+6m = 16 | u11 K1; u12 K3 each bloom feeds a different older layer (one per: wood/branch/root/sap); u13 K4 named "bloom season" mult; u14 K5 delay blossom-era softcap; u15 K7 unlock canopy | tab + microtabs | P5 static |
| sap | 12u+5m+1b = 18 | u11 K4 named "sap flow" (branch+root gain ^1.1); u12 K4 root gain ^1.1; u13 K5 sap double-softcap raise (visible); u14 K3 sources blossom; u15 K7 unlock canopy; b11 K8 concentrate (consumed by grove plant formula) | tab + microtabs(Upgrades \| Shop \| Milestones) | M8 shop, P53 convergent |
| canopy | 25u+6m+3c = 34 | u-row1 K1 trio; u13 K2; u14 K3; u16 K4 named "photosynthesis" (leaf-gen exp); u20 K5 cap raise; u25 K7 unlock seed; ch11/12/13 = M1 trials (below); m1 K7 unlock Trials microtab | tab + microtabs(Upgrades \| Trials \| Milestones) | **M1 challenge hub** |
| seed | 25u+8m+3c = 36 | K1/K2/K3/K4/K5/K7 mixed across the 5×5; u25 K7 unlock grove; ch21/22/23 = M1 trials; m2 resetsNothing(canopy), m6 THE package, m8 autoBuyable(sap,11) | tab + microtabs(Upgrades \| Trials \| Milestones) | **M1 hub part 2**, P4 package deal |
| grove | 8u+5m = 13 | u11 K9 "each tree pays out over time" (tree-count mult, the K9 state); u12 K4 named "forest floor" exp; u13 K5 plant-cost curve soften (visible); u15 K7 unlock worldtree; display-texts itemize the four burn terms (P42) | tab + itemized burn display + microtabs | **M19 consumable reset** |
| worldtree | 10u+15m = 25 | u11 K4 named "world roots" (ALL gainMult webs ^1.02); u12 K2 growth pow; u15 K5 raise worldtree staged cap; m-chain: K1/K4/K7 mix ending m15 = THE TREE TREE | tab + microtabs | endgame milestone chain (15 steps ≥ 10 per blueprint) |

## 4b. Game-level fun plan (medium quota row)

| Quota (fun-quota.json `medium`) | Planned | Where |
|---|---|---|
| Distinct mechanics M1–M10 (≥4) | **6**: M1 challenges, M5 secondary-currency buyables, M7 custom ritual (grove), M8 shop (sap), M9-adjacent N/A, M10 collection achievements + M15 story | §4.1 |
| Challenge layer (M1 classic OR M2) | **M1 classic** (user-confirmed substitution): 8 challenges — wood 2, canopy 3, seed 3, all `canComplete()` dialect, goals on lower-row resources only (P65-legal variant A) | wood, canopy, seed |
| Clickable group(s) | **WAIVED by type contract** (passive-prestige forbids clickables) — §10 | — |
| Bar(s) | **WAIVED by type contract** (no bars without a tick) — §10 | — |
| Layers with `update()` (≥3) | **0 — WAIVED by type contract** (passive-prestige forbids `update()`; D-NOUPDATE exempt) — §10 | — |
| Secondary currency (M5 ≥1) | sap (custom shop currency, accrues milestone-gated via `passiveGeneration` — the Gaokao-sm shape, no update needed) + grove tree counter | sap, grove |
| Shop/meta layer (M8 ≥1) | sap | sap |
| Custom-type ritual layer (M7) | grove (the plant-a-tree ritual) | grove |
| Story presentation | `stories` side layer, 12 chapters, unlock-gated, own tab | stories |
| Endgame verb (Q8) | M19 consumable reset — grove plant, itemized in UI, selective keeps | grove |
| autoBuyableDrivers (≥1) | 1 + bonus: seed m8 → sap b11; seed-adjacent worldtree m4 → wood b12 re-invoke | §6 |
| K1 share ≤ 40%/layer | planned per §4.1 (hub K1 rows ≤ 3 of 25) | §4.1 |

## 5. Tree sketch

```
row4:                    [grove] [worldtree]
row3:            [canopy]    [seed]
row2:    [bark]   [blossom]   [sap]
row1:        [branch]     [root]
row0:              [wood]
side:  (achievements) (stats) (stories)
```

## 6. Automation ladder (full ladder per branch — medium blueprint; Q6 walls < 15 min)

| Step | Grants (chore that dies) | Granted by | Threshold |
|---|---|---|---|
| 1 | resetsNothing(wood) — wood survives wood-era resets | branch m0 | 50 wood |
| 2 | passiveGeneration(wood) | branch m2 | ~×30 past unlock (7.5e3 wood) |
| 3 | autoPrestige(wood) | root m1 | 60 wood |
| 4 | autoUpgrade(wood) | root m4 | 1.2e3 wood |
| 5 | autoBuyable(wood,12) — closed-form P54 inverse of cost 3×2.5^x | bark m3 | 24 bark |
| 6 | resetsNothing(branch,root) | blossom m1 | 9 blossom |
| 7 | passiveGeneration(branch,root) | sap m1 | 12 sap |
| 8 | autoPrestige(branch,root) | blossom m4 | 25 blossom |
| 9 | autoUpgrade(branch,root) | sap m4 | 60 sap |
| 10 | **THE package**: autoPrestige+autoUpgrade+resetsNothing(bark,blossom,sap) | seed m6 | 30 seed |
| 11 | resetsNothing(canopy) + autoBuyable(sap,11) | seed m2 / m8 | 8 / 70 seed |
| 12 | full-automation package (canopy upgrades + canopy prestige) | worldtree m2 | worldtree m2 |

Achievement alternate path (P11): achievements 21 → passiveGeneration(wood), 34 → autoUpgrade(wood), 45 → resetsNothing(branch,root) — each backfill push guarded `if (hasAchievement(…) && !hasUpgrade/!hasMilestone(…))`. **No two milestones of the same layer claim the same automation grant** (07 conflict-point rule; asserted per-layer above).

## 7. Endgame definition

- `isEndgame()`: `hasMilestone("worldtree", 14)` — the 15th and final World Tree milestone, "THE TREE TREE is grown".
- Reachability estimate: ROW_RATIO = ×25 (requires step, median corpus); OUTPUT_STEP = ×20 (flat per-era multiplier zones, tuned in `js/tuning.js`); per-row time multiplier = 25/20 = **×1.25** (inside ×1.1–×1.6, handbook 11 §4.1). Five eras ≈ first-layer minutes × 1.25⁴ compounding + endgame chain → paper estimate **~12–18 h** (target band 10–30 h). Stage 6 sim owns the real number.
- `winText`: `You have grown THE TREE TREE. Every tree that ever fell became the ground it stands on.` / 中文：`你种出了那棵树中之树。所有倒下的树，都成了它脚下的土。`

## 8. Cap table (per currency)

| Currency | Ceiling? | Cap mechanism | Where |
|---|---|---|---|
| leaves (points) | none | cost-scaling first; layer softcap on wood gain start ≈ branch unlock era, power 0.1 (measured-retune shape), bark u12 raises ×10 — cap visible via live display-text | wood `softcap()`/`softcapPower()` |
| wood | none | softcap start ≈ bark unlock era, power 0.1, raise sold by bark u12 | wood layer softcap |
| branch / root | none | softcap start ≈ row-2 unlock, power 0.1 | branch/root layer softcap |
| sap | none | double softcap inside `getResetGain` (Gaokao-sm), start shown on-Shift | sap getResetGain |
| worldtree growth | none | staged softcap ladder (P45-lite, 2 stages, visible) | worldtree |
| grove trees | integers | floor; no cap | grove getResetGain |

## 9. Self-check results (all 23)

- [x] 1 — requires ladder monotonic; adjacent rows ×16–×40 (P2/A1)
- [x] 2 — first layer requires 10 (P1)
- [x] 3 — every main layer ≥10 upgrades + ≥3 milestones (grove 8u/5m — §10 density note)
- [x] 4 — every new layer boosts ≥2 older layers in gainMult; ≥1 upgrade boosts leaves (P10/A7): wood u11 feeds leaves; branch/root each list wood+leaves lines; row-2 trio each list ≥2 of {leaves, wood, branch, root}; canopy/seed list trio arms; grove/worldtree feed everything
- [x] 5 — automation ladder 12 steps (medium "full ladder per branch"), P4 order, one chore per step (§6; §10 phrasing note)
- [x] 6 — softcap plan for every unbounded loop (§8); no hard caps needed (Q3 none)
- [x] 7 — anti-pattern sweep A1–A10: none (A2 rows contiguous 0–4 ✓; A4 density ✓; A7 web ✓; A8 one-chore-per-step ✓)
- [x] 8 — K1 share ≤40%/layer, ≥3 non-K1 kinds per layer (§4.1)
- [x] 9 — tabFormat on every main layer; microtabs on all layers with ≥3 groups; context display-texts (base, best, softcap warning) above tabs
- [x] 10 — game-level quota met with type-contract waivers logged (§4b/§10)
- [x] 11 — multiplier budget: ≤1 self-scaling upgrade per layer (wood b12 pow ≤0.5 softcapped; Σ self-exponents in any gainMult ≤ 0.6); end-of-row-0 flat-zone product ≈ ×40 ≪ 1e4
- [x] 12 — wiring plan: every upgrade classified in §4.1; every `effect()` has a named consumer (N-UNWIRED = 0 by construction); token/gate upgrades carry no effect()
- [x] 13 — cost ladders span ≥6 orders per layer with ≥1 deliberate drop (wood u13 "深根deeproot" cost 7 amid the 1e4 ladder — the c0v1d rhythm breath); ≥30% pow/log shapes per layer
- [x] 14 — component density 8–30 (canopy 34 / seed 36 — §10 hub-density note, corpus p75=29, ≤40 for 83.7% of real layers); challenges ≤15% of that layer's upgrades (wood 2/15=13%, canopy 3/25=12%, seed 3/25=12%)
- [x] 15 — author pacing: first boost ≤10 s (u11 cost 1); every >1 min reset pays (milestone chain); major reset speeds from second one (plant ×8/tree immediately); no hard resets ever
- [x] 16 — upgrade discipline: one production bonus per upgrade; no upgrade boosts another upgrade's hidden number (K4 targets named formulas/resources only); gates by threshold
- [x] 17 — cost before softcap; only visible caps sold (bark u12 raises a cap the player can see)
- [x] 18 — row pacing: ROW_RATIO ×25 ÷ OUTPUT_STEP ×20 = ×1.25 (both constants named here and in `js/tuning.js`)
- [x] 19 — reset lifecycle: milestones reading best/total keep both in doReset; autoPrestige milestone sets ⊆ resetsNothing sets (steps 3→1, 8→6, 10, 12); no update() anywhere; every static layer (bark, blossom) has canBuyMax()
- [x] 20 — type contract: mandatory modules planned (normal/static layers, upgrades, milestones); forbidden absent (no clickables/grid/update()); modifier dependencies hold; drops logged §2b/§10
- [x] 21 — measurement plan: pacing constants live in `js/tuning.js` (ROW_RATIO, OUTPUT_STEP, softcap starts, plant-formula terms), read by the game AND the simulator; every pacing quantity a callable
- [x] 22 — question ledger complete (S0, Q1–Q8, Q4b type + modifiers all user-answered above)
- [x] 23 — buyable persistence: all 5 buyables have cross-layer consumers (wood b11→root gainMult, wood b12→sap+worldtree, branch b11→wood gainMult, root b11→getPointGen, sap b11→grove formula); autoBuyableDrivers ≥1 (seed m8, closed-form)

## 9.1 Static-warning acceptance (filled at Stage 5)

| Check | Layers | Why accepted (or: fixed — how) |
|---|---|---|
| D-REQRATIO ×1500 (row 0→1) | wood→branch | Accepted: the ratio compares raw numbers in DIFFERENT currencies (10 leaves vs 15,000 wood — wood is a √-compressed currency, so magnitude parity in raw units is meaningless). The real per-row pacing check is the measured timeline (row 0→1 ≈ 15 min, per-row ×1.1–×1.6 ✓). All other adjacent rows are ×1.6–×2 in raw terms. |

## 10. Deviations & open questions

| Default overridden | Value used | Why |
|---|---|---|
| fun-quota medium `clickableGroups ≥1 / bars ≥1 / minUpdateLayers ≥3` | 0 / 0 / 0 | The locked Q4b type **passive-prestige forbids clickables, grid and update()** (type-registry contract; user-confirmed). The type axis is orthogonal to the blueprint and wins on component floors; checker D-MECHQUOTA auto-narrows to challenges-only for this type. M5's secondary currency instead accrues via milestone-gated `passiveGeneration` (Gaokao-sm shape — engine-driven, no tick). |
| Q6 phrasing "full 8-step ladder" | 12 steps | Medium blueprint says "full ladder per branch, cross-layer grants"; 12 steps = the full ladder across two row-1 arms + package deals. Walls still < 15 min (Q6's actual intent). |
| blueprint rowPlan row1 "2–4 branches" with bark/blossom/sap at row 2 | as table | Theme structure (Q1-confirmed): bark/blossom/sap are the *mature-tree* organs (row 2), not seedlings. Row types match blueprint (row2 = 2 static + 1 custom). |
| grove layer 8 upgrades / 5 milestones (< the ≥10u floor) | accepted | Grove is the M19 ritual layer: its content is the itemized burn display + tree economy, not an upgrade wall. Density 13 = above corpus p25 (6). |
| canopy 34 / seed 36 components (> 30 target) | accepted | Challenge-hub layers carry the M1 grid as content; corpus: 83.7% of real layers ≤ 40 components, p75 = 29. Microtabs keep them navigable. |
| idle-first (Q4) does NOT convert row 0 to log-gain | wood stays Normal(0.5) req 10 | P1 is `[required]` and the author's first-reset law (≤1 min) outweighs; idle preference is expressed in rows ≥2 (sap log-based P8b) + the 12-step automation ladder + milestone passiveGeneration. Logged per idleOverride wording. |
| M5 canonical form (update()-produced currency) | milestone-gated passiveGeneration | update() forbidden by type; engine-driven passiveGeneration is the corpus-legal producer for this shape. |
| P4 ladder step 5 (autoBuyable drivers live in `update()`) | `automate()` hooks | passive-prestige forbids update(); the engine-legal driver slot for buyMax actions in this type is `automate()` (used by bark m3 wood buyMax, seed m8 sap Concentrate). Checker-verified. |
| Q2 total-length band 10–30 h | measured 0.89–1.31 h sim (~2.5–4 h human est.) | Five-run Stage-6 journey documented in §11. All content reachable; stretching to 10 h+ needs post-victory content (6th row / second seed loop), not a rebalance. Accepted as the build's honest length. |
| — | — | Numbers noticed while playing enter HERE first (row → tuning.js → sim re-run), never a mid-play literal edit. |

## 11. Stage-6 measured retune (authoritative)

The simulation overturned the paper brief four times. Each finding, root cause and where the constant now lives:

| # | Finding (measured) | Root cause | Fix, and where the constant lives |
|---|---|---|---|
| 1 | Peak income ee50 at 48 sim-hours; endgame unreachable | `TREE_MULT^trees` closed a compounding loop (trees → mult → leaves → plant yield → trees); the plant formula's `log10` peels one exponent level, so once leaves went ee-scale a single plant yielded 1e66 trees | Tree payout linearized: `(trees+1)^1.5 × base` (`TUNING.TREE_PAYOUT`); leaf softcap added (`TUNING.LEAF`), visible on the tree tab |
| 2 | First pass after the fix: 0.18 h total | Worldtree milestone mults sat in `allMult()` and multiplied the very growth that unlocks the next one — self-feeding chain, thresholds only ×2 apart | `allMult(noSelfFeed)` — worldtree's own gainMult skips the wt-milestone block (`js/tuning.js`); thresholds rescaled to ×5+ gaps |
| 3 | 0.30–0.42 h; rows 1–3 in minutes; `requires` gating nothing on row 3 | Row-3 custom layers' `getResetGain` carried a trailing `.add(1)`: resetGain ≥ 1 at ANY amount, so canopy/seed were free. Also measured per-era output ran ~×1000 vs requires steps of ×10–100 | Removed `.add(1)` from sap/canopy/seed gains (offsets / count-polynomials gate instead); canopy/seed rewritten as count-based polynomials (`TUNING.CANOPY/SEED.req` on blossom count / light count); all flat multipliers halved in one positional pass (`tools/flatten-mults.js`) |
| 4 | 124–173 h (DID NOT REACH); blossom frozen at count 20 | Static-count starvation: a static layer's reachable count ≈ log_base(currency/requires) ≈ 5–20, but thresholds were written for counts of 40–70 (bark m5 = 70 floors, canopy req 40 blossoms) — structurally unreachable. Harness gap found the same round: sim's passive-gen wrote `points` without `best`/`total`, so best-scored milestones never fired | Every static-count-domain number moved into the reachable band: bark requires 25k (counts to 18), blossom 30k (counts to 14), canopy req = 14 blossoms, seed req = 25 light, static costs/milestones rescaled (`tools/retune-statics.js` + `tools/repair-damage.js`, positional — see below); `tools/simulate.js` patched to mirror the engine's `addPoints` (best/total maintained) |
| 5 | Final form: 0.89 / 0.91 / 1.31 h across dt 0.5 / 1 / 2 (±20% spread) | leaf softcap power swept: 0.1 starved the static count-domain downstream, 0.35 collapsed the ladder | `TUNING.LEAF.power = 0.2`; requires ×3 (final set: wood 10, branch 15k, root 30k, bark 25k, blossom 30k, sap 3M; bark base 2 / blossom base 3 kept) |
| 6 | Browser round caught the worldtree gate: on a FRESH boot the World Tree grew from tick 0 (its `passiveGeneration()` returned 1 unconditionally and the engine applies passive gen to LOCKED layers — game.js:352/361), firing m0–m7 within the first seconds and boosting the whole early game ×13.5+ | The engine has no unlock gate on passiveGeneration; the sim inherited the same leak (its passive-gen calls the layer hook), so Stage 6 could not see it | `passiveGeneration()` gated on `player.grove.best.gte(1)` (the crown wakes when the first tree is planted — same condition as `layerShown`). Re-measured after the fix: 0.89 / 0.91 / 1.31 h — **pacing-neutral** on the greedy path (the leak's mults barely moved the greedy timeline) but now honest for real players |

Retune discipline note: two early retune passes used sequential string-replace cascades (×10→×5→×3) and one anchor-adjacent setter that hit the number *after* its anchor — corrupting `base`/`exponent`/challenge-goal fields. Both were caught by a re-audit probe (printing requires/bases/costs/milestones back from source) and repaired positionally (`tools/repair-damage.js`); every later retune sets numbers absolutely by id-anchor. Lesson recorded in the handoff.

Measured timeline (greedy, `--click 1`): first purchase 2 s; first prestige per layer: wood 3.5 s, branch 918 s, root 938 s, bark 1031 s, blossom 1086 s, sap 1320 s, canopy 2951 s, seed 3006 s, grove 3138 s; **total to `isEndgame()`: 0.89 h (dt 0.5) / 0.91 h (dt 1) / 1.31 h (dt 2)**; 85/140 upgrades, 74/78 milestones reached (totals re-counted authoritatively at Stage 6 close via `tools/count-content.js`: 140 upgrades — the sim's own denominator of 141 over-counted by one). Sim exclusions = the bias: challenge rewards, achievement effects, trial completions, human dithering/reading — with human pacing (~×2.5–3) the real first playthrough lands ≈ 2.5–4 h, **below the Q2 10–30 h band**. Accepted and documented: all 140 upgrades / 78 milestones / 8 trials / 50 achievements are reachable at this pace; stretching to 10 h+ would need another era of content (a 6th row or a second seed-generation loop), which is post-victory territory, not a rebalance. Logged as the build's honest measured length.

## 12. Browser-verification fixes (Stage 6.5)

Method: `node tools/serve.js` (no-store) + a driven browser — fresh boot, then a sim-dumped deep save (`--save-at worldtree` → `tools/save-at-worldtree.js`, injected as `localStorage.setItem(id, b64); location.reload()` in ONE synchronous step — the engine's `onbeforeunload` checks `player.autosave` (undefined) so it never re-saves on unload, and the 5 s autosave cannot interleave inside a synchronous task). Interaction rule learned the hard way: TMT re-renders every frame and button text changes move the layout, so scripted coordinate clicks race the DOM — dispatch the click on the element itself (same Vue `v-on:click` chain) after reading state.

| # | Symptom | Root cause | Fix |
|---|---|---|---|
| 1 | Fresh boot: uncaught `tmp.sap.resetGain.add is not a function` — load aborted mid-`updateTemp`, `tmp[*].resetGain` stayed `{}` forever | `updateTempData` EAGERLY calls every non-exempt layer function (`temp.js:133-137`) — including custom layers' `getNextAt`/`canReset` — BEFORE `tmp[layer].resetGain` exists (still the `{}` from `setupTemp`). The engine's `activeFunctions` exemption list doesn't cover these names | Added `getNextAt`, `canReset` (and `prestigeButtonText`, see #2) to `mod.js` `doNotCallTheseFunctionsEveryTick` — the engine's official extension point (`temp.js:17-20` merges it into `activeFunctions`). Per-tick wrappers still call the hooks properly at `updateTemp:102-105` |
| 2 | Second boot error in the same class: `g.lt is not a function` at `layers-row4.js` prestigeButtonText | Same eager-call window: grove's `prestigeButtonText` calls `.lt` on `tmp.grove.resetGain` = `{}`. The other layers' buttons only `format()` it — tolerated | Same fix (#1). `displays.js:2-3` calls `layers[layer].prestigeButtonText()` directly at render, so nothing consumes the tmp-cached value |
| 3 | Fresh boot granted 8 worldtree milestones and ×13.5 all-mult before any player action | See §11 #6 — ungated `passiveGeneration` on a locked layer | Gated on `player.grove.best.gte(1)` |
| 4 | Grove PLANT ceremony added trees but NEVER reset the standing tree (leaves/wood/canopy all survived) — the Q8 consumable reset was inert | grove had `resetsNothing() { return true }` (comment misread it as "nothing above the grove"); the engine's `doReset` returns BEFORE touching lower layers when it is true (game.js:211) | `resetsNothing() { return false }` with an explanatory comment. Verified in-browser: plant now zeroes leaves→10, wood/blossom/canopy/seed/sap→0, keeps bests/upgrades (grove m2 keeps), grove 18→29, worldtree untouched |
| 5 | All 5 buyables (wood 11/12, branch 11, root 11, sap 11) were UNBUYABLE — defined, wired into formulas, automated by bark m3 / seed m8, but no microtab ever rendered "buyables" | Every layer's microtab content listed only `upgrades`/`milestones`/`challenges` | "buyables" added to wood/branch/root Growth and sap Shop microtabs (above upgrades). Verified: Growth Rings renders (level/effect/cost), Fertilizer bought via real click — 0→1, exactly 3 wood paid, effect ×1.6 live |
| 6 | 89 EN strings said the pre-flatten multipliers (×2/×3/×5/×10, "Double/Triple") while code + ZH said the flattened ×1.5/×2/×3/×5 | The §11 #3 flatten pass rewrote code and ZH text but missed the EN strings | `tools/fix-en-mults.js`: map-based EN re-sync ({2→1.5, 3→2, 5→3, 10→5}) where the tt() EN/ZH pair fits, 1 manual line (canopy u54), 9 word-based lines ("Double your…"→"×1.5"), 1 earlier manual fix (wood u11). Residue scan: 0 |

Verification log (all zero console errors): fresh boot clean → wood first prestige (real click, 544 leaves → 15 wood, best/total booked, "First Press" achievement toast) → wood u11 bought → language toggle EN↔ZH with `localStorage` persistence → 11 remaining layer tabs + side tabs opened → deep-save injection → grove PLANT (fix #4 verified) → canopy Drought trial enter (leaves reset, warning banner "A light trial is in progress") → finish (completions 0/1→1/1, reward live) → bark static prestige 0→26 floors (buyMax gain) → wood buyable purchase (fix #5 verified) → sap prestige (auto-collected via seed m6 automation, 6.8e10) → deep save→reload round-trip (grove 39 / bark 26 / wtMs 13 / ach 37 / wood 27 upgrades all preserved). Post-fix suite: static checks 97 PASS / 1 accepted WARN / 0 FAIL; smoke 0 FAIL; sim re-run 0.89 / 0.91 / 1.31 h — unchanged.

Feel proxies, per layer (observations, not a tuning signal):

| Layer | First press (s) | Clicks to first upgrade | Next action named on screen? |
|---|---|---|---|
| wood | 3.5 (sim) / seconds (browser) | 1 (u11 affordable at first press) | ✓ "Press X leaves into Y Wood"; milestone box visible in-tab |
| branch / root | ~15 min | 1 after first wood chain | ✓ "Sprout X Branches" / "Grow X Roots"; softcap banner on wood |
| bark / blossom | ~17-18 min | 1 (costs 1-2 floors) | ✓ req line on node tooltip + button text |
| sap | ~22 min | 1 | ✓ "Draw X Sap (resets the wood below)" |
| canopy / seed | ~49-50 min | 1 | ✓ "Gather X Light (resets the mature tree)" / trial cards with goals+rewards |
| grove | ~52 min | n/a (ritual) | ✓ "PLANT: burn the tree, grow X new tree(s)" + itemized burn terms |
| worldtree | passive | n/a | ✓ "It grows by itself: +X/s" |
| | | | |

Final gates: static ___ PASS / ___ WARN / 0 FAIL (every WARN has a §9.1 row); i18n ___; smoke ___; measured lower bound ___ h.
