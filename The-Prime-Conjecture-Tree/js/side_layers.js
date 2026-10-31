// ============================================================
// SIDE LAYERS — a (achievements 5×10, P13/P11) / story (chronicle,
// M15) / casino (Legendre luck economy, M14) / stats.
// Side layers are never auto-reset.
// ============================================================

// ------------------------------------------------------------
// a — Achievements (50 = 5 columns × 10 rows; count row on top per 10 §3.10)
// ------------------------------------------------------------
addLayer("a", {
    startData() { return { unlocked: true, points: new Decimal(0) } },
    color: "#f7d354",
    resource() { return L("定理成就", "theorem badges") },
    row: "side",
    symbol: "★",
    tooltip() { return L("成就", "Achievements") },
    achievementPopups: true,

    // P11 — backfill grants, always guarded (idempotence)
    update(diff) {
        if (hasAchievement("a", 34) && !hasMilestone("s", 1)) player.s.milestones.push(1)
        if (hasAchievement("a", 54) && !hasUpgrade("s", 11)) player.s.upgrades.push(11)
    },

    tabFormat: [
        ["display-text", function() {
            return "<h3 style='color:#f7d354'>" + player.a.achievements.length + " / 50</h3>"
        }],
        "achievements",
    ],

    achievements: {
        // row 1 — the sieve
        11: { name() { return L("第一次筛分", "First Sieve") }, done() { return player.s.total.gte(1) }, tooltip() { return L("完成第一次筛分。<br>奖励：数的获取 ×1.5", "Sieve once.<br>Reward: number gain ×1.5") } },
        12: { name() { return L("素数猎人", "Prime Hunter") }, done() { return player.s.best.gte(100) }, tooltip() { return L("历史最高 100 素数。<br>奖励：素数获取 ×1.5", "Best 100 primes.<br>Reward: prime gain ×1.5") } },
        13: { name() { return L("千素俱乐部", "The 1,000 Club") }, done() { return player.s.best.gte(1000) }, tooltip() { return L("历史最高 1,000 素数。", "Best 1,000 primes.") } },
        14: { name() { return L("滤网大师", "Filter Master") }, done() { return hasUpgrade("s", 15) }, tooltip() { return L("架起全部五张滤网。", "Raise all five filters.") } },
        15: { name() { return L("百万筛程", "Million Sieve") }, done() { return player.s.best.gte(1e6) }, tooltip() { return L("历史最高 1e6 素数。", "Best 1e6 primes.") } },
        // row 2 — row 1 layers
        21: { name() { return L("计数员", "The Tally Clerk") }, done() { return player.pi.best.gte(1000) }, tooltip() { return L("历史最高 1,000 计数。<br>奖励：数的获取 ×2", "Best 1,000 counts.<br>Reward: number gain ×2") } },
        22: { name() { return L("素数充盈", "Prime Surplus") }, done() { return player.s.best.gte(5000) }, tooltip() { return L("历史最高 5,000 素数。<br>奖励：素数获取 ×2", "Best 5,000 primes.<br>Reward: prime gain ×2") } },
        23: { name() { return L("分解万物", "Factor Everything") }, done() { return player.fac.best.gte(1000) }, tooltip() { return L("历史最高 1,000 因数。", "Best 1,000 factors.") } },
        24: { name() { return L("间隔测量员", "Gap Surveyor") }, done() { return player.gap.best.gte(1000) }, tooltip() { return L("历史最高 1,000 间隔。", "Best 1,000 gaps.") } },
        25: { name() { return L("引理收藏家", "Lemma Collector") }, done() { return player.lem.best.gte(500) }, tooltip() { return L("历史最高 500 引理。", "Best 500 lemmas.") } },
        // row 3 — deeper row 1
        31: { name() { return L("自动化工厂", "The Automation Floor") }, done() { return hasMilestone("fac", 1) }, tooltip() { return L("解锁自动筛分。", "Unlock auto-sieving.") } },
        32: { name() { return L("Ω 大亨", "Ω Tycoon") }, done() { return player.fac.omega.gte(1000) }, tooltip() { return L("持有 1,000 Ω。", "Hold 1,000 Ω.") } },
        33: { name() { return L("定理在望", "Theorems in Sight") }, done() { return player.pi.best.gte(1e5) }, tooltip() { return L("历史最高 1e5 计数。", "Best 1e5 counts.") } },
        34: { name() { return L("老玩家回归", "The Veteran's Return") }, done() { return player.s.best.gte(1e4) }, tooltip() { return L("历史最高 1e4 素数。<br>奖励：免费获得筛层里程碑 1（滤网冷却 ×0.75）", "Best 1e4 primes.<br>Reward: free sieve milestone 1 (filter cooldowns ×0.75)") } },
        35: { name() { return L("五路并进", "Five Ways Forward") }, done() { return player.pi.unlocked && player.fac.unlocked && player.gap.unlocked && player.lem.unlocked }, tooltip() { return L("解锁全部四个行 1 分支。", "Unlock all four row-1 branches.") } },
        // row 4 — row 2
        41: { name() { return L("素数定理！", "The PNT!") }, done() { return player.pnt.best.gte(1) }, tooltip() { return L("证明第一条素数定理。<br>奖励：数的获取 ×2", "Prove your first theorem.<br>Reward: number gain ×2") } },
        42: { name() { return L("威尔逊余项", "Wilson's Remainder") }, done() { return player.wil.best.gte(1) }, tooltip() { return L("积累第一个威尔逊商。", "Bank your first Wilson quotient.") } },
        43: { name() { return L("问题般手", "The Problem Novice") }, done() { return challengeCompletions("prob", 11) >= 1 }, tooltip() { return L("完成一次「奇数之筛」。", "Complete the Odd Sieve once.") } },
        44: { name() { return L("百题斩", "Trial Cracker") }, done() { return challengeCompletions("prob", 11) + challengeCompletions("prob", 12) + challengeCompletions("prob", 21) + challengeCompletions("prob", 22) >= 8 }, tooltip() { return L("完成任意 8 次试炼。<br>奖励：素数随时间滴流（备路）", "Complete 8 trials.<br>Reward: prime trickle (alternate path)") } },
        45: { name() { return L("定理百条", "A Hundred Theorems") }, done() { return player.pnt.best.gte(100) }, tooltip() { return L("历史最高 100 定理。", "Best 100 theorems.") } },
        // row 5 — row 3 approach
        51: { name() { return L("未决问题常客", "Open Problems Regular") }, done() { return player.prob.unlocked }, tooltip() { return L("走进未决问题馆。", "Enter the Open Problems hall.") } },
        52: { name() { return L("哥德巴赫的桌边", "At Goldbach's Table") }, done() { return player.pairs.unlocked }, tooltip() { return L("解锁素数对层。", "Unlock the Prime Pairs layer.") } },
        53: { name() { return L("百拆纪念", "The 100-Split Mark") }, done() { return player.pairs.best.gte(100) }, tooltip() { return L("历史最高 100 拆分。", "Best 100 splits.") } },
        54: { name() { return L("出厂设置", "Factory Settings") }, done() { return player.pairs.best.gte(10) }, tooltip() { return L("历史最高 10 拆分。<br>奖励：免费获得「划掉偶数」", "Best 10 splits.<br>Reward: free 'Cross out the evens'") } },
        55: { name() { return L("先贤门前", "Before the Pantheon") }, done() { return player.oracle.unlocked }, tooltip() { return L("解锁先贤祠。", "Unlock the Pantheon.") } },
        // row 6 — pantheon & luck
        61: { name() { return L("第一次献祭", "First Offering") }, done() { return player.oracle.draws.gte(1) }, tooltip() { return L("完成第一次献祭。", "Make your first sacrifice.") } },
        62: { name() { return L("欧拉在侧", "Euler at Your Side") }, done() { return player.oracle.neff1[0] }, tooltip() { return L("召唤欧拉的祝福。", "Summon Euler's blessing.") } },
        63: { name() { return L("贤者满堂", "A Full Pantheon") }, done() { return player.oracle.neff1.filter(Boolean).length >= 5 }, tooltip() { return L("同时持有 5 个祝福槽位。", "Hold 5 blessing slots.") } },
        64: { name() { return L("掷币者", "The Coin Flipper") }, done() { return player.casino.flips.gte(10) }, tooltip() { return L("掷币 10 次。<br>奖励：自动购买筛层升级（备路）", "Flip 10 times.<br>Reward: auto-buy sieve upgrades (alternate path)") } },
        65: { name() { return L("幸运儿", "The Lucky One") }, done() { return player.casino.wins.gte(10) }, tooltip() { return L("赢 10 局。", "Win 10 games.") } },
        // row 7 — the boss approaches
        71: { name() { return L("临界线在望", "The Critical Line Awaits") }, done() { return player.zeta.unlocked }, tooltip() { return L("解锁 ζ 层。", "Unlock the ζ layer.") } },
        72: { name() { return L("第一滴血", "First Blood") }, done() { return player.zeta.zeros.gte(1) }, tooltip() { return L("钉回第一个零点。<br>奖励：数的获取 ×3", "Pin zero #1.<br>Reward: number gain ×3") } },
        73: { name() { return L("零点收藏家", "Zero Collector") }, done() { return player.zeta.zeros.gte(3) }, tooltip() { return L("钉回 3 个零点。", "Pin 3 zeros.") } },
        74: { name() { return L("孪生满仓", "Twin Stockpile") }, done() { return player.pairs.twins.gte(200) }, tooltip() { return L("持有 200 孪生对。", "Hold 200 twin pairs.") } },
        75: { name() { return L("推理十连胜", "Deduction x10") }, done() { return player.pairs.mgStreak >= 10 }, tooltip() { return L("推理小游戏连对 10 次。", "Streak 10 in the deduction minigame.") } },
        // row 8 — late content
        81: { name() { return L("引理图书馆", "The Lemma Library") }, done() { return player.lem.upgrades.length >= 12 }, tooltip() { return L("买下全部引理。", "Buy every lemma.") } },
        82: { name() { return L("未决问题大师", "Open Problems Master") }, done() { return challengeCompletions("prob", 11) + challengeCompletions("prob", 12) + challengeCompletions("prob", 21) + challengeCompletions("prob", 22) >= 16 }, tooltip() { return L("完成全部 16 次试炼。", "Complete all 16 trials.") } },
        83: { name() { return L("万物皆数", "All Is Number") }, done() { return player.points.gte(1e30) }, tooltip() { return L("持有 1e30 数。", "Hold 1e30 numbers.") } },
        84: { name() { return L("全升级党", "The Completionist") }, done() { return player.s.upgrades.length >= 15 }, tooltip() { return L("买下全部筛层升级。", "Buy every sieve upgrade.") } },
        85: { name() { return L("智慧如海", "An Ocean of Wisdom") }, done() { return player.oracle.best.gte(1e4) }, tooltip() { return L("历史最高 1e4 智慧。", "Best 1e4 wisdom.") } },
        // row 9 — endgame
        91: { name() { return L("半程", "Halfway There") }, done() { return player.zeta.zeros.gte(5) }, tooltip() { return L("钉回 5 个零点。", "Pin 5 zeros.") } },
        92: { name() { return L("显式公式", "The Explicit Formula") }, done() { return hasUpgrade("prob", 61) }, tooltip() { return L("买下「显式公式」。", "Buy the Explicit Formula.") } },
        93: { name() { return L("黎曼之影", "Riemann's Shadow") }, done() { return player.zeta.zeros.gte(8) }, tooltip() { return L("钉回 8 个零点。", "Pin 8 zeros.") } },
        94: { name() { return L("临界线上", "On the Line") }, done() { return player.zeta.zeros.gte(9) }, tooltip() { return L("钉回 9 个零点。", "Pin 9 zeros.") } },
        95: { name() { return L("黎曼假设", "The Riemann Hypothesis") }, done() { return player.zeta.zeros.gte(10) }, tooltip() { return L("钉回全部 10 个零点。<br>你证明了它。", "Pin all 10 zeros.<br>You proved it.") } },
        // row 10 — flavor & extremes
        101: { name() { return L("手不离筛", "Never Stop Sieving") }, done() { return player.s.total.gte(1e6) }, tooltip() { return L("累计筛出 1e6 素数。", "Sieve 1e6 primes in total.") } },
        102: { name() { return L("十亿美元问题", "The Million-Dollar Problem") }, done() { return player.oracle.neff1.filter(Boolean).length >= 13 }, tooltip() { return L("点亮全部 13 个祝福槽位。", "Light up all 13 blessing slots.") } },
        103: { name() { return L("赌圣", "The Gambler Saint") }, done() { return player.casino.flips.gte(100) }, tooltip() { return L("掷币 100 次。愿概率站在你这边。", "Flip 100 times. May the odds be with you.") } },
        104: { name() { return L("数论史学者", "The Historian") }, done() { return player.story.unlockedChapters >= 8 }, tooltip() { return L("解锁 8 章编年史。", "Unlock 8 chronicle chapters.") } },
        105: { name() { return L("推理素树", "The Prime Conjecture") }, done() { return player.zeta.milestones.length >= 10 }, tooltip() { return L("通关。谢谢游玩！", "Beat the game. Thank you for playing!") } },
    },
})

