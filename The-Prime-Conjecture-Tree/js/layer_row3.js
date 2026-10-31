// ============================================================
// ROW 3 — pairs (Prime Pairs ±: Goldbach + twins, M3 minigame,
//          twin HARD CAP = the open conjecture itself) /
//         oracle (Pantheon Σ: M13 sacrifice gacha + buff bus)
// Both: type "custom" (getResetGain/getNextAt/canReset —
// D-CUSTOMNEXTAT), multipliers placed AROUND the pow (P8).
// ============================================================

// Goldbach verified pairs for even targets 6..40 (the minigame's answer table)
const GOLDBACH_PAIRS = { 6: [3, 3], 8: [3, 5], 10: [3, 7], 12: [5, 7], 14: [3, 11], 16: [3, 13],
    18: [5, 13], 20: [3, 17], 22: [3, 19], 24: [5, 19], 26: [3, 23], 28: [5, 23],
    30: [7, 23], 32: [3, 29], 34: [3, 31], 36: [5, 31], 38: [7, 31], 40: [3, 37] }

// The 13 Pantheon blessings (M13): slot index → [name key, consumer note, base value]
const BLESSINGS = [
    ["Euler", "numbers", 4], ["Gauss", "primes", 4], ["Riemann", "boss damage", 3],
    ["Euclid", "primes", 3], ["Eratosthenes", "filter bursts", 2], ["Fermat", "factors", 3],
    ["Goldbach", "splits", 3], ["Hardy", "twins", 2], ["Ramanujan", "counts", 3],
    ["Noether", "lemmas", 2], ["Hilbert", "gaps", 3], ["von Neumann", "casino", 2],
    ["Turing", "everything", 2],
]

