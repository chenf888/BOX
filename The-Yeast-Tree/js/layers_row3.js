addLayer("w", {
    name: "Wild Ecology",
    symbol: "🍂",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            strains: [],
            expeditions: new Decimal(0),
            flavorWins: new Decimal(0),
            sporeBank: new Decimal(0),
            fermenting: false,
            fermentProgress: new Decimal(0),
            fermentRoll: 0,
        }
    },
    color: "#6B8E23",
    resource: "forages",
    row: 3,

    baseResource: "yeast",
    baseAmount() { return player.y.points },
    requires: new Decimal("1e6"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    canBuyMax() { return hasUpgrade("w", 22) },

    gainMult() {
        let m = new Decimal(1)
        if (player.w.strains.length >= 6) m = m.times(0.85)
        return m
    },
    gainExp() { return new Decimal(1) },

    strainMult() {
        return Decimal.pow(1.4, player.w.strains.length)
    },

    update(diff) {
        if (!player.w.unlocked) return
        if (player.w.fermenting) {
            let speed = new Decimal(0.1).times(expeditionSpeed())
            player.w.fermentProgress = player.w.fermentProgress.add(speed.times(diff))
            if (player.w.fermentProgress.gte(1)) resolveExpedition()
        }
        if (hasUpgrade("w", 23) && player.s.unlocked) {
            player.w.sporeBank = player.w.sporeBank.add(new Decimal(player.w.strains.length * 0.05).times(diff))
            if (player.w.sporeBank.gte(1)) {
                let whole = player.w.sporeBank.floor()
                player.w.sporeBank = player.w.sporeBank.sub(whole)
                player.s.points = player.s.points.add(whole)
            }
        }
    },

    resetsNothing() { return hasMilestone("s", 3) },
    autoPrestige() { return hasMilestone("s", 3) && !player.c.activeChallenge },
    autoUpgrade() { return hasMilestone("s", 3) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        layerDataReset(this.layer, ["unlocked", "auto", "points", "upgrades", "strains"])
    },

    layerShown() { return player[this.layer].unlocked || hasUpgrade("s", 14) },
    branches: ["s"],
    hotkeys: [
        {
            key: "w",
            description: "W: Forage for wild yeast",
            onPress() { if (canReset(this.layer)) doReset(this.layer) },
        },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function () { return "You have " + format(player.y.points) + " yeast roaming the wild" }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Expeditions": {
                content: [
                    ["blank", "10px"],
                    ["raw-html", function () { return "<div style='opacity:.55'>Wild ferment is a gamble: most batches turn out fine, some are duds — and some <b>spoil the barrel</b> (you lose half your brew). Discoveries are forever.</div>" }],
                    ["blank", "10px"],
                    ["bar", "wFerment"],
                    ["blank", "10px"],
                    ["clickables", [11]],
                    ["blank", "5px"],
                    ["display-text", function () { return "Expeditions: " + formatWhole(player.w.expeditions) + " · flavor wins: " + formatWhole(player.w.flavorWins) }],
                ],
            },
            "Strain Album": {
                content: [
                    ["blank", "10px"],
                    ["display-text", function () { return "Discovered: <b>" + player.w.strains.length + " / 12</b> — each strain multiplies yeast, brew, bread, ATP, coins and medal gain by 1.4×." }],
                    ["blank", "10px"],
                    ["raw-html", function () { return strainAlbumHTML() }],
                ],
            },
            "Upgrades": {
                content: [["blank", "10px"], "upgrades"],
            },
            "Milestones": {
                content: [["blank", "10px"], "milestones"],
            },
        },
    },

    bars: {
        wFerment: {
            direction: RIGHT,
            width: 360,
            height: 40,
            progress() { return player.w.fermentProgress.min(1).toNumber() },
            display() {
                if (!player.w.fermenting) return "The jar is empty — pitch a wild starter"
                return "Wild ferment bubbling… " + format(player.w.fermentProgress.times(100).min(100)) + "%"
            },
            fillStyle: { 'background-color': "#6B8E23" },
            baseStyle: { 'background-color': "#4a5230" },
            textStyle: { 'color': "#e8f0d8" },
            unlocked() { return player.w.unlocked },
        },
    },

    clickables: {
        11: {
            title: "Pitch wild starter",
            display() {
                if (player.w.fermenting) return "Fermenting…"
                return "Cost: " + format(wExpCost()) + " yeast"
            },
            canClick() { return player.w.unlocked && !player.w.fermenting && player.y.points.gte(wExpCost()) },
            onClick() {
                player.y.points = player.y.points.sub(wExpCost())
                player.w.expeditions = player.w.expeditions.add(1)
                player.w.fermenting = true
                player.w.fermentProgress = new Decimal(0)
                player.w.fermentRoll = Math.random()
            },
            style() { return player.w.fermenting ? { 'background-color': "#4a5230" } : { 'background-color': "#6B8E23", 'color': "#eef4e2" } },
        },
    },

    tooltip() { return "Forage oak bark and wasp guts for wild strains" },
    tooltipLocked() { return "Wind dispersal (Sporulation upgrade 14) unlocks wild ecology" },

    upgrades: {
        11: {
            title: "Foraging Gear",
            description: "Double yeast gain.",
            cost: new Decimal(1),
        },
        12: {
            title: "Oak Bark Cultures",
            description: "Yeast gain scales with your discovered strains.",
            cost: new Decimal(1),
            unlocked() { return hasUpgrade(this.layer, 11) },
            effect() { return Decimal.pow(player.w.strains.length + 1, 0.5) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        13: {
            title: "Wasp Gut Rescue",
            description: "Expeditions spoil 5% less often (15% → 10%).",
            cost: new Decimal(1),
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return hasUpgrade(this.layer, 13) ? new Decimal(0.1) : new Decimal(0.15) },
            effectDisplay() { return "Spoil chance: " + format(this.effect().times(100)) + "%" },
        },
        14: {
            title: "Patient Silage",
            description: "Expeditions resolve twice as fast.",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade(this.layer, 13) },
            effect() { return hasUpgrade(this.layer, 14) ? new Decimal(2) : new Decimal(1) },
            effectDisplay() { return format(this.effect()) + "× speed" },
        },
        15: {
            title: "Territory Maps",
            description: "Yeast gain scales with your discovered strains, harder.",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade(this.layer, 14) },
            effect() { return Decimal.pow(player.w.strains.length + 1, 0.4) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        21: {
            title: "Stone Mill",
            description: "Triple sugar gain.",
            cost: new Decimal(3),
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
        22: {
            title: "Pantry Ecology",
            description: "Bread gain scales with your discovered strains. Also: you can buy max forages.",
            cost: new Decimal(4),
            unlocked() { return hasUpgrade(this.layer, 21) },
            effect() { return Decimal.pow(player.w.strains.length + 1, 0.4) },
            effectDisplay() { return format(this.effect()) + "× bread" },
        },
        23: {
            title: "Spore Rain",
            description: "Discovered strains shed 0.05 spores each per second.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade(this.layer, 22) },
            effect() { return new Decimal(player.w.strains.length * 0.05) },
            effectDisplay() { return "+" + format(this.effect()) + " spores/sec" },
        },
        24: {
            title: "Master Forager",
            description: "Expeditions resolve twice as fast once you know 8 strains.",
            cost: new Decimal(6),
            unlocked() { return hasUpgrade(this.layer, 23) },
            effect() { return player.w.strains.length >= 8 ? new Decimal(2) : new Decimal(1) },
            effectDisplay() { return format(this.effect()) + "× speed" },
        },
        25: {
            title: "The Strain Catalogue",
            description: "Yeast gain scales hard with your discovered strains.",
            cost: new Decimal(8),
            unlocked() { return hasUpgrade(this.layer, 24) },
            effect() { return Decimal.pow(player.w.strains.length + 1, 0.6) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
    },

    milestones: {
        0: {
            requirementDescription: "3 forages",
            effectDescription: "Automatically buy Brewing upgrades.",
            done() { return player[this.layer].best.gte(3) },
        },
        1: {
            requirementDescription: "6 forages",
            effectDescription: "Double yeast gain.",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].best.gte(6) },
        },
        2: {
            requirementDescription: "10 forages",
            effectDescription: "Double bread gain.",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(10) },
        },
        3: {
            requirementDescription: "15 forages",
            effectDescription: "Expeditions never spoil again.",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].best.gte(15) },
        },
    },
})

