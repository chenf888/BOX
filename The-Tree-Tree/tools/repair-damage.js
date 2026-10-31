// tools/repair-damage.js — positional repair of the audit findings (2026-11-01).
const fs = require("fs")
const path = require("path")
const js = (f) => path.join(__dirname, "..", "js", f)
function repOnce(file, a, b) {
  const f = js(file)
  let s = fs.readFileSync(f, "utf8")
  if (!s.includes(a)) { console.log("MISS [" + file + "] " + a.slice(0, 70)); return }
  fs.writeFileSync(f, s.replace(a, b))
  console.log("ok " + file + ": " + a.slice(0, 44) + " -> " + b.slice(0, 44))
}
// simple scalar fixes
repOnce("layers-row01.js", "requires: new Decimal(15000),", "requires: new Decimal(10),")
repOnce("layers-row01.js", "requires: new Decimal(5000),", "requires: new Decimal(15000),")
repOnce("layers-row01.js", "requires: new Decimal(10000),\n    type: \"normal\",\n    exponent: 30000 / 3,", "requires: new Decimal(30000),\n    type: \"normal\",\n    exponent: 1 / 3,")
repOnce("layers-row2.js", "requires: new Decimal(8000),\n    base: 25000,", "requires: new Decimal(25000),\n    base: 2,")
repOnce("layers-row2.js", "requires: new Decimal(10000),\n    base: 30000,", "requires: new Decimal(30000),\n    base: 3,")
repOnce("layers-row2.js", "requires: new Decimal(1000000),", "requires: new Decimal(3000000),")
repOnce("layers-row2.js", 'inChallenge("seed", 3000000)', 'inChallenge("seed", 21)')
// positional cost/milestone repair within each layer section
function positional(file, layerId, nextId, regex, values, label) {
  const f = js(file)
  let s = fs.readFileSync(f, "utf8")
  const a = s.indexOf('addLayer("' + layerId + '"')
  const b = nextId ? s.indexOf('addLayer("' + nextId + '"') : s.length
  let seg = s.slice(a, b)
  let i = 0
  seg = seg.replace(regex, (m) => (i < values.length ? String(values[i++]) + m.slice(m.indexOf("(") < 0 ? 0 : 0) : m))
  // NOTE: simpler — rebuild entirely below
  s = s.slice(0, a) + seg + s.slice(b)
  fs.writeFileSync(f, s)
  console.log(label, "->", i, "of", values.length)
}
// costs: replace the whole numeric literal
function setCosts(file, layerId, nextId, values, label) {
  const f = js(file)
  let s = fs.readFileSync(f, "utf8")
  const a = s.indexOf('addLayer("' + layerId + '"')
  const b = nextId ? s.indexOf('addLayer("' + nextId + '"') : s.length
  let seg = s.slice(a, b)
  let i = 0
  seg = seg.replace(/cost: new Decimal\(\d+\)/g, (m) => (i < values.length ? "cost: new Decimal(" + values[i++] + ")" : m))
  s = s.slice(0, a) + seg + s.slice(b)
  fs.writeFileSync(f, s)
  console.log(label, "->", i, "of", values.length)
}
setCosts("layers-row2.js", "bark", "blossom", [1, 2, 3, 4, 5, 6, 8, 10, 13, 17], "bark costs")
setCosts("layers-row2.js", "blossom", "sap", [1, 2, 3, 4, 5, 6, 7, 9, 11, 13], "bloom costs")
// milestones: positional done() values
function setMs(file, layerId, nextId, field, values, label) {
  const f = js(file)
  let s = fs.readFileSync(f, "utf8")
  const a = s.indexOf('addLayer("' + layerId + '"')
  const b = nextId ? s.indexOf('addLayer("' + nextId + '"') : s.length
  let seg = s.slice(a, b)
  const re = new RegExp(field + "\\.gte\\(\\d+\\)", "g")
  let i = 0
  seg = seg.replace(re, (m) => (i < values.length ? field + ".gte(" + values[i++] + ")" : m))
  s = s.slice(0, a) + seg + s.slice(b)
  fs.writeFileSync(f, s)
  console.log(label, "->", i, "of", values.length)
}
setMs("layers-row2.js", "bark", "blossom", "player.bark.best", [3, 5, 8, 11, 14, 18], "bark milestones")
setMs("layers-row2.js", "blossom", "sap", "player.blossom.best", [2, 4, 6, 8, 11, 14], "bloom milestones")
// milestone description sync (floors counts)
function setMsDesc(file, layerId, nextId, unitEn, unitZh, values, label) {
  const f = js(file)
  let s = fs.readFileSync(f, "utf8")
  const a = s.indexOf('addLayer("' + layerId + '"')
  const b = nextId ? s.indexOf('addLayer("' + nextId + '"') : s.length
  let seg = s.slice(a, b)
  const reEn = new RegExp('"\\d+ ' + unitEn + '"', "g")
  const reZh = new RegExp('"\\d+ ' + unitZh + '"', "g")
  let i = 0
  seg = seg.replace(reEn, (m) => (i < values.length ? '"' + values[i] + " " + unitEn + '"' : m))
  fs.writeFileSync(f, s.slice(0, a) + seg + s.slice(b))
  // zh pass (re-read)
  s = fs.readFileSync(f, "utf8")
  const a2 = s.indexOf('addLayer("' + layerId + '"')
  const b2 = nextId ? s.indexOf('addLayer("' + nextId + '"') : s.length
  seg = s.slice(a2, b2)
  i = 0
  seg = seg.replace(reZh, (m) => (i < values.length ? '"' + values[i] + " " + unitZh + '"' : m))
  fs.writeFileSync(f, s.slice(0, a2) + seg + s.slice(b2))
  console.log(label, "desc synced")
}
setMsDesc("layers-row2.js", "bark", "blossom", "Bark floors", "层树皮", [3, 5, 8, 11, 14, 18], "bark")
setMsDesc("layers-row2.js", "blossom", "sap", "Blossoms", "朵花", [2, 4, 6, 8, 11, 14], "blossom")
console.log("repair complete")
