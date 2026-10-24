// ============================================================================
// cmp — 全球战役（row 3 枢纽，custom）
// P53 汇流：baseAmount = min(围堵行动, 冷链节点, 接种队)——后勤、围堵、动员缺一不可。
// 12 级里程碑 = 战役前线链：南美 1971 → 南亚 1975 → 非洲之角 1976 → 索马里 1977。
// update() 还承载 autoBuyable 闭式驱动（P54，knw m3 授予）。
// ============================================================================
addLayer("cmp", {
	name() { return zh("Global Campaign", "全球战役") },
	symbol() { return window.chinesemode ? "战役" : "CM" },
	position: 0,
	row: 3,
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
	} },
	color: "#f27a7a",
	resource() { return zh("campaign progress", "战役进度") },
	baseResource() { return zh("min(ops, nodes, teams)", "min(围堵, 节点, 接种队)") },
	baseAmount() { return player.sur.points.min(player.cc.points).min(player.mob.points) },
	requires() { return new Decimal(10) },
	type: "custom",
	branches: ["sur", "cc", "mob"],
	gainMult() {
		let m = new Decimal(1)
		if (hasMilestone("cmp", 0)) m = m.times(2)
		if (hasMilestone("cmp", 9)) m = m.times(3)
		if (hasMilestone("cmp", 11)) m = m.times(5)
		if (hasUpgrade("cc", 32)) m = m.times(upgradeEffect("cc", 32))
		if (hasUpgrade("mob", 32)) m = m.times(upgradeEffect("mob", 32))
		if (player.pro.unlocked && tmp.pro) m = m.times(buyableEffect("pro", 11))   // 战役补给（分装线跨层消费）
		if (hasAchievement("hist", 27)) m = m.times(2)
		if (hasMilestone("cert", 5)) m = m.times(2)
		return m
	},
	getResetGain() {
		return this.baseAmount().max(1).pow(0.4).times(tmp.cmp.gainMult)
	},
	canReset() { return this.baseAmount().gte(this.requires()) },
	/* 引擎每帧对 custom 层无条件调 getNextAt（game.js type=="custom" 分支），缺失则启动即崩（Stage 6.5 浏览器实测） */
	getNextAt() { return this.requires() },
	prestigeButtonText() {
		return zh(
			`Launch a campaign front<br>(needs min(ops, nodes, teams) ≥ ${formatWhole(this.requires())})`,
			`开辟一条战役前线<br>（需要 min(围堵, 节点, 接种队) ≥ ${formatWhole(this.requires())}）`)
	},
	hotkeys: [
		{ key: "w", description() { return zh("W: Open a campaign front", "W：开辟一条战役前线") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	layerShown() {
		return (player.sur.best.gte(T("UNLOCK_CMP")) && player.cc.best.gte(T("UNLOCK_CMP")) && player.mob.best.gte(T("UNLOCK_CMP"))) || player.cmp.unlocked
	},
	// autoBuyable 闭式驱动（P4 step 5 / P54）：分装线成本 2^x，闭式逆解 log2
	update(diff) {
		if (!hasMilestone("knw", 3)) return
		if (!player.pro.unlocked) return
		let costBase = hasUpgrade("pro", 45) ? new Decimal(500) : new Decimal(1000)
		let doses = player.pro.points
		if (doses.lt(costBase)) return
		let target = doses.div(costBase).add(1).log(2).floor().add(1)
		let cur = getBuyableAmount("pro", 11)
		if (target.gt(cur)) {
			let totalCost = costBase.times(Decimal.pow(2, target).sub(1))
			player.pro.points = doses.sub(totalCost).max(0)
			setBuyableAmount("pro", 11, target)
		}
	},
	doReset(resettingLayer) {
		if (!(layers[resettingLayer].row > this.row)) return
		layerDataReset(this.layer, ["unlocked", "auto", "milestones", "best", "total"])
	},
	softcap() { return new Decimal("1e8") },
	softcapPower() { return new Decimal(0.1) },
	tabFormat: [
		["display-text", function() {
			return zh(
				`You have <h2 style="color:#f27a7a;text-shadow:0px 0px 10px #f27a7a">${formatWhole(player.cmp.points)}</h2> ${zh("campaign progress", "战役进度")}`,
				`你有 <h2 style="color:#f27a7a;text-shadow:0px 0px 10px #f27a7a">${formatWhole(player.cmp.points)}</h2> 战役进度`)
		}],
		"prestige-button",
		["display-text", function() {
			return zh(
				`Convergence: ${formatWhole(player.sur.points)} ops · ${formatWhole(player.cc.points)} nodes · ${formatWhole(player.mob.points)} teams → the weakest sets the pace.`,
				`汇流：${formatWhole(player.sur.points)} 围堵 · ${formatWhole(player.cc.points)} 节点 · ${formatWhole(player.mob.points)} 接种队 → 最短的那块板决定进度。`)
		}],
		["microtabs", "stuff"],
		["blank", "15px"],
	],
	microtabs: {
		stuff: {
			"Fronts": {
				name() { return zh("Milestones", "战役前线") },
				unlocked() { return true },
				content: [
					["raw-html", function() { return `<div style="opacity:.5">${zh("Region by region, the map goes quiet.", "一块大陆一块大陆地，地图归于沉寂。")}</div>` }],
					"blank", "milestones",
				],
			},
			"Logistics": {
				name() { return zh("Logistics", "后勤") },
				unlocked() { return player.cmp.best.gte(5) },
				content: ["blank", "upgrades"],
			},
		},
	},
	upgrades: {
		11: { title() { return zh("Targeted Operations", "精准行动") },
			description() { return zh("Campaign progress ×2.", "战役进度 ×2。") },
			cost: new Decimal(1) },
		12: { title() { return zh("National Days", "国家接种日") },
			description() { return zh("Campaign progress ×3.", "战役进度 ×3。") },
			cost: new Decimal(5) },
		13: { title() { return zh("Special Searches", "特别搜索") },
			description() { return zh("Campaign progress ×4.", "战役进度 ×4。") },
			cost: new Decimal(25) },
		14: { title() { return zh("Border Checkpoints", "边境检疫") },
			description() { return zh("Campaign progress ×5.", "战役进度 ×5。") },
			cost: new Decimal(150) },
		15: { title() { return zh("Archive: Brazil 1971", "档案：巴西 1971") },
			description() { return zh("Unlocks an archive chapter.", "解锁历史档案的一章。") },
			cost: new Decimal(1e3) },
	},
	milestones: {
		0: { requirementDescription() { return zh("10 campaign progress", "10 战役进度") },
			done() { return player[this.layer].best.gte(T("CMP_MS")[0]) },
			effectDescription() { return zh("Campaign progress ×2", "战役进度 ×2") } },
		1: { requirementDescription() { return zh("25 — The Americas fall silent (Brazil, 1971)", "25 — 美洲归于沉寂（巴西，1971）") },
			unlocked() { return hasMilestone(this.layer, 0) },
			done() { return player[this.layer].best.gte(T("CMP_MS")[1]) },
			effectDescription() { return zh("Case gain ×2 (reporting sharpens)", "病例获取 ×2") } },
		2: { requirementDescription() { return zh("60 campaign progress", "60 战役进度") },
			unlocked() { return hasMilestone(this.layer, 1) },
			done() { return player[this.layer].best.gte(T("CMP_MS")[2]) },
			effectDescription() { return zh("Variolated ×2", "接种者 ×2") } },
		3: { requirementDescription() { return zh("150 — South Asia 1975: India's last case", "150 — 南亚 1975：印度最后一例") },
			unlocked() { return hasMilestone(this.layer, 2) },
			done() { return player[this.layer].best.gte(T("CMP_MS")[3]) },
			effectDescription() { return zh("Immune citizens ×2; automates the three pillars", "免疫公民 ×2；三大支柱自动化") } },
		4: { requirementDescription() { return zh("400 campaign progress", "400 战役进度") },
			unlocked() { return hasMilestone(this.layer, 3) },
			done() { return player[this.layer].best.gte(T("CMP_MS")[4]) },
			effectDescription() { return zh("Pillar package: ops/nodes/teams auto-run and survive resets", "支柱打包：围堵/节点/接种队自动运行且不再清空") } },
		5: { requirementDescription() { return zh("1,000 — Horn of Africa 1976", "1,000 — 非洲之角 1976") },
			unlocked() { return hasMilestone(this.layer, 4) },
			done() { return player[this.layer].best.gte(T("CMP_MS")[5]) },
			effectDescription() { return zh("Doses ×2", "剂量 ×2") } },
		6: { requirementDescription() { return zh("2,500 — The last case: Ali Maow Maalin, 1977-10-26", "2,500 — 最后一例：阿里·马奥·马林，1977-10-26") },
			unlocked() { return hasMilestone(this.layer, 5) },
			done() { return player[this.layer].best.gte(T("CMP_MS")[6]) },
			effectDescription() { return zh("Insight ×2; certification becomes visible", "认知 ×2；认证进入视野") } },
		7: { requirementDescription() { return zh("6,000 campaign progress", "6,000 战役进度") },
			unlocked() { return hasMilestone(this.layer, 6) },
			done() { return player[this.layer].best.gte(T("CMP_MS")[7]) },
			effectDescription() { return zh("Funds ×2", "资金 ×2") } },
		8: { requirementDescription() { return zh("15,000 campaign progress", "15,000 战役进度") },
			unlocked() { return hasMilestone(this.layer, 7) },
			done() { return player[this.layer].best.gte(T("CMP_MS")[8]) },
			effectDescription() { return zh("Row-1 package: all four branches auto-run, auto-buy and survive", "第一排打包：四分支自动运行/购买且保留") } },
		9: { requirementDescription() { return zh("40,000 campaign progress", "40,000 战役进度") },
			unlocked() { return hasMilestone(this.layer, 8) },
			done() { return player[this.layer].best.gte(T("CMP_MS")[9]) },
			effectDescription() { return zh("Campaign progress ×3", "战役进度 ×3") } },
		10: { requirementDescription() { return zh("100,000 campaign progress", "100,000 战役进度") },
			unlocked() { return hasMilestone(this.layer, 9) },
			done() { return player[this.layer].best.gte(T("CMP_MS")[10]) },
			effectDescription() { return zh("Certification needs 25% less campaign progress", "认证所需战役进度 −25%") } },
		11: { requirementDescription() { return zh("250,000 campaign progress", "250,000 战役进度") },
			unlocked() { return hasMilestone(this.layer, 10) },
			done() { return player[this.layer].best.gte(T("CMP_MS")[11]) },
			effectDescription() { return zh("Campaign progress ×5", "战役进度 ×5") } },
	},
})
