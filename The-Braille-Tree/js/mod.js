/* =========================================================================
 *  盲文之树 · The Braille Tree  —  js/mod.js
 *
 *  The economy root. The base currency is 触感 (touch): the raw sensation of
 *  fingertips on paper. The first layer turns 触感 into 指感 (finger-sense),
 *  then the two dot boards turn 指感 into 六点/八点 characters.
 *
 *  Language: T3 — four complete packs (zh / en / brl-zh / brl-en), loaded from
 *  js/lang/ BEFORE this file. Every user-facing string is a t() call.
 * ========================================================================= */

let modInfo = {
	name: "盲文之树 · The Braille Tree",
	id: "the-braille-tree-v83pqm",   // savefile key — set once, NEVER change
	author: "TMT GG",
	pointsName: t("game.pointsName", "触感"),
	modFiles: [
		"tuning.js",                 // FIRST: every pacing constant (design-brief §9 #18/#21)
		"layers/touch.js",
		"layers/six.js",
		"layers/eight.js",
		"layers/slate.js",
		"layers/contracted.js",
		"layers/nemeth.js",
		"layers/music.js",
		"layers/words.js",
		"layers/passages.js",
		"layers/library.js",
		"layers/side.js",
		"tree.js",
	],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(10),   // one first reset plus the first upgrade (author: first boost < 10 s)
	offlineLimit: 1,                       // hours
	allowSmall: true,                      // some effect ratios dip below 1e-4 (F1)
}

let VERSION = {
	num: "0.1",
	name: t("version.name", "六点初识"),
}

let changelog = `<h1>${t("log.title", "更新 / Changelog")}</h1><br>
	<h3>v0.1</h3><br>
		${t("log.v1", "第一版：触感 → 六点/八点盲文 → 盲文纸 → 缩写/数学/音乐 → 词语/篇章 → 藏书楼。两块 2×3 / 2×4 点阵板，四种显示语言。")}`

/* The engine reads winText as a VALUE (js/utils/save.js setupModInfo). It is
 * evaluated at load time; setGameLang() reloads the page, so switching the
 * language re-evaluates it in the new mode. */
let winText = `<h2>${t("win.title", "藏书楼满")}</h2><br>${t("win.body", "万卷皆可摸读。你从指尖的一点触感开始，读完了六点、八点、缩写、数学与音乐，最终把整座藏书楼收进掌纹里。")}<br><br><b>盲文之树 · The Braille Tree</b>`

/* Every mutator lives at FILE SCOPE in the layer files (the engine only re-runs
 * functions that sit inside `layers`). Official hooks (onClick, buy, update,
 * onPrestige, ...) are already exempt. */
var doNotCallTheseFunctionsEveryTick = []

function getStartPoints() {
	return new Decimal(modInfo.initialStartPoints)
}

function canGenPoints() {
	return true
}

/* ---------------------------------------------------------------------------
 *  Global multiplier helpers. They are file-scope so every layer file can call
 *  them, and so the wiring is visible in one place (handbook 11 §2).
 * ------------------------------------------------------------------------- */

function achievementBoost() {
	let ret = new Decimal(1)
	if (typeof layers === "undefined" || !layers.ach || !layers.ach.achievements) return ret
	for (let id in layers.ach.achievements) {
		let a = layers.ach.achievements[id]
		if (a && typeof a.effect === "function" && hasAchievement("ach", id)) {
			try { ret = ret.times(a.effect()) } catch (e) { /* ignore a half-built layer */ }
		}
	}
	return ret
}

