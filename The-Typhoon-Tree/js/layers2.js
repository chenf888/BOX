// ============================================================================
// The Typhoon Tree — js/layers2.js (row 1: conv, mon)
// ============================================================================

// ---------------------------------------------------------------------------
// conv — 对流 Convection (row 1a). Resets latent heat for cloud mass.
// Carries the M3 risk-reward minigame (Convective Burst) and the two
// load-bearing buyables (CAPE -> eyewall fuel, towers -> vapor).
// ---------------------------------------------------------------------------
addLayer("conv", {
    name() { return L("Convection", "对流") },
    symbol: "云",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        burstRunning: false,      // M3 minigame state: plain bool/number only
        burstTarget: 0,
        burstStreak: 0,
        burstResult: 0,           // 0 none, 1 win, -1 miss
    }},
    color: "#AED6F1",
    resource() { return L("Cloud Mass", "云团") },
    row: 1,
    position: 0,
    branches: ["evap"],

    baseResource: "Latent Heat",
    baseAmount() { return player.evap.points },
    requires: new Decimal(300),
    type: "normal",
    exponent: 1 / 3,

    resetsNothing() { return hasMilestone(this.layer, 0) },

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade(this.layer, 12)) m = m.times(upgradeEffect(this.layer, 12))
        if (hasUpgrade(this.layer, 14)) m = m.times(upgradeEffect(this.layer, 14))
        if (player.env) m = m.times(new Decimal(2).add(new Decimal(challengeCompletions("env", 11)).times(0.5)))
        if (hasUpgrade(this.layer, 25)) m = m.times(2)
        if (hasUpgrade(this.layer, 31)) m = m.times(upgradeEffect(this.layer, 31))
        if (hasUpgrade(this.layer, 32)) m = m.times(10)
        if (hasUpgrade(this.layer, 33)) m = m.times(upgradeEffect(this.layer, 33))
        if (hasUpgrade(this.layer, 35)) m = m.times(5)
        if (hasMilestone(this.layer, 1)) m = m.times(2)
        // P10 web: newer layers boost convection
        if (player.band && hasUpgrade("band", 11)) m = m.times(2)
        if (player.land && hasUpgrade("land", 13)) m = m.times(2)
        if (player.eye && hasUpgrade("eye", 18)) m = m.times(player.eye.best.add(1))
        // challenge nerf: wind shear chokes convection (P16 injection)
        if (player.env && inChallenge("env", 11)) m = m.div(1e3)
        // challenge reward: the gauntlet pays into everything
        if (player.env && hasChallenge("env", 31)) m = m.times(challengeEffect("env", 31))
        // casino streak bonus
        m = m.times(streakCloudMult())
        // achievements
        m = m.times(achMults().cloud)
        return m
    },
    gainExp() {
        let e = new Decimal(1)
        if (hasUpgrade(this.layer, 23)) e = e.times(1.05)   // K4 named: 对流组织化
        if (hasMilestone(this.layer, 5)) e = e.times(1.05)
        return e
    },

    // automation ladder step 6 (author #26): normal layers automate through
    // passiveGeneration, not autoPrestige — eyew m3 (wind >= 41.5 m/s)
    passiveGeneration() {
        let n = 0
        if (player.eyew && hasMilestone("eyew", 3)) n += 1
        return n
    },

    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        let kept = ["unlocked", "best", "total"]
        if (hasMilestone(this.layer, 2)) kept.push("upgrades")
        layerDataReset(this.layer, kept)
    },

    layerShown() { return player[this.layer].unlocked || player.evap.best.gte(250) },
    hotkeys: [
        { key: "c", description: function() { return L("C: Reset for Cloud Mass", "C：重置潜热换取云团") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#AED6F1'>" + L("You have ", "你有 ")
                + format(player.evap.points) + L(" Latent Heat", " 潜热")
                + L("  →  Convection builds ", "  →  对流把它组织成 ")
                + "<b style='color:#AED6F1'>" + L("Cloud Mass", "云团") + "</b></h2>"
        }],
        ["display-text", function() {
            return "<span style='opacity:.65'>" + L("Best: ", "最佳：") + formatWhole(player.conv.best)
                + L("  |  Burst streak: ", " ｜ 爆发连胜：") + player.conv.burstStreak + "</span>"
        }],
        "prestige-button", "blank",
        ["blank", "10px"],
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": {
                tabLabel() { return L("Upgrades", "升级") },
                unlocked() { return true },
                content: [["blank", "10px"], "upgrades"],
            },
            "Buyables": {
                tabLabel() { return L("Buyables", "购买项") },
                unlocked() { return hasUpgrade("evap", 25) || getBuyableAmount("conv", 11).gte(1) },
                content: [
                    ["blank", "10px"],
                    ["display-text", function() { return L("Spends Cloud Mass.", "花费云团。") }],
                    "blank", "buyables",
                ],
            },
            "Burst": {
                tabLabel() { return L("Burst", "爆发") },
                unlocked() { return hasMilestone("conv", 3) },
                content: [
                    ["blank", "10px"],
                    ["display-text", function() {
                        return "<span style='opacity:.75'>" + L(
                            "Pay 100 latent heat to force a convective burst. One cloud cell hides a mesocyclone — pick it. A wrong pick resets your streak.",
                            "支付 100 潜热强行引爆对流。六团积云中藏着一个中气旋——点中它。点错连胜归零。") + "</span>"
                    }],
                    ["blank", "10px"],
                    "clickables",
                ],
            },
            "Milestones": {
                tabLabel() { return L("Milestones", "里程碑") },
                unlocked() { return true },
                content: [["blank", "10px"], "milestones"],
            },
        },
    },

    upgrades: {
        rows: 3, cols: 5,
        11: { title: function() { return L("Rising Towers", "塔状积雨云") },
              description() { return L("Double latent heat gain.", "潜热获取 ×2。") },
              cost: new Decimal(1) },
        12: { title: function() { return L("Cell Consolidation", "单体合并") },
              description() { return L("Cloud gain is boosted by your cloud mass (softcapped).", "云团获取随云团量增长（软帽）。") },
              cost: new Decimal(4),
              unlocked() { return hasUpgrade(this.layer, 11) },
              effect() {
                  let r = player.conv.points.add(1).pow(0.45)
                  return softcap(r, new Decimal("1e5"), 0.5)
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: function() { return L("Outflow Boundaries", "出流边界") },
              description() { return L("Double water vapor gain.", "水汽获取 ×2。") },
              cost: new Decimal(25),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        14: { title: function() { return L("Latent Heat Pump", "潜热泵") },
              description() { return L("Cloud gain is boosted by your best latent heat.", "云团获取随最佳潜热增长。") },
              cost: new Decimal(200),
              unlocked() { return hasUpgrade(this.layer, 11) },
              effect() { return player.evap.best.add(1).pow(0.4) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: function() { return L("Investment Zone", "扰动投资区") },
              description() { return L("Unlocks Convection's buyables.", "解锁对流层的购买项。") },
              cost: new Decimal("2e3"),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        21: { title: function() { return L("Vortical Hot Towers", "涡旋热塔") },
              description() { return L("Triple latent heat gain.", "潜热获取 ×3。") },
              cost: new Decimal("5e4"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        22: { title: function() { return L("Shear Training", "抗风切变训练") },
              description() { return L("Cloud gain grows with your Wind Shear completions.", "云团获取随「风切变」挑战通关数增长。") },
              cost: new Decimal("1e6"),
              unlocked() { return hasUpgrade(this.layer, 15) },
              effectDisplay() { return "x" + format(new Decimal(2).add(player.env ? new Decimal(challengeCompletions("env", 11)).times(0.5) : new Decimal(0))) } },
        23: { title: function() { return L("Convective Organization", "对流组织化") },
              description() { return L("Raises cloud gain to a power of 1.05.", "云团获取变为 1.05 次方。") },
              cost: new Decimal("5e7"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        24: { title: function() { return L("Moist Convection Feed", "湿对流供给") },
              description() { return L("Monsoon flux gain x2.", "季风通量获取 ×2。") },
              cost: new Decimal("2e9"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        25: { title: function() { return L("Rainband Genesis", "雨带萌芽") },
              description() { return L("Double cloud gain. Rainbands begin to spiral.", "云团获取 ×2。雨带开始成螺旋。") },
              cost: new Decimal("1e11"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        31: { title: function() { return L("Angular Momentum", "角动量汇聚") },
              description() { return L("Cloud gain is boosted by your best vorticity.", "云团获取随最佳涡度增长。") },
              cost: new Decimal("1e13"),
              unlocked() { return hasUpgrade(this.layer, 25) },
              effect() { return player.vor ? player.vor.best.add(1).pow(0.3) : new Decimal(1) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        32: { title: function() { return L("The Storm Organizes", "风暴成形") },
              description() { return L("A center is found. Cloud gain x10.", "中心找到了。云团获取 ×10。") },
              cost: new Decimal(5),                                  // deliberate key drop
              unlocked() { return hasUpgrade(this.layer, 25) } },
        33: { title: function() { return L("Central Dense Overcast", "中心密蔽云区") },
              description() { return L("Cloud gain is boosted by the log of your latent heat.", "云团获取随潜热对数增长。") },
              cost: new Decimal("1e15"),
              unlocked() { return hasUpgrade(this.layer, 25) },
              effect() { return player.evap.best.add(1).log10().add(1).pow(2) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        34: { title: function() { return L("Condensation Heating", "凝结加热") },
              description() { return L("Produces vapor equal to 5% of your best latent heat per second.", "每秒产出相当于最佳潜热 5% 的水汽。") },
              cost: new Decimal("1e17"),
              unlocked() { return hasUpgrade(this.layer, 25) } },
        35: { title: function() { return L("Deep Convection", "深对流") },
              description() { return L("Quintuple cloud gain.", "云团获取 ×5。") },
              cost: new Decimal("1e19"),
              unlocked() { return hasUpgrade(this.layer, 25) } },
    },

    buyables: {
        11: { title: function() { return L("CAPE", "对流有效位能") },
              cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },     // invertible base 3 (P54)
              purchaseLimit: new Decimal(Infinity),
              effect(x) { return x.times(0.4).add(1) },                        // consumer: eyewall fuel
              display() {
                  let d = tmp[this.layer].buyables[this.id]
                  return L("Fuel for the eyewall: ", "眼墙燃料：") + format(d.effect) + "x<br>"
                      + L("Level: ", "等级：") + formatWhole(getBuyableAmount(this.layer, this.id)) + "<br>"
                      + L("Cost: ", "价格：") + format(d.cost) + L(" Cloud Mass", " 云团")
              },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              },
              buyMax() {                                                       // P54 closed-form (eye m0 driver)
                  let target = player[this.layer].points.div(10).max(1).log(3).floor().add(1)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).max(target))
              } },
        12: { title: function() { return L("Convective Tower", "对流塔") },
              cost(x) { return new Decimal(25).times(Decimal.pow(2.5, x)) },
              purchaseLimit: new Decimal(Infinity),
              effect(x) { return x.times(0.05).add(1) },                       // consumer: getPointGen (mod.js)
              display() {
                  let d = tmp[this.layer].buyables[this.id]
                  return L("Vapor x", "水汽 ×") + format(d.effect) + "<br>"
                      + L("Level: ", "等级：") + formatWhole(getBuyableAmount(this.layer, this.id)) + "<br>"
                      + L("Cost: ", "价格：") + format(d.cost) + L(" Cloud Mass", " 云团")
              },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },

    clickables: {
        11: { title: function() { return L("Force a Burst", "强行引爆") },
              display() {
                  return player.conv.burstRunning
                      ? L("A burst is running — pick a cell!", "引爆进行中——选一块云！")
                      : L("Pay 100 Latent Heat to start a run.", "支付 100 潜热开始一次引爆。")
              },
              canClick() { return !player.conv.burstRunning && hasMilestone(this.layer, 3) && player.evap.points.gte(TUNING.BURST_STAKE) },
              onClick() {
                  player.evap.points = player.evap.points.sub(TUNING.BURST_STAKE)
                  player.conv.burstRunning = true
                  player.conv.burstTarget = 1 + Math.floor(Math.random() * TUNING.BURST_CELLS)
                  player.conv.burstResult = 0
              },
              style() { return { 'background-color': player.conv.burstRunning ? "#7FB3D5" : "#1B4F72" } } },
        21: { display() { return player.conv.burstRunning ? "☁" : (player.conv.burstResult === 1 && player.conv.burstTarget === 1 ? "🌀" : "☁") },
              canClick() { return player.conv.burstRunning },
              onClick() {
                  if (1 === player.conv.burstTarget) {
                      player.conv.burstStreak += 1
                      let win = new Decimal(TUNING.BURST_STAKE).times(Math.min(2 + player.conv.burstStreak, TUNING.BURST_PAYOUT_CAP))
                      player.evap.points = player.evap.points.add(win)
                      player.conv.burstResult = 1
                  } else { player.conv.burstStreak = 0; player.conv.burstResult = -1 }
                  player.conv.burstRunning = false
              },
              style() { return { 'background-color': player.conv.burstRunning ? "#AED6F1" : "#17202A" } } },
        22: { display() { return player.conv.burstRunning ? "☁" : (player.conv.burstResult === 1 && player.conv.burstTarget === 2 ? "🌀" : "☁") },
              canClick() { return player.conv.burstRunning },
              onClick() {
                  if (2 === player.conv.burstTarget) {
                      player.conv.burstStreak += 1
                      let win = new Decimal(TUNING.BURST_STAKE).times(Math.min(2 + player.conv.burstStreak, TUNING.BURST_PAYOUT_CAP))
                      player.evap.points = player.evap.points.add(win)
                      player.conv.burstResult = 1
                  } else { player.conv.burstStreak = 0; player.conv.burstResult = -1 }
                  player.conv.burstRunning = false
              },
              style() { return { 'background-color': player.conv.burstRunning ? "#AED6F1" : "#17202A" } } },
        23: { display() { return player.conv.burstRunning ? "☁" : (player.conv.burstResult === 1 && player.conv.burstTarget === 3 ? "🌀" : "☁") },
              canClick() { return player.conv.burstRunning },
              onClick() {
                  if (3 === player.conv.burstTarget) {
                      player.conv.burstStreak += 1
                      let win = new Decimal(TUNING.BURST_STAKE).times(Math.min(2 + player.conv.burstStreak, TUNING.BURST_PAYOUT_CAP))
                      player.evap.points = player.evap.points.add(win)
                      player.conv.burstResult = 1
                  } else { player.conv.burstStreak = 0; player.conv.burstResult = -1 }
                  player.conv.burstRunning = false
              },
              style() { return { 'background-color': player.conv.burstRunning ? "#AED6F1" : "#17202A" } } },
        24: { display() { return player.conv.burstRunning ? "☁" : (player.conv.burstResult === 1 && player.conv.burstTarget === 4 ? "🌀" : "☁") },
              canClick() { return player.conv.burstRunning },
              onClick() {
                  if (4 === player.conv.burstTarget) {
                      player.conv.burstStreak += 1
                      let win = new Decimal(TUNING.BURST_STAKE).times(Math.min(2 + player.conv.burstStreak, TUNING.BURST_PAYOUT_CAP))
                      player.evap.points = player.evap.points.add(win)
                      player.conv.burstResult = 1
                  } else { player.conv.burstStreak = 0; player.conv.burstResult = -1 }
                  player.conv.burstRunning = false
              },
              style() { return { 'background-color': player.conv.burstRunning ? "#AED6F1" : "#17202A" } } },
        25: { display() { return player.conv.burstRunning ? "☁" : (player.conv.burstResult === 1 && player.conv.burstTarget === 5 ? "🌀" : "☁") },
              canClick() { return player.conv.burstRunning },
              onClick() {
                  if (5 === player.conv.burstTarget) {
                      player.conv.burstStreak += 1
                      let win = new Decimal(TUNING.BURST_STAKE).times(Math.min(2 + player.conv.burstStreak, TUNING.BURST_PAYOUT_CAP))
                      player.evap.points = player.evap.points.add(win)
                      player.conv.burstResult = 1
                  } else { player.conv.burstStreak = 0; player.conv.burstResult = -1 }
                  player.conv.burstRunning = false
              },
              style() { return { 'background-color': player.conv.burstRunning ? "#AED6F1" : "#17202A" } } },
        26: { display() { return player.conv.burstRunning ? "☁" : (player.conv.burstResult === 1 && player.conv.burstTarget === 6 ? "🌀" : "☁") },
              canClick() { return player.conv.burstRunning },
              onClick() {
                  if (6 === player.conv.burstTarget) {
                      player.conv.burstStreak += 1
                      let win = new Decimal(TUNING.BURST_STAKE).times(Math.min(2 + player.conv.burstStreak, TUNING.BURST_PAYOUT_CAP))
                      player.evap.points = player.evap.points.add(win)
                      player.conv.burstResult = 1
                  } else { player.conv.burstStreak = 0; player.conv.burstResult = -1 }
                  player.conv.burstRunning = false
              },
              style() { return { 'background-color': player.conv.burstRunning ? "#AED6F1" : "#17202A" } } },
    },

    milestones: {
        0: { requirementDescription: function() { return L("600 best cloud mass", "最佳云团 600") },
             effectDescription() { return L("Convection no longer resets the sea below it.", "对流重置不再清空下方海面。") },
             done() { return player[this.layer].best.gte(600) } },
        1: { requirementDescription: function() { return L("2,000 best cloud mass", "最佳云团 2,000") },
             effectDescription() { return L("Cloud gain x2.", "云团获取 ×2。") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(2e3) } },
        2: { requirementDescription: function() { return L("1e4 best cloud mass", "最佳云团 1e4") },
             effectDescription() { return L("Upgrades survive convection resets.", "对流重置时保留升级。") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(1e4) } },
        3: { requirementDescription: function() { return L("1e6 best cloud mass", "最佳云团 1e6") },
             effectDescription() { return L("Unlock the Convective Burst minigame.", "解锁「对流爆发」小游戏。") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(1e6) } },
        4: { requirementDescription: function() { return L("1e8 best cloud mass", "最佳云团 1e8") },
             effectDescription() { return L("Latent heat gain x3.", "潜热获取 ×3。") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].best.gte(1e8) } },
        5: { requirementDescription: function() { return L("1e10 best cloud mass", "最佳云团 1e10") },
             effectDescription() { return L("Raises cloud gain to a power of 1.05.", "云团获取变为 1.05 次方。") },
             unlocked() { return hasMilestone(this.layer, 4) },
             done() { return player[this.layer].best.gte(1e10) } },
    },
})
