// ============================================================================
// cert — 根除认证（row 4，M19 消耗式重置）
// 每次发射 = 一枚认证印章：逐项消耗 疫苗剂量 / 协作资金 / 围堵行动，
// 要求反弹压强归零；第 9 枚 = 1979-10-25 人类天花绝迹日印章（isEndgame）。
// ============================================================================
addLayer("cert", {
	name() { return zh("Certification", "根除认证") },
	symbol() { return window.chinesemode ? "认证" : "CE" },
	position: 0,
	row: 4,
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
	} },
	color: "#ffd966",
	resource() { return zh("certification seals", "认证印章") },
	baseResource() { return zh("campaign progress", "战役进度") },
	baseAmount() { return player.cmp.points },
	requires() { return new Decimal(T("LAUNCH_CMP_REQ")) },
	type: "custom",
	branches: ["cmp"],
	// ---- M19 发射定价（逐项消耗；折扣：int 商店/挑战/协定 + cmp m10 只作用于战役进度要求）----
	launchCosts() {
		let n = player.cert.points.toNumber()
		let disc = new Decimal(1)
		if (hasUpgrade("int", 41)) disc = disc.times(0.9)
		if (hasChallenge("int", 11)) disc = disc.times(0.85)
		if (player.int.unlocked && tmp.int) disc = disc.times(buyableEffect("int", 11))
		return {
			doses: new Decimal(T("LAUNCH_DOSES")).times(Decimal.pow(T("LAUNCH_DOSES_GROWTH"), n)).times(disc),
			funds: new Decimal(T("LAUNCH_FUNDS")).times(Decimal.pow(T("LAUNCH_FUNDS_GROWTH"), n)).times(disc),
			sweeps: new Decimal(T("LAUNCH_SWEEPS")).add(n * T("LAUNCH_SWEEP_STEP")),
			cmpReq: new Decimal(T("LAUNCH_CMP_REQ")).times(Decimal.pow(T("LAUNCH_CMP_GROWTH"), n)).times(hasMilestone("cmp", 10) ? 0.75 : 1),
			zeroTimeReq: new Decimal(T("LAUNCH_ZERO_BASE")).times(n + 1).add(new Decimal(T("LAUNCH_ZERO_STEP")).times(n * (n + 1) / 2)),
		}
	},
	canReset() {
		if (!player.cmp.unlocked) return false
		let c = this.launchCosts()
		if (player.cmp.points.lt(c.cmpReq)) return false
		if (player.pro.points.lt(c.doses)) return false
		if (player.int.points.lt(c.funds)) return false
		if (player.sur.points.lt(c.sweeps)) return false
		if (player.sur.unlocked && player.sur.pressure.gt(T("LAUNCH_PRESSURE_LIMIT"))) return false
		// 首次发射后：必须保持过零病例监测期（两年）
		if (player.cert.points.gte(1) && player.sur.zeroTime.lt(c.zeroTimeReq)) return false
		return true
	},
	getResetGain() { return new Decimal(1) },
	/* 同 cmp：引擎 custom 层每帧必调 getNextAt；发射条件逐项列在 tabFormat，无单一数字 */
	getNextAt() { return new Decimal(Infinity) },
	onPrestige(gain) {
		let c = this.launchCosts()
		player.pro.points = player.pro.points.sub(c.doses).max(0)
		player.int.points = player.int.points.sub(c.funds).max(0)
		player.sur.points = player.sur.points.sub(c.sweeps).max(0)
		player.sur.pressure = new Decimal(0)
	},
	prestigeButtonText() {
		return zh(
			`Fire the certification launch (consumes doses / funds / operations — see list below)`,
			`点火认证发射（消耗 剂量 / 资金 / 围堵行动 —— 见下方清单）`)
	},
	hotkeys: [
		{ key: "e", description() { return zh("E: Certification launch", "E：认证发射") },
		  onPress() { if (canReset(this.layer)) doReset(this.layer) } },
	],
	layerShown() { return hasMilestone("cmp", 6) || player.cert.unlocked },
	doReset(resettingLayer) {
		if (!(layers[resettingLayer].row > this.row)) return
		layerDataReset(this.layer, ["unlocked", "auto", "milestones", "best", "total"])
	},
	tabFormat: [
		["display-text", function() {
			return zh(
				`You hold <h2 style="color:#ffd966;text-shadow:0px 0px 10px #ffd966">${formatWhole(player.cert.points)}</h2> ${zh("certification seals", "认证印章")}`,
				`你持有 <h2 style="color:#ffd966;text-shadow:0px 0px 10px #ffd966">${formatWhole(player.cert.points)}</h2> 枚认证印章`)
		}],
		"prestige-button",
		["display-text", function() {
			let c = layers.cert.launchCosts()
			let ok = (a, b) => a.gte(b)
			let line = (name, have, need) => {
				let good = ok(have, need)
				return `<span style="color:${good ? "#9fd8a0" : "#ff8a8a"}">${name}: ${formatWhole(have)} / ${formatWhole(need)}</span>`
			}
			let zero = player.sur.pressure.lte(0.01)
			let zt = player.sur.zeroTime.gte(T("ZERO_TIME_GOAL")) || player.cert.points.lt(1)
			return zh(
				line("Campaign progress", player.cmp.points, c.cmpReq) + "<br>" +
				line("Vaccine doses", player.pro.points, c.doses) + "<br>" +
				line("Cooperation funds", player.int.points, c.funds) + "<br>" +
				line("Containment ops", player.sur.points, c.sweeps) + "<br>" + line("Zero-case monitoring", player.sur.zeroTime, c.zeroTimeReq) + "<br>" +
				`<span style="color:${zero ? "#9fd8a0" : "#ff8a8a"}">Rebound pressure must be 0 (now ${format(player.sur.pressure, 1)}%)</span><br>` +
				`<span style="color:${zt ? "#9fd8a0" : "#ff8a8a"}">Zero-case watch: ${player.cert.points.lt(1) ? "not yet required" : formatTime(player.sur.zeroTime.toNumber()) + " / 10m00s"}</span>`,
				line("战役进度", player.cmp.points, c.cmpReq) + "<br>" +
				line("疫苗剂量", player.pro.points, c.doses) + "<br>" +
				line("协作资金", player.int.points, c.funds) + "<br>" +
				line("围堵行动", player.sur.points, c.sweeps) + "<br>" + line("零病例监测", player.sur.zeroTime, c.zeroTimeReq) + "<br>" +
				`<span style="color:${zero ? "#9fd8a0" : "#ff8a8a"}">反弹压强必须为 0（当前 ${format(player.sur.pressure, 1)}%）</span><br>` +
				`<span style="color:${zt ? "#9fd8a0" : "#ff8a8a"}">零病例监测期：${player.cert.points.lt(1) ? "首次发射无要求" : formatTime(player.sur.zeroTime.toNumber()) + " / 10分00秒"}</span>`)
		}],
		["display-text", function() {
			return zh(
				`Each launch burns the stockpile and resets the world below — milestones and the three pillars survive.`,
				`每次发射都会烧掉库存并重置下方世界——里程碑与三大支柱会保留。`)
		}],
		["microtabs", "stuff"],
		["blank", "15px"],
	],
	microtabs: {
		stuff: {
			"Seals": {
				name() { return zh("Milestones", "印章簿") },
				unlocked() { return true },
				content: ["blank", "milestones"],
			},
		},
	},
	milestones: {
		0: { requirementDescription() { return zh("Seal 1 — The Americas certified (1973)", "印章 1 —— 美洲区域认证（1973）") },
			done() { return player[this.layer].best.gte(1) },
			effectDescription() { return zh("Case gain ×3", "病例获取 ×3") } },
		1: { requirementDescription() { return zh("Seal 2 — Asia certified (1975)", "印章 2 —— 亚洲区域认证（1975）") },
			unlocked() { return hasMilestone(this.layer, 0) },
			done() { return player[this.layer].best.gte(2) },
			effectDescription() { return zh("Variolated ×2", "接种者 ×2") } },
		2: { requirementDescription() { return zh("Seal 3 — Two years of zero cases", "印章 3 —— 连续两年零病例") },
			unlocked() { return hasMilestone(this.layer, 1) },
			done() { return player[this.layer].best.gte(3) },
			effectDescription() { return zh("Immune citizens ×2", "免疫公民 ×2") } },
		3: { requirementDescription() { return zh("Seal 4 — Horn of Africa certified (1977)", "印章 4 —— 非洲之角认证（1977）") },
			unlocked() { return hasMilestone(this.layer, 2) },
			done() { return player[this.layer].best.gte(4) },
			effectDescription() { return zh("Doses ×2", "剂量 ×2") } },
		4: { requirementDescription() { return zh("Seal 5 — Africa certified", "印章 5 —— 非洲区域认证") },
			unlocked() { return hasMilestone(this.layer, 3) },
			done() { return player[this.layer].best.gte(5) },
			effectDescription() { return zh("Funds ×2", "资金 ×2") } },
		5: { requirementDescription() { return zh("Seal 6 — Global Commission convened (Geneva, 1979)", "印章 6 —— 全球委员会成立（日内瓦，1979）") },
			unlocked() { return hasMilestone(this.layer, 4) },
			done() { return player[this.layer].best.gte(6) },
			effectDescription() { return zh("Campaign progress ×2", "战役进度 ×2") } },
		6: { requirementDescription() { return zh("Seal 7 — Every region confirmed", "印章 7 —— 各区域逐一确认") },
			unlocked() { return hasMilestone(this.layer, 5) },
			done() { return player[this.layer].best.gte(7) },
			effectDescription() { return zh("Insight ×2", "认知 ×2") } },
		7: { requirementDescription() { return zh("Seal 8 — Final verifications", "印章 8 —— 最终核验") },
			unlocked() { return hasMilestone(this.layer, 6) },
			done() { return player[this.layer].best.gte(8) },
			effectDescription() { return zh("Variolated ×3", "接种者 ×3") } },
		8: { requirementDescription() { return zh("★ Seal 9 — OCTOBER 25, 1979: Smallpox Zero Day ★", "★ 印章 9 —— 1979年10月25日：人类天花绝迹日 ★") },
			unlocked() { return hasMilestone(this.layer, 7) },
			done() { return player[this.layer].best.gte(9) },
			effectDescription() { return zh("The world reaches zero. (Endgame)", "世界归零。（终局）") } },
		9: { requirementDescription() { return zh("Seal 10 — Global Commission signs: 'smallpox is dead' (1979-12-09)", "印章 10 —— 全球委员会签署：天花已死（1979-12-09）") },
			unlocked() { return hasMilestone(this.layer, 8) },
			done() { return player[this.layer].best.gte(10) },
			effectDescription() { return zh("A post-victory seal", "胜利后的印章") } },
		10: { requirementDescription() { return zh("Seal 11 — WHA declares eradication (1980-05-08)", "印章 11 —— 世界卫生大会宣布根除（1980-05-08）") },
			unlocked() { return hasMilestone(this.layer, 9) },
			done() { return player[this.layer].best.gte(11) },
			effectDescription() { return zh("A post-victory seal", "胜利后的印章") } },
		11: { requirementDescription() { return zh("Seal 12 — Virus locked in two labs; the file is closed", "印章 12 —— 病毒封存于两处实验室；档案封卷") },
			unlocked() { return hasMilestone(this.layer, 10) },
			done() { return player[this.layer].best.gte(12) },
			effectDescription() { return zh("The archive is complete", "档案封卷完成") } },
	},
})
