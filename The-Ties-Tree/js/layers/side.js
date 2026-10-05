/* =========================================================================
 *  Side layers — 人际成就 (achievements) and 人际志 (the diary / settings).
 *
 *  P13: side rows are never auto-reset, which is exactly what achievements and
 *  a settings surface want.
 * ========================================================================= */

addLayer("achievements", {
	name: t("ach.name", "人际成就"),
	symbol: t("ach.symbol", "成就"),
	row: "side",
	position: 0,

	startData() { return { unlocked: true, points: new Decimal(0) } },

	// No componentStyles.achievement here: the engine's own achievementStyle()
	// (technical/displays.js:39) already greys + desaturates every uncompleted
	// achievement, which is exactly the "visible but dimmed" rule. componentStyles
	// is evaluated once per LAYER, so this.id never exists there.

	tabFormat: [
		"main-display",
		["display-text", function () {
			let n = player.achievements.achievements.length
			return t("ach.ctx.progress") + " <b>" + n + " / 15</b>"
		}],
		["blank", "10px"],
		"achievements",
	],

	/** P11 backfill: achievements as an alternate automation path. Every push
	 *  is guarded so a re-run cannot duplicate an entry. */
	update() {
		if (hasAchievement("achievements", 13) && !hasMilestone("familiar", 4)) player.familiar.milestones.push(4)
		if (hasAchievement("achievements", 14) && !hasMilestone("trust", 4)) player.trust.milestones.push(4)
		if (hasAchievement("achievements", 31) && !hasMilestone("closer", 3)) player.closer.milestones.push(3)
	},

	achievements: {
		11: {
			name: t("ach.11.n", "第一句话"),
			done() { return player.chat.totalTalk.gte(1e6) },
			tooltip: function () {
				return t("ach.11.t", "累计产出 1e6 话头。") + "<br>" + t("ach.reward") + " " + t("ach.11.r", "话头生成 ×3")
			},
			effect() { return new Decimal(3) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		12: {
			name: t("ach.12.n", "能聊"),
			done() { return player.chat.total.gte(1e6) },
			tooltip: function () {
				return t("ach.12.t", "寒暄累计 1e6。") + "<br>" + t("ach.reward") + " " + t("ach.12.r", "寒暄收益 ×2")
			},
			effect() { return new Decimal(2) },
		},
		13: {
			name: t("ach.13.n", "脸熟"),
			done() { return player.familiar.best.gte(100) },
			tooltip: function () {
				return t("ach.13.t", "熟人最佳记录 100。") + "<br>" + t("ach.reward") + " " + t("ach.13.r", "熟人收益 ×2，并直接送熟人里程碑 4")
			},
			effect() { return new Decimal(2) },
		},
		14: {
			name: t("ach.14.n", "有事真找你"),
			done() { return player.trust.best.gte(1000) },
			tooltip: function () {
				return t("ach.14.t", "交情最佳记录 1000。") + "<br>" + t("ach.reward") + " " + t("ach.14.r", "交情收益 ×2，并直接送朋友里程碑 4")
			},
			effect() { return new Decimal(2) },
		},
		15: {
			name: t("ach.15.n", "知道十个陌生人"),
			done() { return player.closer.best.gte(10) },
			tooltip: function () {
				return t("ach.15.t", "拥有 10 位知己。") + "<br>" + t("ach.reward") + " " + t("ach.15.r", "寒暄收益 ×2")
			},
			effect() { return new Decimal(2) },
		},
		21: {
			name: t("ach.21.n", "会读话"),
			done() { return player.chat.readMindBest >= 10 },
			tooltip: function () {
				return t("ach.21.t", "读心连续猜对 10 次。") + "<br>" + t("ach.reward") + " " + t("ach.21.r", "寒暄收益 ×2")
			},
			effect() { return new Decimal(2) },
		},
		22: {
			name: t("ach.22.n", "话多得吓人"),
			done() { return player.chat.totalTalk.gte(1e12) },
			tooltip: function () {
				return t("ach.22.t", "累计产出 1e12 话头。") + "<br>" + t("ach.reward") + " " + t("ach.22.r", "话头生成 ×5")
			},
			effect() { return new Decimal(5) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		23: {
			name: t("ach.23.n", "什么都能聊"),
			done() { return player.chat.best.gte(1e9) },
			tooltip: function () {
				return t("ach.23.t", "寒暄最佳记录 1e9。") + "<br>" + t("ach.reward") + " " + t("ach.23.r", "寒暄收益 ×3")
			},
			effect() { return new Decimal(3) },
		},
		24: {
			name: t("ach.24.n", "半个城里都认得"),
			done() { return player.familiar.best.gte(1e6) },
			tooltip: function () {
				return t("ach.24.t", "熟人最佳记录 1e6。") + "<br>" + t("ach.reward") + " " + t("ach.24.r", "熟人收益 ×2")
			},
			effect() { return new Decimal(2) },
		},
		25: {
			name: t("ach.25.n", "铁哥们"),
			done() { return player.trust.best.gte(1e8) },
			tooltip: function () {
				return t("ach.25.t", "交情最佳记录 1e8。") + "<br>" + t("ach.reward") + " " + t("ach.25.r", "交情收益 ×2")
			},
			effect() { return new Decimal(2) },
		},
		31: {
			name: t("ach.31.n", "知己满座"),
			done() { return player.closer.best.gte(100) },
			tooltip: function () {
				return t("ach.31.t", "拥有 100 位知己。") + "<br>" + t("ach.reward") + " " + t("ach.31.r", "寒暄收益 ×2，熟人收益 ×2，并直接送知己里程碑 3")
			},
			effect() { return new Decimal(2) },
		},
		32: {
			name: t("ach.32.n", "圈子"),
			done() { return player.circle.best.gte(25) },
			tooltip: function () {
				return t("ach.32.t", "社交圈达到 25 人。") + "<br>" + t("ach.reward") + " " + t("ach.32.r", "熟人收益 ×2，交情收益 ×2")
			},
			effect() { return new Decimal(2) },
		},
		33: {
			name: t("ach.33.n", "一辈子的话都说完过"),
			done() { return player.chat.totalTalk.gte(1e24) },
			tooltip: function () {
				return t("ach.33.t", "累计产出 1e24 话头。") + "<br>" + t("ach.reward") + " " + t("ach.33.r", "话头生成 ×8")
			},
			effect() { return new Decimal(8) },
			effectDisplay() { return format(this.effect()) + "×" },
		},
		34: {
			name: t("ach.34.n", "一百个人"),
			done() { return player.circle.best.gte(100) },
			tooltip: function () {
				return t("ach.34.t", "社交圈达到 100 人。") + "<br>" + t("ach.reward") + " " + t("ach.34.r", "寒暄、熟人与交情收益全部 ×2")
			},
			effect() { return new Decimal(2) },
		},
		35: {
			name: t("ach.35.n", "全都敢"),
			done() {
				return hasChallenge("chat", 11) && hasChallenge("chat", 12)
					&& hasChallenge("familiar", 11) && hasChallenge("trust", 11)
			},
			tooltip: function () {
				return t("ach.35.t", "完成全部四个挑战。") + "<br>" + t("ach.reward") + " " + t("ach.35.r", "寒暄升级可以自动购买（永久）")
			},
			onComplete() {
				if (!hasMilestone("closer", 0)) player.closer.milestones.push(0)
			},
		},
	},
})

/* ---------------------------------------------------------------------------
 *  人际志 — the story dashboard and the settings surface.
 * ------------------------------------------------------------------------- */

addLayer("diary", {
	name: t("diary.name", "人际志"),
	symbol: t("diary.symbol", "志"),
	row: "side",
	position: 1,
	color: "#7f8fa6",

	startData() { return { unlocked: true, points: new Decimal(0) } },

	tabFormat: [
		"main-display",
		["microtabs", "stuff"],
	],

	microtabs: {
		stuff: {
			[t("tab.history", "关系史")]: {
				unlocked() { return true },
				content: [
					["blank", "10px"],
					["display-text", function () { return diaryStats() }],
					["blank", "12px"],
					["display-text", function () { return diaryStory(0) }],
					["blank", "10px"],
					["display-text", function () { return diaryStory(1) }],
					["blank", "10px"],
					["display-text", function () { return diaryStory(2) }],
					["blank", "10px"],
					["display-text", function () { return diaryStory(3) }],
					["blank", "10px"],
					["display-text", function () { return diaryStory(4) }],
					["blank", "10px"],
					["display-text", function () { return diaryStory(5) }],
				],
				buttonStyle() { return { "background-color": "#2b3540" } },
			},
			[t("tab.lang", "语言")]: {
				unlocked() { return true },
				content: [
					["blank", "12px"],
					["display-text", function () { return langSettingsHtml() }],
				],
				buttonStyle() { return { "background-color": "#3a3040" } },
			},
			[t("tab.langlist", "语言表")]: {
				unlocked() { return true },
				content: [
					["blank", "12px"],
					["display-text", function () { return langTableHtml() }],
				],
				buttonStyle() { return { "background-color": "#2f3a30" } },
			},
		},
	},
})

/* Story is unlock-gated and lives in its own tab (handbook 10 §3.7). */
function diaryStory(i) {
	var gates = [
		function () { return player.chat.best.gte(1) },
		function () { return player.chat.best.gte(100) },
		function () { return hasMilestone("familiar", 0) },
		function () { return hasMilestone("trust", 1) },
		function () { return player.closer.best.gte(1) },
		function () { return player.circle.best.gte(10) },
	]
	var unlocked = gates[i]()
	if (!unlocked)
		return "<div style='opacity:.35'>" + t("diary.locked") + "</div>"
	return "<div style='border-left:3px solid #7fc4e8;padding-left:12px'>"
		+ t("diary.s" + (i + 1)) + "</div>"
}

function diaryStats() {
	var rows = [
		[t("diary.stat.talk"), format(player.chat.totalTalk) + " " + t("game.pointsName", "话头")],
		[t("diary.stat.chat"), format(player.chat.total) + " " + t("chat.resource", "寒暄")],
		[t("diary.stat.familiar"), format(player.familiar.total) + " " + t("familiar.resource", "熟人")],
		[t("diary.stat.trust"), format(player.trust.total) + " " + t("trust.resource", "交情")],
		[t("diary.stat.closer"), formatWhole(player.closer.total) + " " + t("closer.resource", "知己")],
		[t("diary.stat.circle"), formatWhole(player.circle.total) + " / 150"],
		[t("diary.stat.rapport"), format(player.trust.rapportTotal) + " " + t("trust.rap.name", "默契")],
		[t("diary.stat.streak"), formatWhole(player.chat.readMindBest)],
		[t("diary.stat.drift"), format(player.circle.drift, 2)],
		[t("diary.stat.ach"), player.achievements.achievements.length + " / 15"],
	]
	var out = "<table style='margin:0 auto;font-size:1.05em'>"
	for (var i = 0; i < rows.length; i++) {
		out += "<tr><td style='text-align:left;padding:2px 14px;opacity:.7'>" + rows[i][0]
			+ "</td><td style='text-align:right'><b>" + rows[i][1] + "</b></td></tr>"
	}
	return out + "</table>"
}
