/* =========================================================================
 *  layers/words.js — 词语 / Words  (row 3, normal)
 *
 *  The first layer that reads whole words instead of cells. It consumes paper
 *  and produces 词语 both on prestige and as a trickle; the specialist codes
 *  (contracted / Nemeth / music) all feed its gain.
 * ========================================================================= */

function wordsGainMult() {
	let ret = new Decimal(1)
	if (hasUpgrade("words", 11)) ret = ret.times(3)
	if (hasUpgrade("words", 14)) ret = ret.times(2)
	if (hasUpgrade("words", 21)) ret = ret.times(player.slate.points.add(1).log10().add(1).pow(0.2))
	if (hasUpgrade("words", 22) && player.words.points.gte(1e6)) ret = ret.times(3)
	if (hasUpgrade("words", 24)) ret = ret.times(2)
	if (hasUpgrade("words", 25)) ret = ret.times(2)
	if (hasUpgrade("words", 31)) ret = ret.times(2)

	if (hasUpgrade("contracted", 12)) ret = ret.times(2)
	if (hasUpgrade("contracted", 24)) ret = ret.times(2)
	if (hasUpgrade("contracted", 22) && player.contracted.points.gte(5)) ret = ret.times(3)
	if (hasUpgrade("contracted", 33)) ret = ret.times(2)
	if (hasUpgrade("nemeth", 24)) ret = ret.times(2)
	if (hasUpgrade("music", 12)) ret = ret.times(2)
	if (hasUpgrade("music", 22) && player.music.points.gte(4)) ret = ret.times(3)
	if (hasUpgrade("music", 24)) ret = ret.times(2)

	if (player.contracted.points.gt(0)) ret = ret.times(contractedEffect())
	if (player.music.points.gt(0)) ret = ret.times(musicEffect())

	if (hasMilestone("nemeth", 2)) ret = ret.times(3)
	if (hasMilestone("music", 2)) ret = ret.times(3)
	if (hasMilestone("words", 1)) ret = ret.times(5)
	if (hasMilestone("words", 2)) ret = ret.times(10)

	if (getBuyableAmount("words", 11).gt(0)) ret = ret.times(buyableEffect("words", 11))
	ret = ret.times(achievementBoost())
	return ret
}

/* Production-only terms: u12 (self) and u32 (passages) must not feed gain. */
function wordsRateMult() {
	let ret = wordsGainMult()
	if (hasUpgrade("words", 12)) ret = ret.times(player.words.points.add(10).log10().add(1).pow(1.5))
	if (hasUpgrade("words", 32)) ret = ret.times(player.passages.points.add(1).pow(0.1))
	return ret
}

