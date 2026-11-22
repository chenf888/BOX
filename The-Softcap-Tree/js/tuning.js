// ============================================================
// The Softcap Tree — js/tuning.js
// The ONE home for every pacing constant (handbook 14 §3.3).
// Read by the game AND by tools/simulate.js — never inline
// these literals anywhere else. Global helpers (cm/L/pace/caps)
// live here so the display, the formulas and the simulator
// can never disagree about a number.
// ============================================================

var TUNING = {
    pace: {
        defaultWallMin: 45,   // wall length the balance was calibrated at (paceMult = 1)
        minWallMin: 5,
        maxWallMin: 10080,    // a week
    },
    st: {
        idealCap: "1e12",     // R7: the ideal-rate web (u12/u22/th14 stock terms) is unbounded — compress past 1e12/s
        t0: 100,              // base Force cap T_st — the first wall
        thExp: 0.15,          // R9 (was 0.25): threshold currency feeds T_st slower
        wellExp: 0.08,        // gr coupling-well exponent on strain overflow
        stressSoftcap: "1e50",
        stressEff: 0.1,        // R9: only 10% of the suppressed fraction converts to usable Stress
    },
    row1: {
        softcapStart: "1e9",  // th reset-gain softcap start (× raises)
        softcapPow: 0.1,      // measuredRetune power (balance-defaults softcap.measuredRetune)
        pillarBase: 100,      // pillar cap start base
        pillarExp: 0.25,      // sibling feeds the sibling's cap: start ×= (1+sib^0.25)
    },
    row2: { softcapStart: "1e12", softcapPow: 0.1 },
    tw: {
        fillBase: 60,         // seconds for breakthrough #0 at full suppression (÷ paceMult)
        fillGrowth: 1.5,      // fill time ×1.5 per breakthrough — the wall lengthens
        fillCapS: 1800,       // fill time caps at 30 min at pace 1 (the dial scales this)
    },
    in: {
        hardRate: 0.003,      // R10 (was 0.02): the wall must not lift itself in minutes
        hardCap: 25,          // R10 (was 100)
    },
    nc: {
        compPerRaise: 0.08,   // each owned cap raise compresses raise products (nc eases)
    },
    mf: {
        poolBase: 90,         // tuning pool: 9 resources × default level 10
        poolPerUpgrade: 30,
        levelMin: 5,
        levelMax: 30,
        gainLogPow: 1.2, // measured retune R2: 0.6 put tuning 25 at overflow 1e200 (ratio quantities cap at ~1e18)
    },
    ov: { logPow: 1.3 }, // R14 (was 1.4): the unscrambled valve chain fires its big multipliers
                         // earlier — the ladder needs more total overflow to compensate
}

// ---------- T2 language helpers (default English; toggle lives in the Settings panel) ----------
// The preference is persisted on player.chinesemode (addedPlayerData); cm() guards for
// pre-load calls (engine chrome renders only after load, but updateTempData may run early).
function cm() { return (typeof player !== "undefined" && player && player.chinesemode === true) }
function L(en, zh) { return cm() ? zh : en }
// localized chrome for the engine components (components.js main-display / resource-display)
var modText = {
    get youHave() { return L("You have ", "你有 ") },
    get gainingPre() { return L("You are gaining ", "你正在以每秒 ") },
    get perSecond() { return L("per second", "的速度获取") },
    get bestPre() { return L("Your best", "你的最佳") },
    get bestMid() { return L("is", "为") },
    get totalPre() { return L("You have made a total of", "你累计制造了") },
}
// options-tab controls (the Settings panel — never a floating button, N-LANGTOGGLE)
function toggleChinese() {
    player.chinesemode = !(player.chinesemode === true)
}
function clampPaceWall() {
    var w = Number(player.paceWallMin)
    if (!isFinite(w)) w = TUNING.pace.defaultWallMin
    player.paceWallMin = Math.max(TUNING.pace.minWallMin, Math.min(TUNING.pace.maxWallMin, Math.round(w)))
}
function cycleWallPreset() {
    var presets = [15, 30, 45, 60, 120, 240]
    var cur = Number(player.paceWallMin) || TUNING.pace.defaultWallMin
    var next = presets[0]
    for (var i = 0; i < presets.length; i++) {
        if (presets[i] > cur) { next = presets[i]; break }
    }
    player.paceWallMin = next
}

