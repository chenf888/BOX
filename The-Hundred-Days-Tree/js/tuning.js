// tuning.js — 百日誓师 · 全游戏节奏常数的唯一之家（设计文档 §9 自检21：游戏与模拟器共读）
// 时钟架构：player.points = 今日 00:00 起的秒数（严格实时同步，见 mod.js / 树页 update）。
// 测试钩子：window.__FAKETIME 可覆写 TMT_NOW()（仅测试用；模拟器以 TMT_NOW 注入虚拟时钟）。

var TUNING = {
    // ---- 时间与日程 ----
    GAME_DAYS: 100,            // 百日；第 GAME_DAYS 天为高考日
    CLASS_MIN: 40,             // 一节课分钟数

    // ---- 专注（att）积累 ----
    ATT_RATE: 1,               // 满勤上课每秒专注
    ATT_READ_FACTOR: 0.5,      // 早读对 chi/eng 各自的系数
    ATT_EVE_FACTOR: 0.8,       // 晚修系数
    ATT_SIGNED: 1.0,           // 已签到（OQ-1：手勤最优）
    ATT_ABSENT: 0.3,           // 缺席底效率（OQ-2：×0.3 补结语义在积累端生效）
    ATT_ABSENT_M1: 0.5,        // eve 里程碑 m1 后的缺席底效率

    // ---- 精力（energy，全局 player.energy） ----
    ENERGY_MAX: 100,
    ENERGY_DRAIN_CLASS: 0.004, // 上课/晚修/早读每秒消耗（40min ≈ 9.6）
    ENERGY_REGEN_NIGHT: 0.004, // 夜间回复
    ENERGY_LOW: 40,            // OQ-3：低于此线犯困
    ENERGY_LOW_MULT: 0.5,
    ACT_ENERGY: { exercise: 10, breakfast: 15, lunch: 15, nap: 30, dinner: 15 },

    // ---- 下课结算（科目 prestige）----
    SETTLE_DIV: 60,
    SETTLE_COOLDOWN: 60,      // 结算冷却秒（防热键连发绕过 pow<1 的凹性刷分）
    SETTLE_POW: 0.7,           // gain = (att/60)^0.7 × 乘区

    // ---- 熟练度（答题积累）----
    MAST_PTS_PER_LEVEL: 15,
    MAST_MAX_LEVEL: 15,
    MAST_CAP_START_BASE: 120,  // 分数软帽起点
    MAST_CAP_START_PER_LEVEL: 2,
    MAST_SETTLE_PER_LEVEL: 0.02,

    // ---- 分数派生（掌握 → 分数）----
    SCORE_RAW_MULT: 60,
    SCORE_RAW_DIV: 2,
    SCORE_SOFTCAP_POW: 0.4,
    SCORE_CAP: 150,            // 单科满分（理综按 2/3 折入总分：450 → 300，总分 750 = 真实高考结构）
    SCORE_TOTAL_CAP: 750,

    // ---- 课间抢答（题库）----
    QUIZ_ATT: 30,              // 答对得该科专注
    QUIZ_MAST: [1, 2, 3],      // 难度 1/2/3 的熟练度点
    QUIZ_WRONG: 1,             // 答错入错题池

    // ---- 错题 ----
    WRONG_PROC_TIME: 30,       // 晚修四每 30s 消化一道
    WRONG_MAST: 2,             // 消化一道的熟练度

    // ---- 作息（life）----
    VIGOUR_DIV: 50,
    VIGOUR_POW: 0.8,
    VIGOUR_BASE: 2,
    VIGOUR_MANUAL: 1.2,        // 手动就寝加成
    VIGOUR_NIGHT_AUTO: 1.0,    // 5:40 自动就寝

    // ---- 晚修（static 楼层）----
    EVE_REQ: 3000,
    EVE_BASE: 2,

    // ---- 押题抽卡（M13）----
    YZ_POOL: 6,                // 6 科 buff
    YZ_DUDS: 2,                // 押偏（空券）
    YZ_MULT: 2,

    // ---- 限时训练（挑战）----
    TRAIN_RATE: 0.02,          // 挑战内每秒得分
    TRAIN_WINDOW: 2,           // 16:30-17:10 窗口倍率
    TRAIN_GOAL: 100,

    // ---- 高考（gk）----
    GK_MOCK_RATE: 0.001,       // 模考积分/秒 = 总分 × 0.001
}