addLayer("words", {
	name: function () { return t("words.name") },
	symbol: function () { return t("words.symbol") },
	position: 0,
	row: 3,

	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
		}
	},

	color: "#a8c686",
	resource: function () { return t("words.resource") },
	baseResource: function () { return t("words.baseResource") },
	baseAmount() { return player.slate.points },
	requires: new Decimal(TUNING.REQ.words),
	type: "normal",
	exponent: 0.25,

	softcap() {
		if (hasUpgrade("words", 23) || hasUpgrade("nemeth", 23)) return new Decimal(TUNING.SOFT.wordsRaise)
		return new Decimal(TUNING.SOFT.words)
	},
	softcapPower: TUNING.SOFT_POWER,

	gainMult() { return wordsGainMult() },
	gainExp() { return new Decimal(1) },

	passiveGeneration() {
		if (hasMilestone("passages", 0) || hasAchievement("ach", 33)) return 1
		return 0
	},
	autoPrestige() {
		if (hasMilestone("words", 3)) return true
		return false
	},
	resetsNothing() {
		if (hasMilestone("words", 3)) return true
		return false
	},
	autoUpgrade() {
		if (hasMilestone("words", 4)) return true
		return false
	},

	update(diff) {
		if (!player.words.unlocked) return
		addPoints("words", wordsRate().times(diff))
	},

	layerShown() {
		return player.words.unlocked
			|| (player.slate.points.gte(TUNING.REQ.words)
				&& hasMilestone("contracted", 0)
				&& hasMilestone("nemeth", 0)
				&& hasMilestone("music", 0))
	},

	prestigeButtonText() {
		return t("words.button") + ' <b>' + num(tmp.words.resetGain) + '</b> ' + t("words.resource")
	},

	doReset(resettingLayer) {
		if (layers[resettingLayer].row > this.row) {
			layerDataReset(this.layer, [
				"unlocked", "best", "total", "upgrades", "milestones", "buyables",
			])
		}
	},

	bars: {
		read: {
			direction: RIGHT,
			width: 320,
			height: 22,
			progress() {
				return Math.min(1, player.words.points.add(1).log10() / 3)
			},
			display() {
				return t("words.bar") + ': ' + num(player.words.points) + ' / ' + numWhole(1000)
			},
		},
	},

	upgrades: {
		11: {
			title: function () { return t("words.up11.t") },
			description: function () { return t("words.up11.d") },
			cost: new Decimal(TUNING.UPG_COSTS.words[11]),
			effect() { return new Decimal(3) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		12: {
			title: function () { return t("words.up12.t") },
			description: function () { return t("words.up12.d") },
			cost: new Decimal(TUNING.UPG_COSTS.words[12]),
			effect() { return player.words.points.add(1).pow(0.1) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		13: {
			title: function () { return t("words.up13.t") },
			description: function () { return t("words.up13.d") },
			cost: new Decimal(TUNING.UPG_COSTS.words[13]),
			effect() { return new Decimal(player.six.learned + player.eight.learned + 1).pow(0.1) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		14: {
			title: function () { return t("words.up14.t") },
			description: function () { return t("words.up14.d") },
			cost: new Decimal(TUNING.UPG_COSTS.words[14]),
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		15: {
			title: function () { return t("words.up15.t") },
			description: function () { return t("words.up15.d") },
			cost: new Decimal(TUNING.UPG_COSTS.words[15]),
		},
		21: {
			title: function () { return t("words.up21.t") },
			description: function () { return t("words.up21.d") },
			cost: new Decimal(TUNING.UPG_COSTS.words[21]),
			unlocked() { return hasUpgrade("words", 15) },
			effect() { return player.slate.points.add(1).log10().add(1).pow(0.2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		22: {
			title: function () { return t("words.up22.t") },
			description: function () { return t("words.up22.d") },
			cost: new Decimal(TUNING.UPG_COSTS.words[22]),
			unlocked() { return hasUpgrade("words", 15) },
		},
		23: {
			title: function () { return t("words.up23.t") },
			description: function () { return t("words.up23.d") },
			cost: new Decimal(TUNING.UPG_COSTS.words[23]),
			unlocked() { return hasUpgrade("words", 15) },
		},
		24: {
			title: function () { return t("words.up24.t") },
			description: function () { return t("words.up24.d") },
			cost: new Decimal(TUNING.UPG_COSTS.words[24]),
			unlocked() { return hasUpgrade("words", 15) },
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		25: {
			title: function () { return t("words.up25.t") },
			description: function () { return t("words.up25.d") },
			cost: new Decimal(TUNING.UPG_COSTS.words[25]),
			unlocked() { return hasUpgrade("words", 15) },
		},
		31: {
			title: function () { return t("words.up31.t") },
			description: function () { return t("words.up31.d") },
			cost: new Decimal(TUNING.UPG_COSTS.words[31]),
			unlocked() { return hasMilestone("words", 2) },
			effect() { return new Decimal(2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		32: {
			title: function () { return t("words.up32.t") },
			description: function () { return t("words.up32.d") },
			cost: new Decimal(TUNING.UPG_COSTS.words[32]),
			unlocked() { return hasMilestone("words", 2) },
			effect() { return player.passages.points.add(1).pow(0.1) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function () { return t("words.ms0.r") },
			effectDescription: function () { return t("words.ms0.e") },
			done() { return player.words.best.gte(10) },
		},
		1: {
			requirementDescription: function () { return t("words.ms1.r") },
			effectDescription: function () { return t("words.ms1.e") },
			done() { return player.words.best.gte(100) },
		},
		2: {
			requirementDescription: function () { return t("words.ms2.r") },
			effectDescription: function () { return t("words.ms2.e") },
			done() { return player.words.best.gte(1e3) },
		},
		3: {
			requirementDescription: function () { return t("words.ms3.r") },
			effectDescription: function () { return t("words.ms3.e") },
			done() { return player.words.best.gte(1e5) },
		},
		4: {
			requirementDescription: function () { return t("words.ms4.r") },
			effectDescription: function () { return t("words.ms4.e") },
			done() { return player.words.best.gte(1e7) },
		},
	},

	buyables: {
		11: {
			title: function () { return t("words.buy11.t") },
			cost(x) { return new Decimal(10).times(Decimal.pow(2, x)) },
			effect(x) { return new Decimal(1.2).pow(x) },
			display() {
				let data = tmp.words.buyables[11]
				return t("ui.cost") + ': ' + num(data.cost) + ' ' + t("words.resource")
					+ '<br>' + t("ui.level") + ': ' + num(getBuyableAmount("words", 11))
					+ '<br>' + t("ui.effect") + ': ×' + num(data.effect)
			},
			canAfford() { return player.words.points.gte(tmp.words.buyables[11].cost) },
			buy() {
				let cost = tmp.words.buyables[11].cost
				player.words.points = player.words.points.sub(cost)
				player.words.buyables[11] = player.words.buyables[11].add(1)
			},
		},
		12: {
			title: function () { return t("words.buy12.t") },
			cost(x) { return new Decimal(100).times(Decimal.pow(3, x)) },
			effect(x) { return new Decimal(1.1).pow(x) },
			display() {
				let data = tmp.words.buyables[12]
				return t("ui.cost") + ': ' + num(data.cost) + ' ' + t("words.resource")
					+ '<br>' + t("ui.level") + ': ' + num(getBuyableAmount("words", 12))
					+ '<br>' + t("ui.effect") + ': ×' + num(data.effect)
			},
			canAfford() { return player.words.points.gte(tmp.words.buyables[12].cost) },
			buy() {
				let cost = tmp.words.buyables[12].cost
				player.words.points = player.words.points.sub(cost)
				player.words.buyables[12] = player.words.buyables[12].add(1)
			},
			unlocked() { return hasUpgrade("words", 15) },
		},
	},

	tabFormat: [
		["display-text", function () { return mainAmount("words", true) }],
		"prestige-button",
		["display-text", function () {
			return '<span style="opacity:.65">' + t("words.ctx") + '</span>'
		}],
		["bar", "read"],
		["microtabs", "stuff"],
	],

	microtabs: {
		stuff: {
			"upgrades": { content: ["upgrades"] },
			"words": { content: ["buyables"] },
			"milestones": { content: ["milestones"] },
		},
	},

	hotkeys: [
		{
			key: "w",
			description: t("words.hotkey"),
			onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],
})
