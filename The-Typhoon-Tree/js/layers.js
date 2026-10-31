// ============================================================================
// The Typhoon Tree — js/layers.js
// One inline addLayer per layer (N-FACTORY), bottom row first.
// Every effect() id is consumed somewhere (N-UNWIRED): token upgrades carry
// no effect(), value upgrades name their consumer in the comment.
// ============================================================================

// ---------------------------------------------------------------------------
// evap — 蒸发 Evaporation (row 0, anchor). Resets water vapor for latent heat.
// ---------------------------------------------------------------------------
addLayer("evap", {
    name() { return L("Evaporation", "蒸发") },
    symbol: "汽",
    position: 0,
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#2E86C1",
    resource() { return L("Latent Heat", "潜热") },
    row: 0,

    baseResource: L("Water Vapor", "水汽"),
    baseAmount() { return player.points },
    requires: new Decimal(10),
    type: "normal",
    exponent: 0.5,

    gainMult() {
        let m = new Decimal(1)
        // own upgrades (tokens wired here)
        if (hasUpgrade(this.layer, 12)) m = m.times(upgradeEffect(this.layer, 12))
        if (hasUpgrade(this.layer, 15)) m = m.times(2)
        if (hasUpgrade(this.layer, 22)) m = m.times(2.5)
        if (hasUpgrade(this.layer, 23)) m = m.times(upgradeEffect(this.layer, 23))
        if (hasUpgrade(this.layer, 33)) m = m.times(10)
        // P10 web: newer layers boost the anchor
        if (player.conv && hasUpgrade("conv", 11)) m = m.times(2)
        if (player.conv && hasUpgrade("conv", 21)) m = m.times(3)
        if (player.conv && hasMilestone("conv", 4)) m = m.times(3)
        if (player.band && hasUpgrade("band", 14)) m = m.times(upgradeEffect("band", 14))
        if (player.eye && hasUpgrade("eye", 13)) m = m.times(player.eye.best.add(1))
        if (player.vor && hasMilestone("vor", 4)) m = m.times(5)
        if (player.land && hasUpgrade("land", 12)) m = m.times(player.land.count.div(10).add(1))
        // monsoon strength effect (latent side)
        m = m.times(monsoonLatentMult())
        // achievements
        m = m.times(achMults().latent)
        // env challenge rewards (12 dry-air adaptation -> latent, 31 gauntlet -> all)
        if (player.env && hasChallenge("env", 12)) m = m.times(challengeEffect("env", 12))
        if (player.env && hasChallenge("env", 31)) m = m.times(challengeEffect("env", 31))
        return m
    },
    gainExp() {
        let e = new Decimal(1)
        if (hasUpgrade(this.layer, 24)) e = e.times(1.05)          // K4 named: 蒸发效率
        if (player.env && inChallenge("env", 21)) e = e.times(0.5) // cold surge nerf
        return e
    },
    passiveGeneration() {
        let n = 0                                                   // plain number (N-PGBOOL)
        if (hasUpgrade(this.layer, 21)) n += 0.1
        if (player.mon && hasMilestone("mon", 1)) n += 1
        if (player.ach && hasAchievement("ach", 105)) n += 1
        return n
    },

    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return        // vanilla guard (F17)
        let kept = ["unlocked", "best", "total"]            // milestones read best
        if (hasMilestone(this.layer, 2)) kept.push("upgrades")
        layerDataReset(this.layer, kept)
    },

    // automation ladder step 1: conv m0 — evaporating no longer wipes the vapor
    resetsNothing() { return player.conv && hasMilestone("conv", 0) },

    layerShown() { return true },
    hotkeys: [
        { key: "e", description: function() { return L("E: Reset for Latent Heat", "E：重置水汽换取潜热") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#7FB3D5'>" + L("You have ", "你有 ")
                + format(player.points) + L(" Water Vapor", " 水汽")
                + L(" (", "（") + format(getPointGen()) + L("/s)", " /秒）") + "</h2>"
        }],
        ["display-text", function() {
            return "<span style='opacity:.65'>" + L("Evaporation turns vapor into ", "蒸发把水汽化为")
                + "<b style='color:#2E86C1'>" + L("Latent Heat", "潜热") + "</b>"
                + L(" — the storm's fuel reserve.", " —— 风暴的燃料储备。") + "</span>"
        }],
        "prestige-button", "blank",
        ["display-text", function() {
            let t = L("Best: ", "最佳：") + formatWhole(player.evap.best) + L("  |  Lifetime: ", " ｜ 累计：") + formatWhole(player.evap.total)
            return t
        }],
        ["blank", "10px"],
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": {
                tabLabel() { return L("Upgrades", "升级") },
                unlocked() { return true },
                content: [
                    ["blank", "10px"],
                    ["raw-html", function() { return "<div style='opacity:.5'>" + L("Each row of the grid gates the next — spend latent heat wisely.", "每排升级解锁下一排——把潜热花在刀刃上。") + "</div>" }], "blank",
                    "upgrades",
                ],
            },
            "Milestones": {
                tabLabel() { return L("Milestones", "里程碑") },
                unlocked() { return true },
                content: [
                    ["blank", "10px"],
                    ["display-text", function() { return L("Milestones score on your <b>best</b> latent heat and never reset.", "里程碑按<b>最佳</b>潜热结算，永不回退。") }],
                    "blank", "milestones",
                ],
            },
        },
    },

    upgrades: {
        rows: 3, cols: 5,
        11: { title: function() { return L("First Raindrop", "第一滴雨") },
              description() { return L("Double water vapor gain.", "水汽获取 ×2。") },
              cost: new Decimal(1) },
        12: { title: function() { return L("Condensation Nuclei", "凝结核") },
              description() { return L("Latent heat gain is boosted by your vapor (softcapped).", "潜热获取随水汽增长（软帽）。") },
              cost: new Decimal(3),
              unlocked() { return hasUpgrade(this.layer, 11) },
              effect() {
                  let r = player.points.add(1).pow(0.35)
                  return softcap(r, new Decimal("1e6"), 0.5)
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: function() { return L("Warm Sea Surface", "暖海面") },
              description() { return L("Triple water vapor gain. The sea is 29°C and rising.", "水汽获取 ×3。海温 29°C，还在升。") },
              cost: new Decimal(10),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        14: { title: function() { return L("First Updraft", "第一股上升气流") },
              description() { return L("x5 vapor once your best latent heat reaches 100.", "最佳潜热达到 100 后水汽 ×5。") },
              cost: new Decimal(50),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        15: { title: function() { return L("Latent Heat Bank", "潜热库") },
              description() { return L("Double latent heat gain.", "潜热获取 ×2。") },
              cost: new Decimal(300),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        21: { title: function() { return L("Sea Spray", "飞沫") },
              description() { return L("Passively generate 10% of your latent heat gain per second.", "每秒被动获得 10% 的潜热声望收益。") },
              cost: new Decimal("2e3"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        22: { title: function() { return L("Evaporation Front", "蒸发锋") },
              description() { return L("Latent heat gain x2.5.", "潜热获取 ×2.5。") },
              cost: new Decimal("1.5e4"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        23: { title: function() { return L("Deep Layer Moisture", "深层湿区") },
              description() { return L("Latent heat gain is boosted by your best latent heat.", "潜热获取随最佳潜热增长（有软帽）。") },
              cost: new Decimal("1e5"),
              unlocked() { return hasUpgrade(this.layer, 15) },
              effect() {
                  let r = player.evap.best.add(1).pow(0.5)
                  return softcap(r, new Decimal("1e4"), 0.5)
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: function() { return L("Evaporation Efficiency", "蒸发效率") },
              description() { return L("Raises latent heat gain to a power of 1.05.", "潜热获取变为 1.05 次方。") },
              cost: new Decimal("1e6"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        25: { title: function() { return L("First Towers", "首批云塔") },
              description() { return L("Unlocks Convection's buyables.", "解锁对流层的可重复购买。") },
              cost: new Decimal("5e7"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        31: { title: function() { return L("Coriolis Kick", "科氏力一踢") },
              description() { return L("Triple water vapor gain. The planet starts helping.", "水汽获取 ×3。行星开始帮你了。") },
              cost: new Decimal("4e9"),
              unlocked() { return hasUpgrade(this.layer, 25) } },
        32: { title: function() { return L("Ocean Heat Content", "海洋热含量") },
              description() { return L("Latent heat gain is boosted by the log of your vapor.", "潜热获取随水汽的对数增长。") },
              cost: new Decimal("5e11"),
              unlocked() { return hasUpgrade(this.layer, 25) },
              effect() { return player.points.add(1).log10().add(1).pow(2) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        33: { title: function() { return L("Typhoon Seed", "台风之种") },
              description() { return L("Something organizes. Latent heat gain x10.", "有什么组织起来了。潜热获取 ×10。") },
              cost: new Decimal(7),                                   // deliberate key drop (11 §3)
              unlocked() { return hasUpgrade(this.layer, 25) } },
        34: { title: function() { return L("Monsoon Link", "季风之链") },
              description() { return L("Monsoon trough flux gain x3.", "季风槽通量获取 ×3。") },
              cost: new Decimal("2e13"),
              unlocked() { return hasUpgrade(this.layer, 25) } },
        35: { title: function() { return L("Genesis Region", "生成区") },
              description() { return L("Vapor gain is boosted by the log of your vapor.", "水汽获取随自身对数增长。") },
              cost: new Decimal("1e15"),
              unlocked() { return hasUpgrade(this.layer, 25) },
              effect() { return player.points.add(1).log10().add(1).pow(1.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },

    milestones: {
        0: { requirementDescription: function() { return L("5,000 best latent heat", "最佳潜热 5,000") },
             effectDescription() { return L("Latent heat gain x2.5.", "潜热获取 ×2.5。") },
             done() { return player[this.layer].best.gte(5000) } },
        1: { requirementDescription: function() { return L("50,000 best latent heat", "最佳潜热 50,000") },
             effectDescription() { return L("Water vapor gain x2.", "水汽获取 ×2。") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(5e4) } },
        2: { requirementDescription: function() { return L("500,000 best latent heat", "最佳潜热 500,000") },
             effectDescription() { return L("Upgrades survive evaporation resets.", "蒸发重置时保留升级。") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(5e5) } },
        3: { requirementDescription: function() { return L("5e7 best latent heat", "最佳潜热 5e7") },
             effectDescription() { return L("Monsoon transport runs 25% faster.", "季风输送提速 25%。") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(5e7) } },
        4: { requirementDescription: function() { return L("5e9 best latent heat", "最佳潜热 5e9") },
             effectDescription() { return L("Latent heat gain x3.", "潜热获取 ×3。") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].best.gte(5e9) } },
    },
})
