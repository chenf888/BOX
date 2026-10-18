/* =========================================================================
 *  layers/side.js — 成就 / Achievements  +  其他 / Extra
 *
 *  `ach` is a displayRow:"other" layer: 50 achievements in a 5×10 grid. Only
 *  five of them carry an effect; achievementBoost() multiplies those into every
 *  economy formula.
 *  `extra` holds stats, the story, and the language switcher.
 * ========================================================================= */

addLayer("ach", {
	name: function () { return t("ach.name") },
	symbol: function () { return t("ach.symbol") },
	position: 0,
	row: 0,
	displayRow: "side",

	startData() {
		return { unlocked: true, points: new Decimal(0) }
	},

	color: "#d8c890",
	resource: "",
	tooltip: function () { return t("ach.tooltip") },
	layerShown() { return true },
	doReset() { },

	achievements: {
		11: {
			name: function () { return t("ach.a11.n") },
			tooltip: function () { return t("ach.a11.t") },
			done() { return player.touch.points.gte(100) },
			effect() { return new Decimal(1.05) },
		},
		12: {
			name: function () { return t("ach.a12.n") },
			tooltip: function () { return t("ach.a12.t") },
			done() { return player.six.learned >= 1 },
		},
		13: {
			name: function () { return t("ach.a13.n") },
			tooltip: function () { return t("ach.a13.t") },
			done() { return player.six.learned >= 10 },
		},
		14: {
			name: function () { return t("ach.a14.n") },
			tooltip: function () { return t("ach.a14.t") },
			done() { return hasUpgrade("touch", 11) },
		},
		15: {
			name: function () { return t("ach.a15.n") },
			tooltip: function () { return t("ach.a15.t") },
			done() { return player.touch.senseLevel >= 1 },
		},
		16: {
			name: function () { return t("ach.a16.n") },
			tooltip: function () { return t("ach.a16.t") },
			done() { return player.touch.points.gte(1e3) },
		},
		17: {
			name: function () { return t("ach.a17.n") },
			tooltip: function () { return t("ach.a17.t") },
			done() { return player.six.learned >= 25 },
		},
		18: {
			name: function () { return t("ach.a18.n") },
			tooltip: function () { return t("ach.a18.t") },
			done() { return player.eight.learned >= 1 },
		},
		19: {
			name: function () { return t("ach.a19.n") },
			tooltip: function () { return t("ach.a19.t") },
			done() { return player.touch.points.gte(1e5) },
		},
		20: {
			name: function () { return t("ach.a20.n") },
			tooltip: function () { return t("ach.a20.t") },
			done() { return player.six.learned >= 50 },
		},
		21: {
			name: function () { return t("ach.a21.n") },
			tooltip: function () { return t("ach.a21.t") },
			done() { return player.slate.points.gte(1) },
			effect() { return new Decimal(1.1) },
		},
		22: {
			name: function () { return t("ach.a22.n") },
			tooltip: function () { return t("ach.a22.t") },
			done() { return player.slate.points.gte(1e3) },
		},
		23: {
			name: function () { return t("ach.a23.n") },
			tooltip: function () { return t("ach.a23.t") },
			done() { return hasMilestone("slate", 0) },
		},
		24: {
			name: function () { return t("ach.a24.n") },
			tooltip: function () { return t("ach.a24.t") },
			done() { return player.six.learned >= 32 },
		},
		25: {
			name: function () { return t("ach.a25.n") },
			tooltip: function () { return t("ach.a25.t") },
			done() { return player.eight.learned >= 100 },
		},
		26: {
			name: function () { return t("ach.a26.n") },
			tooltip: function () { return t("ach.a26.t") },
			done() { return player.slate.points.gte(1e5) },
		},
		27: {
			name: function () { return t("ach.a27.n") },
			tooltip: function () { return t("ach.a27.t") },
			done() { return hasMilestone("slate", 2) },
		},
		28: {
			name: function () { return t("ach.a28.n") },
			tooltip: function () { return t("ach.a28.t") },
			done() { return player.six.learned >= 64 },
		},
		29: {
			name: function () { return t("ach.a29.n") },
			tooltip: function () { return t("ach.a29.t") },
			done() { return player.slate.points.gte(1e6) },
		},
		30: {
			name: function () { return t("ach.a30.n") },
			tooltip: function () { return t("ach.a30.t") },
			done() { return player.eight.learned >= 128 },
		},
		31: {
			name: function () { return t("ach.a31.n") },
			tooltip: function () { return t("ach.a31.t") },
			done() { return player.contracted.unlocked },
			effect() { return new Decimal(1.1) },
		},
		32: {
			name: function () { return t("ach.a32.n") },
			tooltip: function () { return t("ach.a32.t") },
			done() { return player.nemeth.unlocked },
		},
		33: {
			name: function () { return t("ach.a33.n") },
			tooltip: function () { return t("ach.a33.t") },
			done() { return player.words.unlocked },
		},
		34: {
			name: function () { return t("ach.a34.n") },
			tooltip: function () { return t("ach.a34.t") },
			done() { return player.words.points.gte(1e3) },
		},
		35: {
			name: function () { return t("ach.a35.n") },
			tooltip: function () { return t("ach.a35.t") },
			done() { return player.music.unlocked },
		},
		36: {
			name: function () { return t("ach.a36.n") },
			tooltip: function () { return t("ach.a36.t") },
			done() { return player.contracted.points.gte(10) },
		},
		37: {
			name: function () { return t("ach.a37.n") },
			tooltip: function () { return t("ach.a37.t") },
			done() { return player.nemeth.points.gte(6) },
		},
		38: {
			name: function () { return t("ach.a38.n") },
			tooltip: function () { return t("ach.a38.t") },
			done() { return player.music.points.gte(6) },
		},
		39: {
			name: function () { return t("ach.a39.n") },
			tooltip: function () { return t("ach.a39.t") },
			done() { return player.passages.unlocked },
		},
		40: {
			name: function () { return t("ach.a40.n") },
			tooltip: function () { return t("ach.a40.t") },
			done() { return player.words.points.gte(100) },
		},
		41: {
			name: function () { return t("ach.a41.n") },
			tooltip: function () { return t("ach.a41.t") },
			done() { return hasChallenge("contracted", 11) },
			effect() { return new Decimal(1.1) },
		},
		42: {
			name: function () { return t("ach.a42.n") },
			tooltip: function () { return t("ach.a42.t") },
			done() { return hasChallenge("contracted", 12) },
		},
		43: {
			name: function () { return t("ach.a43.n") },
			tooltip: function () { return t("ach.a43.t") },
			done() { return player.passages.points.gte(1e3) },
		},
		44: {
			name: function () { return t("ach.a44.n") },
			tooltip: function () { return t("ach.a44.t") },
			done() { return player.passages.points.gte(1e4) },
		},
		45: {
			name: function () { return t("ach.a45.n") },
			tooltip: function () { return t("ach.a45.t") },
			done() { return player.library.unlocked },
		},
		46: {
			name: function () { return t("ach.a46.n") },
			tooltip: function () { return t("ach.a46.t") },
			done() { return player.library.points.gte(10) },
		},
		47: {
			name: function () { return t("ach.a47.n") },
			tooltip: function () { return t("ach.a47.t") },
			done() { return player.library.points.gte(100) },
		},
		48: {
			name: function () { return t("ach.a48.n") },
			tooltip: function () { return t("ach.a48.t") },
			done() { return player.library.points.gte(500) },
		},
		49: {
			name: function () { return t("ach.a49.n") },
			tooltip: function () { return t("ach.a49.t") },
			done() { return player.library.points.gte(750) },
		},
		50: {
			name: function () { return t("ach.a50.n") },
			tooltip: function () { return t("ach.a50.t") },
			done() { return player.library.points.gte(1000) },
		},
		51: {
			name: function () { return t("ach.a51.n") },
			tooltip: function () { return t("ach.a51.t") },
			done() { return hasMilestone("touch", 4) },
			effect() { return new Decimal(1.05) },
		},
		52: {
			name: function () { return t("ach.a52.n") },
			tooltip: function () { return t("ach.a52.t") },
			done() { return hasMilestone("six", 3) },
		},
		53: {
			name: function () { return t("ach.a53.n") },
			tooltip: function () { return t("ach.a53.t") },
			done() { return hasMilestone("eight", 3) },
		},
		54: {
			name: function () { return t("ach.a54.n") },
			tooltip: function () { return t("ach.a54.t") },
			done() { return hasMilestone("slate", 2) },
		},
		55: {
			name: function () { return t("ach.a55.n") },
			tooltip: function () { return t("ach.a55.t") },
			done() { return hasMilestone("contracted", 3) },
		},
		56: {
			name: function () { return t("ach.a56.n") },
			tooltip: function () { return t("ach.a56.t") },
			done() { return hasMilestone("nemeth", 2) },
		},
		57: {
			name: function () { return t("ach.a57.n") },
			tooltip: function () { return t("ach.a57.t") },
			done() { return hasMilestone("music", 2) },
		},
		58: {
			name: function () { return t("ach.a58.n") },
			tooltip: function () { return t("ach.a58.t") },
			done() { return hasMilestone("words", 4) },
		},
		59: {
			name: function () { return t("ach.a59.n") },
			tooltip: function () { return t("ach.a59.t") },
			done() { return hasMilestone("passages", 3) },
		},
		60: {
			name: function () { return t("ach.a60.n") },
			tooltip: function () { return t("ach.a60.t") },
			done() { return hasMilestone("library", 9) },
		},
	},

	tabFormat: [
		["display-text", function () {
			let n = 0
			for (let id in layers.ach.achievements) if (hasAchievement("ach", id)) n++
			return '<div style="font-size:22px">' + t("ach.header") + ': ' + n + ' / 50</div>'
		}],
		["blank", "12px"],
		"achievements",
	],

	componentStyles: {
		achievement: { "width": "72px", "height": "72px" },
	},
})

