let modInfo = {
	name: "The Typhoon Tree",
    id: "the-typhoon-tree-5dxt4g",  // savefile key — set once, NEVER change (changing it erases all saves)
	author: "chenf888",
	pointsName: "Water Vapor",
	modFiles: ["tuning.js", "layers.js", "layers2.js", "layers3.js", "layers4.js", "layers5.js", "layers6.js", "layers7.js", "layers8.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(0),
	offlineLimit: 1,  // In hours
}

let VERSION = {
	num: "0.1",
	name: "First Convection",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1</h3><br>
		- The sea is warm. A disturbance forms.<br>
		- Evaporation layer: latent heat, 15 upgrades, 5 milestones.`

let winText = function() {
	return L(
		"The storm has made landfall. Somewhere far inland, rain is still falling from a sky that remembers you.",
		"台风登陆了。遥远内陆的雨里，还留着它记给你的最后一笔。")
}

// Custom action-functions (none so far — all interactions live in official
// onClick/automate hooks). Add any invented action-function name here.
var doNotCallTheseFunctionsEveryTick = []

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

function canGenPoints(){
	return true
}

// ============================================================================
// The water-vapor economy. Every promised boost to vapor is wired HERE.
// Cross-layer reads are guarded with `player.X &&` so every intermediate
// build (per-layer micro-gates, SKILL.md Stage 4.2) boots cleanly.
// ============================================================================
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(TUNING.VAPOR_BASE)

	// --- evap upgrades (row 0) ---
	if (hasUpgrade("evap", 11)) gain = gain.times(2)
	if (hasUpgrade("evap", 13)) gain = gain.times(3)
	if (hasUpgrade("evap", 14) && player.evap.best.gte(100)) gain = gain.times(5)
	if (hasUpgrade("evap", 31)) gain = gain.times(3)
	if (hasUpgrade("evap", 35)) gain = gain.times(upgradeEffect("evap", 35))

	// --- conv (row 1) ---
	if (player.conv && player.conv.buyables) {
		if (hasUpgrade("conv", 13)) gain = gain.times(2)
		if (hasUpgrade("conv", 34)) gain = gain.add(player.evap.best.times(0.05)) // K8 production
		gain = gain.times(getBuyableAmount("conv", 12).times(0.05).add(1))        // b12 towers
	}

	// --- milestones that boost vapor ---
	if (hasMilestone("evap", 1)) gain = gain.times(2)
	if (player.mon && hasMilestone("mon", 1)) gain = gain.times(2)
	if (player.mon && hasMilestone("mon", 5)) gain = gain.times(5)
	if (player.band && hasMilestone("band", 4)) gain = gain.times(3)
	if (player.land && hasMilestone("land", 7)) gain = gain.times(10)

	// --- monsoon strength effect (K8 layer effect) ---
	gain = gain.times(monsoonVaporMult())

	// --- achievements ---
	gain = gain.times(achMults().vapor)

	// --- env challenge 12: dry air intrusion (nerf, P16 injection) ---
	if (player.env && inChallenge("env", 12)) gain = gain.root(2)
	// --- env challenge rewards ---
	if (player.env && hasChallenge("env", 11)) gain = gain.times(challengeEffect("env", 11))
	if (player.env && hasChallenge("env", 31)) gain = gain.times(challengeEffect("env", 31))

	// --- casino forecast experience (M14) ---
	gain = gain.times(forecastMult())

	// --- land (row 4) rebuild mults ---
	if (player.land) {
		if (hasUpgrade("land", 11)) gain = gain.times(2)
		if (hasUpgrade("land", 23)) gain = gain.times(player.land.count.div(5).add(1))
		if (hasUpgrade("land", 34) && player.land.maxWind.gte(51)) gain = gain.times(3)
		if (player.land.buyables) gain = gain.times(getBuyableAmount("land", 41).times(0.3).add(1))   // b41 surge
	}

	// --- eyew b31 outflow layer ---
	if (player.eyew && player.eyew.buyables) gain = gain.times(getBuyableAmount("eyew", 31).times(0.25).add(1))

	// --- eyew circulation (ERC prestige output): storm remnant rains ---
	if (player.eyew) gain = gain.times(player.eyew.points.add(1).log10().add(1))

	// --- suh m2: full ridge set ---
	if (player.suh && hasMilestone("suh", 2)) gain = gain.times(2)

	// --- suh K4 named: 蒸发效率 ---
	if (player.suh && hasUpgrade("suh", 11)) gain = gain.pow(1.1)

	// threshold unlock writers: "none"-type layers can never self-unlock
	// (their only engine writer is a prestige, which they do not have)
	if (player.evap && player.evap.best.gte(500) && player.mon && !player.mon.unlocked) player.mon.unlocked = true
	if (player.conv && player.conv.best.gte(5e7) && player.env && !player.env.unlocked) player.env.unlocked = true
	if (player.eyew && hasMilestone("eyew", 0) && player.suh && !player.suh.unlocked) player.suh.unlocked = true
	if (player.conv && player.conv.best.gte(1e10) && player.cas && !player.cas.unlocked) player.cas.unlocked = true

	return gain
}

function addedPlayerData() { return {
	chinesemode: false,      // T2 toggle; default English (Q7 — never flip silently)
	typhoonName: 0,          // index into TYPHOON_NAMES (flavor)
}}

// The storm's name — picked once per save from the western-pacific naming list.
var TYPHOON_NAMES = [
	["Higos", "海高斯"], ["Nalgae", "娜基莉"], ["Banyan", "榕树"],
	["Yamaneko", "山猫"], ["Koguma", "小熊"], ["Tokage", "蝎虎"],
]
function typhoonName() {
	if (typeof player === "undefined" || !player) return TYPHOON_NAMES[0]
	let n = TYPHOON_NAMES[player.typhoonName % TYPHOON_NAMES.length]
	return player.chinesemode ? n[1] : n[0]
}

// Display lines at the top of the tree tab.
var displayThings = [
	function() {
		if (typeof player === "undefined" || !player || !player.eyew || !player.eyew.unlocked) return
		let w = windMS()
		return L(
			"<b>Typhoon " + typhoonName() + "</b> — " + format(w, 1) + " m/s (" + windCatName(w) + ")",
			"<b>台风 " + typhoonName() + "</b> — " + format(w, 1) + " 米/秒（" + windCatName(w) + "）")
	},
]

// Endgame: the Perfect Storm — the 25th landfall made at super-typhoon force.
function isEndgame() {
	if (typeof player === "undefined" || !player || !player.land) return false
	return hasMilestone("land", 9)
}

var backgroundStyle = {
	"background": "radial-gradient(ellipse at 30% 10%, #0d1b2a 0%, #060a12 60%, #03050a 100%)",
}

function maxTickLength() { return 3600 }

function fixOldSave(oldVersion) {}

// ----------------------------------------------------------------------------
// Watchdog (P52 spirit): the engine's `ticking` re-entry flag freezes the whole
// game silently if a single interval-body tick throws once (P64 class). Mod
// code cannot edit engine files, so release the flag here, leave a trace, and
// keep playing. 10s staleness + visible tab + not game-ended.
// ----------------------------------------------------------------------------
;(function() {
    let lastTime = null
    let lastStamp = Date.now()
    setInterval(function() {
        try {
            if (typeof player === "undefined" || !player) return
            if (typeof window.ticking !== "boolean") return
            if (player.time !== lastTime) { lastTime = player.time; lastStamp = Date.now(); return }
            if (window.ticking && Date.now() - lastStamp > 10000 && document.visibilityState !== "hidden" && !tmp.gameEnded) {
                window.ticking = false
                lastStamp = Date.now()
                window.__bootErrors = window.__bootErrors || []
                window.__bootErrors.push("[watchdog] game loop stalled with ticking=true (a one-time interval-body throw); released automatically.")
            }
        } catch (e) { /* the watchdog must never become the bug */ }
    }, 1000)
})()
