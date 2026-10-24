// ============================================================================
// cc — 冷链后勤（row 2 静态支柱 2）
// 叙事：耐热冻干苗 + 冷链 = 热带战役可打赢的原因。节点消耗疫苗剂量建造。
// ============================================================================
addLayer("cc", {
	name() { return zh("Cold Chain", "冷链后勤") },
	symbol() { return window.chinesemode ? "冷链" : "CC" },
	position: 1,
	row: 2,
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
	} },
	color: "#86e3e3",
	resource() { return zh("cold-chain nodes", "冷链节点") },
	baseResource: function() { return zh("vaccine doses", "疫苗剂量") },
	baseAmount() { return player.pro.points },
	requires: new Decimal(1e11),
	type: "static",
	exponent: 1,
	base: 2,
	roundUpCost: true,
	branches: ["pro"],
	gainMult() {
		let m = new Decimal(1)   // static：更小 = 更便宜
		if (hasUpgrade("cc", 11)) m = m.times(0.9)
		if (hasUpgrade("cc", 12)) m = m.div(upgradeEffect("cc", 12))
		if (hasUpgrade("cc", 13)) m = m.div(upgradeEffect("cc", 13))
		if (hasUpgrade("cc", 15)) m = m.div(upgradeEffect("cc", 15))
		if (hasUpgrade("cc", 21)) m = m.div(upgradeEffect("cc", 21))
		if (hasUpgrade("cc", 23)) m = m.div(upgradeEffect("cc", 23))
		if (hasUpgrade("cc", 31)) m = m.div(upgradeEffect("cc", 31))
		if (hasUpgrade("cc", 34)) m = m.div(upgradeEffect("cc", 34))
		if (hasUpgrade("cc", 35)) m = m.div(upgradeEffect("cc", 35))
		if (hasUpgrade("sur", 31)) m = m.times(0.9)
		if (hasUpgrade("mob", 24)) m = m.times(0.9)
		if (hasChallenge("vac", 11)) m = m.times(0.9)
		if (hasAchievement("hist", 21)) m = m.times(0.9)
		return m
	},
	gainExp() { return new Decimal(1) },
	layerShown() { return player.pro.best.gte(T("UNLOCK_CC")) || player.cc.unlocked },
	hotkeys: [
		{ key: "c", description() { return zh("C: Build a cold-chain node", "C：建造一个冷链节点") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	canBuyMax() { return hasUpgrade("cc", 25) },
	resetsNothing() { return hasMilestone("cmp", 4) },
	autoPrestige() { return hasMilestone("cmp", 4) },
	autoUpgrade() { return hasMilestone("cmp", 4) },
	doReset(resettingLayer) {
		if (!(layers[resettingLayer].row > this.row)) return
		let keep = ["unlocked", "auto", "milestones", "best", "total", "points"]
		if (hasMilestone("cmp", 4)) keep.push("upgrades")
		layerDataReset(this.layer, keep)
	},
	tabFormat: [
		["display-text", function() {
			return zh(
				`You have <h2 style="color:#86e3e3;text-shadow:0px 0px 10px #86e3e3">${formatWhole(player.cc.points)}</h2> ${zh("cold-chain nodes", "冷链节点")}`,
				`你已建成 <h2 style="color:#86e3e3;text-shadow:0px 0px 10px #86e3e3">${formatWhole(player.cc.points)}</h2> 个冷链节点`)
		}],
		"prestige-button",
		["display-text", function() {
			return zh(
				`Doses in storage: ${formatWhole(player.pro.points)}.<br>Nodes keep vaccine alive where roads end.`,
				`库存剂量：${formatWhole(player.pro.points)}。<br>冷链节点让疫苗活到公路的尽头。`)
		}],
		["microtabs", "stuff"],
		["blank", "15px"],
	],
	microtabs: {
		stuff: {
			"Upgrades": {
				name() { return zh("Upgrades", "后勤之术") },
				unlocked() { return true },
				content: [
					["raw-html", function() { return `<div style="opacity:.5">${zh("A vaccine that melts is a vaccine that never arrives.", "会融化的疫苗，永远到不了终点。")}</div>` }],
					"blank", "upgrades",
				],
			},
			"Milestones": {
				name() { return zh("Milestones", "里程碑") },
				unlocked() { return true },
				content: ["blank", "milestones"],
			},
		},
	},
	upgrades: {
		11: { title() { return zh("Solar Refrigerators", "太阳能冰箱") },
			description() { return zh("Nodes cost 10% less.", "节点费用 −10%。") },
			cost: new Decimal(1) },
		12: { title() { return zh("Vaccine Carriers", "冷藏箱") },
			description() { return zh("Nodes cost less, scaled by best doses (log).", "节点费用随剂量纪录降低（对数）。") },
			cost: new Decimal(2),
			effect() { return player.pro.best.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x cheaper" } },
		13: { title() { return zh("Transport Fleet", "运输车队") },
			description() { return zh("Nodes cost less, scaled by nodes owned.", "节点费用随已建节点数降低。") },
			cost: new Decimal(2),
			effect() { return player.cc.best.max(1).pow(0.2) },
			effectDisplay() { return format(this.effect()) + "x cheaper" } },
		14: { title() { return zh("Dose Preservation", "剂量保全") },
			description() { return zh("Dose gain boosted by best variolated.", "剂量获取随接种者纪录增长。") },
			cost: new Decimal(3),
			effect() { return player.var.best.max(1).pow(0.2) },
			effectDisplay() { return format(this.effect()) + "x" } },
		15: { title() { return zh("Mule Caravans", "骡马运输") },
			description() { return zh("Nodes cost less, scaled by total doses (log).", "节点费用随累计剂量降低（对数）。") },
			cost: new Decimal(3),
			effect() { return player.pro.total.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x cheaper" } },
		21: { title() { return zh("Airdrops", "直升机投送") },
			description() { return zh("Nodes cost less, scaled by operations (log).", "节点费用随围堵行动数降低（对数）。") },
			cost: new Decimal(5),
			effect() { return player.sur.best.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x cheaper" } },
		22: { title() { return zh("Cold Chain Map", "冷链地图") },
			description() { return zh("Containment operations cost 10% less.", "围堵行动费用 −10%。") },
			cost: new Decimal(5) },
		23: { title() { return zh("LN2 Tanks", "液氮罐") },
			description() { return zh("Nodes cost less, scaled by total nodes (log).", "节点费用随累计节点降低（对数）。") },
			cost: new Decimal(8),
			effect() { return player.cc.total.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x cheaper" } },
		24: { title() { return zh("Shared Depots", "共用仓库") },
			description() { return zh("Vaccinator teams cost 10% less.", "接种队费用 −10%。") },
			cost: new Decimal(8) },
		25: { title() { return zh("Regional Depot", "区域仓库") },
			description() { return zh("Unlocks buy-max for nodes.", "解锁节点批量购买。") },
			cost: new Decimal(12) },
		31: { title() { return zh("The Last Mile", "最后一英里") },
			description() { return zh("Nodes cost less, scaled by teams (log).", "节点费用随接种队数降低（对数）。") },
			cost: new Decimal(12),
			effect() { return player.mob.best.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x cheaper" } },
		32: { title() { return zh("Campaign Supply Lines", "战役补给线") },
			description() { return zh("Campaign progress boosted by best nodes.", "战役进度随节点纪录增长。") },
			cost: new Decimal(18),
			effect() { return player.cc.best.max(1).pow(0.25) },
			effectDisplay() { return format(this.effect()) + "x" } },
		33: { title() { return zh("Archive: Heat & Cold", "档案：热与冷") },
			description() { return zh("Unlocks an archive chapter.", "解锁历史档案的一章。") },
			cost: new Decimal(18) },
		34: { title() { return zh("National Grid", "国家电网") },
			description() { return zh("Nodes cost less, scaled by nodes owned (log²).", "节点费用随已建节点降低（对数平方）。") },
			cost: new Decimal(25),
			effect() { return player.cc.best.max(1).log(10).add(1).pow(2) },
			effectDisplay() { return format(this.effect()) + "x cheaper" } },
		35: { title() { return zh("Foot Messengers", "徒步信使") },
			description() { return zh("Nodes cost less, scaled by best doses (log²).", "节点费用随剂量纪录降低（对数平方）。") },
			cost: new Decimal(40),
			effect() { return player.pro.best.max(1).log(10).add(1).pow(2) },
			effectDisplay() { return format(this.effect()) + "x cheaper" } },
	},
	milestones: {
		0: { requirementDescription() { return zh("5 nodes", "5 个节点") },
			done() { return player[this.layer].best.gte(T("CC_MS")[0]) },
			effectDescription() { return zh("Variolated ×2 (doses survive the journey)", "接种者 ×2（剂量活着抵达）") } },
		1: { requirementDescription() { return zh("15 nodes", "15 个节点") },
			unlocked() { return hasMilestone(this.layer, 0) },
			done() { return player[this.layer].best.gte(T("CC_MS")[1]) },
			effectDescription() { return zh("Immune citizens ×2", "免疫公民 ×2") } },
		2: { requirementDescription() { return zh("40 nodes", "40 个节点") },
			unlocked() { return hasMilestone(this.layer, 1) },
			done() { return player[this.layer].best.gte(T("CC_MS")[2]) },
			effectDescription() { return zh("Doses ×2", "剂量 ×2") } },
		3: { requirementDescription() { return zh("100 nodes", "100 个节点") },
			unlocked() { return hasMilestone(this.layer, 2) },
			done() { return player[this.layer].best.gte(T("CC_MS")[3]) },
			effectDescription() { return zh("Insight ×2", "认知 ×2") } },
		4: { requirementDescription() { return zh("250 nodes", "250 个节点") },
			unlocked() { return hasMilestone(this.layer, 3) },
			done() { return player[this.layer].best.gte(T("CC_MS")[4]) },
			effectDescription() { return zh("Funds ×2", "资金 ×2") } },
	},
})
