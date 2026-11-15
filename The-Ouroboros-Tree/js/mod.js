let modInfo = {
	name: "The Ouroboros Tree",
    id: "the-ouroboros-tree-2fx53a",  // savefile key — set once, NEVER change (changing it erases all saves)
	name_zh: "衔尾树",
	author: "chenf888",
	pointsName: "微响",
	modFiles: ["tuning.js", "layers1.js", "layers2.js", "layers3.js", "layers4.js", "side.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "The First Chime",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1 — The First Chime</h3><br>
		- 12-layer self-amplification chain: ripples → echoes → resonance → standing waves → feedback loops → overtones → interference → self-oscillation → chaos → fractals → singularity → ouroboros.<br>
		- Every layer carries its own self-gain loop (自增益项).<br>
		- Endgame: the tuning manifold — retune the gain exponent of all 13 currencies.<br>
		- Difficulty: choose Easy or Hard when the game starts (Hard = root gain ÷ 8).<br>
		- 50 achievements, EN/中文 toggle in the Settings panel.`

// winText is a FUNCTION (T2 + 07 F3 — never interpolate text at top level)
let winText = function() {
	return lg(
		"树吃掉了自己的尾巴。每一条回路都在谐振中共鸣。—— chenf888",
		"The tree has eaten its tail. Every loop now sings in tune. — chenf888"
	)
}

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
var doNotCallTheseFunctionsEveryTick = []

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Points do not generate at all until a mode is chosen (the start gate, Q6)
function canGenPoints(){
	return player.modeChosen === true
}

// ---- the root economy (wiring map: every promised boost lands here) ----
// humZoneList is the single source of truth for the root's multiplier zones —
// getPointGen reduces it; ri's Formula tab renders the same list.
function humZoneList() {
	const z = []
	const add = (n, v) => z.push({ n, v })
	// ri upgrades — flat/absolute bonuses first (handbook 12: exponents are bad early)
	if (hasUpgrade("ri", 11)) add(lg("初响", "First Chime"), new Decimal(2))
	if (hasUpgrade("ri", 14)) add(lg("共振", "Resonate"), upgradeEffect("ri", 14))          // points^0.25
	if (hasUpgrade("ri", 22) && player.points.gte(1e4)) add(lg("浪尖", "Crest"), new Decimal(3))
	if (hasUpgrade("ri", 23)) add(lg("众声", "Chorus"), Decimal.pow(player.a.achievements.length + 1, 0.5))
	if (hasUpgrade("re", 22)) add(lg("频谱分析（谐振）", "Spectrum Analysis (Resonance)"), upgradeEffect("re", 22))
	if (hasUpgrade("sw", 22)) add(lg("共振放大（驻波）", "Resonant Amplifier (Standing Wave)"), upgradeEffect("sw", 22))
	if (hasUpgrade("fl", 14)) add(lg("信号增益（反馈环）", "Signal Gain (Feedback)"), upgradeEffect("fl", 14))
	if (hasUpgrade("ov", 22)) add(lg("高音清洗（泛音）", "Treble Wash (Overtone)"), upgradeEffect("ov", 22))
	if (hasUpgrade("in", 11)) add(lg("相长干涉（干波）", "Constructive Interference (Interference)"), new Decimal(2.5))
	if (hasUpgrade("in", 31)) add(lg("全谱共振（干波）", "Full-Spectrum Resonance (Interference)"), new Decimal(3))
	if (hasMilestone("in", 4)) add(lg("全谱轰鸣（干波）", "Full-Spectrum Roar (Interference)"), new Decimal(5))
	if (hasUpgrade("ou", 14)) add(lg("时间闭环（衔尾）", "Closed Timelike Curve (Ouroboros)"), upgradeEffect("ou", 14))
	if (hasMilestone("ou", 5)) add(lg("万流归一（衔尾）", "All Streams Converge (Ouroboros)"), player.si.points.add(1).pow(0.25))
	// ri milestones — both sides (ripple zones live in layers.ri.zoneList())
	if (hasMilestone("ri", 0)) add(lg("涟心", "Ripple Heart"), hasUpgrade("ri", 24) ? new Decimal(5) : new Decimal(2.5))
	if (hasMilestone("ri", 2)) add(lg("叠浪", "Compound Waves"), new Decimal(3))
	// ri buyable 石子
	add(lg("石子", "Pebbles"), buyableEffect("ri", 11))
	// the echo web — every deeper layer's echo boosts the root (P10)
	add(lg("回声网", "Echo web"), echoWeb(["ec", "re", "sw", "fl", "ov", "in", "so", "ch", "fr", "si", "ou"]))
	// named point boosts from deeper layers' first upgrades
	if (hasUpgrade("ec", 11)) add(lg("回声定位（回声）", "Echolocate (Echo)"), new Decimal(2))
	if (hasUpgrade("ec", 15)) add(lg("声浪（回声）", "Sound Surge (Echo)"), new Decimal(2.5))
	if (hasUpgrade("ec", 23)) add(lg("共鸣腔（回声）", "Resonant Cavity (Echo)"), new Decimal(3))
	if (hasUpgrade("re", 11)) add(lg("谐振基准（谐振）", "Reference Tone (Resonance)"), new Decimal(2))
	if (hasUpgrade("sw", 11)) add(lg("地基（驻波）", "Foundation (Standing Wave)"), new Decimal(3))
	if (hasUpgrade("fl", 11)) add(lg("反馈启动（反馈环）", "Loop Start (Feedback)"), new Decimal(2))
	if (hasUpgrade("ov", 11)) add(lg("基频（泛音）", "Fundamental (Overtone)"), new Decimal(2))
	if (hasUpgrade("so", 11)) add(lg("起振（自振荡）", "Kickstart (Self-Osc.)"), new Decimal(2))
	if (hasUpgrade("ch", 11)) add(lg("蝴蝶振翅（混沌）", "Butterfly Flap (Chaos)"), new Decimal(3))
	if (hasUpgrade("fr", 11)) add(lg("自我复制（分形）", "Self-Replication (Fractal)"), new Decimal(3))
	if (hasUpgrade("si", 11)) add(lg("引力坍缩（奇点）", "Gravitational Collapse (Singularity)"), new Decimal(3))
	if (hasUpgrade("ou", 11)) add(lg("衔尾之首（衔尾）", "Head of the Snake (Ouroboros)"), new Decimal(10))
	// achievement flat rewards on the root
	add(lg("成就之力", "Achievements"), achievementReward("points"))
	return z
}

function getPointGen() {
	if (!canGenPoints()) return new Decimal(0)

	// multiplicative zones (single source of truth — see humZoneList)
	let gain = zoneProduct(humZoneList())

	// the tuning manifold reshapes the root exponent (Q8, endgame)
	gain = gain.pow(manifoldMod("points"))

	// hard mode: the root valve (Q6)
	gain = gain.div(difficultyDivisor())
	return gain
}

// achievement flat rewards, read by getPointGen / each layer's gainMult.
// kind: "points" | a layer id — keeps the wiring table in one place.
function achievementReward(kind) {
	let m = new Decimal(1)
	const P = [
		[11, 1.5], [14, 2], [22, 1.5], [25, 2], [32, 2], [35, 1.5], [42, 2], [45, 2],
		[52, 2], [55, 3], [62, 2], [65, 3], [72, 3], [75, 5], [82, 5], [85, 10], [92, 10], [95, 25],
	]
	for (let i = 0; i < P.length; i++) {
		if (P[i][1] > 1.5 && kind !== "points") continue // the big ones boost the root only
		if (hasAchievement("a", P[i][0])) m = m.times(P[i][1])
	}
	return m
}

// You can add non-layer related variables that should go into "player" and be saved here
function addedPlayerData() { return {
	difficulty: null,      // "easy" | "hard" | null until the mode node is used (Q6)
	modeChosen: false,     // the start gate
	chinesemode: false,    // T2 language flag — ENGLISH default (Q7)
}}

// Display extra things at the top of the page
var displayThings = [
	function() {
		if (!player.modeChosen) return "<b style='color:#ffd54f;font-size:1.15em'>" +
			lg("先选择模式：点击树旁的「式」节点 —— 简单 = 经典节奏，困难 = 根增益 ÷8 的超级大墙",
			   "Choose a mode first: click the 式 node beside the tree — Easy = classic pacing, Hard = root gain ÷ 8") + "</b>"
	},
	function() {
		if (!player.modeChosen) return
		let mode = player.difficulty === "hard"
			? lg("困难 Hard（根增益 ÷8）", "Hard (root gain ÷ 8)")
			: lg("简单 Easy（经典节奏）", "Easy (classic pacing)")
		return lg("模式 Mode：", "Mode: ") + mode
	},
]

// Determines when the game "ends" — the final ring closes at 1e4 lifetime ouroboros currency
// (total, not points: the manifold is a spending sink, and spending should never delay the win)
function isEndgame() {
	return player.ou.total.gte(new Decimal("1e4"))
}

// Style for the background, can be a function
var backgroundStyle = {}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version.
function fixOldSave(oldVersion){
}
