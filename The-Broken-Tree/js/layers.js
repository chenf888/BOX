// Control room + control group. Catalog verdicts are filled in after live testing.

addLayer("p", {
	name: "Control Group",
	symbol: "P",
	position: 0,
	startData() { return { unlocked: true, points: new Decimal(0) } },
	color: "#4BCC55",
	resource: "control points",
	row: 0,
	baseResource: "points",
	baseAmount() { return player.points },
	requires: new Decimal(10),
	type: "normal",
	exponent: 0.5,
	upgrades: {
		11: {
			title: "Sanity Anchor",
			description: "Unlocks the Number Zoo wing (n). The last correctly-wired unlock you will ever see.",
			cost: new Decimal(1),
			onPurchase() { player.n.unlocked = true },
		},
		12: {
			title: "Gain Exploder Permit",
			description: "Unlocks the Gain Exploders wing (g).",
			cost: new Decimal(10),
			onPurchase() { player.g.unlocked = true },
		},
		13: {
			title: "Render Ruins Pass",
			description: "Unlocks the Render Ruins wing (r), the ghost exhibit and the wall exhibit.",
			cost: new Decimal(100),
			onPurchase() { player.r.unlocked = true; player.gh.unlocked = true },
		},
	},
	// Museum mode: this layer is reset by every higher-row prestige, but its upgrades are the keys
	// to the building, so the default layerDataReset (which wipes upgrades) is bypassed.
	doReset(resettingLayer) {
	},
})

addLayer("m", {
	name: "Museum",
	symbol: "M",
	position: 0,
	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
			arm: {},
			observed: {},
			panicCount: 0,
		}
	},
	color: "#C0C0C0",
	resource: "visitors",
	row: 3,
	layerShown() { return true },
	type: "none",
	branch: ["c"],
	update() {
		// fuse expiry sweep: run one-shot cleanup, then drop the spent fuse key
		for (let id in player.m.arm) {
			if (Date.now() >= player.m.arm[id]) {
				if (EXHIBIT_CLEANUP[id]) EXHIBIT_CLEANUP[id]()
				delete player.m.arm[id]
			}
		}
	},
	tabFormat: [
		["infobox", "intro"],
		["infobox", "engine"],
		["raw-html", function () {
			let seen = Object.keys(player.m.observed).length
			let active = 0
			for (let id in player.m.arm) if (Date.now() < player.m.arm[id]) active++
			return "<h3>Detonation panel — observed " + seen + "/" + EXHIBITS.length +
				", currently burning: " + active + ", panics used: " + player.m.panicCount + "</h3>" +
				"<div style='opacity:0.8'>Every fuse is a timestamp: pathology only lives while <code>Date.now() &lt; armedUntil</code>, so it cannot survive its fuse or a page reload. Lethal exhibits will freeze the game within one tick — that is the finding. Refresh to recover; the save is protected.</div><br>"
		}],
		["raw-html", buildMuseumPanel],
		["raw-html", catalogHtml],
	],
	infoboxes: {
		intro: {
			title: "The Broken Tree — a stress-test museum",
			body() {
				return "This is not a balanced game. It is a playable exhibit hall where every known TMT anti-pattern and several untested edges are wired to a detonator. " +
					"Arm an exhibit, watch the engine's actual behavior, and read the catalog below. Verdicts: " +
					"<b style='color:#7CFC00'>🟢 survived</b>, <b style='color:#FFD700'>🟡 degraded</b>, <b style='color:#FF5050'>🔴 session death (refresh heals)</b>."
			},
		},
		engine: {
			title: "Engine notes (mechanisms this museum exploits)",
			body() {
				return "<b>Tripwire</b>: NaNcheck walks the whole player object every tick; one NaN anywhere → alert + clearInterval(gameLoop). The interval variable is never rebuilt, so the session is over. save() runs the same check first and aborts, so NaN can never enter localStorage.<br>" +
					"<b>Ticking latch</b>: the game loop sets ticking=true, and only clears it at the very end. Any uncaught exception (even one tick) leaves the latch stuck → silent permanent freeze, no alert.<br>" +
					"<b>Stock bug A</b>: importSave calls NaNcheck(save) — iterating a function object, always a no-op. Imported saves were never NaN-checked (save() happens to re-check, so it is moot).<br>" +
					"<b>Stock bug B</b>: onbeforeunload checks player.autosave, which never exists (it lives in options) — the unload save has never fired in stock v2.7."
			},
		},
	},
})

