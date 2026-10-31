// tools/audit-and-repair.js — repair the setIn damage from final-retune.js round 1
// (that pass replaced numbers AFTER its anchors, hitting base/exponent fields by mistake).
const fs = require("fs")
const path = require("path")
const js = (f) => path.join(__dirname, "..", "js", f)
function show(file, from, to) {
  const s = fs.readFileSync(js(file), "utf8").split("\n")
  console.log("== " + file + " " + from + "-" + to)
  for (let i = from - 1; i < to; i++) console.log((i + 1) + ": " + s[i])
}
function rep(file, a, b) {
  const f = js(file)
  let s = fs.readFileSync(f, "utf8")
  if (!s.includes(a)) { console.log("MISS [" + file + "] " + a.slice(0, 60)); return }
  s = s.replace(a, b)
  fs.writeFileSync(f, s)
  console.log("ok [" + file + "] " + a.slice(0, 40) + " -> " + b.slice(0, 40))
}
// audit
show("layers-row01.js", 416, 424)
show("layers-row2.js", 279, 292)
console.log("bark costs:", (fs.readFileSync(js("layers-row2.js"), "utf8").match(/addLayer\("bark"[\s\S]*?addLayer\("blossom"/) || [""])[0].match(/cost: new Decimal\(\d+\)/g).join(" "))
console.log("bloom costs:", (fs.readFileSync(js("layers-row2.js"), "utf8").match(/addLayer\("blossom"[\s\S]*?addLayer\("sap"/) || [""])[0].match(/cost: new Decimal\(\d+\)/g).join(" "))
console.log("bark m:", fs.readFileSync(js("layers-row2.js"), "utf8").match(/bark\.best\.gte\(\d+\)/g).join(" "))
console.log("bloom m:", fs.readFileSync(js("layers-row2.js"), "utf8").match(/blossom\.best\.gte\(\d+\)/g).join(" "))
