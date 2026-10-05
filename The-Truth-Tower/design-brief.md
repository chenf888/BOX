# Design Brief — **The Truth Tower** / 真理之塔

> The Modding Tree v2.7 · generated 2026-10-05 · **custom blueprint (single-layer)** · type `active-tick`
> (four-era hybrid, user-authorized — see §10 deviation D1)

## 1. Identity

| Field | Value |
|---|---|
| Game name | The Truth Tower / 真理之塔 |
| Author | TMT Skill |
| `modInfo.id` | **`the-truth-tower-mewus1`** — permanent, keys the savefile |
| `modInfo.pointsName` | Truth / 真值 |
| Author | TMT Skill |
| Language mode (Q7) | **Bilingual EN+中文** (P17 `window.chinesemode` ternaries) |
| One-line pitch | 从 10⁻⁶⁴ 起步，把一个比零还小的真值，推到 F11 = 10^10^10^10^10^10^11。 |

## 2. Interview record (Q1–Q7, all answered by the user)

| # | Question | Answer | Locked parameter |
|---|---|---|---|
| Q0 | Theme | **从 10^-64 开始到 F11 的大数学** | theme = big-math / proof, single currency |
| Q1 | Structure confirmation | **单一货币 + 超长 buyable 阶梯** | one currency `Truth`, ladder is the span carrier, no cross-layer prestige |
| Q2 | Scale | **只有 1 个层级，内容非常多，任意玩法，极多升级，100+ 小时** | **custom blueprint `monolith`** (§10 D2) — replaces all three stock blueprints |
| Q3 | Natural ceilings | **无上界，无限增长** | no hard caps; P12 softcaps only on runaway terms |
| Q4 | Pacing | **偏放置 / 挂机** | logarithmic/custom gains, 8-step automation ladder |
| Q4b | Game type | **四时代混合：早期 tick+被动 → 中期 click → 后期 board → 大后期纯被动** | primary `active-tick`, modifiers sim/minigame/board/challenges/caps (§2b) |
| Q5 | Side content | **完整：挑战 + 成就 + 故事边层** | 24 challenges, **200 achievements**, story dashboard |
| Q6 | Automation | **经典节奏** | 4–6 step ladder, walls ≤ 30 min |
| Q7 | Language | **中英双语 EN+中文** | `window.chinesemode` ternaries everywhere |

**Q1 recap (confirmed by user):**
- **Currencies:** one only — `Truth` (真值), 10⁻⁶⁴ → F11. Secondary in-layer currencies exist per era (Proof Sparks, Transcendence Charge) but never become tree layers.
- **Layer topology:** **ONE main layer.** No cross-layer prestige. Four **nested loops inside the one layer**, unlocked in sequence by Truth thresholds.
- **Ceilings:** none declared — unbounded, softcaps only.

### 2b. Game type profile (Q4b)

`node scripts/classify.js` → **`passive-prestige` 0.63, exit 0** (auto). **User overrode**: the request
says "包含可能的任意玩法", which the classifier's verb/keyword scorer cannot express.

| Field | Value |
|---|---|
| Declared profile type | **`active-tick`** (written by `scaffold.js --type active-tick`) |
| Why not the classifier's answer | `passive-prestige` is the absence-signal fallback and forbids clickables/grid/update. The user asked for *every* gameplay type. Recorded as deviation **D1** (§10). |
| Mandatory per declared type | `update()` tick + `bars` with `progress()`; `T-TICKREG` must pass |
| Also present (four-era hybrid) | `clickables` (era II), `grid` (era III), pure-passive (era IV) |
| Rules exempt | **none** — `passive-prestige`'s `D-NOUPDATE` exemption is deliberately NOT taken, because this game must have a tick |
| T-* rules all active | `T-CLICKABLE`, `T-GRID`, `T-TICKREG` — all three must pass |

