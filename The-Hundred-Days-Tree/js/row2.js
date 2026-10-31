// row2.js — 限时训练（挑战）/ 错题本 / 晚修（static + 押题抽卡 + 自动化阶梯主场）

// ===================== 限时训练 =====================
var TRAIN_CHALS = [11, 12, 13, 21]
var TRAIN_NAMES = { 11: "语文限时测", 12: "数学限时测", 13: "英语限时测", 21: "理综模拟" }

addLayer("train", {
    name: "限时训练",
    symbol: "训",
    position: 0,
    color: "#e8590c",
    resource: "模拟经验",
    row: 2,
    branches: ["mat"],
    startData() {
        return {
            unlocked: false, // 任一科 60 分解锁
            points: new Decimal(0),
            chalScore: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
            chalBest: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
        }
    },
    type: "none",
    layerShown() { return player.train.unlocked },
    tooltipLocked() { return "任一科 60 分后，16:30 的限时训练向你开放" },
    update(diff) {
        if (!player.train.unlocked) {
            for (var i = 0; i < SUBJECTS.length; i++) {
                if (subjectScore(SUBJECTS[i]) >= 60) { player.train.unlocked = true; break }
            }
            if (!player.train.unlocked) return
        }
        for (var k = 0; k < 4; k++) {
            var cid = TRAIN_CHALS[k]
            if (!inChallenge("train", cid)) continue
            if (maxedChallenge("train", cid)) continue
            var rate = TUNING.TRAIN_RATE
            if (currentPeriod().id === "train") rate *= TUNING.TRAIN_WINDOW // 16:30-17:10 真实窗口 ×2
            if (safeUpgrade("train", 11)) rate *= 1.5
            if (safeUpgrade("train", 12)) rate *= 1.2
            if (safeMilestone("train", 0)) rate *= 1.2
            if (safeMilestone("train", 2)) rate *= 1.5
            if (safeUpgrade("gk", 25)) rate *= 1.3 // 旗开得胜
            player.train.chalScore[k] = player.train.chalScore[k].add(rate * diff)
            player.train.chalBest[k] = player.train.chalBest[k].max(player.train.chalScore[k])
        }
    },
    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        var cs = [], bs = []
        for (var i = 0; i < 4; i++) { cs.push(player.train.chalScore[i]); bs.push(player.train.chalBest[i]) }
        layerDataReset(this.layer, ["unlocked", "milestones", "upgrades", "challenges"])
        player.train.chalScore = cs // F18：数组 keep 不能走 layOver，手动带过
        player.train.chalBest = bs
    },
    tabFormat: [
        ["display-text", function () {
            return "<b style='font-size:1.4em;color:#e8590c'>限时训练</b>　挑战内每秒积累模拟经验；16:30-17:10 的真实窗口内得分 ×" + TUNING.TRAIN_WINDOW
        }],
        "challenges",
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "策略": { content: [["blank", "8px"], "upgrades"] },
            "里程碑": { content: [["blank", "8px"], "milestones"] },
        },
    },
    challenges: {
        11: {
            name: "语文限时测",
            challengeDescription() {
                return "语文结算开平方（考场上手会抖）<br>目标：模拟经验 " + TUNING.TRAIN_GOAL + "<br>" +
                    challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " 次完成"
            },
            goalDescription: "积累 " + TUNING.TRAIN_GOAL + " 模拟经验",
            canComplete() { return player.train.chalScore[0].gte(TUNING.TRAIN_GOAL) },
            rewardDescription: "全科目专注积累 ×1.05",
            completionLimit: 2,
            unlocked() { return player.train.unlocked },
            onEnter() { player.train.chalScore[0] = new Decimal(0) },
        },
        12: {
            name: "数学限时测",
            challengeDescription() {
                return "数学结算减半（步骤分全扣）<br>目标：模拟经验 " + TUNING.TRAIN_GOAL + "<br>" +
                    challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " 次完成"
            },
            goalDescription: "积累 " + TUNING.TRAIN_GOAL + " 模拟经验",
            canComplete() { return player.train.chalScore[1].gte(TUNING.TRAIN_GOAL) },
            rewardDescription: "数学结算 ×1.15",
            completionLimit: 2,
            unlocked() { return player.train.unlocked },
            onEnter() { player.train.chalScore[1] = new Decimal(0) },
        },
        13: {
            name: "英语限时测",
            challengeDescription() {
                return "英语专注积累减半（听力像天书）<br>目标：模拟经验 " + TUNING.TRAIN_GOAL + "<br>" +
                    challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " 次完成"
            },
            goalDescription: "积累 " + TUNING.TRAIN_GOAL + " 模拟经验",
            canComplete() { return player.train.chalScore[2].gte(TUNING.TRAIN_GOAL) },
            rewardDescription: "英语结算 ×1.15",
            completionLimit: 2,
            unlocked() { return player.train.unlocked },
            onEnter() { player.train.chalScore[2] = new Decimal(0) },
        },
        21: {
            name: "理综模拟",
            challengeDescription() {
                return "物理/化学/生物积累减半（三科连考）<br>目标：模拟经验 " + TUNING.TRAIN_GOAL + "<br>" +
                    challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " 次完成"
            },
            goalDescription: "积累 " + TUNING.TRAIN_GOAL + " 模拟经验",
            canComplete() { return player.train.chalScore[3].gte(TUNING.TRAIN_GOAL) },
            rewardDescription: "理综三科结算 ×1.1",
            completionLimit: 2,
            unlocked() { return player.train.unlocked },
            onEnter() { player.train.chalScore[3] = new Decimal(0) },
        },
    },
    upgrades: {
        11: {
            title: "考试策略",
            description: "挑战内得分率 ×1.5。",
            cost: new Decimal(2000),
            currencyDisplayName: "晚修专注",
            currencyInternalName: "att",
            currencyLocation() { return player.eve },
        },
        12: {
            title: "抗压训练",
            description: "挑战内得分率 ×1.2。",
            cost: new Decimal(20000),
            currencyDisplayName: "晚修专注",
            currencyInternalName: "att",
            currencyLocation() { return player.eve },
        },
        13: {
            title: "模考如常",
            description: "全科目结算 ×1.05。",
            cost: new Decimal(1e5),
            currencyDisplayName: "晚修专注",
            currencyInternalName: "att",
            currencyLocation() { return player.eve },
        },
    },
    milestones: {
        0: {
            requirementDescription: "完成任意 1 次限时训练",
            effectDescription: "挑战得分率 ×1.2",
            done() { return challengeCompletions("train", 11) + challengeCompletions("train", 12) + challengeCompletions("train", 13) + challengeCompletions("train", 21) >= 1 },
        },
        1: {
            requirementDescription: "完成任意 3 次限时训练",
            effectDescription: "晚修专注积累 ×1.2",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return challengeCompletions("train", 11) + challengeCompletions("train", 12) + challengeCompletions("train", 13) + challengeCompletions("train", 21) >= 3 },
        },
        2: {
            requirementDescription: "四种限时训练各完成至少 1 次",
            effectDescription: "挑战得分率 ×1.5",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return challengeCompletions("train", 11) >= 1 && challengeCompletions("train", 12) >= 1 && challengeCompletions("train", 13) >= 1 && challengeCompletions("train", 21) >= 1 },
        },
    },
})

