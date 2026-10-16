/* =========================================================================
 *  岁 / sui  —  row 8, the year itself (冬至一阳生).
 *  岁祭 (M7) is the ritual: one completed year, paid in 岁礼, re-rooted at 1e30 so the
 *  wheel never detonates. 八节试 (M2) are the eight score-attack trials — one per 节,
 *  completionLimit 3, so 8 x 3 = 24 completions = the 24 solar terms. Entering a trial
 *  wipes the whole spine (doReset("sui", true) fires rowReset(8..0)) and divides all 候
 *  output by 1000; the reward is scored on the PEAK 岁礼 you reached inside the trial,
 *  recorded per trial in player.sui.maxpoints and kept across entries — so every later
 *  entry, with more power behind it, buys a bigger permanent multiplier.
 * ========================================================================= */

function suiReq() { return new Decimal(TUNING.SUI_REQUIRES) }
function suiBase() { return player.dz.points }
function suiTrialMult() { return anyTrial() ? new Decimal(1).div(TUNING.SUI_TRIAL_DIV) : new Decimal(1) }
function suiTrial() {
	let ac = player.sui.activeChallenge
	if (ac === null || ac === undefined) return -1
	let i = ac - 11
	if (i < 0 || i >= TUNING.CHALLENGE_COUNT) return -1
	return i
}
function suiGainMult() {
	let ret = new Decimal(1)
	// 八节试 (M2): every completed trial pays out on its own recorded peak.
	for (let i = 0; i < TUNING.CHALLENGE_COUNT; i++) {
		if (challengeCompletions("sui", 11 + i) >= 1) ret = ret.times(challengeEffect("sui", 11 + i))
	}
	if (hasUpgrade("sui", 11)) ret = ret.times(upgradeEffect("sui", 11))
	if (hasUpgrade("sui", 12)) ret = ret.times(upgradeEffect("sui", 12))
	if (hasUpgrade("sui", 13)) ret = ret.times(upgradeEffect("sui", 13))
	if (hasUpgrade("sui", 14)) ret = ret.times(upgradeEffect("sui", 14))
	if (hasUpgrade("sui", 21)) ret = ret.times(upgradeEffect("sui", 21))
	if (hasUpgrade("sui", 23)) ret = ret.times(upgradeEffect("sui", 23))
	if (hasUpgrade("sui", 24)) ret = ret.times(upgradeEffect("sui", 24))
	if (hasMilestone("sui", 1)) ret = ret.times(3)
	if (hasMilestone("sui", 2)) ret = ret.times(5)
	if (getBuyableAmount("sui", 11).gt(0)) ret = ret.times(buyableEffect("sui", 11))
	return ret
}
function suiGain() {
	let req = suiReq()
	let base = suiBase()
	if (base.lt(req)) return new Decimal(0)
	let g = base.div(req).pow(TUNING.SUI_EXPONENT).times(suiGainMult())
	g = g.times(suiTrialMult())
	if (g.gte(TUNING.SUI_SOFTCAP)) g = g.div(TUNING.SUI_SOFTCAP).pow(TUNING.SOFTCAP_POWER).times(TUNING.SUI_SOFTCAP)
	return g.floor().max(0)
}
function suiNextAt() {
	let mult = suiGainMult().times(suiTrialMult())
	if (mult.lte(0)) return new Decimal(Infinity)
	let next = suiGain().add(1).div(mult)
	next = next.root(TUNING.SUI_EXPONENT).times(suiReq()).max(suiReq())
	return next
}
function suiPeakOf(i) {
	if (i < 0 || i >= TUNING.CHALLENGE_COUNT) return new Decimal(0)
	return player.sui.maxpoints[i]
}

