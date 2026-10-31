// js/layers-side.js — achievements (5×10 grid, alternate automation path), stats, stories. Brief §4 side rows.

// ---------------------------------------------------------------- achievements
addLayer("a", {
    startData() { return { unlocked: true, points: new Decimal(0) } },
    color: "#ffd966",
    resource() { return tt("achievement power", "成就之力") },
    row: "side",
    symbol: "☆",
    tooltip() { return tt("Achievements", "成就") },
    achievementPopups: true,

    tabFormat: [
        ["display-text", function () {
            return tt("Achievements: ", "成就：") + player.a.achievements.length + " / 50"
        }, { "font-size": "18px", "color": "#ffd966" }],
        ["blank", "8px"],
        "achievements",
    ],

    achievements: {
        10: { name() { return tt("A Seed Falls", "一粒种子落下") }, done() { return player.points.gte(10) }, tooltip() { return tt("Grow 10 leaves.<br>Reward: leaf growth ×1.5", "长出 10 片树叶。<br>奖励：树叶生长 ×1.5") }, effect() { return new Decimal(1.5) } },
        11: { name() { return tt("First Press", "第一次压实") }, done() { return player.wood.best.gte(1) }, tooltip() { return tt("Press your first Wood.<br>Reward: leaf growth ×1.5", "压出第一块木头。<br>奖励：树叶生长 ×1.5") }, effect() { return new Decimal(1.5) } },
        12: { name() { return tt("Timber", "木材！") }, done() { return player.wood.best.gte(100) }, tooltip() { return tt("Hold 100 Wood.<br>Reward: leaf growth ×2", "持有 100 木头。<br>奖励：树叶生长 ×2") }, effect() { return new Decimal(2) } },
        13: { name() { return tt("Heartwood", "心材") }, done() { return player.wood.best.gte(2500) }, tooltip() { return tt("Hold 2,500 Wood.", "持有 2,500 木头。") } },
        14: { name() { return tt("Squirrel's Debt", "松鼠的债") }, done() { return player.wood.best.gte(1e6) }, tooltip() { return tt("Hold 1M Wood.", "持有 100 万木头。") } },
        20: { name() { return tt("Upward", "向上") }, done() { return player.branch.best.gte(1) }, tooltip() { return tt("Sprout your first Branch.", "抽出第一根树枝。") } },
        21: { name() { return tt("Downward", "向下") }, done() { return player.root.best.gte(1) }, tooltip() { return tt("Grow your first Root.<br>Reward: Wood grows passively, forever", "长出第一根根须。<br>奖励：木头永久被动生长") }, },
        22: { name() { return tt("Two Ways", "两个方向") }, done() { return player.branch.best.gte(50) && player.root.best.gte(50) }, tooltip() { return tt("50 Branches and 50 Roots.", "50 根树枝与 50 根根须。") } },
        23: { name() { return tt("Symmetry", "对称") }, done() { return player.branch.best.gte(5000) && player.root.best.gte(5000) }, tooltip() { return tt("5,000 Branches and 5,000 Roots.", "5,000 根树枝与 5,000 根根须。") } },
        24: { name() { return tt("The Balanced Tree", "均衡之树") }, done() { return player.branch.best.gte(1e5) && player.root.best.gte(1e5) }, tooltip() { return tt("100,000 Branches and Roots.", "十万树枝与根须。") } },
        30: { name() { return tt("Armored", "披甲") }, done() { return player.bark.best.gte(1) }, tooltip() { return tt("Grow your first Bark floor.", "长出第一层树皮。") } },
        31: { name() { return tt("Fortress", "壁垒") }, done() { return player.bark.best.gte(24) }, tooltip() { return tt("24 Bark floors.", "24 层树皮。") } },
        32: { name() { return tt("Full Bloom", "繁花盛开") }, done() { return player.blossom.best.gte(9) }, tooltip() { return tt("9 Blossoms.", "9 朵花。") } },
        33: { name() { return tt("Blossom Wind", "花风") }, done() { return player.blossom.best.gte(50) }, tooltip() { return tt("50 Blossoms.", "50 朵花。") } },
        34: { name() { return tt("Tapped", "采液者") }, done() { return player.sap.best.gte(10) }, tooltip() { return tt("Draw 10 Sap.<br>Reward: Wood upgrades are bought automatically, forever", "采集 10 树液。<br>奖励：木头升级永久自动购买") } },
        40: { name() { return tt("First Light", "第一缕光") }, done() { return player.canopy.best.gte(1) }, tooltip() { return tt("Gather your first Light.", "收集第一缕光照。") } },
        41: { name() { return tt("Sun Worship", "向日崇拜") }, done() { return player.canopy.best.gte(80) }, tooltip() { return tt("80 Light.", "80 光照。") } },
        42: { name() { return tt("Condensation", "凝结") }, done() { return player.seed.best.gte(1) }, tooltip() { return tt("Form your first Seed.", "结出第一粒种子。") } },
        43: { name() { return tt("Seed Rain", "种子雨") }, done() { return player.seed.best.gte(450) }, tooltip() { return tt("450 Seeds — the package arrives.", "450 粒种子——全家桶到货。") } },
        44: { name() { return tt("Patient Years", "耐心的岁月") }, done() { return player.seed.best.gte(2500) }, tooltip() { return tt("2,500 Seeds.", "2,500 粒种子。") } },
        50: { name() { return tt("Bare Branches", "秃枝") }, done() { return hasChallenge("wood", 11) }, tooltip() { return tt("Complete the Bare Branches trial.", "完成「秃枝」试炼。") } },
        51: { name() { return tt("Storm Rider", "御风者") }, done() { return hasChallenge("wood", 12) }, tooltip() { return tt("Complete the Storm trial.", "完成「风暴」试炼。") } },
        52: { name() { return tt("Drought-Breaker", "破旱者") }, done() { return hasChallenge("canopy", 11) }, tooltip() { return tt("Complete the Drought trial.", "完成「干旱」试炼。") } },
        53: { name() { return tt("Breathless", "屏息") }, done() { return hasChallenge("canopy", 12) }, tooltip() { return tt("Complete the Leafless trial.", "完成「无叶」试炼。") } },
        54: { name() { return tt("Stone-Breaker", "碎石者") }, done() { return hasChallenge("canopy", 13) && hasChallenge("seed", 21) }, tooltip() { return tt("Complete Shallow Roots and Dry Season.", "完成「浅根」与「旱季」。") } },
        60: { name() { return tt("The First Planting", "第一次种植") }, done() { return player.grove.best.gte(1) }, tooltip() { return tt("Plant your first tree.", "种下第一棵树。") } },
        61: { name() { return tt("Copse", "小树林") }, done() { return player.grove.best.gte(3) }, tooltip() { return tt("Plant 3 trees.", "种下 3 棵树。") } },
        62: { name() { return tt("Grove", "树林") }, done() { return player.grove.best.gte(8) }, tooltip() { return tt("Plant 8 trees.", "种下 8 棵树。") } },
        63: { name() { return tt("Young Forest", "幼林") }, done() { return player.grove.best.gte(12) }, tooltip() { return tt("Plant 12 trees.", "种下 12 棵树。") } },
        64: { name() { return tt("Standing Reserve", "常青储备") }, done() { return player.grove.best.gte(20) }, tooltip() { return tt("Plant 20 trees.", "种下 20 棵树。") } },
        70: { name() { return tt("The Crown Stirs", "树冠微动") }, done() { return player.worldtree.best.gte(1) }, tooltip() { return tt("World-growth reaches 1.", "界树生长达到 1。") } },
        71: { name() { return tt("World Weather", "界之气候") }, done() { return player.worldtree.best.gte(65) }, tooltip() { return tt("World-growth reaches 65.", "界树生长达到 65。") } },
        72: { name() { return tt("Continental Shade", "洲际之荫") }, done() { return player.worldtree.best.gte(1000) }, tooltip() { return tt("World-growth reaches 1,000.", "界树生长达到 1,000。") } },
        73: { name() { return tt("The Sky Belongs to It", "天空属于它") }, done() { return player.worldtree.best.gte(4000000) }, tooltip() { return tt("World-growth reaches 4,000,000.", "界树生长达到 400 万。") } },
        74: { name() { return tt("THE TREE TREE", "树中之树") }, done() { return player.worldtree.best.gte(50000000) }, tooltip() { return tt("Complete the endgame.", "抵达终局。") } },
        80: { name() { return tt("Collector of Rings", "年轮收藏家") }, done() { return getBuyableAmount("wood", 12).gte(10) }, tooltip() { return tt("Own 10 Growth Rings.", "持有 10 级年轮。") } },
        81: { name() { return tt("Fertilized", "沃肥") }, done() { return getBuyableAmount("wood", 11).gte(15) }, tooltip() { return tt("Own 15 Fertilizer levels.", "持有 15 级树肥。") } },
        82: { name() { return tt("Concentrated", "浓缩") }, done() { return getBuyableAmount("sap", 11).gte(10) }, tooltip() { return tt("Own 10 Concentrate levels.", "持有 10 级浓缩汁。") } },
        83: { name() { return tt("Budded", "萌芽") }, done() { return getBuyableAmount("branch", 11).gte(10) }, tooltip() { return tt("Own 10 Side Buds.", "持有 10 级侧芽。") } },
        84: { name() { return tt("Mycologist", "菌学家的荣耀") }, done() { return getBuyableAmount("root", 11).gte(10) }, tooltip() { return tt("Own 10 Mycorrhiza levels.", "持有 10 级菌根。") } },
        90: { name() { return tt("Leaf Millionaire", "百万树叶") }, done() { return player.points.gte(1e6) }, tooltip() { return tt("Hold 1M leaves at once.", "同时持有 100 万片树叶。") } },
        91: { name() { return tt("Leaf Billionaire", "十亿树叶") }, done() { return player.points.gte(1e9) }, tooltip() { return tt("Hold 1B leaves at once.", "同时持有 10 亿片树叶。") } },
        92: { name() { return tt("Canopy Ocean", "叶之海") }, done() { return player.points.gte(1e15) }, tooltip() { return tt("Hold 1e15 leaves at once.", "同时持有 1e15 片树叶。") } },
        93: { name() { return tt("The Green Sky", "绿色天空") }, done() { return player.points.gte("1e30") }, tooltip() { return tt("Hold 1e30 leaves at once.", "同时持有 1e30 片树叶。") } },
        94: { name() { return tt("Leaves Beyond Counting", "不可胜数") }, done() { return player.points.gte("1e100") }, tooltip() { return tt("Hold 1e100 leaves at once.", "同时持有 1e100 片树叶。") } },
        100: { name() { return tt("Half Way Up", "半山") }, done() { return player.blossom.unlocked && player.bark.unlocked && player.sap.unlocked }, tooltip() { return tt("Unlock every row-2 layer.", "解锁全部第三行。") } },
        101: { name() { return tt("Tall Enough", "足够高") }, done() { return player.canopy.unlocked && player.seed.unlocked }, tooltip() { return tt("Unlock both row-3 layers.", "解锁全部第四行。") } },
        102: { name() { return tt("Night and Day", "昼与夜") }, done() { return player.grove.unlocked }, tooltip() { return tt("Unlock the Grove.", "解锁树林。") } },
        103: { name() { return tt("Reader of Formulae", "读公式的人") }, done() { return hasUpgrade("branch", 15) && hasUpgrade("root", 15) && hasUpgrade("bark", 15) && hasUpgrade("blossom", 15) && hasUpgrade("sap", 15) }, tooltip() { return tt("Reveal every Formulae tab.", "显现全部「公式」页签。") } },
        104: { name() { return tt("One of Everything", "样样皆有") }, done() { return player.a.achievements.length >= 49 }, tooltip() { return tt("This is the 50th. You know what to do.", "这是第 50 个。你知道该做什么。") } },
    },
})

