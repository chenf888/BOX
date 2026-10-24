// ============================================================================
// c — 上下文 Context（row 0，锚定层）
// 首个声望层：花费 token 扩充上下文窗口。里程碑对应真实的上下文长度史：
// 1K → 4K → 32K → 128K → 1M → 16M(2^24)。
// 次要货币「KV 缓存字节」（M5）在这里产出、被两个 buyable 消耗。
// ============================================================================

// 采样成功的漂浮文字（active-click 手感）
var tokParticle = {
	text: function() { return "+" + format(getClickPower()) + " token" },
	time: 1.6,
	fadeOutTime: 0.8,
	speed: function() { return (Math.random() + 0.8) * 9 },
	dir: function() { return 70 + (Math.random() - 0.5) * 40 },
	gravity: 1.2,
	layer: "c",
	color: "#79c0ff",
}

addLayer("c", {
	name: "context",
	symbol: "Ct",
	position: 0,
	row: 0,
	color: "#7ee787",
	resource() { return L("上下文", "Context") },
	resZh: "上下文", resEn: "Context",
	baseResource: "token",
	baseZh: "token", baseEn: "tokens",
	baseAmount() { return player.points },
	requires: new Decimal(10),
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
	exponent: 0.5,

	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			bytes: new Decimal(0),   // KV 缓存字节（次要货币，M5）
		}
	},

	effect() {
		return {
			tokenBoost: player.c.best.max(1).log(10).add(1).pow(TUNING.EFF.cToken),
		}
	},
	effectDescription() {
		return L("，正在以 ×", ", boosting token gain ×") + format(layers.c.effect().tokenBoost) +
			L(" 增强流式输出", "")
	},

	gainMult() {
		let m = new Decimal(1)
		if (hasMilestone("c", 3)) m = m.times(TUNING.MS.c3)
		if (hasMilestone("p", 0)) m = m.times(TUNING.MS.p0)
		if (hasUpgrade("c", 16)) m = m.times(TUNING.UPG.c16)
		if (hasUpgrade("c", 16)) m = m.times(player.c.points.add(1).pow(TUNING.SELF.c15))
		if (hasUpgrade("c", 22)) m = m.times(player.p.best.max(1).log(10).add(1).pow(TUNING.SHAPE.c22))
		if (hasUpgrade("p", 15)) m = m.times(TUNING.UPG.p15)
		if (hasUpgrade("a", 15)) m = m.times(TUNING.UPG.a15)
		if (player.p.unlocked) m = m.times(layers.p.effect().cBoost)
		if (player.a.unlocked) m = m.times(layers.a.effect().cBoost)
		if (hasChallenge("tr", 13)) m = m.times(Decimal.pow(TUNING.CHAL.rw13, challengeCompletions("tr", 13)))
		m = m.times(Decimal.pow(1.15, getBuyableAmount("c", 12)))
		return m
	},
	gainExp() {
		let e = new Decimal(1)
		if (inChallenge("tr", 13)) e = e.times(TUNING.CHAL.nerf13)
		return e
	},

	// 可见 softcap（K5：u21 抬升 ×10，警告行常显）
	softcap() {
		let cap = new Decimal(TUNING.CAPS.c.start)
		if (hasUpgrade("c", 21)) cap = cap.times(TUNING.CAPS.c.raise)
		return cap
	},
	softcapPower() { return new Decimal(TUNING.CAPS.c.power) },

	layerShown() { return true },

	// ---- 自动化（P4 阶梯，跨层授予；autoPrestige 集合 ⊇ resetsNothing 集合）----
	resetsNothing() { return hasMilestone("p", 1) },
	autoPrestige() { return hasMilestone("p", 1) },
	autoUpgrade() { return hasMilestone("a", 1) },

	hotkeys: [
		{ key: "c", description() { return L("C: 扩充上下文", "C: Extend the context") }, onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	branches: [],

	doReset(resettingLayer) {
		// vanilla 守卫：只有更深行重置本层（自身声望与同排兄弟不动它）
		if (!(layers[resettingLayer].row > this.row)) return
		let kept = ["best", "total", "milestones", "bytes", "clickables"]
		if (hasMilestone("c", 0)) kept.push("upgrades")
		layerDataReset(this.layer, kept)
	},

	update(diff) {
		if (!player[this.layer].unlocked) return
		// KV 缓存字节：随 token 流产出
		let rate = new Decimal(TUNING.KV.rate)
		if (hasUpgrade("c", 31)) rate = rate.times(2)
		if (hasUpgrade("a", 21)) rate = rate.times(2)
		player[this.layer].bytes = player[this.layer].bytes.add(getPointGen().max(0).times(diff).times(rate))
	},

	tabFormat: [
		["display-text", tokenLineFn()],
		["display-text", function() {
			return L("KV 缓存字节：", "KV-cache bytes: ") +
				"<b style='color:#79c0ff'>" + format(player.c.bytes) + "</b>" +
				L("（每秒 +", " (+") + format(getPointGen().times(new Decimal(TUNING.KV.rate)).times((hasUpgrade("c", 31) ? 2 : 1) * (hasUpgrade("a", 21) ? 2 : 1))) + L("）", ")")
		}],
		["display-text", mainLineFn("c")],
		["display-text", bestLineFn("c")],
		"blank",
		["clickables", [11]],
		"blank",
		"prestige-button",
		["display-text", softcapLineFn("c", function() { return layers.c.softcap() }, "#7ee787")],
		"blank",
		["microtabs", "stuff"],
		["blank", "65px"],
	],
	microtabs: {
		stuff: {
			"Upgrades": {
				content: [
					["raw-html", function() { return "<div style='opacity:.5'>" + L("上下文技术：把每个 token 都用在刀刃上。", "Context techniques: spend every token wisely.") + "</div>" }],
					"blank", "upgrades",
				],
			},
			"Milestones": { content: [["blank", "15px"], "milestones"] },
			"Buyables": {
				content: [
					["display-text", function() {
						return L("KV 缓存字节：", "KV-cache bytes: ") + "<b style='color:#79c0ff'>" + format(player.c.bytes) + "</b>"
					}],
					"blank", "buyables",
				],
			},
			"Logs": {
				unlocked() { return hasMilestone("c", 0) },
				content: [
					["infobox", "log1"], ["infobox", "log2"], ["infobox", "log3"],
				],
			},
		},
	},
	infoboxes: {
		log1: {
			title() { return L("训练日志 · 一", "Training log · 1") },
			body() {
				if (!hasMilestone("c", 0)) return L("（达到 1K 上下文后解锁）", "(Unlocks at 1K context)")
				return L("Day 1：模型开始说话了。它把「你好」接在了一句诗的中间，把句号吃掉，然后在第 1024 个 token 处固执地停下。<br>工程师们把这称为：上下文窗口。", "Day 1: the model started talking. It glued \"hello\" into the middle of a poem, ate the period, and stubbornly stopped at token 1024.<br>The engineers called it: the context window.")
			},
			unlocked() { return hasMilestone("c", 0) },
		},
		log2: {
			title() { return L("训练日志 · 二", "Training log · 2") },
			body() {
				if (!hasMilestone("c", 2)) return L("（达到 32K 上下文后解锁）", "(Unlocks at 32K context)")
				return L("Day 42：我们给了它一整本书的上下文。它读完了，然后在总结里写道：「这本书的主角是谁不重要，重要的是梯度下降。」<br>—— 也许是时候谈谈对齐了。", "Day 42: we gave it a whole book of context. It finished, then wrote in the summary: \"Who the protagonist is does not matter; what matters is gradient descent.\"<br>— Maybe it is time to talk about alignment.")
			},
			unlocked() { return hasMilestone("c", 2) },
		},
		log3: {
			title() { return L("训练日志 · 三", "Training log · 3") },
			body() {
				if (!hasMilestone("c", 5)) return L("（达到 16M 上下文后解锁）", "(Unlocks at 16M context)")
				return L("Day 1024：上下文窗口达到 2^24 —— 恰好是真彩色的一亿六千七百七十七万种可能。模型说：这个数字是留给程序员的。<br>它第一次主动用了句号。", "Day 1024: the context window hit 2^24 — exactly the 16,777,216 possibilities of true color. The model said: this number was saved for the programmers.<br>For the first time, it used a period on purpose.")
			},
			unlocked() { return hasMilestone("c", 5) },
		},
	},

	clickables: {
		11: {
			title() { return L("⏵ 生成下一个 token", "⏵ Sample next token") },
			display() {
				return L("点击采样：<b>+", "Click to sample: <b>") + format(getClickPower()) + "</b> token" +
					L("<br>累计采样 " + formatWhole(getClickableState(this.layer, this.id)) + " 次", "<br>" + formatWhole(getClickableState(this.layer, this.id)) + " samples total")
			},
			canClick() { return true },
			onClick() {
				player.points = player.points.add(getClickPower())
				setClickableState(this.layer, this.id, getClickableState(this.layer, this.id) + 1)
				makeParticles(tokParticle, 1)
			},
			onHold() {
				player.points = player.points.add(getClickPower())
				setClickableState(this.layer, this.id, getClickableState(this.layer, this.id) + 1)
			},
			style() { return { "background-color": "#0d1117", "color": "#79c0ff", "border-color": "#79c0ff", "min-height": "60px" } },
		},
	},

	upgrades: {
		11: {
			title() { return L("双通道推理", "Dual-stream inference") },
			description() { return L("采样强度 ×2。", "Sample ×2 stronger.") },
			cost: new Decimal(1),
			currencyInternalName: "points",
			currencyDisplayName: "token",
			unlocked() { return true },
		},
		12: {
			title() { return L("批处理", "Batching") },
			description() { return L("token 产出 ×2。", "Token gain ×2.") },
			cost: new Decimal(10),
			currencyInternalName: "points",
			currencyDisplayName: "token",
			unlocked() { return hasUpgrade("c", 11) },
		},
		13: {
			title() { return L("流式输出", "Streaming output") },
			description() { return L("流式输出：每秒按采样强度 ×0.5 持续产出 token（命名机制）。", "Streaming output: gain click power ×0.5 per second, continuously (named mechanic).") },
			cost: new Decimal(100),
			currencyInternalName: "points",
			currencyDisplayName: "token",
			unlocked() { return hasUpgrade("c", 12) },
		},
		14: {
			title() { return L("自回归", "Autoregression") },
			description() { return L("token 产出 ×(log₁₀(token)+1)^1.5 —— 越写越快。", "Token gain ×(log₁₀(token)+1)^1.5 — the more you write, the faster it flows.") },
			cost: new Decimal(500),
			currencyInternalName: "points",
			currencyDisplayName: "token",
			unlocked() { return hasUpgrade("c", 13) },
			effect() { return player.points.max(1).log(10).add(1).pow(TUNING.SHAPE.c13) },
		},
		15: {
			title() { return L("KV 缓存", "KV cache") },
			description() { return L("流式输出速率 ×2（命名机制）。", "Streaming rate ×2 (named mechanic).") },
			cost: new Decimal(5e3),
			currencyInternalName: "points",
			currencyDisplayName: "token",
			unlocked() { return hasUpgrade("c", 14) },
		},
		16: {
			title() { return L("深度上下文", "Deep context") },
			description() { return L("上下文收益 ×(上下文+1)^0.4。", "Context gain ×(context+1)^0.4.") },
			cost: new Decimal(1e5),
			currencyInternalName: "points",
			currencyDisplayName: "token",
			unlocked() { return hasUpgrade("c", 14) },
			effect() { return player.c.points.add(1).pow(TUNING.SELF.c15) },
		},

		21: {
			title() { return L("滑窗采样", "Sliding-window sampling") },
			description() { return L("上下文收益软化起点 ×10（当前 ", "Softcap start ×10 (currently at ") + format(layers.c.softcap()) + L("）。", ").") },
			cost: new Decimal(100),
			currencyInternalName: "points",
			currencyDisplayName: "token",
			unlocked() { return hasMilestone("c", 2) },
		},
		22: {
			title() { return L("检索增强 RAG", "Retrieval-augmented generation") },
			description() { return L("上下文收益 ×(log₁₀(参数)+1)^1.2 —— 查得到的知识才算上下文。", "Context gain ×(log₁₀(params)+1)^1.2 — knowledge you can retrieve is context.") },
			cost: new Decimal(2e6),
			currencyInternalName: "points",
			currencyDisplayName: "token",
			unlocked() { return hasUpgrade("c", 21) },
			effect() { return player.p.best.max(1).log(10).add(1).pow(TUNING.SHAPE.c22) },
		},
		23: {
			title() { return L("多查询注意力 MQA", "Multi-Query Attention") },
			description() { return L("采样强度 ×3。", "Sample ×3 stronger.") },
			cost: new Decimal(1e8),
			currencyInternalName: "points",
			currencyDisplayName: "token",
			unlocked() { return hasUpgrade("c", 22) },
		},
		24: {
			title() { return L("前缀缓存", "Prefix caching") },
			description() { return L("token 产出 ×(log₁₀(KV字节)+1)^1.3。", "Token gain ×(log₁₀(KV bytes)+1)^1.3.") },
			cost: new Decimal(2e9),
			currencyInternalName: "points",
			currencyDisplayName: "token",
			unlocked() { return hasUpgrade("c", 23) },
			effect() { return player.c.bytes.max(1).log(10).add(1).pow(TUNING.SHAPE.c24) },
		},
		25: {
			title() { return L("提示前缀复用", "Prompt-prefix reuse") },
			description() { return L("token 产出 ×3。", "Token gain ×3.") },
			cost: new Decimal(1e11),
			currencyInternalName: "points",
			currencyDisplayName: "token",
			unlocked() { return hasUpgrade("c", 24) },
		},
		31: {
			title() { return L("上下文蒸馏", "Context distillation") },
			description() { return L("KV 字节产出 ×2。", "KV-byte production ×2.") },
			cost: new Decimal(5e12),
			currencyInternalName: "points",
			currencyDisplayName: "token",
			unlocked() { return hasUpgrade("c", 25) },
		},
	},

	milestones: {
		0: {
			requirementDescription() { return L("1K 上下文（历史最高 1024）", "1K context (best 1024)") },
			effectDescription() { return L("重置不再清空本层升级。", "Resets no longer wipe this layer's upgrades.") },
			done() { return player.c.best.gte(TUNING.AUTO.c0) },
		},
		1: {
			requirementDescription() { return L("4K 上下文（4096）", "4K context (4096)") },
			effectDescription() { return L("token 产出 ×", "Token gain ×") + format(TUNING.MS.c1) },
			unlocked() { return hasMilestone("c", 0) },
			done() { return player.c.best.gte(TUNING.AUTO.c1) },
		},
		2: {
			requirementDescription() { return L("32K 上下文（32768）", "32K context (32768)") },
			effectDescription() { return L("流式输出速率 ×5（→ ×2.5 采样强度/秒）。", "Streaming rate ×5 (→ ×2.5 click power per second).") },
			unlocked() { return hasMilestone("c", 1) },
			done() { return player.c.best.gte(TUNING.AUTO.c2) },
		},
		3: {
			requirementDescription() { return L("128K 上下文（131072）", "128K context (131072)") },
			effectDescription() { return L("上下文收益 ×2。", "Context gain ×2.") },
			unlocked() { return hasMilestone("c", 2) },
			done() { return player.c.best.gte(131072) },
		},
		4: {
			requirementDescription() { return L("1M 上下文（1048576）", "1M context (1048576)") },
			effectDescription() { return L("解锁投机解码购买项。", "Unlock the speculative-decoding buyable.") },
			unlocked() { return hasMilestone("c", 3) },
			done() { return player.c.best.gte(1048576) },
		},
		5: {
			requirementDescription() { return L("16M 上下文（16777216 = 2²⁴）", "16M context (16777216 = 2^24)") },
			effectDescription() { return L("token 产出 ×", "Token gain ×") + format(TUNING.MS.c5) + L("。真彩色的可能性数量 —— 这个数字是留给程序员的。", ". The number of true-color possibilities — saved for the programmers.") },
			unlocked() { return hasMilestone("c", 4) },
			done() { return player.c.best.gte(16777216) },
		},
	},

	buyables: {
		11: {
			title() { return L("🌡 温度", "🌡 Temperature") },
			cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
			effect(x) { return x.times(0.1).add(1) },
			display() {
				return L("每次采样 ×", "Sample ×") + format(tmp[this.layer].buyables[this.id].effect) +
					L("<br>（每级 +10% 创造力，上限 24 级）", "<br>(+10% creativity per level, 24 max)") +
					"<br>" + L("等级", "Level") + ": " + formatWhole(getBuyableAmount(this.layer, this.id)) +
					"<br>" + L("价格", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + " token"
			},
			canAfford() { return player.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player.points = player.points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(tmp[this.layer].buyables[this.id].cost)
			},
			purchaseLimit: new Decimal(24),
			style() { return { "background-color": "#0d1117", "color": "#ffa657" } },
		},
		12: {
			title() { return L("🗜 上下文压缩", "🗜 Context compression") },
			cost(x) { return new Decimal(5).times(Decimal.pow(2.5, x)) },
			effect(x) { return Decimal.pow(1.15, x) },
			display() {
				return L("上下文收益 ×", "Context gain ×") + format(tmp[this.layer].buyables[this.id].effect) +
					"<br>" + L("等级", "Level") + ": " + formatWhole(getBuyableAmount(this.layer, this.id)) +
					"<br>" + L("价格", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + L(" 上下文", " context")
			},
			canAfford() { return player.c.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player.c.points = player.c.points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(tmp[this.layer].buyables[this.id].cost)
			},
			style() { return { "background-color": "#0d1117", "color": "#7ee787" } },
		},
		13: {
			title() { return L("⚡ 投机解码", "⚡ Speculative decoding") },
			unlocked() { return hasMilestone("c", 4) },
			currencyLayer: "c", currencyInternalName: "bytes",
			cost(x) { return new Decimal(50).times(Decimal.pow(2.5, x)) },
			effect(x) { return x.times(0.2).add(1) },
			display() {
				return L("采样强度 ×", "Sample ×") + format(tmp[this.layer].buyables[this.id].effect) +
					L("<br>让小模型先猜，大模型只负责检查。", "<br>Let a small model guess; the big one only checks.") +
					"<br>" + L("等级", "Level") + ": " + formatWhole(getBuyableAmount(this.layer, this.id)) +
					"<br>" + L("价格", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + L(" KV 字节", " KV bytes")
			},
			canAfford() { return player.c.bytes.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player.c.bytes = player.c.bytes.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(tmp[this.layer].buyables[this.id].cost)
			},
			purchaseLimit: new Decimal(20),
			style() { return { "background-color": "#0d1117", "color": "#79c0ff" } },
		},
		14: {
			title() { return L("🧠 KV 缓存池", "🧠 KV-cache pool") },
			currencyLayer: "c", currencyInternalName: "bytes",
			cost(x) { return new Decimal(10).times(Decimal.pow(2.5, x)) },
			effect(x) { return Decimal.pow(1.15, x) },
			display() {
				return L("token 产出 ×", "Token gain ×") + format(tmp[this.layer].buyables[this.id].effect) +
					"<br>" + L("等级", "Level") + ": " + formatWhole(getBuyableAmount(this.layer, this.id)) +
					"<br>" + L("价格", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + L(" KV 字节", " KV bytes")
			},
			canAfford() { return player.c.bytes.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player.c.bytes = player.c.bytes.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(tmp[this.layer].buyables[this.id].cost)
			},
			style() { return { "background-color": "#0d1117", "color": "#79c0ff" } },
		},
	},
})

// 温度 buyable 的效果被 getClickPower 读取（mod.js）；压缩 12 在 gainMult；KV 池 14 在 getPointGen。
