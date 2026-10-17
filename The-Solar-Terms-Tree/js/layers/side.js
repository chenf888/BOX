/* =========================================================================
 *  Side layers — row "side".
 *  a  成就 (15)      : the 碑 set — one per era milestone, per trial-completion class, and
 *                      per collection (九九 / 七十二候 / 二十四气). Each carries a neutral
 *                      (>=1.15) effect read by mod.js's getPointGen, so the COUNT is a
 *                      pacing constant, not just content: see design-brief D21.
 *  n  农书 (12)      : the story dashboard — one chapter per month-pair, quoting 月令.
 *  o  统计·设置      : stats, the 中/EN language toggle, and a buyable respec.
 * ========================================================================= */

/* ---- 成就 / a ------------------------------------------------------------ */
addLayer("a", {
	name: function() { return L("成就", "Achievements") },
	symbol: function() { return L("碑", "A") },
	row: "side",
	startData() { return { unlocked: true, points: new Decimal(0) } },
	color: "#FFD54F",
	resource: function() { return L("碑", "stones") },
	baseResource: function() { return L("日影", "sun-shadow") },
	layerShown() { return true },
	type: "none",
	achievements: {
		11: {
			name: function() { return L("初见日影", "First Shadow") },
			description: function() { return L("得到第一点日影。", "Gain your first sun-shadow.") },
			done() { return player.points.gte(1) },
			effect() { return new Decimal(1.15) },
			effectDisplay() { return "日影 ×" + format(this.effect()) },
		},
		12: {
			name: function() { return L("立表", "The Gnomon Stands") },
			description: function() { return L("测影连中十次。", "Ten correct shadow readings in a row.") },
			done() { return player.lc.shadowStreak >= TUNING.SHADOW_STREAK_CAP },
			effect() { return new Decimal(1.15) },
			effectDisplay() { return "日影 ×" + format(this.effect()) },
		},
		13: {
			name: function() { return L("初候既察", "The First Pentad") },
			description: function() { return L("察得第一个候。", "Observe your first pentad.") },
			done() { return houObserved() >= 1 },
			effect() { return new Decimal(1.15) },
			effectDisplay() { return "日影 ×" + format(this.effect()) },
		},
		14: {
			name: function() { return L("八节既通", "The Eight Nodes") },
			description: function() { return L("八节皆已解锁。", "All eight nodes are unlocked.") },
			done() { return player.dz.unlocked },
			effect() { return new Decimal(1.15) },
			effectDisplay() { return "日影 ×" + format(this.effect()) },
		},
		15: {
			name: function() { return L("一岁既成", "A Year Is Made") },
			description: function() { return L("完成第一次岁祭。", "Complete your first 岁祭.") },
			done() { return player.years >= 1 },
			effect() { return new Decimal(1.15) },
			effectDisplay() { return "日影 ×" + format(this.effect()) },
		},
		21: {
			name: function() { return L("九九消寒", "Eighty-One Days") },
			description: function() { return L("数尽九九。", "Count all nine nines.") },
			done() { return player.dz.nineDone >= 1 },
			effect() { return new Decimal(1.2) },
			effectDisplay() { return "日影 ×" + format(this.effect()) },
		},
		22: {
			name: function() { return L("七十二候尽", "All Seventy-Two") },
			description: function() { return L("察尽七十二候。", "Observe all 72 pentads.") },
			done() { return houObserved() >= TUNING.HOU_TOTAL },
			effect() { return new Decimal(2) },
			effectDisplay() { return "日影 ×" + format(this.effect()) },
		},
		23: {
			name: function() { return L("二十四气周", "The Twenty-Four") },
			description: function() { return L("八节试完成二十四次。", "Complete 24 trials.") },
			done() { return totalTrialCompletions() >= 24 },
			effect() { return new Decimal(2) },
			effectDisplay() { return "日影 ×" + format(this.effect()) },
		},
		31: {
			name: function() { return L("春分既至", "The Equinox") },
			description: function() { return L("抵达春分。", "Reach 春分.") },
			done() { return player.cf.best.gte(1) },
			effect() { return new Decimal(1.15) },
			effectDisplay() { return "日影 ×" + format(this.effect()) },
		},
		32: {
			name: function() { return L("夏至既至", "The Solstice") },
			description: function() { return L("抵达夏至。", "Reach 夏至.") },
			done() { return player.xz.best.gte(1) },
			effect() { return new Decimal(1.15) },
			effectDisplay() { return "日影 ×" + format(this.effect()) },
		},
		33: {
			name: function() { return L("秋分既至", "The Second Equinox") },
			description: function() { return L("抵达秋分。", "Reach 秋分.") },
			done() { return player.qf.best.gte(1) },
			effect() { return new Decimal(1.15) },
			effectDisplay() { return "日影 ×" + format(this.effect()) },
		},
		34: {
			name: function() { return L("冬至既至", "The Second Solstice") },
			description: function() { return L("抵达冬至。", "Reach 冬至.") },
			done() { return player.dz.best.gte(1) },
			effect() { return new Decimal(1.15) },
			effectDisplay() { return "日影 ×" + format(this.effect()) },
		},
		35: {
			name: function() { return L("候历既成", "The Pentad Calendar") },
			description: function() { return L("开启七十二候图。", "Open the 72-pentad chart.") },
			done() { return hasUpgrade("al", 25) },
			effect() { return new Decimal(1.15) },
			effectDisplay() { return "日影 ×" + format(this.effect()) },
		},
		36: {
			name: function() { return L("一阳来复", "The Yang Returns") },
			description: function() { return L("完成一次八节试。", "Complete one trial.") },
			done() { return totalTrialCompletions() >= 1 },
			effect() { return new Decimal(1.25) },
			effectDisplay() { return "日影 ×" + format(this.effect()) },
		},
		41: {
			name: function() { return L("岁功既成", "The Year Is Complete") },
			description: function() { return L("买下岁功成。", "Buy 岁功成.") },
			done() { return hasUpgrade("sui", 15) },
			effect() { return new Decimal(3) },
			effectDisplay() { return "日影 ×" + format(this.effect()) },
		},
	},
	tabFormat: [
		["display-text", function() { return L("碑数 <b>" + player.a.achievements.length + "</b> / " + achievementTotal() + "　（每碑皆赠日影）", "<b>" + player.a.achievements.length + "</b> / " + achievementTotal() + " stones (each one gives 日影)") }],
		"blank",
		["achievements", [1, 2, 3, 4]],
	],
})

