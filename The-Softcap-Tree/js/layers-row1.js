// ============================================================
// Row 1 — Threshold 阈值 / Pillar 柱 / Counterpillar 反柱
// th: the cap shop. pl/pt: two pillars whose caps feed each other.
// ============================================================

addLayer("th", {
    name() { return L("Threshold", "阈值") },
    symbol: "TH",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#ffb74d",
    resource() { return L("Thresholds", "阈值") },
    row: 1,
    position: 0,

    baseResource() { return L("Strain", "应变") },
    baseAmount() { return player.st.points },
    requires: new Decimal(2000),
    type: "normal",
    exponent: 1 / 3,

    softcap() { return thSoftcapStart() },
    softcapPower() { return new Decimal(TUNING.row1.softcapPow) },

    gainMult() {
        var m = new Decimal(1)
        m = m.times(buyableEffect("st", 11))                 // st resonance feeds th (cross-layer consumer)
        if (hasUpgrade("th", 11)) m = m.times(2)
        if (hasUpgrade("th", 13)) m = m.times(upgradeEffect("th", 13))
        if (hasUpgrade("th", 23)) m = m.times(upgradeEffect("th", 23))
        if (hasUpgrade("th", 24)) m = m.times(5)
        if (hasUpgrade("gr", 14)) m = m.times(3)
        if (hasUpgrade("ov", 23)) m = m.times(10)
        if (hasMilestone("tw", 0)) m = m.times(2)
        if (hasMilestone("gr", 1)) m = m.times(3)
        if (hasMilestone("mf", 0)) m = m.times(5)
        if (hasAchievement("ac", 13)) m = m.times(2)
        return m
    },
    gainExp() { return new Decimal(mfTune(3)) },

    resetsNothing() {
        return hasMilestone("th", 0) || hasAchievement("ac", 22)
    },
    autoPrestige() {
        // package (gr m2); the th m0 conjunct keeps the invariant set-strict (N-AUTOWIPE)
        return (hasMilestone("gr", 2) && hasMilestone("th", 0)) || hasAchievement("ac", 32)
    },
    autoUpgrade() { return hasMilestone("in", 3) || hasAchievement("ac", 42) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            var keep = ["unlocked", "auto", "best", "total"]
            if (hasMilestone("gr", 2)) keep.push("upgrades", "milestones", "buyables")
            if (hasMilestone("mf", 2)) keep.push("upgrades", "milestones", "buyables")
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return player.th.unlocked || player.st.points.gte(200) },
    branches: ["st"],
    hotkeys: [
        { key: "t", description() { return L("T: Raise a Threshold", "T：筑起一道阈值") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    resetDescription() { return L("Raise for ", "筑起 ") },

    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            return L(
                "Force wall cap: " + format(strainCap()) + " (your Thresholds feed it: ×(1+Thresholds^0.25))",
                "力之墙上限：" + format(strainCap()) + "（你的阈值在喂它：×(1+阈值^0.25)）"
            )
        }],
        ["display-text", function() {
            var s = thSoftcapStart()
            return player.th.points.gte(s.div(2))
                ? L("Threshold gain softcap starts at " + format(s) + " — currently <b style='color:#ff8a65'>softcapped</b>", "阈值获取软上限始于 " + format(s) + " —— 当前<b style='color:#ff8a65'>已被压制</b>")
                : L("Threshold gain softcap starts at " + format(s), "阈值获取软上限始于 " + format(s))
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": {
                content: ["upgrades"],
            },
            "Cap Work": {
                content: [
                    ["display-text", function() { return L("These raises lift the caps of other layers — the web of softcaps.", "这些抬升会顶起其他层的上限——软上限之网。") }],
                    ["blank", "10px"],
                    "upgrades",
                ],
            },
            "Structures": {
                content: ["buyables"],
            },
            "Milestones": {
                content: ["milestones"],
            },
        },
    },

    upgrades: {
        11: {
            title() { return L("First Threshold", "第一道阈值") },
            description() { return L("Threshold gain ×2.", "阈值获取 ×2。") },
            cost: new Decimal(1),
        },
        12: {
            title() { return L("Raise the First Wall", "抬升第一面墙") },
            description() { return L("Force wall cap ×10.", "力之墙上限 ×10。") },
            cost: new Decimal(3),
            unlocked() { return hasUpgrade(this.layer, 11) },
        },
        13: {
            title() { return L("Threshold Reservoir", "阈值储备") },
            description() { return L("Threshold gain is boosted by your Strain (log-shaped).", "阈值获取受应变加成（对数形）。") },
            cost: new Decimal(10),
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return player.st.points.add(1).log10().add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        14: {
            title() { return L("Thresholds Push Back", "阈值反推") },
            description() { return L("Force gain is boosted by your Thresholds.", "力获取受阈值加成。") },
            cost: new Decimal(100),
            unlocked() { return hasUpgrade(this.layer, 13) },
            effect() { return player.th.points.add(1).pow(0.4) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        15: {
            title() { return L("A Higher Ceiling", "更高的天花板") },
            description() { return L("Threshold softcap start ×10.", "阈值软上限起点 ×10。") },
            cost: new Decimal(7), // deliberate cheap key drop mid-ladder (11 §3.2)
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        21: {
            title() { return L("Lean Left", "左柱相倚") },
            description() { return L("Pillar cap start ×2.", "柱上限起点 ×2。") },
            cost: new Decimal(1e3),
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
        22: {
            title() { return L("Lean Right", "右柱相倚") },
            description() { return L("Counterpillar cap start ×2.", "反柱上限起点 ×2。") },
            cost: new Decimal(1e4),
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
        23: {
            title() { return L("Wall Memory", "墙之记忆") },
            description() { return L("Threshold gain is boosted by your Stress (log-shaped).", "阈值获取受应力加成（对数形）。") },
            cost: new Decimal(1e5),
            unlocked() { return hasUpgrade(this.layer, 22) },
            effect() { return player.st.stress.add(1).log10().add(1).pow(1.5) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: {
            title() { return L("Stacked Ceilings", "层叠天花板") },
            description() { return L("Threshold gain ×5.", "阈值获取 ×5。") },
            cost: new Decimal(1e8),
            unlocked() { return hasUpgrade(this.layer, 23) },
        },
        25: {
            title() { return L("Beat Against It", "向墙而击") },
            description() { return L("Time Wall bar fills ×2 faster.", "时间墙充能 ×2。") },
            cost: new Decimal(1e12),
            unlocked() { return hasUpgrade(this.layer, 24) },
        },
    },

    buyables: {
        11: {
            title() { return L("Threshold Engine", "阈值引擎") },
            cost(x) { return new Decimal(50).times(Decimal.pow(2.5, x)) },
            effect(x) { return Decimal.pow(1.25, x) },
            display() {
                return L(
                    "Gravity gain ×" + format(buyableEffect("th", 11)) + ".<br>Level: " + formatWhole(getBuyableAmount("th", 11)) +
                    "<br>Cost: " + format(this.cost(getBuyableAmount("th", 11))) + " Thresholds",
                    "引力获取 ×" + format(buyableEffect("th", 11)) + "。<br>等级：" + formatWhole(getBuyableAmount("th", 11)) +
                    "<br>价格：" + format(this.cost(getBuyableAmount("th", 11))) + " 阈值"
                )
            },
            canAfford() { return player.th.points.gte(tmp.th.buyables[11].cost) },
            buy() {
                var c = tmp.th.buyables[11].cost
                player.th.points = player.th.points.sub(c)
                setBuyableAmount("th", 11, getBuyableAmount("th", 11).add(1))
            },
        },
    },

    milestones: {
        0: {
            requirementDescription() { return L("20 Thresholds", "20 阈值") },
            effectDescription() { return L("Raising a Threshold no longer resets anything below.", "筑阈值不再重置任何下层。") },
            done() { return player[this.layer].best.gte(20) },
        },
        1: {
            requirementDescription() { return L("100 Thresholds", "100 阈值") },
            effectDescription() { return L("Force wall cap ×5.", "力之墙上限 ×5。") },
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].best.gte(100) },
        },
        2: {
            requirementDescription() { return L("2,000 Thresholds", "2,000 阈值") },
            effectDescription() { return L("Automatically buy Strain upgrades; Strain upgrades & milestones survive resets.", "自动购买应变升级；应变升级与里程碑在重置后保留。") },
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(2e3) },
        },
        3: {
            requirementDescription() { return L("1e5 Thresholds", "1e5 阈值") },
            effectDescription() { return L("Force gain ×3.", "力获取 ×3。") },
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].best.gte(1e5) },
        },
    },
})

// ------------------------------------------------------------
// Twin pillars — mutual caps: each one's cap start is the
// other's currency. Lean on each other, rise together.
// ------------------------------------------------------------

addLayer("pl", {
    name() { return L("Pillar", "柱") },
    symbol: "PL",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#aed581",
    resource() { return L("Pillars", "柱") },
    row: 1,
    position: 1,

    baseResource() { return L("Strain", "应变") },
    baseAmount() { return player.st.points },
    requires: new Decimal(2000),
    type: "normal",
    exponent: 1 / 3,

    // the mutual cap: pillar's own wall start is fed by the COUNTERPILLAR
    softcap() { return plCapStart() },
    softcapPower() { return new Decimal(TUNING.row1.softcapPow) },

    gainMult() {
        var m = new Decimal(1)
        m = m.times(player.pt.points.add(1).pow(TUNING.row1.leanExp))   // leaning on the sibling
        if (hasUpgrade("pl", 11)) m = m.times(2)
        if (hasUpgrade("pl", 15)) m = m.times(upgradeEffect("pl", 15))
        if (hasUpgrade("pl", 21)) m = m.times(upgradeEffect("pl", 21))
        if (hasUpgrade("pl", 24)) m = m.times(upgradeEffect("pl", 24))
        if (hasUpgrade("pt", 23)) m = m.times(2)                          // the sibling cross-braces back
        if (hasMilestone("pl", 2)) m = m.times(5)
        if (hasMilestone("gr", 1)) m = m.times(3)
        if (hasUpgrade("ov", 23)) m = m.times(10)
        if (hasMilestone("gr", 0)) m = m.times(2)
        if (hasMilestone("tw", 0)) m = m.times(2)
        if (hasMilestone("mf", 0)) m = m.times(5)
        if (hasAchievement("ac", 14)) m = m.times(2)
        return m
    },
    gainExp() { return new Decimal(mfTune(4)) },

    resetsNothing() {
        // granted by pt m0 (the ladder's step 3) or the gr m2 package
        return hasMilestone("pt", 0) || hasAchievement("ac", 32)
    },
    autoPrestige() { return (hasMilestone("gr", 2) && hasMilestone("pt", 0)) || hasAchievement("ac", 32) },
    autoUpgrade() { return hasMilestone("in", 3) || hasAchievement("ac", 42) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            var keep = ["unlocked", "auto", "best", "total"]
            if (hasMilestone("gr", 2)) keep.push("upgrades", "milestones", "buyables")
            if (hasMilestone("mf", 2)) keep.push("upgrades", "milestones", "buyables")
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return player.pl.unlocked || player.st.points.gte(350) },
    branches: ["st"],
    hotkeys: [
        { key: "p", description() { return L("P: Raise a Pillar", "P：立起一根柱") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    resetDescription() { return L("Raise for ", "立起 ") },

    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            return L(
                "Pillar wall start: " + format(plCapStart()) + " — fed by your Counterpillars ×(1+CP^0.25); leaning on them: ×" + format(player.pt.points.add(1).pow(TUNING.row1.leanExp)),
                "柱之墙起点：" + format(plCapStart()) + " —— 由反柱喂给 ×(1+反柱^0.25)；相倚加成 ×" + format(player.pt.points.add(1).pow(TUNING.row1.leanExp))
            )
        }],
        ["display-text", function() {
            return L(
                "Counterpillar wall start: " + format(ptCapStart()) + " — fed by YOUR Pillars. Push both to lift both.",
                "反柱之墙起点：" + format(ptCapStart()) + " —— 由你的柱喂给。两边一起推，才能一起抬。"
            )
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": {
                content: ["upgrades"],
            },
            "Deep Work": {
                content: ["upgrades"],
            },
            "Structures": {
                content: ["buyables"],
            },
            "Milestones": {
                content: ["milestones"],
            },
        },
    },

    upgrades: {
        11: {
            title() { return L("Load-Bearing", "承重") },
            description() { return L("Pillar gain ×2.", "柱获取 ×2。") },
            cost: new Decimal(1),
        },
        12: {
            title() { return L("Self-Standing", "自立") },
            description() { return L("Pillar wall start ×2.", "柱之墙起点 ×2。") },
            cost: new Decimal(3),
            unlocked() { return hasUpgrade(this.layer, 11) },
        },
        13: {
            title() { return L("Shoulder to Shoulder", "比肩") },
            description() { return L("Counterpillar wall start ×2.", "反柱之墙起点 ×2。") },
            cost: new Decimal(10),
            unlocked() { return hasUpgrade(this.layer, 12) },
        },
        14: {
            title() { return L("Transfer Load", "传导载荷") },
            description() { return L("Force gain ×1.5.", "力获取 ×1.5。") },
            cost: new Decimal(100),
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        15: {
            title() { return L("Column Memory", "柱之记忆") },
            description() { return L("Pillar gain is boosted by your Strain (log-shaped).", "柱获取受应变加成（对数形）。") },
            cost: new Decimal(500),
            unlocked() { return hasUpgrade(this.layer, 14) },
            effect() { return player.st.points.add(1).log10().add(1).pow(2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        21: {
            title() { return L("Compressive Core", "受压核心") },
            description() { return L("Pillar gain is boosted by unspent Pillars (softcapped).", "柱获取受未支出柱加成（软上限）。") },
            cost: new Decimal(1e3),
            unlocked() { return hasUpgrade(this.layer, 15) },
            effect() {
                var e = player.pl.points.add(1).pow(0.4)
                if (e.gte(1e4)) e = e.sqrt().times(100)
                return e
            },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        22: {
            title() { return L("Second Story", "第二层") },
            description() { return L("Pillar wall start ×2.", "柱之墙起点 ×2。") },
            cost: new Decimal(1e4),
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
        23: {
            title() { return L("Counterbrace", "反向支撑") },
            description() { return L("Counterpillar gain ×2.", "反柱获取 ×2。") },
            cost: new Decimal(1e6),
            unlocked() { return hasUpgrade(this.layer, 22) },
        },
        24: {
            title() { return L("Mutual Load", "互载") },
            description() { return L("Pillar gain is boosted by your Counterpillars (log-shaped).", "柱获取受反柱加成（对数形）。") },
            cost: new Decimal(1e8),
            unlocked() { return hasUpgrade(this.layer, 23) },
            effect() { return player.pt.points.add(1).log10().add(1).pow(2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        25: {
            title() { return L("Full Weight", "全力一靠") },
            description() { return L("Force gain ×2.", "力获取 ×2。") },
            cost: new Decimal(1e11),
            unlocked() { return hasUpgrade(this.layer, 24) },
        },
    },

    buyables: {
        11: {
            title() { return L("Lean Engine", "相倚引擎") },
            cost(x) { return new Decimal(20).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.3, x) },
            display() {
                return L(
                    "Counterpillar gain ×" + format(buyableEffect("pl", 11)) + ".<br>Level: " + formatWhole(getBuyableAmount("pl", 11)) +
                    "<br>Cost: " + format(this.cost(getBuyableAmount("pl", 11))) + " Pillars",
                    "反柱获取 ×" + format(buyableEffect("pl", 11)) + "。<br>等级：" + formatWhole(getBuyableAmount("pl", 11)) +
                    "<br>价格：" + format(this.cost(getBuyableAmount("pl", 11))) + " 柱"
                )
            },
            canAfford() { return player.pl.points.gte(tmp.pl.buyables[11].cost) },
            buy() {
                var c = tmp.pl.buyables[11].cost
                player.pl.points = player.pl.points.sub(c)
                setBuyableAmount("pl", 11, getBuyableAmount("pl", 11).add(1))
            },
        },
    },

    milestones: {
        0: {
            requirementDescription() { return L("25 Pillars", "25 柱") },
            effectDescription() { return L("Strain is generated passively (resetGain/s) without resetting Force.", "应变被动生成（resetGain/秒），不再重置力。") },
            done() { return player[this.layer].best.gte(25) },
        },
        1: {
            requirementDescription() { return L("100 Pillars", "100 柱") },
            effectDescription() { return L("Force gain ×2.", "力获取 ×2。") },
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].best.gte(100) },
        },
        2: {
            requirementDescription() { return L("1,000 Pillars", "1,000 柱") },
            effectDescription() { return L("Pillar gain ×5.", "柱获取 ×5。") },
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(1e3) },
        },
        3: {
            requirementDescription() { return L("1e4 Pillars", "1e4 柱") },
            effectDescription() { return L("Hardening rate ×2 (Work Hardening layer).", "硬化速率 ×2（加工硬化层）。") },
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].best.gte(1e4) },
        },
    },
})

addLayer("pt", {
    name() { return L("Counterpillar", "反柱") },
    symbol: "PT",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#ce93d8",
    resource() { return L("Counterpillars", "反柱") },
    row: 1,
    position: 2,

    baseResource() { return L("Strain", "应变") },
    baseAmount() { return player.st.points },
    requires: new Decimal(4000),
    type: "normal",
    exponent: 1 / 3,

    softcap() { return ptCapStart() },
    softcapPower() { return new Decimal(TUNING.row1.softcapPow) },

    gainMult() {
        var m = new Decimal(1)
        m = m.times(player.pl.points.add(1).pow(TUNING.row1.leanExp))   // leaning back
        if (hasUpgrade("pt", 11)) m = m.times(2)
        if (hasUpgrade("pt", 15)) m = m.times(upgradeEffect("pt", 15))
        if (hasUpgrade("pt", 21)) m = m.times(upgradeEffect("pt", 21))
        if (hasUpgrade("pt", 24)) m = m.times(upgradeEffect("pt", 24))
        if (hasMilestone("pt", 3)) m = m.times(5)
        if (hasMilestone("gr", 1)) m = m.times(3)
        if (hasUpgrade("ov", 23)) m = m.times(10)
        if (hasUpgrade("pl", 23)) m = m.times(2)                        // the sibling braces back
        m = m.times(buyableEffect("pl", 11))                            // pl's Lean Engine feeds pt
        if (hasMilestone("gr", 0)) m = m.times(2)
        if (hasMilestone("tw", 0)) m = m.times(2)
        if (hasMilestone("mf", 0)) m = m.times(5)
        if (hasAchievement("ac", 15)) m = m.times(2)
        return m
    },
    gainExp() { return new Decimal(mfTune(5)) },

    resetsNothing() {
        // package with autoPrestige at gr m2 — invariant holds (granted together)
        return hasMilestone("gr", 2) || hasAchievement("ac", 32)
    },
    autoPrestige() { return hasMilestone("gr", 2) || hasAchievement("ac", 32) }, // same set as resetsNothing — invariant holds
    autoUpgrade() { return hasMilestone("in", 3) || hasAchievement("ac", 42) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            var keep = ["unlocked", "auto", "best", "total"]
            if (hasMilestone("gr", 2)) keep.push("upgrades", "milestones", "buyables")
            if (hasMilestone("mf", 2)) keep.push("upgrades", "milestones", "buyables")
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return player.pt.unlocked || player.st.points.gte(600) },
    branches: ["st"],
    hotkeys: [
        { key: "P", description() { return L("Shift+P: Raise a Counterpillar", "Shift+P：立起一根反柱") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    resetDescription() { return L("Raise for ", "立起 ") },

    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            return L(
                "Counterpillar wall start: " + format(ptCapStart()) + " — fed by your Pillars ×(1+P^0.25); leaning on them: ×" + format(player.pl.points.add(1).pow(TUNING.row1.leanExp)),
                "反柱之墙起点：" + format(ptCapStart()) + " —— 由柱喂给 ×(1+柱^0.25)；相倚加成 ×" + format(player.pl.points.add(1).pow(TUNING.row1.leanExp))
            )
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": {
                content: ["upgrades"],
            },
            "Deep Work": {
                content: ["upgrades"],
            },
            "Milestones": {
                content: ["milestones"],
            },
        },
    },

    upgrades: {
        11: {
            title() { return L("Counter-Load", "反向承载") },
            description() { return L("Counterpillar gain ×2.", "反柱获取 ×2。") },
            cost: new Decimal(1),
        },
        12: {
            title() { return L("Counter-Standing", "反向自立") },
            description() { return L("Counterpillar wall start ×2.", "反柱之墙起点 ×2。") },
            cost: new Decimal(3),
            unlocked() { return hasUpgrade(this.layer, 11) },
        },
        13: {
            title() { return L("Buttress", "扶壁") },
            description() { return L("Pillar wall start ×2.", "柱之墙起点 ×2。") },
            cost: new Decimal(10),
            unlocked() { return hasUpgrade(this.layer, 12) },
        },
        14: {
            title() { return L("Reaction Force", "反作用力") },
            description() { return L("Force gain ×1.5.", "力获取 ×1.5。") },
            cost: new Decimal(150),
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        15: {
            title() { return L("Strained Arch", "受压拱") },
            description() { return L("Counterpillar gain is boosted by your Strain (log-shaped).", "反柱获取受应变加成（对数形）。") },
            cost: new Decimal(800),
            unlocked() { return hasUpgrade(this.layer, 14) },
            effect() { return player.st.points.add(1).log10().add(1).pow(2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        21: {
            title() { return L("Tension Core", "受张核心") },
            description() { return L("Counterpillar gain is boosted by unspent Counterpillars (softcapped).", "反柱获取受未支出反柱加成（软上限）。") },
            cost: new Decimal(2e3),
            unlocked() { return hasUpgrade(this.layer, 15) },
            effect() {
                var e = player.pt.points.add(1).pow(0.4)
                if (e.gte(1e4)) e = e.sqrt().times(100)
                return e
            },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        22: {
            title() { return L("Second Span", "第二跨") },
            description() { return L("Counterpillar wall start ×2.", "反柱之墙起点 ×2。") },
            cost: new Decimal(2e4),
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
        23: {
            title() { return L("Cross-Brace", "交叉支撑") },
            description() { return L("Pillar gain ×2.", "柱获取 ×2。") },
            cost: new Decimal(2e6),
            unlocked() { return hasUpgrade(this.layer, 22) },
        },
        24: {
            title() { return L("Mutual Strain", "互应") },
            description() { return L("Counterpillar gain is boosted by your Pillars (log-shaped).", "反柱获取受柱加成（对数形）。") },
            cost: new Decimal(2e8),
            unlocked() { return hasUpgrade(this.layer, 23) },
            effect() { return player.pl.points.add(1).log10().add(1).pow(2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        25: {
            title() { return L("Full Reaction", "全力反推") },
            description() { return L("Stress gain ×2.", "应力获取 ×2。") },
            cost: new Decimal(2e11),
            unlocked() { return hasUpgrade(this.layer, 24) },
        },
    },

    milestones: {
        0: {
            requirementDescription() { return L("40 Counterpillars", "40 反柱") },
            effectDescription() { return L("Raising a Pillar no longer resets anything below.", "立柱不再重置任何下层。") },
            done() { return player[this.layer].best.gte(40) },
        },
        1: {
            requirementDescription() { return L("150 Counterpillars", "150 反柱") },
            effectDescription() { return L("Force gain ×2.", "力获取 ×2。") },
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].best.gte(150) },
        },
        2: {
            requirementDescription() { return L("1,000 Counterpillars", "1,000 反柱") },
            effectDescription() { return L("Stress gain ×2.", "应力获取 ×2。") },
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(1e3) },
        },
        3: {
            requirementDescription() { return L("1e4 Counterpillars", "1e4 反柱") },
            effectDescription() { return L("Counterpillar gain ×5.", "反柱获取 ×5。") },
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].best.gte(1e4) },
        },
    },
})
