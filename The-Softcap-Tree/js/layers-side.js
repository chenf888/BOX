// ============================================================
// Side layer ac — Achievements (50, P13; count row on top per 10 §3.3.10;
// P11 backfill path with !has guards)
// ============================================================

addLayer("ac", {
    name() { return L("Achievements", "成就") },
    symbol: "A",
    startData() { return { unlocked: true, points: new Decimal(0) }},
    color: "#b0bec5",
    resource() { return L("achievements", "成就") },
    row: "side",
    tooltip() { return L("Achievements", "成就") },

    type: "none",
    achievementPopups: true,

    update(diff) {
        var diff = new Decimal(diff)
        if (!player[this.layer].unlocked) return
        // self-heal old saves: achievement 0 moved to 50 (grid row 0/col 0 unreachable) —
        // fixOldSave alone misses same-version saves
        var ach = player.ac.achievements || (player.ac.achievements = [])
        if (ach.includes(0) || ach.includes("0")) {
            player.ac.achievements = ach.filter(x => x !== 0 && x !== "0")
            if (!player.ac.achievements.includes(50) && !player.ac.achievements.includes("50")) player.ac.achievements.push(50)
        }
        // P11 achievement backfill — the alternate automation path, all !has-guarded
        if (hasAchievement("ac", 22) && !hasMilestone("pl", 0)) player.pl.milestones.push(0)
        if (hasAchievement("ac", 22) && !hasMilestone("th", 0)) player.th.milestones.push(0)
        if (hasAchievement("ac", 32) && !hasMilestone("tw", 1)) player.tw.milestones.push(1)
        if (hasAchievement("ac", 42) && !hasMilestone("in", 3)) player.in.milestones.push(3)
    },

    tabFormat: [
        ["display-text", function() {
            return L(
                "Achievements: " + player.ac.achievements.length + " / 50",
                "成就：" + player.ac.achievements.length + " / 50"
            )
        }],
        ["blank", "10px"],
        ["achievements", [0, 1, 2, 3, 4]], // rows incl. 0 — the stock grid loop starts at row 1
        ["blank", "20px"],
    ],

    achievements: {
        // explicit BOTH: setRowCol only honors presets when rows AND cols are set —
        // with ids 1-50 it computes cols=9 and every ×0 id (10/20/.../50) goes invisible
        rows: 5,
        cols: 10,
        1:  { name() { return L("First Concentration", "第一次凝聚") }, tooltip() { return L("Concentrate Force into Strain once.", "第一次把力凝聚为应变。") },
              done() { return player.st.total.gte(1) } },
        2:  { name() { return L("Tooling Up", "装备起来") }, tooltip() { return L("Buy 3 Strain upgrades.", "购买 3 个应变升级。") },
              done() { return player.st.upgrades.length >= 3 } },
        3:  { name() { return L("Megapascal", "兆帕") }, tooltip() { return L("Have 1e6 Force.", "拥有 1e6 力。") },
              done() { return player.points.gte(1e6) } },
        4:  { name() { return L("It Pays", "有工资") }, tooltip() { return L("Have 100 Stress.", "拥有 100 应力。") },
              done() { return player.st.stress.gte(100) } },
        5:  { name() { return L("Drawing the Line", "画下界线") }, tooltip() { return L("Unlock the Threshold layer.", "解锁阈值层。") },
              done() { return player.th.unlocked } },
        6:  { name() { return L("Code of Building", "建筑规范") }, tooltip() { return L("Reach 10 Thresholds.", "达到 10 阈值。") },
              done() { return player.th.best.gte(10) } },
        7:  { name() { return L("Left Support", "左支点") }, tooltip() { return L("Unlock the Pillar layer.", "解锁柱层。") },
              done() { return player.pl.unlocked } },
        8:  { name() { return L("Right Support", "右支点") }, tooltip() { return L("Unlock the Counterpillar layer.", "解锁反柱层。") },
              done() { return player.pt.unlocked } },
        9:  { name() { return L("Load-Bearing Wall", "承重墙") }, tooltip() { return L("Have 1e4 Strain.", "拥有 1e4 应变。") },
              done() { return player.st.points.gte(1e4) } },
        10: { name() { return L("Face the Wall", "直面时间墙") }, tooltip() { return L("Unlock the Time Wall.", "解锁时间墙。") },
              done() { return player.tw.unlocked } },
        11: { name() { return L("Breakthrough!", "突破！") }, tooltip() { return L("Earn 1 Breakthrough.<br>Reward: Force gain ×1.5", "获得 1 突破。<br>奖励：力获取 ×1.5") },
              done() { return player.tw.breakthroughs.gte(1) } },
        12: { name() { return L("Braced", "绷紧了") }, tooltip() { return L("Have 1,000 Stress.<br>Reward: Stress gain ×2", "拥有 1,000 应力。<br>奖励：应力获取 ×2") },
              done() { return player.st.stress.gte(1e3) } },
        13: { name() { return L("Well-Defined", "定义清晰") }, tooltip() { return L("Unlock Gravity.<br>Reward: Threshold gain ×2", "解锁引力层。<br>奖励：阈值获取 ×2") },
              done() { return player.gr.unlocked } },
        14: { name() { return L("Standing Together", "并肩而立") }, tooltip() { return L("Unlock Work Hardening.<br>Reward: Pillar gain ×2", "解锁加工硬化层。<br>奖励：柱获取 ×2") },
              done() { return player.in.unlocked } },
        15: { name() { return L("Mutual Strain", "互相较劲") }, tooltip() { return L("Have both Pillars past 1e3.<br>Reward: Counterpillar gain ×2", "柱与反柱均超过 1e3。<br>奖励：反柱获取 ×2") },
              done() { return player.pl.points.gte(1e3) && player.pt.points.gte(1e3) } },
        16: { name() { return L("Deeper Than Deep", "深不见底") }, tooltip() { return L("Unlock Recursion.<br>Reward: Leverage gain ×2", "解锁回套层。<br>奖励：杠杆获取 ×2") },
              done() { return player.nc.unlocked } },
        17: { name() { return L("Work-Hardened", "加工硬化") }, tooltip() { return L("Reach 1 Hardening.<br>Reward: Hardening gain ×2", "达到 1 硬化。<br>奖励：硬化获取 ×2") },
              done() { return player.in.harden[0].gte(1) } },
        18: { name() { return L("Down the Stairs", "往下挖") }, tooltip() { return L("Reach 5 Depth.", "达到 5 深度。") },
              done() { return player.nc.best.gte(5) } },
        19: { name() { return L("Ten Thousand Ceilings", "一万层天花板") }, tooltip() { return L("Have 1e8 Strain.", "拥有 1e8 应变。") },
              done() { return player.st.points.gte(1e8) } },
        20: { name() { return L("Nine Sliders, One Pool", "九个滑块一个池") }, tooltip() { return L("Unlock the Manifold.", "解锁调谐流形。") },
              done() { return player.mf.unlocked } },
        21: { name() { return L("Metrologist", "计量学家") }, tooltip() { return L("Reach 1e6 Thresholds.<br>Reward: Force gain ×2", "达到 1e6 阈值。<br>奖励：力获取 ×2") },
              done() { return player.th.best.gte(1e6) } },
        22: { name() { return L("Muscle Memory", "肌肉记忆") }, tooltip() { return L("Reach 1e5 Strain.<br>Reward: passive Strain generation; Thresholds & Pillars reset nothing (backfill).", "达到 1e5 应变。<br>奖励：被动应变生成；阈值与柱不再重置（回填）。") },
              done() { return player.st.best.gte(1e5) } },
        23: { name() { return L("Grand Central", "中央枢纽") }, tooltip() { return L("Unlock the Omni Valve.", "解锁总阀。") },
              done() { return player.ov.unlocked } },
        24: { name() { return L("Turn of the Screw", "拧动螺丝") }, tooltip() { return L("Earn 1 Valve.", "获得 1 阀门。") },
              done() { return player.ov.best.gte(1) } },
        25: { name() { return L("Plumbing", "管道工程") }, tooltip() { return L("Earn 5 Valves.", "获得 5 阀门。") },
              done() { return player.ov.best.gte(5) } },
        26: { name() { return L("Hydraulics", "液压学") }, tooltip() { return L("Earn 10 Valves.", "获得 10 阀门。") },
              done() { return player.ov.best.gte(10) } },
        27: { name() { return L("Pneumatics", "气动学") }, tooltip() { return L("Earn 15 Valves.", "获得 15 阀门。") },
              done() { return player.ov.best.gte(15) } },
        28: { name() { return L("Ceiling Broker", "天花板掮客") }, tooltip() { return L("Force wall cap ≥ 1e6.", "力之墙上限 ≥ 1e6。") },
              done() { return strainCap().gte(1e6) } },
        29: { name() { return L("Sky Is a Suggestion", "天空只是建议") }, tooltip() { return L("Force wall cap ≥ 1e10.<br>Reward: Force gain ×5", "力之墙上限 ≥ 1e10。<br>奖励：力获取 ×5") },
              done() { return strainCap().gte(1e10) } },
        30: { name() { return L("Torrent", "激流") }, tooltip() { return L("Force rate ≥ 1e6/s (effective).", "力速率（实际）≥ 1e6/秒。") },
              done() { return forceEffRate().gte(1e6) } },
        31: { name() { return L("Wall Street", "墙之街") }, tooltip() { return L("Have 1e12 Stress.<br>Reward: Force gain ×3; Tuning gain ×2", "拥有 1e12 应力。<br>奖励：力获取 ×3；调谐获取 ×2") },
              done() { return player.st.stress.gte(1e12) } },
        32: { name() { return L("Serial Breacher", "连环破墙者") }, tooltip() { return L("Earn 8 Breakthroughs.<br>Reward: Strain gain ×3; auto-Resonance backfill.", "获得 8 突破。<br>奖励：应变获取 ×3；自动共振回填。") },
              done() { return player.tw.breakthroughs.gte(8) } },
        33: { name() { return L("Zoning Board", "规划委员会") }, tooltip() { return L("Reach 1e6 Thresholds best.", "阈值 best 达到 1e6。") },
              done() { return player.th.best.gte(1e6) } },
        34: { name() { return L("Symmetry Break", "对称破缺") }, tooltip() { return L("Have one Pillar 10× past its wall start and the other below it.", "一根柱超出其墙起点 10 倍而另一根未及。") },
              done() { return player.pl.points.gte(plCapStart().times(10)) && player.pt.points.lt(ptCapStart()) } },
        35: { name() { return L("Patient Zero", "零号耐心") }, tooltip() { return L("Earn 10 Breakthroughs.", "获得 10 突破。") },
              done() { return player.tw.breakthroughs.gte(10) } },
        36: { name() { return L("Core Sample", "岩芯样本") }, tooltip() { return L("Reach 15 Depth.", "达到 15 深度。") },
              done() { return player.nc.best.gte(15) } },
        37: { name() { return L("Anvil Time", "铁砧时刻") }, tooltip() { return L("Total Hardening ≥ 1e3.", "总硬化 ≥ 1e3。") },
              done() { return player.in.harden[0].add(player.in.harden[1]).add(player.in.harden[2]).add(player.in.harden[3]).gte(1e3) } },
        38: { name() { return L("Crowbar", "撬棍") }, tooltip() { return L("Have 1e3 Leverage.", "拥有 1e3 杠杆。") },
              done() { return player.gr.best.gte(1e3) } },
        39: { name() { return L("Strain Theory", "应变理论") }, tooltip() { return L("Have 1e12 Strain.", "拥有 1e12 应变。") },
              done() { return player.st.points.gte(1e12) } },
        40: { name() { return L("The Crew", "工程队") }, tooltip() { return L("Automate the Strain layer fully (passive + auto-upgrade).", "完全自动化应变层（被动 + 自动升级）。") },
              done() { return hasMilestone("pl", 0) && hasMilestone("th", 2) } },
        41: { name() { return L("Full Automation", "全自动") }, tooltip() { return L("Reach 200 Leverage (row-1 auto-prestige).<br>Reward: Force gain ×5", "达到 200 杠杆（第一行自动声望）。<br>奖励：力获取 ×5") },
              done() { return player.gr.best.gte(200) } },
        42: { name() { return L("Deep Chant", "深层咏叹") }, tooltip() { return L("Reach 30 Depth.<br>Reward: auto-buy row-1 upgrades (backfill).", "达到 30 深度。<br>奖励：自动购买第一行升级（回填）。") },
              done() { return player.nc.best.gte(30) } },
        43: { name() { return L("Zero-Sum Artist", "零和艺术家") }, tooltip() { return L("Fill the tuning pool completely.", "完全用满调谐池。") },
              done() { return player.mf.unlocked && mfPoolUsed().gte(mfPoolMax()) } },
        44: { name() { return L("Structural Marvel", "结构奇迹") }, tooltip() { return L("Have 1e30 Force.", "拥有 1e30 力。") },
              done() { return player.points.gte(1e30) } },
        45: { name() { return L("Strained Beyond", "应变超限") }, tooltip() { return L("Have 1e16 Strain.", "拥有 1e16 应变。") },
              done() { return player.st.points.gte(1e16) } },
        46: { name() { return L("Halfway Open", "开到一半") }, tooltip() { return L("Reach the 8th valve milestone.", "达到第 8 个阀门里程碑。") },
              done() { return hasMilestone("ov", 7) } },
        47: { name() { return L("Overflow Events", "溢出事件") }, tooltip() { return L("Total overflow ≥ 1e3.", "总溢出 ≥ 1e3。") },
              done() { return totalOverflow().gte(1e3) } },
        48: { name() { return L("The Pressure Never Stops", "压力从不停歇") }, tooltip() { return L("Have 1e50 Force.", "拥有 1e50 力。") },
              done() { return player.points.gte(1e50) } },
        49: { name() { return L("The Master Valve", "总阀") }, tooltip() { return L("Open the Master Valve and finish the game.", "打开总阀，完成游戏。") },
              done() { return hasMilestone("ov", 11) } },
        50: { name() { return L("Under Pressure", "压力之下") }, tooltip() { return L("Have 100 Force.", "拥有 100 力。") },
              done() { return player.points.gte(100) } },
    },
})
