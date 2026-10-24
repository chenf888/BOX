// ============================================================================
// dash — 疫情档案（side 仪表盘 + 语言切换 + 剧情章节 M15，全部 unlock-gated）
// P13 侧层仪表盘：纪年由主层里程碑喂入（eraName 在 mod.js）。
// ============================================================================
addLayer("dash", {
	name() { return zh("Epidemic File", "疫情档案") },
	symbol() { return window.chinesemode ? "疫情" : "EP" },
	position: 11,
	row: "side",
	startData() { return { unlocked: true, points: new Decimal(0), chinesemode: false } }, // 默认英文（用户 2026-10-25 指定）
	color: "#9fc5e8",
	resource() { return zh("epidemic file", "疫情档案") },
	tooltip() { return zh("Dashboard & chronicle", "仪表盘与编年史") },
	layerShown() { return true },
	type: "none",
	update(diff) {
		window.chinesemode = !!player.dash.chinesemode
	},
	tabFormat: [
		["display-text", function() {
			let p = player.sur.unlocked ? player.sur.pressure : new Decimal(0)
			let pk = player.sur.unlocked ? player.sur.peak : new Decimal(0)
			return `<h3 style="color:#9fc5e8">${eraName()}</h3>` +
				`${zh("Cases", "病例")}: ${formatWhole(player.points)} &nbsp;|&nbsp; ` +
				`${zh("Coverage", "覆盖率")}: ${player.vac.unlocked ? format(covPct(), 1) + "%" : "—"} &nbsp;|&nbsp; ` +
				`${zh("Rebound pressure", "反弹压强")}: ${player.sur.unlocked ? format(p, 1) + "%" : "—"} &nbsp;|&nbsp; ` +
				`${zh("Peak ever", "历史峰值")}: ${player.sur.unlocked ? format(pk, 1) + "%" : "—"}<br>` +
				`${zh("Doses", "剂量")}: ${player.pro.unlocked ? formatWhole(player.pro.points) : "—"} &nbsp;|&nbsp; ` +
				`${zh("Funds", "资金")}: ${player.int.unlocked ? formatWhole(player.int.points) : "—"} &nbsp;|&nbsp; ` +
				`${zh("Seals", "印章")}: ${player.cert.unlocked ? formatWhole(player.cert.points) : "—"}`
		}],
		["toggle", ["dash", "chinesemode"]],
		["display-text", function() { return player.dash.chinesemode ? "当前语言：中文（切换为 English）" : "Language: English (switch to 中文)" }],
		"blank",
		["infobox", "origin"],
		["infobox", "variolation"],
		["infobox", "cowpox"],
		["infobox", "tools"],
		["infobox", "nigeria"],
		["infobox", "program"],
		["infobox", "lastcase"],
		["infobox", "zeroday"],
	],
	infoboxes: {
		origin: { title() { return zh("Chapter I — The Origin", "第一章 —— 起源") },
			body() { return zh(
				"Somewhere in the river valleys of the old world, a rodent poxvirus crossed into a human. It never left. For ~3,000 years it would kill roughly three in every ten it met, leave the rest scarred, and wait — in cities, in armies, in cradles. The earliest face we can put to it is the mummy of Ramses V (d. 1157 BC).",
				"在旧大陆的河谷深处，一种啮齿类痘病毒跨入了人体，从此再未离开。三千年里，它感染者十杀三四，余者留疤，在城市、军队与摇篮之间潜伏。我们能指认的最古老面孔，是拉美西斯五世的木乃伊（卒于公元前 1157 年）。") },
			unlocked() { return hasMilestone("var", 0) } },
		variolation: { title() { return zh("Chapter II — Variolation", "第二章 —— 人痘") },
			body() { return zh(
				"Ming-era China learned to give people a mild case on purpose: dry smallpox scabs blown into the nose. Roughly 2% died; untreated epidemics killed 30%. The practice walked west — through the Ottoman world to London in 1721 — and the world's first real counterattack began.",
				"明代中国学会了主动接种轻症：把干燥的天花痂皮吹入鼻腔。约 2% 的死亡率，对比自然流行的 30%。这门技艺一路西行——经奥斯曼世界于 1721 年抵达伦敦——人类第一次真正的反攻开始了。") },
			unlocked() { return hasMilestone("var", 2) } },
		cowpox: { title() { return zh("Chapter III — Cowpox", "第三章 —— 牛痘") },
			body() { return zh(
				"On 14 May 1796 Edward Jenner scratched cowpox lymph into James Phipps's arm and weeks later challenged him with smallpox. Nothing happened. Vaccination — from vacca, cow — was born, and in 1805 it reached China, where 邱熺 wrote the 《引痘略》.",
				"1796 年 5 月 14 日，爱德华·詹纳把牛痘浆划进詹姆斯·菲普斯的手臂；数周后以天花挑战，无事发生。 Vaccination（牛痘接种，源自 vacca，母牛）就此诞生。1805 年它传入中国，邱熺写下《引痘略》。") },
			unlocked() { return hasMilestone("vac", 0) } },
		tools: { title() { return zh("Chapter IV — The Tools", "第四章 —— 器械") },
			body() { return zh(
				"Two inventions made eradication feasible: Collier's freeze-dried vaccine (1948-50s) survived tropical heat, and Benjamin Rubin's bifurcated needle (1965) delivered a dose for pennies — one needle, hundreds of vaccinations, a village health worker's whole kit.",
				"两项发明使根除成为可能：Collier 的冻干疫苗（1948-50 年代）扛得住热带酷热；本杰明·鲁宾的双叉针（1965）让一剂疫苗的成本降到几分钱——一根针，几百次接种，是乡村接种员的全部行头。") },
			unlocked() { return hasMilestone("pro", 1) } },
		nigeria: { title() { return zh("Chapter V — The Nigerian Rings", "第五章 —— 尼日利亚之环") },
			body() { return zh(
				"1967, eastern Nigeria, mid-war, almost no vaccine. Bill Foege tried something heretical: instead of blanketing everyone, find each case, isolate it, and vaccinate the ring of contacts around it. The rings held. Surveillance-containment became the doctrine that would end the disease.",
				"1967 年，尼日利亚东部，战乱之中，疫苗几近于无。比尔·福格试了一个离经叛道的办法：不再全员普种，而是找到每一例、隔离之、给其接触者之环接种。环守住了。监测-围堵从此成为终结天花的教范。") },
			unlocked() { return hasMilestone("sur", 0) } },
		program: { title() { return zh("Chapter VI — 1967", "第六章 —— 一九六七") },
			body() { return zh(
				"The World Health Assembly launches the Intensified Smallpox Eradication Programme. D.A. Henderson takes charge with a tiny budget, frozen vaccine, and one promise: report every case. The USSR ships hundreds of millions of doses; the US funds the fleet. Cold-war rivals, one target.",
				"世界卫生大会启动强化根除计划。D.A. 亨德森以极少的预算、冻干疫苗与一个承诺走马上任：报告每一例病例。苏联运送数以亿计的剂量，美国出资组建车队。冷战对手，同一个目标。") },
			unlocked() { return hasMilestone("int", 0) } },
		lastcase: { title() { return zh("Chapter VII — The Last Case", "第七章 —— 最后一例") },
			body() { return zh(
				"23 October 1977: hospital cook Ali Maow Maalin of Merca, Somalia, misses his escort duty with an infected family and spends two exposed hours in their Land Cruiser. On 26 October the rash appears. Teams vaccinate 54,777 people around Merca within weeks. He recovers — and joins the search. The world never sees a natural case again.",
				"1977 年 10 月 23 日：索马里梅尔卡的医院厨师阿里·马奥·马林替班陪同感染者家庭，在陆巡车里暴露两小时。10 月 26 日，皮疹出现。数周内，队伍在梅尔卡周边为 54,777 人接种。他康复了——并加入了搜索队。世界再也没有见到一例自然天花。") },
			unlocked() { return hasMilestone("cmp", 6) } },
	zeroday: { title() { return zh("Chapter VIII — Zero Day", "第八章 —— 绝迹日") },
		body() { return zh(
			"Two years of searching found nothing. On 9 December 1979 the Global Commission signed 'smallpox is dead' in Geneva; the World Health Assembly made it official on 8 May 1980. October 25, 1979 stands as the day humanity marks the eradication — the only human disease ever deliberately erased. The remaining virus sleeps in exactly two freezers, in Atlanta and Novosibirsk.",
			"两年的搜索一无所获。1979 年 12 月 9 日，全球委员会在日内瓦签署「天花已死」；1980 年 5 月 8 日，世界卫生大会正式宣布。1979 年 10 月 25 日，被定为人类天花绝迹日——迄今唯一被人类有意抹去的人类疾病。余下的病毒沉睡在亚特兰大与新西伯利亚的两台冰柜里。") },
		unlocked() { return hasMilestone("cert", 0) } },
	},
})
