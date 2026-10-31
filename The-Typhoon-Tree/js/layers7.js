// ============================================================================
// The Typhoon Tree — js/layers7.js (row 3c: suh + row 4: land)
// suh — 副热带高压 Subtropical High (M8 shop, type none). The steering flow
//   accrues in update() from wind + cloud, and feeds the eyewall inflow via
//   suhSteerMult(). Pays with latent heat (currencyLocation trio).
// land — 登陆 Landfall (M19 consumable reset, custom/sim). The four burn
//   terms are itemized and displayed; a landfall wipes rows 0-3 (engine
//   rowReset) and converts them into fuel.
// Consumers wired elsewhere: suh u11 -> getPointGen ^1.1, u12 -> monsoon
//   cycle/speed, u13 -> vor.gainExp, u15 -> pump CD, u16 -> fujiwhara flux;
//   land u11/u23/u34/b41 -> getPointGen, u12 -> evap.gainMult, u13 ->
//   conv.gainMult, u21 -> band/vor gainMult, u25 -> monsoon cycle, m0 ->
//   mon automation, m3 -> band/vor autoPrestige, m7 -> vapor x10, m9 ->
//   isEndgame.
// ============================================================================

// ---------------------------------------------------------------------------
// suh
// ---------------------------------------------------------------------------
addLayer("suh", {
    name() { return L("Subtropical High", "副热带高压") },
    symbol: "高",
    position: 2,
    startData() { return {
        unlocked: false,             // written by getPointGen when eyew m0 (mod.js)
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        steer: new Decimal(0),       // accrued steering reading (internal state)
    }},
    color: "#F4D03F",
    resource() { return L("Steering", "引导气流") },
    row: 3,
    position: 2,
    branches: ["eyew", "eye"],

    type: "none",

    // steering accrual (sanctioned internal-state write)
    update(diff) {
        if (!player[this.layer].unlocked) return
        let ndiff = new Decimal(diff)
        let rate = windMS().times(TUNING.STEER_WIND_RATE)
            .add(player.conv.best.add(1).log10().times(TUNING.STEER_CLOUD_RATE))
        if (hasMilestone(this.layer, 0)) rate = rate.times(2)
        if (hasUpgrade(this.layer, 18)) rate = rate.times(1.5)
        if (hasUpgrade(this.layer, 19) && player.land && player.land.count.gte(1)) rate = rate.times(1.5)
        if (hasMilestone("land", 6)) rate = rate.times(2)
        let cap = new Decimal(TUNING.STEER_CAP)
        if (hasUpgrade(this.layer, 21)) cap = cap.times(2)
        if (hasMilestone(this.layer, 3)) cap = cap.add(500)
        player.suh.steer = player.suh.steer.add(rate.times(ndiff)).min(cap)
    },

    layerShown() { return player[this.layer].unlocked },

    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#F4D03F'>" + L("The ridge presses down on the western Pacific.", "副热带高压压在西太平洋上。") + "</h2>"
        }],
        ["display-text", function() {
            if (!hasUpgrade(this.layer, 17)) return ""
            let s = player.suh.steer || new Decimal(0)
            return "<span style='opacity:.75'>" + L("Steering flow reading: ", "引导气流读数：") + format(s)
                + L("  (feeds the eyewall inflow)", "（馈入眼墙能量流入）") + "</span>"
        }],
        ["blank", "10px"],
        ["display-text", function() {
            return "<span style='opacity:.5'>" + L("A shop, not a storm: the ridge sells its favor for latent heat.", "这不是风暴，是商店：高压用潜热出售它的偏爱。") + "</span>"
        }],
        ["blank", "10px"],
        "upgrades",
        ["blank", "15px"],
        "milestones",
        ["blank", "65px"],
    ],

    upgrades: {
        rows: 2, cols: 10,
        11: { title: function() { return L("Ridge Axis Shift", "脊轴西伸") },
              description() { return L("Raises water vapor gain to a power of 1.1.", "水汽获取变为 1.1 次方。") },
              cost: new Decimal("1e3"),
              currencyDisplayName: L("Latent Heat", "潜热"),
              currencyInternalName: "points",
              currencyLocation() { return player.evap } },
        12: { title: function() { return L("Deep Layer Flow", "深厚气流层") },
              description() { return L("Raises monsoon transport output and speed to a power of 1.1, and +10% speed.", "季风输送产出与速度变为 1.1 次方，且速度 +10%。") },
              cost: new Decimal("3e3"),
              currencyDisplayName: L("Latent Heat", "潜热"),
              currencyInternalName: "points",
              currencyLocation() { return player.evap } },
        13: { title: function() { return L("Beta Drift Correction", "Beta 漂移修正") },
              description() { return L("Raises vorticity gain to a power of 1.1.", "涡度获取变为 1.1 次方。") },
              cost: new Decimal("1e4"),
              currencyDisplayName: L("Latent Heat", "潜热"),
              currencyInternalName: "points",
              currencyLocation() { return player.evap } },
        14: { title: function() { return L("Ventilation Duct", "通风管道") },
              description() { return L("Raises eyewall energy inflow to a power of 1.1.", "眼墙能量流入变为 1.1 次方。") },
              cost: new Decimal("3e4"),
              currencyDisplayName: L("Latent Heat", "潜热"),
              currencyInternalName: "points",
              currencyLocation() { return player.evap } },
        15: { title: function() { return L("Anticyclonic Shear", "反气旋切变") },
              description() { return L("Cloud seeding cooldown halved.", "人工增雨冷却减半。") },
              cost: new Decimal("1e5"),
              currencyDisplayName: L("Latent Heat", "潜热"),
              currencyInternalName: "points",
              currencyLocation() { return player.evap } },
        16: { title: function() { return L("Fujiwhara Favor", "藤原偏爱") },
              description() { return L("The Fujiwhara challenge's flux reward is doubled.", "藤原效应挑战的通量奖励翻倍。") },
              cost: new Decimal("3e5"),
              currencyDisplayName: L("Latent Heat", "潜热"),
              currencyInternalName: "points",
              currencyLocation() { return player.evap } },
        17: { title: function() { return L("Published Charts", "公开气象图") },
              description() { return L("Shows the steering flow reading.", "显示引导气流读数。") },
              cost: new Decimal("1e6"),
              currencyDisplayName: L("Latent Heat", "潜热"),
              currencyInternalName: "points",
              currencyLocation() { return player.evap } },
        18: { title: function() { return L("Steady Ridge", "稳定高压坝") },
              description() { return L("Steering accrues 50% faster.", "引导气流积聚加快 50%。") },
              cost: new Decimal("3e6"),
              currencyDisplayName: L("Latent Heat", "潜热"),
              currencyInternalName: "points",
              currencyLocation() { return player.evap } },
        19: { title: function() { return L("Post-Landfall Ridge", "登陆后高压") },
              description() { return L("Steering accrues 50% faster once you have made landfall.", "首次登陆后引导气流积聚再加快 50%。") },
              cost: new Decimal("1e7"),
              currencyDisplayName: L("Latent Heat", "潜热"),
              currencyInternalName: "points",
              currencyLocation() { return player.evap } },
        20: { title: function() { return L("Cloud Field Gradient", "云场梯度") },
              description() { return L("Eyewall energy inflow is boosted by the log of your best cloud mass.", "眼墙能量流入随最佳云团的对数增长。") },
              cost: new Decimal("3e7"),
              currencyDisplayName: L("Latent Heat", "潜热"),
              currencyInternalName: "points",
              currencyLocation() { return player.evap } },
        21: { title: function() { return L("Continental High", "大陆高压") },
              description() { return L("Steering capacity doubled.", "引导气流容量翻倍。") },
              cost: new Decimal("1e8"),
              currencyDisplayName: L("Latent Heat", "潜热"),
              currencyInternalName: "points",
              currencyLocation() { return player.evap } },
        22: { title: function() { return L("Two-Cell Ridge", "双脊局") },
              description() { return L("Eyewall energy inflow x2.", "眼墙能量流入 ×2。") },
              cost: new Decimal("3e8"),
              currencyDisplayName: L("Latent Heat", "潜热"),
              currencyInternalName: "points",
              currencyLocation() { return player.evap } },
    },

    milestones: {
        0: { requirementDescription: function() { return L("Buy 4 upgrades", "购买 4 个升级") },
             effectDescription() { return L("Steering accrues twice as fast.", "引导气流积聚速度翻倍。") },
             done() { return player[this.layer].upgrades.length >= 4 } },
        1: { requirementDescription: function() { return L("Buy 8 upgrades", "购买 8 个升级") },
             effectDescription() { return L("Eyewall energy inflow x2.", "眼墙能量流入 ×2。") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].upgrades.length >= 8 } },
        2: { requirementDescription: function() { return L("Buy 12 upgrades", "购买 12 个升级") },
             effectDescription() { return L("Water vapor gain x2.", "水汽获取 ×2。") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].upgrades.length >= 12 } },
        3: { requirementDescription: function() { return L("Make a landfall", "完成一次登陆") },
             effectDescription() { return L("Steering capacity +500.", "引导气流容量 +500。") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player.land && player.land.count.gte(1) } },
    },
})

