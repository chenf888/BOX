// tools/flatten-mults.js — one-shot Stage-6 retune (brief §11): the measured per-era output
// was ~x1000 vs a requires step of x10-100, collapsing 11 layers into 19 minutes. Fix per
// handbook 11 §4.1 "cut zones": every flat multiplier is halved, in CODE and in its
// description text together, so numbers and words cannot drift apart. SINGLE regex pass —
// sequential replaces would cascade (x10 -> x5 -> x3).
const fs = require("fs")
const path = require("path")
const files = ["mod.js", "tuning.js", "layers-row01.js", "layers-row2.js", "layers-row3.js", "layers-row4.js"]
  .map((f) => path.join(__dirname, "..", "js", f))

const codeMap = { 10: 5, 5: 3, 4: 2.5, 2.5: 1.8, 3: 2, 2: 1.5 }
const textMap = { 10: 5, 5: 3, 4: 2.5, 2.5: 1.8, 3: 2, 2: 1.5 }

for (const f of files) {
  let s = fs.readFileSync(f, "utf8")
  s = s.replace(/times\((10|5|4|2\.5|3|2)\)/g, (m, n) => "times(" + codeMap[n] + ")")
  // description texts: xN followed by non-digit (x2. vs x2.5 must not double-hit)
  s = s.replace(/×(10|5|4|2\.5|3|2)(?=[^.\d])/g, (m, n) => "×" + textMap[n])
  fs.writeFileSync(f, s)
  console.log("flattened:", path.basename(f))
}
