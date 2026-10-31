// ============================================================================
// The Typhoon Tree — js/layers4.js (row 2: band, vor, env)
// ============================================================================

// ---------------------------------------------------------------------------
// band — 螺旋雨带 Spiral Rainbands (row 2a, static floors over cloud mass)
// ---------------------------------------------------------------------------
addLayer("band", {
    name() { return L("Spiral Rainbands", "螺旋雨带") },
    symbol: "带",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#85929E",
    resource() { return L("Rainbands", "雨带") },
    row: 2,
    position: 0,
    branches: ["conv"],

    baseResource: "Cloud Mass",
    baseAmount() { return player.conv.points },
    requires: new Decimal("1e4"),
    type: "static",
    base: 2,
    exponent: 1,
    roundUpCost: true,
    canBuyMax() { return hasUpgrade(this.layer, 15) },

    // static semantics: gainMult SMALLER = cheaper floors
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade(this.layer, 12)) m = m.times(0.8)                    // cost reducer (K5)
        if (hasMilestone(this.layer, 3)) m = m.times(0.9)
        if (player.env && inChallenge("env", 21)) m = m.times(2)            // cold surge: floors cost more
        if (player.eyew && hasUpgrade("eyew", 21)) m = m.times(0.8)         // eyewall tightens the bands
        if (player.land && hasUpgrade("land", 21)) m = m.times(0.85)
        // ERC cycles: cheaper floors (capped x0.4 — see eyew.onPrestige note)
        if (player.eyew) m = m.times(Decimal.max(0.4, new Decimal(1).sub(player.eyew.cycles.times(0.01))))
        return m
    },
    gainExp() { return new Decimal(1) },

    // automation ladder P2: land m3 — bands rebuild themselves after landfall
    // (paired with resetsNothing below, N-AUTOWIPE; self-limiting: static cost
    // ladder stops the auto-press when the next floor outprices the cloud)
    autoPrestige() { return player.land && hasMilestone("land", 3) },
    resetsNothing() { return player.land && hasMilestone("land", 3) },

    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        let kept = ["unlocked", "best", "total"]
        if (hasMilestone(this.layer, 2)) kept.push("upgrades")
        if (player.eyew && hasMilestone("eyew", 5)) kept.push("points")     // ERC keeps bands late
        layerDataReset(this.layer, kept)
    },

    layerShown() { return player[this.layer].unlocked || player.conv.best.gte("8e3") },
    hotkeys: [
        { key: "b", description: function() { return L("B: Reset for Rainbands", "B：重置云团换取雨带") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#BDC3C7'>" + L("You have ", "你有 ")
                + format(player.conv.points) + L(" Cloud Mass", " 云团")
                + L("  →  bands spiral out: ", "  →  雨带成螺旋：")
                + "<b style='color:#85929E'>" + L("Rainbands", "雨带") + "</b></h2>"
        }],
        ["display-text", function() {
            return "<span style='opacity:.65'>" + L("Best: ", "最佳：") + formatWhole(player.band.best)
                + L("  |  next floor: ", " ｜ 下一圈：") + format(tmp.band.nextAt) + "</span>"
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
                content: [["blank", "10px"], ["display-text", function() { return L("Spends Rainband floors.", "花费雨带圈数。") }], "blank", "upgrades"],
            },
            "Milestones": {
                tabLabel() { return L("Milestones", "里程碑") },
                unlocked() { return true },
                content: [["blank", "10px"], "milestones"],
            },
        },
    },

    upgrades: {
        rows: 1, cols: 10,
        11: { title: function() { return L("Outer Bands", "外雨带") },
              description() { return L("Double cloud gain.", "云团获取 ×2。") },
              cost: new Decimal(1) },
        12: { title: function() { return L("Tighter Spiral", "更紧的螺旋") },
              description() { return L("Floors cost 20% less (rainbands organize).", "雨带圈价 -20%（组织化）。") },
              cost: new Decimal(2),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        13: { title: function() { return L("Training Convective Bands", "训练对流带") },
              description() { return L("Cloud gain is boosted by your lifetime floors (log).", "云团获取随累计圈数对数增长。") },
              cost: new Decimal(4),
              unlocked() { return hasUpgrade(this.layer, 11) },
              effect() { return player.band.total.add(1).log10().add(1) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: function() { return L("Moisture Feeder", "水汽馈带") },
              description() { return L("Latent heat gain is boosted by your best floors.", "潜热获取随最佳圈数增长。") },
              cost: new Decimal(8),
              unlocked() { return hasUpgrade(this.layer, 11) },
              effect() { return player.band.best.add(1) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: function() { return L("Buy Max Floors", "整层采购") },
              description() { return L("Unlocks buying max rainbands per reset.", "解锁每次重置买满雨带。") },
              cost: new Decimal(16),
              unlocked() { return hasUpgrade(this.layer, 12) } },
        16: { title: function() { return L("Ocean Spray Bands", "海洋飞沫带") },
              description() { return L("Double water vapor gain.", "水汽获取 ×2。") },
              cost: new Decimal(32),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        17: { title: function() { return L("Seeded Cells", "播撒单体") },
              description() { return L("x2 cloud gain while Cloud Seeding is unlocked.", "人工增雨解锁期间云团 ×2。") },
              cost: new Decimal(64),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        18: { title: function() { return L("Feeder Bands", "馈入带") },
              description() { return L("Monsoon flux gain x1.5.", "季风通量获取 ×1.5。") },
              cost: new Decimal(96),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        19: { title: function() { return L("Vorticity Funnels", "涡度漏斗") },
              description() { return L("Vorticity gain is boosted by your lifetime floors.", "涡度获取随累计圈数增长。") },
              cost: new Decimal(128),
              unlocked() { return hasUpgrade(this.layer, 15) },
              effect() { return player.band.total.add(1).log10().add(1).pow(1.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        20: { title: function() { return L("Complete Spiral", "完整螺环") },
              description() { return L("Triple cloud gain.", "云团获取 ×3。") },
              cost: new Decimal(192),
              unlocked() { return hasUpgrade(this.layer, 15) } },
    },

    milestones: {
        0: { requirementDescription: function() { return L("20 best rainbands", "最佳雨带 20") },
             effectDescription() { return L("Evaporation auto-prestiges.", "蒸发层自动声望。") },
             done() { return player[this.layer].best.gte(20) } },
        1: { requirementDescription: function() { return L("40 best rainbands", "最佳雨带 40") },
             effectDescription() { return L("Cloud gain x2.", "云团获取 ×2。") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(40) } },
        2: { requirementDescription: function() { return L("60 best rainbands", "最佳雨带 60") },
             effectDescription() { return L("Upgrades survive rainband resets.", "雨带重置时保留升级。") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(60) } },
        3: { requirementDescription: function() { return L("90 best rainbands", "最佳雨带 90") },
             effectDescription() { return L("Floors cost 10% less.", "雨带圈价 -10%。") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(90) } },
        4: { requirementDescription: function() { return L("150 best rainbands", "最佳雨带 150") },
             effectDescription() { return L("Water vapor gain x3.", "水汽获取 ×3。") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].best.gte(150) } },
    },
})

// ---------------------------------------------------------------------------
// vor — 涡旋 Vortex (row 2b). The spin-up engine.
// ---------------------------------------------------------------------------
addLayer("vor", {
    name() { return L("Vortex", "涡旋") },
    symbol: "旋",
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#A569BD",
    resource() { return L("Vorticity", "涡度") },
    row: 2,
    position: 1,
    branches: ["conv", "mon"],

    baseResource: "Cloud Mass",
    baseAmount() { return player.conv.points },
    requires: new Decimal("2e4"),
    type: "normal",
    exponent: 0.25,

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade(this.layer, 21)) m = m.times(upgradeEffect(this.layer, 21))
        if (hasUpgrade(this.layer, 23)) m = m.times(upgradeEffect(this.layer, 23))
        if (hasUpgrade(this.layer, 31)) m = m.times(2)
        if (hasUpgrade(this.layer, 32)) m = m.times(10)
        if (hasUpgrade(this.layer, 34)) m = m.times(new Decimal(3).add(player.band ? player.band.best.div(50).floor() : new Decimal(0)))
        if (hasMilestone(this.layer, 0)) m = m.times(2)
        // P10 web: newer layers boost vorticity
        if (player.eye && hasUpgrade("eye", 11)) m = m.times(2)
        if (player.eye && hasUpgrade("eye", 19)) m = m.times(3)
        if (player.band && hasUpgrade("band", 19)) m = m.times(upgradeEffect("band", 19))
        if (player.eyew) m = m.times(getBuyableAmount("eyew", 32).times(0.2).add(1))  // inflow buyable
        // ERC cycles: stronger spin (capped x3 — see eyew.onPrestige note)
        if (player.eyew) m = m.times(Decimal.min(3, player.eyew.cycles.times(0.05).add(1)))
        if (player.land && hasUpgrade("land", 21)) m = m.times(2)
        if (player.env && hasChallenge("env", 21)) m = m.times(challengeEffect("env", 21))
        if (player.env && hasChallenge("env", 31)) m = m.times(challengeEffect("env", 31))
        // K7 conditional: a tight warm core helps the spin only in real storms (eye u17)
        if (player.eye && hasUpgrade("eye", 17) && windMS().gte(41.5)) m = m.times(2)
        return m
    },
    gainExp() {
        let e = new Decimal(1)
        if (hasUpgrade(this.layer, 33)) e = e.times(1.05)   // K4 named: 科氏增强
        if (player.suh && hasUpgrade("suh", 13)) e = e.times(1.1)
        return e
    },

    // automation ladder P2: land m3 — vortex rebuilds itself after landfall
    autoPrestige() { return player.land && hasMilestone("land", 3) },
    resetsNothing() { return player.land && hasMilestone("land", 3) },

    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        let kept = ["unlocked", "best", "total"]
        if (hasMilestone(this.layer, 2)) kept.push("upgrades")
        if (player.eyew && hasMilestone("eyew", 5)) kept.push("points")
        layerDataReset(this.layer, kept)
    },

    layerShown() { return player[this.layer].unlocked || player.conv.best.gte("1.6e4") },
    hotkeys: [
        { key: "v", description: function() { return L("V: Reset for Vorticity", "V：重置云团换取涡度") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#C39BD3'>" + L("You have ", "你有 ")
                + format(player.conv.points) + L(" Cloud Mass", " 云团")
                + L("  →  the storm spins up: ", "  →  风暴开始旋转：")
                + "<b style='color:#A569BD'>" + L("Vorticity", "涡度") + "</b></h2>"
        }],
        ["display-text", function() {
            return "<span style='opacity:.65'>" + L("Best: ", "最佳：") + formatWhole(player.vor.best) + "</span>"
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
            "Milestones": {
                tabLabel() { return L("Milestones", "里程碑") },
                unlocked() { return true },
                content: [["blank", "10px"], "milestones"],
            },
        },
    },

    upgrades: {
        rows: 3, cols: 5,
        21: { title: function() { return L("Spin-Up", "旋转起转") },
              description() { return L("Vorticity gain is boosted by your vorticity (softcapped).", "涡度获取随涡度增长（软帽）。") },
              cost: new Decimal(1),
              effect() {
                  let r = player.vor.points.add(1).pow(0.4)
                  return softcap(r, new Decimal("1e6"), 0.5)
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        22: { title: function() { return L("Coriolis Deflection", "科氏偏转") },
              description() { return L("Double latent heat gain.", "潜热获取 ×2。") },
              cost: new Decimal(5),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        23: { title: function() { return L("Inflow Asymmetry", "入流不对称") },
              description() { return L("Vorticity gain is boosted by your cloud mass.", "涡度获取随云团增长。") },
              cost: new Decimal(50),
              unlocked() { return hasUpgrade(this.layer, 21) },
              effect() { return player.conv.points.add(1).pow(0.35) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: function() { return L("Rossby Waves", "罗斯贝波") },
              description() { return L("Double water vapor gain.", "水汽获取 ×2。") },
              cost: new Decimal(500),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        25: { title: function() { return L("Envelope Organization", "外包组织化") },
              description() { return L("Monsoon strength gain x2.", "季风强度获取 ×2。") },
              cost: new Decimal("1e4"),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        31: { title: function() { return L("Meso-Alpha Spin", "中-α 尺度旋转") },
              description() { return L("Double vorticity gain.", "涡度获取 ×2。") },
              cost: new Decimal("1e6"),
              unlocked() { return hasUpgrade(this.layer, 25) } },
        32: { title: function() { return L("A Center Forms", "中心成形") },
              description() { return L("A warm-core center appears. Vorticity gain x10.", "暖心中心出现。涡度获取 ×10。") },
              cost: new Decimal(7),                                  // deliberate key drop
              unlocked() { return hasUpgrade(this.layer, 25) } },
        33: { title: function() { return L("Coriolis Amplification", "科氏增强") },
              description() { return L("Raises vorticity gain to a power of 1.05.", "涡度获取变为 1.05 次方。") },
              cost: new Decimal("1e8"),
              unlocked() { return hasUpgrade(this.layer, 25) } },
        34: { title: function() { return L("Fujiwhara Practice", "藤原演练") },
              description() { return L("Vorticity gain grows with your best rainbands.", "涡度获取随最佳雨带增长。") },
              cost: new Decimal("1e10"),
              unlocked() { return hasUpgrade(this.layer, 25) },
              effectDisplay() { return "x" + format(new Decimal(3).add(player.band ? player.band.best.div(50).floor() : new Decimal(0))) } },
        35: { title: function() { return L("Eyewall Mesovortices", "眼墙中涡旋") },
              description() { return L("Cyclone energy gain is boosted by the log of your best vorticity.", "气旋能量获取随最佳涡度对数增长。") },
              cost: new Decimal("1e12"),
              unlocked() { return hasUpgrade(this.layer, 25) },
              effect() { return player.vor.best.add(1).log10().add(1).pow(1.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },

    milestones: {
        0: { requirementDescription: function() { return L("1,000 best vorticity", "最佳涡度 1,000") },
             effectDescription() { return L("Vorticity gain x2.", "涡度获取 ×2。") },
             done() { return player[this.layer].best.gte(1e3) } },
        1: { requirementDescription: function() { return L("1e4 best vorticity", "最佳涡度 1e4") },
             effectDescription() { return L("Evaporation auto-buys upgrades.", "蒸发层自动购买升级。") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(1e4) } },
        2: { requirementDescription: function() { return L("1e6 best vorticity", "最佳涡度 1e6") },
             effectDescription() { return L("Upgrades survive vortex resets.", "涡旋重置时保留升级。") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(1e6) } },
        3: { requirementDescription: function() { return L("1e8 best vorticity", "最佳涡度 1e8") },
             effectDescription() { return L("Monsoon strength gain x3.", "季风强度获取 ×3。") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(1e8) } },
        4: { requirementDescription: function() { return L("1e10 best vorticity", "最佳涡度 1e10") },
             effectDescription() { return L("Latent heat gain x5.", "潜热获取 ×5。") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].best.gte(1e10) } },
    },
})

// ---------------------------------------------------------------------------
// env — 恶劣环境 Hostile Environment (row 2c, M2 score-attack challenge hub)
// Peaks are recorded per challenge in update(); rewards read the peaks.
// Goals score on update()-accrued state (P65-legal variant); onEnter resets
// the live hazard but never the banked peaks.
// ---------------------------------------------------------------------------
addLayer("env", {
    name() { return L("Hostile Environment", "恶劣环境") },
    symbol: "险",
    position: 2,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),          // adaptation currency
        best: new Decimal(0),
        total: new Decimal(0),
        hazard: new Decimal(0),          // live in-challenge score
        maxpoints: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
    }},
    color: "#E74C3C",
    resource() { return L("Adaptation", "适应度") },
    row: 2,
    position: 2,
    branches: ["conv", "mon"],

    type: "none",

    update(diff) {
        if (!player[this.layer].unlocked) return
        let ndiff = new Decimal(diff)
        let ids = [11, 12, 21, 22, 31]
        let inAny = false
        for (let i = 0; i < ids.length; i++) {
            if (inChallenge("env", ids[i])) {
                inAny = true
                let rate = player.conv.best.add(1).log10().add(player.vor.best.add(1).log10()).add(windMS().div(10))
                rate = rate.times(new Decimal(1).add(envTotalCompletions().times(0.25)))
                player.env.hazard = player.env.hazard.add(rate.times(ndiff))
                let idx = i === 4 ? 4 : (i < 2 ? i : i)  // 11->0, 12->1, 21->2, 22->3, 31->4
                if (player.env.hazard.gt(player.env.maxpoints[idx])) player.env.maxpoints[idx] = player.env.hazard
            }
        }
        // adaptation accrues from the banked peaks (addPoints — never assign points)
        let sum = new Decimal(0)
        for (let i = 0; i < 5; i++) sum = sum.add(player.env.maxpoints[i].add(1).log10())
        let adaptRate = sum.times(TUNING.ADAPT_RATE).times(envAdaptMult())
        if (adaptRate.gt(0)) addPoints("env", adaptRate.times(ndiff))
    },

    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        let kept = ["unlocked", "best", "total", "maxpoints"]   // peaks survive (F18-safe: copied by layOver)
        if (hasMilestone(this.layer, 2)) kept.push("upgrades")
        layerDataReset(this.layer, kept)
    },

    layerShown() { return player[this.layer].unlocked || player.conv.best.gte("4e7") },

    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#E74C3C'>" + L("Adaptation: ", "适应度：") + "<b>" + format(player.env.points) + "</b>"
                + L("  |  live hazard: ", " ｜ 实时危险评分：") + format(player.env.hazard) + "</h2>"
        }],
        ["display-text", function() {
            return "<span style='opacity:.65'>" + L("Every challenge records a <b>peak score</b> while you are inside; rewards scale with the peak. Entering resets the live score, never the records.", "每个挑战在你身处其中时记录<b>峰值</b>；奖励随峰值增长。进入会清空实时评分，绝不清空纪录。") + "</span>"
        }],
        "blank",
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            "Challenges": {
                tabLabel() { return L("Challenges", "挑战") },
                unlocked() { return true },
                content: [["blank", "10px"], "challenges"],
            },
            "Adaptation": {
                tabLabel() { return L("Adaptation", "适应商店") },
                unlocked() { return true },
                content: [["blank", "10px"], ["display-text", function() { return L("Spends Adaptation.", "花费适应度。") }], "blank", "upgrades"],
            },
            "Milestones": {
                tabLabel() { return L("Milestones", "里程碑") },
                unlocked() { return true },
                content: [["blank", "10px"], "milestones"],
            },
        },
    },

    challenges: {
        rows: 3, cols: 5,
        11: { name: function() { return L("Wind Shear", "垂直风切变") },
              challengeDescription() { return L("Convection gain ÷1000 while inside. The atmosphere rips the tops off your towers.", "身处其中时对流获取 ÷1000。大气把你的云塔顶撕掉。") + "<br>" + L("Peak: ", "峰值：") + format(player.env.maxpoints[0]) + " / " + envGoal(0) },
              goalDescription() { return L("Peak hazard score: ", "危险评分峰值：") + format(envGoal(0)) },
              canComplete() { return player.env.maxpoints[0].gte(envGoal(0)) },
              onEnter() { player.env.hazard = new Decimal(0) },
              rewardDescription() { return L("Shear Adaptation: vapor gain based on your peak.", "切变适应：水汽获取随峰值增长。") },
              rewardEffect() {
                  let r = player.env.maxpoints[0].add(1).log10().add(1)
                  if (hasUpgrade("env", 12)) r = r.pow(1.2)
                  return softcap(r, new Decimal(50), 0.5)
              },
              rewardDisplay() { return "x" + format(challengeEffect(this.layer, this.id)) },
              completionLimit: TUNING.CHAL_COMPLETIONS },
        12: { name: function() { return L("Dry Air Intrusion", "干空气侵入") },
              challengeDescription() { return L("Vapor gain is square-rooted while inside. Saharan air lays over the basin.", "身处其中时水汽获取开平方。撒哈拉干空气罩住洋面。") + "<br>" + L("Peak: ", "峰值：") + format(player.env.maxpoints[1]) + " / " + envGoal(1) },
              goalDescription() { return L("Peak hazard score: ", "危险评分峰值：") + format(envGoal(1)) },
              canComplete() { return player.env.maxpoints[1].gte(envGoal(1)) },
              onEnter() { player.env.hazard = new Decimal(0) },
              rewardDescription() { return L("Dry-Air Adaptation: latent heat gain based on your peak.", "干空气适应：潜热获取随峰值增长。") },
              rewardEffect() {
                  let r = player.env.maxpoints[1].add(1).log10().add(1)
                  if (hasUpgrade("env", 17)) r = r.pow(1.2)
                  return softcap(r, new Decimal(50), 0.5)
              },
              rewardDisplay() { return "x" + format(challengeEffect(this.layer, this.id)) },
              completionLimit: TUNING.CHAL_COMPLETIONS },
        21: { name: function() { return L("Cold Surge", "冷涌") },
              challengeDescription() { return L("Latent heat exponent halved; rainband floors cost 2x. An early winter gale chills the sea.", "身处其中时潜热指数减半、雨带圈价 ×2。一场早来的冬季风把海面吹凉。") + "<br>" + L("Peak: ", "峰值：") + format(player.env.maxpoints[2]) + " / " + envGoal(2) },
              goalDescription() { return L("Peak hazard score: ", "危险评分峰值：") + format(envGoal(2)) },
              canComplete() { return player.env.maxpoints[2].gte(envGoal(2)) },
              onEnter() { player.env.hazard = new Decimal(0) },
              rewardDescription() { return L("Cold-Water Adaptation: vorticity gain based on your peak.", "冷水适应：涡度获取随峰值增长。") },
              rewardEffect() {
                  let r = player.env.maxpoints[2].add(1).log10().add(1)
                  if (hasUpgrade("env", 17)) r = r.pow(1.2)
                  return softcap(r, new Decimal(50), 0.5)
              },
              rewardDisplay() { return "x" + format(challengeEffect(this.layer, this.id)) },
              completionLimit: TUNING.CHAL_COMPLETIONS },
        22: { name: function() { return L("Fujiwhara Duel", "藤原共舞") },
              challengeDescription() { return L("A rival storm halves your transport speed and tank inflow. Two vortices dance.", "对手风暴使输送速度与储存注入减半。两个涡旋共舞。") + "<br>" + L("Peak: ", "峰值：") + format(player.env.maxpoints[3]) + " / " + envGoal(3) },
              goalDescription() { return L("Peak hazard score: ", "危险评分峰值：") + format(envGoal(3)) },
              canComplete() { return player.env.maxpoints[3].gte(envGoal(3)) },
              onEnter() { player.env.hazard = new Decimal(0) },
              rewardDescription() { return L("Dance Partner: flux gain based on your peak.", "舞伴：通量获取随峰值增长。") },
              rewardEffect() {
                  let r = player.env.maxpoints[3].add(1).log10().add(1)
                  return softcap(r, new Decimal(50), 0.5)
              },
              rewardDisplay() { return "x" + format(challengeEffect(this.layer, this.id)) },
              completionLimit: TUNING.CHAL_COMPLETIONS },
        31: { name: function() { return L("The Super Gauntlet", "超级考验") },
              challengeDescription() { return L("Wind Shear + Dry Air + Cold Surge all at once. Survive the whole hostile basin.", "风切变 + 干空气 + 冷涌同时生效。在整片恶海中存活。") + "<br>" + L("Peak: ", "峰值：") + format(player.env.maxpoints[4]) + " / " + envGoal(4) },
              goalDescription() { return L("Peak hazard score: ", "危险评分峰值：") + format(envGoal(4)) },
              canComplete() { return player.env.maxpoints[4].gte(envGoal(4)) },
              onEnter() { player.env.hazard = new Decimal(0) },
              countsAs: [11, 12, 21],
              rewardDescription() { return L("Storm-Proofing: vapor AND cloud AND latent gain based on your peak.", "风暴认证：水汽、云团、潜热获取随峰值增长。") },
              rewardEffect() {
                  let r = player.env.maxpoints[4].add(1).log10().add(1)
                  if (hasUpgrade("env", 12)) r = r.pow(1.2)
                  if (hasUpgrade("env", 20)) r = r.times(2)
                  return softcap(r, new Decimal(100), 0.5)
              },
              rewardDisplay() { return "x" + format(challengeEffect(this.layer, this.id)) },
              completionLimit: 3 },
    },

    upgrades: {
        rows: 1, cols: 10,
        11: { title: function() { return L("Hardened Convection", "强化对流") },
              description() { return L("Adaptation gain grows with your total completions.", "适应度获取随总通关数增长。") },
              cost: new Decimal(10) },
        12: { title: function() { return L("Shear Analytics", "切变分析") },
              description() { return L("Shear & Gauntlet rewards become 1.2th powers.", "切变与超级考验奖励变为 1.2 次方。") },
              cost: new Decimal(100),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        13: { title: function() { return L("Field Notes", "野外记录") },
              description() { return L("Double adaptation gain.", "适应度获取 ×2。") },
              cost: new Decimal("1e3"),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        14: { title: function() { return L("Recon Flights", "侦察飞行") },
              description() { return L("Adaptation gain is boosted by your lifetime adaptation (log).", "适应度获取随累计适应度对数增长。") },
              cost: new Decimal("1e4"),
              unlocked() { return hasUpgrade(this.layer, 11) },
              effect() { return player.env.total.add(1).log10().add(1).pow(1.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: function() { return L("Accept the Impossible", "迎接不可能") },
              description() { return L("Unlocks The Super Gauntlet.", "解锁「超级考验」。") },
              cost: new Decimal("1e5"),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        16: { title: function() { return L("Climatology", "气候学") },
              description() { return L("Double water vapor gain.", "水汽获取 ×2。") },
              cost: new Decimal("1e6"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        17: { title: function() { return L("Deep Recon", "深部侦察") },
              description() { return L("Dry-Air & Cold-Water rewards become 1.2th powers.", "干空气与冷水奖励变为 1.2 次方。") },
              cost: new Decimal("1e7"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        18: { title: function() { return L("Storm-Chaser Culture", "追风文化") },
              description() { return L("x2 adaptation once the eyewall exists.", "眼墙出现后适应度 ×2。") },
              cost: new Decimal("1e8"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        19: { title: function() { return L("Hazard Mapping", "危险测绘") },
              description() { return L("Double cloud gain.", "云团获取 ×2。") },
              cost: new Decimal("1e9"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        20: { title: function() { return L("Full Station Network", "全站网") },
              description() { return L("The Super Gauntlet reward is doubled.", "超级考验奖励翻倍。") },
              cost: new Decimal("1e10"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
    },

    milestones: {
        0: { requirementDescription: function() { return L("1,000 best adaptation", "最佳适应度 1,000") },
             effectDescription() { return L("Hazard accrues 50% faster.", "危险评分累积提速 50%。") },
             done() { return player[this.layer].best.gte(1e3) } },
        1: { requirementDescription: function() { return L("1e5 best adaptation", "最佳适应度 1e5") },
             effectDescription() { return L("Adaptation gain x2.", "适应度获取 ×2。") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(1e5) } },
        2: { requirementDescription: function() { return L("1e7 best adaptation", "最佳适应度 1e7") },
             effectDescription() { return L("Upgrades survive landfalls.", "登陆时保留升级。") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(1e7) } },
        3: { requirementDescription: function() { return L("1e9 best adaptation", "最佳适应度 1e9") },
             effectDescription() { return L("All challenge rewards become 1.1th powers.", "全部挑战奖励变为 1.1 次方。") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(1e9) } },
        4: { requirementDescription: function() { return L("1e12 best adaptation", "最佳适应度 1e12") },
             effectDescription() { return L("Adaptation gain x5.", "适应度获取 ×5。") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].best.gte(1e12) } },
    },
})

// env helpers (used by the layer above and by tuning.js consumers)
function envGoal(i) {
    return new Decimal(TUNING.CHAL_BASES[i]).times(Decimal.pow(TUNING.CHAL_GOAL_GROWTH, challengeCompletions("env", [11, 12, 21, 22, 31][i])))
}
function envTotalCompletions() {
    if (typeof player === "undefined" || !player || !player.env) return new Decimal(0)
    return new Decimal(challengeCompletions("env", 11)).add(challengeCompletions("env", 12)).add(challengeCompletions("env", 21)).add(challengeCompletions("env", 22)).add(challengeCompletions("env", 31))
}
function envAdaptMult() {
    let m = new Decimal(1)
    if (typeof player === "undefined" || !player || !player.env) return m
    if (hasUpgrade("env", 11)) m = m.times(envTotalCompletions().add(2))
    if (hasUpgrade("env", 13)) m = m.times(2)
    if (hasUpgrade("env", 14)) m = m.times(player.env.total.add(1).log10().add(1).pow(1.5))
    if (hasUpgrade("env", 18) && player.eyew && player.eyew.unlocked) m = m.times(2)
    if (hasMilestone("env", 0)) m = m.times(1.5)
    if (hasMilestone("env", 1)) m = m.times(2)
    if (hasMilestone("env", 4)) m = m.times(5)
    if (player.suh && hasUpgrade("suh", 16)) m = m.times(2)
    return m
}
// challenge reward 22 consumer (flux gain) — wired here so the reward has a reader
function envFujiwharaFluxMult() {
    if (typeof player === "undefined" || !player || !player.env) return new Decimal(1)
    if (!hasChallenge("env", 22)) return new Decimal(1)
    let r = player.env.maxpoints[3].add(1).log10().add(1)
    return softcap(r, new Decimal(50), 0.5)
}
