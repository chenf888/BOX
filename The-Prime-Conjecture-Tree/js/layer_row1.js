// ============================================================
// ROW 1 — pi (Prime Counting π) / fac (Factorization Ω) /
//         gap (Prime Gaps …) / lem (Lemma Library λ)
// All four: normal, exp 1/3, based on primes. Each boosts ≥2
// older targets (numbers via mod.js, primes via s.gainMult).
// ============================================================

// ------------------------------------------------------------
// pi — Prime Counting π(x)
// ------------------------------------------------------------
addLayer("pi", {
    name: "Prime Counting",
    symbol: "π",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#b388ff",
    resource() { return L("计数", "counts") },
    row: 1,
    position: 0,
    branches: ["s"],

    baseResource: "primes",
    baseAmount() { return player.s.points },
    requires: new Decimal(250),
    type: "normal",
    exponent: 1 / 3,

    softcap() {
        let cap = new Decimal(TUNING.piSoftcapStart)
        if (hasUpgrade("pi", 22)) cap = cap.times(10)
        if (hasUpgrade("pi", 33)) cap = cap.times(100)
        return cap
    },
    softcapPower() { return new Decimal(TUNING.piSoftcapPower) },

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pi", 12)) m = m.times(2)
        if (hasUpgrade("pi", 14)) m = m.times(upgradeEffect("pi", 14))   // K2 self-shape
        if (hasUpgrade("pi", 21)) m = m.times(upgradeEffect("pi", 21))   // K3 factors
        if (hasUpgrade("pi", 24)) m = m.times(upgradeEffect("pi", 24))   // K3 gaps
        if (hasUpgrade("pi", 31)) m = m.times(3)
        if (hasUpgrade("pi", 32)) m = m.times(upgradeEffect("pi", 32))   // K3 wilson quotients
        if (hasUpgrade("pi", 34)) m = m.times(upgradeEffect("pi", 34))   // K3 wisdom
        if (hasUpgrade("pi", 23) && player.pi.best.gte(1e5)) m = m.times(2) // K6
        if (hasUpgrade("pi", 25)) m = m.pow(1.05)                        // K4 named: the π formula
        if (hasUpgrade("gap", 33)) m = m.times(2)                        // Zhang's window (counts side)
        if (hasMilestone("pi", 1)) m = m.times(2)
        if (hasMilestone("pi", 3)) m = m.times(3)
        if (hasMilestone("pi", 6)) m = m.times(5)
        m = m.times(buyableEffect("pi", 11))
        // later layers keep counting alive (P10)
        if (hasUpgrade("fac", 21)) m = m.times(upgradeEffect("fac", 21))
        if (hasUpgrade("gap", 23)) m = m.times(upgradeEffect("gap", 23))
        if (hasUpgrade("pnt", 13)) m = m.times(2)
        if (hasUpgrade("wil", 22)) m = m.times(2)
        if (hasMilestone("wil", 2)) m = m.times(2)
        if (hasMilestone("prob", 0)) m = m.times(1.5)
        if (hasUpgrade("prob", 15)) m = m.times(2)
        if (hasUpgrade("prob", 33)) m = m.times(3)
        if (hasUpgrade("prob", 44)) m = m.times(2)
        if (hasMilestone("zeta", 4)) m = m.times(5)
        // cross-layer consumer of s.b11 (N-BUYABLEDEAD): the sieve range feeds counting
        m = m.times(buyableEffect("s", 11).pow(0.5))
        // M2 trial 12 handicap: Blind Counting
        if (inChallenge("prob", 12)) m = m.pow(0.7)
        return m
    },
    gainExp() { return new Decimal(1) },

    hotkeys: [
        { key: "p", description: L("P: 重置素数为计数", "P: Reset primes for counts"),
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    // automation ladder: oracle.m1 trickle; zeta.m1 package (P4: autoPrestige ⇒ resetsNothing)
    resetsNothing() { return hasMilestone("zeta", 1) },
    passiveGeneration() { return hasMilestone("oracle", 1) ? 1 : 0 },
    autoPrestige() { return hasMilestone("zeta", 1) },
    autoUpgrade() { return hasMilestone("zeta", 1) },

    milestones: {
        0: { requirementDescription: L("拥有 500 计数（最高）", "Reach 500 counts (best)"),
             effectDescription() { return L("筛分不再清空你的数", "Sieving no longer wipes your numbers") },
             done() { return player.pi.best.gte(500) } },
        1: { requirementDescription: L("拥有 1,000 计数", "Reach 1,000 counts"),
             effectDescription() { return L("计数获取 ×2", "Count gain ×2") },
             unlocked() { return hasMilestone("pi", 0) },
             done() { return player.pi.best.gte(1000) } },
        2: { requirementDescription: L("拥有 4,000 计数", "Reach 4,000 counts"),
             effectDescription() { return L("素数随时间滴流（passive generation）", "Primes trickle in over time") },
             unlocked() { return hasMilestone("pi", 1) },
             done() { return player.pi.best.gte(4000) } },
        3: { requirementDescription: L("拥有 20,000 计数", "Reach 20,000 counts"),
             effectDescription() { return L("计数获取 ×3", "Count gain ×3") },
             unlocked() { return hasMilestone("pi", 2) },
             done() { return player.pi.best.gte(2e4) } },
        4: { requirementDescription: L("拥有 1e5 计数", "Reach 1e5 counts"),
             effectDescription() { return L("解锁 π 的第三排升级", "Unlock π's third upgrade row") },
             unlocked() { return hasMilestone("pi", 3) },
             done() { return player.pi.best.gte(1e5) } },
        5: { requirementDescription: L("拥有 1e6 计数", "Reach 1e6 counts"),
             effectDescription() { return L("素数获取 ×2", "Prime gain ×2") },
             unlocked() { return hasMilestone("pi", 4) },
             done() { return player.pi.best.gte(1e6) } },
        6: { requirementDescription: L("拥有 1e7 计数", "Reach 1e7 counts"),
             effectDescription() { return L("计数获取 ×5", "Count gain ×5") },
             unlocked() { return hasMilestone("pi", 5) },
             done() { return player.pi.best.gte(1e7) } },
        7: { requirementDescription: L("拥有 1e8 计数", "Reach 1e8 counts"),
             effectDescription() { return L("行 2+ 重置保留 π 的升级与里程碑", "Row-2+ resets keep π upgrades & milestones") },
             unlocked() { return hasMilestone("pi", 6) },
             done() { return player.pi.best.gte(1e8) } },
    },

    buyables: {
        11: {
            title() { return L("计数加速器", "Counting accelerator") },
            cost(x) { return new Decimal(100).times(Decimal.pow(2.5, x)) },
            effect(x) { return Decimal.pow(1.2, x) },        // ln(1.2)/ln(2.5) = 0.24 « 1
            display() {
                return L("计数获取 ×", "Count gain ×") + format(buyableEffect(this.layer, this.id)) +
                    L("<br>已购: ", "<br>Bought: ") + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    L("<br>价格: ", "<br>Cost: ") + format(tmp[this.layer].buyables[this.id].cost) + " " + L("计数", "counts")
            },
            canAfford() { return player.pi.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player.pi.points = player.pi.points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = ["unlocked", "best", "total"]
            if (hasMilestone("pi", 7)) { keep.push("upgrades"); keep.push("milestones") }
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return true },

    tabFormat: [
        ["display-text", function() {
            return L("你有 ", "You have ") + "<h2 style='color:#b388ff;display:inline'>" + format(player.pi.points) + "</h2> " + L("计数", "counts")
                + L("（最高 ", " (best ") + formatWhole(player.pi.best) + "）"
        }],
        "prestige-button",
        ["display-text", function() {
            if (player.pi.points.gte(new Decimal(TUNING.piSoftcapStart).div(2)))
                return L("<span style='opacity:.7'>软帽始于 </span>", "<span style='opacity:.7'>Softcap starts at </span>") + format(tmp.pi.softcap) + L(" 计数", " counts")
        }],
        ["blank", "8px"],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": { content: [["raw-html", function() { return "<div style='opacity:.5'>" + L("π(x) ≈ x / ln x —— 数素数是一门手艺。", "π(x) ≈ x / ln x — counting primes is a craft.") + "</div>" }], "blank", "upgrades"] },
            "Buyables": { unlocked() { return getBuyableAmount("pi", 11).gt(0) || hasUpgrade("pi", 15) }, content: ["buyables"] },
            "Milestones": { content: ["blank", "milestones"] },
            "Records": {
                unlocked() { return hasUpgrade("pi", 35) },
                content: [
                    ["display-text", function() { return L("历史最高计数：", "Best counts: ") + formatWhole(player.pi.best) }],
                    ["display-text", function() { return L("累计计数：", "Total counts: ") + formatWhole(player.pi.total) }],
                    ["display-text", function() { return L("当前计数/秒：", "Counts/sec: ") + format(tmp.pi.resetGain) }],
                ],
            },
        },
    },

    // 12 upgrades, cost ladder 1 → 1e12 with a key drop at u22 (300)
    upgrades: {
        11: {
            title() { return L("逐条清点", "Count them one by one") },
            description() { return L("数的获取 ×2。", "Number gain ×2.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return L("清点表", "The tally table") },
            description() { return L("计数获取 ×2。", "Count gain ×2.") },
            cost: new Decimal(3),
            unlocked() { return hasUpgrade("pi", 11) },
        },
        13: {
            title() { return L("反馈筛子", "Feed the sieve") },
            description() { return L("素数获取 ×2。", "Prime gain ×2.") },
            cost: new Decimal(10),
            unlocked() { return hasUpgrade("pi", 12) },
        },
        14: {
            title() { return L("对数积分", "The logarithmic integral") },
            description() { return L("计数获取按未动用的计数加成。", "Count gain is boosted by your unspent counts.") },
            cost: new Decimal(40),
            unlocked() { return hasUpgrade("pi", 13) },
            effect() { return player.pi.points.add(1).pow(0.4) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        15: {
            title() { return L("计数加速器图纸", "Accelerator blueprints") },
            description() { return L("解锁 buyable：计数加速器。", "Unlock the Counting accelerator buyable.") },
            cost: new Decimal(1e3),
            unlocked() { return hasUpgrade("pi", 14) },
        },
        21: {
            title() { return L("分解校对", "Factor cross-check") },
            description() { return L("计数获取按因式分解层数量加成。", "Count gain is boosted by your factors.") },
            cost: new Decimal(1e4),
            unlocked() { return hasUpgrade("pi", 15) },
            effect() { return player.fac.points.max(1).log10().add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        22: {
            title() { return L("更大的计数册", "A bigger ledger") },
            description() { return L("计数软帽起点 ×10。", "Count softcap starts ×10 later.") },
            cost: new Decimal(300),
            unlocked() { return hasUpgrade("pi", 21) },
        },
        23: {
            title() { return L("十万庆典", "The 1e5 celebration") },
            description() { return L("历史最高计数 ≥ 1e5 时计数获取 ×2。", "While best counts ≥ 1e5, count gain ×2.") },
            cost: new Decimal(1e5),
            unlocked() { return hasUpgrade("pi", 22) },
        },
        24: {
            title() { return L("间隔修正", "The gap correction") },
            description() { return L("计数获取按素数间隔层数量加成。", "Count gain is boosted by your gaps.") },
            cost: new Decimal(1e6),
            unlocked() { return hasUpgrade("pi", 23) },
            effect() { return player.gap.points.max(1).log10().add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        25: {
            title() { return L("黎曼 R 函数", "The Riemann R function") },
            description() { return L("计数公式强化：^1.05。", "The π formula grows stronger: ^1.05.") },
            cost: new Decimal(1e7),
            unlocked() { return hasUpgrade("pi", 24) },
        },
        31: {
            title() { return L("手工清点到机器", "From hand tally to machine") },
            description() { return L("计数获取 ×3。", "Count gain ×3.") },
            cost: new Decimal(1e9),
            unlocked() { return hasMilestone("pi", 4) },
        },
        32: {
            title() { return L("威尔逊余项", "The Wilson remainder") },
            description() { return L("计数获取按威尔逊商加成。", "Count gain is boosted by Wilson quotients.") },
            cost: new Decimal(1e10),
            unlocked() { return hasUpgrade("pi", 31) },
            effect() { return player.wil.points.max(1).log10().add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        33: {
            title() { return L("黎曼显式公式", "The explicit formula") },
            description() { return L("计数软帽起点再 ×100。", "Count softcap starts ×100 later (on top of u22).") },
            cost: new Decimal(1e11),
            unlocked() { return hasUpgrade("pi", 32) },
        },
        34: {
            title() { return L("先贤的注解", "The masters' annotations") },
            description() { return L("计数获取按智慧加成。", "Count gain is boosted by your wisdom.") },
            cost: new Decimal(1e12),
            unlocked() { return hasUpgrade("pi", 33) },
            effect() { return player.oracle.points.max(1).log10().add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        35: {
            title() { return L("记录页", "The records page") },
            description() { return L("解锁「记录」页签（本层统计）。", "Unlock the Records microtab.") },
            cost: new Decimal(1e13),
            unlocked() { return hasUpgrade("pi", 34) },
        },
    },
})

// ------------------------------------------------------------
// fac — Factorization (算术基本定理), with the Ω secondary currency (M5)
// ------------------------------------------------------------
addLayer("fac", {
    name: "Factorization",
    symbol: "Ω",
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        omega: new Decimal(0),        // M5 secondary currency — never "points"
    }},
    color: "#ffb36b",
    resource() { return L("因数", "factors") },
    row: 1,
    position: 1,
    branches: ["s"],

    baseResource: "primes",
    baseAmount() { return player.s.points },
    requires: new Decimal(400),
    type: "normal",
    exponent: 1 / 3,

    softcap() {
        let cap = new Decimal(TUNING.facSoftcapStart)
        if (hasUpgrade("fac", 23)) cap = cap.times(10)
        return cap
    },
    softcapPower() { return new Decimal(TUNING.facSoftcapPower) },

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("fac", 12)) m = m.times(2)
        if (hasUpgrade("fac", 14)) m = m.times(upgradeEffect("fac", 14))   // K2 self-shape
        if (hasUpgrade("fac", 22)) m = m.times(3)
        if (hasUpgrade("fac", 32)) m = m.times(upgradeEffect("fac", 32))   // K3 gaps
        if (hasUpgrade("fac", 33) && player.fac.best.gte(1e6)) m = m.times(2) // K6
        if (hasUpgrade("gap", 33)) m = m.times(2)                        // Zhang's window (factors side)
        if (hasMilestone("fac", 3)) m = m.times(3)
        if (hasMilestone("fac", 5)) m = m.times(5)
        m = m.times(buyableEffect("fac", 11))
        // later layers (P10)
        if (hasUpgrade("gap", 22)) m = m.times(upgradeEffect("gap", 22))
        if (hasUpgrade("wil", 13)) m = m.times(2)
        if (hasMilestone("wil", 1)) m = m.times(2)
        if (hasUpgrade("pnt", 22)) m = m.times(2)
        if (hasUpgrade("prob", 22)) m = m.times(2)
        if (hasUpgrade("prob", 42)) m = m.times(3)
        if (hasUpgrade("prob", 54)) m = m.times(5)
        if (hasUpgrade("pairs", 13)) m = m.times(3)
        if (hasMilestone("zeta", 4)) m = m.times(5)
        // M2 trial 22 handicap: Slow Factorial
        if (inChallenge("prob", 22)) m = m.pow(0.7)
        return m
    },
    gainExp() { return new Decimal(1) },

    // M5 — Ω accrues from factor mass; update() NEVER touches points (N-POINTSWRITE)
    update(diff) {
        if (!player[this.layer].unlocked) return   // F28 guard
        let rate = player.fac.points.max(1).log10().times(TUNING.omegaRate())
        if (hasUpgrade("fac", 24)) rate = rate.pow(1.1)   // K4: the Ω formula (named mechanic)
        player.fac.omega = player.fac.omega.add(rate.times(diff))
        if (hasUpgrade("fac", 35)) addPoints("s", rate.times(diff).times(0.1))   // K8 production
    },

    hotkeys: [
        { key: "f", description: L("F: 重置素数为因数", "F: Reset primes for factors"),
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    // automation ladder: oracle.m1 trickle; zeta.m2 package
    resetsNothing() { return hasMilestone("zeta", 2) },
    passiveGeneration() { return hasMilestone("oracle", 1) ? 1 : 0 },
    autoPrestige() { return hasMilestone("zeta", 2) },
    autoUpgrade() { return hasMilestone("zeta", 2) },

    milestones: {
        0: { requirementDescription: L("拥有 1,000 因数（最高）", "Reach 1,000 factors (best)"),
             effectDescription() { return L("Ω 产出 ×2", "Ω production ×2") },
             done() { return player.fac.best.gte(1000) } },
        1: { requirementDescription: L("拥有 8,000 因数", "Reach 8,000 factors"),
             effectDescription() { return L("自动筛分（auto-prestige 素数层）", "Auto-sieve (auto-prestige the Sieve)") },
             unlocked() { return hasMilestone("fac", 0) },
             done() { return player.fac.best.gte(8000) } },
        2: { requirementDescription: L("拥有 2e4 因数", "Reach 2e4 factors"),
             effectDescription() { return L("Ω 产出 ×2", "Ω production ×2") },
             unlocked() { return hasMilestone("fac", 1) },
             done() { return player.fac.best.gte(2e4) } },
        3: { requirementDescription: L("拥有 1e5 因数", "Reach 1e5 factors"),
             effectDescription() { return L("因数获取 ×3", "Factor gain ×3") },
             unlocked() { return hasMilestone("fac", 2) },
             done() { return player.fac.best.gte(1e5) } },
        4: { requirementDescription: L("拥有 1e6 因数", "Reach 1e6 factors"),
             effectDescription() { return L("解锁第二个 Ω 商店", "Unlock the second Ω shop") },
             unlocked() { return hasMilestone("fac", 3) },
             done() { return player.fac.best.gte(1e6) } },
        5: { requirementDescription: L("拥有 1e7 因数", "Reach 1e7 factors"),
             effectDescription() { return L("因数获取 ×5", "Factor gain ×5") },
             unlocked() { return hasMilestone("fac", 4) },
             done() { return player.fac.best.gte(1e7) } },
        6: { requirementDescription: L("拥有 1e8 因数", "Reach 1e8 factors"),
             effectDescription() { return L("行 2+ 重置保留因式分解层", "Row-2+ resets keep this layer's progress") },
             unlocked() { return hasMilestone("fac", 5) },
             done() { return player.fac.best.gte(1e8) } },
        7: { requirementDescription: L("拥有 1e9 因数", "Reach 1e9 factors"),
             effectDescription() { return L("Ω 产出 ×3", "Ω production ×3") },
             unlocked() { return hasMilestone("fac", 6) },
             done() { return player.fac.best.gte(1e9) } },
    },

    buyables: {
        11: {
            title() { return L("Ω：素性指针", "Ω: primality pointers") },
            cost(x) {
                let c = new Decimal(5).times(Decimal.pow(2, x))
                if (hasUpgrade("lem", 14)) c = c.times(0.8)
                return c
            },
            effect(x) { return Decimal.pow(1.25, x) },       // ln(1.25)/ln(2) = 0.32 « 1
            display() {
                return L("因数获取 ×", "Factor gain ×") + format(buyableEffect(this.layer, this.id)) +
                    L("<br>已购: ", "<br>Bought: ") + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    L("<br>价格: ", "<br>Cost: ") + format(tmp[this.layer].buyables[this.id].cost) + " Ω"
            },
            canAfford() { return player.fac.omega.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player.fac.omega = player.fac.omega.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            unlocked() { return hasMilestone("fac", 4) },
            title() { return L("Ω：整环回响", "Ω: integral domain echo") },
            cost(x) { return new Decimal(50).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.2, x) },
            display() {
                return L("素数获取 ×", "Prime gain ×") + format(buyableEffect(this.layer, this.id)) +
                    L("<br>已购: ", "<br>Bought: ") + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    L("<br>价格: ", "<br>Cost: ") + format(tmp[this.layer].buyables[this.id].cost) + " Ω"
            },
            canAfford() { return player.fac.omega.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player.fac.omega = player.fac.omega.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = ["unlocked", "best", "total", "omega"]
            if (hasMilestone("fac", 6)) { keep.push("upgrades"); keep.push("milestones") }
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return true },

    tabFormat: [
        ["display-text", function() {
            return L("你有 ", "You have ") + "<h2 style='color:#ffb36b;display:inline'>" + format(player.fac.points) + "</h2> " + L("因数", "factors")
                + L("（最高 ", " (best ") + formatWhole(player.fac.best) + "）"
                + L("　·　Ω 素因数指数和：", "　·　Ω exponent mass: ") + "<b style='color:#ffb36b'>" + format(player.fac.omega) + "</b>"
        }],
        "prestige-button",
        ["display-text", function() {
            if (player.fac.points.gte(new Decimal(TUNING.facSoftcapStart).div(2)))
                return L("<span style='opacity:.7'>软帽始于 </span>", "<span style='opacity:.7'>Softcap starts at </span>") + format(tmp.fac.softcap) + L(" 因数", " factors")
        }],
        ["blank", "8px"],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": { content: [["raw-html", function() { return "<div style='opacity:.5'>" + L("每个数 > 1 都能唯一分解成素数之积。", "Every integer > 1 factors uniquely into primes.") + "</div>" }], "blank", "upgrades"] },
            "Ω Shop": { unlocked() { return getBuyableAmount("fac", 11).gt(0) || hasUpgrade("fac", 25) }, content: [["display-text", function() { return L("Ω：", "Ω: ") + "<b style='color:#ffb36b'>" + format(player.fac.omega) + "</b>" }], "buyables"] },
            "Milestones": { content: ["blank", "milestones"] },
        },
    },

    upgrades: {
        11: {
            title() { return L("唯一分解", "Unique factorization") },
            description() { return L("数的获取 ×2。", "Number gain ×2.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return L("分解清单", "The factor list") },
            description() { return L("因数获取 ×2。", "Factor gain ×2.") },
            cost: new Decimal(3),
            unlocked() { return hasUpgrade("fac", 11) },
        },
        13: {
            title() { return L("素数牧场", "Prime pasture") },
            description() { return L("素数获取 ×2。", "Prime gain ×2.") },
            cost: new Decimal(10),
            unlocked() { return hasUpgrade("fac", 12) },
        },
        14: {
            title() { return L("重数之力", "The power of multiplicity") },
            description() { return L("因数获取按未动用的因数加成。", "Factor gain is boosted by your unspent factors.") },
            cost: new Decimal(40),
            unlocked() { return hasUpgrade("fac", 13) },
            effect() { return player.fac.points.add(1).pow(0.4) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        15: {
            title() { return L("称量 Ω", "Weighing Ω") },
            description() { return L("解锁 Ω 素因数指数和的产出与商店。", "Unlock Ω production and its shop.") },
            cost: new Decimal(1e3),
            unlocked() { return hasUpgrade("fac", 14) },
        },
        21: {
            title() { return L("计数校对", "Count cross-check") },
            description() { return L("因数获取按计数加成。", "Factor gain is boosted by your counts.") },
            cost: new Decimal(1e4),
            unlocked() { return hasUpgrade("fac", 15) },
            effect() { return player.pi.points.max(1).log10().add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        22: {
            title() { return L("平方自由筛", "The squarefree screen") },
            description() { return L("因数获取 ×3。", "Factor gain ×3.") },
            cost: new Decimal(1e5),
            unlocked() { return hasUpgrade("fac", 21) },
        },
        23: {
            title() { return L("更大的分解台", "A bigger factoring bench") },
            description() { return L("因数软帽起点 ×10。", "Factor softcap starts ×10 later.") },
            cost: new Decimal(300),
            unlocked() { return hasUpgrade("fac", 22) },
        },
        24: {
            title() { return L("Ω 精炼", "Ω refinement") },
            description() { return L("Ω 产出公式强化：^1.1。", "The Ω production formula grows stronger: ^1.1.") },
            cost: new Decimal(1e6),
            unlocked() { return hasUpgrade("fac", 23) },
        },
        25: {
            title() { return L("打开 Ω 商店", "Open the Ω shop") },
            description() { return L("解锁 Ω 商店页签（永久）。", "Unlock the Ω shop microtab (forever).") },
            cost: new Decimal(1e7),
            unlocked() { return hasUpgrade("fac", 24) },
        },
        31: {
            title() { return L("椭圆曲线分解", "ECM") },
            description() { return L("因数获取 ×5。", "Factor gain ×5.") },
            cost: new Decimal(1e9),
            unlocked() { return hasMilestone("fac", 4) },
        },
        32: {
            title() { return L("间隔采样", "Gap sampling") },
            description() { return L("因数获取按素数间隔层数量加成。", "Factor gain is boosted by your gaps.") },
            cost: new Decimal(1e10),
            unlocked() { return hasUpgrade("fac", 31) },
            effect() { return player.gap.points.max(1).log10().add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        33: {
            title() { return L("百万因数纪念", "The million-factor mark") },
            description() { return L("历史最高因数 ≥ 1e6 时因数获取 ×2。", "While best factors ≥ 1e6, factor gain ×2.") },
            cost: new Decimal(1e11),
            unlocked() { return hasUpgrade("fac", 32) },
        },
        34: {
            title() { return L("定理的碎片", "Fragments of theorems") },
            description() { return L("因数获取按威尔逊商加成。", "Factor gain is boosted by Wilson quotients.") },
            cost: new Decimal(1e12),
            unlocked() { return hasUpgrade("fac", 33) },
            effect() { return player.wil.points.max(1).log10().add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        35: {
            title() { return L("Ω 渗漏", "Ω seepage") },
            description() { return L("Ω 的 10% 化作素数随时间产出。", "10% of Ω production becomes primes over time.") },
            cost: new Decimal(1e13),
            unlocked() { return hasUpgrade("fac", 34) },
        },
    },
})

// ------------------------------------------------------------
// gap — Prime Gaps (素数间隔)
// ------------------------------------------------------------
addLayer("gap", {
    name: "Prime Gaps",
    symbol: "…",
    position: 2,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#8fffab",
    resource() { return L("间隔", "gaps") },
    row: 1,
    position: 2,
    branches: ["s"],

    baseResource: "primes",
    baseAmount() { return player.s.points },
    requires: new Decimal(700),
    type: "normal",
    exponent: 1 / 3,

    softcap() {
        let cap = new Decimal(TUNING.gapSoftcapStart)
        if (hasUpgrade("gap", 24)) cap = cap.times(10)
        if (hasUpgrade("gap", 34)) cap = cap.times(100)
        return cap
    },
    softcapPower() { return new Decimal(TUNING.gapSoftcapPower) },

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("gap", 12)) m = m.times(2)
        if (hasUpgrade("gap", 22)) m = m.times(upgradeEffect("gap", 22))   // K2 self-shape
        if (hasUpgrade("gap", 21)) m = m.times(3)
        if (hasUpgrade("gap", 31)) m = m.times(5)
        if (hasUpgrade("gap", 23) && player.gap.best.gte(1e5)) m = m.times(2) // K6
        if (hasMilestone("gap", 0)) m = m.times(2)
        if (hasMilestone("gap", 2)) m = m.times(3)
        if (hasMilestone("gap", 5)) m = m.times(5)
        m = m.times(buyableEffect("gap", 11))
        // later layers (P10)
        if (hasUpgrade("pnt", 15)) m = m.times(2)
        if (hasUpgrade("wil", 14)) m = m.times(2)
        if (hasUpgrade("prob", 25)) m = m.times(2)
        if (hasUpgrade("prob", 35)) m = m.times(3)
        if (hasUpgrade("pairs", 14)) m = m.times(3)
        if (hasMilestone("zeta", 4)) m = m.times(5)
        return m
    },
    gainExp() { return new Decimal(1) },

    hotkeys: [
        { key: "g", description: L("G: 重置素数为间隔", "G: Reset primes for gaps"),
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    // automation ladder: oracle.m2 package (P4: autoPrestige ⇒ resetsNothing, same milestone)
    resetsNothing() { return hasMilestone("oracle", 2) },
    passiveGeneration() { return hasMilestone("oracle", 2) ? 1 : 0 },
    autoPrestige() { return hasMilestone("oracle", 2) },

    milestones: {
        0: { requirementDescription: L("拥有 500 间隔（最高）", "Reach 500 gaps (best)"),
             effectDescription() { return L("间隔获取 ×2", "Gap gain ×2") },
             done() { return player.gap.best.gte(500) } },
        1: { requirementDescription: L("拥有 2,000 间隔", "Reach 2,000 gaps"),
             effectDescription() { return L("解锁 buyable：测隙尺", "Unlock the gap gauge buyable") },
             unlocked() { return hasMilestone("gap", 0) },
             done() { return player.gap.best.gte(2000) } },
        2: { requirementDescription: L("拥有 1e4 间隔", "Reach 1e4 gaps"),
             effectDescription() { return L("间隔获取 ×3", "Gap gain ×3") },
             unlocked() { return hasMilestone("gap", 1) },
             done() { return player.gap.best.gte(1e4) } },
        3: { requirementDescription: L("拥有 5e4 间隔", "Reach 5e4 gaps"),
             effectDescription() { return L("素的滴流加速（passive ×2）", "Prime trickle speeds up (passive ×2)") },
             unlocked() { return hasMilestone("gap", 2) },
             done() { return player.gap.best.gte(5e4) } },
        4: { requirementDescription: L("拥有 2.5e5 间隔", "Reach 2.5e5 gaps"),
             effectDescription() { return L("行 2+ 重置保留间隔层", "Row-2+ resets keep this layer") },
             unlocked() { return hasMilestone("gap", 3) },
             done() { return player.gap.best.gte(2.5e5) } },
        5: { requirementDescription: L("拥有 1e6 间隔", "Reach 1e6 gaps"),
             effectDescription() { return L("间隔获取 ×5", "Gap gain ×5") },
             unlocked() { return hasMilestone("gap", 4) },
             done() { return player.gap.best.gte(1e6) } },
    },

    buyables: {
        11: {
            unlocked() { return hasMilestone("gap", 1) },
            title() { return L("测隙尺", "The gap gauge") },
            cost(x) { return new Decimal(20).times(Decimal.pow(2, x)) },
            effect(x) { return Decimal.pow(1.2, x) },
            display() {
                return L("素数获取 ×", "Prime gain ×") + format(buyableEffect(this.layer, this.id)) +
                    L("<br>已购: ", "<br>Bought: ") + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    L("<br>价格: ", "<br>Cost: ") + format(tmp[this.layer].buyables[this.id].cost) + " " + L("间隔", "gaps")
            },
            canAfford() { return player.gap.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player.gap.points = player.gap.points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = ["unlocked", "best", "total"]
            if (hasMilestone("gap", 4)) { keep.push("upgrades"); keep.push("milestones") }
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return true },

    tabFormat: [
        ["display-text", function() {
            return L("你有 ", "You have ") + "<h2 style='color:#8fffab;display:inline'>" + format(player.gap.points) + "</h2> " + L("间隔", "gaps")
                + L("（最高 ", " (best ") + formatWhole(player.gap.best) + "）"
        }],
        "prestige-button",
        ["display-text", function() {
            if (player.gap.points.gte(new Decimal(TUNING.gapSoftcapStart).div(2)))
                return L("<span style='opacity:.7'>软帽始于 </span>", "<span style='opacity:.7'>Softcap starts at </span>") + format(tmp.gap.softcap) + L(" 间隔", " gaps")
        }],
        ["blank", "8px"],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": { content: [["raw-html", function() { return "<div style='opacity:.5'>" + L("孪生素数之间，隔着一个等待被证明的宇宙。", "Between twin primes lies an unproven universe.") + "</div>" }], "blank", "upgrades"] },
            "Buyables": { unlocked() { return getBuyableAmount("gap", 11).gt(0) }, content: ["buyables"] },
            "Milestones": { content: ["blank", "milestones"] },
        },
    },

    upgrades: {
        11: {
            title() { return L("小心间隔", "Mind the gap") },
            description() { return L("数的获取 ×2。", "Number gain ×2.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return L("测量记录", "The measured record") },
            description() { return L("间隔获取 ×2。", "Gap gain ×2.") },
            cost: new Decimal(3),
            unlocked() { return hasUpgrade("gap", 11) },
        },
        13: {
            title() { return L("间隔回填", "Gap backfill") },
            description() { return L("素数获取 ×2。", "Prime gain ×2.") },
            cost: new Decimal(10),
            unlocked() { return hasUpgrade("gap", 12) },
        },
        14: {
            title() { return L("历史最高", "The record book") },
            description() { return L("数的获取按历史最高间隔加成。", "Number gain is boosted by your best gaps.") },
            cost: new Decimal(40),
            unlocked() { return hasUpgrade("gap", 13) },
            effect() { return player.gap.best.max(1).log10().add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        15: {
            title() { return L("更远的视野", "Longer sight") },
            description() { return L("素数获取按间隔层 buyable 加成。", "Prime gain gains the gap gauge's bonus.") },
            cost: new Decimal(1e3),
            unlocked() { return hasUpgrade("gap", 14) },
        },
        21: {
            title() { return L("孪生猎手", "Twin hunter") },
            description() { return L("间隔获取 ×3。", "Gap gain ×3.") },
            cost: new Decimal(1e4),
            unlocked() { return hasUpgrade("gap", 15) },
        },
        22: {
            title() { return L("未占领之地", "The unclaimed territory") },
            description() { return L("间隔获取按未动用的间隔加成。", "Gap gain is boosted by your unspent gaps.") },
            cost: new Decimal(40),
            unlocked() { return hasUpgrade("gap", 21) },
            effect() { return player.gap.points.add(1).pow(0.4) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        23: {
            title() { return L("计数交叉", "Counting crossfire") },
            description() { return L("计数获取获得测隙尺的加成。", "Count gain gains the gap gauge's bonus.") },
            cost: new Decimal(1e5),
            unlocked() { return hasUpgrade("gap", 22) },
            effect() { return buyableEffect("gap", 11) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: {
            title() { return L("更宽的猎场", "A wider range") },
            description() { return L("间隔软帽起点 ×10。", "Gap softcap starts ×10 later.") },
            cost: new Decimal(300),
            unlocked() { return hasUpgrade("gap", 23) },
        },
        25: {
            title() { return L("间隔喂给 Ω", "Gaps feed Ω") },
            description() { return L("Ω 产出 ×1.5。", "Ω production ×1.5.") },
            cost: new Decimal(1e6),
            unlocked() { return hasUpgrade("gap", 24) },
        },
        31: {
            title() { return L("梅森搜索", "The Mersenne hunt") },
            description() { return L("间隔获取 ×5。", "Gap gain ×5.") },
            cost: new Decimal(1e7),
            unlocked() { return hasUpgrade("gap", 25) },
        },
        32: {
            title() { return L("十亿位记录", "The billion-digit record") },
            description() { return L("历史最高间隔 ≥ 1e5 时间隔获取 ×2。", "While best gaps ≥ 1e5, gap gain ×2.") },
            cost: new Decimal(1e8),
            unlocked() { return hasUpgrade("gap", 31) },
        },
        33: {
            title() { return L("张益唐之窗", "Zhang's window") },
            description() { return L("计数获取 ×2，因数获取 ×2。", "Count gain ×2 and factor gain ×2.") },
            cost: new Decimal(1e9),
            unlocked() { return hasUpgrade("gap", 32) },
        },
        34: {
            title() { return L("无限猎场", "The infinite range") },
            description() { return L("间隔软帽起点再 ×100。", "Gap softcap starts ×100 later.") },
            cost: new Decimal(1e10),
            unlocked() { return hasUpgrade("gap", 33) },
        },
        35: {
            title() { return L("间隔的远亲", "The gap's distant kin") },
            description() { return L("威尔逊商获取 ×2。", "Wilson quotient gain ×2.") },
            cost: new Decimal(1e11),
            unlocked() { return hasUpgrade("gap", 34) },
        },
    },
})

// ------------------------------------------------------------
// lem — Lemma Library (引理库, M8 shop: sells K4/K5 meta-effects)
// ------------------------------------------------------------
addLayer("lem", {
    name: "Lemma Library",
    symbol: "λ",
    position: 3,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#ffe08f",
    resource() { return L("引理", "lemmas") },
    row: 1,
    position: 3,
    branches: ["s"],

    baseResource: "primes",
    baseAmount() { return player.s.points },
    requires: new Decimal(1000),
    type: "normal",
    exponent: 1 / 3,

    gainMult() {
        let m = new Decimal(1)
        if (hasMilestone("lem", 0)) m = m.times(2)
        if (hasMilestone("lem", 3)) m = m.times(3)
        if (hasUpgrade("wil", 15)) m = m.times(2)
        if (hasUpgrade("pnt", 21)) m = m.times(upgradeEffect("pnt", 21))
        if (hasUpgrade("prob", 24)) m = m.times(2)
        if (hasUpgrade("prob", 55)) m = m.times(3)
        if (hasMilestone("zeta", 4)) m = m.times(5)
        return m
    },
    gainExp() { return new Decimal(1) },

    hotkeys: [
        { key: "l", description: L("L: 重置素数为引理", "L: Reset primes for lemmas"),
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    // automation ladder: oracle.m3 trickle; zeta.m3 auto-upgrade
    passiveGeneration() { return hasMilestone("oracle", 3) ? 1 : 0 },
    autoUpgrade() { return hasMilestone("zeta", 3) },

    milestones: {
        0: { requirementDescription: L("拥有 100 引理（最高）", "Reach 100 lemmas (best)"),
             effectDescription() { return L("引理获取 ×2", "Lemma gain ×2") },
             done() { return player.lem.best.gte(100) } },
        1: { requirementDescription: L("拥有 1,000 引理", "Reach 1,000 lemmas"),
             effectDescription() { return L("解锁第二排引理", "Unlock the second lemma row") },
             unlocked() { return hasMilestone("lem", 0) },
             done() { return player.lem.best.gte(1000) } },
        2: { requirementDescription: L("拥有 1e4 引理", "Reach 1e4 lemmas"),
             effectDescription() { return L("引理获取 ×2", "Lemma gain ×2") },
             unlocked() { return hasMilestone("lem", 1) },
             done() { return player.lem.best.gte(1e4) } },
        3: { requirementDescription: L("拥有 1e5 引理", "Reach 1e5 lemmas"),
             effectDescription() { return L("引理获取 ×3", "Lemma gain ×3") },
             unlocked() { return hasMilestone("lem", 2) },
             done() { return player.lem.best.gte(1e5) } },
        4: { requirementDescription: L("拥有 1e6 引理", "Reach 1e6 lemmas"),
             effectDescription() { return L("行 2+ 重置保留引理库", "Row-2+ resets keep the library") },
             unlocked() { return hasMilestone("lem", 3) },
             done() { return player.lem.best.gte(1e6) } },
    },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = ["unlocked", "best", "total"]
            if (hasMilestone("lem", 4)) { keep.push("upgrades"); keep.push("milestones") }
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return true },

    tabFormat: [
        ["display-text", function() {
            return L("你有 ", "You have ") + "<h2 style='color:#ffe08f;display:inline'>" + format(player.lem.points) + "</h2> " + L("引理", "lemmas")
                + L("（最高 ", " (best ") + formatWhole(player.lem.best) + "）"
        }],
        "prestige-button",
        ["blank", "8px"],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "Lemmas": { content: [["raw-html", function() { return "<div style='opacity:.5'>" + L("引理是证明的砖块——每一条都让某个公式变强。", "Lemmas are the bricks of proof — each one strengthens a named formula.") + "</div>" }], "blank", "upgrades"] },
            "Milestones": { content: ["blank", "milestones"] },
        },
    },

    // ALL K4/K5 — every one edits a NAMED formula or a visible cap. No self numbers.
    upgrades: {
        11: {
            title() { return L("引理：筛函数", "Lemma: the sieve function") },
            description() { return L("筛层公式强化：^1.05。", "The sieve formula grows stronger: ^1.05.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return L("引理：π 公式", "Lemma: the π formula") },
            description() { return L("π 层公式强化：^1.05。", "The π formula grows stronger: ^1.05.") },
            cost: new Decimal(5),
            unlocked() { return hasUpgrade("lem", 11) },
        },
        13: {
            title() { return L("引理：基础归纳", "Lemma: basic induction") },
            description() { return L("数的获取 ×3。", "Number gain ×3.") },
            cost: new Decimal(20),
            unlocked() { return hasUpgrade("lem", 12) },
        },
        14: {
            title() { return L("引理： cheaper Ω", "Lemma: cheaper Ω") },
            description() { return L("Ω 商店价格 ×0.8。", "Ω shop prices ×0.8.") },
            cost: new Decimal(100),
            unlocked() { return hasUpgrade("lem", 13) },
        },
        15: {
            title() { return L("引理： Ω 估计", "Lemma: Ω estimates") },
            description() { return L("Ω 产出 ×2。", "Ω production ×2.") },
            cost: new Decimal(500),
            unlocked() { return hasUpgrade("lem", 14) },
        },
        21: {
            title() { return L("引理：滤网动力学", "Lemma: filter dynamics") },
            description() { return L("滤网爆发产量 ×1.25。", "Filter bursts ×1.25.") },
            cost: new Decimal(1e3),
            unlocked() { return hasMilestone("lem", 1) },
        },
        22: {
            title() { return L("引理：间隔分布", "Lemma: gap distribution") },
            description() { return L("间隔层公式强化：^1.05。", "The gap formula grows stronger: ^1.05.") },
            cost: new Decimal(5e3),
            unlocked() { return hasUpgrade("lem", 21) },
        },
        23: {
            title() { return L("引理：威尔逊商化简", "Lemma: Wilson simplification") },
            description() { return L("威尔逊层的下一阶价格 ×0.9。", "Wilson's next-floor price ×0.9.") },
            cost: new Decimal(2e4),
            unlocked() { return hasUpgrade("lem", 22) },
        },
        24: {
            title() { return L("引理：哥德巴赫密度", "Lemma: Goldbach density") },
            description() { return L("素数对（拆分）获取 ×1.2。", "Split gain ×1.2.") },
            cost: new Decimal(1e5),
            unlocked() { return hasUpgrade("lem", 23) },
        },
        25: {
            title() { return L("引理：ζ 对称", "Lemma: ζ symmetry") },
            description() { return L("智慧公式强化：^1.05。", "The wisdom formula grows stronger: ^1.05.") },
            cost: new Decimal(5e5),
            unlocked() { return hasUpgrade("lem", 24) },
        },
        31: {
            title() { return L("引理：临界指数", "Lemma: the critical exponent") },
            description() { return L("素数软帽起点再 ×10（可见）。", "Prime softcap starts ×10 later (visible).") },
            cost: new Decimal(1e6),
            unlocked() { return hasMilestone("lem", 2) },
        },
        32: {
            title() { return L("引理：试炼记分法", "Lemma: trial scoring") },
            description() { return L("试炼得分 +50%。", "Trial scores +50%.") },
            cost: new Decimal(1e7),
            unlocked() { return hasUpgrade("lem", 31) },
        },
    },
})

// Ω rate helper — one home (read by fac.update, lemma effects display nothing directly)
TUNING.omegaRate = function() {
    let r = 1
    if (hasMilestone("fac", 0)) r *= 2
    if (hasMilestone("fac", 2)) r *= 2
    if (hasMilestone("fac", 7)) r *= 3
    if (hasUpgrade("lem", 15)) r *= 2
    if (hasUpgrade("gap", 25)) r *= 1.5
    if (hasUpgrade("fac", 24)) return new Decimal(r) // K4 exponent edit happens on the log-rate
    return new Decimal(r)
}
