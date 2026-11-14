// layers4.js — rows 9–11: 分形 fr (static), 奇点 si, 衔尾 ou (+ the tuning manifold, Q8 endgame)

// ---------------- row 9 — 分形 Fractal (static floor) ----------------
addLayer("fr", {
    name: "Fractal",
    symbol: "分",
    position: 0,
    row: 9,
    color: "#66bb6a",
    resource() { return lg("分形", "fractals") },
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},

    baseResource() { return lg("混沌", "chaos") },
    baseAmount() { return player.ch.points },
    requires: new Decimal(1e12),
    type: "static",
    base: 2,
    exponent: 1,
    roundUpCost: true,
    resetDescription() { return lg("分形出", "Fractal for ") },
    canBuyMax() { return hasUpgrade("fr", 13) },

    effect() {
        return { echoMult: player.fr.points.add(1).pow(TUNING.ECHO_POW) }
    },
    effectDescription() {
        return lg("你的分形把更老的每一层推 ×" + format(this.effect().echoMult), "Your fractals boost every older layer by ×" + format(this.effect().echoMult))
    },

    gainMult() {
        let m = new Decimal(1)
        m = m.div(Decimal.pow(coreDiscount(), getBuyableAmount("fr", 11)))   // 自相似核
        m = m.div(echoWeb(["si", "ou"]))
        m = m.div(achievementReward("fr"))
        return m
    },
    gainExp() { return manifoldMod("fr") },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let kept = ["best", "total"]
            if (hasMilestone("ou", 6)) kept.push("upgrades")
            if (hasMilestone("ou", 7)) kept.push("milestones")
            layerDataReset(this.layer, kept)
        }
    },

    hotkeys: [
        { key: "z", description() { return lg("z: 分形出分形", "z: fractal out") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            return lg("下一个分形成本：", "Next fractal costs: ") + format(tmp.fr.nextAt) + " " + lg("混沌", "chaos")
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": { content: [["blank", "12px"], "upgrades"] },
            "Milestones": { content: [["blank", "12px"], "milestones"] },
            "Cores": { content: [["blank", "12px"], "buyables"] },
            "Formula": { content: [
                ["blank", "12px"],
                ["display-text", function() {
                    return lg("分形是地板：每道成本 = 1e12 × 2^层数 × 价格系数。自相似核（自增益项）让价格 ÷" + coreDiscount() + "^级 —— 核里长出核。",
                              "Fractals are a floor: each costs 1e12 × 2^floors × price factors. Self-Similarity Cores (self-gain) divide the price by " + coreDiscount() + "^level — cores growing cores.")
                }],
            ] },
        },
    },

    upgrades: {
        11: {
            title() { return lg("自我复制", "Self-Replication") },
            description() { return lg("微响产量 ×3。", "Hum gain ×3.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return lg("科赫曲线", "Koch Curve") },
            description() { return lg("「自相似核」的价格折扣 1.3 → 1.55。", "The Self-Similarity Core price discount 1.3 → 1.55 per level.") },
            cost: new Decimal(3),
        },
        13: {
            title() { return lg("一次性分满", "Buy Max") },
            description() { return lg("解锁分形「一次分满」。", "Unlock buy-max for fractals.") },
            cost: new Decimal(6),
        },
        14: {
            title() { return lg("无限细节", "Infinite Detail") },
            description() { return lg("泛音产量基于分形。", "Overtone gain is boosted by fractals.") },
            cost: new Decimal(12),
            effect() { return player.fr.points.add(1).pow(0.2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        15: {
            title() { return lg("曼德博馈能", "Mandelbrot Feed") },
            description() { return lg("反馈环产量 ×5。", "Feedback gain ×5.") },
            cost: new Decimal(25),
        },
        21: {
            title() { return lg("分形驻波", "Fractal Standing Wave") },
            description() { return lg("驻波成本 ÷2。", "Standing waves cost ÷2.") },
            cost: new Decimal(50),
        },
        22: {
            title() { return lg("分形干涉", "Fractal Interference") },
            description() { return lg("干波成本 ÷2。", "Interference waves cost ÷2.") },
            cost: new Decimal(100),
        },
        23: {
            title() { return lg("混沌边缘", "Edge of Chaos") },
            description() { return lg("「吸引子」效果 +0.05 每级。", "The Attractor effect +0.05 per level.") },
            cost: new Decimal(200),
        },
        24: {
            title() { return lg("谢尔宾斯基地毯", "Sierpinski Carpet") },
            description() { return lg("涟漪产量 ×8。", "Ripple gain ×8.") },
            cost: new Decimal(400),
        },
        25: {
            title() { return lg("回声分形", "Echo Fractal") },
            description() { return lg("回声产量 ×8。", "Echo gain ×8.") },
            cost: new Decimal(800),
        },
        31: {
            title() { return lg("谐振分形", "Resonant Fractal") },
            description() { return lg("谐振产量 ×8。", "Resonance gain ×8.") },
            cost: new Decimal(2000),
        },
    },

    milestones: {
        0: {
            requirementDescription() { return lg("分出 5 个分形（最高值）", "Fractal out 5 times (best)") },
            effectDescription() { return lg("反馈环产量 ×25。", "Feedback gain ×25.") },
            done() { return player.fr.best.gte(5) },
        },
        1: {
            requirementDescription() { return lg("分出 10 个分形（最高值）", "Fractal out 10 times (best)") },
            effectDescription() { return lg("混沌产量 ×25。", "Chaos gain ×25.") },
            done() { return player.fr.best.gte(10) },
            unlocked() { return hasMilestone("fr", 0) },
        },
        2: {
            requirementDescription() { return lg("分出 20 个分形（最高值）", "Fractal out 20 times (best)") },
            effectDescription() { return lg("「自相似核」价格折扣 +0.1。", "The Self-Similarity Core price discount +0.1 per level.") },
            done() { return player.fr.best.gte(20) },
            unlocked() { return hasMilestone("fr", 1) },
        },
        3: {
            requirementDescription() { return lg("分出 35 个分形（最高值）", "Fractal out 35 times (best)") },
            effectDescription() { return lg("「吸引子」效果 +0.15。", "The Attractor effect +0.15.") },
            done() { return player.fr.best.gte(35) },
            unlocked() { return hasMilestone("fr", 2) },
        },
        4: {
            requirementDescription() { return lg("分出 55 个分形（最高值）", "Fractal out 55 times (best)") },
            effectDescription() { return lg("混沌产量 ×100。", "Chaos gain ×100.") },
            done() { return player.fr.best.gte(55) },
            unlocked() { return hasMilestone("fr", 3) },
        },
    },

    buyables: {
        11: {
            title() { return lg("自相似核", "Self-Similarity Core") },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return lg("自增益项：每颗核让分形价格 ÷" + coreDiscount() + "，涟漪产量 ×1.12 —— 核里长出核。<br>当前价格折扣：",
                          "Self-gain: each core divides fractal prices by " + coreDiscount() + " and boosts ripple gain ×1.12 — cores growing cores.<br>Current discount: ")
                    + format(d.effect.discount) + lg("<br>涟漪加成：", "<br>Ripple boost: ") + format(d.effect.wide)
                    + "x" + lg("<br>数量：", "<br>Owned: ") + formatWhole(getBuyableAmount(this.layer, this.id))
                    + lg("<br>成本：", "<br>Cost: ") + format(d.cost) + " " + lg("分形", "fractals")
            },
            cost(x) { return Decimal.pow(5, x).times(30) },
            effect(x) { return { discount: Decimal.pow(coreDiscount(), x), wide: Decimal.pow(1.12, x) } },
            canAfford() { return player.fr.points.gte(tmp.fr.buyables[11].cost) },
            buy() {
                let c = tmp.fr.buyables[11].cost
                player.fr.points = player.fr.points.sub(c)
                player.fr.spentOnBuyables = player.fr.spentOnBuyables.add(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return player.fr.best.gte(2) },
        },
    },

    // static automation package granted by si.m3 — N-AUTOWIPE: all three flags read the same milestone
    resetsNothing() { return hasMilestone("si", 3) },
    autoPrestige() { return hasMilestone("si", 3) },
    autoUpgrade() { return hasMilestone("si", 3) },
    automate() {
        if (hasMilestone("ou", 0)) geoBuyMax("fr", 11, 30, 5)
    },
})

// 自相似核 per-level discount (knobs: fr 12 / fr m2 / si 23)
function coreDiscount() {
    return 1.3 + (hasUpgrade("fr", 12) ? 0.25 : 0) + (hasMilestone("fr", 2) ? 0.1 : 0) + (hasUpgrade("si", 23) ? 0.15 : 0)
}

// ---------------- row 10 — 奇点 Singularity ----------------
addLayer("si", {
    name: "Singularity",
    symbol: "奇",
    position: 0,
    row: 10,
    color: "#26a69a",
    resource() { return lg("奇点", "singularities") },
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},

    baseResource() { return lg("混沌", "chaos") },
    baseAmount() { return player.ch.points },
    requires: new Decimal(1e13),
    type: "normal",
    exponent: 0.3,
    resetDescription() { return lg("坍缩出", "Collapse for ") },

    effect() {
        return { echoMult: player.si.points.add(1).pow(TUNING.ECHO_POW) }
    },
    effectDescription() {
        return lg("你的奇点把更老的每一层推 ×" + format(this.effect().echoMult), "Your singularities boost every older layer by ×" + format(this.effect().echoMult))
    },

    softcap() {
        let s = new Decimal(TUNING.SOFTCAP_START.si)
        if (hasUpgrade("si", 13)) s = s.times(10)
        return s
    },
    softcapPower() { return new Decimal(TUNING.SOFTCAP_POW.si) },

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("si", 12)) m = m.times(upgradeEffect("si", 12))    // 事件视界 — the self-term (reads best)
        if (hasUpgrade("si", 22)) m = m.times(2)
        if (hasUpgrade("ou", 15)) m = m.times(3)                          // 尾环共鸣
        if (hasMilestone("si", 4)) m = m.times(100)
        if (hasMilestone("si", 5)) m = m.times(500)
        m = m.times(echoWeb(["ou"]))
        m = m.times(achievementReward("si"))
        return m
    },
    gainExp() { return manifoldMod("si") },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let kept = ["best", "total"]
            if (hasMilestone("ou", 6)) kept.push("upgrades")
            if (hasMilestone("ou", 7)) kept.push("milestones")
            layerDataReset(this.layer, kept)
        }
    },

    hotkeys: [
        { key: "x", description() { return lg("x: 坍缩出奇点", "x: collapse a singularity") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            let cap = tmp.si.softcap
            if (player.si.points.gte(cap.times(0.5)))
                return "<span style='color:#ffb74d'>" + lg("软帽将于 " + format(cap) + " 奇点处生效", "Softcap starts at " + format(cap) + " singularities") + "</span>"
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": { content: [["blank", "12px"], "upgrades"] },
            "Milestones": { content: [["blank", "12px"], "milestones"] },
            "Formula": { content: [
                ["blank", "12px"],
                ["display-text", function() {
                    return lg("奇点产量 = (混沌 ÷ 1e13)^0.3 × 乘区 × 帽", "Singularity gain = (chaos ÷ 1e13)^0.3 × zones × cap")
                }],
                ["display-text", function() {
                    if (!hasUpgrade("si", 12)) return ""
                    return lg("事件视界（自增益项）：奇点最高值^" + TUNING.SELF_EXP.si + " —— 越大的奇点吞得越快。",
                              "Event Horizon (self-gain): singularity best^" + TUNING.SELF_EXP.si + " — the bigger the singularity, the faster it devours.")
                }],
            ] },
        },
    },

    upgrades: {
        11: {
            title() { return lg("引力坍缩", "Gravitational Collapse") },
            description() { return lg("微响产量 ×3。", "Hum gain ×3.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return lg("事件视界", "Event Horizon") },
            description() { return lg("<b>自增益项</b>：奇点产量基于奇点最高值（越大的奇点吞得越快）。", "<b>Self-gain:</b> singularity gain is boosted by your singularity BEST (bigger holes devour faster).") },
            cost: new Decimal(6),
            effect() { return softcap(player.si.best.add(1).pow(TUNING.SELF_EXP.si), new Decimal(TUNING.SELF_CAP_START.si), TUNING.SELF_CAP_POW) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        13: {
            title() { return lg("吸积盘", "Accretion Disk") },
            description() { return lg("奇点软帽起点 ×10。", "Singularity softcap starts ×10 later.") },
            cost: new Decimal(30),
        },
        14: {
            title() { return lg("引力透镜", "Gravitational Lensing") },
            description() { return lg("泛音产量基于奇点。", "Overtone gain is boosted by singularities.") },
            cost: new Decimal(150),
            effect() { return player.si.points.add(1).pow(0.2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        15: {
            title() { return lg("霍金辐射", "Hawking Radiation") },
            description() { return lg("反馈环产量 ×8。", "Feedback gain ×8.") },
            cost: new Decimal(800),
        },
        21: {
            title() { return lg("透镜增辉", "Brighter Lens") },
            description() { return lg("混沌产量 ×3。", "Chaos gain ×3.") },
            cost: new Decimal(5000),
        },
        22: {
            title() { return lg("潮汐锁定", "Tidal Lock") },
            description() { return lg("奇点产量 ×2，且奇点软帽起点 ×10。", "Singularity gain ×2, and its softcap starts ×10 later.") },
            cost: new Decimal(5e4),
        },
        23: {
            title() { return lg("潮汐力", "Tidal Force") },
            description() { return lg("「自相似核」价格折扣 +0.15。", "The Self-Similarity Core price discount +0.15 per level.") },
            cost: new Decimal(1e6),
        },
        24: {
            title() { return lg("时空涟漪", "Spacetime Ripples") },
            description() { return lg("涟漪产量 ×10。", "Ripple gain ×10.") },
            cost: new Decimal(2e7),
        },
        25: {
            title() { return lg("回声视界", "Echo Horizon") },
            description() { return lg("回声产量 ×10。", "Echo gain ×10.") },
            cost: new Decimal(5e8),
        },
        31: {
            title() { return lg("谐振坍缩", "Resonant Collapse") },
            description() { return lg("谐振产量 ×10。", "Resonance gain ×10.") },
            cost: new Decimal(2e10),
        },
    },

    milestones: {
        0: {
            requirementDescription() { return lg("拥有 30 奇点（最高值）", "Reach 30 singularities (best)") },
            effectDescription() { return lg("「谐振腔」「谐波列」「拍频节点」「振荡器」自动购买。", "Cavities, Overtone Series, Beat Nodes and Oscillators are bought automatically.") },
            done() { return player.si.best.gte(30) },
        },
        1: {
            requirementDescription() { return lg("拥有 100 奇点（最高值）", "Reach 100 singularities (best)") },
            effectDescription() { return lg("自动购买泛音升级。", "Overtone upgrades are bought automatically.") },
            done() { return player.si.best.gte(100) },
            unlocked() { return hasMilestone("si", 0) },
        },
        2: {
            requirementDescription() { return lg("拥有 300 奇点（最高值）", "Reach 300 singularities (best)") },
            effectDescription() { return lg("自动购买混沌升级。", "Chaos upgrades are bought automatically.") },
            done() { return player.si.best.gte(300) },
            unlocked() { return hasMilestone("si", 1) },
        },
        3: {
            requirementDescription() { return lg("拥有 1000 奇点（最高值）", "Reach 1000 singularities (best)") },
            effectDescription() { return lg("分形全自动（自动分形、自动升级、不再清空混沌）。", "Fractals go fully automatic (auto-fractaling, auto-upgrades, no more chaos wipe).") },
            done() { return player.si.best.gte(1000) },
            unlocked() { return hasMilestone("si", 2) },
        },
        4: {
            requirementDescription() { return lg("拥有 3000 奇点（最高值）", "Reach 3000 singularities (best)") },
            effectDescription() { return lg("奇点产量 ×100。", "Singularity gain ×100.") },
            done() { return player.si.best.gte(3000) },
            unlocked() { return hasMilestone("si", 3) },
        },
        5: {
            requirementDescription() { return lg("拥有 1e4 奇点（最高值）", "Reach 1e4 singularities (best)") },
            effectDescription() { return lg("「视界吞噬」：奇点产量 ×500。", "Horizon Devour: singularity gain ×500.") },
            done() { return player.si.best.gte(1e4) },
            unlocked() { return hasMilestone("si", 4) },
        },
    },

    // automation: passiveGen ← ou.m1 ; autoUpgrade ← ou.m2
    passiveGeneration() { return hasMilestone("ou", 1) ? 2 : 0 },
    autoUpgrade() { return hasMilestone("ou", 2) },
})

// ---------------- row 11 — 衔尾 Ouroboros (+ the tuning manifold) ----------------
addLayer("ou", {
    name: "Ouroboros",
    symbol: "衔",
    position: 0,
    row: 11,
    color: "#ec407a",
    resource() { return lg("衔尾", "ouroboros") },
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},

    baseResource() { return lg("奇点", "singularities") },
    baseAmount() { return player.si.points },
    requires: new Decimal(1e14),
    type: "normal",
    exponent: 0.3,
    resetDescription() { return lg("咬合成环", "Bite for ") },

    effect() {
        return { echoMult: player.ou.points.add(1).pow(TUNING.ECHO_POW) }
    },
    effectDescription() {
        return lg("你的衔尾把更老的每一层推 ×" + format(this.effect().echoMult) + "，并在「调谐流形」里重新调音整棵树。",
                  "Your ouroboros boosts every older layer by ×" + format(this.effect().echoMult) + " and retunes the whole tree in the Tuning Manifold.")
    },

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("ou", 12)) m = m.times(upgradeEffect("ou", 12))    // 自噬 — the self-term (reads best)
        if (hasMilestone("ou", 3)) m = m.times(10)
        if (hasMilestone("ou", 4)) m = m.times(25)
        m = m.times(achievementReward("ou"))
        return m
    },
    gainExp() { return manifoldMod("ou") },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let kept = ["best", "total"]
            layerDataReset(this.layer, kept)
        }
    },

    hotkeys: [
        { key: "u", description() { return lg("u: 咬合成环，获得衔尾", "u: bite the tail") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": { content: [["blank", "12px"], "upgrades"] },
            "Milestones": { content: [["blank", "12px"], "milestones"] },
            "Manifold": { content: [
                ["blank", "12px"],
                ["display-text", function() {
                    return lg("<b>调谐流形</b>：衔尾吃掉自己的尾巴，把吃下去的每一分都变成「调音」。13 条回路，各自的总指数由你亲手拧——10 级以内是中性微调，超过 10 级每级把那条回路的指数加深 0.05。拧哪个，树就朝哪边倒。",
                              "<b>The Tuning Manifold</b>: the ouroboros eats its own tail and turns every bite into tuning. 13 loops, each with an exponent you tune by hand — levels up to 10 are neutral trim, and every level past 10 deepens that loop's exponent by 0.05. Where you tune is where the tree leans.")
                }],
                ["blank", "12px"],
                "buyables",
            ] },
            "Formula": { content: [
                ["blank", "12px"],
                ["display-text", function() {
                    return lg("衔尾产量 = (奇点 ÷ 1e14)^0.3 × 乘区（无软帽——终章的蛇不需要天花板）",
                              "Ouroboros gain = (singularities ÷ 1e14)^0.3 × zones (no softcap — the final snake needs no ceiling)")
                }],
                ["display-text", function() {
                    if (!hasUpgrade("ou", 12)) return ""
                    return lg("自噬（自增益项）：衔尾最高值^0.3 —— 蛇吃自己，越长越大。", "Autophagy (self-gain): ouroboros best^0.3 — the snake eats itself, and grows.")
                }],
            ] },
        },
    },

    upgrades: {
        11: {
            title() { return lg("衔尾之首", "Head of the Snake") },
            description() { return lg("微响产量 ×10。", "Hum gain ×10.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return lg("自噬", "Autophagy") },
            description() { return lg("<b>自增益项</b>：衔尾产量基于衔尾最高值（蛇吃自己）。", "<b>Self-gain:</b> ouroboros gain is boosted by your ouroboros BEST (the snake eats itself).") },
            cost: new Decimal(3),
            effect() { return softcap(player.ou.best.add(1).pow(0.3), new Decimal(TUNING.SELF_CAP_START.ou), TUNING.SELF_CAP_POW) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        13: {
            title() { return lg("流形扩容", "Manifold Expansion") },
            description() { return lg("调谐流形的等级上限 14 → 15。", "The Tuning Manifold's level cap 14 → 15.") },
            cost: new Decimal(8),
        },
        14: {
            title() { return lg("时间闭环", "Closed Timelike Curve") },
            description() { return lg("微响产量基于衔尾。", "Hum gain is boosted by ouroboros.") },
            cost: new Decimal(20),
            effect() { return player.ou.points.add(1).pow(0.3) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        15: {
            title() { return lg("尾环共鸣", "Tail Resonance") },
            description() { return lg("奇点产量 ×3。", "Singularity gain ×3.") },
            cost: new Decimal(50),
        },
        21: {
            title() { return lg("涟漪归环", "Ripples Return") },
            description() { return lg("涟漪产量 ×10。", "Ripple gain ×10.") },
            cost: new Decimal(120),
        },
        22: {
            title() { return lg("回声归环", "Echoes Return") },
            description() { return lg("回声产量 ×10。", "Echo gain ×10.") },
            cost: new Decimal(300),
        },
        23: {
            title() { return lg("谐振归环", "Resonance Returns") },
            description() { return lg("谐振产量 ×10。", "Resonance gain ×10.") },
            cost: new Decimal(800),
        },
        24: {
            title() { return lg("环流归环", "Loops Return") },
            description() { return lg("反馈环产量 ×10。", "Feedback gain ×10.") },
            cost: new Decimal(1600),
        },
        25: {
            title() { return lg("泛音归环", "Overtones Return") },
            description() { return lg("泛音产量 ×10。", "Overtone gain ×10.") },
            cost: new Decimal(2500),
        },
        31: {
            title() { return lg("流形折扣", "Manifold Discount") },
            description() { return lg("调谐流形全部费用 ÷2。", "All Tuning Manifold costs ÷2.") },
            cost: new Decimal(4000),
        },
    },

    milestones: {
        0: {
            requirementDescription() { return lg("咬出 3 衔尾（最高值）", "Bite 3 ouroboros (best)") },
            effectDescription() { return lg("「波腹」「自相似核」「吸引子」自动购买。", "Antinodes, Self-Similarity Cores and Attractors are bought automatically.") },
            done() { return player.ou.best.gte(3) },
        },
        1: {
            requirementDescription() { return lg("咬出 5 衔尾（最高值）", "Bite 5 ouroboros (best)") },
            effectDescription() { return lg("奇点自动增长（被动生成）。", "Singularities generate passively.") },
            done() { return player.ou.best.gte(5) },
            unlocked() { return hasMilestone("ou", 0) },
        },
        2: {
            requirementDescription() { return lg("咬出 8 衔尾（最高值）", "Bite 8 ouroboros (best)") },
            effectDescription() { return lg("自动购买奇点升级。", "Singularity upgrades are bought automatically.") },
            done() { return player.ou.best.gte(8) },
            unlocked() { return hasMilestone("ou", 1) },
        },
        3: {
            requirementDescription() { return lg("咬出 12 衔尾（最高值）", "Bite 12 ouroboros (best)") },
            effectDescription() { return lg("衔尾产量 ×10。", "Ouroboros gain ×10.") },
            done() { return player.ou.best.gte(12) },
            unlocked() { return hasMilestone("ou", 2) },
        },
        4: {
            requirementDescription() { return lg("咬出 20 衔尾（最高值）", "Bite 20 ouroboros (best)") },
            effectDescription() { return lg("衔尾产量 ×25。", "Ouroboros gain ×25.") },
            done() { return player.ou.best.gte(20) },
            unlocked() { return hasMilestone("ou", 3) },
        },
        5: {
            requirementDescription() { return lg("咬出 30 衔尾（最高值）", "Bite 30 ouroboros (best)") },
            effectDescription() { return lg("「万流归一」：微响产量基于奇点。", "All Streams Converge: hum gain is boosted by singularities.") },
            done() { return player.ou.best.gte(30) },
            unlocked() { return hasMilestone("ou", 4) },
        },
        6: {
            requirementDescription() { return lg("咬出 50 衔尾（最高值）", "Bite 50 ouroboros (best)") },
            effectDescription() { return lg("「结构记忆」：任何重置都保留各层升级。", "Structural Memory: every reset keeps upgrades.") },
            done() { return player.ou.best.gte(50) },
            unlocked() { return hasMilestone("ou", 5) },
        },
        7: {
            requirementDescription() { return lg("咬出 80 衔尾（最高值）", "Bite 80 ouroboros (best)") },
            effectDescription() { return lg("「永恒记忆」：任何重置都保留各层里程碑。", "Eternal Memory: every reset keeps milestones.") },
            done() { return player.ou.best.gte(80) },
            unlocked() { return hasMilestone("ou", 6) },
        },
        8: {
            requirementDescription() { return lg("咬出 120 衔尾（最高值）", "Bite 120 ouroboros (best)") },
            effectDescription() { return lg("「完美回环」：调谐流形全部费用 ÷2。", "Perfect Loop: all manifold costs ÷2.") },
            done() { return player.ou.best.gte(120) },
            unlocked() { return hasMilestone("ou", 7) },
        },
        9: {
            requirementDescription() { return lg("咬出 200 衔尾（最高值）", "Bite 200 ouroboros (best)") },
            effectDescription() { return lg("「无限调音」：调谐流形等级上限 16。", "Infinite Tuning: the manifold's level cap reaches 16.") },
            done() { return player.ou.best.gte(200) },
            unlocked() { return hasMilestone("ou", 8) },
        },
    },

    // ---- the Tuning Manifold: 13 buyables, one per currency (Q8) ----
    buyables: (function() {
        const NAMES = {
            11: ["微响", "hums"], 12: ["涟漪", "ripples"], 13: ["回声", "echoes"],
            21: ["谐振", "resonance"], 22: ["驻波", "standing waves"], 23: ["反馈环", "feedback loops"],
            31: ["泛音", "overtones"], 32: ["干波", "interference"], 33: ["自振荡", "self-oscillation"],
            41: ["混沌", "chaos"], 42: ["分形", "fractals"], 43: ["奇点", "singularities"],
            51: ["衔尾", "ouroboros"],
        }
        let bs = {}
        for (let id in NAMES) {
            bs[id] = {
                title() { return lg("调谐 · " + NAMES[id][0], "Tune · " + NAMES[id][1]) },
                display() {
                    let d = tmp.ou.buyables[id]
                    let lv = getBuyableAmount("ou", id).toNumber()
                    let cap = manifoldMaxLevel()
                    let over = Math.min(lv, cap) - TUNING.MANIFOLD.neutral
                    let line = over > 0
                        ? lg("指数加成 ×" + (1 + over * TUNING.MANIFOLD.step).toFixed(2), "exponent ×" + (1 + over * TUNING.MANIFOLD.step).toFixed(2))
                        : lg("中性 —— 等级超过 10 后，每级把这条回路的指数加深 0.05", "neutral — past level 10, each level deepens this loop's exponent by 0.05")
                    return lg("把这条回路的声望指数亲手拧深。<br>", "Tune this loop's prestige exponent by hand.<br>") + line +
                        lg("<br>等级：", "<br>Level: ") + formatWhole(lv) + " / " + cap +
                        lg("<br>成本：", "<br>Cost: ") + format(d.cost) + " " + lg("衔尾", "ouroboros")
                },
                cost(x) {
                    let c = Decimal.pow(TUNING.MANIFOLD.mult, x).times(TUNING.MANIFOLD.start)
                    if (hasUpgrade("ou", 31) || hasMilestone("ou", 8)) c = c.div(2)
                    return c
                },
                canAfford() { return player.ou.points.gte(tmp.ou.buyables[id].cost) && getBuyableAmount("ou", id).lt(manifoldMaxLevel()) },
                buy() {
                    if (getBuyableAmount("ou", id).gte(manifoldMaxLevel())) return
                    let c = tmp.ou.buyables[id].cost
                    player.ou.points = player.ou.points.sub(c).max(0)
                    player.ou.spentOnBuyables = player.ou.spentOnBuyables.add(c)
                    setBuyableAmount("ou", id, getBuyableAmount("ou", id).add(1))
                },
            }
        }
        return bs
    })(),
})
