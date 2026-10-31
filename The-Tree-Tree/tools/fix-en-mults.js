// tools/fix-en-mults.js — Stage 6.5 i18n repair: the flatten-mults pass (brief §11 #3)
// rewrote code + ZH text but left EN strings at the old values. The code is authoritative;
// ZH was verified against it, so EN numbers are re-synced from the ZH twin where the pair
// fits the flatten map {2→1.5, 3→2, 5→3, 10→5}. Lines that don't fit are FLAGGED, not touched.
const fs = require("fs");
const path = require("path");

const MAP = { "2": "1.5", "3": "2", "5": "3", "10": "5" };
const files = ["layers-row01.js", "layers-row2.js", "layers-row3.js", "layers-row4.js", "layers-side.js"];

let changed = 0, flagged = 0;
for (const f of files) {
    const p = path.join(__dirname, "..", "js", f);
    const lines = fs.readFileSync(p, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.includes("tt(") || !line.includes("×")) continue;
        // process EVERY tt("EN", "ZH") pair on the line (title + description share a line)
        const pairRe = /tt\("((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)"\)/g;
        let newLine = line;
        let m;
        let lineChanged = false;
        while ((m = pairRe.exec(line)) !== null) {
            const en = m[1], zh = m[2];
            const enNums = [...en.matchAll(/×(\d+(?:\.\d+)?)/g)].map(x => x[1]);
            const zhNums = [...zh.matchAll(/×(\d+(?:\.\d+)?)/g)].map(x => x[1]);
            if (enNums.length === 0 || enNums.length !== zhNums.length) continue;
            if (enNums.join(",") === zhNums.join(",")) continue; // already in sync
            const fits = enNums.every((n, j) => MAP[n] === zhNums[j]);
            if (!fits) {
                console.log("FLAG " + f + ":" + (i + 1) + "  EN[" + enNums.join(",") + "] ZH[" + zhNums.join(",") + "]");
                flagged++;
                continue;
            }
            const newEn = en.replace(/×(\d+(?:\.\d+)?)/g, (whole, n) => "×" + MAP[n]);
            newLine = newLine.replace(m[0], 'tt("' + newEn + '", "' + zh + '")');
            lineChanged = true;
            changed++;
            console.log("FIX  " + f + ":" + (i + 1) + "  EN ×" + enNums.join(",") + " → ×" + enNums.map(n => MAP[n]).join(","));
        }
        if (lineChanged) lines[i] = newLine;
    }
    fs.writeFileSync(p, lines.join("\n"));
}
console.log("---");
console.log("changed: " + changed + " lines; flagged: " + flagged + " lines");
