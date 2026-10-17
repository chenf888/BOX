let modInfo = {
	name: "2027重阳节树",
    id: "2027-exoi3a",  // savefile key — set once, NEVER change (changing it erases all saves)
	author: "TMT GG",
	pointsName: "山道里程",
	modFiles: ["tuning.js", "lang.js", "layers.js", "layers_row1.js", "layers_x.js", "layers_row2.js", "layers_row3.js", "side.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "九九重阳",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1 — 九九重阳</h3><br>
		- 十层重阳树：山道 / 菊田 / 酒坊 / 茱萸 / 菊展 / 糕坊 / 诗阁 / 集市 / 绝顶 / 云端。<br>
		- 登高点击、九日酿造、菊展小游戏与菊谱三十六种收藏、绝顶九峰试炼（计分挑战）、重阳糕九层与九重天双九上限。<br>
		- 终局：云端「长命百岁」。`

// F3: winText is a function — it may never interpolate player values at module scope.
let winText = function() {
	return L("九山为屏，菊花为寿。登高之宴既毕，长者同升云阶九重——长命百岁。<br><br><b>2027重阳节树 · 完成</b><br><br>（山色依旧，可继续登高。）",
		"The nine mountains stand as a screen and the chrysanthemum as long-life. The high-climb feast is done; the elders ascend the nine cloud tiers with you — a hundred years of health.<br><br><b>The Double Ninth Tree 2027 — Complete</b><br><br>(The mountain stands as it was. Keep climbing.)")
}

// No custom action-functions exist in this mod: every hook is an official documented
// feature (update, onClick, onPurchase, ...) or a pure value helper cached in tmp.
var doNotCallTheseFunctionsEveryTick = []

function getStartPoints(){
	return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// 山道里程 production (P10 anchor: every deeper era keeps a live line in here —
// nothing is ever orphaned). Every K1/K2/K3 value is consumed exactly once, below.
function getPointGen(){
	if (!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)

	// — 山道 (p) upgrades —
	if (hasUpgrade("p", 11)) gain = gain.times(2)
	if (hasUpgrade("p", 12)) gain = gain.times(3)
	if (hasUpgrade("p", 13)) gain = gain.times(upgradeEffect("p", 13))
	if (hasUpgrade("p", 21)) gain = gain.times(upgradeEffect("p", 21))
	if (hasUpgrade("p", 22)) gain = gain.times(upgradeEffect("p", 22))
	if (hasUpgrade("p", 24)) gain = gain.times(4)
	if (hasUpgrade("p", 31)) gain = gain.times(upgradeEffect("p", 31))
	if (hasUpgrade("p", 32)) gain = gain.times(8)
	if (hasUpgrade("p", 33)) gain = gain.times(upgradeEffect("p", 33))
	if (hasUpgrade("p", 34)) gain = gain.times(12)
	if (hasUpgrade("p", 35)) gain = gain.times(20)

	// — cross-era web lines (one per deeper row: the climb is never left behind) —
	if (hasUpgrade("g", 21)) gain = gain.times(2)
	if (hasUpgrade("s", 21)) gain = gain.times(3)
	if (hasUpgrade("m", 21)) gain = gain.times(3)
	if (hasUpgrade("f", 21)) gain = gain.times(5)
	if (hasUpgrade("y", 21)) gain = gain.times(10)
	if (hasUpgrade("y", 31)) gain = gain.times(upgradeEffect("y", 31))

	// — achievements (named gates only, never an all-achievements aggregate) —
	if (hasAchievement("a", 91)) gain = gain.times(2)
	if (hasAchievement("a", 84)) gain = gain.times(5)

	// — M2 rule-injection (P16): trial c11「霜风」 nerfs the whole mountain —
	if (inChallenge("f", 11)) gain = gain.times(0.1)

	return gain
}

// No global counters are scored on a lifetime total (F10): everything reads layer
// .best/.total, which each layer's doReset keep-list preserves.
function addedPlayerData(){
	return {}
}

// Status lines on the tree tab. Functions only (F3).
var displayThings = [
	function(){
		if (inChallenge("f", 11)) return L("寒霜未解：山道生产 <b>×0.1</b>。", "Frost trial: path production ×0.1.")
		if (inChallenge("f", 21)) return L("寒菊闭蕊：菊田之效 <b>×0.3</b>。", "Cold bloom: chrysanthem field power ×0.3.")
		if (inChallenge("f", 31)) return L("断酒之令：九日酿停摆。", "Dry season: the nine-day brew stands still.")
		if (inChallenge("f", 41)) return L("孤登：全山之自动化缄默。", "Solo climb: every automation holds its breath.")
	},
	function(){
		if (player.y.unlocked)
			return L("距九重天还差 <b>" + formatWhole(player.y.points.max(0).min(TUNING.yCap)) + "</b> 云阶。",
				"<b>" + formatWhole(player.y.points.max(0).min(TUNING.yCap)) + "</b> cloud tiers to the ninth heaven.")
	},
	function(){
		if (hasAchievement("a", 84)) return L("菊谱全录：三十六种菊，一种不缺。", "The chrysanthem codex is complete: all thirty-six varieties.")
	},
]

function isEndgame(){
	return hasUpgrade("y", 45)
}

var backgroundStyle = {}

function maxTickLength(){ return 3600 }

function fixOldSave(oldVersion){}
