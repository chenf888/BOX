// tools/repair-tt-codemod2.js — the first repair produced `return tt((ARGS)) }` — the
// inner paren turns ARGS into a comma EXPRESSION, so tt receives only its last argument.
// Fold one pair: `return tt((` -> `return tt(` and its matching `)) }` -> `) }`,
// processed right-to-left so indices hold.
const fs = require("fs");
const path = require("path");
const files = ["layers-row01.js", "layers-row2.js", "layers-row3.js", "layers-row4.js", "layers-side.js"];
let total = 0;
for (const f of files) {
    const p = path.join(__dirname, "..", "js", f);
    let s = fs.readFileSync(p, "utf8");
    const sites = [];
    let i = s.indexOf("return tt((");
    while (i >= 0) { sites.push(i); i = s.indexOf("return tt((", i + 1); }
    for (let k = sites.length - 1; k >= 0; k--) {
        const start = sites[k];
        const end = s.indexOf(")) }", start);
        if (end < 0) { console.log("NO END " + f + " @" + start); continue; }
        s = s.slice(0, end) + ") }" + s.slice(end + 4);        // drop one ")"
        s = s.slice(0, start) + "return tt(" + s.slice(start + 11); // drop one "("
        total++;
    }
    fs.writeFileSync(p, s);
    console.log(f + ": folded " + sites.length);
}
console.log("---\ntotal: " + total);
