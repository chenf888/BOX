/* =========================================================================
 *  layers/slate.js — 盲文板 / Slate & Stylus  (row 1, the shop)
 *
 *  Paper is the mid-game economic currency: update() produces it, the layer's
 *  own prestige also pays it, and its upgrades are mostly K4/K5 meta-effects
 *  that reach back into the board layers (M8).
 * ========================================================================= */

function slateGainMult() {
	let ret = new Decimal(1)
	if (hasUpgrade("slate", 11)) ret = ret.times(TUNING.MULT.slate[11])
	if (hasUpgrade("slate", 14)) ret = ret.times(3)
	if (hasUpgrade("slate", 21)) ret = ret.times(player.touch.points.add(1).log10().add(1).pow(0.1))
	if (hasUpgrade("slate", 22) && player.slate.points.gte(1e6)) ret = ret.times(3)
	if (hasUpgrade("slate", 25)) ret = ret.times(2)
	if (hasUpgrade("nemeth", 25)) ret = ret.times(2)
	if (hasUpgrade("music", 25)) ret = ret.times(2)
	if (hasMilestone("library", 7)) ret = ret.times(3)
	if (hasMilestone("slate", 0)) ret = ret.times(2)
	if (hasMilestone("slate", 1)) ret = ret.times(2)
	if (hasMilestone("slate", 2)) ret = ret.times(2)
	if (hasMilestone("contracted", 1)) ret = ret.times(2)
	if (hasMilestone("nemeth", 1)) ret = ret.times(2)
	if (hasMilestone("music", 1)) ret = ret.times(2)
	if (player.nemeth.points.gt(0)) ret = ret.times(nemethEffect())
	if (hasUpgrade("nemeth", 12)) ret = ret.times(2)
	if (hasUpgrade("nemeth", 21)) ret = ret.times(3)
	if (hasUpgrade("music", 21)) ret = ret.times(3)
	if (hasUpgrade("nemeth", 22) && player.nemeth.points.gte(4)) ret = ret.times(3)
	if (hasUpgrade("contracted", 21)) ret = ret.times(2)
	if (hasUpgrade("contracted", 32)) ret = ret.times(2)
	if (hasChallenge("contracted", 11)) ret = ret.times(2)
	if (inChallenge("contracted", 11)) ret = ret.times(0.1)
	if (inChallenge("contracted", 12)) ret = ret.times(0.05)
	if (getBuyableAmount("slate", 11).gt(0)) ret = ret.times(buyableEffect("slate", 11))
	if (getBuyableAmount("slate", 12).gt(0)) ret = ret.times(buyableEffect("slate", 12))
	ret = ret.times(achievementBoost())
	return ret
}

/* Production-only term: the self-scaling u12 must not feed the prestige gain. */
function slateRateMult() {
	let ret = slateGainMult()
	if (hasUpgrade("slate", 12)) ret = ret.times(player.slate.points.add(10).log10().add(1).pow(1.5))
	return ret
}

