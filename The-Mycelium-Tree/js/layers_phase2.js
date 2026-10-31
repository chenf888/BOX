addLayer("f", {
    name: "Fruiting Bodies",
    symbol: "F",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#d4502e",
    resource: "fruiting bodies",
    row: 3,
    position: 1,
    resetDescription: "Fruit for ",

    baseResource: "mycelium",
    baseAmount() { return player.m.points },
    requires: new Decimal("1e6"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e9"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("f", 12)) mult = mult.times(2)
        if (hasUpgrade("f", 21)) mult = mult.times(upgradeEffect("f", 21))
        if (hasUpgrade("f", 25)) mult = mult.times(5)
        if (hasUpgrade("f", 31)) mult = mult.times(5)
        if (hasUpgrade("f", 35)) mult = mult.times(10)
        if (hasUpgrade("f", 41)) mult = mult.times(10)
        if (hasUpgrade("f", 44)) mult = mult.times(25)
        if (hasUpgrade("f", 51)) mult = mult.times(50)
        if (hasUpgrade("f", 54)) mult = mult.times(100)
        if (hasUpgrade("f", 55)) mult = mult.times(250)
        mult = mult.times(buyableEffect("f", 12))
        if (hasMilestone("f", 1)) mult = mult.times(2)
        if (hasMilestone("f", 3)) mult = mult.times(2)
        if (hasMilestone("f", 5)) mult = mult.times(3)
        if (hasMilestone("f", 8)) mult = mult.times(5)
        if (hasUpgrade("h", 22)) mult = mult.times(2)
        if (hasUpgrade("g", 13)) mult = mult.times(2)
        if (hasUpgrade("g", 22)) mult = mult.times(3)
        if (hasUpgrade("b", 13)) mult = mult.times(2)
        if (hasUpgrade("b", 22)) mult = mult.times(3)
        if (hasUpgrade("i", 13)) mult = mult.times(2)
        if (hasUpgrade("i", 22)) mult = mult.times(3)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.f.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.f.unlocked },
    branches: ["m", "y"],
    hotkeys: [
        { key: "f", description: "F: Fruit for fruiting bodies", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    passiveGeneration() { if (hasMilestone("g", 1)) return 1 },
    autoPrestige() { return hasMilestone("r", 3) },
    autoUpgrade() { return hasMilestone("r", 4) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("f", 9)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    infoboxes: {
        lore: {
            title: "Conditions are Perfect",
            body() { return "The mycelium has gathered enough of itself to do the impossible: push up <b>fruiting bodies</b>. Mushrooms are not the fungus — they are its breath." },
        },
    },
    tabFormat: [
        ["infobox", "lore"],
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() { if (shiftDown) return "Gain formula: floor((mycelium / 1e6)^0.25 × multipliers)" }],
        "blank",
        "challenges",
        "blank",
        "milestones",
        "blank",
        "upgrades",
        "blank",
        "buyables",
    ],

    milestones: {
        0: { requirementDescription: "2 fruiting bodies", effectDescription: "Mycelium grows on its own", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 fruiting bodies", effectDescription: "Fruiting gain ×2", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 fruiting bodies", effectDescription: "Detritus gain ×3", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "20 fruiting bodies", effectDescription: "Fruiting gain ×2", done() { return player[this.layer].best.gte(20) } },
        4: { requirementDescription: "40 fruiting bodies", effectDescription: "Detritus gain ×5", done() { return player[this.layer].best.gte(40) } },
        5: { requirementDescription: "100 fruiting bodies", effectDescription: "Fruiting gain ×3", done() { return player[this.layer].best.gte(100) } },
        6: { requirementDescription: "400 fruiting bodies", effectDescription: "Mycelium and enzymes reset themselves", done() { return player[this.layer].best.gte(400) } },
        7: { requirementDescription: "800 fruiting bodies", effectDescription: "Mycelium and enzyme upgrades buy themselves", done() { return player[this.layer].best.gte(800) } },
        8: { requirementDescription: "2,500 fruiting bodies", effectDescription: "Fruiting gain ×5", done() { return player[this.layer].best.gte(2500) } },
        9: { requirementDescription: "10,000 fruiting bodies", effectDescription: "Detritus gain ×5; keep fruiting milestones and upgrades", done() { return player[this.layer].best.gte(1e4) } },
    },

    challenges: {
        11: {
            name: "Drought",
            challengeDescription() { return "The rains fail. Detritus gain is divided by 1e6.<br>" + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " completions" },
            goalDescription: "Have 1e7 fruiting bodies",
            canComplete() { return player.f.points.gte(1e7) },
            rewardDescription: "Detritus gain ×5",
            unlocked() { return player.f.best.gte(50) },
        },
        12: {
            name: "Cold Snap",
            challengeDescription() { return "Growth slows to a crawl. Hyphae gain exponent is halved.<br>" + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " completions" },
            goalDescription: "Have 1e8 fruiting bodies",
            canComplete() { return player.f.points.gte(1e8) },
            rewardDescription: "Hyphae gain ×10",
            unlocked() { return player.f.best.gte(50) },
        },
    },

    upgrades: {
        11: { title: "The first cap", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Sturdy stems", description: "Fruiting gain ×2.", cost: new Decimal(1) },
        13: { title: "Feed the weave", description: "Mycelium gain ×2.", cost: new Decimal(3) },
        14: { title: "Spore drift", description: "Hyphae gain ×2.", cost: new Decimal(10) },
        15: {
            title: "Open the gills", description: "Spores must spread. Unlock Gill Surface.",
            cost: new Decimal(200),
            onPurchase() { player.g.unlocked = true },
        },
        21: { title: "Spore self-seeding", description: "Fruiting gain is boosted by your fruiting bodies.", cost: new Decimal(1e3), effect() { let eff = player.f.points.add(1).pow(0.5); if (eff.gte(31623)) eff = softcap(eff, new Decimal(31623), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Mycelial beds", description: "Mycelium gain ×3.", cost: new Decimal(5e3) },
        23: {
            title: "Fruit from the mat", description: "Fruiting gain is boosted by your mycelium.",
            cost: new Decimal(2e4),
            unlocked() { return hasUpgrade("f", 21) },
            effect() { let eff = player.m.points.add(1).pow(0.4); if (eff.gte(1e9)) eff = softcap(eff, new Decimal(1e9), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Spore prints", description: "Detritus gain ×5.", cost: new Decimal(1e5) },
        25: {
            title: "Light and bargains", description: "Some caps glow; some recruit legs. Unlock Bioluminescence and Insect Pact.",
            cost: new Decimal(5e5),
            onPurchase() { player.b.unlocked = true; player.i.unlocked = true },
        },
        31: { title: "Hygroscopic caps", description: "Fruiting gain ×5.", cost: new Decimal(2.5e6) },
        32: { title: "Deep mycelial beds", description: "Mycelium gain ×5.", cost: new Decimal(1e7) },
        33: { title: "Fairy rings", description: "Hyphae gain ×10.", cost: new Decimal(5e7) },
        34: { title: "Spore storms", description: "Detritus gain ×10.", cost: new Decimal(2.5e8) },
        35: { title: "Persistent sporocarps", description: "Fruiting gain ×10.", cost: new Decimal(1e9) },
        41: { title: "Bracket giants", description: "Fruiting gain ×10.", cost: new Decimal(5e9) },
        42: { title: "Root bridges", description: "Mycelium gain ×5.", cost: new Decimal(2.5e10) },
        43: { title: "Spore rain", description: "Detritus gain ×25.", cost: new Decimal(1e11) },
        44: { title: "Perennial conks", description: "Fruiting gain ×25.", cost: new Decimal(5e11) },
        45: { title: "The orchard floor", description: "Mycelium gain ×10.", cost: new Decimal(2.5e12) },
        51: { title: "Thousand-year brackets", description: "Fruiting gain ×50.", cost: new Decimal(1e13) },
        52: { title: "Endless spore drift", description: "Detritus gain ×100.", cost: new Decimal(5e13) },
        53: { title: "The weaving crown", description: "Mycelium gain ×25.", cost: new Decimal(2.5e14) },
        54: { title: "Fungal orchards", description: "Fruiting gain ×100.", cost: new Decimal(1e15) },
        55: { title: "The forest fruits itself", description: "Fruiting gain ×250.", cost: new Decimal(5e15) },
    },

    buyables: {
        11: {
            title: "Spore prints",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(2, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " fruiting bodies<br>Detritus gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            title: "Growth chambers",
            cost(x) { return new Decimal(100).times(Decimal.pow(4, x)) },
            effect(x) { return Decimal.pow(1.8, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " fruiting bodies<br>Fruiting gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("w", {
    name: "Microclimate",
    symbol: "W",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#5fb7d4",
    resource: "climate balance",
    row: 3,
    position: 0,
    resetDescription: "Balance for ",

    baseResource: "yeast cultures",
    baseAmount() { return player.y.points },
    requires: new Decimal("3e5"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e8"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("w", 12)) mult = mult.times(2)
        if (hasUpgrade("w", 21)) mult = mult.times(upgradeEffect("w", 21))
        if (hasUpgrade("w", 25)) mult = mult.times(5)
        if (hasUpgrade("w", 31)) mult = mult.times(5)
        if (hasUpgrade("w", 34)) mult = mult.times(10)
        if (hasUpgrade("w", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("w", 11))
        if (hasMilestone("w", 0)) mult = mult.times(2)
        if (hasMilestone("w", 2)) mult = mult.times(2)
        if (hasUpgrade("g", 33)) mult = mult.times(5)
        if (hasUpgrade("b", 33)) mult = mult.times(5)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.w.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.w.unlocked },
    branches: ["y"],
    hotkeys: [
        { key: "w", description: "W: Balance for climate", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    passiveGeneration() { if (hasMilestone("i", 0)) return 1 },
    autoPrestige() { return hasMilestone("d", 4) },
    autoUpgrade() { return hasMilestone("d", 5) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("w", 4)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    milestones: {
        0: { requirementDescription: "2 climate balance", effectDescription: "Climate balance gain ×2", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 climate balance", effectDescription: "Detritus gain ×3", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 climate balance", effectDescription: "Climate balance gain ×2", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "20 climate balance", effectDescription: "Detritus gain ×5", done() { return player[this.layer].best.gte(20) } },
        4: { requirementDescription: "50 climate balance", effectDescription: "Keep microclimate milestones and upgrades through resets", done() { return player[this.layer].best.gte(50) } },
    },

    upgrades: {
        11: { title: "Morning mist", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Even dew", description: "Climate gain ×2.", cost: new Decimal(1) },
        13: { title: "Vat heat", description: "Yeast cultures ×2.", cost: new Decimal(3) },
        14: { title: "Canopy shade", description: "Hyphae gain ×2.", cost: new Decimal(10) },
        15: { title: "Still air", description: "Climate gain ×5.", cost: new Decimal(150) },
        21: { title: "Self-sustaining skies", description: "Climate gain is boosted by your climate balance.", cost: new Decimal(750), effect() { let eff = player.w.points.add(1).pow(0.5); if (eff.gte(10000)) eff = softcap(eff, new Decimal(10000), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Warmer musts", description: "Yeast cultures ×3.", cost: new Decimal(3e3) },
        23: {
            title: "Weigh the weather", description: "Climate gain is boosted by your yeast cultures.",
            cost: new Decimal(1.5e4),
            unlocked() { return hasUpgrade("w", 21) },
            effect() { let eff = player.y.points.add(1).pow(0.4); if (eff.gte(1e8)) eff = softcap(eff, new Decimal(1e8), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Fog harvesters", description: "Detritus gain ×5.", cost: new Decimal(7e4) },
        25: { title: "Perfect humidity", description: "Climate gain ×5.", cost: new Decimal(3e5) },
        31: { title: "Deep shade gardens", description: "Climate gain ×5.", cost: new Decimal(1.5e6) },
        32: { title: "Vat districts", description: "Yeast cultures ×5.", cost: new Decimal(7e6) },
        33: { title: "Seasons of the mat", description: "Yeast cultures ×2.", cost: new Decimal(3e7) },
        34: { title: "Monsoon engines", description: "Climate gain ×10.", cost: new Decimal(1.5e8) },
        35: { title: "The climate endures", description: "Climate gain ×10.", cost: new Decimal(7e8) },
    },

    buyables: {
        11: {
            title: "Rain barrels",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " climate balance<br>Climate gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("g", {
    name: "Gill Surface",
    symbol: "G",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#d9b8c4",
    resource: "gill area",
    row: 4,
    position: 0,
    resetDescription: "Unfold for ",

    baseResource: "fruiting bodies",
    baseAmount() { return player.f.points },
    requires: new Decimal("1.5e7"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e10"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("g", 12)) mult = mult.times(2)
        if (hasUpgrade("g", 21)) mult = mult.times(upgradeEffect("g", 21))
        if (hasUpgrade("g", 25)) mult = mult.times(5)
        if (hasUpgrade("g", 31)) mult = mult.times(5)
        if (hasUpgrade("g", 34)) mult = mult.times(10)
        if (hasUpgrade("g", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("g", 11))
        mult = mult.times(buyableEffect("g", 12))
        if (hasMilestone("g", 0)) mult = mult.times(2)
        if (hasMilestone("g", 4)) mult = mult.times(2)
        if (hasUpgrade("r", 13)) mult = mult.times(2)
        if (hasUpgrade("r", 22)) mult = mult.times(3)
        if (hasUpgrade("r", 32)) mult = mult.times(5)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.g.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.g.unlocked },
    branches: ["f"],
    hotkeys: [
        { key: "g", description: "G: Unfold for gill area", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    passiveGeneration() { if (hasMilestone("r", 0)) return 1 },
    autoPrestige() { return hasMilestone("d", 4) },
    autoUpgrade() { return hasMilestone("d", 5) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("g", 5)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    milestones: {
        0: { requirementDescription: "2 gill area", effectDescription: "Substrate grows on its own", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 gill area", effectDescription: "Fruiting bodies grow on their own", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 gill area", effectDescription: "Detritus gain ×3", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "25 gill area", effectDescription: "Substrate levels cost half as much", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 gill area", effectDescription: "Gill gain ×2", done() { return player[this.layer].best.gte(60) } },
        5: { requirementDescription: "150 gill area", effectDescription: "Keep gill milestones and upgrades through resets", done() { return player[this.layer].best.gte(150) } },
    },

    upgrades: {
        11: { title: "Lamellae", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Crowded gills", description: "Gill gain ×2.", cost: new Decimal(1) },
        13: { title: "Feed the fruit", description: "Fruiting gain ×2.", cost: new Decimal(3) },
        14: { title: "Spore currents", description: "Hyphae gain ×2.", cost: new Decimal(10) },
        15: {
            title: "Go underground", description: "The web reaches for roots. Unlock the Mycorrhizal Web.",
            cost: new Decimal(150),
            onPurchase() { player.r.unlocked = true },
        },
        21: { title: "Folds upon folds", description: "Gill gain is boosted by your gill area.", cost: new Decimal(750), effect() { let eff = player.g.points.add(1).pow(0.5); if (eff.gte(100000)) eff = softcap(eff, new Decimal(100000), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Fruiting feedback", description: "Fruiting gain ×3.", cost: new Decimal(3e3) },
        23: {
            title: "Surface-area physics", description: "Gill gain is boosted by your fruiting bodies.",
            cost: new Decimal(1.5e4),
            unlocked() { return hasUpgrade("g", 21) },
            effect() { let eff = player.f.points.add(1).pow(0.4); if (eff.gte(1e10)) eff = softcap(eff, new Decimal(1e10), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Basidium batteries", description: "Detritus gain ×5.", cost: new Decimal(7e4) },
        25: { title: "Folded canopies", description: "Gill gain ×5.", cost: new Decimal(3e5) },
        31: { title: "Gill mazes", description: "Gill gain ×5.", cost: new Decimal(1.5e6) },
        32: { title: "Cap cathedrals", description: "Fruiting gain ×5.", cost: new Decimal(7e6) },
        33: { title: "Weather weavers", description: "Climate gain ×5.", cost: new Decimal(3e7) },
        34: { title: "Endless lamellae", description: "Gill gain ×10.", cost: new Decimal(1.5e8) },
        35: { title: "The folds endure", description: "Gill gain ×10.", cost: new Decimal(7e8) },
    },

    buyables: {
        11: {
            title: "Spore governors",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " gill area<br>Gill gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            title: "Hymenium folds",
            cost(x) { return new Decimal(100).times(Decimal.pow(4, x)) },
            effect(x) { return Decimal.pow(2, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " gill area<br>Gill gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("b", {
    name: "Bioluminescence",
    symbol: "B",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#58e6a8",
    resource: "glow",
    row: 4,
    position: 1,
    resetDescription: "Glow for ",

    baseResource: "fruiting bodies",
    baseAmount() { return player.f.points },
    requires: new Decimal("3e7"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e10"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("b", 12)) mult = mult.times(2)
        if (hasUpgrade("b", 21)) mult = mult.times(upgradeEffect("b", 21))
        if (hasUpgrade("b", 25)) mult = mult.times(5)
        if (hasUpgrade("b", 31)) mult = mult.times(5)
        if (hasUpgrade("b", 34)) mult = mult.times(10)
        if (hasUpgrade("b", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("b", 11))
        if (hasMilestone("b", 0)) mult = mult.times(2)
        if (hasMilestone("b", 3)) mult = mult.times(2)
        if (hasUpgrade("d", 33)) mult = mult.times(5)
        if (hasUpgrade("i", 33)) mult = mult.times(5)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.b.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.b.unlocked },
    branches: ["f"],
    hotkeys: [
        { key: "b", description: "B: Glow for luminescence", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    passiveGeneration() { if (hasMilestone("r", 2)) return 1 },
    autoPrestige() { return hasMilestone("d", 4) },
    autoUpgrade() { return hasMilestone("d", 5) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("b", 5)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    milestones: {
        0: { requirementDescription: "2 glow", effectDescription: "Yeast cultures accumulate on their own", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 glow", effectDescription: "Glow gain ×2", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 glow", effectDescription: "Detritus gain ×3", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "25 glow", effectDescription: "Glow gain ×2", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 glow", effectDescription: "Detritus gain ×5", done() { return player[this.layer].best.gte(60) } },
        5: { requirementDescription: "150 glow", effectDescription: "Keep glow milestones and upgrades through resets", done() { return player[this.layer].best.gte(150) } },
    },

    challenges: {
        11: {
            name: "Lightless",
            challengeDescription() { return "The glow dies. Detritus gain is raised to the power 0.75.<br>" + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " completions" },
            goalDescription: "Have 1e8 glow",
            canComplete() { return player.b.points.gte(1e8) },
            rewardDescription: "Detritus gain ×20",
            unlocked() { return player.b.best.gte(30) },
        },
        12: {
            name: "Web Cut",
            challengeDescription() { return "The old web is severed: mycelium and enzyme multipliers are suppressed.<br>" + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " completions" },
            goalDescription: "Have 1e9 glow",
            canComplete() { return player.b.points.gte(1e9) },
            rewardDescription: "Mycelium and enzyme gain ×5",
            unlocked() { return player.b.best.gte(30) },
        },
    },

    upgrades: {
        11: { title: "Foxfire", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Luciferin", description: "Glow gain ×2.", cost: new Decimal(1) },
        13: { title: "Feed the light", description: "Fruiting gain ×2.", cost: new Decimal(3) },
        14: { title: "Glowing cords", description: "Hyphae gain ×2.", cost: new Decimal(10) },
        15: { title: "Ghost caps", description: "Glow gain ×5.", cost: new Decimal(150) },
        21: { title: "Glow feeds glow", description: "Glow gain is boosted by your glow.", cost: new Decimal(750), effect() { let eff = player.b.points.add(1).pow(0.5); if (eff.gte(100000)) eff = softcap(eff, new Decimal(100000), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Fruiting feedback", description: "Fruiting gain ×3.", cost: new Decimal(3e3) },
        23: {
            title: "Light from the fruit", description: "Glow gain is boosted by your fruiting bodies.",
            cost: new Decimal(1.5e4),
            unlocked() { return hasUpgrade("b", 21) },
            effect() { let eff = player.f.points.add(1).pow(0.4); if (eff.gte(1e10)) eff = softcap(eff, new Decimal(1e10), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Lantern trails", description: "Detritus gain ×5.", cost: new Decimal(7e4) },
        25: { title: "Beacons", description: "Glow gain ×5.", cost: new Decimal(3e5) },
        31: { title: "Glowing groves", description: "Glow gain ×5.", cost: new Decimal(1.5e6) },
        32: { title: "Cap lanterns", description: "Fruiting gain ×5.", cost: new Decimal(7e6) },
        33: { title: "Weathervane lights", description: "Climate gain ×5.", cost: new Decimal(3e7) },
        34: { title: "Star-lit floors", description: "Glow gain ×10.", cost: new Decimal(1.5e8) },
        35: { title: "The glow endures", description: "Glow gain ×10.", cost: new Decimal(7e8) },
    },

    buyables: {
        11: {
            title: "Lantern caps",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " glow<br>Glow gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("i", {
    name: "Insect Pact",
    symbol: "I",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#a07fd4",
    resource: "insect allies",
    row: 4,
    position: 2,
    resetDescription: "Recruit for ",

    baseResource: "fruiting bodies",
    baseAmount() { return player.f.points },
    requires: new Decimal("6e7"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e10"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("i", 12)) mult = mult.times(2)
        if (hasUpgrade("i", 21)) mult = mult.times(upgradeEffect("i", 21))
        if (hasUpgrade("i", 25)) mult = mult.times(5)
        if (hasUpgrade("i", 31)) mult = mult.times(5)
        if (hasUpgrade("i", 34)) mult = mult.times(10)
        if (hasUpgrade("i", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("i", 11))
        mult = mult.times(buyableEffect("i", 12))
        if (hasMilestone("i", 0)) mult = mult.times(2)
        if (hasMilestone("i", 4)) mult = mult.times(2)
        if (hasUpgrade("d", 13)) mult = mult.times(2)
        if (hasUpgrade("d", 22)) mult = mult.times(3)
        if (hasUpgrade("d", 32)) mult = mult.times(5)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.i.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.i.unlocked },
    branches: ["f"],
    hotkeys: [
        { key: "i", description: "I: Recruit for insect allies", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    passiveGeneration() { if (hasMilestone("r", 5)) return 1 },
    autoPrestige() { return hasMilestone("d", 4) },
    autoUpgrade() { return hasMilestone("d", 5) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("i", 5)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    milestones: {
        0: { requirementDescription: "2 insect allies", effectDescription: "Microclimates balance themselves", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 insect allies", effectDescription: "Ally gain ×2", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 insect allies", effectDescription: "Detritus gain ×3", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "25 insect allies", effectDescription: "Substrate levels cost half as much", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 insect allies", effectDescription: "Ally gain ×2", done() { return player[this.layer].best.gte(60) } },
        5: { requirementDescription: "150 insect allies", effectDescription: "Keep ally milestones and upgrades through resets", done() { return player[this.layer].best.gte(150) } },
    },

    upgrades: {
        11: { title: "Sweet promises", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Sticky spores", description: "Ally gain ×2.", cost: new Decimal(1) },
        13: { title: "Feed the swarm", description: "Fruiting gain ×2.", cost: new Decimal(3) },
        14: { title: "Six-legged couriers", description: "Hyphae gain ×2.", cost: new Decimal(10) },
        15: {
            title: "Ride the beasts", description: "Spores learn to travel. Unlock Dung Voyage.",
            cost: new Decimal(150),
            onPurchase() { player.d.unlocked = true },
        },
        21: { title: "Pact growth", description: "Ally gain is boosted by your insect allies.", cost: new Decimal(750), effect() { let eff = player.i.points.add(1).pow(0.5); if (eff.gte(100000)) eff = softcap(eff, new Decimal(100000), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Fruiting feedback", description: "Fruiting gain ×3.", cost: new Decimal(3e3) },
        23: {
            title: "Pact economics", description: "Ally gain is boosted by your fruiting bodies.",
            cost: new Decimal(1.5e4),
            unlocked() { return hasUpgrade("i", 21) },
            effect() { let eff = player.f.points.add(1).pow(0.4); if (eff.gte(1e10)) eff = softcap(eff, new Decimal(1e10), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Beetle caravans", description: "Detritus gain ×5.", cost: new Decimal(7e4) },
        25: { title: "Migratory routes", description: "Ally gain ×5.", cost: new Decimal(3e5) },
        31: { title: "Fly highways", description: "Ally gain ×5.", cost: new Decimal(1.5e6) },
        32: { title: "Cap gardens", description: "Fruiting gain ×5.", cost: new Decimal(7e6) },
        33: { title: "Lantern lure", description: "Glow gain ×5.", cost: new Decimal(3e7) },
        34: { title: "Endless swarms", description: "Ally gain ×10.", cost: new Decimal(1.5e8) },
        35: { title: "The pact endures", description: "Ally gain ×10.", cost: new Decimal(7e8) },
    },

    buyables: {
        11: {
            title: "Nectar rewards",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " insect allies<br>Ally gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            title: "Ant guards",
            cost(x) { return new Decimal(100).times(Decimal.pow(4, x)) },
            effect(x) { return Decimal.pow(2, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " insect allies<br>Ally gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})
