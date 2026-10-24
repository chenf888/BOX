// ************ Themes — "Training Program Print" system (direction dir-1) ************
// Two paper editions. Branch colors: 1 = ink (active), 2 = dead ink, 3 = rule gray.
var themes = ["default", "edition-b"]

var colors = {
	default: {
		1: "#161412",//Branch color 1 — ink
		2: "#6d675a",//Branch color 2 — dead ink
		3: "#c9c2ae",//Branch color 3 — rule gray
		color: "#161412",
		points: "#D02700",
		locked: "#EAE4D3",
		background: "#F2EEE3",
		background_tooltip: "rgba(242, 238, 227, 0.97)",
	},
	"edition-b": {
		1: "#111111",
		2: "#6d675a",
		3: "#c9c2ae",
		color: "#111111",
		points: "#D02700",
		locked: "#EFEFEA",
		background: "#FBFAF7",
		background_tooltip: "rgba(251, 250, 247, 0.97)",
	},
}
function changeTheme() {

	colors_theme = colors[options.theme || "default"] || colors["default"]; // 旧存档里可能是 "aqua" —— 回落到 default
	document.body.style.setProperty('--background', colors_theme["background"]);
	document.body.style.setProperty('--background_tooltip', colors_theme["background_tooltip"]);
	document.body.style.setProperty('--color', colors_theme["color"]);
	document.body.style.setProperty('--points', colors_theme["points"]);
	document.body.style.setProperty("--locked", colors_theme["locked"]);
	document.body.style.setProperty('--paper', colors_theme["background"]);
}
function getThemeName() {
	return options.theme? options.theme : "default";
}

function switchTheme() {
	let index = themes.indexOf(options.theme)
	if (options.theme === null || index >= themes.length-1 || index < 0) {
		options.theme = themes[0];
	}
	else {
		index ++;
		options.theme = themes[index];
	}
	changeTheme();
	resizeCanvas();
}
