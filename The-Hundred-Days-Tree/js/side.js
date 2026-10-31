// side.js — 三个侧层（row "side"：树上方侧节点行）：
//   oath 誓师（倒计时 dashboard + 誓词 + 百日叙事）/ stats 统计 / a 成就（5×10，P11 显式计数行）

// ===================== 誓师层 =====================
// 百日叙事（每 10 天一段；gameDay0 0–99，高考日收束）
function oathStory() {
    if (isGaokaoDay()) return "今天，走进考场。<br><b>百日无悔。</b>"
    var d = gameDay0()
    var seg = [
        "誓师已毕，战鼓初响。把每一个课间都当成机会。",
        "第一个十天最难熬。错题本越来越厚，是好事。",
        "三分之一了。早读的声音比誓师那天更亮。",
        "有人在深夜崩溃，有人在灯下坚持。愿你是后者。",
        "一模快到了。分数会说话，但别让它定义你。",
        "半程已过。回望来路，你已经走了很远。",
        "二模前后。手要稳，心要沉。",
        "七十日。窗外的树绿了又深。",
        "八十日。教室后墙的倒计时牌翻得越来越快。",
        "最后十天。回归基础，回归错题，回归平常心。",
    ]
    return seg[Math.min(9, Math.floor(d / 10))]
}

// 课程时间表（从 tuning.PERIODS 唯一源渲染；当前时段高亮；📍=需签到；单栏适配窄分屏）
function timetableHTML() {
    var fmt = function (m) { var h = Math.floor(m / 60), mm = Math.floor(m % 60); return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm }
    var html = "<table style='font-size:11px;line-height:1.5;border-spacing:0 1px'>"
    for (var i = 0; i < PERIODS.length; i++) {
        var p = PERIODS[i]
        var cur = currentPeriod().id === p.id
        var st = cur ? "color:#e8590c;font-weight:bold" : "opacity:.85"
        html += "<tr><td style='" + st + ";padding-right:7px;white-space:nowrap'>" + fmt(p.s) + "–" + fmt(p.e) + "</td>" +
            "<td style='" + st + ";white-space:nowrap'>" + (cur ? "▶ " : "") + p.name + (p.sign ? " <span style='opacity:.55'>📍</span>" : "") + "</td></tr>"
    }
    return html + "</table>"
}

addLayer("oath", {
    name: "誓师",
    symbol: "誓",
    position: 0,
    color: "#e8590c",
    resource: "誓言",
    row: "side",
    tooltip: "誓师 · 倒计时",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    layerShown() { return true },
    tabFormat: [
        ["display-text", function () {
            if (isGaokaoDay()) return "<b style='font-size:2em;color:#e8590c'>高考日</b><br>走进考场（高考层）"
            return "<b style='font-size:2em;color:#e8590c'>第 " + gameDay() + " 天</b><br><span style='font-size:1.2em'>距高考还有 <b>" + countdownDays() + "</b> 天</span>"
        }],
        "blank",
        ["display-text", function () {
            return "<div style='border:2px solid #e8590c;border-radius:8px;padding:10px 14px;max-width:520px'>" +
                "<b style='color:#e8590c'>百日誓师宣言</b><br>" +
                "十年磨剑，百日策马闯雄关；一朝试锋，六月扬眉传佳音。<br>" +
                "我承诺：不迟到，不缺席，不放弃一道错题；<br>惜时如金，全力以赴，让百日无可悔。</div>"
        }],
        "blank",
        ["display-text", function () {
            var signN = 0
            for (var i = 0; i < PERIODS.length; i++) if (PERIODS[i].sign) signN++
            var p = currentPeriod()
            var line = p.sign ? (isSignedNow() ? "<span style='color:#51cf66'>✔ 本时段已签到</span>" : "<span style='color:#ff6b6b'>✘ 本时段未签到</span>") : "本时段无需签到"
            return "<b>今日进度</b><br>" +
                "签到 " + (player.signToday || 0) + " / " + signN + "　" + line + "<br>" +
                "答对 " + (player.correctToday || 0) + " 题　错题入本 " + (player.wrongLog || []).length + " 道<br>" +
                (player.sleepToday ? "🌙 今晚已就寝" : "尚未就寝")
        }],
        "blank",
        ["display-text", function () {
            return "<b>课程时间表</b><span style='opacity:.55'>　📍 需签到</span><br>" + timetableHTML()
        }],
        "blank",
        ["display-text", function () { return "<span style='opacity:.75'>" + oathStory() + "</span>" }],
    ],
})

