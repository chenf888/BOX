// ============================================================
// TUNING — the single home for every pacing constant.
// Read by the game AND by tools/simulate.js (brief check 21).
// Any number noticed while playing becomes a row in design-brief
// §10, then a constant HERE, then a sim re-run — never a literal
// edited inside a layer file.
// ============================================================
var TUNING = {
    // --- row pacing (brief check 18) ---
    ROW_RATIO: 25,        // requires step per row (corpus median)
    OUTPUT_STEP: 20,      // output step per row  → per-row time ×1.25

    // --- softcaps (P12; measuredRetune: low power, visible caps) ---
    sSoftcapStart: 250,       // ≈ pi unlock point (primes)
    sSoftcapPower: 0.1,
    sSoftcapRaise: 10,        // u14 raises the cap ×10 (cap is visible: ctx line)
    piSoftcapStart: 1e4,      // ≈ pnt unlock (counts)
    piSoftcapPower: 0.15,
    facSoftcapStart: 2e4,     // ≈ wil unlock (factors)
    facSoftcapPower: 0.15,
    gapSoftcapStart: 3.5e4,   // ≈ row-2 content (gaps)
    gapSoftcapPower: 0.15,
    lemSoftcapStart: 1e6,     // notes... lem currency = primes-based? keep for numbers
    lemSoftcapPower: 0.15,
    pairsSoftcapStart: 2e6,   // splits (oracle unlock point)
    mgPayBase: 0.5,           // M3 minigame: correct pick banks this many seconds of prime income (filter-scale, NOT resetGain-scaled x5 - that was a x6-9 speed exploit, found by the Stage-6 re-measure)
    mgPayStreak: 0.25,        // +this many seconds per streak point (cap 8 -> 2.5 s)
    pairsSoftcapPower: 0.1,
    oracleSoftcapStart: 4e7,  // wisdom (zeta unlock point)
    oracleSoftcapPower: 0.1,

    // --- unlock thresholds (gate by threshold, never pay-to-enter) ---
    probUnlock: 5e7,          // numbers (blueprint: challenge unlock ~5e7x first-layer currency)
    casinoUnlock: 1e6,        // numbers — side casino opens mid row-1
    storyUnlock: 100,         // numbers — chronicle opens almost immediately
    zetaUnlockPrimes: 4e7,    // primes — the Boss reveals
    probUnlockNumbers: 5e7,   // numbers — the Open Problems hub reveals (brief S4: never paid entry)

    // --- sieve filters (P28 cooldown bursts; seconds) ---
    filterCooldowns: { 11: 20, 12: 45, 13: 90, 14: 180, 15: 300 },
    filterSeconds:    { 11: 15, 12: 40, 13: 90, 14: 200, 15: 500 }, // seconds of prime production granted
    filterMilestoneCut: 0.75, // s.m2: cooldowns ×0.75

    // --- prime pairs (custom layer, multipliers AROUND the pow) ---
    pairsLogReq: 5,           // gain = (log10(primes)/C)^E × pre × post
    pairsExp: 1.2,
    oracleLogReq: 6,
    oracleExp: 1.15,

    // --- zeta boss (P19 segmented-HP; M12, one layer) ---
    // Stage-6 retune (§11 #1): primes only reach ~1e13, so primes^0.3 gave ~1e3-4
    // damage vs HP x5/zero - zero #1 alone cost 4239 attacks (5.9 h of clicking).
    // Rebalanced: HP base 1e6->1e5, exp 0.3->0.5. First fight ~ 13 attacks (65 s).
    // Stage-6 retune round 2 (§11 #1b): the unlocked fight now totalled 5.3 h (band
    // 10-30 h) - pre-boss 0.85 h + a 4.4 h boss climb. Base x3 stretched it to 8.2 h
    // (measured elasticity: total ~ HP^0.45), so base lands back at 1e6 - the round-1
    // value - now that exp 0.5 carries the damage. Predicted total ~ 13 h.
    // Round 3 (§11 #1c/1e): gacha (blessing mix) swings runs +/-40%, clipping the floor
    // (9.15-15.34 h across samples), so base x2.25 (1.6e6 -> 3.6e6) targets a ~13.5 h median (P10 >= 10 h);
    // the quoted number is the MEDIAN of 3 dt-0.1 samples, never a single run.
    zetaHpBase: 3.6e6,        // HP of zero #0
    zetaHpGrowth: 5,          // HP ×5 per zero
    zetaDmgPrimeExp: 0.5,     // damage = primes^0.5 × mults
    zetaDmgBase: 1,
    zetaCd: 5,                // attack cooldown, seconds
    zetaCdUpgradeCut: 0.5,    // zeta u12: CD ×0.5
    zetaDmgSoftcapStart: "1e15",
    zetaDmgSoftcapPow: 0.5,

    // --- casino (M14, two distributions; softcapped payouts) ---
    casinoBetShare: 0.1,      // stake = 10% of numbers
    casinoCoinPay: 2.0,       // Legendre coin: win ×2 (fair)
    casinoDicePay: 5.0,       // dice: 6 pays ×5 (EV 0.83 — house edge)
    casinoWinCap: 1e6,        // per-flip winnings softcap
    casinoCooldown: 3,        // seconds between games

    // --- endgame ---
    endgameMilestones: 10,    // zeta.m9 = 10 zeros pinned → Riemann Hypothesis proved
}

// --- T2 language helper (P17): English default (chinesemode false) ---
// Kept in the save (addedPlayerData), NOT silently flippable later.
function L(cn, en) { return (typeof player !== "undefined" && player && player.chinesemode) ? cn : en }
