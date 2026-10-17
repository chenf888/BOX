/* =========================================================================
 *  历 / al  —  row 1, the almanac (历书 · 皇历).
 *  The calendar is printed from the first 立春 and never resets: 历筹 (almanac tokens)
 *  accumulate for the whole run, and this layer's doReset keeps EVERYTHING. Its three
 *  markets (M8) spend 历筹 on meta-effects for the named mechanics of other layers, its
 *  七十二候 chart (M10) prints the names of the pentads you have observed, and its
 *  编历 bar is the counter of the collection.
 *
 *  The 72 names below are the canonical 《月令七十二候集解》 set — the chart IS the game.
 * ========================================================================= */

/* The 七十二候 chart, in reading order: 8 节 x 9 候 (row*100+col, hard rule 10). */
var AL_HOU_NAMES = [
	["东风解冻", "east wind thaws the ice"],
	["蛰虫始振", "hibernating insects stir"],
	["鱼陟负冰", "fish rise against the ice"],
	["獭祭鱼", "otters lay out their catch"],
	["候雁北", "wild geese head north"],
	["草木萌动", "plants put out shoots"],
	["桃始华", "peach trees bloom"],
	["仓庚鸣", "orioles sing"],
	["鹰化为鸠", "hawks turn to doves"],   // 立春 / 雨水 / 惊蛰
	["玄鸟至", "swallows return"],
	["雷乃发声", "thunder sounds"],
	["始电", "lightning begins"],
	["桐始华", "paulownia blooms"],
	["田鼠化为鴽", "voles turn to quail"],
	["虹始见", "the first rainbow"],
	["萍始生", "duckweed grows"],
	["鸣鸠拂其羽", "doves preen their wings"],
	["戴胜降于桑", "hoopoes land on the mulberry"],   // 春分 / 清明 / 谷雨
	["蝼蝈鸣", "mole crickets sing"],
	["蚯蚓出", "earthworms emerge"],
	["王瓜生", "snake gourds grow"],
	["苦菜秀", "sow thistles flower"],
	["靡草死", "delicate grasses wither"],
	["麦秋至", "the wheat ripens"],
	["螳螂生", "mantises hatch"],
	["鵙始鸣", "shrikes begin to call"],
	["反舌无声", "mockingbirds fall silent"],   // 立夏 / 小满 / 芒种
	["鹿角解", "deer shed their antlers"],
	["蜩始鸣", "cicadas begin to sing"],
	["半夏生", "pinellia sprouts"],
	["温风至", "warm winds arrive"],
	["蟋蟀居宇", "crickets take to the walls"],
	["鹰始鸷", "hawks begin to hunt"],
	["腐草为萤", "rotten grass becomes fireflies"],
	["土润溽暑", "the earth is damp and sultry"],
	["大雨时行", "great rains fall"],   // 夏至 / 小暑 / 大暑
	["凉风至", "cool winds arrive"],
	["白露降", "white dew falls"],
	["寒蝉鸣", "cicadas grow cold"],
	["鹰乃祭鸟", "hawks lay out their prey"],
	["天地始肃", "heaven and earth turn austere"],
	["禾乃登", "the grain is harvested"],
	["鸿雁来", "swan geese come"],
	["玄鸟归", "swallows leave"],
	["群鸟养羞", "birds store their food"],   // 立秋 / 处暑 / 白露
	["雷始收声", "thunder ceases"],
	["蛰虫坯户", "insects seal their burrows"],
	["水始涸", "the waters dry"],
	["鸿雁来宾", "swan geese arrive as guests"],
	["雀入大水为蛤", "sparrows turn to clams"],
	["菊有黄华", "chrysanthemums bloom"],
	["豺乃祭兽", "jackals lay out their kill"],
	["草木黄落", "plants yellow and fall"],
	["蛰虫咸俯", "insects all bow down"],   // 秋分 / 寒露 / 霜降
	["水始冰", "water begins to freeze"],
	["地始冻", "the ground begins to freeze"],
	["雉入大水为蜃", "pheasants turn to clams"],
	["虹藏不见", "rainbows hide"],
	["天气上升地气下降", "sky rises, earth sinks"],
	["闭塞而成冬", "all closes into winter"],
	["鹖鴠不鸣", "crows fall silent"],
	["虎始交", "tigers begin to mate"],
	["荔挺出", "rush grass sprouts"],   // 立冬 / 小雪 / 大雪
	["蚯蚓结", "earthworms knot"],
	["麋角解", "elks shed their antlers"],
	["水泉动", "the springs begin to move"],
	["雁北乡", "wild geese head north"],
	["鹊始巢", "magpies build their nests"],
	["雉始雊", "pheasants begin to call"],
	["鸡始乳", "hens begin to brood"],
	["征鸟厉疾", "birds of prey circle swiftly"],
	["水泽腹坚", "the ice hardens to its centre"],   // 冬至 / 小寒 / 大寒
]