// ===================== 课表（用户提供的真实时间表） =====================
// s/e = 自午夜起分钟；kind: night/life/class/break/train/eve
// sign: 需签到；subj: 专注流向科目；act: 作息活动；quiz: 课间抢答科目（sci=理综随机, any=六科随机）
var PERIODS = [
    { id: "sleep1", s: 0, e: 340, name: "夜深了，睡梦中……", kind: "night" },
    { id: "wake", s: 340, e: 350, name: "起床洗漱", kind: "life" },
    { id: "exercise", s: 350, e: 370, name: "早操/跑操", kind: "life", act: "exercise" },
    { id: "mread", s: 370, e: 410, name: "早读", kind: "class", sign: true, subj: ["chi", "eng"] },
    { id: "breakfast", s: 410, e: 435, name: "早餐", kind: "life", act: "breakfast" },
    { id: "prep1", s: 435, e: 450, name: "课前准备", kind: "life" },
    { id: "p1", s: 450, e: 490, name: "第一节·语文", kind: "class", sign: true, subj: ["chi"] },
    { id: "b1", s: 490, e: 500, name: "课间", kind: "break", quiz: "mat" },
    { id: "p2", s: 500, e: 540, name: "第二节·数学", kind: "class", sign: true, subj: ["mat"] },
    { id: "bigbreak", s: 540, e: 565, name: "大课间", kind: "break", quiz: "mat" },
    { id: "p3", s: 565, e: 605, name: "第三节·英语", kind: "class", sign: true, subj: ["eng"] },
    { id: "b3", s: 605, e: 615, name: "课间", kind: "break", quiz: "eng" },
    { id: "p4", s: 615, e: 655, name: "第四节·物理", kind: "class", sign: true, subj: ["phy"] },
    { id: "b4", s: 655, e: 665, name: "课间", kind: "break", quiz: "phy" },
    { id: "p5", s: 665, e: 705, name: "第五节·化学", kind: "class", sign: true, subj: ["chem"] },
    { id: "lunch", s: 705, e: 740, name: "午餐", kind: "life", act: "lunch", quiz: "chem" },
    { id: "noonquiz", s: 740, e: 760, name: "午间小练", kind: "break", quiz: "chem" },
    { id: "nap", s: 760, e: 820, name: "午休", kind: "life", act: "nap" },
    { id: "prep2", s: 820, e: 840, name: "起床整理", kind: "life" },
    { id: "p6", s: 840, e: 880, name: "第六节·生物", kind: "class", sign: true, subj: ["bio"] },
    { id: "b6", s: 880, e: 890, name: "课间", kind: "break", quiz: "bio" },
    { id: "p7", s: 890, e: 930, name: "第七节·数学", kind: "class", sign: true, subj: ["mat"] },
    { id: "b7", s: 930, e: 940, name: "课间", kind: "break", quiz: "mat" },
    { id: "p8", s: 940, e: 980, name: "第八节·物理", kind: "class", sign: true, subj: ["phy"] },
    { id: "b8", s: 980, e: 990, name: "课间", kind: "break", quiz: "phy" },
    { id: "train", s: 990, e: 1030, name: "限时训练", kind: "train" },
    { id: "dinner", s: 1030, e: 1070, name: "晚餐/自由活动", kind: "life", act: "dinner", quiz: "any" },
    { id: "prep3", s: 1070, e: 1095, name: "晚修前准备", kind: "life" },
    { id: "e1", s: 1095, e: 1145, name: "晚修一·数学", kind: "eve", sign: true, subj: ["mat"] },
    { id: "be1", s: 1145, e: 1155, name: "课间", kind: "break", quiz: "mat" },
    { id: "e2", s: 1155, e: 1205, name: "晚修二·英语", kind: "eve", sign: true, subj: ["eng"] },
    { id: "be2", s: 1205, e: 1215, name: "课间", kind: "break", quiz: "eng" },
    { id: "e3", s: 1215, e: 1265, name: "晚修三·理综", kind: "eve", sign: true, subj: ["phy", "chem", "bio"] },
    { id: "be3", s: 1265, e: 1275, name: "课间", kind: "break", quiz: "sci" },
    { id: "e4", s: 1275, e: 1340, name: "晚修四·错题整理/答疑", kind: "eve", sign: true, subj: ["wrong"] },
    { id: "night", s: 1340, e: 1440, name: "晚修结束·就寝时间", kind: "night" },
]

