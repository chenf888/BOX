// ============================================================================
// dep — 部署 Deployment（row 3，M8 商店层）
// 训练完的模型要变成服务：量化、KV 优化、推测解码。这里是把训练进度换成
// 生产力的商店：三个 buyable 各有专职（handbook 12 #20）。
// ============================================================================

addLayer("dep", {
	name: "deployment",
	symbol: "Dp",
	position: 1,
	row: 3,
	color: "#56d364",
	resource() { return L("部署实例", "Deployments") },
	resZh: "部署实例", resEn: "deployments",
	baseResource: "训练进度 Training runs",
	baseZh: "训练进度", baseEn: "training progress",
	baseAmount() { return player.tr.points },
	requires: new Decimal(2500),
	type: "normal",
	exponent: 0.4,

	startData() {
		return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) }
	},

	effect() {
		return {
			tokenBoost: player.dep.best.max(1).log(10).add(1).pow(TUNING.EFF.depToken),
			trBoost: player.dep.best.max(1).log(10).add(1).pow(TUNING.EFF.depTr),
		}
	},
	effectDescription() {
		let e = layers.dep.effect()
		return L("，token ×", ", tokens ×") + format(e.tokenBoost) +
			L("，训练 ×", ", training ×") + format(e.trBoost)
	},

	gainMult() {
		let m = new Decimal(1)
		if (hasMilestone("tr", 5)) m = m.times(2)
		if (hasMilestone("dep", 3)) m = m.times(TUNING.MS.dep3)
		if (hasUpgrade("dep", 12)) m = m.times(player.dep.points.add(1).pow(TUNING.SELF.dep12))
		if (hasUpgrade("dep", 13)) m = m.times(player.tr.best.max(1).log(10).add(1).pow(TUNING.SHAPE.dep13))
		if (hasUpgrade("dep", 15)) m = m.times(TUNING.UPG.dep15)
		if (hasUpgrade("dep", 22) && player.em.best.gte(100)) m = m.times(5)
		if (player.tr.unlocked) m = m.times(layers.tr.effect().depBoost)
		return m
	},
	gainExp() { return new Decimal(1) },

	layerShown() { return player.tr.best.gte(500) || player.dep.unlocked },

	// ---- 自动化（em m3 终局 package）----
	resetsNothing() { return hasMilestone("em", 3) },
	autoPrestige() { return hasMilestone("em", 3) },
	autoUpgrade() { return hasMilestone("em", 3) },

	hotkeys: [
		{ key: "e", description() { return L("E: 部署上线", "E: Deploy the model") }, onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	branches: ["tr"],

	doReset(resettingLayer) {
		if (!(layers[resettingLayer].row > this.row)) return
		let kept = ["best", "total", "milestones"]
		if (hasMilestone("dep", 1)) kept.push("upgrades")
		layerDataReset(this.layer, kept)
	},

	tabFormat: [
		["display-text", tokenLineFn()],
		["display-text", baseLineFn("dep", "#e3b341")],
		["display-text", mainLineFn("dep")],
		["display-text", bestLineFn("dep")],
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
					["raw-html", function() { return "<div style='opacity:.5'>" + L("训练是科学，部署是工程。", "Training is science; deployment is engineering.") + "</div>" }],
					"blank", "upgrades",
				],
			},
			"Shop": { content: [["blank", "15px"], "buyables"] },
			"Milestones": { content: [["blank", "15px"], "milestones"] },
		},
	},

	upgrades: {
		11: {
			title() { return L("服务化", "Servitization") },
			description() { return L("token 产出 ×2。", "Token gain ×2.") },
			cost: new Decimal(1),
			unlocked() { return true },
		},
		12: {
			title() { return L("容器化", "Containerization") },
			description() { return L("部署收益 ×(部署+1)^0.3。", "Deployment gain ×(deployments+1)^0.3.") },
			cost: new Decimal(5),
			unlocked() { return hasUpgrade("dep", 11) },
			effect() { return player.dep.points.add(1).pow(TUNING.SELF.dep12) },
		},
		13: {
			title() { return L("负载均衡", "Load balancing") },
			description() { return L("部署收益 ×(log₁₀(训练最高)+1)^1.2。", "Deployment gain ×(log₁₀(best training)+1)^1.2.") },
			cost: new Decimal(100),
			unlocked() { return hasUpgrade("dep", 12) },
			effect() { return player.tr.best.max(1).log(10).add(1).pow(TUNING.SHAPE.dep13) },
		},
		14: {
			title() { return L("量化感知训练", "Quantization-aware training") },
			description() { return L("训练收益 ^1.05（命名机制）。", "Training gain ^1.05 (named mechanic).") },
			cost: new Decimal(2500),
			unlocked() { return hasUpgrade("dep", 13) },
		},
		15: {
			title() { return L("自动扩缩容", "Autoscaling") },
			description() { return L("部署收益 ×2。", "Deployment gain ×2.") },
			cost: new Decimal(1e4),
			unlocked() { return hasUpgrade("dep", 14) },
		},
		16: {
			title() { return L("API 网关", "API gateway") },
			description() { return L("token 产出 ×(log₁₀(部署最高)+1)^1.4。", "Token gain ×(log₁₀(best deployments)+1)^1.4.") },
			cost: new Decimal(1e5),
			unlocked() { return hasUpgrade("dep", 15) },
			effect() { return player.dep.best.max(1).log(10).add(1).pow(TUNING.SHAPE.dep16) },
		},
		21: {
			title() { return L("INT4 量化", "INT4 quantization") },
			description() { return L("算力成本 ×0.75（更便宜）。", "Compute cost ×0.75 (cheaper).") },
			cost: new Decimal(1e6),
			unlocked() { return hasMilestone("dep", 1) },
		},
		22: {
			title() { return L("A/B 测试", "A/B testing") },
			description() { return L("涌现最高 ≥ 100 时，部署收益 ×5。", "While best emergence ≥ 100: deployment gain ×5.") },
			cost: new Decimal(1e7),
			unlocked() { return hasUpgrade("dep", 21) },
		},
		23: {
			title() { return L("推理优化", "Inference optimization") },
			description() { return L("训练收益 ×2。", "Training gain ×2.") },
			cost: new Decimal(1e8),
			unlocked() { return hasUpgrade("dep", 22) },
		},
		24: {
			title() { return L("全球接入", "Global access") },
			description() { return L("token 产出 ×(log₁₀(AGI 最高)+1)^1.5。", "Token gain ×(log₁₀(best AGI)+1)^1.5.") },
			cost: new Decimal(1e9),
			unlocked() { return hasUpgrade("dep", 23) },
			effect() { return player.agi.best.max(1).log(10).add(1).pow(TUNING.SHAPE.dep24) },
		},
	},

	milestones: {
		0: {
			requirementDescription() { return L("INT8 上线（部署 50）", "INT8 ships (50 deployments)") },
			effectDescription() { return L("token ×", "Token ×") + format(TUNING.MS.dep0) },
			done() { return player.dep.best.gte(50) },
		},
		1: {
			requirementDescription() { return L("INT4 上线（500）", "INT4 ships (500)") },
			effectDescription() { return L("重置保留本层升级；部署 ×", "Keep upgrades; deployment ×") + format(TUNING.MS.dep1) },
			unlocked() { return hasMilestone("dep", 0) },
			done() { return player.dep.best.gte(500) },
		},
		2: {
			requirementDescription() { return L("蒸馏小模型（5000）", "Distilled (5000)") },
			effectDescription() { return L("采样强度 ×2。", "Sample power ×2.") },
			unlocked() { return hasMilestone("dep", 1) },
			done() { return player.dep.best.gte(5000) },
		},
		3: {
			requirementDescription() { return L("边缘端部署（5e4）", "Edge deployment (5e4)") },
			effectDescription() { return L("部署 ×", "Deployment ×") + format(TUNING.MS.dep3) + L("；token ×2。", "; token ×2.") },
			unlocked() { return hasMilestone("dep", 2) },
			done() { return player.dep.best.gte(5e4) },
		},
	},

	buyables: {
		11: {
			title() { return L("📦 INT8 量化", "📦 INT8 quantization") },
			cost(x) { return new Decimal(10).times(Decimal.pow(2.5, x)) },
			effect(x) { return Decimal.pow(1.15, x) },
			display() {
				return L("token 产出 ×", "Token gain ×") + format(tmp[this.layer].buyables[this.id].effect) +
					L("<br>掉一点精度，省一半显存。", "<br>Lose a little precision, save half the VRAM.") +
					"<br>" + L("等级", "Level") + ": " + formatWhole(getBuyableAmount(this.layer, this.id)) +
					"<br>" + L("价格", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + L(" 部署", " deployments")
			},
			canAfford() { return player.dep.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player.dep.points = player.dep.points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(tmp[this.layer].buyables[this.id].cost)
			},
			style() { return { "background-color": "#0d1117", "color": "#56d364" } },
		},
		12: {
			title() { return L("🧠 KV 缓存优化", "🧠 KV-cache optimization") },
			cost(x) { return new Decimal(25).times(Decimal.pow(2.5, x)) },
			effect(x) { return Decimal.pow(1.15, x) },
			display() {
				return L("训练收益 ×", "Training gain ×") + format(tmp[this.layer].buyables[this.id].effect) +
					"<br>" + L("等级", "Level") + ": " + formatWhole(getBuyableAmount(this.layer, this.id)) +
					"<br>" + L("价格", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + L(" 部署", " deployments")
			},
			canAfford() { return player.dep.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player.dep.points = player.dep.points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(tmp[this.layer].buyables[this.id].cost)
			},
			style() { return { "background-color": "#0d1117", "color": "#56d364" } },
		},
		13: {
			title() { return L("⚡ 推测解码 v2", "⚡ Speculative decoding v2") },
			cost(x) { return new Decimal(50).times(Decimal.pow(2.5, x)) },
			effect(x) { return Decimal.pow(1.2, x) },
			display() {
				return L("采样强度 ×", "Sample power ×") + format(tmp[this.layer].buyables[this.id].effect) +
					"<br>" + L("等级", "Level") + ": " + formatWhole(getBuyableAmount(this.layer, this.id)) +
					"<br>" + L("价格", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + L(" 部署", " deployments")
			},
			canAfford() { return player.dep.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player.dep.points = player.dep.points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(tmp[this.layer].buyables[this.id].cost)
			},
			style() { return { "background-color": "#0d1117", "color": "#56d364" } },
		},
	},
})
