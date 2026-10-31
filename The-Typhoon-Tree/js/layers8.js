// ============================================================================
// The Typhoon Tree — js/layers8.js (side layers: ach, story, cas)
// ach   — 气象观测站 Observatory: 50 achievements in a sparse 10x9 grid
//         (ids match the reward tables in tuning.js achMults — V/A/C arrays
//         are the runtime authority; 3 guarded backfills in update, P11).
// story — 台风日记 Storm Diary: 10 chapters, unlock-gated (M15).
// cas   — 路径赌局 Forecast Odds (M14, two distributions): path dice (2d6
//         product payout, independent softcap) + intensity coin (streak,
//         symmetric softcap). Bets stake latent heat; forecastXP feeds
//         forecastMult() and streak feeds streakCloudMult() (tuning.js).
// ============================================================================

// ---------------------------------------------------------------------------
// ach
// ---------------------------------------------------------------------------
addLayer("ach", {
    name() { return L("Observatory", "气象观测站") },
    symbol: "★",
    position: 0,
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "#FDFEFE",
    row: "side",

    type: "none",

    // P11 guarded backfills: three achievements whose conditions involve
    // records that pre-date the check order (save migration / tick races).
    // done() below stays authoritative; these only catch what it misses.
    update(diff) {
        if (!player.ach || !player.ach.achievements) return
        if (!hasAchievement("ach", 26) && player.land && player.land.maxWind.gte(51)) player.ach.achievements.push(26)
        if (!hasAchievement("ach", 88) && player.eyew && player.eyew.cycles.gte(50)) player.ach.achievements.push(88)
        if (!hasAchievement("ach", 105) && player.mon && hasMilestone("mon", 1)) player.ach.achievements.push(105)
        if (!hasAchievement("ach", 105) && hasUpgrade("evap", 21) && !player.ach.achievements.includes(105)) player.ach.achievements.push(105)
    },

    layerShown() { return true },
    tooltip() { return L("Observatory", "气象观测站") },

    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#FDFEFE'>" + player.ach.achievements.length + " / 50 "
                + L("observations logged", "条观测记录") + "</h2>"
        }],
        ["blank", "10px"],
        "achievements",
        ["blank", "65px"],
    ],

    achievements: {
        rows: 10,
        cols: 9,
        // --- vapor family (V reward table in tuning.js) ---
        11: { name() { return L("First Drizzle", "第一场毛毛雨") },
              tooltip() { return L("Reach 100 water vapor.", "水汽达到 100。") },
              done() { return player.points.gte(100) } },
        12: { name() { return L("Fuel Reserve", "燃料储备") },
              tooltip() { return L("Reach 100 best latent heat.", "最佳潜热达到 100。") },
              done() { return player.evap.best.gte(100) } },
        13: { name() { return L("Cloud Street", "云街") },
              tooltip() { return L("Reach 10 cloud mass.", "云团达到 10。") },
              done() { return player.conv.best.gte(10) } },
        14: { name() { return L("Sea Fog", "海雾") },
              tooltip() { return L("Reach 1e4 water vapor.", "水汽达到 1e4。") },
              done() { return player.points.gte("1e4") } },
        17: { name() { return L("Deep Moisture", "深厚湿层") },
              tooltip() { return L("Reach 1e3 best latent heat.", "最佳潜热达到 1e3。") },
              done() { return player.evap.best.gte("1e3") } },
        18: { name() { return L("Fuel Tank", "燃料罐") },
              tooltip() { return L("Reach 1e4 best latent heat.", "最佳潜热达到 1e4。") },
              done() { return player.evap.best.gte("1e4") } },
        21: { name() { return L("Cumulus", "积云") },
              tooltip() { return L("Reach 100 cloud mass.", "云团达到 100。") },
              done() { return player.conv.best.gte(100) } },
        22: { name() { return L("Warm Rain", "暖雨") },
              tooltip() { return L("Reach 1e7 water vapor.", "水汽达到 1e7。") },
              done() { return player.points.gte("1e7") } },
        24: { name() { return L("Boiling Sea", "沸腾的海") },
              tooltip() { return L("Reach 1e6 best latent heat.", "最佳潜热达到 1e6。") },
              done() { return player.evap.best.gte("1e6") } },
        26: { name() { return L("Remembered Wind", "被记住的风") },
              tooltip() { return L("Make a landfall at 51 m/s or stronger.", "以 51 m/s 以上的风速完成一次登陆。") },
              done() { return player.land && player.land.maxWind.gte(51) } },
        28: { name() { return L("Saturated Air", "饱和空气") },
              tooltip() { return L("Hold 1e3 in the monsoon tank.", "季风水箱存到 1e3。") },
              done() { return player.mon && player.mon.tank.gte("1e3") } },
        31: { name() { return L("Pressure Gradient", "气压梯度") },
              tooltip() { return L("Reach 1e8 best latent heat.", "最佳潜热达到 1e8。") },
              done() { return player.evap.best.gte("1e8") } },
        33: { name() { return L("Organization", "组织化") },
              tooltip() { return L("Reach 1e10 water vapor.", "水汽达到 1e10。") },
              done() { return player.points.gte("1e10") } },
        35: { name() { return L("Cumulonimbus", "积雨云") },
              tooltip() { return L("Reach 1e4 cloud mass.", "云团达到 1e4。") },
              done() { return player.conv.best.gte("1e4") } },
        37: { name() { return L("Heat Engine", "热机") },
              tooltip() { return L("Reach 1e9 best latent heat.", "最佳潜热达到 1e9。") },
              done() { return player.evap.best.gte("1e9") } },
        38: { name() { return L("Latent Colossus", "潜热巨库") },
              tooltip() { return L("Reach 1e7 best latent heat.", "最佳潜热达到 1e7。") },
              done() { return player.evap.best.gte("1e7") } },
        42: { name() { return L("Storm Chaser", "追风者") },
              tooltip() { return L("Complete any hostile-environment challenge.", "完成任意一个恶劣环境挑战。") },
              done() { return typeof envTotalCompletions === "function" && envTotalCompletions() >= 1 } },
        43: { name() { return L("Vapor Column", "水汽柱") },
              tooltip() { return L("Reach 1e14 water vapor.", "水汽达到 1e14。") },
              done() { return player.points.gte("1e14") } },
        44: { name() { return L("Thrice ashore", "三度上岸") },
              tooltip() { return L("Make 3 landfalls.", "完成 3 次登陆。") },
              done() { return player.land && player.land.count.gte(3) } },
        47: { name() { return L("Ocean to Sky", "海接天") },
              tooltip() { return L("Reach 1e16 water vapor.", "水汽达到 1e16。") },
              done() { return player.points.gte("1e16") } },
        49: { name() { return L("Anvil Top", "云砧") },
              tooltip() { return L("Reach 1e6 cloud mass.", "云团达到 1e6。") },
              done() { return player.conv.best.gte("1e6") } },
        51: { name() { return L("Carnot Limit", "卡诺极限") },
              tooltip() { return L("Reach 1e10 best latent heat.", "最佳潜热达到 1e10。") },
              done() { return player.evap.best.gte("1e10") } },
        52: { name() { return L("Atmospheric River", "大气河流") },
              tooltip() { return L("Reach 1e18 water vapor.", "水汽达到 1e18。") },
              done() { return player.points.gte("1e18") } },
        56: { name() { return L("Mega Cluster", "巨型云团") },
              tooltip() { return L("Reach 1e8 cloud mass.", "云团达到 1e8。") },
              done() { return player.conv.best.gte("1e8") } },
        57: { name() { return L("Sky River", "天河") },
              tooltip() { return L("Reach 1e20 water vapor.", "水汽达到 1e20。") },
              done() { return player.points.gte("1e20") } },
        58: { name() { return L("Latent Sea", "潜热之海") },
              tooltip() { return L("Reach 1e11 best latent heat.", "最佳潜热达到 1e11。") },
              done() { return player.evap.best.gte("1e11") } },
        62: { name() { return L("First Replacement", "第一次置换") },
              tooltip() { return L("Run 10 eyewall replacement cycles.", "完成 10 次眼墙置换循环。") },
              done() { return player.eyew && player.eyew.cycles.gte(10) } },
        63: { name() { return L("Monsoon Feed", "季风馈养") },
              tooltip() { return L("Reach 1e22 water vapor.", "水汽达到 1e22。") },
              done() { return player.points.gte("1e22") } },
        64: { name() { return L("Eternal Fuel", "不熄燃料") },
              tooltip() { return L("Reach 1e12 best latent heat.", "最佳潜热达到 1e12。") },
              done() { return player.evap.best.gte("1e12") } },
        68: { name() { return L("Vapor Empire", "水汽帝国") },
              tooltip() { return L("Reach 1e24 water vapor.", "水汽达到 1e24。") },
              done() { return player.points.gte("1e24") } },
        69: { name() { return L("Stratiform Sea", "层云之海") },
              tooltip() { return L("Reach 1e10 cloud mass.", "云团达到 1e10。") },
              done() { return player.conv.best.gte("1e10") } },
        71: { name() { return L("Deep Cycle", "深循环") },
              tooltip() { return L("Reach 1e13 best latent heat.", "最佳潜热达到 1e13。") },
              done() { return player.evap.best.gte("1e13") } },
        73: { name() { return L("Hydrological Age", "水文纪元") },
              tooltip() { return L("Reach 1e26 water vapor.", "水汽达到 1e26。") },
              done() { return player.points.gte("1e26") } },
        76: { name() { return L("Super Typhoon Log", "超强台风记录") },
              tooltip() { return L("Reach 51 m/s wind.", "风速达到 51 m/s。") },
              done() { return player.eyew && player.eyew.bestWind.gte(51) } },
        77: { name() { return L("Fuel Horizon", "燃料地平线") },
              tooltip() { return L("Reach 1e14 best latent heat.", "最佳潜热达到 1e14。") },
              done() { return player.evap.best.gte("1e14") } },
        78: { name() { return L("Deluge", "倾盆") },
              tooltip() { return L("Reach 1e28 water vapor.", "水汽达到 1e28。") },
              done() { return player.points.gte("1e28") } },
        82: { name() { return L("Adapted", "适应者") },
              tooltip() { return L("Reach 10 total challenge completions.", "挑战总通关数达到 10。") },
              done() { return typeof envTotalCompletions === "function" && envTotalCompletions() >= 10 } },
        83: { name() { return L("Latent Titan", "潜热泰坦") },
              tooltip() { return L("Reach 1e15 best latent heat.", "最佳潜热达到 1e15。") },
              done() { return player.evap.best.gte("1e15") } },
        84: { name() { return L("Cloudburst Era", "云暴纪") },
              tooltip() { return L("Reach 1e30 water vapor.", "水汽达到 1e30。") },
              done() { return player.points.gte("1e30") } },
        87: { name() { return L("Cloud Continent", "云之大陆") },
              tooltip() { return L("Reach 1e12 cloud mass.", "云团达到 1e12。") },
              done() { return player.conv.best.gte("1e12") } },
        88: { name() { return L("Fifty Cycles", "五十次置换") },
              tooltip() { return L("Run 50 eyewall replacement cycles.", "完成 50 次眼墙置换循环。") },
              done() { return player.eyew && player.eyew.cycles.gte(50) } },
        91: { name() { return L("Latent Galaxy", "潜热星系") },
              tooltip() { return L("Reach 1e16 best latent heat.", "最佳潜热达到 1e16。") },
              done() { return player.evap.best.gte("1e16") } },
        93: { name() { return L("Monsoon Monarch", "季风之君") },
              tooltip() { return L("Reach 1e32 water vapor.", "水汽达到 1e32。") },
              done() { return player.points.gte("1e32") } },
        94: { name() { return L("Sky Shelf", "天空陆架") },
              tooltip() { return L("Reach 1e14 cloud mass.", "云团达到 1e14。") },
              done() { return player.conv.best.gte("1e14") } },
        97: { name() { return L("Latent Universe", "潜热宇宙") },
              tooltip() { return L("Reach 1e17 best latent heat.", "最佳潜热达到 1e17。") },
              done() { return player.evap.best.gte("1e17") } },
        98: { name() { return L("The Wet Century", "湿润世纪") },
              tooltip() { return L("Reach 1e34 water vapor.", "水汽达到 1e34。") },
              done() { return player.points.gte("1e34") } },
        101: { name() { return L("Bookmaker's Respect", "庄家的敬意") },
               tooltip() { return L("Reach 20 forecast XP.", "预报经验达到 20。") },
               done() { return player.cas && player.cas.forecastXP.gte(20) } },
        103: { name() { return L("Watermemory", "水的记忆") },
               tooltip() { return L("Reach 1e36 water vapor.", "水汽达到 1e36。") },
               done() { return player.points.gte("1e36") } },
        104: { name() { return L("Against the Wall", "抵墙") },
               tooltip() { return L("Reach 85 m/s — the maximum potential intensity.", "风速达到 85 m/s —— 最大潜在强度。") },
               done() { return player.eyew && player.eyew.bestWind.gte(85) } },
        105: { name() { return L("Self-Raining Sky", "自行下雨的天") },
               tooltip() { return L("Automate the water cycle (monsoon m1 or sea spray).", "让水循环自动化（季风 m1 或飞沫）。") },
               done() { return player.mon && hasMilestone("mon", 1) } },
    },
})

