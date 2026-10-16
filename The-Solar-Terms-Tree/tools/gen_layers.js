/* =============================================================================
 * gen_layers.js — BUILD-TIME emitter for 节气树 · 七十二候 (design-brief §4).
 *
 * WHY A GENERATOR AND NOT A RUNTIME FACTORY
 *   Engine fact F11 / checker rule N-FACTORY: every structural tool in this
 *   project (static_checks.js, smoke.js, the corpus indexer) resolves a layer by
 *   locating the `{` after addLayer("id", …). A layer built as
 *   addLayer("x", factory()) is an opaque shell to all of them, and the checker
 *   then silently approves an empty game. So the eight 节 layers share one SHAPE
 *   but are emitted as eight separate files of INLINED source — the sharing
 *   happens here, at build time, and is invisible in the shipped game.
 *
 * WHAT IT EMITS
 *   js/layers/lichun.js   lc  row 0  + M3 圭表测影 (3-tile shadow minigame)
 *   js/layers/chunfen.js  cf  row 1
 *   js/layers/almanac.js  al  row 1  + M8 shop, M10 七十二候 grid, M5 历筹
 *   js/layers/lixia.js    lx  row 2  + M4 开渠 clickable + 雨量 bar
 *   js/layers/xiazhi.js   xz  row 3
 *   js/layers/liqiu.js    lq  row 4
 *   js/layers/qiufen.js   qf  row 5  + M4 仓廪 bar
 *   js/layers/lidong.js   ld  row 6
 *   js/layers/dongzhi.js  dz  row 7  + M4 数九 clickable + bar (hard cap 81)
 *   js/layers/sui.js      sui row 8  + M2 hub (8 trials × 3) + M7 岁祭
 *   js/layers/side.js     a / n / o  (成就, 农书, 统计·设置)
 *   js/tree.js            the tree layout
 *
 *   Run: node tools/gen_layers.js
 *   Every number it writes comes from js/tuning.js (single source of truth, read
 *   by the game AND by tools/simulate.js — handbook 14 §3.3). The only literals
 *   emitted are `requires:` values, which D-REQLADDER can only read statically
 *   (checker: requiresNum resolves `new Decimal(<literal>)` only); the emitter
 *   asserts each one against TUNING.ROW_REQUIRES at build time so the two can
 *   never drift.
 * ========================================================================== */

"use strict"
const fs = require("fs")
const path = require("path")

const LAYERS_DIR = path.join(__dirname, "..", "js", "layers")
const JS_DIR = path.join(__dirname, "..", "js")

const TUNING = require(path.join(JS_DIR, "tuning.js"))

/* =============================================================================
 *  1. The 二十四节气 and their 七十二候 (月令七十二候集解)
 * ========================================================================== */
const TERMS = [
    { zh: "立春", en: "Spring Begins", hou: [
        ["东风解冻", "east wind thaws the ice"],
        ["蛰虫始振", "hibernating insects stir"],
        ["鱼陟负冰", "fish rise against the ice"]] },
    { zh: "雨水", en: "Rain Water", hou: [
        ["獭祭鱼", "otters lay out their catch"],
        ["候雁北", "wild geese head north"],
        ["草木萌动", "plants put out shoots"]] },
    { zh: "惊蛰", en: "Awakening of Insects", hou: [
        ["桃始华", "peach trees bloom"],
        ["仓庚鸣", "orioles sing"],
        ["鹰化为鸠", "hawks turn to doves"]] },
    { zh: "春分", en: "Spring Equinox", hou: [
        ["玄鸟至", "swallows return"],
        ["雷乃发声", "thunder sounds"],
        ["始电", "lightning begins"]] },
    { zh: "清明", en: "Pure Brightness", hou: [
        ["桐始华", "paulownia blooms"],
        ["田鼠化为鴽", "voles turn to quail"],
        ["虹始见", "the first rainbow"]] },
    { zh: "谷雨", en: "Grain Rain", hou: [
        ["萍始生", "duckweed grows"],
        ["鸣鸠拂其羽", "doves preen their wings"],
        ["戴胜降于桑", "hoopoes land on the mulberry"]] },
    { zh: "立夏", en: "Summer Begins", hou: [
        ["蝼蝈鸣", "mole crickets sing"],
        ["蚯蚓出", "earthworms emerge"],
        ["王瓜生", "snake gourds grow"]] },
    { zh: "小满", en: "Grain Buds", hou: [
        ["苦菜秀", "sow thistles flower"],
        ["靡草死", "delicate grasses wither"],
        ["麦秋至", "the wheat ripens"]] },
    { zh: "芒种", en: "Grain in Ear", hou: [
        ["螳螂生", "mantises hatch"],
        ["鵙始鸣", "shrikes begin to call"],
        ["反舌无声", "mockingbirds fall silent"]] },
    { zh: "夏至", en: "Summer Solstice", hou: [
        ["鹿角解", "deer shed their antlers"],
        ["蜩始鸣", "cicadas begin to sing"],
        ["半夏生", "pinellia sprouts"]] },
    { zh: "小暑", en: "Minor Heat", hou: [
        ["温风至", "warm winds arrive"],
        ["蟋蟀居宇", "crickets take to the walls"],
        ["鹰始鸷", "hawks begin to hunt"]] },
    { zh: "大暑", en: "Major Heat", hou: [
        ["腐草为萤", "rotten grass becomes fireflies"],
        ["土润溽暑", "the earth is damp and sultry"],
        ["大雨时行", "great rains fall"]] },
    { zh: "立秋", en: "Autumn Begins", hou: [
        ["凉风至", "cool winds arrive"],
        ["白露降", "white dew falls"],
        ["寒蝉鸣", "cicadas grow cold"]] },
    { zh: "处暑", en: "End of Heat", hou: [
        ["鹰乃祭鸟", "hawks lay out their prey"],
        ["天地始肃", "heaven and earth turn austere"],
        ["禾乃登", "the grain is harvested"]] },
    { zh: "白露", en: "White Dew", hou: [
        ["鸿雁来", "swan geese come"],
        ["玄鸟归", "swallows leave"],
        ["群鸟养羞", "birds store their food"]] },
    { zh: "秋分", en: "Autumn Equinox", hou: [
        ["雷始收声", "thunder ceases"],
        ["蛰虫坯户", "insects seal their burrows"],
        ["水始涸", "the waters dry"]] },
    { zh: "寒露", en: "Cold Dew", hou: [
        ["鸿雁来宾", "swan geese arrive as guests"],
        ["雀入大水为蛤", "sparrows turn to clams"],
        ["菊有黄华", "chrysanthemums bloom"]] },
    { zh: "霜降", en: "Frost Descent", hou: [
        ["豺乃祭兽", "jackals lay out their kill"],
        ["草木黄落", "plants yellow and fall"],
        ["蛰虫咸俯", "insects all bow down"]] },
    { zh: "立冬", en: "Winter Begins", hou: [
        ["水始冰", "water begins to freeze"],
        ["地始冻", "the ground begins to freeze"],
        ["雉入大水为蜃", "pheasants turn to clams"]] },
    { zh: "小雪", en: "Minor Snow", hou: [
        ["虹藏不见", "rainbows hide"],
        ["天气上升地气下降", "sky rises, earth sinks"],
        ["闭塞而成冬", "all closes into winter"]] },
    { zh: "大雪", en: "Major Snow", hou: [
        ["鹖鴠不鸣", "crows fall silent"],
        ["虎始交", "tigers begin to mate"],
        ["荔挺出", "rush grass sprouts"]] },
    { zh: "冬至", en: "Winter Solstice", hou: [
        ["蚯蚓结", "earthworms knot"],
        ["麋角解", "elks shed their antlers"],
        ["水泉动", "the springs begin to move"]] },
    { zh: "小寒", en: "Minor Cold", hou: [
        ["雁北乡", "wild geese head north"],
        ["鹊始巢", "magpies build their nests"],
        ["雉始雊", "pheasants begin to call"]] },
    { zh: "大寒", en: "Major Cold", hou: [
        ["鸡始乳", "hens begin to brood"],
        ["征鸟厉疾", "birds of prey circle swiftly"],
        ["水泽腹坚", "the ice hardens to its centre"]] },
]

/* =============================================================================
 *  2. The eight 节 — the spine. Each owns three consecutive solar terms, whose
 *     nine 候 become that node's nine upgrades (8 x 9 = 72).
 * ========================================================================== */
const NODES = [
    { id: "lc", file: "lichun.js", zh: "立春", en: "Spring Begins", color: "#7ED957",
      row: 0, pos: 0, req: "10", exp: "0.5", cap: "lc", mech: "gnomon",
      parent: null, child: "cf",
      resZh: "立春候", resEn: "Lichun Hou", baseZh: "日影", baseEn: "sun-shadow" },
    { id: "cf", file: "chunfen.js", zh: "春分", en: "Spring Equinox", color: "#3DDC97",
      row: 1, pos: 0, req: "250", exp: "1 / 3", cap: "cf", mech: null,
      parent: "lc", child: "lx",
      resZh: "春分候", resEn: "Chunfen Hou", baseZh: "立春候", baseEn: "Lichun Hou" },
    { id: "lx", file: "lixia.js", zh: "立夏", en: "Summer Begins", color: "#FFB74D",
      row: 2, pos: 0, req: "6250", exp: "1 / 3", cap: "lx", mech: "canal",
      parent: "cf", child: "xz",
      resZh: "立夏候", resEn: "Lixia Hou", baseZh: "春分候", baseEn: "Chunfen Hou" },
    { id: "xz", file: "xiazhi.js", zh: "夏至", en: "Summer Solstice", color: "#FF7043",
      row: 3, pos: 0, req: "1.5625e5", exp: "0.3", cap: "xz", mech: null,
      parent: "lx", child: "lq",
      resZh: "夏至候", resEn: "Xiazhi Hou", baseZh: "立夏候", baseEn: "Lixia Hou" },
    { id: "lq", file: "liqiu.js", zh: "立秋", en: "Autumn Begins", color: "#FFD54F",
      row: 4, pos: 0, req: "3.90625e6", exp: "0.3", cap: "lq", mech: null,
      parent: "xz", child: "qf",
      resZh: "立秋候", resEn: "Liqiu Hou", baseZh: "夏至候", baseEn: "Xiazhi Hou" },
    { id: "qf", file: "qiufen.js", zh: "秋分", en: "Autumn Equinox", color: "#F0B27A",
      row: 5, pos: 0, req: "9.765625e7", exp: "0.25", cap: "qf", mech: "granary",
      parent: "lq", child: "ld",
      resZh: "秋分候", resEn: "Qiufen Hou", baseZh: "立秋候", baseEn: "Liqiu Hou" },
    { id: "ld", file: "lidong.js", zh: "立冬", en: "Winter Begins", color: "#90CAF9",
      row: 6, pos: 0, req: "2.44140625e9", exp: "0.25", cap: "ld", mech: null,
      parent: "qf", child: "dz",
      resZh: "立冬候", resEn: "Lidong Hou", baseZh: "秋分候", baseEn: "Qiufen Hou" },
    { id: "dz", file: "dongzhi.js", zh: "冬至", en: "Winter Solstice", color: "#64B5F6",
      row: 7, pos: 0, req: "6.103515625e10", exp: "0.22", cap: "dz", mech: "nine",
      parent: "ld", child: "sui",
      resZh: "冬至候", resEn: "Dongzhi Hou", baseZh: "立冬候", baseEn: "Lidong Hou" },
]

/* The 历 (almanac) sits in row 1 next to 春分 — the calendar is printed from the
 * first 立春, not from the equinox, so its `requires` (500) is its own. */
const AL = { id: "al", row: 1, pos: 1, req: "500", exp: "1 / 3", color: "#C792EA" }
const SUI = { id: "sui", row: 8, pos: 0, req: "1.52587890625e12", color: "#FF6F91" }

/* ---- build-time assertions (the emitter may not disagree with tuning.js) ---- */
function check(cond, msg) { if (!cond) { console.error("GEN ERROR: " + msg); process.exit(1) } }
NODES.forEach((n, i) => {
    check(Number(n.req) === TUNING.ROW_REQUIRES[n.row],
        "node " + n.id + " requires " + n.req + " but TUNING.ROW_REQUIRES[" + n.row + "] is " + TUNING.ROW_REQUIRES[n.row])
})
check(Number(AL.req) === TUNING.ALMANAC_REQUIRES, "almanac requires disagrees with TUNING.ALMANAC_REQUIRES")
check(Number(SUI.req) === TUNING.SUI_REQUIRES, "sui requires disagrees with TUNING.SUI_REQUIRES")
check(TERMS.length === 24, "TERMS must be the 24 solar terms")

/* =============================================================================
 *  3. Emit helpers
 * ========================================================================== */
const UPG_COLS = [11, 12, 13, 14, 15, 21, 22, 23, 24, 25]

/* the nine 候 of a node, in slot order (11,12,13,14,15,21,22,23,24) */
function houOf(i) {
    const out = []
    for (let t = 0; t < 3; t++) for (let h = 0; h < 3; h++) out.push(TERMS[i * 3 + t].hou[h])
    return out
}
/* the three solar terms a node owns */
function termsOf(i) { return [TERMS[i * 3], TERMS[i * 3 + 1], TERMS[i * 3 + 2]] }

/* The tree edges, declared on the LAYER (canvas.js:31 reads tmp[layer].branches).
 * They cannot live in tree.js: the engine's addNode() is `layers[id] = data`
 * (layerSupport.js:239-242), so an addNode("lc", …) would REPLACE the whole layer
 * definition with a node stub — which is exactly the bug the browser found on
 * 2026-10-17 (every layer came back type "none" with no startData). */
function branchesOf(id) {
    const out = []
    const n = NODES.find((x) => x.id === id)
    if (n && n.child) out.push(n.child)
    if (id === "lc") out.push("al")   // 历 branches off 立春, beside 春分
    return out
}

function q(s) { return JSON.stringify(s) }
/* L() emits `L(<zh>, <en>)` into the layer file.
 *
 * Two kinds of argument appear in this generator:
 *   · plain text ("立春候")                       -> JSON-quoted, so quotes survive
 *   · an emitted JS expression ("已购 " + x + " 次") -> passed through VERBATIM
 * The distinction is structural, not cosmetic: a JSON-quoted expression would
 * emit a literal string containing the text `" + x + "` — a layer that displays
 * its own formula instead of the value. Anything containing `" +` or `+ "` is
 * an expression, and then its two ends are repaired to be a valid expression:
 * literal text at the front needs its opening quote, and a fragment that ends
 * inside a literal needs its closing one. The trailing repair only fires when
 * the fragment really is mid-literal — `... + (x + 1)` ends on an expression and
 * must not collect a stray quote. */
