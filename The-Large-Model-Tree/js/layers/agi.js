// ============================================================================
// agi — AGI（row 5，custom 终局仪式层）
// 每个 AGI 里程碑 = 一次通用能力飞跃。达到 1024 = 通用人工智能达成，
// 1024 程序员节的胜利数字。
// ============================================================================

addLayer("agi", {
	name: "agi",
	symbol: "AI",
	position: 0,
	row: 5,
	color: "#ffcc00",
	resource() { return L("AGI 里程碑", "AGI milestones") },
	resZh: "AGI 里程碑", resEn: "AGI milestones",
	baseResource() { return L("涌现", "Emergence") },
	baseZh: "涌现", baseEn: "emergence",
	baseAmount() { return player.em.points },
	requires: new Decimal(TUNING.AGI.req),
	type: "custom",

	startData() {
		return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0) }
	},

	gainMult() {
		let m = new Decimal(1)
		if (hasMilestone("agi", 1)) m = m.times(TUNING.MS.agi1)
		if (hasUpgrade("agi", 12)) m = m.times(player.agi.points.add(1).pow(TUNING.SELF.agi12))
		if (hasUpgrade("agi", 13)) m = m.times(player.em.best.max(1).log(10).add(1).pow(TUNING.SHAPE.agi13))
		return m
	},
	getResetGain() {
		let g = player.em.points.div(TUNING.AGI.req).max(0).pow(TUNING.AGI.gainExp)
		return g.times(this.gainMult()).floor()
	},
	getNextAt() {
		let n = player.agi.points.add(1).div(this.gainMult().max(0.01)).pow(TUNING.AGI.nextPow)
		if (hasUpgrade("agi", 24)) n = n.times(0.5)
		return n.times(TUNING.AGI.req)
	},
	canReset() { return this.getResetGain().gte(1) },
	prestigeButtonText() {
		return L("向 AGI 迈进一步", "One step closer to AGI") +
			"<br>+" + formatWhole(tmp.agi.resetGain) + " " + L("里程碑", "milestones") +
			"<br><span style='opacity:.7'>" + L("下一级需涌现 ≥ ", "next at emergence ≥ ") + format(tmp.agi.nextAt) + "</span>"
	},

	effect() {
		return {
			tokenBoost: player.agi.best.max(1).pow(TUNING.EFF.agiToken),
			trBoost: player.agi.best.max(1).pow(TUNING.EFF.agiTr),
		}
	},
	effectDescription() {
		let e = layers.agi.effect()
		return L("，token ×", ", tokens ×") + format(e.tokenBoost) +
			L("，训练 ×", ", training ×") + format(e.trBoost)
	},

	layerShown() { return player.em.unlocked },
	hotkeys: [
		{ key: "g", description() { return L("G: 迈向 AGI", "G: Step toward AGI") }, onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	branches: ["em"],

	tabFormat: [
		["display-text", tokenLineFn()],
		["display-text", baseLineFn("agi", "#a5d6ff")],
		["display-text", mainLineFn("agi")],
		["display-text", function() {
			return L("距离 1024：", "To 1024: ") +
				"<b style='color:#ffcc00'>" + formatWhole(player.agi.points) + "</b> / 1024" +
				L("（", " (") + formatWhole(player.agi.points.div(1024).times(100)) + "%）"
		}],
		["display-text", bestLineFn("agi")],
		"blank",
		"prestige-button",
		"blank",
		"upgrades",
		"blank",
		["blank", "65px"],
	],

	upgrades: {
		11: {
			title() { return L("对齐的 token", "Aligned tokens") },
			description() { return L("token 产出 ×10。", "Token gain ×10.") },
			cost: new Decimal(1),
			unlocked() { return true },
		},
		12: {
			title() { return L("递归自我改进", "Recursive self-improvement") },
			description() { return L("AGI 收益 ×(AGI+1)^0.25。", "AGI gain ×(AGI+1)^0.25.") },
			cost: new Decimal(5),
			unlocked() { return hasUpgrade("agi", 11) },
			effect() { return player.agi.points.add(1).pow(TUNING.SELF.agi12) },
		},
		13: {
			title() { return L("涌现放大器", "Emergence amplifier") },
			description() { return L("AGI 收益 ×(log₁₀(涌现最高)+1)^1.2。", "AGI gain ×(log₁₀(best emergence)+1)^1.2.") },
			cost: new Decimal(50),
			unlocked() { return hasUpgrade("agi", 12) },
			effect() { return player.em.best.max(1).log(10).add(1).pow(TUNING.SHAPE.agi13) },
		},
		14: {
			title() { return L("全员加速", "Full-throttle") },
			description() { return L("训练收益 ×5。", "Training gain ×5.") },
			cost: new Decimal(500),
			unlocked() { return hasUpgrade("agi", 13) },
		},
		21: {
			title() { return L("代码即智能", "Code is intelligence") },
			description() { return L("token 产出 ×10。致敬所有写代码的人。", "Token gain ×10. For everyone who writes code.") },
			cost: new Decimal(5e3),
			unlocked() { return hasUpgrade("agi", 14) },
		},
		22: {
			title() { return L("自指目标函数", "Self-referential objective") },
			description() { return L("token 产出 ×(AGI 最高+1)^0.5。", "Token gain ×(best AGI+1)^0.5.") },
			cost: new Decimal(5e4),
			unlocked() { return hasUpgrade("agi", 21) },
			effect() { return player.agi.best.max(1).add(1).pow(TUNING.SHAPE.agi22) },
		},
		23: {
			title() { return L("对齐红利", "Alignment dividend") },
			description() { return L("涌现收益 ×5。", "Emergence gain ×5.") },
			cost: new Decimal(5e5),
			unlocked() { return hasUpgrade("agi", 22) },
		},
		24: {
			title() { return L("AGI 前夜", "The eve of AGI") },
			description() { return L("下一级所需涌现减半。", "Next milestone needs half the emergence.") },
			cost: new Decimal(5e6),
			unlocked() { return hasUpgrade("agi", 23) },
		},
	},

	milestones: {
		0: {
			requirementDescription() { return L("128 里程碑 —— 半程前的喘息", "128 milestones — a breath before halfway") },
			effectDescription() { return L("token ×", "Token ×") + format(TUNING.MS.agi0) },
			done() { return player.agi.best.gte(128) },
		},
		1: {
			requirementDescription() { return L("512 —— 临界点", "512 — the threshold") },
			effectDescription() { return L("AGI 收益 ×", "AGI gain ×") + format(TUNING.MS.agi1) },
			unlocked() { return hasMilestone("agi", 0) },
			done() { return player.agi.best.gte(512) },
		},
		2: {
			requirementDescription() { return L("1024 —— 通用人工智能", "1024 — artificial general intelligence") },
			effectDescription() { return L("它醒了。谢谢你，程序员。", "It wakes up. Thank you, programmer.") },
			unlocked() { return hasMilestone("agi", 1) },
			done() { return player.agi.best.gte(TUNING.AGI.win) },
		},
	},
})
