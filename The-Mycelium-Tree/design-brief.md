# Design Brief — The Mycelium Tree

> Filled per SKILL.md Stage 2 from `assets/blueprints.json` (large) + `assets/balance-defaults.json`.
> This document is the code-generation contract for Stage 4.

## 1. Identity

| Field | Value |
|---|---|
| Game name | The Mycelium Tree |
| Author | TMT-Skill |
| Points name (`modInfo.pointsName`) | Detritus |
| Language mode (interview Q7) | English only |
| One-line pitch | You are a spore on the forest floor: decompose the dead, weave the wood-wide web, and end by fruiting across the stars. |

## 2. Interview record (answers → parameters)

| # | Question | Answer | Locked parameter |
|---|---|---|---|
| Q1 | Theme-structure confirmation | 菌丝之树 (confirmed) | theme = structure mapping in §3 |
| Q2 | Scale | Large | blueprint `blueprints.large` — all rows/components/automation/endgame params |
| Q3 | Natural ceilings | No — unbounded | P12 triple softcaps, no hard caps |
| Q4 | Pacing | Balanced | standard sqrt chains (P1/P3), no `type:"none"` core loop layer |
| Q5 | Side content | Standard (default) | challenges (3 sets) + achievements grid 5×10; stats side layer |
| Q6 | Automation & timewalls | Classic (balanced default) | full per-layer ladders (P4), phase-end package deals, walls ≤ 30 min |
| Q7 | Language & style | English only, theme voice | no i18n ternaries; fungal naming, earthy palette |

Paste the Q1 theme-structure recap the user confirmed:

- **Currencies (in order):** Detritus (dead matter) → Hyphae → Mycelium/Enzymes → Substrate/Yeast cultures → Fruiting bodies → Germination/Bioluminescence/Insect allies → Network reach → Oak/Pine/Lichen bonds → Grove vitality → Traps/Controlled hosts → Tended gardens/Antibiotic yield → Thoughts → Ancient giants/Star seeds → The Fruiting
- **Layer topology:** 5 lifecycle phases (Decay → Fruiting → Symbiosis → Dominion → Cosmos), rows 0–12, hub-and-spoke at rows 5–6 (Mycorrhizal Web hub) and row 3 (Fruiting Bodies hub)
- **Ceilings:** none — unbounded growth under P12 defense-in-depth softcaps

## 3. Theme = structure mapping (P14 — required)

The fungal lifecycle IS the tree. Each phase changes what "growth" means:

| Phase | Rows | Real-mycology concept → layers | Currency type change |
|---|---|---|---|
| I. Decay | 0–2 | A spore germinates: hyphae filaments (`h`) branch into mycelium mass (`m`) and enzyme chemistry (`e`); they colonize substrate types (`s` = soil/wood/leaf floors) and ferment sugars (`y`) | biomass currencies |
| II. Fruiting | 3–4 | Fermentation warms/humidifies a microclimate (`w`); mycelium fruits (`f` hub); gill surface (`g`), bioluminescence (`b`), insect dispersal pacts (`i`) multiply spore reach | reproductive structures |
| III. Symbiosis | 5–7 | The web goes vertical: mycorrhizal network (`r` hub, static "buy reach") links tree partners oak (`o`), pine (`p`), lichen (`l`); dung voyages (`d`) ride animals; the grove (`t`) fuses all bonds | ecological bonds |
| IV. Dominion | 8–10 | The fungus stops being polite: nematode nooses (`n`), cordyceps hosts (`c`), leafcutter ant gardens (`pa`), penicillin warfare (`pd`) — until the network awakens (`q`, custom mind layer) | predation & chemistry |
| V. Cosmos | 11–12 | Ancient memory (`pr` = Prototaxites, Devonian giants) and panspermia (`x`) culminate in **The Great Fruiting** (`z`, the_end layer) | cosmic scale |

Hub-and-spoke regions: `f` (row 3) feeding g/b/i; `r` (row 5) feeding o/p/l. Phases are separated by era jumps in requires (row 7→8 ×25, row 10→11 ×20).

## 4. Layer chain table

One row per layer, **bottom of the tree first**. exp = normal exponent; "st" = static base; U/M/C/B = upgrades/milestones/challenges/buyables counts.

