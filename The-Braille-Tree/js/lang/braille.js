/* =========================================================================
 *  js/lang/braille.js — Braille rendering helpers
 *
 *  Two modes:
 *    brl-en  Grade-1 English braille (capital sign + number sign)
 *    brl-zh  Mainland Chinese Braille, using the character/phrase map generated
 *            from liblouis `zhcn-g1.ctb` by tools/build_lang.js
 *
 *  HTML tags and {n} placeholders are always passed through untouched: the
 *  packs are pre-converted at build time, and this file only handles dynamic
 *  fragments (numbers, resource names) inserted at run time.
 * ========================================================================= */

/* global BRL_ZH_CHARS, BRL_ZH_PHRASES */

var BRL_ZH_CHARS = (typeof BRL_ZH_CHARS !== "undefined" && BRL_ZH_CHARS) ? BRL_ZH_CHARS : {}
var BRL_ZH_PHRASES = (typeof BRL_ZH_PHRASES !== "undefined" && BRL_ZH_PHRASES) ? BRL_ZH_PHRASES : {}

function brailleCell(dots) {
	var mask = 0
	for (var i = 0; i < dots.length; i++) {
		var d = +dots[i]
		if (d >= 1 && d <= 8) mask |= (1 << (d - 1))
	}
	return String.fromCharCode(0x2800 + mask)
}

var BR_EN = {
	a: "1", b: "12", c: "14", d: "145", e: "15", f: "124", g: "1245", h: "125", i: "24", j: "245",
	k: "13", l: "123", m: "134", n: "1345", o: "135", p: "1234", q: "12345", r: "1235", s: "234", t: "2345",
	u: "136", v: "1236", w: "2456", x: "1346", y: "13456", z: "1356",
	" ": "0", ".": "256", ",": "2", "?": "236", "!": "235", ":": "25", ";": "23", "-": "36",
	"'": "3", '"': "2356", "(": "2356", ")": "2356", "/": "34", "+": "235", "=": "2356", "%": "256",
	"×": "236", "·": "3", "—": "36", "–": "36", "…": "256", "⋯": "256", "→": "25", "°": "356",
}

var BR_ZH_DIGITS = { "1": "1", "2": "12", "3": "14", "4": "145", "5": "15", "6": "124", "7": "1245", "8": "125", "9": "24", "0": "245" }

function brChar(ch, mode) {
	if (mode === "brl-zh") {
		if (BR_ZH_DIGITS[ch] !== undefined) return brailleCell(BR_ZH_DIGITS[ch])
	}
	var key = ch.toLowerCase()
	if (BR_EN[key] !== undefined) {
		var cell = brailleCell(BR_EN[key])
		if (mode === "brl-en" && ch !== key && /[a-z]/.test(key)) return brailleCell("6") + cell
		return cell
	}
	return ch
}

function toBrailleEn(text) {
	// Reuse brailleNumber: it inserts one number sign per digit run and maps
	// digits to a–j, so static pack text like "6" or "1,000" is real braille.
	return brailleNumber(text, "brl-en")
}

function toBrailleZh(text) {
	var out = ""
	var i = 0
	while (i < text.length) {
		var matched = false
		for (var len = Math.min(8, text.length - i); len >= 1; len--) {
			var sub = text.substr(i, len)
			if (BRL_ZH_PHRASES[sub]) { out += BRL_ZH_PHRASES[sub]; i += len; matched = true; break }
		}
		if (matched) continue
		var ch = text[i]
		if (BRL_ZH_CHARS[ch]) { out += BRL_ZH_CHARS[ch]; i++; continue }
		out += brChar(ch, "brl-zh")
		i++
	}
	return out
}

/** Convert text outside HTML tags and {n} placeholders. */
function mapOutsideTags(text, fn) {
	var parts = String(text).split(/(<[^>]*>|\{[0-9]+\})/)
	var out = ""
	for (var i = 0; i < parts.length; i++) {
		if (i % 2 === 1) out += parts[i]
		else out += fn(parts[i])
	}
	return out
}

function brailleize(text, mode) {
	if (mode === "brl-zh") return mapOutsideTags(text, toBrailleZh)
	if (mode === "brl-en") return mapOutsideTags(text, toBrailleEn)
	return String(text)
}

/** Braille a number/format() string for the current mode. */
function brailleNumber(text, mode) {
	if (mode === "brl-zh") {
		var out = ""
		for (var i = 0; i < text.length; i++) {
			var ch = text[i]
			if (BR_ZH_DIGITS[ch] !== undefined) out += brailleCell(BR_ZH_DIGITS[ch])
			else out += brChar(ch, mode)
		}
		return out
	}
	if (mode === "brl-en") {
		var out2 = ""
		var inNum = false
		for (var j = 0; j < text.length; j++) {
			var c = text[j]
			if (/[0-9]/.test(c)) {
				if (!inNum) { out2 += brailleCell("3456"); inNum = true }
				out2 += brailleCell(BR_EN[String.fromCharCode(97 + (+c === 0 ? 9 : +c - 1))])
			} else {
				inNum = false
				out2 += brChar(c, mode)
			}
		}
		return out2
	}
	return String(text)
}
