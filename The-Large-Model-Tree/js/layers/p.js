// ============================================================================
// p — 参数 Parameters（row 1）
// 用上下文训练出更大的模型。参数量显示为 10^参数级；里程碑对应真实模型规模史。
// ============================================================================

addLayer("p", {
	name: "parameters",
	symbol: "Pa",
	position: 0,
	row: 1,
	color: "#ff79c6",
	resource() { return L("参数级", "Parameters") },
	resZh: "参数级（每级 ×10 参数）", resEn: "parameter levels (×10 params each)",
	baseResource: "上下文 Context",
	baseZh: "上下文", baseEn: "context",
	baseAmount() { return player.c.points },
	requires: new Decimal(100),
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
		let tb = player.p.best.max(1).log(10).add(1).pow(TUNING.EFF.pToken)
		if (hasUpgrade("p", 14)) tb = tb.pow(TUNING.META.p14) // K4：缩放定律
		return {
			tokenBoost: tb,
			cBoost: player.p.best.max(1).log(10).add(1).pow(TUNING.EFF.pC),
		}
	},
	effectDescription() {
		let e = layers.p.effect()
		return L("，token ×", ", tokens ×") + format(e.tokenBoost) + L("，上下文 ×", ", context ×") + format(e.cBoost)
	},

	gainMult() {
		let m = new Decimal(1)
		if (hasMilestone("p", 3)) m = m.times(TUNING.MS.p3)
		if (hasUpgrade("p", 12)) m = m.times(player.p.points.add(1).pow(TUNING.SELF.p12))
		if (hasUpgrade("p", 13)) m = m.times(player.c.best.max(1).log(10).add(1).pow(TUNING.SHAPE.p13))
		if (hasUpgrade("p", 22) && player.c.best.gte(1e6)) m = m.times(5)
		if (hasUpgrade("p", 23)) m = m.times(player.d.best.max(1).log(10).add(1).pow(TUNING.SHAPE.p23))
		if (player.a.unlocked) m = m.times(layers.a.effect().pBoost)
		if (player.d.unlocked) m = m.times(layers.d.effect().pBoost)
		if (hasUpgrade("a", 23)) m = m.times(TUNING.UPG.a23)
		if (hasUpgrade("d", 15)) m = m.times(TUNING.UPG.d15)
		m = m.times(Decimal.pow(1.15, getBuyableAmount("p", 11)))
		if (inChallenge("tr", 14)) m = m.times(TUNING.CHAL.nerf14)
		if (hasChallenge("tr", 14)) m = m.times(Decimal.pow(TUNING.CHAL.rw14, challengeCompletions("tr", 14)))
		return m
	},
	gainExp() { return new Decimal(1) },

	layerShown() { return player.c.best.gte(100) || player.p.unlocked },

	// ---- 自动化（d m0 声望包 + d m1 自动升级；autoPrestige ⊇ resetsNothing）----
	resetsNothing() { return hasMilestone("d", 0) },
	autoPrestige() { return hasMilestone("d", 0) },
	passiveGeneration() { if (hasMilestone("d", 2)) return 0.1; return 0 },
	autoUpgrade() { return hasMilestone("d", 1) },

	hotkeys: [
		{ key: "p", description() { return L("P: 训练更大的参数", "P: Train bigger parameters") }, onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	branches: ["c"],

	doReset(resettingLayer) {
		if (!(layers[resettingLayer].row > this.row)) return
		let kept = ["best", "total", "milestones"]
		if (hasMilestone("p", 2)) kept.push("upgrades")
		layerDataReset(this.layer, kept)
	},

	tabFormat: [
		["display-text", tokenLineFn()],
		["display-text", baseLineFn("p", "#7ee787")],
		["display-text", mainLineFn("p")],
		["display-text", function() {
			return L("≈ 参数量：", "≈ parameter count: ") +
				"<b style='color:#ff79c6'>" + format(Decimal.pow(10, player.p.points)) + "</b>"
		}],
		["display-text", bestLineFn("p")],
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
					["raw-html", function() { return "<div style='opacity:.5'>" + L("参数是能力的天花板——先有规模，才有智能。", "Parameters are the ceiling of ability — scale first, intelligence after.") + "</div>" }],
					"blank", "upgrades",
				],
			},
			"Milestones": { content: [["blank", "15px"], "milestones"] },
			"Buyables": { content: ["buyables"] },
		},
	},

	upgrades: {
		11: {
			title() { return L("参数效率", "Parameter efficiency") },
			description() { return L("token 产出 ×2。", "Token gain ×2.") },
			cost: new Decimal(1),
			unlocked() { return true },
		},
		12: {
			title() { return L("残差连接", "Residual connections") },
			description() { return L("参数收益 ×(参数+1)^0.35。", "Parameter gain ×(params+1)^0.35.") },
			cost: new Decimal(5),
			unlocked() { return hasUpgrade("p", 11) },
			effect() { return player.p.points.add(1).pow(TUNING.SELF.p12) },
		},
		13: {
			title() { return L("层归一化", "Layer normalization") },
			description() { return L("参数收益 ×(log₁₀(上下文最高)+1)^1.1。", "Parameter gain ×(log₁₀(best context)+1)^1.1.") },
			cost: new Decimal(50),
			unlocked() { return hasUpgrade("p", 12) },
			effect() { return player.c.best.max(1).log(10).add(1).pow(TUNING.SHAPE.p13) },
		},
		14: {
			title() { return L("缩放定律", "Scaling laws") },
			description() { return L("参数的 token 加成 ^1.1（命名机制）。", "Parameters' token boost ^1.1 (named mechanic).") },
			cost: new Decimal(500),
			unlocked() { return hasUpgrade("p", 13) },
		},
		15: {
			title() { return L("语料整理", "Corpus curation") },
			description() { return L("上下文收益 ×2。", "Context gain ×2.") },
			cost: new Decimal(2000),
			unlocked() { return hasUpgrade("p", 14) },
		},
		16: {
			title() { return L("知识压缩", "Knowledge compression") },
			description() { return L("token 产出 ×(log₁₀(参数最高)+1)^1.4。", "Token gain ×(log₁₀(best params)+1)^1.4.") },
			cost: new Decimal(1e4),
			unlocked() { return hasUpgrade("p", 15) },
			effect() { return player.p.best.max(1).log(10).add(1).pow(TUNING.SHAPE.p16) },
		},
		21: {
			title() { return L("显存复用", "Memory reuse") },
			description() { return L("算力成本 ×0.85（更便宜）。", "Compute cost ×0.85 (cheaper).") },
			cost: new Decimal(5e4),
			unlocked() { return hasMilestone("p", 2) },
		},
		22: {
			title() { return L("混合专家 MoE", "Mixture of Experts") },
			description() { return L("上下文最高 ≥ 1e6 时，参数收益 ×5。", "While best context ≥ 1e6: parameter gain ×5.") },
			cost: new Decimal(1e6),
			unlocked() { return hasUpgrade("p", 21) },
		},
		23: {
			title() { return L("数据回流", "Data flywheel") },
			description() { return L("参数收益 ×(log₁₀(数据最高)+1)。", "Parameter gain ×(log₁₀(best data)+1).") },
			cost: new Decimal(1e7),
			unlocked() { return hasUpgrade("p", 22) },
			effect() { return player.d.best.max(1).log(10).add(1).pow(TUNING.SHAPE.p23) },
		},
		24: {
			title() { return L("万亿俱乐部", "Trillion club") },
			description() { return L("token 产出 ×3。", "Token gain ×3.") },
			cost: new Decimal(1e9),
			unlocked() { return hasUpgrade("p", 23) },
		},
	},

	milestones: {
		0: {
			requirementDescription() { return L("参数级 25（≈1 亿参数）", "25 parameter levels (≈100M params)") },
			effectDescription() { return L("上下文收益 ×", "Context gain ×") + format(TUNING.MS.p0) },
			done() { return player.p.best.gte(25) },
		},
		1: {
			requirementDescription() { return L("参数级 50（≈10 万亿参数）", "50 parameter levels") },
			effectDescription() { return L("上下文自动扩充（自动声望 + 重置不再清空下层）。", "Context auto-extends (auto-prestige, resets nothing below).") },
			unlocked() { return hasMilestone("p", 0) },
			done() { return player.p.best.gte(TUNING.AUTO.p1) },
		},
		2: {
			requirementDescription() { return L("参数级 250", "250 parameter levels") },
			effectDescription() { return L("重置保留本层升级；token ×", "Keep this layer's upgrades; token ×") + format(TUNING.MS.p2) },
			unlocked() { return hasMilestone("p", 1) },
			done() { return player.p.best.gte(250) },
		},
		3: {
			requirementDescription() { return L("参数级 500", "500 parameter levels") },
			effectDescription() { return L("参数收益 ×2。", "Parameter gain ×2.") },
			unlocked() { return hasMilestone("p", 2) },
			done() { return player.p.best.gte(500) },
		},
		4: {
			requirementDescription() { return L("参数级 2500", "2500 parameter levels") },
			effectDescription() { return L("token 产出 ×", "Token gain ×") + format(TUNING.MS.p4) },
			unlocked() { return hasMilestone("p", 3) },
			done() { return player.p.best.gte(2500) },
		},
	},

	buyables: {
		11: {
			title() { return L("🔧 微调轮次", "🔧 Fine-tune epochs") },
			cost(x) { return new Decimal(50).times(Decimal.pow(2.5, x)) },
			effect(x) { return Decimal.pow(1.15, x) },
			display() {
				return L("参数收益 ×", "Parameter gain ×") + format(tmp[this.layer].buyables[this.id].effect) +
					"<br>" + L("等级", "Level") + ": " + formatWhole(getBuyableAmount(this.layer, this.id)) +
					"<br>" + L("价格", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + L(" 参数", " params")
			},
			canAfford() { return player.p.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player.p.points = player.p.points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(tmp[this.layer].buyables[this.id].cost)
			},
			style() { return { "background-color": "#0d1117", "color": "#ff79c6" } },
		},
	},
})
