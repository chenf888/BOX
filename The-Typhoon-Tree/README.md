# The Typhoon Tree

<!-- Game-first README. scaffold.js wrote this skeleton; Stage 3 fills the placeholders
     and Stage 6 re-checks the counted totals against the frozen build. The engine README
     is kept verbatim below for attribution. -->

**The Typhoon Tree** is an incremental game built on [The Modding Tree](https://github.com/Acamaeda/The-Modding-Tree) v2.7.

**Play:** open `index.html` in a browser — no build step. A local static server is optional
(`npx http-server .`, `python -m http.server`); after edits prefer the no-store server
(`node tools/serve.js`, copied with the harness) so the browser never serves stale mod files.

**Saving:** autosaves to localStorage under the save key derived from `modInfo.id = "the-typhoon-tree-5dxt4g"`.
Never change the id — changing it erases every save.

**One-line design:** 从一团暖海面上的扰动开始，沿蒸发→对流→涡旋→眼墙→登陆的台风生命史攀爬：水汽是燃料，风速是里程碑阶梯（17.2→85 m/s 风级墙可见可破），眼墙置换循环（ERC）是主动节奏核心，登陆把整棵树烧成风暴燃料（M19 选择性保留链）；侧层有恶劣环境分数攻击（M2）、对流爆发小游戏（M3）、副高商店（M8）、路径赌局（M14）与台风日记（M15）。英/中双语一开关（默认英文）。

**Content totals**（frozen build，浏览器实测清点）

| Layers | Upgrades | Milestones | Challenges | Buyables | Achievements |
|---|---|---|---|---|---|
| 13（主层 10 + 侧层 3） | 124 | 58 | 5 | 5 | 50 |

**Where things live:**

| Path | Role |
|---|---|
| `js/mod.js` | economy root: getPointGen, isEndgame, displayThings |
| `js/layers.js` … `js/layers8.js` | one file per row-group (each listed in modInfo.modFiles) |
| `js/tuning.js` | every pacing constant — the game and tools/simulate.js read one object |
| `js/technical/systemComponents.js` | settings screen: Language / 语言 toggle (same .opt button style) |
| `tools/` | serve.js (no-store) + smoke.js (load-time harness) + simulate.js (pacing) |
| `design-brief.md` | the design contract this build implements (§9.1/§11/§12 记录全部门禁实测) |

## The Modding Tree (engine)

# The-Modding-Tree

An incremental game engine based on The Prestige Tree. It still requires programming knowledge, but it's mostly pretty easy things and copy/pasting.

[Look here for a tutorial on getting started with modding with TMT](docs/tutorials/getting-started.md)

You can look in the [documentation](docs/!general-info.md) for more information on how it all works, or look at the code in [layers.js](js/layers.js) to see what it all looks like.
