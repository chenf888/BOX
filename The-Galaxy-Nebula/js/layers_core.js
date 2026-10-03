addLayer("gc", {
    name: "Gas Clouds",
    symbol: "GC",
    position: 0,
    row: 0,
    color: "#9fd0ff",
    resource: "gas clouds",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal(10),
    type: "normal",
    exponent: 0.5,
    branches: [],
    layerShown() { return true },
    startData() { return { unlocked: true, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "a", description: "A: Collapse stardust into gas clouds",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("gc", 11)) m = m.times(2)
        if (hasUpgrade("gc", 12)) m = m.times(upgradeEffect("gc", 12))
        if (hasUpgrade("gc", 13)) m = m.times(upgradeEffect("gc", 13))
        if (hasUpgrade("gc", 14)) m = m.times(upgradeEffect("gc", 14))
        if (hasUpgrade("gc", 25)) m = m.times(upgradeEffect("gc", 25))
        if (hasMilestone("gc", 0)) m = m.times(2.5)
        if (hasMilestone("gc", 1)) m = m.times(3)
        if (getBuyableAmount("gc", 11).gte(1)) m = m.times(buyableEffect("gc", 11))
        if (hasUpgrade("pe1", 23)) m = m.times(upgradeEffect("pe1", 23))
        if (hasUpgrade("pe1", 31)) m = m.times(upgradeEffect("pe1", 31))

        if (hasMilestone("pe1", 1)) m = m.times(8)
        if (hasMilestone("pe2", 1)) m = m.times(8)
        if (hasMilestone("pe4", 1)) m = m.times(8)
        if (hasMilestone("pe5", 1)) m = m.times(8)
        if (hasMilestone("pe6", 1)) m = m.times(8)
        if (hasMilestone("pe7", 1)) m = m.times(8)
        if (hasMilestone("pe8", 1)) m = m.times(8)
        if (hasMilestone("pe9", 1)) m = m.times(8)
        if (hasMilestone("pe10", 1)) m = m.times(8)
        if (hasMilestone("pe11", 1)) m = m.times(8)
        if (hasMilestone("pe12", 1)) m = m.times(8)
        if (hasMilestone("pe13", 1)) m = m.times(8)
        if (hasMilestone("pe14", 1)) m = m.times(8)
        if (hasMilestone("pe15", 1)) m = m.times(8)
        if (hasMilestone("pe16", 1)) m = m.times(8)
        if (hasMilestone("pe17", 1)) m = m.times(8)
        if (hasMilestone("pe18", 1)) m = m.times(8)
        if (hasMilestone("pe19", 1)) m = m.times(8)
        if (hasMilestone("pe20", 1)) m = m.times(8)
        if (hasMilestone("pe21", 1)) m = m.times(8)
        if (hasMilestone("pe22", 1)) m = m.times(8)

        if (hasUpgrade("fu", 31)) m = m.times(upgradeEffect("fu", 31))
        if (hasUpgrade("pl", 23)) m = m.times(upgradeEffect("pl", 23))
        if (hasUpgrade("dm", 14)) m = m.times(1e4)
        if (hasChallenge("oa6", 12)) m = m.times(challengeEffect("oa6", 12))
        if (hasChallenge("oa6", 22)) m = m.times(challengeEffect("oa6", 22))
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal(1e3)
        if (hasUpgrade("gc", 24)) c = c.times(1e3)
        if (hasMilestone("gc", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },
    resetsNothing() { if (hasMilestone("fu", 2)) return true },
    passiveGeneration() { if (hasMilestone("fu", 3)) return 1 },
    autoPrestige() { if (hasMilestone("pl", 0)) return true },
    autoUpgrade() { if (hasMilestone("pl", 2)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("gc", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.gc.points.gte(tmp.gc.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.gc.softcap) + ' gas clouds' }],
        ["blank", "12px"],
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            Upgrades: { content: [["blank", "8px"], "upgrades"] },
            Milestones: { content: [["blank", "8px"], "milestones"] },
            "Cloud Shaping": {
                unlocked() { return hasUpgrade("gc", 25) },
                content: [["blank", "8px"], "buyables"],
                buttonStyle() { return { 'background-color': '#9fd0ff', 'color': '#0b1d33' } },
            },
        },
    },
    upgrades: {
        11: { title: "Cold Collapse",
              description: "Jeans instability wins: gas cloud gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Turbulent Seeds",
              description: "Gas cloud gain is boosted by your unspent gas clouds.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("gc", 11) },
              effect() {
                  let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e12"), 0.5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "First Light",
              description: "Protostar energy feeds the clouds.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("gc", 12) },
              effect() {
                  let ret = player.ps.points.add(1).pow(0.4)
                  if (hasUpgrade("gc", 21)) ret = ret.pow(1.1)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Cloudshine",
              description: "×5 gas cloud gain once you hold 100 gas clouds; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("gc", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "The Cloud Ignites",
              description: "Unlock the Protostar Ignition chamber — and the Perseus Arm.",
              cost: new Decimal(400),
              unlocked() { return hasUpgrade("gc", 14) },
              onPurchase() {
                  player.ps.unlocked = true
                  player.pe1.unlocked = true
              } },
        21: { title: "Cloud Lenses",
              description: "First Light (u13) is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("gc", 15) } },
        22: { title: "Cosmic Infall",
              description: "Stardust gain ×3.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("gc", 11) } },
        23: { title: "Fusion Feedstock",
              description: "Fusion plasma gain is boosted by your gas clouds.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("gc", 15) },
              effect() { return player[this.layer].points.add(1).pow(0.35).times(2) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Windows",
              description: "Gas cloud gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("gc", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Cloud Shaping",
              description: "Unlock the Cloud Shaping buyables.",
              cost: new Decimal(8e4),
              unlocked() { return hasUpgrade("gc", 23) },
              effect() { return buyableEffect("gc", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gas clouds" } },
        31: { title: "Planetary Seeding",
              description: "Planetary system gain is boosted by your milestones here.",
              cost: new Decimal(5e5),
              unlocked() { return hasUpgrade("gc", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "6,000 gas clouds",
             effectDescription: "Gas cloud gain ×2.5",
             done() { return player[this.layer].best.gte(6000) } },
        1: { requirementDescription: "4e4 gas clouds",
             effectDescription: "Gain 2% of your gas cloud reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(4e4) } },
        2: { requirementDescription: "2.5e6 gas clouds",
             effectDescription: "Gas cloud gain softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(2.5e6) } },
        3: { requirementDescription: "2e8 gas clouds",
             effectDescription: "Gas clouds and Cloud Shaping purchases survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(2e8) } },
    },
    buyables: {
        11: { title: "Cloud Compressor",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { let d = tmp[this.layer].buyables[this.id]
                  return "Cost: " + format(d.cost) + " gas clouds<br>Gas cloud gain ×" + format(d.effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Stardust Siphon",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { let d = tmp[this.layer].buyables[this.id]
                  return "Cost: " + format(d.cost) + " gas clouds<br>Stardust gain ×" + format(d.effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },
    update(diff) {
        if (hasMilestone("gc", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.gc.points = player.gc.points.add(tmp.gc.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("ps", {
    name: "Protostar Ignition",
    symbol: "PS",
    position: 1,
    row: 0,
    color: "#ffd28a",
    resource: "protostar energy",
    type: "none",
    layerShown() { return player.ps.unlocked },
    startData() { return {
        unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0),
        compression: new Decimal(0), compressing: false, ignitions: 0,
    } },
    tabFormat: [
        "main-display",
        ["display-text", function() { return 'Feed the collapsing core with gas, compress it, then ignite.' }],
        ["display-text", function() { return 'Compression speed scales with your gas clouds and fusion plasma.' }],
        ["blank", "10px"],
        ["bar", "compression"],
        ["blank", "10px"],
        ["clickables", 1],
        ["blank", "10px"],
        ["display-text", function() { return 'Ignitions so far: <b>' + formatWhole(player.ps.ignitions) + '</b>' }],
        ["blank", "10px"],
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            Milestones: { content: [["blank", "8px"], "milestones"] },
            Upgrades: { unlocked() { return hasMilestone("ps", 1) }, content: [["blank", "8px"], "upgrades"] },
        },
    },
    bars: {
        compression: {
            direction: RIGHT,
            width: 320, height: 42,
            progress() { return player.ps.compression.div(tmp.ps.compressTarget).min(1).toNumber() },
            display() { return "Compression: " + format(player.ps.compression) + " / " + format(tmp.ps.compressTarget) },
            fillStyle: { 'background-color': "#ffd28a" },
            baseStyle: { 'background-color': "#3a2f1d" },
            textStyle: { 'color': "#1d1608" },
        },
    },
    compressTarget() {
        let t = new Decimal(100)
        if (hasUpgrade("ps", 14)) t = t.times(1e3)
        return t
    },
    compressSpeed() {
        let s = new Decimal(2)
        s = s.times(player.gc.points.add(1).log(10).plus(1))
        if (hasUpgrade("ps", 12)) s = s.times(upgradeEffect("ps", 12))
        if (hasUpgrade("ps", 13)) s = s.times(upgradeEffect("ps", 13))
        if (hasMilestone("ps", 2)) s = s.times(4)
        return s
    },
    burstSize() {
        let b = player.gc.points.add(1).pow(0.6).times(3)
        if (hasUpgrade("oa1", 23)) b = b.times(upgradeEffect("oa1", 23))
        if (hasUpgrade("oa1", 31)) b = b.times(upgradeEffect("oa1", 31))

        if (hasUpgrade("ps", 11)) b = b.times(3)
        if (hasUpgrade("ps", 22)) b = b.times(upgradeEffect("ps", 22))
        if (hasUpgrade("ps", 23)) b = b.times(upgradeEffect("ps", 23))
        if (hasMilestone("ps", 3)) b = b.times(4)
        return b
    },
    clickables: {
        11: { title: "Compress",
              display() { return player.ps.compressing ? "Compressing the core..." : "Start compressing" },
              canClick() { return !player.ps.compressing && player.ps.compression.lt(tmp.ps.compressTarget) },
              onClick() { player.ps.compressing = true },
              style() { return player.ps.compressing ? { 'background-color': '#ffd28a', 'color': '#1d1608' } : {} } },
        12: { title: "Ignite!",
              display() { return "IGNITE THE CORE<br>Burst: +" + format(tmp.ps.burstSize) + " protostar energy" },
              canClick() { return player.ps.compression.gte(tmp.ps.compressTarget) },
              onClick() {
                  player.ps.points = player.ps.points.add(tmp.ps.burstSize)
                  player.ps.total = player.ps.total.add(tmp.ps.burstSize)
                  player.ps.best = player.ps.best.max(player.ps.points)
                  player.ps.ignitions = player.ps.ignitions + 1
                  player.ps.compression = new Decimal(0)
                  player.ps.compressing = false
                  makeParticles({ text: "+energy", color: "#ffd28a", time: 2, layer: "ps" }, 3)
              },
              style() { return { 'background-color': '#ff9d5c', 'color': '#2a1204', 'font-weight': 'bold' } } },
    },
    milestones: {
        0: { requirementDescription: "3 ignitions",
             effectDescription: "Unlock the Fusion Cores layer",
             done() { return player.ps.ignitions >= 3 },
             onComplete() { if (!player.fu.unlocked) player.fu.unlocked = true } },
        1: { requirementDescription: "500 protostar energy",
             effectDescription: "Unlock protostar upgrades",
             unlocked() { return hasMilestone("ps", 0) },
             done() { return player.ps.best.gte(500) } },
        2: { requirementDescription: "5,000 protostar energy",
             effectDescription: "Compression runs 4× faster; unlock the Outer Arm",
             unlocked() { return hasMilestone("ps", 1) },
             done() { return player.ps.best.gte(5000) },
             onComplete() { if (!player.oa1.unlocked) player.oa1.unlocked = true } },
        3: { requirementDescription: "5e4 protostar energy",
             effectDescription: "Ignition bursts ×4",
             unlocked() { return hasMilestone("ps", 2) },
             done() { return player.ps.best.gte(5e4) } },
    },
    upgrades: {
        11: { title: "Deuterium Flash",
              description: "Ignition bursts ×3.",
              cost: new Decimal(100) },
        12: { title: "Kelvin-Helmholtz Grip",
              description: "Compression speed is boosted by your protostar energy.",
              cost: new Decimal(400),
              unlocked() { return hasUpgrade("ps", 11) },
              effect() { return player[this.layer].points.add(1).pow(0.4) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Accretion Columns",
              description: "Compression speed is boosted by your fusion plasma.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("ps", 12) },
              effect() { return player.fu.points.add(1).pow(0.35) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "T Tauri Wind",
              description: "The core accepts 1,000× more compression per cycle.",
              cost: new Decimal(1e4),
              unlocked() { return hasUpgrade("ps", 13) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "target ×" + format(upgradeEffect(this.layer, this.id)) } },
        15: { title: "A Star Is Born",
              description: "Stardust gain ×25.",
              cost: new Decimal(5e4),
              unlocked() { return hasUpgrade("ps", 14) } },
        21: { title: "Fed by Worlds",
              description: "Planetary systems feed the compression. (auto-compress)",
              cost: new Decimal(2.5e5),
              unlocked() { return hasUpgrade("ps", 15) } },
        22: { title: "Hayashi Track",
              description: "Bursts are boosted by your protostar energy.",
              cost: new Decimal(1e6),
              unlocked() { return hasUpgrade("ps", 21) },
              effect() { return player[this.layer].points.add(1).pow(0.45) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        23: { title: "Bipolar Outflow",
              description: "Bursts are boosted by your gas clouds, hard.",
              cost: new Decimal(8e6),
              unlocked() { return hasUpgrade("ps", 22) },
              effect() { return player.gc.points.add(1).pow(0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    update(diff) {
        if (player.ps.compressing) {
            let speed = tmp.ps.compressSpeed
            if (hasUpgrade("ps", 21)) speed = speed.times(player.pl.points.add(1).pow(0.3))
            player.ps.compression = player.ps.compression.add(speed.times(diff))
            if (player.ps.compression.gte(tmp.ps.compressTarget)) player.ps.compression = tmp.ps.compressTarget
        }
    },
})

addLayer("fu", {
    name: "Fusion Cores",
    symbol: "FU",
    position: 2,
    row: 0,
    color: "#ff9d5c",
    resource: "fusion plasma",
    resetDescription: "Light the fires for ",
    baseResource: "gas clouds",
    baseAmount() { return player.gc.points },
    requires: new Decimal(400),
    type: "normal",
    exponent: 0.5,
    branches: [["gc", 1, 2]],
    layerShown() { return player.fu.unlocked || hasUpgrade("gc", 15) || player.ps.unlocked },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "1", description: "1: Light the fires for fusion plasma",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("fu", 11)) m = m.times(2)
        if (hasUpgrade("fu", 12)) m = m.times(upgradeEffect("fu", 12))
        if (hasUpgrade("fu", 13)) m = m.times(upgradeEffect("fu", 13))
        if (hasUpgrade("fu", 14)) m = m.times(upgradeEffect("fu", 14))
        if (hasUpgrade("fu", 25)) m = m.times(upgradeEffect("fu", 25))
        if (hasMilestone("fu", 0)) m = m.times(2.5)
        if (hasMilestone("fu", 1)) m = m.times(3)
        if (hasUpgrade("gc", 23)) m = m.times(upgradeEffect("gc", 23))
        if (hasUpgrade("pl", 31)) m = m.times(upgradeEffect("pl", 31))
        if (getBuyableAmount("fu", 11).gte(1)) m = m.times(buyableEffect("fu", 11))
        if (hasUpgrade("or1", 23)) m = m.times(upgradeEffect("or1", 23))
        if (hasUpgrade("or1", 31)) m = m.times(upgradeEffect("or1", 31))

        if (hasMilestone("oa1", 1)) m = m.times(8)
        if (hasMilestone("oa2", 1)) m = m.times(8)
        if (hasMilestone("oa3", 1)) m = m.times(8)
        if (hasMilestone("oa4", 1)) m = m.times(8)
        if (hasMilestone("oa5", 1)) m = m.times(8)
        if (hasMilestone("oa7", 1)) m = m.times(8)
        if (hasMilestone("oa8", 1)) m = m.times(8)
        if (hasMilestone("oa9", 1)) m = m.times(8)
        if (hasMilestone("oa10", 1)) m = m.times(8)
        if (hasMilestone("oa11", 1)) m = m.times(8)
        if (hasMilestone("oa12", 1)) m = m.times(8)
        if (hasMilestone("oa13", 1)) m = m.times(8)
        if (hasMilestone("oa14", 1)) m = m.times(8)
        if (hasMilestone("oa15", 1)) m = m.times(8)
        if (hasMilestone("oa16", 1)) m = m.times(8)
        if (hasMilestone("oa17", 1)) m = m.times(8)
        if (hasMilestone("oa18", 1)) m = m.times(8)
        if (hasMilestone("oa19", 1)) m = m.times(8)
        if (hasMilestone("oa20", 1)) m = m.times(8)
        if (hasMilestone("oa21", 1)) m = m.times(8)
        if (hasMilestone("oa22", 1)) m = m.times(8)

        if (hasChallenge("oa6", 22)) m = m.times(challengeEffect("oa6", 22))
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal(1e3)
        if (hasUpgrade("fu", 24)) c = c.times(1e3)
        if (hasMilestone("fu", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },
    resetsNothing() { if (hasMilestone("or1", 2)) return true },
    passiveGeneration() { if (hasMilestone("or1", 2)) return 1 },
    autoPrestige() { if (hasMilestone("pe1", 2)) return true },
    autoUpgrade() { if (hasMilestone("pe1", 2)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("fu", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.gc.points) + ' gas clouds' }],
        ["display-text", function() { if (player.fu.points.gte(tmp.fu.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.fu.softcap) + ' fusion plasma' }],
        ["blank", "12px"],
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            Upgrades: { content: [["blank", "8px"], "upgrades"] },
            Milestones: { content: [["blank", "8px"], "milestones"] },
            Reactor: {
                unlocked() { return hasUpgrade("fu", 25) },
                content: [["blank", "8px"], "buyables"],
                buttonStyle() { return { 'background-color': '#ff9d5c', 'color': '#2a1204' } },
            },
        },
    },
    upgrades: {
        11: { title: "Proton-Proton Chain",
              description: "Fusion plasma gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Hydrostatic Fire",
              description: "Fusion plasma gain is boosted by your unspent fusion plasma.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("fu", 11) },
              effect() {
                  let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e12"), 0.5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Carbon Catalyst",
              description: "Your gas clouds feed the reactor.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("fu", 12) },
              effect() {
                  let ret = player.gc.points.add(1).pow(0.4)
                  if (hasUpgrade("fu", 21)) ret = ret.pow(1.1)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Luminosity Class V",
              description: "×5 fusion plasma gain at 100 plasma; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("fu", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Worlds Coalesce",
              description: "Unlock the Planetary Systems layer.",
              cost: new Decimal(400),
              unlocked() { return hasUpgrade("fu", 14) },
              onPurchase() { player.pl.unlocked = true } },
        21: { title: "CNO Bloom",
              description: "Carbon Catalyst (u13) is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("fu", 15) } },
        22: { title: "Stellar Windfall",
              description: "Stardust gain ×3.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("fu", 11) } },
        23: { title: "Plasma Bridge",
              description: "Planetary system gain is boosted by your fusion plasma.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("fu", 15) },
              effect() { return player[this.layer].points.add(1).pow(0.35).times(2) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Confinement Fields",
              description: "Fusion plasma gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("fu", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Open the Reactor",
              description: "Unlock the Reactor buyables.",
              cost: new Decimal(8e4),
              unlocked() { return hasUpgrade("fu", 23) },
              effect() { return buyableEffect("fu", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x plasma" } },
        31: { title: "Helium Ash",
              description: "Gas cloud gain is boosted by your milestones here.",
              cost: new Decimal(5e5),
              unlocked() { return hasUpgrade("fu", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "2,400 fusion plasma",
             effectDescription: "Fusion plasma gain ×2.5",
             done() { return player[this.layer].best.gte(2400) } },
        1: { requirementDescription: "1.6e4 fusion plasma",
             effectDescription: "Fusion plasma gain ×3; unlock the Orion Arm",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(1.6e4) },
             onComplete() { if (!player.or1.unlocked) player.or1.unlocked = true } },
        2: { requirementDescription: "1e5 fusion plasma",
             effectDescription: "Gas clouds no longer reset when you prestige for gas clouds",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(1e5) } },
        3: { requirementDescription: "8e5 fusion plasma",
             effectDescription: "Gas clouds generate passively; gas cloud upgrades keep on reset",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(8e5) } },
    },
    buyables: {
        11: { title: "Confinement Torus",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { let d = tmp[this.layer].buyables[this.id]
                  return "Cost: " + format(d.cost) + " fusion plasma<br>Fusion plasma gain ×" + format(d.effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Photospere Tap",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { let d = tmp[this.layer].buyables[this.id]
                  return "Cost: " + format(d.cost) + " fusion plasma<br>Stardust gain ×" + format(d.effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },
    update(diff) {
        if (hasMilestone("fu", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.fu.points = player.fu.points.add(tmp.fu.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("pl", {
    name: "Planetary Systems",
    symbol: "PL",
    position: 3,
    row: 0,
    color: "#b8a7ff",
    resource: "planetary systems",
    resetDescription: "Accrete worlds for ",
    baseResource: "fusion plasma",
    baseAmount() { return player.fu.points },
    requires: new Decimal(1e4),
    type: "normal",
    exponent: 0.5,
    branches: [["fu", 1, 2]],
    layerShown() { return player.pl.unlocked || hasUpgrade("fu", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "2", description: "2: Accrete worlds for planetary systems",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pl", 11)) m = m.times(2)
        if (hasUpgrade("pl", 12)) m = m.times(upgradeEffect("pl", 12))
        if (hasUpgrade("pl", 13)) m = m.times(upgradeEffect("pl", 13))
        if (hasUpgrade("pl", 14)) m = m.times(upgradeEffect("pl", 14))
        if (hasUpgrade("pl", 25)) m = m.times(upgradeEffect("pl", 25))
        if (hasMilestone("pl", 0)) m = m.times(2.5)
        if (hasMilestone("pl", 1)) m = m.times(3)
        if (hasUpgrade("fu", 23)) m = m.times(upgradeEffect("fu", 23))
        if (hasUpgrade("gc", 31)) m = m.times(upgradeEffect("gc", 31))
        if (getBuyableAmount("pl", 11).gte(1)) m = m.times(buyableEffect("pl", 11))
        if (hasUpgrade("sg1", 23)) m = m.times(upgradeEffect("sg1", 23))
        if (hasUpgrade("sg1", 31)) m = m.times(upgradeEffect("sg1", 31))

        if (hasMilestone("sg1", 1)) m = m.times(8)
        if (hasMilestone("sg2", 1)) m = m.times(8)
        if (hasMilestone("sg3", 1)) m = m.times(8)
        if (hasMilestone("sg4", 1)) m = m.times(8)
        if (hasMilestone("sg5", 1)) m = m.times(8)
        if (hasMilestone("sg6", 1)) m = m.times(8)
        if (hasMilestone("sg7", 1)) m = m.times(8)
        if (hasMilestone("sg8", 1)) m = m.times(8)
        if (hasMilestone("sg9", 1)) m = m.times(8)
        if (hasMilestone("sg10", 1)) m = m.times(8)
        if (hasMilestone("sg11", 1)) m = m.times(8)
        if (hasMilestone("sg12", 1)) m = m.times(8)
        if (hasMilestone("sg13", 1)) m = m.times(8)
        if (hasMilestone("sg14", 1)) m = m.times(8)
        if (hasMilestone("sg15", 1)) m = m.times(8)
        if (hasMilestone("sg16", 1)) m = m.times(8)
        if (hasMilestone("sg17", 1)) m = m.times(8)
        if (hasMilestone("sg18", 1)) m = m.times(8)
        if (hasMilestone("sg19", 1)) m = m.times(8)
        if (hasMilestone("sg20", 1)) m = m.times(8)
        if (hasMilestone("sg21", 1)) m = m.times(8)
        if (hasMilestone("sg22", 1)) m = m.times(8)

        if (hasChallenge("oa6", 22)) m = m.times(challengeEffect("oa6", 22))
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal(1e3)
        if (hasUpgrade("pl", 24)) c = c.times(1e3)
        if (hasMilestone("pl", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },
    resetsNothing() { if (hasMilestone("sg2", 2)) return true },
    passiveGeneration() { if (hasMilestone("sg2", 2)) return 1 },
    autoPrestige() { if (hasMilestone("pe1", 2)) return true },
    autoUpgrade() { if (hasMilestone("sg2", 2)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("pl", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.fu.points) + ' fusion plasma' }],
        ["display-text", function() { if (player.pl.points.gte(tmp.pl.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.pl.softcap) + ' planetary systems' }],
        ["blank", "12px"],
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            Upgrades: { content: [["blank", "8px"], "upgrades"] },
            Milestones: { content: [["blank", "8px"], "milestones"] },
            Orrery: {
                unlocked() { return hasUpgrade("pl", 25) },
                content: [["blank", "8px"], "buyables"],
                buttonStyle() { return { 'background-color': '#b8a7ff', 'color': '#1a1030' } },
            },
        },
    },
    upgrades: {
        11: { title: "Protoplanetary Discs",
              description: "Planetary system gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Runaway Accretion",
              description: "Planetary system gain is boosted by your unspent planetary systems.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pl", 11) },
              effect() {
                  let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e12"), 0.5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Grand Tack",
              description: "Your fusion plasma shapes the orbits.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("pl", 12) },
              effect() {
                  let ret = player.fu.points.add(1).pow(0.4)
                  if (hasUpgrade("pl", 21)) ret = ret.pow(1.1)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Resonant Chains",
              description: "×5 planetary system gain at 100 systems; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("pl", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "The Sagittarius Arm Beckons",
              description: "Unlock the Sagittarius Arm.",
              cost: new Decimal(400),
              unlocked() { return hasUpgrade("pl", 14) },
              onPurchase() { player.sg1.unlocked = true } },
        21: { title: "Giant relocated",
              description: "Grand Tack (u13) is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("pl", 15) } },
        22: { title: "Late Heavy Bombardment",
              description: "Stardust gain ×3.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("pl", 11) } },
        23: { title: "Tidal Locking",
              description: "Gas cloud gain is boosted by your planetary systems.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("pl", 15) },
              effect() { return player[this.layer].points.add(1).pow(0.35).times(2) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Hill Spheres",
              description: "Planetary system gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("pl", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Draw the Orrery",
              description: "Unlock the Orrery buyables.",
              cost: new Decimal(8e4),
              unlocked() { return hasUpgrade("pl", 23) },
              effect() { return buyableEffect("pl", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x systems" } },
        31: { title: "Exoplanet Census",
              description: "Fusion plasma gain is boosted by your milestones here.",
              cost: new Decimal(5e5),
              unlocked() { return hasUpgrade("pl", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "6e4 planetary systems",
             effectDescription: "Gas clouds gain auto-prestige (toggleable)",
             done() { return player[this.layer].best.gte(6e4) } },
        1: { requirementDescription: "4e5 planetary systems",
             effectDescription: "Planetary system gain ×3; stardust gain ×25",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(4e5) } },
        2: { requirementDescription: "2.5e6 planetary systems",
             effectDescription: "Gas cloud upgrades auto-buy",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(2.5e6) } },
        3: { requirementDescription: "2e7 planetary systems",
             effectDescription: "Planetary upgrades and Orrery survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(2e7) } },
    },
    buyables: {
        11: { title: "Resonance Forge",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { let d = tmp[this.layer].buyables[this.id]
                  return "Cost: " + format(d.cost) + " planetary systems<br>Planetary gain ×" + format(d.effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Kuiper Cache",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { let d = tmp[this.layer].buyables[this.id]
                  return "Cost: " + format(d.cost) + " planetary systems<br>Stardust gain ×" + format(d.effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },
    update(diff) {
        if (hasMilestone("pl", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.pl.points = player.pl.points.add(tmp.pl.resetGain.times(0.02).times(diff))
        }
    },
})