| Modifier | Requires | Included | Notes |
|---|---|---|---|
| `sim` | — | **yes** | `type:"none"` core loop layer with hand-written `update()`; 1 layer (P15 cap respected) |
| `score-attack` (M2) | `active-*` + `sim` | **dropped** | Needs a *separate* score-recording layer with its own `maxpoints[]`; with one layer it would compete with the main loop for `update()`. Reason logged here per SKILL.md Q4b rule. |
| `minigame` (M3) | `active-*` | **yes** | era II clickable group |
| `board` | — | **yes** | era III grid, `grid:` singular + `getStartData` |
| `challenges` (M1) | — | **yes** | 24 challenges, `canComplete()` dialect |
| `caps` | — | **yes** | Q3 = unbounded, so `caps` is used only for the visible softcap-start displays, not hard ceilings |

## 3. Theme = structure mapping (P14)

Big mathematics. The theme dictates the tree *shape*: a **tower** is a vertical stack, so the tree is
literally one column — the whole game is one node you climb, and the four eras are four nested
interior loops of that single layer rather than four sibling layers.

- **Currency:** Truth (真值) — the epistemic mass of a proved statement.
- **Four nested loops**, each gated by a Truth threshold, each with a distinct verb:
  1. **公理 Axioms** (tick + passive) — bars fill, `update()` accrues Proof Sparks.
  2. **证明 Proofs** (click) — clickables convert Sparks into deduction chains.
  3. **超越 Transcendence** (board) — a `grid` board assembles symbols.
  4. **无穷 Infinity** (passive) — no interaction; the transcendence ladder to F11.
- **Ceilings:** none. The last era's ladder terminates exactly at F11.

## 4. Layer chain table

| id | name (theme voice) | row | pos | type | base resource → baseAmount | requires | exp/base | upgrades | milestones | challenges | buyables | automation | softcap plan | doReset keeps | branches |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `t` | 真理层 / Truth Layer | 0 | 0 | **`none`** (no prestige — Q1/Q2) | n/a (no reset) | n/a | n/a | **300** (4 era groups × 75) | **60** | **24** | **30** | milestones 0/8/16/24/32/40 | `softcap` on the two self-scaling terms only | n/a (never reset) | n/a |
| `ach` | 公理档案 / Axiom Archive | side | — | `none` | n/a | n/a | n/a | — | — | — | — | — | n/a | n/a | n/a |
| `sta` | 统计 / Statistics | side | — | `none` | n/a | n/a | n/a | — | — | — | — | — | n/a | n/a | n/a |
| `sto` | 推理日志 / Deduction Log (story) | side | — | `none` | n/a | n/a | n/a | — | — | — | — | — | n/a | n/a | n/a |

**Single-layer consequences (all user-authorized, §10 D2):**
- No `requires` ladder, no row-ratio pacing (P2/A1 inapplicable — nothing to ladder between).
- No cross-layer `gainMult` web (P10 inapplicable — one layer).
- Automation ladder is **buy-side** (auto-buy upgrades + auto-buy buyables), not prestige-side.

### 4.1 Fun density table (per layer `t`)

| Era | id range | content | effect-kind plan | organization | mechanics |
|---|---|---|---|---|---|
| I 公理 Axioms | u11–u85, m0–m19, bars×4 | 75 upg, 20 ms, 4 bars | K1 ×30, K2 ×18, K5 ×8, K7 ×12, K8 ×7 | microtab `axioms` | M4 (bar+update), M5 (Sparks) |
| II 证明 Proofs | u91–u165, m20–m39, clickables×10 | 75 upg, 20 ms, 10 clickables | K1 ×28, K2 ×20, K3 ×8, K6 ×9, K7 ×10 | microtab `proofs` | M3 (minigame), M5 |
| III 超越 Transcendence | u171–u245, m40–m59, grid 10×10 | 75 upg, 20 ms, 1 grid | K1 ×26, K2 ×22, K4 ×9, K5 ×10, K7 ×8 | microtab `transcend` | board (grid) |
| IV 无穷 Infinity | u251–u325, m60–m71, buyables 21x–24x | 75 upg, 12 ms, 4 buyable families | K1 ×22, K2 ×26, K4 ×10, K5 ×11, K6 ×6 | microtab `infinity` | transcendence ladder |
| all | ch11–ch94 | 24 challenges | K6 handicaps via `inChallenge()`, rewards via `hasChallenge()` | microtab `trials` | M1 |
| side `ach` | a11–a2010 | **200 achievements** | K1/K4 rewards, one automation grant | grid 10×20 | M10 (collection) |

