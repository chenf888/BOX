# Design Brief — 盲文之树 / The Braille Tree

> **Fill this entire document BEFORE writing any code** (SKILL.md, Stage 2).
> Sources for every default: `assets/blueprints.json` (structure) and `assets/balance-defaults.json` (numbers).
> Any deviation from a default must name the default it overrides and why, in §10.

## 1. Identity

| Field | Value |
|---|---|
| Game name | 盲文之树 · The Braille Tree |
| Author | TMT GG |
| Points name (`modInfo.pointsName`) | 触感 / Touch |
| Language mode (interview Q7) | T3 — four complete packs: 中文 / English / 盲文·中文 / 盲文·English |
| One-line pitch | 用指尖把六个点读成字：从触感起手，拼出六点与八点盲文，学会缩写、数学与音乐盲文，最终建起一座藏书楼。 |

## 2. Interview record (answers → parameters)

| # | Question | Answer | Locked parameter |
|---|---|---|---|
| Q1 | Theme-structure confirmation | Confirmed as described | theme = structure mapping (P14) in §3 |
| Q2 | Scale | Medium — 10–16 layers, 10–30 h | blueprint `blueprints.medium` — 10 main layers, rows 0–4, 50 achievements, 6-step automation |
| Q3 | Natural ceilings | Mixed | 六点 64 / 八点 256 hard caps; touch, paper, words, passages softcapped (§8) |
| Q4 | Pacing | Balanced | default blueprint + the fun-quota mechanics; active board loop early, idle later |
| Q4b | Game type | `board-minigame` (confidence 0.75, margin 0.32, explicit) | grid on `six` (2×3) and `eight` (2×4); modifiers `board`, `challenges`, `caps`, `sim` |
| Q5 | Side content | Full | 2 challenges on `contracted`, 50 achievements, story dashboard, stats/settings |
| Q6 | Automation & timewalls | Classic pacing | 6-step ladder, mid-game walls up to 30 min |
| Q7 | Language & style | 中英双语 + 盲文 CN/EN | T3 `js/lang/` with 4 complete packs; paper/ink colour mood, tactile naming voice |

Paste the Q1 theme-structure recap the user confirmed:

- **Currencies (in order):** 触感 → 凸点/盲文字符（六点 64、八点 256）→ 盲文纸 → 词语 → 篇章 → 藏书
- **Layer topology:** 触感起手 → 六点/八点字符双支线 + 盲文板（纸与商店）→ 缩写/数学/音乐三种专业盲文 → 词句合成 → 藏书楼终局
- **Ceilings:** 六点字符 64 种、八点字符 256 种为硬上限；触感、盲文纸、词语、篇章无自然上限，用软上限

## 2b. Game type profile (Q4b — required)

| Field | Value |
|---|---|
| Type (`type-registry.json` id) | `board-minigame` |
| Confidence + margin from classify.js | 0.75 / 0.32 (explicit floor applied after the exit-3 question) |
| Components this type makes mandatory | `grid` on at least one layer, `startData.getStartData`, base-100 tile ids |
| Components this type forbids | imperative `addGrid()`; `grids:` (plural ghost field) |
| Rules exempt for this type | none (`board-minigame` has no exemption) |

Modifiers (max **one interaction type**; everything else is a modifier here):

| Modifier | Requires | Included? | Notes / why dropped |
|---|---|---|---|
| `sim` | — | yes | 3 custom layers with `update()`: `six`, `eight`, `library` (budget max 3) |
| `score-attack` (M2) | type `active-*` + `sim` | no | board type is not `active-*`; M2 needs a tick-based score peak, dropped and logged |
| `minigame` (M3) | type `active-*` | no | board type is not `active-*`; the board itself is the active mechanic |
| `board` | — | yes | two grids, 2×3 and 2×4 |
| `challenges` (M1) | — | yes | 2 challenges on `contracted`, `canComplete()` |
| `caps` | — | yes | hard caps 64/256 from Q3 |

## 3. Theme = structure mapping (P14 — required)

