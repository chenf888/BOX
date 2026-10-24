// ============================================================================
// tr — 训练 Training（row 3，custom 类型 = M7 仪式层）
// 预训练 + 后训练（SFT/RLHF）合一的枢纽层。收益 = scaling law：
//     gain = (数据 × 算力 / div)^0.5 × 乘区   （staged re-root 防失控）
// 4 个训练病理挑战（M1）：过拟合 / 模式崩溃 / 梯度消失 / 灾难性遗忘。
// ============================================================================

// ---- 训练收益的公式族（getResetGain / getNextAt 共用同一套正逆变换）----
function trRoot1() {
	return hasUpgrade("tr", 15) ? new Decimal(TUNING.TR.root1u) : new Decimal(TUNING.TR.root1)
}
function trPreMults() {
	let m = new Decimal(1)
	if (hasMilestone("tr", 4)) m = m.times(TUNING.MS.tr4)
	if (hasMilestone("tr", 6)) m = m.times(TUNING.MS.tr6)
	if (hasUpgrade("tr", 16)) m = m.times(TUNING.UPG.tr16)
	if (hasUpgrade("tr", 12)) m = m.times(player.d.best.max(1).log(10).add(1).pow(TUNING.SHAPE.tr12))
	if (hasUpgrade("tr", 13)) m = m.times(player.a.best.max(1).log(10).add(1).pow(TUNING.SHAPE.tr13))
	if (hasUpgrade("tr", 21)) m = m.times(player.tr.points.add(1).pow(TUNING.SELF.tr21))
	if (hasUpgrade("tr", 22) && player.tr.epochs >= 10) m = m.times(5)
	if (hasMilestone("tr", 1)) m = m.times(player.tr.epochs * TUNING.TR.epochMult + 1)
	m = m.times(Decimal.pow(1.15, getBuyableAmount("tr", 11)))
	if (player.dep.unlocked) {
		m = m.times(layers.dep.effect().trBoost)
		if (hasUpgrade("dep", 23)) m = m.times(TUNING.UPG.dep23)
	}
	if (player.em.unlocked) {
		m = m.times(layers.em.effect().trBoost)
		if (hasUpgrade("em", 15)) m = m.times(TUNING.UPG.em15)
	}
	if (player.agi.unlocked) {
		m = m.times(layers.agi.effect().trBoost)
		if (hasUpgrade("agi", 14)) m = m.times(TUNING.UPG.agi14)
	}
	return m
}
function trApplyRoots(g) {
	const r1 = trRoot1(), r2 = new Decimal(TUNING.TR.root2)
	if (g.gte(r1)) g = g.sqrt().times(r1.sqrt())
	if (g.gte(r2)) g = g.sqrt().times(r2.sqrt())
	return g
}
function trRawGain() {
	return player.d.points.max(1).times(player.f.points.max(1)).div(TUNING.TR.div).pow(TUNING.TR.exp)
}
function trGainTotal() {
	let g = trApplyRoots(trRawGain().times(trPreMults()))
	if (hasUpgrade("dep", 14)) g = g.pow(TUNING.META.dep14)
	return g.max(0).floor()
}
function trNextAt() {
	let t = player.tr.points.add(1)
	const r1 = trRoot1(), r2 = new Decimal(TUNING.TR.root2)
	if (t.gte(r2)) t = t.div(r2.sqrt()).pow(2)
	if (t.gte(r1)) t = t.div(r1.sqrt()).pow(2)
	t = t.div(trPreMults().max(0.01))
	if (hasUpgrade("dep", 14)) t = t.pow(Decimal.pow(TUNING.META.dep14, -1))
	return t.pow(2).times(TUNING.TR.div).max(TUNING.TR.div)
}