// ---------- Q6 pace dial ----------
// paceMult() = how much faster everything runs vs the calibrated reference wall.
// The wall length in minutes is free-set in the options panel (player.paceWallMin):
// shorter wall = faster game = the rate form of "inverse softcap severity".
function paceMult() {
    var w = (player && typeof player.paceWallMin === "number" && isFinite(player.paceWallMin))
        ? player.paceWallMin : TUNING.pace.defaultWallMin
    w = Math.max(TUNING.pace.minWallMin, Math.min(TUNING.pace.maxWallMin, w))
    var m = TUNING.pace.defaultWallMin / w
    return Math.max(0.1, Math.min(100, m))
}

// ---------- cap-raise registry ----------
// Every cap raise in the game is one row here. The PRODUCT of owned raises is
// meta-compressed (nc's whole reason to exist): raises^(metaCompExp()).
// target: "st"/"th"/"pl"/"pt" = that cap only; "global" = every cap.
var CAP_RAISES = {
    st13:  { test() { return hasUpgrade("st", 13) }, mult: 5,   target: "st" },
    st14:  { test() { return hasUpgrade("st", 14) }, mult: 5,   target: "st" },
    st23:  { test() { return hasUpgrade("st", 23) }, mult: 10,  target: "st" },
    thM1:  { test() { return hasMilestone("th", 1) }, mult: 5,  target: "global" },
    thU12: { test() { return hasUpgrade("th", 12) }, mult: 10,  target: "st" },
    thU21: { test() { return hasUpgrade("th", 21) }, mult: 2,   target: "pl" },
    thU22: { test() { return hasUpgrade("th", 22) }, mult: 2,   target: "pt" },
    thU15: { test() { return hasUpgrade("th", 15) }, mult: 10,  target: "th" },
    plU12: { test() { return hasUpgrade("pl", 12) }, mult: 2,   target: "pl" },
    plU13: { test() { return hasUpgrade("pl", 13) }, mult: 2,   target: "pt" },
    plU22: { test() { return hasUpgrade("pl", 22) }, mult: 2,   target: "pl" },
    ptU12: { test() { return hasUpgrade("pt", 12) }, mult: 2,   target: "pt" },
    ptU13: { test() { return hasUpgrade("pt", 13) }, mult: 2,   target: "pl" },
    ptU22: { test() { return hasUpgrade("pt", 22) }, mult: 2,   target: "pt" },
    grM3:  { test() { return hasMilestone("gr", 3) }, mult: 10, target: "global" },
    ovU12: { test() { return hasUpgrade("ov", 12) }, mult: 2,   target: "global" },
    ovU25: { test() { return hasUpgrade("ov", 25) }, mult: 10,  target: "global" },
    ovM1:  { test() { return hasMilestone("ov", 1) }, mult: 5,  target: "global" },
    grU21: { test() { return hasUpgrade("gr", 21) }, mult: 2,   target: "pl" },
    grU22: { test() { return hasUpgrade("gr", 22) }, mult: 2,   target: "pt" },
    grU25: { test() { return hasUpgrade("gr", 25) }, mult: 10,  target: "th" },
    inM1a: { test() { return hasMilestone("in", 1) }, mult: 2,  target: "pl" },
    inM1b: { test() { return hasMilestone("in", 1) }, mult: 2,  target: "pt" },
    twU12: { test() { return hasUpgrade("tw", 12) }, mult: 2,   target: "global" },
    twU22: { test() { return hasUpgrade("tw", 22) }, mult: 2,   target: "global" },
    twM2:  { test() { return hasMilestone("tw", 2) }, mult: 5,  target: "global" },
    ovM3:  { test() { return hasMilestone("ov", 3) }, mult: 5,  target: "global" },
}
var GLOBAL_RAISE_KEYS = ["thM1", "grM3", "twU12", "twM2", "ovM3", "twU22", "ovU12", "ovU25", "ovM1"]
var ALL_RAISE_KEYS = Object.keys(CAP_RAISES)

function raiseProduct(keys) {
    var r = new Decimal(1)
    for (var i = 0; i < keys.length; i++) {
        if (CAP_RAISES[keys[i]].test()) r = r.times(CAP_RAISES[keys[i]].mult)
    }
    return r
}
function countCapRaises() {
    var n = 0
    for (var i = 0; i < ALL_RAISE_KEYS.length; i++) {
        if (CAP_RAISES[ALL_RAISE_KEYS[i]].test()) n++
    }
    return n
}
// meta-compression: the more raises you own, the less each additional one is worth.
// nc (Recursion) exists to ease exactly this.
function metaCompExp() {
    var n = countCapRaises()
    var ease = 1
    if (hasUpgrade("nc", 11)) ease *= 1.6
    if (hasUpgrade("nc", 12)) ease *= 1.6
    if (hasUpgrade("nc", 13)) ease *= 2
    if (hasMilestone("nc", 1)) ease *= 1.5
    return 1 / (1 + TUNING.nc.compPerRaise * n / ease)
}

