addLayer("a", {
    startData() { return { unlocked: true, points: new Decimal(0) } },
    color: "#FFD700",
    resource: "achievements",
    row: "side",
    tooltip() { return "Achievements" },
    achievementPopups: true,

    tabFormat: [
        ["display-text", function () { return "Rewards are permanent. Automation achievements work even when their milestone path is missing." }],
        ["blank", "10px"],
        "achievements",
    ],

    achievements: {
        11: { name: "First Bud", done() { return player.y.points.gte(1) }, tooltip: "Bud your first yeast.<br>Reward: sugar ×1.5" },
        12: { name: "Malt Storm", done() { return player.points.gte(1e6) }, tooltip: "Have 1e6 sugar.<br>Reward: sugar ×2" },
        13: { name: "Industrial Fermenter", done() { return player.points.gte(1e12) }, tooltip: "Have 1e12 sugar.<br>Reward: sugar ×2" },
        14: { name: "Pantry Planet", done() { return player.points.gte(1e18) }, tooltip: "Have 1e18 sugar.<br>Reward: sugar ×3" },
        15: { name: "Sweet Singularity", done() { return player.points.gte(1e24) }, tooltip: "Have 1e24 sugar.<br>Reward: sugar ×5" },
        21: { name: "Pitched!", done() { return player.y.points.gte(100) }, tooltip: "Have 100 yeast.<br>Reward: yeast ×1.5" },
        22: { name: "Auto-Budding", done() { return player.y.points.gte(1e4) }, tooltip: "Have 10,000 yeast.<br>Reward: automatically bud new yeast." },
        23: { name: "Colony Boom", done() { return player.y.points.gte(1e8) }, tooltip: "Have 1e8 yeast.<br>Reward: yeast ×2" },
        24: { name: "Biomass Baron", done() { return player.y.points.gte(1e12) }, tooltip: "Have 1e12 yeast.<br>Reward: yeast ×3" },
        25: { name: "Fungal Empire", done() { return player.y.points.gte(1e16) }, tooltip: "Have 1e16 yeast.<br>Reward: yeast ×5" },
        31: { name: "Speedrun Brewer", done() { return hasUpgrade("y", 25) }, tooltip: "Pitch a proper starter.<br>Reward: automatically bud new yeast." },
        32: { name: "Baker's Dozen", done() { return player.k.points.gte(13) }, tooltip: "Have 13 bread.<br>Reward: bread ×2" },
        33: { name: "Mixologist", done() { return player.e.points.gte(10) }, tooltip: "Hold 10% ABV at once.<br>Reward: brew ×2" },
        34: { name: "Tavern Keeper", done() { return player.t.points.gte(100) }, tooltip: "Have 100 coins.<br>Reward: coins ×2" },
        35: { name: "Local Legend", done() { return player.t.upgrades.length >= 10 }, tooltip: "Buy all 10 Tavern upgrades.<br>Reward: medals ×2" },
        41: { name: "Trial Novice", done() { return hasChallenge("c", 11) || hasChallenge("c", 12) || hasChallenge("c", 13) }, tooltip: "Complete any competition.<br>Reward: automatically buy Budding upgrades." },
        42: { name: "Trial Master", done() { return hasChallenge("c", 11) && hasChallenge("c", 12) && hasChallenge("c", 13) && hasChallenge("c", 21) && hasChallenge("c", 22) && hasChallenge("c", 23) }, tooltip: "Complete all 6 competitions.<br>Reward: medals ×3" },
        43: { name: "Distillery Dream", done() { return player.e.points.gte(21) }, tooltip: "Hold 21% ABV at once.<br>Reward: ABV per distillation ×2" },
        44: { name: "Better Bakes", done() { return player.k.points.gte(1e4) }, tooltip: "Have 10,000 bread.<br>Reward: bread ×3" },
        45: { name: "Field Guide", done() { return player.w.strains.length >= 6 }, tooltip: "Discover 6 wild strains.<br>Reward: yeast ×3" },
        51: { name: "Fungal Wisdom", done() { return player.w.strains.length >= 12 }, tooltip: "Discover all 12 wild strains.<br>Reward: sugar ×10" },
        52: { name: "Halfway There", done() { return hasMilestone("g", 7) }, tooltip: "Sequence chromosome VIII.<br>Reward: genes ×2" },
        53: { name: "Master Brewer", done() { return player.b.points.gte(1e10) }, tooltip: "Have 1e10 brew.<br>Reward: automatically brew a batch." },
        54: { name: "Synthetic Dawn", done() { return hasMilestone("g", 14) }, tooltip: "Sequence chromosome XV.<br>Reward: genes ×3" },
        55: { name: "The Complete Tree", done() { return hasMilestone("g", 15) }, tooltip: "Sequence chromosome XVI.<br>Reward: sugar ×10" },
        61: { name: "Elbow Grease", done() { return player.k.kneads.gte(10) }, tooltip: "Knead 10 batches.<br>Reward: bread ×1.5" },
        62: { name: "Artisan Baker", done() { return player.k.kneads.gte(500) }, tooltip: "Knead 500 batches.<br>Reward: bread ×2" },
        63: { name: "Wild Pitch", done() { return player.w.expeditions.gte(1) }, tooltip: "Run one wild-ferment expedition.<br>Reward: sugar ×1.5" },
        64: { name: "First Distillation", done() { return player.e.total.gte(5) }, tooltip: "Distill 5% ABV in total." },
        65: { name: "Shopaholic", done() { return getBuyableAmount("y", 11).add(getBuyableAmount("y", 12)).add(getBuyableAmount("b", 11)).add(getBuyableAmount("k", 11)).add(getBuyableAmount("t", 11)).add(getBuyableAmount("e", 11)).add(getBuyableAmount("g", 11)).gte(25) }, tooltip: "Own 25 buyable levels in total." },
        71: { name: "Three Sisters", done() { return player.o.unlocked }, tooltip: "Unlock Respiration." },
        72: { name: "Going Pro", done() { return player.c.unlocked }, tooltip: "Unlock the Trials." },
        73: { name: "Spirits High", done() { return player.e.unlocked }, tooltip: "Unlock the Distillery." },
        74: { name: "Landlord", done() { return player.t.unlocked }, tooltip: "Unlock the Tavern." },
        75: { name: "Spore Season", done() { return player.s.unlocked }, tooltip: "Unlock Sporulation." },
        81: { name: "Upgrade Collector", done() { return player.y.upgrades.length >= 10 }, tooltip: "Own 10 Budding upgrades." },
        82: { name: "Completionist Instinct", done() { return player.y.upgrades.length >= 25 }, tooltip: "Own all 25 Budding upgrades." },
        83: { name: "Milestone Hunter", done() { return player.y.milestones.length >= 10 }, tooltip: "Reach all 10 Budding milestones." },
        84: { name: "Estate Owner", done() { return getBuyableAmount("y", 11).gte(10) }, tooltip: "Own 10 levels of Budding Vats." },
        85: { name: "Kveik Enthusiast", done() { return player.w.strains.length >= 3 }, tooltip: "Discover 3 wild strains." },
        91: { name: "Twelve Million Years", done() { return player.y.points.gte(1e20) }, tooltip: "Have 1e20 yeast." },
        92: { name: "Sugar Sea", done() { return player.points.gte(1e30) }, tooltip: "Have 1e30 sugar." },
        93: { name: "Beer Ocean", done() { return player.b.points.gte(1e12) }, tooltip: "Have 1e12 brew." },
        94: { name: "Oven Nation", done() { return player.k.points.gte(1e8) }, tooltip: "Have 1e8 bread." },
        95: { name: "Genome Museum", done() { return player.g.points.gte(1000) }, tooltip: "Have 1,000 genes." },
        101: { name: "Chromosome VI", done() { return hasMilestone("g", 5) }, tooltip: "Sequence chromosome VI." },
        102: { name: "Chromosome X", done() { return hasMilestone("g", 9) }, tooltip: "Sequence chromosome X." },
        103: { name: "Chromosome XIV", done() { return hasMilestone("g", 13) }, tooltip: "Sequence chromosome XIV." },
        104: { name: "Auto-Brewery", done() { return hasMilestone("s", 3) }, tooltip: "Earn the Sporulation package deal." },
        105: { name: "ABV Master", done() { return player.e.points.gte(25) }, tooltip: "Hold 25% ABV at once — beyond evolution." },
    },
})

