/* =========================================================================
 *  寒暄 / Small Talk  —  row 0, the anchor layer.
 *  Owns the base-currency loop: clickables (搭话, 读心), the 倾听 bar, the
 *  first challenge set, and the upgrade ladder every later layer hangs off.
 *
 *  File-scope helpers live OUTSIDE addLayer on purpose: the engine re-runs
 *  every function inside `layers` ~20x/sec, and a pure helper read there would
 *  be wasted work. Globals are never swept.
 * ========================================================================= */

/** 话头 needed to fill the 倾听 bar once. Grows, but far slower than 寒暄. */
function chatListenNeed() {
	let ret = new Decimal(1000)
	if (hasUpgrade("chat", 32)) ret = ret.times(0.75)
	if (hasMilestone("chat", 3)) ret = ret.times(0.6)
	if (hasUpgrade("familiar", 24)) ret = ret.times(0.8)
	return ret
}

/** 寒暄 paid out each time the 倾听 bar completes. */
function chatListenPay() {
	let ret = getPointGen().times(2)
	if (hasUpgrade("chat", 32)) ret = ret.times(upgradeEffect("chat", 32))
	if (inChallenge("chat", 12)) ret = ret.div(2)
	return ret
}

/** Price of one 读心 run. Escalates with the streak, so a hot streak costs more. */
function chatReadCost() {
	return new Decimal(200).times(Decimal.pow(1.8, player.chat.readMindStreak))
}

/** Picks which of the five replies was the one they meant. Mutates — registered
 *  in mod.js doNotCallTheseFunctionsEveryTick. */
function readMindNewRun() {
	player.chat.readMindAnswer = Math.floor(Math.random() * 5)
	player.chat.readMindRunning = true
}

