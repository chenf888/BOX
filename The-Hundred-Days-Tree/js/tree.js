// tree.js — 百日誓师 · 树页 = 课桌：时钟（mod.js displayThings）+ 签到 + 课间抢答 + 树
var layoutInfo = {
    startTab: "none",
    startNavTab: "tree-tab",
    showTree: true,

    treeLayout: ""
}

// A "ghost" layer which offsets other layers in the tree
addNode("blank", {
    layerShown: "ghost",
},)

// 当前抢答窗口键（天|时段）
function quizKeyNow() {
    return gameDay0() + "|" + currentPeriod().id
}

function quizDrawSubject(quiz) {
    if (quiz === "sci") return ["phy", "chem", "bio"][Math.floor(Math.random() * 3)]
    if (quiz === "any") return SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)]
    return quiz
}

// ---- 课间抢答的四个选项（全内联，供检查器审读；n = 0..3）----
function quizOptDisplay(n) {
    var t = player["tree-tab"]
    if (isGaokaoDay() || !currentPeriod().quiz || t.qKey !== quizKeyNow() || t.qIdx < 0) return "—"
    var q = QUESTIONS[t.qSubj][t.qIdx]
    var mark = t.qDone ? (n === q.a ? " ✔" : (t.qPicked === n ? " ✘" : "")) : ""
    return String.fromCharCode(65 + n) + ". " + q.o[n] + mark
}
function quizOptCanClick(n) {
    var t = player["tree-tab"]
    return !isGaokaoDay() && !!currentPeriod().quiz && t.qKey === quizKeyNow() && t.qIdx >= 0 && !t.qDone
}
function quizOptClick(n) {
    var t = player["tree-tab"]
    if (t.qDone || t.qKey !== quizKeyNow() || t.qIdx < 0) return
    var q = QUESTIONS[t.qSubj][t.qIdx]
    t.qPicked = n
    t.qDone = true
    player.totalAnswered = (player.totalAnswered || 0) + 1
    var ok = n === q.a
    if (ok) {
        player.totalCorrect = (player.totalCorrect || 0) + 1
        player.correctToday = (player.correctToday || 0) + 1
        if (player[t.qSubj] && player[t.qSubj].att !== undefined)
            player[t.qSubj].att = player[t.qSubj].att.add(TUNING.QUIZ_ATT * (safeUpgrade("gk", 12) ? 2 : 1)) // 考场直觉
        player[t.qSubj].mastery = (player[t.qSubj].mastery || 0) + TUNING.QUIZ_MAST[q.d - 1]
        doPopup("答对了！", q.e, "#51cf66", "#51cf66", "#51cf66")
    } else {
        player.wrongPool = (player.wrongPool || 0) + TUNING.QUIZ_WRONG
        player.wrongLog = player.wrongLog || []
        player.wrongLog.push(t.qSubj + ":" + t.qIdx)
        if (player.wrongLog.length > 40) player.wrongLog.shift()
        doPopup("答错了", "已加入错题本。正确答案：" + String.fromCharCode(65 + q.a) + ". " + q.o[q.a] + "<br>" + q.e, "#ff6b6b", "#ff6b6b", "#ff6b6b")
    }
}
function quizOptStyle(n) {
    var t = player["tree-tab"]
    var s = {}
    if (t.qKey === quizKeyNow() && t.qDone && t.qIdx >= 0) {
        var q = QUESTIONS[t.qSubj][t.qIdx]
        if (n === q.a) s = { 'background-color': '#2f4f2f' }
        else if (t.qPicked === n) s = { 'background-color': '#5c3a3a' }
    }
    s['width'] = '80px'; s['min-height'] = '80px' // 紧凑选项（覆盖 .upg 的 120px；长文本向下自然长高）
    return s
}

