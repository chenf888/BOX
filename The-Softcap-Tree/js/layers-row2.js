// ============================================================
// Row 2 — Time Wall 时间墙 / Gravity 引力 / Work Hardening 加工硬化 / Recursion 回套
// tw: the explicit wall (bar fills only while suppressed → Breakthroughs).
// gr: coupling wells — caps read other layers' overflow.
// in: caps rise with time spent above them. nc: the caps' caps.
// ============================================================

addLayer("tw", {
    name() { return L("Time Wall", "时间墙") },
    symbol: "TW",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),      // unused (type none) — required field
        breakthroughs: new Decimal(0), // NEVER resets — the wall's memory
        barProgress: new Decimal(0),   // seconds-of-wall pushed into the current breakthrough
    }},
    color: "#ff8a65",
    resource() { return L("Breakthroughs", "突破") },
    row: 2,
    position: 0,
    type: "none",

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            layerDataReset(this.layer, ["unlocked", "auto", "breakthroughs", "barProgress"])
        }
    },

    update(diff) {
        var diff = new Decimal(diff)
        // unlock is written centrally in st.update (F28: update() runs for locked layers)
        if (!player[this.layer].unlocked) return
        // THE explicit time wall: fills only while the Force wall is suppressing you
        var rate = barFillRate()
        if (hasUpgrade("th", 25)) rate = rate.times(2)
        if (hasUpgrade("tw", 11)) rate = rate.times(1.5)
        if (hasUpgrade("tw", 14)) rate = rate.times(2)
        player.tw.barProgress = player.tw.barProgress.add(rate.times(diff))
        // full bar → +1 Breakthrough; the next wall is longer (fillGrowth, capped)
        var guard = 0
        while (player.tw.barProgress.gte(barFillTime(player.tw.breakthroughs)) && guard < 1000) {
            player.tw.barProgress = player.tw.barProgress.sub(barFillTime(player.tw.breakthroughs))
            player.tw.breakthroughs = player.tw.breakthroughs.add(1)
            guard++
        }
    },

    bars: {
        wall: {
            direction: RIGHT,
            width: 400,
            height: 40,
            progress() {
                return player.tw.barProgress.div(barFillTime(player.tw.breakthroughs)).min(1).toNumber()
            },
            display() {
                var need = barFillTime(player.tw.breakthroughs)
                return L(
                    "Breakthrough " + formatWhole(player.tw.breakthroughs.add(1)) + ": " +
                    format(player.tw.barProgress) + " / " + format(need) + " s of wall-pushing" +
                    " (fill rate ×" + format(barFillRate()) + "/s)",
                    "第 " + formatWhole(player.tw.breakthroughs.add(1)) + " 次突破：" +
                    format(player.tw.barProgress) + " / " + format(need) + " 秒顶墙进度" +
                    "（充能速率 ×" + format(barFillRate()) + "/秒）"
                )
            },
            fillStyle: { 'background-color': "#ff8a65" },
            baseStyle: { 'background-color': "#4a3530" },
            textStyle: { 'color': "#fff" },
            unlocked() { return true },
        },
    },

    layerShown() { return player.tw.unlocked },
    branches: ["st", "th"],

    tabFormat: [
        ["infobox", "wallNotice"],
        ["bar", "wall"],
        ["display-text", function() {
            return L(
                "The bar fills ONLY while a wall suppresses you — waiting against softcaps is the whole game.",
                "进度条只在你被软上限压制时充能——顶着墙等待就是游戏本身。"
            )
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    infoboxes: {
        wallNotice: {
            title() { return L("The Time Wall", "时间墙") },
            body() { return L(
                "Each full bar = 1 Breakthrough, and each Breakthrough makes the next wall longer (×1.5, capped at 30 min at pace 1). " +
                "Breakthroughs and bar progress NEVER reset. Set your preferred wall length in Options.",
                "每充满一次 = 1 突破，且每次突破都会让下一面墙更长（×1.5，在节奏 1 时封顶 30 分钟）。突破与进度条永不重置。可在选项里设定喜好的墙长。"
            )},
        },
    },
    microtabs: {
        stuff: {
            "Upgrades": {
                content: [
                    ["display-text", function() {
                        return "<h3 style='color:#ff8a65'>" + format(player.tw.breakthroughs) + " " + L("Breakthroughs", "突破") + "</h3>"
                    }],
                    ["blank", "10px"],
                    "upgrades",
                ],
            },
            "Deep Wall": {
                content: ["upgrades"],
            },
            "Milestones": {
                content: ["milestones"],
            },
        },
    },

    upgrades: {
        11: {
            title() { return L("Rhythm", "节律") },
            description() { return L("The wall bar fills ×1.5 faster.", "墙充能 ×1.5。") },
            cost: new Decimal(1),
        },
        12: {
            title() { return L("Breach Everywhere", "处处破墙") },
            description() { return L("ALL wall caps ×2.", "所有墙上限 ×2。") },
            cost: new Decimal(2),
            unlocked() { return hasUpgrade(this.layer, 11) },
        },
        13: {
            title() { return L("Softer Wall", "更软的墙") },
            description() { return L("Force suppression exponent −0.02.", "力压制指数 −0.02。") },
            cost: new Decimal(4),
            unlocked() { return hasUpgrade(this.layer, 12) },
        },
        14: {
            title() { return L("Steady Pace", "稳态节奏") },
            description() { return L("The wall bar fills ×2 faster.", "墙充能 ×2。") },
            cost: new Decimal(8),
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        15: {
            title() { return L("Wall Wages", "墙之工资") },
            description() { return L("Stress gain ×3.", "应力获取 ×3。") },
            cost: new Decimal(16),
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        21: {
            title() { return L("Pushed Through", "推过去的东西") },
            description() { return L("Force gain is boosted by your Breakthroughs.", "力获取受突破加成。") },
            cost: new Decimal(32),
            unlocked() { return hasUpgrade(this.layer, 15) },
            effect() { return player.tw.breakthroughs.add(1).pow(0.4) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        22: {
            title() { return L("Second Breach", "再破一次") },
            description() { return L("ALL wall caps ×2.", "所有墙上限 ×2。") },
            cost: new Decimal(64),
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
        23: {
            title() { return L("Momentum", "势头") },
            description() { return L("Force gain ×3.", "力获取 ×3。") },
            cost: new Decimal(128),
            unlocked() { return hasUpgrade(this.layer, 22) },
        },
        24: {
            title() { return L("Concentrated Flow", "汇聚之流") },
            description() { return L("Strain gain ×3.", "应变获取 ×3。") },
            cost: new Decimal(1024),
            unlocked() { return hasUpgrade(this.layer, 23) },
        },
        25: {
            title() { return L("Harden While Waiting", "等待中硬化") },
            description() { return L("Hardening rate ×2.", "硬化速率 ×2。") },
            cost: new Decimal("1e8"),
            currencyDisplayName() { return L("Strain", "应变") },
            currencyInternalName: "points",
            currencyLayer: "st",
            unlocked() { return hasUpgrade(this.layer, 24) },
        },
    },

    milestones: {
        0: {
            requirementDescription() { return L("2 Breakthroughs", "2 突破") },
            effectDescription() { return L("Threshold, Pillar and Counterpillar gain ×2.", "阈值、柱、反柱获取 ×2。") },
            done() { return player[this.layer].breakthroughs.gte(2) },
        },
        1: {
            requirementDescription() { return L("6 Breakthroughs", "6 突破") },
            effectDescription() { return L("Automatically buy the Strain layer's Resonance (closed-form buyMax).", "自动购买应变层共振（闭式买满）。") },
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].breakthroughs.gte(6) },
        },
        2: {
            requirementDescription() { return L("10 Breakthroughs", "10 突破") },
            effectDescription() { return L("ALL wall caps ×5.", "所有墙上限 ×5。") },
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].breakthroughs.gte(10) },
        },
        3: {
            requirementDescription() { return L("15 Breakthroughs", "15 突破") },
            effectDescription() { return L("Stress gain ×3.", "应力获取 ×3。") },
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].breakthroughs.gte(15) },
        },
    },
})

