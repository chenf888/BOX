// ============================================================================
// 大模型之树 The Large Model Tree —— 献给 1024 程序员节
// 从点击「生成下一个 token」开始，沿 LLM 生命周期爬树：
// 上下文 → 参数/注意力 → 数据/算力 → 训练/部署 → 涌现 → AGI（1024 达成）
// ----------------------------------------------------------------------------
// 本文件是经济根：token 产出（采样 + 流式）、终局判定、全局文案。
// 所有节奏常数在 js/tuning.js（游戏 / 模拟器 / 文案三方同读）。
// ============================================================================

let modInfo = {
	name: "The Large Model Tree",
    id: "the-large-model-tree-rxmapt",  // savefile key — set once, NEVER change (changing it erases all saves)
	author: "chenf888",
	pointsName: "token",
	modFiles: [
		"tuning.js",
		"layers/c.js",
		"layers/p.js",
		"layers/a.js",
		"layers/d.js",
		"layers/f.js",
		"layers/tr.js",
		"layers/dep.js",
		"layers/em.js",
		"layers/agi.js",
		"layers/bench.js",
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
	name: "1024",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1 「1024」</h3><br>
		- 献给 1024 程序员节：从 1 个 token 到 AGI。<br>
		- 10 个主层：上下文 / 参数 / 注意力 / 数据 / 算力 / 训练 / 部署 / 涌现 / AGI。<br>
		- 4 个训练病理挑战、32 个基准成就、KV 缓存字节、epoch 收敛条。<br>
		- 双语（中文默认）。`

let winText = `你把 1024 个涌现里程碑连成了通用智能。<br>
	<b>1024 程序员节快乐 —— 愿 token 与你同在。</b><br><br>
	You aligned 1024 emergence milestones into a general intelligence.<br>
	<b>Happy 1024 Programmer's Day — may the tokens be with you.</b>`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
var doNotCallTheseFunctionsEveryTick = []

// ----------------------------------------------------------------------------
// 双语助手（T2：状态存 player.bench.chinesemode；默认英文，chinesemode===true 才出中文）
// ----------------------------------------------------------------------------
function L(zh, en) {
	if (typeof player !== "undefined" && player.bench && player.bench.chinesemode === true) return zh
	return en
}

// 微页签标题：键名为稳定英文 ID，中文模式下查表显示
function tabLabel(tab) {
	if (typeof player !== "undefined" && player.bench && player.bench.chinesemode === true) {
		const zh = { Upgrades: "升级", Milestones: "里程碑", Buyables: "购买", Logs: "日志", Challenges: "挑战", Shop: "商店" }
		return zh[tab] || tab
	}
	return tab
}

// ----------------------------------------------------------------------------
// 采样（点击）强度 —— 核心动词「生成下一个 token」
// 模式崩溃挑战中恒为 1（模型只会输出同一个词）。
// ----------------------------------------------------------------------------
function getClickPower() {
	if (inChallenge("tr", 12)) return new Decimal(1)
	let p = new Decimal(TUNING.CLICK.base)
	if (hasUpgrade("c", 11)) p = p.times(TUNING.UPG.c11)
	if (hasUpgrade("c", 23)) p = p.times(TUNING.UPG.c23)
	// 温度 buyable：每级 +10% 创造力（上限 24 级，temperature ≤ 2.4！）
	p = p.times(getBuyableAmount("c", 11).times(0.1).add(1))
	// 投机解码 buyable（c）：每级 +20%
	p = p.times(getBuyableAmount("c", 13).times(0.2).add(1))
	// dep 商店：推测解码 v2
	p = p.times(Decimal.pow(1.2, getBuyableAmount("dep", 13)))
	// dep m2 蒸馏：采样 ×2
	if (hasMilestone("dep", 2)) p = p.times(2)
	// 模式崩溃挑战奖励：每次完成 ×3
	if (hasChallenge("tr", 12)) p = p.times(Decimal.pow(TUNING.CHAL.rw12, challengeCompletions("tr", 12)))
	return p.max(0)
}

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// ----------------------------------------------------------------------------
// token 产出 / 秒 —— 经济的心脏（wiring map：所有 token 加成线都在这里）
// ----------------------------------------------------------------------------
function getPointGen() {
	if (!canGenPoints()) return decimalZero
	// 模式崩溃：没有流式输出，只有采样
	if (inChallenge("tr", 12)) return decimalZero

	let gain = new Decimal(TUNING.GEN.base)

	// 流式输出（c u13「流式输出」解锁）：每秒按 clickPower × 流速产出
	if (hasUpgrade("c", 13)) {
		let rate = hasMilestone("c", 2) ? TUNING.STREAM.rate2 : TUNING.STREAM.rate1
		if (hasUpgrade("c", 15)) rate = rate * 2
		gain = gain.add(getClickPower().times(rate))
	}
	// c 层 KV 缓存池 buyable（效果 ×1.15^级，由这里消费）
	gain = gain.times(Decimal.pow(1.15, getBuyableAmount("c", 14)))
	// a 层 GQA buyable
	gain = gain.times(Decimal.pow(1.2, getBuyableAmount("a", 12)))
	// dep 商店：INT8 量化
	gain = gain.times(Decimal.pow(1.15, getBuyableAmount("dep", 11)))

	// ---- c 层升级线 ----
	if (hasUpgrade("c", 12)) gain = gain.times(TUNING.UPG.c12)
	if (hasUpgrade("c", 14)) gain = gain.times(player.points.max(1).log(10).add(1).pow(TUNING.SHAPE.c13))
	if (hasUpgrade("c", 24)) gain = gain.times(player.c.bytes.max(1).log(10).add(1).pow(TUNING.SHAPE.c24))
	if (hasUpgrade("c", 25)) gain = gain.times(TUNING.UPG.c25)
	// ---- p 层升级线 ----
	if (hasUpgrade("p", 11)) gain = gain.times(TUNING.UPG.p11)
	if (hasUpgrade("p", 16)) gain = gain.times(player.p.best.max(1).log(10).add(1).pow(TUNING.SHAPE.p16))
	if (hasUpgrade("p", 24)) gain = gain.times(TUNING.UPG.p24)
	// ---- a 层升级线 ----
	if (hasUpgrade("a", 11)) gain = gain.times(TUNING.UPG.a11)
	if (hasUpgrade("a", 16)) gain = gain.times(player.a.best.max(1).log(10).add(1).pow(TUNING.SHAPE.a16))
	if (hasUpgrade("a", 24)) gain = gain.times(player.tr.best.max(1).log(10).add(1).pow(TUNING.SHAPE.a24))
	// ---- d 层升级线 ----
	if (hasUpgrade("d", 11)) gain = gain.times(TUNING.UPG.d11)
	if (hasUpgrade("d", 16)) gain = gain.times(player.d.best.max(1).log(10).add(1).pow(TUNING.SHAPE.d16))
	if (hasUpgrade("d", 24)) gain = gain.times(TUNING.UPG.d24)
	// ---- f 层升级线 ----
	if (hasUpgrade("f", 11)) gain = gain.times(TUNING.UPG.f11)
	if (hasUpgrade("f", 13)) gain = gain.times(player.d.best.max(1).log(10).add(1).pow(TUNING.SHAPE.f13))
	if (hasUpgrade("f", 16)) gain = gain.times(player.f.best.max(1).log(2).add(1).pow(TUNING.SHAPE.f16))
	if (hasUpgrade("f", 24)) gain = gain.times(TUNING.UPG.f24)
	// ---- tr / dep / em / agi 升级线 ----
	if (hasUpgrade("tr", 11)) gain = gain.times(TUNING.UPG.tr11)
	if (hasUpgrade("tr", 23)) gain = gain.times(player.tr.best.max(1).log(10).add(1).pow(TUNING.SHAPE.tr23))
	if (hasUpgrade("tr", 31)) gain = gain.times(TUNING.UPG.tr31)
	if (hasUpgrade("dep", 11)) gain = gain.times(TUNING.UPG.dep11)
	if (hasUpgrade("dep", 16)) gain = gain.times(player.dep.best.max(1).log(10).add(1).pow(TUNING.SHAPE.dep16))
	if (hasUpgrade("dep", 24)) gain = gain.times(player.agi.best.max(1).log(10).add(1).pow(TUNING.SHAPE.dep24))
	if (hasUpgrade("em", 11)) gain = gain.times(TUNING.UPG.em11)
	if (hasUpgrade("em", 16)) gain = gain.times(player.em.best.max(1).log(10).add(1).pow(TUNING.SHAPE.em16))
	if (hasUpgrade("em", 24)) gain = gain.times(TUNING.UPG.em24)
	if (hasUpgrade("agi", 11)) gain = gain.times(TUNING.UPG.agi11)
	if (hasUpgrade("agi", 21)) gain = gain.times(TUNING.UPG.agi21)
	if (hasUpgrade("agi", 22)) gain = gain.times(player.agi.best.max(1).add(1).pow(TUNING.SHAPE.agi22))

	// ---- P10 层 effect 网（每层的 tokenBoost；K4 已并入各层 effect()）----
	if (player.c.unlocked) gain = gain.times(layers.c.effect().tokenBoost)
	if (player.p.unlocked) gain = gain.times(layers.p.effect().tokenBoost)
	if (player.a.unlocked) gain = gain.times(layers.a.effect().tokenBoost)
	if (player.d.unlocked) gain = gain.times(layers.d.effect().tokenBoost)
	if (player.f.unlocked) gain = gain.times(layers.f.effect().tokenBoost)
	if (player.tr.unlocked) gain = gain.times(layers.tr.effect().tokenBoost)
	if (player.dep.unlocked) gain = gain.times(layers.dep.effect().tokenBoost)
	if (player.em.unlocked) gain = gain.times(layers.em.effect().tokenBoost)
	if (player.agi.unlocked) gain = gain.times(layers.agi.effect().tokenBoost)

	// ---- 里程碑平乘奖励 ----
	if (hasMilestone("c", 1)) gain = gain.times(TUNING.MS.c1)
	if (hasMilestone("c", 5)) gain = gain.times(TUNING.MS.c5)
	if (hasMilestone("p", 2)) gain = gain.times(TUNING.MS.p2)
	if (hasMilestone("p", 4)) gain = gain.times(TUNING.MS.p4)
	if (hasMilestone("a", 2)) gain = gain.times(TUNING.MS.a2)
	if (hasMilestone("a", 4)) gain = gain.times(TUNING.MS.a4)
	if (hasMilestone("d", 2)) gain = gain.times(TUNING.MS.d2)
	if (hasMilestone("d", 4)) gain = gain.times(TUNING.MS.d4)
	if (hasMilestone("f", 2)) gain = gain.times(TUNING.MS.f2)
	if (hasMilestone("f", 3)) gain = gain.times(TUNING.MS.f3)
	if (hasMilestone("tr", 2)) gain = gain.times(TUNING.MS.tr2)
	if (hasMilestone("tr", 7)) gain = gain.times(TUNING.MS.tr7)
	if (hasMilestone("dep", 0)) gain = gain.times(TUNING.MS.dep0)
	if (hasMilestone("dep", 3)) gain = gain.times(2)
	if (hasMilestone("em", 1)) gain = gain.times(TUNING.MS.em1)
	if (hasMilestone("em", 5)) gain = gain.times(TUNING.MS.em5)
	if (hasMilestone("agi", 0)) gain = gain.times(TUNING.MS.agi0)

	// ---- 挑战 ----
	if (inChallenge("tr", 11)) gain = gain.times(TUNING.CHAL.nerf11)
	if (hasChallenge("tr", 11)) gain = gain.times(Decimal.pow(TUNING.CHAL.rw11, challengeCompletions("tr", 11)))

	// ---- 成就平乘（bench）----
	gain = gain.times(achMultTotal())

	return gain.max(0)
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	function() {
		return L(
			"<span style='opacity:0.75'>大模型之树 —— 献给 1024 程序员节 · 从 1 个 token 到 AGI</span>",
			"<span style='opacity:0.75'>The Large Model Tree — for the 1024 Programmer's Day · from 1 token to AGI</span>"
		)
	},
	function() {
		if (!player.agi.unlocked) return
		return L(
			"AGI 进度：<b style='color:#ffcc00'>" + formatWhole(player.agi.best) + "</b> / 1024",
			"AGI progress: <b style='color:#ffcc00'>" + formatWhole(player.agi.best) + "</b> / 1024"
		)
	},
]

// Determines when the game "ends" —— 1024 = 程序员节的胜利数字
function isEndgame() {
	return player.agi.points.gte(TUNING.AGI.win)
}

// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {
	"background-color": "#0d1117",
}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}