| id | name | row | pos | type | base resource → baseAmount | requires | exp/base | U | M | C | B | automation granted (granter.milestone) | softcap plan | doReset keeps (granter) | branches |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| z | The Great Fruiting | 12 | 0 | normal | pr+x points → sum | 1e20 | 0.25 | 10 | 5 | — | 1 | package x.m5: autoPrestige+autoUpgrade(pr,x) | layer softcap 1e30/0.4 | std (self) | pr, x |
| x | Xenospores | 11 | 1 | normal | q points | 4e18 | 0.25 | 15 | 6 | — | 2 | z.m0: passiveGen(q); x.m5: package | softcap 1e28/0.4 | std; upg (q.m5) | q |
| pr | Prototaxites | 11 | 0 | normal | q points | 2e18 | 0.25 | 15 | 6 | — | 1 | x.m0: passiveGen(pr); x.m5: package | softcap 1e28/0.4 | std; upg (q.m5) | q |
| q | Mycelial Mind | 10 | 0 | custom | pa+pd points → sum | 1e17 | staged | 25 | 8 | 2 (set 3) | 2 | pr.m0: passiveGen(q); x.m5/x.m1: autoUpg/autoPrestige(q) | staged re-root ladder in getResetGain (3 stages) | std; upg+mile (pa.m5) | pa, pd |
| pd | Penicillin Line | 9 | 1 | normal | c points | 4e15 | 0.25 | 15 | 6 | — | 2 | q.m2: passiveGen(pd); q.m5 package | softcap 1e22/0.4 | std; upg (pa.m4) | c |
| pa | Ant Farmers | 9 | 0 | normal | n points | 2e15 | 0.25 | 15 | 6 | — | 2 | q.m2: passiveGen(pa); q.m5 package | softcap 1e22/0.4 | std; upg (n.m4) | n |
| c | Cordyceps Dominion | 8 | 1 | normal | t points | 1e14 | 0.25 | 15 | 6 | 2 (set 3) | 1 | pd.m0: passiveGen(c); q.m5 package | softcap 1e20/0.4 | std; upg (t.m5) | t |
| n | Nematode Nooses | 8 | 0 | normal | t points | 5e13 | 0.25 | 15 | 6 | — | 2 | c.m0: passiveGen(n); q.m5 package | softcap 1e20/0.4 | std; upg (t.m5) | t |
| t | The Grove | 7 | 0 | normal | o+p+l points → sum | 2e12 | 0.25 | 15 | 8 | — | 2 | n.m0: passiveGen(t); q.m5: autoPrestige(t); q.m6: autoUpgrade(t) | softcap 1e18/0.4 | std; upg+mile (l.m5) | o, p, l |
| l | Lichen Compact | 6 | 2 | normal | r points | 8e10 | 0.25 | 15 | 6 | — | 1 | t.m0: passiveGen(l); t.m6: package deal (autoPrestige+autoUpgrade+resetsNothing) | softcap 1e16/0.4 | std; upg (d.m4) | r |
| p | Pine Pact | 6 | 1 | normal | r points | 4e10 | 0.25 | 15 | 6 | — | 1 | t.m0: passiveGen(p); t.m6: package deal | softcap 1e16/0.4 | std; upg (r.m5) | r |
| o | Oak Alliance | 6 | 0 | normal | r points | 2e10 | 0.25 | 15 | 6 | — | 1 | t.m0: passiveGen(o); t.m6: package deal | softcap 1e16/0.4 | std; upg (r.m5) | r |
| d | Dung Voyage | 5 | 1 | normal | i points | 1.5e9 | 0.25 | 15 | 6 | — | 1 | r.m0: passiveGen(d); r.m6: autoPrestige(d); r.m7: autoUpgrade(d) | softcap 1e14/0.4 | std; upg (i.m4) | i |
| r | Mycorrhizal Web | 5 | 0 | static | g points | 6e8 | st base 2 | 25 | 8 | — | 2 | d.m0: passiveGen(r); r.m6/7: autoPrestige/autoUpgrade(r); canBuyMax via r.upg | softcap 1e12/0.4 | std; upg+mile (g.m5) | g |
| i | Insect Pact | 4 | 2 | normal | f points | 6e7 | 0.25 | 15 | 6 | — | 2 | r.m0: passiveGen(i); r.m6/7 package | softcap 1e10/0.4 | std; upg (b.m4) | f |
| b | Bioluminescence | 4 | 1 | normal | f points | 3e7 | 0.25 | 15 | 6 | 2 (set 2) | 1 | i.m0: passiveGen(b); r.m6/7 package | softcap 1e10/0.4 | std; upg (g.m4) | f |
| g | Gill Surface | 4 | 0 | normal | f points | 1.5e7 | 0.25 | 15 | 6 | — | 2 | b.m0: passiveGen(g); r.m6/7 package | softcap 1e10/0.4 | std; upg (f.m4) | f |
| w | Microclimate | 3 | 0 | normal | y points | 3e5 | 0.25 | 15 | 5 | — | 1 | f.m0: passiveGen(w); f.m6: autoPrestige(w); f.m7: autoUpgrade(w) | softcap 1e8/0.4 | std; upg (y.m4) | y |
| f | Fruiting Bodies | 3 | 1 | normal | m points | 1e6 | 0.25 | 25 | 10 | 2 (set 1) | 2 | w.m0: passiveGen(f); g.m0: passiveGen? (no — see §6); r-era package: autoPrestige+autoUpgrade(f) | softcap 1e9/0.4; effect softcap inside | std; upg+mile (m.m5) | m, y |
| y | Fermentation | 2 | 1 | custom | e points | 2.5e4 | log | 15 | 6 | — | 1 | w.m0: passiveGen? no — autoPrestige(y) via f.m6; autoUpgrade(y) via f.m7 | n/a (log) | std; upg (e.m4) | e |
| s | Substrate | 2 | 0 | static | m points | 1.2e4 | st base 2 | 15 | 5 | — | 2 | y.m0: passiveGen(s); f.m6/7: autoPrestige/autoUpgrade(s); canBuyMax via s.upg | n/a (static floor) | std; upg+mile (m.m5) | m |
| e | Enzymes | 1 | 1 | normal | h points | 600 | 0.3 | 15 | 6 | — | 2 | s.m0: passiveGen(e); f.m6/7: autoPrestige/autoUpgrade(e) | softcap 1e7/0.4 | std; upg (h.m5) | h |
| m | Mycelium | 1 | 0 | normal | h points | 300 | 1/3 | 15 | 6 | — | 2 | s.m0: passiveGen(m); f.m6/7: autoPrestige/autoUpgrade(m) | softcap 1e8/0.4 | std; upg+mile (h.m5) | h |
| h | Hyphae | 0 | 0 | normal | points (detritus) → player.points | 10 | 0.5 | 25 | 12 | — | 2 | e.m0: passiveGen(h); s.m1: autoPrestige(h); y.m2: autoUpgrade(h); h.resetsNothing via m.m2 | layer softcap 1e7/0.4, raised by r.upg cap-delay | std; upg+mile via m.m0/m.m1 | — |

