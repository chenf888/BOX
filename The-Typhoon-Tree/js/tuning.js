// ============================================================================
// The Typhoon Tree — js/tuning.js
// The ONE home for every pacing constant. Read by the game AND by the
// simulator (tools/simulate.js). Never inline these numbers in a layer file.
// (handbook 14 §3.3; SKILL.md Stage 4.5)
// ============================================================================

var TUNING = {
    // --- base economy ---
    VAPOR_BASE: 1,                 // water vapor per second at the very start

    // --- monsoon trough (active-tick core) ---
    TRANSPORT_TIME: 10,            // seconds per moisture-transport cycle at speed 1
    TRANSPORT_GAIN: 10,            // flux gained per completed cycle at speed 1
    TANK_INFLOW: 25,               // tank units per second at speed 1
    SAT_CAP: "1e6",                // saturation hard cap — relative humidity 100% (Q3)
    PUMP_SECONDS: 30,              // cloud seeding = instant N seconds of vapor production
    PUMP_CD: 60,                   // cloud seeding cooldown (seconds, real time; P28)

    // --- eyewall: energy -> wind speed mapping (m/s) ---
    WIND_LOG_A: 2.5,               // m/s = A * (log10(energy) + B)
    WIND_LOG_B: 2,                 //   energy 1.2e11 -> 32.7 m/s (TY); 2.5e18 -> 51.0 (SuperTY)
    MPI_MS: 85,                    // maximum potential intensity softcap (visible, K5)
    MPI_POWER: 0.4,
    MPI_RAISE_MS: 10,              // one visible cap raise (85 -> 95), sold once (eyew u33)
    WIND_TY: 32.7,                 // landfall gate: typhoon category (m/s)

    // wind-category milestone ladder (m/s) — CN standard classification
    WIND_CATS: [17.2, 24.5, 32.7, 41.5, 51.0, 61.3, 72.0, 85.0],

    // --- landfall (M19 consumable reset) ---
    LANDFALL_WIND: 32.7,           // must be at least a typhoon to make landfall
    LANDFALL_POW: 0.9,             // each burn term: log10(res+1) ^ POW * WEIGHT * mults
    LANDFALL_MULT: [2, 5, 10, 25], // term weights: vapor / cloud / vorticity / energy

    // --- hostile environment (M2 score-attack) ---
    CHAL_BASES: [150, 600, 2500, 1e4, 5e4],   // peak-score goal base per challenge
    CHAL_GOAL_GROWTH: 2,                      // goal multiplies by this per completion
    CHAL_COMPLETIONS: 5,                      // completionLimit (31 uses 3)
    ADAPT_RATE: 0.2,               // adaptation/s per unit of summed log10(peak)

    // --- eyewall energy inflow (sim layer; integrator in eyew.update) ---
    EYEW_INFLOW_BASE: 100,         // energy/s at band=0, vort=0, all mults 1
    EYEW_BAND_BASE: 2,             // inflow doubles per rainband floor (exponential ramp)
    EYEW_VORT_POW: 0.5,            // inflow x vorticity^0.5

    // --- subtropical high steering flow (M8 shop) ---
    STEER_WIND_RATE: 0.5,          // steering/s per m/s of wind speed
    STEER_CLOUD_RATE: 0.5,         // steering/s per log10(cloud best)
    STEER_CAP: 500,                // steering accrual hard cap (integrated reading)

    // --- casino (M14; two of the four distributions) ---
    DICE_BET_SHARE: 0.1,           // each dice bet stakes this share of latent heat
    DICE_PAYOUT: 0.08,             // payout = stake * product * PAYOUT (softcapped)
    DICE_PAYOUT_CAP: 25,           // per-bet payout cap (x stake)
    COIN_BET_SHARE: 0.1,
    COIN_PAYOUT_CAP: 8,            // streak payout cap (x stake)
    CAS_CD: 3,                     // seconds between bets

    // --- design-doc pacing constants (brief §4; verified by the simulator) ---
    REQ_RATIO: 25,                 // requires step per row (design: x25-x50)
    OUTPUT_STEP: 20,               // output step per row (design: x20) -> per-row x1.25

    // --- minigame (M3 convective burst) ---
    BURST_STAKE: 100,              // latent heat paid to start a run
    BURST_CELLS: 6,                // clickable cloud cells
    BURST_PAYOUT_CAP: 50,          // payout cap (x stake)
}

