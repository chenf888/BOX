/* =========================================================================
 *  layers/eight.js — 八点盲文 / Eight-dot Braille  (row 1)
 *
 *  The second board: 2x4 dots, 256 combinations. The target dot list flashes
 *  for a few seconds, then hides — the player must reproduce it from memory
 *  (u12 lengthens the flash). Hard cap 256 on `learned`.
 * ========================================================================= */

var EIGHT_GRID_IDS = [101, 102, 103, 104, 201, 202, 203, 204]

function eightDotBit(id) {
	return { 101: 1, 102: 2, 103: 4, 104: 8, 201: 16, 202: 32, 203: 64, 204: 128 }[id] || 0
}

function eightDotNumber(id) {
	return { 101: 1, 102: 2, 103: 3, 104: 4, 201: 5, 202: 6, 203: 7, 204: 8 }[id] || 0
}

function eightPatternMask() {
	let mask = 0
	for (let i = 0; i < EIGHT_GRID_IDS.length; i++) {
		let id = EIGHT_GRID_IDS[i]
		if (player.eight.grid[id]) mask |= eightDotBit(id)
	}
	return mask
}

function eightPatternMatches() {
	return eightPatternMask() === eightTarget(player.eight.targetIndex).mask
}

function eightClearGrid() {
	for (let i = 0; i < EIGHT_GRID_IDS.length; i++) player.eight.grid[EIGHT_GRID_IDS[i]] = 0
}

function eightAutoFill() {
	let target = eightTarget(player.eight.targetIndex).mask
	for (let i = 0; i < EIGHT_GRID_IDS.length; i++) {
		let id = EIGHT_GRID_IDS[i]
		player.eight.grid[id] = (target & eightDotBit(id)) ? 1 : 0
	}
}

function eightFlashMs() {
	let ms = TUNING.FLASH_MS
	if (hasUpgrade("eight", 12)) ms += TUNING.FLASH_MS_PER_UPGRADE * 2
	return ms
}

function eightShowTarget() {
	return Date.now() < player.eight.showUntil
}

function eightTargetText() {
	let target = eightTarget(player.eight.targetIndex)
	let line = t("ui.target") + ': '
	if (eightShowTarget()) {
		line += '<b>' + t("ui.dots") + ' ' + target.dots + '</b>'
	} else {
		line += '<b style="opacity:.7">' + t("ui.hidden") + '</b>'
	}
	line += '<br><span style="opacity:.7">' + t("eight.learned") + ': ' + num(player.eight.learned) + ' / ' + TUNING.CAP.eight + '</span>'
	line += '<br><span style="color:' + (eightPatternMatches() ? "#8fd18f" : "#d18f8f") + '">'
		+ (eightPatternMatches() ? t("ui.matched") : t("ui.notMatched")) + '</span>'
	return line
}

