# The Smallpox Tree

<!-- Game-first README. scaffold.js wrote this skeleton; Stage 3 fills the placeholders
     and Stage 6 re-checks the counted totals against the frozen build. The engine README
     is kept verbatim below for attribution. -->

**The Smallpox Tree** is an incremental game built on [The Modding Tree](https://github.com/Acamaeda/The-Modding-Tree) v2.7.

**Play:** open `index.html` in a browser — no build step. A local static server is optional
(`npx http-server .`, `python -m http.server`).

**Saving:** autosaves to localStorage under the save key derived from `modInfo.id = "the-smallpox-tree-o1hd4y"`.
Never change the id — changing it erases every save.

**One-line design:** 三千年瘟疫的终结，一例一例写进一棵树——从病毒起源（约公元前 1 万年）出发，
经人痘接种、牛痘（詹纳 1796）、疫苗生产/研究/全球协作，汇入监测围堵/冷链/动员三支柱与全球战役，
最终以 9 枚认证印章走到 ★1979-10-25 人类天花绝迹日★。每次声望就是一次接种/围堵行动；
放松管控，反弹压强就会回升（score-attack 机制）。英语/中文双语（疫情页签内切换）。

**Content totals** <!-- TODO(Stage 6): replace with the counted numbers from the frozen build.
     Count by capturing addLayer calls and reading Object.keys(def.upgrades).filter(k => !isNaN(Number(k)))
     per layer — brace-counting the generated source over-counts. -->

| Layers | Upgrades | Milestones | Challenges | Buyables | Achievements |
|---|---|---|---|---|---|
| 12（10 主层 + 档案/疫情 2 侧层） | 135 | 68 | 6 | 5 | 50 |

（计数来自冻结构建的引擎实数：`Object.keys(layers).forEach(id => …)`，与 design-brief §4 合计行同步。）

**Where things live:**

| Path | Role |
|---|---|
| `js/mod.js` | economy root: getPointGen, isEndgame, displayThings |
| `js/layers/` | one file per layer (each appended to modInfo.modFiles) |
| `js/tuning.js` | every pacing constant — the game and tools/simulate.js read one object |
| `tools/` | smoke.js (load-time harness) + simulate.js (pacing measurement) |
| `design-brief.md` | the design contract this build implements |

## The Modding Tree (engine)

# The-Modding-Tree

An incremental game engine based on The Prestige Tree. It still requires programming knowledge, but it's mostly pretty easy things and copy/pasting.

[Look here for a tutorial on getting started with modding with TMT](docs/tutorials/getting-started.md)

You can look in the [documentation](docs/!general-info.md) for more information on how it all works, or look at the code in [layers.js](js/layers.js) to see what it all looks like.

## Playing the tree（玩法速览）

- **病例（cases）** 是基础货币；第一次重置 = 人类第一次反制（人痘接种，`人痘` 层）。
- row1 四分支：`牛苗`（接种者→免疫公民+覆盖率%）、`疫量`（剂量）、`认知`、`资金`；
  row2 三支柱：`围堵`（反弹压强/奖励金）、`冷链`、`动员`；`战役`（min 汇流）→ `认证`（M19 发射）。
- **认证发射逐项消耗** 剂量/资金/围堵行动/战役进度，并要求发射瞬间压强 ≤1 与累计零病例监测期
  （逐发递增 600s 起）；9 枚印章 = ★1979-10-25★（通关），其后 3 枚为 post-win 封卷内容。
- 自动化按里程碑逐级点亮（vac m2 passiveGen → pro m0/m2 autoPrestige → cmp m4 三支柱清扫
  → knw m3 自动分装 → pro m4 autoUpgrade → cert m2 全局 autoUpgrade），终局全自动可达（Q6）。
- 热键：`E` 认证发射。双语切换：`疫情`（dash）页签。

## Verification（Stage 5–6.5 闸门记录）

- static_checks：102 PASS / 3 WARN（均在 design-brief §9.1 有书面接受理由）/ 0 FAIL（2026-10-25 第三轮复测：+D-TMPPOINTS/D-CHALOWNRES 两条新护栏）
- smoke：0 FAIL / 0 WARN
- simulate（`--click 1 --dt 1`）：**14.96h** 触达 endgame（medium 带 10–30h；dt 0.5→12.38h、dt 2→19.74h）
- 浏览器（Stage 6.5）：boot 无错、12 层页签全渲染、四类声望各一次、升级+buyable 各购一次、
  存档重载与 export/import 往返通过、控制台干净（修正记录见 design-brief §12）