// ---------------------------------------------------------------- stats
addLayer("st", {
    startData() { return { unlocked: true, points: new Decimal(0) } },
    color: "#cccccc",
    resource() { return tt("statistics", "统计") },
    row: "side",
    symbol: "≡",
    tooltip() { return tt("Statistics", "统计") },
    type: "none",
    tabFormat: [
        ["display-text", function () {
            return tt("Time played: ", "游玩时间：") + formatTime(player.timePlayed)
        }],
        ["display-text", function () {
            return tt("Leaves (now / best of era): ", "树叶（当前/本纪元峰值）：") + format(player.points)
        }],
        ["display-text", function () {
            return tt("Wood best: ", "木头最多：") + format(player.wood.best) +
                tt(" — total pressed: ", " —— 累计压出：") + format(player.wood.total)
        }],
        ["display-text", function () {
            return tt("Branches best: ", "树枝最多：") + format(player.branch.best) +
                tt(" — Roots best: ", " —— 根须最多：") + format(player.root.best)
        }],
        ["display-text", function () {
            return tt("Bark floors best: ", "树皮层最多：") + formatWhole(player.bark.best) +
                tt(" — Blossoms best: ", " —— 花最多：") + formatWhole(player.blossom.best) +
                tt(" — Sap best: ", " —— 树液最多：") + format(player.sap.best)
        }],
        ["display-text", function () {
            return tt("Light best: ", "光照最多：") + format(player.canopy.best) +
                tt(" — Seeds best: ", " —— 种子最多：") + format(player.seed.best)
        }],
        ["display-text", function () {
            return tt("Trees planted: ", "已种下的树：") + formatWhole(player.grove.points) +
                tt(" — World-growth: ", " —— 界树生长：") + format(player.worldtree.best)
        }],
        ["display-text", function () {
            return tt("Achievements: ", "成就：") + player.a.achievements.length + " / 50"
        }],
    ],
})