K1 share per era ≤ 0.40 (`fun-quota.json` large tier) ✓. ≥3 distinct non-K1 kinds per era ✓.
≥30% of upgrades use `pow`/`log` shapes ✓ (target ~45%).

## 5. Tree sketch

```
row 0:        [ 真理层 / Truth Tower  (t) ]
side:    (公理档案 ach) (统计 sta) (推理日志 sto)
```

Deliberately one node — that is the Q2 requirement. Era progression is *inside* the tab, not on the tree.

## 6. Automation ladder (buy-side; Q6 = classic, 4–6 steps)

| Step | Grants (chore that dies) | Granted by | Threshold |
|---|---|---|---|
| 1 | `t.autoUpg0` — auto-buy era-I upgrades | `t` m8 | Truth ≥ 1e20 |
| 2 | `t.autoBuy0` — auto-buy the 11x–14x ladders | `t` m16 | Truth ≥ 1e200 |
| 3 | `t.autoUpg1` — auto-buy era-II upgrades | `t` m24 | Truth ≥ 1e2000 |
| 4 | `t.autoBuy1` — auto-buy the 21x–22x ladders | `t` m32 | Truth ≥ 1e30 |
| 5 | `t.autoUpg2` — auto-buy era-III+IV upgrades | `t` m40 | Truth ≥ 1e20000 |
| 6 | `t.autoBuy2` — auto-buy the 23x–24x transcendence ladder | `t` m48 | Truth ≥ 1e200000 |

Every step removes exactly one chore (A8). No two milestones grant the same flag.

## 7. Endgame definition

- **`isEndgame()`:** `player.t.points.gte(TRUTH_F11)` where
  `TRUTH_F11 = 10^10^10^10^10^10^11`, built at runtime by
  `truthTower(6, 11)` — a **wrapping** helper. **Verified on the vendored break_eternity:
  layer 5, `slog10` = 7.0240, and `F11 > F`** (see §10 D3).
- **Reachability:** see §9 check 18 and the Stage-6 walkthrough. Structure is *magnitude ladder for
  ~90% of the playtime, then a short transcendence endgame* — this is forced by the arithmetic, see D4.
- **`winText`:** "你证明了 F₁₁。/ You have proved F₁₁." + the tower's final count.

## 8. Cap table

| Currency | Ceiling? | Cap mechanism | Where |
|---|---|---|---|
| Truth | **no ceiling** (Q3) | no layer softcap on the currency itself; the *transcendence ladder* is the terminator | — |
| Truth production, self-term A (`^0.5`) | runaway guard | `softcap(x, C, 0.25)` with a visible, upgrade-raised C | `t` selfTerm |
| Truth production, self-term B (`^0.3`) | runaway guard | `softcap(x, C, 0.3)` | `t` selfTerm |
| Proof Sparks | no ceiling | cost ladder only (P12: cost scaling first) | — |

Per handbook 12 §2 #6, **cost scaling is the primary shaper**; softcaps exist only on the two
self-amplifying terms, and both cap *starts* are shown in the tab (so a cap-raise upgrade is legal).

## 9. Self-check results (20 checks)

