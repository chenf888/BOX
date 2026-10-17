// ===========================================================================
// Row 1 — the four customs of the Double Ninth day, each a branch of the climb:
//   k 菊田 (pick) · j 酒坊 (brew, 9-day cycle) · d 茱萸 (charm) · x 菊展 (view)
// All four bank on 登程 (p's currency) and grant their own currencies.
// ===========================================================================

// ---------------------------------------------------------------------------
// 菊田 k — chrysanthem essence. Also the 菊珠 (jade) drip: M5 secondary.
// ---------------------------------------------------------------------------
addLayer("k", {
	name: function() { return L("菊田", "Chrysanthem Field") },
	symbol: "菊",
	position: 1,
	color: "#FFB300",
	resource: function() { return L("菊露", "chrysanthem dew") },
	row: 1,
	branches: ["p"],
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		total: new Decimal(0),
		best: new Decimal(0),
		jade: new Decimal(0),
	}},
	baseResource: function() { return L("登程", "journey tokens") },
	baseAmount() { return player.p.points },
	requires: new Decimal(TUNING.kReq),
	type: "normal",
	exponent: TUNING.row1Exp,

	softcap() {
		if (hasUpgrade("k", 14)) return new Decimal("1e7")
		return new Decimal(TUNING.kCap)
	},
	softcapPower() { return new Decimal(TUNING.kCapPow) },

	gainMult() {
		let m = new Decimal(1)
		if (hasUpgrade("k", 13)) m = m.times(upgradeEffect("k", 13))
		if (hasUpgrade("k", 21)) m = m.times(upgradeEffect("k", 21))
		if (hasUpgrade("k", 22)) m = m.times(upgradeEffect("k", 22))
		if (hasUpgrade("k", 31)) m = m.times(upgradeEffect("k", 31))
		if (hasUpgrade("k", 32)) m = m.times(8)
		if (hasUpgrade("k", 34)) m = m.times(6)
		if (hasUpgrade("d", 11)) m = m.times(2)      // 茱萸护菊 (sibling line, P10)
		if (hasUpgrade("x", 21)) m = m.times(3)      // 菊展名远 (sibling line, P10)
		if (hasUpgrade("g", 22)) m = m.times(upgradeEffect("g", 22))      // 糕质 (row-2 line, P10)
		if (inChallenge("f", 21)) m = m.times(0.3)   // M2 trial c21「寒菊」
		return m
	},
	gainExp() { return new Decimal(1) },

	layerShown() { return true },
	tooltip() { return L("采菊东篱：登程换菊露。", "Pick at the east fence: journey into dew.") },
	tooltipLocked() { return L("需 " + format(TUNING.kReq) + " 登程", "Requires " + format(TUNING.kReq) + " journey") },

	// M5: the field sheds 菊珠 passively. Custom variable, written by hand (F10).
	jadeRate() {
		let r = new Decimal(TUNING.jadeDrip)
		if (hasUpgrade("k", 24)) r = r.times(2)
		if (hasUpgrade("k", 33)) r = r.times(3)
		if (hasAchievement("a", 84)) r = r.times(3)   // 菊谱全录
		r = r.times(buyableEffect("m", 11))           // 集市「菊坛」
		return r
	},
	update(diff) {
		player.k.jade = player.k.jade.add(this.jadeRate().times(diff))
	},

	passiveGeneration() {
		if (inChallenge("f", 41)) return 0
		if (hasMilestone("k", 1)) return 1
		return 0
	},
	autoPrestige() {
		if (inChallenge("f", 41)) return false
		if (hasMilestone("k", 0) && hasMilestone("k", 2)) return true
		return false
	},
	resetsNothing() {
		if (hasMilestone("k", 0)) return true
		return false
	},
	autoUpgrade() {
		if (inChallenge("f", 41)) return false
		if (hasMilestone("k", 3)) return true
		return false
	},

	doReset(resettingLayer) {
		let kept = ["best", "total", "jade"]
		if (hasMilestone("k", 1)) kept.push("upgrades")
		if (hasMilestone("k", 3)) kept.push("buyables")
		layerDataReset(this.layer, kept)
	},

	hotkeys: [
		{ key: "k",
		  description: function() { return L("K：重整菊田，换菊露", "K: re-stake the field for dew") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],

	upgrades: {
		11: {
			title: function() { return L("篱笆", "Fence") },
			description: function() { return L("菊露获取 ×2。", "Dew gain ×2.") },
			cost: new Decimal(1),
		},
		12: {
			title: function() { return L("晨露", "Morning Dew") },
			description: function() { return L("菊露获取 ×3。", "Dew gain ×3.") },
			cost: new Decimal(4),
			unlocked() { return hasUpgrade(this.layer, 11) },
		},
		13: {
			title: function() { return L("菊荫", "Shade") },
			description: function() { return L("菊露获取 ×（菊精 + 1）^0.4。", "Dew gain ×(essence+1)^0.4.") },
			cost: new Decimal(15),
			unlocked() { return hasUpgrade(this.layer, 12) },
			effect() { return player[this.layer].points.add(1).pow(0.4) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		14: {
			title: function() { return L("深圃", "Deep Plot") },
			description: function() { return L("菊露软帽自 1e4 延至 1e7（帽在要略可见）。", "Dew soft cap from 1e4 delayed to 1e7 (visible in the briefing).") },
			cost: new Decimal(50),
			unlocked() { return hasUpgrade(this.layer, 13) },
		},
		15: {
			title: function() { return L("菊谱要录", "Codex Primer") },
			description: function() { return L("开启「菊谱」要略页签。", "Unlocks the codex briefing sub-tab.") },
			cost: new Decimal(150),
			unlocked() { return hasUpgrade(this.layer, 14) },
		},
		21: {
			title: function() { return L("山气日夕", "Mountain Air") },
			description: function() { return L("菊露获取 ×（登程峰值 + 1）^0.5。", "Dew gain ×(best journey+1)^0.5.") },
			cost: new Decimal(400),
			unlocked() { return hasUpgrade(this.layer, 15) },
			effect() { return player.p.best.add(1).pow(0.5) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		22: {
			title: function() { return L("松间一径", "Pine Path") },
			description: function() { return L("（键：顺路捎回）菊露获取 ×（登程十进制位 + 1）。", "(key, carried back along the way) dew gain ×(log10(journey)+1).") },
			cost: new Decimal(300),
			unlocked() { return hasUpgrade(this.layer, 21) },
			effect() { return player.p.points.max(10).log10().add(1) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		23: {
			title: function() { return L("菊酿同源", "Wine from Chrysanthem") },
			description: function() { return L("开酿（酒坊）×1.5：菊瓣入曲。", "开酿 (the brewery) ×1.5: petals into the starter.") },
			cost: new Decimal(900),
			unlocked() { return hasUpgrade(this.layer, 22) },
			effect() { return new Decimal(1.5) },
			effectDisplay() { return "×1.5" },
		},
		24: {
			title: function() { return L("落英成珠", "Petals into Jade") },
			description: function() { return L("菊珠滴落 ×2。", "Jade drip ×2.") },
			cost: new Decimal(2200),
			unlocked() { return hasUpgrade(this.layer, 23) },
			effect() { return new Decimal(2) },
			effectDisplay() { return "×2" },
		},
		25: {
			title: function() { return L("东篱小记", "Fence Notes") },
			description: function() { return L("开启「菊谱」收藏（菊展页签，三十六种）。", "Unlocks the 菊谱 codex grid on the exhibition (thirty-six varieties).") },
			cost: new Decimal(3000),
			unlocked() { return hasUpgrade(this.layer, 24) },
		},
		31: {
			title: function() { return L("茱萸香伴", "Charm Scent") },
			description: function() { return L("菊露获取 ×（茱萸香峰值 + 1）^0.3。", "Dew gain ×(best charm-scent+1)^0.3.") },
			cost: new Decimal(4000),
			unlocked() { return hasUpgrade(this.layer, 25) },
			effect() { return player.d.best.add(1).pow(0.3) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		32: {
			title: function() { return L("满陇桂菊", "Full Slopes") },
			description: function() { return L("诗阁既开，菊露获取 ×8。", "With the verse pavilion open: dew gain ×8.") },
			cost: new Decimal(6000),
			unlocked() { return hasUpgrade(this.layer, 31) },
		},
		33: {
			title: function() { return L("珠帘半卷", "Jade Curtain") },
			description: function() { return L("菊珠滴落 ×3。", "Jade drip ×3.") },
			cost: new Decimal(9000),
			unlocked() { return hasUpgrade(this.layer, 32) },
			effect() { return new Decimal(3) },
			effectDisplay() { return "×3" },
		},
		34: {
			title: function() { return L("九日摘花", "Ninth-Day Picking") },
			description: function() { return L("菊露获取 ×6。", "Dew gain ×6.") },
			cost: new Decimal(13000),
			unlocked() { return hasUpgrade(this.layer, 33) },
		},
		35: {
			title: function() { return L("菊谱初编", "First Codex") },
			description: function() { return L("菊展的「菊谱」收藏正式开列。", "The exhibition's 菊谱 codex is formally opened.") },
			cost: new Decimal(20000),
			unlocked() { return hasUpgrade(this.layer, 34) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function() { return L("菊露峰值 ≥ 2", "best dew ≥ 2") },
			effectDescription: function() { return L("重整菊田不再卷走旧行。", "Re-staking the field no longer sweeps old rows.") },
			done() { return player[this.layer].best.gte(2) },
		},
		1: {
			requirementDescription: function() { return L("菊露峰值 ≥ 4", "best dew ≥ 4") },
			unlocked() { return hasMilestone(this.layer, 0) },
			effectDescription: function() { return L("菊田自生菊露（自动开启）。", "The field yields dew on its own (automated on).") },
			done() { return player[this.layer].best.gte(4) },
		},
		2: {
			requirementDescription: function() { return L("菊露峰值 ≥ 8", "best dew ≥ 8") },
			unlocked() { return hasMilestone(this.layer, 1) },
			effectDescription: function() { return L("菊田自动重整。", "The field re-stakes itself.") },
			done() { return player[this.layer].best.gte(8) },
		},
		3: {
			requirementDescription: function() { return L("菊露峰值 ≥ 16", "best dew ≥ 16") },
			unlocked() { return hasMilestone(this.layer, 2) },
			effectDescription: function() { return L("菊田自动购阶（保留已购）。", "The field buys its own upgrades (keeps bought ones).") },
			done() { return player[this.layer].best.gte(16) },
		},
	},

	buyables: {
		11: {
			title: function() { return L("农具", "Hoe and Graft") },
			cost(x) { return new Decimal(10).times(Decimal.pow(2, x)).floor() },
			effect(x) { return x.add(1) },
			display() {
				let amt = getBuyableAmount(this.layer, this.id)
				return L("每级：菊珠滴落 +" + formatWhole(amt.max(0).add(1)) + "<br>成本：" + format(tmp[this.layer].buyables[this.id].cost) + " 菊露",
					"per level: jade drip +" + formatWhole(amt.max(0).add(1)) + "<br>cost: " + format(tmp[this.layer].buyables[this.id].cost) + " dew")
			},
			canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				let cost = tmp[this.layer].buyables[this.id].cost
				player[this.layer].points = player[this.layer].points.sub(cost)
				player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost)
			},
		},
		12: {
			title: function() { return L("篱下圃地", "Fenced Plot") },
			cost(x) { return new Decimal(25).times(Decimal.pow(3, x.pow(0.5))).floor() },
			effect(x) { return new Decimal(2).pow(x) },
			display() {
				let amt = getBuyableAmount(this.layer, this.id)
				return L("每级：菊露获取 ×" + format(this.effect(amt)) + "<br>成本：" + format(tmp[this.layer].buyables[this.id].cost) + " 菊露",
					"per level: dew ×" + format(this.effect(amt)) + "<br>cost: " + format(tmp[this.layer].buyables[this.id].cost) + " dew")
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

	tabFormat: [
		["display-text", function() {
			return L("菊精 <b>" + format(player.k.points) + "</b> · 菊珠 <b style='color:#FF69B4'>" + format(player.k.jade) + "</b>" +
				(!hasUpgrade("k", 14) && player.k.points.gte(new Decimal(TUNING.kCap).div(2)) ? "<br><i>菊露软帽自 " + format(TUNING.kCap) + " 起</i>" : ""),
				"essence <b>" + format(player.k.points) + "</b> · jade <b style='color:#FF69B4'>" + format(player.k.jade) + "</b>" +
				(!hasUpgrade("k", 14) && player.k.points.gte(new Decimal(TUNING.kCap).div(2)) ? "<br><i>dew soft cap from " + format(TUNING.kCap) + "</i>" : ""))
		}],
		"prestige-button",
		["microtabs", "kd"],
	],
	microtabs: {
		"kd": {
			"采菊": {
				content: ["upgrades", "blank", "buyables"],
			},
			"里程碑": {
				content: ["milestones", [0, 1, 2, 3]],
			},
			"菊谱要略": {
				unlocked() { return hasUpgrade("k", 15) },
				content: [
					["display-text", function() {
						return L("菊露 = (登程/250)^(1/3) × 倍率（软帽 " + format(hasUpgrade("k", 14) ? "1e7" : TUNING.kCap) + " 起）<br>菊珠滴落：" + format(tmp.k.jadeRate) + "/秒",
							"dew = (journey/250)^(1/3) × mult (cap " + format(hasUpgrade("k", 14) ? "1e7" : TUNING.kCap) + ")<br>jade drip: " + format(tmp.k.jadeRate) + "/s")
					}],
				],
			},
		},
	},
})

// ---------------------------------------------------------------------------
// 酒坊 j — the nine-day brew. M4: bar + clickable + update() tick.
// ---------------------------------------------------------------------------
addLayer("j", {
	name: function() { return L("酒坊", "Wine Cellar") },
	symbol: "酒",
	position: 2,
	color: "#E8564A",
	resource: function() { return L("醇藏", "aged wine") },
	row: 1,
	branches: ["p"],
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		total: new Decimal(0),
		best: new Decimal(0),
		brew: 0,
		brewing: 1,
		clickables: { 11: "brewing" },
	}},
	baseResource: function() { return L("登程", "journey tokens") },
	baseAmount() { return player.p.points },
	requires: new Decimal(TUNING.jReq),
	type: "normal",
	exponent: TUNING.row1Exp,

	gainMult() {
		let m = new Decimal(1)
		if (hasUpgrade("j", 13)) m = m.times(upgradeEffect("j", 13))
		if (hasUpgrade("j", 21)) m = m.times(upgradeEffect("j", 21))
		if (hasUpgrade("j", 22)) m = m.times(upgradeEffect("j", 22))
		if (hasUpgrade("j", 24)) m = m.times(4)
		if (hasUpgrade("j", 31)) m = m.times(upgradeEffect("j", 31))
		if (hasUpgrade("j", 32)) m = m.times(8)
		if (hasUpgrade("j", 34)) m = m.times(6)
		if (hasUpgrade("k", 11)) m = m.times(2)      // 菊入曲 (sibling line, P10)
		if (hasUpgrade("d", 11)) m = m.times(2)      // 茱萸引酒 (sibling line, P10)
		return m
	},
	gainExp() { return new Decimal(1) },

	layerShown() { return true },
	tooltip() { return L("新醅：登程换醇藏。", "New brew: journey into aged wine.") },
	tooltipLocked() { return L("需 " + format(TUNING.jReq) + " 登程", "Requires " + format(TUNING.jReq) + " journey") },

	// 九日酿 cycle (K5: u14 shortens 90s -> 60s; the bar and the tick both read this).
	brewCycle() {
		if (hasUpgrade("j", 14)) return 60
		return TUNING.brewTime
	},
	// 九日酿 cycle speed (K4 named mechanic, consumed by update).
	brewSpeed() {
		let s = new Decimal(1)
		if (hasUpgrade("k", 23)) s = s.times(upgradeEffect("k", 23))
		if (hasUpgrade("j", 23)) s = s.times(upgradeEffect("j", 23))
		if (hasUpgrade("j", 33)) s = s.times(upgradeEffect("j", 33))
		return s
	},
	brewGain() {
		let g = new Decimal(TUNING.brewGainBase)
		if (hasUpgrade("j", 11)) g = g.times(2)
		if (hasUpgrade("j", 12)) g = g.times(3)
		g = g.times(buyableEffect("j", 12))
		return g
	},
	update(diff) {
		if (inChallenge("f", 31)) return                    // c31「断酒」: the brew stands still
		if (!player.j.brewing) return
		player.j.brew = player.j.brew + this.brewSpeed().toNumber() * diff
		if (player.j.brew >= this.brewCycle()) {
			player.j.brew = 0
			addPoints(this.layer, this.brewGain())
		}
	},

	passiveGeneration() {
		if (inChallenge("f", 41)) return 0
		if (hasMilestone("j", 1)) return 1
		return 0
	},
	autoPrestige() {
		if (inChallenge("f", 41)) return false
		if (hasMilestone("j", 0) && hasMilestone("j", 2)) return true
		return false
	},
	resetsNothing() {
		if (hasMilestone("j", 0)) return true
		return false
	},
	autoUpgrade() {
		if (inChallenge("f", 41)) return false
		if (hasMilestone("j", 3)) return true
		return false
	},

	doReset(resettingLayer) {
		let kept = ["best", "total"]
		if (hasMilestone("j", 1)) kept.push("upgrades")
		if (hasMilestone("j", 3)) kept.push("buyables")
		layerDataReset(this.layer, kept)
	},

	hotkeys: [
		{ key: "j",
		  description: function() { return L("J：重整酒坊，换醇藏", "J: re-stake the cellar for aged wine") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],

	upgrades: {
		11: {
			title: function() { return L("陶瓮", "Jars") },
			description: function() { return L("每酿产出 +100%。", "Each brew output +100%.") },
			cost: new Decimal(1),
		},
		12: {
			title: function() { return L("曲方", "Starter") },
			description: function() { return L("每酿产出 +200%。", "Each brew output +200%.") },
			cost: new Decimal(4),
			unlocked() { return hasUpgrade(this.layer, 11) },
		},
		13: {
			title: function() { return L("陈酿", "Ageing") },
			description: function() { return L("醇藏获取 ×（酒力 + 1）^0.4。", "Wine gain ×(wine+1)^0.4.") },
			cost: new Decimal(15),
			unlocked() { return hasUpgrade(this.layer, 12) },
			effect() { return player[this.layer].points.add(1).pow(0.4) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		14: {
			title: function() { return L("九日酿", "Nine-Day Brew") },
			description: function() { return L("酿期 90 秒缩至 60 秒（重阳九日，取其一）。", "Brew cycle from 90s down to 60s (nine days, take the ninth).") },
			cost: new Decimal(50),
			unlocked() { return hasUpgrade(this.layer, 13) },
			effectDisplay() { return L("酿期 60s", "brew 60s") },
		},
		15: {
			title: function() { return L("酿谱", "Brewing Codex") },
			description: function() { return L("开启「酿造」页签（进度与要略）。", "Unlocks the brewing sub-tab (progress and formulas).") },
			cost: new Decimal(150),
			unlocked() { return hasUpgrade(this.layer, 14) },
		},
		21: {
			title: function() { return L("菊瓣入曲", "Petals in the Starter") },
			description: function() { return L("醇藏获取 ×（菊露峰值 + 1）^0.5。", "Wine gain ×(best dew+1)^0.5.") },
			cost: new Decimal(400),
			unlocked() { return hasUpgrade(this.layer, 15) },
			effect() { return player.k.best.add(1).pow(0.5) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		22: {
			title: function() { return L("水脉", "Spring Line") },
			description: function() { return L("（键：引泉入户）醇藏获取 ×（登程十进制位 + 1）。", "(key: spring water brought in) wine gain ×(log10(journey)+1).") },
			cost: new Decimal(300),
			unlocked() { return hasUpgrade(this.layer, 21) },
			effect() { return player.p.points.max(10).log10().add(1) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		23: {
			title: function() { return L("快酿", "Quick Brew") },
			description: function() { return L("开酿（酿期推进）×2。", "开酿 (brew progress) ×2.") },
			cost: new Decimal(900),
			unlocked() { return hasUpgrade(this.layer, 22) },
			effect() { return new Decimal(2) },
			effectDisplay() { return "×2" },
		},
		24: {
			title: function() { return L("市集烟火", "Market Smoke") },
			description: function() { return L("重阳集市既开，醇藏获取 ×4。", "With the Double Ninth market open: wine gain ×4.") },
			cost: new Decimal(2200),
			unlocked() { return hasUpgrade(this.layer, 23) },
		},
		25: {
			title: function() { return L("封坛要略", "Sealing Notes") },
			description: function() { return L("开启「酿造」要略页签。", "Unlocks the brewing briefing sub-tab.") },
			cost: new Decimal(3000),
			unlocked() { return hasUpgrade(this.layer, 24) },
		},
		31: {
			title: function() { return L("酒旗三寻", "Three Wine-Banners") },
			description: function() { return L("醇藏获取 ×（茱萸香峰值 + 1）^0.3。", "Wine gain ×(best charm-scent+1)^0.3.") },
			cost: new Decimal(4000),
			unlocked() { return hasUpgrade(this.layer, 25) },
			effect() { return player.d.best.add(1).pow(0.3) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		32: {
			title: function() { return L("满庭芳", "Full Courtyard") },
			description: function() { return L("绝顶既立，醇藏获取 ×8。", "With the summit raised: wine gain ×8.") },
			cost: new Decimal(6000),
			unlocked() { return hasUpgrade(this.layer, 31) },
		},
		33: {
			title: function() { return L("速酿诀", "Swift Brew Sutra") },
			description: function() { return L("开酿（酿期推进）×1.5。", "开酿 (brew progress) ×1.5.") },
			cost: new Decimal(9000),
			unlocked() { return hasUpgrade(this.layer, 32) },
			effect() { return new Decimal(1.5) },
			effectDisplay() { return "×1.5" },
		},
		34: {
			title: function() { return L("九蒸九晒", "Nine Steamings") },
			description: function() { return L("醇藏获取 ×6。", "Wine gain ×6.") },
			cost: new Decimal(13000),
			unlocked() { return hasUpgrade(this.layer, 33) },
		},
		35: {
			title: function() { return L("酿谱初成", "First Brew Codex") },
			description: function() { return L("编年「酿酒」一章得录。", "The chronicle's brewing chapter is recorded.") },
			cost: new Decimal(20000),
			unlocked() { return hasUpgrade(this.layer, 34) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function() { return L("醇藏峰值 ≥ 2", "best wine ≥ 2") },
			effectDescription: function() { return L("重整酒坊不再卷走旧行。", "Re-staking the cellar no longer sweeps old rows.") },
			done() { return player[this.layer].best.gte(2) },
		},
		1: {
			requirementDescription: function() { return L("醇藏峰值 ≥ 4", "best wine ≥ 4") },
			unlocked() { return hasMilestone(this.layer, 0) },
			effectDescription: function() { return L("酒坊自出醇藏（自动开启）。", "The cellar yields wine on its own (automated on).") },
			done() { return player[this.layer].best.gte(4) },
		},
		2: {
			requirementDescription: function() { return L("醇藏峰值 ≥ 8", "best wine ≥ 8") },
			unlocked() { return hasMilestone(this.layer, 1) },
			effectDescription: function() { return L("酒坊自动重整。", "The cellar re-stakes itself.") },
			done() { return player[this.layer].best.gte(8) },
		},
		3: {
			requirementDescription: function() { return L("醇藏峰值 ≥ 16", "best wine ≥ 16") },
			unlocked() { return hasMilestone(this.layer, 2) },
			effectDescription: function() { return L("酒坊自动购阶（保留已购）。", "The cellar buys its own upgrades (keeps bought ones).") },
			done() { return player[this.layer].best.gte(16) },
		},
	},

	buyables: {
		11: {
			title: function() { return L("曲种", "Starter Cultures") },
			cost(x) { return new Decimal(5).times(Decimal.pow(2, x)).floor() },
			effect(x) { return x.add(1) },
			display() {
				let amt = getBuyableAmount(this.layer, this.id)
				return L("每级：开酿 +" + formatWhole(amt.max(0).add(1)) + "<br>成本：" + format(tmp[this.layer].buyables[this.id].cost) + " 醇藏",
					"per level: 开酿 +" + formatWhole(amt.max(0).add(1)) + "<br>cost: " + format(tmp[this.layer].buyables[this.id].cost) + " wine")
			},
			canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				let cost = tmp[this.layer].buyables[this.id].cost
				player[this.layer].points = player[this.layer].points.sub(cost)
				player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost)
			},
		},
		12: {
			title: function() { return L("瓮藏", "Cellar Jars") },
			cost(x) { return new Decimal(15).times(Decimal.pow(2.5, x)).floor() },
			effect(x) { return Decimal.pow(2, x.pow(0.5)) },
			display() {
				let amt = getBuyableAmount(this.layer, this.id)
				return L("每级：每酿产出 ×" + format(this.effect(amt)) + "<br>成本：" + format(tmp[this.layer].buyables[this.id].cost) + " 醇藏",
					"per level: brew output ×" + format(this.effect(amt)) + "<br>cost: " + format(tmp[this.layer].buyables[this.id].cost) + " wine")
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

	bars: {
		brew: {
			direction: RIGHT,
			width: 320, height: 26,
			display() {
				let cyc = tmp.j.brewCycle
				return L("九日酿：" + format(new Decimal(player.j.brew).min(cyc)) + " / " + format(cyc) + "（" + (hasUpgrade("j", 14) ? L("六日", "6 days") : L("九日", "9 days")) + "）",
					"nine-day brew: " + format(new Decimal(player.j.brew).min(cyc)) + " / " + format(cyc) + " (" + (hasUpgrade("j", 14) ? "6d" : "9d") + ")")
			},
			progress() { return new Decimal(player.j.brew).div(tmp.j.brewCycle).toNumber() },
			fillStyle: {'background-color': "#E8564A"},
			baseStyle: {'background-color': "#5a2a24"},
			textStyle: {'color': '#ffd9d4'},
			unlocked() { return hasUpgrade(this.layer, 15) },
		},
	},

	clickables: {
		11: {
			title: function() { return L("开酿", "Tap the Brew") },
			display() { return player.j.brewing ? L("酿造中……点按暂停", "brewing… click to pause") : L("已暂停，点按续酿", "paused, click to resume") },
			canClick() { return true },
			onClick() {
				player.j.brewing = player.j.brewing ? 0 : 1
				setClickableState(this.layer, this.id, player.j.brewing ? "brewing" : "idle")
			},
			style() {
				return player.j.brewing ? {'background-color': '#E8564A'} : {'background-color': '#5a2a24'}
			},
		},
	},

	tabFormat: [
		["display-text", function() {
			return L("酒力 <b>" + format(player.j.points) + "</b> · 每酿 + " + format(tmp.j.brewGain) + " 酒力",
				"wine <b>" + format(player.j.points) + "</b> · per brew + " + format(tmp.j.brewGain) + " wine")
		}],
		"prestige-button",
		["clickables", [1]],
		["microtabs", "jd"],
	],
	microtabs: {
		"jd": {
			"酿具": {
				content: ["upgrades", "blank", "buyables"],
			},
			"酿造": {
				unlocked() { return hasUpgrade("j", 15) },
				content: ["bar", "blank", ["display-text", function() {
					return L("酿期推进：开酿 ×" + format(tmp.j.brewSpeed) + "（" + tmp.j.brewCycle + " 秒满酿）",
						"brew progress: 开酿 ×" + format(tmp.j.brewSpeed) + " (" + tmp.j.brewCycle + "s to fill)")
				}]],
				buttonStyle() { return {'background': 'linear-gradient(90deg,#E8564A,#8c2f26)', 'color': '#3d120e'} },
			},
			"里程碑": {
				content: ["milestones", [0, 1, 2, 3]],
			},
		},
	},
})

// ---------------------------------------------------------------------------
// 茱萸 d — the worn charm. K4 named mechanic: 护身 (path-click protection).
// ---------------------------------------------------------------------------
addLayer("d", {
	name: function() { return L("茱萸", "Dogwood Charm") },
	symbol: "茱",
	position: 3,
	color: "#B39DDB",
	resource: function() { return L("茱佩", "charms") },
	row: 1,
	branches: ["p"],
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		total: new Decimal(0),
		best: new Decimal(0),
	}},
	baseResource: function() { return L("登程", "journey tokens") },
	baseAmount() { return player.p.points },
	requires: new Decimal(TUNING.dReq),
	type: "normal",
	exponent: TUNING.row1Exp,

	gainMult() {
		let m = new Decimal(1)
		if (hasUpgrade("d", 11)) m = m.times(2)
		if (hasUpgrade("d", 12)) m = m.times(3)
		if (hasUpgrade("d", 13)) m = m.times(upgradeEffect("d", 13))
		if (hasUpgrade("d", 21)) m = m.times(upgradeEffect("d", 21))
		if (hasUpgrade("d", 22)) m = m.times(upgradeEffect("d", 22))
		if (hasUpgrade("d", 31)) m = m.times(upgradeEffect("d", 31))
		if (hasUpgrade("d", 32)) m = m.times(8)
		if (hasUpgrade("d", 34)) m = m.times(6)
		if (hasUpgrade("k", 13)) m = m.times(upgradeEffect("k", 13))   // 菊荫护茱 (sibling line)
		if (hasUpgrade("x", 11)) m = m.times(2)                        // 展前茱萸 (sibling line)
		return m
	},
	gainExp() { return new Decimal(1) },

	layerShown() { return true },
	tooltip() { return L("佩茱萸：登程换茱佩。", "Wear the charm: journey into charms.") },
	tooltipLocked() { return L("需 " + format(TUNING.dReq) + " 登程", "Requires " + format(TUNING.dReq) + " journey") },

	// 茱佩护身: the named K4 mechanic. Each 茱佩 held shields the climb;
	// the guard saturates (u14 raises the ceiling — the cap is visible on the tab).
	charmGuardCap() {
		if (hasUpgrade("d", 14)) return new Decimal(1000)
		return new Decimal(100)
	},
	charmGuard() {
		let g = new Decimal(1)
		if (hasUpgrade("d", 23)) g = g.times(upgradeEffect("d", 23))
		if (hasUpgrade("d", 33)) g = g.times(upgradeEffect("d", 33))
		g = g.times(player[this.layer].points.add(1).pow(0.15))
		return g.min(this.charmGuardCap())
	},

	passiveGeneration() {
		if (inChallenge("f", 41)) return 0
		if (hasMilestone("d", 1)) return 1
		return 0
	},
	autoPrestige() {
		if (inChallenge("f", 41)) return false
		if (hasMilestone("d", 0) && hasMilestone("d", 2)) return true
		return false
	},
	resetsNothing() {
		if (hasMilestone("d", 0)) return true
		return false
	},
	autoUpgrade() {
		if (inChallenge("f", 41)) return false
		if (hasMilestone("d", 3)) return true
		return false
	},

	doReset(resettingLayer) {
		let kept = ["best", "total"]
		if (hasMilestone("d", 1)) kept.push("upgrades")
		if (hasMilestone("d", 3)) kept.push("buyables")
		layerDataReset(this.layer, kept)
	},

	hotkeys: [
		{ key: "d",
		  description: function() { return L("D：重整茱萸，换茱佩", "D: re-stake the charm for charms") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],

	upgrades: {
		11: {
			title: function() { return L("红果", "Red Berries") },
			description: function() { return L("茱佩获取 ×2。", "Charm gain ×2.") },
			cost: new Decimal(1),
		},
		12: {
			title: function() { return L("枝垂", "Hanging Bough") },
			description: function() { return L("茱佩获取 ×3。", "Charm gain ×3.") },
			cost: new Decimal(5),
			unlocked() { return hasUpgrade(this.layer, 11) },
		},
		13: {
			title: function() { return L("茱实", "Charm Flesh") },
			description: function() { return L("茱佩获取 ×（茱萸香 + 1）^0.4。", "Charm gain ×(scent+1)^0.4.") },
			cost: new Decimal(20),
			unlocked() { return hasUpgrade(this.layer, 12) },
			effect() { return player[this.layer].points.add(1).pow(0.4) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		14: {
			title: function() { return L("避邪", "Warding") },
			description: function() { return L("茱佩护身上限自 100 放宽至 1000（帽在要略可见）。", "Charm-guard ceiling from 100 raised to 1000 (cap visible in the briefing).") },
			cost: new Decimal(60),
			unlocked() { return hasUpgrade(this.layer, 13) },
		},
		15: {
			title: function() { return L("佩要略", "Charm Briefing") },
			description: function() { return L("开启「佩茱萸」要略页签。", "Unlocks the charm briefing sub-tab.") },
			cost: new Decimal(200),
			unlocked() { return hasUpgrade(this.layer, 14) },
		},
		21: {
			title: function() { return L("山岚", "Mountain Mist") },
			description: function() { return L("茱佩获取 ×（登程峰值 + 1）^0.5。", "Charm gain ×(best journey+1)^0.5.") },
			cost: new Decimal(400),
			unlocked() { return hasUpgrade(this.layer, 15) },
			effect() { return player.p.best.add(1).pow(0.5) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		22: {
			title: function() { return L("邻枝", "Neighbour Bough") },
			description: function() { return L("（键：移枝得苗）茱佩获取 ×（登程十进制位 + 1）。", "(key: a stuck twig) charm gain ×(log10(journey)+1).") },
			cost: new Decimal(300),
			unlocked() { return hasUpgrade(this.layer, 21) },
			effect() { return player.p.points.max(10).log10().add(1) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		23: {
			title: function() { return L("茱佩护身", "Charm Guard") },
			description: function() { return L("茱佩护身（攀行加成）×2。", "茱佩护身 (the climb bonus) ×2.") },
			cost: new Decimal(1500),
			unlocked() { return hasUpgrade(this.layer, 22) },
			effect() { return new Decimal(2) },
			effectDisplay() { return "×2" },
		},
		24: {
			title: function() { return L("佩香满袖", "Scented Sleeves") },
			description: function() { return L("茱萸既熟，茱佩获取 ×4。", "Once the charms ripen: charm gain ×4.") },
			cost: new Decimal(2200),
			unlocked() { return hasUpgrade(this.layer, 23) },
		},
		25: {
			title: function() { return L("茱萸要略", "Charm Notes") },
			description: function() { return L("开启「佩茱萸」要略页签（护身公式）。", "Unlocks the charm briefing (the guard formula).") },
			cost: new Decimal(3000),
			unlocked() { return hasUpgrade(this.layer, 24) },
		},
		31: {
			title: function() { return L("酒引", "Wine Lead") },
			description: function() { return L("茱佩获取 ×（醇藏峰值 + 1）^0.3。", "Charm gain ×(best wine+1)^0.3.") },
			cost: new Decimal(4000),
			unlocked() { return hasUpgrade(this.layer, 25) },
			effect() { return player.j.best.add(1).pow(0.3) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		32: {
			title: function() { return L("高树", "Tall Tree") },
			description: function() { return L("诗阁既开，茱佩获取 ×8。", "With the verse pavilion open: charm gain ×8.") },
			cost: new Decimal(6000),
			unlocked() { return hasUpgrade(this.layer, 31) },
		},
		33: {
			title: function() { return L("穗垂", "Hanging Sprays") },
			description: function() { return L("茱佩护身（攀行加成）×1.5。", "茱佩护身 (the climb bonus) ×1.5.") },
			cost: new Decimal(9000),
			unlocked() { return hasUpgrade(this.layer, 32) },
			effect() { return new Decimal(1.5) },
			effectDisplay() { return "×1.5" },
		},
		34: {
			title: function() { return L("九枝为佩", "Nine Boughs") },
			description: function() { return L("茱佩获取 ×6。", "Charm gain ×6.") },
			cost: new Decimal(13000),
			unlocked() { return hasUpgrade(this.layer, 33) },
		},
		35: {
			title: function() { return L("佩谱初成", "First Charm Codex") },
			description: function() { return L("编年「茱萸」一章得录。", "The chronicle's charm chapter is recorded.") },
			cost: new Decimal(20000),
			unlocked() { return hasUpgrade(this.layer, 34) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function() { return L("茱佩峰值 ≥ 2", "best charms ≥ 2") },
			effectDescription: function() { return L("重整茱萸不再卷走旧行。", "Re-staking the charm no longer sweeps old rows.") },
			done() { return player[this.layer].best.gte(2) },
		},
		1: {
			requirementDescription: function() { return L("茱佩峰值 ≥ 4", "best charms ≥ 4") },
			unlocked() { return hasMilestone(this.layer, 0) },
			effectDescription: function() { return L("茱萸自出茱佩（自动开启）。", "The charm yields charms on its own (automated on).") },
			done() { return player[this.layer].best.gte(4) },
		},
		2: {
			requirementDescription: function() { return L("茱佩峰值 ≥ 8", "best charms ≥ 8") },
			unlocked() { return hasMilestone(this.layer, 1) },
			effectDescription: function() { return L("茱萸自动重整。", "The charm re-stakes itself.") },
			done() { return player[this.layer].best.gte(8) },
		},
		3: {
			requirementDescription: function() { return L("茱佩峰值 ≥ 16", "best charms ≥ 16") },
			unlocked() { return hasMilestone(this.layer, 2) },
			effectDescription: function() { return L("茱萸自动购阶（保留已购）。", "The charm buys its own upgrades (keeps bought ones).") },
			done() { return player[this.layer].best.gte(16) },
		},
	},

	buyables: {
		11: {
			title: function() { return L("茱穗", "Charm Sprays") },
			cost(x) { return new Decimal(10).times(Decimal.pow(2, x)).floor() },
			effect(x) { return x.add(1) },
			display() {
				let amt = getBuyableAmount(this.layer, this.id)
				return L("每级：茱佩护身 +" + formatWhole(amt.max(0).add(1)) + "<br>成本：" + format(tmp[this.layer].buyables[this.id].cost) + " 茱佩",
					"per level: 茱佩护身 +" + formatWhole(amt.max(0).add(1)) + "<br>cost: " + format(tmp[this.layer].buyables[this.id].cost) + " charms")
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

	tabFormat: [
		["display-text", function() {
			return L("茱萸香 <b>" + format(player.d.points) + "</b><br>茱佩护身（攀行）×" + format(tmp.d.charmGuard) + "（上限 " + format(tmp.d.charmGuardCap) + "）",
				"scent <b>" + format(player.d.points) + "</b><br>charm guard (climb) ×" + format(tmp.d.charmGuard) + "（ceiling " + format(tmp.d.charmGuardCap) + "）")
		}],
		"prestige-button",
		["microtabs", "dd"],
	],
	microtabs: {
		"dd": {
			"佩茱萸": {
				content: ["upgrades", "blank", "buyables"],
			},
			"里程碑": {
				content: ["milestones", [0, 1, 2, 3]],
			},
			"护身要略": {
				unlocked() { return hasUpgrade("d", 15) },
				content: [
					["display-text", function() {
						return L("茱佩 = (登程/1000)^(1/3) × 倍率<br>护身 = 茱佩^0.15 × 升级之积（×" + format(tmp.d.charmGuard) + "）",
							"charms = (journey/1000)^(1/3) × mult<br>guard = charms^0.15 × upgrade-product (×" + format(tmp.d.charmGuard) + ")")
					}],
				],
			},
		},
	},
})

