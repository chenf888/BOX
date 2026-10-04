addLayer("or11", {
    name: "Black Holes",
    symbol: "BH",
    position: 0,
    row: 11,
    color: "#ffd162",
    resource: "black holes",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.7852e15"),
    type: "normal",
    exponent: 0.25,
    branches: [["or10", 1, 2]],
    layerShown() { return player.or11.unlocked || hasUpgrade("or10", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "l", description: "l: reset for black holes",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or11", 11)) m = m.times(2)
        if (hasUpgrade("or11", 12)) m = m.times(upgradeEffect("or11", 12))
        if (hasUpgrade("or11", 13)) m = m.times(upgradeEffect("or11", 13))
        if (hasUpgrade("or11", 14)) m = m.times(upgradeEffect("or11", 14))
        if (hasUpgrade("or11", 15)) m = m.times(3)
        if (hasUpgrade("or11", 25)) m = m.times(upgradeEffect("or11", 25))
        if (hasMilestone("or11", 0)) m = m.times(2.5)
        if (getBuyableAmount("or11", 11).gte(1)) m = m.times(buyableEffect("or11", 11))
        if (hasUpgrade("or12", 23)) m = m.times(upgradeEffect("or12", 23))
        if (hasUpgrade("oa12", 31)) m = m.times(upgradeEffect("oa12", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("or11", 24)) c = c.times(1e3)
        if (hasMilestone("or11", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("or11", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.or12.unlocked) return 'Next in the survey: <b>X-ray Binaries</b> — opens at ' + format(tmp.or12.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.or11.points.gte(1)) return 'Black Holes: best ' + format(player.or11.best) }],
        ["display-text", function() { if (player.or11.points.gte(tmp.or11.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.or11.softcap) + ' black holes' }],
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
        11: { title: "Event Horizons",
              description: "Black Holes gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Hawking Whispers",
              description: "Black Holes gain is boosted by your unspent black holes.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or11", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e30"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Tidal Spaghettification",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("or11", 12) },
              effect() { let ret = player["or10"].points.add(1).pow(0.4)
                  if (hasUpgrade("or11", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 black holes; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("or11", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Black Holes gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("or11", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Event Horizons Resonance",
              description: "Tidal Spaghettification is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("or11", 15) } },
        22: { title: "Shadow of M87 Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("or11", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your black holes.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("or11", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Black Holes gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("or11", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("or11", 23) },
              effect() { return buyableEffect("or11", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("or11", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Black Holes gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["or11"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["or11"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["or11"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["or11"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Hawking Whispers Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " black holes<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Shadow of M87 Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " black holes<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.or11.unlocked && player.points.gte(tmp.or11.requires)) {
            player.or11.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("or11", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.or11.points = player.or11.points.add(tmp.or11.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("or12", {
    name: "X-ray Binaries",
    symbol: "XB",
    position: 0,
    row: 12,
    color: "#ffd162",
    resource: "x-ray binaries",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("3.2134e16"),
    type: "normal",
    exponent: 0.25,
    branches: [["or11", 1, 2]],
    layerShown() { return player.or12.unlocked || hasUpgrade("or11", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "m", description: "m: reset for x-ray binaries",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or12", 11)) m = m.times(2)
        if (hasUpgrade("or12", 12)) m = m.times(upgradeEffect("or12", 12))
        if (hasUpgrade("or12", 13)) m = m.times(upgradeEffect("or12", 13))
        if (hasUpgrade("or12", 14)) m = m.times(upgradeEffect("or12", 14))
        if (hasUpgrade("or12", 15)) m = m.times(3)
        if (hasUpgrade("or12", 25)) m = m.times(upgradeEffect("or12", 25))
        if (hasMilestone("or12", 0)) m = m.times(2.5)
        if (getBuyableAmount("or12", 11).gte(1)) m = m.times(buyableEffect("or12", 11))
        if (hasUpgrade("or13", 23)) m = m.times(upgradeEffect("or13", 23))
        if (hasUpgrade("oa13", 31)) m = m.times(upgradeEffect("oa13", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("or12", 24)) c = c.times(1e3)
        if (hasMilestone("or12", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("or12", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.or13.unlocked) return 'Next in the survey: <b>Brown Dwarfs</b> — opens at ' + format(tmp.or13.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.or12.points.gte(1)) return 'X-ray Binaries: best ' + format(player.or12.best) }],
        ["display-text", function() { if (player.or12.points.gte(tmp.or12.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.or12.softcap) + ' x-ray binaries' }],
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
        11: { title: "Roche Overflow",
              description: "X-ray Binaries gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Accretion Disks",
              description: "X-ray Binaries gain is boosted by your unspent x-ray binaries.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or12", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e30"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Cyclotron Lines",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("or12", 12) },
              effect() { let ret = player["or11"].points.add(1).pow(0.4)
                  if (hasUpgrade("or12", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 x-ray binaries; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("or12", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "X-ray Binaries gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("or12", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Roche Overflow Resonance",
              description: "Cyclotron Lines is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("or12", 15) } },
        22: { title: "Hard State Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("or12", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your x-ray binaries.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("or12", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "X-ray Binaries gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("or12", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("or12", 23) },
              effect() { return buyableEffect("or12", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("or12", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "X-ray Binaries gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["or12"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["or12"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["or12"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["or12"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Accretion Disks Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " x-ray binaries<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Hard State Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " x-ray binaries<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.or12.unlocked && player.points.gte(tmp.or12.requires)) {
            player.or12.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("or12", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.or12.points = player.or12.points.add(tmp.or12.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("or13", {
    name: "Brown Dwarfs",
    symbol: "BD",
    position: 0,
    row: 13,
    color: "#ffd162",
    resource: "brown dwarfs",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("5.7842e17"),
    type: "normal",
    exponent: 0.25,
    branches: [["or12", 1, 2]],
    layerShown() { return player.or13.unlocked || hasUpgrade("or12", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "n", description: "n: reset for brown dwarfs",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or13", 11)) m = m.times(2)
        if (hasUpgrade("or13", 12)) m = m.times(upgradeEffect("or13", 12))
        if (hasUpgrade("or13", 13)) m = m.times(upgradeEffect("or13", 13))
        if (hasUpgrade("or13", 14)) m = m.times(upgradeEffect("or13", 14))
        if (hasUpgrade("or13", 15)) m = m.times(3)
        if (hasUpgrade("or13", 25)) m = m.times(upgradeEffect("or13", 25))
        if (hasMilestone("or13", 0)) m = m.times(2.5)
        if (getBuyableAmount("or13", 11).gte(1)) m = m.times(buyableEffect("or13", 11))
        if (hasUpgrade("or14", 23)) m = m.times(upgradeEffect("or14", 23))
        if (hasUpgrade("oa14", 31)) m = m.times(upgradeEffect("oa14", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("or13", 24)) c = c.times(1e3)
        if (hasMilestone("or13", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("or13", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.or14.unlocked) return 'Next in the survey: <b>Hypergiants</b> — opens at ' + format(tmp.or14.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.or13.points.gte(1)) return 'Brown Dwarfs: best ' + format(player.or13.best) }],
        ["display-text", function() { if (player.or13.points.gte(tmp.or13.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.or13.softcap) + ' brown dwarfs' }],
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
        11: { title: "Lithium Test",
              description: "Brown Dwarfs gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Methane Dwarfs",
              description: "Brown Dwarfs gain is boosted by your unspent brown dwarfs.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or13", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e30"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Substellar Bridge",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("or13", 12) },
              effect() { let ret = player["or12"].points.add(1).pow(0.4)
                  if (hasUpgrade("or13", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 brown dwarfs; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("or13", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Brown Dwarfs gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("or13", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Lithium Test Resonance",
              description: "Substellar Bridge is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("or13", 15) } },
        22: { title: "2MASS survey Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("or13", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your brown dwarfs.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("or13", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Brown Dwarfs gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("or13", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("or13", 23) },
              effect() { return buyableEffect("or13", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("or13", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Brown Dwarfs gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["or13"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["or13"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["or13"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["or13"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Methane Dwarfs Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " brown dwarfs<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "2MASS survey Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " brown dwarfs<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.or13.unlocked && player.points.gte(tmp.or13.requires)) {
            player.or13.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("or13", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.or13.points = player.or13.points.add(tmp.or13.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("or14", {
    name: "Hypergiants",
    symbol: "HG",
    position: 0,
    row: 14,
    color: "#ffd162",
    resource: "hypergiants",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.0411e19"),
    type: "normal",
    exponent: 0.25,
    branches: [["or13", 1, 2]],
    layerShown() { return player.or14.unlocked || hasUpgrade("or13", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "o", description: "o: reset for hypergiants",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or14", 11)) m = m.times(2)
        if (hasUpgrade("or14", 12)) m = m.times(upgradeEffect("or14", 12))
        if (hasUpgrade("or14", 13)) m = m.times(upgradeEffect("or14", 13))
        if (hasUpgrade("or14", 14)) m = m.times(upgradeEffect("or14", 14))
        if (hasUpgrade("or14", 15)) m = m.times(3)
        if (hasUpgrade("or14", 25)) m = m.times(upgradeEffect("or14", 25))
        if (hasMilestone("or14", 0)) m = m.times(2.5)
        if (getBuyableAmount("or14", 11).gte(1)) m = m.times(buyableEffect("or14", 11))
        if (hasUpgrade("or15", 23)) m = m.times(upgradeEffect("or15", 23))
        if (hasUpgrade("oa15", 31)) m = m.times(upgradeEffect("oa15", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("or14", 24)) c = c.times(1e3)
        if (hasMilestone("or14", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("or14", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.or15.unlocked) return 'Next in the survey: <b>Wolf-Rayet Stars</b> — opens at ' + format(tmp.or15.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.or14.points.gte(1)) return 'Hypergiants: best ' + format(player.or14.best) }],
        ["display-text", function() { if (player.or14.points.gte(tmp.or14.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.or14.softcap) + ' hypergiants' }],
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
        11: { title: "Eta Carinae",
              description: "Hypergiants gain ×2.",
              cost: new Decimal(1) },
        12: { title: "P Cygni Profiles",
              description: "Hypergiants gain is boosted by your unspent hypergiants.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or14", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e30"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Pseudo-photospheres",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("or14", 12) },
              effect() { let ret = player["or13"].points.add(1).pow(0.4)
                  if (hasUpgrade("or14", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 hypergiants; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("or14", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Hypergiants gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("or14", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Eta Carinae Resonance",
              description: "Pseudo-photospheres is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("or14", 15) } },
        22: { title: "Humason-Zwicky Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("or14", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your hypergiants.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("or14", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Hypergiants gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("or14", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("or14", 23) },
              effect() { return buyableEffect("or14", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("or14", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Hypergiants gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["or14"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["or14"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["or14"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["or14"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "P Cygni Profiles Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " hypergiants<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Humason-Zwicky Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " hypergiants<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.or14.unlocked && player.points.gte(tmp.or14.requires)) {
            player.or14.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("or14", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.or14.points = player.or14.points.add(tmp.or14.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("or15", {
    name: "Wolf-Rayet Stars",
    symbol: "WR",
    position: 0,
    row: 15,
    color: "#ffd162",
    resource: "wolf-rayet stars",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.8741e20"),
    type: "normal",
    exponent: 0.25,
    branches: [["or14", 1, 2]],
    layerShown() { return player.or15.unlocked || hasUpgrade("or14", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "p", description: "p: reset for wolf-rayet stars",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or15", 11)) m = m.times(2)
        if (hasUpgrade("or15", 12)) m = m.times(upgradeEffect("or15", 12))
        if (hasUpgrade("or15", 13)) m = m.times(upgradeEffect("or15", 13))
        if (hasUpgrade("or15", 14)) m = m.times(upgradeEffect("or15", 14))
        if (hasUpgrade("or15", 15)) m = m.times(3)
        if (hasUpgrade("or15", 25)) m = m.times(upgradeEffect("or15", 25))
        if (hasMilestone("or15", 0)) m = m.times(2.5)
        if (getBuyableAmount("or15", 11).gte(1)) m = m.times(buyableEffect("or15", 11))
        if (hasUpgrade("or16", 23)) m = m.times(upgradeEffect("or16", 23))
        if (hasUpgrade("oa16", 31)) m = m.times(upgradeEffect("oa16", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("or15", 24)) c = c.times(1e3)
        if (hasMilestone("or15", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("or15", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.or16.unlocked) return 'Next in the survey: <b>Cepheid Variables</b> — opens at ' + format(tmp.or16.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.or15.points.gte(1)) return 'Wolf-Rayet Stars: best ' + format(player.or15.best) }],
        ["display-text", function() { if (player.or15.points.gte(tmp.or15.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.or15.softcap) + ' wolf-rayet stars' }],
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
        11: { title: "Stripped Envelopes",
              description: "Wolf-Rayet Stars gain ×2.",
              cost: new Decimal(1) },
        12: { title: "WN Subtypes",
              description: "Wolf-Rayet Stars gain is boosted by your unspent wolf-rayet stars.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or15", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e30"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Clumped Winds",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("or15", 12) },
              effect() { let ret = player["or14"].points.add(1).pow(0.4)
                  if (hasUpgrade("or15", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 wolf-rayet stars; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("or15", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Wolf-Rayet Stars gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("or15", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Stripped Envelopes Resonance",
              description: "Clumped Winds is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("or15", 15) } },
        22: { title: "Pre-Supernova Shells Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("or15", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your wolf-rayet stars.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("or15", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Wolf-Rayet Stars gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("or15", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("or15", 23) },
              effect() { return buyableEffect("or15", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("or15", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Wolf-Rayet Stars gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["or15"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["or15"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["or15"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["or15"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "WN Subtypes Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " wolf-rayet stars<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Pre-Supernova Shells Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " wolf-rayet stars<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.or15.unlocked && player.points.gte(tmp.or15.requires)) {
            player.or15.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("or15", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.or15.points = player.or15.points.add(tmp.or15.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("pe11", {
    name: "T Tauri Stars",
    symbol: "TT",
    position: 1,
    row: 11,
    color: "#6ec6ff",
    resource: "t tauri stars",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("4.4631e15"),
    type: "normal",
    exponent: 0.25,
    branches: [["pe10", 2, 2]],
    layerShown() { return player.pe11.unlocked || hasUpgrade("pe10", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "L", description: "Shift+L: reset for t tauri stars",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe11", 11)) m = m.times(2)
        if (hasUpgrade("pe11", 12)) m = m.times(upgradeEffect("pe11", 12))
        if (hasUpgrade("pe11", 13)) m = m.times(upgradeEffect("pe11", 13))
        if (hasUpgrade("pe11", 14)) m = m.times(upgradeEffect("pe11", 14))
        if (hasUpgrade("pe11", 15)) m = m.times(3)
        if (hasUpgrade("pe11", 25)) m = m.times(upgradeEffect("pe11", 25))
        if (hasMilestone("pe11", 0)) m = m.times(2.5)
        if (getBuyableAmount("pe11", 11).gte(1)) m = m.times(buyableEffect("pe11", 11))
        if (hasUpgrade("pe12", 23)) m = m.times(upgradeEffect("pe12", 23))
        if (hasUpgrade("or12", 31)) m = m.times(upgradeEffect("or12", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("pe11", 24)) c = c.times(1e3)
        if (hasMilestone("pe11", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("pe11", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.pe12.unlocked) return 'Next in the survey: <b>Dust Lanes</b> — opens at ' + format(tmp.pe12.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.pe11.points.gte(1)) return 'T Tauri Stars: best ' + format(player.pe11.best) }],
        ["display-text", function() { if (player.pe11.points.gte(tmp.pe11.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.pe11.softcap) + ' t tauri stars' }],
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
        11: { title: "Irregular Flicker",
              description: "T Tauri Stars gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Accretion Signatures",
              description: "T Tauri Stars gain is boosted by your unspent t tauri stars.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe11", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e30"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Weak-Lined Transition",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("pe11", 12) },
              effect() { let ret = player["pe10"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe11", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 t tauri stars; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("pe11", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "T Tauri Stars gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("pe11", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Irregular Flicker Resonance",
              description: "Weak-Lined Transition is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("pe11", 15) } },
        22: { title: "X-Wind Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("pe11", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your t tauri stars.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("pe11", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "T Tauri Stars gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("pe11", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("pe11", 23) },
              effect() { return buyableEffect("pe11", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("pe11", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "T Tauri Stars gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["pe11"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["pe11"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["pe11"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["pe11"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Accretion Signatures Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " t tauri stars<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "X-Wind Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " t tauri stars<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.pe11.unlocked && player.points.gte(tmp.pe11.requires)) {
            player.pe11.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("pe11", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.pe11.points = player.pe11.points.add(tmp.pe11.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("pe12", {
    name: "Dust Lanes",
    symbol: "DL",
    position: 1,
    row: 12,
    color: "#6ec6ff",
    resource: "dust lanes",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("8.0336e16"),
    type: "normal",
    exponent: 0.25,
    branches: [["pe11", 2, 2]],
    layerShown() { return player.pe12.unlocked || hasUpgrade("pe11", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "M", description: "Shift+M: reset for dust lanes",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe12", 11)) m = m.times(2)
        if (hasUpgrade("pe12", 12)) m = m.times(upgradeEffect("pe12", 12))
        if (hasUpgrade("pe12", 13)) m = m.times(upgradeEffect("pe12", 13))
        if (hasUpgrade("pe12", 14)) m = m.times(upgradeEffect("pe12", 14))
        if (hasUpgrade("pe12", 15)) m = m.times(3)
        if (hasUpgrade("pe12", 25)) m = m.times(upgradeEffect("pe12", 25))
        if (hasMilestone("pe12", 0)) m = m.times(2.5)
        if (getBuyableAmount("pe12", 11).gte(1)) m = m.times(buyableEffect("pe12", 11))
        if (hasUpgrade("pe13", 23)) m = m.times(upgradeEffect("pe13", 23))
        if (hasUpgrade("or13", 31)) m = m.times(upgradeEffect("or13", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("pe12", 24)) c = c.times(1e3)
        if (hasMilestone("pe12", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("pe12", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.pe13.unlocked) return 'Next in the survey: <b>Interstellar Medium</b> — opens at ' + format(tmp.pe13.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.pe12.points.gte(1)) return 'Dust Lanes: best ' + format(player.pe12.best) }],
        ["display-text", function() { if (player.pe12.points.gte(tmp.pe12.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.pe12.softcap) + ' dust lanes' }],
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
        11: { title: "Silicate Bands",
              description: "Dust Lanes gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Grain Alignment",
              description: "Dust Lanes gain is boosted by your unspent dust lanes.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe12", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e30"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Polarized Starlight",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("pe12", 12) },
              effect() { let ret = player["pe11"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe12", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 dust lanes; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("pe12", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Dust Lanes gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("pe12", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Silicate Bands Resonance",
              description: "Polarized Starlight is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("pe12", 15) } },
        22: { title: "Obscured Cores Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("pe12", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your dust lanes.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("pe12", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Dust Lanes gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("pe12", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("pe12", 23) },
              effect() { return buyableEffect("pe12", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("pe12", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Dust Lanes gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["pe12"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["pe12"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["pe12"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["pe12"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Grain Alignment Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " dust lanes<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Obscured Cores Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " dust lanes<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.pe12.unlocked && player.points.gte(tmp.pe12.requires)) {
            player.pe12.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("pe12", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.pe12.points = player.pe12.points.add(tmp.pe12.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("pe13", {
    name: "Interstellar Medium",
    symbol: "IM",
    position: 1,
    row: 13,
    color: "#6ec6ff",
    resource: "interstellar medium",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.446e18"),
    type: "normal",
    exponent: 0.25,
    branches: [["pe12", 2, 2]],
    layerShown() { return player.pe13.unlocked || hasUpgrade("pe12", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "N", description: "Shift+N: reset for interstellar medium",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe13", 11)) m = m.times(2)
        if (hasUpgrade("pe13", 12)) m = m.times(upgradeEffect("pe13", 12))
        if (hasUpgrade("pe13", 13)) m = m.times(upgradeEffect("pe13", 13))
        if (hasUpgrade("pe13", 14)) m = m.times(upgradeEffect("pe13", 14))
        if (hasUpgrade("pe13", 15)) m = m.times(3)
        if (hasUpgrade("pe13", 25)) m = m.times(upgradeEffect("pe13", 25))
        if (hasMilestone("pe13", 0)) m = m.times(2.5)
        if (getBuyableAmount("pe13", 11).gte(1)) m = m.times(buyableEffect("pe13", 11))
        if (hasUpgrade("pe14", 23)) m = m.times(upgradeEffect("pe14", 23))
        if (hasUpgrade("or14", 31)) m = m.times(upgradeEffect("or14", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("pe13", 24)) c = c.times(1e3)
        if (hasMilestone("pe13", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("pe13", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.pe14.unlocked) return 'Next in the survey: <b>Cosmic Dust</b> — opens at ' + format(tmp.pe14.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.pe13.points.gte(1)) return 'Interstellar Medium: best ' + format(player.pe13.best) }],
        ["display-text", function() { if (player.pe13.points.gte(tmp.pe13.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.pe13.softcap) + ' interstellar medium' }],
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
        11: { title: "Cold Neutral Medium",
              description: "Interstellar Medium gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Warm Clouds",
              description: "Interstellar Medium gain is boosted by your unspent interstellar medium.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe13", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e30"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Hot Fountains",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("pe13", 12) },
              effect() { let ret = player["pe12"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe13", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 interstellar medium; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("pe13", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Interstellar Medium gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("pe13", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Cold Neutral Medium Resonance",
              description: "Hot Fountains is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("pe13", 15) } },
        22: { title: "Pressure Balance Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("pe13", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your interstellar medium.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("pe13", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Interstellar Medium gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("pe13", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("pe13", 23) },
              effect() { return buyableEffect("pe13", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("pe13", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Interstellar Medium gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["pe13"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["pe13"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["pe13"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["pe13"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Warm Clouds Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " interstellar medium<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Pressure Balance Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " interstellar medium<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.pe13.unlocked && player.points.gte(tmp.pe13.requires)) {
            player.pe13.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("pe13", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.pe13.points = player.pe13.points.add(tmp.pe13.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("pe14", {
    name: "Cosmic Dust",
    symbol: "CD",
    position: 1,
    row: 14,
    color: "#6ec6ff",
    resource: "cosmic dust",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("2.6029e19"),
    type: "normal",
    exponent: 0.25,
    branches: [["pe13", 2, 2]],
    layerShown() { return player.pe14.unlocked || hasUpgrade("pe13", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "O", description: "Shift+O: reset for cosmic dust",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe14", 11)) m = m.times(2)
        if (hasUpgrade("pe14", 12)) m = m.times(upgradeEffect("pe14", 12))
        if (hasUpgrade("pe14", 13)) m = m.times(upgradeEffect("pe14", 13))
        if (hasUpgrade("pe14", 14)) m = m.times(upgradeEffect("pe14", 14))
        if (hasUpgrade("pe14", 15)) m = m.times(3)
        if (hasUpgrade("pe14", 25)) m = m.times(upgradeEffect("pe14", 25))
        if (hasMilestone("pe14", 0)) m = m.times(2.5)
        if (getBuyableAmount("pe14", 11).gte(1)) m = m.times(buyableEffect("pe14", 11))
        if (hasUpgrade("pe15", 23)) m = m.times(upgradeEffect("pe15", 23))
        if (hasUpgrade("or15", 31)) m = m.times(upgradeEffect("or15", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("pe14", 24)) c = c.times(1e3)
        if (hasMilestone("pe14", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("pe14", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.pe15.unlocked) return 'Next in the survey: <b>Ice Grains</b> — opens at ' + format(tmp.pe15.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.pe14.points.gte(1)) return 'Cosmic Dust: best ' + format(player.pe14.best) }],
        ["display-text", function() { if (player.pe14.points.gte(tmp.pe14.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.pe14.softcap) + ' cosmic dust' }],
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
        11: { title: "Grain Growth",
              description: "Cosmic Dust gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Coagulation Chains",
              description: "Cosmic Dust gain is boosted by your unspent cosmic dust.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe14", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e30"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Stardust Grains",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("pe14", 12) },
              effect() { let ret = player["pe13"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe14", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 cosmic dust; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("pe14", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Cosmic Dust gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("pe14", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Grain Growth Resonance",
              description: "Stardust Grains is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("pe14", 15) } },
        22: { title: "Reddened Lines of Sight Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("pe14", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your cosmic dust.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("pe14", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Cosmic Dust gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("pe14", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("pe14", 23) },
              effect() { return buyableEffect("pe14", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("pe14", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Cosmic Dust gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["pe14"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["pe14"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["pe14"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["pe14"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Coagulation Chains Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " cosmic dust<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Reddened Lines of Sight Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " cosmic dust<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.pe14.unlocked && player.points.gte(tmp.pe14.requires)) {
            player.pe14.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("pe14", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.pe14.points = player.pe14.points.add(tmp.pe14.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("pe15", {
    name: "Ice Grains",
    symbol: "IG",
    position: 1,
    row: 15,
    color: "#6ec6ff",
    resource: "ice grains",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("4.6852e20"),
    type: "normal",
    exponent: 0.25,
    branches: [["pe14", 2, 2]],
    layerShown() { return player.pe15.unlocked || hasUpgrade("pe14", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "P", description: "Shift+P: reset for ice grains",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe15", 11)) m = m.times(2)
        if (hasUpgrade("pe15", 12)) m = m.times(upgradeEffect("pe15", 12))
        if (hasUpgrade("pe15", 13)) m = m.times(upgradeEffect("pe15", 13))
        if (hasUpgrade("pe15", 14)) m = m.times(upgradeEffect("pe15", 14))
        if (hasUpgrade("pe15", 15)) m = m.times(3)
        if (hasUpgrade("pe15", 25)) m = m.times(upgradeEffect("pe15", 25))
        if (hasMilestone("pe15", 0)) m = m.times(2.5)
        if (getBuyableAmount("pe15", 11).gte(1)) m = m.times(buyableEffect("pe15", 11))
        if (hasUpgrade("pe16", 23)) m = m.times(upgradeEffect("pe16", 23))
        if (hasUpgrade("or16", 31)) m = m.times(upgradeEffect("or16", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("pe15", 24)) c = c.times(1e3)
        if (hasMilestone("pe15", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("pe15", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.pe16.unlocked) return 'Next in the survey: <b>PAHs</b> — opens at ' + format(tmp.pe16.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.pe15.points.gte(1)) return 'Ice Grains: best ' + format(player.pe15.best) }],
        ["display-text", function() { if (player.pe15.points.gte(tmp.pe15.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.pe15.softcap) + ' ice grains' }],
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
        11: { title: "Volatile Reservoirs",
              description: "Ice Grains gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Photolysis Layers",
              description: "Ice Grains gain is boosted by your unspent ice grains.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe15", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e30"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Sublimation Fronts",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("pe15", 12) },
              effect() { let ret = player["pe14"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe15", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 ice grains; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("pe15", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Ice Grains gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("pe15", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Volatile Reservoirs Resonance",
              description: "Sublimation Fronts is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("pe15", 15) } },
        22: { title: "Cometary Inheritance Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("pe15", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your ice grains.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("pe15", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Ice Grains gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("pe15", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("pe15", 23) },
              effect() { return buyableEffect("pe15", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("pe15", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Ice Grains gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["pe15"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["pe15"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["pe15"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["pe15"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Photolysis Layers Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ice grains<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Cometary Inheritance Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ice grains<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.pe15.unlocked && player.points.gte(tmp.pe15.requires)) {
            player.pe15.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("pe15", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.pe15.points = player.pe15.points.add(tmp.pe15.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("sg11", {
    name: "Central Molecular Zone",
    symbol: "CZ",
    position: 2,
    row: 11,
    color: "#b388ff",
    resource: "central molecular zone",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.0711e16"),
    type: "normal",
    exponent: 0.25,
    branches: [["sg10", 3, 2]],
    layerShown() { return player.sg11.unlocked || hasUpgrade("sg10", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg11", 11)) m = m.times(2)
        if (hasUpgrade("sg11", 12)) m = m.times(upgradeEffect("sg11", 12))
        if (hasUpgrade("sg11", 13)) m = m.times(upgradeEffect("sg11", 13))
        if (hasUpgrade("sg11", 14)) m = m.times(upgradeEffect("sg11", 14))
        if (hasUpgrade("sg11", 15)) m = m.times(3)
        if (hasUpgrade("sg11", 25)) m = m.times(upgradeEffect("sg11", 25))
        if (hasMilestone("sg11", 0)) m = m.times(2.5)
        if (getBuyableAmount("sg11", 11).gte(1)) m = m.times(buyableEffect("sg11", 11))
        if (hasUpgrade("sg12", 23)) m = m.times(upgradeEffect("sg12", 23))
        if (hasUpgrade("pe12", 31)) m = m.times(upgradeEffect("pe12", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("sg11", 24)) c = c.times(1e3)
        if (hasMilestone("sg11", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("pe12", 3)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("sg11", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.sg12.unlocked) return 'Next in the survey: <b>Galactic Tides</b> — opens at ' + format(tmp.sg12.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.sg11.points.gte(1)) return 'Central Molecular Zone: best ' + format(player.sg11.best) }],
        ["display-text", function() { if (player.sg11.points.gte(tmp.sg11.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.sg11.softcap) + ' central molecular zone' }],
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
        11: { title: "CMZ Streams",
              description: "Central Molecular Zone gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Tidal Compression",
              description: "Central Molecular Zone gain is boosted by your unspent central molecular zone.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg11", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e30"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Dense Gas Fraction",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("sg11", 12) },
              effect() { let ret = player["sg10"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg11", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 central molecular zone; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("sg11", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Central Molecular Zone gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("sg11", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "CMZ Streams Resonance",
              description: "Dense Gas Fraction is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("sg11", 15) } },
        22: { title: "Orbital Crowding Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("sg11", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your central molecular zone.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("sg11", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Central Molecular Zone gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("sg11", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("sg11", 23) },
              effect() { return buyableEffect("sg11", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("sg11", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Central Molecular Zone gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["sg11"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["sg11"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["sg11"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["sg11"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Tidal Compression Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " central molecular zone<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Orbital Crowding Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " central molecular zone<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.sg11.unlocked && player.points.gte(tmp.sg11.requires)) {
            player.sg11.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("sg11", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.sg11.points = player.sg11.points.add(tmp.sg11.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("sg12", {
    name: "Galactic Tides",
    symbol: "GT",
    position: 2,
    row: 12,
    color: "#b388ff",
    resource: "galactic tides",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.9281e17"),
    type: "normal",
    exponent: 0.25,
    branches: [["sg11", 3, 2]],
    layerShown() { return player.sg12.unlocked || hasUpgrade("sg11", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg12", 11)) m = m.times(2)
        if (hasUpgrade("sg12", 12)) m = m.times(upgradeEffect("sg12", 12))
        if (hasUpgrade("sg12", 13)) m = m.times(upgradeEffect("sg12", 13))
        if (hasUpgrade("sg12", 14)) m = m.times(upgradeEffect("sg12", 14))
        if (hasUpgrade("sg12", 15)) m = m.times(3)
        if (hasUpgrade("sg12", 25)) m = m.times(upgradeEffect("sg12", 25))
        if (hasMilestone("sg12", 0)) m = m.times(2.5)
        if (getBuyableAmount("sg12", 11).gte(1)) m = m.times(buyableEffect("sg12", 11))
        if (hasUpgrade("sg13", 23)) m = m.times(upgradeEffect("sg13", 23))
        if (hasUpgrade("pe13", 31)) m = m.times(upgradeEffect("pe13", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("sg12", 24)) c = c.times(1e3)
        if (hasMilestone("sg12", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("pe12", 3)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("sg12", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.sg13.unlocked) return 'Next in the survey: <b>Metal-Poor Stars</b> — opens at ' + format(tmp.sg13.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.sg12.points.gte(1)) return 'Galactic Tides: best ' + format(player.sg12.best) }],
        ["display-text", function() { if (player.sg12.points.gte(tmp.sg12.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.sg12.softcap) + ' galactic tides' }],
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
        11: { title: "Roche Limits",
              description: "Galactic Tides gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Tidal Radii",
              description: "Galactic Tides gain is boosted by your unspent galactic tides.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg12", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e30"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Disrupting Companions",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("sg12", 12) },
              effect() { let ret = player["sg11"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg12", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 galactic tides; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("sg12", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Galactic Tides gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("sg12", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Roche Limits Resonance",
              description: "Disrupting Companions is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("sg12", 15) } },
        22: { title: "Stream Stirring Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("sg12", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your galactic tides.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("sg12", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Galactic Tides gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("sg12", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("sg12", 23) },
              effect() { return buyableEffect("sg12", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("sg12", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Galactic Tides gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["sg12"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["sg12"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["sg12"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["sg12"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Tidal Radii Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " galactic tides<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Stream Stirring Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " galactic tides<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.sg12.unlocked && player.points.gte(tmp.sg12.requires)) {
            player.sg12.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("sg12", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.sg12.points = player.sg12.points.add(tmp.sg12.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("sg13", {
    name: "Metal-Poor Stars",
    symbol: "MP",
    position: 2,
    row: 13,
    color: "#b388ff",
    resource: "metal-poor stars",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("3.4705e18"),
    type: "normal",
    exponent: 0.25,
    branches: [["sg12", 3, 2]],
    layerShown() { return player.sg13.unlocked || hasUpgrade("sg12", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg13", 11)) m = m.times(2)
        if (hasUpgrade("sg13", 12)) m = m.times(upgradeEffect("sg13", 12))
        if (hasUpgrade("sg13", 13)) m = m.times(upgradeEffect("sg13", 13))
        if (hasUpgrade("sg13", 14)) m = m.times(upgradeEffect("sg13", 14))
        if (hasUpgrade("sg13", 15)) m = m.times(3)
        if (hasUpgrade("sg13", 25)) m = m.times(upgradeEffect("sg13", 25))
        if (hasMilestone("sg13", 0)) m = m.times(2.5)
        if (getBuyableAmount("sg13", 11).gte(1)) m = m.times(buyableEffect("sg13", 11))
        if (hasUpgrade("sg14", 23)) m = m.times(upgradeEffect("sg14", 23))
        if (hasUpgrade("pe14", 31)) m = m.times(upgradeEffect("pe14", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("sg13", 24)) c = c.times(1e3)
        if (hasMilestone("sg13", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("pe12", 3)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("sg13", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.sg14.unlocked) return 'Next in the survey: <b>Galactic Wind</b> — opens at ' + format(tmp.sg14.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.sg13.points.gte(1)) return 'Metal-Poor Stars: best ' + format(player.sg13.best) }],
        ["display-text", function() { if (player.sg13.points.gte(tmp.sg13.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.sg13.softcap) + ' metal-poor stars' }],
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
        11: { title: "[Fe/H] < −5",
              description: "Metal-Poor Stars gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Carbon-Enhanced Elders",
              description: "Metal-Poor Stars gain is boosted by your unspent metal-poor stars.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg13", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e30"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Population III Echoes",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("sg13", 12) },
              effect() { let ret = player["sg12"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg13", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 metal-poor stars; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("sg13", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Metal-Poor Stars gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("sg13", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "[Fe/H] < −5 Resonance",
              description: "Population III Echoes is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("sg13", 15) } },
        22: { title: "Pre-enrichment Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("sg13", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your metal-poor stars.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("sg13", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Metal-Poor Stars gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("sg13", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("sg13", 23) },
              effect() { return buyableEffect("sg13", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("sg13", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Metal-Poor Stars gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["sg13"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["sg13"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["sg13"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["sg13"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Carbon-Enhanced Elders Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " metal-poor stars<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Pre-enrichment Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " metal-poor stars<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.sg13.unlocked && player.points.gte(tmp.sg13.requires)) {
            player.sg13.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("sg13", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.sg13.points = player.sg13.points.add(tmp.sg13.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("sg14", {
    name: "Galactic Wind",
    symbol: "GW",
    position: 2,
    row: 14,
    color: "#b388ff",
    resource: "galactic wind",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("6.2469e19"),
    type: "normal",
    exponent: 0.25,
    branches: [["sg13", 3, 2]],
    layerShown() { return player.sg14.unlocked || hasUpgrade("sg13", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg14", 11)) m = m.times(2)
        if (hasUpgrade("sg14", 12)) m = m.times(upgradeEffect("sg14", 12))
        if (hasUpgrade("sg14", 13)) m = m.times(upgradeEffect("sg14", 13))
        if (hasUpgrade("sg14", 14)) m = m.times(upgradeEffect("sg14", 14))
        if (hasUpgrade("sg14", 15)) m = m.times(3)
        if (hasUpgrade("sg14", 25)) m = m.times(upgradeEffect("sg14", 25))
        if (hasMilestone("sg14", 0)) m = m.times(2.5)
        if (getBuyableAmount("sg14", 11).gte(1)) m = m.times(buyableEffect("sg14", 11))
        if (hasUpgrade("sg15", 23)) m = m.times(upgradeEffect("sg15", 23))
        if (hasUpgrade("pe15", 31)) m = m.times(upgradeEffect("pe15", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("sg14", 24)) c = c.times(1e3)
        if (hasMilestone("sg14", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("pe12", 3)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("sg14", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.sg15.unlocked) return 'Next in the survey: <b>Ram-Pressure Stripping</b> — opens at ' + format(tmp.sg15.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.sg14.points.gte(1)) return 'Galactic Wind: best ' + format(player.sg14.best) }],
        ["display-text", function() { if (player.sg14.points.gte(tmp.sg14.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.sg14.softcap) + ' galactic wind' }],
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
        11: { title: "Outflow Cones",
              description: "Galactic Wind gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Metal Transport",
              description: "Galactic Wind gain is boosted by your unspent galactic wind.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg14", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e30"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Fountain Return",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("sg14", 12) },
              effect() { let ret = player["sg13"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg14", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 galactic wind; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("sg14", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Galactic Wind gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("sg14", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Outflow Cones Resonance",
              description: "Fountain Return is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("sg14", 15) } },
        22: { title: "Escape Velocities Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("sg14", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your galactic wind.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("sg14", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Galactic Wind gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("sg14", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("sg14", 23) },
              effect() { return buyableEffect("sg14", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("sg14", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Galactic Wind gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["sg14"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["sg14"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["sg14"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["sg14"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Metal Transport Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " galactic wind<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Escape Velocities Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " galactic wind<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.sg14.unlocked && player.points.gte(tmp.sg14.requires)) {
            player.sg14.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("sg14", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.sg14.points = player.sg14.points.add(tmp.sg14.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("sg15", {
    name: "Ram-Pressure Stripping",
    symbol: "RP",
    position: 2,
    row: 15,
    color: "#b388ff",
    resource: "ram-pressure stripping",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.1244e21"),
    type: "normal",
    exponent: 0.25,
    branches: [["sg14", 3, 2]],
    layerShown() { return player.sg15.unlocked || hasUpgrade("sg14", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg15", 11)) m = m.times(2)
        if (hasUpgrade("sg15", 12)) m = m.times(upgradeEffect("sg15", 12))
        if (hasUpgrade("sg15", 13)) m = m.times(upgradeEffect("sg15", 13))
        if (hasUpgrade("sg15", 14)) m = m.times(upgradeEffect("sg15", 14))
        if (hasUpgrade("sg15", 15)) m = m.times(3)
        if (hasUpgrade("sg15", 25)) m = m.times(upgradeEffect("sg15", 25))
        if (hasMilestone("sg15", 0)) m = m.times(2.5)
        if (getBuyableAmount("sg15", 11).gte(1)) m = m.times(buyableEffect("sg15", 11))
        if (hasUpgrade("sg16", 23)) m = m.times(upgradeEffect("sg16", 23))
        if (hasUpgrade("pe16", 31)) m = m.times(upgradeEffect("pe16", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("sg15", 24)) c = c.times(1e3)
        if (hasMilestone("sg15", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("pe12", 3)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("sg15", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.sg16.unlocked) return 'Next in the survey: <b>Tidal Streams</b> — opens at ' + format(tmp.sg16.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.sg15.points.gte(1)) return 'Ram-Pressure Stripping: best ' + format(player.sg15.best) }],
        ["display-text", function() { if (player.sg15.points.gte(tmp.sg15.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.sg15.softcap) + ' ram-pressure stripping' }],
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
        11: { title: "Edge-On Truncation",
              description: "Ram-Pressure Stripping gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Jellyfish Tails",
              description: "Ram-Pressure Stripping gain is boosted by your unspent ram-pressure stripping.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg15", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e30"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "HI Deficiency",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("sg15", 12) },
              effect() { let ret = player["sg14"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg15", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 ram-pressure stripping; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("sg15", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Ram-Pressure Stripping gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("sg15", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Edge-On Truncation Resonance",
              description: "HI Deficiency is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("sg15", 15) } },
        22: { title: "Sweeping Fronts Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("sg15", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your ram-pressure stripping.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("sg15", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Ram-Pressure Stripping gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("sg15", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("sg15", 23) },
              effect() { return buyableEffect("sg15", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("sg15", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Ram-Pressure Stripping gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["sg15"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["sg15"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["sg15"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["sg15"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Jellyfish Tails Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ram-pressure stripping<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Sweeping Fronts Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ram-pressure stripping<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.sg15.unlocked && player.points.gte(tmp.sg15.requires)) {
            player.sg15.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("sg15", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.sg15.points = player.sg15.points.add(tmp.sg15.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("oa11", {
    name: "Microquasars",
    symbol: "MQ",
    position: 3,
    row: 11,
    color: "#ff8a80",
    resource: "microquasars",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("2.6779e16"),
    type: "normal",
    exponent: 0.25,
    branches: [["oa10", 1, 2]],
    layerShown() { return player.oa11.unlocked || hasUpgrade("oa10", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa11", 11)) m = m.times(2)
        if (hasUpgrade("oa11", 12)) m = m.times(upgradeEffect("oa11", 12))
        if (hasUpgrade("oa11", 13)) m = m.times(upgradeEffect("oa11", 13))
        if (hasUpgrade("oa11", 14)) m = m.times(upgradeEffect("oa11", 14))
        if (hasUpgrade("oa11", 15)) m = m.times(3)
        if (hasUpgrade("oa11", 25)) m = m.times(upgradeEffect("oa11", 25))
        if (hasMilestone("oa11", 0)) m = m.times(2.5)
        if (getBuyableAmount("oa11", 11).gte(1)) m = m.times(buyableEffect("oa11", 11))
        if (hasUpgrade("oa12", 23)) m = m.times(upgradeEffect("oa12", 23))
        if (hasUpgrade("sg12", 31)) m = m.times(upgradeEffect("sg12", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("oa11", 24)) c = c.times(1e3)
        if (hasMilestone("oa11", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("pe12", 3)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("oa11", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.oa12.unlocked) return 'Next in the survey: <b>Hyper-Velocity Stars</b> — opens at ' + format(tmp.oa12.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.oa11.points.gte(1)) return 'Microquasars: best ' + format(player.oa11.best) }],
        ["display-text", function() { if (player.oa11.points.gte(tmp.oa11.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.oa11.softcap) + ' microquasars' }],
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
        11: { title: "SS 433 Wobble",
              description: "Microquasars gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Precessing Jets",
              description: "Microquasars gain is boosted by your unspent microquasars.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa11", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e30")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e30e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Relativistic Balls",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("oa11", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa10"].points.gte(100)) ret = ret.times(5)
                  if (player["oa10"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa11", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 microquasars; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("oa11", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Microquasars gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("oa11", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "SS 433 Wobble Resonance",
              description: "Relativistic Balls is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("oa11", 15) } },
        22: { title: "Local Analogs Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("oa11", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your microquasars.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("oa11", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(2).pow(1.5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Microquasars gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("oa11", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("oa11", 23) },
              effect() { return buyableEffect("oa11", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("oa11", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Microquasars gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["oa11"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["oa11"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["oa11"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["oa11"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Precessing Jets Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " microquasars<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Local Analogs Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " microquasars<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.oa11.unlocked && player.points.gte(tmp.oa11.requires)) {
            player.oa11.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("oa11", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.oa11.points = player.oa11.points.add(tmp.oa11.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("oa12", {
    name: "Hyper-Velocity Stars",
    symbol: "HV",
    position: 3,
    row: 12,
    color: "#ff8a80",
    resource: "hyper-velocity stars",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("4.8201e17"),
    type: "normal",
    exponent: 0.25,
    branches: [["oa11", 1, 2]],
    layerShown() { return player.oa12.unlocked || hasUpgrade("oa11", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa12", 11)) m = m.times(2)
        if (hasUpgrade("oa12", 12)) m = m.times(upgradeEffect("oa12", 12))
        if (hasUpgrade("oa12", 13)) m = m.times(upgradeEffect("oa12", 13))
        if (hasUpgrade("oa12", 14)) m = m.times(upgradeEffect("oa12", 14))
        if (hasUpgrade("oa12", 15)) m = m.times(3)
        if (hasUpgrade("oa12", 25)) m = m.times(upgradeEffect("oa12", 25))
        if (hasMilestone("oa12", 0)) m = m.times(2.5)
        if (getBuyableAmount("oa12", 11).gte(1)) m = m.times(buyableEffect("oa12", 11))
        if (hasUpgrade("oa13", 23)) m = m.times(upgradeEffect("oa13", 23))
        if (hasUpgrade("sg13", 31)) m = m.times(upgradeEffect("sg13", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("oa12", 24)) c = c.times(1e3)
        if (hasMilestone("oa12", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("pe12", 3)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("oa12", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.oa13.unlocked) return 'Next in the survey: <b>Stellar Collisions</b> — opens at ' + format(tmp.oa13.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.oa12.points.gte(1)) return 'Hyper-Velocity Stars: best ' + format(player.oa12.best) }],
        ["display-text", function() { if (player.oa12.points.gte(tmp.oa12.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.oa12.softcap) + ' hyper-velocity stars' }],
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
        11: { title: "HVS 1",
              description: "Hyper-Velocity Stars gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Sgr A* Slingshots",
              description: "Hyper-Velocity Stars gain is boosted by your unspent hyper-velocity stars.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa12", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e30")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e30e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Unbound Trajectories",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("oa12", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa11"].points.gte(100)) ret = ret.times(5)
                  if (player["oa11"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa12", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 hyper-velocity stars; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("oa12", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Hyper-Velocity Stars gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("oa12", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "HVS 1 Resonance",
              description: "Unbound Trajectories is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("oa12", 15) } },
        22: { title: "Galactic Exiles Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("oa12", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your hyper-velocity stars.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("oa12", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(2).pow(1.5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Hyper-Velocity Stars gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("oa12", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("oa12", 23) },
              effect() { return buyableEffect("oa12", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("oa12", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Hyper-Velocity Stars gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["oa12"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["oa12"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["oa12"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["oa12"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Sgr A* Slingshots Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " hyper-velocity stars<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Galactic Exiles Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " hyper-velocity stars<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.oa12.unlocked && player.points.gte(tmp.oa12.requires)) {
            player.oa12.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("oa12", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.oa12.points = player.oa12.points.add(tmp.oa12.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("oa13", {
    name: "Stellar Collisions",
    symbol: "SC",
    position: 3,
    row: 13,
    color: "#ff8a80",
    resource: "stellar collisions",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("8.6762e18"),
    type: "normal",
    exponent: 0.25,
    branches: [["oa12", 1, 2]],
    layerShown() { return player.oa13.unlocked || hasUpgrade("oa12", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa13", 11)) m = m.times(2)
        if (hasUpgrade("oa13", 12)) m = m.times(upgradeEffect("oa13", 12))
        if (hasUpgrade("oa13", 13)) m = m.times(upgradeEffect("oa13", 13))
        if (hasUpgrade("oa13", 14)) m = m.times(upgradeEffect("oa13", 14))
        if (hasUpgrade("oa13", 15)) m = m.times(3)
        if (hasUpgrade("oa13", 25)) m = m.times(upgradeEffect("oa13", 25))
        if (hasMilestone("oa13", 0)) m = m.times(2.5)
        if (getBuyableAmount("oa13", 11).gte(1)) m = m.times(buyableEffect("oa13", 11))
        if (hasUpgrade("oa14", 23)) m = m.times(upgradeEffect("oa14", 23))
        if (hasUpgrade("sg14", 31)) m = m.times(upgradeEffect("sg14", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("oa13", 24)) c = c.times(1e3)
        if (hasMilestone("oa13", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("pe12", 3)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("oa13", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.oa14.unlocked) return 'Next in the survey: <b>Relativistic Jets</b> — opens at ' + format(tmp.oa14.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.oa13.points.gte(1)) return 'Stellar Collisions: best ' + format(player.oa13.best) }],
        ["display-text", function() { if (player.oa13.points.gte(tmp.oa13.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.oa13.softcap) + ' stellar collisions' }],
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
        11: { title: "Blue Straggler Factories",
              description: "Stellar Collisions gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Direct Hits",
              description: "Stellar Collisions gain is boosted by your unspent stellar collisions.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa13", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e30")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e30e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Common Envelopes",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("oa13", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa12"].points.gte(100)) ret = ret.times(5)
                  if (player["oa12"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa13", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 stellar collisions; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("oa13", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Stellar Collisions gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("oa13", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Blue Straggler Factories Resonance",
              description: "Common Envelopes is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("oa13", 15) } },
        22: { title: "Cluster Mortality Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("oa13", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your stellar collisions.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("oa13", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(2).pow(1.5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Stellar Collisions gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("oa13", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("oa13", 23) },
              effect() { return buyableEffect("oa13", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("oa13", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Stellar Collisions gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["oa13"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["oa13"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["oa13"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["oa13"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Direct Hits Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " stellar collisions<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Cluster Mortality Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " stellar collisions<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.oa13.unlocked && player.points.gte(tmp.oa13.requires)) {
            player.oa13.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("oa13", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.oa13.points = player.oa13.points.add(tmp.oa13.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("oa14", {
    name: "Relativistic Jets",
    symbol: "RJ",
    position: 3,
    row: 14,
    color: "#ff8a80",
    resource: "relativistic jets",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.5617e20"),
    type: "normal",
    exponent: 0.25,
    branches: [["oa13", 1, 2]],
    layerShown() { return player.oa14.unlocked || hasUpgrade("oa13", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa14", 11)) m = m.times(2)
        if (hasUpgrade("oa14", 12)) m = m.times(upgradeEffect("oa14", 12))
        if (hasUpgrade("oa14", 13)) m = m.times(upgradeEffect("oa14", 13))
        if (hasUpgrade("oa14", 14)) m = m.times(upgradeEffect("oa14", 14))
        if (hasUpgrade("oa14", 15)) m = m.times(3)
        if (hasUpgrade("oa14", 25)) m = m.times(upgradeEffect("oa14", 25))
        if (hasMilestone("oa14", 0)) m = m.times(2.5)
        if (getBuyableAmount("oa14", 11).gte(1)) m = m.times(buyableEffect("oa14", 11))
        if (hasUpgrade("oa15", 23)) m = m.times(upgradeEffect("oa15", 23))
        if (hasUpgrade("sg15", 31)) m = m.times(upgradeEffect("sg15", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("oa14", 24)) c = c.times(1e3)
        if (hasMilestone("oa14", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("pe12", 3)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("oa14", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.oa15.unlocked) return 'Next in the survey: <b>Afterglows</b> — opens at ' + format(tmp.oa15.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.oa14.points.gte(1)) return 'Relativistic Jets: best ' + format(player.oa14.best) }],
        ["display-text", function() { if (player.oa14.points.gte(tmp.oa14.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.oa14.softcap) + ' relativistic jets' }],
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
        11: { title: "Lorentz Factors",
              description: "Relativistic Jets gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Counterjet Symmetry",
              description: "Relativistic Jets gain is boosted by your unspent relativistic jets.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa14", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e30")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e30e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Knotty Flows",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("oa14", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa13"].points.gte(100)) ret = ret.times(5)
                  if (player["oa13"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa14", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 relativistic jets; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("oa14", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Relativistic Jets gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("oa14", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Lorentz Factors Resonance",
              description: "Knotty Flows is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("oa14", 15) } },
        22: { title: "Blazar Alignment Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("oa14", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your relativistic jets.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("oa14", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(2).pow(1.5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Relativistic Jets gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("oa14", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("oa14", 23) },
              effect() { return buyableEffect("oa14", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("oa14", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Relativistic Jets gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["oa14"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["oa14"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["oa14"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["oa14"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Counterjet Symmetry Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " relativistic jets<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Blazar Alignment Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " relativistic jets<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },


    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.oa14.unlocked && player.points.gte(tmp.oa14.requires)) {
            player.oa14.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("oa14", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.oa14.points = player.oa14.points.add(tmp.oa14.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("oa15", {
    name: "Afterglows",
    symbol: "AF",
    position: 3,
    row: 15,
    color: "#ff8a80",
    resource: "afterglows",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("2.8111e21"),
    type: "normal",
    exponent: 0.25,
    branches: [["oa14", 1, 2]],
    layerShown() { return player.oa15.unlocked || hasUpgrade("oa14", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0), decayBoost: new Decimal(1) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa15", 11)) m = m.times(2)
        if (hasUpgrade("oa15", 12)) m = m.times(upgradeEffect("oa15", 12))
        if (hasUpgrade("oa15", 13)) m = m.times(upgradeEffect("oa15", 13))
        if (hasUpgrade("oa15", 14)) m = m.times(upgradeEffect("oa15", 14))
        if (hasUpgrade("oa15", 15)) m = m.times(3)
        if (hasUpgrade("oa15", 25)) m = m.times(upgradeEffect("oa15", 25))
        if (hasMilestone("oa15", 0)) m = m.times(2.5)
        if (getBuyableAmount("oa15", 11).gte(1)) m = m.times(buyableEffect("oa15", 11))
        if (hasUpgrade("oa16", 23)) m = m.times(upgradeEffect("oa16", 23))
        if (hasUpgrade("sg16", 31)) m = m.times(upgradeEffect("sg16", 31))
        if (hasChallenge("oa6", 13)) m = m.times(challengeEffect("oa6", 13))
        if (hasUpgrade("hr", 12)) m = m.times(1e3)
        if (hasUpgrade("dm", 13)) m = m.pow(1.03)
        if (hasUpgrade("dm", 23)) m = m.times(1e6)
        if (player.mw.unlocked) m = m.times(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.times(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.root(4)
if (player.oa15.decayBoost.gt(1)) m = m.times(player.oa15.decayBoost)
        return m
    },
    gainExp() { return new Decimal(1) },
    softcap() {
        let c = new Decimal("1e6")
        if (hasUpgrade("oa15", 24)) c = c.times(1e3)
        if (hasMilestone("oa15", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("pe12", 3)) return true },
    passiveGeneration() { if (hasMilestone("pe12", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("pe12", 3)) return true },
    resetsNothing() { if (hasMilestone("pe12", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("oa15", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.oa16.unlocked) return 'Next in the survey: <b>Gravitational Waves</b> — opens at ' + format(tmp.oa16.requires) + ' stardust. Nothing to buy first.' }],
        ["bar", "afterglow"],
        ["display-text", function() { return 'Afterglow stack: ×' + format(player.oa15.decayBoost) + ' on Outer Arm gain (decays on reset)' }],
        ["display-text", function() { if (player.oa15.points.gte(1)) return 'Afterglows: best ' + format(player.oa15.best) }],
        ["display-text", function() { if (player.oa15.points.gte(tmp.oa15.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.oa15.softcap) + ' afterglows' }],
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
        11: { title: "Forward Shock Decay",
              description: "Afterglows gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Jet Breaks",
              description: "Afterglows gain is boosted by your unspent afterglows.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa15", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e30")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e30e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Fireball Model",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("oa15", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa14"].points.gte(100)) ret = ret.times(5)
                  if (player["oa14"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa15", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 afterglows; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("oa15", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Afterglows gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("oa15", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Forward Shock Decay Resonance",
              description: "Fireball Model is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("oa15", 15) } },
        22: { title: "Late Plateaus Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("oa15", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your afterglows.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("oa15", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(2).pow(1.5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Afterglows gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("oa15", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("oa15", 23) },
              effect() { return buyableEffect("oa15", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("oa15", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Afterglows gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["oa15"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["oa15"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["oa15"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["oa15"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Jet Breaks Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " afterglows<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Late Plateaus Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " afterglows<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },
bars: {
        afterglow: {
            direction: RIGHT,
            width: 320, height: 36,
            progress() { return player.points.add(1).log(10).div(20).min(1).toNumber() },
            display() { return "Afterglow monitoring: " + format(player.points.add(1).log(10).div(20).min(1).times(100)) + "%" },
            fillStyle: { 'background-color': "#ff8a80" },
            baseStyle: { 'background-color': "#3a1d1d" },
            textStyle: { 'color': "#2a0808" },
        },
    },

    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.oa15.unlocked && player.points.gte(tmp.oa15.requires)) {
            player.oa15.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("oa15", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.oa15.points = player.oa15.points.add(tmp.oa15.resetGain.times(0.02).times(diff))
        }
        if (player.points.add(1).log(10).gte(20) && !inChallenge("oa6", 23)) {
            player.oa15.decayBoost = player.oa15.decayBoost.times(1.25).max(1).min(new Decimal("1e64"))
            if (hasUpgrade("oa15", 24)) player.oa15.decayBoost = player.oa15.decayBoost.times(1.1).min(new Decimal("1e64"))
        }
    },
})