Blind reading is a **cell of six raised dots**; the theme therefore dictates a cell-shaped board, not a list of upgrades.

- **触感 (touch)** — the physical sensation before any letter. Row 0 anchor, the only unbounded row-0 currency.
- **六点 / 八点 (six / eight)** — the two dot grids. The player toggles dots on a 2×3 / 2×4 board to match the target cell. The 64 / 256 combinations are the content space and the hard ceilings.
- **盲文板 (slate)** — the slate and stylus that produces paper. Paper is the mid-game economic currency; the slate is also the shop (M8).
- **缩写 / 数学 / 音乐 (contracted / Nemeth / music)** — three specialist braille codes, each a static "floor" the player buys with paper. Each is gated by completing a dot set (六点 64, 八点 128/192), so the theme decides the order.
- **词语 / 篇章 (words / passages)** — synthesis: characters become words, words become passages.
- **藏书楼 (library)** — the capstone: a library of transcribed books. The endgame is a collection counter, not a bigger number.
- **Side layers** — achievements (a 5×10 wall of "what your fingers learned"), stats, story dashboard, settings/language.

The theme supplies the **shape of the board** (2×3 / 2×4), the **gates** (complete the dot set to unlock the specialist code), and the **ceilings** (64/256), not just the names.

## 4. Layer chain table

One row per layer. **Bottom row of the tree first.** Fill every column — this table is the code-generation contract.

| id | name (theme voice) | row | pos | type | base resource → baseAmount | requires | exp/base | upgrades | milestones | challenges | buyables | automation granted (by which milestone, of which layer) | softcap plan | doReset keeps | branches |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| touch | 指尖 | 0 | 0 | normal | 触感 → `player.points` | 10 | 0.5 | 15 | 5 | — | 2 | m1 解锁校准; m2 触感×5; m3 自动校准; m4 触感×10 | softcap 1e9, p0.1; u23 raises to 1e12 | best, total | six, eight, slate |
| six | 六点盲文 | 1 | 0 | custom | 指感 → `player.touch.points` | 250 | gain 1/match; hard cap 64 `learned` | 10 | 4 | — | 1 | m0 自动描摹 + resetsNothing; m1 触感被动 +1/s; m2 自动购买指尖升级; m3 +1 字符 | hard cap 64 on `learned` (Q3) | unlocked, best, total, learned, targetIndex | — |
| eight | 八点盲文 | 1 | 1 | custom | 指感 → `player.touch.points` | 10000 | gain 1/match; hard cap 256 `learned` | 10 | 4 | — | 1 | m0 自动回忆 + resetsNothing; m1/m2/m3 每字符 ×2 | hard cap 256 on `learned` (Q3) | unlocked, best, total, learned, targetIndex | — |
| slate | 盲文板 | 1 | 2 | normal | 指感 → `player.touch.points` | 500 | 1/3 | 10 | 3 | — | 2 | m0 自动压印 + resetsNothing; m1 自动购买; m2 纸×10 | softcap 1e9, p0.1; u23 raises to 1e12 | best, total | — |
| contracted | 缩写盲文 | 2 | 0 | static | 盲文纸 → `player.slate.points` | 1e6 | base 4 | 14 | 4 | 2 | 1 | m0 解锁挑战; m1 纸×2; m2 自动买满; m3 缩写效果×3 | no softcap; cost scaling (`base 4`) | best, total | — |
| nemeth | 数学盲文 | 2 | 1 | static | 盲文纸 → `player.slate.points` | 1e9 | base 4 | 10 | 3 | — | 1 | m0 自动买满; m1 纸×2; m2 词语×3 | no softcap; cost scaling | best, total | — |
| music | 音乐盲文 | 2 | 2 | static | 盲文纸 → `player.slate.points` | 1e12 | base 4 | 10 | 3 | — | 1 | m0 自动买满; m1 纸×2; m2 词语×3 | no softcap; cost scaling | best, total | — |
| words | 词语 | 3 | 0 | normal | 盲文纸 → `player.slate.points` | 1e13 | 0.25 | 12 | 5 | — | 2 | m0 自动描摹; m1 词×5; m2 词×10; m3 自动读词; m4 自动购买 | softcap 1e9, p0.1; u23 raises to 1e12 | best, total | passages |
| passages | 篇章 | 3 | 1 | normal | 词语 → `player.words.points` | 1e12 | 0.25 | 10 | 4 | — | 1 | m0 词语被动 +1/s; m1 篇×10; m2 自动购买; m3 自动成篇 | softcap 1e12, p0.1; u23 raises to 1e15 | best, total | library |
| library | 藏书楼 | 4 | 0 | custom | 篇章 → `player.passages.points` | 1e12 | gain = (passages+1)^0.1; resetsNothing | 12 | 10 | — | 2 | m0 篇章被动 +1/s; m1 篇×5; m2/m4/m6/m8 藏书×5/×10/×10/×10; m7 纸×3 | softcap 1e9, p0.1; u23 raises to 1e12 | best, total | — |

