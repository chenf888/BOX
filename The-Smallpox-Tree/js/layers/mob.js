// ============================================================================
// mob — 接种动员（row 2 静态支柱 3）
// 叙事：把免疫公民训练成接种队——人力，是根除计划的最后一公里。
// ============================================================================
addLayer("mob", {
	name() { return zh("Mobilization", "接种动员") },
	symbol() { return window.chinesemode ? "动员" : "MO" },
	position: 2,
	row: 2,
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
	} },
	color: "#d6e58a",
	resource() { return zh("vaccinator teams", "接种队") },
	baseResource: function() { return zh("immune citizens", "免疫公民") },
	baseAmount() { return player.vac.points },
	requires: new Decimal(1e9),
	type: "static",
	exponent: 1,
	base: 3,
	roundUpCost: true,
	branches: ["vac"],
	gainMult() {
		let m = new Decimal(1)   // static：更小 = 更便宜
		if (hasUpgrade("mob", 11)) m = m.div(upgradeEffect("mob", 11))
		if (hasUpgrade("mob", 12)) m = m.div(upgradeEffect("mob", 12))
		if (hasUpgrade("mob", 14)) m = m.div(upgradeEffect("mob", 14))
		if (hasUpgrade("mob", 21)) m = m.div(upgradeEffect("mob", 21))
		if (hasUpgrade("mob", 23)) m = m.div(upgradeEffect("mob", 23))
		if (hasUpgrade("mob", 34)) m = m.div(upgradeEffect("mob", 34))
		if (hasUpgrade("sur", 33)) m = m.times(0.9)
		if (hasAchievement("hist", 23)) m = m.times(0.9)
		return m
	},
	gainExp() { return new Decimal(1) },
	layerShown() { return player.vac.best.gte(T("UNLOCK_MOB")) || player.mob.unlocked },
	hotkeys: [
		{ key: "m", description() { return zh("M: Recruit a vaccinator team", "M：招募一支接种队") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	canBuyMax() { return hasUpgrade("mob", 25) },
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
				`You have <h2 style="color:#d6e58a;text-shadow:0px 0px 10px #d6e58a">${formatWhole(player.mob.points)}</h2> ${zh("vaccinator teams", "接种队")}`,
				`你有 <h2 style="color:#d6e58a;text-shadow:0px 0px 10px #d6e58a">${formatWhole(player.mob.points)}</h2> 支接种队`)
		}],
		"prestige-button",
		["display-text", function() {
			return zh(
				`Immune citizens available: ${formatWhole(player.vac.points)}.<br>Every team is a thousand house visits.`,
				`可用免疫公民：${formatWhole(player.vac.points)}。<br>每支队伍，意味着一千次入户。`)
		}],
		["microtabs", "stuff"],
		["blank", "15px"],
	],
	microtabs: {
		stuff: {
			"Upgrades": {
				name() { return zh("Upgrades", "动员之术") },
				unlocked() { return true },
				content: [
					["raw-html", function() { return `<div style="opacity:.5">${zh("The last mile is walked on foot.", "最后一公里，是用脚走完的。")}</div>` }],
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
		11: { title() { return zh("Train the Trainers II", "教员培训 II") },
			description() { return zh("Teams cost less, scaled by best citizens (log).", "接种队费用随免疫公民纪录降低（对数）。") },
			cost: new Decimal(1),
			effect() { return player.vac.best.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x cheaper" } },
		12: { title() { return zh("Volunteers", "志愿者") },
			description() { return zh("Teams cost less, scaled by teams owned.", "接种队费用随已有队伍数降低。") },
			cost: new Decimal(2),
			effect() { return player.mob.best.max(1).pow(0.2) },
			effectDisplay() { return format(this.effect()) + "x cheaper" } },
		13: { title() { return zh("Red Cross Pact", "红十字协定") },
			description() { return zh("Immune citizens boosted by best variolated (log²).", "免疫公民随接种者纪录增长（对数平方）。") },
			cost: new Decimal(2),
			effect() { return player.var.best.max(1).log(2).add(1).pow(2) },
			effectDisplay() { return format(this.effect()) + "x" } },
		14: { title() { return zh("House-to-House", "入户接种") },
			description() { return zh("Teams cost less, scaled by total citizens (log).", "接种队费用随累计免疫公民降低（对数）。") },
			cost: new Decimal(3),
			effect() { return player.vac.total.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x cheaper" } },
		15: { title() { return zh("Market Vaccination", "集市接种") },
			description() { return zh("Containment operations cost 10% less.", "围堵行动费用 −10%。") },
			cost: new Decimal(3) },
		21: { title() { return zh("School Programs", "学校计划") },
			description() { return zh("Teams cost less, scaled by operations (log).", "接种队费用随围堵行动数降低（对数）。") },
			cost: new Decimal(5),
			effect() { return player.sur.best.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x cheaper" } },
		22: { title() { return zh("Factory Lines", "工厂流水线") },
			description() { return zh("Dose gain boosted by best doses (log).", "剂量获取随剂量纪录增长（对数）。") },
			cost: new Decimal(5),
			effect() { return player.pro.best.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x" } },
		23: { title() { return zh("National Service", "国民服役") },
			description() { return zh("Teams cost less, scaled by total teams (log²).", "接种队费用随累计队伍降低（对数平方）。") },
			cost: new Decimal(8),
			effect() { return player.mob.total.max(1).log(10).add(1).pow(2) },
			effectDisplay() { return format(this.effect()) + "x cheaper" } },
		24: { title() { return zh("Shared Logistics", "共享后勤") },
			description() { return zh("Cold-chain nodes cost 10% less.", "冷链节点费用 −10%。") },
			cost: new Decimal(8) },
		25: { title() { return zh("National Register", "国民名册") },
			description() { return zh("Unlocks buy-max for teams.", "解锁接种队批量购买。") },
			cost: new Decimal(12) },
		31: { title() { return zh("Field Supervisors", "现场督导") },
			description() { return zh("Insight boosted by best insight (log).", "认知随认知纪录增长（对数）。") },
			cost: new Decimal(12),
			effect() { return player.knw.best.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x" } },
		32: { title() { return zh("Campaign Cadres", "战役干部") },
			description() { return zh("Campaign progress boosted by best campaign progress (log).", "战役进度随其纪录增长（对数）。") },
			cost: new Decimal(18),
			effect() { return player.cmp.best.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x" } },
		33: { title() { return zh("Archive: A Thousand Visits", "档案：一千次入户") },
			description() { return zh("Unlocks an archive chapter.", "解锁历史档案的一章。") },
			cost: new Decimal(18) },
		34: { title() { return zh("Night Schools", "夜校") },
			description() { return zh("Teams cost less, scaled by best citizens (log²).", "接种队费用随免疫公民纪录降低（对数平方）。") },
			cost: new Decimal(25),
			effect() { return player.vac.best.max(1).log(10).add(1).pow(2) },
			effectDisplay() { return format(this.effect()) + "x cheaper" } },
		35: { title() { return zh("Donor Summits", "捐助峰会") },
			description() { return zh("Funds boosted by best citizens.", "资金随免疫公民纪录增长。") },
			cost: new Decimal(40),
			effect() { return player.vac.best.max(1).pow(0.15) },
			effectDisplay() { return format(this.effect()) + "x" } },
	},
	milestones: {
		0: { requirementDescription() { return zh("3 teams", "3 支接种队") },
			done() { return player[this.layer].best.gte(T("MOB_MS")[0]) },
			effectDescription() { return zh("Variolated ×2 (more hands)", "接种者 ×2（更多双手）") } },
		1: { requirementDescription() { return zh("10 teams", "10 支接种队") },
			unlocked() { return hasMilestone(this.layer, 0) },
			done() { return player[this.layer].best.gte(T("MOB_MS")[1]) },
			effectDescription() { return zh("Immune citizens ×2; coverage slope ×1.2", "免疫公民 ×2；覆盖率斜率 ×1.2") } },
		2: { requirementDescription() { return zh("30 teams", "30 支接种队") },
			unlocked() { return hasMilestone(this.layer, 1) },
			done() { return player[this.layer].best.gte(T("MOB_MS")[2]) },
			effectDescription() { return zh("Doses ×2", "剂量 ×2") } },
		3: { requirementDescription() { return zh("80 teams", "80 支接种队") },
			unlocked() { return hasMilestone(this.layer, 2) },
			done() { return player[this.layer].best.gte(T("MOB_MS")[3]) },
			effectDescription() { return zh("Insight ×2", "认知 ×2") } },
		4: { requirementDescription() { return zh("200 teams", "200 支接种队") },
			unlocked() { return hasMilestone(this.layer, 3) },
			done() { return player[this.layer].best.gte(T("MOB_MS")[4]) },
			effectDescription() { return zh("Funds ×2", "资金 ×2") } },
	},
})