var SUBJECTS = ["chi", "mat", "eng", "phy", "chem", "bio"]
var SUBJ_NAMES = { chi: "语文", mat: "数学", eng: "英语", phy: "物理", chem: "化学", bio: "生物" }
// 各科首课分钟（解锁门槛）
var SUBJ_FIRST_CLASS = { chi: 450, mat: 500, eng: 565, phy: 615, chem: 665, bio: 840 }

// ===================== 时钟助手 =====================
function TMT_NOW() {
    // 测试钩子：window.__FAKETIME（毫秒时间戳）覆写真实时钟；模拟器同样经此注入虚拟时钟
    if (typeof window !== "undefined" && window.__FAKETIME) return window.__FAKETIME
    return Date.now()
}

function dayStartStamp() {
    var d = new Date(TMT_NOW())
    d.setHours(0, 0, 0, 0)
    return d.getTime()
}

function minutesToday() {
    var d = new Date(TMT_NOW())
    return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60
}

function clockString() {
    var d = new Date(TMT_NOW())
    var p = function (n) { return (n < 10 ? "0" : "") + n }
    return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds())
}

// 誓师日（第1天）的 00:00 时间戳；oath 层 update 首次写入
function gameDay0() {
    if (!player.oathDay0) return 0
    return Math.max(0, Math.floor((dayStartStamp() - player.oathDay0) / 86400000))
}
function gameDay() { return gameDay0() + 1 }                    // 第 X 天（1 起）
function countdownDays() { return Math.max(0, TUNING.GAME_DAYS - gameDay0()) } // 誓师日=100
function isGaokaoDay() { return gameDay0() >= TUNING.GAME_DAYS - 1 }

function currentPeriod() {
    var m = minutesToday()
    for (var i = 0; i < PERIODS.length; i++) {
        if (m >= PERIODS[i].s && m < PERIODS[i].e) return PERIODS[i]
    }
    return PERIODS[0]
}

// ===================== 状态助手 =====================
// 跨层存在性守卫（增量构建期层文件可能尚未加载；P64/D-TMPPOINTS 同类风险前置掐灭）
function safeMilestone(l, id) { return !!(layers[l] && player[l] && hasMilestone(l, id)) }
function safeUpgrade(l, id) { return !!(layers[l] && player[l] && hasUpgrade(l, id)) }
function safeChallenge(l, id) { return !!(layers[l] && player[l] && hasChallenge(l, id)) }

// 当前时段是否已签到
function isSignedNow() {
    var p = currentPeriod()
    if (!p.sign) return true
    return player.lastSignDay === gameDay0() && player.lastSignPeriod === p.id
}

// 签到（由树页「签到」clickable 调用）
function doSignIn() {
    var p = currentPeriod()
    if (!p.sign || isSignedNow()) return
    player.lastSignDay = gameDay0()
    player.lastSignPeriod = p.id
    player.totalSigned = (player.totalSigned || 0) + 1
    player.signToday = (player.signToday || 0) + 1
}

// 精力系数与犯困线的实现在 life.js（单一之家；此处不再重复定义）

// 熟练度等级
function masteryLevel(id) {
    var m = player[id] && player[id].mastery ? player[id].mastery : 0
    var cap = TUNING.MAST_MAX_LEVEL + (safeUpgrade("gk", 42) ? 5 : 0) // 熟练度大师
    return Math.min(cap, Math.floor(m / TUNING.MAST_PTS_PER_LEVEL))
}

