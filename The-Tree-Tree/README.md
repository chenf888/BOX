# The Tree Tree

<!-- Game-first README. scaffold.js wrote this skeleton; Stage 3 fills the placeholders
     and Stage 6 re-checks the counted totals against the frozen build. The engine README
     is kept verbatim below for attribution. -->

**The Tree Tree** is an incremental game built on [The Modding Tree](https://github.com/Acamaeda/The-Modding-Tree) v2.7.
by **chenf888** (AI-generated via the TMT-Skill pipeline).

**Play:** open `index.html` in a browser — no build step. A local static server is optional
(`npx http-server .`, `python -m http.server`); after edits prefer the no-store server
(`node tools/serve.js`, copied with the harness) so the browser never serves stale mod files.

**Saving:** autosaves to localStorage under the save key derived from `modInfo.id = "the-tree-tree-h43htw"`.
Never change the id — changing it erases every save.

**One-line design:** You are a tree. The tree diagram IS the tree: grow leaves into wood, wood into
branches and roots, mature into bark, blossom and sap, seed a canopy — then plant new trees in a
grove until the World Tree itself — THE TREE TREE — is grown.

**Content totals** (counted by capturing `addLayer` calls and reading the numeric component keys per
layer — `tools/count-content.js`; totals re-checked against the frozen build at Stage 6 close):

| Layers | Upgrades | Milestones | Challenges | Buyables | Achievements |
|---|---|---|---|---|---|
| 13 | 140 | 78 | 8 | 5 | 50 |

Layer breakdown: wood 15u/10m/2ch/2b · branch 12u/8m/1b · root 12u/8m/1b · bark 10u/6m · blossom
10u/6m · sap 13u/5m/1b · canopy 25u/6m/3ch · seed 25u/9m/3ch · grove 8u/5m · worldtree 10u/15m ·
achievements side-layer 50. (Three side layers — achievements, stats, stories — bring the count to 13.)

**Where things live:**

| Path | Role |
|---|---|
| `js/mod.js` | economy root: getPointGen (the leaf web), isEndgame, displayThings, language toggle |
| `js/layers-row01.js` … `layers-row4.js`, `layers-side.js` | layer definitions (wood/branch/root; bark/blossom/sap; canopy/seed; grove/worldtree; achievements/stats/stories) — listed in `modInfo.modFiles` |
| `js/tuning.js` | every pacing constant — the game and tools/simulate.js read one object |
| `tools/` | smoke.js (load-time harness), simulate.js (pacing measurement), serve.js (no-store dev server), count-content.js (README totals) |
| `design-brief.md` | the design contract this build implements — §11 holds the measured retune story |

## The Modding Tree (engine)

# The-Modding-Tree

An incremental game engine based on The Prestige Tree. It still requires programming knowledge, but it's mostly pretty easy things and copy/pasting.

[Look here for a tutorial on getting started with modding with TMT](docs/tutorials/getting-started.md)

You can look in the [documentation](docs/!general-info.md) for more information on how it all works, or look at the code in [layers.js](js/layers.js) to see what it all looks like.
