# The Softcap Tree（软上限之树）

<!-- Game-first README. Stage 3 filled the design pitch; Stage 6 froze the counted
     totals; Stage 7 wrote the final version. The engine README is kept verbatim
     below for attribution. -->

**The Softcap Tree** is an incremental game built on [The Modding Tree](https://github.com/Acamaeda/The-Modding-Tree) v2.7.

**Play:** open `index.html` in a browser — no build step. A local static server is optional
(`npx http-server .`, `python -m http.server`); after edits prefer the no-store server
(`node tools/serve.js`, copied with the harness) so the browser never serves stale mod files.

**Saving:** autosaves to localStorage under the save key derived from `modInfo.id = "the-softcap-tree-9g7d7c"`.
Never change the id — changing it erases every save.

**One-line design:** Every number in the game is softcapped, every cap feeds another, and the
only gameplay is waiting behind walls — the growth you don't get converts into Strain, and
Strain is the currency that buys the caps back open.

**How it plays (the wall economy):**
- Force grows at `ideal × pace ÷ (1 + F/T)^0.15` — the higher your Force climbs over its cap,
  the more *suppressed* you are. Suppression never destroys growth; it converts it into
  **Strain** (`stress = ideal − effective`), which spends on everything.
- Every softcap start (Strain, Pillars, Counterpillars, row-2 currencies) is itself a purchasable
  number, and **every cap you raise makes somebody else's cap cheaper** — the caps lean on
  each other by design (double pillars feed each other; Thresholds' cap shop eats Gravity;
  Work Hardening raises the top cap the longer you sit under it; meta-compression in Recursion
  weakens every cap raise everywhere).
- The **Time Wall** (`tw`, type-none) only charges its breakthrough bar while you are suppressed —
  waiting is the mechanic, and the breakthroughs are its wage.
- **Q6 pace dial**: in Options, type any wall length in minutes (5–10080). A shorter wall means
  the whole ideal-rate network runs proportionally faster (`paceMult = 45 / minutes`), i.e. it
  trades softcap severity directly for gain speed, exactly as requested. Default 45 min.
- **Endgame** (sim-certified ~9.3–17.1 h depending on integration step; the ×200 first wall
  opens at ~33 min): the Tuning Manifold (`mf`, 9 shared slots over a 90-level point pool)
  retunes every exponent in the game, then the Omni Valve chain (`ov`) climbs to
  2,000,000 Valves and opens the Master Valve.

**Content totals** (counted from the frozen build via an addLayer-shim census — 2026-11-21):

| Layers | Upgrades | Milestones | Challenges | Buyables | Achievements |
|---|---|---|---|---|---|
| 11 | 95 | 49 | 0 (Q5: light) | 13 | 50 |

Per layer: st 12U/5M/2B · th 10/4/1 · pl 10/4/1 · pt 10/4/0 · tw 10/4/0 · gr 10/4/0 ·
in 10/4/0 · nc 7/3/0 · mf 6/5/9 (the 9 tuning slots) · ov 10/12/0 · ac —/—/—/50A.

**Languages:** bilingual English/Chinese; **default English**. Switch in **Options** (语言 button);
the toggle is reactive everywhere including the top overlay.

**Where things live:**

| Path | Role |
|---|---|
| `js/mod.js` | economy root: getPointGen (the Force wall), isEndgame, displayThings (live wall status + pace line) |
| `js/tuning.js` | **the single source of truth** for every constant and every shared cap function (`strainCap()`, `stressRate()`, `barFillTime()`, `mfTune()`, `paceMult()`, …) — the game and the simulator read the same object |
| `js/layers-st.js` | Strain: stress accrual, the stress shop, resonance (closed-form buyMax), anchor cap |
| `js/layers-row1.js` | th (cap shop) + the twin Pillars pl/pt (sibling-fed caps, mutual lean) |
| `js/layers-row2.js` | tw (type-none breakthrough bar) · gr (coupling wells) · in (work hardening, `harden[]` array) · nc (recursion / meta-compression, static) |
| `js/layers-row3.js` | mf (custom Tuning Manifold) · ov (custom Omni Valve chain) |
| `js/layers-side.js` | ac: 50 achievements with wired reward multipliers + P11 backfill |
| `js/tree.js` | tree layout + node order |
| `tools/serve.js` | no-store static server (port 8098) |
| `tools/smoke.js` | load-time harness (per-layer micro gate) |
| `tools/simulate.js` | the pacing authority — measured 9.31 / 9.25 / 17.08 h at dt 0.5 / 1 / 2 (R14, post-audit) |
| `tools/save-at-mf.js` | save injector: jumps a fresh save to a mid-game state (mf open) — handy for testing the late game without the 10-hour climb |
| `design-brief.md` | the design contract this build implements (§10 deviations, §11 sim retune ledger R1–R14, §12 browser fixes, §13 per-layer bug audit) |
| `TESTING.md` | the manual test checklist |

**Engine changes** (authorized by the user in S0): `index.html` winText function guard;
`js/components.js` + `js/technical/systemComponents.js` reactive bilingual chrome (main-display,
resource-display, root overlay, options tab); `js/technical/canvas.js` drawTree tmp guard;
`js/technical/systemComponents.js` options tab gained the language button and the wall-length
dial. The template demo `js/layers.js` was removed (unregistered).

## The Modding Tree (engine)

# The-Modding-Tree

An incremental game engine based on The Prestige Tree. It still requires programming knowledge, but it's mostly pretty easy things and copy/pasting.

[Look here for a tutorial on getting started with modding with TMT](docs/tutorials/getting-started.md)

You can look in the [documentation](docs/!general-info.md) for more information on how it all works, or look at the code in [layers.js](js/layers.js) to see what it all looks like.
