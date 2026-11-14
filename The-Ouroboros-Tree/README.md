# The Ouroboros Tree

<!-- Game-first README. scaffold.js wrote this skeleton; Stage 3 fills the placeholders
     and Stage 6 re-checks the counted totals against the frozen build. The engine README
     is kept verbatim below for attribution. -->

**The Ouroboros Tree** is an incremental game built on [The Modding Tree](https://github.com/Acamaeda/The-Modding-Tree) v2.7.

**Play:** open `index.html` in a browser — no build step. A local static server is optional
(`npx http-server .`, `python -m http.server`); after edits prefer the no-store server
(`node tools/serve.js`, copied with the harness) so the browser never serves stale mod files.

**Saving:** autosaves to localStorage under the save key derived from `modInfo.id = "the-ouroboros-tree-2fx53a"`.
Never change the id — changing it erases every save.

**One-line design:** the snake eats its own tail — a 12-layer self-amplification chain (ripples → echoes → resonance → standing waves → feedback loops → overtones → interference → self-oscillation → chaos → fractals → singularities → ouroboros) where every layer carries its own self-gain loop, and the endgame Tuning Manifold lets you re-tune the gain exponent of all 13 currencies by hand.

**Content totals** <!-- counted from the real addLayer definitions (addLayer shim + vm), not source brace-counts -->

| Layers | Upgrades | Milestones | Challenges | Buyables | Achievements |
|---|---|---|---|---|---|
| 12 (+2 side: mode / achievements) | 141 | 69 | 0 | 23 | 50 |

**Where things live:**

| Path | Role |
|---|---|
| `js/mod.js` | economy root: getPointGen, isEndgame, winText, displayThings |
| `js/layers1–4.js` + `js/side.js` + `js/tree.js` | one file per layer row (each appended to modInfo.modFiles) |
| `js/tuning.js` | every pacing constant — the game and tools/simulate.js read one object |
| `tools/` | serve.js (no-store) + smoke.js (load-time harness) + simulate.js (pacing measurement) |
| `design-brief.md` | the design contract this build implements (§11 sim calibration, §12 browser fixes) |
| `TESTING.md` | the manual test checklist handed over at Stage 7 |

## The Modding Tree (engine)

# The-Modding-Tree

An incremental game engine based on The Prestige Tree. It still requires programming knowledge, but it's mostly pretty easy things and copy/pasting.

[Look here for a tutorial on getting started with modding with TMT](docs/tutorials/getting-started.md)

You can look in the [documentation](docs/!general-info.md) for more information on how it all works, or look at the code in [layers.js](js/layers.js) to see what it all looks like.