// ------------------------------------------------------------
// story — the chronicle (M15): 10 unlock-gated chapters
// ------------------------------------------------------------
const STORY_CHAPTERS = [
    [function() { return player.s.total.gte(1) },
     function() { return L("第一章 · 欧几里得（约 BC 300）：素数有无穷多个——这个证明 itself 就是一件艺术品。", "Chapter 1 · Euclid (~300 BC): there are infinitely many primes — and the proof itself is a work of art.") },
     "ch1"],
    [function() { return player.s.unlocked && player.s.best.gte(25) },
     function() { return L("第二章 · 埃拉托斯特尼（约 BC 240）：他的筛子至今仍是你最快的工具。", "Chapter 2 · Eratosthenes (~240 BC): his sieve is still your fastest tool.") },
     "ch2"],
    [function() { return player.pi.unlocked },
     function() { return L("第三章 · 高斯（1792–）：十五岁的高斯盯上了素数表——π(x) ≈ x/ln x。", "Chapter 3 · Gauss (1792–): at fifteen he stared at prime tables — π(x) ≈ x/ln x.") },
     "ch3"],
    [function() { return player.fac.unlocked },
     function() { return L("第四章 · 算术基本定理：每个整数的素数分解都是唯一的。数学有了原子。", "Chapter 4 · FTA: every integer factors uniquely. Mathematics has atoms.") },
     "ch4"],
    [function() { return player.pnt.unlocked },
     function() { return L("第五章 · 1896：阿达马与瓦莱·普桑证明了素数定理——用 ζ 函数。", "Chapter 5 · 1896: Hadamard & de la Vallée Poussin prove the PNT — with ζ.") },
     "ch5"],
    [function() { return player.prob.unlocked },
     function() { return L("第六章 · 朗道的四个问题（1912）：哥德巴赫、孪生素数、勒让德、n²+1。全都还没被解决。", "Chapter 6 · Landau's problems (1912): Goldbach, twins, Legendre, n²+1. All still open.") },
     "ch6"],
    [function() { return player.pairs.unlocked },
     function() { return L("第七章 · 1742：哥德巴赫给欧拉写信。三百年来，没人能回答。", "Chapter 7 · 1742: Goldbach writes to Euler. For three centuries, nobody could answer.") },
     "ch7"],
    [function() { return player.oracle.unlocked },
     function() { return L("第八章 · 先贤祠：欧拉、高斯、黎曼……他们的祝福仍在公式里流动。", "Chapter 8 · The Pantheon: Euler, Gauss, Riemann… their blessings still flow through the formulas.") },
     "ch8"],
    [function() { return player.zeta.unlocked },
     function() { return L("第九章 · 1859：黎曼的八页论文。零点的分布，就是素数的秘密。", "Chapter 9 · 1859: Riemann's eight pages. The zeros' distribution IS the primes' secret.") },
     "ch9"],
    [function() { return player.zeta.zeros.gte(1) },
     function() { return L("第十章 · 现在：你把第一个零点钉回了临界线。剩下九个，就是黎曼假设本身。", "Chapter 10 · Now: you pinned the first zero back. The remaining nine are the Hypothesis itself.") },
     "ch10"],
]

