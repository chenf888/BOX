let modInfo = {
	name: "The Truth Tower",
    id: "the-truth-tower-mewus1",  // savefile key — set once, NEVER change (changing it erases all saves)
	author: "chenf888",
	pointsName: "Truth",
	modFiles: ["tuning.js", "layers/truth_layer.js", "layers/achievements.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal("1e-64"), // The whole game starts below 10^-64
	offlineLimit: 1,  // In hours
	// The game STARTS at 1e-64, far below format()'s 1e-4 cutoff. Without this
	// every Truth display reads "0.00" for the whole early game.
	allowSmall: true,
}

// Set your version in num and name
var VERSION = {
	num: "0.2",
	name: "The First Axiom",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.2 — The 100-Hour Tuning</h3><br>
		- Rate architecture rebuilt: every multiplier O(1), total growth ~x20, paced by the cost stairs.<br>
		- Self-amplifying term removed (measured to detonate the run at 28 s — see design-brief §11).<br>
		- 72 milestones on explicit per-era thresholds; all six automation steps now really toggle.<br>
		- Ascension rungs re-priced past the Infinity ladder; each applies its layer jump once.<br>
		- Simulated playthrough: 99.8 h to F11, first boost at 9.5 s.<br>
	<h3>v0.1 — The First Axiom</h3><br>
		- Four nested loops inside a single layer: Axioms (tick), Proofs (click), Transcendence (board), Infinity (passive).<br>
		- 300 upgrades, 60 milestones, 30 buyable ladders, 24 challenges, 200 achievements.<br>
		- The span runs from 10^-64 to F11 = 10^10^10^10^10^10^11.<br>
		- Bilingual EN / 中文.`

// NOTE: this string must be STATIC. Interpolating format(player.t.points) here
// evaluates it at mod.js load time, when neither `player` nor `format()` exists
// yet — the throw aborts the rest of mod.js's top level (including TRUTH_F11),
// isEndgame() then compares against undefined, returns true on the first tick,
// and the game boots straight into the "Play Again" screen. Found by browser
// testing, not by static checks — the win screen looked like a "loading" hang.
let winText = `<h1>你证明了 F₁₁。</h1><br>You have proved F₁₁.<br><br>
	<div style="font-size: 14px; line-height: 1.6;">
	F₁₁ = 10^10^10^10^10^10^11 — six tens, topped with eleven.<br>
	Your final Truth stands in the Statistics tab.<br><br>
	The deduction log is yours. <i>keepGoing()</i> to keep building past the last rung.
	</div>`

// Every custom action-function defined inside a layer must be listed here, or TMT will call it
// every tick (~20x/sec). Engine hooks (onClick, buy, doReset, ...) are exempt automatically.
var doNotCallTheseFunctionsEveryTick = [
	"advanceProofRun",    // era II: tick the proof run forward
	"assembleSymbol",     // era III: one board placement
	"resolveBoard",       // era III: settle a completed board
	"claimTranscendence", // era IV: buy a transcendence rung
]

// ---------------------------------------------------------------------------
// Bilingual helper (P17). Every user-facing string goes through this so the
// whole game flips language from the options menu.
// ---------------------------------------------------------------------------
window.chinesemode = false

function t(en, zh) {
	return window.chinesemode ? zh : en
}

// ---------------------------------------------------------------------------
// Number helpers
// ---------------------------------------------------------------------------

/**
 * Right-associative power tower of 10s, wrapped `depth` times around `top`.
 *
 *   truthTower(6, 11)  ->  10^10^10^10^10^10^11  =  F11
 *   truthTower(6, 10)  ->  10^10^10^10^10^10^10  =  F
 *
 * NOTE: this must WRAP. Writing `new Decimal(10).pow(10).pow(10)` does NOT build a
 * tower — `(10^10)^10 = 10^100` — it multiplies the exponents. Verified against the
 * vendored break_eternity.
 */
function truthTower(depth, top) {
	let ret = new Decimal(top)
	for (let i = 0; i < depth; i++) ret = new Decimal(10).pow(ret)
	return ret
}

var TRUTH_F = truthTower(6, 10)      // F  = eeeeee
var TRUTH_F11 = truthTower(6, 11)    // F11 = eeeeee11  (the endgame target)

// ---------------------------------------------------------------------------
// The economy, 2026-10-06 tuning pass (design-brief.md §11).
//
// RATE architecture: production = Truth × rate, where
//     rate = TUNING.baseRate × truthRateMult() × layers.t.gainMult()
// and EVERY multiplier stays O(1) — the whole game's multiplier growth is
// ~×20 from bottom (1e-64) to top (1e4500).
//
// Why: with no prestige resets (Q1/Q2) the total playtime is the integral
//     t = (k/ln10)/baseRate × (1 − 10^(−ΔL/k))
// over the ~4600-order climb, where 1/k = Σ ln(Gᵢ)/(ln10·ΔL) is the combined
// multiplier growth. Hitting 100h forces baseRate ≈ 0.0035 and total growth
// ≈ ×20. The previous self-amplifying term (T^0.5) was measured — in the
// browser — to detonate the game at 28 s, and ANY exponent big enough to
// matter does the same; one small enough not to is decoration. So there is
// NO self-term (N-SELFTOTAL passes with Σ = 0) and the cost stairs carry the
// pacing instead (handbook 11 §3: cost does the shaping).
//
// The era-IV ascension rungs are DISCRETE: buying a rung applies
// T = T.layeradd(add, 10) once (claimTranscendence, in the layer file) — the
// only mechanism that can cross into tower territory at all (brief D4).
// ---------------------------------------------------------------------------

function getStartPoints() {
    return new Decimal(modInfo.initialStartPoints)
}

// There is no second currency in this game: Truth lives entirely in layer `t`,
// so the engine's main-currency display stays off (canGenPoints() === false).
// Truth is produced by layers/t/truth_layer.js update() -> addPoints("t", ...).
function canGenPoints() {
	return false
}

/**
 * The engine's main-currency rate. This game has ONE currency and it lives in
 * layer `t`, so the engine's own point display stays off (canGenPoints() ===
 * false) and Truth is produced by the layer's update() -> addPoints("t", ...).
 *
 * This function still exists because the engine calls it every tick for
 * tmp.pointGen, and because the layer's update() reads it as the single source
 * of truth for "how much Truth per second right now" — so there is exactly one
 * definition of the economy, not two that can drift apart.
 */
function getPointGen() {
	if (!player.t || !player.t.unlocked) return new Decimal(0)
	return truthPerSecond()
}

/** Current Truth/second for layer `t`, mirroring exactly what update() grants. */
function truthPerSecond() {
	if (!player.t || !player.t.unlocked) return new Decimal(0)
	return player.t.points.mul(truthRate())
}

/** The current fractional rate: Truth grows by this FRACTION per second. */
function truthRate() {
	if (!player.t || !player.t.unlocked) return new Decimal(0)
	let rate = new Decimal(window.TUNING.baseRate)
	rate = rate.times(truthRateMult())
	rate = rate.times(layers.t.gainMult())
	// Trial handicaps are the only thing that ever DIVIDES the rate.
	if (inChallenge("t", 11) || inChallenge("t", 13) || inChallenge("t", 22) ||
	    inChallenge("t", 33) || inChallenge("t", 41) || inChallenge("t", 44)) rate = rate.div(4)
	if (inChallenge("t", 14) || inChallenge("t", 24) || inChallenge("t", 42)) rate = rate.div(10)
	return rate
}

/**
 * The era multiplier: milestones, achievements, trial rewards and the buyable
 * ladders. Data-driven from js/tuning.js so the tuning pass has ONE place to
 * turn every knob. Every value stays O(1); the product over the whole game is
// deliberately ~×20 (see the economy note above).
 */
function truthRateMult() {
	const TU = window.TUNING
	let m = 1

	// Milestones — the expanded table carries each grant's type and value.
	const MS = TU.expandMilestones()
	for (const id in MS) {
		const g = MS[id]
		if (g.type === "mult" && hasMilestone("t", +id)) m *= g.v
	}

	// Achievements (the five rate-wired ids; effect() display matches).
	for (const id in TU.achievementMults) {
		if (hasAchievement("ach", +id)) m *= TU.achievementMults[id]
	}

	// Trial rewards — applied once per cleared challenge, never while inside.
	for (const id in TU.challengeRewards) {
		if (hasChallenge("t", +id)) m *= TU.challengeRewards[id]
	}

	// Buyable ladders: each family contributes (1 + owned × ladderRatePer), so
	// a family buyable's displayed effect is exactly what this applies.
	for (const L of TU.ladders) {
		m *= 1 + getBuyableAmount("t", L.id).toNumber() * TU.ladderRatePer
	}

	return m
}

/** Startup floor. Applied by the layer's update() on a brand-new save. */
function truthFloor() {
	return new Decimal("1e-64")
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	truthBest: new Decimal("1e-64"),
	proofSparks: new Decimal(0),
	transcendenceCharge: new Decimal(0),
	boardSolved: 0,
	erasSeen: 0,
}}

// Display extra things at the top of the page
var displayThings = [
	function() {
		if (!player.t || !player.t.unlocked) return
		let span = player.t.points.slog(10).sub(new Decimal("1e-64").slog(10))
		return t(
			`<span style="color:#c9a227">Truth ${format(player.t.points)}</span> — ` +
			`slog span ${format(span)} of 8.02 &nbsp;|&nbsp; F11 at ${format(TRUTH_F11)}`,
			`<span style="color:#c9a227">真值 ${format(player.t.points)}</span> — ` +
			`slog 跨度 ${format(span)} / 8.02 &nbsp;|&nbsp; F11 = ${format(TRUTH_F11)}`
		)
	},
	function() {
		if (!player.t || !player.t.unlocked) return
		if (player.t.points.lt(new Decimal("1e200"))) return
		if (inChallenge("t", 11)) return t(
			`<span style="color:#ff6b6b">A trial is running — handicaps are active.</span>`,
			`<span style="color:#ff6b6b">挑战进行中 —— 惩罚已生效。</span>`
		)
	},
]

// Determines when the game "ends"
function isEndgame() {
	return player.t.points.gte(TRUTH_F11)
}

// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {
	'background-color': "#0b0a12",
}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}