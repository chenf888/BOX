addLayer("or16", {
    name: "Cepheid Variables",
    symbol: "CE",
    position: 0,
    row: 16,
    color: "#ffd162",
    resource: "cepheid variables",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("3.3733e21"),
    type: "normal",
    exponent: 0.25,
    branches: [["or15", 1, 2]],
    layerShown() { return player.or16.unlocked || hasUpgrade("or15", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "q", description: "q: reset for cepheid variables",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or16", 11)) m = m.times(2)
        if (hasUpgrade("or16", 12)) m = m.times(upgradeEffect("or16", 12))
        if (hasUpgrade("or16", 13)) m = m.times(upgradeEffect("or16", 13))
        if (hasUpgrade("or16", 14)) m = m.times(upgradeEffect("or16", 14))
        if (hasUpgrade("or16", 15)) m = m.times(3)
        if (hasUpgrade("or16", 25)) m = m.times(upgradeEffect("or16", 25))
        if (hasMilestone("or16", 0)) m = m.times(2.5)
        if (getBuyableAmount("or16", 11).gte(1)) m = m.times(buyableEffect("or16", 11))
        if (hasUpgrade("or17", 23)) m = m.times(upgradeEffect("or17", 23))
        if (hasUpgrade("oa17", 31)) m = m.times(upgradeEffect("oa17", 31))
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
        let c = new Decimal("1e8")
        if (hasUpgrade("or16", 24)) c = c.times(1e3)
        if (hasMilestone("or16", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2) && hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("or16", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.or17.unlocked) return 'Next in the survey: <b>Eclipsing Binaries</b> — opens at ' + format(tmp.or17.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.or16.points.gte(1)) return 'Cepheid Variables: best ' + format(player.or16.best) }],
        ["display-text", function() { if (player.or16.points.gte(tmp.or16.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.or16.softcap) + ' cepheid variables' }],
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
        11: { title: "Period-Luminosity Law",
              description: "Cepheid Variables gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Leavitt's Law",
              description: "Cepheid Variables gain is boosted by your unspent cepheid variables.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or16", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Instability Strip",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("or16", 12) },
              effect() { let ret = player["or15"].points.add(1).pow(0.4)
                  if (hasUpgrade("or16", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 cepheid variables; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("or16", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Cepheid Variables gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("or16", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Period-Luminosity Law Resonance",
              description: "Instability Strip is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("or16", 15) } },
        22: { title: "Standard Candles Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("or16", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your cepheid variables.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("or16", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Cepheid Variables gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("or16", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("or16", 23) },
              effect() { return buyableEffect("or16", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("or16", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Cepheid Variables gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["or16"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["or16"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["or16"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["or16"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Leavitt's Law Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " cepheid variables<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Standard Candles Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " cepheid variables<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.or16.unlocked && player.points.gte(tmp.or16.requires)) {
            player.or16.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("or16", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.or16.points = player.or16.points.add(tmp.or16.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("or17", {
    name: "Eclipsing Binaries",
    symbol: "EB",
    position: 0,
    row: 17,
    color: "#ffd162",
    resource: "eclipsing binaries",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("6.072e22"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    canBuyMax() { return true },
    branches: [["or16", 1, 2]],
    layerShown() { return player.or17.unlocked || hasUpgrade("or16", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "r", description: "r: reset for eclipsing binaries",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or17", 11)) m = m.div(2)
        if (hasUpgrade("or17", 12)) m = m.div(upgradeEffect("or17", 12))
        if (hasUpgrade("or17", 13)) m = m.div(upgradeEffect("or17", 13))
        if (hasUpgrade("or17", 14)) m = m.div(upgradeEffect("or17", 14))
        if (hasUpgrade("or17", 15)) m = m.div(3)
        if (hasUpgrade("or17", 25)) m = m.div(upgradeEffect("or17", 25))
        if (hasMilestone("or17", 0)) m = m.div(2.5)
        if (getBuyableAmount("or17", 11).gte(1)) m = m.div(buyableEffect("or17", 11))
        if (hasUpgrade("or18", 23)) m = m.div(upgradeEffect("or18", 23))
        if (hasUpgrade("oa18", 31)) m = m.div(upgradeEffect("oa18", 31))
        if (hasChallenge("oa6", 13)) m = m.div(challengeEffect("oa6", 13))
        if (hasUpgrade("or17", 24)) m = m.div(1e3)
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.div(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2) && hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("or17", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.or18.unlocked) return 'Next in the survey: <b>Stellar Streams</b> — opens at ' + format(tmp.or18.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.or17.points.gte(1)) return 'Eclipsing Binaries: best ' + format(player.or17.best) }],
        ["display-text", function() { return 'Next eclipsing binaries floor: ' + format(tmp.or17.nextAt) + ' stardust' }],
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
        11: { title: "Light Curve Dips",
              description: "Eclipsing Binaries gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Contact Envelopes",
              description: "Eclipsing Binaries gain is boosted by your unspent eclipsing binaries.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("or17", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Algol Paradox",
              description: "The previous structure feeds this one.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("or17", 12) },
              effect() { let ret = player["or16"].points.add(1).pow(0.4)
                  if (hasUpgrade("or17", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 10 floors; ×5 more at 20.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("or17", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(10)) ret = ret.times(5)
                  if (player[this.layer].best.gte(20)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Eclipsing Binaries gain x3, and the next survey target appears on your map.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("or17", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Light Curve Dips Resonance",
              description: "Algol Paradox is raised to ^1.1.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("or17", 15) } },
        22: { title: "Mass Transfer Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("or17", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your eclipsing binaries.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("or17", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Next floor of eclipsing binaries costs 1,000× less stardust.",
              cost: new Decimal(32),
              unlocked() { return hasUpgrade("or17", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "costs ÷" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(48),
              unlocked() { return hasUpgrade("or17", 23) },
              effect() { return buyableEffect("or17", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(64),
              unlocked() { return hasUpgrade("or17", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 eclipsing binaries",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].best.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(15) } },
    },
    buyables: {
        11: { title: "Contact Envelopes Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " eclipsing binaries<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Mass Transfer Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " eclipsing binaries<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.or17.unlocked && player.points.gte(tmp.or17.requires)) {
            player.or17.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("or17", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.or17.points = player.or17.points.add(tmp.or17.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("or18", {
    name: "Stellar Streams",
    symbol: "SS",
    position: 0,
    row: 18,
    color: "#ffd162",
    resource: "stellar streams",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.093e24"),
    type: "normal",
    exponent: 0.25,
    branches: [["or17", 1, 2]],
    layerShown() { return player.or18.unlocked || hasUpgrade("or17", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "s", description: "s: reset for stellar streams",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or18", 11)) m = m.times(2)
        if (hasUpgrade("or18", 12)) m = m.times(upgradeEffect("or18", 12))
        if (hasUpgrade("or18", 13)) m = m.times(upgradeEffect("or18", 13))
        if (hasUpgrade("or18", 14)) m = m.times(upgradeEffect("or18", 14))
        if (hasUpgrade("or18", 15)) m = m.times(3)
        if (hasUpgrade("or18", 25)) m = m.times(upgradeEffect("or18", 25))
        if (hasMilestone("or18", 0)) m = m.times(2.5)
        if (getBuyableAmount("or18", 11).gte(1)) m = m.times(buyableEffect("or18", 11))
        if (hasUpgrade("or19", 23)) m = m.times(upgradeEffect("or19", 23))
        if (hasUpgrade("oa19", 31)) m = m.times(upgradeEffect("oa19", 31))
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
        let c = new Decimal("1e8")
        if (hasUpgrade("or18", 24)) c = c.times(1e3)
        if (hasMilestone("or18", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2) && hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("or18", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.or19.unlocked) return 'Next in the survey: <b>Flare Stars</b> — opens at ' + format(tmp.or19.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.or18.points.gte(1)) return 'Stellar Streams: best ' + format(player.or18.best) }],
        ["display-text", function() { if (player.or18.points.gte(tmp.or18.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.or18.softcap) + ' stellar streams' }],
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
        11: { title: "Tidal Tails",
              description: "Stellar Streams gain ×2.",
              cost: new Decimal(1) },
        12: { title: "GD-1 Wrinkles",
              description: "Stellar Streams gain is boosted by your unspent stellar streams.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or18", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Leading and Trailing",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("or18", 12) },
              effect() { let ret = player["or17"].points.add(1).pow(0.4)
                  if (hasUpgrade("or18", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 stellar streams; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("or18", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Stellar Streams gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("or18", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Tidal Tails Resonance",
              description: "Leading and Trailing is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("or18", 15) } },
        22: { title: "Ghost Progenitors Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("or18", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your stellar streams.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("or18", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Stellar Streams gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("or18", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("or18", 23) },
              effect() { return buyableEffect("or18", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("or18", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Stellar Streams gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["or18"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["or18"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["or18"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["or18"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "GD-1 Wrinkles Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " stellar streams<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Ghost Progenitors Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " stellar streams<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.or18.unlocked && player.points.gte(tmp.or18.requires)) {
            player.or18.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("or18", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.or18.points = player.or18.points.add(tmp.or18.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("or19", {
    name: "Flare Stars",
    symbol: "FS",
    position: 0,
    row: 19,
    color: "#ffd162",
    resource: "flare stars",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.9673e25"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    canBuyMax() { return true },
    branches: [["or18", 1, 2]],
    layerShown() { return player.or19.unlocked || hasUpgrade("or18", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "t", description: "t: reset for flare stars",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or19", 11)) m = m.div(2)
        if (hasUpgrade("or19", 12)) m = m.div(upgradeEffect("or19", 12))
        if (hasUpgrade("or19", 13)) m = m.div(upgradeEffect("or19", 13))
        if (hasUpgrade("or19", 14)) m = m.div(upgradeEffect("or19", 14))
        if (hasUpgrade("or19", 15)) m = m.div(3)
        if (hasUpgrade("or19", 25)) m = m.div(upgradeEffect("or19", 25))
        if (hasMilestone("or19", 0)) m = m.div(2.5)
        if (getBuyableAmount("or19", 11).gte(1)) m = m.div(buyableEffect("or19", 11))
        if (hasUpgrade("or20", 23)) m = m.div(upgradeEffect("or20", 23))
        if (hasUpgrade("oa20", 31)) m = m.div(upgradeEffect("oa20", 31))
        if (hasChallenge("oa6", 13)) m = m.div(challengeEffect("oa6", 13))
        if (hasUpgrade("or19", 24)) m = m.div(1e3)
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.div(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2) && hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("or19", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.or20.unlocked) return 'Next in the survey: <b>Carbon Stars</b> — opens at ' + format(tmp.or20.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.or19.points.gte(1)) return 'Flare Stars: best ' + format(player.or19.best) }],
        ["display-text", function() { return 'Next flare stars floor: ' + format(tmp.or19.nextAt) + ' stardust' }],
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
        11: { title: "Superflares",
              description: "Flare Stars gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Star Spot Coverage",
              description: "Flare Stars gain is boosted by your unspent flare stars.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("or19", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Coronal Rain",
              description: "The previous structure feeds this one.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("or19", 12) },
              effect() { let ret = player["or18"].points.add(1).pow(0.4)
                  if (hasUpgrade("or19", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 10 floors; ×5 more at 20.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("or19", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(10)) ret = ret.times(5)
                  if (player[this.layer].best.gte(20)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Flare Stars gain x3, and the next survey target appears on your map.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("or19", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Superflares Resonance",
              description: "Coronal Rain is raised to ^1.1.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("or19", 15) } },
        22: { title: "Proxima Temper Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("or19", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your flare stars.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("or19", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Next floor of flare stars costs 1,000× less stardust.",
              cost: new Decimal(32),
              unlocked() { return hasUpgrade("or19", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "costs ÷" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(48),
              unlocked() { return hasUpgrade("or19", 23) },
              effect() { return buyableEffect("or19", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(64),
              unlocked() { return hasUpgrade("or19", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 flare stars",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].best.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(15) } },
    },
    buyables: {
        11: { title: "Star Spot Coverage Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " flare stars<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Proxima Temper Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " flare stars<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.or19.unlocked && player.points.gte(tmp.or19.requires)) {
            player.or19.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("or19", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.or19.points = player.or19.points.add(tmp.or19.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("or20", {
    name: "Carbon Stars",
    symbol: "CS",
    position: 0,
    row: 20,
    color: "#ffd162",
    resource: "carbon stars",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("3.5412e26"),
    type: "normal",
    exponent: 0.25,
    branches: [["or19", 1, 2]],
    layerShown() { return player.or20.unlocked || hasUpgrade("or19", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "u", description: "u: reset for carbon stars",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or20", 11)) m = m.times(2)
        if (hasUpgrade("or20", 12)) m = m.times(upgradeEffect("or20", 12))
        if (hasUpgrade("or20", 13)) m = m.times(upgradeEffect("or20", 13))
        if (hasUpgrade("or20", 14)) m = m.times(upgradeEffect("or20", 14))
        if (hasUpgrade("or20", 15)) m = m.times(3)
        if (hasUpgrade("or20", 25)) m = m.times(upgradeEffect("or20", 25))
        if (hasMilestone("or20", 0)) m = m.times(2.5)
        if (getBuyableAmount("or20", 11).gte(1)) m = m.times(buyableEffect("or20", 11))
        if (hasUpgrade("or21", 23)) m = m.times(upgradeEffect("or21", 23))
        if (hasUpgrade("oa21", 31)) m = m.times(upgradeEffect("oa21", 31))
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
        let c = new Decimal("1e8")
        if (hasUpgrade("or20", 24)) c = c.times(1e3)
        if (hasMilestone("or20", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2) && hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("or20", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.or21.unlocked) return 'Next in the survey: <b>Blue Stragglers</b> — opens at ' + format(tmp.or21.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.or20.points.gte(1)) return 'Carbon Stars: best ' + format(player.or20.best) }],
        ["display-text", function() { if (player.or20.points.gte(tmp.or20.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.or20.softcap) + ' carbon stars' }],
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
        11: { title: "C/R Spectra",
              description: "Carbon Stars gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Sooty Winds",
              description: "Carbon Stars gain is boosted by your unspent carbon stars.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or20", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Dredge-Up Carbon",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("or20", 12) },
              effect() { let ret = player["or19"].points.add(1).pow(0.4)
                  if (hasUpgrade("or20", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 carbon stars; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("or20", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Carbon Stars gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("or20", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "C/R Spectra Resonance",
              description: "Dredge-Up Carbon is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("or20", 15) } },
        22: { title: "Ruby Dust Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("or20", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your carbon stars.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("or20", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Carbon Stars gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("or20", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("or20", 23) },
              effect() { return buyableEffect("or20", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("or20", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Carbon Stars gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["or20"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["or20"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["or20"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["or20"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Sooty Winds Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " carbon stars<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Ruby Dust Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " carbon stars<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.or20.unlocked && player.points.gte(tmp.or20.requires)) {
            player.or20.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("or20", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.or20.points = player.or20.points.add(tmp.or20.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("or21", {
    name: "Blue Stragglers",
    symbol: "BS",
    position: 0,
    row: 21,
    color: "#ffd162",
    resource: "blue stragglers",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("6.3741e27"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    canBuyMax() { return true },
    branches: [["or20", 1, 2]],
    layerShown() { return player.or21.unlocked || hasUpgrade("or20", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "v", description: "v: reset for blue stragglers",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or21", 11)) m = m.div(2)
        if (hasUpgrade("or21", 12)) m = m.div(upgradeEffect("or21", 12))
        if (hasUpgrade("or21", 13)) m = m.div(upgradeEffect("or21", 13))
        if (hasUpgrade("or21", 14)) m = m.div(upgradeEffect("or21", 14))
        if (hasUpgrade("or21", 15)) m = m.div(3)
        if (hasUpgrade("or21", 25)) m = m.div(upgradeEffect("or21", 25))
        if (hasMilestone("or21", 0)) m = m.div(2.5)
        if (getBuyableAmount("or21", 11).gte(1)) m = m.div(buyableEffect("or21", 11))
        if (hasUpgrade("or22", 23)) m = m.div(upgradeEffect("or22", 23))
        if (hasUpgrade("oa22", 31)) m = m.div(upgradeEffect("oa22", 31))
        if (hasChallenge("oa6", 13)) m = m.div(challengeEffect("oa6", 13))
        if (hasUpgrade("or21", 24)) m = m.div(1e3)
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.div(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2) && hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("or21", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.or22.unlocked) return 'Next in the survey: <b>Stellar Nurseries</b> — opens at ' + format(tmp.or22.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.or21.points.gte(1)) return 'Blue Stragglers: best ' + format(player.or21.best) }],
        ["display-text", function() { return 'Next blue stragglers floor: ' + format(tmp.or21.nextAt) + ' stardust' }],
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
        11: { title: "Collision Rejuvenation",
              description: "Blue Stragglers gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Mass Transfer Youth",
              description: "Blue Stragglers gain is boosted by your unspent blue stragglers.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("or21", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Off-sequence Blue",
              description: "The previous structure feeds this one.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("or21", 12) },
              effect() { let ret = player["or20"].points.add(1).pow(0.4)
                  if (hasUpgrade("or21", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 10 floors; ×5 more at 20.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("or21", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(10)) ret = ret.times(5)
                  if (player[this.layer].best.gte(20)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Blue Stragglers gain x3, and the next survey target appears on your map.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("or21", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Collision Rejuvenation Resonance",
              description: "Off-sequence Blue is raised to ^1.1.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("or21", 15) } },
        22: { title: "Cluster Elders Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("or21", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your blue stragglers.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("or21", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Next floor of blue stragglers costs 1,000× less stardust.",
              cost: new Decimal(32),
              unlocked() { return hasUpgrade("or21", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "costs ÷" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(48),
              unlocked() { return hasUpgrade("or21", 23) },
              effect() { return buyableEffect("or21", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(64),
              unlocked() { return hasUpgrade("or21", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 blue stragglers",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].best.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(15) } },
    },
    buyables: {
        11: { title: "Mass Transfer Youth Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " blue stragglers<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Cluster Elders Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " blue stragglers<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.or21.unlocked && player.points.gte(tmp.or21.requires)) {
            player.or21.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("or21", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.or21.points = player.or21.points.add(tmp.or21.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("or22", {
    name: "Stellar Nurseries",
    symbol: "NR",
    position: 0,
    row: 22,
    color: "#ffd162",
    resource: "stellar nurseries",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.1473e29"),
    type: "normal",
    exponent: 0.25,
    branches: [["or21", 1, 2]],
    layerShown() { return player.or22.unlocked || hasUpgrade("or21", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "w", description: "w: reset for stellar nurseries",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("or22", 11)) m = m.times(2)
        if (hasUpgrade("or22", 12)) m = m.times(upgradeEffect("or22", 12))
        if (hasUpgrade("or22", 13)) m = m.times(upgradeEffect("or22", 13))
        if (hasUpgrade("or22", 14)) m = m.times(upgradeEffect("or22", 14))
        if (hasUpgrade("or22", 15)) m = m.times(3)
        if (hasUpgrade("or22", 25)) m = m.times(upgradeEffect("or22", 25))
        if (hasMilestone("or22", 0)) m = m.times(2.5)
        if (getBuyableAmount("or22", 11).gte(1)) m = m.times(buyableEffect("or22", 11))
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
        let c = new Decimal("1e8")
        if (hasUpgrade("or22", 24)) c = c.times(1e3)
        if (hasMilestone("or22", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2) && hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("or22", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.mw.unlocked) return 'Next in the survey: <b>The Milky Way</b> — opens at ' + format(tmp.mw.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.or22.points.gte(1)) return 'Stellar Nurseries: best ' + format(player.or22.best) }],
        ["display-text", function() { if (player.or22.points.gte(tmp.or22.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.or22.softcap) + ' stellar nurseries' }],
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
        11: { title: "Embedded Clusters",
              description: "Stellar Nurseries gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Triggered Collapse",
              description: "Stellar Nurseries gain is boosted by your unspent stellar nurseries.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("or22", 11) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.5)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Protostellar Counts",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("or22", 12) },
              effect() { let ret = player["or21"].points.add(1).pow(0.4)
                  if (hasUpgrade("or22", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 stellar nurseries; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("or22", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "The Grand Assembly",
              description: "Stellar Nurseries gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("or22", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Embedded Clusters Resonance",
              description: "Protostellar Counts is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("or22", 15) } },
        22: { title: "The Circle Reborn Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("or22", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your stellar nurseries.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("or22", 15) },
              effect() { let ret = player[this.layer].points.add(1).pow(0.35).times(2)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Stellar Nurseries gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("or22", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("or22", 23) },
              effect() { return buyableEffect("or22", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("or22", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Stellar Nurseries gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["or22"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gain 2% of your reset gain every second, without resetting",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["or22"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["or22"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["or22"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Triggered Collapse Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " stellar nurseries<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "The Circle Reborn Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " stellar nurseries<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.or22.unlocked && player.points.gte(tmp.or22.requires)) {
            player.or22.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("or22", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.or22.points = player.or22.points.add(tmp.or22.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("pe16", {
    name: "PAHs",
    symbol: "PA",
    position: 1,
    row: 16,
    color: "#6ec6ff",
    resource: "pahs",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("8.4333e21"),
    type: "normal",
    exponent: 0.25,
    branches: [["pe15", 2, 2]],
    layerShown() { return player.pe16.unlocked || hasUpgrade("pe15", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "Q", description: "Shift+Q: reset for pahs",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe16", 11)) m = m.times(2)
        if (hasUpgrade("pe16", 12)) m = m.times(upgradeEffect("pe16", 12))
        if (hasUpgrade("pe16", 13)) m = m.times(upgradeEffect("pe16", 13))
        if (hasUpgrade("pe16", 14)) m = m.times(upgradeEffect("pe16", 14))
        if (hasUpgrade("pe16", 15)) m = m.times(3)
        if (hasUpgrade("pe16", 25)) m = m.times(upgradeEffect("pe16", 25))
        if (hasMilestone("pe16", 0)) m = m.times(2.5)
        if (getBuyableAmount("pe16", 11).gte(1)) m = m.times(buyableEffect("pe16", 11))
        if (hasUpgrade("pe17", 23)) m = m.times(upgradeEffect("pe17", 23))
        if (hasUpgrade("or17", 31)) m = m.times(upgradeEffect("or17", 31))
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
        let c = new Decimal("1e8")
        if (hasUpgrade("pe16", 24)) c = c.times(1e3)
        if (hasMilestone("pe16", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2) && hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("pe16", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.pe17.unlocked) return 'Next in the survey: <b>Water Masers</b> — opens at ' + format(tmp.pe17.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.pe16.points.gte(1)) return 'PAHs: best ' + format(player.pe16.best) }],
        ["display-text", function() { if (player.pe16.points.gte(tmp.pe16.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.pe16.softcap) + ' pahs' }],
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
        11: { title: "Unidentified Bands",
              description: "PAHs gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Aromatic Ripples",
              description: "PAHs gain is boosted by your unspent pahs.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe16", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Carbon Chemistry",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("pe16", 12) },
              effect() { let ret = player["pe15"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe16", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 pahs; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("pe16", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "PAHs gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("pe16", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Unidentified Bands Resonance",
              description: "Carbon Chemistry is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("pe16", 15) } },
        22: { title: "17-Micron Glow Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("pe16", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your pahs.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("pe16", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "PAHs gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("pe16", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("pe16", 23) },
              effect() { return buyableEffect("pe16", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("pe16", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "PAHs gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["pe16"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["pe16"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["pe16"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["pe16"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Aromatic Ripples Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " pahs<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "17-Micron Glow Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " pahs<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.pe16.unlocked && player.points.gte(tmp.pe16.requires)) {
            player.pe16.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("pe16", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.pe16.points = player.pe16.points.add(tmp.pe16.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("pe17", {
    name: "Water Masers",
    symbol: "WM",
    position: 1,
    row: 17,
    color: "#6ec6ff",
    resource: "water masers",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.518e23"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    canBuyMax() { return true },
    branches: [["pe16", 2, 2]],
    layerShown() { return player.pe17.unlocked || hasUpgrade("pe16", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "R", description: "Shift+R: reset for water masers",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe17", 11)) m = m.div(2)
        if (hasUpgrade("pe17", 12)) m = m.div(upgradeEffect("pe17", 12))
        if (hasUpgrade("pe17", 13)) m = m.div(upgradeEffect("pe17", 13))
        if (hasUpgrade("pe17", 14)) m = m.div(upgradeEffect("pe17", 14))
        if (hasUpgrade("pe17", 15)) m = m.div(3)
        if (hasUpgrade("pe17", 25)) m = m.div(upgradeEffect("pe17", 25))
        if (hasMilestone("pe17", 0)) m = m.div(2.5)
        if (getBuyableAmount("pe17", 11).gte(1)) m = m.div(buyableEffect("pe17", 11))
        if (hasUpgrade("pe18", 23)) m = m.div(upgradeEffect("pe18", 23))
        if (hasUpgrade("or18", 31)) m = m.div(upgradeEffect("or18", 31))
        if (hasChallenge("oa6", 13)) m = m.div(challengeEffect("oa6", 13))
        if (hasUpgrade("pe17", 24)) m = m.div(1e3)
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.div(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2) && hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("pe17", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.pe18.unlocked) return 'Next in the survey: <b>Methanol Masers</b> — opens at ' + format(tmp.pe18.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.pe17.points.gte(1)) return 'Water Masers: best ' + format(player.pe17.best) }],
        ["display-text", function() { return 'Next water masers floor: ' + format(tmp.pe17.nextAt) + ' stardust' }],
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
        11: { title: "22 GHz Spikes",
              description: "Water Masers gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Amplified Columns",
              description: "Water Masers gain is boosted by your unspent water masers.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("pe17", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Outflow Beacons",
              description: "The previous structure feeds this one.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("pe17", 12) },
              effect() { let ret = player["pe16"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe17", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 10 floors; ×5 more at 20.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("pe17", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(10)) ret = ret.times(5)
                  if (player[this.layer].best.gte(20)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Water Masers gain x3, and the next survey target appears on your map.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("pe17", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "22 GHz Spikes Resonance",
              description: "Outflow Beacons is raised to ^1.1.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("pe17", 15) } },
        22: { title: "Coherent Cascades Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("pe17", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your water masers.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("pe17", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Next floor of water masers costs 1,000× less stardust.",
              cost: new Decimal(32),
              unlocked() { return hasUpgrade("pe17", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "costs ÷" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(48),
              unlocked() { return hasUpgrade("pe17", 23) },
              effect() { return buyableEffect("pe17", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(64),
              unlocked() { return hasUpgrade("pe17", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 water masers",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].best.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(15) } },
    },
    buyables: {
        11: { title: "Amplified Columns Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " water masers<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Coherent Cascades Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " water masers<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.pe17.unlocked && player.points.gte(tmp.pe17.requires)) {
            player.pe17.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("pe17", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.pe17.points = player.pe17.points.add(tmp.pe17.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("pe18", {
    name: "Methanol Masers",
    symbol: "MM",
    position: 1,
    row: 18,
    color: "#6ec6ff",
    resource: "methanol masers",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("2.7324e24"),
    type: "normal",
    exponent: 0.25,
    branches: [["pe17", 2, 2]],
    layerShown() { return player.pe18.unlocked || hasUpgrade("pe17", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "S", description: "Shift+S: reset for methanol masers",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe18", 11)) m = m.times(2)
        if (hasUpgrade("pe18", 12)) m = m.times(upgradeEffect("pe18", 12))
        if (hasUpgrade("pe18", 13)) m = m.times(upgradeEffect("pe18", 13))
        if (hasUpgrade("pe18", 14)) m = m.times(upgradeEffect("pe18", 14))
        if (hasUpgrade("pe18", 15)) m = m.times(3)
        if (hasUpgrade("pe18", 25)) m = m.times(upgradeEffect("pe18", 25))
        if (hasMilestone("pe18", 0)) m = m.times(2.5)
        if (getBuyableAmount("pe18", 11).gte(1)) m = m.times(buyableEffect("pe18", 11))
        if (hasUpgrade("pe19", 23)) m = m.times(upgradeEffect("pe19", 23))
        if (hasUpgrade("or19", 31)) m = m.times(upgradeEffect("or19", 31))
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
        let c = new Decimal("1e8")
        if (hasUpgrade("pe18", 24)) c = c.times(1e3)
        if (hasMilestone("pe18", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2) && hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("pe18", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.pe19.unlocked) return 'Next in the survey: <b>Superbubbles</b> — opens at ' + format(tmp.pe19.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.pe18.points.gte(1)) return 'Methanol Masers: best ' + format(player.pe18.best) }],
        ["display-text", function() { if (player.pe18.points.gte(tmp.pe18.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.pe18.softcap) + ' methanol masers' }],
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
        11: { title: "6.7 cm Class",
              description: "Methanol Masers gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Ring Morphology",
              description: "Methanol Masers gain is boosted by your unspent methanol masers.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe18", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Pumped Towers",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("pe18", 12) },
              effect() { let ret = player["pe17"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe18", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 methanol masers; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("pe18", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Methanol Masers gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("pe18", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "6.7 cm Class Resonance",
              description: "Pumped Towers is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("pe18", 15) } },
        22: { title: "Hypercompact HII Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("pe18", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your methanol masers.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("pe18", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Methanol Masers gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("pe18", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("pe18", 23) },
              effect() { return buyableEffect("pe18", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("pe18", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Methanol Masers gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["pe18"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["pe18"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["pe18"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["pe18"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Ring Morphology Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " methanol masers<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Hypercompact HII Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " methanol masers<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.pe18.unlocked && player.points.gte(tmp.pe18.requires)) {
            player.pe18.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("pe18", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.pe18.points = player.pe18.points.add(tmp.pe18.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("pe19", {
    name: "Superbubbles",
    symbol: "SB",
    position: 1,
    row: 19,
    color: "#6ec6ff",
    resource: "superbubbles",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("4.9183e25"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    canBuyMax() { return true },
    branches: [["pe18", 2, 2]],
    layerShown() { return player.pe19.unlocked || hasUpgrade("pe18", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "T", description: "Shift+T: reset for superbubbles",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe19", 11)) m = m.div(2)
        if (hasUpgrade("pe19", 12)) m = m.div(upgradeEffect("pe19", 12))
        if (hasUpgrade("pe19", 13)) m = m.div(upgradeEffect("pe19", 13))
        if (hasUpgrade("pe19", 14)) m = m.div(upgradeEffect("pe19", 14))
        if (hasUpgrade("pe19", 15)) m = m.div(3)
        if (hasUpgrade("pe19", 25)) m = m.div(upgradeEffect("pe19", 25))
        if (hasMilestone("pe19", 0)) m = m.div(2.5)
        if (getBuyableAmount("pe19", 11).gte(1)) m = m.div(buyableEffect("pe19", 11))
        if (hasUpgrade("pe20", 23)) m = m.div(upgradeEffect("pe20", 23))
        if (hasUpgrade("or20", 31)) m = m.div(upgradeEffect("or20", 31))
        if (hasChallenge("oa6", 13)) m = m.div(challengeEffect("oa6", 13))
        if (hasUpgrade("pe19", 24)) m = m.div(1e3)
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.div(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2) && hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("pe19", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.pe20.unlocked) return 'Next in the survey: <b>Giant Molecular Clouds</b> — opens at ' + format(tmp.pe20.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.pe19.points.gte(1)) return 'Superbubbles: best ' + format(player.pe19.best) }],
        ["display-text", function() { return 'Next superbubbles floor: ' + format(tmp.pe19.nextAt) + ' stardust' }],
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
        11: { title: "Chimney Vents",
              description: "Superbubbles gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Collective Winds",
              description: "Superbubbles gain is boosted by your unspent superbubbles.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("pe19", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Loop I Arch",
              description: "The previous structure feeds this one.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("pe19", 12) },
              effect() { let ret = player["pe18"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe19", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 10 floors; ×5 more at 20.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("pe19", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(10)) ret = ret.times(5)
                  if (player[this.layer].best.gte(20)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Superbubbles gain x3, and the next survey target appears on your map.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("pe19", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Chimney Vents Resonance",
              description: "Loop I Arch is raised to ^1.1.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("pe19", 15) } },
        22: { title: "Breakout Shells Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("pe19", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your superbubbles.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("pe19", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Next floor of superbubbles costs 1,000× less stardust.",
              cost: new Decimal(32),
              unlocked() { return hasUpgrade("pe19", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "costs ÷" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(48),
              unlocked() { return hasUpgrade("pe19", 23) },
              effect() { return buyableEffect("pe19", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(64),
              unlocked() { return hasUpgrade("pe19", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 superbubbles",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].best.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(15) } },
    },
    buyables: {
        11: { title: "Collective Winds Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " superbubbles<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Breakout Shells Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " superbubbles<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.pe19.unlocked && player.points.gte(tmp.pe19.requires)) {
            player.pe19.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("pe19", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.pe19.points = player.pe19.points.add(tmp.pe19.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("pe20", {
    name: "Giant Molecular Clouds",
    symbol: "GM",
    position: 1,
    row: 20,
    color: "#6ec6ff",
    resource: "giant molecular clouds",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("8.8529e26"),
    type: "normal",
    exponent: 0.25,
    branches: [["pe19", 2, 2]],
    layerShown() { return player.pe20.unlocked || hasUpgrade("pe19", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "U", description: "Shift+U: reset for giant molecular clouds",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe20", 11)) m = m.times(2)
        if (hasUpgrade("pe20", 12)) m = m.times(upgradeEffect("pe20", 12))
        if (hasUpgrade("pe20", 13)) m = m.times(upgradeEffect("pe20", 13))
        if (hasUpgrade("pe20", 14)) m = m.times(upgradeEffect("pe20", 14))
        if (hasUpgrade("pe20", 15)) m = m.times(3)
        if (hasUpgrade("pe20", 25)) m = m.times(upgradeEffect("pe20", 25))
        if (hasMilestone("pe20", 0)) m = m.times(2.5)
        if (getBuyableAmount("pe20", 11).gte(1)) m = m.times(buyableEffect("pe20", 11))
        if (hasUpgrade("pe21", 23)) m = m.times(upgradeEffect("pe21", 23))
        if (hasUpgrade("or21", 31)) m = m.times(upgradeEffect("or21", 31))
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
        let c = new Decimal("1e8")
        if (hasUpgrade("pe20", 24)) c = c.times(1e3)
        if (hasMilestone("pe20", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2) && hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("pe20", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.pe21.unlocked) return 'Next in the survey: <b>Cloud Cores</b> — opens at ' + format(tmp.pe21.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.pe20.points.gte(1)) return 'Giant Molecular Clouds: best ' + format(player.pe20.best) }],
        ["display-text", function() { if (player.pe20.points.gte(tmp.pe20.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.pe20.softcap) + ' giant molecular clouds' }],
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
        11: { title: "Virial Balances",
              description: "Giant Molecular Clouds gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Clump Hierarchies",
              description: "Giant Molecular Clouds gain is boosted by your unspent giant molecular clouds.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe20", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Star Formation Laws",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("pe20", 12) },
              effect() { let ret = player["pe19"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe20", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 giant molecular clouds; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("pe20", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Giant Molecular Clouds gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("pe20", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Virial Balances Resonance",
              description: "Star Formation Laws is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("pe20", 15) } },
        22: { title: "Kennicutt-Schmidt Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("pe20", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your giant molecular clouds.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("pe20", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Giant Molecular Clouds gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("pe20", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("pe20", 23) },
              effect() { return buyableEffect("pe20", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("pe20", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Giant Molecular Clouds gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["pe20"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["pe20"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["pe20"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["pe20"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Clump Hierarchies Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " giant molecular clouds<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Kennicutt-Schmidt Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " giant molecular clouds<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.pe20.unlocked && player.points.gte(tmp.pe20.requires)) {
            player.pe20.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("pe20", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.pe20.points = player.pe20.points.add(tmp.pe20.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("pe21", {
    name: "Cloud Cores",
    symbol: "CC",
    position: 1,
    row: 21,
    color: "#6ec6ff",
    resource: "cloud cores",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.5935e28"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    canBuyMax() { return true },
    branches: [["pe20", 2, 2]],
    layerShown() { return player.pe21.unlocked || hasUpgrade("pe20", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "V", description: "Shift+V: reset for cloud cores",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe21", 11)) m = m.div(2)
        if (hasUpgrade("pe21", 12)) m = m.div(upgradeEffect("pe21", 12))
        if (hasUpgrade("pe21", 13)) m = m.div(upgradeEffect("pe21", 13))
        if (hasUpgrade("pe21", 14)) m = m.div(upgradeEffect("pe21", 14))
        if (hasUpgrade("pe21", 15)) m = m.div(3)
        if (hasUpgrade("pe21", 25)) m = m.div(upgradeEffect("pe21", 25))
        if (hasMilestone("pe21", 0)) m = m.div(2.5)
        if (getBuyableAmount("pe21", 11).gte(1)) m = m.div(buyableEffect("pe21", 11))
        if (hasUpgrade("pe22", 23)) m = m.div(upgradeEffect("pe22", 23))
        if (hasUpgrade("or22", 31)) m = m.div(upgradeEffect("or22", 31))
        if (hasChallenge("oa6", 13)) m = m.div(challengeEffect("oa6", 13))
        if (hasUpgrade("pe21", 24)) m = m.div(1e3)
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.div(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone(this.layer, 2) && hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("pe21", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.pe22.unlocked) return 'Next in the survey: <b>Evaporating Gaseous Globules</b> — opens at ' + format(tmp.pe22.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.pe21.points.gte(1)) return 'Cloud Cores: best ' + format(player.pe21.best) }],
        ["display-text", function() { return 'Next cloud cores floor: ' + format(tmp.pe21.nextAt) + ' stardust' }],
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
        11: { title: "Pre-stellar Peaks",
              description: "Cloud Cores gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Bonnor-Ebert Limits",
              description: "Cloud Cores gain is boosted by your unspent cloud cores.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("pe21", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "N2H+ Tracers",
              description: "The previous structure feeds this one.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("pe21", 12) },
              effect() { let ret = player["pe20"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe21", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 10 floors; ×5 more at 20.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("pe21", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(10)) ret = ret.times(5)
                  if (player[this.layer].best.gte(20)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Cloud Cores gain x3, and the next survey target appears on your map.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("pe21", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Pre-stellar Peaks Resonance",
              description: "N2H+ Tracers is raised to ^1.1.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("pe21", 15) } },
        22: { title: "Critical Stability Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("pe21", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your cloud cores.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("pe21", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Next floor of cloud cores costs 1,000× less stardust.",
              cost: new Decimal(32),
              unlocked() { return hasUpgrade("pe21", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "costs ÷" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(48),
              unlocked() { return hasUpgrade("pe21", 23) },
              effect() { return buyableEffect("pe21", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(64),
              unlocked() { return hasUpgrade("pe21", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 cloud cores",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].best.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(15) } },
    },
    buyables: {
        11: { title: "Bonnor-Ebert Limits Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " cloud cores<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Critical Stability Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " cloud cores<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.pe21.unlocked && player.points.gte(tmp.pe21.requires)) {
            player.pe21.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("pe21", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.pe21.points = player.pe21.points.add(tmp.pe21.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("pe22", {
    name: "Evaporating Gaseous Globules",
    symbol: "EG",
    position: 1,
    row: 22,
    color: "#6ec6ff",
    resource: "evaporating gaseous globules",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("2.8684e29"),
    type: "normal",
    exponent: 0.25,
    branches: [["pe21", 2, 2]],
    layerShown() { return player.pe22.unlocked || hasUpgrade("pe21", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    hotkeys: [
        { key: "W", description: "Shift+W: reset for evaporating gaseous globules",
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pe22", 11)) m = m.times(2)
        if (hasUpgrade("pe22", 12)) m = m.times(upgradeEffect("pe22", 12))
        if (hasUpgrade("pe22", 13)) m = m.times(upgradeEffect("pe22", 13))
        if (hasUpgrade("pe22", 14)) m = m.times(upgradeEffect("pe22", 14))
        if (hasUpgrade("pe22", 15)) m = m.times(3)
        if (hasUpgrade("pe22", 25)) m = m.times(upgradeEffect("pe22", 25))
        if (hasMilestone("pe22", 0)) m = m.times(2.5)
        if (getBuyableAmount("pe22", 11).gte(1)) m = m.times(buyableEffect("pe22", 11))
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
        let c = new Decimal("1e8")
        if (hasUpgrade("pe22", 24)) c = c.times(1e3)
        if (hasMilestone("pe22", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone(this.layer, 2) && hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("pe22", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.mw.unlocked) return 'Next in the survey: <b>The Milky Way</b> — opens at ' + format(tmp.mw.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.pe22.points.gte(1)) return 'Evaporating Gaseous Globules: best ' + format(player.pe22.best) }],
        ["display-text", function() { if (player.pe22.points.gte(tmp.pe22.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.pe22.softcap) + ' evaporating gaseous globules' }],
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
        11: { title: "Pillars of Creation",
              description: "Evaporating Gaseous Globules gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Photo-evaporation Flow",
              description: "Evaporating Gaseous Globules gain is boosted by your unspent evaporating gaseous globules.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("pe22", 11) },
              effect() { let ret = player[this.layer].points.add(10).log(10).plus(1).pow(2)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Tipped Umbrellas",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("pe22", 12) },
              effect() { let ret = player["pe21"].points.add(1).log(10).plus(1).pow(1.6)
                  if (hasUpgrade("pe22", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 evaporating gaseous globules; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("pe22", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "The Grand Assembly",
              description: "Evaporating Gaseous Globules gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("pe22", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Pillars of Creation Resonance",
              description: "Tipped Umbrellas is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("pe22", 15) } },
        22: { title: "Embedded EGGs Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("pe22", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your evaporating gaseous globules.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("pe22", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(1).pow(1.4)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Evaporating Gaseous Globules gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("pe22", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("pe22", 23) },
              effect() { return buyableEffect("pe22", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("pe22", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Evaporating Gaseous Globules gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["pe22"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Gas cloud gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["pe22"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Auto-prestige this layer",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["pe22"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["pe22"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Photo-evaporation Flow Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " evaporating gaseous globules<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Embedded EGGs Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " evaporating gaseous globules<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.pe22.unlocked && player.points.gte(tmp.pe22.requires)) {
            player.pe22.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("pe22", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.pe22.points = player.pe22.points.add(tmp.pe22.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("sg16", {
    name: "Tidal Streams",
    symbol: "TS",
    position: 2,
    row: 16,
    color: "#b388ff",
    resource: "tidal streams",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("2.024e22"),
    type: "normal",
    exponent: 0.25,
    branches: [["sg15", 3, 2]],
    layerShown() { return player.sg16.unlocked || hasUpgrade("sg15", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg16", 11)) m = m.times(2)
        if (hasUpgrade("sg16", 12)) m = m.times(upgradeEffect("sg16", 12))
        if (hasUpgrade("sg16", 13)) m = m.times(upgradeEffect("sg16", 13))
        if (hasUpgrade("sg16", 14)) m = m.times(upgradeEffect("sg16", 14))
        if (hasUpgrade("sg16", 15)) m = m.times(3)
        if (hasUpgrade("sg16", 25)) m = m.times(upgradeEffect("sg16", 25))
        if (hasMilestone("sg16", 0)) m = m.times(2.5)
        if (getBuyableAmount("sg16", 11).gte(1)) m = m.times(buyableEffect("sg16", 11))
        if (hasUpgrade("sg17", 23)) m = m.times(upgradeEffect("sg17", 23))
        if (hasUpgrade("pe17", 31)) m = m.times(upgradeEffect("pe17", 31))
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
        let c = new Decimal("1e8")
        if (hasUpgrade("sg16", 24)) c = c.times(1e3)
        if (hasMilestone("sg16", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("sg16", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.sg17.unlocked) return 'Next in the survey: <b>Satellite Mergers</b> — opens at ' + format(tmp.sg17.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.sg16.points.gte(1)) return 'Tidal Streams: best ' + format(player.sg16.best) }],
        ["display-text", function() { if (player.sg16.points.gte(tmp.sg16.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.sg16.softcap) + ' tidal streams' }],
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
        11: { title: "Orphan Stream",
              description: "Tidal Streams gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Fossils of merger",
              description: "Tidal Streams gain is boosted by your unspent tidal streams.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg16", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Leading Arm Gas",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("sg16", 12) },
              effect() { let ret = player["sg15"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg16", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 tidal streams; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("sg16", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Tidal Streams gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("sg16", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Orphan Stream Resonance",
              description: "Leading Arm Gas is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("sg16", 15) } },
        22: { title: "Wrap-around Debris Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("sg16", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your tidal streams.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("sg16", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Tidal Streams gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("sg16", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("sg16", 23) },
              effect() { return buyableEffect("sg16", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("sg16", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Tidal Streams gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["sg16"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["sg16"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["sg16"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["sg16"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Fossils of merger Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " tidal streams<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Wrap-around Debris Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " tidal streams<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.sg16.unlocked && player.points.gte(tmp.sg16.requires)) {
            player.sg16.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("sg16", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.sg16.points = player.sg16.points.add(tmp.sg16.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("sg17", {
    name: "Satellite Mergers",
    symbol: "SM",
    position: 2,
    row: 17,
    color: "#b388ff",
    resource: "satellite mergers",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("3.6432e23"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    canBuyMax() { return true },
    branches: [["sg16", 3, 2]],
    layerShown() { return player.sg17.unlocked || hasUpgrade("sg16", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg17", 11)) m = m.div(2)
        if (hasUpgrade("sg17", 12)) m = m.div(upgradeEffect("sg17", 12))
        if (hasUpgrade("sg17", 13)) m = m.div(upgradeEffect("sg17", 13))
        if (hasUpgrade("sg17", 14)) m = m.div(upgradeEffect("sg17", 14))
        if (hasUpgrade("sg17", 15)) m = m.div(3)
        if (hasUpgrade("sg17", 25)) m = m.div(upgradeEffect("sg17", 25))
        if (hasMilestone("sg17", 0)) m = m.div(2.5)
        if (getBuyableAmount("sg17", 11).gte(1)) m = m.div(buyableEffect("sg17", 11))
        if (hasUpgrade("sg18", 23)) m = m.div(upgradeEffect("sg18", 23))
        if (hasUpgrade("pe18", 31)) m = m.div(upgradeEffect("pe18", 31))
        if (hasChallenge("oa6", 13)) m = m.div(challengeEffect("oa6", 13))
        if (hasUpgrade("sg17", 24)) m = m.div(1e3)
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.div(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("sg17", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.sg18.unlocked) return 'Next in the survey: <b>Halo Subhalos</b> — opens at ' + format(tmp.sg18.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.sg17.points.gte(1)) return 'Satellite Mergers: best ' + format(player.sg17.best) }],
        ["display-text", function() { return 'Next satellite mergers floor: ' + format(tmp.sg17.nextAt) + ' stardust' }],
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
        11: { title: "Minor Accretion",
              description: "Satellite Mergers gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Heat Input",
              description: "Satellite Mergers gain is boosted by your unspent satellite mergers.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("sg17", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Thick Disc Recipes",
              description: "The previous structure feeds this one.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("sg17", 12) },
              effect() { let ret = player["sg16"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg17", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 10 floors; ×5 more at 20.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("sg17", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(10)) ret = ret.times(5)
                  if (player[this.layer].best.gte(20)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Satellite Mergers gain x3, and the next survey target appears on your map.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("sg17", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Minor Accretion Resonance",
              description: "Thick Disc Recipes is raised to ^1.1.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("sg17", 15) } },
        22: { title: "Archeological Records Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("sg17", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your satellite mergers.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("sg17", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Next floor of satellite mergers costs 1,000× less stardust.",
              cost: new Decimal(32),
              unlocked() { return hasUpgrade("sg17", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "costs ÷" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(48),
              unlocked() { return hasUpgrade("sg17", 23) },
              effect() { return buyableEffect("sg17", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(64),
              unlocked() { return hasUpgrade("sg17", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 satellite mergers",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].best.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(15) } },
    },
    buyables: {
        11: { title: "Heat Input Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " satellite mergers<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Archeological Records Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " satellite mergers<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.sg17.unlocked && player.points.gte(tmp.sg17.requires)) {
            player.sg17.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("sg17", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.sg17.points = player.sg17.points.add(tmp.sg17.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("sg18", {
    name: "Halo Subhalos",
    symbol: "HS",
    position: 2,
    row: 18,
    color: "#b388ff",
    resource: "halo subhalos",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("6.5577e24"),
    type: "normal",
    exponent: 0.25,
    branches: [["sg17", 3, 2]],
    layerShown() { return player.sg18.unlocked || hasUpgrade("sg17", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg18", 11)) m = m.times(2)
        if (hasUpgrade("sg18", 12)) m = m.times(upgradeEffect("sg18", 12))
        if (hasUpgrade("sg18", 13)) m = m.times(upgradeEffect("sg18", 13))
        if (hasUpgrade("sg18", 14)) m = m.times(upgradeEffect("sg18", 14))
        if (hasUpgrade("sg18", 15)) m = m.times(3)
        if (hasUpgrade("sg18", 25)) m = m.times(upgradeEffect("sg18", 25))
        if (hasMilestone("sg18", 0)) m = m.times(2.5)
        if (getBuyableAmount("sg18", 11).gte(1)) m = m.times(buyableEffect("sg18", 11))
        if (hasUpgrade("sg19", 23)) m = m.times(upgradeEffect("sg19", 23))
        if (hasUpgrade("pe19", 31)) m = m.times(upgradeEffect("pe19", 31))
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
        let c = new Decimal("1e8")
        if (hasUpgrade("sg18", 24)) c = c.times(1e3)
        if (hasMilestone("sg18", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("sg18", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.sg19.unlocked) return 'Next in the survey: <b>Cold Dark Matter</b> — opens at ' + format(tmp.sg19.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.sg18.points.gte(1)) return 'Halo Subhalos: best ' + format(player.sg18.best) }],
        ["display-text", function() { if (player.sg18.points.gte(tmp.sg18.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.sg18.softcap) + ' halo subhalos' }],
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
        11: { title: "Clausius Clumps",
              description: "Halo Subhalos gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Flux Anomalies",
              description: "Halo Subhalos gain is boosted by your unspent halo subhalos.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg18", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Missing Satellites",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("sg18", 12) },
              effect() { let ret = player["sg17"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg18", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 halo subhalos; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("sg18", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Halo Subhalos gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("sg18", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Clausius Clumps Resonance",
              description: "Missing Satellites is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("sg18", 15) } },
        22: { title: "Substructure Counts Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("sg18", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your halo subhalos.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("sg18", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Halo Subhalos gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("sg18", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("sg18", 23) },
              effect() { return buyableEffect("sg18", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("sg18", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Halo Subhalos gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["sg18"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["sg18"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["sg18"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["sg18"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Flux Anomalies Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " halo subhalos<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Substructure Counts Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " halo subhalos<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.sg18.unlocked && player.points.gte(tmp.sg18.requires)) {
            player.sg18.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("sg18", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.sg18.points = player.sg18.points.add(tmp.sg18.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("sg19", {
    name: "Cold Dark Matter",
    symbol: "CM",
    position: 2,
    row: 19,
    color: "#b388ff",
    resource: "cold dark matter",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.1804e26"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    canBuyMax() { return true },
    branches: [["sg18", 3, 2]],
    layerShown() { return player.sg19.unlocked || hasUpgrade("sg18", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg19", 11)) m = m.div(2)
        if (hasUpgrade("sg19", 12)) m = m.div(upgradeEffect("sg19", 12))
        if (hasUpgrade("sg19", 13)) m = m.div(upgradeEffect("sg19", 13))
        if (hasUpgrade("sg19", 14)) m = m.div(upgradeEffect("sg19", 14))
        if (hasUpgrade("sg19", 15)) m = m.div(3)
        if (hasUpgrade("sg19", 25)) m = m.div(upgradeEffect("sg19", 25))
        if (hasMilestone("sg19", 0)) m = m.div(2.5)
        if (getBuyableAmount("sg19", 11).gte(1)) m = m.div(buyableEffect("sg19", 11))
        if (hasUpgrade("sg20", 23)) m = m.div(upgradeEffect("sg20", 23))
        if (hasUpgrade("pe20", 31)) m = m.div(upgradeEffect("pe20", 31))
        if (hasChallenge("oa6", 13)) m = m.div(challengeEffect("oa6", 13))
        if (hasUpgrade("sg19", 24)) m = m.div(1e3)
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.div(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("sg19", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.sg20.unlocked) return 'Next in the survey: <b>WIMP Signals</b> — opens at ' + format(tmp.sg20.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.sg19.points.gte(1)) return 'Cold Dark Matter: best ' + format(player.sg19.best) }],
        ["display-text", function() { return 'Next cold dark matter floor: ' + format(tmp.sg19.nextAt) + ' stardust' }],
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
        11: { title: "Structure Hierarchy",
              description: "Cold Dark Matter gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Bottom-Up Assembly",
              description: "Cold Dark Matter gain is boosted by your unspent cold dark matter.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("sg19", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Power Spectrum Tilt",
              description: "The previous structure feeds this one.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("sg19", 12) },
              effect() { let ret = player["sg18"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg19", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 10 floors; ×5 more at 20.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("sg19", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(10)) ret = ret.times(5)
                  if (player[this.layer].best.gte(20)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Cold Dark Matter gain x3, and the next survey target appears on your map.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("sg19", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Structure Hierarchy Resonance",
              description: "Power Spectrum Tilt is raised to ^1.1.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("sg19", 15) } },
        22: { title: "ΛCDM Victory Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("sg19", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your cold dark matter.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("sg19", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Next floor of cold dark matter costs 1,000× less stardust.",
              cost: new Decimal(32),
              unlocked() { return hasUpgrade("sg19", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "costs ÷" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(48),
              unlocked() { return hasUpgrade("sg19", 23) },
              effect() { return buyableEffect("sg19", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(64),
              unlocked() { return hasUpgrade("sg19", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 cold dark matter",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].best.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(15) } },
    },
    buyables: {
        11: { title: "Bottom-Up Assembly Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " cold dark matter<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "ΛCDM Victory Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " cold dark matter<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.sg19.unlocked && player.points.gte(tmp.sg19.requires)) {
            player.sg19.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("sg19", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.sg19.points = player.sg19.points.add(tmp.sg19.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("sg20", {
    name: "WIMP Signals",
    symbol: "WI",
    position: 2,
    row: 20,
    color: "#b388ff",
    resource: "wimp signals",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("2.1247e27"),
    type: "normal",
    exponent: 0.25,
    branches: [["sg19", 3, 2]],
    layerShown() { return player.sg20.unlocked || hasUpgrade("sg19", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0), sweeps: 0, hits: 0 } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg20", 11)) m = m.times(2)
        if (hasUpgrade("sg20", 12)) m = m.times(upgradeEffect("sg20", 12))
        if (hasUpgrade("sg20", 13)) m = m.times(upgradeEffect("sg20", 13))
        if (hasUpgrade("sg20", 14)) m = m.times(upgradeEffect("sg20", 14))
        if (hasUpgrade("sg20", 15)) m = m.times(3)
        if (hasUpgrade("sg20", 25)) m = m.times(upgradeEffect("sg20", 25))
        if (hasMilestone("sg20", 0)) m = m.times(2.5)
        if (getBuyableAmount("sg20", 11).gte(1)) m = m.times(buyableEffect("sg20", 11))
        if (hasUpgrade("sg21", 23)) m = m.times(upgradeEffect("sg21", 23))
        if (hasUpgrade("pe21", 31)) m = m.times(upgradeEffect("pe21", 31))
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
        let c = new Decimal("1e8")
        if (hasUpgrade("sg20", 24)) c = c.times(1e3)
        if (hasMilestone("sg20", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("sg20", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.sg21.unlocked) return 'Next in the survey: <b>Dark Matter Filaments</b> — opens at ' + format(tmp.sg21.requires) + ' stardust. Nothing to buy first.' }],
        ["clickables", 1],
        ["display-text", function() { if (player.sg20.points.gte(1)) return 'WIMP Signals: best ' + format(player.sg20.best) }],
        ["display-text", function() { if (player.sg20.points.gte(tmp.sg20.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.sg20.softcap) + ' wimp signals' }],
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
        11: { title: "Nuclear Recoils",
              description: "WIMP Signals gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Annual Modulation",
              description: "WIMP Signals gain is boosted by your unspent wimp signals.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg20", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "XENON Liters",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("sg20", 12) },
              effect() { let ret = player["sg19"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg20", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 wimp signals; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("sg20", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "WIMP Signals gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("sg20", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Nuclear Recoils Resonance",
              description: "XENON Liters is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("sg20", 15) } },
        22: { title: "Cross-Section Ceilings Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("sg20", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your wimp signals.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("sg20", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "WIMP Signals gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("sg20", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("sg20", 23) },
              effect() { return buyableEffect("sg20", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("sg20", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "WIMP Signals gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["sg20"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["sg20"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["sg20"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["sg20"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Annual Modulation Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " wimp signals<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Cross-Section Ceilings Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " wimp signals<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
    },
clickables: {
        11: { title: "Detector Sweep",
              display() { return "Sweep the xenon vat for a WIMP recoil.<br>Sweeps: " + formatWhole(player.sg20.sweeps) + " — Hits: <b>" + formatWhole(player.sg20.hits) + "</b><br>Each hit: dark matter burst (scales with the Dark Matter Halo)" },
              canClick() { return true },
              onClick() {
                  player.sg20.sweeps = player.sg20.sweeps + 1
                  if (Math.random() < 0.2) {
                      player.sg20.hits = player.sg20.hits + 1
                      player.dm.darkMatter = player.dm.darkMatter.add(player.sg1.points.add(1).log(10).plus(1).pow(3))
                      makeParticles({ text: "WIMP!", color: "#b388ff", time: 2, layer: "sg20" }, 2)
                  }
              },
              style() { return { 'background-color': '#b388ff', 'color': '#1a0a2e', 'font-weight': 'bold' } } },
    },

    update(diff) {
        // Threshold admission. The engine's requires field is the reset-gain normaliser
        // (gain = (stardust/requires)^exp), so it is exactly the stardust at which this layer
        // can yield its first point — the layer opens itself here instead of waiting for a
        // purchased exit ticket, and the price was already printed in the tab above.
        if (!player.sg20.unlocked && player.points.gte(tmp.sg20.requires)) {
            player.sg20.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("sg20", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.sg20.points = player.sg20.points.add(tmp.sg20.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("sg21", {
    name: "Dark Matter Filaments",
    symbol: "DF",
    position: 2,
    row: 21,
    color: "#b388ff",
    resource: "dark matter filaments",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("3.8245e28"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    canBuyMax() { return true },
    branches: [["sg20", 3, 2]],
    layerShown() { return player.sg21.unlocked || hasUpgrade("sg20", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg21", 11)) m = m.div(2)
        if (hasUpgrade("sg21", 12)) m = m.div(upgradeEffect("sg21", 12))
        if (hasUpgrade("sg21", 13)) m = m.div(upgradeEffect("sg21", 13))
        if (hasUpgrade("sg21", 14)) m = m.div(upgradeEffect("sg21", 14))
        if (hasUpgrade("sg21", 15)) m = m.div(3)
        if (hasUpgrade("sg21", 25)) m = m.div(upgradeEffect("sg21", 25))
        if (hasMilestone("sg21", 0)) m = m.div(2.5)
        if (getBuyableAmount("sg21", 11).gte(1)) m = m.div(buyableEffect("sg21", 11))
        if (hasUpgrade("sg22", 23)) m = m.div(upgradeEffect("sg22", 23))
        if (hasUpgrade("pe22", 31)) m = m.div(upgradeEffect("pe22", 31))
        if (hasChallenge("oa6", 13)) m = m.div(challengeEffect("oa6", 13))
        if (hasUpgrade("sg21", 24)) m = m.div(1e3)
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.div(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("sg21", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.sg22.unlocked) return 'Next in the survey: <b>The Grand Bulge</b> — opens at ' + format(tmp.sg22.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.sg21.points.gte(1)) return 'Dark Matter Filaments: best ' + format(player.sg21.best) }],
        ["display-text", function() { return 'Next dark matter filaments floor: ' + format(tmp.sg21.nextAt) + ' stardust' }],
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
        11: { title: "Bridge Populations",
              description: "Dark Matter Filaments gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Infall Patterns",
              description: "Dark Matter Filaments gain is boosted by your unspent dark matter filaments.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("sg21", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Weak Lensing Spines",
              description: "The previous structure feeds this one.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("sg21", 12) },
              effect() { let ret = player["sg20"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg21", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 10 floors; ×5 more at 20.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("sg21", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(10)) ret = ret.times(5)
                  if (player[this.layer].best.gte(20)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Dark Matter Filaments gain x3, and the next survey target appears on your map.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("sg21", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Bridge Populations Resonance",
              description: "Weak Lensing Spines is raised to ^1.1.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("sg21", 15) } },
        22: { title: "Skeleton Maps Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("sg21", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your dark matter filaments.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("sg21", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Next floor of dark matter filaments costs 1,000× less stardust.",
              cost: new Decimal(32),
              unlocked() { return hasUpgrade("sg21", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "costs ÷" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(48),
              unlocked() { return hasUpgrade("sg21", 23) },
              effect() { return buyableEffect("sg21", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(64),
              unlocked() { return hasUpgrade("sg21", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 dark matter filaments",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].best.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(15) } },
    },
    buyables: {
        11: { title: "Infall Patterns Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " dark matter filaments<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Skeleton Maps Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " dark matter filaments<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.sg21.unlocked && player.points.gte(tmp.sg21.requires)) {
            player.sg21.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("sg21", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.sg21.points = player.sg21.points.add(tmp.sg21.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("sg22", {
    name: "The Grand Bulge",
    symbol: "TGB",
    position: 2,
    row: 22,
    color: "#b388ff",
    resource: "the grand bulge",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("6.884e29"),
    type: "normal",
    exponent: 0.25,
    branches: [["sg21", 3, 2]],
    layerShown() { return player.sg22.unlocked || hasUpgrade("sg21", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("sg22", 11)) m = m.times(2)
        if (hasUpgrade("sg22", 12)) m = m.times(upgradeEffect("sg22", 12))
        if (hasUpgrade("sg22", 13)) m = m.times(upgradeEffect("sg22", 13))
        if (hasUpgrade("sg22", 14)) m = m.times(upgradeEffect("sg22", 14))
        if (hasUpgrade("sg22", 15)) m = m.times(3)
        if (hasUpgrade("sg22", 25)) m = m.times(upgradeEffect("sg22", 25))
        if (hasMilestone("sg22", 0)) m = m.times(2.5)
        if (getBuyableAmount("sg22", 11).gte(1)) m = m.times(buyableEffect("sg22", 11))
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
        let c = new Decimal("1e8")
        if (hasUpgrade("sg22", 24)) c = c.times(1e3)
        if (hasMilestone("sg22", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("sg22", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.mw.unlocked) return 'Next in the survey: <b>The Milky Way</b> — opens at ' + format(tmp.mw.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.sg22.points.gte(1)) return 'The Grand Bulge: best ' + format(player.sg22.best) }],
        ["display-text", function() { if (player.sg22.points.gte(tmp.sg22.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.sg22.softcap) + ' the grand bulge' }],
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
        11: { title: "Final Concentration",
              description: "The Grand Bulge gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Coherent Inflow",
              description: "The Grand Bulge gain is boosted by your unspent the grand bulge.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("sg22", 11) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(2)
                  ret = softcap(ret, new Decimal("1e60"), 0.5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Bar Fueling",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("sg22", 12) },
              effect() { let ret = player["sg21"].points.max(1).root(2).times(3)
                  if (hasUpgrade("sg22", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 the grand bulge; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("sg22", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "The Grand Assembly",
              description: "The Grand Bulge gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("sg22", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Final Concentration Resonance",
              description: "Bar Fueling is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("sg22", 15) } },
        22: { title: "Nuclear Disc Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("sg22", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your the grand bulge.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("sg22", 15) },
              effect() { let ret = player[this.layer].points.max(1).root(2).times(3)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "The Grand Bulge gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("sg22", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("sg22", 23) },
              effect() { return buyableEffect("sg22", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("sg22", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "The Grand Bulge gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["sg22"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Planetary system gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["sg22"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["sg22"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["sg22"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Coherent Inflow Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " the grand bulge<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Nuclear Disc Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " the grand bulge<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.sg22.unlocked && player.points.gte(tmp.sg22.requires)) {
            player.sg22.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("sg22", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.sg22.points = player.sg22.points.add(tmp.sg22.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("oa16", {
    name: "Gravitational Waves",
    symbol: "GWV",
    position: 3,
    row: 16,
    color: "#ff8a80",
    resource: "gravitational waves",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("5.06e22"),
    type: "normal",
    exponent: 0.25,
    branches: [["oa15", 1, 2]],
    layerShown() { return player.oa16.unlocked || hasUpgrade("oa15", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa16", 11)) m = m.times(2)
        if (hasUpgrade("oa16", 12)) m = m.times(upgradeEffect("oa16", 12))
        if (hasUpgrade("oa16", 13)) m = m.times(upgradeEffect("oa16", 13))
        if (hasUpgrade("oa16", 14)) m = m.times(upgradeEffect("oa16", 14))
        if (hasUpgrade("oa16", 15)) m = m.times(3)
        if (hasUpgrade("oa16", 25)) m = m.times(upgradeEffect("oa16", 25))
        if (hasMilestone("oa16", 0)) m = m.times(2.5)
        if (getBuyableAmount("oa16", 11).gte(1)) m = m.times(buyableEffect("oa16", 11))
        if (hasUpgrade("oa17", 23)) m = m.times(upgradeEffect("oa17", 23))
        if (hasUpgrade("sg17", 31)) m = m.times(upgradeEffect("sg17", 31))
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
        let c = new Decimal("1e8")
        if (hasUpgrade("oa16", 24)) c = c.times(1e3)
        if (hasMilestone("oa16", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("oa16", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.oa17.unlocked) return 'Next in the survey: <b>Neutron-Star Mergers</b> — opens at ' + format(tmp.oa17.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.oa16.points.gte(1)) return 'Gravitational Waves: best ' + format(player.oa16.best) }],
        ["display-text", function() { if (player.oa16.points.gte(tmp.oa16.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.oa16.softcap) + ' gravitational waves' }],
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
        11: { title: "Chirp Masses",
              description: "Gravitational Waves gain ×2.",
              cost: new Decimal(1) },
        12: { title: "LIGO Strain",
              description: "Gravitational Waves gain is boosted by your unspent gravitational waves.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa16", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e60")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e60e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Ringdown Modes",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("oa16", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa15"].points.gte(100)) ret = ret.times(5)
                  if (player["oa15"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa16", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 gravitational waves; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("oa16", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Gravitational Waves gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("oa16", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Chirp Masses Resonance",
              description: "Ringdown Modes is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("oa16", 15) } },
        22: { title: "Quadripole Whispers Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("oa16", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your gravitational waves.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("oa16", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(2).pow(1.5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Gravitational Waves gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("oa16", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("oa16", 23) },
              effect() { return buyableEffect("oa16", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("oa16", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Gravitational Waves gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["oa16"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["oa16"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["oa16"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["oa16"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "LIGO Strain Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " gravitational waves<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Quadripole Whispers Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " gravitational waves<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.oa16.unlocked && player.points.gte(tmp.oa16.requires)) {
            player.oa16.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("oa16", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.oa16.points = player.oa16.points.add(tmp.oa16.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("oa17", {
    name: "Neutron-Star Mergers",
    symbol: "NM",
    position: 3,
    row: 17,
    color: "#ff8a80",
    resource: "neutron-star mergers",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("9.108e23"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    canBuyMax() { return true },
    branches: [["oa16", 1, 2]],
    layerShown() { return player.oa17.unlocked || hasUpgrade("oa16", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa17", 11)) m = m.div(2)
        if (hasUpgrade("oa17", 12)) m = m.div(upgradeEffect("oa17", 12))
        if (hasUpgrade("oa17", 13)) m = m.div(upgradeEffect("oa17", 13))
        if (hasUpgrade("oa17", 14)) m = m.div(upgradeEffect("oa17", 14))
        if (hasUpgrade("oa17", 15)) m = m.div(3)
        if (hasUpgrade("oa17", 25)) m = m.div(upgradeEffect("oa17", 25))
        if (hasMilestone("oa17", 0)) m = m.div(2.5)
        if (getBuyableAmount("oa17", 11).gte(1)) m = m.div(buyableEffect("oa17", 11))
        if (hasUpgrade("oa18", 23)) m = m.div(upgradeEffect("oa18", 23))
        if (hasUpgrade("sg18", 31)) m = m.div(upgradeEffect("sg18", 31))
        if (hasChallenge("oa6", 13)) m = m.div(challengeEffect("oa6", 13))
        if (hasUpgrade("oa17", 24)) m = m.div(1e3)
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.div(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("oa17", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.oa18.unlocked) return 'Next in the survey: <b>Pair-Instability SNe</b> — opens at ' + format(tmp.oa18.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.oa17.points.gte(1)) return 'Neutron-Star Mergers: best ' + format(player.oa17.best) }],
        ["display-text", function() { return 'Next neutron-star mergers floor: ' + format(tmp.oa17.nextAt) + ' stardust' }],
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
        11: { title: "Inspiral Chains",
              description: "Neutron-Star Mergers gain ×2.",
              cost: new Decimal(1) },
        12: { title: "GW170817",
              description: "Neutron-Star Mergers gain is boosted by your unspent neutron-star mergers.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("oa17", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e60")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e60e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Kilonova Partner",
              description: "The previous structure feeds this one.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("oa17", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa16"].points.gte(100)) ret = ret.times(5)
                  if (player["oa16"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa17", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 10 floors; ×5 more at 20.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("oa17", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(10)) ret = ret.times(5)
                  if (player[this.layer].best.gte(20)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Neutron-Star Mergers gain x3, and the next survey target appears on your map.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("oa17", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Inspiral Chains Resonance",
              description: "Kilonova Partner is raised to ^1.1.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("oa17", 15) } },
        22: { title: "Delay Time Distributions Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("oa17", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your neutron-star mergers.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("oa17", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(2).pow(1.5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Next floor of neutron-star mergers costs 1,000× less stardust.",
              cost: new Decimal(32),
              unlocked() { return hasUpgrade("oa17", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "costs ÷" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(48),
              unlocked() { return hasUpgrade("oa17", 23) },
              effect() { return buyableEffect("oa17", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(64),
              unlocked() { return hasUpgrade("oa17", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 neutron-star mergers",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].best.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(15) } },
    },
    buyables: {
        11: { title: "GW170817 Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " neutron-star mergers<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Delay Time Distributions Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " neutron-star mergers<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.oa17.unlocked && player.points.gte(tmp.oa17.requires)) {
            player.oa17.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("oa17", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.oa17.points = player.oa17.points.add(tmp.oa17.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("oa18", {
    name: "Pair-Instability SNe",
    symbol: "PI",
    position: 3,
    row: 18,
    color: "#ff8a80",
    resource: "pair-instability sne",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.6394e25"),
    type: "normal",
    exponent: 0.25,
    branches: [["oa17", 1, 2]],
    layerShown() { return player.oa18.unlocked || hasUpgrade("oa17", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa18", 11)) m = m.times(2)
        if (hasUpgrade("oa18", 12)) m = m.times(upgradeEffect("oa18", 12))
        if (hasUpgrade("oa18", 13)) m = m.times(upgradeEffect("oa18", 13))
        if (hasUpgrade("oa18", 14)) m = m.times(upgradeEffect("oa18", 14))
        if (hasUpgrade("oa18", 15)) m = m.times(3)
        if (hasUpgrade("oa18", 25)) m = m.times(upgradeEffect("oa18", 25))
        if (hasMilestone("oa18", 0)) m = m.times(2.5)
        if (getBuyableAmount("oa18", 11).gte(1)) m = m.times(buyableEffect("oa18", 11))
        if (hasUpgrade("oa19", 23)) m = m.times(upgradeEffect("oa19", 23))
        if (hasUpgrade("sg19", 31)) m = m.times(upgradeEffect("sg19", 31))
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
        let c = new Decimal("1e8")
        if (hasUpgrade("oa18", 24)) c = c.times(1e3)
        if (hasMilestone("oa18", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("oa18", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.oa19.unlocked) return 'Next in the survey: <b>Luminous Red Novae</b> — opens at ' + format(tmp.oa19.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.oa18.points.gte(1)) return 'Pair-Instability SNe: best ' + format(player.oa18.best) }],
        ["display-text", function() { if (player.oa18.points.gte(tmp.oa18.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.oa18.softcap) + ' pair-instability sne' }],
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
        11: { title: "Antimatter Core",
              description: "Pair-Instability SNe gain ×2.",
              cost: new Decimal(1) },
        12: { title: "PISN Benchmarks",
              description: "Pair-Instability SNe gain is boosted by your unspent pair-instability sne.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa18", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e60")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e60e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Total Disruption",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("oa18", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa17"].points.gte(100)) ret = ret.times(5)
                  if (player["oa17"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa18", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 pair-instability sne; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("oa18", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Pair-Instability SNe gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("oa18", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Antimatter Core Resonance",
              description: "Total Disruption is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("oa18", 15) } },
        22: { title: "Nickel Rain Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("oa18", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your pair-instability sne.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("oa18", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(2).pow(1.5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Pair-Instability SNe gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("oa18", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("oa18", 23) },
              effect() { return buyableEffect("oa18", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("oa18", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Pair-Instability SNe gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["oa18"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["oa18"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["oa18"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets (+ band package deal)",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["oa18"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "PISN Benchmarks Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " pair-instability sne<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Nickel Rain Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " pair-instability sne<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.oa18.unlocked && player.points.gte(tmp.oa18.requires)) {
            player.oa18.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("oa18", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.oa18.points = player.oa18.points.add(tmp.oa18.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("oa19", {
    name: "Luminous Red Novae",
    symbol: "LN",
    position: 3,
    row: 19,
    color: "#ff8a80",
    resource: "luminous red novae",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("2.951e26"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    canBuyMax() { return true },
    branches: [["oa18", 1, 2]],
    layerShown() { return player.oa19.unlocked || hasUpgrade("oa18", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa19", 11)) m = m.div(2)
        if (hasUpgrade("oa19", 12)) m = m.div(upgradeEffect("oa19", 12))
        if (hasUpgrade("oa19", 13)) m = m.div(upgradeEffect("oa19", 13))
        if (hasUpgrade("oa19", 14)) m = m.div(upgradeEffect("oa19", 14))
        if (hasUpgrade("oa19", 15)) m = m.div(3)
        if (hasUpgrade("oa19", 25)) m = m.div(upgradeEffect("oa19", 25))
        if (hasMilestone("oa19", 0)) m = m.div(2.5)
        if (getBuyableAmount("oa19", 11).gte(1)) m = m.div(buyableEffect("oa19", 11))
        if (hasUpgrade("oa20", 23)) m = m.div(upgradeEffect("oa20", 23))
        if (hasUpgrade("sg20", 31)) m = m.div(upgradeEffect("sg20", 31))
        if (hasChallenge("oa6", 13)) m = m.div(challengeEffect("oa6", 13))
        if (hasUpgrade("oa19", 24)) m = m.div(1e3)
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.div(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("oa19", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.oa20.unlocked) return 'Next in the survey: <b>Cosmic Neutrinos</b> — opens at ' + format(tmp.oa20.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.oa19.points.gte(1)) return 'Luminous Red Novae: best ' + format(player.oa19.best) }],
        ["display-text", function() { return 'Next luminous red novae floor: ' + format(tmp.oa19.nextAt) + ' stardust' }],
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
        11: { title: "V838 Monocerotis",
              description: "Luminous Red Novae gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Merging Envelopes",
              description: "Luminous Red Novae gain is boosted by your unspent luminous red novae.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("oa19", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e60")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e60e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Red Outbursts",
              description: "The previous structure feeds this one.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("oa19", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa18"].points.gte(100)) ret = ret.times(5)
                  if (player["oa18"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa19", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 10 floors; ×5 more at 20.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("oa19", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(10)) ret = ret.times(5)
                  if (player[this.layer].best.gte(20)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Luminous Red Novae gain x3, and the next survey target appears on your map.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("oa19", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "V838 Monocerotis Resonance",
              description: "Red Outbursts is raised to ^1.1.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("oa19", 15) } },
        22: { title: "Light Echo Walls Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("oa19", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your luminous red novae.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("oa19", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(2).pow(1.5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Next floor of luminous red novae costs 1,000× less stardust.",
              cost: new Decimal(32),
              unlocked() { return hasUpgrade("oa19", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "costs ÷" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(48),
              unlocked() { return hasUpgrade("oa19", 23) },
              effect() { return buyableEffect("oa19", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(64),
              unlocked() { return hasUpgrade("oa19", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 luminous red novae",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].best.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(15) } },
    },
    buyables: {
        11: { title: "Merging Envelopes Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " luminous red novae<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Light Echo Walls Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " luminous red novae<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.oa19.unlocked && player.points.gte(tmp.oa19.requires)) {
            player.oa19.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("oa19", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.oa19.points = player.oa19.points.add(tmp.oa19.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("oa20", {
    name: "Cosmic Neutrinos",
    symbol: "CN",
    position: 3,
    row: 20,
    color: "#ff8a80",
    resource: "cosmic neutrinos",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("5.3118e27"),
    type: "normal",
    exponent: 0.25,
    branches: [["oa19", 1, 2]],
    layerShown() { return player.oa20.unlocked || hasUpgrade("oa19", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa20", 11)) m = m.times(2)
        if (hasUpgrade("oa20", 12)) m = m.times(upgradeEffect("oa20", 12))
        if (hasUpgrade("oa20", 13)) m = m.times(upgradeEffect("oa20", 13))
        if (hasUpgrade("oa20", 14)) m = m.times(upgradeEffect("oa20", 14))
        if (hasUpgrade("oa20", 15)) m = m.times(3)
        if (hasUpgrade("oa20", 25)) m = m.times(upgradeEffect("oa20", 25))
        if (hasMilestone("oa20", 0)) m = m.times(2.5)
        if (getBuyableAmount("oa20", 11).gte(1)) m = m.times(buyableEffect("oa20", 11))
        if (hasUpgrade("oa21", 23)) m = m.times(upgradeEffect("oa21", 23))
        if (hasUpgrade("sg21", 31)) m = m.times(upgradeEffect("sg21", 31))
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
        let c = new Decimal("1e8")
        if (hasUpgrade("oa20", 24)) c = c.times(1e3)
        if (hasMilestone("oa20", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("oa20", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.oa21.unlocked) return 'Next in the survey: <b>UHE Cosmic Rays</b> — opens at ' + format(tmp.oa21.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.oa20.points.gte(1)) return 'Cosmic Neutrinos: best ' + format(player.oa20.best) }],
        ["display-text", function() { if (player.oa20.points.gte(tmp.oa20.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.oa20.softcap) + ' cosmic neutrinos' }],
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
        11: { title: "IceCube Cascades",
              description: "Cosmic Neutrinos gain ×2.",
              cost: new Decimal(1) },
        12: { title: "SN 1987A Handful",
              description: "Cosmic Neutrinos gain is boosted by your unspent cosmic neutrinos.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa20", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e60")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e60e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Flavor Oscillation",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("oa20", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa19"].points.gte(100)) ret = ret.times(5)
                  if (player["oa19"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa20", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 cosmic neutrinos; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("oa20", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "Cosmic Neutrinos gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("oa20", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "IceCube Cascades Resonance",
              description: "Flavor Oscillation is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("oa20", 15) } },
        22: { title: "Weak Interactions Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("oa20", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your cosmic neutrinos.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("oa20", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(2).pow(1.5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Cosmic Neutrinos gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("oa20", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("oa20", 23) },
              effect() { return buyableEffect("oa20", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("oa20", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "Cosmic Neutrinos gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["oa20"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["oa20"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["oa20"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["oa20"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "SN 1987A Handful Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " cosmic neutrinos<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Weak Interactions Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " cosmic neutrinos<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.oa20.unlocked && player.points.gte(tmp.oa20.requires)) {
            player.oa20.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("oa20", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.oa20.points = player.oa20.points.add(tmp.oa20.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("oa21", {
    name: "UHE Cosmic Rays",
    symbol: "UH",
    position: 3,
    row: 21,
    color: "#ff8a80",
    resource: "uhe cosmic rays",
    resetDescription: "Dig deeper for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("9.5612e28"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    canBuyMax() { return true },
    branches: [["oa20", 1, 2]],
    layerShown() { return player.oa21.unlocked || hasUpgrade("oa20", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa21", 11)) m = m.div(2)
        if (hasUpgrade("oa21", 12)) m = m.div(upgradeEffect("oa21", 12))
        if (hasUpgrade("oa21", 13)) m = m.div(upgradeEffect("oa21", 13))
        if (hasUpgrade("oa21", 14)) m = m.div(upgradeEffect("oa21", 14))
        if (hasUpgrade("oa21", 15)) m = m.div(3)
        if (hasUpgrade("oa21", 25)) m = m.div(upgradeEffect("oa21", 25))
        if (hasMilestone("oa21", 0)) m = m.div(2.5)
        if (getBuyableAmount("oa21", 11).gte(1)) m = m.div(buyableEffect("oa21", 11))
        if (hasUpgrade("oa22", 23)) m = m.div(upgradeEffect("oa22", 23))
        if (hasUpgrade("sg22", 31)) m = m.div(upgradeEffect("sg22", 31))
        if (hasChallenge("oa6", 13)) m = m.div(challengeEffect("oa6", 13))
        if (hasUpgrade("oa21", 24)) m = m.div(1e3)
        if (hasUpgrade("dm", 23)) m = m.div(1e6)
        if (player.mw.unlocked) m = m.div(tmp.mw.effect.armFeed)
        if (hasMilestone("mw", 4)) m = m.div(1e4)
        if (inChallenge("oa6", 11) || inChallenge("oa6", 14)) m = m.pow(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { if (hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("oa21", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.oa22.unlocked) return 'Next in the survey: <b>The Last Outburst</b> — opens at ' + format(tmp.oa22.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.oa21.points.gte(1)) return 'UHE Cosmic Rays: best ' + format(player.oa21.best) }],
        ["display-text", function() { return 'Next uhe cosmic rays floor: ' + format(tmp.oa21.nextAt) + ' stardust' }],
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
        11: { title: "Oh-My-God Particle",
              description: "UHE Cosmic Rays gain ×2.",
              cost: new Decimal(1) },
        12: { title: "GZK Cutoff",
              description: "UHE Cosmic Rays gain is boosted by your unspent uhe cosmic rays.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("oa21", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e60")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e60e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Auger Showers",
              description: "The previous structure feeds this one.",
              cost: new Decimal(4),
              unlocked() { return hasUpgrade("oa21", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa20"].points.gte(100)) ret = ret.times(5)
                  if (player["oa20"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa21", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 10 floors; ×5 more at 20.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("oa21", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(10)) ret = ret.times(5)
                  if (player[this.layer].best.gte(20)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "Deeper Into the Arm",
              description: "UHE Cosmic Rays gain x3, and the next survey target appears on your map.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("oa21", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Oh-My-God Particle Resonance",
              description: "Auger Showers is raised to ^1.1.",
              cost: new Decimal(2),
              unlocked() { return hasUpgrade("oa21", 15) } },
        22: { title: "Arrival Anisotropy Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(8),
              unlocked() { return hasUpgrade("oa21", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your uhe cosmic rays.",
              cost: new Decimal(16),
              unlocked() { return hasUpgrade("oa21", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(2).pow(1.5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "Next floor of uhe cosmic rays costs 1,000× less stardust.",
              cost: new Decimal(32),
              unlocked() { return hasUpgrade("oa21", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "costs ÷" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(48),
              unlocked() { return hasUpgrade("oa21", 23) },
              effect() { return buyableEffect("oa21", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(64),
              unlocked() { return hasUpgrade("oa21", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "3 uhe cosmic rays",
             effectDescription: "Costs ÷2.5",
             done() { return player[this.layer].best.gte(3) } },
        1: { requirementDescription: "6 floors",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(6) } },
        2: { requirementDescription: "10 floors",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "15 floors",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(15) } },
    },
    buyables: {
        11: { title: "GZK Cutoff Press",
              cost(x) { return Decimal.pow(1.6, x).times(2) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " uhe cosmic rays<br>Costs ÷" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Arrival Anisotropy Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " uhe cosmic rays<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.oa21.unlocked && player.points.gte(tmp.oa21.requires)) {
            player.oa21.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("oa21", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.oa21.points = player.oa21.points.add(tmp.oa21.resetGain.times(0.02).times(diff))
        }
    },
})

addLayer("oa22", {
    name: "The Last Outburst",
    symbol: "LO",
    position: 3,
    row: 22,
    color: "#ff8a80",
    resource: "the last outburst",
    resetDescription: "Collapse stardust for ",
    baseResource: "stardust",
    baseAmount() { return player.points },
    requires: new Decimal("1.721e30"),
    type: "normal",
    exponent: 0.25,
    branches: [["oa21", 1, 2]],
    layerShown() { return player.oa22.unlocked || hasUpgrade("oa21", 15) },
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("oa22", 11)) m = m.times(2)
        if (hasUpgrade("oa22", 12)) m = m.times(upgradeEffect("oa22", 12))
        if (hasUpgrade("oa22", 13)) m = m.times(upgradeEffect("oa22", 13))
        if (hasUpgrade("oa22", 14)) m = m.times(upgradeEffect("oa22", 14))
        if (hasUpgrade("oa22", 15)) m = m.times(3)
        if (hasUpgrade("oa22", 25)) m = m.times(upgradeEffect("oa22", 25))
        if (hasMilestone("oa22", 0)) m = m.times(2.5)
        if (getBuyableAmount("oa22", 11).gte(1)) m = m.times(buyableEffect("oa22", 11))
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
        let c = new Decimal("1e8")
        if (hasUpgrade("oa22", 24)) c = c.times(1e3)
        if (hasMilestone("oa22", 2)) c = c.times(1e6)
        return c
    },
    softcapPower() { return new Decimal(0.4) },

    autoPrestige() { if (hasMilestone("sg18", 3)) return true },
    passiveGeneration() { if (hasMilestone("sg18", 3)) return 1 },
    autoUpgrade() { if (hasMilestone("sg18", 3)) return true },
    resetsNothing() { if (hasMilestone("sg18", 3)) return true },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        if (hasMilestone("mw", 3) && this.row <= 10) return
        let kept = ["unlocked", "auto", "milestones", "best", "total"]
        if (hasMilestone("oa22", 3)) kept.push("upgrades", "buyables")
        layerDataReset(this.layer, kept)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return 'You have ' + format(player.points) + ' stardust' }],
        ["display-text", function() { if (!player.mw.unlocked) return 'Next in the survey: <b>The Milky Way</b> — opens at ' + format(tmp.mw.requires) + ' stardust. Nothing to buy first.' }],
        ["display-text", function() { if (player.oa22.points.gte(1)) return 'The Last Outburst: best ' + format(player.oa22.best) }],
        ["display-text", function() { if (player.oa22.points.gte(tmp.oa22.softcap.div(2))) return 'Gain softcap starts at ' + format(tmp.oa22.softcap) + ' the last outburst' }],
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
        11: { title: "Final Yield",
              description: "The Last Outburst gain ×2.",
              cost: new Decimal(1) },
        12: { title: "Record Light Curves",
              description: "The Last Outburst gain is boosted by your unspent the last outburst.",
              cost: new Decimal(5),
              unlocked() { return hasUpgrade("oa22", 11) },
              effect() { let ret = new Decimal(2)
                  if (player[this.layer].best.gte("1e60")) ret = ret.times(5)
                  if (player[this.layer].best.gte("1e60e3")) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        13: { title: "Arm-Wide Echo",
              description: "The previous structure feeds this one.",
              cost: new Decimal(30),
              unlocked() { return hasUpgrade("oa22", 12) },
              effect() { let ret = new Decimal(2)
                  if (player["oa21"].points.gte(100)) ret = ret.times(5)
                  if (player["oa21"].points.gte(1e4)) ret = ret.times(5)
                  if (hasUpgrade("oa22", 21)) ret = ret.pow(1.1)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        14: { title: "Threshold Effect",
              description: "×5 at 100 the last outburst; ×5 more at 1e4.",
              cost: new Decimal(150),
              unlocked() { return hasUpgrade("oa22", 13) },
              effect() {
                  let ret = new Decimal(1)
                  if (player[this.layer].best.gte(100)) ret = ret.times(5)
                  if (player[this.layer].best.gte(10000)) ret = ret.times(5)
                  return ret
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        15: { title: "The Grand Assembly",
              description: "The Last Outburst gain x3, and the next survey target appears on your map.",
              cost: new Decimal(5000),
              unlocked() { return hasUpgrade("oa22", 14) },
              effect() { return new Decimal(3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        21: { title: "Final Yield Resonance",
              description: "Arm-Wide Echo is raised to ^1.1.",
              cost: new Decimal(800),
              unlocked() { return hasUpgrade("oa22", 15) } },
        22: { title: "Ending in Brilliance Overflow",
              description: "Stardust gain ×2.",
              cost: new Decimal(60),
              unlocked() { return hasUpgrade("oa22", 11) } },
        23: { title: "Wave to the Chain",
              description: "The previous structure's gain is boosted by your the last outburst.",
              cost: new Decimal(2000),
              unlocked() { return hasUpgrade("oa22", 15) },
              effect() { let ret = player[this.layer].points.add(1).log(10).plus(2).pow(1.5)
                  if (player[this.layer].best.gte(1e4)) ret = ret.times(5)
                  if (player[this.layer].best.gte(1e7)) ret = ret.times(5)
                  return ret },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
        24: { title: "Pressure Release",
              description: "The Last Outburst gain softcap starts 1,000× later.",
              cost: new Decimal(12000),
              unlocked() { return hasUpgrade("oa22", 21) },
              effect() { return new Decimal(1e3) },
              effectDisplay() { return "softcap ×" + format(upgradeEffect(this.layer, this.id)) } },
        25: { title: "Buyable Synergy",
              description: "Gain is boosted by your first buyable's effect.",
              cost: new Decimal(80000),
              unlocked() { return hasUpgrade("oa22", 23) },
              effect() { return buyableEffect("oa22", 11).max(1).pow(0.3) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x gain" } },
        31: { title: "Spiral Density Wave",
              description: "The neighboring arm's previous layer is boosted by your milestones here.",
              cost: new Decimal(500000),
              unlocked() { return hasUpgrade("oa22", 24) },
              effect() { return new Decimal(1).plus(player[this.layer].milestones.length * 0.5) },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" } },
    },
    milestones: {
        0: { requirementDescription: "600× the unlock requirement",
             effectDescription: "The Last Outburst gain ×2.5",
             done() { return player[this.layer].best.gte(tmp["oa22"].requires.times(600)) } },
        1: { requirementDescription: "4,000× the unlock requirement",
             effectDescription: "Fusion plasma gain ×8",
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player[this.layer].best.gte(tmp["oa22"].requires.times(4000)) } },
        2: { requirementDescription: "25,000× the unlock requirement",
             effectDescription: "Softcap starts 1,000,000× later",
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player[this.layer].best.gte(tmp["oa22"].requires.times(25000)) } },
        3: { requirementDescription: "200,000× the unlock requirement",
             effectDescription: "Upgrades survive resets",
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player[this.layer].best.gte(tmp["oa22"].requires.times(200000)) } },
    },
    buyables: {
        11: { title: "Record Light Curves Press",
              cost(x) { return Decimal.pow(2.5, x).times(10) },
              effect(x) { return Decimal.pow(1.5, x) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " the last outburst<br>Gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
              canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
              buy() {
                  let cost = tmp[this.layer].buyables[this.id].cost
                  player[this.layer].points = player[this.layer].points.sub(cost)
                  setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
              } },
        12: { title: "Ending in Brilliance Converter",
              cost(x) { return Decimal.pow(3, x).times(100) },
              effect() { return player[this.layer].points.add(1).log(10).plus(1).pow(0.6) },
              display() { return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " the last outburst<br>Stardust gain ×" + format(tmp[this.layer].buyables[this.id].effect) + "<br>Bought: " + formatWhole(getBuyableAmount(this.layer, this.id)) },
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
        if (!player.oa22.unlocked && player.points.gte(tmp.oa22.requires)) {
            player.oa22.unlocked = true
            needCanvasUpdate = true
        }
        if (hasMilestone("oa22", 1) && !inChallenge("oa6", 13) && !inChallenge("oa6", 23) && !inChallenge("oa6", 24)) {
            player.oa22.points = player.oa22.points.add(tmp.oa22.resetGain.times(0.02).times(diff))
        }
    },
})
