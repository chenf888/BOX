/* =========================================================================
 *  js/tuning.js — 节气树 · 七十二候
 *
 *  THE single home for every pacing constant. Loaded as the FIRST entry of
 *  modInfo.modFiles, so it is on `window` before any layer file runs — and
 *  tools/simulate.js `require()`s this same file, so the game and the
 *  simulator can never drift apart (design-brief §12).
 *
 *  The pacing law this encodes (design-brief §9.18):
 *      per-row time multiplier = ROW_RATIO / OUTPUT_STEP = 25 / 20 = 1.25
 *  inside the handbook-11 §4.1 band of x1.1-x1.6. Both numbers appear in the
 *  brief next to the multiplier they produce.
 *
 *  A constant written as a literal inside a layer file is a constant the
 *  simulator cannot see — that is why the layer files carry `new Decimal(...)`
 *  literals for `requires` (the static checker resolves the ladder from those)
 *  while the generator asserts they equal ROW_REQUIRES below.
 * ========================================================================= */

var W = (typeof window !== "undefined") ? window : global

W.TUNING = {
	version: "2026-10-17.2",

	// --- the two pacing constants (brief §9.18) ---------------------------
	ROW_RATIO: 25,       // requires step between adjacent rows (corpus band x10-x100)
	OUTPUT_STEP: 20,     // how much a new node multiplies its parent's output

	// --- layer unlock thresholds, rows 0..8 -------------------------------
	// lc 立春, cf 春分, lx 立夏, xz 夏至, lq 立秋, qf 秋分, ld 立冬, dz 冬至, sui 岁
	ROW_REQUIRES: [
		10,                 // 立春  (P1 opener: mode 10)
		250,                // 春分
		6250,               // 立夏
		156250,             // 夏至
		3906250,            // 立秋
		97656250,           // 秋分
		2441406250,         // 立冬
		61035156250,        // 冬至
		1525878906250,      // 岁
	],
	ALMANAC_REQUIRES: 500,   // 历 — the row-1 shop branch, ×50 of 立春's own 10

	// --- the 候 upgrade ladder, shared by every 节 node (brief §9.13) ------
	// 1 -> 1e5 = 5 orders; u21 is the deliberate cheap "key" drop (corpus
	// rhythm device: a cost-7 upgrade inside a 1e5 ladder) that gates the rest.
	UPG_COSTS: { 11: 1, 12: 3, 13: 9, 14: 30, 15: 120, 21: 7, 22: 600, 23: 3000, 24: 20000, 25: 100000 },

	// --- the multiplier MAGNITUDES (brief §4.1 K1/K2) ---------------------
	// ROW_RATIO decides how much longer each era is than the one before it;
	// these decide how fast the whole economy compounds, i.e. the absolute
	// clock. The layer files read them at run time, and so does
	// tools/simulate.js — tuning here re-tunes the measurement too
	// (handbook-11 §3.3: a magnitude written inside a layer file is one the
	// simulator cannot see).
	//
	// Why this block exists: the first build had these as literals in the
	// generator. The economy then doubled every 1-3 s and climbed all nine
	// eras in 105 s. The cause was not the ladder but a closed loop
	// (候 -> upgrades -> 日影/s -> 候) with far too much gain per cycle, plus
	// two constants that removed the brakes: a self-referential upgrade at
	// (候+1)^0.5 capped only at x20, and a softcap raise of x1000 that 立春
	// could apply twice — putting its cap at 5e9, far above any gain the
	// design meant to bound.
	UPG_MULT: { 11: 1.7, 12: 2.0 },   // the two flat stones (K1)
	SOFTCAP_RAISE: 10,                // u22 multiplies the node's softcap by this

	// the self-loop magnitudes (K2): the only multipliers that read the layer's
	// OWN bank. Each one feeds the next press, so they decide whether the loop
	// is sub-critical or explosive.
	SELF: {
		SQRT_EXP: 0.3,    // u13: x (候+1)^SQRT_EXP   — pentads feeding themselves
		SQRT_CAP: 5,      // u13 hard cap; above it the effect bends to ^0.4
		LOG_DIV: 2,       // u14: x (log10(候+10)/LOG_DIV + 1)
		ADD_DIV: 1e5,     // u23: x (log10(候/ADD_DIV+1) + 1)^ADD_EXP
		ADD_EXP: 0.15,
		BASE_LOG_DIV: 2,  // every gainMult: x ((log10(日影+1))/BASE_LOG_DIV + 1)^0.5
	},

	// --- 候簿 buyable (M5-style secondary progression inside a node) -------
	BUY_COST_BASE: 40,       // first purchase, in the node's own 候
	BUY_COST_MULT: 2.5,      // cost(x) = BASE * 2.5^x          (sub-critical)
	BUY_EFFECT_MULT: 1.08,   // effect(x) = 1.08^x              ln(1.08)/ln(2.5)=0.085 (F13)

	// --- per-node softcaps (brief §8) -------------------------------------
	// The cap sits where the NEXT node unlocks, and is DISPLAYED on each tab;
	// u22 raises it (K5). The cap bounds the GAIN, not the bank, so it is the
	// last brake on the self-loop above: it has to stay within reach of the
	// gain the era is actually meant to produce.
	SOFTCAP: {
		lc: 5e3, cf: 1e5, lx: 1e8, xz: 1e11,
		lq: 1e14, qf: 1e17, ld: 1e20, dz: 1e23,
	},
	SOFTCAP_POWER: 0.45,

	// --- 立圭表·测日影 (M3 risk-reward minigame, lc) -----------------------
	SHADOW_TILES: 3,
	SHADOW_BONUS: 0.15,      // each streak step: +15% 日影, capped
	SHADOW_STREAK_CAP: 9,    // 九 = the theme's own number
	SHADOW_CLICK_SHADOW: 1,  // 日影 granted per successful reading (× multipliers)

	// --- 立夏 雨量 bar (M4) ----------------------------------------------
	RAIN_TIME: 45,           // seconds to fill the rain gauge at base speed
	RAIN_REWARD: 3,          // 立夏候 granted per full gauge (× multipliers)

	// --- 秋分 仓廪 bar (M4) ----------------------------------------------
	GRANARY_TIME: 90,
	GRANARY_REWARD: 5,

	// --- 冬至 数九 (M4, HARD cap 81) --------------------------------------
	NINE_NINE_MAX: 81,       // 九九八十一 — the theme's ceiling
	NINE_NINE_TICK: 12,      // seconds per 九-day at base speed
	NINE_NINE_REWARD: 0.25,  // 冬至候 per 九-day

	// --- 历 七十二候 chart (M10, HARD cap 72) -----------------------------
	HOU_TOTAL: 72,           // 8 nodes x 9 pentads — the complete 月令 set
	HOU_OBSERVE_TOKENS: 1,   // 历筹 granted the first time a 候 is observed

	// --- 岁 hub (M2 score-attack + M7 ritual) ----------------------------
	SUI_REQUIRES: 1525878906250,   // = ROW_REQUIRES[8]
	SUI_EXPONENT: 0.22,
	SUI_UPG_COSTS: { 11: 3, 12: 12, 13: 60, 14: 300, 15: 1e12, 21: 8, 22: 4000, 23: 5e4, 24: 6e5, 25: 20 },
	SUI_BUY_COST_BASE: 100,        // 岁簿
	SUI_BUY_COST_MULT: 3.2,
	SUI_BUY_EFFECT_MULT: 1.2,      // ln(1.2)/ln(3.2) = 0.17 << 1 (F13)
	CHALLENGE_COUNT: 8,            // 八节试 — one trial per node
	CHALLENGE_LIMIT: 3,            // x3 completions => 24 = 二十四节气
	CHALLENGE_TARGETS: [3, 12, 40, 120, 400, 1200, 4000, 12000],  // peak 岁礼 per trial
	CHALLENGE_REWARD: 1.35,        // per completion: peak^0.4 x 1.35^n
	SUI_TRIAL_DIV: 1000,           // the handicap: all 候 output / 1000 inside a trial
	SUI_FINALE_COST: 1e12,         // 岁功成 — ABOVE the top rung of sui's ladder (6e5), F15
	SUI_SOFTCAP: 1e30,             // staged re-root (P12 #3)

	// --- almanac shop (M8) -----------------------------------------------
	AL_UPG_COSTS: { 11: 2, 12: 6, 13: 20, 14: 80, 15: 400, 21: 5, 22: 2000, 23: 1e4, 24: 6e4, 25: 3e5 },
	AL_BUY_COST_BASE: 60,
	AL_BUY_COST_MULT: 3,
	AL_BUY_EFFECT_MULT: 1.15,

	// --- 岁祭 (sui prestige) ---------------------------------------------
	SUI_PACKAGE_MILESTONE: 3,      // sui.m3 — the endgame QoL package deal

	// --- achievements / side ---------------------------------------------
	ACH_REWARD: 1.15,              // every achievement's neutral production floor
	ACH_BACKFILL: { 31: ["lc", 1], 41: ["cf", 1] },   // achievement id -> [layer, milestone]
}

// The generator (tools/gen_layers.js) asserts every emitted `requires` literal
// equals the matching entry here, so the checker's ladder rule and the
// simulator read the same numbers.
if (typeof module !== "undefined" && module.exports) module.exports = W.TUNING
