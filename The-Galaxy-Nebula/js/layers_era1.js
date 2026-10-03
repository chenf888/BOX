addLayer("or1", {
    name: "Open Clusters",
    symbol: "OC",
    position: 0,
    row: 1,
    color: "#ffd162",
    resource: "open clusters",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("5e3"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["fu", 1, 2]],
    layerShown() { return player.or1.unlocked || hasUpgrade("fu", 15) || hasMilestone("fu", 1) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "b", description: "b: reset for open clusters",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or1", 13)) m = m.times(upgradeEffect("or1", 13))
        if (hasMilestone("or1", 0)) m = m.times(2.5)
        if (getBuyableAmount("or1", 11).gte(1)) m = m.times(buyableEffect("or1", 11))
        if (hasUpgrade("or2", 23)) m = m.times(upgradeEffect("or2", 23))
        if (hasUpgrade("oa2", 31)) m = m.times(upgradeEffect("oa2", 31))
        if (hasChallenge("oa6", 13)) m = m.root(4)
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("or1", 24)) c = c.times(1e3)
        if (hasMilestone("or1", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("sg2", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg2", 3)) return true },
    resetsNothing() { if (hasMilestone("sg2", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("or1", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.or1.points.gte(1)) return 'Open Clusters: best ' + format(player.or1.best) }],
        ["display-text", function() { if (player.or1.points.gte(tmp.or1.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.or1.softcap) + ' open clusters' }],
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
        11: { title: "Loose Bundles",
              description: "Open Clusters gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Common proper motion",
              description: "Open Clusters gain is boosted by your unspent open clusters.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or1", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e10"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Nursery Halos",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("or1", 12) },
              effect() { let ret = player["fu"].points.add(1).pow(0.4)
                  if (hasUpgrade("or1", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 open clusters; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("or1", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Orion Arm layer: Main Sequence.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("or1", 14) },
              onPurchase() { player["or2"].unlocked = true } },
        21: { title: "Loose Bundles Resonance",
              description: "Nursery Halos is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("or1", 15) } },
        22: { title: "Blue Flecks Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("or1", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your open clusters.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("or1", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Open Clusters gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("or1", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("or1", 23) },
              effect() { return buyableEffect("or1", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("or1", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Open Clusters gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["or1"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["or1"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["or1"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["or1"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Common proper motion Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " open clusters<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Blue Flecks Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " open clusters<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        if (hasMilestone("or1", 1) && !inChallenge("oa6", 23)) {
            player.or1.points = player.or1.points.add(tmp.or1.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("or2", {
    name: "Main Sequence",
    symbol: "MS",
    position: 0,
    row: 2,
    color: "#ffd162",
    resource: "main sequence",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.25e5"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["or1", 1, 2]],
    layerShown() { return player.or2.unlocked || hasUpgrade("or1", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "c", description: "c: reset for main sequence",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or2", 13)) m = m.times(upgradeEffect("or2", 13))
        if (hasMilestone("or2", 0)) m = m.times(2.5)
        if (getBuyableAmount("or2", 11).gte(1)) m = m.times(buyableEffect("or2", 11))
        if (hasUpgrade("or3", 23)) m = m.times(upgradeEffect("or3", 23))
        if (hasUpgrade("oa3", 31)) m = m.times(upgradeEffect("oa3", 31))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("or2", 24)) c = c.times(1e3)
        if (hasMilestone("or2", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("sg2", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg2", 3)) return true },
    resetsNothing() { if (hasMilestone("sg2", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("or2", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.or2.points.gte(1)) return 'Main Sequence: best ' + format(player.or2.best) }],
        ["display-text", function() { if (player.or2.points.gte(tmp.or2.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.or2.softcap) + ' main sequence' }],
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
        11: { title: "Hydrogen Breadth",
              description: "Main Sequence gain ×2.",
              cost: new Decimal(1) },
        12: { title: "The Solar Standard",
              description: "Main Sequence gain is boosted by your unspent main sequence.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or2", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e10"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Steady Burn",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("or2", 12) },
              effect() { let ret = player["or1"].points.add(1).pow(0.4)
                  if (hasUpgrade("or2", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 main sequence; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("or2", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Orion Arm layer: Red Giants.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("or2", 14) },
              onPurchase() { player["or3"].unlocked = true } },
        21: { title: "Hydrogen Breadth Resonance",
              description: "Steady Burn is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("or2", 15) } },
        22: { title: "ZAMS Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("or2", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your main sequence.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("or2", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Main Sequence gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("or2", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("or2", 23) },
              effect() { return buyableEffect("or2", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("or2", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Main Sequence gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["or2"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["or2"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["or2"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["or2"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "The Solar Standard Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " main sequence<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "ZAMS Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " main sequence<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        if (hasMilestone("or2", 1) && !inChallenge("oa6", 23)) {
            player.or2.points = player.or2.points.add(tmp.or2.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("or3", {
    name: "Red Giants",
    symbol: "RG",
    position: 0,
    row: 3,
    color: "#ffd162",
    resource: "red giants",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("3.125e6"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["or2", 1, 2]],
    layerShown() { return player.or3.unlocked || hasUpgrade("or2", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "d", description: "d: reset for red giants",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or3", 13)) m = m.times(upgradeEffect("or3", 13))
        if (hasMilestone("or3", 0)) m = m.times(2.5)
        if (getBuyableAmount("or3", 11).gte(1)) m = m.times(buyableEffect("or3", 11))
        if (hasUpgrade("or4", 23)) m = m.times(upgradeEffect("or4", 23))
        if (hasUpgrade("oa4", 31)) m = m.times(upgradeEffect("oa4", 31))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("or3", 24)) c = c.times(1e3)
        if (hasMilestone("or3", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("oa4", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("oa4", 3)) return true },
    resetsNothing() { if (hasMilestone("oa4", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("or3", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.or3.points.gte(1)) return 'Red Giants: best ' + format(player.or3.best) }],
        ["display-text", function() { if (player.or3.points.gte(tmp.or3.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.or3.softcap) + ' red giants' }],
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
        11: { title: "Shell Burning",
              description: "Red Giants gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Helium Flash",
              description: "Red Giants gain is boosted by your unspent red giants.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or3", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e10"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "First Dredge-Up",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("or3", 12) },
              effect() { let ret = player["or2"].points.add(1).pow(0.4)
                  if (hasUpgrade("or3", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 red giants; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("or3", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Orion Arm layer: Supergiants.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("or3", 14) },
              onPurchase() { player["or4"].unlocked = true } },
        21: { title: "Shell Burning Resonance",
              description: "First Dredge-Up is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("or3", 15) } },
        22: { title: "Cool Envelopes Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("or3", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your red giants.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("or3", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Red Giants gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("or3", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("or3", 23) },
              effect() { return buyableEffect("or3", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("or3", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Red Giants gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["or3"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["or3"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["or3"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["or3"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Helium Flash Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " red giants<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Cool Envelopes Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " red giants<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        if (hasMilestone("or3", 1) && !inChallenge("oa6", 23)) {
            player.or3.points = player.or3.points.add(tmp.or3.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("or4", {
    name: "Supergiants",
    symbol: "SG",
    position: 0,
    row: 4,
    color: "#ffd162",
    resource: "supergiants",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("7.8125e7"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["or3", 1, 2]],
    layerShown() { return player.or4.unlocked || hasUpgrade("or3", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "e", description: "e: reset for supergiants",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or4", 13)) m = m.times(upgradeEffect("or4", 13))
        if (hasMilestone("or4", 0)) m = m.times(2.5)
        if (getBuyableAmount("or4", 11).gte(1)) m = m.times(buyableEffect("or4", 11))
        if (hasUpgrade("or5", 23)) m = m.times(upgradeEffect("or5", 23))
        if (hasUpgrade("oa5", 31)) m = m.times(upgradeEffect("oa5", 31))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("or4", 24)) c = c.times(1e3)
        if (hasMilestone("or4", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("oa4", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("oa4", 3)) return true },
    resetsNothing() { if (hasMilestone("oa4", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("or4", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.or4.points.gte(1)) return 'Supergiants: best ' + format(player.or4.best) }],
        ["display-text", function() { if (player.or4.points.gte(tmp.or4.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.or4.softcap) + ' supergiants' }],
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
        11: { title: "Fusion Onion",
              description: "Supergiants gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Eddington Luminosity",
              description: "Supergiant gain is boosted by your unspent luminosity — but radiation pressure forbids shining brighter than the Eddington limit.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or4", 11) },
              effect() {
                  let ret = player[this.layer].points.add(1).pow(0.5)
                  let cap = new Decimal("1e6")
                  if (hasUpgrade(this.layer, 24)) cap = cap.times(1e3)
                  if (hasMilestone(this.layer, 2)) cap = cap.times(1e6)
                  ret = softcap(ret, cap, 0)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Pulsating Radii",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("or4", 12) },
              effect() { let ret = player["or3"].points.add(1).pow(0.4)
                  if (hasUpgrade("or4", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 supergiants; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("or4", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Orion Arm layer: White Dwarfs.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("or4", 14) },
              onPurchase() { player["or5"].unlocked = true } },
        21: { title: "Fusion Onion Resonance",
              description: "Pulsating Radii is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("or4", 15) } },
        22: { title: "Terminal Carbon Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("or4", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your supergiants.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("or4", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Super-Eddington Episodes",
              description: "Supergiants gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("or4", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("or4", 23) },
              effect() { return buyableEffect("or4", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("or4", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Supergiants gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["or4"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["or4"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["or4"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["or4"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Rho Doradus Wind Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " supergiants<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Terminal Carbon Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " supergiants<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        if (hasMilestone("or4", 1) && !inChallenge("oa6", 23)) {
            player.or4.points = player.or4.points.add(tmp.or4.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("or5", {
    name: "White Dwarfs",
    symbol: "WD",
    position: 0,
    row: 5,
    color: "#ffd162",
    resource: "solar masses",
    resetDescription: "Compress the corpse for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.9531e9"),
    type: "custom",
    branches: [["or4", 1, 2]],
    layerShown() { return player.or5.unlocked || hasUpgrade("or4", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "f", description: "F: Compress the corpse for white dwarf mass",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    chandrasekhar() { return new Decimal(1.44) },
    getResetGain() {
        if (!tmp[this.layer].baseAmount.gte(tmp[this.layer].requires)) return new Decimal(0)
        let raw = player.points.div(tmp[this.layer].requires).pow(0.25)
        raw = raw.times(tmp[this.layer].gainMult)
        let room = tmp.or5.chandrasekhar.sub(player.or5.points).max(0)
        let gain = raw.min(room).max(0)
        return gain
    },
    getNextAt() { return tmp[this.layer].requires },
    canReset() { return tmp[this.layer].baseAmount.gte(tmp[this.layer].requires) && player.or5.points.lt(tmp.or5.chandrasekhar) },
    prestigeButtonText() {
        if (player.or5.points.gte(tmp.or5.chandrasekhar)) return "The core is electron-degenerate.<br>It can hold no more mass."
        if (!tmp[this.layer].baseAmount.gte(tmp[this.layer].requires)) return "Reach " + format(tmp[this.layer].requires) + " stardust to collapse further"
        return "Collapse for <b>" + format(getResetGain(this.layer)) + "</b> solar masses<br>(Chandrasekhar limit: 1.44 M☉)"
    },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or5", 11)) m = m.times(2)
        if (hasUpgrade("or5", 13)) m = m.times(upgradeEffect("or5", 13))
        if (hasUpgrade("or5", 14)) m = m.times(upgradeEffect("or5", 14))
        if (hasMilestone("or5", 0)) m = m.times(2.5)
        if (hasMilestone("or5", 1)) m = m.times(3)
        if (getBuyableAmount("or5", 11).gte(1)) m = m.times(buyableEffect("or5", 11))
        if (hasUpgrade("or6", 23)) m = m.times(upgradeEffect("or6", 23))
        return m
    },
    update(diff) {
        if (player.or5.points.gt(tmp.or5.chandrasekhar)) player.or5.points = tmp.or5.chandrasekhar
        if (hasMilestone("or5", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.or5.points = player.or5.points.add(getResetGain(this.layer).times(0.02).times(diff)).min(tmp.or5.chandrasekhar)
        }
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'Mass: <b>' + format(player.or5.points) + '</b> / 1.44 M☉ — electron degeneracy pressure holds the corpse up.' }],
        ["display-text", function() { if (player.or5.points.gte(1.44)) return '<b style="color:#ff8a80">The Chandrasekhar limit is reached. Collapse beyond it is impossible — detonation is the only way forward.</b>' }],
        ["blank", "12px"],
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            Upgrades: { content: [["blank", "8px"], "upgrades"] },
            Milestones: { content: [["blank", "8px"], "milestones"] },
            "Degenerate Matter": {
                unlocked() { return hasUpgrade("or5", 25) },
                content: [["blank", "8px"], "buyables"],
                buttonStyle() { return { 'background-color': '#ffd162', 'color': '#332200' } },
            },
        },
    },
    upgrades: {
        11: { title: "Degenerate Matter",
              description: "White dwarf mass gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Electron Pressure",
              description: "Mass gain is boosted by your unspent mass.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or5", 11) },
              effect() {
                  let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal(1.44), 0.5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Cooling Curves",
              description: "Your stardust feeds the collapse.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("or5", 12) },
              effect() {
                  let ret = player.points.add(1).pow(0.2)
                  if (hasUpgrade("or5", 21)) ret = ret.pow(1.1)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Crystallized Cores",
              description: "×5 mass gain once you reach the Chandrasekhar limit.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("or5", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].points.gte(1.44)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Planetary Nebulae Form",
              description: "Unlock the Planetary Nebulae layer.",
              cost: new Decimal(400),
              unlocked() { return hasUpgrade("or5", 14) },
              onPurchase() { player.or6.unlocked = true } },
        21: { title: "Deep Degeneracy",
              description: "Cooling Curves (u13) is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("or5", 15) } },
        22: { title: "Corpse Light",
              description: "Stardust gain ×3.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("or5", 11) } },
        23: { title: "Mass Radius Relation",
              description: "Planetary nebula gain is boosted by your white dwarf mass.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("or5", 15) },
              effect() { return player[this.layer].points.add(1).pow(0.35).times(2) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Capture the Overflow",
              description: "Mass that cannot fit is converted: ×2 mass gain past the limit's half.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("or5", 21) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].points.gte(0.72)) ret = ret.times(2)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        25: { title: "Open Degeneracy Studies",
              description: "Unlock the Degenerate Matter buyables.",
              cost: new Decimal(8e4),
              unlocked() { return hasUpgrade("or5", 23) },
              effect() { return buyableEffect("or5", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x mass" } },
        31: { title: "Progenitor Records",
              description: "Neutron star gain is boosted by your milestones here.",
              cost: new Decimal(5e5),
              unlocked() { return hasUpgrade("or5", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "Reach the Chandrasekhar limit (1.44 M☉)",
             effectDescription: "White dwarf mass gain ×2.5",
             done() { return player[this.layer].points.gte(1.44) } },
        1: { requirementDescription: "Hold 1.44 M☉ with 8e5 best stardust this row",
             effectDescription: "Gain 2% of your mass reset gain every second (still capped at 1.44)",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(8e5) } },
        2: { requirementDescription: "1.44 M☉ and 2.5e6 best",
             effectDescription: "White dwarf prestige no longer resets lower rows",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(2.5e6) } },
        3: { requirementDescription: "1.44 M☉ and 2e7 best",
             effectDescription: "White dwarf upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(2e7) } },
    },
    buyables: {
        11: { title: "Lattice Densifier",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { let d = tmp[this.layer].buyables[this.id]
                  return "Cost: " + format(d.cost) + " solar masses<br>Mass gain ×" + format(d.effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },
    resetsNothing() { if (hasMilestone("or5", 2)) return true },
    passiveGeneration() { if (hasMilestone("oa4", 2)) return 1 },
    autoPrestige() { if (hasMilestone("or5", 2)) return true },
    autoUpgrade() { if (hasMilestone("or8", 2)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("or5", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
})

addLayer("pe1", {
    name: "Molecular Clouds",
    symbol: "MC",
    position: 1,
    row: 1,
    color: "#6ec6ff",
    resource: "molecular clouds",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.25e4"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["gc", 2, 2]],
    layerShown() { return player.pe1.unlocked || hasUpgrade("gc", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "B", description: "Shift+B: reset for molecular clouds",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe1", 13)) m = m.times(upgradeEffect("pe1", 13))
        if (hasMilestone("pe1", 0)) m = m.times(2.5)
        if (getBuyableAmount("pe1", 11).gte(1)) m = m.times(buyableEffect("pe1", 11))
        if (hasUpgrade("pe2", 23)) m = m.times(upgradeEffect("pe2", 23))
        if (hasUpgrade("or2", 31)) m = m.times(upgradeEffect("or2", 31))
        if (hasChallenge("oa6", 13)) m = m.root(4)
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("pe1", 24)) c = c.times(1e3)
        if (hasMilestone("pe1", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("sg2", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg2", 3)) return true },
    resetsNothing() { if (hasMilestone("sg2", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("pe1", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.pe1.points.gte(1)) return 'Molecular Clouds: best ' + format(player.pe1.best) }],
        ["display-text", function() { if (player.pe1.points.gte(tmp.pe1.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.pe1.softcap) + ' molecular clouds' }],
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
        11: { title: "H2 Reservoirs",
              description: "Molecular Clouds gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Filament Networks",
              description: "Molecular Clouds gain is boosted by your unspent molecular clouds.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe1", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e10"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Cold Chemistry",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("pe1", 12) },
              effect() { let ret = player["gc"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe1", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 molecular clouds; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("pe1", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Perseus Arm layer: Emission Nebulae.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("pe1", 14) },
              onPurchase() { player["pe2"].unlocked = true } },
        21: { title: "H2 Reservoirs Resonance",
              description: "Cold Chemistry is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("pe1", 15) } },
        22: { title: "Giant Complexes Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("pe1", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your molecular clouds.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("pe1", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Molecular Clouds gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("pe1", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("pe1", 23) },
              effect() { return buyableEffect("pe1", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("pe1", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Molecular Clouds gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["pe1"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["pe1"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["pe1"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["pe1"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Filament Networks Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " molecular clouds<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
    },
})

addLayer("pe2", {
    name: "Emission Nebulae",
    symbol: "EN",
    position: 1,
    row: 2,
    color: "#6ec6ff",
    resource: "emission nebulae",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("3.125e5"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["pe1", 2, 2]],
    layerShown() { return player.pe2.unlocked || hasUpgrade("pe1", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "C", description: "Shift+C: reset for emission nebulae",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe2", 13)) m = m.times(upgradeEffect("pe2", 13))
        if (hasMilestone("pe2", 0)) m = m.times(2.5)
        if (getBuyableAmount("pe2", 11).gte(1)) m = m.times(buyableEffect("pe2", 11))
        if (hasUpgrade("pe3", 23)) m = m.times(upgradeEffect("pe3", 23))
        if (hasUpgrade("or3", 31)) m = m.times(upgradeEffect("or3", 31))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("pe2", 24)) c = c.times(1e3)
        if (hasMilestone("pe2", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("sg2", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg2", 3)) return true },
    resetsNothing() { if (hasMilestone("sg2", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("pe2", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.pe2.points.gte(1)) return 'Emission Nebulae: best ' + format(player.pe2.best) }],
        ["display-text", function() { if (player.pe2.points.gte(tmp.pe2.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.pe2.softcap) + ' emission nebulae' }],
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
        11: { title: "Balmer Glow",
              description: "Emission Nebulae gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Trifid Pillars",
              description: "Emission Nebulae gain is boosted by your unspent emission nebulae.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe2", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e10"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Ionization Fronts",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("pe2", 12) },
              effect() { let ret = player["pe1"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe2", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 emission nebulae; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("pe2", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Perseus Arm layer: HII Regions.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("pe2", 14) },
              onPurchase() { player["pe3"].unlocked = true } },
        21: { title: "Balmer Glow Resonance",
              description: "Ionization Fronts is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("pe2", 15) } },
        22: { title: "Rosette Shells Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("pe2", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your emission nebulae.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("pe2", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Emission Nebulae gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("pe2", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("pe2", 23) },
              effect() { return buyableEffect("pe2", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("pe2", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Emission Nebulae gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["pe2"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["pe2"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["pe2"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["pe2"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Trifid Pillars Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " emission nebulae<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
    },
})

addLayer("pe3", {
    name: "HII Regions",
    symbol: "HI",
    position: 1,
    row: 3,
    color: "#6ec6ff",
    resource: "% ionized",
    resetDescription: "Bath in starlight for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("7.8125e6"),
    type: "custom",
    branches: [["pe2", 2, 2]],
    layerShown() { return player.pe3.unlocked || hasUpgrade("pe2", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "D", description: "Shift+D: Bath in starlight for ionization",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    ionCap() { return new Decimal(100) },
    getResetGain() {
        if (!tmp[this.layer].baseAmount.gte(tmp[this.layer].requires)) return new Decimal(0)
        let raw = player.points.div(tmp[this.layer].requires).pow(0.25)
        raw = raw.times(tmp[this.layer].gainMult)
        let room = tmp.pe3.ionCap.sub(player.pe3.points).max(0)
        let gain = raw.min(room).max(0)
        return gain
    },
    getNextAt() { return tmp[this.layer].requires },
    canReset() { return tmp[this.layer].baseAmount.gte(tmp[this.layer].requires) && player.pe3.points.lt(tmp.pe3.ionCap) },
    prestigeButtonText() {
        if (player.pe3.points.gte(tmp.pe3.ionCap)) return "Fully ionized.<br>The Strömgren sphere is complete."
        if (!tmp[this.layer].baseAmount.gte(tmp[this.layer].requires)) return "Reach " + format(tmp[this.layer].requires) + " stardust to ionize further"
        return "Ionize for <b>" + format(getResetGain(this.layer)) + "</b>% ionization"
    },
    gainMult() {
        let m = new Decimal(10)
        if (hasUpgrade("pe3", 11)) m = m.times(2)
        if (hasUpgrade("pe3", 13)) m = m.times(upgradeEffect("pe3", 13))
        if (hasUpgrade("pe3", 14)) m = m.times(upgradeEffect("pe3", 14))
        if (hasMilestone("pe3", 0)) m = m.times(2.5)
        if (hasMilestone("pe3", 1)) m = m.times(3)
        if (getBuyableAmount("pe3", 11).gte(1)) m = m.times(buyableEffect("pe3", 11))
        if (hasUpgrade("pe4", 23)) m = m.times(upgradeEffect("pe4", 23))
        return m
    },
    update(diff) {
        if (player.pe3.points.gt(tmp.pe3.ionCap)) player.pe3.points = tmp.pe3.ionCap
        if (hasMilestone("pe3", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.pe3.points = player.pe3.points.add(getResetGain(this.layer).times(0.02).times(diff)).min(tmp.pe3.ionCap)
        }
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'Ionization: <b>' + format(player.pe3.points) + '</b>% — hydrogen splits as fast as it recombines.' }],
        ["display-text", function() { if (player.pe3.points.gte(100)) return '<b style="color:#6ec6ff">100% ionized. You cannot ionize past totality — but upgrades now buy permanent structure instead.</b>' }],
        ["blank", "12px"],
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            Upgrades: { content: [["blank", "8px"], "upgrades"] },
            Milestones: { content: [["blank", "8px"], "milestones"] },
            "Stromgren Shop": {
                unlocked() { return hasUpgrade("pe3", 25) },
                content: [["blank", "8px"], "buyables"],
                buttonStyle() { return { 'background-color': '#6ec6ff', 'color': '#08263f' } },
            },
        },
    },
    upgrades: {
        11: { title: "Stromgren Sphere",
              description: "Ionization gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Recombination Lines",
              description: "Ionization gain is boosted by your unspent ionization.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe3", 11) },
              effect() {
                  let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal(100), 0.5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Densified Rims",
              description: "Your stardust drives the photons.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("pe3", 12) },
              effect() {
                  let ret = player.points.add(1).pow(0.2)
                  if (hasUpgrade("pe3", 21)) ret = ret.pow(1.1)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Photoevaporation",
              description: "×5 ionization gain at 50%; ×5 more at 100%.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("pe3", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].points.gte(50)) ret = ret.times(5)
                  if (player[this.layer].points.gte(100)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Dark Nebulae Gather",
              description: "Unlock the Dark Nebulae layer.",
              cost: new Decimal(400),
              unlocked() { return hasUpgrade("pe3", 14) },
              onPurchase() { player.pe4.unlocked = true } },
        21: { title: "Ballooning Fronts",
              description: "Densified Rims (u13) is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("pe3", 15) } },
        22: { title: "Emission Glow",
              description: "Stardust gain ×3.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("pe3", 11) } },
        23: { title: "Ionization Feedback",
              description: "Dark nebula gain is boosted by your ionization.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("pe3", 15) },
              effect() { return player[this.layer].points.add(1).pow(0.35).times(2) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Hard Photons",
              description: "At 100%, structure replaces percentage: ×2 ionization gain.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("pe3", 21) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].points.gte(100)) ret = ret.times(2)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        25: { title: "Open the Stromgren Shop",
              description: "Unlock the Stromgren Shop buyables.",
              cost: new Decimal(8e4),
              unlocked() { return hasUpgrade("pe3", 23) },
              effect() { return buyableEffect("pe3", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x ionization" } },
        31: { title: "Cluster Warming",
              description: "Globular cluster gain is boosted by your milestones here.",
              cost: new Decimal(5e5),
              unlocked() { return hasUpgrade("pe3", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "Reach 100% ionization",
             effectDescription: "Ionization gain ×2.5",
             done() { return player[this.layer].points.gte(100) } },
        1: { requirementDescription: "Hold 100% with 8e5 best stardust this row",
             effectDescription: "Gain 2% of your ionization reset gain every second (still capped at 100%)",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(8e5) } },
        2: { requirementDescription: "100% and 2.5e6 best",
             effectDescription: "HII prestige no longer resets lower rows",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(2.5e6) } },
        3: { requirementDescription: "100% and 2e7 best",
             effectDescription: "HII upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(2e7) } },
    },
    buyables: {
        11: { title: "Photon Pump",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { let d = tmp[this.layer].buyables[this.id]
                  return "Cost: " + format(d.cost) + "% ionization<br>Ionization gain ×" + format(d.effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },
    resetsNothing() { if (hasMilestone("pe3", 2)) return true },
    passiveGeneration() { if (hasMilestone("oa4", 2)) return 1 },
    autoPrestige() { if (hasMilestone("pe3", 2)) return true },
    autoUpgrade() { if (hasMilestone("or8", 2)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("pe3", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
})

addLayer("pe4", {
    name: "Dark Nebulae",
    symbol: "DN",
    position: 1,
    row: 4,
    color: "#6ec6ff",
    resource: "dark nebulae",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.9531e8"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["pe3", 2, 2]],
    layerShown() { return player.pe4.unlocked || hasUpgrade("pe3", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "E", description: "Shift+E: reset for dark nebulae",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe4", 13)) m = m.times(upgradeEffect("pe4", 13))
        if (hasMilestone("pe4", 0)) m = m.times(2.5)
        if (getBuyableAmount("pe4", 11).gte(1)) m = m.times(buyableEffect("pe4", 11))
        if (hasUpgrade("pe5", 23)) m = m.times(upgradeEffect("pe5", 23))
        if (hasUpgrade("or5", 31)) m = m.times(upgradeEffect("or5", 31))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("pe4", 24)) c = c.times(1e3)
        if (hasMilestone("pe4", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("oa4", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("oa4", 3)) return true },
    resetsNothing() { if (hasMilestone("oa4", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("pe4", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.pe4.points.gte(1)) return 'Dark Nebulae: best ' + format(player.pe4.best) }],
        ["display-text", function() { if (player.pe4.points.gte(tmp.pe4.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.pe4.softcap) + ' dark nebulae' }],
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
        11: { title: "Barnard Catalog",
              description: "Dark Nebulae gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Coal Sacks",
              description: "Dark Nebulae gain is boosted by your unspent dark nebulae.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe4", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e10"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Occulting Cores",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("pe4", 12) },
              effect() { let ret = player["pe3"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe4", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 dark nebulae; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("pe4", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Perseus Arm layer: Reflection Nebulae.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("pe4", 14) },
              onPurchase() { player["pe5"].unlocked = true } },
        21: { title: "Barnard Catalog Resonance",
              description: "Occulting Cores is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("pe4", 15) } },
        22: { title: "Extinction Maps Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("pe4", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your dark nebulae.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("pe4", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Dark Nebulae gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("pe4", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("pe4", 23) },
              effect() { return buyableEffect("pe4", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("pe4", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Dark Nebulae gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["pe4"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["pe4"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["pe4"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["pe4"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Coal Sacks Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " dark nebulae<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
    },
})

addLayer("pe5", {
    name: "Reflection Nebulae",
    symbol: "RN",
    position: 1,
    row: 5,
    color: "#6ec6ff",
    resource: "reflection nebulae",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("4.8828e9"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["pe4", 2, 2]],
    layerShown() { return player.pe5.unlocked || hasUpgrade("pe4", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "F", description: "Shift+F: reset for reflection nebulae",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe5", 13)) m = m.times(upgradeEffect("pe5", 13))
        if (hasMilestone("pe5", 0)) m = m.times(2.5)
        if (getBuyableAmount("pe5", 11).gte(1)) m = m.times(buyableEffect("pe5", 11))
        if (hasUpgrade("pe6", 23)) m = m.times(upgradeEffect("pe6", 23))
        if (hasUpgrade("or6", 31)) m = m.times(upgradeEffect("or6", 31))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("pe5", 24)) c = c.times(1e3)
        if (hasMilestone("pe5", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("oa4", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("oa4", 3)) return true },
    resetsNothing() { if (hasMilestone("oa4", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("pe5", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.pe5.points.gte(1)) return 'Reflection Nebulae: best ' + format(player.pe5.best) }],
        ["display-text", function() { if (player.pe5.points.gte(tmp.pe5.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.pe5.softcap) + ' reflection nebulae' }],
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
        11: { title: "Blue Scatter",
              description: "Reflection Nebulae gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Pleiades Shroud",
              description: "Reflection Nebulae gain is boosted by your unspent reflection nebulae.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe5", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e10"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Cometary Globules",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("pe5", 12) },
              effect() { let ret = player["pe4"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe5", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 reflection nebulae; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("pe5", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Perseus Arm layer: Bok Globules.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("pe5", 14) },
              onPurchase() { player["pe6"].unlocked = true } },
        21: { title: "Blue Scatter Resonance",
              description: "Cometary Globules is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("pe5", 15) } },
        22: { title: "Merope Glow Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("pe5", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your reflection nebulae.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("pe5", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Reflection Nebulae gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("pe5", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("pe5", 23) },
              effect() { return buyableEffect("pe5", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("pe5", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Reflection Nebulae gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["pe5"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["pe5"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["pe5"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["pe5"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Pleiades Shroud Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " reflection nebulae<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
    },
})

addLayer("sg1", {
    name: "Dark Matter Halo",
    symbol: "DH",
    position: 2,
    row: 1,
    color: "#b388ff",
    resource: "dark matter halo",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("3e4"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["pl", 3, 2]],
    layerShown() { return player.sg1.unlocked || hasUpgrade("pl", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg1", 13)) m = m.times(upgradeEffect("sg1", 13))
        if (hasMilestone("sg1", 0)) m = m.times(2.5)
        if (getBuyableAmount("sg1", 11).gte(1)) m = m.times(buyableEffect("sg1", 11))
        if (hasUpgrade("sg2", 23)) m = m.times(upgradeEffect("sg2", 23))
        if (hasUpgrade("pe2", 31)) m = m.times(upgradeEffect("pe2", 31))
        if (hasChallenge("oa6", 13)) m = m.root(4)
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
if (hasUpgrade("sg2", 23)) m = m.times(upgradeEffect("sg2", 23))
        if (hasUpgrade("sg2", 31)) m = m.times(upgradeEffect("sg2", 31))
        if (hasMilestone("sg1", 2)) m = m.times(player.dm.darkMatter.add(1).log(10).plus(1).pow(1.2))
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("sg1", 24)) c = c.times(1e3)
        if (hasMilestone("sg1", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("sg2", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg2", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg2", 3)) return true },
    resetsNothing() { if (hasMilestone("sg2", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("sg1", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { return 'You have <b style="color:#b388ff">' + format(player.dm.darkMatter) + '</b> dark matter (spent in The Singularity Bazaar)' }],
        ["display-text", function() { if (player.sg1.points.gte(1)) return 'Dark Matter Halo: best ' + format(player.sg1.best) }],
        ["display-text", function() { if (player.sg1.points.gte(tmp.sg1.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.sg1.softcap) + ' dark matter halo' }],
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
        11: { title: "Missing Mass",
              description: "Dark Matter Halo gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Rotation Curves",
              description: "Dark Matter Halo gain is boosted by your unspent dark matter halo.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg1", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e10"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "NFW Profile",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("sg1", 12) },
              effect() { let ret = player["pl"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg1", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 dark matter halo; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("sg1", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Sagittarius Arm layer: Galactic Bar.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("sg1", 14) },
              onPurchase() { player["sg2"].unlocked = true } },
        21: { title: "Missing Mass Resonance",
              description: "NFW Profile is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("sg1", 15) } },
        22: { title: "Invisible Scaffolds Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("sg1", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your dark matter halo.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("sg1", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Dark Matter Halo gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("sg1", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("sg1", 23) },
              effect() { return buyableEffect("sg1", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("sg1", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Dark Matter Halo gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["sg1"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["sg1"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["sg1"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["sg1"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Rotation Curves Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " dark matter halo<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Invisible Scaffolds Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " dark matter halo<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        if (hasMilestone("sg1", 1) && !inChallenge("oa6", 23)) {
            let rate = player.sg1.points.add(1).log(10).plus(1).pow(1.8).div(20)
            if (hasUpgrade("sg1", 24)) rate = rate.times(4)
            if (hasUpgrade("dm", 11)) rate = rate.times(2)
            if (hasChallenge("oa6", 21)) rate = rate.times(5)
            rate = rate.times(tmp.sg1.gainMult)
            player.dm.darkMatter = player.dm.darkMatter.add(rate.times(diff))
        }
    },
})

addLayer("sg2", {
    name: "Galactic Bar",
    symbol: "GB",
    position: 2,
    row: 2,
    color: "#b388ff",
    resource: "galactic bar",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("7.5e5"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["sg1", 3, 2]],
    layerShown() { return player.sg2.unlocked || hasUpgrade("sg1", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg2", 13)) m = m.times(upgradeEffect("sg2", 13))
        if (hasMilestone("sg2", 0)) m = m.times(2.5)
        if (getBuyableAmount("sg2", 11).gte(1)) m = m.times(buyableEffect("sg2", 11))
        if (hasUpgrade("sg3", 23)) m = m.times(upgradeEffect("sg3", 23))
        if (hasUpgrade("pe3", 31)) m = m.times(upgradeEffect("pe3", 31))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("sg2", 24)) c = c.times(1e3)
        if (hasMilestone("sg2", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("sg2", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg2", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg2", 3)) return true },
    resetsNothing() { if (hasMilestone("sg2", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("sg2", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.sg2.points.gte(1)) return 'Galactic Bar: best ' + format(player.sg2.best) }],
        ["display-text", function() { if (player.sg2.points.gte(tmp.sg2.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.sg2.softcap) + ' galactic bar' }],
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
        11: { title: "Bar Resonances",
              description: "Galactic Bar gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Inflow Lanes",
              description: "Galactic Bar gain is boosted by your unspent galactic bar.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg2", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e10"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Boxy/Peanut Bulge",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("sg2", 12) },
              effect() { let ret = player["sg1"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg2", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 galactic bar; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("sg2", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Sagittarius Arm layer: Spiral Density Waves.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("sg2", 14) },
              onPurchase() { player["sg3"].unlocked = true } },
        21: { title: "Bar Resonances Resonance",
              description: "Boxy/Peanut Bulge is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("sg2", 15) } },
        22: { title: "CR Driving Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("sg2", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your galactic bar.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("sg2", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Galactic Bar gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("sg2", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("sg2", 23) },
              effect() { return buyableEffect("sg2", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("sg2", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Galactic Bar gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["sg2"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["sg2"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["sg2"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["sg2"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Inflow Lanes Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " galactic bar<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "CR Driving Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " galactic bar<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
    },
})

addLayer("sg3", {
    name: "Spiral Density Waves",
    symbol: "SD",
    position: 2,
    row: 3,
    color: "#b388ff",
    resource: "spiral density waves",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.875e7"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["sg2", 3, 2]],
    layerShown() { return player.sg3.unlocked || hasUpgrade("sg2", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg3", 13)) m = m.times(upgradeEffect("sg3", 13))
        if (hasMilestone("sg3", 0)) m = m.times(2.5)
        if (getBuyableAmount("sg3", 11).gte(1)) m = m.times(buyableEffect("sg3", 11))
        if (hasUpgrade("sg4", 23)) m = m.times(upgradeEffect("sg4", 23))
        if (hasUpgrade("pe4", 31)) m = m.times(upgradeEffect("pe4", 31))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("sg3", 24)) c = c.times(1e3)
        if (hasMilestone("sg3", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("oa4", 3)) return true },
    passiveGeneration() { if (hasMilestone("oa4", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("oa4", 3)) return true },
    resetsNothing() { if (hasMilestone("oa4", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("sg3", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.sg3.points.gte(1)) return 'Spiral Density Waves: best ' + format(player.sg3.best) }],
        ["display-text", function() { if (player.sg3.points.gte(tmp.sg3.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.sg3.softcap) + ' spiral density waves' }],
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
        11: { title: "Lin-Shu Theory",
              description: "Spiral Density Waves gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Compression Shocks",
              description: "Spiral Density Waves gain is boosted by your unspent spiral density waves.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg3", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e10"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Pattern Speed",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("sg3", 12) },
              effect() { let ret = player["sg2"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg3", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 spiral density waves; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("sg3", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Sagittarius Arm layer: Galactic Rotation.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("sg3", 14) },
              onPurchase() { player["sg4"].unlocked = true } },
        21: { title: "Lin-Shu Theory Resonance",
              description: "Pattern Speed is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("sg3", 15) } },
        22: { title: "Arm Locking Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("sg3", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your spiral density waves.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("sg3", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Spiral Density Waves gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("sg3", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("sg3", 23) },
              effect() { return buyableEffect("sg3", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("sg3", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Spiral Density Waves gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["sg3"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["sg3"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["sg3"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["sg3"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Compression Shocks Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " spiral density waves<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Arm Locking Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " spiral density waves<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
    },
})

addLayer("sg4", {
    name: "Galactic Rotation",
    symbol: "GR",
    position: 2,
    row: 4,
    color: "#b388ff",
    resource: "galactic rotation",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("4.6875e8"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["sg3", 3, 2]],
    layerShown() { return player.sg4.unlocked || hasUpgrade("sg3", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg4", 13)) m = m.times(upgradeEffect("sg4", 13))
        if (hasMilestone("sg4", 0)) m = m.times(2.5)
        if (getBuyableAmount("sg4", 11).gte(1)) m = m.times(buyableEffect("sg4", 11))
        if (hasUpgrade("sg5", 23)) m = m.times(upgradeEffect("sg5", 23))
        if (hasUpgrade("pe5", 31)) m = m.times(upgradeEffect("pe5", 31))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("sg4", 24)) c = c.times(1e3)
        if (hasMilestone("sg4", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("oa4", 3)) return true },
    passiveGeneration() { if (hasMilestone("oa4", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("oa4", 3)) return true },
    resetsNothing() { if (hasMilestone("oa4", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("sg4", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.sg4.points.gte(1)) return 'Galactic Rotation: best ' + format(player.sg4.best) }],
        ["display-text", function() { if (player.sg4.points.gte(tmp.sg4.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.sg4.softcap) + ' galactic rotation' }],
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
        11: { title: "Flat Curves",
              description: "Galactic Rotation gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Oort Constants",
              description: "Galactic Rotation gain is boosted by your unspent galactic rotation.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg4", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e10"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Differential Shear",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("sg4", 12) },
              effect() { let ret = player["sg3"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg4", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 galactic rotation; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("sg4", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Sagittarius Arm layer: Magnetic Fields.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("sg4", 14) },
              onPurchase() { player["sg5"].unlocked = true } },
        21: { title: "Flat Curves Resonance",
              description: "Differential Shear is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("sg4", 15) } },
        22: { title: "220 km/s Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("sg4", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your galactic rotation.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("sg4", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Galactic Rotation gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("sg4", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("sg4", 23) },
              effect() { return buyableEffect("sg4", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("sg4", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Galactic Rotation gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["sg4"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["sg4"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["sg4"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["sg4"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Oort Constants Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " galactic rotation<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "220 km/s Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " galactic rotation<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
    },
})

addLayer("sg5", {
    name: "Magnetic Fields",
    symbol: "MF",
    position: 2,
    row: 5,
    color: "#b388ff",
    resource: "magnetic fields",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.1719e10"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["sg4", 3, 2]],
    layerShown() { return player.sg5.unlocked || hasUpgrade("sg4", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg5", 13)) m = m.times(upgradeEffect("sg5", 13))
        if (hasMilestone("sg5", 0)) m = m.times(2.5)
        if (getBuyableAmount("sg5", 11).gte(1)) m = m.times(buyableEffect("sg5", 11))
        if (hasUpgrade("sg6", 23)) m = m.times(upgradeEffect("sg6", 23))
        if (hasUpgrade("pe6", 31)) m = m.times(upgradeEffect("pe6", 31))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("sg5", 24)) c = c.times(1e3)
        if (hasMilestone("sg5", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("oa4", 3)) return true },
    passiveGeneration() { if (hasMilestone("oa4", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("oa4", 3)) return true },
    resetsNothing() { if (hasMilestone("oa4", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("sg5", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.sg5.points.gte(1)) return 'Magnetic Fields: best ' + format(player.sg5.best) }],
        ["display-text", function() { if (player.sg5.points.gte(tmp.sg5.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.sg5.softcap) + ' magnetic fields' }],
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
        11: { title: "Zeeman Splitting",
              description: "Magnetic Fields gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Synchrotron Web",
              description: "Magnetic Fields gain is boosted by your unspent magnetic fields.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg5", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e10"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Parker Instability",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("sg5", 12) },
              effect() { let ret = player["sg4"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg5", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 magnetic fields; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("sg5", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Sagittarius Arm layer: Cosmic Rays.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("sg5", 14) },
              onPurchase() { player["sg6"].unlocked = true } },
        21: { title: "Zeeman Splitting Resonance",
              description: "Parker Instability is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("sg5", 15) } },
        22: { title: "Microgauss Threads Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("sg5", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your magnetic fields.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("sg5", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Magnetic Fields gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("sg5", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("sg5", 23) },
              effect() { return buyableEffect("sg5", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("sg5", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Magnetic Fields gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["sg5"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["sg5"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["sg5"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["sg5"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Synchrotron Web Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " magnetic fields<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Microgauss Threads Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " magnetic fields<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
    },
})

addLayer("oa1", {
    name: "Supernova Remnants",
    symbol: "SR",
    position: 3,
    row: 1,
    color: "#ff8a80",
    resource: "supernova remnants",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("7.5e4"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["ps", 1, 2]],
    layerShown() { return player.oa1.unlocked || hasUpgrade("ps", 15) || hasMilestone("ps", 2) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa1", 13)) m = m.times(upgradeEffect("oa1", 13))
        if (hasMilestone("oa1", 0)) m = m.times(2.5)
        if (getBuyableAmount("oa1", 11).gte(1)) m = m.times(buyableEffect("oa1", 11))
        if (hasUpgrade("oa2", 23)) m = m.times(upgradeEffect("oa2", 23))
        if (hasUpgrade("sg2", 31)) m = m.times(upgradeEffect("sg2", 31))
        if (hasChallenge("oa6", 13)) m = m.root(4)
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("oa1", 24)) c = c.times(1e3)
        if (hasMilestone("oa1", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("sg2", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg2", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg2", 3)) return true },
    resetsNothing() { if (hasMilestone("sg2", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("oa1", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.oa1.points.gte(1)) return 'Supernova Remnants: best ' + format(player.oa1.best) }],
        ["display-text", function() { if (player.oa1.points.gte(tmp.oa1.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.oa1.softcap) + ' supernova remnants' }],
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
        11: { title: "Sedov Expansion",
              description: "Supernova Remnants gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Cas A Knots",
              description: "Supernova Remnants gain is boosted by your unspent supernova remnants.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa1", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e10")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e10e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Reverse Shocks",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("oa1", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["ps"].points.gte(100)) ret = ret.times(5)
                  if (player["ps"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa1", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 supernova remnants; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("oa1", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Outer Arm layer: Recurrent Novae.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("oa1", 14) },
              onPurchase() { player["oa2"].unlocked = true } },
        21: { title: "Sedov Expansion Resonance",
              description: "Reverse Shocks is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("oa1", 15) } },
        22: { title: "Pulsar Wind Nebulae Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("oa1", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your supernova remnants.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("oa1", 15) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Supernova Remnants gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("oa1", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("oa1", 23) },
              effect() { return buyableEffect("oa1", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("oa1", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Supernova Remnants gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["oa1"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["oa1"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["oa1"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["oa1"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Cas A Knots Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " supernova remnants<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
    },
})

addLayer("oa2", {
    name: "Recurrent Novae",
    symbol: "RN",
    position: 3,
    row: 2,
    color: "#ff8a80",
    resource: "recurrent novae",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.875e6"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["oa1", 1, 2]],
    layerShown() { return player.oa2.unlocked || hasUpgrade("oa1", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa2", 13)) m = m.times(upgradeEffect("oa2", 13))
        if (hasMilestone("oa2", 0)) m = m.times(2.5)
        if (getBuyableAmount("oa2", 11).gte(1)) m = m.times(buyableEffect("oa2", 11))
        if (hasUpgrade("oa3", 23)) m = m.times(upgradeEffect("oa3", 23))
        if (hasUpgrade("sg3", 31)) m = m.times(upgradeEffect("sg3", 31))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("oa2", 24)) c = c.times(1e3)
        if (hasMilestone("oa2", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("sg2", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg2", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg2", 3)) return true },
    resetsNothing() { if (hasMilestone("sg2", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("oa2", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.oa2.points.gte(1)) return 'Recurrent Novae: best ' + format(player.oa2.best) }],
        ["display-text", function() { if (player.oa2.points.gte(tmp.oa2.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.oa2.softcap) + ' recurrent novae' }],
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
        11: { title: "Accretion Limits",
              description: "Recurrent Novae gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Eruption Cycles",
              description: "Recurrent Novae gain is boosted by your unspent recurrent novae.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa2", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e10")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e10e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "RS Oph Outbursts",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("oa2", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa1"].points.gte(100)) ret = ret.times(5)
                  if (player["oa1"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa2", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 recurrent novae; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("oa2", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Outer Arm layer: Dwarf Novae.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("oa2", 14) },
              onPurchase() { player["oa3"].unlocked = true } },
        21: { title: "Accretion Limits Resonance",
              description: "RS Oph Outbursts is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("oa2", 15) } },
        22: { title: "T Cor Bor Bells Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("oa2", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your recurrent novae.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("oa2", 15) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Recurrent Novae gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("oa2", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("oa2", 23) },
              effect() { return buyableEffect("oa2", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("oa2", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Recurrent Novae gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["oa2"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["oa2"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["oa2"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["oa2"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Eruption Cycles Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " recurrent novae<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
    },
})

addLayer("oa3", {
    name: "Dwarf Novae",
    symbol: "DW",
    position: 3,
    row: 3,
    color: "#ff8a80",
    resource: "dwarf novae",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("4.6875e7"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["oa2", 1, 2]],
    layerShown() { return player.oa3.unlocked || hasUpgrade("oa2", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa3", 13)) m = m.times(upgradeEffect("oa3", 13))
        if (hasMilestone("oa3", 0)) m = m.times(2.5)
        if (getBuyableAmount("oa3", 11).gte(1)) m = m.times(buyableEffect("oa3", 11))
        if (hasUpgrade("oa4", 23)) m = m.times(upgradeEffect("oa4", 23))
        if (hasUpgrade("sg4", 31)) m = m.times(upgradeEffect("sg4", 31))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("oa3", 24)) c = c.times(1e3)
        if (hasMilestone("oa3", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("oa4", 3)) return true },
    passiveGeneration() { if (hasMilestone("oa4", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("oa4", 3)) return true },
    resetsNothing() { if (hasMilestone("oa4", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("oa3", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.oa3.points.gte(1)) return 'Dwarf Novae: best ' + format(player.oa3.best) }],
        ["display-text", function() { if (player.oa3.points.gte(tmp.oa3.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.oa3.softcap) + ' dwarf novae' }],
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
        11: { title: "Thermal Instability",
              description: "Dwarf Novae gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Outburst Limits",
              description: "Dwarf Novae gain is boosted by your unspent dwarf novae.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa3", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e10")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e10e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "SU UMa Superoutbursts",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("oa3", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa2"].points.gte(100)) ret = ret.times(5)
                  if (player["oa2"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa3", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 dwarf novae; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("oa3", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Outer Arm layer: X-ray Flashes.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("oa3", 14) },
              onPurchase() { player["oa4"].unlocked = true } },
        21: { title: "Thermal Instability Resonance",
              description: "SU UMa Superoutbursts is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("oa3", 15) } },
        22: { title: "Disc Precession Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("oa3", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your dwarf novae.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("oa3", 15) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Dwarf Novae gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("oa3", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("oa3", 23) },
              effect() { return buyableEffect("oa3", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("oa3", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Dwarf Novae gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["oa3"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["oa3"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["oa3"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["oa3"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Outburst Limits Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " dwarf novae<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
    },
})

addLayer("oa4", {
    name: "X-ray Flashes",
    symbol: "XF",
    position: 3,
    row: 4,
    color: "#ff8a80",
    resource: "x-ray flashes",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.1719e9"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["oa3", 1, 2]],
    layerShown() { return player.oa4.unlocked || hasUpgrade("oa3", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa4", 13)) m = m.times(upgradeEffect("oa4", 13))
        if (hasMilestone("oa4", 0)) m = m.times(2.5)
        if (getBuyableAmount("oa4", 11).gte(1)) m = m.times(buyableEffect("oa4", 11))
        if (hasUpgrade("oa5", 23)) m = m.times(upgradeEffect("oa5", 23))
        if (hasUpgrade("sg5", 31)) m = m.times(upgradeEffect("sg5", 31))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("oa4", 24)) c = c.times(1e3)
        if (hasMilestone("oa4", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("oa4", 3)) return true },
    passiveGeneration() { if (hasMilestone("oa4", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("oa4", 3)) return true },
    resetsNothing() { if (hasMilestone("oa4", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("oa4", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.oa4.points.gte(1)) return 'X-ray Flashes: best ' + format(player.oa4.best) }],
        ["display-text", function() { if (player.oa4.points.gte(tmp.oa4.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.oa4.softcap) + ' x-ray flashes' }],
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
        11: { title: "Sub-energetic Bursts",
              description: "X-ray Flashes gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Peak Overlaps",
              description: "X-ray Flashes gain is boosted by your unspent x-ray flashes.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa4", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e10")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e10e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Redshift Reach",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("oa4", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa3"].points.gte(100)) ret = ret.times(5)
                  if (player["oa3"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa4", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 x-ray flashes; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("oa4", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Outer Arm layer: Giant Flares.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("oa4", 14) },
              onPurchase() { player["oa5"].unlocked = true } },
        21: { title: "Sub-energetic Bursts Resonance",
              description: "Redshift Reach is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("oa4", 15) } },
        22: { title: "XRF 020903 Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("oa4", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your x-ray flashes.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("oa4", 15) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "X-ray Flashes gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("oa4", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("oa4", 23) },
              effect() { return buyableEffect("oa4", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("oa4", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "X-ray Flashes gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["oa4"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["oa4"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["oa4"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["oa4"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Peak Overlaps Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " x-ray flashes<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
    },
})

addLayer("oa5", {
    name: "Giant Flares",
    symbol: "GF",
    position: 3,
    row: 5,
    color: "#ff8a80",
    resource: "giant flares",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("2.9297e10"),
    type: "normal",
    exponent: 1 / 3,
    branches: [["oa4", 1, 2]],
    layerShown() { return player.oa5.unlocked || hasUpgrade("oa4", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa5", 13)) m = m.times(upgradeEffect("oa5", 13))
        if (hasMilestone("oa5", 0)) m = m.times(2.5)
        if (getBuyableAmount("oa5", 11).gte(1)) m = m.times(buyableEffect("oa5", 11))
        if (hasUpgrade("oa6", 23)) m = m.times(upgradeEffect("oa6", 23))
        if (hasUpgrade("sg6", 31)) m = m.times(upgradeEffect("sg6", 31))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e3")
        if (hasUpgrade("oa5", 24)) c = c.times(1e3)
        if (hasMilestone("oa5", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("oa4", 3)) return true },
    passiveGeneration() { if (hasMilestone("oa4", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("oa4", 3)) return true },
    resetsNothing() { if (hasMilestone("oa4", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("oa5", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.oa5.points.gte(1)) return 'Giant Flares: best ' + format(player.oa5.best) }],
        ["display-text", function() { if (player.oa5.points.gte(tmp.oa5.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.oa5.softcap) + ' giant flares' }],
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
        11: { title: "SGR 1900+14",
              description: "Giant Flares gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Initial Spikes",
              description: "Giant Flares gain is boosted by your unspent giant flares.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa5", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e10")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e10e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Tail Oscillations",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("oa5", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa4"].points.gte(100)) ret = ret.times(5)
                  if (player["oa4"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa5", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 giant flares; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("oa5", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Outer Arm layer: Supernova Trials.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("oa5", 14) },
              onPurchase() { player["oa6"].unlocked = true } },
        21: { title: "SGR 1900+14 Resonance",
              description: "Tail Oscillations is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("oa5", 15) } },
        22: { title: "Crust Cracking Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("oa5", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your giant flares.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("oa5", 15) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Giant Flares gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("oa5", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("oa5", 23) },
              effect() { return buyableEffect("oa5", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("oa5", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Giant Flares gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["oa5"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["oa5"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["oa5"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["oa5"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Initial Spikes Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " giant flares<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
    },
})