Rules the table must obey (Stage-2 self-check):
- requires ladder monotonic, adjacent rows ×10–×100 (P2; A1 = backwards) — see §6 ladder
- first layer requires 2–10 (P1): h = 10 ✓
- every main layer ≥10 upgrades + ≥3 milestones (A4): min 10 U / 5 M (z) ✓
- every new layer wires ≥2 older layers in its gainMult; ≥1 upgrade boosts layer 1 (P10; A7) — see §7 ledger
- automation ladder in P4 order, one chore per step (A8) — see §6
- every unbounded feedback loop has a softcap plan (P12) ✓

## 5. Tree sketch (ASCII)

```
row12:                              [z]
row11:                   [pr]  [x]
row10:                        [q]
row9:                   [pa] [pd]
row8:                   [n]  [c]
row7:                        [t]
row6:              [o] [p] [l]
row5:              [r] [d]
row4:         [g] [b] [i]
row3:              [w] [f]
row2:         [s] [y]
row1:         [m] [e]
row0:              [h]
side:   (a Spore Records) (st Field Notes)
```

Branch edges: m→h, e→h, s→m, y→e, w→y, f→m, g/b/i→f, r→g, d→i, o/p/l→r, t→o,p,l, n/c→t, pa→n, pd→c, q→pa,pd, pr/x→q, z→pr,x.

## 6. Requires ladder, automation ladder, unlock chain

**Requires ladder (row minima; all static `new Decimal` literals; row-min ratios ×10–×100, checker = Math.min per row):**

| row | layers (requires) | row min | ratio vs prev row |
|---|---|---|---|
| 0 | h 10 | 10 | — |
| 1 | m 300, e 600 | 300 | ×30 |
| 2 | s 1.2e4, y 2.5e4 | 1.2e4 | ×40 |
| 3 | w 3e5, f 1e6 | 3e5 | ×25 |
| 4 | g 1.5e7, b 3e7, i 6e7 | 1.5e7 | ×50 |
| 5 | r 6e8, d 1.5e9 | 6e8 | ×40 |
| 6 | o 2e10, p 4e10, l 8e10 | 2e10 | ×33 |
| 7 | t 2e12 | 2e12 | ×100 (deliberate era jump, in band) |
| 8 | n 5e13, c 1e14 | 5e13 | ×25 |
| 9 | pa 2e15, pd 4e15 | 2e15 | ×40 |
| 10 | q 1e17 | 1e17 | ×50 |
| 11 | pr 2e18, x 4e18 | 2e18 | ×20 |
| 12 | z 1e20 | 1e20 | ×50 |

