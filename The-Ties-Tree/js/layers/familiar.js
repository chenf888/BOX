/* =========================================================================
 *  熟人 / Acquaintance  —  row 1, position 0.
 *  The first branch off 寒暄. Owns the first half of the automation ladder
 *  and keeps 寒暄 alive across its own resets.
 * ========================================================================= */

addLayer("familiar", {
	name: t("familiar.name", "熟人"),
	symbol: t("familiar.symbol", "熟人"),
	color: "#8fd6b4",
	resource: t("familiar.resource", "熟人"),
	row: 1,
	position: 0,

	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
		}
	},

	baseResource: t("chat.resource", "寒暄"),
	baseAmount() { return player.chat.points },
	requires: new Decimal(250),

	type: "normal",
	exponent: 1 / 3,

	gainMult() {
		let ret = new Decimal(1)
		if (hasUpgrade("familiar", 13)) ret = ret.times(upgradeEffect("familiar", 13))

		if (hasMilestone("familiar", 4)) ret = ret.times(2)
		if (hasUpgrade("familiar", 25)) ret = ret.times(2)

		// 朋友 and 知己 both reach back into 熟人 (P10)
		if (hasUpgrade("trust", 13)) ret = ret.times(upgradeEffect("trust", 13))
		if (hasUpgrade("trust", 23)) ret = ret.times(upgradeEffect("trust", 23))
		if (hasUpgrade("trust", 24)) ret = ret.times(2)
		if (hasMilestone("trust", 3)) ret = ret.times(1.5)
		if (hasUpgrade("closer", 23)) ret = ret.times(upgradeEffect("closer", 23))
		if (hasMilestone("closer", 2)) ret = ret.times(1.5)
		if (hasUpgrade("circle", 23)) ret = ret.times(upgradeEffect("circle", 23))
		if (hasMilestone("circle", 2)) ret = ret.times(1.5)

		if (hasAchievement("achievements", 13)) ret = ret.times(2)
		if (hasAchievement("achievements", 24)) ret = ret.times(2)
		if (hasAchievement("achievements", 31)) ret = ret.times(2)
		if (hasAchievement("achievements", 32)) ret = ret.times(2)
		if (hasAchievement("achievements", 34)) ret = ret.times(2)
		if (hasChallenge("trust", 11)) ret = ret.times(1.5)

		if (inChallenge("familiar", 11)) ret = ret.div(2)

		return ret
	},

	passiveGeneration() { return hasMilestone("closer", 1) ? 0.1 : 0 },

	/** Automation step 1: once you know how to keep people, resetting 熟人
	 *  stops wiping the layers below it. */
	resetsNothing() { return hasMilestone(this.layer, 0) },
	autoPrestige() { return hasMilestone(this.layer, 0) && hasMilestone("circle", 0) },

	doReset(resettingLayer) {
		if (layers[resettingLayer].row > layers[this.layer].row)
			layerDataReset(this.layer, ["unlocked", "best", "total", "upgrades", "milestones"])
	},

	hotkeys: [
		{
			key: "a",
			description: () => t("familiar.hotkey", "A: reset for 熟人"),
			onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],

	tabFormat: [
		["display-text", function () { return mainAmount("familiar", false) }],
		"prestige-button",
		["display-text", function () {
			return t("familiar.ctx.have") + " <b>" + format(player.familiar.points) + "</b> " + t("familiar.ctx.units")
		}],
		["display-text", function () {
			return t("familiar.ctx.best") + " <b>" + format(player.familiar.best) + "</b>"
				+ " &nbsp;|&nbsp; " + t("familiar.ctx.need") + " <b>" + format(250) + "</b> " + t("chat.ctx.units")
		}],
		["display-text", function () {
			if (!shiftDown) return ""
			return "<span style='opacity:.6'>" + t("familiar.ctx.formula")
				+ ": (" + format(player.chat.points) + " / 250)<sup>1/3</sup> × "
				+ format(tmp.familiar.gainMult) + " → " + format(tmp.familiar.resetGain) + "</span>"
		}],
		["microtabs", "stuff"],
	],

	microtabs: {
		stuff: {
			[t("tab.upgrades", "升级")]: {
				unlocked() { return true },
				content: [["blank", "15px"], "upgrades"],
				buttonStyle() { return { "background-color": "#26433a" } },
			},
			[t("tab.challenges", "挑战")]: {
				unlocked() { return hasUpgrade("familiar", 15) },
				content: [["blank", "10px"], "challenges"],
				buttonStyle() { return { "background-color": "#5a2a2a" } },
			},
			[t("tab.milestones", "里程碑")]: {
				unlocked() { return true },
				content: [["blank", "10px"], "milestones"],
			},
		},
	},

	upgrades: {
		11: {
			title: t("familiar.up11.t", "脸熟"),
			description: t("familiar.up11.d", "话头生成 ×4。"),
			cost: new Decimal(2),
			unlocked() { return player.familiar.unlocked },
		},
		12: {
			title: t("familiar.up12.t", "有共同朋友"),
			description: t("familiar.up12.d", "寒暄收益 ×3。"),
			cost: new Decimal(12),
			unlocked() { return hasUpgrade("familiar", 11) },
		},
		13: {
			title: t("familiar.up13.t", "越混越熟"),
			description: t("familiar.up13.d", "寒暄越高，熟人收益涨得越快。"),
			cost: new Decimal(80),
			unlocked() { return hasUpgrade("familiar", 12) },
			effect() { return player.chat.points.add(100).log10().pow(1.1).max(2) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		14: {
			title: t("familiar.up14.t", "记得住生日"),
			description: t("familiar.up14.d", "寒暄收益 ×2。"),
			cost: new Decimal(600),
			unlocked() { return hasUpgrade("familiar", 13) },
		},
		15: {
			title: t("familiar.up15.t", "敢约出来"),
			description: t("familiar.up15.d", "解锁「挑战」标签页。"),
			cost: new Decimal(25),
			unlocked() { return hasUpgrade("familiar", 14) },
		},
		21: {
			title: t("familiar.up21.t", "有地方可去"),
			description: t("familiar.up21.d", "话头生成 × 话头的对数。"),
			cost: new Decimal(3e4),
			unlocked() { return player.chat.best.gte(2500) },
			effect() { return player.points.add(10).log10().pow(0.9).max(2) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		22: {
			title: t("familiar.up22.t", "朋友带朋友"),
			description: t("familiar.up22.d", "寒暄收益 × 交情的五次方根（朋友越多，寒暄越值钱）。"),
			cost: new Decimal(2.5e5),
			unlocked() { return player.trust.unlocked },
			effect() { return player.trust.points.add(1).pow(0.2).max(1.5) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		23: {
			title: t("familiar.up23.t", "名单越来越长"),
			description: t("familiar.up23.d", "寒暄收益 ×5。"),
			cost: new Decimal(2e6),
			unlocked() { return hasUpgrade("familiar", 22) },
		},
		24: {
			title: t("familiar.up24.t", "换个地方约"),
			description: t("familiar.up24.d", "倾听需要的 话头 降低 20%。"),
			cost: new Decimal(1.5e7),
			unlocked() { return hasUpgrade("familiar", 23) },
		},
		25: {
			title: t("familiar.up25.t", "混成一片"),
			description: t("familiar.up25.d", "熟人收益 ×2；寒暄里程碑 3 变成「倾听需要的 话头 再降 25%」。"),
			cost: new Decimal(1.2e8),
			unlocked() { return hasUpgrade("familiar", 24) },
		},
	},

	milestones: {
		0: {
			requirementDescription: t("familiar.ms0.r", "寒暄最佳记录 200"),
			effectDescription: t("familiar.ms0.e", "重置熟人不再清空下面的东西。"),
			done() { return player.chat.best.gte(200) },
		},
		1: {
			requirementDescription: t("familiar.ms1.r", "熟人最佳记录 1"),
			effectDescription: t("familiar.ms1.e", "寒暄会自己慢慢长（自动寒暄）。"),
			unlocked() { return hasMilestone("familiar", 0) },
			done() { return player.familiar.best.gte(1) },
		},
		2: {
			requirementDescription: t("familiar.ms2.r", "熟人最佳记录 25"),
			effectDescription: t("familiar.ms2.e", "话头生成 ×3，寒暄收益 ×1.5。"),
			unlocked() { return hasMilestone("familiar", 1) },
			done() { return player.familiar.best.gte(25) },
		},
		3: {
			requirementDescription: t("familiar.ms3.r", "寒暄最佳记录 1e4"),
			effectDescription: t("familiar.ms3.e", "寒暄的升级从此不再被上层重置清空。"),
			unlocked() { return hasMilestone("familiar", 2) },
			done() { return player.chat.best.gte(1e4) },
		},
		4: {
			requirementDescription: t("familiar.ms4.r", "熟人最佳记录 1000"),
			effectDescription: t("familiar.ms4.e", "熟人收益 ×2。"),
			unlocked() { return hasMilestone("familiar", 3) },
			done() { return player.familiar.best.gte(1000) },
		},
	},

	challenges: {
		11: {
			name: t("familiar.ch11.n", "长期不联系"),
			challengeDescription: function () {
				return t("familiar.ch11.d", "寒暄的自动生长停止，熟人收益减半。<br>奖励：熟人收益 ×1.5，寒暄收益 ×1.5。<br>完成次数 ")
					+ challengeCompletions(this.layer, this.id) + " / " + this.completionLimit
			},
			goalDescription: t("familiar.ch11.g", "在不联系的状态下攒到 500 熟人"),
			canComplete() { return inChallenge(this.layer, this.id) && player.familiar.best.gte(500) },
			rewardDescription: t("familiar.ch11.r", "熟人收益 ×1.5，寒暄收益 ×1.5（永久）。"),
			completionLimit: 1,
			unlocked() { return hasUpgrade("familiar", 15) },
		},
	},

	buyables: {
		11: {
			title: t("familiar.buy11.t", "固定的局"),
			cost(x) { return Decimal.pow(2.5, x).mul(30) },
			effect(x) { return Decimal.pow(2.5, x).mul(0.5) },
			display() {
				let data = tmp[this.layer].buyables[this.id]
				return t("familiar.buy11.d", "寒暄收益") + " <b>+" + format(data.effect) + "</b>×<br>"
					+ t("common.cost") + " " + format(data.cost) + " " + t("familiar.ctx.units")
					+ "<br>" + t("common.level") + " " + formatWhole(data.amount)
			},
			canAfford() { return player.familiar.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				let cost = tmp[this.layer].buyables[this.id].cost
				player.familiar.points = player.familiar.points.sub(cost)
				player.familiar.buyables[this.id] = player.familiar.buyables[this.id].add(1)
				player.familiar.spentOnBuyables = player.familiar.spentOnBuyables.add(cost)
			},
			unlocked() { return player.familiar.best.gte(10) },
		},
	},
})
