/* =========================================================================
 *  layers/passages.js — 篇章 / Passages  (row 3, normal)
 *
 *  Sentences become paragraphs. Passages are the last currency before the
 *  library, and the first milestone turns the word trickle on.
 * ========================================================================= */

function passagesGainMult() {
	let ret = new Decimal(1)
	if (hasUpgrade("passages", 11)) ret = ret.times(3)
	if (hasUpgrade("passages", 12)) ret = ret.times(2)
	if (hasUpgrade("passages", 14)) ret = ret.times(2)
	if (hasUpgrade("passages", 21)) ret = ret.times(player.words.points.add(1).log10().add(1).pow(0.15))
	if (hasUpgrade("passages", 22) && player.passages.points.gte(1e6)) ret = ret.times(3)
	if (hasUpgrade("passages", 24)) ret = ret.times(2)
	if (hasUpgrade("passages", 25)) ret = ret.times(2)

	if (hasUpgrade("words", 31)) ret = ret.times(2)
	if (hasUpgrade("music", 23)) ret = ret.times(2)

	if (hasMilestone("passages", 1)) ret = ret.times(10)
	if (hasMilestone("passages", 2)) ret = ret.times(10)
	if (hasMilestone("library", 1)) ret = ret.times(5)

	if (getBuyableAmount("passages", 11).gt(0)) ret = ret.times(buyableEffect("passages", 11))
	if (getBuyableAmount("words", 12).gt(0)) ret = ret.times(buyableEffect("words", 12))
	ret = ret.times(achievementBoost())
	return ret
}