function wExpCost() {
    return new Decimal(1000).times(Decimal.pow(4, player.w.expeditions))
}
function expeditionSpeed() {
    let m = new Decimal(1)
    if (hasUpgrade("w", 14)) m = m.times(upgradeEffect("w", 14))
    if (hasUpgrade("w", 24)) m = m.times(upgradeEffect("w", 24))
    return m
}
function spoilChance() {
    if (hasMilestone("w", 3)) return 0
    return hasUpgrade("w", 13) ? 0.10 : 0.15
}
function resolveExpedition() {
    player.w.fermenting = false
    player.w.fermentProgress = new Decimal(0)
    if (Math.random() < spoilChance()) {
        player.b.points = player.b.points.div(2)
        return
    }
    if (player.w.strains.length < 12 && Math.random() < 0.75) {
        player.w.strains.push(player.w.strains.length + 1)
        return
    }
    player.w.flavorWins = player.w.flavorWins.add(1)
    let burst = new Decimal(500).times(Decimal.pow(player.y.points.add(1), 0.1))
    burst = softcap(burst, new Decimal("1e9"), new Decimal(0.5))
    player.points = player.points.add(burst)
}

const STRAIN_NAMES = [
    "US-05 — The Clean Workhorse",
    "S-04 — The Fast Englishman",
    "Kveik Voss — The Heat Lover",
    "Belle Saison — The Spicy Farmhand",
    "Brettanomyces — The Wild Horse",
    "S. uvarum — The Cold Whisper",
    "S. eubayanus — The Lost Parent",
    "S. paradoxus — The Oak Dweller",
    "S. arboricola — The Tree Hugger",
    "Torulaspora delbrueckii — The Ester Weaver",
    "Lachancea thermotolerans — The Sour Mage",
    "Wickerhamomyces anomalus — The Bioprotectant",
]
function strainAlbumHTML() {
    let html = ""
    for (let i = 0; i < 12; i++) {
        const found = player.w.strains.length > i
        html += "<div style='margin:4px 0;padding:6px 10px;border:1px solid #6B8E23;border-radius:6px;" +
            (found ? "background:rgba(107,142,35,.15)'" : "opacity:.45;border-style:dashed'") + ">" +
            (found ? "✔ <b>" + STRAIN_NAMES[i] + "</b>" : "？？？ unknown strain #" + (i + 1)) + "</div>"
    }
    return html
}

