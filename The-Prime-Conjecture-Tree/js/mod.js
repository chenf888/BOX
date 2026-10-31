let modInfo = {
	name: "The Prime Conjecture Tree",
    id: "the-prime-conjecture-tree-54nlco",  // savefile key — set once, NEVER change (changing it erases all saves)
	author: "chenf888",
	pointsName: "numbers",
	modFiles: [
		"tuning.js",       // constants first — every later file reads TUNING
		"layer_s.js",      // row 0: the Sieve
		"layer_row1.js",   // row 1: pi / fac / gap / lem
		"layer_row2.js",   // row 2: pnt / wil / prob
		"layer_row3.js",   // row 3: pairs / oracle
		"layer_zeta.js",   // row 4: the Boss
		"side_layers.js",  // achievements / story / casino / stats
		"tree.js",
	],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "First Sieve",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1 — First Sieve</h3><br>
		- The Sieve (row 0): sieve numbers into primes; five cooldown filter bursts.<br>
		- Row 1: Prime Counting π, Factorization Ω, Prime Gaps, the Lemma Library.<br>
		- Row 2: Prime Number Theorem, Wilson's Theorem, the Open Problems hall (score-attack trials).<br>
		- Row 3: Prime Pairs (Goldbach & twins + pair-deduction minigame), the Pantheon (sacrifice gacha).<br>
		- Row 4: the Riemann ζ Boss — pin the non-trivial zeros back to the critical line.`

// A function, never a top-level interpolated string (07 Part F3)
let winText = function() {
	return L("黎曼假设——被你证明了。素数不再有秘密。<br><br>The Riemann Hypothesis is proved. The primes hold no more secrets.",
	         "The Riemann Hypothesis — proved by you. The primes hold no more secrets.")
}

// Custom action-functions invented in layer files (called once per click, not per tick)
var doNotCallTheseFunctionsEveryTick = ["pmPick", "summonBlessing"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

function canGenPoints(){
	return true
}

// ============================================================
// getPointGen — numbers/sec. Every promised boost to the BASE
// currency is wired HERE (wiring map, references/core/06 §3).
// ============================================================
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)

	// --- row-1 branches boost the anchor (P10: ≥1 upgrade boosts layer 1 / numbers) ---
	if (hasUpgrade("pi", 11)) gain = gain.times(2)                                  // "Count them one by one"
	if (hasUpgrade("fac", 11)) gain = gain.times(2)                                 // "Unique factorization"
	if (hasUpgrade("gap", 11)) gain = gain.times(2)                                 // "Mind the gap"
	if (hasUpgrade("lem", 13)) gain = gain.times(3)                                 // lemma shop line
	if (hasUpgrade("pnt", 11)) gain = gain.times(5)                                 // theorem floors feed back
	if (hasUpgrade("pnt", 21)) gain = gain.times(upgradeEffect("pnt", 21))          // K2 pow on counts
	if (hasUpgrade("wil", 11)) gain = gain.times(5)
	if (hasUpgrade("pairs", 11)) gain = gain.times(3)

	// --- cross-resource shaping (K3, sublinear) ---
	gain = gain.times(player.pi.points.max(1).log10().add(1))                       // counts compress numbers upward
	if (hasUpgrade("gap", 14)) gain = gain.times(upgradeEffect("gap", 14))          // K6 record-breaking
	if (hasUpgrade("s", 24)) gain = gain.times(upgradeEffect("s", 24))              // K3 log²(primes)

	// --- zeta boss milestones (endgame engine) ---
	if (hasMilestone("zeta", 2)) gain = gain.times(5)
	if (hasMilestone("zeta", 5)) gain = gain.times(10)

	// --- score-attack trial rewards (M2): flat + score-shaped ---
	if (hasChallenge("prob", 11)) gain = gain.times(1.5)
	if (hasChallenge("prob", 12)) gain = gain.times(challengeEffect("prob", 12))

	// --- theorem-floor & trial-hub milestones (P10 retroactive boosts) ---
	if (hasMilestone("pnt", 0)) gain = gain.times(2)
	if (hasMilestone("wil", 0)) gain = gain.times(2)
	if (hasMilestone("prob", 0)) gain = gain.times(1.5)
	if (hasMilestone("prob", 2)) gain = gain.times(2)
	if (hasUpgrade("pnt", 23)) gain = gain.times(upgradeEffect("pnt", 23))   // K3 wilson quotients

	// --- Open Problems hall upgrades (numbers side) ---
	if (hasUpgrade("prob", 11)) gain = gain.times(2)
	if (hasUpgrade("prob", 13)) gain = gain.times(2)
	if (hasUpgrade("prob", 23)) gain = gain.times(3)
	if (hasUpgrade("prob", 41)) gain = gain.times(3)
	if (hasUpgrade("prob", 51)) gain = gain.times(5)
	if (hasUpgrade("prob", 44)) gain = gain.times(2)   // elementary PNT (numbers side)
	if (hasUpgrade("prob", 62)) gain = gain.times(2)   // "all gains" (numbers side)

	// --- achievements (P13 side rewards, alternate path) ---
	if (hasAchievement("a", 11)) gain = gain.times(1.5)
	if (hasAchievement("a", 21)) gain = gain.times(2)
	if (hasAchievement("a", 41)) gain = gain.times(2)
	if (hasAchievement("a", 72)) gain = gain.times(3)

	// --- Pantheon blessing bus (M13): slot 0 = Euler's product blessing ---
	if (player.oracle.neff1[0]) gain = gain.times(player.oracle.ncalc1[0])

	// outside consumer of pi.b11 (N-BUYABLEDEAD): counting speed feeds numbers
	gain = gain.times(buyableEffect("pi", 11))

	return gain
}

// You can add non-layer related variables that should go into "player" and be saved here
function addedPlayerData() { return {
	chinesemode: false,   // T2 default language = English (Q7 ledger); flipping rewrites saved prefs
}}

// Display extra things at the top of the page
var displayThings = [
	function() {
		if (player.s.points.eq(0) && player.points.gte(10))
			return L("<b>按 S 筛分你的数！</b> (Press <b>S</b> to sieve your numbers!)",
			         "Press <b>S</b> to sieve your numbers!")
	},
	function() {
		if (inChallenge("prob", 11) || inChallenge("prob", 12) || inChallenge("prob", 21) || inChallenge("prob", 22))
			return L("试炼进行中——声望会中止试炼。", "A trial is running — prestige exits it.")
	},
]

// Determines when the game "ends"
function isEndgame() {
	return player.zeta.milestones.length >= TUNING.endgameMilestones
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