// --- language helper (T2, P17 convention; default English, Q7) -----------------
// player.chinesemode is persisted in the save (addedPlayerData); the toggle is
// the Language button on the settings screen (systemComponents.js options-tab).
function L(en, zh) {
    return (typeof player !== "undefined" && player && player.chinesemode) ? zh : en
}
function toggleChinese() {
    player.chinesemode = !player.chinesemode
}

// --- derived: wind speed from eyewall energy (m/s display value) --------------
function windMS() {
    if (typeof player === "undefined" || !player || !player.eyew || !player.eyew.energy) return new Decimal(0)
    let raw = player.eyew.energy.max(1).log10().add(TUNING.WIND_LOG_B).times(TUNING.WIND_LOG_A)
    let cap = new Decimal(TUNING.MPI_MS)
    if (player.eyew && hasUpgrade("eyew", 33)) cap = cap.add(TUNING.MPI_RAISE_MS)
    return softcap(raw, cap, TUNING.MPI_POWER)
}

// --- derived: wind category name for the current wind speed -------------------
function windCatName(w) {
    const c = TUNING.WIND_CATS
    if (w.lt(10.8)) return L("Disturbance", "扰动")
    if (w.lt(c[0])) return L("Tropical Depression", "热带低压")
    if (w.lt(c[1])) return L("Tropical Storm", "热带风暴")
    if (w.lt(c[2])) return L("Severe Tropical Storm", "强热带风暴")
    if (w.lt(c[3])) return L("Typhoon", "台风")
    if (w.lt(c[4])) return L("Severe Typhoon", "强台风")
    if (w.lt(c[5])) return L("Super Typhoon", "超强台风")
    if (w.lt(c[6])) return L("Super Typhoon+", "超强台风+")
    return L("Near-MPI Monster", "逼近上限的风暴")
}

// --- derived: monsoon strength multipliers (mon points -> other layers) -------
function monsoonLatentMult() {
    if (typeof player === "undefined" || !player || !player.mon) return new Decimal(1)
    let s = player.mon.points.add(1).pow(0.5)
    return s.max(1)
}
function monsoonVaporMult() {
    if (typeof player === "undefined" || !player || !player.mon) return new Decimal(1)
    let s = player.mon.points.add(1).pow(0.3)
    return s.max(1)
}

// strength-gain multipliers for the monsoon surge (getResetGain)
function monsoonStrengthMult() {
    if (typeof player === "undefined" || !player || !player.mon) return new Decimal(1)
    let m = new Decimal(1)
    if (hasUpgrade("mon", 25)) m = m.times(player.mon.flux.add(1).log10().add(1).pow(1.5))
    if (hasUpgrade("mon", 31)) m = m.times(player.evap.best.add(1).pow(0.3))
    if (hasUpgrade("mon", 32)) m = m.times(3)
    if (player.env) {
        let c = new Decimal(challengeCompletions("env", 11)).add(challengeCompletions("env", 12)).add(challengeCompletions("env", 21)).add(challengeCompletions("env", 22)).add(challengeCompletions("env", 31))
        m = m.times(c.times(0.5).add(1))
    }
    if (player.vor && hasMilestone("vor", 3)) m = m.times(3)
    return m
}

// --- derived: monsoon transport cycle gain (flux per completed cycle) ---------
function monsoonCycleGain() {
    let g = new Decimal(TUNING.TRANSPORT_GAIN)
    if (hasUpgrade("mon", 11)) g = g.times(2)
    if (hasUpgrade("mon", 21)) g = g.times(5)          // KEY u21
    if (hasUpgrade("mon", 14)) g = g.times(player.mon.flux.add(1).pow(0.35))
    if (hasUpgrade("evap", 34)) g = g.times(3)         // evap K8 -> mon flux
    if (hasUpgrade("conv", 24)) g = g.times(2)
    if (player.band && hasUpgrade("band", 18)) g = g.times(1.5)
    if (player.land && hasUpgrade("land", 25)) g = g.times(3)
    if (hasMilestone("mon", 0)) g = g.times(2)
    if (player.env && inChallenge("env", 22)) g = g.div(2)   // Fujiwhara nerf
    if (player.suh && hasUpgrade("suh", 12)) g = g.pow(1.1)  // K4 named: 输送效率
    if (player.env && hasChallenge("env", 22)) g = g.times(envFujiwharaFluxMult())  // challenge reward consumer
    return g
}
function monsoonSpeed() {
    let s = new Decimal(1)
    if (hasUpgrade("mon", 22)) s = s.times(1.5)        // K4 named: 输送效率(speed)
    if (hasMilestone("evap", 3)) s = s.times(1.25)
    if (player.suh && hasUpgrade("suh", 12)) s = s.times(1.1)
    if (player.env && inChallenge("env", 22)) s = s.div(2)
    return s
}
function monsoonTankRate() {
    let r = new Decimal(TUNING.TANK_INFLOW)
    if (hasUpgrade("mon", 12)) r = r.times(2)
    if (hasMilestone("mon", 2)) r = r.times(2)
    return r
}
function pumpCooldownMs() {
    let cd = TUNING.PUMP_CD * 1000
    if (hasMilestone("mon", 3)) cd = cd / 2
    if (player.suh && hasUpgrade("suh", 15)) cd = cd / 2
    return cd
}
function pumpSeconds() {
    let s = TUNING.PUMP_SECONDS
    if (hasUpgrade("mon", 23)) s += 20
    return s
}

