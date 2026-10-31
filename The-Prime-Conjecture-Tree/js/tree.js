// T2 language toggle — a tree-tab button (P17; default English, preference in the save)
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
        ["raw-html", function() {
            return "<button class='btn' style='margin-bottom:8px' onclick='toggleLang()'>" +
                (player.chinesemode ? "Switch to English" : "切换到中文") + "</button>"
        }],
        ["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}],
    ],
    previousTab: "",
    leftTab: true,
})
