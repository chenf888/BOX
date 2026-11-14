// tuning.js — the single home for every pacing constant (handbook 14 §3.3).
// Read by the game AND by tools/simulate.js. Never inline these numbers in a layer file.
//
// ROW_RATIO   : requires ×25 per row (corpus median, D-REQRATIO band ×10–×100)
// OUTPUT_STEP : per-row output step ×18 → per-row time ×1.39 (target band ×1.1–×1.6, handbook 11 §4.1)
// HARD_WALL_DIVISOR : hard mode divides ROOT point gain by this (the "root valve", Q6).
//                     One knob, whole tree slows uniformly; calibrated by the Stage-6 sim.
const TUNING = {
	ROW_RATIO: 25,
	OUTPUT_STEP: 18,
	HARD_WALL_DIVISOR: 8,

	// each deeper layer's "echo" — a sublinear boost of its own points applied to every
	// older layer's gain (the P10 web). Exponent small on purpose: eleven echoes compound.
	ECHO_POW: 0.12,

	// the continuous self-terms (自增益项, one per layer max, N-SELFTOTAL: ≤0.5 + softcap)
	SELF_EXP: { ri: 0.35, fl: 0.4, si: 0.4, ou: 0.3 },
	SELF_CAP_START: { ri: "1e6", fl: "1e12", si: "1e18", ou: "1e6" },
	SELF_CAP_POW: 0.4,

	// layer-level softcaps (P12): start ≈ 2.5× the layer's own requires, visible in-tab,
	// raised ×10 by a named upgrade/milestone (measuredRetune: raise is ×10, never ×1000)
	// Stage-6 R1: so/ch/si follows the retimed requires (×10 rows 6+)
	SOFTCAP_START: { ri: "1e3", ec: "2.5e3", re: "1.6e4", fl: "1e7", ov: "2.5e8", so: "2.5e10", ch: "2.5e11", si: "2.5e13" },
	SOFTCAP_POW: { ri: 0.4, ec: 0.4, re: 0.35, fl: 0.35, ov: 0.35, so: 0.3, ch: 0.3, si: 0.3 },

	// the tuning manifold (M20, endgame): 13 currencies, one shared ou-currency budget.
	// level ≤10 neutral; each level above 10 adds STEP to that currency's gain exponent.
	MANIFOLD: {
		start: 1,          // first level costs 1 ou
		mult: 1.6,         // cost ×1.6 per level
		neutral: 10,       // levels start here (weakening is never sold)
		maxLevel: 14,      // pow ≤ 1.2 — raised to 15/16 by ou upgrade 13 / milestone 9
		step: 0.05,
	},
}

// ---- shared helpers (plain functions — NOT layer hooks, nothing to register) ----

// T2 bilingual ternary helper (P17). English default: player.chinesemode starts false.
function lg(cn, en) {
	return player.chinesemode ? cn : en
}

// the language toggle behind the Settings-panel button (N-LANGTOGGLE: no floating switch)
function toggleChinese() {
	player.chinesemode = !player.chinesemode
	save()
}

// hard mode "root valve" (Q6): divide root point gain, one knob for the whole tree
function difficultyDivisor() {
	return player.difficulty === "hard" ? TUNING.HARD_WALL_DIVISOR : 1
}

// a deeper layer's echo multiplier — 1 when the layer defines no effect (P64-safe read)
function echoMult(id) {
	let e = tmp[id] && tmp[id].effect
	return (e && e.echoMult) ? e.echoMult : new Decimal(1)
}

// product of every layer in `ids`'s echo multipliers
function echoWeb(ids) {
	let m = new Decimal(1)
	for (let i = 0; i < ids.length; i++) m = m.times(echoMult(ids[i]))
	return m
}

// tuning-manifold exponent modifier for a currency ("points" or a layer id).
// 1 while the manifold is locked or the level is ≤ neutral — pow(x,1) is a no-op.
const MANIFOLD_MAP = { points: 11, ri: 12, ec: 13, re: 21, sw: 22, fl: 23, ov: 31, in: 32, so: 33, ch: 41, fr: 42, si: 43, ou: 51 }
function manifoldMaxLevel() {
	let cap = TUNING.MANIFOLD.maxLevel
	if (hasUpgrade("ou", 13)) cap = 15
	if (hasMilestone("ou", 9)) cap = 16
	return cap
}
function manifoldMod(cur) {
	if (!player.ou || !player.ou.unlocked) return new Decimal(1)
	let lv = getBuyableAmount("ou", MANIFOLD_MAP[cur]).toNumber()
	let over = Math.min(lv, manifoldMaxLevel()) - TUNING.MANIFOLD.neutral
	if (over <= 0) return new Decimal(1)
	return new Decimal(1 + over * TUNING.MANIFOLD.step)
}

// closed-form buyMax for a geometric cost curve cost(n) = start × base^n (P54).
// Solves the geometric-series sum, pays the exact total, sets the new amount. No +1 loops.
function geoBuyMax(layerId, id, start, base) {
	let cur = getBuyableAmount(layerId, id).toNumber()
	let unit = Decimal.pow(base, cur).times(start)
	let avail = player[layerId].points
	if (avail.lt(unit)) return
	// avail >= unit × (base^n − 1)/(base − 1)  →  n = log_base(avail(base−1)/unit + 1)
	let n = avail.times(base - 1).div(unit).add(1).log(base).floor().max(1).toNumber()
	let cost = unit.times(Decimal.pow(base, n).sub(1)).div(base - 1)
	if (cost.gt(avail)) {
		n = n - 1
		if (n < 1) return
		cost = unit.times(Decimal.pow(base, n).sub(1)).div(base - 1)
	}
	player[layerId].points = player[layerId].points.sub(cost).max(0)
	player[layerId].spentOnBuyables = player[layerId].spentOnBuyables.add(cost)
	setBuyableAmount(layerId, id, new Decimal(cur + n))
}
