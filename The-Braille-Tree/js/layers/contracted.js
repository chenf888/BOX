/* =========================================================================
 *  layers/contracted.js — 缩写盲文 / Contracted Braille  (row 2, static)
 *
 *  The first "code" the reader learns: whole words become single cells. It is
 *  a static layer (each point is bought with paper), and its currency effect
 *  feeds the 词语 layer. Two challenges live here.
 * ========================================================================= */

function contractedEffect() {
	let ret = new Decimal(1.5).pow(player.contracted.points)
	if (hasUpgrade("contracted", 11)) ret = ret.times(2)
	if (hasUpgrade("contracted", 14)) ret = ret.pow(1.05)
	if (hasUpgrade("contracted", 31)) ret = ret.times(3)
	if (hasMilestone("contracted", 3)) ret = ret.times(3)
	return ret
}

addLayer("contracted", {
	name: function () { return t("contracted.name") },
	symbol: function () { return t("contracted.symbol") },
	position: 0,
	row: 2,

	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
		}
	},

	color: "#8fb3c9",
	resource: function () { return t("contracted.resource") },
	baseResource: function () { return t("contracted.baseResource") },
	baseAmount() { return player.slate.points },
	requires: new Decimal(TUNING.REQ.contracted),
	type: "static",
	base: 4,
	roundUpCost: true,
	canBuyMax() {
		return hasMilestone("contracted", 2) || hasUpgrade("contracted", 34)
	},

	layerShown() {
		return player.contracted.unlocked
			|| (player.six.learned >= 64 && player.slate.points.gte(TUNING.REQ.contracted))
	},

	prestigeButtonText() {
		if (canReset(this.layer)) return t("contracted.button") + ' <b>' + num(tmp.contracted.nextAt) + '</b> ' + t("contracted.baseResource")
		return t("contracted.locked")
	},

	doReset(resettingLayer) {
		if (layers[resettingLayer].row > this.row) {
			layerDataReset(this.layer, [
				"unlocked", "best", "total", "upgrades", "milestones", "challenges", "buyables",
			])
		}
	},

	upgrades: {
		11: {
			title: function () { return t("contracted.up11.t") },
			description: function () { return t("contracted.up11.d") },
			cost: new Decimal(TUNING.UPG_COSTS.contracted[11]),
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		12: {
			title: function () { return t("contracted.up12.t") },
			description: function () { return t("contracted.up12.d") },
			cost: new Decimal(TUNING.UPG_COSTS.contracted[12]),
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		13: {
			title: function () { return t("contracted.up13.t") },
			description: function () { return t("contracted.up13.d") },
			cost: new Decimal(TUNING.UPG_COSTS.contracted[13]),
			effect() { return new Decimal(player.six.learned + 1).pow(0.15) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		14: {
			title: function () { return t("contracted.up14.t") },
			description: function () { return t("contracted.up14.d") },
			cost: new Decimal(TUNING.UPG_COSTS.contracted[14]),
			effect() { return new Decimal(1.05) },
			effectDisplay() { return '^' + num(this.effect()) },
		},
		15: {
			title: function () { return t("contracted.up15.t") },
			description: function () { return t("contracted.up15.d") },
			cost: new Decimal(TUNING.UPG_COSTS.contracted[15]),
		},
		21: {
			title: function () { return t("contracted.up21.t") },
			description: function () { return t("contracted.up21.d") },
			cost: new Decimal(TUNING.UPG_COSTS.contracted[21]),
			unlocked() { return hasUpgrade("contracted", 15) },
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		22: {
			title: function () { return t("contracted.up22.t") },
			description: function () { return t("contracted.up22.d") },
			cost: new Decimal(TUNING.UPG_COSTS.contracted[22]),
			unlocked() { return hasUpgrade("contracted", 15) },
		},
		23: {
			title: function () { return t("contracted.up23.t") },
			description: function () { return t("contracted.up23.d") },
			cost: new Decimal(TUNING.UPG_COSTS.contracted[23]),
			unlocked() { return hasUpgrade("contracted", 15) },
			effect() { return new Decimal(player.eight.learned + 1).pow(0.15) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		24: {
			title: function () { return t("contracted.up24.t") },
			description: function () { return t("contracted.up24.d") },
			cost: new Decimal(TUNING.UPG_COSTS.contracted[24]),
			unlocked() { return hasUpgrade("contracted", 15) },
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		25: {
			title: function () { return t("contracted.up25.t") },
			description: function () { return t("contracted.up25.d") },
			cost: new Decimal(TUNING.UPG_COSTS.contracted[25]),
			unlocked() { return hasUpgrade("contracted", 15) },
		},
		31: {
			title: function () { return t("contracted.up31.t") },
			description: function () { return t("contracted.up31.d") },
			cost: new Decimal(TUNING.UPG_COSTS.contracted[31]),
			unlocked() { return hasMilestone("contracted", 1) },
			effect() { return new Decimal(3) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		32: {
			title: function () { return t("contracted.up32.t") },
			description: function () { return t("contracted.up32.d") },
			cost: new Decimal(TUNING.UPG_COSTS.contracted[32]),
			unlocked() { return hasMilestone("contracted", 1) },
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		33: {
			title: function () { return t("contracted.up33.t") },
			description: function () { return t("contracted.up33.d") },
			cost: new Decimal(TUNING.UPG_COSTS.contracted[33]),
			unlocked() { return hasMilestone("contracted", 1) },
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		34: {
			title: function () { return t("contracted.up34.t") },
			description: function () { return t("contracted.up34.d") },
			cost: new Decimal(TUNING.UPG_COSTS.contracted[34]),
			unlocked() { return hasMilestone("contracted", 1) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function () { return t("contracted.ms0.r") },
			effectDescription: function () { return t("contracted.ms0.e") },
			done() { return player.contracted.best.gte(1) },
		},
		1: {
			requirementDescription: function () { return t("contracted.ms1.r") },
			effectDescription: function () { return t("contracted.ms1.e") },
			done() { return player.contracted.best.gte(3) },
		},
		2: {
			requirementDescription: function () { return t("contracted.ms2.r") },
			effectDescription: function () { return t("contracted.ms2.e") },
			done() { return player.contracted.best.gte(6) },
		},
		3: {
			requirementDescription: function () { return t("contracted.ms3.r") },
			effectDescription: function () { return t("contracted.ms3.e") },
			done() { return player.contracted.best.gte(10) },
		},
	},

	challenges: {
		11: {
			name: function () { return t("contracted.ch11.name") },
			challengeDescription: function () { return t("contracted.ch11.desc") },
			goalDescription: function () { return t("contracted.ch11.goal") },
			rewardDescription: function () { return t("contracted.ch11.reward") },
			canComplete() { return player.slate.points.gte(1e5) },
			completionLimit: 1,
			unlocked() { return hasMilestone("contracted", 0) },
		},
		12: {
			name: function () { return t("contracted.ch12.name") },
			challengeDescription: function () { return t("contracted.ch12.desc") },
			goalDescription: function () { return t("contracted.ch12.goal") },
			rewardDescription: function () { return t("contracted.ch12.reward") },
			canComplete() { return player.six.learned >= 64 && player.eight.learned >= 128 },
			completionLimit: 1,
			unlocked() { return hasUpgrade("contracted", 25) },
		},
	},

	buyables: {
		11: {
			title: function () { return t("contracted.buy11.t") },
			cost(x) { return new Decimal(50).times(Decimal.pow(2.5, x)) },
			effect(x) { return new Decimal(1.5).pow(x) },
			display() {
				let data = tmp.contracted.buyables[11]
				return t("ui.cost") + ': ' + num(data.cost) + ' ' + t("contracted.baseResource")
					+ '<br>' + t("ui.level") + ': ' + num(getBuyableAmount("contracted", 11))
					+ '<br>' + t("ui.effect") + ': ×' + num(data.effect)
			},
			canAfford() { return player.slate.points.gte(tmp.contracted.buyables[11].cost) },
			buy() {
				let cost = tmp.contracted.buyables[11].cost
				player.slate.points = player.slate.points.sub(cost)
				player.contracted.buyables[11] = player.contracted.buyables[11].add(1)
			},
			unlocked() { return hasUpgrade("contracted", 15) },
		},
	},

	tabFormat: [
		["display-text", function () { return mainAmount("contracted", false) }],
		"prestige-button",
		["display-text", function () {
			return '<span style="opacity:.65">' + t("contracted.ctx") + '</span><br>'
				+ t("contracted.effect") + ': ×' + num(contractedEffect())
		}],
		["microtabs", "stuff"],
	],

	microtabs: {
		stuff: {
			"upgrades": { content: ["upgrades"] },
			"challenges": {
				content: ["challenges"],
				unlocked() { return hasMilestone("contracted", 0) },
			},
			"milestones": { content: ["milestones", "buyables"] },
		},
	},

	hotkeys: [
		{
			key: "c",
			description: t("contracted.hotkey"),
			onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],
})