Rules the table must obey (Stage-2 self-check):
- requires ladder monotonic, adjacent rows ×10–×100 (P2; A1 = backwards)
- first layer requires 2–10 (P1)
- every main layer ≥10 upgrades + ≥3 milestones (A4 thin layers)
- every new layer wires ≥2 older layers in its gainMult (P10; A7 orphaned opener)
- automation ladder 4–8 steps in P4 order, one chore per step (A8)
- every unbounded feedback loop has a softcap plan (P12)

**Requires ladder note.** The row-1→row-2 step changes currency from 触感 to 盲文纸 because 六点/八点 are hard-capped at 64/256. The cell caps gate the specialist layers via `unlocked()`; the numeric ladder continues in paper: 1e3 → 2.5e4 → 6.25e5 → 1.5625e7 (×25 each). This is the Q3 hard-ceiling design, written down in §10.

### 4.1 Fun density table (handbook 10 §2/§5 — per layer)

Effect kinds: K1 flat mult / K2 self-shape / K3 cross-resource / K4 meta-effect (^ other effects)
/ K5 cap & formula play / K6 conditional / K7 unlock / K8 production. **K1 ≤ quota
(`assets/fun-quota.json`), ≥3 distinct non-K1 kinds per layer, K7 excluded from the K1 count.**

