/* =========================================================================
 *  立春 / lc  —  row 0, the first 节 of the year.
 *  立春 · 雨水 · 惊蛰  —  its nine pentads are this node's upgrades:
 *  东风解冻 / 蛰虫始振 / 鱼陟负冰 / 獭祭鱼 / 候雁北 / 草木萌动 / 桃始华 / 仓庚鸣 / 鹰化为鸠
 *
 *  FILE-SCOPE RULE: the engine re-runs every function that lives INSIDE `layers` on each
 *  temp refresh (~20x/sec) to fill tmp, so anything that MUTATES player state lives out here
 *  instead. That is also why doNotCallTheseFunctionsEveryTick stays empty in mod.js — none
 *  of the mutators below are layer properties at all.
 * ========================================================================= */

/* ---- 圭表测影 (M3) — the core verb of the whole game -----------------------
 *  A gnomon casts a shadow; the almanac says how long it should be today.
 *  Three tiles show three readings — one of them is the day's true length.
 *  A correct reading extends the streak (连中之数), which sharpens 日影
 *  production in mod.js's getPointGen(); a wrong one zeroes it. The tiles
 *  move on after every pick, so the answer cannot be brute-forced.
 * ----------------------------------------------------------------------- */
function lcShadowSeed() { return player.lc.shadowSeed }
function lcShadowTarget() { return 10 + (lcShadowSeed() % 9) }
function lcShadowReading(tile) {
	let s = lcShadowSeed()
	let perm = [s % 3, (s + 1) % 3, (s + 2) % 3]   // a rotation: always a permutation
	return lcShadowTarget() + perm[tile - 1]
}
function lcShadowTruth() {
	for (let t = 1; t <= 3; t++) if (lcShadowReading(t) === lcShadowTarget()) return t
	return 1
}
function lcShadowRead(tile) {
	if (!player.lc.unlocked) return
	if (tile === lcShadowTruth()) {
		player.lc.shadowStreak = Math.min(player.lc.shadowStreak + 1, TUNING.SHADOW_STREAK_CAP)
		if (player.lc.shadowStreak > player.lc.shadowBest) player.lc.shadowBest = player.lc.shadowStreak
		player.points = player.points.add(new Decimal(TUNING.SHADOW_CLICK_SHADOW).times(player.lc.shadowStreak))
	} else {
		player.lc.shadowStreak = 0
	}
	player.lc.shadowPicks++
	player.lc.shadowSeed++      // a new reading: the tiles move on
}
function lcShadowLine() {
	let s = player.lc.shadowStreak
	let out = L("日中影长当为 <b>" + lcShadowTarget() + "</b> 寸　·　连中 <b>" + s + "</b> 次（每中 +" + Math.round(TUNING.SHADOW_BONUS * 100) + "% 日影，至多 " + TUNING.SHADOW_STREAK_CAP + " 次）", "Today's shadow should be <b>" + lcShadowTarget() + "</b> cun · streak <b>" + s + "</b> (each +" + Math.round(TUNING.SHADOW_BONUS * 100) + "% 日影, up to " + TUNING.SHADOW_STREAK_CAP + ")")
	if (s === 0 && player.lc.shadowPicks > 0) out += L("　<span style='color:#ff8a80'>影已失，连中断。</span>", " <span style='color:#ff8a80'>the reading is lost; the streak is broken.</span>")
	return out
}
addLayer("lc", {
	name: function() { return L("立春", "Spring Begins") },
	symbol: function() { return L("立春", "LC") },
	position: 0,
	row: 0,
	branches: ["cf","al"],
	startData() { return {
		unlocked: true,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
		shadowSeed: 1,          // which reading the tiles show (numbers, never Decimals — hard rule 11)
		shadowStreak: 0,
		shadowBest: 0,
		shadowPicks: 0,
	}},
	color: "#7ED957",
	resource: function() { return L("立春候", "Lichun Hou") },
	baseResource: function() { return L("日影", "sun-shadow") },
	baseAmount() { return player.points },
	requires: new Decimal(10),
	type: "normal",
	exponent: 0.5,
	softcap() {
		let cap = new Decimal(TUNING.SOFTCAP.lc)
		if (hasUpgrade("lc", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)
		if (hasUpgrade("al", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)
		return cap
	},
	softcapPower: TUNING.SOFTCAP_POWER,
	gainMult() {
		let ret = new Decimal(1)
		if (hasUpgrade("lc", 11)) ret = ret.times(upgradeEffect("lc", 11))
		if (hasUpgrade("lc", 12)) ret = ret.times(upgradeEffect("lc", 12))
		if (hasUpgrade("lc", 13)) ret = ret.times(upgradeEffect("lc", 13))
		if (hasUpgrade("lc", 14)) ret = ret.times(upgradeEffect("lc", 14))
		if (hasUpgrade("lc", 21)) ret = ret.times(upgradeEffect("lc", 21))
		if (hasUpgrade("lc", 23)) ret = ret.times(upgradeEffect("lc", 23))
		if (hasUpgrade("lc", 25)) ret = ret.times(buyableEffect("lc", 11))
		if (hasMilestone("lc", 0)) ret = ret.times(1.5)
		if (hasUpgrade("al", 12)) ret = ret.times(upgradeEffect("al", 12))
		if (getBuyableAmount("al", 12).gt(0)) ret = ret.times(buyableEffect("al", 12))
		if (hasUpgrade("al", 15)) ret = ret.times(upgradeEffect("al", 15))
		if (hasMilestone("cf", 3)) ret = ret.times(10)
		if (hasUpgrade("cf", 15)) ret = ret.times(upgradeEffect("cf", 15))
		ret = ret.times(player.points.add(1).log(10).div(TUNING.SELF.BASE_LOG_DIV).add(1).pow(0.5))
		ret = ret.times(suiTrialMult())
		return ret
	},
	gainExp() { return new Decimal(1) },
	passiveGeneration() {
		if (hasMilestone("lc", 1) || hasMilestone("sui", 3)) return 1
		return 0
	},
	autoUpgrade() {
		if (hasMilestone("lc", 2) || hasMilestone("sui", 3)) return true
		return false
	},
	resetsNothing() {
		if (hasMilestone("sui", 3)) return true
		return false
	},
	layerShown() { return player["lc"].unlocked || true },
	prestigeButtonText() {
		return L("交节得 <b>" + formatWhole(tmp["lc"].resetGain) + "</b> " + tmp["lc"].resource, "Turn the season for <b>" + formatWhole(tmp["lc"].resetGain) + "</b> " + tmp["lc"].resource) +
			(player["lc"].points.lt(100) ? "<br><br>" + L("下一候需 " + format(tmp["lc"].nextAt) + " 日影", "Next at " + format(tmp["lc"].nextAt) + " sun-shadow") : "")
	},
	doReset(resettingLayer) {
		// P9 — STRICTLY deeper only. The engine grants the 交节 gain with addPoints()
		// BEFORE rowReset(row…0) walks back down and calls this hook, so a `>=` test
		// (or an explicit self-match) rebuilds the layer from startData right after
		// the grant and silently throws the 候 away: best climbs, points stay 0, and
		// nothing is ever affordable. The 候 are a bank: a deeper 节 wipes them, the
		// layer's own 交节 only adds to them.
		if (layers[resettingLayer].row > this.row) {
			layerDataReset("lc", ["unlocked", "best", "total", "upgrades", "milestones"])
		}
	},
	upgrades: {
		11: {
			title: function() { return L("东风解冻", "east wind thaws the ice") },
			description: function() { return L("本节候产与日影产出 ×" + TUNING.UPG_MULT[11] + "。", "This node's 候 output and the sun-shadow output x" + TUNING.UPG_MULT[11] + ".") },
			cost: new Decimal(1),
			effect() { return new Decimal(TUNING.UPG_MULT[11]) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		12: {
			title: function() { return L("蛰虫始振", "hibernating insects stir") },
			description: function() { return L("本节的候产 ×" + TUNING.UPG_MULT[12] + "。", "This node's 候 output x" + TUNING.UPG_MULT[12] + ".") },
			cost: new Decimal(3),
			effect() { return new Decimal(TUNING.UPG_MULT[12]) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		13: {
			title: function() { return L("鱼陟负冰", "fish rise against the ice") },
			description: function() { return L("本节之候自养：影愈长，察愈明 —— 本节候产 ×(候+1)^" + TUNING.SELF.SQRT_EXP + "，上限 ×" + TUNING.SELF.SQRT_CAP + "。", "The pentads feed on themselves: x (pentads+1)^" + TUNING.SELF.SQRT_EXP + ", capped at x" + TUNING.SELF.SQRT_CAP + ".") },
			cost: new Decimal(9),
			effect() {
				let v = player["lc"].points.add(1).pow(TUNING.SELF.SQRT_EXP)
				if (v.gt(TUNING.SELF.SQRT_CAP)) v = v.div(TUNING.SELF.SQRT_CAP).pow(0.4).times(TUNING.SELF.SQRT_CAP)
				return v
			},
			effectDisplay() { return "×" + format(this.effect()) },
		},
		14: {
			title: function() { return L("獭祭鱼", "otters lay out their catch") },
			description: function() { return L("积候成数：本节候产 ×(log10(候+10)/" + TUNING.SELF.LOG_DIV + "+1)。", "Pentads accumulate: x (log10(pentads+10)/" + TUNING.SELF.LOG_DIV + "+1).") },
			cost: new Decimal(30),
			effect() { return player["lc"].points.add(10).log(10).div(TUNING.SELF.LOG_DIV).add(1) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		15: {
			title: function() { return L("候雁北", "wild geese head north") },
			description: function() { return L("候及日影：日影产出 ×(log10(日影+1)+1)。", "The pentad reaches the sun-shadow itself: sun-shadow output x (log10(sun-shadow+1)+1).") },
			cost: new Decimal(120),
			effect() { return player.points.add(1).log(10).add(1) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		21: {
			title: function() { return L("草木萌动", "plants put out shoots") },
			description: function() { return L("历书既开（历 · 碑一）之后，本节候产 ×2。", "Once the almanac is opened (almanac stele 1), this node's output x2.") },
			cost: new Decimal(7),
			effect() {
				if (hasMilestone("al", 0)) return new Decimal(2)
				return new Decimal(1)
			},
			effectDisplay() { return "×" + format(this.effect()) },
		},
		22: {
			title: function() { return L("桃始华", "peach trees bloom") },
			description: function() { return L("本节的软上限 ×1000（上限显示在本页顶）。", "This node's softcap x1000 (shown at the top of its tab).") },
			cost: new Decimal(600),
			unlocked() { return player["lc"].best.gte(120) },
		},
		23: {
			title: function() { return L("仓庚鸣", "orioles sing") },
			description: function() { return L("候积成算：本节候产 ×(log10(候/" + TUNING.SELF.ADD_DIV + "+1)+1)^" + TUNING.SELF.ADD_EXP + "。", "Pentads into reckoning: x (log10(候/" + TUNING.SELF.ADD_DIV + "+1)+1)^" + TUNING.SELF.ADD_EXP + ".") },
			cost: new Decimal(3000),
			effect() { return player["lc"].points.div(TUNING.SELF.ADD_DIV).add(1).log(10).add(1).pow(TUNING.SELF.ADD_EXP) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		24: {
			title: function() { return L("鹰化为鸠", "hawks turn to doves") },
			description: function() { return L("候簿之数更精：本节候簿的效果指数改为 ^1 ~ ^1.1（随本节历代之最而长）。", "The ledger reads finer: its effect exponent becomes ^1 .. ^1.1, growing with this node's lifetime best.") },
			cost: new Decimal(20000),
			effect() {
				return new Decimal(1).add(player["lc"].best.add(1).log(10).div(20)).min(1.1)
			},
			effectDisplay() { return L("候簿效果 ^", "ledger effect ^") + format(this.effect()) },
		},
		25: {
			title: function() { return L("鹰化为鸠·候簿", "hawks turn to doves · Ledger") },
			description: function() { return L("开启本节的候簿（buyable 页）：以本节之候买断九候之数。", "Unlock this node's pentad ledger (a buyable): spend this node's 候 to bank its nine pentads.") },
			cost: new Decimal(100000),
			unlocked() { return player["lc"].best.gte(200) },
		},
	},
	milestones: {
		0: {
			requirementDescription: function() { return L("立春候 ≥ 1", "1 Lichun Hou") },
			effectDescription: function() { return L("本节候产 ×1.5；已察之候交节不失。", "This node's output x1.5; observed pentads are never lost to a reset.") },
			done() { return player["lc"].best.gte(1) },
		},
		1: {
			requirementDescription: function() { return L("立春候 ≥ 8", "8 Lichun Hou") },
			effectDescription: function() { return L("交节自行 —— 本节每秒自交一次。", "The season turns by itself — this node prestiges once a second.") },
			done() { return player["lc"].best.gte(8) },
		},
		2: {
			requirementDescription: function() { return L("立春候 ≥ 40", "40 Lichun Hou") },
			effectDescription: function() { return L("本节之候自购（可买即买）。", "This node's 候 buy themselves whenever they are affordable.") },
			done() { return player["lc"].best.gte(40) },
		},
		3: {
			requirementDescription: function() { return L("本节九候尽察", "All nine pentads of this 节") },
			effectDescription: function() { return L("日影 ×3；春分 得此节之授（春分 的候产 ×10）。", "Sun-shadow x3; Spring Equinox receives this teaching (Spring Equinox's output x10).") },
			done() { return houOwned("lc") >= 9 },
		},
	},
	buyables: {
		11: {
			title: function() { return L("候簿", "Pentad Ledger") },
			display() {
				let amt = getBuyableAmount("lc", 11)
				let eff = buyableEffect("lc", 11)
				let cost = this.cost()
				return L("已录 <b>" + formatWhole(amt) + "</b> 候<br>本节候产 ×<b>" + format(eff) + "</b><br>下一笔 <b>" + format(cost) + "</b> 候", "recorded <b>" + formatWhole(amt) + "</b> pentads<br>this node's output x<b>" + format(eff) + "</b><br>next <b>" + format(cost) + "</b> 候")
			},
			cost(amount) { return new Decimal(TUNING.BUY_COST_BASE).times(Decimal.pow(TUNING.BUY_COST_MULT, amount)) },
			effect(amount) {
				let ret = new Decimal(TUNING.BUY_EFFECT_MULT).pow(amount)
				if (hasUpgrade("lc", 24)) ret = ret.pow(upgradeEffect("lc", 24))
				return ret
			},
			unlocked() { return hasUpgrade("lc", 25) },
			canAfford() { return player["lc"].points.gte(this.cost()) },
			buy() {
				player["lc"].points = player["lc"].points.sub(this.cost())
				setBuyableAmount("lc", 11, getBuyableAmount("lc", 11).add(1))
			},
			buyMax() {
				let n = 0
				while (this.canAfford() && n < 50) { this.buy(); n++ }
			},
		},
	},
	clickables: {
		11: {
			title: function() { return L("一候", "First") },
			display() {
				return L("影长 <b>" + lcShadowReading(1) + "</b> 寸", "shadow <b>" + lcShadowReading(1) + "</b> cun")
			},
			canClick() { return player.lc.unlocked },
			onClick() { lcShadowRead(1) },
			style() {
				let s = player.lc.shadowStreak
				return { "border-color": s > 0 ? "#7ED957" : "#666666", "width": "150px", "height": "70px" }
			},
		},
		12: {
			title: function() { return L("二候", "Second") },
			display() {
				return L("影长 <b>" + lcShadowReading(2) + "</b> 寸", "shadow <b>" + lcShadowReading(2) + "</b> cun")
			},
			canClick() { return player.lc.unlocked },
			onClick() { lcShadowRead(2) },
			style() {
				let s = player.lc.shadowStreak
				return { "border-color": s > 0 ? "#7ED957" : "#666666", "width": "150px", "height": "70px" }
			},
		},
		13: {
			title: function() { return L("三候", "Third") },
			display() {
				return L("影长 <b>" + lcShadowReading(3) + "</b> 寸", "shadow <b>" + lcShadowReading(3) + "</b> cun")
			},
			canClick() { return player.lc.unlocked },
			onClick() { lcShadowRead(3) },
			style() {
				let s = player.lc.shadowStreak
				return { "border-color": s > 0 ? "#7ED957" : "#666666", "width": "150px", "height": "70px" }
			},
		},
	},

	update(diff) {
		// the gnomon needs no tick — the tiles are the tick. Kept explicit so the
		// M3 minigame is visible to the harness as a tick-driven layer.
		if (player.lc.shadowPicks < 0) player.lc.shadowPicks = 0
	},
	tabFormat: [
		["display-text", function() { return mainAmount("lc", true) }],
		["display-text", function() {
			let cap = new Decimal(TUNING.SOFTCAP.lc)
			if (hasUpgrade("lc", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)
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
			"圭表 · Gnomon": {
				content: [["display-text", function() { return lcShadowLine() }], "blank", ["clickables", [1]]],
			},
			"候簿 · Ledger": {
				content: [["buyables", [1]]],
				unlocked() { return hasUpgrade("lc", 25) },
			},
			"碑 · Stele": {
				content: [["milestones", [0, 1, 2, 3]]],
			},
		},
	},
})
