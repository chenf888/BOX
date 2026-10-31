addLayer("y", {
    name: "Budding",
    symbol: "🫧",
    position: 0,
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
        }
    },
    color: "#DAA520",
    resource: "yeast",
    row: 0,

    baseResource: "sugar",
    baseAmount() { return player.points },
    requires: new Decimal(10),
    type: "normal",
    exponent: 0.5,

    softcap() { return ySoftcap() },
    softcapPower() { return new Decimal(0.5) },

    effect() {
        let ret = player[this.layer].points.add(1).pow(0.3)
        ret = softcap(ret, new Decimal("1e3"), new Decimal(0.4))
        return ret
    },
    effectDescription() {
        return "Your colony eats the mash: sugar gain ×" + format(tmp[this.layer].effect)
    },

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("y", 12)) m = m.times(upgradeEffect("y", 12))
        if (hasUpgrade("y", 32)) m = m.times(upgradeEffect("y", 32))
        if (hasUpgrade("y", 41)) m = m.times(upgradeEffect("y", 41))
        if (hasUpgrade("y", 51)) m = m.times(upgradeEffect("y", 51))
        if (getBuyableAmount("y", 11).gte(1)) m = m.times(buyableEffect("y", 11))
        if (hasUpgrade("b", 31)) m = m.times(2)
        if (getBuyableAmount("b", 22).gte(1)) m = m.times(buyableEffect("b", 22))
        if (hasUpgrade("s", 22)) m = m.times(upgradeEffect("s", 22))
        if (hasUpgrade("s", 23)) m = m.times(3)
        if (hasMilestone("b", 3)) m = m.times(2)
        if (hasMilestone("k", 3)) m = m.times(2)
        if (hasMilestone("o", 4)) m = m.times(2)
        if (hasMilestone("g", 1)) m = m.times(2)
        if (hasMilestone("g", 9)) m = m.times(10)
        m = m.times(layers.o.effect())
        m = m.times(layers.w.strainMult())
        if (hasChallenge("c", 12)) m = m.times(challengeEffect("c", 12))
        if (hasChallenge("c", 22)) m = m.times(challengeEffect("c", 22))
        if (hasAchievement("a", 21)) m = m.times(1.5)
        if (hasAchievement("a", 23)) m = m.times(2)
        if (hasAchievement("a", 24)) m = m.times(3)
        if (hasAchievement("a", 25)) m = m.times(5)
        if (hasAchievement("a", 45)) m = m.times(3)
        if (inChallenge("c", 21)) m = m.times(0.5)
        return m
    },
    gainExp() {
        let g = new Decimal(1)
        if (hasMilestone("y", 9)) g = g.times(1.05)
        if (hasUpgrade("g", 22)) g = g.times(upgradeEffect("g", 22))
        if (inChallenge("c", 23)) g = g.times(0.5)
        return g
    },

    resetsNothing() { return false },
    passiveGeneration() { return (hasMilestone("k", 2) || hasAchievement("a", 22)) ? 1 : 0 },
    autoPrestige() { return hasMilestone("o", 2) || hasAchievement("a", 31) },
    autoUpgrade() { return hasMilestone("b", 5) || hasAchievement("a", 41) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        let keep = ["unlocked", "auto"]
        if (hasMilestone("y", 7) || hasMilestone("s", 0) || hasMilestone("g", 3)) keep.push("upgrades")
        if (hasMilestone("s", 2)) keep.push("milestones")
        layerDataReset(this.layer, keep)
    },

    layerShown() { return true },
    hotkeys: [
        {
            key: "y",
            description: "Y: Bud new yeast",
            onPress() { if (canReset(this.layer)) doReset(this.layer) },
        },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function () { return "You have " + format(player.points) + " sugar in the mash" }],
        ["display-text", function () {
            if (player.y.points.gte(ySoftcap().div(100))) return "Softcap starts at " + format(ySoftcap()) + " yeast"
        }],
        ["display-text", function () {
            if (shiftDown) return "Formula: gain = (sugar / 10)^0.5 × mults^exp — exp " + format(tmp.y.gainExp) + ", mult " + format(tmp.y.gainMult)
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": {
                content: [
                    ["blank", "10px"],
                    ["raw-html", function () { return "<div style='opacity:.55'>A single cell becomes a nation. Click an upgrade to buy it with yeast.</div>" }],
                    ["blank", "10px"],
                    "upgrades",
                ],
            },
            "Milestones": {
                content: [
                    ["blank", "10px"],
                    "milestones",
                ],
            },
            "Buyables": {
                unlocked() { return hasMilestone("y", 1) },
                content: [
                    ["blank", "10px"],
                    ["display-text", function () { return "Bigger vessels, bigger colonies." }],
                    ["blank", "10px"],
                    "buyables",
                ],
            },
        },
    },

    tooltip() { return "Bud more yeast from the sugar in your mash" },
    tooltipLocked() { return "Gather " + format(this.requires) + " sugar and the first cell will bud" },

    upgrades: {
        11: {
            title: "Pure Culture",
            description: "Double sugar gain. Every empire starts from one cell.",
            cost: new Decimal(0),
        },
        12: {
            title: "Budding Momentum",
            description: "Yeast gain is boosted by your unspent yeast.",
            cost: new Decimal(1),
            unlocked() { return hasUpgrade(this.layer, 11) },
            effect() {
                let cap = hasMilestone("g", 14) ? new Decimal("1e10") : new Decimal("1e6")
                let ret = player[this.layer].points.add(1).pow(0.5)
                ret = softcap(ret, cap, new Decimal(0.5))
                if (hasUpgrade("t", 12)) ret = ret.pow(upgradeEffect("t", 12))
                return ret
            },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        13: {
            title: "Vessel Pressure",
            description: "Sugar gain is boosted by your Budding Vats level.",
            cost: new Decimal(3),
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return Decimal.pow(getBuyableAmount(this.layer, 11).add(1), 0.5) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        14: {
            title: "Logarithmic Appetite",
            description: "Sugar gain is boosted by the log of your yeast.",
            cost: new Decimal(8),
            unlocked() { return hasUpgrade(this.layer, 13) },
            effect() {
                let ret = player[this.layer].points.add(10).log(10).pow(2)
                if (hasUpgrade("y", 24)) ret = ret.times(upgradeEffect("y", 24))
                return ret
            },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        15: {
            title: "Brewer's Yeast",
            description: "Brewing gain is boosted by your yeast.",
            cost: new Decimal(20),
            unlocked() { return hasUpgrade(this.layer, 14) },
            effect() { return player[this.layer].points.add(1).pow(0.4) },
            effectDisplay() { return format(this.effect()) + "× brew gain" },
        },
        21: {
            title: "Malt Extract",
            description: "Triple sugar gain.",
            cost: new Decimal(100),
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
        22: {
            title: "Selective Pressure",
            description: "The yeast softcap starts 100× later.",
            cost: new Decimal(400),
            unlocked() { return hasUpgrade(this.layer, 21) },
            effect() {
                let cap = new Decimal("1e12")
                if (hasUpgrade(this.layer, 22)) cap = new Decimal("1e14")
                if (hasUpgrade(this.layer, 42)) cap = new Decimal("1e16")
                if (hasUpgrade(this.layer, 55)) cap = new Decimal("1e18")
                return cap
            },
            effectDisplay() { return "Softcap: " + format(this.effect()) },
        },
        23: {
            title: "Exponential Appetite",
            description: "Sugar gain is boosted by your sugar (softcapped).",
            cost: new Decimal(1500),
            unlocked() { return hasUpgrade(this.layer, 22) },
            effect() {
                let ret = player.points.add(1).pow(0.35)
                ret = softcap(ret, new Decimal("1e5"), new Decimal(0.5))
                if (hasUpgrade("k", 35)) ret = ret.times(upgradeEffect("k", 35))
                return ret
            },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        24: {
            title: "Fermentation Fumes",
            description: "Logarithmic Appetite is fueled by your brew.",
            cost: new Decimal(6e3),
            unlocked() { return hasUpgrade(this.layer, 23) },
            effect() { return player.b.points.add(1).pow(0.15) },
            effectDisplay() { return format(this.effect()) + "× to upgrade 14" },
        },
        25: {
            title: "Pitch a Proper Starter",
            description: "<b>Unlock Brewing</b> — the first human symbiosis.",
            cost: new Decimal(2e4),
            unlocked() { return hasUpgrade(this.layer, 24) },
            onPurchase() { player.b.unlocked = true },
        },
        31: {
            title: "Adjuncts",
            description: "Quintuple sugar gain.",
            cost: new Decimal(1e5),
            unlocked() { return hasUpgrade(this.layer, 25) },
        },
        32: {
            title: "Baker's Yeast",
            description: "Yeast gain is boosted by your bread.",
            cost: new Decimal(4e5),
            unlocked() { return hasUpgrade(this.layer, 31) },
            effect() { return player.k.points.add(1).pow(0.4) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        33: {
            title: "Vessel Tinkering",
            description: "Budding Vats are 10% stronger per level.",
            cost: new Decimal(2e6),
            unlocked() { return hasUpgrade(this.layer, 32) },
            effect() { return Decimal.pow(1.1, getBuyableAmount(this.layer, 11)) },
            effectDisplay() { return format(this.effect()) + "× to Budding Vats" },
        },
        34: {
            title: "Aerate the Mash",
            description: "<b>Unlock Respiration</b> — with oxygen, yeast make 16× the ATP.",
            cost: new Decimal(1e7),
            unlocked() { return hasUpgrade(this.layer, 33) },
            onPurchase() { player.o.unlocked = true },
        },
        35: {
            title: "Flour and Water",
            description: "<b>Unlock Baking</b> — the oldest symbiosis of all.",
            cost: new Decimal(5e7),
            unlocked() { return hasUpgrade(this.layer, 34) },
            onPurchase() { player.k.unlocked = true },
        },
        41: {
            title: "Colony Efficiency",
            description: "Yeast gain is boosted by your yeast, again.",
            cost: new Decimal(2e8),
            unlocked() { return hasUpgrade(this.layer, 35) },
            effect() {
                let ret = player[this.layer].points.add(1).pow(0.25)
                ret = softcap(ret, new Decimal("1e8"), new Decimal(0.5))
                if (hasUpgrade("y", 54)) ret = ret.times(upgradeEffect("y", 54))
                return ret
            },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        42: {
            title: "Thermal Tolerance",
            description: "The yeast softcap starts 100× later again.",
            cost: new Decimal(1e9),
            unlocked() { return hasUpgrade(this.layer, 41) },
            effect() { return hasUpgrade(this.layer, 42) ? new Decimal("1e16") : new Decimal("1e14") },
            effectDisplay() { return "Softcap: " + format(this.effect()) },
        },
        43: {
            title: "Kveik Blood",
            description: "Sugar gain scales with the strains you have discovered.",
            cost: new Decimal(5e9),
            unlocked() { return hasUpgrade(this.layer, 42) },
            effect() {
                let n = player.w.strains.length
                return new Decimal(n >= 6 ? 8 : (n >= 3 ? 3 : 1))
            },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        44: {
            title: "Industry Grade",
            description: "Ten-fold sugar gain.",
            cost: new Decimal(2e10),
            unlocked() { return hasUpgrade(this.layer, 43) },
        },
        45: {
            title: "Enter a Competition",
            description: "<b>Unlock the Trials</b> — brew for glory, not just for drinking.",
            cost: new Decimal(1e11),
            unlocked() { return hasUpgrade(this.layer, 44) },
            onPurchase() { player.c.unlocked = true },
        },
        51: {
            title: "Self-Scaling Culture",
            description: "Yeast gain is boosted by your yeast, compounding (softcapped).",
            cost: new Decimal(5e11),
            unlocked() { return hasUpgrade(this.layer, 45) },
            effect() {
                let ret = player[this.layer].points.add(1).pow(0.5)
                if (ret.gte(1e4)) ret = ret.pow(0.5).times(100)
                if (hasUpgrade("g", 12)) ret = ret.times(upgradeEffect("g", 12))
                return ret
            },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        52: {
            title: "Bioreactor Banks",
            description: "25-fold sugar gain.",
            cost: new Decimal(2e12),
            unlocked() { return hasUpgrade(this.layer, 51) },
        },
        53: {
            title: "Pantry Symbiosis",
            description: "Sugar gain is boosted by your Tavern coins.",
            cost: new Decimal(1e13),
            unlocked() { return hasUpgrade(this.layer, 52) },
            effect() { return player.t.points.add(1).pow(0.3) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        54: {
            title: "Chromosomal Whisper",
            description: "Colony Efficiency gains power from Sequencer levels.",
            cost: new Decimal(5e13),
            unlocked() { return hasUpgrade(this.layer, 53) },
            effect() { return Decimal.pow(1.02, getBuyableAmount("g", 11)) },
            effectDisplay() { return format(this.effect()) + "× to upgrade 41" },
        },
        55: {
            title: "Quorum Sensing",
            description: "The yeast softcap starts 100× later, one last time.",
            cost: new Decimal(2e14),
            unlocked() { return hasUpgrade(this.layer, 54) },
            effect() { return hasUpgrade(this.layer, 55) ? new Decimal("1e18") : new Decimal("1e16") },
            effectDisplay() { return "Softcap: " + format(this.effect()) },
        },
    },

    milestones: {
        0: {
            requirementDescription: "6,000 sugar",
            effectDescription() {
                let d = "Yeast gain ×2.5."
                if (hasMilestone("g", 14)) d += "<br><b>Overpowered:</b> Budding Momentum's softcap starts at 1e10 instead."
                return d
            },
            done() { return player.points.gte(6000) },
        },
        1: {
            requirementDescription: "15 yeast",
            effectDescription: "Unlock the first buyable.",
            done() { return player[this.layer].best.gte(15) },
        },
        2: {
            requirementDescription: "40 yeast",
            effectDescription: "Double sugar gain.",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(40) },
        },
        3: {
            requirementDescription: "100 yeast",
            effectDescription: "Double yeast gain.",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].best.gte(100) },
        },
        4: {
            requirementDescription: "250 yeast",
            effectDescription: "Unlock the second buyable.",
            unlocked() { return hasMilestone(this.layer, 3) },
            done() { return player[this.layer].best.gte(250) },
        },
        5: {
            requirementDescription: "600 yeast",
            effectDescription: "Triple sugar gain.",
            unlocked() { return hasMilestone(this.layer, 4) },
            done() { return player[this.layer].best.gte(600) },
        },
        6: {
            requirementDescription: "1,500 yeast",
            effectDescription: "Double brew gain.",
            unlocked() { return hasMilestone(this.layer, 5) },
            done() { return player[this.layer].best.gte(1500) },
        },
        7: {
            requirementDescription: "5,000 yeast",
            effectDescription: "Your upgrades survive resets of this layer.",
            unlocked() { return hasMilestone(this.layer, 6) },
            done() { return player[this.layer].best.gte(5000) },
        },
        8: {
            requirementDescription: "20,000 yeast",
            effectDescription: "Quintuple sugar gain.",
            unlocked() { return hasMilestone(this.layer, 7) },
            done() { return player[this.layer].best.gte(2e4) },
        },
        9: {
            requirementDescription: "100,000 yeast",
            effectDescription: "Yeast gain exponent ×1.05.",
            unlocked() { return hasMilestone(this.layer, 8) },
            done() { return player[this.layer].best.gte(1e5) },
        },
    },

    buyables: {
        11: {
            title: "Budding Vats",
            cost(x) {
                let base = new Decimal(2.8)
                if (hasUpgrade("t", 13)) base = new Decimal(2.5)
                return new Decimal(10).times(Decimal.pow(base, x))
            },
            effect(x) {
                let eff = Decimal.pow(1.6, x)
                if (hasUpgrade("y", 33)) eff = eff.times(upgradeEffect("y", 33))
                return eff
            },
            display() {
                return "Yeast gain ×" + format(tmp[this.layer].buyables[this.id].effect) +
                    "<br>Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " yeast"
            },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            title: "Fermentation Chamber",
            unlocked() { return hasMilestone("y", 4) },
            cost(x) { return new Decimal(1000).times(Decimal.pow(3.2, x)) },
            effect(x) { return Decimal.pow(2, x) },
            display() {
                return "Sugar gain ×" + format(tmp[this.layer].buyables[this.id].effect) +
                    "<br>Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " yeast"
            },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})