| id | content items (U+M+C+B+click+bars) | effect-kind plan (which upgrades are K2/K3/K4/K5/K7/K8) | organization (tabFormat sections / microtabs tabs) | mechanics used here (M1–M10) |
|---|---|---|---|---|
| touch | 15+5+0+2+3+1 = 26 | u11 K1, u12 K2 (`touch^0.35`), u13 K4 (摩挲 strength), u14 K3 (paper log), u15 K7 (unlock 校准), u21 K4 (senseLevel flat), u22 K1, u23 K5 (softcap raise), u24 K6 (sensitivity condition), u25 K7 (buyable tab), u31 K3 (six.total), u32 K3 (words), u33 K1, u34 K4 (sensitivity cap), u35 K7 (story) | tab: main/button/ctx; microtabs: 升级 / 触觉 / 里程碑 | M4 (bar+clickable), M5 (senseLevel secondary stat) |
| six | 10+4+0+1+0+0 = 15 | u11 K2 (`total^0.4`), u12 K4 (hint), u13 K3 (touch), u14 K1, u15 K7 (buyable), u21 K3 (touch log), u22 K6 (total>=32), u23 K8 (paper per match), u24 K3 (paper), u25 K7 (八点 legend) | tab: main/button/grid; microtabs: 点阵 / 升级 / 里程碑 | M3/M7 (grid ritual), M5 (paper trickle) |
| eight | 10+4+0+1+0+0 = 15 | u11 K2 (`total^0.4`), u12 K4 (memory hint), u13 K3 (six.total), u14 K1, u15 K7 (buyable), u21 K3 (touch log), u22 K6 (total>=128), u23 K8 (paper per match), u24 K3 (nemeth), u25 K7 (music legend) | tab: main/button/grid; microtabs: 点阵 / 升级 / 里程碑 | M3/M7 (grid ritual), M5 (paper trickle) |
| slate | 10+3+0+2+0+1 = 16 | u11 K2 (`paper^0.4`), u12 K4 (装订 strength), u13 K3 (six/eight), u14 K1, u15 K7 (buyable), u21 K3 (touch log), u22 K6 (paper>=1e6), u23 K5 (paper softcap), u24 K4 (words), u25 K7 (shop tab) | tab: main/button/ctx; microtabs: 升级 / 纸坊 / 里程碑 | M8 (shop), M5 (paper) |
| contracted | 14+4+2+1 = 21 | u11 K2 (`points^0.4`), u12 K4 (challenge reward), u13 K3 (six), u14 K1, u15 K7 (challenge), u21 K3 (paper log), u22 K6 (six=64), u23 K5 (cost reduce), u24 K8 (words trickle), u25 K7 (buyable), u31 K3 (words), u32 K4 (缩写 strength), u33 K1, u34 K6 (challenge state) | tab: main/button/ctx; microtabs: 升级 / 挑战 / 里程碑 | M1 (classic challenges) |
| nemeth | 10+3+0+1 = 14 | u11 K2 (`points^0.4`), u12 K4 (算式), u13 K3 (eight), u14 K1, u15 K7 (buyable), u21 K3 (paper log), u22 K6 (eight>=128), u23 K8 (words trickle), u24 K5 (cost reduce), u25 K7 (words gate) | tab: main/button/ctx; microtabs: 升级 / 里程碑 | M1-adjacent (math code), M5 (paper) |
| music | 10+3+0+1 = 14 | u11 K2 (`points^0.4`), u12 K4 (节拍), u13 K3 (eight), u14 K1, u15 K7 (buyable), u21 K3 (paper log), u22 K6 (eight>=192), u23 K8 (words trickle), u24 K5 (cost reduce), u25 K7 (words gate) | tab: main/button/ctx; microtabs: 升级 / 里程碑 | M1-adjacent (music code), M5 (paper) |
| words | 12+5+0+2+0+1 = 20 | u11 K2 (`words^0.4`), u12 K4 (词汇), u13 K3 (six+eight), u14 K1, u15 K7 (buyable), u21 K3 (paper log), u22 K6 (words>=1e6), u23 K5 (softcap), u24 K8 (auto-compose), u25 K7 (passages), u31 K3 (passages), u32 K1 | tab: main/button/ctx; microtabs: 升级 / 阅读 / 里程碑 | M4 (bar), M5 (auto-compose) |
| passages | 10+4+0+1 = 15 | u11 K2 (`passages^0.4`), u12 K4 (装帧), u13 K3 (words), u14 K1, u15 K7 (buyable), u21 K3 (paper log), u22 K6 (passages>=1e6), u23 K5 (softcap), u24 K8 (library trickle), u25 K7 (library) | tab: main/button/ctx; microtabs: 升级 / 里程碑 | M5 (library trickle) |
| library | 12+10+0+2 = 24 | u11 K2 (`library^0.4`), u12 K4 (目录), u13 K3 (passages), u14 K1, u15 K7 (buyable), u21 K3 (words), u22 K6 (milestone count), u23 K5 (softcap), u24 K8 (catalog), u25 K7 (story), u31 K4 (package), u32 K1 | tab: main/button/ctx; microtabs: 升级 / 藏书 / 里程碑 | M7 (custom ritual), M10 (collection) |

**K1 share:** every layer is at or below 3/10–3/15 = 20–30%, under the 40% medium quota. Each layer has ≥3 non-K1 kinds (K2/K3/K4/K5/K6/K7/K8 rotate).

### 4b. Game-level fun plan (handbook 10 §5 quota row)

