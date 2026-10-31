// ============================================================
// ROW 0 — s, "The Sieve" (埃拉托斯特尼筛法)
// The anchor layer: every later layer must add at least one
// gainMult() line here (P10 / anti-pattern A7).
// ============================================================
addLayer("s", {
    name() { return L("筛子", "the Sieve") },
    symbol: "P",
    position: 0,
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#7fd4ff",
    resource() { return L("素数", "primes") },
    row: 0,

    baseResource: "numbers",
    baseAmount() { return player.points },
    requires: new Decimal(10),
    type: "normal",
    exponent: 0.5,

    // P12 — softcap starts where the next layer unlocks (250 primes), power 0.1
    // (measuredRetune shape). u14 raises it ×10; the cap is always visible (ctx line).
    softcap() {
        let cap = new Decimal(TUNING.sSoftcapStart)
        if (hasUpgrade("s", 14)) cap = cap.times(TUNING.sSoftcapRaise)
        if (hasUpgrade("s", 33)) cap = cap.times(100)
        if (hasUpgrade("lem", 31)) cap = cap.times(10)
        return cap
    },
    softcapPower() { return new Decimal(TUNING.sSoftcapPower) },

    gainMult() {
        let m = new Decimal(1)
        // own upgrades (each id consumed here exactly once — N-UNWIRED)
        if (hasUpgrade("s", 11)) m = m.times(2)                          // K1 "Cross out the evens"
        if (hasUpgrade("s", 12)) m = m.times(upgradeEffect("s", 12))     // K2 self-shape (the one self-scaler)
        if (hasUpgrade("s", 13)) m = m.times(upgradeEffect("s", 13))     // K3 counts
        if (hasUpgrade("s", 21)) m = m.times(3)                          // K1 "Twin pass"
        if (hasUpgrade("s", 23)) m = m.times(upgradeEffect("s", 23))     // K3 factors
        if (hasUpgrade("s", 31)) m = m.times(5)                          // K1
        if (hasUpgrade("s", 32)) m = m.times(upgradeEffect("s", 32))     // K3 gaps
        if (hasUpgrade("s", 34) && player.s.best.gte(1e6)) m = m.times(2) // K6 conditional
        if (hasMilestone("s", 0)) m = m.times(2)
        if (hasMilestone("s", 3)) m = m.times(3)
        // b11 — consumed here AND by pi (cross-layer consumer, N-BUYABLEDEAD)
        m = m.times(buyableEffect("s", 11))
        // later layers keep the sieve alive (P10 web)
        if (hasUpgrade("pi", 13)) m = m.times(2)
        if (hasUpgrade("fac", 13)) m = m.times(2)
        if (hasUpgrade("gap", 13)) m = m.times(2)
        if (hasMilestone("pi", 5)) m = m.times(2)
        m = m.times(buyableEffect("gap", 11))     // cross consumer of gap.b11
        m = m.times(buyableEffect("fac", 12))     // cross consumer of fac.b12
        if (hasUpgrade("pnt", 12)) m = m.times(3)
        if (hasUpgrade("wil", 12)) m = m.times(3)
        if (hasUpgrade("pairs", 12)) m = m.times(5)
        if (hasMilestone("zeta", 3)) m = m.times(10)
        // score-attack trial reward (M2)
        if (hasChallenge("prob", 21)) m = m.times(1.5)
        // u25 K6: trials make the sieve sing
        if (hasUpgrade("s", 25) && (inChallenge("prob", 11) || inChallenge("prob", 12) || inChallenge("prob", 21) || inChallenge("prob", 22))) m = m.times(3)
        // achievements
        if (hasAchievement("a", 12)) m = m.times(1.5)
        if (hasAchievement("a", 22)) m = m.times(2)
        // Pantheon bus slot 1 (Gauss)
        if (player.oracle.neff1[1]) m = m.times(player.oracle.ncalc1[1])
        // K4 lemma: the sieve formula itself grows stronger (named mechanic)
        if (hasUpgrade("lem", 11)) m = m.pow(1.05)
        // prob milestones & trial rewards
        if (hasMilestone("prob", 1)) m = m.times(2)
        if (hasMilestone("prob", 3)) m = m.times(3)
        if (hasMilestone("pnt", 1)) m = m.times(2)
        if (hasChallenge("prob", 21)) m = m.times(1.5)
        if (hasChallenge("prob", 22)) m = m.times(challengeEffect("prob", 22))
        if (hasUpgrade("prob", 12)) m = m.times(2)
        if (hasUpgrade("prob", 31)) m = m.times(2)
        if (hasUpgrade("prob", 43)) m = m.times(3)
        if (hasUpgrade("prob", 61)) m = m.times(upgradeEffect("prob", 61))
        if (hasUpgrade("prob", 62)) m = m.times(2)          // "all gains" (primes side)
        // M2 trial 11 handicap: the Odd Sieve
        if (inChallenge("prob", 11)) m = m.pow(0.8)
        return m
    },
    gainExp() { return new Decimal(1) },

    // Cost ladder: 1 → 1e12 (12 orders), deliberate key drop at u14 (500).
    // Kinds: K1 ×3 (20%), K2 ×1 (the self-scaler), K3 ×4, K5 ×2, K6 ×2, K7 ×3.
    upgrades: {
        11: {
            title() { return L("划掉偶数", "Cross out the evens") },
            description() { return L("素数获取 ×2。", "Prime gain ×2.") },
            cost: new Decimal(1),
        },
        12: {
            title() { return L("未花掉的素数更锋利", "Unspent primes sharpen the sieve") },
            description() { return L("素数获取按未动用的素数加成。", "Prime gain is boosted by your unspent primes.") },
            cost: new Decimal(3),
            unlocked() { return hasUpgrade("s", 11) },
            effect() { return player.s.points.add(1).pow(0.4) },   // the ONE self-scaler (softcapped by the layer cap)
            effectDisplay() { return format(this.effect()) + "x" },
        },
        13: {
            title() { return L("计数引导筛子", "Counts guide the sieve") },
            description() { return L("素数获取按素数计数（π）加成。", "Prime gain is boosted by your prime counts.") },
            cost: new Decimal(10),
            unlocked() { return hasUpgrade("s", 12) },
            effect() { return player.pi.points.max(1).log10().add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        14: {
            title() { return L("把筛网织密一档", "Weave the sieve tighter") },
            description() { return L("素数软帽起点 ×10。（软帽值始终显示在页面上方）", "Prime softcap starts ×10 later. (The cap is always displayed above.)") },
            cost: new Decimal(500),
            unlocked() { return hasUpgrade("s", 13) },
        },
        15: {
            title() { return L("架起五张滤网", "Raise the five filters") },
            description() { return L("解锁滤网组：点击运行单个素数的筛分（冷却爆发）。", "Unlock the filters: click to run a single prime's pass (cooldown burst).") },
            cost: new Decimal(5e3),
            unlocked() { return hasUpgrade("s", 14) },
        },
        21: {
            title() { return L("孪生通道", "The twin pass") },
            description() { return L("素数获取 ×3。", "Prime gain ×3.") },
            cost: new Decimal(2e4),
            unlocked() { return hasUpgrade("s", 15) },
        },
        22: {
            title() { return L("更密的滤布", "Finer mesh") },
            description() { return L("滤网爆发产量 ×1.5。", "Filter bursts grant ×1.5 more.") },
            cost: new Decimal(1e5),
            unlocked() { return hasUpgrade("s", 21) },
        },
        23: {
            title() { return L("因数回响", "Factor echo") },
            description() { return L("素数获取按因式分解层数量加成。", "Prime gain is boosted by your factors.") },
            cost: new Decimal(1e6),
            unlocked() { return hasUpgrade("s", 22) },
            effect() { return player.fac.points.max(1).log10().add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: {
            title() { return L("素数定理的直觉", "A PNT hunch") },
            description() { return L("数的获取按素数对数平方加成。", "Number gain is boosted by log²(primes).") },
            cost: new Decimal(1e7),
            unlocked() { return hasUpgrade("s", 23) },
            effect() { return player.s.points.max(1).log10().pow(2).add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        25: {
            title() { return L("试炼者的筛子", "The trialist's sieve") },
            description() { return L("试炼进行时素数获取 ×3。", "While a trial runs, prime gain ×3.") },
            cost: new Decimal(1e8),
            unlocked() { return hasUpgrade("s", 24) },
        },
        31: {
            title() { return L("分段筛鼓", "The segmented drum") },
            description() { return L("素数获取 ×5。", "Prime gain ×5.") },
            cost: new Decimal(1e9),
            unlocked() { return hasUpgrade("s", 25) },
        },
        32: {
            title() { return L("间隔嗅探器", "Gap sniffer") },
            description() { return L("素数获取按素数间隔层数量加成。", "Prime gain is boosted by your gaps.") },
            cost: new Decimal(5e9),
            unlocked() { return hasUpgrade("s", 31) },
            effect() { return player.gap.points.max(1).log10().add(1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        33: {
            title() { return L("工业级筛网", "Industrial mesh") },
            description() { return L("素数软帽起点再 ×100。", "Prime softcap starts ×100 later (on top of u14).") },
            cost: new Decimal(1e10),
            unlocked() { return hasUpgrade("s", 32) },
        },
        34: {
            title() { return L("百万素数纪念日", "The million-prime mark") },
            description() { return L("历史最高素数 ≥ 1e6 时素数获取 ×2。", "While your best primes ≥ 1e6, prime gain ×2.") },
            cost: new Decimal(1e11),
            unlocked() { return hasUpgrade("s", 33) },
        },
        35: {
            title() { return L("自动摇筛手", "The crank hand") },
            description() { return L("2-筛冷却完毕后自动运行。", "The 2-pass auto-runs when ready.") },
            cost: new Decimal(1e12),
            unlocked() { return hasUpgrade("s", 34) },
        },
    },

    // P28 — sieve filter bursts: run one prime's pass, instantly bank N seconds
    // of prime production. Manual forever: this click is the core verb.
    clickables: {
        11: {
            title() { return "2" },
            display() { return L("跑一遍 2-筛<br>+ " + TUNING.filterSeconds[11] + " 秒产量", "Run the 2-pass<br>+" + TUNING.filterSeconds[11] + "s of primes") },
            canClick() {
                if (!hasUpgrade("s", 15) || TUNING.filtersDisabled()) return false
                let cd = TUNING.filterCooldowns[11] * TUNING.filterMilestoneCut2()
                return (Date.now() - getClickableState(this.layer, this.id)) >= cd * 1000
            },
            onClick() {
                addPoints(this.layer, tmp.s.resetGain.max(1).times(TUNING.filterSeconds[11] * TUNING.filterPower()))
                player[this.layer].clickables[this.id] = Date.now()
            },
            style() { return this.canClick() ? {'background-color': '#1a4a5f'} : {'background-color': '#223'} },
        },
        12: {
            title() { return "3" },
            display() { return L("跑一遍 3-筛<br>+ " + TUNING.filterSeconds[12] + " 秒产量", "Run the 3-pass<br>+" + TUNING.filterSeconds[12] + "s of primes") },
            canClick() {
                if (!hasUpgrade("s", 15) || TUNING.filtersDisabled()) return false
                let cd = TUNING.filterCooldowns[12] * TUNING.filterMilestoneCut2()
                return (Date.now() - getClickableState(this.layer, this.id)) >= cd * 1000
            },
            onClick() {
                addPoints(this.layer, tmp.s.resetGain.max(1).times(TUNING.filterSeconds[12] * TUNING.filterPower()))
                player[this.layer].clickables[this.id] = Date.now()
            },
            style() { return this.canClick() ? {'background-color': '#1a4a5f'} : {'background-color': '#223'} },
        },
        13: {
            title() { return "5" },
            display() { return L("跑一遍 5-筛<br>+ " + TUNING.filterSeconds[13] + " 秒产量", "Run the 5-pass<br>+" + TUNING.filterSeconds[13] + "s of primes") },
            canClick() {
                if (!hasUpgrade("s", 15) || TUNING.filtersDisabled()) return false
                let cd = TUNING.filterCooldowns[13] * TUNING.filterMilestoneCut2()
                return (Date.now() - getClickableState(this.layer, this.id)) >= cd * 1000
            },
            onClick() {
                addPoints(this.layer, tmp.s.resetGain.max(1).times(TUNING.filterSeconds[13] * TUNING.filterPower()))
                player[this.layer].clickables[this.id] = Date.now()
            },
            style() { return this.canClick() ? {'background-color': '#1a4a5f'} : {'background-color': '#223'} },
        },
        14: {
            title() { return "7" },
            display() { return L("跑一遍 7-筛<br>+ " + TUNING.filterSeconds[14] + " 秒产量", "Run the 7-pass<br>+" + TUNING.filterSeconds[14] + "s of primes") },
            canClick() {
                if (!hasUpgrade("s", 15) || TUNING.filtersDisabled()) return false
                let cd = TUNING.filterCooldowns[14] * TUNING.filterMilestoneCut2()
                return (Date.now() - getClickableState(this.layer, this.id)) >= cd * 1000
            },
            onClick() {
                addPoints(this.layer, tmp.s.resetGain.max(1).times(TUNING.filterSeconds[14] * TUNING.filterPower()))
                player[this.layer].clickables[this.id] = Date.now()
            },
            style() { return this.canClick() ? {'background-color': '#1a4a5f'} : {'background-color': '#223'} },
        },
        15: {
            title() { return "11" },
            display() { return L("跑一遍 11-筛<br>+ " + TUNING.filterSeconds[15] + " 秒产量", "Run the 11-pass<br>+" + TUNING.filterSeconds[15] + "s of primes") },
            canClick() {
                if (!hasUpgrade("s", 15) || TUNING.filtersDisabled()) return false
                let cd = TUNING.filterCooldowns[15] * TUNING.filterMilestoneCut2()
                return (Date.now() - getClickableState(this.layer, this.id)) >= cd * 1000
            },
            onClick() {
                addPoints(this.layer, tmp.s.resetGain.max(1).times(TUNING.filterSeconds[15] * TUNING.filterPower()))
                player[this.layer].clickables[this.id] = Date.now()
            },
            style() { return this.canClick() ? {'background-color': '#1a4a5f'} : {'background-color': '#223'} },
        },
    },

    bars: {
        sieveFill: {
            direction: RIGHT,
            width: 300, height: 24,
            progress() { return player.points.max(1).log10().div(10).min(1).toNumber() },
            display() { return L("筛网 ", "Sieve: ") + format(player.points) + " " + L("数", "numbers") },
            fillStyle: { 'background-color': "#7fd4ff" },
            baseStyle: { 'background-color': "#223038" },
        },
    },

    hotkeys: [
        { key: "s", description() { return L("S: 筛分素数", "S: Sieve for primes") },
          onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],

    milestones: {
        0: { requirementDescription() { return L("拥有 25 素数（历史最高）", "Reach 25 primes (best)") },
             effectDescription() { return L("素数获取 ×2", "Prime gain ×2") },
             done() { return player.s.best.gte(25) } },
        1: { requirementDescription() { return L("拥有 100 素数", "Reach 100 primes") },
             effectDescription() { return L("滤网冷却 ×0.75", "Filter cooldowns ×0.75") },
             unlocked() { return hasMilestone("s", 0) },
             done() { return player.s.best.gte(100) } },
        2: { requirementDescription() { return L("拥有 1,000 素数", "Reach 1,000 primes") },
             effectDescription() { return L("素数获取 ×3", "Prime gain ×3") },
             unlocked() { return hasMilestone("s", 1) },
             done() { return player.s.best.gte(1000) } },
        3: { requirementDescription() { return L("拥有 10,000 素数", "Reach 10,000 primes") },
             effectDescription() { return L("解锁 buyable 12（筛网分辨率）", "Unlock buyable 12 (Sieve resolution)") },
             unlocked() { return hasMilestone("s", 2) },
             done() { return player.s.best.gte(1e4) } },
        4: { requirementDescription() { return L("拥有 1e5 素数", "Reach 1e5 primes") },
             effectDescription() { return L("行 1+ 重置不再清除筛层升级与里程碑", "Row-1+ resets keep sieve upgrades & milestones") },
             unlocked() { return hasMilestone("s", 3) },
             done() { return player.s.best.gte(1e5) } },
    },

    buyables: {
        11: {
            title() { return L("扩大筛程", "Extend the sieve range") },
            cost(x) { return new Decimal(10).times(Decimal.pow(2, x)) },   // next-level price
            effect(x) { return Decimal.pow(1.15, x) },                      // ln(1.15)/ln(2) = 0.20 « 1 (F13)
            display() {
                return L("素数获取 ×", "Prime gain ×") + format(buyableEffect(this.layer, this.id)) +
                    L("<br>已购: ", "<br>Bought: ") + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    L("<br>价格: ", "<br>Cost: ") + format(tmp[this.layer].buyables[this.id].cost) + " " + L("素数", "primes")
            },
            canAfford() { return player.s.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let cost = tmp[this.layer].buyables[this.id].cost
                player.s.points = player.s.points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                // P54 closed form: T(x) = 10(2^x − 1) total ⇒ target = log2(P/10 + 1)
                let cur = getBuyableAmount(this.layer, this.id)
                let target = player.s.points.div(10).add(1).log(2).floor()
                if (target.lte(cur)) return
                let delta = new Decimal(10).times(Decimal.pow(2, target).sub(Decimal.pow(2, cur)))
                player.s.points = player.s.points.sub(delta.max(0))
                setBuyableAmount(this.layer, this.id, target)
            },
        },
        12: {
            unlocked() { return hasMilestone("s", 3) },
            title() { return L("筛网分辨率", "Sieve resolution") },
            cost(x) { return new Decimal(1e3).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.3, x) },                       // ln(1.3)/ln(3) = 0.25 « 1
            display() {
                return L("数的获取 ×", "Number gain ×") + format(buyableEffect(this.layer, this.id)) +
                    L("<br>已购: ", "<br>Bought: ") + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    L("<br>价格: ", "<br>Cost: ") + format(tmp[this.layer].buyables[this.id].cost) + " " + L("素数", "primes")
            },
            canAfford() { return player.s.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player.s.points = player.s.points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },

    automate() {
        // P4 step 5 — autoBuyable(s.b11), closed-form inverse, granted by pnt.m4
        if (hasMilestone("pnt", 4)) layers.s.buyables[11].buyMax()
        // P28 automation endpoint — the crank hand (u35)
        if (hasUpgrade("s", 35) && layers.s.clickables[11].canClick()) layers.s.clickables[11].onClick()
    },

    // P4 ladder step 2 (pi.m2) + step 1 (pi.m0) + step 3 (fac.m1 / a.44)
    resetsNothing() { return hasMilestone("pi", 0) || hasMilestone("fac", 1) || hasAchievement("a", 44) },
    passiveGeneration() {
        if (!hasMilestone("pi", 2) && !hasAchievement("a", 44)) return 0
        return 1 * (hasMilestone("gap", 3) ? 2 : 1) * (hasUpgrade("prob", 21) ? 2 : 1)
    },
    autoPrestige() { return hasMilestone("fac", 1) && hasMilestone("pi", 0) },
    autoUpgrade() { return hasMilestone("pnt", 2) || hasAchievement("a", 64) },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = ["unlocked", "best", "total"]
            if (hasMilestone("s", 4)) { keep.push("upgrades"); keep.push("milestones") }
            layerDataReset(this.layer, keep)
        }
    },

    layerShown() { return true },

    tabFormat: [
        ["display-text", function() {
            return L("你有 ", "You have ") + "<h2 style='color:#7fd4ff;display:inline'>" + format(player.s.points) + "</h2> " + L("素数", "primes")
                + L("（最高 ", " (best ") + formatWhole(player.s.best) + L("）", ")")
        }],
        "prestige-button",
        ["display-text", function() {
            if (player.s.points.gte(new Decimal(TUNING.sSoftcapStart).times(hasUpgrade("s", 14) ? TUNING.sSoftcapRaise : 1).div(2)))
                return L("<span style='opacity:.7'>软帽始于 </span>", "<span style='opacity:.7'>Softcap starts at </span>") + format(tmp.s.softcap) + L(" 素数", " primes")
        }],
        ["bar", "sieveFill"],
        ["blank", "8px"],
        "clickables",
        ["blank", "8px"],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": {
                content: [["raw-html", function() { return "<div style='opacity:.5'>" + L("把合数划掉，剩下的就是素数。", "Cross out the composites. What remains is prime.") + "</div>" }], "blank", "upgrades"],
            },
            "Buyables": {
                unlocked() { return hasMilestone("s", 3) || getBuyableAmount("s", 11).gt(0) },
                content: ["buyables"],
            },
            "Milestones": {
                content: ["blank", "milestones"],
            },
        },
    },
})

// small helpers the clickables read (defined here so tuning stays the only literal home)
TUNING.filtersDisabled = function() { return inChallenge("prob", 21) }
TUNING.casinoPayMult = function() {
    let m = 1
    if (hasUpgrade("prob", 14)) m *= 1.1
    if (hasUpgrade("prob", 53)) m *= 1.25
    return m
}
TUNING.filterMilestoneCut2 = function() { return hasMilestone("s", 1) ? TUNING.filterMilestoneCut : 1 }
TUNING.filterPower = function() {
    let p = 1
    if (hasUpgrade("s", 22)) p *= 1.5
    if (hasUpgrade("lem", 21)) p *= 1.25
    return p
}
