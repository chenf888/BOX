// tools/retune-thresholds.js — one-shot: reshape worldtree m-chain thresholds + descriptions.
// (Routed through the brief §11 retune; the file is a build tool, not a mod file.)
const fs = require("fs")
const path = require("path")
const f = path.join(__dirname, "..", "js", "layers-row4.js")
let s = fs.readFileSync(f, "utf8")
const map = [
  ["1500", "520"],
  ["8000", "2600"],
  ["50000", "13000"],
  ["400000", "65000"],
  ["4000000", "650000"],
  ["50000000", "4000000"],
]
for (const [oldV, newV] of map) {
  const re = new RegExp("player\\.worldtree\\.best\\.gte\\(" + oldV + "\\)", "g")
  s = s.replace(re, "player.worldtree.best.gte(" + newV + ")")
}
const desc = [
  ['"1,500 World-growth", "1,500 界树生长"', '"520 World-growth", "520 界树生长"'],
  ['"8,000 World-growth", "8,000 界树生长"', '"2,600 World-growth", "2,600 界树生长"'],
  ['"50,000 World-growth", "50,000 界树生长"', '"13,000 World-growth", "13,000 界树生长"'],
  ['"400,000 World-growth", "400,000 界树生长"', '"65,000 World-growth", "65,000 界树生长"'],
  ['"4,000,000 World-growth", "400 万界树生长"', '"650,000 World-growth", "65 万界树生长"'],
  ['"50,000,000 World-growth", "5000 万界树生长"', '"4,000,000 World-growth", "400 万界树生长"'],
]
for (const [a, b] of desc) s = s.split(a).join(b)
fs.writeFileSync(f, s)
console.log("thresholds reshaped")
