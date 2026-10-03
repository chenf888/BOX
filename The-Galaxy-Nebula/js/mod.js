let modInfo = {
	name: "The Galaxy Nebula",
    id: "the-galaxy-nebula-fo40lq",  // savefile key — set once, NEVER change
	author: "chenf888",
	pointsName: "stardust",
	modFiles: ["layers.js", "layers_core.js", "layers_era1.js", "layers_era2.js", "layers_era3.js", "layers_era4.js", "layers_spine.js", "layers_side.js", "tree.js"],

	discordName: "",
	discordLink: "",
	qqGroupName: "The Galaxy Nebula QQ Group",
	qqGroupLink: "",
	initialStartPoints: new Decimal(10),
	offlineLimit: 1,
}

let VERSION = {
	num: "0.2",
	name: "Initial build",
}

let changelog = `<h1>Changelog:</h1><br>
    <h3>v0.2</h3><br>
        - Fixed 685 bugs in this update.
	<h3>v0.1</h3><br>
		- Initial build of The Galaxy Nebula: 100 main layers, four spiral arms, and the long zoom out.`

let winText = `Congratulations! You have gathered the light of the entire observable universe. Every photon that ever crossed the void now answers to you... and still, the horizon recedes. Thank you for playing The Galaxy Nebula!`

var doNotCallTheseFunctionsEveryTick = []

function getStartPoints() {
    return new Decimal(modInfo.initialStartPoints)
}

function canGenPoints() {
    return true
}