function touchMult() {
	let ret = new Decimal(1)
	if (hasUpgrade("touch", 11)) ret = ret.times(TUNING.MULT.touch[11])
	if (hasUpgrade("touch", 12)) ret = ret.times(player.touch.points.add(10).log10().add(1).pow(1.5))
	if (hasUpgrade("touch", 13)) ret = ret.times(TUNING.MULT.touch[13])
	if (hasUpgrade("touch", 14)) ret = ret.times(player.slate.points.add(10).log10())
	if (hasUpgrade("touch", 21)) ret = ret.times(player.touch.senseLevel + 1)
	if (hasUpgrade("touch", 22)) ret = ret.times(TUNING.MULT.touch[22])
	if (hasUpgrade("touch", 24) && player.touch.sensitivity >= 50) ret = ret.times(TUNING.MULT.touch[24])
	if (hasUpgrade("touch", 31)) ret = ret.times(new Decimal(player.six.learned + 1).pow(0.25))
	if (hasUpgrade("touch", 32)) ret = ret.times(player.words.points.add(10).log10().add(1).pow(1.5))
	if (hasUpgrade("touch", 33)) ret = ret.times(TUNING.MULT.touch[33])
	if (getBuyableAmount("touch", 11).gt(0)) ret = ret.times(buyableEffect("touch", 11))

	if (hasMilestone("touch", 0)) ret = ret.times(2)
	if (hasMilestone("touch", 2)) ret = ret.times(2)
	if (hasMilestone("touch", 4)) ret = ret.times(3)

	if (hasUpgrade("six", 13)) ret = ret.times(new Decimal(player.six.learned + 1).pow(0.2))
	if (hasUpgrade("eight", 13)) ret = ret.times(new Decimal(player.eight.learned + 1).pow(0.2))
	if (hasUpgrade("slate", 13)) ret = ret.times(new Decimal(player.six.learned + player.eight.learned + 1).pow(0.15))
	if (hasUpgrade("contracted", 13)) ret = ret.times(new Decimal(player.six.learned + 1).pow(0.15))
	if (hasUpgrade("contracted", 23)) ret = ret.times(new Decimal(player.eight.learned + 1).pow(0.15))
	if (hasUpgrade("nemeth", 13)) ret = ret.times(new Decimal(player.eight.learned + 1).pow(0.15))
	if (hasUpgrade("music", 13)) ret = ret.times(new Decimal(player.eight.learned + 1).pow(0.15))
	if (hasUpgrade("words", 13)) ret = ret.times(new Decimal(player.six.learned + player.eight.learned + 1).pow(0.1))
	if (hasUpgrade("passages", 13)) ret = ret.times(player.words.points.add(1).pow(0.1))
	if (hasUpgrade("library", 13)) ret = ret.times(player.passages.points.add(1).pow(0.1))

	if (hasChallenge("contracted", 11)) ret = ret.times(2)
	if (hasMilestone("words", 2)) ret = ret.times(10)
	if (hasMilestone("passages", 1)) ret = ret.times(10)
	if (hasMilestone("library", 3)) ret = ret.times(10)

	ret = ret.times(achievementBoost())
	return ret
}

/* Prestige gain must NOT share the self-scaling production terms (u12/u14/u32):
 * gain = base^0.5 * gainMult, production = touchMult; sharing them makes the
 * loop gain = M^1.5 and detonates in seconds (measured in tools/simulate.js). */
