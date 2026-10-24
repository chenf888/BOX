// ============================================================================
// f — 算力 Compute（row 2，static）
// GPU 集群档位：base 2 → 每档集群规模 ×2（第 10 档 = 1024 卡！里程碑点题）。
// static 语义：gainMult 越小 = 越便宜（handbook 07 Part A #16）。
// ============================================================================

addLayer("f", {
	name: "compute",
	symbol: "Fl",
	position: 1,
	row: 2,
	color: "#161412",
	resource() { return L("算力档位", "Compute tiers") },
	resZh: "算力档位", resEn: "compute tiers",
	baseResource: "注意力 Attention",
	baseZh: "注意力", baseEn: "attention",
	baseAmount() { return player.a.points },
	requires: new Decimal(100),
	prestigeButtonText() {
		const res = L(layers[this.layer].resZh, layers[this.layer].resEn)
		const bres = L(layers[this.layer].baseZh, layers[this.layer].baseEn)
		const t = tmp[this.layer], pl = player[this.layer]
		const g = (t.resetGain && t.resetGain.lt) ? t.resetGain : new Decimal(0) // 启动期 tmp 未就绪
		const ba = (t.baseAmount && t.baseAmount.gte) ? t.baseAmount : new Decimal(0)
		const na = (t.nextAt && t.nextAt.gte) ? t.nextAt : new Decimal(Infinity)
		let s = L("重置为 +", "Reset for +") + "<b>" + formatWhole(g) + "</b> " + res + "<br><br>"
		if (pl.points.lt(30))
			s += (ba.gte(na) && t.canBuyMax ? L("下一张：", "Next:") : L("需求：", "Req:")) + " "
		s += formatWhole(t.baseAmount) + " / " + (t.roundUpCost ? formatWhole(t.nextAtDisp) : format(t.nextAtDisp)) + " " + bres
		return s
	},
	type: "static",
	base: 2,
	exponent: 1,
	roundUpCost: true,
	canBuyMax() { return player[this.layer].unlocked },

	startData() {
		return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) }
	},

	effect() {
		return {
			tokenBoost: player.f.best.max(1).pow(TUNING.EFF.fToken),
			dBoost: player.f.best.max(1).pow(TUNING.EFF.fD),
			aBoost: player.f.best.max(1).pow(TUNING.EFF.fA),
		}
	},
	effectDescription() {
		let e = layers.f.effect()
		return L("，token ×", ", tokens ×") + format(e.tokenBoost) +
			L("，数据 ×", ", data ×") + format(e.dBoost) +
			L("，注意力 ×", ", attention ×") + format(e.aBoost)
	},

	// static：这是「成本」乘区 —— 越小越便宜
	gainMult() {
		let m = new Decimal(1)
		m = m.times(0.85) // a m0：机房选址
		if (hasMilestone("f", 3)) m = m.times(0.85)
		if (hasUpgrade("f", 14)) m = m.times(0.8)
		if (hasUpgrade("f", 21)) m = m.times(0.75)
		if (hasUpgrade("p", 21)) m = m.times(0.85)
		if (hasUpgrade("d", 21)) m = m.times(0.8)
		if (hasUpgrade("dep", 21)) m = m.times(0.75)
		m = m.div(layers.tr.effect().fBoost.max(1)) // 训练反哺算力（越训越便宜）
		m = m.div(Decimal.pow(1.15, getBuyableAmount("f", 11)))
		return m.max(0.01)
	},
	gainExp() { return new Decimal(1) },

	layerShown() { return player.a.best.gte(500) || player.f.unlocked },

	// ---- 自动化（tr m3 package）----
	resetsNothing() { return hasMilestone("tr", 3) },
	autoPrestige() { return hasMilestone("tr", 3) },
	autoUpgrade() { return hasMilestone("tr", 3) || hasMilestone("f", 4) },

	hotkeys: [
		{ key: "f", description() { return L("F: 堆更多显卡", "F: Stack more GPUs") }, onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	branches: ["a"],

	doReset(resettingLayer) {
		if (!(layers[resettingLayer].row > this.row)) return
		let kept = ["best", "total", "milestones"]
		if (hasMilestone("f", 0)) kept.push("upgrades")
		layerDataReset(this.layer, kept)
	},

	tabFormat: [
		["display-text", tokenLineFn()],
		["display-text", baseLineFn("f", "#161412")],
		["display-text", mainLineFn("f")],
		["display-text", function() {
			return L("≈ 集群规模：", "≈ cluster size: ") +
				"<b style='color:#161412'>" + formatWhole(Decimal.pow(2, player.f.points)) + "</b>" +
				L(" 张卡", " GPUs")
		}],
		["display-text", bestLineFn("f")],
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
					["raw-html", function() { return "<div style='opacity:.5'>" + L("The Bitter Lesson: 算力终将战胜技巧。", "The Bitter Lesson: compute always wins.") + "</div>" }],
					"blank", "upgrades",
				],
			},
			"Milestones": { content: [["blank", "15px"], "milestones"] },
			"Buyables": { content: ["buyables"] },
		},
	},

	upgrades: {
		11: {
			title() { return L("集群供电", "Cluster power") },
			description() { return L("token 产出 ×2。", "Token gain ×2.") },
			cost: new Decimal(1),
			unlocked() { return true },
		},
		12: {
			title() { return L("显存扩容", "VRAM expansion") },
			description() { return L("数据收益 ×(算力档+1)^0.5。", "Data gain ×(compute tier+1)^0.5.") },
			cost: new Decimal(2),
			unlocked() { return hasUpgrade("f", 11) },
			effect() { return player.f.points.add(1).pow(TUNING.SHAPE.f12) },
		},
		13: {
			title() { return L("高速缓存", "High-speed cache") },
			description() { return L("token 产出 ×(log₁₀(数据最高)+1)^1.3。", "Token gain ×(log₁₀(best data)+1)^1.3.") },
			cost: new Decimal(3),
			unlocked() { return hasUpgrade("f", 12) },
			effect() { return player.d.best.max(1).log(10).add(1).pow(TUNING.SHAPE.d13) },
		},
		14: {
			title() { return L("液冷改造", "Liquid cooling") },
			description() { return L("算力成本 ×0.8（更便宜）。", "Compute cost ×0.8 (cheaper).") },
			cost: new Decimal(5),
			unlocked() { return hasUpgrade("f", 13) },
		},
		15: {
			title() { return L("弹性调度", "Elastic scheduling") },
			description() { return L("注意力收益 ×2。", "Attention gain ×2.") },
			cost: new Decimal(8),
			unlocked() { return hasUpgrade("f", 14) },
		},
		16: {
			title() { return L("万兆互联", "10G fabric") },
			description() { return L("token 产出 ×(log₂(算力最高)+1)。", "Token gain ×(log₂(best compute)+1).") },
			cost: new Decimal(12),
			unlocked() { return hasUpgrade("f", 15) },
			effect() { return player.f.best.max(1).log(2).add(1).pow(TUNING.SHAPE.f16) },
		},
		21: {
			title() { return L("P2P 直连", "P2P interconnect") },
			description() { return L("算力成本 ×0.75（更便宜）。", "Compute cost ×0.75 (cheaper).") },
			cost: new Decimal(20),
			unlocked() { return hasMilestone("f", 1) },
		},
		22: {
			title() { return L("竞价实例", "Spot instances") },
			description() { return L("数据最高 ≥ 1e4 时，数据收益 ×5。", "While best data ≥ 1e4: data gain ×5.") },
			cost: new Decimal(30),
			unlocked() { return hasUpgrade("f", 21) },
		},
		23: {
			title() { return L("数据预取", "Data prefetching") },
			description() { return L("数据收益 ×(log₁₀(训练最高)+1)^1.1。", "Data gain ×(log₁₀(best training)+1)^1.1.") },
			cost: new Decimal(45),
			unlocked() { return hasUpgrade("f", 22) },
			effect() { return player.tr.best.max(1).log(10).add(1).pow(TUNING.SHAPE.f23) },
		},
		24: {
			title() { return L("超节点", "Supernode") },
			description() { return L("token 产出 ×5。", "Token gain ×5.") },
			cost: new Decimal(60),
			unlocked() { return hasUpgrade("f", 23) },
		},
	},

	milestones: {
		0: {
			requirementDescription() { return L("首卡上机（1 卡）", "First GPU racked (1 card)") },
			effectDescription() { return L("保留本层升级；机房选址：算力成本 ×0.85。", "Keep upgrades; site discount: compute cost ×0.85.") },
			done() { return player.f.best.gte(1) },
		},
		1: {
			requirementDescription() { return L("迷你集群（5 卡）", "Mini-cluster (5 GPUs)") },
			effectDescription() { return L("注意力自动训练（自动声望 + 重置不再清空下层）。", "Attention auto-trains (auto-prestige, resets nothing).") },
			unlocked() { return hasMilestone("f", 0) },
			done() { return player.f.best.gte(TUNING.AUTO.f1) },
		},
		2: {
			requirementDescription() { return L("小机房（10 卡）", "Small datacenter (10 GPUs)") },
			effectDescription() { return L("token ×", "Token ×") + format(TUNING.MS.f2)  },
			unlocked() { return hasMilestone("f", 1) },
			done() { return player.f.best.gte(TUNING.AUTO.f2) },
		},
		3: {
			requirementDescription() { return L("中机房（15 卡）", "Mid datacenter (15 GPUs)") },
			effectDescription() { return L("算力成本 ×0.85；token ×", "Compute cost ×0.85; token ×") + format(TUNING.MS.f3) },
			unlocked() { return hasMilestone("f", 2) },
			done() { return player.f.best.gte(15) },
		},
		4: {
			requirementDescription() { return L("百万卡之梦（20 卡）", "The million-GPU dream (20 GPUs)") },
			effectDescription() { return L("自动购买算力升级；解锁「互联带宽」。", "Auto-buy compute upgrades; unlock the interconnect buyable.") },
			unlocked() { return hasMilestone("f", 3) },
			done() { return player.f.best.gte(20) },
		},
	},

	buyables: {
		11: {
			title() { return L("🔌 互联带宽", "🔌 Interconnect") },
			unlocked() { return hasMilestone("f", 4) },
			currencyLayer: "a", currencyInternalName: "points",
			cost(x) { return new Decimal(100).times(Decimal.pow(2.5, x)) },
			effect(x) { return Decimal.pow(1.15, x) },
			display() {
				return L("算力成本 ÷", "Compute cost ÷") + format(tmp[this.layer].buyables[this.id].effect) +
					"<br>" + L("等级", "Level") + ": " + formatWhole(getBuyableAmount(this.layer, this.id)) +
					"<br>" + L("价格", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + L(" 注意力", " attention")
			},
			canAfford() { return player.a.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				// F9：static 层的购买项以基础货币计价，绝不用档位计数器本身
				player.a.points = player.a.points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(tmp[this.layer].buyables[this.id].cost)
			},
			style() { return { "background-color": "#F2EEE3", "color": "#161412" } },
		},
	},
})
