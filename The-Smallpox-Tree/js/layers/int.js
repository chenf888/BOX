// ============================================================================
// int — 全球协作（row 1 分支 4，M8 商店层）
// 叙事：1950 泛美 → 1959 WHA → 1967 强化根除计划 → 苏美捐苗。商店卖 K4/K5。
// ============================================================================
addLayer("int", {
	name() { return zh("Global Cooperation", "全球协作") },
	symbol() { return window.chinesemode ? "资金" : "IN" },
	position: 3,
	row: 1,
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
	} },
	color: "#f2a0b6",
	resource() { return zh("cooperation funds", "协作资金") },
	baseResource: function() { return zh("variolated", "接种者") },
	baseAmount() { return player.var.points },
	requires: new Decimal(1e14),
	type: "normal",
	exponent: 1 / 3,
	branches: ["var"],
	gainMult() {
		let m = new Decimal(1)
		if (hasMilestone("int", 0)) m = m.times(2)
		if (hasMilestone("int", 4)) m = m.times(2)
		if (hasUpgrade("int", 11)) m = m.times(2)
		if (hasUpgrade("int", 23)) m = m.times(4)
		if (hasUpgrade("int", 43)) m = m.times(6)
		if (hasUpgrade("int", 12)) m = m.times(upgradeEffect("int", 12))
		if (hasUpgrade("int", 45)) m = m.times(upgradeEffect("int", 45))
		if (hasUpgrade("int", 35)) m = m.times(upgradeEffect("int", 35))
		// P10 web
		if (hasUpgrade("mob", 35)) m = m.times(upgradeEffect("mob", 35))
		if (hasMilestone("cc", 4)) m = m.times(2)
		if (hasMilestone("mob", 4)) m = m.times(2)
		if (hasMilestone("cmp", 7)) m = m.times(2)
		if (hasMilestone("cert", 4)) m = m.times(2)
		if (hasAchievement("hist", 34)) m = m.times(2)
		// 挑战 handicap
		if (inChallenge("int", 11)) m = m.div(5)
		return m
	},
	gainExp() { return new Decimal(1) },
	layerShown() { return player.var.best.gte(T("UNLOCK_INT")) || player.int.unlocked },
	hotkeys: [
		{ key: "i", description() { return zh("I: Pledge funds", "I：划拨一笔协作资金") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	// cmp m8 打包
	passiveGeneration() { return hasMilestone("cmp", 8) ? 1 : 0 },
	resetsNothing() { return hasMilestone("cmp", 8) },
	autoUpgrade() { return hasMilestone("cmp", 8) },
	doReset(resettingLayer) {
		if (!(layers[resettingLayer].row > this.row)) return
		let keep = ["unlocked", "auto", "milestones", "best", "total"]
		if (hasMilestone("int", 2) || hasMilestone("cmp", 8)) keep.push("upgrades")
		layerDataReset(this.layer, keep)
	},
	softcap() { return new Decimal("1e9") },
	softcapPower() { return new Decimal(0.1) },
	tabFormat: [
		["display-text", function() {
			return zh(
				`You have <h2 style="color:#f2a0b6;text-shadow:0px 0px 10px #f2a0b6">${formatWhole(player.int.points)}</h2> ${zh("cooperation funds", "协作资金")}`,
				`你有 <h2 style="color:#f2a0b6;text-shadow:0px 0px 10px #f2a0b6">${formatWhole(player.int.points)}</h2> 协作资金`)
		}],
		"prestige-button",
		["display-text", function() {
			return zh(
				`Base: ${formatWhole(player.var.points)} variolated. Best: ${formatWhole(player.int.best)}`,
				`基底：${formatWhole(player.var.points)} 接种者。最高纪录：${formatWhole(player.int.best)}`)
		}],
		["microtabs", "stuff"],
		["blank", "15px"],
	],
	microtabs: {
		stuff: {
			"Shop": {
				name() { return zh("Shop", "协作商店") },
				unlocked() { return true },
				content: [
					["raw-html", function() { return `<div style="opacity:.5">${zh("1967: the World Health Assembly bets the world can finish the job.", "1967 年：世界卫生大会押注人类能干完这件事。")}</div>` }],
					"blank", "upgrades",
				],
			},
			"Agreements": {
				name() { return zh("Bilateral Agreements", "双边协定") },
				unlocked() { return player.int.best.gte(100) },
				content: ["blank", "buyables"],
			},
			"Milestones": {
				name() { return zh("Milestones", "里程碑") },
				unlocked() { return true },
				content: ["blank", "milestones"],
			},
			"Challenge": {
				name() { return zh("Challenge", "试炼") },
				unlocked() { return hasMilestone("int", 1) },
				content: ["blank", "challenges"],
			},
		},
	},
	upgrades: {
		11: { title() { return zh("Pass the Resolution", "通过决议") },
			description() { return zh("Funds gain ×2.", "资金获取 ×2。") },
			cost: new Decimal(1) },
		12: { title() { return zh("Voluntary Contributions", "自愿捐款") },
			description() { return zh("Funds gain boosted by funds.", "资金获取随资金增长。") },
			cost: new Decimal(3),
			effect() { return softcap(player.int.points.add(1).pow(0.3), new Decimal(300), 0.3) },
			effectDisplay() { return format(this.effect()) + "x" } },
		13: { title() { return zh("Donor Conferences", "捐助国会议") },
			description() { return zh("Funds gain boosted by immune citizens (log).", "资金获取随免疫公民增长（对数）。") },
			cost: new Decimal(20),
			effect() { return player.vac.best.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x" } },
		14: { title() { return zh("Bifurcated Needle Doctrine", "双叉针教范") },
			description() { return zh("Variolated gain is raised to a power of 1.1.", "接种者获取变为 1.1 次幂。") },
			cost: new Decimal(200) },
		15: { title() { return zh("Open the Second Account", "开设第二账目") },
			description() { return zh("Unlocks the second shelf of the shop.", "解锁商店第二排货架。") },
			cost: new Decimal(1e3) },
		21: { title() { return zh("USSR Donates Doses", "苏联赠苗") },
			description() { return zh("Hundreds of millions of doses. Immune citizens ×2.", "数以亿计的剂量。免疫公民 ×2。") },
			cost: new Decimal(8e3) },
		22: { title() { return zh("Joint Laboratories", "联合实验室") },
			description() { return zh("Funds gain boosted by insight.", "资金获取随病毒认知增长。") },
			cost: new Decimal(4e4),
			effect() { return player.knw.best.max(1).pow(0.25) },
			effectDisplay() { return format(this.effect()) + "x" } },
		23: { title() { return zh("Vehicle Fleets", "车队") },
			description() { return zh("Funds gain boosted by best variolated.", "资金获取随接种者纪录增长。") },
			cost: new Decimal(2e5),
			effect() { return player.var.best.max(1).pow(0.2) },
			effectDisplay() { return format(this.effect()) + "x" } },
		24: { title() { return zh("Train the Trainers", "培训教员") },
			description() { return zh("Dose gain ×2.", "剂量获取 ×2。") },
			cost: new Decimal(1e6) },
		25: { title() { return zh("Archive: 1967", "档案：1967") },
			description() { return zh("Unlocks an archive chapter.", "解锁历史档案的一章。") },
			cost: new Decimal(5e6) },
		31: { title() { return zh("Immune Memory Drive", "免疫记忆计划") },
			description() { return zh("Immune citizens gain is raised to a power of 1.1.", "免疫公民获取变为 1.1 次幂。") },
			cost: new Decimal(4e7) },
		32: { title() { return zh("Ring Vaccination Doctrine", "环状接种教范") },
			description() { return zh("Variolated gain ×3.", "接种者获取 ×3。") },
			cost: new Decimal(3e8) },
		33: { title() { return zh("Surveillance Bounty", "监测悬赏") },
			description() { return zh("Surveillance bounty income ×2.", "监测奖励金产出 ×2。") },
			cost: new Decimal(3e9) },
		34: { title() { return zh("Raise the Ceiling", "提高上限") },
			description() { return zh("Variolated gain softcap starts 10× later (visible on the variolation tab).", "接种者增益软上限延后 10×（在接种页可见）。") },
			cost: new Decimal(3e10) },
		35: { title() { return zh("Audit Teams", "审计小组") },
			description() { return zh("Funds gain boosted by insight (log²).", "资金获取随认知增长（对数平方）。") },
			cost: new Decimal(3e11),
			effect() { return player.knw.best.max(1).log(2).add(1) },
			effectDisplay() { return format(this.effect()) + "x" } },
		41: { title() { return zh("Certification Fund", "认证基金") },
			description() { return zh("Certification launches cost 10% less.", "认证发射消耗 −10%。") },
			cost: new Decimal(3e12),
			unlocked() { return hasUpgrade(this.layer, 15) } },
		42: { title() { return zh("Quality Assurance", "质量保证") },
			description() { return zh("Dose gain is raised to a power of 1.05.", "剂量获取变为 1.05 次幂。") },
			cost: new Decimal(3e13),
			unlocked() { return hasUpgrade(this.layer, 15) } },
		43: { title() { return zh("Media Campaigns", "宣传运动") },
			description() { return zh("Funds gain ×6.", "资金获取 ×6。") },
			cost: new Decimal(3e14),
			unlocked() { return hasUpgrade(this.layer, 15) } },
		44: { title() { return zh("Research Fellowships", "研究基金") },
			description() { return zh("Insight gain ×2.", "认知获取 ×2。") },
			cost: new Decimal(3e15),
			unlocked() { return hasUpgrade(this.layer, 15) } },
		45: { title() { return zh("Endgame Treasury", "终局金库") },
			description() { return zh("Funds gain boosted by funds (log²).", "资金获取随资金增长（对数平方）。") },
			cost: new Decimal(3e16),
			unlocked() { return hasUpgrade(this.layer, 15) },
			effect() { return player.int.points.add(1).log(10).add(1).pow(2) },
			effectDisplay() { return format(this.effect()) + "x" } },
	},
	buyables: {
		11: { title() { return zh("Bilateral Agreement", "双边协定") },
			cost(x) { return new Decimal(50).times(Decimal.pow(2, x)) },
			effect(x) { return Decimal.pow(0.92, x) },
			display() {
				return zh(
					`Level: ${formatWhole(getBuyableAmount(this.layer, this.id))}<br>Effect: certification launch costs ×${format(this.effect(getBuyableAmount(this.layer, this.id)))}<br>Cost: ${format(this.cost(getBuyableAmount(this.layer, this.id)))} funds`,
					`等级：${formatWhole(getBuyableAmount(this.layer, this.id))}<br>效果：认证发射消耗 ×${format(this.effect(getBuyableAmount(this.layer, this.id)))}<br>费用：${format(this.cost(getBuyableAmount(this.layer, this.id)))} 协作资金`)
			},
			canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player[this.layer].points = player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
			},
		},
	},
	milestones: {
		0: { requirementDescription() { return zh("500 funds", "500 资金") },
			done() { return player[this.layer].best.gte(T("INT_MS")[0]) },
			effectDescription() { return zh("Funds gain ×2", "资金获取 ×2") } },
		1: { requirementDescription() { return zh("2,500 funds", "2,500 资金") },
			unlocked() { return hasMilestone(this.layer, 0) },
			done() { return player[this.layer].best.gte(T("INT_MS")[1]) },
			effectDescription() { return zh("Immune citizens ×2", "免疫公民 ×2") } },
		2: { requirementDescription() { return zh("10,000 funds", "10,000 资金") },
			unlocked() { return hasMilestone(this.layer, 1) },
			done() { return player[this.layer].best.gte(T("INT_MS")[2]) },
			effectDescription() { return zh("Insight ×2; shop upgrades survive resets", "认知 ×2；商店技术在重置中保留") } },
		3: { requirementDescription() { return zh("50,000 funds", "50,000 资金") },
			unlocked() { return hasMilestone(this.layer, 2) },
			done() { return player[this.layer].best.gte(T("INT_MS")[3]) },
			effectDescription() { return zh("Automatically vaccinate (passive)", "自动接种（被动生成免疫公民）") } },
		4: { requirementDescription() { return zh("250,000 funds", "250,000 资金") },
			unlocked() { return hasMilestone(this.layer, 3) },
			done() { return player[this.layer].best.gte(T("INT_MS")[4]) },
			effectDescription() { return zh("Funds gain ×2", "资金获取 ×2") } },
		5: { requirementDescription() { return zh("1,250,000 funds", "1,250,000 资金") },
			unlocked() { return hasMilestone(this.layer, 4) },
			done() { return player[this.layer].best.gte(T("INT_MS")[5]) },
			effectDescription() { return zh("Certification prep begins (story)", "认证筹备开始（剧情）") } },
	},
	challenges: {
		11: { name() { return zh("Funds Frozen", "资金冻结") },
			challengeDescription() { return zh("Donors walk away (funds ÷5). Reach 2,500 funds anyway.", "捐助者拂袖而去（资金 ÷5）。在此状态下达到 2,500 资金。") },
			onEnter() { player.int.points = new Decimal(0) },
			canComplete() { return player.int.points.gte(2500) },
			rewardDescription() { return zh("Certification launches cost 15% less", "认证发射消耗 −15%") },
			unlocked() { return hasMilestone("int", 1) } },
	},
})
