// ---------------------------------------------------------------------------
// 菊展 x — the exhibition. M3 risk-reward minigame (three tiles) + M10 the
// 菊谱 codex (36 varieties, 6×6 collection grid). 花神眷 banks on 登程; 菊珠
// is the secondary currency (M5) spent at the market.
// ---------------------------------------------------------------------------
addLayer("x", {
	name: function() { return L("菊展", "Chrysanthem Exhibition") },
	symbol: "展",
	position: 4,
	color: "#FF69B4",
	resource: function() { return L("花契", "blossom bonds") },
	row: 1,
	branches: ["p"],
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		total: new Decimal(0),
		best: new Decimal(0),
		jade: new Decimal(0),
		clickables: { 11: "金", 21: "枯", 31: "珠" },
		grid: {},
	}},
	baseResource: function() { return L("登程", "journey tokens") },
	baseAmount() { return player.p.points },
	requires: new Decimal(TUNING.xReq),
	type: "normal",
	exponent: TUNING.row1Exp,

	softcap() {
		if (hasUpgrade("x", 14)) return new Decimal("1e8")
		return new Decimal(TUNING.xCap)
	},
	softcapPower() { return new Decimal(TUNING.xCapPow) },

	gainMult() {
		let m = new Decimal(1)
		if (hasUpgrade("x", 13)) m = m.times(upgradeEffect("x", 13))
		if (hasUpgrade("x", 21)) m = m.times(upgradeEffect("x", 21))
		if (hasUpgrade("x", 22)) m = m.times(upgradeEffect("x", 22))
		if (hasUpgrade("x", 31)) m = m.times(upgradeEffect("x", 31))
		if (hasUpgrade("x", 32)) m = m.times(8)
		if (hasUpgrade("x", 34)) m = m.times(6)
		if (hasUpgrade("d", 12)) m = m.times(3)      // 茱萸招展 (sibling line, P10)
		if (hasUpgrade("k", 11)) m = m.times(2)      // 田圃助展 (sibling line, P10)
		m = m.times(buyableEffect("x", 12))          // 名帖: bonds ×2^sqrt(level)
		return m
	},
	gainExp() { return new Decimal(1) },

	layerShown() { return true },
	tooltip() { return L("观展：登程换花契，兼收菊珠。", "View: journey into bonds; jade chrysanthems in hand.") },
	tooltipLocked() { return L("需 " + format(TUNING.xReq) + " 登程", "Requires " + format(TUNING.xReq) + " journey") },

	// M3 odds: the named K4 mechanic (u23/u33 shift the jade odds).
	// Returns a Decimal — the display text calls .times(100) on it, and the
	// Math.random() comparison still coerces it to a number.
	jadeOdds() {
		let o = new Decimal(0.34)
		if (hasUpgrade("x", 23)) o = o.add(new Decimal(0.10))
		if (hasUpgrade("x", 33)) o = o.add(new Decimal(0.10))
		return o
	},

	// M10: the codex. 36 varieties, base-100 ids (101–606); revealed by the 菊珠 tile.
	codexRevealed() {
		let n = 0
		for (let r = 1; r <= 6; r++)
			for (let c = 1; c <= 6; c++)
				if (player.x.grid[100 * r + c] === 1) n++
		return n
	},

	passiveGeneration() {
		if (inChallenge("f", 41)) return 0
		if (hasMilestone("x", 1)) return 1
		return 0
	},
	autoPrestige() {
		if (inChallenge("f", 41)) return false
		if (hasMilestone("x", 0) && hasMilestone("x", 2)) return true
		return false
	},
	resetsNothing() {
		if (hasMilestone("x", 0)) return true
		return false
	},
	autoUpgrade() {
		if (inChallenge("f", 41)) return false
		if (hasMilestone("x", 3)) return true
		return false
	},

	doReset(resettingLayer) {
		// Vanilla TMT: own prestige and same-row siblings never sweep this layer.
		if (!(layers[resettingLayer].row > this.row)) return
		let kept = ["best", "total", "jade"]
		if (hasMilestone("x", 0)) kept.push("upgrades")
		if (hasMilestone("x", 3)) kept.push("buyables")
		// The codex outlives every reset (M10 collection integrity). It is an
		// object, and layOver() mutates nested objects in place, so a keep entry
		// alone would zero it before the restore — copy it by hand.
		let grid = Object.assign({}, player[this.layer].grid)
		layerDataReset(this.layer, kept)
		player[this.layer].grid = grid
	},

	hotkeys: [
		{ key: "x",
		  description: function() { return L("X：重整菊展，换花契", "X: re-stake the exhibition for bonds") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],

	upgrades: {
		11: {
			title: function() { return L("展亭", "Pavilion") },
			description: function() { return L("花契获取 ×2。", "Bond gain ×2.") },
			cost: new Decimal(1),
		},
		12: {
			title: function() { return L("彩栏", "Colored Railing") },
			description: function() { return L("花契获取 ×3。", "Bond gain ×3.") },
			cost: new Decimal(4),
			unlocked() { return hasUpgrade(this.layer, 11) },
		},
		13: {
			title: function() { return L("名品", "Named Varieties") },
			description: function() { return L("花契获取 ×（花神眷 + 1）^0.4。", "Bond gain ×(blossom+1)^0.4.") },
			cost: new Decimal(15),
			unlocked() { return hasUpgrade(this.layer, 12) },
			effect() { return player[this.layer].points.add(1).pow(0.4) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		14: {
			title: function() { return L("广厦", "Grand Hall") },
			description: function() { return L("花契软帽自 1e5 延至 1e8（帽在要略可见）。", "Bond soft cap from 1e5 delayed to 1e8 (visible in the briefing).") },
			cost: new Decimal(50),
			unlocked() { return hasUpgrade(this.layer, 13) },
		},
		15: {
			title: function() { return L("展签", "Tickets") },
			description: function() { return L("开启「观展要略」页签。", "Unlocks the viewing briefing sub-tab.") },
			cost: new Decimal(150),
			unlocked() { return hasUpgrade(this.layer, 14) },
		},
		21: {
			title: function() { return L("人满为患", "Crowds") },
			description: function() { return L("花契获取 ×（登程峰值 + 1）^0.5。", "Bond gain ×(best journey+1)^0.5.") },
			cost: new Decimal(400),
			unlocked() { return hasUpgrade(this.layer, 15) },
			effect() { return player.p.best.add(1).pow(0.5) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		22: {
			title: function() { return L("展外山色", "Scenery Beyond") },
			description: function() { return L("（键：顺路取景）花契获取 ×（登程十进制位 + 1）。", "(key: framed on the way) bond gain ×(log10(journey)+1).") },
			cost: new Decimal(300),
			unlocked() { return hasUpgrade(this.layer, 21) },
			effect() { return player.p.points.max(10).log10().add(1) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		23: {
			title: function() { return L("识珠之眼", "Jade-Eyed") },
			description: function() { return L("菊珠机缘（观展）+10%。", "The jade odds (viewing fortune) +10%.") },
			cost: new Decimal(1500),
			unlocked() { return hasUpgrade(this.layer, 22) },
		},
		24: {
			title: function() { return L("市声相引", "Market Call") },
			description: function() { return L("重阳集市既开，花契获取 ×4。", "With the market open: bond gain ×4.") },
			cost: new Decimal(2200),
			unlocked() { return hasUpgrade(this.layer, 23) },
		},
		25: {
			title: function() { return L("观展要略", "Viewing Notes") },
			description: function() { return L("开启「观展要略」页签。", "Unlocks the viewing briefing sub-tab.") },
			cost: new Decimal(3000),
			unlocked() { return hasUpgrade(this.layer, 24) },
		},
		31: {
			title: function() { return L("画壁", "Painted Walls") },
			description: function() { return L("花契获取 ×（醇藏峰值 + 1）^0.3。", "Bond gain ×(best wine+1)^0.3.") },
			cost: new Decimal(4000),
			unlocked() { return hasUpgrade(this.layer, 25) },
			effect() { return player.j.best.add(1).pow(0.3) },
			effectDisplay() { return format(this.effect()) + "x" },
		},
		32: {
			title: function() { return L("满架黄金", "Golden Racks") },
			description: function() { return L("诗阁既开，花契获取 ×8。", "With the verse pavilion open: bond gain ×8.") },
			cost: new Decimal(6000),
			unlocked() { return hasUpgrade(this.layer, 31) },
		},
		33: {
			title: function() { return L("点金手", "Golden Touch") },
			description: function() { return L("菊珠机缘（观展）+10%。", "The jade odds (viewing fortune) +10%.") },
			cost: new Decimal(9000),
			unlocked() { return hasUpgrade(this.layer, 32) },
		},
		34: {
			title: function() { return L("菊谱盛名", "Codex Fame") },
			description: function() { return L("花契获取 ×6。", "Bond gain ×6.") },
			cost: new Decimal(13000),
			unlocked() { return hasUpgrade(this.layer, 33) },
		},
		35: {
			title: function() { return L("观展谱录", "Viewing Codex") },
			description: function() { return L("编年「观展」一章得录。", "The chronicle's viewing chapter is recorded.") },
			cost: new Decimal(20000),
			unlocked() { return hasUpgrade(this.layer, 34) },
		},
	},

	milestones: {
		0: {
			requirementDescription: function() { return L("花契峰值 ≥ 2", "best bonds ≥ 2") },
			effectDescription: function() { return L("更上层重置不再卷走菊展升级。", "Deeper resets no longer sweep the exhibition's upgrades.") },
			done() { return player[this.layer].best.gte(2) },
		},
		1: {
			requirementDescription: function() { return L("花契峰值 ≥ 4", "best bonds ≥ 4") },
			unlocked() { return hasMilestone(this.layer, 0) },
			effectDescription: function() { return L("菊展自出花契（自动开启）。", "The exhibition yields bonds on its own (automated on).") },
			done() { return player[this.layer].best.gte(4) },
		},
		2: {
			requirementDescription: function() { return L("花契峰值 ≥ 8", "best bonds ≥ 8") },
			unlocked() { return hasMilestone(this.layer, 1) },
			effectDescription: function() { return L("菊展自动重整。", "The exhibition re-stakes itself.") },
			done() { return player[this.layer].best.gte(8) },
		},
		3: {
			requirementDescription: function() { return L("花契峰值 ≥ 16", "best bonds ≥ 16") },
			unlocked() { return hasMilestone(this.layer, 2) },
			effectDescription: function() { return L("菊展自动购阶（保留已购）。", "The exhibition buys its own upgrades (keeps bought ones).") },
			done() { return player[this.layer].best.gte(16) },
		},
	},

	buyables: {
		11: {
			title: function() { return L("展签束", "Ticket Bundles") },
			cost(x) { return new Decimal(10).times(Decimal.pow(2, x)).floor() },
			effect(x) { return x },
			display() {
				let amt = getBuyableAmount(this.layer, this.id)
				return L("每级：金菊成功时额外 +1 菊珠（现 +" + formatWhole(amt.max(0)) + "）<br>成本：" + format(tmp[this.layer].buyables[this.id].cost) + " 花契",
					"per level: +1 extra jade on a golden hit (now +" + formatWhole(amt.max(0)) + ")<br>cost: " + format(tmp[this.layer].buyables[this.id].cost) + " bonds")
			},
			canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				let cost = tmp[this.layer].buyables[this.id].cost
				player[this.layer].points = player[this.layer].points.sub(cost)
				player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost)
			},
		},
		12: {
			title: function() { return L("名帖", "Cards of Introduction") },
			cost(x) { return new Decimal(25).times(Decimal.pow(3, x.pow(0.5))).floor() },
			effect(x) { return Decimal.pow(2, x.pow(0.5)) },
			display() {
				let amt = getBuyableAmount(this.layer, this.id)
				return L("每级：花契获取 ×" + format(this.effect(amt)) + "<br>成本：" + format(tmp[this.layer].buyables[this.id].cost) + " 花契",
					"per level: bonds ×" + format(this.effect(amt)) + "<br>cost: " + format(tmp[this.layer].buyables[this.id].cost) + " bonds")
			},
			canAfford() { return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				let cost = tmp[this.layer].buyables[this.id].cost
				player[this.layer].points = player[this.layer].points.sub(cost)
				player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
				player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost)
			},
		},
	},

	// M3: three tiles, one repeated verb. 金菊 pays out jade; 枯菊 gambles it;
	// the 菊珠 tile rolls a new codex variety. State is string-only (rule 11).
	clickables: {
		11: {
			title: function() { return L("金菊", "Golden Chrysanthem") },
			display() { return L("点按：按机缘（" + format(tmp[this.layer].jadeOdds.times(100).floor()) + "%）收入菊珠 ×2",
				"click: roll the odds (" + format(tmp[this.layer].jadeOdds.times(100).floor()) + "%) for jade ×2") },
			canClick() { return true },
			onClick() {
				if (Math.random() < tmp.x.jadeOdds)
					player.x.jade = player.x.jade.times(2).max(1).add(buyableEffect("x", 11))
			},
			style() { return {'background-color': '#FFD700', 'color': '#3d2b00'} },
		},
		21: {
			title: function() { return L("枯菊", "Withered Chrysanthem") },
			display() { return L("点按：机缘（" + format(tmp[this.layer].jadeOdds.times(100).floor()) + "%）菊珠翻倍，否则半数入土。",
				"click: on the odds (" + format(tmp[this.layer].jadeOdds.times(100).floor()) + "%) jade doubles, else half goes to the soil.") },
			canClick() { return player.x.jade.gt(1) },
			onClick() {
				if (Math.random() < tmp.x.jadeOdds)
					player.x.jade = player.x.jade.times(2)
				else
					player.x.jade = player.x.jade.div(2)
			},
			style() { return {'background-color': '#8d6e63', 'color': '#efebe9'} },
		},
		31: {
			title: function() { return L("菊珠", "Jade Chrysanthem") },
			display() { return L("点按：菊珠×3 剖珠，或遇新种（入菊谱）。", "click: 3 jade cracks one open, or meets a new variety (into the codex).") },
			canClick() { return player.x.jade.gte(3) },
			onClick() {
				player.x.jade = player.x.jade.sub(3)
				let revealed = -1
				let tries = 0
				while (tries < 400) {
					tries++
					// grid ids are row*100+col (101..606), not 101..136
					let idx = 100 * (1 + Math.floor(Math.random() * 6)) + (1 + Math.floor(Math.random() * 6))
					if (player.x.grid[idx] !== 1) { revealed = idx; break }
				}
				if (revealed >= 0) setGridData(this.layer, revealed, 1)
			},
			style() { return {'background-color': '#FF69B4', 'color': '#3d0f26'} },
		},
	},

	// M10: 36 varieties, base-100 ids (T-GRID: getStartData + static rows/cols).
	grid: {
		rows: 6, cols: 6,
		maxRows: 6, maxCols: 6,
		getStartData(id) { return 0 },
		getUnlocked(id) { return hasUpgrade("k", 25) },
		// Revealing is the 菊珠 clickable's job (3 jade per crack); tiles are
		// display-only, otherwise the whole codex could be lit for free.
		getCanClick(data, id) { return false },
		getTitle(data, id) {
			let names = ["甘菊", "金背", "木茼", "秋华", "残暑", "白莲", "凤尾", "龙牙", "蟹爪", "蝶黄",
				"雀舌", "团菊", "松针", "梅心", "荷香", "竹节", "石莲", "霜钟", "露英", "风铎",
				"月团", "雪狮", "云鬓", "霞举", "天女", "瑶台", "宝珠", "千叶", "素冠", "翠盘",
				"朱砂", "墨菊", "绿牡丹", "紫琅", "锦屏", "墨晶"]
			let r = Math.floor(id / 100), c = id % 100
			return names[(r - 1) * 6 + (c - 1)]
		},
		getDisplay(data, id) {
			return data === 1 ? L("已著录", "recorded") : "？"
		},
		getStyle(data, id) {
			return data === 1 ? {'background-color': '#FF69B4', 'color': '#3d0f26'} : {'background-color': '#4a3b45', 'color': '#c9b8c4'}
		},
		getTooltip(data, id) {
			if (data === 1) return L("菊谱 · 第" + (id - 101 + 1) + "种", "codex variety #" + (id - 101 + 1))
			return L("珠未剖开，不知何种。", "the jade is uncracked — variety unknown.")
		},
		onClick(data, id) {
			if (data === 0 && getGridData(this.layer, id) === 0) setGridData(this.layer, id, 1)
		},
	},

	tabFormat: [
		["display-text", function() {
			return L("花神眷 <b>" + format(player.x.points) + "</b> · 菊珠 <b style='color:#FF69B4'>" + format(player.x.jade) + "</b> · 菊谱 " + tmp.x.codexRevealed + "/36",
				"blossom <b>" + format(player.x.points) + "</b> · jade <b style='color:#FF69B4'>" + format(player.x.jade) + "</b> · codex " + tmp.x.codexRevealed + "/36")
		}],
		"prestige-button",
		["microtabs", "xd"],
	],
	microtabs: {
		"xd": {
			"观展": {
				content: ["upgrades", "blank", ["clickables", [1, 2, 3]], "blank", "buyables"],
			},
			"菊谱": {
				unlocked() { return hasUpgrade("k", 25) },
				content: ["grid", "blank", ["display-text", function() {
					return L("菊谱三十六种，著录 " + tmp.x.codexRevealed + " 种。菊珠×3 剖珠可遇新种。",
						"Thirty-six codex varieties; " + tmp.x.codexRevealed + " recorded. 3 jade cracks one open.")
				}]],
				buttonStyle() { return {'background': 'linear-gradient(90deg,#FF69B4,#a3407a)', 'color': '#2d0a1a'} },
			},
			"里程碑": {
				content: ["milestones", [0, 1, 2, 3]],
			},
			"观展要略": {
				unlocked() { return hasUpgrade("x", 15) },
				content: [
					["display-text", function() {
						return L("花契 = (登程/2000)^(1/3) × 倍率（软帽 " + format(hasUpgrade("x", 14) ? "1e8" : TUNING.xCap) + " 起）<br>菊珠机缘：" + format(tmp.x.jadeOdds.times(100).floor()) + "%",
							"bonds = (journey/2000)^(1/3) × mult (cap " + format(hasUpgrade("x", 14) ? "1e8" : TUNING.xCap) + ")<br>jade odds: " + format(tmp.x.jadeOdds.times(100).floor()) + "%")
					}],
				],
			},
		},
	},
})
