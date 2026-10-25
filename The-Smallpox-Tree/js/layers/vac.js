// ============================================================================
// vac — 牛痘疫苗（row 1 分支 1）
// 叙事：1796 詹纳 → 牛痘环球 → 强制接种法。免疫公民 + 覆盖率% 子进度（硬上限 100）。
// 自缩放预算：仅 43 一枚（pow 0.4 + 软上限）。
// ============================================================================
addLayer("vac", {
	name() { return zh("Cowpox Vaccine", "牛痘疫苗") },
	symbol() { return window.chinesemode ? "牛苗" : "CX" },
	position: 0,
	row: 1,
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
	} },
	color: "#7ab8f5",
	resource() { return zh("immune citizens", "免疫公民") },
	baseResource: function() { return zh("variolated", "接种者") },
	baseAmount() { return player.var.points },
	requires: new Decimal(1e5),
	type: "normal",
	exponent: 1 / 3,
	branches: ["var"],
	gainMult() {
		let m = new Decimal(1)
		if (hasMilestone("vac", 4)) m = m.times(2)
		if (hasUpgrade("vac", 23)) m = m.times(upgradeEffect("vac", 23))
		if (hasUpgrade("vac", 25)) m = m.times(upgradeEffect("vac", 25))
		if (hasUpgrade("vac", 31)) m = m.times(upgradeEffect("vac", 31))
		if (hasUpgrade("vac", 33)) m = m.times(upgradeEffect("vac", 33))
		if (hasUpgrade("vac", 34)) m = m.times(upgradeEffect("vac", 34))
		if (hasUpgrade("vac", 42)) m = m.times(upgradeEffect("vac", 42))
		if (hasUpgrade("vac", 22)) m = m.times(upgradeEffect("vac", 22))
		if (hasUpgrade("vac", 43)) m = m.times(upgradeEffect("vac", 43))
		// 自缩放（唯一一枚，pow 0.4 + 软上限，N-SELFTOTAL）
		// —— 由 43 的 effect() 提供，upgradeEffect 已在上面接入
		if (hasChallenge("vac", 12)) m = m.times(1.25)
		// P10 web：更老层与新层反哺
		if (hasUpgrade("int", 21)) m = m.times(2)
		if (hasUpgrade("mob", 13)) m = m.times(upgradeEffect("mob", 13))
		if (hasMilestone("knw", 1)) m = m.times(2)
		if (hasMilestone("int", 1)) m = m.times(2)
		if (hasMilestone("sur", 2)) m = m.times(2)
		if (hasMilestone("cc", 1)) m = m.times(2)
		if (hasMilestone("mob", 1)) m = m.times(2)
		if (hasMilestone("cmp", 3)) m = m.times(2)
		if (hasMilestone("cert", 2)) m = m.times(2)
		if (hasAchievement("hist", 15)) m = m.times(2)
		// int 商店 K4：免疫记忆（命名机制）
		if (hasUpgrade("int", 31)) m = m.pow(1.1)
		// 复利引擎（次临界 0.12）：接种者基数反哺免疫公民（群体效应）
		if (player.var.unlocked) {
			let fb = player.var.points.add(1).pow(0.12)
			m = m.times(softcap(fb, new Decimal("1e8"), 0.5))
		}
		// 反弹压强 >70%：接种行动迟滞
		if (player.sur.unlocked && player.sur.pressure.gt(T("PRESSURE_HIGH")))
			m = m.times(0.5)
		// 挑战 handicap
		if (inChallenge("vac", 12)) m = m.div(2)
		return m
	},
	gainExp() { return new Decimal(1) },
	layerShown() { return player.var.best.gte(T("UNLOCK_VAC")) || player.vac.unlocked },
	hotkeys: [
		{ key: "b", description() { return zh("B: Vaccinate with cowpox", "B：开展牛痘接种行动") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	// cmp m8 打包（resetsNothing + autoUpgrade + passiveGen）：终局全自动
	// 挑战内被动增长：引擎里 prestige 本层会带上一帧缓存判定立刻退出挑战（game.js doReset→completeChallenge），
	// 免疫公民/覆盖率只能靠层内自己爬（挑战修复 2026-10-25，速率 T("CHALLENGE_PASSIVE_GEN")）
	passiveGeneration() {
		if (hasMilestone("int", 3) || hasMilestone("cmp", 8)) return 1
		if (inChallenge("vac", 11) || inChallenge("vac", 12)) return T("CHALLENGE_PASSIVE_GEN")
		return 0
	},
	resetsNothing() { return hasMilestone("cmp", 8) },
	autoUpgrade() { return hasMilestone("cmp", 8) },
	doReset(resettingLayer) {
		if (!(layers[resettingLayer].row > this.row)) return
		let keep = ["unlocked", "auto", "milestones", "best", "total"]
		if (hasMilestone("cmp", 8)) keep.push("upgrades")
		layerDataReset(this.layer, keep)
	},
	softcap() { return new Decimal("1e9") },
	softcapPower() { return new Decimal(0.1) },
	tabFormat: [
		["display-text", function() {
			return zh(
				`You have <h2 style="color:#7ab8f5;text-shadow:0px 0px 10px #7ab8f5">${formatWhole(player.vac.points)}</h2> ${zh("immune citizens", "免疫公民")}`,
				`你有 <h2 style="color:#7ab8f5;text-shadow:0px 0px 10px #7ab8f5">${formatWhole(player.vac.points)}</h2> 免疫公民`)
		}],
		"prestige-button",
		["display-text", function() {
			return zh(
				`Base: ${formatWhole(player.var.points)} variolated. Best: ${formatWhole(player.vac.best)}`,
				`基底：${formatWhole(player.var.points)} 接种者。最高纪录：${formatWhole(player.vac.best)}`)
		}],
		["display-text", function() {
			let c = covPct()
			if (c.gte(90)) return `<span style="opacity:.7">${zh("Coverage is approaching the hard cap of 100%.", "覆盖率正逼近 100% 硬上限。")}</span>`
		}],
		["microtabs", "stuff"],
		["blank", "15px"],
	],
	microtabs: {
		stuff: {
			"Upgrades": {
				name() { return zh("Upgrades", "免疫之学") },
				unlocked() { return true },
				content: [
					["raw-html", function() { return `<div style="opacity:.5">${zh("1796: a milkmaid's scars become a science.", "1796 年：挤奶女工的疤痕成为一门科学。")}</div>` }],
					"blank", "upgrades",
				],
			},
			"Coverage": {
				name() { return zh("Coverage", "覆盖率") },
				unlocked() { return true },
				content: [
					["bar", "covBar"],
					["display-text", function() {
						return zh(
							`Population coverage: <b style="color:#7ab8f5">${format(covPct(), 1)}%</b> / 100%<br>Slope upgrades and milestones raise how fast coverage climbs.`,
							`人群覆盖率：<b style="color:#7ab8f5">${format(covPct(), 1)}%</b> / 100%<br>斜率升级与里程碑让覆盖率爬升更快。`)
					}],
					"blank", "buyables",
				],
			},
			"Milestones": {
				name() { return zh("Milestones", "里程碑") },
				unlocked() { return true },
				content: ["blank", "milestones"],
			},
			"Challenges": {
				name() { return zh("Challenges", "试炼") },
				unlocked() { return hasMilestone("vac", 2) },
				content: ["blank", "challenges"],
			},
		},
	},
	bars: {
		covBar: {
			direction: RIGHT,
			width: 320, height: 34,
			progress() { return covPct().div(T("COVERAGE_CAP")).min(1).toNumber() },
			display() { return format(covPct(), 1) + "% / 100%" },
			fillStyle: { 'background-color': "#7ab8f5" },
			baseStyle: { 'background-color': "#22303c" },
			unlocked() { return player.vac.unlocked },
		},
	},
	upgrades: {
		21: { title() { return zh("The Jenner Moment", "詹纳时刻") },
			description() { return zh("1796-05-14: James Phipps, and the world changes. Variolated gain ×2.", "1796年5月14日：詹姆斯·菲普斯，世界从此不同。接种者获取 ×2。") },
			cost: new Decimal(1) },
		22: { title() { return zh("Vaccine Urbanization", "疫苗城市化") },
			description() { return zh("Immune citizens gain boosted by vaccine doses.", "免疫公民获取随疫苗剂量增长。") },
			cost: new Decimal(5),
			effect() { return player.pro.points.add(1).pow(0.2) },
			effectDisplay() { return format(this.effect()) + "x" } },
		23: { title() { return zh("Arm-to-Arm", "臂至臂接种") },
			description() { return zh("Lymph travels person to person. Immune citizens boosted by total variolated.", "疫苗浆人传人。免疫公民随累计接种者增长。") },
			cost: new Decimal(50),
			effect() { return player.var.total.max(1).pow(0.3) },
			effectDisplay() { return format(this.effect()) + "x" } },
		24: { title() { return zh("Immunity Ledger", "免疫档案") },
			description() { return zh("Variolated gain boosted by your best variolated.", "接种者获取随接种者最高纪录增长。") },
			cost: new Decimal(500),
			effect() { return player.var.best.max(1).pow(0.3) },
			effectDisplay() { return format(this.effect()) + "x" } },
		25: { title() { return zh("Royal Touch of Science", "科学之触") },
			description() { return zh("Immune citizens boosted by best variolated (log²).", "免疫公民随接种者纪录增长（对数平方）。") },
			cost: new Decimal(5e3),
			effect() { return player.var.best.max(1).log(10).add(1).pow(2) },
			effectDisplay() { return format(this.effect()) + "x" } },
		31: { title() { return zh("Balmis Expedition", "巴尔米斯远征") },
			description() { return zh("1803: vaccine crosses the oceans. Immune citizens boosted by best doses.", "1803 年：疫苗跨越大洋。免疫公民随剂量纪录增长。") },
			cost: new Decimal(5e4),
			effect() { return player.pro.best.max(1).pow(0.2) },
			effectDisplay() { return format(this.effect()) + "x" } },
		32: { title() { return zh("Cowpox to China", "牛痘入华") },
			description() { return zh("1805: 邱熺 《引痘略》. Variolated gain ×2.", "1805 年，邱熺著《引痘略》。接种者获取 ×2。") },
			cost: new Decimal(5e5) },
		33: { title() { return zh("Vaccination Acts", "接种法案") },
			description() { return zh("Law makes immunity a civic duty. Immune citizens boosted by total immune citizens (log).", "法律使免疫成为公民义务。免疫公民随累计免疫公民增长（对数）。") },
			cost: new Decimal(5e6),
			effect() { return player.vac.total.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x" } },
		34: { title() { return zh("Calf Lymph", "小牛淋巴") },
			description() { return zh("Immune citizens boosted by doses (log).", "免疫公民随剂量增长（对数）。") },
			cost: new Decimal(5e7),
			effect() { return player.pro.points.add(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x" } },
		35: { title() { return zh("Coverage Registry I", "覆盖登记 I") },
			description() { return zh("Coverage climbs 25% faster. (Cap stays 100%.)", "覆盖率爬升加快 25%。（上限仍为 100%）") },
			cost: new Decimal(5e8) },
		41: { title() { return zh("Coverage Registry II", "覆盖登记 II") },
			description() { return zh("Coverage climbs another 25% faster.", "覆盖率爬升再加快 25%。") },
			cost: new Decimal(5e9) },
		42: { title() { return zh("Glycerinated Lymph", "甘油灭活苗") },
			description() { return zh("1880s: vaccine keeps. Immune citizens boosted by best variolated (log²).", "1880 年代：疫苗得以保存。免疫公民随接种者纪录增长（对数平方）。") },
			cost: new Decimal(5e10),
			effect() { return player.var.best.max(1).log(2).add(1).pow(2) },
			effectDisplay() { return format(this.effect()) + "x" } },
		43: { title() { return zh("Herd Memory", "群体记忆") },
			description() { return zh("Immune citizens gain boosted by immune citizens.", "免疫公民获取随免疫公民增长。") },
			cost: new Decimal(5e11),
			effect() { return softcap(player.vac.points.add(1).pow(0.4), new Decimal(1000), 0.3) },
			effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
		44: { title() { return zh("Mutual Recognition", "证书互认") },
			description() { return zh("Variolated gain ×2.", "接种者获取 ×2。") },
			cost: new Decimal(5e12) },
		45: { title() { return zh("Archive: The Jenner Era", "档案：詹纳时代") },
			description() { return zh("Unlocks an archive chapter.", "解锁历史档案的一章。") },
			cost: new Decimal(5e13) },
	},
	buyables: {
		11: { title() { return zh("Immunity Passbook", "免疫证书") },
			cost(x) { return new Decimal(25).times(Decimal.pow(2.2, x)) },
			effect(x) { return Decimal.pow(1.4, x) },
			display() {
				return zh(
					`Level: ${formatWhole(getBuyableAmount(this.layer, this.id))}<br>Effect: coverage slope ×${format(this.effect(getBuyableAmount(this.layer, this.id)))}<br>Cost: ${format(this.cost(getBuyableAmount(this.layer, this.id)))} immune citizens`,
					`等级：${formatWhole(getBuyableAmount(this.layer, this.id))}<br>效果：覆盖率斜率 ×${format(this.effect(getBuyableAmount(this.layer, this.id)))}<br>费用：${format(this.cost(getBuyableAmount(this.layer, this.id)))} 免疫公民`)
			},
			canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player[this.layer].points = player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
			},
		},
	},
	milestones: {
		0: { requirementDescription() { return zh("500 immune citizens", "500 免疫公民") },
			done() { return player[this.layer].best.gte(T("VAC_MS")[0]) },
			effectDescription() { return zh("Variolated upgrades survive resets", "接种典籍在重置中保留") } },
		1: { requirementDescription() { return zh("1,000 immune citizens", "1,000 免疫公民") },
			unlocked() { return hasMilestone(this.layer, 0) },
			done() { return player[this.layer].best.gte(T("VAC_MS")[1]) },
			effectDescription() { return zh("Variolated survive resets", "接种者在重置中保留") } },
		2: { requirementDescription() { return zh("2,000 immune citizens", "2,000 免疫公民") },
			unlocked() { return hasMilestone(this.layer, 1) },
			done() { return player[this.layer].best.gte(T("VAC_MS")[2]) },
			effectDescription() { return zh("Automatically variolate (passive generation)", "自动接种（被动生成）") } },
		3: { requirementDescription() { return zh("10,000 immune citizens", "10,000 免疫公民") },
			unlocked() { return hasMilestone(this.layer, 2) },
			done() { return player[this.layer].best.gte(T("VAC_MS")[3]) },
			effectDescription() { return zh("Coverage slope ×1.15", "覆盖率斜率 ×1.15") } },
		4: { requirementDescription() { return zh("50,000 immune citizens", "50,000 免疫公民") },
			unlocked() { return hasMilestone(this.layer, 3) },
			done() { return player[this.layer].best.gte(T("VAC_MS")[4]) },
			effectDescription() { return zh("Immune citizens ×2", "免疫公民 ×2") } },
		5: { requirementDescription() { return zh("250,000 immune citizens", "250,000 免疫公民") },
			unlocked() { return hasMilestone(this.layer, 4) },
			done() { return player[this.layer].best.gte(T("VAC_MS")[5]) },
			effectDescription() { return zh("Unlocks an archive chapter", "解锁历史档案的一章") } },
	},
	challenges: {
		11: { name() { return zh("Cold Chain Broken", "冷链中断") },
			challengeDescription() { return zh("Vaccine doses melt away (production ÷10). Reach 50% coverage anyway.<br><i>Coverage keeps climbing on its own — click this challenge to claim it. Prestiging here aborts the run!</i>", "疫苗剂量大量失效（产出 ÷10）。在此状态下达到 50% 覆盖率。<br><i>覆盖率会自行爬升——达标后点击本挑战领取。在此时退回（prestige）会直接中止挑战！</i>") },
			onEnter() { player.vac.points = new Decimal(0) },
			canComplete() { return covPct().gte(50) },
			rewardDescription() { return zh("Cold-chain nodes cost 10% less", "冷链节点费用 −10%") },
			unlocked() { return hasMilestone("vac", 2) } },
		12: { name() { return zh("Crisis of Trust", "信任危机") },
			challengeDescription() { return zh("Rumors halve vaccination (immune citizens ÷2). Prove them wrong.<br><i>Citizens keep coming in on their own — click this challenge to claim it. Prestiging here aborts the run!</i>", "谣言使接种减半（免疫公民 ÷2）。用事实回击。<br><i>免疫公民会自行增长——达标后点击本挑战领取。在此时退回（prestige）会直接中止挑战！</i>") },
			onEnter() { player.vac.points = new Decimal(0) },
			canComplete() { return player.vac.points.gte(1e4) },
			rewardDescription() { return zh("Immune citizens ×1.25, forever", "免疫公民永久 ×1.25") },
			unlocked() { return hasMilestone("vac", 4) } },
	},
})