// ===================== 错题本 =====================
// 错题池/错题记录是全局值 player.wrongPool / player.wrongLog（答错产生，晚修四消化）
function wrongProcSpeed() {
    var s = 1
    if (safeUpgrade("wrong", 11)) s *= 2
    if (safeUpgrade("wrong", 14)) s *= 2
    if (safeMilestone("wrong", 1)) s *= 2
    if (safeMilestone("chi", 2)) s *= 2   // 语文 m2：错题消化 ×2
    if (safeUpgrade("eve", 21)) s *= 2    // 晚修「错题夜晚」
    if (safeUpgrade("life", 15)) s *= 2   // 夜灯
    return s
}

// 错题重做（wrong 层内的小问答回路）
function wrongOptDisplay(n) {
    var w = player.wrong
    if (!w || w.rIdx < 0) return "—"
    var parts = player.wrongLog[w.rLog].split(":")
    var q = QUESTIONS[parts[0]][parseInt(parts[1])]
    var mark = w.rDone ? (n === q.a ? " ✔" : (w.rPicked === n ? " ✘" : "")) : ""
    return String.fromCharCode(65 + n) + ". " + q.o[n] + mark
}
function wrongOptCanClick(n) {
    var w = player.wrong
    return w && w.rIdx >= 0 && !w.rDone
}
function wrongOptClick(n) {
    var w = player.wrong
    if (w.rDone || w.rIdx < 0) return
    var parts = player.wrongLog[w.rLog].split(":")
    var subj = parts[0], qidx = parseInt(parts[1])
    var q = QUESTIONS[subj][qidx]
    w.rPicked = n
    w.rDone = true
    if (n === q.a) {
        player.wrongPool = Math.max(0, player.wrongPool - 1)
        player.wrongLog.splice(w.rLog, 1)
        player[subj].mastery = (player[subj].mastery || 0) + TUNING.WRONG_MAST + (safeUpgrade("gk", 23) ? TUNING.WRONG_MAST : 0) + (safeUpgrade("wrong", 12) ? upgradeEffect("wrong", 12).toNumber() : 0) + (safeMilestone("wrong", 0) ? 1 : 0)
        if (player[subj] && player[subj].att !== undefined) {
            var bonus = (safeUpgrade("wrong", 13) ? upgradeEffect("wrong", 13).toNumber() : 0) + (safeUpgrade("wrong", 23) ? 10 : 0)
            player[subj].att = player[subj].att.add(bonus)
        }
        player.wrongDone = (player.wrongDone || 0) + 1
        doPopup("吃透了！", "错题 -1，熟练度上升。", "#51cf66", "#51cf66", "#51cf66")
    } else {
        doPopup("又错了……", "这道题还在错题本里等你。", "#ff6b6b", "#ff6b6b", "#ff6b6b")
    }
    w.rIdx = -1; w.rLog = -1
}

