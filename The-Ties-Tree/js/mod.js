/* =========================================================================
 *  交情 / Ties  —  mod.js
 *  The economy root. Every user-facing string goes through t(), the polyglot
 *  string layer loaded from js/lang/index.js.
 * ========================================================================= */

let modInfo = {
	name: t("game.name", "交情 · Ties"),
	author: "TMT Skill",
	id: "ties-ycsj8e",           // permanent — keys the savefile. never change.
	pointsName: t("game.pointsName", "话头"),
	modFiles: [
		"layers/chat.js",
		"layers/familiar.js",
		"layers/trust.js",
		"layers/closer.js",
		"layers/circle.js",
		"layers/side.js",
		"tree.js"
	],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(10),   // one prestige plus the first upgrade
	offlineLimit: 1,                       // hours
}

let VERSION = {
	num: "0.1",
	name: "第一次寒暄",
}

let changelog = `<h1>${t("log.title")}</h1><br>
	<h3>v0.1</h3><br>
		${t("log.v1")}<br>`

let winText = `<h2>${t("win.title")}</h2><br>${t("win.body")}`

/* Custom action-functions invented inside layers. Every function living in
 * `layers` is re-run by the engine ~20x/sec to fill `tmp`; anything that
 * MUTATES state must be listed here. Official hooks (onClick, buy,
 * onPurchase, update, ...) are already exempt. */
var doNotCallTheseFunctionsEveryTick = [
	"readMindNewRun",   // re-rolls the correct answer for the minigame
]

function getStartPoints() {
	return new Decimal(modInfo.initialStartPoints)
}

function canGenPoints() {
	return true
}

/* ---------------------------------------------------------------------------
 *  话头 / talk — the base currency. Started by clicking 搭话 and kept flowing
 *  by 寒暄. Every bonus in the game that reaches the base currency is here.
 * ------------------------------------------------------------------------- */
function getPointGen() {
	if (!canGenPoints()) return new Decimal(0)

	let gain = new Decimal(1)

	// --- chat upgrades: flat multipliers --------------------------------
	if (hasUpgrade("chat", 11)) gain = gain.times(3)
	if (hasUpgrade("chat", 12)) gain = gain.times(10)
	if (hasUpgrade("chat", 13)) gain = gain.times(40)
	if (hasUpgrade("chat", 14)) gain = gain.times(150)
	if (hasUpgrade("chat", 23)) gain = gain.times(800)
	if (hasUpgrade("chat", 35)) gain = gain.times(1e4)

	// --- shaped multipliers (K2/K3). Log-shaped on the base currency, so
	//     they grow smoothly and never compound into a runaway.
	if (hasUpgrade("chat", 21)) gain = gain.times(upgradeEffect("chat", 21))
	if (hasUpgrade("chat", 22)) gain = gain.times(upgradeEffect("chat", 22))
	if (hasUpgrade("chat", 31)) gain = gain.times(upgradeEffect("chat", 31))

	// --- 寒暄 milestones -------------------------------------------------
	if (hasMilestone("chat", 0)) gain = gain.times(2.5)
	if (hasMilestone("chat", 1)) gain = gain.times(3)

	// K6 conditional: a conversation already running goes better than a cold start
	if (hasUpgrade("chat", 33) && player.chat.best.gte(1000)) gain = gain.times(3)

	// --- higher layers reach back down (P10 web) ------------------------
	if (hasUpgrade("familiar", 11)) gain = gain.times(4)
	if (hasUpgrade("familiar", 21)) gain = gain.times(upgradeEffect("familiar", 21))
	if (hasMilestone("familiar", 2)) gain = gain.times(3)

	if (hasUpgrade("trust", 11)) gain = gain.times(6)
	if (hasUpgrade("trust", 21)) gain = gain.times(upgradeEffect("trust", 21))
	if (hasMilestone("trust", 2)) gain = gain.times(4)

	if (hasUpgrade("closer", 11)) gain = gain.times(8)
	if (hasMilestone("closer", 2)) gain = gain.times(5)

	if (hasUpgrade("circle", 11)) gain = gain.times(12)
	if (hasMilestone("circle", 2)) gain = gain.times(10)

	// --- achievements (P11 alternate path) ------------------------------
	if (hasAchievement("achievements", 11)) gain = gain.times(3)
	if (hasAchievement("achievements", 22)) gain = gain.times(5)
	if (hasAchievement("achievements", 33)) gain = gain.times(8)

	// --- challenges already beaten --------------------------------------
	if (hasChallenge("chat", 11)) gain = gain.times(2)
	if (hasChallenge("trust", 11)) gain = gain.times(3)

	// --- 倾听 : listening is worth a fifth more --------------------------
	if (player.chat.listening) gain = gain.times(1.5)

	return gain
}

function addedPlayerData() {
	return {}
}

/* Lines at the top of the tree page. */
var displayThings = [
	function () {
		if (!player.circle.unlocked) return undefined
		return t("disp.dunbar") + " <b>" + formatWhole(player.circle.points) + "</b> / 150"
			+ " <span style='opacity:.6'>" + t("disp.dunbar.hint") + "</span>"
	},
	function () {
		if (player.circle.unlocked && player.circle.drift.gte(0.5))
			return "<span style='color:#e0716f'>" + t("disp.drift") + " " + format(player.circle.drift, 2) + "</span>"
		return undefined
	},
	function () {
		if (typeof LANG_PREF !== "undefined" && LANG_PREF === "mixed")
			return "<span style='opacity:.55'>" + t("disp.lang") + " 🌐</span>"
		return undefined
	},
]

/* The win is the ceiling itself: the circle filled to Dunbar's number. */
function isEndgame() {
	return player.circle.unlocked && player.circle.points.gte(150)
}

/* The engine's own main-display hard-codes the English words "You have" /
 * "(x/sec)", which cannot be translated without editing engine files. Every
 * main layer uses this instead, so Chinese mode is Chinese all the way down. */
function mainAmount(layer, withRate) {
	let col = layers[layer].color || "#ffffff"
	let out = '<div style="font-size:42px;color:' + col + '">' + format(player[layer].points) + '</div>'
	if (withRate) out += '<div style="font-size:15px;opacity:.65">' + t("common.perSec") + '</div>'
	out += '<div style="font-size:15px;opacity:.65">' + layers[layer].resource + '</div>'
	return out
}

/* ---- cosmetics ---- */

var backgroundStyle = {
	"background-color": "#10131a",
}

function maxTickLength() {
	return 3600
}

/* Never hard-reset the player (handbook 12 §1.4). Nothing to migrate at 0.1. */
function fixOldSave(oldVersion) {
}