addLayer("extra", {
	name: function () { return t("extra.name") },
	symbol: function () { return t("extra.symbol") },
	position: 1,
	row: 0,
	displayRow: "side",

	startData() {
		return { unlocked: true, points: new Decimal(0) }
	},

	color: "#9a9a9a",
	resource: "",
	tooltip: function () { return t("extra.tooltip") },
	layerShown() { return true },
	doReset() { },

	tabFormat: {
		"stats": {
			content: [
				["display-text", function () {
					return '<div style="font-size:20px">' + t("extra.stats.title") + '</div><br>'
						+ t("touch.resource") + ': ' + num(player.touch.points) + '<br>'
						+ t("six.resource") + ': ' + num(player.six.learned) + ' / 64<br>'
						+ t("eight.resource") + ': ' + num(player.eight.learned) + ' / 256<br>'
						+ t("slate.resource") + ': ' + num(player.slate.points) + '<br>'
						+ t("contracted.resource") + ': ' + num(player.contracted.points) + '<br>'
						+ t("nemeth.resource") + ': ' + num(player.nemeth.points) + '<br>'
						+ t("music.resource") + ': ' + num(player.music.points) + '<br>'
						+ t("words.resource") + ': ' + num(player.words.points) + '<br>'
						+ t("passages.resource") + ': ' + num(player.passages.points) + '<br>'
						+ t("library.resource") + ': ' + num(player.library.points)
				}],
			],
		},
		"story": {
			content: [
				["display-text", function () {
					return '<div style="max-width:640px;line-height:1.7;text-align:left">'
						+ t("extra.story.body") + '</div>'
				}],
			],
		},
		"settings": {
			content: [
				["raw-html", function () { return langSettingsHtml() }],
				["blank", "16px"],
				["display-text", function () { return '<span style="opacity:.6">' + t("extra.settings.note") + '</span>' }],
			],
		},
	},
})
