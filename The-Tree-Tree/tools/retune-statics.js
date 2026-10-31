// tools/retune-statics.js — one-shot Stage-6 retune (brief §11 round 2).
// MEASURED PROBLEM: static floors grow as base^count, so a static layer's REACHABLE COUNT is
// log_base(currency/requires) — about 5-20 in these eras. Every threshold expressed as a large
// floor count (bark m5=70, canopy req=40 blossoms) was structurally unreachable, stalling the
// run at 40-124 h. This pass moves every static-count-domain number into the reachable band:
// bark requires 8e3 (counts to ~18), blossom 1e4 (counts to ~14), canopy req 10 light,
// seed req 15 light, milestones/costs rescaled in source order.
const fs = require("fs")
const path = require("path")
const js = (f) => path.join(__dirname, "..", "js", f)

function patchOrdered(file, regex, values, label) {
  let s = fs.readFileSync(js(file), "utf8")
  let i = 0
  s = s.replace(regex, (m) => {
    if (i >= values.length) return m
    const v = values[i++]
    return m.replace(/(\d[\d,]*)/, String(v))
  })
  fs.writeFileSync(js(file), s)
  console.log(file, label, "->", i, "replacements")
}

// bark: costs 2,4,6,8,10,14,20,30,50,80 -> 1,2,3,4,5,6,8,10,13,17 (floors)
patchOrdered("layers-row2.js", /cost: new Decimal\((?:2|4|6|8|10|14|20|30|50|80)\),/g,
  [1, 2, 3, 4, 5, 6, 8, 10, 13, 17], "bark costs")
// bark milestones 4,8,16,24,40,70 -> 3,5,8,11,14,18 (code + description)
patchOrdered("layers-row2.js", /player\.bark\.best\.gte\((?:4|8|16|24|40|70)\)/g,
  [3, 5, 8, 11, 14, 18], "bark milestone done()")
patchOrdered("layers-row2.js", /"(?:4|8|16|24|40|70) Bark floors"/g,
  [3, 5, 8, 11, 14, 18], "bark milestone desc(en)") // en only; zh handled below
patchOrdered("layers-row2.js", /"(?:4|8|16|24|40|70) 层树皮"/g,
  [3, 5, 8, 11, 14, 18], "bark milestone desc(zh)")

// blossom: costs 2,4?.. -> 1,2,3,4,5,6,7,9,11,13
patchOrdered("layers-row2.js", /cost: new Decimal\((?:2|4|7|11|16|25|40|60|90|150)\),/g,
  [1, 2, 3, 4, 5, 6, 7, 9, 11, 13], "blossom costs")
patchOrdered("layers-row2.js", /player\.blossom\.best\.gte\((?:4|9|16|30|50|90)\)/g,
  [2, 4, 6, 8, 11, 14], "blossom milestone done()")
patchOrdered("layers-row2.js", /"(?:4|9|16|30|50|90) Blossoms"/g,
  [2, 4, 6, 8, 11, 14], "blossom milestone desc(en)")
patchOrdered("layers-row2.js", /"(?:4|9|16|30|50|90) 朵花"/g,
  [2, 4, 6, 8, 11, 14], "blossom milestone desc(zh)")

// requires: bark 200000 -> 8000; blossom 500000 -> 10000 (monotone: 10 < 5e3 < 1e4 < 8e3? —
// NOTE row-monotonicity is per adjacent ROW pair: row1 requires 5e3/1e4 (wood), row2 8e3/1e4/1e6.
let s = fs.readFileSync(js("layers-row2.js"), "utf8")
s = s.replace("requires: new Decimal(200000),", "requires: new Decimal(8000),")
s = s.replace("requires: new Decimal(500000),", "requires: new Decimal(10000),")
fs.writeFileSync(js("layers-row2.js"), s)
console.log("requires: bark 8e3, blossom 1e4")

// tuning: canopy req 40 -> 10; seed req 25 -> 15
s = fs.readFileSync(js("tuning.js"), "utf8")
s = s.replace("CANOPY: { req: 40, exp: 0.8 },", "CANOPY: { req: 10, exp: 0.8 },")
s = s.replace("SEED: { req: 25, exp: 0.9 },", "SEED: { req: 15, exp: 0.9 },")
fs.writeFileSync(js("tuning.js"), s)
console.log("tuning: canopy 10, seed 15")

// canopy milestones 5,12,30,80,200,500 -> 3,8,20,50,120,300 (Light)
patchOrdered("layers-row3.js", /player\.canopy\.best\.gte\((?:5|12|30|80|200|500)\)/g,
  [3, 8, 20, 50, 120, 300], "canopy milestone done()")
patchOrdered("layers-row3.js", /"(?:5|12|30|80|200|500) Light"/g, [3, 8, 20, 50, 120, 300], "canopy desc(en)")
patchOrdered("layers-row3.js", /"(?:5|12|30|80|200|500) 光照"/g, [3, 8, 20, 50, 120, 300], "canopy desc(zh)")

// seed milestones 5,10,20,40,90,200,450,1000,2500 -> 4,9,18,36,80,160,320,600,1200
patchOrdered("layers-row3.js", /player\.seed\.best\.gte\((?:5|10|20|40|90|200|450|1000|2500)\)/g,
  [4, 9, 18, 36, 80, 160, 320, 600, 1200], "seed milestone done()")
patchOrdered("layers-row3.js", /"(?:5|10|20|40|90|200|450|1000|2500) Seeds"/g,
  [4, 9, 18, 36, 80, 160, 320, 600, 1200], "seed desc(en)")
patchOrdered("layers-row3.js", /"(?:5|10|20|40|90|200|450|1000|2500) 粒种子"/g,
  [4, 9, 18, 36, 80, 160, 320, 600, 1200], "seed desc(zh)")

// layerShown sync
s = fs.readFileSync(js("layers-row3.js"), "utf8")
s = s.replace("player.canopy.unlocked || player.blossom.best.gte(25)", "player.canopy.unlocked || player.blossom.best.gte(8)")
s = s.replace("player.seed.unlocked || player.canopy.best.gte(12)", "player.seed.unlocked || player.canopy.best.gte(6)")
fs.writeFileSync(js("layers-row3.js"), s)
s = fs.readFileSync(js("layers-row4.js"), "utf8")
s = s.replace("player.grove.unlocked || player.seed.best.gte(100)", "player.grove.unlocked || player.seed.best.gte(50)")
fs.writeFileSync(js("layers-row4.js"), s)
console.log("layerShown synced")
console.log("static-count retune complete")
