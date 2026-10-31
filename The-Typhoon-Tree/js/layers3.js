// ============================================================================
// The Typhoon Tree — js/layers3.js (row 1: mon — the active-tick core)
// mon — 季风槽 Monsoon Trough (custom, sim modifier). Transport bars produce
// flux; surges convert flux into Monsoon Strength. Carries the M4 bar loop,
// the P28 cloud-seeding pump, the M5 saturable tank and ladder step 2.
// ============================================================================

addLayer("mon", {
    name() { return L("Monsoon Trough", "季风槽") },
    symbol: "流",
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        flux: new Decimal(0),       // internal: moisture flux awaiting surge
        tank: new Decimal(0),       // internal M5 secondary currency (saturates)
        progress: new Decimal(0),   // internal: transport bar 0..1
        pumpLast: 0,                // internal: real-time pump cooldown stamp (ms)
    }},
    color: "#48C9B0",
    resource() { return L("Monsoon Strength", "季风强度") },
    row: 1,
    position: 1,
    branches: ["evap"],

    baseResource: "Latent Heat",
    baseAmount() { return player.evap.points },
    requires: new Decimal(500),     // display/unlock threshold; canReset is flux-driven
    type: "custom",

    getResetGain() {
        let ret = player.mon.flux.max(10).log10().pow(2).times(monsoonStrengthMult())
        if (hasMilestone(this.layer, 4)) ret = ret.pow(1.1)
        return ret.max(0)
    },
    getNextAt(canMax) {
        // inverse of the gain curve: flux needed for one more strength
        let S = monsoonStrengthMult().max(0.01)
        if (hasMilestone(this.layer, 4)) S = S.pow(1.1)
        return Decimal.pow(10, player.mon.points.add(1).div(S).max(1).sqrt())
    },
    canReset() { return player.mon.flux.gte(10) },
    prestigeButtonText() {
        return L("Monsoon Surge", "季风爆发") + "<br>+" + format(tmp[this.layer].resetGain)
            + L(" Strength", " 强度") + "<br><span style='opacity:.7'>(" + L("consumes all flux", "消耗全部通量") + ")</span>"
    },
    onPrestige(gain) {
        player.mon.flux = new Decimal(0)      // the surge consumes the flux
    },

    // automation (land m0 package; N-AUTOWIPE: implies resetsNothing)
    autoPrestige() { return player.land && hasMilestone("land", 0) },
    autoUpgrade() { return player.land && hasMilestone("land", 0) },
    resetsNothing() { return player.land && hasMilestone("land", 0) },

    update(diff) {
        if (!player[this.layer].unlocked) return
        let ndiff = new Decimal(diff)
        // moisture transport: bars complete -> flux
        let speed = monsoonSpeed()
        player.mon.progress = player.mon.progress.add(speed.times(ndiff))
        let cg = monsoonCycleGain()
        let guard = 0
        while (player.mon.progress.gte(1) && guard < 100) {
            player.mon.progress = player.mon.progress.sub(1)
            player.mon.flux = player.mon.flux.add(cg)
            guard++
        }
        // tank inflow, hard-capped at saturation (relative humidity 100%)
        player.mon.tank = player.mon.tank.add(monsoonTankRate().times(ndiff))
        if (player.mon.tank.gte(TUNING.SAT_CAP)) player.mon.tank = new Decimal(TUNING.SAT_CAP)
    },

    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        layerDataReset(this.layer, ["unlocked", "best", "total"])
    },

    layerShown() { return player[this.layer].unlocked || player.evap.best.gte(450) },
    hotkeys: [
        { key: "m", description: function() { return L("M: Monsoon Surge", "M：季风爆发") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#48C9B0'>" + L("Monsoon Strength: ", "季风强度：") + "<b>" + formatWhole(player.mon.points) + "</b>"
                + L("  |  stored flux: ", " ｜ 储存通量：") + format(player.mon.flux) + "</h2>"
        }],
        ["display-text", function() {
            return "<span style='opacity:.65'>" + L("Best: ", "最佳：") + formatWhole(player.mon.best) + "</span>"
        }],
        "prestige-button", "blank",
        ["blank", "10px"],
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            "Transport": {
                tabLabel() { return L("Transport", "输送") },
                unlocked() { return true },
                content: [
                    ["blank", "10px"],
                    ["display-text", function() {
                        return "<span style='opacity:.75'>" + L(
                            "The monsoon pipeline carries vapor across the basin. Each completed cycle banks flux; surging converts flux into strength.",
                            "季风管道把水汽输送过洋面。每完成一圈储存通量；爆发把通量转化为强度。") + "</span>"
                    }],
                    ["blank", "10px"],
                    ["bar", "transport"],
                    ["blank", "8px"],
                    ["bar", "tankbar"],
                    ["blank", "8px"],
                    "clickables",
                    ["display-text", function() {
                        let left = Math.max(0, Math.ceil((player.mon.pumpLast + pumpCooldownMs() - Date.now()) / 1000))
                        return "<span style='opacity:.6'>" + L("Seeding cooldown: ", "增雨冷却：") + left + "s"
                            + L("  |  tank: ", " ｜ 水汽储存：") + format(player.mon.tank) + " / " + format(new Decimal(TUNING.SAT_CAP)) + "</span>"
                    }],
                ],
            },
            "Upgrades": {
                tabLabel() { return L("Upgrades", "升级") },
                unlocked() { return true },
                content: [["blank", "10px"], ["display-text", function() { return L("Spends stored flux.", "花费储存通量。") }], "blank", "upgrades"],
            },
            "Milestones": {
                tabLabel() { return L("Milestones", "里程碑") },
                unlocked() { return true },
                content: [["blank", "10px"], "milestones"],
            },
        },
    },

    bars: {
        transport: {
            direction: RIGHT,
            width: 320, height: 34,
            progress() { return player.mon.progress.min(1).max(0).toNumber() },   // never divides (no ÷0)
            display() { return L("Transport cycle ", "输送循环 ") + format(player.mon.progress.times(100), 1) + "%"
                + L("  → +", "  → +") + format(monsoonCycleGain()) + L(" flux", " 通量") },
            fillStyle: { 'background-color': "#48C9B0" },
            baseStyle: { 'background-color': "#0e2a24" },
        },
        tankbar: {
            direction: RIGHT,
            width: 320, height: 26,
            progress() { return player.mon.tank.div(TUNING.SAT_CAP).min(1).max(0).toNumber() },
            display() { return L("Moisture tank ", "水汽储存 ") + format(player.mon.tank) + " / " + format(new Decimal(TUNING.SAT_CAP))
                + L(" (saturated at 100% RH)", "（相对湿度 100% 饱和）") },
            fillStyle: { 'background-color': "#7FB3D5" },
            baseStyle: { 'background-color': "#12233a" },
        },
    },

    clickables: {
        11: { title: function() { return L("Cloud Seeding", "人工增雨") },
              display() {
                  return L("Burn 10% of the tank for an instant ", "燃烧 10% 储存，立刻获得 ")
                      + pumpSeconds() + L("s of vapor production.", " 秒的水汽产出。")
              },
              canClick() {
                  let cdOk = (Date.now() - player.mon.pumpLast) >= pumpCooldownMs()
                  return player.mon.tank.gte(10) && cdOk && hasUpgrade(this.layer, 15)
              },
              onClick() {
                  player.mon.tank = player.mon.tank.times(0.9)
                  player.points = player.points.add(getPointGen().times(pumpSeconds()))
                  player.mon.pumpLast = Date.now()
              },
              style() {
                  let cdOk = (Date.now() - player.mon.pumpLast) >= pumpCooldownMs()
                  return { 'background-color': cdOk ? "#48C9B0" : "#14524a" }
              } },
    },

    upgrades: {
        rows: 3, cols: 5,
        11: { title: function() { return L("Cross-Equatorial Flow", "越赤道气流") },
              description() { return L("Flux gain x2.", "通量获取 ×2。") },
              cost: new Decimal(5),
              currencyDisplayName() { return L("stored flux", "储存通量") },
              currencyInternalName: "flux",
              currencyLocation() { return player.mon } },
        12: { title: function() { return L("Moisture Recycling", "水汽循环") },
              description() { return L("Tank inflow x2.", "水汽储存注入 ×2。") },
              cost: new Decimal(50),
              currencyDisplayName() { return L("stored flux", "储存通量") },
              currencyInternalName: "flux",
              currencyLocation() { return player.mon },
              unlocked() { return hasUpgrade(this.layer, 11) } },
        13: { title: function() { return L("Saturated Column", "饱和气柱") },
              description() { return L("Flux gain x3 while the tank is at least half full.", "储存半满以上时通量获取 ×3。") },
              cost: new Decimal(500),
              currencyDisplayName() { return L("stored flux", "储存通量") },
              currencyInternalName: "flux",
              currencyLocation() { return player.mon },
              unlocked() { return hasUpgrade(this.layer, 11) } },
        14: { title: function() { return L("Self-Sustaining Surge", "自持涌动") },
              description() { return L("Cycle gain is boosted by stored flux (softcapped).", "循环收益随通量增长（软帽）。") },
              cost: new Decimal("1e4"),
              currencyDisplayName() { return L("stored flux", "储存通量") },
              currencyInternalName: "flux",
              currencyLocation() { return player.mon },
              unlocked() { return hasUpgrade(this.layer, 11) },
              effect() {
                  let r = player.mon.flux.add(1).pow(0.35)
                  return softcap(r, new Decimal("1e8"), 0.5)
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: function() { return L("Seeding Flights", "播撒作业") },
              description() { return L("Unlocks Cloud Seeding.", "解锁「人工增雨」。") },
              cost: new Decimal("1e5"),
              currencyDisplayName() { return L("stored flux", "储存通量") },
              currencyInternalName: "flux",
              currencyLocation() { return player.mon },
              unlocked() { return hasUpgrade(this.layer, 11) } },
        21: { title: function() { return L("Monsoon Surge", "季风涌动") },
              description() { return L("Something vast arrives. Flux gain x5.", "庞大的水汽到场。通量获取 ×5。") },
              cost: new Decimal(7),
              currencyDisplayName() { return L("stored flux", "储存通量") },
              currencyInternalName: "flux",
              currencyLocation() { return player.mon },                                  // deliberate key drop
              unlocked() { return hasUpgrade(this.layer, 15) } },
        22: { title: function() { return L("Low-Level Jet", "低空急流") },
              description() { return L("Transport runs 50% faster.", "输送提速 50%。") },
              cost: new Decimal("1e7"),
              currencyDisplayName() { return L("stored flux", "储存通量") },
              currencyInternalName: "flux",
              currencyLocation() { return player.mon },
              unlocked() { return hasUpgrade(this.layer, 21) } },
        23: { title: function() { return L("Longer Sorties", "更长架次") },
              description() { return L("Cloud Seeding grants +20s of production.", "人工增雨额外 +20 秒产出。") },
              cost: new Decimal("1e9"),
              currencyDisplayName() { return L("stored flux", "储存通量") },
              currencyInternalName: "flux",
              currencyLocation() { return player.mon },
              unlocked() { return hasUpgrade(this.layer, 22) } },
        24: { title: function() { return L("Battle-Tested Pipeline", "实战管道") },
              description() { return L("Strength gain grows with your hostile-environment completions.", "强度获取随恶劣环境挑战通关数增长。") },
              cost: new Decimal("1e11"),
              currencyDisplayName() { return L("stored flux", "储存通量") },
              currencyInternalName: "flux",
              currencyLocation() { return player.mon },
              unlocked() { return hasUpgrade(this.layer, 22) },
              effectDisplay() {
                  let c = player.env ? new Decimal(challengeCompletions("env", 11)).add(challengeCompletions("env", 12)).add(challengeCompletions("env", 21)).add(challengeCompletions("env", 22)).add(challengeCompletions("env", 31)) : new Decimal(0)
                  return "x" + format(c.times(0.5).add(1))
              } },
        25: { title: function() { return L("Flux Compression", "通量压缩") },
              description() { return L("Strength gain is boosted by the log of stored flux.", "强度获取随通量对数增长。") },
              cost: new Decimal("1e13"),
              currencyDisplayName() { return L("stored flux", "储存通量") },
              currencyInternalName: "flux",
              currencyLocation() { return player.mon },
              unlocked() { return hasUpgrade(this.layer, 22) } },
        31: { title: function() { return L("Basin-Scale Fetch", "全洋域风区") },
              description() { return L("Strength gain is boosted by your best latent heat.", "强度获取随最佳潜热增长。") },
              cost: new Decimal("1e15"),
              currencyDisplayName() { return L("stored flux", "储存通量") },
              currencyInternalName: "flux",
              currencyLocation() { return player.mon },
              unlocked() { return hasUpgrade(this.layer, 25) },
              effect() { return player.evap.best.add(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        32: { title: function() { return L("Envelope Rotation", "外围旋转") },
              description() { return L("Triple strength gain.", "强度获取 ×3。") },
              cost: new Decimal("1e17"),
              currencyDisplayName() { return L("stored flux", "储存通量") },
              currencyInternalName: "flux",
              currencyLocation() { return player.mon },
              unlocked() { return hasUpgrade(this.layer, 31) } },
    },

    milestones: {
        0: { requirementDescription: function() { return L("2 best strength", "最佳强度 2") },
             effectDescription() { return L("Flux gain x2.", "通量获取 ×2。") },
             done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: function() { return L("5 best strength", "最佳强度 5") },
             effectDescription() { return L("The sea feeds itself: passive latent heat generation, and vapor x2.", "海面自馈：被动潜热生成，水汽 ×2。") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: function() { return L("10 best strength", "最佳强度 10") },
             effectDescription() { return L("Tank inflow x2.", "水汽储存注入 ×2。") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: function() { return L("25 best strength", "最佳强度 25") },
             effectDescription() { return L("Cloud Seeding cooldown halved.", "人工增雨冷却减半。") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: function() { return L("50 best strength", "最佳强度 50") },
             effectDescription() { return L("Raises strength gain to a power of 1.1.", "强度获取变为 1.1 次方。") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].best.gte(50) } },
        5: { requirementDescription: function() { return L("100 best strength", "最佳强度 100") },
             effectDescription() { return L("Water vapor gain x5.", "水汽获取 ×5。") },
             unlocked() { return hasMilestone(this.layer, 4) },
             done() { return player[this.layer].best.gte(100) } },
    },
})
