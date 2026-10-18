/* =========================================================================
 *  layers/six.js — 六点盲文 / Six-dot Braille  (row 1)
 *
 *  The first dot board: a 2x3 grid of six dots. The player raises dots to
 *  match the target cell, then presses the prestige button. `learned` is a
 *  lifetime count capped at 64 (Q3); `points` stays spendable so upgrades can
 *  be bought and re-earned by practising.
 * ========================================================================= */

var SIX_GRID_IDS = [101, 102, 103, 201, 202, 203]

function sixDotBit(id) {
	if (id === 101) return 1
	if (id === 102) return 2
	if (id === 103) return 4
	if (id === 201) return 8
	if (id === 202) return 16
	if (id === 203) return 32
	return 0
}

function sixDotNumber(id) {
	return { 101: 1, 102: 2, 103: 3, 201: 4, 202: 5, 203: 6 }[id] || 0
}

function sixPatternMask() {
	let mask = 0
	for (let i = 0; i < SIX_GRID_IDS.length; i++) {
		let id = SIX_GRID_IDS[i]
		if (player.six.grid[id]) mask |= sixDotBit(id)
	}
	return mask
}

function sixPatternMatches() {
	return sixPatternMask() === sixTarget(player.six.targetIndex).mask
}

function sixClearGrid() {
	for (let i = 0; i < SIX_GRID_IDS.length; i++) player.six.grid[SIX_GRID_IDS[i]] = 0
}

function sixAutoFill() {
	let target = sixTarget(player.six.targetIndex).mask
	for (let i = 0; i < SIX_GRID_IDS.length; i++) {
		let id = SIX_GRID_IDS[i]
		player.six.grid[id] = (target & sixDotBit(id)) ? 1 : 0
	}
}

function sixHintOn() {
	return hasUpgrade("six", 12)
}

function sixTargetText() {
	let target = sixTarget(player.six.targetIndex)
	let line = t("ui.target") + ': '
	if (target.letter) {
		line += '<b style="font-size:1.3em">' + target.label + '</b>'
		if (sixHintOn()) line += ' <span style="opacity:.7">(' + t("ui.dots") + ' ' + target.dots + ')</span>'
	} else if (target.digit) {
		line += '<b style="font-size:1.3em">' + target.label + '</b>'
		if (sixHintOn()) line += ' <span style="opacity:.7">(' + t("ui.dots") + ' ' + target.dots + ')</span>'
	} else {
		line += '<b>' + t("ui.dots") + ' ' + target.dots + '</b>'
	}
	line += '<br><span style="opacity:.7">' + t("six.learned") + ': ' + num(player.six.learned) + ' / ' + TUNING.CAP.six + '</span>'
	line += '<br><span style="color:' + (sixPatternMatches() ? "#8fd18f" : "#d18f8f") + '">'
		+ (sixPatternMatches() ? t("ui.matched") : t("ui.notMatched")) + '</span>'
	return line
}

function sixLegendHtml() {
	let out = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;max-width:640px;margin:0 auto;font-size:.9em">'
	for (let L in SIX_LETTERS) {
		out += '<div>' + L + ' = ' + dotsLabel(SIX_LETTERS[L], 6) + '</div>'
	}
	out += '</div>'
	return out
}

