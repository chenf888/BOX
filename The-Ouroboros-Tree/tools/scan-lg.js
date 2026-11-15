// one-shot diagnostic: find lg() calls with fewer than 2 top-level arguments
// (lg(cn, en) needs both — a one-arg call renders "undefined" in either mode)
const fs = require("fs");
const files = ["js/mod.js", "js/layers1.js", "js/layers2.js", "js/layers3.js", "js/layers4.js", "js/side.js", "js/tree.js", "js/tuning.js"];
let bad = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  for (let i = src.indexOf("lg("); i !== -1; i = src.indexOf("lg(", i + 1)) {
    const before = src[i - 1] || "";
    if (/[A-Za-z0-9_$]/.test(before)) continue;
    let d = 0, j = i + 2, end = -1, inStr = null, esc = false;
    for (; j < src.length; j++) {
      const c = src[j];
      if (inStr) {
        if (esc) { esc = false; continue; }
        if (c === "\\") { esc = true; continue; }
        if (c === inStr) inStr = null;
        continue;
      }
      if (c === "'" || c === '"' || c === "`") { inStr = c; continue; }
      if (c === "(") d++;
      else if (c === ")") { d--; if (d === 0) { end = j; break; } }
    }
    if (end < 0) continue;
    const inner = src.slice(i + 3, end);
    let depth = 0, commas = 0, inS = null, e2 = false;
    for (let k = 0; k < inner.length; k++) {
      const c = inner[k];
      if (inS) {
        if (e2) { e2 = false; continue; }
        if (c === "\\") { e2 = true; continue; }
        if (c === inS) inS = null;
        continue;
      }
      if (c === "'" || c === '"' || c === "`") { inS = c; continue; }
      if ("([{".includes(c)) depth++;
      else if (")]}".includes(c)) depth--;
      else if (c === "," && depth === 0) commas++;
    }
    const line = src.slice(0, i).split("\n").length;
    if (commas === 0) {
      console.log(f + ":" + line + " ONE-ARG lg: " + src.slice(i, end + 1).slice(0, 110).replace(/\n/g, " "));
      bad++;
    }
  }
}
console.log("total one-arg lg:", bad);
