// life.js — 作息层（row 1）：精力经济（活动 clickables + 精力条）+ 就寝结算元气
// 精力/休息累计是全局值 player.energy / player.rested（addedPlayerData），本层消费/结算它们。

// 元气结算乘区（文件级助手；升级 21/22 的消费者）
function vigourMult() {
    var m = new Decimal(TUNING.VIGOUR_BASE)
    if (safeUpgrade("life", 21)) m = m.times(upgradeEffect("life", 21)) // 规律作息 ×1.5
    m = m.times(gkVigourMult()) // 睡眠质量（gk.js 单点定义）
    return m
}

addLayer("life", {
    name: "作息",
    symbol: "息",
    position: 3,
    color: "#ffd43b",
    resource: "元气",
    row: 1,
    branches: ["chi"],
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            total: new Decimal(0),
            best: new Decimal(0),
            sleeps: 0,          // 就寝次数（普通数值）
            usedToday: [],      // 今日已用的活动 id
        }
    },
    baseResource: "今日作息恢复",
    baseAmount() { return new Decimal(player.rested || 0) },
    requires: new Decimal(0),
    type: "custom",
    resetsNothing() { return true },
    // 手动就寝窗口 19:00 后；自动就寝由 autoPrestige 通路在日切换时触发（OQ 裁定）
    canReset() {
        if (player.sleepToday || (player.rested || 0) < 1) return false
        return !!player.autoSleepNow || minutesToday() >= 1140
    },
    getResetGain() {
        var base = new Decimal(player.rested || 0).div(TUNING.VIGOUR_DIV).max(0)
        var pow = TUNING.VIGOUR_POW + (safeUpgrade("life", 22) ? upgradeEffect("life", 22) : 0) // K4：深度睡眠改公式
        var gain = base.pow(pow).times(vigourMult())
        if (!player.autoSleepNow || safeUpgrade("life", 23)) gain = gain.times(TUNING.VIGOUR_MANUAL) // 手动规律作息 ×1.2；周末补觉让补结也全额
        return gain
    },
    getNextAt() { return new Decimal(0) },
    prestigeButtonText() {
        if (player.sleepToday) return "已就寝<br>明天 5:40 起床"
        return "就寝结算<br>+" + format(tmp.life.resetGain) + " 元气"
    },
    onPrestige(gain) {
        player.sleepToday = true
        player.autoSleepNow = false
        player.rested = 0
        player.energy = energyMax() // 一夜好眠，精力回满
        player.life.sleeps = (player.life.sleeps || 0) + 1
    },
    automate() {
        // 自动就寝：日切换置 autoSleepNow（tree-tab.update），在此引擎循环上下文消费
        if (player.autoSleepNow === true && !player.sleepToday && tmp.life.canReset) doReset("life")
    },
    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        layerDataReset(this.layer, ["unlocked", "points", "best", "total", "milestones", "upgrades", "buyables", "sleeps"])
    },
    layerShown() { return player.life.unlocked },
    tabFormat: [
        ["display-text", function () {
            return "<b style='font-size:1.5em;color:#ffd43b'>元气 " + format(player.life.points) + "</b>（累计 " + format(player.life.total) + "）"
        }],
        ["bar", "energy"],
        ["display-text", function () {
            var used = player.life.usedToday || []
            var done = player.sleepToday ? "<span style='color:#51cf66'>✔ 今日已就寝</span>" : "今日未就寝"
            return "今日作息恢复 " + Math.floor(player.rested || 0) + " · 就寝 " + (player.life.sleeps || 0) + " 次 · " + done
        }],
        "prestige-button",
        ["display-text", function () {
            return player.sleepToday ? "" : "<span style='opacity:.7'>手动就寝（19:00 后）结算 ×1.2；忘了睡也不怕，5:40 自动补结 ×1.0</span>"
        }],
        ["row", [
            ["clickable", 11], ["clickable", 12], ["clickable", 13], ["clickable", 14], ["clickable", 15],
        ]],
        ["microtabs", "stuff"],
    ],
    bars: {
        energy: {
            direction: RIGHT,
            width: 320, height: 26,
            progress() { return Math.min(1, (player.energy || 0) / energyMax()) },
            display() { return "精力 " + Math.floor(player.energy || 0) + " / " + energyMax() },
            fillStyle() { return { 'background-color': (player.energy || 0) < energyLowLine() ? '#e8590c' : '#ffd43b' } },
            baseStyle: { 'background-color': '#3a3a3a' },
            textStyle: { 'color': '#111' },
        },
    },
    clickables: {
        11: {
            title: "跑操",
            display() { return "🏃 跑操<br>+" + Math.floor(TUNING.ACT_ENERGY.exercise * lifeActMult()) + " 精力" },
            canClick() { return currentPeriod().act === "exercise" && (player.life.usedToday || []).indexOf("exercise") < 0 },
            onClick() { lifeDoActivity("exercise") },
        },
        12: {
            title: "早餐",
            display() { return "🥟 早餐<br>+" + Math.floor(TUNING.ACT_ENERGY.breakfast * lifeActMult()) + " 精力" },
            canClick() { return currentPeriod().act === "breakfast" && (player.life.usedToday || []).indexOf("breakfast") < 0 },
            onClick() { lifeDoActivity("breakfast") },
        },
        13: {
            title: "午餐",
            display() { return "🍚 午餐<br>+" + Math.floor(TUNING.ACT_ENERGY.lunch * lifeActMult()) + " 精力" },
            canClick() { return currentPeriod().act === "lunch" && (player.life.usedToday || []).indexOf("lunch") < 0 },
            onClick() { lifeDoActivity("lunch") },
        },
        14: {
            title: "午休",
            display() { return "😴 午休<br>+" + Math.floor(TUNING.ACT_ENERGY.nap * lifeActMult()) + " 精力" },
            canClick() { return currentPeriod().act === "nap" && (player.life.usedToday || []).indexOf("nap") < 0 },
            onClick() { lifeDoActivity("nap") },
        },
        15: {
            title: "晚餐",
            display() { return "🍲 晚餐<br>+" + Math.floor(TUNING.ACT_ENERGY.dinner * lifeActMult()) + " 精力" },
            canClick() { return currentPeriod().act === "dinner" && (player.life.usedToday || []).indexOf("dinner") < 0 },
            onClick() { lifeDoActivity("dinner") },
        },
    },
    microtabs: {
        stuff: {
            "升级": { content: [["blank", "8px"], "upgrades"] },
            "里程碑": { content: [["blank", "8px"], "milestones"] },
            "营养品": {
                content: [["blank", "8px"],
                    ["display-text", function () { return "花元气买生活品质——营养品让全科专注更稳。" }],
                    "buyables"],
                unlocked() { return safeMilestone("life", 2) || getBuyableAmount("life", 11).gt(0) },
            },
            "说明": { content: [["blank", "8px"], ["infobox", "howto"]] },
        },
    },
    infoboxes: {
        howto: {
            title: "作息怎么过",
            body() { return "跑操/三餐/午休按时开放，点一次恢复精力（今日不重复）。<br>精力低于阈值会犯困，专注效率打折——按时吃饭午休是上午的精神来源。<br>19:00 后可手动「就寝结算」：把今日恢复量换算成元气（×1.2），精力回满；5:40 忘了睡会自动补结（×1.0）。" },
        },
    },
    upgrades: {
        11: {
            title: "热水澡",
            description: "晨起洗漱快一点——所有作息活动的精力恢复 ×1.3。",
            cost: new Decimal(1),
        },
        12: {
            title: "生物钟",
            description: "精力上限 +15（页首精力条可见）。",
            cost: new Decimal(2),
            effect() { return new Decimal(15) },
            effectDisplay() { return "+" + format(this.effect()) + " 上限" },
        },
        13: {
            title: "舒适床品",
            description: "夜间精力恢复 ×1.5。",
            cost: new Decimal(5),
        },
        14: {
            title: "课间远眺",
            description: "犯困线 -10（更晚才犯困）。",
            cost: new Decimal(12),
        },
        15: {
            title: "错题整理夜灯",
            description: "晚修四消化错题的速度 ×1.5。",
            cost: new Decimal(30),
        },
        21: {
            title: "规律作息",
            description: "元气结算 ×1.5。",
            cost: new Decimal(80),
            effect() { return new Decimal(1.5) },
            effectDisplay() { return "×" + format(this.effect()) },
        },
        22: {
            title: "深度睡眠",
            description: "元气公式的指数 +0.05（作息结算更丰厚）。",
            cost: new Decimal(200),
            effect() { return new Decimal(0.05) },
            effectDisplay() { return "+" + format(this.effect()) + " 指数" },
        },
        23: {
            title: "周末补觉",
            description: "日切换自动补结也按 ×1.2 计（不亏手动奖励）。",
            cost: new Decimal(500),
        },
        24: {
            title: "咖啡因依赖",
            description: "犯困惩罚从 ×0.5 减轻到 ×0.7。",
            cost: new Decimal(1200),
            effect() { return new Decimal(0.7) },
            effectDisplay() { return "犯困 ×" + format(this.effect()) },
        },
        25: {
            title: "生活的主人",
            description: "所有作息活动的精力恢复再 ×1.5。",
            cost: new Decimal(3000),
        },
    },
    milestones: {
        0: {
            requirementDescription: "今日作息恢复 60 精力",
            effectDescription: "精力上限 +10",
            done() { return (player.rested || 0) >= 60 },
        },
        1: {
            requirementDescription: "累计获得 10 元气",
            effectDescription: "全科目专注积累 ×1.1",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player.life.total.gte(10) },
        },
        2: {
            requirementDescription: "就寝 3 次",
            effectDescription: "解锁营养品",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return (player.life.sleeps || 0) >= 3 },
        },
        3: {
            requirementDescription: "累计获得 100 元气",
            effectDescription: "解锁闹钟",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player.life.total.gte(100) },
        },
        4: {
            requirementDescription: "累计获得 300 元气",
            effectDescription: "精力上限 +20",
            unlocked() { return hasMilestone(this.layer, 3) },
            done() { return player.life.total.gte(300) },
        },
    },
    buyables: {
        11: {
            title: "营养品",
            cost(x) { return new Decimal(8).times(Decimal.pow(1.8, x)) },
            effect(x) { return new Decimal(1 + 0.02 * x.toNumber()) },
            display() {
                return "全科专注积累 ×" + format(this.effect(getBuyableAmount(this.layer, this.id))) +
                    "<br>等级：" + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>费用：" + format(this.cost(getBuyableAmount(this.layer, this.id))) + " 元气"
            },
            canAfford() { return player.life.points.gte(tmp.life.buyables[11].cost) },
            buy() {
                var c = tmp.life.buyables[11].cost
                player.life.points = player.life.points.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                // P54 闭式 buyMax：8×1.8^n ≤ 元气 → n = log(元气×0.8/8)/log(1.8)（自动化的前置：公式可逆）
                var v = player.life.points.toNumber() * 0.8 / 8
                if (v <= 1) return
                var n = Math.floor(Math.log(v) / Math.log(1.8)) + 1
                var cur = getBuyableAmount(this.layer, this.id).toNumber()
                if (n > cur) setBuyableAmount(this.layer, this.id, new Decimal(n))
            },
            unlocked() { return hasMilestone("life", 2) },
        },
        12: {
            title: "闹钟",
            cost(x) { return new Decimal(15).times(Decimal.pow(2, x)) },
            effect(x) { return new Decimal(1 + 0.04 * x.toNumber()) },
            display() {
                return "早读与第一节的专注积累 ×" + format(this.effect(getBuyableAmount(this.layer, this.id))) +
                    "<br>等级：" + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>费用：" + format(this.cost(getBuyableAmount(this.layer, this.id))) + " 元气"
            },
            canAfford() { return player.life.points.gte(tmp.life.buyables[12].cost) },
            buy() {
                var c = tmp.life.buyables[12].cost
                player.life.points = player.life.points.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return hasMilestone("life", 3) },
        },
    },
})

