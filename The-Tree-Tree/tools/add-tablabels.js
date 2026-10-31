// tools/add-tablabels.js — insert tabLabel() into every microtab definition so the T2
// toggle localizes the tab buttons (the stock tab-buttons component renders the raw KEY).
const fs = require("fs");
const path = require("path");
const ZH = {
    Growth: "成长", Milestones: "里程碑", Trials: "试炼", Formulae: "公式",
    Floors: "树皮层", Blooms: "花朵", Shop: "商店", Grove: "树林", Crown: "树冠", "The Tree": "界树",
};
const files = ["layers-row01.js", "layers-row2.js", "layers-row3.js", "layers-row4.js"];
let total = 0;
for (const f of files) {
    const p = path.join(__dirname, "..", "js", f);
    const lines = fs.readFileSync(p, "utf8").split("\n");
    const keyRe = /^(\s*)("(?:Growth|Milestones|Trials|Formulae|Floors|Blooms|Shop|Grove|Crown|The Tree)":\s*\{)(.*)$/;
    for (let i = lines.length - 1; i >= 0; i--) {
        const m = lines[i].match(keyRe);
        if (!m) continue;
        const label = `tabLabel() { return tt("${m[2].slice(1, m[2].indexOf('"', 1))}", "${ZH[m[2].slice(1, m[2].indexOf('"', 1))]}") }, `;
        if (m[3].trim() === "") {
            lines.splice(i + 1, 0, m[1] + "    " + label.trim());   // multi-line def: label on its own line
        } else {
            lines[i] = m[1] + m[2].replace("{", "{ " + label.trim() + " ") + m[3]; // single-line def
        }
        total++;
    }
    fs.writeFileSync(p, lines.join("\n"));
}
console.log("tabLabels inserted: " + total);
