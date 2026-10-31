addLayer("n", {
    name: "Nematode Nooses",
    symbol: "N",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#c47a3d",
    resource: "traps",
    row: 8,
    position: 0,
    resetDescription: "Snare for ",

    baseResource: "grove vitality",
    baseAmount() { return player.t.points },
    requires: new Decimal("5e13"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e20"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("n", 12)) mult = mult.times(2)
        if (hasUpgrade("n", 21)) mult = mult.times(upgradeEffect("n", 21))
        if (hasUpgrade("n", 25)) mult = mult.times(5)
        if (hasUpgrade("n", 31)) mult = mult.times(5)
        if (hasUpgrade("n", 34)) mult = mult.times(10)
        if (hasUpgrade("n", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("n", 11))
        if (hasMilestone("n", 0)) mult = mult.times(2)
        if (hasMilestone("n", 2)) mult = mult.times(2)
        if (hasMilestone("n", 4)) mult = mult.times(3)
        if (hasUpgrade("pa", 13)) mult = mult.times(2)
        if (hasUpgrade("pa", 22)) mult = mult.times(3)
        if (hasUpgrade("pa", 32)) mult = mult.times(5)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.n.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.n.unlocked },
    branches: ["t"],
    hotkeys: [
        { key: "n", description: "N: Snare for traps", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    passiveGeneration() { if (hasMilestone("pa", 0)) return 1 },
    autoPrestige() { return hasMilestone("q", 5) },
    autoUpgrade() { return hasMilestone("q", 6) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("n", 5)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    infoboxes: {
        lore: {
            title: "The Forest Hunts",
            body() { return "The gentle decomposer is gone. Now the hyphae knit themselves into <b>lariat nooses</b> and wait, blind and patient, for worms to wander through." },
        },
    },
    tabFormat: [
        ["infobox", "lore"],
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() { if (shiftDown) return "Gain formula: floor((grove vitality / 5e13)^0.25 × multipliers)" }],
        "blank",
        "milestones",
        "blank",
        "upgrades",
        "blank",
        "buyables",
    ],

    milestones: {
        0: { requirementDescription: "2 traps", effectDescription: "Trap gain ×2", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 traps", effectDescription: "Detritus gain ×10", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 traps", effectDescription: "Trap gain ×2", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "25 traps", effectDescription: "Detritus gain ×20", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 traps", effectDescription: "Trap gain ×3", done() { return player[this.layer].best.gte(60) } },
        5: { requirementDescription: "150 traps", effectDescription: "Keep trap milestones and upgrades through resets", done() { return player[this.layer].best.gte(150) } },
    },

    upgrades: {
        11: { title: "Adhesive knobs", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Tighter knots", description: "Trap gain ×2.", cost: new Decimal(1) },
        13: { title: "Feed the grove", description: "Grove gain ×2.", cost: new Decimal(3) },
        14: { title: "Scentless wait", description: "Hyphae gain ×2.", cost: new Decimal(10) },
        15: {
            title: "Teach the worms to farm", description: "Patience becomes agriculture. Unlock Ant Farmers.",
            cost: new Decimal(400),
            onPurchase() { player.pa.unlocked = true },
        },
        21: { title: "Nooses catch nooses", description: "Trap gain is boosted by your traps.", cost: new Decimal(2e3), effect() { let eff = player.n.points.add(1).pow(0.5); if (eff.gte(10000000000)) eff = softcap(eff, new Decimal(10000000000), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Grove feedback", description: "Grove gain ×3.", cost: new Decimal(1e4) },
        23: {
            title: "Weigh the hunt", description: "Trap gain is boosted by your grove vitality.",
            cost: new Decimal(5e4),
            unlocked() { return hasUpgrade("n", 21) },
            effect() { let eff = player.t.points.add(1).pow(0.4); if (eff.gte(1e20)) eff = softcap(eff, new Decimal(1e20), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Digestive lakes", description: "Detritus gain ×5.", cost: new Decimal(2.5e5) },
        25: { title: "Trap gardens", description: "Trap gain ×5.", cost: new Decimal(1.2e6) },
        31: { title: "Noose labyrinths", description: "Trap gain ×5.", cost: new Decimal(6e6) },
        32: { title: "Endless patience", description: "Grove gain ×5.", cost: new Decimal(3e7) },
        33: { title: "Worm farms", description: "Voyage gain ×5.", cost: new Decimal(1.5e8) },
        34: { title: "Nine hundred species", description: "Trap gain ×10.", cost: new Decimal(7.5e8) },
        35: { title: "The hunt endures", description: "Trap gain ×10.", cost: new Decimal(3.7e9) },
    },

    buyables: {
        11: {
            title: "Noose weavers",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " traps<br>Trap gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("c", {
    name: "Cordyceps Dominion",
    symbol: "C",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#d4483b",
    resource: "controlled hosts",
    row: 8,
    position: 1,
    resetDescription: "Seize for ",

    baseResource: "grove vitality",
    baseAmount() { return player.t.points },
    requires: new Decimal("1e14"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e20"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("c", 12)) mult = mult.times(2)
        if (hasUpgrade("c", 21)) mult = mult.times(upgradeEffect("c", 21))
        if (hasUpgrade("c", 25)) mult = mult.times(5)
        if (hasUpgrade("c", 31)) mult = mult.times(5)
        if (hasUpgrade("c", 34)) mult = mult.times(10)
        if (hasUpgrade("c", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("c", 11))
        if (hasMilestone("c", 0)) mult = mult.times(2)
        if (hasMilestone("c", 2)) mult = mult.times(2)
        if (hasMilestone("c", 4)) mult = mult.times(3)
        if (hasUpgrade("pd", 13)) mult = mult.times(2)
        if (hasUpgrade("pd", 22)) mult = mult.times(3)
        if (hasUpgrade("pd", 32)) mult = mult.times(5)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.c.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.c.unlocked },
    branches: ["t"],
    hotkeys: [
        { key: "c", description: "C: Seize for controlled hosts", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    passiveGeneration() { if (hasMilestone("pd", 0)) return 1 },
    autoPrestige() { return hasMilestone("q", 5) },
    autoUpgrade() { return hasMilestone("q", 6) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("c", 5)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    milestones: {
        0: { requirementDescription: "2 controlled hosts", effectDescription: "Host gain ×2", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 controlled hosts", effectDescription: "Detritus gain ×10", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 controlled hosts", effectDescription: "Host gain ×2", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "25 controlled hosts", effectDescription: "Detritus gain ×20", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 controlled hosts", effectDescription: "Host gain ×3", done() { return player[this.layer].best.gte(60) } },
        5: { requirementDescription: "150 controlled hosts", effectDescription: "Keep host milestones and upgrades through resets", done() { return player[this.layer].best.gte(150) } },
    },

    challenges: {
        11: {
            name: "Monoculture",
            challengeDescription() { return "Only detritus remains. Detritus gain is divided by 100.<br>" + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " completions" },
            goalDescription: "Have 1e9 controlled hosts",
            canComplete() { return player.c.points.gte(1e9) },
            rewardDescription: "Detritus gain ×100",
            unlocked() { return player.c.best.gte(40) },
        },
        12: {
            name: "Zombie Uprising",
            challengeDescription() { return "The hosts resist. Grove gain exponent is halved.<br>" + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " completions" },
            goalDescription: "Have 1e10 controlled hosts",
            canComplete() { return player.c.points.gte(1e10) },
            rewardDescription: "Grove gain ×10",
            unlocked() { return player.c.best.gte(40) },
        },
    },

    upgrades: {
        11: { title: "Ophiocordyceps", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Precise bites", description: "Host gain ×2.", cost: new Decimal(1) },
        13: { title: "Feed the canopy", description: "Grove gain ×2.", cost: new Decimal(3) },
        14: { title: "Zombie marches", description: "Hyphae gain ×2.", cost: new Decimal(10) },
        15: {
            title: "Chemical domains", description: "Molds learn medicine. Unlock Penicillin Line.",
            cost: new Decimal(400),
            onPurchase() { player.pd.unlocked = true },
        },
        21: { title: "Hosts seize hosts", description: "Host gain is boosted by your controlled hosts.", cost: new Decimal(2e3), effect() { let eff = player.c.points.add(1).pow(0.5); if (eff.gte(10000000000)) eff = softcap(eff, new Decimal(10000000000), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Canopy feedback", description: "Grove gain ×3.", cost: new Decimal(1e4) },
        23: {
            title: "Weigh the hosts", description: "Host gain is boosted by your grove vitality.",
            cost: new Decimal(5e4),
            unlocked() { return hasUpgrade("c", 21) },
            effect() { let eff = player.t.points.add(1).pow(0.4); if (eff.gte(1e20)) eff = softcap(eff, new Decimal(1e20), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Host cities", description: "Detritus gain ×5.", cost: new Decimal(2.5e5) },
        25: { title: "Dominion bells", description: "Host gain ×5.", cost: new Decimal(1.2e6) },
        31: { title: "Silent kingdoms", description: "Host gain ×5.", cost: new Decimal(6e6) },
        32: { title: "Endless hosts", description: "Grove gain ×5.", cost: new Decimal(3e7) },
        33: { title: "Spore winds", description: "Voyage gain ×5.", cost: new Decimal(1.5e8) },
        34: { title: "Throne of thorns", description: "Host gain ×10.", cost: new Decimal(7.5e8) },
        35: { title: "The dominion endures", description: "Host gain ×10.", cost: new Decimal(3.7e9) },
    },

    buyables: {
        11: {
            title: "Spore drums",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " controlled hosts<br>Host gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("pa", {
    name: "Ant Farmers",
    symbol: "A",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#a34a2a",
    resource: "tended gardens",
    row: 9,
    position: 0,
    resetDescription: "Cultivate for ",

    baseResource: "traps",
    baseAmount() { return player.n.points },
    requires: new Decimal("2e15"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e22"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("pa", 12)) mult = mult.times(2)
        if (hasUpgrade("pa", 21)) mult = mult.times(upgradeEffect("pa", 21))
        if (hasUpgrade("pa", 25)) mult = mult.times(5)
        if (hasUpgrade("pa", 31)) mult = mult.times(5)
        if (hasUpgrade("pa", 34)) mult = mult.times(10)
        if (hasUpgrade("pa", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("pa", 11))
        if (hasMilestone("pa", 1)) mult = mult.times(2)
        if (hasMilestone("pa", 3)) mult = mult.times(2)
        if (hasUpgrade("q", 13)) mult = mult.times(5)
        if (hasUpgrade("q", 22)) mult = mult.times(3)
        if (hasUpgrade("q", 32)) mult = mult.times(5)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.pa.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.pa.unlocked },
    branches: ["n"],
    hotkeys: [
        { key: "j", description: "J: Cultivate for tended gardens", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    passiveGeneration() { if (hasMilestone("pr", 0)) return 1 },
    autoPrestige() { return hasMilestone("q", 5) },
    autoUpgrade() { return hasMilestone("q", 6) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("pa", 5)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    milestones: {
        0: { requirementDescription: "2 tended gardens", effectDescription: "Traps set themselves", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 tended gardens", effectDescription: "Garden gain ×2", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 tended gardens", effectDescription: "Detritus gain ×10", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "25 tended gardens", effectDescription: "Garden gain ×2", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 tended gardens", effectDescription: "Detritus gain ×20", done() { return player[this.layer].best.gte(60) } },
        5: { requirementDescription: "150 tended gardens", effectDescription: "Keep garden milestones and upgrades through resets", done() { return player[this.layer].best.gte(150) } },
    },

    upgrades: {
        11: { title: "Leafcutters", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Fungus chambers", description: "Garden gain ×2.", cost: new Decimal(1) },
        13: { title: "Feed the traps", description: "Trap gain ×2.", cost: new Decimal(3) },
        14: { title: "Leaf highways", description: "Hyphae gain ×2.", cost: new Decimal(10) },
        15: {
            title: "Who domesticated whom", description: "The network thinks. Unlock the Mycelial Mind.",
            cost: new Decimal(500),
            onPurchase() { player.q.unlocked = true },
        },
        21: { title: "Gardens spread", description: "Garden gain is boosted by your tended gardens.", cost: new Decimal(2.5e3), effect() { let eff = player.pa.points.add(1).pow(0.5); if (eff.gte(100000000000)) eff = softcap(eff, new Decimal(100000000000), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Trap feedback", description: "Trap gain ×3.", cost: new Decimal(1.2e4) },
        23: {
            title: "Weigh the colonies", description: "Garden gain is boosted by your traps.",
            cost: new Decimal(6e4),
            unlocked() { return hasUpgrade("pa", 21) },
            effect() { let eff = player.n.points.add(1).pow(0.4); if (eff.gte(1e22)) eff = softcap(eff, new Decimal(1e22), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Metropolis nests", description: "Detritus gain ×5.", cost: new Decimal(3e5) },
        25: { title: "Guild charters", description: "Garden gain ×5.", cost: new Decimal(1.5e6) },
        31: { title: "Slug herding", description: "Garden gain ×5.", cost: new Decimal(7.5e6) },
        32: { title: "Endless colonies", description: "Trap gain ×5.", cost: new Decimal(3.7e7) },
        33: { title: "Garden minds", description: "Thoughts ×2.", cost: new Decimal(1.8e8) },
        34: { title: "Twenty million years", description: "Garden gain ×10.", cost: new Decimal(9e8) },
        35: { title: "The farms endure", description: "Garden gain ×10.", cost: new Decimal(4.5e9) },
    },

    buyables: {
        11: {
            title: "Garden tenders",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " tended gardens<br>Garden gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("pd", {
    name: "Penicillin Line",
    symbol: "Pd",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#6fb7c9",
    resource: "antibiotic yield",
    row: 9,
    position: 1,
    resetDescription: "Synthesize for ",

    baseResource: "controlled hosts",
    baseAmount() { return player.c.points },
    requires: new Decimal("4e15"),
    type: "normal",
    exponent: 0.25,
    softcap: new Decimal("1e22"),
    softcapPower: 0.4,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("pd", 12)) mult = mult.times(2)
        if (hasUpgrade("pd", 21)) mult = mult.times(upgradeEffect("pd", 21))
        if (hasUpgrade("pd", 25)) mult = mult.times(5)
        if (hasUpgrade("pd", 31)) mult = mult.times(5)
        if (hasUpgrade("pd", 34)) mult = mult.times(10)
        if (hasUpgrade("pd", 35)) mult = mult.times(10)
        mult = mult.times(buyableEffect("pd", 11))
        if (hasMilestone("pd", 1)) mult = mult.times(2)
        if (hasMilestone("pd", 3)) mult = mult.times(2)
        if (hasUpgrade("q", 13)) mult = mult.times(5)
        if (hasUpgrade("q", 22)) mult = mult.times(3)
        if (hasUpgrade("q", 32)) mult = mult.times(5)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.pd.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.pd.unlocked },
    branches: ["c"],
    hotkeys: [
        { key: "k", description: "K: Synthesize for antibiotic yield", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    passiveGeneration() { if (hasMilestone("pr", 1)) return 1 },
    autoPrestige() { return hasMilestone("q", 5) },
    autoUpgrade() { return hasMilestone("q", 6) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("pd", 5)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    milestones: {
        0: { requirementDescription: "2 antibiotic yield", effectDescription: "Hosts seize themselves", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 antibiotic yield", effectDescription: "Yield gain ×2", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 antibiotic yield", effectDescription: "Detritus gain ×10", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "25 antibiotic yield", effectDescription: "Yield gain ×2", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 antibiotic yield", effectDescription: "Detritus gain ×20", done() { return player[this.layer].best.gte(60) } },
        5: { requirementDescription: "150 antibiotic yield", effectDescription: "Keep yield milestones and upgrades through resets", done() { return player[this.layer].best.gte(150) } },
    },

    upgrades: {
        11: { title: "Penicillium notatum", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Bactericidal rings", description: "Yield gain ×2.", cost: new Decimal(1) },
        13: { title: "Feed the hosts", description: "Host gain ×2.", cost: new Decimal(3) },
        14: { title: "Clean benches", description: "Hyphae gain ×2.", cost: new Decimal(10) },
        15: {
            title: "A second opinion", description: "The mind is listening. Unlock the Mycelial Mind.",
            cost: new Decimal(500),
            onPurchase() { player.q.unlocked = true },
        },
        21: { title: "Mold spreads", description: "Yield gain is boosted by your antibiotic yield.", cost: new Decimal(2.5e3), effect() { let eff = player.pd.points.add(1).pow(0.5); if (eff.gte(100000000000)) eff = softcap(eff, new Decimal(100000000000), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Host feedback", description: "Host gain ×3.", cost: new Decimal(1.2e4) },
        23: {
            title: "Weigh the vats", description: "Yield gain is boosted by your controlled hosts.",
            cost: new Decimal(6e4),
            unlocked() { return hasUpgrade("pd", 21) },
            effect() { let eff = player.c.points.add(1).pow(0.4); if (eff.gte(1e22)) eff = softcap(eff, new Decimal(1e22), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Industrial fermentation", description: "Detritus gain ×5.", cost: new Decimal(3e5) },
        25: { title: "Patent thickets", description: "Yield gain ×5.", cost: new Decimal(1.5e6) },
        31: { title: "World health", description: "Yield gain ×5.", cost: new Decimal(7.5e6) },
        32: { title: "Endless vats", description: "Host gain ×5.", cost: new Decimal(3.7e7) },
        33: { title: "Pharmacy minds", description: "Thoughts ×2.", cost: new Decimal(1.8e8) },
        34: { title: "A hundred years", description: "Yield gain ×10.", cost: new Decimal(9e8) },
        35: { title: "The line endures", description: "Yield gain ×10.", cost: new Decimal(4.5e9) },
    },

    buyables: {
        11: {
            title: "Mold vats",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " antibiotic yield<br>Yield gain ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("q", {
    name: "Mycelial Mind",
    symbol: "Q",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#b46fd4",
    resource: "thoughts",
    row: 10,
    position: 0,
    resetDescription: "Awaken for ",

    baseResource: "gardens and yield (ants + antibiotics)",
    baseAmount() { return player.pa.points.add(player.pd.points) },
    requires: new Decimal("1e17"),
    type: "custom",

    getResetGain() {
        let pts = player.pa.points.add(player.pd.points)
        if (pts.lt(this.requires)) return new Decimal(0)
        let g = pts.div(this.requires).pow(0.25)
        g = g.times(this.gainMult()).pow(this.gainExp())
        if (g.gte(1e10)) g = g.root(2).times(1e5)
        if (g.gte(1e20)) g = g.root(2).times(1e10)
        if (g.gte(1e60)) g = g.root(3).times(1e40)
        return g.floor().max(0)
    },
    getNextAt(canMax = false) {
        let t = getResetGain(this.layer).add(1)
        return this.requires.times(t.pow(4)).max(this.requires)
    },
    canReset() { return player[this.layer].unlocked && getResetGain(this.layer).gte(1) },
    prestigeButtonText() {
        return "Awaken for +" + formatWhole(getResetGain(this.layer)) + " thoughts<br>Next at " + format(this.getNextAt()) + " gardens and yield"
    },

    gainMult() {
        let mult = new Decimal(1)
        if (hasMilestone("q", 0)) mult = mult.times(2)
        if (hasMilestone("q", 2)) mult = mult.times(2)
        if (hasMilestone("q", 4)) mult = mult.times(3)
        if (hasMilestone("q", 7)) mult = mult.times(5)
        if (hasUpgrade("q", 12)) mult = mult.times(2)
        if (hasUpgrade("q", 21)) mult = mult.times(upgradeEffect("q", 21))
        if (hasUpgrade("q", 25)) mult = mult.times(5)
        if (hasUpgrade("q", 31)) mult = mult.times(5)
        if (hasUpgrade("q", 35)) mult = mult.times(10)
        if (hasUpgrade("q", 41)) mult = mult.times(10)
        if (hasUpgrade("q", 44)) mult = mult.times(25)
        if (hasUpgrade("q", 51)) mult = mult.times(50)
        if (hasUpgrade("q", 54)) mult = mult.times(100)
        if (hasUpgrade("q", 55)) mult = mult.times(250)
        mult = mult.times(buyableEffect("q", 11))
        mult = mult.times(buyableEffect("q", 12))
        if (hasUpgrade("pa", 33)) mult = mult.times(2)
        if (hasUpgrade("pd", 33)) mult = mult.times(2)
        if (hasUpgrade("pr", 13)) mult = mult.times(2)
        if (hasUpgrade("pr", 22)) mult = mult.times(3)
        if (hasUpgrade("pr", 32)) mult = mult.times(5)
        return mult
    },
    gainExp() { return new Decimal(1) },

    effect() {
        let eff = player.q.points.add(1).pow(0.2)
        if (eff.gte("1e15")) eff = softcap(eff, new Decimal("1e15"), 0.5)
        return eff
    },
    effectDescription() { return "boosting Detritus gain ×" + format(this.effect()) },

    layerShown() { return player.q.unlocked },
    branches: ["pa", "pd"],
    hotkeys: [
        { key: "q", description: "Q: Awaken for thoughts", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    passiveGeneration() { if (hasMilestone("pr", 2)) return 1 },
    autoPrestige() { return hasMilestone("x", 1) },
    autoUpgrade() { return hasMilestone("x", 1) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row >= 10) return
        if (layers[resettingLayer].row > this.row) {
            let kept = []
            if (hasMilestone("q", 7)) kept.push("milestones", "upgrades")
            layerDataReset(this.layer, kept)
        }
    },

    infoboxes: {
        lore: {
            title: "The Network Wakes",
            body() { return "For a billion years the web only grew. Now, for the first time, it <b>thinks</b>. Every hypha is a neuron; every forest, a hemisphere." },
        },
    },
    tabFormat: [
        ["infobox", "lore"],
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() { if (shiftDown) return "Gain formula: floor(((gardens+yield)/1e17)^0.25 × mults)^exp, re-rooted at 1e10 / 1e20 / 1e60" }],
        "blank",
        "milestones",
        "blank",
        "upgrades",
        "blank",
        "buyables",
    ],

    milestones: {
        0: { requirementDescription: "2 thoughts", effectDescription: "Thoughts ×2", done() { return player[this.layer].best.gte(2) } },
        1: { requirementDescription: "5 thoughts", effectDescription: "Detritus gain ×10", done() { return player[this.layer].best.gte(5) } },
        2: { requirementDescription: "10 thoughts", effectDescription: "Thoughts ×2", done() { return player[this.layer].best.gte(10) } },
        3: { requirementDescription: "25 thoughts", effectDescription: "Grove gain ×5", done() { return player[this.layer].best.gte(25) } },
        4: { requirementDescription: "60 thoughts", effectDescription: "Thoughts ×3", done() { return player[this.layer].best.gte(60) } },
        5: { requirementDescription: "150 thoughts", effectDescription: "The grove, traps, hosts, gardens and yield reset themselves", done() { return player[this.layer].best.gte(150) } },
        6: { requirementDescription: "400 thoughts", effectDescription: "Their upgrades buy themselves too", done() { return player[this.layer].best.gte(400) } },
        7: { requirementDescription: "1,000 thoughts", effectDescription: "Thoughts ×5; keep mind milestones and upgrades", done() { return player[this.layer].best.gte(1000) } },
    },

    upgrades: {
        11: { title: "A thought", description: "Detritus gain ×2.", cost: new Decimal(0) },
        12: { title: "Patterns", description: "Thoughts ×2.", cost: new Decimal(1) },
        13: { title: "Tend the farmers", description: "Gardens and yield gain ×5.", cost: new Decimal(5) },
        14: { title: "Recall the floor", description: "Hyphae gain ×3.", cost: new Decimal(25) },
        15: {
            title: "Remember the giants", description: "The mind dreams of its ancestors. Unlock Prototaxites.",
            cost: new Decimal(100),
            onPurchase() { player.pr.unlocked = true },
        },
        21: { title: "Thinking about thinking", description: "Thoughts are boosted by your thoughts.", cost: new Decimal(500), effect() { let eff = player.q.points.add(1).pow(0.5); if (eff.gte(10000000000)) eff = softcap(eff, new Decimal(10000000000), 0.5); return eff }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title: "Tend them more", description: "Gardens and yield gain ×3.", cost: new Decimal(2.5e3) },
        23: {
            title: "Weigh the mind", description: "Thoughts are boosted by your gardens and yield.",
            cost: new Decimal(1.2e4),
            unlocked() { return hasUpgrade("q", 21) },
            effect() { let eff = player.pa.points.add(player.pd.points).add(1).pow(0.4); if (eff.gte(1e22)) eff = softcap(eff, new Decimal(1e22), 0.5); return eff },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: { title: "Parallel selves", description: "Detritus gain ×5.", cost: new Decimal(6e4) },
        25: {
            title: "Dream of the stars", description: "The mind looks up. Unlock Xenospores.",
            cost: new Decimal(3e5),
            onPurchase() { player.x.unlocked = true },
        },
        31: { title: "Deep thought", description: "Thoughts ×5.", cost: new Decimal(1.5e6) },
        32: { title: "Tend them all", description: "Gardens and yield gain ×5.", cost: new Decimal(7.5e6) },
        33: { title: "The grove dreams", description: "Grove gain ×5.", cost: new Decimal(3.7e7) },
        34: { title: "Planetary awareness", description: "Detritus gain ×10.", cost: new Decimal(1.8e8) },
        35: { title: "Persistent minds", description: "Thoughts ×10.", cost: new Decimal(9e8) },
        41: { title: "Minds within minds", description: "Thoughts ×10.", cost: new Decimal(4.5e9) },
        42: { title: "Tend the ancestors", description: "Gardens and yield gain ×10.", cost: new Decimal(2.2e10) },
        43: { title: "The hum of worlds", description: "Detritus gain ×25.", cost: new Decimal(1.1e11) },
        44: { title: "Deep memories", description: "Thoughts ×25.", cost: new Decimal(5.5e11) },
        45: { title: "Ancient routes re-open", description: "Hyphae gain ×25.", cost: new Decimal(2.7e12) },
        51: { title: "A billion years of thought", description: "Thoughts ×50.", cost: new Decimal(1.3e13) },
        52: { title: "Tend everything", description: "Gardens and yield gain ×25.", cost: new Decimal(6.5e13) },
        53: { title: "Detritus meditations", description: "Detritus gain ×100.", cost: new Decimal(3.2e14) },
        54: { title: "Galactic minds", description: "Thoughts ×100.", cost: new Decimal(1.6e15) },
        55: { title: "The mind endures", description: "Thoughts ×250.", cost: new Decimal(8e15) },
    },

    buyables: {
        11: {
            title: "Neuron knots",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " thoughts<br>Thoughts ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            title: "Dreaming spires",
            cost(x) { return new Decimal(100).times(Decimal.pow(4, x)) },
            effect(x) { return Decimal.pow(2, x) },
            display() { let data = tmp[this.layer].buyables[this.id]; return "Cost: " + format(data.cost) + " thoughts<br>Thoughts ×" + format(data.effect) + "<br>Purchased: " + formatWhole(player[this.layer].buyables[this.id]) },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})
