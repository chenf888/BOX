let modInfo = {
	name: "The Smallpox Tree",
    id: "the-smallpox-tree-o1hd4y",  // savefile key — set once, NEVER change (changing it erases all saves)
	author: "chenf888",
	pointsName: "病例",
	modFiles: [
		"tuning.js",
		"layers/var.js", "layers/vac.js", "layers/pro.js", "layers/knw.js", "layers/int.js",
		"layers/sur.js", "layers/cc.js", "layers/mob.js", "layers/cmp.js", "layers/cert.js",
		"layers/hist.js", "layers/dash.js",
		"tree.js",
	],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(1), // 零号病人：游戏从第一例病例开始
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "绝迹日纪念版",
}

let changelog = `<h1>更新日志 Changelog</h1><br>
	<h3>v0.1 — 绝迹日纪念版</h3><br>
		- 从天花病毒的起源开始：跨种溢出、人痘、牛痘、生产、协作、监测、冷链、动员、战役、认证。<br>
		- 反弹压强机制：一会不管控，得病率就又上升了。<br>
		- 终局：1979-10-25 人类天花绝迹日印章（消耗式发射 M19）。<br>
		- Initial build of The Smallpox Tree, commemorating Smallpox Eradication Day (Oct 25, 1979).`

// 双语静态文本（winText 由 index.html 以 v-html 渲染，必须是字符串；双语并列，不插值——07 F3）
let winText = `<span style="color:#ffd966">★ 1979年10月25日 —— 人类天花绝迹日 ★</span><br>
	On October 25, 1979, the world marked Smallpox Zero Day.<br><br>
	三千年的瘟疫，被一代人按下归零键。<br>
	A three-thousand-year scourge was brought to zero by one generation.<br><br>
	1980年5月8日，世界卫生大会正式宣布：天花——被消灭。<br>
	On May 8, 1980, the World Health Assembly declared: smallpox is eradicated.<br><br>
	谨以此树，纪念所有为根除天花奋斗的人。<br>
	This tree is dedicated to everyone who fought to erase smallpox.`

// 自定义动作函数登记（本作全部层内函数均为取值函数或官方钩子，无自造动作函数）
var doNotCallTheseFunctionsEveryTick = []

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// 终局后病毒已死，病例不再增长（叙事收口；玩家可继续完成封卷里程碑）
function canGenPoints(){
	return !hasMilestone("cert", 8)
}

// ---- 全局取值函数（层文件与模拟器共用） ----

// 反弹压强增速 %/s：减速升级 × 冷链节点 ÷ 流调专项 buyable（N-BUYABLEDEAD：sur.11 的跨层消费者）
function pressureRate() {
	let rate = new Decimal(T("PRESSURE_RATE"))
	if (hasUpgrade("sur", 23)) rate = rate.times(T("PRESSURE_RATE_UPG"))   // 压强阀门 I
	if (hasMilestone("sur", 0)) rate = rate.times(T("PRESSURE_RATE_UPG"))
	if (hasMilestone("sur", 3)) rate = rate.times(T("PRESSURE_RATE_UPG"))
	let cc = new Decimal(0)
	if (player.cc && player.cc.unlocked && tmp.cc) cc = tmp.cc.points
	rate = rate.div(cc.times(T("PRESSURE_CC_FACTOR")).add(1))
	if (player.sur && player.sur.buyables && tmp.sur) rate = rate.div(buyableEffect("sur", 11))
	if (hasChallenge("sur", 13)) rate = rate.div(2)                        // 超规模爆发完成奖励
	if (inChallenge("sur", 13)) rate = rate.times(10)                      // 挑战 handicap
	return rate
}

// 覆盖率 %（vac 子进度，硬上限 100；K5 斜率升级 + m3 里程碑在此消费）
function covPct() {
	if (!player.vac.unlocked) return new Decimal(0)
	let slope = new Decimal(T("COVERAGE_SLOPE"))
	if (hasUpgrade("vac", 35)) slope = slope.times(T("COVERAGE_SLOPE_UPG"))
	if (hasUpgrade("vac", 41)) slope = slope.times(T("COVERAGE_SLOPE_UPG"))
	if (hasMilestone("vac", 3)) slope = slope.times(1.15)
	if (hasMilestone("knw", 2)) slope = slope.times(1.15)
	if (hasMilestone("mob", 1)) slope = slope.times(1.2)
	let raw = player.vac.points.add(1).log(10).times(slope)
	if (player.vac.unlocked && tmp.vac) raw = raw.times(buyableEffect("vac", 11))   // 免疫证书（N-BUYABLEDEAD 跨层消费）
	return softcap(raw, new Decimal(T("COVERAGE_CAP")), 0)
}

