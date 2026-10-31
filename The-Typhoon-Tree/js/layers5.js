// ============================================================================
// The Typhoon Tree — js/layers5.js (row 3a: eye)
// eye — 暖心风眼 Warm Core Eye. Static floors of "Warm Core" bought with
// vorticity; base 3 (one bracket pricier than the bands). Home of the first
// autoBuyable driver: m0 lets the engine buy conv b11 (CAPE) closed-form
// every tick (P54; base-3 exponential is invertible).
// Consumers wired elsewhere: u11 -> vor.gainMult x2, u13 -> evap.gainMult
// (eye.best+1), u17 -> vor.gainMult x2 while wind >= 41.5 m/s, u19 ->
// vor.gainMult x3; u12/u14/u20/m1/m3 -> eyewall energy (layers6.js).
// ============================================================================

addLayer("eye", {
    name() { return L("Warm Core Eye", "暖心风眼") },
    symbol: "眼",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#F7DC6F",
    resource() { return L("Warm Core", "暖心") },
    row: 3,
    position: 0,
    branches: ["vor"],

    baseResource: "Vorticity",
    baseAmount() { return player.vor.points },
    requires: new Decimal("1e6"),
    type: "static",
    base: 3,
    exponent: 1,
    roundUpCost: true,
    canBuyMax() { return hasUpgrade(this.layer, 15) },

    gainExp() { return new Decimal(1) },

    // static semantics: gainMult SMALLER = cheaper floors
    gainMult() {
        let m = new Decimal(1)
        if (player.land && hasMilestone("land", 2)) m = m.times(0.9)
        return m
    },

    // autoBuyable driver (automation ladder step 5): with m0, the engine
    // buys max CAPE every tick through the closed-form inverse in conv b11.
    update(diff) {
        if (hasMilestone(this.layer, 0) && player.conv && tmp.conv && tmp.conv.buyables && tmp.conv.buyables[11] && tmp.conv.buyables[11].unlocked) {
            buyBuyable("conv", 11)
        }
    },

    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        let kept = ["unlocked", "best", "total"]
        if (hasMilestone(this.layer, 2)) kept.push("upgrades")
        layerDataReset(this.layer, kept)
    },

    layerShown() { return player[this.layer].unlocked || player.vor.best.gte("2e5") },
    hotkeys: [
        { key: "w", description: function() { return L("W: Reset for Warm Core", "W：重置涡度换取暖心") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#F7DC6F'>" + L("You have ", "你有 ")
                + format(player.vor.points) + L(" Vorticity", " 涡度")
                + L("  →  a warm core settles in: ", "  →  暖心成形：")
                + "<b style='color:#F7DC6F'>" + L("Warm Core", "暖心") + "</b></h2>"
        }],
        ["display-text", function() {
            return "<span style='opacity:.65'>" + L("Best: ", "最佳：") + formatWhole(player.eye.best)
                + L("  |  next bracket: ", " ｜ 下一档：") + format(tmp.eye.nextAt) + "</span>"
        }],
        "prestige-button", "blank",
        ["display-text", function() {
            return "<span style='opacity:.5'>" + L("The eye does not spin — it lets everything else spin faster.", "风眼自己不转——它让别的部分转得更快。") + "</span>"
        }],
        ["blank", "10px"],
        "upgrades",
        ["blank", "15px"],
        "milestones",
        ["blank", "65px"],
    ],

    upgrades: {
        rows: 1, cols: 10,
        11: { title: function() { return L("Clear Sky Well", "碧空风眼") },
              description() { return L("Eyewall energy gain x2.", "眼墙能量获取 ×2。") },
              cost: new Decimal(1) },
        12: { title: function() { return L("Stable Ascent", "稳定上升") },
              description() { return L("Eyewall energy gain is boosted by the log of your vorticity.", "眼墙能量获取随涡度的对数增长。") },
              cost: new Decimal(3),
              unlocked() { return hasUpgrade(this.layer, 11) },
              effect() { return player.vor.points.max(1).log10().add(1) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: function() { return L("Outflow Shield", "流出盾") },
              description() { return L("Latent heat gain is boosted by your best warm core.", "潜热获取随最佳暖心增长。") },
              cost: new Decimal(9),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        14: { title: function() { return L("Eye Wall Memory", "风眼记忆") },
              description() { return L("Eyewall energy gain is boosted by the log of your best warm core.", "眼墙能量获取随最佳暖心的对数增长。") },
              cost: new Decimal(27),
              unlocked() { return hasUpgrade(this.layer, 11) },
              effect() { return player.eye.best.max(1).log10().add(1) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: function() { return L("Rapid Intensification", "快速增强") },
              description() { return L("Unlocks Buy Max for the eye.", "解锁暖心「买满」。") },
              cost: new Decimal(81),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        16: { title: function() { return L("Cold Cloud Tops", "冷云顶") },
              description() { return L("Latent heat gain x2. The troposphere vents freely.", "潜热获取 ×2。对流层畅通无阻。") },
              cost: new Decimal(243),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        17: { title: function() { return L("Contracted Core", "紧缩核心") },
              description() { return L("Vorticity gain x2 while your wind speed is at least 41.5 m/s.", "风速达到 41.5 m/s 时涡度获取 ×2。") },
              cost: new Decimal(729),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        18: { title: function() { return L("Warm Anomaly", "暖异常") },
              description() { return L("Cloud mass gain is boosted by your best warm core.", "云团获取随最佳暖心增长。") },
              cost: new Decimal(2187),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        19: { title: function() { return L("Axial Symmetry", "轴对称") },
              description() { return L("Vorticity gain x3. The storm stops wasting motion.", "涡度获取 ×3。风暴不再浪费一丝动能。") },
              cost: new Decimal(6561),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        20: { title: function() { return L("Warm-Core Forcing", "暖心强迫") },
              description() { return L("Raises eyewall energy gain to a power of 1.05.", "眼墙能量获取变为 1.05 次方。") },
              cost: new Decimal(19683),
              unlocked() { return hasUpgrade(this.layer, 15) } },
    },

    milestones: {
        0: { requirementDescription: function() { return L("5 best warm core", "最佳暖心 5") },
             effectDescription() { return L("Automatically buy max Convective Available Potential Energy.", "自动买满对流有效位能（CAPE）。") },
             done() { return player[this.layer].best.gte(5) } },
        1: { requirementDescription: function() { return L("50 best warm core", "最佳暖心 50") },
             effectDescription() { return L("Eyewall energy gain x2.", "眼墙能量获取 ×2。") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(50) } },
        2: { requirementDescription: function() { return L("500 best warm core", "最佳暖心 500") },
             effectDescription() { return L("Eye upgrades survive landfalls.", "暖心升级在登陆后保留。") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(500) } },
        3: { requirementDescription: function() { return L("5,000 best warm core", "最佳暖心 5,000") },
             effectDescription() { return L("Eyewall energy gain x3.", "眼墙能量获取 ×3。") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(5000) } },
    },
})
