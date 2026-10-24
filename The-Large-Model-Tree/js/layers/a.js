// ============================================================================
// a — 注意力 Attention（row 1，晚于 p 解锁的同排分支）
// "Attention Is All You Need"。里程碑对应注意力机制的进化史：
// MHA → MQA → GQA → FlashAttention → MLA。
// ============================================================================

addLayer("a", {
	name: "attention",
	symbol: "At",
	position: 1,
	row: 1,
	color: "#d2a8ff",
	resource() { return L("注意力", "Attention") },
	resZh: "注意力", resEn: "Attention",
	baseResource: "上下文 Context",
	baseZh: "上下文", baseEn: "context",
	baseAmount() { return player.c.points },
	requires: new Decimal(500),
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
		let pb = player.a.best.max(1).log(10).add(1).pow(TUNING.EFF.aP)
		if (hasUpgrade("a", 14)) pb = pb.pow(TUNING.META.a14) // K4：多头机制
		return {
			tokenBoost: player.a.best.max(1).log(10).add(1).pow(TUNING.EFF.aToken),
			pBoost: pb,
			cBoost: player.a.best.max(1).log(10).add(1).pow(TUNING.EFF.aC),
		}
	},
	effectDescription() {
		let e = layers.a.effect()
		return L("，token ×", ", tokens ×") + format(e.tokenBoost) +
			L("，参数 ×", ", params ×") + format(e.pBoost) +
			L("，上下文 ×", ", context ×") + format(e.cBoost)
	},

	gainMult() {
		let m = new Decimal(1)
		if (hasMilestone("a", 3)) m = m.times(TUNING.MS.a3)
		if (hasUpgrade("a", 12)) m = m.times(player.a.points.add(1).pow(TUNING.SELF.a12))
		if (hasUpgrade("a", 13)) m = m.times(player.p.best.max(1).log(10).add(1).pow(TUNING.SHAPE.a13))
		if (hasUpgrade("a", 22) && player.p.best.gte(500)) m = m.times(5)
		m = m.times(Decimal.pow(1.15, getBuyableAmount("a", 11)))
		m = m.times(Decimal.pow(1.18, getBuyableAmount("a", 13)))
		if (player.d.unlocked) m = m.times(layers.d.effect().aBoost)
		if (player.f.unlocked) m = m.times(layers.f.effect().aBoost)
		if (hasUpgrade("f", 15)) m = m.times(TUNING.UPG.f15)
		return m
	},
	gainExp() { return new Decimal(1) },

	layerShown() { return player.c.best.gte(1000) || player.a.unlocked },

	// ---- 自动化（a m0 自身声望包；f m1 亦授；autoPrestige ⊇ resetsNothing）----
	resetsNothing() { return hasMilestone("a", 0) || hasMilestone("f", 1) },
	autoPrestige() { return hasMilestone("a", 0) || hasMilestone("f", 1) },
	autoUpgrade() { return hasMilestone("tr", 3) },

	hotkeys: [
		{ key: "a", description() { return L("A: 改进注意力", "A: Improve attention") }, onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	branches: ["c"],

	doReset(resettingLayer) {
		if (!(layers[resettingLayer].row > this.row)) return
		let kept = ["best", "total", "milestones"]
		if (hasMilestone("a", 2)) kept.push("upgrades")
		layerDataReset(this.layer, kept)
	},

	tabFormat: [
		["display-text", tokenLineFn()],
		["display-text", baseLineFn("a", "#7ee787")],
		["display-text", mainLineFn("a")],
		["display-text", bestLineFn("a")],
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
					["raw-html", function() { return "<div style='opacity:.5'>" + L("每个 token 都该看看别的 token。", "Every token should get to look at every other token.") + "</div>" }],
					"blank", "upgrades",
				],
			},
			"Milestones": { content: [["blank", "15px"], "milestones"] },
			"Buyables": { content: ["buyables"] },
		},
	},

	upgrades: {
		11: {
			title() { return L("FlashAttention", "FlashAttention") },
			description() { return L("token 产出 ×2。", "Token gain ×2.") },
			cost: new Decimal(1),
			unlocked() { return true },
		},
		12: {
			title() { return L("头间并行", "Head parallelism") },
			description() { return L("注意力收益 ×(注意力+1)^0.35。", "Attention gain ×(attention+1)^0.35.") },
			cost: new Decimal(5),
			unlocked() { return hasUpgrade("a", 11) },
			effect() { return player.a.points.add(1).pow(TUNING.SELF.a12) },
		},
		13: {
			title() { return L("位置编码 RoPE", "Rotary embeddings") },
			description() { return L("注意力收益 ×(log₁₀(参数最高)+1)^1.2。", "Attention gain ×(log₁₀(best params)+1)^1.2.") },
			cost: new Decimal(100),
			unlocked() { return hasUpgrade("a", 12) },
			effect() { return player.p.best.max(1).log(10).add(1).pow(TUNING.SHAPE.a13) },
		},
		14: {
			title() { return L("多头机制", "Multi-head attention") },
			description() { return L("注意力的参数加成 ^1.15（命名机制）。", "Attention's parameter boost ^1.15 (named mechanic).") },
			cost: new Decimal(2500),
			unlocked() { return hasUpgrade("a", 13) },
		},
		15: {
			title() { return L("注意力池化", "Attention pooling") },
			description() { return L("上下文收益 ×3。", "Context gain ×3.") },
			cost: new Decimal(1e4),
			unlocked() { return hasUpgrade("a", 14) },
		},
		16: {
			title() { return L("长序列优化", "Long-sequence optimization") },
			description() { return L("token 产出 ×(log₁₀(注意力最高)+1)^1.5。", "Token gain ×(log₁₀(best attention)+1)^1.5.") },
			cost: new Decimal(1e5),
			unlocked() { return hasUpgrade("a", 15) },
			effect() { return player.a.best.max(1).log(10).add(1).pow(TUNING.SHAPE.a16) },
		},
		21: {
			title() { return L("KV 页表", "KV paging") },
			description() { return L("KV 字节产出 ×2。", "KV-byte production ×2.") },
			cost: new Decimal(1e6),
			unlocked() { return hasMilestone("a", 1) },
		},
		22: {
			title() { return L("稀疏注意力", "Sparse attention") },
			description() { return L("参数最高 ≥ 500 时，注意力收益 ×5。", "While best params ≥ 500: attention gain ×5.") },
			cost: new Decimal(1e7),
			unlocked() { return hasUpgrade("a", 21) },
		},
		23: {
			title() { return L("梯度检查点", "Gradient checkpointing") },
			description() { return L("参数收益 ×2。", "Parameter gain ×2.") },
			cost: new Decimal(1e8),
			unlocked() { return hasUpgrade("a", 22) },
		},
		24: {
			title() { return L("环形注意力", "Ring Attention") },
			description() { return L("token 产出 ×(log₁₀(训练最高)+1)^1.2。", "Token gain ×(log₁₀(best training)+1)^1.2.") },
			cost: new Decimal(1e9),
			unlocked() { return hasUpgrade("a", 23) },
			effect() { return player.tr.best.max(1).log(10).add(1).pow(TUNING.SHAPE.a24) },
		},
	},

	milestones: {
		0: {
			requirementDescription() { return L("注意力 250", "Attention 250") },
			effectDescription() { return L("注意力自动训练（自动声望 + 重置不再清空下层）；「GQA 实现」达到 250 注意力后可见。", "Attention auto-trains (auto-prestige, resets nothing); the GQA buyable shows at 250 attention.") },
			done() { return player.a.best.gte(250) },
		},
		1: {
			requirementDescription() { return L("注意力 2500", "Attention 2500") },
			effectDescription() { return L("自动购买上下文升级。", "Auto-buy context upgrades.") },
			unlocked() { return hasMilestone("a", 0) },
			done() { return player.a.best.gte(TUNING.AUTO.a1) },
		},
		2: {
			requirementDescription() { return L("注意力 25000", "Attention 25000") },
			effectDescription() { return L("重置保留本层升级；token ×", "Keep this layer's upgrades; token ×") + format(TUNING.MS.a2) },
			unlocked() { return hasMilestone("a", 1) },
			done() { return player.a.best.gte(25000) },
		},
		3: {
			requirementDescription() { return L("注意力 250000", "Attention 250000") },
			effectDescription() { return L("注意力收益 ×2。", "Attention gain ×2.") },
			unlocked() { return hasMilestone("a", 2) },
			done() { return player.a.best.gte(250000) },
		},
		4: {
			requirementDescription() { return L("注意力 2.5e6", "Attention 2.5e6") },
			effectDescription() { return L("token ×", "Token ×") + format(TUNING.MS.a4) + L("；解锁「FlashAttention-2」。", "; unlock FlashAttention-2.") },
			unlocked() { return hasMilestone("a", 3) },
			done() { return player.a.best.gte(2.5e6) },
		},
	},

	buyables: {
		11: {
			title() { return L("🎛 头扩展", "🎛 Head expansion") },
			cost(x) { return new Decimal(50).times(Decimal.pow(2.5, x)) },
			effect(x) { return Decimal.pow(1.15, x) },
			display() {
				return L("注意力收益 ×", "Attention gain ×") + format(tmp[this.layer].buyables[this.id].effect) +
					"<br>" + L("等级", "Level") + ": " + formatWhole(getBuyableAmount(this.layer, this.id)) +
					"<br>" + L("价格", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + L(" 注意力", " attention")
			},
			canAfford() { return player.a.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player.a.points = player.a.points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(tmp[this.layer].buyables[this.id].cost)
			},
			style() { return { "background-color": "#0d1117", "color": "#d2a8ff" } },
		},
		12: {
			title() { return L("🔀 GQA 实现", "🔀 GQA implementation") },
			unlocked() { return player.a.best.gte(250) },
			cost(x) { return new Decimal(25).times(Decimal.pow(2.5, x)) },
			effect(x) { return Decimal.pow(1.2, x) },
			display() {
				return L("token 产出 ×", "Token gain ×") + format(tmp[this.layer].buyables[this.id].effect) +
					"<br>" + L("等级", "Level") + ": " + formatWhole(getBuyableAmount(this.layer, this.id)) +
					"<br>" + L("价格", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + L(" 注意力", " attention")
			},
			canAfford() { return player.a.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player.a.points = player.a.points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(tmp[this.layer].buyables[this.id].cost)
			},
			style() { return { "background-color": "#0d1117", "color": "#d2a8ff" } },
		},
		13: {
			title() { return L("⚡ FlashAttention-2", "⚡ FlashAttention-2") },
			unlocked() { return hasMilestone("a", 4) },
			cost(x) { return new Decimal(100).times(Decimal.pow(2.5, x)) },
			effect(x) { return Decimal.pow(1.18, x) },
			display() {
				return L("注意力收益 ×", "Attention gain ×") + format(tmp[this.layer].buyables[this.id].effect) +
					"<br>" + L("等级", "Level") + ": " + formatWhole(getBuyableAmount(this.layer, this.id)) +
					"<br>" + L("价格", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + L(" 注意力", " attention")
			},
			canAfford() { return player.a.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player.a.points = player.a.points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(tmp[this.layer].buyables[this.id].cost)
			},
			style() { return { "background-color": "#0d1117", "color": "#d2a8ff" } },
		},
	},
})
