/* =========================================================================
 *  秋分 / qf  —  row 5, the sixth 节 of the year.
 *  秋分 · 寒露 · 霜降  —  its nine pentads are this node's upgrades:
 *  雷始收声 / 蛰虫坯户 / 水始涸 / 鸿雁来宾 / 雀入大水为蛤 / 菊有黄华 / 豺乃祭兽 / 草木黄落 / 蛰虫咸俯
 *
 *  FILE-SCOPE RULE: the engine re-runs every function that lives INSIDE `layers` on each
 *  temp refresh (~20x/sec) to fill tmp, so anything that MUTATES player state lives out here
 *  instead. That is also why doNotCallTheseFunctionsEveryTick stays empty in mod.js — none
 *  of the mutators below are layer properties at all.
 * ========================================================================= */

/* ---- 仓廪 (M4) ---------------------------------------------------------
 *  仓廪 fills on its own and cashes itself in at 100 — the harvest is not a
 *  decision here, it is a rhythm. 秋分 is the equinox of the harvest, so this
 *  node's bar is the one that pays without being asked.
 * ----------------------------------------------------------------------- */
function qfGranaryMult() {
	let ret = new Decimal(1)
	if (hasMilestone("qf", 3)) ret = ret.times(2)
	if (hasMilestone("qf", 0)) ret = ret.times(1.5)
	return ret
}
function qfGranaryTime() { return TUNING.GRANARY_TIME / qfGranaryMult().toNumber() }
addLayer("qf", {
	name: function() { return L("秋分", "Autumn Equinox") },
	symbol: function() { return L("秋分", "QF") },
	position: 0,
	row: 5,
	branches: ["ld"],
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
		grain: 0,               // 仓廪 0..100
		harvests: 0,
	}},
	color: "#F0B27A",
	resource: function() { return L("秋分候", "Qiufen Hou") },
	baseResource: function() { return L("立秋候", "Liqiu Hou") },
	baseAmount() { return player.lq.points },
	requires: new Decimal(9.765625e7),
	type: "normal",
	exponent: 0.25,
	softcap() {
		let cap = new Decimal(TUNING.SOFTCAP.qf)
		if (hasUpgrade("qf", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)
		if (hasUpgrade("al", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)
		return cap
	},
	softcapPower: TUNING.SOFTCAP_POWER,
	gainMult() {
		let ret = new Decimal(1)
		if (hasUpgrade("qf", 11)) ret = ret.times(upgradeEffect("qf", 11))
		if (hasUpgrade("qf", 12)) ret = ret.times(upgradeEffect("qf", 12))
		if (hasUpgrade("qf", 13)) ret = ret.times(upgradeEffect("qf", 13))
		if (hasUpgrade("qf", 14)) ret = ret.times(upgradeEffect("qf", 14))
		if (hasUpgrade("qf", 21)) ret = ret.times(upgradeEffect("qf", 21))
		if (hasUpgrade("qf", 23)) ret = ret.times(upgradeEffect("qf", 23))
		if (hasUpgrade("qf", 25)) ret = ret.times(buyableEffect("qf", 11))
		if (hasMilestone("qf", 0)) ret = ret.times(1.5)
		if (hasUpgrade("al", 12)) ret = ret.times(upgradeEffect("al", 12))
		if (getBuyableAmount("al", 12).gt(0)) ret = ret.times(buyableEffect("al", 12))
		if (hasMilestone("lq", 3)) ret = ret.times(3)
		if (hasMilestone("ld", 3)) ret = ret.times(10)
		if (hasUpgrade("ld", 15)) ret = ret.times(upgradeEffect("ld", 15))
		ret = ret.times(player.points.add(1).log(10).div(TUNING.SELF.BASE_LOG_DIV).add(1).pow(0.5))
		ret = ret.times(suiTrialMult())
		return ret
	},
	gainExp() { return new Decimal(1) },
	passiveGeneration() {
		if (hasMilestone("qf", 1) || hasMilestone("sui", 3)) return 1
		return 0
	},
	autoUpgrade() {
		if (hasMilestone("qf", 2) || hasMilestone("sui", 3)) return true
		return false
	},
	resetsNothing() {
		if (hasMilestone("sui", 3)) return true
		return false
	},
	layerShown() { return player["qf"].unlocked || player["lq"].best.gte(1953125) },
	prestigeButtonText() {
		return L("交节得 <b>" + formatWhole(tmp["qf"].resetGain) + "</b> " + tmp["qf"].resource, "Turn the season for <b>" + formatWhole(tmp["qf"].resetGain) + "</b> " + tmp["qf"].resource) +
			(player["qf"].points.lt(100) ? "<br><br>" + L("下一候需 " + format(tmp["qf"].nextAt) + " 立秋候", "Next at " + format(tmp["qf"].nextAt) + " Liqiu Hou") : "")
	},
	doReset(resettingLayer) {
		// P9 — STRICTLY deeper only. The engine grants the 交节 gain with addPoints()
		// BEFORE rowReset(row…0) walks back down and calls this hook, so a `>=` test
		// (or an explicit self-match) rebuilds the layer from startData right after
		// the grant and silently throws the 候 away: best climbs, points stay 0, and
		// nothing is ever affordable. The 候 are a bank: a deeper 节 wipes them, the
		// layer's own 交节 only adds to them.
		if (layers[resettingLayer].row > this.row) {
			layerDataReset("qf", ["unlocked", "best", "total", "upgrades", "milestones"])
		}
	},
	upgrades: {
		11: {
			title: function() { return L("雷始收声", "thunder ceases") },
			description: function() { return L("本节候产与日影产出 ×" + TUNING.UPG_MULT[11] + "。", "This node's 候 output and the sun-shadow output x" + TUNING.UPG_MULT[11] + ".") },
			cost: new Decimal(1),
			effect() { return new Decimal(TUNING.UPG_MULT[11]) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		12: {
			title: function() { return L("蛰虫坯户", "insects seal their burrows") },
			description: function() { return L("本节的候产 ×" + TUNING.UPG_MULT[12] + "。", "This node's 候 output x" + TUNING.UPG_MULT[12] + ".") },
			cost: new Decimal(3),
			effect() { return new Decimal(TUNING.UPG_MULT[12]) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		13: {
			title: function() { return L("水始涸", "the waters dry") },
			description: function() { return L("本节之候自养：影愈长，察愈明 —— 本节候产 ×(候+1)^" + TUNING.SELF.SQRT_EXP + "，上限 ×" + TUNING.SELF.SQRT_CAP + "。", "The pentads feed on themselves: x (pentads+1)^" + TUNING.SELF.SQRT_EXP + ", capped at x" + TUNING.SELF.SQRT_CAP + ".") },
			cost: new Decimal(9),
			effect() {
				let v = player["qf"].points.add(1).pow(TUNING.SELF.SQRT_EXP)
				if (v.gt(TUNING.SELF.SQRT_CAP)) v = v.div(TUNING.SELF.SQRT_CAP).pow(0.4).times(TUNING.SELF.SQRT_CAP)
				return v
			},
			effectDisplay() { return "×" + format(this.effect()) },
		},
		14: {
			title: function() { return L("鸿雁来宾", "swan geese arrive as guests") },
			description: function() { return L("积候成数：本节候产 ×(log10(候+10)/" + TUNING.SELF.LOG_DIV + "+1)。", "Pentads accumulate: x (log10(pentads+10)/" + TUNING.SELF.LOG_DIV + "+1).") },
			cost: new Decimal(30),
			effect() { return player["qf"].points.add(10).log(10).div(TUNING.SELF.LOG_DIV).add(1) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		15: {
			title: function() { return L("雀入大水为蛤", "sparrows turn to clams") },
			description: function() { return L("候及上节：立秋 的候产 ×(log10(立秋候+1)+1)。", "The pentad reaches the 节 above: Autumn Begins's output x (log10(Liqiu Hou+1)+1).") },
			cost: new Decimal(120),
			effect() { return player["lq"].points.add(1).log(10).add(1) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		21: {
			title: function() { return L("菊有黄华", "chrysanthemums bloom") },
			description: function() { return L("立秋九候既察之后，本节候产 ×2。", "Once Autumn Begins's nine pentads are all observed, this node's output x2.") },
			cost: new Decimal(7),
			effect() {
				if (hasMilestone("lq", 3)) return new Decimal(2)
				return new Decimal(1)
			},
			effectDisplay() { return "×" + format(this.effect()) },
		},
		22: {
			title: function() { return L("豺乃祭兽", "jackals lay out their kill") },
			description: function() { return L("本节的软上限 ×1000（上限显示在本页顶）。", "This node's softcap x1000 (shown at the top of its tab).") },
			cost: new Decimal(600),
			unlocked() { return player["qf"].best.gte(120) },
		},
		23: {
			title: function() { return L("草木黄落", "plants yellow and fall") },
			description: function() { return L("候积成算：本节候产 ×(log10(候/" + TUNING.SELF.ADD_DIV + "+1)+1)^" + TUNING.SELF.ADD_EXP + "。", "Pentads into reckoning: x (log10(候/" + TUNING.SELF.ADD_DIV + "+1)+1)^" + TUNING.SELF.ADD_EXP + ".") },
			cost: new Decimal(3000),
			effect() { return player["qf"].points.div(TUNING.SELF.ADD_DIV).add(1).log(10).add(1).pow(TUNING.SELF.ADD_EXP) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		24: {
			title: function() { return L("蛰虫咸俯", "insects all bow down") },
			description: function() { return L("候簿之数更精：本节候簿的效果指数改为 ^1 ~ ^1.1（随本节历代之最而长）。", "The ledger reads finer: its effect exponent becomes ^1 .. ^1.1, growing with this node's lifetime best.") },
			cost: new Decimal(20000),
			effect() {
				return new Decimal(1).add(player["qf"].best.add(1).log(10).div(20)).min(1.1)
			},
			effectDisplay() { return L("候簿效果 ^", "ledger effect ^") + format(this.effect()) },
		},
		25: {
			title: function() { return L("蛰虫咸俯·候簿", "insects all bow down · Ledger") },
			description: function() { return L("开启本节的候簿（buyable 页）：以本节之候买断九候之数。", "Unlock this node's pentad ledger (a buyable): spend this node's 候 to bank its nine pentads.") },
			cost: new Decimal(100000),
			unlocked() { return player["qf"].best.gte(200) },
		},
	},
	milestones: {
		0: {
			requirementDescription: function() { return L("秋分候 ≥ 1", "1 Qiufen Hou") },
			effectDescription: function() { return L("本节候产 ×1.5；已察之候交节不失。", "This node's output x1.5; observed pentads are never lost to a reset.") },
			done() { return player["qf"].best.gte(1) },
		},
		1: {
			requirementDescription: function() { return L("秋分候 ≥ 8", "8 Qiufen Hou") },
			effectDescription: function() { return L("交节自行 —— 本节每秒自交一次。", "The season turns by itself — this node prestiges once a second.") },
			done() { return player["qf"].best.gte(8) },
		},
		2: {
			requirementDescription: function() { return L("秋分候 ≥ 40", "40 Qiufen Hou") },
			effectDescription: function() { return L("本节之候自购（可买即买）。", "This node's 候 buy themselves whenever they are affordable.") },
			done() { return player["qf"].best.gte(40) },
		},
		3: {
			requirementDescription: function() { return L("本节九候尽察", "All nine pentads of this 节") },
			effectDescription: function() { return L("日影 ×3；立冬 得此节之授（立冬 的候产 ×10）。", "Sun-shadow x3; Winter Begins receives this teaching (Winter Begins's output x10).") },
			done() { return houOwned("qf") >= 9 },
		},
	},
	buyables: {
		11: {
			title: function() { return L("候簿", "Pentad Ledger") },
			display() {
				let amt = getBuyableAmount("qf", 11)
				let eff = buyableEffect("qf", 11)
				let cost = this.cost()
				return L("已录 <b>" + formatWhole(amt) + "</b> 候<br>本节候产 ×<b>" + format(eff) + "</b><br>下一笔 <b>" + format(cost) + "</b> 候", "recorded <b>" + formatWhole(amt) + "</b> pentads<br>this node's output x<b>" + format(eff) + "</b><br>next <b>" + format(cost) + "</b> 候")
			},
			cost(amount) { return new Decimal(TUNING.BUY_COST_BASE).times(Decimal.pow(TUNING.BUY_COST_MULT, amount)) },
			effect(amount) {
				let ret = new Decimal(TUNING.BUY_EFFECT_MULT).pow(amount)
				if (hasUpgrade("qf", 24)) ret = ret.pow(upgradeEffect("qf", 24))
				return ret
			},
			unlocked() { return hasUpgrade("qf", 25) },
			canAfford() { return player["qf"].points.gte(this.cost()) },
			buy() {
				player["qf"].points = player["qf"].points.sub(this.cost())
				setBuyableAmount("qf", 11, getBuyableAmount("qf", 11).add(1))
			},
			buyMax() {
				let n = 0
				while (this.canAfford() && n < 50) { this.buy(); n++ }
			},
		},
	},
	bars: {
		1: {
			direction: RIGHT,
			width: 300,
			height: 30,
			progress() { return Math.min(1, player.qf.grain / 100) },
			display() {
				return L("仓廪 " + format(player.qf.grain, 1) + " / 100　（每 " + format(qfGranaryTime(), 1) + " 秒一收）", "granary " + format(player.qf.grain, 1) + " / 100 (a harvest every " + format(qfGranaryTime(), 1) + "s)")
			},
			unlocked() { return player.qf.unlocked },
		},
	},

	update(diff) {
		if (!player.qf.unlocked) return
		player.qf.grain = player.qf.grain + diff * 100 / qfGranaryTime()
		while (player.qf.grain >= 100) {
			player.qf.grain = player.qf.grain - 100
			player.qf.harvests++
			addPoints("qf", new Decimal(TUNING.GRANARY_REWARD).times(qfGranaryMult()))
		}
	},
	tabFormat: [
		["display-text", function() { return mainAmount("qf", true) }],
		["display-text", function() {
			let cap = new Decimal(TUNING.SOFTCAP.qf)
			if (hasUpgrade("qf", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)
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
			"仓廪 · Granary": {
				content: [["bar", "1"]],
			},
			"候簿 · Ledger": {
				content: [["buyables", [1]]],
				unlocked() { return hasUpgrade("qf", 25) },
			},
			"碑 · Stele": {
				content: [["milestones", [0, 1, 2, 3]]],
			},
		},
	},
})
