// ============================================================================
// TUNING — 大模型之树 The Large Model Tree
// ----------------------------------------------------------------------------
// 唯一的节奏常数居所（handbook 14 §3.3）。层文件、显示文案与 tools/simulate.js
// 都在运行时读取这里 —— 数值与文案永远同源，改这一个文件即可整体调参。
// 规则：这里只放「数字与公式参数」；层文件只引用 TUNING.xxx，不复写字面量。
// ============================================================================

var TUNING = {
	// ---- 采样（点击）与流式输出（被动 token）----
	CLICK: {
		base: 1,                // 一次采样产出的基础 token 数
	},
	GEN: {
		base: 1,                // 基线流式输出（token/s）
	},
	STREAM: {
		// 流式输出速率 = clickPower × rate（c u13 升级解锁，c m2 升级到 ×5）
		rate1: 0.5,             // c u13「流式输出」解锁
		rate2: 2.5,             // c m2（32K 上下文）升级到
	},

	// ---- KV 缓存字节（c 层次要货币 M5）----
	KV: {
		rate: 0.1,              // 每 token/s 产出 0.1 字节/s
	},

	// ---- K1 平乘区（全部走这里；brief §4.1 的 effect-kind 计划的量级）----
	UPG: {
		c11: 2,     c12: 2,     c16: 2,     c23: 3,     c25: 3,
		p11: 2,     p15: 2,     p24: 3,
		a11: 2,     a15: 3,     a23: 2,
		d11: 2,     d15: 2,     d24: 4,
		f11: 2,     f15: 2,     f24: 5,
		tr11: 3,    tr16: 2,    tr24: 3,    tr31: 5,
		dep11: 2,   dep15: 2,   dep23: 2,
		em11: 3,    em15: 3,    em24: 10,
		agi11: 10,  agi14: 5,   agi21: 10,  agi23: 5,
	},

	// ---- 自指升级指数（每层至多 1 个，pow ≤ 0.5，softcap 保护）----
	SELF: {
		c15: 0.4,   p12: 0.35,  a12: 0.35,  d12: 0.3,
		tr21: 0.3,  dep12: 0.3, em12: 0.3,  agi12: 0.25,
	},

	// ---- K3 跨资源形状指数（log/pow 形态，次线性豁免）----
	SHAPE: {
		c13: 1.5,   c22: 1.2,   c24: 1.3,
		p13: 1.1,   p16: 1.4,   p23: 1.0,
		a13: 1.2,   a16: 1.5,   a24: 1.2,
		d13: 1.6,   d16: 1.4,   d23: 1.2,
		f12: 0.5,   f13: 1.3,   f16: 1.0,   f23: 1.1,
		tr12: 1.6,  tr13: 1.1,  tr23: 1.5,
		dep13: 1.6, dep16: 1.4, dep24: 1.5,
		em13: 1.5,  em16: 1.5,  em23: 1.3,
		agi13: 1.2, agi22: 0.5,
	},

	// ---- K4 命名机制强化指数（^1.0x 区间）----
	META: {
		p14: 1.1,   a14: 1.15,  d14: 1.1,   tr14: 1.15,
		dep14: 1.05, em14: 1.15,
	},

	// ---- K5 可见 softcap（balance-defaults: power 0.1–0.4，cap 抬升 ×10 永不 ×1000）----
	CAPS: {
		c:      { start: "1e9",   power: 0.4, raise: 10 },
		d:      { start: "1e12",  power: 0.3, raise: 10 },
		em:     { start: "1e15",  power: 0.3, raise: 10 },
	},

	// ---- 层 effect（P10 网）的形状指数 ----
	EFF: {
		cToken: 1.8,
		pToken: 1.1,  pC: 0.9,
		aToken: 1.0,  aP: 0.8,  aC: 0.6,
		dToken: 0.9,  dP: 0.7,  dA: 0.7,
		fToken: 0.5,  fD: 0.55, fA: 0.4,
		trToken: 1.1, trD: 0.9, trF: 0.7,
		depToken: 0.9, depTr: 0.7,
		emToken: 1.0, emTr: 0.8,
		agiToken: 0.9, agiTr: 0.6,
	},

	// ---- tr 训练层（custom，scaling law：gain = (d×f/div)^exp × pre）----
	TR: {
		div: 20,               // d×f 需 ≥ div×10 才有意义的起点
		exp: 0.6,
		root1: "1e10",          // 第一阶 re-root（u15 抬升到 root1u）
		root1u: "1e12",
		root2: "1e30",
		epochNeed: 60,          // epoch 收敛条：基础 60 秒一轮
		epochMult: 0.02,        // 每 epoch +2% tr gain
	},

	// ---- agi 终局层（custom）----
	AGI: {
		req: "1e5",             // 首个 AGI 点所需涌现
		gainExp: 0.6,
		nextPow: 1.4,           // getNextAt = req × (points+1)^nextPow（u24 再 ×0.5）
		win: 1024,              // 1024 程序员节 —— isEndgame()
	},

	// ---- 里程碑平乘奖励（K1 档，全部表驱动；键 = 层 + 里程碑号）----
	MS: {
		c1: 3,      c3: 2,      c5: 5,      // c m1 token×3 / m3 ctx×2 / m5 token×5
		p0: 2,      p2: 2,      p3: 2,      p4: 3,
		a2: 2,      a3: 2,      a4: 3,
		d2: 2,      d3: 3,      d4: 3,
		f2: 3,      f3: 2,
		tr2: 3,     tr4: 3,     tr6: 2,     tr7: 10,
		dep0: 2,    dep1: 2,    dep3: 3,
		em1: 5,     em4: 5,     em5: 10,
		agi0: 10,   agi1: 3,
	},

	// ---- 挑战（M1，canComplete 方言，completionLimit 2）----
	CHAL: {
		nerf11: 0.01,           // 过拟合：token 产出 ×0.01
		nerf13: 0.5,            // 梯度消失：c gainExp ×0.5
		nerf14: 0.1,            // 灾难性遗忘：p gainMult ×0.1
		goal11: ["1e5", "1e6"],       // 过拟合目标（第1/2次完成）
		goal12: [1e3, 1e4],           // 模式崩溃目标
		goal13: [32768, "3e5"],       // 梯度消失目标
		goal14: [2500, 25000],        // 遗忘目标
		rw11: 2,  rw12: 3,  rw13: 2,  rw14: 2,   // 每次完成的奖励倍率底数
	},

	// ---- 成就平乘奖励（bench，getPointGen 读取）----
	ACH: {
		mults: { 12: 1.5, 16: 2, 22: 1.5, 27: 2, 34: 2, 37: 3, 44: 2, 47: 5, 48: 10 },
	},

	// ---- 自动化里程碑阈值（最终接线见 brief §6，全部 best 门）----
	AUTO: {
		c0: 1024,       // c m0  1024      keep c upgrades
		c1: 4096,       // c m1  4K        token ×3
		p1: 50,         // p m1  50        resetsNothing(c)+autoPrestige(c)
		a1: 2500,       // a m1  2500      autoUpgrade(c)
		c2: 32768,      // c m2  32K       流式速率 ×5
		d1: 50,         // d m1  50        autoUpgrade(p)（d m0 已授 p 声望包）
		f1: 5,          // f m1  5 卡      resetsNothing(a)+autoPrestige(a)（与 a m0 并联）
		f2: 10,         // f m2  10 卡     token ×3
		tr3: 1000,      // tr m3 1000      a/d/f 三层 package
		em3: 1e5,       // em m3 1e5       tr/dep/em 终局 package
	},

	// ---- 阶梯节奏（brief §18：ROW_RATIO ×25 ÷ OUTPUT_STEP ≈ ×1.39/行）----
	ROW: {
		ratio: 25,              // 相邻行 requires 步进
		outputStep: 18,         // 每行产出步进（乘区设计对齐它）
	},
}

