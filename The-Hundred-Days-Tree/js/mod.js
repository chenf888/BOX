// mod.js — 百日誓师 The Hundred Days Tree
// 主货币 player.points = 今日 00:00 起秒数（严格实时同步，树页 update 每帧对齐真实时钟）。
// 节奏常数全部在 js/tuning.js（游戏与模拟器共读）。

let modInfo = {
    name: "百日誓师",
    id: "the-hundred-days-tree-z8f16y",  // savefile key — set once, NEVER change
    author: "chenf888",
    pointsName: "时间",
    modFiles: [
        "tuning.js",
        "questions.js",
        "subjects0.js",
        "subjects1.js",
        "life.js",
        "row2.js",
        "gk.js",
        "side.js",
        "tree.js",
    ],

    discordName: "",
    discordLink: "",
    hidePointsDisplay: true, // 引擎 overlay-head diff（唯一引擎改动，brief §10 D-9）：时钟行即主显示
    initialStartPoints: new Decimal(0),
    offlineLimit: 1, // 时钟由真实时间驱动，离线不产生收益也不损失（D-4）
}

let VERSION = {
    num: "0.1",
    name: "百日誓师",
}

let changelog = `<h1>更新日志：</h1><br>
	<h3>v0.1 百日誓师</h3><br>
		- 严格实时时钟：游戏时间 = 你的真实时间<br>
		- 六科课程层：按时上课、签到、下课结算<br>
		- 课间真题抢答（184 题真实题库）<br>
		- 作息精力 / 限时训练 / 错题本 / 晚修押题<br>
		- 第 100 天：走进考场`

let winText = `六月的考场上，你放下了笔。<br>一百个日夜，一步没有少走。<br>——百日无悔。`

var doNotCallTheseFunctionsEveryTick = []

function getStartPoints() {
    return new Decimal(modInfo.initialStartPoints)
}

// 时钟不由 gain 驱动：树页 update() 直接把 player.points 对齐真实时钟（N-POINTSWRITE 书面接受，brief §9.1）
function canGenPoints() {
    return false
}

function getPointGen() {
    return new Decimal(0)
}

// 非层全局存档字段（全为可 JSON 序列化的原始值）
function addedPlayerData() {
    return {
        oathDay0: 0,        // 誓师日 00:00 的时间戳（ms）；0 = 未初始化
        energy: 100,        // 精力（全局，OQ-3）
        rested: 0,          // 今日作息恢复累计（就寝结算元气用）
        lastSignDay: -1,    // 上次签到的天
        lastSignPeriod: "", // 上次签到的时段 id
        signToday: 0,       // 今日签到数
        totalSigned: 0,     // 累计签到数
        totalAnswered: 0,   // 累计答题数
        totalCorrect: 0,    // 累计答对数
        correctToday: 0,    // 今日答对数
        sleepToday: false,  // 今日是否已就寝结算
        lastRollover: 0,    // 上次日切换的天数
        autoSleepNow: false,// 日切换时请求自动就寝（life 层消费）
        wrongPool: 0,       // 错题池（全局；错题层解锁前也积累）
        wrongLog: [],       // 错题记录 "subj:idx"（上限 40）
    }
}

var displayThings = [
    function () {
        var line = "<b style='font-size:1.6em'>" + clockString() + "</b>"
        var p = currentPeriod()
        line += "　" + p.name
        return line
    },
    function () {
        if (isGaokaoDay()) return "<b style='color:#fcc419'>今天是高考日——十年磨一剑，今朝试锋芒！</b>"
        return "第 " + gameDay() + " 天 · 距高考还有 <b>" + countdownDays() + "</b> 天"
    },
    function () {
        var p = currentPeriod()
        if (isGaokaoDay()) return ""
        if (p.sign && !isSignedNow()) return "<span style='color:#ff6b6b'>缺席听课中 ×" + absentFloor() + " —— 打开当前科目页签到可恢复全效率</span>"
        if (player.energy < energyLowLine()) return "<span style='color:#e8590c'>好困……精力不足，专注效率 ×" + energyFactor() + "（快去吃饭/午休）</span>"
        return ""
    },
]

// 终局：完成「走进考场」（M19 消耗式重置）
function isEndgame() {
    return !!(player.gk && player.gk.examDone)
}

var backgroundStyle = {}

function maxTickLength() {
    return 3600
}

function fixOldSave(oldVersion) {
}
