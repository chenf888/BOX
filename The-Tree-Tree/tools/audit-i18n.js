// tools/audit-i18n.js — find component-text fields whose string values are not tt() wrapped.
const fs = require("fs");
const path = require("path");
const fields = ["name", "title", "description", "tooltip", "effectDescription", "requirementDescription",
    "goalDescription", "rewardDisplay", "resource", "resetDescription", "sellAllText", "display", "fullDisplay"];
let hits = 0;
for (const f of ["layers-row01.js", "layers-row2.js", "layers-row3.js", "layers-row4.js", "layers-side.js"]) {
    const lines = fs.readFileSync(path.join(__dirname, "..", "js", f), "utf8").split("\n");
    let cur = "?";
    for (let i = 0; i < lines.length; i++) {
        const ln = lines[i];
        const lm = ln.match(/^\s*addLayer\("([a-z-]+)"/);
        if (lm) cur = lm[1];
        for (const fd of fields) {
            const re = new RegExp("^\\s*" + fd + "\\s*[:()]");
            if (!re.test(ln)) continue;
            if (/tt\(/.test(ln)) continue;                    // bilingual line
            if (/^\s*display\(\)/.test(ln) || fd === "display" || fd === "fullDisplay") continue; // display() builds from parts, checked separately
            // does this line carry a bare string literal?
            if (/["'](?:[^"'\\]|\\.){3,}["']/.test(ln)) {
                hits++;
                console.log(`${f}:${i + 1} [${cur}] ${ln.trim().slice(0, 110)}`);
            }
        }
    }
}
console.log("---\nhits: " + hits);