// 成就奖励的显示聚合（bench 用）
function achMultTotal() {
	let m = new Decimal(1)
	for (const id in TUNING.ACH.mults) {
		if (hasAchievement("bench", Number(id))) m = m.times(TUNING.ACH.mults[id])
	}
	return m
}

// ============================================================================
// 共享显示助手（替代引擎英文 main-display / resource-display —— T2 必需，
// handbook 07 Part F7）。每层定义 resZh/resEn/baseZh/baseEn 字段供这里读取。
// ============================================================================

// 主货币行：你有 <big> X </big> 上下文
function mainLineFn(id) {
	return function() {
		const col = "#D02700"
		const nm = L(layers[id].resZh, layers[id].resEn)
		return L("你有 ", "You have ") +
			"<h2 style='color:" + col + ";display:inline;margin:2px 0;font-family:\"IBM Plex Mono\",monospace'>" +
			formatWhole(player[id].points) + "</h2> " + nm
	}
}

// 历史最高行：历史最高 X ｜累计 Y
function bestLineFn(id) {
	return function() {
		let s = L("历史最高 ", "Best: ") + "<b>" + formatWhole(player[id].best) + "</b>"
		if (player[id].total) s += L("　累计 ", " · Total: ") + formatWhole(player[id].total)
		return s
	}
}

// 基础货币行（prestige 层顶部）：当前 token / 上下文 / 参数 …
function baseLineFn(id, col) {
	return function() {
		const c = col || "#161412"
		return L("当前 ", "Current ") +
			"<b style='color:" + c + "'>" + formatWhole(tmp[id].baseAmount) + "</b> " +
			L(layers[id].baseZh, layers[id].baseEn)
	}
}

// token 经济行：你有 X token（每秒 +Y）
function tokenLineFn() {
	return function() {
		return L("你有 ", "You have ") +
			"<b style='color:#161412'>" + formatWhole(player.points) + "</b> token" +
			L("（每秒 +", " (+") + format(getPointGen()) + L("）", ")")
	}
}

// 可见 softcap 警告行（handbook 12：只有可见的 cap 才能卖抬升）
function softcapLineFn(id, capFn, col) {
	return function() {
		const cap = capFn()
		if (player[id].points.lt(cap.div(2))) return
		return L("<span style='opacity:.7'>⚠ 收益软化将于 ", "<span style='opacity:.7'>⚠ Gain softcap starts at ") +
			"<b style='color:" + col + "'>" + format(cap) + "</b>" + L(" 开始</span>", "</span>")
	}
}