addLayer("pairs", {
    name() { return L("素数对", "Prime Pairs") },
    symbol: "±",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        twins: new Decimal(0),        // HARD-CAPPED at π₂(R) — the open conjecture (§8)
        mgTarget: 10,                 // minigame: current even target (plain number)
        mgStreak: 0,                  // minigame: correct-pick streak (plain number)
        mgRunning: false,
    }},
    color: "#c9ff8f",
    resource() { return L("拆分", "splits") },
    row: 3,
    position: 0,
    branches: ["s", "pnt"],

    baseResource: "primes",
    baseAmount() { return player.s.points },
    requires: new Decimal(8e5),
    type: "custom",

    // --- custom prestige (P8): multipliers AROUND the pow ---
    postMult() {
        let m = new Decimal(1)
        if (hasUpgrade("lem", 24)) m = m.times(1.2)
        if (hasUpgrade("prob", 34)) m = m.times(2)
        if (hasUpgrade("pairs", 31)) m = m.times(5)
        if (hasMilestone("pairs", 2)) m = m.times(2)
        if (hasMilestone("pairs", 5)) m = m.times(3)
        if (hasMilestone("zeta", 6)) m = m.times(3)
        // Pantheon bus slot 6 (Goldbach)
        if (player.oracle.neff1[6]) m = m.times(player.oracle.ncalc1[6])
        // M3 deduction streak: factorial-shaped, bounded at 8
        m = m.times(this.mgMult())
        // outside consumer of fac.b11 (N-BUYABLEDEAD)
        m = m.times(buyableEffect("fac", 11).pow(0.5))
        return m
    },
    mgMult() {
        let s = Math.min(player.pairs.mgStreak, 8)
        if (s < 1) return new Decimal(1)
        return Decimal.factorial(s).pow(0.5)
    },
    getResetGain() {
        let pts = player.s.points.max(10).log10()
        return pts.div(TUNING.pairsLogReq).pow(TUNING.pairsExp).times(this.postMult()).max(0).floor()
    },
    getNextAt(canMax) {
        let n = this.getResetGain().add(1)
        return Decimal.pow(10, TUNING.pairsLogReq * Decimal.pow(n.div(this.postMult()), 1 / TUNING.pairsExp).toNumber())
    },
    /* canReset must carry the engine's doReset gate (game.js:182: baseAmount >= requires,
     * checked on EVERY press) — otherwise postMult pushes gain >= 1 below the requires
     * floor and the button shows "can" while the engine silently refuses (found live in
     * the browser: SPLIT! +1.00 at 6,200 primes against requires 8e5). */
    canReset() { return player.s.points.gte(tmp.pairs.requires) && this.getResetGain().gte(1) },
    prestigeButtonText() {
        return L("拆分！", "SPLIT! ") + "+" + format(tmp.pairs.resetGain) + " " + L("拆分", "splits") +
            L("<br>下一档需要 ", "<br>Next at ") + format(tmp.pairs.nextAt) + " " + L("素数", "primes")
    },

    // --- twins: hard cap = π₂(R), raised ×6 by visible upgrades/milestones (§8) ---
    twinCap() {
        let cap = new Decimal(205)   // π₂(10⁴)
        if (hasUpgrade("pairs", 23)) cap = cap.times(6)
        if (hasUpgrade("pairs", 34)) cap = cap.times(6)
        if (hasMilestone("pairs", 3)) cap = cap.times(6)
        return cap
    },
    twinRate() {
        let r = player.pairs.points.max(1).log10().pow(1.5).times(0.05)
        if (hasUpgrade("pairs", 22)) r = r.pow(1.1)               // K4 named: the twin rate
        if (hasUpgrade("prob", 32)) r = r.times(2)
        if (hasUpgrade("prob", 52)) r = r.times(3)
        if (hasMilestone("pairs", 0)) r = r.times(2)
        r = r.times(buyableEffect("pairs", 11))
        if (player.oracle.neff1[7]) r = r.times(player.oracle.ncalc1[7])   // Hardy
        return r
    },
    update(diff) {
        if (!player[this.layer].unlocked) return   // F28 guard
        // hard cap via clamp: twins never exceed π₂(R) — softcap(x, cap, 0) shape
        player.pairs.twins = player.pairs.twins.add(this.twinRate().times(diff)).min(this.twinCap())
        // M3 minigame round-start writer: mgRunning had NO writer anywhere (dead content —
        // pmPick's guard always early-returned, found live in the browser). A round is live
        // from the moment u25 unlocks the picks; pmPick rolls the next target each answer.
        if (hasUpgrade("pairs", 25) && !player.pairs.mgRunning) player.pairs.mgRunning = true
    },

    // --- M3 minigame: pick the pair that sums to the target (deduction!) ---
    mgCorrectIndex() { return (player.pairs.mgTarget / 2) % 3 },
    mgPairText(idx) {
        let N = player.pairs.mgTarget
        let ab = GOLDBACH_PAIRS[N] || [3, N - 3]
        if (idx === this.mgCorrectIndex()) return "(" + ab[0] + ", " + ab[1] + ")"
        if (idx === (this.mgCorrectIndex() + 1) % 3) return "(" + ab[0] + ", " + (ab[1] + 2) + ")"
        return "(" + (ab[0] + 2) + ", " + ab[1] + ")"
    },

    gainMult() {
        let m = new Decimal(1)
        if (hasUpgrade("pairs", 15)) m = m.times(upgradeEffect("pairs", 15))   // K2 self-shape
        if (hasUpgrade("pairs", 21)) m = m.times(upgradeEffect("pairs", 21))   // K3 wisdom
        if (hasUpgrade("pairs", 32) && player.pairs.best.gte(100)) m = m.times(2) // K6
        if (hasUpgrade("prob", 32)) m = m.times(2)
        if (hasUpgrade("prob", 52)) m = m.times(3)
        m = m.times(player.pairs.twins.max(1).pow(0.15))                       // twins feed splits
        return m
    },
    gainExp() { return new Decimal(1) },

    hotkeys: [
        { key: "b", description() { return L("B: 拆分素数对", "B: reset primes for splits") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    milestones: {
        0: { requirementDescription() { return L("拥有 10 拆分（最高）", "Reach 10 splits (best)") },
             effectDescription() { return L("孪生对速率 ×2", "Twin rate ×2") },
             done() { return player.pairs.best.gte(10) } },
        1: { requirementDescription() { return L("拥有 25 拆分", "Reach 25 splits") },
             effectDescription() { return L("解锁第二排升级", "Unlock the second upgrade row") },
             unlocked() { return hasMilestone("pairs", 0) },
             done() { return player.pairs.best.gte(25) } },
        2: { requirementDescription() { return L("拥有 50 拆分", "Reach 50 splits") },
             effectDescription() { return L("拆分获取 ×2", "Split gain ×2") },
             unlocked() { return hasMilestone("pairs", 1) },
             done() { return player.pairs.best.gte(50) } },
        3: { requirementDescription() { return L("拥有 100 拆分", "Reach 100 splits") },
             effectDescription() { return L("孪生硬帽 ×6（帽值可见）", "Twin hard cap ×6 (the cap is displayed)") },
             unlocked() { return hasMilestone("pairs", 2) },
             done() { return player.pairs.best.gte(100) } },
        4: { requirementDescription() { return L("拥有 200 拆分", "Reach 200 splits") },
             effectDescription() { return L("行 4 重置保留本层", "Row-4 resets keep this layer") },
             unlocked() { return hasMilestone("pairs", 3) },
             done() { return player.pairs.best.gte(200) } },
        5: { requirementDescription() { return L("拥有 400 拆分", "Reach 400 splits") },
             effectDescription() { return L("拆分获取 ×3", "Split gain ×3") },
             unlocked() { return hasMilestone("pairs", 4) },
             done() { return player.pairs.best.gte(400) } },
    },

    buyables: {
        11: {
            unlocked() { return hasUpgrade("pairs", 35) },
            title() { return L("孪生望远镜", "The twin telescope") },
            cost(x) { return new Decimal(50).times(Decimal.pow(2, x)) },
            effect(x) { return Decimal.pow(1.2, x) },
            display() {
                return L("孪生对速率 ×", "Twin rate ×") + format(buyableEffect(this.layer, this.id)) +
                    L("<br>已购: ", "<br>Bought: ") + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    L("<br>价格: ", "<br>Cost: ") + format(tmp[this.layer].buyables[this.id].cost) + " " + L("拆分", "splits")
            },
            canAfford() { return player.pairs.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player.pairs.points = player.pairs.points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = ["unlocked", "best", "total", "twins", "mgTarget", "mgStreak", "mgRunning"]
            if (hasMilestone("pairs", 4)) { keep.push("upgrades"); keep.push("milestones") }
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return true },

    tabFormat: [
        ["display-text", function() {
            return L("你有 ", "You have ") + "<h2 style='color:#c9ff8f;display:inline'>" + format(player.pairs.points) + "</h2> " + L("拆分", "splits")
                + L("（最高 ", " (best ") + formatWhole(player.pairs.best) + "）"
                + L("　·　孪生对：", "　·　Twin pairs: ") + "<b style='color:#c9ff8f'>" + formatWhole(player.pairs.twins) + "</b> / " + formatWhole(tmp.pairs.twinCap) +
                L("（已验证区间内）", " (within the verified range)")
        }],
        "prestige-button",
        ["blank", "8px"],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "Goldbach": { content: [["raw-html", function() { return "<div style='opacity:.5'>" + L("每个大于 2 的偶数都是两个素数之和——吗？", "Every even number > 2 is the sum of two primes — isn't it?") + "</div>" }], "blank", "upgrades"] },
            "Minigame": {
                unlocked() { return hasUpgrade("pairs", 25) },
                content: [
                    ["display-text", function() {
                        return L("推理时刻：哪一对素数之和等于 ", "Deduce: which pair sums to ") + "<b>" + player.pairs.mgTarget + "</b>？" +
                            L("（答对连击，答错清零）", " (correct pick builds a streak; a wrong pick resets it)")
                    }],
                    "clickables",
                    ["display-text", function() {
                        return L("当前连击：", "Current streak: ") + "<b>" + player.pairs.mgStreak + "</b>" +
                            L("　·　连击倍率：", "　·　Streak bonus: ×") + format(tmp.pairs.mgMult)
                    }],
                ],
            },
            "Buyables": { unlocked() { return getBuyableAmount("pairs", 11).gt(0) }, content: ["buyables"] },
            "Milestones": { content: ["blank", "milestones"] },
        },
    },

    clickables: {
        11: {
            display() { return layers.pairs.mgPairText(0) },
            canClick() { return hasUpgrade("pairs", 25) },
            onClick() { layers.pairs.pmPick(0) },
        },
        12: {
            display() { return layers.pairs.mgPairText(1) },
            canClick() { return hasUpgrade("pairs", 25) },
            onClick() { layers.pairs.pmPick(1) },
        },
        13: {
            display() { return layers.pairs.mgPairText(2) },
            canClick() { return hasUpgrade("pairs", 25) },
            onClick() { layers.pairs.pmPick(2) },
        },
    },

    // registered in doNotCallTheseFunctionsEveryTick (action, not value)
    pmPick(idx) {
        if (!player.pairs.mgRunning) return
        if (idx === this.mgCorrectIndex()) {
            player.pairs.mgStreak = Math.min(player.pairs.mgStreak + 1, 12)
            // instant payout: bank N seconds of split-rate worth of primes ×streak
            addPoints("s", tmp.s.resetGain.max(1).times(TUNING.mgPayBase + TUNING.mgPayStreak * player.pairs.mgStreak))
        } else {
            player.pairs.mgStreak = 0
        }
        // roll the next target (even 6..40)
        let t = 6 + 2 * Math.floor(Math.random() * 18)
        player.pairs.mgTarget = t
    },

    upgrades: {
        11: { title() { return L("偶数拆分", "Even splits") }, description() { return L("数的获取 ×3。", "Number gain ×3.") }, cost: new Decimal(1) },
        12: { title() { return L("素数对牧场", "The pair pasture") }, description() { return L("素数获取 ×5。", "Prime gain ×5.") }, cost: new Decimal(5), unlocked() { return hasUpgrade("pairs", 11) } },
        13: { title() { return L("和与差", "Sums and differences") }, description() { return L("因数获取 ×3。", "Factor gain ×3.") }, cost: new Decimal(25), unlocked() { return hasUpgrade("pairs", 12) } },
        14: { title() { return L("间隔对称", "Gap symmetry") }, description() { return L("间隔获取 ×3。", "Gap gain ×3.") }, cost: new Decimal(125), unlocked() { return hasUpgrade("pairs", 13) } },
        15: { title() { return L("未拆之数", "The unsplitted") }, description() { return L("拆分获取按未动用的拆分加成。", "Split gain is boosted by your unspent splits.") }, cost: new Decimal(600), unlocked() { return hasUpgrade("pairs", 14) },
             effect() { return player.pairs.points.add(1).pow(0.4) }, effectDisplay() { return format(this.effect()) + "x" } },
        21: { title() { return L("先贤注疏", "The masters' commentary") }, description() { return L("拆分获取按智慧加成。", "Split gain is boosted by your wisdom.") }, cost: new Decimal(3e3), unlocked() { return hasMilestone("pairs", 1) },
             effect() { return player.oracle.points.max(1).log10().add(1) }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title() { return L("孪生密度", "Twin density") }, description() { return L("孪生对速率公式强化：^1.1。", "The twin-rate formula grows stronger: ^1.1.") }, cost: new Decimal(1.5e4), unlocked() { return hasUpgrade("pairs", 21) } },
        23: { title() { return L("验证区间 ×10", "Verified range ×10") }, description() { return L("孪生硬帽 ×6（帽值始终显示）。", "Twin hard cap ×6 (always displayed).") }, cost: new Decimal(8e4), unlocked() { return hasUpgrade("pairs", 22) } },
        24: { title() { return L("孪生加速器", "The twin accelerator") }, description() { return L("孪生对速率 ×2。", "Twin rate ×2.") }, cost: new Decimal(4e5), unlocked() { return hasUpgrade("pairs", 23) } },
        25: { title() { return L("推理桌", "The deduction desk") }, description() { return L("解锁素数对判定小游戏（免费游玩）。", "Unlock the pair-deduction minigame (free to play).") }, cost: new Decimal(2e6), unlocked() { return hasUpgrade("pairs", 24) } },
        31: { title() { return L("哈代-李特尔伍德猜想", "The Hardy–Littlewood conjecture") }, description() { return L("拆分获取 ×5。", "Split gain ×5.") }, cost: new Decimal(1e7), unlocked() { return hasUpgrade("pairs", 25) } },
        32: { title() { return L("百日纪念", "The 100-split mark") }, description() { return L("历史最高拆分 ≥ 100 时拆分获取 ×2。", "While best splits ≥ 100, split gain ×2.") }, cost: new Decimal(5e7), unlocked() { return hasUpgrade("pairs", 31) } },
        33: { title() { return L("孪生反馈 ζ", "Twins feed ζ") }, description() { return L("孪生对强化 Boss 伤害。", "Twin pairs boost Boss damage.") }, cost: new Decimal(2.5e8), unlocked() { return hasUpgrade("pairs", 32) } },
        34: { title() { return L("验证区间 ×100", "Verified range ×100") }, description() { return L("孪生硬帽再 ×6。", "Twin hard cap ×6 more.") }, cost: new Decimal(1e9), unlocked() { return hasUpgrade("pairs", 33) } },
        35: { title() { return L("孪生望远镜图纸", "Telescope blueprints") }, description() { return L("解锁 buyable：孪生望远镜。", "Unlock the twin telescope buyable.") }, cost: new Decimal(5e9), unlocked() { return hasUpgrade("pairs", 34) } },
    },
})

// ------------------------------------------------------------
// oracle — Pantheon (先贤祠): M13 sacrifice gacha + global buff bus.
// neff1[]/ncalc1[] are declared in startData, sized pool+1 (D-GACHADATA).
// Every earlier layer reads its own slots — the bus decouples drawing
// from consuming (P21).
// ------------------------------------------------------------
addLayer("oracle", {
    name() { return L("先贤祠", "The Pantheon") },
    symbol: "Σ",
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        draws: new Decimal(0),
        neff1: [false, false, false, false, false, false, false, false, false, false, false, false, false],
        ncalc1: [new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1),
                 new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1)],
    }},
    color: "#e6c78f",
    resource() { return L("智慧", "wisdom") },
    row: 3,
    position: 1,
    branches: ["s", "wil"],

    baseResource: "primes",
    baseAmount() { return player.s.points },
    requires: new Decimal(2e6),
    type: "custom",

    postMult() {
        let m = new Decimal(1)
        if (hasUpgrade("prob", 45)) m = m.times(1.5)
        if (hasUpgrade("oracle", 21)) m = m.times(upgradeEffect("oracle", 21))
        if (hasMilestone("oracle", 5)) m = m.times(2)
        if (hasMilestone("oracle", 7)) m = m.times(3)
        if (hasMilestone("zeta", 7)) m = m.times(3)
        if (hasUpgrade("lem", 25)) m = m.pow(1.05)
        return m
    },
    getResetGain() {
        let pts = player.s.points.max(10).log10()
        return pts.div(TUNING.oracleLogReq).pow(TUNING.oracleExp).times(this.postMult()).max(0).floor()
    },
    getNextAt(canMax) {
        let n = this.getResetGain().add(1)
        return Decimal.pow(10, TUNING.oracleLogReq * Decimal.pow(n.div(this.postMult()), 1 / TUNING.oracleExp).toNumber())
    },
    /* same requires gate as pairs — see the comment there */
    canReset() { return player.s.points.gte(tmp.oracle.requires) && this.getResetGain().gte(1) },
    prestigeButtonText() {
        return L("证明！", "PROVE! ") + "+" + format(tmp.oracle.resetGain) + " " + L("智慧", "wisdom") +
            L("<br>下一档需要 ", "<br>Next at ") + format(tmp.oracle.nextAt) + " " + L("素数", "primes")
    },

    // M13 — the draw: sacrifice primes, a random blessing lands in a slot
    sacrificeCost() { return new Decimal(1e5).times(Decimal.pow(1.6 * TUNING.oracleSacrificeMult(), player.oracle.draws)) },
    summonBlessing() {
        if (player.s.points.lt(this.sacrificeCost())) return
        player.s.points = player.s.points.sub(this.sacrificeCost())
        player.oracle.draws = player.oracle.draws.add(1)
        let slot = Math.floor(Math.random() * 13)
        let base = BLESSINGS[slot][2]
        let scale = player.oracle.points.max(1).pow(0.1)
        if (player.oracle.neff1[slot] && hasMilestone("oracle", 5)) {
            player.oracle.ncalc1[slot] = player.oracle.ncalc1[slot].times(1.5)   // merge instead of burn
        } else if (player.oracle.neff1[slot]) {
            // slot occupied and no merge yet: the sacrifice burns (P21)
            return
        } else {
            player.oracle.neff1[slot] = true
            player.oracle.ncalc1[slot] = new Decimal(base).times(scale)
        }
    },

    gainMult() {
        let m = new Decimal(1)
        if (hasMilestone("oracle", 6)) m = m.times(2)
        m = m.times(buyableEffect("fac", 11).pow(0.5))   // outside consumer of fac.b11 (shared with pairs)
        return m
    },
    gainExp() { return new Decimal(1) },

    hotkeys: [
        { key: "o", description() { return L("O: 证明获得智慧", "O: prove for wisdom") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    milestones: {
        0: { requirementDescription() { return L("拥有 10 智慧（最高）", "Reach 10 wisdom (best)") },
             effectDescription() { return L("同时生效槽位 → 2", "Simultaneous slots → 2") },
             done() { return player.oracle.best.gte(10) } },
        1: { requirementDescription() { return L("拥有 30 智慧", "Reach 30 wisdom") },
             effectDescription() { return L("计数与因数随时间滴流", "Counts & factors trickle in over time") },
             unlocked() { return hasMilestone("oracle", 0) },
             done() { return player.oracle.best.gte(30) } },
        2: { requirementDescription() { return L("拥有 100 智慧", "Reach 100 wisdom") },
             effectDescription() { return L("间隔层自动化（passive + auto + 不被清扫）", "Gap layer automated (passive + auto + keep)") },
             unlocked() { return hasMilestone("oracle", 1) },
             done() { return player.oracle.best.gte(100) } },
        3: { requirementDescription() { return L("拥有 300 智慧", "Reach 300 wisdom") },
             effectDescription() { return L("同时生效槽位 → 5；引理随时间滴流", "Slots → 5; lemmas trickle in") },
             unlocked() { return hasMilestone("oracle", 2) },
             done() { return player.oracle.best.gte(300) } },
        4: { requirementDescription() { return L("拥有 1e3 智慧", "Reach 1e3 wisdom") },
             effectDescription() { return L("素数定理层自动化（auto + 不被清扫）", "PNT automated (auto + keep)") },
             unlocked() { return hasMilestone("oracle", 3) },
             done() { return player.oracle.best.gte(1000) } },
        5: { requirementDescription() { return L("拥有 3e3 智慧", "Reach 3e3 wisdom") },
             effectDescription() { return L("重复召唤改为强化（不再烧掉祭品）；智慧 ×2", "Redraws merge instead of burning; wisdom ×2") },
             unlocked() { return hasMilestone("oracle", 4) },
             done() { return player.oracle.best.gte(3000) } },
        6: { requirementDescription() { return L("拥有 1e4 智慧", "Reach 1e4 wisdom") },
             effectDescription() { return L("同时生效槽位 → 8；智慧获取 ×2", "Slots → 8; wisdom gain ×2") },
             unlocked() { return hasMilestone("oracle", 5) },
             done() { return player.oracle.best.gte(1e4) } },
        7: { requirementDescription() { return L("拥有 3e4 智慧", "Reach 3e4 wisdom") },
             effectDescription() { return L("行 4 重置保留本层；智慧 ×3", "Row-4 resets keep this layer; wisdom ×3") },
             unlocked() { return hasMilestone("oracle", 6) },
             done() { return player.oracle.best.gte(3e4) } },
    },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            // F18 — arrays cannot ride the keep list: hand-copy the bus
            let neff = player.oracle.neff1, ncalc = player.oracle.ncalc1
            let keep = ["unlocked", "best", "total", "draws"]
            if (hasMilestone("oracle", 7)) { keep.push("upgrades"); keep.push("milestones") }
            layerDataReset(this.layer, keep)
            player.oracle.neff1 = neff
            player.oracle.ncalc1 = ncalc
        }
    },

    layerShown() { return true },

    tabFormat: [
        ["display-text", function() {
            return L("你有 ", "You have ") + "<h2 style='color:#e6c78f;display:inline'>" + format(player.oracle.points) + "</h2> " + L("智慧", "wisdom")
                + L("（最高 ", " (best ") + formatWhole(player.oracle.best) + "）"
        }],
        "prestige-button",
        ["blank", "8px"],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "Summon": {
                content: [
                    ["display-text", function() {
                        return L("献祭素数，召唤一位数论先贤的祝福。", "Sacrifice primes to summon a number theorist's blessing.") +
                            L("<br>价格：", "<br>Cost: ") + format(tmp.oracle.sacrificeCost) + " " + L("素数", "primes") +
                            L("　·　已召唤：", "　·　Draws: ") + formatWhole(player.oracle.draws)
                    }],
                    "master-button",
                    ["blank", "8px"],
                    ["display-text", function() { return L("当前祝福（同时生效槽位见里程碑）：", "Active blessings (slot count per milestones):") }],
                    ["display-text", function() {
                        let lines = []
                        for (let i = 0; i < 13; i++) {
                            if (player.oracle.neff1[i]) lines.push(BLESSINGS[i][0] + " ×" + format(player.oracle.ncalc1[i]) + " → " + BLESSINGS[i][1])
                        }
                        return lines.length ? lines.join("<br>") : L("（尚无祝福——去献祭！）", "(no blessings yet — go sacrifice!)")
                    }],
                ],
            },
            "Upgrades": { content: ["upgrades"] },
            "Milestones": { content: ["blank", "milestones"] },
        },
    },
    clickables: {
        masterButtonPress() { layers.oracle.summonBlessing() },
        masterButtonText() { return L("献祭 " + format(tmp.oracle.sacrificeCost) + " 素数，召唤祝福", "Sacrifice " + format(tmp.oracle.sacrificeCost) + " primes for a blessing") },
        showMasterButton() { return player.oracle.unlocked },
    },

    upgrades: {
        11: { title() { return L("先贤名录", "The roll call") }, description() { return L("孪生对速率 ×2。", "Twin rate ×2.") }, cost: new Decimal(1) },
        12: { title() { return L("欧几里得的灯", "Euclid's lamp") }, description() { return L("智慧获取按未动用的智慧加成。", "Wisdom gain is boosted by your unspent wisdom.") }, cost: new Decimal(5), unlocked() { return hasUpgrade("oracle", 11) },
             effect() { return player.oracle.points.add(1).pow(0.4) }, effectDisplay() { return format(this.effect()) + "x" } },
        13: { title() { return L("祭品精炼", "Refined offerings") }, description() { return L("献祭价格成长 ×0.9。", "Sacrifice cost growth ×0.9.") }, cost: new Decimal(25), unlocked() { return hasUpgrade("oracle", 12) } },
        14: { title() { return L("先贤的馈赠", "The masters' gifts") }, description() { return L("孪生对强化 Boss 伤害（同 pairs u33）。", "Twins boost Boss damage (as pairs u33).") }, cost: new Decimal(125), unlocked() { return hasUpgrade("oracle", 13) } },
        15: { title() { return L("群星低语", "Whispers of the stars") }, description() { return L("拆分获取 ×2。", "Split gain ×2.") }, cost: new Decimal(600), unlocked() { return hasUpgrade("oracle", 14) } },
        21: { title() { return L("高斯的emap", "Gauss's map") }, description() { return L("智慧获取按未动用的智慧再加成一次。", "Wisdom gain gains another unspent-wisdom bonus.") }, cost: new Decimal(3e3), unlocked() { return hasMilestone("oracle", 1) },
             effect() { return player.oracle.points.max(1).log10().add(1) }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title() { return L("黎曼的草稿", "Riemann's drafts") }, description() { return L("Boss 冷却 ×0.7。", "Boss cooldown ×0.7.") }, cost: new Decimal(1.5e4), unlocked() { return hasUpgrade("oracle", 21) } },
        23: { title() { return L("拉马努金之数", "Ramanujan's number") }, description() { return L("计数获取 ×3。", "Count gain ×3.") }, cost: new Decimal(8e4), unlocked() { return hasUpgrade("oracle", 22) } },
        24: { title() { return L("诺特的公理", "Noether's axioms") }, description() { return L("引理获取 ×2。", "Lemma gain ×2.") }, cost: new Decimal(4e5), unlocked() { return hasUpgrade("oracle", 23) } },
        25: { title() { return L("图灵的机器", "Turing's machine") }, description() { return L("数的获取 ×5。", "Number gain ×5.") }, cost: new Decimal(2e6), unlocked() { return hasUpgrade("oracle", 24) } },
        31: { title() { return L("希尔伯特旅馆", "Hilbert's hotel") }, description() { return L("间隔获取 ×3。", "Gap gain ×3.") }, cost: new Decimal(1e7), unlocked() { return hasUpgrade("oracle", 25) } },
        32: { title() { return L("先贤协力", "The pantheon cooperates") }, description() { return L("所有祝福槽位效果 ×1.5。", "All blessing slots ×1.5.") }, cost: new Decimal(5e7), unlocked() { return hasUpgrade("oracle", 31) } },
    },
})

// sacrifice cost growth ×0.9 with u13
TUNING.oracleSacrificeMult = function() { return hasUpgrade("oracle", 13) ? 0.9 : 1 }
