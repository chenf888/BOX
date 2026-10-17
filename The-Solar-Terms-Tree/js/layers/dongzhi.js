/* =========================================================================
 *  冬至 / dz  —  row 7, the eighth 节 of the year.
 *  冬至 · 小寒 · 大寒  —  its nine pentads are this node's upgrades:
 *  蚯蚓结 / 麋角解 / 水泉动 / 雁北乡 / 鹊始巢 / 雉始雊 / 鸡始乳 / 征鸟厉疾 / 水泽腹坚
 *
 *  FILE-SCOPE RULE: the engine re-runs every function that lives INSIDE `layers` on each
 *  temp refresh (~20x/sec) to fill tmp, so anything that MUTATES player state lives out here
 *  instead. That is also why doNotCallTheseFunctionsEveryTick stays empty in mod.js — none
 *  of the mutators below are layer properties at all.
 * ========================================================================= */

/* ---- 数九 (M4, hard cap 81) --------------------------------------------
 *  冬至一阳生: from the solstice the days are counted in nines, nine nines
 *  to a full 九九 (81 days). One count per cooldown, and 81 is the ceiling —
 *  the theme's own number, not an invented one. A completed 九九 warms the
 *  whole year (mod.js's getPointGen reads player.dz.nine).
 * ----------------------------------------------------------------------- */
