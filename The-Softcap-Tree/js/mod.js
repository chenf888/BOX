let modInfo = {
	name: "The Softcap Tree",
    id: "the-softcap-tree-9g7d7c",  // savefile key — set once, NEVER change (changing it erases all saves)
	author: "chenf888",
	pointsName: "Force",
	modFiles: [
		"tuning.js",
		"layers-st.js",
		"layers-row1.js",
		"layers-row2.js",
		"layers-row3.js",
		"layers-side.js",
		"tree.js",
	],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
	allowSmall: true, // suppressed rates can display below 1e-4 (07 Part F1)
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "The First Wall",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1 — The First Wall</h3><br>
		- Every number is softcapped. Every cap feeds another.<br>
		- Strain, Threshold, twin Pillars, the Time Wall, Gravity, Work Hardening, Recursion.<br>
		- Endgame: the Tuning Manifold and the Master Valve.`

// winText is a FUNCTION (bilingual). index.html renders it via a typeof guard (brief §10 #5).
let winText = function() {
	return L(
		"You pushed every wall, and every wall pushed back — and you are still here.<br>The Master Valve is open.<br><br>(The softcaps never end. You simply stopped needing them.)",
		"你推倒了每一面墙，而每一面墙都推了回来——而你还在这里。<br>总阀已开。<br><br>（软上限从未消失，只是你不再需要它们。）"
	)
}

// No custom action-functions live inside layers — all shared math is in tuning.js globals.
var doNotCallTheseFunctionsEveryTick = []

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec! (the Force wall: effective = ideal × pace ÷ (1+F/T)^supExp)
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)
	var eff = forceEffRate()
	// st u16: Force rate ^1.05, softcapped (K3 shape)
	if (hasUpgrade("st", 16)) {
		eff = eff.pow(1.05)
		if (eff.gte("1e10")) eff = eff.div("1e10").pow(0.5).times("1e10")
	}
	// manifold tuning on the root resource itself (mf allocated exponent axis).
	// R8 measured retune: the Force RATE is equilibrium-critical — an exponent >1 lets
	// growth outrun every cap (F/T hit 1e18 within one tick). The slot can only soften.
	if (hasMilestone("mf", 0)) eff = eff.pow(Math.min(mfTune(0), 1))
	return eff
}

// You can add non-layer related variables that should go into "player" and be saved here
function addedPlayerData() { return {
	paceWallMin: 45,   // Q6: the player's free-set wall length, in minutes
	chinesemode: false, // T2 language preference; English is the default (Q7)
}}

// Display extra things at the top of the page
var displayThings = [
	function() {
		var T = strainCap(), F = player.points
		var frac = wallSupFrac().times(100)
		return L(
			"Force wall: cap " + format(T) + " — you are " + formatWhole(frac) + "% suppressed" + (frac.gte(50) ? " <b style='color:#ff8a65'>(stress is pouring)</b>" : ""),
			"力之墙：上限 " + format(T) + " —— 你被压制 " + formatWhole(frac) + "%" + (frac.gte(50) ? " <b style='color:#ff8a65'>（应力正在倾泻）</b>" : "")
		)
	},
	function() {
		if (player.st.stress.gte(1)) return L(
			"Wall length setting: " + Math.round(player.paceWallMin) + " min (pace ×" + format(paceMult()) + ") — set it in <b>Options</b>",
			"时间墙设置：" + Math.round(player.paceWallMin) + " 分钟（节奏 ×" + format(paceMult()) + "）—— 在<b>选项</b>里自由调整"
		)
	},
]

// Determines when the game "ends" — the 12th valve of the Omni chain opens.
function isEndgame() {
	return hasMilestone("ov", 11)
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
	// audit fix: achievement id 0 moved to 50 (grid row 0/col 0 is unreachable in the
	// stock achievements component) — migrate already-earned saves so the count stays true
	var arr = player.ac.achievements
	if (arr.includes(0) || arr.includes("0")) {
		player.ac.achievements = arr.filter(x => x !== 0 && x !== "0")
		if (!player.ac.achievements.includes(50) && !player.ac.achievements.includes("50")) player.ac.achievements.push(50)
	}
}
