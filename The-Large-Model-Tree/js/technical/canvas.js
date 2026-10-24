// Tree branches, drawn as SVG (dir-1 print system: ink rules instead of canvas strokes).
// The element id stays "treeCanvas" so every engine call site (resizeCanvas / needsCanvasUpdate)
// keeps working; it is an <svg> now, and the drawing primitives below build SVG lines.
var canvas;
var svgNS = "http://www.w3.org/2000/svg";

window.addEventListener("resize", (_=>resizeCanvas()));

function retrieveCanvasData() {
	let treeCanv = document.getElementById("treeCanvas")
	let treeTab = document.getElementById("treeTab")
	if (treeCanv===undefined||treeCanv===null) return false;
	canvas = treeCanv;
	return true;
}

function resizeCanvas() {
	if (!retrieveCanvasData()) return
	canvas.setAttribute("width", window.innerWidth);
	canvas.setAttribute("height", window.innerHeight);
		drawTree();
}


var colors_theme

function drawTree() {
	if (!retrieveCanvasData()) return;
	while (canvas.firstChild) canvas.removeChild(canvas.firstChild);
	for (layer in layers){
		if (tmp[layer].layerShown == true && tmp[layer].branches){
			for (branch in tmp[layer].branches)
				{
					drawTreeBranch(layer, tmp[layer].branches[branch])
				}
		}
		drawComponentBranches(layer, tmp[layer].upgrades, "upgrade-")
		drawComponentBranches(layer, tmp[layer].buyables, "buyable-")
		drawComponentBranches(layer, tmp[layer].clickables, "clickable-")

	}
}

function drawComponentBranches(layer, data, prefix) {
	for(id in data) {
		if (data[id].branches) {
			for (branch in data[id].branches)
				{
					drawTreeBranch(id, data[id].branches[branch], prefix + layer + "-")
				}

			}

		}
}

function drawTreeBranch(num1, data, prefix) { // was canvas 2D (Antimatter Dimensions lineage); now an SVG line
	let num2 = data
	let color_id = 1
	let width = 15
	if (Array.isArray(data)){
		num2 = data[0]
		color_id = data[1]
		width = data[2] || width
	}

	if(typeof(color_id) == "number")
		color_id = colors_theme[color_id]
	if (prefix) {
		num1 = prefix + num1
		num2 = prefix + num2
	}
	if (document.getElementById(num1) == null || document.getElementById(num2) == null)
		return

	let start = document.getElementById(num1).getBoundingClientRect();
    let end = document.getElementById(num2).getBoundingClientRect();
    let x1 = start.left + (start.width / 2) + document.body.scrollLeft;
    let y1 = start.top + (start.height / 2) + document.body.scrollTop;
    let x2 = end.left + (end.width / 2) + document.body.scrollLeft;
    let y2 = end.top + (end.height / 2) + document.body.scrollTop;
	// print system: branch weight is a fixed ink rule, not the engine's fat glow
	width = Math.max(1, Math.min(2.5, width / 8));
	let line = document.createElementNS(svgNS, "line");
	line.setAttribute("x1", x1);
	line.setAttribute("y1", y1);
	line.setAttribute("x2", x2);
	line.setAttribute("y2", y2);
	line.setAttribute("stroke", color_id);
	line.setAttribute("stroke-width", width);
	canvas.appendChild(line);
}
