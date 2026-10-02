// Save Saboteur (s), Time Twister (t), Challenge Chaos (c) and the Vault (v).

addLayer("s", {
	name: "Save Saboteur",
	symbol: "S",
	position: 0,
	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			loop: null,
			blob: "",
			box: new Decimal(0),
			fn: null,
		}
	},
	color: "#B84C4C",
	resource: "corruption",
	row: 2,
	layerShown() { return player.s.unlocked || hasUpgrade("n", 11) },
	branch: ["n"],
	baseResource: "points",
	baseAmount() { return player.points },
	requires: new Decimal(1000),
	type: "normal",
	exponent: 0.5,
	upgrades: {
		11: {
			title: "Corruption Double",
			description: "Doubles corruption gain. The save files look nervous.",
			cost: new Decimal(5),
		},
	},
	tabFormat: [
		["raw-html", function () {
			let loopState = player.s.loop ? "<b style='color:#FF5050'>CIRCULAR (game loop will die within one tick — refresh after reading this)</b>" : "null"
			let blobSize = player.s.blob ? player.s.blob.length.toLocaleString() + " chars" : "empty"
			return "Corruption: <b>" + format(player.s.points) + "</b><br><br>" +
				"S1 loop state: " + loopState + "<br>" +
				"S2 blob state: " + blobSize + "<br>" +
				"S3 box value: <b>" + format(player.s.box) + "</b> <span style='opacity:0.75'>(arm S3, wait ~5s for autosave, reload — the probe predicts this reads 0)</span><br>" +
				"S4 function present: <b>" + (player.s.fn ? "yes" : "no") + "</b> <span style='opacity:0.75'>(JSON.stringify silently drops it)</span>"
		}],
		"upgrades",
	],
})

addLayer("t", {
	name: "Time Twister",
	symbol: "T",
	position: 1,
	startData() { return { unlocked: false, points: new Decimal(0) } },
	color: "#FFA726",
	resource: "chrono",
	row: 2,
	layerShown() { return player.t.unlocked || hasUpgrade("g", 11) },
	branch: ["g"],
	baseResource: "points",
	baseAmount() { return player.points },
	requires: new Decimal(5000),
	type: "normal",
	exponent: 0.5,
	update() {
		if (armed("T3")) doReset("p")
	},
	upgrades: {
		11: {
			title: "Chrono Double",
			description: "Doubles chrono gain. Perfectly on time.",
			cost: new Decimal(10),
		},
	},
	tabFormat: [
		["raw-html", function () {
			let tp = player.timePlayed
			return "Chrono: <b>" + format(player.t.points) + "</b><br><br>" +
				"timePlayed: <b>" + tp + "</b> s " + (tp < 0 ? "<span style='opacity:0.75'>(T1 armed — negative time)</span>" : "") + "<br>" +
				"Log Lens: <b>" + format(new Decimal(tp).log10()) + "</b> " +
				"<span style='opacity:0.75'>(log10 of negative time is NaN; format() displays it and sets the harmless player.hasNaN flag — the tripwire does not fire on display paths)</span><br>" +
				"T3 storm: " + (armed("T3") ? "<b style='color:#FF5050'>EATING THE CONTROL GROUP</b>" : "dormant") + "<br>" +
				"T2 bomb: " + (armed("T2") ? "<b style='color:#FF5050'>maxTickLength lifted, offTime burning</b>" : "dormant")
		}],
		"upgrades",
	],
})

addLayer("c", {
	name: "Challenge Chaos",
	symbol: "C",
	position: 2,
	startData() { return { unlocked: false, points: new Decimal(0) } },
	color: "#AB47BC",
	resource: "paradox",
	row: 2,
	layerShown() { return player.c.unlocked || hasUpgrade("r", 11) },
	branch: ["r"],
	baseResource: "points",
	baseAmount() { return player.points },
	requires: new Decimal(4000),
	type: "normal",
	exponent() {
		return 0.5 + 0.08 * (player.c.challenges[12] || 0)
	},
	challenges: {
		12: {
			name: "Ouroboros",
			challengeDescription: "Point generation is ×1e18 inside. Goal: 1e8 paradox. Each completion permanently adds +0.08 to this layer's own prestige exponent — including while inside, so later completions come faster. Nothing caps it but the completion limit.",
			goal: new Decimal("1e8"),
			completionLimit: 15,
			rewardEffect() {
				return new Decimal(0.08).times(player.c.challenges[12] || 0)
			},
			rewardDisplay() {
				return "Current exponent bonus: +" + (0.08 * (player.c.challenges[12] || 0)).toFixed(2)
			},
		},
	},
	buyables: {
		11: {
			title: "Recursion Coil",
			cost(x) { return new Decimal(0) },
			display() {
				return "Level: " + formatWhole(player.c.buyables[11]) +
					"<br>Cost: 0 paradox<br><br>Every purchase buys itself again while exhibit C1 is armed. Arm C1 in the Museum, then click this — repeatedly if you enjoy stack traces."
			},
			canAfford() { return true },
			buy() {
				player.c.buyables[11] = player.c.buyables[11].add(1)
				if (armed("C1")) buyBuyable("c", 11)
			},
		},
	},
	upgrades: {
		21: {
			title: "Vault Promise",
			description: "Unlocks the Vault (v). Trust the text. (Exhibit C3: this upgrade has no onPurchase — the layer never appears.)",
			cost: new Decimal(10),
		},
		22: {
			title: "Vault Wiring",
			description: "Unlocks the Vault (v). Properly wired this time.",
			cost: new Decimal(20),
			onPurchase() { player.v.unlocked = true },
		},
	},
	tabFormat: [
		"main-display",
		"prestige-button",
		["raw-html", function () {
			return "Current exponent: <b>" + format(tmp.c.exponent) + "</b> (0.5 + 0.08 × Ouroboros completions)"
		}],
		"challenges",
		"buyables",
		"upgrades",
	],
})

addLayer("v", {
	name: "The Vault",
	symbol: "🏦",
	position: 0,
	startData() { return { unlocked: false, points: new Decimal(0) } },
	color: "#FFD700",
	resource: "treasure",
	row: 3,
	layerShown() { return player.v.unlocked || hasUpgrade("c", 22) },
	branch: ["c"],
	type: "none",
	tabFormat: [
		["raw-html", function () {
			return "<h2>You found the Vault.</h2><div>Empty, of course — but you only got here because c-22 actually called " +
				"<code>player.v.unlocked = true</code> in its onPurchase. The unlock wiring worked. " +
				"Buy c-21 and enjoy the silence instead.</div>"
		}],
	],
})
