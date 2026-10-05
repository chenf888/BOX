// ===========================================================================
// TUNING — the single source of truth for every pacing constant.
//
// Read lazily by mod.js (modFiles load after mod.js executes, so mod.js never
// touches window.TUNING at top level), by tools/gen_truth_layer.js when
// emitting the layer, and required directly by tools/simulate.js.
//
// Tuned 2026-10-06 by headless simulation (tools/simulate.js) against the
// 100-hour target. See design-brief.md §11 for the measured results.
//
// The pacing law this encodes (design-brief.md §9.1, brief D4):
//   dL/dt = baseRate × G(L),  G = Π multipliers, all O(1)
//   t_total = (k/ln10)/baseRate × (1 − 10^(−ΔL/k)),  1/k = Σ ln(G_i)/(ln10·ΔL)
// A self-amplifying term is mathematically incompatible with this target —
// any exponent big enough to matter detonates the game, any smaller one is
// decoration. So there is NO self-term; multiplier growth does the pacing.
// ===========================================================================
var W = (typeof window !== "undefined") ? window : global
W.TUNING = {
	version: "2026-10-06.1",

	// --- production ----------------------------------------------------------
	// Rate (per second) at the bottom of the ladder. 0.001054/s = first upgrade
	// affordable in ~10s (author rule: first boost < 10s). Set by simulation:
	// total playtime scales linearly in 1/baseRate (design-brief §11 integral).
	baseRate: 0.001068,

	// Era gates. gate 0 = bars/Proof-Spark threshold; gates 1-3 = era II/III/IV
	// boundaries (the layer's eraIndex uses gates 1-3).
	eraGates: [10, 30, 300, 3000],          // as log10

	// --- upgrade effect values (271 value upgrades, total ≈ ×5) ---------------
	// multBase(era, idx) = upgBase + (idx % 6) * upgStep + era * upgEra
	upgBase: 1.004,
	upgStep: 0.0006,
	upgEra: 0.0003,

	// --- buyable ladders (the span carriers) ----------------------------------
	// cost(x) = base^((x<soft ? x : x*x/soft)^costPow)  [log10 span per family]
	// rate contribution: ladderMult = 1 + ownedAcrossAllFamilies * ladderRatePer
	ladders: [
		{ id: 11, base: 3,   costPow: 1.2, gate: 0, limit: 45 },   // era I
		{ id: 12, base: 3.4, costPow: 1.2, gate: 1, limit: 62 },   // era II
		{ id: 13, base: 4,   costPow: 1.1, gate: 2, limit: 260 },  // era III
		{ id: 14, base: 5,   costPow: 1.1, gate: 3, limit: 220 },   // era IV
	],
	costSoftcapAt: 25,
	ladderRatePer: 0.002,

	// --- upgrade cost stairs ---------------------------------------------------
	// Each era's 75 upgrades span [from, to] in log10 Truth. bias > 1 packs the
	// early stairs finer (the opening rhythm); `opening` lists the first few
	// explicit steps up from 10^-64 so the first boost lands inside 10 seconds.
	// keyDrops: indices that get a deliberate cheap cost (corpus rhythm device).
	costStairs: [
		{ era: 0, from: -63.985, to: 29,   bias: 2.2, opening: [0.0044, 0.012, 0.026, 0.052, 0.105, 0.21, 0.4] },
		{ era: 1, from: 30.5,    to: 298,  bias: 1.6 },
		{ era: 2, from: 300.5,   to: 2990, bias: 2.2 },
		{ era: 3, from: 3000.5,  to: 4460, bias: 1.8 },
	],
	keyDrops: { 12: -40, 25: -20, 37: 1 },   // upgrade idx -> log10 cost (era 0 flavour)

	// --- milestones (72: 20 / 20 / 20 / 12) ------------------------------------
	// Thresholds expand over [from, to] log10 Truth with the given bias.
	// Grants: mult (v × rate), autoUpgN / autoBuyN (automation flag, set ON at
	// completion per handbook 12 #39, toggleable on the milestone), spark (v ×
	// Proof-Spark rate), trials (reveal the Trials tab).
	milestoneEras: [
		{ from: -60, to: 27,    count: 20, bias: 1.35 },
		{ from: 30,  to: 296,   count: 20, bias: 1.35 },
		{ from: 300, to: 2980,  count: 20, bias: 1.35 },
		{ from: 3000, to: 4440, count: 12, bias: 1.35 },
	],
	milestoneMultByEra: [1.012, 1.012, 1.012, 1.012],   // per-era default mult grant            // default mult-grant value
	milestoneMultEraEnd: [1.03, 1.03, 1.03, 1.03],       // per-era last-milestone mult       // the last milestone of each era
	milestoneGrants: {
		1: { type: "trials" },
		3: { type: "spark", v: 2 },
		8: { type: "autoUpg", n: 0 },
		12: { type: "autoBuy", n: 0 },
		16: { type: "spark", v: 2 },
		24: { type: "autoUpg", n: 1 },
		28: { type: "autoBuy", n: 1 },
		36: { type: "spark", v: 2 },
		40: { type: "autoUpg", n: 2 },
		44: { type: "autoBuy", n: 2 },
		52: { type: "spark", v: 3 },
		60: { type: "spark", v: 3 },
		66: { type: "spark", v: 4 },
	},

	// --- challenges (M1) --------------------------------------------------------
	// goal log10 Truth (unchanged from the original design) and the reward
	// multiplier applied ONCE per cleared challenge. 16 × ~×1.09 ≈ ×3.5 total.
	challengeGoals: {
		11: 4, 12: 6, 13: 9, 14: 12,
		21: 16, 22: 20, 23: 26, 24: 34,
		31: 44, 32: 58, 33: 76, 34: 98,
		41: 130, 42: 165, 43: 210, 44: 260,
	},
	challengeRewards: {
		11: 1.05, 12: 1.05, 13: 1.06, 14: 1.06,
		21: 1.07, 22: 1.08, 23: 1.09, 24: 1.10,
		31: 1.10, 32: 1.11, 33: 1.12, 34: 1.13,
		41: 1.14, 42: 1.15, 43: 1.16, 44: 1.18,
	},

	// --- achievements (the five rate-wired ids; display == applied) ------------
	achievementMults: { 101: 1.03, 201: 1.03, 301: 1.04, 401: 1.04, 501: 1.06 },

	// --- era-IV ascension rungs -------------------------------------------------
	// Each rung is a DISCRETE jump: on purchase, Truth itself gains `add`
	// layers (claimTranscendence applies T = T.layeradd(add, 10) once). The
	// cumulative +3.0 slog from ~4.65 crosses F11 (7.024) exactly at rung 24.
	// Costs sit just past the era-IV ladder end (4460) so the whole infinity
	// ladder must be climbed before any ascension — no skip runs.
	rungs: [
		{ id: 21, costL: 4470, add: 0.6 },
		{ id: 22, costL: 4475, add: 0.7 },
		{ id: 23, costL: 4480, add: 0.8 },
		{ id: 24, costL: 4485, add: 0.9 },
	],

	// --- spark economy (side currency; capped log terms keep effects small) ----
	sparkMilestoneRate: 0.001,       // × Truth per second once the spark milestone is done
	sparkLogCap: 50,                 // effect() log terms read min(log10(sparks), this)

	// --- endgame ----------------------------------------------------------------
	f11: { depth: 6, top: 11 },      // F11 = 10^10^10^10^10^10^11
}