// ---- 作息活动实现（被 clickables 调用；活动效果消费者在此）----
function lifeActMult() {
    var m = 1
    if (safeUpgrade("life", 11)) m *= 1.3
    if (safeUpgrade("life", 25)) m *= 1.5
    if (safeMilestone("life", 2)) m *= 1.5
    return m
}
function lifeDoActivity(id) {
    var p = currentPeriod()
    if (p.act !== id) return
    var used = player.life.usedToday || []
    if (used.indexOf(id) >= 0) return
    var gain = TUNING.ACT_ENERGY[id] * lifeActMult()
    player.energy = Math.min(energyMax(), player.energy + gain)
    player.rested = (player.rested || 0) + gain
    used.push(id)
    player.life.usedToday = used
}

// 犯困线与犯困惩罚（升级 14/24 的消费者，displayThings 与 energyFactor 共读）
function energyLowLine() {
    var line = TUNING.ENERGY_LOW
    if (safeUpgrade("life", 14)) line -= 10
    return line
}
function energyFactor() {
    if (!player.energy) return 1
    if (player.energy >= energyLowLine()) return 1
    var mult = TUNING.ENERGY_LOW_MULT
    if (safeUpgrade("gk", 11)) mult = 0.6 // 错题焦虑缓解 ×0.5→×0.6
    if (safeUpgrade("life", 24)) mult = Math.max(mult, upgradeEffect("life", 24).toNumber())
    return mult
}