function alHouAt(id) {
	let r = Math.floor(id / 100)      // 1..8 -> the 节
	let c = id % 100                  // 1..9  -> the pentad slot
	// NaN-safe on purpose: updateTempData() calls every grid function that is not in
	// the engine's activeFunctions list with NO argument, and NaN fails both < and >
	// — so a bare range test lets id === undefined through and returns a broken
	// {name: undefined} whose .name[0] then throws on every temp refresh.
	if (!(r >= 1 && r <= 8) || !(c >= 1 && c <= 9)) return null
	let node = SEASON_IDS[r - 1]
	let slot = HOU_SLOTS[c - 1]
	return { node: node, slot: slot, name: AL_HOU_NAMES[(r - 1) * 9 + (c - 1)], term: Math.floor((r - 1) * 3 + (c - 1) / 3) }
}
function alObserved(id) {
	let at = alHouAt(id)
	if (!at) return false
	return hasUpgrade(at.node, at.slot)
}
function alTermName(k) {
	return ["立春", "Spring Begins", "雨水", "Rain Water", "惊蛰", "Awakening of Insects", "春分", "Spring Equinox", "清明", "Pure Brightness", "谷雨", "Grain Rain", "立夏", "Summer Begins", "小满", "Grain Buds", "芒种", "Grain in Ear", "夏至", "Summer Solstice", "小暑", "Minor Heat", "大暑", "Major Heat", "立秋", "Autumn Begins", "处暑", "End of Heat", "白露", "White Dew", "秋分", "Autumn Equinox", "寒露", "Cold Dew", "霜降", "Frost Descent", "立冬", "Winter Begins", "小雪", "Minor Snow", "大雪", "Major Snow", "冬至", "Winter Solstice", "小寒", "Minor Cold", "大寒", "Major Cold"][k]
}

