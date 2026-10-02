// Number Zoo (n) and Gain Exploders (g). All pathologies are gated on armed(id) from mod.js.

addLayer("n", {
	name: "Number Zoo",
	symbol: "N",
	position: 0,
	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			lab5: "",
			lab6: "",
		}
	},
	color: "#7E57C2",
	resource: "specimens",
	row: 1,
	layerShown() { return player.n.unlocked || hasUpgrade("p", 11) },
	branch: ["p"],
	baseResource: "points",
	baseAmount() { return player.points },
	requires: new Decimal(30),
	type: "normal",
	exponent: 0.5,
	upgrades: {
		11: {
			title: "Saboteur Key",
			description: "Unlocks the Save Saboteur wing (s).",
			cost: new Decimal(10),
			onPurchase() { player.s.unlocked = true },
		},
		12: {
			title: "Sqrt Lens",
			description: "Displays the square root of your specimens. Of course it goes NaN on negatives.",
			cost: new Decimal(5),
		},
	},
	tabFormat: [
		["raw-html", function () {
			return "Specimens: <b>" + format(player.n.points) + "</b>" +
				"<br><span style='opacity:0.75'>Detonators for Z1–Z6 live in the Museum (M). This tab is the vivarium floor.</span>"
		}],
		["raw-html", function () {
			if (!hasUpgrade("n", 12)) return "Sqrt Lens: <i>buy n-12 to install</i>"
			return "Sqrt Lens: <b>" + format(player.n.points.pow(0.5)) + "</b>"
		}],
		["raw-html", function () {
			return "Lab readout (Z5 Underflow Ray): <b>" + (player.n.lab5 || "arm Z5 in the Museum") + "</b>"
		}],
		["raw-html", function () {
			return "Lab readout (Z6 Exotic Division): <b>" + (player.n.lab6 || "arm Z6 in the Museum") + "</b>"
		}],
		"upgrades",
	],
})

addLayer("g", {
	name: "Gain Exploders",
	symbol: "G",
	position: 1,
	startData() { return { unlocked: false, points: new Decimal(0) } },
	color: "#FF8C00",
	resource: "boom",
	row: 1,
	layerShown() { return player.g.unlocked || hasUpgrade("p", 12) },
	branch: ["p"],
	baseResource: "points",
	baseAmount() { return player.points },
	requires() {
		if (armed("G3")) return Decimal.max(1, new Decimal(1e6).div(player.points.add(1)))
		return new Decimal(50)
	},
	type: "normal",
	exponent() {
		if (armed("G6")) return 1.2
		return 0.5
	},
	passiveGeneration() {
		// G4: break_eternity valueOf() returns a STRING — small Decimals coerce fine (silent speedup),
		// but a layer>=1 Decimal like "ee9" parses as NaN in the engine's numeric multiply.
		if (armed("G4")) return new Decimal("ee9")
		return 1
	},
	gainMult() {
		let mult = new Decimal(1)
		if (armed("G1")) {
			mult = mult.times(player.g.points.add(1).pow(0.5))
			mult = mult.times(player.g.points.add(1).pow(0.5))
			mult = mult.times(player.g.points.add(1).pow(0.5))
		}
		if (armed("G2")) mult = mult.times(new Decimal(1e15))
		return mult
	},
	update() { },
	upgrades: {
		11: {
			title: "Twister Key",
			description: "Unlocks the Time Twister wing (t).",
			cost: new Decimal(25),
			onPurchase() { player.t.unlocked = true },
		},
		12: {
			title: "Overpressure",
			description: "Doubles boom gain. Completely innocent.",
			cost: new Decimal(20),
			effect() { return new Decimal(2) },
		},
	},
	tabFormat: [
		["raw-html", function () {
			return "Boom: <b>" + format(player.g.points) + "</b> (growing passively — this is the run-away wing)<br>" +
				"<span style='opacity:0.75'>Requires: " + format(tmp.g.requires) + " · exponent: " + format(tmp.g.exponent) + " · passiveGeneration: " + tmp.g.passiveGeneration + "</span>"
		}],
		["raw-html", function () {
			return "Bool Lens (G5): new Decimal(true) = <b>" + format(new Decimal(armed("G5") ? true : 1)) + "</b> — the boolean idiom from The Mycelium Tree, evaluated in a Decimal context."
		}],
		"upgrades",
	],
})
