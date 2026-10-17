// ===========================================================================
// Row 3 — the summit:
//   f 绝顶 — custom hub: M2 score-attack trials (九峰试炼) + M7 敬山礼 ritual
//   y 云端 — static endgame: nine cloud tiers, 长命百岁 finale (isEndgame)
// ===========================================================================

// ---------------------------------------------------------------------------
// 绝顶 f — the M2 hub. Gain = (诗章/50000)^0.25 × Π, trials root the gain,
// and the peak of each trial (maxpoints) is the real reward currency (M2).
// ---------------------------------------------------------------------------
addLayer("f", {
	name: function() { return L("绝顶", "The Summit") },
	symbol: "顶",
	position: 0,
	color: "#FFC107",
	resource: function() { return L("九山礼", "mountain tributes") },
	row: 3,
	branches: ["g", "s", "m"],
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		total: new Decimal(0),
		best: new Decimal(0),
		scratch: new Decimal(0),
		maxpoints: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
	}},
	baseResource: function() { return L("诗章", "verse realms") },
	baseAmount() { return player.s.points },
	requires: new Decimal(TUNING.fReq),
	type: "custom",

	gainMult() {
		let m = new Decimal(1)
		if (hasUpgrade("f", 11)) m = m.times(2)
		if (hasUpgrade("f", 12)) m = m.times(3)
		if (hasUpgrade("f", 13)) m = m.times(upgradeEffect("f", 13))
		if (hasUpgrade("f", 21)) m = m.times(upgradeEffect("f", 21))
		if (hasUpgrade("f", 22)) m = m.times(upgradeEffect("f", 22))
		if (hasUpgrade("f", 24)) m = m.times(5)
		if (hasMilestone("f", 1)) m = m.times(2)
		if (hasMilestone("f", 5)) m = m.times(3)
		if (hasMilestone("f", 6)) m = m.times(player.s.points.add(1).pow(0.2))
		if (hasMilestone("f", 8)) m = m.times(5)
		return m
	},

	// M2: the peak of each trial is the reward currency; u23 rewrites the
	// reward formula (K4 on the named 试炼之酬), m.2 does the same at ×1.1.
	// The market stall 茱萸穗 (m.13) multiplies the same named reward.
	trialMult() {
		let p = new Decimal(1)
		let i = 0
		let ids = [11, 21, 31, 41]
		for (; i < 4; i++) {
			let peak = player.f.maxpoints[i].add(1).pow(TUNING.m2RewardExp)
			if (hasUpgrade("f", 23)) peak = peak.pow(1.1)
			if (hasMilestone("f", 2)) peak = peak.pow(1.1)
			peak = peak.times(buyableEffect("m", 13))
			p = p.times(peak)
		}
		return p
	},

	scoreRate() {
		let r = new Decimal(1).add(player.f.points.add(1).pow(0.5))
		if (hasMilestone("f", 1)) r = r.times(2)
		if (hasMilestone("f", 5)) r = r.times(3)
		if (hasMilestone("f", 8)) r = r.times(5)
		return r
	},

	// M2 peak-tracking (the sim budget: f is one of the three update layers).
	// scratch is a custom variable, so N-POINTSWRITE does not apply.
	update(diff) {
		let ids = [11, 21, 31, 41]
		let i = 0
		for (; i < 4; i++) {
			if (inChallenge(this.layer, ids[i])) {
				player.f.scratch = player.f.scratch.add(tmp.f.scoreRate.times(diff))
				player.f.maxpoints[i] = player.f.maxpoints[i].max(player.f.scratch)
			}
		}
	},

	// M2 hub: 诗境 → 九山礼. gain is the DELTA above banked 九山礼 (engine adds it to
	// player.f.points); nextAt is based on banked+1, so canReset is true exactly when one
	// more 九山礼 is in reach (the old total-based form sat always ahead of baseAmount,
	// making f impossible to prestige and y unreachable).
	getResetGain() {
		let pot = player.s.points.max(TUNING.fReq).div(TUNING.fReq).pow(TUNING.fExp)
		pot = pot.times(this.gainMult()).times(this.trialMult())
		let i = 0
		let ids = [11, 21, 31, 41]
		for (; i < 4; i++) {
			if (inChallenge(this.layer, ids[i])) pot = pot.root(TUNING.chalRoots[i])
		}
		// P12 #3: the re-root (u14 delays it — visible on the tab).
		let reroot = hasUpgrade("f", 14) ? new Decimal("1e9") : new Decimal(TUNING.fRerootAt)
		if (pot.gte(reroot)) pot = pot.sqrt().times(new Decimal("1e3"))
		return pot.sub(player.f.points).max(0)
	},
	getNextAt(canMax) {
		let banked = player.f.points.add(1)
		let mult = this.gainMult().times(this.trialMult())
		return new Decimal(TUNING.fReq).times(banked.div(mult).pow(1 / TUNING.fExp))
	},
	canReset() {
		return tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt)
	},
	// M7: the ritual button (07 Part F8: the standard prestige-button renders it).
	prestigeButtonText() {
		return L("敬山礼 · 得 " + formatWhole(tmp[this.layer].resetGain) + " 九山礼",
			"mountain rite · gain " + formatWhole(tmp[this.layer].resetGain) + " tributes")
	},

	layerShown() { return true },
	tooltip() { return L("敬山：诗章换九山礼，四峰试炼计分。", "The rite: realms into tributes; the four trials score the peak.") },
	tooltipLocked() { return L("需 " + format(TUNING.fReq) + " 诗章", "Requires " + format(TUNING.fReq) + " realms") },

	doReset(resettingLayer) {
		// The summit re-stakes the whole mountain: everything below is swept;
		// the summit keeps its own ledger (best/total always, upgrades from m0).
		let kept = ["best", "total"]
		if (hasMilestone("f", 0)) kept.push("upgrades")
		layerDataReset(this.layer, kept)
	},

	hotkeys: [
		{ key: "f",
		  description: function() { return L("F：敬山礼，换九山礼", "F: the mountain rite for tributes") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],

	upgrades: {
		11: {
			title: function() { return L("松涛", "Pine Surge") },
			description: function() { return L("九山礼获取 ×2。", "Tribute gain ×2.") },
			cost: new Decimal(1),
		},
		12: {
			title: function() { return L("云海", "Sea of Clouds") },
			description: function() { return L("九山礼获取 ×3。", "Tribute gain ×3.") },
			cost: new Decimal(3),
			unlocked() { return hasUpgrade(this.layer, 11) },
		},
		13: {
			title: function() { return L("长明", "Ever-Bright") },
			description: function() { return L("九山礼获取 ×（九山礼 + 1）^0.3。", "Tribute gain ×(tributes+1)^0.3.") },
			cost: new Decimal(8),
			unlocked() { return hasUpgrade(this.layer, 12) },
			effect() { return player[this.layer].points.add(1).pow(0.3) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		14: {
			title: function() { return L("顶灯", "Summit Lamp") },
			description: function() { return L("绝顶再根自 1e6 放宽至 1e9（要略可见）。", "The summit re-root from 1e6 relaxed to 1e9 (visible in the briefing).") },
			cost: new Decimal(16),
			unlocked() { return hasUpgrade(this.layer, 13) },
		},
		15: {
			title: function() { return L("九峰名册", "Roll of the Nine") },
			description: function() { return L("开启「九峰试炼」页签。", "Unlocks the trial sub-tab.") },
			cost: new Decimal(32),
			unlocked() { return hasUpgrade(this.layer, 14) },
		},
		21: {
			title: function() { return L("山灵", "Mountain Spirits") },
			description: function() { return L("九山礼获取 ×（诗章 + 1）^0.15；山道里程 ×5。", "Tribute gain ×(realms+1)^0.15; path gain ×5.") },
			cost: new Decimal(64),
			unlocked() { return hasUpgrade(this.layer, 15) },
			effect() { return player.s.points.add(1).pow(0.15) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		22: {
			title: function() { return L("九山之息", "Breath of the Nine") },
			description: function() { return L("（键：峰间一息）九山礼获取 ×（九山礼峰值十进制位 + 1）。", "(key: one breath between peaks) tribute gain ×(log10(best tributes)+1).") },
			cost: new Decimal(48),
			unlocked() { return hasUpgrade(this.layer, 21) },
			effect() { return player[this.layer].best.max(10).log10().add(1) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		23: {
			title: function() { return L("试炼之式", "Trial Formula") },
			description: function() { return L("试炼之酬（M2 峰值公式）整体 ^1.1。", "The trial reward (the M2 peak formula) as a whole, ^1.1.") },
			cost: new Decimal(128),
			unlocked() { return hasUpgrade(this.layer, 22) },
		},
		24: {
			title: function() { return L("云上之云", "Cloud Above Clouds") },
			description: function() { return L("云端既立，九山礼获取 ×5。", "With the cloud tiers up: tribute gain ×5.") },
			cost: new Decimal(256),
			unlocked() { return hasUpgrade(this.layer, 23) },
		},
		25: {
			title: function() { return L("九峰要略", "Summit Briefing") },
			description: function() { return L("开启「九峰要略」页签。", "Unlocks the summit briefing sub-tab.") },
			cost: new Decimal(512),
			unlocked() { return hasUpgrade(this.layer, 24) },
		},
		31: {
			title: function() { return L("山气", "Mountain Air") },
			description: function() { return L("山道里程 ×（九山礼 + 1）^0.1。", "Path gain ×(tributes+1)^0.1.") },
			cost: new Decimal(1024),
			unlocked() { return hasUpgrade("f", 25) },
			effect() { return player[this.layer].points.add(1).pow(0.1) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
	},

	// M2: four trials, three tiers of nerf themes, each repeatable three times.
	// P16: every handicap injects into an OLDER layer's formula via inChallenge.
	challenges: {
		11: {
			name: function() { return L("霜风", "Frost Wind") },
			challengeDescription() {
				return L("山道生产 ×0.1（全山风紧）。<br>完成 " + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " 次",
					"Path production ×0.1 (the wind holds the mountain).<br>completed " + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit)
			},
			goalDescription: function() { return L("试炼计分达到 " + format(TUNING.chalScoreTargets[0]), "Reach a trial score of " + format(TUNING.chalScoreTargets[0])) },
			canComplete() { return player.f.maxpoints[0].gte(TUNING.chalScoreTargets[0]) },
			rewardDescription: function() { return L("试炼之酬：九山礼 ×（峰值 " + format(player.f.maxpoints[0]) + " + 1）^" + TUNING.m2RewardExp,
				"Trial reward: tributes ×(peak " + format(player.f.maxpoints[0]) + " + 1)^" + TUNING.m2RewardExp) },
			completionLimit: 3,
			unlocked() { return hasMilestone(this.layer, 0) },
			onExit() { player.f.scratch = new Decimal(0) },
		},
		21: {
			name: function() { return L("寒菊", "Cold Bloom") },
			challengeDescription() {
				return L("菊田之效 ×0.3（菊闭而不放）。<br>完成 " + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " 次",
					"The chrysanthem field's power ×0.3 (petals sealed).<br>completed " + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit)
			},
			goalDescription: function() { return L("试炼计分达到 " + format(TUNING.chalScoreTargets[1]), "Reach a trial score of " + format(TUNING.chalScoreTargets[1])) },
			canComplete() { return player.f.maxpoints[1].gte(TUNING.chalScoreTargets[1]) },
			rewardDescription: function() { return L("试炼之酬：九山礼 ×（峰值 " + format(player.f.maxpoints[1]) + " + 1）^" + TUNING.m2RewardExp,
				"Trial reward: tributes ×(peak " + format(player.f.maxpoints[1]) + " + 1)^" + TUNING.m2RewardExp) },
			completionLimit: 3,
			unlocked() { return hasMilestone(this.layer, 1) },
			onExit() { player.f.scratch = new Decimal(0) },
		},
		31: {
			name: function() { return L("断酒", "Broken Wine") },
			challengeDescription() {
				return L("九日酿停摆，酒坊自生停用。<br>完成 " + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " 次",
					"The nine-day brew stands still; the cellar's self-yield is off.<br>completed " + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit)
			},
			goalDescription: function() { return L("试炼计分达到 " + format(TUNING.chalScoreTargets[2]), "Reach a trial score of " + format(TUNING.chalScoreTargets[2])) },
			canComplete() { return player.f.maxpoints[2].gte(TUNING.chalScoreTargets[2]) },
			rewardDescription: function() { return L("试炼之酬：九山礼 ×（峰值 " + format(player.f.maxpoints[2]) + " + 1）^" + TUNING.m2RewardExp,
				"Trial reward: tributes ×(peak " + format(player.f.maxpoints[2]) + " + 1)^" + TUNING.m2RewardExp) },
			completionLimit: 3,
			unlocked() { return hasMilestone(this.layer, 2) },
			onExit() { player.f.scratch = new Decimal(0) },
		},
		41: {
			name: function() { return L("孤登", "Solo Climb") },
			challengeDescription() {
				return L("全山之自动化缄默（护旧自生、自动重整、自动购阶皆止）。<br>完成 " + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " 次",
					"Every automation on the mountain holds its breath (self-growth, auto-stake, auto-buy all stand down).<br>completed " + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit)
			},
			goalDescription: function() { return L("试炼计分达到 " + format(TUNING.chalScoreTargets[3]), "Reach a trial score of " + format(TUNING.chalScoreTargets[3])) },
			canComplete() { return player.f.maxpoints[3].gte(TUNING.chalScoreTargets[3]) },
			rewardDescription: function() { return L("试炼之酬：九山礼 ×（峰值 " + format(player.f.maxpoints[3]) + " + 1）^" + TUNING.m2RewardExp,
				"Trial reward: tributes ×(peak " + format(player.f.maxpoints[3]) + " + 1)^" + TUNING.m2RewardExp) },
			completionLimit: 3,
			unlocked() { return hasMilestone(this.layer, 3) },
			onExit() { player.f.scratch = new Decimal(0) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function() { return L("九山礼峰值 ≥ 1", "best tributes ≥ 1") },
			effectDescription: function() { return L("敬山礼不再卷走绝顶之阶。", "The rite no longer sweeps the summit's own steps.") },
			done() { return player[this.layer].best.gte(1) },
		},
		1: {
			requirementDescription: function() { return L("九山礼峰值 ≥ 3", "best tributes ≥ 3") },
			unlocked() { return hasMilestone(this.layer, 0) },
			effectDescription: function() { return L("九山礼获取 ×2。", "Tribute gain ×2.") },
			done() { return player[this.layer].best.gte(3) },
		},
		2: {
			requirementDescription: function() { return L("九山礼峰值 ≥ 8", "best tributes ≥ 8") },
			unlocked() { return hasMilestone(this.layer, 1) },
			effectDescription: function() { return L("试炼之酬（M2 峰值公式）整体 ^1.1。", "The trial reward (the M2 peak formula) as a whole, ^1.1.") },
			done() { return player[this.layer].best.gte(8) },
		},
		3: {
			requirementDescription: function() { return L("九山礼峰值 ≥ 15", "best tributes ≥ 15") },
			unlocked() { return hasMilestone(this.layer, 2) },
			effectDescription: function() { return L("云端之价 ×0.9（云梯更缓）。", "Cloud-tier prices ×0.9 (the ladder gentler).") },
			done() { return player[this.layer].best.gte(15) },
		},
		4: {
			requirementDescription: function() { return L("九山礼峰值 ≥ 30", "best tributes ≥ 30") },
			unlocked() { return hasMilestone(this.layer, 3) },
			effectDescription: function() { return L("重阳全山礼：糕坊、诗阁、市集三者自动重整、自动购阶、不再卷走旧行。",
				"The mountain-wide rite: the workshop, the pavilion and the market each gain auto-stake, auto-buy and keep-on-reset.") },
			done() { return player[this.layer].best.gte(TUNING.fPackage) },
		},
		5: {
			requirementDescription: function() { return L("九山礼峰值 ≥ 60", "best tributes ≥ 60") },
			unlocked() { return hasMilestone(this.layer, 4) },
			effectDescription: function() { return L("九山礼获取 ×3。", "Tribute gain ×3.") },
			done() { return player[this.layer].best.gte(60) },
		},
		6: {
			requirementDescription: function() { return L("九山礼峰值 ≥ 120", "best tributes ≥ 120") },
			unlocked() { return hasMilestone(this.layer, 5) },
			effectDescription: function() { return L("诗境之流：九山礼获取 ×（诗章 + 1）^0.2。", "Verse flow: tribute gain ×(realms+1)^0.2.") },
			done() { return player[this.layer].best.gte(120) },
		},
		7: {
			requirementDescription: function() { return L("九山礼峰值 ≥ 250", "best tributes ≥ 250") },
			unlocked() { return hasMilestone(this.layer, 6) },
			effectDescription: function() { return L("长命百岁之目可即（云端页签显影）。", "The hundred-year title comes into view (on the cloud tiers tab).") },
			done() { return player[this.layer].best.gte(250) },
		},
		8: {
			requirementDescription: function() { return L("九山礼峰值 ≥ 500", "best tributes ≥ 500") },
			unlocked() { return hasMilestone(this.layer, 7) },
			effectDescription: function() { return L("九山礼获取 ×5。", "Tribute gain ×5.") },
			done() { return player[this.layer].best.gte(500) },
		},
		9: {
			requirementDescription: function() { return L("九山礼峰值 ≥ 1000", "best tributes ≥ 1000") },
			unlocked() { return hasMilestone(this.layer, 8) },
			effectDescription: function() { return L("九峰同寿：「长命百岁」可购（云端·第四十五阶）。",
				"The nine peaks in unison: 「长命百岁」 may be bought (cloud tiers, step 45).") },
			done() { return player[this.layer].best.gte(TUNING.fM9) },
		},
	},

	tabFormat: [
		["display-text", function() {
			return L("九山礼 <b>" + format(player.f.points) + "</b> · 诗章 " + format(tmp.f.baseAmount) +
				"<br>敬山礼可得 <b>" + formatWhole(tmp.f.resetGain) + "</b>" +
				(hasUpgrade("f", 14) ? "" : "（再根自 " + format(TUNING.fRerootAt) + " 起）"),
				"tributes <b>" + format(player.f.points) + "</b> · realms " + format(tmp.f.baseAmount) +
				"<br>the rite yields <b>" + formatWhole(tmp.f.resetGain) + "</b>" +
				(hasUpgrade("f", 14) ? "" : " (re-root from " + format(TUNING.fRerootAt) + ")"))
		}],
		"prestige-button",
		["microtabs", "fd"],
	],
	microtabs: {
		"fd": {
			"登顶": {
				content: ["upgrades", [11, 12, 13, 14, 15, 21, 22, 23, 24, 25, 31]],
			},
			"九峰试炼": {
				unlocked() { return hasUpgrade("f", 15) },
				content: [
					"challenges",
					["display-text", function() {
						let i = 0
						let s = L("试炼计分（峰值）：", "Trial score (peak): ")
						for (; i < 4; i++) s += format(player.f.maxpoints[i]) + " · "
						return s
					}],
				],
				buttonStyle() { return {'background': 'linear-gradient(90deg,#FFC107,#b26b00)', 'color': '#2d1d00'} },
			},
			"里程碑": {
				content: ["milestones", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
			},
			"九峰要略": {
				unlocked() { return hasUpgrade("f", 25) },
				content: [
					["display-text", function() {
						return L("九山礼 = (诗章/" + format(TUNING.fReq) + ")^0.25 × 倍率 × 试炼之酬<br>试炼之酬 = Π(峰值<sub>i</sub>+" + 1 + ")^" + TUNING.m2RewardExp + (hasUpgrade("f", 23) ? " · ^1.1（试炼之式）" : "") +
							"<br>计分流速：" + format(tmp.f.scoreRate) + "/秒",
							"tributes = (realms/" + format(TUNING.fReq) + ")^0.25 × mult × trial reward<br>trial reward = Π(peak<sub>i</sub>+1)^" + TUNING.m2RewardExp + (hasUpgrade("f", 23) ? " · ^1.1 (Trial Formula)" : "") +
							"<br>score flow: " + format(tmp.f.scoreRate) + "/s")
					}],
				],
			},
		},
	},
})

// ---------------------------------------------------------------------------
// 云端 y — the static finale: nine cloud tiers. 长命百岁 (45) is priced in
// 九山礼 above the top rung (F15), and IS the endgame.
// ---------------------------------------------------------------------------
addLayer("y", {
	name: function() { return L("云端", "The Cloud Tiers") },
	symbol: "云",
	position: 1,
	color: "#80DEEA",
	resource: function() { return L("云阶", "cloud tiers") },
	row: 3,
	branches: ["f"],
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		total: new Decimal(0),
		best: new Decimal(0),
	}},
	baseResource: function() { return L("九山礼", "mountain tributes") },
	baseAmount() { return player.f.points },
	requires: new Decimal(TUNING.yReq),
	type: "static",
	base: TUNING.yBase,
	exponent: 1,
	roundUpCost: true,
	canBuyMax() { return true },
	// K5 theme cap: nine tiers, and not a tenth (九重天之制).
	canReset() {
		return tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt) && player[this.layer].points.lt(TUNING.yCap)
	},

	// static semantics inverted: gainMult < 1 = cheaper tiers.
	gainMult() {
		let m = new Decimal(1)
		if (hasUpgrade("y", 11)) m = m.times(0.9)
		if (hasUpgrade("y", 12)) m = m.times(0.9)
		if (hasUpgrade("y", 13)) m = m.times(0.95)
		if (hasUpgrade("y", 15)) m = m.times(0.9)
		if (hasUpgrade("y", 23)) m = m.times(upgradeEffect("y", 23))
		if (hasMilestone("s", 4)) m = m.times(0.9)
		if (hasMilestone("f", 3)) m = m.times(0.9)
		if (hasUpgrade("y", 24)) m = m.times(0.8)
		return m
	},
	gainExp() {
		if (hasUpgrade("y", 22)) return new Decimal(1.15)
		return new Decimal(1)
	},

	layerShown() { return true },
	tooltip() { return L("上云：九山礼换云阶，九重止。", "Ascend: tributes into cloud tiers — nine, and no more.") },
	tooltipLocked() { return L("需 " + format(TUNING.yReq) + " 九山礼", "Requires " + format(TUNING.yReq) + " tributes") },

	autoPrestige() {
		if (hasMilestone("y", 1)) return true
		return false
	},
	// N-AUTOWIPE: gate {y:1} == resetsNothing set {y:1}.
	resetsNothing() {
		if (hasMilestone("y", 1)) return true
		return false
	},

	doReset(resettingLayer) {
		let kept = ["best", "total"]
		if (hasMilestone("y", 2)) kept.push("upgrades")
		layerDataReset(this.layer, kept)
	},

	hotkeys: [
		{ key: "y",
		  description: function() { return L("Y：上云阶，换云阶", "Y: ascend the tiers for tiers") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],

	upgrades: {
		11: {
			title: function() { return L("云梯·一", "Cloud Ladder, First") },
			description: function() { return L("云阶层价 ×0.9。", "Tier price ×0.9.") },
			cost: new Decimal(1),
			effect() { return new Decimal(0.9) },
			effectDisplay() { return "×0.9" },
		},
		12: {
			title: function() { return L("云梯·二", "Cloud Ladder, Second") },
			description: function() { return L("云阶层价 ×0.9。", "Tier price ×0.9.") },
			cost: new Decimal(2),
			unlocked() { return hasUpgrade(this.layer, 11) },
			effect() { return new Decimal(0.9) },
			effectDisplay() { return "×0.9" },
		},
		13: {
			title: function() { return L("云影", "Cloud Shadow") },
			description: function() { return L("云阶层价 ×0.95。", "Tier price ×0.95.") },
			cost: new Decimal(4),
			unlocked() { return hasUpgrade(this.layer, 12) },
			effect() { return new Decimal(0.95) },
			effectDisplay() { return "×0.95" },
		},
		14: {
			title: function() { return L("云阶要略", "Tier Briefing") },
			description: function() { return L("开启「云端要略」页签。", "Unlocks the cloud briefing sub-tab.") },
			cost: new Decimal(5),
			unlocked() { return hasUpgrade(this.layer, 13) },
		},
		15: {
			title: function() { return L("轻云", "Light Cloud") },
			description: function() { return L("云阶层价 ×0.9。", "Tier price ×0.9.") },
			cost: new Decimal(6),
			unlocked() { return hasUpgrade(this.layer, 14) },
			effect() { return new Decimal(0.9) },
			effectDisplay() { return "×0.9" },
		},
		21: {
			title: function() { return L("云气", "Cloud Breath") },
			description: function() { return L("山道里程 ×10。", "Path gain ×10.") },
			cost: new Decimal(7),
			unlocked() { return hasUpgrade(this.layer, 15) },
		},
		22: {
			title: function() { return L("云梯诀", "Ladder Sutra") },
			description: function() { return L("云阶层价（exponent）×1.15（更廉）。", "Tier price exponent ×1.15 (cheaper).") },
			cost: new Decimal(7),
			unlocked() { return hasUpgrade(this.layer, 21) },
			effect() { return new Decimal(1.15) },
			effectDisplay() { return "×1.15" },
		},
		23: {
			title: function() { return L("云梯·三", "Cloud Ladder, Third") },
			description: function() { return L("云阶层价 ×0.9。", "Tier price ×0.9.") },
			cost: new Decimal(8),
			unlocked() { return hasUpgrade(this.layer, 22) },
			effect() { return new Decimal(0.9) },
			effectDisplay() { return "×0.9" },
		},
		24: {
			title: function() { return L("敬山已毕", "The Rite Is Done") },
			description: function() { return L("绝顶之礼既周，云阶层价再 ×0.8。", "With the mountain rite complete: tier price another ×0.8.") },
			cost: new Decimal(8),
			unlocked() { return hasUpgrade(this.layer, 23) },
		},
		25: {
			title: function() { return L("云中之花", "Blossom Among Clouds") },
			description: function() { return L("开启「长命百岁」显影（需九峰之序）。", "Brings the hundred-year title into view (needs the nine-peak order).") },
			cost: new Decimal(9),
			unlocked() { return hasUpgrade(this.layer, 24) },
		},
		31: {
			title: function() { return L("云气归山", "Breath Returns to the Mountain") },
			description: function() { return L("山道里程 ×（云阶 + 1）^0.2（以九山礼计）。", "Path gain ×(tiers+1)^0.2 (priced in tributes).") },
			cost: new Decimal("1e4"),
			currencyDisplayName: function() { return L("九山礼", "tributes") },
			currencyLayer: "f",
			currencyInternalName: "points",
			unlocked() { return hasUpgrade("y", 25) },
			effect() { return player[this.layer].points.add(1).pow(0.2) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		45: {
			title: function() { return L("长命百岁", "A Hundred Years of Health") },
			description: function() { return L("九重云阶之上，为长者祝寿。山色依旧，可继续登高。", "Above the ninth tier, a hundred years are wished for the elders. The mountain stands as it was; keep climbing.") },
			cost: new Decimal(TUNING.yFinaleCost),
			currencyDisplayName: function() { return L("九山礼", "tributes") },
			currencyLayer: "f",
			currencyInternalName: "points",
			unlocked() { return hasMilestone("f", 9) && player.y.points.gte(8) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function() { return L("云阶峰值 ≥ 1", "best tiers ≥ 1") },
			effectDescription: function() { return L("上得天阶：编年「敬山」一章得录。", "The first tier: the chronicle's rite chapter is recorded.") },
			done() { return player[this.layer].best.gte(1) },
		},
		1: {
			requirementDescription: function() { return L("云阶峰值 ≥ 4", "best tiers ≥ 4") },
			unlocked() { return hasMilestone(this.layer, 0) },
			effectDescription: function() { return L("云端自动上阶（静层之道：护旧＋自祭）。", "The tiers climb on their own (the static idiom: keep-and-auto).") },
			done() { return player[this.layer].best.gte(TUNING.yM1) },
		},
		2: {
			requirementDescription: function() { return L("云阶峰值 ≥ 7", "best tiers ≥ 7") },
			unlocked() { return hasMilestone(this.layer, 1) },
			effectDescription: function() { return L("云端之阶留存（自动购阶开启）。", "The tiers' steps are kept (auto-buy of the ladder opens).") },
			done() { return player[this.layer].best.gte(7) },
		},
	},

	tabFormat: [
		["display-text", function() {
			let full = player.y.points.gte(TUNING.yCap)
			return L("云阶 <b>" + formatWhole(player.y.points) + " / " + TUNING.yCap + "</b>" + (full ? "（<i>九重已满</i>）" : "") +
				"<br>九山礼 " + format(tmp.y.baseAmount) +
				((hasMilestone("f", 7) || hasUpgrade("y", 25)) ? "<br><i>「长命百岁」显影：需云阶≥8、九山礼 " + format(TUNING.yFinaleCost) + "</i>" : ""),
				"tiers <b>" + formatWhole(player.y.points) + " / " + TUNING.yCap + "</b>" + (full ? " (<i>nine reached</i>)" : "") +
				"<br>tributes " + format(tmp.y.baseAmount) +
				((hasMilestone("f", 7) || hasUpgrade("y", 25)) ? "<br><i>「A Hundred Years」 in view: needs tiers ≥ 8, " + format(TUNING.yFinaleCost) + " tributes</i>" : ""))
		}],
		"prestige-button",
		["microtabs", "yd"],
	],
	microtabs: {
		"yd": {
			"云阶": {
				content: ["upgrades", [11, 12, 13, 14, 15, 21, 22, 23, 24, 25, 31, 45]],
			},
			"云端要略": {
				unlocked() { return hasUpgrade("y", 14) },
				content: [
					["display-text", function() {
						return L("阶价 = " + format(TUNING.yReq) + " × 2^阶 × 倍率（" + format(tmp.y.gainMult) + "）<br>下一阶需九山礼 " + format(tmp.y.nextAt) + "<br>上限：恰九重（九重天之制）",
							"tier price = " + format(TUNING.yReq) + " × 2^tiers × mult (" + format(tmp.y.gainMult) + ")<br>next tier needs " + format(tmp.y.nextAt) + " tributes<br>ceiling: exactly nine (the canon of the heavens)")
					}],
				],
			},
			"里程碑": {
				content: ["milestones", [0, 1, 2]],
			},
		},
	},
})