- [x] 1. requires ladder monotonic — **N/A, single layer** (D2)
- [x] 2. first layer requires 2–10 — **N/A, `type:"none"`** (D2)
- [x] 3. density ≥10 upgrades + ≥3 milestones — `t` has 300 upg + 60 ms ✓
- [x] 4. cross-layer gainMult web — **N/A, one layer** (D2)
- [x] 5. automation ladder 4–8 steps, P4 order, one chore each — 6 steps, buy-side (D2) ✓
- [x] 6. softcap plan for every unbounded loop — §8 ✓
- [x] 7. A1–A10 sweep — A1/A2/A4/A7 inapplicable; A8 satisfied; no thin layers
- [x] 8. K1 share ≤ 0.40, ≥3 non-K1 kinds per era — §4.1 ✓
- [x] 9. `tabFormat` on every layer; microtabs (5 content groups ⇒ mandatory); context display-texts ✓
- [x] 10. game-level fun quota (`large` row) — mechanics M1,M3,M4,M5,M6,M10 = 6 ✓; challenges 24 ✓; clickable groups 1 (minigame) + 10 clickables ✓; bars 4 ✓; update 1 layer ✓; secondary currency 1 ✓; shop n/a; ritual n/a
- [x] 11. multiplier budget — **NO self-scaling term** (D9: measured to be incompatible with the 100 h target); every multiplier O(1), total ≈ ×20; zone walk in §11
- [x] 12. wiring plan — every upgrade classified token(K7) vs value; `gainMult()` reads every value id
- [x] 13. cost ladder ≥6 orders, deliberate key drops, ≥30% pow/log ✓
- [x] 14. 8–30 components/layer — **EXCEEDED by design** (D2); challenges 24/300 = 8% ≤ 15% ✓
- [x] 15. author pacing — first boost < 10 s (simulated 9.5 s, live 9.3 s) ✓
- [x] 16. upgrade discipline — one production bonus each; no upgrade boosts another upgrade's number (K4 targets only *named mechanics/resources*) ✓
- [x] 17. cost before softcap — the cost stairs do ALL the shaping; the only softcap is the buyable cost-softcap (visible in the buyable display) ✓
- [x] 18. row pacing — **N/A, single row.** Replaced by the era pacing constants below.
- [x] 19. reset lifecycle — `type:"none"` never resets; no `doReset` anywhere ⇒ no `N-MSDESTROY`/`N-AUTOWIPE` exposure. `update()` uses `addPoints()`/`addResource()`, never assigns `.points`. No static layer ⇒ `N-STATICMAX` N/A.
- [x] 20. type contract — `update()` + bars present; `doNotCallTheseFunctionsEveryTick` lists every custom action fn; `grid:` singular with `getStartData`; every clickable has `canClick`/`onClick` and state in `startData` ✓

### 9.1 Pacing constants — FINAL (2026-10-06 tuning pass, simulation-verified)

Architecture: production = Truth × rate, rate = baseRate × G(L), every multiplier O(1),
total growth ≈ ×20 across the whole climb. NO self-amplifying term (see §11 / D4a).

| Constant | Value | Role |
|---|---|---|
| `baseRate` | 0.001068 /s | global dial; total time ∝ 1/baseRate |
| upgrade multBase | 1.004 + (idx%6)×0.0006 + era×0.0003 | 271 upgrades ⇒ ×5 total |
| milestone mults | ×1.012 each, era-end ×1.03 (72) | ⇒ ×2.4 total |
| challenge rewards | ×1.05–1.18 (16) | ⇒ ×2.9 total |
| achievement mults | ×1.03–1.06 (5 wired) | ⇒ ×1.22 total |
| ladder factor | Π(1 + owned×0.002), limits 45/62/260/220 | ⇒ ×1.67 max |
| costPow / softcap | 1.2, x²/25 past 25 purchases | ladder span shaping |
| era gates | 1e30 / 1e300 / 1e3000 | era II/III/IV boundaries |
| ascension rungs | costs 10^4470..10^4485, +0.6/+0.7/+0.8/+0.9 slog | the tower-crossing finale |
| opening steps | 0.0044, 0.012, 0.026, 0.052, 0.105, 0.21, 0.4 (log10 from 1e-64) | first boost at 9.5 s |

**Measured (tools/simulate.js, greedy full playthrough):**

| Era | Span (log10) | Simulated time |
|---|---|---|
| I Axioms | −64 → 30 (94) | **37.0 h** |
| II Proofs | → 300 (270) | **17.5 h** |
| III Transcendence | → 3000 (2700) | **38.1 h** |
| IV Infinity + ascension | → 4485 + F11 | **7.2 h** |
| **TOTAL** | 8.02 slog units | **99.8 h** |

First upgrade (10^−63.978) affordable at **9.5 s** simulated, **9.3 s** live in the browser
(author rule: first boost < 10 s ✓). 891 purchases; longest single wait ≈ 0.9 h.

### 9.2 Transcendence endgame (final form)

The four ascension rungs are DISCRETE: buying rung N applies `T = T.layeradd(add, 10)` once
(`claimTranscendence`). Their costs (10^4470 → 10^4485) sit just PAST the era-IV ladder end
(10^4460) so the whole infinity ladder must be climbed first — there is no skip run. Each
purchase jumps Truth by exactly its `add` in slog space (verified live: +0.6/+0.7/+0.8/+0.9),
and the cumulative jump crosses F11 (slog 7.024) during the sequence, firing the win screen.

