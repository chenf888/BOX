/* =========================================================================
 *  js/tuning.js — 盲文之树 · The Braille Tree
 *
 *  THE single home for every pacing constant. Loaded as the FIRST entry of
 *  modInfo.modFiles, so it is on `window` before any layer file runs — and
 *  tools/simulate.js reads this same file, so the game and the simulator
 *  cannot drift apart (design-brief §9 #18/#21).
 *
 *  Pacing law encoded here:
 *      per-row time multiplier = ROW_RATIO / OUTPUT_STEP = 25 / 18 = 1.39
 *  inside the handbook-11 §4.1 band of x1.1-x1.6.
 *
 *  A constant written as a literal inside a layer file is a constant the
 *  simulator cannot see — so `requires` literals stay in the layer files
 *  (the static checker resolves the ladder from them) and this file carries
 *  every magnitude and rate the measurement depends on.
 * ========================================================================= */

var W = (typeof window !== "undefined") ? window : global

W.TUNING = {
	version: "2026-10-18.1",

	// --- the two pacing constants (brief §9 #18) -------------------------
	ROW_RATIO: 25,        // requires step between adjacent rows (corpus band x10-x100)
	OUTPUT_STEP: 18,      // how much a new era multiplies its parent's output

	// --- layer unlock thresholds ------------------------------------------
	REQ: {
		touch: 10,           // 触感 -> 指感 (P1 opener: mode 10)
		six: 250,            // 指感 -> 六点 (x25 of touch)
		eight: 10000,        // 指感 -> 八点 (x40 of six, the second row-1 branch)
		slate: 500,          // 指感 -> 盲文板 (x2 of six)
		contracted: 1e6,     // 盲文纸 -> 缩写
		nemeth: 1e9,         // 盲文纸 -> 数学
		music: 1e12,         // 盲文纸 -> 音乐
		words: 1e13,         // 盲文纸 -> 词语
		passages: 1e12,       // 词语 -> 篇章
		library: 1e12,        // 篇章 -> 藏书楼
	},

	// --- hard ceilings (Q3) ------------------------------------------------
	CAP: {
		six: 64,             // 2^6 combinations
		eight: 256,          // 2^8 combinations
	},

	// --- softcaps (P12; cost scaling does the shaping, these stop runaways)
	SOFT: {
		touch: 1e9, touchRaise: 1e12,
		slate: 1e9, slateRaise: 1e12,
		words: 1e9, wordsRaise: 1e12,
		passages: 1e12, passagesRaise: 1e15,
		library: 1e9, libraryRaise: 1e12,
	},
	SOFT_POWER: 0.1,

	// --- upgrade cost ladders (>=6 orders, one deliberate cheap key drop) ---
	UPG_COSTS: {
		touch: { 11: 1, 12: 3, 13: 9, 14: 30, 15: 120, 21: 7, 22: 600, 23: 1e18, 24: 20000, 25: 100000, 31: 1e7, 32: 1e9, 33: 1e11, 34: 1e13, 35: 1e15 },
		six: { 11: 1, 12: 2, 13: 4, 14: 8, 15: 16, 21: 24, 22: 40, 23: 48, 24: 56, 25: 64 },
		eight: { 11: 1, 12: 2, 13: 4, 14: 8, 15: 16, 21: 24, 22: 40, 23: 48, 24: 56, 25: 64 },
		slate: { 11: 1, 12: 3, 13: 9, 14: 30, 15: 120, 21: 600, 22: 3000, 23: 1e16, 24: 100000, 25: 1e6 },
		contracted: { 11: 1, 12: 2, 13: 3, 14: 4, 15: 5, 21: 6, 22: 7, 23: 8, 24: 9, 25: 10, 31: 12, 32: 14, 33: 16, 34: 18 },
		nemeth: { 11: 1, 12: 2, 13: 4, 14: 8, 15: 16, 21: 24, 22: 40, 23: 1e16, 24: 72, 25: 96 },
		music: { 11: 1, 12: 2, 13: 4, 14: 8, 15: 16, 21: 24, 22: 40, 23: 56, 24: 72, 25: 96 },
		words: { 11: 1, 12: 3, 13: 9, 14: 30, 15: 120, 21: 600, 22: 3000, 23: 1e16, 24: 100000, 25: 1e6, 31: 1e8, 32: 1e10 },
		passages: { 11: 1, 12: 3, 13: 9, 14: 30, 15: 120, 21: 600, 22: 3000, 23: 1e18, 24: 100000 },
		library: { 11: 1, 12: 3, 13: 9, 14: 30, 15: 120, 21: 600, 22: 3000, 23: 1e12, 24: 100000, 25: 1e6, 31: 1e8, 32: 1e10 },
	},

	// --- effect magnitudes ------------------------------------------------
	MULT: {
		touch: { 11: 2, 13: 2, 22: 3, 24: 2, 33: 100 },
		six: { 14: 2 },
		eight: { 14: 2 },
		slate: { 11: 2, 12: 2 },
		contracted: { 14: 2 },
		nemeth: { 14: 2 },
		music: { 14: 2 },
		words: { 14: 2, 33: 10 },
		passages: { 14: 2 },
		library: { 14: 2, 33: 10 },
	},

	// --- the active loops -------------------------------------------------
	RUB: 1,               // 触感 per 摩挲 click before multipliers
	SENSE_CAP: 100,       // sensitivity needed for one 校准
	SENSE_CAP_RAISED: 250,
	READ_COOLDOWN: 10,    // seconds between 辨读 bursts
	READ_BURST: 10,       // seconds of production granted by 辨读

	PAPER: {
		base: 1,             // paper/sec at the very start of the slate
		selfExp: 0.05,       // (1 + paper)^0.15 — sublinear, never a runaway
		touchLogExp: 0.3,    // (log10(指感)+1)^0.3
	},

	WORDS_TRICKLE: 0.05,  // words/sec baseline from auto-compose
	LIBRARY_TRICKLE: 0.02,

	FLASH_MS: 3000,       // eight-dot target stays visible this long
	FLASH_MS_PER_UPGRADE: 1000,
}