function getPointGen() {
    if (!canGenPoints()) return new Decimal(0)
    let gain = new Decimal(1)
    if (hasUpgrade("gc", 22)) gain = gain.times(3)
    if (hasUpgrade("ps", 15)) gain = gain.times(25)
    if (hasUpgrade("fu", 22)) gain = gain.times(3)
    if (hasUpgrade("pl", 22)) gain = gain.times(3)
    if (hasUpgrade("or1", 22)) gain = gain.times(2)
    if (hasUpgrade("or2", 22)) gain = gain.times(2)
    if (hasUpgrade("or3", 22)) gain = gain.times(2)
    if (hasUpgrade("or4", 22)) gain = gain.times(2)
    if (hasUpgrade("or5", 22)) gain = gain.times(2)
    if (hasUpgrade("or6", 22)) gain = gain.times(4)
    if (hasUpgrade("or7", 22)) gain = gain.times(4)
    if (hasUpgrade("or8", 22)) gain = gain.times(4)
    if (hasUpgrade("or9", 22)) gain = gain.times(4)
    if (hasUpgrade("or10", 22)) gain = gain.times(4)
    if (hasUpgrade("or11", 22)) gain = gain.times(8)
    if (hasUpgrade("or12", 22)) gain = gain.times(8)
    if (hasUpgrade("or13", 22)) gain = gain.times(8)
    if (hasUpgrade("or14", 22)) gain = gain.times(8)
    if (hasUpgrade("or15", 22)) gain = gain.times(8)
    if (hasUpgrade("or16", 22)) gain = gain.times(20)
    if (hasUpgrade("or17", 22)) gain = gain.times(20)
    if (hasUpgrade("or18", 22)) gain = gain.times(20)
    if (hasUpgrade("or19", 22)) gain = gain.times(20)
    if (hasUpgrade("or20", 22)) gain = gain.times(20)
    if (hasUpgrade("or21", 22)) gain = gain.times(20)
    if (hasUpgrade("or22", 22)) gain = gain.times(20)
    if (hasUpgrade("pe1", 22)) gain = gain.times(2)
    if (hasUpgrade("pe2", 22)) gain = gain.times(2)
    if (hasUpgrade("pe3", 22)) gain = gain.times(2)
    if (hasUpgrade("pe4", 22)) gain = gain.times(2)
    if (hasUpgrade("pe5", 22)) gain = gain.times(2)
    if (hasUpgrade("pe6", 22)) gain = gain.times(4)
    if (hasUpgrade("pe7", 22)) gain = gain.times(4)
    if (hasUpgrade("pe8", 22)) gain = gain.times(4)
    if (hasUpgrade("pe9", 22)) gain = gain.times(4)
    if (hasUpgrade("pe10", 22)) gain = gain.times(4)
    if (hasUpgrade("pe11", 22)) gain = gain.times(8)
    if (hasUpgrade("pe12", 22)) gain = gain.times(8)
    if (hasUpgrade("pe13", 22)) gain = gain.times(8)
    if (hasUpgrade("pe14", 22)) gain = gain.times(8)
    if (hasUpgrade("pe15", 22)) gain = gain.times(8)
    if (hasUpgrade("pe16", 22)) gain = gain.times(20)
    if (hasUpgrade("pe17", 22)) gain = gain.times(20)
    if (hasUpgrade("pe18", 22)) gain = gain.times(20)
    if (hasUpgrade("pe19", 22)) gain = gain.times(20)
    if (hasUpgrade("pe20", 22)) gain = gain.times(20)
    if (hasUpgrade("pe21", 22)) gain = gain.times(20)
    if (hasUpgrade("pe22", 22)) gain = gain.times(20)
    if (hasUpgrade("sg1", 22)) gain = gain.times(2)
    if (hasUpgrade("sg2", 22)) gain = gain.times(2)
    if (hasUpgrade("sg3", 22)) gain = gain.times(2)
    if (hasUpgrade("sg4", 22)) gain = gain.times(2)
    if (hasUpgrade("sg5", 22)) gain = gain.times(2)
    if (hasUpgrade("sg6", 22)) gain = gain.times(4)
    if (hasUpgrade("sg7", 22)) gain = gain.times(4)
    if (hasUpgrade("sg8", 22)) gain = gain.times(4)
    if (hasUpgrade("sg9", 22)) gain = gain.times(4)
    if (hasUpgrade("sg10", 22)) gain = gain.times(4)
    if (hasUpgrade("sg11", 22)) gain = gain.times(8)
    if (hasUpgrade("sg12", 22)) gain = gain.times(8)
    if (hasUpgrade("sg13", 22)) gain = gain.times(8)
    if (hasUpgrade("sg14", 22)) gain = gain.times(8)
    if (hasUpgrade("sg15", 22)) gain = gain.times(8)
    if (hasUpgrade("sg16", 22)) gain = gain.times(20)
    if (hasUpgrade("sg17", 22)) gain = gain.times(20)
    if (hasUpgrade("sg18", 22)) gain = gain.times(20)
    if (hasUpgrade("sg19", 22)) gain = gain.times(20)
    if (hasUpgrade("sg20", 22)) gain = gain.times(20)
    if (hasUpgrade("sg21", 22)) gain = gain.times(20)
    if (hasUpgrade("sg22", 22)) gain = gain.times(20)
    if (hasUpgrade("oa1", 22)) gain = gain.times(2)
    if (hasUpgrade("oa2", 22)) gain = gain.times(2)
    if (hasUpgrade("oa3", 22)) gain = gain.times(2)
    if (hasUpgrade("oa4", 22)) gain = gain.times(2)
    if (hasUpgrade("oa5", 22)) gain = gain.times(2)
    if (hasUpgrade("oa6", 22)) gain = gain.times(4)
    if (hasUpgrade("oa7", 22)) gain = gain.times(4)
    if (hasUpgrade("oa8", 22)) gain = gain.times(4)
    if (hasUpgrade("oa9", 22)) gain = gain.times(4)
    if (hasUpgrade("oa10", 22)) gain = gain.times(4)
    if (hasUpgrade("oa11", 22)) gain = gain.times(8)
    if (hasUpgrade("oa12", 22)) gain = gain.times(8)
    if (hasUpgrade("oa13", 22)) gain = gain.times(8)
    if (hasUpgrade("oa14", 22)) gain = gain.times(8)
    if (hasUpgrade("oa15", 22)) gain = gain.times(8)
    if (hasUpgrade("oa16", 22)) gain = gain.times(20)
    if (hasUpgrade("oa17", 22)) gain = gain.times(20)
    if (hasUpgrade("oa18", 22)) gain = gain.times(20)
    if (hasUpgrade("oa19", 22)) gain = gain.times(20)
    if (hasUpgrade("oa20", 22)) gain = gain.times(20)
    if (hasUpgrade("oa21", 22)) gain = gain.times(20)
    if (hasUpgrade("oa22", 22)) gain = gain.times(20)
    if (getBuyableAmount("gc", 12).gte(1)) gain = gain.times(buyableEffect("gc", 12))
    if (getBuyableAmount("fu", 12).gte(1)) gain = gain.times(buyableEffect("fu", 12))
    if (getBuyableAmount("pl", 12).gte(1)) gain = gain.times(buyableEffect("pl", 12))
    if (getBuyableAmount("mw", 12).gte(1)) gain = gain.times(buyableEffect("mw", 12))
    if (getBuyableAmount("or1", 12).gte(1)) gain = gain.times(buyableEffect("or1", 12))
    if (getBuyableAmount("or2", 12).gte(1)) gain = gain.times(buyableEffect("or2", 12))
    if (getBuyableAmount("or3", 12).gte(1)) gain = gain.times(buyableEffect("or3", 12))
    if (getBuyableAmount("or4", 12).gte(1)) gain = gain.times(buyableEffect("or4", 12))
    if (getBuyableAmount("or6", 12).gte(1)) gain = gain.times(buyableEffect("or6", 12))
    if (getBuyableAmount("or7", 12).gte(1)) gain = gain.times(buyableEffect("or7", 12))
    if (getBuyableAmount("or8", 12).gte(1)) gain = gain.times(buyableEffect("or8", 12))
    if (getBuyableAmount("or9", 12).gte(1)) gain = gain.times(buyableEffect("or9", 12))
    if (getBuyableAmount("or10", 12).gte(1)) gain = gain.times(buyableEffect("or10", 12))
    if (getBuyableAmount("or11", 12).gte(1)) gain = gain.times(buyableEffect("or11", 12))
    if (getBuyableAmount("or12", 12).gte(1)) gain = gain.times(buyableEffect("or12", 12))
    if (getBuyableAmount("or13", 12).gte(1)) gain = gain.times(buyableEffect("or13", 12))
    if (getBuyableAmount("or14", 12).gte(1)) gain = gain.times(buyableEffect("or14", 12))
    if (getBuyableAmount("or15", 12).gte(1)) gain = gain.times(buyableEffect("or15", 12))
    if (getBuyableAmount("or16", 12).gte(1)) gain = gain.times(buyableEffect("or16", 12))
    if (getBuyableAmount("or17", 12).gte(1)) gain = gain.times(buyableEffect("or17", 12))
    if (getBuyableAmount("or18", 12).gte(1)) gain = gain.times(buyableEffect("or18", 12))
    if (getBuyableAmount("or19", 12).gte(1)) gain = gain.times(buyableEffect("or19", 12))
    if (getBuyableAmount("or20", 12).gte(1)) gain = gain.times(buyableEffect("or20", 12))
    if (getBuyableAmount("or21", 12).gte(1)) gain = gain.times(buyableEffect("or21", 12))
    if (getBuyableAmount("or22", 12).gte(1)) gain = gain.times(buyableEffect("or22", 12))
    if (getBuyableAmount("pe1", 12).gte(1)) gain = gain.times(buyableEffect("pe1", 12))
    if (getBuyableAmount("pe2", 12).gte(1)) gain = gain.times(buyableEffect("pe2", 12))
    if (getBuyableAmount("pe4", 12).gte(1)) gain = gain.times(buyableEffect("pe4", 12))
    if (getBuyableAmount("pe5", 12).gte(1)) gain = gain.times(buyableEffect("pe5", 12))
    if (getBuyableAmount("pe6", 12).gte(1)) gain = gain.times(buyableEffect("pe6", 12))
    if (getBuyableAmount("pe7", 12).gte(1)) gain = gain.times(buyableEffect("pe7", 12))
    if (getBuyableAmount("pe8", 12).gte(1)) gain = gain.times(buyableEffect("pe8", 12))
    if (getBuyableAmount("pe9", 12).gte(1)) gain = gain.times(buyableEffect("pe9", 12))
    if (getBuyableAmount("pe10", 12).gte(1)) gain = gain.times(buyableEffect("pe10", 12))
    if (getBuyableAmount("pe11", 12).gte(1)) gain = gain.times(buyableEffect("pe11", 12))
    if (getBuyableAmount("pe12", 12).gte(1)) gain = gain.times(buyableEffect("pe12", 12))
    if (getBuyableAmount("pe13", 12).gte(1)) gain = gain.times(buyableEffect("pe13", 12))
    if (getBuyableAmount("pe14", 12).gte(1)) gain = gain.times(buyableEffect("pe14", 12))
    if (getBuyableAmount("pe15", 12).gte(1)) gain = gain.times(buyableEffect("pe15", 12))
    if (getBuyableAmount("pe16", 12).gte(1)) gain = gain.times(buyableEffect("pe16", 12))
    if (getBuyableAmount("pe17", 12).gte(1)) gain = gain.times(buyableEffect("pe17", 12))
    if (getBuyableAmount("pe18", 12).gte(1)) gain = gain.times(buyableEffect("pe18", 12))
    if (getBuyableAmount("pe19", 12).gte(1)) gain = gain.times(buyableEffect("pe19", 12))
    if (getBuyableAmount("pe20", 12).gte(1)) gain = gain.times(buyableEffect("pe20", 12))
    if (getBuyableAmount("pe21", 12).gte(1)) gain = gain.times(buyableEffect("pe21", 12))
    if (getBuyableAmount("pe22", 12).gte(1)) gain = gain.times(buyableEffect("pe22", 12))
    if (getBuyableAmount("sg1", 12).gte(1)) gain = gain.times(buyableEffect("sg1", 12))
    if (getBuyableAmount("sg2", 12).gte(1)) gain = gain.times(buyableEffect("sg2", 12))
    if (getBuyableAmount("sg3", 12).gte(1)) gain = gain.times(buyableEffect("sg3", 12))
    if (getBuyableAmount("sg4", 12).gte(1)) gain = gain.times(buyableEffect("sg4", 12))
    if (getBuyableAmount("sg5", 12).gte(1)) gain = gain.times(buyableEffect("sg5", 12))
    if (getBuyableAmount("sg6", 12).gte(1)) gain = gain.times(buyableEffect("sg6", 12))
    if (getBuyableAmount("sg7", 12).gte(1)) gain = gain.times(buyableEffect("sg7", 12))
    if (getBuyableAmount("sg8", 12).gte(1)) gain = gain.times(buyableEffect("sg8", 12))
    if (getBuyableAmount("sg9", 12).gte(1)) gain = gain.times(buyableEffect("sg9", 12))
    if (getBuyableAmount("sg10", 12).gte(1)) gain = gain.times(buyableEffect("sg10", 12))
    if (getBuyableAmount("sg11", 12).gte(1)) gain = gain.times(buyableEffect("sg11", 12))
    if (getBuyableAmount("sg12", 12).gte(1)) gain = gain.times(buyableEffect("sg12", 12))
    if (getBuyableAmount("sg13", 12).gte(1)) gain = gain.times(buyableEffect("sg13", 12))
    if (getBuyableAmount("sg14", 12).gte(1)) gain = gain.times(buyableEffect("sg14", 12))
    if (getBuyableAmount("sg15", 12).gte(1)) gain = gain.times(buyableEffect("sg15", 12))
    if (getBuyableAmount("sg16", 12).gte(1)) gain = gain.times(buyableEffect("sg16", 12))
    if (getBuyableAmount("sg17", 12).gte(1)) gain = gain.times(buyableEffect("sg17", 12))
    if (getBuyableAmount("sg18", 12).gte(1)) gain = gain.times(buyableEffect("sg18", 12))
    if (getBuyableAmount("sg19", 12).gte(1)) gain = gain.times(buyableEffect("sg19", 12))
    if (getBuyableAmount("sg20", 12).gte(1)) gain = gain.times(buyableEffect("sg20", 12))
    if (getBuyableAmount("sg21", 12).gte(1)) gain = gain.times(buyableEffect("sg21", 12))
    if (getBuyableAmount("sg22", 12).gte(1)) gain = gain.times(buyableEffect("sg22", 12))
    if (getBuyableAmount("oa1", 12).gte(1)) gain = gain.times(buyableEffect("oa1", 12))
    if (getBuyableAmount("oa2", 12).gte(1)) gain = gain.times(buyableEffect("oa2", 12))
    if (getBuyableAmount("oa3", 12).gte(1)) gain = gain.times(buyableEffect("oa3", 12))
    if (getBuyableAmount("oa4", 12).gte(1)) gain = gain.times(buyableEffect("oa4", 12))
    if (getBuyableAmount("oa5", 12).gte(1)) gain = gain.times(buyableEffect("oa5", 12))
    if (getBuyableAmount("oa7", 12).gte(1)) gain = gain.times(buyableEffect("oa7", 12))
    if (getBuyableAmount("oa8", 12).gte(1)) gain = gain.times(buyableEffect("oa8", 12))
    if (getBuyableAmount("oa9", 12).gte(1)) gain = gain.times(buyableEffect("oa9", 12))
    if (getBuyableAmount("oa10", 12).gte(1)) gain = gain.times(buyableEffect("oa10", 12))
    if (getBuyableAmount("oa11", 12).gte(1)) gain = gain.times(buyableEffect("oa11", 12))
    if (getBuyableAmount("oa12", 12).gte(1)) gain = gain.times(buyableEffect("oa12", 12))
    if (getBuyableAmount("oa13", 12).gte(1)) gain = gain.times(buyableEffect("oa13", 12))
    if (getBuyableAmount("oa14", 12).gte(1)) gain = gain.times(buyableEffect("oa14", 12))
    if (getBuyableAmount("oa15", 12).gte(1)) gain = gain.times(buyableEffect("oa15", 12))
    if (getBuyableAmount("oa16", 12).gte(1)) gain = gain.times(buyableEffect("oa16", 12))
    if (getBuyableAmount("oa17", 12).gte(1)) gain = gain.times(buyableEffect("oa17", 12))
    if (getBuyableAmount("oa18", 12).gte(1)) gain = gain.times(buyableEffect("oa18", 12))
    if (getBuyableAmount("oa19", 12).gte(1)) gain = gain.times(buyableEffect("oa19", 12))
    if (getBuyableAmount("oa20", 12).gte(1)) gain = gain.times(buyableEffect("oa20", 12))
    if (getBuyableAmount("oa21", 12).gte(1)) gain = gain.times(buyableEffect("oa21", 12))
    if (getBuyableAmount("oa22", 12).gte(1)) gain = gain.times(buyableEffect("oa22", 12))
    if (getBuyableAmount("lg", 12).gte(1)) gain = gain.times(buyableEffect("lg", 12))
    if (getBuyableAmount("vc", 12).gte(1)) gain = gain.times(buyableEffect("vc", 12))
    if (getBuyableAmount("ln", 12).gte(1)) gain = gain.times(buyableEffect("ln", 12))
    if (getBuyableAmount("cw", 12).gte(1)) gain = gain.times(buyableEffect("cw", 12))
    if (getBuyableAmount("ga", 12).gte(1)) gain = gain.times(buyableEffect("ga", 12))
    if (getBuyableAmount("hr", 11).gte(1)) gain = gain.times(buyableEffect("hr", 11))
    if (player.or7.heavy.gte(1)) gain = gain.times(player.or7.heavy.add(1).log(10).plus(1).pow(2))
    if (hasUpgrade("dm", 12)) gain = gain.times(1e3)
    if (hasUpgrade("dm", 21)) gain = gain.times(1e5)
    if (hasUpgrade("mw", 22)) gain = gain.times(50)
    if (hasUpgrade("lg", 22)) gain = gain.times(100)
    if (hasUpgrade("vc", 22)) gain = gain.times(100)
    if (hasUpgrade("ln", 22)) gain = gain.times(100)
    if (hasUpgrade("cw", 22)) gain = gain.times(100)
    if (hasUpgrade("ga", 22)) gain = gain.times(100)
    if (hasUpgrade("de", 22)) gain = gain.times(1e4)
    if (hasUpgrade("hr", 11)) gain = gain.times(1e6)
    if (hasUpgrade("hr", 14)) gain = gain.times(1e10)
    if (hasUpgrade("lg", 31)) gain = gain.times(upgradeEffect("lg", 31))
    if (hasUpgrade("vc", 31)) gain = gain.times(upgradeEffect("vc", 31))
    if (hasUpgrade("ln", 31)) gain = gain.times(upgradeEffect("ln", 31))
    if (hasUpgrade("cw", 31)) gain = gain.times(upgradeEffect("cw", 31))
    if (hasUpgrade("ga", 31)) gain = gain.times(upgradeEffect("ga", 31))
    if (hasMilestone("hr", 3)) gain = gain.times(1e10)
    if (hasChallenge("oa6", 11)) gain = gain.times(challengeEffect("oa6", 11))
    for (let i = 10; i <= 69; i++) {
        if (hasAchievement("a", i)) gain = gain.times(achievementEffect("a", i))
    }
    // Trials 12/21/22: "stardust gain throttled to 1%". A hard zero would make
    // them unwinnable now that trial entry resets stardust (nothing could grow).
    if (inChallenge("oa6", 12) || inChallenge("oa6", 21) || inChallenge("oa6", 22)) gain = gain.mul(0.01).max(1)
    return gain
}

function addedPlayerData() { return {} }

var displayThings = [
    function() { return "The Galaxy Nebula — zoom level: " + (player.hr.total.gte(1) ? "the cosmic horizon" : player.mw.unlocked ? "deep field" : player.or11.unlocked ? "the cluster era" : player.or6.unlocked ? "the galactic era" : player.or1.unlocked ? "the stellar era" : "the ignition sequence") },
    function() { if (player.dm.darkMatter.gte(1)) return "You have " + format(player.dm.darkMatter) + " dark matter." },
    function() { if (player.or7.heavy.gte(1)) return "You have " + format(player.or7.heavy) + " heavy elements." },
]

function isEndgame() {
    // total (light-years ever gathered), not the current amount: hr M7 and the
    // achievements count total, and hr's auto-upgrades spend the current ones.
    return player.hr.total.gte(25)
}

var backgroundStyle = {}

function maxTickLength() {
    return 3600
}

function fixOldSave(oldVersion) {
}