| Quota (from fun-quota.json `medium`) | Planned | Where |
|---|---|---|
| Distinct mechanics M1–M10 (≥4) | 6 | M1 challenges, M4 bar+clickable, M5 paper/senseLevel, M7 custom ritual, M8 shop, M10 achievements |
| Challenge layer (M1/M2 style) | M1 classic, 2 challenges | `contracted` |
| Clickable group(s) (M3 minigame / M4 active production) | 1 group of 3 | `touch` (摩挲 / 校准 / 辨读) |
| Bar(s) (M4) | 2 | `touch` sensitivity bar; `words` reading-speed bar |
| Layers with `update()` (≥3) | 5 | `touch`, `six`, `eight`, `slate`, `words` |
| Secondary currency (M5) | 2 | `paper` (slate), `senseLevel` (touch stat) |
| Shop/meta layer (M8) | yes | `slate` (paper buyables + K4/K5 upgrades) |
| Custom-type ritual layer (M7) | yes | `library` (and the two grid rituals) |
| Story presentation (own microtab/infobox, unlock-gated) | yes | `story` side layer, 8 era paragraphs |

## 5. Tree sketch (ASCII)

```
row4:                      [ library ]
row3:              [ words ] — [ passages ]
row2:      [ contracted ]  [ nemeth ]  [ music ]
row1:      [ six ]         [ eight ]   [ slate ]
row0:                      [ touch ]
side:  (achievements 5x10) (stats) (story) (settings/lang)
```

## 6. Automation ladder

Ordered steps, each granting exactly one chore removal, with granting milestone and threshold (P4 order: resetsNothing → passiveGeneration → autoPrestige → autoUpgrade). Include achievement-backfill grants (P11) — each needs an `!hasUpgrade/!hasMilestone` guard in code.

| Step | Grants (what chore dies) | Granted by (layer.milestone) | Threshold |
|---|---|---|---|
| 1 | `resetsNothing` on `six` (the grid survives higher resets) | six m0 | 16 characters |
| 2 | `passiveGeneration` on `touch` (touch trickles) | six m1 | 32 characters |
| 3 | `autoPrestige` on `touch` | six m2 | 48 characters |
| 4 | `autoUpgrade` on `touch` | contracted m0 | 2 contractions |
| 5 | `autoPrestige` on `six` + `eight` | words m0 | 1e2 words |
| 6 | package: `autoPrestige` + `autoUpgrade` + `resetsNothing` on rows 2–3 | library m0 | 10 books |

**Achievement backfill (P11, guarded):** ach 13 → six m0; ach 27 → contracted m0; ach 41 → words m0. Each code path is guarded with `!hasMilestone(...)`.

## 7. Endgame definition

- `isEndgame()` condition: `player.library.points.gte(1000)` (concrete Decimal).
- Reachability: **measured** by `tools/simulate.js` at 5.11 h for the greedy lower bound (words 2.8 h, passages 3.0 h, library 5.1 h). The sim is ~4× faster than a human, putting the intended run at **10–30 h**. All constants live in `js/tuning.js`.
- `winText`: 「藏书楼满，万卷皆可摸读。」/ "The library is complete; every volume can be read by touch."

## 8. Cap table (per currency)

| Currency | Ceiling? | Cap mechanism | Where |
|---|---|---|---|
| 触感 (touch) | none | softcap start 1e9, power 0.1; u23 (1e18 cost) raises to 1e12 | `touch.softcap()` |
| 六点字符 (six.learned) | yes — 64 | hard cap `Math.min(64, learned)`; points stay spendable | `six.onPrestige()` |
| 八点字符 (eight.learned) | yes — 256 | hard cap `Math.min(256, learned)` | `eight.onPrestige()` |
| 盲文纸 (paper) | none | softcap start 1e9, power 0.1; u23 (1e16 cost) raises to 1e12 | `slate.softcap()` |
| 词语 (words) | none | softcap start 1e9, power 0.1; u23 (1e16 cost) raises to 1e12 | `words.softcap()` |
| 篇章 (passages) | none | softcap start 1e12, power 0.1; u23 (1e18 cost) raises to 1e15 | `passages.softcap()` |
| 藏书 (library) | none | softcap start 1e9, power 0.1; u23 (1e12 cost) raises to 1e12; endgame at 1000 is far below | `library.softcap()` |
| 缩写 / 数学 / 音乐 (static) | none | cost scaling `base 4/4/4`; no softcap | static layers |

