/* =========================================================================
 *  社交圈 / Social Circle  —  row 2, position 1. The hub, and the ceiling.
 *
 *  This is the layer the whole theme points at: Dunbar's number. The currency
 *  is a HARD-CAPPED count — softcap(x, 150, 0) — and the upgrade ladder is
 *  priced in circle members, so the ladder and the cap are the same thing.
 *  There is no upgrade that raises 150; the win condition is filling it.
 *
 *  It is also the game's `sim` layer: one hand-written update() driving 疏离度,
 *  the drift you have to actively hold back.
 * ========================================================================= */

/** Dunbar's number. Not an upgrade target — this is the wall. */
var DUNBAR = 150;

/** 疏离度 multiplier on every circle gain. 1.0 while you keep up with people. */
function circleDriftMult() {
	if (player.circle.drift.lte(0)) return new Decimal(1)
	return new Decimal(1).div(player.circle.drift.add(1).pow(0.55))
}

addLayer("circle", {
	name: t("circle.name", "社交圈"),
	symbol: t("circle.symbol", "圈"),
	color: "#9ad0e8",
	resource: t("circle.resource", "社交圈"),
	row: 2,
	position: 1,

	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			drift: new Decimal(0),        // 疏离度 — the decay this layer is about
		}
	},

	baseResource: t("trust.resource", "交情"),
	baseAmount() { return player.trust.points },
	requires: new Decimal(20000),

	type: "custom",

	/** Hand-written prestige. One tie per unit of gainMult, and never past 150. */
	getResetGain() {
		if (player.circle.points.gte(DUNBAR)) return new Decimal(0)

		// People are countable: the gain is a whole number, and the last step is
		// trimmed so it lands exactly on Dunbar rather than a hair under it.
		let ret = tmp.circle.gainMult.times(circleDriftMult()).floor().max(1)
		let room = new Decimal(DUNBAR).sub(player.circle.points)

		if (ret.gte(room)) ret = room
		return ret
	},

	/** Price of the next tie. Rises gently so the last fifty are the hardest,
	 *  while staying inside what 交情 can actually reach. */
	getNextAt() {
		return tmp.circle.requires.times(Decimal.pow(player.circle.points.add(1), 0.8))
	},

	canReset() { return tmp.circle.baseAmount.gte(tmp.circle.nextAt) && player.circle.points.lt(DUNBAR) },

	prestigeNotify() { return player.circle.points.lt(DUNBAR - 1) && this.canReset() },

	prestigeButtonText() {
		if (player.circle.points.gte(DUNBAR))
			return "<b>" + t("circle.btn.done") + "</b>"
		return "<b>" + t("circle.btn.go") + "</b> — +" + format(tmp.circle.resetGain, 2)
			+ " " + t("circle.ctx.units")
	},

	gainMult() {
		let ret = new Decimal(1)
		if (hasUpgrade("circle", 15)) ret = ret.times(upgradeEffect("circle", 15))
		if (hasUpgrade("circle", 25)) ret = ret.times(upgradeEffect("circle", 25))

		if (hasUpgrade("trust", 14)) ret = ret.times(1.5)
		if (hasUpgrade("closer", 15)) ret = ret.times(2)

		if (hasMilestone("circle", 1)) ret = ret.times(2)
		if (hasMilestone("circle", 2)) ret = ret.times(3)
		if (hasMilestone("circle", 3)) ret = ret.times(3)
		if (hasMilestone("closer", 3)) ret = ret.times(1.5)

		// K6 conditional: knowing people one-to-one is what actually works
		ret = ret.times(player.closer.points.add(1).log10().div(5).add(1))

		return ret
	},

	/** `sim`: the one hand-written update() in the game. Never touches
	 *  points — addPoints stays the only writer of best/total. */
	update(diff) {
		if (!player.circle.unlocked) return
		if (player.circle.points.gte(DUNBAR)) return

		let rate = new Decimal(0.0016)
		if (hasUpgrade("circle", 14)) rate = rate.times(0.5)
		if (hasUpgrade("circle", 33)) rate = rate.times(0.6)
		if (player.circle.points.gte(DUNBAR - 10)) rate = rate.times(1.5)

		player.circle.drift = player.circle.drift.add(rate.times(diff))
	},

	/** The circle is a SINK, never a tax: growing it costs nothing below. It is
	 *  purely additive, so `resetsNothing` is unconditionally true and the whole
	 *  rowReset cascade (including the 话头 reset) is skipped. Without this,
	 *  every single person added would wipe the 交情 that paid for them. */
	resetsNothing() { return true },
	autoPrestige() { return hasMilestone("circle", 1) },

	doReset(resettingLayer) {
		if (layers[resettingLayer].row < 2) return undefined
		if (hasMilestone("circle", 1)) return undefined
		layerDataReset(this.layer, ["unlocked", "best", "total", "milestones", "drift"])
	},

	hotkeys: [
		{
			key: "c",
			description: () => t("circle.hotkey", "C: 扩张社交圈"),
			onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],

	tabFormat: [
		["display-text", function () { return mainAmount("circle", false) }],
		"prestige-button",
		["display-text", function () {
			// The ceiling is on screen, permanently, because it is the win.
			return t("circle.ctx.have") + " <b>" + formatWhole(player.circle.points) + "</b> / "
				+ "<b style='color:#e0b070'>" + formatWhole(new Decimal(DUNBAR)) + "</b> " + t("circle.ctx.units")
		}],
		["display-text", function () {
			let left = new Decimal(DUNBAR).sub(player.circle.points)
			if (left.lte(0)) return "<span style='color:#8fd6b4'>" + t("circle.ctx.full") + "</span>"
			return t("circle.ctx.left") + " <b>" + formatWhole(left) + "</b> · "
				+ t("circle.ctx.next") + " <b>" + format(tmp.circle.nextAt) + "</b> " + t("trust.ctx.units")
		}],
		["display-text", function () {
			let d = player.circle.drift
			let label = t("circle.ctx.drift") + " <b>" + format(d, 2) + "</b>"
			if (d.lte(0)) return "<span style='color:#8fd6b4'>" + label + "</span>"
			return "<span style='color:#e0716f'>" + label + "</span> — "
				+ t("circle.ctx.drift.warn") + " ×" + format(circleDriftMult(), 3)
		}],
		["display-text", function () {
			if (!shiftDown) return ""
			return "<span style='opacity:.6'>" + t("circle.ctx.formula")
				+ ": ×" + format(tmp.circle.gainMult) + " × " + format(circleDriftMult(), 3)
				+ " · " + t("circle.ctx.formula2") + "</span>"
		}],
		["microtabs", "stuff"],
	],

	microtabs: {
		stuff: {
			[t("tab.upgrades", "升级")]: {
				unlocked() { return true },
				content: [["blank", "15px"], "upgrades"],
				buttonStyle() { return { "background-color": "#233a45" } },
			},
			[t("tab.circle", "圈")]: {
				unlocked() { return hasUpgrade("circle", 13) },
				content: [
					["blank", "10px"],
					["display-text", function () {
						return t("circle.tab.intro")
					}],
					["blank", "10px"],
					"buyables",
					["blank", "10px"],
					["display-text", function () {
						return t("circle.tab.note")
					}],
				],
				buttonStyle() { return { "background-color": "#2c4c5c" } },
			},
			[t("tab.milestones", "里程碑")]: {
				unlocked() { return true },
				content: [["blank", "10px"], "milestones"],
			},
		},
	},

	upgrades: {
		11: {
			title: t("circle.up11.t", "还愿意找你"),
			description: t("circle.up11.d", "话头生成 ×12。"),
			cost: new Decimal(1),
			unlocked() { return player.circle.unlocked },
		},
		12: {
			title: t("circle.up12.t", "有人替你说话"),
			description: t("circle.up12.d", "寒暄收益 ×5。"),
			cost: new Decimal(2),
			unlocked() { return hasUpgrade("circle", 11) },
		},
		13: {
			title: t("circle.up13.t", "列个名单"),
			description: t("circle.up13.d", "解锁「圈」。"),
			cost: new Decimal(4),
			unlocked() { return hasUpgrade("circle", 12) },
		},
		14: {
			title: t("circle.up14.t", "别让它凉"),
			description: t("circle.up14.d", "疏离度增长减半。"),
			cost: new Decimal(8),
			unlocked() { return hasUpgrade("circle", 13) },
		},
		15: {
			title: t("circle.up15.t", "还有位置"),
			description: t("circle.up15.d", "社交圈扩张 ×2。"),
			cost: new Decimal(16),
			unlocked() { return hasUpgrade("circle", 14) },
			effect() { return new Decimal(2) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		21: {
			title: t("circle.up21.t", "他们互相认识"),
			description: t("circle.up21.d", "寒暄收益 × 交情的对数。"),
			cost: new Decimal(40),
			unlocked() { return hasUpgrade("circle", 15) },
			effect() { return player.trust.points.add(1000).log10().pow(0.4).max(1.5) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		22: {
			title: t("circle.up22.t", "圈子会自己滚雪球"),
			description: t("circle.up22.d", "寒暄收益 × 社交圈规模的立方根。"),
			cost: new Decimal(70),
			unlocked() { return hasUpgrade("circle", 21) },
			effect() { return player.circle.points.add(1).pow(1 / 3).max(1.5) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		23: {
			title: t("circle.up23.t", "熟人自然产生"),
			description: t("circle.up23.d", "熟人收益 × 社交圈规模的立方根。"),
			cost: new Decimal(100),
			unlocked() { return hasUpgrade("circle", 22) },
			effect() { return player.circle.points.add(1).pow(1 / 3).max(1.5) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		24: {
			title: t("circle.up24.t", "朋友自然产生"),
			description: t("circle.up24.d", "交情收益 × 社交圈规模的立方根。"),
			cost: new Decimal(125),
			unlocked() { return hasUpgrade("circle", 23) },
			effect() { return player.circle.points.add(1).pow(1 / 3).max(1.5) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		25: {
			title: t("circle.up25.t", "位置还有"),
			description: t("circle.up25.d", "社交圈扩张 ×3。"),
			cost: new Decimal(140),
			unlocked() { return hasUpgrade("circle", 24) },
			effect() { return new Decimal(3) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		33: {
			title: t("circle.up33.t", "名单还在长"),
			description: t("circle.up33.d", "疏离度增长再降 40%（离 150 还有 10 个位置时，疏离反而更快）。"),
			cost: new Decimal(146),
			unlocked() { return player.circle.best.gte(50) && hasUpgrade("circle", 25) },
		},
	},

	milestones: {
		0: {
			requirementDescription: t("circle.ms0.r", "社交圈达到 1 人"),
			effectDescription: t("circle.ms0.e", "熟人可以自动重置。"),
			done() { return player.circle.best.gte(1) },
		},
		1: {
			requirementDescription: t("circle.ms1.r", "社交圈达到 2 人"),
			effectDescription: t("circle.ms1.e", "知己与朋友都可以自动扩张；社交圈扩张 ×2。"),
			unlocked() { return hasMilestone("circle", 0) },
			done() { return player.circle.best.gte(2) },
		},
		2: {
			requirementDescription: t("circle.ms2.r", "社交圈达到 10 人"),
			effectDescription: t("circle.ms2.e", "话头生成 ×10，熟人收益 ×1.5，交情收益 ×1.5，社交圈扩张 ×3。"),
			unlocked() { return hasMilestone("circle", 1) },
			done() { return player.circle.best.gte(10) },
		},
		3: {
			requirementDescription: t("circle.ms3.r", "社交圈达到 50 人"),
			effectDescription: t("circle.ms3.e", "所有关系的收益 ×2，社交圈扩张 ×3。"),
			unlocked() { return hasMilestone("circle", 2) },
			done() { return player.circle.best.gte(50) },
		},
	},

	buyables: {
		11: {
			title: t("circle.buy11.t", "挨个联系一遍"),
			cost(x) { return Decimal.pow(1.8, x).mul(3) },
			effect(x) { return Decimal.pow(1.8, x).mul(0.5) },
			display() {
				let data = tmp[this.layer].buyables[this.id]
				return t("circle.buy11.d", "疏离度 −") + " <b>" + format(data.effect, 2) + "</b><br>"
					+ t("circle.buy11.d2", "社交圈扩张") + " <b>+×" + format(data.effect, 2) + "</b><br>"
					+ t("common.cost") + " " + formatWhole(data.cost) + " " + t("circle.ctx.units")
					+ "<br>" + t("common.level") + " " + formatWhole(data.amount)
			},
			canAfford() { return player.circle.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				let cost = tmp[this.layer].buyables[this.id].cost
				player.circle.points = player.circle.points.sub(cost)
				player.circle.buyables[this.id] = player.circle.buyables[this.id].add(1)
				player.circle.spentOnBuyables = player.circle.spentOnBuyables.add(cost)
				player.circle.drift = player.circle.drift.mul(0.9)
			},
			unlocked() { return hasUpgrade("circle", 13) },
		},
	},
})