addLayer("st", {
    startData() { return { unlocked: true, points: new Decimal(0), time: new Decimal(0) } },
    color: "#A9A9A9",
    row: "side",
    tooltip() { return "Statistics" },
    type: "none",
    update(diff) { player.st.time = player.st.time.add(diff) },
    tabFormat: [
        ["display-text", function () { return "<h3>The Yeast Tree — statistics</h3>" }],
        ["display-text", function () { return "Time in this universe: " + formatTime(player.st.time.toNumber()) }],
        ["blank", "10px"],
        ["raw-html", function () { return statsTableHTML() }],
    ],
})

function statsTableHTML() {
    const rows = [
        ["y", "yeast"], ["b", "brew"], ["k", "bread"], ["o", "ATP"],
        ["c", "medals"], ["e", "ABV"], ["t", "coins"], ["w", "forages"], ["s", "spores"], ["g", "genes"],
    ]
    let html = "<table style='border-collapse:collapse'>"
    html += "<tr><th style='text-align:left;padding:2px 14px'>Layer</th><th style='text-align:right;padding:2px 14px'>Best</th><th style='text-align:right;padding:2px 14px'>Total</th></tr>"
    for (const r of rows) {
        html += "<tr><td style='padding:2px 14px'>" + r[1] + "</td><td style='text-align:right;padding:2px 14px'>" +
            format(player[r[0]].best || new Decimal(0)) + "</td><td style='text-align:right;padding:2px 14px'>" +
            format(player[r[0]].total || new Decimal(0)) + "</td></tr>"
    }
    html += "</table>"
    html += "<br>Kneaded batches: " + formatWhole(player.k.kneads) +
        " · Expeditions: " + formatWhole(player.w.expeditions) +
        " · Strains: " + player.w.strains.length + "/12"
    return html
}

