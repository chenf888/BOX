// layers.js — row 0 (w White Light) + row 1 (r/g/b channels)
// Channel levels are the cube's axes: they are NEVER spent and NEVER wiped.
// Channel upgrades/buyables are paid from Grayscale (player.w.points) via
// currencyLayer/currencyInternalName — the level counter is never deducted.

const GRAY_PAY = { currencyInternalName: "points", currencyLayer: "w", currencyDisplayName: "灰度 Grayscale" }

// linear per-level helper: ×(1 + level×rate) — used by cross-channel effects
function chanLevelMult(id, rate) { return player[id].points.times(rate).add(1) } // rate kept small: linear terms feed the reset-banking loop — see brief §11

// ---------------------------------------------------------------------------
// w — White Light 白光 (row 0, ANCHOR: every layer boosts it)
// ---------------------------------------------------------------------------
addLayer("w", {
    name: function() { return L("白光", "White Light") },
    symbol: "W",
    position: 0,
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#ffffff",
    resource: function() { return L("灰度", "Grayscale") },
    row: 0,

    baseResource: function() { return L("亮度", "Light") },
    baseAmount() { return player.points },
    requires: new Decimal(10),
    type: "normal",
    exponent: 0.5,

    // single visible softcap on grayscale reset gain (delayed by w m1, raised by t14)
    softcap() {
        let C = new Decimal("1e6")
        if (hasMilestone("w", 1)) C = new Decimal("1e9")
        if (hasUpgrade("t", 14)) C = new Decimal("1e30")
        if (hasMilestone("p", 4)) C = new Decimal("1e60")
        return C
    },
    softcapPower() { return new Decimal(0.3) },

    gainMult() {
        let mult = new Decimal(1)
        // w upgrades
        if (hasUpgrade("w", 11)) mult = mult.times(2)
        if (hasUpgrade("w", 12)) mult = mult.times(2)
        if (hasUpgrade("w", 14)) mult = mult.times(player.points.gte(1e6) ? 3 : 1.5)
        if (hasUpgrade("w", 21)) mult = mult.times(upgradeEffect("w", 21))
        if (hasUpgrade("w", 22)) mult = mult.times(2)
        if (hasUpgrade("w", 24)) mult = mult.times(upgradeEffect("w", 24))
        if (hasUpgrade("w", 31)) mult = mult.times(upgradeEffect("w", 31))
        if (hasUpgrade("w", 34)) mult = mult.times(8)
        // w milestones & buyables
        if (hasMilestone("w", 0)) mult = mult.times(2.5)
        if (hasMilestone("w", 4)) mult = mult.times(3)
        if (getBuyableAmount("w", 11).gt(0)) mult = mult.times(buyableEffect("w", 11))
        // r channel
        if (hasUpgrade("r", 12)) mult = mult.times(2)
        if (hasUpgrade("r", 13)) mult = mult.times(upgradeEffect("r", 13))
        if (hasUpgrade("r", 21)) mult = mult.times(upgradeEffect("r", 21))
        if (hasUpgrade("r", 22)) mult = mult.times(upgradeEffect("r", 22))
        if (hasUpgrade("r", 23) && player.points.gte(1e8)) mult = mult.times(3)
        if (hasUpgrade("r", 25)) mult = mult.times(3)
        if (hasUpgrade("r", 31)) mult = mult.times(upgradeEffect("r", 31))
        if (hasMilestone("r", 2)) mult = mult.times(3)
        if (hasMilestone("r", 4)) mult = mult.times(10)
        if (getBuyableAmount("r", 11).gt(0)) mult = mult.times(buyableEffect("r", 11))
        // g channel
        if (hasUpgrade("g", 12)) mult = mult.times(2)
        if (hasUpgrade("g", 13)) mult = mult.times(upgradeEffect("g", 13))
        if (hasUpgrade("g", 21) && player.c.points.gte(5)) mult = mult.times(4)
        if (hasUpgrade("g", 22)) mult = mult.times(upgradeEffect("g", 22))
        if (hasUpgrade("g", 23) && player.points.gte(1e8)) mult = mult.times(3)
        if (hasUpgrade("g", 25)) mult = mult.times(10)
        if (hasUpgrade("g", 31)) mult = mult.times(upgradeEffect("g", 31))
        if (hasMilestone("g", 0)) mult = mult.times(3)
        if (hasMilestone("g", 1)) mult = mult.times(4)
        if (hasMilestone("g", 4)) mult = mult.times(10)
        if (getBuyableAmount("g", 11).gt(0)) mult = mult.times(buyableEffect("g", 11))
        // b channel
        if (hasUpgrade("b", 12)) mult = mult.times(2)
        if (hasUpgrade("b", 13)) mult = mult.times(upgradeEffect("b", 13))
        if (hasUpgrade("b", 21) && player.s.points.gte(30)) mult = mult.times(4)
        if (hasUpgrade("b", 22)) mult = mult.times(upgradeEffect("b", 22))
        if (hasUpgrade("b", 23) && player.points.gte(1e8)) mult = mult.times(5)
        if (hasUpgrade("b", 25)) mult = mult.times(10)
        if (hasUpgrade("b", 31)) mult = mult.times(upgradeEffect("b", 31))
        if (hasMilestone("b", 1)) mult = mult.times(4)
        if (hasMilestone("b", 4)) mult = mult.times(10)
        if (getBuyableAmount("b", 11).gt(0)) mult = mult.times(buyableEffect("b", 11))
        // c — Complements
        if (hasUpgrade("c", 12)) mult = mult.times(3)
        if (hasUpgrade("c", 22)) mult = mult.times(3)
        if (hasUpgrade("c", 23) && chanSum().gte(100)) mult = mult.times(4)
        if (hasUpgrade("c", 24)) mult = mult.times(upgradeEffect("c", 24))
        if (hasUpgrade("c", 32)) mult = mult.times(player.c.points.gte(5) ? 4 : 2)
        if (hasUpgrade("c", 34)) mult = mult.times(upgradeEffect("c", 34))
        if (hasUpgrade("c", 35)) mult = mult.times(20)
        if (hasMilestone("c", 0)) mult = mult.times(5)
        if (hasMilestone("c", 4)) mult = mult.times(500)
        if (getBuyableAmount("c", 11).gt(0)) mult = mult.times(buyableEffect("c", 11))
        // h — Hue
        if (hasUpgrade("h", 14)) mult = mult.times(upgradeEffect("h", 14))
        if (hasUpgrade("h", 21) && player.s.points.gte(50)) mult = mult.times(10)
        if (hasUpgrade("h", 23)) mult = mult.times(10)
        if (hasMilestone("h", 0)) mult = mult.times(5)
        if (hasMilestone("h", 3)) mult = mult.times(200)
        if (getBuyableAmount("h", 11).gt(0)) mult = mult.times(buyableEffect("h", 11))
        // s — Saturation
        if (hasUpgrade("s", 11)) mult = mult.times(5)
        if (hasUpgrade("s", 12)) mult = mult.times(upgradeEffect("s", 12))
        if (hasUpgrade("s", 14) && player.h.points.gte(180)) mult = mult.times(20)
        if (hasUpgrade("s", 23) && player.c.points.gte(10)) mult = mult.times(25)
        if (hasUpgrade("s", 25)) mult = mult.times(50)
        if (hasMilestone("s", 0)) mult = mult.times(10)
        // cb — Chromatic Trials (challenge rewards scale with completions)
        if (hasChallenge("cb", 11)) mult = mult.times(challengeEffect("cb", 11))
        if (hasChallenge("cb", 12)) mult = mult.times(challengeEffect("cb", 12))
        if (hasChallenge("cb", 13)) mult = mult.times(challengeEffect("cb", 13))
        if (hasChallenge("cb", 14)) mult = mult.times(challengeEffect("cb", 14))
        if (hasChallenge("cb", 15)) mult = mult.times(challengeEffect("cb", 15))
        if (hasChallenge("cb", 21)) mult = mult.times(challengeEffect("cb", 21))
        if (getBuyableAmount("cb", 11).gt(0)) mult = mult.times(buyableEffect("cb", 11))
        if (hasUpgrade("cb", 11)) mult = mult.times(3)
        if (hasUpgrade("cb", 12)) mult = mult.times(upgradeEffect("cb", 12))
        if (hasUpgrade("cb", 14)) mult = mult.times(10)
        if (hasUpgrade("cb", 15)) mult = mult.times(upgradeEffect("cb", 15))
        if (hasMilestone("cb", 0)) mult = mult.times(5)
        if (hasMilestone("cb", 2)) mult = mult.times(50)
        // t — True Color Hub
        if (hasUpgrade("t", 11)) mult = mult.times(10)
        if (hasUpgrade("t", 13)) mult = mult.times(upgradeEffect("t", 13))
        if (hasUpgrade("t", 21)) mult = mult.times(10)
        if (hasUpgrade("t", 23)) mult = mult.times(upgradeEffect("t", 23))
        if (hasUpgrade("t", 24)) mult = mult.times(100)
        if (hasUpgrade("t", 25)) mult = mult.times(100)
        if (hasUpgrade("t", 32) && player.t.best.gte(19)) mult = mult.times(500)
        if (hasUpgrade("t", 34)) mult = mult.times(upgradeEffect("t", 34))
        if (hasMilestone("t", 0)) mult = mult.times(5)
        if (hasMilestone("t", 2)) mult = mult.times(100)
        if (hasMilestone("t", 3)) mult = mult.times(200)
        // p — Painter's Workshop
        if (hasUpgrade("p", 21)) mult = mult.times(100)
        if (hasUpgrade("p", 22)) mult = mult.times(upgradeEffect("p", 22))
        if (hasUpgrade("p", 24) && player.t.best.gte(19)) mult = mult.times(1e3)
        if (hasUpgrade("p", 25)) mult = mult.times(1e3)
        if (hasUpgrade("p", 32)) mult = mult.times(upgradeEffect("p", 32))
        if (hasUpgrade("p", 34)) mult = mult.times(1e5)
        if (hasMilestone("p", 0)) mult = mult.times(1e3)
        if (hasMilestone("p", 2)) mult = mult.times(1e4)
        if (hasMilestone("p", 4)) mult = mult.times(1e5)
        // Achievements (flat grayscale rewards)
        if (hasAchievement("a", 22)) mult = mult.times(achievementEffect("a", 22))
        if (hasAchievement("a", 41)) mult = mult.times(achievementEffect("a", 41))
        // Chromatic Trials — "Inverted" divides grayscale gain by 10
        if (inChallenge("cb", 15)) mult = mult.div(10)
        return mult
    },
    gainExp() {
        let exp = new Decimal(1)
        if (hasUpgrade("w", 33)) exp = exp.add(0.02)
        if (hasUpgrade("h", 11)) exp = exp.add(0.01)
        if (hasUpgrade("h", 12)) exp = exp.add(0.01)
        if (hasUpgrade("h", 13)) exp = exp.add(0.01)
        if (hasUpgrade("s", 21)) exp = exp.add(0.01)
        if (hasUpgrade("t", 12)) exp = exp.add(0.01)
        if (hasUpgrade("t", 22)) exp = exp.add(0.01)
        return exp
    },

    passiveGeneration() {
        if (hasMilestone("r", 1) || hasAchievement("a", 105)) return 1
        return 0
    },

    autoUpgrade() { return hasMilestone("b", 0) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = ["milestones", "best", "total"]
            if (hasMilestone("w", 2)) keep.push("upgrades")
            if (hasMilestone("w", 3)) keep.push("buyables")
            layerDataReset(this.layer, keep)
        }
    },

    tabFormat: [
        ["infobox", "howto"],
        "main-display",
        "prestige-button",
        ["display-text", function() {
            return L("你有 ", "You have ") + format(player.points) + L(" 亮度", " Light")
        }],
        ["display-text", function() {
            if (player.w.points.gte(tmp.w.softcap.div(2))) return L("⚠ 灰度获取将在 ", "⚠ Grayscale gain softcaps at ")
                + format(tmp.w.softcap) + L(" 开始软化", "")
            return ""
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades 升级": {
                content: [["blank", "10px"], "upgrades"],
                buttonStyle() { return { 'border-color': '#ffffff' } },
            },
            "Buyables 可重复购买": {
                unlocked() { return hasUpgrade("w", 15) },
                content: [["blank", "10px"], "buyables"],
                buttonStyle() { return { 'border-color': '#8fd3ff' } },
            },
            "Milestones 里程碑": {
                content: [["blank", "10px"], "milestones"],
                buttonStyle() { return { 'border-color': '#ffe066' } },
            },
        },
    },

    infoboxes: {
        howto: {
            title: function() { return L("白光", "White Light") },
            body() {
                return L("你是一台单色显示器，只会发出亮度。积累 <b>10 亮度</b>后，把它凝固成<b>灰度</b>。"
                    + "灰度将唤醒 R/G/B 三个通道——而每一种颜色，都是色立方体中的一个节点。",
                    "You are a monochrome monitor emitting only brightness. At <b>10 Light</b>, condense it into <b>Grayscale</b>. "
                    + "Grayscale awakens the R/G/B channels — and every color is a node of the color cube.")
            },
        },
    },

    hotkeys: [
        { key: "w", description: "W: " + L("重置亮度以获取灰度", "Reset for Grayscale"),
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    upgrades: {
        11: { title: function() { return L("第一次发光", "First Glow") },
              description: function() { return L("灰度获取 ×2。", "Grayscale gain ×2.") },
              cost: new Decimal(1) },
        12: { title: function() { return L("余晖", "Afterglow") },
              description: function() { return L("灰度获取再 ×2。", "Grayscale gain ×2 again.") },
              cost: new Decimal(2),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        13: { title: function() { return L("更亮的荧光粉", "Brighter Phosphor") },
              description: function() { return L("亮度获取 ×3。", "Light gain ×3.") },
              cost: new Decimal(5),
              unlocked() { return hasUpgrade(this.layer, 12) } },
        14: { title: function() { return L("对比度", "Contrast") },
              description: function() { return L("亮度 ≥ 1e6 时灰度获取 ×3，否则 ×1.5。", "Grayscale gain ×3 if Light ≥ 1e6, else ×1.5.") },
              cost: new Decimal(30),
              unlocked() { return hasUpgrade(this.layer, 13) } },
        15: { title: function() { return L("滤镜槽位", "Filter Slot") },
              description: function() { return L("解锁灰度滤镜（可重复购买）。", "Unlock the Light Filter (rebuyable).") },
              cost: new Decimal(100),
              unlocked() { return hasUpgrade(this.layer, 14) } },
        21: { title: function() { return L("亮度计", "Luminance Meter") },
              description: function() { return L("灰度获取基于当前亮度（对数）。", "Grayscale gain based on current Light (log).") },
              cost: new Decimal(250),
              unlocked() { return hasUpgrade(this.layer, 15) },
              effect() { return player.points.add(10).log(10).times(2) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        22: { title: function() { return L("三棱镜", "The Prism") },
              description: function() { return L("关键降价！解锁三棱镜，且灰度获取 ×2。白光即将分离出颜色……", "Key drop! Unlocks The Prism, and grayscale gain ×2. White light is about to split…") },
              cost: new Decimal(8),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        23: { title: function() { return L("镀膜", "Coating") },
              description: function() { return L("白光层可重复购买的费用 ×0.6。", "White Light buyable costs ×0.6.") },
              cost: new Decimal(1500),
              unlocked() { return hasUpgrade(this.layer, 22) } },
        24: { title: function() { return L("通道预感", "Channel Hunch") },
              description: function() { return L("灰度获取 ×(1+通道等级和×0.02)。", "Grayscale gain ×(1+channel levels×0.02).") },
              cost: new Decimal(2e4),
              unlocked() { return hasUpgrade(this.layer, 23) },
              effect() { return chanSum().times(0.02).add(1) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        25: { title: function() { return L("过扫", "Overscan") },
              description: function() { return L("灰度 ≥ 1e4 时亮度获取 ×100。", "Light gain ×100 while Grayscale ≥ 1e4.") },
              cost: new Decimal(3e5),
              unlocked() { return hasUpgrade(this.layer, 24) } },
        31: { title: function() { return L("补色共鸣", "Complement Resonance") },
              description: function() { return L("灰度获取 ×(1+补色等级)。", "Grayscale gain ×(1+Complement levels).") },
              cost: new Decimal(5e6),
              unlocked() { return hasUpgrade(this.layer, 25) },
              effect() { return player.c.points.add(1) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        32: { title: function() { return L("超高亮度", "Superbright") },
              description: function() { return L("亮度获取 ×1,000。", "Light gain ×1,000.") },
              cost: new Decimal(2e8),
              unlocked() { return hasUpgrade(this.layer, 31) } },
        33: { title: function() { return L("伽马校正", "Gamma Correction") },
              description: function() { return L("灰度获取的指数 +0.02。", "Grayscale gain exponent +0.02.") },
              cost: new Decimal(1e10),
              unlocked() { return hasUpgrade(this.layer, 32) } },
        34: { title: function() { return L("纯平时代", "Flat Panel Era") },
              description: function() { return L("灰度获取 ×8。", "Grayscale gain ×8.") },
              cost: new Decimal(5e11),
              unlocked() { return hasUpgrade(this.layer, 33) } },
        35: { title: function() { return L("广色域背光", "Wide-Gamut Backlight") },
              description: function() { return L("亮度获取 ×10,000。", "Light gain ×10,000.") },
              cost: new Decimal(2e13),
              unlocked() { return hasUpgrade(this.layer, 34) } },
    },

    milestones: {
        0: { requirementDescription: function() { return L("灰度最高达到 1e4", "Reach 1e4 best Grayscale") },
             effectDescription: function() { return L("灰度获取 ×2.5。", "Grayscale gain ×2.5.") },
             done() { return player[this.layer].best.gte(1e4) } },
        1: { requirementDescription: function() { return L("灰度最高达到 1e7", "Reach 1e7 best Grayscale") },
             effectDescription: function() { return L("灰度软cap起点 1e6 → 1e9（可见）。", "Grayscale softcap start 1e6 → 1e9 (visible).") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(1e7) } },
        2: { requirementDescription: function() { return L("灰度最高达到 1e10", "Reach 1e10 best Grayscale") },
             effectDescription: function() { return L("白光层升级在重置后保留。", "White Light upgrades are kept on reset.") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(1e10) } },
        3: { requirementDescription: function() { return L("灰度最高达到 1e14", "Reach 1e14 best Grayscale") },
             effectDescription: function() { return L("白光层可重复购买在重置后保留。", "White Light buyables are kept on reset.") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(1e14) } },
        4: { requirementDescription: function() { return L("灰度最高达到 1e20", "Reach 1e20 best Grayscale") },
             effectDescription: function() { return L("灰度获取 ×10。", "Grayscale gain ×10.") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].best.gte(1e20) } },
    },

    buyables: {
        11: { title: function() { return L("滤光片", "Light Filter") },
              cost(x) {
                  let c = new Decimal(50).times(Decimal.pow(2, x))
                  if (hasUpgrade("w", 23)) c = c.times(0.6)
                  return c
              },
              effect(x) { return Decimal.pow(1.2, x) },
              display() {
                  return L("效果：灰度获取 ×", "Effect: Grayscale gain ×") + format(this.effect())
                      + "<br>" + L("费用", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + " " + L("灰度", "Grayscale")
                      + "<br>" + L("已购", "Bought") + ": " + formatWhole(getBuyableAmount(this.layer, this.id))
              },
              canAfford() { return player.w.points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player.w.points = player.w.points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              },
              unlocked() { return hasUpgrade("w", 15) } },
        12: { title: function() { return L("三棱镜", "The Prism") },
              cost(x) { return new Decimal(500).times(Decimal.pow(3, x)) },
              effect(x) { return Decimal.pow(1.3, x) },
              display() {
                  return L("效果：亮度获取 ×", "Effect: Light gain ×") + format(this.effect())
                      + "<br>" + L("费用", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + " " + L("灰度", "Grayscale")
                      + "<br>" + L("已购", "Bought") + ": " + formatWhole(getBuyableAmount(this.layer, this.id))
              },
              canAfford() { return player.w.points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player.w.points = player.w.points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              },
              unlocked() { return hasUpgrade("w", 22) } },
    },
})

// ---------------------------------------------------------------------------
// r — Red Channel 红 (row 1, static floor 0..255, levels never spent)
// ---------------------------------------------------------------------------
addLayer("r", {
    name: function() { return L("红通道", "Red Channel") },
    symbol: "R",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#ff8080",
    resource: function() { return L("红色位", "Red Levels") },
    row: 1,
    branches: ["w"],

    baseResource: function() { return L("灰度", "Grayscale") },
    baseAmount() { return player.w.points },
    requires: new Decimal(500),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,

    canBuyMax() { return player[this.layer].unlocked },
    canReset() {
        return player[this.layer].points.lt(255) && tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt)
    },
    prestigeButtonText() {
        if (player[this.layer].points.gte(255)) return L("通道已满（255 级）", "Channel complete (level 255)")
        return "+" + formatWhole(tmp[this.layer].resetGain) + L(" 级　下一级需 ", " level(s)　Next needs ")
            + format(tmp[this.layer].nextAt) + " " + L("灰度", " Grayscale")
    },

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("r", 14)) mult = mult.times(0.92)
        if (hasUpgrade("c", 21)) mult = mult.times(0.92)
        if (hasUpgrade("c", 31)) mult = mult.times(0.94)
        if (hasUpgrade("h", 22)) mult = mult.times(0.9)
        if (hasUpgrade("s", 13)) mult = mult.times(0.92)
        if (hasUpgrade("s", 24)) mult = mult.times(0.9)
        if (hasUpgrade("p", 14)) mult = mult.times(0.9)
        if (hasUpgrade("p", 33)) mult = mult.times(0.85)
        if (hasUpgrade("t", 33)) mult = mult.times(0.95)
        if (hasMilestone("b", 2)) mult = mult.times(0.95)
        if (getBuyableAmount("b", 11).gt(0)) mult = mult.times(buyableEffect("b", 11))
        if (getBuyableAmount("h", 11).gt(0)) mult = mult.times(buyableEffect("h", 11))
        if (inChallenge("cb", 11)) mult = mult.times(4)
        if (inChallenge("cb", 13)) mult = mult.times(8)
        if (inChallenge("cb", 21)) mult = mult.times(32)
        return mult
    },
    gainExp() {
        let exp = new Decimal(1)
        if (hasUpgrade("c", 25)) exp = exp.times(1.05)
        if (hasUpgrade("p", 11)) exp = exp.times(1.02)
        if (hasUpgrade("p", 31)) exp = exp.times(1.01)
        if (hasUpgrade("t", 31)) exp = exp.times(1.02)
        return exp
    },

    autoPrestige() { return hasMilestone("c", 2) && hasMilestone("c", 1) },
    resetsNothing() { return hasMilestone("c", 1) },
    autoUpgrade() { return hasMilestone("h", 2) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = ["milestones", "points", "best", "total"]
            if (hasMilestone(this.layer, 3)) keep.push("upgrades")
            if (hasMilestone(this.layer, 4)) keep.push("buyables")
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return player.w.best.gte(400) },
    tooltip() { return L("分解白光：红", "Split the light: Red") },
    hotkeys: [
        { key: "r", description: "R: " + L("提升红色等级", "Raise Red level"),
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() {
            if (player[this.layer].points.gte(255)) return L("通道已满：255 级。", "Channel complete: level 255.")
            return L("等级", "Level") + ": " + formatWhole(player[this.layer].points) + " / 255　·　"
                + L("下一级需", "Next needs") + " " + format(tmp[this.layer].nextAt) + " " + L("灰度", " Grayscale")
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades 升级": { content: [["blank", "10px"], "upgrades"] },
            "Prisms 棱镜": {
                unlocked() { return hasUpgrade("r", 15) },
                content: [["blank", "10px"], "buyables"] },
            "Milestones 里程碑": { content: [["blank", "10px"], "milestones"] },
        },
    },

    upgrades: {
        11: Object.assign({}, GRAY_PAY, { title: function() { return L("红荧光粉", "Red Phosphor") },
            description: function() { return L("亮度获取 ×3。", "Light gain ×3.") },
            cost: new Decimal(2e3) }),
        12: Object.assign({}, GRAY_PAY, { title: function() { return L("红光增益", "Red Boost") },
            description: function() { return L("灰度获取 ×2。", "Grayscale gain ×2.") },
            cost: new Decimal(1e6), unlocked() { return hasUpgrade(this.layer, 11) } }),
        13: Object.assign({}, GRAY_PAY, { title: function() { return L("绿色衬红", "Green Tints Red") },
            description: function() { return L("灰度获取 ×(1+绿色等级×0.012)。", "Grayscale gain ×(1+Green levels×0.012).") },
            cost: new Decimal(5e8), unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return chanLevelMult("g", 0.012) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        14: Object.assign({}, GRAY_PAY, { title: function() { return L("红宝石镀膜", "Ruby Coating") },
            description: function() { return L("本通道下一级费用 ×0.92。", "This channel's next-level cost ×0.92.") },
            cost: new Decimal(2.5e11), unlocked() { return hasUpgrade(this.layer, 13) } }),
        15: Object.assign({}, GRAY_PAY, { title: function() { return L("红棱镜槽位", "Ruby Prism Slot") },
            description: function() { return L("解锁本通道的棱镜（可重复购买）。", "Unlock this channel's Prism (rebuyable).") },
            cost: new Decimal(1e14), unlocked() { return hasUpgrade(this.layer, 14) } }),
        21: Object.assign({}, GRAY_PAY, { title: function() { return L("红之深度", "Depth of Red") },
            description: function() { return L("灰度获取基于红色等级（^0.4，软cap 1000）。", "Grayscale gain based on Red level (^0.4, softcap 1000).") },
            cost: new Decimal(5e16), unlocked() { return hasUpgrade(this.layer, 15) },
            effect() { return softcap(player.r.points.add(1).pow(0.4), new Decimal(1000), 0.5) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        22: Object.assign({}, GRAY_PAY, { title: function() { return L("蓝色染红", "Blue Shades Red") },
            description: function() { return L("灰度获取 ×(1+蓝色等级×0.016)。", "Grayscale gain ×(1+Blue levels×0.016).") },
            cost: new Decimal(2.5e19), unlocked() { return hasUpgrade(this.layer, 21) },
            effect() { return chanLevelMult("b", 0.016) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        23: Object.assign({}, GRAY_PAY, { title: function() { return L("深红", "Deep Red") },
            description: function() { return L("亮度 ≥ 1e8 时灰度获取 ×5。", "Grayscale gain ×5 if Light ≥ 1e8.") },
            cost: new Decimal(1e22), unlocked() { return hasUpgrade(this.layer, 22) } }),
        24: Object.assign({}, GRAY_PAY, { title: function() { return L("红相偏移", "Red Phase Shift") },
            description: function() { return L("灰度获取的指数 +0.01。", "Grayscale gain exponent +0.01.") },
            cost: new Decimal(5e24), unlocked() { return hasUpgrade(this.layer, 23) } }),
        25: Object.assign({}, GRAY_PAY, { title: function() { return L("绯红洪流", "Crimson Flood") },
            description: function() { return L("灰度获取 ×10。", "Grayscale gain ×10.") },
            cost: new Decimal(2.5e27), unlocked() { return hasUpgrade(this.layer, 24) } }),
        31: Object.assign({}, GRAY_PAY, { title: function() { return L("色相之红", "Hue of Red") },
            description: function() { return L("灰度获取 ×(1+色相角×0.01)。", "Grayscale gain ×(1+Hue°×0.01).") },
            cost: new Decimal(1e30), unlocked() { return hasUpgrade(this.layer, 25) },
            effect() { return chanLevelMult("h", 0.01) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        32: Object.assign({}, GRAY_PAY, { title: function() { return L("激光红", "Laser Red") },
            description: function() { return L("亮度获取 ×1,000。", "Light gain ×1,000.") },
            cost: new Decimal(5e32), unlocked() { return hasUpgrade(this.layer, 31) } }),
    },

    milestones: {
        0: { requirementDescription: function() { return L("红色等级达到 15", "Reach Red level 15") },
             effectDescription: function() { return L("提升红通道不再重置灰度。", "Red resets no longer reset Grayscale.") },
             done() { return player[this.layer].best.gte(15) } },
        1: { requirementDescription: function() { return L("红色等级达到 40", "Reach Red level 40") },
             effectDescription: function() { return L("被动获取灰度（无需重置）。", "Passively generate Grayscale.") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(40) } },
        2: { requirementDescription: function() { return L("红色等级达到 80", "Reach Red level 80") },
             effectDescription: function() { return L("灰度获取 ×3。", "Grayscale gain ×3.") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(80) } },
        3: { requirementDescription: function() { return L("红色等级达到 140", "Reach Red level 140") },
             effectDescription: function() { return L("红通道升级在重置后保留。", "Red upgrades are kept on reset.") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(140) } },
        4: { requirementDescription: function() { return L("红色等级达到 210", "Reach Red level 210") },
             effectDescription: function() { return L("灰度获取 ×25。", "Grayscale gain ×25.") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].best.gte(210) } },
    },

    buyables: {
        11: { title: function() { return L("红宝石棱镜", "Ruby Prism") },
              cost(x) { return new Decimal(200).times(Decimal.pow(2, x)) },
              effect(x) { return Decimal.pow(1.15, x) },
              display() {
                  return L("效果：灰度获取 ×1.15^级数。", "Effect: Grayscale gain ×1.15^level.") + "<br>"
                      + L("费用", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + " " + L("灰度", "Grayscale")
                      + "<br>" + L("已购", "Bought") + ": " + formatWhole(getBuyableAmount(this.layer, this.id))
              },
              canAfford() { return player.w.points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player.w.points = player.w.points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              },
              unlocked() { return hasUpgrade(this.layer, 15) } },
    },
})

// ---------------------------------------------------------------------------
// g — Green Channel 绿 (row 1; cheapest requirements — the 5:6:5 nod)
// ---------------------------------------------------------------------------
addLayer("g", {
    name: function() { return L("绿通道", "Green Channel") },
    symbol: "G",
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#80e8a0",
    resource: function() { return L("绿色位", "Green Levels") },
    row: 1,
    branches: ["w"],

    baseResource: function() { return L("灰度", "Grayscale") },
    baseAmount() { return player.w.points },
    requires: new Decimal(2500),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,

    canBuyMax() { return player[this.layer].unlocked },
    canReset() {
        return player[this.layer].points.lt(255) && tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt)
    },
    prestigeButtonText() {
        if (player[this.layer].points.gte(255)) return L("通道已满（255 级）", "Channel complete (level 255)")
        return "+" + formatWhole(tmp[this.layer].resetGain) + L(" 级　下一级需 ", " level(s)　Next needs ")
            + format(tmp[this.layer].nextAt) + " " + L("灰度", " Grayscale")
    },

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("g", 14)) mult = mult.times(0.92)
        if (hasUpgrade("c", 11)) mult = mult.times(0.92)
        if (hasUpgrade("c", 31)) mult = mult.times(0.94)
        if (hasUpgrade("h", 22)) mult = mult.times(0.9)
        if (hasUpgrade("s", 13)) mult = mult.times(0.92)
        if (hasUpgrade("s", 24)) mult = mult.times(0.9)
        if (hasUpgrade("p", 14)) mult = mult.times(0.9)
        if (hasUpgrade("p", 33)) mult = mult.times(0.85)
        if (hasUpgrade("t", 33)) mult = mult.times(0.95)
        if (hasMilestone("t", 4)) mult = mult.times(0.5)
        if (getBuyableAmount("b", 11).gt(0)) mult = mult.times(buyableEffect("b", 11))
        if (getBuyableAmount("h", 11).gt(0)) mult = mult.times(buyableEffect("h", 11))
        if (inChallenge("cb", 11)) mult = mult.times(4)
        if (inChallenge("cb", 13)) mult = mult.times(8)
        if (inChallenge("cb", 21)) mult = mult.times(32)
        return mult
    },
    gainExp() {
        let exp = new Decimal(1)
        if (hasUpgrade("c", 15)) exp = exp.times(1.05)
        if (hasUpgrade("p", 12)) exp = exp.times(1.02)
        if (hasUpgrade("p", 31)) exp = exp.times(1.01)
        if (hasUpgrade("t", 31)) exp = exp.times(1.02)
        return exp
    },

    autoPrestige() { return hasMilestone("c", 2) && hasMilestone("c", 1) },
    resetsNothing() { return hasMilestone("c", 1) },
    autoUpgrade() { return hasMilestone("h", 2) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = ["milestones", "points", "best", "total"]
            if (hasMilestone(this.layer, 3)) keep.push("upgrades")
            if (hasMilestone(this.layer, 4)) keep.push("buyables")
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return player.w.best.gte(2000) },
    tooltip() { return L("分解白光：绿（5:6:5，绿多一位）", "Split the light: Green (5:6:5 — the eye's extra bit)") },
    hotkeys: [
        { key: "g", description: "G: " + L("提升绿色等级", "Raise Green level"),
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() {
            if (player[this.layer].points.gte(255)) return L("通道已满：255 级。", "Channel complete: level 255.")
            return L("等级", "Level") + ": " + formatWhole(player[this.layer].points) + " / 255　·　"
                + L("下一级需", "Next needs") + " " + format(tmp[this.layer].nextAt) + " " + L("灰度", " Grayscale")
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades 升级": { content: [["blank", "10px"], "upgrades"] },
            "Prisms 棱镜": {
                unlocked() { return hasUpgrade("g", 15) },
                content: [["blank", "10px"], "buyables"] },
            "Milestones 里程碑": { content: [["blank", "10px"], "milestones"] },
        },
    },

    upgrades: {
        11: Object.assign({}, GRAY_PAY, { title: function() { return L("绿荧光粉", "Green Phosphor") },
            description: function() { return L("亮度获取 ×3。", "Light gain ×3.") },
            cost: new Decimal(1e3) }),
        12: Object.assign({}, GRAY_PAY, { title: function() { return L("绿光增益", "Green Boost") },
            description: function() { return L("灰度获取 ×2。", "Grayscale gain ×2.") },
            cost: new Decimal(5e5), unlocked() { return hasUpgrade(this.layer, 11) } }),
        13: Object.assign({}, GRAY_PAY, { title: function() { return L("红色衬绿", "Red Tints Green") },
            description: function() { return L("灰度获取 ×(1+红色等级×0.012)。", "Grayscale gain ×(1+Red levels×0.012).") },
            cost: new Decimal(2.5e8), unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return chanLevelMult("r", 0.012) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        14: Object.assign({}, GRAY_PAY, { title: function() { return L("翠玉镀膜", "Emerald Coating") },
            description: function() { return L("本通道下一级费用 ×0.92。", "This channel's next-level cost ×0.92.") },
            cost: new Decimal(1.25e11), unlocked() { return hasUpgrade(this.layer, 13) } }),
        15: Object.assign({}, GRAY_PAY, { title: function() { return L("绿棱镜槽位", "Emerald Prism Slot") },
            description: function() { return L("解锁本通道的棱镜（可重复购买）。", "Unlock this channel's Prism (rebuyable).") },
            cost: new Decimal(5e13), unlocked() { return hasUpgrade(this.layer, 14) } }),
        21: Object.assign({}, GRAY_PAY, { title: function() { return L("补色之绿", "Complement Green") },
            description: function() { return L("补色等级 ≥ 5 时灰度获取 ×4。", "Grayscale gain ×4 if Complement levels ≥ 5.") },
            cost: new Decimal(2.5e16), unlocked() { return hasUpgrade(this.layer, 15) } }),
        22: Object.assign({}, GRAY_PAY, { title: function() { return L("补色染绿", "Complements Shade Green") },
            description: function() { return L("灰度获取 ×(1+补色等级×0.01)。", "Grayscale gain ×(1+Complement levels×0.01).") },
            cost: new Decimal(1.25e19), unlocked() { return hasUpgrade(this.layer, 21) },
            effect() { return chanLevelMult("c", 0.01) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        23: Object.assign({}, GRAY_PAY, { title: function() { return L("深绿", "Deep Green") },
            description: function() { return L("亮度 ≥ 1e8 时灰度获取 ×5。", "Grayscale gain ×5 if Light ≥ 1e8.") },
            cost: new Decimal(5e21), unlocked() { return hasUpgrade(this.layer, 22) } }),
        24: Object.assign({}, GRAY_PAY, { title: function() { return L("绿相偏移", "Green Phase Shift") },
            description: function() { return L("灰度获取的指数 +0.01。", "Grayscale gain exponent +0.01.") },
            cost: new Decimal(2.5e24), unlocked() { return hasUpgrade(this.layer, 23) } }),
        25: Object.assign({}, GRAY_PAY, { title: function() { return L("翠色洪流", "Verdant Flood") },
            description: function() { return L("灰度获取 ×10。", "Grayscale gain ×10.") },
            cost: new Decimal(1.25e27), unlocked() { return hasUpgrade(this.layer, 24) } }),
        31: Object.assign({}, GRAY_PAY, { title: function() { return L("色相之绿", "Hue of Green") },
            description: function() { return L("灰度获取 ×(1+色相角×0.01)。", "Grayscale gain ×(1+Hue°×0.01).") },
            cost: new Decimal(5e29), unlocked() { return hasUpgrade(this.layer, 25) },
            effect() { return chanLevelMult("h", 0.01) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        32: Object.assign({}, GRAY_PAY, { title: function() { return L("激光绿", "Laser Green") },
            description: function() { return L("亮度获取 ×1,000。", "Light gain ×1,000.") },
            cost: new Decimal(2.5e32), unlocked() { return hasUpgrade(this.layer, 31) } }),
    },

    milestones: {
        0: { requirementDescription: function() { return L("绿色等级达到 15", "Reach Green level 15") },
             effectDescription: function() { return L("灰度获取 ×3。", "Grayscale gain ×3.") },
             done() { return player[this.layer].best.gte(15) } },
        1: { requirementDescription: function() { return L("绿色等级达到 45", "Reach Green level 45") },
             effectDescription: function() { return L("灰度获取 ×4。", "Grayscale gain ×4.") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(45) } },
        2: { requirementDescription: function() { return L("绿色等级达到 90", "Reach Green level 90") },
             effectDescription: function() { return L("亮度获取 ×100。", "Light gain ×100.") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(90) } },
        3: { requirementDescription: function() { return L("绿色等级达到 150", "Reach Green level 150") },
             effectDescription: function() { return L("绿通道升级在重置后保留。", "Green upgrades are kept on reset.") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(150) } },
        4: { requirementDescription: function() { return L("绿色等级达到 220", "Reach Green level 220") },
             effectDescription: function() { return L("灰度获取 ×25。", "Grayscale gain ×25.") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].best.gte(220) } },
    },

    buyables: {
        11: { title: function() { return L("翠玉棱镜", "Emerald Prism") },
              cost(x) { return new Decimal(200).times(Decimal.pow(2, x)) },
              effect(x) { return Decimal.pow(1.2, x) },
              display() {
                  return L("效果：亮度获取 ×1.2^级数。", "Effect: Light gain ×1.2^level.") + "<br>"
                      + L("费用", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + " " + L("灰度", "Grayscale")
                      + "<br>" + L("已购", "Bought") + ": " + formatWhole(getBuyableAmount(this.layer, this.id))
              },
              canAfford() { return player.w.points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player.w.points = player.w.points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              },
              unlocked() { return hasUpgrade(this.layer, 15) } },
    },
})

// ---------------------------------------------------------------------------
// b — Blue Channel 蓝 (row 1)
// ---------------------------------------------------------------------------
addLayer("b", {
    name: function() { return L("蓝通道", "Blue Channel") },
    symbol: "B",
    position: 2,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#80aaff",
    resource: function() { return L("蓝色位", "Blue Levels") },
    row: 1,
    branches: ["w"],

    baseResource: function() { return L("灰度", "Grayscale") },
    baseAmount() { return player.w.points },
    requires: new Decimal(12500),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,

    canBuyMax() { return player[this.layer].unlocked },
    canReset() {
        return player[this.layer].points.lt(255) && tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt)
    },
    prestigeButtonText() {
        if (player[this.layer].points.gte(255)) return L("通道已满（255 级）", "Channel complete (level 255)")
        return "+" + formatWhole(tmp[this.layer].resetGain) + L(" 级　下一级需 ", " level(s)　Next needs ")
            + format(tmp[this.layer].nextAt) + " " + L("灰度", " Grayscale")
    },

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("b", 14)) mult = mult.times(0.92)
        if (hasUpgrade("c", 11)) mult = mult.times(0.92)
        if (hasUpgrade("c", 21)) mult = mult.times(0.92)
        if (hasUpgrade("h", 22)) mult = mult.times(0.9)
        if (hasUpgrade("s", 13)) mult = mult.times(0.92)
        if (hasUpgrade("s", 24)) mult = mult.times(0.9)
        if (hasUpgrade("p", 14)) mult = mult.times(0.9)
        if (hasUpgrade("p", 33)) mult = mult.times(0.85)
        if (hasUpgrade("t", 33)) mult = mult.times(0.95)
        if (getBuyableAmount("b", 11).gt(0)) mult = mult.times(buyableEffect("b", 11))
        if (getBuyableAmount("h", 11).gt(0)) mult = mult.times(buyableEffect("h", 11))
        if (inChallenge("cb", 12)) mult = mult.times(4)
        if (inChallenge("cb", 13)) mult = mult.times(8)
        if (inChallenge("cb", 21)) mult = mult.times(32)
        return mult
    },
    gainExp() {
        let exp = new Decimal(1)
        if (hasUpgrade("c", 15)) exp = exp.times(1.05)
        if (hasUpgrade("c", 25)) exp = exp.times(1.05)
        if (hasUpgrade("p", 13)) exp = exp.times(1.02)
        if (hasUpgrade("p", 31)) exp = exp.times(1.01)
        if (hasUpgrade("t", 31)) exp = exp.times(1.02)
        return exp
    },

    autoPrestige() { return hasMilestone("c", 2) && hasMilestone("c", 1) },
    resetsNothing() { return hasMilestone("c", 1) },
    autoUpgrade() { return hasMilestone("h", 2) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = ["milestones", "points", "best", "total"]
            if (hasMilestone(this.layer, 3)) keep.push("upgrades")
            if (hasMilestone(this.layer, 4)) keep.push("buyables")
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return player.w.best.gte(1e4) },
    tooltip() { return L("分解白光：蓝", "Split the light: Blue") },
    hotkeys: [
        { key: "b", description: "B: " + L("提升蓝色等级", "Raise Blue level"),
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() {
            if (player[this.layer].points.gte(255)) return L("通道已满：255 级。", "Channel complete: level 255.")
            return L("等级", "Level") + ": " + formatWhole(player[this.layer].points) + " / 255　·　"
                + L("下一级需", "Next needs") + " " + format(tmp[this.layer].nextAt) + " " + L("灰度", " Grayscale")
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades 升级": { content: [["blank", "10px"], "upgrades"] },
            "Prisms 棱镜": {
                unlocked() { return hasUpgrade("b", 15) },
                content: [["blank", "10px"], "buyables"] },
            "Milestones 里程碑": { content: [["blank", "10px"], "milestones"] },
        },
    },

    upgrades: {
        11: Object.assign({}, GRAY_PAY, { title: function() { return L("蓝荧光粉", "Blue Phosphor") },
            description: function() { return L("亮度获取 ×3。", "Light gain ×3.") },
            cost: new Decimal(4e3) }),
        12: Object.assign({}, GRAY_PAY, { title: function() { return L("蓝光增益", "Blue Boost") },
            description: function() { return L("灰度获取 ×2。", "Grayscale gain ×2.") },
            cost: new Decimal(2e6), unlocked() { return hasUpgrade(this.layer, 11) } }),
        13: Object.assign({}, GRAY_PAY, { title: function() { return L("绿色衬蓝", "Green Tints Blue") },
            description: function() { return L("灰度获取 ×(1+绿色等级×0.012)。", "Grayscale gain ×(1+Green levels×0.012).") },
            cost: new Decimal(1e9), unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return chanLevelMult("g", 0.012) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        14: Object.assign({}, GRAY_PAY, { title: function() { return L("蓝宝石镀膜", "Sapphire Coating") },
            description: function() { return L("本通道下一级费用 ×0.92。", "This channel's next-level cost ×0.92.") },
            cost: new Decimal(5e11), unlocked() { return hasUpgrade(this.layer, 13) } }),
        15: Object.assign({}, GRAY_PAY, { title: function() { return L("蓝棱镜槽位", "Sapphire Prism Slot") },
            description: function() { return L("解锁本通道的棱镜（可重复购买）。", "Unlock this channel's Prism (rebuyable).") },
            cost: new Decimal(2e14), unlocked() { return hasUpgrade(this.layer, 14) } }),
        21: Object.assign({}, GRAY_PAY, { title: function() { return L("饱和之蓝", "Saturated Blue") },
            description: function() { return L("饱和度 ≥ 30 时灰度获取 ×4。", "Grayscale gain ×4 if Saturation ≥ 30.") },
            cost: new Decimal(1e17), unlocked() { return hasUpgrade(this.layer, 15) } }),
        22: Object.assign({}, GRAY_PAY, { title: function() { return L("红色染蓝", "Red Shades Blue") },
            description: function() { return L("灰度获取 ×(1+红色等级×0.016)。", "Grayscale gain ×(1+Red levels×0.016).") },
            cost: new Decimal(5e19), unlocked() { return hasUpgrade(this.layer, 21) },
            effect() { return chanLevelMult("r", 0.016) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        23: Object.assign({}, GRAY_PAY, { title: function() { return L("深蓝", "Deep Blue") },
            description: function() { return L("亮度 ≥ 1e8 时灰度获取 ×5。", "Grayscale gain ×5 if Light ≥ 1e8.") },
            cost: new Decimal(2e22), unlocked() { return hasUpgrade(this.layer, 22) } }),
        24: Object.assign({}, GRAY_PAY, { title: function() { return L("蓝相偏移", "Blue Phase Shift") },
            description: function() { return L("灰度获取的指数 +0.01。", "Grayscale gain exponent +0.01.") },
            cost: new Decimal(1e25), unlocked() { return hasUpgrade(this.layer, 23) } }),
        25: Object.assign({}, GRAY_PAY, { title: function() { return L("湛蓝洪流", "Azure Flood") },
            description: function() { return L("灰度获取 ×10。", "Grayscale gain ×10.") },
            cost: new Decimal(5e27), unlocked() { return hasUpgrade(this.layer, 24) } }),
        31: Object.assign({}, GRAY_PAY, { title: function() { return L("色相之蓝", "Hue of Blue") },
            description: function() { return L("灰度获取 ×(1+色相角×0.01)。", "Grayscale gain ×(1+Hue°×0.01).") },
            cost: new Decimal(2e30), unlocked() { return hasUpgrade(this.layer, 25) },
            effect() { return chanLevelMult("h", 0.01) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        32: Object.assign({}, GRAY_PAY, { title: function() { return L("激光蓝", "Laser Blue") },
            description: function() { return L("亮度获取 ×1,000。", "Light gain ×1,000.") },
            cost: new Decimal(1e33), unlocked() { return hasUpgrade(this.layer, 31) } }),
    },

    milestones: {
        0: { requirementDescription: function() { return L("蓝色等级达到 15", "Reach Blue level 15") },
             effectDescription: function() { return L("自动购买白光层升级。", "Auto-buy White Light upgrades.") },
             done() { return player[this.layer].best.gte(15) } },
        1: { requirementDescription: function() { return L("蓝色等级达到 50", "Reach Blue level 50") },
             effectDescription: function() { return L("灰度获取 ×4。", "Grayscale gain ×4.") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(50) } },
        2: { requirementDescription: function() { return L("蓝色等级达到 100", "Reach Blue level 100") },
             effectDescription: function() { return L("红/绿通道下一级费用 ×0.95。", "Red/Green next-level costs ×0.95.") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(100) } },
        3: { requirementDescription: function() { return L("蓝色等级达到 160", "Reach Blue level 160") },
             effectDescription: function() { return L("蓝通道升级在重置后保留。", "Blue upgrades are kept on reset.") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(160) } },
        4: { requirementDescription: function() { return L("蓝色等级达到 230", "Reach Blue level 230") },
             effectDescription: function() { return L("灰度获取 ×25。", "Grayscale gain ×25.") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].best.gte(230) } },
    },

    buyables: {
        11: { title: function() { return L("蓝宝石棱镜", "Sapphire Prism") },
              cost(x) { return new Decimal(200).times(Decimal.pow(2, x)) },
              effect(x) { return Decimal.pow(0.97, x) },
              display() {
                  return L("效果：所有通道费用 ×0.97^级数。", "Effect: all channel costs ×0.97^level.") + "<br>"
                      + L("费用", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + " " + L("灰度", "Grayscale")
                      + "<br>" + L("已购", "Bought") + ": " + formatWhole(getBuyableAmount(this.layer, this.id))
              },
              canAfford() { return player.w.points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player.w.points = player.w.points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              },
              unlocked() { return hasUpgrade(this.layer, 15) } },
    },
})


