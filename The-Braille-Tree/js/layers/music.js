/* =========================================================================
 *  layers/music.js — 音乐盲文 / Music Braille  (row 2, static)
 *
 *  The third specialist code. Music points multiply 词语 gain; its upgrades
 *  are the last paper sinks before the word layer opens.
 * ========================================================================= */

function musicEffect() {
	let ret = new Decimal(1.25).pow(player.music.points)
	if (hasUpgrade("music", 11)) ret = ret.times(2)
	if (hasUpgrade("music", 14)) ret = ret.pow(1.05)
	if (getBuyableAmount("music", 11).gt(0)) ret = ret.times(buyableEffect("music", 11))
	return ret
}

addLayer("music", {
	name: function () { return t("music.name") },
	symbol: function () { return t("music.symbol") },
	position: 2,
	row: 2,

	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
		}
	},

	color: "#e0b070",
	resource: function () { return t("music.resource") },
	baseResource: function () { return t("music.baseResource") },
	baseAmount() { return player.slate.points },
	requires: new Decimal(TUNING.REQ.music),
	type: "static",
	base: 4,
	roundUpCost: true,
	canBuyMax() { return hasMilestone("music", 0) },

	layerShown() {
		return player.music.unlocked
			|| (player.eight.learned >= 192 && player.slate.points.gte(TUNING.REQ.music))
	},

	prestigeButtonText() {
		if (canReset(this.layer)) return t("music.button") + ' <b>' + num(tmp.music.nextAt) + '</b> ' + t("music.baseResource")
		return t("music.locked")
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
			title: function () { return t("music.up11.t") },
			description: function () { return t("music.up11.d") },
			cost: new Decimal(TUNING.UPG_COSTS.music[11]),
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		12: {
			title: function () { return t("music.up12.t") },
			description: function () { return t("music.up12.d") },
			cost: new Decimal(TUNING.UPG_COSTS.music[12]),
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		13: {
			title: function () { return t("music.up13.t") },
			description: function () { return t("music.up13.d") },
			cost: new Decimal(TUNING.UPG_COSTS.music[13]),
			effect() { return new Decimal(player.eight.learned + 1).pow(0.15) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		14: {
			title: function () { return t("music.up14.t") },
			description: function () { return t("music.up14.d") },
			cost: new Decimal(TUNING.UPG_COSTS.music[14]),
			effect() { return new Decimal(1.05) },
			effectDisplay() { return '^' + num(this.effect()) },
		},
		15: {
			title: function () { return t("music.up15.t") },
			description: function () { return t("music.up15.d") },
			cost: new Decimal(TUNING.UPG_COSTS.music[15]),
		},
		21: {
			title: function () { return t("music.up21.t") },
			description: function () { return t("music.up21.d") },
			cost: new Decimal(TUNING.UPG_COSTS.music[21]),
			unlocked() { return hasUpgrade("music", 15) },
			effect() { return new Decimal(3) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		22: {
			title: function () { return t("music.up22.t") },
			description: function () { return t("music.up22.d") },
			cost: new Decimal(TUNING.UPG_COSTS.music[22]),
			unlocked() { return hasUpgrade("music", 15) },
		},
		23: {
			title: function () { return t("music.up23.t") },
			description: function () { return t("music.up23.d") },
			cost: new Decimal(TUNING.UPG_COSTS.music[23]),
			unlocked() { return hasUpgrade("music", 15) },
		},
		24: {
			title: function () { return t("music.up24.t") },
			description: function () { return t("music.up24.d") },
			cost: new Decimal(TUNING.UPG_COSTS.music[24]),
			unlocked() { return hasUpgrade("music", 15) },
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		25: {
			title: function () { return t("music.up25.t") },
			description: function () { return t("music.up25.d") },
			cost: new Decimal(TUNING.UPG_COSTS.music[25]),
			unlocked() { return hasUpgrade("music", 15) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function () { return t("music.ms0.r") },
			effectDescription: function () { return t("music.ms0.e") },
			done() { return player.music.best.gte(1) },
		},
		1: {
			requirementDescription: function () { return t("music.ms1.r") },
			effectDescription: function () { return t("music.ms1.e") },
			done() { return player.music.best.gte(3) },
		},
		2: {
			requirementDescription: function () { return t("music.ms2.r") },
			effectDescription: function () { return t("music.ms2.e") },
			done() { return player.music.best.gte(6) },
		},
	},

	buyables: {
		11: {
			title: function () { return t("music.buy11.t") },
			cost(x) { return new Decimal(500).times(Decimal.pow(2.5, x)) },
			effect(x) { return new Decimal(1.25).pow(x) },
			display() {
				let data = tmp.music.buyables[11]
				return t("ui.cost") + ': ' + num(data.cost) + ' ' + t("music.baseResource")
					+ '<br>' + t("ui.level") + ': ' + num(getBuyableAmount("music", 11))
					+ '<br>' + t("ui.effect") + ': ×' + num(data.effect)
			},
			canAfford() { return player.slate.points.gte(tmp.music.buyables[11].cost) },
			buy() {
				let cost = tmp.music.buyables[11].cost
				player.slate.points = player.slate.points.sub(cost)
				player.music.buyables[11] = player.music.buyables[11].add(1)
			},
			unlocked() { return hasUpgrade("music", 15) },
		},
	},

	tabFormat: [
		["display-text", function () { return mainAmount("music", false) }],
		"prestige-button",
		["display-text", function () {
			return '<span style="opacity:.65">' + t("music.ctx") + '</span><br>'
				+ t("music.effect") + ': ×' + num(musicEffect())
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
			key: "m",
			description: t("music.hotkey"),
			onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],
})