addLayer("slate", {
	name: function () { return t("slate.name") },
	symbol: function () { return t("slate.symbol") },
	position: 2,
	row: 1,

	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
		}
	},

	color: "#b08d57",
	resource: function () { return t("slate.resource") },
	baseResource: function () { return t("slate.baseResource") },
	baseAmount() { return player.touch.points },
	requires: new Decimal(TUNING.REQ.slate),
	type: "normal",
	exponent: 1 / 3,

	softcap() {
		let cap = new Decimal(TUNING.SOFT.slate)
		if (hasUpgrade("slate", 23)) cap = new Decimal(TUNING.SOFT.slateRaise)
		return cap
	},
	softcapPower: TUNING.SOFT_POWER,

	gainMult() { return slateGainMult() },
	gainExp() { return new Decimal(1) },

	passiveGeneration() {
		if (hasMilestone("nemeth", 0) || hasAchievement("ach", 27)) return 1
		return 0
	},
	autoPrestige() {
		if (hasMilestone("slate", 0)) return true
		return false
	},
	resetsNothing() {
		if (hasMilestone("slate", 0)) return true
		return false
	},
	autoUpgrade() {
		if (hasMilestone("slate", 1) || hasUpgrade("slate", 24)) return true
		return false
	},

	update(diff) {
		if (!player.slate.unlocked) return
		addPoints("slate", paperRate().times(diff))
	},

	layerShown() {
		return player.slate.unlocked || player.touch.points.gte(TUNING.REQ.slate)
	},

	prestigeButtonText() {
		return t("slate.button") + ' <b>' + num(tmp.slate.resetGain) + '</b> ' + t("slate.resource")
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
			title: function () { return t("slate.up11.t") },
			description: function () { return t("slate.up11.d") },
			cost: new Decimal(TUNING.UPG_COSTS.slate[11]),
			effect() { return new Decimal(TUNING.MULT.slate[11]) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		12: {
			title: function () { return t("slate.up12.t") },
			description: function () { return t("slate.up12.d") },
			cost: new Decimal(TUNING.UPG_COSTS.slate[12]),
			effect() { return player.slate.points.add(1).pow(0.15) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		13: {
			title: function () { return t("slate.up13.t") },
			description: function () { return t("slate.up13.d") },
			cost: new Decimal(TUNING.UPG_COSTS.slate[13]),
			effect() { return new Decimal(player.six.learned + player.eight.learned + 1).pow(0.15) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		14: {
			title: function () { return t("slate.up14.t") },
			description: function () { return t("slate.up14.d") },
			cost: new Decimal(TUNING.UPG_COSTS.slate[14]),
			effect() { return new Decimal(3) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		15: {
			title: function () { return t("slate.up15.t") },
			description: function () { return t("slate.up15.d") },
			cost: new Decimal(TUNING.UPG_COSTS.slate[15]),
		},
		21: {
			title: function () { return t("slate.up21.t") },
			description: function () { return t("slate.up21.d") },
			cost: new Decimal(TUNING.UPG_COSTS.slate[21]),
			unlocked() { return hasUpgrade("slate", 15) },
			effect() { return player.touch.points.add(1).log10().add(1).pow(0.1) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		22: {
			title: function () { return t("slate.up22.t") },
			description: function () { return t("slate.up22.d") },
			cost: new Decimal(TUNING.UPG_COSTS.slate[22]),
			unlocked() { return hasUpgrade("slate", 15) },
		},
		23: {
			title: function () { return t("slate.up23.t") },
			description: function () { return t("slate.up23.d") },
			cost: new Decimal(TUNING.UPG_COSTS.slate[23]),
			unlocked() { return hasUpgrade("slate", 15) },
		},
		24: {
			title: function () { return t("slate.up24.t") },
			description: function () { return t("slate.up24.d") },
			cost: new Decimal(TUNING.UPG_COSTS.slate[24]),
			unlocked() { return hasUpgrade("slate", 15) },
		},
		25: {
			title: function () { return t("slate.up25.t") },
			description: function () { return t("slate.up25.d") },
			cost: new Decimal(TUNING.UPG_COSTS.slate[25]),
			unlocked() { return hasUpgrade("slate", 15) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function () { return t("slate.ms0.r") },
			effectDescription: function () { return t("slate.ms0.e") },
			done() { return player.slate.best.gte(1e3) },
		},
		1: {
			requirementDescription: function () { return t("slate.ms1.r") },
			effectDescription: function () { return t("slate.ms1.e") },
			done() { return player.slate.best.gte(1e5) },
		},
		2: {
			requirementDescription: function () { return t("slate.ms2.r") },
			effectDescription: function () { return t("slate.ms2.e") },
			done() { return player.slate.best.gte(1e7) },
		},
	},

	buyables: {
		11: {
			title: function () { return t("slate.buy11.t") },
			cost(x) { return new Decimal(10).times(Decimal.pow(2, x)) },
			effect(x) { return new Decimal(1.2).pow(x) },
			display() {
				let data = tmp.slate.buyables[11]
				return t("ui.cost") + ': ' + num(data.cost) + ' ' + t("slate.resource")
					+ '<br>' + t("ui.level") + ': ' + num(getBuyableAmount("slate", 11))
					+ '<br>' + t("ui.effect") + ': ×' + num(data.effect)
			},
			canAfford() { return player.slate.points.gte(tmp.slate.buyables[11].cost) },
			buy() {
				let cost = tmp.slate.buyables[11].cost
				player.slate.points = player.slate.points.sub(cost)
				player.slate.buyables[11] = player.slate.buyables[11].add(1)
			},
		},
		12: {
			title: function () { return t("slate.buy12.t") },
			cost(x) { return new Decimal(100).times(Decimal.pow(3, x)) },
			effect(x) { return new Decimal(1.1).pow(x) },
			display() {
				let data = tmp.slate.buyables[12]
				return t("ui.cost") + ': ' + num(data.cost) + ' ' + t("slate.resource")
					+ '<br>' + t("ui.level") + ': ' + num(getBuyableAmount("slate", 12))
					+ '<br>' + t("ui.effect") + ': ×' + num(data.effect)
			},
			canAfford() { return player.slate.points.gte(tmp.slate.buyables[12].cost) },
			buy() {
				let cost = tmp.slate.buyables[12].cost
				player.slate.points = player.slate.points.sub(cost)
				player.slate.buyables[12] = player.slate.buyables[12].add(1)
			},
			unlocked() { return hasUpgrade("slate", 15) },
		},
	},

	tabFormat: [
		["display-text", function () { return mainAmount("slate", true) }],
		"prestige-button",
		["display-text", function () {
			return '<span style="opacity:.65">' + t("slate.ctx") + '</span>'
		}],
		["microtabs", "stuff"],
	],

	microtabs: {
		stuff: {
			"upgrades": { content: ["upgrades"] },
			"paper": {
				content: [
					["display-text", function () { return t("slate.paper.intro") + ' ' + num(paperRate()) + ' / ' + t("ui.perSec") }],
					"buyables",
				],
				unlocked() { return hasUpgrade("slate", 15) },
			},
			"milestones": { content: ["milestones"] },
		},
	},

	hotkeys: [
		{
			key: "l",
			description: t("slate.hotkey"),
			onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],
})
