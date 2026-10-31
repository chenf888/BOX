// js/layers-row01.js — wood (row 0, anchor), branch + root (row 1 arms). Brief §4 table.

// ---------------------------------------------------------------- wood (row 0)
addLayer("wood", {
    name: "Wood",
    symbol: "木",
    color: "#c8a165",
    resource() { return tt("Wood", "木头") },
    row: 0,
    position: 0,
    startData() { return { unlocked: true, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },

    baseResource: "leaves",
    baseAmount() { return player.points },
    requires: new Decimal(10),
    type: "normal",
    exponent: 0.5,

    gainMult() {
        let m = new Decimal(1)
        if (inChallenge("canopy", 12)) return m           // (gain web sealed is handled in allMult; wood still grows from frozen leaves)
        if (hasMilestone("wood", 0)) m = m.times(1.8)
        if (hasMilestone("wood", 4)) m = m.times(2)
        if (hasMilestone("wood", 7)) m = m.times(3)
        if (hasMilestone("wood", 9)) m = m.times(5)
        if (hasMilestone("wood", 2)) m = m.times(player.points.add(1).log10().add(1)) // K3 log-shape, sublinear
        if (hasUpgrade("wood", 13)) m = m.times(upgradeEffect("wood", 13))  // K3 sources branch.best
        if (hasUpgrade("wood", 25)) m = m.times(upgradeEffect("wood", 25))  // K2 log-shape on leaves
        if (hasUpgrade("wood", 21)) m = m.times(1.5)
        if (hasUpgrade("wood", 32)) m = m.times(2)
        if (hasUpgrade("wood", 35)) m = m.times(1.5)
        if (hasUpgrade("branch", 11)) m = m.times(1.5)                        // branch boosts wood (P10)
        if (hasUpgrade("branch", 23)) m = m.times(1.5)                      // Support Beams
        if (hasUpgrade("root", 22)) m = m.times(1.5)                        // Steady Anchor
        if (getBuyableAmount("branch", 11).gte(1)) m = m.times(buyableEffect("branch", 11))
        if (getBuyableAmount("wood", 12).gte(1) && !inChallenge("seed", 23)) m = m.times(buyableEffect("wood", 12)) // growth rings (sealed in Ring Seal)
        if (hasMilestone("bark", 1)) m = m.times(1.5)
        if (hasMilestone("bark", 4)) m = m.times(2)
        if (hasUpgrade("blossom", 12)) m = m.times(1.5)                     // one bloom feeds the trunk
        if (hasMilestone("blossom", 3)) m = m.times(2)
        if (hasUpgrade("sap", 22)) m = m.times(2)
        if (hasUpgrade("canopy", 22)) m = m.times(1.5)                        // Sun Track
        if (hasUpgrade("canopy", 32)) m = m.times(2)                        // Heliotropism
        if (hasUpgrade("canopy", 44)) m = m.times(3)                        // Old Light
        if (hasUpgrade("seed", 12)) m = m.times(1.5)                          // Hard Shell
        if (hasUpgrade("seed", 14)) m = m.times(2)                          // Dormancy
        if (hasUpgrade("seed", 32)) m = m.times(2)                          // Germination
        if (hasUpgrade("seed", 43)) m = m.times(3)                          // Fire Germ.
        if (hasUpgrade("grove", 22)) m = m.times(3)                         // Timber Line
        if (hasUpgrade("worldtree", 22)) m = m.times(5)                    // World Timber
        if (hasChallenge("canopy", 11)) m = m.times(1.5)                      // Drought reward
        if (hasUpgrade("canopy", 12)) m = m.times(upgradeEffect("canopy", 12)) // K3 sources branch.best
        m = m.times(allMult())
        return m
    },
    gainExp() {
        let e = new Decimal(1)
        if (hasMilestone("wood", 6)) e = e.add(0.05)          // K4 named: rings deepen
        if (inChallenge("canopy", 11)) e = new Decimal(0.4)   // Drought: growth rooted
        if (getBuyableAmount("sap", 11).gte(1)) e = e.add(buyableEffect("sap", 11)) // concentrate
        return e
    },
    softcap() {
        let s = new Decimal(TUNING.SOFTCAP.wood.start)
        if (hasUpgrade("bark", 12)) s = s.times(TUNING.SOFTCAP.wood.raise)  // visible cap raise (K5)
        return s
    },
    softcapPower() { return new Decimal(TUNING.SOFTCAP.wood.power) },

    layerShown() { return true },

    resetsNothing() { return hasMilestone("branch", 0) },   // ladder step 1: pressing wood spares the leaves
    passiveGeneration() { if (hasMilestone("branch", 2) || hasAchievement("a", 21)) return 1; return 0 },  // step 2 + ach alt (plain number)
    autoPrestige() { return hasMilestone("root", 1) && hasMilestone("branch", 0) },  // step 3 — ANDed: implies the resetsNothing set (N-AUTOWIPE)
    autoUpgrade() { return hasMilestone("root", 4) || hasAchievement("a", 34) },       // step 4 + ach alt

    hotkeys: [
        { key: "w", description: tt("w: press the leaves into wood", "w：把落叶压实成木头"),
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let kept = ["unlocked", "best", "total"]
            if (hasMilestone("root", 6)) kept.push("upgrades")
            if (hasMilestone("root", 2)) kept.push("milestones")
            if (hasMilestone("grove", 2)) kept.push("upgrades", "milestones")
            layerDataReset(this.layer, kept)
        }
    },

    tabFormat: [
        mdisp("wood"),
        "prestige-button",
        ["display-text", function () {
            return tt("You have ", "你有 ") + format(player.points) + tt(" leaves. Best wood: ", " 片树叶。木头最多：") + format(player.wood.best)
        }],
        ["display-text", function () {
            if (player.wood.points.gte(tmp.wood.softcap.div(2))) return tt("<b>Softcap starts at " + format(tmp.wood.softcap) + " Wood.</b>", "<b>软帽始于 " + format(tmp.wood.softcap) + " 木头。</b>")
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    microtabs: {
        stuff: {
            "Growth": {
                content: [["blank", "10px"], "buyables", "upgrades"],
                buttonStyle() { return { "border-color": "#c8a165" } },
            },
            "Milestones": {
                content: [["blank", "10px"], "milestones"],
                buttonStyle() { return { "border-color": "#c8a165" } },
            },
            "Trials": {
                unlocked() { return hasUpgrade("wood", 15) },
                content: [["blank", "10px"], ["display-text", function () { return tt("The tree endures. Enter a trial — completing one pays forever.", "树木会忍耐。进入一场试炼——完成一次，永久生效。") }], "blank", "challenges"],
                buttonStyle() { return { "border-color": "#c8a165" } },
            },
        },
    },

    prestigeButtonText() {
        return tt("Press " + format(player.points) + " leaves into <b>" + format(tmp.wood.resetGain) + "</b> Wood", "把 " + format(player.points) + " 片树叶压成 <b>" + format(tmp.wood.resetGain) + "</b> 木头")
    },

    upgrades: {
        11: { title: tt("First Leaves", "初生的叶"), description: tt("Leaf growth ×1.5.", "树叶生长 ×1.5。"), cost: new Decimal(1) },
        12: { title: tt("Sunwood", "向阳之木"), description: tt("Leaf growth is boosted by your unspent Wood.", "树叶生长受未花费木头加成。"), cost: new Decimal(3),
              unlocked() { return hasUpgrade(this.layer, 11) },
              effect() { return player.wood.points.add(1).pow(0.4) },
              effectDisplay() { return format(this.effect()) + "x" } },
        13: { title: tt("Deep Roots", "深根"), description: tt("Wood gain is boosted by your best Branches. (a key finding)", "木头收益受树枝最多值加成。（关键发现）"), cost: new Decimal(7),
              unlocked() { return hasUpgrade(this.layer, 11) },
              effect() { return player.branch.best.add(1).pow(0.15) },
              effectDisplay() { return format(this.effect()) + "x" } },
        14: { title: tt("Thicker Canopy", "更厚的冠"), description: tt("Leaf growth ×1.5 again.", "树叶生长再 ×1.5。"), cost: new Decimal(50),
              unlocked() { return hasUpgrade(this.layer, 12) } },
        15: { title: tt("Weather Sense", "察风观雨"), description: tt("Unlock the Trials tab: the tree can endure.", "解锁「试炼」页签：树木可以忍耐。"), cost: new Decimal(500),
              unlocked() { return hasUpgrade(this.layer, 13) } },
        21: { title: tt("Solid Heartwood", "坚实心材"), description: tt("Wood gain ×1.5.", "木头收益 ×1.5。"), cost: new Decimal(5e3),
              unlocked() { return hasUpgrade(this.layer, 14) } },
        22: { title: tt("Sunward Lean", "向阳性"), description: tt("Leaf growth ×2.", "树叶生长 ×2。"), cost: new Decimal(2e4),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        23: { title: tt("Shelter", "庇荫"), description: tt("Branch gain ×1.5.", "树枝收益 ×1.5。"), cost: new Decimal(1e5),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        24: { title: tt("Feeder Roots", "须根"), description: tt("Root gain ×1.5.", "根须收益 ×1.5。"), cost: new Decimal(5e6),
              unlocked() { return hasUpgrade(this.layer, 22) } },
        25: { title: tt("Growth Memory", "生长记忆"), description: tt("Wood gain is boosted by your leaves (logarithmically).", "木头收益受树叶对数加成。"), cost: new Decimal(1e7),
              unlocked() { return hasUpgrade(this.layer, 23) },
              effect() { return player.points.add(1).log10().add(1).pow(1.2) },
              effectDisplay() { return format(this.effect()) + "x" } },
        31: { title: tt("Understory", "林下层"), description: tt("Leaf growth ×3.", "树叶生长 ×3。"), cost: new Decimal(5e8),
              unlocked() { return hasUpgrade(this.layer, 24) } },
        32: { title: tt("Wide Rings", "宽年轮"), description: tt("Wood gain ×2.", "木头收益 ×2。"), cost: new Decimal(2e9),
              unlocked() { return hasUpgrade(this.layer, 25) } },
        33: { title: tt("Tough Bark", "韧皮"), description: tt("Bark floors cost 30% less.", "树皮层价格 −30%。"), cost: new Decimal(1e11),
              unlocked() { return hasUpgrade(this.layer, 31) } },
        34: { title: tt("Old Growth", "老龄林"), description: tt("Leaf growth is boosted by your best Wood.", "树叶生长受木头最多值加成。"), cost: new Decimal(1e13),
              unlocked() { return hasUpgrade(this.layer, 32) },
              effect() { return player.wood.best.add(1).log10().add(1).pow(1.5) },
              effectDisplay() { return format(this.effect()) + "x" } },
        35: { title: tt("The Trunk Holds", "树干承之"), description: tt("Wood gain ×1.5.", "木头收益 ×1.5。"), cost: new Decimal(1e15),
              unlocked() { return hasUpgrade(this.layer, 34) } },
    },

    milestones: {
        0: { requirementDescription: tt("5,000 leaves", "5,000 片树叶"), effectDescription: tt("Wood gain ×1.8", "木头收益 ×1.8"),
             done() { return player.points.gte(5000) } },
        1: { requirementDescription: tt("100 Wood", "100 木头"), effectDescription: tt("Leaf growth ×1.5; reveal Branch & Root", "树叶生长 ×1.5；显现「枝」与「根」"),
             done() { return player.wood.best.gte(100) },
             onComplete() { player.branch.unlocked = true; player.root.unlocked = true } },
        2: { requirementDescription: tt("500 Wood", "500 木头"), effectDescription: tt("Wood gain is boosted by your leaves", "木头收益受树叶加成"),
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player.wood.best.gte(500) } },
        3: { requirementDescription: tt("2,500 Wood", "2,500 木头"), effectDescription: tt("Leaf growth ×2", "树叶生长 ×2"),
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player.wood.best.gte(2500) } },
        4: { requirementDescription: tt("12,500 Wood", "12,500 木头"), effectDescription: tt("Wood gain ×2", "木头收益 ×2"),
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player.wood.best.gte(12500) } },
        5: { requirementDescription: tt("60,000 Wood", "60,000 木头"), effectDescription: tt("Leaf growth is boosted by your Wood", "树叶生长受木头加成"),
             unlocked() { return hasMilestone(this.layer, 4) },
             done() { return player.wood.best.gte(6e4) } },
        6: { requirementDescription: tt("300,000 Wood", "300,000 木头"), effectDescription: tt("Wood gain formula ^1.05", "木头收益公式 ^1.05"),
             unlocked() { return hasMilestone(this.layer, 5) },
             done() { return player.wood.best.gte(3e5) } },
        7: { requirementDescription: tt("1.5M Wood", "150 万木头"), effectDescription: tt("Wood gain ×3", "木头收益 ×3"),
             unlocked() { return hasMilestone(this.layer, 6) },
             done() { return player.wood.best.gte(1.5e6) } },
        8: { requirementDescription: tt("10M Wood", "1000 万木头"), effectDescription: tt("Leaf growth formula ^1.02", "树叶生长公式 ^1.02"),
             unlocked() { return hasMilestone(this.layer, 7) },
             done() { return player.wood.best.gte(1e7) } },
        9: { requirementDescription: tt("100M Wood", "1 亿木头"), effectDescription: tt("Wood gain ×5", "木头收益 ×5"),
             unlocked() { return hasMilestone(this.layer, 8) },
             done() { return player.wood.best.gte(1e8) } },
    },

    buyables: {
        11: { title: tt("Fertilizer", "树肥"), description: tt("Leaf growth ×1.6 per level. Fed to the roots.", "每级树叶生长 ×1.6。喂给根须。"),
              cost(x) { return new Decimal(TUNING.BUYABLE.woodFert.start).times(Decimal.pow(TUNING.BUYABLE.woodFert.base, x)) },
              effect(x) { return Decimal.pow(1.6, x) },
              display() { return tt("Level: ", "等级：") + formatWhole(getBuyableAmount(this.layer, this.id)) + tt("<br>Effect: ×", "<br>效果：×") + format(buyableEffect(this.layer, this.id)) + tt("<br>Cost: ", "<br>价格：") + format(tmp[this.layer].buyables[this.id].cost) + tt(" Wood", " 木头") },
              canAfford() { return player.wood.points.gte(tmp.wood.buyables[11].cost) },
              buy() { player.wood.points = player.wood.points.sub(tmp.wood.buyables[11].cost); setBuyableAmount("wood", 11, getBuyableAmount("wood", 11).add(1)) },
              unlocked() { return player.wood.best.gte(15) } },
        12: { title: tt("Growth Rings", "年轮"), description: tt("Wood gain ×(levels+1)^1.3. The rings remember every press.", "木头收益 ×(等级+1)^1.3。年轮记得每一次压实。"),
              cost(x) { return new Decimal(TUNING.BUYABLE.woodRings.start).times(Decimal.pow(TUNING.BUYABLE.woodRings.base, x)) },
              effect(x) {
                  let e = x.add(1).pow(1.3)
                  if (hasMilestone("worldtree", 4)) e = e.pow(1.2)   // worldtree m4: rings deepen (named)
                  if (hasChallenge("seed", 23)) e = e.pow(1.15)      // Ring Seal reward
                  return e
              },
              display() { return tt("Level: ", "等级：") + formatWhole(getBuyableAmount(this.layer, this.id)) + tt("<br>Effect: ×", "<br>效果：×") + format(buyableEffect(this.layer, this.id)) + tt("<br>Cost: ", "<br>价格：") + format(tmp[this.layer].buyables[this.id].cost) + tt(" Wood", " 木头") },
              canAfford() { return player.wood.points.gte(tmp.wood.buyables[12].cost) },
              buy() { player.wood.points = player.wood.points.sub(tmp.wood.buyables[12].cost); setBuyableAmount("wood", 12, getBuyableAmount("wood", 12).add(1)) },
              buyMax() {  // P54 closed form: cost = start × base^x  →  x = log(points/start)/log(base)
                  let t = player.wood.points.div(TUNING.BUYABLE.woodRings.start).max(1).log(TUNING.BUYABLE.woodRings.base).floor().add(1)
                  setBuyableAmount("wood", 12, getBuyableAmount("wood", 12).max(t))
              },
              unlocked() { return hasMilestone("wood", 3) } },
    },

    challenges: {
        11: { name: tt("Bare Branches", "秃枝"),
              challengeDescription() { return tt("Your branches bear nothing: Branch gain is disabled.<br>", "枝头空空：树枝收益被禁用。<br>") + challengeCompletions(this.layer, this.id) + "/1" },
              goalDescription: tt("Regrow 100,000 leaves", "重新长出 100,000 片树叶"),
              canComplete() { return player.points.gte(1e5) },
              rewardDescription: tt("Branch gain ×1.5, forever", "树枝收益永久 ×1.5"),
              unlocked() { return player.wood.best.gte(20) },
              onEnter() { player.points = new Decimal(10) } },
        12: { name: tt("Storm", "风暴"),
              challengeDescription() { return tt("The wind takes four of every five leaves: leaf growth ÷5.<br>", "风卷走五分之四的叶子：树叶生长 ÷5。<br>") + challengeCompletions(this.layer, this.id) + "/1" },
              goalDescription: tt("Reach 1M leaves", "达到 100 万片树叶"),
              canComplete() { return player.points.gte(1e6) },
              rewardDescription: tt("Leaf growth ×1.5, forever", "树叶生长永久 ×1.5"),
              unlocked() { return hasChallenge("wood", 11) },
              onEnter() { player.points = new Decimal(10) } },
    },
})

// ---------------------------------------------------------------- branch (row 1)
addLayer("branch", {
    name: "Branch",
    symbol: "枝",
    color: "#9fd47a",
    resource() { return tt("Branches", "树枝") },
    row: 1,
    position: 0,
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },

    baseResource: "wood",
    baseAmount() { return player.wood.points },
    requires: new Decimal(15000),
    type: "normal",
    exponent: 1 / 3,

    gainMult() {
        let m = new Decimal(1)
        if (inChallenge("wood", 11)) return m                       // Bare Branches: nothing forms
        if (hasMilestone("branch", 1)) m = m.times(1.5)
        if (hasMilestone("branch", 3)) m = m.times(1.8)
        if (hasMilestone("branch", 5)) m = m.times(2)
        if (hasMilestone("branch", 7)) m = m.times(2.5)
        if (hasUpgrade("branch", 13)) m = m.times(player.root.points.add(1).pow(0.2))  // K3 sources root
        if (hasMilestone("branch", 4)) m = m.times(player.root.best.add(1).pow(0.15))  // K3
        if (hasUpgrade("branch", 14)) m = m.times(1.5)                // Forking (own)
        if (hasUpgrade("branch", 21)) m = m.times(1.5)                // Second Fork
        if (hasUpgrade("branch", 31)) m = m.times(1.5)                // Branching Habit
        if (hasUpgrade("wood", 23)) m = m.times(1.5)                // Shelter
        if (hasUpgrade("bark", 13)) m = m.times(1.5)
        if (hasMilestone("bark", 2)) m = m.times(1.5)
        if (hasUpgrade("blossom", 13)) m = m.times(1.5)
        if (hasUpgrade("sap", 34)) m = m.times(1.5)
        if (hasUpgrade("canopy", 15)) m = m.times(1.5)                // Shade Lines
        if (hasUpgrade("canopy", 34)) m = m.times(2)                // Canopy Shake
        if (hasUpgrade("canopy", 54)) m = m.times(3)                // Canopy Web
        if (hasUpgrade("seed", 15)) m = m.times(1.5)                  // Embryo
        if (hasChallenge("canopy", 12)) m = m.times(1.5)              // Leafless reward
        if (hasUpgrade("sap", 11)) m = m.pow(1.1)                   // sap flow (K4 named)
        if (hasChallenge("wood", 11)) m = m.times(1.5)              // Bare Branches reward
        m = m.times(allMult())
        return m
    },
    gainExp() {
        let e = new Decimal(1)
        if (hasMilestone("branch", 6)) e = e.add(0.04)
        return e
    },
    softcap() { return new Decimal(TUNING.SOFTCAP.branch.start) },
    softcapPower() { return new Decimal(TUNING.SOFTCAP.branch.power) },

    resetsNothing() { return hasMilestone("blossom", 1) },          // ladder step 6
    passiveGeneration() { if (hasMilestone("sap", 1)) return 1; return 0 },   // ladder step 7 (plain number, N-PGBOOL)
    autoPrestige() { return hasMilestone("blossom", 4) && hasMilestone("blossom", 1) },           // ladder step 8 (implies resetsNothing: same layer, ordered)
    autoUpgrade() { return hasMilestone("sap", 4) },                // ladder step 9

    layerShown() { return player.branch.unlocked || player.wood.best.gte(200) },
    branches: ["wood"],

    hotkeys: [
        { key: "b", description: tt("b: sprout Branches", "b：抽出树枝"),
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let kept = ["unlocked", "best", "total"]
            if (hasMilestone("seed", 6)) kept.push("upgrades", "milestones")
            if (hasMilestone("grove", 2)) kept.push("upgrades", "milestones")   // THE package keeps
            layerDataReset(this.layer, kept)
        }
    },

    tabFormat: [
        mdisp("branch"),
        "prestige-button",
        ["display-text", function () {
            return tt("Sprouting from: ", "萌发自：") + format(player.wood.points) + tt(" wood. Best: ", " 木头。最多：") + format(player.branch.best)
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    microtabs: {
        stuff: {
            "Growth": { content: [["blank", "10px"], "buyables", "upgrades"], buttonStyle() { return { "border-color": "#9fd47a" } } },
            "Milestones": { content: [["blank", "10px"], "milestones"], buttonStyle() { return { "border-color": "#9fd47a" } } },
            "Formulae": {
                unlocked() { return hasUpgrade("branch", 15) },
                content: [["blank", "10px"], ["display-text", function () {
                    return tt("Branch gain = (wood / 250)^(1/3) × web multipliers, all ^1 + 0.04 (rings milestone).", "树枝收益 = (木头/250)^(1/3) × 乘区之网，整体 ^1 + 0.04（年轮里程碑）。")
                }]],
                buttonStyle() { return { "border-color": "#9fd47a" } },
            },
        },
    },

    prestigeButtonText() {
        return tt("Sprout <b>" + format(tmp.branch.resetGain) + "</b> Branches", "抽出 <b>" + format(tmp.branch.resetGain) + "</b> 根树枝")
    },

    upgrades: {
        11: { title: tt("First Bud", "第一颗芽"), description: tt("Wood gain ×1.5.", "木头收益 ×1.5。"), cost: new Decimal(2) },
        12: { title: tt("Reach for Light", "向光生长"), description: tt("Leaf growth ×1.5.", "树叶生长 ×1.5。"), cost: new Decimal(5),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        13: { title: tt("Rooted Grip", "抓地之根"), description: tt("Branch gain is boosted by your Roots.", "树枝收益受根须加成。"), cost: new Decimal(12),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        14: { title: tt("Forking", "分叉"), description: tt("Branch gain ×1.5.", "树枝收益 ×1.5。"), cost: new Decimal(60),
              unlocked() { return hasUpgrade(this.layer, 12) } },
        15: { title: tt("Read the Grain", "读木纹"), description: tt("Reveal the Formulae tab.", "显现「公式」页签。"), cost: new Decimal(400),
              unlocked() { return hasUpgrade(this.layer, 13) } },
        21: { title: tt("Second Fork", "再次分叉"), description: tt("Branch gain ×1.5.", "树枝收益 ×1.5。"), cost: new Decimal(2e3),
              unlocked() { return hasUpgrade(this.layer, 14) } },
        22: { title: tt("Leaf Canopy", "叶冠"), description: tt("Leaf growth ×2.", "树叶生长 ×2。"), cost: new Decimal(1e4),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        23: { title: tt("Support Beams", "支撑梁"), description: tt("Wood gain ×1.5.", "木头收益 ×1.5。"), cost: new Decimal(8e4),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        24: { title: tt("Hollow Heart", "空心之干"), description: tt("Root gain ×1.5.", "根须收益 ×1.5。"), cost: new Decimal(5e5),
              unlocked() { return hasUpgrade(this.layer, 22) } },
        25: { title: tt("Wind-Firm", "抗风"), description: tt("Leaf growth ×1.5.", "树叶生长 ×1.5。"), cost: new Decimal(5e6),
              unlocked() { return hasUpgrade(this.layer, 23) } },
        31: { title: tt("Branching Habit", "分枝习性"), description: tt("Branch gain ×1.5.", "树枝收益 ×1.5。"), cost: new Decimal(5e7),
              unlocked() { return hasUpgrade(this.layer, 24) } },
        35: { title: tt("The Crown Widens", "树冠展宽"), description: tt("Leaf growth ×2.", "树叶生长 ×2。"), cost: new Decimal(1e10),
              unlocked() { return hasUpgrade(this.layer, 31) } },
    },

    milestones: {
        0: { requirementDescription: tt("50 Branches", "50 根树枝"), effectDescription: tt("Pressing Wood no longer resets your leaves", "压制木头不再重置树叶"),
             done() { return player.branch.best.gte(50) } },
        1: { requirementDescription: tt("100 Branches", "100 根树枝"), effectDescription: tt("Branch gain ×1.5", "树枝收益 ×1.5"),
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player.branch.best.gte(100) } },
        2: { requirementDescription: tt("250 Branches", "250 根树枝"), effectDescription: tt("Wood grows passively over time", "木头随时间被动生长"),
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player.branch.best.gte(250) } },
        3: { requirementDescription: tt("500 Branches", "500 根树枝"), effectDescription: tt("Branch gain ×1.8", "树枝收益 ×1.8"),
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player.branch.best.gte(500) } },
        4: { requirementDescription: tt("1,500 Branches", "1,500 根树枝"), effectDescription: tt("Branch gain is boosted by your best Roots", "树枝收益受根须最多值加成"),
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player.branch.best.gte(1500) } },
        5: { requirementDescription: tt("5,000 Branches", "5,000 根树枝"), effectDescription: tt("Branch gain ×2; reveal Bark, Blossom & Sap", "树枝收益 ×2；显现「皮」「花」「汁」"),
             unlocked() { return hasMilestone(this.layer, 4) },
             done() { return player.branch.best.gte(5000) },
             onComplete() { player.bark.unlocked = true; player.blossom.unlocked = true; player.sap.unlocked = true } },
        6: { requirementDescription: tt("20,000 Branches", "20,000 根树枝"), effectDescription: tt("Branch gain formula ^1.04", "树枝收益公式 ^1.04"),
             unlocked() { return hasMilestone(this.layer, 5) },
             done() { return player.branch.best.gte(2e4) } },
        7: { requirementDescription: tt("100,000 Branches", "100,000 根树枝"), effectDescription: tt("Branch gain ×2.5", "树枝收益 ×2.5"),
             unlocked() { return hasMilestone(this.layer, 6) },
             done() { return player.branch.best.gte(1e5) } },
    },

    buyables: {
        11: { title: tt("Side Buds", "侧芽"), description: tt("Wood gain ×(levels+0.5)^0.8 per level.", "每级木头收益 ×(等级+0.5)^0.8。"),
              cost(x) { return new Decimal(TUNING.BUYABLE.branchBuds.start).times(Decimal.pow(TUNING.BUYABLE.branchBuds.base, x)) },
              effect(x) { return x.add(0.5).pow(0.8) },
              display() { return tt("Level: ", "等级：") + formatWhole(getBuyableAmount(this.layer, this.id)) + tt("<br>Effect: ×", "<br>效果：×") + format(buyableEffect(this.layer, this.id)) + tt("<br>Cost: ", "<br>价格：") + format(tmp[this.layer].buyables[this.id].cost) + tt(" Branches", " 树枝") },
              canAfford() { return player.branch.points.gte(tmp.branch.buyables[11].cost) },
              buy() { player.branch.points = player.branch.points.sub(tmp.branch.buyables[11].cost); setBuyableAmount("branch", 11, getBuyableAmount("branch", 11).add(1)) },
              unlocked() { return player.branch.best.gte(10) } },
    },
})

// ---------------------------------------------------------------- root (row 1)
addLayer("root", {
    name: "Root",
    symbol: "根",
    color: "#d4b896",
    resource() { return tt("Roots", "根须") },
    row: 1,
    position: 1,
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },

    baseResource: "wood",
    baseAmount() { return player.wood.points },
    requires: new Decimal(30000),
    type: "normal",
    exponent: 1 / 3,

    gainMult() {
        let m = new Decimal(1)
        if (inChallenge("canopy", 13)) return m                      // Shallow Roots: nothing grips
        if (hasUpgrade("root", 12)) m = m.times(1.5)
        if (hasUpgrade("root", 14)) m = m.times(1.5)
        if (hasUpgrade("root", 15)) m = m.times(1.5)
        if (hasUpgrade("root", 24)) m = m.times(1.5)
        if (hasUpgrade("root", 25)) m = m.times(2)
        if (hasUpgrade("root", 34)) m = m.times(1.5)
        if (hasUpgrade("canopy", 23)) m = m.times(1.5)                // Dense Foliage
        if (hasUpgrade("canopy", 33)) m = m.times(2)                // Light Wells
        if (hasUpgrade("canopy", 54)) m = m.times(3)                // Canopy Web
        if (hasUpgrade("seed", 15)) m = m.times(1.5)                  // Embryo
        if (hasUpgrade("wood", 24)) m = m.times(1.5)                 // Feeder Roots
        if (hasUpgrade("branch", 24)) m = m.times(1.5)               // Hollow Heart
        if (hasUpgrade("bark", 14)) m = m.times(1.5)
        if (hasMilestone("bark", 2)) m = m.times(1.5)
        if (hasUpgrade("blossom", 14)) m = m.times(1.5)
        if (hasUpgrade("sap", 35)) m = m.times(1.5)
        if (hasUpgrade("root", 13)) m = m.times(player.branch.points.add(1).pow(0.2))  // K3 sources branch
        if (hasUpgrade("sap", 12)) m = m.pow(1.1)                    // K4 named
        m = m.times(allMult())
        return m
    },
    gainExp() {
        let e = new Decimal(1)
        if (hasMilestone("root", 7)) e = e.add(0.05)
        if (hasChallenge("canopy", 13)) e = e.times(1.1)             // Shallow Roots reward
        return e
    },
    softcap() { return new Decimal(TUNING.SOFTCAP.root.start) },
    softcapPower() { return new Decimal(TUNING.SOFTCAP.root.power) },

    resetsNothing() { return hasMilestone("blossom", 1) },
    passiveGeneration() { if (hasMilestone("sap", 1)) return 1; return 0 },
    autoPrestige() { return hasMilestone("blossom", 4) && hasMilestone("blossom", 1) },
    autoUpgrade() { return hasMilestone("sap", 4) },

    layerShown() { return player.root.unlocked || player.wood.best.gte(200) },
    branches: ["wood"],

    hotkeys: [
        { key: "r", description: tt("r: grow Roots", "r：生长根须"),
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
        mdisp("root"),
        "prestige-button",
        ["display-text", function () {
            return tt("Anchored in: ", "扎基于：") + format(player.wood.points) + tt(" wood. Best: ", " 木头。最多：") + format(player.root.best)
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    microtabs: {
        stuff: {
            "Growth": { content: [["blank", "10px"], "buyables", "upgrades"], buttonStyle() { return { "border-color": "#d4b896" } } },
            "Milestones": { content: [["blank", "10px"], "milestones"], buttonStyle() { return { "border-color": "#d4b896" } } },
            "Formulae": {
                unlocked() { return hasUpgrade("root", 15) },
                content: [["blank", "10px"], ["display-text", function () {
                    return tt("Root gain = (wood / 400)^(1/3) × web multipliers. Mycorrhiza feeds leaves directly.", "根须收益 = (木头/400)^(1/3) × 乘区之网。菌根直接反哺树叶。")
                }]],
                buttonStyle() { return { "border-color": "#d4b896" } },
            },
        },
    },

    prestigeButtonText() {
        return tt("Grow <b>" + format(tmp.root.resetGain) + "</b> Roots", "生长 <b>" + format(tmp.root.resetGain) + "</b> 根须")
    },

    upgrades: {
        11: { title: tt("First Tendril", "第一缕须"), description: tt("Leaf growth ×1.5.", "树叶生长 ×1.5。"), cost: new Decimal(2) },
        12: { title: tt("Deep Grip", "深抓"), description: tt("Root gain ×1.5.", "根须收益 ×1.5。"), cost: new Decimal(5),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        13: { title: tt("Borrowed Strength", "借力"), description: tt("Root gain is boosted by your Branches.", "根须收益受树枝加成。"), cost: new Decimal(12),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        14: { title: tt("Water Table", "水位线"), description: tt("Root gain ×1.5.", "根须收益 ×1.5。"), cost: new Decimal(60),
              unlocked() { return hasUpgrade(this.layer, 12) } },
        15: { title: tt("Read the Soil", "读懂土壤"), description: tt("Reveal the Formulae tab.", "显现「公式」页签。"), cost: new Decimal(400),
              unlocked() { return hasUpgrade(this.layer, 13) } },
        21: { title: tt("Mycelium Friend", "菌丝之友"), description: tt("Leaf growth ×1.5.", "树叶生长 ×1.5。"), cost: new Decimal(2e3),
              unlocked() { return hasUpgrade(this.layer, 14) } },
        22: { title: tt("Steady Anchor", "稳固锚点"), description: tt("Wood gain ×1.5.", "木头收益 ×1.5。"), cost: new Decimal(1e4),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        23: { title: tt("Second Depth", "第二深度"), description: tt("Root gain ×1.5.", "根须收益 ×1.5。"), cost: new Decimal(8e4),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        24: { title: tt("Deep Water", "深水层"), description: tt("Root gain ×1.5.", "根须收益 ×1.5。"), cost: new Decimal(5e5),
              unlocked() { return hasUpgrade(this.layer, 22) } },
        25: { title: tt("Bedrock", "基岩"), description: tt("Root gain ×2.", "根须收益 ×2。"), cost: new Decimal(5e6),
              unlocked() { return hasUpgrade(this.layer, 23) } },
        31: { title: tt("Taproot", "主根"), description: tt("Leaf growth ×2.", "树叶生长 ×2。"), cost: new Decimal(5e7),
              unlocked() { return hasUpgrade(this.layer, 24) } },
        35: { title: tt("The Earth Remembers", "大地铭记"), description: tt("Root gain ×1.5.", "根须收益 ×1.5。"), cost: new Decimal(1e10),
              unlocked() { return hasUpgrade(this.layer, 31) } },
    },

    milestones: {
        0: { requirementDescription: tt("60 Roots", "60 根须"), effectDescription: tt("Leaf growth ×1.5", "树叶生长 ×1.5"),
             done() { return player.root.best.gte(60) } },
        1: { requirementDescription: tt("120 Roots", "120 根须"), effectDescription: tt("Automatically press Wood when possible (with Branch m0's safety)", "尽可能自动压木（需要枝 m0 的安全条件）"),
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player.root.best.gte(120) } },
        2: { requirementDescription: tt("300 Roots", "300 根须"), effectDescription: tt("Wood milestones survive all resets", "木头里程碑在重置后保留"),
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player.root.best.gte(300) } },
        3: { requirementDescription: tt("750 Roots", "750 根须"), effectDescription: tt("Leaf growth ×1.8", "树叶生长 ×1.8"),
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player.root.best.gte(750) } },
        4: { requirementDescription: tt("2,000 Roots", "2,000 根须"), effectDescription: tt("Automatically buy Wood upgrades", "自动购买木头升级"),
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player.root.best.gte(2000) } },
        5: { requirementDescription: tt("6,000 Roots", "6,000 根须"), effectDescription: tt("Leaf growth ×2", "树叶生长 ×2"),
             unlocked() { return hasMilestone(this.layer, 4) },
             done() { return player.root.best.gte(6000) } },
        6: { requirementDescription: tt("20,000 Roots", "20,000 根须"), effectDescription: tt("Wood upgrades survive all resets", "木头升级在重置后保留"),
             unlocked() { return hasMilestone(this.layer, 5) },
             done() { return player.root.best.gte(2e4) } },
        7: { requirementDescription: tt("100,000 Roots", "100,000 根须"), effectDescription: tt("Leaf growth ×3; Root formula ^1.05", "树叶生长 ×3；根须公式 ^1.05"),
             unlocked() { return hasMilestone(this.layer, 6) },
             done() { return player.root.best.gte(1e5) } },
    },

    buyables: {
        11: { title: tt("Mycorrhiza", "菌根"), description: tt("Leaf growth is boosted by your current Roots, per level.", "每级使树叶生长受当前根须加成。"),
              cost(x) { return new Decimal(TUNING.BUYABLE.rootMyco.start).times(Decimal.pow(TUNING.BUYABLE.rootMyco.base, x)) },
              effect(x) { return player.root.points.add(1).pow(0.25).times(x.add(1).pow(0.5)) },
              display() { return tt("Level: ", "等级：") + formatWhole(getBuyableAmount(this.layer, this.id)) + tt("<br>Effect: ×", "<br>效果：×") + format(buyableEffect(this.layer, this.id)) + tt("<br>Cost: ", "<br>价格：") + format(tmp[this.layer].buyables[this.id].cost) + tt(" Roots", " 根须") },
              canAfford() { return player.root.points.gte(tmp.root.buyables[11].cost) },
              buy() { player.root.points = player.root.points.sub(tmp.root.buyables[11].cost); setBuyableAmount("root", 11, getBuyableAmount("root", 11).add(1)) },
              unlocked() { return player.root.best.gte(10) } },
    },
})
