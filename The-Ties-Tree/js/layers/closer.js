/* =========================================================================
 *  知己 / Confidant  —  row 2, position 0. The static floor.
 *
 *  知己 is the one currency you buy one at a time instead of prestiging for:
 *  each floor costs requires × base^(amount/gainExp) 交情. It grants the rest
 *  of the automation ladder and, being row 2, its doReset is a deliberate
 *  no-op — buying a confidant must never wipe the relationships underneath.
 * ========================================================================= */

addLayer("closer", {
	name: t("closer.name", "知己"),
	symbol: t("closer.symbol", "知己"),
	color: "#c98fd6",
	resource: t("closer.resource", "知己"),
	row: 2,
	position: 0,

	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
		}
	},

	baseResource: t("trust.resource", "交情"),
	baseAmount() { return player.trust.points },
	requires: new Decimal(12000),

	type: "static",
	base: 2,
	exponent: 1,
	roundUpCost: true,

	/** Static currency: raising gainExp lowers the price of the next floor,
	 *  which is the only knob this shape has. 交情 is cube-root compressed, so
	 *  without this the floor ladder would be two purchases long. */
	gainExp() {
		let ret = new Decimal(60)
		if (hasUpgrade("closer", 14)) ret = ret.times(upgradeEffect("closer", 14))
		return ret
	},

	gainMult() { return new Decimal(1) },

	/** N-STATICMAX: without this the layer banks exactly one floor per prestige
	 *  and its whole upgrade ladder is dead. */
	canBuyMax() { return hasUpgrade(this.layer, 11) },

	/** Deliberately empty. See the file header. */
	doReset(resettingLayer) {
		if (layers[resettingLayer].row < 2) return undefined
	},

	hotkeys: [
		{
			key: "d",
			description: () => t("closer.hotkey", "D: buy a 知己"),
			onPress() { if (canReset(this.layer)) doReset(this.layer) },
		},
	],

	tabFormat: [
		["display-text", function () { return mainAmount("closer", false) }],
		"prestige-button",
		["display-text", function () {
			return t("closer.ctx.have") + " <b>" + formatWhole(player.closer.points) + "</b> " + t("trust.ctx.units")
		}],
		["display-text", function () {
			let next = tmp.closer.nextAt
			return t("closer.ctx.next") + " <b>" + formatWhole(next) + "</b> " + t("trust.ctx.units")
				+ " &nbsp;|&nbsp; " + t("closer.ctx.have2") + " <b>" + format(player.trust.points) + "</b>"
		}],
		["display-text", function () {
			if (!shiftDown) return ""
			return "<span style='opacity:.6'>" + t("closer.ctx.formula")
				+ ": 12000 × 2^(" + format(player.closer.points) + " / " + format(tmp.closer.gainExp) + ")</span>"
		}],
		["microtabs", "stuff"],
	],

	microtabs: {
		stuff: {
			[t("tab.upgrades", "升级")]: {
				unlocked() { return true },
				content: [["blank", "15px"], "upgrades"],
				buttonStyle() { return { "background-color": "#3d2b47" } },
			},
			[t("tab.wall", "陈列")]: {
				unlocked() { return hasUpgrade("closer", 13) },
				content: [
					["blank", "10px"],
					["display-text", function () {
						let n = formatWhole(player.closer.points)
						return t("closer.wall.intro") + " <b style='color:#c98fd6'>" + n + "</b> " + t("trust.ctx.units")
					}],
					["blank", "10px"],
					"buyables",
					["blank", "10px"],
					["display-text", function () {
						if (!player.closer.canBuyMax && hasUpgrade("closer", 11))
							return t("closer.wall.nomax")
						return t("closer.wall.note")
					}],
				],
				buttonStyle() { return { "background-color": "#4a3057" } },
			},
			[t("tab.milestones", "里程碑")]: {
				unlocked() { return true },
				content: [["blank", "10px"], "milestones"],
			},
		},
	},

	upgrades: {
		11: {
			title: t("closer.up11.t", "一次说清楚"),
			description: t("closer.up11.d", "话头生成 ×8；可以一次买多个知己。"),
			cost: new Decimal(1),
			unlocked() { return player.closer.unlocked },
		},
		12: {
			title: t("closer.up12.t", "不用客套"),
			description: t("closer.up12.d", "寒暄收益 ×4。"),
			cost: new Decimal(2),
			unlocked() { return hasUpgrade("closer", 11) },
		},
		13: {
			title: t("closer.up13.t", "记下来"),
			description: t("closer.up13.d", "解锁「陈列」。"),
			cost: new Decimal(5),
			unlocked() { return hasUpgrade("closer", 12) },
		},
		14: {
			title: t("closer.up14.t", "别断联"),
			description: t("closer.up14.d", "下一个知己的价格便宜 45%。"),
			cost: new Decimal(12),
			unlocked() { return hasUpgrade("closer", 13) },
			effect() { return new Decimal(1.8) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		15: {
			title: t("closer.up15.t", "有事真能找你"),
			description: t("closer.up15.d", "交情收益 ×2。"),
			cost: new Decimal(30),
			unlocked() { return hasUpgrade("closer", 14) },
		},
		21: {
			title: t("closer.up21.t", "他们替你说话"),
			description: t("closer.up21.d", "寒暄收益 × 交情的对数。"),
			cost: new Decimal(45),
			unlocked() { return hasUpgrade("closer", 15) },
			effect() { return player.trust.points.add(10).log10().pow(0.5).max(1.5) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		22: {
			title: t("closer.up22.t", "介绍给别人"),
			description: t("closer.up22.d", "寒暄收益 × 知己数的对数。"),
			cost: new Decimal(90),
			unlocked() { return hasUpgrade("closer", 21) },
			effect() { return player.closer.points.add(1).log10().pow(0.5).max(1.5) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		23: {
			title: t("closer.up23.t", "有人替你引荐"),
			description: t("closer.up23.d", "熟人收益 × 交情的对数。"),
			cost: new Decimal(130),
			unlocked() { return hasUpgrade("closer", 22) },
			effect() { return player.trust.points.add(100).log10().pow(0.4).max(1.5) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		24: {
			title: t("closer.up24.t", "不用开口就懂"),
			description: t("closer.up24.d", "交情收益 × 交情的对数；默契产出 ×2。"),
			cost: new Decimal(145),
			unlocked() { return hasUpgrade("closer", 23) },
			effect() { return player.trust.points.add(100).log10().pow(0.5).max(1.5) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		25: {
			title: t("closer.up25.t", "真正的交情"),
			description: t("closer.up25.d", "交情收益 ×3。"),
			cost: new Decimal(148),
			unlocked() { return hasUpgrade("closer", 24) },
		},
	},

	milestones: {
		0: {
			requirementDescription: t("closer.ms0.r", "拥有 1 位知己"),
			effectDescription: t("closer.ms0.e", "寒暄的升级可以自动购买。"),
			done() { return player.closer.best.gte(1) },
		},
		1: {
			requirementDescription: t("closer.ms1.r", "拥有 2 位知己"),
			effectDescription: t("closer.ms1.e", "熟人会自己慢慢长。"),
			unlocked() { return hasMilestone("closer", 0) },
			done() { return player.closer.best.gte(2) },
		},
		2: {
			requirementDescription: t("closer.ms2.r", "拥有 3 位知己"),
			effectDescription: t("closer.ms2.e", "话头生成 ×5，熟人收益 ×1.5，朋友收益 ×1.5。"),
			unlocked() { return hasMilestone("closer", 1) },
			done() { return player.closer.best.gte(3) },
		},
		3: {
			requirementDescription: t("closer.ms3.r", "拥有 20 位知己"),
			effectDescription: t("closer.ms3.e", "寒暄收益 ×2，交情收益 ×2。"),
			unlocked() { return hasMilestone("closer", 2) },
			done() { return player.closer.best.gte(20) },
		},
	},

	buyables: {
		11: {
			title: t("closer.buy11.t", "常联系"),
			cost(x) { return Decimal.pow(2, x).mul(6) },
			effect(x) { return Decimal.pow(2, x).mul(0.3) },
			display() {
				let data = tmp[this.layer].buyables[this.id]
				return t("closer.buy11.d", "话头生成") + " <b>+" + format(data.effect) + "</b>/秒<br>"
					+ t("common.cost") + " " + formatWhole(data.cost) + " " + t("trust.ctx.units")
					+ "<br>" + t("common.level") + " " + formatWhole(data.amount)
			},
			canAfford() { return player.trust.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				let cost = tmp[this.layer].buyables[this.id].cost
				// Paid in 交情, NOT in 知己: the 知己 counter is the floor count the
				// next buy-max is computed from, so spending it makes that negative.
				player.trust.points = player.trust.points.sub(cost)
				player.closer.buyables[this.id] = player.closer.buyables[this.id].add(1)
				player.closer.spentOnBuyables = player.closer.spentOnBuyables.add(cost)
			},
			unlocked() { return hasUpgrade("closer", 13) },
		},
		21: {
			title: t("closer.buy21.t", "攒了个局"),
			cost(x) { return Decimal.pow(2, x).mul(40) },
			effect(x) { return Decimal.pow(2, x).mul(0.15) },
			display() {
				let data = tmp[this.layer].buyables[this.id]
				return t("closer.buy21.d", "寒暄收益") + " <b>+×" + format(data.effect) + "</b><br>"
					+ t("common.cost") + " " + formatWhole(data.cost) + " " + t("trust.ctx.units")
					+ "<br>" + t("common.level") + " " + formatWhole(data.amount)
			},
			canAfford() { return player.trust.points.gte(tmp[this.layer].buyables[this.id].cost) },
			buy() {
				let cost = tmp[this.layer].buyables[this.id].cost
				// Paid in 交情, NOT in 知己: the 知己 counter is the floor count the
				// next buy-max is computed from, so spending it makes that negative.
				player.trust.points = player.trust.points.sub(cost)
				player.closer.buyables[this.id] = player.closer.buyables[this.id].add(1)
				player.closer.spentOnBuyables = player.closer.spentOnBuyables.add(cost)
			},
			unlocked() { return hasUpgrade("closer", 22) },
		},
	},
})