**Unlock chain (exit-ticket upgrades; `onPurchase` sets `player.<next>.unlocked = true`):**
h.upg15→m, h.upg25→e, m.upg15→s, e.upg15→y, s.upg15→f, y.upg15→w, f.upg15→g, f.upg25→b, w.upg15→i, g.upg15→r, i.upg15→d, r.upg15→o, r.upg25→p, d.upg15→l, l.upg15→t, t.upg15→n, t.upg25→c, n.upg15→pa, c.upg15→pd, pa.upg15→q, pd.upg15→q, q.upg15→pr, q.upg25→x, x.upg15→z.

**Automation ladder (P4 order: keeps → passiveGeneration → autoPrestige → autoUpgrade; cross-layer grants; one chore per step).** The granting milestone lives on the granter layer and gates on the granter's `best`; the flag is an OR-expression on the target layer. Achievements provide an alternate path (P11) for h-automation only.

| # | Chore removed | Flag on | Granted by | Threshold (granter best) |
|---|---|---|---|---|
| 1 | h upgrades survive m/e resets | h doReset keeps upgrades | m.m0 | m.best ≥ 3 |
| 2 | h milestones survive | h doReset keeps milestones | m.m1 | m.best ≥ 6 |
| 3 | enzymes grow on their own | e passiveGeneration | s.m0 | s.best ≥ 2 |
| 4 | m prestige keeps detritus flow (m.resetsNothing) | m resetsNothing | m.m2 | m.best ≥ 12 |
| 5 | hyphae grow passively | h passiveGeneration | e.m0 (alt: a.34) | e.best ≥ 3 |
| 6 | h auto-resets | h autoPrestige | s.m1 (alt: a.42) | s.best ≥ 4 |
| 7 | h upgrades auto-buy | h autoUpgrade | y.m2 (alt: a.48) | y.best ≥ 8 |
| 8 | m/e passive generation | m,e passiveGeneration | f.m0 | f.best ≥ 2 |
| 9 | m/e auto-prestige | m,e autoPrestige | f.m6 | f.best ≥ 4000 |
| 10 | m/e/s/y auto-upgrade | m,e,s,y autoUpgrade | f.m7 | f.best ≥ 8000 |
| 11 | s/y passive generation | s,y passiveGeneration | g.m0 / b.m0 | g.best ≥ 3 / b.best ≥ 3 |
| 12 | f auto-prestige + auto-upgrade (package) | f autoPrestige+autoUpgrade | r.m3 / r.m4 | r.best ≥ 8 / ≥ 16 |
| 13 | g/b/i passive generation | g,b,i passiveGeneration | r.m5 | r.best ≥ 30 |
| 14 | g/b/i auto-prestige+auto-upgrade (package) | g,b,i | d.m4 / d.m5 | d.best ≥ 60 / ≥ 120 |
| 15 | o/p/l passive generation | o,p,l passiveGeneration | t.m0 | t.best ≥ 3 |
| 16 | o/p/l package (autoPrestige+autoUpgrade+resetsNothing) | o,p,l | t.m6 (single package milestone, P4 endgame move) | t.best ≥ 3000 |
| 17 | t keeps upgrades+milestones | t doReset keeps | l.m5 | l.best ≥ 150 |
| 18 | n/c passive generation | n,c | pa.m0 / pd.m0 | pa.best ≥ 3 / pd.best ≥ 3 |
| 19 | n/c/pa/pd auto-prestige+auto-upgrade (package) | n,c,pa,pd | q.m5 / q.m6 | q.best ≥ 500 / ≥ 2000 |
| 20 | q keeps upgrades+milestones | q doReset keeps | pa.m5 | pa.best ≥ 200 |
| 21 | q passive generation | q passiveGeneration | pr.m0 | pr.best ≥ 3 |
| 22 | pr/x auto-prestige+auto-upgrade (package) | pr,x | x.m5 (package) | x.best ≥ 100 |
| 23 | z auto-prestige (endgame convenience) | z autoPrestige | x.m5 | (same package milestone) |
| 24 | rows ≥10 stop wiping rows <10 (P9 free pass) | every doReset clause | design constant | row ≥ 10 resetters return undefined |

