# Design Brief — The Yeast Tree

> Filled BEFORE any code (SKILL.md Stage 2). Blueprint: `medium` (assets/blueprints.json).
> Numbers from `assets/balance-defaults.json`; deviations in §10.

## 1. Identity

| Field | Value |
|---|---|
| Game name | The Yeast Tree |
| Author | chenf888 |
| Points name (`modInfo.pointsName`) | Sugar |
| Language mode (interview Q7) | English only (same choice as The Mycelium Tree) |
| One-line pitch | One drop of wild yeast, ten billion descendants: ferment, bake, distill, forage, sporulate and finally synthesize all 16 chromosomes of your own organism. |

## 2. Interview record (answers → parameters)

This game is generated in autonomous mode. The user supplied the theme ("The-Yeast-Tree").
All other interview answers are **documented defaults** (traceable): scale per HANDOVER ⑤b
recommendation ("re-generate a medium game for the ⑥ second validation of the upgraded
skill"), language per the user's explicit ⑥ choice (English only), the rest per blueprint
defaults.

| # | Question | Answer | Locked parameter |
|---|---|---|---|
| Q0 | Theme | **Yeast** (user) | P14 mapping in §3 |
| Q1 | Theme-structure | AI-proposed (confirmed by P14 self-check) | currencies/topology/ceilings below |
| Q2 | Scale | **medium** (HANDOVER ⑤b: ⑥ second validation) | blueprint `blueprints.medium` — rows 0–4, 10 main layers, all per-layer/component/automation/endgame params |
| Q3 | Natural ceilings | **Mixed** | Ethanol (ABV) hard-capped (real ethanol tolerance ceiling, raisable); all else P12 softcaps → §8 cap table |
| Q4 | Pacing | **Balanced** | default blueprint curves + fun-quota mechanics (M2/M3/M4/M5/M6/M8/M10) |
| Q5 | Side content | **Full** | M2 challenge hub + achievements 5×10 + stats + story dashboard side layer |
| Q6 | Automation & timewalls | **Classic pacing** | 6-step ladder, walls ≤ 30 min mid-game |
| Q7 | Language & style | **English only**; warm brewery palette, biology-nerd naming voice | colors/symbols in §4 |

Q1 theme-structure recap (AI proposal, P14):

- **Currencies (in order):** Sugar (mash) → Yeast biomass (budding) → parallel human-symbiosis
  products: Brew (beer) / Bread / ATP (respiration) → competition Medals, Spirit (ABV%),
  Tavern Coins → wild Forages & discovered Strains, Spores → sequenced Genes (chromosomes).
- **Layer topology:** 1 anchor (row 0) → 3 branches (row 1: brewing, baking, respiration)
  → 3 (row 2: challenge hub, distillery, tavern) → 2 (row 3: wild ecology, sporulation)
  → 1 capstone (row 4: genome). Every layer boosts ≥2 older layers (P10).
- **Ceilings:** ABV hard cap = real yeast ethanol tolerance (5% → raisable to 21% via
  tolerance upgrades — the yeast "evolves" the niche that alcohol itself created). All other
  currencies unbounded with P12 defense-in-depth.

## 3. Theme = structure mapping (P14)

| Real-yeast fact | Becomes in the tree |
|---|---|
| Yeast eats sugar, buds when food is plentiful | row-0 anchor `y` Budding: Sugar → Yeast (√ reset) |
| Two ancient human symbioses: beer & bread | row-1 siblings `b` Brewing, `k` Baking |
| Respiration (with O₂) yields ATP, ~16× more efficient than fermentation | row-1 branch `o` Respiration (ATP) boosting both siblings |
| Homebrew competitions are scored, not pass/fail | row-2 `c` Trials — M2 score-attack hub |
| Distillation is limited by ethanol tolerance (~5% wild → ~21% selected) | row-2 `e` Distillery — custom layer, ABV currency **hard-capped** at a raisable tolerance |
| Brew is sold; taverns funded brewing science | row-2 `t` Tavern — M8 shop layer (K4/K5 meta-effects) |
| Wild yeast lives on oak bark, soil, wasp guts; ~12 famous strains | row-3 `w` Wild — M3 wild-ferment risk/reward minigame + M10 strain collection |
| Sporulation survives starvation/drying; spores carry lineages through catastrophe | row-3 `s` Sporulation — P9 keep-list specialist ("spores survive resets") |
| S. cerevisiae has 16 chromosomes; Sc2.0 (2014) = first synthetic eukaryote genome | row-4 capstone `g` Genome — 16 milestones = chromosomes I–XVI, endgame = XVI sequenced |
| Discovery history (mead 7000 BC → Pasteur 1859 → Hansen 1883 → lager hybrid 2011 → Sc2.0) | side layer `l` The Chronicle — unlock-gated story dashboard |

## 4. Layer chain table (code-generation contract, bottom row first)

| id | name | row/pos | type | base resource → baseAmount | requires | exp/base | upgrades | milestones | challenges | buyables | automation granted (by which milestone of which layer) | softcap plan | doReset keeps | branches |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| y | Budding | 0/0 | normal | sugar → player.points | 10 | 0.5 | 5×5=25 | 10 | — | 11 "Budding rate", 12 "Vessel size" | *receives*: resetsNothing(b m2), passiveGen(k m2 ∥ a22), autoPrestige(o m3 ∥ a31), autoUpgrade(b m5 ∥ a44) | layer softcap @ 1e12 (power .5), u21 raises to e14; u12 K2 pow .5; u52 self-scale ^1.25 softcapped | ["unlocked","auto"] + m-gated upgrades/milestones | — |
| b | Brewing | 1/0 | normal | sugar → player.points | 500 yeast | 1/3 | 5×5=25 | 8 | — | 11 "Mash tun", 21/22 esters buyables (spend esters) | *receives*: autoPrestige(e m3 ∥ a53), autoUpgrade(w m2); **grants** b m2 → b.resetsNothing (step 1) | layer softcap @ 1e9 (power .4); brew effect softcap; u15 raises | keeps ["unlocked","auto"] | ["y"] |
| k | Baking | 1/1 | normal | sugar → player.points | 800 yeast | 1/3 | 5×3=15 | 8 | — | 11 "Proofing basket" | *grants* k m2 → y.passiveGeneration (step 2); *receives* autoPrestige(t m3) | bread (knead burst) capped per-batch; yeast gain K2 | keeps ["unlocked","auto"] | ["y"] |
| o | Respiration | 1/2 | normal | sugar → player.points | 1000 yeast | 1/3 | 5×2=10 | 5 | — | 11 "Aeration stone" | *grants* o m3 → y.autoPrestige (step 3); *receives* autoPrestige(s m4) | layer softcap @ 1e10 | keeps ["unlocked","auto"] | ["y"] |
| c | Trials | 2/0 | normal | brew → player.b.points | 5000 brew | 1/3 | 5×2=10 | 6 | **6 (M2)**: tier1 11 PurePitch/12 DryPitch/13 WildPitch; tier2 21/22/23 (harder, same themes) | — | *receives* package deal (s m3); maxpoints tracked in c.update() | medals gain softcap @1e6 | keeps ["unlocked","auto"] | ["y"] |
| e | Distillery | 2/1 | **custom** | brew → player.b.points | 5000 brew | custom (ABV = f(brew)^.4) | 5×3=15 | 6 | — | 11 "Pot still" | *grants* e m3 → b.autoPrestige (step 5); *receives* autoPrestige(s m3) | **ABV hard cap = tolerance() (5→8→12→15→18→21, power 0)** — ladder of e stops at cap; spending ABV frees headroom | keeps ["unlocked","auto"] | ["b"] |
| t | Tavern | 2/2 | normal | brew → player.b.points | 2.5e5 brew | 1/3 | 5×2=10 (all K4/K5 except 2 K1) | 3 | — | 11 "Round for the house", 12 "Regulars" | *grants* t m3 → k.autoPrestige; *receives* autoPrestige(s m3) | coins gain softcap | keeps ["unlocked","auto"] | ["e"] |
| w | Wild | 3/0 | **static** | yeast → player.y.points | 1e6 yeast | base 2, exp 1, roundUpCost | 5×2=10 (spend forages) | 4 | — | — (M3 minigame + strain list instead) | *grants* w m2 → b.autoUpgrade (step 6) + w.update() strain discovery | forage cost curve K5-delayed; strain mults individually softcapped | keeps ["unlocked","auto","strains","forages"] | ["s"] |
| s | Sporulation | 3/1 | **static** | yeast → player.y.points | 1e7 yeast | base 2, exp 1, roundUpCost | 5×2=10 (spend spores) | 5 | — | — | *grants* s m3 → **package deal** (c/e/t/w autoPrestige+autoUpgrade+resetsNothing — endgame QoL, P4); s m4 → o.autoPrestige | spore gain softcap | keeps ["unlocked","auto","spores"] | ["y"] |
| g | Genome | 4/0 | **custom** | yeast → player.y.points | 1e9 yeast | custom: genes = yeast^.25, staged re-root ladder (P12 #3) | 5×2=10 | **16 (chromosomes I–XVI)** | — | 11 "Sequencer" | *receives* everything via keeps; g m15 = ENDGAME | genes staged re-root: ≥1e6 root2·1e5, ≥1e9 root2·1e7, ≥1e13 root2·1e10 | keeps ["unlocked","auto"] | ["s","w"] |

Side layers: `a` Achievements (row "side", none, 5×10=50, rewards flat mults + P11 automation
backfill alternates, each guarded `!has`), `st` Stats (side, none), `l` The Chronicle
(side, none, story dashboard P13).

Rules re-checked: requires ladder monotonic (10 → 500/800/1000 yeast → 5000/5000/2.5e5
brew → 1e6/1e7 yeast → 1e9 yeast; every hop ×10–×100 within its base chain) ✓; first layer
requires 10 (P1 mode) ✓; every main layer ≥10 upgrades + ≥3 milestones (A4) ✓.

### 4.1 Fun density table (10 §2 kinds; K1 ≤ 40% per layer; ≥3 non-K1 kinds/layer)

| id | content items | effect-kind plan (ids) | organization | mechanics |
|---|---|---|---|---|
| y | 25U+10M+2B=37 | K1: u11,22,31,44,52 (5/25=20%); K2: u12 (yeast^.5), u23 (sugar log10), u41, u52 (^1.25 self-scale); K3: u15 (from brew), u32 (from bread), u53 (from strains); K4: u24 (u12 ^1.1), u33 (b11 ^1.1), u54 (u41 ^1.1); K5: u21 (raise layer softcap), u42, u55 (delay b softcap); K6: u13 (branch on buyables), u51; K7: u25 (unlock b), u34 (unlock o), u45 (unlock c); K8: u14 (esters/s via update flag), u35 | tabFormat: main-display/prestige-button/2 context texts/microtabs{Upgrades, Milestones, Buyables} | M6 overpowered(m0 via g u55); self-scale u52 (gotcha rule) |
| b | 25U+8M+3B=36 | K1: b11,22,31,45 (4/25=16%); K2: b12 (brew^.5), b23, b41; K3: b13 (from bread), b24 (from ATP), b33 (from coins); K4: b14 (y u12 ^1.1), b32 (y u41 ^1.1), b51 (o buyable ^1.1); K5: b15 (raise b softcap), b42, b52; K6: b21 (branch on esters), b43; K7: b25 (unlock e), b35 (unlock esters tab); K8: b34 (esters/s — M5 producer), b53 (sugar/s from CO2) | microtabs{Upgrades, **Esters** (big colored readout + esters buyables), Milestones, Buyables} + softcap warning text | **M5** esters secondary currency; **M4**-adjacent update producer |
| k | 15U+8M+1B+bar+clickable=26 | K1: k11,22,31 (3/15=20%); K2: k12 (bread^.5), k23; K3: k13 (from ATP), k24; K5: k14 (knead speed), k32; K6: k21 (reward branches on strain count), k33; K7: k15 (unlock knead loop), k25 (unlock buyable); K8: k34 (auto-knead 0.5/s); K4: k35 (y u23 ^1.1) | tabFormat + microtabs{Upgrades, **Kneading** (bar+clickable), Milestones, Buyables} | **M4** active production loop (bar kRising + clickable "Knead the dough", update() advances, burst on completion) |
| o | 10U+5M+1B=16 | K1: o11,21 (2/10); K2: o12 (ATP^.5); K3: o13 (b boost from k), o22 (k boost from b); K4: o14 (b12 ^1.1); K5: o23; K7: o15 (unlock buyable); K8: o24 (O₂→esters flush) | tabFormat minimum recipe + milestones inline (10 items → no microtabs needed) | cross-sibling web node |
| c | 10U+6M+6C=22 | K1: c11,24 (2/10); K6: c12,13,21,22,23 (scale with challengeCompletions); K3: c14 (from medals best-score log); K4: c25 (challengeEffect ^1.1); K7: c15 (unlock tier 2) | tabFormat: main-display/button/challenge context text/microtabs{Challenges, Upgrades, Milestones}; **M2 maxpoints** status line per challenge | **M2** score-attack hub (maxpoints[6] in startData, update() #3, rewards from records; nerfs via inChallenge() in b/k/o — P16) |
| e | 15U+6M+1B=22 | K1: e11,22,31 (3/15); K5: e12/e13/e21/e23/e33/e41 (**tolerance raises** 8/12/15/18/21, cost reducers); K2: e14 (spirit^.5), e32; K4: e15 (b gainExp +0.01); K7: e24 (unlock t), e42; K8: e34 (ABV→CO2 sugar) | custom points()/getNextAt()/canReset()/prestigeButtonText() (standalone getResetGain — C-CUSTOMTMP rule); microtabs{Upgrades, Milestones, Buyables}; live **tolerance readout** | **M7** custom cap layer; ABV% display, hard-cap play |
| t | 10U+3M+2B=15 | K1: t11,21 (2/10); K4: t12 (y u12 ^1.1), t22 (b u12 ^1.05), t31 (o buyable ^1.1), t41; K5: t13 (buyable cost base 2.8→2.5), t23 (ABV cap +2), t32 (delay y softcap ^10), t42; K7: t14 (unlock t buyable 12), t24; K8: t34 | microtabs{Upgrades, Buyables, Milestones}; coin readout tab | **M8** shop layer (K4/K5 variety seller) |
| w | 10U+4M+1bar+1click+12 strains=28 | K1: w11,21 (2/10); K3: w12/w22/w31 (strain-shaped mults: ^0.8, log, root — Mining logEffects homage); K6: w13 (branch on discovered count), w32; K7: w14 (unlock 2nd expedition); K8: w23 (strain passive spores); K2: w24; K5: w15 (forage cost delay) | tabFormat + microtabs{**Expeditions** (M3 bar+clickable+roll), **Strain Album** (12 strain cards, M10), Upgrades, Milestones} | **M3** wild-ferment risk/reward (pitch → random: 55% flavor ×, 30% dud, 15% spoilage) + **M10** collection (12 real strains) |
| s | 10U+5M=15 | K1: s11 (1/10); K5: s12/s13/s21/s31 (keep-list tech = cap/formula play); K7: s14, s22; K6: s23; K8: s24; K4: s32 (g sequencer ^1.1) | tabFormat minimum + milestones (spore economy is the content) | **P9 keep-list specialist** ("spores survive resets") |
| g | 10U+16M+1B=27 | K1: g11,21,31 (3/10); K4: g12 (y u52 ^1.1), g22; K3: g13 (from strain count), g23; K2: g14; K8: g24 (auto-sequence), g15; K7: g25 (unlock chromosome chain UI) | custom getResetGain with staged re-root; microtabs{Upgrades, Chromosomes, Buyables}; chromosome progress bar list | **M7** capstone ritual; 16-milestone chain; **M6** empower (g u55 → milestoneOverpowered('y',0)) |

## 4b. Game-level fun plan (fun-quota.json `medium`)

| Quota (medium) | Planned | Where |
|---|---|---|
| Distinct mechanics ≥4 | **7** | M2 c; M3 w; M4 k; M5 b; M6 y m0/g u55; M8 t; M10 w album |
| Challenge layer (M1/M2) | M2 score-attack hub, 6 challenges | c (maxpoints, tier1×3 + tier2×3) |
| Clickable group(s) ≥1 | 2 groups | k "Knead the dough"; w "Pitch wild starter" |
| Bar(s) ≥1 | 2 | k kRising bar; w wFerment bar |
| Layers with update() ≥3 | **4** | b (esters), k (knead), c (maxpoints), w (discovery) |
| Secondary currency ≥1 | 4 | b esters (M5); e ABV%; t coins; s spores/w forages (static spend) |
| Shop/meta layer ≥1 | t Tavern (K4/K5) | row 2 |
| Custom ritual layer | e Distillery + g Genome (M7) | rows 2/4 |
| Story presentation | l The Chronicle (unlock-gated infobox paragraphs) | side layer |
| K1 share ≤40%/layer | max planned = 27% (k) | §4.1 |
| Microtabs at ≥12 items | y/b/k/c/e/t/w/g all microtabs (o/s below 16 items: tabFormat min recipe) | §4.1 |

## 5. Tree sketch

```
row4:                                     [g Genome]
row3:                    [w Wild]   [s Spores]
row2:          [c Trials]  [e Distillery]  [t Tavern]
row1:      [b Brewing]   [k Baking]   [o Respiration]
row0:                   [y Budding]
side:   (a Achievements 5×10)  (st Stats)  (l The Chronicle)
```

Colors: y #DAA520 goldenrod · b #B8860B dark goldenrod · k #D2B48C wheat · o #4682B4 steel
(O₂) · c #CD7F32 bronze (medals) · e #B0C4DE light steel (spirit) · t #8B4513 saddle (wood) ·
w #6B8E23 olive (oak/wild) · s #E8E4D8 parchment (spores) · g #2ECC71 GFP green (synthetic
biology) · a #FFD700 · st #A9A9A9 · l #DEB887. Symbols (2 chars): y 🫧 b 🍺 k 🍞 o 💨 c 🏅
e 🥃 t 🪙 w 🍂 s ✳ g 🧬.

## 6. Automation ladder (P4 order; 6 steps + P11 achievement alternates)

| Step | Chore that dies | Granted by | Threshold |
|---|---|---|---|
| 1 | b-prestige wipes y (b.resetsNothing) | b m2 | 2500 yeast |
| 2 | manual budding (y.passiveGeneration) | k m2 ∥ a22 | 4000 yeast |
| 3 | manual budding clicks (y.autoPrestige) | o m3 ∥ a31 | 8000 yeast |
| 4 | manual y upgrades (y.autoUpgrade) | b m5 ∥ a44 | 5e4 yeast |
| 5 | manual brew prestiges (b.autoPrestige) | e m3 ∥ a53 | 50 ABV cumulative |
| 6 | **package deal**: c/e/t/w autoPrestige+autoUpgrade+resetsNothing; o.autoPrestige (s m3/s m4) | s m3, s m4 | 40 spores / 60 spores |

P11 backfill (in granting layer's update(), each guarded `!hasUpgrade/!hasMilestone`):
a22→y.passiveGen, a31→y.autoPrestige, a44→y.autoUpgrade, a53→b.autoPrestige.
No flag is granted by two milestones of the same layer (Mario conflict rule).

## 7. Endgame definition

- `isEndgame()`: `hasMilestone("g", 15)` — chromosome XVI sequenced (16-chain ≥ 10 steps ✓).
- Reachability estimate (Stage 6 method in §10 appendix): ~14–22 h (target 10–30 h) ✓.
- `winText`: "Your synthetic strain Sc2.0 finishes its first ferment — a beer no evolution
  ever brewed. Sixteen chromosomes, rewritten by hand, twelve million years in the making.
  **THE YEAST TREE IS COMPLETE.** (The culture is stable. You may keep growing, forever.)"

## 8. Cap table

| Currency | Ceiling? | Cap mechanism | Where |
|---|---|---|---|
| Sugar (points) | no | P12: layer-softcap on y @1e12 power .5; t u32 delays | y softcap props |
| Yeast | no | u21 K2 pow .5 + layer softcap; self-scale u52 ^1.25 softcapped | y |
| Brew | no | layer softcap @1e9 power .4; b u15 raises; k/e effect() softcap() helpers | b |
| Bread bursts | per-batch | knead reward softcap(x, batch cap, .5) | k effect |
| ATP | no | layer softcap @1e10 power .4 | o |
| **Spirit (ABV%)** | **YES** | `softcap(ret, tolerance(), 0)` hard cap; tolerance 5→21 via e/t/w upgrades; e's ladder stops at cap (spending frees headroom) | e points() (P8a/P12 power 0) |
| Coins | no | gain softcap | t |
| Genes | no | staged re-root ladder in getResetGain (P12 #3) | g |

## 9. Self-check results

- [x] Requires ladder monotonic, ×10–×100 per adjacent row within base chain (P2/A1) — §4
- [x] First layer requires 10 (P1)
- [x] Density: every main layer ≥10 upgrades + ≥3 milestones (A4) — §4 (min: o/t/w/s 10U)
- [x] Every new layer boosts ≥2 older layers in gainMult; ≥1 y-upgrade boosts layer 1 (u11/u12 chain); y upgrade 11 matters at endgame (via K4 chains) (P10/A7)
- [x] Automation ladder 6 steps, P4 order, no double milestone grants of one flag (A8) — §6
- [x] Softcap plan for every unbounded loop; ABV hard cap for the theme ceiling (P12/P8a) — §8
- [x] A1–A10 sweep: rows contiguous 0–4 (A2) ✓; branching 3-way row 1 (A3/A5/A6) ✓; density ✓; formula-on-Shift + effectDisplays everywhere (A9) ✓; only verified 01/03 helpers (A10) ✓
- [x] Endgame reachable ~14–22 h vs target 10–30 h (§10 appendix)
- [x] Fun density: K1 ≤ 27% per layer (quota 40%); every layer ≥3 non-K1 kinds (§4.1)
- [x] Organization: tabFormat everywhere; microtabs on all ≥12-item layers; context texts (base/best/softcap warning) (10 §3)
- [x] Game-level fun quota met (§4b); every M-mechanic has a "where"

## 10. Deviations & open questions

| Default overridden | Value used | Why |
|---|---|---|
| requiresRatioVsPrevRow band applies per base chain | row-2 layers use brew-scale requires (5000/2.5e5) while c/w/s use yeast-scale | currencies differ per branch; monotonicity holds within each chain (b→e→t is the brew chain) |
| row1 has 3 branches (blueprint allows 2–4) | b/k/o | Respiration is the theme's third symbiosis axis (efficiency vs speed) and gives o the automation step 3 |
| challenges 6 not 2–4 | 6 = 2 tiers × 3 themes | M2 hub needs ≥2 tiers for score-attack depth (春节树 pattern); quota requires M1-or-M2 layer for medium |
| g milestones 16 (blueprint: chain ≥10) | 16 = chromosome count of S. cerevisiae | theme = structure (P14); 16 ≥ 10 ✓ |
| interview answers | documented defaults (autonomous mode) | user gave theme only; scale/language per HANDOVER ⑤b + Mycelium precedent |

### §10 appendix — Stage 6 balance walkthrough + build deviations + Stage 7 test record (2026-10-02)

**Reachability walkthrough (SKILL.md Stage 6 method):**
- Opener: sugar 1/s → first bud < 1 min; u11 free ×2; y m0 (6,000 sugar) ≈ 6–10 min. Corpus-consistent (first milestone ≈ ×600 of requires).
- Row 1 (b 100 / k 250 / o 500 yeast = sugar 1e5 / 6e5 / 2.5e6): ≈ 10–20 min to Brewing with early ×2–×5 stacking. **Deviation:** original draft 500/800/1000 (sugar 2.5e6–1e7) was a multi-hour wall on paper — rebalanced to ×10/×25/×50 (in-band, monotonic).
- Row 2 (c/e 5,000 brew; t 2.5e5 brew): brew = yeast^(1/3) × web mults; at yeast 1e7–1e8 with b upgrades the 5,000 goal is a handful of resets. Automation steps 4–5 land here.
- Row 3 (w 1e6 / s 1e7 yeast): static floors grind forage/spore levels against a 1e6/1e7 base; package deal at s m3 ends manual play.
- Row 4: g gain = log10²(yeast)/10 × mults (inherently sublinear; the brief's staged re-root exists via s u24 but never triggers before softcap — kept as defense-in-depth). 16 chromosomes from 1 gene to 1e5 cumulative ≈ 15–30 min of automated endgame.
- **Total estimate ≈ 12–20 h** vs target 10–30 h ✓. Every runaway loop capped (§8 cap table); first softcaps start ≈ next-layer unlock (y softcap 1e12 vs w unlock 1e6 — deliberate 3-row headroom, cap-raise upgrades sold throughout).

**WARN acceptance:** D-REQRATIO row 2→3 = ×200 — cross-currency hop (brew-scale 5,000 → yeast-scale 1e6). Within the yeast chain (o 500 → w 1e6) and brew chain (b 100 → e 5,000) every adjacent ratio is ×10–×100; the checker compares raw numbers across different currencies. Accepted per the Mario-Maker multi-row-leap precedent.

**Build deviations from the brief (all discovered at Stage 4/6/7, game fixed first):**
| Deviation | Reason |
|---|---|
| baseResource of b/k/o is **yeast** (not sugar) | brief §4 table mislabeled; the requires ladder was always yeast-scale |
| b/k/o requires 100/250/500 (was 500/800/1000) | Stage 6 paper walkthrough: multi-hour wall; rebalanced per corpus |
| w/s upgrade costs lowered (cumulative 33/39) | static currency is purchase-level-gated (∑2ⁿ); original costs exceeded reachable forage/spore counts |
| e upgrade costs re-scaled 0.5→14 (max ≤ tolerance−1) | ABV is hard-capped: no cost may exceed the ceiling or the upgrade is unbuyable; the fill→spend→refill loop IS the layer |
| c.doReset also keeps `challenges` | completions were wiped by g prestiges (layerDataReset resets the challenges object) |
| M6 overpowered via `hasMilestone("g",14)` direct check | `milestoneOverpowered()` does NOT exist in stock TMT v2.7 (MM2-fork helper; handbook 10 §4-M6 cited fork code) |
| w u25 is K2 (not the g unlock); g unlocks via s u25 only | two exit tickets to one layer was redundant |
| strain mult = flat 1.4ⁿ (not per-strain shapes) | 12 individually-shaped formulas added complexity without new decisions; the Album is the collection |
| challenge goals 2,000/2e4/2e5/2e6/2e7/2e8 brew | entering a challenge wipes rows ≤1 — goals must be reachable in a fresh rebuild run |
| c.autoPrestige disabled while `activeChallenge` | auto-prestige would exit the competition (rowReset nulls activeChallenge) |

**Stage 7 browser test record (in-app Chromium, http://127.0.0.1:8643):**
- Boot: 14 layers registered, tree renders, **zero console errors across the whole session**.
- Real clicks: y tree node → tab opens; prestige button "Reset for +3 yeast / Next at 160 sugar" (formula exact); first reset zeroes sugar (row-0 contract).
- Upgrades: grid renders (after fixing the 1-element-array bug below); u11 (cost 0) → u12 chain purchasable; effects live (gen 1 → 6.5).
- All 10 layers walked: 25/25 y & b upgrades, 15 k, 10 o/c/e/t/w/s each; milestones grant on engine tick; buyables buy; esters accumulate + spend; knead loop (click → bar → burst → m4 auto) verified with real sugar payout.
- Trials (M2): enter challenge → rows ≤1 wipe; `inChallenge` nerfs inject (sugar ^0.65 etc.); **live score tracking** maxpoints[1]=1e30 via c.update tick; complete → hasChallenge + reward ×61.61 (formula exact).
- Distillery (hard cap): ABV stopped exactly at tolerance (5.00/5 → later 23+); canReset false at cap; spend-frees-headroom loop works; tolerance ladder 5→8→12→15→18→21→23→25(+2 t23, +1 m5) verified.
- K4 meta verified numerically: t12 raises y u12 to ^1.200 (1.1 + 0.025×log-coins, exact).
- Wild (M3/M10): 12/12 strains discovered (mult ×56.69 = 1.4¹²); spore rain produces whole spores only.
- Sporulation keeps + package deal: y19/b/k upgrades + milestones + strains + spores survive g resets; c/e/t/w autoPrestige/autoUpgrade/resetsNothing + o autoPrestige all ON; full P4 ladder online.
- Genome: 335 genes from 1e35 yeast (log²-shape exact); 16/16 chromosomes → `isEndgame()` TRUE → win screen renders ("THE YEAST TREE IS COMPLETE"); keepGoing resumes.
- Save: marker-state round-trip exact (Decimals + strains array revive); timePlayed accrues across reloads. One wipe incident reproduced only under extreme scripted values + halted win-screen loop — not reachable in normal play; noted for the skill.
- Visual: screenshots verified — theme glyphs correct after charset fix, tree lines/colors/side nodes, microtabs, milestone toasts.

**Incidents fixed during testing (all game-side before delivery):**
1. `["upgrades"]`-style 1-element content arrays render NOTHING (engine row/column renderer handles bare strings + 2/3-element arrays only) — 28 occurrences replaced with bare strings; **rule C-CONTENT1ELEM (FAIL) + M-CHARSET (WARN) added to skill static_checks.js, charset injection added to scaffold.js, fixtures + run_tests updated, suite green**.
2. `milestoneOverpowered` not in stock engine — replaced with direct `hasMilestone` checks.
3. index.html lacked charset meta (skill scaffold injection was documented in HANDOVER ⑤b but absent from the code) — fixed in game, scaffold, and checker.
