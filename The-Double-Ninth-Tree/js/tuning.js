// ===========================================================================
// TUNING — the single source of truth for every pacing constant of 2027重阳节树.
//
// Loaded as the FIRST modFile: in the browser it assigns window.TUNING; in the
// node harness (tools/smoke.js, tools/simulate.js) the same file assigns
// global.TUNING, so the game and the simulator can never diverge.
//
// Pacing law (design-brief §18): per-row time = requires step ÷ output step.
//   ROW_RATIO   = 25   (adjacent-row raw requires step, design-brief §4)
//   OUTPUT_STEP = 20   (each row's era output multiplies ~×20 by the time the
//                       next row unlocks)
//   per-row time = 25/20 = ×1.25 (target band ×1.1–×1.6)
// ===========================================================================
var W = (typeof window !== "undefined") ? window : global
W.TUNING = {
	version: "2026-10-17.1",

	ROW_RATIO: 25,       // adjacent-row requires step (raw Decimal values)
	OUTPUT_STEP: 20,     // per-row output step at the next unlock

	// --- unlock requires (raw values, in each layer's base currency) --------
	pReq: 10,            // p: 10 山道里程
	kReq: 250,           // k: ×25 of p
	jReq: 500,           // j: ×2.0 of k (same-row siblings, D7)
	dReq: 1000,          // d: ×4.0 of k
	xReq: 2000,          // x: ×8.0 of k
	gReq: 6250,          // g: ×25 of k (菊露)
	sReq: 5000,          // s: ×10 of j (醇藏)
	mReq: 15000,         // m: ×15 of d (茱佩)
	fReq: 50000,         // f: ×10 of s (诗章)
	yReq: 500000,        // y: ×10 of f (九山礼)

	// --- gain exponents ------------------------------------------------------
	pExp: 0.5,
	row1Exp: 1 / 3,
	fExp: 0.25,          // f custom hub
	gBase: 2,            // g static base
	mBase: 3,            // m static base
	yBase: 2,            // y static base

	// --- theme ceilings (caps modifier) --------------------------------------
	gCap: 9,             // 重阳糕: exactly nine layers (hard, canon)
	yCap: 9,             // 九重天: exactly nine tiers (hard)
	yFinaleCost: "1e9",  // y upgrade 45 "长命百岁" (F15: above the top rung 1.28e8)

	// --- softcaps (P12, power as written) -----------------------------------
	pCap: 3000,          // p gain (登程/reset) cap, starts just past x-unlock
	pCapUp: "1e8",       // K5: p u15 delays the cap (cap is displayed on p tab)
	pCapPow: 0.5,
	kCap: "1e4",         // k gain (菊露/reset) cap ≈ g-era
	kCapPow: 0.4,
	xCap: "1e5",         // x gain (花契/reset) cap
	xCapPow: 0.4,

	// --- 酒坊 9-day brew (j M4 tick) ------------------------------------------
	brewTime: 90,        // seconds per brew cycle (9 日 × 10s, theme-compressed)
	brewGainBase: 5,     // 醇藏… no: J1 酒力 per completed brew (before mults)

	// --- 菊珠 drip (k M5 update) --------------------------------------------
	jadeDrip: 0.05,      // 菊珠/s base rate on k (× upgrades × milestones)

	// --- M2 score-attack hub (f) --------------------------------------------
	chalScoreTargets: [1000, 100000, 1e7, 1e9],   // per-challenge f.scratch goals
	chalRoots: [5, 3, 2, 1.5],   // P16: while in challenge i, f gain = root(gain, root_i)
	m2RewardExp: 0.3,    // challengeEffect(i) = (maxpoints[i]+1)^0.3
	fRerootAt: "1e6",    // P12 #3: f gain re-root ≥1e6 → sqrt ×1e3
	fRerootAtS: "1e6",   // s custom re-root ≥1e6 → sqrt ×1e3

	// --- automation ladder thresholds (§6, on p.best 登程) -------------------
	pM0: 25,             // step 1: keep p.upgrades on p resets
	pM1: 50,            // step 2: p passiveGeneration = 1
	pM2: 100,           // step 3: p autoPrestige
	pM3: 200,           // step 4: p autoUpgrade
	fPackage: 30,       // step 5: f milestone 4 → 3-flag package on k,j,d,x,g,s,m

	// --- endgame -------------------------------------------------------------
	fM9: 1000,          // f milestone 9 (九山礼 best): gates the finale display
	yM1: 4,             // y milestone 1: 云阶 ≥4
}
