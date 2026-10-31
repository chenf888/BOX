addLayer("h", {
    name: "Hyphae",
    symbol: "H",
    position: 0,
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#d9c7a7",
    resource: "hyphae",
    row: 0,
    resetDescription: "Decompose for ",

    baseResource: "Detritus",
    baseAmount() { return player.points },
    requires: new Decimal(10),
    type: "normal",
    exponent: 0.5,

    softcap() {
        let cap = new Decimal("1e7")
        if (hasUpgrade("r", 33)) cap = cap.times(1e3)
        return cap
    },
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("h", 12)) mult = mult.times(2)
        if (hasUpgrade("h", 21)) mult = mult.times(upgradeEffect("h", 21))
        if (hasUpgrade("h", 25)) mult = mult.times(5)
        if (hasUpgrade("h", 31)) mult = mult.times(5)
        if (hasUpgrade("h", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("h", 12))
        if (hasMilestone("h", 0)) mult = mult.times(2)
        if (hasMilestone("h", 2)) mult = mult.times(2)
        if (hasMilestone("h", 4)) mult = mult.times(2)
        if (hasMilestone("h", 6)) mult = mult.times(3)
        if (hasMilestone("h", 8)) mult = mult.times(5)
        if (hasMilestone("h", 10)) mult = mult.times(10)
        if (hasUpgrade("m", 13)) mult = mult.times(2)
        if (hasUpgrade("m", 14)) mult = mult.times(2)
        if (hasUpgrade("m", 22)) mult = mult.times(3)
        if (hasUpgrade("m", 32)) mult = mult.times(5)
        if (hasUpgrade("e", 13)) mult = mult.times(2)
        if (hasUpgrade("e", 14)) mult = mult.times(2)
        if (hasUpgrade("e", 22)) mult = mult.times(3)
        if (hasUpgrade("e", 32)) mult = mult.times(5)
        if (hasUpgrade("s", 14)) mult = mult.times(2)
        if (hasUpgrade("y", 13)) mult = mult.times(2)
        if (hasUpgrade("y", 14)) mult = mult.times(2)
        if (hasUpgrade("y", 22)) mult = mult.times(3)
        if (hasUpgrade("y", 32)) mult = mult.times(5)
        if (hasUpgrade("f", 14)) mult = mult.times(2)
        if (hasUpgrade("f", 33)) mult = mult.times(10)
        if (hasUpgrade("w", 14)) mult = mult.times(2)
        if (hasUpgrade("g", 14)) mult = mult.times(2)
        if (hasUpgrade("b", 14)) mult = mult.times(2)
        if (hasUpgrade("i", 14)) mult = mult.times(2)
        if (hasUpgrade("r", 14)) mult = mult.times(2)
        if (hasUpgrade("d", 14)) mult = mult.times(2)
        if (hasUpgrade("o", 14)) mult = mult.times(2)
        if (hasUpgrade("p", 14)) mult = mult.times(2)
        if (hasUpgrade("l", 14)) mult = mult.times(2)
        if (hasUpgrade("t", 14)) mult = mult.times(3)
        if (hasUpgrade("n", 14)) mult = mult.times(2)
        if (hasUpgrade("c", 14)) mult = mult.times(2)
        if (hasUpgrade("pa", 14)) mult = mult.times(2)
        if (hasUpgrade("pd", 14)) mult = mult.times(2)
        if (hasUpgrade("q", 14)) mult = mult.times(3)
        if (hasUpgrade("pr", 14)) mult = mult.times(2)
        if (hasUpgrade("x", 14)) mult = mult.times(2)
        if (hasChallenge("f", 12)) mult = mult.times(10)
        return mult
    },
    gainExp() {
        let exp = new Decimal(1)
        if (inChallenge("f", 12)) exp = exp.times(0.5) 
        return exp
    },

    effect() {
        let eff = player.h.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return true },
    branches: [],
    hotkeys: [
        { key: "h", description: "H: Decompose for hyphae", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("m", 0)) kept.push("upgrades")
            if (hasMilestone("m", 1)) kept.push("milestones")
            layerDataReset(this.layer, kept)
        }
    },

    passiveGeneration() { if (hasMilestone("e", 0) || hasAchievement("a", 34)) return 1 },
    autoPrestige() { return hasMilestone("s", 1) || hasAchievement("a", 42) },
    autoUpgrade() { return hasMilestone("y", 2) || hasAchievement("a", 45) },

    infoboxes: {
        lore: {
            title: "The Forest Floor",
            body() { return "You are a single spore, and the floor is littered with the dead. Decompose Detritus into <b>hyphae</b> — tiny filaments that reach everywhere. Everything you will ever build starts here." },
        },
    },
    tabFormat: [
        ["infobox", "lore"],
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() { if (shiftDown) return "Gain formula: floor((Detritus / 10)^0.5 × multipliers)^exponent" }],
        "blank",
        "milestones",
        "blank",
        "upgrades",
        "blank",
        "buyables",
    ],

    milestones: {
        0: { requirementDescription: "2 hyphae at once", effectDescription: "Hyphae gain ×2", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 hyphae at once", effectDescription: "Detritus gain ×2", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 hyphae at once", effectDescription: "Hyphae gain ×2", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "25 hyphae at once", effectDescription: "Detritus gain ×3", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 hyphae at once", effectDescription: "Hyphae gain ×2", done() { return player[this.layer].best.gte(60) } },
        5: { requirementDescription: "150 hyphae at once", effectDescription: "Detritus gain ×3", done() { return player[this.layer].best.gte(150) } },
        6: { requirementDescription: "400 hyphae at once", effectDescription: "Hyphae gain ×3", done() { return player[this.layer].best.gte(400) } },
        7: { requirementDescription: "1,000 hyphae at once", effectDescription: "Detritus gain ×5", done() { return player[this.layer].best.gte(1000) } },
        8: { requirementDescription: "2,500 hyphae at once", effectDescription: "Hyphae gain ×5", done() { return player[this.layer].best.gte(2500) } },
        9: { requirementDescription: "6,000 hyphae at once", effectDescription: "Detritus gain ×10", done() { return player[this.layer].best.gte(6000) } },
        10: { requirementDescription: "15,000 hyphae at once", effectDescription: "Hyphae gain ×10", done() { return player[this.layer].best.gte(15000) } },
        11: { requirementDescription: "40,000 hyphae at once", effectDescription: "Detritus gain ×10 — the floor is fully yours", done() { return player[this.layer].best.gte(40000) } },
    },

    upgrades: {
        11: { title: "Germinate", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Apical dominance", description: "Hyphae gain ×2.", cost: new Decimal(1) },
        13: {
            title: "Osmotic pull", description: "Detritus gain is boosted by your hyphae.",
            cost: new Decimal(3),
            effect() { let eff = player.h.points.add(1).pow(0.4); if (eff.gte(1e12)) eff = softcap(eff, new Decimal(1e12), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        14: { title: "Branching tips", description: "Detritus gain ×3.", cost: new Decimal(10) },
        15: {
            title: "Reach the canopy litter", description: "The filaments specialize. Unlock Mycelium and Enzymes.",
            cost: new Decimal(250),
            onPurchase() { player.m.unlocked = true; player.e.unlocked = true },
        },
        21: { title: "Self-similar branching", description: "Hyphae gain is boosted by your hyphae.", cost: new Decimal(1e3), effect() { let eff = player.h.points.add(1).pow(0.5); if (eff.gte(3162)) eff = softcap(eff, new Decimal(3162), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Share the harvest", description: "Mycelium gain ×2.", cost: new Decimal(5e3) },
        23: {
            title: "Draw from the weave", description: "Detritus gain is boosted by your mycelium.",
            cost: new Decimal(2e4),
            unlocked() { return hasUpgrade("h", 21) },
            effect() { let eff = player.m.points.add(1).pow(0.4); if (eff.gte(1e8)) eff = softcap(eff, new Decimal(1e8), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Wood-decay enzymes", description: "Detritus gain ×5.", cost: new Decimal(1e5) },
        25: { title: "Rhizomorphic strands", description: "Hyphae gain ×5.", cost: new Decimal(5e5) },
        31: { title: "Hyphal knots", description: "Hyphae gain ×5.", cost: new Decimal(2e6) },
        32: { title: "Feeding networks", description: "Mycelium gain ×3.", cost: new Decimal(1e7) },
        33: { title: "Deep litter horizons", description: "Detritus gain ×10.", cost: new Decimal(5e7) },
        34: { title: "Perennial cords", description: "Detritus gain ×10.", cost: new Decimal(2.5e8) },
        35: { title: "The floor remembers", description: "Hyphae gain ×10.", cost: new Decimal(1e9) },
    },

    buyables: {
        11: {
            title: "Hyphal tips",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.5, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " hyphae<br>Detritus gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            title: "Rhizomorphs",
            unlocked() { return hasUpgrade("h", 33) },
            cost(x) { return new Decimal(100).times(Decimal.pow(5, x)) },
            effect(x) { return Decimal.pow(2, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " hyphae<br>Hyphae gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("m", {
    name: "Mycelium",
    symbol: "M",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#f2efe4",
    resource: "mycelium",
    row: 1,
    position: 0,
    resetDescription: "Weave for ",

    baseResource: "hyphae",
    baseAmount() { return player.h.points },
    requires: new Decimal(300),
    type: "normal",
    exponent: 1 / 3,
    softcap: new Decimal("1e8"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (inChallenge("b", 12)) return mult
        if (hasUpgrade("m", 12)) mult = mult.times(2)
        if (hasUpgrade("m", 21)) mult = mult.times(upgradeEffect("m", 21))
        if (hasUpgrade("m", 25)) mult = mult.times(5)
        if (hasUpgrade("m", 31)) mult = mult.times(5)
        if (hasUpgrade("m", 34)) mult = mult.times(10)
        if (hasUpgrade("m", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("m", 11))
        mult = mult.times(buyableEffect("m", 12))
        if (hasMilestone("m", 3)) mult = mult.times(2)
        if (hasUpgrade("h", 22)) mult = mult.times(2)
        if (hasUpgrade("h", 32)) mult = mult.times(3)
        if (hasUpgrade("s", 21)) mult = mult.times(2)
        if (hasUpgrade("s", 22)) mult = mult.times(2)
        if (hasUpgrade("f", 13)) mult = mult.times(2)
        if (hasUpgrade("f", 22)) mult = mult.times(3)
        if (hasUpgrade("f", 32)) mult = mult.times(5)
        if (hasChallenge("b", 12)) mult = mult.times(5)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.m.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.m.unlocked },
    branches: ["h"],
    hotkeys: [
        { key: "m", description: "M: Weave for mycelium", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    resetsNothing() { return hasMilestone("m", 2) },
    passiveGeneration() { if (hasMilestone("f", 0)) return 1 },
    autoPrestige() { return hasMilestone("f", 6) },
    autoUpgrade() { return hasMilestone("f", 7) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("m", 5)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    milestones: {
        0: { requirementDescription: "3 mycelium at once", effectDescription: "Hyphae upgrades are kept through resets", done() { return player[this.layer].best.gte(3) } },
        1: { requirementDescription: "6 mycelium at once", effectDescription: "Hyphae milestones are kept through resets", done() { return player[this.layer].best.gte(6) } },
        2: { requirementDescription: "12 mycelium at once", effectDescription: "Weaving no longer resets lower layers", done() { return player[this.layer].best.gte(12) } },
        3: { requirementDescription: "25 mycelium at once", effectDescription: "Mycelium gain ×2", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 mycelium at once", effectDescription: "Detritus gain ×3", done() { return player[this.layer].best.gte(60) } },
        5: { requirementDescription: "150 mycelium at once", effectDescription: "Keep mycelium milestones and upgrades through resets", done() { return player[this.layer].best.gte(150) } },
    },

    upgrades: {
        11: { title: "A true network", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Thicker strands", description: "Mycelium gain ×2.", cost: new Decimal(1) },
        13: { title: "Feed the filaments", description: "Hyphae gain ×2.", cost: new Decimal(3) },
        14: { title: "Water highways", description: "Hyphae gain ×2.", cost: new Decimal(10) },
        15: {
            title: "Colonize the soil", description: "The network meets the ground. Unlock Substrate.",
            cost: new Decimal(50),
            onPurchase() { player.s.unlocked = true },
        },
        21: { title: "Self-similar growth", description: "Mycelium gain is boosted by your mycelium.", cost: new Decimal(150), effect() { let eff = player.m.points.add(1).pow(0.5); if (eff.gte(1e4)) eff = softcap(eff, new Decimal(1e4), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Nutrient streaming", description: "Hyphae gain ×3.", cost: new Decimal(500) },
        23: {
            title: "Weigh the weave", description: "Mycelium gain is boosted by your hyphae.",
            cost: new Decimal(2e3),
            unlocked() { return hasUpgrade("m", 21) },
            effect() { let eff = player.h.points.add(1).pow(0.4); if (eff.gte(1e8)) eff = softcap(eff, new Decimal(1e8), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Leaf-litter specialists", description: "Detritus gain ×5.", cost: new Decimal(1e4) },
        25: { title: "Cord-forming colonies", description: "Mycelium gain ×5.", cost: new Decimal(5e4) },
        31: { title: "Mycelial plates", description: "Mycelium gain ×5.", cost: new Decimal(2.5e5) },
        32: { title: "Fungal highways", description: "Hyphae gain ×5.", cost: new Decimal(1e6) },
        33: { title: "Spore banks", description: "Hyphae gain ×2.", cost: new Decimal(5e6) },
        34: { title: "Virgin soil breach", description: "Mycelium gain ×10.", cost: new Decimal(2.5e7) },
        35: { title: "The mat endures", description: "Mycelium gain ×10.", cost: new Decimal(1e8) },
    },

    buyables: {
        11: {
            title: "Mycelial cords",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " mycelium<br>Mycelium gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            title: "Dense mats",
            cost(x) { return new Decimal(100).times(Decimal.pow(4, x)) },
            effect(x) { return Decimal.pow(2, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " mycelium<br>Mycelium gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("e", {
    name: "Enzymes",
    symbol: "E",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#86c06c",
    resource: "enzymes",
    row: 1,
    position: 1,
    resetDescription: "Secrete for ",

    baseResource: "hyphae",
    baseAmount() { return player.h.points },
    requires: new Decimal(600),
    type: "normal",
    exponent: 0.3,
    softcap: new Decimal("1e7"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (inChallenge("b", 12)) return mult
        if (hasUpgrade("e", 12)) mult = mult.times(2)
        if (hasUpgrade("e", 21)) mult = mult.times(upgradeEffect("e", 21))
        if (hasUpgrade("e", 25)) mult = mult.times(5)
        if (hasUpgrade("e", 31)) mult = mult.times(5)
        if (hasUpgrade("e", 34)) mult = mult.times(10)
        if (hasUpgrade("e", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("e", 11))
        mult = mult.times(buyableEffect("e", 12))
        if (hasMilestone("e", 1)) mult = mult.times(2)
        if (hasMilestone("e", 3)) mult = mult.times(2)
        if (hasUpgrade("h", 22)) mult = mult.times(2)
        if (hasUpgrade("y", 13)) mult = mult.times(2)
        if (hasUpgrade("y", 22)) mult = mult.times(3)
        if (hasUpgrade("y", 32)) mult = mult.times(5)
        if (hasChallenge("b", 12)) mult = mult.times(5)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.e.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.e.unlocked },
    branches: ["h"],
    hotkeys: [
        { key: "e", description: "E: Secrete for enzymes", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    passiveGeneration() { if (hasMilestone("s", 0)) return 1 },
    autoPrestige() { return hasMilestone("f", 6) },
    autoUpgrade() { return hasMilestone("f", 7) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("e", 5)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    milestones: {
        0: { requirementDescription: "3 enzymes at once", effectDescription: "Hyphae grow on their own", done() { return player[this.layer].best.gte(3) } },
        1: { requirementDescription: "6 enzymes at once", effectDescription: "Enzyme gain ×2", done() { return player[this.layer].best.gte(6) } },
        2: { requirementDescription: "12 enzymes at once", effectDescription: "Detritus gain ×2", done() { return player[this.layer].best.gte(12) } },
        3: { requirementDescription: "25 enzymes at once", effectDescription: "Enzyme gain ×2", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 enzymes at once", effectDescription: "Detritus gain ×3", done() { return player[this.layer].best.gte(60) } },
        5: { requirementDescription: "150 enzymes at once", effectDescription: "Keep enzyme milestones and upgrades through resets", done() { return player[this.layer].best.gte(150) } },
    },

    upgrades: {
        11: { title: "Chemical warfare", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Cellulase", description: "Enzyme gain ×2.", cost: new Decimal(1) },
        13: { title: "Lignin peroxidase", description: "Hyphae gain ×2.", cost: new Decimal(3) },
        14: { title: "Free radicals", description: "Hyphae gain ×2.", cost: new Decimal(10) },
        15: {
            title: "Sugar blooms", description: "The chemistry turns sweet. Unlock Fermentation.",
            cost: new Decimal(50),
            onPurchase() { player.y.unlocked = true },
        },
        21: { title: "Catalytic self-feeding", description: "Enzyme gain is boosted by your enzymes.", cost: new Decimal(150), effect() { let eff = player.e.points.add(1).pow(0.5); if (eff.gte(3162)) eff = softcap(eff, new Decimal(3162), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Acid baths", description: "Hyphae gain ×3.", cost: new Decimal(500) },
        23: {
            title: "Catalytic cycles", description: "Enzyme gain is boosted by your hyphae.",
            cost: new Decimal(2e3),
            unlocked() { return hasUpgrade("e", 21) },
            effect() { let eff = player.h.points.add(1).pow(0.4); if (eff.gte(1e8)) eff = softcap(eff, new Decimal(1e8), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Self-digestion loops", description: "Detritus gain ×5.", cost: new Decimal(1e4) },
        25: { title: "Enzyme cascades", description: "Enzyme gain ×5.", cost: new Decimal(5e4) },
        31: { title: "Pectinase swarms", description: "Enzyme gain ×5.", cost: new Decimal(2.5e5) },
        32: { title: "The hungry middle", description: "Hyphae gain ×5.", cost: new Decimal(1e6) },
        33: { title: "Feedback catalysts", description: "Hyphae gain ×2.", cost: new Decimal(5e6) },
        34: { title: "Total breakdown", description: "Enzyme gain ×10.", cost: new Decimal(2.5e7) },
        35: { title: "Nothing is indigestible", description: "Enzyme gain ×10.", cost: new Decimal(1e8) },
    },

    buyables: {
        11: {
            title: "Enzyme cocktail",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.5, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " enzymes<br>Enzyme gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            title: "Catalytic iron",
            cost(x) { return new Decimal(100).times(Decimal.pow(4, x)) },
            effect(x) { return Decimal.pow(1.8, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " enzymes<br>Enzyme gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("s", {
    name: "Substrate",
    symbol: "S",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#8b5a2b",
    resource: "substrate layers",
    row: 2,
    position: 0,
    resetDescription: "Colonize for ",

    baseResource: "mycelium",
    baseAmount() { return player.m.points },
    requires: new Decimal("1.2e4"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    canBuyMax() { return hasUpgrade("s", 12) },

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("s", 13)) mult = mult.div(2)
        if (hasUpgrade("y", 33)) mult = mult.div(2)
        if (hasMilestone("g", 3)) mult = mult.div(2)
        if (hasMilestone("i", 3)) mult = mult.div(2)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.s.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.s.unlocked },
    branches: ["m"],
    hotkeys: [
        { key: "s", description: "S: Colonize for substrate layers", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    passiveGeneration() { if (hasMilestone("g", 0)) return 1 },
    autoPrestige() { return hasMilestone("r", 3) },
    autoUpgrade() { return hasMilestone("r", 4) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("s", 4)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    milestones: {
        0: { requirementDescription: "2 substrate layers", effectDescription: "Enzymes grow on their own", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "4 substrate layers", effectDescription: "Hyphae decompose automatically", done() { return player[this.layer].best.gte(4) } },
        2: { requirementDescription: "8 substrate layers", effectDescription: "Detritus gain ×3", done() { return player[this.layer].best.gte(8) } },
        3: { requirementDescription: "15 substrate layers", effectDescription: "Mycelium gain ×3", done() { return player[this.layer].best.gte(15) } },
        4: { requirementDescription: "30 substrate layers", effectDescription: "Keep substrate milestones and upgrades through resets", done() { return player[this.layer].best.gte(30) } },
    },

    upgrades: {
        11: { title: "Topsoil", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Surveyed ground", description: "You can buy max substrate levels at once.", cost: new Decimal(1) },
        13: { title: "Loosened earth", description: "Substrate levels cost half as much.", cost: new Decimal(2) },
        14: { title: "Buried wood", description: "Hyphae gain ×2.", cost: new Decimal(4) },
        15: {
            title: "Perfect conditions", description: "The network is ready to fruit. Unlock Fruiting Bodies.",
            cost: new Decimal(8),
            onPurchase() { player.f.unlocked = true },
        },
        21: { title: "Mineral horizons", description: "Mycelium gain ×2.", cost: new Decimal(12) },
        22: { title: "Deep loam", description: "Mycelium gain ×2.", cost: new Decimal(16) },
        23: { title: "Sweet rot", description: "Yeast cultures ×2.", cost: new Decimal(20) },
        24: { title: "Humus builder", description: "Detritus gain ×5.", cost: new Decimal(25) },
        25: { title: "Living soil", description: "Detritus gain ×5.", cost: new Decimal(30) },
        31: { title: "Clay fracturing", description: "Mycelium gain ×5.", cost: new Decimal(40) },
        32: { title: "Mycelial stones", description: "Hyphae gain ×5.", cost: new Decimal(50) },
        33: { title: "Bedrock tunnels", description: "Hyphae gain ×5.", cost: new Decimal(65) },
        34: { title: "Aquifer taps", description: "Mycelium gain ×10.", cost: new Decimal(85) },
        35: { title: "The ground remembers", description: "Mycelium gain ×10.", cost: new Decimal(110) },
    },

    buyables: {
        11: {
            title: "Compost layers",
            purchaseLimit: new Decimal(10),
            cost(x) { return Decimal.pow(1.5, x).floor() },
            effect(x) { return Decimal.pow(2, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + formatWhole(data.cost) + " substrate layers<br>Detritus gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) + "/10" },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            title: "Fungal paths",
            unlocked() { return hasUpgrade("s", 23) },
            purchaseLimit: new Decimal(10),
            cost(x) { return Decimal.pow(1.3, x).plus(1).floor() },
            effect(x) { return Decimal.pow(1.3, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + formatWhole(data.cost) + " substrate layers<br>Mycelium gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) + "/10" },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("y", {
    name: "Fermentation",
    symbol: "Y",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#e8c547",
    resource: "yeast cultures",
    row: 2,
    position: 1,
    resetDescription: "Ferment for ",

    baseResource: "enzymes",
    baseAmount() { return player.e.points },
    requires: new Decimal("2.5e4"),
    type: "custom",

    getResetGain() {
        let pts = player.e.points
        let gain = pts.div(this.requires).add(1).log10().times(3)
        gain = gain.times(this.gainMult()).pow(this.gainExp())
        return gain.floor().max(0)
    },
    getNextAt(canMax = false) {
        let target = getResetGain(this.layer).add(1)
        let mult = new Decimal(3).times(this.gainMult()).pow(this.gainExp())
        return new Decimal("2.5e4").times(Decimal.pow(10, target.div(mult))).sub(1)
    },
    canReset() { return getResetGain(this.layer).gte(1) },
    prestigeButtonText() {
        return "Ferment for +" + formatWhole(getResetGain(this.layer)) + " yeast cultures<br>Next at " + format(this.getNextAt()) + " enzymes"
    },

    gainMult() {
        let mult = new Decimal(1)
        if (hasMilestone("y", 0)) mult = mult.times(2)
        if (hasMilestone("y", 3)) mult = mult.times(2)
        if (hasUpgrade("y", 12)) mult = mult.times(3)
        if (hasUpgrade("y", 21)) mult = mult.times(upgradeEffect("y", 21))
        if (hasUpgrade("y", 25)) mult = mult.times(5)
        if (hasUpgrade("y", 31)) mult = mult.times(5)
        if (hasUpgrade("y", 34)) mult = mult.times(10)
        if (hasUpgrade("y", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("y", 11))
        if (hasUpgrade("s", 23)) mult = mult.times(2)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.y.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.y.unlocked },
    branches: ["e"],
    hotkeys: [
        { key: "y", description: "Y: Ferment for yeast cultures", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    passiveGeneration() { if (hasMilestone("b", 0)) return 1 },
    autoPrestige() { return hasMilestone("r", 3) },
    autoUpgrade() { return hasMilestone("r", 4) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("y", 5)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    milestones: {
        0: { requirementDescription: "2 yeast cultures", effectDescription: "Fermentation ×2", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 yeast cultures", effectDescription: "Detritus gain ×3", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "8 yeast cultures", effectDescription: "Hyphae upgrades buy themselves", done() { return player[this.layer].best.gte(8) } },
        3: { requirementDescription: "16 yeast cultures", effectDescription: "Fermentation ×2", done() { return player[this.layer].best.gte(16) } },
        4: { requirementDescription: "32 yeast cultures", effectDescription: "Detritus gain ×5", done() { return player[this.layer].best.gte(32) } },
        5: { requirementDescription: "64 yeast cultures", effectDescription: "Keep fermentation milestones and upgrades through resets", done() { return player[this.layer].best.gte(64) } },
    },

    upgrades: {
        11: { title: "Bubbles rise", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Wild strains", description: "Fermentation ×3.", cost: new Decimal(1) },
        13: { title: "Enzyme brews", description: "Enzyme gain ×2.", cost: new Decimal(3) },
        14: { title: "Warm vats", description: "Enzyme gain ×2.", cost: new Decimal(10) },
        15: {
            title: "A ripe microclimate", description: "Heat and humidity gather. Unlock Microclimate.",
            cost: new Decimal(20),
            onPurchase() { player.w.unlocked = true },
        },
        21: { title: "Growing colonies", description: "Fermentation is boosted by your yeast cultures.", cost: new Decimal(40), effect() { let eff = player.y.points.add(1).pow(0.3); if (eff.gte(20)) eff = softcap(eff, new Decimal(20), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Enzyme tonics", description: "Enzyme gain ×3.", cost: new Decimal(70) },
        23: { title: "Spiced musts", description: "Detritus gain ×3.", cost: new Decimal(120) },
        24: { title: "Continuous culture", description: "Detritus gain ×5.", cost: new Decimal(200) },
        25: { title: "Vat networks", description: "Fermentation ×5.", cost: new Decimal(350) },
        31: { title: "Distillery rows", description: "Fermentation ×5.", cost: new Decimal(600) },
        32: { title: "Enzyme elixirs", description: "Enzyme gain ×5.", cost: new Decimal(1e3) },
        33: { title: "Sterile benches", description: "Substrate levels cost half as much.", cost: new Decimal(1.8e3) },
        34: { title: "Great fermenters", description: "Fermentation ×10.", cost: new Decimal(3.2e3) },
        35: { title: "The brew endures", description: "Fermentation ×10.", cost: new Decimal(6e3) },
    },

    buyables: {
        11: {
            title: "Fermenter vats",
            cost(x) { return new Decimal(5).times(Decimal.pow(2, x)) },
            effect(x) { return Decimal.pow(1.3, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " yeast cultures<br>Fermentation ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})