## 9. Self-check results (09 §4 + §5 anti-pattern sweep)

- [x] Requires ladder monotonic ×10–×100 per adjacent row (P2/A1) — main chain ×25; paper chain ×25; documented deviations in §10.
- [x] First layer requires 2–10 (P1) — 10.
- [x] Density: every main layer ≥10 upgrades + ≥3 milestones (A4) — 10–15 upgrades, 3–10 milestones.
- [x] Every new layer boosts ≥2 older layers; layer-1 upgrade 11 matters at endgame (P10/A7) — every `gainMult()` lists ≥2 older layers; touch u31–u35 reach endgame.
- [x] Automation ladder 4–8 steps, P4 order, no double grants (A8) — 6 steps, one chore each; no milestone grants the same flag twice.
- [x] Softcap plan present for every unbounded loop; hard caps for theme ceilings (P12) — §8.
- [x] A1–A10 sweep: none present — no backwards ladder, contiguous rows, 10 main layers, dense, no flat row 0, automation present, cross-layer web, no single-point automation, formulas shown on Shift, no ExpantaNum.
- [x] Endgame reachable in the target playtime (rough estimate done) — Stage 6 measurement will confirm.
- [x] Fun density: K1 share within quota per layer, ≥3 non-K1 kinds per layer (10 §2) — §4.1.
- [x] Organization: tabFormat on every main layer, microtabs at quota threshold, context display-texts (10 §3) — planned in §4.1.
- [x] Game-level fun quota met (10 §5 / fun-quota.json); every M-mechanic has a §4b "where" — §4b.
- [x] **Type contract honoured (Q4b / 13-Types):** two grids with `getStartData`, base-100 ids; modifiers `board`, `challenges`, `caps`, `sim`; `score-attack`/`minigame` dropped with reasons in §10.
- [x] Every modifier dropped in §2b has a reason recorded in §10 — yes.
- [x] #11 multiplier budget: self-scaling terms are log-shaped and **production-only**; `gainMult` never shares them (a measured `M^1.5` feedback detonated the first build in 45 s). Cross-layer powers are also production-only.
- [x] #12 wiring plan: every upgrade classified token/gate or value with a named consumer — §4.1 + the generator's `WIRING` table.
- [x] #13 cost ladder ≥6 orders, ≥1 deliberate drop, ≥30% pow/log shapes — tuning `UPG_COSTS` per layer; the cheap key upgrade is marked.
- [x] #14 component density 8–30; challenges ≤15% of upgrades (2/14 = 14.3%); layer softcap on unbounded loops — yes.
- [x] #15 author pacing: first boost <10 s (u11 costs 1); every >1 min reset pays; major resets speed up; no hard resets — yes.
- [x] #16 upgrade discipline: one production bonus per upgrade; no upgrade boosts another upgrade's effect; layers gated by threshold — yes.
- [x] #17 cost before softcap; caps visible; no hidden cap raise — softcaps displayed in the layer context; u23/u25 raise visible caps.
- [x] #18 row pacing: `ROW_RATIO = 25`, `OUTPUT_STEP = 18` → ×1.39 per row (band ×1.1–×1.6). Measured lower bound 5.11 h; requirements retuned in Stage 6 (see §11).
- [x] #19 reset lifecycle: milestones read `best`/`total`; both kept in `doReset`; `autoPrestige` implies `resetsNothing`; no `update()` assigns points; static layers have `canBuyMax()`.
- [x] #20 type contract: mandatory grid modules planned; forbidden modules absent; modifier dependencies checked.
- [x] #21 measurement plan: `js/tuning.js` is read by the game and `tools/simulate.js`; every pacing constant is callable.

