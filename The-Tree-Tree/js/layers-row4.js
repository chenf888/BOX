// js/layers-row4.js — grove (M19 consumable reset: plant a tree) + worldtree (THE TREE TREE). Brief §4/§7.

// ---------------------------------------------------------------- grove (row 4, the ritual)
addLayer("grove", {
    name: "Grove",
    symbol: "林",
    color: "#86c5da",
    resource() { return tt("Trees", "棵树") },
    row: 4,
    position: 0,
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },

    baseResource: tt("the whole tree", "整棵树"),
    baseAmount() { return groveGetGain() },
    requires: new Decimal(1),
    type: "custom",

    getResetGain() {
        return groveGetGain()   // itemized burn — see tuning.js (P42: base × mult × mult × mult)
    },
    getNextAt(canMax) {
        // leaves needed for one more tree (display; other terms assumed at current values)
        let prod = groveGetGain().max(1)
        let factor = tmp.grove.resetGain.add(1).div(tmp.grove.resetGain.max(1))
        return Decimal.pow(10, player.points.add(10).log10().times(factor).sub(10))
    },
    canReset() { return tmp.grove.resetGain.gte(1) },

    gainMult() { return new Decimal(1) },

    // resetsNothing must stay FALSE: the engine's doReset returns before touching ANY lower
    // layer when it is true (Stage 6.5: the plant then never burned the standing tree, which
    // is the Q8 consumable reset). "Nothing above the grove" is the row guard inside the
    // lower layers' own doReset hooks, not this switch. Planting still never resets the
    // grove/worldtree themselves: they define no doReset hook (worldtree's is a no-op).
    resetsNothing() { return false },
    // Deliberately NOT automated: the plant decision is the endgame decision (brief §10).

    layerShown() { return player.grove.unlocked || player.seed.best.gte(50) },
    branches: ["seed"],

    hotkeys: [
        { key: "g", description() { return tt("g: plant a tree", "g：种下一棵树") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        mdisp("grove"),
        "prestige-button",
        ["display-text", function () {
            return tt("<b>Planting burns the standing tree.</b> The grove counts every tree ever planted; each one feeds all growth.", "<b>种下会烧掉眼前的树。</b>树林清点种下的每一棵；每一棵都滋养所有生长。")
        }],
        ["display-text", function () {
            let P = TUNING.PLANT
            let t1 = player.points.add(10).log10()
            let t2 = player.wood.points.add(1).pow(P.woodExp)
            let t3 = player.branch.points.min(player.root.points).add(1).pow(P.armExp)
            let t4 = player.blossom.points.add(1).pow(P.bloomExp).times(player.sap.points.add(1).pow(P.sapExp))
            return tt("This plant burns: leaves term ", "本次将烧掉：树叶项 ") + format(t1) +
                tt(" × wood term ", " × 木头项 ") + format(t2) +
                tt(" × arms term ", " × 枝根项 ") + format(t3) +
                tt(" × bloom-sap term ", " × 花汁项 ") + format(t4)
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    microtabs: {
        stuff: {
            "Grove": { tabLabel() { return tt("Grove", "树林") },  content: [["blank", "10px"], "upgrades"], buttonStyle() { return { "border-color": "#86c5da" } } },
            "Milestones": { tabLabel() { return tt("Milestones", "里程碑") },  content: [["blank", "10px"], "milestones"], buttonStyle() { return { "border-color": "#86c5da" } } },
        },
    },

    prestigeButtonText() {
        let g = tmp.grove.resetGain
        if (g.lt(1)) return tt("The tree is too young to seed the ground (" + format(g) + " trees)", "这棵树还太年轻，无法落籽（" + format(g) + " 棵）")
        return tt("<b>PLANT:</b> burn the tree, grow <b>" + formatWhole(g) + "</b> new tree(s)", "<b>种下：</b>烧掉这棵树，长出 <b>" + formatWhole(g) + "</b> 棵新树")
    },

    upgrades: {
        11: { title() { return tt("Deep Shade", "深荫") }, description() { return tt("Each planted tree pays out 1.5x more (payout base 2 -> 3).", "每棵种下的树收益 ×1.5（收益基数 2 → 3）。") }, cost: new Decimal("1e6"),
              unlocked() { return player.grove.best.gte(1) } },
        12: { title() { return tt("Forest Floor", "林床") }, description() { return tt("All gains ×1.5.", "所有收益 ×1.5。") }, cost: new Decimal("1e8"),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        13: { title() { return tt("Richer Soil", "沃土") }, description() { return tt("Planting yield formula ^1.1.", "种植产出公式 ^1.1。") }, cost: new Decimal("1e10"),
              unlocked() { return hasUpgrade(this.layer, 12) } },
        14: { title() { return tt("World Feeder", "养界之根") }, description() { return tt("World Tree growth ×1.5.", "界树生长 ×1.5。") }, cost: new Decimal("1e12"),
              unlocked() { return hasUpgrade(this.layer, 13) } },
        21: { title() { return tt("Undergrowth", "林下层") }, description() { return tt("Leaf growth ×3.", "树叶生长 ×3。") }, cost: new Decimal("1e14"),
              unlocked() { return hasUpgrade(this.layer, 14) } },
        22: { title() { return tt("Timber Line", "林木线") }, description() { return tt("Wood gain ×3.", "木头收益 ×3。") }, cost: new Decimal("1e15"),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        23: { title() { return tt("Seed Orchard", "种园") }, description() { return tt("Canopy & Seed gain ×1.5.", "冠层与种子收益 ×1.5。") }, cost: new Decimal("1e16"),
              unlocked() { return hasUpgrade(this.layer, 22) } },
        25: { title() { return tt("Old Forest", "老龄林") }, description() { return tt("All gains ×2.", "所有收益 ×2。") }, cost: new Decimal("1e18"),
              unlocked() { return hasUpgrade(this.layer, 23) } },
    },

    milestones: {
        0: { requirementDescription() { return tt("2 trees planted", "种下 2 棵树") }, effectDescription() { return tt("All gains ×1.5", "所有收益 ×1.5") },
             done() { return player.grove.best.gte(2) } },
        1: { requirementDescription() { return tt("3 trees planted", "种下 3 棵树") }, effectDescription() { return tt("Reveal the World Tree", "显现「界树」") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player.grove.best.gte(3) },
             onComplete() { player.worldtree.unlocked = true } },
        2: { requirementDescription() { return tt("5 trees planted", "种下 5 棵树") }, effectDescription() { return tt("Planting keeps every layer's upgrades & milestones", "种树保留所有层的升级与里程碑") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player.grove.best.gte(5) } },
        3: { requirementDescription() { return tt("8 trees planted", "种下 8 棵树") }, effectDescription() { return tt("All gains ×1.5", "所有收益 ×1.5") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player.grove.best.gte(8) } },
        4: { requirementDescription() { return tt("12 trees planted", "种下 12 棵树") }, effectDescription() { return tt("Leaf growth formula ^1.05", "树叶生长公式 ^1.05") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player.grove.best.gte(12) } },
    },
})

// ---------------------------------------------------------------- worldtree (row 4, THE TREE TREE)
addLayer("worldtree", {
    name: "World Tree",
    symbol: "界",
    color: "#d9b3ff",
    resource() { return tt("World-growth", "界树生长") },
    row: 4,
    position: 1,
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) } },

    baseResource: tt("trees planted", "种下的树"),
    baseAmount() { return player.grove.points },
    requires: new Decimal(1),
    type: "custom",

    getResetGain() {
        // the World Tree grows on its own: this value is added every second via passiveGeneration
        let g = player.grove.points.add(1).pow(TUNING.WT.exp)
        g = g.times(this.gainMult()).pow(this.gainExp())
        if (g.gte(this.wtCapStart())) g = g.pow(0.1).times(this.wtCapStart().pow(0.9))
        return g.floor().max(0)
    },
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("worldtree", 12)) m = m.times(1.5)
        if (hasUpgrade("grove", 14)) m = m.times(1.5)     // World Feeder
        m = m.times(allMult(true, true))   // no self-feed AND no payout: the chain paces on planting itself
        return m
    },
    gainExp() {
        let e = new Decimal(1)
        if (hasMilestone("worldtree", 6)) e = e.add(0.05)
        if (hasMilestone("worldtree", 10)) e = e.add(0.05)
        if (hasMilestone("worldtree", 12)) e = e.add(0.08)
        if (hasUpgrade("worldtree", 25)) e = e.add(0.1) // The Crown
        return e
    },
    wtCapStart() {
        let s = new Decimal("1e6")
        if (hasUpgrade("worldtree", 21)) s = s.times(5)   // visible staged cap raise
        return s
    },
    getNextAt() { return new Decimal("1e1000") },  // never prestiges — the crown only grows (D-CUSTOMNEXTAT)
    canReset() { return false },
    resetsNothing() { return true },
    passiveGeneration() { return player.grove.best.gte(1) ? 1 : 0 },   // the crown wakes when the first tree is planted — the engine applies passive gen to LOCKED layers too (Stage 6.5: ungated growth fired m0 within seconds of a fresh boot)

    layerShown() { return player.worldtree.unlocked || player.grove.best.gte(1) },
    branches: ["grove"],

    doReset(resettingLayer) {},   // nothing is above the World Tree

    tabFormat: [
        ["display-text", function () {
            return tt("You have <b>", "你有 <b>") + format(player.worldtree.points) + tt("</b> World-growth", "</b> 界树生长") +
                tt("<br>It grows by itself: +", "<br>它自行生长：+") + format(tmp.worldtree.resetGain) + tt("/s", "/秒")
        }, { "font-size": "20px", "color": "#d9b3ff" }],
        ["display-text", function () {
            return tt("The World Tree feeds on every tree you have ever planted: ", "界树以你种下的每一棵树为食：") + formatWhole(player.grove.points) + tt(" trees.", " 棵树。")
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    microtabs: {
        stuff: {
            "Crown": { tabLabel() { return tt("Crown", "树冠") },  content: [["blank", "10px"], "upgrades"], buttonStyle() { return { "border-color": "#d9b3ff" } } },
            "The Tree": { tabLabel() { return tt("The Tree", "界树") },  content: [["blank", "10px"], "milestones"], buttonStyle() { return { "border-color": "#d9b3ff" } } },
        },
    },

    upgrades: {
        11: { title() { return tt("World Roots", "界根") }, description() { return tt("Leaf growth formula ^1.02.", "树叶生长公式 ^1.02。") }, cost: new Decimal(1) },
        12: { title() { return tt("Deep Sky", "深空之冠") }, description() { return tt("World Tree growth ×1.5.", "界树生长 ×1.5。") }, cost: new Decimal(3),
              unlocked() { return hasUpgrade(this.layer, 11) } },
        13: { title() { return tt("Continental Canopy", "洲际之冠") }, description() { return tt("All gains ×1.5.", "所有收益 ×1.5。") }, cost: new Decimal(10),
              unlocked() { return hasUpgrade(this.layer, 12) } },
        14: { title() { return tt("Seed of Seeds", "种中之种") }, description() { return tt("Planting yields ×1.5.", "种植产出 ×1.5。") }, cost: new Decimal(50),
              unlocked() { return hasUpgrade(this.layer, 13) } },
        15: { title() { return tt("Sky Leaves", "天叶") }, description() { return tt("Leaf growth ×5.", "树叶生长 ×5。") }, cost: new Decimal(250),
              unlocked() { return hasUpgrade(this.layer, 14) } },
        21: { title() { return tt("Higher Sky", "更高天") }, description() { return tt("The World Tree's growth cap starts 10× later (visible).", "界树生长上限起点 ×5（可见）。") }, cost: new Decimal(1000),
              unlocked() { return hasUpgrade(this.layer, 15) } },
        22: { title() { return tt("World Timber", "界木") }, description() { return tt("Wood gain ×5.", "木头收益 ×5。") }, cost: new Decimal(1e4),
              unlocked() { return hasUpgrade(this.layer, 21) } },
        23: { title() { return tt("World Branches", "界枝") }, description() { return tt("Canopy & Seed gain ×1.5.", "冠层与种子收益 ×1.5。") }, cost: new Decimal(1e5),
              unlocked() { return hasUpgrade(this.layer, 22) } },
        24: { title() { return tt("World Weather", "界之气候") }, description() { return tt("All gains ×2.", "所有收益 ×2。") }, cost: new Decimal(1e6),
              unlocked() { return hasUpgrade(this.layer, 23) } },
        25: { title() { return tt("The Crown", "树冠") }, description() { return tt("World Tree growth formula ^1.1.", "界树生长公式 ^1.1。") }, cost: new Decimal(1e7),
              unlocked() { return hasUpgrade(this.layer, 24) } },
    },

    milestones: {
        0: { requirementDescription() { return tt("1 World-growth", "1 界树生长") }, effectDescription() { return tt("All gains ×1.5 — the crown stirs", "所有收益 ×1.5——树冠微动") },
             done() { return player.worldtree.best.gte(1) } },
        1: { requirementDescription() { return tt("2 World-growth", "2 界树生长") }, effectDescription() { return tt("All gains ×1.5", "所有收益 ×1.5") },
             unlocked() { return hasMilestone(this.layer, 0) },
             done() { return player.worldtree.best.gte(2) } },
        2: { requirementDescription() { return tt("4 World-growth", "4 界树生长") }, effectDescription() { return tt("THE PACKAGE: Canopy presses, buys and endures automatically", "全家桶：冠层自动声望、自动购买、且不再重置下层") },
             unlocked() { return hasMilestone(this.layer, 1) },
             done() { return player.worldtree.best.gte(4) } },
        3: { requirementDescription() { return tt("8 World-growth", "8 界树生长") }, effectDescription() { return tt("All gains ×2", "所有收益 ×2") },
             unlocked() { return hasMilestone(this.layer, 2) },
             done() { return player.worldtree.best.gte(8) } },
        4: { requirementDescription() { return tt("16 World-growth", "16 界树生长") }, effectDescription() { return tt("Growth Rings (Wood buyable) effect ^1.2", "「年轮」效果 ^1.2") },
             unlocked() { return hasMilestone(this.layer, 3) },
             done() { return player.worldtree.best.gte(16) } },
        5: { requirementDescription() { return tt("32 World-growth", "32 界树生长") }, effectDescription() { return tt("All gains ×3", "所有收益 ×3") },
             unlocked() { return hasMilestone(this.layer, 4) },
             done() { return player.worldtree.best.gte(32) } },
        6: { requirementDescription() { return tt("65 World-growth", "65 界树生长") }, effectDescription() { return tt("World Tree growth formula ^1.05", "界树生长公式 ^1.05") },
             unlocked() { return hasMilestone(this.layer, 5) },
             done() { return player.worldtree.best.gte(65) } },
        7: { requirementDescription() { return tt("130 World-growth", "130 界树生长") }, effectDescription() { return tt("All gains ×1.5", "所有收益 ×1.5") },
             unlocked() { return hasMilestone(this.layer, 6) },
             done() { return player.worldtree.best.gte(130) } },
        8: { requirementDescription() { return tt("260 World-growth", "260 界树生长") }, effectDescription() { return tt("All gains ×2", "所有收益 ×2") },
             unlocked() { return hasMilestone(this.layer, 7) },
             done() { return player.worldtree.best.gte(260) } },
        9: { requirementDescription() { return tt("2,000 World-growth", "2,000 界树生长") }, effectDescription() { return tt("All gains ×3", "所有收益 ×3") },
             unlocked() { return hasMilestone(this.layer, 8) },
             done() { return player.worldtree.best.gte(1500) } },
        10: { requirementDescription() { return tt("10,000 World-growth", "10,000 界树生长") }, effectDescription() { return tt("World Tree growth formula ^1.05", "界树生长公式 ^1.05") },
             unlocked() { return hasMilestone(this.layer, 9) },
             done() { return player.worldtree.best.gte(8000) } },
        11: { requirementDescription() { return tt("80,000 World-growth", "80,000 界树生长") }, effectDescription() { return tt("All gains ×3", "所有收益 ×3") },
             unlocked() { return hasMilestone(this.layer, 10) },
             done() { return player.worldtree.best.gte(40000) } },
        12: { requirementDescription() { return tt("1,000,000 World-growth", "100 万界树生长") }, effectDescription() { return tt("World Tree growth formula ^1.08", "界树生长公式 ^1.08") },
             unlocked() { return hasMilestone(this.layer, 11) },
             done() { return player.worldtree.best.gte(200000) } },
        13: { requirementDescription() { return tt("1,000,000 World-growth", "100 万界树生长") }, effectDescription() { return tt("All gains ×5", "所有收益 ×5") },
             unlocked() { return hasMilestone(this.layer, 12) },
             done() { return player.worldtree.best.gte(2000000) } },
        14: { requirementDescription() { return tt("5,000,000 World-growth", "500 万界树生长") }, effectDescription() { return tt("All gains ×5 — <b>THE TREE TREE is grown.</b>", "所有收益 ×5——<b>树中之树，长成了。</b>") },
             unlocked() { return hasMilestone(this.layer, 13) },
             done() { return player.worldtree.best.gte(12000000) } },
    },
})