// 分数派生：掌握 → 分数（软帽起点随熟练度推迟，硬帽 150；引擎标准 softcap 形式，power 0.4）
// 返回普通数值（0–150），Decimal 运算全程走方法
function subjectScore(id) {
    var P = player[id] ? player[id].points : new Decimal(0)
    var raw = P.div(TUNING.SCORE_RAW_DIV).add(1).log10().times(TUNING.SCORE_RAW_MULT).toNumber()
    var capBase = TUNING.MAST_CAP_START_BASE + (safeUpgrade("gk", 41) ? 3 : 0) // 题型套路大全
    var start = Math.min(TUNING.SCORE_CAP, capBase + TUNING.MAST_CAP_START_PER_LEVEL * masteryLevel(id))
    if (raw > start && start < TUNING.SCORE_CAP) {
        raw = softcap(new Decimal(raw), new Decimal(start), TUNING.SCORE_SOFTCAP_POW).toNumber()
    }
    return Math.min(raw, TUNING.SCORE_CAP)
}
function totalScore() {
    // 理综三科按 2/3 折算（450 满分 → 300），对齐真实高考总分结构：150×3 + 300 = 750
    var t = 0
    for (var i = 0; i < SUBJECTS.length; i++) {
        var s = subjectScore(SUBJECTS[i])
        var sci = SUBJECTS[i] === "phy" || SUBJECTS[i] === "chem" || SUBJECTS[i] === "bio"
        t += sci ? s * 2 / 3 : s
    }
    return Math.min(t, TUNING.SCORE_TOTAL_CAP)
}

// 押题 buff（M13 buff bus，eve.startData 声明 yzBuff/yzVal）
function yzIndex(subj) { return SUBJECTS.indexOf(subj) }
function yzBuffOn(subj) {
    return !!(player.eve && player.eve.yzBuff && player.eve.yzBuff[yzIndex(subj)])
}

// 科目专注积累倍率（除签到/精力外的基础乘区，由各层升级与跨层接线填充；此处只算全局项）
function globalAttMult(subj) {
    var m = 1
    if (safeMilestone("life", 1)) m = m * 1.1                                  // 作息 m1
    for (var i = 0; i < SUBJECTS.length; i++) {
        if (safeMilestone(SUBJECTS[i], 3)) m = m * 1.02                        // 各科 m3 全局小加成
    }
    if (safeChallenge("train", 11)) m = m * 1.05                               // 挑战奖励
    if (yzBuffOn(subj)) m = m * (player.eve && player.eve.yzVal ? player.eve.yzVal[yzIndex(subj)].toNumber() : TUNING.YZ_MULT) // 押题命中该科（强度随 eve m6 成长）
    if (safeMilestone("eve", 7)) m = m * 1.05                                  // 深夜学霸
    for (var s = 0; s < SUBJECTS.length; s++) {
        if (safeUpgrade(SUBJECTS[s], 25)) m = m * 1.05                         // 课代表（各科 K7 全局）
    }
    if (player.life && getBuyableAmount("life", 11).gt(0))
        m = m * (1 + 0.02 * getBuyableAmount("life", 11).toNumber())           // 营养品（跨层消费者）
    if (player.life && getBuyableAmount("life", 12).gt(0) && (currentPeriod().id === "mread" || currentPeriod().id === "p1"))
        m = m * (1 + 0.04 * getBuyableAmount("life", 12).toNumber())           // 闹钟（早读/第一节）
    if (safeMilestone("gk", 2)) m = m * 1.02                        // 模考 450
    if (safeMilestone("gk", 6)) m = m * 1.03                        // 模考 650
    if (safeMilestone("gk", 8)) m = m * 1.05                        // 模考 720
    return m
}

// 缺席底效率（eve m1 提升）
function absentFloor() {
    return safeMilestone("eve", 1) ? TUNING.ATT_ABSENT_M1 : TUNING.ATT_ABSENT
}

// ===================== 六科共享乘区（升级语义六科同构：11预习 12笔记 13跨界 14语感(K4) 21条件 22帽延(K5) 24专注 25课代表(全局)） =====================
var SUBJ_COND_PERIODS = {
    chi: ["mread", "e4"], mat: ["p2", "e1"], eng: ["mread", "e2"],
    phy: ["p4", "p8"], chem: ["p5", "e3"], bio: ["p6", "e3"],
}