addLayer("story", {
    startData() { return { unlocked: false, points: new Decimal(0), unlockedChapters: 0 } },
    color: "#d4bfff",
    resource() { return L("编年史", "chronicle") },
    row: "side",
    symbol: "✦",
    tooltip() { return L("数论编年史", "A Chronicle of Number Theory") },
    tooltipLocked() { return L("数论编年史——拥有 100 个数后翻开。", "A Chronicle of Number Theory — opens at 100 numbers.") },
    type: "none",

    update(diff) {
        if (!player[this.layer].unlocked && player.points.gte(TUNING.storyUnlock)) player[this.layer].unlocked = true
        let n = 0
        for (let i = 0; i < STORY_CHAPTERS.length; i++) if (STORY_CHAPTERS[i][0]()) n++
        player.story.unlockedChapters = n
    },

    tabFormat: [
        ["display-text", function() { return "<h3 style='color:#d4bfff'>" + L("数论编年史 · ", "A Chronicle of Number Theory · ") + player.story.unlockedChapters + "/10</h3>" }],
        ["display-text", function() {
            let lines = []
            for (let i = 0; i < STORY_CHAPTERS.length; i++) {
                if (STORY_CHAPTERS[i][0]()) lines.push(STORY_CHAPTERS[i][1]())
                else lines.push("<span style='opacity:.35'>" + L("第 " + (i + 1) + " 章尚未解锁……", "Chapter " + (i + 1) + " remains sealed…") + "</span>")
            }
            return lines.join("<br><br>")
        }],
    ],
})

