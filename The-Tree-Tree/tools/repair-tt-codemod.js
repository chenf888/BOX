// tools/repair-tt-codemod.js — the tt-to-function codemod's slice started one char late
// (it included tt's own "(" and dropped tt's closing ")"), so every generated site is
// `return tt((ARGS) }` — missing exactly one ")". This adds it back: find `return tt((`,
// scan to the generated `) }` terminator, insert ")" before it.
const fs = require("fs");
const path = require("path");
const files = ["layers-row01.js", "layers-row2.js", "layers-row3.js", "layers-row4.js", "layers-side.js"];
let total = 0;
for (const f of files) {
    const p = path.join(__dirname, "..", "js", f);
    let s = fs.readFileSync(p, "utf8");
    let count = 0, pos = 0;
    while (true) {
        const i = s.indexOf("return tt((", pos);
        if (i < 0) break;
        // find the generated terminator ") }" after this point (args are plain quoted strings — no ") }" inside)
        const end = s.indexOf(") }", i);
        if (end < 0) { console.log("NO TERMINATOR " + f + " @" + i); break; }
        s = s.slice(0, end) + ")" + s.slice(end);
        pos = end + 2;
        count++;
    }
    fs.writeFileSync(p, s);
    total += count;
    console.log(f + ": repaired " + count);
}
console.log("---\ntotal: " + total);
