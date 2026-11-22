// ============================================================
// Row 3 — Manifold 调谐流形 / Omni Valve 总阀
// mf: one shared pool reallocating every suppression exponent (Q8 endgame, M20/P24).
// ov: total-overflow capstone; the 12-step valve chain is the win.
// ============================================================

addLayer("mf", {
    name() { return L("Manifold", "调谐流形") },
    symbol: "MF",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        tuning: [new Decimal(10), new Decimal(10), new Decimal(10), new Decimal(10),
                 new Decimal(10), new Decimal(10), new Decimal(10), new Decimal(10), new Decimal(10)],
        // slot levels live in buyables 11..19 (engine-managed); this array is the default for fixData only
    }},
    color: "#f48fb1",
    resource() { return L("Tuning", "调谐") },
    row: 3,
    position: 0,
    type: "custom",

    baseResource() { return L("Total overflow", "总溢出") },
    baseAmount() { return totalOverflow() },
    requires: new Decimal(1),

    getResetGain() { return mfResetGainVal() },
    getNextAt(canMax) { return mfNextAtVal() },
    canReset() {
        // log-1 floor: enough composite for gain ≥ 1 (never-gate bug fixed — R5);
        // pure overflow (R14 unification: the raw strain stock was double-counted here
        // while mfResetGainVal measures overflow only, and ov never added it)
        return totalOverflow().max(1).log10().gte(1)
    },
    simProbeGates() {
        return [
            ["comp", totalOverflow().max(1), new Decimal(0)],
            ["mfGainRaw", mfResetGainVal(), new Decimal(0)],
            ["F/T_st", player.points.div(strainCap()).max(0), new Decimal(0)],
            ["strain/thStart", player.st.points.div(thSoftcapStart()).max(0), new Decimal(0)],
            ["pl/start", player.pl.points.div(plCapStart()).max(0), new Decimal(0)],
            ["pt/start", player.pt.points.div(ptCapStart()).max(0), new Decimal(0)],
            ["gr/r2start", player.gr.points.div(row2CapStart()).max(0), new Decimal(0)],
            ["in/r2start", player.in.points.div(row2CapStart()).max(0), new Decimal(0)],
            ["Force", player.points, new Decimal(0)],
            ["strain", player.st.points, new Decimal(0)],
            ["stress", player.st.stress, new Decimal(0)],
        ]
    },
    prestigeNotify() { return this.canReset() },
    prestigeButtonText() {
        return L("Open the manifold for ", "开启流形换取 ") + "<b>" + format(tmp.mf.resetGain) + "</b> " + L("Tuning", "调谐") +
            "<br>(" + L("needs total overflow log ≥ ", "需要总溢出对数 ≥ ") + format(mfNextAtVal().log10()) + ")"
    },

    resetsNothing() { return hasMilestone("mf", 4) },
    autoPrestige() { return hasMilestone("mf", 4) },
    autoUpgrade() { return hasMilestone("mf", 4) },

    doReset(resettingLayer) {
        // vanilla guard (07 Step 3.5): only a DEEPER row sweeps this layer
        if (!(layers[resettingLayer].row > this.row)) return
        // slot levels live in engine-managed buyables; keep them plus the ladder records
        layerDataReset(this.layer, ["unlocked", "auto", "best", "total", "buyables"])
        if (hasMilestone("ov", 8)) layerDataReset(this.layer, ["unlocked", "auto", "best", "total", "buyables", "upgrades", "milestones"])
    },

    layerShown() { return player.mf.unlocked },
    branches: ["tw", "gr", "in", "nc"],

    hotkeys: [
        { key: "m", description() { return L("M: Open the Manifold", "M：开启调谐流形") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    resetDescription() { return L("Open for ", "开启换 ") },

    tabFormat: [
        ["infobox", "mfLore"],
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            return L(
                "Pool: " + format(mfPoolUsed()) + " / " + format(mfPoolMax()) + " level-points across 9 resources (default 10 = neutral). The wall itself (Breakthroughs) cannot be tuned.",
                "池：" + format(mfPoolUsed()) + " / " + format(mfPoolMax()) + " 级点，分布于 9 种资源（默认 10 = 中性）。墙本身（突破）不可调谐。"
            )
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    infoboxes: {
        mfLore: {
            title() { return L("The Tuning Manifold", "调谐流形") },
            body() { return L(
                "Nine resources share ONE pool of level-points. Level 10 is neutral; above 10 strengthens that resource's gain exponent, below 10 weakens it — and the pool is zero-sum. " +
                "This is the endgame: you finally decide which walls breathe and which ones clamp down.",
                "九种资源共享一个级点池。10 级为中性；高于 10 强化该资源的获取指数，低于 10 削弱——而池是零和的。这就是终局：由你决定哪些墙松一口气，哪些墙继续收紧。"
            )},
        },
    },
    microtabs: {
        stuff: {
            "Manifold": {
                content: [
                    ["display-text", function() {
                        return L("Click a slot to spend +1 level from the pool; Sell One refunds a level (floor 5).", "点击槽位从池中花 1 级点；卖出一档返还 1 级（下限 5）。")
                    }],
                    ["blank", "10px"],
                    "buyables",
                ],
            },
            "Upgrades": {
                content: ["upgrades"],
            },
            "Milestones": {
                content: ["milestones"],
            },
        },
    },

    buyables: {
        11: {
            title() { return L("Force slot", "力槽位") },
            display() { return mfSlotDisplay(0, "Force", "力") },
            canAfford() { return mfPoolUsed().add(1).lte(mfPoolMax()) && getBuyableAmount("mf", 11).lt(30) },
            buy() { setBuyableAmount("mf", 11, getBuyableAmount("mf", 11).add(1)) },
            sellOne() { if (getBuyableAmount("mf", 11).gt(5)) setBuyableAmount("mf", 11, getBuyableAmount("mf", 11).sub(1)) },
            unlocked() { return true },
        },
        12: {
            title() { return L("Strain slot", "应变槽位") },
            display() { return mfSlotDisplay(1, "Strain", "应变") },
            canAfford() { return mfPoolUsed().add(1).lte(mfPoolMax()) && getBuyableAmount("mf", 12).lt(30) },
            buy() { setBuyableAmount("mf", 12, getBuyableAmount("mf", 12).add(1)) },
            sellOne() { if (getBuyableAmount("mf", 12).gt(5)) setBuyableAmount("mf", 12, getBuyableAmount("mf", 12).sub(1)) },
            unlocked() { return true },
        },
        13: {
            title() { return L("Stress slot", "应力槽位") },
            display() { return mfSlotDisplay(2, "Stress", "应力") },
            canAfford() { return mfPoolUsed().add(1).lte(mfPoolMax()) && getBuyableAmount("mf", 13).lt(30) },
            buy() { setBuyableAmount("mf", 13, getBuyableAmount("mf", 13).add(1)) },
            sellOne() { if (getBuyableAmount("mf", 13).gt(5)) setBuyableAmount("mf", 13, getBuyableAmount("mf", 13).sub(1)) },
            unlocked() { return true },
        },
        14: {
            title() { return L("Threshold slot", "阈值槽位") },
            display() { return mfSlotDisplay(3, "Thresholds", "阈值") },
            canAfford() { return mfPoolUsed().add(1).lte(mfPoolMax()) && getBuyableAmount("mf", 14).lt(30) },
            buy() { setBuyableAmount("mf", 14, getBuyableAmount("mf", 14).add(1)) },
            sellOne() { if (getBuyableAmount("mf", 14).gt(5)) setBuyableAmount("mf", 14, getBuyableAmount("mf", 14).sub(1)) },
            unlocked() { return true },
        },
        15: {
            title() { return L("Pillar slot", "柱槽位") },
            display() { return mfSlotDisplay(4, "Pillar", "柱") },
            canAfford() { return mfPoolUsed().add(1).lte(mfPoolMax()) && getBuyableAmount("mf", 15).lt(30) },
            buy() { setBuyableAmount("mf", 15, getBuyableAmount("mf", 15).add(1)) },
            sellOne() { if (getBuyableAmount("mf", 15).gt(5)) setBuyableAmount("mf", 15, getBuyableAmount("mf", 15).sub(1)) },
            unlocked() { return true },
        },
        16: {
            title() { return L("Counterpillar slot", "反柱槽位") },
            display() { return mfSlotDisplay(5, "Counterpillar", "反柱") },
            canAfford() { return mfPoolUsed().add(1).lte(mfPoolMax()) && getBuyableAmount("mf", 16).lt(30) },
            buy() { setBuyableAmount("mf", 16, getBuyableAmount("mf", 16).add(1)) },
            sellOne() { if (getBuyableAmount("mf", 16).gt(5)) setBuyableAmount("mf", 16, getBuyableAmount("mf", 16).sub(1)) },
            unlocked() { return true },
        },
        17: {
            title() { return L("Leverage slot", "杠杆槽位") },
            display() { return mfSlotDisplay(6, "Leverage", "杠杆") },
            canAfford() { return mfPoolUsed().add(1).lte(mfPoolMax()) && getBuyableAmount("mf", 17).lt(30) },
            buy() { setBuyableAmount("mf", 17, getBuyableAmount("mf", 17).add(1)) },
            sellOne() { if (getBuyableAmount("mf", 17).gt(5)) setBuyableAmount("mf", 17, getBuyableAmount("mf", 17).sub(1)) },
            unlocked() { return true },
        },
        18: {
            title() { return L("Hardening slot", "硬化槽位") },
            display() { return mfSlotDisplay(7, "Hardening", "硬化") },
            canAfford() { return mfPoolUsed().add(1).lte(mfPoolMax()) && getBuyableAmount("mf", 18).lt(30) },
            buy() { setBuyableAmount("mf", 18, getBuyableAmount("mf", 18).add(1)) },
            sellOne() { if (getBuyableAmount("mf", 18).gt(5)) setBuyableAmount("mf", 18, getBuyableAmount("mf", 18).sub(1)) },
            unlocked() { return true },
        },
        19: {
            title() { return L("Depth slot", "深度槽位") },
            display() { return mfSlotDisplay(8, "Depth", "深度") },
            canAfford() { return mfPoolUsed().add(1).lte(mfPoolMax()) && getBuyableAmount("mf", 19).lt(30) },
            buy() { setBuyableAmount("mf", 19, getBuyableAmount("mf", 19).add(1)) },
            sellOne() { if (getBuyableAmount("mf", 19).gt(5)) setBuyableAmount("mf", 19, getBuyableAmount("mf", 19).sub(1)) },
            unlocked() { return true },
        },
    },

    upgrades: {
        11: {
            title() { return L("Wider Pool", "更宽的池") },
            description() { return L("Tuning pool +30.", "调谐池 +30。") },
            cost: new Decimal(10),
        },
        12: {
            title() { return L("Sharper Valve", "更利的阀") },
            description() { return L("Manifold exponent steps sharpen (1/50 → 1/45).", "流形指数步长变细（1/50 → 1/45）。") },
            cost: new Decimal(100),
            unlocked() { return hasUpgrade(this.layer, 11) },
        },
        13: {
            title() { return L("Tuning Pressure", "调谐压力") },
            description() { return L("Tuning gain ×5.", "调谐获取 ×5。") },
            cost: new Decimal(1e3),
            unlocked() { return hasUpgrade(this.layer, 12) },
        },
        14: {
            title() { return L("Wider Still", "更宽依旧") },
            description() { return L("Tuning pool +30.", "调谐池 +30。") },
            cost: new Decimal(1e5),
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        15: {
            title() { return L("Flow Geometry", "流形几何") },
            description() { return L("Tuning gain ^1.1 (softcapped).", "调谐获取 ^1.1（软上限）。") },
            cost: new Decimal(1e8),
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        21: {
            title() { return L("Master Flow", "主流形") },
            description() { return L("Tuning gain ×10.", "调谐获取 ×10。") },
            cost: new Decimal(1e12),
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
    },

    milestones: {
        0: {
            requirementDescription() { return L("10 Tuning", "10 调谐") },
            effectDescription() { return L("The manifold comes online: all tuning slots apply; Threshold/Pillar/Counterpillar/Leverage/Hardening gain ×5.", "流形上线：所有槽位生效；阈值/柱/反柱/杠杆/硬化获取 ×5。") },
            done() { return player[this.layer].best.gte(10) },
        },
        1: {
            requirementDescription() { return L("25 Tuning", "25 调谐") },
            effectDescription() { return L("Force gain ×10.", "力获取 ×10。") },
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].best.gte(25) },
        },
        2: {
            requirementDescription() { return L("40 Tuning", "40 调谐") },
            effectDescription() { return L("Every layer keeps its upgrades, milestones and buyables on reset.", "所有层的升级、里程碑与可购买项在重置后保留。") },
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(40) },
        },
        3: {
            requirementDescription() { return L("60 Tuning", "60 调谐") },
            effectDescription() { return L("Tuning gain ×5.", "调谐获取 ×5。") },
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].best.gte(60) },
        },
        4: {
            requirementDescription() { return L("100 Tuning", "100 调谐") },
            effectDescription() { return L("The Manifold automates itself (prestige + upgrades + resets nothing).", "流形自自动化（声望 + 升级 + 不再重置任何层）。") },
            unlocked() { return hasMilestone(this.layer, 3) },
            done() { return player[this.layer].best.gte(100) },
        },
    },
})

