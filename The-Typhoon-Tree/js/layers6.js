// ============================================================================
// The Typhoon Tree — js/layers6.js (row 3b: eyew)
// eyew — 眼墙 Eyewall. The active-tick heart of row 3.
//   player.eyew.points     = Circulation (ERC prestige output; engine-standard)
//   player.eyew.energy     = INTERNAL sim state (like mon.tank/mon.flux):
//                            accrued in update(), never written by prestige
//   player.eyew.bestWind   = record: highest wind speed ever reached (kept)
//   player.eyew.cycles     = record: ERC count (kept)
// Wind speed = windMS() over energy; the MPI wall (85 m/s, visible) caps it.
// An ERC (prestige) collapses the energy, records the wind, and injects the
// circulation into BOTH band and vor (downward feed, P10).
// Consumers wired elsewhere: u21 -> band.gainMult x0.8, u33 -> MPI +10,
// b31 -> getPointGen, b32 -> vor.gainMult, m0 -> suh unlock (mod.js),
// m3 -> conv passiveGeneration, m5 -> band/vor keeps.
// ============================================================================

addLayer("eyew", {
    name() { return L("Eyewall", "眼墙") },
    symbol: "墙",
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        energy: new Decimal(0),      // internal sim state — NOT the prestige currency
        bestWind: new Decimal(0),
        cycles: new Decimal(0),
    }},
    color: "#E74C3C",
    resource() { return L("Circulation", "环流") },
    row: 3,
    position: 1,
    branches: ["band", "vor", "eye"],

    type: "custom",

    // display/unlock threshold; the real ERC gate is structural (canReset)
    baseAmount() { return player.vor.points },
    requires: new Decimal(100),

    canReset() {
        return player.band && player.vor
            && player.band.points.gte(10) && player.vor.points.gte(100)
    },

    getResetGain() {
        let g = player.eyew.energy.max(1).log10().floor().max(1)
        if (hasUpgrade(this.layer, 31)) g = g.times(2)
        if (hasUpgrade(this.layer, 24)) g = g.times(player.eyew.cycles.add(1).pow(0.5).min(5))
        if (hasMilestone(this.layer, 4)) g = g.times(1.5)
        return g.floor().max(1)
    },
    getNextAt() { return new Decimal(Infinity) },

    // The ERC is a ritual on the storm itself — it never wipes the tree.
    resetsNothing() { return true },

    onPrestige(gain) {
        let w = windMS()
        if (w.gt(player.eyew.bestWind)) player.eyew.bestWind = w
        // Circulation feeds band/vor through CAPPED multiplicative channels
        // (read inline in layers4 band.gainMult / vor.gainMult) — NOT free
        // floors: direct floor injection into a 2^band inflow curve is an
        // exponential feedback loop (found by the Stage 6 sim: peak income
        // 1e279, endgame 0.09 h). Floors must still be paid for in cloud.
        player.eyew.cycles = player.eyew.cycles.add(gain)
        player.eyew.energy = new Decimal(0)          // the eyewall collapses; it reforms stronger
    },

    gainExp() {
        let e = new Decimal(1)
        if (hasUpgrade(this.layer, 23)) e = e.times(1.05)   // K4 named: 眼墙对流
        if (player.eye && hasUpgrade("eye", 20)) e = e.times(1.05)
        if (player.suh && hasUpgrade("suh", 14)) e = e.times(1.1)
        return e
    },

    // Energy integrator (sanctioned internal-state write, mon.tank precedent).
    update(diff) {
        if (!player[this.layer].unlocked) return
        let ndiff = new Decimal(diff)
        let inflow = new Decimal(TUNING.EYEW_INFLOW_BASE)
        inflow = inflow.times(new Decimal(TUNING.EYEW_BAND_BASE).pow(player.band.points.floor().min(60)))
        inflow = inflow.times(player.vor.points.max(0).add(1).pow(TUNING.EYEW_VORT_POW))
        if (player.eye && hasUpgrade("eye", 11)) inflow = inflow.times(2)
        if (player.eye && hasUpgrade("eye", 12)) inflow = inflow.times(upgradeEffect("eye", 12))
        if (player.eye && hasUpgrade("eye", 14)) inflow = inflow.times(upgradeEffect("eye", 14))
        if (player.eye && hasMilestone("eye", 1)) inflow = inflow.times(2)
        if (player.eye && hasMilestone("eye", 3)) inflow = inflow.times(3)
        if (hasUpgrade(this.layer, 22)) inflow = inflow.times(2)
        if (hasUpgrade(this.layer, 32)) inflow = inflow.times(5)
        if (hasUpgrade(this.layer, 34)) inflow = inflow.times(player.eyew.points.max(1).log10().add(1))
        if (hasUpgrade(this.layer, 25) && windMS().gte(51)) inflow = inflow.times(3)
        if (hasUpgrade(this.layer, 35)) inflow = inflow.times(windMS().div(10).add(1))
        if (hasMilestone(this.layer, 1)) inflow = inflow.times(2)
        if (hasMilestone(this.layer, 6)) inflow = inflow.times(3)
        if (player.suh && hasUpgrade("suh", 20)) inflow = inflow.times(player.conv.best.add(1).log10().add(1))
        if (player.suh && hasUpgrade("suh", 22)) inflow = inflow.times(2)
        if (player.suh && hasMilestone("suh", 1)) inflow = inflow.times(2)
        if (player.land && hasUpgrade("land", 22)) inflow = inflow.times(2)
        if (player.land && hasMilestone("land", 4)) inflow = inflow.times(2)
        if (player.ach && hasAchievement("ach", 104)) inflow = inflow.times(2)
        inflow = inflow.times(suhSteerMult())
        inflow = inflow.pow(this.gainExp())
        player.eyew.energy = player.eyew.energy.add(inflow.times(ndiff))
        let w = windMS()
        if (w.gt(player.eyew.bestWind)) player.eyew.bestWind = w
    },

    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        let kept = ["unlocked", "best", "total", "bestWind", "cycles"]
        if (hasMilestone(this.layer, 1)) kept.push("upgrades")
        layerDataReset(this.layer, kept)
    },

    layerShown() { return player[this.layer].unlocked || (player.eye && player.eye.best.gte(1)) },
    hotkeys: [
        { key: "h", description: function() { return L("H: Eyewall Replacement Cycle", "H：执行眼墙置换循环") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        ["display-text", function() {
            let w = windMS()
            return "<h2 style='color:#E74C3C'>" + format(w, 1) + " m/s</h2>"
                + "<h3 style='color:#F5B7B1'>" + windCatName(w) + "</h3>"
        }],
        ["display-text", function() {
            return "<span style='opacity:.75'>" + L("Eyewall energy: ", "眼墙能量：") + format(player.eyew.energy)
                + L("  (outflow -> vapor, inflow -> vorticity)", "（流出→水汽，流入→涡度）") + "</span>"
        }],
        ["display-text", function() {
            let cap = TUNING.MPI_MS + (hasUpgrade("eyew", 33) ? TUNING.MPI_RAISE_MS : 0)
            let w = windMS()
            let near = w.gte(cap - 5)
            return "<span style='" + (near ? "color:#F39C12" : "opacity:.5") + "'>"
                + L("Maximum Potential Integrity: ", "最大潜在强度：") + format(cap, 0) + " m/s"
                + (near ? L("  — you are pressing against the wall", " —— 你正抵着这堵墙") : "") + "</span>"
        }],
        "prestige-button", "blank",
        ["display-text", function() {
            return "<span style='opacity:.65'>" + L("ERCs: ", "置换循环：") + formatWhole(player.eyew.cycles)
                + L("  |  best wind: ", " ｜ 巅峰风速：") + format(player.eyew.bestWind, 1) + " m/s</span>"
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
                        return "<span style='opacity:.5'>" + L("Energy spent is wind lost — buy when the storm can afford the dip.", "花掉的能量就是掉下去的风——趁风暴承受得起时再买。") + "</span>"
                    }], "blank",
                    "upgrades",
                ],
            },
            "Buyables": {
                tabLabel() { return L("Buyables", "可重复购买") },
                unlocked() { return hasUpgrade("eyew", 15) },
                content: [
                    ["blank", "10px"],
                    ["display-text", function() {
                        return "<span style='opacity:.5'>" + L("Two channels: outflow vents vapor into the sea air; inflow drags vorticity into the core.", "两条通道：流出把水汽送进海面空气；流入把涡度拽进核心。") + "</span>"
                    }], "blank",
                    "buyables",
                ],
            },
            "Milestones": {
                tabLabel() { return L("Milestones", "里程碑") },
                unlocked() { return true },
                content: [
                    ["blank", "10px"],
                    ["display-text", function() {
                        return "<span style='opacity:.65'>" + L("The wind ladder never resets — your best wind is forever.", "风级阶梯永不回退——你的巅峰风速是永久的。") + "</span>"
                    }],
                    "blank", "milestones",
                ],
            },
        },
    },

    upgrades: {
        rows: 3, cols: 5,
        11: { title: function() { return L("Concentrated Eye", "集中风眼") },
              description() { return L("ERC circulation gain x2.", "置换循环的环流获取 ×2。") },
              cost: new Decimal("1e4") },
        12: { title: function() { return L("Annular Structure", "环状结构") },
              description() { return L("Energy inflow is boosted by your best wind speed.", "能量流入随巅峰风速增长。") },
              cost: new Decimal("1e5"),
              unlocked() { return hasUpgrade(this.layer, 11) },
              effect() { return player.eyew.bestWind.div(10).add(1) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: function() { return L("Latent Reservoir", "潜热水库") },
              description() { return L("Energy inflow is boosted by your best latent heat.", "能量流入随最佳潜热增长。") },
              cost: new Decimal("3e5"),
              unlocked() { return hasUpgrade(this.layer, 11) },
              effect() { return player.evap.best.add(1).pow(0.25) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: function() { return L("Band Coupling", "雨带耦合") },
              description() { return L("Energy inflow is boosted by your best rainbands.", "能量流入随最佳雨带增长。") },
              cost: new Decimal("1e6"),
              unlocked() { return hasUpgrade(this.layer, 11) },
              effect() { return player.band.best.add(1).pow(0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: function() { return L("Channel Management", "通道管理") },
              description() { return L("Unlocks the outflow and inflow channels.", "解锁流出与流入通道。") },
              cost: new Decimal("5e6"),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        21: { title: function() { return L("Tightened Bands", "收紧雨带") },
              description() { return L("Rainband floors cost x0.8.", "雨带楼层成本 ×0.8。") },
              cost: new Decimal("2e7"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        22: { title: function() { return L("Deep Convection Ring", "深对流环") },
              description() { return L("Energy inflow x2.", "能量流入 ×2。") },
              cost: new Decimal("1e8"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        23: { title: function() { return L("Eyewall Convection", "眼墙对流") },
              description() { return L("Raises energy inflow to a power of 1.05.", "能量流入变为 1.05 次方。") },
              cost: new Decimal("1e9"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        24: { title: function() { return L("Musical Eyewall", "共摆眼墙") },
              description() { return L("ERC circulation is boosted by your cycle count (softcapped).", "环流随置换次数增长（软帽）。") },
              cost: new Decimal("1e10"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        25: { title: function() { return L("Rapid Intensification Phase", "快速增强期") },
              description() { return L("Energy inflow x3 while wind is at least 51 m/s.", "风速 ≥ 51 m/s 时能量流入 ×3。") },
              cost: new Decimal("1e11"),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        31: { title: function() { return L("Pinhole Eye", "针孔风眼") },
              description() { return L("ERC circulation gain x2.", "置换循环的环流获取 ×2。") },
              cost: new Decimal("1e13"),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        32: { title: function() { return L("Pressure Fall", "气压骤降") },
              description() { return L("Energy inflow x5. The barometer is in freefall.", "能量流入 ×5。气压计在自由落体。") },
              cost: new Decimal("1e11"),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        33: { title: function() { return L("Beyond the Wall", "越过上限之墙") },
              description() { return L("Raises the MPI wall from 85 to 95 m/s. Sold once.", "把最大潜在强度墙从 85 提到 95 m/s。仅此一次。") },
              unlocked() { return hasMilestone(this.layer, 7) },
              cost: new Decimal("1e14") },
        34: { title: function() { return L("Circulation Memory", "环流记忆") },
              description() { return L("Energy inflow is boosted by the log of your circulation.", "能量流入随环流的对数增长。") },
              cost: new Decimal("1e15"),
              unlocked() { return hasUpgrade(this.layer, 31) },
              effect() { return player.eyew.points.max(1).log10().add(1) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        35: { title: function() { return L("Winds of the Wall", "墙中之风") },
              description() { return L("Energy inflow is boosted by your current wind speed.", "能量流入随当前风速增长。") },
              cost: new Decimal("5e16"),
              unlocked() { return hasUpgrade(this.layer, 31) },
              effect() { return windMS().div(10).add(1) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },

    buyables: {
        31: { title: function() { return L("Outflow Channel", "流出通道") },
              display() { return L("Vapor gain x", "水汽获取 ×") + format(getBuyableAmount(this.layer, this.id).times(0.25).add(1))
                  + "<br><span style='opacity:.5'>" + L("Cost: ", "成本：") + format(tmp[this.layer].buyables[this.id].cost) + L(" energy", " 能量") + "</span>" },
              cost(x) { return new Decimal("1e6").times(Decimal.pow(8, x)) },
              purchaseLimit: new Decimal(Infinity),
              canAfford() { return player.eyew.energy.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let c = tmp[this.layer].buyables[this.id].cost
                  player.eyew.energy = player.eyew.energy.sub(c)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              },
              unlocked() { return hasUpgrade("eyew", 15) } },
        32: { title: function() { return L("Inflow Channel", "流入通道") },
              display() { return L("Vorticity gain x", "涡度获取 ×") + format(getBuyableAmount(this.layer, this.id).times(0.2).add(1))
                  + "<br><span style='opacity:.5'>" + L("Cost: ", "成本：") + format(tmp[this.layer].buyables[this.id].cost) + L(" energy", " 能量") + "</span>" },
              cost(x) { return new Decimal("1e7").times(Decimal.pow(8, x)) },
              purchaseLimit: new Decimal(Infinity),
              canAfford() { return player.eyew.energy.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let c = tmp[this.layer].buyables[this.id].cost
                  player.eyew.energy = player.eyew.energy.sub(c)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              },
              unlocked() { return hasUpgrade("eyew", 15) } },
    },

    milestones: {
        0: { requirementDescription: function() { return L("Reach 17.2 m/s", "风速达到 17.2 m/s") },
             effectDescription() { return L("The subtropical high reveals itself.", "副热带高压显形。") },
             done() { return player[this.layer].bestWind.gte(TUNING.WIND_CATS[0]) } },
        1: { requirementDescription: function() { return L("Reach 24.5 m/s", "风速达到 24.5 m/s") },
             effectDescription() { return L("Eyewall upgrades survive landfalls; energy inflow x2.", "眼墙升级在登陆后保留；能量流入 ×2。") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].bestWind.gte(TUNING.WIND_CATS[1]) } },
        2: { requirementDescription: function() { return L("Reach 32.7 m/s — typhoon", "风速达到 32.7 m/s —— 台风级") },
             effectDescription() { return L("Landfall becomes possible.", "登陆成为可能。") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].bestWind.gte(TUNING.WIND_CATS[2]) } },
        3: { requirementDescription: function() { return L("Reach 41.5 m/s", "风速达到 41.5 m/s") },
             effectDescription() { return L("Convection passively generates 100% of its gain per second.", "对流每秒被动获得 100% 声望收益。") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].bestWind.gte(TUNING.WIND_CATS[3]) } },
        4: { requirementDescription: function() { return L("Reach 51.0 m/s", "风速达到 51.0 m/s") },
             effectDescription() { return L("ERC circulation gain x1.5.", "置换循环的环流获取 ×1.5。") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].bestWind.gte(TUNING.WIND_CATS[4]) } },
        5: { requirementDescription: function() { return L("Reach 61.3 m/s", "风速达到 61.3 m/s") },
             effectDescription() { return L("Rainbands and vorticity survive landfalls.", "雨带与涡度在登陆后保留。") },
             unlocked() { return hasMilestone(this.layer, 4) },
             done() { return player[this.layer].bestWind.gte(TUNING.WIND_CATS[5]) } },
        6: { requirementDescription: function() { return L("Reach 72.0 m/s", "风速达到 72.0 m/s") },
             effectDescription() { return L("Energy inflow x3.", "能量流入 ×3。") },
             unlocked() { return hasMilestone(this.layer, 5) },
             done() { return player[this.layer].bestWind.gte(TUNING.WIND_CATS[6]) } },
        7: { requirementDescription: function() { return L("Reach 85.0 m/s — the wall", "风速达到 85.0 m/s —— 触墙") },
             effectDescription() { return L("You may buy beyond the wall (eyewall upgrade 33).", "可以购买「越过上限之墙」（眼墙升级 33）。") },
             unlocked() { return hasMilestone(this.layer, 6) },
             done() { return player[this.layer].bestWind.gte(TUNING.WIND_CATS[7]) } },
    },
})