addLayer("l", {
    startData() { return { unlocked: true, points: new Decimal(0) } },
    color: "#DEB887",
    row: "side",
    tooltip() { return "The Chronicle" },
    type: "none",
    tabFormat: [
        ["infobox", "chron1"],
        ["infobox", "chron2"],
        ["infobox", "chron3"],
        ["infobox", "chron4"],
        ["infobox", "chron5"],
        ["infobox", "chron6"],
        ["infobox", "chron7"],
        ["infobox", "chron8"],
    ],
    infoboxes: {
        chron1: {
            title: "The Drop — 7000 BC",
            body() { return "Someone left fruit juice in a jar and forgot about it. When they came back, the jar was hissing — and the drink made the fire feel warm. Yeast had been waiting for sugar since before there were people; it took us ten thousand years to notice it was everywhere." },
            unlocked() { return true },
        },
        chron2: {
            title: "Bread — 3000 BC",
            body() { return "In Egypt, a baker's mistake rises. Beer and bread come from the same miracle — yeast eating sugar and exhaling — and for most of history, the workers were paid in both." },
            unlocked() { return player.k.unlocked },
        },
        chron3: {
            title: "The Crabtree Quandary",
            body() { return "Give yeast oxygen and it still prefers to ferment. Biologists argued for a century about why the most efficient pathway keeps losing to the fastest one. Your Respiration wing exists to prove the empire could have been built either way." },
            unlocked() { return player.o.unlocked },
        },
        chron4: {
            title: "Pasteur — 1859",
            body() { return "\"In alcoholic fermentation, it is the yeast — the living cell — that acts.\" Pasteur's swan-neck flasks ended the spontaneous-generation argument, and brewing became a science overnight." },
            unlocked() { return hasMilestone("y", 7) },
        },
        chron5: {
            title: "Pure Culture — 1883",
            body() { return "Emil Christian Hansen isolates a single yeast cell at the Carlsberg Laboratory and grows an entire brewery from it. Every lager on Earth is descended from his one test tube." },
            unlocked() { return hasUpgrade("y", 25) },
        },
        chron6: {
            title: "The Trials",
            body() { return "Homebrew competitions judge beer blind, by style, on a 50-point scale. Your best bottle wins nothing but a ribbon — and your best <i>run</i> wins medals that rewrite the whole operation." },
            unlocked() { return player.c.unlocked },
        },
        chron7: {
            title: "The Lost Parent — 2011",
            body() { return "Lager's cold-loving parent yeast evaded science for 500 years — until it turned up in the forests of Patagonia and, later, in Tibetan oak bark. <i>Saccharomyces eubayanus</i> was hiding in the wild the whole time. So might the others." },
            unlocked() { return player.w.strains.length >= 7 },
        },
        chron8: {
            title: "Sc2.0 — 2014",
            body() { return "The Synthetic Yeast Genome Project rebuilds all 16 chromosomes from scratch — and swaps the code around just to see what survives. When chromosome XVI is done, a yeast will exist that no evolution ever made. You are nearly there." },
            unlocked() { return player.g.unlocked },
        },
    },
})
