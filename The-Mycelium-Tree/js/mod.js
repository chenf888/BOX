let modInfo = {
	name: "The Mycelium Tree",
    id: "the-mycelium-tree",  // savefile key — set once, NEVER change (changing it erases all saves)
	author: "chenf888",
	pointsName: "Detritus",
	modFiles: ["layers.js", "layers_phase2.js", "layers_phase3.js", "layers_phase4.js", "layers_end.js", "side.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "First version",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1 — First version</h3><br>
		- The full lifecycle: Decay (rows 0-2), Fruiting (rows 3-4), Symbiosis (rows 5-7), Dominion (rows 8-10), Cosmos (rows 11-12).<br>
		- 25 prestige layers, 3 challenge sets, 50 achievements, automation throughout.<br>
		- Endgame: complete The Great Fruiting.`

let winText = `Your spores catch the solar wind. Beneath every forest, on every world, the mycelial web remembers: it all started with one hypha on the forest floor.<br><br><b>THE GREAT FRUITING IS COMPLETE</b><br><br>(You may keep growing, forever.)`

// No custom action-functions are used anywhere in this mod — every layer function
// is either an official documented feature or a pure value-returning helper.
var doNotCallTheseFunctionsEveryTick = []

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec! Detritus accumulates from the whole web (P10: nothing is ever orphaned).
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	if (hasUpgrade("h", 11)) gain = gain.times(2)
	if (hasUpgrade("h", 24)) gain = gain.times(5)
	if (hasUpgrade("h", 34)) gain = gain.times(10)
	if (hasUpgrade("h", 13)) gain = gain.times(upgradeEffect("h", 13))
	if (hasUpgrade("h", 23)) gain = gain.times(upgradeEffect("h", 23))
	if (hasUpgrade("m", 11)) gain = gain.times(2)
	if (hasUpgrade("m", 24)) gain = gain.times(5)
	if (hasUpgrade("e", 11)) gain = gain.times(2)
	if (hasUpgrade("e", 24)) gain = gain.times(5)
	if (hasUpgrade("s", 11)) gain = gain.times(2)
	if (hasUpgrade("s", 25)) gain = gain.times(5)
	if (hasUpgrade("y", 11)) gain = gain.times(2)
	if (hasUpgrade("y", 24)) gain = gain.times(5)
	if (hasUpgrade("f", 11)) gain = gain.times(2)
	if (hasUpgrade("f", 24)) gain = gain.times(5)
	if (hasUpgrade("f", 34)) gain = gain.times(10)
	if (hasUpgrade("w", 11)) gain = gain.times(2)
	if (hasUpgrade("w", 24)) gain = gain.times(5)
	if (hasUpgrade("g", 11)) gain = gain.times(2)
	if (hasUpgrade("g", 24)) gain = gain.times(5)
	if (hasUpgrade("b", 11)) gain = gain.times(2)
	if (hasUpgrade("b", 24)) gain = gain.times(5)
	if (hasUpgrade("i", 11)) gain = gain.times(2)
	if (hasUpgrade("i", 24)) gain = gain.times(5)
	if (hasUpgrade("r", 11)) gain = gain.times(2)
	if (hasUpgrade("r", 34)) gain = gain.times(10)
	if (hasUpgrade("d", 11)) gain = gain.times(2)
	if (hasUpgrade("d", 24)) gain = gain.times(5)
	if (hasUpgrade("o", 11)) gain = gain.times(2)
	if (hasUpgrade("o", 24)) gain = gain.times(5)
	if (hasUpgrade("p", 11)) gain = gain.times(2)
	if (hasUpgrade("p", 24)) gain = gain.times(5)
	if (hasUpgrade("l", 11)) gain = gain.times(2)
	if (hasUpgrade("l", 24)) gain = gain.times(5)
	if (hasUpgrade("t", 11)) gain = gain.times(2)
	if (hasUpgrade("t", 24)) gain = gain.times(5)
	if (hasUpgrade("n", 11)) gain = gain.times(2)
	if (hasUpgrade("n", 24)) gain = gain.times(5)
	if (hasUpgrade("c", 11)) gain = gain.times(2)
	if (hasUpgrade("c", 24)) gain = gain.times(5)
	if (hasUpgrade("pa", 11)) gain = gain.times(2)
	if (hasUpgrade("pa", 24)) gain = gain.times(5)
	if (hasUpgrade("pd", 11)) gain = gain.times(2)
	if (hasUpgrade("pd", 24)) gain = gain.times(5)
	if (hasUpgrade("q", 11)) gain = gain.times(2)
	if (hasUpgrade("q", 34)) gain = gain.times(10)
	if (hasUpgrade("pr", 11)) gain = gain.times(2)
	if (hasUpgrade("pr", 24)) gain = gain.times(5)
	if (hasUpgrade("x", 11)) gain = gain.times(2)
	if (hasUpgrade("x", 24)) gain = gain.times(5)
	if (hasUpgrade("z", 11)) gain = gain.times(10)
	if (hasUpgrade("z", 21)) gain = gain.times(100)
	if (hasUpgrade("z", 24)) gain = gain.times(100)
	gain = gain.times(buyableEffect("h", 11))
	gain = gain.times(buyableEffect("f", 11))
	gain = gain.times(tmp.h.effect)
	if (player.m.unlocked) gain = gain.times(tmp.m.effect)
	if (player.e.unlocked) gain = gain.times(tmp.e.effect)
	if (player.s.unlocked) gain = gain.times(tmp.s.effect)
	if (player.y.unlocked) gain = gain.times(tmp.y.effect)
	if (player.f.unlocked) gain = gain.times(tmp.f.effect)
	if (player.w.unlocked) gain = gain.times(tmp.w.effect)
	if (player.g.unlocked) gain = gain.times(tmp.g.effect)
	if (player.b.unlocked) gain = gain.times(tmp.b.effect)
	if (player.i.unlocked) gain = gain.times(tmp.i.effect)
	if (player.r.unlocked) gain = gain.times(tmp.r.effect)
	if (player.d.unlocked) gain = gain.times(tmp.d.effect)
	if (player.o.unlocked) gain = gain.times(tmp.o.effect)
	if (player.p.unlocked) gain = gain.times(tmp.p.effect)
	if (player.l.unlocked) gain = gain.times(tmp.l.effect)
	if (player.t.unlocked) gain = gain.times(tmp.t.effect)
	if (player.n.unlocked) gain = gain.times(tmp.n.effect)
	if (player.c.unlocked) gain = gain.times(tmp.c.effect)
	if (player.pa.unlocked) gain = gain.times(tmp.pa.effect)
	if (player.pd.unlocked) gain = gain.times(tmp.pd.effect)
	if (player.q.unlocked) gain = gain.times(tmp.q.effect)
	if (player.pr.unlocked) gain = gain.times(tmp.pr.effect)
	if (player.x.unlocked) gain = gain.times(tmp.x.effect)
	if (player.z.unlocked) gain = gain.times(tmp.z.effect)
	if (hasMilestone("h", 1)) gain = gain.times(2)
	if (hasMilestone("h", 3)) gain = gain.times(3)
	if (hasMilestone("h", 5)) gain = gain.times(3)
	if (hasMilestone("h", 7)) gain = gain.times(5)
	if (hasMilestone("h", 9)) gain = gain.times(10)
	if (hasMilestone("h", 11)) gain = gain.times(10)
	if (hasMilestone("m", 1)) gain = gain.times(2)
	if (hasMilestone("m", 4)) gain = gain.times(3)
	if (hasMilestone("e", 2)) gain = gain.times(2)
	if (hasMilestone("e", 4)) gain = gain.times(3)
	if (hasMilestone("s", 2)) gain = gain.times(3)
	if (hasMilestone("y", 1)) gain = gain.times(3)
	if (hasMilestone("y", 4)) gain = gain.times(5)
	if (hasMilestone("f", 2)) gain = gain.times(3)
	if (hasMilestone("f", 4)) gain = gain.times(5)
	if (hasMilestone("f", 9)) gain = gain.times(5)
	if (hasMilestone("w", 2)) gain = gain.times(3)
	if (hasMilestone("d", 0)) gain = gain.times(3)
	if (hasMilestone("d", 2)) gain = gain.times(5)
	if (hasMilestone("r", 1)) gain = gain.times(5)
	if (hasMilestone("r", 6)) gain = gain.times(10)
	if (hasMilestone("t", 5)) gain = gain.times(10)
	if (hasMilestone("q", 1)) gain = gain.times(10)
	if (hasMilestone("pa", 2)) gain = gain.times(10)
	if (hasMilestone("pa", 4)) gain = gain.times(20)
	if (hasMilestone("pd", 2)) gain = gain.times(10)
	if (hasMilestone("pd", 4)) gain = gain.times(20)
	if (hasMilestone("pr", 4)) gain = gain.times(100)
	if (hasMilestone("x", 3)) gain = gain.times(100)
	if (hasMilestone("z", 0)) gain = gain.times(100)
	if (hasMilestone("z", 2)) gain = gain.times(500)
	if (hasMilestone("z", 4)) gain = gain.times(1000)
	if (hasChallenge("f", 11)) gain = gain.times(5)
	if (hasChallenge("b", 11)) gain = gain.times(20)
	if (hasChallenge("c", 11)) gain = gain.times(100)
	if (inChallenge("f", 11)) gain = gain.div(1e6)
	if (inChallenge("b", 11)) gain = gain.pow(0.75)
	if (inChallenge("c", 11)) gain = gain.div(100)
	if (hasAchievement("a", 11)) gain = gain.times(1.5)
	if (hasAchievement("a", 12)) gain = gain.times(1.5)
	if (hasAchievement("a", 13)) gain = gain.times(2)
	if (hasAchievement("a", 14)) gain = gain.times(2)
	if (hasAchievement("a", 15)) gain = gain.times(3)
	if (hasAchievement("a", 21)) gain = gain.times(3)
	if (hasAchievement("a", 22)) gain = gain.times(3)
	if (hasAchievement("a", 23)) gain = gain.times(5)
	if (hasAchievement("a", 24)) gain = gain.times(5)
	if (hasAchievement("a", 25)) gain = gain.times(10)
	if (hasAchievement("a", 31)) gain = gain.times(10)
	if (hasAchievement("a", 32)) gain = gain.times(10)
	if (hasAchievement("a", 33)) gain = gain.times(20)
	if (hasAchievement("a", 34)) gain = gain.times(20)
	if (hasAchievement("a", 35)) gain = gain.times(50)
	if (hasAchievement("a", 41)) gain = gain.times(50)
	if (hasAchievement("a", 42)) gain = gain.times(50)
	if (hasAchievement("a", 43)) gain = gain.times(100)
	if (hasAchievement("a", 44)) gain = gain.times(100)
	if (hasAchievement("a", 45)) gain = gain.times(200)
	if (hasAchievement("a", 51)) gain = gain.times(200)
	if (hasAchievement("a", 52)) gain = gain.times(200)
	if (hasAchievement("a", 53)) gain = gain.times(500)
	if (hasAchievement("a", 54)) gain = gain.times(500)
	if (hasAchievement("a", 55)) gain = gain.times(1000)

	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	function() { if (!hasUpgrade("h", 11)) return "A spore germinates on the forest floor. Open <b>Hyphae</b> — the first upgrade is free." },
	function() { if (inChallenge("f", 11) || inChallenge("b", 11) || inChallenge("c", 11)) return "You are inside a challenge — the forest floor is hostile." },
]

// Determines when the game "ends"
function isEndgame() {
	return player.z.points.gte(25)
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {
	"background-color": "#12160c",
}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}