// ---------- rate-suppression power (the easing axis) ----------
function forceSupExp() {
    var e = 1
    if (hasUpgrade("tw", 13)) e -= 0.02
    if (hasUpgrade("st", 24)) e -= 0.03
    if (hasUpgrade("ov", 13)) e -= 0.01
    if (hasMilestone("ov", 7)) e -= 0.01
    return Math.max(0.5, e)
}

// ---------- hardening (time-above-cap raises the caps; nc raises the meta-cap) ----------
function hardCap() {
    var c = new Decimal(TUNING.in.hardCap)
    if (hasUpgrade("nc", 14)) c = c.times(10)
    if (hasUpgrade("in", 15)) c = c.times(10)
    if (hasMilestone("ov", 2)) c = c.times(10)
    return c
}
function hardeningRate() {
    var r = new Decimal(TUNING.in.hardRate)
    if (hasUpgrade("in", 12)) r = r.times(2)
    if (hasMilestone("in", 0)) r = r.times(2)
    if (hasUpgrade("in", 22)) r = r.times(3)
    if (hasMilestone("pl", 3)) r = r.times(2)
    if (hasUpgrade("tw", 25)) r = r.times(2)
    if (hasUpgrade("ov", 14)) r = r.times(3)
    if (hasMilestone("ov", 6)) r = r.times(5)
    return r
}
// compression fraction of a softcapped currency: 0 below the cap, →1 far past it
function hardenFrac(value, start) {
    if (value.lt(start)) return new Decimal(0)
    return new Decimal(1).sub(start.div(value).pow(0.9)).max(0)
}
function hardeningGain(idx, frac) {
    var active = true
    if (idx === 1) active = hasUpgrade("in", 13)
    if (idx === 2 || idx === 3) active = hasUpgrade("in", 14)
    if (!active) return new Decimal(0)
    var r = hardeningRate()
    if (hasMilestone("mf", 0)) r = r.pow(mfTune(7))
    return frac.times(r).min(hardCap().sub(player.in.harden[idx]).max(0))
}

// ---------- THE CAP WEB (every cap reads other layers — this is the game) ----------
// T_st: the Force wall. Fed by th currency, stress-shop raises, global raises,
//       the gr coupling well (strain overflow feeds back) and hardening.
function strainCap() {
    var base = new Decimal(TUNING.st.t0)
        .times(player.th.points.add(1).pow(TUNING.st.thExp))
        .times(player.in.harden[0].add(1))
    if (hasUpgrade("gr", 12)) {
        var wellExp = TUNING.st.wellExp + (hasUpgrade("gr", 13) ? 0.04 : 0)
        base = base.times(player.st.points.div(thSoftcapStart()).max(1).add(1).pow(wellExp))
    }
    var raises = raiseProduct(["st13", "st14", "st23", "thU12"].concat(GLOBAL_RAISE_KEYS))
    return base.times(raises.pow(metaCompExp())).times(buyableEffect("st", 12))
}
// th reset-gain softcap start
function thSoftcapStart() {
    var raises = raiseProduct(["thU15", "grU25"].concat(GLOBAL_RAISE_KEYS))
    return new Decimal(TUNING.row1.softcapStart)
        .times(raises.pow(metaCompExp()))
        .times(player.in.harden[1].add(1))
}
// twin pillars: each one's cap start is fed by the OTHER's currency (mutual caps)
function plCapStart() {
    var base = new Decimal(TUNING.row1.pillarBase)
        .times(player.pt.points.add(1).pow(TUNING.row1.pillarExp))
    var raises = raiseProduct(["plU12", "plU22", "thU21", "ptU13", "grU21", "inM1a"].concat(GLOBAL_RAISE_KEYS))
    return base.times(raises.pow(metaCompExp())).times(player.in.harden[2].add(1))
}
function ptCapStart() {
    var base = new Decimal(TUNING.row1.pillarBase)
        .times(player.pl.points.add(1).pow(TUNING.row1.pillarExp))
    var raises = raiseProduct(["ptU12", "ptU22", "thU22", "plU13", "grU22", "inM1b"].concat(GLOBAL_RAISE_KEYS))
    return base.times(raises.pow(metaCompExp())).times(player.in.harden[3].add(1))
}
// row-2 reset-gain softcap start (gr/in)
function row2CapStart() {
    var raises = raiseProduct(GLOBAL_RAISE_KEYS)
    return new Decimal(TUNING.row2.softcapStart)
        .times(raises.pow(metaCompExp()))
}