// Calculate points/sec!  —— 病例生产（病毒传播）
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(T("BASE_CASE_GAIN"))
	// var 层升级（传播史事件，token 在此接线）
	if (hasUpgrade("var", 11)) gain = gain.times(2)
	if (hasUpgrade("var", 12)) gain = gain.times(upgradeEffect("var", 12))
	if (hasUpgrade("var", 13)) gain = gain.times(upgradeEffect("var", 13))
	if (hasUpgrade("var", 14)) gain = gain.times(upgradeEffect("var", 14))
	if (hasUpgrade("var", 15)) gain = gain.times(4)
	if (hasUpgrade("var", 21)) gain = gain.times(upgradeEffect("var", 21))
	if (hasUpgrade("var", 22)) gain = gain.times(upgradeEffect("var", 22))
	if (hasUpgrade("var", 23)) gain = gain.times(8)
	if (hasUpgrade("var", 24)) gain = gain.times(upgradeEffect("var", 24))
	if (hasUpgrade("var", 31)) gain = gain.times(upgradeEffect("var", 31))
	if (hasUpgrade("var", 32)) gain = gain.times(4)
	if (hasUpgrade("var", 33)) gain = gain.times(upgradeEffect("var", 33))
	if (hasUpgrade("var", 35)) gain = gain.times(10)
	// var 里程碑
	if (hasMilestone("var", 0)) gain = gain.times(2.5)
	if (hasMilestone("var", 2)) gain = gain.times(2)
	// 后续层反哺锚点（P10：每层 ≥1 行）
	if (hasUpgrade("pro", 34)) gain = gain.times(2)
	if (hasMilestone("knw", 0)) gain = gain.times(2)
	if (hasMilestone("cmp", 1)) gain = gain.times(2)
	if (hasMilestone("cert", 0)) gain = gain.times(3)
	// var buyable（接种点 → 病例再传播，跨层消费 N-BUYABLEDEAD）
	if (player.var.unlocked && tmp.var) gain = gain.times(buyableEffect("var", 11))
	// 反弹压强 >30%：得病率上升（用户原话机制）
	if (player.sur.unlocked && player.sur.pressure.gt(T("PRESSURE_LOW")))
		gain = gain.times(player.sur.pressure.div(100).add(1))
	// 成就平乘（hist）
	if (hasAchievement("hist", 11)) gain = gain.times(2)
	if (hasAchievement("hist", 22)) gain = gain.times(2)
	if (hasAchievement("hist", 33)) gain = gain.times(3)
	if (hasAchievement("hist", 44)) gain = gain.times(5)
	if (hasAchievement("hist", 55)) gain = gain.times(10)
	// 挑战 handicap
	if (inChallenge("sur", 11)) gain = gain.pow(0.5)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here
function addedPlayerData() { return {
}}

// Display extra things at the top of the page（双语状态行）
var displayThings = [
	function() {
		let yr = eraName()
		if (yr) return yr
	},
	function() {
		if (!player.sur.unlocked) return
		let p = player.sur.pressure
		let warn = window.chinesemode ? "反弹压强" : "Rebound pressure"
		let col = p.gt(T("PRESSURE_HIGH")) ? "#ff6b6b" : (p.gt(T("PRESSURE_LOW")) ? "#ffb347" : "#9fd8a0")
		return `<span style="color:` + col + `">` + warn + `: ` + format(p, 1) + `%</span>`
	},
]

// 纪年（P13 仪表盘喂入：由战役/认证里程碑推进）
function eraName() {
	if (!window.chinesemode) {
		if (hasMilestone("cert", 8)) return "1980 — Post-eradication era"
		if (hasMilestone("cert", 5)) return "1979 — The certification year"
		if (hasMilestone("cmp", 5)) return "1977-78 — The last case and the watch"
		if (hasMilestone("cmp", 3)) return "1975-76 — The final fronts"
		if (hasMilestone("cmp", 1)) return "1971 — The Americas fall silent"
		if (hasMilestone("int", 0)) return "1967 — The Intensified Programme"
		if (hasUpgrade("int", 31)) return "1950s — A hemispheric dream"
		if (hasUpgrade("pro", 35)) return "1940s-60s — Heat-stable vaccine"
		if (hasUpgrade("vac", 33)) return "1805-1900 — Vaccination goes global"
		if (hasMilestone("vac", 0)) return "1796-1805 — The Jenner era"
		if (hasMilestone("var", 2)) return "16th-18th c. — Variolation spreads"
		if (hasMilestone("var", 0)) return "Antiquity — Empires and caravans"
		return "~10,000 BC — The origin"
	}
	if (hasMilestone("cert", 8)) return "1980 年 — 根除之后"
	if (hasMilestone("cert", 5)) return window.chinesemode ? "1979 年 — 认证之年" : "1979 — The certification year"
	if (hasMilestone("cmp", 5)) return window.chinesemode ? "1977-78 年 — 最后一例与监测期" : "1977-78 — The last case and the watch"
	if (hasMilestone("cmp", 3)) return "1975-76 年 — 最后的战役"
	if (hasMilestone("cmp", 1)) return "1971 年 — 美洲归于沉寂"
	if (hasMilestone("int", 0)) return "1967 年 — 强化根除计划"
	if (hasUpgrade("int", 31)) return "1950 年代 — 半球之梦"
	if (hasUpgrade("pro", 35)) return "1940-60 年代 — 耐热冻干苗"
	if (hasUpgrade("vac", 33)) return "1805-1900 年 — 牛痘环球"
	if (hasMilestone("vac", 0)) return "1796-1805 年 — 詹纳时代"
	if (hasMilestone("var", 2)) return "16-18 世纪 — 人痘西传"
	if (hasMilestone("var", 0)) return "古典时代 — 帝国与商队"
	return "约公元前 1 万年 — 起源"
}

// Determines when the game "ends"：第 9 枚认证里程碑 = 1979-10-25 绝迹日印章
function isEndgame() {
	return hasMilestone("cert", 8)
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
