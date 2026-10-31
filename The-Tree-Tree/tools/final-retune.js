// tools/final-retune.js — ONE authoritative Stage-6 retune pass (brief §11 round 3).
// Sets every pacing number ABSOLUTELY (no pattern cascades). Informed by five measured runs:
// 0.42 h (all-too-fast) -> 124/173 h (static-count starvation) -> 0.40 h (count-gates freed).
// Direction split: requires x3, leaf power 0.2 (between the measured 0.1/0.35 pair),
// canopy/seed/wt count-domain thresholds x2-3, static costs restored to their intended ladders.
const fs = require("fs")
const path = require("path")
const js = (f) => path.join(__dirname, "..", "js", f)
function setIn(file, anchor, value) {
  const f = js(file)
  let s = fs.readFileSync(f, "utf8")
  const i = s.indexOf(anchor)
  if (i < 0) { console.error("ANCHOR MISS [" + file + "] " + anchor.slice(0, 60)); return }
  // value replaces the first NUMBER right after the anchor
  const m = /(\d[\d.e+]*)/.exec(s.slice(i + anchor.length))
  if (!m) { console.error("NO NUM after anchor [" + file + "] " + anchor.slice(0, 60)); return }
  const at = i + anchor.length + m.index
  s = s.slice(0, at) + String(value) + s.slice(at + m[0].length)
  fs.writeFileSync(f, s)
}
function replaceOnce(file, a, b) {
  const f = js(file)
  let s = fs.readFileSync(f, "utf8")
  if (!s.includes(a)) { console.error("MISS [" + file + "] " + a.slice(0, 70)); return }
  s = s.replace(a, b)
  fs.writeFileSync(f, s)
}

// 1. leaf softcap power 0.35 -> 0.2
replaceOnce("tuning.js", 'LEAF: { start: "1e12", power: 0.35 },   // power 0.35 (measured 2026-10-31: 0.1 starved the static count-domain downstream)',
  'LEAF: { start: "1e12", power: 0.2 },   // measured sweep: 0.1 starved the static count-domain, 0.35 collapsed the ladder — 0.2 splits the pair')

// 2. requires x3
setIn("layers-row01.js", "requires: new Decimal(", 15000)            // branch (first Decimal() after layer head — VERIFY below)
replaceOnce("layers-row01.js", "requires: new Decimal(15000),", "requires: new Decimal(15000),") // no-op sanity
setIn("layers-row01.js", 'requires: new Decimal(10000),', 30000)     // root
setIn("layers-row2.js", 'requires: new Decimal(8000),', 25000)       // bark
setIn("layers-row2.js", 'requires: new Decimal(10000),', 30000)      // blossom
setIn("layers-row2.js", 'requires: new Decimal(1000000),', 3000000)  // sap
replaceOnce("layers-row3.js", "requires: new Decimal(TUNING.CANOPY.req),", "requires: new Decimal(TUNING.CANOPY.req),") // symbolic already
replaceOnce("tuning.js", "CANOPY: { req: 10, exp: 0.8 },", "CANOPY: { req: 14, exp: 0.8 },")
replaceOnce("tuning.js", "SEED: { req: 15, exp: 0.9 },", "SEED: { req: 25, exp: 0.9 },")

// 3. static costs: restore intended ladders absolutely (id-anchored)
const barkCosts = { 11: 1, 12: 2, 13: 3, 14: 4, 15: 5, 21: 6, 22: 8, 23: 10, 24: 13, 25: 17 }
const bloomCosts = { 11: 1, 12: 2, 13: 3, 14: 4, 15: 5, 21: 6, 22: 7, 23: 9, 24: 11, 25: 13 }
function setCost(file, id, v) {
  const f = js(file)
  let s = fs.readFileSync(f, "utf8")
  const re = new RegExp("(\\n\\s+" + id + ": \\{[^}]*?cost: new Decimal\\()(\\d[^)]*)(\\))", "s")
  if (!re.test(s)) { console.error("COST MISS " + file + " u" + id); return }
  s = s.replace(re, "$1" + v + "$3")
  fs.writeFileSync(f, s)
}
for (const k in barkCosts) setCost("layers-row2.js", k, barkCosts[k])
for (const k in bloomCosts) setCost("layers-row2.js", k, bloomCosts[k])

// 4. static milestones (count-domain, reachable band) — absolute anchors
const barkM = [[4, 3], [8, 5], [16, 8], [24, 11], [40, 14], [70, 18]]
for (const [oldV, newV] of barkM) replaceOnce("layers-row2.js", "player.bark.best.gte(" + oldV + ")", "player.bark.best.gte(" + newV + ")")
const bloomM = [[4, 2], [9, 4], [16, 6], [30, 8], [50, 11], [90, 14]]
for (const [oldV, newV] of bloomM) replaceOnce("layers-row2.js", "player.blossom.best.gte(" + oldV + ")", "player.blossom.best.gte(" + newV + ")")

// 5. worldtree tail x3
const wtM = [[520, 1500], [2600, 8000], [13000, 40000], [65000, 200000], [650000, 2000000], [4000000, 12000000]]
for (const [oldV, newV] of wtM) replaceOnce("layers-row4.js", "player.worldtree.best.gte(" + oldV + ")", "player.worldtree.best.gte(" + newV + ")")

console.log("final retune applied")
