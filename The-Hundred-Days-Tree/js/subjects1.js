// subjects1.js — 物理 / 化学 / 生物（row 1，P8a custom 分数层；首课到达时自解锁）

// ===================== 物理 =====================
addLayer("phy", {
    name: "物理",
    symbol: "物",
    position: 0,
    color: "#9775fa",
    resource: "物理掌握",
    row: 1,
    branches: ["mat"],
    startData() {
        return {
            unlocked: false, // 第四节物理（10:15）到达时解锁
            points: new Decimal(0),
            total: new Decimal(0),
            best: new Decimal(0),
            att: new Decimal(0),
            notes: new Decimal(0),
            mastery: 0,
        }
    },
    baseResource: "物理专注",
    baseAmount() { return player.phy.att },
    requires: new Decimal(0),
    type: "custom",
    resetsNothing() { return true },
    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        layerDataReset(this.layer, ["unlocked", "best", "total", "milestones", "notes", "buyables", "mastery"])
    },
    canReset() { if ((player.phy.resetTime || 0) < TUNING.SETTLE_COOLDOWN) return false // 结算冷却
        return player.phy.att.gte(1) },
    autoPrestige() { return hasMilestone("eve", 3) && !periodFeeds(this.layer) && player.phy.att.gte(1) },
    getResetGain() {
        return player.phy.att.div(TUNING.SETTLE_DIV).pow(TUNING.SETTLE_POW).times(subjectSettleMult("phy"))
    },
    getNextAt() { return new Decimal(0) },
    prestigeButtonText() {
        return "下课结算<br>+" + format(tmp.phy.resetGain) + " 掌握"
    },
    onPrestige(gain) {
        player.phy.notes = player.phy.notes.add(gain)
        player.phy.att = new Decimal(0) // 结算消耗专注池
    },
    layerShown() { return player.phy.unlocked },
    tooltipLocked() { return "10:15 第一节物理课见" },
    hotkeys: [
        { key: "a", description: "a: 物理下课结算", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    update(diff) {
        if (!player.phy.unlocked) {
            if (minutesToday() >= SUBJ_FIRST_CLASS.phy) player.phy.unlocked = true
            return
        }
        var p = currentPeriod()
        if (isGaokaoDay() || !p.subj || p.subj.indexOf("phy") < 0) return
        var rate = TUNING.ATT_RATE
        if (inChallenge("train", 21)) rate *= 0.5 // 理综模拟：积累减半
        if (hasMilestone("phy", 2)) rate *= 1.5
        rate *= isSignedNow() ? TUNING.ATT_SIGNED : absentFloor()
        rate *= energyFactor()
        rate *= subjectAccrualMult("phy")
        player.phy.att = player.phy.att.add(rate * diff)
    },
    tabFormat: [
        ["display-text", function () {
            var sc = subjectScore("phy")
            var start = Math.min(150, 120 + 2 * masteryLevel("phy") + (safeUpgrade("phy", 22) ? 5 : 0))
            return "<b style='font-size:1.5em;color:#9775fa'>物理 " + sc.toFixed(1) + "</b> / 150（理综按 2/3 折入总分）" +
                (start < 150 ? "　<span style='opacity:.6'>软帽起点 " + start + "（熟练度可推迟）</span>" : "　<span style='color:#51cf66'>软帽已消除</span>")
        }],
        ["display-text", function () {
            return "掌握 " + format(player.phy.points) + "（累计 " + format(player.phy.total) + "）· 笔记 " + format(player.phy.notes) +
                " · 专注池 " + formatWhole(player.phy.att)
        }],
        "prestige-button",
        ["display-text", function () {
            var p = currentPeriod()
            if (p.subj && p.subj.indexOf("phy") >= 0)
                return "正在上课：" + p.name + "，专注积累中 ×" + (isSignedNow() ? "1.0" : absentFloor()) + (player.energy < TUNING.ENERGY_LOW ? "（犯困 ×0.5）" : "")
            return "<span style='opacity:.6'>当前时段没有物理课</span>"
        }],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "升级": { content: [["blank", "8px"], "upgrades"] },
            "里程碑": { content: [["blank", "8px"], "milestones"] },
            "教辅": {
                content: [["blank", "8px"],
                    ["display-text", function () { return "用<b>物理笔记</b>买教辅。" }],
                    "buyables"],
                unlocked() { return safeUpgrade("phy", 15) },
            },
            "说明": { content: [["blank", "8px"], ["infobox", "howto"]] },
        },
    },
    infoboxes: {
        howto: {
            title: "物理怎么学",
            body() { return "第四、八节是物理课。数学好，物理才好——13 号升级用数学掌握反哺结算。<br>熟练度 5 级后物理积累永久 ×1.5。" },
        },
    },
    upgrades: {
        11: {
            title: "推导过程规范化",
            description: "物理专注积累 ×1.3。",
            cost: new Decimal(1),
            currencyDisplayName: "物理笔记",
            currencyInternalName: "notes",
            currencyLayer: "phy",
        },
        12: {
            title: "建模笔记",
            description: "物理结算 ×1.3。",
            cost: new Decimal(3),
            currencyDisplayName: "物理笔记",
            currencyInternalName: "notes",
            currencyLayer: "phy",
        },
        13: {
            title: "数理不分家",
            description: "数学掌握反哺物理——结算随数学掌握增长。",
            cost: new Decimal(10),
            currencyDisplayName: "物理笔记",
            currencyInternalName: "notes",
            currencyLayer: "phy",
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return player.mat.points.add(1).log10().add(1).pow(0.5) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        14: {
            title: "题感强化",
            description: "熟练度带来的结算加成变为 ^1.1。",
            cost: new Decimal(40),
            currencyDisplayName: "物理笔记",
            currencyInternalName: "notes",
            currencyLayer: "phy",
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        15: {
            title: "教辅·高中物理一本通",
            description: "解锁物理教辅。",
            cost: new Decimal(150),
            currencyDisplayName: "物理笔记",
            currencyInternalName: "notes",
            currencyLayer: "phy",
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        21: {
            title: "实验课状态",
            description: "第四、八节时段：物理专注积累 ×1.5。",
            cost: new Decimal(500),
            currencyDisplayName: "物理笔记",
            currencyInternalName: "notes",
            currencyLayer: "phy",
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
        22: {
            title: "受力分析通达",
            description: "物理分数软帽起点 +5。",
            cost: new Decimal(1500),
            currencyDisplayName: "物理笔记",
            currencyInternalName: "notes",
            currencyLayer: "phy",
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
        23: {
            title: "错题本常翻",
            description: "错题池反哺物理——结算随错题池缓慢增长。",
            cost: new Decimal(4000),
            currencyDisplayName: "物理笔记",
            currencyInternalName: "notes",
            currencyLayer: "phy",
            unlocked() { return hasUpgrade(this.layer, 22) },
            effect() { return new Decimal(1 + Math.pow(player.wrongPool || 0, 0.3) * 0.1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: {
            title: "心无旁骛",
            description: "物理专注积累 ×1.8。",
            cost: new Decimal(1e4),
            currencyDisplayName: "物理笔记",
            currencyInternalName: "notes",
            currencyLayer: "phy",
            unlocked() { return hasUpgrade(this.layer, 23) },
        },
        25: {
            title: "物理课代表",
            description: "全科目专注积累 ×1.05。",
            cost: new Decimal(2.5e4),
            currencyDisplayName: "物理笔记",
            currencyInternalName: "notes",
            currencyLayer: "phy",
            unlocked() { return hasUpgrade(this.layer, 24) },
        },
    },
    milestones: {
        0: {
            requirementDescription: "一节课攒 1200 物理专注",
            effectDescription: "物理结算 ×1.5",
            done() { return player.phy.att.gte(1200) },
        },
        1: {
            requirementDescription: "累计结算 25 物理掌握",
            effectDescription: "物理专注积累 ×1.3",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player.phy.total.gte(25) },
        },
        2: {
            requirementDescription: "物理熟练度 5 级（75 点）",
            effectDescription: "物理专注积累永久 ×1.5",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return (player.phy.mastery || 0) >= 75 },
        },
        3: {
            requirementDescription: "物理 100 分",
            effectDescription: "全科目专注积累 ×1.02",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return subjectScore("phy") >= 100 },
        },
    },
    buyables: {
        11: {
            title: "《高中物理一本通》",
            cost(x) { return new Decimal(50).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.15, x) },
            display() {
                return "物理专注积累 ×" + format(this.effect(getBuyableAmount(this.layer, this.id))) +
                    "<br>等级：" + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>费用：" + format(this.cost(getBuyableAmount(this.layer, this.id))) + " 物理笔记"
            },
            canAfford() { return player.phy.notes.gte(tmp.phy.buyables[11].cost) },
            buy() {
                var c = tmp.phy.buyables[11].cost
                player.phy.notes = player.phy.notes.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
    },
})

// ===================== 化学 =====================
addLayer("chem", {
    name: "化学",
    symbol: "化",
    position: 1,
    color: "#ffa94d",
    resource: "化学掌握",
    row: 1,
    branches: ["chi"],
    startData() {
        return {
            unlocked: false, // 第五节化学（11:05）到达时解锁
            points: new Decimal(0),
            total: new Decimal(0),
            best: new Decimal(0),
            att: new Decimal(0),
            notes: new Decimal(0),
            mastery: 0,
        }
    },
    baseResource: "化学专注",
    baseAmount() { return player.chem.att },
    requires: new Decimal(0),
    type: "custom",
    resetsNothing() { return true },
    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        layerDataReset(this.layer, ["unlocked", "best", "total", "milestones", "notes", "buyables", "mastery"])
    },
    canReset() { if ((player.chem.resetTime || 0) < TUNING.SETTLE_COOLDOWN) return false // 结算冷却
        return player.chem.att.gte(1) },
    autoPrestige() { return hasMilestone("eve", 3) && !periodFeeds(this.layer) && player.chem.att.gte(1) },
    getResetGain() {
        return player.chem.att.div(TUNING.SETTLE_DIV).pow(TUNING.SETTLE_POW).times(subjectSettleMult("chem"))
    },
    getNextAt() { return new Decimal(0) },
    prestigeButtonText() {
        return "下课结算<br>+" + format(tmp.chem.resetGain) + " 掌握"
    },
    onPrestige(gain) {
        player.chem.notes = player.chem.notes.add(gain)
        player.chem.att = new Decimal(0) // 结算消耗专注池
    },
    layerShown() { return player.chem.unlocked },
    tooltipLocked() { return "11:05 第一节化学课见" },
    hotkeys: [
        { key: "s", description: "s: 化学下课结算", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    update(diff) {
        if (!player.chem.unlocked) {
            if (minutesToday() >= SUBJ_FIRST_CLASS.chem) player.chem.unlocked = true
            return
        }
        var p = currentPeriod()
        if (isGaokaoDay() || !p.subj || p.subj.indexOf("chem") < 0) return
        var rate = TUNING.ATT_RATE
        if (inChallenge("train", 21)) rate *= 0.5 // 理综模拟：积累减半
        if (hasMilestone("chem", 2)) rate *= 1.5
        rate *= isSignedNow() ? TUNING.ATT_SIGNED : absentFloor()
        rate *= energyFactor()
        rate *= subjectAccrualMult("chem")
        player.chem.att = player.chem.att.add(rate * diff)
    },
    tabFormat: [
        ["display-text", function () {
            var sc = subjectScore("chem")
            var start = Math.min(150, 120 + 2 * masteryLevel("chem") + (safeUpgrade("chem", 22) ? 5 : 0))
            return "<b style='font-size:1.5em;color:#ffa94d'>化学 " + sc.toFixed(1) + "</b> / 150（理综按 2/3 折入总分）" +
                (start < 150 ? "　<span style='opacity:.6'>软帽起点 " + start + "（熟练度可推迟）</span>" : "　<span style='color:#51cf66'>软帽已消除</span>")
        }],
        ["display-text", function () {
            return "掌握 " + format(player.chem.points) + "（累计 " + format(player.chem.total) + "）· 笔记 " + format(player.chem.notes) +
                " · 专注池 " + formatWhole(player.chem.att)
        }],
        "prestige-button",
        ["display-text", function () {
            var p = currentPeriod()
            if (p.subj && p.subj.indexOf("chem") >= 0)
                return "正在上课：" + p.name + "，专注积累中 ×" + (isSignedNow() ? "1.0" : absentFloor()) + (player.energy < TUNING.ENERGY_LOW ? "（犯困 ×0.5）" : "")
            return "<span style='opacity:.6'>当前时段没有化学课</span>"
        }],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "升级": { content: [["blank", "8px"], "upgrades"] },
            "里程碑": { content: [["blank", "8px"], "milestones"] },
            "教辅": {
                content: [["blank", "8px"],
                    ["display-text", function () { return "用<b>化学笔记</b>买教辅。" }],
                    "buyables"],
                unlocked() { return safeUpgrade("chem", 15) },
            },
            "说明": { content: [["blank", "8px"], ["infobox", "howto"]] },
        },
    },
    infoboxes: {
        howto: {
            title: "化学怎么学",
            body() { return "第五节与晚修三（理综）是化学时段。审题靠语文——13 号升级用语文掌握反哺结算。<br>午间小练答对的化学题直接给专注。" },
        },
    },
    upgrades: {
        11: {
            title: "方程式预习",
            description: "化学专注积累 ×1.3。",
            cost: new Decimal(1),
            currencyDisplayName: "化学笔记",
            currencyInternalName: "notes",
            currencyLayer: "chem",
        },
        12: {
            title: "实验记录规范",
            description: "化学结算 ×1.3。",
            cost: new Decimal(3),
            currencyDisplayName: "化学笔记",
            currencyInternalName: "notes",
            currencyLayer: "chem",
        },
        13: {
            title: "审题功底",
            description: "语文掌握反哺化学审题——结算随语文掌握增长。",
            cost: new Decimal(10),
            currencyDisplayName: "化学笔记",
            currencyInternalName: "notes",
            currencyLayer: "chem",
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return player.chi.points.add(1).log10().add(1).pow(0.5) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        14: {
            title: "题感强化",
            description: "熟练度带来的结算加成变为 ^1.1。",
            cost: new Decimal(40),
            currencyDisplayName: "化学笔记",
            currencyInternalName: "notes",
            currencyLayer: "chem",
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        15: {
            title: "教辅·高中化学一本通",
            description: "解锁化学教辅。",
            cost: new Decimal(150),
            currencyDisplayName: "化学笔记",
            currencyInternalName: "notes",
            currencyLayer: "chem",
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        21: {
            title: "午练状态",
            description: "第五节与晚修三时段：化学专注积累 ×1.5。",
            cost: new Decimal(500),
            currencyDisplayName: "化学笔记",
            currencyInternalName: "notes",
            currencyLayer: "chem",
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
        22: {
            title: "方程式通达",
            description: "化学分数软帽起点 +5。",
            cost: new Decimal(1500),
            currencyDisplayName: "化学笔记",
            currencyInternalName: "notes",
            currencyLayer: "chem",
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
        23: {
            title: "错题本常翻",
            description: "错题池反哺化学——结算随错题池缓慢增长。",
            cost: new Decimal(4000),
            currencyDisplayName: "化学笔记",
            currencyInternalName: "notes",
            currencyLayer: "chem",
            unlocked() { return hasUpgrade(this.layer, 22) },
            effect() { return new Decimal(1 + Math.pow(player.wrongPool || 0, 0.3) * 0.1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: {
            title: "心无旁骛",
            description: "化学专注积累 ×1.8。",
            cost: new Decimal(1e4),
            currencyDisplayName: "化学笔记",
            currencyInternalName: "notes",
            currencyLayer: "chem",
            unlocked() { return hasUpgrade(this.layer, 23) },
        },
        25: {
            title: "化学课代表",
            description: "全科目专注积累 ×1.05。",
            cost: new Decimal(2.5e4),
            currencyDisplayName: "化学笔记",
            currencyInternalName: "notes",
            currencyLayer: "chem",
            unlocked() { return hasUpgrade(this.layer, 24) },
        },
    },
    milestones: {
        0: {
            requirementDescription: "一节课攒 1200 化学专注",
            effectDescription: "化学结算 ×1.5",
            done() { return player.chem.att.gte(1200) },
        },
        1: {
            requirementDescription: "累计结算 25 化学掌握",
            effectDescription: "化学专注积累 ×1.3",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player.chem.total.gte(25) },
        },
        2: {
            requirementDescription: "化学熟练度 5 级（75 点）",
            effectDescription: "化学专注积累永久 ×1.5",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return (player.chem.mastery || 0) >= 75 },
        },
        3: {
            requirementDescription: "化学 100 分",
            effectDescription: "全科目专注积累 ×1.02",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return subjectScore("chem") >= 100 },
        },
    },
    buyables: {
        11: {
            title: "《高中化学一本通》",
            cost(x) { return new Decimal(50).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.15, x) },
            display() {
                return "化学专注积累 ×" + format(this.effect(getBuyableAmount(this.layer, this.id))) +
                    "<br>等级：" + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>费用：" + format(this.cost(getBuyableAmount(this.layer, this.id))) + " 化学笔记"
            },
            canAfford() { return player.chem.notes.gte(tmp.chem.buyables[11].cost) },
            buy() {
                var c = tmp.chem.buyables[11].cost
                player.chem.notes = player.chem.notes.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
    },
})

// ===================== 生物 =====================
addLayer("bio", {
    name: "生物",
    symbol: "生",
    position: 2,
    color: "#20c997",
    resource: "生物掌握",
    row: 1,
    branches: ["chem"],
    startData() {
        return {
            unlocked: false, // 第六节生物（14:00）到达时解锁
            points: new Decimal(0),
            total: new Decimal(0),
            best: new Decimal(0),
            att: new Decimal(0),
            notes: new Decimal(0),
            mastery: 0,
        }
    },
    baseResource: "生物专注",
    baseAmount() { return player.bio.att },
    requires: new Decimal(0),
    type: "custom",
    resetsNothing() { return true },
    doReset(resettingLayer) {
        if (!(layers[resettingLayer].row > this.row)) return
        layerDataReset(this.layer, ["unlocked", "best", "total", "milestones", "notes", "buyables", "mastery"])
    },
    canReset() { if ((player.bio.resetTime || 0) < TUNING.SETTLE_COOLDOWN) return false // 结算冷却
        return player.bio.att.gte(1) },
    autoPrestige() { return hasMilestone("eve", 3) && !periodFeeds(this.layer) && player.bio.att.gte(1) },
    getResetGain() {
        return player.bio.att.div(TUNING.SETTLE_DIV).pow(TUNING.SETTLE_POW).times(subjectSettleMult("bio"))
    },
    getNextAt() { return new Decimal(0) },
    prestigeButtonText() {
        return "下课结算<br>+" + format(tmp.bio.resetGain) + " 掌握"
    },
    onPrestige(gain) {
        player.bio.notes = player.bio.notes.add(gain)
        player.bio.att = new Decimal(0) // 结算消耗专注池
    },
    layerShown() { return player.bio.unlocked },
    tooltipLocked() { return "14:00 第一节生物课见" },
    hotkeys: [
        { key: "d", description: "d: 生物下课结算", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    update(diff) {
        if (!player.bio.unlocked) {
            if (minutesToday() >= SUBJ_FIRST_CLASS.bio) player.bio.unlocked = true
            return
        }
        var p = currentPeriod()
        if (isGaokaoDay() || !p.subj || p.subj.indexOf("bio") < 0) return
        var rate = TUNING.ATT_RATE
        if (inChallenge("train", 21)) rate *= 0.5 // 理综模拟：积累减半
        if (hasMilestone("bio", 2)) rate *= 1.5
        rate *= isSignedNow() ? TUNING.ATT_SIGNED : absentFloor()
        rate *= energyFactor()
        rate *= subjectAccrualMult("bio")
        player.bio.att = player.bio.att.add(rate * diff)
    },
    tabFormat: [
        ["display-text", function () {
            var sc = subjectScore("bio")
            var start = Math.min(150, 120 + 2 * masteryLevel("bio") + (safeUpgrade("bio", 22) ? 5 : 0))
            return "<b style='font-size:1.5em;color:#20c997'>生物 " + sc.toFixed(1) + "</b> / 150（理综按 2/3 折入总分）" +
                (start < 150 ? "　<span style='opacity:.6'>软帽起点 " + start + "（熟练度可推迟）</span>" : "　<span style='color:#51cf66'>软帽已消除</span>")
        }],
        ["display-text", function () {
            return "掌握 " + format(player.bio.points) + "（累计 " + format(player.bio.total) + "）· 笔记 " + format(player.bio.notes) +
                " · 专注池 " + formatWhole(player.bio.att)
        }],
        "prestige-button",
        ["display-text", function () {
            var p = currentPeriod()
            if (p.subj && p.subj.indexOf("bio") >= 0)
                return "正在上课：" + p.name + "，专注积累中 ×" + (isSignedNow() ? "1.0" : absentFloor()) + (player.energy < TUNING.ENERGY_LOW ? "（犯困 ×0.5）" : "")
            return "<span style='opacity:.6'>当前时段没有生物课</span>"
        }],
        ["microtabs", "stuff"],
    ],
    microtabs: {
        stuff: {
            "升级": { content: [["blank", "8px"], "upgrades"] },
            "里程碑": { content: [["blank", "8px"], "milestones"] },
            "教辅": {
                content: [["blank", "8px"],
                    ["display-text", function () { return "用<b>生物笔记</b>买教辅。" }],
                    "buyables"],
                unlocked() { return safeUpgrade("bio", 15) },
            },
            "说明": { content: [["blank", "8px"], ["infobox", "howto"]] },
        },
    },
    infoboxes: {
        howto: {
            title: "生物怎么学",
            body() { return "第六节与晚修三（理综）是生物时段。遗传计算靠化学——13 号升级用化学掌握反哺结算。<br>午休睡饱了下午的生物课效率更高。" },
        },
    },
    upgrades: {
        11: {
            title: "图表预习",
            description: "生物专注积累 ×1.3。",
            cost: new Decimal(1),
            currencyDisplayName: "生物笔记",
            currencyInternalName: "notes",
            currencyLayer: "bio",
        },
        12: {
            title: "背诵笔记",
            description: "生物结算 ×1.3。",
            cost: new Decimal(3),
            currencyDisplayName: "生物笔记",
            currencyInternalName: "notes",
            currencyLayer: "bio",
        },
        13: {
            title: "化学计算反哺",
            description: "化学掌握反哺生物遗传题——结算随化学掌握增长。",
            cost: new Decimal(10),
            currencyDisplayName: "生物笔记",
            currencyInternalName: "notes",
            currencyLayer: "bio",
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() { return player.chem.points.add(1).log10().add(1).pow(0.5) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        14: {
            title: "题感强化",
            description: "熟练度带来的结算加成变为 ^1.1。",
            cost: new Decimal(40),
            currencyDisplayName: "生物笔记",
            currencyInternalName: "notes",
            currencyLayer: "bio",
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        15: {
            title: "教辅·高中生物一本通",
            description: "解锁生物教辅。",
            cost: new Decimal(150),
            currencyDisplayName: "生物笔记",
            currencyInternalName: "notes",
            currencyLayer: "bio",
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        21: {
            title: "午休满血状态",
            description: "第六节与晚修三时段：生物专注积累 ×1.5。",
            cost: new Decimal(500),
            currencyDisplayName: "生物笔记",
            currencyInternalName: "notes",
            currencyLayer: "bio",
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
        22: {
            title: "遗传学通达",
            description: "生物分数软帽起点 +5。",
            cost: new Decimal(1500),
            currencyDisplayName: "生物笔记",
            currencyInternalName: "notes",
            currencyLayer: "bio",
            unlocked() { return hasUpgrade(this.layer, 21) },
        },
        23: {
            title: "错题本常翻",
            description: "错题池反哺生物——结算随错题池缓慢增长。",
            cost: new Decimal(4000),
            currencyDisplayName: "生物笔记",
            currencyInternalName: "notes",
            currencyLayer: "bio",
            unlocked() { return hasUpgrade(this.layer, 22) },
            effect() { return new Decimal(1 + Math.pow(player.wrongPool || 0, 0.3) * 0.1) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        24: {
            title: "心无旁骛",
            description: "生物专注积累 ×1.8。",
            cost: new Decimal(1e4),
            currencyDisplayName: "生物笔记",
            currencyInternalName: "notes",
            currencyLayer: "bio",
            unlocked() { return hasUpgrade(this.layer, 23) },
        },
        25: {
            title: "生物课代表",
            description: "全科目专注积累 ×1.05。",
            cost: new Decimal(2.5e4),
            currencyDisplayName: "生物笔记",
            currencyInternalName: "notes",
            currencyLayer: "bio",
            unlocked() { return hasUpgrade(this.layer, 24) },
        },
    },
    milestones: {
        0: {
            requirementDescription: "一节课攒 1200 生物专注",
            effectDescription: "生物结算 ×1.5",
            done() { return player.bio.att.gte(1200) },
        },
        1: {
            requirementDescription: "累计结算 25 生物掌握",
            effectDescription: "生物专注积累 ×1.3",
            unlocked() { return hasMilestone(this.layer, 0) },
            done() { return player.bio.total.gte(25) },
        },
        2: {
            requirementDescription: "生物熟练度 5 级（75 点）",
            effectDescription: "生物专注积累永久 ×1.5",
            unlocked() { return hasMilestone(this.layer, 1) },
            done() { return (player.bio.mastery || 0) >= 75 },
        },
        3: {
            requirementDescription: "生物 100 分",
            effectDescription: "全科目专注积累 ×1.02",
            unlocked() { return hasMilestone(this.layer, 2) },
            done() { return subjectScore("bio") >= 100 },
        },
    },
    buyables: {
        11: {
            title: "《高中生物一本通》",
            cost(x) { return new Decimal(50).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1.15, x) },
            display() {
                return "生物专注积累 ×" + format(this.effect(getBuyableAmount(this.layer, this.id))) +
                    "<br>等级：" + formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>费用：" + format(this.cost(getBuyableAmount(this.layer, this.id))) + " 生物笔记"
            },
            canAfford() { return player.bio.notes.gte(tmp.bio.buyables[11].cost) },
            buy() {
                var c = tmp.bio.buyables[11].cost
                player.bio.notes = player.bio.notes.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
    },
})