// ------------------------------------------------------------
// casino — the Legendre Luck Economy (M14, 2 of 4 distributions:
// coin flip = the Legendre symbol ±1; dice = residue classes)
// ------------------------------------------------------------
addLayer("casino", {
    startData() { return { unlocked: false, points: new Decimal(0), flips: new Decimal(0), wins: new Decimal(0) } },
    color: "#7fffd4",
    resource() { return L("赌局", "games played") },
    row: "side",
    symbol: "🎲",
    tooltip() { return L("勒让德赌局", "The Legendre Casino") },
    tooltipLocked() { return L("勒让德赌局——拥有 1e6 个数后开门。", "The Legendre Casino — opens at 1e6 numbers.") },
    type: "none",

    update(diff) {
        if (!player[this.layer].unlocked && player.points.gte(TUNING.casinoUnlock)) player[this.layer].unlocked = true
    },

    clickables: {
        11: {
            title() { return L("掷币", "FLIP") },
            display() {
                return L("勒让德符号赌局<br>押上 10% 的数，正面 ×", "The Legendre coin<br>Stake 10% of your numbers; heads pays ×") +
                    format(TUNING.casinoCoinPay * TUNING.casinoPayMult()) +
                    L("<br>冷却 3s", "<br>Cooldown 3s")
            },
            canClick() { return player.casino.unlocked && (Date.now() - getClickableState(this.layer, this.id)) >= TUNING.casinoCooldown * 1000 },
            onClick() {
                let stake = player.points.times(TUNING.casinoBetShare)
                if (stake.lte(0)) return
                player.points = player.points.sub(stake)
                player.casino.flips = player.casino.flips.add(1)
                if (Math.random() < 0.5) {
                    let payout = stake.times(TUNING.casinoCoinPay * TUNING.casinoPayMult()).min(TUNING.casinoWinCap)
                    player.points = player.points.add(payout)
                    player.casino.wins = player.casino.wins.add(1)
                    doPopup("+" + format(payout), "", "#7fffd4", "#7fffd4", "#7fffd4")
                }
                player[this.layer].clickables[this.id] = Date.now()
            },
        },
        12: {
            title() { return L("骰子", "DICE") },
            display() {
                return L("同余骰子<br>押上 10% 的数，掷出 6 支付 ×", "The residue die<br>Stake 10%; a 6 pays ×") +
                    format(TUNING.casinoDicePay * TUNING.casinoPayMult()) +
                    L("<br>冷却 3s", "<br>Cooldown 3s")
            },
            canClick() { return player.casino.unlocked && (Date.now() - getClickableState(this.layer, this.id)) >= TUNING.casinoCooldown * 1000 },
            onClick() {
                let stake = player.points.times(TUNING.casinoBetShare)
                if (stake.lte(0)) return
                player.points = player.points.sub(stake)
                player.casino.flips = player.casino.flips.add(1)
                let roll = 1 + Math.floor(Math.random() * 6)
                if (roll === 6) {
                    let payout = stake.times(TUNING.casinoDicePay * TUNING.casinoPayMult()).min(TUNING.casinoWinCap)
                    player.points = player.points.add(payout)
                    player.casino.wins = player.casino.wins.add(1)
                    doPopup("6! +" + format(payout), "", "#7fffd4", "#7fffd4", "#7fffd4")
                }
                player[this.layer].clickables[this.id] = Date.now()
            },
        },
    },

    tabFormat: [
        ["display-text", function() {
            return L("素数的分布本身就是一个概率论对象（克拉默模型）。用一点运气换一点进度。", "The primes' distribution is a probability object (the Cramér model). Trade a little luck for a little progress.")
        }],
        ["display-text", function() {
            return L("已玩：", "Played: ") + formatWhole(player.casino.flips) + L("　·　胜局：", "　·　Wins: ") + formatWhole(player.casino.wins)
        }],
        "clickables",
    ],
})

