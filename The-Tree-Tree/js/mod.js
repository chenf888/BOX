let modInfo = {
	name: "The Tree Tree",
    id: "the-tree-tree-h43htw",  // savefile key — set once, NEVER change (changing it erases all saves)
	author: "chenf888",
	pointsName: "Leaves",
	modFiles: ["tuning.js", "layers-row01.js", "layers-row2.js", "layers-row3.js", "layers-row4.js", "layers-side.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// ---- T2 language flag (P17): default English (Q7). Single source of truth is
// options.chinesemode — persisted with the options save (save.js stores options separately
// and merges them over getStartOptions; the legacy localStorage key is honored by the
// getStartOptions override in tree.js, which runs AFTER options.js — this file runs at
// index.html line 21, BEFORE options.js, and must not touch any engine symbol).
// Every tt() site reads window.chinesemode, a LIVE VIEW of the option, so the Options-page
// toggle flips all text in place — no reload.
try {
    Object.defineProperty(window, "chinesemode", {
        get() { try { return options.chinesemode === true } catch (e) { return false } },   // options is in TDZ until utils/options.js runs
        configurable: true,
    })
} catch (e) { window.chinesemode = false }
function toggleLang() {
    options.chinesemode = !options.chinesemode
    try { localStorage.setItem(modInfo.id + ".lang", options.chinesemode ? "zh" : "en") } catch (e) {}
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "First Sprout",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1</h3><br>
		- A seed planted. The Tree Tree begins.`

let winText = function () {
    return window.chinesemode
        ? "你种出了那棵树中之树。所有倒下的树，都成了它脚下的土。"
        : "You have grown THE TREE TREE. Every tree that ever fell became the ground it stands on."
}

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// getNextAt/canReset must NOT be eagerly called: updateTempData runs BEFORE tmp[layer].resetGain
// exists (still the {} placeholder from setupTemp), and these hooks read it — eager calls crashed
// boot (Stage 6.5). The engine still calls them properly via its per-tick wrappers.
var doNotCallTheseFunctionsEveryTick = ["allMult", "groveGetGain", "toggleLang", "getNextAt", "canReset", "prestigeButtonText"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
    if (inChallenge("canopy", 12)) return false   // "Leafless" trial: the tree holds its breath
    return true
}

// Calculate points/sec! (the leaf-economy web — brief §4.1; every promise wired exactly once)
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
    // wood upgrades
    if (hasUpgrade("wood", 11)) gain = gain.times(1.5)
    if (hasUpgrade("wood", 12)) gain = gain.times(upgradeEffect("wood", 12))
    if (hasUpgrade("wood", 14)) gain = gain.times(1.5)
    if (hasUpgrade("wood", 22)) gain = gain.times(2)
    if (hasUpgrade("wood", 31)) gain = gain.times(3)
    if (hasUpgrade("wood", 34)) gain = gain.times(upgradeEffect("wood", 34))
    // branch leaves-web
    if (hasUpgrade("branch", 12)) gain = gain.times(1.5)
    if (hasUpgrade("branch", 22)) gain = gain.times(2)
    if (hasUpgrade("branch", 25)) gain = gain.times(1.5)
    if (hasUpgrade("branch", 35)) gain = gain.times(2)
    // root web
    if (hasUpgrade("root", 11)) gain = gain.times(1.5)
    if (hasUpgrade("root", 21)) gain = gain.times(1.5)
    if (hasUpgrade("root", 31)) gain = gain.times(2)
    if (getBuyableAmount("root", 11).gte(1)) gain = gain.times(buyableEffect("root", 11)) // mycorrhiza
    // milestone webs on leaves (wood m0 x2.5 boosts WOOD gain — lives in wood gainMult)
    if (hasMilestone("root", 0)) gain = gain.times(1.5)
    if (hasMilestone("root", 3)) gain = gain.times(1.8)
    if (hasMilestone("root", 5)) gain = gain.times(2)
    if (hasMilestone("root", 7)) gain = gain.times(3)
    // bark / blossom / sap / canopy / seed milestones
    if (hasMilestone("bark", 0)) gain = gain.times(1.5)
    if (hasMilestone("blossom", 0)) gain = gain.times(1.5)
    if (hasMilestone("sap", 2)) gain = gain.times(1.5)
    if (hasMilestone("canopy", 2)) gain = gain.times(2)
    if (hasMilestone("seed", 1)) gain = gain.times(1.5)
    if (hasMilestone("seed", 5)) gain = gain.times(1.5)
    // bark / blossom / sap upgrade leaves-web
    if (hasUpgrade("bark", 11)) gain = gain.times(1.5)
    if (hasUpgrade("bark", 22)) gain = gain.times(2)
    if (hasUpgrade("blossom", 11)) gain = gain.times(1.5)
    if (hasUpgrade("blossom", 23)) gain = gain.times(1.5)
    if (hasUpgrade("sap", 13)) gain = gain.times(3)
    if (hasUpgrade("sap", 25)) gain = gain.times(2)
    // canopy leaves-web
    if (hasUpgrade("canopy", 11)) gain = gain.times(1.5)
    if (hasUpgrade("canopy", 13)) gain = gain.times(1.5)
    if (hasUpgrade("canopy", 14)) gain = gain.times(upgradeEffect("canopy", 14))
    if (hasUpgrade("canopy", 21)) gain = gain.times(2)
    if (hasUpgrade("canopy", 24)) gain = gain.times(2)
    if (hasUpgrade("canopy", 31)) gain = gain.times(3)
    if (hasUpgrade("canopy", 41)) gain = gain.times(3)
    if (hasUpgrade("canopy", 43)) gain = gain.times(1.5)
    if (hasUpgrade("canopy", 45)) gain = gain.times(5)
    if (hasUpgrade("canopy", 53)) gain = gain.times(1.5)
    // seed leaves-web
    if (hasUpgrade("seed", 11)) gain = gain.times(1.5)
    if (hasUpgrade("seed", 13)) gain = gain.times(1.5)
    if (hasUpgrade("seed", 21)) gain = gain.times(2)
    if (hasUpgrade("seed", 31)) gain = gain.times(2)
    if (hasUpgrade("seed", 41)) gain = gain.times(3)
    if (hasUpgrade("seed", 45)) gain = gain.times(5)
    // grove / worldtree leaves-web
    if (hasUpgrade("grove", 21)) gain = gain.times(3)
    if (hasUpgrade("worldtree", 15)) gain = gain.times(5)
    // achievements (alternate rewards; a11/a12/a13)
    if (hasAchievement("a", 10)) gain = gain.times(achievementEffect("a", 10))
    if (hasAchievement("a", 11)) gain = gain.times(achievementEffect("a", 11))
    if (hasAchievement("a", 12)) gain = gain.times(achievementEffect("a", 12))
    // blossom layer effect (each bloom feeds the leaf canopy)
    if (player.blossom.unlocked && tmp.blossom.effect !== undefined && tmp.blossom.effect.leafBoost !== undefined)
        gain = gain.times(tmp.blossom.effect.leafBoost)
    // challenge handicaps + rewards
    if (inChallenge("wood", 12)) gain = gain.div(5)   // "Storm": growth halved fivefold
    if (hasChallenge("wood", 12)) gain = gain.times(1.5)
    // named-formula exponent rewards (K4)
    if (hasMilestone("blossom", 5)) gain = gain.pow(1.03)
    if (hasMilestone("seed", 4)) gain = gain.pow(1.03)
    if (hasMilestone("grove", 4)) gain = gain.pow(1.05)
    if (hasUpgrade("worldtree", 11)) gain = gain.pow(1.02)   // World Roots
    if (hasChallenge("seed", 22)) gain = gain.pow(1.03)
    if (getBuyableAmount("sap", 11).gte(1))
        gain = gain.pow(buyableEffect("sap", 11))          // concentrate: +exp per level
    // the shared "all gains" web (worldtree chain, grove trees, late milestones)
    gain = gain.times(allMult())
    // leaf softcap (the base currency's own cap — same measured-retune shape as the wood cap)
    if (gain.gte(TUNING.LEAF.start))
        gain = gain.pow(TUNING.LEAF.power).times(Decimal.pow(TUNING.LEAF.start, 1 - TUNING.LEAF.power))
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
    function () {
        if (inChallenge("canopy", 11) || inChallenge("canopy", 12) || inChallenge("canopy", 13))
            return tt("<b>A light trial is in progress — the canopy is being tested.</b>", "<b>光照考验进行中——树冠正在接受考验。</b>")
        if (inChallenge("seed", 21) || inChallenge("seed", 22) || inChallenge("seed", 23))
            return tt("<b>A seed trial is in progress.</b>", "<b>种试进行中。</b>")
        if (inChallenge("wood", 11) || inChallenge("wood", 12))
            return tt("<b>A wood trial is in progress.</b>", "<b>木试进行中。</b>")
    },
    function () {
        // live softcap warning (10 §3: the cap must be visible)
        if (player.wood.unlocked && tmp.wood.softcap !== undefined && player.wood.points.gte(tmp.wood.softcap))
            return tt("Wood growth is <b>softcapped</b> beyond " + format(tmp.wood.softcap) + ".", "木头生长在 " + format(tmp.wood.softcap) + " 之后进入<b>软帽</b>。")
    },
    function () {
        if (player.points.gte(TUNING.LEAF.start))
            return tt("Leaf growth is <b>softcapped</b> beyond " + format(TUNING.LEAF.start) + " leaves.", "树叶生长在 " + format(TUNING.LEAF.start) + " 片之后进入<b>软帽</b>。")
    },
    function () {
        if (player.grove.unlocked) return tt("Trees planted: " + formatWhole(player.grove.points), "已种下的树：" + formatWhole(player.grove.points))
    },
]

// Determines when the game "ends" — the 15th World Tree milestone: THE TREE TREE is grown.
function isEndgame() {
	return hasMilestone("worldtree", 14)
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version.
function fixOldSave(oldVersion){
}