addLayer("sui", {
	name: function() { return L("岁", "The Year") },
	symbol: function() { return L("岁", "SUI") },
	position: 0,
	row: 8,
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
		maxpoints: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
		trialsRun: 0,
	}},
	color: "#FF6F91",
	resource: function() { return L("岁礼", "岁礼") },
	baseResource: function() { return L("冬至候", "Dongzhi Hou") },
	baseAmount() { return suiBase() },
	requires: new Decimal(1.52587890625e12),
	type: "custom",
	getResetGain() { return suiGain() },
	getNextAt() { return suiNextAt() },
	canReset() { return suiBase().gte(suiReq()) },
	gainMult() { return suiGainMult() },
	gainExp() { return new Decimal(1) },
	layerShown() { return player.sui.unlocked || player.dz.best.gte(3.0517578125e10) },
	prestigeButtonText() {
		if (player.sui.inChallenge !== undefined && player.sui.inChallenge >= 0)
			return L("试中不可岁祭 —— 先尽此试", "No ritual inside a trial — finish it first")
		return L("岁祭得 <b>" + formatWhole(tmp.sui.resetGain) + "</b> 岁礼（一岁一轮，岁复一岁）", "Hold the ritual for <b>" + formatWhole(tmp.sui.resetGain) + "</b> 岁礼 (a year at a time)")
	},
	doReset(resettingLayer) {
		// A trial entry calls doReset("sui", true), which walks rowReset(8…0) and
		// therefore wipes every 节 beneath (that is the handicap). sui is the top row,
		// so no layer is ever strictly deeper than it: this hook never fires for the
		// layer itself, and 岁祭 keeps its bank — 岁礼 accumulates, one year on another.
		if (layers[resettingLayer].row > this.row) {
			layerDataReset("sui", ["unlocked", "best", "total", "upgrades", "milestones", "maxpoints", "trialsRun"])
		}
	},
	update(diff) {
		// M2: the peak of a running trial is the score. It is kept across entries,
		// so a later entry with more power behind it always beats the old record.
		let i = suiTrial()
		if (i >= 0) {
			player.sui.maxpoints[i] = player.sui.maxpoints[i].max(player.sui.points)
			if (player.sui.trialsRun < 0) player.sui.trialsRun = 0
		}
	},

	upgrades: {
		11: {
			title: function() { return L("一阳生", "The First Yang") },
			description: function() { return L("冬至一阳生：岁礼 ×2。", "At the solstice the first yang is born: 岁礼 ×2.") },
			cost: new Decimal(TUNING.SUI_UPG_COSTS[11]),
			effect() { return new Decimal(2) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		12: {
			title: function() { return L("岁差", "Precession") },
			description: function() { return L("岁礼自养：岁礼产 ×√(岁礼+1)，软上限 10 倍。", "The year feeds itself: 岁礼 output x sqrt(岁礼+1), softcapped at x10.") },
			cost: new Decimal(TUNING.SUI_UPG_COSTS[12]),
			effect() {
				let v = player.sui.points.add(1).pow(0.3)
				if (v.gt(10)) v = v.div(10).pow(0.4).times(10)
				return v
			},
			effectDisplay() { return "×" + format(this.effect()) },
		},
		13: {
			title: function() { return L("岁星", "The Year Star") },
			description: function() { return L("冬至候产 ×(log10(冬至候+1)+1)。", "冬至候 output x (log10(冬至候+1)+1).") },
			cost: new Decimal(TUNING.SUI_UPG_COSTS[13]),
			effect() { return player.dz.points.add(1).log(10).add(1) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		14: {
			title: function() { return L("闰法", "The Intercalary Rule") },
			description: function() { return L("岁礼 ×(已察候/12+1)。", "岁礼 x (observed/12+1).") },
			cost: new Decimal(TUNING.SUI_UPG_COSTS[14]),
			effect() { return new Decimal(1).add(houObserved() / 12) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		15: {
			title: function() { return L("岁功成", "The Year Is Complete") },
			description: function() { return L("历法终成 —— 七十二候尽，二十四气周。此即终局。", "The calendar is finished — 72 pentads, 24 terms. This is the ending.") },
			cost: new Decimal(TUNING.SUI_FINALE_COST),
			unlocked() { return hasMilestone("sui", 3) },
		},
		21: {
			title: function() { return L("岁会", "The Year Assembly") },
			description: function() { return L("八节试每完成一次，岁礼 ×1.1（随完成数而长）。", "Each trial completion: 岁礼 x1.1 (grows with completions).") },
			cost: new Decimal(TUNING.SUI_UPG_COSTS[21]),
			effect() { return new Decimal(1.1).pow(challengeCompletions("sui", 11) + challengeCompletions("sui", 12) + challengeCompletions("sui", 13) + challengeCompletions("sui", 14) + challengeCompletions("sui", 15) + challengeCompletions("sui", 16) + challengeCompletions("sui", 17) + challengeCompletions("sui", 18)) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		22: {
			title: function() { return L("岁星纪年", "Jupiter's Twelve Years") },
			description: function() { return L("十二岁一周天：岁礼软上限 ×1000。", "Twelve years to a circuit: the 岁礼 softcap x1000.") },
			cost: new Decimal(TUNING.SUI_UPG_COSTS[22]),
			unlocked() { return player.sui.best.gte(20) },
		},
		23: {
			title: function() { return L("岁实消长", "The Wobble of the Year") },
			description: function() { return L("岁礼产 ×(岁礼/1e3+1)^0.2。", "岁礼 output x (岁礼/1e3+1)^0.2.") },
			cost: new Decimal(TUNING.SUI_UPG_COSTS[23]),
			effect() { return player.sui.points.div(1e3).add(1).log(10).add(1).pow(0.2) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		24: {
			title: function() { return L("岁祭之器", "The Ritual Vessel") },
			description: function() { return L("岁簿（buyable）之效 ×1 ~ ×1.5（随岁礼而长）。", "The year-ledger buyable's effect x1 .. x1.5, growing with 岁礼.") },
			cost: new Decimal(TUNING.SUI_UPG_COSTS[24]),
			effect() { return new Decimal(1).add(player.sui.points.add(1).log(10).div(10)).min(1.5) },
			effectDisplay() { return "岁簿效果 ^" + format(this.effect()) },
		},
		25: {
			title: function() { return L("岁簿", "The Year Ledger") },
			description: function() { return L("开启岁簿（buyable）：以岁礼记岁，岁岁相加。", "Unlock the year ledger (a buyable): record the years, one on another.") },
			cost: new Decimal(TUNING.SUI_UPG_COSTS[25]),
			unlocked() { return hasMilestone("sui", 1) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function() { return L("岁礼 ≥ 1", "1 岁礼") },
			effectDescription: function() { return L("日影 ×2；八节试可见。", "Sun-shadow x2; the eight trials become visible.") },
			done() { return player.sui.best.gte(1) },
		},
		1: {
			requirementDescription: function() { return L("岁礼 ≥ 3", "3 岁礼") },
			effectDescription: function() { return L("岁礼产 ×3；岁簿可开。", "岁礼 output x3; the ledger opens.") },
			done() { return player.sui.best.gte(3) },
		},
		2: {
			requirementDescription: function() { return L("岁礼 ≥ 12", "12 岁礼") },
			effectDescription: function() { return L("岁礼产 ×5。", "岁礼 output x5.") },
			done() { return player.sui.best.gte(12) },
		},
		3: {
			requirementDescription: function() { return L("一岁既成（岁祭一次）", "One year completed") },
			effectDescription: function() { return L("日影 ×5；<b>全树自动</b> —— 立春至冬至九个节点自此自行交节、自行购候，且交节不再动其下层。（岁功既成，人事尽矣。）", "Sun-shadow x5; <b>the whole tree runs itself</b> — from 立春 to 冬至 every node turns its own season and buys its own pentads, and a 交节 no longer disturbs the layers beneath it.") },
			done() { return player.sui.best.gte(30) },
		},
		4: {
			requirementDescription: function() { return L("八节试尽（二十四完成）", "24 trial completions") },
			effectDescription: function() { return L("岁礼 ×3；岁簿之效再 ×2。", "岁礼 x3; the year ledger doubles again.") },
			done() { return totalTrialCompletions() >= 24 },
		},
		5: {
			requirementDescription: function() { return L("七十二候尽（候图全开）", "All 72 pentads observed") },
			effectDescription: function() { return L("日影 ×24；岁礼 ×24。", "Sun-shadow x24; 岁礼 x24.") },
			done() { return houObserved() >= TUNING.HOU_TOTAL },
		},
	},

	buyables: {
		11: {
			title: function() { return L("岁簿", "Year Ledger") },
			display() {
				return L("已记 <b>" + formatWhole(getBuyableAmount("sui", 11)) + "</b> 岁<br>岁礼 ×<b>" + format(buyableEffect("sui", 11)) + "</b><br>下一岁 " + format(this.cost()) + " 岁礼", "recorded <b>" + formatWhole(getBuyableAmount("sui", 11)) + "</b> years<br>岁礼 x<b>" + format(buyableEffect("sui", 11)) + "</b><br>next " + format(this.cost()) + " 岁礼")
			},
			cost(amount) { return new Decimal(TUNING.SUI_BUY_COST_BASE).times(Decimal.pow(TUNING.SUI_BUY_COST_MULT, amount)) },
			effect(amount) {
				let ret = new Decimal(TUNING.SUI_BUY_EFFECT_MULT).pow(amount)
				if (hasUpgrade("sui", 24)) ret = ret.pow(upgradeEffect("sui", 24))
				if (hasMilestone("sui", 4)) ret = ret.times(2)
				return ret
			},
			unlocked() { return hasUpgrade("sui", 25) },
			canAfford() { return player.sui.points.gte(this.cost()) },
			buy() {
				player.sui.points = player.sui.points.sub(this.cost())
				setBuyableAmount("sui", 11, getBuyableAmount("sui", 11).add(1))
			},
			buyMax() { let n = 0; while (this.canAfford() && n < 50) { this.buy(); n++ } },
		},
	},

	challenges: {
		11: {
			name: function() { return L("立春试", "Trial of Spring Begins") },
			unlocked() { return hasMilestone("lc", 3) },
			challengeDescription: function() { return L("试一岁于立春：整个节气树归零，且一切候产 ÷1000。", "Run the year from Spring Begins: the whole tree resets and all 候 output is divided by 1000.") },
			goalDescription: function() { return L("在试中得 <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[0])) + "</b> 岁礼", "Reach <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[0])) + "</b> 岁礼 inside the trial") },
			rewardDescription: function() { return L("岁礼产 ×(峰值+1)^0.4，每次完成再 ×1.35（已记峰值 " + format(player.sui.maxpoints[0]) + "）", "岁礼 output x (peak+1)^0.4, x1.35 per completion (recorded peak " + format(player.sui.maxpoints[0]) + ")") },
			canComplete() { return player.sui.points.gte(new Decimal(TUNING.CHALLENGE_TARGETS[0])) },
			completionLimit: 3,
			rewardEffect() {
				let peak = player.sui.maxpoints[0]
				let done = challengeCompletions("sui", 11)
				let ret = peak.add(1).pow(0.4)
				if (done >= 1) ret = ret.times(Decimal.pow(TUNING.CHALLENGE_REWARD, done))
				return ret
			},
		},
		12: {
			name: function() { return L("春分试", "Trial of Spring Equinox") },
			unlocked() { return hasMilestone("cf", 3) },
			challengeDescription: function() { return L("试一岁于春分：整个节气树归零，且一切候产 ÷1000。", "Run the year from Spring Equinox: the whole tree resets and all 候 output is divided by 1000.") },
			goalDescription: function() { return L("在试中得 <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[1])) + "</b> 岁礼", "Reach <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[1])) + "</b> 岁礼 inside the trial") },
			rewardDescription: function() { return L("岁礼产 ×(峰值+1)^0.4，每次完成再 ×1.35（已记峰值 " + format(player.sui.maxpoints[1]) + "）", "岁礼 output x (peak+1)^0.4, x1.35 per completion (recorded peak " + format(player.sui.maxpoints[1]) + ")") },
			canComplete() { return player.sui.points.gte(new Decimal(TUNING.CHALLENGE_TARGETS[1])) },
			completionLimit: 3,
			rewardEffect() {
				let peak = player.sui.maxpoints[1]
				let done = challengeCompletions("sui", 12)
				let ret = peak.add(1).pow(0.4)
				if (done >= 1) ret = ret.times(Decimal.pow(TUNING.CHALLENGE_REWARD, done))
				return ret
			},
		},
		13: {
			name: function() { return L("立夏试", "Trial of Summer Begins") },
			unlocked() { return hasMilestone("lx", 3) },
			challengeDescription: function() { return L("试一岁于立夏：整个节气树归零，且一切候产 ÷1000。", "Run the year from Summer Begins: the whole tree resets and all 候 output is divided by 1000.") },
			goalDescription: function() { return L("在试中得 <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[2])) + "</b> 岁礼", "Reach <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[2])) + "</b> 岁礼 inside the trial") },
			rewardDescription: function() { return L("岁礼产 ×(峰值+1)^0.4，每次完成再 ×1.35（已记峰值 " + format(player.sui.maxpoints[2]) + "）", "岁礼 output x (peak+1)^0.4, x1.35 per completion (recorded peak " + format(player.sui.maxpoints[2]) + ")") },
			canComplete() { return player.sui.points.gte(new Decimal(TUNING.CHALLENGE_TARGETS[2])) },
			completionLimit: 3,
			rewardEffect() {
				let peak = player.sui.maxpoints[2]
				let done = challengeCompletions("sui", 13)
				let ret = peak.add(1).pow(0.4)
				if (done >= 1) ret = ret.times(Decimal.pow(TUNING.CHALLENGE_REWARD, done))
				return ret
			},
		},
		14: {
			name: function() { return L("夏至试", "Trial of Summer Solstice") },
			unlocked() { return hasMilestone("xz", 3) },
			challengeDescription: function() { return L("试一岁于夏至：整个节气树归零，且一切候产 ÷1000。", "Run the year from Summer Solstice: the whole tree resets and all 候 output is divided by 1000.") },
			goalDescription: function() { return L("在试中得 <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[3])) + "</b> 岁礼", "Reach <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[3])) + "</b> 岁礼 inside the trial") },
			rewardDescription: function() { return L("岁礼产 ×(峰值+1)^0.4，每次完成再 ×1.35（已记峰值 " + format(player.sui.maxpoints[3]) + "）", "岁礼 output x (peak+1)^0.4, x1.35 per completion (recorded peak " + format(player.sui.maxpoints[3]) + ")") },
			canComplete() { return player.sui.points.gte(new Decimal(TUNING.CHALLENGE_TARGETS[3])) },
			completionLimit: 3,
			rewardEffect() {
				let peak = player.sui.maxpoints[3]
				let done = challengeCompletions("sui", 14)
				let ret = peak.add(1).pow(0.4)
				if (done >= 1) ret = ret.times(Decimal.pow(TUNING.CHALLENGE_REWARD, done))
				return ret
			},
		},
		15: {
			name: function() { return L("立秋试", "Trial of Autumn Begins") },
			unlocked() { return hasMilestone("lq", 3) },
			challengeDescription: function() { return L("试一岁于立秋：整个节气树归零，且一切候产 ÷1000。", "Run the year from Autumn Begins: the whole tree resets and all 候 output is divided by 1000.") },
			goalDescription: function() { return L("在试中得 <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[4])) + "</b> 岁礼", "Reach <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[4])) + "</b> 岁礼 inside the trial") },
			rewardDescription: function() { return L("岁礼产 ×(峰值+1)^0.4，每次完成再 ×1.35（已记峰值 " + format(player.sui.maxpoints[4]) + "）", "岁礼 output x (peak+1)^0.4, x1.35 per completion (recorded peak " + format(player.sui.maxpoints[4]) + ")") },
			canComplete() { return player.sui.points.gte(new Decimal(TUNING.CHALLENGE_TARGETS[4])) },
			completionLimit: 3,
			rewardEffect() {
				let peak = player.sui.maxpoints[4]
				let done = challengeCompletions("sui", 15)
				let ret = peak.add(1).pow(0.4)
				if (done >= 1) ret = ret.times(Decimal.pow(TUNING.CHALLENGE_REWARD, done))
				return ret
			},
		},
		16: {
			name: function() { return L("秋分试", "Trial of Autumn Equinox") },
			unlocked() { return hasMilestone("qf", 3) },
			challengeDescription: function() { return L("试一岁于秋分：整个节气树归零，且一切候产 ÷1000。", "Run the year from Autumn Equinox: the whole tree resets and all 候 output is divided by 1000.") },
			goalDescription: function() { return L("在试中得 <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[5])) + "</b> 岁礼", "Reach <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[5])) + "</b> 岁礼 inside the trial") },
			rewardDescription: function() { return L("岁礼产 ×(峰值+1)^0.4，每次完成再 ×1.35（已记峰值 " + format(player.sui.maxpoints[5]) + "）", "岁礼 output x (peak+1)^0.4, x1.35 per completion (recorded peak " + format(player.sui.maxpoints[5]) + ")") },
			canComplete() { return player.sui.points.gte(new Decimal(TUNING.CHALLENGE_TARGETS[5])) },
			completionLimit: 3,
			rewardEffect() {
				let peak = player.sui.maxpoints[5]
				let done = challengeCompletions("sui", 16)
				let ret = peak.add(1).pow(0.4)
				if (done >= 1) ret = ret.times(Decimal.pow(TUNING.CHALLENGE_REWARD, done))
				return ret
			},
		},
		17: {
			name: function() { return L("立冬试", "Trial of Winter Begins") },
			unlocked() { return hasMilestone("ld", 3) },
			challengeDescription: function() { return L("试一岁于立冬：整个节气树归零，且一切候产 ÷1000。", "Run the year from Winter Begins: the whole tree resets and all 候 output is divided by 1000.") },
			goalDescription: function() { return L("在试中得 <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[6])) + "</b> 岁礼", "Reach <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[6])) + "</b> 岁礼 inside the trial") },
			rewardDescription: function() { return L("岁礼产 ×(峰值+1)^0.4，每次完成再 ×1.35（已记峰值 " + format(player.sui.maxpoints[6]) + "）", "岁礼 output x (peak+1)^0.4, x1.35 per completion (recorded peak " + format(player.sui.maxpoints[6]) + ")") },
			canComplete() { return player.sui.points.gte(new Decimal(TUNING.CHALLENGE_TARGETS[6])) },
			completionLimit: 3,
			rewardEffect() {
				let peak = player.sui.maxpoints[6]
				let done = challengeCompletions("sui", 17)
				let ret = peak.add(1).pow(0.4)
				if (done >= 1) ret = ret.times(Decimal.pow(TUNING.CHALLENGE_REWARD, done))
				return ret
			},
		},
		18: {
			name: function() { return L("冬至试", "Trial of Winter Solstice") },
			unlocked() { return hasMilestone("dz", 3) },
			challengeDescription: function() { return L("试一岁于冬至：整个节气树归零，且一切候产 ÷1000。", "Run the year from Winter Solstice: the whole tree resets and all 候 output is divided by 1000.") },
			goalDescription: function() { return L("在试中得 <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[7])) + "</b> 岁礼", "Reach <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[7])) + "</b> 岁礼 inside the trial") },
			rewardDescription: function() { return L("岁礼产 ×(峰值+1)^0.4，每次完成再 ×1.35（已记峰值 " + format(player.sui.maxpoints[7]) + "）", "岁礼 output x (peak+1)^0.4, x1.35 per completion (recorded peak " + format(player.sui.maxpoints[7]) + ")") },
			canComplete() { return player.sui.points.gte(new Decimal(TUNING.CHALLENGE_TARGETS[7])) },
			completionLimit: 3,
			rewardEffect() {
				let peak = player.sui.maxpoints[7]
				let done = challengeCompletions("sui", 18)
				let ret = peak.add(1).pow(0.4)
				if (done >= 1) ret = ret.times(Decimal.pow(TUNING.CHALLENGE_REWARD, done))
				return ret
			},
		},
	},

	tabFormat: [
		["display-text", function() { return mainAmount("sui", true) }],
		["display-text", function() { return suiStatusLine() }],
		"blank",
		"prestige-button",
		"blank",
		["microtabs", "stuff"],
	],
	microtabs: {
		stuff: {
			"岁祭 · Ritual": {
				content: [["upgrades", [1, 2]]],
			},
			"八节试 · Trials": {
				content: [["display-text", function() { return suiTrialLine() }], "blank", ["challenges", [1]]],
				unlocked() { return hasMilestone("sui", 0) },
			},
			"岁簿 · Ledger": {
				content: [["buyables", [1]]],
				unlocked() { return hasUpgrade("sui", 25) },
			},
			"碑 · Stele": {
				content: [["milestones", [0, 1, 2, 3, 4, 5]]],
			},
		},
	},
})

