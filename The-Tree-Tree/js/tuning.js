// js/tuning.js — THE single home for pacing constants (handbook 14 §3.3).
// Read by the game AND by tools/simulate.js. Never inline these numbers in layer files.
// Brief §10: any number noticed while playing becomes a row here, then a sim re-run.

var TUNING = {
    // Row pacing (brief §7 / self-check 18): per-row time = requires step / output step.
    ROW_RATIO: 25,       // requires step per row (corpus median x25)
    OUTPUT_STEP: 20,     // output step per row (flat per-era zones) -> per-row time x1.25

    // Layer softcaps (normal-type gain defense; measured-retune shape: power 0.1, cap raise x10)
    SOFTCAP: {
        wood: { start: "1e5", power: 0.1, raise: 10 },     // start ~ branch-unlock era
        branch: { start: "1e6", power: 0.1 },
        root: { start: "2e6", power: 0.1 },
        canopy: { start: "1e8", power: 0.1 },
        seed: { start: "1e9", power: 0.1 },
    },

    // Custom gain shapes
    // MEASURED FIX (brief §11): canopy/seed previously used log10(count)-offset curves with a
    // trailing .add(1) — resetGain was >=1 at ANY count, so requires gated nothing and row 3
    // was free. Counts (static floors) cap around 50-200, so count-based layers use plain
    // polynomial shapes on the count; sap keeps the log shape because min(branch,root) is a
    // true currency.
    SAP: { offset: 6, exp: 1.2, doubleSoftcapStart: "1e9", doubleSoftcapPower: 0.5 },   // gain = (log10(min)-6)^1.2
    CANOPY: { req: 14, exp: 0.8 },     // gain = (blossom count / 40)^0.8
    SEED: { req: 25, exp: 0.9 },       // gain = (canopy light / 25)^0.9
    WT: { exp: 1.2 },                                              // worldtree growth exponent

    // Grove plant formula (M19 consumable reset, P42 itemized: base x mult x mult x mult)
    PLANT: {
        leafExp: 1,          // term1: log10(leaves+10) ^ 1  (base term)
        woodExp: 0.35,       // term2: (wood+1)^0.35
        armExp: 0.3,         // term3: (min(branch,root)+1)^0.3   (P53 convergent)
        bloomExp: 0.2,       // term4a: (blossom+1)^0.2
        sapExp: 0.15,        // term4b: (sap+1)^0.15
        div: 3,              // trees = floor(product.log10()^1.5 / div)
        logExp: 1.5,
    },

    // Tree payout (brief §11 retune): LINEAR-shaped in the tree count. The first design
    // (TREE_MULT^trees) closed a compounding loop (trees -> mult -> leaves -> plant yield ->
    // trees) that reached ee-scale leaves within one sim hour and exploded the plant formula.
    // (trees+1)^1.5 x base pays ~x90 at 12 trees and stays sub-exponential forever.
    TREE_PAYOUT: { exp: 1.5, mult: 2 },

    // Leaf softcap (the base currency had no cap of its own — same measured-retune shape)
    LEAF: { start: "1e12", power: 0.2 },   // measured sweep: 0.1 starved the static count-domain, 0.35 collapsed the ladder — 0.2 splits the pair

    // Buyable cost curves (P6: exponential base 2-4; b12/b11 must stay P54-invertible)
    BUYABLE: {
        woodFert: { start: 3, base: 2.5 },
        woodRings: { start: 10, base: 3 },     // inverse: log(points/start)/log(base)
        branchBuds: { start: 5, base: 2.2 },
        rootMyco: { start: 8, base: 2.8 },
        sapConc: { start: 15, base: 2 },
    },
}

// Each planted tree's payout base (grove u11 raises it 2 -> 3).
function treeMult() { return hasUpgrade("grove", 11) ? 3 : 2 }

