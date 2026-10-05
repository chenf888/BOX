# Design Brief — 交情 / **Ties**

> The Modding Tree v2.7 · generated 2026-10-05 · blueprint `small` · type `active-click`

## 1. Identity

| Field | Value |
|---|---|
| Game name | 交情 / Ties |
| Author | TMT Skill |
| `modInfo.id` | `ties-ycsj8e` |
| `modInfo.pointsName` | 话头 (talking points) |
| Language mode (Q7) | **Polyglot** — every sentence independently picks one of 16 languages (seeded, stable per save); a settings dropdown switches the whole game to any single language, incl. 中文 |
| One-line pitch | 你从一个只会寒暄的人，长成一个有知己、有社交圈的人 —— 而社交圈的天花板是邓巴数 150。 |

## 2. Interview record

| # | Question | Answer | Locked parameter |
|---|---|---|---|
| Q1 | Theme-structure confirmation | **确认如上描述** | theme = structure (P14), §3 |
| Q2 | Scale | **小型 5–7 层，2–4 小时** | blueprint `small` |
| Q3 | Natural ceilings | **有硬性上限** | hard cap `softcap(x, 150, 0)` on 社交圈; ladder stops at the cap (P8a) |
| Q4 | Pacing | **均衡** | default blueprint gains + fun-quota mechanics; one `type:"none"`-free design (no P15 loop layer needed — M4 lives inside `chat`) |
| Q5 | Side content | **完整** | M1 challenges + achievements + story/dashboard side layer |
| Q6 | Automation & timewalls | **全部自动化，无长墙** | 8-step ladder, every wall < 15 min |
| Q7 | Language & style | 每句话随机一种语言（混合语言），设置里可全局切中文 | polyglot engine: `t()` + seeded per-key pick + settings dropdown |

**Q1 recap (confirmed by user):**
- **Currencies (in order):** 话头 → 寒暄 → 熟人 → 朋友 → 知己 → 社交圈
- **Layer topology:** 4 relationship-stage layers (陌生人→熟人→朋友→知己) each resetting independently, all feeding one 社交圈 hub
- **Ceilings:** 邓巴数 150 (hard), plus soft time ceilings

## 2b. Game type profile (Q4b)

`node scripts/classify.js --explicit active-click` → **Type `active-click`, confidence 0.75, margin 0.32, exit 0.**