// ---------------------------------------------------------------------------
// story — 台风日记 Storm Diary (10 chapters)
// ---------------------------------------------------------------------------
addLayer("story", {
    name() { return L("Storm Diary", "台风日记") },
    symbol: "记",
    position: 1,
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "#AAB7B8",
    row: "side",

    type: "none",
    layerShown() { return true },
    tooltip() { return L("Storm Diary", "台风日记") },

    chapters: [
        { cond() { return true },
          title() { return L("Day 0 — The Disturbance", "第 0 天 —— 扰动") },
          text() { return L("A loose cluster of thunderstorms drifts westward over water warm as blood. Nothing about it says storm yet. But the sea has been waiting.", "一团松散的雷暴在西移，底下的海水暖得像血。它还称不上风暴。但海已经等了很久。") } },
        { cond() { return player.evap.best.gte(10) },
          title() { return L("Day 1 — Latent Heat", "第 1 天 —— 潜热") },
          text() { return L("Every gram of evaporated water hides a debt the sky must one day repay. Today the sky started paying interest.", "每一克蒸发的水都藏着一笔天要还的债。今天，天空开始付利息了。") } },
        { cond() { return player.conv.unlocked },
          title() { return L("Day 3 — Convection", "第 3 天 —— 对流") },
          text() { return L("Towers of cloud, kilometers high, in lines like soldiers. The atmosphere has begun to organize itself — which is how every disaster introduces itself.", "几公里高的云塔排成队列。大气开始自我组织——所有灾难都是这样做自我介绍的。") } },
        { cond() { return player.mon && player.mon.unlocked },
          title() { return L("Day 7 — The Monsoon Trough", "第 7 天 —— 季风槽") },
          text() { return L("A river of moisture wider than the horizon feeds the disturbance without pause. Somewhere in that current, a decision is being made.", "一条比地平线还宽的水汽河日夜喂养着这团扰动。洋流深处，某个决定正在成形。") } },
        { cond() { return player.eyew && player.eyew.bestWind.gte(32.7) },
          title() { return L("Day 12 — A Name", "第 12 天 —— 命名") },
          text() { return L("At 32.7 meters per second, the weather service stops describing it and starts naming it. You chose this.", "风速 32.7 米每秒，气象台不再描述它，而是给它起了名字。这是你选的。") } },
        { cond() { return player.eyew && player.eyew.cycles.gte(1) },
          title() { return L("Day 15 — Replacement", "第 15 天 —— 置换") },
          text() { return L("The old eyewall starves and falls inward; a new one rises from the bands. The storm survives its own demolition. Note it down: that is the trick.", "旧眼墙断粮内塌，新的从雨带里升起。风暴在自己身上拆了一座房。记住：这就是它活下去的诀窍。") } },
        { cond() { return typeof envTotalCompletions === "function" && envTotalCompletions() >= 1 },
          title() { return L("Day 19 — Hostile Water", "第 19 天 —— 恶水") },
          text() { return L("Dry air, shear, cold wakes — the ocean is not a friend, only a sparring partner. The storm came back from the water meaner.", "干空气、风切变、冷尾迹——海洋不是朋友，只是陪练。风暴从水里回来时更凶了。") } },
        { cond() { return player.land && player.land.count.gte(1) },
          title() { return L("Day 21 — Landfall", "第 21 天 —— 登陆") },
          text() { return L("It crossed the coast at full strength and let go of everything it had. Inland, people who had never seen the sea were watching it fall from the sky.", "它全盛时越过海岸线，然后放下了它带着的一切。内陆从未见过海的人，看见海从天上落下来。") } },
        { cond() { return player.cas && player.cas.forecastXP.gte(1) },
          title() { return L("Day 24 — The Odds", "第 24 天 —— 赔率") },
          text() { return L("A forecast is a bet you make with other people's evacuation. The cone on the map is honest about only one thing: it is not sure.", "预报是一场拿别人的撤离做筹码的赌局。地图上那个锥形只诚实说了一件事：它不确定。") } },
        { cond() { return player.land && hasMilestone("land", 9) },
          title() { return L("The Last Entry", "最后的一页") },
          text() { return L("The storm has made landfall. Somewhere far inland, rain is still falling from a sky that remembers you. Close the diary. The sea is already warming again.", "台风登陆了。遥远内陆的雨里，还留着它记给你的最后一笔。合上日记吧。海又暖起来了。") } },
    ],

    tabFormat: [
        ["display-text", function() {
            let n = 0
            for (let c of layers.story.chapters) if (c.cond()) n++
            return "<h2 style='color:#AAB7B8'>" + n + " / 10 " + L("chapters", "章") + "</h2>"
        }],
        ["blank", "10px"],
        ["display-text", function() {
            let s = ""
            for (let c of layers.story.chapters) {
                if (c.cond()) {
                    s += "<h3 style='color:#D5DBDB'>" + c.title() + "</h3>"
                    s += "<span style='opacity:.8'>" + c.text() + "</span><br><br>"
                } else {
                    s += "<h3 style='opacity:.35'>" + L("???", "？？？") + "</h3><br>"
                }
            }
            return s
        }],
        ["blank", "65px"],
    ],
})

