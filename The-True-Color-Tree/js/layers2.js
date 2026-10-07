// layers2.js — row 2 (c Complements, h Hue, s Saturation) + row 3 (cb Trials, t Hub, p Workshop)
// Row-2/3 static layers also pay their upgrades from Grayscale; their level
// counters (complements / hue° / saturation% / badges / bit depth) persist.

function totalTrialCompletions() {
    let n = 0
    ;[11, 12, 13, 14, 15, 21].forEach(function(cid) { n += challengeCompletions("cb", cid) })
    return n
}

// ---------------------------------------------------------------------------
// c — Complements 补色 (row 2): CMY pairs, each upgrade couples two channels
// ---------------------------------------------------------------------------
addLayer("c", {
    name: function() { return L("补色", "Complements") },
    symbol: "C",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#7de8dc",
    resource: function() { return L("补色对", "Complement Pairs") },
    row: 2,
    position: 0,
    branches: ["r", "g", "b"],

    baseResource: function() { return L("灰度", "Grayscale") },
    baseAmount() { return player.w.points },
    requires: new Decimal(2e6),
    type: "static",
    exponent: 1,
    base: 3,
    roundUpCost: true,

    canBuyMax() { return player[this.layer].unlocked },
    prestigeButtonText() {
        return "+" + formatWhole(tmp[this.layer].resetGain) + L(" 对补色　下一对需 ", " pair(s)　Next needs ")
            + format(tmp[this.layer].nextAt) + " " + L("灰度", " Grayscale")
    },

    autoPrestige() { return hasMilestone("t", 5) },
    resetsNothing() { return hasMilestone("t", 5) },
    autoUpgrade() { return hasMilestone("s", 2) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = ["milestones", "points", "best", "total"]
            if (hasMilestone(this.layer, 3)) keep.push("upgrades")
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return player.w.best.gte(1.5e6) },
    tooltip() { return L("青、品红、黄——两两通道的共振", "Cyan, magenta, yellow — resonances of channel pairs") },
    hotkeys: [
        { key: "c", description: "C: " + L("调和补色", "Mix a Complement pair"),
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() {
            return L("当前灰度", "Grayscale") + ": " + format(player.w.points) + "　·　"
                + L("通道等级和", "Channel levels") + ": " + formatWhole(chanSum())
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Cyan 青 (G+B)": { content: [["blank", "10px"], ["upgrades", [11, 12, 13, 14, 15]]],
                buttonStyle() { return { 'background-color': '#7de8dc', 'color': '#0f0f0f' } } },
            "Magenta 品红 (R+B)": { content: [["blank", "10px"], ["upgrades", [21, 22, 23, 24, 25]]],
                buttonStyle() { return { 'background-color': '#ff9ed2', 'color': '#0f0f0f' } } },
            "Yellow 黄 (R+G)": { content: [["blank", "10px"], ["upgrades", [31, 32, 33, 34, 35]]],
                buttonStyle() { return { 'background-color': '#ffe66d', 'color': '#0f0f0f' } } },
            "Milestones 里程碑": { content: [["blank", "10px"], "milestones", "blank", "buyables"] },
        },
    },

    upgrades: {
        11: Object.assign({}, GRAY_PAY, { title: function() { return L("青色滤片", "Cyan Filter") },
            description: function() { return L("绿/蓝通道费用 ×0.92。", "Green/Blue channel costs ×0.92.") },
            cost: new Decimal(1e7) }),
        12: Object.assign({}, GRAY_PAY, { title: function() { return L("青色显影", "Cyan Reveal") },
            description: function() { return L("灰度获取 ×3。", "Grayscale gain ×3.") },
            cost: new Decimal(5e9), unlocked() { return hasUpgrade(this.layer, 11) } }),
        13: Object.assign({}, GRAY_PAY, { title: function() { return L("蓝之青", "Cyan of Blue") },
            description: function() { return L("灰度获取 ×(1+蓝色等级×0.02)。", "Grayscale gain ×(1+Blue levels×0.02).") },
            cost: new Decimal(2.5e12), unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return chanLevelMult("b", 0.02) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        14: Object.assign({}, GRAY_PAY, { title: function() { return L("分光镜", "Beam Splitter") },
            description: function() { return L("解锁分光镜（可重复购买）。", "Unlock the Beam Splitter (rebuyable).") },
            cost: new Decimal(1.25e15), unlocked() { return hasUpgrade(this.layer, 13) } }),
        15: Object.assign({}, GRAY_PAY, { title: function() { return L("青相共振", "Cyan Resonance") },
            description: function() { return L("绿/蓝通道费用指数 ×1.05（更便宜）。", "Green/Blue cost exponent ×1.05 (cheaper).") },
            cost: new Decimal(6e17), unlocked() { return hasUpgrade(this.layer, 14) } }),
        21: Object.assign({}, GRAY_PAY, { title: function() { return L("品红滤片", "Magenta Filter") },
            description: function() { return L("红/蓝通道费用 ×0.92。", "Red/Blue channel costs ×0.92.") },
            cost: new Decimal(3e20) }),
        22: Object.assign({}, GRAY_PAY, { title: function() { return L("品红显影", "Magenta Reveal") },
            description: function() { return L("灰度获取 ×3。", "Grayscale gain ×3.") },
            cost: new Decimal(1.5e23), unlocked() { return hasUpgrade(this.layer, 21) } }),
        23: Object.assign({}, GRAY_PAY, { title: function() { return L("一枚硬币", "One Coin") },
            description: function() { return L("关键降价！通道等级和 ≥ 100 时灰度获取 ×4。", "Key drop! Grayscale gain ×4 if channel levels ≥ 100.") },
            cost: new Decimal(8e25), unlocked() { return hasUpgrade(this.layer, 22) } }),
        24: Object.assign({}, GRAY_PAY, { title: function() { return L("红之品红", "Magenta of Red") },
            description: function() { return L("灰度获取 ×(1+红色等级×0.02)。", "Grayscale gain ×(1+Red levels×0.02).") },
            cost: new Decimal(4e28), unlocked() { return hasUpgrade(this.layer, 23) },
            effect() { return chanLevelMult("r", 0.02) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        25: Object.assign({}, GRAY_PAY, { title: function() { return L("品红共振", "Magenta Resonance") },
            description: function() { return L("红/蓝通道费用指数 ×1.05（更便宜）。", "Red/Blue cost exponent ×1.05 (cheaper).") },
            cost: new Decimal(2e31), unlocked() { return hasUpgrade(this.layer, 24) } }),
        31: Object.assign({}, GRAY_PAY, { title: function() { return L("黄色滤片", "Yellow Filter") },
            description: function() { return L("红/绿通道费用 ×0.94。", "Red/Green channel costs ×0.94.") },
            cost: new Decimal(1e34) }),
        32: Object.assign({}, GRAY_PAY, { title: function() { return L("黄色显影", "Yellow Reveal") },
            description: function() { return L("补色 ≥ 5 对时灰度获取 ×4，否则 ×2。", "Grayscale gain ×4 if 5+ pairs, else ×2.") },
            cost: new Decimal(5e36), unlocked() { return hasUpgrade(this.layer, 31) } }),
        33: Object.assign({}, GRAY_PAY, { title: function() { return L("日光白平衡", "Daylight Balance") },
            description: function() { return L("亮度获取 ×10,000。", "Light gain ×10,000.") },
            cost: new Decimal(2.5e39), unlocked() { return hasUpgrade(this.layer, 32) } }),
        34: Object.assign({}, GRAY_PAY, { title: function() { return L("绿之黄", "Yellow of Green") },
            description: function() { return L("灰度获取 ×(1+绿色等级×0.02)。", "Grayscale gain ×(1+Green levels×0.02).") },
            cost: new Decimal(1e42), unlocked() { return hasUpgrade(this.layer, 33) },
            effect() { return chanLevelMult("g", 0.02) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        35: Object.assign({}, GRAY_PAY, { title: function() { return L("三色聚合", "Trichromatic Merge") },
            description: function() { return L("灰度获取 ×20。", "Grayscale gain ×20.") },
            cost: new Decimal(5e44), unlocked() { return hasUpgrade(this.layer, 34) } }),
    },

    milestones: {
        0: { requirementDescription: function() { return L("补色最高 5 对", "Reach 5 best Complement pairs") },
             effectDescription: function() { return L("灰度获取 ×5。", "Grayscale gain ×5.") },
             done() { return player[this.layer].best.gte(5) } },
        1: { requirementDescription: function() { return L("补色最高 8 对", "Reach 8 best Complement pairs") },
             effectDescription: function() { return L("提升通道不再重置灰度与下层。", "Channel resets no longer reset anything.") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(8) } },
        2: { requirementDescription: function() { return L("补色最高 20 对", "Reach 20 best Complement pairs") },
             effectDescription: function() { return L("自动提升 R/G/B 通道。", "Auto-raise R/G/B channels.") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(20) } },
        3: { requirementDescription: function() { return L("补色最高 35 对", "Reach 35 best Complement pairs") },
             effectDescription: function() { return L("补色升级在重置后保留。", "Complement upgrades are kept on reset.") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(35) } },
        4: { requirementDescription: function() { return L("补色最高 60 对", "Reach 60 best Complement pairs") },
             effectDescription: function() { return L("灰度获取 ×10,000。", "Grayscale gain ×10,000.") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].best.gte(60) } },
    },

    buyables: {
        11: { title: function() { return L("分光镜", "Beam Splitter") },
              cost(x) { return new Decimal(1e7).times(Decimal.pow(2, x)) },
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
              unlocked() { return hasUpgrade("c", 14) } },
    },
})

// ---------------------------------------------------------------------------
// h — Hue 色相 (row 2): the 360° wheel, hard-capped
// ---------------------------------------------------------------------------
addLayer("h", {
    name: function() { return L("色相", "Hue") },
    symbol: "H",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#d9a0ff",
    resource: function() { return L("色相角", "Hue Degrees") },
    row: 2,
    position: 1,
    branches: ["g", "b"],

    baseResource: function() { return L("灰度", "Grayscale") },
    baseAmount() { return player.w.points },
    requires: new Decimal(1e9),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,

    canBuyMax() { return player[this.layer].unlocked },
    // hard cap 360°
    canReset() {
        return player[this.layer].points.lt(360) && tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt)
    },
    prestigeButtonText() {
        if (player[this.layer].points.gte(360)) return L("色轮已转满（360°）", "The wheel is complete (360°)")
        return "+" + formatWhole(tmp[this.layer].resetGain) + L("°　下一度需 ", "°　Next degree needs ")
            + format(tmp[this.layer].nextAt) + " " + L("灰度", " Grayscale")
    },

    autoPrestige() { return hasMilestone("t", 5) },
    resetsNothing() { return hasMilestone("t", 5) },
    autoUpgrade() { return hasMilestone("t", 5) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = ["milestones", "points", "best", "total"]
            if (hasMilestone(this.layer, 1)) keep.push("upgrades")
            if (hasMilestone(this.layer, 1)) keep.push("buyables")
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return player.w.best.gte(1e9) },
    tooltip() { return L("0° 到 360° 的色环", "The wheel from 0° to 360°") },
    hotkeys: [
        { key: "h", description: "H: " + L("转动色环", "Turn the Hue wheel"),
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() {
            return L("色轮进度", "Wheel progress") + ": " + formatWhole(player.h.points) + "° / 360°"
        }],
        "upgrades", "blank", "buyables", "blank", "milestones",
    ],

    upgrades: {
        11: Object.assign({}, GRAY_PAY, { title: function() { return L("红相 0°", "Red Phase 0°") },
            description: function() { return L("灰度获取指数 +0.01。", "Grayscale gain exponent +0.01.") },
            cost: new Decimal(3e11) }),
        12: Object.assign({}, GRAY_PAY, { title: function() { return L("绿相 120°", "Green Phase 120°") },
            description: function() { return L("灰度获取指数 +0.01。", "Grayscale gain exponent +0.01.") },
            cost: new Decimal(1.5e14), unlocked() { return hasUpgrade(this.layer, 11) } }),
        13: Object.assign({}, GRAY_PAY, { title: function() { return L("蓝相 240°", "Blue Phase 240°") },
            description: function() { return L("灰度获取指数 +0.01。", "Grayscale gain exponent +0.01.") },
            cost: new Decimal(8e16), unlocked() { return hasUpgrade(this.layer, 12) } }),
        14: Object.assign({}, GRAY_PAY, { title: function() { return L("色相增益", "Hue Gain") },
            description: function() { return L("灰度获取 ×(1+色相角×0.02)。", "Grayscale gain ×(1+Hue°×0.02).") },
            cost: new Decimal(4e19), unlocked() { return hasUpgrade(this.layer, 13) },
            effect() { return chanLevelMult("h", 0.02) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        15: Object.assign({}, GRAY_PAY, { title: function() { return L("棱镜转轮", "Prism Wheel") },
            description: function() { return L("解锁棱镜转轮（可重复购买）。", "Unlock the Prism Wheel (rebuyable).") },
            cost: new Decimal(2e22), unlocked() { return hasUpgrade(this.layer, 14) } }),
        21: Object.assign({}, GRAY_PAY, { title: function() { return L("高饱和成像", "Vivid Imaging") },
            description: function() { return L("饱和度 ≥ 50 时灰度获取 ×10。", "Grayscale gain ×10 if Saturation ≥ 50.") },
            cost: new Decimal(1e25), unlocked() { return hasUpgrade(this.layer, 15) } }),
        22: Object.assign({}, GRAY_PAY, { title: function() { return L("色相校准", "Hue Calibration") },
            description: function() { return L("所有通道费用 ×0.9。", "All channel costs ×0.9.") },
            cost: new Decimal(5e27), unlocked() { return hasUpgrade(this.layer, 21) } }),
        23: Object.assign({}, GRAY_PAY, { title: function() { return L("虹彩镀层", "Iridescent Coat") },
            description: function() { return L("灰度获取 ×10。", "Grayscale gain ×10.") },
            cost: new Decimal(2.5e30), unlocked() { return hasUpgrade(this.layer, 22) } }),
        24: Object.assign({}, GRAY_PAY, { title: function() { return L("十六位色", "High Color 16-bit") },
            description: function() { return L("色深 ≥ 16 位时亮度获取 ×1e6。", "Light gain ×1e6 at 16-bit depth or deeper.") },
            cost: new Decimal(1e33), unlocked() { return hasUpgrade(this.layer, 23) } }),
        25: Object.assign({}, GRAY_PAY, { title: function() { return L("全角扫描", "Full Sweep") },
            description: function() { return L("亮度获取 ×100,000。", "Light gain ×100,000.") },
            cost: new Decimal(5e35), unlocked() { return hasUpgrade(this.layer, 24) } }),
    },

    milestones: {
        0: { requirementDescription: function() { return L("色相达到 45°", "Reach 45° Hue") },
             effectDescription: function() { return L("灰度获取 ×5。", "Grayscale gain ×5.") },
             done() { return player[this.layer].best.gte(45) } },
        1: { requirementDescription: function() { return L("色相达到 60°", "Reach 60° Hue") },
             effectDescription: function() { return L("色相升级与转轮在重置后保留。", "Hue upgrades and the wheel are kept on reset.") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(60) } },
        2: { requirementDescription: function() { return L("色相达到 90°", "Reach 90° Hue") },
             effectDescription: function() { return L("自动购买 R/G/B 通道升级。", "Auto-buy R/G/B channel upgrades.") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(90) } },
        3: { requirementDescription: function() { return L("色相达到 180°", "Reach 180° Hue") },
             effectDescription: function() { return L("灰度获取 ×1,000。", "Grayscale gain ×1,000.") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(180) } },
    },

    buyables: {
        11: { title: function() { return L("棱镜转轮", "Prism Wheel") },
              cost(x) { return new Decimal(5e8).times(Decimal.pow(2, x)) },
              effect(x) { return Decimal.pow(0.98, x) },
              display() {
                  return L("效果：所有通道费用 ×0.98^级数。", "Effect: all channel costs ×0.98^level.") + "<br>"
                      + L("费用", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + " " + L("灰度", "Grayscale")
                      + "<br>" + L("已购", "Bought") + ": " + formatWhole(getBuyableAmount(this.layer, this.id))
              },
              canAfford() { return player.w.points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player.w.points = player.w.points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              },
              unlocked() { return hasUpgrade("h", 15) } },
    },
})

// ---------------------------------------------------------------------------
// s — Saturation 饱和度 (row 2): 0–100%, hard-capped
// ---------------------------------------------------------------------------
addLayer("s", {
    name: function() { return L("饱和度", "Saturation") },
    symbol: "S",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#c8c8c8",
    resource: function() { return L("饱和度", "Saturation") },
    row: 2,
    position: 2,
    branches: ["h"],

    baseResource: function() { return L("灰度", "Grayscale") },
    baseAmount() { return player.w.points },
    requires: new Decimal(1e12),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,

    canBuyMax() { return player[this.layer].unlocked },
    // hard cap 100%
    canReset() {
        return player[this.layer].points.lt(100) && tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt)
    },
    prestigeButtonText() {
        if (player[this.layer].points.gte(100)) return L("饱和度已满（100%）", "Fully saturated (100%)")
        return "+" + formatWhole(tmp[this.layer].resetGain) + L("%　下一档需 ", "%　Next needs ")
            + format(tmp[this.layer].nextAt) + " " + L("灰度", " Grayscale")
    },

    autoPrestige() { return hasMilestone("t", 5) },
    resetsNothing() { return hasMilestone("t", 5) },
    autoUpgrade() { return hasMilestone("t", 5) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = ["milestones", "points", "best", "total"]
            if (hasMilestone(this.layer, 1)) keep.push("upgrades")
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return player.w.best.gte(1e12) },
    tooltip() { return L("0% 灰暗到 100% 鲜艳", "0% dull to 100% vivid") },
    hotkeys: [
        { key: "s", description: "S: " + L("提高饱和度", "Raise Saturation"),
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() {
            return L("饱和度", "Saturation") + ": " + formatWhole(player.s.points) + "% / 100%"
        }],
        "upgrades", "blank", "milestones",
    ],

    upgrades: {
        11: Object.assign({}, GRAY_PAY, { title: function() { return L("鲜艳模式", "Vivid Mode") },
            description: function() { return L("灰度获取 ×5。", "Grayscale gain ×5.") },
            cost: new Decimal(3e14) }),
        12: Object.assign({}, GRAY_PAY, { title: function() { return L("浓度增益", "Density Gain") },
            description: function() { return L("灰度获取 ×(1+饱和度×0.3)。", "Grayscale gain ×(1+Saturation×0.3).") },
            cost: new Decimal(1.5e17), unlocked() { return hasUpgrade(this.layer, 11) },
            effect() { return chanLevelMult("s", 0.3) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        13: Object.assign({}, GRAY_PAY, { title: function() { return L("色彩管理", "Color Management") },
            description: function() { return L("所有通道费用 ×0.92。", "All channel costs ×0.92.") },
            cost: new Decimal(8e19), unlocked() { return hasUpgrade(this.layer, 12) } }),
        14: Object.assign({}, GRAY_PAY, { title: function() { return L("半色相加成", "Half-Hue Bonus") },
            description: function() { return L("色相 ≥ 180° 时灰度获取 ×20。", "Grayscale gain ×20 if Hue ≥ 180°.") },
            cost: new Decimal(4e22), unlocked() { return hasUpgrade(this.layer, 13) } }),
        15: Object.assign({}, GRAY_PAY, { title: function() { return L("深色模式", "Dark Mode") },
            description: function() { return L("亮度获取 ×10。界面更护眼了。", "Light gain ×10. Easier on the eyes, too.") },
            cost: new Decimal(2e25), unlocked() { return hasUpgrade(this.layer, 14) } }),
        21: Object.assign({}, GRAY_PAY, { title: function() { return L("饱和指数", "Saturation Index") },
            description: function() { return L("灰度获取指数 +0.01。", "Grayscale gain exponent +0.01.") },
            cost: new Decimal(1e28), unlocked() { return hasUpgrade(this.layer, 15) } }),
        22: Object.assign({}, GRAY_PAY, { title: function() { return L("HDR", "HDR") },
            description: function() { return L("亮度获取 ×10,000。", "Light gain ×10,000.") },
            cost: new Decimal(5e30), unlocked() { return hasUpgrade(this.layer, 21) } }),
        23: Object.assign({}, GRAY_PAY, { title: function() { return L("十对补色", "Ten Pairs") },
            description: function() { return L("补色 ≥ 10 对时灰度获取 ×25。", "Grayscale gain ×25 if 10+ Complement pairs.") },
            cost: new Decimal(2.5e33), unlocked() { return hasUpgrade(this.layer, 22) } }),
        24: Object.assign({}, GRAY_PAY, { title: function() { return L("色彩剖析", "Color Profiling") },
            description: function() { return L("所有通道费用 ×0.9。", "All channel costs ×0.9.") },
            cost: new Decimal(1e36), unlocked() { return hasUpgrade(this.layer, 23) } }),
        25: Object.assign({}, GRAY_PAY, { title: function() { return L("全饱和", "Fully Saturated") },
            description: function() { return L("灰度获取 ×50。", "Grayscale gain ×50.") },
            cost: new Decimal(5e38), unlocked() { return hasUpgrade(this.layer, 24) } }),
    },

    milestones: {
        0: { requirementDescription: function() { return L("饱和度达到 25%", "Reach 25% Saturation") },
             effectDescription: function() { return L("灰度获取 ×10。", "Grayscale gain ×10.") },
             done() { return player[this.layer].best.gte(25) } },
        1: { requirementDescription: function() { return L("饱和度达到 50%", "Reach 50% Saturation") },
             effectDescription: function() { return L("饱和度升级在重置后保留。", "Saturation upgrades are kept on reset.") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(50) } },
        2: { requirementDescription: function() { return L("饱和度达到 80%", "Reach 80% Saturation") },
             effectDescription: function() { return L("自动购买补色升级。", "Auto-buy Complement upgrades.") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(80) } },
    },
})

// ---------------------------------------------------------------------------
// cb — Chromatic Trials 色觉试炼 (row 3): six color-blindness challenges (M1)
// ---------------------------------------------------------------------------
addLayer("cb", {
    name: function() { return L("色觉试炼", "Chromatic Trials") },
    symbol: "X",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#ffd27d",
    resource: function() { return L("色觉徽章", "Trial Badges") },
    row: 3,
    position: 0,
    branches: ["c", "h", "s"],

    baseResource: function() { return L("灰度", "Grayscale") },
    baseAmount() { return player.w.points },
    requires: new Decimal(1e15),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,

    canBuyMax() { return player[this.layer].unlocked },
    prestigeButtonText() {
        return "+" + formatWhole(tmp[this.layer].resetGain) + L(" 徽章　下一枚需 ", " badge(s)　Next needs ")
            + format(tmp[this.layer].nextAt) + " " + L("灰度", " Grayscale")
    },

    layerShown() { return player.w.best.gte(1e15) },
    tooltip() { return L("戴上色盲滤镜，证明你认识每一种颜色", "Wear the filters. Prove you know every color") },
    hotkeys: [
        { key: "x", description: "X: " + L("领取试炼徽章", "Claim a Trial Badge"),
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() {
            return L("试炼完成总数", "Total completions") + ": " + formatWhole(totalTrialCompletions())
                + " / 18　·　" + L("棱镜碎片即徽章，在增幅器中花费", "Badges are your shards — spend them below")
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Trials 试炼": { content: [["blank", "10px"], "challenges"],
                buttonStyle() { return { 'border-color': '#ffd27d' } } },
            "Upgrades 升级": { content: [["blank", "10px"], "upgrades"] },
            "Amplifier 增幅器": {
                unlocked() { return hasUpgrade("cb", 13) },
                content: [["blank", "10px"], "buyables"],
                buttonStyle() { return { 'border-color': '#ff9ed2' } } },
            "Milestones 里程碑": { content: [["blank", "10px"], "milestones"] },
        },
    },

    upgrades: {
        11: Object.assign({}, GRAY_PAY, { title: function() { return L("试炼老兵", "Trial Veteran") },
            description: function() { return L("灰度获取 ×3。", "Grayscale gain ×3.") },
            cost: new Decimal(3e17) }),
        12: Object.assign({}, GRAY_PAY, { title: function() { return L("经验总结", "Lesson Learned") },
            description: function() { return L("灰度获取 ×(1+试炼完成数×0.5)。", "Grayscale gain ×(1+completions×0.5).") },
            cost: new Decimal(1.5e20), unlocked() { return hasUpgrade(this.layer, 11) },
            effect() { return new Decimal(totalTrialCompletions()).times(0.5).add(1) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        13: Object.assign({}, GRAY_PAY, { title: function() { return L("棱镜增幅器", "Prism Amplifier") },
            description: function() { return L("解锁增幅器（花费徽章强化试炼奖励）。", "Unlock the Amplifier (spend badges to boost trial rewards).") },
            cost: new Decimal(8e22), unlocked() { return hasUpgrade(this.layer, 12) } }),
        14: Object.assign({}, GRAY_PAY, { title: function() { return L("暗适应", "Dark Adaptation") },
            description: function() { return L("灰度获取 ×10。", "Grayscale gain ×10.") },
            cost: new Decimal(4e25), unlocked() { return hasUpgrade(this.layer, 13) } }),
        15: Object.assign({}, GRAY_PAY, { title: function() { return L("徽章共鸣", "Badge Resonance") },
            description: function() { return L("灰度获取 ×(1+徽章×0.1)。", "Grayscale gain ×(1+badges×0.1).") },
            cost: new Decimal(2e28), unlocked() { return hasUpgrade(this.layer, 14) },
            effect() { return player.cb.points.times(0.1).add(1) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
    },

    milestones: {
        0: { requirementDescription: function() { return L("徽章最高 3 枚", "Reach 3 best Badges") },
             effectDescription: function() { return L("灰度获取 ×5。", "Grayscale gain ×5.") },
             done() { return player[this.layer].best.gte(3) } },
        1: { requirementDescription: function() { return L("徽章最高 6 枚", "Reach 6 best Badges") },
             effectDescription: function() { return L("亮度获取 ×1,000。", "Light gain ×1,000.") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(6) } },
        2: { requirementDescription: function() { return L("徽章最高 12 枚", "Reach 12 best Badges") },
             effectDescription: function() { return L("灰度获取 ×50。", "Grayscale gain ×50.") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(12) } },
        3: { requirementDescription: function() { return L("试炼完成 9 次", "Complete 9 trials in total") },
             effectDescription: function() { return L("自动获取调色点。", "Passively generate Pigment.") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return new Decimal(totalTrialCompletions()).gte(9) } },
    },

    challenges: {
        11: { name: function() { return L("红绿色盲", "Protanopia") },
              challengeDescription() {
                  return L("红与绿通道的费用 ×4。", "Red & Green channel costs ×4.") + "<br>"
                      + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit },
              goalDescription: function() { return L("灰度达到 1e10", "Grayscale ≥ 1e10") },
              canComplete() { return player.w.points.gte(1e10) },
              rewardDescription: function() { return L("灰度获取 ×1.6^完成数。", "Grayscale gain ×1.6^completions.") },
              rewardEffect() { return Decimal.pow(1.6, challengeCompletions(this.layer, this.id)) },
              rewardDisplay() { return format(this.rewardEffect()) + "x" },
              completionLimit: 3 },
        12: { name: function() { return L("蓝黄色盲", "Tritanopia") },
              challengeDescription() {
                  return L("蓝通道费用 ×4。", "Blue channel cost ×4.") + "<br>"
                      + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit },
              goalDescription: function() { return L("亮度达到 1e12", "Light ≥ 1e12") },
              canComplete() { return player.points.gte(1e12) },
              rewardDescription: function() { return L("灰度获取 ×1.6^完成数。", "Grayscale gain ×1.6^completions.") },
              rewardEffect() { return Decimal.pow(1.6, challengeCompletions(this.layer, this.id)) },
              rewardDisplay() { return format(this.rewardEffect()) + "x" },
              completionLimit: 3 },
        13: { name: function() { return L("单色模式", "Monochrome") },
              challengeDescription() {
                  return L("所有通道费用 ×8。", "All channel costs ×8.") + "<br>"
                      + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit },
              goalDescription: function() { return L("色板体积达到 4,096（2¹²）", "Palette ≥ 4,096 (2¹²)") },
              canComplete() { return cubeVolume().gte(4096) },
              rewardDescription: function() { return L("灰度获取 ×1.6^完成数。", "Grayscale gain ×1.6^completions.") },
              rewardEffect() { return Decimal.pow(1.6, challengeCompletions(this.layer, this.id)) },
              rewardDisplay() { return format(this.rewardEffect()) + "x" },
              completionLimit: 3 },
        14: { name: function() { return L("低光环境", "Low Light") },
              challengeDescription() {
                  return L("亮度获取开平方。", "Light gain is square-rooted.") + "<br>"
                      + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit },
              goalDescription: function() { return L("灰度达到 1e12", "Grayscale ≥ 1e12") },
              canComplete() { return player.w.points.gte(1e12) },
              rewardDescription: function() { return L("灰度获取 ×1.6^完成数。", "Grayscale gain ×1.6^completions.") },
              rewardEffect() { return Decimal.pow(1.6, challengeCompletions(this.layer, this.id)) },
              rewardDisplay() { return format(this.rewardEffect()) + "x" },
              completionLimit: 3,
              unlocked() { return hasChallenge("cb", 11) } },
        15: { name: function() { return L("负片世界", "Inverted") },
              challengeDescription() {
                  return L("灰度获取 ÷10。", "Grayscale gain ÷10.") + "<br>"
                      + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit },
              goalDescription: function() { return L("色板体积达到 16,384（2¹⁴）", "Palette ≥ 16,384 (2¹⁴)") },
              canComplete() { return cubeVolume().gte(16384) },
              rewardDescription: function() { return L("灰度获取 ×1.6^完成数。", "Grayscale gain ×1.6^completions.") },
              rewardEffect() { return Decimal.pow(1.6, challengeCompletions(this.layer, this.id)) },
              rewardDisplay() { return format(this.rewardEffect()) + "x" },
              completionLimit: 3,
              unlocked() { return hasChallenge("cb", 12) } },
        21: { name: function() { return L("全色盲", "Achromatopsia") },
              challengeDescription() {
                  return L("所有通道费用 ×32。世界只剩下明暗。", "All channel costs ×32. Only light and dark remain.") + "<br>"
                      + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit },
              goalDescription: function() { return L("灰度达到 1e13", "Grayscale ≥ 1e13") },
              canComplete() { return player.w.points.gte(1e13) },
              rewardDescription: function() { return L("灰度获取 ×1.6^完成数。", "Grayscale gain ×1.6^completions.") },
              rewardEffect() { return Decimal.pow(1.6, challengeCompletions(this.layer, this.id)) },
              rewardDisplay() { return format(this.rewardEffect()) + "x" },
              completionLimit: 3,
              unlocked() { return hasChallenge("cb", 13) } },
    },

    buyables: {
        11: { title: function() { return L("棱镜增幅器", "Prism Amplifier") },
              cost(x) { return new Decimal(3).times(Decimal.pow(2, x)) },
              effect(x) { return Decimal.pow(1.2, x) },
              display() {
                  return L("效果：试炼奖励 ×1.2^级数。", "Effect: trial rewards ×1.2^level.") + "<br>"
                      + L("费用", "Cost") + ": " + format(tmp[this.layer].buyables[this.id].cost) + " " + L("徽章", "Badges")
                      + "<br>" + L("已购", "Bought") + ": " + formatWhole(getBuyableAmount(this.layer, this.id))
              },
              canAfford() { return player.cb.points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player.cb.points = player.cb.points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              },
              unlocked() { return hasUpgrade("cb", 13) } },
    },
})

// ---------------------------------------------------------------------------
// t — True Color Hub 真彩枢纽 (row 3): bit-depth floors gated by palette volume
// ---------------------------------------------------------------------------
addLayer("t", {
    name: function() { return L("真彩枢纽", "True Color Hub") },
    symbol: "T",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#ffe066",
    resource: function() { return L("色深", "Bit Depth") },
    row: 3,
    position: 1,
    branches: ["c", "h", "s"],

    baseResource: function() { return L("色板体积", "Palette Volume") },
    baseAmount() { return cubeVolume() },
    // next depth needs volume 4 × 2^points = 2^(points+2); depth = points+1, max 24
    // (function form: this requirement is VOLUME-denominated, not Grayscale —
    //  cross-currency requires are outside the ×10–×100 ladder's scope by design)
    requires: function() { return new Decimal(4) },
    type: "static",
    exponent: 1,
    base: 2,

    canBuyMax() { return player[this.layer].unlocked },
    prestigeButtonText() {
        return "+" + formatWhole(tmp[this.layer].resetGain) + L(" 位色深　下一级需色板 ", " bit(s)　Next needs volume ")
            + format(tmp[this.layer].nextAt) + L("（当前 ", " (now ") + format(cubeVolume()) + "）"
    },

    layerShown() { return chanSum().gte(30) },
    tooltip() { return L("色板立方体在此点亮", "The palette cube lights up here") },
    hotkeys: [
        { key: "t", description: "T: " + L("提升色深", "Deepen the bit depth"),
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() {
            return L("色板体积", "Palette volume") + ": " + format(cubeVolume()) + " / 16,777,216　("
                + format(palettePct()) + "%)　·　" + L("位深", "Depth") + ": " + formatWhole(bitDepth()) + "-bit"
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Cube 立方体": { content: [
                ["blank", "10px"],
                ["display-text", function() {
                    return L("16×16×16 = 4096 块，每块代表 16³ = 4096 种颜色。点亮整个立方体即通关。",
                        "16×16×16 = 4096 blocks, each covering 16³ = 4096 colors. Light them all to win.")
                }],
                ["raw-html", function() { return mosaicHTML() }],
            ].concat([["display-text", function() {
                if (!hasUpgrade("t", 15)) return ""
                return L("🔍 放大镜：三通道等级 R ", "🔍 Magnifier: R ") + formatWhole(player.r.points)
                    + " · G " + formatWhole(player.g.points) + " · B " + formatWhole(player.b.points)
                    + "　" + L("下一块全亮点需要", "Next full block needs") + " R"
                    + formatWhole(player.r.points.add(1).ceil().sub(player.r.points)) + " / G"
                    + formatWhole(player.g.points.add(1).ceil().sub(player.g.points)) + " / B"
                    + formatWhole(player.b.points.add(1).ceil().sub(player.b.points))
            }]]) },
            "Upgrades 升级": { content: [["blank", "10px"], "upgrades"] },
            "Milestones 里程碑": { content: [["blank", "10px"], "milestones"] },
        },
    },

    upgrades: {
        11: Object.assign({}, GRAY_PAY, { title: function() { return L("调色台", "Mixing Desk") },
            description: function() { return L("灰度获取 ×10。", "Grayscale gain ×10.") },
            cost: new Decimal(1e10) }),
        12: Object.assign({}, GRAY_PAY, { title: function() { return L("位平面", "Bit Plane") },
            description: function() { return L("灰度获取指数 +0.01。", "Grayscale gain exponent +0.01.") },
            cost: new Decimal(3e13), unlocked() { return hasUpgrade(this.layer, 11) } }),
        13: Object.assign({}, GRAY_PAY, { title: function() { return L("体积感知", "Volume Sense") },
            description: function() { return L("灰度获取 ×(1+log₂色板×0.1)。", "Grayscale gain ×(1+log₂volume×0.1).") },
            cost: new Decimal(1e17), unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return cubeVolume().max(1).log(2).times(0.1).add(1) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        14: Object.assign({}, GRAY_PAY, { title: function() { return L("色深缓冲", "Depth Buffer") },
            description: function() { return L("灰度软cap起点 1e15 → 1e40（可见）。", "Grayscale softcap start 1e15 → 1e40 (visible).") },
            cost: new Decimal(3e20), unlocked() { return hasUpgrade(this.layer, 13) } }),
        15: Object.assign({}, GRAY_PAY, { title: function() { return L("放大镜", "Magnifier") },
            description: function() { return L("立方体页显示精确的通道等级与下一块需求。", "The Cube tab shows exact levels and next-block needs.") },
            cost: new Decimal(1e24), unlocked() { return hasUpgrade(this.layer, 14) } }),
        21: Object.assign({}, GRAY_PAY, { title: function() { return L("真彩渲染", "True Color Render") },
            description: function() { return L("灰度获取 ×100。", "Grayscale gain ×100.") },
            cost: new Decimal(3e27), unlocked() { return hasUpgrade(this.layer, 15) } }),
        22: Object.assign({}, GRAY_PAY, { title: function() { return L("双缓冲", "Double Buffering") },
            description: function() { return L("灰度获取指数 +0.01。", "Grayscale gain exponent +0.01.") },
            cost: new Decimal(1e31), unlocked() { return hasUpgrade(this.layer, 21) } }),
        23: Object.assign({}, GRAY_PAY, { title: function() { return L("逐位扫描", "Bit Sweep") },
            description: function() { return L("灰度获取 ×(1+色深×0.5)。", "Grayscale gain ×(1+depth×0.5).") },
            cost: new Decimal(3e34), unlocked() { return hasUpgrade(this.layer, 22) },
            effect() { return player.t.points.times(0.5).add(1) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        24: Object.assign({}, GRAY_PAY, { title: function() { return L("8 位 ×3 通道", "8-bit × 3 Channels") },
            description: function() { return L("灰度获取 ×100。", "Grayscale gain ×100.") },
            cost: new Decimal(1e38), unlocked() { return hasUpgrade(this.layer, 23) } }),
        25: Object.assign({}, GRAY_PAY, { title: function() { return L("真彩芯片", "True Color Chip") },
            description: function() { return L("灰度获取 ×100。", "Grayscale gain ×100.") },
            cost: new Decimal(3e42), unlocked() { return hasUpgrade(this.layer, 24) } }),
        31: Object.assign({}, GRAY_PAY, { title: function() { return L("三线性过滤", "Trilinear Filtering") },
            description: function() { return L("所有通道费用指数 ×1.02（更便宜）。", "All channel cost exponents ×1.02 (cheaper).") },
            cost: new Decimal(1e46), unlocked() { return hasUpgrade(this.layer, 25) } }),
        32: Object.assign({}, GRAY_PAY, { title: function() { return L("二十四位就绪", "24-bit Ready") },
            description: function() { return L("色深 ≥ 20 位时灰度获取 ×500。", "Grayscale gain ×500 at 20-bit depth or deeper.") },
            cost: new Decimal(3e50), unlocked() { return hasUpgrade(this.layer, 31) } }),
        33: Object.assign({}, GRAY_PAY, { title: function() { return L("伽马压缩", "Gamma Compression") },
            description: function() { return L("所有通道费用 ×0.95。", "All channel costs ×0.95.") },
            cost: new Decimal(1e54), unlocked() { return hasUpgrade(this.layer, 32) } }),
        34: Object.assign({}, GRAY_PAY, { title: function() { return L("色板百分比", "Palette Percentage") },
            description: function() { return L("灰度获取 ×(1+完成%×0.05)。", "Grayscale gain ×(1+completion%×0.05).") },
            cost: new Decimal(3e58), unlocked() { return hasUpgrade(this.layer, 33) },
            effect() { return palettePct().times(0.05).add(1) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } }),
        35: Object.assign({}, GRAY_PAY, { title: function() { return L("终点线", "The Finish Line") },
            description: function() { return L("状态栏高亮显示距离终点的通道。", "The status line highlights the lagging channel.") },
            cost: new Decimal(1e63), unlocked() { return hasUpgrade(this.layer, 34) } }),
    },

    milestones: {
        0: { requirementDescription: function() { return L("4 位色深（16 色）", "4-bit depth (16 colors)") },
             effectDescription: function() { return L("灰度获取 ×5。EGA 时代来临。", "Grayscale gain ×5. The EGA era begins.") },
             done() { return player[this.layer].best.gte(3) } },
        1: { requirementDescription: function() { return L("8 位色深（256 色）", "8-bit depth (256 colors)") },
             effectDescription: function() { return L("亮度获取 ×100。", "Light gain ×100.") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(7) } },
        2: { requirementDescription: function() { return L("10 位色深", "10-bit depth") },
             effectDescription: function() { return L("灰度获取 ×10。", "Grayscale gain ×10.") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(9) } },
        3: { requirementDescription: function() { return L("14 位色深", "14-bit depth") },
             effectDescription: function() { return L("灰度获取 ×200。", "Grayscale gain ×200.") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(13) } },
        4: { requirementDescription: function() { return L("16 位色深（65,536 色）", "16-bit depth (65,536 colors)") },
             effectDescription: function() { return L("5:6:5！绿通道费用 ×0.5（绿多一位）。", "5:6:5! Green channel cost ×0.5 (the eye's extra bit).") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].best.gte(15) } },
        5: { requirementDescription: function() { return L("20 位色深", "20-bit depth") },
             effectDescription: function() { return L("行 2 全自动化：补色/色相/饱和度自动提升、自动购买、不再重置下层。", "Row 2 full automation: c/h/s auto-raise, auto-buy, reset nothing.") },
             unlocked() { return hasMilestone(this.layer, 4) },
             done() { return player[this.layer].best.gte(19) } },
    },
})

// ---------------------------------------------------------------------------
// p — Painter's Workshop 调色工坊 (row 3, M8 shop)
// ---------------------------------------------------------------------------
addLayer("p", {
    name: function() { return L("调色工坊", "Painter's Workshop") },
    symbol: "P",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#ff9ed2",
    resource: function() { return L("调色点", "Pigment") },
    row: 3,
    position: 2,
    branches: ["t"],

    baseResource: function() { return L("灰度", "Grayscale") },
    baseAmount() { return player.w.points },
    requires: new Decimal(1e18),
    type: "normal",
    exponent: 0.25,

    gainMult() {
        let mult = new Decimal(1)
        if (hasMilestone("p", 3)) mult = mult.times(5)
        return mult
    },
    gainExp() { return new Decimal(1) },

    passiveGeneration() {
        if (hasMilestone("cb", 3)) return 1
        return 0
    },

    layerShown() { return player.w.best.gte(4e18) },
    tooltip() { return L("把颜色变成技艺", "Turn color into craft") },
    hotkeys: [
        { key: "p", description: "P: " + L("研磨调色点", "Grind Pigment"),
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() {
            return L("当前灰度", "Grayscale") + ": " + format(player.w.points)
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Shop 工坊": { content: [["blank", "10px"], "upgrades"],
                buttonStyle() { return { 'border-color': '#ff9ed2' } } },
            "Masterpieces 杰作": {
                unlocked() { return hasUpgrade("p", 15) },
                content: [["blank", "10px"],
                    ["display-text", function() {
                        return L("《单色觉醒》 — 已售出。", "<i>Monochrome Awakening</i> — sold.") + "<br>"
                            + L("《三原色习作》 — 创作中……", "<i>Study in Three Primaries</i> — in progress…") + "<br>"
                            + L("《16,777,216 色的全景》 — 待完成。", "<i>Panorama of 16,777,216 Colors</i> — awaits completion.")
                    }]] },
            "Milestones 里程碑": { content: [["blank", "10px"], "milestones"] },
        },
    },

    upgrades: {
        11: { title: function() { return L("红色技法", "Red Technique") },
              description: function() { return L("红通道费用指数 ×1.02（更便宜）。", "Red cost exponent ×1.02 (cheaper).") },
              cost: new Decimal(1) },
        12: { title: function() { return L("绿色技法", "Green Technique") },
              description: function() { return L("绿通道费用指数 ×1.02（更便宜）。", "Green cost exponent ×1.02 (cheaper).") },
              cost: new Decimal(10), unlocked() { return hasUpgrade(this.layer, 11) } },
        13: { title: function() { return L("蓝色技法", "Blue Technique") },
              description: function() { return L("蓝通道费用指数 ×1.02（更便宜）。", "Blue cost exponent ×1.02 (cheaper).") },
              cost: new Decimal(50), unlocked() { return hasUpgrade(this.layer, 12) } },
        14: { title: function() { return L("高级颜料", "Finest Pigments") },
              description: function() { return L("所有通道费用 ×0.9。", "All channel costs ×0.9.") },
              cost: new Decimal(200), unlocked() { return hasUpgrade(this.layer, 13) } },
        15: { title: function() { return L("办个画展", "Hang an Exhibition") },
              description: function() { return L("解锁「杰作」页。", "Unlock the Masterpieces tab.") },
              cost: new Decimal(1e3), unlocked() { return hasUpgrade(this.layer, 14) } },
        21: { title: function() { return L("大师之笔", "Master's Brush") },
              description: function() { return L("灰度获取 ×1,000。", "Grayscale gain ×1,000.") },
              cost: new Decimal(1e4), unlocked() { return hasUpgrade(this.layer, 15) } },
        22: { title: function() { return L("调色直觉", "Mixer's Intuition") },
              description: function() { return L("灰度获取基于调色点（^0.3，软cap）。", "Grayscale gain based on Pigment (^0.3, softcapped).") },
              cost: new Decimal(5e3), unlocked() { return hasUpgrade(this.layer, 21) },
              effect() { return softcap(player.p.points.add(1).pow(0.3), new Decimal(1e6), 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        23: { title: function() { return L("画室天窗", "Studio Skylight") },
              description: function() { return L("亮度获取 ×1e6。", "Light gain ×1e6.") },
              cost: new Decimal(5e4), unlocked() { return hasUpgrade(this.layer, 22) } },
        24: { title: function() { return L("临摹真彩", "Copy the True Colors") },
              description: function() { return L("色深 ≥ 20 位时灰度获取 ×10,000。", "Grayscale gain ×10,000 at 20-bit depth or deeper.") },
              cost: new Decimal(5e5), unlocked() { return hasUpgrade(this.layer, 23) } },
        25: { title: function() { return L("batch 颜料订单", "Bulk Paint Order") },
              description: function() { return L("灰度获取 ×1,000。", "Grayscale gain ×1,000.") },
              cost: new Decimal(5e6), unlocked() { return hasUpgrade(this.layer, 24) } },
        31: { title: function() { return L("通感", "Synesthesia") },
              description: function() { return L("所有通道费用指数 ×1.01（更便宜）。", "All channel cost exponents ×1.01 (cheaper).") },
              cost: new Decimal(5e7), unlocked() { return hasUpgrade(this.layer, 25) } },
        32: { title: function() { return L("色深写生", "Depth Sketching") },
              description: function() { return L("灰度获取 ×(1+色深×0.4)。", "Grayscale gain ×(1+depth×0.4).") },
              cost: new Decimal(5e8), unlocked() { return hasUpgrade(this.layer, 31) },
              effect() { return bitDepth().times(0.4).add(1) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        33: { title: function() { return L("学徒军团", "Apprentice Legion") },
              description: function() { return L("所有通道费用 ×0.85。", "All channel costs ×0.85.") },
              cost: new Decimal(5e9), unlocked() { return hasUpgrade(this.layer, 32) } },
        34: { title: function() { return L("国际大奖", "Grand Prize") },
              description: function() { return L("灰度获取 ×1e5。", "Grayscale gain ×1e5.") },
              cost: new Decimal(5e10), unlocked() { return hasUpgrade(this.layer, 33) } },
        35: { title: function() { return L("色彩宣言", "The Color Manifesto") },
              description: function() { return L("亮度获取 ×1e9。", "Light gain ×1e9.") },
              cost: new Decimal(5e11), unlocked() { return hasUpgrade(this.layer, 34) } },
    },

    milestones: {
        0: { requirementDescription: function() { return L("调色点最高 100", "Reach 100 best Pigment") },
             effectDescription: function() { return L("灰度获取 ×100。", "Grayscale gain ×100.") },
             done() { return player[this.layer].best.gte(100) } },
        1: { requirementDescription: function() { return L("调色点最高 10,000", "Reach 10,000 best Pigment") },
             effectDescription: function() { return L("亮度获取 ×1e6。", "Light gain ×1e6.") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(1e4) } },
        2: { requirementDescription: function() { return L("调色点最高 1e6", "Reach 1e6 best Pigment") },
             effectDescription: function() { return L("灰度获取 ×1,000。", "Grayscale gain ×1,000.") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(1e6) } },
        3: { requirementDescription: function() { return L("调色点最高 1e8", "Reach 1e8 best Pigment") },
             effectDescription: function() { return L("调色点获取 ×5。", "Pigment gain ×5.") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(1e8) } },
        4: { requirementDescription: function() { return L("调色点最高 1e10", "Reach 1e10 best Pigment") },
             effectDescription: function() { return L("灰度获取 ×1e5。", "Grayscale gain ×1e5.") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].best.gte(1e10) } },
    },
})
