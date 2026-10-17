/* =============================================================================
 * simulate.js — 2027重阳节树 headless greedy playthrough (stage 6, TMT-Skill).
 *
 * FAITHFUL PORT, not the generic template. It mirrors the real engine for this
 * multi-currency tree:
 *   · tmp cache        — ports temp.js setupTempData/updateTempData so every
 *                        layer-level function (baseAmount, gainMult, softcap,
 *                        marketCostMult, brewSpeed, trialMult, ...) is recomputed
 *                        each tick with this-binding exactly as the engine does.
 *   · prestige formula — ports game.js getResetGain/getNextAt/canReset for
 *                        normal / static / custom (s, f are bespoke).
 *   · unlock rule      — the engine's layerunlocked(): player[X].unlocked OR
 *                        (canReset && layerShown). Our layerShown is `true`, so a
 *                        layer is usable the moment its base currency ≥ requires.
 *   · reset cascade    — ports doReset: a row-r prestige sweeps rows ≤ r (keep
 *                        lists honored), and is skipped entirely when the
 *                        resetting layer resetsNothing().
 *   · cost pools       — upgrades/buyables pay from currencyLayer (m's buyables
 *                        in 菊珠=x.jade, y.31/45 in 九山礼=f.points), else the
 *                        layer's own banked points.
 *
 * POLICY (the modeled "decent player", still a lower bound):
 *   · production  — idle getPointGen() PLUS the root M3 clickable 攀一步 at --cps/s
 *                   (this tree is active-clicker-first; idle-only understates it ~10×).
 *   · purchases   — buy everything affordable (greedy; the hold rule below prevents
 *                   the re-stake re-buy equilibrium from eating the era currency).
 *   · prestige    — a NORMAL layer re-stakes only when its base resource has grown
 *                   ≥--hold× (default 1.5×) since its last stake (the player stakes
 *                   bigger, not the instant gain≥1 — that breaks the wiped-upgrade
 *                   re-buy floor), capped by the 1 s --click press rate. Static /
 *                   custom layers press whenever canReset && gain≥1.
 *   · excluded    — M2 challenge rewards + rule-injection, achievement effects, the
 *                   x 菊展 minigame, offline time, human dithering. So the TOTAL is a
 *                   FLOOR: a real run is slower. (For log layers s/f the 1.5× hold
 *                   over-holds their base, so the sim's deep-era times are a PESSIMISTIC
 *                   floor, not a clean one — trust the early/mid timeline, not the total.)
 *
 * USAGE:  node tools/simulate.js . [--max-hours 400] [--cps 5] [--hold 1.5] [--click 1]
 *         [--dt 0.1] [--budget 120000] [--trace] [--json]
 * Tunable constants live in js/tuning.js (W.TUNING), which BOTH the game and this
 * script read — never hand-edit a number the game does not use.
 * ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const maxHoursIdx = argv.indexOf("--max-hours");
const MAXH = maxHoursIdx >= 0 ? Number(argv[maxHoursIdx + 1]) : 400;
/* --click <s>: a layer's prestige button may be pressed at most once per this many
 * seconds. The policy is "hold-to-HOLD×-the-last-stake, bank ≥50% of the era currency"
 * (a sane player re-stakes bigger rather than re-prestige at the floor, and always keeps
 * half the currency streaming toward the next row). The 1 s press cap is the documented
 * lower-bound player. */
const clickIdx = argv.indexOf("--click");
const CLICK = clickIdx >= 0 ? Number(argv[clickIdx + 1]) : 1;
/* --cps <n>: the active player's click rate on the root clickable (攀一步), in clicks/second.
 * This tree is active-clicker-first: the root M3 is the primary early engine. A real player
 * clicks far faster than the idle getPointGen trickle, so omitting it (the template default)
 * understates the game by an order of magnitude. 5/s is a relaxed "casual active" hand. */
