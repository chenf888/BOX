// ============================================================
// Layer st — Strain 应变 (row 0 anchor)
// Force is suppressed by its own volume; the suppressed part
// becomes Stress. The wall IS the economy.
// ============================================================

addLayer("st", {
    name() { return L("Strain", "应变") },
    symbol: "ST",
    position: 0,
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        stress: new Decimal(0),   // the wall's harvest — survives every reset
    }},
    color: "#4fc3f7",
    resource() { return L("Strain", "应变") },
    row: 0,

    baseResource() { return L("Force", "力") },
    baseAmount() { return player.points },
    requires: new Decimal(10),
    type: "normal",
    exponent: 0.5,

    // Strain reset-gain softcap (measuredRetune shape: flat start, power 0.1)
    softcap() { return thSoftcapStart() },
    softcapPower() { return new Decimal(TUNING.row1.softcapPow) },

    gainMult() {
        var m = new Decimal(1)
        if (hasUpgrade("st", 25)) m = m.times(10)
        // stress shapes the wall you farmed it from (K2 on a family resource)
        m = m.times(player.st.stress.add(1).pow(0.08))
        if (hasMilestone("pl", 3)) m = m.times(2)
        if (hasUpgrade("tw", 24)) m = m.times(3)
        if (hasUpgrade("in", 25)) m = m.times(5)
        if (hasUpgrade("ov", 22)) m = m.times(10)
        if (hasMilestone("gr", 0)) m = m.times(2)
        if (hasAchievement("ac", 22)) m = m.times(2)
        if (hasAchievement("ac", 32)) m = m.times(3)
        return m
    },
    gainExp() { return new Decimal(mfTune(1)) },

    // automation ladder: passiveGeneration granted by pl m0 (plain number — N-PGBOOL)
    passiveGeneration() {
        if (hasMilestone("pl", 0) || hasAchievement("ac", 22)) return 1
        return 0
    },
    autoUpgrade() {
        return hasMilestone("th", 2) || hasAchievement("ac", 22)
    },

    // keep the stress harvest + the ladder records on every deeper reset (P9)
    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            var keep = ["unlocked", "auto", "stress", "best", "total"]
            if (hasMilestone("th", 2)) keep.push("upgrades", "milestones", "buyables")
            if (hasMilestone("mf", 2)) keep.push("upgrades", "milestones", "buyables")
            layerDataReset(this.layer, keep)
        }
    },

    update(diff) {
        var diff = new Decimal(diff)
        if (!player[this.layer].unlocked) return
        // threshold unlock writers — the single home (F28: update() runs for locked layers)
        if (!player.th.unlocked && player.st.points.gte(250)) player.th.unlocked = true
        if (!player.pl.unlocked && player.st.points.gte(400)) player.pl.unlocked = true
        if (!player.pt.unlocked && player.st.points.gte(700)) player.pt.unlocked = true
        if (!player.tw.unlocked && player.st.points.gte(5e7)) player.tw.unlocked = true
        if (!player.gr.unlocked && player.th.points.gte(1e6)) player.gr.unlocked = true
        if (!player.in.unlocked && player.pl.points.min(player.pt.points).gte(1e4)) player.in.unlocked = true
        if (!player.nc.unlocked && player.st.points.gte(1e9)) player.nc.unlocked = true
        if (!player.mf.unlocked && player.nc.best.gte(35)) player.mf.unlocked = true
        if (!player.ov.unlocked && player.mf.best.gte(25)) player.ov.unlocked = true
        // THE core loop: the suppressed fraction of Force production becomes Stress
        var rate = stressRate().times(stressBoost()).times(stressEffMult())
        if (hasMilestone("mf", 0)) rate = rate.pow(mfTune(2))
        if (rate.gt(0)) player.st.stress = player.st.stress.add(rate.times(diff))
        // Q3 no-hard-caps: stress compresses past 1e50 (hyperbolic) instead of clamping —
        // the .min() was a hidden hard wall. R14: pow 0.3 (was 0.5) — with the clamp gone
        // the ov-era stress^0.08 gain mult ran away; squeeze the tail harder.
        if (player.st.stress.gte(stressSoftcapVal())) {
            var s0 = stressSoftcapVal()
            player.st.stress = s0.times(player.st.stress.div(s0).pow(0.3))
        }
        // automation ladder step: closed-form buyMax on the resonance buyable (tw m1, P54)
        // (typeof-guard: the headless harness may call update() before its layers stub exists)
        if (hasMilestone("tw", 1) || hasAchievement("ac", 32)) {
            if (typeof layers !== "undefined" && layers.st && layers.st.buyables && layers.st.buyables[11]) {
                layers.st.buyables[11].buyMax()
            }
        }
    },

    layerShown() { return true },
    hotkeys: [
        { key: "c", description() { return L("C: Concentrate Force into Strain", "C：将力凝聚为应变") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    resetDescription() { return L("Concentrate for ", "凝聚为 ") },

    tabFormat: [
        ["infobox", "wallLore"],
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", function() {
            var T = strainCap(), F = player.points
            var pct = wallSupFrac().times(100)
            return L(
                "Force: " + format(F) + " / wall cap " + format(T) +
                " — suppressed <b style='color:#ff8a65'>" + formatWhole(pct) + "%</b>" +
                " (ideal rate " + format(forceIdealRate().times(paceMult())) + "/s → effective " + format(forceEffRate()) + "/s)",
                "力：" + format(F) + " / 墙上限 " + format(T) +
                " —— 被压制 <b style='color:#ff8a65'>" + formatWhole(pct) + "%</b>" +
                "（理想速率 " + format(forceIdealRate().times(paceMult())) + "/秒 → 实际 " + format(forceEffRate()) + "/秒）"
            )
        }],
        ["display-text", function() {
            return L(
                "Stress: " + format(player.st.stress) + "  (+ " + format(stressRate().times(stressBoost())) + "/s from the wall)",
                "应力：" + format(player.st.stress) + "（墙正在产出 +" + format(stressRate().times(stressBoost())) + "/秒）"
            )
        }],
        ["display-text", function() {
            if (!shiftDown) return ""
            return L(
                "eff = ideal × pace ÷ (1 + Force/cap)^" + forceSupExp() + " ;  stress = ideal − eff ;  cap = 100 × (1+Thresholds^0.25) × raises^" + metaCompExp().toFixed(2) + " × hardening × anchor",
                "实际 = 理想 × 节奏 ÷ (1 + 力/上限)^" + forceSupExp() + " ； 应力 = 理想 − 实际 ； 上限 = 100 × (1+阈值^0.25) × 抬升^" + metaCompExp().toFixed(2) + " × 硬化 × 锚帽"
            )
        }],
        ["microtabs", "stuff"],
        ["blank", "20px"],
    ],
    infoboxes: {
        wallLore: {
            title() { return L("How walls work", "墙如何运作") },
            body() { return L(
                "Force growth slows down as Force approaches its cap — that slowdown is a <b>softcap</b>, the first of many. " +
                "Whatever growth the wall suppresses is not lost: it becomes <b>Stress</b>, which buys the cap raises that weaken the wall. " +
                "Waiting against a wall is never wasted — it is the production.<br>" +
                "Set your preferred wall length in <b>Options</b> at any time.",
                "力的增长在接近上限时变慢——这个减速就是<b>软上限</b>，游戏中的第一个。被墙压制掉的增长并没有消失：它变成了<b>应力</b>，用来购买削弱墙的上限抬升。顶着墙等待永远不会白等——那就是生产本身。<br>随时可以在<b>选项</b>里设定你喜欢的时间墙长度。"
            )},
        },
    },
    microtabs: {
        stuff: {
            "Upgrades": {
                content: [
                    ["display-text", function() { return L("Force & Strain upgrades — paid in Strain.", "力与应变升级——以应变支付。") }],
                    ["blank", "10px"],
                    "upgrades",
                ],
            },
            "Stress Shop": {
                content: [
                    ["display-text", function() {
                        return "<h3 style='color:#ff8a65'>" + format(player.st.stress) + " " + L("Stress", "应力") + "</h3>"
                    }],
                    ["display-text", function() {
                        return L("Cap raises owned: " + countCapRaises() + " — compressed to ^" + metaCompExp().toFixed(2) + " by Recursion (eased by nc).", "已拥有的上限抬升：" + countCapRaises() + " —— 被「回套」压缩至 ^" + metaCompExp().toFixed(2) + "。")
                    }],
                    ["blank", "10px"],
                    "upgrades",
                    ["blank", "10px"],
                    "buyables",
                ],
            },
            "Resonance": {
                content: [
                    "buyables",
                ],
            },
            "Milestones": {
                content: ["milestones"],
            },
        },
    },

    upgrades: {
        11: {
            title() { return L("First Strain", "第一缕应变") },
            description() { return L("Double Force gain.", "力获取 ×2。") },
            cost: new Decimal(1),
        },
        12: {
            title() { return L("Unspent Reservoir", "未支出储备") },
            description() { return L("Force gain is boosted by your unspent Strain (softcapped).", "力获取受未支出应变加成（软上限）。") },
            cost: new Decimal(5),
            unlocked() { return hasUpgrade(this.layer, 11) },
            effect() {
                var e = player.st.points.add(1).pow(0.5)
                if (e.gte(1e6)) e = e.sqrt().times(1e3)
                return e
            },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        13: {
            title() { return L("Push the Ceiling", "推高天花板") },
            description() { return L("Force wall cap ×5. (A cap raise — compressed by Recursion.)", "力之墙上限 ×5。（上限抬升——会被回套压缩。）") },
            cost: new Decimal(5e4),
            currencyDisplayName() { return L("Stress", "应力") },
            currencyInternalName: "stress",
            currencyLayer: "st",
            unlocked() { return player.st.stress.gte(1000) },
        },
        14: {
            title() { return L("Wider Ceiling", "更宽的天花板") },
            description() { return L("Force wall cap ×5 again.", "力之墙上限再 ×5。") },
            cost: new Decimal(3e6),
            currencyDisplayName() { return L("Stress", "应力") },
            currencyInternalName: "stress",
            currencyLayer: "st",
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        15: {
            title() { return L("Squeeze the Wall", "挤压墙") },
            description() { return L("Stress gain ×2.", "应力获取 ×2。") },
            cost: new Decimal(1e8),
            currencyDisplayName() { return L("Stress", "应力") },
            currencyInternalName: "stress",
            currencyLayer: "st",
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        16: {
            title() { return L("Overpressure", "超压") },
            description() { return L("Force rate ^1.05 (softcapped).", "力速率 ^1.05（软上限）。") },
            cost: new Decimal(1e9),
            currencyDisplayName() { return L("Stress", "应力") },
            currencyInternalName: "stress",
            currencyLayer: "st",
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
        17: {
            title() { return L("Persistent Strain", "持久的应变") },
            description() { return L("Stress gain ×2.", "应力获取 ×2。") },
            cost: new Decimal(1e11),
            currencyDisplayName() { return L("Stress", "应力") },
            currencyInternalName: "stress",
            currencyLayer: "st",
            unlocked() { return hasUpgrade(this.layer, 16) },
        },
        21: {
            title() { return L("Stress Hardening I", "应力硬化 I") },
            description() { return L("Force gain ×3.", "力获取 ×3。") },
            cost: new Decimal(1e13),
            currencyDisplayName() { return L("Stress", "应力") },
            currencyInternalName: "stress",
            currencyLayer: "st",
            unlocked() { return hasUpgrade(this.layer, 17) },
        },
        22: {
            title() { return L("The Wall Pays", "墙即工资") },
            description() { return L("Force gain is boosted by your Stress (log-shaped).", "力获取受应力加成（对数形）。") },
            cost: new Decimal(1e14),
            currencyDisplayName() { return L("Stress", "应力") },
            currencyInternalName: "stress",
            currencyLayer: "st",
            unlocked() { return hasUpgrade(this.layer, 21) },
            effect() {
                var e = player.st.stress.add(1).log10().add(1).pow(2)
                return e
            },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        23: {
            title() { return L("Structural Raise", "结构抬升") },
            description() { return L("Force wall cap ×10.", "力之墙上限 ×10。") },
            cost: new Decimal(1e15),
            currencyDisplayName() { return L("Stress", "应力") },
            currencyInternalName: "stress",
            currencyLayer: "st",
            unlocked() { return hasUpgrade(this.layer, 22) },
        },
        24: {
            title() { return L("Give a Little", "退让一步") },
            description() { return L("The wall suppresses slightly less (suppression exponent −0.03).", "墙的压制变轻（压制指数 −0.03）。") },
            cost: new Decimal(1e16),
            currencyDisplayName() { return L("Stress", "应力") },
            currencyInternalName: "stress",
            currencyLayer: "st",
            unlocked() { return hasUpgrade(this.layer, 23) },
        },
        25: {
            title() { return L("Learned Instinct", "习得的本能") },
            description() { return L("Strain gain ×10.", "应变获取 ×10。") },
            cost: new Decimal(7), // deliberate cheap key drop mid-ladder (11 §3.2)
            currencyDisplayName() { return L("Stress", "应力") },
            currencyInternalName: "stress",
            currencyLayer: "st",
            unlocked() { return hasUpgrade(this.layer, 24) },
        },
    },

    buyables: {
        11: {
            title() { return L("Resonance", "共振") },
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.2, x) },
            display() {
                return L(
                    "Threshold gain ×" + format(buyableEffect("st", 11)) + ".<br>Level: " + formatWhole(getBuyableAmount("st", 11)) +
                    "<br>Cost: " + format(this.cost(getBuyableAmount("st", 11))) + " Strain",
                    "阈值获取 ×" + format(buyableEffect("st", 11)) + "。<br>等级：" + formatWhole(getBuyableAmount("st", 11)) +
                    "<br>价格：" + format(this.cost(getBuyableAmount("st", 11))) + " 应变"
                )
            },
            canAfford() { return player.st.points.gte(tmp.st.buyables[11].cost) },
            buy() {
                var c = tmp.st.buyables[11].cost
                player.st.points = player.st.points.sub(c)
                setBuyableAmount("st", 11, getBuyableAmount("st", 11).add(1))
            },
            buyMax() {
                // exact cumulative inverse of 10 × 3^x (P54): reaching level x from A
                // costs 5×(3^x − 3^A), affordable iff 3^x ≤ p/5 + 3^A — the autoBuyable
                // driver (tw m1). The old form paid only the top step and skipped levels.
                var A = getBuyableAmount("st", 11)
                var x = player.st.points.div(5).add(Decimal.pow(3, A)).log(3).floor()
                x = x.max(A)
                var c = new Decimal(5).times(Decimal.pow(3, x).sub(Decimal.pow(3, A)))
                if (x.gt(A) && player.st.points.gte(c)) {
                    player.st.points = player.st.points.sub(c)
                    setBuyableAmount("st", 11, x)
                }
            },
        },
        12: {
            title() { return L("Cap Anchor", "锚帽") },
            cost(x) { return new Decimal(100).times(Decimal.pow(4, x)) },
            effect(x) { return Decimal.pow(1.15, x) },
            display() {
                return L(
                    "Force wall cap ×" + format(buyableEffect("st", 12)) + ".<br>Level: " + formatWhole(getBuyableAmount("st", 12)) +
                    "<br>Cost: " + format(this.cost(getBuyableAmount("st", 12))) + " Stress",
                    "力之墙上限 ×" + format(buyableEffect("st", 12)) + "。<br>等级：" + formatWhole(getBuyableAmount("st", 12)) +
                    "<br>价格：" + format(this.cost(getBuyableAmount("st", 12))) + " 应力"
                )
            },
            canAfford() { return player.st.stress.gte(tmp.st.buyables[12].cost) },
            buy() {
                var c = tmp.st.buyables[12].cost
                player.st.stress = player.st.stress.sub(c)
                setBuyableAmount("st", 12, getBuyableAmount("st", 12).add(1))
            },
        },
    },

    milestones: {
        0: {
            requirementDescription() { return L("1,000 Strain", "1,000 应变") },
            effectDescription() { return L("Force gain ×3.", "力获取 ×3。") },
            done() { return player[this.layer].best.gte(1e3) },
        },
        1: {
            requirementDescription() { return L("10,000 Strain", "10,000 应变") },
            effectDescription() { return L("Stress gain ×2.", "应力获取 ×2。") },
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player[this.layer].best.gte(1e4) },
        },
        2: {
            requirementDescription() { return L("1e6 Strain", "1e6 应变") },
            effectDescription() { return L("Force gain ×5.", "力获取 ×5。") },
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return player[this.layer].best.gte(1e6) },
        },
        3: {
            requirementDescription() { return L("1e8 Strain", "1e8 应变") },
            effectDescription() { return L("Stress gain ×3.", "应力获取 ×3。") },
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return player[this.layer].best.gte(1e8) },
        },
        4: {
            requirementDescription() { return L("1e11 Strain", "1e11 应变") },
            effectDescription() { return L("Stress gain ×5.", "应力获取 ×5。") },
            unlocked() { return hasMilestone(this.layer, 3) },
            done() { return player[this.layer].best.gte(1e11) },
        },
    },
})
