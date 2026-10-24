// ============================================================================
// d — 数据 Data（row 2）
// 用大模型合成高质量数据。数据质量是 scaling law 的另一半。
// ============================================================================

addLayer("d", {
	name: "data",
	symbol: "Da",
	position: 0,
	row: 2,
	color: "#ffa657",
	resource() { return L("数据", "Data") },
	resZh: "数据", resEn: "Data",
	baseResource: "参数级 Parameters",
	baseZh: "参数", baseEn: "parameters",
	baseAmount() { return player.p.points },
	requires: new Decimal(2500),
	prestigeButtonText() {
		const res = L(layers[this.layer].resZh, layers[this.layer].resEn)
		const bres = L(layers[this.layer].baseZh, layers[this.layer].baseEn)
		const t = tmp[this.layer], pl = player[this.layer]
		const g = (t.resetGain && t.resetGain.lt) ? t.resetGain : new Decimal(0) // 启动期 tmp 未就绪
		let s = pl.points.lt(1e3) ? L("重置为 +", "Reset for +") : ""
		s += "<b>" + formatWhole(g) + "</b> " + res
		if (g.lt(100) && pl.points.lt(1e3))
			s += "<br><br>" + L("下一次需要 ", "Next at ") + (t.roundUpCost ? formatWhole(t.nextAt) : format(t.nextAt)) + " " + bres
		return s
	},
	type: "normal",
	exponent: 0.4,

	startData() {
		return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) }
	},

	effect() {
		let tb = player.d.best.max(1).log(10).add(1).pow(TUNING.EFF.dToken)
		if (hasUpgrade("d", 14)) tb = tb.pow(TUNING.META.d14) // K4：数据配比
		return {
			tokenBoost: tb,
			pBoost: player.d.best.max(1).log(10).add(1).pow(TUNING.EFF.dP),
			aBoost: player.d.best.max(1).log(10).add(1).pow(TUNING.EFF.dA),
		}
	},
	effectDescription() {
		let e = layers.d.effect()
		return L("，token ×", ", tokens ×") + format(e.tokenBoost) +
			L("，参数 ×", ", params ×") + format(e.pBoost) +
			L("，注意力 ×", ", attention ×") + format(e.aBoost)
	},

	gainMult() {
		let m = new Decimal(1)
		if (hasMilestone("d", 3)) m = m.times(TUNING.MS.d3)
		if (hasUpgrade("d", 12)) m = m.times(player.d.points.add(1).pow(TUNING.SELF.d12))
		if (hasUpgrade("d", 13)) m = m.times(player.f.best.max(1).log(10).add(1).pow(TUNING.SHAPE.d13))
		if (hasUpgrade("d", 22) && player.a.best.gte(1e5)) m = m.times(5)
		if (hasUpgrade("d", 23)) m = m.times(player.tr.best.max(1).log(10).add(1).pow(TUNING.SHAPE.d23))
		m = m.times(Decimal.pow(1.15, getBuyableAmount("d", 11)))
		if (hasUpgrade("f", 12)) m = m.times(player.f.points.add(1).pow(TUNING.SHAPE.f12))
		if (hasUpgrade("f", 23)) m = m.times(player.tr.best.max(1).log(10).add(1).pow(TUNING.SHAPE.f23))
		if (player.f.unlocked) m = m.times(layers.f.effect().dBoost)
		if (player.tr.unlocked) m = m.times(layers.tr.effect().dBoost)
		if (hasUpgrade("tr", 24)) m = m.times(TUNING.UPG.tr24)
		return m
	},
	gainExp() { return new Decimal(1) },

	softcap() { return new Decimal(TUNING.CAPS.d.start) },
	softcapPower() { return new Decimal(TUNING.CAPS.d.power) },

	layerShown() { return player.p.best.gte(500) || player.d.unlocked },

	// ---- 自动化（tr m3 package；d m4 自动买升级）----
	resetsNothing() { return hasMilestone("tr", 3) },
	autoPrestige() { return hasMilestone("tr", 3) },
	passiveGeneration() { if (hasMilestone("d", 2)) return 0.1; return 0 },
	autoUpgrade() { return hasMilestone("d", 4) },

	hotkeys: [
		{ key: "d", description() { return L("D: 构造数据集", "D: Build the dataset") }, onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	branches: ["p"],

	doReset(resettingLayer) {
		if (!(layers[resettingLayer].row > this.row)) return
		let kept = ["best", "total", "milestones"]
		if (hasMilestone("d", 0)) kept.push("upgrades")
		layerDataReset(this.layer, kept)
	},

	tabFormat: [
		["display-text", tokenLineFn()],
		["display-text", baseLineFn("d", "#ff79c6")],
		["display-text", mainLineFn("d")],
		["display-text", bestLineFn("d")],
		["display-text", softcapLineFn("d", function() { return new Decimal(TUNING.CAPS.d.start) }, "#ffa657")],
		"blank",
		"prestige-button",
		"blank",
		["microtabs", "stuff"],
		["blank", "65px"],
	],
	microtabs: {
		stuff: {
			"Upgrades": {
				content: [
					["raw-html", function() { return "<div style='opacity:.5'>" + L("Model will learn what you feed it. Garbage in, garbage out.", "Model will learn what you feed it. Garbage in, garbage out.") + "</div>" }],
					"blank", "upgrades",
				],
			},
			"Milestones": { content: [["blank", "15px"], "milestones"] },
			"Buyables": { content: ["buyables"] },
		},
	},

	upgrades: {
		11: {
			title() { return L("数据清洗", "Data cleaning") },
			description() { return L("token 产出 ×2。", "Token gain ×2.") },
			cost: new Decimal(1),
			unlocked() { return true },
		},
		12: {
			title() { return L("去重管道", "Dedup pipeline") },
			description() { return L("数据收益 ×(数据+1)^0.3。", "Data gain ×(data+1)^0.3.") },
			cost: new Decimal(5),
			unlocked() { return hasUpgrade("d", 11) },
			effect() { return player.d.points.add(1).pow(TUNING.SELF.d12) },
		},
		13: {
			title() { return L("质量过滤", "Quality filtering") },
			description() { return L("数据收益 ×(log₁₀(算力最高)+1)^1.3。", "Data gain ×(log₁₀(best compute)+1)^1.3.") },
			cost: new Decimal(100),
			unlocked() { return hasUpgrade("d", 12) },
			effect() { return player.f.best.max(1).log(10).add(1).pow(TUNING.SHAPE.d13) },
		},
		14: {
			title() { return L("数据配比", "Data mixture") },
			description() { return L("数据的 token 加成 ^1.1（命名机制）。", "Data's token boost ^1.1 (named mechanic).") },
			cost: new Decimal(2500),
			unlocked() { return hasUpgrade("d", 13) },
		},
		15: {
			title() { return L("合成数据", "Synthetic data") },
			description() { return L("参数收益 ×2。", "Parameter gain ×2.") },
			cost: new Decimal(1e4),
			unlocked() { return hasUpgrade("d", 14) },
		},
		16: {
			title() { return L("全网语料", "Web-scale corpus") },
			description() { return L("token 产出 ×(log₁₀(数据最高)+1)^1.4。", "Token gain ×(log₁₀(best data)+1)^1.4.") },
			cost: new Decimal(1e5),
			unlocked() { return hasUpgrade("d", 15) },
			effect() { return player.d.best.max(1).log(10).add(1).pow(TUNING.SHAPE.d16) },
		},
		21: {
			title() { return L("MinHash 去重", "MinHash dedup") },
			description() { return L("算力成本 ×0.8（更便宜）。", "Compute cost ×0.8 (cheaper).") },
			cost: new Decimal(1e6),
			unlocked() { return hasMilestone("d", 2) },
		},
		22: {
			title() { return L("指令数据", "Instruction data") },
			description() { return L("注意力最高 ≥ 1e5 时，数据收益 ×5。", "While best attention ≥ 1e5: data gain ×5.") },
			cost: new Decimal(1e7),
			unlocked() { return hasUpgrade("d", 21) },
		},
		23: {
			title() { return L("合成数据飞轮", "Synthetic flywheel") },
			description() { return L("数据收益 ×(log₁₀(训练最高)+1)^1.2。", "Data gain ×(log₁₀(best training)+1)^1.2.") },
			cost: new Decimal(1e8),
			unlocked() { return hasUpgrade("d", 22) },
			effect() { return player.tr.best.max(1).log(10).add(1).pow(TUNING.SHAPE.d23) },
		},
		24: {
			title() { return L("蒸馏数据集", "Distilled dataset") },
			description() { return L("token 产出 ×4。", "Token gain ×4.") },
			cost: new Decimal(1e9),
			unlocked() { return hasUpgrade("d", 23) },
		},
	},

	milestones: {
		0: {
			requirementDescription() { return L("数据 10", "Data 10") },
			effectDescription() { return L("参数自动训练（自动声望 + 重置不再清空下层）；本层升级重置保留。", "Parameters auto-train (auto-prestige, resets nothing); keep this layer's upgrades.") },
			done() { return player.d.best.gte(10) },
		},
		1: {
			requirementDescription() { return L("数据 50", "Data 50") },
			effectDescription() { return L("自动购买参数升级。", "Auto-buy parameter upgrades.") },
			unlocked() { return hasMilestone("d", 0) },
			done() { return player.d.best.gte(TUNING.AUTO.d1) },
		},
		2: {
			requirementDescription() { return L("数据 500", "Data 500") },
			effectDescription() { return L("数据随时间自然增长；token ×", "Data trickles in; token ×") + format(TUNING.MS.d2) },
			unlocked() { return hasMilestone("d", 1) },
			done() { return player.d.best.gte(500) },
		},
		3: {
			requirementDescription() { return L("数据 5000", "Data 5000") },
			effectDescription() { return L("数据收益 ×", "Data gain ×") + format(TUNING.MS.d3) },
			unlocked() { return hasMilestone("d", 2) },
			done() { return player.d.best.gte(5000) },
		},
		4: {
			requirementDescription() { return L("数据 5e4", "Data 5e4") },
			effectDescription() { return L("token ×", "Token ×") + format(TUNING.MS.d4) + L("；自动购买本层升级。", "; auto-buy this layer's upgrades.") },
			unlocked() { return hasMilestone("d", 3) },
			done() { return player.d.best.gte(5e4) },
		},
	},

	buyables: {
		11: {
			title() { return L("⚖ 数据配比器", "⚖ Data mixer") },
			cost(x) { return new Decimal(50).times(Decimal.pow(2.5, x)) },
			effect(x) { return Decimal.pow(1.15, x) },
			display() {
				return L("数据收益 ×", "Data gain ×") + format(tmp[this.layer].buyables[this.id].effect) +
					L("<br>网页:书:代码 = 6:2:2（大概）。", "<br>web:books:code = 6:2:2 (roughly).") +
					"<br>" + L("等级", "Level") + ": " + formatWhole(getBuyableAmount(this.layer, this.id)) +
					"<br>" + L("价格", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + L(" 数据", " data")
			},
			canAfford() { return player.d.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player.d.points = player.d.points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(tmp[this.layer].buyables[this.id].cost)
			},
			style() { return { "background-color": "#0d1117", "color": "#ffa657" } },
		},
	},
})