addLayer("tree-tab", {
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            qKey: "",      // 已抽题的窗口键
            qSubj: "",     // 解析后的科目
            qIdx: -1,      // 题目下标
            qPicked: -2,   // 玩家所选项（-2 未答）
            qDone: false,  // 本窗已答
            lastchi: -1, lastmat: -1, lasteng: -1, lastphy: -1, lastchem: -1, lastbio: -1,
        }
    },
    color: "#fcc419",
    tabFormat: [
        ["blank", "8px"],
        // ---- 签到卡 ----
        ["row", [
            ["clickable", 11],
            ["display-text", function () {
                var p = currentPeriod()
                if (isGaokaoDay()) return "<b style='color:#fcc419;font-size:1.3em'>高考日</b><br>走进考场（高考层）"
                var s = p.sign ? (isSignedNow() ? "<span style='color:#51cf66'>✔ 已签到</span>" : "<span style='color:#ff6b6b'>✘ 未签到 ×" + absentFloor() + "</span>") : "本时段无需签到"
                var e = Math.floor(player.energy || 0)
                return "<b style='font-size:1.15em'>" + p.name + "</b><br>" + s + "　精力 <b>" + e + "/" + energyMax() + "</b>"
            }],
        ]],
        ["blank", "6px"],
        // ---- 课间抢答卡 ----
        ["row", [
            ["clickable", 12],
            ["display-text", function () {
                var t = player["tree-tab"]
                var p = currentPeriod()
                if (isGaokaoDay()) return ""
                if (!p.quiz) return "<span style='opacity:.6'>上课时间不能抢答，课间再来</span>"
                if (t.qKey !== quizKeyNow()) return "<b>课间抢答</b>：点「抽题」来一道" + (p.quiz === "any" ? "随机科目" : (p.quiz === "sci" ? "理综" : SUBJ_NAMES[p.quiz])) + "题"
                if (!t.qDone) return "<b>课间抢答·" + SUBJ_NAMES[t.qSubj] + "</b>（难度" + ["", "★", "★★", "★★★"][QUESTIONS[t.qSubj][t.qIdx].d] + "）：<br>" + QUESTIONS[t.qSubj][t.qIdx].q
                var q = QUESTIONS[t.qSubj][t.qIdx]
                var ok = t.qPicked === q.a
                return "<b>" + (ok ? "<span style='color:#51cf66'>✔ 答对了！</span>" : "<span style='color:#ff6b6b'>✘ 答错了，已加入错题本</span>") + "</b><br>" + q.e
            }],
        ]],
        ["row", [
            ["clickable", 21], ["clickable", 22], ["clickable", 23], ["clickable", 24],
        ]],
        ["blank", "10px"],
        ["tree", function () { return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS) }],
    ],
    clickables: {
        11: {
            title: "签到",
            display() {
                var p = currentPeriod()
                if (isGaokaoDay()) return "高考日"
                if (!p.sign) return "无需签到"
                return isSignedNow() ? "✔ 已签到" : "📍 签到"
            },
            canClick() {
                var p = currentPeriod()
                return !isGaokaoDay() && p.sign && !isSignedNow()
            },
            onClick() {
                doSignIn()
            },
            style() {
                var s = isSignedNow() ? { 'background-color': '#2f4f2f' } : { 'background-color': '#5c3a3a' }
                s['width'] = '80px'; s['height'] = '80px'; s['min-height'] = '80px' // 紧凑按钮（覆盖 .upg 的 120px）
                return s
            },
        },
        12: {
            title: "抽题",
            display() {
                var t = player["tree-tab"]
                var p = currentPeriod()
                if (isGaokaoDay() || !p.quiz) return "—"
                if (t.qKey !== quizKeyNow()) return "🎯 抽题"
                if (!t.qDone) return "作答中……"
                return "本课间已答"
            },
            canClick() {
                var p = currentPeriod()
                return !isGaokaoDay() && !!p.quiz && typeof QUESTIONS !== "undefined" && player["tree-tab"].qKey !== quizKeyNow()
            },
            onClick() {
                var t = player["tree-tab"]
                var p = currentPeriod()
                if (typeof QUESTIONS === "undefined") return
                var subj = quizDrawSubject(p.quiz)
                var pool = QUESTIONS[subj]
                if (!pool || pool.length === 0) return
                var idx = Math.floor(Math.random() * pool.length)
                var tries = 0
                while (idx === t["last" + subj] && tries < 4) { idx = Math.floor(Math.random() * pool.length); tries++ }
                t["last" + subj] = idx
                t.qKey = quizKeyNow()
                t.qSubj = subj
                t.qIdx = idx
                t.qPicked = -2
                t.qDone = false
            },
            style() { return { 'width': '80px', 'height': '80px', 'min-height': '80px' } }, // 紧凑按钮（覆盖 .upg 的 120px）
        },
        21: {
            display() { return quizOptDisplay(0) },
            canClick() { return quizOptCanClick(0) },
            onClick() { quizOptClick(0) },
            style() { return quizOptStyle(0) },
        },
        22: {
            display() { return quizOptDisplay(1) },
            canClick() { return quizOptCanClick(1) },
            onClick() { quizOptClick(1) },
            style() { return quizOptStyle(1) },
        },
        23: {
            display() { return quizOptDisplay(2) },
            canClick() { return quizOptCanClick(2) },
            onClick() { quizOptClick(2) },
            style() { return quizOptStyle(2) },
        },
        24: {
            display() { return quizOptDisplay(3) },
            canClick() { return quizOptCanClick(3) },
            onClick() { quizOptClick(3) },
            style() { return quizOptStyle(3) },
        },
    },
    update(diff) {
        // ---- 誓师日戳（首玩日；必须在任何天数计算前落定）----
        if (!player.oathDay0) player.oathDay0 = dayStartStamp()

        // ---- 严格实时同步（N-POINTSWRITE 书面接受：points 语义 = 真实时间，幂等赋值，无生产回路）----
        var secs = Math.floor((TMT_NOW() - dayStartStamp()) / 1000)
        var target = new Decimal(secs)
        if (!player.points.eq(target)) player.points = target

        // ---- 精力流（全局 player.energy；diff 为数值，无 Decimal 运算）----
        var p = currentPeriod()
        if (p.kind === "night") {
            var regen = TUNING.ENERGY_REGEN_NIGHT * (safeUpgrade("life", 13) ? 1.5 : 1) // 舒适床品
            player.energy = Math.min(energyMax(), player.energy + regen * diff)
        } else if (p.kind === "class" || p.kind === "eve" || p.id === "mread" || p.kind === "train") {
            player.energy = Math.max(0, player.energy - TUNING.ENERGY_DRAIN_CLASS * (safeUpgrade("gk", 43) ? 0.75 : 1) * diff) // 劳逸结合
        }

        // ---- 日切换（5:40 起床翻日；就寝结算由 life 层读取 autoSleepNow 自行执行，避免 update 内重入 doReset）----
        var gd = gameDay0()
        if (gd > (player.lastRollover || 0)) {
            player.lastRollover = gd
            player.signToday = 0
            player.correctToday = 0
            player.sleepToday = false
            player.rested = 0
            if (player.life && player.life.usedToday) player.life.usedToday = [] // 作息活动每日重置
            player.autoSleepNow = true
            if (!safeUpgrade("gk", 45) && player.eve && player.eve.yzBuff) player.eve.yzBuff = [false, false, false, false, false, false] // 押题护体
            if (safeMilestone("eve", 2) && player.eve) player.eve.tickets = (player.eve.tickets || 0) + 1 // 每日押题券
            if (player.eve && safeMilestone("gk", 0)) player.eve.tickets = (player.eve.tickets || 0) + 1 // 模考 300：+1
            if (player.eve && safeMilestone("gk", 3)) player.eve.tickets = (player.eve.tickets || 0) + 1 // 模考 500：+1
            var t = player["tree-tab"]
            t.qKey = ""; t.qSubj = ""; t.qIdx = -1; t.qPicked = -2; t.qDone = false
        }
    },
    leftTab: true,
})

function energyMax() {
    var m = TUNING.ENERGY_MAX
    if (safeMilestone("life", 0)) m += 10
    if (safeMilestone("life", 4)) m += 20
    if (safeUpgrade("gk", 22)) m += 20 // 精力补给站
    return m
}