/* ---------------------------------------------------------------------------
 *  Six-dot targets: 26 letters + 10 digits + 28 remaining combinations.
 *  Masks use the standard braille bit order: dot1=1, dot2=2, dot3=4,
 *  dot4=8, dot5=16, dot6=32.
 * ------------------------------------------------------------------------- */
var SIX_LETTERS = {
	A: 1, B: 3, C: 9, D: 25, E: 17, F: 11, G: 27, H: 19, I: 10, J: 26,
	K: 5, L: 7, M: 13, N: 29, O: 21, P: 15, Q: 31, R: 23, S: 14, T: 30,
	U: 37, V: 39, W: 58, X: 45, Y: 61, Z: 53,
}
var SIX_DIGITS = { "1": 1, "2": 3, "3": 9, "4": 25, "5": 17, "6": 11, "7": 27, "8": 19, "9": 10, "0": 26 }

function dotsLabel(mask, count) {
	var out = []
	for (var d = 1; d <= count; d++) if (mask & (1 << (d - 1))) out.push(d)
	return out.length ? out.join(",") : "-"
}

var SIX_TARGETS = []
;(function buildSixTargets() {
	var used = {}
	for (var L in SIX_LETTERS) {
		SIX_TARGETS.push({ label: L, mask: SIX_LETTERS[L], dots: dotsLabel(SIX_LETTERS[L], 6), letter: true })
		used[SIX_LETTERS[L]] = true
	}
	for (var D in SIX_DIGITS) {
		SIX_TARGETS.push({ label: D, mask: SIX_DIGITS[D], dots: dotsLabel(SIX_DIGITS[D], 6), digit: true })
	}
	var combo = 1
	for (var m = 0; m < 64 && SIX_TARGETS.length < 64; m++) {
		if (used[m]) continue
		SIX_TARGETS.push({ label: "组合 " + combo, mask: m, dots: dotsLabel(m, 6), combo: true })
		combo++
	}
})()

var EIGHT_TARGETS = []
;(function buildEightTargets() {
	// The blank cell is a valid pattern but a terrible first target: an empty
	// starting grid would already match it. Keep all 256 cells, blank last.
	for (var m = 1; m < 256; m++) EIGHT_TARGETS.push({ label: "组合 " + m, mask: m, dots: dotsLabel(m, 8) })
	EIGHT_TARGETS.push({ label: "组合 256", mask: 0, dots: dotsLabel(0, 8) })
})()

function sixTarget(i) { return SIX_TARGETS[((i % SIX_TARGETS.length) + SIX_TARGETS.length) % SIX_TARGETS.length] }
function eightTarget(i) { return EIGHT_TARGETS[((i % EIGHT_TARGETS.length) + EIGHT_TARGETS.length) % EIGHT_TARGETS.length] }
