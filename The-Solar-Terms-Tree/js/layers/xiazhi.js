/* =========================================================================
 *  夏至 / xz  —  row 3, the fourth 节 of the year.
 *  夏至 · 小暑 · 大暑  —  its nine pentads are this node's upgrades:
 *  鹿角解 / 蜩始鸣 / 半夏生 / 温风至 / 蟋蟀居宇 / 鹰始鸷 / 腐草为萤 / 土润溽暑 / 大雨时行
 *
 *  FILE-SCOPE RULE: the engine re-runs every function that lives INSIDE `layers` on each
 *  temp refresh (~20x/sec) to fill tmp, so anything that MUTATES player state lives out here
 *  instead. That is also why doNotCallTheseFunctionsEveryTick stays empty in mod.js — none
 *  of the mutators below are layer properties at all.
 * ========================================================================= */

addLayer("xz", {
	name: function() { return L("夏至", "Summer Solstice") },
	symbol: function() { return L("夏至", "XZ") },
	position: 0,
	row: 3,
	branches: ["lq"],
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),

	}},
	color: "#FF7043",
	resource: function() { return L("夏至候", "Xiazhi Hou") },
	baseResource: function() { return L("立夏候", "Lixia Hou") },
	baseAmount() { return player.lx.points },
	requires: new Decimal(1.5625e5),
	type: "normal",
	exponent: 0.3,
	softcap() {
		let cap = new Decimal(TUNING.SOFTCAP.xz)
		if (hasUpgrade("xz", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)
		if (hasUpgrade("al", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)
		return cap
	},
	softcapPower: TUNING.SOFTCAP_POWER,
	gainMult() {
		let ret = new Decimal(1)
		if (hasUpgrade("xz", 11)) ret = ret.times(upgradeEffect("xz", 11))
		if (hasUpgrade("xz", 12)) ret = ret.times(upgradeEffect("xz", 12))
		if (hasUpgrade("xz", 13)) ret = ret.times(upgradeEffect("xz", 13))
		if (hasUpgrade("xz", 14)) ret = ret.times(upgradeEffect("xz", 14))
		if (hasUpgrade("xz", 21)) ret = ret.times(upgradeEffect("xz", 21))
		if (hasUpgrade("xz", 23)) ret = ret.times(upgradeEffect("xz", 23))
		if (hasUpgrade("xz", 25)) ret = ret.times(buyableEffect("xz", 11))
		if (hasMilestone("xz", 0)) ret = ret.times(1.5)
		if (hasUpgrade("al", 12)) ret = ret.times(upgradeEffect("al", 12))
		if (getBuyableAmount("al", 12).gt(0)) ret = ret.times(buyableEffect("al", 12))
		if (hasMilestone("lx", 3)) ret = ret.times(3)
		if (hasMilestone("lq", 3)) ret = ret.times(10)
		if (hasUpgrade("lq", 15)) ret = ret.times(upgradeEffect("lq", 15))
		ret = ret.times(player.points.add(1).log(10).div(TUNING.SELF.BASE_LOG_DIV).add(1).pow(0.5))
		ret = ret.times(suiTrialMult())
		return ret
	},
	gainExp() { return new Decimal(1) },
	passiveGeneration() {
		if (hasMilestone("xz", 1) || hasMilestone("sui", 3)) return 1
		return 0
	},
	autoUpgrade() {
		if (hasMilestone("xz", 2) || hasMilestone("sui", 3)) return true
		return false
	},
	resetsNothing() {
		if (hasMilestone("sui", 3)) return true
		return false
	},
	layerShown() { return player["xz"].unlocked || player["lx"].best.gte(3125) },
	prestigeButtonText() {
		return L("交节得 <b>" + formatWhole(tmp["xz"].resetGain) + "</b> " + tmp["xz"].resource, "Turn the season for <b>" + formatWhole(tmp["xz"].resetGain) + "</b> " + tmp["xz"].resource) +
			(player["xz"].points.lt(100) ? "<br><br>" + L("下一候需 " + format(tmp["xz"].nextAt) + " 立夏候", "Next at " + format(tmp["xz"].nextAt) + " Lixia Hou") : "")
	},
	doReset(resettingLayer) {
		// P9 — STRICTLY deeper only. The engine grants the 交节 gain with addPoints()
		// BEFORE rowReset(row…0) walks back down and calls this hook, so a `>=` test
		// (or an explicit self-match) rebuilds the layer from startData right after
		// the grant and silently throws the 候 away: best climbs, points stay 0, and
		// nothing is ever affordable. The 候 are a bank: a deeper 节 wipes them, the
		// layer's own 交节 only adds to them.
		if (layers[resettingLayer].row > this.row) {
			layerDataReset("xz", ["unlocked", "best", "total", "upgrades", "milestones"])
		}
	},
	upgrades: {
		11: {
			title: function() { return L("鹿角解", "deer shed their antlers") },
			description: function() { return L("本节候产与日影产出 ×" + TUNING.UPG_MULT[11] + "。", "This node's 候 output and the sun-shadow output x" + TUNING.UPG_MULT[11] + ".") },
			cost: new Decimal(1),
			effect() { return new Decimal(TUNING.UPG_MULT[11]) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		12: {
			title: function() { return L("蜩始鸣", "cicadas begin to sing") },
			description: function() { return L("本节的候产 ×" + TUNING.UPG_MULT[12] + "。", "This node's 候 output x" + TUNING.UPG_MULT[12] + ".") },
			cost: new Decimal(3),
			effect() { return new Decimal(TUNING.UPG_MULT[12]) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		13: {
			title: function() { return L("半夏生", "pinellia sprouts") },
			description: function() { return L("本节之候自养：影愈长，察愈明 —— 本节候产 ×(候+1)^" + TUNING.SELF.SQRT_EXP + "，上限 ×" + TUNING.SELF.SQRT_CAP + "。", "The pentads feed on themselves: x (pentads+1)^" + TUNING.SELF.SQRT_EXP + ", capped at x" + TUNING.SELF.SQRT_CAP + ".") },
			cost: new Decimal(9),
			effect() {
				let v = player["xz"].points.add(1).pow(TUNING.SELF.SQRT_EXP)
				if (v.gt(TUNING.SELF.SQRT_CAP)) v = v.div(TUNING.SELF.SQRT_CAP).pow(0.4).times(TUNING.SELF.SQRT_CAP)
				return v
			},
			effectDisplay() { return "×" + format(this.effect()) },
		},
		14: {
			title: function() { return L("温风至", "warm winds arrive") },
			description: function() { return L("积候成数：本节候产 ×(log10(候+10)/" + TUNING.SELF.LOG_DIV + "+1)。", "Pentads accumulate: x (log10(pentads+10)/" + TUNING.SELF.LOG_DIV + "+1).") },
			cost: new Decimal(30),
			effect() { return player["xz"].points.add(10).log(10).div(TUNING.SELF.LOG_DIV).add(1) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		15: {
			title: function() { return L("蟋蟀居宇", "crickets take to the walls") },
			description: function() { return L("候及上节：立夏 的候产 ×(log10(立夏候+1)+1)。", "The pentad reaches the 节 above: Summer Begins's output x (log10(Lixia Hou+1)+1).") },
			cost: new Decimal(120),
			effect() { return player["lx"].points.add(1).log(10).add(1) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		21: {
			title: function() { return L("鹰始鸷", "hawks begin to hunt") },
			description: function() { return L("立夏九候既察之后，本节候产 ×2。", "Once Summer Begins's nine pentads are all observed, this node's output x2.") },
			cost: new Decimal(7),
			effect() {
				if (hasMilestone("lx", 3)) return new Decimal(2)
				return new Decimal(1)
			},
			effectDisplay() { return "×" + format(this.effect()) },
		},
		22: {
			title: function() { return L("腐草为萤", "rotten grass becomes fireflies") },
			description: function() { return L("本节的软上限 ×1000（上限显示在本页顶）。", "This node's softcap x1000 (shown at the top of its tab).") },
			cost: new Decimal(600),
			unlocked() { return player["xz"].best.gte(120) },
		},
		23: {
			title: function() { return L("土润溽暑", "the earth is damp and sultry") },
			description: function() { return L("候积成算：本节候产 ×(log10(候/" + TUNING.SELF.ADD_DIV + "+1)+1)^" + TUNING.SELF.ADD_EXP + "。", "Pentads into reckoning: x (log10(候/" + TUNING.SELF.ADD_DIV + "+1)+1)^" + TUNING.SELF.ADD_EXP + ".") },
			cost: new Decimal(3000),
			effect() { return player["xz"].points.div(TUNING.SELF.ADD_DIV).add(1).log(10).add(1).pow(TUNING.SELF.ADD_EXP) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		24: {
			title: function() { return L("大雨时行", "great rains fall") },
			description: function() { return L("候簿之数更精：本节候簿的效果指数改为 ^1 ~ ^1.1（随本节历代之最而长）。", "The ledger reads finer: its effect exponent becomes ^1 .. ^1.1, growing with this node's lifetime best.") },
			cost: new Decimal(20000),
			effect() {
				return new Decimal(1).add(player["xz"].best.add(1).log(10).div(20)).min(1.1)
			},
			effectDisplay() { return L("候簿效果 ^", "ledger effect ^") + format(this.effect()) },
		},
		25: {
			title: function() { return L("大雨时行·候簿", "great rains fall · Ledger") },
			description: function() { return L("开启本节的候簿（buyable 页）：以本节之候买断九候之数。", "Unlock this node's pentad ledger (a buyable): spend this node's 候 to bank its nine pentads.") },
			cost: new Decimal(100000),
			unlocked() { return player["xz"].best.gte(200) },
		},
	},
	milestones: {
		0: {
			requirementDescription: function() { return L("夏至候 ≥ 1", "1 Xiazhi Hou") },
			effectDescription: function() { return L("本节候产 ×1.5；已察之候交节不失。", "This node's output x1.5; observed pentads are never lost to a reset.") },
			done() { return player["xz"].best.gte(1) },
		},
		1: {
			requirementDescription: function() { return L("夏至候 ≥ 8", "8 Xiazhi Hou") },
			effectDescription: function() { return L("交节自行 —— 本节每秒自交一次。", "The season turns by itself — this node prestiges once a second.") },
			done() { return player["xz"].best.gte(8) },
		},
		2: {
			requirementDescription: function() { return L("夏至候 ≥ 40", "40 Xiazhi Hou") },
			effectDescription: function() { return L("本节之候自购（可买即买）。", "This node's 候 buy themselves whenever they are affordable.") },
			done() { return player["xz"].best.gte(40) },
		},
		3: {
			requirementDescription: function() { return L("本节九候尽察", "All nine pentads of this 节") },
			effectDescription: function() { return L("日影 ×3；立秋 得此节之授（立秋 的候产 ×10）。", "Sun-shadow x3; Autumn Begins receives this teaching (Autumn Begins's output x10).") },
			done() { return houOwned("xz") >= 9 },
		},
	},
	buyables: {
		11: {
			title: function() { return L("候簿", "Pentad Ledger") },
			display() {
				let amt = getBuyableAmount("xz", 11)
				let eff = buyableEffect("xz", 11)
				let cost = this.cost()
				return L("已录 <b>" + formatWhole(amt) + "</b> 候<br>本节候产 ×<b>" + format(eff) + "</b><br>下一笔 <b>" + format(cost) + "</b> 候", "recorded <b>" + formatWhole(amt) + "</b> pentads<br>this node's output x<b>" + format(eff) + "</b><br>next <b>" + format(cost) + "</b> 候")
			},
			cost(amount) { return new Decimal(TUNING.BUY_COST_BASE).times(Decimal.pow(TUNING.BUY_COST_MULT, amount)) },
			effect(amount) {
				let ret = new Decimal(TUNING.BUY_EFFECT_MULT).pow(amount)
				if (hasUpgrade("xz", 24)) ret = ret.pow(upgradeEffect("xz", 24))
				return ret
			},
			unlocked() { return hasUpgrade("xz", 25) },
			canAfford() { return player["xz"].points.gte(this.cost()) },
			buy() {
				player["xz"].points = player["xz"].points.sub(this.cost())
				setBuyableAmount("xz", 11, getBuyableAmount("xz", 11).add(1))
			},
			buyMax() {
				let n = 0
				while (this.canAfford() && n < 50) { this.buy(); n++ }
			},
		},
	},
	tabFormat: [
		["display-text", function() { return mainAmount("xz", true) }],
		["display-text", function() {
			let cap = new Decimal(TUNING.SOFTCAP.xz)
			if (hasUpgrade("xz", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)
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
			"候簿 · Ledger": {
				content: [["buyables", [1]]],
				unlocked() { return hasUpgrade("xz", 25) },
			},
			"碑 · Stele": {
				content: [["milestones", [0, 1, 2, 3]]],
			},
		},
	},
})
