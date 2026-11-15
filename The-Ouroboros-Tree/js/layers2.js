// layers2.js — rows 3–5: 驻波 sw (static), 反馈环 fl (+涡度 secondary), 泛音 ov (+shop)

// ---------------- row 3 — 驻波 Standing Wave (static floor) ----------------
addLayer("sw", {
    name: "Standing Wave",
    symbol: "驻",
    position: 0,
    row: 3,
    color: "#b39ddb",
    resource() { return lg("驻波", "standing waves") },
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},

    baseResource() { return lg("谐振", "resonance") },
    baseAmount() { return player.re.points },
    requires: new Decimal(160000),
    type: "static",
    base: 2,
    exponent: 1,
    roundUpCost: true,
    resetDescription() { return lg("立起", "Stand for ") },
    canBuyMax() { return hasUpgrade("sw", 15) },

    effect() {
        return { echoMult: player.sw.points.add(1).pow(TUNING.ECHO_POW) }
    },
    effectDescription() {
        return lg("你的驻波把更老的每一层推 ×" + format(this.effect().echoMult), "Your standing waves boost every older layer by ×" + format(this.effect().echoMult))
    },

    // zone table — static floor: zones <1 mean CHEAPER (÷); gainMult is their product
    zoneList() {
        const z = []
        const add = (n, v) => z.push({ n, v })
        if (hasUpgrade("sw", 12)) add(lg("固定端", "Fixed End"), new Decimal(1).div(1.5))
        add(lg("波腹（自增益项）", "Antinodes (self-gain)"), Decimal.pow(antiDiscount(), getBuyableAmount("sw", 11)))
        if (hasUpgrade("in", 13)) add(lg("相消干涉（干波）", "Destructive Interference (Interference)"), new Decimal(0.5))
        if (hasUpgrade("so", 23)) add(lg("锁模（自振荡）", "Mode Locking (Self-Osc.)"), new Decimal(1).div(1.5))
        if (hasUpgrade("fr", 21)) add(lg("分形驻波（分形）", "Fractal Standing Wave (Fractal)"), new Decimal(0.5))
        add(lg("谐波列", "Overtone Series"), new Decimal(1).div(buyableEffect("ov", 11)))
        add(lg("回声网", "Echo web"), new Decimal(1).div(echoWeb(["fl", "ov", "in", "so", "ch", "fr", "si", "ou"])))
        add(lg("成就之力", "Achievements"), new Decimal(1).div(achievementReward("sw")))
        return z
    },
    gainMult() { return zoneProduct(this.zoneList()) },
    gainExp() {
        let e = manifoldMod("sw")
        if (hasMilestone("sw", 3)) e = e.times(1.1)
        if (hasMilestone("sw", 4)) e = e.times(1.1)
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
        { key: "w", description() { return lg("w: 立起驻波", "w: stand a wave") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            return lg("下一道驻波成本：", "Next standing wave costs: ") + format(tmp.sw.nextAt) + " " + lg("谐振", "resonance")
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": { content: [["blank", "12px"], "upgrades"] },
            "Milestones": { content: [["blank", "12px"], "milestones"] },
            "Antinodes": { content: [["blank", "12px"], "buyables"] },
            "Formula": { content: [
                ["blank", "12px"],
                ["display-text", function() {
                    return lg("驻波是地板：每道成本 = 1.6e5 × 2^层数 × 价格系数。波腹（自增益项）让价格 ÷1.4^级 —— 波腹喂养波腹。（乘区越小越便宜）",
                              "Waves are a floor: each costs 1.6e5 × 2^floors × price factors. Antinodes (self-gain) divide the price by 1.4^level — antinodes feeding antinodes. (Smaller zones = cheaper)")
                }],
                ["display-text", function() {
                    return lg("<b>当前价格系数：</b><br>", "<b>Active price zones:</b><br>") + zoneLines(layers.sw.zoneList())
                }],
            ] },
        },
    },

    upgrades: {
        11: {
            title() { return lg("地基", "Foundation") },
            description() { return lg("微响产量 ×3。", "Hum gain ×3.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return lg("固定端", "Fixed End") },
            description() { return lg("驻波成本 ÷1.5。", "Standing waves cost ÷1.5.") },
            cost: new Decimal(2),
        },
        13: {
            title() { return lg("谐波回响", "Harmonic Echo") },
            description() { return lg("回声产量基于驻波（对数平方）。", "Echo gain is boosted by standing waves (log-squared).") },
            cost: new Decimal(3),
            effect() { return player.sw.points.add(1).log10().add(1).pow(2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        14: {
            title() { return lg("驻波馈能", "Wave Feeding") },
            description() { return lg("谐振产量基于驻波。", "Resonance gain is boosted by standing waves.") },
            cost: new Decimal(4),
            effect() { return player.sw.points.add(1).pow(0.3) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        15: {
            title() { return lg("一次性立满", "Buy Max") },
            description() { return lg("解锁驻波「一次立满」。", "Unlock buy-max for standing waves.") },
            cost: new Decimal(6),
        },
        21: {
            title() { return lg("波腹强化", "Antinode Boost") },
            description() { return lg("「波腹」的价格折扣 1.4 → 1.9。", "The antinode price discount 1.4 → 1.9 per level.") },
            cost: new Decimal(10),
        },
        22: {
            title() { return lg("共振放大", "Resonant Amplifier") },
            description() { return lg("微响产量基于驻波。", "Hum gain is boosted by standing waves.") },
            cost: new Decimal(16),
            effect() { return player.sw.points.add(1).pow(0.5) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        23: {
            title() { return lg("腔体耦合", "Cavity Coupling") },
            description() { return lg("回声产量基于谐振。", "Echo gain is boosted by resonance.") },
            cost: new Decimal(25),
            effect() { return player.re.points.add(1).pow(0.15) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: {
            title() { return lg("基波放大", "Fundamental Boost") },
            description() { return lg("里程碑「基波」奖励 ×2。", "The 'Fundamental' milestone is twice as strong.") },
            cost: new Decimal(50),
        },
        25: {
            title() { return lg("驻波谐系", "Wave Family") },
            description() { return lg("涟漪产量 ×5。", "Ripple gain ×5.") },
            cost: new Decimal(120),
        },
    },

    milestones: {
        0: {
            requirementDescription() { return lg("立起 3 道驻波（最高值）", "Stand 3 waves (best)") },
            effectDescription() { return lg("「基波」：回声产量 ×5。", "Fundamental: echo gain ×5.") },
            done() { return player.sw.best.gte(3) },
        },
        1: {
            requirementDescription() { return lg("立起 6 道驻波（最高值）", "Stand 6 waves (best)") },
            effectDescription() { return lg("「驻立谐振」：谐振产量 ×3。", "Standing Resonance: resonance gain ×3.") },
            done() { return player.sw.best.gte(6) },
            unlocked() { return hasMilestone("sw", 0) },
        },
        2: {
            requirementDescription() { return lg("立起 10 道驻波（最高值）", "Stand 10 waves (best)") },
            effectDescription() { return lg("自动购买回声升级。", "Echo upgrades are bought automatically.") },
            done() { return player.sw.best.gte(10) },
            unlocked() { return hasMilestone("sw", 1) },
        },
        3: {
            requirementDescription() { return lg("立起 15 道驻波（最高值）", "Stand 15 waves (best)") },
            effectDescription() { return lg("驻波成本再便宜 10%（指数）。", "Standing waves get another 10% cheaper (exponent).") },
            done() { return player.sw.best.gte(15) },
            unlocked() { return hasMilestone("sw", 2) },
        },
        4: {
            requirementDescription() { return lg("立起 25 道驻波（最高值）", "Stand 25 waves (best)") },
            effectDescription() { return lg("「谐波驻立」：成本再便宜 10%。", "Harmonic Standing: another 10% cheaper.") },
            done() { return player.sw.best.gte(25) },
            unlocked() { return hasMilestone("sw", 3) },
        },
    },

    buyables: {
        11: {
            title() { return lg("波腹", "Antinode") },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return lg("自增益项：每道波腹让驻波价格 ÷" + antiDiscount() + "，涟漪产量 ×1.1（成本 = 20 × 4^道数）—— 越买越便宜。<br>当前价格折扣：",
                          "Self-gain: each antinode divides wave prices by " + antiDiscount() + " and boosts ripple gain ×1.1 — the more you buy, the cheaper it gets.<br>Current discount: ")
                    + format(d.effect.discount) + lg("<br>涟漪加成：", "<br>Ripple boost: ") + format(d.effect.ripple)
                    + "x" + lg("<br>数量：", "<br>Owned: ") + formatWhole(getBuyableAmount(this.layer, this.id))
                    + lg("<br>成本：", "<br>Cost: ") + format(d.cost) + " " + lg("驻波", "waves")
            },
            cost(x) { return Decimal.pow(4, x).times(20) },
            effect(x) { return { discount: Decimal.pow(antiDiscount(), x), ripple: Decimal.pow(1.1, x) } },
            canAfford() { return player.sw.points.gte(tmp.sw.buyables[11].cost) },
            buy() {
                let c = tmp.sw.buyables[11].cost
                player.sw.points = player.sw.points.sub(c)
                player.sw.spentOnBuyables = player.sw.spentOnBuyables.add(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return player.sw.best.gte(2) },
        },
    },

    // static automation package (resetsNothing + autoPrestige + autoUpgrade) granted by in.m0 — N-AUTOWIPE:
    // all three flags read the same milestone set, so the automated reset is always the safe one.
    resetsNothing() { return hasMilestone("in", 0) },
    autoPrestige() { return hasMilestone("in", 0) },
    autoUpgrade() { return hasMilestone("in", 0) },
    automate() {
        if (hasMilestone("ou", 0)) geoBuyMax("sw", 11, 20, 4)
    },
})

// 波腹 per-level price discount (knobs: sw 21 / ov shop 44)
function antiDiscount() {
    return 1.4 + (hasUpgrade("sw", 21) ? 0.5 : 0) + (hasUpgrade("ov", 44) ? 0.3 : 0)
}

// 涡核 per-level strength (knobs: fl m3 / ov shop 45)
function vortexPer() {
    return 1.35 + (hasMilestone("fl", 3) ? 0.15 : 0) + (hasUpgrade("ov", 45) ? 0.1 : 0)
}

// ---------------- row 4 — 反馈环 Feedback Loop (+涡度 secondary currency) ----------------
addLayer("fl", {
    name: "Feedback Loop",
    symbol: "环",
    position: 0,
    row: 4,
    color: "#ce93d8",
    resource() { return lg("反馈环", "feedback loops") },
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        vortex: new Decimal(0),   // 涡度 — secondary currency, banked on prestige (tickless M5)
    }},

    baseResource() { return lg("谐振", "resonance") },
    baseAmount() { return player.re.points },
    requires: new Decimal(4e6),
    type: "normal",
    exponent: 0.3,
    resetDescription() { return lg("闭合成环", "Loop for ") },

    effect() {
        return { echoMult: player.fl.points.add(1).pow(TUNING.ECHO_POW) }
    },
    effectDescription() {
        return lg("你的反馈环把更老的每一层推 ×" + format(this.effect().echoMult), "Your feedback loops boost every older layer by ×" + format(this.effect().echoMult))
    },

    softcap() {
        let s = new Decimal(TUNING.SOFTCAP_START.fl)
        if (hasUpgrade("fl", 24)) s = s.times(10)
        if (hasMilestone("fl", 4)) s = s.times(10)
        return s
    },
    softcapPower() { return new Decimal(TUNING.SOFTCAP_POW.fl) },

    // zone table — gainMult is its product; the Formula tab renders the same list
    zoneList() {
        const z = []
        const add = (n, v) => z.push({ n, v })
        if (hasUpgrade("fl", 12)) add(lg("回声记忆（自增益项）", "Echo Memory (self-gain)"), upgradeEffect("fl", 12))
        if (hasUpgrade("fl", 23)) add(lg("环内回声", "Inner Echo"), upgradeEffect("fl", 23))
        if (hasMilestone("fl", 2)) add(lg("环内扩容", "Loop Expansion"), new Decimal(2.5))
        if (hasMilestone("fl", 5)) add(lg("全环反馈", "Full-Loop Feedback"), new Decimal(3))
        add(lg("涡核", "Vortex Core"), buyableEffect("fl", 12))
        if (hasUpgrade("ov", 14)) add(lg("上谐共鸣（泛音）", "Upper Resonance (Overtone)"), upgradeEffect("ov", 14))
        if (hasUpgrade("in", 21)) add(lg("深度干涉（干波）", "Deep Interference (Interference)"), new Decimal(3))
        if (hasMilestone("in", 1)) add(lg("干涉馈能（干波）", "Interference Feed (Interference)"), new Decimal(3))
        if (hasUpgrade("so", 15)) add(lg("谐振反馈（自振荡）", "Resonant Feedback (Self-Osc.)"), new Decimal(2.5))
        if (hasUpgrade("ch", 15)) add(lg("湍流馈能（混沌）", "Turbulent Feed (Chaos)"), new Decimal(3))
        if (hasUpgrade("fr", 15)) add(lg("曼德博馈能（分形）", "Mandelbrot Feed (Fractal)"), new Decimal(5))
        if (hasUpgrade("si", 15)) add(lg("霍金辐射（奇点）", "Hawking Radiation (Singularity)"), new Decimal(8))
        if (hasUpgrade("ou", 24)) add(lg("环流归环（衔尾）", "Loops Return (Ouroboros)"), new Decimal(10))
        if (hasMilestone("fr", 0)) add(lg("分形馈环（分形）", "Fractal Feed (Fractal)"), new Decimal(25))
        add(lg("谐波列", "Overtone Series"), buyableEffect("ov", 11))
        add(lg("回声网", "Echo web"), echoWeb(["ov", "in", "so", "ch", "fr", "si", "ou"]))
        add(lg("成就之力", "Achievements"), achievementReward("fl"))
        return z
    },
    gainMult() { return zoneProduct(this.zoneList()) },
    gainExp() { return manifoldMod("fl") },

    // 涡度 banks on every real prestige (F24: onPrestige only fires on the non-forced path)
    onPrestige(gain) {
        player.fl.vortex = player.fl.vortex.add(gain.pow(0.5).max(1).floor())
    },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let kept = ["best", "total", "vortex"]
            if (hasMilestone("ou", 6)) kept.push("upgrades")
            if (hasMilestone("ou", 7)) kept.push("milestones")
            layerDataReset(this.layer, kept)
        }
    },

    hotkeys: [
        { key: "f", description() { return lg("f: 闭合成反馈环", "f: close a feedback loop") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            return lg("涡度：", "Vorticity: ") + "<b style='color:#ce93d8'>" + format(player.fl.vortex) + "</b>" +
                lg("（每次反馈声望结算，永不丢失）", " (banked on every feedback prestige, never lost)")
        }],
        ["display-text", function() {
            let cap = tmp.fl.softcap
            if (player.fl.points.gte(cap.times(0.5)))
                return "<span style='color:#ffb74d'>" + lg("软帽将于 " + format(cap) + " 反馈环处生效", "Softcap starts at " + format(cap) + " feedback loops") + "</span>"
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": { content: [["blank", "12px"], "upgrades"] },
            "Milestones": { content: [["blank", "12px"], "milestones"] },
            "Vortex": { content: [["blank", "12px"], "buyables"] },
            "Formula": { content: [
                ["blank", "12px"],
                ["display-text", function() {
                    return lg("反馈环产量 = (谐振 ÷ 4e6)^0.3 × 乘区 × 帽", "Feedback gain = (resonance ÷ 4e6)^0.3 × zones × cap")
                }],
                ["display-text", function() {
                    if (!hasUpgrade("fl", 12)) return ""
                    let p = hasUpgrade("fl", 31) ? 0.45 : 0.4
                    return lg("回声记忆（自增益项）：反馈环最高值^" + p + " —— 环记得自己曾经有多大。",
                              "Echo Memory (self-gain): feedback best^" + p + " — the loop remembers how big it once was.")
                }],
                ["display-text", function() {
                    return lg("<b>当前乘区：</b><br>", "<b>Active zones:</b><br>") + zoneLines(layers.fl.zoneList())
                }],
            ] },
        },
    },

    upgrades: {
        11: {
            title() { return lg("反馈启动", "Loop Start") },
            description() { return lg("微响产量 ×2。", "Hum gain ×2.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return lg("回声记忆", "Echo Memory") },
            description() { return lg("<b>自增益项</b>：反馈环产量基于反馈环最高值（环记得自己的巅峰）。", "<b>Self-gain:</b> feedback gain is boosted by your feedback BEST (the loop remembers its peak).") },
            cost: new Decimal(3),
            effect() {
                let p = hasUpgrade("fl", 31) ? 0.45 : 0.4
                return softcap(player.fl.best.add(1).pow(p), new Decimal(TUNING.SELF_CAP_START.fl), TUNING.SELF_CAP_POW)
            },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        13: {
            title() { return lg("正反馈", "Positive Feedback") },
            description() { return lg("回声产量 ×2.5。", "Echo gain ×2.5.") },
            cost: new Decimal(10),
        },
        14: {
            title() { return lg("信号增益", "Signal Gain") },
            description() { return lg("微响产量基于微响。", "Hum gain is boosted by hums.") },
            cost: new Decimal(40),
            effect() { return player.points.add(1).pow(0.2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        15: {
            title() { return lg("环路谐振", "Loop Resonance") },
            description() { return lg("谐振产量 ×2.5。", "Resonance gain ×2.5.") },
            cost: new Decimal(200),
        },
        21: {
            title() { return lg("涡度旋钮", "Vortex Knob") },
            description() { return lg("解锁 buyable「涡核」。", "Unlock the 'Vortex Core' buyable.") },
            cost: new Decimal(1000),
            unlocked() { return hasMilestone("fl", 1) && player.fl.vortex.gte(1) },
        },
        22: {
            title() { return lg("浪回收", "Wave Recovery") },
            description() { return lg("反馈环最高值 ≥ 100 时，涟漪产量 ×5。", "While feedback best ≥ 100, ripple gain ×5.") },
            cost: new Decimal(1e4),
        },
        23: {
            title() { return lg("环内回声", "Inner Echo") },
            description() { return lg("反馈环产量基于涟漪。", "Feedback gain is boosted by ripples.") },
            cost: new Decimal(1e5),
            effect() { return player.ri.points.add(1).pow(0.25) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: {
            title() { return lg("扩容", "Wider Pipe") },
            description() { return lg("反馈环软帽起点 ×10。", "Feedback softcap starts ×10 later.") },
            cost: new Decimal(1e6),
        },
        25: {
            title() { return lg("外溢", "Spillway") },
            description() { return lg("回声产量 ×3。", "Echo gain ×3.") },
            cost: new Decimal(1e8),
        },
        31: {
            title() { return lg("深度反馈", "Deeper Memory") },
            description() { return lg("「回声记忆」指数 0.4 → 0.45。", "Echo Memory exponent 0.4 → 0.45.") },
            cost: new Decimal(1e10),
            unlocked() { return hasMilestone("fl", 2) },
        },
        32: {
            title() { return lg("环尾谐振", "Loop-Tail Resonance") },
            description() { return lg("谐振产量基于反馈环。", "Resonance gain is boosted by feedback loops.") },
            cost: new Decimal(1e12),
            unlocked() { return hasMilestone("fl", 2) },
            effect() { return player.fl.points.add(1).pow(0.3) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
    },

    milestones: {
        0: {
            requirementDescription() { return lg("拥有 25 反馈环（最高值）", "Reach 25 feedback loops (best)") },
            effectDescription() { return lg("「环鸣」：回声产量 ×3。", "Ring Resonance: echo gain ×3.") },
            done() { return player.fl.best.gte(25) },
        },
        1: {
            requirementDescription() { return lg("拥有 50 反馈环（最高值）", "Reach 50 feedback loops (best)") },
            effectDescription() { return lg("解锁副货币「涡度」。", "Unlock the secondary currency 'Vorticity'.") },
            done() { return player.fl.best.gte(50) },
            unlocked() { return hasMilestone("fl", 0) },
        },
        2: {
            requirementDescription() { return lg("拥有 120 反馈环（最高值）", "Reach 120 feedback loops (best)") },
            effectDescription() { return lg("反馈环产量 ×2.5。", "Feedback gain ×2.5.") },
            done() { return player.fl.best.gte(120) },
            unlocked() { return hasMilestone("fl", 1) },
        },
        3: {
            requirementDescription() { return lg("拥有 300 反馈环（最高值）", "Reach 300 feedback loops (best)") },
            effectDescription() { return lg("「涡核」效果 1.35 → 1.5。", "Vortex Core effect 1.35 → 1.5.") },
            done() { return player.fl.best.gte(300) },
            unlocked() { return hasMilestone("fl", 2) },
        },
        4: {
            requirementDescription() { return lg("拥有 800 反馈环（最高值）", "Reach 800 feedback loops (best)") },
            effectDescription() { return lg("反馈环软帽起点 ×10。", "Feedback softcap starts ×10 later.") },
            done() { return player.fl.best.gte(800) },
            unlocked() { return hasMilestone("fl", 3) },
        },
        5: {
            requirementDescription() { return lg("拥有 2000 反馈环（最高值）", "Reach 2000 feedback loops (best)") },
            effectDescription() { return lg("「全环反馈」：反馈环产量 ×3。", "Full-Loop Feedback: feedback gain ×3.") },
            done() { return player.fl.best.gte(2000) },
            unlocked() { return hasMilestone("fl", 4) },
        },
    },

    buyables: {
        12: {
            title() { return lg("涡核", "Vortex Core") },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return lg("每级让反馈环产量 ×" + vortexPer() + "（吃涡度，成本 = 5 × 2.5^级）。<br>当前：", "Each level multiplies feedback gain by ×" + vortexPer() + " (fed by vorticity, cost = 5 × 2.5^level).<br>Currently: ")
                    + format(d.effect) + "x" + lg("<br>等级：", "<br>Level: ") + formatWhole(getBuyableAmount(this.layer, this.id))
                    + lg("<br>成本：", "<br>Cost: ") + format(d.cost) + " " + lg("涡度", "vorticity")
            },
            cost(x) { return Decimal.pow(2.5, x).times(5) },
            effect(x) { return Decimal.pow(vortexPer(), x) },
            canAfford() { return player.fl.vortex.gte(tmp.fl.buyables[12].cost) },
            currencyDisplayName() { return lg("涡度", "vorticity") },
            currencyInternalName: "vortex",
            currencyLocation() { return player.fl },
            buy() {
                let c = tmp.fl.buyables[12].cost
                player.fl.vortex = player.fl.vortex.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return hasUpgrade("fl", 21) },
        },
    },

    // automation: passiveGen ← ov.m2 ; autoUpgrade ← ch.m2
    passiveGeneration() { return hasMilestone("ov", 2) ? 1 : 0 },
    autoUpgrade() { return hasMilestone("ch", 2) },
})

// ---------------- row 5 — 泛音 Overtone (+shop) ----------------
addLayer("ov", {
    name: "Overtone",
    symbol: "泛",
    position: 0,
    row: 5,
    color: "#ef5350",
    resource() { return lg("泛音", "overtones") },
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},

    baseResource() { return lg("反馈环", "feedback loops") },
    baseAmount() { return player.fl.points },
    requires: new Decimal(1e8),
    type: "normal",
    exponent: 0.3,
    resetDescription() { return lg("奏响泛音", "Sound for ") },

    effect() {
        let p = TUNING.ECHO_POW + (hasUpgrade("ov", 32) ? 0.02 : 0)
        return { echoMult: player.ov.points.add(1).pow(p) }
    },
    effectDescription() {
        return lg("你的泛音把更老的每一层推 ×" + format(this.effect().echoMult), "Your overtones boost every older layer by ×" + format(this.effect().echoMult))
    },

    softcap() {
        let s = new Decimal(TUNING.SOFTCAP_START.ov)
        if (hasUpgrade("ov", 15)) s = s.times(10)
        if (hasUpgrade("in", 25)) s = s.times(10)   // 相干光
        if (hasMilestone("ov", 4)) s = s.times(10)
        return s
    },
    softcapPower() { return new Decimal(TUNING.SOFTCAP_POW.ov) },

    // zone table — gainMult is its product; the Formula tab renders the same list
    zoneList() {
        const z = []
        const add = (n, v) => z.push({ n, v })
        if (hasUpgrade("ov", 12)) add(lg("谐波（自增益项）", "Harmonics (self-gain)"), upgradeEffect("ov", 12))
        if (hasUpgrade("ov", 14)) add(lg("上谐共鸣", "Upper Resonance"), upgradeEffect("ov", 14))
        if (hasUpgrade("ov", 23)) add(lg("谐振提取", "Resonance Extraction"), upgradeEffect("ov", 23))
        if (hasUpgrade("in", 14)) add(lg("拍频（干波）", "Beat Frequency (Interference)"), upgradeEffect("in", 14))
        if (hasMilestone("in", 2)) add(lg("相干泛音（干波）", "Coherent Overtones (Interference)"), new Decimal(2.5))
        if (hasMilestone("ov", 1)) add(lg("鸣响", "Ringing"), new Decimal(2))
        if (hasMilestone("ov", 3)) add(lg("泛音列", "Overtone Series"), hasUpgrade("ov", 25) ? new Decimal(6) : new Decimal(3))
        if (hasUpgrade("so", 14)) add(lg("受激辐射（自振荡）", "Stimulated Emission (Self-Osc.)"), upgradeEffect("so", 14))
        if (hasUpgrade("ch", 14)) add(lg("蝴蝶效应（混沌）", "Butterfly Effect (Chaos)"), upgradeEffect("ch", 14))
        if (hasUpgrade("fr", 14)) add(lg("无限细节（分形）", "Infinite Detail (Fractal)"), upgradeEffect("fr", 14))
        if (hasUpgrade("si", 14)) add(lg("引力透镜（奇点）", "Gravitational Lensing (Singularity)"), upgradeEffect("si", 14))
        if (hasUpgrade("ou", 25)) add(lg("泛音归环（衔尾）", "Overtones Return (Ouroboros)"), new Decimal(10))
        add(lg("回声网", "Echo web"), echoWeb(["in", "so", "ch", "fr", "si", "ou"]))
        add(lg("成就之力", "Achievements"), achievementReward("ov"))
        return z
    },
    gainMult() { return zoneProduct(this.zoneList()) },
    gainExp() { return manifoldMod("ov") },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let kept = ["best", "total"]
            if (hasMilestone("ou", 6)) kept.push("upgrades")
            if (hasMilestone("ou", 7)) kept.push("milestones")
            layerDataReset(this.layer, kept)
        }
    },

    hotkeys: [
        { key: "o", description() { return lg("o: 奏响泛音", "o: sound an overtone") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            let cap = tmp.ov.softcap
            if (player.ov.points.gte(cap.times(0.5)))
                return "<span style='color:#ffb74d'>" + lg("软帽将于 " + format(cap) + " 泛音处生效", "Softcap starts at " + format(cap) + " overtones") + "</span>"
        }],
        ["microtabs", "stuff"],
        ["blank", "30px"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": { content: [["blank", "12px"], "upgrades"] },
            "Milestones": { content: [["blank", "12px"], "milestones"] },
            "Series": { content: [["blank", "12px"], "buyables"] },
            "Shop": {
                unlocked() { return hasUpgrade("ov", 21) },
                content: [
                    ["blank", "12px"],
                    ["display-text", function() { return lg("泛音商店：把旧回路重新调亮。", "The Overtone Shop: retune your older loops.") }],
                    "blank",
                    ["upgrades", [41, 42, 43, 44, 45]],
                ],
            },
            "Formula": { content: [
                ["blank", "12px"],
                ["display-text", function() {
                    return lg("泛音产量 = (反馈环 ÷ 1e8)^0.3 × 乘区 × 帽", "Overtone gain = (feedback ÷ 1e8)^0.3 × zones × cap")
                }],
                ["display-text", function() {
                    return lg("谐波（自增益项）：log10(泛音)² —— 频率越高，谐波越密。",
                              "Harmonics (self-gain): log10(overtones)² — the higher the tone, the denser the harmonics.")
                }],
                ["display-text", function() {
                    return lg("<b>当前乘区：</b><br>", "<b>Active zones:</b><br>") + zoneLines(layers.ov.zoneList())
                }],
            ] },
        },
    },

    upgrades: {
        11: {
            title() { return lg("基频", "Fundamental") },
            description() { return lg("微响产量 ×2。", "Hum gain ×2.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return lg("谐波", "Harmonics") },
            description() { return lg("<b>自增益项</b>：泛音产量基于泛音（对数平方）。", "<b>Self-gain:</b> overtone gain is boosted by overtones (log-squared).") },
            cost: new Decimal(4),
            effect() { return player.ov.points.add(1).log(10).pow(2).add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        13: {
            title() { return lg("倍频", "Doubling") },
            description() { return lg("反馈环产量 ×2.5。", "Feedback gain ×2.5.") },
            cost: new Decimal(20),
        },
        14: {
            title() { return lg("上谐共鸣", "Upper Resonance") },
            description() { return lg("泛音产量基于反馈环。", "Overtone gain is boosted by feedback loops.") },
            cost: new Decimal(100),
            effect() { return player.fl.points.add(1).pow(0.2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        15: {
            title() { return lg("音室扩容", "Wider Hall") },
            description() { return lg("泛音软帽起点 ×10。", "Overtone softcap starts ×10 later.") },
            cost: new Decimal(600),
        },
        21: {
            title() { return lg("开张", "Grand Opening") },
            description() { return lg("解锁「商店」页签。", "Unlock the Shop tab.") },
            cost: new Decimal(3000),
        },
        22: {
            title() { return lg("高音清洗", "Treble Wash") },
            description() { return lg("微响产量基于微响（对数平方）。", "Hum gain is boosted by hums (log-squared).") },
            cost: new Decimal(2e4),
            effect() { return player.points.add(1).log10().add(1).pow(2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        23: {
            title() { return lg("谐振提取", "Resonance Extraction") },
            description() { return lg("泛音产量基于谐振。", "Overtone gain is boosted by resonance.") },
            cost: new Decimal(1.5e5),
            effect() { return player.re.points.add(1).pow(0.2) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: {
            title() { return lg("泛音回赠", "Overtone Gift") },
            description() { return lg("涟漪产量 ×3。", "Ripple gain ×3.") },
            cost: new Decimal(1e6),
        },
        25: {
            title() { return lg("泛音列扩张", "Longer Series") },
            description() { return lg("里程碑「泛音列」奖励 ×2。", "The 'Overtone Series' milestone is twice as strong.") },
            cost: new Decimal(1e8),
        },
        31: {
            title() { return lg("廉价谐波", "Cheap Harmonics") },
            description() { return lg("「谐波列」成本 ÷2。", "The Overtone Series costs ÷2.") },
            cost: new Decimal(1e10),
            unlocked() { return getBuyableAmount("fl", 12).gte(2) },
        },
        32: {
            title() { return lg("泛音深度", "Overtone Depth") },
            description() { return lg("泛音的「回声」指数 +0.02。", "The overtone echo exponent +0.02.") },
            cost: new Decimal(1e12),
        },
        // the shop (M8): K4/K5 upgrades for older named mechanics
        41: {
            title() { return lg("商店：石子袋", "Shop: Pebble Bag") },
            description() { return lg("「石子」效果 1.5 → 1.7 每级。", "The Pebble effect 1.5 → 1.7 per level.") },
            cost: new Decimal(2e4),
            unlocked() { return hasUpgrade("ov", 21) },
        },
        42: {
            title() { return lg("商店：腔体打磨", "Shop: Cavity Polish") },
            description() { return lg("「谐振腔」效果 1.55 → 1.7 每级。", "The Cavity effect 1.55 → 1.7 per level.") },
            cost: new Decimal(2e5),
            unlocked() { return hasUpgrade("ov", 21) },
        },
        43: {
            title() { return lg("商店：回声室扩建", "Shop: Chamber Annex") },
            description() { return lg("「回声室」效果 1.6 → 1.75 每级。", "The Echo Chamber effect 1.6 → 1.75 per level.") },
            cost: new Decimal(2e6),
            unlocked() { return hasUpgrade("ov", 21) },
        },
        44: {
            title() { return lg("商店：波腹加倍", "Shop: Antinode Doubler") },
            description() { return lg("「波腹」价格折扣 +0.3。", "The antinode price discount +0.3 per level.") },
            cost: new Decimal(2e7),
            unlocked() { return hasUpgrade("ov", 21) },
        },
        45: {
            title() { return lg("商店：涡核注能", "Shop: Vortex Overcharge") },
            description() { return lg("「涡核」效果 +0.1 每级。", "The Vortex Core effect +0.1 per level.") },
            cost: new Decimal(2e8),
            unlocked() { return hasUpgrade("ov", 21) },
        },
    },

    milestones: {
        0: {
            requirementDescription() { return lg("拥有 30 泛音（最高值）", "Reach 30 overtones (best)") },
            effectDescription() { return lg("「谐和」：回声产量 ×3。", "Consonance: echo gain ×3.") },
            done() { return player.ov.best.gte(30) },
        },
        1: {
            requirementDescription() { return lg("拥有 60 泛音（最高值）", "Reach 60 overtones (best)") },
            effectDescription() { return lg("「鸣响」：泛音产量 ×2。", "Ringing: overtone gain ×2.") },
            done() { return player.ov.best.gte(60) },
            unlocked() { return hasMilestone("ov", 0) },
        },
        2: {
            requirementDescription() { return lg("拥有 150 泛音（最高值）", "Reach 150 overtones (best)") },
            effectDescription() { return lg("反馈环自动增长（被动生成）。", "Feedback loops generate passively.") },
            done() { return player.ov.best.gte(150) },
            unlocked() { return hasMilestone("ov", 1) },
        },
        3: {
            requirementDescription() { return lg("拥有 400 泛音（最高值）", "Reach 400 overtones (best)") },
            effectDescription() { return lg("「泛音列」：泛音产量 ×3。", "Overtone Series: overtone gain ×3.") },
            done() { return player.ov.best.gte(400) },
            unlocked() { return hasMilestone("ov", 2) },
        },
        4: {
            requirementDescription() { return lg("拥有 1000 泛音（最高值）", "Reach 1000 overtones (best)") },
            effectDescription() { return lg("「谐波列」效果 1.3 → 1.4 每级。", "The Overtone Series effect 1.3 → 1.4 per level.") },
            done() { return player.ov.best.gte(1000) },
            unlocked() { return hasMilestone("ov", 3) },
        },
    },

    buyables: {
        11: {
            title() { return lg("谐波列", "Overtone Series") },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                let per = hasMilestone("ov", 4) ? 1.4 : 1.3
                return lg("泛音是老回路的倍频：每级让涟漪/回声/谐振/驻波/反馈环的产量全部 ×" + per + "（成本 = 8 × 2.2^级）。<br>等级：",
                          "Overtones multiply the older loops: each level boosts ripple/echo/resonance/wave/feedback gain by ×" + per + " (cost = 8 × 2.2^level).<br>Level: ")
                    + formatWhole(getBuyableAmount(this.layer, this.id))
                    + lg("<br>成本：", "<br>Cost: ") + format(d.cost) + " " + lg("泛音", "overtones")
            },
            cost(x) {
                let c = Decimal.pow(2.2, x).times(8)
                if (hasUpgrade("ov", 31)) c = c.div(2)
                return c
            },
            effect(x) { return Decimal.pow(hasMilestone("ov", 4) ? 1.4 : 1.3, x) },
            canAfford() { return player.ov.points.gte(tmp.ov.buyables[11].cost) },
            buy() {
                let c = tmp.ov.buyables[11].cost
                player.ov.points = player.ov.points.sub(c)
                player.ov.spentOnBuyables = player.ov.spentOnBuyables.add(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return player.ov.best.gte(5) },
        },
    },

    // automation: passiveGen ← so.m2 ; autoUpgrade ← si.m1 ; Series autobuy ← si.m0
    passiveGeneration() { return hasMilestone("so", 2) ? 1 : 0 },
    autoUpgrade() { return hasMilestone("si", 1) },
    automate() {
        if (hasMilestone("si", 0)) geoBuyMax("ov", 11, hasUpgrade("ov", 31) ? 4 : 8, 2.2)
    },
})
