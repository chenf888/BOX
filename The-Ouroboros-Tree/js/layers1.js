// layers1.js — rows 0–2: 涟漪 ri, 回声 ec, 谐振 re
// Every display string goes through lg() (T2, EN default). Every effect() has a named
// consumer (N-UNWIRED). Milestones score on .best and every layer keeps best/total (N-MSDESTROY).

// ---------------- row 0 — 涟漪 Ripple ----------------
addLayer("ri", {
    name: "Ripple",
    symbol: "涟",
    position: 0,
    row: 0,
    color: "#26c6da",
    resource() { return lg("涟漪", "Ripples") },
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},

    baseResource() { return lg("微响", "hums") },
    baseAmount() { return player.points },
    requires: new Decimal(10),
    type: "normal",
    exponent: 0.5,
    resetDescription() { return lg("荡开", "Ripple for ") },

    // P12 softcap — visible (a warning line sits above the tabs)
    softcap() {
        let s = new Decimal(TUNING.SOFTCAP_START.ri)
        if (hasUpgrade("ri", 21)) s = s.times(10)
        if (hasUpgrade("ri", 32)) s = s.times(10)
        if (hasMilestone("ri", 3)) s = s.times(10)
        return s
    },
    softcapPower() { return new Decimal(TUNING.SOFTCAP_POW.ri) },

    gainMult() {
        let m = new Decimal(1)
        // own content
        if (hasUpgrade("ri", 12)) m = m.times(upgradeEffect("ri", 12))   // 泛波 — the layer's self-term
        if (hasUpgrade("ri", 13)) m = m.times(2)
        if (hasUpgrade("ri", 15)) m = m.times(2.5)
        if (hasMilestone("ri", 0)) m = m.times(hasUpgrade("ri", 24) ? 5 : 2.5)
        if (hasMilestone("ri", 2)) m = m.times(3)
        // cross-layer boosts (each booster reads its OWN state — P10 web)
        if (hasUpgrade("ec", 12)) m = m.times(2)
        if (hasUpgrade("ec", 31)) m = m.times(upgradeEffect("ec", 31))
        if (hasUpgrade("re", 24)) m = m.times(3)
        if (hasUpgrade("sw", 25)) m = m.times(5)
        if (hasUpgrade("in", 23)) m = m.times(3)
        m = m.times(Decimal.pow(hasUpgrade("si", 23) ? 1.2 : 1.12, getBuyableAmount("fr", 11)))  // 自相似核
        if (hasUpgrade("sw", 13)) m = m.times(upgradeEffect("sw", 13))
        if (hasUpgrade("fl", 12)) m = m.times(2.5)
        if (hasUpgrade("ov", 24)) m = m.times(3)
        if (hasUpgrade("so", 24)) m = m.times(4)
        if (hasUpgrade("ch", 24)) m = m.times(5)
        if (hasUpgrade("fr", 24)) m = m.times(8)
        if (hasUpgrade("si", 24)) m = m.times(10)
        if (hasUpgrade("ou", 21)) m = m.times(10)
        m = m.times(Decimal.pow(1.1, getBuyableAmount("sw", 11)))          // 波腹 antinodes widen the pond
        m = m.times(buyableEffect("in", 11).ripple)                        // 拍频节点 Beat Nodes
        m = m.times(buyableEffect("fr", 11).wide)                          // 自相似核 Self-Similarity Cores
        m = m.times(buyableEffect("ov", 11))                               // 谐波列 overtone series
        // echo web from every deeper layer
        m = m.times(echoWeb(["ec", "re", "sw", "fl", "ov", "in", "so", "ch", "fr", "si", "ou"]))
        // achievement rewards aimed at ripples
        m = m.times(achievementReward("ri"))
        return m
    },
    gainExp() { return manifoldMod("ri") },

    // milestone-gated keeps: the endgame keeps upgrades/milestones on every reset (P9)
    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let kept = ["best", "total"]
            if (hasMilestone("ou", 6)) kept.push("upgrades")
            if (hasMilestone("ou", 7)) kept.push("milestones")
            layerDataReset(this.layer, kept)
        }
    },

    hotkeys: [
        { key: "r", description() { return lg("r: 荡开微响，获得涟漪", "r: ripple your hums") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            let cap = tmp.ri.softcap
            if (player.ri.points.gte(cap.times(0.5)))
                return "<span style='color:#ffb74d'>" + lg("软帽将于 " + format(cap) + " 涟漪处生效", "Softcap starts at " + format(cap) + " ripples") + "</span>"
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
                    return lg("涟漪产量 = (微响 ÷ 10)^0.5 × 乘区 × 帽", "Ripple gain = (hums ÷ 10)^0.5 × multiplier zones × cap")
                }],
                ["display-text", function() {
                    if (!hasUpgrade("ri", 12)) return ""
                    let p = hasMilestone("ri", 4) ? 0.4 : 0.35
                    return lg("泛波（自增益项）：涟漪^" + p + "，喂给本层涟漪产量。吃自己，长自己。",
                              "Spreading Wave (self-gain): ripples^" + p + ", fed into this layer's own gain. Eat yourself, grow yourself.")
                }],
                ["display-text", function() {
                    return lg("回声网：" + format(echoWeb(["ec","re","sw","fl","ov","in","so","ch","fr","si","ou"])) + " ×（每一层更深的回路都在推你）",
                              "Echo web: " + format(echoWeb(["ec","re","sw","fl","ov","in","so","ch","fr","si","ou"])) + " × (every deeper loop pushes you)")
                }],
            ] },
        },
    },

    upgrades: {
        11: {
            title() { return lg("初响", "First Chime") },
            description() { return lg("微响产量 ×2。", "Hum gain ×2.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return lg("泛波", "Spreading Wave") },
            description() { return lg("<b>自增益项</b>：涟漪产量基于你的涟漪（吃自己）。", "<b>Self-gain:</b> ripple gain is boosted by your ripples (eat yourself).") },
            cost: new Decimal(5),
            effect() {
                let p = hasMilestone("ri", 4) ? 0.4 : 0.35
                return softcap(player.ri.points.add(2).pow(p), new Decimal(TUNING.SELF_CAP_START.ri), TUNING.SELF_CAP_POW)
            },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        13: {
            title() { return lg("回响", "Echo Back") },
            description() { return lg("涟漪产量 ×2。", "Ripple gain ×2.") },
            cost: new Decimal(12),
        },
        14: {
            title() { return lg("共振", "Resonate") },
            description() { return lg("微响产量基于微响本身。", "Hum gain is boosted by hums themselves.") },
            cost: new Decimal(40),
            effect() { return player.points.add(1).pow(0.25) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        15: {
            title() { return lg("驻波纹", "Standing Pattern") },
            description() { return lg("涟漪产量 ×2.5。", "Ripple gain ×2.5.") },
            cost: new Decimal(200),
        },
        21: {
            title() { return lg("波长拉伸", "Wavelength") },
            description() { return lg("涟漪软帽起点 ×10。", "Ripple softcap starts ×10 later.") },
            cost: new Decimal(1000),
            unlocked() { return hasMilestone("ri", 0) },
        },
        22: {
            title() { return lg("浪尖", "Crest") },
            description() { return lg("微响 ≥ 1e4 时，微响产量 ×3。", "While hums ≥ 1e4, hum gain ×3.") },
            cost: new Decimal(5000),
            unlocked() { return hasMilestone("ri", 0) },
        },
        23: {
            title() { return lg("众声", "Chorus") },
            description() { return lg("微响产量基于成就数。", "Hum gain is boosted by your achievement count.") },
            cost: new Decimal(20000),
            unlocked() { return hasMilestone("ri", 0) },
            effect() { return Decimal.pow(player.a.achievements.length + 1, 0.5) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: {
            title() { return lg("心波放大", "Heart Amplifier") },
            description() { return lg("里程碑「涟心」的奖励 ×2。", "The milestone 'Ripple Heart' is twice as strong.") },
            cost: new Decimal(1e5),
            unlocked() { return hasMilestone("ri", 0) },
        },
        25: {
            title() { return lg("涌潮", "Surge") },
            description() { return lg("微响产量 ×3。", "Hum gain ×3.") },
            cost: new Decimal(1e6),
            unlocked() { return hasMilestone("ri", 0) },
        },
        31: {
            title() { return lg("深波", "Deep Wave") },
            description() { return lg("微响产量基于你的回声。", "Hum gain is boosted by your echoes.") },
            cost: new Decimal(1e8),
            unlocked() { return hasMilestone("ri", 2) },
            effect() { return player.ec.points.add(1).pow(0.2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        32: {
            title() { return lg("潮汐锁", "Tide Lock") },
            description() { return lg("涟漪软帽起点再 ×10。", "Ripple softcap starts another ×10 later.") },
            cost: new Decimal(1e10),
            unlocked() { return hasMilestone("ri", 2) },
        },
    },

    milestones: {
        0: {
            requirementDescription() { return lg("拥有 2,500 涟漪（最高值）", "Reach 2,500 ripples (best)") },
            effectDescription() { return lg("「涟心」：涟漪产量 ×2.5。", "Ripple Heart: ripple gain ×2.5.") },
            done() { return player.ri.best.gte(2500) },
        },
        1: {
            requirementDescription() { return lg("拥有 2.5e5 涟漪（最高值）", "Reach 2.5e5 ripples (best)") },
            effectDescription() { return lg("解锁 buyable「石子」。", "Unlock the buyable 'Pebble'.") },
            done() { return player.ri.best.gte(2.5e5) },
            unlocked() { return hasMilestone("ri", 0) },
        },
        2: {
            requirementDescription() { return lg("拥有 2.5e7 涟漪（最高值）", "Reach 2.5e7 ripples (best)") },
            effectDescription() { return lg("涟漪产量 ×3。", "Ripple gain ×3.") },
            done() { return player.ri.best.gte(2.5e7) },
            unlocked() { return hasMilestone("ri", 1) },
        },
        3: {
            requirementDescription() { return lg("拥有 2.5e9 涟漪（最高值）", "Reach 2.5e9 ripples (best)") },
            effectDescription() { return lg("涟漪软帽起点 ×10。", "Ripple softcap starts ×10 later.") },
            done() { return player.ri.best.gte(2.5e9) },
            unlocked() { return hasMilestone("ri", 2) },
        },
        4: {
            requirementDescription() { return lg("拥有 2.5e11 涟漪（最高值）", "Reach 2.5e11 ripples (best)") },
            effectDescription() { return lg("「泛波」指数 0.35 → 0.4。", "Spreading Wave exponent 0.35 → 0.4.") },
            done() { return player.ri.best.gte(2.5e11) },
            unlocked() { return hasMilestone("ri", 3) },
        },
    },

    buyables: {
        11: {
            title() { return lg("石子", "Pebble") },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return lg("每颗石子让微响产量 ×" + (hasUpgrade("ov", 41) ? 1.7 : 1.5) + "。<br>当前：", "Each pebble multiplies hum gain by ×" + (hasUpgrade("ov", 41) ? 1.7 : 1.5) + ".<br>Currently: ")
                    + format(d.effect) + "x" + lg("<br>持有：", "<br>Owned: ") + formatWhole(getBuyableAmount(this.layer, this.id))
                    + lg("<br>成本：", "<br>Cost: ") + format(d.cost) + " " + lg("涟漪", "ripples")
            },
            cost(x) { return Decimal.pow(2.5, x).times(10) },
            effect(x) { return Decimal.pow(hasUpgrade("ov", 41) ? 1.7 : 1.5, x) },
            canAfford() { return player.ri.points.gte(tmp.ri.buyables[11].cost) },
            buy() {
                let c = tmp.ri.buyables[11].cost
                player.ri.points = player.ri.points.sub(c)
                player.ri.spentOnBuyables = player.ri.spentOnBuyables.add(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return hasMilestone("ri", 1) },
        },
    },

    // automation granted by later layers' milestones (P4 ladder):
    //   passiveGen ← ec.m1 ; autoUpgrade ← re.m1 ; autoBuyable(石子, closed-form) ← ch.m0
    passiveGeneration() { return hasMilestone("ec", 1) ? 1 : 0 },
    autoUpgrade() { return hasMilestone("re", 1) },
    automate() {
        if (hasMilestone("ch", 0)) geoBuyMax("ri", 11, 10, 2.5)
    },
})

// ---------------- row 1 — 回声 Echo ----------------
addLayer("ec", {
    name: "Echo",
    symbol: "回",
    position: 0,
    row: 1,
    color: "#42a5f5",
    resource() { return lg("回声", "Echoes") },
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},

    baseResource() { return lg("涟漪", "ripples") },
    baseAmount() { return player.ri.points },
    requires: new Decimal(250),
    type: "normal",
    exponent: 1 / 3,
    resetDescription() { return lg("回荡", "Echo for ") },

    // the layer's echo: pushes every older layer + the root
    effect() {
        return { echoMult: player.ec.points.add(1).pow(TUNING.ECHO_POW) }
    },
    effectDescription() {
        return lg("你的回声把更老的每一层推 ×" + format(this.effect().echoMult), "Your echoes boost every older layer by ×" + format(this.effect().echoMult))
    },

    softcap() {
        let s = new Decimal(TUNING.SOFTCAP_START.ec)
        if (hasUpgrade("ec", 24)) s = s.times(10)
        if (hasMilestone("ec", 3)) s = s.times(10)
        return s
    },
    softcapPower() { return new Decimal(TUNING.SOFTCAP_POW.ec) },

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("ec", 13)) m = m.times(2)
        if (hasUpgrade("ec", 14)) m = m.times(upgradeEffect("ec", 14))
        if (hasMilestone("ec", 0)) m = m.times(2.5)
        if (hasMilestone("ec", 2)) m = m.times(3)
        if (hasUpgrade("ec", 22)) m = m.times(upgradeEffect("ec", 22))
        if (hasUpgrade("ec", 25)) m = m.times(buyableEffect("ec", 11))   // 八度 doubles the Echo Chamber
        if (hasUpgrade("sw", 23)) m = m.times(upgradeEffect("sw", 23))
        if (hasUpgrade("sw", 13)) m = m.times(upgradeEffect("sw", 13))
        if (hasUpgrade("re", 23) && player.re.best.gte(1e4)) m = m.times(5)
        if (hasUpgrade("fl", 13)) m = m.times(2.5)
        if (hasUpgrade("in", 24)) m = m.times(3)
        if (hasUpgrade("ov", 25)) m = m.times(3)
        if (hasUpgrade("so", 25)) m = m.times(4)
        if (hasUpgrade("ch", 25)) m = m.times(5)
        if (hasUpgrade("fr", 25)) m = m.times(8)
        if (hasUpgrade("si", 25)) m = m.times(10)
        if (hasUpgrade("ou", 22)) m = m.times(10)
        m = m.times(buyableEffect("ov", 11))                               // 谐波列 overtone series
        m = m.times(echoWeb(["re", "sw", "fl", "ov", "in", "so", "ch", "fr", "si", "ou"]))
        m = m.times(achievementReward("ec"))
        return m
    },
    gainExp() {
        let e = manifoldMod("ec")
        if (hasMilestone("ec", 4)) e = e.times(1.02)   // 回声深度
        return e
    },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let kept = ["best", "total"]
            if (hasMilestone("ou", 6)) kept.push("upgrades")
            if (hasMilestone("ou", 7)) kept.push("milestones")
            layerDataReset(this.layer, kept)
        }
    },

    hotkeys: [
        { key: "e", description() { return lg("e: 回荡涟漪，获得回声", "e: echo your ripples") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            let cap = tmp.ec.softcap
            if (player.ec.points.gte(cap.times(0.5)))
                return "<span style='color:#ffb74d'>" + lg("软帽将于 " + format(cap) + " 回声处生效", "Softcap starts at " + format(cap) + " echoes") + "</span>"
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": { content: [["blank", "12px"], "upgrades"] },
            "Milestones": { content: [["blank", "12px"], "milestones"] },
            "Echo Chamber": { content: [["blank", "12px"], "buyables"] },
            "Formula": { content: [
                ["blank", "12px"],
                ["display-text", function() {
                    return lg("回声产量 = (涟漪 ÷ 250)^(1/3) × 乘区 × 帽", "Echo gain = (ripples ÷ 250)^(1/3) × multiplier zones × cap")
                }],
                ["display-text", function() {
                    return lg("回声室（自增益项）：每级 ×1.6 回声产量，成本 ×3 —— 买它喂它自己。",
                              "Echo Chamber (self-gain): each level ×1.6 echo gain at ×3 cost — buy it to feed itself.")
                }],
            ] },
        },
    },

    upgrades: {
        11: {
            title() { return lg("回声定位", "Echolocate") },
            description() { return lg("微响产量 ×2。", "Hum gain ×2.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return lg("回声壁", "Echo Wall") },
            description() { return lg("涟漪产量 ×2。", "Ripple gain ×2.") },
            cost: new Decimal(3),
        },
        13: {
            title() { return lg("第二声部", "Second Voice") },
            description() { return lg("回声产量 ×2。", "Echo gain ×2.") },
            cost: new Decimal(10),
        },
        14: {
            title() { return lg("混响", "Reverberation") },
            description() { return lg("回声产量基于你的涟漪。", "Echo gain is boosted by your ripples.") },
            cost: new Decimal(50),
            effect() { return player.ri.points.add(1).pow(0.2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        15: {
            title() { return lg("声浪", "Sound Surge") },
            description() { return lg("微响产量 ×2.5。", "Hum gain ×2.5.") },
            cost: new Decimal(250),
        },
        21: {
            title() { return lg("回声室建造", "Build the Chamber") },
            description() { return lg("解锁 buyable「回声室」（自增益项）。", "Unlock the 'Echo Chamber' buyable (the self-gain loop).") },
            cost: new Decimal(1000),
            unlocked() { return getBuyableAmount("ri", 11).gte(3) },
        },
        22: {
            title() { return lg("聆听深处", "Listen Deep") },
            description() { return lg("回声产量基于微响（对数）。", "Echo gain is boosted by hums (log).") },
            cost: new Decimal(1e4),
            effect() { return player.points.add(1).log10().add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        23: {
            title() { return lg("共鸣腔", "Resonant Cavity") },
            description() { return lg("微响产量 ×3。", "Hum gain ×3.") },
            cost: new Decimal(1e5),
        },
        24: {
            title() { return lg("延迟回路", "Delay Line") },
            description() { return lg("回声软帽起点 ×10。", "Echo softcap starts ×10 later.") },
            cost: new Decimal(1e6),
        },
        25: {
            title() { return lg("八度", "Octave") },
            description() { return lg("「回声室」的效果 ×2（命名机制增幅）。", "The 'Echo Chamber' effect is doubled (named-mechanic boost).") },
            cost: new Decimal(1e8),
        },
        31: {
            title() { return lg("泛音预备", "Overtone Prep") },
            description() { return lg("涟漪产量基于你的涟漪（+25% 指数）。", "Ripple gain is boosted by ripples themselves (pow 0.25).") },
            cost: new Decimal(1e10),
            effect() { return player.ri.points.add(1).pow(0.25) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
    },

    milestones: {
        0: {
            requirementDescription() { return lg("拥有 500 回声（最高值）", "Reach 500 echoes (best)") },
            effectDescription() { return lg("回声产量 ×2.5。", "Echo gain ×2.5.") },
            done() { return player.ec.best.gte(500) },
        },
        1: {
            requirementDescription() { return lg("拥有 5e3 回声（最高值）", "Reach 5e3 echoes (best)") },
            effectDescription() { return lg("「回声广播」：涟漪自动增长（被动生成）。", "Echo Broadcast: ripples generate passively.") },
            done() { return player.ec.best.gte(5000) },
            unlocked() { return hasMilestone("ec", 0) },
        },
        2: {
            requirementDescription() { return lg("拥有 5e5 回声（最高值）", "Reach 5e5 echoes (best)") },
            effectDescription() { return lg("回声产量 ×3。", "Echo gain ×3.") },
            done() { return player.ec.best.gte(5e5) },
            unlocked() { return hasMilestone("ec", 1) },
        },
        3: {
            requirementDescription() { return lg("拥有 5e7 回声（最高值）", "Reach 5e7 echoes (best)") },
            effectDescription() { return lg("回声软帽起点 ×10。", "Echo softcap starts ×10 later.") },
            done() { return player.ec.best.gte(5e7) },
            unlocked() { return hasMilestone("ec", 2) },
        },
        4: {
            requirementDescription() { return lg("拥有 5e9 回声（最高值）", "Reach 5e9 echoes (best)") },
            effectDescription() { return lg("「回声深度」：回声指数 +2%。", "Echo Depth: echo exponent +2%.") },
            done() { return player.ec.best.gte(5e9) },
            unlocked() { return hasMilestone("ec", 3) },
        },
    },

    buyables: {
        11: {
            title() { return lg("回声室", "Echo Chamber") },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return lg("自增益项：每级让回声产量 ×" + (hasUpgrade("ov", 43) ? 1.75 : 1.6) + "，成本 ×3 —— 回声喂养回声。<br>当前：",
                          "Self-gain: each level ×" + (hasUpgrade("ov", 43) ? 1.75 : 1.6) + " echo gain at ×3 cost — echoes feeding echoes.<br>Currently: ")
                    + format(d.effect) + "x" + lg("<br>等级：", "<br>Level: ") + formatWhole(getBuyableAmount(this.layer, this.id))
                    + lg("<br>成本：", "<br>Cost: ") + format(d.cost) + " " + lg("回声", "echoes")
            },
            cost(x) { return Decimal.pow(3, x).times(5) },
            effect(x) { return Decimal.pow(hasUpgrade("ov", 43) ? 1.75 : 1.6, x) },
            canAfford() { return player.ec.points.gte(tmp.ec.buyables[11].cost) },
            buy() {
                let c = tmp.ec.buyables[11].cost
                player.ec.points = player.ec.points.sub(c)
                player.ec.spentOnBuyables = player.ec.spentOnBuyables.add(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return hasUpgrade("ec", 21) },
        },
    },

    // automation: autoUpgrade ← sw.m2 ; the Echo Chamber autobuys (closed form) ← ch.m0
    autoUpgrade() { return hasMilestone("sw", 2) },
    automate() {
        if (hasMilestone("ch", 0)) geoBuyMax("ec", 11, 5, 3)
    },
})

// ---------------- row 2 — 谐振 Resonance ----------------
addLayer("re", {
    name: "Resonance",
    symbol: "振",
    position: 0,
    row: 2,
    color: "#9fa8da",
    resource() { return lg("谐振", "Resonance") },
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},

    baseResource() { return lg("回声", "echoes") },
    baseAmount() { return player.ec.points },
    requires: new Decimal(6300),
    type: "normal",
    exponent: 0.3,
    resetDescription() { return lg("共振", "Resonate for ") },

    effect() {
        return { echoMult: player.re.points.add(1).pow(TUNING.ECHO_POW) }
    },
    effectDescription() {
        return lg("你的谐振把更老的每一层推 ×" + format(this.effect().echoMult), "Your resonance boosts every older layer by ×" + format(this.effect().echoMult))
    },

    softcap() {
        let s = new Decimal(TUNING.SOFTCAP_START.re)
        if (hasUpgrade("re", 15)) s = s.times(10)
        if (hasMilestone("re", 2)) s = s.times(10)
        return s
    },
    softcapPower() { return new Decimal(TUNING.SOFTCAP_POW.re) },

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("re", 13)) m = m.times(2)
        if (hasUpgrade("re", 14)) m = m.times(upgradeEffect("re", 14))
        if (hasUpgrade("re", 31)) m = m.times(upgradeEffect("re", 31))
        m = m.times(buyableEffect("re", 11))
        if (hasUpgrade("sw", 14)) m = m.times(upgradeEffect("sw", 14))
        if (hasUpgrade("sw", 21)) m = m.times(3)
        if (hasUpgrade("fl", 15)) m = m.times(2.5)
        if (hasUpgrade("in", 22)) m = m.times(3)
        if (hasUpgrade("ov", 31)) m = m.times(3)
        if (hasUpgrade("so", 31)) m = m.times(4)
        if (hasUpgrade("ch", 31)) m = m.times(5)
        if (hasUpgrade("fr", 31)) m = m.times(8)
        if (hasUpgrade("si", 31)) m = m.times(10)
        if (hasUpgrade("ou", 23)) m = m.times(10)
        m = m.times(buyableEffect("ov", 11))                               // 谐波列 overtone series
        m = m.times(echoWeb(["sw", "fl", "ov", "in", "so", "ch", "fr", "si", "ou"]))
        m = m.times(achievementReward("re"))
        return m
    },
    // the 同相 (in-phase) chain: each of the 5 milestones deepens the layer's own exponent
    gainExp() {
        let e = manifoldMod("re")
        let n = 0
        for (let i = 0; i < 5; i++) if (hasMilestone("re", i)) n++
        e = e.times(1 + n * 0.0333)
        if (hasUpgrade("re", 25)) e = e.times(1.0333)
        return e
    },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let kept = ["best", "total"]
            if (hasMilestone("ou", 6)) kept.push("upgrades")
            if (hasMilestone("ou", 7)) kept.push("milestones")
            layerDataReset(this.layer, kept)
        }
    },

    hotkeys: [
        { key: "q", description() { return lg("q: 共振回声，获得谐振", "q: resonate your echoes") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            let cap = tmp.re.softcap
            if (player.re.points.gte(cap.times(0.5)))
                return "<span style='color:#ffb74d'>" + lg("软帽将于 " + format(cap) + " 谐振处生效", "Softcap starts at " + format(cap) + " resonance") + "</span>"
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": { content: [["blank", "12px"], "upgrades"] },
            "Milestones": { content: [["blank", "12px"], "milestones"] },
            "Cavity": { content: [["blank", "12px"], "buyables"] },
            "Formula": { content: [
                ["blank", "12px"],
                ["display-text", function() {
                    let n = 0
                    for (let i = 0; i < 5; i++) if (hasMilestone("re", i)) n++
                    return lg("谐振产量 = (回声 ÷ 6.3e3)^(0.3 × " + (1 + n * 0.0333).toFixed(4) + ") × 乘区 × 帽 —— 同相链在加深指数本身。",
                              "Resonance gain = (echoes ÷ 6.3e3)^(0.3 × " + (1 + n * 0.0333).toFixed(4) + ") × zones × cap — the in-phase chain deepens the exponent itself.")
                }],
            ] },
        },
    },

    upgrades: {
        11: {
            title() { return lg("谐振基准", "Reference Tone") },
            description() { return lg("微响产量 ×2。", "Hum gain ×2.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return lg("声部叠加", "Voice Stacking") },
            description() { return lg("回声产量 ×2.5。", "Echo gain ×2.5.") },
            cost: new Decimal(4),
        },
        13: {
            title() { return lg("谐振增幅", "Resonant Boost") },
            description() { return lg("谐振产量 ×2。", "Resonance gain ×2.") },
            cost: new Decimal(20),
        },
        14: {
            title() { return lg("交叉调制", "Cross-Modulation") },
            description() { return lg("谐振产量基于你的回声。", "Resonance gain is boosted by your echoes.") },
            cost: new Decimal(100),
            effect() { return player.ec.points.add(1).pow(0.2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        15: {
            title() { return lg("阻尼调整", "Damping Tune") },
            description() { return lg("谐振软帽起点 ×10。", "Resonance softcap starts ×10 later.") },
            cost: new Decimal(800),
        },
        21: {
            title() { return lg("谐振腔设计", "Cavity Blueprint") },
            description() { return lg("解锁 buyable「谐振腔」。", "Unlock the 'Cavity' buyable.") },
            cost: new Decimal(5000),
            unlocked() { return getBuyableAmount("ec", 11).gte(2) },
        },
        22: {
            title() { return lg("频谱分析", "Spectrum Analysis") },
            description() { return lg("微响产量基于微响（对数平方）。", "Hum gain is boosted by hums (log-squared).") },
            cost: new Decimal(5e4),
            effect() { return player.points.add(1).log10().add(1).pow(2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        23: {
            title() { return lg("相位锁定", "Phase Lock") },
            description() { return lg("谐振最高值 ≥ 1e4 时，回声产量 ×5。", "While resonance best ≥ 1e4, echo gain ×5.") },
            cost: new Decimal(5e5),
        },
        24: {
            title() { return lg("波纹强化", "Ripple Reinforce") },
            description() { return lg("涟漪产量 ×3。", "Ripple gain ×3.") },
            cost: new Decimal(5e6),
        },
        25: {
            title() { return lg("同相精调", "Fine Phasing") },
            description() { return lg("「谐振阶数」再深一档（指数 +3.3%）。", "The in-phase chain deepens one more step (exponent +3.3%).") },
            cost: new Decimal(5e8),
        },
        31: {
            title() { return lg("拍频", "Beat Frequency") },
            description() { return lg("谐振产量基于谐振最高值（对数）。", "Resonance gain is boosted by your resonance best (log).") },
            cost: new Decimal(5e10),
            effect() { return player.re.best.add(1).log10().add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
    },

    milestones: {
        0: {
            requirementDescription() { return lg("拥有 3e3 谐振（最高值）", "Reach 3e3 resonance (best)") },
            effectDescription() { return lg("「同相 I」：谐振指数 +3.3%。", "In-Phase I: resonance exponent +3.3%.") },
            done() { return player.re.best.gte(3000) },
        },
        1: {
            requirementDescription() { return lg("拥有 3e4 谐振（最高值）", "Reach 3e4 resonance (best)") },
            effectDescription() { return lg("「同相 II」+3.3%，且自动购买涟漪升级。", "In-Phase II: +3.3%, and ripple upgrades are bought automatically.") },
            done() { return player.re.best.gte(3e4) },
            unlocked() { return hasMilestone("re", 0) },
        },
        2: {
            requirementDescription() { return lg("拥有 3e5 谐振（最高值）", "Reach 3e5 resonance (best)") },
            effectDescription() { return lg("「同相 III」：+3.3%。", "In-Phase III: +3.3%.") },
            done() { return player.re.best.gte(3e5) },
            unlocked() { return hasMilestone("re", 1) },
        },
        3: {
            requirementDescription() { return lg("拥有 3e6 谐振（最高值）", "Reach 3e6 resonance (best)") },
            effectDescription() { return lg("「同相 IV」+3.3%，且回声自动增长（被动生成）。", "In-Phase IV: +3.3%, and echoes generate passively.") },
            done() { return player.re.best.gte(3e6) },
            unlocked() { return hasMilestone("re", 2) },
        },
        4: {
            requirementDescription() { return lg("拥有 3e7 谐振（最高值）", "Reach 3e7 resonance (best)") },
            effectDescription() { return lg("「同相 V」：+3.3%。全链同相。", "In-Phase V: +3.3%. The whole chain is in phase.") },
            done() { return player.re.best.gte(3e7) },
            unlocked() { return hasMilestone("re", 3) },
        },
    },

    buyables: {
        11: {
            title() { return lg("谐振腔", "Cavity") },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return lg("每级让谐振产量 ×" + (hasUpgrade("ov", 42) ? 1.7 : 1.55) + "。<br>当前：", "Each level multiplies resonance gain by ×" + (hasUpgrade("ov", 42) ? 1.7 : 1.55) + ".<br>Currently: ")
                    + format(d.effect) + "x" + lg("<br>等级：", "<br>Level: ") + formatWhole(getBuyableAmount(this.layer, this.id))
                    + lg("<br>成本：", "<br>Cost: ") + format(d.cost) + " " + lg("谐振", "resonance")
            },
            cost(x) { return Decimal.pow(2.8, x).times(1000) },
            effect(x) { return Decimal.pow(hasUpgrade("ov", 42) ? 1.7 : 1.55, x) },
            canAfford() { return player.re.points.gte(tmp.re.buyables[11].cost) },
            buy() {
                let c = tmp.re.buyables[11].cost
                player.re.points = player.re.points.sub(c)
                player.re.spentOnBuyables = player.re.spentOnBuyables.add(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return hasUpgrade("re", 21) },
        },
    },

    // automation: passiveGen ← so.m1 ; autoUpgrade ← ch.m1 ; Cavity autobuy ← si.m0
    passiveGeneration() { return hasMilestone("so", 1) ? 1 : 0 },
    autoUpgrade() { return hasMilestone("ch", 1) },
    automate() {
        if (hasMilestone("si", 0)) geoBuyMax("re", 11, 1000, 2.8)
    },
})
