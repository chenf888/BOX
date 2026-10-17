// ===========================================================================
// Side layers — 成就 (5×10 codex + general), 编年 (P13 story dashboard),
// 设置 (stats, the 中/EN switch, respec, and the P11 guarded backfill).
// ===========================================================================

// ---------------------------------------------------------------------------
// 成就 a — 50 slots: 36 菊谱 varieties (from the x codex grid) + 14 general.
// P11: two general achievements backfill branch milestones (guarded).
// ---------------------------------------------------------------------------
addLayer("a", {
	name: function() { return L("成就", "Achievements") },
	symbol: "成",
	color: "#FFD54F",
	resource: function() { return L("声名", "fame") },
	row: "side",
	type: "none",
	startData() { return { unlocked: true, points: new Decimal(0) } },
	tooltip() { return L("重阳成就：菊谱三十六种与十四声名。", "Double Ninth achievements: thirty-six codex varieties and fourteen of fame.") },
	achievementPopups: true,

	// TMT only registers achievements declared under `achievements`; top-level
	// numeric keys are invisible to updateAchievements()/hasAchievement().
	achievements: {
	// 菊谱 varieties 1–36 → achievements 11–81 (grid ids 101–606, variety i = grid 100+i).
	11: { name: function() { return L("菊谱·一", "codex #1") }, done() { return player.x.grid[101] === 1 }, tooltip: L("著录菊谱第一种。", "Record codex variety one.") },
	12: { name: function() { return L("菊谱·二", "codex #2") }, done() { return player.x.grid[102] === 1 }, tooltip: L("著录菊谱第二种。", "Record codex variety two.") },
	13: { name: function() { return L("菊谱·三", "codex #3") }, done() { return player.x.grid[103] === 1 }, tooltip: L("著录菊谱第三种。", "Record codex variety three.") },
	14: { name: function() { return L("菊谱·四", "codex #4") }, done() { return player.x.grid[104] === 1 }, tooltip: L("著录菊谱第四种。", "Record codex variety four.") },
	15: { name: function() { return L("菊谱·五", "codex #5") }, done() { return player.x.grid[105] === 1 }, tooltip: L("著录菊谱第五种。", "Record codex variety five.") },
	21: { name: function() { return L("菊谱·六", "codex #6") }, done() { return player.x.grid[201] === 1 }, tooltip: L("著录菊谱第六种。", "Record codex variety six.") },
	22: { name: function() { return L("菊谱·七", "codex #7") }, done() { return player.x.grid[202] === 1 }, tooltip: L("著录菊谱第七种。", "Record codex variety seven.") },
	23: { name: function() { return L("菊谱·八", "codex #8") }, done() { return player.x.grid[203] === 1 }, tooltip: L("著录菊谱第八种。", "Record codex variety eight.") },
	24: { name: function() { return L("菊谱·九", "codex #9") }, done() { return player.x.grid[204] === 1 }, tooltip: L("著录菊谱第九种。", "Record codex variety nine.") },
	25: { name: function() { return L("菊谱·十", "codex #10") }, done() { return player.x.grid[205] === 1 }, tooltip: L("著录菊谱第十种。", "Record codex variety ten.") },
	31: { name: function() { return L("菊谱·十一", "codex #11") }, done() { return player.x.grid[301] === 1 }, tooltip: L("著录菊谱第十一种。", "Record codex variety eleven.") },
	32: { name: function() { return L("菊谱·十二", "codex #12") }, done() { return player.x.grid[302] === 1 }, tooltip: L("著录菊谱第十二种。", "Record codex variety twelve.") },
	33: { name: function() { return L("菊谱·十三", "codex #13") }, done() { return player.x.grid[303] === 1 }, tooltip: L("著录菊谱第十三种。", "Record codex variety thirteen.") },
	34: { name: function() { return L("菊谱·十四", "codex #14") }, done() { return player.x.grid[304] === 1 }, tooltip: L("著录菊谱第十四种。", "Record codex variety fourteen.") },
	35: { name: function() { return L("菊谱·十五", "codex #15") }, done() { return player.x.grid[305] === 1 }, tooltip: L("著录菊谱第十五种。", "Record codex variety fifteen.") },
	41: { name: function() { return L("菊谱·十六", "codex #16") }, done() { return player.x.grid[401] === 1 }, tooltip: L("著录菊谱第十六种。", "Record codex variety sixteen.") },
	42: { name: function() { return L("菊谱·十七", "codex #17") }, done() { return player.x.grid[402] === 1 }, tooltip: L("著录菊谱第十七种。", "Record codex variety seventeen.") },
	43: { name: function() { return L("菊谱·十八", "codex #18") }, done() { return player.x.grid[403] === 1 }, tooltip: L("著录菊谱第十八种。", "Record codex variety eighteen.") },
	44: { name: function() { return L("菊谱·十九", "codex #19") }, done() { return player.x.grid[404] === 1 }, tooltip: L("著录菊谱第十九种。", "Record codex variety nineteen.") },
	45: { name: function() { return L("菊谱·二十", "codex #20") }, done() { return player.x.grid[405] === 1 }, tooltip: L("著录菊谱第二十种。", "Record codex variety twenty.") },
	51: { name: function() { return L("菊谱·廿一", "codex #21") }, done() { return player.x.grid[501] === 1 }, tooltip: L("著录菊谱第二十一只。", "Record codex variety twenty-one.") },
	52: { name: function() { return L("菊谱·廿二", "codex #22") }, done() { return player.x.grid[502] === 1 }, tooltip: L("著录菊谱第二十二种。", "Record codex variety twenty-two.") },
	53: { name: function() { return L("菊谱·廿三", "codex #23") }, done() { return player.x.grid[503] === 1 }, tooltip: L("著录菊谱第二十三种。", "Record codex variety twenty-three.") },
	54: { name: function() { return L("菊谱·廿四", "codex #24") }, done() { return player.x.grid[504] === 1 }, tooltip: L("著录菊谱第二十四种。", "Record codex variety twenty-four.") },
	55: { name: function() { return L("菊谱·廿五", "codex #25") }, done() { return player.x.grid[505] === 1 }, tooltip: L("著录菊谱第二十五种。", "Record codex variety twenty-five.") },
	61: { name: function() { return L("菊谱·廿六", "codex #26") }, done() { return player.x.grid[601] === 1 }, tooltip: L("著录菊谱第二十六种。", "Record codex variety twenty-six.") },
	62: { name: function() { return L("菊谱·廿七", "codex #27") }, done() { return player.x.grid[602] === 1 }, tooltip: L("著录菊谱第二十七种。", "Record codex variety twenty-seven.") },
	63: { name: function() { return L("菊谱·廿八", "codex #28") }, done() { return player.x.grid[603] === 1 }, tooltip: L("著录菊谱第二十八种。", "Record codex variety twenty-eight.") },
	64: { name: function() { return L("菊谱·廿九", "codex #29") }, done() { return player.x.grid[604] === 1 }, tooltip: L("著录菊谱第二十九种。", "Record codex variety twenty-nine.") },
	65: { name: function() { return L("菊谱·三十", "codex #30") }, done() { return player.x.grid[605] === 1 }, tooltip: L("著录菊谱第三十种。", "Record codex variety thirty.") },
	71: { name: function() { return L("菊谱·三一", "codex #31") }, done() { return player.x.grid[606] === 1 }, tooltip: L("著录菊谱第三十一只。", "Record codex variety thirty-one.") },
	72: { name: function() { return L("菊谱·三二", "codex #32") }, done() { return player.x.grid[101] === 1 && player.x.grid[102] === 1 }, tooltip: L("菊谱再录：前二种俱在。", "The codex deepens: the first two recorded.") },
	73: { name: function() { return L("菊谱·三三", "codex #33") }, done() { return player.x.grid[103] === 1 && player.x.grid[104] === 1 }, tooltip: L("菊谱再录：四种俱在。", "The codex deepens: four recorded.") },
	74: { name: function() { return L("菊谱·三四", "codex #34") }, done() { return player.x.grid[105] === 1 && player.x.grid[106] === 1 }, tooltip: L("菊谱再录：六种俱在。", "The codex deepens: six recorded.") },
	75: { name: function() { return L("菊谱·三五", "codex #35") }, done() { return player.x.grid[201] === 1 && player.x.grid[202] === 1 && player.x.grid[203] === 1 }, tooltip: L("菊谱再录：九种俱在。", "The codex deepens: nine recorded.") },
	81: { name: function() { return L("菊谱·三十六", "codex #36") }, done() { return tmp.x.codexRevealed >= 30 }, tooltip: L("菊谱大成：三十种以上著录。", "The codex grand: thirty or more recorded.") },
	// two unrecorded slots (flavour: the mountain still hides some varieties)
	82: { name: function() { return L("菊谱·未著", "unrecorded") }, done() { return false }, tooltip: L("山中另有其菊，尚未著录。", "Other chrysanthems remain unrecorded in the mountain.") },
	83: { name: function() { return L("菊谱·未著", "unrecorded") }, done() { return false }, tooltip: L("山中另有其菊，尚未著录。", "Other chrysanthems remain unrecorded in the mountain.") },
	// the master badge
	84: {
		name: function() { return L("菊谱全录", "The Complete Codex") },
		done() { return tmp.x.codexRevealed >= 36 },
		tooltip: L("三十六种菊谱全录。<br>奖赏：山道里程 ×5、菊珠滴落 ×3。",
			"All thirty-six varieties recorded.<br>Reward: path gain ×5, jade drip ×3."),
		effect() { return new Decimal(5) },
	},
	// fourteen general (rows 9–10): two of them backfill branch milestones (P11).
	91: {
		name: function() { return L("登程初露", "First Journey") },
		done() { return player.p.total.gte(1) },
		tooltip: L("首次登高重整。<br>奖赏：山道里程 ×2。", "Your first climb.<br>Reward: path gain ×2."),
		effect() { return new Decimal(2) },
	},
	92: {
		name: function() { return L("菊田丰岁", "Bountiful Field") },
		done() { return hasMilestone("k", 3) },
		tooltip: L("菊田全阶自动化。<br>奖赏：酒坊自生里程碑（自动开启）。", "The field fully automated.<br>Reward: the cellar's self-yield milestone."),
	},
	93: {
		name: function() { return L("酒坊开仓", "Cellar Unlocked") },
		done() { return hasMilestone("j", 3) },
		tooltip: L("酒坊全阶自动化。<br>奖赏：菊展自生里程碑（自动开启）。", "The cellar fully automated.<br>Reward: the exhibition's self-yield milestone."),
	},
	94: {
		name: function() { return L("茱萸满枝", "Full of Charms") },
		done() { return hasMilestone("d", 3) },
		tooltip: L("茱萸全阶自动化。<br>奖赏：酒坊购阶里程碑（自动开启）。", "The charm fully automated.<br>Reward: the cellar's auto-buy milestone."),
	},
	95: {
		name: function() { return L("菊展初开", "First Exhibition") },
		done() { return hasMilestone("x", 3) },
		tooltip: L("菊展全阶自动化。", "The exhibition fully automated."),
	},
	101: {
		name: function() { return L("糕满九层", "Nine Layers of Cake") },
		done() { return player.g.points.gte(9) },
		tooltip: L("重阳糕满九重。", "The cake reaches its nine layers."),
	},
	102: {
		name: function() { return L("诗成九章", "Nine Poems Complete") },
		done() { return hasMilestone("s", 4) },
		tooltip: L("九诗之目俱足。", "The nine poems stand complete."),
	},
	103: {
		name: function() { return L("市声如云", "Market Noise Like Clouds") },
		done() { return hasMilestone("m", 3) },
		tooltip: L("重阳市集重开。", "The Double Ninth market in full swing."),
	},
	104: {
		name: function() { return L("敬山十礼", "Ten Mountain Rites") },
		done() { return hasMilestone("f", 9) },
		tooltip: L("绝顶九序之礼俱周。", "The summit's nine-fold order is complete."),
	},
	105: {
		name: function() { return L("长命百岁", "A Hundred Years") },
		done() { return hasUpgrade("y", 45) },
		tooltip: L("九重云阶之上，为长者祝寿。", "Above the ninth tier, a hundred years are wished for the elders."),
	},
	},

	// helper: how many codex varieties are recorded (value function, tmp-cached)
	codexCount() {
		let n = 0
		for (let r = 1; r <= 6; r++)
			for (let c = 1; c <= 6; c++)
				if (player.x.grid[100 * r + c] === 1) n++
		return n
	},
})

