/* =========================================================================
 *  朋友 / Friend  —  row 1, position 1. The second branch off 寒暄.
 *  Hosts 默契 (rapport), the layer's own secondary currency, produced in
 *  update() and spent by its own buyables — mechanic M5.
 * ========================================================================= */

/** 默契 produced per second. Sublinear by construction: nothing here can run away. */
function trustRapportRate() {
	let ret = new Decimal(0.2)
	if (hasUpgrade("trust", 24)) ret = ret.times(3)
	if (hasMilestone("trust", 3)) ret = ret.times(1.5)
	if (hasUpgrade("closer", 24)) ret = ret.times(2)
	ret = ret.times(player.trust.points.add(1).log10().add(1).pow(0.5))
	return ret
}

addLayer("trust", {
	name: t("trust.name", "朋友"),
	symbol: t("trust.symbol", "朋友"),
	color: "#e0b070",
	resource: t("trust.resource", "交情"),
	row: 1,
	position: 1,

	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			rapport: new Decimal(0),      // 默契 — secondary currency (M5)
			rapportTotal: new Decimal(0),
		}
	},

	baseResource: t("chat.resource", "寒暄"),
	baseAmount() { return player.chat.points },
	requires: new Decimal(400),

	type: "normal",
	exponent: 1 / 3,

	gainMult() {
		let ret = new Decimal(1)
		if (hasUpgrade("trust", 14)) ret = ret.times(2)
		if (hasUpgrade("trust", 25)) ret = ret.times(2)
		if (hasMilestone("trust", 4)) ret = ret.times(2)

		if (hasUpgrade("closer", 15)) ret = ret.times(2)
		if (hasUpgrade("closer", 24)) ret = ret.times(upgradeEffect("closer", 24))
		if (hasUpgrade("closer", 25)) ret = ret.times(3)
		if (hasMilestone("closer", 3)) ret = ret.times(2)
		if (hasUpgrade("circle", 24)) ret = ret.times(upgradeEffect("circle", 24))
		if (hasUpgrade("circle", 25)) ret = ret.times(3)
		if (hasMilestone("circle", 2)) ret = ret.times(1.5)
		if (hasMilestone("circle", 3)) ret = ret.times(2)

		if (hasAchievement("achievements", 14)) ret = ret.times(2)
		if (hasAchievement("achievements", 25)) ret = ret.times(2)
		if (hasAchievement("achievements", 32)) ret = ret.times(2)
		if (hasAchievement("achievements", 34)) ret = ret.times(2)

		if (inChallenge("trust", 11)) ret = ret.div(2.5)

		return ret
	},

	/** 默契 grows on its own while you play. addPoints is not used here — 默契
	 *  is not a prestige currency and must not touch best/total. */
	update(diff) {
		if (!player.trust.unlocked) return
		let rate = trustRapportRate()
		if (hasUpgrade("trust", 23)) rate = rate.times(upgradeEffect("trust", 23))
		let gain = rate.times(diff)
		if (inChallenge("trust", 11)) gain = gain.div(2)
		player.trust.rapport = player.trust.rapport.add(gain)
		player.trust.rapportTotal = player.trust.rapportTotal.add(gain)
	},

	resetsNothing() { return hasMilestone(this.layer, 0) },
	autoPrestige() { return hasMilestone(this.layer, 0) && hasMilestone("circle", 1) },

	doReset(resettingLayer) {
		if (layers[resettingLayer].row > layers[this.layer].row)
			layerDataReset(this.layer, [
				"unlocked", "best", "total", "upgrades", "milestones",
				"rapport", "rapportTotal",
			])
	},

	hotkeys: [
		{
			key: "f",
			description: () => t("trust.hotkey", "F: reset for 交情"),
			onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],

	tabFormat: [
		["display-text", function () { return mainAmount("trust", false) }],
		"prestige-button",
		["display-text", function () {
			return t("trust.ctx.have") + " <b>" + format(player.trust.points) + "</b> " + t("trust.ctx.units")
		}],
		["display-text", function () {
			return t("trust.ctx.best") + " <b>" + format(player.trust.best) + "</b>"
				+ " &nbsp;|&nbsp; " + t("trust.ctx.need") + " <b>" + format(400) + "</b> " + t("chat.ctx.units")
		}],
		["display-text", function () {
			if (!shiftDown) return ""
			return "<span style='opacity:.6'>" + t("trust.ctx.formula")
				+ ": (" + format(player.chat.points) + " / 400)<sup>1/3</sup> × "
				+ format(tmp.trust.gainMult) + " → " + format(tmp.trust.resetGain) + "</span>"
		}],
		["microtabs", "stuff"],
	],

	microtabs: {
		stuff: {
			[t("tab.upgrades", "升级")]: {
				unlocked() { return true },
				content: [["blank", "15px"], "upgrades"],
				buttonStyle() { return { "background-color": "#4a3a24" } },
			},
			[t("tab.rapport", "默契")]: {
				unlocked() { return hasUpgrade("trust", 15) },
				content: [
					["blank", "10px"],
					["display-text", function () {
						return "<h2 style='color:#e0b070'>" + t("trust.rap.title") + ": "
							+ format(player.trust.rapport) + "</h2>"
					}],
					["display-text", function () {
						let r = trustRapportRate()
						if (hasUpgrade("trust", 23)) r = r.times(upgradeEffect("trust", 23))
						return t("trust.rap.rate") + " <b>" + format(r) + "</b>/秒"
					}],
					["blank", "10px"],
					"clickables",
					["blank", "10px"],
					"buyables",
					["blank", "10px"],
					["display-text", function () {
						return t("trust.rap.note")
					}],
				],
				buttonStyle() { return { "background-color": "#5c4520" } },
			},
			[t("tab.challenges", "挑战")]: {
				unlocked() { return hasUpgrade("trust", 25) },
				content: [["blank", "10px"], "challenges"],
				buttonStyle() { return { "background-color": "#5a2a2a" } },
			},
			[t("tab.milestones", "里程碑")]: {
				unlocked() { return true },
				content: [["blank", "10px"], "milestones"],
			},
		},
	},

	clickables: {
		31: {
			title: t("trust.click31.t", "攒一次局"),
			display() {
				return t("trust.click31.d") + "<br>" + t("common.cost") + " <b>"
					+ format(new Decimal(100).times(player.trust.points.add(1).log10().add(1).pow(0.5).mul(10)))
					+ "</b> " + t("trust.ctx.units")
			},
			canClick() {
				if (!player.trust.unlocked) return false
				let cost = new Decimal(100).times(player.trust.points.add(1).log10().add(1).pow(0.5).mul(10))
				return player.trust.rapport.gte(cost)
			},
			onClick() {
				let cost = new Decimal(100).times(player.trust.points.add(1).log10().add(1).pow(0.5).mul(10))
				if (player.trust.rapport.lt(cost)) return
				player.trust.rapport = player.trust.rapport.sub(cost)
				addPoints("trust", cost.times(2))
			},
			style() { return { "background-color": "#6b5024" } },
		},
	},

	upgrades: {
		11: {
			title: t("trust.up11.t", "有话直说"),
			description: t("trust.up11.d", "话头生成 ×6。"),
			cost: new Decimal(5),
			unlocked() { return player.trust.unlocked },
		},
		12: {
			title: t("trust.up12.t", "愿意接你的梗"),
			description: t("trust.up12.d", "寒暄收益 ×3。"),
			cost: new Decimal(40),
			unlocked() { return hasUpgrade("trust", 11) },
		},
		13: {
			title: t("trust.up13.t", "聊得来"),
			description: t("trust.up13.d", "寒暄越高，熟人收益涨得越快。"),
			cost: new Decimal(300),
			unlocked() { return hasUpgrade("trust", 12) },
			effect() { return player.chat.points.add(1000).log10().pow(1.15).max(2) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		14: {
			title: t("trust.up14.t", "一个电话就通"),
			description: t("trust.up14.d", "交情收益 ×2。"),
			cost: new Decimal(2500),
			unlocked() { return hasUpgrade("trust", 13) },
		},
		15: {
			title: t("trust.up15.t", "不用找话题"),
			description: t("trust.up15.d", "解锁「默契」——朋友之间不用说话也懂的那部分。"),
			cost: new Decimal(15000),
			unlocked() { return hasUpgrade("trust", 14) },
		},
		21: {
			title: t("trust.up21.t", "见得多"),
			description: t("trust.up21.d", "话头生成 × 话头的对数。"),
			cost: new Decimal(1.2e5),
			unlocked() { return hasUpgrade("trust", 15) },
			effect() { return player.points.add(10).log10().pow(0.8).max(2) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		22: {
			title: t("trust.up22.t", "互相认得的人"),
			description: t("trust.up22.d", "寒暄收益 × 交情的对数。"),
			cost: new Decimal(1e6),
			unlocked() { return hasUpgrade("trust", 21) },
			effect() { return player.trust.points.add(10).log10().pow(0.6).max(1.5) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		23: {
			title: t("trust.up23.t", "不用解释"),
			description: t("trust.up23.d", "默契产出 × 交情的对数。"),
			cost: new Decimal(8e6),
			unlocked() { return hasUpgrade("trust", 22) },
			effect() { return player.trust.points.add(10).log10().pow(0.8).max(2) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		24: {
			title: t("trust.up24.t", "默契的默契"),
			description: t("trust.up24.d", "默契产出 ×3。"),
			cost: new Decimal(6e7),
			unlocked() { return hasUpgrade("trust", 23) },
		},
		25: {
			title: t("trust.up25.t", "交心"),
			description: t("trust.up25.d", "默契累计超过 1000 后，交情收益 ×2；解锁「挑战」。"),
			cost: new Decimal(5e8),
			unlocked() { return hasUpgrade("trust", 24) },
		},
	},

	milestones: {
		0: {
			requirementDescription: t("trust.ms0.r", "寒暄最佳记录 400"),
			effectDescription: t("trust.ms0.e", "重置朋友不再清空下面的东西。知己这条线开了。"),
			done() { return player.chat.best.gte(400) },
			onComplete() { player.closer.unlocked = true },
		},
		1: {
			requirementDescription: t("trust.ms1.r", "交情最佳记录 20"),
			effectDescription: t("trust.ms1.e", "寒暄可以自动重置。社交圈这条线开了。"),
			unlocked() { return hasMilestone("trust", 0) },
			done() { return player.trust.best.gte(20) },
			onComplete() { player.circle.unlocked = true },
		},
		2: {
			requirementDescription: t("trust.ms2.r", "交情最佳记录 100"),
			effectDescription: t("trust.ms2.e", "话头生成 ×4，寒暄收益 ×1.4。"),
			unlocked() { return hasMilestone("trust", 1) },
			done() { return player.trust.best.gte(100) },
		},
		3: {
			requirementDescription: t("trust.ms3.r", "默契累计 100"),
			effectDescription: t("trust.ms3.e", "默契产出 ×1.5。"),
			unlocked() { return hasMilestone("trust", 2) },
			done() { return player.trust.rapportTotal.gte(100) },
		},
		4: {
			requirementDescription: t("trust.ms4.r", "交情最佳记录 5000"),
			effectDescription: t("trust.ms4.e", "交情收益 ×2。"),
			unlocked() { return hasMilestone("trust", 3) },
			done() { return player.trust.best.gte(5000) },
		},
	},

	challenges: {
		11: {
			name: t("trust.ch11.n", "已读不回"),
			challengeDescription: function () {
				return t("trust.ch11.d", "交情收益 ÷2.5，默契产出减半。<br>奖励：交情收益 ×3。<br>完成次数 ")
					+ challengeCompletions(this.layer, this.id) + " / " + this.completionLimit
			},
			goalDescription: t("trust.ch11.g", "在被已读不回的状态下攒到 2e4 交情"),
			canComplete() { return inChallenge(this.layer, this.id) && player.trust.best.gte(2e4) },
			rewardDescription: t("trust.ch11.r", "交情收益 ×3，话头生成 ×3（永久）。"),
			completionLimit: 2,
			unlocked() { return hasUpgrade("trust", 25) },
		},
	},

	buyables: {
		respec() {
			player.trust.rapport = player.trust.rapport.add(player.trust.spentOnBuyables)
			doReset(this.layer, true)
		},
		respecText: t("trust.respec", "重置默契消费"),
		respecMessage: t("trust.respec.msg", "把花在默契上的东西全部要回来？"),

		11: {
			title: t("trust.buy11.t", "一起吃饭"),
			cost(x) { return Decimal.pow(2, x.pow(1.1)).mul(20) },
			effect(x) { return Decimal.pow(2, x.pow(0.9)).mul(0.5) },
			display() {
				let data = tmp[this.layer].buyables[this.id]
				return t("trust.buy11.d", "交情收益") + " <b>+" + format(data.effect) + "</b>×<br>"
					+ t("common.cost") + " " + format(data.cost) + " " + t("trust.rap.name")
					+ "<br>" + t("common.level") + " " + formatWhole(data.amount)
			},
			canAfford() { return player.trust.rapport.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				let cost = tmp[this.layer].buyables[this.id].cost
				player.trust.rapport = player.trust.rapport.sub(cost)
				player.trust.buyables[this.id] = player.trust.buyables[this.id].add(1)
				player.trust.spentOnBuyables = player.trust.spentOnBuyables.add(cost)
			},
			unlocked() { return hasUpgrade("trust", 15) },
		},
		21: {
			title: t("trust.buy21.t", "半夜发消息"),
			cost(x) { return Decimal.pow(2, x.pow(1.15)).mul(400) },
			effect(x) { return Decimal.pow(2, x.pow(0.8)).mul(0.25) },
			display() {
				let data = tmp[this.layer].buyables[this.id]
				return t("trust.buy21.d", "寒暄收益") + " <b>+" + format(data.effect) + "</b>×<br>"
					+ t("common.cost") + " " + format(data.cost) + " " + t("trust.rap.name")
					+ "<br>" + t("common.level") + " " + formatWhole(data.amount)
			},
			canAfford() { return player.trust.rapport.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				let cost = tmp[this.layer].buyables[this.id].cost
				player.trust.rapport = player.trust.rapport.sub(cost)
				player.trust.buyables[this.id] = player.trust.buyables[this.id].add(1)
				player.trust.spentOnBuyables = player.trust.spentOnBuyables.add(cost)
			},
			unlocked() { return hasUpgrade("trust", 22) },
		},
	},
})
