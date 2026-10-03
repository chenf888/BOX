addLayer("mw", {
    name: "The Milky Way",
    symbol: "MW",
    position: 0,
    row: 23,
    color: "#ffffff",
    resource: "galactic cores",
    resetDescription: "Assemble the galaxy for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("2.8422e34"),
    type: "normal",
    exponent: 0.25,
    branches: [],
    layerShown() { return player.mw.unlocked || hasUpgrade("or22", 15) || hasUpgrade("pe22", 15) || hasUpgrade("sg22", 15) || hasUpgrade("oa22", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0), winding: new Decimal(1) } },
    hotkeys: [
        { key: "x", description: "X: Assemble the galaxy for galactic cores",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("mw", 13)) m = m.times(upgradeEffect("mw", 13))
        if (hasMilestone("mw", 0)) m = m.times(2.5)
        if (hasMilestone("mw", 1)) m = m.times(3)
        if (player.mw.winding.gt(1)) m = m.times(player.mw.winding)
        if (getBuyableAmount("mw", 11).gte(1)) m = m.times(buyableEffect("mw", 11))
        if (hasUpgrade("or22", 23)) m = m.times(upgradeEffect("or22", 23))
        if (hasUpgrade("or22", 31)) m = m.times(upgradeEffect("or22", 31))
        if (hasUpgrade("pe22", 23)) m = m.times(upgradeEffect("pe22", 23))
        if (hasUpgrade("pe22", 31)) m = m.times(upgradeEffect("pe22", 31))
        if (hasUpgrade("sg22", 23)) m = m.times(upgradeEffect("sg22", 23))
        if (hasUpgrade("sg22", 31)) m = m.times(upgradeEffect("sg22", 31))
        if (hasUpgrade("oa22", 23)) m = m.times(upgradeEffect("oa22", 23))
        if (hasUpgrade("oa22", 31)) m = m.times(upgradeEffect("oa22", 31))
        if (hasChallenge("oa6", 23)) m = m.times(challengeEffect("oa6", 23))
        if (hasMilestone("hr", 4)) m = m.times(1e8)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() { return new Decimal("1e12") },
    softcapPower() { return new Decimal(0.4) },
    effect() {
        return { armFeed: player.mw.points.add(1).log(10).plus(1).pow(0.5) }
    },
    effectDescription() { return "The assembled galaxy feeds every arm lane: ×" + format(this.effect().armFeed) + " to all four arms' gain" },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("mw", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust across the whole future galaxy' }],
        ["blank", "10px"],
        ["bar", "winding"],
        ["clickables", 1],
        ["display-text", function() { return 'Winding stack: ×' + format(player.mw.winding) + ' galactic core gain' }],
        ["blank", "12px"],
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            Upgrades: { content: [["blank", "8px"], "upgrades"] },
            Milestones: { content: [["blank", "8px"], "milestones"] },
            "Galactic Engine": { content: [["blank", "8px"], "buyables"] },
        },
    },
    bars: {
        winding: {
            direction: RIGHT,
            width: 340, height: 40,
            progress() { return player.mw.points.add(1).log(10).div(14).min(1).toNumber() },
            display() { return "Spiral winding charge: " + format(player.mw.points.add(1).log(10).div(14).min(1).times(100)) + "%" },
            fillStyle: { 'background-color': "#ffffff" },
            baseStyle: { 'background-color': "#2a2a3a" },
            textStyle: { 'color': "#101018" },
        },
    },
    clickables: {
        11: { title: "Wind the Arms",
              display() { return "Wind the spiral arms.<br>Stack: ×" + format(player.mw.winding) + " (max ×64)" },
              canClick() { return player.mw.points.add(1).log(10).gte(14) && player.mw.winding.lt(64) },
              onClick() {
                  player.mw.winding = player.mw.winding.times(1.5).min(64)
                  player.mw.points = player.mw.points.div(10)
                  makeParticles({ text: "wound!", color: "#ffffff", time: 2, layer: "mw" }, 2)
              },
              style() { return { 'background-color': '#ffffff', 'color': '#101018', 'font-weight': 'bold' } } },
    },
    milestones: {
        0: { requirementDescription: "1e36 galactic cores (best)",
             effectDescription: "Galactic core gain ×2.5",
             done() { return player[this.layer].best.gte("1e36") } },
        1: { requirementDescription: "1e37 galactic cores",
             effectDescription: "Gain 2% of your galactic core reset gain every second",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte("1e37") } },
        2: { requirementDescription: "1e38 galactic cores",
             effectDescription: "The Milky Way auto-prestiges",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte("1e38") } },
        3: { requirementDescription: "1e39 galactic cores",
             effectDescription: "Milky Way upgrades survive resets; rows 0-10 are never reset again",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte("1e39") } },
        4: { requirementDescription: "1e40 galactic cores",
             effectDescription: "The Grand Assembly: galactic core gain ×1e6, all arm lanes ×1e4",
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].best.gte("1e40") } },
    },
    upgrades: {
        11: { title: "Grand Assembly",
              description: "Galactic core gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Bar and Arms United",
              description: "Galactic core gain is boosted by your unspent galactic cores.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("mw", 11) },
              effect() { return player[this.layer].points.add(1).pow(0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "The Arms Pour In",
              description: "All four arm lanes' outputs feed the assembly.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("mw", 12) },
              effect() {
                  let ret = player.or22.points.add(player.pe22.points).add(player.sg22.points).add(player.oa22.points).add(1).pow(0.2)
                  if (hasUpgrade("mw", 21)) ret = ret.pow(1.1)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Sun's Odyssey",
              description: "×5 galactic core gain at 1e36 best; ×5 more at 1e38.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("mw", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte("1e36")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e38")) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Andromeda Approaches",
              description: "Unlock The Local Group.",
              cost: new Decimal(400),
              unlocked() { return hasUpgrade("mw", 14) },
              onPurchase() { player.lg.unlocked = true } },
        21: { title: "Density Wave Lock",
              description: "The Arms Pour In (u13) is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("mw", 15) } },
        22: { title: "Home Galaxy",
              description: "Stardust gain ×50.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("mw", 11) } },
        23: { title: "Corotation Radius",
              description: "Local Group gain is boosted by your galactic cores.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("mw", 15) },
              effect() { return player[this.layer].points.add(1).pow(0.35).times(2) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Galactic Habitable Zone",
              description: "Galactic core gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("mw", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Open the Galactic Engine",
              description: "Unlock the Galactic Engine buyables.",
              cost: new Decimal(8e4),
              unlocked() { return hasUpgrade("mw", 23) },
              effect() { return buyableEffect("mw", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x cores" } },
        31: { title: "Milky Way Muse",
              description: "All four arm lanes gain is boosted by your milestones here.",
              cost: new Decimal(5e5),
              unlocked() { return hasUpgrade("mw", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    buyables: {
        11: { title: "Spiral Compressor",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { let d = tmp[this.layer].buyables[this.id]
                  return "Cost: " + format(d.cost) + " galactic cores<br>Galactic core gain ×" + format(d.effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Deep Field Tap",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { let d = tmp[this.layer].buyables[this.id]
                  return "Cost: " + format(d.cost) + " galactic cores<br>Stardust gain ×" + format(d.effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },
    update(diff) {
        if (hasMilestone("mw", 1) && !inChallenge("oa6", 21)) {
            player.mw.points = player.mw.points.add(tmp.mw.resetGain.times(0.02).times(diff))
        }
    },
    resetsNothing() { if (hasMilestone("hr", 1)) return true },
    passiveGeneration() { if (hasMilestone("mw", 1)) return 1 },
    autoPrestige() { if (hasMilestone("mw", 2)) return true },
    autoUpgrade() { if (hasMilestone("hr", 1)) return true },
})

addLayer("lg", {
    name: "The Local Group",
    symbol: "LG",
    position: 0,
    row: 24,
    color: "#e8f4ff",
    resource: "group bindings",
    resetDescription: "Reach out for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("7.1054e35"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["mw", 2, 1]],
    layerShown() { return player.lg.unlocked || hasUpgrade("mw", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "y", description: "y: reach for the local group",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("lg", 13)) m = m.times(upgradeEffect("lg", 13))
        if (hasMilestone("lg", 0)) m = m.div(2.5)
        if (getBuyableAmount("lg", 11).gte(1)) m = m.div(buyableEffect("lg", 11))
        if (hasUpgrade("mw", 23)) m = m.div(upgradeEffect("mw", 23))
        if (hasUpgrade("mw", 31)) m = m.div(upgradeEffect("mw", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone(this.layer, 1)) return 1 },
    autoUpgrade() { if (hasMilestone("hr", 1)) return true },
    resetsNothing() { if (hasMilestone("hr", 1)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("lg", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["blank", "12px"],
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            Upgrades: { content: [["blank", "8px"], "upgrades"] },
            Milestones: { content: [["blank", "8px"], "milestones"] },
            Buyables: { content: [["blank", "8px"], "buyables"] },
        },
    },
    upgrades: {
        11: { title: "Andromeda Approach",
              description: "group bindings gain ×2.",
              cost: new Decimal(1) },
        12: { title: "M33 Triangle",
              description: "group bindings gain is boosted by your unspent group bindings.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("lg", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e150"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Dwarf Retinues",
              description: "The structure below feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("lg", 12) },
              effect() { let ret = player["mw"].points.max(1).root(2).times(3)
                  if (hasUpgrade("lg", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 group bindings; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("lg", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Further Out",
              description: "Unlock The Virgo Cluster.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("lg", 14) },
              onPurchase() { player["vc"].unlocked = true } },
        21: { title: "Andromeda Approach Resonance",
              description: "Dwarf Retinues is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("lg", 15) } },
        22: { title: "Bound Footprint Overflow",
              description: "Stardust gain ×100.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("lg", 11) } },
        23: { title: "Chain Downward",
              description: "The structure below is boosted by your group bindings.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("lg", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "group bindings gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("lg", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("lg", 23) },
              effect() { return buyableEffect("lg", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Deep Field Signal",
              description: "Stardust gain is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("lg", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "group bindings gain ×2.5",
             done() { return player[this.layer].best.gte(tmp.lg.requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp.lg.requires.times(4e3)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp.lg.requires.times(2.5e4)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp.lg.requires.times(2e5)) } },
    },
    buyables: {
        11: { title: "M33 Triangle Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " group bindings<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Bound Footprint Tap",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " group bindings<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },
    update(diff) {
        if (hasMilestone("lg", 1) && !inChallenge("oa6", 23)) {
            player.lg.points = player.lg.points.add(tmp.lg.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("vc", {
    name: "The Virgo Cluster",
    symbol: "VC",
    position: 0,
    row: 25,
    color: "#d4e9ff",
    resource: "cluster mass",
    resetDescription: "Reach out for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.7764e37"),
    type: "normal",
    exponent: 0.25,
    branches: [["lg", 2, 1]],
    layerShown() { return player.vc.unlocked || hasUpgrade("lg", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "z", description: "z: reach for the virgo cluster",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("vc", 13)) m = m.times(upgradeEffect("vc", 13))
        if (hasMilestone("vc", 0)) m = m.times(2.5)
        if (getBuyableAmount("vc", 11).gte(1)) m = m.times(buyableEffect("vc", 11))
        if (hasUpgrade("lg", 23)) m = m.times(upgradeEffect("lg", 23))
        if (hasUpgrade("lg", 31)) m = m.times(upgradeEffect("lg", 31))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e12")
        if (hasUpgrade("vc", 24)) c = c.times(1e3)
        if (hasMilestone("vc", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone(this.layer, 1)) return 1 },
    autoUpgrade() { if (hasMilestone("hr", 1)) return true },
    resetsNothing() { if (hasMilestone("hr", 1)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("vc", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["blank", "12px"],
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            Upgrades: { content: [["blank", "8px"], "upgrades"] },
            Milestones: { content: [["blank", "8px"], "milestones"] },
            Buyables: { content: [["blank", "8px"], "buyables"] },
        },
    },
    upgrades: {
        11: { title: "M87 Dominion",
              description: "cluster mass gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Infall Streams",
              description: "cluster mass gain is boosted by your unspent cluster mass.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("vc", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e150"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Cluster Weather",
              description: "The structure below feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("vc", 12) },
              effect() { let ret = player["lg"].points.max(1).root(2).times(3)
                  if (hasUpgrade("vc", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 cluster mass; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("vc", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Further Out",
              description: "Unlock Laniakea.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("vc", 14) },
              onPurchase() { player["ln"].unlocked = true } },
        21: { title: "M87 Dominion Resonance",
              description: "Cluster Weather is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("vc", 15) } },
        22: { title: "Virgo Centrifuge Overflow",
              description: "Stardust gain ×100.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("vc", 11) } },
        23: { title: "Chain Downward",
              description: "The structure below is boosted by your cluster mass.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("vc", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "cluster mass gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("vc", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("vc", 23) },
              effect() { return buyableEffect("vc", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Deep Field Signal",
              description: "Stardust gain is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("vc", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "cluster mass gain ×2.5",
             done() { return player[this.layer].best.gte(tmp.vc.requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp.vc.requires.times(4e3)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp.vc.requires.times(2.5e4)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp.vc.requires.times(2e5)) } },
    },
    buyables: {
        11: { title: "Infall Streams Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " cluster mass<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Virgo Centrifuge Tap",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " cluster mass<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },
    update(diff) {
        if (hasMilestone("vc", 1) && !inChallenge("oa6", 23)) {
            player.vc.points = player.vc.points.add(tmp.vc.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("ln", {
    name: "Laniakea",
    symbol: "LN",
    position: 0,
    row: 26,
    color: "#bcdcff",
    resource: "supercluster flow",
    resetDescription: "Reach out for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("4.4409e38"),
    type: "static",
    exponent: 1,
    base: 3,
    roundUpCost: true,
    branches: [["vc", 2, 1]],
    layerShown() { return player.ln.unlocked || hasUpgrade("vc", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "X", description: "X: reach for laniakea",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("ln", 13)) m = m.times(upgradeEffect("ln", 13))
        if (hasMilestone("ln", 0)) m = m.div(2.5)
        if (getBuyableAmount("ln", 11).gte(1)) m = m.div(buyableEffect("ln", 11))
        if (hasUpgrade("vc", 23)) m = m.div(upgradeEffect("vc", 23))
        if (hasUpgrade("vc", 31)) m = m.div(upgradeEffect("vc", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone(this.layer, 1)) return 1 },
    autoUpgrade() { if (hasMilestone("hr", 1)) return true },
    resetsNothing() { if (hasMilestone("hr", 1)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("ln", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["blank", "12px"],
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            Upgrades: { content: [["blank", "8px"], "upgrades"] },
            Milestones: { content: [["blank", "8px"], "milestones"] },
            Buyables: { content: [["blank", "8px"], "buyables"] },
        },
    },
    upgrades: {
        11: { title: "Immeasurable Heaven",
              description: "supercluster flow gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Great Attractor Pull",
              description: "supercluster flow gain is boosted by your unspent supercluster flow.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("ln", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e150"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Flow Field",
              description: "The structure below feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("ln", 12) },
              effect() { let ret = player["vc"].points.max(1).root(2).times(3)
                  if (hasUpgrade("ln", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 supercluster flow; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("ln", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Further Out",
              description: "Unlock The Cosmic Web.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("ln", 14) },
              onPurchase() { player["cw"].unlocked = true } },
        21: { title: "Immeasurable Heaven Resonance",
              description: "Flow Field is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("ln", 15) } },
        22: { title: "Watershed Boundaries Overflow",
              description: "Stardust gain ×100.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("ln", 11) } },
        23: { title: "Chain Downward",
              description: "The structure below is boosted by your supercluster flow.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("ln", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "supercluster flow gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("ln", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("ln", 23) },
              effect() { return buyableEffect("ln", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Deep Field Signal",
              description: "Stardust gain is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("ln", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "supercluster flow gain ×2.5",
             done() { return player[this.layer].best.gte(tmp.ln.requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp.ln.requires.times(4e3)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp.ln.requires.times(2.5e4)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp.ln.requires.times(2e5)) } },
    },
    buyables: {
        11: { title: "Great Attractor Pull Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " supercluster flow<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Watershed Boundaries Tap",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " supercluster flow<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },
    update(diff) {
        if (hasMilestone("ln", 1) && !inChallenge("oa6", 23)) {
            player.ln.points = player.ln.points.add(tmp.ln.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("cw", {
    name: "The Cosmic Web",
    symbol: "CW",
    position: 0,
    row: 27,
    color: "#a3d0ff",
    resource: "web strands",
    resetDescription: "Reach out for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.1102e40"),
    type: "normal",
    exponent: 0.25,
    branches: [["ln", 2, 1]],
    layerShown() { return player.cw.unlocked || hasUpgrade("ln", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "Y", description: "Y: reach for the cosmic web",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("cw", 13)) m = m.times(upgradeEffect("cw", 13))
        if (hasMilestone("cw", 0)) m = m.times(2.5)
        if (getBuyableAmount("cw", 11).gte(1)) m = m.times(buyableEffect("cw", 11))
        if (hasUpgrade("ln", 23)) m = m.times(upgradeEffect("ln", 23))
        if (hasUpgrade("ln", 31)) m = m.times(upgradeEffect("ln", 31))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e12")
        if (hasUpgrade("cw", 24)) c = c.times(1e3)
        if (hasMilestone("cw", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone(this.layer, 1)) return 1 },
    autoUpgrade() { if (hasMilestone("hr", 1)) return true },
    resetsNothing() { if (hasMilestone("hr", 1)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("cw", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["blank", "12px"],
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            Upgrades: { content: [["blank", "8px"], "upgrades"] },
            Milestones: { content: [["blank", "8px"], "milestones"] },
            Buyables: { content: [["blank", "8px"], "buyables"] },
        },
    },
    upgrades: {
        11: { title: "Filament Threading",
              description: "web strands gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Void Carving",
              description: "web strands gain is boosted by your unspent web strands.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("cw", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e150"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Node Congregations",
              description: "The structure below feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("cw", 12) },
              effect() { let ret = player["ln"].points.max(1).root(2).times(3)
                  if (hasUpgrade("cw", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 web strands; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("cw", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Further Out",
              description: "Unlock The Great Attractor.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("cw", 14) },
              onPurchase() { player["ga"].unlocked = true } },
        21: { title: "Filament Threading Resonance",
              description: "Node Congregations is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("cw", 15) } },
        22: { title: "Web Topology Overflow",
              description: "Stardust gain ×100.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("cw", 11) } },
        23: { title: "Chain Downward",
              description: "The structure below is boosted by your web strands.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("cw", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "web strands gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("cw", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("cw", 23) },
              effect() { return buyableEffect("cw", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Deep Field Signal",
              description: "Stardust gain is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("cw", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "web strands gain ×2.5",
             done() { return player[this.layer].best.gte(tmp.cw.requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp.cw.requires.times(4e3)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp.cw.requires.times(2.5e4)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp.cw.requires.times(2e5)) } },
    },
    buyables: {
        11: { title: "Void Carving Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " web strands<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Web Topology Tap",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " web strands<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },
    update(diff) {
        if (hasMilestone("cw", 1) && !inChallenge("oa6", 23)) {
            player.cw.points = player.cw.points.add(tmp.cw.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("ga", {
    name: "The Great Attractor",
    symbol: "GA",
    position: 0,
    row: 28,
    color: "#8ac4ff",
    resource: "attractor pull",
    resetDescription: "Reach out for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("2.7756e41"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["cw", 2, 1]],
    layerShown() { return player.ga.unlocked || hasUpgrade("cw", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "Z", description: "Z: reach for the great attractor",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("ga", 13)) m = m.times(upgradeEffect("ga", 13))
        if (hasMilestone("ga", 0)) m = m.div(2.5)
        if (getBuyableAmount("ga", 11).gte(1)) m = m.div(buyableEffect("ga", 11))
        if (hasUpgrade("cw", 23)) m = m.div(upgradeEffect("cw", 23))
        if (hasUpgrade("cw", 31)) m = m.div(upgradeEffect("cw", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone(this.layer, 1)) return 1 },
    autoUpgrade() { if (hasMilestone("hr", 1)) return true },
    resetsNothing() { if (hasMilestone("hr", 1)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("ga", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["blank", "12px"],
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            Upgrades: { content: [["blank", "8px"], "upgrades"] },
            Milestones: { content: [["blank", "8px"], "milestones"] },
            Buyables: { content: [["blank", "8px"], "buyables"] },
        },
    },
    upgrades: {
        11: { title: "Zone of Avoidance",
              description: "attractor pull gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Norma Cluster",
              description: "attractor pull gain is boosted by your unspent attractor pull.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("ga", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e150"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Peculiar Velocities",
              description: "The structure below feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("ga", 12) },
              effect() { let ret = player["cw"].points.max(1).root(2).times(3)
                  if (hasUpgrade("ga", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 attractor pull; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("ga", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Further Out",
              description: "Unlock Dark Energy.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("ga", 14) },
              onPurchase() { player["de"].unlocked = true } },
        21: { title: "Zone of Avoidance Resonance",
              description: "Peculiar Velocities is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("ga", 15) } },
        22: { title: "Hidden Mass Overflow",
              description: "Stardust gain ×100.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("ga", 11) } },
        23: { title: "Chain Downward",
              description: "The structure below is boosted by your attractor pull.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("ga", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "attractor pull gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("ga", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("ga", 23) },
              effect() { return buyableEffect("ga", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Deep Field Signal",
              description: "Stardust gain is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("ga", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "attractor pull gain ×2.5",
             done() { return player[this.layer].best.gte(tmp.ga.requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp.ga.requires.times(4e3)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp.ga.requires.times(2.5e4)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp.ga.requires.times(2e5)) } },
    },
    buyables: {
        11: { title: "Norma Cluster Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " attractor pull<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Hidden Mass Tap",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " attractor pull<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },
    update(diff) {
        if (hasMilestone("ga", 1) && !inChallenge("oa6", 23)) {
            player.ga.points = player.ga.points.add(tmp.ga.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("de", {
    name: "Dark Energy",
    symbol: "DE",
    position: 0,
    row: 29,
    color: "#7ab8ff",
    resource: "vacuum energy",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal(1),
    type: "custom",
    branches: [["ga", 2, 1]],
    layerShown() { return player.de.unlocked || hasUpgrade("ga", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "D", description: "Shift+D: Let space push for vacuum energy",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    getResetGain() {
        let pts = player.points.max(10).log(10)
        let raw = pts.pow(0.6)
        raw = raw.times(tmp.de.gainMult)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) raw = raw.root(4)
        let ret = raw.sub(player.de.points).max(0).floor()
        return ret
    },
    getNextAt() {
        let target = player.de.points.add(2)
        return Decimal.pow(10, target.max(2).pow(1 / 0.6))
    },
    canReset() { return player.points.gte(tmp.de.getNextAt) },
    prestigeButtonText() {
        if (!canReset("de")) return "Space is not yet stretched thin enough.<br>Next at " + format(tmp.de.getNextAt) + " stardust"
        return "Let space push: gain <b>" + format(getResetGain("de")) + "</b> vacuum energy"
    },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("de", 11)) m = m.times(2)
        if (hasUpgrade("de", 13)) m = m.times(upgradeEffect("de", 13))
        if (hasUpgrade("de", 14)) m = m.times(upgradeEffect("de", 14))
        if (hasMilestone("de", 0)) m = m.times(2.5)
        if (hasMilestone("de", 1)) m = m.times(3)
        if (getBuyableAmount("de", 11).gte(1)) m = m.times(buyableEffect("de", 11))
        if (hasUpgrade("cw", 23)) m = m.times(upgradeEffect("cw", 23))
        if (hasUpgrade("dm", 22)) m = m.times(10)
        if (hasChallenge("oa6", 24)) m = m.times(challengeEffect("oa6", 24))
        if (hasMilestone("hr", 5)) m = m.times(1e3)
        return m
    },
    update(diff) {
        if (hasMilestone("de", 1) && !inChallenge("oa6", 21)) {
            player.de.points = player.de.points.add(layers.de.getResetGain().times(0.02).times(diff))
        }
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'Vacuum energy pushes the universe apart. Growth is logarithmic — patience of cosmic proportions.' }],
        ["blank", "12px"],
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            Upgrades: { content: [["blank", "8px"], "upgrades"] },
            Milestones: { content: [["blank", "8px"], "milestones"] },
            "Vacuum Engine": { content: [["blank", "8px"], "buyables"] },
        },
    },
    upgrades: {
        11: { title: "Cosmological Constant",
              description: "Vacuum energy gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Quintessence",
              description: "Vacuum energy gain is boosted by your unspent vacuum energy.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("de", 11) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(2) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Accelerating Scale",
              description: "Your stardust stretches the vacuum.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("de", 12) },
              effect() {
                  let ret = player.points.max(10).log(10).plus(1).pow(0.8)
                  if (hasUpgrade("de", 21)) ret = ret.pow(1.1)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "w = −1",
              description: "×5 vacuum energy gain at 20 vacuum energy; ×5 more at 60.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("de", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(20)) ret = ret.times(5)
                  if (player[this.layer].best.gte(60)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "The Horizon Recedes",
              description: "Unlock The Cosmic Horizon.",
              cost: new Decimal(400),
              unlocked() { return hasUpgrade("de", 14) },
              onPurchase() { player.hr.unlocked = true } },
        21: { title: "Phantom Dark Energy",
              description: "Accelerating Scale (u13) is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("de", 15) } },
        22: { title: "Repulsive Gravity",
              description: "Stardust gain ×1e4.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("de", 11) } },
        23: { title: "Event Horizon Economics",
              description: "Cosmic Horizon cost curve softens: base 2.2 → 2.0.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("de", 15) },
              effect() { return new Decimal(2) },
              effectDisplay() { return "horizon base " + formatWhole(upgradeEffect(this.layer, this.id)) } },
        24: { title: "Cosmological Tension",
              description: "Vacuum energy gain ×10.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("de", 21) },
              effect() { return new Decimal(10) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        25: { title: "Open the Vacuum Engine",
              description: "Unlock the Vacuum Engine buyables.",
              cost: new Decimal(8e4),
              unlocked() { return hasUpgrade("de", 23) },
              effect() { return buyableEffect("de", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x energy" } },
    },
    milestones: {
        0: { requirementDescription: "10 vacuum energy",
             effectDescription: "Vacuum energy gain ×2.5",
             done() { return player[this.layer].best.gte(10) } },
        1: { requirementDescription: "25 vacuum energy",
             effectDescription: "Gain 2% of your vacuum energy reset gain every second",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(25) } },
        2: { requirementDescription: "50 vacuum energy",
             effectDescription: "Dark Energy auto-prestiges",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(50) } },
        3: { requirementDescription: "100 vacuum energy",
             effectDescription: "Dark Energy upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(100) } },
        4: { requirementDescription: "250 vacuum energy",
             effectDescription: "Vacuum energy gain ×10",
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].best.gte(250) } },
        5: { requirementDescription: "500 vacuum energy",
             effectDescription: "The horizon cost curve softens further: base 2.0 → 1.8",
             unlocked() { return hasMilestone(this.layer, 4) },
             done() { return player[this.layer].best.gte(500) } },
    },
    buyables: {
        11: { title: "Zero-Point Tap",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { let d = tmp[this.layer].buyables[this.id]
                  return "Cost: " + format(d.cost) + " vacuum energy<br>Vacuum energy gain ×" + format(d.effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },
    resetsNothing() { if (hasMilestone("hr", 1)) return true },
    passiveGeneration() { if (hasMilestone("de", 1)) return 1 },
    autoPrestige() { if (hasMilestone("de", 2)) return true },
    autoUpgrade() { if (hasMilestone("hr", 1)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("de", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
})

addLayer("hr", {
    name: "The Cosmic Horizon",
    symbol: "HR",
    position: 0,
    row: 30,
    color: "#6aacff",
    resource: "light-years gathered",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.7347e44"),
    type: "custom",
    branches: [["de", 3, 1]],
    layerShown() { return player.hr.unlocked || hasUpgrade("de", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "E", description: "Shift+E: Gather light for light-years",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    horizonBase() {
        if (hasMilestone("de", 5)) return new Decimal(1.8)
        if (hasUpgrade("de", 23)) return new Decimal(2)
        return new Decimal(2.2)
    },
    getResetGain() {
        if (!tmp.hr.canReset) return new Decimal(0)
        return new Decimal(1)
    },
    getNextAt() {
        return tmp.hr.requires.times(tmp.hr.horizonBase.pow(player.hr.points))
    },
    canReset() { return player.points.gte(tmp.hr.getNextAt) },
    prestigeButtonText() {
        if (!canReset("hr")) return "The light has not arrived yet.<br>Next light-year at " + format(tmp.hr.getNextAt) + " stardust"
        return "Gather the light: +1 light-year<br>(Nothing outruns the light cone.)"
    },
    gainMult() { return new Decimal(1) },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.hr.points) + ' light-years of gathered light. The observable universe ends here — for now.' }],
        ["display-text", function() { if (player.hr.points.gte(20)) return '<b style="color:#6aacff">The final sky is close. ' + formatWhole(new Decimal(25).sub(player.hr.points)) + ' light-years remain.</b>' }],
        ["blank", "12px"],
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            Milestones: { content: [["blank", "8px"], "milestones"] },
            Upgrades: { content: [["blank", "8px"], "upgrades"] },
            "Horizon Instruments": { unlocked() { return hasMilestone("hr", 2) }, content: [["blank", "8px"], "buyables"] },
        },
    },
    milestones: {
        0: { requirementDescription: "1 light-year gathered",
             effectDescription: "Spine package deal: all spine layers auto-prestige and keep on reset",
             done() { return player[this.layer].total.gte(1) } },
        1: { requirementDescription: "3 light-years",
             effectDescription: "All spine layers auto-upgrade; passive generation for The Milky Way",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].total.gte(3) } },
        2: { requirementDescription: "5 light-years",
             effectDescription: "Unlock Horizon Instruments",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].total.gte(5) } },
        3: { requirementDescription: "8 light-years",
             effectDescription: "Stardust gain ×1e10",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].total.gte(8) } },
        4: { requirementDescription: "12 light-years",
             effectDescription: "All four arm lanes gain ×1e6",
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player[this.layer].total.gte(12) } },
        5: { requirementDescription: "16 light-years",
             effectDescription: "Vacuum energy gain ×1e3",
             unlocked() { return hasMilestone(this.layer, 4) },
             done() { return player[this.layer].total.gte(16) } },
        6: { requirementDescription: "20 light-years",
             effectDescription: "Galactic core gain ×1e8",
             unlocked() { return hasMilestone(this.layer, 5) },
             done() { return player[this.layer].total.gte(20) } },
        7: { requirementDescription: "25 light-years — the edge of everything",
             effectDescription: "You have beaten The Galaxy Nebula. (You may keep going.)",
             unlocked() { return hasMilestone(this.layer, 6) },
             done() { return player[this.layer].total.gte(25) } },
    },
    upgrades: {
        11: { title: "Particle Horizon",
              description: "Stardust gain ×1e6.",
              cost: new Decimal(2) },
        12: { title: "CMB Last Scattering",
              description: "All arm lane gain ×1e3.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("hr", 11) } },
        13: { title: "The Final Sky",
              description: "Vacuum energy gain ×1e2.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("hr", 12) } },
        14: { title: "Edge of Light",
              description: "Stardust gain ×1e10.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("hr", 13) } },
        15: { title: "Look Back Time",
              description: "Galactic core gain ×1e4.",
              cost: new Decimal(32),
              unlocked() { return hasUpgrade("hr", 14) } },
    },
    buyables: {
        11: { title: "Deep Field Integrator",
              cost(x) { return Decimal.pow(2, x).times(3) },
              effect(x) { return Decimal.pow(1.3, x) },
              display() { let d = tmp[this.layer].buyables[this.id]
                  return "Cost: " + format(d.cost) + " light-years<br>Stardust gain ×" + format(d.effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },
    resetsNothing() { if (hasMilestone("hr", 0)) return true },
    autoPrestige() { if (hasMilestone("hr", 0)) return true },
    autoUpgrade() { if (hasMilestone("hr", 1)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let kept = ["unlocked", "auto", "milestones", "upgrades", "buyables"]
        layerDataReset(this.layer, kept)
    },
})