// ---------------------------------------------------------------- stories (M15, P51 — 12 unlock-gated chapters)
const STORY_CHAPTERS = [
    { cond() { return player.points.gte(10) },
      en: "A seed cracks open in the dark. It knows only two hungers: the sky, and the deep.",
      zh: "一粒种子在黑暗中裂开。它只知道两种饥饿：天空，与深处。" },
    { cond() { return player.wood.best.gte(1) },
      en: "Every year the leaves fall, and every year they press into the trunk beneath. Nothing is wasted. Nothing is forgotten.",
      zh: "叶子年年落下，又年年压进脚下的树干。没有一片被浪费，没有一片被遗忘。" },
    { cond() { return player.branch.best.gte(1) },
      en: "The trunk learns to split itself. Upward is one tree; sideways is another ambition entirely.",
      zh: "树干学会了分身。向上是一棵树；向旁，则是全然不同的野心。" },
    { cond() { return player.root.best.gte(1) },
      en: "What the sky sees is half the tree. The other half drinks in the dark, trading sugar for water with strangers.",
      zh: "天空看见的只是半棵树。另一半在黑暗中饮水，与陌生者以糖换水。" },
    { cond() { return player.bark.best.gte(1) },
      en: "Fire came once. The tree survived by dying outward — every scar a floor of armor.",
      zh: "火来过一次。树以向外死去的方式活了下来——每一道疤，都是一层甲。" },
    { cond() { return player.blossom.best.gte(1) },
      en: "For one week the tree spends everything it has on being beautiful. The bees call it economics.",
      zh: "有一周，树倾尽所有只为美丽。蜜蜂把这门学问叫作经济。" },
    { cond() { return player.sap.best.gte(1) },
      en: "Cut the bark and the tree bleeds sugar. It has been saving for exactly this.",
      zh: "割开树皮，树会流出糖。它一直为此而储蓄。" },
    { cond() { return player.canopy.best.gte(1) },
      en: "A crown is a territory. Every leaf is a small war for light, and the tree wins them all, quietly.",
      zh: "树冠即领土。每一片叶都是争夺光的战争，而树安静地赢下所有。" },
    { cond() { return player.seed.best.gte(1) },
      en: "A seed is a tree that has learned to wait. Inside: the whole plan, folded.",
      zh: "种子是一棵学会了等待的树。里面：完整的图纸，折叠着。" },
    { cond() { return player.grove.best.gte(1) },
      en: "You plant it, and for a moment there are two of you. The old tree becomes soil. The soil becomes a forest.",
      zh: "你种下它，一瞬间世界上有两个你。老树成为泥土，泥土成为森林。" },
    { cond() { return player.grove.best.gte(5) },
      en: "The grove does not remember being one tree. But the roots still touch, underground, in the dark.",
      zh: "树林不记得自己曾是一棵树。但地底深处，根须仍然相触。" },
    { cond() { return player.worldtree.best.gte(1) },
      en: "Somewhere, a tree that every fallen tree became stands with its crown in the sky. It is growing still. It is called THE TREE TREE.",
      zh: "在某处，一棵由所有倒下的树长成的树立在天空下，树冠入云。它仍在生长。它叫，树中之树。" },
]

addLayer("s", {
    startData() { return { unlocked: true, points: new Decimal(0) } },
    color: "#b8b8ff",
    resource() { return tt("stories", "故事") },
    row: "side",
    symbol: "✎",
    tooltip() { return tt("Stories", "故事") },
    type: "none",
    tabFormat: [
        ["display-text", function () {
            let n = STORY_CHAPTERS.filter(function (c) { return c.cond() }).length
            return tt("Chapters: ", "章节：") + n + " / 12"
        }, { "font-size": "18px", "color": "#b8b8ff" }],
        ["blank", "8px"],
        ["column", STORY_CHAPTERS.map(function (c, i) {
            return ["display-text", function () {
                if (!c.cond()) return tt("<div style='opacity:.35'>Chapter " + (i + 1) + " — not yet.</div>", "<div style='opacity:.35'>第 " + (i + 1) + " 章——尚未发生。</div>")
                return "<b>" + tt("Chapter ", "第 ") + (i + 1) + tt(" — ", " 章 —— ") + "</b>" + (window.chinesemode ? c.zh : c.en)
            }, { "margin": "6px 0" }]
        })],
    ],
})
