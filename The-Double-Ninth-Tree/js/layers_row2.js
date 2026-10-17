// ===========================================================================
// Row 2 — the three crafts of the Double Ninth table, each on a branch of row 1:
//   g 糕坊 (static: the nine-layer cake, theme cap) · s 诗阁 (custom log) · m 重阳集市 (static shop)
// ===========================================================================

// ---------------------------------------------------------------------------
// 糕坊 g — static floors. 糕层 caps at exactly nine (the canon of 重阳糕).
// ---------------------------------------------------------------------------
addLayer("g", {
	name: function() { return L("糕坊", "Cake Workshop") },
	symbol: "糕",
	position: 1,
	color: "#F06292",
	resource: function() { return L("糕层", "cake layers") },
	row: 2,
	branches: ["k"],
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		total: new Decimal(0),
		best: new Decimal(0),
	}},
	baseResource: function() { return L("菊露", "chrysanthem dew") },
	baseAmount() { return player.k.points },
	requires: new Decimal(TUNING.gReq),
	type: "static",
	base: TUNING.gBase,
	exponent: 1,
	roundUpCost: true,
	// N-STATICMAX: every static layer carries canBuyMax (author #24: buy-max early).
	canBuyMax() { return true },
	// K5 theme cap: the ladder STOPS at nine layers (P8a hard ceiling).
	canReset() {
		return tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt) && player[this.layer].points.lt(TUNING.gCap)
	},
	// K5 hard ceiling: a buy-max burst may not overshoot the ninth layer.
	// (The engine's static gain is a level count; we clamp it to the cap.)
	getResetGain() {
		let cur = player[this.layer].points
		if (cur.gte(TUNING.gCap)) return new Decimal(0)
		let t = tmp[this.layer]
		let base = new Decimal(layers[this.layer].base)
		let exp = new Decimal(layers[this.layer].exponent)
		let gain = t.baseAmount.div(t.requires).div(t.gainMult).max(1)
			.log(base).times(t.gainExp).pow(exp.pow(-1))
			.times(t.directMult)
		gain = gain.floor().sub(cur).add(1).max(1)
		return gain.min(new Decimal(TUNING.gCap).sub(cur))
	},

	// static semantics inverted (07 rule 16): gainMult < 1 = cheaper floors.
	gainMult() {
		let m = new Decimal(1)
		if (hasUpgrade("g", 11)) m = m.times(0.9)
		if (hasUpgrade("g", 12)) m = m.times(0.9)
		if (hasUpgrade("g", 23)) m = m.times(upgradeEffect("g", 23))
		if (hasUpgrade("g", 24)) m = m.times(0.9)
		return m
	},
	gainExp() { return new Decimal(1) },

	layerShown() { return true },
	tooltip() { return L("制糕：菊露换糕层，恰九层止。", "Bake: dew into cake layers — nine, and no more.") },
	tooltipLocked() { return L("需 " + format(TUNING.gReq) + " 菊露", "Requires " + format(TUNING.gReq) + " dew") },

	passiveGeneration() { return 0 },
	autoPrestige() {
		if (hasMilestone("g", 0) && hasMilestone("g", 1)) return true
		if (hasMilestone("f", 4)) return true
		return false
	},
	// N-AUTOWIPE: the auto gate set {g:0,g:1,f:4} implies the reset-safe set {g:0,f:4}.
	resetsNothing() {
		if (hasMilestone("g", 0)) return true
		if (hasMilestone("f", 4)) return true
		return false
	},
	autoUpgrade() {
		if (hasMilestone("g", 2)) return true
		if (hasMilestone("f", 4)) return true
		return false
	},

	doReset(resettingLayer) {
		let kept = ["best", "total"]
		if (resettingLayer === this.layer) kept.push("points")
		if (hasMilestone("g", 2)) kept.push("upgrades")
		if (hasMilestone("f", 4)) kept.push("upgrades", "milestones")
		layerDataReset(this.layer, kept)
	},

	hotkeys: [
		{ key: "g",
		  description: function() { return L("G：重整糕坊，换糕层", "G: re-stake the workshop for cake layers") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],

	upgrades: {
		11: {
			title: function() { return L("糕方·一", "Cake Formula, First") },
			description: function() { return L("糕价（层价）×0.9。", "Cake price ×0.9.") },
			cost: new Decimal(1),
			effect() { return new Decimal(0.9) },
			effectDisplay() { return "×0.9" },
		},
		12: {
			title: function() { return L("糕方·二", "Cake Formula, Second") },
			description: function() { return L("糕价（层价）×0.9。", "Cake price ×0.9.") },
			cost: new Decimal(2),
			unlocked() { return hasUpgrade(this.layer, 11) },
			effect() { return new Decimal(0.9) },
			effectDisplay() { return "×0.9" },
		},
		13: {
			title: function() { return L("枣泥", "Jujube Filling") },
			description: function() { return L("诗阁之诗境 ×（糕层 + 1）^0.3。", "Verse gain ×(cake layers+1)^0.3.") },
			cost: new Decimal(4),
			unlocked() { return hasUpgrade(this.layer, 12) },
			effect() { return player[this.layer].points.add(1).pow(0.3) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		14: {
			title: function() { return L("糕要略", "Cake Briefing") },
			description: function() { return L("开启「制糕要略」页签。", "Unlocks the cake briefing sub-tab.") },
			cost: new Decimal(5),
			unlocked() { return hasUpgrade(this.layer, 13) },
		},
		15: {
			title: function() { return L("九重糕方", "Nine-Layer Formula") },
			description: function() { return L("重阳糕方传于市：集市「菊坛」开售。", "The nine-layer formula reaches the market: the 菊坛 stall opens.") },
			cost: new Decimal(8),
			unlocked() { return hasUpgrade(this.layer, 14) },
		},
		21: {
			title: function() { return L("糕香入径", "Scent on the Path") },
			description: function() { return L("山道里程 ×2。", "Path gain ×2.") },
			cost: new Decimal(12),
			unlocked() { return hasUpgrade(this.layer, 15) },
		},
		22: {
			title: function() { return L("糕质", "Crumb") },
			description: function() { return L("菊田之菊露 ×（糕层 + 1）^0.3。", "The field's dew ×(cake layers+1)^0.3.") },
			cost: new Decimal(16),
			unlocked() { return hasUpgrade(this.layer, 21) },
			effect() { return player[this.layer].points.add(1).pow(0.3) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		23: {
			title: function() { return L("糕方·三", "Cake Formula, Third") },
			description: function() { return L("糕价（层价）×0.8。", "Cake price ×0.8.") },
			cost: new Decimal(20),
			unlocked() { return hasUpgrade(this.layer, 22) },
			effect() { return new Decimal(0.8) },
			effectDisplay() { return "×0.8" },
		},
		24: {
			title: function() { return L("诗料相投", "Verse Meets Cake") },
			description: function() { return L("诗阁既开，糕价再 ×0.9。", "With the verse pavilion open: cake price another ×0.9.") },
			cost: new Decimal(24),
			unlocked() { return hasUpgrade(this.layer, 23) },
		},
		25: {
			title: function() { return L("市间糕方", "Market Formula") },
			description: function() { return L("重阳集市开「市货」页签。", "The market's 市货 stall opens.") },
			cost: new Decimal(28),
			unlocked() { return hasUpgrade(this.layer, 24) },
		},
		31: {
			title: function() { return L("糕气", "Cake Air") },
			description: function() { return L("山道里程 ×（糕层 + 1）^0.2。", "Path gain ×(cake layers+1)^0.2.") },
			cost: new Decimal(32),
			unlocked() { return hasUpgrade("g", 25) },
			effect() { return player[this.layer].points.add(1).pow(0.2) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
	},

	milestones: {
		0: {
			requirementDescription: function() { return L("糕层峰值 ≥ 2", "best layers ≥ 2") },
			effectDescription: function() { return L("重整糕坊不再卷走旧行。", "Re-staking the workshop no longer sweeps old rows.") },
			done() { return player[this.layer].best.gte(2) },
		},
		1: {
			requirementDescription: function() { return L("糕层峰值 ≥ 4", "best layers ≥ 4") },
			unlocked() { return hasMilestone(this.layer, 0) },
			effectDescription: function() { return L("糕坊自动重整（静层之道：护旧＋自祭）。", "The workshop re-stakes itself (the static idiom: keep-and-auto).") },
			done() { return player[this.layer].best.gte(4) },
		},
		2: {
			requirementDescription: function() { return L("糕层峰值 ≥ 6", "best layers ≥ 6") },
			unlocked() { return hasMilestone(this.layer, 1) },
			effectDescription: function() { return L("糕坊自动购方（保留已购）。", "The workshop buys its own formulas (keeps bought ones).") },
			done() { return player[this.layer].best.gte(6) },
		},
		3: {
			requirementDescription: function() { return L("糕层峰值 ≥ 9", "best layers ≥ 9") },
			unlocked() { return hasMilestone(this.layer, 2) },
			effectDescription: function() { return L("九重满糕：糕香入阁，诗境获取 ×2。", "Nine layers: the cake-scent reaches the pavilion — verse gain ×2.") },
			done() { return player[this.layer].best.gte(9) },
		},
	},

	tabFormat: [
		["display-text", function() {
			let full = player.g.points.gte(TUNING.gCap)
			return L("糕层 <b>" + formatWhole(player.g.points) + " / " + TUNING.gCap + "</b>" + (full ? "（<i>九重已满</i>）" : "") + "<br>菊露 " + format(tmp.g.baseAmount),
				"layers <b>" + formatWhole(player.g.points) + " / " + TUNING.gCap + "</b>" + (full ? " (<i>nine reached</i>)" : "") + "<br>dew " + format(tmp.g.baseAmount))
		}],
		"prestige-button",
		["microtabs", "gd"],
	],
	microtabs: {
		"gd": {
			"制糕": {
				content: ["upgrades", [11, 12, 13, 14, 15, 21, 22, 23, 24, 25, 31]],
			},
			"制糕要略": {
				unlocked() { return hasUpgrade("g", 14) },
				content: [
					["display-text", function() {
						return L("层价 = " + format(TUNING.gReq) + " × 2^层 × 倍率（倍率 " + format(tmp.g.gainMult) + "）<br>下一层需菊露 " + format(tmp.g.nextAt) + "<br>上限：恰九层（重阳糕之制）",
							"floor price = " + format(TUNING.gReq) + " × 2^layers × mult (mult " + format(tmp.g.gainMult) + ")<br>next floor needs " + format(tmp.g.nextAt) + " dew<br>ceiling: exactly nine (the canon of the cake)")
					}],
				],
			},
			"里程碑": {
				content: ["milestones", [0, 1, 2, 3]],
			},
		},
	},
})

// ---------------------------------------------------------------------------
// 诗阁 s — custom log layer (P8b): 诗境 grows on the log of 醇藏.
// ---------------------------------------------------------------------------
addLayer("s", {
	name: function() { return L("诗阁", "Verse Pavilion") },
	symbol: "诗",
	position: 2,
	color: "#4DB6AC",
	resource: function() { return L("诗境", "verse realms") },
	row: 2,
	branches: ["j"],
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		total: new Decimal(0),
		best: new Decimal(0),
	}},
	baseResource: function() { return L("醇藏", "aged wine") },
	baseAmount() { return player.j.points },
	requires: new Decimal(TUNING.sReq),
	type: "custom",

	gainMult() {
		let m = new Decimal(1)
		if (hasUpgrade("s", 11)) m = m.times(2)
		if (hasUpgrade("s", 12)) m = m.times(3)
		if (hasUpgrade("s", 13)) m = m.times(upgradeEffect("s", 13))
		if (hasUpgrade("s", 21)) m = m.times(upgradeEffect("s", 21))
		if (hasUpgrade("s", 22)) m = m.times(upgradeEffect("s", 22))
		if (hasUpgrade("s", 24)) m = m.times(4)
		// milestone 3: 九诗成集 ×2; u23: the whole verse flow ^1.1 (independent)
		if (hasMilestone("s", 3)) m = m.times(2)
		if (hasUpgrade("s", 23)) m = m.pow(1.1)
		if (hasUpgrade("g", 13)) m = m.times(upgradeEffect("g", 13))
		if (hasMilestone("g", 3)) m = m.times(2)
		if (buyableEffect("m", 12).gt(1)) m = m.times(buyableEffect("m", 12))
		if (buyableEffect("s", 11).gt(1)) m = m.times(buyableEffect("s", 11))
		return m
	},

	// P8b: log gain on the wine pool. s converts banked 醇藏 into 诗境; the gain is the
	// DELTA above what is already banked (the engine adds it to player.s.points), and the
	// next-prestige threshold is based on banked+1 — so canReset becomes true exactly when
	// one more 诗境 is in reach (the old total-based form made nextAt always sit ahead of
	// baseAmount, so s could never be prestiged and f/y were unreachable).
	getResetGain() {
		let pot = player.j.points.max(10).log10().times(this.gainMult())
		let reroot = hasUpgrade("s", 14) ? new Decimal("1e9") : new Decimal(TUNING.fRerootAtS)
		if (pot.gte(reroot)) pot = pot.sqrt().times(new Decimal("1e3"))
		return pot.sub(player.s.points).max(0)
	},
	getNextAt(canMax) {
		let target = player.s.points.add(1).div(this.gainMult())
		return Decimal.pow(10, target)
	},
	canReset() {
		return tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt)
	},
	prestigeButtonText() {
		return L("敬诗礼 · 得 " + formatWhole(tmp[this.layer].resetGain) + " 诗章",
			"verse rite · gain " + formatWhole(tmp[this.layer].resetGain) + " realms")
	},

	// N-AUTOWIPE: the auto gate {s:0,s:1,f:4} implies the reset-safe set {s:0,f:4}.
	autoPrestige() {
		if (hasMilestone("s", 0) && hasMilestone("s", 1)) return true
		if (hasMilestone("f", 4)) return true
		return false
	},
	resetsNothing() {
		if (hasMilestone("s", 0)) return true
		if (hasMilestone("f", 4)) return true
		return false
	},
	autoUpgrade() {
		if (hasMilestone("s", 2)) return true
		if (hasMilestone("f", 4)) return true
		return false
	},

	layerShown() { return true },
	tooltip() { return L("敬诗：醇藏之十进制位换诗境。", "Verse rite: the wine's decades into realms.") },
	tooltipLocked() { return L("需 " + format(TUNING.sReq) + " 醇藏", "Requires " + format(TUNING.sReq) + " wine") },

	doReset(resettingLayer) {
		let kept = ["best", "total"]
		if (resettingLayer === this.layer) kept.push("points")
		if (hasMilestone("s", 2)) kept.push("upgrades")
		if (hasMilestone("f", 4)) kept.push("upgrades", "milestones")
		layerDataReset(this.layer, kept)
	},

	hotkeys: [
		{ key: "s",
		  description: function() { return L("S：敬诗礼，换诗章", "S: the verse rite for realms") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],

	upgrades: {
		11: {
			title: function() { return L("初章", "First Stanza") },
			description: function() { return L("诗境获取 ×2。", "Verse gain ×2.") },
			cost: new Decimal(1),
		},
		12: {
			title: function() { return L("联句", "Linked Couplets") },
			description: function() { return L("诗境获取 ×3。", "Verse gain ×3.") },
			cost: new Decimal(2),
			unlocked() { return hasUpgrade(this.layer, 11) },
		},
		13: {
			title: function() { return L("沉潜", "Deep Immersion") },
			description: function() { return L("诗境获取 ×（诗境 + 1）^0.3。", "Verse gain ×(realms+1)^0.3.") },
			cost: new Decimal(4),
			unlocked() { return hasUpgrade(this.layer, 12) },
			effect() { return player[this.layer].points.add(1).pow(0.3) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		14: {
			title: function() { return L("开卷", "Open the Scroll") },
			description: function() { return L("诗境再根（P12）自 1e6 放宽至 1e9（要略可见）。", "The verse re-root from 1e6 relaxed to 1e9 (visible in the briefing).") },
			cost: new Decimal(8),
			unlocked() { return hasUpgrade(this.layer, 13) },
		},
		15: {
			title: function() { return L("诗卷", "The Verse Codex") },
			description: function() { return L("开启「诗卷」页签（九诗之目）。", "Unlocks the verse-codex sub-tab (the nine poems).") },
			cost: new Decimal(16),
			unlocked() { return hasUpgrade(this.layer, 14) },
		},
		21: {
			title: function() { return L("酒引诗", "Wine-led Verse") },
			description: function() { return L("诗境获取 ×（醇藏 + 1）^0.2。", "Verse gain ×(wine+1)^0.2.") },
			cost: new Decimal(64),
			unlocked() { return hasUpgrade(this.layer, 15) },
			effect() { return player.j.points.add(1).pow(0.2) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		22: {
			title: function() { return L("山色入诗", "Mountain Colour in Verse") },
			description: function() { return L("（键：登高有感）诗境获取 ×（诗境峰值十进制位 + 1）。", "(key: felt on the climb) verse gain ×(log10(best realms)+1).") },
			cost: new Decimal(24),
			unlocked() { return hasUpgrade(this.layer, 21) },
			effect() { return player[this.layer].best.max(10).log10().add(1) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		23: {
			title: function() { return L("九诗", "The Nine Poems") },
			description: function() { return L("诗境之流（敬诗公式）整体 ^1.1。", "The verse flow (the rite formula) as a whole, ^1.1.") },
			cost: new Decimal(128),
			unlocked() { return hasUpgrade(this.layer, 22) },
		},
		24: {
			title: function() { return L("糕诗相照", "Cake Meets Verse") },
			description: function() { return L("糕坊既立，诗境获取 ×4。", "With the cake workshop up: verse gain ×4.") },
			cost: new Decimal(192),
			unlocked() { return hasUpgrade(this.layer, 23) },
		},
		25: {
			title: function() { return L("诗阁要略", "Pavilion Briefing") },
			description: function() { return L("开启「诗阁要略」页签。", "Unlocks the pavilion briefing sub-tab.") },
			cost: new Decimal(256),
			unlocked() { return hasUpgrade(this.layer, 24) },
		},
		31: {
			title: function() { return L("诗风", "Verse Wind") },
			description: function() { return L("山道里程 ×（诗境 + 1）^0.2。", "Path gain ×(realms+1)^0.2.") },
			cost: new Decimal(10000),
			unlocked() { return hasUpgrade("s", 25) },
			effect() { return player[this.layer].points.add(1).pow(0.2) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
	},

	milestones: {
		0: {
			requirementDescription: function() { return L("诗境峰值 ≥ 2", "best realms ≥ 2") },
			effectDescription: function() { return L("敬诗不再卷走旧行。", "The verse rite no longer sweeps old rows.") },
			done() { return player[this.layer].best.gte(2) },
		},
		1: {
			requirementDescription: function() { return L("诗境峰值 ≥ 4", "best realms ≥ 4") },
			unlocked() { return hasMilestone(this.layer, 0) },
			effectDescription: function() { return L("诗阁自动敬诗。", "The pavilion keeps the rite by itself.") },
			done() { return player[this.layer].best.gte(4) },
		},
		2: {
			requirementDescription: function() { return L("诗境峰值 ≥ 8", "best realms ≥ 8") },
			unlocked() { return hasMilestone(this.layer, 1) },
			effectDescription: function() { return L("诗阁自动购卷（保留已购）。", "The pavilion buys its own stanzas (keeps bought ones).") },
			done() { return player[this.layer].best.gte(8) },
		},
		3: {
			requirementDescription: function() { return L("诗境峰值 ≥ 16", "best realms ≥ 16") },
			unlocked() { return hasMilestone(this.layer, 2) },
			effectDescription: function() { return L("九诗成集：诗境之流 ×2。", "The nine poems collected: the verse flow ×2.") },
			done() { return player[this.layer].best.gte(16) },
		},
		4: {
			requirementDescription: function() { return L("诗境峰值 ≥ 32", "best realms ≥ 32") },
			unlocked() { return hasMilestone(this.layer, 3) },
			effectDescription: function() { return L("云端之价 ×0.9（云梯更缓）。", "Cloud-tier prices ×0.9 (the ladder gentler).") },
			done() { return player[this.layer].best.gte(32) },
		},
	},

	buyables: {
		11: {
			title: function() { return L("纸墨", "Paper and Ink") },
			cost(x) { return new Decimal(5).times(Decimal.pow(2, x)).floor() },
			effect(x) { return x.add(1) },
			display() {
				let amt = getBuyableAmount(this.layer, this.id)
				return L("每级：诗境获取 ×" + format(this.effect(amt)) + "<br>成本：" + format(tmp[this.layer].buyables[this.id].cost) + " 诗境",
					"per level: verse ×" + format(this.effect(amt)) + "<br>cost: " + format(tmp[this.layer].buyables[this.id].cost) + " realms")
			},
			canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				let cost = tmp[this.layer].buyables[this.id].cost
				player[this.layer].points = player[this.layer].points.sub(cost)
				player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost)
			},
		},
	},

	tabFormat: [
		["display-text", function() {
			return L("诗境 <b>" + format(player.s.points) + "</b> · 醇藏 " + format(tmp.s.baseAmount) +
				"<br>敬诗可得 <b>" + formatWhole(tmp.s.resetGain) + "</b> 诗境" +
				(hasUpgrade("s", 14) ? "" : "（再根自 " + format(TUNING.fRerootAtS) + " 起）"),
				"realms <b>" + format(player.s.points) + "</b> · wine " + format(tmp.s.baseAmount) +
				"<br>the rite yields <b>" + formatWhole(tmp.s.resetGain) + "</b> realms" +
				(hasUpgrade("s", 14) ? "" : " (re-root from " + format(TUNING.fRerootAtS) + ")"))
		}],
		"prestige-button",
		["microtabs", "sd"],
	],
	microtabs: {
		"sd": {
			"诗卷": {
				content: ["upgrades", "blank", "buyables"],
			},
			"九诗之目": {
				unlocked() { return hasUpgrade("s", 15) },
				content: [
					["display-text", function() {
						return L("一、九日登高 · 二、东篱采菊 · 三、新醅菊花 · 四、茱萸满枝 · 五、糕香九层 · 六、市声如云 · 七、菊谱初成 · 八、诗酒风流 · 九、长命百岁<br>（九诗之目渐次开卷）",
							"1. The ninth climb · 2. Picking at the east fence · 3. New chrysanthemum wine · 4. Berries on the bough · 5. Nine layers of cake · 6. Market noise like clouds · 7. The first codex · 8. Wine and verse · 9. A hundred years")
					}],
				],
			},
			"里程碑": {
				content: ["milestones", [0, 1, 2, 3, 4]],
			},
			"诗阁要略": {
				unlocked() { return hasUpgrade("s", 25) },
				content: [
					["display-text", function() {
						return L("诗境 = log10(醇藏) × 倍率（再根 " + format(hasUpgrade("s", 14) ? "1e9" : TUNING.fRerootAtS) + "）",
							"realms = log10(wine) × mult (re-root " + format(hasUpgrade("s", 14) ? "1e9" : TUNING.fRerootAtS) + ")")
					}],
				],
			},
		},
	},
})

// ---------------------------------------------------------------------------
// 重阳集市 m — static shop. 市筹 floors; the stalls price in 菊珠 (x's jade).
// ---------------------------------------------------------------------------
addLayer("m", {
	name: function() { return L("重阳集市", "Double Ninth Market") },
	symbol: "市",
	position: 3,
	color: "#A1887F",
	resource: function() { return L("市筹", "market tallies") },
	row: 2,
	branches: ["d"],
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		total: new Decimal(0),
		best: new Decimal(0),
	}},
	baseResource: function() { return L("茱佩", "charms") },
	baseAmount() { return player.d.points },
	requires: new Decimal(TUNING.mReq),
	type: "static",
	base: TUNING.mBase,
	exponent: 1,
	roundUpCost: true,
	canBuyMax() { return true },

	gainMult() {
		let m = new Decimal(1)
		if (hasUpgrade("m", 11)) m = m.times(0.9)
		if (hasUpgrade("m", 12)) m = m.times(0.9)
		if (hasUpgrade("m", 24)) m = m.times(0.9)
		if (hasMilestone("m", 3)) m = m.times(0.8)
		return m
	},
	gainExp() {
		if (hasUpgrade("m", 22)) return new Decimal(1.15)
		return new Decimal(1)
	},

	layerShown() { return true },
	tooltip() { return L("开市：茱佩换市筹，市货以菊珠计。", "Open the market: charms into tallies; the stalls take jade.") },
	tooltipLocked() { return L("需 " + format(TUNING.mReq) + " 茱佩", "Requires " + format(TUNING.mReq) + " charms") },

	autoPrestige() {
		if (hasMilestone("m", 0) && hasMilestone("m", 1)) return true
		if (hasMilestone("f", 4)) return true
		return false
	},
	resetsNothing() {
		if (hasMilestone("m", 0)) return true
		if (hasMilestone("f", 4)) return true
		return false
	},
	autoUpgrade() {
		if (hasMilestone("m", 2)) return true
		if (hasMilestone("f", 4)) return true
		return false
	},

	doReset(resettingLayer) {
		let kept = ["best", "total"]
		if (resettingLayer === this.layer) kept.push("points")
		if (hasMilestone("m", 2)) kept.push("upgrades")
		if (hasMilestone("f", 4)) kept.push("upgrades", "milestones")
		layerDataReset(this.layer, kept)
	},

	hotkeys: [
		{ key: "m",
		  description: function() { return L("M：开市，换市筹", "M: open the market for tallies") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],

	// The named K5 mechanic: 市价 (stall prices), visible on every stall.
	marketCostMult() {
		let c = new Decimal(1)
		if (hasUpgrade("m", 13)) c = c.times(0.9)
		if (hasUpgrade("m", 15)) c = c.times(0.9)
		if (hasMilestone("m", 3)) c = c.times(0.8)
		return c
	},

	upgrades: {
		11: {
			title: function() { return L("市门", "Market Gate") },
			description: function() { return L("市筹层价 ×0.9。", "Tally floor price ×0.9.") },
			cost: new Decimal(1),
			effect() { return new Decimal(0.9) },
			effectDisplay() { return "×0.9" },
		},
		12: {
			title: function() { return L("摊棚", "Stall Sheds") },
			description: function() { return L("市筹层价 ×0.9。", "Tally floor price ×0.9.") },
			cost: new Decimal(2),
			unlocked() { return hasUpgrade(this.layer, 11) },
			effect() { return new Decimal(0.9) },
			effectDisplay() { return "×0.9" },
		},
		13: {
			title: function() { return L("市价", "Fair Prices") },
			description: function() { return L("市价：市货三摊价 ×0.9（市价在每摊可见）。", "市价: the three stall prices ×0.9 (visible on each stall).") },
			cost: new Decimal(4),
			unlocked() { return hasUpgrade(this.layer, 12) },
		},
		14: {
			title: function() { return L("市声", "Market Noise") },
			description: function() { return L("开启「市货」页签。", "Unlocks the 市货 sub-tab.") },
			cost: new Decimal(6),
			unlocked() { return hasUpgrade(this.layer, 13) },
		},
		15: {
			title: function() { return L("秤准", "True Scales") },
			description: function() { return L("市价再 ×0.9。", "市价 another ×0.9.") },
			cost: new Decimal(8),
			unlocked() { return hasUpgrade(this.layer, 14) },
		},
		21: {
			title: function() { return L("市声入径", "Noise on the Path") },
			description: function() { return L("山道里程 ×3。", "Path gain ×3.") },
			cost: new Decimal(10),
			unlocked() { return hasUpgrade(this.layer, 15) },
		},
		22: {
			title: function() { return L("市制", "Market Craft") },
			description: function() { return L("市筹层价（exponent）×1.15（更廉）。", "Tally floor price exponent ×1.15 (cheaper).") },
			cost: new Decimal(12),
			unlocked() { return hasUpgrade(this.layer, 21) },
			effect() { return new Decimal(1.15) },
			effectDisplay() { return "×1.15" },
		},
		24: {
			title: function() { return L("顶市", "Summit Market") },
			description: function() { return L("绝顶既立，市筹层价再 ×0.9。", "With the summit raised: tally price another ×0.9.") },
			cost: new Decimal(14),
			unlocked() { return hasUpgrade(this.layer, 22) },
		},
		25: {
			title: function() { return L("市会", "Market Fair") },
			description: function() { return L("开启「市要略」页签。", "Unlocks the market briefing sub-tab.") },
			cost: new Decimal(16),
			unlocked() { return hasUpgrade(this.layer, 24) },
		},
		31: {
			title: function() { return L("市香", "Market Scent") },
			description: function() { return L("山道里程 ×（市筹 + 1）^0.2。", "Path gain ×(tallies+1)^0.2.") },
			cost: new Decimal(18),
			unlocked() { return hasUpgrade("m", 25) },
			effect() { return player[this.layer].points.add(1).pow(0.2) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
	},

	milestones: {
		0: {
			requirementDescription: function() { return L("市筹峰值 ≥ 2", "best tallies ≥ 2") },
			effectDescription: function() { return L("重整市集不再卷走旧行。", "Re-staking the market no longer sweeps old rows.") },
			done() { return player[this.layer].best.gte(2) },
		},
		1: {
			requirementDescription: function() { return L("市筹峰值 ≥ 4", "best tallies ≥ 4") },
			unlocked() { return hasMilestone(this.layer, 0) },
			effectDescription: function() { return L("市集自动重整（静层之道）。", "The market re-stakes itself (the static idiom).") },
			done() { return player[this.layer].best.gte(4) },
		},
		2: {
			requirementDescription: function() { return L("市筹峰值 ≥ 8", "best tallies ≥ 8") },
			unlocked() { return hasMilestone(this.layer, 1) },
			effectDescription: function() { return L("市集自动购货（保留已购）。", "The market buys its own stock (keeps bought ones).") },
			done() { return player[this.layer].best.gte(8) },
		},
		3: {
			requirementDescription: function() { return L("市筹峰值 ≥ 12", "best tallies ≥ 12") },
			unlocked() { return hasMilestone(this.layer, 2) },
			effectDescription: function() { return L("重阳市会：市价 ×0.8（市价在每摊可见）。", "The Double Ninth fair: 市价 ×0.8 (visible on each stall).") },
			done() { return player[this.layer].best.gte(12) },
		},
	},

	// M8: the stalls. Paid in 菊珠 (x's jade) — a cross-currency shop.
	buyables: {
		11: {
			title: function() { return L("菊坛", "Chrysanthem Altar") },
			unlocked() { return hasUpgrade("g", 15) },
			currencyDisplayName: "菊珠",
			currencyLayer: "x",
			currencyInternalName: "jade",
			cost(x) { return new Decimal(10).times(Decimal.pow(2, x)).floor().times(tmp.m.marketCostMult) },
			effect(x) { return new Decimal(1).add(x) },
			display() {
				let amt = getBuyableAmount(this.layer, this.id)
				return L("每级：菊珠滴落 ×" + format(this.effect(amt)) + "<br>成本：" + format(tmp[this.layer].buyables[this.id].cost) + " 菊珠 × 市价",
					"per level: jade drip ×" + format(this.effect(amt)) + "<br>cost: " + format(tmp[this.layer].buyables[this.id].cost) + " jade × 市价")
			},
			canAfford() { return player.x.jade.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				let cost = tmp[this.layer].buyables[this.id].cost
				player.x.jade = player.x.jade.sub(cost)
				player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost)
			},
		},
		12: {
			title: function() { return L("诗笺", "Verse Slips") },
			unlocked() { return hasUpgrade("g", 25) },
			currencyDisplayName: "菊珠",
			currencyLayer: "x",
			currencyInternalName: "jade",
			cost(x) { return new Decimal(15).times(Decimal.pow(2.5, x)).floor().times(tmp.m.marketCostMult) },
			effect(x) { return new Decimal(1).add(x.div(2)) },
			display() {
				let amt = getBuyableAmount(this.layer, this.id)
				return L("每级：诗阁之诗境 ×" + format(this.effect(amt)) + "<br>成本：" + format(tmp[this.layer].buyables[this.id].cost) + " 菊珠 × 市价",
					"per level: the pavilion's verse ×" + format(this.effect(amt)) + "<br>cost: " + format(tmp[this.layer].buyables[this.id].cost) + " jade × 市价")
			},
			canAfford() { return player.x.jade.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				let cost = tmp[this.layer].buyables[this.id].cost
				player.x.jade = player.x.jade.sub(cost)
				player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost)
			},
		},
		13: {
			title: function() { return L("茱萸穗", "Charm Sprays") },
			unlocked() { return hasUpgrade("g", 25) },
			currencyDisplayName: "菊珠",
			currencyLayer: "x",
			currencyInternalName: "jade",
			cost(x) { return new Decimal(20).times(Decimal.pow(3, x)).floor().times(tmp.m.marketCostMult) },
			effect(x) { return new Decimal(1).add(x.div(4)) },
			display() {
				let amt = getBuyableAmount(this.layer, this.id)
				return L("每级：绝顶试炼之酬 ×" + format(this.effect(amt)) + "<br>成本：" + format(tmp[this.layer].buyables[this.id].cost) + " 菊珠 × 市价",
					"per level: the summit trials' reward ×" + format(this.effect(amt)) + "<br>cost: " + format(tmp[this.layer].buyables[this.id].cost) + " jade × 市价")
			},
			canAfford() { return player.x.jade.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				let cost = tmp[this.layer].buyables[this.id].cost
				player.x.jade = player.x.jade.sub(cost)
				player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost)
			},
		},
	},

	tabFormat: [
		["display-text", function() {
			return L("市筹 <b>" + formatWhole(player.m.points) + "</b> · 茱佩 " + format(tmp.m.baseAmount) + "<br>市价 ×" + format(tmp.m.marketCostMult),
				"tallies <b>" + formatWhole(player.m.points) + "</b> · charms " + format(tmp.m.baseAmount) + "<br>市价 ×" + format(tmp.m.marketCostMult))
		}],
		"prestige-button",
		["microtabs", "md"],
	],
	microtabs: {
		"md": {
			"市筹": {
				content: ["upgrades", [11, 12, 13, 14, 15, 21, 22, 24, 25, 31]],
			},
			"市货": {
				unlocked() { return hasUpgrade("m", 14) },
				content: [
					["display-text", function() { return L("菊珠 <b style='color:#FF69B4'>" + format(player.x.jade) + "</b>（于菊展剖珠得）", "jade <b style='color:#FF69B4'>" + format(player.x.jade) + "</b> (cracked at the exhibition)") }],
					"buyables",
				],
			},
			"里程碑": {
				content: ["milestones", [0, 1, 2, 3]],
			},
			"市要略": {
				unlocked() { return hasUpgrade("m", 25) },
				content: [
					["display-text", function() {
						return L("层价 = " + format(TUNING.mReq) + " × 3^筹 × 倍率（市价 " + format(tmp.m.marketCostMult) + "）<br>下一筹需茱佩 " + format(tmp.m.nextAt),
							"floor price = " + format(TUNING.mReq) + " × 3^tallies × mult (市价 " + format(tmp.m.marketCostMult) + ")<br>next tally needs " + format(tmp.m.nextAt) + " charms")
					}],
				],
			},
		},
	},
})