addLayer("wrong", {
    name: "错题本",
    symbol: "错",
    position: 1,
    color: "#c0c0c0",
    resource: "错题",
    row: 2,
    branches: ["chi"],
    startData() {
        return {
            unlocked: false, // 累计错题 ≥5 解锁
            points: new Decimal(0),
            rLog: -1, rIdx: -1, rPicked: -2, rDone: false,
            procTimer: 0,
        }
    },
    type: "none",
    layerShown() { return player.wrong.unlocked },
    tooltipLocked() { return "答错 5 道题后，你会需要它的" },
    update(diff) {
        if (!player.wrong.unlocked) {
            if ((player.wrongPool || 0) >= 5) player.wrong.unlocked = true
            else return
        }
        // 晚修四：消化错题（签到 ×1，缺席 ×0.3）
        var p = currentPeriod()
        if (p.id !== "e4" || isGaokaoDay()) { player.wrong.procTimer = 0; return }
        if ((player.wrongLog || []).length === 0) return
        var speed = wrongProcSpeed() * (safeUpgrade("gk", 14) ? 1.5 : 1) // 名师答疑
        speed *= isSignedNow() ? 1 : absentFloor()
        player.wrong.procTimer += diff * speed
        while (player.wrong.procTimer >= TUNING.WRONG_PROC_TIME && (player.wrongLog || []).length > 0) {
            player.wrong.procTimer -= TUNING.WRONG_PROC_TIME
            var entry = player.wrongLog.shift()
            var parts = entry.split(":")
            var subj = parts[0]
            player.wrongPool = Math.max(0, player.wrongPool - 1)
            player[subj].mastery = (player[subj].mastery || 0) + TUNING.WRONG_MAST + (safeUpgrade("gk", 23) ? TUNING.WRONG_MAST : 0) + (safeUpgrade("wrong", 12) ? upgradeEffect("wrong", 12).toNumber() : 0) + (safeMilestone("wrong", 0) ? 1 : 0)
            if (player[subj] && player[subj].att !== undefined) {
                var bonus = (safeUpgrade("wrong", 13) ? upgradeEffect("wrong", 13).toNumber() : 0) + (safeUpgrade("wrong", 23) ? 10 : 0)
                player[subj].att = player[subj].att.add(bonus)
            }
            player.wrongDone = (player.wrongDone || 0) + 1
        }
    },
    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        layerDataReset(this.layer, ["unlocked", "milestones", "upgrades"])
    },
    tabFormat: [
        ["display-text", function () {
            var n = player.wrongPool || 0
            return "<b style='font-size:1.4em;color:#c0c0c0'>错题本</b>　当前错题 <b>" + n + "</b> 道（累计消化 " + (player.wrongDone || 0) + " 道）<br>" +
                "<span style='opacity:.7'>晚修四（21:15-22:20）会自动消化错题；也可以在下面手动重做。</span>"
        }],
        ["row", [["clickable", 11]]],
        ["display-text", function () {
            var w = player.wrong
            if (w.rIdx < 0) return ""
            var parts = player.wrongLog[w.rLog].split(":")
            var q = QUESTIONS[parts[0]][parseInt(parts[1])]
            if (w.rDone) return "<b>做完了</b>"
            return "<b>重做·" + SUBJ_NAMES[parts[0]] + "</b>：" + q.q
        }],
        ["row", [["clickable", 21], ["clickable", 22], ["clickable", 23], ["clickable", 24]]],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "整理术": { content: [["blank", "8px"], "upgrades"] },
            "里程碑": { content: [["blank", "8px"], "milestones"] },
        },
    },
    clickables: {
        11: {
            title: "重做错题",
            display() {
                var w = player.wrong
                if (w.rIdx >= 0 && !w.rDone) return "作答中……"
                return "✏️ 重做最早的一道错题（" + (player.wrongLog || []).length + " 道待重做）"
            },
            canClick() {
                var w = player.wrong
                return (player.wrongLog || []).length > 0 && w.rIdx < 0
            },
            onClick() {
                var w = player.wrong
                w.rLog = 0
                var parts = player.wrongLog[0].split(":")
                w.rIdx = parseInt(parts[1])
                w.rPicked = -2
                w.rDone = false
            },
        },
        21: { display() { return wrongOptDisplay(0) }, canClick() { return wrongOptCanClick(0) }, onClick() { wrongOptClick(0) } },
        22: { display() { return wrongOptDisplay(1) }, canClick() { return wrongOptCanClick(1) }, onClick() { wrongOptClick(1) } },
        23: { display() { return wrongOptDisplay(2) }, canClick() { return wrongOptCanClick(2) }, onClick() { wrongOptClick(2) } },
        24: { display() { return wrongOptDisplay(3) }, canClick() { return wrongOptCanClick(3) }, onClick() { wrongOptClick(3) } },
    },
    upgrades: {
        11: {
            title: "错题本首页",
            fullDisplay() { return "<b>错题本首页</b><br>晚修四消化错题的速度 ×2<br><br>费用：3 道错题" },
            canAfford() { return (player.wrongPool || 0) >= 3 },
            pay() { player.wrongPool -= 3 },
        },
        12: {
            title: "举一反三",
            fullDisplay() { return "<b>举一反三</b><br>每消化一道错题，额外 +3 熟练度<br><br>费用：8 道错题" },
            canAfford() { return (player.wrongPool || 0) >= 8 },
            pay() { player.wrongPool -= 8 },
            effect() { return new Decimal(3) },
        },
        13: {
            title: "吃透错题",
            fullDisplay() { return "<b>吃透错题</b><br>每消化一道，该科专注 +30<br><br>费用：20 道错题" },
            canAfford() { return (player.wrongPool || 0) >= 20 },
            pay() { player.wrongPool -= 20 },
            effect() { return new Decimal(30) },
        },
        14: {
            title: "同伴讲题",
            fullDisplay() { return "<b>同伴讲题</b><br>晚修四消化速度 ×2<br><br>费用：50 道错题" },
            canAfford() { return (player.wrongPool || 0) >= 50 },
            pay() { player.wrongPool -= 50 },
        },
        15: {
            title: "错题清零计划",
            fullDisplay() { return "<b>错题清零计划</b><br>目标：把错题池清到 0（有成就）<br><br>费用：120 道错题" },
            canAfford() { return (player.wrongPool || 0) >= 120 },
            pay() { player.wrongPool -= 120 },
        },
        21: {
            title: "考前错题复盘",
            fullDisplay() { return "<b>考前错题复盘</b><br>全科目结算 ×1.05<br><br>费用：300 道错题" },
            canAfford() { return (player.wrongPool || 0) >= 300 },
            pay() { player.wrongPool -= 300 },
            effect() { return new Decimal(1.05) },
        },
        22: {
            title: "命题人思维",
            fullDisplay() { return "<b>命题人思维</b><br>押题卷的「押偏」概率减半<br><br>费用：800 道错题" },
            canAfford() { return (player.wrongPool || 0) >= 800 },
            pay() { player.wrongPool -= 800 },
        },
        23: {
            title: "错题哈哈镜",
            fullDisplay() { return "<b>错题哈哈镜</b><br>每消化一道，该科专注额外 +10<br><br>费用：2000 道错题" },
            canAfford() { return (player.wrongPool || 0) >= 2000 },
            pay() { player.wrongPool -= 2000 },
        },
    },
    milestones: {
        0: {
            requirementDescription: "累计消化 10 道错题",
            effectDescription: "每次消化额外 +1 熟练度",
            done() { return (player.wrongDone || 0) >= 10 },
        },
        1: {
            requirementDescription: "把错题池清零一次",
            effectDescription: "消化速度 ×2",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return (player.wrongPool || 0) === 0 && (player.wrongDone || 0) > 0 },
        },
        2: {
            requirementDescription: "累计消化 50 道错题",
            effectDescription: "全科目专注积累 ×1.03",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return (player.wrongDone || 0) >= 50 },
        },
    },
})

