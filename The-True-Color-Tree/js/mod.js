let modInfo = {
	name: "The True Color Tree",
    id: "the-true-color-tree-3ij693",  // savefile key — set once, NEVER change (changing it erases all saves)
	author: "chenf888",
	pointsName: "Light",
	modFiles: ["cube.js", "layers.js", "layers2.js", "side.js", "tree.js"],

	discordName: "",
	discordLink: "",
	qqGroupName: "The Modding Nebula QQ Group",
	qqGroupLink: "https://qm.qq.com/q/rpvauXUL1o",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.2",
	name: "Chromatic Balance",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.2 — Chromatic Balance / 色彩校准</h3><br>
		- Fixed: White Light auto-prestige/auto-upgrade milestones now work (g m0 re-scoped to a gray boost — the engine's resetsNothing semantics make a row-0 autoPrestige unsound).<br>
		- Rebalanced: prism/filter buyables no longer compound superlinearly; complement/hue/saturation/trial upgrade ladders re-spaced; milestone production rewards reduced; unlock thresholds staggered across 9 orders of magnitude; White Light income softcap retuned (1e6→1e9→1e30→1e60, power 0.3).<br>
		- Save note: old v0.1 saves are unbalanced — a hard reset is recommended.<br>
	<h3>v0.1 — Monochrome Awakening / 单色觉醒</h3><br>
		- Initial build: White Light, R/G/B channels, Complements, Hue, Saturation.<br>
		- Chromatic Trials (6 color-blindness challenges), True Color Hub with the 24-bit palette cube.<br>
		- 50 achievements, story dashboard, full automation ladder. Endgame: complete all 16,777,216 colors.`

let winText = `Congratulations! You completed the full 24-bit palette — all 16,777,216 colors!<br>恭喜！你集齐了完整的 24 位色板——16,777,216 色，无一缺席！`

// No custom action-functions exist in this game (no update()/automate() — passive-prestige type),
// so nothing needs registering here. All official hooks are already excluded.
var doNotCallTheseFunctionsEveryTick = []

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Light (亮度) production — the unbounded fuel at the root of the economy.
// Every promised light bonus is wired here exactly once.
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)

	// w — White Light layer
	if (hasUpgrade("w", 13)) gain = gain.times(3)
	if (hasUpgrade("w", 25) && player.w.points.gte(1e4)) gain = gain.times(100)
	if (hasUpgrade("w", 32)) gain = gain.times(1000)
	if (hasUpgrade("w", 35)) gain = gain.times(1e4)
	if (getBuyableAmount("w", 12).gt(0)) gain = gain.times(buyableEffect("w", 12))

	// r/g/b channels — upgrade 11 of each tints the light
	if (hasUpgrade("r", 11)) gain = gain.times(3)
	if (hasUpgrade("g", 11)) gain = gain.times(3)
	if (hasUpgrade("b", 11)) gain = gain.times(3)
	if (hasMilestone("g", 2)) gain = gain.times(100)
	if (getBuyableAmount("g", 11).gt(0)) gain = gain.times(buyableEffect("g", 11))

	// c — Complements
	if (hasUpgrade("c", 33)) gain = gain.times(1e4)

	// s — Saturation
	if (hasUpgrade("s", 15)) gain = gain.times(10)
	if (hasUpgrade("s", 22)) gain = gain.times(1e4)

	// h — Hue
	if (hasUpgrade("h", 24) && player.t.best.gte(15)) gain = gain.times(1e6)
	if (hasUpgrade("h", 25)) gain = gain.times(1e5)

	// t — True Color Hub
	if (hasMilestone("t", 1)) gain = gain.times(1e4)

	// cb — Chromatic Trials
	if (hasMilestone("cb", 1)) gain = gain.times(1e3)

	// p — Painter's Workshop
	if (hasUpgrade("p", 23)) gain = gain.times(1e6)
	if (hasUpgrade("p", 35)) gain = gain.times(1e9)
	if (hasMilestone("p", 1)) gain = gain.times(1e6)

	// Achievements (flat light rewards)
	if (hasAchievement("a", 21)) gain = gain.times(achievementEffect("a", 21))
	if (hasAchievement("a", 42)) gain = gain.times(achievementEffect("a", 42))

	// Chromatic Trials — "Low Light" halves production by a root (P16 root penalty)
	if (inChallenge("cb", 14)) gain = gain.sqrt()

	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Language toggle (lives outside layers, so it is never auto-called)
function toggleChineseMode() {
    player.d.chinesemode = !player.d.chinesemode
}

// Display extra things at the top of the page
var displayThings = [
    function() {
        window.chinesemode = player.d.chinesemode
        return '<span style="opacity:.75;font-size:12px;cursor:pointer;" onclick="toggleChineseMode()">'
            + (window.chinesemode ? 'English' : '中文') + '</span>'
    },
    function() {
        return L("色板", "Palette") + ": " + format(cubeVolume()) + " / 16,777,216　("
            + format(palettePct()) + "%)　·　" + L("色深", "Depth") + ": " + formatWhole(bitDepth()) + "-bit"
    },
]

// Determines when the game "ends": the 24-bit palette is complete.
function isEndgame() {
	return player.r.points.gte(255) && player.g.points.gte(255) && player.b.points.gte(255)
}

// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}
