const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"]
const CHROM_REQS = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1000, 2500, 6000, 15000, 40000, 100000]

addLayer("g", {
    name: "Genome",
    symbol: "🧬",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
        }
    },
    color: "#2ECC71",
    resource: "genes",
    row: 4,

    baseResource: "yeast",
    baseAmount() { return player.y.points },
    requires: new Decimal("1e9"),
    type: "custom",

    gMult() {
        let m = new Decimal(1)
        if (hasUpgrade("g", 11)) m = m.times(2)
        if (hasUpgrade("g", 21)) m = m.times(3)
        if (hasUpgrade("g", 13)) m = m.times(upgradeEffect("g", 13))
        if (hasUpgrade("g", 23)) m = m.times(upgradeEffect("g", 23))
        if (hasUpgrade("g", 14)) m = m.times(upgradeEffect("g", 14))
        if (hasUpgrade("g", 25)) m = m.times(upgradeEffect("g", 25))
        if (hasUpgrade("g", 15)) m = m.times(upgradeEffect("g", 15))
        if (hasMilestone("g", 5)) m = m.times(2)
        if (hasMilestone("g", 12)) m = m.times(5)
        if (getBuyableAmount("g", 11).gte(1)) m = m.times(buyableEffect("g", 11))
        if (hasAchievement("a", 52)) m = m.times(2)
        if (hasAchievement("a", 54)) m = m.times(3)
        return m
    },

    getResetGain() {
        if (player.y.points.lt(this.requires)) return new Decimal(0)
        let raw = player.y.points.add(1).log(10).pow(2).div(10)
        let t1 = new Decimal("1e4")
        if (hasUpgrade("s", 24)) t1 = t1.times(10)
        if (raw.gte(t1)) raw = raw.sqrt().times(t1.sqrt())
        return raw.times(this.gMult())
    },
    getNextAt() { return new Decimal("1e9") },
    canReset() { return player.y.points.gte(new Decimal("1e9")) },
    prestigeButtonText() {
        if (player.y.points.lt(new Decimal("1e9"))) return "Need " + format(new Decimal("1e9")) + " yeast to sequence"
        return "Sequence! (+" + format(this.getResetGain()) + " genes)"
    },
    resetDescription: "Sequence for ",

    gainMult() { return new Decimal(1) },
    gainExp() { return new Decimal(1) },

    resetsNothing() { return true },
    autoPrestige() { return hasMilestone("g", 8) },

    layerShown() { return hasUpgrade("s", 25) },
    branches: ["s", "w"],
    hotkeys: [
        {
            key: "g",
            description: "G: Sequence the genome",
            onPress() { if (canReset(this.layer)) doReset(this.layer) },
        },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function () { return "You have " + format(player.y.points) + " yeast to grind into sequence data" }],
        ["display-text", function () { return "S. cerevisiae carries <b>16 chromosomes</b>. Sequence them all, then write your own." }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": {
                content: [["blank", "10px"], "upgrades"],
            },
            "Chromosomes": {
                content: [["blank", "10px"], "milestones"],
            },
            "Buyables": {
                content: [["blank", "10px"], "buyables"],
            },
        },
    },

    tooltip() { return "Sequence all 16 chromosomes — then rewrite them" },
    tooltipLocked() { return "The Seed Bank (Sporulation upgrade 25) opens the Genome Project" },

    upgrades: {
        11: {
            title: "Better Primers",
            description: "Double gene gain.",
            cost: new Decimal(1),
        },
        12: {
            title: "Chromosome Editing",
            description: "Self-Scaling Culture (Budding 51) gains power from Sequencer levels.",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade(this.layer, 11) },
            effect() { return Decimal.pow(1.02, getBuyableAmount("g", 11)) },
            effectDisplay() { return format(this.effect()) + "× to Budding 51" },
        },
        13: {
            title: "Wild Type Library",
            description: "Gene gain scales with your discovered strains.",
            cost: new Decimal(4),
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return player.w.strains.length >= 1 ? Decimal.pow(player.w.strains.length, 0.6).add(1) : new Decimal(1) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        14: {
            title: "Reference Genome",
            description: "Gene gain is boosted by the log of your genes.",
            cost: new Decimal(8),
            unlocked() { return hasUpgrade(this.layer, 13) },
            effect() { return player[this.layer].points.add(10).log(10) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        15: {
            title: "Annotation Pipeline",
            description: "Gene gain scales with your completed chromosomes.",
            cost: new Decimal(16),
            unlocked() { return hasUpgrade(this.layer, 14) },
            effect() { return new Decimal(1).add(player.g.milestones.length * 0.1) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        21: {
            title: "Robotics Bay",
            description: "Triple gene gain.",
            cost: new Decimal(32),
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
        22: {
            title: "Promoter Tuning",
            description: "Yeast gain exponent grows with your chromosomes.",
            cost: new Decimal(64),
            unlocked() { return hasUpgrade(this.layer, 21) },
            effect() { return new Decimal(1.05).add(player.g.milestones.length * 0.005) },
            effectDisplay() { return "Yeast exp ×" + format(this.effect()) },
        },
        23: {
            title: "Spore Archive",
            description: "Gene gain is boosted by your spores.",
            cost: new Decimal(128),
            unlocked() { return hasUpgrade(this.layer, 22) },
            effect() { return player.s.points.add(1).pow(0.3) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        24: {
            title: "Publication",
            description: "Sugar gain is boosted by your genes.",
            cost: new Decimal(256),
            unlocked() { return hasUpgrade(this.layer, 23) },
            effect() { return player[this.layer].points.add(1).pow(0.3) },
            effectDisplay() { return format(this.effect()) + "× sugar" },
        },
        25: {
            title: "De Novo Design",
            description: "Gene gain is boosted by the log of your yeast.",
            cost: new Decimal(512),
            unlocked() { return hasUpgrade(this.layer, 24) },
            effect() { return player.y.points.add(10).log(10).pow(1.5) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
    },

    milestones: {
        0: {
            requirementDescription: "Chromosome I — 1 gene",
            effectDescription: "Double sugar gain.",
            done() { return player[this.layer].best.gte(CHROM_REQS[0]) },
        },
        1: {
            requirementDescription: "Chromosome II — 2 genes",
            effectDescription: "Double yeast gain.",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].best.gte(CHROM_REQS[1]) },
        },
        2: {
            requirementDescription: "Chromosome III — 4 genes",
            effectDescription: "Double brew gain.",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(CHROM_REQS[2]) },
        },
        3: {
            requirementDescription: "Chromosome IV — 8 genes",
            effectDescription: "Keep Budding upgrades through Genome resets.",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].best.gte(CHROM_REQS[3]) },
        },
        4: {
            requirementDescription: "Chromosome V — 16 genes",
            effectDescription: "Double bread gain.",
            unlocked() { return hasMilestone(this.layer, 3) },
            done() { return player[this.layer].best.gte(CHROM_REQS[4]) },
        },
        5: {
            requirementDescription: "Chromosome VI — 32 genes",
            effectDescription: "Double gene gain.",
            unlocked() { return hasMilestone(this.layer, 4) },
            done() { return player[this.layer].best.gte(CHROM_REQS[5]) },
        },
        6: {
            requirementDescription: "Chromosome VII — 64 genes",
            effectDescription: "Keep Brewing upgrades and milestones through Genome resets.",
            unlocked() { return hasMilestone(this.layer, 5) },
            done() { return player[this.layer].best.gte(CHROM_REQS[6]) },
        },
        7: {
            requirementDescription: "Chromosome VIII — 128 genes",
            effectDescription: "Quintuple sugar gain.",
            unlocked() { return hasMilestone(this.layer, 6) },
            done() { return player[this.layer].best.gte(CHROM_REQS[7]) },
        },
        8: {
            requirementDescription: "Chromosome IX — 256 genes",
            effectDescription: "The sequencer runs itself (auto-sequence).",
            unlocked() { return hasMilestone(this.layer, 7) },
            done() { return player[this.layer].best.gte(CHROM_REQS[8]) },
        },
        9: {
            requirementDescription: "Chromosome X — 512 genes",
            effectDescription: "Ten-fold yeast gain.",
            unlocked() { return hasMilestone(this.layer, 8) },
            done() { return player[this.layer].best.gte(CHROM_REQS[9]) },
        },
        10: {
            requirementDescription: "Chromosome XI — 1,000 genes",
            effectDescription: "Keep Baking and Respiration upgrades and milestones through Genome resets.",
            unlocked() { return hasMilestone(this.layer, 9) },
            done() { return player[this.layer].best.gte(CHROM_REQS[10]) },
        },
        11: {
            requirementDescription: "Chromosome XII — 2,500 genes",
            effectDescription: "Quintuple brew gain.",
            unlocked() { return hasMilestone(this.layer, 10) },
            done() { return player[this.layer].best.gte(CHROM_REQS[11]) },
        },
        12: {
            requirementDescription: "Chromosome XIII — 6,000 genes",
            effectDescription: "Quintuple gene gain.",
            unlocked() { return hasMilestone(this.layer, 11) },
            done() { return player[this.layer].best.gte(CHROM_REQS[12]) },
        },
        13: {
            requirementDescription: "Chromosome XIV — 15,000 genes",
            effectDescription: "Hundred-fold sugar gain. ATP, bread and coins ×5.",
            unlocked() { return hasMilestone(this.layer, 12) },
            done() { return player[this.layer].best.gte(CHROM_REQS[13]) },
        },
        14: {
            requirementDescription: "Chromosome XV — 40,000 genes",
            effectDescription: "Triple gene gain.",
            unlocked() { return hasMilestone(this.layer, 13) },
            done() { return player[this.layer].best.gte(CHROM_REQS[14]) },
        },
        15: {
            requirementDescription: "Chromosome XVI — 100,000 genes",
            effectDescription: "<b>The genome is complete. Write your own.</b>",
            unlocked() { return hasMilestone(this.layer, 14) },
            done() { return player[this.layer].best.gte(CHROM_REQS[15]) },
        },
    },

    buyables: {
        11: {
            title: "Sequencer",
            cost(x) { return new Decimal(10).times(Decimal.pow(4, x)) },
            effect(x) { return Decimal.pow(1.5, x) },
            display() {
                return "Gene gain ×" + format(tmp[this.layer].buyables[this.id].effect) +
                    "<br>Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " genes"
            },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})
