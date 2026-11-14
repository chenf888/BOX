// layers3.js — rows 6–8: 干波 in (static), 自振荡 so, 混沌 ch
// Every upgrade here has a named consumer in mod.js / layers1 / layers2 / this file (N-UNWIRED).

// ---------------- row 6 — 干波 Interference (static floor) ----------------
addLayer("in", {
    name: "Interference",
    symbol: "干",
    position: 0,
    row: 6,
    color: "#ff7043",
    resource() { return lg("干波", "interference waves") },
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},

    baseResource() { return lg("泛音", "overtones") },
    baseAmount() { return player.ov.points },
    requires: new Decimal(1e9),
    type: "static",
    base: 2,
    exponent: 1,
    roundUpCost: true,
    resetDescription() { return lg("叠加出", "Interfere for ") },
    canBuyMax() { return hasUpgrade("in", 15) },

    effect() {
        return { echoMult: player.in.points.add(1).pow(TUNING.ECHO_POW) }
    },
    effectDescription() {
        return lg("你的干波把更老的每一层推 ×" + format(this.effect().echoMult), "Your interference waves boost every older layer by ×" + format(this.effect().echoMult))
    },

    // static: smaller gainMult = cheaper; the Beat Nodes feed the price themselves
    gainMult() {
        let m = new Decimal(1)
        let d = 1.35 + (hasUpgrade("in", 12) ? 0.25 : 0)
        m = m.div(Decimal.pow(d, getBuyableAmount("in", 11)))
        m = m.div(echoWeb(["so", "ch", "fr", "si", "ou"]))
        m = m.div(achievementReward("in"))
        return m
    },
    gainExp() { return manifoldMod("in") },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let kept = ["best", "total"]
            if (hasMilestone("ou", 6)) kept.push("upgrades")
            if (hasMilestone("ou", 7)) kept.push("milestones")
            layerDataReset(this.layer, kept)
        }
    },

    hotkeys: [
        { key: "i", description() { return lg("i: 叠加出干波", "i: interfere a wave") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            return lg("下一道干波成本：", "Next interference wave costs: ") + format(tmp.in.nextAt) + " " + lg("泛音", "overtones")
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": { content: [["blank", "12px"], "upgrades"] },
            "Milestones": { content: [["blank", "12px"], "milestones"] },
            "Nodes": { content: [["blank", "12px"], "buyables"] },
            "Formula": { content: [
                ["blank", "12px"],
                ["display-text", function() {
                    return lg("干波是地板：每道成本 = 1e9 × 2^层数 × 价格系数。拍频节点（自增益项）让价格 ÷1.35^级 —— 节点喂养节点。",
                              "Waves are a floor: each costs 1e9 × 2^floors × price factors. Beat Nodes (self-gain) divide the price by 1.35^level — nodes feeding nodes.")
                }],
            ] },
        },
    },

    upgrades: {
        11: {
            title() { return lg("相长干涉", "Constructive Interference") },
            description() { return lg("微响产量 ×2.5。", "Hum gain ×2.5.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return lg("条纹图样", "Fringe Pattern") },
            description() { return lg("「拍频节点」的价格折扣 1.35 → 1.6。", "The Beat Node price discount 1.35 → 1.6 per level.") },
            cost: new Decimal(2),
        },
        13: {
            title() { return lg("相消干涉", "Destructive Interference") },
            description() { return lg("驻波成本 ÷2（两波反相，波节压价）。", "Standing waves cost ÷2 (out-of-phase waves crush the price).") },
            cost: new Decimal(3),
        },
        14: {
            title() { return lg("拍频", "Beat Frequency") },
            description() { return lg("泛音产量基于干波。", "Overtone gain is boosted by interference waves.") },
            cost: new Decimal(5),
            effect() { return player.in.points.add(1).pow(0.25) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        15: {
            title() { return lg("一次性叠满", "Buy Max") },
            description() { return lg("解锁干波「一次叠满」。", "Unlock buy-max for interference waves.") },
            cost: new Decimal(8),
        },
        21: {
            title() { return lg("深度干涉", "Deep Interference") },
            description() { return lg("反馈环产量 ×3。", "Feedback gain ×3.") },
            cost: new Decimal(12),
        },
        22: {
            title() { return lg("干涉放大", "Interference Amplifier") },
            description() { return lg("谐振产量 ×3。", "Resonance gain ×3.") },
            cost: new Decimal(20),
        },
        23: {
            title() { return lg("波前弯曲", "Wavefront Bend") },
            description() { return lg("涟漪产量 ×3。", "Ripple gain ×3.") },
            cost: new Decimal(35),
        },
        24: {
            title() { return lg("声影区", "Shadow Zone") },
            description() { return lg("回声产量 ×3。", "Echo gain ×3.") },
            cost: new Decimal(60),
        },
        25: {
            title() { return lg("相干光", "Coherent Light") },
            description() { return lg("泛音软帽起点 ×10。", "Overtone softcap starts ×10 later.") },
            cost: new Decimal(150),
        },
        31: {
            title() { return lg("全谱共振", "Full-Spectrum Resonance") },
            description() { return lg("微响产量 ×3。", "Hum gain ×3.") },
            cost: new Decimal(400),
        },
    },

    milestones: {
        0: {
            requirementDescription() { return lg("叠出 5 道干波（最高值）", "Interfere 5 waves (best)") },
            effectDescription() { return lg("驻波全自动：自动立起、自动购买驻波升级，且立波不再清空谐振。", "Standing waves go fully automatic: auto-standing, auto-buying wave upgrades, and standing no longer wipes resonance.") },
            done() { return player.in.best.gte(5) },
        },
        1: {
            requirementDescription() { return lg("叠出 12 道干波（最高值）", "Interfere 12 waves (best)") },
            effectDescription() { return lg("反馈环产量 ×3。", "Feedback gain ×3.") },
            done() { return player.in.best.gte(12) },
            unlocked() { return hasMilestone("in", 0) },
        },
        2: {
            requirementDescription() { return lg("叠出 25 道干波（最高值）", "Interfere 25 waves (best)") },
            effectDescription() { return lg("泛音产量 ×2.5。", "Overtone gain ×2.5.") },
            done() { return player.in.best.gte(25) },
            unlocked() { return hasMilestone("in", 1) },
        },
        3: {
            requirementDescription() { return lg("叠出 40 道干波（最高值）", "Interfere 40 waves (best)") },
            effectDescription() { return lg("「拍频节点」的涟漪加成 1.1 → 1.2。", "The Beat Node ripple boost 1.1 → 1.2 per level.") },
            done() { return player.in.best.gte(40) },
            unlocked() { return hasMilestone("in", 2) },
        },
        4: {
            requirementDescription() { return lg("叠出 60 道干波（最高值）", "Interfere 60 waves (best)") },
            effectDescription() { return lg("微响产量 ×5。", "Hum gain ×5.") },
            done() { return player.in.best.gte(60) },
            unlocked() { return hasMilestone("in", 3) },
        },
    },

    buyables: {
        11: {
            title() { return lg("拍频节点", "Beat Node") },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                let disc = 1.35 + (hasUpgrade("in", 12) ? 0.25 : 0)
                return lg("自增益项：每个节点让干波价格 ÷" + disc + "，涟漪产量 ×" + (hasMilestone("in", 3) ? 1.2 : 1.1) + " —— 越买越便宜。<br>当前价格折扣：",
                          "Self-gain: each node divides wave prices by " + disc + " and boosts ripple gain ×" + (hasMilestone("in", 3) ? 1.2 : 1.1) + " — the more you buy, the cheaper it gets.<br>Current discount: ")
                    + format(d.effect.discount) + lg("<br>涟漪加成：", "<br>Ripple boost: ") + format(d.effect.ripple)
                    + "x" + lg("<br>数量：", "<br>Owned: ") + formatWhole(getBuyableAmount(this.layer, this.id))
                    + lg("<br>成本：", "<br>Cost: ") + format(d.cost) + " " + lg("干波", "waves")
            },
            cost(x) { return Decimal.pow(4, x).times(25) },
            effect(x) {
                let d = 1.35 + (hasUpgrade("in", 12) ? 0.25 : 0)
                return { discount: Decimal.pow(d, x), ripple: Decimal.pow(hasMilestone("in", 3) ? 1.2 : 1.1, x) }
            },
            canAfford() { return player.in.points.gte(tmp.in.buyables[11].cost) },
            buy() {
                let c = tmp.in.buyables[11].cost
                player.in.points = player.in.points.sub(c)
                player.in.spentOnBuyables = player.in.spentOnBuyables.add(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return player.in.best.gte(2) },
        },
    },

    // static automation package granted by so.m3 — N-AUTOWIPE: all three flags read the same milestone
    resetsNothing() { return hasMilestone("so", 3) },
    autoPrestige() { return hasMilestone("so", 3) },
    autoUpgrade() { return hasMilestone("so", 3) },
    automate() {
        if (hasMilestone("si", 0)) geoBuyMax("in", 11, 25, 4)
    },
})

// ---------------- row 7 — 自振荡 Self-Oscillation ----------------
addLayer("so", {
    name: "Self-Oscillation",
    symbol: "自",
    position: 0,
    row: 7,
    color: "#ffa726",
    resource() { return lg("自振荡", "self-oscillations") },
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},

    baseResource() { return lg("泛音", "overtones") },
    baseAmount() { return player.ov.points },
    requires: new Decimal(1e10),
    type: "normal",
    exponent: 0.3,
    resetDescription() { return lg("自激起", "Oscillate for ") },

    effect() {
        let p = TUNING.ECHO_POW + (hasUpgrade("so", 13) ? 0.02 : 0)
        return { echoMult: player.so.points.add(1).pow(p) }
    },
    effectDescription() {
        return lg("你的自振荡把更老的每一层推 ×" + format(this.effect().echoMult), "Your self-oscillations boost every older layer by ×" + format(this.effect().echoMult))
    },

    softcap() {
        let s = new Decimal(TUNING.SOFTCAP_START.so)
        if (hasUpgrade("so", 22)) s = s.times(10)
        return s
    },
    softcapPower() { return new Decimal(TUNING.SOFTCAP_POW.so) },

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("so", 22)) m = m.times(2)
        if (hasMilestone("so", 0)) m = m.times(3)
        if (hasMilestone("so", 4)) m = m.times(3)
        if (hasMilestone("so", 5)) m = m.times(25)
        m = m.times(buyableEffect("so", 11))                              // 振荡器 Oscillator
        m = m.times(echoWeb(["ch", "fr", "si", "ou"]))
        m = m.times(achievementReward("so"))
        return m
    },
    gainExp() { return manifoldMod("so") },
    // (ch.m3's ×3 was traded for the so.passiveGen grant — Stage-6 R1)

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let kept = ["best", "total"]
            if (hasMilestone("ou", 6)) kept.push("upgrades")
            if (hasMilestone("ou", 7)) kept.push("milestones")
            layerDataReset(this.layer, kept)
        }
    },

    hotkeys: [
        { key: "s", description() { return lg("s: 自激起振荡", "s: self-oscillate") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            let cap = tmp.so.softcap
            if (player.so.points.gte(cap.times(0.5)))
                return "<span style='color:#ffb74d'>" + lg("软帽将于 " + format(cap) + " 自振荡处生效", "Softcap starts at " + format(cap) + " self-oscillations") + "</span>"
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": { content: [["blank", "12px"], "upgrades"] },
            "Milestones": { content: [["blank", "12px"], "milestones"] },
            "Oscillators": { content: [["blank", "12px"], "buyables"] },
            "Formula": { content: [
                ["blank", "12px"],
                ["display-text", function() {
                    return lg("自振荡产量 = (泛音 ÷ 1e10)^0.3 × 乘区 × 帽", "Self-oscillation gain = (overtones ÷ 1e10)^0.3 × zones × cap")
                }],
                ["display-text", function() {
                    return lg("振荡器（自增益项）：每级让自振荡产量 ×1.45+，成本 ×3.2 —— 振荡喂振荡，回路自己转起来。",
                              "Oscillators (self-gain): each level multiplies gain by ×1.45+ at ×3.2 cost — oscillation feeding oscillation, the loop spins itself.")
                }],
            ] },
        },
    },

    upgrades: {
        11: {
            title() { return lg("起振", "Kickstart") },
            description() { return lg("微响产量 ×2。", "Hum gain ×2.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return lg("增益介质", "Gain Medium") },
            description() { return lg("「振荡器」效果 +0.15 每级。", "The Oscillator effect +0.15 per level.") },
            cost: new Decimal(4),
        },
        13: {
            title() { return lg("自激回响", "Self Echo") },
            description() { return lg("自振荡的「回声」指数 +0.02。", "The self-oscillation echo exponent +0.02.") },
            cost: new Decimal(12),
        },
        14: {
            title() { return lg("受激辐射", "Stimulated Emission") },
            description() { return lg("泛音产量基于自振荡。", "Overtone gain is boosted by self-oscillations.") },
            cost: new Decimal(40),
            effect() { return player.so.points.add(1).pow(0.2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        15: {
            title() { return lg("谐振反馈", "Resonant Feedback") },
            description() { return lg("反馈环产量 ×2.5。", "Feedback gain ×2.5.") },
            cost: new Decimal(150),
        },
        21: {
            title() { return lg("低耗振荡", "Low-Loss Oscillation") },
            description() { return lg("「振荡器」成本 ÷2。", "The Oscillator costs ÷2.") },
            cost: new Decimal(800),
        },
        22: {
            title() { return lg("持续振荡", "Sustained Oscillation") },
            description() { return lg("自振荡产量 ×2，且自振荡软帽起点 ×10。", "Self-oscillation gain ×2, and its softcap starts ×10 later.") },
            cost: new Decimal(5000),
        },
        23: {
            title() { return lg("锁模", "Mode Locking") },
            description() { return lg("驻波成本 ÷1.5。", "Standing waves cost ÷1.5.") },
            cost: new Decimal(4e4),
        },
        24: {
            title() { return lg("谐波泵浦", "Harmonic Pump") },
            description() { return lg("涟漪产量 ×4。", "Ripple gain ×4.") },
            cost: new Decimal(5e5),
        },
        25: {
            title() { return lg("相位回注", "Phase Reinject") },
            description() { return lg("回声产量 ×4。", "Echo gain ×4.") },
            cost: new Decimal(8e6),
        },
        31: {
            title() { return lg("全环起振", "Whole-Loop Kick") },
            description() { return lg("谐振产量 ×4。", "Resonance gain ×4.") },
            cost: new Decimal(2e8),
        },
    },

    milestones: {
        0: {
            requirementDescription() { return lg("拥有 30 自振荡（最高值）", "Reach 30 self-oscillations (best)") },
            effectDescription() { return lg("自振荡产量 ×3。", "Self-oscillation gain ×3.") },
            done() { return player.so.best.gte(30) },
        },
        1: {
            requirementDescription() { return lg("拥有 100 自振荡（最高值）", "Reach 100 self-oscillations (best)") },
            effectDescription() { return lg("「持续共鸣」：谐振自动增长（被动生成）。", "Sustained Resonance: resonance generates passively.") },
            done() { return player.so.best.gte(100) },
            unlocked() { return hasMilestone("so", 0) },
        },
        2: {
            requirementDescription() { return lg("拥有 300 自振荡（最高值）", "Reach 300 self-oscillations (best)") },
            effectDescription() { return lg("「泛音广播」：泛音自动增长（被动生成）。", "Overtone Broadcast: overtones generate passively.") },
            done() { return player.so.best.gte(300) },
            unlocked() { return hasMilestone("so", 1) },
        },
        3: {
            requirementDescription() { return lg("拥有 1000 自振荡（最高值）", "Reach 1000 self-oscillations (best)") },
            effectDescription() { return lg("干波全自动：自动叠加、自动购买干波升级，且叠加不再清空泛音。", "Interference goes fully automatic: auto-interfering, auto-buying wave upgrades, and interfering no longer wipes overtones.") },
            done() { return player.so.best.gte(1000) },
            unlocked() { return hasMilestone("so", 2) },
        },
        4: {
            requirementDescription() { return lg("拥有 3000 自振荡（最高值）", "Reach 3000 self-oscillations (best)") },
            effectDescription() { return lg("「混沌涌泵」：混沌自动增长（被动生成，双倍速率）；自振荡产量 ×3。", "Chaos Pump: chaos generates passively (double rate); self-oscillation gain ×3.") },
            done() { return player.so.best.gte(3000) },
            unlocked() { return hasMilestone("so", 3) },
        },
        5: {
            requirementDescription() { return lg("拥有 1e4 自振荡（最高值）", "Reach 1e4 self-oscillations (best)") },
            effectDescription() { return lg("「永动」：自振荡产量 ×25。", "Perpetual Motion: self-oscillation gain ×25.") },
            done() { return player.so.best.gte(1e4) },
            unlocked() { return hasMilestone("so", 4) },
        },
    },

    buyables: {
        11: {
            title() { return lg("振荡器", "Oscillator") },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return lg("自增益项：每级让自振荡产量 ×" + oscPer() + "。<br>当前：", "Self-gain: each level multiplies self-oscillation gain by ×" + oscPer() + ".<br>Currently: ")
                    + format(d.effect) + "x" + lg("<br>等级：", "<br>Level: ") + formatWhole(getBuyableAmount(this.layer, this.id))
                    + lg("<br>成本：", "<br>Cost: ") + format(d.cost) + " " + lg("自振荡", "self-oscillations")
            },
            cost(x) { return Decimal.pow(3.2, x).times(hasUpgrade("so", 21) ? 6 : 12) },
            effect(x) { return Decimal.pow(oscPer(), x) },
            canAfford() { return player.so.points.gte(tmp.so.buyables[11].cost) },
            buy() {
                let c = tmp.so.buyables[11].cost
                player.so.points = player.so.points.sub(c)
                player.so.spentOnBuyables = player.so.spentOnBuyables.add(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return player.so.best.gte(10) },
        },
    },

    // automation: passiveGen ← ch.m3 (double rate) ; autoUpgrade ← ch.m4 ; Oscillator autobuy ← si.m0
    passiveGeneration() { return hasMilestone("ch", 3) ? 2 : 0 },
    autoUpgrade() { return hasMilestone("ch", 4) },
    automate() {
        if (hasMilestone("si", 0)) geoBuyMax("so", 11, 12, 3.2)
    },
})

// 振荡器 per-level strength (knobs: so 12 / ch 23)
function oscPer() {
    return 1.45 + (hasUpgrade("so", 12) ? 0.15 : 0) + (hasUpgrade("ch", 23) ? 0.05 : 0)
}

// ---------------- row 8 — 混沌 Chaos ----------------
addLayer("ch", {
    name: "Chaos",
    symbol: "混",
    position: 0,
    row: 8,
    color: "#ffca28",
    resource() { return lg("混沌", "chaos") },
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},

    baseResource() { return lg("自振荡", "self-oscillations") },
    baseAmount() { return player.so.points },
    requires: new Decimal(1e11),
    type: "normal",
    exponent: 0.3,
    resetDescription() { return lg("扰动出", "Churn for ") },

    effect() {
        let p = TUNING.ECHO_POW + (hasUpgrade("ch", 13) ? 0.02 : 0)
        return { echoMult: player.ch.points.add(1).pow(p) }
    },
    effectDescription() {
        return lg("你的混沌把更老的每一层推 ×" + format(this.effect().echoMult), "Your chaos boosts every older layer by ×" + format(this.effect().echoMult))
    },

    softcap() {
        let s = new Decimal(TUNING.SOFTCAP_START.ch)
        if (hasUpgrade("ch", 22)) s = s.times(10)
        return s
    },
    softcapPower() { return new Decimal(TUNING.SOFTCAP_POW.ch) },

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("ch", 22)) m = m.times(2)
        if (hasUpgrade("si", 21)) m = m.times(3)                          // 引力透镜
        if (hasMilestone("ch", 5)) m = m.times(100)
        if (hasMilestone("fr", 1)) m = m.times(25)                        // 混沌产量 ×25
        if (hasMilestone("fr", 4)) m = m.times(100)                       // 混沌产量 ×100
        m = m.times(buyableEffect("ch", 11))                              // 吸引子 Attractor
        m = m.times(echoWeb(["fr", "si", "ou"]))
        m = m.times(achievementReward("ch"))
        return m
    },
    gainExp() { return manifoldMod("ch") },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let kept = ["best", "total"]
            if (hasMilestone("ou", 6)) kept.push("upgrades")
            if (hasMilestone("ou", 7)) kept.push("milestones")
            layerDataReset(this.layer, kept)
        }
    },

    hotkeys: [
        { key: "c", description() { return lg("c: 扰动出混沌", "c: churn out chaos") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            let cap = tmp.ch.softcap
            if (player.ch.points.gte(cap.times(0.5)))
                return "<span style='color:#ffb74d'>" + lg("软帽将于 " + format(cap) + " 混沌处生效", "Softcap starts at " + format(cap) + " chaos") + "</span>"
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": { content: [["blank", "12px"], "upgrades"] },
            "Milestones": { content: [["blank", "12px"], "milestones"] },
            "Attractors": { content: [["blank", "12px"], "buyables"] },
            "Formula": { content: [
                ["blank", "12px"],
                ["display-text", function() {
                    return lg("混沌产量 = (自振荡 ÷ 1e11)^0.3 × 乘区 × 帽", "Chaos gain = (self-oscillations ÷ 1e11)^0.3 × zones × cap")
                }],
                ["display-text", function() {
                    return lg("吸引子（自增益项）：每级让混沌产量 ×1.5+，成本 ×3.5 —— 蝴蝶扇翅，风暴自喂。",
                              "Attractors (self-gain): each level multiplies chaos gain by ×1.5+ at ×3.5 cost — the butterfly flaps, the storm feeds itself.")
                }],
            ] },
        },
    },

    upgrades: {
        11: {
            title() { return lg("蝴蝶振翅", "Butterfly Flap") },
            description() { return lg("微响产量 ×3。", "Hum gain ×3.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return lg("奇异吸引子", "Strange Attractor") },
            description() { return lg("「吸引子」效果 +0.1 每级。", "The Attractor effect +0.1 per level.") },
            cost: new Decimal(5),
        },
        13: {
            title() { return lg("混沌回响", "Chaotic Echo") },
            description() { return lg("混沌的「回声」指数 +0.02。", "The chaos echo exponent +0.02.") },
            cost: new Decimal(20),
        },
        14: {
            title() { return lg("蝴蝶效应", "Butterfly Effect") },
            description() { return lg("泛音产量基于混沌。", "Overtone gain is boosted by chaos.") },
            cost: new Decimal(80),
            effect() { return player.ch.points.add(1).pow(0.2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        15: {
            title() { return lg("湍流馈能", "Turbulent Feed") },
            description() { return lg("反馈环产量 ×3。", "Feedback gain ×3.") },
            cost: new Decimal(400),
        },
        21: {
            title() { return lg("低耗吸引", "Low-Drag Attraction") },
            description() { return lg("「吸引子」成本 ÷2。", "The Attractor costs ÷2.") },
            cost: new Decimal(2500),
        },
        22: {
            title() { return lg("分岔", "Bifurcation") },
            description() { return lg("混沌产量 ×2，且混沌软帽起点 ×10。", "Chaos gain ×2, and its softcap starts ×10 later.") },
            cost: new Decimal(2e4),
        },
        23: {
            title() { return lg("混沌注入", "Chaos Injection") },
            description() { return lg("「振荡器」效果 +0.05 每级。", "The Oscillator effect +0.05 per level.") },
            cost: new Decimal(2e5),
        },
        24: {
            title() { return lg("风暴潮", "Storm Surge") },
            description() { return lg("涟漪产量 ×5。", "Ripple gain ×5.") },
            cost: new Decimal(3e6),
        },
        25: {
            title() { return lg("回声涡旋", "Echo Vortex") },
            description() { return lg("回声产量 ×5。", "Echo gain ×5.") },
            cost: new Decimal(5e7),
        },
        31: {
            title() { return lg("共振崩塌", "Resonant Collapse") },
            description() { return lg("谐振产量 ×5。", "Resonance gain ×5.") },
            cost: new Decimal(1e9),
        },
    },

    milestones: {
        0: {
            requirementDescription() { return lg("拥有 30 混沌（最高值）", "Reach 30 chaos (best)") },
            effectDescription() { return lg("「石子」与「回声室」自动购买。", "Pebbles and Echo Chambers are bought automatically.") },
            done() { return player.ch.best.gte(30) },
        },
        1: {
            requirementDescription() { return lg("拥有 100 混沌（最高值）", "Reach 100 chaos (best)") },
            effectDescription() { return lg("自动购买谐振升级。", "Resonance upgrades are bought automatically.") },
            done() { return player.ch.best.gte(100) },
            unlocked() { return hasMilestone("ch", 0) },
        },
        2: {
            requirementDescription() { return lg("拥有 300 混沌（最高值）", "Reach 300 chaos (best)") },
            effectDescription() { return lg("自动购买反馈环升级。", "Feedback upgrades are bought automatically.") },
            done() { return player.ch.best.gte(300) },
            unlocked() { return hasMilestone("ch", 1) },
        },
        3: {
            requirementDescription() { return lg("拥有 1000 混沌（最高值）", "Reach 1000 chaos (best)") },
            effectDescription() { return lg("「持续自激」：自振荡自动增长（被动生成）。", "Sustained Oscillation: self-oscillations generate passively.") },
            done() { return player.ch.best.gte(1000) },
            unlocked() { return hasMilestone("ch", 2) },
        },
        4: {
            requirementDescription() { return lg("拥有 3000 混沌（最高值）", "Reach 3000 chaos (best)") },
            effectDescription() { return lg("自动购买自振荡升级。", "Self-oscillation upgrades are bought automatically.") },
            done() { return player.ch.best.gte(3000) },
            unlocked() { return hasMilestone("ch", 3) },
        },
        5: {
            requirementDescription() { return lg("拥有 1e4 混沌（最高值）", "Reach 1e4 chaos (best)") },
            effectDescription() { return lg("「完全湍流」：混沌产量 ×100。", "Full Turbulence: chaos gain ×100.") },
            done() { return player.ch.best.gte(1e4) },
            unlocked() { return hasMilestone("ch", 4) },
        },
    },

    buyables: {
        11: {
            title() { return lg("吸引子", "Attractor") },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return lg("自增益项：每级让混沌产量 ×" + attractPer() + "。<br>当前：", "Self-gain: each level multiplies chaos gain by ×" + attractPer() + ".<br>Currently: ")
                    + format(d.effect) + "x" + lg("<br>等级：", "<br>Level: ") + formatWhole(getBuyableAmount(this.layer, this.id))
                    + lg("<br>成本：", "<br>Cost: ") + format(d.cost) + " " + lg("混沌", "chaos")
            },
            cost(x) { return Decimal.pow(3.5, x).times(hasUpgrade("ch", 21) ? 10 : 20) },
            effect(x) { return Decimal.pow(attractPer(), x) },
            canAfford() { return player.ch.points.gte(tmp.ch.buyables[11].cost) },
            buy() {
                let c = tmp.ch.buyables[11].cost
                player.ch.points = player.ch.points.sub(c)
                player.ch.spentOnBuyables = player.ch.spentOnBuyables.add(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return player.ch.best.gte(10) },
        },
    },

    // automation: passiveGen ← so.m4 (double rate) ; autoUpgrade ← si.m2 ; Attractor autobuy ← ou.m0
    passiveGeneration() { return hasMilestone("so", 4) ? 2 : 0 },
    autoUpgrade() { return hasMilestone("si", 2) },
    automate() {
        if (hasMilestone("ou", 0)) geoBuyMax("ch", 11, 20, 3.5)
    },
})

// 吸引子 per-level strength (knobs: ch 12 / fr 23 / fr m3)
function attractPer() {
    return 1.5 + (hasUpgrade("ch", 12) ? 0.1 : 0) + (hasUpgrade("fr", 23) ? 0.05 : 0) + (hasMilestone("fr", 3) ? 0.15 : 0)
}