const cpsIdx = argv.indexOf("--cps");
const CPS = cpsIdx >= 0 ? Number(argv[cpsIdx + 1]) : 5;
if (argv.includes("--trace")) global.__TRACE_EVERY = 120;  // every 2 sim-minutes
/* every index that holds a flag's VALUE (the token right after a --flag) is not a path */
const FLAG_VALUES = new Set();
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith("--")) FLAG_VALUES.add(i + 1);
const game = path.resolve(
    argv.filter((a, i) => !a.startsWith("--") && !FLAG_VALUES.has(i))[0] || path.join(__dirname, "..")
);
if (!fs.existsSync(path.join(game, "js", "mod.js"))) {
    console.error("no js/mod.js under " + game + " — pass the game folder as the first argument");
    process.exit(2);
}
const Decimal = require(path.join(game, "js", "technical", "break_eternity.js"));
if (typeof Decimal !== "function") { console.error("break_eternity.js did not export a Decimal constructor"); process.exit(2); }
const LOG = (...a) => { if (!asJson) console.log(...a); };

// ---------------------------------------------------------------------------
// engine globals / stubs
// ---------------------------------------------------------------------------
global.window = global;
global.Decimal = Decimal;
const decimalZero = new Decimal(0), decimalOne = new Decimal(1);
global.decimalZero = decimalZero; global.decimalOne = decimalOne;
global.format = (x) => (x && typeof x.toString === "function" ? x.toString() : String(x));
global.formatWhole = global.format;
global.formatTime = (s) => String(s);
global.formatSmall = global.format;
global.TREE_LAYERS = [];
global.UP = 0; global.DOWN = 1; global.LEFT = 2; global.RIGHT = 3;
global.addNode = () => {};
global.isFunction = (f) => typeof f === "function";
global.isPlainObject = (o) => !!o && o.constructor === Object;
global.readData = (d, a) => ((d && d.call && d.apply) ? d(a) : d);
global.softcap = (v, cap, p) => (v.gt(cap) ? v.pow(p).times(cap.pow(new Decimal(1).sub(p))) : v);
global.softcapHTML = (x) => x;
global.run = (fn, target, args) => {
    if (typeof fn !== "function") return fn;
    return target === undefined ? fn(args) : fn.bind(target)(args);
};
global.canBuy = () => false;
global.canAfford = () => false;
global.respecBuyables = () => {};
global.buyUpgrade = () => {};
global.buyBuyable = () => {};
global.hasAchievement = () => false;                 // EXCLUDED (lower bound)
global.inChallenge = () => false;                    // EXCLUDED (M2 rule-injection off)
global.hasChallenge = () => false;
global.maxedChallenge = () => false;
global.challengeCompletions = () => decimalZero;
global.challengeEffect = () => decimalOne;            // M2 peaks excluded
global.completeChallenge = () => {};
global.canGenPoints = global.canGenPoints || (() => true);
global.getPointGen = () => decimalOne;               // overwritten by mod.js load

const LAYERS = {};
const layerOrder = [];
global.addLayer = function (id, def) { LAYERS[id] = def; def.isLayer = true; layerOrder.push(id); };
global.layers = LAYERS;

// the per-layer player ledger is built after the mod files load (below); the
// engine-facing helpers read it via global.player.
global.getBuyableAmount = (l, id) => (player[l].buyables[id] || decimalZero);
global.setBuyableAmount = (l, id, v) => { player[l].buyables[id] = v; };
global.upgradeEffect = function (l, id) {
    const u = LAYERS[l].upgrades[id]; u.layer = l; u.id = Number(id);
    return typeof u.effect === "function" ? u.effect.call(u) : new Decimal(1);
};
global.buyableEffect = function (l, id) {
    const b = LAYERS[l].buyables[id]; b.layer = l; b.id = Number(id);
    const amt = player[l].buyables[id] || decimalZero;
    return typeof b.effect === "function" ? b.effect.call(b, amt) : new Decimal(1);
};
global.hasUpgrade = (l, id) => !!(player[l] && player[l].upgrades.includes(Number(id)));
global.hasMilestone = (l, id) => !!(player[l] && player[l].milestones.includes(Number(id)));
global.addPoints = (l, amt) => {
    player[l].points = player[l].points.add(amt).max(0);
    if (player[l].best !== undefined) player[l].best = player[l].best.max(player[l].points);
    if (player[l].total !== undefined) player[l].total = player[l].total.add(amt);
};
global.addPointsNoReturn = global.addPoints;
global.addResource = (l, name, amt) => { player[l][name] = (player[l][name] || decimalZero).add(amt); };
global.layerDataReset = function (l, keep) {
    keep = keep || [];
    const sd = LAYERS[l].startData ? LAYERS[l].startData() : {};
    const saved = { unlocked: player[l].unlocked };
    // Engine semantics: ONLY the explicit keep list survives. `points` is kept
    // when the layer's own doReset asks for it, never automatically.
    keep.forEach((k) => { saved[k] = player[l][k]; });
    player[l].points = sd.points || decimalZero;
    player[l].upgrades = [];
    player[l].buyables = {};
    for (const id of Object.keys(LAYERS[l].buyables || {}))
        if (LAYERS[l].buyables[id] && typeof LAYERS[l].buyables[id] === "object")
            player[l].buyables[id] = decimalZero;
    player[l].milestones = [];
    Object.keys(saved).forEach((k) => { player[l][k] = saved[k]; });
};

