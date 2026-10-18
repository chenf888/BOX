/* =========================================================================
 *  tools/build_lang.js — generate js/lang/*.js from tools/texts.js
 *
 *  Usage:  node tools/build_lang.js
 *
 *  1. Checks every t("key") in js/mod.js + js/layers/*.js + js/lang/index.js
 *     against tools/texts.js. A missing key is a hard error.
 *  2. Emits packs_zh.js / packs_en.js.
 *  3. Parses tools/zhcn-g1.ctb (liblouis, LGPL) and emits braille_map.js,
 *     limited to the characters and phrases actually used by the zh pack.
 *  4. Emits packs_brl_zh.js / packs_brl_en.js.
 * ========================================================================= */

const fs = require("fs")
const path = require("path")

const ROOT = path.resolve(__dirname, "..")
const TEXTS = require("./texts.js")

const SRC_FILES = [
	"js/mod.js",
	"js/lang/index.js",
	"js/components.js",
	"js/technical/systemComponents.js",
	"js/utils/NumberFormating.js",
	"js/utils/save.js",
	"js/utils.js",
	"js/game.js",
	"index.html",
].concat(
	fs.readdirSync(path.join(ROOT, "js/layers"))
		.filter(f => f.endsWith(".js"))
		.map(f => "js/layers/" + f)
)

/* ------------------------------------------------------------- key check -- */