// ------------------------------------------------------------
// Gravity 引力 — coupling wells: caps gain terms fed by other
// layers' overflow. The web tightens.
// ------------------------------------------------------------

addLayer("gr", {
    name() { return L("Gravity", "引力") },
    symbol: "GR",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#a5d6a7",
    resource() { return L("Leverage", "杠杆") },
    row: 2,
    position: 1,

    baseResource() { return L("Thresholds", "阈值") },
    baseAmount() { return player.th.points },
    requires: new Decimal(1e6),
    type: "normal",
    exponent: 0.25,

    softcap() { return row2CapStart() },
    softcapPower() { return new Decimal(TUNING.row2.softcapPow) },

    gainMult() {
        var m = new Decimal(1)
        m = m.times(buyableEffect("th", 11))                // the Threshold Engine feeds Gravity
        if (hasUpgrade("gr", 11)) m = m.times(2)
        if (hasUpgrade("gr", 15)) m = m.times(upgradeEffect("gr", 15))
        if (hasUpgrade("gr", 23)) m = m.times(5)
        if (hasMilestone("tw", 0)) m = m.times(2)
        if (hasMilestone("mf", 0)) m = m.times(5)
        if (hasAchievement("ac", 16)) m = m.times(2)
        return m
    },
    gainExp() { return new Decimal(mfTune(6)) },

    autoPrestige() { return hasMilestone("mf", 4) },
    autoUpgrade() { return hasMilestone("mf", 4) },
    resetsNothing() { return hasMilestone("mf", 4) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            var keep = ["unlocked", "auto", "best", "total"]
            if (hasMilestone("mf", 2)) keep.push("upgrades", "milestones", "buyables")
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return player.gr.unlocked },
    branches: ["th"],

    hotkeys: [
        { key: "g", description() { return L("G: Pull Leverage", "G：撬动杠杆") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    resetDescription() { return L("Pull for ", "撬动 ") },

    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            return L(
                "Coupling wells active: " + (hasUpgrade("gr", 12) ? "Force wall ← Strain overflow" : "none yet") +
                (hasUpgrade("gr", 13) ? " (strength ^" + (TUNING.st.wellExp + 0.04) + ")" : "") ,
                "耦合井状态：" + (hasUpgrade("gr", 12) ? "力之墙 ← 应变溢出" : "尚无") +
                (hasUpgrade("gr", 13) ? "（强度 ^" + (TUNING.st.wellExp + 0.04) + "）" : "")
            )
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    microtabs: {
        stuff: {
            "Wells": {
                content: [
                    ["display-text", function() { return L("Each well welds one cap to another layer's overflow — caps interact.", "每一口井把一个上限焊到另一层的溢出上——上限互相影响。") }],
                    ["blank", "10px"],
                    "upgrades",
                ],
            },
            "Deep Wells": {
                content: ["upgrades"],
            },
            "Milestones": {
                content: ["milestones"],
            },
        },
    },

    upgrades: {
        11: {
            title() { return L("First Well", "第一口井") },
            description() { return L("Leverage gain ×2.", "杠杆获取 ×2。") },
            cost: new Decimal(1),
        },
        12: {
            title() { return L("Strain Well", "应变井") },
            description() { return L("Force wall cap also scales with Strain overflow (^0.08).", "力之墙上限额外受应变溢出加成（^0.08）。") },
            cost: new Decimal(2),
            unlocked() { return hasUpgrade(this.layer, 11) },
        },
        13: {
            title() { return L("Deeper Well", "更深的井") },
            description() { return L("Strain well strength ^0.08 → ^0.12.", "应变井强度 ^0.08 → ^0.12。") },
            cost: new Decimal(5),
            unlocked() { return hasUpgrade(this.layer, 12) },
        },
        14: {
            title() { return L("Threshold Well", "阈值井") },
            description() { return L("Threshold gain ×3.", "阈值获取 ×3。") },
            cost: new Decimal(20),
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        15: {
            title() { return L("Gravity Reservoir", "引力储备") },
            description() { return L("Leverage gain is boosted by your Thresholds (log-shaped).", "杠杆获取受阈值加成（对数形）。") },
            cost: new Decimal(100),
            unlocked() { return hasUpgrade(this.layer, 14) },
            effect() { return player.th.points.add(1).log10().add(1).pow(2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        21: {
            title() { return L("Pillar Well", "柱井") },
            description() { return L("Pillar wall start ×2.", "柱之墙起点 ×2。") },
            cost: new Decimal(1e3),
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
        22: {
            title() { return L("Counterpillar Well", "反柱井") },
            description() { return L("Counterpillar wall start ×2.", "反柱之墙起点 ×2。") },
            cost: new Decimal(1e4),
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
        23: {
            title() { return L("Massive Leverage", "巨杠杆") },
            description() { return L("Leverage gain ×5.", "杠杆获取 ×5。") },
            cost: new Decimal(1e7),
            unlocked() { return hasUpgrade(this.layer, 22) },
        },
        24: {
            title() { return L("Stress Well", "应力井") },
            description() { return L("Stress gain ×3.", "应力获取 ×3。") },
            cost: new Decimal(1e9),
            unlocked() { return hasUpgrade(this.layer, 23) },
        },
        25: {
            title() { return L("Threshold Ceiling", "阈值天花板") },
            description() { return L("Threshold softcap start ×10.", "阈值软上限起点 ×10。") },
            cost: new Decimal(7), // deliberate cheap key drop mid-ladder (11 §3.2)
            unlocked() { return hasUpgrade(this.layer, 24) },
        },
    },

    milestones: {
        0: {
            requirementDescription() { return L("10 Leverage", "10 杠杆") },
            effectDescription() { return L("Strain gain ×2.", "应变获取 ×2。") },
            done() { return player[this.layer].best.gte(10) },
        },
        1: {
            requirementDescription() { return L("50 Leverage", "50 杠杆") },
            effectDescription() { return L("Threshold, Pillar and Counterpillar gain ×3.", "阈值、柱、反柱获取 ×3。") },
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].best.gte(50) },
        },
        2: {
            requirementDescription() { return L("200 Leverage", "200 杠杆") },
            effectDescription() { return L("Automatically prestige Threshold/Pillar/Counterpillar; their upgrades, milestones and buyables survive resets.", "自动声望阈值/柱/反柱；其升级、里程碑与可购买项在重置后保留。") },
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(200) },
        },
        3: {
            requirementDescription() { return L("1,000 Leverage", "1,000 杠杆") },
            effectDescription() { return L("ALL wall caps ×10.", "所有墙上限 ×10。") },
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].best.gte(1e3) },
        },
    },
})

// ------------------------------------------------------------
// Work Hardening 加工硬化 — caps RISE with time spent above
// them. Waiting is literally the upgrade.
// ------------------------------------------------------------

addLayer("in", {
    name() { return L("Work Hardening", "加工硬化") },
    symbol: "IN",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        harden: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
        // [0]=Force wall, [1]=Thresholds, [2]=Pillar, [3]=Counterpillar
    }},
    color: "#ffd54f",
    resource() { return L("Hardening", "硬化") },
    row: 2,
    position: 2,

    baseResource() { return L("Pillars & Counterpillars (the weaker one)", "柱与反柱（较弱者）") },
    baseAmount() { return player.pl.points.min(player.pt.points) },
    requires: new Decimal(1e4),
    type: "normal",
    exponent: 0.25,

    softcap() { return row2CapStart() },
    softcapPower() { return new Decimal(TUNING.row2.softcapPow) },

    gainMult() {
        var m = new Decimal(1)
        if (hasUpgrade("in", 11)) m = m.times(2)
        if (hasUpgrade("in", 23)) m = m.times(5)
        if (hasMilestone("tw", 0)) m = m.times(2)
        if (hasMilestone("mf", 0)) m = m.times(5)
        if (hasAchievement("ac", 17)) m = m.times(2)
        return m
    },
    gainExp() { return new Decimal(1) },

    autoPrestige() { return hasMilestone("mf", 4) },
    autoUpgrade() { return hasMilestone("mf", 4) },
    resetsNothing() { return hasMilestone("mf", 4) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            // F18: arrays cannot ride the keep list — copy aside, reset, reassign
            var hardenCopy = [
                player.in.harden[0], player.in.harden[1], player.in.harden[2], player.in.harden[3],
            ]
            var keep = ["unlocked", "auto", "best", "total"]
            if (hasMilestone("mf", 2)) keep.push("upgrades", "milestones")
            layerDataReset(this.layer, keep)
            player.in.harden = hardenCopy
        }
    },

    update(diff) {
        var diff = new Decimal(diff)
        if (!player[this.layer].unlocked) return
        // caps rise while you push against them — time-above-cap is the resource
        var cap = hardCap()
        var fracs = [
            wallSupFrac(),
            hardenFrac(tmp.th.resetGain.max(1), thSoftcapStart()),
            hardenFrac(tmp.pl.resetGain.max(1), plCapStart()),
            hardenFrac(tmp.pt.resetGain.max(1), ptCapStart()),
        ]
        for (var i = 0; i < 4; i++) {
            var g = hardeningGain(i, fracs[i]).times(diff)
            player.in.harden[i] = player.in.harden[i].add(g).min(cap)
        }
    },

    layerShown() { return player.in.unlocked },
    branches: ["pl", "pt"],

    hotkeys: [
        { key: "h", description() { return L("H: Forge Hardening", "H：锻打硬化") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    resetDescription() { return L("Forge for ", "锻打 ") },

    tabFormat: [
        ["infobox", "hardLore"],
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            return L(
                "Hardening: Force wall ×" + format(player.in.harden[0].add(1)) +
                " · Thresholds ×" + format(player.in.harden[1].add(1)) +
                " · Pillar ×" + format(player.in.harden[2].add(1)) +
                " · Counterpillar ×" + format(player.in.harden[3].add(1)) +
                "  (meta-cap " + format(hardCap()) + " — Recursion raises it)",
                "硬化：力之墙 ×" + format(player.in.harden[0].add(1)) +
                " · 阈值 ×" + format(player.in.harden[1].add(1)) +
                " · 柱 ×" + format(player.in.harden[2].add(1)) +
                " · 反柱 ×" + format(player.in.harden[3].add(1)) +
                "（元上限 " + format(hardCap()) + " —— 回套可抬升）"
            )
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    infoboxes: {
        hardLore: {
            title() { return L("Work Hardening", "加工硬化") },
            body() { return L(
                "Metal pushed past its limit gets STRONGER. Every cap in this game hardens while you strain against it — " +
                "the longer a wall holds you, the higher it rises. Hardening itself is softcapped (a cap on the cap-raiser — of course).",
                "被推过极限的金属会变得更强。本游戏中每一面上限都会在你顶撞它时硬化——墙压制你越久，它升得越高。硬化本身也有软上限（抬帽者的帽——理所当然）。"
            )},
        },
    },
    microtabs: {
        stuff: {
            "Upgrades": {
                content: ["upgrades"],
            },
            "Deep Forge": {
                content: ["upgrades"],
            },
            "Milestones": {
                content: ["milestones"],
            },
        },
    },

    upgrades: {
        11: {
            title() { return L("First Hammer", "第一锤") },
            description() { return L("Hardening gain ×2.", "硬化获取 ×2。") },
            cost: new Decimal(1),
        },
        12: {
            title() { return L("Heavier Hammer", "更重的锤") },
            description() { return L("Hardening rate ×2.", "硬化速率 ×2。") },
            cost: new Decimal(2),
            unlocked() { return hasUpgrade(this.layer, 11) },
        },
        13: {
            title() { return L("Harden the Threshold", "硬化阈值") },
            description() { return L("Thresholds harden too (their wall start rises over time).", "阈值也会硬化（其墙起点随时间上升）。") },
            cost: new Decimal(5),
            unlocked() { return hasUpgrade(this.layer, 12) },
        },
        14: {
            title() { return L("Harden the Pillars", "硬化双柱") },
            description() { return L("Pillars harden too.", "柱与反柱也会硬化。") },
            cost: new Decimal(20),
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        15: {
            title() { return L("Yield Point", "屈服点") },
            description() { return L("Hardening meta-cap ×10.", "硬化元上限 ×10。") },
            cost: new Decimal(100),
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        21: {
            title() { return L("Tempered Force", "回火之力") },
            description() { return L("Force gain is boosted by your total Hardening.", "力获取受总硬化加成。") },
            cost: new Decimal(1e3),
            unlocked() { return hasUpgrade(this.layer, 15) },
            effect() {
                var s = new Decimal(0)
                for (var i = 0; i < 4; i++) s = s.add(player.in.harden[i])
                return s.add(1).pow(0.5)
            },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        22: {
            title() { return L("Quenching", "淬火") },
            description() { return L("Hardening rate ×3.", "硬化速率 ×3。") },
            cost: new Decimal(1e4),
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
        23: {
            title() { return L("Cold Work", "冷作") },
            description() { return L("Hardening gain ×5.", "硬化获取 ×5。") },
            cost: new Decimal(1e6),
            unlocked() { return hasUpgrade(this.layer, 22) },
        },
        24: {
            title() { return L("Strain Aging", "应变时效") },
            description() { return L("Stress gain ×3.", "应力获取 ×3。") },
            cost: new Decimal(1e8),
            unlocked() { return hasUpgrade(this.layer, 23) },
        },
        25: {
            title() { return L("Aged Structure", "时效结构") },
            description() { return L("Strain gain ×5.", "应变获取 ×5。") },
            cost: new Decimal(1e11),
            unlocked() { return hasUpgrade(this.layer, 24) },
        },
    },

    milestones: {
        0: {
            requirementDescription() { return L("10 Hardening", "10 硬化") },
            effectDescription() { return L("Hardening rate ×2.", "硬化速率 ×2。") },
            done() { return player[this.layer].best.gte(10) },
        },
        1: {
            requirementDescription() { return L("50 Hardening", "50 硬化") },
            effectDescription() { return L("Pillar & Counterpillar wall start ×2.", "柱与反柱之墙起点 ×2。") },
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].best.gte(50) },
        },
        2: {
            requirementDescription() { return L("200 Hardening", "200 硬化") },
            effectDescription() { return L("Row-1 upgrades, milestones and buyables survive resets.", "第一行的升级、里程碑与可购买项在重置后保留。") },
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(200) },
        },
        3: {
            requirementDescription() { return L("1,000 Hardening", "1,000 硬化") },
            effectDescription() { return L("Automatically buy Threshold/Pillar/Counterpillar upgrades.", "自动购买阈值/柱/反柱升级。") },
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].best.gte(1e3) },
        },
    },
})

// ------------------------------------------------------------
// Recursion 回套 — the caps' caps: every cap-raise you own
// compresses the next one. Floors buy the easing.
// ------------------------------------------------------------

addLayer("nc", {
    name() { return L("Recursion", "回套") },
    symbol: "NC",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#80cbc4",
    resource() { return L("Depth", "深度") },
    row: 2,
    position: 3,

    baseResource() { return L("Strain", "应变") },
    baseAmount() { return player.st.points },
    requires: new Decimal(1e6), // R10: unlock moved to the st.update writer (1e9 strain); the LADDER BASE stays 1e6 (R4 lesson: requires prices the whole ladder)
    type: "static",
    exponent: 1,
    base: 1.7, // measured retune R1: base 2 priced floor 40 at ~1e23 strain (5 orders past peak income) — 11 §4.1
    roundUpCost: true,
    canBuyMax() { return hasUpgrade("nc", 15) },

    // static: gainMult SMALLER = cheaper
    gainMult() {
        var m = new Decimal(1)
        if (hasUpgrade("nc", 21)) m = m.times(0.8)
        if (hasMilestone("nc", 0)) m = m.times(0.9)
        if (hasMilestone("mf", 0)) m = m.times(0.7)
        return m
    },
    gainExp() { return new Decimal(mfTune(8)) },

    resetsNothing() { return hasMilestone("nc", 0) },
    autoPrestige() { return hasMilestone("mf", 4) && hasMilestone("nc", 0) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            var keep = ["unlocked", "auto", "best", "total"]
            if (hasMilestone("nc", 2)) keep.push("upgrades", "milestones")
            if (hasMilestone("mf", 2)) keep.push("upgrades", "milestones")
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return player.nc.unlocked },
    branches: ["st", "th"],

    hotkeys: [
        { key: "n", description() { return L("N: Dig a Depth floor", "N：挖一层深度") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    resetDescription() { return L("Dig for ", "挖取 ") },

    tabFormat: [
        ["infobox", "ncLore"],
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            var n = countCapRaises()
            return L(
                "You own " + n + " cap raises. Their product is compressed to ^" + metaCompExp().toFixed(3) +
                " — the more you own, the less each new one is worth. That compression IS this layer's enemy.",
                "你拥有 " + n + " 个上限抬升。其乘积被压缩至 ^" + metaCompExp().toFixed(3) +
                " —— 拥有越多，新的每一个价值越低。这个压缩正是本层的敌人。"
            )
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    infoboxes: {
        ncLore: {
            title() { return L("Caps whose caps have caps", "帽上加帽") },
            body() { return L(
                "Every cap raise in this game is itself softcapped: owning N raises compresses their product. " +
                "Depth floors buy the easing. Yes — the thing that fights the compression is itself compressed. Welcome to the tree.",
                "本游戏中每一个上限抬升本身也被软上限：拥有 N 个抬升会压缩其乘积。深度楼层购买缓解。没错——对抗压缩的东西本身也被压缩。欢迎来到这棵树。"
            )},
        },
    },
    microtabs: {
        stuff: {
            "Floors": {
                content: ["upgrades"],
            },
            "Deeper": {
                content: ["upgrades"],
            },
            "Milestones": {
                content: ["milestones"],
            },
        },
    },

    upgrades: {
        11: {
            title() { return L("Unwind I", "松绑 I") },
            description() { return L("Meta-compression eased ×1.6.", "元压缩缓解 ×1.6。") },
            cost: new Decimal(2),
        },
        12: {
            title() { return L("Unwind II", "松绑 II") },
            description() { return L("Meta-compression eased ×1.6.", "元压缩缓解 ×1.6。") },
            cost: new Decimal(4),
            unlocked() { return hasUpgrade(this.layer, 11) },
        },
        13: {
            title() { return L("Unwind III", "松绑 III") },
            description() { return L("Meta-compression eased ×2.", "元压缩缓解 ×2。") },
            cost: new Decimal(8),
            unlocked() { return hasUpgrade(this.layer, 12) },
        },
        14: {
            title() { return L("Deep Yield", "深层屈服") },
            description() { return L("Hardening meta-cap ×10.", "硬化元上限 ×10。") },
            cost: new Decimal(16),
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        15: {
            title() { return L("Powered Excavator", "动力挖掘机") },
            description() { return L("You can buy max Depth floors.", "可以买满深度楼层。") },
            cost: new Decimal(7), // deliberate cheap key drop (11 §3.2) — also the buy-max reward (P5)
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        21: {
            title() { return L("Sharper Shovel", "更利的铲") },
            description() { return L("Depth floors cost ×0.8.", "深度楼层价格 ×0.8。") },
            cost: new Decimal(32),
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
        22: {
            title() { return L("Recursive Stress", "递归应力") },
            description() { return L("Stress gain ×3.", "应力获取 ×3。") },
            cost: new Decimal(64),
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
    },

    milestones: {
        0: {
            requirementDescription() { return L("10 Depth", "10 深度") },
            effectDescription() { return L("Digging Depth no longer resets anything below; floors cost ×0.9.", "挖深度不再重置任何下层；楼层价格 ×0.9。") },
            done() { return player[this.layer].best.gte(10) },
        },
        1: {
            requirementDescription() { return L("25 Depth", "25 深度") },
            effectDescription() { return L("Meta-compression eased ×1.5.", "元压缩缓解 ×1.5。") },
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].best.gte(25) },
        },
        2: {
            requirementDescription() { return L("50 Depth", "50 深度") },
            effectDescription() { return L("Recursion upgrades & milestones survive resets.", "回套升级与里程碑在重置后保留。") },
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(50) },
        },
    },
})
