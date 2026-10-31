// ============================================================
// ROW 2 — pnt (Prime Number Theorem ln, static base 2) /
//         wil (Wilson's Theorem n!, static base 3) /
//         prob (Open Problems ?, M2 score-attack trial hub)
// Static semantics: gainMult SMALLER = cheaper, directMult = more
// floors per prestige. Every static layer has canBuyMax() (§4.1-4).
// ============================================================

// ------------------------------------------------------------
// pnt — Prime Number Theorem (素数定理, 1896)
// ------------------------------------------------------------
addLayer("pnt", {
    name() { return L("素数定理", "Prime Number Theorem") },
    symbol: "ln",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#8fc7ff",
    resource() { return L("定理", "theorems") },
    row: 2,
    position: 0,
    branches: ["pi"],

    baseResource: "counts",
    baseAmount() { return player.pi.points },
    requires: new Decimal(1e4),
    type: "static",
    exponent: 1,
    base: 2,
    roundUpCost: true,

    // static: gainMult smaller = CHEAPER (cost reductions live here)
    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("lem", 23)) m = m.times(0.9)          // lemma: Wilson simplification
        if (hasUpgrade("pnt", 24)) m = m.times(0.85)         // own K5 cost reduce
        m = m.times(buyableEffect("pnt", 11))
        if (hasMilestone("oracle", 5)) m = m.times(0.8)      // Pantheon discount
        return m
    },
    gainExp() { return new Decimal(1) },
    directMult() {
        let m = new Decimal(1)
        if (hasMilestone("pnt", 3)) m = m.times(2)
        if (hasUpgrade("wil", 23) && player.pnt.best.gte(50)) m = m.times(2)   // K6
        return m
    },

    // §4.1-4 — canBuyMax is REQUIRED; unlocked by u14 (author #24: buy-max early)
    canBuyMax() { return hasUpgrade("pnt", 14) },

    hotkeys: [
        { key: "t", description() { return L("T: 证明素数定理", "T: prove for theorems") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    // static automation (12 §5-26): resetsNothing + autoPrestige, same milestone (P4 invariant)
    resetsNothing() { return hasMilestone("oracle", 4) },
    autoPrestige() { return hasMilestone("oracle", 4) },

    milestones: {
        0: { requirementDescription() { return L("证明 5 个定理（最高）", "Prove 5 theorems (best)") },
             effectDescription() { return L("数的获取 ×2", "Number gain ×2") },
             done() { return player.pnt.best.gte(5) } },
        1: { requirementDescription() { return L("证明 15 个定理", "Prove 15 theorems") },
             effectDescription() { return L("素数获取 ×2", "Prime gain ×2") },
             unlocked() { return hasMilestone("pnt", 0) },
             done() { return player.pnt.best.gte(15) } },
        2: { requirementDescription() { return L("证明 60 个定理", "Prove 60 theorems") },
             effectDescription() { return L("自动购买筛层升级", "Auto-buy sieve upgrades") },
             unlocked() { return hasMilestone("pnt", 1) },
             done() { return player.pnt.best.gte(60) } },
        3: { requirementDescription() { return L("证明 200 个定理", "Prove 200 theorems") },
             effectDescription() { return L("每次证明定理数 ×2", "Theorems per proof ×2") },
             unlocked() { return hasMilestone("pnt", 2) },
             done() { return player.pnt.best.gte(200) } },
        4: { requirementDescription() { return L("证明 400 个定理", "Prove 400 theorems") },
             effectDescription() { return L("自动买满「扩大筛程」", "Auto-buy-max the sieve range") },
             unlocked() { return hasMilestone("pnt", 3) },
             done() { return player.pnt.best.gte(400) } },
        5: { requirementDescription() { return L("证明 800 个定理", "Prove 800 theorems") },
             effectDescription() { return L("行 3+ 重置保留本层", "Row-3+ resets keep this layer") },
             unlocked() { return hasMilestone("pnt", 4) },
             done() { return player.pnt.best.gte(800) } },
    },

    buyables: {
        11: {
            unlocked() { return hasUpgrade("pnt", 25) },
            title() { return L("证明加速器", "Proof accelerator") },
            cost(x) { return new Decimal(5e5).times(Decimal.pow(2, x)) },
            effect(x) { return Decimal.pow(0.9, x) },   // static: smaller = cheaper floors
            display() {
                return L("定理价格 ×", "Theorem price ×") + format(buyableEffect(this.layer, this.id)) +
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
            if (hasMilestone("pnt", 5)) { keep.push("upgrades"); keep.push("milestones") }
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return true },

    tabFormat: [
        ["display-text", function() {
            return L("你证明了 ", "You have proven ") + "<h2 style='color:#8fc7ff;display:inline'>" + formatWhole(player.pnt.points) + "</h2> " + L("条定理", "theorems")
                + L("（最高 ", " (best ") + formatWhole(player.pnt.best) + "）"
        }],
        "prestige-button",
        ["display-text", function() {
            return L("下一条定理价格：", "Next theorem costs: ") + format(tmp.pnt.nextAt) + " " + L("计数", "counts")
        }],
        ["blank", "8px"],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": { content: [["raw-html", function() { return "<div style='opacity:.5'>" + L("素数的分布由 ζ 的零点主宰。", "The distribution of primes is ruled by the zeros of ζ.") + "</div>" }], "blank", "upgrades"] },
            "Buyables": { unlocked() { return getBuyableAmount("pnt", 11).gt(0) }, content: ["buyables"] },
            "Milestones": { content: ["blank", "milestones"] },
        },
    },

    upgrades: {
        11: {
            title() { return L("x / ln x", "x / ln x") },
            description() { return L("数的获取 ×5。", "Number gain ×5.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return L("切比雪夫估计", "Chebyshev's estimate") },
            description() { return L("素数获取 ×3。", "Prime gain ×3.") },
            cost: new Decimal(2),
            unlocked() { return hasUpgrade("pnt", 11) },
        },
        13: {
            title() { return L("π(x) 表", "Tables of π(x)") },
            description() { return L("计数获取 ×2。", "Count gain ×2.") },
            cost: new Decimal(4),
            unlocked() { return hasUpgrade("pnt", 12) },
        },
        14: {
            title() { return L("批量证明术", "Bulk proving") },
            description() { return L("解锁「买满定理」。", "Unlock buy-max for theorems.") },
            cost: new Decimal(11),
            unlocked() { return hasUpgrade("pnt", 13) },
        },
        15: {
            title() { return L("误差项", "The error term") },
            description() { return L("间隔获取 ×2。", "Gap gain ×2.") },
            cost: new Decimal(25),
            unlocked() { return hasUpgrade("pnt", 14) },
        },
        21: {
            title() { return L("对数积分 Li(x)", "The logarithmic integral") },
            description() { return L("数的获取按计数对数平方加成。", "Number gain is boosted by log²(counts).") },
            cost: new Decimal(50),
            unlocked() { return hasUpgrade("pnt", 15) },
            effect() { return player.pi.points.max(1).log10().pow(2).add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        22: {
            title() { return L("临界带", "The critical strip") },
            description() { return L("因数获取 ×2。", "Factor gain ×2.") },
            cost: new Decimal(120),
            unlocked() { return hasUpgrade("pnt", 21) },
        },
        23: {
            title() { return L("零点计数", "Counting the zeros") },
            description() { return L("数的获取按威尔逊商加成。", "Number gain is boosted by Wilson quotients.") },
            cost: new Decimal(300),
            unlocked() { return hasUpgrade("pnt", 22) },
            effect() { return player.wil.points.max(1).log10().add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: {
            title() { return L("解析延拓", "Analytic continuation") },
            description() { return L("定理价格 ×0.85。", "Theorem prices ×0.85.") },
            cost: new Decimal(800),
            unlocked() { return hasUpgrade("pnt", 23) },
        },
        25: {
            title() { return L("证明加速器图纸", "Accelerator blueprints") },
            description() { return L("解锁 buyable：证明加速器。", "Unlock the Proof accelerator buyable.") },
            cost: new Decimal(2000),
            unlocked() { return hasUpgrade("pnt", 24) },
        },
    },
})

// ------------------------------------------------------------
// wil — Wilson's Theorem (威尔逊定理): (n−1)! ≡ −1 (mod n) iff n prime
// ------------------------------------------------------------
addLayer("wil", {
    name() { return L("威尔逊定理", "Wilson's Theorem") },
    symbol: "n!",
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#ff9f9f",
    resource() { return L("威尔逊商", "Wilson quotients") },
    row: 2,
    position: 1,
    branches: ["fac"],

    baseResource: "factors",
    baseAmount() { return player.fac.points },
    requires: new Decimal(2e4),
    type: "static",
    exponent: 1,
    base: 3,
    roundUpCost: true,

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("wil", 21)) m = m.times(0.9)
        if (hasMilestone("oracle", 5)) m = m.times(0.8)
        return m
    },
    gainExp() { return new Decimal(1) },
    directMult() {
        let m = new Decimal(1)
        if (hasMilestone("wil", 3)) m = m.times(2)
        if (hasMilestone("wil", 5)) m = m.times(3)
        if (hasUpgrade("gap", 35)) m = m.times(2)   // gap u35: distant kin
        return m
    },

    canBuyMax() { return hasUpgrade("wil", 24) },

    hotkeys: [
        { key: "w", description() { return L("W: 证明威尔逊定理", "W: prove for Wilson quotients") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    // static automation: zeta.m5 package
    resetsNothing() { return hasMilestone("zeta", 5) },
    autoPrestige() { return hasMilestone("zeta", 5) },

    milestones: {
        0: { requirementDescription() { return L("证明 5 次（最高）", "Prove 5 times (best)") },
             effectDescription() { return L("数的获取 ×2", "Number gain ×2") },
             done() { return player.wil.best.gte(5) } },
        1: { requirementDescription() { return L("证明 15 次", "Prove 15 times") },
             effectDescription() { return L("因数获取 ×2", "Factor gain ×2") },
             unlocked() { return hasMilestone("wil", 0) },
             done() { return player.wil.best.gte(15) } },
        2: { requirementDescription() { return L("证明 40 次", "Prove 40 times") },
             effectDescription() { return L("计数获取 ×2", "Count gain ×2") },
             unlocked() { return hasMilestone("wil", 1) },
             done() { return player.wil.best.gte(40) } },
        3: { requirementDescription() { return L("证明 100 次", "Prove 100 times") },
             effectDescription() { return L("每次证明数 ×2", "Quotients per proof ×2") },
             unlocked() { return hasMilestone("wil", 2) },
             done() { return player.wil.best.gte(100) } },
        4: { requirementDescription() { return L("证明 250 次", "Prove 250 times") },
             effectDescription() { return L("行 3+ 重置保留本层", "Row-3+ resets keep this layer") },
             unlocked() { return hasMilestone("wil", 3) },
             done() { return player.wil.best.gte(250) } },
        5: { requirementDescription() { return L("证明 600 次", "Prove 600 times") },
             effectDescription() { return L("每次证明数 ×3", "Quotients per proof ×3") },
             unlocked() { return hasMilestone("wil", 4) },
             done() { return player.wil.best.gte(600) } },
    },

    buyables: {
        11: {
            unlocked() { return hasUpgrade("wil", 25) },
            title() { return L("阶乘引擎", "The factorial engine") },
            cost(x) { return new Decimal(1e6).times(Decimal.pow(2, x)) },
            effect(x) { return Decimal.pow(0.9, x) },
            display() {
                return L("商价格 ×", "Quotient price ×") + format(buyableEffect(this.layer, this.id)) +
                    L("<br>已购: ", "<br>Bought: ") + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    L("<br>价格: ", "<br>Cost: ") + format(tmp[this.layer].buyables[this.id].cost) + " " + L("因数", "factors")
            },
            canAfford() { return player.fac.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player.fac.points = player.fac.points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = ["unlocked", "best", "total"]
            if (hasMilestone("wil", 4)) { keep.push("upgrades"); keep.push("milestones") }
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return true },

    tabFormat: [
        ["display-text", function() {
            return L("你积累了 ", "You have accumulated ") + "<h2 style='color:#ff9f9f;display:inline'>" + formatWhole(player.wil.points) + "</h2> " + L("威尔逊商", "Wilson quotients")
                + L("（最高 ", " (best ") + formatWhole(player.wil.best) + "）"
        }],
        "prestige-button",
        ["display-text", function() {
            return L("下一个商价格：", "Next quotient costs: ") + format(tmp.wil.nextAt) + " " + L("因数", "factors")
        }],
        ["blank", "8px"],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": { content: [["raw-html", function() { return "<div style='opacity:.5'>" + L("(n−1)! ≡ −1 (mod n) 当且仅当 n 是素数。", "(n−1)! ≡ −1 (mod n) if and only if n is prime.") + "</div>" }], "blank", "upgrades"] },
            "Buyables": { unlocked() { return getBuyableAmount("wil", 11).gt(0) }, content: ["buyables"] },
            "Milestones": { content: ["blank", "milestones"] },
        },
    },

    upgrades: {
        11: {
            title() { return L("阶乘判据", "The factorial test") },
            description() { return L("数的获取 ×5。", "Number gain ×5.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return L("逆元", "Modular inverses") },
            description() { return L("素数获取 ×3。", "Prime gain ×3.") },
            cost: new Decimal(2),
            unlocked() { return hasUpgrade("wil", 11) },
        },
        13: {
            title() { return L("整除回响", "Divisibility echo") },
            description() { return L("因数获取 ×2。", "Factor gain ×2.") },
            cost: new Decimal(4),
            unlocked() { return hasUpgrade("wil", 12) },
        },
        14: {
            title() { return L("间隔上的阶乘", "Factorials on gaps") },
            description() { return L("间隔获取 ×2。", "Gap gain ×2.") },
            cost: new Decimal(10),
            unlocked() { return hasUpgrade("wil", 13) },
        },
        15: {
            title() { return L("引理校验", "Lemma verification") },
            description() { return L("引理获取 ×2。", "Lemma gain ×2.") },
            cost: new Decimal(30),
            unlocked() { return hasUpgrade("wil", 14) },
        },
        21: {
            title() { return L("更轻的阶乘", "Lighter factorials") },
            description() { return L("商价格 ×0.9。", "Quotient prices ×0.9.") },
            cost: new Decimal(80),
            unlocked() { return hasUpgrade("wil", 15) },
        },
        22: {
            title() { return L("计数交叉验证", "Count cross-validation") },
            description() { return L("计数获取 ×2。", "Count gain ×2.") },
            cost: new Decimal(200),
            unlocked() { return hasUpgrade("wil", 21) },
        },
        23: {
            title() { return L("五十商纪念", "The 50-quotient mark") },
            description() { return L("历史最高商 ≥ 50 时每次证明数 ×2。", "While best quotients ≥ 50, quotients per proof ×2.") },
            cost: new Decimal(500),
            unlocked() { return hasUpgrade("wil", 22) },
        },
        24: {
            title() { return L("批量阶乘", "Bulk factorials") },
            description() { return L("解锁「买满商」。", "Unlock buy-max for quotients.") },
            cost: new Decimal(1500),
            unlocked() { return hasUpgrade("wil", 23) },
        },
        25: {
            title() { return L("阶乘引擎图纸", "Engine blueprints") },
            description() { return L("解锁 buyable：阶乘引擎。", "Unlock the factorial engine buyable.") },
            cost: new Decimal(4000),
            unlocked() { return hasUpgrade("wil", 24) },
        },
    },
})

// ------------------------------------------------------------
// prob — Open Problems (未决问题馆): M2 score-attack trial hub.
// type "none" CONTENT layer (not a P15 production loop).
// Scores = peak primes sieved DURING each trial (maxpoints[]).
// update() writes ONLY maxpoints — never points (N-POINTSWRITE).
// ------------------------------------------------------------
const PROB_TRIALS = [11, 12, 21, 22]

addLayer("prob", {
    name() { return L("未决问题馆", "Open Problems") },
    symbol: "?",
    position: 2,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        maxpoints: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
    }},
    color: "#ff9fe0",
    resource() { return L("问题进度", "problem progress") },
    row: 2,
    position: 2,
    branches: ["pi", "fac"],
    type: "none",
    tooltip() { return L("未决问题馆", "Open Problems") },
    tooltipLocked() { return L("未决问题馆——数达到 5e7 后开门。", "Open Problems — opens at 5e7 numbers.") },

    update(diff) {
        if (!player[this.layer].unlocked) {
            // F28 — this IS the unlock writer (type none): the Landau hub reveals at 5e7
            // numbers (brief S4). No writer existed anywhere, so the hub was unreachable
            // in real play (found live in the browser: the save-at state had it locked).
            if (player.points.gte(TUNING.probUnlockNumbers)) player[this.layer].unlocked = true
            return
        }
        // M2 — record the per-trial score peak (primes sieved while inside)
        for (let i = 0; i < PROB_TRIALS.length; i++) {
            if (inChallenge("prob", PROB_TRIALS[i])) {
                let bonus = hasUpgrade("lem", 32) ? 1.5 : 1
                player.prob.maxpoints[i] = player.prob.maxpoints[i].max(player.s.points.times(bonus))
            }
        }
    },

    milestones: {
        0: { requirementDescription() { return L("完成任意 1 次试炼", "Complete any trial once") },
             effectDescription() { return L("数的获取 ×1.5", "Number gain ×1.5") },
             done() { return challengeCompletions("prob", 11) + challengeCompletions("prob", 12) + challengeCompletions("prob", 21) + challengeCompletions("prob", 22) >= 1 } },
        1: { requirementDescription() { return L("完成任意 6 次", "Complete any 6 trials") },
             effectDescription() { return L("素数获取 ×2", "Prime gain ×2") },
             unlocked() { return hasMilestone("prob", 0) },
             done() { return challengeCompletions("prob", 11) + challengeCompletions("prob", 12) + challengeCompletions("prob", 21) + challengeCompletions("prob", 22) >= 6 } },
        2: { requirementDescription() { return L("完成任意 12 次", "Complete any 12 trials") },
             effectDescription() { return L("数的获取 ×2", "Number gain ×2") },
             unlocked() { return hasMilestone("prob", 1) },
             done() { return challengeCompletions("prob", 11) + challengeCompletions("prob", 12) + challengeCompletions("prob", 21) + challengeCompletions("prob", 22) >= 12 } },
        3: { requirementDescription() { return L("完成任意 16 次（全满）", "Complete any 16 trials (all maxed)") },
             effectDescription() { return L("素数获取 ×3", "Prime gain ×3") },
             unlocked() { return hasMilestone("prob", 2) },
             done() { return challengeCompletions("prob", 11) + challengeCompletions("prob", 12) + challengeCompletions("prob", 21) + challengeCompletions("prob", 22) >= 16 } },
    },

    challenges: {
        11: {
            name() { return L("奇数之筛", "The Odd Sieve") },
            challengeDescription() {
                return L("筛层公式 ^0.8（偶数的通道被堵死）。", "The sieve formula is ^0.8 (the even pass is sealed).") + "<br>" +
                    L("得分（本局最高素数）：", "Score (peak primes this run): ") + format(player.prob.maxpoints[0]) + "<br>" +
                    challengeCompletions("prob", 11) + "/5"
            },
            goalDescription() { return L("筛出 ", "Sieve ") + format(this.goal()) + L(" 素数", " primes") },
            goal() { return new Decimal(1e6).times(Decimal.pow(1e3, challengeCompletions("prob", 11))) },
            canComplete() { return player.s.points.gte(this.goal()) },
            completionLimit: 5,
            rewardDescription() { return L("每次完成：数的获取 ×1.5（可叠）。", "Each completion: number gain ×1.5 (stacks).") },
            rewardEffect() { return Decimal.pow(1.5, challengeCompletions("prob", 11)) },
            rewardDisplay() { return format(this.rewardEffect()) + "x" },
            unlocked() { return player.prob.unlocked },
        },
        12: {
            name() { return L("盲数计数", "Blind Counting") },
            challengeDescription() {
                return L("π 层公式 ^0.7（计数器蒙上了眼）。", "The π formula is ^0.7 (the counters are blindfolded).") + "<br>" +
                    L("得分（本局最高素数）：", "Score (peak primes this run): ") + format(player.prob.maxpoints[1]) + "<br>" +
                    challengeCompletions("prob", 12) + "/5"
            },
            goalDescription() { return L("攒出 ", "Bank ") + format(this.goal()) + L(" 计数", " counts") },
            goal() { return new Decimal(1e5).times(Decimal.pow(1e3, challengeCompletions("prob", 12))) },
            canComplete() { return player.pi.points.gte(this.goal()) },
            completionLimit: 5,
            rewardDescription() { return L("每次完成：数的获取按试炼得分成长。", "Each completion: number gain grows with your score.") },
            rewardEffect() { return player.prob.maxpoints[1].max(1).log10().add(1).pow(Decimal.max(1, challengeCompletions("prob", 12) * 0.5)) },
            rewardDisplay() { return format(this.rewardEffect()) + "x" },
            unlocked() { return hasMilestone("prob", 0) },
        },
        21: {
            name() { return L("徒手筛分", "Bare Hands") },
            challengeDescription() {
                return L("全部滤网停用。", "All filters are disabled.") + "<br>" +
                    L("得分（本局最高素数）：", "Score (peak primes this run): ") + format(player.prob.maxpoints[2]) + "<br>" +
                    challengeCompletions("prob", 21) + "/4"
            },
            goalDescription() { return L("筛出 ", "Sieve ") + format(this.goal()) + L(" 素数", " primes") },
            goal() { return new Decimal(1e8).times(Decimal.pow(1e3, challengeCompletions("prob", 21))) },
            canComplete() { return player.s.points.gte(this.goal()) },
            completionLimit: 4,
            rewardDescription() { return L("每次完成：素数获取 ×1.5（可叠）。", "Each completion: prime gain ×1.5 (stacks).") },
            rewardEffect() { return Decimal.pow(1.5, challengeCompletions("prob", 21)) },
            rewardDisplay() { return format(this.rewardEffect()) + "x" },
            unlocked() { return hasMilestone("prob", 0) },
        },
        22: {
            name() { return L("慢速阶乘", "Slow Factorial") },
            challengeDescription() {
                return L("因式分解公式 ^0.7。", "The factorization formula is ^0.7.") + "<br>" +
                    L("得分（本局最高素数）：", "Score (peak primes this run): ") + format(player.prob.maxpoints[3]) + "<br>" +
                    challengeCompletions("prob", 22) + "/4"
            },
            goalDescription() { return L("攒出 ", "Bank ") + format(this.goal()) + L(" 因数", " factors") },
            goal() { return new Decimal(1e7).times(Decimal.pow(1e3, challengeCompletions("prob", 22))) },
            canComplete() { return player.fac.points.gte(this.goal()) },
            completionLimit: 4,
            rewardDescription() { return L("每次完成：素数获取按试炼得分成长。", "Each completion: prime gain grows with your score.") },
            rewardEffect() { return player.prob.maxpoints[3].max(1).log10().add(1).pow(Decimal.max(1, challengeCompletions("prob", 22) * 0.5)) },
            rewardDisplay() { return format(this.rewardEffect()) + "x" },
            unlocked() { return hasMilestone("prob", 1) },
        },
    },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            // F18 — keep cannot carry arrays: hand-copy maxpoints around the wipe
            let savedMax = player.prob.maxpoints
            layerDataReset(this.layer, ["unlocked", "upgrades", "milestones", "challenges"])
            player.prob.maxpoints = savedMax
        }
    },

    // threshold gate — set unlocked from an upstream currency (F28 writer)
    layerShown() { return player.prob.unlocked },

    tabFormat: [
        ["display-text", function() {
            return L("朗道四个问题至今悬而未决——你的分数就是对它们的冲击距离。", "Landau's four problems are still open — your score is how far your siege reaches.")
        }],
        "milestones",
        "challenges",
    ],

    // 27 upgrades — the hall of famous results; bought with numbers
    upgrades: {
        11: { title() { return L("欧几里得：素数无穷", "Euclid: infinity of primes") }, description() { return L("数的获取 ×2。", "Number gain ×2.") }, cost: new Decimal(5e7) },
        12: { title() { return L("埃氏筛手稿", "Eratosthenes' manuscript") }, description() { return L("素数获取 ×2。", "Prime gain ×2.") }, cost: new Decimal(1e8), unlocked() { return hasUpgrade("prob", 11) } },
        13: { title() { return L("费马小定理", "Fermat's little theorem") }, description() { return L("数的获取 ×2。", "Number gain ×2.") }, cost: new Decimal(5e8), unlocked() { return hasUpgrade("prob", 12) } },
        14: { title() { return L("二次互反律", "Quadratic reciprocity") }, description() { return L("赌场胜率 ×1.1。", "Casino payouts ×1.1.") }, cost: new Decimal(1e9), unlocked() { return hasUpgrade("prob", 13) } },
        15: { title() { return L("狄利克雷定理", "Dirichlet's theorem") }, description() { return L("计数获取 ×2。", "Count gain ×2.") }, cost: new Decimal(5e9), unlocked() { return hasUpgrade("prob", 14) } },
        21: { title() { return L("伯特兰公设", "Bertrand's postulate") }, description() { return L("素数滴流 ×2（passive ×2）。", "Prime trickle ×2 (passive ×2).") }, cost: new Decimal(1e10), unlocked() { return hasUpgrade("prob", 15) } },
        22: { title() { return L("勒让德猜想", "Legendre's conjecture") }, description() { return L("因数获取 ×2。", "Factor gain ×2.") }, cost: new Decimal(5e10), unlocked() { return hasUpgrade("prob", 21) } },
        23: { title() { return L("欧拉乘积", "The Euler product") }, description() { return L("数的获取 ×3。", "Number gain ×3.") }, cost: new Decimal(1e11), unlocked() { return hasUpgrade("prob", 22) } },
        24: { title() { return L("ζ(2) = π²/6", "ζ(2) = π²/6") }, description() { return L("引理获取 ×2。", "Lemma gain ×2.") }, cost: new Decimal(5e11), unlocked() { return hasUpgrade("prob", 23) } },
        25: { title() { return L("梅森素数猎场", "The Mersenne hunting ground") }, description() { return L("间隔获取 ×2。", "Gap gain ×2.") }, cost: new Decimal(1e12), unlocked() { return hasUpgrade("prob", 24) } },
        31: { title() { return L("陈景润：1+2", "Chen's theorem (1+2)") }, description() { return L("素数获取 ×2。", "Prime gain ×2.") }, cost: new Decimal(5e12), unlocked() { return hasUpgrade("prob", 25) } },
        32: { title() { return L("布朗定理", "Brun's theorem") }, description() { return L("孪生对获取 ×2。", "Twin gain ×2.") }, cost: new Decimal(1e13), unlocked() { return hasUpgrade("prob", 31) } },
        33: { title() { return L("格林-陶定理", "The Green–Tao theorem") }, description() { return L("计数获取 ×3。", "Count gain ×3.") }, cost: new Decimal(5e13), unlocked() { return hasUpgrade("prob", 32) } },
        34: { title() { return L("弱哥德巴赫（已证！）", "Weak Goldbach (proved!)") }, description() { return L("拆分获取 ×2。", "Split gain ×2.") }, cost: new Decimal(1e14), unlocked() { return hasUpgrade("prob", 33) } },
        35: { title() { return L("张益唐：有界间隔", "Zhang's bounded gaps") }, description() { return L("间隔获取 ×3。", "Gap gain ×3.") }, cost: new Decimal(5e14), unlocked() { return hasUpgrade("prob", 34) } },
        41: { title() { return L("卡迈克尔数", "Carmichael numbers") }, description() { return L("数的获取 ×3。", "Number gain ×3.") }, cost: new Decimal(1e15), unlocked() { return hasUpgrade("prob", 35) } },
        42: { title() { return L("完全数之谜", "The perfect number mystery") }, description() { return L("因数获取 ×3。", "Factor gain ×3.") }, cost: new Decimal(5e15), unlocked() { return hasUpgrade("prob", 41) } },
        43: { title() { return L("索菲·热尔曼素数", "Sophie Germain primes") }, description() { return L("素数获取 ×3。", "Prime gain ×3.") }, cost: new Decimal(1e16), unlocked() { return hasUpgrade("prob", 42) } },
        44: { title() { return L("素数定理的初等证明", "The elementary PNT proof") }, description() { return L("计数获取 ×2，数的获取 ×2。", "Count gain ×2 and number gain ×2.") }, cost: new Decimal(5e16), unlocked() { return hasUpgrade("prob", 43) } },
        45: { title() { return L("阿蒂亚之问", "Atiyah's attempt") }, description() { return L("智慧获取 ×1.5。", "Wisdom gain ×1.5.") }, cost: new Decimal(1e17), unlocked() { return hasUpgrade("prob", 44) } },
        51: { title() { return L("广义黎曼猜想", "The generalized RH") }, description() { return L("数的获取 ×5。", "Number gain ×5.") }, cost: new Decimal(1e18), unlocked() { return hasUpgrade("prob", 45) } },
        52: { title() { return L("哈代-李特尔伍德", "Hardy–Littlewood") }, description() { return L("孪生对获取 ×3。", "Twin gain ×3.") }, cost: new Decimal(1e19), unlocked() { return hasUpgrade("prob", 51) } },
        53: { title() { return L("克拉默模型", "The Cramér model") }, description() { return L("赌场收益 ×1.25。", "Casino payouts ×1.25.") }, cost: new Decimal(1e20), unlocked() { return hasUpgrade("prob", 52) } },
        54: { title() { return L("abc 猜想", "The abc conjecture") }, description() { return L("因数获取 ×5。", "Factor gain ×5.") }, cost: new Decimal(1e21), unlocked() { return hasUpgrade("prob", 53) } },
        55: { title() { return L("朗道第四问：km", "Landau's fourth: n²+1") }, description() { return L("引理获取 ×3。", "Lemma gain ×3.") }, cost: new Decimal(1e22), unlocked() { return hasUpgrade("prob", 54) } },
        61: { title() { return L("显式公式", "The explicit formula") }, description() { return L("素的获取按零点数加成。", "Prime gain is boosted by your pinned zeros.") }, cost: new Decimal(1e24), unlocked() { return hasUpgrade("prob", 55) },
             effect() { return player.zeta.zeros.max(1).pow(0.15) }, effectDisplay() { return format(this.effect()) + "x" } },
        62: { title() { return L("黎曼假设（？）", "The Riemann Hypothesis (?)") }, description() { return L("一切获取 ×2。", "All gains ×2.") }, cost: new Decimal(1e26), unlocked() { return hasUpgrade("prob", 61) } },
    },
})
