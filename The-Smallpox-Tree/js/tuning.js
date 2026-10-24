// ============================================================================
// 天花树 The Smallpox Tree — 节奏常数唯一居所 (design brief §7/§10 偏离7)
// 本文件被游戏与 tools/simulate.js 同时读取：改这里的数字，两边同步生效。
// 任何节奏量都不允许以字面量形式内联进层文件 (07 Part F / 14 §3.3)。
// ============================================================================
var TUNING = {
	// ---- 行节奏 (brief §7, 自检 18) ----
	ROW_RATIO: 25,        // requires 阶梯每行 ×25 (P2 中位带)
	OUTPUT_STEP: 18,      // 每行累计产出乘区 ×18 → 每行时间 ×1.39 (11 §4.1 目标带 1.1–1.6)

	// ---- 基础经济 ----
	BASE_CASE_GAIN: 1,            // 起源期病例/秒
	FIRST_UPG_COST: 1,            // 首升级 ≤10s (作者节奏 #2)

	// ---- 反弹压强 (Q4b 用户定义机制, brief §3) ----
	PRESSURE_RATE: 0.05,          // 压强 %/秒 基线（不受控时 33 分钟满值）
	PRESSURE_RATE_UPG: 0.5,       // 每项减速升级的乘数
	PRESSURE_CC_FACTOR: 0.05,     // 每冷链节点对增速的递减
	PRESSURE_LOW: 30,             // >30%：得病率开始上升 (用户原话机制)
	PRESSURE_HIGH: 70,            // >70%：接种行动迟滞 ×0.5
	PRESSURE_CAP: 100,            // 硬上限
	PRESSURE_UPG_DIVISOR: 50,     // "以史为鉴"：每 50% 峰值 → 围堵成本减半一档
	BOUNTY_RATE: 0.1,             // 监测奖励金/秒 × 围堵行动数

	// ---- 覆盖率 (Q3 硬上限 100%) ----
	COVERAGE_CAP: 100,
	COVERAGE_SLOPE: 10,           // 覆盖率% = 10 × log10(免疫公民) × 斜率升级
	COVERAGE_SLOPE_UPG: 1.25,     // K5 斜率提升（上限可见，作者 #12 规则）

	// ---- 零病例监测期 ----
	ZERO_TIME_GOAL: 600,
	LAUNCH_ZERO_BASE: 600,   // 第 n 发要求累计零病例监测 ≥ BASE*(n+1)+STEP*n(n+1)/2 秒
	LAUNCH_ZERO_STEP: 300,
	LAUNCH_PRESSURE_LIMIT: 1,     // 发射瞬间压强须 ≤ 此值（0-100 标尺）
	ZERO_TIME_PRESSURE_LIMIT: 0.1, // 压强 ≤ 此值即计零病例监测时间（0-100 标尺的 0.1%）
	PRESSURE_SUPPRESS_BASE: 1,     // sur 流调专项：成本 = BASE × GROWTH^x 奖励金
	PRESSURE_SUPPRESS_GROWTH: 2,
	PRESSURE_SUPPRESS_STEP: 1.25,  // 每级压强回升 ÷STEP          // 压强=0 累计 600 秒 ≈ "连续两年" 游戏叙事

	// ---- M19 认证发射 (cert 层)：第 n 枚印章的逐项消耗 ----
	LAUNCH_DOSES: 1e7,
	LAUNCH_DOSES_GROWTH: 12,            // ×10^(n-1)（Stage-6 实测下调，见 brief §11）
	LAUNCH_FUNDS: 1e5,
	LAUNCH_FUNDS_GROWTH: 6,            // ×10^(n-1)（Stage-6 实测下调）
	LAUNCH_SWEEPS: 10,            // +(n-1)*5（线性：静态地板按 ×2 增长，指数价位会不可达, F14/F15 教训）
	LAUNCH_SWEEP_STEP: 5,
	LAUNCH_CMP_REQ: 50,           // 首次发射所需战役进度
	LAUNCH_CMP_GROWTH: 2.5,         // 战役进度需求每印章 ×2（×10 不可达——战役进度产量跟不上, Stage-6 实测修正）
	LAUNCH_SEALS: 9,              // 终局印章数（isEndgame = 第 9 枚里程碑 = 1979-10-25）

	// ---- 里程碑阈值表（F14: 一律表驱动，禁爆炸公式） ----
	VAR_MS: [50, 500, 5000, 5e4, 5e5],
	VAC_MS: [500, 1000, 2000, 1e4, 5e4, 2.5e5],
	PRO_MS: [2000, 1e4, 5e4, 2.5e5, 1e6],
	KNW_MS: [100, 500, 2500, 1.25e4, 6e4, 3e5],
	INT_MS: [500, 2500, 1e4, 5e4, 2.5e5, 1.25e6],
	SUR_MS: [5, 15, 40, 100, 250, 600],
	CC_MS: [5, 15, 40, 100, 250],
	MOB_MS: [3, 10, 30, 80, 200],
	CMP_MS: [10, 25, 60, 150, 400, 1000, 2500, 6000, 1.5e4, 4e4, 1e5, 2.5e5],

	// ---- 层解锁阈值（N-UNLOCKPAYGATE: 一律阈值门，无付费门） ----
	UNLOCK_VAC: 100,       // var.best 接种者
	UNLOCK_PRO: 200,
	UNLOCK_KNW: 300,
	UNLOCK_INT: 400,
	UNLOCK_SUR: 5000,      // var.best（监测网建立在接种者之上）
	UNLOCK_CC: 200,        // pro.best 剂量
	UNLOCK_MOB: 500,       // vac.best 免疫公民
	UNLOCK_CMP: 5,         // 三静态各 ≥5 (sur/cc/mob best)
	UNLOCK_CERT_MS: 5,     // cmp m5（索马里最后一例）后认证开始
}

// 全局便捷（层文件与模拟器共用）
function T(key) { return TUNING[key] }

// T2 双语助手（P17）：window.chinesemode 三元
function zh(en, cn) { return window.chinesemode ? cn : en }
