var layoutInfo = {
    startTab: "none",
    startNavTab: "tree-tab",
	showTree: true,

    treeLayout: ""

    
}


// A "ghost" layer which offsets other layers in the tree
addNode("blank", {
    layerShown: "ghost",
}, 
)


addLayer("tree-tab", {
    tabFormat: [
        ["blank", "6px"],
        ["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}],
    ],
    previousTab: "",
    leftTab: true,
})

// The language toggle lives on the Options page now (user request 2026-11-01), in the
// engine's own .opt button style. The options-tab system component's template is extended
// at runtime — mod files run BEFORE loadVue compiles it, so no engine file is edited and
// the button inherits the exact stock table style. The label binds options.chinesemode
// (reactive) so the toggle updates in place; tt() is deliberately NOT used here because
// only root-data names resolve inside this component's template scope.
;
(function () {
    // Legacy migration: getStartOptions default honors the pre-options localStorage key.
    // This file executes AFTER utils/options.js (loader-injected mod files run last), so
    // getStartOptions exists here — it does NOT exist yet where mod.js runs (index.html:21).
    const legacyLang = (() => { try { return localStorage.getItem(modInfo.id + ".lang") === "zh" } catch (e) { return false } })()
    if (typeof getStartOptions === "function" && !getStartOptions.toString().includes("chinesemode")) {
        const base = getStartOptions
        window.getStartOptions = function () { return Object.assign(base(), { chinesemode: legacyLang }) }   // deliberate engine-hook override (function declarations live on window)
    }
    // Language toggle on the Options page (user request 2026-11-01), stock .opt style.
    const t = window.systemComponents && systemComponents["options-tab"]
    if (t && typeof t.template === "string" && t.template.indexOf("toggleLang") < 0) {
        t.template = t.template.replace("</table>",
            `<tr>
                <td><button class="opt" onclick="toggleLang()">{{ options.chinesemode ? "语言：中文" : "Language: English" }}</button></td>
            </tr>
        </table>`)
    }
    // Microtab buttons render their KEY as the label; prefer our tabLabel() when present.
    const tb = window.systemComponents && systemComponents["tab-buttons"]
    if (tb && typeof tb.template === "string" && tb.template.indexOf("tabLabel") < 0) {
        tb.template = tb.template.replace(">{{tab}}</button>",
            ">{{ (data[tab] && data[tab].tabLabel) ? data[tab].tabLabel : tab }}</button>")
    }
    // Hotkey descriptions are tt() functions now; the stock info-tab prints the raw value.
    const it = window.systemComponents && systemComponents["info-tab"]
    if (it && typeof it.template === "string" && it.template.indexOf("key.description === \"function\"") < 0) {
        it.template = it.template.replace("{{key.description}}",
            '{{ (typeof key.description === "function") ? key.description() : key.description }}')
    }
    // drawTree iterates `layers` and reads tmp[layer] — on a rare boot frame a layer can be
    // registered while setupTemp has not filled tmp yet (intermittent ~1-in-9 reloads:
    // "Cannot read properties of undefined (reading 'layerShown')" at canvas.js:31). Skip
    // that frame; the next needCanvasUpdate redraw completes the tree.
    if (typeof window.drawTree === "function" && !window.drawTree.__ttSafe) {
        const orig = window.drawTree
        const safe = function () { try { return orig.apply(this, arguments) } catch (e) { /* pre-tmp frame: skip */ } }
        safe.__ttSafe = true
        window.drawTree = safe
    }
})()
