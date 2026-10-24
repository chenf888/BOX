// ============================================================================
// var — 人痘接种（row 0 锚点层）
// 叙事：从跨种溢出到人痘西传。每次声望 = 一次接种行动（病例 → 接种者）。
// 锚点义务：后续每一层都在 getPointGen/var.gainMult 里给这里加 ≥1 行 (P10)。
// ============================================================================
addLayer("var", {
	name() { return zh("Variolation", "人痘接种") },
	symbol() { return window.chinesemode ? "人痘" : "VA" },
	position: 0,
	row: 0,
	startData() { return {
		unlocked: true,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
	} },
	color: "#e8c06a",
	resource() { return zh("variolated", "接种者") },
	baseResource: function() { return zh("cases", "病例") },
	baseAmount() { return player.points },
	requires: new Decimal(10),
	type: "normal",
	exponent: 0.5,
	gainMult() {
		let m = new Decimal(1)
		// 本层里程碑与 buyable
		if (hasMilestone("var", 1)) m = m.times(2)
		if (hasMilestone("var", 3)) m = m.times(3)
		if (tmp.var && player.var.unlocked) m = m.times(buyableEffect("var", 11))
		// 自缩放预算：仅 34 一枚自指升级，pow 0.15 极弱 + 软上限 (N-SELFTOTAL)
		if (hasUpgrade("var", 34)) m = m.times(upgradeEffect("var", 34))
		// P10 web：后续各层反哺锚点
		if (hasUpgrade("vac", 21)) m = m.times(2)
		if (hasUpgrade("vac", 24)) m = m.times(upgradeEffect("vac", 24))
		if (hasUpgrade("vac", 32)) m = m.times(2)
		if (hasUpgrade("vac", 44)) m = m.times(2)
		if (hasUpgrade("pro", 44)) m = m.times(2)
		if (hasUpgrade("pro", 53)) m = m.times(upgradeEffect("pro", 53))
		if (hasUpgrade("knw", 24)) m = m.times(2)
		if (hasMilestone("knw", 4)) m = m.times(2)
		if (hasUpgrade("int", 32)) m = m.times(3)
		if (hasUpgrade("int", 14)) m = m.pow(1.1)
		if (hasMilestone("sur", 1)) m = m.times(2)
		if (hasMilestone("cc", 0)) m = m.times(2)
		if (hasMilestone("mob", 0)) m = m.times(2)
		if (hasMilestone("cmp", 2)) m = m.times(2)
		if (hasMilestone("cert", 1)) m = m.times(2)
		if (hasMilestone("cert", 7)) m = m.times(3)
		if (hasChallenge("sur", 12)) m = m.times(1.5)
		if (hasAchievement("hist", 14)) m = m.times(2)
		if (hasAchievement("hist", 25)) m = m.times(3)
		// 复利引擎（次临界 0.15，软上限）：免疫人口与产能反哺接种网络
		if (player.vac.unlocked) {
			let fb1 = player.vac.points.add(1).pow(0.15)
			m = m.times(softcap(fb1, new Decimal("1e8"), 0.5))
		}
		if (player.pro.unlocked) {
			let fb2 = player.pro.points.add(1).pow(0.15)
			m = m.times(softcap(fb2, new Decimal("1e8"), 0.5))
		}
		// 反弹压强 >70%：接种行动迟滞（用户机制的第二咬合点）
		if (player.sur.unlocked && player.sur.pressure.gt(T("PRESSURE_HIGH")))
			m = m.times(0.5)
		return m
	},
	gainExp() { return new Decimal(1) },
	layerShown() { return true },
	hotkeys: [
		{ key: "v", description() { return zh("V: Vaccinate (variolate)", "V：进行一次人痘接种") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	passiveGeneration() {
		if (inChallenge("sur", 12)) return 0
		if (hasMilestone("vac", 2)) return hasMilestone("pro", 2) ? 1.5 : 1
		return 0
	},
	resetsNothing() { return hasMilestone("pro", 2) },
	autoPrestige() { return hasMilestone("pro", 2) },
	autoUpgrade() { return hasMilestone("pro", 4) || hasAchievement("hist", 45) },
	doReset(resettingLayer) {
		if (!(layers[resettingLayer].row > this.row)) return
		let keep = ["unlocked", "auto", "milestones", "best", "total"]
		if (hasMilestone("vac", 0)) keep.push("upgrades")
		if (hasMilestone("vac", 1)) keep.push("points")
		layerDataReset(this.layer, keep)
	},
	// ---- 软上限：接种者增益在下一层解锁点附近开始衰减 (P12, measured-retune 形态) ----
	softcap() {
		let c = new Decimal("1e9")
		if (hasUpgrade("int", 53)) c = c.times(10)   // 上限可见并出售提升
		return c
	},
	softcapPower() { return new Decimal(0.1) },
	tabFormat: [
		["display-text", function() {
			return zh(
				`You have <h2 style="color:#e8c06a;text-shadow:0px 0px 10px #e8c06a">${formatWhole(player.var.points)}</h2> ${zh("variolated", "接种者")}`,
				`你有 <h2 style="color:#e8c06a;text-shadow:0px 0px 10px #e8c06a">${formatWhole(player.var.points)}</h2> 接种者`)
		}],
		"prestige-button",
		["display-text", function() {
			return zh(
				`You have ${formatWhole(player.points)} cases.<br>Your best variolated: ${formatWhole(player.var.best)}`,
				`当前病例 ${formatWhole(player.points)}。<br>接种者最高纪录：${formatWhole(player.var.best)}`)
		}],
		["display-text", function() {
			if (player.var.points.gte(tmp.var.softcap.div(2))) return `<span style="opacity:.7">${zh("Gain softcap starts at ", "接种者增益软上限自 ")}${format(tmp.var.softcap)}</span>`
		}],
		["microtabs", "stuff"],
		["blank", "15px"],
	],
	microtabs: {
		stuff: {
			"Upgrades": {
				name() { return zh("Upgrades", "接种典籍") },
				unlocked() { return true },
				content: [
					["raw-html", function() { return `<div style="opacity:.5">${zh("Three thousand years of epidemics, written case by case.", "三千年的瘟疫，一例一例写进历史。")}</div>` }],
					"blank", "upgrades",
				],
			},
			"Stations": {
				name() { return zh("Stations", "接种点") },
				unlocked() { return player.var.best.gte(20) },
				content: [
					["display-text", function() { return zh("Vaccination posts reach further each time.", "接种点让每一次接种行动走得更远。") }],
					"blank", "buyables",
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
		11: { title() { return zh("Spillover", "跨种溢出") },
			description() { return zh("A single host jump. Case gain ×2.", "一次跨种溢出。病例获取 ×2。") },
			cost: new Decimal(1) },
		12: { title() { return zh("Case Registers", "病例登记") },
			description() { return zh("Cases breed on records. Case gain is boosted by your cases (log).", "病例在记录中繁殖。病例获取随病例数增长（对数）。") },
			cost: new Decimal(3),
			effect() { return player.points.add(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x" } },
		13: { title() { return zh("Nile Trade", "尼罗河贸易") },
			description() { return zh("Caravans carry more than goods. Case gain boosted by best variolated (log).", "商队载走的不止货物。病例获取随接种者纪录增长（对数）。") },
			cost: new Decimal(10),
			effect() { return player.var.best.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x" } },
		14: { title() { return zh("Imperial Armies", "帝国军旅") },
			description() { return zh("Armies march with fevers. Case gain boosted by best variolated.", "军队与热病同行。病例获取随接种者纪录增长。") },
			cost: new Decimal(40),
			effect() { return player.var.best.max(1).pow(0.25) },
			effectDisplay() { return format(this.effect()) + "x" } },
		15: { title() { return zh("Silk Road", "丝路商队") },
			description() { return zh("The road connects continents. Case gain ×4.", "道路连接大陆。病例获取 ×4。") },
			cost: new Decimal(200) },
		21: { title() { return zh("Antonine Plague", "安东尼瘟疫") },
			description() { return zh("Empires fall to pustules. Case gain boosted by cases (log²).", "帝国因脓疱而倾颓。病例获取随病例增长（对数平方）。") },
			cost: new Decimal(1e3),
			effect() { return player.points.add(1).log(10).add(1).pow(2) },
			effectDisplay() { return format(this.effect()) + "x" } },
		22: { title() { return zh("Ramses V", "拉美西斯五世") },
			description() { return zh("The oldest face of smallpox. Case gain boosted by best variolated.", "天花最古老的面孔。病例获取随接种者纪录增长。") },
			cost: new Decimal(8e3),
			effect() { return player.var.best.max(1).pow(0.25) },
			effectDisplay() { return format(this.effect()) + "x" } },
		23: { title() { return zh("Columbian Exchange", "大航海交换") },
			description() { return zh("Ships carry the pox both ways. Case gain ×8.", "帆船把瘟疫带向两个世界。病例获取 ×8。") },
			cost: new Decimal(5e4) },
		24: { title() { return zh("Crowded Cities", "城市拥挤") },
			description() { return zh("More hosts, closer together. Case gain boosted by total variolated.", "宿主更多，相距更近。病例获取随累计接种者增长。") },
			cost: new Decimal(4e5),
			effect() { return player.var.total.max(1).pow(0.3) },
			effectDisplay() { return format(this.effect()) + "x" } },
		25: { title() { return zh("Inoculation Eastward", "人痘东渡") },
			description() { return zh("Unlocks a chapter of the archive.", "解锁历史档案的一章。") },
			cost: new Decimal(3e6) },
		31: { title() { return zh("Kangxi Promotes It", "康熙推广") },
			description() { return zh("The throne orders inoculation. Case gain boosted by best variolated (log²).", "皇命推广种痘。病例获取随接种者纪录增长（对数平方）。") },
			cost: new Decimal(5e7),
			effect() { return player.var.best.max(1).log(10).add(1).pow(2) },
			effectDisplay() { return format(this.effect()) + "x" } },
		32: { title() { return zh("Avoidance Houses", "避痘所") },
			description() { return zh("Isolation before understanding. Case gain ×4.", "懵懂时代的隔离。病例获取 ×4。") },
			cost: new Decimal(1e9) },
		33: { title() { return zh("Inoculation Licenses", "种痘熟牌") },
			description() { return zh("Practitioners licensed. Case gain boosted by total variolated (log).", "种痘匠人持牌执业。病例获取随累计接种者增长（对数）。") },
			cost: new Decimal(1e11),
			effect() { return player.var.total.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x" } },
		34: { title() { return zh("Court Inoculation", "宫廷种痘") },
			description() { return zh("Variolated gain boosted by variolated (weak).", "接种者获取随接种者微弱增长。") },
			cost: new Decimal(1e14),
			effect() { return softcap(player.var.points.add(1).pow(0.15), new Decimal(50), 0.3) },
			effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
		35: { title() { return zh("Variolation Goes West", "人痘西传") },
			description() { return zh("1721: London learns. Case gain ×10.", "1721 年，伦敦学会了人痘。病例获取 ×10。") },
			cost: new Decimal(1e18) },
	},
	buyables: {
		11: { title() { return zh("Vaccination Post", "接种点") },
			cost(x) { return new Decimal(10).times(Decimal.pow(2, x)).div(hasUpgrade("pro", 45) ? 2 : 1) },
			effect(x) { return Decimal.pow(1.5, x) },
			display() {
				return zh(
					`Level: ${formatWhole(getBuyableAmount(this.layer, this.id))}<br>Effect: ×${format(this.effect(getBuyableAmount(this.layer, this.id)))} cases & variolated<br>Cost: ${format(this.cost(getBuyableAmount(this.layer, this.id)))} variolated`,
					`等级：${formatWhole(getBuyableAmount(this.layer, this.id))}<br>效果：病例与接种者 ×${format(this.effect(getBuyableAmount(this.layer, this.id)))}<br>费用：${format(this.cost(getBuyableAmount(this.layer, this.id)))} 接种者`)
			},
			canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player[this.layer].points = player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
			},
		},
	},
	milestones: {
		0: { requirementDescription() { return zh("50 variolated", "50 接种者") },
			done() { return player[this.layer].best.gte(T("VAR_MS")[0]) },
			effectDescription() { return zh("Case gain ×2.5", "病例获取 ×2.5") } },
		1: { requirementDescription() { return zh("500 variolated", "500 接种者") },
			unlocked() { return hasMilestone(this.layer, 0) },
			done() { return player[this.layer].best.gte(T("VAR_MS")[1]) },
			effectDescription() { return zh("Variolated gain ×2", "接种者获取 ×2") } },
		2: { requirementDescription() { return zh("5,000 variolated", "5,000 接种者") },
			unlocked() { return hasMilestone(this.layer, 1) },
			done() { return player[this.layer].best.gte(T("VAR_MS")[2]) },
			effectDescription() { return zh("Case gain ×2; automation reaches back", "病例获取 ×2；自动化回溯") } },
		3: { requirementDescription() { return zh("50,000 variolated", "50,000 接种者") },
			unlocked() { return hasMilestone(this.layer, 2) },
			done() { return player[this.layer].best.gte(T("VAR_MS")[3]) },
			effectDescription() { return zh("Variolated gain ×3", "接种者获取 ×3") } },
		4: { requirementDescription() { return zh("500,000 variolated", "500,000 接种者") },
			unlocked() { return hasMilestone(this.layer, 3) },
			done() { return player[this.layer].best.gte(T("VAR_MS")[4]) },
			effectDescription() { return zh("Unlocks an archive chapter", "解锁历史档案的一章") } },
	},
})