/* ---- 农书 / n — the story dashboard (12 chapters, one per month-pair) ------ */
addLayer("n", {
	name: function() { return L("农书", "The Farming Book") },
	symbol: function() { return L("书", "N") },
	row: "side",
	startData() { return { unlocked: true, points: new Decimal(0), chapters: 0 } },
	color: "#B0BEC5",
	resource: function() { return L("章", "chapters") },
	baseResource: function() { return L("日影", "sun-shadow") },
	layerShown() { return true },
	type: "none",
	infoboxes: {
		1: {
			title: function() { return L("孟春之月", "The First Month of Spring") },
			body: function() { return L("「孟春之月，日在营室，昏参中，旦尾中。东风解冻，蛰虫始振，鱼上冰。」<br><br>——《礼记·月令》<br><br>圭表立于庭中，日影一寸一寸地挪。测出立春的那天，一年才算开始。", "\"In the first month of spring the sun is in Yingshi; at dusk Shen culminates, at dawn Wei. The east wind thaws the ice, hibernating insects stir, fish rise to the ice.\"<br><br>— The Book of Rites, Monthly Ordinances<br><br>The gnomon stands in the yard; its shadow creeps inch by inch. The day you measure 立春 is the day the year begins.") },
			unlocked() { return true },
		},
		2: {
			title: function() { return L("仲春之月", "The Second Month of Spring") },
			body: function() { return L("「仲春之月，日夜分，雷乃发声，始电，蛰虫咸动，启户始出。」<br><br>春分者，阴阳相半也。影长与夜漏相等的那一天，昼夜各半。", "\"In the second month of spring day and night are equal; thunder sounds, lightning begins, and the hibernating insects all stir and open their doors.\"<br><br>At 春分 the yin and the yang are half and half — the day the shadow equals the water-clock.") },
			unlocked() { return player.cf.unlocked },
		},
		3: {
			title: function() { return L("孟夏之月", "The First Month of Summer") },
			body: function() { return L("「孟夏之月，蝼蝈鸣，蚯蚓出，王瓜生，苦菜秀。」<br><br>立夏开渠，引水入田。雨量不满，渠不可开。", "\"In the first month of summer the mole crickets sing, earthworms emerge, snake gourds grow, sow thistles flower.\"<br><br>At 立夏 the canal is opened and water led into the fields — and the canal cannot be opened until the gauge is full.") },
			unlocked() { return player.lx.unlocked },
		},
		4: {
			title: function() { return L("仲夏之月", "The Second Month of Summer") },
			body: function() { return L("「仲夏之月，日长至，阴阳争，死生分。鹿角解，蝉始鸣，半夏生。」<br><br>夏至影最短。此后一阴生，影一日长于一日。", "\"In the second month of summer the day reaches its longest; yin and yang contend, death and life part. Deer shed their antlers, cicadas begin to sing, pinellia sprouts.\"<br><br>At 夏至 the shadow is shortest. Thereafter a single yin is born and the shadow grows longer every day.") },
			unlocked() { return player.xz.unlocked },
		},
		5: {
			title: function() { return L("孟秋之月", "The First Month of Autumn") },
			body: function() { return L("「孟秋之月，凉风至，白露降，寒蝉鸣。鹰乃祭鸟，用始行戮。」<br><br>立秋之日，凉风先至。影始长，而暑未尽。", "\"In the first month of autumn cool winds arrive, white dew falls, cicadas grow cold. Hawks lay out their prey.\"<br><br>On the day of 立秋 the cool wind comes first; the shadow begins to lengthen while the heat has not yet gone.") },
			unlocked() { return player.lq.unlocked },
		},
		6: {
			title: function() { return L("仲秋之月", "The Second Month of Autumn") },
			body: function() { return L("「仲秋之月，雷始收声，蛰虫坯户，水始涸。日夜分，则同度量，平权衡。」<br><br>秋分与春分，影长相同而气相反 —— 一者生，一者收。", "\"In the second month of autumn thunder ceases, insects seal their burrows, the waters dry. Day and night are equal: measures are unified and the scales balanced.\"<br><br>秋分 and 春分 cast the same shadow, but their qi is opposite — one opens, one closes.") },
			unlocked() { return player.qf.unlocked },
		},
		7: {
			title: function() { return L("孟冬之月", "The First Month of Winter") },
			body: function() { return L("「孟冬之月，水始冰，地始冻，雉入大水为蜃。天子始裘。」<br><br>立冬之日，水始冰。测影的手开始僵。", "\"In the first month of winter water begins to freeze, the ground begins to freeze, pheasants turn to clams. The Son of Heaven puts on furs.\"<br><br>On the day of 立冬 the water begins to freeze, and the hand that measures the shadow begins to stiffen.") },
			unlocked() { return player.ld.unlocked },
		},
		8: {
			title: function() { return L("仲冬之月", "The Second Month of Winter") },
			body: function() { return L("「仲冬之月，日短至，阴阳争，诸生荡。蚯蚓结，麋角解，水泉动。」<br><br>冬至影最长。一阳生，数九始 —— 数到九九八十一日，春天就回来了。", "\"In the second month of winter the day reaches its shortest; yin and yang contend. Earthworms knot, elks shed their antlers, the springs begin to move.\"<br><br>At 冬至 the shadow is longest. The first yang is born and the counting of nines begins — count to eighty-one days and spring is back.") },
			unlocked() { return player.dz.unlocked },
		},
		9: {
			title: function() { return L("历书", "The Almanac") },
			body: function() { return L("「乃命大史，守典奉法，司天日月星辰之行，宿离不贷，毋失经纪，以初为常。」<br><br>七十二候，就是一本写在时间里的农书。", "\"The Grand Scribe is charged to keep the records and hold to the methods, to oversee the movements of sun, moon and stars, letting no lodge or mansion go astray, and to make the beginning the constant.\"<br><br>The seventy-two pentads are a farming book written into time itself.") },
			unlocked() { return player.al.unlocked },
		},
		10: {
			title: function() { return L("一岁", "One Year") },
			body: function() { return L("三百六十五日有奇为一岁。岁复一岁，而候不异；候不异，而历愈精。<br><br>岁功既成，则圭表无影可测 —— 因为影已经测尽了。", "Three hundred and sixty-five days and a little more make a year. Year after year the pentads do not change; the pentads do not change, and the calendar grows finer.<br><br>When the year is complete there is no shadow left to measure — because every shadow has been measured.") },
			unlocked() { return player.sui.unlocked },
		},
		11: {
			title: function() { return L("岁祭", "The Ritual of the Year") },
			body: function() { return L("岁祭者，祭岁也。一岁既成，则告于天：今年之候，尽在此卷。", "The 岁祭 is the sacrifice to the year. When a year is complete it is announced to heaven: the pentads of this year are all in this scroll.") },
			unlocked() { return player.years >= 1 },
		},
		12: {
			title: function() { return L("终章", "The Last Chapter") },
			body: function() { return L("「以初为常。」<br><br>七十二候尽，二十四气周。圭表无影可测，历法无岁可推 —— 岁功成。<br><br>而明年，东风又会解冻。", "\"Make the beginning the constant.\"<br><br>Seventy-two pentads, twenty-four terms, and the circle closes. No shadow left to measure, no year left to reckon — the work of the year is done.<br><br>And next year the east wind will thaw the ice again.") },
			unlocked() { return isEndgame() },
		},
	},
	tabFormat: [
		["display-text", function() { return L("农书 —— 十二篇，随候而开。<br>已开 <b>" + nChapters() + "</b> / 12", "The Farming Book — twelve chapters, opened by the pentads.<br><b>" + nChapters() + "</b> / 12 open") }],
		"blank",
		["infobox", 1], ["infobox", 2], ["infobox", 3], ["infobox", 4],
		["infobox", 5], ["infobox", 6], ["infobox", 7], ["infobox", 8],
		["infobox", 9], ["infobox", 10], ["infobox", 11], ["infobox", 12],
	],
})
function nChapters() {
	let n = 0
	if (player.lc.unlocked) n++
	if (player.cf.unlocked) n++
	if (player.lx.unlocked) n++
	if (player.xz.unlocked) n++
	if (player.lq.unlocked) n++
	if (player.qf.unlocked) n++
	if (player.ld.unlocked) n++
	if (player.dz.unlocked) n++
	if (player.al.unlocked) n++
	if (player.sui.unlocked) n++
	if (player.years >= 1) n++
	if (isEndgame()) n++
	return n
}