| Field | Value |
|---|---|
| Type | `active-click` |
| Mandatory | `clickables` — every one needs `canClick()` + `onClick()` and its state in `startData()` (rule `T-CLICKABLE`) |
| Forbidden | `grid` (no `board` modifier); only **one** interaction type |
| Exempt | none (`passive-prestige`'s `D-NOUPDATE` exemption does not apply) |

| Modifier | Requires | Included | Notes |
|---|---|---|---|
| `sim` | — | **yes**, 1 layer | `circle` is `type:"custom"` + hand-written `update()` (疏离度 drift). Budget is 3; we use 1. |
| `score-attack` (M2) | type `active-*` **and** `sim` | **no** | Q2 locked `small`; `fun-quota.json` marks the M2 hub `medium+`. Dropped with reason (not silently). |
| `minigame` (M3) | type `active-*` | **yes** | 读心 (mind-reading) run in `chat` — the discrete-action verb that makes this type honest. |
| `board` | — | **no** | a `grid` component would be a second interaction model; one type only. |
| `challenges` (M1) | — | **yes** | `canComplete()` dialect (corpus majority 45/57). |
| `caps` | — | **yes** | Dunbar 150 hard cap. |

## 3. Theme = structure mapping (P14)

The theme does not decorate the tree, it *is* the tree:

| Real-world concept | Game mechanic |
|---|---|
| 开口、找话题 | row-0 production: 话头/秒, boosted by chat upgrades |
| 寒暄 → 熟人 → 朋友 → 知己 | four prestige layers, each a deeper and rarer relationship, each with its own currency |
| 邓巴数 (Dunbar's number, 150) | **hard cap** on the hub layer 社交圈 — you literally cannot know more than 150 people who matter. The ladder stops there. |
| 已读不回 / 尴尬 | `circle.update()` drift (疏离度): the circle decays unless maintained, and decay is visible and purchasable against |
| 读心 / 尬聊 | M3 minigame: pay to start a run, one of five responses is the real one |
| 长期不联系 | M1 challenge 「长期不联系」 that zeroes passive generation |
| 默契 | M5 secondary currency inside 朋友 |

## 4. Layer chain table

| id | name | row | pos | type | base → baseAmount | requires | exp/base | upgrades | milestones | challenges | buyables | automation granted | softcap plan | doReset keeps | branches |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `chat` | 寒暄 Small Talk | 0 | 0 | normal | 话头 → `player.points` | `10` | 0.5 | 15 (5×3) | 5 | 2 | 2 | receives rN/pG/aP/aU | engine default (gain softcap `e1e7`, power 0.5) | — | — |
| `familiar` | 熟人 Acquaintance | 1 | 0 | normal | 寒暄 → `player.chat.points` | `250` | 1/3 | 10 (5×2) | 5 | 1 | 1 | receives aP; **grants** chat.rN, chat.pG | — | — | `chat` |
| `trust` | 朋友 Friend | 1 | 1 | normal | 寒暄 → `player.chat.points` | `400` | 1/3 | 10 (5×2) | 5 | 1 | 2 | receives rN/pG; **grants** chat.aP | — | — | `chat` |
| `closer` | 知己 Confidant | 2 | 0 | static | 交情 → `player.trust.points` | `12000` | base 2, exp 1 | 10 (5×2) | 4 | — | 2 | receives aP; **grants** chat.aU, trust.rN, familiar.aP | — | — | `trust` |
| `circle` | 社交圈 Social Circle | 2 | 1 | custom | 交情 → `player.trust.points` | `20000` | — | 10 (5×2) | 4 | — | 1 | receives aP; **grants** trust.pG, closer.aP | **hard cap 150** (`softcap(x,150,0)`) | — | `trust` |
| `achievements` | 人际成就 | side | 0 | none | — | — | — | — | — | — | — | alternate automation path (P11, guarded) | — | — | — |
| `diary` | 人际志 | side | 1 | none | — | — | — | — | — | — | — | — | — | — | — |

Component density per main layer (target 8–30): chat 28 · familiar 17 · trust 21 · closer 16 · circle 15 · achievements 15. ✓

**Requires ladder** (P2 / A1 / D-REQRATIO band ×10–×100):
`10` → `250` (×25) · `400` (×40) → `12000` (×30 of 400) · `20000` (×50 of 400).
Monotonic across rows 0 → 1 → 2. ✓

**Unlocking is by THRESHOLD, never by purchase** (handbook 12 §0 #1, rule `N-UNLOCKPAYGATE`):
chat upgrades cost 寒暄 and 熟人/朋友 also cost 寒暄 → buying an upgrade to unlock them would be paying twice for a hidden price. So each layer's `unlocked` flag is written by a **milestone on the layer below**, whose threshold sits well under the new layer's `requires`:

| layer | unlocked by | milestone threshold | its own `requires` |
|---|---|---|---|
| `familiar` | `chat` m2 `onComplete` | `chat.best ≥ 4` | 250 寒暄 |
| `trust` | `chat` m3 `onComplete` | `chat.best ≥ 9` | 400 寒暄 |
| `closer` | `trust` m0 `onComplete` | `trust.best ≥ 1` | 12000 交情 |
| `circle` | `trust` m1 `onComplete` | `trust.best ≥ 20` | 20000 交情 |

Upgrade `unlock`-text (K7) is used **only** for things that are free afterwards: the 读心 minigame tab, the challenge set, the 默契 tab.

### 4.1 Fun density table (K1 ≤ 60%/layer; ≥3 distinct non-K1 kinds/layer)

| id | content items | effect-kind plan | organization | mechanics |
|---|---|---|---|---|
| `chat` | 15U 5M 2C 2B 3click 1bar = 28 | K1: 11,12,13,14 · K2: 22,23 (`log10().pow()`) · K3: 31,32 (source 话头/熟人) · K4: 33 (倾听 fill ×1.5) · K5: 24 (upgrade cost ×0.8), 25 (softcap delay) · K6: 34 · K7: 15 (读心 tab), 35 (challenges) · K8: 21 (extra 话头/秒) | tabFormat: main-display, prestige-button, 3 context display-texts, `["microtabs","stuff"]` (升级 / 倾听 / 读心 / 里程碑) | **M4** (toggle+bar), **M3** (minigame) |
| `familiar` | 10U 5M 1C 1B = 17 | K1: 11,12 · K2: 22 · K3: 31 (from 寒暄), 32 (from 交情) · K5: 24 · K7: 15 (challenge) | tab: main/button/ctx + microtabs (升级 / 里程碑 / 挑战) | **M1** |
| `trust` | 10U 5M 1C 2B 2click = 20 | K1: 11,12 · K2: 23 · K3: 31,32 · K4: 33 (默契 ×1.4) · K5: 24 · K6: 34 · K7: 15 (默契 tab) | tab + microtabs (升级 / 默契 / 里程碑 / 挑战) | **M5** secondary currency 默契 |
| `closer` | 10U 4M 2B = 16 | K1: 11,12 · K2: 22,23 · K3: 31,32 · K4: 33 (canBuyMax speed) · K5: 34,35 · K7: 25 | tab + microtabs (升级 / 陈列 / 里程碑) | static floor (P5) |
| `circle` | 10U 4M 1B = 15 | K1: 11 · K2: 22 (`log10`) · K3: 31 (from 交情), 32 (from 知己) · K5: 33,34 (**cap-delay — the cap is VISIBLE**) · K6: 35 (drift penalty) · K7: 15 | tab + microtabs (升级 / 圈 / 里程碑) | **M7**-shaped custom layer, **sim** |

K7s are excluded from the K1 count (handbook 10 §2). No layer exceeds 60% K1; the highest is `chat` at 4/14 non-K7 = 29%.

### 4b. Game-level fun plan (`fun-quota.json` → `small`)

| Quota | Planned | Where |
|---|---|---|
| Distinct mechanics M1–M10 (≥ 2) | **6** | M1 challenges, M3 读心 minigame, M4 倾听 bar+toggle, M5 默契, M6 overpowered milestones, M10 achievements |
| Challenge layer | M1 classic ×4 | `chat` 2, `familiar` 1, `trust` 1 |
| Clickable group(s) | 3 + 2 | `chat`: 倾听 toggle + 读心 ×5 tile group; `trust`: 默契 2 |
| Bar(s) | 1 | `chat` 倾听 |
| Layers with `update()` (≥1) | **3** | `chat` (倾听/minigame), `trust` (默契 production), `circle` (疏离度 drift) |
| Secondary currency (M5) | 1 | 默契 in `trust` |
| Shop layer (M8) | — | not required for `small` |
| Custom ritual layer (M7) | `circle` | custom prestige + Dunbar cap |
| Story presentation | ✓ | `diary` side layer microtab 人际关系史 (P13 dashboard), unlock-gated |

## 5. Tree sketch

```
row2:              [ 知己 closer ] ─┐
                   [ 社交圈 circle ]┤   (both from 交情; circle is the hub)
row1:   [ 熟人 familiar ]   [ 朋友 trust ]
row0:          [ 寒暄 chat ]
side:  (人际成就)   (人际志)
```

## 6. Automation ladder (P4 order, 8 steps, one chore each — Q6)

| Step | Grants | Granted by | Threshold | N-AUTOWIPE safety |
|---|---|---|---|---|
| 1 | `chat.resetsNothing` | `familiar` m0 | `familiar.best ≥ 1` | — |
| 2 | `chat.passiveGeneration` | `familiar` m1 | `familiar.best ≥ 4` | — |
| 3 | `chat.autoPrestige` | `trust` m0 | `trust.best ≥ 2` | written as `familiar.m0 && trust.m0` → **implies** resetsNothing ✓ |
| 4 | `chat.autoUpgrade` | `closer` m0 | `closer.best ≥ 1` | — |
| 5 | `trust.resetsNothing` | `closer` m1 | `closer.best ≥ 2` | — |
| 6 | `familiar.autoPrestige` | `closer` m2 | `closer.best ≥ 3` | written as `familiar.m0 && closer.m2` ✓ |
| 7 | `trust.passiveGeneration` | `circle` m0 | `circle.best ≥ 1` | — |
| 8 | `closer.autoPrestige` | `circle` m1 | `circle.best ≥ 2` | written as `closer.m0 && circle.m1` ✓ |

No two milestones claim the same grant (`D-AUTOCOLLIDE`). `autoPrestige` never fires while its
`resetsNothing` brake is absent.

## 7. Endgame definition

- `isEndgame()` → `player.circle.points.gte(150)` — **the Dunbar cap itself is the win**. Thematic
  and mechanically honest: the ladder stops there (P8a).
- `winText`: 你把社交圈撑到了邓巴数的上限。150 个人 —— 再多一个，你就要开始忘了谁是谁。
- Reachability estimate: §Stage 6 walkthrough, target 2–4 h.

## 8. Cap table

| Currency | Ceiling? | Mechanism | Where |
|---|---|---|---|
| 社交圈 `circle.points` | **yes — 150** | hard cap `softcap(x, 150, 0)` (power 0 freezes it) | `circle.points()`; **the cap is shown in the tab** so cap-delay upgrades are honest |
| 寒暄 `chat.points` | no | engine default softcap on the gain, power 0.5 | layer default |
| 疏离度 `circle.drift` | no | cost scaling on the buyable that clears it; **no** softcap needed (it is subtracted, not compounded) | `circle.update()` |
| 默契 `trust.rapport` | no | log-shaped production, no runaway (sublinear) | `trust.update()` |

## 9. Self-check (20 checks)

1. ✅ requires monotonic, ×10–×100 adjacent rows (×25/×40/×30/×50)
2. ✅ first layer requires 10 (mode value)
3. ✅ every main layer ≥10 upgrades + ≥3 milestones
4. ✅ every new layer boosts ≥2 older layers in `gainMult` (familiar→chat, trust→chat+familiar, closer→chat+familiar+trust, circle→all four); layer-1 upgrade 11 matters at endgame
5. ✅ 8-step ladder, P4 order, no duplicate grants
6. ✅ hard cap for the theme ceiling; softcap plan for every unbounded loop
7. ✅ A1–A10 sweep clean (no thin layers, no 13-row monotony, no single-point automation)
8. ✅ K1 share per layer ≤ 60%; ≥3 non-K1 kinds per layer
9. ✅ `tabFormat` on every layer; microtabs at 6+ content groups; context display-texts above tabs
10. ✅ fun quota met (6 mechanics vs ≥2; 1 update layer vs ≥1; 1 bar; 1 secondary currency)
11. ✅ multiplier budget — see §10 note 1
12. ✅ every upgrade classified token/gate (K7) or value (effect + named consumer) — wiring table in `WIRING.md`
13. ✅ cost ladders span ≥6 orders with a deliberate cheap key upgrade per layer
14. ✅ density 8–30; challenges ≤15% of upgrades (4 challenges vs 55 upgrades = 7%)
15. ✅ first boost < 10 s (`chat` 11 costs 1 寒暄, reachable at ~10 s); every reset pays; no hard reset
16. ✅ one production bonus per upgrade; layers gated by threshold not purchase
17. ✅ cost scaling shapes the game; the one cap-raising upgrade sells a **visible** cap
18. ✅ row pacing written as two constants — §10 note 2
19. ✅ reset lifecycle: `best`/`total` kept wherever milestones read them; no `update()` assigns `.points`; `closer` has `canBuyMax()`
20. ✅ type contract: clickables present with `canClick`/`onClick` + `startData` state; no `grid`; every dropped modifier has a §10 reason

## 10. Deviations & open questions

| Default overridden | Value used | Why |
|---|---|---|
| 1. `small` rowPlan = 1 layer in row 2 | **2** (`closer` + `circle`) | Q1 confirmed the 社交圈 hub, and P14 requires the theme to dictate the topology. Row 2 is the hub row. |
| 2. row-2 upgrades = 5 | **10 each** | self-check #3 (`≥10 upgrades + ≥3 milestones`) outranks the rowPlan hint; both layers stay inside the 8–30 density band. |
| 3. automation ladder = 5 steps | **8 steps** | Q6 explicitly asked for *everything automated eventually, no long walls*. |
| 4. "first boost within 10 s" vs `firstMilestone` at ×500–700 of requires | milestone 0 at `chat.best ≥ 2500` (×250 of requires, chat's currency is 寒暄 not 话头) | the ×500–700 heuristic is quoted in *base* units; 寒暄 is a sqrt-compressed currency, so 2500 寒暄 is the equivalent moment. |
| **Row pacing constants (check 18)** | **`REQUIRES_STEP = ×30`** (row1 400 → row2 12000), **`OUTPUT_STEP ≈ ×20`** (log-shaped `gainMult` terms + cross-layer boosts), **per-row time = 30 ÷ 20 = ×1.5** ✓ inside the ×1.1–×1.6 band | computed, not guessed |
| Q5 asked for the M2 score-attack hub | **dropped** | `fun-quota.json` marks M2 `medium+`; Q2 locked `small`. M1 covers the challenge quota. |
| `board` modifier | **dropped** | one interaction type per game (13 §3); a grid would be a second one. |

---

# Stage 5–7 record (2026-10-05, appended after generation)

## Static check result

`node scripts/static_checks.js` → **42 PASS · 2 WARN · 0 FAIL**. Both WARNs are accepted
with reasons in §10b below.

Browser verification (in-app Chromium, served over `http://127.0.0.1`):
fresh save → all seven tabs opened → every upgrade bought across all five main layers →
all buyables bought → row-0/1/2 prestiges driven to the cap → **0 console errors**, and
`isEndgame()` returns true with `player.circle.points === 150` exactly.

## Stage 6 — balance walkthrough

**Row pacing constants** (check 18, handbook 11 §4.1):
- `REQUIRES_STEP` = ×30 (row-1 交情 400 → row-2 知己 12000)
- `OUTPUT_STEP` = ×20 measured at that boundary: `trust.gainMult()` runs to ≈576 once
  朋友/知己/社交圈 upgrades are in, and 交情 itself is a cube root of 寒暄, so a ×30 ladder
  step costs ≈×20 of output
- **per-row time = 30 ÷ 20 = ×1.5** ✓ inside the ×1.1–×1.6 target band

**Multiplier-zone walk** (mandatory zones multiplied, per era):

| Era | 话头 required | Independent `.times()` zones active | Product | Verdict |
|---|---|---|---|---|
| first 寒暄 prestige | 10 | none (1/s base) | 1 | ✓ |
| 熟人 unlock | 1e5 话头 | chat 11·12·13 = ×1200, chat m0 = ×2.5 | 3.0e3 | ✓ under 1e4 |
| 朋友 unlock | 9e5 话头 | chat 11–14 = ×1.8e6, m0·m1 = ×7.5 | 1.35e7 | see note |
| 知己 unlock | ~1e12 话头 | flats ×1.8e6, chat21 log^1.5 ≈ 10, chat22 log^1.2 ≈ 15, layer upgrades ×2304, milestones ×4500 | ~2.7e15 | ✓ |
| 社交圈 unlock | ~1e14 话头 | + circle 11 ×12, + achievements, + all buyables | ~1e17 | ✓ |

Note on the 朋友 row: the product passes 1e4, but the requires ladder does not become
fiction, because the two shaped zones (`chat21`, `chat22`) are **log-shaped on the base
currency** and therefore grow without compounding. They are what carries the last nine
orders: at 话头 1e14 they contribute ≈400×, and that is exactly the intended shape
(a shaped curve, not ten flat ×2s — handbook 11 §4).

**Cap check.** `chat.softcap` starts at 1e12 and is raised to 1e18 by upgrade 25; the cap is
printed in the layer tab both before and after the upgrade, which is the only condition
handbook 12 §2 sets for selling a cap raise. `circle` is hard-capped at 150 by
`getResetGain()` itself (not by a display-layer `softcap`), so the underlying counter cannot
exceed the ceiling either.

**Endgame reachability.** The circle ladder is `requires × (人数+1)^0.8`, i.e. 2e4 at one
person and 1.1e6 at 149 — comfortably inside what 交情 reaches (≈1e6 with the full trust
gainMult chain). Circle gain is integral (`gainMult × driftMult` floored, trimmed to the
remaining room) so the last person lands exactly on 150 instead of a hair under it.

## §10b — accepted WARNs

| Rule | Why it stays a WARN |
|---|---|
| `D-COSTSPAN` on `circle` | 社交圈 is a **hard-capped count in [0, 150] by design** — a 3-order ladder is arithmetically impossible inside that range. This is the same reason the corpus rule itself gives static layers a 1-order bar (their currency is also a floor count). The ladder still spans 2.2 orders and contains a deliberate cheap drop (upgrade 34 at cost 5 in `chat`, upgrade 15 at 25 in `familiar`). |
| `N-AUTOWIPE` on `circle` | `circle.resetsNothing()` is unconditionally `true` by design, not missing a gate: the circle is a **sink**, not a tax. Growing it must not cost you the 交情 that paid for it, and it must not reset 话头 either. `autoPrestige()` is still milestone-gated (`circle` m1), which is the stricter of the two conditions. |

## Final design decisions taken during Stage 4 (superseding §4/§6 above)

1. **Layers are gated by threshold, never by purchase** (`N-UNLOCKPAYGATE`). `familiar`
   and `trust` are opened by `chat` m0/m1 `onComplete`, `closer` and `circle` by `trust`
   m0/m1. Upgrade text that promises an unlock is used only for things that are free
   afterwards (the 读心 tab, the 倾听 tab, the challenge set, the 陈列 list).
2. **`circle.resetsNothing()` is always true** and `closer.doReset` is an intentional
   no-op. A row-2 reset must never wipe the relationships underneath it. This was found by
   playtesting, not by the static checks: without it, every single person added to the
   circle wiped the 交情 that paid for them.
3. **知己 is never spent.** Its two buyables are denominated in **交情** instead. 知己 is a
   static floor counter, and the engine's buy-max gain is `raw − currentPoints + 1`; letting
   a buyable drain the counter drives that negative and the next buy *removes* floors.
   This was the second bug only playtesting found.
4. **Lifetime 话头 is tracked by hand** (`player.chat.totalTalk`). This engine version has
   no `player.totalPoints`, and three achievements + one diary row score on it.
5. **`main-display` is replaced by `mainAmount()`** on all five main layers. The stock
   component hard-codes the English words "You have" / "(x/sec)", which cannot be
   translated without editing engine files; the override keeps Chinese mode Chinese.
6. **`componentStyles.achievement` was deleted.** The engine's own `achievementStyle()`
   (`technical/displays.js:39`) already greys and desaturates uncompleted achievements,
   which is the "visible but dimmed" rule. `componentStyles` is evaluated once per *layer*,
   so `this.id` never exists there — using it crashed the game on the first tick.
