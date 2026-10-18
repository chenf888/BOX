# 盲文之树 · The Braille Tree

A braille-themed incremental game built on [The Modding Tree](https://github.com/Acamaeda/The-Modding-Tree) v2.7.
You start with a single sensation under a fingertip and end with a library you can read by touch.

**Play:** open `index.html` in a browser. No build step. A local static server is recommended
(`python -m http.server` or `npx serve`); opening the file directly also works in current browsers.

**Save key:** `the-braille-tree-v83pqm` — do not change `modInfo.id` in `js/mod.js`, or existing saves are orphaned.

## What is in the game

| | |
|---|---|
| Main layers | 10 — 指尖 → 六点/八点/盲文板 → 缩写/数学/音乐 → 词语/篇章 → 藏书楼 |
| Side layers | 2 — 成就 (50 achievements, 5×10) and 其他 (stats / story / settings) |
| Rows | 5 (0–4) |
| Upgrades | 113 |
| Milestones | 45 |
| Challenges | 2 (缩写盲文) |
| Buyables | 14 |
| Clickables | 3 (摩挲 / 校准 / 辨读) |
| Bars | 2 (触觉敏感度, 阅读进度) |
| Grids | 2 (2×3 six-dot board, 2×4 eight-dot board) |
| Languages | 4 complete packs: 中文, English, 盲文·中文, Braille·English |

The two dot boards are the core interaction: raise dots to match a target cell, then press the
prestige button. Six-dot has 64 combinations, eight-dot has 256; both are hard caps and both are
also the theme. The specialist codes (contracted, Nemeth, music) are static layers bought with
盲文纸 (paper), and each one feeds the word layer. The library is a `resetsNothing` collection
layer: shelving a book never wipes the tree, and 1,000 books ends the game.

## Languages

The language switch is in **其他 → 设置**. Changing it reloads the page; the save is kept.
A fresh profile starts in **`brl-en` (Braille · English)**.

- `zh` — 简体中文
- `en` — English
- `brl-zh` — 盲文·中文 (Chinese braille cells, generated from liblouis `zhcn-g1.ctb`)
- `brl-en` — Braille·English (Grade-1, capital and number signs)

Braille cells are Unicode symbols, so browsers see no word boundaries between them. In the two
braille modes the page adds `html.brl-mode`, which enables `word-break: break-all` /
`overflow-wrap: anywhere`; long passages wrap instead of forcing a horizontal scrollbar.
Static digits in the English braille pack are converted too (one number sign per digit run),
so the six/eight layer symbols are `⠼⠋` / `⠼⠓`, not `6` / `8`.
The language preference is stored under `the-braille-tree-v83pqm.lang.v2` (bumped once so the
new default takes effect for existing profiles).

Every user-facing string goes through `t(key, fallback)`. The packs are generated, not hand-edited:
edit `tools/texts.js`, then run `node tools/build_lang.js`. A missing key is a build error.
Braille attribution and the LGPL notice are in `js/lang/NOTICE-braille.md`.

## Pacing and measurement

Every pacing constant lives in `js/tuning.js` and is read by both the game and the simulator.
The design brief is `design-brief.md`; the measured numbers below supersede its early estimates.

```
node tools/simulate.js . --max-hours 300 --dt 1 --click 1
```

Latest headless run (greedy policy, one prestige press per layer per second, no challenges /
achievements / clickables):

| Milestone | Sim time |
|---|---|
| first purchase | 2 s |
| first touch prestige | 6 s |
| six-dot board | 67 s |
| slate / paper | 83 s |
| eight-dot board | 91 s |
| contracted | 125 s |
| Nemeth | 179 s |
| music | 18 min |
| words | 2.8 h |
| passages | 3.0 h |
| library | 5.1 h |
| 1,000 books (endgame) | **5.1 h** |

The simulator is a **lower bound**: it buys everything instantly, presses every second, and ignores
challenge rewards, achievements, clickables, offline time and human dithering. A real playthrough is
roughly 4× longer, which puts the intended range at 10–30 h. Re-run the sim after changing
`js/tuning.js`; do not hand-edit numbers in the layer files.

## Checks

```
node TMT-Skill/scripts/static_checks.js .
node TMT-Skill/scripts/i18n_check.js .
node tools/smoke.js .
node tools/build_lang.js
```

Expected: static `67 PASS / 15 WARN / 0 FAIL` (every WARN has an acceptance reason in
`design-brief.md` §9.1), i18n `0 FAIL`, smoke `0 FAIL` (one harmless `extra` content warning),
and the language build reports `639 keys`.

## Runtime notes (fixed during browser verification)

- `js/technical/loader.js` waits for every dynamic mod script's `onload` **and** for
  `document.readyState === "complete"` before calling `load()`. Loading earlier left
  `layers.touch` undefined and loaded `player.touch.points` as a string, which crashed the
  first `gte()` call. `index.html` no longer calls `load()` from `<body onload>`.
- Six-dot and eight-dot unlock from `update()` when touch reaches `TUNING.REQ.six/eight`.
  The engine only opens a layer when `canReset()` is true, and `canReset()` needs a matched
  pattern, which needs the board open — the explicit unlock breaks that deadlock.
- `slate`, `words` and `library` guard `update()` with `player[layer].unlocked`, not
  `layerShown()`. `layerShown()` is a teaser flag and let locked layers produce currency.
- Microtab `content` is always an array (`content: ["upgrades"]`). A bare string as the whole
  `content` is iterated character-by-character by the engine's `<column v-for>`.
- Engine chrome (options, tooltips, dialogs, time units, endgame screen, popups) is localized
  through `ui.*` keys; the tree tooltip uses `lockTooltipText()` and `numWhole()`.
- Dead upgrades wired: `contracted 22` → words gain, `contracted 23` → touch/six/eight gain,
  `music 21` → paper gain.
- Touch upgrade descriptions were corrected to match `TUNING.MULT` (×2/×2/×3/×2/×100).
- `EIGHT_TARGETS` starts at mask 1 and puts the blank cell last, so an empty board is not
  “matched” at spawn; all 256 cells remain learnable.
- Long braille text wraps: `html.brl-mode` (set when the active pack is `brl-zh`/`brl-en`)
  applies `word-break: break-all; overflow-wrap: anywhere`. Measured on the touch tab:
  without it the column's `scrollWidth` was 1836 px against a 634 px viewport; with it,
  634 px, so no horizontal scrollbar.
- Default language is `brl-en`; the preference key was bumped to
  `the-braille-tree-v83pqm.lang.v2` so old `zh` preferences do not mask the new default.
- The achievement tooltip is a multiline `:text="..."` attribute; it used double quotes
  inside `t("ui.youDidIt", ...)`, which closed the attribute early and leaked raw template
  text onto every achievement card. It now uses single quotes. Integer counters
  (`numWhole`) are used for the earned count, learned cells, caps and sense level, so they
  render as `2 / 50`, not `2.00 / 50.00`.

## Files

```
index.html                 loads engine → lang packs → mod.js
js/mod.js                  modInfo, modFiles, global multipliers, getPointGen
js/tuning.js               every pacing constant + the 64/256 target tables
js/layers/touch.js         row 0 anchor: clickables, bar, 15 upgrades
js/layers/six.js           row 1: 2×3 dot board, 64-cell cap
js/layers/eight.js         row 1: 2×4 dot board, 256-cell cap
js/layers/slate.js         row 1: paper production and shop
js/layers/contracted.js    row 2: static, 2 challenges
js/layers/nemeth.js        row 2: static
js/layers/music.js         row 2: static
js/layers/words.js         row 3: normal, reading bar
js/layers/passages.js      row 3: normal
js/layers/library.js       row 4: custom, resetsNothing, endgame
js/layers/side.js          achievements + stats/story/settings
js/lang/                   generated packs + braille maps
tools/texts.js             single source of every string
tools/build_lang.js        key check + pack/braille-map generator
tools/smoke.js             load-time harness
tools/simulate.js          headless pacing harness
tools/zhcn-g1.ctb          liblouis Chinese braille table (LGPL-2.1+)
```

## Attribution

- Engine: The Modding Tree v2.7 by Acamaeda and contributors.
- Chinese braille table: liblouis `tables/zhcn-g1.ctb`, © 2018 Sunian Loomee and the NVDA Chinese
  website, LGPL-2.1-or-later. See `js/lang/NOTICE-braille.md`.
- English braille: standard Grade-1 letter assignments, implemented directly.
- Fonts: Inconsolata (Google Fonts), loaded from the CDN in `index.html`.