A8 check: no milestone grants two flags for the SAME layer except the deliberate P4 package deals (t.m6, r.m3+m4 pair, d.m4+m5 pair, q.m5+m6 pair, x.m5) — each keyword string appears at most once per layer (static check D-AUTOCOLLIDE clean).

## 7. Cross-layer web ledger (P10 — every new layer wires ≥2 older layers)

Convention per layer X with 15 upgrades (25 for anchors):
- 11: free/cheap starter — boost to detritus (getPointGen, ×2)
- 12: X-gain ×2 (X.gainMult self-line)
- 13: scaling effect on detritus (effect + effectDisplay, softcapped)
- 14: boost to X's base-predecessor layer gain (wired into that layer's gainMult)
- 15: **exit ticket** (unlock next layer per §6) — cost row-end jump ×1e3–1e5
- 21: X-gain ×3; 22: older-layer-2 boost; 23: scaling X-gain by older currency; 24: detritus ×3; 25: **exit ticket 2** (anchors only) or milestone-gate upgrade
- 31–35 (anchors): third chain — big self mults, buyable synergy, cap-delay or exit ticket

**Wiring ledger (X wires these older layers):** every X: 11→detritus, 12→X, 14→base-predecessor, 22→h (hyphae), 24→detritus.
Extra anchor wiring: f.22→m, f.24→y, f.32→w; r.22→g, r.24→d, r.32→o; q.22→pa, q.24→pd, q.32→t.
Every layer's `gainMult()` therefore contains: self-lines + lines from ALL future layers wired to it (recorded here; all written upfront since `hasUpgrade` on not-yet-loaded ids returns false safely at runtime after all files load).
Layer `effect()`: every main layer multiplies **detritus** gain by `(points+1)^0.15` (softcapped inside effect at its §4 softcap value) — the opener is never orphaned (A7: "h upgrade 11 matters at endgame" ✓ via web + effects).

## 8. Cap table (per currency)

