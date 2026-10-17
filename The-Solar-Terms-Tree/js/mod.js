/* =========================================================================
 *  节气树 · 七十二候  —  js/mod.js
 *
 *  The economy root. The base currency is 日影 (sun-shadow): the solar terms
 *  were read off a gnomon's shadow, so that is what the player accumulates
 *  before any 节 exists.
 *
 *  Language: T2 (design-brief §1) — window.LANG_DEFAULT declares the mode and
 *  every user-facing string is a function returning a zh() ternary. No stock
 *  main-display / resource-display is rendered anywhere (both hard-code the
 *  English words "You have" / "(x/sec)" — 07 Part F7), so each layer tab uses
 *  mainAmount() below instead.
 * ========================================================================= */

window.LANG_DEFAULT = "zh"   // 中 by default; the 设置 side layer toggles player.lang

let modInfo = {
	name: "节气树 · 七十二候",
	id: "the-solar-terms-tree-dfzirm",   // savefile key — set once, NEVER change
	author: "TMT GG",
	pointsName: "日影",
	modFiles: [
		"tuning.js",                 // FIRST: every pacing constant (design-brief §12)
		"layers/lichun.js",
		"layers/chunfen.js",
		"layers/almanac.js",
		"layers/lixia.js",
		"layers/xiazhi.js",
		"layers/liqiu.js",
		"layers/qiufen.js",
		"layers/lidong.js",
		"layers/dongzhi.js",
		"layers/sui.js",
		"layers/side.js",
		"tree.js",
	],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(10),   // one 交节 plus the first 候 (author: first boost < 10s)
	offlineLimit: 1,                       // hours
	allowSmall: true,                      // the 候簿 buyable can dip below 1e-4 at x1.12 steps (F1)
}

let VERSION = {
	num: "0.1",
	name: "立春",
}

let changelog = `<h1>Changelog / 更新</h1><br>
	<h3>v0.1</h3><br>
		- 八节为脊、七十二候为内容的第一版：立春 → 春分 → 立夏 → 夏至 → 立秋 → 秋分 → 立冬 → 冬至 → 岁，共 10 个主节点。<br>
		- 立圭表·测日影（小游戏）、雨量/仓廪/数九（进度条）、历书市集与七十二候图、岁祭与八节试。<br>
		- First build: the eight 节 as the spine, the 72 pentads as the content, the almanac
		  shop, the 72-tile pentad chart, and the year's 8 score-attack trials.`

let winText = `七十二候尽，二十四气周。<br>圭表无影可测，历法无岁可推——岁功成。<br><br>
	All seventy-two pentads observed, the twenty-four terms complete. The gnomon has no shadow left to measure and the calendar no year left to push — the year is done.<br><br>
	<b>节气树 · 七十二候 · 通关 / The Solar Terms Tree — Complete</b><br><br>
	（岁复一岁，可继续推历。 / Keep going — a year is never the last one.）`

/* Custom action-functions invented inside layers. Everything that MUTATES state
 * lives at FILE SCOPE in the layer files (the engine only re-runs functions that
 * sit inside `layers`), so this list stays empty on purpose — see the header of
 * layers/lichun.js for the rule. */
var doNotCallTheseFunctionsEveryTick = []

/* ---------------------------------------------------------------------------
 *  Global tables shared by mod.js and the layer files
 * ------------------------------------------------------------------------- */
var SEASON_IDS = ["lc", "cf", "lx", "xz", "lq", "qf", "ld", "dz"]   // the eight 节, in order
var HOU_SLOTS = [11, 12, 13, 14, 15, 21, 22, 23, 24]                 // the nine 候 slots of a node

/* Language helper: 中 unless the player has switched to EN in 设置. */
function zh() {
	return !(typeof player !== "undefined" && player && player.lang === "en")
}

/* English cleanup for the generated layer files. The Chinese term names are the
 * game's nouns, so the English branches are allowed to quote them; this map turns
 * the ones that read as untranslated prose into their English names. Order
 * matters: 冬至候 must be replaced before 冬至, 立春候 before 立春. */