// Observed results recorded after live browser testing (2026-10-02 session; see REPORT.md).
var CATALOG_VERDICTS = {
	Z1: { verdict: "🔴 session death", observed: "Tripwire fired ≤50ms: stock alert \"Invalid value found in player, named 'points'\", clearInterval(gameLoop) — never rebuilt. Header displayed \"NaN\". save() aborted first, so NaN never reached localStorage; refresh healed everything." },
	Z2: { verdict: "🔴 session death", observed: "Infinity is display-stable (header \"Infinity\", gte(10)=true, ticks ran) — but the passive dependency chain did the killing: g's resetGain = (inf/50)^0.5 → NaN → g.points := NaN → tripwire within one tick. No manual prestige needed." },
	Z3: { verdict: "🟡 degraded", observed: "Specimens held -100 indefinitely (no passiveGen → no max(0) clamp on this layer). Sqrt Lens displayed \"NaN\" via format(); only the harmless player.hasNaN flag was set. Loop stayed alive — display-path NaN is safe." },
	Z4: { verdict: "🟢 survived (surprise)", observed: "Parse NaN has shape sign=1,layer=3,mag=NaN and engine arithmetic LAUNDERS it: points.add(gen×diff).max(0) returned the finite operand within one tick, so fixNaNs never saw a NaN. The tick order immunizes the game against parse-injection; only the all-NaN 0/0 shape persists." },
	Z5: { verdict: "🟢 survived", observed: "10^-1,000,000,000 stored and displayed verbatim — well inside break_eternity range." },
	Z6: { verdict: "🟡 degraded", observed: "Infinity/Infinity produced a layer-4, mag=-Infinity artifact whose toString is \"eeee-Infinity\". Displayed as garbage text, no crash." },
	G1: { verdict: "🟡 degraded (runaway)", observed: "boom: 100 → e8,174,249 in 1.5s, then saturated around e2e31 (layer-2 numbers). break_eternity and format() handled layer-2 throughout; loop alive; sticky until PANIC. The Σ≥1 explosion is real but asymptotic, not instant-Infinity." },
	G2: { verdict: "🟡 degraded", observed: "gainMult read exactly ×1.00e15 while armed. No engine guard whatsoever." },
	G3: { verdict: "🟡 degraded", observed: "requires collapsed to the 1.00 floor at 1e8 points; canReset permanently true; ten free prestiges banked. The inverted ladder was visible (requires 73 → 80 as points fell)." },
	G4: { verdict: "🟡 degraded (surprise)", observed: "TWO findings. (1) Decimal(3) silently WORKS — this break_eternity's valueOf() returns a string, so diff*pg coerced fine and just tripled the rate (corrects the old \"Decimal → NaN\" claim). (2) A layer-1 Decimal(\"ee9\") overflowed the string coercion → boom := Infinity, silently, NO tripwire (Infinity ≠ NaN); the Infinity then evaporated to 0 across a reload." },
	G5: { verdict: "🟡 degraded", observed: "new Decimal(true) evaluated to 0.00 in the lens — the boolean passiveGeneration idiom silently zeroes in any Decimal context." },
	G6: { verdict: "🟡 degraded", observed: "exponent 1.2 resolved in tmp; spaced prestige gains were self-amplifying (895k → 903k per reset at demo scale). Needs scale to explode, mechanism sound." },
	R1: { verdict: "🟡 degraded", observed: "The ghost tab rendered the back button and NOTHING else — one real upgrade permanently invisible, zero console errors. C-CONTENT1ELEM reproduced exactly as static_checks predicts." },
	R2: { verdict: "🟡 degraded", observed: "All 1200 brick buttons rendered (screenshot evidence); ~1.6s probe latency during the render burst; the wall node appeared on the tree and vanished with the fuse. No crash, no latch." },
	R3: { verdict: "🟡 degraded", observed: "The unknown component inserted a silent empty <this_component_does_not_exist> element. Zero errors, zero warnings in production Vue — completely silent no-op." },
	R4: { verdict: "🟡 degraded", observed: "370 characters of stars/RTL/emoji resolved through name() into tmp and the tree label; engine unimpressed; healed cleanly after the fuse." },
	R5: { verdict: "🟢 survived", observed: "Six nested microtab families rendered and navigated fine — depth is not a problem (control specimen)." },
	R6: { verdict: "🟡 degraded (real sinks)", observed: "BOTH injection channels executed: window.__BT_XSS (upgrade description) and window.__BT_XSS2 (infobox v-html) were set; two broken <img src=x> elements landed in the DOM. Upgrade text and infobox bodies are live HTML sinks." },
	S1: { verdict: "🔴 session death", observed: "One Uncaught RangeError (NaNcheck recursed into the self-referencing object) → the interval's ticking latch stuck true → silent permanent freeze within 50ms, no alert, error log never grew again. Refresh healed; save untouched." },
	S2: { verdict: "🟡 degraded", observed: "The 5MB assumption was wrong here: a 20MB string saved fine (26.7MB base64); 60MB threw QuotaExceededError on every save attempt while the game kept running; healed save intact. Chromium-family cap ≈25–30MB." },
	S3: { verdict: "🟡 degraded (data loss)", observed: "Infinity serialized to \"Infinity\" in the save JSON and revived as 0 after reload — silent evaporation, no error. Confirmed on both points (Z2) and a layer currency (G4's boom)." },
	S4: { verdict: "🟢 survived", observed: "The function survived in memory, was silently dropped by JSON.stringify (absent from the save) and came back as null after reload. Harmless." },
	T1: { verdict: "🟡 degraded", observed: "timePlayed := -1,000,000 persisted (NaNcheck only hunts NaN); Log Lens displayed NaN through the safe display path; loop alive throughout." },
	T2: { verdict: "🟡 degraded", observed: "One tick carried diff ≈ 3.6e7 s (offlineLimit and maxTickLength are both mod-owned valves); points jumped to 3.65e30 in that tick and the ×points^0.6 zone kept compounding — big finite numbers, format fine, PANIC-able." },
	T3: { verdict: "🟡 degraded", observed: "Base points pinned at 0.00 while the storm ran (doReset(\"p\") every tick); p.points climbed to 815 in 2.5s. Self-cannibalizing automation demonstrated." },
	C1: { verdict: "🟡 degraded", observed: "RangeError: Maximum call stack size exceeded — and the recursion had bought 2,703 levels on the way down (cost 0). Click-context throw, loop survived; after the fuse a click bought exactly one level (5410 → 5411)." },
	C2: { verdict: "🟢 survived (mechanism works)", observed: "Stock auto-completion kicked in at the goal (1.92e9 paradox) and auto-exited; completions counter incremented and the exponent self-fed 0.5 → 0.58. Each completion makes the next cheaper — a controlled explosion dial." },
	C3: { verdict: "🟡 degraded", observed: "c-21 bought cleanly; the Vault never appeared (layerShown false, unlocked false). c-22 flipped both instantly. N-UNLOCKDEAD reproduced live, with its documented cure." },
}