function touchGainMult() {
	let ret = new Decimal(1)
	if (hasUpgrade("touch", 11)) ret = ret.times(TUNING.MULT.touch[11])
	if (hasUpgrade("touch", 13)) ret = ret.times(TUNING.MULT.touch[13])
	if (hasUpgrade("touch", 21)) ret = ret.times(player.touch.senseLevel + 1)
	if (hasUpgrade("touch", 22)) ret = ret.times(TUNING.MULT.touch[22])
	if (hasUpgrade("touch", 24) && player.touch.sensitivity >= 50) ret = ret.times(TUNING.MULT.touch[24])
	if (hasUpgrade("touch", 31)) ret = ret.times(new Decimal(player.six.learned + 1).pow(0.25))
	if (hasUpgrade("touch", 33)) ret = ret.times(TUNING.MULT.touch[33])
	if (getBuyableAmount("touch", 11).gt(0)) ret = ret.times(buyableEffect("touch", 11))

	if (hasMilestone("touch", 0)) ret = ret.times(2)
	if (hasMilestone("touch", 2)) ret = ret.times(2)
	if (hasMilestone("touch", 4)) ret = ret.times(3)

	if (hasUpgrade("six", 13)) ret = ret.times(new Decimal(player.six.learned + 1).pow(0.2))
	if (hasUpgrade("eight", 13)) ret = ret.times(new Decimal(player.eight.learned + 1).pow(0.2))
	if (hasUpgrade("slate", 13)) ret = ret.times(new Decimal(player.six.learned + player.eight.learned + 1).pow(0.15))
	if (hasUpgrade("contracted", 13)) ret = ret.times(new Decimal(player.six.learned + 1).pow(0.15))
	if (hasUpgrade("contracted", 23)) ret = ret.times(new Decimal(player.eight.learned + 1).pow(0.15))
	if (hasUpgrade("nemeth", 13)) ret = ret.times(new Decimal(player.eight.learned + 1).pow(0.15))
	if (hasUpgrade("music", 13)) ret = ret.times(new Decimal(player.eight.learned + 1).pow(0.15))
	if (hasUpgrade("words", 13)) ret = ret.times(new Decimal(player.six.learned + player.eight.learned + 1).pow(0.1))

	if (hasChallenge("contracted", 11)) ret = ret.times(2)
	if (hasMilestone("words", 2)) ret = ret.times(10)
	if (hasMilestone("passages", 1)) ret = ret.times(10)
	if (hasMilestone("library", 3)) ret = ret.times(10)

	ret = ret.times(achievementBoost())
	return ret
}

function rubMult() {
	let ret = new Decimal(1)
	if (hasUpgrade("touch", 13)) ret = ret.times(TUNING.MULT.touch[13])
	if (hasUpgrade("touch", 21)) ret = ret.times(player.touch.senseLevel + 1)
	if (hasMilestone("touch", 0)) ret = ret.times(2)
	if (inChallenge("contracted", 11)) ret = ret.times(0.1)
	ret = ret.times(achievementBoost())
	return ret
}

function paperRate() {
	let base = new Decimal(TUNING.PAPER.base)
	let self = player.slate.points.add(1).pow(TUNING.PAPER.selfExp)
	let touchFactor = player.touch.points.add(1).log10().add(1).pow(TUNING.PAPER.touchLogExp)
	let rate = base.times(self).times(touchFactor).times(slateRateMult())
	let cap = new Decimal(TUNING.SOFT.slate)
	if (hasUpgrade("slate", 23)) cap = new Decimal(TUNING.SOFT.slateRaise)
	if (rate.gte(cap)) rate = softcap(rate, cap, TUNING.SOFT_POWER)
	return rate
}

function sixGain() {
	if (inChallenge("contracted", 12)) return new Decimal(1)
	let base = new Decimal(1)
	base = base.add(Math.floor(Math.pow(player.six.learned + 1, 0.4) / 8))
	base = base.add(getBuyableAmount("six", 11).toNumber())
	if (hasUpgrade("six", 11)) base = base.add(upgradeEffect("six", 11))
	if (hasUpgrade("six", 14)) base = base.times(TUNING.MULT.six[14])
	if (hasUpgrade("six", 21)) base = base.times(upgradeEffect("six", 21))
	if (hasUpgrade("six", 22) && player.six.learned >= 32) base = base.times(3)
	if (hasUpgrade("six", 24)) base = base.times(upgradeEffect("six", 24))
	if (hasMilestone("six", 3)) base = base.times(2)
	if (hasChallenge("contracted", 12)) base = base.add(1)
	return base.floor().max(1)
}

function eightGain() {
	if (inChallenge("contracted", 12)) return new Decimal(1)
	let base = new Decimal(1)
	base = base.add(Math.floor(Math.pow(player.eight.learned + 1, 0.4) / 16))
	base = base.add(getBuyableAmount("eight", 11).toNumber())
	if (hasUpgrade("eight", 11)) base = base.add(upgradeEffect("eight", 11))
	if (hasUpgrade("eight", 14)) base = base.times(TUNING.MULT.eight[14])
	if (hasUpgrade("eight", 21)) base = base.times(upgradeEffect("eight", 21))
	if (hasUpgrade("eight", 22) && player.eight.learned >= 128) base = base.times(3)
	if (hasUpgrade("eight", 24)) base = base.times(upgradeEffect("eight", 24))
	if (hasMilestone("eight", 1)) base = base.times(2)
	if (hasMilestone("eight", 2)) base = base.times(2)
	if (hasMilestone("eight", 3)) base = base.times(2)
	if (hasChallenge("contracted", 12)) base = base.add(1)
	return base.floor().max(1)
}

