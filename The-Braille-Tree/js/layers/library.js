/* =========================================================================
 *  layers/library.js — 藏书楼 / The Library  (row 4, custom, endgame)
 *
 *  The last layer does not reset the tree: every "prestige" shelves what the
 *  passages have become, and the books keep accumulating. 1,000 books is the
 *  win condition.
 * ========================================================================= */

function libraryGainMult() {
	let ret = new Decimal(1)
	if (hasUpgrade("library", 11)) ret = ret.times(2)
	if (hasUpgrade("library", 12)) ret = ret.times(2)
	if (hasUpgrade("library", 14)) ret = ret.times(2)
	if (hasUpgrade("library", 21)) ret = ret.times(player.passages.points.add(1).log10().add(1).pow(0.1))
	if (hasUpgrade("library", 22) && player.library.points.gte(100)) ret = ret.times(3)
	if (hasUpgrade("library", 24)) ret = ret.times(2)
	if (hasUpgrade("library", 31)) ret = ret.times(2)
	if (hasUpgrade("library", 32)) ret = ret.times(player.passages.points.add(1).pow(0.05))

	if (hasMilestone("library", 2)) ret = ret.times(5)
	if (hasMilestone("library", 4)) ret = ret.times(10)
	if (hasMilestone("library", 5)) ret = ret.times(2)
	if (hasMilestone("library", 6)) ret = ret.times(10)
	if (hasMilestone("library", 8)) ret = ret.times(10)

	if (getBuyableAmount("library", 11).gt(0)) ret = ret.times(buyableEffect("library", 11))
	if (getBuyableAmount("library", 12).gt(0)) ret = ret.times(buyableEffect("library", 12))
	ret = ret.times(achievementBoost())
	return ret
}

function libraryGain() {
	let base = player.passages.points.add(1).pow(0.1).sub(1).max(1)
	return base.times(libraryGainMult()).floor().max(1)
}

