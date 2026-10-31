addLayer("r", {
    name: "Mycorrhizal Web",
    symbol: "R",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#c98f3d",
    resource: "network reach",
    row: 5,
    position: 0,
    resetDescription: "Connect for ",

    baseResource: "gill area",
    baseAmount() { return player.g.points },
    requires: new Decimal("6e8"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e12"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("r", 12)) mult = mult.times(2)
        if (hasUpgrade("r", 13)) mult = mult.times(2)
        if (hasUpgrade("r", 21)) mult = mult.times(upgradeEffect("r", 21))
        if (hasUpgrade("r", 22)) mult = mult.times(3)
        if (hasUpgrade("r", 32)) mult = mult.times(5)
        if (hasUpgrade("r", 35)) mult = mult.times(2)
        if (hasUpgrade("r", 42)) mult = mult.times(3)
        if (hasUpgrade("r", 44)) mult = mult.times(2)
        if (hasUpgrade("r", 52)) mult = mult.times(5)
        if (hasUpgrade("r", 55)) mult = mult.times(10)
        if (hasUpgrade("r", 23)) mult = mult.times(upgradeEffect("r", 23))
        if (hasUpgrade("o", 13)) mult = mult.times(2)
        if (hasUpgrade("o", 22)) mult = mult.times(3)
        if (hasUpgrade("p", 13)) mult = mult.times(2)
        if (hasUpgrade("p", 22)) mult = mult.times(3)
        if (hasUpgrade("l", 13)) mult = mult.times(2)
        if (hasUpgrade("l", 22)) mult = mult.times(3)
        if (hasUpgrade("t", 33)) mult = mult.times(5)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.r.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.r.unlocked },
    branches: ["g"],
    hotkeys: [
        { key: "r", description: "R: Connect for network reach", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    autoPrestige() { return hasMilestone("t", 3) },
    autoUpgrade() { return hasMilestone("t", 4) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("r", 7)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    infoboxes: {
        lore: {
            title: "The Wood Wide Web",
            body() { return "The hyphae wrap the roots of every tree in the forest. Carbon flows down, water and minerals flow up. Nobody knows where one organism ends and the next begins." },
        },
    },
    tabFormat: [
        ["infobox", "lore"],
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() { if (shiftDown) return "Gain formula: floor((gill area / 6e8)^0.25 × multipliers)" }],
        "blank",
        "milestones",
        "blank",
        "upgrades",
        "blank",
        "buyables",
    ],

    milestones: {
        0: { requirementDescription: "2 network reach", effectDescription: "Gills unfold on their own", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 network reach", effectDescription: "Detritus gain ×5", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 network reach", effectDescription: "Glow accumulates on its own", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "16 network reach", effectDescription: "Substrate, fermentation and fruiting bodies reset themselves", done() { return player[this.layer].best.gte(16) } },
        4: { requirementDescription: "32 network reach", effectDescription: "Substrate, fermentation and fruiting upgrades buy themselves", done() { return player[this.layer].best.gte(32) } },
        5: { requirementDescription: "64 network reach", effectDescription: "Insect allies gather on their own", done() { return player[this.layer].best.gte(64) } },
        6: { requirementDescription: "150 network reach", effectDescription: "Detritus gain ×10", done() { return player[this.layer].best.gte(150) } },
        7: { requirementDescription: "300 network reach", effectDescription: "Keep web milestones and upgrades through resets", done() { return player[this.layer].best.gte(300) } },
    },

    upgrades: {
        11: { title: "First contact", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Mapped territory", description: "Network gain ×2.", cost: new Decimal(1) },
        13: { title: "Thick sheaths", description: "Network gain ×2.", cost: new Decimal(10) },
        14: { title: "Carbon tolls", description: "Hyphae gain ×2.", cost: new Decimal(50) },
        15: {
            title: "Choose your partners", description: "The web finds its trees. Unlock Oak Alliance and Pine Pact.",
            cost: new Decimal(500),
            onPurchase() { player.o.unlocked = true; player.p.unlocked = true },
        },
        21: { title: "Web feeding web", description: "Network gain is boosted by your network reach.", cost: new Decimal(2.5e3), effect() { let eff = player.r.points.add(1).pow(0.5); if (eff.gte(1000000)) eff = softcap(eff, new Decimal(1000000), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Wider sheaths", description: "Network gain ×3.", cost: new Decimal(1e4) },
        23: {
            title: "Reach with the gills", description: "Network levels cost less based on your gill area.",
            cost: new Decimal(5e4),
            unlocked() { return hasUpgrade("r", 21) },
            effect() { let eff = player.g.points.add(1).pow(0.4); if (eff.gte(1e12)) eff = softcap(eff, new Decimal(1e12), 0.5); return eff },
            effectDisplay() { return "cost ÷" + format(this.effect()) },
        },
        24: { title: "Mineral tolls", description: "Detritus gain ×5.", cost: new Decimal(2.5e5) },
        25: { title: "Ectomycorrhiza", description: "Network gain ×5.", cost: new Decimal(1e6) },
        31: { title: "Water routing", description: "Detritus gain ×5.", cost: new Decimal(5e6) },
        32: { title: "Deep sheaths", description: "Network gain ×5.", cost: new Decimal(2.5e7) },
        33: { title: "Deeper than ever", description: "The hyphae softcap starts 1000x later.", cost: new Decimal(1e8) },
        34: { title: "Nutrient exchanges", description: "Detritus gain ×10.", cost: new Decimal(5e8) },
        35: { title: "Common markets", description: "Network gain ×2.", cost: new Decimal(2.5e9) },
        41: { title: "Root bridges", description: "Hyphae gain ×5.", cost: new Decimal(1e10) },
        42: { title: "Mycelial cables", description: "Network gain ×3.", cost: new Decimal(5e10) },
        43: { title: "The web hums", description: "Detritus gain ×25.", cost: new Decimal(2.5e11) },
        44: { title: "Shared forests", description: "Network gain ×2.", cost: new Decimal(1e12) },
        45: { title: "Ancient routes", description: "Hyphae gain ×10.", cost: new Decimal(5e12) },
        51: { title: "Planetary lattice", description: "Detritus gain ×100.", cost: new Decimal(2.5e13) },
        52: { title: "Deep lattice", description: "Network gain ×5.", cost: new Decimal(1e14) },
        53: { title: "Gill membranes", description: "Gill gain ×25.", cost: new Decimal(5e14) },
        54: { title: "Carbon bazaars", description: "Detritus gain ×100.", cost: new Decimal(2.5e15) },
        55: { title: "The web endures", description: "Network gain ×10.", cost: new Decimal(1e16) },
    },
})

addLayer("d", {
    name: "Dung Voyage",
    symbol: "D",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#8f6b3d",
    resource: "gut-passed spores",
    row: 5,
    position: 1,
    resetDescription: "Ride for ",

    baseResource: "insect allies",
    baseAmount() { return player.i.points },
    requires: new Decimal("1.5e9"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e14"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("d", 12)) mult = mult.times(2)
        if (hasUpgrade("d", 21)) mult = mult.times(upgradeEffect("d", 21))
        if (hasUpgrade("d", 25)) mult = mult.times(5)
        if (hasUpgrade("d", 31)) mult = mult.times(5)
        if (hasUpgrade("d", 34)) mult = mult.times(10)
        if (hasUpgrade("d", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("d", 11))
        if (hasMilestone("d", 1)) mult = mult.times(2)
        if (hasMilestone("d", 3)) mult = mult.times(2)
        if (hasUpgrade("n", 33)) mult = mult.times(5)
        if (hasUpgrade("c", 33)) mult = mult.times(5)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.d.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.d.unlocked },
    branches: ["i"],
    hotkeys: [
        { key: "d", description: "D: Ride for gut-passed spores", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    passiveGeneration() { if (hasMilestone("t", 5)) return 1 },
    autoPrestige() { return hasMilestone("t", 3) },
    autoUpgrade() { return hasMilestone("t", 4) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("d", 5)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    milestones: {
        0: { requirementDescription: "2 gut-passed spores", effectDescription: "Detritus gain ×3", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 gut-passed spores", effectDescription: "Voyage gain ×2", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 gut-passed spores", effectDescription: "Detritus gain ×5", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "25 gut-passed spores", effectDescription: "Voyage gain ×2", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 gut-passed spores", effectDescription: "Gills, glow, allies and climate reset themselves", done() { return player[this.layer].best.gte(60) } },
        5: { requirementDescription: "150 gut-passed spores", effectDescription: "Gill, glow, ally and climate upgrades buy themselves; keep voyage progress", done() { return player[this.layer].best.gte(150) } },
    },

    upgrades: {
        11: { title: "Through the beast", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Thick walls", description: "Voyage gain ×2.", cost: new Decimal(1) },
        13: { title: "Feed the swarm", description: "Insect allies ×2.", cost: new Decimal(3) },
        14: { title: "Field journeys", description: "Hyphae gain ×2.", cost: new Decimal(10) },
        15: {
            title: "Crust on stone", description: "Some spores need no soil. Unlock Lichen Compact.",
            cost: new Decimal(150),
            onPurchase() { player.l.unlocked = true },
        },
        21: { title: "Herd growth", description: "Voyage gain is boosted by your gut-passed spores.", cost: new Decimal(750), effect() { let eff = player.d.points.add(1).pow(0.5); if (eff.gte(10000000)) eff = softcap(eff, new Decimal(10000000), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Swarm feedback", description: "Insect allies ×3.", cost: new Decimal(3e3) },
        23: {
            title: "Ride the herd", description: "Voyage gain is boosted by your insect allies.",
            cost: new Decimal(1.5e4),
            unlocked() { return hasUpgrade("d", 21) },
            effect() { let eff = player.i.points.add(1).pow(0.4); if (eff.gte(1e14)) eff = softcap(eff, new Decimal(1e14), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Continental droppings", description: "Detritus gain ×5.", cost: new Decimal(7e4) },
        25: { title: "Dung beetle guilds", description: "Voyage gain ×5.", cost: new Decimal(3e5) },
        31: { title: "Migratory herds", description: "Voyage gain ×5.", cost: new Decimal(1.5e6) },
        32: { title: "Swarm fleets", description: "Insect allies ×5.", cost: new Decimal(7e6) },
        33: { title: "Glowing lures", description: "Glow gain ×5.", cost: new Decimal(3e7) },
        34: { title: "Ocean crossings", description: "Voyage gain ×10.", cost: new Decimal(1.5e8) },
        35: { title: "The voyage endures", description: "Voyage gain ×10.", cost: new Decimal(7e8) },
    },

    buyables: {
        11: {
            title: "Beast caravans",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " gut-passed spores<br>Voyage gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("o", {
    name: "Oak Alliance",
    symbol: "O",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#4d8f3a",
    resource: "oak bonds",
    row: 6,
    position: 0,
    resetDescription: "Bond for ",

    baseResource: "network reach",
    baseAmount() { return player.r.points },
    requires: new Decimal("2e10"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e16"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("o", 12)) mult = mult.times(2)
        if (hasUpgrade("o", 21)) mult = mult.times(upgradeEffect("o", 21))
        if (hasUpgrade("o", 25)) mult = mult.times(5)
        if (hasUpgrade("o", 31)) mult = mult.times(5)
        if (hasUpgrade("o", 34)) mult = mult.times(10)
        if (hasUpgrade("o", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("o", 11))
        if (hasMilestone("o", 0)) mult = mult.times(2)
        if (hasMilestone("o", 2)) mult = mult.times(2)
        if (hasMilestone("o", 4)) mult = mult.times(3)
        if (hasUpgrade("t", 13)) mult = mult.times(2)
        if (hasUpgrade("t", 22)) mult = mult.times(3)
        if (hasUpgrade("t", 32)) mult = mult.times(5)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.o.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.o.unlocked },
    branches: ["r"],
    hotkeys: [
        { key: "o", description: "O: Bond for oak pacts", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    resetsNothing() { return hasMilestone("t", 6) },
    passiveGeneration() { if (hasMilestone("t", 0)) return 1 },
    autoPrestige() { return hasMilestone("t", 6) },
    autoUpgrade() { return hasMilestone("t", 6) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("o", 5)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    milestones: {
        0: { requirementDescription: "2 oak bonds", effectDescription: "Oak bonds grow on their own", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 oak bonds", effectDescription: "Detritus gain ×5", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 oak bonds", effectDescription: "Oak gain ×2", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "25 oak bonds", effectDescription: "Detritus gain ×10", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 oak bonds", effectDescription: "Oak gain ×3", done() { return player[this.layer].best.gte(60) } },
        5: { requirementDescription: "150 oak bonds", effectDescription: "Keep oak milestones and upgrades through resets", done() { return player[this.layer].best.gte(150) } },
    },

    upgrades: {
        11: { title: "Root handshake", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Steady oaks", description: "Oak gain ×2.", cost: new Decimal(1) },
        13: { title: "Sheathe the roots", description: "Network levels cost half as much.", cost: new Decimal(3) },
        14: { title: "Tall trunks", description: "Hyphae gain ×2.", cost: new Decimal(10) },
        15: { title: "Old alliance", description: "Oak gain ×5.", cost: new Decimal(150) },
        21: { title: "Sapling surge", description: "Oak gain is boosted by your oak bonds.", cost: new Decimal(750), effect() { let eff = player.o.points.add(1).pow(0.5); if (eff.gte(100000000)) eff = softcap(eff, new Decimal(100000000), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Wider webs", description: "Network levels cost 3x less.", cost: new Decimal(3e3) },
        23: {
            title: "Weigh the reach", description: "Oak gain is boosted by your network reach.",
            cost: new Decimal(1.5e4),
            unlocked() { return hasUpgrade("o", 21) },
            effect() { let eff = player.r.points.add(1).pow(0.4); if (eff.gte(1e16)) eff = softcap(eff, new Decimal(1e16), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Leaf-fall tithes", description: "Detritus gain ×5.", cost: new Decimal(7e4) },
        25: { title: "Cathedral crowns", description: "Oak gain ×5.", cost: new Decimal(3e5) },
        31: { title: "Centenary oaks", description: "Oak gain ×5.", cost: new Decimal(1.5e6) },
        32: { title: "Vast webs", description: "Network levels cost 5x less.", cost: new Decimal(7e6) },
        33: { title: "Grove minds", description: "The Grove gain ×2.", cost: new Decimal(3e7) },
        34: { title: "Millennial hearts", description: "Oak gain ×10.", cost: new Decimal(1.5e8) },
        35: { title: "The alliance endures", description: "Oak gain ×10.", cost: new Decimal(7e8) },
    },

    buyables: {
        11: {
            title: "Sapling gifts",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " oak bonds<br>Oak gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("p", {
    name: "Pine Pact",
    symbol: "P",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#2e6b4f",
    resource: "pine bonds",
    row: 6,
    position: 1,
    resetDescription: "Bond for ",

    baseResource: "network reach",
    baseAmount() { return player.r.points },
    requires: new Decimal("4e10"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e16"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("p", 12)) mult = mult.times(2)
        if (hasUpgrade("p", 21)) mult = mult.times(upgradeEffect("p", 21))
        if (hasUpgrade("p", 25)) mult = mult.times(5)
        if (hasUpgrade("p", 31)) mult = mult.times(5)
        if (hasUpgrade("p", 34)) mult = mult.times(10)
        if (hasUpgrade("p", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("p", 11))
        if (hasMilestone("p", 0)) mult = mult.times(2)
        if (hasMilestone("p", 2)) mult = mult.times(2)
        if (hasMilestone("p", 4)) mult = mult.times(3)
        if (hasUpgrade("t", 13)) mult = mult.times(2)
        if (hasUpgrade("t", 22)) mult = mult.times(3)
        if (hasUpgrade("t", 32)) mult = mult.times(5)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.p.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.p.unlocked },
    branches: ["r"],
    hotkeys: [
        { key: "p", description: "P: Bond for pine pacts", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    resetsNothing() { return hasMilestone("t", 6) },
    passiveGeneration() { if (hasMilestone("t", 1)) return 1 },
    autoPrestige() { return hasMilestone("t", 6) },
    autoUpgrade() { return hasMilestone("t", 6) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("p", 5)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    milestones: {
        0: { requirementDescription: "2 pine bonds", effectDescription: "Pine bonds grow on their own", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 pine bonds", effectDescription: "Detritus gain ×5", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 pine bonds", effectDescription: "Pine gain ×2", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "25 pine bonds", effectDescription: "Detritus gain ×10", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 pine bonds", effectDescription: "Pine gain ×3", done() { return player[this.layer].best.gte(60) } },
        5: { requirementDescription: "150 pine bonds", effectDescription: "Keep pine milestones and upgrades through resets", done() { return player[this.layer].best.gte(150) } },
    },

    upgrades: {
        11: { title: "Needle handshake", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Hardy pines", description: "Pine gain ×2.", cost: new Decimal(1) },
        13: { title: "Sheathe the roots", description: "Network levels cost half as much.", cost: new Decimal(3) },
        14: { title: "Acid soils", description: "Hyphae gain ×2.", cost: new Decimal(10) },
        15: { title: "Old pact", description: "Pine gain ×5.", cost: new Decimal(150) },
        21: { title: "Needle surge", description: "Pine gain is boosted by your pine bonds.", cost: new Decimal(750), effect() { let eff = player.p.points.add(1).pow(0.5); if (eff.gte(100000000)) eff = softcap(eff, new Decimal(100000000), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Wider webs", description: "Network levels cost 3x less.", cost: new Decimal(3e3) },
        23: {
            title: "Weigh the reach", description: "Pine gain is boosted by your network reach.",
            cost: new Decimal(1.5e4),
            unlocked() { return hasUpgrade("p", 21) },
            effect() { let eff = player.r.points.add(1).pow(0.4); if (eff.gte(1e16)) eff = softcap(eff, new Decimal(1e16), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Needle-fall tithes", description: "Detritus gain ×5.", cost: new Decimal(7e4) },
        25: { title: "Boreal crowns", description: "Pine gain ×5.", cost: new Decimal(3e5) },
        31: { title: "Centenary pines", description: "Pine gain ×5.", cost: new Decimal(1.5e6) },
        32: { title: "Vast webs", description: "Network levels cost 5x less.", cost: new Decimal(7e6) },
        33: { title: "Grove minds", description: "The Grove gain ×2.", cost: new Decimal(3e7) },
        34: { title: "Millennial hearts", description: "Pine gain ×10.", cost: new Decimal(1.5e8) },
        35: { title: "The pact endures", description: "Pine gain ×10.", cost: new Decimal(7e8) },
    },

    buyables: {
        11: {
            title: "Resin gifts",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " pine bonds<br>Pine gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("l", {
    name: "Lichen Compact",
    symbol: "L",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#9aa87b",
    resource: "lichen crusts",
    row: 6,
    position: 2,
    resetDescription: "Crust for ",

    baseResource: "network reach",
    baseAmount() { return player.r.points },
    requires: new Decimal("8e10"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e16"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("l", 12)) mult = mult.times(2)
        if (hasUpgrade("l", 21)) mult = mult.times(upgradeEffect("l", 21))
        if (hasUpgrade("l", 25)) mult = mult.times(5)
        if (hasUpgrade("l", 31)) mult = mult.times(5)
        if (hasUpgrade("l", 34)) mult = mult.times(10)
        if (hasUpgrade("l", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("l", 11))
        if (hasMilestone("l", 0)) mult = mult.times(2)
        if (hasMilestone("l", 2)) mult = mult.times(2)
        if (hasMilestone("l", 4)) mult = mult.times(3)
        if (hasUpgrade("t", 13)) mult = mult.times(2)
        if (hasUpgrade("t", 22)) mult = mult.times(3)
        if (hasUpgrade("t", 32)) mult = mult.times(5)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.l.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.l.unlocked },
    branches: ["r"],
    hotkeys: [
        { key: "l", description: "L: Crust for lichen colonies", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    resetsNothing() { return hasMilestone("t", 6) },
    passiveGeneration() { if (hasMilestone("t", 2)) return 1 },
    autoPrestige() { return hasMilestone("t", 6) },
    autoUpgrade() { return hasMilestone("t", 6) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("l", 5)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    milestones: {
        0: { requirementDescription: "2 lichen crusts", effectDescription: "Lichen grows on its own", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 lichen crusts", effectDescription: "Detritus gain ×5", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 lichen crusts", effectDescription: "Lichen gain ×2", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "25 lichen crusts", effectDescription: "Detritus gain ×10", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 lichen crusts", effectDescription: "Lichen gain ×3", done() { return player[this.layer].best.gte(60) } },
        5: { requirementDescription: "150 lichen crusts", effectDescription: "Keep lichen milestones and upgrades through resets", done() { return player[this.layer].best.gte(150) } },
    },

    upgrades: {
        11: { title: "Fungus meets alga", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Crustose sheets", description: "Lichen gain ×2.", cost: new Decimal(1) },
        13: { title: "Sheathe the roots", description: "Network levels cost half as much.", cost: new Decimal(3) },
        14: { title: "Bare rock pioneers", description: "Hyphae gain ×2.", cost: new Decimal(10) },
        15: {
            title: "A thousand acres", description: "The bonds become a forest. Unlock The Grove.",
            cost: new Decimal(150),
            onPurchase() { player.t.unlocked = true },
        },
        21: { title: "Crust spreading", description: "Lichen gain is boosted by your lichen crusts.", cost: new Decimal(750), effect() { let eff = player.l.points.add(1).pow(0.5); if (eff.gte(100000000)) eff = softcap(eff, new Decimal(100000000), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Wider webs", description: "Network levels cost 3x less.", cost: new Decimal(3e3) },
        23: {
            title: "Weigh the reach", description: "Lichen gain is boosted by your network reach.",
            cost: new Decimal(1.5e4),
            unlocked() { return hasUpgrade("l", 21) },
            effect() { let eff = player.r.points.add(1).pow(0.4); if (eff.gte(1e16)) eff = softcap(eff, new Decimal(1e16), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Slow tithes", description: "Detritus gain ×5.", cost: new Decimal(7e4) },
        25: { title: "Fruticose towers", description: "Lichen gain ×5.", cost: new Decimal(3e5) },
        31: { title: "Centenary colonies", description: "Lichen gain ×5.", cost: new Decimal(1.5e6) },
        32: { title: "Vast webs", description: "Network levels cost 5x less.", cost: new Decimal(7e6) },
        33: { title: "Stone calendars", description: "Detritus gain ×10.", cost: new Decimal(3e7) },
        34: { title: "Millennial maps", description: "Lichen gain ×10.", cost: new Decimal(1.5e8) },
        35: { title: "The compact endures", description: "Lichen gain ×10.", cost: new Decimal(7e8) },
    },

    buyables: {
        11: {
            title: "Alga gardens",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " lichen crusts<br>Lichen gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("t", {
    name: "The Grove",
    symbol: "T",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#3f7d2c",
    resource: "grove vitality",
    row: 7,
    position: 0,
    resetDescription: "Grow for ",

    baseResource: "partner bonds (oak + pine + lichen)",
    baseAmount() { return player.o.points.add(player.p.points).add(player.l.points) },
    requires: new Decimal("2e12"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e18"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("t", 12)) mult = mult.times(2)
        if (hasUpgrade("t", 21)) mult = mult.times(upgradeEffect("t", 21))
        if (hasUpgrade("t", 25)) mult = mult.times(5)
        if (hasUpgrade("t", 31)) mult = mult.times(5)
        if (hasUpgrade("t", 34)) mult = mult.times(10)
        if (hasUpgrade("t", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("t", 11))
        mult = mult.times(buyableEffect("t", 12))
        if (hasUpgrade("o", 33)) mult = mult.times(2)
        if (hasUpgrade("p", 33)) mult = mult.times(2)
        if (hasUpgrade("n", 13)) mult = mult.times(2)
        if (hasUpgrade("n", 22)) mult = mult.times(3)
        if (hasUpgrade("c", 13)) mult = mult.times(2)
        if (hasUpgrade("c", 22)) mult = mult.times(3)
        if (hasChallenge("c", 12)) mult = mult.times(10)
        return mult
    },
    gainExp() {
        let exp = new Decimal(1)
        if (inChallenge("c", 12)) exp = exp.times(0.5)
        return exp
    },

    effect() {
        let eff = player.t.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.t.unlocked },
    branches: ["o", "p", "l"],
    hotkeys: [
        { key: "t", description: "T: Grow for grove vitality", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    passiveGeneration() { return 0 },
    autoPrestige() { return hasMilestone("q", 5) },
    autoUpgrade() { return hasMilestone("q", 6) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("t", 7)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    milestones: {
        0: { requirementDescription: "2 grove vitality", effectDescription: "Oak bonds grow on their own", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 grove vitality", effectDescription: "Pine bonds grow on their own", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 grove vitality", effectDescription: "Lichen grows on its own", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "25 grove vitality", effectDescription: "The web and the voyage reset themselves", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 grove vitality", effectDescription: "Web and voyage upgrades buy themselves", done() { return player[this.layer].best.gte(60) } },
        5: { requirementDescription: "150 grove vitality", effectDescription: "The voyage rides on its own", done() { return player[this.layer].best.gte(150) } },
        6: { requirementDescription: "3,000 grove vitality", effectDescription: "The three partners bond themselves, buy themselves, and no longer reset anything", done() { return player[this.layer].best.gte(3000) } },
        7: { requirementDescription: "6,000 grove vitality", effectDescription: "Keep grove milestones and upgrades through resets", done() { return player[this.layer].best.gte(6000) } },
    },

    upgrades: {
        11: { title: "One forest", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Tangled canopies", description: "Grove gain ×2.", cost: new Decimal(1) },
        13: { title: "Shared sunlight", description: "Oak, pine and lichen gain ×2.", cost: new Decimal(3) },
        14: { title: "Deep roots", description: "Hyphae gain ×3.", cost: new Decimal(10) },
        15: {
            title: "The forest learns to hunt", description: "Growth has a price. Unlock Nematode Nooses.",
            cost: new Decimal(500),
            onPurchase() { player.n.unlocked = true },
        },
        21: { title: "Forest grows forest", description: "Grove gain is boosted by your grove vitality.", cost: new Decimal(2.5e3), effect() { let eff = player.t.points.add(1).pow(0.5); if (eff.gte(1000000000)) eff = softcap(eff, new Decimal(1000000000), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Stronger bonds", description: "Oak, pine and lichen gain ×3.", cost: new Decimal(1.2e4) },
        23: {
            title: "Weigh the grove", description: "Grove gain is boosted by your partner bonds.",
            cost: new Decimal(6e4),
            unlocked() { return hasUpgrade("t", 21) },
            effect() { let eff = player.o.points.add(player.p.points).add(player.l.points).add(1).pow(0.4); if (eff.gte(1e18)) eff = softcap(eff, new Decimal(1e18), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Leaf-fall economy", description: "Detritus gain ×5.", cost: new Decimal(3e5) },
        25: {
            title: "Possession", description: "The grove reaches into minds. Unlock Cordyceps Dominion.",
            cost: new Decimal(1.5e6),
            onPurchase() { player.c.unlocked = true },
        },
        31: { title: "Old-growth hearts", description: "Grove gain ×5.", cost: new Decimal(7.5e6) },
        32: { title: "Radiating bonds", description: "Oak, pine and lichen gain ×5.", cost: new Decimal(3.7e7) },
        33: { title: "The grove shoulders the web", description: "Network levels cost 5x less.", cost: new Decimal(1.8e8) },
        34: { title: "Continuous canopy", description: "Detritus gain ×5.", cost: new Decimal(9e8) },
        35: { title: "The grove endures", description: "Grove gain ×10.", cost: new Decimal(4.5e9) },
    },

    buyables: {
        11: {
            title: "Old growth",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " grove vitality<br>Grove gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            title: "Canopy minds",
            cost(x) { return new Decimal(100).times(Decimal.pow(4, x)) },
            effect(x) { return Decimal.pow(2, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " grove vitality<br>Grove gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})