// ------------------------------------------------------------
// stats — pure readouts (F10: lifetime totals tracked by hand via .total/.best)
// ------------------------------------------------------------
addLayer("stats", {
    startData() { return { unlocked: true, points: new Decimal(0) } },
    color: "#cfcfcf",
    resource() { return "stats" },
    row: "side",
    symbol: "≡",
    tooltip() { return L("统计", "Statistics") },
    type: "none",
    tabFormat: [
        ["display-text", function() {
            return L("历史最高素数：", "Best primes: ") + formatWhole(player.s.best) + "<br>" +
                L("累计筛出素数：", "Total primes sieved: ") + formatWhole(player.s.total) + "<br>" +
                L("历史最高计数：", "Best counts: ") + formatWhole(player.pi.best) + "<br>" +
                L("历史最高因数：", "Best factors: ") + formatWhole(player.fac.best) + "<br>" +
                L("历史最高间隔：", "Best gaps: ") + formatWhole(player.gap.best) + "<br>" +
                L("历史最高引理：", "Best lemmas: ") + formatWhole(player.lem.best) + "<br>" +
                L("定理证明数：", "Theorems proven: ") + formatWhole(player.pnt.best) + "<br>" +
                L("威尔逊商：", "Wilson quotients: ") + formatWhole(player.wil.best) + "<br>" +
                L("历史最高拆分：", "Best splits: ") + formatWhole(player.pairs.best) + "<br>" +
                L("孪生对：", "Twin pairs: ") + formatWhole(player.pairs.twins) + " / " + formatWhole(tmp.pairs ? tmp.pairs.twinCap : new Decimal(205)) + "<br>" +
                L("已召唤祝福：", "Blessings drawn: ") + formatWhole(player.oracle.draws) + "<br>" +
                L("已钉零点：", "Zeros pinned: ") + formatWhole(player.zeta.zeros) + " / 10"
        }],
    ],
})