addLayer("passages", {
	name: function () { return t("passages.name") },
	symbol: function () { return t("passages.symbol") },
	position: 1,
	row: 3,

	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
		}
	},

	color: "#d98c8c",
	resource: function () { return t("passages.resource") },
	baseResource: function () { return t("passages.baseResource") },
	baseAmount() { return player.words.points },
	requires: new Decimal(TUNING.REQ.passages),
	type: "normal",
	exponent: 0.25,

	softcap() {
		if (hasUpgrade("passages", 23)) return new Decimal(TUNING.SOFT.passagesRaise)
		return new Decimal(TUNING.SOFT.passages)
	},
	softcapPower: TUNING.SOFT_POWER,

	gainMult() { return passagesGainMult() },
	gainExp() { return new Decimal(1) },

	passiveGeneration() {
		if (hasMilestone("library", 0) || hasAchievement("ach", 39)) return 1
		return 0
	},
	autoPrestige() {
		if (hasMilestone("passages", 3)) return true
		return false
	},
	resetsNothing() {
		if (hasMilestone("passages", 3)) return true
		return false
	},
	autoUpgrade() {
		if (hasMilestone("passages", 2)) return true
		return false
	},

	layerShown() {
		return player.passages.unlocked || player.words.points.gte(TUNING.REQ.passages)
	},

	prestigeButtonText() {
		return t("passages.button") + ' <b>' + num(tmp.passages.resetGain) + '</b> ' + t("passages.resource")
	},

	doReset(resettingLayer) {
		if (layers[resettingLayer].row > this.row) {
			layerDataReset(this.layer, [
				"unlocked", "best", "total", "upgrades", "milestones", "buyables",
			])
		}
	},

	upgrades: {
		11: {
			title: function () { return t("passages.up11.t") },
			description: function () { return t("passages.up11.d") },
			cost: new Decimal(TUNING.UPG_COSTS.passages[11]),
			effect() { return new Decimal(3) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		12: {
			title: function () { return t("passages.up12.t") },
			description: function () { return t("passages.up12.d") },
			cost: new Decimal(TUNING.UPG_COSTS.passages[12]),
			effect() { return player.passages.points.add(1).pow(0.1) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		13: {
			title: function () { return t("passages.up13.t") },
			description: function () { return t("passages.up13.d") },
			cost: new Decimal(TUNING.UPG_COSTS.passages[13]),
			effect() { return player.words.points.add(1).pow(0.1) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		14: {
			title: function () { return t("passages.up14.t") },
			description: function () { return t("passages.up14.d") },
			cost: new Decimal(TUNING.UPG_COSTS.passages[14]),
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		15: {
			title: function () { return t("passages.up15.t") },
			description: function () { return t("passages.up15.d") },
			cost: new Decimal(TUNING.UPG_COSTS.passages[15]),
		},
		21: {
			title: function () { return t("passages.up21.t") },
			description: function () { return t("passages.up21.d") },
			cost: new Decimal(TUNING.UPG_COSTS.passages[21]),
			unlocked() { return hasUpgrade("passages", 15) },
			effect() { return player.words.points.add(1).log10().add(1).pow(0.15) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		22: {
			title: function () { return t("passages.up22.t") },
			description: function () { return t("passages.up22.d") },
			cost: new Decimal(TUNING.UPG_COSTS.passages[22]),
			unlocked() { return hasUpgrade("passages", 15) },
		},
		23: {
			title: function () { return t("passages.up23.t") },
			description: function () { return t("passages.up23.d") },
			cost: new Decimal(TUNING.UPG_COSTS.passages[23]),
			unlocked() { return hasUpgrade("passages", 15) },
		},
		24: {
			title: function () { return t("passages.up24.t") },
			description: function () { return t("passages.up24.d") },
			cost: new Decimal(TUNING.UPG_COSTS.passages[24]),
			unlocked() { return hasUpgrade("passages", 15) },
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		25: {
			title: function () { return t("passages.up25.t") },
			description: function () { return t("passages.up25.d") },
			cost: new Decimal(TUNING.UPG_COSTS.passages[25]),
			unlocked() { return hasUpgrade("passages", 15) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function () { return t("passages.ms0.r") },
			effectDescription: function () { return t("passages.ms0.e") },
			done() { return player.passages.best.gte(10) },
		},
		1: {
			requirementDescription: function () { return t("passages.ms1.r") },
			effectDescription: function () { return t("passages.ms1.e") },
			done() { return player.passages.best.gte(100) },
		},
		2: {
			requirementDescription: function () { return t("passages.ms2.r") },
			effectDescription: function () { return t("passages.ms2.e") },
			done() { return player.passages.best.gte(1e3) },
		},
		3: {
			requirementDescription: function () { return t("passages.ms3.r") },
			effectDescription: function () { return t("passages.ms3.e") },
			done() { return player.passages.best.gte(1e5) },
		},
	},

	buyables: {
		11: {
			title: function () { return t("passages.buy11.t") },
			cost(x) { return new Decimal(10).times(Decimal.pow(2, x)) },
			effect(x) { return new Decimal(1.2).pow(x) },
			display() {
				let data = tmp.passages.buyables[11]
				return t("ui.cost") + ': ' + num(data.cost) + ' ' + t("passages.resource")
					+ '<br>' + t("ui.level") + ': ' + num(getBuyableAmount("passages", 11))
					+ '<br>' + t("ui.effect") + ': ×' + num(data.effect)
			},
			canAfford() { return player.passages.points.gte(tmp.passages.buyables[11].cost) },
			buy() {
				let cost = tmp.passages.buyables[11].cost
				player.passages.points = player.passages.points.sub(cost)
				player.passages.buyables[11] = player.passages.buyables[11].add(1)
			},
		},
	},

	tabFormat: [
		["display-text", function () { return mainAmount("passages", false) }],
		"prestige-button",
		["display-text", function () {
			return '<span style="opacity:.65">' + t("passages.ctx") + '</span>'
		}],
		["microtabs", "stuff"],
	],

	microtabs: {
		stuff: {
			"upgrades": { content: ["upgrades"] },
			"passages": { content: ["buyables"] },
			"milestones": { content: ["milestones"] },
		},
	},

	hotkeys: [
		{
			key: "p",
			description: t("passages.hotkey"),
			onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],
})
