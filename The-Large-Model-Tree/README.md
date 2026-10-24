# The Large Model Tree

<!-- Game-first README. scaffold.js wrote this skeleton; Stage 3 fills the placeholders
     and Stage 6 re-checks the counted totals against the frozen build. The engine README
     is kept verbatim below for attribution. -->

**The Large Model Tree** is an incremental game built on [The Modding Tree](https://github.com/Acamaeda/The-Modding-Tree) v2.7.

**Play:** open `index.html` in a browser — no build step. A local static server is optional
(`npx http-server .`, `python -m http.server`).

**Languages:** English by default. 中文切换：open the **Bm (Benchmarks)** side layer and flip the language toggle — every line (resources, tabs, milestones, buyables, achievements, challenges, hotkeys) switches live.

**Saving:** autosaves to localStorage under the save key derived from `modInfo.id = "the-large-model-tree-rxmapt"`.
Never change the id — changing it erases every save.

**One-line design:** 你有 token。采样 → 上下文 → 参数 → 数据/算力 → 训练 → 部署 → 涌现 → AGI——把大模型的一生种成一棵以 1024 为胜负数字的树。献给 1024 程序员节。

*You have tokens. Sampling → Context → Parameters → Data/Compute → Training → Deployment → Emergence → AGI: grow the life of a large language model into a tree whose winning number is 1024. A tribute to Programmer's Day (Oct 24 = 2^10).*

**Content totals**（frozen build, counted via addLayer capture）

| Layers | Upgrades | Milestones | Challenges | Buyables | Clickables | Achievements |
|---|---|---|---|---|---|---|
| 10 | 92 | 47 | 4 | 16 | 1 | 32 |

Layers: 上下文 c · 参数 p · 注意力 a · 数据 d · 算力 f（static）· 训练 tr（custom，挑战宿主）· 部署 dep · 涌现 em · AGI（custom）· 基准测试 bench（side，成就 + 中英切换）。
Measured pacing: ~2.8 h to `isEndgame()` by a greedy 1 Hz simulator (achievements/challenges/clicks excluded → human ≈ 8–12 h). Every pacing constant lives in `js/tuning.js` (`TUNING`).

**Where things live:**

| Path | Role |
|---|---|
| `js/mod.js` | economy root: getPointGen, isEndgame, displayThings |
| `js/layers/` | one file per layer (each appended to modInfo.modFiles) |
| `js/tuning.js` | every pacing constant — the game and tools/simulate.js read one object |
| `tools/` | smoke.js (load-time harness) + simulate.js (pacing measurement) |
| `design-brief.md` | the design contract this build implements (21 self-checks, WARN acceptance §9.1, measured retune §11, browser fixes §12) |

## The Modding Tree (engine)

# The-Modding-Tree

An incremental game engine based on The Prestige Tree. It still requires programming knowledge, but it's mostly pretty easy things and copy/pasting.

[Look here for a tutorial on getting started with modding with TMT](docs/tutorials/getting-started.md)

You can look in the [documentation](docs/!general-info.md) for more information on how it all works, or look at the code in [layers.js](js/layers.js) to see what it all looks like.