addLayer("s", {
    name: "Sporulation",
    symbol: "✳",
    position: 1,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
        }
    },
    color: "#E8E4D8",
    resource: "spores",
    row: 3,

    baseResource: "yeast",
    baseAmount() { return player.y.points },
    requires: new Decimal("1e7"),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,
    canBuyMax() { return hasUpgrade("s", 22) },

    gainMult() {
        let m = new Decimal(1)
        if (player.w.strains.length >= 10) m = m.times(0.9)
        return m
    },
    gainExp() { return new Decimal(1) },

    resetsNothing() { return hasMilestone("s", 4) },
    autoPrestige() { return false },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        layerDataReset(this.layer, ["unlocked", "auto", "points", "upgrades", "milestones"])
    },

    layerShown() { return player[this.layer].unlocked || hasUpgrade("c", 15) },
    branches: ["y"],
    hotkeys: [
        {
            key: "s",
            description: "S: Sporulate",
            onPress() { if (canReset(this.layer)) doReset(this.layer) },
        },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function () { return "You have " + format(player.y.points) + " yeast under stress" }],
        ["display-text", function () { return "When food runs out, yeast copy their DNA, wrap it in armor, and wait. Spores survive boiling, drying, and — more importantly — <b>resets</b>." }],
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
        },
    },

    tooltip() { return "Wrap the lineage in armor — spores survive resets" },
    tooltipLocked() { return "Stress the cultures (Trials upgrade 15) to unlock sporulation" },

    upgrades: {
        11: {
            title: "Trehalose",
            description: "Double sugar gain. The sugar-of-sugars protects the cell.",
            cost: new Decimal(1),
        },
        12: {
            title: "Anhydrobiosis",
            description: "The yeast softcap starts 1000× later.",
            cost: new Decimal(1),
            unlocked() { return hasUpgrade(this.layer, 11) },
            effect() { return hasUpgrade(this.layer, 12) ? new Decimal(1000) : new Decimal(1) },
            effectDisplay() { return "Softcap ×" + format(this.effect()) },
        },
        13: {
            title: "Spore Wall",
            description: "The brew softcap starts 100× later.",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return hasUpgrade(this.layer, 13) ? new Decimal(100) : new Decimal(1) },
            effectDisplay() { return "Softcap ×" + format(this.effect()) },
        },
        14: {
            title: "Wind Dispersal",
            description: "Ride the breeze — <b>unlock Wild Ecology</b>.",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade(this.layer, 13) },
            onPurchase() { player.w.unlocked = true },
        },
        15: {
            title: "Fungal Vigor",
            description: "Sugar gain scales with discovered strains (capped at 3×).",
            cost: new Decimal(3),
            unlocked() { return hasUpgrade(this.layer, 14) },
            effect() { return new Decimal(1).add(player.w.strains.length * 0.25) },
            effectDisplay() { return format(this.effect().min(3)) + "× sugar" },
        },
        21: {
            title: "Deep Dormancy",
            description: "The ATP softcap starts 100× later.",
            cost: new Decimal(4),
            unlocked() { return hasUpgrade(this.layer, 15) },
            effect() { return hasUpgrade(this.layer, 21) ? new Decimal(100) : new Decimal(1) },
            effectDisplay() { return "Softcap ×" + format(this.effect()) },
        },
        22: {
            title: "Fungal Network",
            description: "Yeast gain is boosted by your spores. Also: you can buy max spores.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade(this.layer, 21) },
            effect() { return player[this.layer].points.add(1).pow(0.4) },
            effectDisplay() { return format(this.effect()) + "× yeast" },
        },
        23: {
            title: "Pioneer Species",
            description: "Triple yeast gain.",
            cost: new Decimal(6),
            unlocked() { return hasUpgrade(this.layer, 22) },
        },
        24: {
            title: "Genomic Redundancy",
            description: "Genome re-root thresholds start 10× later.",
            cost: new Decimal(7),
            unlocked() { return hasUpgrade(this.layer, 23) },
            effect() { return hasUpgrade(this.layer, 24) ? new Decimal(10) : new Decimal(1) },
            effectDisplay() { return "Threshold ×" + format(this.effect()) },
        },
        25: {
            title: "The Seed Bank",
            description: "Every chromosome, archived — <b>unlock the Genome Project</b>.",
            cost: new Decimal(8),
            unlocked() { return hasUpgrade(this.layer, 24) },
            onPurchase() { player.g.unlocked = true },
        },
    },

    milestones: {
        0: {
            requirementDescription: "4 spores",
            effectDescription: "Keep Budding upgrades through resets. Double sugar gain.",
            done() { return player[this.layer].best.gte(4) },
        },
        1: {
            requirementDescription: "8 spores",
            effectDescription: "Keep Brewing and Baking upgrades and milestones through resets.",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].best.gte(8) },
        },
        2: {
            requirementDescription: "12 spores",
            effectDescription: "Keep Budding milestones through resets.",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(12) },
        },
        3: {
            requirementDescription: "18 spores",
            effectDescription: "<b>Package deal:</b> Trials, Distillery, Tavern and Wild Ecology gain auto-prestige, auto-upgrades, and stop resetting lower layers.",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].best.gte(18) },
        },
        4: {
            requirementDescription: "25 spores",
            effectDescription: "Automatically respire (ATP). Sporulating no longer resets anything.",
            unlocked() { return hasMilestone(this.layer, 3) },
            done() { return player[this.layer].best.gte(25) },
        },
    },
})