// --- derived: achievements reward multipliers (no tmp reads; P64 discipline) --
function achMults() {
    let m = { vapor: new Decimal(1), latent: new Decimal(1), cloud: new Decimal(1) }
    if (typeof player === "undefined" || !player || !player.ach) return m
    const V = [11, 14, 17, 22, 26, 33, 38, 43, 47, 52, 57, 63, 68, 73, 78, 84, 88, 93, 98, 103]
    const A = [12, 18, 24, 31, 37, 44, 51, 58, 64, 71, 77, 83, 91, 97]
    const C = [13, 21, 28, 35, 42, 49, 56, 62, 69, 76, 82, 87, 94, 101]
    const VV = [1.5, 1.5, 2, 2, 2, 2, 2.5, 2.5, 2.5, 3, 3, 3, 4, 4, 4, 5, 5, 6, 8, 10]
    const AV = [1.5, 1.5, 2, 2, 2, 2, 2.5, 2.5, 2.5, 3, 3, 3, 4, 5]
    const CV = [1.5, 1.5, 2, 2, 2, 2, 2.5, 2.5, 3, 3, 3, 4, 5, 6]
    for (let i = 0; i < V.length; i++) if (hasAchievement("ach", V[i])) m.vapor = m.vapor.times(VV[i])
    for (let i = 0; i < A.length; i++) if (hasAchievement("ach", A[i])) m.latent = m.latent.times(AV[i])
    for (let i = 0; i < C.length; i++) if (hasAchievement("ach", C[i])) m.cloud = m.cloud.times(CV[i])
    return m
}

// --- derived: casino (M14) payout multipliers ---------------------------------
function forecastMult() {
    if (typeof player === "undefined" || !player || !player.cas) return new Decimal(1)
    return player.cas.forecastXP.times(0.1).add(1).min(4)
}
function streakCloudMult() {
    if (typeof player === "undefined" || !player || !player.cas) return new Decimal(1)
    return new Decimal(player.cas.streak).times(0.1).add(1).min(3)
}

// --- derived: subtropical-high steering flow (accrued in suh.update) ----------
// The steering reading feeds the eyewall energy inflow: a favorable ridge
// vents the outflow and deepens the storm.
function suhSteerMult() {
    if (typeof player === "undefined" || !player || !player.suh) return new Decimal(1)
    let s = new Decimal(player.suh.steer || 0)
    if (s.lte(0)) return new Decimal(1)
    s = s.add(1).pow(0.4)
    return softcap(s, new Decimal(4), 0.5)          // steer 100 -> x4, then pow 0.5
}

// --- derived: translate static baseResource strings for the resource-display
// override (baseResource must be a static string for the engine; the display
// side localizes it here).
function trRes(s) {
    const M = {
        "Latent Heat": ["Latent Heat", "潜热"],
        "Water Vapor": ["Water Vapor", "水汽"],
        "Cloud Mass": ["Cloud Mass", "云团"],
        "Vorticity": ["Vorticity", "涡度"],
        "Rainbands": ["Rainbands", "雨带"],
        "Warm Core": ["Warm Core", "暖心"],
    }
    const m = M[s]
    if (!m) return s
    return (typeof player !== "undefined" && player && player.chinesemode) ? m[1] : m[0]
}