function wordsRate() {
	let base = new Decimal(TUNING.WORDS_TRICKLE)
	let self = player.words.points.add(1).pow(0.05)
	let rate = base.times(self).times(wordsRateMult())
	let cap = new Decimal(TUNING.SOFT.words)
	if (hasUpgrade("words", 23) || hasUpgrade("nemeth", 23)) cap = new Decimal(TUNING.SOFT.wordsRaise)
	if (rate.gte(cap)) rate = softcap(rate, cap, TUNING.SOFT_POWER)
	return rate
}

function libraryRate() {
	let base = new Decimal(TUNING.LIBRARY_TRICKLE)
	let self = player.library.points.add(1).pow(0.05)
	let rate = base.times(self).times(libraryGainMult())
	let cap = new Decimal(TUNING.SOFT.library)
	if (hasUpgrade("library", 23)) cap = new Decimal(TUNING.SOFT.libraryRaise)
	if (rate.gte(cap)) rate = softcap(rate, cap, TUNING.SOFT_POWER)
	return rate
}

/* ---------------------------------------------------------------------------
 *  Base production
 * ------------------------------------------------------------------------- */
function getPointGen() {
	if (!canGenPoints()) return new Decimal(0)
	let gain = new Decimal(1).times(touchMult())
	let cap = new Decimal(TUNING.SOFT.touch)
	if (hasUpgrade("touch", 23)) cap = new Decimal(TUNING.SOFT.touchRaise)
	if (gain.gte(cap)) gain = softcap(gain, cap, TUNING.SOFT_POWER)
	return gain.max(0)
}

/* ---------------------------------------------------------------------------
 *  Localized chrome — replaces the stock main-display / resource-display, both
 *  of which hard-code English "You have" / "(x/sec)" (07 Part F7 / N-MAINSTR).
 * ------------------------------------------------------------------------- */
function mainAmount(layer, withRate) {
	let col = layers[layer].color || "#ffffff"
	let out = '<div style="font-size:42px;color:' + col + ';text-shadow:0 0 10px ' + col + '">'
		+ num(player[layer].points) + '</div>'
	out += '<div style="font-size:16px;opacity:.85">' + tmp[layer].resource + '</div>'
	if (withRate) {
		let rate = null
		if (layer === "slate") rate = paperRate()
		else if (layer === "words") rate = wordsRate()
		else if (layer === "library") rate = libraryRate()
		else if (tmp[layer].passiveGeneration) rate = tmp[layer].resetGain.times(tmp[layer].passiveGeneration)
		if (rate) out += '<div style="font-size:14px;opacity:.6">+ ' + num(rate) + ' / ' + t("ui.perSec") + '</div>'
	}
	return out
}

/* ---------------------------------------------------------------------------
 *  Endgame
 * ------------------------------------------------------------------------- */
function isEndgame() {
	return player.library.points.gte(1000)
}

function addedPlayerData() {
	return {}
}

var displayThings = [
	function () {
		let mode = LANG_MODES.filter(function (m) { return m.code === LANG_PREF })[0]
		return '<span style="opacity:.55">' + t("ui.lang") + ': ' + (mode ? mode.label : LANG_PREF) + '</span>'
	},
]

/* ---------------------------------------------------------------------------
 *  Cosmetics and engine hooks
 * ------------------------------------------------------------------------- */
var backgroundStyle = {
	"background-color": "#15110d",
	"background-image": "radial-gradient(circle at 50% 20%, #2a2118 0%, #15110d 60%)",
}

function maxTickLength() {
	return 3600
}

/* Never hard-reset the player (handbook 12 §1.4). */
function fixOldSave(oldVersion) {
}