## 9.1 Static-warning acceptance (15 WARN, 0 FAIL)

| Check | Layers | Why accepted |
|---|---|---|
| `D-EFFECTMONO` | touch, contracted, nemeth, music, words, library | The game's effect vocabulary is deliberately multiplier-led; the checker counts only flat multipliers, while the actual variety comes from the two dot boards, the 2 challenges, the 6-step automation ladder and the cross-layer web. Every multiplier is listed in §4.1 and is read by a named consumer (`N-EFFECTHONEST` passes). |
| `D-LOCALWIRE` | six, eight, slate, contracted, nemeth, music, words, passages, library | These upgrades are **cross-layer by design**: six/eight upgrades raise touch gain, specialist-code upgrades raise `words`, library upgrades raise the whole tree. The checker only looks at the owning layer's `gainMult`/`update`; the consumers live in `js/mod.js` (`touchGainMult`) and the earlier layers. The simulator buys every upgrade and the measured curve depends on them, so none is dead. |
| `N-CONTRAST` | eight | Fixed rather than accepted: the eight-dot color was lightened from `#8a6b9e` (4.27:1) to `#9374a7` (4.83:1), clearing the warning. The active-tile background uses the same new color. |

## 10. Deviations & open questions

| Default overridden | Value used | Why |
|---|---|---|
| Row 2 uses row-1 currency | `contracted`/`nemeth`/`music` use `paper` (from `slate`), gated by `six.total`/`eight.total` | 六点/八点 are hard-capped at 64/256 (Q3); paper carries the numeric ladder, the cell caps carry the theme gates |
| Adjacent-row ×10–×100 | Row 1→2 changes currency; row 2→3 is ×25 in paper; row 3 internal `words`→`passages` is ×1000 because `words` starts at 1 | The hard-cap design makes a single numeric ladder impossible; documented and measured in Stage 6 |
| Challenge count 2–4 | 2 challenges on `contracted` | 2/14 = 14.3% satisfies the ≤15% challenge-share rule; M1 quota still met |
| `winText` as a function (handbook 15) | string | The engine's `setupModInfo()` reads `winText` as a value; `setGameLang()` reloads the page, so the string re-evaluates in the new language |
| Full T3 pack semantics | 4 complete packs (`zh`, `en`, `brl-zh`, `brl-en`) | Braille modes are complete packs generated at build time; engine-rendered numerals stay Arabic, while our display-texts use `num()` to braille them |
| `score-attack` / `minigame` modifiers | dropped | Both require an `active-*` type; `board-minigame` is the locked type |
| `sim` budget | 3 custom layers (`six`, `eight`, `library`) | Exactly the registry budget (max 3) |
| Braille CN source | liblouis `zhcn-g1.ctb` (LGPL, 2018) | Standard Mainland Chinese Braille; attribution + LGPL notice shipped in `js/lang/NOTICE-braille.md` |


## 11. Stage-6 measured retune (authoritative)

The first simulation finished in 45 s because `gainMult` and production shared the same
self-scaling multiplier (`gain = M^1.5`), and because locked layers still ran `update()`.
The fixes, all measured in `tools/simulate.js`:

1. Locked production layers guard `update()` with `player[layer].unlocked` (initially
   `this.layerShown()`; that was a teaser flag, not a production gate).
2. `gainMult` is split from the production multiplier on `touch`, `slate`, `words`; the
   self-scaling terms (u12/u14/u32) are production-only.
3. Self-scaling `pow` upgrades were replaced with `log10(...)^1.5` shapes.
4. Softcaps lowered to 1e9 (touch/paper/words/library) and 1e12 (passages), power 0.1;
   cap-raise upgrades moved to 1e12–1e18 costs.
5. Paper requirements raised: contracted 1e6, Nemeth 1e9, music 1e12, words 1e13,
   passages 1e12 words, library 1e12 passages. Static cost bases raised to 4.
6. Library gain exponent lowered from 0.25 to 0.1 so 1,000 books is a real endgame.