// ---------------------------------------------------------------------------
// cas — 路径赌局 Forecast Odds (M14)
// ---------------------------------------------------------------------------
addLayer("cas", {
    name() { return L("Forecast Odds", "路径赌局") },
    symbol: "赌",
    position: 2,
    startData() { return {
        unlocked: false,             // written by getPointGen at conv.best 1e10 (mod.js)
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        forecastXP: new Decimal(0),  // secondary currency (quota): feeds forecastMult()
        streak: 0,                   // plain number (rule 20)
        lastBet: 0,                  // ms timestamp
        lastMsg: "",                 // plain string
    }},
    color: "#D7BDE2",
    row: "side",

    type: "none",
    layerShown() { return player[this.layer].unlocked },
    tooltip() { return L("Forecast Odds", "路径赌局") },

    // forecast practice: every second in a real storm sharpens the eye
    update(diff) {
        if (!player[this.layer].unlocked) return
        let ndiff = new Decimal(diff)
        let w = windMS()
        if (w.gte(TUNING.WIND_CATS[0])) {
            let idx = 0
            for (let i = 0; i < TUNING.WIND_CATS.length; i++) if (w.gte(TUNING.WIND_CATS[i])) idx = i + 1
            player.cas.forecastXP = player.cas.forecastXP.add(ndiff.times(idx * 0.05)).min(50)
        }
    },

    tabFormat: [
        ["display-text", function() {
            return "<h2 style='color:#D7BDE2'>" + L("Forecast XP: ", "预报经验：") + format(player.cas.forecastXP, 2)
                + L("  (vapor x", "（水汽 ×") + format(forecastMult(), 2) + L(", cloud x", "，云团 ×") + format(streakCloudMult(), 2) + ")</h2>"
        }],
        ["display-text", function() {
            return "<span style='opacity:.5'>" + L("Every bet stakes 10% of your latent heat. The house always wins — the weather is the house.", "每一注押 10% 潜热。庄家永远赢——天气就是庄家。") + "</span>"
        }],
        ["blank", "10px"],
        ["display-text", function() { return player.cas.lastMsg ? player.cas.lastMsg : "" }],
        ["blank", "5px"],
        "clickables",
        ["blank", "65px"],
    ],

    clickables: {
        11: { title: L("Path Dice", "路径骰"),
              display() {
                  let ready = (Date.now() - player.cas.lastBet) >= TUNING.CAS_CD * 1000
                  return L("Roll 2d6. Payout = stake x product x 0.08, capped at 25x stake. XP += product x 0.1.<br>", "掷两枚骰子。赔付 = 押注 × 点数积 × 0.08，上限 25 倍押注。经验 +点数积 ×0.1。<br>")
                      + "<span style='opacity:.6'>" + (ready ? L("Ready (3s cooldown between bets)", "可下注（间隔 3 秒）") : L("Cooling down...", "冷却中……")) + "</span>"
              },
              canClick() { return player.evap.points.gte(10) },
              onClick() {
                  if (Date.now() - player.cas.lastBet < TUNING.CAS_CD * 1000) return
                  let stake = player.evap.points.times(TUNING.DICE_BET_SHARE)
                  if (stake.lt(10)) return
                  player.evap.points = player.evap.points.sub(stake)
                  let d1 = 1 + Math.floor(Math.random() * 6)
                  let d2 = 1 + Math.floor(Math.random() * 6)
                  let product = d1 * d2
                  let payout = stake.times(product).times(TUNING.DICE_PAYOUT).min(stake.times(TUNING.DICE_PAYOUT_CAP))
                  player.evap.points = player.evap.points.add(payout)
                  player.cas.forecastXP = player.cas.forecastXP.add(product * 0.1).min(50)
                  player.cas.lastMsg = L("Rolled ", "掷出 ") + d1 + "+" + d2 + "=" + product
                      + L(" — staked ", " —— 押 ") + format(stake) + L(", returned ", "，返还 ") + format(payout)
                  player.cas.lastBet = Date.now()
              } },
        12: { title: L("Intensity Coin", "强度硬币"),
              display() {
                  let ready = (Date.now() - player.cas.lastBet) >= TUNING.CAS_CD * 1000
                  return L("Heads: streak +1, payout = stake x min(2+streak, 8). Tails: streak resets.<br>", "正面：连击 +1，赔付 = 押注 × min(2+连击, 8)。反面：连击清零。<br>")
                      + L("Current streak: ", "当前连击：") + player.cas.streak + "<br>"
                      + "<span style='opacity:.6'>" + (ready ? L("Ready (3s cooldown between bets)", "可下注（间隔 3 秒）") : L("Cooling down...", "冷却中……")) + "</span>"
              },
              canClick() { return player.evap.points.gte(10) },
              onClick() {
                  if (Date.now() - player.cas.lastBet < TUNING.CAS_CD * 1000) return
                  let stake = player.evap.points.times(TUNING.COIN_BET_SHARE)
                  if (stake.lt(10)) return
                  player.evap.points = player.evap.points.sub(stake)
                  if (Math.random() < 0.5) {
                      let mult = Math.min(2 + player.cas.streak, TUNING.COIN_PAYOUT_CAP)
                      let payout = stake.times(mult)
                      player.evap.points = player.evap.points.add(payout)
                      player.cas.streak += 1
                      player.cas.forecastXP = player.cas.forecastXP.add(1).min(50)
                      player.cas.lastMsg = L("Heads! ", "正面！") + L("staked ", "押 ") + format(stake) + L(", returned ", "，返还 ") + format(payout)
                          + L(" (streak ", "（连击 ") + player.cas.streak + ")"
                  } else {
                      player.cas.streak = 0
                      player.cas.lastMsg = L("Tails. The storm dodged the forecast. Streak reset.", "反面。风暴躲开了预报。连击清零。")
                  }
                  player.cas.lastBet = Date.now()
              } },
    },
})
