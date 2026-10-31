// ============================================================
// ROW 4 — zeta, the Riemann ζ Boss (M12, the ONLY boss layer).
// type "none" (the one sanctioned core-loop layer — Q4 contract).
// Each non-trivial zero is a segmented HP bar; pin it back to the
// critical line. 10 zeros = the Riemann Hypothesis = endgame.
// ============================================================
addLayer("zeta", {
    name: "Riemann Zeta",
    symbol: "ζ",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        zeros: new Decimal(0),     // zeros pinned (kill count)
        hp: new Decimal(TUNING.zetaHpBase),
        level: 0,                  // plain number
        lastAttack: 0,             // plain number (Date.now ms)
        dmgDealt: new Decimal(0),
    }},
    color: "#ff6b6b",
    resource() { return L("已钉零点", "zeros pinned") },
    row: 4,
    position: 0,
    branches: ["pairs", "oracle"],
    type: "none",

    // F28 — update() runs for locked layers too; this IS the unlock writer
    update(diff) {
        if (!player[this.layer].unlocked) {
            if (player.s.points.gte(TUNING.zetaUnlockPrimes)) player[this.layer].unlocked = true
            return
        }
        // K8 — each kill leaves prime residue behind (u22)
        if (hasUpgrade("zeta", 22)) {
            addPoints("s", player.zeta.zeros.max(1).log10().add(1).times(2).times(diff))
        }
    },

    cooldown() { return TUNING.zetaCd * (hasUpgrade("zeta", 12) ? TUNING.zetaCdUpgradeCut : 1) * (hasUpgrade("oracle", 22) ? 0.7 : 1) },

    dmgMult() {
        let m = new Decimal(1)
        if (hasUpgrade("zeta", 11)) m = m.times(2)
        if (hasUpgrade("zeta", 13)) m = m.times(2)
        if (hasUpgrade("zeta", 15)) m = m.times(3)
        if (hasUpgrade("zeta", 23)) m = m.times(5)
        if (hasUpgrade("zeta", 31)) m = m.times(5)
        if (hasMilestone("zeta", 0)) m = m.times(2)
        if (hasMilestone("zeta", 4)) m = m.times(2)
        if (hasMilestone("zeta", 8)) m = m.times(5)
        if (hasUpgrade("zeta", 25) && player.oracle.points.gte(1e4)) m = m.times(2)   // K6
        // twins reinforce the attack (pairs u33 / oracle u14)
        m = m.times(player.pairs.twins.max(1).pow(0.1))
        // outside consumer of pairs.b11 (N-BUYABLEDEAD): the telescope aims the attack
        m = m.times(buyableEffect("pairs", 11).pow(0.5))
        // Pantheon bus slot 2 (Riemann himself)
        if (player.oracle.neff1[2]) m = m.times(player.oracle.ncalc1[2])
        if (hasUpgrade("prob", 62)) m = m.times(2)   // "all gains" (damage side)
        return m
    },
    damage() {
        let d = new Decimal(TUNING.zetaDmgBase).times(player.s.points.max(1).pow(TUNING.zetaDmgPrimeExp)).times(this.dmgMult())
        if (hasUpgrade("zeta", 14)) d = d.times(player.s.points.max(1).pow(0.05))   // K2 extra pow
        if (hasUpgrade("zeta", 21)) d = d.times(player.oracle.points.max(1).log10().add(1))   // K3 wisdom
        // P19-style overflow softcap so the boss stays a fight
        let cap = new Decimal(TUNING.zetaDmgSoftcapStart)
        if (hasUpgrade("zeta", 24)) cap = cap.times(100)
        if (d.gte(cap)) d = d.pow(TUNING.zetaDmgSoftcapPow).times(cap.pow(1 - TUNING.zetaDmgSoftcapPow))
        return d
    },

    clickables: {
        11: {
            title() { return L("攻击", "ATTACK") },
            display() {
                return L("把零点钉回临界线<br>伤害：", "Pin the zero back<br>Damage: ") + format(tmp.zeta.damage) +
                    L("<br>冷却：", "<br>Cooldown: ") + formatWhole(tmp.zeta.cooldown) + "s"
            },
            canClick() {
                return player.zeta.unlocked && (Date.now() - player.zeta.lastAttack) >= tmp.zeta.cooldown * 1000
            },
            onClick() {
                let dmg = tmp.zeta.damage
                player.zeta.hp = player.zeta.hp.sub(dmg)
                player.zeta.dmgDealt = player.zeta.dmgDealt.add(dmg)
                player.zeta.lastAttack = Date.now()
                if (player.zeta.hp.lte(0)) {
                    player.zeta.zeros = player.zeta.zeros.add(1)
                    player.zeta.level = player.zeta.level + 1
                    player.zeta.hp = new Decimal(TUNING.zetaHpBase).times(Decimal.pow(TUNING.zetaHpGrowth, player.zeta.level))
                    doPopup(L("零点 #" + player.zeta.level + " 已钉回临界线！", "Zero #" + player.zeta.level + " pinned!"),
                        "", "#ff6b6b", "#ff6b6b", "#ff6b6b")
                }
            },
            style() { return this.canClick() ? {'background-color': '#5f1a1a', 'height': '90px'} : {'background-color': '#2a1a1a', 'height': '90px'} },
        },
    },

    bars: {
        zeroHp: {
            direction: RIGHT,
            width: 400, height: 40,
            progress() {
                let maxHp = new Decimal(TUNING.zetaHpBase).times(Decimal.pow(TUNING.zetaHpGrowth, player.zeta.level))
                return player.zeta.hp.div(maxHp).min(1).max(0).toNumber()
            },
            display() {
                return L("零点 #", "Zero #") + (player.zeta.level + 1) + L(" 剩余 HP：", " HP: ") + format(player.zeta.hp.max(0)) +
                    " / " + format(new Decimal(TUNING.zetaHpBase).times(Decimal.pow(TUNING.zetaHpGrowth, player.zeta.level)))
            },
            fillStyle: { 'background-color': "#ff6b6b" },
            baseStyle: { 'background-color': "#301414" },
        },
    },

    // the endgame chain — 10 zeros (Q8 classic: the last milestone chain)
    milestones: {
        0: { requirementDescription: L("钉回第 1 个零点", "Pin zero #1"),
             effectDescription() { return L("Boss 伤害 ×2；解锁 ζ 升级", "Boss damage ×2; unlock ζ upgrades") },
             done() { return player.zeta.zeros.gte(1) } },
        1: { requirementDescription: L("钉回第 2 个零点", "Pin zero #2"),
             effectDescription() { return L("π 层全自动（auto + 升级 + 不被清扫）", "π layer fully automated (auto + upgrades + keep)") },
             unlocked() { return hasMilestone("zeta", 0) },
             done() { return player.zeta.zeros.gte(2) } },
        2: { requirementDescription: L("钉回第 3 个零点", "Pin zero #3"),
             effectDescription() { return L("数的获取 ×5；Ω 层全自动", "Number gain ×5; Ω layer automated") },
             unlocked() { return hasMilestone("zeta", 1) },
             done() { return player.zeta.zeros.gte(3) } },
        3: { requirementDescription: L("钉回第 4 个零点", "Pin zero #4"),
             effectDescription() { return L("素数获取 ×10；间隔/引理全自动", "Prime gain ×10; gaps & lemmas automated") },
             unlocked() { return hasMilestone("zeta", 2) },
             done() { return player.zeta.zeros.gte(4) } },
        4: { requirementDescription: L("钉回第 5 个零点", "Pin zero #5"),
             effectDescription() { return L("行 1 全部获取 ×5；Boss 伤害 ×2", "All row-1 gains ×5; boss damage ×2") },
             unlocked() { return hasMilestone("zeta", 3) },
             done() { return player.zeta.zeros.gte(5) } },
        5: { requirementDescription: L("钉回第 6 个零点", "Pin zero #6"),
             effectDescription() { return L("数的获取 ×10；威尔逊层全自动", "Number gain ×10; Wilson automated") },
             unlocked() { return hasMilestone("zeta", 4) },
             done() { return player.zeta.zeros.gte(6) } },
        6: { requirementDescription: L("钉回第 7 个零点", "Pin zero #7"),
             effectDescription() { return L("素数对全自动；拆分 ×3", "Prime Pairs automated; splits ×3") },
             unlocked() { return hasMilestone("zeta", 5) },
             done() { return player.zeta.zeros.gte(7) } },
        7: { requirementDescription: L("钉回第 8 个零点", "Pin zero #8"),
             effectDescription() { return L("先贤祠全自动；智慧 ×3", "Pantheon automated; wisdom ×3") },
             unlocked() { return hasMilestone("zeta", 6) },
             done() { return player.zeta.zeros.gte(8) } },
        8: { requirementDescription: L("钉回第 9 个零点", "Pin zero #9"),
             effectDescription() { return L("Boss 伤害 ×5", "Boss damage ×5") },
             unlocked() { return hasMilestone("zeta", 7) },
             done() { return player.zeta.zeros.gte(9) } },
        9: { requirementDescription: L("钉回第 10 个零点", "Pin zero #10"),
             effectDescription() { return L("黎曼假设——得证。", "The Riemann Hypothesis — proved.") },
             unlocked() { return hasMilestone("zeta", 8) },
             done() { return player.zeta.zeros.gte(10) } },
    },

    layerShown() { return player.zeta.unlocked },

    tabFormat: [
        ["display-text", function() {
            return L("ζ(s) 的非平凡零点一个个逃出了临界线——把它们钉回去。", "The non-trivial zeros of ζ(s) are escaping the critical line — pin them back.") +
                L("<br>已钉回：<b style='color:#ff6b6b'>", "<br>Pinned: <b style='color:#ff6b6b'>") + formatWhole(player.zeta.zeros) + "</b>" +
                L("　·　累计伤害：", "　·　Total damage: ") + format(player.zeta.dmgDealt)
        }],
        ["bar", "zeroHp"],
        "clickables",
        ["blank", "8px"],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "Upgrades": { unlocked() { return hasMilestone("zeta", 0) }, content: [["raw-html", function() { return "<div style='opacity:.5'>" + L("每一分伤害都来自你全部的数论成果。", "Every point of damage comes from all your number theory.") + "</div>" }], "blank", "upgrades"] },
            "Milestones": { content: ["blank", "milestones"] },
        },
    },

    // upgrades paid in pinned zeros (a discrete endgame currency, F15: priced past the ladder)
    upgrades: {
        11: { title() { return L("临界线视野", "Critical line sight") }, description: L("Boss 伤害 ×2。", "Boss damage ×2."), cost: new Decimal(1) },
        12: { title() { return L("快攻姿态", "Quick stance") }, description: L("攻击冷却 ×0.5。", "Attack cooldown ×0.5."), cost: new Decimal(1), unlocked() { return hasUpgrade("zeta", 11) } },
        13: { title() { return L("函数方程", "The functional equation") }, description: L("Boss 伤害 ×2。", "Boss damage ×2."), cost: new Decimal(2), unlocked() { return hasUpgrade("zeta", 12) } },
        14: { title() { return L("素数之力", "The primes' force") }, description: L("Boss 伤害按素数^0.05 追加。", "Boss damage gains a primes^0.05 term."), cost: new Decimal(3), unlocked() { return hasUpgrade("zeta", 13) } },
        15: { title() { return L("黎曼-西格尔公式", "The Riemann–Siegel formula") }, description: L("Boss 伤害 ×3。", "Boss damage ×3."), cost: new Decimal(4), unlocked() { return hasUpgrade("zeta", 14) } },
        21: { title() { return L("先贤助阵", "The pantheon joins") }, description: L("Boss 伤害按智慧加成。", "Boss damage is boosted by your wisdom."), cost: new Decimal(5), unlocked() { return hasUpgrade("zeta", 15) },
             effect() { return player.oracle.points.max(1).log10().add(1) }, effectDisplay() { return format(this.effect()) + "x" } },
        22: { title() { return L("零点残响", "Zero residue") }, description: L("每秒产出少量素数（按已钉零点数）。", "Produces primes over time (scales with pinned zeros)."), cost: new Decimal(6), unlocked() { return hasUpgrade("zeta", 21) } },
        23: { title() { return L("哈代定理", "Hardy's theorem") }, description: L("Boss 伤害 ×5。", "Boss damage ×5."), cost: new Decimal(7), unlocked() { return hasUpgrade("zeta", 22) } },
        24: { title() { return L("超宽松软帽", "The loose overflow cap") }, description: L("伤害软帽起点 ×100。", "Damage softcap starts ×100 later."), cost: new Decimal(8), unlocked() { return hasUpgrade("zeta", 23) } },
        25: { title() { return L("智慧汇聚", "Wisdom converges") }, description: L("智慧 ≥ 1e4 时 Boss 伤害 ×2。", "While wisdom ≥ 1e4, boss damage ×2."), cost: new Decimal(9), unlocked() { return hasUpgrade("zeta", 24) } },
        31: { title() { return L("显式公式·完全体", "The explicit formula, complete") }, description: L("Boss 伤害 ×5。", "Boss damage ×5."), cost: new Decimal(9), unlocked() { return hasUpgrade("zeta", 25) } },
        32: { title() { return L("临界线全图", "The full critical line") }, description: L("统计页显示Boss战详情。", "The stats page shows full boss details."), cost: new Decimal(10), unlocked() { return hasUpgrade("zeta", 31) } },
    },
})