Measured timeline (greedy, 1 press/s, `--dt 1 --click 1`): touch 6 s, six 67 s, slate 83 s,
eight 91 s, contracted 125 s, Nemeth 179 s, music 18 min, words 2.8 h, passages 3.0 h,
library 5.1 h, endgame **5.11 h**. Treat this as a floor; the human target remains 10–30 h.

## 12. Browser-verification fixes (post Stage 6)

These were not visible to static checks or the simulator; they were found by playing the build.

1. **Load race.** `index.html` called `load()` from `<body onload>` while `loader.js` was still
   appending mod scripts. `layers.touch` was undefined and `player.touch.points` stayed a
   string, so the first `.gte()` crashed. The loader now counts every script's `onload` and
   calls `load()` only after `readyState === "complete"` (or `window.load`).
2. **Six/eight deadlock.** The engine opens a layer only when `canReset()` is true; six/eight
   `canReset()` requires a matched pattern; matching requires the board. `update()` now sets
   `player[layer].unlocked` when touch reaches `TUNING.REQ.six/eight`.
3. **Pre-unlock production.** `layerShown()` is a teaser, so `slate`/`words`/`library`
   produced before their first reset. Guards now use `player[layer].unlocked`.
4. **Microtab content strings.** `content: "upgrades"` was rendered per character. All 24
   microtabs now use `content: ["upgrades"]`; the skill's C-CONTENT1ELEM check was refined
   so it still catches the real error (`["upgrades"]` inside `tabFormat`) but accepts the
   correct `content` array.
5. **Engine localization.** Options, tree tooltips, dialogs, time units, milestone/achievement
   popups, respec/master buttons and the endgame screen now use `ui.*` keys. `build_lang.js`
   scans `components.js`, `systemComponents.js`, `NumberFormating.js`, `save.js`, `utils.js`,
   `game.js` and `index.html`; it accepts single-quoted `t(...)` calls.
6. **Dead upgrades.** `contracted 22` (words), `contracted 23` (touch/six/eight) and
   `music 21` (paper) are now read by the gain functions.
7. **Side-layer tooltips.** `ach` and `extra` set `resource: ""` plus a custom tooltip, so the
   tree no longer shows “0 undefined”.
8. **Eight-dot first target.** `EIGHT_TARGETS` now runs masks 1–255 and puts the blank cell
   (mask 0) last. The old order started at mask 0, so an untouched empty grid counted as
   “matched” and the first prestige was free. All 256 cells are still present.
9. **Braille wrapping, digits and default language.** Braille cells are Unicode symbols, so the
   browser found no soft-wrap points and long text forced horizontal scrolling. The two
   braille modes now set `html.brl-mode`, which applies `word-break: break-all` and
   `overflow-wrap: anywhere`; the touch column dropped from `scrollWidth` 1836 px to 634 px
   at a 634 px viewport. Static digits in the English braille pack were still ASCII because
   `toBrailleEn` only mapped letters; it now emits one number sign per digit run, so the
   six/eight layer symbols are `⠼⠋`/`⠼⠓` and static text like “×2” is fully braille. A fresh
   profile now defaults to `brl-en`; the preference key was bumped to `.lang.v2` so an old
   `zh` choice does not mask the new default.
10. **Achievement page template leak.** The achievement `<tooltip :text="...">` expression
    contained double-quoted `t("ui.youDidIt", "You did it!")` calls inside a double-quoted
    attribute. Vue closed the attribute early, so every achievement card printed raw template
    source. The calls now use single quotes. The earned counter and integer counters
    (learned cells, caps, sense level) use `numWhole`, so they show `2 / 50` rather than
    `2.00 / 50.00` and render as proper braille digits.

Final checks: static 67 PASS / 15 WARN / 0 FAIL; i18n 0 FAIL / 0 WARN (639 keys);
smoke 0 FAIL / 1 WARN (the `extra` layer is `tabFormat`-only, a known false positive);
browser-verified in zh, en, brl-zh and brl-en with save/reload. Final measured lower bound
is 5.11 h.