// ===================== 统计层 =====================
addLayer("stats", {
    name: "统计",
    symbol: "统",
    position: 1,
    color: "#868e96",
    resource: "数据",
    row: "side",
    tooltip: "统计",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    layerShown() { return true },
    tabFormat: [
        ["display-text", function () {
            var acc = (player.totalAnswered || 0) > 0 ? Math.floor(100 * (player.totalCorrect || 0) / player.totalAnswered) : 0
            return "<b>全局统计</b><br>" +
                "累计签到 " + (player.totalSigned || 0) + " 次<br>" +
                "累计抢答 " + (player.totalAnswered || 0) + " 题 · 答对 " + (player.totalCorrect || 0) + " 题（正确率 " + acc + "%）<br>" +
                "消化错题 " + (player.wrongDone || 0) + " 道 · 错题待消化 " + (player.wrongLog || []).length + " 道<br>" +
                "就寝 " + (player.life ? player.life.sleeps : 0) + " 晚 · 累计元气 " + (player.life ? format(player.life.total) : 0) + "<br>" +
                "模考积分 " + format(player.gk.points) + " · 录取通知书 ×" + (player.gk.medals || 0) + "<br>" +
                "已坚持 " + formatTime(player.timePlayed) + "（第 " + gameDay() + " 天）"
        }],
        "blank",
        ["display-text", function () {
            var lines = ["<b>分科面板</b>"]
            for (var i = 0; i < SUBJECTS.length; i++) {
                var id = SUBJECTS[i]
                var P = player[id]
                if (!P) continue
                lines.push(SUBJ_NAMES[id] + "：分数 <b>" + Math.floor(subjectScore(id)) + "</b> / 150　熟练度 Lv." + masteryLevel(id) + "　笔记 " + format(P.notes) + "　未结算专注 " + format(P.att))
            }
            lines.push("总分：<b>" + Math.floor(totalScore()) + "</b> / 750")
            lines.push("<span style='opacity:.6'>理综三科按 2/3 折入总分（150×3+300 = 750，真实高考结构）</span>")
            return lines.join("<br>")
        }],
    ],
})

// ===================== 成就层（50 个，5 列 × 10 行） =====================
// 条件全部读持久状态：totalSigned/totalAnswered/totalCorrect/correctToday/wrongDone 为全局；
// 科目 total/mastery、life sleeps/total、train completions 均在各层 doReset keep 清单中，考试燃烧不清除。
function subScoreAtLeast(id, v) { return subjectScore(id) >= v }
function subCountAtLeast(v) {
    var n = 0
    for (var i = 0; i < SUBJECTS.length; i++) if (subjectScore(SUBJECTS[i]) >= v) n++
    return n
}