/* ---- 岁's readouts (file scope: they mutate nothing, but they are long) ---- */
function suiStatusLine() {
	let i = suiTrial()
	if (i >= 0) return L("<span style='color:#FF6F91'>试中 —— 峰值 " + format(suiPeakOf(i)) + "，此试目标 " + format(new Decimal(TUNING.CHALLENGE_TARGETS[i])) + "</span>", "<span style='color:#FF6F91'>in a trial — peak " + format(suiPeakOf(i)) + ", target " + format(new Decimal(TUNING.CHALLENGE_TARGETS[i])) + "</span>")
	return L("一岁一轮：冬至候 " + format(player.dz.points) + " / 需 " + format(suiReq()) + "　·　试成 " + totalTrialCompletions() + " / 24", "a year at a time: 冬至候 " + format(player.dz.points) + " / need " + format(suiReq()) + " · trials " + totalTrialCompletions() + " / 24")
}
function suiTrialLine() {
	return L("试中：全树归零、候产 ÷" + TUNING.SUI_TRIAL_DIV + "。岁礼以<b>峰值</b>计功，峰高则赏厚 —— 每次重入，力倍于前，赏亦倍于前。", "Inside a trial the tree resets and all 候 output is divided by " + TUNING.SUI_TRIAL_DIV + ". The reward is scored on the PEAK 岁礼 you reach, so a stronger re-entry buys a bigger permanent bonus.")
}
