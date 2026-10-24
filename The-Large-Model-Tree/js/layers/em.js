// ============================================================================
// em — 涌现 Emergence（row 4）
// 规模到一定程度，能力就不是学出来的，是「冒出来」的：
// ICL → CoT → 自洽性 → 工具使用 → 反思 → 长推理。
// ============================================================================

addLayer("em", {
	name: "emergence",
	symbol: "Em",
	position: 0,
	row: 4,
	color: "#161412",
	resource() { return L("涌现", "Emergence") },
	resZh: "涌现", resEn: "Emergence",
	baseResource: "训练进度 Training runs",
	baseZh: "训练进度", baseEn: "training progress",
	baseAmount() { return player.tr.points },
	requires: new Decimal(25000),
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
	exponent: 0.45,

	startData() {
		return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) }
	},

	effect() {
		let tb = player.em.best.max(1).log(10).add(1).pow(TUNING.EFF.emToken)
		if (hasUpgrade("em", 14)) tb = tb.pow(TUNING.META.em14) // K4：思维链
		return {
			tokenBoost: tb,
			trBoost: player.em.best.max(1).log(10).add(1).pow(TUNING.EFF.emTr),
		}
	},
	effectDescription() {
		let e = layers.em.effect()
		return L("，token ×", ", tokens ×") + format(e.tokenBoost) +
			L("，训练 ×", ", training ×") + format(e.trBoost)
	},

	gainMult() {
		let m = new Decimal(1)
		if (hasMilestone("em", 4)) m = m.times(TUNING.MS.em4)
		if (hasUpgrade("em", 12)) m = m.times(player.em.points.add(1).pow(TUNING.SELF.em12))
		if (hasUpgrade("em", 13)) m = m.times(player.dep.best.max(1).log(10).add(1).pow(TUNING.SHAPE.em13))
		if (hasUpgrade("em", 22) && player.agi.best.gte(64)) m = m.times(5)
		if (hasUpgrade("em", 23)) m = m.times(player.agi.best.max(1).log(10).add(1).pow(TUNING.SHAPE.em23))
		m = m.times(Decimal.pow(1.15, getBuyableAmount("em", 11)))
		if (player.agi.unlocked && hasUpgrade("agi", 23)) m = m.times(TUNING.UPG.agi23)
		return m
	},
	gainExp() { return new Decimal(1) },

	softcap() {
		let cap = new Decimal(TUNING.CAPS.em.start)
		if (hasUpgrade("em", 21)) cap = cap.times(TUNING.CAPS.em.raise)
		return cap
	},
	softcapPower() { return new Decimal(TUNING.CAPS.em.power) },

	layerShown() { return player.tr.best.gte(5000) || player.em.unlocked },

	// ---- 自动化（em m3 终局 package：tr/dep/em 三层；autoPrestige ⊇ resetsNothing）----
	resetsNothing() { return hasMilestone("em", 3) },
	autoPrestige() { return hasMilestone("em", 3) },

	hotkeys: [
		{ key: "m", description() { return L("M: 涌现新能力", "M: Emerge a new ability") }, onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	branches: ["tr"],

	doReset(resettingLayer) {
		if (!(layers[resettingLayer].row > this.row)) return
		let kept = ["best", "total", "milestones"]
		if (hasMilestone("em", 0)) kept.push("upgrades")
		layerDataReset(this.layer, kept)
	},

	tabFormat: [
		["display-text", tokenLineFn()],
		["display-text", baseLineFn("em", "#161412")],
		["display-text", mainLineFn("em")],
		["display-text", bestLineFn("em")],
		["display-text", softcapLineFn("em", function() { return layers.em.softcap() }, "#161412")],
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
					["raw-html", function() { return "<div style='opacity:.5'>" + L("Some abilities you train. Some just… appear.", "Some abilities you train. Some just… appear.") + "</div>" }],
					"blank", "upgrades",
				],
			},
			"Milestones": { content: [["blank", "15px"], "milestones"] },
			"Buyables": { content: ["buyables"] },
		},
	},

	upgrades: {
		11: {
			title() { return L("上下文学习 ICL", "In-context learning") },
			description() { return L("token 产出 ×3。", "Token gain ×3.") },
			cost: new Decimal(1),
			unlocked() { return true },
		},
		12: {
			title() { return L("涌现曲线", "Emergence curve") },
			description() { return L("涌现收益 ×(涌现+1)^0.3。", "Emergence gain ×(emergence+1)^0.3.") },
			cost: new Decimal(10),
			unlocked() { return hasUpgrade("em", 11) },
			effect() { return player.em.points.add(1).pow(TUNING.SELF.em12) },
		},
		13: {
			title() { return L("少样本提示", "Few-shot prompting") },
			description() { return L("涌现收益 ×(log₁₀(部署最高)+1)^1.2。", "Emergence gain ×(log₁₀(best deployments)+1)^1.2.") },
			cost: new Decimal(1000),
			unlocked() { return hasUpgrade("em", 12) },
			effect() { return player.dep.best.max(1).log(10).add(1).pow(TUNING.SHAPE.em13) },
		},
		14: {
			title() { return L("思维链 CoT", "Chain of Thought") },
			description() { return L("涌现的 token 加成 ^1.15（命名机制）。", "Emergence's token boost ^1.15 (named mechanic).") },
			cost: new Decimal(1e4),
			unlocked() { return hasUpgrade("em", 13) },
		},
		15: {
			title() { return L("自洽性解码", "Self-consistency") },
			description() { return L("训练收益 ×3。", "Training gain ×3.") },
			cost: new Decimal(1e5),
			unlocked() { return hasUpgrade("em", 14) },
		},
		16: {
			title() { return L("工具调用", "Tool use") },
			description() { return L("token 产出 ×(log₁₀(涌现最高)+1)^1.5。", "Token gain ×(log₁₀(best emergence)+1)^1.5.") },
			cost: new Decimal(1e6),
			unlocked() { return hasUpgrade("em", 15) },
			effect() { return player.em.best.max(1).log(10).add(1).pow(TUNING.SHAPE.em16) },
		},
		21: {
			title() { return L("长程推理", "Long-horizon reasoning") },
			description() { return L("涌现收益软化起点 ×10（当前 ", "Softcap start ×10 (currently at ") + format(layers.em.softcap()) + L("）。", ").") },
			cost: new Decimal(1e7),
			unlocked() { return hasMilestone("em", 2) },
		},
		22: {
			title() { return L("自我反思", "Self-reflection") },
			description() { return L("AGI 最高 ≥ 64 时，涌现收益 ×5。", "While best AGI ≥ 64: emergence gain ×5.") },
			cost: new Decimal(1e8),
			unlocked() { return hasUpgrade("em", 21) },
		},
		23: {
			title() { return L("测试时计算", "Test-time compute") },
			description() { return L("涌现收益 ×(log₁₀(AGI 最高)+1)^1.3。", "Emergence gain ×(log₁₀(best AGI)+1)^1.3.") },
			cost: new Decimal(1e9),
			unlocked() { return hasUpgrade("em", 22) },
			effect() { return player.agi.best.max(1).log(10).add(1).pow(TUNING.SHAPE.em23) },
		},
		24: {
			title() { return L("推理模型", "Reasoning model") },
			description() { return L("token 产出 ×10。它会先想一想再回答。", "Token gain ×10. It thinks before it speaks.") },
			cost: new Decimal(1e10),
			unlocked() { return hasUpgrade("em", 23) },
		},
	},

	milestones: {
		0: {
			requirementDescription() { return L("ICL 涌现（100）", "ICL emerges (100)") },
			effectDescription() { return L("重置不再清空本层升级。", "Resets no longer wipe this layer's upgrades.") },
			done() { return player.em.best.gte(100) },
		},
		1: {
			requirementDescription() { return L("CoT 涌现（1000）", "CoT emerges (1000)") },
			effectDescription() { return L("token ×", "Token ×") + format(TUNING.MS.em1) + L("。让我们一步一步想。", ". Let's think step by step.") },
			unlocked() { return hasMilestone("em", 0) },
			done() { return player.em.best.gte(1000) },
		},
		2: {
			requirementDescription() { return L("自洽性涌现（1e4）", "Self-consistency emerges (1e4)") },
			effectDescription() { return L("解锁「思维树分支」购买项。", "Unlock the Tree-of-Thought buyable.") },
			unlocked() { return hasMilestone("em", 1) },
			done() { return player.em.best.gte(1e4) },
		},
		3: {
			requirementDescription() { return L("工具使用涌现（1e5）", "Tool use emerges (1e5)") },
			effectDescription() { return L("训练、部署、涌现全自动（终局 package）。", "Training, deployment and emergence fully automated (endgame package).") },
			unlocked() { return hasMilestone("em", 2) },
			done() { return player.em.best.gte(TUNING.AUTO.em3) },
		},
		4: {
			requirementDescription() { return L("反思涌现（1e6）", "Reflection emerges (1e6)") },
			effectDescription() { return L("涌现收益 ×", "Emergence gain ×") + format(TUNING.MS.em4) + L("；涌现自动持续（重置不再清空下层）。", "; emergence auto-flows (resets nothing below).") },
			unlocked() { return hasMilestone("em", 3) },
			done() { return player.em.best.gte(1e6) },
		},
		5: {
			requirementDescription() { return L("长推理涌现（1e7）", "Long reasoning emerges (1e7)") },
			effectDescription() { return L("token ×", "Token ×") + format(TUNING.MS.em5) + L("。它开始沉默地思考。", ". It starts thinking in silence.") },
			unlocked() { return hasMilestone("em", 4) },
			done() { return player.em.best.gte(1e7) },
		},
	},

	buyables: {
		11: {
			title() { return L("🌳 思维树分支", "🌳 Tree of Thoughts") },
			unlocked() { return hasMilestone("em", 2) },
			cost(x) { return new Decimal(50).times(Decimal.pow(2.5, x)) },
			effect(x) { return Decimal.pow(1.15, x) },
			display() {
				return L("涌现收益 ×", "Emergence gain ×") + format(tmp[this.layer].buyables[this.id].effect) +
					"<br>" + L("等级", "Level") + ": " + formatWhole(getBuyableAmount(this.layer, this.id)) +
					"<br>" + L("价格", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + L(" 涌现", " emergence")
			},
			canAfford() { return player.em.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player.em.points = player.em.points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(tmp[this.layer].buyables[this.id].cost)
			},
			style() { return { "background-color": "#F2EEE3", "color": "#161412" } },
		},
	},
})