## 10. Deviations & open questions

| # | Default overridden | Value used | Why |
|---|---|---|---|
| **D1** | 13-Types §2 "at most one interaction type per game" | **four-era hybrid**: tick + click + board + passive inside one layer | **Explicitly authorized by the user**, who asked for "包含可能的任意玩法" (any gameplay). Declared profile is `active-tick`; no exemption taken, so `D-NOUPDATE` still applies and the tick must be real. All three `T-*` rules stay active and must pass. |
| **D2** | `blueprints.json` — all three blueprints (small 5–7 / medium 10–16 / large 25+ layers) and `selectionRules.scaleToBlueprint` ("do not mix blueprints or improvise parameters") | **Custom blueprint `monolith`: 1 main layer + 3 side layers** | The user specified "只有1个层级，但是内容非常多…100+小时". No stock blueprint expresses this. Therefore self-checks 1, 2, 4, 18 (requires ladder, first-requires, cross-layer web, row pacing) are **inapplicable**, and checks 3/14 are exceeded by design. Everything else is honoured. |
| **D3** | — | `F11 = 10^10^10^10^10^10^11` (six 10s, top 11) | Derived from the user's rule `1F6 = 1eeeeee6`. **Verified on the vendored break_eternity: `layer 5`, `slog10 = 7.024`, `F11 > F`.** Note: the option text shown during the interview contained a typo (five 10s); the user's own stated rule resolves it to six. |
| **D4** | 09 P1/P3 prestige-shape gains | magnitude ladder + explicit `layeradd` endgame | Proved by simulation: a smooth self-amplifying curve (`dL/dt ∝ L²`) either blows up in <1 s or takes longer than the representable range; no bounded-time smooth curve reaches `layer 5`. The endgame must be discrete rungs. Recorded so Stage 6 does not "fix" this by re-tuning multipliers. |
| **D5** | `fun-quota.json` `large` row → `minUpdateLayers: 6`, `shopLayer`, `customRitualLayer` | 1 update layer, no shop, no ritual layer | Forced by D2 (one layer). Compensated by 24 challenges, 200 achievements, 10 clickables, 4 bars, 1 grid — far above the `large` clickable/bar floors. |
| **D6** | `score-attack` (M2) modifier | dropped | Needs its own `maxpoints[]`-recording layer; with one layer it would fight the main `update()` for the tick. Logged per the SKILL.md Q4b "never drop silently" rule. |
| **D7** | corpus p90 = 56 components/layer | ~420 components on `t` | Explicitly requested ("内容非常多"). Mitigations: 5 microtabs + context display-texts (handbook 10 §3) to stop scroll-overload; challenges held to 8% of upgrades. |
| **D8** | Q6 "classic pacing: walls up to 30 min mid-game" | 34 stretches of 30–54 min, concentrated in era III's sparse stretches | The 100 h target with NO prestige resets forces an average rate of ~2 orders/minute; where both the upgrade stairs and the ladder rungs are sparse, a wait reaches ~1 h. Idle-appropriate (AFK periods), and the longest wall was capped at 0.9 h by densifying family-13/14 (costPow 1.1, limits 260/220) and steepening the era-III/IV stair bias. Accepted rather than adding filler content. |
| **D9** | brief §9 check 11 ("ONE self-scaling term, exponent 0.5, softcapped") | **no self-amplifying term at all** | The 2026-10-06 tuning pass measured the ×0.5 self-term detonating the game at 28 s, and proved by integration that ANY self-exponent big enough to matter does the same — the total-time integral (`t = (k/ln10)/baseRate × (1 − 10^(−ΔL/k))`) forbids it in a no-reset game of this length. N-SELFTOTAL passes with Σ = 0. Multiplier growth (≈ ×20 total, all O(1)) does the pacing instead. |
| **D10** | ascension rung costs 10^1200–10^9000 (original §9.2) | 10^4470–10^4485 | With the original costs the rungs were affordable the moment era IV opened (1e3000 > 10^1200) and the greedy run skipped the entire era-IV ladder — measured live as a 0.1 h finale. Costs now sit just past the era-IV ladder end (10^4460) so the whole ladder must be climbed first. |

