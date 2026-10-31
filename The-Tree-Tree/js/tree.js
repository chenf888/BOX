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
        ["display-text", function () {
            return window.chinesemode
                ? "<span style='opacity:.7'>当前语言：中文</span> <a href='#' onclick='toggleLang(); return false' style='color:#ffd966'>Switch to English</a>"
                : "<span style='opacity:.7'>Current language: English</span> <a href='#' onclick='toggleLang(); return false' style='color:#ffd966'>切换到中文</a>"
        }],
        ["blank", "6px"],
        ["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}],
    ],
    previousTab: "",
    leftTab: true,
})
