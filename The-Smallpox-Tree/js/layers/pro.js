// ============================================================================
// pro — 疫苗生产（row 1 分支 2）
// 叙事：小牛淋巴 → 甘油苗 → Collier 冻干 → 双叉针 → 全球分发。
// 自缩放预算：仅 32 一枚（pow 0.3 + 软上限）；分装线 buyable 反馈指数 0.58 < 1 (F13)。
// ============================================================================
addLayer("pro", {
	name() { return zh("Vaccine Production", "疫苗生产") },
	symbol() { return window.chinesemode ? "疫量" : "PR" },
	position: 1,
	row: 1,
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
	} },
	color: "#90d493",
	resource() { return zh("vaccine doses", "疫苗剂量") },
	baseResource: function() { return zh("variolated", "接种者") },
	baseAmount() { return player.var.points },
	requires: new Decimal(1e8),
	type: "normal",
	exponent: 1 / 3,
	branches: ["var"],
	gainMult() {
		let m = new Decimal(1)
		if (hasMilestone("pro", 1)) m = m.times(2)
		if (hasMilestone("pro", 4)) m = m.times(3)
		if (hasUpgrade("pro", 31)) m = m.times(2)
		if (hasUpgrade("pro", 33)) m = m.times(upgradeEffect("pro", 33))
		if (hasUpgrade("pro", 35)) m = m.times(upgradeEffect("pro", 35))
		if (hasUpgrade("pro", 41)) m = m.times(upgradeEffect("pro", 41))
		if (hasUpgrade("pro", 42)) m = m.times(upgradeEffect("pro", 42))
		if (hasUpgrade("pro", 51)) m = m.times(6)
		if (hasUpgrade("pro", 52)) m = m.times(upgradeEffect("pro", 52))
		if (hasUpgrade("pro", 55)) m = m.times(upgradeEffect("pro", 55))
		if (hasUpgrade("pro", 32)) m = m.times(upgradeEffect("pro", 32))
		if (hasUpgrade("pro", 43)) m = m.times(upgradeEffect("pro", 43))
		if (hasUpgrade("pro", 24)) m = m.times(2)
		// P10 web
		if (hasUpgrade("cc", 14)) m = m.times(upgradeEffect("cc", 14))
		if (hasUpgrade("mob", 22)) m = m.times(upgradeEffect("mob", 22))
		if (hasUpgrade("int", 24)) m = m.times(2)
		if (hasMilestone("sur", 3)) m = m.times(2)
		if (hasMilestone("cc", 2)) m = m.times(2)
		if (hasMilestone("mob", 2)) m = m.times(2)
		if (hasMilestone("cmp", 5)) m = m.times(2)
		if (hasMilestone("cert", 3)) m = m.times(2)
		if (hasAchievement("hist", 31)) m = m.times(2)
		// 复利引擎（次临界 0.15）：认知反哺产能
		if (player.knw.unlocked) {
			let fb = player.knw.points.add(1).pow(0.15)
			m = m.times(softcap(fb, new Decimal("1e8"), 0.5))
		}
		// 反弹压强 >70%：生产迟滞
		if (player.sur.unlocked && player.sur.pressure.gt(T("PRESSURE_HIGH")))
			m = m.times(0.5)
		// 挑战：冷链中断 handicap（vac c11）
		if (inChallenge("vac", 11)) m = m.div(10)
		return m
	},
	gainExp() { return new Decimal(1) },
	layerShown() { return player.var.best.gte(T("UNLOCK_PRO")) || player.pro.unlocked },
	hotkeys: [
		{ key: "p", description() { return zh("P: Run a production batch", "P：开工一批疫苗生产") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	// cmp m8 打包
	passiveGeneration() { return hasMilestone("cmp", 8) ? 1 : 0 },
	resetsNothing() { return hasMilestone("cmp", 8) },
	autoUpgrade() { return hasMilestone("cmp", 8) },
	doReset(resettingLayer) {
		if (!(layers[resettingLayer].row > this.row)) return
		let keep = ["unlocked", "auto", "milestones", "best", "total"]
		if (hasMilestone("pro", 2) || hasMilestone("cmp", 8)) keep.push("upgrades")
		layerDataReset(this.layer, keep)
	},
	softcap() { return new Decimal("1e10") },
	softcapPower() { return new Decimal(0.1) },
	tabFormat: [
		["display-text", function() {
			return zh(
				`You have <h2 style="color:#90d493;text-shadow:0px 0px 10px #90d493">${formatWhole(player.pro.points)}</h2> ${zh("vaccine doses", "疫苗剂量")}`,
				`你有 <h2 style="color:#90d493;text-shadow:0px 0px 10px #90d493">${formatWhole(player.pro.points)}</h2> 疫苗剂量`)
		}],
		"prestige-button",
		["display-text", function() {
			return zh(
				`Base: ${formatWhole(player.var.points)} variolated. Best: ${formatWhole(player.pro.best)}`,
				`基底：${formatWhole(player.var.points)} 接种者。最高纪录：${formatWhole(player.pro.best)}`)
		}],
		["microtabs", "stuff"],
		["blank", "15px"],
	],
	microtabs: {
		stuff: {
			"Upgrades": {
				name() { return zh("Upgrades", "生产技术") },
				unlocked() { return true },
				content: [
					["raw-html", function() { return `<div style="opacity:.5">${zh("Heat-stable vaccine is what makes the tropics winnable.", "耐热疫苗，是热带战役能够打赢的原因。")}</div>` }],
					"blank", "upgrades",
				],
			},
			"Line": {
				name() { return zh("Filling Line", "分装线") },
				unlocked() { return player.pro.best.gte(50) },
				content: ["blank", "buyables"],
			},
			"Milestones": {
				name() { return zh("Milestones", "里程碑") },
				unlocked() { return true },
				content: ["blank", "milestones"],
			},
		},
	},
	upgrades: {
		31: { title() { return zh("Calf Lymph Farms", "小牛淋巴场") },
			description() { return zh("19th century supply. Dose gain ×2.", "19 世纪的供给。剂量获取 ×2。") },
			cost: new Decimal(1) },
		32: { title() { return zh("Glycerinated Stock", "甘油灭活库存") },
			description() { return zh("Dose gain boosted by doses.", "剂量获取随剂量增长。") },
			cost: new Decimal(3),
			effect() { return softcap(player.pro.points.add(1).pow(0.3), new Decimal(500), 0.3) },
			effectDisplay() { return format(this.effect()) + "x" } },
		33: { title() { return zh("One Vial, Many Arms", "一苗多用") },
			description() { return zh("Dose gain boosted by best variolated.", "剂量获取随接种者纪录增长。") },
			cost: new Decimal(20),
			effect() { return player.var.best.max(1).pow(0.3) },
			effectDisplay() { return format(this.effect()) + "x" } },
		34: { title() { return zh("Standardized Reporting", "标准化报告") },
			description() { return zh("Every vial is counted. Case gain ×2.", "每一支都有账可查。病例获取 ×2。") },
			cost: new Decimal(200) },
		35: { title() { return zh("Freeze-Dried Vaccine", "冻干疫苗") },
			description() { return zh("Collier's heat-stable lymph. Dose gain boosted by best doses (log²).", "Collier 的耐热疫苗。剂量获取随剂量纪录增长（对数平方）。") },
			cost: new Decimal(2e3),
			effect() { return player.pro.best.max(1).log(10).add(1).pow(2) },
			effectDisplay() { return format(this.effect()) + "x" } },
		41: { title() { return zh("Needle Workshops", "针头车间") },
			description() { return zh("Dose gain boosted by immune citizens (log).", "剂量获取随免疫公民增长（对数）。") },
			cost: new Decimal(2e4),
			effect() { return player.vac.best.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x" } },
		42: { title() { return zh("Jet Injectors", "喷射注射器") },
			description() { return zh("Hundreds per hour. Dose gain boosted by immune citizens.", "每小时数百人。剂量获取随免疫公民增长。") },
			cost: new Decimal(2e5),
			effect() { return player.vac.best.max(1).pow(0.25) },
			effectDisplay() { return format(this.effect()) + "x" } },
		43: { title() { return zh("Thermostability", "热稳定性") },
			description() { return zh("Dose gain boosted by best doses (log).", "剂量获取随剂量纪录增长（对数）。") },
			cost: new Decimal(2e6),
			effect() { return player.pro.best.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x" } },
		44: { title() { return zh("Cold-Chain Ready", "冷链就绪") },
			description() { return zh("Variolated gain ×2.", "接种者获取 ×2。") },
			cost: new Decimal(2e7) },
		45: { title() { return zh("Cheaper Vials", "廉价安瓿") },
			description() { return zh("Filling-line costs are halved.", "分装线费用减半。") },
			cost: new Decimal(2e8) },
		51: { title() { return zh("Industrial Fermentation", "工业化生产") },
			description() { return zh("Dose gain boosted again (log²).", "剂量获取再增（对数平方）。") },
			cost: new Decimal(2e9),
			effect() { return player.pro.points.add(1).log(10).add(1).pow(2) },
			effectDisplay() { return format(this.effect()) + "x" } },
		52: { title() { return zh("Potency Testing", "效力检验") },
			description() { return zh("Dose gain boosted by total doses.", "剂量获取随累计剂量增长。") },
			cost: new Decimal(2e10),
			effect() { return player.pro.total.max(1).pow(0.25) },
			effectDisplay() { return format(this.effect()) + "x" } },
		53: { title() { return zh("WHO-Certified Lots", "国际认证批次") },
			description() { return zh("Variolated gain boosted by best variolated (log²).", "接种者获取随接种者纪录增长（对数平方）。") },
			cost: new Decimal(2e11),
			effect() { return player.var.best.max(1).log(2).add(1).pow(2) },
			effectDisplay() { return format(this.effect()) + "x" } },
		54: { title() { return zh("Archive: The Needle", "档案：双叉针") },
			description() { return zh("Unlocks an archive chapter.", "解锁历史档案的一章。") },
			cost: new Decimal(2e12) },
		55: { title() { return zh("Global Distribution", "全球分发") },
			description() { return zh("Dose gain boosted by best doses (log²).", "剂量获取随剂量纪录增长（对数平方）。") },
			cost: new Decimal(2e13),
			effect() { return player.pro.best.max(1).log(10).add(1).pow(2) },
			effectDisplay() { return format(this.effect()) + "x" } },
	},
	buyables: {
		11: { title() { return zh("Filling Line", "分装线") },
			cost(x) { return new Decimal(1e3).times(Decimal.pow(2, x)).div(hasUpgrade("pro", 45) ? 2 : 1) },
			effect(x) { return Decimal.pow(1.5, x) },
			display() {
				return zh(
					`Level: ${formatWhole(getBuyableAmount(this.layer, this.id))}<br>Effect: dose gain ×${format(this.effect(getBuyableAmount(this.layer, this.id)))} & campaign supply<br>Cost: ${format(this.cost(getBuyableAmount(this.layer, this.id)))} doses`,
					`等级：${formatWhole(getBuyableAmount(this.layer, this.id))}<br>效果：剂量获取 ×${format(this.effect(getBuyableAmount(this.layer, this.id)))}，战役补给提升<br>费用：${format(this.cost(getBuyableAmount(this.layer, this.id)))} 剂量`)
			},
			canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player[this.layer].points = player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
			},
		},
	},
	milestones: {
		0: { requirementDescription() { return zh("2,000 doses", "2,000 剂量") },
			done() { return player[this.layer].best.gte(T("PRO_MS")[0]) },
			effectDescription() { return zh("Auto-vaccinate & variolated survive their own sweeps", "自动接种；接种行动不再清空病例") } },
		1: { requirementDescription() { return zh("10,000 doses", "10,000 剂量") },
			unlocked() { return hasMilestone(this.layer, 0) },
			done() { return player[this.layer].best.gte(T("PRO_MS")[1]) },
			effectDescription() { return zh("Dose gain ×2", "剂量获取 ×2") } },
		2: { requirementDescription() { return zh("50,000 doses", "50,000 剂量") },
			unlocked() { return hasMilestone(this.layer, 1) },
			done() { return player[this.layer].best.gte(T("PRO_MS")[2]) },
			effectDescription() { return zh("Production upgrades survive resets", "生产技术在重置中保留") } },
		3: { requirementDescription() { return zh("250,000 doses", "250,000 剂量") },
			unlocked() { return hasMilestone(this.layer, 2) },
			done() { return player[this.layer].best.gte(T("PRO_MS")[3]) },
			effectDescription() { return zh("Auto-buy variolated upgrades", "自动购买接种典籍") } },
		4: { requirementDescription() { return zh("1,000,000 doses", "1,000,000 剂量") },
			unlocked() { return hasMilestone(this.layer, 3) },
			done() { return player[this.layer].best.gte(T("PRO_MS")[4]) },
			effectDescription() { return zh("Dose gain ×3", "剂量获取 ×3") } },
	},
})