addLayer("al", {
	name: function() { return L("历", "Almanac") },
	symbol: function() { return L("历", "AL") },
	position: 1,
	row: 1,
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
		editions: 0,
	}},
	color: "#C792EA",
	resource: function() { return L("历筹", "almanac tokens") },
	baseResource: function() { return L("立春候", "Lichun Hou") },
	baseAmount() { return player.lc.points },
	requires: new Decimal(500),
	type: "normal",
	exponent: 1 / 3,
	gainMult() {
		let ret = new Decimal(1)
		if (hasUpgrade("al", 12)) ret = ret.times(upgradeEffect("al", 12))
		if (hasUpgrade("al", 21)) ret = ret.times(upgradeEffect("al", 21))
		if (hasUpgrade("al", 23)) ret = ret.times(upgradeEffect("al", 23))
		if (getBuyableAmount("al", 13).gt(0)) ret = ret.times(buyableEffect("al", 13))
		if (hasMilestone("al", 0)) ret = ret.times(1.5)
		if (hasMilestone("al", 2)) ret = ret.times(4)
		ret = ret.times(suiTrialMult())
		return ret
	},
	gainExp() { return new Decimal(1) },
	passiveGeneration() {
		if (hasMilestone("al", 1) || hasMilestone("sui", 3)) return 1
		return 0
	},
	autoUpgrade() {
		if (hasMilestone("al", 2) || hasMilestone("sui", 3)) return true
		return false
	},
	resetsNothing() {
		if (hasMilestone("sui", 3)) return true
		return false
	},
	layerShown() { return player.al.unlocked || player.lc.best.gte(5) },
	prestigeButtonText() {
		return L("修历得 <b>" + formatWhole(tmp.al.resetGain) + "</b> 历筹（历书不灭，只添不削）", "Revise the calendar for <b>" + formatWhole(tmp.al.resetGain) + "</b> tokens (the almanac only grows)")
	},
	doReset(resettingLayer) {
		// 历书不灭 — the almanac keeps everything, including its own tokens.
		layerDataReset("al", ["unlocked", "points", "best", "total", "upgrades", "milestones", "buyables", "editions"])
	},
	update(diff) {
		// 编历: the bar is the collection itself — 72 tiles, and the last one pays.
		if (houObserved() >= TUNING.HOU_TOTAL && player.al.editions < 1) player.al.editions = 1
	},

	upgrades: {
		11: {
			title: function() { return L("平气", "Smoothing the Qi") },
			description: function() { return L("日影产出 ×2。", "Sun-shadow output ×2.") },
			cost: new Decimal(TUNING.AL_UPG_COSTS[11]),
			effect() { return new Decimal(2) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		12: {
			title: function() { return L("候历", "The Pentad Calendar") },
			description: function() { return L("已察之候皆成力：所有候产 ×(1 + 已察候/20)。", "Every observed pentad tells: all 候 output x (1 + observed/20).") },
			cost: new Decimal(TUNING.AL_UPG_COSTS[12]),
			effect() { return new Decimal(1).add(houObserved() / 20) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		13: {
			title: function() { return L("置闰", "Intercalation") },
			description: function() { return L("九候既察之后，历书三市之价 ×0.9。", "Once nine pentads are observed, the three markets cost x0.9.") },
			cost: new Decimal(TUNING.AL_UPG_COSTS[13]),
			effect() {
				if (houObserved() >= 9) return new Decimal(0.9)
				return new Decimal(1)
			},
			effectDisplay() { return "×" + format(this.effect()) },
		},
		14: {
			title: function() { return L("圭表", "The Gnomon") },
			description: function() { return L("立表测影：日影产出 ×2。", "Set up the gnomon: sun-shadow output ×2.") },
			cost: new Decimal(TUNING.AL_UPG_COSTS[14]),
			effect() { return new Decimal(2) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		15: {
			title: function() { return L("授时", "Granting the Seasons") },
			description: function() { return L("历既成，立春之候亦增：立春候产 ×(log10(立春候+1)+1)。", "With the calendar made, 立春 grows too: 立春候 output x (log10(立春候+1)+1).") },
			cost: new Decimal(TUNING.AL_UPG_COSTS[15]),
			effect() { return player.lc.points.add(1).log(10).add(1) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		21: {
			title: function() { return L("岁实", "The Solar Year") },
			description: function() { return L("二十四气周之后，历筹 ×2。", "Once all 24 terms are reached, tokens ×2.") },
			cost: new Decimal(TUNING.AL_UPG_COSTS[21]),
			effect() {
				if (termsReached() >= 24) return new Decimal(2)
				return new Decimal(1)
			},
			effectDisplay() { return "×" + format(this.effect()) },
		},
		22: {
			title: function() { return L("朔望", "New Moon and Full") },
			description: function() { return L("推步更密：所有候的软上限 ×1000。", "Finer reckoning: every 候 softcap ×1000.") },
			cost: new Decimal(TUNING.AL_UPG_COSTS[22]),
			unlocked() { return player.al.best.gte(20) },
		},
		23: {
			title: function() { return L("历元", "The Epoch") },
			description: function() { return L("以历筹为元：历筹产 ×(log10(历筹/1e3+1)+1)^0.2。", "The epoch of tokens: token output x (log10(tokens/1e3+1)+1)^0.2.") },
			cost: new Decimal(TUNING.AL_UPG_COSTS[23]),
			effect() { return player.al.points.div(1e3).add(1).log(10).add(1).pow(0.2) },
			effectDisplay() { return "×" + format(this.effect()) },
		},
		24: {
			title: function() { return L("岁差", "Precession") },
			description: function() { return L("岁差既明，历书三市更精：其效果指数 ×1 ~ ×1.36（随已察之候而长）。", "Precession sharpens the three markets: their effect exponent becomes x1 .. x1.36, growing with observed pentads.") },
			cost: new Decimal(TUNING.AL_UPG_COSTS[24]),
			effect() { return new Decimal(1).add(houObserved() / 200).min(1.36) },
			effectDisplay() { return L("历书三市 ^", "the three markets ^") + format(this.effect()) },
		},
		25: {
			title: function() { return L("七十二候图", "The Seventy-Two Chart") },
			description: function() { return L("开启七十二候图（tab）：八节九候，尽列其名。", "Unlock the 72-pentad chart (tab): eight nodes, nine pentads each, every name printed.") },
			cost: new Decimal(TUNING.AL_UPG_COSTS[25]),
			unlocked() { return houObserved() >= 3 },
		},
	},

	milestones: {
		0: {
			requirementDescription: function() { return L("历筹 ≥ 1", "1 almanac token") },
			effectDescription: function() { return L("历筹产 ×1.5；七十二候图可开。", "Token output x1.5; the 72-pentad chart opens.") },
			done() { return player.al.best.gte(1) },
		},
		1: {
			requirementDescription: function() { return L("历筹 ≥ 5", "5 tokens") },
			effectDescription: function() { return L("修历自行 —— 历书每秒自修一次。", "The calendar revises itself once a second.") },
			done() { return player.al.best.gte(5) },
		},
		2: {
			requirementDescription: function() { return L("历筹 ≥ 25", "25 tokens") },
			effectDescription: function() { return L("历书自购（可买即买）；历筹产 ×4。", "The almanac buys its own entries; token output x4.") },
			done() { return player.al.best.gte(25) },
		},
		3: {
			requirementDescription: function() { return L("已察二十四候", "24 pentads observed") },
			effectDescription: function() { return L("日影 ×3；历书三市之效再 ^1.02。", "Sun-shadow x3; the three markets gain another ^1.02.") },
			done() { return houObserved() >= 24 },
		},
	},

	buyables: {
		11: {
			title: function() { return L("岁纪", "The Year Record") },
			display() {
				return L("已购 <b>" + formatWhole(getBuyableAmount("al", 11)) + "</b> 次<br>日影 ×<b>" + format(buyableEffect("al", 11)) + "</b><br>下一笔 " + format(this.cost()) + " 历筹", "bought <b>" + formatWhole(getBuyableAmount("al", 11)) + "</b><br>sun-shadow x<b>" + format(buyableEffect("al", 11)) + "</b><br>next " + format(this.cost()) + " tokens")
			},
			cost(amount) { return new Decimal(TUNING.AL_BUY_COST_BASE).times(Decimal.pow(TUNING.AL_BUY_COST_MULT, amount)).times(hasUpgrade("al", 13) ? upgradeEffect("al", 13) : 1) },
			effect(amount) {
				let ret = new Decimal(TUNING.AL_BUY_EFFECT_MULT).pow(amount)
				if (hasUpgrade("al", 24)) ret = ret.pow(upgradeEffect("al", 24))
				if (hasMilestone("al", 3)) ret = ret.pow(1.02)
				return ret
			},
			unlocked() { return hasMilestone("al", 0) },
			canAfford() { return player.al.points.gte(this.cost()) },
			buy() {
				player.al.points = player.al.points.sub(this.cost())
				setBuyableAmount("al", 11, getBuyableAmount("al", 11).add(1))
			},
			buyMax() { let n = 0; while (this.canAfford() && n < 50) { this.buy(); n++ } },
		},
		12: {
			title: function() { return L("月令", "The Monthly Ordinances") },
			display() {
				return L("已购 <b>" + formatWhole(getBuyableAmount("al", 12)) + "</b> 次<br>所有候产 ×<b>" + format(buyableEffect("al", 12)) + "</b><br>下一笔 " + format(this.cost()) + " 历筹", "bought <b>" + formatWhole(getBuyableAmount("al", 12)) + "</b><br>all 候 output x<b>" + format(buyableEffect("al", 12)) + "</b><br>next " + format(this.cost()) + " tokens")
			},
			cost(amount) { return new Decimal(TUNING.AL_BUY_COST_BASE).times(Decimal.pow(TUNING.AL_BUY_COST_MULT, amount)).times(2).times(hasUpgrade("al", 13) ? upgradeEffect("al", 13) : 1) },
			effect(amount) {
				let ret = new Decimal(TUNING.AL_BUY_EFFECT_MULT).pow(amount)
				if (hasUpgrade("al", 24)) ret = ret.pow(upgradeEffect("al", 24))
				if (hasMilestone("al", 3)) ret = ret.pow(1.02)
				return ret
			},
			unlocked() { return hasMilestone("al", 1) },
			canAfford() { return player.al.points.gte(this.cost()) },
			buy() {
				player.al.points = player.al.points.sub(this.cost())
				setBuyableAmount("al", 12, getBuyableAmount("al", 12).add(1))
			},
			buyMax() { let n = 0; while (this.canAfford() && n < 50) { this.buy(); n++ } },
		},
		13: {
			title: function() { return L("闰余", "The Intercalary Remainder") },
			display() {
				return L("已购 <b>" + formatWhole(getBuyableAmount("al", 13)) + "</b> 次<br>历筹产 ×<b>" + format(buyableEffect("al", 13)) + "</b><br>下一笔 " + format(this.cost()) + " 历筹", "bought <b>" + formatWhole(getBuyableAmount("al", 13)) + "</b><br>token output x<b>" + format(buyableEffect("al", 13)) + "</b><br>next " + format(this.cost()) + " tokens")
			},
			cost(amount) { return new Decimal(TUNING.AL_BUY_COST_BASE).times(Decimal.pow(TUNING.AL_BUY_COST_MULT, amount)).times(4).times(hasUpgrade("al", 13) ? upgradeEffect("al", 13) : 1) },
			effect(amount) {
				let ret = new Decimal(TUNING.AL_BUY_EFFECT_MULT).pow(amount)
				if (hasUpgrade("al", 24)) ret = ret.pow(upgradeEffect("al", 24))
				if (hasMilestone("al", 3)) ret = ret.pow(1.02)
				return ret
			},
			unlocked() { return hasMilestone("al", 2) },
			canAfford() { return player.al.points.gte(this.cost()) },
			buy() {
				player.al.points = player.al.points.sub(this.cost())
				setBuyableAmount("al", 13, getBuyableAmount("al", 13).add(1))
			},
			buyMax() { let n = 0; while (this.canAfford() && n < 50) { this.buy(); n++ } },
		},
	},

	grid: {
		rows: 8,
		cols: 9,
		getStartData(id) { return { observed: false } },
		getUnlocked(id) { return hasMilestone("al", 0) },
		getTitle(id) {
			let at = alHouAt(id)
			if (!at) return ""
			return L(alTermName(at.term * 2), alTermName(at.term * 2 + 1))
		},
		getDisplay(id) {
			let at = alHouAt(id)
			if (!at) return ""
			if (!alObserved(id)) return L("未察", "—")
			return at.name[zh() ? 0 : 1]
		},
		getStyle(id) {
			return { "background-color": alObserved(id) ? "#2b2f38" : "#15181d", "width": "90px", "height": "46px", "font-size": "12px" }
		},
		getCanClick(id) { return false },
		getTooltip(id) {
			let at = alHouAt(id)
			if (!at) return ""
			return L("第 " + (at.term + 1) + " 气　·　" + (at.name[0]), "term " + (at.term + 1) + " · " + (at.name[1]))
		},
	},

	bars: {
		1: {
			direction: RIGHT,
			width: 400,
			height: 30,
			progress() { return Math.min(1, houObserved() / TUNING.HOU_TOTAL) },
			display() {
				return L("七十二候图 " + houObserved() + " / " + TUNING.HOU_TOTAL + (houObserved() >= TUNING.HOU_TOTAL ? "　—— 候尽历成" : "　（集齐七十二候）"), "the chart " + houObserved() + " / " + TUNING.HOU_TOTAL + (houObserved() >= TUNING.HOU_TOTAL ? " — the chart is complete" : " (collect all 72)"))
			},
			unlocked() { return hasMilestone("al", 0) },
		},
	},

	tabFormat: [
		["display-text", function() { return mainAmount("al", true) }],
		["display-text", function() { return L("历书不灭 —— 交历不失历筹、不失市货。", "The almanac never resets: tokens and markets survive every 交历.") }],
		"blank",
		"prestige-button",
		"blank",
		["microtabs", "stuff"],
	],
	microtabs: {
		stuff: {
			"市货 · Markets": {
				content: [["upgrades", [1, 2]]],
			},
			"七十二候 · Chart": {
				content: [["bar", "1"], "blank", "grid"],
				unlocked() { return hasUpgrade("al", 25) },
			},
			"历市 · Bought": {
				content: [["buyables", [1]]],
				unlocked() { return hasMilestone("al", 0) },
			},
			"碑 · Stele": {
				content: [["milestones", [0, 1, 2, 3]]],
			},
		},
	},
})
