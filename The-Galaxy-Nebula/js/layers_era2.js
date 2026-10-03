addLayer("or6", {
    name: "Planetary Nebulae",
    symbol: "PN",
    position: 0,
    row: 6,
    color: "#ffd162",
    resource: "planetary nebulae",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("4.8828e10"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["or5", 1, 2]],
    layerShown() { return player.or6.unlocked || hasUpgrade("or5", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "g", description: "g: reset for planetary nebulae",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or6", 13)) m = m.times(upgradeEffect("or6", 13))
        if (hasMilestone("or6", 0)) m = m.div(2.5)
        if (getBuyableAmount("or6", 11).gte(1)) m = m.div(buyableEffect("or6", 11))
        if (hasUpgrade("or7", 23)) m = m.div(upgradeEffect("or7", 23))
        if (hasUpgrade("oa7", 31)) m = m.div(upgradeEffect("oa7", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("or6", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.or6.points.gte(1)) return 'Planetary Nebulae: best ' + format(player.or6.best) }],
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
        11: { title: "Ring Nebula",
              description: "Planetary Nebulae gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Bipolar Outflows",
              description: "Planetary Nebulae gain is boosted by your unspent planetary nebulae.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("or6", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e16"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "OIII Glow",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("or6", 12) },
              effect() { let ret = player["or5"].points.add(1).pow(0.4)
                  if (hasUpgrade("or6", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 planetary nebulae; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("or6", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Orion Arm layer: Supernovae.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("or6", 14) },
              onPurchase() { player["or7"].unlocked = true } },
        21: { title: "Ring Nebula Resonance",
              description: "OIII Glow is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or6", 15) } },
        22: { title: "Central Stripped Cores Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("or6", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your planetary nebulae.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("or6", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Planetary Nebulae gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("or6", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("or6", 23) },
              effect() { return buyableEffect("or6", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("or6", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 planetary nebulae",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "Bipolar Outflows Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " planetary nebulae<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Central Stripped Cores Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " planetary nebulae<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        if (hasMilestone("or6", 1) && !inChallenge("oa6", 23)) {
            player.or6.points = player.or6.points.add(tmp.or6.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("or7", {
    name: "Supernovae",
    symbol: "SN",
    position: 0,
    row: 7,
    color: "#ffd162",
    resource: "supernovae",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.2207e12"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["or6", 1, 2]],
    layerShown() { return player.or7.unlocked || hasUpgrade("or6", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0), heavy: new Decimal(0) } },
    hotkeys: [
        { key: "h", description: "h: reset for supernovae",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or7", 13)) m = m.times(upgradeEffect("or7", 13))
        if (hasMilestone("or7", 0)) m = m.div(2.5)
        if (getBuyableAmount("or7", 11).gte(1)) m = m.div(buyableEffect("or7", 11))
        if (hasUpgrade("or8", 23)) m = m.div(upgradeEffect("or8", 23))
        if (hasUpgrade("oa8", 31)) m = m.div(upgradeEffect("oa8", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
if (hasUpgrade("or8", 23)) m = m.times(upgradeEffect("or8", 23))
        if (hasUpgrade("or6", 23)) m = m.times(upgradeEffect("or6", 23))
        if (hasMilestone("or7", 2)) m = m.times(player.or7.heavy.add(1).log(10).plus(1).pow(1.5))
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("or7", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { return 'You have <b style="color:#ffb74d">' + format(player.or7.heavy) + '</b> heavy elements' }],
        ["display-text", function() { if (player.or7.points.gte(1)) return 'Supernovae: best ' + format(player.or7.best) }],
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
        11: { title: "Core Collapse",
              description: "Supernovae gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Type Ia Standard Candles",
              description: "Supernovae gain is boosted by your unspent supernovae.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("or7", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e16"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Nucleosynthesis Burst",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("or7", 12) },
              effect() { let ret = player["or6"].points.add(1).pow(0.4)
                  if (hasUpgrade("or7", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 supernovae; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("or7", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Orion Arm layer: Neutron Stars.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("or7", 14) },
              onPurchase() { player["or8"].unlocked = true } },
        21: { title: "Core Collapse Resonance",
              description: "Nucleosynthesis Burst is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or7", 15) } },
        22: { title: "Light Echoes Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("or7", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your supernovae.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("or7", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Supernovae gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("or7", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("or7", 23) },
              effect() { return buyableEffect("or7", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("or7", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 supernovae",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "Type Ia Standard Candles Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " supernovae<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Light Echoes Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " supernovae<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        if (hasMilestone("or7", 1) && !inChallenge("oa6", 23)) {
            player.or7.points = player.or7.points.add(tmp.or7.resetGain.times(0.02).times(diff))
        }
        if (hasMilestone("or7", 1) && !inChallenge("oa6", 23)) {
            let rate = player.or7.points.add(1).log(10).plus(1).pow(2).div(10)
            if (hasUpgrade("or7", 24)) rate = rate.times(4)
            if (hasUpgrade("dm", 15)) rate = rate.times(3)
            if (hasChallenge("oa6", 14)) rate = rate.times(5)
            player.or7.heavy = player.or7.heavy.add(rate.times(diff))
        }
    },
})

addLayer("or8", {
    name: "Neutron Stars",
    symbol: "NS",
    position: 0,
    row: 8,
    color: "#ffd162",
    resource: "neutron stars",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("3.0518e13"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["or7", 1, 2]],
    layerShown() { return player.or8.unlocked || hasUpgrade("or7", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "i", description: "i: reset for neutron stars",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or8", 13)) m = m.times(upgradeEffect("or8", 13))
        if (hasMilestone("or8", 0)) m = m.div(2.5)
        if (getBuyableAmount("or8", 11).gte(1)) m = m.div(buyableEffect("or8", 11))
        if (hasUpgrade("or9", 23)) m = m.div(upgradeEffect("or9", 23))
        if (hasUpgrade("oa9", 31)) m = m.div(upgradeEffect("oa9", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("or8", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.or8.points.gte(1)) return 'Neutron Stars: best ' + format(player.or8.best) }],
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
        11: { title: "Nuclear Pasta",
              description: "Neutron Stars gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Degenerate Neutrons",
              description: "Neutron Stars gain is boosted by your unspent neutron stars.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("or8", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e16"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Crustquakes",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("or8", 12) },
              effect() { let ret = player["or7"].points.add(1).pow(0.4)
                  if (hasUpgrade("or8", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 neutron stars; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("or8", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Orion Arm layer: Pulsars.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("or8", 14) },
              onPurchase() { player["or9"].unlocked = true } },
        21: { title: "Nuclear Pasta Resonance",
              description: "Crustquakes is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or8", 15) } },
        22: { title: "Ultra-dense Cores Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("or8", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your neutron stars.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("or8", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Neutron Stars gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("or8", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("or8", 23) },
              effect() { return buyableEffect("or8", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("or8", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 neutron stars",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "Degenerate Neutrons Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " neutron stars<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Ultra-dense Cores Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " neutron stars<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        if (hasMilestone("or8", 1) && !inChallenge("oa6", 23)) {
            player.or8.points = player.or8.points.add(tmp.or8.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("or9", {
    name: "Pulsars",
    symbol: "PU",
    position: 0,
    row: 9,
    color: "#ffd162",
    resource: "pulsars",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("7.6294e14"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["or8", 1, 2]],
    layerShown() { return player.or9.unlocked || hasUpgrade("or8", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "j", description: "j: reset for pulsars",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or9", 13)) m = m.times(upgradeEffect("or9", 13))
        if (hasMilestone("or9", 0)) m = m.div(2.5)
        if (getBuyableAmount("or9", 11).gte(1)) m = m.div(buyableEffect("or9", 11))
        if (hasUpgrade("or10", 23)) m = m.div(upgradeEffect("or10", 23))
        if (hasUpgrade("oa10", 31)) m = m.div(upgradeEffect("oa10", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("or9", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.or9.points.gte(1)) return 'Pulsars: best ' + format(player.or9.best) }],
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
        11: { title: "Millisecond Spin",
              description: "Pulsars gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Beamed Radio",
              description: "Pulsars gain is boosted by your unspent pulsars.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("or9", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e16"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Spin-Down Power",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("or9", 12) },
              effect() { let ret = player["or8"].points.add(1).pow(0.4)
                  if (hasUpgrade("or9", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 pulsars; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("or9", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Orion Arm layer: Magnetars.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("or9", 14) },
              onPurchase() { player["or10"].unlocked = true } },
        21: { title: "Millisecond Spin Resonance",
              description: "Spin-Down Power is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or9", 15) } },
        22: { title: "Timing Arrays Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("or9", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your pulsars.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("or9", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Pulsars gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("or9", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("or9", 23) },
              effect() { return buyableEffect("or9", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("or9", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 pulsars",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "Beamed Radio Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " pulsars<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Timing Arrays Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " pulsars<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        if (hasMilestone("or9", 1) && !inChallenge("oa6", 23)) {
            player.or9.points = player.or9.points.add(tmp.or9.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("or10", {
    name: "Magnetars",
    symbol: "MG",
    position: 0,
    row: 10,
    color: "#ffd162",
    resource: "magnetars",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.9073e16"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["or9", 1, 2]],
    layerShown() { return player.or10.unlocked || hasUpgrade("or9", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "k", description: "k: reset for magnetars",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or10", 13)) m = m.times(upgradeEffect("or10", 13))
        if (hasMilestone("or10", 0)) m = m.div(2.5)
        if (getBuyableAmount("or10", 11).gte(1)) m = m.div(buyableEffect("or10", 11))
        if (hasUpgrade("or11", 23)) m = m.div(upgradeEffect("or11", 23))
        if (hasUpgrade("oa11", 31)) m = m.div(upgradeEffect("oa11", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("or10", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.or10.points.gte(1)) return 'Magnetars: best ' + format(player.or10.best) }],
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
        11: { title: "Giant Flares",
              description: "Magnetars gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Quake Starquakes",
              description: "Magnetars gain is boosted by your unspent magnetars.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("or10", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e16"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Twisted Magnetosphere",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("or10", 12) },
              effect() { let ret = player["or9"].points.add(1).pow(0.4)
                  if (hasUpgrade("or10", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 magnetars; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("or10", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Orion Arm layer: Black Holes.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("or10", 14) },
              onPurchase() { player["or11"].unlocked = true } },
        21: { title: "Giant Flares Resonance",
              description: "Twisted Magnetosphere is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or10", 15) } },
        22: { title: "SGR 1806 Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("or10", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your magnetars.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("or10", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Magnetars gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("or10", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("or10", 23) },
              effect() { return buyableEffect("or10", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("or10", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 magnetars",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "Quake Starquakes Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " magnetars<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "SGR 1806 Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " magnetars<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        if (hasMilestone("or10", 1) && !inChallenge("oa6", 23)) {
            player.or10.points = player.or10.points.add(tmp.or10.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("pe6", {
    name: "Bok Globules",
    symbol: "BG",
    position: 1,
    row: 6,
    color: "#6ec6ff",
    resource: "bok globules",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.2207e11"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["pe5", 2, 2]],
    layerShown() { return player.pe6.unlocked || hasUpgrade("pe5", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "G", description: "Shift+G: reset for bok globules",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe6", 13)) m = m.times(upgradeEffect("pe6", 13))
        if (hasMilestone("pe6", 0)) m = m.div(2.5)
        if (getBuyableAmount("pe6", 11).gte(1)) m = m.div(buyableEffect("pe6", 11))
        if (hasUpgrade("pe7", 23)) m = m.div(upgradeEffect("pe7", 23))
        if (hasUpgrade("or7", 31)) m = m.div(upgradeEffect("or7", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("pe6", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.pe6.points.gte(1)) return 'Bok Globules: best ' + format(player.pe6.best) }],
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
        11: { title: "Compact Cradles",
              description: "Bok Globules gain ×2.",
              cost: new Decimal(1) },
        12: { title: "IRAS Point Sources",
              description: "Bok Globules gain is boosted by your unspent bok globules.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("pe6", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e16"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Silent Collapse",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("pe6", 12) },
              effect() { let ret = player["pe5"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe6", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 bok globules; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("pe6", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Perseus Arm layer: Globular Clusters.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("pe6", 14) },
              onPurchase() { player["pe7"].unlocked = true } },
        21: { title: "Compact Cradles Resonance",
              description: "Silent Collapse is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe6", 15) } },
        22: { title: "Chemical Time Capsules Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("pe6", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your bok globules.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("pe6", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Bok Globules gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("pe6", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("pe6", 23) },
              effect() { return buyableEffect("pe6", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("pe6", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 bok globules",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "IRAS Point Sources Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " bok globules<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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

addLayer("pe7", {
    name: "Globular Clusters",
    symbol: "GL",
    position: 1,
    row: 7,
    color: "#6ec6ff",
    resource: "globular clusters",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("3.0518e12"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["pe6", 2, 2]],
    layerShown() { return player.pe7.unlocked || hasUpgrade("pe6", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "H", description: "Shift+H: reset for globular clusters",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe7", 13)) m = m.times(upgradeEffect("pe7", 13))
        if (hasMilestone("pe7", 0)) m = m.div(2.5)
        if (getBuyableAmount("pe7", 11).gte(1)) m = m.div(buyableEffect("pe7", 11))
        if (hasUpgrade("pe8", 23)) m = m.div(upgradeEffect("pe8", 23))
        if (hasUpgrade("or8", 31)) m = m.div(upgradeEffect("or8", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("pe7", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.pe7.points.gte(1)) return 'Globular Clusters: best ' + format(player.pe7.best) }],
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
        11: { title: "Central Crowding",
              description: "Globular Clusters gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Omega Centauri",
              description: "Globular Clusters gain is boosted by your unspent globular clusters.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("pe7", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e16"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Metal-Poor Elders",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("pe7", 12) },
              effect() { let ret = player["pe6"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe7", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 globular clusters; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("pe7", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Perseus Arm layer: OB Associations.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("pe7", 14) },
              onPurchase() { player["pe8"].unlocked = true } },
        21: { title: "Central Crowding Resonance",
              description: "Metal-Poor Elders is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe7", 15) } },
        22: { title: "Core Collapse Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("pe7", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your globular clusters.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("pe7", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Globular Clusters gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("pe7", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("pe7", 23) },
              effect() { return buyableEffect("pe7", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("pe7", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 globular clusters",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "Omega Centauri Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " globular clusters<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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

addLayer("pe8", {
    name: "OB Associations",
    symbol: "OB",
    position: 1,
    row: 8,
    color: "#6ec6ff",
    resource: "ob associations",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("7.6294e13"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["pe7", 2, 2]],
    layerShown() { return player.pe8.unlocked || hasUpgrade("pe7", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "I", description: "Shift+I: reset for ob associations",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe8", 13)) m = m.times(upgradeEffect("pe8", 13))
        if (hasMilestone("pe8", 0)) m = m.div(2.5)
        if (getBuyableAmount("pe8", 11).gte(1)) m = m.div(buyableEffect("pe8", 11))
        if (hasUpgrade("pe9", 23)) m = m.div(upgradeEffect("pe9", 23))
        if (hasUpgrade("or9", 31)) m = m.div(upgradeEffect("or9", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("pe8", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.pe8.points.gte(1)) return 'OB Associations: best ' + format(player.pe8.best) }],
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
        11: { title: "Unbound Squads",
              description: "OB Associations gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Superbubbles",
              description: "OB Associations gain is boosted by your unspent ob associations.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("pe8", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e16"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Interstellar Carving",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("pe8", 12) },
              effect() { let ret = player["pe7"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe8", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 ob associations; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("pe8", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Perseus Arm layer: Protostellar Disks.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("pe8", 14) },
              onPurchase() { player["pe9"].unlocked = true } },
        21: { title: "Unbound Squads Resonance",
              description: "Interstellar Carving is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe8", 15) } },
        22: { title: "O-Star Winds Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("pe8", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your ob associations.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("pe8", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "OB Associations gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("pe8", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("pe8", 23) },
              effect() { return buyableEffect("pe8", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("pe8", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 ob associations",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "Superbubbles Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ob associations<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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

addLayer("pe9", {
    name: "Protostellar Disks",
    symbol: "PD",
    position: 1,
    row: 9,
    color: "#6ec6ff",
    resource: "protostellar disks",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.9073e15"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["pe8", 2, 2]],
    layerShown() { return player.pe9.unlocked || hasUpgrade("pe8", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "J", description: "Shift+J: reset for protostellar disks",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe9", 13)) m = m.times(upgradeEffect("pe9", 13))
        if (hasMilestone("pe9", 0)) m = m.div(2.5)
        if (getBuyableAmount("pe9", 11).gte(1)) m = m.div(buyableEffect("pe9", 11))
        if (hasUpgrade("pe10", 23)) m = m.div(upgradeEffect("pe10", 23))
        if (hasUpgrade("or10", 31)) m = m.div(upgradeEffect("or10", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("pe9", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.pe9.points.gte(1)) return 'Protostellar Disks: best ' + format(player.pe9.best) }],
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
        11: { title: "Angular Momentum",
              description: "Protostellar Disks gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Dust Settling",
              description: "Protostellar Disks gain is boosted by your unspent protostellar disks.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("pe9", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e16"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Disk Winds",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("pe9", 12) },
              effect() { let ret = player["pe8"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe9", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 protostellar disks; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("pe9", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Perseus Arm layer: Herbig-Haro Objects.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("pe9", 14) },
              onPurchase() { player["pe10"].unlocked = true } },
        21: { title: "Angular Momentum Resonance",
              description: "Disk Winds is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe9", 15) } },
        22: { title: "Snow Lines Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("pe9", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your protostellar disks.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("pe9", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Protostellar Disks gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("pe9", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("pe9", 23) },
              effect() { return buyableEffect("pe9", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("pe9", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 protostellar disks",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "Dust Settling Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " protostellar disks<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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

addLayer("pe10", {
    name: "Herbig-Haro Objects",
    symbol: "HH",
    position: 1,
    row: 10,
    color: "#6ec6ff",
    resource: "herbig-haro objects",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("4.7684e16"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["pe9", 2, 2]],
    layerShown() { return player.pe10.unlocked || hasUpgrade("pe9", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "K", description: "Shift+K: reset for herbig-haro objects",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe10", 13)) m = m.times(upgradeEffect("pe10", 13))
        if (hasMilestone("pe10", 0)) m = m.div(2.5)
        if (getBuyableAmount("pe10", 11).gte(1)) m = m.div(buyableEffect("pe10", 11))
        if (hasUpgrade("pe11", 23)) m = m.div(upgradeEffect("pe11", 23))
        if (hasUpgrade("or11", 31)) m = m.div(upgradeEffect("or11", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("pe10", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.pe10.points.gte(1)) return 'Herbig-Haro Objects: best ' + format(player.pe10.best) }],
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
        11: { title: "Bowed Shocks",
              description: "Herbig-Haro Objects gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Bipolar Jets",
              description: "Herbig-Haro Objects gain is boosted by your unspent herbig-haro objects.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("pe10", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e16"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Knots HH-34",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("pe10", 12) },
              effect() { let ret = player["pe9"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe10", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 herbig-haro objects; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("pe10", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Perseus Arm layer: T Tauri Stars.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("pe10", 14) },
              onPurchase() { player["pe11"].unlocked = true } },
        21: { title: "Bowed Shocks Resonance",
              description: "Knots HH-34 is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe10", 15) } },
        22: { title: "Mach Cones Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("pe10", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your herbig-haro objects.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("pe10", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Herbig-Haro Objects gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("pe10", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("pe10", 23) },
              effect() { return buyableEffect("pe10", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("pe10", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 herbig-haro objects",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "Bipolar Jets Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " herbig-haro objects<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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

addLayer("sg6", {
    name: "Cosmic Rays",
    symbol: "CR",
    position: 2,
    row: 6,
    color: "#b388ff",
    resource: "cosmic rays",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("2.9297e11"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["sg5", 3, 2]],
    layerShown() { return player.sg6.unlocked || hasUpgrade("sg5", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg6", 13)) m = m.times(upgradeEffect("sg6", 13))
        if (hasMilestone("sg6", 0)) m = m.div(2.5)
        if (getBuyableAmount("sg6", 11).gte(1)) m = m.div(buyableEffect("sg6", 11))
        if (hasUpgrade("sg7", 23)) m = m.div(upgradeEffect("sg7", 23))
        if (hasUpgrade("pe7", 31)) m = m.div(upgradeEffect("pe7", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone("or8", 3)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("sg6", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.sg6.points.gte(1)) return 'Cosmic Rays: best ' + format(player.sg6.best) }],
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
        11: { title: "Fermi Acceleration",
              description: "Cosmic Rays gain ×2.",
              cost: new Decimal(1) },
        12: { title: "GeV Sea",
              description: "Cosmic Rays gain is boosted by your unspent cosmic rays.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("sg6", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e16"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Calorimeter Limits",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("sg6", 12) },
              effect() { let ret = player["sg5"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg6", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 cosmic rays; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("sg6", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Sagittarius Arm layer: Galactic Bulge.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("sg6", 14) },
              onPurchase() { player["sg7"].unlocked = true } },
        21: { title: "Fermi Acceleration Resonance",
              description: "Calorimeter Limits is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg6", 15) } },
        22: { title: "Ankle Features Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("sg6", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your cosmic rays.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("sg6", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Cosmic Rays gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("sg6", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("sg6", 23) },
              effect() { return buyableEffect("sg6", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("sg6", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 cosmic rays",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "GeV Sea Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " cosmic rays<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Ankle Features Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " cosmic rays<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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

addLayer("sg7", {
    name: "Galactic Bulge",
    symbol: "BU",
    position: 2,
    row: 7,
    color: "#b388ff",
    resource: "galactic bulge",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("7.3242e12"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["sg6", 3, 2]],
    layerShown() { return player.sg7.unlocked || hasUpgrade("sg6", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg7", 13)) m = m.times(upgradeEffect("sg7", 13))
        if (hasMilestone("sg7", 0)) m = m.div(2.5)
        if (getBuyableAmount("sg7", 11).gte(1)) m = m.div(buyableEffect("sg7", 11))
        if (hasUpgrade("sg8", 23)) m = m.div(upgradeEffect("sg8", 23))
        if (hasUpgrade("pe8", 31)) m = m.div(upgradeEffect("pe8", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone("or8", 3)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("sg7", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.sg7.points.gte(1)) return 'Galactic Bulge: best ' + format(player.sg7.best) }],
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
        11: { title: "Boxy Peanut",
              description: "Galactic Bulge gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Metal-Rich Elders",
              description: "Galactic Bulge gain is boosted by your unspent galactic bulge.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("sg7", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e16"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Bulge Microlensing",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("sg7", 12) },
              effect() { let ret = player["sg6"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg7", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 galactic bulge; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("sg7", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Sagittarius Arm layer: Stellar Halo.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("sg7", 14) },
              onPurchase() { player["sg8"].unlocked = true } },
        21: { title: "Boxy Peanut Resonance",
              description: "Bulge Microlensing is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg7", 15) } },
        22: { title: "Central Concentration Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("sg7", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your galactic bulge.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("sg7", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Galactic Bulge gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("sg7", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("sg7", 23) },
              effect() { return buyableEffect("sg7", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("sg7", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 galactic bulge",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "Metal-Rich Elders Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " galactic bulge<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Central Concentration Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " galactic bulge<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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

addLayer("sg8", {
    name: "Stellar Halo",
    symbol: "SH",
    position: 2,
    row: 8,
    color: "#b388ff",
    resource: "stellar halo",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.8311e14"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["sg7", 3, 2]],
    layerShown() { return player.sg8.unlocked || hasUpgrade("sg7", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg8", 13)) m = m.times(upgradeEffect("sg8", 13))
        if (hasMilestone("sg8", 0)) m = m.div(2.5)
        if (getBuyableAmount("sg8", 11).gte(1)) m = m.div(buyableEffect("sg8", 11))
        if (hasUpgrade("sg9", 23)) m = m.div(upgradeEffect("sg9", 23))
        if (hasUpgrade("pe9", 31)) m = m.div(upgradeEffect("pe9", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone("or8", 3)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("sg8", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.sg8.points.gte(1)) return 'Stellar Halo: best ' + format(player.sg8.best) }],
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
        11: { title: "Ruining Orbits",
              description: "Stellar Halo gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Field Subgiants",
              description: "Stellar Halo gain is boosted by your unspent stellar halo.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("sg8", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e16"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Accreted Relics",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("sg8", 12) },
              effect() { let ret = player["sg7"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg8", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 stellar halo; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("sg8", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Sagittarius Arm layer: Thick Disc.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("sg8", 14) },
              onPurchase() { player["sg9"].unlocked = true } },
        21: { title: "Ruining Orbits Resonance",
              description: "Accreted Relics is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg8", 15) } },
        22: { title: "Sagittarius Wrapping Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("sg8", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your stellar halo.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("sg8", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Stellar Halo gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("sg8", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("sg8", 23) },
              effect() { return buyableEffect("sg8", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("sg8", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 stellar halo",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "Field Subgiants Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " stellar halo<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Sagittarius Wrapping Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " stellar halo<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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

addLayer("sg9", {
    name: "Thick Disc",
    symbol: "TD",
    position: 2,
    row: 9,
    color: "#b388ff",
    resource: "thick disc",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("4.5776e15"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["sg8", 3, 2]],
    layerShown() { return player.sg9.unlocked || hasUpgrade("sg8", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg9", 13)) m = m.times(upgradeEffect("sg9", 13))
        if (hasMilestone("sg9", 0)) m = m.div(2.5)
        if (getBuyableAmount("sg9", 11).gte(1)) m = m.div(buyableEffect("sg9", 11))
        if (hasUpgrade("sg10", 23)) m = m.div(upgradeEffect("sg10", 23))
        if (hasUpgrade("pe10", 31)) m = m.div(upgradeEffect("pe10", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone("or8", 3)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("sg9", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.sg9.points.gte(1)) return 'Thick Disc: best ' + format(player.sg9.best) }],
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
        11: { title: "Alpha-Enriched",
              description: "Thick Disc gain ×2.",
              cost: new Decimal(1) },
        12: { title: "High Vertical Velocity",
              description: "Thick Disc gain is boosted by your unspent thick disc.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("sg9", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e16"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Old Populations",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("sg9", 12) },
              effect() { let ret = player["sg8"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg9", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 thick disc; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("sg9", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Sagittarius Arm layer: Thin Disc.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("sg9", 14) },
              onPurchase() { player["sg10"].unlocked = true } },
        21: { title: "Alpha-Enriched Resonance",
              description: "Old Populations is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg9", 15) } },
        22: { title: "Chemical Bimodality Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("sg9", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your thick disc.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("sg9", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Thick Disc gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("sg9", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("sg9", 23) },
              effect() { return buyableEffect("sg9", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("sg9", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 thick disc",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "High Vertical Velocity Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " thick disc<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Chemical Bimodality Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " thick disc<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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

addLayer("sg10", {
    name: "Thin Disc",
    symbol: "TN",
    position: 2,
    row: 10,
    color: "#b388ff",
    resource: "thin disc",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.1444e17"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["sg9", 3, 2]],
    layerShown() { return player.sg10.unlocked || hasUpgrade("sg9", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg10", 13)) m = m.times(upgradeEffect("sg10", 13))
        if (hasMilestone("sg10", 0)) m = m.div(2.5)
        if (getBuyableAmount("sg10", 11).gte(1)) m = m.div(buyableEffect("sg10", 11))
        if (hasUpgrade("sg11", 23)) m = m.div(upgradeEffect("sg11", 23))
        if (hasUpgrade("pe11", 31)) m = m.div(upgradeEffect("pe11", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone("or8", 3)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("sg10", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.sg10.points.gte(1)) return 'Thin Disc: best ' + format(player.sg10.best) }],
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
        11: { title: "Scale Height",
              description: "Thin Disc gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Young Plateau",
              description: "Thin Disc gain is boosted by your unspent thin disc.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("sg10", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e16"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Spiral residence",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("sg10", 12) },
              effect() { let ret = player["sg9"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg10", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 thin disc; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("sg10", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Sagittarius Arm layer: Central Molecular Zone.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("sg10", 14) },
              onPurchase() { player["sg11"].unlocked = true } },
        21: { title: "Scale Height Resonance",
              description: "Spiral residence is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg10", 15) } },
        22: { title: "Metallicity Gradient Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("sg10", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your thin disc.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("sg10", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Thin Disc gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("sg10", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("sg10", 23) },
              effect() { return buyableEffect("sg10", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("sg10", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 thin disc",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "Young Plateau Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " thin disc<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Metallicity Gradient Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " thin disc<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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

addLayer("oa6", {
    name: "Supernova Trials",
    symbol: "ST",
    position: 3,
    row: 6,
    color: "#ff8a80",
    resource: "trial records",
    type: "none",
    branches: [["oa5", 1, 2]],
    layerShown() { return player.oa6.unlocked || hasUpgrade("oa5", 15) },
    startData() { return {
        unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0),
        maxpoints: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
    } },
    tabFormat: [
        "main-display",
        ["display-text", function() { return 'Enter a trial: your stardust resets, handicaps apply, and your BEST stardust inside becomes a permanent multiplier.' }],
        ["blank", "12px"],
        "challenges",
    ],
    challenges: {
        11: { name: "Bare Core",
            challengeDescription() { return "All arm-lane multipliers are fourth-rooted.<br>Best stardust inside: " + format(player.oa6.maxpoints[0]) + "<br>" + challengeCompletions(this.layer, this.id) + "/3 completions" },
            goalDescription() { return "Reach " + format(Decimal.pow(1e3, 3 + 2 * challengeCompletions(this.layer, this.id)).times(1e10)) + " stardust inside" },
            canComplete() { return player.points.gte(Decimal.pow(1e3, 3 + 2 * challengeCompletions(this.layer, this.id)).times(1e10)) },
            rewardDescription() { return "Reward: stardust gain, scaling with your best score" },
            rewardEffect() { return player.oa6.maxpoints[0].add(1).log(10).plus(1).pow(2) },
            rewardDisplay() { return "×" + format(this.rewardEffect()) },
            completionLimit: 3,
            unlocked() { return player.oa6.best.gte(1) },
        },
        12: { name: "Stifled Winds",
            challengeDescription() { return "Stardust gain is completely frozen.<br>Best stardust inside: " + format(player.oa6.maxpoints[1]) + "<br>" + challengeCompletions(this.layer, this.id) + "/3 completions" },
            goalDescription() { return "Reach " + format(Decimal.pow(1e3, 4 + 2 * challengeCompletions(this.layer, this.id)).times(1e10)) + " stardust inside" },
            canComplete() { return player.points.gte(Decimal.pow(1e3, 4 + 2 * challengeCompletions(this.layer, this.id)).times(1e10)) },
            rewardDescription() { return "Reward: gas clouds gain, scaling with your best score" },
            rewardEffect() { return player.oa6.maxpoints[1].add(1).log(10).plus(1).pow(2) },
            rewardDisplay() { return "×" + format(this.rewardEffect()) },
            completionLimit: 3,
            unlocked() { return player.oa6.best.gte(1) },
        },
        13: { name: "Milestone Drought",
            challengeDescription() { return "All passive milestone production is offline.<br>Best stardust inside: " + format(player.oa6.maxpoints[2]) + "<br>" + challengeCompletions(this.layer, this.id) + "/3 completions" },
            goalDescription() { return "Reach " + format(Decimal.pow(1e3, 5 + 2 * challengeCompletions(this.layer, this.id)).times(1e10)) + " stardust inside" },
            canComplete() { return player.points.gte(Decimal.pow(1e3, 5 + 2 * challengeCompletions(this.layer, this.id)).times(1e10)) },
            rewardDescription() { return "Reward: all four arms gain, scaling with your best score" },
            rewardEffect() { return player.oa6.maxpoints[2].add(1).log(10).plus(1).pow(2) },
            rewardDisplay() { return "×" + format(this.rewardEffect()) },
            completionLimit: 3,
            unlocked() { return player.oa6.best.gte(1) },
        },
        14: { name: "Root of Ruin",
            challengeDescription() { return "Arm-lane multipliers are rooted — harder.<br>Best stardust inside: " + format(player.oa6.maxpoints[3]) + "<br>" + challengeCompletions(this.layer, this.id) + "/3 completions" },
            goalDescription() { return "Reach " + format(Decimal.pow(1e3, 6 + 2 * challengeCompletions(this.layer, this.id)).times(1e10)) + " stardust inside" },
            canComplete() { return player.points.gte(Decimal.pow(1e3, 6 + 2 * challengeCompletions(this.layer, this.id)).times(1e10)) },
            rewardDescription() { return "Reward: heavy elements gain, scaling with your best score" },
            rewardEffect() { return player.oa6.maxpoints[3].add(1).log(10).plus(1).pow(2) },
            rewardDisplay() { return "×" + format(this.rewardEffect()) },
            completionLimit: 3,
            unlocked() { return player.oa6.best.gte(1) },
        },
        21: { name: "Cold Fusion",
            challengeDescription() { return "Stardust gain is completely frozen.<br>Best stardust inside: " + format(player.oa6.maxpoints[4]) + "<br>" + challengeCompletions(this.layer, this.id) + "/3 completions" },
            goalDescription() { return "Reach " + format(Decimal.pow(1e3, 7 + 2 * challengeCompletions(this.layer, this.id)).times(1e10)) + " stardust inside" },
            canComplete() { return player.points.gte(Decimal.pow(1e3, 7 + 2 * challengeCompletions(this.layer, this.id)).times(1e10)) },
            rewardDescription() { return "Reward: dark matter gain, scaling with your best score" },
            rewardEffect() { return player.oa6.maxpoints[4].add(1).log(10).plus(1).pow(2) },
            rewardDisplay() { return "×" + format(this.rewardEffect()) },
            completionLimit: 3,
            unlocked() { return player.oa6.best.gte(1) },
        },
        22: { name: "Vacuum Squeeze",
            challengeDescription() { return "Stardust gain is completely frozen.<br>Best stardust inside: " + format(player.oa6.maxpoints[5]) + "<br>" + challengeCompletions(this.layer, this.id) + "/3 completions" },
            goalDescription() { return "Reach " + format(Decimal.pow(1e3, 8 + 2 * challengeCompletions(this.layer, this.id)).times(1e10)) + " stardust inside" },
            canComplete() { return player.points.gte(Decimal.pow(1e3, 8 + 2 * challengeCompletions(this.layer, this.id)).times(1e10)) },
            rewardDescription() { return "Reward: core trio gain, scaling with your best score" },
            rewardEffect() { return player.oa6.maxpoints[5].add(1).log(10).plus(1).pow(2) },
            rewardDisplay() { return "×" + format(this.rewardEffect()) },
            completionLimit: 3,
            unlocked() { return player.oa6.best.gte(1) },
        },
        23: { name: "Frozen Fountains",
            challengeDescription() { return "All passive milestone production is offline.<br>Best stardust inside: " + format(player.oa6.maxpoints[6]) + "<br>" + challengeCompletions(this.layer, this.id) + "/3 completions" },
            goalDescription() { return "Reach " + format(Decimal.pow(1e3, 9 + 2 * challengeCompletions(this.layer, this.id)).times(1e10)) + " stardust inside" },
            canComplete() { return player.points.gte(Decimal.pow(1e3, 9 + 2 * challengeCompletions(this.layer, this.id)).times(1e10)) },
            rewardDescription() { return "Reward: galactic cores gain, scaling with your best score" },
            rewardEffect() { return player.oa6.maxpoints[6].add(1).log(10).plus(1).pow(2) },
            rewardDisplay() { return "×" + format(this.rewardEffect()) },
            completionLimit: 3,
            unlocked() { return player.oa6.best.gte(1) },
        },
        24: { name: "Silence of the Stars",
            challengeDescription() { return "All passive milestone production is offline.<br>Best stardust inside: " + format(player.oa6.maxpoints[7]) + "<br>" + challengeCompletions(this.layer, this.id) + "/3 completions" },
            goalDescription() { return "Reach " + format(Decimal.pow(1e3, 10 + 2 * challengeCompletions(this.layer, this.id)).times(1e10)) + " stardust inside" },
            canComplete() { return player.points.gte(Decimal.pow(1e3, 10 + 2 * challengeCompletions(this.layer, this.id)).times(1e10)) },
            rewardDescription() { return "Reward: vacuum energy gain, scaling with your best score" },
            rewardEffect() { return player.oa6.maxpoints[7].add(1).log(10).plus(1).pow(2) },
            rewardDisplay() { return "×" + format(this.rewardEffect()) },
            completionLimit: 3,
            unlocked() { return player.oa6.best.gte(1) },
        },
    },
    update(diff) {
        const ids = ["11", "12", "13", "14", "21", "22", "23", "24"]
        for (let i = 0; i < ids.length; i++) {
            if (inChallenge("oa6", ids[i])) {
                player.oa6.maxpoints[i] = player.oa6.maxpoints[i].max(player.points)
            }
        }
        player.oa6.best = player.oa6.best.max(player.points)
    },
    resetsNothing() { return true },
})

addLayer("oa7", {
    name: "Gamma-Ray Bursts",
    symbol: "GB",
    position: 3,
    row: 7,
    color: "#ff8a80",
    resource: "gamma-ray bursts",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.8311e13"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["oa6", 1, 2]],
    layerShown() { return player.oa7.unlocked || hasUpgrade("oa6", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa7", 13)) m = m.times(upgradeEffect("oa7", 13))
        if (hasMilestone("oa7", 0)) m = m.div(2.5)
        if (getBuyableAmount("oa7", 11).gte(1)) m = m.div(buyableEffect("oa7", 11))
        if (hasUpgrade("oa8", 23)) m = m.div(upgradeEffect("oa8", 23))
        if (hasUpgrade("sg8", 31)) m = m.div(upgradeEffect("sg8", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone("or8", 3)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("oa7", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.oa7.points.gte(1)) return 'Gamma-Ray Bursts: best ' + format(player.oa7.best) }],
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
        11: { title: "Collapsar Jets",
              description: "Gamma-Ray Bursts gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Afterglow Tails",
              description: "Gamma-Ray Bursts gain is boosted by your unspent gamma-ray bursts.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("oa7", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e16")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e16e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Isotropic Equivalent",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("oa7", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa6"].points.gte(100)) ret = ret.times(5)
                  if (player["oa6"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa7", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 gamma-ray bursts; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("oa7", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Outer Arm layer: Kilonovae.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("oa7", 14) },
              onPurchase() { player["oa8"].unlocked = true } },
        21: { title: "Collapsar Jets Resonance",
              description: "Isotropic Equivalent is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa7", 15) } },
        22: { title: "Prompt Spike Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("oa7", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your gamma-ray bursts.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("oa7", 15) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Gamma-Ray Bursts gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("oa7", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("oa7", 23) },
              effect() { return buyableEffect("oa7", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("oa7", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 gamma-ray bursts",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "Afterglow Tails Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " gamma-ray bursts<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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

addLayer("oa8", {
    name: "Kilonovae",
    symbol: "KN",
    position: 3,
    row: 8,
    color: "#ff8a80",
    resource: "kilonovae",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("4.5776e14"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["oa7", 1, 2]],
    layerShown() { return player.oa8.unlocked || hasUpgrade("oa7", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa8", 13)) m = m.times(upgradeEffect("oa8", 13))
        if (hasMilestone("oa8", 0)) m = m.div(2.5)
        if (getBuyableAmount("oa8", 11).gte(1)) m = m.div(buyableEffect("oa8", 11))
        if (hasUpgrade("oa9", 23)) m = m.div(upgradeEffect("oa9", 23))
        if (hasUpgrade("sg9", 31)) m = m.div(upgradeEffect("sg9", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone("or8", 3)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("oa8", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.oa8.points.gte(1)) return 'Kilonovae: best ' + format(player.oa8.best) }],
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
        11: { title: "r-Process Forge",
              description: "Kilonovae gain ×2.",
              cost: new Decimal(1) },
        12: { title: "AT 2017gfo",
              description: "Kilonovae gain is boosted by your unspent kilonovae.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("oa8", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e16")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e16e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Red and Blue Components",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("oa8", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa7"].points.gte(100)) ret = ret.times(5)
                  if (player["oa7"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa8", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 kilonovae; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("oa8", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Outer Arm layer: Fast Radio Bursts.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("oa8", 14) },
              onPurchase() { player["oa9"].unlocked = true } },
        21: { title: "r-Process Forge Resonance",
              description: "Red and Blue Components is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa8", 15) } },
        22: { title: "Lanthanide Blankets Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("oa8", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your kilonovae.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("oa8", 15) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Kilonovae gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("oa8", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("oa8", 23) },
              effect() { return buyableEffect("oa8", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("oa8", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 kilonovae",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "AT 2017gfo Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " kilonovae<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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

addLayer("oa9", {
    name: "Fast Radio Bursts",
    symbol: "FR",
    position: 3,
    row: 9,
    color: "#ff8a80",
    resource: "fast radio bursts",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.1444e16"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["oa8", 1, 2]],
    layerShown() { return player.oa9.unlocked || hasUpgrade("oa8", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa9", 13)) m = m.times(upgradeEffect("oa9", 13))
        if (hasMilestone("oa9", 0)) m = m.div(2.5)
        if (getBuyableAmount("oa9", 11).gte(1)) m = m.div(buyableEffect("oa9", 11))
        if (hasUpgrade("oa10", 23)) m = m.div(upgradeEffect("oa10", 23))
        if (hasUpgrade("sg10", 31)) m = m.div(upgradeEffect("sg10", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone("or8", 3)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("oa9", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.oa9.points.gte(1)) return 'Fast Radio Bursts: best ' + format(player.oa9.best) }],
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
        11: { title: "Dispersion Measures",
              description: "Fast Radio Bursts gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Repeating Sources",
              description: "Fast Radio Bursts gain is boosted by your unspent fast radio bursts.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("oa9", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e16")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e16e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "FRB 121102",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("oa9", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa8"].points.gte(100)) ret = ret.times(5)
                  if (player["oa8"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa9", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 fast radio bursts; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("oa9", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Outer Arm layer: Tidal Disruption Events.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("oa9", 14) },
              onPurchase() { player["oa10"].unlocked = true } },
        21: { title: "Dispersion Measures Resonance",
              description: "FRB 121102 is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa9", 15) } },
        22: { title: "Parkes Detections Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("oa9", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your fast radio bursts.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("oa9", 15) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Fast Radio Bursts gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("oa9", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("oa9", 23) },
              effect() { return buyableEffect("oa9", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("oa9", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 fast radio bursts",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "Repeating Sources Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " fast radio bursts<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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

addLayer("oa10", {
    name: "Tidal Disruption Events",
    symbol: "TD",
    position: 3,
    row: 10,
    color: "#ff8a80",
    resource: "tidal disruption events",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("2.861e17"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    branches: [["oa9", 1, 2]],
    layerShown() { return player.oa10.unlocked || hasUpgrade("oa9", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa10", 13)) m = m.times(upgradeEffect("oa10", 13))
        if (hasMilestone("oa10", 0)) m = m.div(2.5)
        if (getBuyableAmount("oa10", 11).gte(1)) m = m.div(buyableEffect("oa10", 11))
        if (hasUpgrade("oa11", 23)) m = m.div(upgradeEffect("oa11", 23))
        if (hasUpgrade("sg11", 31)) m = m.div(upgradeEffect("sg11", 31))
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone("or8", 3)) return true },
    passiveGeneration() { if (hasMilestone("or8", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("or8", 3)) return true },
    resetsNothing() { if (hasMilestone("or8", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (player.mw.unlocked && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones"]
        if (hasMilestone("oa10", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (player.oa10.points.gte(1)) return 'Tidal Disruption Events: best ' + format(player.oa10.best) }],
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
        11: { title: "Spaghettification Light",
              description: "Tidal Disruption Events gain ×2.",
              cost: new Decimal(1) },
        12: { title: "ASASSN-14li",
              description: "Tidal Disruption Events gain is boosted by your unspent tidal disruption events.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("oa10", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e16")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e16e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Fallback Rates",
              description: "The previous structure feeds this one.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("oa10", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa9"].points.gte(100)) ret = ret.times(5)
                  if (player["oa9"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa10", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 tidal disruption events; ×5 more at 1e4.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("oa10", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Unlock the next Outer Arm layer: Microquasars.",
              cost: new Decimal(6),
              unlocked() { return hasUpgrade("oa10", 14) },
              onPurchase() { player["oa11"].unlocked = true } },
        21: { title: "Spaghettification Light Resonance",
              description: "Fallback Rates is raised to ^1.1.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa10", 15) } },
        22: { title: "Super-Eddington Flares Overflow",
              description: "Stardust gain ×4.",
              cost: new Decimal(3),
              unlocked() { return hasUpgrade("oa10", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your tidal disruption events.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("oa10", 15) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Tidal Disruption Events gain softcap starts 1,000× later.",
              cost: new Decimal(12),
              unlocked() { return hasUpgrade("oa10", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(15),
              unlocked() { return hasUpgrade("oa10", 23) },
              effect() { return buyableEffect("oa10", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(20),
              unlocked() { return hasUpgrade("oa10", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 tidal disruption events",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].points.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].points.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].points.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].points.gte(15) } },
    },
    buyables: {
        11: { title: "ASASSN-14li Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " tidal disruption events<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