// ---------------------------------------------------------------------------
// load the mod files, in index.html order (mod.js first, then its modFiles)
// ---------------------------------------------------------------------------
const ENGINE = /^js\/(technical|utils)\/|^js\/(game|components|utils)\.js$|^js\/Demo\//;
const html = fs.readFileSync(path.join(game, "index.html"), "utf8");
const htmlScripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map((m) => m[1])
    .filter((s) => !/^https?:|^\/\//.test(s)).map((s) => s.replace(/^\.?\//, ""))
    .filter((s) => s.startsWith("js/") && !ENGINE.test(s));
const modSrc = fs.readFileSync(path.join(game, "js", "mod.js"), "utf8");
const mf = modSrc.match(/modFiles\s*:\s*\[([\s\S]*?)\]/);
const modFiles = mf ? [...mf[1].matchAll(/["']([^"']+)["']/g)].map((m) => "js/" + m[1]) : [];
const files = [];
const pushFile = (f) => { if (f && !files.includes(f) && !ENGINE.test(f) && !/tree\.js$/.test(f)) files.push(f); };
htmlScripts.filter((f) => /\/lang\//.test(f)).forEach(pushFile);
pushFile("js/mod.js"); modFiles.forEach(pushFile); htmlScripts.forEach(pushFile);
for (const f of files) {
    const p = path.join(game, f);
    if (!fs.existsSync(p)) continue;
    const code = fs.readFileSync(p, "utf8").replace(/\b(?:const|let)\s+(?=[A-Za-z_$])/g, "var ");
    try { (0, eval)(code); } catch (e) { console.error(f + " threw at load: " + e.message); process.exit(2); }
}
if (typeof global.getPointGen !== "function" || global.getPointGen === undefined || Object.keys(LAYERS).length === 0)
    console.error("mod files did not register layers — check mod.js/modFiles");

const ENDGAME = typeof global.isEndgame === "function" ? global.isEndgame : () => false;
const STARTPOINTS = (typeof global.getStartPoints === "function") ? global.getStartPoints() : decimalZero;

// ---------------------------------------------------------------------------
// tag layers & components with .layer / .id (engine setupLayer) so hooks'
// `this.layer` / `this.id` work under the simulation
// ---------------------------------------------------------------------------
for (const id of layerOrder) {
    const L = LAYERS[id];
    L.layer = id;
    for (const grp of ["upgrades", "milestones", "challenges", "buyables", "clickables", "achievements", "bars", "infoboxes"]) {
        if (!isPlainObject(L[grp])) continue;
        L[grp].layer = id;
        for (const cid in L[grp]) { if (isPlainObject(L[grp][cid])) { L[grp][cid].layer = id; L[grp][cid].id = Number(cid); } }
    }
}

// ---------------------------------------------------------------------------
// player ledger
// ---------------------------------------------------------------------------
let player = {};
for (const id of layerOrder) {
    let sd = {};
    try { sd = LAYERS[id].startData ? LAYERS[id].startData() : {}; } catch (_) { sd = {}; }
    player[id] = Object.assign({}, sd, { upgrades: [], milestones: [], challenges: [], buyables: {} });
    if (typeof player[id].unlocked !== "boolean") player[id].unlocked = false;
    if (!player[id].points || typeof player[id].points.add !== "function") player[id].points = decimalZero;
}
player.points = (STARTPOINTS instanceof Decimal) ? STARTPOINTS : new Decimal(10);
if (typeof global.addedPlayerData === "function") Object.assign(player, global.addedPlayerData() || {});
global.player = player;

// ---------------------------------------------------------------------------
// tmp cache — port of temp.js setupTempData/updateTempData, layer-level only
// (component cost/effect are read raw from LAYERS in the purchase step)
// ---------------------------------------------------------------------------
const activeFunctions = [
    "startData", "onPrestige", "doReset", "update", "automate",
    "buy", "buyMax", "respec", "onPress", "onClick", "onHold", "masterButtonPress",
    "sellOne", "sellAll", "pay", "actualCostFunction", "actualEffectFunction",
    "effectDescription", "display", "fullDisplay", "effectDisplay", "rewardDisplay",
    "tabFormat", "content",
    "onComplete", "onPurchase", "onEnter", "onExit", "done",
    "getUnlocked", "getStyle", "getCanClick", "getTitle", "getDisplay"
];
const tmp = {};
global.tmp = tmp;

// setupTempSim — port of temp.js setupTempData: seed tmp so that any cross-layer
// read (e.g. p.clickGain -> tmp.d.charmGuard) sees a FINITE default on the first
// pass, exactly as the engine does (function props start at decimalOne, not undefined).
function setupTempSim() {
    for (const id of layerOrder) {
        const L = LAYERS[id], t = tmp[id] = {};
        for (const prop in L) {
            if (typeof L[prop] === "function") {
                if (activeFunctions.includes(prop)) continue;
                t[prop] = (prop === "unlocked" || prop === "deactivated") ? false : decimalOne;
            } else {
                t[prop] = L[prop];
            }
        }
    }
}
function cacheLayerProps(id) {
    const L = LAYERS[id], t = tmp[id];
    for (const prop in L) {
        if (typeof L[prop] === "function") {
            if (activeFunctions.includes(prop)) continue;
            try { t[prop] = L[prop].call(L); } catch (_) { /* keep prior value */ }
        } else {
            t[prop] = L[prop];
        }
    }
    // engine defaults (layerSupport.setupLayer)
    t.gainMult = (t.gainMult instanceof Decimal) ? t.gainMult : (typeof L.gainMult === "function" ? L.gainMult.call(L) : new Decimal(L.gainMult || 1));
    t.gainExp = (L.gainExp === undefined) ? decimalOne : (typeof L.gainExp === "function" ? L.gainExp.call(L) : new Decimal(L.gainExp));
    t.directMult = new Decimal(L.directMult === undefined ? 1 : L.directMult);
    t.softcap = (L.softcap === undefined) ? new Decimal("e1e7") : (typeof L.softcap === "function" ? L.softcap.call(L) : new Decimal(L.softcap));
    t.softcapPower = (L.softcapPower === undefined) ? new Decimal("0.5") : (typeof L.softcapPower === "function" ? L.softcapPower.call(L) : new Decimal(L.softcapPower));
    t.exponent = new Decimal(L.exponent === undefined ? 1 : L.exponent);
    t.base = L.base === undefined ? 2 : L.base;
    t.requires = (typeof L.requires === "function") ? L.requires.call(L) : new Decimal(L.requires === undefined ? 1 : L.requires);
    t.canBuyMax = (typeof L.canBuyMax === "function") ? L.canBuyMax.call(L) : false;
}

// ---- engine-formula ports (mirror game.js getResetGain / getNextAt / canReset)
const reqOf = (l) => tmp[l].requires;
function getResetGainSim(layer) {
    const L = LAYERS[layer], t = tmp[layer];
    if (typeof L.getResetGain === "function") return L.getResetGain.call(L);   // custom (s, f)
    if (t.type === "none") return decimalZero;
    if (t.gainExp.eq(0)) return decimalZero;
    if (t.type === "static") {
        if (!t.canBuyMax || t.baseAmount.lt(t.requires)) return decimalOne;
        let g = t.baseAmount.div(t.requires).div(t.gainMult).max(1).log(t.base).times(t.gainExp).pow(Decimal.pow(t.exponent, -1));
        g = g.times(t.directMult);
        return g.floor().sub(player[layer].points).add(1).max(1);
    }
    if (t.type === "normal") {
        if (t.baseAmount.lt(t.requires)) return decimalZero;
        let g = t.baseAmount.div(t.requires).pow(t.exponent).times(t.gainMult).pow(t.gainExp);
        if (g.gte(t.softcap)) g = g.pow(t.softcapPower).times(t.softcap.pow(decimalOne.sub(t.softcapPower)));
        g = g.times(t.directMult);
        return g.floor().max(0);
    }
    return decimalZero;
}
function getNextAtSim(layer, canMax) {
    const L = LAYERS[layer], t = tmp[layer];
    if (typeof L.getNextAt === "function") return L.getNextAt.call(L, canMax);   // custom (s, f)
    if (t.type === "none") return new Decimal(Infinity);
    if (t.gainMult.lte(0) || t.gainExp.lte(0)) return new Decimal(Infinity);
    if (t.type === "static") {
        if (!t.canBuyMax) canMax = false;
        const amt = player[layer].points.add((canMax && t.baseAmount.gte(t.nextAt)) ? t.resetGain : 0).div(t.directMult);
        let cost = Decimal.pow(t.base, amt.pow(t.exponent).div(t.gainExp)).times(t.gainMult).times(t.requires).max(t.requires);
        if (t.roundUpCost) cost = cost.ceil();
        return cost;
    }
    if (t.type === "normal") {
        let next = t.resetGain.add(1).div(t.directMult);
        if (next.gte(t.softcap)) next = next.div(t.softcap.pow(decimalOne.sub(t.softcapPower))).pow(decimalOne.div(t.softcapPower));
        next = next.root(t.gainExp).div(t.gainMult).root(t.exponent).times(t.requires).max(t.requires);
        if (t.roundUpCost) next = next.ceil();
        return next;
    }
    return decimalZero;
}
function canResetSim(layer) {
    const L = LAYERS[layer], t = tmp[layer];
    if (L.canReset !== undefined) {
        return (typeof L.canReset === "function") ? L.canReset.call(L) : !!L.canReset;
    }
    if (t.type === "normal") return t.baseAmount.gte(t.requires);
    if (t.type === "static") return t.baseAmount.gte(t.nextAt);
    return false;
}
function layerUnlockedSim(layer) {
    const t = tmp[layer];
    if (t.type === "none") return !!player[layer].unlocked;
    return !!player[layer].unlocked || (t.canReset && t.layerShown);
}
function updateTempSim() {
    if (!updateTempSim._seupDone) { setupTempSim(); updateTempSim._seupDone = true; }
    for (const id of layerOrder) {
        cacheLayerProps(id);
        const t = tmp[id];
        t.baseAmount = (typeof LAYERS[id].baseAmount === "function") ? LAYERS[id].baseAmount.call(LAYERS[id]) : decimalZero;
        t.resetGain = getResetGainSim(id);
        t.nextAt = getNextAtSim(id, false);
        t.nextAtDisp = getNextAtSim(id, true);
        t.canReset = canResetSim(id);
    }
    try { tmp.pointGen = global.getPointGen(); } catch (_) { tmp.pointGen = decimalZero; }
}

// ---------------------------------------------------------------------------
// reset cascade — port of doReset (row sweep + resetsNothing guard)
// ---------------------------------------------------------------------------
function resetsNothingSim(l) {
    const L = LAYERS[l];
    if (L.resetsNothing === undefined) return false;
    return !!L.resetsNothing.call(L);
}
function layersOnRow(row) {
    const out = [];
    for (const id of layerOrder) if (LAYERS[id].row === row) out.push(id);
    return out;
}
const rowMax = Math.max(...layerOrder.map((id) => (typeof LAYERS[id].row === "number" ? LAYERS[id].row : -1)));
function rowResetSim(row, layer) {
    for (const lr of layersOnRow(row)) {
        const L = LAYERS[lr];
        if (typeof L.doReset === "function") { try { L.doReset.call(L, layer); } catch (_) { global.layerDataReset(lr); } }
        else global.layerDataReset(lr);
    }
}
function doPrestigeSim(l) {
    const L = LAYERS[l], t = tmp[l];
    if (t.type === "none" || t.type === undefined) return false;
    if (t.canReset === false) return false;
    if (t.type === "normal" && t.baseAmount.lt(t.requires)) return false;
    let gain = t.resetGain;
    if (t.type === "static") {
        if (t.baseAmount.lt(t.nextAt)) return false;
        gain = (t.canBuyMax ? gain : decimalOne);
    }
    if (gain.lt(1)) return false;
    global.addPoints(l, gain);
    updateMilestonesSim();
    if (!player[l].unlocked) player[l].unlocked = true;
    if (resetsNothingSim(l)) return true;          // lower rows stay intact
    const row = L.row;
    player.points = (row === 0) ? decimalZero : (STARTPOINTS instanceof Decimal ? STARTPOINTS : new Decimal(10));
    for (let x = row; x >= 0; x--) rowResetSim(x, l);
    return true;
}

// ---------------------------------------------------------------------------
// purchases — pool-aware (currencyLayer / currencyInternalName honored)
// ---------------------------------------------------------------------------
function poolFor(l, obj) {
    if (obj.currencyLayer) return player[obj.currencyLayer][obj.currencyInternalName || "points"];
    return player[l].points;
}
function payFrom(l, obj, cost) {
    if (obj.currencyLayer) {
        const nm = obj.currencyInternalName || "points";
        player[obj.currencyLayer][nm] = player[obj.currencyLayer][nm].sub(cost);
    } else {
        player[l].points = player[l].points.sub(cost);
    }
}
function tryBuyUpgrades(l) {
    let bought = 0;
    const ups = LAYERS[l].upgrades || {};
    for (const id of Object.keys(ups)) {
        const u = ups[id];
        if (!u || typeof u !== "object") continue;
        if (player[l].upgrades.includes(Number(id))) continue;
        if (typeof u.unlocked === "function" && !u.unlocked.call(u)) continue;
        if (typeof u.cost === "undefined") continue;                        // free ritual upgrade
        const cost = (u.cost instanceof Decimal) ? u.cost : new Decimal(u.cost);
        if (poolFor(l, u).lt(cost)) continue;
        payFrom(l, u, cost);
        player[l].upgrades.push(Number(id));
        player[l].upgrades.sort((a, b) => a - b);
        if (typeof u.onPurchase === "function") { try { u.onPurchase.call(u, cost); } catch (_) {} }
        bought++;
    }
    return bought;
}
function tryBuyBuyables(l) {
    let bought = 0;
    const bs = LAYERS[l].buyables || {};
    for (const id of Object.keys(bs)) {
        const b = bs[id];
        if (!b || typeof b !== "object") continue;
        if (typeof b.unlocked === "function" && !b.unlocked.call(b)) continue;
        if (b.purchaseLimit !== undefined && getBuyableAmount(l, id).gte(b.purchaseLimit)) continue;
        const have = getBuyableAmount(l, id);
        let cost;
        try { cost = b.cost ? b.cost.call(b, have) : decimalOne; } catch (_) { continue; }
        if (!cost || !(cost instanceof Decimal)) cost = new Decimal(cost || 1);
        if (cost.lte(0)) continue;
        if (poolFor(l, b).lt(cost)) continue;
        payFrom(l, b, cost);
        global.setBuyableAmount(l, id, have.add(1));
        bought++;
    }
    return bought;
}

// ---------------------------------------------------------------------------
// milestones
// ---------------------------------------------------------------------------
function updateMilestonesSim() {
    let n = 0;
    for (const id of layerOrder) {
        for (const mid of Object.keys(LAYERS[id].milestones || {})) {
            if (player[id].milestones.includes(Number(mid))) continue;
            const m = LAYERS[id].milestones[mid];
            if (typeof m.done === "function") {
                let ok = false;
                try { ok = !!m.done.call(m); } catch (_) { ok = false; }
                if (!ok) continue;
            } else if (typeof m.done === "undefined") continue;
            player[id].milestones.push(Number(mid));
            player[id].milestones.sort((a, b) => a - b);
            if (LAYERS[id].unlocked) player[id].unlocked = true;
            if (typeof m.onComplete === "function") { try { m.onComplete.call(m); } catch (_) {} }
            n++;
        }
    }
    return n;
}

// ---------------------------------------------------------------------------
// the run
// ---------------------------------------------------------------------------
const dtIdx = argv.indexOf("--dt");
const DT = dtIdx >= 0 ? Number(argv[dtIdx + 1]) : 0.1;
const STEP = DT;
const budgetIdx = argv.indexOf("--budget");
const BUDGET = budgetIdx >= 0 ? Number(argv[budgetIdx + 1]) : 120000;
updateTempSim();
const events = { firstPurchase: null, firstUnlock: {}, firstPrestige: {} };
let t = 0, peakIncome = decimalZero, peakAt = 0, lastPointGen = decimalZero;
const lastBase = {};       // baseAmount at each layer's last prestige
const lastPress = {};      // sim-time of each layer's last prestige press (CLICK rate cap)
const holdIdx = argv.indexOf("--hold");
const HOLD = (holdIdx >= 0) ? new Decimal(argv[holdIdx + 1]) : new Decimal(1.5);  // re-stake factor
const BANK = new Decimal("0.5");      // (kept for clarity; purchase is greedy)
const seen = (id, set) => !set[id];
const tick = () => {
    // 1. main-currency production: idle getPointGen + the active root clickable (攀一步)
    let gen = decimalZero;
    try { gen = global.getPointGen(); } catch (_) { gen = decimalZero; }
    if (gen instanceof Decimal && gen.gt(0)) {
        player.points = player.points.add(gen.times(DT));
        if (gen.gt(peakIncome)) { peakIncome = gen; peakAt = t; }
    }
    if (CPS > 0 && tmp.p && tmp.p.clickGain instanceof Decimal && tmp.p.clickGain.gt(0)) {
        player.points = player.points.add(tmp.p.clickGain.times(CPS).times(DT));
    }
    lastPointGen = gen instanceof Decimal ? gen : decimalZero;

    // 2. per-layer custom ticks + passive drip
    for (const id of layerOrder) {
        const L = LAYERS[id];
        if (typeof L.update === "function") { try { L.update.call(L, new Decimal(DT)); } catch (_) {} }
        if (typeof L.passiveGeneration === "function") {
            let rate = 0;
            try { rate = L.passiveGeneration.call(L); } catch (_) { rate = 0; }
            if (typeof rate === "number" && rate > 0) {
                if (["normal", "static", "custom"].includes(tmp[id].type))
                    player[id].points = player[id].points.add(tmp[id].resetGain.max(0).times(rate).times(DT));
            }
        }
    }
    updateMilestonesSim();
    updateTempSim();

    // 3. purchases (only for usable layers: player flag OR canReset&&layerShown)
    let anyBuy = 0;
    for (const id of layerOrder) {
        if (tmp[id].type === "none") continue;
        if (!layerUnlockedSim(id)) continue;
        anyBuy += tryBuyUpgrades(id);
        anyBuy += tryBuyBuyables(id);
    }
    if (events.firstPurchase === null && anyBuy > 0) events.firstPurchase = +t.toFixed(2);

    // 4. prestige, deepest row first so cascades settle. POLICY (documented lower bound):
    //    "hold to HOLD× the last stake" — a normal layer prestiges when its base resource
    //    has grown ≥HOLD× since its last stake (a sane player stakes bigger, not the instant
    //    a gain≥1 appears — that re-stakes at the wiped-upgrade floor). Static / custom press
    //    whenever canReset && gain≥1. One press per layer per CLICK seconds.
    for (const id of [...layerOrder].sort((a, b) => (LAYERS[b].row || 0) - (LAYERS[a].row || 0))) {
        if (tmp[id].type === "none" || tmp[id].type === undefined) continue;
        if (!layerUnlockedSim(id)) continue;
        if (seen(id, events.firstUnlock)) events.firstUnlock[id] = +t.toFixed(1);
        const g = tmp[id].resetGain;
        if (g.lt(1)) continue;
        if (t - (lastPress[id] === undefined ? -Infinity : lastPress[id]) < CLICK) continue;
        if (tmp[id].type === "normal") {
            const prev = (lastBase[id] === undefined) ? tmp[id].requires : lastBase[id];
            // "1.5× the last stake, then re-stake" — the player never holds a base resource to
            // infinity (no e-overflow), yet can hold it past the first unlock to grow the gain.
            const need = prev.times(HOLD);
            if (tmp[id].baseAmount.lt(need)) continue;
        }
        if (canResetSim(id) && doPrestigeSim(id)) {
            lastBase[id] = tmp[id].baseAmount;
            lastPress[id] = t;
            if (seen(id, events.firstPrestige)) events.firstPrestige[id] = +t.toFixed(1);
            updateMilestonesSim();
        }
    }
    t += STEP;
    if (global.__TRACE_EVERY > 0 && Math.floor(t) % global.__TRACE_EVERY === 0) {
        const f = (x) => (x instanceof Decimal ? x.toExponential(2) : String(x));
        LOG("[t=" + t.toFixed(0) + "s] 里程/s=" + f(lastPointGen)
            + " | 里程=" + f(player.points) + " 登程=" + f(player.p.points)
            + " 菊露=" + f(player.k.points) + " 醇藏=" + f(player.j.points)
            + " 茱佩=" + f(player.d.points) + " 诗境=" + f(player.s.points) + " 九山礼=" + f(player.f.points));
    }
};

const started = Date.now();
let detonated = false;
while (t < MAXH * 3600) {
    tick();
    try { if (ENDGAME()) break; } catch (_) {}
    if (lastPointGen !== decimalZero && !lastPointGen.eq(lastPointGen)) { detonated = true; break; }   // NaN
    if (lastPointGen.toPrecision && Number(lastPointGen) === Infinity) { detonated = true; break; }
    if (Date.now() - started > BUDGET) { LOG("(stopped at the " + (BUDGET / 1000).toFixed(0) + " s wall-clock budget)"); break; }
}
// record unlock times for layers that never prestiged but did unlock
for (const id of layerOrder) if (seen(id, events.firstUnlock) && player[id].unlocked) events.firstUnlock[id] = t;

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
const hours = t / 3600;
let reached = false;
try { reached = !!ENDGAME(); } catch (_) {}
const sumUpgrades = layerOrder.reduce((n, id) => n + (player[id].upgrades.length || 0), 0);
const sumMilestones = layerOrder.reduce((n, id) => n + (player[id].milestones.length || 0), 0);
const report = {
    game: path.basename(game),
    reachedEndgame: reached,
    detonated,
    totalHours: +hours.toFixed(2),
    firstPurchaseSeconds: events.firstPurchase,
    firstUnlockSeconds: events.firstUnlock,
    firstPrestigeSeconds: events.firstPrestige,
    peakPointGenPerSec: String(peakIncome),
    peakPointGenAtSeconds: +peakAt.toFixed(1),
    layers: layerOrder.length,
    upgradesBought: sumUpgrades,
    milestonesEarned: sumMilestones,
    finalPointGenPerSec: String(lastPointGen),
    simIsLowerBound: true,
};
if (asJson) { console.log(JSON.stringify(report, null, 2)); }
else {
    LOG("simulate: " + path.basename(game) + " — " + report.layers + " layer(s)");
    LOG("  first affordable purchase : " + (report.firstPurchaseSeconds === null ? "never" : report.firstPurchaseSeconds + " s") + "   (author rule: < 10 s)");
    LOG("  first unlock by layer     : " + (Object.keys(events.firstUnlock).length ? JSON.stringify(events.firstUnlock) : "none"));
    LOG("  first prestige by layer   : " + (Object.keys(events.firstPrestige).length ? JSON.stringify(events.firstPrestige) : "none"));
    LOG("  peak 山道里程/s            : " + report.peakPointGenPerSec + " at " + report.peakAtSeconds + " s");
    LOG("  final 山道里程/s           : " + report.finalPointGenPerSec);
    LOG("  upgrades / milestones     : " + report.upgradesBought + " / " + report.milestonesEarned);
    LOG("  total to isEndgame()      : " + hours.toFixed(2) + " h" + (reached ? "" : "   (DID NOT REACH — check the endgame target vs the production curve)"));
    if (report.detonated)
        LOG("  !! DETONATION: production went to Infinity/NaN — a self-scaling term or runaway loop is unbounded; inspect the cap table in design-brief §8.");
    if (reached && hours < 0.1)
        LOG("  !! NOT CALIBRATED: finishing this fast means the greedy policy out-prestiged the\n     game's own guards. The early timeline above is still valid; the total is not.\n     The sim excludes challenges/achievements/clickables/offline — it is a FLOOR.");
    LOG("");
    LOG("  LOWER BOUND: no challenge rewards, no achievements, no clickables/minigame, no human");
    LOG("  dithering. Rebalance the BRIEF (and tuning.js), then re-run — never hand-tune layer code.");
}
