// tools/tt-to-function.js — convert static tt() VALUE fields into functions so the T2
// language toggle switches live (tt() baked at layer-load time froze every component text
// to the boot language — the old tree-tab toggle masked this with a page reload).
// Fields consumed via tmp (updateTempData eager-calls them each tick) and via run() at
// render both become live. Layer-level `name:` strings are left alone (addLayer uses the
// name as an object key at setup; layer names are invisible in this game anyway).
const fs = require("fs");
const path = require("path");

const FIELDS = "title|description|effectDescription|requirementDescription|goalDescription|rewardDisplay|tooltip|effectDisplay|name";
const files = ["layers-row01.js", "layers-row2.js", "layers-row3.js", "layers-row4.js", "layers-side.js"];
let total = 0;

for (const f of files) {
    const p = path.join(__dirname, "..", "js", f);
    let s = fs.readFileSync(p, "utf8");
    const re = new RegExp("(\\b(?:" + FIELDS + ")\\s*):\\s*(tt\\()", "g");
    let count = 0;
    // pass 1: count + find multi-line tt( calls
    let m;
    const spots = [];
    while ((m = re.exec(s)) !== null) {
        const start = m.index + m[1].length + 1; // at "tt"
        // paren-balance from the tt( opening
        let depth = 0, i = m.index + m[1].length + 4, inStr = null, end = -1;
        for (; i < s.length; i++) {
            const ch = s[i];
            if (inStr) {
                if (ch === "\\") { i++; continue; }
                if (ch === inStr) inStr = null;
                continue;
            }
            if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; continue; }
            if (ch === "(") depth++;
            else if (ch === ")") { depth--; if (depth === 0) { end = i; break; } }
        }
        if (end < 0) { console.log("UNBALANCED " + f + " @" + m.index); continue; }
        spots.push({ start: m.index, field: m[1], ttStart: m.index + m[1].length + 1, ttEnd: end });
    }
    // apply from the end so indices stay valid
    for (let k = spots.length - 1; k >= 0; k--) {
        const sp = spots[k];
        const args = s.slice(sp.ttStart + 3, sp.ttEnd); // inside tt( ... )
        const replacement = sp.field + "() { return tt(" + args + ") }";
        s = s.slice(0, sp.start) + replacement + s.slice(sp.ttEnd + 1);
        count++;
    }
    fs.writeFileSync(p, s);
    total += count;
    console.log(f + ": " + count + " field(s) converted");
}
console.log("---\ntotal: " + total);