/* ---- 统计·设置 / o -------------------------------------------------------- */
/* 存档搬运: the engine's own Export button is btoa(JSON.stringify(player)), and btoa
 * is Latin1-only. This game's microtab keys ARE the bilingual labels (D10), so
 * player.subtabs always holds Chinese and the engine's button throws and does nothing
 * — silently, because the error never reaches the page. These two helpers are the same
 * round trip through a UTF-8-safe codec (design-brief D22). */
function saveToText() {
	let bytes = new TextEncoder().encode(JSON.stringify(player))
	let bin = ""
	for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
	return btoa(bin)
}
function loadFromText(str) {
	let bin = atob(str)
	let bytes = new Uint8Array(bin.length)
	for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
	let obj = JSON.parse(new TextDecoder().decode(bytes))
	tempPlr = Object.assign(getStartPlayer(), obj)
	player = tempPlr
	player.versionType = getModID()
	fixSave()
	versionCheck()
	save()
	window.location.reload()
}
addLayer("o", {
	name: function() { return L("统计 · 设置", "Stats & Settings") },
	symbol: function() { return L("设", "O") },
	row: "side",
	startData() { return { unlocked: true, points: new Decimal(0) } },
	color: "#9CCC65",
	resource: function() { return L("—", "—") },
	baseResource: function() { return L("日影", "sun-shadow") },
	layerShown() { return true },
	type: "none",
	update(diff) {
		// P11 alternate path: the two backfill stones grant the first two automation
		// stones of 立春 / 春分 early, so a player who never buys them is not stuck.
		// (the !hasMilestone guard is the idempotence guard — hasMilestone IS the
		//  array-includes test, so one check covers both.)
		if (hasAchievement("a", 31) && !hasMilestone("lc", 1) && player.lc.best.gte(8)) player.lc.milestones.push(1)
		if (hasAchievement("a", 41) && !hasMilestone("cf", 1) && player.cf.best.gte(8)) player.cf.milestones.push(1)
	},
	clickables: {
		11: {
			title: function() { return zh() ? "语言：中文（点击切至 English）" : "Language: English (click for 中文)" },
			display: function() { return zh() ? "当前：<b>中文</b>" : "current: <b>English</b>" },
			canClick() { return true },
			onClick() { player.lang = zh() ? "en" : "zh" },
			style() { return { "width": "320px", "height": "60px" } },
		},
		12: {
			title: function() { return L("重置市货", "Respec markets") },
			display: function() { return L("退还所有历筹买货，重买（会强制一次修历）。", "Refund every almanac purchase and buy again (forces a 修历).") },
			canClick() { return hasMilestone("al", 0) },
			onClick() { respecBuyables("al") },
			style() { return { "width": "320px", "height": "60px" } },
		},
		13: {
			title: function() { return L("导出存档", "Export save") },
			display: function() { return L("复制存档到剪贴板（UTF-8 安全）。<br>引擎自带的导出按钮对本作会静默失败 —— 见 brief D22。", "Copy the save to the clipboard (UTF-8 safe).<br>The engine's own export button fails silently on this game — see brief D22.") },
			canClick() { return true },
			onClick() {
				let el = document.createElement("textarea")
				el.value = saveToText()
				document.body.appendChild(el)
				el.select()
				el.setSelectionRange(0, 99999)
				document.execCommand("copy")
				document.body.removeChild(el)
			},
			style() { return { "width": "320px", "height": "60px" } },
		},
		14: {
			title: function() { return L("导入存档", "Import save") },
			display: function() { return L("粘贴一段存档文本并覆盖当前进度（会重载页面）。", "Paste a save string to overwrite the current run (reloads the page).") },
			canClick() { return true },
			onClick() {
				let str = prompt(L("粘贴存档：", "Paste the save:"))
				if (!str) return
				try { loadFromText(str.trim()) }
				catch (e) { alert(L("导入失败：" + e.message, "Import failed: " + e.message)) }
			},
			style() { return { "width": "320px", "height": "60px" } },
		},
	},
	tabFormat: [
		["display-text", function() { return L("<h3>统计</h3>", "<h3>Statistics</h3>") }],
		["display-text", function() {
			return L("日影 <b>" + format(player.points) + "</b>　·　日影产 <b>" + format(tmp.pointGen) + "</b>/秒", "日影 <b>" + format(player.points) + "</b> · output <b>" + format(tmp.pointGen) + "</b>/s") +
				"<br>" + L("已历节气 <b>" + termsReached() + "</b> / 24　·　已察候 <b>" + houObserved() + "</b> / 72", "terms <b>" + termsReached() + "</b> / 24 · pentads <b>" + houObserved() + "</b> / 72") +
				"<br>" + L("连中之数 <b>" + player.lc.shadowStreak + "</b>（最高 " + player.lc.shadowBest + "）　·　开渠 <b>" + player.lx.canals + "</b> 次　·　数九 <b>" + player.dz.nine + "</b> / 81", "streak <b>" + player.lc.shadowStreak + "</b> (best " + player.lc.shadowBest + ") · canals <b>" + player.lx.canals + "</b> · nines <b>" + player.dz.nine + "</b> / 81") +
				"<br>" + L("岁祭 <b>" + player.years + "</b> 次　·　试成 <b>" + totalTrialCompletions() + "</b> / 24　·　碑 <b>" + player.a.achievements.length + "</b> / " + achievementTotal(), "rituals <b>" + player.years + "</b> · trials <b>" + totalTrialCompletions() + "</b> / 24 · stones <b>" + player.a.achievements.length + "</b> / " + achievementTotal())
		}],
		"blank",
		["display-text", function() { return L("<h3>设置</h3>", "<h3>Settings</h3>") }],
		["clickables", [1]],
		"blank",
		["display-text", function() { return L("<i>岁复一岁，可继续推历。</i>", "<i>A year is never the last one.</i>") }],
	],
})
