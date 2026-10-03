var layoutInfo = {
    startTab: "none",
    startNavTab: "tree-tab",
    showTree: true,
}

// ---------------------------------------------------------------------------
// Spiral-galaxy tree layout.
// Core row 0 = the galactic bar (horizontal, center). The four arm lanes wind
// outward on a logarithmic-ish spiral (26 deg per row, one lane per quadrant).
// The zoom-out spine rises from the bar like a deep-field jet.
// Cells: .treeNode is 100px + 10px margins wide, rows ~110px tall.
// ---------------------------------------------------------------------------
function buildGalaxyLayout() {
    const CELL_W = 120, CELL_H = 110, UNIT = 95;
    const CX = 30, CY = 17;             // galactic center in grid cells
    const X_STRETCH = 1.75;              // widen the spiral to match its height
    const occupied = new Set();
    const place = new Map();
    const key = (r, c) => r * 1000 + c;
    function tryPlace(id, rowF, colF, th) {
        // target cell; on collision nudge OUTWARD along the local spiral direction
        // (keeps each arm a smooth curve instead of snapping to arbitrary gaps)
        let rF = rowF, cF = colF, guard = 0;
        for (;;) {
            const r0 = Math.round(rF), c0 = Math.round(cF);
            if (r0 >= 0 && c0 >= 0 && !occupied.has(key(r0, c0))) {
                occupied.add(key(r0, c0));
                place.set(id, [r0, c0]);
                return;
            }
            guard++;
            if (guard > 40) { occupied.add(key(r0, c0)); place.set(id, [r0, c0]); return; }
            const rad = Math.sqrt((cF - CX) * (cF - CX) * CELL_W * CELL_W + (rF - CY) * (rF - CY) * CELL_H * CELL_H) / UNIT + 0.35;
            const ang = th === undefined ? Math.atan2((rF - CY) * CELL_H, (cF - CX) * CELL_W) : th + guard * 0.12;
            cF = CX + rad * Math.cos(ang) * UNIT * X_STRETCH / CELL_W;
            rF = CY + rad * Math.sin(ang) * UNIT / CELL_H;
        }
    }

    // galactic bar: the ignition sequence, horizontal through the center
    ["gc", "ps", "fu", "pl"].forEach((id, i) => tryPlace(id, CY, CX - 1.5 + i));

    // four spiral arms, one node per lane per ring
    const arms = ["or", "pe", "sg", "oa"];
    const dTheta = 40 * Math.PI / 180;
    for (let i = 1; i <= 22; i++) {
        for (let a = 0; a < 4; a++) {
            const th = a * Math.PI / 2 + i * dTheta;
            const rad = (3.7 + i * 0.55) * UNIT;
            const px = rad * X_STRETCH * Math.cos(th);
            const py = rad * Math.sin(th);
            tryPlace(arms[a - 0] + i, CY - py / CELL_H, CX + px / CELL_W, th);
        }
    }

    // the zoom-out trail: a horizontal row of eight hubs directly beneath the
    // page header, centered so LN/CW sit right under the title. The galaxy sits
    // below it; the trail never touches the arms.
    {
        const ids = ["mw", "lg", "vc", "ln", "cw", "ga", "de", "hr"];
        ids.forEach((id, i) => tryPlace(id, 1.2, CX + (i - 3.5) * 1.5));
    }

    // emit rows (trim leading/trailing blanks per row)
    let minR = 1e9, maxR = -1e9, minC = 1e9, maxC = -1e9;
    for (const [r, c] of place.values()) {
        minR = Math.min(minR, r); maxR = Math.max(maxR, r);
        minC = Math.min(minC, c); maxC = Math.max(maxC, c);
    }
    const at = new Map();
    for (const [id, [r, c]] of place) at.set(r * 1000 + c, id);
    const layout = [];
    for (let r = minR; r <= maxR; r++) {
        const row = [];
        for (let c = minC; c <= maxC; c++) row.push(at.get(r * 1000 + c) || "blank");
        layout.push(row);
    }
    return layout;
}
layoutInfo.treeLayout = buildGalaxyLayout();
if (typeof treeView !== "undefined") treeView.minScale = 0.07;

// ghost spacer node used by the layout above
addNode("blank", {
    layerShown: "ghost",
})

addLayer("tree-tab", {
    tabFormat: [
        ["display-text", function() { return '<h3 style="color:#cfe8ff;margin-top:8px">The Galaxy Nebula</h3>' }],
        ["display-text", function() { return 'A barred spiral: the ignition bar at the heart, four arms winding outward, and the zoom-out trail across the top. Scroll to zoom, drag to pan.' }],
        "blank",
        ["tree", function() { return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS) }],
    ],
    previousTab: "",
    leftTab: true,
})