addLayer("chat", {
	name: t("chat.name", "寒暄"),
	symbol: t("chat.symbol", "寒暄"),
	color: "#7fc4e8",
	resource: t("chat.resource", "寒暄"),
	row: 0,
	position: 0,

	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),

			listening: false,
			listenProgress: new Decimal(0),

			readMindRunning: false,
			readMindAnswer: 0,
			readMindStreak: 0,
			readMindBest: 0,

			totalTalk: new Decimal(0),   // lifetime 话头 — this engine has no totalPoints
		}
	},

	baseResource: t("game.pointsName", "话头"),
	baseAmount() { return player.points },
	requires: new Decimal(10),

	type: "normal",
	exponent: 0.5,

	/** The 寒暄 softcap is VISIBLE in the tab (see tabFormat) because upgrade 25
	 *  raises it — handbook 12: only sell a cap raise if the cap is on screen. */
	softcap() {
		let cap = new Decimal("1e12")
		if (hasUpgrade("chat", 25)) cap = new Decimal("1e18")
		return cap
	},
	softcapPower() { return new Decimal(0.25) },

	/** Higher layers all reach back here — the P10 web. */
	gainMult() {
		let ret = new Decimal(1)
		if (hasMilestone("chat", 0)) ret = ret.times(2)
		if (hasMilestone("chat", 2)) ret = ret.times(1.5)
		if (hasMilestone("chat", 4)) ret = ret.times(2.5)
		if (hasAchievement("achievements", 15)) ret = ret.times(2)
		if (hasAchievement("achievements", 21)) ret = ret.times(2)
		if (hasAchievement("achievements", 31)) ret = ret.times(2)
		if (hasAchievement("achievements", 34)) ret = ret.times(2)

		if (hasUpgrade("familiar", 12)) ret = ret.times(3)
		if (hasUpgrade("familiar", 22)) ret = ret.times(upgradeEffect("familiar", 22))
		if (hasUpgrade("familiar", 31)) ret = ret.times(4)
		if (hasUpgrade("familiar", 32)) ret = ret.times(upgradeEffect("familiar", 32))

		if (hasUpgrade("trust", 12)) ret = ret.times(3)
		if (hasUpgrade("trust", 22)) ret = ret.times(upgradeEffect("trust", 22))
		if (hasUpgrade("trust", 23)) ret = ret.times(4)

		if (hasUpgrade("closer", 12)) ret = ret.times(4)
		if (hasUpgrade("closer", 21)) ret = ret.times(upgradeEffect("closer", 21))
		if (hasUpgrade("closer", 22)) ret = ret.times(upgradeEffect("closer", 22))

		if (hasUpgrade("circle", 12)) ret = ret.times(5)
		if (hasUpgrade("circle", 21)) ret = ret.times(upgradeEffect("circle", 21))
		if (hasUpgrade("circle", 22)) ret = ret.times(upgradeEffect("circle", 22))

		if (hasAchievement("achievements", 12)) ret = ret.times(2)
		if (hasAchievement("achievements", 23)) ret = ret.times(3)

		// M1 penalty injected into an OLDER layer's own formula (P16)
		if (inChallenge("chat", 12)) ret = ret.div(2)
		if (inChallenge("familiar", 11)) ret = ret.div(2)

		return ret
	},

	/** Plain number, never a Decimal and never a boolean (N-PGBOOL). */
	passiveGeneration() { return hasMilestone("familiar", 1) ? 0.1 : 0 },

	/** Implies familiar's resetsNothing grant, so automation never wipes chat. */
	resetsNothing() { return hasMilestone("familiar", 0) },

	autoPrestige() { return hasMilestone("familiar", 0) && hasMilestone("trust", 1) },
	autoUpgrade() { return hasMilestone("closer", 0) },

	/** Chat's points and milestones survive an upper-row reset; its upgrades
	 *  only from familiar m3 onward, which is the "you learn to keep people"
	 *  beat. Without this, N-MSDESTROY would fire on the best-gated milestones. */
	doReset(resettingLayer) {
		if (layers[resettingLayer].row <= 1) return undefined
		if (hasMilestone("familiar", 3)) return undefined
		layerDataReset(this.layer, [
			"unlocked", "best", "total", "milestones", "totalTalk",
			"listening", "listenProgress",
			"readMindRunning", "readMindAnswer", "readMindStreak", "readMindBest",
		])
	},

	hotkeys: [
		{
			key: "t",
			description: () => t("chat.hotkey", "T: reset for 寒暄"),
			onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],

	tabFormat: [
		["display-text", function () { return mainAmount("chat", true) }],
		"prestige-button",
		["display-text", function () {
			return t("chat.ctx.have") + " <b>" + format(player.chat.points) + "</b> " + t("chat.ctx.units")
		}],
		["display-text", function () {
			return t("chat.ctx.best") + " <b>" + format(player.chat.best) + "</b>"
				+ " &nbsp;|&nbsp; " + t("chat.ctx.total") + " <b>" + format(player.chat.total) + "</b>"
		}],
		["display-text", function () {
			// The softcap is on screen because upgrade 25 raises it.
			let cap = new Decimal("1e12")
			if (hasUpgrade("chat", 25)) cap = new Decimal("1e18")
			if (player.chat.points.gte(cap.mul(0.05)))
				return "<span style='color:#e0716f'>" + t("chat.ctx.softcap") + " " + format(cap) + "</span>"
			return t("chat.ctx.softcap.pending")
		}],
		["display-text", function () {
			if (!shiftDown) return ""
			return "<span style='opacity:.6'>" + t("chat.ctx.formula")
				+ ": (" + format(player.points) + " / 10)<sup>0.5</sup> × "
				+ format(tmp.chat.gainMult) + " " + t("chat.ctx.units")
				+ " → " + format(tmp.chat.resetGain) + "</span>"
		}],
		["microtabs", "stuff"],
	],

	microtabs: {
		stuff: {
			[t("tab.upgrades", "升级")]: {
				unlocked() { return true },
				content: [["blank", "15px"], "upgrades"],
				buttonStyle() { return { "background-color": "#2b3a48" } },
			},
			[t("tab.listen", "倾听")]: {
				unlocked() { return true },
				content: [
					["display-text", function () {
						return player.chat.listening
							? "<span style='color:#7fc4e8'>" + t("chat.listen.on") + "</span>"
							: "<span style='opacity:.7'>" + t("chat.listen.off") + "</span>"
					}],
					["blank", "8px"],
					"bars",
					["blank", "8px"],
					"clickables",
					["blank", "8px"],
					["display-text", function () {
						return t("chat.listen.note")
					}],
				],
				buttonStyle() { return { "background-color": "#23414f" } },
			},
			[t("tab.readmind", "读心")]: {
				unlocked() { return hasUpgrade("chat", 15) },
				content: [
					["display-text", function () {
						return t("chat.read.intro")
					}],
					["blank", "8px"],
					"clickables",
					["blank", "8px"],
					["display-text", function () {
						return t("chat.read.streak") + " <b>" + formatWhole(player.chat.readMindStreak)
							+ "</b> · " + t("chat.read.best") + " <b>" + formatWhole(player.chat.readMindBest) + "</b>"
					}],
				],
				buttonStyle() { return { "background-color": "#4a2f52" } },
			},
			[t("tab.challenges", "挑战")]: {
				unlocked() { return hasUpgrade("chat", 34) },
				content: [["blank", "10px"], "challenges"],
				buttonStyle() { return { "background-color": "#5a2a2a" } },
			},
			[t("tab.milestones", "里程碑")]: {
				unlocked() { return true },
				content: [["blank", "10px"], "milestones"],
			},
		},
	},

	/* ---- the two loops of the layer ---------------------------------- */

	update(diff) {
		// Lifetime 话头, kept here because this engine tracks no totalPoints.
		player.chat.totalTalk = player.chat.totalTalk.add(getPointGen().times(diff))

		if (!player.chat.listening) return

		let rate = getPointGen().div(chatListenNeed()).times(diff)
		if (inChallenge("chat", 11)) rate = rate.div(2)
		player.chat.listenProgress = player.chat.listenProgress.add(rate)

		if (player.chat.listenProgress.gte(chatListenNeed())) {
			player.chat.listenProgress = new Decimal(0)
			// addPoints is the sanctioned writer — it keeps best/total honest.
			addPoints("chat", chatListenPay())
		}
	},

	bars: {
		listening: {
			direction: RIGHT,
			width: 420, height: 42,
			display() {
				return t("chat.listen.bar") + " " + format(player.chat.listenProgress, 2)
					+ " / " + format(chatListenNeed()) + " " + t("chat.ctx.units")
			},
			progress() {
				return player.chat.listenProgress.div(chatListenNeed()).toNumber()
			},
			baseStyle() { return { "background-color": "#1d2a33" } },
			fillStyle() { return { "background-color": "#7fc4e8" } },
			textStyle() { return { color: "#e8f2f8" } },
			unlocked() { return true },
		},
	},

	clickables: {
		masterButtonPress() {
			if (player.chat.readMindRunning) return
			if (player.chat.points.lt(chatReadCost())) return
			player.chat.points = player.chat.points.sub(chatReadCost())
			readMindNewRun()
		},
		masterButtonText() {
			if (player.chat.readMindRunning) return t("chat.read.running")
			return t("chat.read.start") + " — " + format(chatReadCost()) + " " + t("chat.ctx.units")
		},
		showMasterButton() { return hasUpgrade("chat", 15) },

		11: {
			title: t("chat.click.11.t", "搭话"),
			display() {
				return t("chat.click.11.d") + "<br>" + t("chat.click.11.pay") + " <b>"
					+ format(getPointGen().times(0.5)) + "</b> " + t("chat.ctx.units")
			},
			canClick() { return player.chat.unlocked },
			onClick() {
				player.points = player.points.add(getPointGen().times(0.5))
			},
			style() { return { "background-color": "#2e4a5c" } },
		},

		21: {
			title: t("chat.click.21.t", "「那你觉得呢？」"),
			canClick() { return player.chat.readMindRunning },
			onClick() {
				if (!player.chat.readMindRunning) return
				if (this.id - 21 === player.chat.readMindAnswer) {
					player.chat.readMindStreak += 1
					if (player.chat.readMindStreak > player.chat.readMindBest)
						player.chat.readMindBest = player.chat.readMindStreak
					addPoints("chat", chatReadCost().times(player.chat.readMindStreak))
					player.chat.readMindRunning = false
				} else {
					player.chat.readMindStreak = 0
					player.chat.readMindRunning = false
					doPopup(t("chat.read.wrong.t"), t("chat.read.wrong.b"))
				}
			},
			style() { return { "background-color": "#3d2b47" } },
		},
		22: {
			title: t("chat.click.22.t", "「我懂你意思。」"),
			canClick() { return player.chat.readMindRunning },
			onClick() {
				if (!player.chat.readMindRunning) return
				if (this.id - 21 === player.chat.readMindAnswer) {
					player.chat.readMindStreak += 1
					if (player.chat.readMindStreak > player.chat.readMindBest)
						player.chat.readMindBest = player.chat.readMindStreak
					addPoints("chat", chatReadCost().times(player.chat.readMindStreak))
					player.chat.readMindRunning = false
				} else {
					player.chat.readMindStreak = 0
					player.chat.readMindRunning = false
					doPopup(t("chat.read.wrong.t"), t("chat.read.wrong.b"))
				}
			},
			style() { return { "background-color": "#3d2b47" } },
		},
		23: {
			title: t("chat.click.23.t", "「……算了没事。」"),
			canClick() { return player.chat.readMindRunning },
			onClick() {
				if (!player.chat.readMindRunning) return
				if (this.id - 21 === player.chat.readMindAnswer) {
					player.chat.readMindStreak += 1
					if (player.chat.readMindStreak > player.chat.readMindBest)
						player.chat.readMindBest = player.chat.readMindStreak
					addPoints("chat", chatReadCost().times(player.chat.readMindStreak))
					player.chat.readMindRunning = false
				} else {
					player.chat.readMindStreak = 0
					player.chat.readMindRunning = false
					doPopup(t("chat.read.wrong.t"), t("chat.read.wrong.b"))
				}
			},
			style() { return { "background-color": "#3d2b47" } },
		},
		24: {
			title: t("chat.click.24.t", "「哈哈哈哈哈。」"),
			canClick() { return player.chat.readMindRunning },
			onClick() {
				if (!player.chat.readMindRunning) return
				if (this.id - 21 === player.chat.readMindAnswer) {
					player.chat.readMindStreak += 1
					if (player.chat.readMindStreak > player.chat.readMindBest)
						player.chat.readMindBest = player.chat.readMindStreak
					addPoints("chat", chatReadCost().times(player.chat.readMindStreak))
					player.chat.readMindRunning = false
				} else {
					player.chat.readMindStreak = 0
					player.chat.readMindRunning = false
					doPopup(t("chat.read.wrong.t"), t("chat.read.wrong.b"))
				}
			},
			style() { return { "background-color": "#3d2b47" } },
		},
		25: {
			title: t("chat.click.25.t", "「Anyway, 周末有空吗？」"),
			canClick() { return player.chat.readMindRunning },
			onClick() {
				if (!player.chat.readMindRunning) return
				if (this.id - 21 === player.chat.readMindAnswer) {
					player.chat.readMindStreak += 1
					if (player.chat.readMindStreak > player.chat.readMindBest)
						player.chat.readMindBest = player.chat.readMindStreak
					addPoints("chat", chatReadCost().times(player.chat.readMindStreak))
					player.chat.readMindRunning = false
				} else {
					player.chat.readMindStreak = 0
					player.chat.readMindRunning = false
					doPopup(t("chat.read.wrong.t"), t("chat.read.wrong.b"))
				}
			},
			style() { return { "background-color": "#3d2b47" } },
		},
	},

	/* ---- content ------------------------------------------------------ */

	upgrades: {
		11: {
			title: t("chat.up11.t", "开口"),
			description: t("chat.up11.d", "话头生成 ×3。"),
			cost: new Decimal(1),
			unlocked() { return player.chat.unlocked },
		},
		12: {
			title: t("chat.up12.t", "投其所好"),
			description: t("chat.up12.d", "话头生成 ×10。"),
			cost: new Decimal(4),
			unlocked() { return hasUpgrade("chat", 11) },
		},
		13: {
			title: t("chat.up13.t", "记住对方说过的话"),
			description: t("chat.up13.d", "话头生成 ×40。"),
			cost: new Decimal(20),
			unlocked() { return hasUpgrade("chat", 12) },
		},
		14: {
			title: t("chat.up14.t", "越聊越有话说"),
			description: t("chat.up14.d", "话头生成 ×150。"),
			cost: new Decimal(100),
			unlocked() { return hasUpgrade("chat", 13) },
		},
		15: {
			title: t("chat.up15.t", "学会读话"),
			description: t("chat.up15.d", "解锁「读心」——花寒暄赌一次对方真正想听什么。"),
			cost: new Decimal(300),
			unlocked() { return hasUpgrade("chat", 14) },
		},
		21: {
			title: t("chat.up21.t", "越熟越有梗"),
			description: t("chat.up21.d", "话头生成 × 寒暄的对数（寒暄越大，涨得越慢但不停）。"),
			cost() { return new Decimal(1500).div(hasUpgrade("chat", 24) ? 4 : 1) },
			unlocked() { return hasUpgrade("chat", 15) },
			effect() { return player.chat.points.add(10).log10().pow(1.5).max(2) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		22: {
			title: t("chat.up22.t", "什么都接得上"),
			description: t("chat.up22.d", "话头生成 × 话头的对数。"),
			cost() { return new Decimal(2e4).div(hasUpgrade("chat", 24) ? 4 : 1) },
			unlocked() { return hasUpgrade("chat", 21) },
			effect() { return player.points.add(10).log10().pow(1.2).max(2) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		23: {
			title: t("chat.up23.t", "开口的速度"),
			description: t("chat.up23.d", "话头生成 ×800。"),
			cost: new Decimal(3e5),
			unlocked() { return hasUpgrade("chat", 22) },
		},
		24: {
			title: t("chat.up24.t", "话不投机时换个说法"),
			description: t("chat.up24.d", "「越熟越有梗」与「什么都接得上」的价格降为 1/4。"),
			cost: new Decimal(4e6),
			unlocked() { return hasUpgrade("chat", 23) },
		},
		25: {
			title: t("chat.up25.t", "把话留到明天"),
			description: t("chat.up25.d", "寒暄软上限从 1e12 推到 1e18（这个上限本来就显示在标签页上）。"),
			cost: new Decimal(6e7),
			unlocked() { return hasUpgrade("chat", 24) },
		},
		31: {
			title: t("chat.up31.t", "熟人带路"),
			description: t("chat.up31.d", "话头生成 × 熟人点的三次方根。"),
			cost: new Decimal(1e9),
			unlocked() { return player.familiar.unlocked },
			effect() { return player.familiar.points.add(1).pow(0.3).max(2) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		32: {
			title: t("chat.up32.t", "会听"),
			description: t("chat.up32.d", "倾听更容易填满，填满时给的更多。"),
			cost: new Decimal(5e10),
			unlocked() { return hasUpgrade("chat", 31) },
			effect() { return new Decimal(2.2) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		33: {
			title: t("chat.up33.t", "接上话茬"),
			description: t("chat.up33.d", "寒暄最佳记录超过 1e3 后，话头生成 ×3。"),
			cost: new Decimal(2e12),
			unlocked() { return hasUpgrade("chat", 32) },
		},
		34: {
			title: t("chat.up34.t", "敢开口问"),
			description: t("chat.up34.d", "解锁「挑战」标签页。（很便宜 —— 它几乎不产出数字。）"),
			cost: new Decimal(5),
			unlocked() { return hasUpgrade("chat", 32) },
		},
		35: {
			title: t("chat.up35.t", "有他在就不冷场"),
			description: t("chat.up35.d", "话头生成 ×10000。"),
			cost: new Decimal(1e14),
			unlocked() { return hasUpgrade("chat", 33) },
		},
	},

	milestones: {
		// Gates, not purchases: each of these is a THRESHOLD the player walks
		// past on the way to affording the layer it opens (N-UNLOCKPAYGATE).
		0: {
			requirementDescription: t("chat.ms0.r", "寒暄最佳记录 100"),
			effectDescription: t("chat.ms0.e", "话头生成 ×2.5，寒暄收益 ×2。熟人这条支线开了。"),
			done() { return player.chat.best.gte(100) },
			onComplete() { player.familiar.unlocked = true },
		},
		1: {
			requirementDescription: t("chat.ms1.r", "寒暄最佳记录 300"),
			effectDescription: t("chat.ms1.e", "话头生成 ×3。朋友这条支线开了。"),
			unlocked() { return hasMilestone("chat", 0) },
			done() { return player.chat.best.gte(300) },
			onComplete() { player.trust.unlocked = true },
		},
		2: {
			requirementDescription: t("chat.ms2.r", "寒暄最佳记录 2500"),
			effectDescription: t("chat.ms2.e", "寒暄收益 ×1.5。"),
			unlocked() { return hasMilestone("chat", 1) },
			done() { return player.chat.best.gte(2500) },
		},
		3: {
			requirementDescription: t("chat.ms3.r", "读心连对 3 次"),
			effectDescription: t("chat.ms3.e", "倾听需要的 话头 降低 40%。"),
			unlocked() { return hasMilestone("chat", 2) },
			done() { return player.chat.readMindBest >= 3 },
			overpowered() { return hasUpgrade("familiar", 25) },
		},
		4: {
			requirementDescription: t("chat.ms4.r", "寒暄最佳记录 1e9"),
			effectDescription: t("chat.ms4.e", "寒暄收益 ×2.5。"),
			unlocked() { return hasMilestone("chat", 3) },
			done() { return player.chat.best.gte(1e9) },
		},
	},

	challenges: {
		11: {
			name: t("chat.ch11.n", "社恐"),
			challengeDescription: function () {
				return t("chat.ch11.d", "话头生成减半，倾听也慢一半。<br>奖励：话头生成 ×2。<br>完成次数 ")
					+ challengeCompletions(this.layer, this.id) + " / " + this.completionLimit
			},
			goalDescription: t("chat.ch11.g", "在社恐状态下攒到 5e5 话头"),
			canComplete() { return inChallenge(this.layer, this.id) && player.points.gte(5e5) },
			rewardDescription: t("chat.ch11.r", "话头生成 ×2（永久）。"),
			completionLimit: 2,
			unlocked() { return player.chat.best.gte(1e4) },
		},
		12: {
			name: t("chat.ch12.n", "尬聊"),
			challengeDescription: function () {
				return t("chat.ch12.d", "寒暄收益减半。<br>奖励：寒暄收益 ×1.5。<br>完成次数 ")
					+ challengeCompletions(this.layer, this.id) + " / " + this.completionLimit
			},
			goalDescription: t("chat.ch12.g", "在尬聊状态下重置出 5e4 寒暄"),
			canComplete() { return inChallenge(this.layer, this.id) && player.chat.best.gte(5e4) },
			rewardDescription: t("chat.ch12.r", "寒暄收益 ×1.5（永久）。"),
			completionLimit: 2,
			unlocked() { return hasUpgrade("chat", 34) },
		},
	},

	buyables: {
		11: {
			title: t("chat.buy11.t", "请客"),
			cost(x) { return Decimal.pow(3, x).mul(40) },
			effect(x) { return Decimal.pow(3, x).mul(0.4) },
			display() {
				let data = tmp[this.layer].buyables[this.id]
				return t("chat.buy11.d", "话头生成") + " <b>+" + format(data.effect) + "</b>/秒<br>"
					+ t("common.cost") + " " + format(data.cost) + " " + t("chat.ctx.units")
					+ "<br>" + t("common.level") + " " + formatWhole(data.amount)
			},
			canAfford() { return player.chat.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				let cost = tmp[this.layer].buyables[this.id].cost
				player.chat.points = player.chat.points.sub(cost)
				player.chat.buyables[this.id] = player.chat.buyables[this.id].add(1)
				player.chat.spentOnBuyables = player.chat.spentOnBuyables.add(cost)
			},
			unlocked() { return player.chat.best.gte(100) },
		},
		21: {
			title: t("chat.buy21.t", "攒话头"),
			cost(x) { return Decimal.pow(3, x).mul(4e5) },
			effect(x) { return Decimal.pow(3, x).mul(0.08) },
			display() {
				let data = tmp[this.layer].buyables[this.id]
				return t("chat.buy21.d", "话头生成") + " <b>+" + format(data.effect) + "</b>/秒<br>"
					+ t("common.cost") + " " + format(data.cost) + " " + t("chat.ctx.units")
					+ "<br>" + t("common.level") + " " + formatWhole(data.amount)
			},
			canAfford() { return player.chat.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				let cost = tmp[this.layer].buyables[this.id].cost
				player.chat.points = player.chat.points.sub(cost)
				player.chat.buyables[this.id] = player.chat.buyables[this.id].add(1)
				player.chat.spentOnBuyables = player.chat.spentOnBuyables.add(cost)
			},
			unlocked() { return hasUpgrade("chat", 23) },
		},
	},
})
