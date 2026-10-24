// ============================================================================
// sur — 监测围堵（row 2 静态支柱 1）——反弹压强机制之家（Q4b 用户定义）
// 每次声望 = 一次围堵行动：压强归零、峰值入账；压强随时间回升（不管控就得病率上升）。
// 状态：pressure（0–100 硬上限）/ peak（历史最高发病率）/ zeroTime（零病例累计）/ bounty（副货币）。
// ============================================================================
addLayer("sur", {
	name() { return zh("Surveillance & Containment", "监测围堵") },
	symbol() { return window.chinesemode ? "围堵" : "SU" },
	position: 0,
	row: 2,
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
		pressure: new Decimal(0),
		peak: new Decimal(0),
		zeroTime: new Decimal(0),
		bounty: new Decimal(0),
	} },
	color: "#f0a05a",
	resource() { return zh("containment ops", "围堵行动") },
	baseResource: function() { return zh("variolated", "接种者") },
	baseAmount() { return player.var.points },
	requires: new Decimal(1e5),
	type: "static",
	exponent: 1,
	base: 2,
	roundUpCost: true,
	branches: ["var", "vac"],
	gainMult() {
		let m = new Decimal(1)   // static：更小 = 更便宜
		if (hasMilestone("sur", 5)) m = m.times(0.5)
		if (hasChallenge("sur", 11)) m = m.times(0.5)
		if (hasUpgrade("sur", 11)) m = m.times(0.9)
		if (hasUpgrade("sur", 15)) m = m.times(0.85)
		if (hasUpgrade("sur", 24)) m = m.div(upgradeEffect("sur", 24))
		if (hasUpgrade("sur", 42)) m = m.div(upgradeEffect("sur", 42))
		if (hasUpgrade("sur", 43)) m = m.div(upgradeEffect("sur", 43))
		if (hasUpgrade("sur", 32)) m = m.div(upgradeEffect("sur", 32))   // 以史为鉴：峰值越高围堵越便宜
		if (hasUpgrade("cc", 22)) m = m.times(0.9)
		if (hasUpgrade("mob", 15)) m = m.times(0.9)
		if (hasAchievement("hist", 41)) m = m.times(0.9)
		return m
	},
	gainExp() { return new Decimal(1) },
	layerShown() { return player.var.best.gte(T("UNLOCK_SUR")) || player.sur.unlocked },
	hotkeys: [
		{ key: "s", description() { return zh("S: Launch a containment operation", "S：发起一次围堵行动") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	// cmp m4 支柱打包（静态层自动化 = resetsNothing + autoPrestige，作者 #26）
	resetsNothing() { return hasMilestone("cmp", 4) },
	autoPrestige() { return hasMilestone("cmp", 4) },
	autoUpgrade() { return hasMilestone("cmp", 4) },
	canBuyMax() { return hasUpgrade("sur", 44) },
	onPrestige(gain) {
		player.sur.pressure = new Decimal(0)
	},
	// 反弹压强主循环（F28：先查 unlocked）
	update(diff) {
		if (!player[this.layer].unlocked) return
		// 引擎 gameLoop 传入的 diff 是数值（game.js 更新循环），不是 Decimal——
		// 浏览器实测抛 "diff.times is not a function"（Stage 6.5）；归一化为新局部量
		const dt = new Decimal(diff)
		// 压强上升（不管控，得病率就又上升了）
		player.sur.pressure = player.sur.pressure.add(pressureRate().times(dt)).clampMax(T("PRESSURE_CAP"))
		player.sur.peak = player.sur.peak.max(player.sur.pressure)
		// 零病例计时
		if (player.sur.pressure.lte(T("ZERO_TIME_PRESSURE_LIMIT"))) player.sur.zeroTime = player.sur.zeroTime.add(dt.times(hasUpgrade("sur", 41) ? 2 : 1))
		// 监测奖励金（M5 副货币：产出 = 0.1 × 围堵行动数 × 加成）
		let rate = new Decimal(T("BOUNTY_RATE")).times(player.sur.points)
		if (hasUpgrade("sur", 12)) rate = rate.times(1.5)
		if (hasUpgrade("sur", 13)) rate = rate.times(upgradeEffect("sur", 13))
		if (hasUpgrade("sur", 14)) rate = rate.times(upgradeEffect("sur", 14))
		if (hasUpgrade("sur", 22)) rate = rate.times(upgradeEffect("sur", 22))
		if (hasUpgrade("sur", 34)) rate = rate.times(upgradeEffect("sur", 34))
		if (hasUpgrade("sur", 44)) rate = rate.times(upgradeEffect("sur", 44))
		if (hasUpgrade("int", 33)) rate = rate.times(2)
		if (hasMilestone("sur", 4)) rate = rate.times(2)
		if (hasChallenge("sur", 12)) rate = rate.times(2)
		if (hasAchievement("hist", 29)) rate = rate.times(2)
		player.sur.bounty = player.sur.bounty.add(rate.times(dt))
	},
	doReset(resettingLayer) {
		if (!(layers[resettingLayer].row > this.row)) return
		let keep = ["unlocked", "auto", "milestones", "best", "total", "points", "peak", "zeroTime"]
		if (hasMilestone("cmp", 4) || hasMilestone("cmp", 8)) keep.push("upgrades")
		layerDataReset(this.layer, keep)
	},
	tabFormat: [
		["display-text", function() {
			return zh(
				`You have <h2 style="color:#f0a05a;text-shadow:0px 0px 10px #f0a05a">${formatWhole(player.sur.points)}</h2> ${zh("containment ops", "围堵行动")}`,
				`你已开展 <h2 style="color:#f0a05a;text-shadow:0px 0px 10px #f0a05a">${formatWhole(player.sur.points)}</h2> 次围堵行动`)
		}],
		"prestige-button",
		["display-text", function() {
			return zh(
				`Cases out there: ${formatWhole(player.points)}.<br>Peak incidence ever seen: ${format(player.sur.peak, 1)}% — every peak teaches the net.`,
				`外面的病例：${formatWhole(player.points)}。<br>历史最高发病率：${format(player.sur.peak, 1)}% —— 每一次峰值都会教会这张网。`)
		}],
		["microtabs", "stuff"],
		["blank", "15px"],
	],
	microtabs: {
		stuff: {
			"Pressure": {
				name() { return zh("Rebound", "反弹压强") },
				unlocked() { return true },
				content: [
					["bar", "pressureBar"],
					["display-text", function() {
						let p = player.sur.pressure
						let lines = zh(
							`Rebound pressure: <b style="color:#f0a05a">${format(p, 1)}%</b> / 100%<br>` +
							`Peak ever: ${format(player.sur.peak, 1)}%<br>` +
							`Zero-case time: ${formatTime(player.sur.zeroTime.toNumber())}<br>` +
							(p.gt(T("PRESSURE_HIGH"))
								? `<b style="color:#ff6b6b">Outbreak! Incidence is climbing fast, and vaccination has stalled.</b>`
								: (p.gt(T("PRESSURE_LOW"))
									? `<b style="color:#ffb347">Uncontrolled: incidence is rising again.</b>`
									: `<span style="color:#9fd8a0">Contained. For now.</span>`)),
							`反弹压强：<b style="color:#f0a05a">${format(p, 1)}%</b> / 100%<br>` +
							`历史峰值：${format(player.sur.peak, 1)}%<br>` +
							`零病例累计：${formatTime(player.sur.zeroTime.toNumber())}<br>` +
							(p.gt(T("PRESSURE_HIGH"))
								? `<b style="color:#ff6b6b">疫情爆发！得病率快速上升，接种行动陷入迟滞。</b>`
								: (p.gt(T("PRESSURE_LOW"))
									? `<b style="color:#ffb347">无人管控：得病率又上升了。</b>`
									: `<span style="color:#9fd8a0">已控制。暂时。</span>`)))
						return lines
					}],
					["display-text", function() {
						return zh(
							`A containment operation (prestige here) resets pressure to 0. The sweep that follows a big peak is cheaper.`,
							`一次围堵行动（在此声望）会把压强归零。大峰值之后的围堵更便宜。`)
					}],
					"blank", "buyables",
				],
			},
			"Upgrades": {
				name() { return zh("Upgrades", "围堵之术") },
				unlocked() { return true },
				content: ["blank", "upgrades"],
			},
			"Milestones": {
				name() { return zh("Milestones", "里程碑") },
				unlocked() { return true },
				content: ["blank", "milestones"],
			},
			"Challenges": {
				name() { return zh("Challenges", "试炼") },
				unlocked() { return hasMilestone("sur", 1) },
				content: ["blank", "challenges"],
			},
		},
	},
	bars: {
		pressureBar: {
			direction: RIGHT,
			width: 320, height: 34,
			progress() { return player.sur.pressure.div(T("PRESSURE_CAP")).min(1).toNumber() },
			display() { return format(player.sur.pressure, 1) + "% / 100%" },
			fillStyle() { return { 'background-color': player.sur.pressure.gt(T("PRESSURE_HIGH")) ? "#ff6b6b" : (player.sur.pressure.gt(T("PRESSURE_LOW")) ? "#ffb347" : "#9fd8a0") } },
			baseStyle: { 'background-color': "#2b2118" },
			unlocked() { return player.sur.unlocked },
		},
	},
	upgrades: {
		11: { title() { return zh("Rapid Response Teams", "快响小队") },
			description() { return zh("Containment operations cost 10% less.", "围堵行动费用 −10%。") },
			cost: new Decimal(1) },
		12: { title() { return zh("Ring Vaccination", "环状接种") },
			description() { return zh("Bounty income ×1.5.", "奖励金产出 ×1.5。") },
			cost: new Decimal(1) },
		13: { title() { return zh("Reward Posters", "悬赏告示") },
			description() { return zh("Bounty income boosted by peak incidence.", "奖励金产出随历史峰值增长。") },
			cost: new Decimal(2),
			effect() { return player.sur.peak.max(1).pow(0.15) },
			effectDisplay() { return format(this.effect()) + "x" } },
		14: { title() { return zh("Market Watchers", "市集监测") },
			description() { return zh("Bounty income boosted by peak incidence (log).", "奖励金产出随历史峰值增长（对数）。") },
			cost: new Decimal(2),
			effect() { return player.sur.peak.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x" } },
		15: { title() { return zh("Case Cards", "记录卡片") },
			description() { return zh("Operations cost 15% less.", "围堵行动费用 −15%。") },
			cost: new Decimal(3) },
		21: { title() { return zh("Zero-Case Patrols", "零病例巡检") },
			description() { return zh("Bounty income ×1.5.", "奖励金产出 ×1.5。") },
			cost: new Decimal(3) },
		22: { title() { return zh("Village Reporters", "民间报告员") },
			description() { return zh("Bounty income boosted by operations.", "奖励金产出随围堵行动数增长。") },
			cost: new Decimal(5),
			effect() { return player.sur.points.max(1).pow(0.25) },
			effectDisplay() { return format(this.effect()) + "x" } },
		23: { title() { return zh("Pressure Valve I", "压强阀门 I") },
			description() { return zh("Rebound pressure grows 2× slower.", "反弹压强增速减半。") },
			cost: new Decimal(5) },
		24: { title() { return zh("Surveillance Map", "监测地图") },
			description() { return zh("Operations cost less, scaled by total operations (log).", "围堵行动费用随累计行动数降低（对数）。") },
			cost: new Decimal(8),
			effect() { return player.sur.total.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x cheaper" } },
		25: { title() { return zh("Stress Test", "压力测试") },
			description() { return zh("Unlocks the outbreak challenge.", "解锁爆发试炼。") },
			cost: new Decimal(8) },
		31: { title() { return zh("Weekly Epidemiological Record", "国际疫情周报") },
			description() { return zh("Cold-chain nodes cost 10% less.", "冷链节点费用 −10%。") },
			cost: new Decimal(12) },
		32: { title() { return zh("Learn from Peaks", "以史为鉴") },
			description() { return zh("Operations cost less, scaled by your peak incidence.", "围堵行动费用随历史峰值降低。") },
			cost: new Decimal(12),
			effect() { return player.sur.peak.max(1).div(T("PRESSURE_UPG_DIVISOR")).add(1).pow(0.5) },
			effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x cheaper" } },
		33: { title() { return zh("Team Mobilization Notes", "动员协作纪要") },
			description() { return zh("Vaccinator teams cost 10% less.", "接种队费用 −10%。") },
			cost: new Decimal(18) },
		34: { title() { return zh("Radio Network", "无线电网络") },
			description() { return zh("Bounty income boosted by best doses (log).", "奖励金产出随剂量纪录增长（对数）。") },
			cost: new Decimal(18),
			effect() { return player.pro.best.max(1).log(10).add(1) },
			effectDisplay() { return format(this.effect()) + "x" } },
		35: { title() { return zh("Archive: Nigeria 1967", "档案：尼日利亚 1967") },
			description() { return zh("Unlocks an archive chapter.", "解锁历史档案的一章。") },
			cost: new Decimal(25) },
		41: { title() { return zh("Double Watch", "双重巡检") },
			description() { return zh("Zero-case time accumulates 2× faster.", "零病例计时累积 ×2。") },
			cost: new Decimal(25) },
		42: { title() { return zh("Search & Contain", "搜索围堵") },
			description() { return zh("Operations cost less, scaled by total operations (log²).", "围堵行动费用随累计行动数降低（对数平方）。") },
			cost: new Decimal(35),
			effect() { return player.sur.total.max(1).log(10).add(1).pow(2) },
			effectDisplay() { return format(this.effect()) + "x cheaper" } },
		43: { title() { return zh("House-to-House Maps", "入户地图") },
			description() { return zh("Operations cost less, scaled by best operations.", "围堵行动费用随行动纪录降低。") },
			cost: new Decimal(35),
			effect() { return player.sur.best.max(1).pow(0.2) },
			effectDisplay() { return format(this.effect()) + "x cheaper" } },
		44: { title() { return zh("Mature Network", "成熟监测网") },
			description() { return zh("Bounty boosted by total operations (log²); unlocks buy-max.", "奖励金随累计行动数增长（对数平方）；解锁批量购买。") },
			cost: new Decimal(50),
			effect() { return player.sur.total.max(1).log(10).add(1).pow(2) },
			effectDisplay() { return format(this.effect()) + "x" } },
		45: { title() { return zh("Archive: The Last Case", "档案：最后一例") },
			description() { return zh("Unlocks an archive chapter.", "解锁历史档案的一章。") },
			cost: new Decimal(60) },
	},
	buyables: {
		11: { title() { return zh("Epi Aid Fund", "流调专项") },
			cost(x) { return new Decimal(T("PRESSURE_SUPPRESS_BASE")).times(Decimal.pow(T("PRESSURE_SUPPRESS_GROWTH"), x)) },
			effect(x) { return Decimal.pow(T("PRESSURE_SUPPRESS_STEP"), x) },
			display() {
				return zh(
					`Level: ${formatWhole(getBuyableAmount(this.layer, this.id))}<br>Effect: rebound pressure grows ÷${format(this.effect(getBuyableAmount(this.layer, this.id)))}<br>Cost: ${format(this.cost(getBuyableAmount(this.layer, this.id)))} bounty`,
					`等级：${formatWhole(getBuyableAmount(this.layer, this.id))}<br>效果：反弹压强增速 ÷${format(this.effect(getBuyableAmount(this.layer, this.id)))}<br>费用：${format(this.cost(getBuyableAmount(this.layer, this.id)))} 奖励金`)
			},
			canAfford() { return player[this.layer].bounty.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player[this.layer].bounty = player[this.layer].bounty.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
			},
			currencyDisplayName() { return zh("bounty", "监测奖励金") },
			currencyInternalName: "bounty",
			currencyLayer: "sur",
		},
	},
	milestones: {
		0: { requirementDescription() { return zh("5 operations", "5 次围堵行动") },
			done() { return player[this.layer].best.gte(T("SUR_MS")[0]) },
			effectDescription() { return zh("Rebound pressure grows 2× slower", "反弹压强增速减半") } },
		1: { requirementDescription() { return zh("15 operations", "15 次围堵行动") },
			unlocked() { return hasMilestone(this.layer, 0) },
			done() { return player[this.layer].best.gte(T("SUR_MS")[1]) },
			effectDescription() { return zh("Variolated ×2; unlock challenges", "接种者 ×2；解锁试炼") } },
		2: { requirementDescription() { return zh("40 operations", "40 次围堵行动") },
			unlocked() { return hasMilestone(this.layer, 1) },
			done() { return player[this.layer].best.gte(T("SUR_MS")[2]) },
			effectDescription() { return zh("Immune citizens ×2", "免疫公民 ×2") } },
		3: { requirementDescription() { return zh("100 operations", "100 次围堵行动") },
			unlocked() { return hasMilestone(this.layer, 2) },
			done() { return player[this.layer].best.gte(T("SUR_MS")[3]) },
			effectDescription() { return zh("Rebound pressure grows 2× slower", "反弹压强再减速") } },
		4: { requirementDescription() { return zh("250 operations", "250 次围堵行动") },
			unlocked() { return hasMilestone(this.layer, 3) },
			done() { return player[this.layer].best.gte(T("SUR_MS")[4]) },
			effectDescription() { return zh("Bounty ×2", "奖励金 ×2") } },
		5: { requirementDescription() { return zh("600 operations", "600 次围堵行动") },
			unlocked() { return hasMilestone(this.layer, 4) },
			done() { return player[this.layer].best.gte(T("SUR_MS")[5]) },
			effectDescription() { return zh("Operations cost half", "围堵行动费用减半") } },
	},
	challenges: {
		11: { name() { return zh("District Lockdown", "疫区封锁") },
			challengeDescription() { return zh("Case gain is square-rooted. Reach 100,000 variolated anyway.", "病例获取被开方。在此状态下达到 100,000 接种者。") },
			canComplete() { return player.var.points.gte(1e5) },
			rewardDescription() { return zh("Containment operations cost half", "围堵行动费用减半") },
			unlocked() { return hasMilestone("sur", 1) } },
		12: { name() { return zh("The Missing Reports", "漏报之祸") },
			challengeDescription() { return zh("Passive variolation stops. Reach 40 operations anyway.", "被动接种停止。在此状态下达到 40 次围堵行动。") },
			onEnter() { player.sur.points = new Decimal(0); player.sur.bounty = new Decimal(0) },
			canComplete() { return player.sur.points.gte(40) },
			rewardDescription() { return zh("Variolated ×1.5; bounty ×2", "接种者 ×1.5；奖励金 ×2") },
			unlocked() { return hasMilestone("sur", 2) } },
		13: { name() { return zh("Mega-Outbreak", "超规模爆发") },
			challengeDescription() { return zh("Rebound pressure grows 10× faster. Complete a sweep at ≥90% pressure.", "反弹压强增速 ×10。在压强 ≥90% 时完成一次围堵。") },
			onEnter() { player.sur.pressure = new Decimal(0) },
			canComplete() { return player.sur.pressure.gte(90) },
			rewardDescription() { return zh("Rebound pressure grows 2× slower, forever", "反弹压强增速永久减半") },
			unlocked() { return hasUpgrade("sur", 25) } },
	},
})
