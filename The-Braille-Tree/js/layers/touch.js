/* =========================================================================
 *  layers/touch.js — 指尖 / Fingertips  (row 0, the anchor layer)
 *
 *  触感 (main points) -> 指感 (this layer's currency). The three clickables
 *  are the physical verbs: 摩挲 (rub), 校准 (calibrate), 辨读 (read a burst).
 *  Every later layer must add a line to touchMult() (P10 / A7).
 * ========================================================================= */

function touchSenseCap() {
	let cap = hasUpgrade("touch", 34) ? TUNING.SENSE_CAP_RAISED : TUNING.SENSE_CAP
	cap += getBuyableAmount("touch", 12).toNumber() * 10
	return cap
}

function touchCalibrate() {
	let cap = touchSenseCap()
	if (player.touch.sensitivity < cap) return
	player.touch.sensitivity -= cap
	player.touch.senseLevel++
}

addLayer("touch", {
	name: function () { return t("touch.name") },
	symbol: function () { return t("touch.symbol") },
	position: 0,
	row: 0,
	branches: ["six", "eight", "slate"],

	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			senseLevel: 0,       // number: permanent 校准 count
			sensitivity: 0,      // number: 0..touchSenseCap()
			readCooldown: 0,     // number: seconds
		}
	},

	color: "#d9c7a3",
	resource: function () { return t("touch.resource") },
	baseResource: function () { return t("touch.baseResource") },
	baseAmount() { return player.points },
	requires: new Decimal(10),
	type: "normal",
	exponent: 0.5,

	softcap() {
		let cap = new Decimal(TUNING.SOFT.touch)
		if (hasUpgrade("touch", 23)) cap = new Decimal(TUNING.SOFT.touchRaise)
		return cap
	},
	softcapPower: TUNING.SOFT_POWER,

	gainMult() { return touchGainMult() },
	gainExp() { return new Decimal(1) },

	passiveGeneration() {
		if (hasMilestone("six", 1) || hasAchievement("ach", 13)) return 1
		return 0
	},
	autoUpgrade() {
		if (hasMilestone("six", 2) || hasAchievement("ach", 13)) return true
		return false
	},

	layerShown() { return true },

	prestigeButtonText() {
		return t("touch.button") + ' <b>' + num(tmp.touch.resetGain) + '</b> ' + t("touch.resource")
	},

	doReset(resettingLayer) {
		if (layers[resettingLayer].row > this.row) {
			layerDataReset(this.layer, [
				"unlocked", "best", "total", "upgrades", "milestones",
				"buyables", "senseLevel", "readCooldown",
			])
		}
	},

	update(diff) {
		if (player.touch.readCooldown > 0) {
			player.touch.readCooldown = Math.max(0, player.touch.readCooldown - diff)
		}
		if (hasMilestone("touch", 3)) touchCalibrate()
	},

	clickables: {
		11: {
			title: function () { return t("touch.click11.t") },
			display() {
				return t("touch.click11.d") + '<br>' + t("ui.gain") + ': '
					+ num(new Decimal(TUNING.RUB).times(rubMult()))
			},
			canClick() { return true },
			onClick() {
				player.points = player.points.add(new Decimal(TUNING.RUB).times(rubMult()))
				player.touch.sensitivity = Math.min(touchSenseCap(), player.touch.sensitivity + 1)
			},
		},
		12: {
			title: function () { return t("touch.click12.t") },
			display() {
				return t("ui.sensitivity") + ': ' + num(player.touch.sensitivity) + ' / ' + num(touchSenseCap())
					+ '<br>' + t("ui.senseLevel") + ': ' + num(player.touch.senseLevel)
			},
			canClick() { return player.touch.sensitivity >= touchSenseCap() },
			onClick() { touchCalibrate() },
			unlocked() { return hasMilestone("touch", 1) || hasUpgrade("touch", 15) },
		},
		13: {
			title: function () { return t("touch.click13.t") },
			display() {
				if (player.touch.readCooldown > 0) {
					return t("touch.click13.cd") + ': ' + num(player.touch.readCooldown) + 's'
				}
				return t("touch.click13.d") + '<br>' + t("ui.gain") + ': '
					+ num(getPointGen().times(TUNING.READ_BURST))
			},
			canClick() { return player.touch.readCooldown <= 0 && player.touch.senseLevel >= 1 },
			onClick() {
				player.touch.readCooldown = TUNING.READ_COOLDOWN
				player.points = player.points.add(getPointGen().times(TUNING.READ_BURST))
			},
			unlocked() { return player.touch.senseLevel >= 1 },
		},
	},

	bars: {
		sense: {
			direction: RIGHT,
			width: 360,
			height: 34,
			progress() { return Math.min(1, player.touch.sensitivity / touchSenseCap()) },
			display() {
				return t("ui.sensitivity") + ': ' + num(player.touch.sensitivity) + ' / ' + num(touchSenseCap())
			},
			fillStyle: { "background-color": "#d9c7a3" },
			baseStyle: { "background-color": "#3a2f24" },
			textStyle: { "color": "#f4ead8" },
			borderStyle() { return { "border-color": "#8a7a5f" } },
		},
	},

	upgrades: {
		11: {
			title: function () { return t("touch.up11.t") },
			description: function () { return t("touch.up11.d") },
			cost: new Decimal(TUNING.UPG_COSTS.touch[11]),
			effect() { return new Decimal(TUNING.MULT.touch[11]) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		12: {
			title: function () { return t("touch.up12.t") },
			description: function () { return t("touch.up12.d") },
			cost: new Decimal(TUNING.UPG_COSTS.touch[12]),
			effect() { return player.touch.points.add(1).pow(0.35) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		13: {
			title: function () { return t("touch.up13.t") },
			description: function () { return t("touch.up13.d") },
			cost: new Decimal(TUNING.UPG_COSTS.touch[13]),
			effect() { return new Decimal(TUNING.MULT.touch[13]) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		14: {
			title: function () { return t("touch.up14.t") },
			description: function () { return t("touch.up14.d") },
			cost: new Decimal(TUNING.UPG_COSTS.touch[14]),
			effect() { return player.slate.points.add(10).log10() },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		15: {
			title: function () { return t("touch.up15.t") },
			description: function () { return t("touch.up15.d") },
			cost: new Decimal(TUNING.UPG_COSTS.touch[15]),
		},
		21: {
			title: function () { return t("touch.up21.t") },
			description: function () { return t("touch.up21.d") },
			cost: new Decimal(TUNING.UPG_COSTS.touch[21]),
			unlocked() { return hasMilestone("touch", 1) || hasUpgrade("touch", 15) },
			effect() { return new Decimal(player.touch.senseLevel + 1) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		22: {
			title: function () { return t("touch.up22.t") },
			description: function () { return t("touch.up22.d") },
			cost: new Decimal(TUNING.UPG_COSTS.touch[22]),
			unlocked() { return hasMilestone("touch", 1) || hasUpgrade("touch", 15) },
			effect() { return new Decimal(TUNING.MULT.touch[22]) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		23: {
			title: function () { return t("touch.up23.t") },
			description: function () { return t("touch.up23.d") },
			cost: new Decimal(TUNING.UPG_COSTS.touch[23]),
			unlocked() { return hasMilestone("touch", 1) || hasUpgrade("touch", 15) },
		},
		24: {
			title: function () { return t("touch.up24.t") },
			description: function () { return t("touch.up24.d") },
			cost: new Decimal(TUNING.UPG_COSTS.touch[24]),
			unlocked() { return hasMilestone("touch", 1) || hasUpgrade("touch", 15) },
			effect() { return new Decimal(TUNING.MULT.touch[24]) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		25: {
			title: function () { return t("touch.up25.t") },
			description: function () { return t("touch.up25.d") },
			cost: new Decimal(TUNING.UPG_COSTS.touch[25]),
			unlocked() { return hasMilestone("touch", 1) || hasUpgrade("touch", 15) },
		},
		31: {
			title: function () { return t("touch.up31.t") },
			description: function () { return t("touch.up31.d") },
			cost: new Decimal(TUNING.UPG_COSTS.touch[31]),
			unlocked() { return hasMilestone("touch", 2) },
			effect() { return new Decimal(player.six.learned + 1).pow(0.25) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		32: {
			title: function () { return t("touch.up32.t") },
			description: function () { return t("touch.up32.d") },
			cost: new Decimal(TUNING.UPG_COSTS.touch[32]),
			unlocked() { return hasMilestone("touch", 2) },
			effect() { return player.words.points.add(1).pow(0.2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		33: {
			title: function () { return t("touch.up33.t") },
			description: function () { return t("touch.up33.d") },
			cost: new Decimal(TUNING.UPG_COSTS.touch[33]),
			unlocked() { return hasMilestone("touch", 2) },
			effect() { return new Decimal(TUNING.MULT.touch[33]) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		34: {
			title: function () { return t("touch.up34.t") },
			description: function () { return t("touch.up34.d") },
			cost: new Decimal(TUNING.UPG_COSTS.touch[34]),
			unlocked() { return hasMilestone("touch", 2) },
		},
		35: {
			title: function () { return t("touch.up35.t") },
			description: function () { return t("touch.up35.d") },
			cost: new Decimal(TUNING.UPG_COSTS.touch[35]),
			unlocked() { return hasMilestone("touch", 2) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function () { return t("touch.ms0.r") },
			effectDescription: function () { return t("touch.ms0.e") },
			done() { return player.touch.best.gte(100) },
		},
		1: {
			requirementDescription: function () { return t("touch.ms1.r") },
			effectDescription: function () { return t("touch.ms1.e") },
			done() { return player.touch.best.gte(1e3) },
		},
		2: {
			requirementDescription: function () { return t("touch.ms2.r") },
			effectDescription: function () { return t("touch.ms2.e") },
			done() { return player.touch.best.gte(1e5) },
		},
		3: {
			requirementDescription: function () { return t("touch.ms3.r") },
			effectDescription: function () { return t("touch.ms3.e") },
			done() { return player.touch.best.gte(1e7) },
		},
		4: {
			requirementDescription: function () { return t("touch.ms4.r") },
			effectDescription: function () { return t("touch.ms4.e") },
			done() { return player.touch.best.gte(1e9) },
		},
	},

	buyables: {
		11: {
			title: function () { return t("touch.buy11.t") },
			cost(x) { return new Decimal(10).times(Decimal.pow(2, x)) },
			effect(x) { return new Decimal(1.15).pow(x) },
			display() {
				let data = tmp.touch.buyables[11]
				return t("ui.cost") + ': ' + num(data.cost) + ' ' + t("touch.resource")
					+ '<br>' + t("ui.level") + ': ' + num(getBuyableAmount("touch", 11))
					+ '<br>' + t("ui.effect") + ': ×' + num(data.effect)
			},
			canAfford() { return player.touch.points.gte(tmp.touch.buyables[11].cost) },
			buy() {
				let cost = tmp.touch.buyables[11].cost
				player.touch.points = player.touch.points.sub(cost)
				player.touch.buyables[11] = player.touch.buyables[11].add(1)
			},
		},
		12: {
			title: function () { return t("touch.buy12.t") },
			cost(x) { return new Decimal(100).times(Decimal.pow(3, x)) },
			effect(x) { return new Decimal(10).times(x) },
			display() {
				let data = tmp.touch.buyables[12]
				return t("ui.cost") + ': ' + num(data.cost) + ' ' + t("touch.resource")
					+ '<br>' + t("ui.level") + ': ' + num(getBuyableAmount("touch", 12))
					+ '<br>' + t("ui.effect") + ': +' + num(data.effect) + ' ' + t("ui.sensitivity")
			},
			canAfford() { return player.touch.points.gte(tmp.touch.buyables[12].cost) },
			buy() {
				let cost = tmp.touch.buyables[12].cost
				player.touch.points = player.touch.points.sub(cost)
				player.touch.buyables[12] = player.touch.buyables[12].add(1)
			},
			unlocked() { return hasUpgrade("touch", 25) },
		},
	},

	tabFormat: [
		["display-text", function () { return mainAmount("touch", true) }],
		"prestige-button",
		["display-text", function () {
			return '<span style="opacity:.65">' + t("touch.ctx") + '</span>'
		}],
		["display-text", function () {
			return hasUpgrade("touch", 35)
				? '<div style="max-width:560px;margin:8px auto;line-height:1.7;opacity:.85">' + t("touch.story") + '</div>'
				: ''
		}],
		["microtabs", "stuff"],
	],

	microtabs: {
		stuff: {
			"upgrades": {
				content: ["upgrades"],
			},
			"sense": {
				content: [
					["display-text", function () { return t("touch.sense.intro") }],
					"clickables",
					["bar", "sense"],
					"buyables",
				],
				unlocked() { return hasMilestone("touch", 1) || hasUpgrade("touch", 15) },
			},
			"milestones": {
				content: ["milestones"],
			},
		},
	},

	hotkeys: [
		{
			key: "t",
			description: t("touch.hotkey"),
			onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],
})
