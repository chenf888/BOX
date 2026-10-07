# Design Brief — The True Color Tree (真彩之树)

> Filled at Stage 2 per SKILL.md. Sources: `assets/blueprints.json` (medium), `assets/balance-defaults.json`, `assets/fun-quota.json`, handbooks 09–13.
> Engine template: **The-Modding-Nebula** (user's UI-enhanced TMT v2.7 fork) via `scaffold.js --from`.

## 1. Identity

| Field | Value |
|---|---|
| Game name | The True Color Tree (真彩之树) |
| Author | chenf888 |
| Points name (`modInfo.pointsName`) | `Light` (亮度) |
| Language mode (Q7) | Bilingual EN+中文 (P17 `window.chinesemode` ternaries on all user-facing strings) |
| One-line pitch | Wake a monochrome monitor's prism: split white light into R/G/B channels, climb all 255 levels of each, mix complements, and complete the 24-bit palette — all 16,777,216 colors. |

## 2. Interview record (answers → parameters)

| # | Question | Answer | Locked parameter |
|---|---|---|---|
| Q0 | Theme | 24-bit true color as the game content | RGB/channel/bit-depth structure below |
| Q1 | Theme-structure confirmation | Confirmed as described | theme = structure mapping (§3) |
| Q2 | Scale | **Custom: "one layer per color — 16,777,216 layers, made feasible"** → user confirmed the color-cube solution: real tree = medium blueprint, cube = completion space | blueprint `medium` rows/quotas + cube mechanic (§3); endgame = palette completion (§7) |
| Q3 | Natural ceilings | Mixed | cap table §8 (channel 255, palette 2^24, hue 360°, saturation 100 hard; light unbounded) |
| Q4 | Pacing | Mostly idle/AFK-friendly | P8b-flavored passive income via `passiveGeneration`; long automation ladder (8 steps) |
| Q5 | Side content | Full | M1 classic challenges (M2 dropped — see §2b) + achievements 5×10 + story/dashboard side layer |
| Q6 | Automation & timewalls | Automate everything eventually | full 8-step ladder, walls < 15 min |
| Q7 | Language & style | Bilingual EN+中文 | P17 convention; colors are the theme voice (each layer wears its own hue) |

Q1 recap the user confirmed:

- **Currencies (in order):** 亮度 Light (灰度光) → RGB channel values (each 0–255) → mixable distinct colors → true-color palette completion (target 2²⁴ = 16,777,216)
- **Layer topology:** white-light layer → R/G/B primary-channel layers → mixing layers (complements/hue/saturation) → true-color hub → endgame; higher rows reset lower rows; bit-depth eras 1→4→8→16→24 as milestone progression; **color cube volume = (r+1)(g+1)(b+1)**
- **Ceilings:** channel 255 and palette 2²⁴ are theme-native hard caps; base Light fuel stays unbounded

## 2b. Game type profile (Q4b)

Locked by `scripts/classify.js` (exit 0, `--q4 idle`). **Orthogonal to Q2** — the medium blueprint is untouched.

| Field | Value |
|---|---|
| Type | `passive-prestige` (被动声望链) |
| Confidence + margin | 0.83 / 0.963 (auto-routed) |
| Mandatory modules | layers `normal`\|`static` only; upgrades; milestones; mod.js |
| Optional modules used | buyables, challenges (M1), achievements, microtabs, bars-as-hud (display-only progress bars — no tick) |
| Forbidden (absent from the game) | `clickables`, `grid`, `update()` |
| Rules exempt | `D-NOUPDATE` (no tick is this type's correct shape) |
| Required rules enforced | `N-UNWIRED`, `D-REQLADDER`, `N-MSDESTROY` |

Modifiers:

| Modifier | Requires | Included? | Notes / why dropped |
|---|---|---|---|
| `sim` | — | **No** | planned use was ≤3 layers, but no layer needs a hand-rolled `update()` under the cube design — dropped as unnecessary (§10) |
| `score-attack` (M2) | type `active-*` + `sim` | **No** | type is passive-prestige; M2 records a peak in `update()` which the type forbids → challenges are M1 classic (§10) |
| `minigame` (M3) | type `active-*` | **No** | no clickables exist (forbidden by type) |
| `board` | — | No | no 2D board; the mosaic is a display, not a `grid:` component |
| `challenges` (M1) | — | **Yes** | 6 challenges, `canComplete()` dialect, `completionLimit: 3` |
| `caps` | — | **Yes** | channel 255 / palette 2²⁴ / hue 360° / saturation 100 hard caps |

## 3. Theme = structure mapping (P14)

The 24-bit color model IS the tree:

- **Light (亮度)** — unbounded base currency: raw brightness a monochrome screen emits.
- **Row 0 — 1-bit era.** `w` White Light: prestige light into 灰度 Grayscale values. Black-and-white only; the prism upgrade line foreshadows color.
- **Row 1 — 8-bit era.** `r`/`g`/`b` Red/Green/Blue channels: **static floors**; each prestige banks +1 channel *level* (0→255). The three level counts are the cube's axes. Green's requirements are the gentlest — a nod to 5:6:5 (the eye's extra green bit).
- **Row 2 — 16-bit era.** `c` Complements (CMY pairs — each upgrade couples two channels), `h` Hue (a 0–360° hard-capped wheel), `s` Saturation (0–100% hard-capped).
- **Row 3 — 24-bit era.** `cb` Chromatic Trials (color-blindness challenges), `t` True Color Hub (bit-depth floors gated by palette volume — the cube lives here), `p` Painter's Workshop (M8 shop).
- **The 16,777,216 layers** (Q2): the **color cube**. Color (R,G,B) is "lit" once every channel level ≥ its coordinate. Palette volume = (r+1)(g+1)(b+1) ≤ 256³ = 2²⁴. Every color is a real, addressable node of that space — rendered as a cached 16×16×16 mosaic (each block = a 16³ region) on the hub, plus live counters. One JS object per color would freeze the engine (per-tick layer iteration); volume-over-the-cube is the faithful representation the user confirmed.
- **Bit-depth eras** = hub milestones: 4-bit @ depth 3, 8-bit @ 7, 16-bit @ 15 (unlocks the 5:6:5 green bonus), 24-bit @ 23.

## 4. Layer chain table

One row per layer, bottom of the tree first. **This table is the code-generation contract.**

| id | name (theme voice) | row/pos | type | base resource → baseAmount | requires | exp/base | upgrades | milestones | challenges | buyables | automation granted (by whom) | softcap plan | doReset keeps | branches |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| p | Painter's Workshop 调色工坊 | 3 / 2 | normal, exp 0.25 | Grayscale → `player.w.points` | 5e9 | 0.25 | 15 (5×3) | 5 | — | 0 | (receives passiveGen from cb ms3) | pigment unbounded; no loop | (nothing above; none) | `["t"]` |
| t | True Color Hub 真彩枢纽 | 3 / 1 | static, **custom `getNextAt()` = `2^points` (volume)**, exp 1 | Palette volume 色板体积 → `cubeVolume()` (computed) | function of volume | 1 / n/a | 15 (5×3) | 6 | — | 0 | t ms5 (depth 20): **row-3 package** — c/h/s get autoPrestige+autoUpgrade+resetsNothing | depth is a counter; volume capped 2²⁴ | (nothing above; none) | `["c","h","s"]` |
| cb | Chromatic Trials 色觉试炼 | 3 / 0 | static, base 2 | Grayscale → `player.w.points` | 1e8 | 1 | 5 | 4 | 6 (completionLimit 3) | 0 | cb ms3: p passiveGeneration | trial count unbounded (9 completions max per challenge) | keep `["unlocked","milestones"]` | `["c","h","s"]` |
| s | Saturation 饱和度 | 2 / 2 | static, base 2, **hard cap 100** | Grayscale → `player.w.points` | 5e7 | 1 | 10 (5×2) | 3 | — | 0 | s ms2: c autoUpgrade | hard cap 100 (canReset false at cap) | keep `["unlocked","milestones","points"]` + ms-gated upgrades | `["h","b"]` |
| h | Hue 色相 | 2 / 1 | static, base 2, **hard cap 360** | Grayscale → `player.w.points` | 1e7 | 1 | 10 (5×2) | 4 | — | 1 | h ms2: **r/g/b autoUpgrade** | hard cap 360 | keep `["unlocked","milestones","points"]` + ms-gated upgrades | `["g","b"]` |
| c | Complements 补色 | 2 / 0 | static, base 3 | Grayscale → `player.w.points` | 2e6 | 1 | 15 (5×3: cyan/magenta/yellow sets) | 5 | — | 1 | c ms1: **channels resetsNothing**; c ms2: **channels autoPrestige** | complement count unbounded but costs ×3^lvl self-limit | keep `["unlocked","milestones","points"]` + ms-gated upgrades | `["r","g","b"]` |
| b | Blue 蓝 | 1 / 2 | static, base 2, **cap 255** | Grayscale → `player.w.points` | 12500 | 1 | 12 (5-col grid) | 5 | — | 1 | b ms0: **w autoUpgrade** | level cap 255 (canReset false at 255) | keep `["unlocked","milestones","points"]` **always** + ms-gated `["upgrades","buyables"]` | `["w"]` |
| g | Green 绿 | 1 / 1 | static, base 2, **cap 255** | Grayscale → `player.w.points` | 2500 | 1 | 12 | 5 | — | 1 | g ms0: **w autoPrestige** | level cap 255; 16-bit era: green next-level cost ×0.5 (5:6:5) | same as b | `["w"]` |
| r | Red 红 | 1 / 0 | static, base 2, **cap 255** | Grayscale → `player.w.points` | 500 | 1 | 12 | 5 | — | 1 | r ms0: **w resetsNothing**; r ms1: **w passiveGeneration** | level cap 255 | same as b | `["w"]` |
| w | White Light 白光 | 0 / 0 | normal, exp 0.5 | Light → `player.points` | 10 | 0.5 | 15 (5×3) | 5 | — | 2 | (receives ladder from r/g/b; P10 anchor — every layer boosts it) | layer softcap @1e15 power 0.4, raised to 1e40 by t upgrade (visible) | keep `["unlocked","milestones"]` + ms-gated `["upgrades","buyables"]` | (root) |
| a | Achievements 成就 | side | none | — | — | — | — | 50 achievements, 5×10 grid | — | — | P11 guarded backfill (alternate automation path: backfills channel milestones) + ONE direct automation grant (ach 34 → w passiveGeneration, Mario-Maker pattern) | — | — | — |
| d | Story & Palette Dashboard 故事与色板 | side | none | — | — | — | — | 8 story chapters (unlock-gated by eras) + live cube dashboard + 1 completion bar | — | — | — | — | — | — |

**Channel-level integrity rule (N-MSDESTROY / cube monotonicity):** r/g/b/c/h/s `points` are LEVELS — never spent, never wiped. Channel `doReset` always keeps `points`; channel upgrades/buyables are paid from **Grayscale** (`player.w.points`) via custom `canAfford()`+`pay()` — never from the level counter. Milestones gate on levels/best (persist). ⇒ the cube can never shrink.

### Wiring web (P10 / self-checks 4 & 12)

`w.gainMult()` is the game's spine — every layer contributes ≥1 line:

- w upgrades 11–15 (K1 early flats), w milestones, w buyables
- r/g/b: each has ONE pow-shaped line `level^0.4` **only on r** (Σ self-exponents 0.4 ≤ 0.6); g and b contribute **linear** per-level lines `1 + 0.5·level` (no exponents)
- c: flat ×(1 + 0.4·level) + its upgrade effects; h: hue-phase exponents on NAMED resources (K4); s: saturation-scaled flats; cb: `hasChallenge()` rewards; t: bit-depth flat per depth; p: shop effects
- ≥1 upgrade per new layer boosts **light production** (`getPointGen`) directly (upgrades 11 of r/g/b) — "does w upgrade 11 matter at endgame?" YES: light feeds grayscale feeds levels.

## 4.1 Fun density table (handbook 10)

| id | content items | effect-kind plan (K1 ≤ 40%, ≥3 non-K1 kinds) | organization | mechanics |
|---|---|---|---|---|
| w | 15U+5M+2B | K1 ×5 (u11 ×2 cost 1 — first boost <10 s; u13; u14; m0 ×2.5); K6 ×2 (u15 conditional on light ≥1e6; u25 if grayscale > threshold); K7 ×2 (u15 unlock buyable tab, u35 unlock buyable 2); K5 ×1 (buyable cost −); K3 ×1 (u45 sources channel-sum) | tabFormat main/button/ctx; microtabs (Upgrades\|Buyables\|Milestones) at 22 items | M5-adapted buyable economy |
| r/g/b | 12U+5M+1B each | K3 ×3 (cross-channel sources: "green tints red"); K2 ×2 (level^0.4 on r only — softcapped; g/b linear); K5 ×2 (next-level cost −10%); K6 ×1; K1 ×3; K7 ×1 (unlock buyable) | tabFormat; microtabs at 18 items (Upgrades\|Milestones\|Buyables) | P4 automation carriers |
| c | 15U+5M+1B | K3 dominant (each upgrade couples two channels: 青=G+B, 品红=R+B, 黄=R+G); K5 ×3 (cost reducers); K7 ×2; K1 ×4; K6 ×1; **one deliberate key-drop cost 7** (D-COSTSPAN rhythm) | microtabs (Cyan\|Magenta\|Yellow\|Milestones) | K3 web heart |
| h | 10U+4M+1B | K4 ×3 (hue-phase: red/green/blue gain ^1.03–^1.08 — named-resource exponents); K2 ×2; K6 ×2; K1 ×2; K7 ×1 | microtabs | hard-cap showcase (360°) |
| s | 10U+3M | K5 ×2; K6 ×3 (saturation thresholds pay big); K1 ×3; K3 ×2 | tabFormat | hard-cap showcase (100%) |
| cb | 5U+4M+6C | challenge rewards K1/K4 via `challengeEffect()` scaling with completions; upgrades K6 ×2, K1 ×2, K7 ×1 | microtabs (Trials\|Upgrades\|Rewards) | **M1** — six color-blindness trials, nerfs injected via `inChallenge()` in OLDER layers' formulas, rewards via `hasChallenge()` |
| t | 15U+6M | K4 ×4 (per-bit-depth powers on named resources); K5 ×2 (raise w softcap 1e15→1e40, visible); K2 ×2; K1 ×3; K7 ×2 (unlock p, unlock mosaic detail view); K6 ×1 | **the cube mosaic + volume counters** + microtabs (Palette\|Upgrades\|Milestones) | cube visualization; era milestones |
| p | 15U+5M | M8 shop: K4 ×4 (channel gain ^1.01–^1.1); K5 ×3 (cost reducers; G-bonus +1 level); K2 ×2; K1 ×2; K7 ×2; K6 ×1 | microtabs (Shop\|Milestones) | **M8** meta-shop |
| a | 50 achievements | M10 collection: first-colors, channel levels 64/128/255, volume powers 2^4…2^24, challenge collections, joke colors (#000000 avoidance club) | 5×10 grid, all visible (dimmed when locked) | M10 + P11 backfill |
| d | 8 story chapters + dashboard | P13 dashboard: live volume/bit-depth/channel readouts + 1 completion bar | story paragraphs unlock-gated per era | P13 side dashboard |

## 4b. Game-level fun plan (medium quota row)

| Quota (fun-quota.json `medium`) | Planned | Where |
|---|---|---|
| Distinct mechanics ≥4 | **M1, M5-adapted, M8, M10** (+M6 overpowered milestone variants on t) | cb / cb shard shop / p / a |
| Challenge layer (M1 or M2) | **M1 classic** ×6, `canComplete()` + `completionLimit: 3` | cb |
| Clickable group(s) | **0 — forbidden by type** (deviation §10) | — |
| Bar(s) ≥1 | **1** — palette-completion bar on d (display-only `progress()`, no tick) | d |
| Layers with `update()` ≥3 | **0 — forbidden by type** (deviation §10; D-NOUPDATE exempt) | — |
| Secondary currency ≥1 | **棱镜碎片 Prism Shards** on cb: earned per challenge completion (not per tick), spent on cb's dedicated buyable (challenge-eff boosts) | cb |
| Shop/meta layer (M8) | **p** Painter's Workshop | p |
| Custom-type ritual layer (M7) | **0** — `type:"custom"` is outside the passive-prestige layer contract (deviation §10); t achieves the ritual feel with a custom `getNextAt()` on a static base | — |
| Story presentation | **d** own microtab, unlock-gated | d |

## 5. Tree sketch

```
row3:   [cb 色觉试炼]   [t 真彩枢纽]   [p 调色工坊]
row2:      [c 补色]      [h 色相]      [s 饱和度]
row1:      [r 红]        [g 绿]        [b 蓝]
row0:               [w 白光]
side:   (a 成就 5×10)   (d 故事/色板仪表盘)
```

Symbols (2 chars): W R G B C H S X T P; colors (all light on the dark page — N-CONTRAST): w #ffffff, r #ff8080, g #80e8a0, b #80aaff, c #7de8dc, h #d9a0ff, s #c8c8c8, cb #ffd27d, t #ffe066, p #ff9ed2.

Hotkeys (key in description — N-HOTKEYDESC): w "W", r "R", g "G", b "B", c "C", h "H", s "S", cb "X", t "T", p "P".

## 6. Automation ladder (8 steps + package deal; Q6 full ladder)

P4 order; **no two milestones of the same layer grant the same flag** (each flag appears once below); thresholds ascending so `autoPrestige`'s milestone set always implies `resetsNothing`'s (N-AUTOWIPE).

| Step | Grants (chore that dies) | Granted by | Threshold |
|---|---|---|---|
| 1 | w `resetsNothing` (channel resets stop wiping grayscale) | r ms0 | red level 3 |
| 2 | w `passiveGeneration` (grayscale accrues without reset) | r ms1 | red level 8 |
| 3 | w `autoPrestige` | g ms0 | green level 3 |
| 4 | w `autoUpgrade` | b ms0 | blue level 3 |
| 5 | r/g/b `resetsNothing` | c ms1 | complements 8 |
| 6 | r/g/b `autoPrestige` | c ms2 | complements 20 |
| 7 | r/g/b `autoUpgrade` | h ms2 | hue 90° |
| 8 | **row-3 package**: c/h/s get `autoPrestige`+`autoUpgrade`+`resetsNothing` in one milestone (blueprint-sanctioned row-3 package) | t ms5 | bit depth 20 |
| — | p `passiveGeneration` | cb ms3 | 9 total trial completions |
| — | P11 backfill (guarded `!has` pushes): achievements restore channel milestones/upgrade | a layer | various |

All automation flags read milestones via `hasMilestone()` (milestones kept in doReset) — no dead `"auto"` keep-list entries (N-AUTOWIPE clean).

## 7. Endgame definition

- `isEndgame()`: `player.r.points.gte(255) && player.g.points.gte(255) && player.b.points.gte(255)` ⇔ palette volume = 2²⁴ = 16,777,216 (all 24 bits).
- Hub progression: bit depth d (hub floors) requires volume ≥ 2^d — eras at 4/8/16/24 bits are t milestones.
- Reachability estimate (Stage 6 method): grayscale production at row-1 unlock ~×45 over base; requires steps ×50 (row0→1), ×4000 (row1→2, justified §10), ×50 (row2→3), and the cube's internal 255-step ×2 ladder (500 → 3e79 grayscale across all levels). Estimated total ≈ 12–18 h (target 10–30 h, Q6 walls < 15 min). Per-row pacing constants: **ROW_RATIO = [×50, ×4000*, ×50] vs OUTPUT_STEP = [×35, ×2800, ×35] → per-row time ×1.43, ×1.43, ×1.43** (all within ×1.1–×1.6; *row1→2 ratio justified in §10).
- `winText` (bilingual): "You completed the full 24-bit palette — all 16,777,216 colors! / 你集齐了完整的 24 位色板——16,777,216 色，无一缺席！"

## 8. Cap table (per currency)

| Currency | Ceiling? | Cap mechanism | Where |
|---|---|---|---|
| Light (亮度) | none | P12 layer softcap on grayscale reset gain @1e15 pow 0.4 → 1e40 (t upgrade, visible) | w `softcap`/`softcapPower` |
| Grayscale (灰度) | none (fuel) | cost shaping only (author rule: cost scaling first) | channel cost curves |
| r/g/b levels | **yes: 255** | hard: `canReset()` false at 255; `getNextAt()` → Infinity past cap; ladder STOPS | channel layers |
| Complements | soft (×3^lvl self-limits) | cost curve only | c |
| Hue | **yes: 360°** | hard cap, ladder stops | h |
| Saturation | **yes: 100%** | hard cap, ladder stops | s |
| Palette volume | **yes: 2²⁴** | product of capped channels | t (computed) |
| Bit depth | **yes: 24** (display) | volume gate grows as 2^d | t |
| Trial completions | 3 per challenge | `completionLimit: 3` | cb |

## 9. Self-check results (20 checks)

1. ☑ Requires ladder monotonic; row0→1 ×50, row1→2 ×4000 (WARN justified §10), row2→3 ×50.
2. ☑ First layer requires 10 (mode).
3. ☑ Every main layer ≥10 upgrades (w 15, channels 12, c 15, h/s 10, cb 5+6 challenges, t 15, p 15) + ≥3 milestones.
4. ☑ Every new layer boosts ≥2 older layers (w.gainMult web, §4); r-upgrade-11 (light boost) matters at endgame via light→grayscale→levels.
5. ☑ Automation ladder 8 steps, P4 order, one chore per step (row-3 package is the blueprint-sanctioned exception), cross-layer grants; no automation-grant collisions (§6 table is the uniqueness proof).
6. ☑ Softcap plan: light/grayscale shaped by cost curves; single w reset-gain softcap (visible raise); hard caps per §8.
7. ☑ A1–A10 sweep: none present (A7 guarded by the wiring web; A8 by the ladder table).
8. ☑ Effect diversity: K1 shares ≤ 40% per layer (fun-density table); ≥3 non-K1 kinds per layer.
9. ☑ Organization: tabFormat everywhere; microtabs where ≥3 content groups; context display-texts (channel level, next cost, softcap warning, volume) above tabs.
10. ☑ Game-level fun quota: §4b (type-forbidden rows documented, not silently missing).
11. ☑ Multiplier budget: ONE self-shaping line (r level^0.4, softcapped) wired into w.gainMult; Σ self-exponents = 0.4 ≤ 0.6; end-of-row-0 flat zones ≈ ×45 « 1e4.
12. ☑ Wiring plan: every upgrade classified token/K7 (no effect) or value (effect + named consumer in the wiring web) — enforced during generation; N-UNWIRED target 0.
13. ☑ Cost ladders ≥6 orders per layer (channel upgrade costs 1e3→1e12 grayscale; t 1e10→1e45; p 5e9→1e30; w 1→1e6), key drops: c key-upgrade cost 7, w key upgrade cost 3.
14. ☑ Component density 10–22 per main layer; challenges ≤ 15% of layer upgrades (cb: 6C vs 5U — cb is the challenge layer, ratio noted).
15. ☑ Author pacing: first boost <10 s (cost-1 u11); resets >1 min always pay (milestone chain + upgrade ladder); major resets speed up from second one (web multipliers); no hard resets.
16. ☑ Upgrade discipline: one production bonus per upgrade (≤2 across distinct resources); no upgrade-boosts-upgrade (K4 targets named resources only); layers gated by threshold, never pay-to-enter.
17. ☑ Cost before softcap: cost() curves are the shaping tool; softcap only on w reset gain, raise sold visibly.
18. ☑ Row pacing written as constants: §7 (×1.43 per row).
19. ☑ Reset lifecycle: channel/row-2 milestones gate on kept fields (`points`/`milestones`); `autoPrestige` sets imply `resetsNothing` sets (§6); NO `update()` anywhere (N-POINTSWRITE trivially clean); **every static layer has `canBuyMax()`** (r/g/b/c/h/s/cb/t — via upgrades/milestones).
20. ☑ Type contract: mandatory modules present (normal/static layers, upgrades, milestones, mod.js); forbidden modules absent (no clickables/grid/update); modifier dependencies hold; dropped modifiers have §10 reasons.

## 10. Deviations & open questions

| Default overridden | Value used | Why |
|---|---|---|
| Blueprint scale (Q2) | medium real tree + color cube carrying 16,777,216 "layers" | user's explicit request; cube solution confirmed by user (Q2 follow-up) |
| Engine template | The-Modding-Nebula fork (`--from`) instead of bundled stock | user's explicit request; core engine files verified byte-identical (game.js, utils.js, technical/layerSupport.js, temp.js, utils/save.js); only UI files differ (components.js, canvas.js, displays.js, systemComponents.js, treeView.js, utils/options.js) |
| Q5 "M2 score-attack hub" | M1 classic challenges | M2 requires `active-*` type + tick; type is passive-prestige (classifier-routed, user-confirmed Q4b) |
| Fun quota medium: clickables ≥1, update-layers ≥3 | 0 / 0 | forbidden by the passive-prestige contract; D-NOUPDATE exempt; D-MECHQUOTA WARN expected & justified here |
| Fun quota medium: M7 ritual layer | none (`type:"custom"` unused) | outside the passive-prestige layer contract; hub uses custom `getNextAt()` on a static base instead |
| M5 secondary currency production | challenge-completion-earned (not `update()`-produced) | update() forbidden by type |
| `sim` modifier | dropped | no layer needs hand-rolled tick logic under the cube design |
| Row-1 unlock via P7 exit-ticket upgrade | **threshold unlock** (grayscale requires + layerShown milestone) | handbook 12 #16/#28 (pay-to-enter is a bad gate; N-UNLOCKPAYGATE) — author authority outranks blueprint's unlockTrigger |
| Adjacent-row requires ratio row1→2 = ×4000 | literal requires c 2e6 | the row-1 band contains the cube's 255-step ×2 doubling ladder (grayscale 500 → 3e79); ×10–×100 is structurally unsatisfiable there; row-2 layers additionally gate on channel maturity via layerShown thresholds — D-REQRATIO WARN accepted with this reason |
| Static-layer upgrade currency | paid from Grayscale via `canAfford()`+`pay()`, never from level `points` | levels ARE the cube axes; spending them would shrink the palette (cube integrity, Q1-confirmed structure) |
| Row shape: row2 = 3 layers, row3 = 3 layers (cb in row 3) | cb unlock era ≈ 5e7× first-layer currency ⇒ row 3 | medium row2 says 2–3, row3 1–2; cb moved to row3 to keep the challenge unlock point; total 10 main layers = blueprint minimum |
| modInfo.pointsName | `Light` (single language) | engine HUD renders one string; Chinese mode localizes via displayThings + P17 ternaries everywhere else |
| VERSION.num | `0.1` from scaffold, changelog documents v0.1 | M-VERCMP safe (text compare documented) |
| Channel layers generated via a shared factory | **rejected — all three layers fully inlined** | the static checker (and the corpus archive lesson about factory-built components) cannot see through `addLayer(id, factory(...))`: row/startData/upgrades vanish from analysis; caught by Stage 5 as 8 FAILs, fixed by inlining |
| `t.requires` literal `new Decimal(4)` | `requires: function() { return new Decimal(4) }` | the requirement is VOLUME-denominated (4 palette volume), not Grayscale — a literal would be cross-currency-compared against row-2's 2e6 grayscale and FAIL D-REQLADDER backwards; function form is the checker's designed escape for dynamic/cross-currency requires |
| Channel `autoPrestige()` gate | `hasMilestone("c",2) && hasMilestone("c",1)` | N-AUTOWIPE compares milestone-ID SETS literally (it cannot prove thresholds ascend); widening the auto gate to include the resetsNothing milestone makes the set implication explicit — semantics unchanged, invariant now statically provable |
| Engine `js/technical/displays.js:45` | `visibility: hidden` → `grayscale(0.7) + opacity 0.55` | N-ACHVIS: the Nebula fork kept the engine default that hides uncompleted achievements; the skill's canonical dim-patch applied (skill template ships this same patch) |

## 11. Stage 6 — Balance walkthrough (measured, 2026-10-07 v0.2)

The v0.1 paper estimate (8–18 h) was wrong: the user completed the game in 2.5 h. Per handbook
11 §4.1 ("extrapolation is a lower bound — measure"), a headless simulator (`tools/simulate.js`)
was built — it loads the REAL layer definitions and drives the economy with the engine's own
`getResetGain`/`getNextAt` formulas. Findings, each verified in-sim:

1. **Automation bug (real defect):** the g m0 / b m0 milestones promised w autoPrestige /
   autoUpgrade but the flags were never generated — the user played the whole game manually.
   Fixed. g m0 re-scoped to a gray boost: the engine's `resetsNothing` short-circuits the layer's
   own reset (game.js:211), so a row-0 autoPrestige flag is unsound (N-AUTOWIPE FAIL agreed).
2. **The detonation driver was the buyable block** (prisms/filters): effect ×1.4–2^n with cost
   ×2–3^n composed into income' ∝ income^≈2 — supercritical. Effects reined to ×1.15–1.3^n
   (sub-critical): peak income 4.3e73 → 2.75e70, all 8 wiring trims + t-ladder ×3000 re-spacing
   + softcap retune were secondary to this.
3. Milestone production rewards cut ~×1e7 total; trial rewards 2^completions → 1.6^completions;
   unlock thresholds staggered across 9 orders of magnitude (c 1.5e6 / h 1e9 / s 1e12 / cb 1e15 /
   p 4e18) with rebased first costs; channel upgrade ladders stretched (tops 5e21→5e32).
4. **Measured status:** sim total 0.77 h (sim is a lower bound — no achievement effects, perfect
   greedy play; user's manual v0.1 run was 4× the sim's 0.62 h). Expected real v0.2 ≈ 2–3 h —
   still below the 10–30 h target. **The remaining mid-game cliff** (income 1e6→1e60 in one
   cascade at c-unlock) is a coupled-feedback problem (milestone→income→banking→milestone);
   closing it needs another sim-driven iteration on the row-2/3 threshold schedule — the
   simulator infrastructure for that now exists.

Multipliers & softcaps: w reset-gain softcap now 1e6 → 1e9 (w m1) → 1e30 (t u14) → 1e60 (p m4),
power 0.3, all visible (display-text warning on w). Σ self-exponents in any gainMult still 0.4.


**Multiplier-zone walk (Stage 6 step 5):**

| Era | Product of independent gray-mult zones active | vs requires ladder | Verdict |
|---|---|---|---|
| r unlock (gray 500) | w upgrades ≈ ×84 (u11 2 × u12 2 × u14 1.5 × u21 ~7 × u22 2) | row-1 entry 500 | ×84 « 1e4 — ladder is real ✓ |
| c unlock (gray 2e6) | w ≈ ×1e4 (m0 ×2.5, u24 ~×6, u34 ×8) + channels ≈ ×3.4e3 | row-2 entry 2e6 = ×4000 of row-1's 500 | output step ≈ ×2800 → per-row time ≈ ×1.4 ✓ (in ×1.1–×1.6) |
| Endgame tail (levels 200→255) | full stack ≈ ×1e100+ (t/p/cb deep zones) | channel ladder needs income ≈ 3e79 at level 255 | income crosses ~1e80 during the p era → the tail banks quickly. **This overshoot is by design and safe**: the cube's hard caps (255/channel) give excess production nowhere to go — the final stretch is a quick celebration, not a wall (Q6: walls < 15 min) |

**Runaway-loop audit:** no currency feeds itself — gray sources light/levels/complements/hue/saturation (never gray); light sources never light. The two cross-loops (r21 level^0.4 → gray → levels; p22 pigment^0.3 → gray → pigment) are sublinear, softcapped (1000 / 1e6), and pass through static banking (cost ×2^level) — damped. w reset-gain softcap (1e15→1e18→1e40, all visible) is the single P12 cap. N-CAPMULT clean (no cap-valued effect in getPointGen).

**Reachability estimate:** first boost ~10 s (u11 cost 1); r unlock ≈ 10–20 min; b unlock ≈ 20–40 min; c/h/s ≈ 1–2 h; t (8-bit) ≈ 2–3 h; cb trials ≈ 3–5 h; 16-bit era ≈ 5–9 h; 20–24-bit tail ≈ 2–4 h → **total ≈ 8–18 h** (target 10–30 h ✓). Per-row pacing constants held at ×1.4 (§7). Residual uncertainty is concentrated in the mid-game (levels 60–150); fix by tuning channel requires if a playtest shows walls > 15 min — adjust the brief, then regenerate numbers, not code constants ad hoc.
