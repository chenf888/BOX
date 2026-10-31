addLayer("c", {
    name: "Trials",
    symbol: "🏅",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            maxpoints: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
        }
    },
    color: "#CD7F32",
    resource: "medals",
    row: 2,

    baseResource: "brew",
    baseAmount() { return player.b.points },
    requires: new Decimal(5000),
    type: "normal",
    exponent: 1 / 3,

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("c", 14)) m = m.times(upgradeEffect("c", 14))
        if (hasMilestone("c", 4)) m = m.times(2)
        if (hasMilestone("g", 13)) m = m.times(5)
        if (hasAchievement("a", 35)) m = m.times(2)
        if (hasAchievement("a", 42)) m = m.times(3)
        m = m.times(layers.w.strainMult())
        return m
    },
    gainExp() { return new Decimal(1) },

    update(diff) {
        if (!player.c.activeChallenge) return
        const idx = { 11: 0, 12: 1, 13: 2, 21: 3, 22: 4, 23: 5 }[player.c.activeChallenge]
        if (idx === undefined) return
        player.c.maxpoints[idx] = player.c.maxpoints[idx].max(player.b.points)
    },

    resetsNothing() { return hasMilestone("s", 3) },
    autoPrestige() { return hasMilestone("s", 3) && !player.c.activeChallenge },
    autoUpgrade() { return hasMilestone("s", 3) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        layerDataReset(this.layer, ["unlocked", "auto", "maxpoints", "upgrades", "milestones", "challenges"])
    },

    layerShown() { return player[this.layer].unlocked || hasUpgrade("y", 45) },
    branches: ["b"],
    hotkeys: [
        {
            key: "c",
            description: "C: Claim medals",
            onPress() { if (canReset(this.layer)) doReset(this.layer) },
        },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function () { return "You have " + format(player.b.points) + " brew to enter into competition" }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Challenges": {
                content: [
                    ["blank", "10px"],
                    ["raw-html", function () { return "<div style='opacity:.55'>Entering a competition resets sugar, yeast, brew, bread and ATP. Your best brew <b>inside</b> the run is your score — and the score pays.</div>" }],
                    ["blank", "10px"],
                    "challenges",
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

    tooltip() { return "Enter your brew into competitions. Score = best brew in the run." },
    tooltipLocked() { return "Enter a competition (Budding upgrade 45) to unlock the Trials" },

    upgrades: {
        11: {
            title: "Gold Medal Mash",
            description: "Sugar gain scales with your total completions.",
            cost: new Decimal(1),
            effect() {
                let n = challengeCompletions("c", 11) + challengeCompletions("c", 12) + challengeCompletions("c", 13) +
                    challengeCompletions("c", 21) + challengeCompletions("c", 22) + challengeCompletions("c", 23)
                return new Decimal(1).add(n * 0.5)
            },
            effectDisplay() { return format(this.effect()) + "× sugar" },
        },
        12: {
            title: "Yeast Ring",
            description: "Yeast gain scales with your total completions.",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade(this.layer, 11) },
            effect() {
                let n = challengeCompletions("c", 11) + challengeCompletions("c", 12) + challengeCompletions("c", 13) +
                    challengeCompletions("c", 21) + challengeCompletions("c", 22) + challengeCompletions("c", 23)
                return new Decimal(1).add(n * 0.4)
            },
            effectDisplay() { return format(this.effect()) + "× yeast" },
        },
        13: {
            title: "Brewer's Rep",
            description: "Brew gain scales with your total completions.",
            cost: new Decimal(4),
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() {
                let n = challengeCompletions("c", 11) + challengeCompletions("c", 12) + challengeCompletions("c", 13) +
                    challengeCompletions("c", 21) + challengeCompletions("c", 22) + challengeCompletions("c", 23)
                return new Decimal(1).add(n * 0.4)
            },
            effectDisplay() { return format(this.effect()) + "× brew" },
        },
        14: {
            title: "Score Keeper",
            description: "Medal gain is boosted by your best Pure Pitch score.",
            cost: new Decimal(8),
            unlocked() { return hasUpgrade(this.layer, 13) },
            effect() {
                let ret = player.c.maxpoints[0].add(1).log(10).pow(0.5).add(1)
                return ret
            },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        15: {
            title: "Stress the Cultures",
            description: "Competition stress awakens ancient defenses — <b>unlock Sporulation</b>.",
            cost: new Decimal(16),
            unlocked() { return hasUpgrade(this.layer, 14) },
            onPurchase() { player.s.unlocked = true },
        },
        21: {
            title: "Sponsor Deals",
            description: "Sugar gain scales with completions, harder.",
            cost: new Decimal(32),
            unlocked() { return hasUpgrade(this.layer, 15) },
            effect() {
                let n = challengeCompletions("c", 11) + challengeCompletions("c", 12) + challengeCompletions("c", 13) +
                    challengeCompletions("c", 21) + challengeCompletions("c", 22) + challengeCompletions("c", 23)
                return new Decimal(1).add(n * 0.3).pow(1.2)
            },
            effectDisplay() { return format(this.effect()) + "× sugar" },
        },
        22: {
            title: "Training Regimen",
            description: "Yeast gain scales with completions, harder.",
            cost: new Decimal(64),
            unlocked() { return hasUpgrade(this.layer, 21) },
            effect() {
                let n = challengeCompletions("c", 11) + challengeCompletions("c", 12) + challengeCompletions("c", 13) +
                    challengeCompletions("c", 21) + challengeCompletions("c", 22) + challengeCompletions("c", 23)
                return new Decimal(1).add(n * 0.25).pow(1.2)
            },
            effectDisplay() { return format(this.effect()) + "× yeast" },
        },
        23: {
            title: "Pro Circuit",
            description: "Brew gain scales with completions, harder.",
            cost: new Decimal(128),
            unlocked() { return hasUpgrade(this.layer, 22) },
            effect() {
                let n = challengeCompletions("c", 11) + challengeCompletions("c", 12) + challengeCompletions("c", 13) +
                    challengeCompletions("c", 21) + challengeCompletions("c", 22) + challengeCompletions("c", 23)
                return new Decimal(1).add(n * 0.25).pow(1.2)
            },
            effectDisplay() { return format(this.effect()) + "× brew" },
        },
        24: {
            title: "Champion's Belt",
            description: "Double medal gain.",
            cost: new Decimal(256),
            unlocked() { return hasUpgrade(this.layer, 23) },
        },
        25: {
            title: "Trophy Cabinet",
            description: "Competition rewards get +0.1 to their reward exponent.",
            cost: new Decimal(512),
            unlocked() { return hasUpgrade(this.layer, 24) },
            effect() {
                let e = new Decimal(1)
                if (hasMilestone("c", 5)) e = e.add(0.1)
                if (hasUpgrade(this.layer, 25)) e = e.add(0.1)
                return e
            },
            effectDisplay() { return "Rewards ^" + format(this.effect()) },
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 medal",
            effectDescription: "Unlock the three tier-1 competitions.",
            done() { return player[this.layer].best.gte(1) },
        },
        1: {
            requirementDescription: "4 medals",
            effectDescription: "Double sugar gain.",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].best.gte(4) },
        },
        2: {
            requirementDescription: "12 medals",
            effectDescription: "Double yeast gain.",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(12) },
        },
        3: {
            requirementDescription: "30 medals",
            effectDescription: "Double brew gain.",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].best.gte(30) },
        },
        4: {
            requirementDescription: "80 medals",
            effectDescription: "Double medal gain.",
            unlocked() { return hasMilestone(this.layer, 3) },
            done() { return player[this.layer].best.gte(80) },
        },
        5: {
            requirementDescription: "200 medals",
            effectDescription: "Competition rewards get +0.1 to their reward exponent.",
            unlocked() { return hasMilestone(this.layer, 4) },
            done() { return player[this.layer].best.gte(200) },
        },
    },

    challenges: {
        11: {
            name: "Short Mash",
            challengeDescription() {
                return "The mash runs short: <b>sugar gain is rooted (^0.65)</b>.<br>Score: best brew in the run — " +
                    format(player.c.maxpoints[0]) + "<br>" + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " completions"
            },
            goalDescription: "Brew 2,000 brew inside the run",
            canComplete() { return player.b.points.gte(2000) },
            rewardDescription: "Sugar gain scales with your best score",
            rewardEffect() { return player.c.maxpoints[0].max(1).log(10).add(1).pow(cRewardExp()) },
            rewardDisplay() { return format(this.rewardEffect()) + "× sugar" },
            unlocked() { return hasMilestone("c", 0) },
        },
        12: {
            name: "Stuck Fermentation",
            challengeDescription() {
                return "The yeast stalls: <b>brew gain ×0.25</b>.<br>Score: best brew in the run — " +
                    format(player.c.maxpoints[1]) + "<br>" + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " completions"
            },
            goalDescription: "Brew 20,000 brew inside the run",
            canComplete() { return player.b.points.gte(2e4) },
            rewardDescription: "Yeast gain scales with your best score",
            rewardEffect() { return player.c.maxpoints[1].max(1).log(10).add(1).pow(cRewardExp()) },
            rewardDisplay() { return format(this.rewardEffect()) + "× yeast" },
            unlocked() { return hasMilestone("c", 0) },
        },
        13: {
            name: "Hot Ferment",
            challengeDescription() {
                return "Fusels everywhere: <b>bread and ATP gain exponents ×0.6</b>.<br>Score: best brew in the run — " +
                    format(player.c.maxpoints[2]) + "<br>" + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " completions"
            },
            goalDescription: "Brew 200,000 brew inside the run",
            canComplete() { return player.b.points.gte(2e5) },
            rewardDescription: "Brew gain scales with your best score",
            rewardEffect() { return player.c.maxpoints[2].max(1).log(10).add(1).pow(cRewardExp()) },
            rewardDisplay() { return format(this.rewardEffect()) + "× brew" },
            unlocked() { return hasMilestone("c", 0) },
        },
        21: {
            name: "Master Short Mash",
            challengeDescription() {
                return "The mash runs dry: <b>sugar gain ^0.5 and yeast gain ×0.5</b>.<br>Score: best brew in the run — " +
                    format(player.c.maxpoints[3]) + "<br>" + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " completions"
            },
            goalDescription: "Brew 2,000,000 brew inside the run",
            canComplete() { return player.b.points.gte(2e6) },
            rewardDescription: "Sugar gain scales harder with your best score",
            rewardEffect() { return player.c.maxpoints[3].max(1).log(10).add(1).pow(cRewardExp().times(1.5)) },
            rewardDisplay() { return format(this.rewardEffect()) + "× sugar" },
            unlocked() { return hasChallenge("c", 11) && hasChallenge("c", 12) && hasChallenge("c", 13) },
        },
        22: {
            name: "Master Stuck",
            challengeDescription() {
                return "Total stall: <b>brew gain ×0.05</b>.<br>Score: best brew in the run — " +
                    format(player.c.maxpoints[4]) + "<br>" + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " completions"
            },
            goalDescription: "Brew 20,000,000 brew inside the run",
            canComplete() { return player.b.points.gte(2e7) },
            rewardDescription: "Yeast gain scales harder with your best score",
            rewardEffect() { return player.c.maxpoints[4].max(1).log(10).add(1).pow(cRewardExp().times(1.5)) },
            rewardDisplay() { return format(this.rewardEffect()) + "× yeast" },
            unlocked() { return hasChallenge("c", 11) && hasChallenge("c", 12) && hasChallenge("c", 13) },
        },
        23: {
            name: "Master Hot",
            challengeDescription() {
                return "The thermometers melt: <b>yeast gain exponent ×0.5</b>.<br>Score: best brew in the run — " +
                    format(player.c.maxpoints[5]) + "<br>" + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " completions"
            },
            goalDescription: "Brew 200,000,000 brew inside the run",
            canComplete() { return player.b.points.gte(2e8) },
            rewardDescription: "Brew gain scales harder with your best score",
            rewardEffect() { return player.c.maxpoints[5].max(1).log(10).add(1).pow(cRewardExp().times(1.5)) },
            rewardDisplay() { return format(this.rewardEffect()) + "× brew" },
            unlocked() { return hasChallenge("c", 11) && hasChallenge("c", 12) && hasChallenge("c", 13) },
        },
    },
})