**Open:** none. The 100 h target is met (99.8 h simulated; play-style variance ±~20% —
"buy everything the instant it is affordable" dips Truth to near zero after each purchase and
runs somewhat longer, which favours the 100+ h requirement).

## 11. Stage 6 — balance walkthrough results (2026-10-06, simulation + browser verified)

**The tuning pass replaced the 2026-10-05 architecture.** What changed and why:

| Item | Before (2026-10-05) | After (2026-10-06) | Reason (measured) |
|---|---|---|---|
| Multiplier scale | ×2–5 per upgrade, reaching ~1e86 | every multiplier O(1), total ≈ ×20 | the previous stack self-detonaed: simulated end at **28 s** |
| Self-amplifying term | `T^0.5` softcapped | **removed** (D9) | detonation; the integral forbids any meaningful self-exponent |
| Production shape | `T × (mult − 1)` | `T × rate`, rate = 0.001068 × Π O(1) mults | rate must average ~2 orders/min to span 4524 orders in 100 h |
| Milestone thresholds | formula exploding to 10^(10^60) — automation unreachable | explicit per-era tables in `tuning.js`, thresholds span each era | milestones past i≈7 were unreachable before endgame |
| Automation grants | promised in text, **nothing set the flags** | `onComplete()` sets `autoUpg0/1/2`, `autoBuy0/1/2` + `toggles` | the automation ladder was dead code (handbook 12 #39: default ON) |
| Achievement effects | displayed ×1.5, applied ×2/×2.5 (301/401/501) | both from `TUNING.achievementMults` | author rule #17: report the value before purchase |
| Buyable display | showed `x^1.5` while the consumer applied `x^1.6` | display == applied (`1 + x×0.002`) | same rule; honesty of the buyable readout |
| Ascension rungs | magnitude costs + per-tick `layeradd` multiplier | discrete jump on purchase (`T.layeradd` once), costs past the ladder end | per-tick re-application overshoots F11 in seconds and skipped era IV |

**Verification chain:** `tools/simulate.js` (headless greedy playthrough reading `js/tuning.js`)
→ **99.8 h** total, era split 37.0/17.5/38.1/7.2 h, first boost 9.5 s → live browser: boot clean,
first purchase at **9.3 s** real time, ascension sequence crosses F11 (+0.6/+0.7/+0.8/+0.9 slog
per rung, verified), win screen fires. Static checks 35 PASS / 0 WARN / 0 FAIL.

**Zone walk (check 11), final form:** rate = `baseRate` × milestones(×2.4) × achievements(×1.22)
× trial rewards(×2.9) × ladders(≤ ×1.67) × `gainMult`(271 upgrades, ×5). No self-referential
term anywhere; the largest single factor is the 271-upgrade product at ×5.

**Reachability (headless, real engine):** without any rung, even an absurd ×1e50 production
plateaus at slog ≈ 2.74 — **F11 is unreachable by magnitude production alone** (D4 confirmed).
The four rungs add +3.0 slog from ≈ 4.65 and cross F11 during the sequence (live-verified).

**Engine facts established during the build (cite, don't re-derive):**
- `layeradd(x, 10)` requires x as a **plain number** — passing a Decimal silently returns NaN or
  an unchanged value. (`transcend.toNumber()` at both call sites.)
- `buyUpg`/`buyBuyable` check the **cached** `tmp[...]unlocked`/`canBuy`, refreshed every tick
  (50 ms). Synchronous test harnesses that set state and buy in the same tick get silent refusals;
  humans never see this.
- mod.js top-level runs BEFORE layer files load (loader.js inserts them). Any top-level throw —
  e.g. a `winText` template literal interpolating `format(player.t.points)` — kills every later
  `var`/`let` initializer in the file (`TRUTH_F11` → undefined → `isEndgame()` true on tick 1 →
  instant win screen that looks like a loading hang).
- `format()` shows sub-1e-4 values as "0.00" unless `modInfo.allowSmall` is set — mandatory for a
  game that starts at 1e-64.
- Upgrade ids must follow `rowNumber*10 + col` with **single-digit columns**. `row*10+col` with
  15 columns collides at col ≥ 10 (row 0 col 11 and row 1 col 1 both = 121) and silently loses
  entries to object-key collisions.