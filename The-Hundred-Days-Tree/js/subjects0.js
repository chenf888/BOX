// subjects0.js — 语文 / 数学 / 英语（row 0，P8a custom 分数层：掌握→派生分数，硬帽150）
// 六科同构语义（tuning.js 通用乘区）；跨科效果 13 号升级各科源不同，内联在各层。

// ===================== 语文 =====================
addLayer("chi", {
    startUnlocked: true, // 检查器标记：本层 startData 即 unlocked（Gaokao P8a 模式，随时开放）
    name: "语文",
    symbol: "语",
    position: 0,
    color: "#ff6b6b",
    resource: "语文掌握",
    row: 0,
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            total: new Decimal(0),
            best: new Decimal(0),
            att: new Decimal(0),   // 语文专注池（baseResource）
            notes: new Decimal(0), // 语文笔记（升级货币，onPrestige 累积）
            mastery: 0,            // 熟练度点（普通数值）
        }
    },
    baseResource: "语文专注",
    baseAmount() { return player.chi.att },
    requires: new Decimal(0),
    type: "custom",
    resetsNothing() { return true }, // 结算不清任何东西（引擎先入账后短路，game.js:196/211）
    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        layerDataReset(this.layer, ["unlocked", "best", "total", "milestones", "notes", "buyables", "mastery"])
    },
    canReset() { if ((player.chi.resetTime || 0) < TUNING.SETTLE_COOLDOWN) return false // 结算冷却
        return player.chi.att.gte(1) },
    autoPrestige() { return hasMilestone("eve", 3) && !periodFeeds(this.layer) && player.chi.att.gte(1) },
    getResetGain() {
        var g = player.chi.att.div(TUNING.SETTLE_DIV).pow(TUNING.SETTLE_POW).times(subjectSettleMult("chi"))
        if (inChallenge("train", 11)) g = g.root(2) // 限时测：语文结算开平方
        return g
    },
    getNextAt() { return new Decimal(0) }, // 随时可结算（D-CUSTOMNEXTAT 必须定义）
    prestigeButtonText() {
        return "下课结算<br>+" + format(tmp.chi.resetGain) + " 掌握"
    },
    onPrestige(gain) {
        player.chi.notes = player.chi.notes.add(gain)
        player.chi.att = new Decimal(0) // 结算消耗专注池（resetsNothing 下引擎不清 baseAmount，手动消耗）
    },
    layerShown() { return player.chi.unlocked },
    hotkeys: [
        { key: "q", description: "q: 语文下课结算", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    update(diff) {
        if (!player.chi.unlocked) return
        var p = currentPeriod()
        if (isGaokaoDay() || !p.subj || p.subj.indexOf("chi") < 0) return
        var fed = p.id === "mread" ? (safeUpgrade("gk", 21) ? 0.75 : TUNING.ATT_READ_FACTOR) : 1 // 早读效率
        var rate = TUNING.ATT_RATE * fed
        rate *= isSignedNow() ? TUNING.ATT_SIGNED : absentFloor()
        rate *= energyFactor()
        rate *= subjectAccrualMult("chi")
        player.chi.att = player.chi.att.add(rate * diff)
    },
    tabFormat: [
        ["display-text", function () {
            var sc = subjectScore("chi")
            var start = Math.min(150, 120 + 2 * masteryLevel("chi") + (safeUpgrade("chi", 22) ? 5 : 0))
            return "<b style='font-size:1.5em;color:#ff6b6b'>语文 " + sc.toFixed(1) + "</b> / 150" +
                (start < 150 ? "　<span style='opacity:.6'>软帽起点 " + start + "（熟练度可推迟）</span>" : "　<span style='color:#51cf66'>软帽已消除</span>")
        }],
        ["display-text", function () {
            return "掌握 " + format(player.chi.points) + "（累计 " + format(player.chi.total) + "）· 笔记 " + format(player.chi.notes) +
                " · 专注池 " + formatWhole(player.chi.att)
        }],
        "prestige-button",
        ["display-text", function () {
            var p = currentPeriod()
            if (p.subj && p.subj.indexOf("chi") >= 0) {
                var r = "正在上课：" + p.name + "，专注积累中 ×" + (isSignedNow() ? "1.0" : absentFloor())
                return r + (player.energy < TUNING.ENERGY_LOW ? "（犯困 ×0.5）" : "")
            }
            return "<span style='opacity:.6'>当前时段没有语文课——专注只在语文课/早读流动</span>"
        }],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "升级": { content: [["blank", "8px"], "upgrades"] },
            "里程碑": { content: [["blank", "8px"], "milestones"] },
            "教辅": {
                content: [["blank", "8px"],
                    ["display-text", function () { return "元气（作息层）买的营养品与闹钟在作息页；这里用<b>语文笔记</b>买教辅。" }],
                    "buyables"],
                unlocked() { return safeUpgrade("chi", 15) },
            },
            "说明": {
                content: [["blank", "8px"], ["infobox", "howto"]],
            },
        },
    },
    infoboxes: {
        howto: {
            title: "语文怎么学",
            body() { return "上课时段（早读/第一节/晚修四）专注自动流入语文池——<b>签到</b>后全效率，缺席 ×" + absentFloor() + "。<br>下课按「下课结算」把专注池换成掌握；分数是掌握的派生值，永不倒退。<br>课间抢答答对语文题 → 专注奖励 + 熟练度；熟练度等级推迟分数软帽起点。" },
        },
    },
    upgrades: {
        11: {
            title: "预习课本",
            description: "昨晚预习了——语文专注积累 ×1.3。",
            cost: new Decimal(1),
            currencyDisplayName: "语文笔记",
            currencyInternalName: "notes",
            currencyLayer: "chi",
        },
        12: {
            title: "课堂笔记",
            description: "笔记工整，复习省力——语文结算 ×1.3。",
            cost: new Decimal(3),
            currencyDisplayName: "语文笔记",
            currencyInternalName: "notes",
            currencyLayer: "chi",
        },
        13: {
            title: "向数学院士请教",
            description: "数学思维反哺阅读理解——语文结算随数学掌握增长。",
            cost: new Decimal(10),
            currencyDisplayName: "语文笔记",
            currencyInternalName: "notes",
            currencyLayer: "chi",
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return player.mat.points.add(1).log10().add(1).pow(0.5) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        14: {
            title: "语感强化",
            description: "熟练度带来的结算加成变为 ^1.1。",
            cost: new Decimal(40),
            currencyDisplayName: "语文笔记",
            currencyInternalName: "notes",
            currencyLayer: "chi",
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        15: {
            title: "教辅·五年高考三年模拟",
            description: "解锁语文教辅（可反复购买，笔记结算）。",
            cost: new Decimal(150),
            currencyDisplayName: "语文笔记",
            currencyInternalName: "notes",
            currencyLayer: "chi",
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        21: {
            title: "深呼吸",
            description: "早读与晚修四时段：语文专注积累 ×1.5。",
            cost: new Decimal(500),
            currencyDisplayName: "语文笔记",
            currencyInternalName: "notes",
            currencyLayer: "chi",
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
        22: {
            title: "古文通达",
            description: "语文分数软帽起点 +5（上限显示在页首）。",
            cost: new Decimal(1500),
            currencyDisplayName: "语文笔记",
            currencyInternalName: "notes",
            currencyLayer: "chi",
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
        23: {
            title: "错题本常翻",
            description: "错题池反哺语文——结算随错题池缓慢增长。",
            cost: new Decimal(4000),
            currencyDisplayName: "语文笔记",
            currencyInternalName: "notes",
            currencyLayer: "chi",
            unlocked() { return hasUpgrade(this.layer, 22) },
            effect() { return new Decimal(1 + Math.pow(player.wrongPool || 0, 0.3) * 0.1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: {
            title: "心无旁骛",
            description: "语文专注积累 ×1.8。",
            cost: new Decimal(1e4),
            currencyDisplayName: "语文笔记",
            currencyInternalName: "notes",
            currencyLayer: "chi",
            unlocked() { return hasUpgrade(this.layer, 23) },
        },
        25: {
            title: "语文课代表",
            description: "你的自律感染全班——全科目专注积累 ×1.05。",
            cost: new Decimal(2.5e4),
            currencyDisplayName: "语文笔记",
            currencyInternalName: "notes",
            currencyLayer: "chi",
            unlocked() { return hasUpgrade(this.layer, 24) },
        },
    },
    milestones: {
        0: {
            requirementDescription: "一节课攒 1200 语文专注（约半节满勤课）",
            effectDescription: "语文结算 ×1.5",
            done() { return player.chi.att.gte(1200) },
        },
        1: {
            requirementDescription: "累计结算 25 语文掌握",
            effectDescription: "语文专注积累 ×1.3",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player.chi.total.gte(25) },
        },
        2: {
            requirementDescription: "语文熟练度 5 级（75 点）",
            effectDescription: "晚修四消化错题的速度 ×2",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return (player.chi.mastery || 0) >= 75 },
        },
        3: {
            requirementDescription: "语文 100 分",
            effectDescription: "全科目专注积累 ×1.02",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return subjectScore("chi") >= 100 },
        },
    },
    buyables: {
        11: {
            title: "《五年高考三年模拟》",
            cost(x) { return new Decimal(50).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.15, x) },
            display() {
                return "语文专注积累 ×" + format(this.effect(getBuyableAmount(this.layer, this.id))) +
                    "<br>等级：" + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>费用：" + format(this.cost(getBuyableAmount(this.layer, this.id))) + " 语文笔记"
            },
            canAfford() { return player.chi.notes.gte(tmp.chi.buyables[11].cost) },
            buy() {
                var c = tmp.chi.buyables[11].cost
                player.chi.notes = player.chi.notes.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
    },
})

// ===================== 数学 =====================
addLayer("mat", {
    startUnlocked: true, // 检查器标记：本层 startData 即 unlocked（Gaokao P8a 模式，随时开放）
    name: "数学",
    symbol: "数",
    position: 1,
    color: "#4dabf7",
    resource: "数学掌握",
    row: 0,
    branches: ["chi"],
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            total: new Decimal(0),
            best: new Decimal(0),
            att: new Decimal(0),
            notes: new Decimal(0),
            mastery: 0,
        }
    },
    baseResource: "数学专注",
    baseAmount() { return player.mat.att },
    requires: new Decimal(0),
    type: "custom",
    resetsNothing() { return true },
    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        layerDataReset(this.layer, ["unlocked", "best", "total", "milestones", "notes", "buyables", "mastery"])
    },
    canReset() { if ((player.mat.resetTime || 0) < TUNING.SETTLE_COOLDOWN) return false // 结算冷却
        return player.mat.att.gte(1) },
    autoPrestige() { return hasMilestone("eve", 3) && !periodFeeds(this.layer) && player.mat.att.gte(1) },
    getResetGain() {
        var g = player.mat.att.div(TUNING.SETTLE_DIV).pow(TUNING.SETTLE_POW).times(subjectSettleMult("mat"))
        if (inChallenge("train", 12)) g = g.times(0.5) // 限时测：数学结算减半
        return g
    },
    getNextAt() { return new Decimal(0) },
    prestigeButtonText() {
        return "下课结算<br>+" + format(tmp.mat.resetGain) + " 掌握"
    },
    onPrestige(gain) {
        player.mat.notes = player.mat.notes.add(gain)
        player.mat.att = new Decimal(0) // 结算消耗专注池
    },
    layerShown() { return player.mat.unlocked },
    hotkeys: [
        { key: "w", description: "w: 数学下课结算", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    update(diff) {
        if (!player.mat.unlocked) return
        var p = currentPeriod()
        if (isGaokaoDay() || !p.subj || p.subj.indexOf("mat") < 0) return
        var rate = TUNING.ATT_RATE
        rate *= isSignedNow() ? TUNING.ATT_SIGNED : absentFloor()
        rate *= energyFactor()
        rate *= subjectAccrualMult("mat")
        player.mat.att = player.mat.att.add(rate * diff)
    },
    tabFormat: [
        ["display-text", function () {
            var sc = subjectScore("mat")
            var start = Math.min(150, 120 + 2 * masteryLevel("mat") + (safeUpgrade("mat", 22) ? 5 : 0))
            return "<b style='font-size:1.5em;color:#4dabf7'>数学 " + sc.toFixed(1) + "</b> / 150" +
                (start < 150 ? "　<span style='opacity:.6'>软帽起点 " + start + "（熟练度可推迟）</span>" : "　<span style='color:#51cf66'>软帽已消除</span>")
        }],
        ["display-text", function () {
            return "掌握 " + format(player.mat.points) + "（累计 " + format(player.mat.total) + "）· 笔记 " + format(player.mat.notes) +
                " · 专注池 " + formatWhole(player.mat.att)
        }],
        "prestige-button",
        ["display-text", function () {
            var p = currentPeriod()
            if (p.subj && p.subj.indexOf("mat") >= 0)
                return "正在上课：" + p.name + "，专注积累中 ×" + (isSignedNow() ? "1.0" : absentFloor()) + (player.energy < TUNING.ENERGY_LOW ? "（犯困 ×0.5）" : "")
            return "<span style='opacity:.6'>当前时段没有数学课</span>"
        }],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "升级": { content: [["blank", "8px"], "upgrades"] },
            "里程碑": { content: [["blank", "8px"], "milestones"] },
            "教辅": {
                content: [["blank", "8px"],
                    ["display-text", function () { return "用<b>数学笔记</b>买教辅，永久提升数学专注积累。" }],
                    "buyables"],
                unlocked() { return safeUpgrade("mat", 15) },
            },
            "说明": { content: [["blank", "8px"], ["infobox", "howto"]] },
        },
    },
    infoboxes: {
        howto: {
            title: "数学怎么学",
            body() { return "第二、七节与晚修一是数学课。<br>答错的数学题进错题本——错题池通过 23 号升级反哺数学结算。<br>熟练度 5 级奖励 3 张押题券（晚修页抽卡）。" },
        },
    },
    upgrades: {
        11: {
            title: "先刷一遍例题",
            description: "数学专注积累 ×1.3。",
            cost: new Decimal(1),
            currencyDisplayName: "数学笔记",
            currencyInternalName: "notes",
            currencyLayer: "mat",
        },
        12: {
            title: "草稿纸分块",
            description: "过程清晰不丢步——数学结算 ×1.3。",
            cost: new Decimal(3),
            currencyDisplayName: "数学笔记",
            currencyInternalName: "notes",
            currencyLayer: "mat",
        },
        13: {
            title: "错题反哺",
            description: "错题池越厚，数学结算越快（错题池^0.3 加成）。",
            cost: new Decimal(10),
            currencyDisplayName: "数学笔记",
            currencyInternalName: "notes",
            currencyLayer: "mat",
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return new Decimal(1 + Math.pow(player.wrongPool || 0, 0.3) * 0.1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        14: {
            title: "题感强化",
            description: "熟练度带来的结算加成变为 ^1.1。",
            cost: new Decimal(40),
            currencyDisplayName: "数学笔记",
            currencyInternalName: "notes",
            currencyLayer: "mat",
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        15: {
            title: "教辅·真题全刷",
            description: "解锁数学教辅。",
            cost: new Decimal(150),
            currencyDisplayName: "数学笔记",
            currencyInternalName: "notes",
            currencyLayer: "mat",
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        21: {
            title: "晚修刷题状态",
            description: "第二节与晚修一时段：数学专注积累 ×1.5。",
            cost: new Decimal(500),
            currencyDisplayName: "数学笔记",
            currencyInternalName: "notes",
            currencyLayer: "mat",
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
        22: {
            title: "压轴题手感",
            description: "数学分数软帽起点 +5。",
            cost: new Decimal(1500),
            currencyDisplayName: "数学笔记",
            currencyInternalName: "notes",
            currencyLayer: "mat",
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
        23: {
            title: "数形结合",
            description: "语文掌握反哺数学审题——结算随语文掌握增长。",
            cost: new Decimal(4000),
            currencyDisplayName: "数学笔记",
            currencyInternalName: "notes",
            currencyLayer: "mat",
            unlocked() { return hasUpgrade(this.layer, 22) },
            effect() { return player.chi.points.add(1).log10().add(1).pow(0.5) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: {
            title: "心流模式",
            description: "数学专注积累 ×1.8。",
            cost: new Decimal(1e4),
            currencyDisplayName: "数学笔记",
            currencyInternalName: "notes",
            currencyLayer: "mat",
            unlocked() { return hasUpgrade(this.layer, 23) },
        },
        25: {
            title: "数学课代表",
            description: "全科目专注积累 ×1.05。",
            cost: new Decimal(2.5e4),
            currencyDisplayName: "数学笔记",
            currencyInternalName: "notes",
            currencyLayer: "mat",
            unlocked() { return hasUpgrade(this.layer, 24) },
        },
    },
    milestones: {
        0: {
            requirementDescription: "一节课攒 1200 数学专注",
            effectDescription: "数学结算 ×1.5",
            done() { return player.mat.att.gte(1200) },
        },
        1: {
            requirementDescription: "累计结算 25 数学掌握",
            effectDescription: "数学专注积累 ×1.3",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player.mat.total.gte(25) },
        },
        2: {
            requirementDescription: "数学熟练度 5 级（75 点）",
            effectDescription: "获得 3 张押题券",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return (player.mat.mastery || 0) >= 75 },
            onComplete() {
                if (player.eve) player.eve.tickets = (player.eve.tickets || 0) + 3
            },
        },
        3: {
            requirementDescription: "数学 100 分",
            effectDescription: "全科目专注积累 ×1.02",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return subjectScore("mat") >= 100 },
        },
    },
    buyables: {
        11: {
            title: "《真题全刷·基础2000》",
            cost(x) { return new Decimal(50).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.15, x) },
            display() {
                return "数学专注积累 ×" + format(this.effect(getBuyableAmount(this.layer, this.id))) +
                    "<br>等级：" + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>费用：" + format(this.cost(getBuyableAmount(this.layer, this.id))) + " 数学笔记"
            },
            canAfford() { return player.mat.notes.gte(tmp.mat.buyables[11].cost) },
            buy() {
                var c = tmp.mat.buyables[11].cost
                player.mat.notes = player.mat.notes.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
    },
})

// ===================== 英语 =====================
addLayer("eng", {
    startUnlocked: true, // 检查器标记：本层 startData 即 unlocked（Gaokao P8a 模式，随时开放）
    name: "英语",
    symbol: "英",
    position: 2,
    color: "#51cf66",
    resource: "英语掌握",
    row: 0,
    branches: ["chi"],
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            total: new Decimal(0),
            best: new Decimal(0),
            att: new Decimal(0),
            notes: new Decimal(0),
            mastery: 0,
        }
    },
    baseResource: "英语专注",
    baseAmount() { return player.eng.att },
    requires: new Decimal(0),
    type: "custom",
    resetsNothing() { return true },
    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        layerDataReset(this.layer, ["unlocked", "best", "total", "milestones", "notes", "buyables", "mastery"])
    },
    canReset() { if ((player.eng.resetTime || 0) < TUNING.SETTLE_COOLDOWN) return false // 结算冷却
        return player.eng.att.gte(1) },
    autoPrestige() { return hasMilestone("eve", 3) && !periodFeeds(this.layer) && player.eng.att.gte(1) },
    getResetGain() {
        return player.eng.att.div(TUNING.SETTLE_DIV).pow(TUNING.SETTLE_POW).times(subjectSettleMult("eng"))
    },
    getNextAt() { return new Decimal(0) },
    prestigeButtonText() {
        return "下课结算<br>+" + format(tmp.eng.resetGain) + " 掌握"
    },
    onPrestige(gain) {
        player.eng.notes = player.eng.notes.add(gain)
        player.eng.att = new Decimal(0) // 结算消耗专注池
    },
    layerShown() { return player.eng.unlocked },
    hotkeys: [
        { key: "e", description: "e: 英语下课结算", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    update(diff) {
        if (!player.eng.unlocked) return
        var p = currentPeriod()
        if (isGaokaoDay() || !p.subj || p.subj.indexOf("eng") < 0) return
        var fed = p.id === "mread" ? (safeUpgrade("gk", 21) ? 0.75 : TUNING.ATT_READ_FACTOR) : 1 // 早读效率
        var rate = TUNING.ATT_RATE * fed
        if (inChallenge("train", 13)) rate *= 0.5 // 英语限时测：积累减半
        if (hasMilestone("eng", 2)) rate *= 1.5 // 词汇量里程碑（英语专属）
        rate *= isSignedNow() ? TUNING.ATT_SIGNED : absentFloor()
        rate *= energyFactor()
        rate *= subjectAccrualMult("eng")
        player.eng.att = player.eng.att.add(rate * diff)
    },
    tabFormat: [
        ["display-text", function () {
            var sc = subjectScore("eng")
            var start = Math.min(150, 120 + 2 * masteryLevel("eng") + (safeUpgrade("eng", 22) ? 5 : 0))
            return "<b style='font-size:1.5em;color:#51cf66'>英语 " + sc.toFixed(1) + "</b> / 150" +
                (start < 150 ? "　<span style='opacity:.6'>软帽起点 " + start + "（熟练度可推迟）</span>" : "　<span style='color:#51cf66'>软帽已消除</span>")
        }],
        ["display-text", function () {
            return "掌握 " + format(player.eng.points) + "（累计 " + format(player.eng.total) + "）· 笔记 " + format(player.eng.notes) +
                " · 专注池 " + formatWhole(player.eng.att)
        }],
        "prestige-button",
        ["display-text", function () {
            var p = currentPeriod()
            if (p.subj && p.subj.indexOf("eng") >= 0)
                return "正在上课：" + p.name + "，专注积累中 ×" + (isSignedNow() ? "1.0" : absentFloor()) + (player.energy < TUNING.ENERGY_LOW ? "（犯困 ×0.5）" : "")
            return "<span style='opacity:.6'>当前时段没有英语课</span>"
        }],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "升级": { content: [["blank", "8px"], "upgrades"] },
            "里程碑": { content: [["blank", "8px"], "milestones"] },
            "教辅": {
                content: [["blank", "8px"],
                    ["display-text", function () { return "用<b>英语笔记</b>买教辅。" }],
                    "buyables"],
                unlocked() { return safeUpgrade("eng", 15) },
            },
            "说明": { content: [["blank", "8px"], ["infobox", "howto"]] },
        },
    },
    infoboxes: {
        howto: {
            title: "英语怎么学",
            body() { return "早读（与语文共享）、第三节与晚修二是英语时段。<br>词汇量里程碑让英语积累永久 ×1.5。" },
        },
    },
    upgrades: {
        11: {
            title: "晨读打卡",
            description: "英语专注积累 ×1.3。",
            cost: new Decimal(1),
            currencyDisplayName: "英语笔记",
            currencyInternalName: "notes",
            currencyLayer: "eng",
        },
        12: {
            title: "摘抄本",
            description: "好句随手记——英语结算 ×1.3。",
            cost: new Decimal(3),
            currencyDisplayName: "英语笔记",
            currencyInternalName: "notes",
            currencyLayer: "eng",
        },
        13: {
            title: "语文底子",
            description: "阅读理解靠母语功底——英语结算随语文掌握增长。",
            cost: new Decimal(10),
            currencyDisplayName: "英语笔记",
            currencyInternalName: "notes",
            currencyLayer: "eng",
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return player.chi.points.add(1).log10().add(1).pow(0.5) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        14: {
            title: "语感强化",
            description: "熟练度带来的结算加成变为 ^1.1。",
            cost: new Decimal(40),
            currencyDisplayName: "英语笔记",
            currencyInternalName: "notes",
            currencyLayer: "eng",
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        15: {
            title: "教辅·3500词",
            description: "解锁英语教辅。",
            cost: new Decimal(150),
            currencyDisplayName: "英语笔记",
            currencyInternalName: "notes",
            currencyLayer: "eng",
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        21: {
            title: "听力磨耳朵",
            description: "早读与晚修二时段：英语专注积累 ×1.5。",
            cost: new Decimal(500),
            currencyDisplayName: "英语笔记",
            currencyInternalName: "notes",
            currencyLayer: "eng",
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
        22: {
            title: "作文模板",
            description: "英语分数软帽起点 +5。",
            cost: new Decimal(1500),
            currencyDisplayName: "英语笔记",
            currencyInternalName: "notes",
            currencyLayer: "eng",
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
        23: {
            title: "错题本常翻",
            description: "错题池反哺英语——结算随错题池缓慢增长。",
            cost: new Decimal(4000),
            currencyDisplayName: "英语笔记",
            currencyInternalName: "notes",
            currencyLayer: "eng",
            unlocked() { return hasUpgrade(this.layer, 22) },
            effect() { return new Decimal(1 + Math.pow(player.wrongPool || 0, 0.3) * 0.1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: {
            title: "沉浸式背单词",
            description: "英语专注积累 ×1.8。",
            cost: new Decimal(1e4),
            currencyDisplayName: "英语笔记",
            currencyInternalName: "notes",
            currencyLayer: "eng",
            unlocked() { return hasUpgrade(this.layer, 23) },
        },
        25: {
            title: "英语课代表",
            description: "全科目专注积累 ×1.05。",
            cost: new Decimal(2.5e4),
            currencyDisplayName: "英语笔记",
            currencyInternalName: "notes",
            currencyLayer: "eng",
            unlocked() { return hasUpgrade(this.layer, 24) },
        },
    },
    milestones: {
        0: {
            requirementDescription: "一节课攒 1200 英语专注",
            effectDescription: "英语结算 ×1.5",
            done() { return player.eng.att.gte(1200) },
        },
        1: {
            requirementDescription: "累计结算 25 英语掌握",
            effectDescription: "英语专注积累 ×1.3",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player.eng.total.gte(25) },
        },
        2: {
            requirementDescription: "英语熟练度 5 级（75 点）",
            effectDescription: "英语专注积累永久 ×1.5（词汇量上来了）",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return (player.eng.mastery || 0) >= 75 },
        },
        3: {
            requirementDescription: "英语 100 分",
            effectDescription: "全科目专注积累 ×1.02",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return subjectScore("eng") >= 100 },
        },
    },
    buyables: {
        11: {
            title: "《3500词·乱序版》",
            cost(x) { return new Decimal(50).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.15, x) },
            display() {
                return "英语专注积累 ×" + format(this.effect(getBuyableAmount(this.layer, this.id))) +
                    "<br>等级：" + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>费用：" + format(this.cost(getBuyableAmount(this.layer, this.id))) + " 英语笔记"
            },
            canAfford() { return player.eng.notes.gte(tmp.eng.buyables[11].cost) },
            buy() {
                var c = tmp.eng.buyables[11].cost
                player.eng.notes = player.eng.notes.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
    },
})