function usedKeys() {
	const keys = new Set()
	const re = /\bt\(\s*["']([^"']+)["']/g
	for (const rel of SRC_FILES) {
		const text = fs.readFileSync(path.join(ROOT, rel), "utf8")
		let m
		while ((m = re.exec(text))) keys.add(m[1])
	}
	return keys
}

const used = usedKeys()
const have = new Set(Object.keys(TEXTS))
const missing = [...used].filter(k => !have.has(k)).sort()
const unused = [...have].filter(k => !used.has(k) && !k.startsWith("tab.")).sort()

if (missing.length) {
	console.error("MISSING " + missing.length + " key(s):")
	for (const k of missing) console.error("  " + k)
	process.exit(1)
}
if (unused.length) {
	console.warn("note: " + unused.length + " text key(s) not referenced yet:")
	for (const k of unused) console.warn("  " + k)
}

/* ----------------------------------------------------------- braille map -- */

function decodeToken(tok) {
	let out = ""
	const re = /\\x([0-9A-Fa-f]{4})/g
	let m, last = 0
	while ((m = re.exec(tok))) {
		if (m.index > last) out += tok.slice(last, m.index)
		out += String.fromCharCode(parseInt(m[1], 16))
		last = re.lastIndex
	}
	out += tok.slice(last)
	return out
}

function dotsToCells(dots) {
	if (dots === "0") return String.fromCharCode(0x2800)
	return dots.split("-").map(function (group) {
		let mask = 0
		for (const ch of group) {
			const d = +ch
			if (d >= 1 && d <= 8) mask |= (1 << (d - 1))
		}
		return String.fromCharCode(0x2800 + mask)
	}).join("")
}

const chars = {}
const phrases = {}
const tablePath = path.join(__dirname, "zhcn-g1.ctb")
if (fs.existsSync(tablePath)) {
	const lines = fs.readFileSync(tablePath, "utf8").split(/\r?\n/)
	for (const raw of lines) {
		const line = raw.trim()
		if (!line || line.startsWith("#")) continue
		const parts = line.split(/\s+/)
		const type = parts[0]
		if (!/^(sign|always|punctuation|digit|lowercase|uppercase)$/.test(type)) continue
		const dots = parts[parts.length - 1]
		if (!/^[0-8]+(-[0-8]+)*$/.test(dots)) continue
		const cellText = dotsToCells(dots)
		if (type === "sign" || type === "punctuation" || type === "digit" ||
			type === "lowercase" || type === "uppercase") {
			const ch = decodeToken(parts[1])
			if (ch && chars[ch] === undefined) chars[ch] = cellText
		} else if (type === "always") {
			let phrase = ""
			for (let i = 1; i < parts.length - 1; i++) phrase += decodeToken(parts[i])
			if (phrase && phrases[phrase] === undefined) phrases[phrase] = cellText
		}
	}
}

/* Only keep the characters and phrases the zh pack actually uses. */
const zhText = Object.keys(TEXTS).map(k => TEXTS[k].zh).join("\n")
const usedChars = new Set()
for (const ch of zhText) usedChars.add(ch)
/* Fallbacks for dynamic numbers and punctuation that may appear at run time. */
for (const ch of "0123456789.,:;!?()[]{}<>+-*/=×·—…→°%「」『』，。、；：？！（）《》〈〉“”‘’ ") {
	usedChars.add(ch)
}

const outChars = {}
for (const ch of usedChars) {
	if (chars[ch] !== undefined) outChars[ch] = chars[ch]
}
const missingChars = [...usedChars].filter(ch => chars[ch] === undefined && !/[\x00-\x7F]/.test(ch))
if (missingChars.length) {
	console.warn("warning: " + missingChars.length + " Chinese char(s) have no liblouis sign:")
	console.warn("  " + missingChars.join(" "))
}

const outPhrases = {}
for (const phrase of Object.keys(phrases)) {
	if (phrase.length >= 2 && zhText.includes(phrase)) outPhrases[phrase] = phrases[phrase]
}

/* ------------------------------------------------------------ conversion -- */

const BR_EN = {
	a: "1", b: "12", c: "14", d: "145", e: "15", f: "124", g: "1245", h: "125", i: "24", j: "245",
	k: "13", l: "123", m: "134", n: "1345", o: "135", p: "1234", q: "12345", r: "1235", s: "234", t: "2345",
	u: "136", v: "1236", w: "2456", x: "1346", y: "13456", z: "1356",
	" ": "0", ".": "256", ",": "2", "?": "236", "!": "235", ":": "25", ";": "23", "-": "36",
	"'": "3", '"': "2356", "(": "2356", ")": "2356", "/": "34", "+": "235", "=": "2356", "%": "256",
	"×": "236", "·": "3", "—": "36", "–": "36", "…": "256", "⋯": "256", "→": "25", "°": "356",
}
const BR_ZH_DIGITS = { "1": "1", "2": "12", "3": "14", "4": "145", "5": "15", "6": "124", "7": "1245", "8": "125", "9": "24", "0": "245" }

function cell(dots) { return dotsToCells(dots) }

function brChar(ch, mode) {
	if (mode === "brl-zh" && BR_ZH_DIGITS[ch] !== undefined) return cell(BR_ZH_DIGITS[ch])
	const key = ch.toLowerCase()
	if (BR_EN[key] !== undefined) {
		const c = cell(BR_EN[key])
		if (mode === "brl-en" && ch !== key && /[a-z]/.test(key)) return cell("6") + c
		return c
	}
	return ch
}

function toBrailleEn(text) {
	let out = ""
	let inNum = false
	for (const ch of text) {
		if (/[0-9]/.test(ch)) {
			if (!inNum) { out += cell("3456"); inNum = true }
			out += cell(BR_EN[String.fromCharCode(97 + (+ch === 0 ? 9 : +ch - 1))])
		} else {
			inNum = false
			if (BR_EN[ch.toLowerCase()] !== undefined) out += brChar(ch, "brl-en")
			else out += ch
		}
	}
	return out
}

function toBrailleZh(text) {
	let out = ""
	let i = 0
	while (i < text.length) {
		let matched = false
		for (let len = Math.min(8, text.length - i); len >= 1; len--) {
			const sub = text.substr(i, len)
			if (outPhrases[sub]) { out += outPhrases[sub]; i += len; matched = true; break }
		}
		if (matched) continue
		const ch = text[i]
		if (outChars[ch]) { out += outChars[ch]; i++; continue }
		out += brChar(ch, "brl-zh")
		i++
	}
	return out
}

function mapOutsideTags(text, fn) {
	const parts = String(text).split(/(<[^>]*>|\{[0-9]+\})/)
	let out = ""
	for (let i = 0; i < parts.length; i++) {
		if (i % 2 === 1) out += parts[i]
		else out += fn(parts[i])
	}
	return out
}

/* ---------------------------------------------------------------- emit ---- */

function emitPack(file, header, transform) {
	const lines = []
	lines.push("/* generated by tools/build_lang.js — do not edit by hand */")
	lines.push("var LANG_PACKS = LANG_PACKS || {}")
	lines.push("LANG_PACKS[" + JSON.stringify(header) + "] = {")
	const keys = Object.keys(TEXTS).sort()
	for (const k of keys) {
		lines.push("\t" + JSON.stringify(k) + ": " + JSON.stringify(transform(TEXTS[k])) + ",")
	}
	lines.push("}")
	fs.writeFileSync(path.join(ROOT, file), lines.join("\n") + "\n", "utf8")
	console.log("wrote " + file + " (" + keys.length + " keys)")
}

emitPack("js/lang/packs_zh.js", "zh", t => t.zh)
emitPack("js/lang/packs_en.js", "en", t => t.en)
emitPack("js/lang/packs_brl_zh.js", "brl-zh", t => mapOutsideTags(t.zh, toBrailleZh))
emitPack("js/lang/packs_brl_en.js", "brl-en", t => mapOutsideTags(t.en, toBrailleEn))

/* braille_map.js */
const mapLines = []
mapLines.push("/* generated by tools/build_lang.js from tools/zhcn-g1.ctb (liblouis, LGPL-2.1+) */")
mapLines.push("var BRL_ZH_CHARS = {")
for (const ch of Object.keys(outChars).sort()) {
	mapLines.push("\t" + JSON.stringify(ch) + ": " + JSON.stringify(outChars[ch]) + ",")
}
mapLines.push("}")
mapLines.push("var BRL_ZH_PHRASES = {")
for (const ph of Object.keys(outPhrases).sort()) {
	mapLines.push("\t" + JSON.stringify(ph) + ": " + JSON.stringify(outPhrases[ph]) + ",")
}
mapLines.push("}")
fs.writeFileSync(path.join(ROOT, "js/lang/braille_map.js"), mapLines.join("\n") + "\n", "utf8")
console.log("wrote js/lang/braille_map.js (" + Object.keys(outChars).length + " chars, " + Object.keys(outPhrases).length + " phrases)")

/* NOTICE */
const notice = `# Braille data attribution

\`js/lang/braille_map.js\` is generated from the Chinese braille table
\`tools/zhcn-g1.ctb\`, which is part of **liblouis**:

- Project: https://github.com/liblouis/liblouis
- Table: \`tables/zhcn-g1.ctb\` (Chinese Current Braille System)
- Copyright (C) 2018 Sunian Loomee and the NVDA Chinese website
- License: GNU Lesser General Public License, version 2.1 or later

The table is used here only to generate a character/phrase → braille-cell map
for display. The generated map is distributed under the same LGPL-2.1-or-later
terms. The rest of this game is not derived from liblouis.

English braille uses the standard Grade-1 letter assignments (a–z, punctuation,
number sign) and is implemented directly in \`js/lang/braille.js\`.
`
fs.writeFileSync(path.join(ROOT, "js/lang/NOTICE-braille.md"), notice, "utf8")
console.log("wrote js/lang/NOTICE-braille.md")