function catalogHtml() {
	let out = "<h3>Specimen catalog</h3>"
	let wings = {}
	for (let EX of EXHIBITS) {
		if (!wings[EX.wing]) wings[EX.wing] = []
		wings[EX.wing].push(EX)
	}
	let wingNames = { n: "Number Zoo (break_eternity)", g: "Gain Exploders (formulas)", r: "Render Ruins (UI)", gh: "Ghost exhibit", wall: "Wall exhibit", s: "Save Saboteur", t: "Time Twister", c: "Challenge Chaos" }
	for (let wing in wings) {
		out += "<h4>" + (wingNames[wing] || wing) + "</h4>"
		for (let EX of wings[wing]) {
			let v = (CATALOG_VERDICTS[EX.id] || {})
			let verdict = v.verdict || ""
			let color = verdict.startsWith("🟢") ? "#7CFC00" : (verdict.startsWith("🟡") ? "#FFD700" : (verdict.startsWith("🔴") ? "#FF5050" : "#AAAAAA"))
			out += "<div style='border:1px solid #555; padding:6px; margin:4px 0'>" +
				"<b>[" + EX.id + "] " + EX.label + "</b> — " + EX.mech + "<br>" +
				"<span style='opacity:0.85'>Observed: " + (v.observed || "pending") + "</span> " +
				"<b style='color:" + color + "'>" + verdict + "</b></div>"
		}
	}
	return out
}