// ---------- Force production (the heart — suppression converts to stress) ----------
function forceIdealRate() {
    var r = new Decimal(1)
    if (hasUpgrade("st", 11)) r = r.times(2)
    if (hasUpgrade("st", 12)) r = r.times(upgradeEffect("st", 12))
    if (hasUpgrade("st", 21)) r = r.times(3)
    if (hasUpgrade("st", 22)) r = r.times(upgradeEffect("st", 22))
    if (hasMilestone("st", 0)) r = r.times(3)
    if (hasMilestone("st", 2)) r = r.times(5)
    if (hasUpgrade("th", 14)) r = r.times(upgradeEffect("th", 14))
    if (hasMilestone("th", 3)) r = r.times(3)
    if (hasUpgrade("pl", 14)) r = r.times(1.5)
    if (hasUpgrade("pt", 14)) r = r.times(1.5)
    if (hasMilestone("pl", 1)) r = r.times(2)
    if (hasUpgrade("pl", 25)) r = r.times(2)
    if (hasMilestone("pt", 1)) r = r.times(2)
    if (hasUpgrade("tw", 23)) r = r.times(3)
    if (hasUpgrade("tw", 21)) r = r.times(upgradeEffect("tw", 21))
    if (hasUpgrade("gr", 22)) r = r.times(5)
    if (hasUpgrade("in", 21)) r = r.times(upgradeEffect("in", 21))
    if (hasMilestone("in", 2)) r = r.times(5)
    if (hasUpgrade("ov", 21)) r = r.times(10)
    if (hasMilestone("mf", 1)) r = r.times(10)
    if (hasAchievement("ac", 11)) r = r.times(1.5)
    if (hasAchievement("ac", 21)) r = r.times(2)
    if (hasAchievement("ac", 29)) r = r.times(5)
    if (hasAchievement("ac", 31)) r = r.times(3)
    if (hasAchievement("ac", 41)) r = r.times(5)
    // manifold tuning on Force itself is applied in mod.js getPointGen (exponent axis)
    // R7 measured retune: the stock-reading terms make the IDEAL rate unbounded —
    // compress past 1e12/s so the stress faucet cannot outrun every price in the game
    var idealCap = new Decimal(TUNING.st.idealCap)
    if (r.gt(idealCap)) r = idealCap.times(r.div(idealCap).pow(0.5))
    return r
}
// stress production multiplier (wired boosts from upgrades/milestones/achievements)
function stressEffMult() { return new Decimal(TUNING.st.stressEff) }

function stressBoost() {
    var b = new Decimal(1)
    if (hasUpgrade("st", 15)) b = b.times(2)
    if (hasUpgrade("st", 17)) b = b.times(2)
    if (hasMilestone("st", 1)) b = b.times(2)
    if (hasMilestone("st", 3)) b = b.times(3)
    if (hasMilestone("st", 4)) b = b.times(5)
    if (hasMilestone("pt", 2)) b = b.times(2)
    if (hasUpgrade("pt", 25)) b = b.times(2)
    if (hasUpgrade("tw", 15)) b = b.times(3)
    if (hasUpgrade("gr", 24)) b = b.times(3)
    if (hasUpgrade("in", 24)) b = b.times(3)
    if (hasUpgrade("nc", 22)) b = b.times(3)
    if (hasUpgrade("ov", 15)) b = b.times(5)
    if (hasMilestone("tw", 3)) b = b.times(3)
    if (hasMilestone("ov", 4)) b = b.times(10)
    if (hasAchievement("ac", 12)) b = b.times(2)
    return b
}

// effective Force rate: ideal × pace ÷ (1+F/T)^supExp  — never zero, only slower
function forceEffRate() {
    var ideal = forceIdealRate().times(paceMult())
    var T = strainCap()
    var F = player.points.max(0)
    return ideal.div(F.add(T).div(T).pow(forceSupExp()))
}
// the suppressed fraction — stress pours from exactly this (eff + stress = ideal)
function stressRate() {
    var ideal = forceIdealRate().times(paceMult())
    var T = strainCap()
    var F = player.points.max(0)
    var eff = ideal.div(F.add(T).div(T).pow(forceSupExp()))
    return ideal.sub(eff).max(0)
}
// wall fill fraction (0..1): how suppressed the Force wall currently is
function wallSupFrac() {
    var T = strainCap()
    var F = player.points.max(0)
    var e = forceSupExp()
    var full = F.add(T).div(T).pow(e)
    return new Decimal(1).sub(new Decimal(1).div(full)).max(0)
}
function stressSoftcapVal() { return new Decimal(TUNING.st.stressSoftcap) }