// ===================== 晚修 =====================
addLayer("eve", {
    name: "晚修",
    symbol: "晚",
    position: 2,
    color: "#748ffc",
    resource: "自习楼层",
    row: 2,
    branches: ["mat"],
    startData() {
        return {
            unlocked: false, // 第一次晚修（18:15）解锁
            points: new Decimal(0),
            total: new Decimal(0),
            best: new Decimal(0),
            att: new Decimal(0),
            tickets: 1,        // 押题券（普通数值）
            yzLast: "",        // 上次抽卡结果文案
            // M13 buff bus（D-GACHADATA：池 6 + 1 冗余位）
            yzBuff: [false, false, false, false, false, false, false],
            yzVal: [new Decimal(2), new Decimal(2), new Decimal(2), new Decimal(2), new Decimal(2), new Decimal(2), new Decimal(2)],
        }
    },
    baseResource: "晚修专注",
    baseAmount() { return player.eve.att },
    requires: new Decimal(TUNING.EVE_REQ),
    base: TUNING.EVE_BASE,
    exponent: 1,
    roundUpCost: true,
    type: "static",
    resetsNothing() { return true }, // 楼层只进不退；专注池在 onPrestige 手动消耗（晚修清层不得级联到科目）
    canBuyMax() { return safeUpgrade("eve", 15) },
    canReset() { return player.eve.att.gte(tmp.eve.nextAt) },
    onPrestige(gain) {
        player.eve.att = new Decimal(0) // 自习专注消耗
    },
    autoPrestige() { return hasMilestone("eve", 3) && !hasMilestone("eve", 7) }, // 满层前自动上楼；此后专注留给训练升级（经济解死锁）
    automate() {
        if (safeMilestone("eve", 5)) buyMaxBuyable("life", 11) // P4 步骤5：闭式 buyMax 自动买营养品
    },
    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        var yzB = player.eve.yzBuff.slice(), yzV = player.eve.yzVal.slice()
        layerDataReset(this.layer, ["unlocked", "best", "total", "milestones", "upgrades", "buyables", "tickets"])
        player.eve.yzBuff = yzB // F18：数组 keep 手动带过
        player.eve.yzVal = yzV
    },
    layerShown() { return player.eve.unlocked },
    tooltipLocked() { return "18:15 晚修见" },
    update(diff) {
        if (!player.eve.unlocked) {
            if (minutesToday() >= 1095) player.eve.unlocked = true
            return
        }
        var p = currentPeriod()
        if (isGaokaoDay() || p.kind !== "eve") return
        var rate = TUNING.ATT_RATE * (safeUpgrade("gk", 24) ? 1.0 : TUNING.ATT_EVE_FACTOR) // 自习室灯更亮
        rate *= isSignedNow() ? TUNING.ATT_SIGNED : absentFloor()
        rate *= energyFactor()
        rate *= globalAttMult("eve")
        if (safeUpgrade("eve", 11)) rate *= 1.5
        if (safeUpgrade("eve", 12)) rate *= 1.3
        if (safeUpgrade("eve", 22)) rate *= 1.5
        if (safeMilestone("eve", 4)) rate *= 1.5
        if (safeMilestone("train", 1)) rate *= 1.2
        if (getBuyableAmount("eve", 11).gt(0)) rate *= Math.pow(1.1, getBuyableAmount("eve", 11).toNumber())
        player.eve.att = player.eve.att.add(rate * diff)
    },
    prestigeButtonText() {
        return "上自习<br>" + formatWhole(tmp.eve.resetGain) + " 层（下次 " + format(tmp.eve.nextAt) + " 专注）"
    },
    tabFormat: [
        ["display-text", function () {
            return "<b style='font-size:1.5em;color:#748ffc'>晚修 · 第 " + formatWhole(player.eve.points) + " 层</b>（最好 " + formatWhole(player.eve.best) + "）" +
                "　专注池 " + formatWhole(player.eve.att)
        }],
        "prestige-button",
        ["display-text", function () {
            var p = currentPeriod()
            if (p.kind === "eve") return "晚修进行中：" + p.name + (isSignedNow() ? "" : "　<span style='color:#ff6b6b'>未签到 ×" + absentFloor() + "</span>")
            return "<span style='opacity:.6'>专注只在晚修时段（18:15-22:20）流动</span>"
        }],
        ["row", [["clickable", 21], ["display-text", function () { return gachaDisplay() }]]],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "自习室": { content: [["blank", "8px"], "upgrades"] },
            "里程碑": { content: [["blank", "8px"], "milestones"] },
            "后勤": {
                content: [["blank", "8px"], ["display-text", function () { return "加练卷花晚修专注；押题券包用楼层换券。" }], "buyables"],
                unlocked() { return safeUpgrade("eve", 14) },
            },
            "说明": { content: [["blank", "8px"], ["infobox", "howto"]] },
        },
    },
    infoboxes: {
        howto: {
            title: "晚修怎么过",
            body() { return "四段晚修（数学/英语/理综/错题整理）积累自习专注。<br>专注换成「楼层」——楼层是晚修全部升级与自动化的钥匙。<br>老师偶尔发押题卷：花押题券抽一科「今晚必考」buff（该科专注 ×2，当晚有效，押偏就白花）。" },
        },
    },
    clickables: {
        21: {
            title: "押题",
            display() { return "🎟 抽押题卷（1 券）<br>现有 " + (player.eve.tickets || 0) + " 张" },
            canClick() { return (player.eve.tickets || 0) >= 1 && safeUpgrade("eve", 14) },
            onClick() {
                player.eve.tickets -= 1
                var duds = safeUpgrade("gk", 13) ? 0 : (safeUpgrade("wrong", 22) ? 1 : TUNING.YZ_DUDS) // 押题大师清零 / 命题人思维减半
                var roll = Math.floor(Math.random() * (TUNING.YZ_POOL + duds))
                if (roll < TUNING.YZ_POOL) {
                    player.eve.yzBuff[roll] = true
                    player.eve.yzVal[roll] = new Decimal(safeMilestone("eve", 6) ? 2.5 : TUNING.YZ_MULT)
                    player.eve.yzLast = "🎯 押中了" + SUBJ_NAMES[SUBJECTS[roll]] + "！今晚该科专注 ×" + (safeMilestone("eve", 6) ? 2.5 : TUNING.YZ_MULT)
                } else {
                    player.eve.yzLast = "……押偏了（老师划的重点没考）"
                }
            },
        },
    },
    upgrades: {
        11: {
            title: "自习纪律",
            description: "晚修专注积累 ×1.5。",
            cost: new Decimal(1),
        },
        12: {
            title: "手机上交",
            description: "晚修专注积累 ×1.3。",
            cost: new Decimal(1),
            unlocked() { return hasUpgrade(this.layer, 11) },
        },
        13: {
            title: "台灯",
            description: "犯困线 -5（更晚才犯困）。",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade(this.layer, 12) },
        },
        14: {
            title: "押题卷印刷",
            description: "解锁押题：老师开始发押题卷（首页抽卡）。",
            cost: new Decimal(3),
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        15: {
            title: "批量自习",
            description: "解锁「买最大楼层」。",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        21: {
            title: "错题夜晚",
            description: "晚修四消化错题的速度 ×2。",
            cost: new Decimal(8),
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
        22: {
            title: "安静教室",
            description: "晚修专注积累 ×1.5。",
            cost: new Decimal(13),
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
        23: {
            title: "深夜学霸",
            description: "全科目专注积累 ×1.05。",
            cost: new Decimal(21),
            unlocked() { return hasUpgrade(this.layer, 22) },
        },
    },
    milestones: {
        0: {
            requirementDescription: "自习 1 层",
            effectDescription: "解锁晚修升级",
            done() { return player.eve.best.gte(1) },
        },
        1: {
            requirementDescription: "自习 2 层",
            effectDescription: "缺席底效率 ×0.3 → ×0.5（自习纪律摊到白天）",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player.eve.best.gte(2) },
        },
        2: {
            requirementDescription: "自习 3 层",
            effectDescription: "每天自动 +1 押题券",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player.eve.best.gte(3) },
        },
        3: {
            requirementDescription: "自习 4 层",
            effectDescription: "下课自动结算（六科）",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player.eve.best.gte(4) },
        },
        4: {
            requirementDescription: "自习 5 层",
            effectDescription: "晚修专注积累 ×1.5",
            unlocked() { return hasMilestone(this.layer, 3) },
            done() { return player.eve.best.gte(5) },
        },
        5: {
            requirementDescription: "自习 6 层",
            effectDescription: "自动买满营养品（闭式买法）",
            unlocked() { return hasMilestone(this.layer, 4) },
            done() { return player.eve.best.gte(6) },
        },
        6: {
            requirementDescription: "自习 7 层",
            effectDescription: "押题 buff 强度 ×2 → ×2.5",
            unlocked() { return hasMilestone(this.layer, 5) },
            done() { return player.eve.best.gte(7) },
        },
        7: {
            requirementDescription: "自习 8 层",
            effectDescription: "全科目专注积累 ×1.05",
            unlocked() { return hasMilestone(this.layer, 6) },
            done() { return player.eve.best.gte(8) },
        },
    },
    buyables: {
        11: {
            title: "加练卷",
            cost(x) { return new Decimal(2000).times(Decimal.pow(2, x)) },
            effect(x) { return Decimal.pow(1.1, x) },
            display() {
                return "晚修专注积累 ×" + format(this.effect(getBuyableAmount(this.layer, this.id))) +
                    "<br>等级：" + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>费用：" + format(this.cost(getBuyableAmount(this.layer, this.id))) + " 晚修专注"
            },
            canAfford() { return player.eve.att.gte(tmp.eve.buyables[11].cost) },
            buy() {
                var c = tmp.eve.buyables[11].cost
                player.eve.att = player.eve.att.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return safeUpgrade("eve", 14) },
        },
        12: {
            title: "押题券包",
            purchaseLimit: new Decimal(10),
            display() {
                return "花 3 层楼换 3 张押题券<br>已买：" + formatWhole(getBuyableAmount(this.layer, this.id)) + "/10" +
                    "<br>费用：3 层楼"
            },
            canAfford() { return player.eve.points.gte(3) },
            buy() {
                player.eve.points = player.eve.points.sub(3)
                player.eve.tickets = (player.eve.tickets || 0) + 3
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return safeUpgrade("eve", 14) },
        },
    },
})

// 押题结果展示（eve tabFormat 消费）
function gachaDisplay() {
    var e = player.eve
    if (!safeUpgrade("eve", 14)) return "<span style='opacity:.6'>买到「押题卷印刷」后，老师才会发押题卷</span>"
    var buffs = []
    for (var i = 0; i < TUNING.YZ_POOL; i++) {
        if (e.yzBuff[i]) buffs.push(SUBJ_NAMES[SUBJECTS[i]] + " ×" + format(e.yzVal[i]))
    }
    var active = buffs.length ? "今晚命中：" + buffs.join("、") : "今晚暂无命中"
    return (e.yzLast ? e.yzLast + "<br>" : "") + "<span style='opacity:.75'>" + active + "</span>"
}