// F11's slog10, for the sim and for display sanity checks. ≈ 7.024.
W.TUNING.f11Value = null
if (typeof Decimal !== 'undefined') {
	var fx = new Decimal(W.TUNING.f11.top)
	for (var fi = 0; fi < W.TUNING.f11.depth; fi++) fx = new Decimal(10).pow(fx)
	W.TUNING.f11Value = fx
}
// ---------------------------------------------------------------------------
// Expanded milestone table — computed once from the specs above.
// Returns { id: { L (log10 Truth threshold), type, v } } for all 72 milestones.
// Used by the layer generator (emitting done()/grants), by mod.js (lazy, at
// tick time) and by tools/simulate.js.
// ---------------------------------------------------------------------------
;(function () {
	var W = (typeof window !== "undefined") ? window : global
	W.TUNING.expandMilestones = function () {
		var out = {}
		var id = 0
		for (var e = 0; e < W.TUNING.milestoneEras.length; e++) {
			var spec = W.TUNING.milestoneEras[e]
			for (var j = 0; j < spec.count; j++) {
				var frac = spec.count > 1 ? j / (spec.count - 1) : 1
				var L = spec.from + (spec.to - spec.from) * Math.pow(frac, spec.bias)
				var g = W.TUNING.milestoneGrants[id]
				var isEraEnd = (j === spec.count - 1)
				if (!g) g = { type: "mult", v: isEraEnd ? W.TUNING.milestoneMultEraEnd[e] : W.TUNING.milestoneMultByEra[e] }
				g.L = L
				out[id] = g
				id++
			}
		}
		return out
	}
})()