addLayer("tr", {
	name: "training",
	symbol: "Tr",
	position: 0,
	row: 3,
	color: "#161412",
	resource() { return L("训练进度", "Training runs") },
	resZh: "训练进度", resEn: "training progress",
	baseResource() { return L("数据 × 算力", "data × compute") },
	baseZh: "数据×算力", baseEn: "data × compute",
	baseAmount() { return player.d.points.times(player.f.points) },
	requires: new Decimal(TUNING.TR.div),
	type: "custom",

	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			epochs: 0,          // 已完成的 epoch 数（number）
			epochProgress: 0,   // 当前 epoch 秒数（number）
		}
	},

	getResetGain() { return trGainTotal() },
	getNextAt() { return trNextAt() },
	canReset() { return trGainTotal().gte(1) },
	prestigeButtonText() {
		return L("启动新一轮训练", "Start a new training run") +
			"<br>+" + formatWhole(tmp.tr.resetGain) + " " + L("训练进度", "progress") +
			"<br><span style='opacity:.7'>" + L("下一级需 数据×算力 ≥ ", "next at data×compute ≥ ") +
			format(tmp.tr.nextAt) + "</span>"
	},

	effect() {
		let db = player.tr.best.max(1).log(10).add(1).pow(TUNING.EFF.trD)
		if (hasUpgrade("tr", 14)) db = db.pow(TUNING.META.tr14) // K4：Scaling Law 拟合
		return {
			tokenBoost: player.tr.best.max(1).log(10).add(1).pow(TUNING.EFF.trToken),
			dBoost: db,
			fBoost: player.tr.best.max(1).log(10).add(1).pow(TUNING.EFF.trF),
			depBoost: player.tr.best.max(1).log(10).add(1).pow(TUNING.EFF.depTr),
		}
	},
	effectDescription() {
		let e = layers.tr.effect()
		return L("，token ×", ", tokens ×") + format(e.tokenBoost) +
			L("，数据 ×", ", data ×") + format(e.dBoost) +
			L("，算力越训越便宜 ×", ", compute cheaper ×") + format(e.fBoost) +
			L("，部署 ×", ", deployment ×") + format(e.depBoost)
	},

	layerShown() { return player.d.unlocked || player.f.unlocked || player.tr.unlocked },

	// ---- 自动化（em m3 终局 package）----
	resetsNothing() { return hasMilestone("em", 3) },
	autoPrestige() { return hasMilestone("em", 3) },
	autoUpgrade() { return hasMilestone("em", 3) },

	hotkeys: [
		{ key: "t", description() { return L("T: 启动新一轮训练", "T: Start a new training run") }, onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	branches: ["d", "f"],

	doReset(resettingLayer) {
		if (!(layers[resettingLayer].row > this.row)) return
		let kept = ["best", "total", "milestones", "epochs", "epochProgress"]
		if (hasMilestone("tr", 0)) kept.push("upgrades")
		layerDataReset(this.layer, kept)
	},

	update(diff) {
		if (!player[this.layer].unlocked) return
		// epoch 收敛条（M4）：速度受里程碑/升级/批大小加成
		let speed = 1
		if (hasMilestone("tr", 1)) speed *= 2
		if (hasUpgrade("tr", 25)) speed *= 2
		speed *= 1 + 0.25 * getBuyableAmount("tr", 12).toNumber()
		player[this.layer].epochProgress += diff * speed
		while (player[this.layer].epochProgress >= TUNING.TR.epochNeed) {
			player[this.layer].epochProgress -= TUNING.TR.epochNeed
			player[this.layer].epochs += 1
		}
	},

	bars: {
		epoch: {
			direction: RIGHT,
			width: 400,
			height: 26,
			progress() { return player.tr.epochProgress / TUNING.TR.epochNeed },
			display() {
				return L("Epoch 收敛：", "Epoch convergence: ") +
					formatWhole(player.tr.epochProgress / TUNING.TR.epochNeed * 100) + "% · " +
					L("已完成 ", "completed ") + formatWhole(player.tr.epochs) + L(" 轮", " epochs")
			},
			fillStyle: { "background-color": "#161412" },
			baseStyle: { "background-color": "#F2EEE3" },
			textStyle: { "color": "#F2EEE3" },
			unlocked() { return player.tr.unlocked },
		},
	},

	tabFormat: [
		["display-text", tokenLineFn()],
		["display-text", function() {
			return L("数据 × 算力 = ", "data × compute = ") +
				"<b style='color:#161412'>" + formatWhole(player.d.points) + "</b> × " +
				"<b style='color:#161412'>" + formatWhole(player.f.points) + "</b> = " +
				"<b>" + formatWhole(player.d.points.times(player.f.points)) + "</b>"
		}],
		["display-text", mainLineFn("tr")],
		["display-text", bestLineFn("tr")],
		"blank",
		["bar", "epoch"],
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
					["raw-html", function() { return "<div style='opacity:.5'>" + L("炼丹师的秘籍：学习率、批大小、还有运气。", "The alchemist's grimoire: learning rate, batch size, and luck.") + "</div>" }],
					"blank", "upgrades",
				],
			},
			"Milestones": { content: [["blank", "15px"], "milestones"] },
			"Challenges": { content: [["blank", "15px"], "challenges"] },
			"Buyables": { content: ["buyables"] },
		},
	},

	upgrades: {
		11: {
			title() { return L("Warmup 调度", "Warmup schedule") },
			description() { return L("token 产出 ×3。", "Token gain ×3.") },
			cost: new Decimal(1),
			unlocked() { return true },
		},
		12: {
			title() { return L("梯度裁剪", "Gradient clipping") },
			description() { return L("训练收益 ×(log₁₀(数据)+1)^1.2。", "Training gain ×(log₁₀(data)+1)^1.2.") },
			cost: new Decimal(10),
			unlocked() { return hasUpgrade("tr", 11) },
			effect() { return player.d.best.max(1).log(10).add(1).pow(TUNING.SHAPE.tr12) },
		},
		13: {
			title() { return L("分布式并行", "Distributed training") },
			description() { return L("训练收益 ×(log₁₀(注意力最高)+1)^1.1。", "Training gain ×(log₁₀(best attention)+1)^1.1.") },
			cost: new Decimal(100),
			unlocked() { return hasUpgrade("tr", 12) },
			effect() { return player.a.best.max(1).log(10).add(1).pow(TUNING.SHAPE.tr13) },
		},
		14: {
			title() { return L("Scaling Law 拟合", "Scaling-law fitting") },
			description() { return L("训练的数据加成 ^1.15（命名机制）。", "Training's data boost ^1.15 (named mechanic).") },
			cost: new Decimal(1000),
			unlocked() { return hasUpgrade("tr", 13) },
		},
		15: {
			title() { return L("损失平台期突破", "Loss-plateau breakthrough") },
			description() { return L("收益再开方的第一阈值 1e10 → 1e12。", "First re-root threshold 1e10 → 1e12.") },
			cost: new Decimal(5000),
			unlocked() { return hasUpgrade("tr", 14) },
		},
		16: {
			title() { return L("混合精度", "Mixed precision") },
			description() { return L("训练收益 ×2。", "Training gain ×2.") },
			cost: new Decimal(2e4),
			unlocked() { return hasUpgrade("tr", 15) },
		},
		21: {
			title() { return L("EMA 权重", "EMA weights") },
			description() { return L("训练收益 ×(训练+1)^0.3。", "Training gain ×(training+1)^0.3.") },
			cost: new Decimal(1e5),
			unlocked() { return hasUpgrade("tr", 16) },
			effect() { return player.tr.points.add(1).pow(TUNING.SELF.tr21) },
		},
		22: {
			title() { return L("梯度累积", "Gradient accumulation") },
			description() { return L("epoch ≥ 10 轮时，训练收益 ×5。", "With 10+ epochs: training gain ×5.") },
			cost: new Decimal(1e6),
			unlocked() { return hasUpgrade("tr", 21) },
		},
		23: {
			title() { return L("检查点复用", "Checkpoint reuse") },
			description() { return L("token 产出 ×(log₁₀(训练最高)+1)^1.5。", "Token gain ×(log₁₀(best training)+1)^1.5.") },
			cost: new Decimal(1e7),
			unlocked() { return hasUpgrade("tr", 22) },
			effect() { return player.tr.best.max(1).log(10).add(1).pow(TUNING.SHAPE.tr23) },
		},
		24: {
			title() { return L("数据回放", "Data replay") },
			description() { return L("数据收益 ×3。", "Data gain ×3.") },
			cost: new Decimal(1e8),
			unlocked() { return hasUpgrade("tr", 23) },
		},
		25: {
			title() { return L("早停法", "Early stopping") },
			description() { return L("epoch 收敛速度 ×2。", "Epoch convergence ×2.") },
			cost: new Decimal(1e9),
			unlocked() { return hasUpgrade("tr", 24) },
		},
		31: {
			title() { return L("奖励模型", "Reward model") },
			description() { return L("token 产出 ×5。RLHF 的第一步。", "Token gain ×5. Step one of RLHF.") },
			cost: new Decimal(1e10),
			unlocked() { return hasUpgrade("tr", 25) },
		},
	},

	milestones: {
		0: {
			requirementDescription() { return L("基线模型（训练 1）", "Baseline model (training 1)") },
			effectDescription() { return L("重置不再清空本层升级。", "Resets no longer wipe this layer's upgrades.") },
			done() { return player.tr.best.gte(1) },
		},
		1: {
			requirementDescription() { return L("训练 10", "Training 10") },
			effectDescription() { return L("epoch 收敛速度 ×2。", "Epoch convergence ×2.") },
			unlocked() { return hasMilestone("tr", 0) },
			done() { return player.tr.best.gte(10) },
		},
		2: {
			requirementDescription() { return L("预训练完成（100）", "Pretraining done (100)") },
			effectDescription() { return L("token ×", "Token ×") + format(TUNING.MS.tr2) + L("。基座模型出炉。", ". The base model ships.") },
			unlocked() { return hasMilestone("tr", 1) },
			done() { return player.tr.best.gte(TUNING.AUTO.tr3 / 10) },
		},
		3: {
			requirementDescription() { return L("SFT 完成（1000）", "SFT done (1000)") },
			effectDescription() { return L("数据、算力、注意力三层全自动（声望 + 保留 + 升级）。", "Data, compute and attention fully automated (prestige + keep + upgrades).") },
			unlocked() { return hasMilestone("tr", 2) },
			done() { return player.tr.best.gte(TUNING.AUTO.tr3) },
		},
		4: {
			requirementDescription() { return L("RLHF 完成（1e4）", "RLHF done (1e4)") },
			effectDescription() { return L("训练收益 ×", "Training gain ×") + format(TUNING.MS.tr4) },
			unlocked() { return hasMilestone("tr", 3) },
			done() { return player.tr.best.gte(1e4) },
		},
		5: {
			requirementDescription() { return L("DPO 对齐（1e5）", "DPO alignment (1e5)") },
			effectDescription() { return L("部署收益 ×2。", "Deployment gain ×2.") },
			unlocked() { return hasMilestone("tr", 4) },
			done() { return player.tr.best.gte(1e5) },
		},
		6: {
			requirementDescription() { return L("宪法式对齐（1e6）", "Constitutional alignment (1e6)") },
			effectDescription() { return L("训练收益 ×", "Training gain ×") + format(TUNING.MS.tr6) },
			unlocked() { return hasMilestone("tr", 5) },
			done() { return player.tr.best.gte(1e6) },
		},
		7: {
			requirementDescription() { return L("对齐完成（1e7）", "Alignment complete (1e7)") },
			effectDescription() { return L("token ×", "Token ×") + format(TUNING.MS.tr7) + L("。模型学会了说「我不知道」。", ". The model learned to say \"I don't know.\"") },
			unlocked() { return hasMilestone("tr", 6) },
			done() { return player.tr.best.gte(1e7) },
		},
	},

	challenges: {
		11: {
			name() { return L("过拟合", "Overfitting") },
			challengeDescription() {
				return L("token 产出 ×0.01 —— 模型把训练集背下来了，一到考试就不会。<br>", "Token gain ×0.01 — the model memorized the training set and froze at the exam.<br>") +
					L("进入挑战会重置下层数据/算力/注意力（训练进度保留）。", "Entering resets data/compute/attention below (training progress is kept).") +
					"<br>" + challengeCompletions(this.layer, this.id) + " / " + this.completionLimit + " " + L("次完成", "completions")
			},
			goalDescription() {
				return L("在削弱下达到 1K / 1M 上下文", "Reach 1K / 1M context while debuffed")
			},
			canComplete() {
				const goal = new Decimal(TUNING.CHAL.goal11[challengeCompletions(this.layer, this.id) % 2])
				return player.c.best.gte(goal)
			},
			rewardDescription() { return L("奖励：token 产出 ×", "Reward: token gain ×") + format(TUNING.CHAL.rw11) + L(" 每次完成", " per completion") },
			rewardEffect() { return Decimal.pow(TUNING.CHAL.rw11, challengeCompletions(this.layer, this.id)) },
			rewardDisplay() { return "×" + format(this.rewardEffect()) },
			completionLimit: 2,
			unlocked() { return player.tr.best.gte(1) },
		},
		12: {
			name() { return L("模式崩溃", "Mode collapse") },
			challengeDescription() {
				return L("流式输出消失，采样强度恒为 1 —— 模型只会输出同一个词。<br>纯手速挑战。", "Streaming is gone and sampling is fixed at 1 — the model only ever outputs the same word.<br>A pure click-speed trial.") +
					"<br>" + challengeCompletions(this.layer, this.id) + " / " + this.completionLimit + " " + L("次完成", "completions")
			},
			goalDescription() { return L("纯采样达到 1K / 10K token", "Reach 1K / 10K tokens by sampling alone") },
			canComplete() {
				const goal = TUNING.CHAL.goal12[challengeCompletions(this.layer, this.id) % 2]
				return player.points.gte(goal)
			},
			rewardDescription() { return L("奖励：采样强度 ×", "Reward: sample power ×") + format(TUNING.CHAL.rw12) + L(" 每次完成", " per completion") },
			rewardEffect() { return Decimal.pow(TUNING.CHAL.rw12, challengeCompletions(this.layer, this.id)) },
			rewardDisplay() { return "×" + format(this.rewardEffect()) },
			completionLimit: 2,
			unlocked() { return player.tr.best.gte(10) },
		},
		13: {
			name() { return L("梯度消失", "Vanishing gradient") },
			challengeDescription() {
				return L("上下文收益指数 ×0.5 —— 深层网络学不动了。<br>", "Context gain exponent ×0.5 — the deep layers stopped learning.<br>") +
					L("进入挑战会重置下层数据/算力/注意力（训练进度保留）。", "Entering resets data/compute/attention below (training progress is kept).") +
					"<br>" + challengeCompletions(this.layer, this.id) + " / " + this.completionLimit + " " + L("次完成", "completions")
			},
			goalDescription() { return L("在削弱下达到 32K / 300K 上下文", "Reach 32K / 300K context while debuffed") },
			canComplete() {
				const goal = new Decimal(TUNING.CHAL.goal13[challengeCompletions(this.layer, this.id) % 2])
				return player.c.best.gte(goal)
			},
			rewardDescription() { return L("奖励：上下文收益 ×", "Reward: context gain ×") + format(TUNING.CHAL.rw13) + L(" 每次完成", " per completion") },
			rewardEffect() { return Decimal.pow(TUNING.CHAL.rw13, challengeCompletions(this.layer, this.id)) },
			rewardDisplay() { return "×" + format(this.rewardEffect()) },
			completionLimit: 2,
			unlocked() { return player.tr.best.gte(100) },
		},
		14: {
			name() { return L("灾难性遗忘", "Catastrophic forgetting") },
			challengeDescription() {
				return L("参数收益 ×0.1 —— 学新的忘旧的。<br>", "Parameter gain ×0.1 — it learns the new and forgets the old.<br>") +
					L("进入挑战会重置下层数据/算力/注意力（训练进度保留）。", "Entering resets data/compute/attention below (training progress is kept).") +
					"<br>" + challengeCompletions(this.layer, this.id) + " / " + this.completionLimit + " " + L("次完成", "completions")
			},
			goalDescription() { return L("在削弱下达到 2500 / 25000 参数", "Reach 2500 / 25000 parameters while debuffed") },
			canComplete() {
				const goal = TUNING.CHAL.goal14[challengeCompletions(this.layer, this.id) % 2]
				return player.p.best.gte(goal)
			},
			rewardDescription() { return L("奖励：参数收益 ×", "Reward: parameter gain ×") + format(TUNING.CHAL.rw14) + L(" 每次完成", " per completion") },
			rewardEffect() { return Decimal.pow(TUNING.CHAL.rw14, challengeCompletions(this.layer, this.id)) },
			rewardDisplay() { return "×" + format(this.rewardEffect()) },
			completionLimit: 2,
			unlocked() { return player.tr.best.gte(1000) },
		},
	},

	buyables: {
		11: {
			title() { return L("📉 学习率调度器", "📉 LR scheduler") },
			cost(x) { return new Decimal(10).times(Decimal.pow(2.5, x)) },
			effect(x) { return Decimal.pow(1.15, x) },
			display() {
				return L("训练收益 ×", "Training gain ×") + format(tmp[this.layer].buyables[this.id].effect) +
					"<br>" + L("等级", "Level") + ": " + formatWhole(getBuyableAmount(this.layer, this.id)) +
					"<br>" + L("价格", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + L(" 训练进度", " progress")
			},
			canAfford() { return player.tr.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player.tr.points = player.tr.points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(tmp[this.layer].buyables[this.id].cost)
			},
			style() { return { "background-color": "#F2EEE3", "color": "#161412" } },
		},
		12: {
			title() { return L("📦 Batch Size 扩容", "📦 Bigger batch") },
			cost(x) { return new Decimal(25).times(Decimal.pow(2.5, x)) },
			effect(x) { return x.times(0.25).add(1) },
			display() {
				return L("epoch 收敛速度 ×", "Epoch convergence ×") + format(tmp[this.layer].buyables[this.id].effect) +
					"<br>" + L("等级", "Level") + ": " + formatWhole(getBuyableAmount(this.layer, this.id)) +
					"<br>" + L("价格", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + L(" 训练进度", " progress")
			},
			canAfford() { return player.tr.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				player.tr.points = player.tr.points.sub(tmp[this.layer].buyables[this.id].cost)
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(tmp[this.layer].buyables[this.id].cost)
			},
			style() { return { "background-color": "#F2EEE3", "color": "#161412" } },
		},
	},
})
