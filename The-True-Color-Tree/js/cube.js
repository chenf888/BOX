// cube.js — shared helpers for The True Color Tree
// The color cube: color (R,G,B) is "lit" once every channel level >= its coordinate.
// Palette volume = (r+1)(g+1)(b+1) <= 256^3 = 2^24 = 16,777,216.
// This module holds NO layer definitions; it is registered in modInfo.modFiles
// before the layer files so the globals exist when their functions first run.

// Bilingual helper (P17): every user-facing string goes through L(...).
function L(zh, en) {
    return window.chinesemode ? zh : en
}

// ---- channel / cube math (all reads, no writes) ----------------------------

function chanLevel(id) { return player[id].points }                       // Decimal 0..255
function chanSum() { return player.r.points.add(player.g.points).add(player.b.points) }
function cubeVolume() {
    return player.r.points.add(1).times(player.g.points.add(1)).times(player.b.points.add(1))
}
function bitDepth() { return player.t.points.add(1) }                     // displayed depth
const CUBE_MAX = new Decimal("16777216")                                  // 2^24

function palettePct() {
    return cubeVolume().div(CUBE_MAX).times(100)
}

// Era gates (used by layerShown thresholds and story chapters)
function eraReached(d) { return player.t.best.gte(d - 1) }                // d = 4/8/16/24

// ---- 16x16x16 mosaic (each block = a 16^3 color region) --------------------
// Rebuilt only when a channel level (integer) changes; 4096 spans otherwise cached.

let _mosaicCache = { key: null, html: "" }

function mosaicHTML() {
    if (!player || !player.r || !player.g || !player.b) return ""
    const r = player.r.points.toNumber()
    const g = player.g.points.toNumber()
    const b = player.b.points.toNumber()
    const key = r + "|" + g + "|" + b
    if (_mosaicCache.key === key) return _mosaicCache.html

    let panels = []
    for (let k = 15; k >= 0; k--) {
        let cells = ""
        for (let j = 0; j < 16; j++) {
            for (let i = 0; i < 16; i++) {
                const base = i * 16
                const fr = Math.max(0, Math.min(1, (r - base + 1) / 16))
                const fg = Math.max(0, Math.min(1, (g - j * 16 + 1) / 16))
                const fb = Math.max(0, Math.min(1, (b - k * 16 + 1) / 16))
                const a = Math.min(fr, fg, fb)            // block fully lit iff all axes covered
                const col = (i * 16 + 8) + "," + (j * 16 + 8) + "," + (k * 16 + 8)
                const op = (0.08 + 0.92 * a).toFixed(2)
                cells += '<div style="width:13px;height:13px;background-color:rgb(' + col + ');opacity:' + op + ';"></div>'
            }
        }
        panels.push('<div style="display:inline-block;margin:3px;vertical-align:top;">'
            + '<div style="display:grid;grid-template-columns:repeat(16,13px);grid-auto-rows:13px;border:1px solid #333;">'
            + cells + '</div>'
            + '<div style="text-align:center;font-size:10px;opacity:.6;">B' + (k * 16) + '</div></div>')
    }
    _mosaicCache.key = key
    _mosaicCache.html = '<div style="max-width:1400px;line-height:0;">' + panels.join("") + '</div>'
    return _mosaicCache.html
}
