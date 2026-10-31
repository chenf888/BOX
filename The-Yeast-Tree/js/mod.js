let modInfo = {
	name: "The Yeast Tree",
	id: "the-yeast-tree", // savefile key — set once, NEVER change (changing it erases all saves)
	author: "chenf888",
	pointsName: "Sugar",
	modFiles: ["layers.js", "layers_row1.js", "layers_row2.js", "layers_row3.js", "layers_row4.js", "side.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(10), // Used for hard resets and new players
	offlineLimit: 1, // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "First Ferment",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1 — First Ferment</h3><br>
		- 10 prestige layers, 6 competition challenges, 50 achievements, 12 collectible wild strains, ester economy, kneading loop, ethanol tolerance hard cap.<br>
		- Endgame: sequence chromosome XVI.`

let winText = `Your synthetic strain finishes its first ferment — a beer no evolution ever brewed. Sixteen chromosomes, rewritten by hand, twelve million years in the making.<br><br><b>THE YEAST TREE IS COMPLETE</b><br><br>(The culture is stable. You may keep growing, forever.)`

// No custom action-functions exist in this mod — every layer function is either an
// official documented feature or a pure value-returning helper (tmp-cached safely).
var doNotCallTheseFunctionsEveryTick = []

function getStartPoints() {
	return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints() {
	return true
}

// Calculate points/sec! Sugar accumulates from the whole web (P10: nothing is ever orphaned).
function getPointGen() {
	if (!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	// — Budding (y) upgrades —
	if (hasUpgrade("y", 11)) gain = gain.times(2)
	if (hasUpgrade("y", 13)) gain = gain.times(upgradeEffect("y", 13))
	if (hasUpgrade("y", 14)) gain = gain.times(upgradeEffect("y", 14))
	if (hasUpgrade("y", 21)) gain = gain.times(3)
	if (hasUpgrade("y", 23)) gain = gain.times(upgradeEffect("y", 23))
	if (hasUpgrade("y", 24)) gain = gain.times(upgradeEffect("y", 24))
	if (hasUpgrade("y", 31)) gain = gain.times(5)
	if (hasUpgrade("y", 43)) gain = gain.times(upgradeEffect("y", 43))
	if (hasUpgrade("y", 44)) gain = gain.times(10)
	if (hasUpgrade("y", 52)) gain = gain.times(25)
	if (hasUpgrade("y", 53)) gain = gain.times(upgradeEffect("y", 53))
	// — layer effects —
	gain = gain.times(layers.y.effect())
	if (hasUpgrade("s", 15)) gain = gain.times(upgradeEffect("s", 15).min(3))
	// — milestones (flat, themed) —
	if (hasMilestone("b", 0)) gain = gain.times(2)
	if (hasMilestone("k", 0)) gain = gain.times(2)
	if (hasMilestone("o", 0)) gain = gain.times(2)
	if (hasMilestone("y", 2)) gain = gain.times(2)
	if (hasMilestone("y", 5)) gain = gain.times(3)
	if (hasMilestone("y", 8)) gain = gain.times(5)
	if (hasMilestone("c", 1)) gain = gain.times(2)
	if (hasMilestone("e", 2)) gain = gain.times(2)
	if (hasMilestone("s", 0)) gain = gain.times(2)
	if (hasMilestone("g", 0)) gain = gain.times(2)
	if (hasMilestone("g", 7)) gain = gain.times(5)
	if (hasMilestone("g", 13)) gain = gain.times(100)
	// — Trials rewards (score-attack records) —
	if (hasChallenge("c", 11)) gain = gain.times(challengeEffect("c", 11))
	if (hasChallenge("c", 21)) gain = gain.times(challengeEffect("c", 21))
	// — Tavern, Wild, Distillery, Genome cross-wiring —
	if (getBuyableAmount("t", 12).gte(1)) gain = gain.times(buyableEffect("t", 12))
	if (getBuyableAmount("b", 23).gte(1)) gain = gain.times(buyableEffect("b", 23))
	if (getBuyableAmount("k", 12).gte(1)) gain = gain.times(buyableEffect("k", 12))
	if (hasUpgrade("t", 24)) gain = gain.times(upgradeEffect("t", 24))
	if (hasUpgrade("t", 33)) gain = gain.times(upgradeEffect("t", 33))
	if (hasUpgrade("e", 34)) gain = gain.times(upgradeEffect("e", 34))
	if (hasUpgrade("g", 24)) gain = gain.times(upgradeEffect("g", 24))
	// — achievements —
	if (hasAchievement("a", 11)) gain = gain.times(1.5)
	if (hasAchievement("a", 12)) gain = gain.times(2)
	if (hasAchievement("a", 13)) gain = gain.times(2)
	if (hasAchievement("a", 14)) gain = gain.times(3)
	if (hasAchievement("a", 15)) gain = gain.times(5)
	if (hasAchievement("a", 51)) gain = gain.times(10)
	if (hasAchievement("a", 55)) gain = gain.times(10)
	if (hasAchievement("a", 63)) gain = gain.times(1.5)
	// — challenge handicaps (P16 formula injection) —
	if (inChallenge("c", 11)) gain = gain.pow(0.65)
	if (inChallenge("c", 21)) gain = gain.pow(0.5)
	return gain
}

// You can add non-layer related variables that should go into "player" and be saved here
function addedPlayerData() {
	return {}
}

// Display extra things at the top of the page
var displayThings = [
	function () { // live softcap warning (10 §3)
		if (player.y.unlocked && player.y.points.gte(ySoftcap().div(100)))
			return "<b style='color:#DAA520'>Yeast softcap starts at " + format(ySoftcap()) + " yeast — buy Selective Pressure to push it back.</b>"
	},
	function () { // hard-cap notice for the theme ceiling
		if (player.e.unlocked && player.e.points.gte(layers.e.tolerance().sub(0.05)))
			return "<b style='color:#B0C4DE'>Your wash is at its ethanol tolerance (" + format(layers.e.tolerance()) + "% ABV) — bottle some (buy Distillery upgrades) to keep distilling.</b>"
	},
	function () {
		if (player.c.activeChallenge && tmp.c && tmp.c.challenges && tmp.c.challenges[player.c.activeChallenge])
			return "Competition in progress: <b>" + tmp.c.challenges[player.c.activeChallenge].name + "</b> — best brew this run: " + format(cScore())
	},
]

// Determines when the game "ends"
function isEndgame() {
	return hasMilestone("g", 15)
}

// Total brew brewed during the current competition run (the M2 score).
function cScore() {
	return player.b.points.max(0)
}

// Current yeast softcap (mirrors the logic inside y.softcap for the status line).
function ySoftcap() {
	let cap = new Decimal("1e12")
	if (hasUpgrade("y", 22)) cap = new Decimal("1e14")
	if (hasUpgrade("y", 42)) cap = new Decimal("1e16")
	if (hasUpgrade("y", 55)) cap = new Decimal("1e18")
	if (hasUpgrade("s", 12)) cap = cap.times(1000)
	if (hasUpgrade("t", 32)) cap = cap.times(10)
	return cap
}

// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return (3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version.
function fixOldSave(oldVersion) {
}
