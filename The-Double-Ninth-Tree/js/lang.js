// ===========================================================================
// lang.js — T2 bilingual text layer (P17 window.chinesemode idiom).
//
// 2027重阳节树 ships Chinese by default with a one-click 中/EN switch in the
// 设置 tab. Every user-facing string goes through L(zh, en). All text fields
// that can be module-scope are FUNCTIONS (sketch rule: T2+ keeps text as
// functions, never module-scope interpolated values).
// ===========================================================================
window.chinesemode = true

function L(zh, en) {
	return window.chinesemode ? zh : en
}