function cRewardExp() {
    let e = new Decimal(1)
    if (hasMilestone("c", 5)) e = e.add(0.1)
    if (hasUpgrade("c", 25)) e = e.add(0.1)
    return e
}

addLayer("e", {
    name: "Distillery",
    symbol: "🥃",
    position: 1,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
        }
    },
    color: "#B0C4DE",
    resource: "ABV",
    row: 2,

    baseResource: "brew",
    baseAmount() { return player.b.points },
    requires: new Decimal(5000),
    type: "custom",
    exponent: 1,

    tolerance() {
        let cap = new Decimal(5)
        if (hasUpgrade("e", 12)) cap = new Decimal(8)
        if (hasUpgrade("e", 13)) cap = new Decimal(12)
        if (hasUpgrade("e", 21)) cap = new Decimal(15)
        if (hasUpgrade("e", 23)) cap = new Decimal(18)
        if (hasUpgrade("e", 33)) cap = new Decimal(21)
        if (hasUpgrade("e", 41)) cap = new Decimal(25)
        if (hasMilestone("e", 5)) cap = cap.add(1)
        if (hasUpgrade("t", 23)) cap = cap.add(2)
        return cap
    },

    distillMult() {
        let m = new Decimal(1)
        if (hasUpgrade("e", 11)) m = m.times(2)
        if (hasUpgrade("e", 22)) m = m.times(2)
        if (hasUpgrade("e", 31)) m = m.times(3)
        if (hasUpgrade("e", 25)) m = m.times(upgradeEffect("e", 25))
        if (hasUpgrade("e", 32)) m = m.times(upgradeEffect("e", 32))
        if (hasUpgrade("e", 14)) m = m.times(upgradeEffect("e", 14))
        if (hasMilestone("e", 1)) m = m.times(2)
        if (getBuyableAmount("e", 11).gte(1)) m = m.times(buyableEffect("e", 11))
        m = m.times(layers.w.strainMult())
        if (hasAchievement("a", 43)) m = m.times(2)
        if (hasUpgrade("e", 42)) m = m.pow(1.1)
        return m
    },

    getResetGain() {
        if (player.b.points.lt(this.requires)) return new Decimal(0)
        let gain = player.b.points.add(1).log(10).div(4).times(this.distillMult())
        let room = this.tolerance().sub(player.e.points).max(0)
        return gain.min(room).max(0)
    },
    getNextAt() { return new Decimal(5000) },
    canReset() {
        return player.b.points.gte(5000) && player.e.points.lt(this.tolerance()) && this.getResetGain().gt(0)
    },
    prestigeButtonText() {
        if (player.b.points.lt(5000)) return "Need " + format(5000) + " brew to distill"
        if (player.e.points.gte(this.tolerance())) return "At tolerance — bottle some ABV (buy upgrades)"
        let gain = this.getResetGain()
        return "Distill! (+" + format(gain) + "% ABV)"
    },
    resetDescription: "Distill the wash for ",

    gainMult() { return new Decimal(1) },
    gainExp() { return new Decimal(1) },

    resetsNothing() { return hasMilestone("s", 3) },
    autoPrestige() { return hasMilestone("s", 3) },
    autoUpgrade() { return hasMilestone("s", 3) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        layerDataReset(this.layer, ["unlocked", "auto", "upgrades", "milestones"])
    },

    layerShown() { return player[this.layer].unlocked || hasUpgrade("b", 25) },
    branches: ["b"],
    hotkeys: [
        {
            key: "e",
            description: "E: Distill the wash",
            onPress() { if (canReset(this.layer)) doReset(this.layer) },
        },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function () { return "You have " + format(player.b.points) + " brew to run through the still" }],
        ["display-text", function () {
            return "Ethanol tolerance: <b>" + format(layers.e.tolerance()) + "% ABV</b> — the hard ceiling of this lineage. Every drop above it kills the yeast."
        }],
        ["display-text", function () {
            if (player.e.points.gte(layers.e.tolerance().sub(0.05))) return "<b style='color:#B0C4DE'>The still is full — spend ABV on upgrades to free headroom.</b>"
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": {
                content: [
                    ["blank", "10px"],
                    ["raw-html", function () { return "<div style='opacity:.55'>Bottling ABV into upgrades is what frees the still for the next run.</div>" }],
                    ["blank", "10px"],
                    "upgrades",
                ],
            },
            "Milestones": {
                content: [["blank", "10px"], "milestones"],
            },
            "Buyables": {
                unlocked() { return hasUpgrade("e", 35) },
                content: [["blank", "10px"], "buyables"],
            },
        },
    },

    tooltip() { return "Concentrate brew into spirit — up to the ethanol tolerance" },
    tooltipLocked() { return "Distill the wash (Brewing upgrade 25) to unlock the Distillery" },

    upgrades: {
        11: {
            title: "Copper Still",
            description: "Double ABV per distillation.",
            cost: new Decimal(0.5),
        },
        12: {
            title: "Thermotolerant Strain",
            description: "Ethanol tolerance rises to 8% ABV.",
            cost: new Decimal(1),
            unlocked() { return hasUpgrade(this.layer, 11) },
            effect() { return hasUpgrade(this.layer, 12) ? new Decimal(8) : new Decimal(5) },
            effectDisplay() { return "Tolerance: " + format(this.effect()) + "% ABV" },
        },
        13: {
            title: "Sake Lineage",
            description: "Ethanol tolerance rises to 12% ABV.",
            cost: new Decimal(1.5),
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return hasUpgrade(this.layer, 13) ? new Decimal(12) : new Decimal(8) },
            effectDisplay() { return "Tolerance: " + format(this.effect()) + "% ABV" },
        },
        14: {
            title: "Reflux Column",
            description: "ABV per distillation is boosted by your unspent ABV (softcapped).",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade(this.layer, 13) },
            effect() {
                let ret = player[this.layer].points.add(1).pow(0.5)
                if (ret.gte(25)) ret = ret.pow(0.5).times(5)
                return ret
            },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        15: {
            title: "Distiller's Yeast",
            description: "Brew gain exponent +0.01.",
            cost: new Decimal(2.5),
            unlocked() { return hasUpgrade(this.layer, 14) },
            effect() { return hasUpgrade(this.layer, 15) ? new Decimal(0.01) : new Decimal(0) },
            effectDisplay() { return "+" + format(this.effect()) + " brew exp" },
        },
        21: {
            title: "Turbo Yeast",
            description: "Ethanol tolerance rises to 15% ABV.",
            cost: new Decimal(3),
            unlocked() { return hasUpgrade(this.layer, 15) },
            effect() { return hasUpgrade(this.layer, 21) ? new Decimal(15) : new Decimal(12) },
            effectDisplay() { return "Tolerance: " + format(this.effect()) + "% ABV" },
        },
        22: {
            title: "Charred Oak",
            description: "Double ABV per distillation.",
            cost: new Decimal(3.5),
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
        23: {
            title: "Fortified Ferment",
            description: "Ethanol tolerance rises to 18% ABV.",
            cost: new Decimal(4),
            unlocked() { return hasUpgrade(this.layer, 22) },
            effect() { return hasUpgrade(this.layer, 23) ? new Decimal(18) : new Decimal(15) },
            effectDisplay() { return "Tolerance: " + format(this.effect()) + "% ABV" },
        },
        24: {
            title: "Open a Taproom",
            description: "<b>Unlock the Tavern</b> — sell the good stuff.",
            cost: new Decimal(4.5),
            unlocked() { return hasUpgrade(this.layer, 23) },
            onPurchase() { player.t.unlocked = true },
        },
        25: {
            title: "Wild Yeast Blend",
            description: "Double ABV per distillation once you know 4 strains.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade(this.layer, 24) },
            effect() { return player.w.strains.length >= 4 ? new Decimal(2) : new Decimal(1) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        31: {
            title: "Triple Distillation",
            description: "Triple ABV per distillation.",
            cost: new Decimal(6),
            unlocked() { return hasUpgrade(this.layer, 25) },
        },
        32: {
            title: "Pot Watcher",
            description: "ABV per distillation is boosted by the log of your brew.",
            cost: new Decimal(7),
            unlocked() { return hasUpgrade(this.layer, 31) },
            effect() { return player.b.points.add(10).log(10).pow(1.2) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        33: {
            title: "Ice Distillation",
            description: "Ethanol tolerance rises to 21% ABV.",
            cost: new Decimal(8),
            unlocked() { return hasUpgrade(this.layer, 32) },
            effect() { return hasUpgrade(this.layer, 33) ? new Decimal(21) : new Decimal(18) },
            effectDisplay() { return "Tolerance: " + format(this.effect()) + "% ABV" },
        },
        34: {
            title: "Vent the CO2",
            description: "Sugar gain is boosted by your unspent ABV.",
            cost: new Decimal(9),
            unlocked() { return hasUpgrade(this.layer, 33) },
            effect() { return player[this.layer].points.add(1).pow(0.4) },
            effectDisplay() { return format(this.effect()) + "× sugar" },
        },
        35: {
            title: "Second Still",
            description: "<b>Unlock the Pot Still buyable</b>.",
            cost: new Decimal(10),
            unlocked() { return hasUpgrade(this.layer, 34) },
        },
        41: {
            title: "Sc2.0 Tolerance Cassette",
            description: "Ethanol tolerance rises to 25% ABV — beyond anything evolution dared.",
            cost: new Decimal(12),
            unlocked() { return hasUpgrade(this.layer, 35) && hasMilestone("s", 0) },
            effect() { return hasUpgrade(this.layer, 41) ? new Decimal(25) : new Decimal(21) },
            effectDisplay() { return "Tolerance: " + format(this.effect()) + "% ABV" },
        },
        42: {
            title: "Master Distiller",
            description: "All distillation multipliers are raised ^1.1.",
            cost: new Decimal(14),
            unlocked() { return hasUpgrade(this.layer, 41) },
        },
    },

    milestones: {
        0: {
            requirementDescription: "5 ABV distilled in total",
            effectDescription: "Double brew gain.",
            done() { return player[this.layer].total.gte(5) },
        },
        1: {
            requirementDescription: "15 ABV distilled in total",
            effectDescription: "Double ABV per distillation.",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].total.gte(15) },
        },
        2: {
            requirementDescription: "40 ABV distilled in total",
            effectDescription: "Double sugar gain.",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].total.gte(40) },
        },
        3: {
            requirementDescription: "100 ABV distilled in total",
            effectDescription: "Automatically brew a batch.",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].total.gte(100) },
        },
        4: {
            requirementDescription: "250 ABV distilled in total",
            effectDescription: "Triple brew gain.",
            unlocked() { return hasMilestone(this.layer, 3) },
            done() { return player[this.layer].total.gte(250) },
        },
        5: {
            requirementDescription: "600 ABV distilled in total",
            effectDescription: "Ethanol tolerance +1% ABV.",
            unlocked() { return hasMilestone(this.layer, 4) },
            done() { return player[this.layer].total.gte(600) },
        },
    },

    buyables: {
        11: {
            title: "Pot Still",
            unlocked() { return hasUpgrade("e", 35) },
            cost(x) { return new Decimal(2).times(Decimal.pow(1.8, x)) },
            effect(x) { return Decimal.pow(1.5, x) },
            display() {
                return "ABV per distillation ×" + format(tmp[this.layer].buyables[this.id].effect) +
                    "<br>Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ABV"
            },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("t", {
    name: "Tavern",
    symbol: "🪙",
    position: 2,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
        }
    },
    color: "#8B4513",
    resource: "coins",
    row: 2,

    baseResource: "brew",
    baseAmount() { return player.b.points },
    requires: new Decimal(2.5e5),
    type: "normal",
    exponent: 1 / 3,

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("t", 11)) m = m.times(2)
        if (hasUpgrade("t", 21)) m = m.times(3)
        if (hasUpgrade("t", 25)) m = m.times(upgradeEffect("t", 25))
        if (hasUpgrade("t", 33)) m = m.times(upgradeEffect("t", 33))
        if (hasMilestone("t", 0)) m = m.times(2)
        if (hasMilestone("g", 13)) m = m.times(5)
        if (hasAchievement("a", 34)) m = m.times(2)
        m = m.times(layers.w.strainMult())
        return m
    },
    gainExp() { return new Decimal(1) },

    resetsNothing() { return hasMilestone("s", 3) },
    autoPrestige() { return hasMilestone("s", 3) },
    autoUpgrade() { return hasMilestone("s", 3) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return
        layerDataReset(this.layer, ["unlocked", "auto", "upgrades", "milestones"])
    },

    layerShown() { return player[this.layer].unlocked || hasUpgrade("e", 24) },
    branches: ["e"],
    hotkeys: [
        {
            key: "t",
            description: "T: Sell at the Tavern",
            onPress() { if (canReset(this.layer)) doReset(this.layer) },
        },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function () { return "You have " + format(player.b.points) + " brew to sell by the pitcher" }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": {
                content: [
                    ["blank", "10px"],
                    ["raw-html", function () { return "<div style='opacity:.55'>The guild sells technique, not booze: every purchase here rewrites a formula somewhere else in the tree.</div>" }],
                    ["blank", "10px"],
                    "upgrades",
                ],
            },
            "Milestones": {
                content: [["blank", "10px"], "milestones"],
            },
            "Buyables": {
                unlocked() { return hasUpgrade("t", 14) },
                content: [["blank", "10px"], "buyables"],
            },
        },
    },

    tooltip() { return "Sell brew for coins, buy upgrades that rewrite other layers" },
    tooltipLocked() { return "Open a taproom (Distillery upgrade 24) to unlock the Tavern" },

    upgrades: {
        11: {
            title: "Open Sign",
            description: "Double coin gain.",
            cost: new Decimal(5),
        },
        12: {
            title: "Budding Guild",
            description: "Budding Momentum (Budding 12) grows stronger with your coins.",
            cost: new Decimal(15),
            unlocked() { return hasUpgrade(this.layer, 11) },
            effect() { return new Decimal(1.1).add(player.t.points.add(1).max(1).log(10).min(4).times(0.025)) },
            effectDisplay() { return "Budding 12 ^" + format(this.effect()) },
        },
        13: {
            title: "Vessel Subsidy",
            description: "Budding Vats cost base drops from 2.8 to 2.5.",
            cost: new Decimal(40),
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return hasUpgrade(this.layer, 13) ? new Decimal(2.5) : new Decimal(2.8) },
            effectDisplay() { return "Cost base: " + format(this.effect()) },
        },
        14: {
            title: "Regulars' Corner",
            description: "<b>Unlock the buyable</b> — the regulars keep coming back.",
            cost: new Decimal(100),
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        21: {
            title: "Busy Night",
            description: "Triple coin gain.",
            cost: new Decimal(250),
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        22: {
            title: "Brewers' Union",
            description: "Fermentation Heat (Brewing 12) grows stronger with your coins.",
            cost: new Decimal(750),
            unlocked() { return hasUpgrade(this.layer, 21) },
            effect() { return new Decimal(1.05).add(player.t.points.add(1).max(1).log(10).min(2).times(0.025)) },
            effectDisplay() { return "Brewing 12 ×" + format(this.effect()) },
        },
        23: {
            title: "Smuggler's Cellar",
            description: "Ethanol tolerance +2% ABV. Don't ask where it came from.",
            cost: new Decimal(2e3),
            unlocked() { return hasUpgrade(this.layer, 22) },
            effect() { return hasUpgrade(this.layer, 23) ? new Decimal(2) : new Decimal(0) },
            effectDisplay() { return "+" + format(this.effect()) + "% ABV" },
        },
        24: {
            title: "House Specials",
            description: "Sugar gain scales with your Regulars level.",
            cost: new Decimal(6e3),
            unlocked() { return hasUpgrade(this.layer, 23) },
            effect() { return new Decimal(1).add(getBuyableAmount(this.layer, 12).times(0.1)) },
            effectDisplay() { return format(this.effect()) + "× sugar" },
        },
        25: {
            title: "Coin Weight",
            description: "Coin gain is boosted by your unspent coins.",
            cost: new Decimal(2e4),
            unlocked() { return hasUpgrade(this.layer, 24) },
            effect() { return player[this.layer].points.add(1).pow(0.3) },
            effectDisplay() { return format(this.effect()) + "×" },
        },
        31: {
            title: "Aeration Contract",
            description: "Aeration Stones grow stronger with your coins.",
            cost: new Decimal(6e4),
            unlocked() { return hasUpgrade(this.layer, 25) },
            effect() { return new Decimal(1.1).add(player.t.points.add(1).max(1).log(10).min(4).times(0.025)) },
            effectDisplay() { return "×" + format(this.effect()) + " to Aeration Stones" },
        },
        32: {
            title: "Bigger Fermenters",
            description: "The yeast softcap starts 10× later.",
            cost: new Decimal(2e5),
            unlocked() { return hasUpgrade(this.layer, 31) },
            effect() { return hasUpgrade(this.layer, 32) ? new Decimal(10) : new Decimal(1) },
            effectDisplay() { return "Softcap ×" + format(this.effect()) },
        },
        33: {
            title: "Taproom Reputation",
            description: "Sugar gain is boosted by your brew.",
            cost: new Decimal(6e5),
            unlocked() { return hasUpgrade(this.layer, 32) },
            effect() { return player.b.points.add(1).pow(0.25) },
            effectDisplay() { return format(this.effect()) + "× sugar" },
        },
    },

    milestones: {
        0: {
            requirementDescription: "10 coins",
            effectDescription: "Double coin gain.",
            done() { return player[this.layer].best.gte(10) },
        },
        1: {
            requirementDescription: "50 coins",
            effectDescription: "Double brew gain.",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].best.gte(50) },
        },
        2: {
            requirementDescription: "500 coins",
            effectDescription: "Automatically bake a batch.",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(500) },
        },
    },

    buyables: {
        11: {
            title: "Round for the House",
            unlocked() { return true },
            cost(x) { return new Decimal(20).times(Decimal.pow(2.8, x)) },
            effect(x) { return Decimal.pow(1.6, x) },
            display() {
                return "Coin gain ×" + format(tmp[this.layer].buyables[this.id].effect) +
                    "<br>Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " coins"
            },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            title: "Regulars",
            unlocked() { return hasUpgrade("t", 14) },
            cost(x) { return new Decimal(500).times(Decimal.pow(4, x)) },
            effect(x) { return Decimal.pow(1.8, x) },
            display() {
                return "Sugar gain ×" + format(tmp[this.layer].buyables[this.id].effect) +
                    "<br>Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " coins"
            },
            canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})