addLayer("a", {
    name: "成就",
    symbol: "成",
    position: 2,
    color: "#f9cb28",
    resource: "成就",
    row: "side",
    tooltip: "成就",
    startData() { return { unlocked: true, points: new Decimal(0) } },
    type: "none",
    layerShown() { return true },
    tabFormat: [
        // P11：显式计数行（引擎成就组件没有原生计数头）
        ["display-text", function () {
            var n = player.a.achievements ? player.a.achievements.length : 0
            return "<b style='font-size:1.3em;color:#f9cb28'>成就 " + n + " / 50</b>"
        }],
        "blank",
        "achievements",
    ],
    achievements: {
        rows: 10,
        cols: 5,
        // ---- 行 1：签到日常 ----
        11: { name: "第一天", tooltip: "首次签到", done() { return (player.totalSigned || 0) >= 1 } },
        12: { name: "全勤生", tooltip: "一天内签满全部 13 个时段", done() { return (player.signToday || 0) >= 13 } },
        13: { name: "风雨无阻", tooltip: "累计签到 50 次", done() { return (player.totalSigned || 0) >= 50 } },
        14: { name: "雷打不动", tooltip: "累计签到 200 次", done() { return (player.totalSigned || 0) >= 200 } },
        15: { name: "初露锋芒", tooltip: "首次课间抢答答对", done() { return (player.totalCorrect || 0) >= 1 } },
        // ---- 行 2：抢答 ----
        21: { name: "十连击", tooltip: "累计答对 10 题", done() { return (player.totalCorrect || 0) >= 10 } },
        22: { name: "课间杀手", tooltip: "累计答对 50 题", done() { return (player.totalCorrect || 0) >= 50 } },
        23: { name: "手感火热", tooltip: "单日答对 5 题", done() { return (player.correctToday || 0) >= 5 } },
        24: { name: "百战不殆", tooltip: "累计抢答 100 次", done() { return (player.totalAnswered || 0) >= 100 } },
        25: { name: "题海无涯", tooltip: "累计抢答 300 次", done() { return (player.totalAnswered || 0) >= 300 } },
        // ---- 行 3：学业及格线 ----
        31: { name: "语文入门", tooltip: "语文达到 90 分", done() { return subScoreAtLeast("chi", 90) } },
        32: { name: "数学入门", tooltip: "数学达到 90 分", done() { return subScoreAtLeast("mat", 90) } },
        33: { name: "英语入门", tooltip: "英语达到 90 分", done() { return subScoreAtLeast("eng", 90) } },
        34: { name: "理综入门", tooltip: "物理/化学/生物均达 75 分", done() { return subScoreAtLeast("phy", 75) && subScoreAtLeast("chem", 75) && subScoreAtLeast("bio", 75) } },
        35: { name: "均衡发展", tooltip: "六科全部达到 80 分", done() { return subCountAtLeast(80) >= 6 } },
        // ---- 行 4：高分 ----
        41: { name: "单科尖子", tooltip: "任一科达到 130 分", done() { return subCountAtLeast(130) >= 1 } },
        42: { name: "全面开花", tooltip: "五科达到 120 分", done() { return subCountAtLeast(120) >= 5 } },
        43: { name: "一本预定", tooltip: "模考预测总分 500", done() { return totalScore() >= 500 } },
        44: { name: "重点苗子", tooltip: "模考预测总分 650", done() { return totalScore() >= 650 } },
        45: { name: "学神", tooltip: "模考预测总分 750（满分）", done() { return totalScore() >= 750 } },
        // ---- 行 5：作息 ----
        51: { name: "第一晚", tooltip: "首次就寝", done() { return (player.life && player.life.sleeps >= 1) } },
        52: { name: "规律作息", tooltip: "就寝 10 晚", done() { return player.life && player.life.sleeps >= 10 } },
        53: { name: "百日如一", tooltip: "就寝 50 晚", done() { return player.life && player.life.sleeps >= 50 } },
        54: { name: "元气满满", tooltip: "累计获得 100 元气", done() { return player.life && player.life.total.gte(100) } },
        55: { name: "元气爆棚", tooltip: "累计获得 1000 元气", done() { return player.life && player.life.total.gte(1000) } },
        // ---- 行 6：晚修 ----
        61: { name: "晚修开张", tooltip: "刷满第 1 层晚修任务", done() { return player.eve && player.eve.best.gte(1) } },
        62: { name: "小有所成", tooltip: "晚修第 3 层", done() { return player.eve && player.eve.best.gte(3) } },
        63: { name: "晚修之王", tooltip: "晚修第 5 层", done() { return player.eve && player.eve.best.gte(5) } },
        64: { name: "通宵战神", tooltip: "晚修第 8 层", done() { return player.eve && player.eve.best.gte(8) } },
        65: { name: "押题好运", tooltip: "抽中一次押题 buff", done() { return player.eve && player.eve.yzBuff && player.eve.yzBuff.some(function (b) { return b }) } },
        // ---- 行 7：错题与挑战 ----
        71: { name: "错题本厚了", tooltip: "消化 50 道错题", done() { return (player.wrongDone || 0) >= 50 } },
        72: { name: "错题终结者", tooltip: "消化 200 道错题", done() { return (player.wrongDone || 0) >= 200 } },
        73: { name: "限时体验卡", tooltip: "完成任一限时训练", done() { return player.train && player.train.challenges && Object.keys(player.train.challenges).some(function (k) { return player.train.challenges[k] > 0 }) } },
        74: { name: "全能选手", tooltip: "四种限时训练都完成过", done() { return player.train && player.train.challenges && Object.keys(player.train.challenges).filter(function (k) { return player.train.challenges[k] > 0 }).length >= 4 } },
        75: { name: "双倍经验", tooltip: "全部限时训练完成两次", done() { return player.train && player.train.challenges && Object.keys(player.train.challenges).filter(function (k) { return player.train.challenges[k] >= 2 }).length >= 4 } },
        // ---- 行 8：作息经营 ----
        81: { name: "咖啡因战士", tooltip: "购买「咖啡因」", done() { return safeUpgrade("life", 24) } },
        82: { name: "生物钟", tooltip: "购买「生物钟」", done() { return safeUpgrade("life", 12) } },
        83: { name: "深度睡眠", tooltip: "购买「深度睡眠」", done() { return safeUpgrade("life", 22) } },
        84: { name: "营养充足", tooltip: "营养品升到 5 级", done() { return getBuyableAmount("life", 11).gte(5) } },
        85: { name: "闹钟大师", tooltip: "购买闹钟", done() { return getBuyableAmount("life", 12).gte(1) } },
        // ---- 行 9：模考与终局 ----
        91: { name: "模考起步", tooltip: "模考预测 300 分", done() { return safeMilestone("gk", 0) } },
        92: { name: "本科预定", tooltip: "模考预测 500 分", done() { return safeMilestone("gk", 3) } },
        93: { name: "重点预定", tooltip: "模考预测 650 分", done() { return safeMilestone("gk", 6) } },
        94: { name: "赴考", tooltip: "走进考场", done() { return player.gk && player.gk.examDone } },
        95: { name: "再来一年", tooltip: "复读一次", done() { return (player.gk.medals || 0) >= 1 } },
        // ---- 行 10：百日叙事 ----
        101: { name: "十日之约", tooltip: "坚持到第 11 天", done() { return gameDay0() >= 10 } },
        102: { name: "半程", tooltip: "坚持到第 51 天", done() { return gameDay0() >= 50 } },
        103: { name: "最后冲刺", tooltip: "坚持到第 96 天", done() { return gameDay0() >= 95 } },
        104: { name: "决战之日", tooltip: "迎来高考日", done() { return isGaokaoDay() } },
        105: { name: "无悔", tooltip: "高考总分 700+", done() { return player.gk && player.gk.examResult && player.gk.examResult.gte(700) } },
    },
})
