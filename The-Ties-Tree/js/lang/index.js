/* =========================================================================
 *  交情 / Ties — the polyglot string layer
 *  -------------------------------------------------------------------------
 *  Every sentence in this game exists in exactly ONE language, and there is
 *  one different language per sentence: 370 sentences, 370 languages. Reading
 *  the game is like overhearing a room where everybody speaks at once.
 *
 *  Re-shuffling rotates which sentence sits in which language, so the mix
 *  changes while the one-sentence-one-language rule always holds.
 *
 *  A settings dropdown switches the entire game into a single language
 *  (简体中文 / 繁體中文 / English), which is why those three are complete
 *  packs rather than single sentences.
 *
 *  Loaded from index.html BEFORE js/mod.js — mod.js and every layer file call
 *  t() at addLayer() time.
 * ========================================================================= */

/* global LANG_PHRASES, LANG_PACKS */

var LANG_PHRASES = LANG_PHRASES || [];
var LANG_PACKS = LANG_PACKS || {};

// Complete packs, i.e. modes the settings dropdown can switch the whole game to.
var LANG_MODES = [
	{ code: "mixed", label: "🌐 Polyglot · 混合语言" },
	{ code: "zh", label: "🇨🇳 简体中文" },
	{ code: "zh-Hant", label: "🇹🇼 繁體中文" },
	{ code: "en", label: "🇬🇧 English" },
];

// key -> index into LANG_PHRASES
var LANG_INDEX = {};
for (var _i = 0; _i < LANG_PHRASES.length; _i++) LANG_INDEX[LANG_PHRASES[_i][0]] = _i;

var LANG_STORE = "ties-ycsj8e";
var LANG_PREF = "mixed";
var LANG_OFFSET = 0;

(function initLang() {
	try {
		LANG_PREF = localStorage.getItem(LANG_STORE + ".lang") || "mixed";
		LANG_OFFSET = parseInt(localStorage.getItem(LANG_STORE + ".offset") || "0", 10) || 0;
		if (LANG_OFFSET < 0) LANG_OFFSET = 0;
	} catch (e) {
		LANG_PREF = "mixed";
		LANG_OFFSET = 0;
	}
})();

/**
 * The one function every user-facing string in the game goes through.
 * @param key      canonical string id, e.g. "chat.up11.t"
 * @param fallback literal text if the id is unknown
 */
function t(key, fallback) {
	if (LANG_PREF !== "mixed") {
		var pack = LANG_PACKS[LANG_PREF];
		if (pack && typeof pack[key] === "string") return pack[key];
	}
	var i = LANG_INDEX[key];
	if (i !== undefined) {
		var row = LANG_PHRASES[(i + LANG_OFFSET) % LANG_PHRASES.length];
		return row[2];
	}
	if (LANG_PACKS.en && typeof LANG_PACKS.en[key] === "string") return LANG_PACKS.en[key];
	return fallback !== undefined ? fallback : key;
}

/** Which language is this one sentence written in right now? */
function tLang(key) {
	var i = LANG_INDEX[key];
	if (i === undefined) return "";
	return LANG_PHRASES[(i + LANG_OFFSET) % LANG_PHRASES.length][3];
}

/* ---- settings actions -------------------------------------------------- */

function setGameLang(code) {
	LANG_PREF = code;
	try { localStorage.setItem(LANG_STORE + ".lang", code); } catch (e) { /* ignore */ }
	if (typeof options !== "undefined" && options) options.lang = code;
	if (typeof save === "function") save();
	location.reload();
}

function reshuffleLangs() {
	LANG_OFFSET = (LANG_OFFSET + 1 + Math.floor(Math.random() * 17)) % LANG_PHRASES.length;
	try { localStorage.setItem(LANG_STORE + ".offset", String(LANG_OFFSET)); } catch (e) { /* ignore */ }
	location.reload();
}

/* ---- settings UI (rendered through display-text, which is v-html) -------- */

function langSettingsHtml() {
	var sel = "";
	for (var i = 0; i < LANG_MODES.length; i++) {
		sel += '<option value="' + LANG_MODES[i].code + '"'
			+ (LANG_PREF === LANG_MODES[i].code ? " selected" : "") + '>'
			+ LANG_MODES[i].label + '</option>';
	}
	return ''
		+ '<div style="text-align:left;max-width:720px;margin:0 auto;">'
		+ '<h3>' + t("lang.title") + '</h3>'
		+ '<p style="opacity:.75">' + t("lang.blurb") + '</p>'
		+ '<p><b>' + LANG_PHRASES.length + '</b> ' + t("lang.sentences") + '</p>'
		+ '<select onchange="setGameLang(this.value)" style="font-size:1.1em;padding:6px 10px;margin:6px 0;">'
		+ sel + '</select>'
		+ '<button class="opt" onclick="reshuffleLangs()" style="font-size:1.05em;padding:6px 12px;margin-left:10px;">🎲 '
		+ t("lang.reshuffle") + '</button>'
		+ '</div>';
}

/** Every language in play, as a scrollable list — the collectible view. */
function langTableHtml() {
	var rows = [];
	for (var i = 0; i < LANG_PHRASES.length; i++) {
		var r = LANG_PHRASES[(i + LANG_OFFSET) % LANG_PHRASES.length];
		rows.push('<tr><td style="padding:1px 10px;opacity:.55">' + r[3] + '</td>'
			+ '<td style="padding:1px 10px">' + r[2] + '</td></tr>');
	}
	return '<div style="max-height:420px;overflow-y:auto;text-align:left;'
		+ 'max-width:640px;margin:0 auto;font-size:.95em"><table>' + rows.join("") + '</table></div>';
}

function langModeName() {
	for (var i = 0; i < LANG_MODES.length; i++) if (LANG_MODES[i].code === LANG_PREF) return LANG_MODES[i].label;
	return "🌐";
}
