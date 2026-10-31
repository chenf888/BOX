// js/layers-row3.js — canopy (challenge hub, 3 trials) + seed (capstone hub, 3 trials). Brief §4.

// ---------------------------------------------------------------- canopy (row 3, custom)
addLayer("canopy", {
    name: "Canopy",
    symbol: "冠",
    color: "#7ecfa8",
    resource() { return tt("Light", "光照") },
    row: 3,
    position: 0,
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },

    baseResource: "blossoms",
    baseAmount() { return player.blossom.points },
    requires: new Decimal(TUNING.CANOPY.req),
    type: "custom",

    getResetGain() {
        // count-based: static floors cap around 50-200, so a plain polynomial on the count
        // (measured fix — the old log+offset+.add(1) curve made requires meaningless)
        let g = player.blossom.points.div(TUNING.CANOPY.req).max(0).pow(TUNING.CANOPY.exp)
        g = g.times(tmp.canopy.gainMult).pow(this.gainExp())
        if (g.gte(this.canopyCapStart())) g = g.pow(0.1).times(this.canopyCapStart().pow(0.9))
        return g.floor().max(0)
    },
    gainExp() {
        let e = new Decimal(1)
        if (hasMilestone("canopy", 3)) e = e.add(0.05)
        if (hasUpgrade("canopy", 52)) e = e.add(0.05)   // Vertical Reach
        return e
    },
    canopyCapStart() { return new Decimal(TUNING.SOFTCAP.canopy.start) },
    getNextAt(canMax) {
        let target = tmp.canopy.resetGain.add(1)
        return Decimal.pow(target.div(tmp.canopy.gainMult.max(1)).max(1), 1 / TUNING.CANOPY.exp).times(TUNING.CANOPY.req)
    },
    canReset() { return tmp.canopy.resetGain.gte(1) },

    gainMult() {
        let m = new Decimal(1)
        if (hasMilestone("canopy", 0)) m = m.times(1.5)
        if (hasUpgrade("canopy", 51)) m = m.times(1.5)    // Second Crown (own)
        if (hasUpgrade("sap", 31)) m = m.times(1.5)
        if (hasUpgrade("grove", 23)) m = m.times(1.5)     // Seed Orchard
        if (hasUpgrade("worldtree", 23)) m = m.times(1.5) // World Branches
        m = m.times(allMult())
        return m
    },

    resetsNothing() { return hasMilestone("seed", 2) },   // ladder step 11a
    autoPrestige() { return hasMilestone("worldtree", 2) && hasMilestone("seed", 2) },  // ladder step 12 — implies seed m2 via the unlock chain (grove needs seed m5 ⇒ m2 done)
    autoUpgrade() { return hasMilestone("seed", 7) || hasMilestone("worldtree", 2) },

    layerShown() { return player.canopy.unlocked || player.blossom.best.gte(8) },
    branches: ["blossom", "sap"],

    hotkeys: [
        { key: "c", description: tt("c: gather Light", "c：收集光照"),
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
        mdisp("canopy"),
        "prestige-button",
        ["display-text", function () {
            return tt("Gathered from: ", "收集自：") + format(player.blossom.points) + tt(" blossoms. Best: ", " 朵花。最多：") + format(player.canopy.best)
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    microtabs: {
        stuff: {
            "Growth": { content: [["blank", "10px"], "upgrades"], buttonStyle() { return { "border-color": "#7ecfa8" } } },
            "Trials": {
                unlocked() { return hasMilestone("canopy", 1) },
                content: [["blank", "10px"], ["display-text", function () { return tt("Light trials: the canopy competes for the sun. Goals read the tree below; your Canopy prestige does not end them.", "光照考验：树冠争夺阳光。目标读取下层林木；冠层声望不会中止试炼。") }], "blank", "challenges"],
                buttonStyle() { return { "border-color": "#7ecfa8" } },
            },
            "Milestones": { content: [["blank", "10px"], "milestones"], buttonStyle() { return { "border-color": "#7ecfa8" } } },
        },
    },

    prestigeButtonText() {
        return tt("Gather <b>" + format(tmp.canopy.resetGain) + "</b> Light (resets the mature tree)", "收集 <b>" + format(tmp.canopy.resetGain) + "</b> 光照（重置成熟树）")
    },

    upgrades: {
        11: { title: tt("First Ray", "第一缕光"), description: tt("Leaf growth ×1.5.", "树叶生长 ×1.5。"), cost: new Decimal(1) },
        12: { title: tt("Wide Crown", "宽冠"), description: tt("Wood gain is boosted by your best Branches.", "木头收益受树枝最多值加成。"), cost: new Decimal(2),
              unlocked() { return hasUpgrade(this.layer, 11) },
              effect() { return player.branch.best.add(1).pow(0.2) },
              effectDisplay() { return format(this.effect()) + "x" } },
        13: { title: tt("Light Hunger", "趋光性"), description: tt("Leaf growth ×1.5.", "树叶生长 ×1.5。"), cost: new Decimal(4),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        14: { title: tt("Photosynthesis", "光合作用"), description: tt("Leaf growth is boosted by your current Light.", "树叶生长受当前光照加成。"), cost: new Decimal(8),
              unlocked() { return hasUpgrade(this.layer, 12) },
              effect() { return player.canopy.points.add(1).pow(0.3) },
              effectDisplay() { return format(this.effect()) + "x" } },
        15: { title: tt("Shade Lines", "光影线"), description: tt("Branch gain ×1.5.", "树枝收益 ×1.5。"), cost: new Decimal(16),
              unlocked() { return hasUpgrade(this.layer, 13) } },
        21: { title: tt("Leaf Angle", "叶倾角"), description: tt("Leaf growth ×2.", "树叶生长 ×2。"), cost: new Decimal(32),
              unlocked() { return hasUpgrade(this.layer, 14) } },
        22: { title: tt("Sun Track", "追日"), description: tt("Wood gain ×1.5.", "木头收益 ×1.5。"), cost: new Decimal(64),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        23: { title: tt("Dense Foliage", "密叶"), description: tt("Root gain ×1.5.", "根须收益 ×1.5。"), cost: new Decimal(128),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        24: { title: tt("Chlorophyll-B", "叶绿素 B"), description: tt("Leaf growth ×2.", "树叶生长 ×2。"), cost: new Decimal(256),
              unlocked() { return hasUpgrade(this.layer, 22) } },
        25: { title: tt("Crowd Out", "挤占"), description: tt("Sap gain ×1.5.", "树液收益 ×1.5。"), cost: new Decimal(512),
              unlocked() { return hasUpgrade(this.layer, 23) } },
        31: { title: tt("Emergent Layer", "露生层"), description: tt("Leaf growth ×3.", "树叶生长 ×3。"), cost: new Decimal(1024),
              unlocked() { return hasUpgrade(this.layer, 24) } },
        32: { title: tt("Heliotropism", "向日性"), description: tt("Wood gain ×2.", "木头收益 ×2。"), cost: new Decimal(5000),
              unlocked() { return hasUpgrade(this.layer, 25) } },
        33: { title: tt("Light Wells", "光井"), description: tt("Root gain ×2.", "根须收益 ×2。"), cost: new Decimal(2e4),
              unlocked() { return hasUpgrade(this.layer, 31) } },
        34: { title: tt("Canopy Shake", "冠层摇动"), description: tt("Branch gain ×2.", "树枝收益 ×2。"), cost: new Decimal(1e5),
              unlocked() { return hasUpgrade(this.layer, 32) } },
        35: { title: tt("Understory Light", "林下光"), description: tt("Bark floors cost 20% less.", "树皮层价格 −20%。"), cost: new Decimal(5e5),
              unlocked() { return hasUpgrade(this.layer, 33) } },
        41: { title: tt("Monsoon Season", "季风季"), description: tt("Leaf growth ×3.", "树叶生长 ×3。"), cost: new Decimal(2e6),
              unlocked() { return hasUpgrade(this.layer, 34) } },
        42: { title: tt("Epiphytes", "附生植物"), description: tt("Sap gain ×2.", "树液收益 ×2。"), cost: new Decimal(1e7),
              unlocked() { return hasUpgrade(this.layer, 35) } },
        43: { title: tt("Crown Shyness", "树冠羞避"), description: tt("Leaf growth ×1.5.", "树叶生长 ×1.5。"), cost: new Decimal(5e7),
              unlocked() { return hasUpgrade(this.layer, 41) } },
        44: { title: tt("Old Light", "旧光"), description: tt("Wood gain ×3.", "木头收益 ×3。"), cost: new Decimal(2e8),
              unlocked() { return hasUpgrade(this.layer, 42) } },
        45: { title: tt("The Sun Above All", "日在万物之上"), description: tt("Leaf growth ×5.", "树叶生长 ×5。"), cost: new Decimal(1e9),
              unlocked() { return hasUpgrade(this.layer, 43) } },
        51: { title: tt("Second Crown", "第二轮冠"), description: tt("Canopy gain ×1.5.", "冠层收益 ×1.5。"), cost: new Decimal(5e9),
              unlocked() { return hasUpgrade(this.layer, 44) } },
        52: { title: tt("Vertical Reach", "垂直延伸"), description: tt("Canopy gain formula ^1.05.", "冠层收益公式 ^1.05。"), cost: new Decimal(2e10),
              unlocked() { return hasUpgrade(this.layer, 45) } },
        53: { title: tt("Storm-Tested", "经风历雨"), description: tt("Leaf growth ×1.5.", "树叶生长 ×1.5。"), cost: new Decimal(1e11),
              unlocked() { return hasUpgrade(this.layer, 51) } },
        54: { title: tt("Canopy Web", "冠层之网"), description: tt("Branch gain ×3, Root gain ×3.", "树枝收益 ×3，根须收益 ×3。"), cost: new Decimal(5e11),
              unlocked() { return hasUpgrade(this.layer, 52) } },
        55: { title: tt("Above the Fog", "雾之上"), description: tt("Seed gain ×1.5.", "种子收益 ×1.5。"), cost: new Decimal(1e12),
              unlocked() { return hasUpgrade(this.layer, 53) } },
    },

    milestones: {
        0: { requirementDescription: tt("3 Light", "3 光照"), effectDescription: tt("Canopy gain ×1.5", "冠层收益 ×1.5"),
             done() { return player.canopy.best.gte(3) } },
        1: { requirementDescription: tt("8 Light", "8 光照"), effectDescription: tt("Unlock the Trials: the canopy competes for the sun", "解锁「试炼」：树冠争夺阳光"),
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player.canopy.best.gte(8) } },
        2: { requirementDescription: tt("20 Light", "20 光照"), effectDescription: tt("Leaf growth ×2", "树叶生长 ×2"),
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player.canopy.best.gte(20) } },
        3: { requirementDescription: tt("50 Light", "50 光照"), effectDescription: tt("Canopy gain formula ^1.05", "冠层收益公式 ^1.05"),
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player.canopy.best.gte(50) } },
        4: { requirementDescription: tt("120 Light", "120 光照"), effectDescription: tt("Wood gain ×3", "木头收益 ×3"),
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player.canopy.best.gte(120) } },
        5: { requirementDescription: tt("300 Light", "300 光照"), effectDescription: tt("All gains ×1.5", "所有收益 ×1.5"),
             unlocked() { return hasMilestone(this.layer, 4) },
             done() { return player.canopy.best.gte(300) } },
    },

    challenges: {
        11: { name: tt("Drought", "干旱"),
              challengeDescription() { return tt("The sun bakes: Wood gain formula is rooted hard (^0.4 instead of ^1).<br>", "烈日炙烤：木头收益公式被硬性开方（^0.4）。<br>") + challengeCompletions(this.layer, this.id) + "/1" },
              goalDescription: tt("Reach 10M leaves", "达到 1000 万片树叶"),
              canComplete() { return player.points.gte(1e7) },
              rewardDescription: tt("Wood gain ×1.5, forever", "木头收益永久 ×1.5"),
              unlocked() { return player.canopy.best.gte(1) },
              onEnter() { player.points = new Decimal(10) } },
        12: { name: tt("Leafless", "无叶"),
              challengeDescription() { return tt("The tree holds its breath: leaf growth stops entirely.<br>", "树木屏息：树叶停止生长。<br>") + challengeCompletions(this.layer, this.id) + "/1" },
              goalDescription: tt("Reach 100,000 Wood on frozen leaves", "在冻结的树叶上达到 100,000 木头"),
              canComplete() { return player.wood.points.gte(1e5) },
              rewardDescription: tt("Branch & Root gain ×1.5, forever", "树枝与根须收益永久 ×1.5"),
              unlocked() { return hasChallenge("canopy", 11) },
              onEnter() { player.wood.points = new Decimal(0) } },
        13: { name: tt("Shallow Roots", "浅根"),
              challengeDescription() { return tt("The soil is stone: Root gain is disabled.<br>", "土壤成石：根须收益被禁用。<br>") + challengeCompletions(this.layer, this.id) + "/1" },
              goalDescription: tt("Reach 1M Wood", "达到 100 万木头"),
              canComplete() { return player.wood.points.gte(1e6) },
              rewardDescription: tt("Root gain formula ×1.1, forever", "根须收益公式永久 ×1.1"),
              unlocked() { return hasChallenge("canopy", 12) },
              onEnter() { player.wood.points = new Decimal(0) } },
    },
})

// ---------------------------------------------------------------- seed (row 3, custom capstone)
addLayer("seed", {
    name: "Seed",
    symbol: "籽",
    color: "#e6b84c",
    resource() { return tt("Seeds", "种子") },
    row: 3,
    position: 1,
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },

    baseResource: tt("Light", "光照"),
    baseAmount() { return player.canopy.points },
    requires: new Decimal(TUNING.SEED.req),
    type: "custom",

    getResetGain() {
        // fed by the canopy's Light (count-coherent chain: blossoms -> light -> seeds)
        let g = player.canopy.points.div(TUNING.SEED.req).max(0).pow(TUNING.SEED.exp)
        g = g.times(tmp.seed.gainMult)
        if (g.gte(this.seedCapStart())) g = g.pow(0.1).times(this.seedCapStart().pow(0.9))
        return g.floor().max(0)
    },
    seedCapStart() { return new Decimal(TUNING.SOFTCAP.seed.start) },
    getNextAt(canMax) {
        let target = tmp.seed.resetGain.add(1)
        return Decimal.pow(target.max(1), 1 / TUNING.SEED.exp).times(TUNING.SEED.req)
    },
    canReset() { return tmp.seed.resetGain.gte(1) },

    gainMult() {
        let m = new Decimal(1)
        if (hasMilestone("seed", 0)) m = m.times(1.5)
        if (hasUpgrade("seed", 33)) m = m.times(1.5)      // Seed Rain (own)
        if (hasUpgrade("seed", 42)) m = m.times(2)      // Mast Year
        if (hasUpgrade("grove", 23)) m = m.times(1.5)     // Seed Orchard
        if (hasUpgrade("worldtree", 23)) m = m.times(1.5) // World Branches
        if (hasUpgrade("canopy", 55)) m = m.times(1.5)
        if (hasUpgrade("sap", 32)) m = m.times(1.5)
        m = m.times(allMult())
        return m
    },

    // ladder steps 10/11 — THE package deal (P4 endgame QoL move)
    automate() {   // P4 step 5 second driver: closed-form buyMax on sap Concentrate (seed m8)
        if (hasMilestone("seed", 8) && layers.sap.buyables[11].buyMax) layers.sap.buyables[11].buyMax()
    },

    layerShown() { return player.seed.unlocked || player.canopy.best.gte(6) },
    branches: ["blossom", "sap"],

    hotkeys: [
        { key: "d", description: tt("d: form a Seed", "d：结出一粒种子"),
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let kept = ["unlocked", "best", "total"]
            if (hasMilestone("grove", 2)) kept.push("upgrades", "milestones")
            layerDataReset(this.layer, kept)
        }
    },

    tabFormat: [
        mdisp("seed"),
        "prestige-button",
        ["display-text", function () {
            return tt("Condensed from: ", "凝自：") + format(player.blossom.points.min(player.sap.points)) + tt(" (min of blossoms/sap). Best: ", "（花/汁较弱值）。最多：") + format(player.seed.best)
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    microtabs: {
        stuff: {
            "Growth": { content: [["blank", "10px"], "upgrades"], buttonStyle() { return { "border-color": "#e6b84c" } } },
            "Trials": {
                unlocked() { return hasMilestone("seed", 1) },
                content: [["blank", "10px"], ["display-text", function () { return tt("Seed trials: the years, compressed. Goals read the tree below.", "种试：被压缩的岁月。目标读取下层林木。") }], "blank", "challenges"],
                buttonStyle() { return { "border-color": "#e6b84c" } },
            },
            "Milestones": { content: [["blank", "10px"], "milestones"], buttonStyle() { return { "border-color": "#e6b84c" } } },
        },
    },

    prestigeButtonText() {
        return tt("Form <b>" + format(tmp.seed.resetGain) + "</b> Seed(s)", "结出 <b>" + format(tmp.seed.resetGain) + "</b> 粒种子")
    },

    upgrades: {
        11: { title: tt("First Seed", "第一粒种"), description: tt("Leaf growth ×1.5.", "树叶生长 ×1.5。"), cost: new Decimal(1) },
        12: { title: tt("Hard Shell", "硬壳"), description: tt("Wood gain ×1.5.", "木头收益 ×1.5。"), cost: new Decimal(2),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        13: { title: tt("Endosperm", "胚乳"), description: tt("Leaf growth ×1.5.", "树叶生长 ×1.5。"), cost: new Decimal(5),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        14: { title: tt("Dormancy", "休眠"), description: tt("Wood gain ×2.", "木头收益 ×2。"), cost: new Decimal(12),
              unlocked() { return hasUpgrade(this.layer, 12) } },
        15: { title: tt("Embryo", "胚"), description: tt("Branch & Root gain ×1.5.", "树枝与根须收益 ×1.5。"), cost: new Decimal(30),
              unlocked() { return hasUpgrade(this.layer, 13) } },
        21: { title: tt("Seed Coat", "种皮"), description: tt("Leaf growth ×2.", "树叶生长 ×2。"), cost: new Decimal(80),
              unlocked() { return hasUpgrade(this.layer, 14) } },
        22: { title: tt("Cotyledon", "子叶"), description: tt("Sap gain ×1.5.", "树液收益 ×1.5。"), cost: new Decimal(200),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        23: { title: tt("Radicle", "胚根"), description: tt("Root gain ×1.5.", "根须收益 ×1.5。"), cost: new Decimal(600),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        24: { title: tt("Plumule", "胚芽"), description: tt("Branch gain ×1.5.", "树枝收益 ×1.5。"), cost: new Decimal(2000),
              unlocked() { return hasUpgrade(this.layer, 22) } },
        25: { title: tt("Scarification", "破皮"), description: tt("Bark floors cost 15% less.", "树皮层价格 −15%。"), cost: new Decimal(6000),
              unlocked() { return hasUpgrade(this.layer, 23) } },
        31: { title: tt("Stratification", "层积处理"), description: tt("Leaf growth ×2.", "树叶生长 ×2。"), cost: new Decimal(2e4),
              unlocked() { return hasUpgrade(this.layer, 24) } },
        32: { title: tt("Germination", "萌发"), description: tt("Wood gain ×2.", "木头收益 ×2。"), cost: new Decimal(8e4),
              unlocked() { return hasUpgrade(this.layer, 25) } },
        33: { title: tt("Seed Rain", "种子雨"), description: tt("Seed gain ×1.5.", "种子收益 ×1.5。"), cost: new Decimal(3e5),
              unlocked() { return hasUpgrade(this.layer, 31) } },
        34: { title: tt("Wind Dispersal", "风播"), description: tt("Blossoms cost 20% less.", "开花价格 −20%。"), cost: new Decimal(1e6),
              unlocked() { return hasUpgrade(this.layer, 32) } },
        35: { title: tt("Animal Carry", "兽带"), description: tt("Sap gain ×1.5.", "树液收益 ×1.5。"), cost: new Decimal(5e6),
              unlocked() { return hasUpgrade(this.layer, 33) } },
        41: { title: tt("Soil Bank", "种子库"), description: tt("Leaf growth ×3.", "树叶生长 ×3。"), cost: new Decimal(2e7),
              unlocked() { return hasUpgrade(this.layer, 34) } },
        42: { title: tt("Mast Year", "大年"), description: tt("Seed gain ×2.", "种子收益 ×2。"), cost: new Decimal(1e8),
              unlocked() { return hasUpgrade(this.layer, 35) } },
        43: { title: tt("Fire Germ.", "火萌"), description: tt("Wood gain ×3.", "木头收益 ×3。"), cost: new Decimal(5e8),
              unlocked() { return hasUpgrade(this.layer, 41) } },
        44: { title: tt("Deep Dormancy", "深休眠"), description: tt("Root gain ×3.", "根须收益 ×3。"), cost: new Decimal(2e9),
              unlocked() { return hasUpgrade(this.layer, 42) } },
        45: { title: tt("The Grove Calls", "树林在呼唤"), description: tt("Leaf growth ×5.", "树叶生长 ×5。"), cost: new Decimal(1e10),
              unlocked() { return hasUpgrade(this.layer, 43) } },
        51: { title: tt("Seed Bank II", "种子库 II"), description: tt("Blossoms cost 25% less.", "开花价格 −25%。"), cost: new Decimal(5e9),
              unlocked() { return hasUpgrade(this.layer, 44) } },
        52: { title: tt("Second Generation", "第二代"), description: tt("Seed gain ×1.5.", "种子收益 ×1.5。"), cost: new Decimal(2e10),
              unlocked() { return hasUpgrade(this.layer, 45) } },
        53: { title: tt("Heritage", "遗传"), description: tt("Canopy gain ×1.5.", "冠层收益 ×1.5。"), cost: new Decimal(1e11),
              unlocked() { return hasUpgrade(this.layer, 51) } },
        54: { title: tt("The Mother Tree", "母树"), description: tt("All gains ×1.5.", "所有收益 ×1.5。"), cost: new Decimal(5e11),
              unlocked() { return hasUpgrade(this.layer, 52) } },
        55: { title: tt("Ready to Fall", "待落"), description: tt("Reveal the Grove: a seed wants to become a tree.", "显现「林」：一粒种子想成为一棵树。"), cost: new Decimal(2e12),
              unlocked() { return hasUpgrade(this.layer, 53) } },
    },

    milestones: {
        0: { requirementDescription: tt("4 Seeds", "4 粒种子"), effectDescription: tt("Seed gain ×1.5", "种子收益 ×1.5"),
             done() { return player.seed.best.gte(4) } },
        1: { requirementDescription: tt("9 Seeds", "9 粒种子"), effectDescription: tt("Unlock the Seed trials", "解锁「种试」"),
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player.seed.best.gte(9) } },
        2: { requirementDescription: tt("18 Seeds", "18 粒种子"), effectDescription: tt("Gathering Light no longer resets the mature tree", "收集光照不再重置成熟树"),
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player.seed.best.gte(18) } },
        3: { requirementDescription: tt("36 Seeds", "36 粒种子"), effectDescription: tt("All gains ×2", "所有收益 ×2"),
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player.seed.best.gte(36) } },
        4: { requirementDescription: tt("80 Seeds", "80 粒种子"), effectDescription: tt("Leaf growth formula ^1.03", "树叶生长公式 ^1.03"),
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player.seed.best.gte(80) } },
        5: { requirementDescription: tt("160 Seeds", "160 粒种子"), effectDescription: tt("All gains ×3; reveal the Grove", "所有收益 ×3；显现「林」"),
             unlocked() { return hasMilestone(this.layer, 4) },
             done() { return player.seed.best.gte(160) },
             onComplete() { player.grove.unlocked = true } },
        6: { requirementDescription: tt("320 Seeds", "320 粒种子"), effectDescription: tt("THE PACKAGE: Bark, Blossom & Sap press, buy and endure automatically", "全家桶：皮/花/汁自动声望、自动购买、且不再重置下层"),
             unlocked() { return hasMilestone(this.layer, 5) },
             done() { return player.seed.best.gte(320) } },
        7: { requirementDescription: tt("1,000 Seeds", "1,000 粒种子"), effectDescription: tt("Canopy upgrades bought automatically", "冠层升级自动购买"),
             unlocked() { return hasMilestone(this.layer, 6) },
             done() { return player.seed.best.gte(600) } },
        8: { requirementDescription: tt("2,500 Seeds", "2,500 粒种子"), effectDescription: tt("Concentrate (Sap buyable) is bought to max automatically", "「浓缩汁」（树液可购项）自动买满"),
             unlocked() { return hasMilestone(this.layer, 7) },
             done() { return player.seed.best.gte(1200) } },
    },

    challenges: {
        21: { name: tt("Dry Season", "旱季"),
              challengeDescription() { return tt("The sap stops: Sap gain is zero.<br>", "树液枯竭：树液收益为零。<br>") + challengeCompletions(this.layer, this.id) + "/1" },
              goalDescription: tt("Reach 10,000 Blossoms", "达到 10,000 朵花"),
              canComplete() { return player.blossom.points.gte(1e4) },
              rewardDescription: tt("Blossoms cost 25% less, forever", "开花价格永久 −25%"),
              unlocked() { return player.seed.best.gte(1) },
              onEnter() { player.blossom.points = new Decimal(0) } },
        22: { name: tt("Dense Canopy", "密冠"),
              challengeDescription() { return tt("The whole web is sealed: every shared multiplier is 1.<br>", "全网封印：所有共享乘区为 1。<br>") + challengeCompletions(this.layer, this.id) + "/1" },
              goalDescription: tt("Reach 100M leaves alone", "孤木达到 1 亿片树叶"),
              canComplete() { return player.points.gte(1e8) },
              rewardDescription: tt("Leaf growth formula ^1.03, forever", "树叶生长公式永久 ^1.03"),
              unlocked() { return hasChallenge("seed", 21) },
              onEnter() { player.points = new Decimal(10) } },
        23: { name: tt("Ring Seal", "轮封"),
              challengeDescription() { return tt("The rings are sealed: Growth Rings (Wood buyable) gives nothing.<br>", "年轮封印：「年轮」可购项失效。<br>") + challengeCompletions(this.layer, this.id) + "/1" },
              goalDescription: tt("Reach 300,000 Wood", "达到 300,000 木头"),
              canComplete() { return player.wood.points.gte(3e5) },
              rewardDescription: tt("Growth Rings effect ^1.15, forever", "「年轮」效果永久 ^1.15"),
              unlocked() { return hasChallenge("seed", 22) },
              onEnter() { player.wood.points = new Decimal(0) } },
    },
})