// 当前时段是否给该科供专注（自动结算的判定：不再供课 → 下课自动结算）
function periodFeeds(id) {
    var p = currentPeriod()
    return !!(p.subj && p.subj.indexOf(id) >= 0)
}

// 结算乘区（Decimal）
// 模考商店结算加成（gk 升级效果 15/31–35 的唯一消费点，效果定义在 gk.js）
function gkSettleMult(id) {
    var m = new Decimal(1)
    if (safeUpgrade("gk", 15)) m = m.times(upgradeEffect("gk", 15)) // 考点归纳
    if (id === "chi" && safeUpgrade("gk", 31)) m = m.times(upgradeEffect("gk", 31)) // 语文专题
    if (id === "mat" && safeUpgrade("gk", 32)) m = m.times(upgradeEffect("gk", 32)) // 数学专题
    if (id === "eng" && safeUpgrade("gk", 33)) m = m.times(upgradeEffect("gk", 33)) // 英语专题
    if ((id === "phy" || id === "chem" || id === "bio") && safeUpgrade("gk", 34)) m = m.times(upgradeEffect("gk", 34)) // 理综合练
    if (safeUpgrade("gk", 35)) m = m.times(upgradeEffect("gk", 35)) // 全科冲刺
    return m
}
// 睡眠质量（gk 升级效果 44 的唯一消费点，供 life.vigourMult）
function gkVigourMult() {
    return safeUpgrade("gk", 44) ? upgradeEffect("gk", 44) : new Decimal(1)
}

function subjectSettleMult(id) {
    var m = new Decimal(1)
    var mast = new Decimal(1 + TUNING.MAST_SETTLE_PER_LEVEL * masteryLevel(id))
    if (safeUpgrade(id, 14)) mast = mast.pow(1.1)                   // K4：熟练度加成强化（具名机制）
    m = m.times(mast)
    if (safeUpgrade(id, 12)) m = m.times(1.3)                       // K1：课堂笔记
    if (safeUpgrade(id, 13)) m = m.times(upgradeEffect(id, 13))     // K3：跨科（各科源不同，效果在各自层内）
    if (safeMilestone(id, 0)) m = m.times(1.5)                      // 里程碑 m0
    if (id === "mat" && safeChallenge("train", 12)) m = m.times(1.15)   // 挑战奖励：数学限时测
    if (id === "eng" && safeChallenge("train", 13)) m = m.times(1.15)   // 挑战奖励：英语限时测
    if ((id === "phy" || id === "chem" || id === "bio") && safeChallenge("train", 21)) m = m.times(1.1) // 理综模拟
    if (safeUpgrade("train", 13)) m = m.times(1.05)                 // 模考 nerves（train 升级）
    if (safeUpgrade("wrong", 21)) m = m.times(1.05)                 // 考前错题复盘（wrong 升级）
    if (safeMilestone("wrong", 2)) m = m * 1.03                     // 错题本 m2
    m = m.times(gkSettleMult(id))                                   // 模考商店结算加成（gk.js 单点定义）
    if (safeMilestone("gk", 4)) m = m.times(1.02)                   // 模考 550
    if (safeMilestone("gk", 7)) m = m.times(1.03)                   // 模考 700
    return m
}

// 积累乘区（纯数值，用于 rate 数乘）
function subjectAccrualMult(id) {
    var m = 1
    var p = currentPeriod()
    if (safeUpgrade(id, 11)) m *= 1.3                               // K1：预习
    if (safeUpgrade(id, 21) && SUBJ_COND_PERIODS[id].indexOf(p.id) >= 0) m *= 1.5 // K6：条件时段
    if (safeUpgrade(id, 24)) m *= 1.8                               // K1：大专注
    if (safeMilestone(id, 1)) m *= 1.3                              // 里程碑 m1
    if (getBuyableAmount(id, 11).gt(0)) m *= Math.pow(1.15, getBuyableAmount(id, 11).toNumber()) // 教辅 buyable
    m *= globalAttMult(id)
    return m
}