// Shared "all gains" multiplier — the worldtree/grove/late-milestone web (single source,
// consumed by getPointGen AND every layer's gainMult so the brief's "xN all" rows cannot desync).
// noSelfFeed=true (worldtree's own gainMult) omits the worldtree-milestone block: those
// milestones must not multiply the very growth that unlocks the next one (measured: the
// self-feeding chain collapsed 15 thresholds into minutes at 0.18 h total).
// noPayout=true additionally omits the tree payout: the worldtree chain must pace on
// PLANTING (regrow -> plant -> next threshold), not on payout x trees compounding
// (measured: payout^1.5 x trees^1.2 grew the chain rate as trees^2.7 and collapsed it).
function allMult(noSelfFeed, noPayout) {
    let m = new Decimal(1)
    if (inChallenge("seed", 22)) return m          // "Dense Canopy": the whole web is sealed
    if (hasUpgrade("grove", 12)) m = m.times(1.5)    // Forest Floor
    if (hasUpgrade("grove", 25)) m = m.times(2)    // Old Forest
    if (hasUpgrade("worldtree", 13)) m = m.times(1.5)   // Continental Canopy
    if (hasUpgrade("worldtree", 24)) m = m.times(2)   // World Weather
    if (hasUpgrade("seed", 54)) m = m.times(1.5)     // The Mother Tree
    if (hasMilestone("grove", 0)) m = m.times(1.5)
    if (hasMilestone("grove", 3)) m = m.times(1.5)
    if (hasMilestone("bark", 5)) m = m.times(1.5)
    if (hasMilestone("canopy", 5)) m = m.times(1.5)
    if (hasMilestone("seed", 3)) m = m.times(2)
    if (hasMilestone("seed", 5)) m = m.times(3)
    // worldtree milestone chain (the endgame ladder): m0 x2, m1 x2, m3 x3, m5 x5, m7 x2,
    // m8 x3, m9 x5, m11 x5, m13 x10, m14 x10 — SKIPPED for worldtree's own gain (no self-feed)
    if (noSelfFeed) return m
    if (hasMilestone("worldtree", 0)) m = m.times(1.5)
    if (hasMilestone("worldtree", 1)) m = m.times(1.5)
    if (hasMilestone("worldtree", 3)) m = m.times(2)
    if (hasMilestone("worldtree", 5)) m = m.times(3)
    if (hasMilestone("worldtree", 7)) m = m.times(1.5)
    if (hasMilestone("worldtree", 8)) m = m.times(2)
    if (hasMilestone("worldtree", 9)) m = m.times(3)
    if (hasMilestone("worldtree", 11)) m = m.times(3)
    if (hasMilestone("worldtree", 13)) m = m.times(5)
    if (hasMilestone("worldtree", 14)) m = m.times(5)
    // each planted tree pays out (K9 state, brief grove u11) — linear-shaped, see TREE_PAYOUT
    if (!noPayout) m = m.times(player.grove.points.add(1).pow(TUNING.TREE_PAYOUT.exp).times(treeMult()))
    return m
}

// Grove plant gain — itemized burn terms (P42). Uses CURRENT resources (the burn!) —
// after planting they are zero and must regrow, so the gain cannot repeat for free.
function groveGetGain() {
    const P = TUNING.PLANT
    let t1 = player.points.add(10).log10()                       // leaves (base term)
    let t2 = player.wood.points.add(1).pow(P.woodExp)            // wood
    let t3 = player.branch.points.min(player.root.points).add(1).pow(P.armExp) // convergent arms
    let t4 = player.blossom.points.add(1).pow(P.bloomExp).times(player.sap.points.add(1).pow(P.sapExp))
    let prod = t1.times(t2).times(t3).times(t4)
    if (hasUpgrade("grove", 13)) prod = prod.pow(1.1)            // grove u13: richer soil (visible)
    if (hasUpgrade("worldtree", 14)) prod = prod.times(1.5)        // Seed of Seeds
    let trees = prod.max(1).log10().pow(P.logExp).div(P.div).floor()
    return trees.max(0)
}

// Bilingual helper (T2, P17): window.chinesemode lives in mod.js; default English.
function tt(en, zh) { return window.chinesemode ? zh : en }

// Shared custom main-display override (07 Part F7: engine main-display hard-codes English).
// Returns a tabFormat entry; call as ...mdisp("wood") inside each layer's tabFormat.
// NOTE: reads layers[id] lazily INSIDE the render function — at addLayer() argument-evaluation
// time the layer is not registered yet (the smoke harness caught exactly that).
function mdisp(id) {
    return ["display-text", function () {
        let def = layers[id]
        let resDef = def.resource
        let res = typeof resDef === "function" ? resDef() : resDef
        let amt = player[id].points
        let line = tt("You have <b>" + format(amt) + "</b> " + res, "你有 <b>" + format(amt) + "</b> " + res)
        if (def.effect !== undefined) {
            let eff = tmp[id].effect
            if (eff !== undefined && eff.leafBoost !== undefined)
                line += tt("<br>which are boosting leaf growth by ", "<br>正在使树叶生长 ×") + format(eff.leafBoost)
        }
        return "<span style=\"font-size:20px;color:" + (def.color || "#ffffff") + "\">" + line + "</span>"
    }]
}
