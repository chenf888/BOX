# The Hundred Days Tree（百日誓师）

<!-- Game-first README. scaffold.js wrote this skeleton; Stage 3 fills the placeholders
     and Stage 6 re-checks the counted totals against the frozen build. The engine README
     is kept verbatim below for attribution. -->

**The Hundred Days Tree** is an incremental game built on [The Modding Tree](https://github.com/Acamaeda/The-Modding-Tree) v2.7.

**Play:** open `index.html` in a browser — no build step. A local static server is optional
(`npx http-server .`, `python -m http.server`); after edits prefer the no-store server
(`node tools/serve.js`, copied with the harness) so the browser never serves stale mod files.

**Saving:** autosaves to localStorage under the save key derived from `modInfo.id = "the-hundred-days-tree-z8f16y"`.
Never change the id — changing it erases every save.

**One-line design:** 树的基础分数被替换为**与现实严格同步的 24 小时制时间**（`player.points` = 今日 00:00 起的秒数，逐 tick 对齐真实时钟）；游戏内容 = 中国高三学生在百日誓师之后、直到高考的**真实一天**——按你给的课表逐分钟推进：上课挂机积专注、课间抢答真实题库、下课结算掌握/笔记、19:00 后就寝结算元气、晚修刷楼层、错题消化、第 100 天「走进考场」以总分结算结局（消耗式重置 + 复读 NG+）。

**Content totals**（2026-10-31 冻结构建实测，迷你沙箱逐层计键）：

| Layers | Upgrades | Milestones | Challenges | Buyables | Achievements | Questions | Hotkeys |
|---|---|---|---|---|---|---|---|
| 15 | 110 | 53 | 4 | 10 | 50 | 184 | 7 |

分层明细：六科各 upg10/ms4/buy1；作息 upg10/ms5/buy2；限时训练 upg3/ms3/ch4；错题 upg8/ms3；晚修 upg8/ms8/buy2；高考 upg21（20 件模考商店 + 复读）/ms10；成就层 50（5×10 + 显式 X/50 计数行）。

**Where things live:**

| Path | Role |
|---|---|
| `js/mod.js` | economy root: getPointGen(=0)，isEndgame（examDone），displayThings（时钟/天数/犯困提示） |
| `js/tuning.js` | **全部节奏常数 + 课表 PERIODS + TMT_NOW 时钟钩子 + 六科共享乘区**——游戏与模拟器共读 |
| `js/questions.js` | 184 题题库（四选一，难度梯度 40/40/20，逐题核验） |
| `js/subjects0.js / subjects1.js` | 语文/数学/英语 与 物理/化学/生物（同构模板） |
| `js/life.js` | 作息层：精力经济 + 5 活动 + 就寝结算元气（energyFactor/energyLowLine 单一之家） |
| `js/row2.js` | 限时训练（4 挑战）/ 错题整理 / 晚修（static 楼层 + 押题抽卡） |
| `js/gk.js` | 高考层：模考商店 + 第 100 天「走进考场」（消耗式重置）+ 复读 |
| `js/side.js` | 誓师 dashboard / 统计 / 成就 50 |
| `js/tree.js` | 课桌页：时钟同步 + 签到 + 课间抢答 + 翻日 + 精力流 |
| `tools/` | smoke.js（加载期）+ simulate.js（节奏实测，已 HDT-ADAPT）+ serve.js（no-store） |
| `design-brief.md` | 设计合同：问答台账/层链/自检 23 项/WARN 台账 §9.1/偏差 §10/实测 §11/浏览器 §12 |

**引擎 diff 披露（两处，均已获授权修改模板文件）**：

1. `js/technical/systemComponents.js` — displayThings 顶部资源条 span 包 `!modInfo.hidePointsDisplay &&`（隐藏引擎硬编码英文「You have X 时间」，让位于时钟展示；F7 教训）。
2. `index.html` — win 覆盖层中文化（删除 "Please check the Discord"、"It took you…" 译文、按钮改「彻底重来（清空所有进度）/带着录取通知书继续」、移除两处硬编码 TMT Discord 链接）。

**测试钩子**：`window.__FAKETIME`（毫秒时间戳）可覆写 `TMT_NOW()`——仅测试用；上线路径只读真实时钟。模拟器经同一钩子注入虚拟时钟（`tools/simulate.js` HDT-ADAPT 块）。

**验收快照（2026-10-31）**：静态 85 PASS / 0 FAIL（20 WARN 全部落账 §9.1）；smoke 0 FAIL；题库 184 题逐题校验通过；模拟器虚拟 100 天通关——第 99 天高考日走进考场，考试总分 750（满分结构）；浏览器五项门全绿（boot 0 / 15 页签 sweep / 每类 prestige 一次 / 存档往返 / console 清洁）。

## The Modding Tree (engine)

# The-Modding-Tree

An incremental game engine based on The Prestige Tree. It still requires programming knowledge, but it's mostly pretty easy things and copy/pasting.

[Look here for a tutorial on getting started with modding with TMT](docs/tutorials/getting-started.md)

You can look in the [documentation](docs/!general-info.md) for more information on how it all works, or look at the code in [layers.js](js/layers.js) to see what it all looks like.