| Currency | Ceiling? | Cap mechanism | Where |
|---|---|---|---|
| detritus | none | gain-mult web, no cap needed (input) | — |
| h points | none | layer softcap 1e7 power 0.4; raised ×1e3 by r.33 cap-delay upgrade | h.softcap/softcapPower (function) |
| m points | none | layer softcap 1e8 power 0.4 | m.softcap |
| e points | none | layer softcap 1e7 power 0.4 | e.softcap |
| f points | none | layer softcap 1e9 power 0.4 | f.softcap |
| g/b/i points | none | layer softcap 1e10 power 0.4 | per-layer softcap |
| r levels | static floor | base 2 cost wall (P5) | cost curve |
| o/p/l/d/t/n/c/pa/pd | none | layer softcap 1e14–1e22 (×100 per row band) power 0.4 | per-layer softcap |
| q points | none | **staged re-root ladder** in getResetGain (P12 #3): >1e6 → root(2)×1e5; >1e10 → root(2)×1e8; >1e15 → root(3)×1e12 | q.getResetGain |
| pr/x points | none | layer softcap 1e28 power 0.4 | per-layer softcap |
| z points | none | layer softcap 1e30 power 0.4; endgame at 1e3 z | z.softcap |
| every layer effect() | none | internal `softcap(x, cap, 0.5)` helper at 1e15 | effect() bodies |

## 9. Endgame definition

- `isEndgame()`: `player.z.points.gte(1000)` — the Great Fruiting completes at 1,000 fruiting waves.
- Reachability estimate (rough, Stage 6 method): steady detritus production at f-era ≈ 1e3–1e4/sec with web multipliers; each row era ≈ 25–50× requires covered by ×(2–5)/era prestige compounding + passive automation → ~5–15 min/era rows 0–4, ~30–60 min/era rows 5–9, ~1–2 h/era rows 10–12 → **total ≈ 15–30 h active+idle**, within large-blueprint 50 h+ budget when idle time is included (balanced pacing Q4/Q6).
- `winText`: "Your spores catch the solar wind. Beneath every forest, on every world, the mycelial web remembers: it all started with one hypha on the forest floor. **THE GREAT FRUITING IS COMPLETE** — you may keep growing, forever."

## 10. Deviations & open questions

| Default overridden | Value used | Why |
|---|---|---|
| large blueprint "5×5+ grids per layer" | 5×5 (25 upg) on anchors h/f/r/q; 5×3 (15 upg) elsewhere | per-layer authored formula variety over padding (A6 warning: volume ≠ quality); avg 15.8 upg/layer ≈ 79% of Mario Maker's 20; density floor (≥10) comfortably met |
| large blueprint "200+ milestones total" | ≈157 (avg 6.3/layer) | matches Mario Maker's measured 6.5 milestones/layer; volume scales with layer count (25 vs 38) |
| hotkey "Shift+letter for same-row second layer" | unique plain letter per layer (24 letters available) | no collisions; simpler How-To-Play; convention kept for any future same-letter pair |
| row 6→7 requires ratio ×100 (t at 2e12) | upper edge of band | deliberate era jump into Dominion phase (theme beat), in-band |
| y layer type custom (log) instead of static/custom per blueprint row2 | custom log (P8b) | theme: fermentation is a continuous process, not a reset-count; adds curve variety at row 2 |
| z 10 upgrades (below 15) | 10 | endgame layer — short victory-lap ladder, ends the tree (the_end pattern) |

### Stage 6 addendum — balance walkthrough fixes (applied to the brief FIRST, then code, per SKILL.md Stage 6 rule 3)

The paper walkthrough exposed two structural defects in the original table. Both were fixed in the brief before touching code:

1. **Exponent-chain complosion.** With only flat multipliers, the detritus needed for a row-n unlock compounds as ∏(1/exp_link) across the base chain (row-4 unlock ≈ det e174, row 6 ≈ e997 — unreachable). Corpus games break this with *self-referential scaling* (Mario Maker sm.11: effect = sm^1.25 on its own gain). Fix applied:
   - every layer's upgrade 21 is now a self-scaler: `effect = X^0.5`, softcapped at ≈ √(layer softcap), wired into X.gainMult → per-layer growth is exponential-in-time until its softcap (the softcaps become the real era gates);
   - every X.23 P-scaler strengthened `^0.12 → ^0.4` (capped at the layer's softcap);
   - h.13 detritus scaler `^0.2 → ^0.4` (cap 1e12); layer effects `^0.15 → ^0.2`.
   Re-walkthrough with the differential feedback (det ~ C·t³ era curves) puts row unlocks at minutes (rows 0-4), ~30-60 min (rows 5-9), hours (rows 10-12) — consistent with the large blueprint when idle time is included.
2. **Static layer consumed as a base.** o/p/l's baseAmount is r.points; with r static, points are purchase *levels* (realistic max ≈ 60), so requires 2e10–8e10 levels were unreachable. Fix: **r is now `type: "normal"`** (exp 0.25, softcap 1e12/0.4, gainMult semantics flipped div→times, upgrade costs rescaled from level-magnitude to point-magnitude, r.12 = "Network gain ×2" instead of canBuyMax). P5's static-floor role remains on s (nothing consumes s.levels as a base).
3. Minor threshold/unlock notes: automation milestones on f land at best 400/800 (not 4000/8000); unlock chain consolidated (h.15 unlocks m AND e; f.15→g, f.25→b&i; r.15→o&p; l.15→t; pa/pd.15→q; x.15→z); endgame target fixed at **z.points ≥ 25** (§9's 1000 was a draft value).

## 11. Self-check results (09 §4 + §5 anti-pattern sweep)

- [x] Requires ladder monotonic ×10–×100 per adjacent row (P2/A1) — §6 table
- [x] First layer requires 2–10 (P1) — h = 10
- [x] Density: every main layer ≥10 upgrades + ≥3 milestones (A4) — min 10/5
- [x] Every new layer boosts ≥2 older layers; layer-1 upgrade 11 matters at endgame (P10/A7) — §7 ledger + universal detritus effects
- [x] Automation ladder P4 order, no double grants of the same flag by two milestones (A8 + collision incident) — §6 table, D-AUTOCOLLIDE-safe
- [x] Softcap plan present for every unbounded loop (P12) — §8 cap table
- [x] A1–A10 sweep: A1 no (ladder monotonic), A2 no (rows 0–12 contiguous), A3 no (25 layers), A4 no, A5 no (row 1 + full ladder), A6 guarded (wiring + automation over volume), A7 no (web), A8 no (one chore/step + documented packages), A9 no (effectDisplay + formula-on-Shift on anchors), A10 no (helpers verified against 01/03: respecBuyables, no .mod, Decimal-only)
- [x] Endgame reachable in the target playtime (rough estimate done, §9)