// ------------------------------------------------------------
// Omni Valve 总阀 — the capstone. Push EVERY wall at once.
// ------------------------------------------------------------

addLayer("ov", {
    name() { return L("Omni Valve", "总阀") },
    symbol: "OV",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#fff176",
    resource() { return L("Valves", "阀门") },
    row: 3,
    position: 1,
    type: "custom",

    baseResource() { return L("Total overflow", "总溢出") },
    baseAmount() { return totalOverflow() },
    requires: new Decimal(1),

    getResetGain() { return ovGainVal() },
    getNextAt(canMax) { return ovNextAtVal() },
    canReset() {
        return totalOverflow().max(1).log10().gte(1)
    },
    prestigeNotify() { return this.canReset() },
    prestigeButtonText() {
        return L("Turn the Omni Valve: ", "转动总阀：") + "<b>" + format(tmp.ov.resetGain) + "</b> " + L("Valves", "阀门") +
            "<br>(" + L("needs total overflow log ≥ ", "需要总溢出对数 ≥ ") + format(ovNextAtVal().log10()) + ")"
    },

    resetsNothing() { return hasMilestone("ov", 8) },
    autoPrestige() { return hasMilestone("ov", 8) }, // m8 package: safe by construction (same milestone as resetsNothing)

    doReset(resettingLayer) {
        // vanilla guard — nothing is deeper than row 3
        if (!(layers[resettingLayer].row > this.row)) return
    },

    layerShown() { return player.ov.unlocked },
    branches: ["mf"],

    hotkeys: [
        { key: "v", description() { return L("V: Turn the Omni Valve", "V：转动总阀") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    resetDescription() { return L("Turn for ", "转动换 ") },

    tabFormat: [
        ["infobox", "ovLore"],
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            return L(
                "Total overflow: " + format(totalOverflow()) + " — the sum of every layer pushed past its wall. Turn them ALL at once.",
                "总溢出：" + format(totalOverflow()) + " —— 所有层越过各自墙的量之和。把它们同时推过墙。"
            )
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    infoboxes: {
        ovLore: {
            title() { return L("The Master Valve", "总阀") },
            body() { return L(
                "Every wall in the tree feeds this one number: total overflow. The valve chain opens it piece by piece — " +
                "twelve turns and the tree is yours.",
                "树中每一面墙都汇入这一个数：总溢出。阀门链一节一节把它打开——转动十二次，这棵树就是你的了。"
            )},
        },
    },
    microtabs: {
        stuff: {
            "Upgrades": {
                content: ["upgrades"],
            },
            "Deep Valves": {
                content: ["upgrades"],
            },
            "Valve Chain": {
                content: ["milestones"],
            },
        },
    },

    upgrades: {
        11: {
            title() { return L("First Turn", "第一转") },
            description() { return L("Valve gain ×2.", "阀门获取 ×2。") },
            cost: new Decimal(1),
        },
        12: {
            title() { return L("Pressure Release", "泄压") },
            description() { return L("ALL wall caps ×2.", "所有墙上限 ×2。") },
            cost: new Decimal(3),
            unlocked() { return hasUpgrade(this.layer, 11) },
        },
        13: {
            title() { return L("Fine Threading", "细螺纹") },
            description() { return L("Force suppression exponent −0.01.", "力压制指数 −0.01。") },
            cost: new Decimal(10),
            unlocked() { return hasUpgrade(this.layer, 12) },
        },
        14: {
            title() { return L("Oiled Gears", "上油的齿轮") },
            description() { return L("Hardening rate ×3.", "硬化速率 ×3。") },
            cost: new Decimal(1e2),
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        15: {
            title() { return L("Steam Burst", "蒸汽爆发") },
            description() { return L("Stress gain ×5.", "应力获取 ×5。") },
            cost: new Decimal(1e4),
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        21: {
            title() { return L("Boiler Room", "锅炉房") },
            description() { return L("Force gain ×10.", "力获取 ×10。") },
            cost: new Decimal(1e7),
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
        22: {
            title() { return L("Conduit Network", "导管网络") },
            description() { return L("Strain gain ×10.", "应变获取 ×10。") },
            cost: new Decimal(1e11),
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
        23: {
            title() { return L("Pressure Manifold", "压强歧管") },
            description() { return L("Threshold, Pillar and Counterpillar gain ×10.", "阈值、柱、反柱获取 ×10。") },
            cost: new Decimal(1e16),
            unlocked() { return hasUpgrade(this.layer, 22) },
        },
        24: {
            title() { return L("Governor", "调速器") },
            description() { return L("Valve gain ×3.", "阀门获取 ×3。") },
            cost: new Decimal(1e22),
            unlocked() { return hasUpgrade(this.layer, 23) },
        },
        25: {
            title() { return L("Full Open", "全开") },
            description() { return L("ALL wall caps ×10.", "所有墙上限 ×10。") },
            cost: new Decimal(1e30),
            unlocked() { return hasUpgrade(this.layer, 24) },
        },
    },

    milestones: {
        0: {
            requirementDescription() { return L("2 Valves", "2 阀门") },
            effectDescription() { return L("Valve gain ×2.", "阀门获取 ×2。") },
            done() { return player[this.layer].best.gte(2) },
        },
        1: {
            requirementDescription() { return L("5 Valves", "5 阀门") },
            effectDescription() { return L("ALL wall caps ×5.", "所有墙上限 ×5。") },
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].best.gte(5) },
        },
        2: {
            requirementDescription() { return L("12 Valves", "12 阀门") },
            effectDescription() { return L("Hardening meta-cap ×10.", "硬化元上限 ×10。") },
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(12) },
        },
        3: {
            requirementDescription() { return L("30 Valves", "30 阀门") },
            effectDescription() { return L("ALL wall caps ×5.", "所有墙上限 ×5。") },
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].best.gte(30) },
        },
        4: {
            requirementDescription() { return L("75 Valves", "75 阀门") },
            effectDescription() { return L("Stress gain ×10.", "应力获取 ×10。") },
            unlocked() { return hasMilestone(this.layer, 3) },
            done() { return player[this.layer].best.gte(75) },
        },
        5: {
            requirementDescription() { return L("200 Valves", "200 阀门") },
            effectDescription() { return L("Tuning pool +30.", "调谐池 +30。") },
            unlocked() { return hasMilestone(this.layer, 4) },
            done() { return player[this.layer].best.gte(200) },
        },
        6: {
            requirementDescription() { return L("600 Valves", "600 阀门") },
            effectDescription() { return L("Hardening rate ×5.", "硬化速率 ×5。") },
            unlocked() { return hasMilestone(this.layer, 5) },
            done() { return player[this.layer].best.gte(600) },
        },
        7: {
            requirementDescription() { return L("2,000 Valves", "2,000 阀门") },
            effectDescription() { return L("Force suppression exponent −0.01.", "力压制指数 −0.01。") },
            unlocked() { return hasMilestone(this.layer, 6) },
            done() { return player[this.layer].best.gte(2000) },
        },
        8: {
            requirementDescription() { return L("6,000 Valves", "6,000 阀门") },
            effectDescription() { return L("Turning the Omni Valve resets nothing below.", "转动总阀不再重置任何下层。") },
            unlocked() { return hasMilestone(this.layer, 7) },
            done() { return player[this.layer].best.gte(6000) },
        },
        9: {
            requirementDescription() { return L("20,000 Valves", "20,000 阀门") },
            effectDescription() { return L("Tuning pool effectively unlimited (+1e5).", "调谐池实际上无限制（+1e5）。") },
            unlocked() { return hasMilestone(this.layer, 8) },
            done() { return player[this.layer].best.gte(20000) },
        },
        10: {
            requirementDescription() { return L("100,000 Valves", "100,000 阀门") },
            effectDescription() { return L("Valve gain ×3.", "阀门获取 ×3。") },
            unlocked() { return hasMilestone(this.layer, 9) },
            done() { return player[this.layer].best.gte(100000) },
        },
        11: {
            requirementDescription() { return L("2,000,000 Valves — The Master Valve", "2,000,000 阀门 —— 总阀") },
            effectDescription() { return L("ENDGAME: the Master Valve opens.", "终局：总阀开启。") },
            unlocked() { return hasMilestone(this.layer, 10) },
            done() { return player[this.layer].best.gte(2e6) },
        },
    },
})