addLayer("eight", {
	name: function () { return t("eight.name") },
	symbol: function () { return t("eight.symbol") },
	position: 1,
	row: 1,
	branches: ["nemeth", "music"],

	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			learned: 0,
			targetIndex: 0,
			matched: false,
			showUntil: 0,
			grid: { 101: 0, 102: 0, 103: 0, 104: 0, 201: 0, 202: 0, 203: 0, 204: 0 },
		}
	},

	color: "#9374a7",
	resource: function () { return t("eight.resource") },
	baseResource: function () { return t("eight.baseResource") },
	baseAmount() { return player.touch.points },
	requires: new Decimal(TUNING.REQ.eight),
	type: "custom",

	getResetGain() { return eightGain() },
	getNextAt() { return new Decimal(TUNING.REQ.eight) },
	canReset() {
		return player.touch.points.gte(TUNING.REQ.eight) && eightPatternMatches()
	},
	prestigeButtonText() {
		let status = eightPatternMatches() ? t("ui.matched") : t("ui.notMatched")
		return t("eight.button") + '<br><span style="font-size:.8em;opacity:.8">' + status + '</span>'
	},
	canBuyMax() { return false },

	onPrestige(gain) {
		let g = Math.max(1, Math.floor(gain.toNumber()))
		if (!isFinite(g)) g = TUNING.CAP.eight
		player.eight.learned = Math.min(TUNING.CAP.eight, player.eight.learned + g)
		player.eight.targetIndex = (player.eight.targetIndex + g) % EIGHT_TARGETS.length
		eightClearGrid()
		player.eight.showUntil = Date.now() + eightFlashMs()
		if (hasUpgrade("eight", 23)) {
			addPoints("slate", new Decimal(g).times(TUNING.PAPER.base).times(3))
		}
	},

	update(diff) {
		if (!player.eight.unlocked && player.touch.points.gte(TUNING.REQ.eight)) player.eight.unlocked = true
		if (player.eight.showUntil === 0) player.eight.showUntil = Date.now() + eightFlashMs()
		if (hasMilestone("words", 0) || hasAchievement("ach", 41)) eightAutoFill()
		player.eight.matched = eightPatternMatches()
	},

	resetsNothing() {
		return hasMilestone("eight", 0) || hasMilestone("words", 0) || hasAchievement("ach", 41)
	},
	autoPrestige() {
		return hasMilestone("eight", 0) || hasMilestone("words", 0) || hasAchievement("ach", 41)
	},

	doReset(resettingLayer) {
		if (layers[resettingLayer].row > this.row) {
			layerDataReset(this.layer, [
				"unlocked", "best", "total", "learned", "targetIndex",
				"upgrades", "milestones", "buyables",
			])
		}
	},

	grid: {
		rows: 2,
		cols: 4,
		getStartData(id) { return 0 },
		getTitle(data, id) { return t("ui.dot") + ' ' + eightDotNumber(id) },
		getDisplay(data, id) { return data ? "●" : "○" },
		getStyle(data, id) {
			return data
				? { "background-color": "#9374a7", "color": "#120f16", "font-size": "26px" }
				: { "background-color": "#2a241d", "color": "#8a7a5f", "font-size": "26px" }
		},
		getCanClick(data, id) {
			return !(hasMilestone("words", 0) || hasAchievement("ach", 41))
		},
		onClick(data, id) {
			player[this.layer].grid[id] = data ? 0 : 1
		},
	},

	upgrades: {
		11: {
			title: function () { return t("eight.up11.t") },
			description: function () { return t("eight.up11.d") },
			cost: new Decimal(TUNING.UPG_COSTS.eight[11]),
			effect() { return new Decimal(1).add(Math.floor(Math.pow(player.eight.learned + 1, 0.4) / 16)) },
			effectDisplay() { return '+' + num(this.effect()) + ' ' + t("ui.charPerMatch") },
		},
		12: {
			title: function () { return t("eight.up12.t") },
			description: function () { return t("eight.up12.d") },
			cost: new Decimal(TUNING.UPG_COSTS.eight[12]),
		},
		13: {
			title: function () { return t("eight.up13.t") },
			description: function () { return t("eight.up13.d") },
			cost: new Decimal(TUNING.UPG_COSTS.eight[13]),
			effect() { return new Decimal(player.eight.learned + 1).pow(0.2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		14: {
			title: function () { return t("eight.up14.t") },
			description: function () { return t("eight.up14.d") },
			cost: new Decimal(TUNING.UPG_COSTS.eight[14]),
			effect() { return new Decimal(TUNING.MULT.eight[14]) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		15: {
			title: function () { return t("eight.up15.t") },
			description: function () { return t("eight.up15.d") },
			cost: new Decimal(TUNING.UPG_COSTS.eight[15]),
		},
		21: {
			title: function () { return t("eight.up21.t") },
			description: function () { return t("eight.up21.d") },
			cost: new Decimal(TUNING.UPG_COSTS.eight[21]),
			unlocked() { return hasUpgrade("eight", 15) },
			effect() { return player.touch.points.add(1).pow(0.15) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		22: {
			title: function () { return t("eight.up22.t") },
			description: function () { return t("eight.up22.d") },
			cost: new Decimal(TUNING.UPG_COSTS.eight[22]),
			unlocked() { return hasUpgrade("eight", 15) },
		},
		23: {
			title: function () { return t("eight.up23.t") },
			description: function () { return t("eight.up23.d") },
			cost: new Decimal(TUNING.UPG_COSTS.eight[23]),
			unlocked() { return hasUpgrade("eight", 15) },
		},
		24: {
			title: function () { return t("eight.up24.t") },
			description: function () { return t("eight.up24.d") },
			cost: new Decimal(TUNING.UPG_COSTS.eight[24]),
			unlocked() { return hasUpgrade("eight", 15) },
			effect() { return player.slate.points.add(1).pow(0.1) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		25: {
			title: function () { return t("eight.up25.t") },
			description: function () { return t("eight.up25.d") },
			cost: new Decimal(TUNING.UPG_COSTS.eight[25]),
			unlocked() { return hasUpgrade("eight", 15) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function () { return t("eight.ms0.r") },
			effectDescription: function () { return t("eight.ms0.e") },
			done() { return player.eight.learned >= 64 },
		},
		1: {
			requirementDescription: function () { return t("eight.ms1.r") },
			effectDescription: function () { return t("eight.ms1.e") },
			done() { return player.eight.learned >= 128 },
		},
		2: {
			requirementDescription: function () { return t("eight.ms2.r") },
			effectDescription: function () { return t("eight.ms2.e") },
			done() { return player.eight.learned >= 192 },
		},
		3: {
			requirementDescription: function () { return t("eight.ms3.r") },
			effectDescription: function () { return t("eight.ms3.e") },
			done() { return player.eight.learned >= 256 },
		},
	},

	buyables: {
		11: {
			title: function () { return t("eight.buy11.t") },
			cost(x) { return Decimal.pow(2, x) },
			effect(x) { return x.add(1) },
			display() {
				let data = tmp.eight.buyables[11]
				return t("ui.cost") + ': ' + num(data.cost) + ' ' + t("eight.resource")
					+ '<br>' + t("ui.level") + ': ' + num(getBuyableAmount("eight", 11))
					+ '<br>' + t("ui.effect") + ': +' + num(data.effect) + ' ' + t("ui.charPerMatch")
			},
			canAfford() { return player.eight.points.gte(tmp.eight.buyables[11].cost) },
			buy() {
				let cost = tmp.eight.buyables[11].cost
				player.eight.points = player.eight.points.sub(cost)
				player.eight.buyables[11] = player.eight.buyables[11].add(1)
				player.eight.spentOnBuyables = player.eight.spentOnBuyables.add(cost)
			},
			unlocked() { return hasUpgrade("eight", 15) },
		},
	},

	tabFormat: [
		["display-text", function () { return mainAmount("eight", true) }],
		"prestige-button",
		["display-text", function () { return eightTargetText() }],
		"grid",
		["microtabs", "stuff"],
	],

	microtabs: {
		stuff: {
			"upgrades": { content: ["upgrades"] },
			"legend": {
				content: [
					["display-text", function () { return t("eight.legendIntro") }],
					["display-text", function () { return t("eight.legendDots") }],
				],
				unlocked() { return hasUpgrade("eight", 25) },
			},
			"milestones": { content: ["milestones"] },
		},
	},

	hotkeys: [
		{
			key: "e",
			description: t("eight.hotkey"),
			onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],
})
