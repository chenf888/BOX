/* =========================================================================
 *  layers/nemeth.js — 数学盲文 / Nemeth Code  (row 2, static)
 *
 *  Numbers and operators get their own braille code. Buying Nemeth points is
 *  the main paper sink between the dot boards and 词语; its currency effect
 *  multiplies paper production, and its upgrades reach into touch.
 * ========================================================================= */

function nemethEffect() {
	let ret = new Decimal(1.25).pow(player.nemeth.points)
	if (hasUpgrade("nemeth", 11)) ret = ret.times(2)
	if (hasUpgrade("nemeth", 14)) ret = ret.pow(1.05)
	if (getBuyableAmount("nemeth", 11).gt(0)) ret = ret.times(buyableEffect("nemeth", 11))
	return ret
}

addLayer("nemeth", {
	name: function () { return t("nemeth.name") },
	symbol: function () { return t("nemeth.symbol") },
	position: 1,
	row: 2,

	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
		}
	},

	color: "#c9a0dc",
	resource: function () { return t("nemeth.resource") },
	baseResource: function () { return t("nemeth.baseResource") },
	baseAmount() { return player.slate.points },
	requires: new Decimal(TUNING.REQ.nemeth),
	type: "static",
	base: 4,
	roundUpCost: true,
	canBuyMax() { return hasMilestone("nemeth", 0) },

	layerShown() {
		return player.nemeth.unlocked
			|| (player.eight.learned >= 128 && player.slate.points.gte(TUNING.REQ.nemeth))
	},

	prestigeButtonText() {
		if (canReset(this.layer)) return t("nemeth.button") + ' <b>' + num(tmp.nemeth.nextAt) + '</b> ' + t("nemeth.baseResource")
		return t("nemeth.locked")
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
			title: function () { return t("nemeth.up11.t") },
			description: function () { return t("nemeth.up11.d") },
			cost: new Decimal(TUNING.UPG_COSTS.nemeth[11]),
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		12: {
			title: function () { return t("nemeth.up12.t") },
			description: function () { return t("nemeth.up12.d") },
			cost: new Decimal(TUNING.UPG_COSTS.nemeth[12]),
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		13: {
			title: function () { return t("nemeth.up13.t") },
			description: function () { return t("nemeth.up13.d") },
			cost: new Decimal(TUNING.UPG_COSTS.nemeth[13]),
			effect() { return new Decimal(player.eight.learned + 1).pow(0.15) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		14: {
			title: function () { return t("nemeth.up14.t") },
			description: function () { return t("nemeth.up14.d") },
			cost: new Decimal(TUNING.UPG_COSTS.nemeth[14]),
			effect() { return new Decimal(1.05) },
			effectDisplay() { return '^' + num(this.effect()) },
		},
		15: {
			title: function () { return t("nemeth.up15.t") },
			description: function () { return t("nemeth.up15.d") },
			cost: new Decimal(TUNING.UPG_COSTS.nemeth[15]),
		},
		21: {
			title: function () { return t("nemeth.up21.t") },
			description: function () { return t("nemeth.up21.d") },
			cost: new Decimal(TUNING.UPG_COSTS.nemeth[21]),
			unlocked() { return hasUpgrade("nemeth", 15) },
			effect() { return new Decimal(3) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		22: {
			title: function () { return t("nemeth.up22.t") },
			description: function () { return t("nemeth.up22.d") },
			cost: new Decimal(TUNING.UPG_COSTS.nemeth[22]),
			unlocked() { return hasUpgrade("nemeth", 15) },
		},
		23: {
			title: function () { return t("nemeth.up23.t") },
			description: function () { return t("nemeth.up23.d") },
			cost: new Decimal(TUNING.UPG_COSTS.nemeth[23]),
			unlocked() { return hasUpgrade("nemeth", 15) },
		},
		24: {
			title: function () { return t("nemeth.up24.t") },
			description: function () { return t("nemeth.up24.d") },
			cost: new Decimal(TUNING.UPG_COSTS.nemeth[24]),
			unlocked() { return hasUpgrade("nemeth", 15) },
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		25: {
			title: function () { return t("nemeth.up25.t") },
			description: function () { return t("nemeth.up25.d") },
			cost: new Decimal(TUNING.UPG_COSTS.nemeth[25]),
			unlocked() { return hasUpgrade("nemeth", 15) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function () { return t("nemeth.ms0.r") },
			effectDescription: function () { return t("nemeth.ms0.e") },
			done() { return player.nemeth.best.gte(1) },
		},
		1: {
			requirementDescription: function () { return t("nemeth.ms1.r") },
			effectDescription: function () { return t("nemeth.ms1.e") },
			done() { return player.nemeth.best.gte(3) },
		},
		2: {
			requirementDescription: function () { return t("nemeth.ms2.r") },
			effectDescription: function () { return t("nemeth.ms2.e") },
			done() { return player.nemeth.best.gte(6) },
		},
	},

	buyables: {
		11: {
			title: function () { return t("nemeth.buy11.t") },
			cost(x) { return new Decimal(200).times(Decimal.pow(2.5, x)) },
			effect(x) { return new Decimal(1.25).pow(x) },
			display() {
				let data = tmp.nemeth.buyables[11]
				return t("ui.cost") + ': ' + num(data.cost) + ' ' + t("nemeth.baseResource")
					+ '<br>' + t("ui.level") + ': ' + num(getBuyableAmount("nemeth", 11))
					+ '<br>' + t("ui.effect") + ': ×' + num(data.effect)
			},
			canAfford() { return player.slate.points.gte(tmp.nemeth.buyables[11].cost) },
			buy() {
				let cost = tmp.nemeth.buyables[11].cost
				player.slate.points = player.slate.points.sub(cost)
				player.nemeth.buyables[11] = player.nemeth.buyables[11].add(1)
			},
			unlocked() { return hasUpgrade("nemeth", 15) },
		},
	},

	tabFormat: [
		["display-text", function () { return mainAmount("nemeth", false) }],
		"prestige-button",
		["display-text", function () {
			return '<span style="opacity:.65">' + t("nemeth.ctx") + '</span><br>'
				+ t("nemeth.effect") + ': ×' + num(nemethEffect())
		}],
		["microtabs", "stuff"],
	],

	microtabs: {
		stuff: {
			"upgrades": { content: ["upgrades"] },
			"milestones": { content: ["milestones", "buyables"] },
		},
	},

	hotkeys: [
		{
			key: "n",
			description: t("nemeth.hotkey"),
			onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],
})
