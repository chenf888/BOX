// js/layers-row2.js — bark (static floors), blossom (static blooms + layer web), sap (custom shop). Brief §4.

// ---------------------------------------------------------------- bark (row 2, static)
addLayer("bark", {
    name: "Bark",
    symbol: "皮",
    color: "#b08d6e",
    resource() { return tt("Bark", "树皮") },
    row: 2,
    position: 0,
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },

    baseResource() { return tt("branches", "树枝") },
    baseAmount() { return player.branch.points },
    requires: new Decimal(25000),
    type: "static",
    base: 2,
    exponent: 1,
    roundUpCost: true,
    canBuyMax() { return hasMilestone("bark", 0) },   // author #24: static needs buy-max early

    // static: gainMult multiplies COST — smaller = cheaper
    gainMult() {
        let m = new Decimal(1)
        m = m.div(player.wood.best.add(1).pow(0.12))
        if (hasUpgrade("wood", 33)) m = m.div(1.3)    // Tough Bark
        if (hasUpgrade("bark", 23)) m = m.div(1.2)
        if (hasUpgrade("sap", 23)) m = m.div(1.15)
        if (hasUpgrade("canopy", 35)) m = m.div(1.2)  // Understory Light
        if (hasUpgrade("seed", 25)) m = m.div(1.15)   // Scarification
        return m
    },

    resetsNothing() { return hasMilestone("seed", 6) },           // THE package (step 10)
    autoPrestige() { return hasMilestone("seed", 6) },            // implies resetsNothing: same milestone
    autoUpgrade() { return hasMilestone("seed", 6) },             // implies resetsNothing: same milestone

    layerShown() { return player.bark.unlocked || player.branch.best.gte(30000) },
    branches: ["branch"],

    hotkeys: [
        { key: "k", description() { return tt("k: grow a layer of Bark", "k：长出一层树皮") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let kept = ["unlocked", "best", "total"]
            if (hasMilestone("seed", 6)) kept.push("upgrades", "milestones")
            if (hasMilestone("grove", 2)) kept.push("upgrades", "milestones")
            layerDataReset(this.layer, kept)
        }
    },

    tabFormat: [
        mdisp("bark"),
        "prestige-button",
        ["display-text", function () {
            return tt("Armor from: ", "护甲来自：") + format(player.branch.points) + tt(" branches. Next floor at ", " 树枝。下一层需 ") + format(tmp.bark.nextAt) + tt(" branches. Best: ", "。最多：") + format(player.bark.best)
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    microtabs: {
        stuff: {
            "Floors": { tabLabel() { return tt("Floors", "树皮层") },  content: [["blank", "10px"], "upgrades"], buttonStyle() { return { "border-color": "#b08d6e" } } },
            "Milestones": { tabLabel() { return tt("Milestones", "里程碑") },  content: [["blank", "10px"], "milestones"], buttonStyle() { return { "border-color": "#b08d6e" } } },
            "Formulae": {
                tabLabel() { return tt("Formulae", "公式") },
                unlocked() { return hasUpgrade("bark", 15) },
                content: [["blank", "10px"], ["display-text", function () {
                    return tt("Each Bark floor costs branches × base^(floors^1). Web boosts DIVIDE the cost.", "每层树皮价格 = 树枝 × 基数^(层数^1)。乘区之网会「除以」价格（越强越便宜）。")
                }]],
                buttonStyle() { return { "border-color": "#b08d6e" } },
            },
        },
    },

    prestigeButtonText() {
        return tt("Grow <b>" + formatWhole(tmp.bark.resetGain) + "</b> Bark floor(s)", "长出 <b>" + formatWhole(tmp.bark.resetGain) + "</b> 层树皮")
    },

    upgrades: {
        11: { title() { return tt("Outer Skin", "外皮") }, description() { return tt("Leaf growth ×1.5.", "树叶生长 ×1.5。") }, cost: new Decimal(1) },
        12: { title() { return tt("Thick Ridges", "厚脊") }, description() { return tt("The Wood softcap starts 10× later (visible on the tree tab).", "木头软帽起点 10×之后（树页顶部可见）。") }, cost: new Decimal(2),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        13: { title() { return tt("Windbreak", "防风林") }, description() { return tt("Branch gain ×1.5.", "树枝收益 ×1.5。") }, cost: new Decimal(3),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        14: { title() { return tt("Root Guard", "护根") }, description() { return tt("Root gain ×1.5.", "根须收益 ×1.5。") }, cost: new Decimal(4),
              unlocked() { return hasUpgrade(this.layer, 12) } },
        15: { title() { return tt("Read the Rings", "读年轮") }, description() { return tt("Reveal the Formulae tab.", "显现「公式」页签。") }, cost: new Decimal(5),
              unlocked() { return hasUpgrade(this.layer, 13) } },
        21: { title() { return tt("Fire Scar", "火疤") }, description() { return tt("Wood gain ×1.5.", "木头收益 ×1.5。") }, cost: new Decimal(6),
              unlocked() { return hasUpgrade(this.layer, 14) } },
        22: { title() { return tt("Insulation", "隔热层") }, description() { return tt("Leaf growth ×2.", "树叶生长 ×2。") }, cost: new Decimal(8),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        23: { title() { return tt("Layered Plates", "层叠甲片") }, description() { return tt("Bark floors cost 20% less.", "树皮层价格 −20%。") }, cost: new Decimal(10),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        24: { title() { return tt("Bough Brace", "枝撑") }, description() { return tt("Branch gain ×1.5.", "树枝收益 ×1.5。") }, cost: new Decimal(13),
              unlocked() { return hasUpgrade(this.layer, 22) } },
        25: { title() { return tt("Root Plate", "根甲") }, description() { return tt("Root gain ×1.5.", "根须收益 ×1.5。") }, cost: new Decimal(17),
              unlocked() { return hasUpgrade(this.layer, 23) } },
    },

    milestones: {
        0: { requirementDescription() { return tt("3 Bark floors", "3 层树皮") }, effectDescription() { return tt("Unlock buy-max for Bark; leaf growth ×1.5", "解锁树皮「买满」；树叶生长 ×1.5") },
             done() { return player.bark.best.gte(3) } },
        1: { requirementDescription() { return tt("3 Bark floors", "3 层树皮") }, effectDescription() { return tt("Wood gain ×1.5", "木头收益 ×1.5") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player.bark.best.gte(5) } },
        2: { requirementDescription() { return tt("3 Bark floors", "3 层树皮") }, effectDescription() { return tt("Branch & Root gain ×1.5", "树枝与根须收益 ×1.5") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player.bark.best.gte(8) } },
        3: { requirementDescription() { return tt("3 Bark floors", "3 层树皮") }, effectDescription() { return tt("Growth Rings (Wood buyable) are bought to max automatically", "「年轮」（木头可购项）自动买满") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player.bark.best.gte(11) } },
        4: { requirementDescription() { return tt("3 Bark floors", "3 层树皮") }, effectDescription() { return tt("Wood gain ×2", "木头收益 ×2") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player.bark.best.gte(14) } },
        5: { requirementDescription() { return tt("3 Bark floors", "3 层树皮") }, effectDescription() { return tt("All gains ×1.5", "所有收益 ×1.5") },
             unlocked() { return hasMilestone(this.layer, 4) },
             done() { return player.bark.best.gte(18) } },
    },

    automate() {   // P4 step 5 / P54: closed-form buyMax driver on wood buyable 12 (bark m3)
        if (hasMilestone("bark", 3) && layers.wood.buyables[12].buyMax) layers.wood.buyables[12].buyMax()
    },
})

// ---------------------------------------------------------------- blossom (row 2, static + layer web)
addLayer("blossom", {
    name: "Blossom",
    symbol: "花",
    color: "#f2a6c2",
    resource() { return tt("Blossoms", "花") },
    row: 2,
    position: 1,
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },

    baseResource() { return tt("roots", "根须") },
    baseAmount() { return player.root.points },
    requires: new Decimal(30000),
    type: "static",
    base: 3,
    exponent: 1,
    roundUpCost: true,
    canBuyMax() { return hasMilestone("blossom", 1) },

    gainMult() {   // smaller = cheaper
        let m = new Decimal(1)
        m = m.div(player.root.best.add(1).pow(0.12))
        if (hasUpgrade("sap", 24)) m = m.div(1.15)
        if (hasUpgrade("seed", 34)) m = m.div(1.2)      // Wind Dispersal
        if (hasUpgrade("seed", 51)) m = m.div(1.25)     // Seed Bank II
        if (hasChallenge("seed", 21)) m = m.div(1.25)   // Dry Season reward
        return m
    },

    // the per-bloom web (K3): each bloom feeds a different older layer — brief blossom u12 spirit
    effect() {
        let c = player.blossom.points.add(1).pow(0.15)
        let cw = player.blossom.points.add(1).pow(0.12)
        let cb = player.blossom.points.add(1).pow(0.1)
        let cr = player.blossom.points.add(1).pow(0.1)
        if (hasMilestone("blossom", 2)) { c = c.times(1.5); cw = cw.times(1.5); cb = cb.times(1.5); cr = cr.times(1.5) }
        if (hasUpgrade("blossom", 21)) { c = c.times(1.5); cw = cw.times(1.5); cb = cb.times(1.5); cr = cr.times(1.5) }
        return { leafBoost: c, woodBoost: cw, branchBoost: cb, rootBoost: cr }
    },
    effectDescription() {
        let e = tmp.blossom.effect
        return tt("Each bloom feeds the whole tree: leaves ×", "每一朵花滋养全树：树叶 ×") + format(e.leafBoost) +
               tt(", wood ×", "，木头 ×") + format(e.woodBoost) +
               tt(", branches ×", "，树枝 ×") + format(e.branchBoost) +
               tt(", roots ×", "，根须 ×") + format(e.rootBoost)
    },

    resetsNothing() { return hasMilestone("seed", 6) },
    autoPrestige() { return hasMilestone("seed", 6) },
    autoUpgrade() { return hasMilestone("seed", 6) },

    layerShown() { return player.blossom.unlocked || player.root.best.gte(60000) },
    branches: ["root"],

    hotkeys: [
        { key: "f", description() { return tt("f: bloom", "f：开花") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let kept = ["unlocked", "best", "total"]
            if (hasMilestone("seed", 6)) kept.push("upgrades", "milestones")
            if (hasMilestone("grove", 2)) kept.push("upgrades", "milestones")
            layerDataReset(this.layer, kept)
        }
    },

    tabFormat: [
        mdisp("blossom"),
        "prestige-button",
        ["display-text", function () {
            return tt("Fed by: ", "滋养自：") + format(player.root.points) + tt(" roots. Next bloom at ", " 根须。下一朵需 ") + format(tmp.blossom.nextAt) + tt(" roots. Best: ", "。最多：") + format(player.blossom.best)
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    microtabs: {
        stuff: {
            "Blooms": { tabLabel() { return tt("Blooms", "花朵") },  content: [["blank", "10px"], "upgrades"], buttonStyle() { return { "border-color": "#f2a6c2" } } },
            "Milestones": { tabLabel() { return tt("Milestones", "里程碑") },  content: [["blank", "10px"], "milestones"], buttonStyle() { return { "border-color": "#f2a6c2" } } },
            "Formulae": {
                tabLabel() { return tt("Formulae", "公式") },
                unlocked() { return hasUpgrade("blossom", 15) },
                content: [["blank", "10px"], ["display-text", function () {
                    return tt("Each bloom costs roots × base^(blooms^1). Every bloom feeds leaves, wood, branches and roots at once.", "每朵花价格 = 根须 × 基数^(朵数^1)。每朵花同时滋养树叶、木头、树枝与根须。")
                }]],
                buttonStyle() { return { "border-color": "#f2a6c2" } },
            },
        },
    },

    prestigeButtonText() {
        return tt("Bloom <b>" + formatWhole(tmp.blossom.resetGain) + "</b> blossom(s)", "开出 <b>" + formatWhole(tmp.blossom.resetGain) + "</b> 朵花")
    },

    upgrades: {
        11: { title() { return tt("First Bloom", "初绽") }, description() { return tt("Leaf growth ×1.5.", "树叶生长 ×1.5。") }, cost: new Decimal(1) },
        12: { title() { return tt("One Bloom Per Bough", "一枝一花") }, description() { return tt("Wood gain ×1.5.", "木头收益 ×1.5。") }, cost: new Decimal(2),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        13: { title() { return tt("Petal Drift", "落英") }, description() { return tt("Branch gain ×1.5.", "树枝收益 ×1.5。") }, cost: new Decimal(3),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        14: { title() { return tt("Root Feed", "落花护根") }, description() { return tt("Root gain ×1.5.", "根须收益 ×1.5。") }, cost: new Decimal(4),
              unlocked() { return hasUpgrade(this.layer, 12) } },
        15: { title() { return tt("Read the Season", "识季节") }, description() { return tt("Reveal the Formulae tab.", "显现「公式」页签。") }, cost: new Decimal(5),
              unlocked() { return hasUpgrade(this.layer, 13) } },
        21: { title() { return tt("Full Bloom", "盛放") }, description() { return tt("All bloom effects ×1.5.", "所有花朵效果 ×1.5。") }, cost: new Decimal(6),
              unlocked() { return hasUpgrade(this.layer, 14) } },
        22: { title() { return tt("Fruit Set", "坐果") }, description() { return tt("Wood gain ×2.", "木头收益 ×2。") }, cost: new Decimal(7),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        23: { title() { return tt("Nectar Trail", "蜜径") }, description() { return tt("Leaf growth ×1.5.", "树叶生长 ×1.5。") }, cost: new Decimal(9),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        24: { title() { return tt("Sap Rises", "树液上行") }, description() { return tt("Sap gain ×1.5.", "树液收益 ×1.5。") }, cost: new Decimal(11),
              unlocked() { return hasUpgrade(this.layer, 22) } },
        25: { title() { return tt("Pollination", "授粉") }, description() { return tt("Sap gain ×1.5.", "树液收益 ×1.5。") }, cost: new Decimal(13),
              unlocked() { return hasUpgrade(this.layer, 23) } },
    },

    milestones: {
        0: { requirementDescription() { return tt("2 Blossoms", "2 朵花") }, effectDescription() { return tt("Leaf growth ×1.5", "树叶生长 ×1.5") },
             done() { return player.blossom.best.gte(2) } },
        1: { requirementDescription() { return tt("2 Blossoms", "2 朵花") }, effectDescription() { return tt("Branch & Root prestiges no longer reset what is below; unlock buy-max", "枝与根的声望不再重置下层；解锁「买满」") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player.blossom.best.gte(4) } },
        2: { requirementDescription() { return tt("2 Blossoms", "2 朵花") }, effectDescription() { return tt("All bloom effects ×1.5", "所有花朵效果 ×1.5") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player.blossom.best.gte(6) } },
        3: { requirementDescription() { return tt("2 Blossoms", "2 朵花") }, effectDescription() { return tt("Wood gain ×2", "木头收益 ×2") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player.blossom.best.gte(8) } },
        4: { requirementDescription() { return tt("2 Blossoms", "2 朵花") }, effectDescription() { return tt("Branch & Root press themselves automatically", "枝与根自动声望") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player.blossom.best.gte(11) } },
        5: { requirementDescription() { return tt("2 Blossoms", "2 朵花") }, effectDescription() { return tt("Leaf growth formula ^1.03", "树叶生长公式 ^1.03") },
             unlocked() { return hasMilestone(this.layer, 4) },
             done() { return player.blossom.best.gte(14) } },
    },
})

// ---------------------------------------------------------------- sap (row 2, custom shop)
addLayer("sap", {
    name: "Sap",
    symbol: "汁",
    color: "#e8d174",
    resource() { return tt("Sap", "树液") },
    row: 2,
    position: 2,
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },

    baseResource() { return tt("the weaker of Branches/Roots", "树枝/根须中较弱的一方") },
    baseAmount() { return player.branch.points.min(player.root.points) },
    requires: new Decimal(3000000),
    type: "custom",

    getResetGain() {
        if (inChallenge("seed", 21)) return new Decimal(0)   // Dry Season: the sap stops
        let x = player.branch.points.min(player.root.points)
        // MEASURED FIX (brief §11): the trailing .add(1) let resetGain be >=1 at any amount,
        // bypassing requires entirely — the offset alone must gate the first drop of sap.
        let g = x.add(1).log10().sub(TUNING.SAP.offset).max(0).pow(TUNING.SAP.exp)
        g = g.times(tmp.sap.gainMult)
        if (g.gte(this.sapCapStart())) g = g.pow(TUNING.SAP.doubleSoftcapPower).times(this.sapCapStart().pow(1 - TUNING.SAP.doubleSoftcapPower))
        return g.floor().max(0)
    },
    sapCapStart() {
        let s = new Decimal(TUNING.SAP.doubleSoftcapStart)
        if (hasMilestone("sap", 3)) s = s.times(5)          // visible cap raise (K5)
        return s
    },
    getNextAt(canMax) {
        // inverse of the base curve (display purposes; mults folded approximately)
        let target = tmp.sap.resetGain.add(1)
        return Decimal.pow(10, TUNING.SAP.offset + target.max(1).pow(1 / TUNING.SAP.exp))
    },
    canReset() { return tmp.sap.resetGain.gte(1) },

    gainMult() {
        let m = new Decimal(1)
        if (hasMilestone("sap", 0)) m = m.times(1.5)
        if (hasMilestone("sap", 2)) m = m.times(1.5)
        if (hasUpgrade("blossom", 24)) m = m.times(1.5)
        if (hasUpgrade("blossom", 25)) m = m.times(1.5)
        if (hasUpgrade("canopy", 25)) m = m.times(1.5)    // Crowd Out
        if (hasUpgrade("canopy", 42)) m = m.times(2)    // Epiphytes
        if (hasUpgrade("seed", 22)) m = m.times(1.5)      // Cotyledon
        if (hasUpgrade("seed", 35)) m = m.times(1.5)      // Animal Carry
        m = m.times(allMult())
        return m
    },

    passiveGeneration() { if (hasMilestone("sap", 2)) return 1; return 0 },  // the shop's blood flows on its own (M5, Gaokao-sm shape)
    resetsNothing() { return hasMilestone("seed", 6) },
    autoPrestige() { return hasMilestone("seed", 6) },
    autoUpgrade() { return hasMilestone("seed", 6) },

    layerShown() { return player.sap.unlocked || player.branch.best.gte(150000) },
    branches: ["branch", "root"],   // P53 convergent: fed by BOTH arms

    hotkeys: [
        { key: "s", description() { return tt("s: draw Sap", "s：采集树液") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let kept = ["unlocked", "best", "total"]
            if (hasMilestone("seed", 6)) kept.push("upgrades", "milestones")
            if (hasMilestone("grove", 2)) kept.push("upgrades", "milestones")
            layerDataReset(this.layer, kept)
        }
    },

    tabFormat: [
        mdisp("sap"),
        "prestige-button",
        ["display-text", function () {
            return tt("Drawn from the weaker arm: ", "取自较弱的一臂：") + format(player.branch.points.min(player.root.points)) + tt(" (min of branches/roots). Best: ", "（枝/根较弱值）。最多：") + format(player.sap.best) + tt(". Requires: ", "。需求：") + format(tmp.sap.requires) + tt(" of the weaker arm", "（较弱一臂）")
        }],
        ["display-text", function () {
            return tt("Sap softcap starts at " + format(layers.sap.sapCapStart()) + " — visible, always.", "树液软帽始于 " + format(layers.sap.sapCapStart()) + " ——始终可见。")
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    microtabs: {
        stuff: {
            "Shop": { tabLabel() { return tt("Shop", "商店") },  content: [["blank", "10px"], "buyables", "upgrades"], buttonStyle() { return { "border-color": "#e8d174" } } },
            "Milestones": { tabLabel() { return tt("Milestones", "里程碑") },  content: [["blank", "10px"], "milestones"], buttonStyle() { return { "border-color": "#e8d174" } } },
            "Formulae": {
                tabLabel() { return tt("Formulae", "公式") },
                unlocked() { return hasUpgrade("sap", 15) },
                content: [["blank", "10px"], ["display-text", function () {
                    return tt("Sap = (log10(min(branch,root)) − 3.4)^1.2 + 1, × web, double-softcapped. The tree's blood concentrates its weakest limb.", "树液 = (log10(min(枝,根)) − 3.4)^1.2 + 1，×乘区，双重软帽。树的血液浓缩于最弱的一肢。")
                }]],
                buttonStyle() { return { "border-color": "#e8d174" } },
            },
        },
    },

    prestigeButtonText() {
        return tt("Draw <b>" + format(tmp.sap.resetGain) + "</b> Sap (resets the wood below)", "采集 <b>" + format(tmp.sap.resetGain) + "</b> 树液（重置下方林木）")
    },

    upgrades: {
        11: { title() { return tt("Sap Flow", "树液流动") }, description() { return tt("Branch gain formula ^1.1.", "树枝收益公式 ^1.1。") }, cost: new Decimal(5) },
        12: { title() { return tt("Root Pressure", "根压") }, description() { return tt("Root gain formula ^1.1.", "根须收益公式 ^1.1。") }, cost: new Decimal(17),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        13: { title() { return tt("Sweet Reserve", "糖分储备") }, description() { return tt("Leaf growth ×3.", "树叶生长 ×3。") }, cost: new Decimal(80),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        14: { title() { return tt("Blossom Feed", "花之滋养") }, description() { return tt("Leaf growth is boosted by your best Blossoms.", "树叶生长受花最多值加成。") }, cost: new Decimal(400),
              unlocked() { return hasUpgrade(this.layer, 12) },
              effect() { return player.blossom.best.add(1).pow(0.1) },
              effectDisplay() { return format(this.effect()) + "x" } },
        15: { title() { return tt("Read the Flow", "读懂流动") }, description() { return tt("Reveal the Formulae tab.", "显现「公式」页签。") }, cost: new Decimal(2e3),
              unlocked() { return hasUpgrade(this.layer, 13) } },
        21: { title() { return tt("Second Tap", "第二采口") }, description() { return tt("Sap gain ×1.5.", "树液收益 ×1.5。") }, cost: new Decimal(1e4),
              unlocked() { return hasUpgrade(this.layer, 14) } },
        22: { title() { return tt("Boiled Down", "熬浓") }, description() { return tt("Wood gain ×2.", "木头收益 ×2。") }, cost: new Decimal(8e4),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        23: { title() { return tt("Syrup Glaze", "糖浆封层") }, description() { return tt("Bark floors cost 15% less.", "树皮层价格 −15%。") }, cost: new Decimal(5e5),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        24: { title() { return tt("Sap-Honey", "蜜露") }, description() { return tt("Blossoms cost 15% less.", "开花价格 −15%。") }, cost: new Decimal(5e6),
              unlocked() { return hasUpgrade(this.layer, 22) } },
        25: { title() { return tt("Amber", "琥珀") }, description() { return tt("Leaf growth ×2.", "树叶生长 ×2。") }, cost: new Decimal(5e7),
              unlocked() { return hasUpgrade(this.layer, 23) } },
        31: { title() { return tt("Canopy Feed", "灌冠") }, description() { return tt("Canopy gain ×1.5.", "冠层收益 ×1.5。") }, cost: new Decimal(1e9),
              unlocked() { return hasUpgrade(this.layer, 24) } },
        32: { title() { return tt("Seed Feed", "灌籽") }, description() { return tt("Seed gain ×1.5.", "种子收益 ×1.5。") }, cost: new Decimal(1e10),
              unlocked() { return hasUpgrade(this.layer, 25) } },
        33: { title() { return tt("Old Sugar", "陈糖") }, description() { return tt("Sap gain ×1.5.", "树液收益 ×1.5。") }, cost: new Decimal(1e11),
              unlocked() { return hasUpgrade(this.layer, 31) } },
    },

    milestones: {
        0: { requirementDescription() { return tt("10 Sap", "10 树液") }, effectDescription() { return tt("Sap gain ×1.5", "树液收益 ×1.5") },
             done() { return player.sap.best.gte(10) } },
        1: { requirementDescription() { return tt("25 Sap", "25 树液") }, effectDescription() { return tt("Branches & Roots grow passively over time", "枝与根随时间被动生长") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player.sap.best.gte(25) } },
        2: { requirementDescription() { return tt("60 Sap", "60 树液") }, effectDescription() { return tt("Leaf growth ×1.5; Sap flows in on its own", "树叶生长 ×1.5；树液自行流入") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player.sap.best.gte(60) } },
        3: { requirementDescription() { return tt("150 Sap", "150 树液") }, effectDescription() { return tt("Sap softcap starts 10× later (visible)", "树液软帽起点 10×之后（可见）") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player.sap.best.gte(150) } },
        4: { requirementDescription() { return tt("400 Sap", "400 树液") }, effectDescription() { return tt("Branch & Root upgrades bought automatically; reveal Canopy & Seed", "枝与根升级自动购买；显现「冠」与「籽」") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player.sap.best.gte(400) },
             onComplete() { player.canopy.unlocked = true; player.seed.unlocked = true } },
    },

    buyables: {
        11: { title() { return tt("Concentrate", "浓缩汁") }, description() { return tt("Leaf growth formula ^+0.01 per level. The grove will want this.", "每级树叶生长公式指数 +0.01。树林会需要它。") },
              cost(x) { return new Decimal(TUNING.BUYABLE.sapConc.start).times(Decimal.pow(TUNING.BUYABLE.sapConc.base, x)) },
              effect(x) { return x.mul(0.01).add(1) },
              display() { return tt("Level: ", "等级：") + formatWhole(getBuyableAmount(this.layer, this.id)) + tt("<br>Leaf formula ^", "<br>树叶公式 ^") + format(buyableEffect(this.layer, this.id)) + tt("<br>Cost: ", "<br>价格：") + format(tmp[this.layer].buyables[this.id].cost) + tt(" Sap", " 树液") },
              canAfford() { return player.sap.points.gte(tmp.sap.buyables[11].cost) },
              buy() { player.sap.points = player.sap.points.sub(tmp.sap.buyables[11].cost); setBuyableAmount("sap", 11, getBuyableAmount("sap", 11).add(1)) },
              buyMax() {   // P54 closed form: cost = 15×1.5^x → x = log2(points/15)
                  let t = player.sap.points.div(TUNING.BUYABLE.sapConc.start).max(1).log(2).floor().add(1)
                  setBuyableAmount("sap", 11, getBuyableAmount("sap", 11).max(t))
              },
              unlocked() { return player.sap.best.gte(12) } },
    },
})
