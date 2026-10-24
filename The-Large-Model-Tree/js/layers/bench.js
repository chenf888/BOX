// ============================================================================
// bench — 基准 Benchmarks（side 成就层，M10 收集）
// 32 枚成就（2^5，程序员节的 2 的幂），名字来自真实基准与程序员梗。
// 奖励：平乘（getPointGen 读取 TUNING.ACH.mults）+ P11 补发（带 !has 守卫）。
// 还承载语言切换（T2 双语开关）。
// ============================================================================

addLayer("bench", {
	name: "benchmarks",
	symbol: "Bm",
	row: "side",
	color: "#161412",
	resource() { return L("基准", "Benchmarks") },
	resZh: "基准", resEn: "Benchmarks",
	type: "none",
	startData() {
		return { unlocked: true, points: new Decimal(0), chinesemode: false }
	},
	tooltip() { return L("基准测试：你的模型走到哪一步了？", "Benchmarks: how far has your model come?") },
	achievementPopups: true,

	update(diff) {
		if (!player[this.layer].unlocked) return
		// P11 成就补发（全部带幂等守卫，防止重复 push）
		if (hasAchievement("bench", 21) && !hasMilestone("c", 0)) player.c.milestones.push(0)
		if (hasAchievement("bench", 25) && !hasMilestone("p", 1)) player.p.milestones.push(1)
		if (hasAchievement("bench", 31) && !hasMilestone("a", 1)) player.a.milestones.push(1)
	},

	tabFormat: [
		["display-text", function() {
			return L("基准测试 —— 每一枚都是一次评测通过。奖励见悬浮提示。", "Benchmarks — each one is a eval passed. Rewards in the tooltips.")
		}],
		["display-text", function() {
			return L("当前成就加成：token ×", "Current achievement mult: token ×") + "<b>" + format(achMultTotal()) + "</b>"
		}],
		"blank",
		"achievements",
		"blank",
		["row", [
			["display-text", function() { return L("语言 / Language：", "Language / 语言：") }],
			["blank", ["10px", "10px"]],
			["toggle", ["bench", "chinesemode"]],
		]],
		["blank", "30px"],
	],

	achievements: {
		// ---- 行 1：起步 ----
		11: {
			name() { return L("Hello, World!", "Hello, World!") },
			done() { return getClickableState("c", 11) >= 1 },
			tooltip() { return L("采样第一个 token。<br>一切从这里开始。", "Sample your first token.<br>Everything starts here.") },
		},
		12: {
			name() { return L("第一个 1K", "First 1K") },
			done() { return player.points.gte(1000) },
			tooltip() { return L("拥有 1000 token。<br>奖励：token ×", "Have 1000 tokens.<br>Reward: token ×") + format(TUNING.ACH.mults[12]) },
		},
		13: {
			name() { return L("MMLU 及格", "MMLU pass") },
			done() { return player.c.best.gte(1024) },
			tooltip() { return L("上下文达到 1K。<br>25.0% —— 蒙对了四分之一。", "Reach 1K context.<br>25.0% — a quarter right by luck.") },
		},
		14: {
			name() { return L("规模化开端", "Scale-up begins") },
			done() { return player.p.best.gte(10) },
			tooltip() { return L("参数级达到 10（≈ 百亿参数）。", "Reach 10 parameter levels (≈1e10 params).") },
		},
		15: {
			name() { return L("Attention Is All You Need", "Attention Is All You Need") },
			done() { return player.a.best.gte(1) },
			tooltip() { return L("解锁注意力层。<br>2017 年的那篇论文。", "Unlock attention.<br>That 2017 paper.") },
		},
		16: {
			name() { return L("数据喂饱", "Well-fed") },
			done() { return player.d.best.gte(10) },
			tooltip() { return L("数据达到 10。<br>奖励：token ×", "Reach 10 data.<br>Reward: token ×") + format(TUNING.ACH.mults[16]) },
		},
		17: {
			name() { return L("堆显卡", "GPU hoarding") },
			done() { return player.f.best.gte(1) },
			tooltip() { return L("组建 8 卡集群。<br>电费账单已在路上。", "Build an 8-GPU cluster.<br>The power bill is coming.") },
		},
		18: {
			name() { return L("首次训练", "First training run") },
			done() { return player.tr.best.gte(1) },
			tooltip() { return L("完成一次完整训练。<br>loss = 2.87，然后就不动了。", "Finish one training run.<br>loss = 2.87, then it plateaus.") },
		},
		// ---- 行 2：成长 ----
		21: {
			name() { return L("过拟合一次", "Overfit once") },
			done() { return challengeCompletions("tr", 11) >= 1 },
			tooltip() { return L("完成「过拟合」挑战。<br>奖励：立即获得上下文层里程碑 1（补发）。", "Complete Overfitting.<br>Reward: instantly gain context milestone 1 (backfill).") },
		},
		22: {
			name() { return L("GSM8K 小学题", "GSM8K grade school") },
			done() { return player.c.best.gte(4096) },
			tooltip() { return L("上下文达到 4K。<br>奖励：token ×", "Reach 4K context.<br>Reward: token ×") + format(TUNING.ACH.mults[22]) },
		},
		23: {
			name() { return L("万亿俱乐部", "Trillion club") },
			done() { return player.p.best.gte(12) },
			tooltip() { return L("参数级达到 12（≈ 1 万亿参数）。", "Reach 12 parameter levels (≈1T params).") },
		},
		24: {
			name() { return L("1M 上下文", "1M context") },
			done() { return player.c.best.gte(1048576) },
			tooltip() { return L("上下文达到 1M（2^20）。<br>整本书都装得下。", "Reach 1M context (2^20).<br>War and Peace fits twice.") },
		},
		25: {
			name() { return L("百万 Token", "Million tokens") },
			done() { return player.points.gte(1e6) },
			tooltip() { return L("拥有 1e6 token。<br>奖励：立即获得参数层里程碑 2（自动化补发）。", "Have 1e6 tokens.<br>Reward: instantly gain parameter milestone 2 (automation backfill).") },
		},
		26: {
			name() { return L("1024 卡集群", "1024-GPU cluster") },
			done() { return player.f.best.gte(10) },
			tooltip() { return L("算力档位达到 10（2^10 = 1024 卡）。<br>这个数字是留给程序员的。", "Reach compute tier 10 (2^10 = 1024 GPUs).<br>This number was saved for the programmers.") },
		},
		27: {
			name() { return L("Scaling Laws", "Scaling Laws") },
			done() { return player.tr.best.gte(100) },
			tooltip() { return L("训练进度达到 100。<br>奖励：token ×", "Reach 100 training.<br>Reward: token ×") + format(TUNING.ACH.mults[27]) },
		},
		28: {
			name() { return L("INT8 上线", "INT8 ships") },
			done() { return player.dep.best.gte(50) },
			tooltip() { return L("部署实例达到 50。<br>掉一点精度，省一半显存。", "Reach 50 deployments.<br>Less precision, half the VRAM.") },
		},
		// ---- 行 3：涌现 ----
		31: {
			name() { return L("幻觉产生器", "Hallucination generator") },
			done() { return challengeCompletions("tr", 12) >= 1 },
			tooltip() { return L("完成「模式崩溃」挑战。<br>奖励：立即获得注意力层里程碑 2（补发）。", "Complete Mode Collapse.<br>Reward: instantly gain attention milestone 2 (backfill).") },
		},
		32: {
			name() { return L("CoT 思维链", "Chain of Thought") },
			done() { return player.em.best.gte(100) },
			tooltip() { return L("涌现达到 100。<br>让我们一步一步想。", "Reach 100 emergence.<br>Let's think step by step.") },
		},
		33: {
			name() { return L("温度调到 2", "Temperature: 2") },
			done() { return getBuyableAmount("c", 11).gte(20) },
			tooltip() { return L("温度 buyable 达到 20 级。<br>创造力拉满，胡话也拉满。", "Temperature at level 20.<br>Maximum creativity, maximum nonsense.") },
		},
		34: {
			name() { return L("AGI 半程", "AGI halfway") },
			done() { return player.agi.best.gte(128) },
			tooltip() { return L("AGI 里程碑达到 128。<br>奖励：token ×", "Reach 128 AGI milestones.<br>Reward: token ×") + format(TUNING.ACH.mults[34]) },
		},
		35: {
			name() { return L("Ctrl+C Ctrl+V", "Ctrl+C Ctrl+V") },
			done() { return getBuyableAmount("c", 13).gte(1) },
			tooltip() { return L("买一个投机解码。<br>工程的真实捷径。", "Buy speculative decoding.<br>The real engineering shortcut.") },
		},
		36: {
			name() { return L("SFT 毕业", "SFT graduate") },
			done() { return player.tr.best.gte(1000) },
			tooltip() { return L("训练进度达到 1000。<br>模型学会了礼貌地拒绝。", "Reach 1000 training.<br>The model learned to politely refuse.") },
		},
		37: {
			name() { return L("对齐税", "Alignment tax") },
			done() { return maxedChallenge("tr", 14) },
			tooltip() { return L("「灾难性遗忘」两次完成。<br>奖励：token ×", "Max out Catastrophic Forgetting.<br>Reward: token ×") + format(TUNING.ACH.mults[37]) },
		},
		38: {
			name() { return L("The Bitter Lesson", "The Bitter Lesson") },
			done() { return player.f.best.gte(15) },
			tooltip() { return L("算力档位达到 15（32768 卡）。<br>算力终将战胜技巧。", "Reach compute tier 15 (32768 GPUs).<br>Compute always wins.") },
		},
		// ---- 行 4：终局 ----
		41: {
			name() { return L("It's Just MatMul", "It's Just MatMul") },
			done() { return player.p.best.gte(500) },
			tooltip() { return L("参数级达到 500。<br>归根结底就是矩阵乘法。", "Reach 500 parameter levels.<br>At the end of the day, it's matrix multiplication.") },
		},
		42: {
			name() { return L("16M 上下文", "16M context") },
			done() { return player.c.best.gte(16777216) },
			tooltip() { return L("上下文达到 2^24。<br>真彩色的可能性数量。", "Reach 2^24 context.<br>The true-color possibility count.") },
		},
		43: {
			name() { return L("模式崩溃幸存者", "Mode-collapse survivor") },
			done() { return maxedChallenge("tr", 12) },
			tooltip() { return L("「模式崩溃」两次完成。<br>手速的胜利。", "Max out Mode Collapse.<br>A triumph of clicking.") },
		},
		44: {
			name() { return L("涌现！", "EMERGENCE!") },
			done() { return player.em.best.gte(1e4) },
			tooltip() { return L("涌现达到 1e4。<br>没人知道为什么，但它就是会了。<br>奖励：token ×", "Reach 1e4 emergence.<br>Nobody knows why — it just works.<br>Reward: token ×") + format(TUNING.ACH.mults[44]) },
		},
		45: {
			name() { return L("推理模型", "Reasoning model") },
			done() { return player.em.best.gte(1e6) },
			tooltip() { return L("涌现达到 1e6。<br>它会先想一想再回答。", "Reach 1e6 emergence.<br>It thinks before it speaks.") },
		},
		46: {
			name() { return L("十万卡集群", "100K-GPU cluster") },
			done() { return player.f.best.gte(17) },
			tooltip() { return L("算力档位达到 17（2^17 = 131072 卡）。<br>一个小国家的电网。", "Reach compute tier 17 (2^17 = 131072 GPUs).<br>The power grid of a small country.") },
		},
		47: {
			name() { return L("AGI 临界", "AGI critical") },
			done() { return player.agi.best.gte(512) },
			tooltip() { return L("AGI 里程碑达到 512。<br>奖励：token ×", "Reach 512 AGI milestones.<br>Reward: token ×") + format(TUNING.ACH.mults[47]) },
		},
		48: {
			name() { return L("1024 · 代码改变世界", "1024 · Code changes the world") },
			done() { return player.agi.best.gte(TUNING.AGI.win) },
			tooltip() { return L("达成 1024 —— 通用人工智能。<br>献给 1024 程序员节。<br>奖励：token ×", "Reach 1024 — AGI.<br>For the 1024 Programmer's Day.<br>Reward: token ×") + format(TUNING.ACH.mults[48]) },
		},
	},
})
