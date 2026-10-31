addLayer("pr", {
    name: "Prototaxites",
    symbol: "Pr",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#7a7a6e",
    resource: "ancient giants",
    row: 11,
    position: 0,
    resetDescription: "Remember for ",

    baseResource: "thoughts",
    baseAmount() { return player.q.points },
    requires: new Decimal("2e18"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e28"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("pr", 12)) mult = mult.times(2)
        if (hasUpgrade("pr", 21)) mult = mult.times(upgradeEffect("pr", 21))
        if (hasUpgrade("pr", 25)) mult = mult.times(5)
        if (hasUpgrade("pr", 31)) mult = mult.times(5)
        if (hasUpgrade("pr", 34)) mult = mult.times(10)
        if (hasUpgrade("pr", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("pr", 11))
        if (hasMilestone("pr", 3)) mult = mult.times(2)
        if (hasUpgrade("x", 13)) mult = mult.times(2)
        if (hasUpgrade("x", 22)) mult = mult.times(3)
        if (hasUpgrade("x", 32)) mult = mult.times(5)
        if (hasUpgrade("z", 13)) mult = mult.times(3)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.pr.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.pr.unlocked },
    branches: ["q"],
    hotkeys: [
        { key: "u", description: "U: Remember for ancient giants", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    passiveGeneration() { if (hasMilestone("x", 0)) return 1 },
    autoPrestige() { return hasMilestone("x", 5) },
    autoUpgrade() { return hasMilestone("x", 5) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("pr", 5)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    infoboxes: {
        lore: {
            title: "Before the Trees",
            body() { return "Four hundred million years ago, before forests existed, eight-meter towers of fungus stood over the land. The mind remembers being <b>Prototaxites</b>." },
        },
    },
    tabFormat: [
        ["infobox", "lore"],
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() { if (shiftDown) return "Gain formula: floor((thoughts / 2e18)^0.25 × multipliers)" }],
        "blank",
        "milestones",
        "blank",
        "upgrades",
        "blank",
        "buyables",
    ],

    milestones: {
        0: { requirementDescription: "2 ancient giants", effectDescription: "Gardens tend themselves", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 ancient giants", effectDescription: "Yield synthesizes itself", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 ancient giants", effectDescription: "Thoughts think themselves", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "25 ancient giants", effectDescription: "Giants gain ×2", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 ancient giants", effectDescription: "Detritus gain ×100", done() { return player[this.layer].best.gte(60) } },
        5: { requirementDescription: "150 ancient giants", effectDescription: "Keep giant milestones and upgrades through resets", done() { return player[this.layer].best.gte(150) } },
    },

    upgrades: {
        11: { title: "Devonian memory", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Eight-meter towers", description: "Giants gain ×2.", cost: new Decimal(1) },
        13: { title: "Feed the mind", description: "Thoughts ×2.", cost: new Decimal(3) },
        14: { title: "Tall before trees", description: "Hyphae gain ×2.", cost: new Decimal(10) },
        15: { title: "The first Dominion", description: "Giants gain ×5.", cost: new Decimal(150) },
        21: { title: "Memory feeds memory", description: "Giant gain is boosted by your ancient giants.", cost: new Decimal(750), effect() { let eff = player.pr.points.add(1).pow(0.5); if (eff.gte(100000000000000)) eff = softcap(eff, new Decimal(100000000000000), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Mind feedback", description: "Thoughts ×3.", cost: new Decimal(3e3) },
        23: {
            title: "Weigh the giants", description: "Giant gain is boosted by your thoughts.",
            cost: new Decimal(1.5e4),
            unlocked() { return hasUpgrade("pr", 21) },
            effect() { let eff = player.q.points.add(1).pow(0.4); if (eff.gte(1e28)) eff = softcap(eff, new Decimal(1e28), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Fossil fuels", description: "Detritus gain ×5.", cost: new Decimal(7e4) },
        25: { title: "Coal seams", description: "Giants gain ×5.", cost: new Decimal(3e5) },
        31: { title: "Preserved walls", description: "Giants gain ×5.", cost: new Decimal(1.5e6) },
        32: { title: "Mind feedback II", description: "Thoughts ×5.", cost: new Decimal(7e6) },
        33: { title: "Permineralized", description: "Giants gain ×10.", cost: new Decimal(3e7) },
        34: { title: "Deep time", description: "Detritus gain ×10.", cost: new Decimal(1.5e8) },
        35: { title: "The giants endure", description: "Giants gain ×10.", cost: new Decimal(7e8) },
    },

    buyables: {
        11: {
            title: "Fossil towers",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " ancient giants<br>Giant gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("x", {
    name: "Xenospores",
    symbol: "X",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#e0c040",
    resource: "star seeds",
    row: 11,
    position: 1,
    resetDescription: "Launch for ",

    baseResource: "thoughts",
    baseAmount() { return player.q.points },
    requires: new Decimal("4e18"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e28"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("x", 12)) mult = mult.times(2)
        if (hasUpgrade("x", 21)) mult = mult.times(upgradeEffect("x", 21))
        if (hasUpgrade("x", 25)) mult = mult.times(5)
        if (hasUpgrade("x", 31)) mult = mult.times(5)
        if (hasUpgrade("x", 34)) mult = mult.times(10)
        if (hasUpgrade("x", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("x", 11))
        if (hasMilestone("x", 2)) mult = mult.times(2)
        if (hasMilestone("x", 4)) mult = mult.times(2)
        if (hasUpgrade("z", 14)) mult = mult.times(3)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.x.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.x.unlocked },
    branches: ["q"],
    hotkeys: [
        { key: "x", description: "X: Launch for star seeds", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    autoPrestige() { return hasMilestone("x", 5) },
    autoUpgrade() { return hasMilestone("x", 5) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("x", 5)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    milestones: {
        0: { requirementDescription: "2 star seeds", effectDescription: "Giants remember themselves", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 star seeds", effectDescription: "The Mind awakens and buys its own upgrades, forever", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 star seeds", effectDescription: "Star seeds ×2", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "25 star seeds", effectDescription: "Detritus gain ×100", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 star seeds", effectDescription: "Star seeds ×2", done() { return player[this.layer].best.gte(60) } },
        5: {
            requirementDescription: "100 star seeds",
            effectDescription: "The Great Fruiting begins: giants, star seeds and the fruiting reset and buy themselves",
            done() { return player[this.layer].best.gte(100) },
        },
    },

    upgrades: {
        11: { title: "Vacuum-hardy walls", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Solar sails", description: "Star seed gain ×2.", cost: new Decimal(1) },
        13: { title: "Feed the giants", description: "Giants ×2.", cost: new Decimal(3) },
        14: { title: "Radiation shields", description: "Hyphae gain ×2.", cost: new Decimal(10) },
        15: {
            title: "The last window", description: "Everything ripens at once. Unlock The Great Fruiting.",
            cost: new Decimal(400),
            onPurchase() { player.z.unlocked = true },
        },
        21: { title: "Seeds make seeds", description: "Star seed gain is boosted by your star seeds.", cost: new Decimal(2e3), effect() { let eff = player.x.points.add(1).pow(0.5); if (eff.gte(100000000000000)) eff = softcap(eff, new Decimal(100000000000000), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Giant feedback", description: "Giants ×3.", cost: new Decimal(1e4) },
        23: {
            title: "Weigh the seeds", description: "Star seed gain is boosted by your thoughts.",
            cost: new Decimal(5e4),
            unlocked() { return hasUpgrade("x", 21) },
            effect() { let eff = player.q.points.add(1).pow(0.4); if (eff.gte(1e28)) eff = softcap(eff, new Decimal(1e28), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Panspermia fleets", description: "Detritus gain ×5.", cost: new Decimal(2.5e5) },
        25: { title: "Comet nurseries", description: "Star seed gain ×5.", cost: new Decimal(1.2e6) },
        31: { title: "Interstellar drift", description: "Star seed gain ×5.", cost: new Decimal(6e6) },
        32: { title: "Mind feedback II", description: "Thoughts ×5.", cost: new Decimal(3e7) },
        33: { title: "Seeded skies", description: "Star seed gain ×10.", cost: new Decimal(1.5e8) },
        34: { title: "Galactic orchards", description: "Detritus gain ×10.", cost: new Decimal(7.5e8) },
        35: { title: "The seeds endure", description: "Star seed gain ×10.", cost: new Decimal(3.7e9) },
    },

    buyables: {
        11: {
            title: "Seed launchers",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " star seeds<br>Star seed gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("z", {
    name: "The Great Fruiting",
    symbol: "Z",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#ff6a3d",
    resource: "the fruiting",
    row: 12,
    position: 0,
    resetDescription: "Fruit for ",

    baseResource: "giants and star seeds",
    baseAmount() { return player.pr.points.add(player.x.points) },
    requires: new Decimal("1e20"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e30"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("z", 12)) mult = mult.times(2)
        if (hasUpgrade("z", 15)) mult = mult.times(3)
        if (hasUpgrade("z", 22)) mult = mult.times(2)
        if (hasUpgrade("z", 25)) mult = mult.times(5)
        mult = mult.times(buyableEffect("z", 11))
        if (hasMilestone("z", 1)) mult = mult.times(2)
        if (hasMilestone("z", 3)) mult = mult.times(2)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.z.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.z.unlocked },
    branches: ["pr", "x"],
    hotkeys: [
        { key: "z", description: "Z: Fruit for the Great Fruiting", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    autoPrestige() { return hasMilestone("x", 5) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            layerDataReset(this.layer, [])
        }
    },

    infoboxes: {
        lore: {
            title: "Everything Ripens",
            body() { return "One final structure: a fruiting body the size of a world, shedding spores into the dark between stars. Complete <b>25 fruiting waves</b> to end the story." },
        },
    },
    tabFormat: [
        ["infobox", "lore"],
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() { if (shiftDown) return "Gain formula: floor(((giants + star seeds) / 1e20)^0.25 × multipliers)" }],
        "blank",
        "milestones",
        "blank",
        "upgrades",
        "blank",
        "buyables",
    ],

    milestones: {
        0: { requirementDescription: "2 the fruiting", effectDescription: "Detritus gain ×100", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 the fruiting", effectDescription: "Fruiting ×2", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 the fruiting", effectDescription: "Detritus gain ×500", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "15 the fruiting", effectDescription: "Fruiting ×2", done() { return player[this.layer].best.gte(15) } },
        4: { requirementDescription: "25 the fruiting", effectDescription: "Detritus gain ×1000 — the forest eternal", done() { return player[this.layer].best.gte(25) } },
    },

    upgrades: {
        11: { title: "One world-cap", description: "Detritus gain ×10.", cost: new Decimal(0) },
        12: { title: "Cosmic gills", description: "Fruiting ×2.", cost: new Decimal(1) },
        13: { title: "Remember everything", description: "Giants ×3.", cost: new Decimal(3) },
        14: { title: "Launch everything", description: "Star seeds ×3.", cost: new Decimal(10) },
        15: { title: "Ripening", description: "Fruiting ×3.", cost: new Decimal(30) },
        21: { title: "Spores of light", description: "Detritus gain ×100.", cost: new Decimal(60) },
        22: { title: "Wave upon wave", description: "Fruiting ×2.", cost: new Decimal(120) },
        23: {
            title: "Weigh the ripening", description: "Fruiting is boosted by giants and star seeds.",
            cost: new Decimal(250),
            unlocked() { return hasUpgrade("z", 21) },
            effect() { let eff = player.pr.points.add(player.x.points).add(1).pow(0.4); if (eff.gte(1e30)) eff = softcap(eff, new Decimal(1e30), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "The forest eternal", description: "Detritus gain ×100.", cost: new Decimal(500) },
        25: { title: "The story completes", description: "Fruiting ×5.", cost: new Decimal(1000) },
    },

    buyables: {
        11: {
            title: "World caps",
            cost(x) { return new Decimal(5).times(Decimal.pow(2, x)) },
            effect(x) { return Decimal.pow(1.5, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " the fruiting<br>Fruiting ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})
