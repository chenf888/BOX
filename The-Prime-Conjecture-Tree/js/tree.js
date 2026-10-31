// T2 language toggle — lives in the OPTIONS screen now (same .opt toggle style as the
// other settings, per player request); preference persists in the save as chinesemode.
function toggleLang() { player.chinesemode = !player.chinesemode }

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
        ["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}],
    ],
    previousTab: "",
    leftTab: true,
})
