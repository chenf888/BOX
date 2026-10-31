# The Prime Conjecture Tree

<!-- Game-first README. scaffold.js wrote this skeleton; Stage 3 fills the placeholders
     and Stage 6 re-checks the counted totals against the frozen build. The engine README
     is kept verbatim below for attribution. -->

**The Prime Conjecture Tree** is an incremental game built on [The Modding Tree](https://github.com/Acamaeda/The-Modding-Tree) v2.7.

**Play:** open `index.html` in a browser — no build step. A local static server is optional
(`npx http-server .`, `python -m http.server`); after edits prefer the no-store server
(`node tools/serve.js`, copied with the harness) so the browser never serves stale mod files.

**Saving:** autosaves to localStorage under the save key derived from `modInfo.id = "the-prime-conjecture-tree-54nlco"`.
Never change the id — changing it erases every save.

**One-line design:** 用筛子筛出素数，证明一条条定理，收编数论先贤的祝福，最终挑战黎曼 ζ 的非平凡零点——把数论史玩成一棵声望树。Bilingual (EN default, 中文 toggle in the Options screen). Endgame: pin 10 non-trivial zeros back to the critical line = prove the Riemann Hypothesis.

**Content totals** (counted from the frozen build by addLayer capture — not brace-counted):

| Layers | Upgrades | Milestones | Challenges | Buyables | Achievements |
|---|---|---|---|---|---|
| 15 (11 main + 4 side) | 158 | 72 | 4 | 9 | 50 |

**Where things live:**

| Path | Role |
|---|---|
| `js/mod.js` | economy root: getPointGen, isEndgame, displayThings |
| `js/layer_*.js`, `js/side_layers.js` | layer files, bottom row first (all listed in modInfo.modFiles) |
| `js/tuning.js` | every pacing constant — the game and tools/simulate.js read one object |
| `tools/` | smoke.js (load-time harness) + simulate.js (pacing measurement) + serve.js (no-store server) |
| `design-brief.md` | the design contract this build implements |

## The Modding Tree (engine)

# The-Modding-Tree

An incremental game engine based on The Prestige Tree. It still requires programming knowledge, but it's mostly pretty easy things and copy/pasting.

[Look here for a tutorial on getting started with modding with TMT](docs/tutorials/getting-started.md)

You can look in the [documentation](docs/!general-info.md) for more information on how it all works, or look at the code in [layers.js](js/layers.js) to see what it all looks like.
