addLayer("b", {
    name: "Brewing",
    symbol: "🍺",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            esters: new Decimal(0),
        }
    },
    color: "#B8860B",
    resource: "brew",
    row: 1,

    baseResource: "yeast",
    baseAmount() { return player.y.points },
    requires: new Decimal(100),
    type: "normal",
    exponent: 1 / 3,

    softcap() {
        let cap = new Decimal("1e9")
        if (hasUpgrade("b", 15)) cap = new Decimal("1e11")
        if (hasUpgrade("b", 42)) cap = new Decimal("1e13")
        if (hasUpgrade("s", 13)) cap = cap.times(100)
        return cap
    },
    softcapPower() { return new Decimal(0.4) },

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("b", 11)) m = m.times(2)
        if (hasUpgrade("b", 12)) m = m.times(upgradeEffect("b", 12))
        if (hasUpgrade("b", 13)) m = m.times(upgradeEffect("b", 13))
        if (hasUpgrade("b", 22)) m = m.times(3)
        if (hasUpgrade("b", 23)) m = m.times(upgradeEffect("b", 23))
        if (hasUpgrade("b", 24)) m = m.times(upgradeEffect("b", 24))
        if (hasUpgrade("b", 32)) m = m.times(upgradeEffect("b", 32))
        if (hasUpgrade("b", 33)) m = m.times(upgradeEffect("b", 33))
        if (hasUpgrade("b", 41)) m = m.times(upgradeEffect("b", 41))
        if (hasUpgrade("b", 43)) m = m.times(upgradeEffect("b", 43))
        if (hasUpgrade("b", 44)) m = m.times(5)
        if (hasUpgrade("b", 51)) m = m.times(upgradeEffect("b", 51))
        if (hasUpgrade("b", 55)) m = m.times(upgradeEffect("b", 55))
        if (hasUpgrade("y", 15)) m = m.times(upgradeEffect("y", 15))
        if (hasUpgrade("o", 13)) m = m.times(upgradeEffect("o", 13))
        if (hasMilestone("y", 6)) m = m.times(2)
        if (hasMilestone("e", 0)) m = m.times(2)
        if (hasMilestone("e", 4)) m = m.times(3)
        if (hasMilestone("t", 1)) m = m.times(2)
        if (hasMilestone("g", 2)) m = m.times(2)
        if (hasMilestone("g", 11)) m = m.times(5)
        if (getBuyableAmount("b", 21).gte(1)) m = m.times(buyableEffect("b", 21))
        if (hasChallenge("c", 13)) m = m.times(challengeEffect("c", 13))
        if (hasChallenge("c", 23)) m = m.times(challengeEffect("c", 23))
        if (hasAchievement("a", 33)) m = m.times(2)
        if (inChallenge("c", 12)) m = m.times(0.25)
        if (inChallenge("c", 22)) m = m.times(0.05)
        return m
    },
    gainExp() {
        let g = new Decimal(1)
        if (hasUpgrade("e", 15)) g = g.add(0.01)
        return g
    },

    update(diff) {
        if (hasUpgrade("b", 21)) {
            let rate = player.b.points.add(1).pow(0.3).times(bEsterMult())
            player.b.esters = player.b.esters.add(rate.times(diff))
        }
        if (hasUpgrade("b", 34)) {
            let sugarRate = upgradeEffect("b", 34)
            player.points = player.points.add(sugarRate.times(diff))
        }
    },

    resetsNothing() { return hasMilestone("b", 2) },
    autoPrestige() { return hasMilestone("e", 3) || hasAchievement("a", 53) },
    autoUpgrade() { return hasMilestone("w", 0) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let keep = ["unlocked", "auto"]
        if (hasMilestone("s", 1) || hasMilestone("g", 6)) keep.push("upgrades")
        if (hasMilestone("s", 1) || hasMilestone("g", 6)) keep.push("milestones")
        layerDataReset(this.layer, keep)
    },

    layerShown() { return player[this.layer].unlocked || hasUpgrade("y", 25) },
    branches: ["y"],
    hotkeys: [
        {
            key: "b",
            description: "B: Brew a batch",
            onPress() { if (canReset(this.layer)) doReset(this.layer) },
        },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function () { return "You have " + format(player.y.points) + " yeast ready to pitch" }],
        ["display-text", function () {
            if (player.b.points.gte(tmp.b.softcap.div(2))) return "Softcap starts at " + format(tmp.b.softcap) + " brew"
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": {
                content: [
                    ["blank", "10px"],
                    ["raw-html", function () { return "<div style='opacity:.55'>Sanitize, pitch, wait. Repeat forever.</div>" }],
                    ["blank", "10px"],
                    "upgrades",
                ],
            },
            "Esters": {
                unlocked() { return hasUpgrade("b", 21) },
                content: [
                    ["blank", "10px"],
                    ["display-text", function () {
                        return "<h2 style='color:#ff9a3c'>You have " + format(player.b.esters) + " esters</h2>"
                    }],
                    ["display-text", function () {
                        return "+" + format(bEsterRate()) + " esters/sec" + (hasUpgrade("b", 34) ? " — and +" + format(upgradeEffect("b", 34)) + " sugar/sec from the second fermentation" : "")
                    }],
                    ["blank", "10px"],
                    ["buyables", [21, 22, 23]],
                ],
            },
            "Milestones": {
                content: [["blank", "10px"], "milestones"],
            },
            "Buyables": {
                content: [["blank", "10px"], ["buyables", [11]]],
            },
        },
    },

    tooltip() { return "Turn yeast into brew. Esters are the soul of flavor." },
    tooltipLocked() { return "Pitch a proper starter (Budding upgrade 25) to unlock brewing" },

    upgrades: {
        11: {
            title: "Sanitize Everything",
            description: "Double brew gain.",
            cost: new Decimal(1),
        },
        12: {
            title: "Fermentation Heat",
            description: "Brew gain is boosted by your unspent brew.",
            cost: new Decimal(3),
            unlocked() { return hasUpgrade(this.layer, 11) },
            effect() {
                let ret = player[this.layer].points.add(1).pow(0.5)
                ret = softcap(ret, new Decimal("1e8"), new Decimal(0.5))
                if (hasUpgrade("t", 22)) ret = ret.times(upgradeEffect("t", 22))
                return ret
            },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        13: {
            title: "Baker's Discount",
            description: "Brew gain is boosted by your bread.",
            cost: new Decimal(8),
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return player.k.points.add(1).pow(0.4) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        14: {
            title: "Guild Charter",
            description: "Colony Efficiency (Budding 41) is fueled by your brew.",
            cost: new Decimal(25),
            unlocked() { return hasUpgrade(this.layer, 13) },
            effect() { return player[this.layer].points.add(1).pow(0.1) },
            effectDisplay() { return format(this.effect()) + "× to Budding 41" },
        },
        15: {
            title: "Unitank Ageing",
            description: "The brew softcap starts 100× later.",
            cost: new Decimal(100),
            unlocked() { return hasUpgrade(this.layer, 14) },
            effect() { return hasUpgrade(this.layer, 15) ? new Decimal("1e11") : new Decimal("1e9") },
            effectDisplay() { return "Softcap: " + format(this.effect()) },
        },
        21: {
            title: "Ester Recovery Column",
            description: "Rig the column — <b>unlocks esters</b>, the flavor compounds that accumulate over time.",
            cost: new Decimal(500),
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
        22: {
            title: "Copper Kettle",
            description: "Triple brew gain.",
            cost: new Decimal(2e3),
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
        23: {
            title: "Wild Notes",
            description: "Brew gain is boosted by the log of your brew.",
            cost: new Decimal(1e4),
            unlocked() { return hasUpgrade(this.layer, 22) },
            effect() { return player[this.layer].points.add(10).log(10).pow(1.5) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        24: {
            title: "Whiskey Fuel",
            description: "Brew gain is boosted by your ATP.",
            cost: new Decimal(5e4),
            unlocked() { return hasUpgrade(this.layer, 23) },
            effect() { return player.o.points.add(1).pow(0.35) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        25: {
            title: "Distill the Wash",
            description: "<b>Unlock the Distillery</b> — concentrate everything you have learned.",
            cost: new Decimal(2.5e5),
            unlocked() { return hasUpgrade(this.layer, 24) },
            onPurchase() { player.e.unlocked = true },
        },
        31: {
            title: "Lagering",
            description: "Double yeast gain.",
            cost: new Decimal(1e6),
            unlocked() { return hasUpgrade(this.layer, 25) },
        },
        32: {
            title: "Tavern Contract",
            description: "Brew gain is boosted by your coins.",
            cost: new Decimal(5e6),
            unlocked() { return hasUpgrade(this.layer, 31) },
            effect() { return player.t.points.add(1).pow(0.3) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        33: {
            title: "Dry Hopping",
            description: "Brew gain is boosted by your brew, again.",
            cost: new Decimal(2.5e7),
            unlocked() { return hasUpgrade(this.layer, 32) },
            effect() { return player[this.layer].points.add(1).pow(0.25) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        34: {
            title: "Second Fermentation",
            description: "Esters ferment back into sugar: gain sugar over time.",
            cost: new Decimal(1e8),
            unlocked() { return hasUpgrade(this.layer, 33) },
            effect() { return player.b.esters.add(1).pow(0.3).div(10) },
            effectDisplay() { return "+" + format(this.effect()) + " sugar/sec" },
        },
        35: {
            title: "Sensory Panel",
            description: "<b>Unlock the Flavor Lab</b> (second esters buyable).",
            cost: new Decimal(5e8),
            unlocked() { return hasUpgrade(this.layer, 34) },
        },
        41: {
            title: "Krausen Feedback",
            description: "Brew gain is boosted by your brew, compounding (softcapped).",
            cost: new Decimal(2e9),
            unlocked() { return hasUpgrade(this.layer, 35) },
            effect() {
                let ret = player[this.layer].points.add(1).pow(0.5)
                if (ret.gte(1e6)) ret = ret.pow(0.5).times(1000)
                return ret
            },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        42: {
            title: "Pressure Fermentation",
            description: "The brew softcap starts 100× later, again.",
            cost: new Decimal(1e10),
            unlocked() { return hasUpgrade(this.layer, 41) },
            effect() { return hasUpgrade(this.layer, 42) ? new Decimal("1e13") : new Decimal("1e11") },
            effectDisplay() { return "Softcap: " + format(this.effect()) },
        },
        43: {
            title: "Barrel-Aged",
            description: "Brew gain scales with your discovered strains.",
            cost: new Decimal(5e10),
            unlocked() { return hasUpgrade(this.layer, 42) },
            effect() {
                let n = player.w.strains.length
                return new Decimal(n >= 5 ? 3 : 1.5)
            },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        44: {
            title: "Cold Crash",
            description: "Quintuple brew gain.",
            cost: new Decimal(2.5e11),
            unlocked() { return hasUpgrade(this.layer, 43) },
        },
        45: {
            title: "Blending Program",
            description: "<b>Unlock the Aroma Library</b> (third esters buyable).",
            cost: new Decimal(1e12),
            unlocked() { return hasUpgrade(this.layer, 44) },
        },
        51: {
            title: "House Flavor",
            description: "Brew gain is boosted by your medals.",
            cost: new Decimal(5e12),
            unlocked() { return hasUpgrade(this.layer, 45) },
            effect() { return player.c.points.add(1).pow(0.3) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        52: {
            title: "Ester Alchemy",
            description: "Ester Recovery is fueled by your esters.",
            cost: new Decimal(2.5e13),
            unlocked() { return hasUpgrade(this.layer, 51) },
            effect() { return player.b.esters.add(1).pow(0.15) },
            effectDisplay() { return format(this.effect()) + "× to Ester Recovery" },
        },
        53: {
            title: "Brewer's Grains",
            description: "Bread gain is boosted by your esters.",
            cost: new Decimal(1e14),
            unlocked() { return hasUpgrade(this.layer, 52) },
            effect() { return player.b.esters.add(1).pow(0.25) },
            effectDisplay() { return format(this.effect()) + "× bread gain" },
        },
        54: {
            title: "Master Piper",
            description: "Double ester production. (Doubled again by milestone 7.)",
            cost: new Decimal(1e15),
            unlocked() { return hasUpgrade(this.layer, 53) },
            effect() {
                let r = new Decimal(2)
                if (hasMilestone("b", 7)) r = r.times(2)
                return r
            },
            effectDisplay() { return format(this.effect()) + "× esters" },
        },
        55: {
            title: "Grand Reserve",
            description: "Brew gain is boosted by your brew, one last time.",
            cost: new Decimal(1e16),
            unlocked() { return hasUpgrade(this.layer, 54) },
            effect() { return player[this.layer].points.add(1).pow(0.15) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
    },

    milestones: {
        0: {
            requirementDescription: "50 brew",
            effectDescription: "Double sugar gain.",
            done() { return player[this.layer].best.gte(50) },
        },
        1: {
            requirementDescription: "250 brew",
            effectDescription: "Double brew gain.",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].best.gte(250) },
        },
        2: {
            requirementDescription: "1,500 brew",
            effectDescription: "Brewing no longer resets your yeast.",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(1500) },
        },
        3: {
            requirementDescription: "8,000 brew",
            effectDescription: "Double yeast gain.",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].best.gte(8e3) },
        },
        4: {
            requirementDescription: "50,000 brew",
            effectDescription: "Double ester production.",
            unlocked() { return hasMilestone(this.layer, 3) },
            done() { return player[this.layer].best.gte(5e4) },
        },
        5: {
            requirementDescription: "300,000 brew",
            effectDescription: "Automatically buy Budding upgrades.",
            unlocked() { return hasMilestone(this.layer, 4) },
            done() { return player[this.layer].best.gte(3e5) },
        },
        6: {
            requirementDescription: "2,000,000 brew",
            effectDescription: "Triple brew gain.",
            unlocked() { return hasMilestone(this.layer, 5) },
            done() { return player[this.layer].best.gte(2e6) },
        },
        7: {
            requirementDescription: "10,000,000 brew",
            effectDescription: "Double bread gain and ester production.",
            unlocked() { return hasMilestone(this.layer, 6) },
            done() { return player[this.layer].best.gte(1e7) },
        },
    },

    buyables: {
        11: {
            title: "Mash Tun",
            cost(x) { return new Decimal(25).times(Decimal.pow(2.5, x)) },
            effect(x) { return Decimal.pow(1.8, x) },
            display() {
                return "Brew gain ×" + format(tmp[this.layer].buyables[this.id].effect) +
                    "<br>Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " brew"
            },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        21: {
            title: "Ester Recovery",
            unlocked() { return hasUpgrade("b", 21) },
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) {
                let eff = Decimal.pow(1.5, x)
                if (hasUpgrade("b", 52)) eff = eff.times(upgradeEffect("b", 52))
                return eff
            },
            display() {
                return "Brew gain ×" + format(tmp[this.layer].buyables[this.id].effect) +
                    "<br>Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " esters"
            },
            canAfford() { return player[this.layer].esters.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player[this.layer].esters = player[this.layer].esters.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        22: {
            title: "Flavor Lab",
            unlocked() { return hasUpgrade("b", 35) },
            cost(x) { return new Decimal(100).times(Decimal.pow(4, x)) },
            effect(x) { return Decimal.pow(1.4, x) },
            display() {
                return "Yeast gain ×" + format(tmp[this.layer].buyables[this.id].effect) +
                    "<br>Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " esters"
            },
            canAfford() { return player[this.layer].esters.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player[this.layer].esters = player[this.layer].esters.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        23: {
            title: "Aroma Library",
            unlocked() { return hasUpgrade("b", 45) },
            cost(x) { return new Decimal(1e4).times(Decimal.pow(5, x)) },
            effect(x) { return Decimal.pow(1.5, x) },
            display() {
                return "Sugar gain ×" + format(tmp[this.layer].buyables[this.id].effect) +
                    "<br>Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " esters"
            },
            canAfford() { return player[this.layer].esters.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player[this.layer].esters = player[this.layer].esters.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

function bEsterMult() {
    let m = new Decimal(1)
    if (hasMilestone("b", 4)) m = m.times(2)
    if (hasUpgrade("b", 54)) m = m.times(upgradeEffect("b", 54))
    return m
}
function bEsterRate() {
    if (!hasUpgrade("b", 21)) return new Decimal(0)
    return player.b.points.add(1).pow(0.3).times(bEsterMult())
}

addLayer("k", {
    name: "Baking",
    symbol: "🍞",
    position: 1,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            kneading: false,
            kneadProgress: new Decimal(0),
            kneads: new Decimal(0),
        }
    },
    color: "#D2B48C",
    resource: "bread",
    row: 1,

    baseResource: "yeast",
    baseAmount() { return player.y.points },
    requires: new Decimal(250),
    type: "normal",
    exponent: 1 / 3,

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("k", 11)) m = m.times(2)
        if (hasUpgrade("k", 12)) m = m.times(upgradeEffect("k", 12))
        if (hasUpgrade("k", 13)) m = m.times(upgradeEffect("k", 13))
        if (hasUpgrade("k", 21)) m = m.times(upgradeEffect("k", 21))
        if (hasUpgrade("k", 22)) m = m.times(3)
        if (hasUpgrade("k", 23)) m = m.times(upgradeEffect("k", 23))
        if (hasUpgrade("k", 24)) m = m.times(upgradeEffect("k", 24))
        if (hasUpgrade("o", 22)) m = m.times(upgradeEffect("o", 22))
        if (hasUpgrade("b", 53)) m = m.times(upgradeEffect("b", 53))
        if (hasMilestone("k", 1)) m = m.times(2)
        if (hasMilestone("k", 5)) m = m.times(3)
        if (hasMilestone("b", 7)) m = m.times(2)
        if (hasMilestone("g", 4)) m = m.times(2)
        if (hasMilestone("g", 13)) m = m.times(5)
        if (hasUpgrade("w", 22)) m = m.times(upgradeEffect("w", 22))
        if (hasAchievement("a", 32)) m = m.times(2)
        if (hasAchievement("a", 44)) m = m.times(3)
        if (hasAchievement("a", 61)) m = m.times(1.5)
        if (hasAchievement("a", 62)) m = m.times(2)
        m = m.times(layers.w.strainMult())
        return m
    },
    gainExp() {
        let g = new Decimal(1)
        if (inChallenge("c", 13)) g = g.times(0.6)
        return g
    },

    update(diff) {
        if (!player.k.unlocked) return
        if (hasMilestone("k", 4) && !player.k.kneading) player.k.kneading = true
        if (player.k.kneading) {
            player.k.kneadProgress = player.k.kneadProgress.add(kneadSpeed().times(diff))
            if (player.k.kneadProgress.gte(1)) {
                player.k.kneadProgress = new Decimal(0)
                player.k.kneads = player.k.kneads.add(1)
                let batch = kneadBatch()
                player.points = player.points.add(batch)
                if (!hasMilestone("k", 4)) player.k.kneading = false
            }
        }
    },

    resetsNothing() { return false },
    autoPrestige() { return hasMilestone("t", 2) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let keep = ["unlocked", "auto"]
        if (hasMilestone("s", 1) || hasMilestone("g", 10) || hasMilestone("k", 7)) keep.push("upgrades")
        if (hasMilestone("s", 1) || hasMilestone("g", 10)) keep.push("milestones")
        layerDataReset(this.layer, keep)
    },

    layerShown() { return player[this.layer].unlocked || hasUpgrade("y", 35) },
    branches: ["y"],
    hotkeys: [
        {
            key: "k",
            description: "K: Bake a batch",
            onPress() { if (canReset(this.layer)) doReset(this.layer) },
        },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function () { return "You have " + format(player.y.points) + " yeast hungry for flour" }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": {
                content: [
                    ["blank", "10px"],
                    ["raw-html", function () { return "<div style='opacity:.55'>Flour, water, salt, time.</div>" }],
                    ["blank", "10px"],
                    "upgrades",
                ],
            },
            "Kneading": {
                content: [
                    ["blank", "10px"],
                    ["display-text", function () { return "Batches kneaded: " + formatWhole(player.k.kneads) }],
                    ["blank", "5px"],
                    ["bar", "kRising"],
                    ["blank", "10px"],
                    ["clickables", [11]],
                    ["blank", "5px"],
                    ["display-text", function () {
                        return "Each finished batch pays " + format(kneadBatch()) + " sugar (softcapped)."
                    }],
                ],
            },
            "Milestones": {
                content: [["blank", "10px"], "milestones"],
            },
            "Buyables": {
                unlocked() { return hasUpgrade("k", 15) },
                content: [["blank", "10px"], "buyables"],
            },
        },
    },

    bars: {
        kRising: {
            direction: RIGHT,
            width: 360,
            height: 40,
            progress() { return player.k.kneadProgress.min(1).toNumber() },
            display() {
                if (!player.k.kneading) return "The dough is resting — knead it to start the rise"
                return "Rising… " + format(player.k.kneadProgress.times(100).min(100)) + "%"
            },
            fillStyle: { 'background-color': "#D2B48C" },
            baseStyle: { 'background-color': "#8c7a5c" },
            textStyle: { 'color': "#3a2d18" },
            unlocked() { return player.k.unlocked },
        },
    },

    clickables: {
        11: {
            title: "Knead the dough",
            display() { return player.k.kneading ? "The dough is rising…" : "Start the rise" },
            canClick() { return player.k.unlocked && !player.k.kneading },
            onClick() { player.k.kneading = true },
            style() { return player.k.kneading ? { 'background-color': "#8c7a5c" } : { 'background-color': "#D2B48C", 'color': "#3a2d18" } },
        },
    },

    tooltip() { return "Knead dough, feed the oven, sell the crust" },
    tooltipLocked() { return "Flour and water (Budding upgrade 35) unlock baking" },

    upgrades: {
        11: {
            title: "Flour Power",
            description: "Double bread gain.",
            cost: new Decimal(1),
        },
        12: {
            title: "Gluten Network",
            description: "Bread gain is boosted by your unspent bread.",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade(this.layer, 11) },
            effect() {
                let ret = player[this.layer].points.add(1).pow(0.5)
                return softcap(ret, new Decimal("1e6"), new Decimal(0.5))
            },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        13: {
            title: "Oven Breath",
            description: "Bread gain is boosted by your ATP.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return player.o.points.add(1).pow(0.35) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        14: {
            title: "Double Knead",
            description: "Kneading works twice as fast.",
            cost: new Decimal(15),
            unlocked() { return hasUpgrade(this.layer, 13) },
            effect() { return hasUpgrade(this.layer, 14) ? new Decimal(2) : new Decimal(1) },
            effectDisplay() { return format(this.effect()) + "× speed" },
        },
        15: {
            title: "Build a Proofing Basket",
            description: "<b>Unlock the buyable</b> — every bakery needs baskets.",
            cost: new Decimal(50),
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        21: {
            title: "Sourdough Starter",
            description: "Bread gain scales with your discovered strains.",
            cost: new Decimal(200),
            unlocked() { return hasUpgrade(this.layer, 15) },
            effect() { return player.w.strains.length >= 1 ? Decimal.pow(player.w.strains.length, 0.6).add(1) : new Decimal(1) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        22: {
            title: "Biga",
            description: "Triple bread gain.",
            cost: new Decimal(800),
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
        23: {
            title: "Poolish Pre-ferment",
            description: "Bread gain is boosted by your bread, compounding (softcapped).",
            cost: new Decimal(3e3),
            unlocked() { return hasUpgrade(this.layer, 22) },
            effect() {
                let ret = player[this.layer].points.add(1).pow(0.5)
                if (ret.gte(1e4)) ret = ret.pow(0.5).times(100)
                return ret
            },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        24: {
            title: "Brewer's Grains",
            description: "Bread gain is boosted by your brew.",
            cost: new Decimal(1.5e4),
            unlocked() { return hasUpgrade(this.layer, 23) },
            effect() { return player.b.points.add(1).pow(0.35) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        25: {
            title: "The Oven Tower",
            description: "<b>Unlock the second buyable</b> — a tower of ovens.",
            cost: new Decimal(8e4),
            unlocked() { return hasUpgrade(this.layer, 24) },
        },
        31: {
            title: "Leaven",
            description: "Double sugar gain.",
            cost: new Decimal(4e5),
            unlocked() { return hasUpgrade(this.layer, 25) },
        },
        32: {
            title: "Long Autolyse",
            description: "Kneading batches pay double.",
            cost: new Decimal(2e6),
            unlocked() { return hasUpgrade(this.layer, 31) },
            effect() { return hasUpgrade(this.layer, 32) ? new Decimal(2) : new Decimal(1) },
            effectDisplay() { return format(this.effect()) + "× batch" },
        },
        33: {
            title: "Laminated Dough",
            description: "Kneading batches scale with your bread (harder with wild strains).",
            cost: new Decimal(1e7),
            unlocked() { return hasUpgrade(this.layer, 32) },
            effect() {
                let exp = player.w.strains.length >= 8 ? 0.4 : 0.3
                return player[this.layer].points.add(1).pow(exp)
            },
            effectDisplay() { return format(this.effect()) + "× batch" },
        },
        34: {
            title: "Sponge Automation",
            description: "The sponge keeps working on its own: +0.5 kneads/sec.",
            cost: new Decimal(5e7),
            unlocked() { return hasUpgrade(this.layer, 33) },
            effect() { return hasUpgrade(this.layer, 34) ? new Decimal(0.5) : new Decimal(0) },
            effectDisplay() { return "+" + format(this.effect()) + " kneads/sec" },
        },
        35: {
            title: "Ancient Grain",
            description: "Exponential Appetite (Budding 23) is fueled by your bread.",
            cost: new Decimal(2.5e8),
            unlocked() { return hasUpgrade(this.layer, 34) },
            effect() { return player[this.layer].points.add(1).pow(0.1) },
            effectDisplay() { return format(this.effect()) + "× to Budding 23" },
        },
    },

    milestones: {
        0: {
            requirementDescription: "40 bread",
            effectDescription: "Double sugar gain.",
            done() { return player[this.layer].best.gte(40) },
        },
        1: {
            requirementDescription: "200 bread",
            effectDescription: "Double bread gain.",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].best.gte(200) },
        },
        2: {
            requirementDescription: "1,000 bread",
            effectDescription: "Automatically bud new yeast.",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(1000) },
        },
        3: {
            requirementDescription: "6,000 bread",
            effectDescription: "Double yeast gain.",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].best.gte(6e3) },
        },
        4: {
            requirementDescription: "30,000 bread",
            effectDescription: "The dough kneads itself (auto-kneading).",
            unlocked() { return hasMilestone(this.layer, 3) },
            done() { return player[this.layer].best.gte(3e4) },
        },
        5: {
            requirementDescription: "200,000 bread",
            effectDescription: "Triple bread gain.",
            unlocked() { return hasMilestone(this.layer, 4) },
            done() { return player[this.layer].best.gte(2e5) },
        },
        6: {
            requirementDescription: "1,000,000 bread",
            effectDescription: "Double ATP gain.",
            unlocked() { return hasMilestone(this.layer, 5) },
            done() { return player[this.layer].best.gte(1e6) },
        },
        7: {
            requirementDescription: "5,000,000 bread",
            effectDescription: "Your upgrades survive resets of this layer.",
            unlocked() { return hasMilestone(this.layer, 6) },
            done() { return player[this.layer].best.gte(5e6) },
        },
    },

    buyables: {
        11: {
            title: "Proofing Basket",
            unlocked() { return hasUpgrade("k", 15) },
            cost(x) { return new Decimal(20).times(Decimal.pow(2.6, x)) },
            effect(x) { return Decimal.pow(1.7, x) },
            display() {
                return "Bread gain ×" + format(tmp[this.layer].buyables[this.id].effect) +
                    "<br>Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " bread"
            },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            title: "Oven Tower",
            unlocked() { return hasUpgrade("k", 25) },
            cost(x) { return new Decimal(2000).times(Decimal.pow(3.4, x)) },
            effect(x) { return Decimal.pow(2.2, x) },
            display() {
                return "Sugar gain ×" + format(tmp[this.layer].buyables[this.id].effect) +
                    "<br>Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " bread"
            },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

function kneadSpeed() {
    let s = new Decimal(0.15)
    if (hasUpgrade("k", 14)) s = s.times(upgradeEffect("k", 14))
    if (hasUpgrade("k", 34)) s = s.add(upgradeEffect("k", 34))
    return s
}
function kneadBatch() {
    let batch = new Decimal(30).times(Decimal.pow(player.k.points.add(1), 0.25))
    if (hasUpgrade("k", 32)) batch = batch.times(upgradeEffect("k", 32))
    if (hasUpgrade("k", 33)) batch = batch.times(upgradeEffect("k", 33))
    if (hasMilestone("k", 5)) batch = batch.times(3)
    batch = softcap(batch, new Decimal("1e6"), new Decimal(0.5))
    return batch
}

addLayer("o", {
    name: "Respiration",
    symbol: "💨",
    position: 2,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
        }
    },
    color: "#4682B4",
    resource: "ATP",
    row: 1,

    baseResource: "yeast",
    baseAmount() { return player.y.points },
    requires: new Decimal(500),
    type: "normal",
    exponent: 1 / 3,

    softcap() {
        let cap = new Decimal("1e10")
        if (hasUpgrade("o", 23)) cap = new Decimal("1e12")
        if (hasUpgrade("s", 21)) cap = cap.times(100)
        return cap
    },
    softcapPower() { return new Decimal(0.4) },

    effect() {
        return player[this.layer].points.add(1).pow(0.25)
    },
    effectDescription() {
        return "Oxygenated yeast bud faster: yeast gain ×" + format(tmp[this.layer].effect)
    },

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("o", 11)) m = m.times(2)
        if (hasUpgrade("o", 12)) m = m.times(upgradeEffect("o", 12))
        if (hasUpgrade("o", 21)) m = m.times(3)
        if (hasUpgrade("o", 24)) m = m.times(upgradeEffect("o", 24))
        if (hasUpgrade("o", 25)) m = m.times(upgradeEffect("o", 25))
        if (hasMilestone("o", 1)) m = m.times(2)
        if (hasMilestone("k", 6)) m = m.times(2)
        if (hasMilestone("g", 13)) m = m.times(5)
        if (getBuyableAmount("o", 11).gte(1)) m = m.times(buyableEffect("o", 11))
        if (hasUpgrade("t", 31)) m = m.times(upgradeEffect("t", 31))
        m = m.times(layers.w.strainMult())
        return m
    },
    gainExp() {
        let g = new Decimal(1)
        if (inChallenge("c", 13)) g = g.times(0.6)
        return g
    },

    resetsNothing() { return false },
    autoPrestige() { return hasMilestone("s", 4) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let keep = ["unlocked", "auto"]
        if (hasMilestone("g", 10)) keep.push("upgrades")
        if (hasMilestone("g", 10)) keep.push("milestones")
        layerDataReset(this.layer, keep)
    },

    layerShown() { return player[this.layer].unlocked || hasUpgrade("y", 34) },
    branches: ["y"],
    hotkeys: [
        {
            key: "o",
            description: "O: Respire (gain ATP)",
            onPress() { if (canReset(this.layer)) doReset(this.layer) },
        },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function () { return "You have " + format(player.y.points) + " yeast breathing in the vessel" }],
        ["display-text", function () { return "Fermentation gives 2 ATP per glucose. Respiration gives 36. Guess which one builds empires." }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": {
                content: [["blank", "10px"], "upgrades"],
            },
            "Milestones": {
                content: [["blank", "10px"], "milestones"],
            },
            "Buyables": {
                unlocked() { return hasUpgrade("o", 15) },
                content: [["blank", "10px"], "buyables"],
            },
        },
    },

    tooltip() { return "With oxygen, the colony breathes — and ATP piles up" },
    tooltipLocked() { return "Aerate the mash (Budding upgrade 34) to unlock respiration" },

    upgrades: {
        11: {
            title: "Mitochondria",
            description: "Double ATP gain.",
            cost: new Decimal(1),
        },
        12: {
            title: "Oxidative Phosphorylation",
            description: "ATP gain is boosted by your unspent ATP.",
            cost: new Decimal(3),
            unlocked() { return hasUpgrade(this.layer, 11) },
            effect() {
                let ret = player[this.layer].points.add(1).pow(0.5)
                return softcap(ret, new Decimal("1e6"), new Decimal(0.5))
            },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        13: {
            title: "Complementary Fermentation",
            description: "Brew gain is boosted by your bread.",
            cost: new Decimal(8),
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return player.k.points.add(1).pow(0.3) },
            effectDisplay() { return format(this.effect()) + "× brew gain" },
        },
        14: {
            title: "Efficient Enzymes",
            description: "Aeration Stones are stronger per level.",
            cost: new Decimal(25),
            unlocked() { return hasUpgrade(this.layer, 13) },
            effect() { return Decimal.pow(1.1, getBuyableAmount(this.layer, 11)) },
            effectDisplay() { return format(this.effect()) + "× to Aeration Stones" },
        },
        15: {
            title: "Aeration Stone",
            description: "<b>Unlock the buyable</b> — dissolve oxygen straight into the wort.",
            cost: new Decimal(80),
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        21: {
            title: "Crabtree Escape",
            description: "Triple ATP gain. (Look up the Crabtree effect — yeast are stubborn.)",
            cost: new Decimal(300),
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
        22: {
            title: "Baker's Oxygen",
            description: "Bread gain is boosted by your ATP.",
            cost: new Decimal(1e3),
            unlocked() { return hasUpgrade(this.layer, 21) },
            effect() { return player[this.layer].points.add(1).pow(0.3) },
            effectDisplay() { return format(this.effect()) + "× bread gain" },
        },
        23: {
            title: "Aerobic Conditioning",
            description: "The ATP softcap starts 100× later.",
            cost: new Decimal(4e3),
            unlocked() { return hasUpgrade(this.layer, 22) },
            effect() { return hasUpgrade(this.layer, 23) ? new Decimal("1e12") : new Decimal("1e10") },
            effectDisplay() { return "Softcap: " + format(this.effect()) },
        },
        24: {
            title: "Metabolic Overflow",
            description: "ATP gain is boosted by your yeast.",
            cost: new Decimal(2e4),
            unlocked() { return hasUpgrade(this.layer, 23) },
            effect() { return player.y.points.add(1).pow(0.2) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        25: {
            title: "Krebs Cycle",
            description: "ATP gain is boosted by your ATP, again.",
            cost: new Decimal(1e5),
            unlocked() { return hasUpgrade(this.layer, 24) },
            effect() { return player[this.layer].points.add(1).pow(0.3) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
    },

    milestones: {
        0: {
            requirementDescription: "30 ATP",
            effectDescription: "Double sugar gain.",
            done() { return player[this.layer].best.gte(30) },
        },
        1: {
            requirementDescription: "200 ATP",
            effectDescription: "Double ATP gain.",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].best.gte(200) },
        },
        2: {
            requirementDescription: "1,500 ATP",
            effectDescription: "Automatically bud new yeast.",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(1500) },
        },
        3: {
            requirementDescription: "10,000 ATP",
            effectDescription: "Double brew gain.",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].best.gte(1e4) },
        },
        4: {
            requirementDescription: "80,000 ATP",
            effectDescription: "Double yeast gain.",
            unlocked() { return hasMilestone(this.layer, 3) },
            done() { return player[this.layer].best.gte(8e4) },
        },
    },

    buyables: {
        11: {
            title: "Aeration Stone",
            unlocked() { return hasUpgrade("o", 15) },
            cost(x) { return new Decimal(30).times(Decimal.pow(2.7, x)) },
            effect(x) {
                let eff = Decimal.pow(1.6, x)
                if (hasUpgrade("o", 14)) eff = eff.times(upgradeEffect("o", 14))
                return eff
            },
            display() {
                return "ATP gain ×" + format(tmp[this.layer].buyables[this.id].effect) +
                    "<br>Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ATP"
            },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})