addLayer("library", {
	name: function () { return t("library.name") },
	symbol: function () { return t("library.symbol") },
	position: 0,
	row: 4,

	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
		}
	},

	color: "#e8d8a8",
	resource: function () { return t("library.resource") },
	baseResource: function () { return t("library.baseResource") },
	baseAmount() { return player.passages.points },
	requires: new Decimal(TUNING.REQ.library),
	type: "custom",

	getResetGain() { return libraryGain() },
	getNextAt() { return new Decimal(TUNING.REQ.library) },
	canReset() { return player.passages.points.gte(TUNING.REQ.library) },
	resetsNothing() { return true },

	layerShown() {
		return player.library.unlocked || player.passages.points.gte(TUNING.REQ.library)
	},

	prestigeButtonText() {
		if (!canReset(this.layer)) return t("library.locked")
		return t("library.button") + ' <b>' + num(tmp.library.resetGain) + '</b> ' + t("library.resource")
	},

	doReset(resettingLayer) {
		if (layers[resettingLayer].row > this.row) {
			layerDataReset(this.layer, [
				"unlocked", "best", "total", "upgrades", "milestones", "buyables",
			])
		}
	},

	update(diff) {
		if (!player.library.unlocked) return
		addPoints("library", libraryRate().times(diff))
	},

	upgrades: {
		11: {
			title: function () { return t("library.up11.t") },
			description: function () { return t("library.up11.d") },
			cost: new Decimal(TUNING.UPG_COSTS.library[11]),
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		12: {
			title: function () { return t("library.up12.t") },
			description: function () { return t("library.up12.d") },
			cost: new Decimal(TUNING.UPG_COSTS.library[12]),
			effect() { return player.library.points.add(1).pow(0.1) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		13: {
			title: function () { return t("library.up13.t") },
			description: function () { return t("library.up13.d") },
			cost: new Decimal(TUNING.UPG_COSTS.library[13]),
			effect() { return player.passages.points.add(1).pow(0.1) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		14: {
			title: function () { return t("library.up14.t") },
			description: function () { return t("library.up14.d") },
			cost: new Decimal(TUNING.UPG_COSTS.library[14]),
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		15: {
			title: function () { return t("library.up15.t") },
			description: function () { return t("library.up15.d") },
			cost: new Decimal(TUNING.UPG_COSTS.library[15]),
		},
		21: {
			title: function () { return t("library.up21.t") },
			description: function () { return t("library.up21.d") },
			cost: new Decimal(TUNING.UPG_COSTS.library[21]),
			unlocked() { return hasUpgrade("library", 15) },
			effect() { return player.passages.points.add(1).log10().add(1).pow(0.1) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		22: {
			title: function () { return t("library.up22.t") },
			description: function () { return t("library.up22.d") },
			cost: new Decimal(TUNING.UPG_COSTS.library[22]),
			unlocked() { return hasUpgrade("library", 15) },
		},
		23: {
			title: function () { return t("library.up23.t") },
			description: function () { return t("library.up23.d") },
			cost: new Decimal(TUNING.UPG_COSTS.library[23]),
			unlocked() { return hasUpgrade("library", 15) },
		},
		24: {
			title: function () { return t("library.up24.t") },
			description: function () { return t("library.up24.d") },
			cost: new Decimal(TUNING.UPG_COSTS.library[24]),
			unlocked() { return hasUpgrade("library", 15) },
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		25: {
			title: function () { return t("library.up25.t") },
			description: function () { return t("library.up25.d") },
			cost: new Decimal(TUNING.UPG_COSTS.library[25]),
			unlocked() { return hasUpgrade("library", 15) },
		},
		31: {
			title: function () { return t("library.up31.t") },
			description: function () { return t("library.up31.d") },
			cost: new Decimal(TUNING.UPG_COSTS.library[31]),
			unlocked() { return hasMilestone("library", 2) },
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		32: {
			title: function () { return t("library.up32.t") },
			description: function () { return t("library.up32.d") },
			cost: new Decimal(TUNING.UPG_COSTS.library[32]),
			unlocked() { return hasMilestone("library", 2) },
			effect() { return player.passages.points.add(1).pow(0.05) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function () { return t("library.ms0.r") },
			effectDescription: function () { return t("library.ms0.e") },
			done() { return player.library.points.gte(1) },
		},
		1: {
			requirementDescription: function () { return t("library.ms1.r") },
			effectDescription: function () { return t("library.ms1.e") },
			done() { return player.library.points.gte(10) },
		},
		2: {
			requirementDescription: function () { return t("library.ms2.r") },
			effectDescription: function () { return t("library.ms2.e") },
			done() { return player.library.points.gte(25) },
		},
		3: {
			requirementDescription: function () { return t("library.ms3.r") },
			effectDescription: function () { return t("library.ms3.e") },
			done() { return player.library.points.gte(50) },
		},
		4: {
			requirementDescription: function () { return t("library.ms4.r") },
			effectDescription: function () { return t("library.ms4.e") },
			done() { return player.library.points.gte(100) },
		},
		5: {
			requirementDescription: function () { return t("library.ms5.r") },
			effectDescription: function () { return t("library.ms5.e") },
			done() { return player.library.points.gte(200) },
		},
		6: {
			requirementDescription: function () { return t("library.ms6.r") },
			effectDescription: function () { return t("library.ms6.e") },
			done() { return player.library.points.gte(300) },
		},
		7: {
			requirementDescription: function () { return t("library.ms7.r") },
			effectDescription: function () { return t("library.ms7.e") },
			done() { return player.library.points.gte(500) },
		},
		8: {
			requirementDescription: function () { return t("library.ms8.r") },
			effectDescription: function () { return t("library.ms8.e") },
			done() { return player.library.points.gte(750) },
		},
		9: {
			requirementDescription: function () { return t("library.ms9.r") },
			effectDescription: function () { return t("library.ms9.e") },
			done() { return player.library.points.gte(1000) },
		},
	},

	buyables: {
		11: {
			title: function () { return t("library.buy11.t") },
			cost(x) { return new Decimal(10).times(Decimal.pow(2, x)) },
			effect(x) { return new Decimal(1.2).pow(x) },
			display() {
				let data = tmp.library.buyables[11]
				return t("ui.cost") + ': ' + num(data.cost) + ' ' + t("library.resource")
					+ '<br>' + t("ui.level") + ': ' + num(getBuyableAmount("library", 11))
					+ '<br>' + t("ui.effect") + ': ×' + num(data.effect)
			},
			canAfford() { return player.library.points.gte(tmp.library.buyables[11].cost) },
			buy() {
				let cost = tmp.library.buyables[11].cost
				player.library.points = player.library.points.sub(cost)
				player.library.buyables[11] = player.library.buyables[11].add(1)
			},
			unlocked() { return hasUpgrade("library", 15) },
		},
		12: {
			title: function () { return t("library.buy12.t") },
			cost(x) { return new Decimal(100).times(Decimal.pow(3, x)) },
			effect(x) { return new Decimal(1.15).pow(x) },
			display() {
				let data = tmp.library.buyables[12]
				return t("ui.cost") + ': ' + num(data.cost) + ' ' + t("library.resource")
					+ '<br>' + t("ui.level") + ': ' + num(getBuyableAmount("library", 12))
					+ '<br>' + t("ui.effect") + ': ×' + num(data.effect)
			},
			canAfford() { return player.library.points.gte(tmp.library.buyables[12].cost) },
			buy() {
				let cost = tmp.library.buyables[12].cost
				player.library.points = player.library.points.sub(cost)
				player.library.buyables[12] = player.library.buyables[12].add(1)
			},
			unlocked() { return hasUpgrade("library", 25) },
		},
	},

	tabFormat: [
		["display-text", function () { return mainAmount("library", true) }],
		"prestige-button",
		["display-text", function () {
			return '<span style="opacity:.65">' + t("library.ctx") + '</span><br>'
				+ t("library.effect") + ': ×' + num(libraryGainMult())
		}],
		["microtabs", "stuff"],
	],

	microtabs: {
		stuff: {
			"upgrades": { content: ["upgrades"] },
			"books": { content: ["buyables"] },
			"milestones": { content: ["milestones"] },
		},
	},

	hotkeys: [
		{
			key: "b",
			description: t("library.hotkey"),
			onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],
})
