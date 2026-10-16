# 节气树 · 七十二候 / The Solar Terms Tree

以二十四节气为主题的增量游戏（incremental / idle game），运行在 The Modding Tree v2.7 引擎上。
An incremental game themed on the twenty-four solar terms, running on The Modding Tree v2.7.

## 怎么玩 / How to play

**直接双击 `index.html`** 就能玩 —— 所有脚本都是本地相对路径，不需要服务器、不需要联网。
要托管的话，把整个文件夹交给任意静态服务器即可。存档在浏览器 localStorage 里，键名
`the-solar-terms-tree-dfzirm`（此键永久不变，换版本也认旧档）。
Just open `index.html` — every script is a local relative path; no server and no network needed.

## 一句话设计 / The idea

圭表测日影得**日影**；日影积为**候**。八节（立春·春分·立夏·夏至·立秋·秋分·立冬·冬至）
沿树逐节解锁，每节领三个节气（共二十四气），每个节气领三候 ——
**八节 × 九候 = 七十二候，正好就是全部升级**。终点是**岁**：八节试炼（全树归零、候产 ÷1000）
之后是**岁功成**的通关屏。侧层的农书（`农`）按候解锁十二章，引用《月令》原文。
Read the shadow off a gnomon to earn 日影; 日影 accumulates into 候. The eight 节 unlock up the
tree, each owning three solar terms, each term three pentads — **8 × 9 = 72 pentads, which is the
entire upgrade set**. The end is 岁: eight trials (a full-tree wipe at ÷1000 output), then the
岁功成 win screen. The 农书 side layer unlocks twelve chapters of 《月令》 as you observe pentads.

## 规模 / Size（实测计数 / counted from the build）

| | |
|---|---|
| 层 layers | 13（10 主层 + 3 侧层） |
| 升级 upgrades | 100 |
| 里程碑 milestones | 42 |
| 成就 achievements | 15 |
| 试炼 trials | 8 |
| 七十二候图 | 1 张 72 格 grid（挂在「历」上） |
| 副货币 | 2（日影、候） |
| 实测通关 | 约 5.8 h（无头模拟下界；真人估计 11–23 h） |

## 文件 / Files

| 路径 | 说明 |
|---|---|
| `js/tuning.js` | **所有节奏常数**：升级倍率、软上限、试炼目标、自环指数……改数值只改这里。 |
| `tools/gen_layers.js` | 生成器：读 `tuning.js`，产出 `js/layers/*.js` 与 `js/tree.js`。**生成物不要手改**。 |
| `tools/simulate.js` | 无头节奏模拟。`node tools/simulate.js . --click 1 --dt 1`；另有 `--trace` / `--trace-every` 诊断开关。 |
| `tools/smoke.js` | 加载期冒烟：在 Node 里真实加载全部 mod 文件，捕获启动期异常。 |
| `design-brief.md` | 设计契约：主题→结构映射、趣味配额、偏差表 D1–D22、Stage 6 实测数据。 |

## 语言 / Language

默认中文；设置页（`设`）可一键切换 English（文本层 `L()`，没有 `js/lang/` 目录）。
引擎自带的英文串（如 `Achievement Gotten!`）来自引擎文件，未改动。

---

## The Modding Tree (engine)

An incremental game engine based on The Prestige Tree. It still requires programming knowledge, but it's mostly pretty easy things and copy/pasting.

[Look here for a tutorial on getting started with modding with TMT](docs/tutorials/getting-started.md)

You can look in the [documentation](docs/!general-info.md) for more information on how it all works, or look at the code in [layers.js](js/layers.js) to see what it all looks like.
