// gk.js — 高考层（row 3 capstone）：模考积分商店（M8）+ 第100天「走进考场」（M7 仪式 + M19 消耗式终局）
// 模考积分 = 总分 × 0.001/秒，全程积累；走进考场在高考日（第 100 天）开放，燃烧全部学业成果结算总分。
// 注：商店结算加成的消费助手 gkSettleMult/gkVigourMult 在 tuning.js（跨层接线之家）。

addLayer("gk", {
    name: "高考",
    symbol: "考",
    position: 0,
    color: "#fcc419",
    resource: "模考积分",
    row: 3,
    branches: ["chi", "mat", "eng", "phy", "chem", "bio"],
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            total: new Decimal(0),
            best: new Decimal(0),
            examDone: false,
            examResult: new Decimal(0),
            medals: 0, // 复读次数（录取通知书）
        }
    },
    type: "custom",
    startUnlocked: true, // 检查器标记（D-CANRESETDEAD 逃逸）：层始终可见，canReset 只管按钮
    requires: new Decimal(0),
    baseResource: "模考积分",
    baseAmount() { return new Decimal(totalScore()) },
    canReset() { return isGaokaoDay() && !player.gk.examDone },
    getResetGain() {
        // 高考总分 = 六科分数之和（各乘区已折入；引擎 addPoints 会把它折入模考积分）
        return new Decimal(totalScore()).floor()
    },
    getNextAt() { return new Decimal("1e1000") }, // 仅高考日可进（D-CUSTOMNEXTAT 必须定义）
    prestigeButtonText() {
        if (player.gk.examDone) {
            return "高考已结束<br>总分 " + formatWhole(player.gk.examResult)
        }
        if (!isGaokaoDay()) {
            return "距高考还有 " + countdownDays() + " 天<br>（高考日解锁「走进考场」）"
        }
        return "🏁 走进考场<br>预计总分 " + formatWhole(tmp.gk.resetGain)
    },
    onPrestige(gain) {
        // M19 消耗式重置：手动燃烧清单（各层 resetsNothing 拦截引擎级联，这里是唯一燃烧执行点）
        // 燃烧：掌握、专注、科目升级（笔记保留可重买）、楼层、押题 buff、错题池
        // 保留：熟练度、笔记、元气、模考商店（gk 自身不进级联）、成就、录取通知书
        player.gk.examDone = true
        player.gk.examResult = gain
        for (var i = 0; i < SUBJECTS.length; i++) {
            var id = SUBJECTS[i]
            player[id].points = new Decimal(0)
            player[id].att = new Decimal(0)
            player[id].upgrades = []
        }
        player.eve.points = new Decimal(0)
        player.eve.att = new Decimal(0)
        player.eve.best = new Decimal(0)
        if (player.eve && player.eve.yzBuff) player.eve.yzBuff = [false, false, false, false, false, false]
        player.wrongPool = 0
        player.wrongLog = []
    },
    update(diff) {
        // 模考积分：总分 × 0.001/秒（addPoints 是唯一合法写入者，best/total 同步维护）
        if (!player.gk.unlocked) return
        if (isGaokaoDay() || player.gk.examDone) return
        var rate = new Decimal(totalScore()).times(TUNING.GK_MOCK_RATE)
        if (safeMilestone("gk", 1)) rate = rate.times(1.5) // 模考 400
        if (safeMilestone("gk", 5)) rate = rate.times(2)   // 模考 600
        addPoints("gk", rate.times(diff))
    },
    layerShown() { return true },
    hotkeys: [
        { key: "g", description: "g: 打开高考层", onPress() { if (player.gk.unlocked) showTab("gk") } },
    ],
    tabFormat: [
        ["display-text", function () {
            if (player.gk.examDone) {
                var s = player.gk.examResult.toNumber()
                var tier = s >= 750 ? "<span style='color:#fcc419'>满分传奇！你的名字被写进了校史。</span>"
                    : s >= 700 ? "<span style='color:#51cf66'>顶尖学府向你敞开大门。</span>"
                    : s >= 600 ? "<span style='color:#4dabf7'>重点大学录取通知书已寄出。</span>"
                    : s >= 500 ? "<span style='color:#51cf66'>本科达线！父母笑了。</span>"
                    : s >= 400 ? "专科也有春天，专升本在等你。"
                    : "<span style='color:#ff6b6b'>……要不复读一年？</span>"
                return "<b style='font-size:1.6em;color:#fcc419'>高考总分 " + formatWhole(player.gk.examResult) + "</b><br>" + tier +
                    (player.gk.medals > 0 ? "<br>已持有「录取通知书」×" + player.gk.medals : "")
            }
            if (!isGaokaoDay()) {
                return "<b style='font-size:1.4em;color:#fcc419'>距高考还有 " + countdownDays() + " 天</b><br>" +
                    "当前模考预测总分：<b>" + Math.floor(totalScore()) + "</b> / 750<br>" +
                    "<span style='opacity:.7'>每一天的课、每一道题，都会算进六月的那两天。</span>"
            }
            return "<b style='color:#fcc419'>今天是高考日。</b>检查准考证，走进考场。"
        }],
        ["display-text", function () { return "模考积分 " + format(player.gk.points) + "（每日总分持续折算；高考总分一次性折入）" }],
        ["display-text", function () { if (player.gk.examDone) return "考完了？在商店最底部可以「复读一年」。" ; return "" }],
        "prestige-button",
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            // 注意：upgrades 组件的数组参数是「行号」（1 行 = 11–15），不是升级 ID
            "一轮复习": { content: [["blank", "8px"], ["upgrades", [1]]] },
            "二轮专题": { content: [["blank", "8px"], ["upgrades", [2]]], unlocked() { return player.gk.points.gte(8000) || hasUpgrade("gk", 15) } },
            "三轮冲刺": { content: [["blank", "8px"], ["upgrades", [3]]], unlocked() { return player.gk.points.gte(3e5) || hasUpgrade("gk", 25) } },
            "终极押题": { content: [["blank", "8px"], ["upgrades", [4]]], unlocked() { return player.gk.points.gte(1e8) || hasUpgrade("gk", 35) } },
            "复读": { content: [["blank", "8px"], ["upgrades", [5]]], unlocked() { return player.gk.examDone } },
        },
    },
    // 25 件模考商店升级（costs 阶梯 100 → 4e11）
    upgrades: {
        11: {
            title: "错题焦虑缓解",
            description: "犯困惩罚减轻（×0.5 → ×0.6）。",
            cost: new Decimal(100),
            effect() { return new Decimal(0.6) },
            effectDisplay() { return "犯困 ×" + format(this.effect()) },
        },
        12: {
            title: "考场直觉",
            description: "课间抢答的专注奖励 ×2。",
            cost: new Decimal(250),
        },
        13: {
            title: "押题大师",
            description: "押题卷不再「押偏」（duds 清零）。",
            cost: new Decimal(600),
        },
        14: {
            title: "名师答疑",
            description: "错题消化速度 ×1.5。",
            cost: new Decimal(1500),
        },
        15: {
            title: "考点归纳",
            description: "全科目结算 ×1.1。",
            cost: new Decimal(4000),
            effect() { return new Decimal(1.1) },
            effectDisplay() { return "×" + format(this.effect()) },
        },
        21: {
            title: "早读效率",
            description: "早读系数 0.5 → 0.75。",
            cost: new Decimal(1e4),
        },
        22: {
            title: "精力补给站",
            description: "精力上限 +20。",
            cost: new Decimal(2.5e4),
            effect() { return new Decimal(20) },
            effectDisplay() { return "+" + format(this.effect()) + " 上限" },
        },
        23: {
            title: "错题本传家宝",
            description: "消化错题的熟练度再 ×2。",
            cost: new Decimal(6e4),
        },
        24: {
            title: "自习室灯更亮",
            description: "晚修系数 0.8 → 1.0。",
            cost: new Decimal(1.5e5),
        },
        25: {
            title: "旗开得胜",
            description: "限时训练得分率 ×1.3。",
            cost: new Decimal(4e5),
        },
        31: {
            title: "语文专题",
            description: "语文结算 ×1.15。",
            cost: new Decimal(1e6),
            effect() { return new Decimal(1.15) },
            effectDisplay() { return "×" + format(this.effect()) },
        },
        32: {
            title: "数学专题",
            description: "数学结算 ×1.15。",
            cost: new Decimal(2.5e6),
            effect() { return new Decimal(1.15) },
            effectDisplay() { return "×" + format(this.effect()) },
        },
        33: {
            title: "英语专题",
            description: "英语结算 ×1.15。",
            cost: new Decimal(6e6),
            effect() { return new Decimal(1.15) },
            effectDisplay() { return "×" + format(this.effect()) },
        },
        34: {
            title: "理综合练",
            description: "物理/化学/生物结算 ×1.1。",
            cost: new Decimal(1.5e7),
            effect() { return new Decimal(1.1) },
            effectDisplay() { return "×" + format(this.effect()) },
        },
        35: {
            title: "全科冲刺",
            description: "全科目结算 ×1.05。",
            cost: new Decimal(4e7),
            effect() { return new Decimal(1.05) },
            effectDisplay() { return "×" + format(this.effect()) },
        },
        41: {
            title: "题型套路大全",
            description: "全科分数软帽起点 +3。",
            cost: new Decimal(1e8),
        },
        42: {
            title: "熟练度大师",
            description: "熟练度等级上限 +5。",
            cost: new Decimal(2.5e8),
        },
        43: {
            title: "劳逸结合",
            description: "上课精力消耗 -25%。",
            cost: new Decimal(6e8),
        },
        44: {
            title: "睡眠质量",
            description: "元气结算 ×1.5。",
            cost: new Decimal(1.5e9),
            effect() { return new Decimal(1.5) },
            effectDisplay() { return "×" + format(this.effect()) },
        },
        45: {
            title: "押题护体",
            description: "押题 buff 不再随午夜消失（持续到被覆盖）。",
            cost: new Decimal(4e9),
        },
        51: {
            title: "复读一年",
            fullDisplay() {
                return "<b>复读一年</b><br>再来一次百日。保留：录取通知书、成就、熟练度、笔记与元气。<br>重置：高考成绩与全部学业进度。<br><br>（免费——但你知道那意味着什么）"
            },
            canAfford() { return player.gk.examDone },
            pay() {
                player.gk.examDone = false
                player.gk.examResult = new Decimal(0)
                player.gk.medals = (player.gk.medals || 0) + 1
                player.oathDay0 = dayStartStamp() // 新百日：今天重新成为第 1 天
                player.lastRollover = -1          // 让树页日切换重置每日状态
                player.keepGoing = false          // 下次高考再次弹出终局屏
                tmp.gameEnded = false             // 清除本局终局冻结标记（引擎 tmp，刷新后本就重置）
            },
        },
    },
    milestones: {
        0: {
            requirementDescription: "模考预测 300 分",
            effectDescription: "每日 +1 押题券",
            done() { return totalScore() >= 300 },
        },
        1: {
            requirementDescription: "模考预测 400 分",
            effectDescription: "模考积分积累 ×1.5",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return totalScore() >= 400 },
        },
        2: {
            requirementDescription: "模考预测 450 分",
            effectDescription: "全科目专注积累 ×1.02",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return totalScore() >= 450 },
        },
        3: {
            requirementDescription: "模考预测 500 分（过本科线）",
            effectDescription: "每日押题券 +1（共 +2/天）",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return totalScore() >= 500 },
        },
        4: {
            requirementDescription: "模考预测 550 分",
            effectDescription: "全科目结算 ×1.02",
            unlocked() { return hasMilestone(this.layer, 3) },
            done() { return totalScore() >= 550 },
        },
        5: {
            requirementDescription: "模考预测 600 分（重点线）",
            effectDescription: "模考积分积累 ×2",
            unlocked() { return hasMilestone(this.layer, 4) },
            done() { return totalScore() >= 600 },
        },
        6: {
            requirementDescription: "模考预测 650 分",
            effectDescription: "全科目专注积累 ×1.03",
            unlocked() { return hasMilestone(this.layer, 5) },
            done() { return totalScore() >= 650 },
        },
        7: {
            requirementDescription: "模考预测 700 分",
            effectDescription: "全科目结算 ×1.03",
            unlocked() { return hasMilestone(this.layer, 6) },
            done() { return totalScore() >= 700 },
        },
        8: {
            requirementDescription: "模考预测 720 分",
            effectDescription: "全科目专注积累 ×1.05",
            unlocked() { return hasMilestone(this.layer, 7) },
            done() { return totalScore() >= 720 },
        },
        9: {
            requirementDescription: "模考预测 750 分（满分）",
            effectDescription: "你已经无懈可击——去高考吧",
            unlocked() { return hasMilestone(this.layer, 8) },
            done() { return totalScore() >= 750 },
        },
    },
})