function dzNineReady() { return player.dz.nine < TUNING.NINE_NINE_MAX && player.dz.nineCool <= 0 }
function dzCountNine() {
	if (!player.dz.unlocked || !dzNineReady()) return
	player.dz.nine++
	player.dz.nineCool = TUNING.NINE_NINE_TICK
	if (player.dz.nine >= TUNING.NINE_NINE_MAX) {
		player.dz.nineDone++
		addPoints("dz", new Decimal(9).times(9))
	}
}
function dzNineCoolTime() { return TUNING.NINE_NINE_TICK }
addLayer("dz", {
	name: function() { return L("冬至", "Winter Solstice") },
	symbol: function() { return L("冬至", "DZ") },
	position: 0,
	row: 7,
	branches: ["sui"],
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
		nine: 0,                // 数九 0..81 (hard cap — the theme's own number)
		nineCool: 0,
		nineDone: 0,
	}},
	color: "#64B5F6",
	resource: function() { return L("冬至候", "Dongzhi Hou") },
	baseResource: function() { return L("立冬候", "Lidong Hou") },
	baseAmount() { return player.ld.points },
	requires: new Decimal(6.103515625e10),
	type: "normal",
	exponent: 0.22,
	softcap() {
		let cap = new Decimal(TUNING.SOFTCAP.dz)
		if (hasUpgrade("dz", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)
		if (hasUpgrade("al", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)
		return cap
	},
	softcapPower: TUNING.SOFTCAP_POWER,
	gainMult() {
		let ret = new Decimal(1)
		if (hasUpgrade("dz", 11)) ret = ret.times(upgradeEffect("dz", 11))
		if (hasUpgrade("dz", 12)) ret = ret.times(upgradeEffect("dz", 12))
		if (hasUpgrade("dz", 13)) ret = ret.times(upgradeEffect("dz", 13))
		if (hasUpgrade("dz", 14)) ret = ret.times(upgradeEffect("dz", 14))
		if (hasUpgrade("dz", 21)) ret = ret.times(upgradeEffect("dz", 21))
		if (hasUpgrade("dz", 23)) ret = ret.times(upgradeEffect("dz", 23))
		if (hasUpgrade("dz", 25)) ret = ret.times(buyableEffect("dz", 11))
		if (hasMilestone("dz", 0)) ret = ret.times(1.5)
		if (hasUpgrade("al", 12)) ret = ret.times(upgradeEffect("al", 12))
		if (getBuyableAmount("al", 12).gt(0)) ret = ret.times(buyableEffect("al", 12))
		if (hasMilestone("ld", 3)) ret = ret.times(3)
		ret = ret.times(player.points.add(1).log(10).div(TUNING.SELF.BASE_LOG_DIV).add(1).pow(0.5))
		ret = ret.times(suiTrialMult())
		return ret
	},
	gainExp() { return new Decimal(1) },
	passiveGeneration() {
		if (hasMilestone("dz", 1) || hasMilestone("sui", 3)) return 1
		return 0
	},
	autoUpgrade() {
		if (hasMilestone("dz", 2) || hasMilestone("sui", 3)) return true
		return false
	},
	resetsNothing() {
		if (hasMilestone("sui", 3)) return true
		return false
	},
	layerShown() { return player["dz"].unlocked || player["ld"].best.gte(1220703125) },
	prestigeButtonText() {
		return L("交节得 <b>" + formatWhole(tmp["dz"].resetGain) + "</b> " + tmp["dz"].resource, "Turn the season for <b>" + formatWhole(tmp["dz"].resetGain) + "</b> " + tmp["dz"].resource) +
			(player["dz"].points.lt(100) ? "<br><br>" + L("下一候需 " + format(tmp["dz"].nextAt) + " 立冬候", "Next at " + format(tmp["dz"].nextAt) + " Lidong Hou") : "")
	},
	doReset(resettingLayer) {
		// P9 — STRICTLY deeper only. The engine grants the 交节 gain with addPoints()
		// BEFORE rowReset(row…0) walks back down and calls this hook, so a `>=` test
		// (or an explicit self-match) rebuilds the layer from startData right after
		// the grant and silently throws the 候 away: best climbs, points stay 0, and
		// nothing is ever affordable. The 候 are a bank: a deeper 节 wipes them, the
		// layer's own 交节 only adds to them.
		if (layers[resettingLayer].row > this.row) {
			layerDataReset("dz", ["unlocked", "best", "total", "upgrades", "milestones"])
		}
	},
	upgrades: {
		11: {
			title: function() { return L("蚯蚓结", "earthworms knot") },
			description: function() { return L("本节候产与日影产出 ×" + TUNING.UPG_MULT[11] + "。", "This node's 候 output and the sun-shadow output x" + TUNING.UPG_MULT[11] + ".") },
			cost: new Decimal(1),
			effect() { return new Decimal(TUNING.UPG_MULT[11]) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		12: {
			title: function() { return L("麋角解", "elks shed their antlers") },
			description: function() { return L("本节的候产 ×" + TUNING.UPG_MULT[12] + "。", "This node's 候 output x" + TUNING.UPG_MULT[12] + ".") },
			cost: new Decimal(3),
			effect() { return new Decimal(TUNING.UPG_MULT[12]) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		13: {
			title: function() { return L("水泉动", "the springs begin to move") },
			description: function() { return L("本节之候自养：影愈长，察愈明 —— 本节候产 ×(候+1)^" + TUNING.SELF.SQRT_EXP + "，上限 ×" + TUNING.SELF.SQRT_CAP + "。", "The pentads feed on themselves: x (pentads+1)^" + TUNING.SELF.SQRT_EXP + ", capped at x" + TUNING.SELF.SQRT_CAP + ".") },
			cost: new Decimal(9),
			effect() {
				let v = player["dz"].points.add(1).pow(TUNING.SELF.SQRT_EXP)
				if (v.gt(TUNING.SELF.SQRT_CAP)) v = v.div(TUNING.SELF.SQRT_CAP).pow(0.4).times(TUNING.SELF.SQRT_CAP)
				return v
			},
			effectDisplay() { return "×" + format(this.effect()) },
		},
		14: {
			title: function() { return L("雁北乡", "wild geese head north") },
			description: function() { return L("积候成数：本节候产 ×(log10(候+10)/" + TUNING.SELF.LOG_DIV + "+1)。", "Pentads accumulate: x (log10(pentads+10)/" + TUNING.SELF.LOG_DIV + "+1).") },
			cost: new Decimal(30),
			effect() { return player["dz"].points.add(10).log(10).div(TUNING.SELF.LOG_DIV).add(1) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		15: {
			title: function() { return L("鹊始巢", "magpies build their nests") },
			description: function() { return L("候及上节：立冬 的候产 ×(log10(立冬候+1)+1)。", "The pentad reaches the 节 above: Winter Begins's output x (log10(Lidong Hou+1)+1).") },
			cost: new Decimal(120),
			effect() { return player["ld"].points.add(1).log(10).add(1) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		21: {
			title: function() { return L("雉始雊", "pheasants begin to call") },
			description: function() { return L("立冬九候既察之后，本节候产 ×2。", "Once Winter Begins's nine pentads are all observed, this node's output x2.") },
			cost: new Decimal(7),
			effect() {
				if (hasMilestone("ld", 3)) return new Decimal(2)
				return new Decimal(1)
			},
			effectDisplay() { return "×" + format(this.effect()) },
		},
		22: {
			title: function() { return L("鸡始乳", "hens begin to brood") },
			description: function() { return L("本节的软上限 ×1000（上限显示在本页顶）。", "This node's softcap x1000 (shown at the top of its tab).") },
			cost: new Decimal(600),
			unlocked() { return player["dz"].best.gte(120) },
		},
		23: {
			title: function() { return L("征鸟厉疾", "birds of prey circle swiftly") },
			description: function() { return L("候积成算：本节候产 ×(log10(候/" + TUNING.SELF.ADD_DIV + "+1)+1)^" + TUNING.SELF.ADD_EXP + "。", "Pentads into reckoning: x (log10(候/" + TUNING.SELF.ADD_DIV + "+1)+1)^" + TUNING.SELF.ADD_EXP + ".") },
			cost: new Decimal(3000),
			effect() { return player["dz"].points.div(TUNING.SELF.ADD_DIV).add(1).log(10).add(1).pow(TUNING.SELF.ADD_EXP) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		24: {
			title: function() { return L("水泽腹坚", "the ice hardens to its centre") },
			description: function() { return L("候簿之数更精：本节候簿的效果指数改为 ^1 ~ ^1.1（随本节历代之最而长）。", "The ledger reads finer: its effect exponent becomes ^1 .. ^1.1, growing with this node's lifetime best.") },
			cost: new Decimal(20000),
			effect() {
				return new Decimal(1).add(player["dz"].best.add(1).log(10).div(20)).min(1.1)
			},
			effectDisplay() { return L("候簿效果 ^", "ledger effect ^") + format(this.effect()) },
		},
		25: {
			title: function() { return L("水泽腹坚·候簿", "the ice hardens to its centre · Ledger") },
			description: function() { return L("开启本节的候簿（buyable 页）：以本节之候买断九候之数。", "Unlock this node's pentad ledger (a buyable): spend this node's 候 to bank its nine pentads.") },
			cost: new Decimal(100000),
			unlocked() { return player["dz"].best.gte(200) },
		},
	},
	milestones: {
		0: {
			requirementDescription: function() { return L("冬至候 ≥ 1", "1 Dongzhi Hou") },
			effectDescription: function() { return L("本节候产 ×1.5；已察之候交节不失。", "This node's output x1.5; observed pentads are never lost to a reset.") },
			done() { return player["dz"].best.gte(1) },
		},
		1: {
			requirementDescription: function() { return L("冬至候 ≥ 8", "8 Dongzhi Hou") },
			effectDescription: function() { return L("交节自行 —— 本节每秒自交一次。", "The season turns by itself — this node prestiges once a second.") },
			done() { return player["dz"].best.gte(8) },
		},
		2: {
			requirementDescription: function() { return L("冬至候 ≥ 40", "40 Dongzhi Hou") },
			effectDescription: function() { return L("本节之候自购（可买即买）。", "This node's 候 buy themselves whenever they are affordable.") },
			done() { return player["dz"].best.gte(40) },
		},
		3: {
			requirementDescription: function() { return L("本节九候尽察", "All nine pentads of this 节") },
			effectDescription: function() { return L("日影 ×3；岁 得此节之授（岁 的候产 ×10）。", "Sun-shadow x3; the Year receives this teaching (the Year's output x10).") },
			done() { return houOwned("dz") >= 9 },
		},
	},
	buyables: {
		11: {
			title: function() { return L("候簿", "Pentad Ledger") },
			display() {
				let amt = getBuyableAmount("dz", 11)
				let eff = buyableEffect("dz", 11)
				let cost = this.cost()
				return L("已录 <b>" + formatWhole(amt) + "</b> 候<br>本节候产 ×<b>" + format(eff) + "</b><br>下一笔 <b>" + format(cost) + "</b> 候", "recorded <b>" + formatWhole(amt) + "</b> pentads<br>this node's output x<b>" + format(eff) + "</b><br>next <b>" + format(cost) + "</b> 候")
			},
			cost(amount) { return new Decimal(TUNING.BUY_COST_BASE).times(Decimal.pow(TUNING.BUY_COST_MULT, amount)) },
			effect(amount) {
				let ret = new Decimal(TUNING.BUY_EFFECT_MULT).pow(amount)
				if (hasUpgrade("dz", 24)) ret = ret.pow(upgradeEffect("dz", 24))
				return ret
			},
			unlocked() { return hasUpgrade("dz", 25) },
			canAfford() { return player["dz"].points.gte(this.cost()) },
			buy() {
				player["dz"].points = player["dz"].points.sub(this.cost())
				setBuyableAmount("dz", 11, getBuyableAmount("dz", 11).add(1))
			},
			buyMax() {
				let n = 0
				while (this.canAfford() && n < 50) { this.buy(); n++ }
			},
		},
	},
	clickables: {
		11: {
			title: function() { return L("数九", "Count a nine") },
			display() {
				if (player.dz.nine >= TUNING.NINE_NINE_MAX) return L("九九已尽 —— 冬至候 +9×9", "the nine nines are done — 冬至候 +9x9")
				if (player.dz.nineCool > 0) return L("再等 <b>" + format(player.dz.nineCool, 1) + "</b> 秒", "wait <b>" + format(player.dz.nineCool, 1) + "</b>s")
				return L("<b>" + player.dz.nine + "</b> / " + TUNING.NINE_NINE_MAX + "　（每 " + TUNING.NINE_NINE_TICK + " 秒可数一次）", "<b>" + player.dz.nine + "</b> / " + TUNING.NINE_NINE_MAX + " (once every " + TUNING.NINE_NINE_TICK + "s)")
			},
			canClick() { return dzNineReady() },
			onClick() { dzCountNine() },
			style() { return { "width": "280px", "height": "60px" } },
		},
	},

	bars: {
		1: {
			direction: RIGHT,
			width: 300,
			height: 30,
			progress() { return Math.min(1, player.dz.nine / TUNING.NINE_NINE_MAX) },
			display() {
				return L("九九 " + player.dz.nine + " / " + TUNING.NINE_NINE_MAX + "　（" + player.dz.nineDone + " 次九九）", "nine-nines " + player.dz.nine + " / " + TUNING.NINE_NINE_MAX + " (" + player.dz.nineDone + " completed)")
			},
			unlocked() { return player.dz.unlocked },
		},
	},

	update(diff) {
		if (!player.dz.unlocked) return
		if (player.dz.nineCool > 0) player.dz.nineCool = Math.max(0, player.dz.nineCool - diff)
	},
	tabFormat: [
		["display-text", function() { return mainAmount("dz", true) }],
		["display-text", function() {
			let cap = new Decimal(TUNING.SOFTCAP.dz)
			if (hasUpgrade("dz", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)
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
			"数九 · Counting": {
				content: [["bar", "1"], "blank", ["clickables", [1]]],
			},
			"候簿 · Ledger": {
				content: [["buyables", [1]]],
				unlocked() { return hasUpgrade("dz", 25) },
			},
			"碑 · Stele": {
				content: [["milestones", [0, 1, 2, 3]]],
			},
		},
	},
})