// ---------------------------------------------------------------------------
// land
// ---------------------------------------------------------------------------
function landBurnTerm(res, weight) {
    let t = res.add(1).log10().max(0).pow(TUNING.LANDFALL_POW).times(weight)
    return softcap(t, new Decimal(weight * 50), 0.4)
}

addLayer("land", {
    name() { return L("Landfall", "登陆") },
    symbol: "陆",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        count: new Decimal(0),       // landfalls made (kept forever)
        maxWind: new Decimal(0),     // strongest wind at any landfall (kept)
    }},
    color: "#EC7063",
    resource() { return L("Storm Fuel", "风暴燃料") },
    row: 4,
    position: 0,
    branches: ["eyew", "suh"],

    type: "custom",

    // display/unlock threshold; the real gate is the wind speed (canReset)
    baseAmount() { return windMS() },
    requires: new Decimal(TUNING.LANDFALL_WIND),

    canReset() { return windMS().gte(TUNING.LANDFALL_WIND) },
    getNextAt() { return new Decimal(Infinity) },

    getResetGain() {
        let g = landBurnTerm(player.points, TUNING.LANDFALL_MULT[0])
            .add(landBurnTerm(player.conv.points, TUNING.LANDFALL_MULT[1]))
            .add(landBurnTerm(player.vor.points, TUNING.LANDFALL_MULT[2]))
            .add(landBurnTerm(player.eyew.energy, TUNING.LANDFALL_MULT[3]))
        if (hasUpgrade(this.layer, 14)) g = g.times(1.5)
        if (hasUpgrade(this.layer, 24)) g = g.times(3)
        if (hasMilestone(this.layer, 1)) g = g.times(1.5)
        if (hasMilestone(this.layer, 5)) g = g.times(2)
        if (hasMilestone(this.layer, 8)) g = g.times(2.5)
        if (hasUpgrade(this.layer, 31)) g = g.times(player.land.count.div(20).add(1))
        if (hasUpgrade(this.layer, 32)) g = g.times(player.evap.best.add(1).log10().add(1))
        if (hasUpgrade(this.layer, 33) && windMS().gte(51)) g = g.times(2)
        if (hasUpgrade(this.layer, 35)) g = g.times(player.land.maxWind.div(10).add(1))
        return g.floor().max(1)
    },

    onPrestige(gain) {
        let w = windMS()
        if (w.gt(player.land.maxWind)) player.land.maxWind = w
        player.land.count = player.land.count.add(1)
    },

    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        layerDataReset(this.layer, ["unlocked", "best", "total", "count", "maxWind"])
    },

    layerShown() { return player[this.layer].unlocked || (player.eyew && hasMilestone("eyew", 2)) },
    hotkeys: [
        { key: "l", description: function() { return L("L: Make Landfall", "L：登陆") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        ["display-text", function() {
            let w = windMS()
            return "<h2 style='color:#B03A2E'>" + format(w, 1) + " m/s — " + windCatName(w) + "</h2>"
        }],
        ["display-text", function() {
            return "<span style='opacity:.75'>" + L("The storm must be at least a typhoon (32.7 m/s) to reach land.", "风暴必须至少达到台风级（32.7 m/s）才能登陆。") + "</span>"
        }],
        ["blank", "5px"],
        ["display-text", function() {
            let t = [
                [L("Water vapor", "水汽"), player.points, TUNING.LANDFALL_MULT[0]],
                [L("Cloud mass", "云团"), player.conv.points, TUNING.LANDFALL_MULT[1]],
                [L("Vorticity", "涡度"), player.vor.points, TUNING.LANDFALL_MULT[2]],
                [L("Eyewall energy", "眼墙能量"), player.eyew.energy, TUNING.LANDFALL_MULT[3]],
            ]
            let s = "<b style='color:#B03A2E'>" + L("Burn ledger:", "燃烧清单：") + "</b><br>"
            for (let i = 0; i < t.length; i++) {
                s += format(landBurnTerm(t[i][1], t[i][2]), 2) + L("  from ", "  来自 ") + t[i][0]
                    + " <span style='opacity:.4'>(" + format(t[i][1]) + ")</span><br>"
            }
            return s
        }],
        "prestige-button", "blank",
        ["display-text", function() {
            return "<span style='opacity:.65'>" + L("Landfalls: ", "登陆次数：") + formatWhole(player.land.count)
                + L("  |  strongest at landfall: ", " ｜ 登陆瞬间最强风速：") + format(player.land.maxWind, 1) + " m/s</span>"
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
                    ["display-text", function() {
                        return "<span style='opacity:.5'>" + L("Each landfall burns the tree below and refines the storm's legacy.", "每次登陆烧毁下方的树，也锤炼风暴的遗产。") + "</span>"
                    }], "blank",
                    "upgrades",
                    ["blank", "10px"],
                    "buyables",
                ],
            },
            "Milestones": {
                tabLabel() { return L("Milestones", "里程碑") },
                unlocked() { return true },
                content: [
                    ["blank", "10px"],
                    ["display-text", function() {
                        return "<span style='opacity:.65'>" + L("The landfall chain is scored on landfalls made — nothing can take them from you.", "登陆链按已完成登陆结算——没有任何东西能夺走它们。") + "</span>"
                    }],
                    "blank", "milestones",
                ],
            },
        },
    },

    upgrades: {
        rows: 3, cols: 5,
        11: { title: function() { return L("Storm Surge", "风暴潮") },
              description() { return L("Water vapor gain x2.", "水汽获取 ×2。") },
              cost: new Decimal(1) },
        12: { title: function() { return L("Rain Shield", "雨幕之盾") },
              description() { return L("Latent heat gain is boosted by your landfalls.", "潜热获取随登陆次数增长。") },
              cost: new Decimal(3),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        13: { title: function() { return L("Coastal Convergence", "海岸辐合") },
              description() { return L("Cloud mass gain x2.", "云团获取 ×2。") },
              cost: new Decimal(10),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        14: { title: function() { return L("Debris Field", "废墟场") },
              description() { return L("Storm fuel gain x1.5.", "风暴燃料获取 ×1.5。") },
              cost: new Decimal(40),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        15: { title: function() { return L("Emergency Broadcast", "紧急广播") },
              description() { return L("Unlocks the Surge buyable.", "解锁「风暴潮」可重复购买。") },
              cost: new Decimal(150),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        21: { title: function() { return L("Levee Engineering", "堤坝工程") },
              description() { return L("Rainband floors cost x0.85; vorticity gain x2.", "雨带楼层成本 ×0.85；涡度获取 ×2。") },
              cost: new Decimal(600),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        22: { title: function() { return L("Inland Moisture", "内陆湿气") },
              description() { return L("Eyewall energy inflow x2.", "眼墙能量流入 ×2。") },
              cost: new Decimal("2.5e3"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        23: { title: function() { return L("Memorial Rain", "纪念之雨") },
              description() { return L("Water vapor gain is boosted by your landfalls.", "水汽获取随登陆次数增长。") },
              cost: new Decimal("1e4"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        24: { title: function() { return L("The Day After", "次日清晨") },
              description() { return L("Storm fuel gain x3. Cleanup is where the stories are.", "风暴燃料获取 ×3。故事都藏在灾后清整里。") },
              cost: new Decimal(7),                                  // deliberate key drop (11 §3)
              unlocked() { return hasUpgrade(this.layer, 15) } },
        25: { title: function() { return L("Monsoon Recall", "季风回响") },
              description() { return L("Monsoon flux per transport cycle x3.", "季风每输送周期通量 ×3。") },
              cost: new Decimal("4e4"),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        31: { title: function() { return L("Return Period", "重现期") },
              description() { return L("Storm fuel gain is boosted by your landfall count.", "风暴燃料获取随登陆次数增长。") },
              cost: new Decimal("2e5"),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        32: { title: function() { return L("Sediment Layers", "沉积层") },
              description() { return L("Storm fuel gain is boosted by the log of your best latent heat.", "风暴燃料获取随最佳潜热的对数增长。") },
              cost: new Decimal("8e5"),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        33: { title: function() { return L("Super Typhoon Scars", "超强台风疤痕") },
              description() { return L("Storm fuel gain x2 while wind is at least 51 m/s.", "风速 ≥ 51 m/s 时风暴燃料获取 ×2。") },
              cost: new Decimal("3e6"),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        34: { title: function() { return L("Remembered Wind", "被记住的风") },
              description() { return L("Water vapor gain x3 once a landfall reached 51 m/s.", "曾有一次登陆达到 51 m/s 后，水汽获取 ×3。") },
              cost: new Decimal("1.2e7"),
              unlocked() { return hasUpgrade(this.layer, 31) } },
        35: { title: function() { return L("Century Storm", "世纪风暴") },
              description() { return L("Storm fuel gain is boosted by your strongest landfall wind.", "风暴燃料获取随最强登陆风速增长。") },
              cost: new Decimal("5e7"),
              unlocked() { return hasUpgrade(this.layer, 31) } },
    },

    buyables: {
        41: { title: function() { return L("Storm Surge", "增潮") },
              display() { return L("Vapor gain x", "水汽获取 ×") + format(getBuyableAmount(this.layer, this.id).times(0.3).add(1))
                  + "<br><span style='opacity:.5'>" + L("Cost: ", "成本：") + format(tmp[this.layer].buyables[this.id].cost) + L(" fuel", " 燃料") + "</span>" },
              cost(x) { return new Decimal(20).times(Decimal.pow(5, x)) },
              purchaseLimit: new Decimal(Infinity),
              canAfford() { return player.land.points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let c = tmp[this.layer].buyables[this.id].cost
                  player.land.points = player.land.points.sub(c)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              },
              unlocked() { return hasUpgrade("land", 15) } },
    },

    milestones: {
        0: { requirementDescription: function() { return L("1 landfall", "登陆 1 次") },
             effectDescription() { return L("The monsoon runs itself: auto-transport and auto-upgrade.", "季风自动运转：自动输送与自动升级。") },
             done() { return player[this.layer].count.gte(1) } },
        1: { requirementDescription: function() { return L("2 landfalls", "登陆 2 次") },
             effectDescription() { return L("Storm fuel gain x1.5.", "风暴燃料获取 ×1.5。") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].count.gte(2) } },
        2: { requirementDescription: function() { return L("3 landfalls", "登陆 3 次") },
             effectDescription() { return L("Eye floors cost x0.9.", "暖心楼层成本 ×0.9。") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].count.gte(3) } },
        3: { requirementDescription: function() { return L("5 landfalls", "登陆 5 次") },
             effectDescription() { return L("Rainbands and vorticity rebuild themselves automatically.", "雨带与涡度自动重建。") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].count.gte(5) } },
        4: { requirementDescription: function() { return L("7 landfalls", "登陆 7 次") },
             effectDescription() { return L("Eyewall energy inflow x2.", "眼墙能量流入 ×2。") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].count.gte(7) } },
        5: { requirementDescription: function() { return L("10 landfalls", "登陆 10 次") },
             effectDescription() { return L("Storm fuel gain x2.", "风暴燃料获取 ×2。") },
             unlocked() { return hasMilestone(this.layer, 4) },
             done() { return player[this.layer].count.gte(10) } },
        6: { requirementDescription: function() { return L("14 landfalls", "登陆 14 次") },
             effectDescription() { return L("Steering accrues twice as fast.", "引导气流积聚速度翻倍。") },
             unlocked() { return hasMilestone(this.layer, 5) },
             done() { return player[this.layer].count.gte(14) } },
        7: { requirementDescription: function() { return L("18 landfalls", "登陆 18 次") },
             effectDescription() { return L("Water vapor gain x10.", "水汽获取 ×10。") },
             unlocked() { return hasMilestone(this.layer, 6) },
             done() { return player[this.layer].count.gte(18) } },
        8: { requirementDescription: function() { return L("21 landfalls", "登陆 21 次") },
             effectDescription() { return L("Storm fuel gain x2.5.", "风暴燃料获取 ×2.5。") },
             unlocked() { return hasMilestone(this.layer, 7) },
             done() { return player[this.layer].count.gte(21) } },
        9: { requirementDescription: function() { return L("The Perfect Storm", "完美风暴") },
             effectDescription() { return L("25 landfalls with a 51 m/s landfall — or 40 landfalls. The storm rests.", "25 次登陆且其中一次达 51 m/s——或 40 次登陆。风暴歇息了。") },
             unlocked() { return hasMilestone(this.layer, 8) },
             done() { return (player[this.layer].count.gte(25) && player[this.layer].maxWind.gte(51)) || player[this.layer].count.gte(40) } },
    },
})
