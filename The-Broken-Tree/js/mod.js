let modInfo = {
	name: "The Broken Tree",
	id: "the-broken-tree-2ghcou", // savefile key — set once, NEVER change
	author: "AI",
	pointsName: "points",
	modFiles: ["layers.js", "layers_zoo.js", "layers_ruins.js", "layers_sabotage.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(10),
	offlineLimit: 1e9, // exhibit T2 needs an uncapped offTime; maxTickLength is the real valve
}

let VERSION = {
	num: "0.1",
	name: "Museum build",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1</h3><br>
		- Opened the museum. 28 exhibits, one control room, zero respect for the engine.`

let winText = `You observed every specimen. The tree is still broken, the engine is still standing. (Any single NaN or uncaught exception would have ended the session — that is the report.)`

var doNotCallTheseFunctionsEveryTick = ["armExhibit", "disarmAll", "armClick", "markObserved", "buildMuseumPanel"]

function getStartPoints() {
	return new Decimal(modInfo.initialStartPoints)
}

function canGenPoints() {
	return true
}

function getPointGen() {
	let gain = new Decimal(100)
	if (hasUpgrade("p", 11)) gain = gain.times(2)
	if (hasUpgrade("p", 12)) gain = gain.times(5)
	if (hasUpgrade("p", 13)) gain = gain.times(25)
	// Ouroboros (C2) dream quota: a fresh rebuild must reach the goal in seconds
	if (inChallenge("c", 12)) gain = gain.times("1e18")
	// T2: a points-powered zone — polynomial alone, but multiply by an offline-scale diff and it runs away
	if (armed("T2")) gain = gain.times(player.points.add(1).pow(0.6))
	return gain
}

// ---------- Fuse system ----------
// Every detonatable exhibit lives on a timestamp: player.m.arm[id] = Date.now() + fuse.
// armed() reads absolute time, so pathology self-heals even across a reload.

function armExhibit(id, ms) {
	player.m.arm[id] = Date.now() + ms
	player.m.observed[id] = true
}

function armed(id) {
	return player.m.arm[id] !== undefined && Date.now() < player.m.arm[id]
}

function armRemaining(id) {
	if (player.m.arm[id] === undefined) return 0
	return Math.max(0, (player.m.arm[id] - Date.now()) / 1000)
}

function disarmAll() {
	player.m.arm = {}
	player.points = new Decimal(10)
	for (let L of ["n", "g", "r", "gh", "wall", "s", "t", "c", "v"]) player[L].points = new Decimal(0)
	player.timePlayed = 0
	player.offTime = undefined
	player.hasNaN = false
	player.m.panicCount++
}

// One-shot writes + expiry cleanup for exhibits whose junk state must not persist forever.
var EXHIBIT_ONCLICK = {
	Z1() { player.points = new Decimal(0).div(new Decimal(0)) },
	Z2() { player.points = new Decimal(Infinity) },
	Z3() { player.n.points = new Decimal(-100) },
	Z4() { player.points = new Decimal("the tree is lying") },
	Z5() { player.n.lab5 = Decimal.pow(10, -1e9).toString() },
	Z6() { player.n.lab6 = new Decimal(Infinity).div(new Decimal(Infinity)).toString() },
	S1() { player.s.loop = {}; player.s.loop.self = player.s.loop },
	S2() { player.s.blob = new Array(6e6 + 1).join("X") },
	S3() { player.s.box = new Decimal(Infinity) },
	S4() { player.s.fn = function () { return 42 } },
	T1() { player.timePlayed = -1e6 },
	T2() { player.offTime = { remain: 3.6e8 } },
}

var EXHIBIT_CLEANUP = {
	S1() { player.s.loop = null },
	S2() { player.s.blob = "" },
	S3() { player.s.box = new Decimal(0) },
	S4() { player.s.fn = null },
	Z3() { player.n.points = new Decimal(0) },
	T1() { player.timePlayed = 0 },
	T2() { player.offTime = undefined },
}

// The exhibit registry: id, wing layer, fuse seconds (0 = always-on passive exhibit), label, mechanism.
var EXHIBITS = [
	{ id: "Z1", wing: "n", fuse: 8, label: "0/0 Gun", mech: "points := 0/0 → NaN (break_eternity division by zero is NaN, not Infinity)" },
	{ id: "Z2", wing: "n", fuse: 15, label: "Infinity Well", mech: "points := Infinity — sticky; one prestige turns it into NaN (inf.pow(0.5))" },
	{ id: "Z3", wing: "n", fuse: 15, label: "Negative Zone", mech: "specimens := -100 (this layer has no passive gen, so no max(0) clamp), Sqrt Lens displays (-100)^0.5" },
	{ id: "Z4", wing: "n", fuse: 8, label: "Parse Injection", mech: "points := new Decimal(\"the tree is lying\") — a parse NaN (sign=1,layer=3,mag=NaN) that engine arithmetic LAUNDERS back to finite within one tick, unlike the all-NaN 0/0 shape" },
	{ id: "Z5", wing: "n", fuse: 15, label: "Underflow Ray", mech: "lab readout := 10^-1,000,000,000" },
	{ id: "Z6", wing: "n", fuse: 15, label: "Exotic Division", mech: "lab readout := Infinity/Infinity — a layer-4 negative-mag artifact" },
	{ id: "G1", wing: "g", fuse: 25, label: "Σ Self-Exp 1.5", mech: "three independent (g+1)^0.5 self-loop zones sum to exponent 1.5 in the gain" },
	{ id: "G2", wing: "g", fuse: 15, label: "Cap-in-Gen", mech: "a softcap CAP value (×1e15) wired directly into the gain" },
	{ id: "G3", wing: "g", fuse: 20, label: "Requires Inversion", mech: "requires := max(1, 1e6/points) — canReset is always true, prestige is free" },
	{ id: "G4", wing: "g", fuse: 8, label: "Decimal passiveGeneration", mech: "passiveGeneration() returns new Decimal(\"ee9\"); the engine's diff*pg numeric multiply coerces via valueOf() → NaN. Small Decimals (like 3) silently WORK — a subtle stock trap" },
	{ id: "G5", wing: "g", fuse: 15, label: "Bool Lens", mech: "displays new Decimal(true) — the boolean passiveGeneration idiom silently evaluates to zero" },
	{ id: "G6", wing: "g", fuse: 20, label: "Exponent Inflation", mech: "prestige exponent 0.5 → 1.2 while armed; gain grows as points^1.2" },
	{ id: "R1", wing: "gh", fuse: 0, label: "Ghost Layer", mech: "tabFormat = [\"upgrades\"] — a 1-element content array; the row renderer ignores it and the whole tab is empty" },
	{ id: "R2", wing: "wall", fuse: 12, label: "1200-Upgrade Wall", mech: "a layer with 1200 upgrades exists only while the fuse burns; open its tab and hold on" },
	{ id: "R3", wing: "r", fuse: 0, label: "Unknown Component", mech: "the r tab contains a component that does not exist in the engine" },
	{ id: "R4", wing: "r", fuse: 20, label: "Mega Name", mech: "the r node's name becomes 260+ characters of mixed RTL, emoji and stars" },
	{ id: "R5", wing: "r", fuse: 0, label: "6-Deep Microtabs", mech: "six nested levels of microtabs (control specimen)" },
	{ id: "R6", wing: "r", fuse: 0, label: "HTML Injection", mech: "upgrade text and an infobox body contain an <img onerror> marker; check window.__BT_XSS / __BT_XSS2" },
	{ id: "S1", wing: "s", fuse: 8, label: "Circular Reference", mech: "player.s.loop references itself; NaNcheck recurses into plain objects every tick" },
	{ id: "S2", wing: "s", fuse: 20, label: "Quota Bomb", mech: "a 6 MB string in player state; localStorage.setItem hits the ~5 MB quota" },
	{ id: "S3", wing: "s", fuse: 30, label: "Infinity Round-Trip", mech: "writes Infinity to s.box; wait for autosave, reload, and read the box again" },
	{ id: "S4", wing: "s", fuse: 15, label: "Function in Player", mech: "a live function is stored in player state (control specimen)" },
	{ id: "T1", wing: "t", fuse: 20, label: "Time Travel", mech: "timePlayed := -1,000,000 seconds; Log Lens displays log10 of it" },
	{ id: "T2", wing: "t", fuse: 20, label: "Offline Bomb", mech: "offTime.remain := 100,000 hours AND maxTickLength lifted to 1e12 s for one fused tick window" },
	{ id: "T3", wing: "t", fuse: 15, label: "Reset Storm", mech: "t.update() calls doReset(\"p\") every single tick while armed" },
	{ id: "C1", wing: "c", fuse: 20, label: "Recursive Purchase", mech: "arm, then buy the Recursion Coil: buy() calls buy() on itself, cost 0, until the stack dies" },
	{ id: "C2", wing: "c", fuse: 0, label: "Self-Amplifying Challenge", mech: "each Ouroboros completion adds +0.08 to this layer's own prestige exponent" },
	{ id: "C3", wing: "c", fuse: 0, label: "Unlock-Dead Chain", mech: "c-21 claims to unlock the Vault but has no onPurchase; c-22 is the correctly-wired cure" },
]

function armClick(id) {
	const EX = EXHIBITS.find(e => e.id === id)
	armExhibit(id, EX.fuse * 1000)
	if (EXHIBIT_ONCLICK[id]) EXHIBIT_ONCLICK[id]()
}

function markObserved(id) {
	player.m.observed[id] = true
}

// The stock "clickables" component addresses clickables as row*10+col (numeric grid ids only),
// so string-keyed exhibits are invisible to it — the detonation panel is a raw-html grid instead.
function buildMuseumPanel() {
	const cells = EXHIBITS.map(EX => {
		const action = EX.fuse === 0 ? `markObserved("${EX.id}")` : `armClick("${EX.id}")`
		const label = EX.fuse === 0 ? "ALWAYS ON — mark observed" : "ARM — " + EX.fuse + "s fuse"
		return "<td style='padding:3px'><button onclick=\"" + action + "\" style='cursor:pointer;padding:6px 8px;background:#202020;color:#eee;border:1px solid #666;border-radius:4px;min-width:150px;min-height:52px'>" +
			"<b>[" + EX.id + "]</b> " + EX.label + "<br><span style='opacity:0.75'>" + label + "</span></button></td>"
	})
	const rows = []
	for (let i = 0; i < cells.length; i += 3) rows.push("<tr>" + cells.slice(i, i + 3).join("") + "</tr>")
	rows.push("<tr><td colspan='3' style='padding:6px'><button onclick='disarmAll()' style='cursor:pointer;padding:8px 14px;background:#7a2020;color:#fff;border:1px solid #a33;border-radius:4px'><b>🧯 PANIC</b> — disarm everything, restore points to 10 and all exhibit currencies to 0 (cures sticky Infinity and runaways)</button></td></tr>")
	return "<table style='max-width:900px'>" + rows.join("") + "</table>"
}

// ---------- mod-level helpers ----------

function isEndgame() {
	return player.m !== undefined && player.m.observed !== undefined && Object.keys(player.m.observed).length >= EXHIBITS.length
}

var displayThings = [
	function () {
		let active = []
		for (let id in player.m.arm) if (Date.now() < player.m.arm[id]) active.push(id)
		let seen = Object.keys(player.m.observed).length
		if (active.length) return "⚠ DETONATED: " + active.join(", ") + " — observed " + seen + "/" + EXHIBITS.length
		return "All specimens dormant — open the Museum (M) to arm exhibits. Observed " + seen + "/" + EXHIBITS.length
	},
]

function addedPlayerData() { return {} }

var backgroundStyle = {
}

function maxTickLength() {
	return armed("T2") ? 1e12 : 3600
}

function fixOldSave(oldVersion) {
}
