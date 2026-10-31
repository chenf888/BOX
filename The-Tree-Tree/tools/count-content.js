// tools/count-content.js — authoritative content totals for README (Stage 6).
// Loads the real mod files with the same stubs as smoke.js, captures addLayer,
// and counts numeric component keys per layer (SKILL rule: brace-counting
// the generated source over-counts — key capture is the truth).
const fs = require("fs");
const path = require("path");

const game = path.resolve(__dirname, "..");

// --- Decimal (same candidates as smoke.js) ---------------------------------
const decimalCandidates = [
    path.join(game, "js", "technical", "break_eternity.js"),
];
const Decimal = require(decimalCandidates.find((p) => fs.existsSync(p)));

// --- engine stubs (mirror smoke.js §"engine stubs") ------------------------
global.window = global;
global.Decimal = Decimal;
global.format = (x) => (x && x.toString ? x.toString() : String(x));
global.formatWhole = (x) => (x && x.floor ? x.floor().toString() : String(x));
global.formatTime = (s) => String(s);
global.formatSmall = global.format;
const FALSE = () => false;
["hasUpgrade", "hasMilestone", "hasAchievement", "hasChallenge", "inChallenge",
 "maxedChallenge", "canReset", "hasTree", "isBuyableAffordable"].forEach((fn) => { global[fn] = FALSE; });
global.challengeEffect = () => new Decimal(1);
global.TREE_LAYERS = [];
global.UP = 0; global.DOWN = 1; global.LEFT = 2; global.RIGHT = 3;
global.softcap = (v, cap, p) => (v.gt(cap) ? v.pow(p).times(cap.pow(1 - p)) : v);
global.doReset = () => {};
global.layerDataReset = () => {};
global.addNode = () => {};
global.getBuyableAmount = (l, id) => (player[l].buyables[id] || new Decimal(0));
global.addPoints = () => new Decimal(0);
global.addPointsNoReturn = () => {};
global.addResource = () => {};
global.setBuyableAmount = (l, id, v) => { player[l].buyables[id] = v; };
global.buyUpgrade = () => {};
global.buyBuyable = () => {};
global.upgradeEffect = (l, id) => new Decimal(1);
global.buyableEffect = (l, id) => new Decimal(1);
global.challengeCompletions = () => new Decimal(0);
global.completeChallenge = () => {};
global.getPointGen = () => new Decimal(1);
global.run = (fn) => (typeof fn === "function" ? fn() : undefined);
global.canBuy = () => false;
global.canAfford = () => false;
global.formatGain = global.format;
global.formatWholeGain = global.formatWhole;
global.softcapHTML = (x) => x;

const LAYERS = {};
const order = [];
global.addLayer = function (id, def) {
    if (typeof id === "string" && id && def && typeof def === "object") {
        if (!("layer" in def)) def.layer = id;
        LAYERS[id] = def;
        order.push(id);
    }
};
global.tmp = new Proxy({}, { get: () => new Proxy({}, { get: () => new Decimal(1) }) });

// --- file order (mirror smoke.js) ------------------------------------------
const ENGINE = /^js\/(technical|utils)\/|^js\/(game|components|utils)\.js$|^js\/Demo\//;
const html = fs.readFileSync(path.join(game, "index.html"), "utf8");
const htmlScripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)]
    .map((m) => m[1])
    .filter((s) => !/^https?:|^\/\//.test(s))
    .map((s) => s.replace(/^\.?\//, ""))
    .filter((s) => s.startsWith("js/") && !ENGINE.test(s));
const modSrc = fs.readFileSync(path.join(game, "js", "mod.js"), "utf8");
const mf = modSrc.match(/modFiles\s*:\s*\[([\s\S]*?)\]/);
const modFiles = mf ? [...mf[1].matchAll(/["']([^"']+)["']/g)].map((m) => "js/" + m[1]) : [];
const files = [];
const push = (f) => { if (f && !files.includes(f) && !ENGINE.test(f)) files.push(f); };
htmlScripts.filter((f) => /\/lang\//.test(f)).forEach(push);
push("js/mod.js");
modFiles.forEach(push);
htmlScripts.forEach(push);

const player = {};
global.player = player;
for (const f of files) {
    if (!fs.existsSync(path.join(game, f)) || /tree\.js$/.test(f)) continue;
    const code = fs.readFileSync(path.join(game, f), "utf8").replace(/\b(?:const|let)\s+(?=[A-Za-z_$])/g, "var ");
    try { (0, eval)(code); }
    catch (e) { console.error("LOAD FAIL " + f + ": " + e.message); process.exit(1); }
}
// player must exist before files eval (hooks reference it at definition time only
// via closures) — create per-layer skeletons now for startData consumers
for (const id of order) {
    if (!player[id]) {
        let sd = {};
        try { sd = LAYERS[id].startData ? LAYERS[id].startData() : {}; } catch (_) { sd = {}; }
        player[id] = Object.assign({}, sd, { unlocked: true, upgrades: [], milestones: [], challenges: [], buyables: sd.buyables || {}, clickables: sd.clickables || {} });
    }
}

// --- count -------------------------------------------------------------------
const numKeys = (o) => (o ? Object.keys(o).filter((k) => !isNaN(Number(k))).length : 0);
const rows = [];
let tot = { layers: 0, up: 0, ms: 0, ch: 0, bu: 0, cl: 0, ach: 0 };
for (const id of order) {
    const d = LAYERS[id];
    const row = {
        id,
        up: numKeys(d.upgrades),
        ms: numKeys(d.milestones),
        ch: numKeys(d.challenges),
        bu: numKeys(d.buyables),
        cl: numKeys(d.clickables),
        ach: numKeys(d.achievements),
    };
    row.total = row.up + row.ms + row.ch + row.bu + row.cl + row.ach;
    rows.push(row);
    tot.layers++;
    tot.up += row.up; tot.ms += row.ms; tot.ch += row.ch; tot.bu += row.bu; tot.cl += row.cl; tot.ach += row.ach;
}
console.log("layer      up  ms  ch  bu  cl  ach | total");
for (const r of rows) {
    if (r.total === 0 && !r.ach) continue;
    console.log(
        r.id.padEnd(10),
        String(r.up).padStart(2), String(r.ms).padStart(3), String(r.ch).padStart(3),
        String(r.bu).padStart(3), String(r.cl).padStart(3), String(r.ach).padStart(3),
        "|", String(r.total).padStart(4));
}
console.log("LAYERS(order):", order.join(","));
console.log("ALL LAYERS:", order.length);
console.log("TOTALS: upgrades=" + tot.up, "milestones=" + tot.ms, "challenges=" + tot.ch,
    "buyables=" + tot.bu, "clickables=" + tot.cl, "achievements=" + tot.ach,
    "| content sum=" + (tot.up + tot.ms + tot.ch + tot.bu + tot.cl + tot.ach));