// ---------- tw breakthrough bar ----------
function barFillTime(bt) {
    var t = new Decimal(TUNING.tw.fillBase).times(Decimal.pow(TUNING.tw.fillGrowth, bt))
    return t.min(TUNING.tw.fillCapS)
}
function barFillRate() {
    // progress in "seconds of wall pushed": suppressed fraction × pace
    return wallSupFrac().times(paceMult())
}

// ---------- tuning manifold helpers (M20/P24 — one shared pool) ----------
function mfPoolMax() {
    var p = new Decimal(TUNING.mf.poolBase)
    if (hasUpgrade("mf", 11)) p = p.add(30)
    if (hasUpgrade("mf", 14)) p = p.add(30)
    if (hasMilestone("ov", 5)) p = p.add(30)
    if (hasMilestone("ov", 9)) p = p.add(1e5)
    return p
}
function mfPoolUsed() {
    var s = new Decimal(0)
    for (var i = 0; i < 9; i++) s = s.add(getBuyableAmount("mf", 11 + i))
    return s
}
// exponent factor for resource slot i (R6, measured retune: level 10 = ^1.0 neutral,
// 30 => ^1.4, 5 => ^0.9 — the raw lvl/10 band exploded the composite to 1e67 in 0.34 h);
// gated by mf m0
function mfTune(i) {
    if (!hasMilestone("mf", 0)) return 1
    var lvl = getBuyableAmount("mf", 11 + i).toNumber()
    var step = hasUpgrade("mf", 12) ? 1 / 45 : 1 / 50
    return Math.max(0.5, 1 + (lvl - 10) * step)
}
function mfSlotDisplay(idx, enName, zhName) {
    var lvl = getBuyableAmount("mf", 11 + idx).toNumber()
    var step = hasUpgrade("mf", 12) ? 1 / 45 : 1 / 50
    var f = Math.max(0.5, 1 + (lvl - 10) * step)
    return L(enName, zhName) + ": " + L("level", "等级") + " " + formatWhole(lvl) +
        " — " + L("gain ^", "获取 ^") + f.toFixed(2)
}

// ---------- mf/ov gain values (single source — never call the engine's global
// getResetGain from inside a custom layer's own methods: it re-enters the layer) ----------
function mfResetGainVal() {
    // R7 fix (was: +player.st.points — a raw STOCK mixed into a ratio composite made
    // mf.best rocket 25→188 in one press; the composite measures overflow only)
    var comp = totalOverflow().max(1)
    var g = comp.log10().pow(TUNING.mf.gainLogPow)
    if (hasMilestone("mf", 3)) g = g.times(5)
    if (hasUpgrade("mf", 13)) g = g.times(5)
    if (hasUpgrade("mf", 21)) g = g.times(10)
    if (hasAchievement("ac", 31)) g = g.times(2)
    // mf u15: gain ^1.1, softcapped past 1e10 (same K3 shape as st u16)
    if (hasUpgrade("mf", 15)) {
        g = g.pow(1.1)
        if (g.gte(1e10)) g = g.div(1e10).pow(0.5).times(1e10)
    }
    return g.max(0).floor()
}
function mfNextAtVal() {
    // threshold for the NEXT INTEGER gain (canReset gates on comp ≥ 10 — the log-1 floor)
    var target = mfResetGainVal().floor().add(1)
    return Decimal.pow(10, target.pow(1 / TUNING.mf.gainLogPow))
}
function ovGainVal() {
    var comp = totalOverflow().max(1)
    var g = comp.log10().pow(TUNING.ov.logPow)
    if (hasUpgrade("ov", 11)) g = g.times(2)
    if (hasMilestone("ov", 10)) g = g.times(3)
    if (hasUpgrade("ov", 24)) g = g.times(3)
    if (hasMilestone("ov", 0)) g = g.times(2)
    return g.max(0).floor()
}
function ovNextAtVal() {
    var target = ovGainVal().floor().add(1)
    return Decimal.pow(10, target.pow(1 / TUNING.ov.logPow))
}

// ---------- total overflow (the ov/mf composite — push EVERY wall at once) ----------
function totalOverflow() {
    var o = new Decimal(0)
    o = o.add(player.points.max(0).div(strainCap()))
    o = o.add(player.st.points.max(0).div(thSoftcapStart()))
    o = o.add(player.pl.points.max(0).div(plCapStart()))
    o = o.add(player.pt.points.max(0).div(ptCapStart()))
    o = o.add(player.gr.points.max(0).div(row2CapStart()))
    o = o.add(player.in.points.max(0).div(row2CapStart()))
    return o
}
