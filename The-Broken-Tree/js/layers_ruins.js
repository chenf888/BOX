// Render Ruins (r), the Ghost exhibit (gh) and the 1200-Upgrade Wall (wall).

var MEGA_NAME = "★".repeat(60) + "مرحبا".repeat(30) + "🜁🔥".repeat(40)

var WALL_UPGRADES = {}
for (let i = 1; i <= 1200; i++) {
	WALL_UPGRADES[i] = {
		title: "Brick #" + i,
		description: "A brick. Wall height: " + i + ". No effect, no economy — pure render mass.",
		cost: new Decimal(i),
	}
}

// R5: six nested microtab families. TMT renders microtabs data from the LAYER's microtabs
// property (tabFormat only references the key), and each family needs its own subtab tracking key.
var R_MICROTABS = {
	nest1: { "Level 1": { content: [["raw-html", function () { return "Level 1 of 6. Click through the tabs below." }], ["microtabs", "nest2"]] } },
	nest2: { "Level 2": { content: [["raw-html", function () { return "Level 2 of 6." }], ["microtabs", "nest3"]] } },
	nest3: { "Level 3": { content: [["raw-html", function () { return "Level 3 of 6." }], ["microtabs", "nest4"]] } },
	nest4: { "Level 4": { content: [["raw-html", function () { return "Level 4 of 6." }], ["microtabs", "nest5"]] } },
	nest5: { "Level 5": { content: [["raw-html", function () { return "Level 5 of 6." }], ["microtabs", "nest6"]] } },
	nest6: { "Level 6": { content: [["raw-html", function () { return "Level 6 of 6 — bottom of the rabbit hole. The renderer is fine down here." }]] } },
}

addLayer("r", {
	name() {
		if (armed("R4")) return MEGA_NAME
		return "Render Ruins"
	},
	symbol: "R",
	position: 2,
	startData() { return { unlocked: false, points: new Decimal(0) } },
	color: "#40C4FF",
	resource: "shards",
	row: 1,
	layerShown() { return player.r.unlocked || hasUpgrade("p", 13) },
	branch: ["p"],
	baseResource: "points",
	baseAmount() { return player.points },
	requires: new Decimal(60),
	type: "normal",
	exponent: 0.5,
	microtabs: R_MICROTABS,
	upgrades: {
		11: {
			title: "Chaos Key",
			description: "Unlocks the Challenge Chaos wing (c).",
			cost: new Decimal(30),
			onPurchase() { player.c.unlocked = true },
		},
		12: {
			title: "Payload",
			description: "<img src=x onerror=\"window.__BT_XSS=1\">This description went through Vue interpolation. If a broken image icon appears here, HTML was executed.",
			cost: new Decimal(15),
		},
	},
	tabFormat: [
		["raw-html", function () {
			return "Shards: <b>" + format(player.r.points) + "</b><br>" +
				"<span style='opacity:0.75'>R1 lives on the ghost layer, R2 on the wall layer. R3–R6 are wired into this very tab — R3 is the component after the infobox, which does not exist in the engine.</span>"
		}],
		"upgrades",
		["raw-html", function () { return "<h3>R5 — 6-deep microtabs (control)</h3>" }],
		["microtabs", "nest1"],
		["infobox", "xss"],
		"this_component_does_not_exist",
	],
	infoboxes: {
		xss: {
			title: "R6 — HTML injection sink",
			body() {
				return '<img src=x onerror="window.__BT_XSS2=1">Infobox bodies are rendered with v-html in stock TMT. ' +
					'If <code>window.__BT_XSS2</code> exists in the console, the engine has a live HTML sink here. ' +
					'The upgrade R6 (Payload) carries the same payload through the interpolated channel.'
			},
		},
	},
})

// R1: the ghost. One real upgrade, one wrapped 1-element tabFormat item —
// the column renderer has no branch for it, so the whole tab renders NOTHING, forever.
addLayer("gh", {
	name: "Ghost",
	symbol: "👻",
	position: 3,
	startData() { return { unlocked: false, points: new Decimal(0) } },
	color: "#9E9E9E",
	resource: "echoes",
	row: 1,
	layerShown() { return player.gh.unlocked || hasUpgrade("p", 13) },
	branch: ["p"],
	baseResource: "points",
	baseAmount() { return player.points },
	requires: new Decimal(10),
	type: "normal",
	exponent: 0.5,
	upgrades: {
		11: {
			title: "Echo",
			description: "A perfectly real upgrade on a perfectly invisible tab.",
			cost: new Decimal(1),
		},
	},
	tabFormat: [["upgrades"]],
})

// R2: 1200 upgrade buttons, the layer only exists while its fuse burns.
addLayer("wall", {
	name: "The Wall",
	symbol: "🧱",
	position: 4,
	startData() { return { unlocked: true, points: new Decimal(0) } },
	color: "#8D6E63",
	resource: "bricks",
	row: 1,
	layerShown() { return armed("R2") },
	branch: ["p"],
	requires: new Decimal(10),
	baseResource: "points",
	baseAmount() { return player.points },
	type: "none",
	upgrades: WALL_UPGRADES,
	tabFormat: [
		["raw-html", function () { return "<h2>1200 upgrade buttons. Open at your own risk.</h2>" }],
		"upgrades",
	],
})
