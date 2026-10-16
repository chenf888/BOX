/* =============================================================================
 *  tree.js — the tree layout (design-brief §5).
 *
 *  One row per 节, 立春 at the bottom, 岁 crowning the year. 历 branches off
 *  立春 alongside 春分 — the calendar is printed from the first 立春.
 *
 *  layoutInfo is NOT optional: utils/save.js:13 reads layoutInfo.startTab when it
 *  builds a new save (a missing layoutInfo is a ReferenceError inside load(), which
 *  leaves player undefined and the game a blank page), and startNavTab must name a
 *  layer that exists — hence the tree-tab layer below, the engine's left-hand
 *  nav tab (utils.js:165 special-cases its id).
 * ========================================================================= */

var layoutInfo = {
	startTab: "none",       // open on the tree itself: the wheel is the game's map
	startNavTab: "tree-tab",
	showTree: true,
	treeLayout: "",         // empty -> the engine sorts the layers by row/position
}

/* The eight 节 nodes need no declaration here: their row/position/branches are
 * layer properties (canvas.js draws tmp[layer].branches), and addNode() would
 * overwrite the layer definition — see branchesOf() in tools/gen_layers.js. */

addLayer("tree-tab", {
	tabFormat: [["tree", function() { return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS) }]],
	previousTab: "",
	leftTab: true,
})
