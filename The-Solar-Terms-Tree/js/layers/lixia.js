/* =========================================================================
 *  立夏 / lx  —  row 2, the third 节 of the year.
 *  立夏 · 小满 · 芒种  —  its nine pentads are this node's upgrades:
 *  蝼蝈鸣 / 蚯蚓出 / 王瓜生 / 苦菜秀 / 靡草死 / 麦秋至 / 螳螂生 / 鵙始鸣 / 反舌无声
 *
 *  FILE-SCOPE RULE: the engine re-runs every function that lives INSIDE `layers` on each
 *  temp refresh (~20x/sec) to fill tmp, so anything that MUTATES player state lives out here
 *  instead. That is also why doNotCallTheseFunctionsEveryTick stays empty in mod.js — none
 *  of the mutators below are layer properties at all.
 * ========================================================================= */

/* ---- 开渠 + 雨量 (M4) ---------------------------------------------------
 *  雨量 (the rain gauge) fills on its own; when it reaches 100 the canal can
 *  be opened, cashing the rain in for 立夏候. The bar is the clock, the
 *  clickable is the decision — and the node's ninth stone makes the rain
 *  fall faster.
 * ----------------------------------------------------------------------- */
function lxCanalReady() { return player.lx.rain >= 100 }
function lxOpenCanal() {
	if (!player.lx.unlocked || !lxCanalReady()) return
	player.lx.rain = 0
	player.lx.canals++
	let gain = new Decimal(TUNING.RAIN_REWARD).times(lxRainMult())
	addPoints("lx", gain)
}
function lxRainMult() {
	let ret = new Decimal(1)
	if (hasMilestone("lx", 3)) ret = ret.times(2)      // 九候既察: the rain falls twice as fast
	if (hasMilestone("lx", 0)) ret = ret.times(1.5)
	return ret
}
function lxRainTime() { return TUNING.RAIN_TIME / lxRainMult().toNumber() }
addLayer("lx", {
	name: function() { return L("立夏", "Summer Begins") },
	symbol: function() { return L("立夏", "LX") },
	position: 0,
	row: 2,
	branches: ["xz"],
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
		rain: 0,                // 雨量 0..100, a plain number (M4)
		canals: 0,              // 开渠 count
	}},
	color: "#FFB74D",
	resource: function() { return L("立夏候", "Lixia Hou") },
	baseResource: function() { return L("春分候", "Chunfen Hou") },
	baseAmount() { return player.cf.points },
	requires: new Decimal(6250),
	type: "normal",
	exponent: 1 / 3,
	softcap() {
		let cap = new Decimal(TUNING.SOFTCAP.lx)
		if (hasUpgrade("lx", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)
		if (hasUpgrade("al", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)
		return cap
	},
	softcapPower: TUNING.SOFTCAP_POWER,
	gainMult() {
		let ret = new Decimal(1)
		if (hasUpgrade("lx", 11)) ret = ret.times(upgradeEffect("lx", 11))
		if (hasUpgrade("lx", 12)) ret = ret.times(upgradeEffect("lx", 12))
		if (hasUpgrade("lx", 13)) ret = ret.times(upgradeEffect("lx", 13))
		if (hasUpgrade("lx", 14)) ret = ret.times(upgradeEffect("lx", 14))
		if (hasUpgrade("lx", 21)) ret = ret.times(upgradeEffect("lx", 21))
		if (hasUpgrade("lx", 23)) ret = ret.times(upgradeEffect("lx", 23))
		if (hasUpgrade("lx", 25)) ret = ret.times(buyableEffect("lx", 11))
		if (hasMilestone("lx", 0)) ret = ret.times(1.5)
		if (hasUpgrade("al", 12)) ret = ret.times(upgradeEffect("al", 12))
		if (getBuyableAmount("al", 12).gt(0)) ret = ret.times(buyableEffect("al", 12))
		if (hasMilestone("cf", 3)) ret = ret.times(3)
		if (hasMilestone("xz", 3)) ret = ret.times(10)
		if (hasUpgrade("xz", 15)) ret = ret.times(upgradeEffect("xz", 15))
		ret = ret.times(player.points.add(1).log(10).div(TUNING.SELF.BASE_LOG_DIV).add(1).pow(0.5))
		ret = ret.times(suiTrialMult())
		return ret
	},
	gainExp() { return new Decimal(1) },
	passiveGeneration() {
		if (hasMilestone("lx", 1) || hasMilestone("sui", 3)) return 1
		return 0
	},
	autoUpgrade() {
		if (hasMilestone("lx", 2) || hasMilestone("sui", 3)) return true
		return false
	},
	resetsNothing() {
		if (hasMilestone("sui", 3)) return true
		return false
	},
	layerShown() { return player["lx"].unlocked || player["cf"].best.gte(125) },
	prestigeButtonText() {
		return L("交节得 <b>" + formatWhole(tmp["lx"].resetGain) + "</b> " + tmp["lx"].resource, "Turn the season for <b>" + formatWhole(tmp["lx"].resetGain) + "</b> " + tmp["lx"].resource) +
			(player["lx"].points.lt(100) ? "<br><br>" + L("下一候需 " + format(tmp["lx"].nextAt) + " 春分候", "Next at " + format(tmp["lx"].nextAt) + " Chunfen Hou") : "")
	},
	doReset(resettingLayer) {
		// P9 — STRICTLY deeper only. The engine grants the 交节 gain with addPoints()
		// BEFORE rowReset(row…0) walks back down and calls this hook, so a `>=` test
		// (or an explicit self-match) rebuilds the layer from startData right after
		// the grant and silently throws the 候 away: best climbs, points stay 0, and
		// nothing is ever affordable. The 候 are a bank: a deeper 节 wipes them, the
		// layer's own 交节 only adds to them.
		if (layers[resettingLayer].row > this.row) {
			layerDataReset("lx", ["unlocked", "best", "total", "upgrades", "milestones"])
		}
	},
	upgrades: {
		11: {
			title: function() { return L("蝼蝈鸣", "mole crickets sing") },
			description: function() { return L("本节候产与日影产出 ×" + TUNING.UPG_MULT[11] + "。", "This node's 候 output and the sun-shadow output x" + TUNING.UPG_MULT[11] + ".") },
			cost: new Decimal(1),
			effect() { return new Decimal(TUNING.UPG_MULT[11]) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		12: {
			title: function() { return L("蚯蚓出", "earthworms emerge") },
			description: function() { return L("本节的候产 ×" + TUNING.UPG_MULT[12] + "。", "This node's 候 output x" + TUNING.UPG_MULT[12] + ".") },
			cost: new Decimal(3),
			effect() { return new Decimal(TUNING.UPG_MULT[12]) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		13: {
			title: function() { return L("王瓜生", "snake gourds grow") },
			description: function() { return L("本节之候自养：影愈长，察愈明 —— 本节候产 ×(候+1)^" + TUNING.SELF.SQRT_EXP + "，上限 ×" + TUNING.SELF.SQRT_CAP + "。", "The pentads feed on themselves: x (候+1)^" + TUNING.SELF.SQRT_EXP + ", capped at x" + TUNING.SELF.SQRT_CAP + ".") },
			cost: new Decimal(9),
			effect() {
				let v = player["lx"].points.add(1).pow(TUNING.SELF.SQRT_EXP)
				if (v.gt(TUNING.SELF.SQRT_CAP)) v = v.div(TUNING.SELF.SQRT_CAP).pow(0.4).times(TUNING.SELF.SQRT_CAP)
				return v
			},
			effectDisplay() { return "×" + format(this.effect()) },
		},
		14: {
			title: function() { return L("苦菜秀", "sow thistles flower") },
			description: function() { return L("积候成数：本节候产 ×(log10(候+10)/" + TUNING.SELF.LOG_DIV + "+1)。", "Pentads accumulate: x (log10(候+10)/" + TUNING.SELF.LOG_DIV + "+1).") },
			cost: new Decimal(30),
			effect() { return player["lx"].points.add(10).log(10).div(TUNING.SELF.LOG_DIV).add(1) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		15: {
			title: function() { return L("靡草死", "delicate grasses wither") },
			description: function() { return L("候及上节：春分 的候产 ×(log10(春分候+1)+1)。", "The pentad reaches the 节 above: Spring Equinox's output x (log10(Chunfen Hou+1)+1).") },
			cost: new Decimal(120),
			effect() { return player["cf"].points.add(1).log(10).add(1) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		21: {
			title: function() { return L("麦秋至", "the wheat ripens") },
			description: function() { return L("春分九候既察之后，本节候产 ×2。", "Once Spring Equinox's nine pentads are all observed, this node's output x2.") },
			cost: new Decimal(7),
			effect() {
				if (hasMilestone("cf", 3)) return new Decimal(2)
				return new Decimal(1)
			},
			effectDisplay() { return "×" + format(this.effect()) },
		},
		22: {
			title: function() { return L("螳螂生", "mantises hatch") },
			description: function() { return L("本节的软上限 ×1000（上限显示在本页顶）。", "This node's softcap x1000 (shown at the top of its tab).") },
			cost: new Decimal(600),
			unlocked() { return player["lx"].best.gte(120) },
		},
		23: {
			title: function() { return L("鵙始鸣", "shrikes begin to call") },
			description: function() { return L("候积成算：本节候产 ×(log10(候/" + TUNING.SELF.ADD_DIV + "+1)+1)^" + TUNING.SELF.ADD_EXP + "。", "Pentads into reckoning: x (log10(候/" + TUNING.SELF.ADD_DIV + "+1)+1)^" + TUNING.SELF.ADD_EXP + ".") },
			cost: new Decimal(3000),
			effect() { return player["lx"].points.div(TUNING.SELF.ADD_DIV).add(1).log(10).add(1).pow(TUNING.SELF.ADD_EXP) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		24: {
			title: function() { return L("反舌无声", "mockingbirds fall silent") },
			description: function() { return L("候簿之数更精：本节候簿的效果指数改为 ^1 ~ ^1.1（随本节历代之最而长）。", "The ledger reads finer: its effect exponent becomes ^1 .. ^1.1, growing with this node's lifetime best.") },
			cost: new Decimal(20000),
			effect() {
				return new Decimal(1).add(player["lx"].best.add(1).log(10).div(20)).min(1.1)
			},
			effectDisplay() { return "候簿效果 ^" + format(this.effect()) },
		},
		25: {
			title: function() { return L("反舌无声·候簿", "mockingbirds fall silent · Ledger") },
			description: function() { return L("开启本节的候簿（buyable 页）：以本节之候买断九候之数。", "Unlock this node's pentad ledger (a buyable): spend this node's 候 to bank its nine pentads.") },
			cost: new Decimal(100000),
			unlocked() { return player["lx"].best.gte(200) },
		},
	},
	milestones: {
		0: {
			requirementDescription: function() { return L("立夏候 ≥ 1", "1 Lixia Hou") },
			effectDescription: function() { return L("本节候产 ×1.5；已察之候交节不失。", "This node's output x1.5; observed pentads are never lost to a reset.") },
			done() { return player["lx"].best.gte(1) },
		},
		1: {
			requirementDescription: function() { return L("立夏候 ≥ 8", "8 Lixia Hou") },
			effectDescription: function() { return L("交节自行 —— 本节每秒自交一次。", "The season turns by itself — this node prestiges once a second.") },
			done() { return player["lx"].best.gte(8) },
		},
		2: {
			requirementDescription: function() { return L("立夏候 ≥ 40", "40 Lixia Hou") },
			effectDescription: function() { return L("本节之候自购（可买即买）。", "This node's 候 buy themselves whenever they are affordable.") },
			done() { return player["lx"].best.gte(40) },
		},
		3: {
			requirementDescription: function() { return L("本节九候尽察", "All nine pentads of this 节") },
			effectDescription: function() { return L("日影 ×3；夏至 得此节之授（夏至 的候产 ×10）。", "Sun-shadow x3; Summer Solstice receives this teaching (Summer Solstice's output x10).") },
			done() { return houOwned("lx") >= 9 },
		},
	},
	buyables: {
		11: {
			title: function() { return L("候簿", "Pentad Ledger") },
			display() {
				let amt = getBuyableAmount("lx", 11)
				let eff = buyableEffect("lx", 11)
				let cost = this.cost()
				return L("已录 <b>" + formatWhole(amt) + "</b> 候<br>本节候产 ×<b>" + format(eff) + "</b><br>下一笔 <b>" + format(cost) + "</b> 候", "recorded <b>" + formatWhole(amt) + "</b> pentads<br>this node's output x<b>" + format(eff) + "</b><br>next <b>" + format(cost) + "</b> 候")
			},
			cost(amount) { return new Decimal(TUNING.BUY_COST_BASE).times(Decimal.pow(TUNING.BUY_COST_MULT, amount)) },
			effect(amount) {
				let ret = new Decimal(TUNING.BUY_EFFECT_MULT).pow(amount)
				if (hasUpgrade("lx", 24)) ret = ret.pow(upgradeEffect("lx", 24))
				return ret
			},
			unlocked() { return hasUpgrade("lx", 25) },
			canAfford() { return player["lx"].points.gte(this.cost()) },
			buy() {
				player["lx"].points = player["lx"].points.sub(this.cost())
				setBuyableAmount("lx", 11, getBuyableAmount("lx", 11).add(1))
			},
			buyMax() {
				let n = 0
				while (this.canAfford() && n < 50) { this.buy(); n++ }
			},
		},
	},
	clickables: {
		11: {
			title: function() { return L("开渠", "Open the canal") },
			display() {
				if (!lxCanalReady()) return L("雨未满 —— 待雨 <b>" + format(player.lx.rain, 1) + "</b> / 100", "not yet — rain <b>" + format(player.lx.rain, 1) + "</b> / 100")
			return L("开渠得 <b>" + format(new Decimal(TUNING.RAIN_REWARD).times(lxRainMult())) + "</b> 立夏候", "cash the rain for <b>" + format(new Decimal(TUNING.RAIN_REWARD).times(lxRainMult())) + "</b> 立夏候")
			},
			canClick() { return lxCanalReady() },
			onClick() { lxOpenCanal() },
			style() { return { "width": "260px", "height": "60px" } },
		},
	},

	bars: {
		1: {
			direction: RIGHT,
			width: 300,
			height: 30,
			progress() { return Math.min(1, player.lx.rain / 100) },
			display() {
				return L("雨量 " + format(player.lx.rain, 1) + " / 100　（每 " + format(lxRainTime(), 1) + " 秒一满）", "rain " + format(player.lx.rain, 1) + " / 100 (full every " + format(lxRainTime(), 1) + "s)")
			},
			unlocked() { return player.lx.unlocked },
		},
	},

	update(diff) {
		if (!player.lx.unlocked) return
		if (player.lx.rain < 100) player.lx.rain = Math.min(100, player.lx.rain + diff * 100 / lxRainTime())
	},
	tabFormat: [
		["display-text", function() { return mainAmount("lx", true) }],
		["display-text", function() {
			let cap = new Decimal(TUNING.SOFTCAP.lx)
			if (hasUpgrade("lx", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)
			if (hasUpgrade("al", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)
			return L("本节软上限 <b>" + format(cap) + "</b>（越此按 ^" + TUNING.SOFTCAP_POWER + " 计）", "softcap <b>" + format(cap) + "</b> (above it, ^" + TUNING.SOFTCAP_POWER + ")")
		}],
		"blank",
		"prestige-button",
		"blank",
		["microtabs", "stuff"],
	],
	microtabs: {
		stuff: {
			"九候 · Pentads": {
				content: [["upgrades", [1, 2]]],
			},
			"雨量 · Rain": {
				content: [["bar", "1"], "blank", ["clickables", [1]]],
			},
			"候簿 · Ledger": {
				content: [["buyables", [1]]],
				unlocked() { return hasUpgrade("lx", 25) },
			},
			"碑 · Stele": {
				content: [["milestones", [0, 1, 2, 3]]],
			},
		},
	},
})
