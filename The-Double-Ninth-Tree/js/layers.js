// ===========================================================================
// 山道 p — row 0, the anchor. Discrete climb verb (active-click): every 攀一步
// tap is one step up the mountain path. 登程 is earned by re-staking the path
// (normal 0.5 prestige) and feeds the four row-1 branches.
// ===========================================================================
addLayer("p", {
	name: function() { return L("山道", "Mountain Path") },
	symbol: "山",
	position: 0,
	color: "#4BDC13",
	resource: function() { return L("登程", "journey tokens") },
	row: 0,
	startData() { return {
		unlocked: true,
		points: new Decimal(0),
		total: new Decimal(0),
		best: new Decimal(0),
		clickables: { 11: "行" },
	}},
	baseResource: function() { return L("山道里程", "path mileage") },
	baseAmount() { return player.points },
	requires: new Decimal(TUNING.pReq),
	type: "normal",
	exponent: TUNING.pExp,

	// P12: the gain cap starts just past the last row-1 unlock (x, 2000 登程).
	// The cap is VISIBLE (display-text above the tabs) and sold back via u15.
	softcap() {
		if (hasUpgrade("p", 15)) return new Decimal(TUNING.pCapUp)
		return new Decimal(TUNING.pCap)
	},
	softcapPower() { return new Decimal(TUNING.pCapPow) },

	gainMult() {
		let m = new Decimal(1)
		if (hasUpgrade("p", 14)) m = m.times(upgradeEffect("p", 14))
		// cross-era web lines (P10: the climb is never left behind)
		if (hasUpgrade("g", 31)) m = m.times(upgradeEffect("g", 31))
		if (hasUpgrade("s", 31)) m = m.times(upgradeEffect("s", 31))
		if (hasUpgrade("m", 31)) m = m.times(upgradeEffect("m", 31))
		if (hasUpgrade("f", 31)) m = m.times(upgradeEffect("f", 31))
		if (hasUpgrade("y", 31)) m = m.times(upgradeEffect("y", 31))
		return m
	},
	gainExp() { return new Decimal(1) },

	layerShown() { return true },
	tooltip() { return L("登高：把山道里程重整为登程。", "Climb: stake the path for journey tokens.") },

	// The climb verb. tmp.p.clickGain is the single consumer of the K4 upgrades.
	clickGain() {
		let g = new Decimal(1)
		if (hasUpgrade("p", 23)) g = g.times(upgradeEffect("p", 23))
		g = g.times(tmp.d.charmGuard)            // 茱佩护身 (K4 named mechanic, lives on d)
		g = g.add(getBuyableAmount(this.layer, 11))
		return g
	},

	// P4 automation ladder (steps 2–4): plain-number passive, boolean auto flags
	// (N-PGBOOL-safe), and c41「孤登」 silences every automation on the mountain.
	passiveGeneration() {
		if (inChallenge("f", 41)) return 0
		if (hasMilestone("p", 1)) return 1
		return 0
	},
	autoPrestige() {
		if (inChallenge("f", 41)) return false
		if (hasMilestone("p", 2)) return true
		return false
	},
	// N-AUTOWIPE: autoPrestige gate {p:2} implies the resetsNothing gate {p:2}.
	resetsNothing() {
		if (hasMilestone("p", 2)) return true
		return false
	},
	autoUpgrade() {
		if (inChallenge("f", 41)) return false
		if (hasMilestone("p", 3)) return true
		return false
	},

	doReset(resettingLayer) {
		let kept = ["best", "total"]
		if (hasMilestone("p", 0)) kept.push("upgrades")
		if (hasMilestone("p", 3)) kept.push("buyables")
		layerDataReset(this.layer, kept)
	},

	hotkeys: [
		{ key: "p",
		  description: function() { return L("P：重整山道，换登程", "P: stake the path for journey tokens") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],

	upgrades: {
		11: {
			title: function() { return L("石径", "Stone Path") },
			description: function() { return L("山道里程 +100%。", "Path gain ×2.") },
			cost: new Decimal(1),
		},
		12: {
			title: function() { return L("松风", "Pine Wind") },
			description: function() { return L("山道里程 +200%。", "Path gain ×3.") },
			cost: new Decimal(5),
			unlocked() { return hasUpgrade(this.layer, 11) },
		},
		13: {
			title: function() { return L("回声", "Echo") },
			description: function() { return L("山道里程 ×（里程十进制位 + 1）：走得越远，回声越响。", "Path gain ×(log10(mileage)+1): the farther you go, the louder the echo.") },
			cost: new Decimal(20),
			unlocked() { return hasUpgrade(this.layer, 12) },
			effect() { return player.points.add(1).log10().add(1) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		14: {
			title: function() { return L("登程积习", "Worn Trail") },
			description: function() { return L("登程获取 ×（登程 + 1）^0.4。", "Journey gain ×(journey+1)^0.4.") },
			cost: new Decimal(60),
			unlocked() { return hasUpgrade(this.layer, 13) },
			effect() { return player[this.layer].points.add(1).pow(0.4) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		15: {
			title: function() { return L("山径拓宽", "Widened Trail") },
			description: function() { return L("登程软帽自 3,000 延至 1e8（软帽在要略中可见）。", "Journey soft cap delayed from 3,000 to 1e8 (cap visible in the briefing).") },
			cost: new Decimal(250),
			unlocked() { return hasUpgrade(this.layer, 14) },
			effectDisplay() { return L("软帽 → 1e8", "soft cap → 1e8") },
		},
		21: {
			title: function() { return L("菊影伴山", "Chrysanthem Shadows") },
			description: function() { return L("山道里程 ×（菊精 + 1）^0.5。", "Path gain ×(chrysanthem essence+1)^0.5.") },
			cost: new Decimal(400),
			unlocked() { return hasUpgrade(this.layer, 15) },
			effect() { return player.k.points.add(1).pow(0.5) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		22: {
			title: function() { return L("酒香十里", "Wine Scent") },
			description: function() { return L("（键：顺路闻见）山道里程 ×（酒力峰值 + 1）^0.5。", "(key, picked up along the way) path gain ×(best wine+1)^0.5.") },
			cost: new Decimal(300),
			unlocked() { return hasUpgrade(this.layer, 21) },
			effect() { return player.j.best.add(1).pow(0.5) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		23: {
			title: function() { return L("健步", "Strides") },
			description: function() { return L("攀一步 ×2。", "Each step of 攀一步 ×2.") },
			cost: new Decimal(1500),
			unlocked() { return hasUpgrade(this.layer, 22) },
			effect() { return new Decimal(2) },
			effectDisplay() { return "×2" },
		},
		24: {
			title: function() { return L("秋山同登", "Shared Ascent") },
			description: function() { return L("菊田既开，山道里程 ×4。", "With the chrysanthem field open: path gain ×4.") },
			cost: new Decimal(2200),
			unlocked() { return hasUpgrade(this.layer, 23) },
		},
		25: {
			title: function() { return L("登高要略", "Ascent Briefing") },
			description: function() { return L("开启「山径要略」页签，公式一目了然。", "Unlocks the 山径要略 sub-tab: the formulas, on display.") },
			cost: new Decimal(3000),
			unlocked() { return hasUpgrade(this.layer, 24) },
		},
		31: {
			title: function() { return L("诗韵", "Verse") },
			description: function() { return L("山道里程 ×（诗境峰值 + 1）^0.4。", "Path gain ×(best verse+1)^0.4.") },
			cost: new Decimal(4000),
			unlocked() { return hasUpgrade(this.layer, 25) },
			effect() { return player.s.best.add(1).pow(0.4) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		32: {
			title: function() { return L("重阳胜会", "Double Ninth Feast") },
			description: function() { return L("山道里程 ×8。", "Path gain ×8.") },
			cost: new Decimal(6000),
			unlocked() { return hasUpgrade(this.layer, 31) },
		},
		33: {
			title: function() { return L("花神顾盼", "Goddess Glance") },
			description: function() { return L("山道里程 ×（花神眷峰值 + 1）^0.3。", "Path gain ×(best blossom+1)^0.3.") },
			cost: new Decimal(9000),
			unlocked() { return hasUpgrade(this.layer, 32) },
			effect() { return player.x.best.add(1).pow(0.3) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		34: {
			title: function() { return L("糕香", "Rice-Cake Scent") },
			description: function() { return L("糕坊既立，山道里程 ×12。", "With the cake workshop up: path gain ×12.") },
			cost: new Decimal(13000),
			unlocked() { return hasUpgrade(this.layer, 33) },
		},
		35: {
			title: function() { return L("九日同游", "Nine-Day Wander") },
			description: function() { return L("山道里程 ×20。", "Path gain ×20.") },
			cost: new Decimal(20000),
			unlocked() { return hasUpgrade(this.layer, 34) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function() { return L("登程峰值 ≥ 25", "best journey ≥ 25") },
			effectDescription: function() { return L("登高不再卷走山道上的升级。", "Climbs no longer sweep the path's upgrades away.") },
			done() { return player[this.layer].best.gte(TUNING.pM0) },
		},
		1: {
			requirementDescription: function() { return L("登程峰值 ≥ 50", "best journey ≥ 50") },
			unlocked() { return hasMilestone(this.layer, 0) },
			effectDescription: function() { return L("山道自生：每秒 +1 登程（自动开启）。", "The path grows itself: +1 journey/s (automated on).") },
			done() { return player[this.layer].best.gte(TUNING.pM1) },
		},
		2: {
			requirementDescription: function() { return L("登程峰值 ≥ 100", "best journey ≥ 100") },
			unlocked() { return hasMilestone(this.layer, 1) },
			effectDescription: function() { return L("自动登高，且登高不再卷走旧行。", "Auto-climb, and climbs no longer sweep old rows.") },
			done() { return player[this.layer].best.gte(TUNING.pM2) },
		},
		3: {
			requirementDescription: function() { return L("登程峰值 ≥ 200", "best journey ≥ 200") },
			unlocked() { return hasMilestone(this.layer, 2) },
			effectDescription: function() { return L("山道自动购阶（保留已购台阶）。", "The path buys its own steps (keeps bought buyables).") },
			done() { return player[this.layer].best.gte(TUNING.pM3) },
		},
	},

	buyables: {
		11: {
			title: function() { return L("石阶", "Stone Steps") },
			cost(x) { return new Decimal(10).times(Decimal.pow(2, x)).floor() },
			effect(x) { return x.add(1) },
			display() {
				let amt = getBuyableAmount(this.layer, this.id)
				return L("每级：攀一步 +" + formatWhole(amt.max(0).add(1)) + "<br>成本：" + format(tmp[this.layer].buyables[this.id].cost) + " 登程",
					"per level: 攀一步 +" + formatWhole(amt.max(0).add(1)) + "<br>cost: " + format(tmp[this.layer].buyables[this.id].cost) + " journey")
			},
			canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				let cost = tmp[this.layer].buyables[this.id].cost
				player[this.layer].points = player[this.layer].points.sub(cost)
				player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost)
			},
		},
	},

	clickables: {
		11: {
			title: function() { return L("攀一步", "Take a Step") },
			display() { return L("一步 +" + format(tmp[this.layer].clickGain) + " 山道里程",
				"one step +" + format(tmp[this.layer].clickGain) + " path mileage") },
			canClick() { return true },
			onClick() {
				player.points = player.points.add(tmp[this.layer].clickGain)
			},
		},
	},

	tabFormat: [
		["display-text", function() {
			return L("持有 <b style='color:" + tmp.p.color + "'>" + formatWhole(player.p.points) + "</b> 登程<br>" +
				"山道里程 " + format(getPointGen()) + "/秒" +
				(!hasUpgrade("p", 15) && player.p.points.gte(new Decimal(TUNING.pCap).div(2)) ? "<br><i>登程软帽自 " + format(TUNING.pCap) + " 起</i>" : ""),
				"You hold <b style='color:" + tmp.p.color + "'>" + formatWhole(player.p.points) + "</b> journey<br>" +
				"path " + format(getPointGen()) + "/s" +
				(!hasUpgrade("p", 15) && player.p.points.gte(new Decimal(TUNING.pCap).div(2)) ? "<br><i>journey soft cap from " + format(TUNING.pCap) + "</i>" : ""))
		}],
		"prestige-button",
		["clickables", [1]],
		["microtabs", "pd"],
	],
	microtabs: {
		pd: {
			"登高要阶": {
				content: ["upgrades", "blank", "buyables"],
				buttonStyle() { return {'background': 'linear-gradient(90deg,#4BDC13,#2e8b0f)', 'color': '#04220a'} },
			},
			"里程碑": {
				content: ["milestones", [0, 1, 2, 3]],
			},
			"山径要略": {
				unlocked() { return hasUpgrade("p", 25) },
				content: [
					["display-text", function() {
						return L("生产 = 1 × 升级之积 × 试炼（×0.1）<br>登程 = (里程/10)^0.5 × 倍率<br>软帽：登程 " + format(hasUpgrade("p", 15) ? TUNING.pCapUp : TUNING.pCap) + " 起",
							"gen = 1 × upgrade-product × trial (×0.1)<br>journey = (mileage/10)^0.5 × mult<br>soft cap: journey " + format(hasUpgrade("p", 15) ? TUNING.pCapUp : TUNING.pCap) + " on")
					}],
				],
				buttonStyle() { return {'background': '#2e8b0f', 'color': '#eaffea'} },
			},
		},
	},
})
