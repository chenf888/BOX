// ============================================================================
// knw — 病毒研究（row 1 分支 3）
// 叙事：认清敌人。四大里程碑 = 使根除成为可能的四个科学事实
//（单一宿主 / 无隐性带毒 / 终身免疫 / 特征性皮疹）。
// ============================================================================
addLayer("knw", {
	name() { return zh("Virus Research", "病毒研究") },
	symbol() { return window.chinesemode ? "认知" : "KN" },
	position: 2,
	row: 1,
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
	} },
	color: "#c9a6f5",
	resource() { return zh("insight", "病毒认知") },
	baseResource: function() { return zh("variolated", "接种者") },
	baseAmount() { return player.var.points },
	requires: new Decimal(1e11),
	type: "normal",
	exponent: 1 / 3,
	branches: ["var"],
	gainMult() {
		let m = new Decimal(1)
		if (hasMilestone("knw", 4)) m = m.times(2)
		if (hasUpgrade("knw", 11)) m = m.times(2)
		if (hasUpgrade("knw", 13)) m = m.times(3)
		if (hasUpgrade("knw", 14)) m = m.times(2.5)
		if (hasUpgrade("knw", 21)) m = m.times(4)
		if (hasUpgrade("knw", 23)) m = m.times(5)
		if (hasUpgrade("knw", 25)) m = m.times(3)
		if (hasUpgrade("knw", 31)) m = m.times(2)
		if (hasUpgrade("knw", 33)) m = m.times(3)
		if (hasUpgrade("knw", 35)) m = m.times(4)
		if (hasUpgrade("knw", 32)) m = m.times(upgradeEffect("knw", 32))
		if (hasUpgrade("knw", 34)) m = m.times(upgradeEffect("knw", 34))
		if (hasUpgrade("knw", 12)) m = m.times(upgradeEffect("knw", 12))
		if (hasUpgrade("knw", 22)) m = m.times(upgradeEffect("knw", 22))
		// P10 web
		if (hasUpgrade("mob", 31)) m = m.times(upgradeEffect("mob", 31))
		if (hasMilestone("int", 2)) m = m.times(2)
		if (hasUpgrade("int", 44)) m = m.times(2)
		if (hasMilestone("sur", 4)) m = m.times(2)
		if (hasMilestone("cc", 3)) m = m.times(2)
		if (hasMilestone("mob", 3)) m = m.times(2)
		if (hasMilestone("cmp", 6)) m = m.times(2)
		if (hasMilestone("cert", 6)) m = m.times(2)
		if (hasAchievement("hist", 32)) m = m.times(2)
		// 复利引擎（次临界 0.15）：协作反哺研究
		if (player.int.unlocked) {
			let fb = player.int.points.add(1).pow(0.15)
			m = m.times(softcap(fb, new Decimal("1e8"), 0.5))
		}
		return m
	},
	gainExp() { return new Decimal(1) },
	layerShown() { return player.var.best.gte(T("UNLOCK_KNW")) || player.knw.unlocked },
	hotkeys: [
		{ key: "k", description() { return zh("K: Fund a research cycle", "K：资助一轮研究") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	// cmp m8 打包
	passiveGeneration() { return hasMilestone("cmp", 8) ? 1 : 0 },
	resetsNothing() { return hasMilestone("cmp", 8) },
	autoUpgrade() { return hasMilestone("cmp", 8) },
	doReset(resettingLayer) {
		if (!(layers[resettingLayer].row > this.row)) return
		let keep = ["unlocked", "auto", "milestones", "best", "total"]
		if (hasMilestone("knw", 2) || hasMilestone("cmp", 8)) keep.push("upgrades")
		layerDataReset(this.layer, keep)
	},
	softcap() { return new Decimal("1e9") },
	softcapPower() { return new Decimal(0.1) },
	tabFormat: [
		["display-text", function() {
			return zh(
				`You have <h2 style="color:#c9a6f5;text-shadow:0px 0px 10px #c9a6f5">${formatWhole(player.knw.points)}</h2> ${zh("insight", "病毒认知")}`,
				`你有 <h2 style="color:#c9a6f5;text-shadow:0px 0px 10px #c9a6f5">${formatWhole(player.knw.points)}</h2> 病毒认知`)
		}],
		"prestige-button",
		["display-text", function() {
			return zh(
				`Base: ${formatWhole(player.var.points)} variolated. Best: ${formatWhole(player.knw.best)}`,
				`基底：${formatWhole(player.var.points)} 接种者。最高纪录：${formatWhole(player.knw.best)}`)
		}],
		["microtabs", "stuff"],
		["blank", "15px"],
	],
	microtabs: {
		stuff: {
			"Research": {
				name() { return zh("Research", "研究") },
				unlocked() { return true },
				content: [
					["raw-html", function() { return `<div style="opacity:.5">${zh("To eradicate a disease, first know what it cannot do.", "要根除一种疾病，先认清它做不到什么。")}</div>` }],
					"blank", "upgrades",
				],
			},
			"Facts": {
				name() { return zh("The Four Facts", "四大事实") },
				unlocked() { return hasUpgrade("knw", 15) || hasMilestone("knw", 0) },
				content: [
					["display-text", function() {
						let lines = [
							[hasMilestone("knw", 0), zh("Fact I — Only humans carry it. No animal reservoir.", "事实一——只有人类携带它。没有动物储存宿主。")],
							[hasMilestone("knw", 1), zh("Fact II — No silent carriers. Every case is visible.", "事实二——没有隐性带毒者。每一例都看得见。")],
							[hasMilestone("knw", 2), zh("Fact III — Survivors are immune for life.", "事实三——幸存者终身免疫。")],
							[hasMilestone("knw", 3), zh("Fact IV — The rash is unmistakable. Cases can be found.", "事实四——皮疹特征分明。病例可以被找到。")],
						]
						let out = ""
						for (let l of lines) out += (l[0] ? `<span style="color:#c9a6f5">✔ ${l[1]}</span>` : `<span style="opacity:.35">?? ————</span>`) + "<br>"
						return out
					}],
					"blank", "milestones",
				],
			},
			"Upgrades": {
				name() { return zh("Upgrades", "深化") },
				unlocked() { return true },
				content: ["blank", "upgrades"],
			},
		},
	},
	upgrades: {
		11: { title() { return zh("Scab Specimens", "痘痂样本") },
			description() { return zh("Insight gain ×2.", "认知获取 ×2。") },
			cost: new Decimal(1) },
		12: { title() { return zh("Field Notes", "田野笔记") },
			description() { return zh("Insight gain boosted by best variolated.", "认知获取随接种者纪录增长。") },
			cost: new Decimal(3),
			effect() { return player.var.best.max(1).pow(0.25) },
			effectDisplay() { return format(this.effect()) + "x" } },
		13: { title() { return zh("Local Healers", "本地医者") },
			description() { return zh("Insight gain ×3.", "认知获取 ×3。") },
			cost: new Decimal(20) },
		14: { title() { return zh("Outbreak Diaries", "疫情日志") },
			description() { return zh("Insight gain ×2.5.", "认知获取 ×2.5。") },
			cost: new Decimal(150) },
		15: { title() { return zh("The Question List", "问题清单") },
			description() { return zh("Unlocks the Four Facts board.", "解锁「四大事实」面板。") },
			cost: new Decimal(1e3) },
		21: { title() { return zh("Market Surveillance", "市集监测") },
			description() { return zh("Foege's market watchers. Insight gain ×4.", "Foege 的市集观察员。认知获取 ×4。") },
			cost: new Decimal(8e3) },
		22: { title() { return zh("Egg Culture", "鸡胚培养") },
			description() { return zh("Insight gain boosted by best doses.", "认知获取随剂量纪录增长。") },
			cost: new Decimal(5e4),
			effect() { return player.pro.best.max(1).pow(0.25) },
			effectDisplay() { return format(this.effect()) + "x" } },
		23: { title() { return zh("Reward Posters", "悬赏告示") },
			description() { return zh("Reporting pays. Insight gain ×5.", "报告有赏。认知获取 ×5。") },
			cost: new Decimal(4e5) },
		24: { title() { return zh("Variola Major Typing", "毒株分型") },
			description() { return zh("Variolated gain ×2.", "接种者获取 ×2。") },
			cost: new Decimal(3e6) },
		25: { title() { return zh("Archive: Knowing the Enemy", "档案：认清敌人") },
			description() { return zh("Unlocks an archive chapter.", "解锁历史档案的一章。") },
			cost: new Decimal(3e7) },
		31: { title() { return zh("Field Epidemiology", "现场流行病学") },
			description() { return zh("Insight gain ×2.", "认知获取 ×2。") },
			cost: new Decimal(1) },
		32: { title() { return zh("Case Mapping", "病例绘图") },
			description() { return zh("Insight gain boosted by insight.", "认知获取随认知增长。") },
			cost: new Decimal(3),
			effect() { return softcap(player.knw.points.add(1).pow(0.25), new Decimal(300), 0.3) },
			effectDisplay() { return format(this.effect()) + "x" } },
		33: { title() { return zh("Telegraph Reporting", "电报报告") },
			description() { return zh("Insight gain ×3.", "认知获取 ×3。") },
			cost: new Decimal(20) },
		34: { title() { return zh("Serum Studies", "血清研究") },
			description() { return zh("Insight gain boosted by immune citizens.", "认知获取随免疫公民增长。") },
			cost: new Decimal(200),
			effect() { return player.vac.best.max(1).pow(0.2) },
			effectDisplay() { return format(this.effect()) + "x" } },
		35: { title() { return zh("Electron Microscope", "电子显微镜") },
			description() { return zh("1950s: see the enemy. Insight gain ×4.", "1950 年代：看见敌人。认知获取 ×4。") },
			cost: new Decimal(2e3) },
	},
	milestones: {
		0: { requirementDescription() { return zh("100 insight — Single host", "100 认知——单一宿主") },
			done() { return player[this.layer].best.gte(T("KNW_MS")[0]) },
			effectDescription() { return zh("Case gain ×2 (no animal reservoir to chase)", "病例获取 ×2（无需追查动物宿主）") } },
		1: { requirementDescription() { return zh("500 insight — No silent carriers", "500 认知——无隐性带毒") },
			unlocked() { return hasMilestone(this.layer, 0) },
			done() { return player[this.layer].best.gte(T("KNW_MS")[1]) },
			effectDescription() { return zh("Immune citizens ×2 (every case is visible)", "免疫公民 ×2（每一例都看得见）") } },
		2: { requirementDescription() { return zh("2,500 insight — Lifelong immunity", "2,500 认知——终身免疫") },
			unlocked() { return hasMilestone(this.layer, 1) },
			done() { return player[this.layer].best.gte(T("KNW_MS")[2]) },
			effectDescription() { return zh("Coverage slope ×1.15; insight ×2 gate", "覆盖率斜率 ×1.15；认知获取保留之门") } },
		3: { requirementDescription() { return zh("12,500 insight — The rash is unmistakable", "12,500 认知——皮疹特征分明") },
			unlocked() { return hasMilestone(this.layer, 2) },
			done() { return player[this.layer].best.gte(T("KNW_MS")[3]) },
			effectDescription() { return zh("Auto-buys the Filling Line (closed-form)", "自动购买分装线（闭式解）") } },
		4: { requirementDescription() { return zh("60,000 insight", "60,000 认知") },
			unlocked() { return hasMilestone(this.layer, 3) },
			done() { return player[this.layer].best.gte(T("KNW_MS")[4]) },
			effectDescription() { return zh("Variolated gain ×2; insight ×2", "接种者获取 ×2；认知 ×2") } },
		5: { requirementDescription() { return zh("300,000 insight", "300,000 认知") },
			unlocked() { return hasMilestone(this.layer, 4) },
			done() { return player[this.layer].best.gte(T("KNW_MS")[5]) },
			effectDescription() { return zh("Unlocks an archive chapter", "解锁历史档案的一章") } },
	},
})