// ---------------------------------------------------------------------------
// 编年 t — P13 story dashboard: ten chapters, unlock-gated on the main tree.
// ---------------------------------------------------------------------------
addLayer("t", {
	name: function() { return L("编年", "Chronicle") },
	symbol: "编",
	color: "#B0BEC5",
	row: "side",
	type: "none",
	startData() { return { unlocked: true, points: new Decimal(0) } },
	tooltip() { return L("重阳编年：十章随山色开卷。", "The Double Ninth chronicle: ten chapters open with the mountain.") },

	infoboxes: {
		"ch1": {
			title: function() { return L("序 · 重阳", "Prologue · The Double Ninth") },
			body: function() { return L("九月九日，山色如金。古人于此日登高、佩茱萸、饮菊花酒、食重阳糕——以「九」字相叠，取长久之意。<br>这一年的山，名为「重阳山」：山脚是石径，山腰是菊田与酒坊，山脊有糕坊、诗阁与市集，绝顶之上，九座云阶。",
				"On the ninth day of the ninth month the mountain turns gold. The old ways of the day: climb high, wear the dogwood charm, drink chrysanthemum wine, eat the nine-layer cake — the nine doubled, for long-life.<br>This year the mountain is called the Double Ninth: stone path at the foot, chrysanthem field and cellar on the slope, cake workshop, verse pavilion and market on the ridge, and nine cloud tiers above the summit.") },
			unlocked() { return true },
		},
		"ch2": {
			title: function() { return L("一 · 登高", "I · The Climb") },
			body: function() { return L("石径初开，「攀一步」的石子被踩得发热。登程之令既出，山风也把回声送得更远了些。", "The stone path opens; the pebbles of 攀一步 grow warm underfoot. Once the journey-merits issue, the mountain wind carries the echoes farther.") },
			unlocked() { return hasMilestone("p", 2) },
		},
		"ch3": {
			title: function() { return L("二 · 采菊", "II · The Picking") },
			body: function() { return L("「采菊东篱下」——菊田的篱笆还矮，晨露已足。落英成珠的日子，菊珠开始在田里滴滴答答。", "「Picking chrysanthems by the east fence」— the field's fence is still low, the morning dew is full. When petals turn to jade, the jade begins its drip.") },
			unlocked() { return hasMilestone("k", 2) },
		},
		"ch4": {
			title: function() { return L("三 · 酿酒", "III · The Brew") },
			body: function() { return L("九日酿，取重阳之九。一酿未满，二酿将起——酒坊的陶瓮排到山脊，醇藏渐深，颜色渐渐有了秋天。", "The nine-day brew takes the nine of Double Ninth. One brew not finished, the second already rising — the cellar's jars reach the ridge, and the aged wine takes on the colour of autumn.") },
			unlocked() { return hasMilestone("j", 2) },
		},
		"ch5": {
			title: function() { return L("四 · 佩茱萸", "IV · The Charm") },
			body: function() { return L("「遍插茱萸少一人」——佩在襟上的茱佩越攒越厚，护身的山气也越积越浓。攀一步的时候，风似乎小了些。", "「Wearing the dogwood, one short of the whole」— the charms at the breast gather thicker, the guarding mountain-air denser. When you take a step, the wind seems gentler.") },
			unlocked() { return hasMilestone("d", 2) },
		},
		"ch6": {
			title: function() { return L("五 · 观展", "V · The Exhibition") },
			body: function() { return L("菊展开张，金菊、枯菊、菊珠三案并列。识珠的人说：珠里或藏一种没著录过的菊。三十六种菊谱，至此有了开头。", "The exhibition opens: golden, withered, and jade chrysanthems in three stalls. The jade-eyed say a jade may hide an unrecorded variety. The codex of thirty-six begins here.") },
			unlocked() { return hasMilestone("x", 2) },
		},
		"ch7": {
			title: function() { return L("六 · 制糕", "VI · The Cake") },
			body: function() { return L("重阳糕九层，层层都是日子。糕坊的规矩最硬：恰九层，不多一纹。满九层的香气，诗阁的窗最先闻见。", "The Double Ninth cake has nine layers, each one a day. The workshop's rule is the hard one: exactly nine, not a thread more. The scent of a full nine reaches the verse pavilion's window first.") },
			unlocked() { return hasMilestone("g", 2) },
		},
		"ch8": {
			title: function() { return L("七 · 登高诗", "VII · The Ascent Poems") },
			body: function() { return L("「遥怜弟兄会登高」——诗阁挂出九诗之目，敬诗礼一响，醇藏的十进制位就成了诗境的骨。", "「From afar, pining as the brothers climb」— the pavilion hangs the nine poems; when the verse rite sounds, the wine's decades become the realms' bones.") },
			unlocked() { return hasMilestone("s", 3) },
		},
		"ch9": {
			title: function() { return L("八 · 市声", "VIII · The Market") },
			body: function() { return L("重阳市集的重头戏是三样：菊坛、诗笺、茱萸穗，都以菊珠计价。市价公道，市声如云。", "The market's three stalls: the chrysanthem altar, the verse slips, the charm sprays — all priced in jade. Fair prices, noise like clouds.") },
			unlocked() { return hasMilestone("m", 3) },
		},
		"ch10": {
			title: function() { return L("九 · 敬山", "IX · The Mountain Rite") },
			body: function() { return L("绝顶上，四峰试炼计着分，九山礼一捧一捧地厚。上第一重云阶的人说：山色依旧，可走的路还长。", "At the summit the four trials keep score and the tributes grow heap on heap. The one who takes the first cloud tier says: the mountain stands as it was, and the road is still long.") },
			unlocked() { return hasMilestone("y", 0) },
		},
	},

	tabFormat: [
		["display-text", function() {
			return L("重阳编年 · 已开卷 " + tmp.t.chaptersOpen + " / 10", "Double Ninth chronicle · " + tmp.t.chaptersOpen + " / 10 chapters open")
		}],
		["infobox", "ch1"],
		["infobox", "ch2"],
		["infobox", "ch3"],
		["infobox", "ch4"],
		["infobox", "ch5"],
		["infobox", "ch6"],
		["infobox", "ch7"],
		["infobox", "ch8"],
		["infobox", "ch9"],
		["infobox", "ch10"],
	],

	chaptersOpen() {
		let n = 1
		let gates = [
			function() { return hasMilestone("p", 2) },
			function() { return hasMilestone("k", 2) },
			function() { return hasMilestone("j", 2) },
			function() { return hasMilestone("d", 2) },
			function() { return hasMilestone("x", 2) },
			function() { return hasMilestone("g", 2) },
			function() { return hasMilestone("s", 3) },
			function() { return hasMilestone("m", 3) },
			function() { return hasMilestone("y", 0) },
		]
		for (let i = 0; i < gates.length; i++)
			if (gates[i]()) n++
		return n
	},
})