function L(zh, en) {
    const arg = (s) => {
        if (!/"\s*\+|\+\s*"/.test(s)) return q(s)
        let out = s
        if (!/^("|\(|[A-Za-z_$][\w$]*\()/.test(out)) out = '"' + out
        let inStr = false
        for (let i = 0; i < out.length; i++) {
            if (out[i] === "\\") { i++; continue }
            if (out[i] === '"') inStr = !inStr
        }
        if (inStr) out = out + '"'
        return out
    }
    return 'L(' + arg(zh) + ', ' + arg(en) + ')'
}
function F(body, args) { return 'function(' + (args || '') + ') { ' + body + ' }' }

function banner(title, lines) {
    const out = ['/* =========================================================================']
    out.push(' *  ' + title)
    lines.forEach((l) => out.push(' *' + (l ? '  ' + l : '')))
    out.push(' * ========================================================================= */')
    return out.join('\n')
}

function write(file, src) {
    fs.writeFileSync(path.join(LAYERS_DIR, file), src.replace(/\r\n/g, '\n'), 'utf8')
    console.log('  wrote js/layers/' + file + '  (' + src.split('\n').length + ' lines)')
}

/* =============================================================================
 *  4. The shared 节 shape — the nine 候 slots (design-brief §4.1).
 *
 *  slot  kind  what it is                                    read by
 *  11    K1    flat x2                                        own gainMult
 *  12    K1    flat x3                                        own gainMult
 *  13    K2    self-shape  (points+1)^0.5, softcapped         own gainMult
 *  14    K2    log-shape   log10(points+10)+1                 own gainMult
 *  15    K3    cross-resource: sources the PARENT's currency  the parent's gainMult
 *  21    K6    conditional on the parent's ninth-pentad stone  own gainMult
 *  22    K5    raises this node's softcap                     the layer's softcap()
 *  23    K2    add-shape   (points/1e4+1)^0.25                own gainMult
 *  24    K4    meta on the node's 候簿 buyable (named)        the buyable's effect()
 *  25    K7    unlock ticket for the 候簿 subtab              the buyable's unlocked()
 * ========================================================================== */
function upgradeBlock(n, i) {
    const hou = houOf(i)
    const c = TUNING.UPG_COSTS
    const parent = n.parent
    const parZh = parent ? NODES[NODES.findIndex((x) => x.id === parent)].zh : "日影"
    const parEn = parent ? NODES[NODES.findIndex((x) => x.id === parent)].en : "sun-shadow"
    const parentCapZh = parent ? (NODES[NODES.findIndex((x) => x.id === parent)].resZh) : "日影"
    const parentCapEn = parent ? (NODES[NODES.findIndex((x) => x.id === parent)].resEn) : "sun-shadow"

    const u = []
    u.push('	upgrades: {')

    /* --- 11: K1 flat --- */
    u.push('		11: {')
    u.push('			title: function() { return ' + L(hou[0][0], hou[0][1]) + ' },')
    u.push('			description: function() { return ' + L('本节候产与日影产出 ×" + TUNING.UPG_MULT[11] + "。',
        'This node\'s 候 output and the sun-shadow output x" + TUNING.UPG_MULT[11] + ".') + ' },')
    u.push('			cost: new Decimal(' + c[11] + '),')
    u.push('			effect() { return new Decimal(TUNING.UPG_MULT[11]) },')
    u.push('			effectDisplay() { return "×" + format(this.effect()) },')
    u.push('		},')

    /* --- 12: K1 flat --- */
    u.push('		12: {')
    u.push('			title: function() { return ' + L(hou[1][0], hou[1][1]) + ' },')
    u.push('			description: function() { return ' + L('本节的候产 ×" + TUNING.UPG_MULT[12] + "。',
        'This node\'s 候 output x" + TUNING.UPG_MULT[12] + ".') + ' },')
    u.push('			cost: new Decimal(' + c[12] + '),')
    u.push('			effect() { return new Decimal(TUNING.UPG_MULT[12]) },')
    u.push('			effectDisplay() { return "×" + format(this.effect()) },')
    u.push('		},')

    /* --- 13: K2 self-shape (the one self-loop zone; hard-capped) --- */
    u.push('		13: {')
    u.push('			title: function() { return ' + L(hou[2][0], hou[2][1]) + ' },')
    u.push('			description: function() { return ' + L('本节之候自养：影愈长，察愈明 —— 本节候产 ×(候+1)^" + TUNING.SELF.SQRT_EXP + "，上限 ×" + TUNING.SELF.SQRT_CAP + "。',
        'The pentads feed on themselves: x (候+1)^" + TUNING.SELF.SQRT_EXP + ", capped at x" + TUNING.SELF.SQRT_CAP + ".') + ' },')
    u.push('			cost: new Decimal(' + c[13] + '),')
    u.push('			effect() {')
    u.push('				let v = player["' + n.id + '"].points.add(1).pow(TUNING.SELF.SQRT_EXP)')
    u.push('				if (v.gt(TUNING.SELF.SQRT_CAP)) v = v.div(TUNING.SELF.SQRT_CAP).pow(0.4).times(TUNING.SELF.SQRT_CAP)')
    u.push('				return v')
    u.push('			},')
    u.push('			effectDisplay() { return "×" + format(this.effect()) },')
    u.push('		},')

    /* --- 14: K2 log-shape --- */
    u.push('		14: {')
    u.push('			title: function() { return ' + L(hou[3][0], hou[3][1]) + ' },')
    u.push('			description: function() { return ' + L('积候成数：本节候产 ×(log10(候+10)/" + TUNING.SELF.LOG_DIV + "+1)。',
        'Pentads accumulate: x (log10(候+10)/" + TUNING.SELF.LOG_DIV + "+1).') + ' },')
    u.push('			cost: new Decimal(' + c[14] + '),')
    u.push('			effect() { return player["' + n.id + '"].points.add(10).log(10).div(TUNING.SELF.LOG_DIV).add(1) },')
    u.push('			effectDisplay() { return "×" + format(this.effect()) },')
    u.push('		},')

    /* --- 15: K3 cross-resource, consumed by the PARENT's gainMult --- */
    u.push('		15: {')
    u.push('			title: function() { return ' + L(hou[4][0], hou[4][1]) + ' },')
    if (parent) {
        u.push('			description: function() { return ' + L('候及上节：' + parZh + ' 的候产 ×(log10(' + parentCapZh + '+1)+1)。',
            "The pentad reaches the 节 above: " + parEn + "'s output x (log10(" + parentCapEn + "+1)+1).") + ' },')
        u.push('			cost: new Decimal(' + c[15] + '),')
        u.push('			effect() { return player["' + parent + '"].points.add(1).log(10).add(1) },')
    } else {
        /* 立春 is row 0: its "parent currency" is 日影 itself, and the consumer
         * is getPointGen() in mod.js (the base is the layer-less layer). */
        u.push('			description: function() { return ' + L('候及日影：日影产出 ×(log10(日影+1)+1)。',
            'The pentad reaches the sun-shadow itself: 日影 output x (log10(日影+1)+1).') + ' },')
        u.push('			cost: new Decimal(' + c[15] + '),')
        u.push('			effect() { return player.points.add(1).log(10).add(1) },')
    }
    u.push('			effectDisplay() { return "×" + format(this.effect()) },')
    u.push('		},')

    /* --- 21: K6 conditional on the parent's ninth stone --- */
    u.push('		21: {')
    u.push('			title: function() { return ' + L(hou[5][0], hou[5][1]) + ' },')
    if (parent) {
        u.push('			description: function() { return ' + L(parZh + '九候既察之后，本节候产 ×2。',
            'Once ' + parEn + "'s nine pentads are all observed, this node's output x2.") + ' },')
        u.push('			cost: new Decimal(' + c[21] + '),')
        u.push('			effect() {')
        u.push('				if (hasMilestone("' + parent + '", 3)) return new Decimal(2)')
        u.push('				return new Decimal(1)')
        u.push('			},')
    } else {
        u.push('			description: function() { return ' + L('历书既开（历 · 碑一）之后，本节候产 ×2。',
            "Once the almanac is opened (历 stele 1), this node's output x2.") + ' },')
        u.push('			cost: new Decimal(' + c[21] + '),')
        u.push('			effect() {')
        u.push('				if (hasMilestone("al", 0)) return new Decimal(2)')
        u.push('				return new Decimal(1)')
        u.push('			},')
    }
    u.push('			effectDisplay() { return "×" + format(this.effect()) },')
    u.push('		},')

    /* --- 22: K5 cap play (never wired into getPointGen — N-CAPMULT) --- */
    u.push('		22: {')
    u.push('			title: function() { return ' + L(hou[6][0], hou[6][1]) + ' },')
    u.push('			description: function() { return ' + L('本节的软上限 ×1000（上限显示在本页顶）。',
        "This node's softcap x1000 (shown at the top of its tab).") + ' },')
    u.push('			cost: new Decimal(' + c[22] + '),')
    u.push('			unlocked() { return player["' + n.id + '"].best.gte(120) },')
    u.push('		},')

    /* --- 23: K2 add-shape (log-flattened, so it cannot runaway with the bank) --- */
    u.push('		23: {')
    u.push('			title: function() { return ' + L(hou[7][0], hou[7][1]) + ' },')
    u.push('			description: function() { return ' + L('候积成算：本节候产 ×(log10(候/" + TUNING.SELF.ADD_DIV + "+1)+1)^" + TUNING.SELF.ADD_EXP + "。',
        'Pentads into reckoning: x (log10(候/" + TUNING.SELF.ADD_DIV + "+1)+1)^" + TUNING.SELF.ADD_EXP + ".') + ' },')
    u.push('			cost: new Decimal(' + c[23] + '),')
    u.push('			effect() { return player["' + n.id + '"].points.div(TUNING.SELF.ADD_DIV).add(1).log(10).add(1).pow(TUNING.SELF.ADD_EXP) },')
    u.push('			effectDisplay() { return "×" + format(this.effect()) },')
    u.push('		},')

    /* --- 24: K4 meta on the named 候簿 buyable --- */
    u.push('		24: {')
    u.push('			title: function() { return ' + L(hou[8][0], hou[8][1]) + ' },')
    u.push('			description: function() { return ' + L('候簿之数更精：本节候簿的效果指数改为 ^1 ~ ^1.1（随本节历代之最而长）。',
        "The ledger reads finer: its effect exponent becomes ^1 .. ^1.1, growing with this node's lifetime best.") + ' },')
    u.push('			cost: new Decimal(' + c[24] + '),')
    u.push('			effect() {')
    u.push('				return new Decimal(1).add(player["' + n.id + '"].best.add(1).log(10).div(20)).min(1.1)')
    u.push('			},')
    u.push('			effectDisplay() { return "候簿效果 ^" + format(this.effect()) },')
    u.push('		},')

    /* --- 25: K7 unlock ticket for the 候簿 buyable subtab --- */
    u.push('		25: {')
    u.push('			title: function() { return ' + L(hou[8][0] + "·候簿", hou[8][1] + " · Ledger") + ' },')
    u.push('			description: function() { return ' + L('开启本节的候簿（buyable 页）：以本节之候买断九候之数。',
        "Unlock this node's pentad ledger (a buyable): spend this node's 候 to bank its nine pentads.") + ' },')
    u.push('			cost: new Decimal(' + c[25] + '),')
    u.push('			unlocked() { return player["' + n.id + '"].best.gte(200) },')
    u.push('		},')

    u.push('	},')
    return u.join('\n')
}

function buyableBlock(n, i) {
    return [
        '	buyables: {',
        '		11: {',
        '			title: function() { return ' + L('候簿', 'Pentad Ledger') + ' },',
        '			display() {',
        '				let amt = getBuyableAmount("' + n.id + '", 11)',
        '				let eff = buyableEffect("' + n.id + '", 11)',
        '				let cost = this.cost()',
        '				return ' + L('已录 <b>" + formatWhole(amt) + "</b> 候<br>本节候产 ×<b>" + format(eff) + "</b><br>下一笔 <b>" + format(cost) + "</b> 候',
            'recorded <b>" + formatWhole(amt) + "</b> pentads<br>this node\'s output x<b>" + format(eff) + "</b><br>next <b>" + format(cost) + "</b> 候') + '',
        '			},',
        '			cost(amount) { return new Decimal(TUNING.BUY_COST_BASE).times(Decimal.pow(TUNING.BUY_COST_MULT, amount)) },',
        '			effect(amount) {',
        '				let ret = new Decimal(TUNING.BUY_EFFECT_MULT).pow(amount)',
        '				if (hasUpgrade("' + n.id + '", 24)) ret = ret.pow(upgradeEffect("' + n.id + '", 24))',
        '				return ret',
        '			},',
        '			unlocked() { return hasUpgrade("' + n.id + '", 25) },',
        '			canAfford() { return player["' + n.id + '"].points.gte(this.cost()) },',
        '			buy() {',
        '				player["' + n.id + '"].points = player["' + n.id + '"].points.sub(this.cost())',
        '				setBuyableAmount("' + n.id + '", 11, getBuyableAmount("' + n.id + '", 11).add(1))',
        '			},',
        '			buyMax() {',
        '				let n = 0',
        '				while (this.canAfford() && n < 50) { this.buy(); n++ }',
        '			},',
        '		},',
        '	},',
    ].join('\n')
}

/* milestone ids 0..3 are the four stones of a 节 */
function milestoneBlock(n, i) {
    const next = n.child
    const nextZh = next === "sui" ? "岁" : (next ? NODES[NODES.findIndex((x) => x.id === next)].zh : "—")
    const nextEn = next === "sui" ? "the Year" : (next ? NODES[NODES.findIndex((x) => x.id === next)].en : "—")
    return [
        '	milestones: {',
        '		0: {',
        '			requirementDescription: function() { return ' + L(n.resZh + ' ≥ 1', '1 ' + n.resEn) + ' },',
        '			effectDescription: function() { return ' + L('本节候产 ×1.5；已察之候交节不失。',
            "This node's output x1.5; observed pentads are never lost to a reset.") + ' },',
        '			done() { return player["' + n.id + '"].best.gte(1) },',
        '		},',
        '		1: {',
        '			requirementDescription: function() { return ' + L(n.resZh + ' ≥ 8', '8 ' + n.resEn) + ' },',
        '			effectDescription: function() { return ' + L('交节自行 —— 本节每秒自交一次。',
            'The season turns by itself — this node prestiges once a second.') + ' },',
        '			done() { return player["' + n.id + '"].best.gte(8) },',
        '		},',
        '		2: {',
        '			requirementDescription: function() { return ' + L(n.resZh + ' ≥ 40', '40 ' + n.resEn) + ' },',
        '			effectDescription: function() { return ' + L('本节之候自购（可买即买）。',
            "This node's 候 buy themselves whenever they are affordable.") + ' },',
        '			done() { return player["' + n.id + '"].best.gte(40) },',
        '		},',
        '		3: {',
        '			requirementDescription: function() { return ' + L('本节九候尽察', 'All nine pentads of this 节') + ' },',
        '			effectDescription: function() { return ' + L('日影 ×3；' + nextZh + ' 得此节之授（' + nextZh + ' 的候产 ×10）。',
            'Sun-shadow x3; ' + nextEn + ' receives this teaching (' + nextEn + "'s output x10).") + ' },',
        '			done() { return houOwned("' + n.id + '") >= 9 },',
        '		},',
        '	},',
    ].join('\n')
}

function gainMultBlock(n, i) {
    const parent = n.parent
    const child = n.child
    const lines = []
    lines.push('	gainMult() {')
    lines.push('		let ret = new Decimal(1)')
    lines.push('		if (hasUpgrade("' + n.id + '", 11)) ret = ret.times(upgradeEffect("' + n.id + '", 11))')
    lines.push('		if (hasUpgrade("' + n.id + '", 12)) ret = ret.times(upgradeEffect("' + n.id + '", 12))')
    lines.push('		if (hasUpgrade("' + n.id + '", 13)) ret = ret.times(upgradeEffect("' + n.id + '", 13))')
    lines.push('		if (hasUpgrade("' + n.id + '", 14)) ret = ret.times(upgradeEffect("' + n.id + '", 14))')
    lines.push('		if (hasUpgrade("' + n.id + '", 21)) ret = ret.times(upgradeEffect("' + n.id + '", 21))')
    lines.push('		if (hasUpgrade("' + n.id + '", 23)) ret = ret.times(upgradeEffect("' + n.id + '", 23))')
    lines.push('		if (hasUpgrade("' + n.id + '", 25)) ret = ret.times(buyableEffect("' + n.id + '", 11))')
    lines.push('		if (hasMilestone("' + n.id + '", 0)) ret = ret.times(1.5)')
    /* the almanac's meta on the named 候 currencies (M8 shop) */
    lines.push('		if (hasUpgrade("al", 12)) ret = ret.times(upgradeEffect("al", 12))')
    lines.push('		if (getBuyableAmount("al", 12).gt(0)) ret = ret.times(buyableEffect("al", 12))')
    /* the parent 节 hands its understanding down: this node's own currency is
     * the parent's `baseAmount`, so a bonus here IS a bonus to the parent's era */
    if (parent) {
        lines.push('		if (hasMilestone("' + parent + '", 3)) ret = ret.times(3)')
    }
    /* the child 节 hands its understanding back (OUTPUT_STEP x20 per era) */
    if (child && child !== "sui") {
        lines.push('		if (hasMilestone("' + child + '", 3)) ret = ret.times(10)')
        lines.push('		if (hasUpgrade("' + child + '", 15)) ret = ret.times(upgradeEffect("' + child + '", 15))')
    }
    /* the base measurement itself — the first layer stays live at the endgame.
     * BASE_LOG_DIV keeps this term from compounding with the root currency: it
     * is the last multiplier in the loop 日影 -> 候 -> upgrades -> 日影/s. */
    lines.push('		ret = ret.times(player.points.add(1).log(10).div(TUNING.SELF.BASE_LOG_DIV).add(1).pow(0.5))')
    /* 八节试 (M2): inside a trial the whole tree is nerfed, so the rebuild is the game */
    lines.push('		ret = ret.times(suiTrialMult())')
    lines.push('		return ret')
    lines.push('	},')
    return lines.join('\n')
}

function softcapBlock(n, i) {
    return [
        '	softcap() {',
        '		let cap = new Decimal(TUNING.SOFTCAP.' + n.cap + ')',
        '		if (hasUpgrade("' + n.id + '", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)',
        '		if (hasUpgrade("al", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)',
        '		return cap',
        '	},',
        '	softcapPower: TUNING.SOFTCAP_POWER,',
    ].join('\n')
}

function capLine(n, i) {
    return [
        '		["display-text", function() {',
        '			let cap = new Decimal(TUNING.SOFTCAP.' + n.cap + ')',
        '			if (hasUpgrade("' + n.id + '", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)',
        '			if (hasUpgrade("al", 22)) cap = cap.times(TUNING.SOFTCAP_RAISE)',
        '			return ' + L('本节软上限 <b>" + format(cap) + "</b>（越此按 ^" + TUNING.SOFTCAP_POWER + " 计）',
            'softcap <b>" + format(cap) + "</b> (above it, ^" + TUNING.SOFTCAP_POWER + ")') + '',
        '		}],',
    ].join('\n')
}

function baseLayerHead(n, i) {
    const terms = termsOf(i)
    const hou = houOf(i)
    const parentNode = n.parent ? NODES[NODES.findIndex((x) => x.id === n.parent)] : null
    const shownGate = parentNode
        ? 'player["' + parentNode.id + '"].best.gte(' + Math.floor(Number(parentNode.req) / 2) + ')'
        : 'true'
    return [
        'addLayer("' + n.id + '", {',
        '	name: function() { return ' + L(n.zh, n.en) + ' },',
        '	symbol: function() { return ' + L(n.zh, n.id.toUpperCase()) + ' },',
        '	position: ' + n.pos + ',',
        '	row: ' + n.row + ',',
        ...(branchesOf(n.id).length ? ['	branches: ' + JSON.stringify(branchesOf(n.id)) + ','] : []),
        '	startData() { return {',
        '		unlocked: ' + (n.row === 0 ? 'true' : 'false') + ',',
        '		points: new Decimal(0),',
        '		best: new Decimal(0),',
        '		total: new Decimal(0),',
        mechState(n),
        '	}},',
        '	color: "' + n.color + '",',
        '	resource: function() { return ' + L(n.resZh, n.resEn) + ' },',
        '	baseResource: function() { return ' + L(n.baseZh, n.baseEn) + ' },',
        '	baseAmount() { return player.' + (parentNode ? parentNode.id + '.points' : 'points') + ' },',
        '	requires: new Decimal(' + n.req + '),',
        '	type: "normal",',
        '	exponent: ' + n.exp + ',',
        softcapBlock(n, i),
        gainMultBlock(n, i),
        '	gainExp() { return new Decimal(1) },',
        '	passiveGeneration() {',
        '		if (hasMilestone("' + n.id + '", 1) || hasMilestone("sui", 3)) return 1',
        '		return 0',
        '	},',
        '	autoUpgrade() {',
        '		if (hasMilestone("' + n.id + '", 2) || hasMilestone("sui", 3)) return true',
        '		return false',
        '	},',
        '	resetsNothing() {',
        '		if (hasMilestone("sui", 3)) return true',
        '		return false',
        '	},',
        '	layerShown() { return player["' + n.id + '"].unlocked || ' + shownGate + ' },',
        '	prestigeButtonText() {',
        '		return ' + L('交节得 <b>" + formatWhole(tmp["' + n.id + '"].resetGain) + "</b> " + tmp["' + n.id + '"].resource',
            'Turn the season for <b>" + formatWhole(tmp["' + n.id + '"].resetGain) + "</b> " + tmp["' + n.id + '"].resource') + ' +',
        '			(player["' + n.id + '"].points.lt(100) ? "<br><br>" + ' + L('下一候需 " + format(tmp["' + n.id + '"].nextAt) + " ' + n.baseZh + '"',
            '"Next at " + format(tmp["' + n.id + '"].nextAt) + " ' + n.baseEn + '"') + ' : "")',
        '	},',
        '	doReset(resettingLayer) {',
        '		// P9 — STRICTLY deeper only. The engine grants the 交节 gain with addPoints()',
        '		// BEFORE rowReset(row…0) walks back down and calls this hook, so a `>=` test',
        '		// (or an explicit self-match) rebuilds the layer from startData right after',
        '		// the grant and silently throws the 候 away: best climbs, points stay 0, and',
        '		// nothing is ever affordable. The 候 are a bank: a deeper 节 wipes them, the',
        '		// layer\'s own 交节 only adds to them.',
        '		if (layers[resettingLayer].row > this.row) {',
        '			layerDataReset("' + n.id + '", ["unlocked", "best", "total", "upgrades", "milestones"])',
        '		}',
        '	},',
    ].join('\n')
}

/* per-node mechanic state + file-scope mutators */
function mechState(n) {
    if (n.mech === "gnomon") {
        return [
            '		shadowSeed: 1,          // which reading the tiles show (numbers, never Decimals — hard rule 11)',
            '		shadowStreak: 0,',
            '		shadowBest: 0,',
            '		shadowPicks: 0,',
        ].join('\n')
    }
    if (n.mech === "canal") {
        return [
            '		rain: 0,                // 雨量 0..100, a plain number (M4)',
            '		canals: 0,              // 开渠 count',
        ].join('\n')
    }
    if (n.mech === "granary") {
        return [
            '		grain: 0,               // 仓廪 0..100',
            '		harvests: 0,',
        ].join('\n')
    }
    if (n.mech === "nine") {
        return [
            '		nine: 0,                // 数九 0..81 (hard cap — the theme\'s own number)',
            '		nineCool: 0,',
            '		nineDone: 0,',
        ].join('\n')
    }
    return ''
}

/* =============================================================================
 *  5. The 节 file
 * ========================================================================== */
function emitNode(n, i) {
    const hou = houOf(i)
    const terms = termsOf(i)
    const head = banner(
        n.zh + ' / ' + n.id + '  —  row ' + n.row + ', the ' + ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'][i] + ' 节 of the year.',
        [terms[0].zh + ' · ' + terms[1].zh + ' · ' + terms[2].zh + '  —  its nine pentads are this node\'s upgrades:',
         hou.map((h) => h[0]).join(' / '),
         '',
         'FILE-SCOPE RULE: the engine re-runs every function that lives INSIDE `layers` on each',
         'temp refresh (~20x/sec) to fill tmp, so anything that MUTATES player state lives out here',
         'instead. That is also why doNotCallTheseFunctionsEveryTick stays empty in mod.js — none',
         'of the mutators below are layer properties at all.'])
    const parts = [head, '']
    parts.push(mechCode(n, i))
    parts.push(baseLayerHead(n, i))
    parts.push(upgradeBlock(n, i))
    parts.push(milestoneBlock(n, i))
    parts.push(buyableBlock(n, i))
    parts.push(mechComponents(n, i))
    parts.push(tabBlock(n, i))
    parts.push('})')
    parts.push('')
    return parts.filter((p) => p !== null).join('\n')
}

function mechCode(n, i) {
    if (n.mech === "gnomon") {
        return [
            '/* ---- 圭表测影 (M3) — the core verb of the whole game -----------------------',
            ' *  A gnomon casts a shadow; the almanac says how long it should be today.',
            ' *  Three tiles show three readings — one of them is the day\'s true length.',
            ' *  A correct reading extends the streak (连中之数), which sharpens 日影',
            ' *  production in mod.js\'s getPointGen(); a wrong one zeroes it. The tiles',
            ' *  move on after every pick, so the answer cannot be brute-forced.',
            ' * ----------------------------------------------------------------------- */',
            'function lcShadowSeed() { return player.lc.shadowSeed }',
            'function lcShadowTarget() { return 10 + (lcShadowSeed() % 9) }',
            'function lcShadowReading(tile) {',
            '	let s = lcShadowSeed()',
            '	let perm = [s % 3, (s + 1) % 3, (s + 2) % 3]   // a rotation: always a permutation',
            '	return lcShadowTarget() + perm[tile - 1]',
            '}',
            'function lcShadowTruth() {',
            '	for (let t = 1; t <= 3; t++) if (lcShadowReading(t) === lcShadowTarget()) return t',
            '	return 1',
            '}',
            'function lcShadowRead(tile) {',
            '	if (!player.lc.unlocked) return',
            '	if (tile === lcShadowTruth()) {',
            '		player.lc.shadowStreak = Math.min(player.lc.shadowStreak + 1, TUNING.SHADOW_STREAK_CAP)',
            '		if (player.lc.shadowStreak > player.lc.shadowBest) player.lc.shadowBest = player.lc.shadowStreak',
            '		player.points = player.points.add(new Decimal(TUNING.SHADOW_CLICK_SHADOW).times(player.lc.shadowStreak))',
            '	} else {',
            '		player.lc.shadowStreak = 0',
            '	}',
            '	player.lc.shadowPicks++',
            '	player.lc.shadowSeed++      // a new reading: the tiles move on',
            '}',
            'function lcShadowLine() {',
            '	let s = player.lc.shadowStreak',
            '	let out = ' + L('日中影长当为 <b>" + lcShadowTarget() + "</b> 寸　·　连中 <b>" + s + "</b> 次（每中 +" + Math.round(TUNING.SHADOW_BONUS * 100) + "% 日影，至多 " + TUNING.SHADOW_STREAK_CAP + " 次）',
                'Today\'s shadow should be <b>" + lcShadowTarget() + "</b> cun · streak <b>" + s + "</b> (each +" + Math.round(TUNING.SHADOW_BONUS * 100) + "% 日影, up to " + TUNING.SHADOW_STREAK_CAP + ")') + '',
            '	if (s === 0 && player.lc.shadowPicks > 0) out += ' + L("　<span style=\'color:#ff8a80\'>影已失，连中断。</span>", " <span style=\'color:#ff8a80\'>the reading is lost; the streak is broken.</span>"),
            '	return out',
            '}',
        ].join('\n')
    }
    if (n.mech === "canal") {
        return [
            '/* ---- 开渠 + 雨量 (M4) ---------------------------------------------------',
            ' *  雨量 (the rain gauge) fills on its own; when it reaches 100 the canal can',
            ' *  be opened, cashing the rain in for 立夏候. The bar is the clock, the',
            ' *  clickable is the decision — and the node\'s ninth stone makes the rain',
            ' *  fall faster.',
            ' * ----------------------------------------------------------------------- */',
            'function lxCanalReady() { return player.lx.rain >= 100 }',
            'function lxOpenCanal() {',
            '	if (!player.lx.unlocked || !lxCanalReady()) return',
            '	player.lx.rain = 0',
            '	player.lx.canals++',
            '	let gain = new Decimal(TUNING.RAIN_REWARD).times(lxRainMult())',
            '	addPoints("lx", gain)',
            '}',
            'function lxRainMult() {',
            '	let ret = new Decimal(1)',
            '	if (hasMilestone("lx", 3)) ret = ret.times(2)      // 九候既察: the rain falls twice as fast',
            '	if (hasMilestone("lx", 0)) ret = ret.times(1.5)',
            '	return ret',
            '}',
            'function lxRainTime() { return TUNING.RAIN_TIME / lxRainMult().toNumber() }',
        ].join('\n')
    }
    if (n.mech === "granary") {
        return [
            '/* ---- 仓廪 (M4) ---------------------------------------------------------',
            ' *  仓廪 fills on its own and cashes itself in at 100 — the harvest is not a',
            ' *  decision here, it is a rhythm. 秋分 is the equinox of the harvest, so this',
            ' *  node\'s bar is the one that pays without being asked.',
            ' * ----------------------------------------------------------------------- */',
            'function qfGranaryMult() {',
            '	let ret = new Decimal(1)',
            '	if (hasMilestone("qf", 3)) ret = ret.times(2)',
            '	if (hasMilestone("qf", 0)) ret = ret.times(1.5)',
            '	return ret',
            '}',
            'function qfGranaryTime() { return TUNING.GRANARY_TIME / qfGranaryMult().toNumber() }',
        ].join('\n')
    }
    if (n.mech === "nine") {
        return [
            '/* ---- 数九 (M4, hard cap 81) --------------------------------------------',
            ' *  冬至一阳生: from the solstice the days are counted in nines, nine nines',
            ' *  to a full 九九 (81 days). One count per cooldown, and 81 is the ceiling —',
            ' *  the theme\'s own number, not an invented one. A completed 九九 warms the',
            ' *  whole year (mod.js\'s getPointGen reads player.dz.nine).',
            ' * ----------------------------------------------------------------------- */',
            'function dzNineReady() { return player.dz.nine < TUNING.NINE_NINE_MAX && player.dz.nineCool <= 0 }',
            'function dzCountNine() {',
            '	if (!player.dz.unlocked || !dzNineReady()) return',
            '	player.dz.nine++',
            '	player.dz.nineCool = TUNING.NINE_NINE_TICK',
            '	if (player.dz.nine >= TUNING.NINE_NINE_MAX) {',
            '		player.dz.nineDone++',
            '		addPoints("dz", new Decimal(9).times(9))',
            '	}',
            '}',
            'function dzNineCoolTime() { return TUNING.NINE_NINE_TICK }',
        ].join('\n')
    }
    return null
}

function mechComponents(n, i) {
    if (n.mech === "gnomon") {
        const tile = (t) => [
            '		' + (10 + t) + ': {',
            '			title: function() { return ' + L(['一候', '二候', '三候'][t - 1], ['First', 'Second', 'Third'][t - 1]) + ' },',
            '			display() {',
            '				return ' + L('影长 <b>" + lcShadowReading(' + t + ') + "</b> 寸',
                'shadow <b>" + lcShadowReading(' + t + ') + "</b> cun') + '',
            '			},',
            '			canClick() { return player.lc.unlocked },',
            '			onClick() { lcShadowRead(' + t + ') },',
            '			style() {',
            '				let s = player.lc.shadowStreak',
            '				return { "border-color": s > 0 ? "#7ED957" : "#666666", "width": "150px", "height": "70px" }',
            '			},',
            '		},',
        ].join('\n')
        return [
            '	clickables: {',
            tile(1), tile(2), tile(3),
            '	},',
            '',
            '	update(diff) {',
            '		// the gnomon needs no tick — the tiles are the tick. Kept explicit so the',
            '		// M3 minigame is visible to the harness as a tick-driven layer.',
            '		if (player.lc.shadowPicks < 0) player.lc.shadowPicks = 0',
            '	},',
        ].join('\n')
    }
    if (n.mech === "canal") {
        return [
            '	clickables: {',
            '		11: {',
            '			title: function() { return ' + L('开渠', 'Open the canal') + ' },',
            '			display() {',
            '				if (!lxCanalReady()) return ' + L('雨未满 —— 待雨 <b>" + format(player.lx.rain, 1) + "</b> / 100',
                'not yet — rain <b>" + format(player.lx.rain, 1) + "</b> / 100') + '',
            '			return ' + L('开渠得 <b>" + format(new Decimal(TUNING.RAIN_REWARD).times(lxRainMult())) + "</b> 立夏候"',
                'cash the rain for <b>" + format(new Decimal(TUNING.RAIN_REWARD).times(lxRainMult())) + "</b> 立夏候"') + '',
            '			},',
            '			canClick() { return lxCanalReady() },',
            '			onClick() { lxOpenCanal() },',
            '			style() { return { "width": "260px", "height": "60px" } },',
            '		},',
            '	},',
            '',
            '	bars: {',
            '		1: {',
            '			direction: RIGHT,',
            '			width: 300,',
            '			height: 30,',
            '			progress() { return Math.min(1, player.lx.rain / 100) },',
            '			display() {',
            '				return ' + L('雨量 " + format(player.lx.rain, 1) + " / 100　（每 " + format(lxRainTime(), 1) + " 秒一满）',
                'rain " + format(player.lx.rain, 1) + " / 100 (full every " + format(lxRainTime(), 1) + "s)') + '',
            '			},',
            '			unlocked() { return player.lx.unlocked },',
            '		},',
            '	},',
            '',
            '	update(diff) {',
            '		if (!player.lx.unlocked) return',
            '		if (player.lx.rain < 100) player.lx.rain = Math.min(100, player.lx.rain + diff * 100 / lxRainTime())',
            '	},',
        ].join('\n')
    }
    if (n.mech === "granary") {
        return [
            '	bars: {',
            '		1: {',
            '			direction: RIGHT,',
            '			width: 300,',
            '			height: 30,',
            '			progress() { return Math.min(1, player.qf.grain / 100) },',
            '			display() {',
            '				return ' + L('仓廪 " + format(player.qf.grain, 1) + " / 100　（每 " + format(qfGranaryTime(), 1) + " 秒一收）',
                'granary " + format(player.qf.grain, 1) + " / 100 (a harvest every " + format(qfGranaryTime(), 1) + "s)') + '',
            '			},',
            '			unlocked() { return player.qf.unlocked },',
            '		},',
            '	},',
            '',
            '	update(diff) {',
            '		if (!player.qf.unlocked) return',
            '		player.qf.grain = player.qf.grain + diff * 100 / qfGranaryTime()',
            '		while (player.qf.grain >= 100) {',
            '			player.qf.grain = player.qf.grain - 100',
            '			player.qf.harvests++',
            '			addPoints("qf", new Decimal(TUNING.GRANARY_REWARD).times(qfGranaryMult()))',
            '		}',
            '	},',
        ].join('\n')
    }
    if (n.mech === "nine") {
        return [
            '	clickables: {',
            '		11: {',
            '			title: function() { return ' + L('数九', 'Count a nine') + ' },',
            '			display() {',
            '				if (player.dz.nine >= TUNING.NINE_NINE_MAX) return ' + L('九九已尽 —— 冬至候 +9×9',
                'the nine nines are done — 冬至候 +9x9') + '',
            '				if (player.dz.nineCool > 0) return ' + L('再等 <b>" + format(player.dz.nineCool, 1) + "</b> 秒"',
                'wait <b>" + format(player.dz.nineCool, 1) + "</b>s"') + '',
            '				return ' + L('数九 <b>" + player.dz.nine + "</b> / " + TUNING.NINE_NINE_MAX + "　（每 " + TUNING.NINE_NINE_TICK + " 秒可数一次）',
                'nine <b>" + player.dz.nine + "</b> / " + TUNING.NINE_NINE_MAX + " (once every " + TUNING.NINE_NINE_TICK + "s)') + '',
            '			},',
            '			canClick() { return dzNineReady() },',
            '			onClick() { dzCountNine() },',
            '			style() { return { "width": "280px", "height": "60px" } },',
            '		},',
            '	},',
            '',
            '	bars: {',
            '		1: {',
            '			direction: RIGHT,',
            '			width: 300,',
            '			height: 30,',
            '			progress() { return Math.min(1, player.dz.nine / TUNING.NINE_NINE_MAX) },',
            '			display() {',
            '				return ' + L('九九 " + player.dz.nine + " / " + TUNING.NINE_NINE_MAX + "　（" + player.dz.nineDone + " 次九九）',
                'nine-nines " + player.dz.nine + " / " + TUNING.NINE_NINE_MAX + " (" + player.dz.nineDone + " completed)') + '',
            '			},',
            '			unlocked() { return player.dz.unlocked },',
            '		},',
            '	},',
            '',
            '	update(diff) {',
            '		if (!player.dz.unlocked) return',
            '		if (player.dz.nineCool > 0) player.dz.nineCool = Math.max(0, player.dz.nineCool - diff)',
            '	},',
        ].join('\n')
    }
    return null
}

function tabBlock(n, i) {
    const subs = []
    subs.push('			' + q('九候 · Pentads') + ': {')
    subs.push('				content: [["upgrades", [1, 2]]],')
    subs.push('			},')
    if (n.mech === "gnomon") {
        subs.push('			' + q('圭表 · Gnomon') + ': {')
        subs.push('				content: [["display-text", function() { return lcShadowLine() }], "blank", ["clickables", [1]]],')
        subs.push('			},')
    }
    if (n.mech === "canal") {
        subs.push('			' + q('雨量 · Rain') + ': {')
        subs.push('				content: [["bar", "1"], "blank", ["clickables", [1]]],')
        subs.push('			},')
    }
    if (n.mech === "granary") {
        subs.push('			' + q('仓廪 · Granary') + ': {')
        subs.push('				content: [["bar", "1"]],')
        subs.push('			},')
    }
    if (n.mech === "nine") {
        subs.push('			' + q('数九 · Counting') + ': {')
        subs.push('				content: [["bar", "1"], "blank", ["clickables", [1]]],')
        subs.push('			},')
    }
    subs.push('			' + q('候簿 · Ledger') + ': {')
    subs.push('				content: [["buyables", [1]]],')
    subs.push('				unlocked() { return hasUpgrade("' + n.id + '", 25) },')
    subs.push('			},')
    subs.push('			' + q('碑 · Stele') + ': {')
    subs.push('				content: [["milestones", [0, 1, 2, 3]]],')
    subs.push('			},')

    return [
        '	tabFormat: [',
        '		["display-text", function() { return mainAmount("' + n.id + '", true) }],',
        capLine(n, i),
        '		"blank",',
        '		"prestige-button",',
        '		"blank",',
        '		["microtabs", "stuff"],',
        '	],',
        '	microtabs: {',
        '		stuff: {',
        subs.join('\n'),
        '		},',
        '	},',
    ].join('\n')
}

/* =============================================================================
 *  6. 历 / al — the almanac: M8 shop, M10 七十二候 chart, M5 历筹
 * ========================================================================== */
function emitAlmanac() {
    const flat = []
    for (let i = 0; i < 8; i++) houOf(i).forEach((h) => flat.push(h))
    check(flat.length === 72, "the almanac chart must hold exactly 72 pentads")

    const nameRows = flat.map((h, k) => '	[' + q(h[0]) + ', ' + q(h[1]) + '],' + (k % 9 === 8 ? '   // ' + TERMS[Math.floor(k / 9) * 3].zh + ' / ' + TERMS[Math.floor(k / 9) * 3 + 1].zh + ' / ' + TERMS[Math.floor(k / 9) * 3 + 2].zh : '')).join('\n')

    return [
        banner('历 / al  —  row 1, the almanac (历书 · 皇历).', [
            'The calendar is printed from the first 立春 and never resets: 历筹 (almanac tokens)',
            'accumulate for the whole run, and this layer\'s doReset keeps EVERYTHING. Its three',
            'markets (M8) spend 历筹 on meta-effects for the named mechanics of other layers, its',
            '七十二候 chart (M10) prints the names of the pentads you have observed, and its',
            '编历 bar is the counter of the collection.',
            '',
            'The 72 names below are the canonical 《月令七十二候集解》 set — the chart IS the game.',
        ]),
        '',
        '/* The 七十二候 chart, in reading order: 8 节 x 9 候 (row*100+col, hard rule 10). */',
        'var AL_HOU_NAMES = [',
        nameRows,
        ']',
        '',
        'function alHouAt(id) {',
        '	let r = Math.floor(id / 100)      // 1..8 -> the 节',
        '	let c = id % 100                  // 1..9  -> the pentad slot',
        '	// NaN-safe on purpose: updateTempData() calls every grid function that is not in',
        '	// the engine\'s activeFunctions list with NO argument, and NaN fails both < and >',
        '	// — so a bare range test lets id === undefined through and returns a broken',
        '	// {name: undefined} whose .name[0] then throws on every temp refresh.',
        '	if (!(r >= 1 && r <= 8) || !(c >= 1 && c <= 9)) return null',
        '	let node = SEASON_IDS[r - 1]',
        '	let slot = HOU_SLOTS[c - 1]',
        '	return { node: node, slot: slot, name: AL_HOU_NAMES[(r - 1) * 9 + (c - 1)], term: Math.floor((r - 1) * 3 + (c - 1) / 3) }',
        '}',
        'function alObserved(id) {',
        '	let at = alHouAt(id)',
        '	if (!at) return false',
        '	return hasUpgrade(at.node, at.slot)',
        '}',
        'function alTermName(k) {',
        '	return [' + TERMS.map((t) => q(t.zh) + ', ' + q(t.en)).join(', ') + '][k]',
        '}',
        '',
        'addLayer("al", {',
        '	name: function() { return ' + L('历', 'Almanac') + ' },',
        '	symbol: function() { return ' + L('历', 'AL') + ' },',
        '	position: 1,',
        '	row: 1,',
        '	startData() { return {',
        '		unlocked: false,',
        '		points: new Decimal(0),',
        '		best: new Decimal(0),',
        '		total: new Decimal(0),',
        '		editions: 0,',
        '	}},',
        '	color: "#C792EA",',
        '	resource: function() { return ' + L('历筹', 'almanac tokens') + ' },',
        '	baseResource: function() { return ' + L('立春候', 'Lichun Hou') + ' },',
        '	baseAmount() { return player.lc.points },',
        '	requires: new Decimal(' + AL.req + '),',
        '	type: "normal",',
        '	exponent: ' + AL.exp + ',',
        '	gainMult() {',
        '		let ret = new Decimal(1)',
        '		if (hasUpgrade("al", 12)) ret = ret.times(upgradeEffect("al", 12))',
        '		if (hasUpgrade("al", 21)) ret = ret.times(upgradeEffect("al", 21))',
        '		if (hasUpgrade("al", 23)) ret = ret.times(upgradeEffect("al", 23))',
        '		if (getBuyableAmount("al", 13).gt(0)) ret = ret.times(buyableEffect("al", 13))',
        '		if (hasMilestone("al", 0)) ret = ret.times(1.5)',
        '		if (hasMilestone("al", 2)) ret = ret.times(4)',
        '		ret = ret.times(suiTrialMult())',
        '		return ret',
        '	},',
        '	gainExp() { return new Decimal(1) },',
        '	passiveGeneration() {',
        '		if (hasMilestone("al", 1) || hasMilestone("sui", 3)) return 1',
        '		return 0',
        '	},',
        '	autoUpgrade() {',
        '		if (hasMilestone("al", 2) || hasMilestone("sui", 3)) return true',
        '		return false',
        '	},',
        '	resetsNothing() {',
        '		if (hasMilestone("sui", 3)) return true',
        '		return false',
        '	},',
        '	layerShown() { return player.al.unlocked || player.lc.best.gte(5) },',
        '	prestigeButtonText() {',
        '		return ' + L('修历得 <b>" + formatWhole(tmp.al.resetGain) + "</b> 历筹（历书不灭，只添不削）',
            'Revise the calendar for <b>" + formatWhole(tmp.al.resetGain) + "</b> tokens (the almanac only grows)') + '',
        '	},',
        '	doReset(resettingLayer) {',
        '		// 历书不灭 — the almanac keeps everything, including its own tokens.',
        '		layerDataReset("al", ["unlocked", "points", "best", "total", "upgrades", "milestones", "buyables", "editions"])',
        '	},',
        '	update(diff) {',
        '		// 编历: the bar is the collection itself — 72 tiles, and the last one pays.',
        '		if (houObserved() >= TUNING.HOU_TOTAL && player.al.editions < 1) player.al.editions = 1',
        '	},',
        '',
        '	upgrades: {',
        '		11: {',
        '			title: function() { return ' + L('平气', 'Smoothing the Qi') + ' },',
        '			description: function() { return ' + L('日影产出 ×2。', 'Sun-shadow output ×2.') + ' },',
        '			cost: new Decimal(TUNING.AL_UPG_COSTS[11]),',
        '			effect() { return new Decimal(2) },',
        '			effectDisplay() { return "×" + format(this.effect()) },',
        '		},',
        '		12: {',
        '			title: function() { return ' + L('候历', 'The Pentad Calendar') + ' },',
        '			description: function() { return ' + L('已察之候皆成力：所有候产 ×(1 + 已察候/20)。',
            'Every observed pentad tells: all 候 output x (1 + observed/20).') + ' },',
        '			cost: new Decimal(TUNING.AL_UPG_COSTS[12]),',
        '			effect() { return new Decimal(1).add(houObserved() / 20) },',
        '			effectDisplay() { return "×" + format(this.effect()) },',
        '		},',
        '		13: {',
        '			title: function() { return ' + L('置闰', 'Intercalation') + ' },',
        '			description: function() { return ' + L('九候既察之后，历书三市之价 ×0.9。',
            'Once nine pentads are observed, the three markets cost x0.9.') + ' },',
        '			cost: new Decimal(TUNING.AL_UPG_COSTS[13]),',
        '			effect() {',
        '				if (houObserved() >= 9) return new Decimal(0.9)',
        '				return new Decimal(1)',
        '			},',
        '			effectDisplay() { return "×" + format(this.effect()) },',
        '		},',
        '		14: {',
        '			title: function() { return ' + L('圭表', 'The Gnomon') + ' },',
        '			description: function() { return ' + L('立表测影：日影产出 ×2。', 'Set up the gnomon: sun-shadow output ×2.') + ' },',
        '			cost: new Decimal(TUNING.AL_UPG_COSTS[14]),',
        '			effect() { return new Decimal(2) },',
        '			effectDisplay() { return "×" + format(this.effect()) },',
        '		},',
        '		15: {',
        '			title: function() { return ' + L('授时', 'Granting the Seasons') + ' },',
        '			description: function() { return ' + L('历既成，立春之候亦增：立春候产 ×(log10(立春候+1)+1)。',
            'With the calendar made, 立春 grows too: 立春候 output x (log10(立春候+1)+1).') + ' },',
        '			cost: new Decimal(TUNING.AL_UPG_COSTS[15]),',
        '			effect() { return player.lc.points.add(1).log(10).add(1) },',
        '			effectDisplay() { return "×" + format(this.effect()) },',
        '		},',
        '		21: {',
        '			title: function() { return ' + L('岁实', 'The Solar Year') + ' },',
        '			description: function() { return ' + L('二十四气周之后，历筹 ×2。',
            'Once all 24 terms are reached, tokens ×2.') + ' },',
        '			cost: new Decimal(TUNING.AL_UPG_COSTS[21]),',
        '			effect() {',
        '				if (termsReached() >= 24) return new Decimal(2)',
        '				return new Decimal(1)',
        '			},',
        '			effectDisplay() { return "×" + format(this.effect()) },',
        '		},',
        '		22: {',
        '			title: function() { return ' + L('朔望', 'New Moon and Full') + ' },',
        '			description: function() { return ' + L('推步更密：所有候的软上限 ×1000。',
            'Finer reckoning: every 候 softcap ×1000.') + ' },',
        '			cost: new Decimal(TUNING.AL_UPG_COSTS[22]),',
        '			unlocked() { return player.al.best.gte(20) },',
        '		},',
        '		23: {',
        '			title: function() { return ' + L('历元', 'The Epoch') + ' },',
        '			description: function() { return ' + L('以历筹为元：历筹产 ×(历筹/1e3+1)^0.2。',
            'The epoch of tokens: token output x (tokens/1e3+1)^0.2.') + ' },',
        '			cost: new Decimal(TUNING.AL_UPG_COSTS[23]),',
        '			effect() { return player.al.points.div(1e3).add(1).log(10).add(1).pow(0.2) },',
        '			effectDisplay() { return "×" + format(this.effect()) },',
        '		},',
        '		24: {',
        '			title: function() { return ' + L('岁差', 'Precession') + ' },',
        '			description: function() { return ' + L('岁差既明，历书三市更精：其效果指数 ×1 ~ ×1.36（随已察之候而长）。',
            "Precession sharpens the three markets: their effect exponent becomes x1 .. x1.36, growing with observed pentads.") + ' },',
        '			cost: new Decimal(TUNING.AL_UPG_COSTS[24]),',
        '			effect() { return new Decimal(1).add(houObserved() / 200).min(1.36) },',
        '			effectDisplay() { return "历书三市 ^" + format(this.effect()) },',
        '		},',
        '		25: {',
        '			title: function() { return ' + L('七十二候图', 'The Seventy-Two Chart') + ' },',
        '			description: function() { return ' + L('开启七十二候图（tab）：八节九候，尽列其名。',
            'Unlock the 72-pentad chart (tab): eight 节, nine pentads each, every name printed.') + ' },',
        '			cost: new Decimal(TUNING.AL_UPG_COSTS[25]),',
        '			unlocked() { return houObserved() >= 3 },',
        '		},',
        '	},',
        '',
        '	milestones: {',
        '		0: {',
        '			requirementDescription: function() { return ' + L('历筹 ≥ 1', '1 almanac token') + ' },',
        '			effectDescription: function() { return ' + L('历筹产 ×1.5；七十二候图可开。',
            'Token output x1.5; the 72-pentad chart opens.') + ' },',
        '			done() { return player.al.best.gte(1) },',
        '		},',
        '		1: {',
        '			requirementDescription: function() { return ' + L('历筹 ≥ 5', '5 tokens') + ' },',
        '			effectDescription: function() { return ' + L('修历自行 —— 历书每秒自修一次。',
            'The calendar revises itself once a second.') + ' },',
        '			done() { return player.al.best.gte(5) },',
        '		},',
        '		2: {',
        '			requirementDescription: function() { return ' + L('历筹 ≥ 25', '25 tokens') + ' },',
        '			effectDescription: function() { return ' + L('历书自购（可买即买）；历筹产 ×4。',
            'The almanac buys its own entries; token output x4.') + ' },',
        '			done() { return player.al.best.gte(25) },',
        '		},',
        '		3: {',
        '			requirementDescription: function() { return ' + L('已察二十四候', '24 pentads observed') + ' },',
        '			effectDescription: function() { return ' + L('日影 ×3；历书三市之效再 ^1.02。',
            'Sun-shadow x3; the three markets gain another ^1.02.') + ' },',
        '			done() { return houObserved() >= 24 },',
        '		},',
        '	},',
        '',
        '	buyables: {',
        '		11: {',
        '			title: function() { return ' + L('岁纪', 'The Year Record') + ' },',
        '			display() {',
        '				return ' + L('已购 <b>" + formatWhole(getBuyableAmount("al", 11)) + "</b> 次<br>日影 ×<b>" + format(buyableEffect("al", 11)) + "</b><br>下一笔 " + format(this.cost()) + " 历筹"',
            'bought <b>" + formatWhole(getBuyableAmount("al", 11)) + "</b><br>sun-shadow x<b>" + format(buyableEffect("al", 11)) + "</b><br>next " + format(this.cost()) + " tokens"') + '',
        '			},',
        '			cost(amount) { return new Decimal(TUNING.AL_BUY_COST_BASE).times(Decimal.pow(TUNING.AL_BUY_COST_MULT, amount)).times(hasUpgrade("al", 13) ? upgradeEffect("al", 13) : 1) },',
        '			effect(amount) {',
        '				let ret = new Decimal(TUNING.AL_BUY_EFFECT_MULT).pow(amount)',
        '				if (hasUpgrade("al", 24)) ret = ret.pow(upgradeEffect("al", 24))',
        '				return ret',
        '			},',
        '			unlocked() { return hasMilestone("al", 0) },',
        '			canAfford() { return player.al.points.gte(this.cost()) },',
        '			buy() {',
        '				player.al.points = player.al.points.sub(this.cost())',
        '				setBuyableAmount("al", 11, getBuyableAmount("al", 11).add(1))',
        '			},',
        '			buyMax() { let n = 0; while (this.canAfford() && n < 50) { this.buy(); n++ } },',
        '		},',
        '		12: {',
        '			title: function() { return ' + L('月令', 'The Monthly Ordinances') + ' },',
        '			display() {',
        '				return ' + L('已购 <b>" + formatWhole(getBuyableAmount("al", 12)) + "</b> 次<br>所有候产 ×<b>" + format(buyableEffect("al", 12)) + "</b><br>下一笔 " + format(this.cost()) + " 历筹"',
            'bought <b>" + formatWhole(getBuyableAmount("al", 12)) + "</b><br>all 候 output x<b>" + format(buyableEffect("al", 12)) + "</b><br>next " + format(this.cost()) + " tokens"') + '',
        '			},',
        '			cost(amount) { return new Decimal(TUNING.AL_BUY_COST_BASE).times(Decimal.pow(TUNING.AL_BUY_COST_MULT, amount)).times(2).times(hasUpgrade("al", 13) ? upgradeEffect("al", 13) : 1) },',
        '			effect(amount) {',
        '				let ret = new Decimal(TUNING.AL_BUY_EFFECT_MULT).pow(amount)',
        '				if (hasUpgrade("al", 24)) ret = ret.pow(upgradeEffect("al", 24))',
        '				return ret',
        '			},',
        '			unlocked() { return hasMilestone("al", 1) },',
        '			canAfford() { return player.al.points.gte(this.cost()) },',
        '			buy() {',
        '				player.al.points = player.al.points.sub(this.cost())',
        '				setBuyableAmount("al", 12, getBuyableAmount("al", 12).add(1))',
        '			},',
        '			buyMax() { let n = 0; while (this.canAfford() && n < 50) { this.buy(); n++ } },',
        '		},',
        '		13: {',
        '			title: function() { return ' + L('闰余', 'The Intercalary Remainder') + ' },',
        '			display() {',
        '				return ' + L('已购 <b>" + formatWhole(getBuyableAmount("al", 13)) + "</b> 次<br>历筹产 ×<b>" + format(buyableEffect("al", 13)) + "</b><br>下一笔 " + format(this.cost()) + " 历筹"',
            'bought <b>" + formatWhole(getBuyableAmount("al", 13)) + "</b><br>token output x<b>" + format(buyableEffect("al", 13)) + "</b><br>next " + format(this.cost()) + " tokens"') + '',
        '			},',
        '			cost(amount) { return new Decimal(TUNING.AL_BUY_COST_BASE).times(Decimal.pow(TUNING.AL_BUY_COST_MULT, amount)).times(4).times(hasUpgrade("al", 13) ? upgradeEffect("al", 13) : 1) },',
        '			effect(amount) {',
        '				let ret = new Decimal(TUNING.AL_BUY_EFFECT_MULT).pow(amount)',
        '				if (hasUpgrade("al", 24)) ret = ret.pow(upgradeEffect("al", 24))',
        '				return ret',
        '			},',
        '			unlocked() { return hasMilestone("al", 2) },',
        '			canAfford() { return player.al.points.gte(this.cost()) },',
        '			buy() {',
        '				player.al.points = player.al.points.sub(this.cost())',
        '				setBuyableAmount("al", 13, getBuyableAmount("al", 13).add(1))',
        '			},',
        '			buyMax() { let n = 0; while (this.canAfford() && n < 50) { this.buy(); n++ } },',
        '		},',
        '	},',
        '',
        '	grid: {',
        '		rows: 8,',
        '		cols: 9,',
        '		getStartData(id) { return { observed: false } },',
        '		getUnlocked(id) { return hasMilestone("al", 0) },',
        '		getTitle(id) {',
        '			let at = alHouAt(id)',
        '			if (!at) return ""',
        '			return L(alTermName(at.term * 2), alTermName(at.term * 2 + 1))',
        '		},',
        '		getDisplay(id) {',
        '			let at = alHouAt(id)',
        '			if (!at) return ""',
        '			if (!alObserved(id)) return ' + L('未察', '—') + '',
        '			return at.name[zh() ? 0 : 1]',
        '		},',
        '		getStyle(id) {',
        '			return { "background-color": alObserved(id) ? "#2b2f38" : "#15181d", "width": "90px", "height": "46px", "font-size": "12px" }',
        '		},',
        '		getCanClick(id) { return false },',
        '		getTooltip(id) {',
        '			let at = alHouAt(id)',
        '			if (!at) return ""',
        '			return ' + L('第 " + (at.term + 1) + " 气　·　" + (at.name[0])',
            'term " + (at.term + 1) + " · " + (at.name[1])') + '',
        '		},',
        '	},',
        '',
        '	bars: {',
        '		1: {',
        '			direction: RIGHT,',
        '			width: 400,',
        '			height: 30,',
        '			progress() { return Math.min(1, houObserved() / TUNING.HOU_TOTAL) },',
        '			display() {',
        '				return ' + L('七十二候图 " + houObserved() + " / " + TUNING.HOU_TOTAL + (houObserved() >= TUNING.HOU_TOTAL ? "　—— 候尽历成" : "　（集齐七十二候）")',
            'the chart " + houObserved() + " / " + TUNING.HOU_TOTAL + (houObserved() >= TUNING.HOU_TOTAL ? " — the chart is complete" : " (collect all 72)")') + '',
        '			},',
        '			unlocked() { return hasMilestone("al", 0) },',
        '		},',
        '	},',
        '',
        '	tabFormat: [',
        '		["display-text", function() { return mainAmount("al", true) }],',
        '		["display-text", function() { return ' + L('历书不灭 —— 交历不失历筹、不失市货。',
            'The almanac never resets: tokens and markets survive every 交历.') + ' }],',
        '		"blank",',
        '		"prestige-button",',
        '		"blank",',
        '		["microtabs", "stuff"],',
        '	],',
        '	microtabs: {',
        '		stuff: {',
        '			' + q('市货 · Markets') + ': {',
        '				content: [["upgrades", [1, 2]]],',
        '			},',
        '			' + q('七十二候 · Chart') + ': {',
        '				content: [["bar", "1"], "blank", "grid"],',
        '				unlocked() { return hasUpgrade("al", 25) },',
        '			},',
        '			' + q('历市 · Bought') + ': {',
        '				content: [["buyables", [1]]],',
        '				unlocked() { return hasMilestone("al", 0) },',
        '			},',
        '			' + q('碑 · Stele') + ': {',
        '				content: [["milestones", [0, 1, 2, 3]]],',
        '			},',
        '		},',
        '	},',
        '})',
        '',
    ].join('\n')
}

/* =============================================================================
 *  7. 岁 / sui — row 8: the year hub (M2 score-attack, M7 ritual)
 * ========================================================================== */
function emitSui() {
    const ch = []
    for (let i = 0; i < 8; i++) {
        const t = TERMS[i * 3]
        const n = NODES[i]
        const id = 11 + i
        ch.push('		' + id + ': {')
        ch.push('			name: function() { return ' + L(t.zh + '试', 'Trial of ' + t.en) + ' },')
        ch.push('			unlocked() { return hasMilestone("' + n.id + '", 3) },')
        ch.push('			challengeDescription: function() { return ' + L('试一岁于' + t.zh + '：整个节气树归零，且一切候产 ÷1000。',
            'Run the year from ' + t.en + ': the whole tree resets and all 候 output is divided by 1000.') + ' },')
        ch.push('			goalDescription: function() { return ' + L('在试中得 <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[' + i + '])) + "</b> 岁礼"',
            'Reach <b>" + format(new Decimal(TUNING.CHALLENGE_TARGETS[' + i + '])) + "</b> 岁礼 inside the trial"') + ' },')
        ch.push('			rewardDescription: function() { return ' + L('岁礼产 ×(峰值+1)^0.4，每次完成再 ×1.35（已记峰值 " + format(player.sui.maxpoints[' + i + ']) + "）',
            '岁礼 output x (peak+1)^0.4, x1.35 per completion (recorded peak " + format(player.sui.maxpoints[' + i + ']) + ")') + ' },')
        ch.push('			canComplete() { return player.sui.points.gte(new Decimal(TUNING.CHALLENGE_TARGETS[' + i + '])) },')
        ch.push('			completionLimit: ' + TUNING.CHALLENGE_LIMIT + ',')
        ch.push('			rewardEffect() {')
        ch.push('				let peak = player.sui.maxpoints[' + i + ']')
        ch.push('				let done = challengeCompletions("sui", ' + id + ')')
        ch.push('				let ret = peak.add(1).pow(0.4)')
        ch.push('				if (done >= 1) ret = ret.times(Decimal.pow(TUNING.CHALLENGE_REWARD, done))')
        ch.push('				return ret')
        ch.push('			},')
        ch.push('		},')
    }
    return [
        banner('岁 / sui  —  row 8, the year itself (冬至一阳生).', [
            '岁祭 (M7) is the ritual: one completed year, paid in 岁礼, re-rooted at 1e30 so the',
            'wheel never detonates. 八节试 (M2) are the eight score-attack trials — one per 节,',
            'completionLimit 3, so 8 x 3 = 24 completions = the 24 solar terms. Entering a trial',
            'wipes the whole spine (doReset("sui", true) fires rowReset(8..0)) and divides all 候',
            'output by 1000; the reward is scored on the PEAK 岁礼 you reached inside the trial,',
            'recorded per trial in player.sui.maxpoints and kept across entries — so every later',
            'entry, with more power behind it, buys a bigger permanent multiplier.',
        ]),
        '',
        'function suiReq() { return new Decimal(TUNING.SUI_REQUIRES) }',
        'function suiBase() { return player.dz.points }',
        'function suiTrialMult() { return anyTrial() ? new Decimal(1).div(TUNING.SUI_TRIAL_DIV) : new Decimal(1) }',
        'function suiTrial() {',
        '	let ac = player.sui.activeChallenge',
        '	if (ac === null || ac === undefined) return -1',
        '	let i = ac - 11',
        '	if (i < 0 || i >= TUNING.CHALLENGE_COUNT) return -1',
        '	return i',
        '}',
        'function suiGainMult() {',
        '	let ret = new Decimal(1)',
        '	// 八节试 (M2): every completed trial pays out on its own recorded peak.',
        '	for (let i = 0; i < TUNING.CHALLENGE_COUNT; i++) {',
        '		if (challengeCompletions("sui", 11 + i) >= 1) ret = ret.times(challengeEffect("sui", 11 + i))',
        '	}',
        '	if (hasUpgrade("sui", 11)) ret = ret.times(upgradeEffect("sui", 11))',
        '	if (hasUpgrade("sui", 12)) ret = ret.times(upgradeEffect("sui", 12))',
        '	if (hasUpgrade("sui", 13)) ret = ret.times(upgradeEffect("sui", 13))',
        '	if (hasUpgrade("sui", 14)) ret = ret.times(upgradeEffect("sui", 14))',
        '	if (hasUpgrade("sui", 21)) ret = ret.times(upgradeEffect("sui", 21))',
        '	if (hasUpgrade("sui", 23)) ret = ret.times(upgradeEffect("sui", 23))',
        '	if (hasUpgrade("sui", 24)) ret = ret.times(upgradeEffect("sui", 24))',
        '	if (hasMilestone("sui", 1)) ret = ret.times(3)',
        '	if (hasMilestone("sui", 2)) ret = ret.times(5)',
        '	if (getBuyableAmount("sui", 11).gt(0)) ret = ret.times(buyableEffect("sui", 11))',
        '	return ret',
        '}',
        'function suiGain() {',
        '	let req = suiReq()',
        '	let base = suiBase()',
        '	if (base.lt(req)) return new Decimal(0)',
        '	let g = base.div(req).pow(TUNING.SUI_EXPONENT).times(suiGainMult())',
        '	g = g.times(suiTrialMult())',
        '	if (g.gte(TUNING.SUI_SOFTCAP)) g = g.div(TUNING.SUI_SOFTCAP).pow(TUNING.SOFTCAP_POWER).times(TUNING.SUI_SOFTCAP)',
        '	return g.floor().max(0)',
        '}',
        'function suiNextAt() {',
        '	let mult = suiGainMult().times(suiTrialMult())',
        '	if (mult.lte(0)) return new Decimal(Infinity)',
        '	let next = suiGain().add(1).div(mult)',
        '	next = next.root(TUNING.SUI_EXPONENT).times(suiReq()).max(suiReq())',
        '	return next',
        '}',
        'function suiPeakOf(i) {',
        '	if (i < 0 || i >= TUNING.CHALLENGE_COUNT) return new Decimal(0)',
        '	return player.sui.maxpoints[i]',
        '}',
        '',
        'addLayer("sui", {',
        '	name: function() { return ' + L('岁', 'The Year') + ' },',
        '	symbol: function() { return ' + L('岁', 'SUI') + ' },',
        '	position: 0,',
        '	row: 8,',
        '	startData() { return {',
        '		unlocked: false,',
        '		points: new Decimal(0),',
        '		best: new Decimal(0),',
        '		total: new Decimal(0),',
        '		maxpoints: [' + new Array(TUNING.CHALLENGE_COUNT).fill('new Decimal(0)').join(', ') + '],',
        '		trialsRun: 0,',
        '	}},',
        '	color: "#FF6F91",',
        '	resource: function() { return ' + L('岁礼', '岁礼') + ' },',
        '	baseResource: function() { return ' + L('冬至候', 'Dongzhi Hou') + ' },',
        '	baseAmount() { return suiBase() },',
        '	requires: new Decimal(' + SUI.req + '),',
        '	type: "custom",',
        '	getResetGain() { return suiGain() },',
        '	getNextAt() { return suiNextAt() },',
        '	canReset() { return suiBase().gte(suiReq()) },',
        '	gainMult() { return suiGainMult() },',
        '	gainExp() { return new Decimal(1) },',
        '	layerShown() { return player.sui.unlocked || player.dz.best.gte(3.0517578125e10) },',
        '	prestigeButtonText() {',
        '		if (player.sui.inChallenge !== undefined && player.sui.inChallenge >= 0)',
        '			return ' + L('试中不可岁祭 —— 先尽此试', 'No ritual inside a trial — finish it first') + '',
        '		return ' + L('岁祭得 <b>" + formatWhole(tmp.sui.resetGain) + "</b> 岁礼（一岁一轮，岁复一岁）',
            'Hold the ritual for <b>" + formatWhole(tmp.sui.resetGain) + "</b> 岁礼 (a year at a time)') + '',
        '	},',
        '	doReset(resettingLayer) {',
        '		// A trial entry calls doReset("sui", true), which walks rowReset(8…0) and',
        '		// therefore wipes every 节 beneath (that is the handicap). sui is the top row,',
        '		// so no layer is ever strictly deeper than it: this hook never fires for the',
        '		// layer itself, and 岁祭 keeps its bank — 岁礼 accumulates, one year on another.',
        '		if (layers[resettingLayer].row > this.row) {',
        '			layerDataReset("sui", ["unlocked", "best", "total", "upgrades", "milestones", "maxpoints", "trialsRun"])',
        '		}',
        '	},',
        '	update(diff) {',
        '		// M2: the peak of a running trial is the score. It is kept across entries,',
        '		// so a later entry with more power behind it always beats the old record.',
        '		let i = suiTrial()',
        '		if (i >= 0) {',
        '			player.sui.maxpoints[i] = player.sui.maxpoints[i].max(player.sui.points)',
        '			if (player.sui.trialsRun < 0) player.sui.trialsRun = 0',
        '		}',
        '	},',
        '',
        '	upgrades: {',
        '		11: {',
        '			title: function() { return ' + L('一阳生', 'The First Yang') + ' },',
        '			description: function() { return ' + L('冬至一阳生：岁礼 ×2。', 'At the solstice the first yang is born: 岁礼 ×2.') + ' },',
        '			cost: new Decimal(TUNING.SUI_UPG_COSTS[11]),',
        '			effect() { return new Decimal(2) },',
        '			effectDisplay() { return "×" + format(this.effect()) },',
        '		},',
        '		12: {',
        '			title: function() { return ' + L('岁差', 'Precession') + ' },',
        '			description: function() { return ' + L('岁礼自养：岁礼产 ×√(岁礼+1)，软上限 10 倍。',
            'The year feeds itself: 岁礼 output x sqrt(岁礼+1), softcapped at x10.') + ' },',
        '			cost: new Decimal(TUNING.SUI_UPG_COSTS[12]),',
        '			effect() {',
        '				let v = player.sui.points.add(1).pow(0.3)',
        '				if (v.gt(10)) v = v.div(10).pow(0.4).times(10)',
        '				return v',
        '			},',
        '			effectDisplay() { return "×" + format(this.effect()) },',
        '		},',
        '		13: {',
        '			title: function() { return ' + L('岁星', 'The Year Star') + ' },',
        '			description: function() { return ' + L('冬至候产 ×(log10(冬至候+1)+1)。',
            '冬至候 output x (log10(冬至候+1)+1).') + ' },',
        '			cost: new Decimal(TUNING.SUI_UPG_COSTS[13]),',
        '			effect() { return player.dz.points.add(1).log(10).add(1) },',
        '			effectDisplay() { return "×" + format(this.effect()) },',
        '		},',
        '		14: {',
        '			title: function() { return ' + L('闰法', 'The Intercalary Rule') + ' },',
        '			description: function() { return ' + L('岁礼 ×(已察候/12+1)。', '岁礼 x (observed/12+1).') + ' },',
        '			cost: new Decimal(TUNING.SUI_UPG_COSTS[14]),',
        '			effect() { return new Decimal(1).add(houObserved() / 12) },',
        '			effectDisplay() { return "×" + format(this.effect()) },',
        '		},',
        '		15: {',
        '			title: function() { return ' + L('岁功成', 'The Year Is Complete') + ' },',
        '			description: function() { return ' + L('历法终成 —— 七十二候尽，二十四气周。此即终局。',
            'The calendar is finished — 72 pentads, 24 terms. This is the ending.') + ' },',
        '			cost: new Decimal(TUNING.SUI_FINALE_COST),',
        '			unlocked() { return hasMilestone("sui", 3) },',
        '		},',
        '		21: {',
        '			title: function() { return ' + L('岁会', 'The Year Assembly') + ' },',
        '			description: function() { return ' + L('八节试每完成一次，岁礼 ×1.1（随完成数而长）。',
            'Each trial completion: 岁礼 x1.1 (grows with completions).') + ' },',
        '			cost: new Decimal(TUNING.SUI_UPG_COSTS[21]),',
        '			effect() { return new Decimal(1.1).pow(challengeCompletions("sui", 11) + challengeCompletions("sui", 12) + challengeCompletions("sui", 13) + challengeCompletions("sui", 14) + challengeCompletions("sui", 15) + challengeCompletions("sui", 16) + challengeCompletions("sui", 17) + challengeCompletions("sui", 18)) },',
        '			effectDisplay() { return "×" + format(this.effect()) },',
        '		},',
        '		22: {',
        '			title: function() { return ' + L('岁星纪年', 'Jupiter\'s Twelve Years') + ' },',
        '			description: function() { return ' + L('十二岁一周天：岁礼软上限 ×1000。',
            'Twelve years to a circuit: the 岁礼 softcap x1000.') + ' },',
        '			cost: new Decimal(TUNING.SUI_UPG_COSTS[22]),',
        '			unlocked() { return player.sui.best.gte(20) },',
        '		},',
        '		23: {',
        '			title: function() { return ' + L('岁实消长', 'The Wobble of the Year') + ' },',
        '			description: function() { return ' + L('岁礼产 ×(岁礼/1e3+1)^0.2。', '岁礼 output x (岁礼/1e3+1)^0.2.') + ' },',
        '			cost: new Decimal(TUNING.SUI_UPG_COSTS[23]),',
        '			effect() { return player.sui.points.div(1e3).add(1).log(10).add(1).pow(0.2) },',
        '			effectDisplay() { return "×" + format(this.effect()) },',
        '		},',
        '		24: {',
        '			title: function() { return ' + L('岁祭之器', 'The Ritual Vessel') + ' },',
        '			description: function() { return ' + L('岁簿（buyable）之效 ×1 ~ ×1.5（随岁礼而长）。',
            "The year-ledger buyable's effect x1 .. x1.5, growing with 岁礼.") + ' },',
        '			cost: new Decimal(TUNING.SUI_UPG_COSTS[24]),',
        '			effect() { return new Decimal(1).add(player.sui.points.add(1).log(10).div(10)).min(1.5) },',
        '			effectDisplay() { return "岁簿效果 ^" + format(this.effect()) },',
        '		},',
        '		25: {',
        '			title: function() { return ' + L('岁簿', 'The Year Ledger') + ' },',
        '			description: function() { return ' + L('开启岁簿（buyable）：以岁礼记岁，岁岁相加。',
            'Unlock the year ledger (a buyable): record the years, one on another.') + ' },',
        '			cost: new Decimal(TUNING.SUI_UPG_COSTS[25]),',
        '			unlocked() { return hasMilestone("sui", 1) },',
        '		},',
        '	},',
        '',
        '	milestones: {',
        '		0: {',
        '			requirementDescription: function() { return ' + L('岁礼 ≥ 1', '1 岁礼') + ' },',
        '			effectDescription: function() { return ' + L('日影 ×2；八节试可见。', 'Sun-shadow x2; the eight trials become visible.') + ' },',
        '			done() { return player.sui.best.gte(1) },',
        '		},',
        '		1: {',
        '			requirementDescription: function() { return ' + L('岁礼 ≥ 3', '3 岁礼') + ' },',
        '			effectDescription: function() { return ' + L('岁礼产 ×3；岁簿可开。', '岁礼 output x3; the ledger opens.') + ' },',
        '			done() { return player.sui.best.gte(3) },',
        '		},',
        '		2: {',
        '			requirementDescription: function() { return ' + L('岁礼 ≥ 12', '12 岁礼') + ' },',
        '			effectDescription: function() { return ' + L('岁礼产 ×5。', '岁礼 output x5.') + ' },',
        '			done() { return player.sui.best.gte(12) },',
        '		},',
        '		3: {',
        '			requirementDescription: function() { return ' + L('一岁既成（岁祭一次）', 'One year completed') + ' },',
        '			effectDescription: function() { return ' + L('日影 ×5；<b>全树自动</b> —— 立春至冬至九个节点自此自行交节、自行购候，且交节不再动其下层。（岁功既成，人事尽矣。）',
            'Sun-shadow x5; <b>the whole tree runs itself</b> — from 立春 to 冬至 every node turns its own season and buys its own pentads, and a 交节 no longer disturbs the layers beneath it.') + ' },',
        '			done() { return player.sui.best.gte(30) },',
        '		},',
        '		4: {',
        '			requirementDescription: function() { return ' + L('八节试尽（二十四完成）', '24 trial completions') + ' },',
        '			effectDescription: function() { return ' + L('岁礼 ×3；岁簿之效再 ×2。',
            '岁礼 x3; the year ledger doubles again.') + ' },',
        '			done() { return totalTrialCompletions() >= 24 },',
        '		},',
        '		5: {',
        '			requirementDescription: function() { return ' + L('七十二候尽（候图全开）', 'All 72 pentads observed') + ' },',
        '			effectDescription: function() { return ' + L('日影 ×24；岁礼 ×24。', 'Sun-shadow x24; 岁礼 x24.') + ' },',
        '			done() { return houObserved() >= TUNING.HOU_TOTAL },',
        '		},',
        '	},',
        '',
        '	buyables: {',
        '		11: {',
        '			title: function() { return ' + L('岁簿', 'Year Ledger') + ' },',
        '			display() {',
        '				return ' + L('已记 <b>" + formatWhole(getBuyableAmount("sui", 11)) + "</b> 岁<br>岁礼 ×<b>" + format(buyableEffect("sui", 11)) + "</b><br>下一岁 " + format(this.cost()) + " 岁礼"',
            'recorded <b>" + formatWhole(getBuyableAmount("sui", 11)) + "</b> years<br>岁礼 x<b>" + format(buyableEffect("sui", 11)) + "</b><br>next " + format(this.cost()) + " 岁礼"') + '',
        '			},',
        '			cost(amount) { return new Decimal(TUNING.SUI_BUY_COST_BASE).times(Decimal.pow(TUNING.SUI_BUY_COST_MULT, amount)) },',
        '			effect(amount) {',
        '				let ret = new Decimal(TUNING.SUI_BUY_EFFECT_MULT).pow(amount)',
        '				if (hasUpgrade("sui", 24)) ret = ret.pow(upgradeEffect("sui", 24))',
        '				if (hasMilestone("sui", 4)) ret = ret.times(2)',
        '				return ret',
        '			},',
        '			unlocked() { return hasUpgrade("sui", 25) },',
        '			canAfford() { return player.sui.points.gte(this.cost()) },',
        '			buy() {',
        '				player.sui.points = player.sui.points.sub(this.cost())',
        '				setBuyableAmount("sui", 11, getBuyableAmount("sui", 11).add(1))',
        '			},',
        '			buyMax() { let n = 0; while (this.canAfford() && n < 50) { this.buy(); n++ } },',
        '		},',
        '	},',
        '',
        '	challenges: {',
        ch.join('\n'),
        '	},',
        '',
        '	tabFormat: [',
        '		["display-text", function() { return mainAmount("sui", true) }],',
        '		["display-text", function() { return suiStatusLine() }],',
        '		"blank",',
        '		"prestige-button",',
        '		"blank",',
        '		["microtabs", "stuff"],',
        '	],',
        '	microtabs: {',
        '		stuff: {',
        '			' + q('岁祭 · Ritual') + ': {',
        '				content: [["upgrades", [1, 2]]],',
        '			},',
        '			' + q('八节试 · Trials') + ': {',
        '				content: [["display-text", function() { return suiTrialLine() }], "blank", ["challenges", [1]]],',
        '				unlocked() { return hasMilestone("sui", 0) },',
        '			},',
        '			' + q('岁簿 · Ledger') + ': {',
        '				content: [["buyables", [1]]],',
        '				unlocked() { return hasUpgrade("sui", 25) },',
        '			},',
        '			' + q('碑 · Stele') + ': {',
        '				content: [["milestones", [0, 1, 2, 3, 4, 5]]],',
        '			},',
        '		},',
        '	},',
        '})',
        '',
        '/* ---- 岁\'s readouts (file scope: they mutate nothing, but they are long) ---- */',
        'function suiStatusLine() {',
        '	let i = suiTrial()',
        '	if (i >= 0) return ' + L('<span style=\'color:#FF6F91\'>试中 —— 峰值 " + format(suiPeakOf(i)) + "，此试目标 " + format(new Decimal(TUNING.CHALLENGE_TARGETS[i])) + "</span>',
            '<span style=\'color:#FF6F91\'>in a trial — peak " + format(suiPeakOf(i)) + ", target " + format(new Decimal(TUNING.CHALLENGE_TARGETS[i])) + "</span>') + '',
        '	return ' + L('一岁一轮：冬至候 " + format(player.dz.points) + " / 需 " + format(suiReq()) + "　·　试成 " + totalTrialCompletions() + " / 24',
            'a year at a time: 冬至候 " + format(player.dz.points) + " / need " + format(suiReq()) + " · trials " + totalTrialCompletions() + " / 24') + '',
        '}',
        'function suiTrialLine() {',
        '	return ' + L('试中：全树归零、候产 ÷" + TUNING.SUI_TRIAL_DIV + "。岁礼以<b>峰值</b>计功，峰高则赏厚 —— 每次重入，力倍于前，赏亦倍于前。',
            'Inside a trial the tree resets and all 候 output is divided by " + TUNING.SUI_TRIAL_DIV + ". The reward is scored on the PEAK 岁礼 you reach, so a stronger re-entry buys a bigger permanent bonus.') + '',
        '}',
        '',
    ].join('\n')
}

/* =============================================================================
 *  8. Side layers: 成就 / 农书 / 统计·设置
 * ========================================================================== */
function emitSide() {
    return [
        banner('Side layers — row "side".', [
            'a  成就 (15)      : the 碑 set — one per era milestone, per trial-completion class, and',
            '                    per collection (九九 / 七十二候 / 二十四气). Each carries a neutral',
            '                    (>=1.15) effect read by mod.js\'s getPointGen, so the COUNT is a',
            '                    pacing constant, not just content: see design-brief D21.',
            'n  农书 (12)      : the story dashboard — one chapter per month-pair, quoting 月令.',
            'o  统计·设置      : stats, the 中/EN language toggle, and a buyable respec.',
        ]),
        '',
        '/* ---- 成就 / a ------------------------------------------------------------ */',
        'addLayer("a", {',
        '	name: function() { return ' + L('成就', 'Achievements') + ' },',
        '	symbol: function() { return ' + L('碑', 'A') + ' },',
        '	row: "side",',
        '	startData() { return { unlocked: true, points: new Decimal(0) } },',
        '	color: "#FFD54F",',
        '	resource: function() { return ' + L('碑', 'stones') + ' },',
        '	baseResource: function() { return ' + L('日影', 'sun-shadow') + ' },',
        '	layerShown() { return true },',
        '	type: "none",',
        '	achievements: {',
        '		11: {',
        '			name: function() { return ' + L('初见日影', 'First Shadow') + ' },',
        '			description: function() { return ' + L('得到第一点日影。', 'Gain your first sun-shadow.') + ' },',
        '			done() { return player.points.gte(1) },',
        '			effect() { return new Decimal(1.15) },',
        '			effectDisplay() { return "日影 ×" + format(this.effect()) },',
        '		},',
        '		12: {',
        '			name: function() { return ' + L('立表', 'The Gnomon Stands') + ' },',
        '			description: function() { return L("测影连中十次。", "Ten correct shadow readings in a row.") },',
        '			done() { return player.lc.shadowStreak >= 10 },',
        '			effect() { return new Decimal(1.15) },',
        '			effectDisplay() { return "日影 ×" + format(this.effect()) },',
        '		},',
        '		13: {',
        '			name: function() { return ' + L('初候既察', 'The First Pentad') + ' },',
        '			description: function() { return ' + L('察得第一个候。', 'Observe your first pentad.') + ' },',
        '			done() { return houObserved() >= 1 },',
        '			effect() { return new Decimal(1.15) },',
        '			effectDisplay() { return "日影 ×" + format(this.effect()) },',
        '		},',
        '		14: {',
        '			name: function() { return ' + L('八节既通', 'The Eight Nodes') + ' },',
        '			description: function() { return ' + L('八节皆已解锁。', 'All eight 节 are unlocked.') + ' },',
        '			done() { return player.dz.unlocked },',
        '			effect() { return new Decimal(1.15) },',
        '			effectDisplay() { return "日影 ×" + format(this.effect()) },',
        '		},',
        '		15: {',
        '			name: function() { return ' + L('一岁既成', 'A Year Is Made') + ' },',
        '			description: function() { return ' + L('完成第一次岁祭。', 'Complete your first 岁祭.') + ' },',
        '			done() { return player.years >= 1 },',
        '			effect() { return new Decimal(1.15) },',
        '			effectDisplay() { return "日影 ×" + format(this.effect()) },',
        '		},',
        '		21: {',
        '			name: function() { return ' + L('九九消寒', 'Eighty-One Days') + ' },',
        '			description: function() { return ' + L('数尽九九。', 'Count all nine nines.') + ' },',
        '			done() { return player.dz.nineDone >= 1 },',
        '			effect() { return new Decimal(1.2) },',
        '			effectDisplay() { return "日影 ×" + format(this.effect()) },',
        '		},',
        '		22: {',
        '			name: function() { return ' + L('七十二候尽', 'All Seventy-Two') + ' },',
        '			description: function() { return ' + L('察尽七十二候。', 'Observe all 72 pentads.') + ' },',
        '			done() { return houObserved() >= TUNING.HOU_TOTAL },',
        '			effect() { return new Decimal(2) },',
        '			effectDisplay() { return "日影 ×" + format(this.effect()) },',
        '		},',
        '		23: {',
        '			name: function() { return ' + L('二十四气周', 'The Twenty-Four') + ' },',
        '			description: function() { return ' + L('八节试完成二十四次。', 'Complete 24 trials.') + ' },',
        '			done() { return totalTrialCompletions() >= 24 },',
        '			effect() { return new Decimal(2) },',
        '			effectDisplay() { return "日影 ×" + format(this.effect()) },',
        '		},',
        '		31: {',
        '			name: function() { return ' + L('春分既至', 'The Equinox') + ' },',
        '			description: function() { return ' + L('抵达春分。', 'Reach 春分.') + ' },',
        '			done() { return player.cf.best.gte(1) },',
        '			effect() { return new Decimal(1.15) },',
        '			effectDisplay() { return "日影 ×" + format(this.effect()) },',
        '		},',
        '		32: {',
        '			name: function() { return ' + L('夏至既至', 'The Solstice') + ' },',
        '			description: function() { return ' + L('抵达夏至。', 'Reach 夏至.') + ' },',
        '			done() { return player.xz.best.gte(1) },',
        '			effect() { return new Decimal(1.15) },',
        '			effectDisplay() { return "日影 ×" + format(this.effect()) },',
        '		},',
        '		33: {',
        '			name: function() { return ' + L('秋分既至', 'The Second Equinox') + ' },',
        '			description: function() { return ' + L('抵达秋分。', 'Reach 秋分.') + ' },',
        '			done() { return player.qf.best.gte(1) },',
        '			effect() { return new Decimal(1.15) },',
        '			effectDisplay() { return "日影 ×" + format(this.effect()) },',
        '		},',
        '		34: {',
        '			name: function() { return ' + L('冬至既至', 'The Second Solstice') + ' },',
        '			description: function() { return ' + L('抵达冬至。', 'Reach 冬至.') + ' },',
        '			done() { return player.dz.best.gte(1) },',
        '			effect() { return new Decimal(1.15) },',
        '			effectDisplay() { return "日影 ×" + format(this.effect()) },',
        '		},',
        '		35: {',
        '			name: function() { return ' + L('候历既成', 'The Pentad Calendar') + ' },',
        '			description: function() { return ' + L('开启七十二候图。', 'Open the 72-pentad chart.') + ' },',
        '			done() { return hasUpgrade("al", 25) },',
        '			effect() { return new Decimal(1.15) },',
        '			effectDisplay() { return "日影 ×" + format(this.effect()) },',
        '		},',
        '		36: {',
        '			name: function() { return ' + L('一阳来复', 'The Yang Returns') + ' },',
        '			description: function() { return ' + L('完成一次八节试。', 'Complete one trial.') + ' },',
        '			done() { return totalTrialCompletions() >= 1 },',
        '			effect() { return new Decimal(1.25) },',
        '			effectDisplay() { return "日影 ×" + format(this.effect()) },',
        '		},',
        '		41: {',
        '			name: function() { return ' + L('岁功既成', 'The Year Is Complete') + ' },',
        '			description: function() { return ' + L('买下岁功成。', 'Buy 岁功成.') + ' },',
        '			done() { return hasUpgrade("sui", 15) },',
        '			effect() { return new Decimal(3) },',
        '			effectDisplay() { return "日影 ×" + format(this.effect()) },',
        '		},',
        '	},',
        '	tabFormat: [',
        '		["display-text", function() { return ' + L('碑数 <b>" + player.a.achievements.length + "</b> / " + achievementTotal() + "　（每碑皆赠日影）',
            '<b>" + player.a.achievements.length + "</b> / " + achievementTotal() + " stones (each one gives 日影)') + ' }],',
        '		"blank",',
        '		["achievements", [1, 2, 3, 4]],',
        '	],',
        '})',
        '',
        '/* ---- 农书 / n — the story dashboard (12 chapters, one per month-pair) ------ */',
        'addLayer("n", {',
        '	name: function() { return ' + L('农书', 'The Farming Book') + ' },',
        '	symbol: function() { return ' + L('书', 'N') + ' },',
        '	row: "side",',
        '	startData() { return { unlocked: true, points: new Decimal(0), chapters: 0 } },',
        '	color: "#B0BEC5",',
        '	resource: function() { return ' + L('章', 'chapters') + ' },',
        '	baseResource: function() { return ' + L('日影', 'sun-shadow') + ' },',
        '	layerShown() { return true },',
        '	type: "none",',
        '	infoboxes: {',
        '		1: {',
        '			title: function() { return ' + L('孟春之月', 'The First Month of Spring') + ' },',
        '			body: function() { return ' + L('「孟春之月，日在营室，昏参中，旦尾中。东风解冻，蛰虫始振，鱼上冰。」<br><br>——《礼记·月令》<br><br>圭表立于庭中，日影一寸一寸地挪。测出立春的那天，一年才算开始。',
            '"In the first month of spring the sun is in Yingshi; at dusk Shen culminates, at dawn Wei. The east wind thaws the ice, hibernating insects stir, fish rise to the ice."<br><br>— The Book of Rites, Monthly Ordinances<br><br>The gnomon stands in the yard; its shadow creeps inch by inch. The day you measure 立春 is the day the year begins.') + ' },',
        '			unlocked() { return true },',
        '		},',
        '		2: {',
        '			title: function() { return ' + L('仲春之月', 'The Second Month of Spring') + ' },',
        '			body: function() { return ' + L('「仲春之月，日夜分，雷乃发声，始电，蛰虫咸动，启户始出。」<br><br>春分者，阴阳相半也。影长与夜漏相等的那一天，昼夜各半。',
            '"In the second month of spring day and night are equal; thunder sounds, lightning begins, and the hibernating insects all stir and open their doors."<br><br>At 春分 the yin and the yang are half and half — the day the shadow equals the water-clock.') + ' },',
        '			unlocked() { return player.cf.unlocked },',
        '		},',
        '		3: {',
        '			title: function() { return ' + L('孟夏之月', 'The First Month of Summer') + ' },',
        '			body: function() { return ' + L('「孟夏之月，蝼蝈鸣，蚯蚓出，王瓜生，苦菜秀。」<br><br>立夏开渠，引水入田。雨量不满，渠不可开。',
            '"In the first month of summer the mole crickets sing, earthworms emerge, snake gourds grow, sow thistles flower."<br><br>At 立夏 the canal is opened and water led into the fields — and the canal cannot be opened until the gauge is full.') + ' },',
        '			unlocked() { return player.lx.unlocked },',
        '		},',
        '		4: {',
        '			title: function() { return ' + L('仲夏之月', 'The Second Month of Summer') + ' },',
        '			body: function() { return ' + L('「仲夏之月，日长至，阴阳争，死生分。鹿角解，蝉始鸣，半夏生。」<br><br>夏至影最短。此后一阴生，影一日长于一日。',
            '"In the second month of summer the day reaches its longest; yin and yang contend, death and life part. Deer shed their antlers, cicadas begin to sing, pinellia sprouts."<br><br>At 夏至 the shadow is shortest. Thereafter a single yin is born and the shadow grows longer every day.') + ' },',
        '			unlocked() { return player.xz.unlocked },',
        '		},',
        '		5: {',
        '			title: function() { return ' + L('孟秋之月', 'The First Month of Autumn') + ' },',
        '			body: function() { return ' + L('「孟秋之月，凉风至，白露降，寒蝉鸣。鹰乃祭鸟，用始行戮。」<br><br>立秋之日，凉风先至。影始长，而暑未尽。',
            '"In the first month of autumn cool winds arrive, white dew falls, cicadas grow cold. Hawks lay out their prey."<br><br>On the day of 立秋 the cool wind comes first; the shadow begins to lengthen while the heat has not yet gone.') + ' },',
        '			unlocked() { return player.lq.unlocked },',
        '		},',
        '		6: {',
        '			title: function() { return ' + L('仲秋之月', 'The Second Month of Autumn') + ' },',
        '			body: function() { return ' + L('「仲秋之月，雷始收声，蛰虫坯户，水始涸。日夜分，则同度量，平权衡。」<br><br>秋分与春分，影长相同而气相反 —— 一者生，一者收。',
            '"In the second month of autumn thunder ceases, insects seal their burrows, the waters dry. Day and night are equal: measures are unified and the scales balanced."<br><br>秋分 and 春分 cast the same shadow, but their qi is opposite — one opens, one closes.') + ' },',
        '			unlocked() { return player.qf.unlocked },',
        '		},',
        '		7: {',
        '			title: function() { return ' + L('孟冬之月', 'The First Month of Winter') + ' },',
        '			body: function() { return ' + L('「孟冬之月，水始冰，地始冻，雉入大水为蜃。天子始裘。」<br><br>立冬之日，水始冰。测影的手开始僵。',
            '"In the first month of winter water begins to freeze, the ground begins to freeze, pheasants turn to clams. The Son of Heaven puts on furs."<br><br>On the day of 立冬 the water begins to freeze, and the hand that measures the shadow begins to stiffen.') + ' },',
        '			unlocked() { return player.ld.unlocked },',
        '		},',
        '		8: {',
        '			title: function() { return ' + L('仲冬之月', 'The Second Month of Winter') + ' },',
        '			body: function() { return ' + L('「仲冬之月，日短至，阴阳争，诸生荡。蚯蚓结，麋角解，水泉动。」<br><br>冬至影最长。一阳生，数九始 —— 数到九九八十一日，春天就回来了。',
            '"In the second month of winter the day reaches its shortest; yin and yang contend. Earthworms knot, elks shed their antlers, the springs begin to move."<br><br>At 冬至 the shadow is longest. The first yang is born and the counting of nines begins — count to eighty-one days and spring is back.') + ' },',
        '			unlocked() { return player.dz.unlocked },',
        '		},',
        '		9: {',
        '			title: function() { return ' + L('历书', 'The Almanac') + ' },',
        '			body: function() { return ' + L('「乃命大史，守典奉法，司天日月星辰之行，宿离不贷，毋失经纪，以初为常。」<br><br>七十二候，就是一本写在时间里的农书。',
            '"The Grand Scribe is charged to keep the records and hold to the methods, to oversee the movements of sun, moon and stars, letting no lodge or mansion go astray, and to make the beginning the constant."<br><br>The seventy-two pentads are a farming book written into time itself.') + ' },',
        '			unlocked() { return player.al.unlocked },',
        '		},',
        '		10: {',
        '			title: function() { return ' + L('一岁', 'One Year') + ' },',
        '			body: function() { return ' + L('三百六十五日有奇为一岁。岁复一岁，而候不异；候不异，而历愈精。<br><br>岁功既成，则圭表无影可测 —— 因为影已经测尽了。',
            'Three hundred and sixty-five days and a little more make a year. Year after year the pentads do not change; the pentads do not change, and the calendar grows finer.<br><br>When the year is complete there is no shadow left to measure — because every shadow has been measured.') + ' },',
        '			unlocked() { return player.sui.unlocked },',
        '		},',
        '		11: {',
        '			title: function() { return ' + L('岁祭', 'The Ritual of the Year') + ' },',
        '			body: function() { return ' + L('岁祭者，祭岁也。一岁既成，则告于天：今年之候，尽在此卷。',
            'The 岁祭 is the sacrifice to the year. When a year is complete it is announced to heaven: the pentads of this year are all in this scroll.') + ' },',
        '			unlocked() { return player.years >= 1 },',
        '		},',
        '		12: {',
        '			title: function() { return ' + L('终章', 'The Last Chapter') + ' },',
        '			body: function() { return ' + L('「以初为常。」<br><br>七十二候尽，二十四气周。圭表无影可测，历法无岁可推 —— 岁功成。<br><br>而明年，东风又会解冻。',
            '"Make the beginning the constant."<br><br>Seventy-two pentads, twenty-four terms, and the circle closes. No shadow left to measure, no year left to reckon — the work of the year is done.<br><br>And next year the east wind will thaw the ice again.') + ' },',
        '			unlocked() { return isEndgame() },',
        '		},',
        '	},',
        '	tabFormat: [',
        '		["display-text", function() { return ' + L('农书 —— 十二篇，随候而开。<br>已开 <b>" + nChapters() + "</b> / 12',
            'The Farming Book — twelve chapters, opened by the pentads.<br><b>" + nChapters() + "</b> / 12 open') + ' }],',
        '		"blank",',
        '		["infobox", 1], ["infobox", 2], ["infobox", 3], ["infobox", 4],',
        '		["infobox", 5], ["infobox", 6], ["infobox", 7], ["infobox", 8],',
        '		["infobox", 9], ["infobox", 10], ["infobox", 11], ["infobox", 12],',
        '	],',
        '})',
        'function nChapters() {',
        '	let n = 0',
        '	if (player.lc.unlocked) n++',
        '	if (player.cf.unlocked) n++',
        '	if (player.lx.unlocked) n++',
        '	if (player.xz.unlocked) n++',
        '	if (player.lq.unlocked) n++',
        '	if (player.qf.unlocked) n++',
        '	if (player.ld.unlocked) n++',
        '	if (player.dz.unlocked) n++',
        '	if (player.al.unlocked) n++',
        '	if (player.sui.unlocked) n++',
        '	if (player.years >= 1) n++',
        '	if (isEndgame()) n++',
        '	return n',
        '}',
        '',
        '/* ---- 统计·设置 / o -------------------------------------------------------- */',
        '/* 存档搬运: the engine\'s own Export button is btoa(JSON.stringify(player)), and btoa',
        ' * is Latin1-only. This game\'s microtab keys ARE the bilingual labels (D10), so',
        ' * player.subtabs always holds Chinese and the engine\'s button throws and does nothing',
        ' * — silently, because the error never reaches the page. These two helpers are the same',
        ' * round trip through a UTF-8-safe codec (design-brief D22). */',
        'function saveToText() {',
        '	let bytes = new TextEncoder().encode(JSON.stringify(player))',
        '	let bin = ""',
        '	for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])',
        '	return btoa(bin)',
        '}',
        'function loadFromText(str) {',
        '	let bin = atob(str)',
        '	let bytes = new Uint8Array(bin.length)',
        '	for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)',
        '	let obj = JSON.parse(new TextDecoder().decode(bytes))',
        '	tempPlr = Object.assign(getStartPlayer(), obj)',
        '	player = tempPlr',
        '	player.versionType = getModID()',
        '	fixSave()',
        '	versionCheck()',
        '	save()',
        '	window.location.reload()',
        '}',
        'addLayer("o", {',
        '	name: function() { return ' + L('统计 · 设置', 'Stats & Settings') + ' },',
        '	symbol: function() { return ' + L('设', 'O') + ' },',
        '	row: "side",',
        '	startData() { return { unlocked: true, points: new Decimal(0) } },',
        '	color: "#9CCC65",',
        '	resource: function() { return ' + L('—', '—') + ' },',
        '	baseResource: function() { return ' + L('日影', 'sun-shadow') + ' },',
        '	layerShown() { return true },',
        '	type: "none",',
        '	update(diff) {',
        '		// P11 alternate path: the two backfill stones grant the first two automation',
        '		// stones of 立春 / 春分 early, so a player who never buys them is not stuck.',
        '		// (the !hasMilestone guard is the idempotence guard — hasMilestone IS the',
        '		//  array-includes test, so one check covers both.)',
        '		if (hasAchievement("a", 31) && !hasMilestone("lc", 1) && player.lc.best.gte(8)) player.lc.milestones.push(1)',
        '		if (hasAchievement("a", 41) && !hasMilestone("cf", 1) && player.cf.best.gte(8)) player.cf.milestones.push(1)',
        '	},',
        '	clickables: {',
        '		11: {',
        '			title: function() { return zh() ? "语言：中文（点击切至 English）" : "Language: English (click for 中文)" },',
        '			display: function() { return zh() ? "当前：<b>中文</b>" : "current: <b>English</b>" },',
        '			canClick() { return true },',
        '			onClick() { player.lang = zh() ? "en" : "zh" },',
        '			style() { return { "width": "320px", "height": "60px" } },',
        '		},',
        '		12: {',
        '			title: function() { return ' + L('重置市货', 'Respec markets') + ' },',
        '			display: function() { return ' + L('退还所有历筹买货，重买（会强制一次修历）。',
            'Refund every almanac purchase and buy again (forces a 修历).') + ' },',
        '			canClick() { return hasMilestone("al", 0) },',
        '			onClick() { respecBuyables("al") },',
        '			style() { return { "width": "320px", "height": "60px" } },',
        '		},',
        '		13: {',
        '			title: function() { return ' + L('导出存档', 'Export save') + ' },',
        '			display: function() { return ' + L('复制存档到剪贴板（UTF-8 安全）。<br>引擎自带的导出按钮对本作会静默失败 —— 见 brief D22。',
            'Copy the save to the clipboard (UTF-8 safe).<br>The engine\'s own export button fails silently on this game — see brief D22.') + ' },',
        '			canClick() { return true },',
        '			onClick() {',
        '				let el = document.createElement("textarea")',
        '				el.value = saveToText()',
        '				document.body.appendChild(el)',
        '				el.select()',
        '				el.setSelectionRange(0, 99999)',
        '				document.execCommand("copy")',
        '				document.body.removeChild(el)',
        '			},',
        '			style() { return { "width": "320px", "height": "60px" } },',
        '		},',
        '		14: {',
        '			title: function() { return ' + L('导入存档', 'Import save') + ' },',
        '			display: function() { return ' + L('粘贴一段存档文本并覆盖当前进度（会重载页面）。',
            'Paste a save string to overwrite the current run (reloads the page).') + ' },',
        '			canClick() { return true },',
        '			onClick() {',
        '				let str = prompt(' + L('粘贴存档：', 'Paste the save:') + ')',
        '				if (!str) return',
        '				try { loadFromText(str.trim()) }',
        '				catch (e) { alert(' + L('导入失败：" + e.message', 'Import failed: " + e.message') + ') }',
        '			},',
        '			style() { return { "width": "320px", "height": "60px" } },',
        '		},',
        '	},',
        '	tabFormat: [',
        '		["display-text", function() { return ' + L('<h3>统计</h3>', '<h3>Statistics</h3>') + ' }],',
        '		["display-text", function() {',
        '			return ' + L('日影 <b>" + format(player.points) + "</b>　·　日影产 <b>" + format(tmp.pointGen) + "</b>/秒',
            '日影 <b>" + format(player.points) + "</b> · output <b>" + format(tmp.pointGen) + "</b>/s"') + ' +',
        '				"<br>" + ' + L('已历节气 <b>" + termsReached() + "</b> / 24　·　已察候 <b>" + houObserved() + "</b> / 72',
            'terms <b>" + termsReached() + "</b> / 24 · pentads <b>" + houObserved() + "</b> / 72"') + ' +',
        '				"<br>" + ' + L('连中之数 <b>" + player.lc.shadowStreak + "</b>（最高 " + player.lc.shadowBest + "）　·　开渠 <b>" + player.lx.canals + "</b> 次　·　数九 <b>" + player.dz.nine + "</b> / 81',
            'streak <b>" + player.lc.shadowStreak + "</b> (best " + player.lc.shadowBest + ") · canals <b>" + player.lx.canals + "</b> · nines <b>" + player.dz.nine + "</b> / 81"') + ' +',
        '				"<br>" + ' + L('岁祭 <b>" + player.years + "</b> 次　·　试成 <b>" + totalTrialCompletions() + "</b> / 24　·　碑 <b>" + player.a.achievements.length + "</b> / " + achievementTotal()',
            'rituals <b>" + player.years + "</b> · trials <b>" + totalTrialCompletions() + "</b> / 24 · stones <b>" + player.a.achievements.length + "</b> / " + achievementTotal()') + '',
        '		}],',
        '		"blank",',
        '		["display-text", function() { return ' + L('<h3>设置</h3>', '<h3>Settings</h3>') + ' }],',
        '		["clickables", [1]],',
        '		"blank",',
        '		["display-text", function() { return ' + L('<i>岁复一岁，可继续推历。</i>', "<i>A year is never the last one.</i>") + ' }],',
        '	],',
        '})',
        '',
    ].join('\n')
}

function emitTree() {
    return [
        '/* =============================================================================',
        ' *  tree.js — the tree layout (design-brief §5).',
        ' *',
        ' *  One row per 节, 立春 at the bottom, 岁 crowning the year. 历 branches off',
        ' *  立春 alongside 春分 — the calendar is printed from the first 立春.',
        ' *',
        ' *  layoutInfo is NOT optional: utils/save.js:13 reads layoutInfo.startTab when it',
        ' *  builds a new save (a missing layoutInfo is a ReferenceError inside load(), which',
        ' *  leaves player undefined and the game a blank page), and startNavTab must name a',
        ' *  layer that exists — hence the tree-tab layer below, the engine\'s left-hand',
        ' *  nav tab (utils.js:165 special-cases its id).',
        ' * ========================================================================= */',
        '',
        'var layoutInfo = {',
        '	startTab: "none",       // open on the tree itself: the wheel is the game\'s map',
        '	startNavTab: "tree-tab",',
        '	showTree: true,',
        '	treeLayout: "",         // empty -> the engine sorts the layers by row/position',
        '}',
        '',
        '/* The eight 节 nodes need no declaration here: their row/position/branches are',
        ' * layer properties (canvas.js draws tmp[layer].branches), and addNode() would',
        ' * overwrite the layer definition — see branchesOf() in tools/gen_layers.js. */',
        '',
        'addLayer("tree-tab", {',
        '	tabFormat: [["tree", function() { return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS) }]],',
        '	previousTab: "",',
        '	leftTab: true,',
        '})',
        '',
    ].join('\n')
}

/* =============================================================================
 *  9. Go
 * ========================================================================== */
console.log("gen_layers: emitting from js/tuning.js (version " + TUNING.version + ")")
NODES.forEach((n, i) => write(n.file, emitNode(n, i)))
write("almanac.js", emitAlmanac())
write("sui.js", emitSui())
write("side.js", emitSide())
fs.writeFileSync(path.join(JS_DIR, "tree.js"), emitTree().replace(/\r\n/g, '\n'), "utf8")
console.log("  wrote js/tree.js")
console.log("done — 8 节 files + almanac + sui + side + tree")