var EN_FIX = [
	/* compounds first: 冬至候 must not be eaten by the generic 候 rules */
	[/候簿效果/g, "ledger effect"],
	[/历书三市/g, "the three markets"],
	[/立春候/g, "Lichun Hou"],
	[/春分候/g, "Chunfen Hou"],
	[/立夏候/g, "Lixia Hou"],
	[/夏至候/g, "Xiazhi Hou"],
	[/立秋候/g, "Liqiu Hou"],
	[/秋分候/g, "Qiufen Hou"],
	[/立冬候/g, "Lidong Hou"],
	[/冬至候/g, "Dongzhi Hou"],
	[/立春/g, "Spring Begins"],
	[/春分/g, "Spring Equinox"],
	[/立夏/g, "Summer Begins"],
	[/夏至/g, "Summer Solstice"],
	[/立秋/g, "Autumn Begins"],
	[/秋分/g, "Autumn Equinox"],
	[/立冬/g, "Winter Begins"],
	[/冬至/g, "Winter Solstice"],
	/* then the generic unit and prose tokens */
	[/all 候 output/g, "all pentad output"],
	[/候 output/g, "pentad output"],
	[/候 softcap/g, "pentad softcap"],
	[/log10\(候/g, "log10(pentad"],
	[/log10\(日影/g, "log10(sun-shadow"],
	[/the 候 above/g, "the node above"],
	[/the 节 above/g, "the node above"],
	[/of this 节/g, "of this node"],
	[/This node's 候 buy/g, "This node's pentads buy"],
	[/spend this node's 候/g, "spend this node's pentads"],
	[/<\/b> 候/g, "</b> pentads"],
	[/交节/g, "season turn"],
	[/交历/g, "revision"],
	[/修历/g, "calendar revision"],
	[/岁功成/g, "the Year Is Complete"],
	[/岁祭/g, "year ritual"],
]
function L(zhText, enText) {
	if (zh()) return zhText
	let s = enText
	for (let i = 0; i < EN_FIX.length; i++) s = s.replace(EN_FIX[i][0], EN_FIX[i][1])
	return s
}

/* ---------------------------------------------------------------------------
 *  Counting the theme's own numbers — used by the tree header and the endgame
 * ------------------------------------------------------------------------- */

/* 二十四节气: 8 nodes x 3 term-milestones. */
function termsReached() {
	let n = 0
	for (let i = 0; i < SEASON_IDS.length; i++)
		for (let m = 0; m < 3; m++)
			if (hasMilestone(SEASON_IDS[i], m)) n++
	return n
}

/* How many 碑 the game has. The achievements object also carries the display's own
 * `rows`/`cols` layout keys, so Object.keys().length over-counts by two — count only
 * the numeric ids, and let the display read this rather than a written-down total
 * that can drift away from the build. */
function achievementTotal() {
	return Object.keys(layers.a.achievements).filter(function (k) { return /^[0-9]+$/.test(k) }).length
}

/* 七十二候: 8 nodes x 9 pentad-upgrades. */
function houObserved() {
	let n = 0
	for (let i = 0; i < SEASON_IDS.length; i++) n += houOwned(SEASON_IDS[i])
	return n
}

/* 一节之九候: how many of ONE 节's nine pentads have been observed. The 节's
 * fourth stone (「九候既察」) and its era hand-off are both scored on this. */
function houOwned(nodeId) {
	let n = 0
	for (let s = 0; s < HOU_SLOTS.length; s++)
		if (hasUpgrade(nodeId, HOU_SLOTS[s])) n++
	return n
}

/* 八节试: is a trial running right now, and how many completions in total?
 * M2's handicap reads anyTrial() (see the 节 layers' gainMult). */
function anyTrial() {
	return !!(player.sui && player.sui.activeChallenge !== null && player.sui.activeChallenge !== undefined)
}
function totalTrialCompletions() {
	if (!player.sui || !player.sui.challenges) return 0
	let n = 0
	for (let i = 0; i < TUNING.CHALLENGE_COUNT; i++) n += challengeCompletions("sui", 11 + i)
	return n
}

/* 一岁 = 365 日; the displayed day counter is the year turning, not a resource. */
function daysOfYear() {
	if (typeof player === "undefined" || !player) return 0
	return Math.floor((player.timePlayed || 0) / 10) % 365
}

function getStartPoints() {
	return new Decimal(modInfo.initialStartPoints)
}

function canGenPoints() {
	return true
}

/* ---------------------------------------------------------------------------
 *  日影 — the base currency.
 *
 *  Every later node adds one line here (P10: the first layer must still matter
 *  at the endgame). Each 节's m3 is the era's hand-off: the season that has
 *  been understood makes the next measurement quicker.
 * ------------------------------------------------------------------------- */
function getPointGen() {
	if (!canGenPoints()) return new Decimal(0)

	let gain = new Decimal(1)

	// --- the gnomon itself: 立春's first pentad + the almanac's tuning --------
	// Read the upgrade's own effect, never a literal: u11's magnitude lives in
	// TUNING.UPG_MULT, and a hardcoded copy here silently disagreed with the
	// number the card displays (x2 here against x1.7 on the upgrade).
	if (hasUpgrade("lc", 11)) gain = gain.times(upgradeEffect("lc", 11))
	if (hasUpgrade("al", 14)) gain = gain.times(2)

	// --- 测日影 streak (M3): a run of true readings sharpens the gnomon -------
	let streak = (player.lc && player.lc.shadowStreak) ? player.lc.shadowStreak : 0
	if (streak > 0) {
		let cap = TUNING.SHADOW_STREAK_CAP
		gain = gain.times(new Decimal(1).add(TUNING.SHADOW_BONUS * Math.min(streak, cap)))
	}

	// --- every 节 that is understood speeds the next reading (m3, one per era) --
	for (let i = 0; i < SEASON_IDS.length; i++)
		if (hasMilestone(SEASON_IDS[i], 3)) gain = gain.times(3)

	// --- the almanac's meta-effects (M8 shop, K4 on the named base currency) --
	if (hasUpgrade("al", 11)) gain = gain.times(upgradeEffect("al", 11))
	if (hasUpgrade("al", 21)) gain = gain.times(upgradeEffect("al", 21))
	if (getBuyableAmount("al", 11).gt(0)) gain = gain.times(buyableEffect("al", 11))
	// al milestone 3: 24 observed pentads sharpen the shadow itself
	if (hasMilestone("al", 3)) gain = gain.times(3)

	// --- 立春's own cross-resource stone: the pentad reaches the shadow itself
	if (hasUpgrade("lc", 15)) gain = gain.times(upgradeEffect("lc", 15))

	// --- the year's own trials (M2 hub) --------------------------------------
	if (hasMilestone("sui", 0)) gain = gain.times(2)
	if (hasMilestone("sui", 3)) gain = gain.times(5)
	if (hasMilestone("sui", 5)) gain = gain.times(24)

	// --- a trial's handicap: inside 八节试 the whole tree is nerfed ----------
	if (anyTrial()) gain = gain.div(TUNING.SUI_TRIAL_DIV)

	// --- achievements (P11 alternate path; every one carries a floor >= 1) ----
	if (hasAchievement("a", 11)) gain = gain.times(achievementEffect("a", 11))
	if (hasAchievement("a", 21)) gain = gain.times(achievementEffect("a", 21))
	if (hasAchievement("a", 31)) gain = gain.times(achievementEffect("a", 31))

	// --- 数九 (M4, 冬至): a completed 九九 warms the year ----------------------
	if (player.dz && player.dz.nine >= TUNING.NINE_NINE_MAX) gain = gain.times(9)

	return gain
}

/* Global saved state that is not owned by a layer (F10: this engine has no
 * player.totalPoints, so lifetime counters must be declared here). */
function addedPlayerData() {
	return {
		lang: "zh",      // T2 language flag
		years: 0,        // 岁祭 count — one per completed year
	}
}

/* Lines at the top of the tree page. */
var displayThings = [
	function () {
		return L("已历节气 <b>" + termsReached() + "</b> / 24　·　已察候 <b>" + houObserved() + "</b> / 72　·　第 "
			+ (daysOfYear() + 1) + " 日",
			"Terms reached <b>" + termsReached() + "</b> / 24 · Pentads observed <b>" + houObserved()
			+ "</b> / 72 · day " + (daysOfYear() + 1))
	},
	function () {
		if (!player.years) return undefined
		return L("岁祭 <b>" + player.years + "</b> 次　（一甲子 = 60 岁）",
			"<b>" + player.years + "</b> year rituals held (a 60-year cycle)")
	},
	function () {
		if (player.sui && player.sui.inChallenge !== undefined && player.sui.inChallenge >= 0)
			return "<span style='color:#FF6F91'>" + L("八节试进行中 — 峰值为凭", "A seasonal trial is running — only the peak counts") + "</span>"
		return undefined
	},
]

/* The win is the last almanac entry: 岁功成, priced above the top of 岁's ladder
 * (F15) so a greedy run cannot buy the ending before finishing the wheel. */
function isEndgame() {
	return hasUpgrade("sui", 15)
}

/* ---------------------------------------------------------------------------
 *  Localized chrome — replaces the stock main-display / resource-display, both
 *  of which hard-code English (07 Part F7 / N-MAINSTR).
 * ------------------------------------------------------------------------- */
function mainAmount(layer, withRate) {
	let col = layers[layer].color || "#ffffff"
	let out = '<div style="font-size:42px;color:' + col + ';text-shadow:0 0 10px ' + col + '">'
		+ format(player[layer].points) + '</div>'
	out += '<div style="font-size:16px;opacity:.85">' + tmp[layer].resource + '</div>'
	if (withRate && tmp[layer].passiveGeneration)
		out += '<div style="font-size:14px;opacity:.6">'
			+ L("每秒自行 +" + format(tmp[layer].resetGain.times(tmp[layer].passiveGeneration)),
				"+" + format(tmp[layer].resetGain.times(tmp[layer].passiveGeneration)) + " / sec")
			+ '</div>'
	return out
}

/* ---- cosmetics ---- */

var backgroundStyle = {
	"background-color": "#0b1016",
}

function maxTickLength() {
	return 3600
}

/* Never hard-reset the player (handbook 12 §1.4). */
function fixOldSave(oldVersion) {
}