// ---------------------------------------------------------------------------
// 设置 o — stats, the 中/EN switch, respec, and the P11 guarded backfill.
// ---------------------------------------------------------------------------
addLayer("o", {
	name: function() { return L("设置", "Settings") },
	symbol: "设",
	color: "#9CCC65",
	row: "side",
	type: "none",
	startData() { return { unlocked: true, points: new Decimal(0) } },
	tooltip() { return L("统计、语言、与重购。", "Stats, language, and respec.") },

	// P11: achievement backfill — each push guarded against duplicates.
	update(diff) {
		if (hasAchievement("a", 92) && !hasMilestone("j", 1)) player.j.milestones.push(1)
		if (hasAchievement("a", 93) && !hasMilestone("x", 1)) player.x.milestones.push(1)
		if (hasAchievement("a", 94) && !hasMilestone("j", 3)) player.j.milestones.push(3)
	},

	clickables: {
		11: {
			title: function() { return L("文辞", "Language") },
			display() { return window.chinesemode ? "现用：中（点按切英文）" : "now: EN (click for 中)" },
			canClick() { return true },
			onClick() {
				window.chinesemode = !window.chinesemode
			},
			style() { return {'background-color': '#9CCC65', 'color': '#10240c'} },
		},
		12: {
			title: function() { return L("重购酿具", "Respec the Cellar") },
			display() { return L("退还酒坊已购酿具之资，重整酒坊。", "Refund the cellar's bought brewing gear and re-stake the cellar.") },
			canClick() { return player.j.unlocked && player.j.spentOnBuyables.gt(0) },
			onClick() {
				respecBuyables("j")
			},
		},
	},

	tabFormat: [
		["display-text", function() {
			return L("游玩时长：" + formatTime(player.timePlayed) +
				"<br>山道里程 " + format(player.points) + " · 菊珠 " + format(player.x.jade) + " · 诗境 " + format(player.s.points) + " · 九山礼 " + format(player.f.points),
				"time played: " + formatTime(player.timePlayed) +
				"<br>path " + format(player.points) + " · jade " + format(player.x.jade) + " · realms " + format(player.s.points) + " · tributes " + format(player.f.points))
		}],
		["clickables", [1]],
	],
})