addLayer("six", {
	name: function () { return t("six.name") },
	symbol: function () { return t("six.symbol") },
	position: 0,
	row: 1,
	branches: ["contracted"],

	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			learned: 0,          // number, hard-capped at 64 (distinct cells)
			targetIndex: 0,      // number, 0..63
			matched: false,
			grid: { 101: 0, 102: 0, 103: 0, 201: 0, 202: 0, 203: 0 },
		}
	},

	color: "#6b8e6b",
	resource: function () { return t("six.resource") },
	baseResource: function () { return t("six.baseResource") },
	baseAmount() { return player.touch.points },
	requires: new Decimal(TUNING.REQ.six),
	type: "custom",

	getResetGain() { return sixGain() },
	getNextAt() { return new Decimal(TUNING.REQ.six) },
	canReset() {
		return player.touch.points.gte(TUNING.REQ.six) && sixPatternMatches()
	},
	prestigeButtonText() {
		let status = sixPatternMatches() ? t("ui.matched") : t("ui.notMatched")
		return t("six.button") + '<br><span style="font-size:.8em;opacity:.8">' + status + '</span>'
	},
	canBuyMax() { return false },

	onPrestige(gain) {
		let g = Math.max(1, Math.floor(gain.toNumber()))
		if (!isFinite(g)) g = TUNING.CAP.six
		player.six.learned = Math.min(TUNING.CAP.six, player.six.learned + g)
		player.six.targetIndex = (player.six.targetIndex + g) % SIX_TARGETS.length
		sixClearGrid()
		if (hasUpgrade("six", 23)) {
			addPoints("slate", new Decimal(g).times(TUNING.PAPER.base).times(2))
		}
	},

	update(diff) {
		if (!player.six.unlocked && player.touch.points.gte(TUNING.REQ.six)) player.six.unlocked = true
		if (hasMilestone("words", 0) || hasAchievement("ach", 41)) sixAutoFill()
		player.six.matched = sixPatternMatches()
	},

	resetsNothing() {
		return hasMilestone("six", 0) || hasMilestone("words", 0) || hasAchievement("ach", 41)
	},
	autoPrestige() {
		return hasMilestone("six", 0) || hasMilestone("words", 0) || hasAchievement("ach", 41)
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
		cols: 3,
		getStartData(id) { return 0 },
		getTitle(data, id) { return t("ui.dot") + ' ' + sixDotNumber(id) },
		getDisplay(data, id) { return data ? "●" : "○" },
		getStyle(data, id) {
			return data
				? { "background-color": "#6b8e6b", "color": "#10140f", "font-size": "26px" }
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
			title: function () { return t("six.up11.t") },
			description: function () { return t("six.up11.d") },
			cost: new Decimal(TUNING.UPG_COSTS.six[11]),
			effect() { return new Decimal(1).add(Math.floor(Math.pow(player.six.learned + 1, 0.4) / 8)) },
			effectDisplay() { return '+' + num(this.effect()) + ' ' + t("ui.charPerMatch") },
		},
		12: {
			title: function () { return t("six.up12.t") },
			description: function () { return t("six.up12.d") },
			cost: new Decimal(TUNING.UPG_COSTS.six[12]),
		},
		13: {
			title: function () { return t("six.up13.t") },
			description: function () { return t("six.up13.d") },
			cost: new Decimal(TUNING.UPG_COSTS.six[13]),
			effect() { return new Decimal(player.six.learned + 1).pow(0.2) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		14: {
			title: function () { return t("six.up14.t") },
			description: function () { return t("six.up14.d") },
			cost: new Decimal(TUNING.UPG_COSTS.six[14]),
			effect() { return new Decimal(TUNING.MULT.six[14]) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		15: {
			title: function () { return t("six.up15.t") },
			description: function () { return t("six.up15.d") },
			cost: new Decimal(TUNING.UPG_COSTS.six[15]),
		},
		21: {
			title: function () { return t("six.up21.t") },
			description: function () { return t("six.up21.d") },
			cost: new Decimal(TUNING.UPG_COSTS.six[21]),
			unlocked() { return hasUpgrade("six", 15) },
			effect() { return player.touch.points.add(1).pow(0.15) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		22: {
			title: function () { return t("six.up22.t") },
			description: function () { return t("six.up22.d") },
			cost: new Decimal(TUNING.UPG_COSTS.six[22]),
			unlocked() { return hasUpgrade("six", 15) },
		},
		23: {
			title: function () { return t("six.up23.t") },
			description: function () { return t("six.up23.d") },
			cost: new Decimal(TUNING.UPG_COSTS.six[23]),
			unlocked() { return hasUpgrade("six", 15) },
		},
		24: {
			title: function () { return t("six.up24.t") },
			description: function () { return t("six.up24.d") },
			cost: new Decimal(TUNING.UPG_COSTS.six[24]),
			unlocked() { return hasUpgrade("six", 15) },
			effect() { return player.slate.points.add(1).pow(0.1) },
			effectDisplay() { return '×' + num(this.effect()) },
		},
		25: {
			title: function () { return t("six.up25.t") },
			description: function () { return t("six.up25.d") },
			cost: new Decimal(TUNING.UPG_COSTS.six[25]),
			unlocked() { return hasUpgrade("six", 15) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function () { return t("six.ms0.r") },
			effectDescription: function () { return t("six.ms0.e") },
			done() { return player.six.learned >= 16 },
		},
		1: {
			requirementDescription: function () { return t("six.ms1.r") },
			effectDescription: function () { return t("six.ms1.e") },
			done() { return player.six.learned >= 32 },
		},
		2: {
			requirementDescription: function () { return t("six.ms2.r") },
			effectDescription: function () { return t("six.ms2.e") },
			done() { return player.six.learned >= 48 },
		},
		3: {
			requirementDescription: function () { return t("six.ms3.r") },
			effectDescription: function () { return t("six.ms3.e") },
			done() { return player.six.learned >= 64 },
		},
	},

	buyables: {
		11: {
			title: function () { return t("six.buy11.t") },
			cost(x) { return Decimal.pow(2, x) },
			effect(x) { return x.add(1) },
			display() {
				let data = tmp.six.buyables[11]
				return t("ui.cost") + ': ' + num(data.cost) + ' ' + t("six.resource")
					+ '<br>' + t("ui.level") + ': ' + num(getBuyableAmount("six", 11))
					+ '<br>' + t("ui.effect") + ': +' + num(data.effect) + ' ' + t("ui.charPerMatch")
			},
			canAfford() { return player.six.points.gte(tmp.six.buyables[11].cost) },
			buy() {
				let cost = tmp.six.buyables[11].cost
				player.six.points = player.six.points.sub(cost)
				player.six.buyables[11] = player.six.buyables[11].add(1)
				player.six.spentOnBuyables = player.six.spentOnBuyables.add(cost)
			},
			unlocked() { return hasUpgrade("six", 15) },
		},
	},

	tabFormat: [
		["display-text", function () { return mainAmount("six", true) }],
		"prestige-button",
		["display-text", function () { return sixTargetText() }],
		"grid",
		["microtabs", "stuff"],
	],

	microtabs: {
		stuff: {
			"upgrades": { content: ["upgrades"] },
			"legend": {
				content: [
					["display-text", function () { return t("six.legendIntro") }],
					["display-text", function () { return sixLegendHtml() }],
				],
				unlocked() { return hasUpgrade("six", 25) },
			},
			"milestones": { content: ["milestones"] },
		},
	},

	hotkeys: [
		{
			key: "s",
			description: t("six.hotkey"),
			onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],
})
