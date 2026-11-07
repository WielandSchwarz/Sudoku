  // ===================== the aquarium up close (v2): close to the glass, a square glass tank filling the picture,
  // the goldfish with friends (a snail on the glass, two shrimps, a little school of neons). Feed and play. =====================
  var AQ_W = 180, AQ_H = 135, AQ_CX = 90, AQ_CY = 68, AQ_RX = 78, AQ_RY = 60, AQ_WL = 26, AQ_FB = 98;
  var AD = "#3a2414", AG = "#2e6a2e", Ag = "#4e9a44", Al = "#86cc62", AL = "#b4e48a";
  // the places: six at the back of the gravel, three at the front, one on the rim, one on the water
  var AQ_SL = [{ x: 30, y: 101, k: "f" }, { x: 50, y: 99, k: "f" }, { x: 70, y: 98, k: "f" }, { x: 110, y: 98, k: "f" }, { x: 130, y: 99, k: "f" }, { x: 150, y: 101, k: "f" },
    { x: 44, y: 116, k: "f" }, { x: 90, y: 120, k: "f" }, { x: 136, y: 116, k: "f" }, { x: 60, y: 8, k: "r" }, { x: 90, y: AQ_WL, k: "t" }];
  var AQ_DEF = ["seegras", "pest", "burg", "", "ludwig", "seegras", "moos", "kiste", "", "", ""];
  var aqEl = xEl("div", "bee-pov fi-pov aq-pov", scene); aqEl.hidden = true;
  aqEl.innerHTML = '<canvas width="180" height="135" class="fi-cv aq-cv"></canvas><div class="aq-toast" hidden></div><div class="fi-card" hidden></div><button type="button" class="bp-x" aria-label="Aquarium schließen">×</button>';
  var aqCv = aqEl.querySelector("canvas"), aqc = aqCv.getContext("2d"); aqc.imageSmoothingEnabled = false;
  var aqCard = aqEl.querySelector(".fi-card"), aqToast = aqEl.querySelector(".aq-toast");
  var aqBar = document.createElement("div"); aqBar.className = "aq-bar"; aqBar.style.display = "none"; scene.parentNode.insertBefore(aqBar, scene.nextSibling);   // the buttons sit under the picture, like the stoker's panel
  function aP(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
  function aqSt() { var L = life(); if (!L.aq || L.aq.v !== 3) L.aq = { v: 3, s: AQ_DEF.slice(), kind: L.aq && L.aq.kind }; L.aq.s = AQ_INT[AQ_INTER].s.slice(); return L.aq; }
  // ---- the tank: square glass that fills the picture. Three looks to choose from:
  // "klassik" a black-framed tank with a lid and a lamp on a wooden cabinet, "blick" seen a little from above and from the side so the water surface
  // and the right-hand pane show, "nano" a rimless glass cube with a white lid, a painted plant background and dark soil ----
  var AQ_STYLE = "klassik", AQ_G = null;
  // three insides to choose from: "zen" calm and simple (sand, big stones, a green carpet, a slim white-and-red fish), "maerchen" colourful and busy
  // (a little wreck, red plants, a chest, a toadstool house, a round chubby fish with big eyes), "dschungel" a nature tank (dark soil, a big root with moss and ferns, a long-finned fish)
  var AQ_INTER = "dschungel", AQ_INT = {
    zen: { s: ["", "fels", "", "felsk", "fels", ""].concat(["teppich", "teppich", "teppich", "", ""]), sub: "sand", deep: ["#d0f0f6", "#b8e8f2", "#a0dcec", "#8ad0e6", "#78c4de", "#68b6d6", "#5aa8cc", "#4e9ac2"], fish: "tancho" },
    maerchen: { s: ["ludwig", "pest", "wrack", "seegras", "ludwig", "seegras"].concat(["muschel", "kiste", "pilz", "", "frosch"]), sub: "bunt", deep: AQ_DEEP0(), fish: "chibi" },
    dschungel: { s: ["farn", "wurzel2", "", "pest", "seegras", "farn"].concat(["moos", "steine", "farn", "", ""]), sub: "erde", deep: ["#b0dcc8", "#98d0b8", "#80c2a8", "#6cb49a", "#5aa68c", "#4c9880", "#408a74", "#367c68"], fish: "ryukin" } };
  function AQ_DEEP0() { return ["#c4ecf8", "#a8e0f4", "#8ed2ee", "#78c4e6", "#64b4dc", "#52a2d0", "#4490c2", "#3a7eb2"]; }
  var AQ_GEO = { klassik: { x0: 5, x1: 175, y0: 12, y1: 123, wl: 19, fb: 95 }, blick: { x0: 4, x1: 150, y0: 20, y1: 126, wl: 24, fb: 96, side: 26, up: 12 }, nano: { x0: 9, x1: 171, y0: 17, y1: 125, wl: 24, fb: 97 } };
  var aqBg = document.createElement("canvas"); aqBg.width = AQ_W; aqBg.height = AQ_H; var aqWater = new Uint8Array(AQ_W * AQ_H), aqGrav = new Uint8Array(AQ_W * AQ_H);
  var aqFront = document.createElement("canvas"); aqFront.width = AQ_W; aqFront.height = AQ_H;
  var aqL = document.createElement("canvas"); aqL.width = AQ_W; aqL.height = AQ_H; var aqLc = aqL.getContext("2d"); aqLc.imageSmoothingEnabled = false;
  var aqMask = document.createElement("canvas"); aqMask.width = AQ_W; aqMask.height = AQ_H;
  var AQ_DEEP = ["#c4ecf8", "#a8e0f4", "#8ed2ee", "#78c4e6", "#64b4dc", "#52a2d0", "#4490c2", "#3a7eb2"];
  function aqIn(x, y) { var G = AQ_G; return x >= G.x0 && x < G.x1 && y >= G.y0 && y < G.y1; }
  function aqEll(x, y) { return aqIn(x, y); }
  function aqFloorY(x) { var G = AQ_G; return Math.round(G.fb + Math.sin(x * .07) * 1.2 + (G.side ? -(x - G.x0) / (G.x1 - G.x0) * 3 : 0)); }
  function aqBuild(style) {
    AQ_STYLE = AQ_GEO[style] ? style : "klassik"; var G = AQ_G = AQ_GEO[AQ_STYLE]; AQ_WL = G.wl; AQ_FB = G.fb; aqWater.fill(0); aqGrav.fill(0);
    var c = aqBg.getContext("2d"), x, y; c.clearRect(0, 0, AQ_W, AQ_H);
    // the room behind
    for (y = 0; y < AQ_H; y++) for (x = 0; x < AQ_W; x++) aP(c, x, y, 1, 1, (x % 10 === 0 && y % 9 === 4) ? "#e4d0ac" : "#f3e7cf");
    // the cabinet or shelf under the tank
    var by = G.y1 + 1; aP(c, 0, by, AQ_W, AQ_H - by, AQ_STYLE === "nano" ? "#c8945a" : "#8a5a32"); aP(c, 0, by, AQ_W, 1, AD); aP(c, 0, by + 1, AQ_W, 2, AQ_STYLE === "nano" ? "#e0b07a" : "#b47a46");
    for (y = by + 5; y < AQ_H; y += 4) for (x = (y * 7) % 19; x < AQ_W; x += 27) aP(c, x, y, 8, 1, AQ_STYLE === "nano" ? "#b07a46" : "#6a3e22");
    // the water, gravel and back wall inside the front pane
    for (y = G.y0; y < G.y1; y++) for (x = G.x0; x < G.x1; x++) {
      var col, u = (x - G.x0) / (G.x1 - G.x0), ex = Math.min(u, 1 - u);
      if (y >= aqFloorY(x)) { var cell = (x * 7 + y * 13 + x * y) % 7, IS = AQ_INT[AQ_INTER].sub; col = IS === "sand" ? ["#f0e4c8", "#e8d8b8", "#f6ecd4", "#e0d0ae", "#ecdcc0", "#e4d4b4", "#f8f0dc"][cell] : IS === "erde" ? (y > G.y1 - 8 ? ["#c8b490", "#b8a07c", "#d8c4a0", "#a8906c", "#c0a884", "#b09878", "#d0bc98"][cell] : ["#3a2e26", "#2e241e", "#4a3a2e", "#342a22", "#40322a", "#2a221c", "#4e3e30"][cell]) : IS === "bunt" ? ["#f0b8c8", "#a8d8f0", "#f8e08a", "#c8f0b8", "#e8c8f0", "#ffffff", "#f0d0a8"][cell] : AQ_STYLE === "nano" ? (y > G.y1 - 9 ? ["#e8d8b8", "#d8c4a0", "#f0e4cc", "#c8b490", "#e0d0b0", "#d0bc98", "#ecdcc0"][cell] : ["#3a2e26", "#2e241e", "#4a3a2e", "#342a22", "#40322a", "#2a221c", "#4e3e30"][cell]) : ["#d8bc90", "#c8a878", "#e4cca4", "#b8a080", "#e0c4a8", "#bc9c74", "#ecd8b4"][cell];
        if (y - aqFloorY(x) < 2) col = AQ_INT[AQ_INTER].sub === "erde" || AQ_STYLE === "nano" ? "#1e1814" : AQ_INT[AQ_INTER].sub === "sand" ? "#c8b48c" : "#6a5440"; aqGrav[y * AQ_W + x] = 1; }
      else if (y < AQ_WL) col = AQ_STYLE === "klassik" ? ((x + y) % 2 ? "#3a3a40" : "#44444a") : ((x + y) % 2 ? "#eef8fc" : "#e4f3f9");
      else { var dv = (y - AQ_WL) / (AQ_FB - AQ_WL), v = dv * 4.2 + (ex < .08 ? (.08 - ex) * 18 : 0) - (AQ_STYLE === "nano" ? 1.6 : 0), i = Math.floor(v), f = v - i;
        col = AQ_INT[AQ_INTER].deep[Math.max(0, Math.min(7, i + (f > .5 + ((x + y) % 2) * .25 - .125 ? 1 : 0)))]; aqWater[y * AQ_W + x] = 1; }
      aP(c, x, y, 1, 1, col);
    }
    if (AQ_STYLE === "nano") { var seed = 3, R = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };   /* a painted plant background on the back glass */
      for (var p = 0; p < 26; p++) { var px = G.x0 + R() * (G.x1 - G.x0), ph = 20 + R() * 45; for (var k = 0; k < ph; k++) { var yy = Math.round(AQ_FB - k), xx = Math.round(px + Math.sin(k * .12 + p) * 3); if (aqWater[yy * AQ_W + xx]) { aP(c, xx, yy, 1, 1, k % 7 < 4 ? "#5a9a7a" : "#6aaa88"); if (k % 6 === 3) { aP(c, xx - 2, yy, 2, 1, "#78b896"); aP(c, xx + 1, yy - 1, 2, 1, "#5a9a7a"); } } } } }
    // light from the lamp: soft bright bands that fall from the top
    if (AQ_STYLE !== "blick") for (var r = 0; r < 6; r++) { var rx = G.x0 + 14 + r * 28; for (var yy2 = AQ_WL + 1; yy2 < AQ_FB - 4; yy2++) { var w = 3 + Math.round((yy2 - AQ_WL) / 16); if ((yy2 + r) % 2) aP(c, rx + Math.round((yy2 - AQ_WL) * .25), yy2, w, 1, "rgba(255,255,240,.10)"); } }
    // the water surface line
    for (x = G.x0; x < G.x1; x++) { aP(c, x, AQ_WL, 1, 1, x % 5 ? "#c8ecf8" : "#ffffff"); aP(c, x, AQ_WL + 1, 1, 1, "#a8dcf0"); }
    // the frame, the lid, the panes
    if (AQ_STYLE === "klassik") {
      aP(c, G.x0 - 5, 0, G.x1 - G.x0 + 10, G.y0, "#1e1e22"); aP(c, G.x0 - 5, 0, G.x1 - G.x0 + 10, 1, AD); aP(c, G.x0 - 4, 1, G.x1 - G.x0 + 8, 2, "#4a4a52"); aP(c, G.x0 - 5, G.y0 - 2, G.x1 - G.x0 + 10, 1, "#0e0e10");
      aP(c, G.x0, G.y0, G.x1 - G.x0, 1, "#fff4c8"); aP(c, G.x0, G.y0 + 1, G.x1 - G.x0, 1, "#e8d8a0");                                                   /* the lamp under the lid */
      aP(c, G.x0 - 5, G.y0, 5, G.y1 - G.y0, "#1e1e22"); aP(c, G.x1, G.y0, 5, G.y1 - G.y0, "#1e1e22"); aP(c, G.x0 - 4, G.y0, 1, G.y1 - G.y0, "#4a4a52"); aP(c, G.x1 + 1, G.y0, 1, G.y1 - G.y0, "#4a4a52");
      aP(c, G.x0 - 5, G.y1, G.x1 - G.x0 + 10, 3, "#1e1e22"); aP(c, G.x0 - 5, G.y1, G.x1 - G.x0 + 10, 1, "#4a4a52");
      for (x = 0; x < AQ_W; x += 1) if (x < G.x0 - 5 || x >= G.x1 + 5) { for (y = 0; y < G.y1 + 3; y++) aP(c, x, y, 1, 1, (x % 10 === 0 && y % 9 === 4) ? "#e4d0ac" : "#f3e7cf"); }
    } else if (AQ_STYLE === "nano") {
      aP(c, G.x0 - 3, G.y0 - 11, G.x1 - G.x0 + 6, 9, AD); aP(c, G.x0 - 2, G.y0 - 10, G.x1 - G.x0 + 4, 7, "#f4f4f0"); aP(c, G.x0 - 2, G.y0 - 10, G.x1 - G.x0 + 4, 1, "#ffffff"); aP(c, G.x0 - 2, G.y0 - 4, G.x1 - G.x0 + 4, 1, "#c8c8c0");
      aP(c, AQ_W / 2 - 18, G.y0 - 2, 36, 2, "#fffbe0");                                                                                              /* the LED */
      for (y = G.y0 - 2; y < G.y1 + 1; y++) { aP(c, G.x0 - 2, y, 2, 1, "#bfe6f2"); aP(c, G.x1, y, 2, 1, "#9ad0e4"); aP(c, G.x0 - 3, y, 1, 1, "#6aa8c0"); aP(c, G.x1 + 2, y, 1, 1, "#5a98b0"); }
      aP(c, G.x0 - 2, G.y1, G.x1 - G.x0 + 4, 1, "#9ad0e4");
    } else {
      // seen a little from above and from the right: the far top edge, the water surface between, the right-hand pane in shade
      var S = G.side, U = G.up;
      for (y = G.y0 - U; y < G.y0; y++) { var t1 = (y - (G.y0 - U)) / U, xa = Math.round(G.x0 + S * (1 - t1)), xb = Math.round(G.x1 + S * (1 - t1)); for (x = xa; x < xb; x++) { aP(c, x, y, 1, 1, (x + y) % 3 ? "#b8e4f4" : "#d8f2fa"); } aP(c, xa, y, 1, 1, "#6aa8c0"); }
      aP(c, G.x0 + S, G.y0 - U - 1, G.x1 - G.x0, 1, "#3a6a80");
      for (x = G.x1; x < G.x1 + S; x++) { var t2 = (x - G.x1) / S, ya = Math.round(G.y0 - U * t2), yb = Math.round(G.y1 - U * t2); for (y = ya; y < yb; y++) { var dv2 = (y - ya) / (yb - ya); aP(c, x, y, 1, 1, y < ya + 4 ? "#b8e4f4" : dv2 > .72 ? "#7a6a58" : AQ_DEEP[Math.min(7, 4 + Math.floor(dv2 * 4 + t2 * 1.5))]); } aP(c, x, ya, 1, 1, "#6aa8c0"); aP(c, x, yb, 1, 1, "#3a6a80"); }
      for (y = G.y0 - 1; y <= G.y1; y++) { aP(c, G.x0 - 1, y, 1, 1, "#6aa8c0"); aP(c, G.x1, y, 1, 1, "#9ad0e4"); } aP(c, G.x0 - 1, G.y1, G.x1 - G.x0 + 2, 1, "#3a6a80"); aP(c, G.x0 - 1, G.y0 - 1, G.x1 - G.x0 + 2, 1, "#ffffff");
    }
    // round pebbles, bigger at the front
    var sd = 7, R2 = function () { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; }, PB = AQ_INT[AQ_INTER].sub === "sand" ? [["#fff8ec", "#ece0c8", "#c8b894"]] : AQ_INT[AQ_INTER].sub === "bunt" ? [["#ffd0dc", "#f0a0b8", "#b86078"], ["#d0f0ff", "#90c8e8", "#5888a8"], ["#fff0b0", "#f0d060", "#b89830"], ["#d8ffd0", "#a0e090", "#609850"]] : AQ_INT[AQ_INTER].sub === "erde" || AQ_STYLE === "nano" ? [["#f0e4cc", "#d8c4a0", "#a8946e"], ["#d8d2c4", "#aaa496", "#6e6a5e"]] : [["#f0e2c8", "#d0bc9c", "#9a8468"], ["#d8d2c4", "#aaa496", "#6e6a5e"], ["#f0c8a8", "#c89878", "#8a5e44"], ["#e4dccc", "#b4ac9c", "#7a7466"]];
    var pts = []; for (var n = 0; n < 200; n++) pts.push([G.x0 + R2() * (G.x1 - G.x0), AQ_FB + 2 + Math.pow(R2(), .8) * (G.y1 - AQ_FB), R2(), Math.floor(R2() * PB.length)]); pts.sort(function (a, b) { return a[1] - b[1]; });
    pts.forEach(function (q) { var x2 = Math.round(q[0]), y2 = Math.round(q[1]); if (!aqGrav[y2 * AQ_W + x2]) return; if ((AQ_STYLE === "nano" || AQ_INT[AQ_INTER].sub === "erde") && y2 < G.y1 - 9 && q[2] < .7) return; if (AQ_INT[AQ_INTER].sub === "sand" && q[2] < .8) return; var dep = (y2 - AQ_FB) / (G.y1 - AQ_FB), rx2 = .8 + dep * 2.4 + q[2] * .8, ry2 = Math.max(.7, rx2 * .6), P = PB[q[3]];
      aqDisc(c, x2, y2, rx2, ry2, function (a, b, d) { if (!aqGrav[(y2 + b) * AQ_W + x2 + a]) return null; return d > .7 ? P[2] : a + b * 1.5 < -1 ? P[0] : P[1]; }); });
    // the places for the plants and the things
    var X = function (u2) { return Math.round(G.x0 + (G.x1 - G.x0) * u2); };
    AQ_SL = [{ x: X(.12), y: AQ_FB + 4, k: "f" }, { x: X(.26), y: AQ_FB + 3, k: "f" }, { x: X(.4), y: AQ_FB + 3, k: "f" }, { x: X(.6), y: AQ_FB + 3, k: "f" }, { x: X(.74), y: AQ_FB + 3, k: "f" }, { x: X(.88), y: AQ_FB + 4, k: "f" },
      { x: X(.2), y: G.y1 - 6, k: "f" }, { x: X(.5), y: G.y1 - 4, k: "f" }, { x: X(.8), y: G.y1 - 6, k: "f" }, { x: X(.3), y: G.y0, k: "r" }, { x: X(.5), y: AQ_WL, k: "t" }];
    // the shine on the front glass
    var fc = aqFront.getContext("2d"); fc.clearRect(0, 0, AQ_W, AQ_H);
    for (var k2 = 0; k2 < 46; k2++) { aP(fc, G.x0 + 10 + k2, G.y0 + 6 + k2 * 2, 1, 2, "rgba(255,255,255,.35)"); aP(fc, G.x0 + 14 + k2, G.y0 + 6 + k2 * 2, 1, 2, "rgba(255,255,255,.18)"); }
    for (var k3 = 0; k3 < 20; k3++) aP(fc, G.x1 - 30 + k3, G.y0 + 4 + k3 * 2, 1, 2, "rgba(255,255,255,.22)");
    // only inside the glass do things show
    var mc = aqMask.getContext("2d"); mc.clearRect(0, 0, AQ_W, AQ_H); aP(mc, G.x0, G.y0 + (AQ_STYLE === "klassik" ? 2 : 0), G.x1 - G.x0, G.y1 - G.y0 - (AQ_STYLE === "klassik" ? 2 : 0), "#ffffff");
  }
  aqBuild(AQ_STYLE);
  function aqFog(c) { c.globalAlpha = .16; for (var y = AQ_WL + 3; y < AQ_H; y++) { var row = -1; for (var x = 0; x <= AQ_W; x++) { var w = x < AQ_W && (aqWater[y * AQ_W + x] || aqGrav[y * AQ_W + x]); if (w && row < 0) row = x; if (!w && row >= 0) { aP(c, row, y, x - row, 1, "#2a6a9a"); row = -1; } } } c.globalAlpha = 1; }   /* water between us and the back row */
  function aqShadow(c, x, y, rx) { c.globalAlpha = .28; aqDisc(c, x + 2, y, rx, Math.max(1, rx * .28), function (a, b) { return aqGrav[(y + b) * AQ_W + x + 2 + a] ? "#2a1a10" : null; }); c.globalAlpha = 1; }
  // ---- small drawing helpers ----
  function aqDisc(c, x, y, rx, ry, fn) { for (var yy = -Math.ceil(ry); yy <= Math.ceil(ry); yy++) for (var xx = -Math.ceil(rx); xx <= Math.ceil(rx); xx++) { var d = (xx / (rx + .45)) * (xx / (rx + .45)) + (yy / (ry + .45)) * (yy / (ry + .45)); if (d > 1) continue; var col = fn(xx, yy, d); if (col) aP(c, x + xx, y + yy, 1, 1, col); } }
  function aqSw(t, k, h, ph, amp) { return Math.round(Math.sin(t / 900 + ph + k * .09) * Math.pow(k / Math.max(1, h), 1.3) * (amp || 3)); }
  function aqLeafH(c, x, y, col, dark) { aP(c, x - 2, y, 2, 1, col); aP(c, x + 1, y, 2, 1, col); aP(c, x - 2, y + 1, 5, 2, col); aP(c, x - 1, y + 3, 3, 1, col); aP(c, x, y + 4, 1, 1, col); aP(c, x, y + 1, 1, 3, dark); }   /* a heart-shaped leaf */
  // ---- everything that can be put in: bottom centre at (x, by); t for swaying, glinting and bubbling ----
  var AQ_DRAW = {
    seegras: function (c, x, by, t) { [[-6, .8, 0], [-3, 1, 1.1], [0, .92, 2.3], [3, 1, 3.1], [6, .75, 4.2], [-1, .6, 5]].forEach(function (b) { var h = Math.round((by - AQ_WL - 3) * b[1]);
        for (var k = 0; k < h; k++) { var s = aqSw(t, k, h, b[2], 4), bend = k > h - 8 && b[1] > .9 ? (k - (h - 8)) * (b[0] < 0 ? -1 : 1) : 0, yy = by - k + (bend ? Math.abs(bend) * .6 : 0), xx = x + b[0] + s + bend;
          aP(c, xx, yy, 1, 1, AG); aP(c, xx + 1, yy, 1, 1, k % 9 < 5 ? Ag : Al); if (k > 4 && k < h - 4) aP(c, xx + 2, yy, 1, 1, k % 2 ? AG : Ag); } }); },
    pest: function (c, x, by, t) { [[0, .85, 0], [5, .6, 1.4], [-5, .5, 2.6]].forEach(function (st) { var h = Math.round((by - AQ_WL - 3) * st[1]);
        for (var k = 0; k < h; k++) { var s = aqSw(t, k, h, st[2], 3), xx = x + st[0] + s, yy = by - k; aP(c, xx, yy, 1, 1, AG);
          if (k % 3 === 1 && k > 2) { var w = k > h - 6 ? 2 : 4; aP(c, xx - w, yy, w, 1, Ag); aP(c, xx + 1, yy, w, 1, Al); aP(c, xx - w - 1, yy - 1, 1, 1, AG); aP(c, xx + w + 1, yy - 1, 1, 1, Ag); aP(c, xx - 1, yy + 1, 1, 1, AG); aP(c, xx + 1, yy + 1, 1, 1, Ag); } }
        aqDisc(c, x + st[0] + aqSw(t, h, h, st[2], 3), by - h - 1, 2, 2, function (a, b) { return a + b < 0 ? AL : Al; }); }); },
    ludwig: function (c, x, by, t) { [[-5, 30, 0], [0, 42, 1.2], [5, 36, 2.4]].forEach(function (st) { var h = st[1];
        for (var k = 0; k < h; k++) { var s = aqSw(t, k, h, st[2], 2.5), xx = x + st[0] + s, yy = by - k; aP(c, xx, yy, 1, 1, "#6a3a2a");
          if (k % 6 === 4) { var top = k > h * .6, c1 = top ? "#f0705a" : "#b84838", c2 = top ? "#ffa080" : "#d86a4a", sd = (k / 6) % 2 ? 1 : -1;
            aP(c, xx + sd, yy - 1, 3 * sd > 0 ? 3 : 3, 1, c2); aP(c, sd > 0 ? xx + 1 : xx - 3, yy - 1, 3, 1, c2); aP(c, sd > 0 ? xx + 1 : xx - 3, yy, 3, 1, c1); aP(c, sd > 0 ? xx + 4 : xx - 4, yy, 1, 1, "#7a2a24");
            aP(c, sd > 0 ? xx - 2 : xx + 1, yy + 1, 2, 1, c1); } }
        aP(c, x + st[0] + aqSw(t, h, h, st[2], 2.5) - 1, by - h - 1, 3, 2, "#ff8a6a"); }); },
    farn: function (c, x, by, t) { aqDisc(c, x, by - 2, 6, 3, function (a, b, d) { return d > .7 ? "#5a564c" : b < 0 ? "#b8b2a4" : "#8a8478"; });
      [[-1.1, 20], [-.6, 26], [-.15, 24], [.35, 27], [.8, 22], [1.2, 16]].forEach(function (lf, j) { for (var i = 2; i <= lf[1]; i++) { var s = aqSw(t, i, lf[1], j * 1.3, 3), dx = Math.round(Math.sin(lf[0]) * i * .9), dy = Math.round(Math.cos(lf[0]) * i), w = i < 4 ? 1 : i > lf[1] - 3 ? 2 : 4;
        aP(c, x + dx + s - Math.floor(w / 2), by - 4 - dy, w, 1, i % 2 ? Ag : Al); aP(c, x + dx + s, by - 4 - dy, 1, 1, AG); if (w === 4 && i % 3 === 0) { aP(c, x + dx + s - 3, by - 4 - dy, 1, 1, AG); aP(c, x + dx + s + 2, by - 4 - dy, 1, 1, AG); } } }); },
    bambus: function (c, x, by, t) { [[-4, 70, 0], [0, 96, 1], [4, 82, 2]].forEach(function (st) { var h = st[1], xx = x + st[0];
        for (var k = 0; k < h; k++) { var yy = by - k; if (yy < -2) break; var node = k % 13 === 12; aP(c, xx - 1, yy, 1, 1, node ? "#5a7a2e" : "#8ab04a"); aP(c, xx, yy, 1, 1, node ? "#6a8a3a" : "#c8e08a"); aP(c, xx + 1, yy, 1, 1, node ? "#4a6a24" : "#9ac05a");
          if (node && k > h * .45) { var sd = (k / 13) % 2 ? 1 : -1, sw = Math.round(Math.sin(t / 1300 + k) * (yy < AQ_WL ? 1 : 2)); for (var q = 0; q < 9; q++) { aP(c, xx + sd * (2 + q), yy - Math.round(q * .6) + (q > 5 ? q - 5 : 0) + (q > 3 ? sw : 0), 1, 2, q % 3 ? Ag : Al); } aP(c, xx + sd * 2, yy - 1, 1, 1, AG); } } }); },
    moos: function (c, x, by, t) { aqDisc(c, x, by - 8, 9, 8, function (a, b, d) { return d > .8 ? AG : a + b < -6 ? AL : ((a * 3 + b * 5 + 99) % 4 ? (a + b < 2 ? Al : Ag) : AG); }); if ((t % 4000) < 200) aP(c, x + 2, by - 18, 1, 1, "#e8f8ff"); },
    kiste: function (c, x, by, t) { var ph = t % 8000, open = ph > 5600 ? Math.min(1, (ph - 5600) / 300) * (ph > 7600 ? Math.max(0, 1 - (ph - 7600) / 300) : 1) : 0, lift = Math.round(open * 5), x0 = x - 12;
      aP(c, x0, by - 12, 24, 12, AD); aP(c, x0 + 1, by - 11, 22, 10, "#9a6038"); for (var r = 0; r < 3; r++) aP(c, x0 + 1, by - 9 + r * 3, 22, 1, "#6a3e22"); aP(c, x0 + 4, by - 11, 2, 10, "#8a8478"); aP(c, x0 + 18, by - 11, 2, 10, "#8a8478"); aP(c, x0 + 4, by - 11, 1, 10, "#b8b2a4"); aP(c, x0 + 18, by - 11, 1, 10, "#b8b2a4");
      if (lift) { aP(c, x0 + 1, by - 14, 22, 3, "#e8b84a"); [[3, 0], [7, -1], [12, 0], [16, -1], [20, 0]].forEach(function (q, i) { aP(c, x0 + q[0], by - 15 + q[1], 2, 1, i % 2 ? "#fff1b0" : "#ffd34a"); }); aP(c, x0 + 10, by - 16, 2, 2, "#e8465a"); aP(c, x0 + 10, by - 16, 1, 1, "#ffb0b8");
        if (Math.random() < .3) aqBub(x + Math.random() * 14 - 7, by - 18, Math.random() < .4 ? 2 : 1); if (Math.floor(t / 150) % 4 === 0) aP(c, x0 + 6, by - 17, 1, 1, "#ffffff"); }
      aP(c, x0 - 1, by - 19 - lift, 26, 7, AD); aP(c, x0, by - 18 - lift, 24, 5, "#b47448"); aP(c, x0, by - 18 - lift, 24, 1, "#d8a070"); aP(c, x0, by - 14 - lift, 24, 1, "#7a4a28"); aP(c, x0 + 4, by - 18 - lift, 2, 5, "#8a8478"); aP(c, x0 + 18, by - 18 - lift, 2, 5, "#8a8478");
      aP(c, x0 + 10, by - 14 - lift, 4, 5, AD); aP(c, x0 + 11, by - 13 - lift, 2, 3, "#e8b84a"); aP(c, x0 + 11, by - 12 - lift, 1, 1, AD); aP(c, x0 + 1, by - 4, 3, 2, Ag); aP(c, x0 + 20, by - 3, 3, 2, Al); },
    burg: function (c, x, by, t) { var x0 = x - 15;
      aP(c, x0, by - 36, 11, 36, AD); aP(c, x0 + 1, by - 35, 9, 35, "#b0aa9c"); aP(c, x0 + 1, by - 35, 2, 35, "#c8c2b4"); aP(c, x0 + 8, by - 35, 2, 35, "#8a8478");
      for (var m = 0; m < 3; m++) { aP(c, x0 - 1 + m * 4, by - 40, 4, 5, AD); aP(c, x0 + m * 4, by - 39, 2, 4, "#b0aa9c"); }
      aP(c, x0 + 10, by - 22, 21, 22, AD); aP(c, x0 + 11, by - 21, 19, 21, "#bab4a6"); aP(c, x0 + 11, by - 21, 19, 1, "#d0cabc");
      for (var m2 = 0; m2 < 4; m2++) { aP(c, x0 + 11 + m2 * 5, by - 26, 4, 5, AD); aP(c, x0 + 12 + m2 * 5, by - 25, 2, 4, "#bab4a6"); }
      for (var by2 = 0; by2 < 6; by2++) for (var bx2 = 0; bx2 < 4; bx2++) aP(c, x0 + 12 + bx2 * 5 + (by2 % 2) * 2, by - 19 + by2 * 3, 3, 1, "#a09a8c");
      aP(c, x0 + 16, by - 11, 9, 11, AD); aP(c, x0 + 17, by - 10, 7, 10, "#1e2e3e"); aP(c, x0 + 18, by - 11, 5, 1, AD); aP(c, x0 + 3, by - 30, 3, 5, AD); aP(c, x0 + 4, by - 29, 1, 3, "#ffe08a"); aP(c, x0 + 3, by - 18, 3, 4, AD); aP(c, x0 + 4, by - 17, 1, 2, "#1e2e3e");
      [[1, 5, 4], [9, 2, 3], [11, 14, 3], [28, 3, 3], [2, 24, 2], [24, 18, 3]].forEach(function (q) { aP(c, x0 + q[0], by - q[1], q[2], 2, Ag); aP(c, x0 + q[0], by - q[1], 1, 1, Al); });
      aP(c, x0 + 5, by - 46, 1, 6, AD); aP(c, x0 + 6, by - 46 + Math.round(Math.sin(t / 600)), 5, 3, "#d8463c"); },
    muschel: function (c, x, by, t) { var op = Math.sin(t / 1400) > .2 ? 3 : 1;
      aqDisc(c, x, by - 3, 9, 3, function (a, b, d) { return d > .75 ? AD : b < 0 ? "#f4d0c0" : "#d8a090"; });
      aqDisc(c, x, by - 3, 5, 2, function (a, b, d) { return d > .8 ? "#c88878" : "#ffe8f0"; }); aqDisc(c, x, by - 4, 2, 2, function (a, b, d) { return a + b < -1 ? "#ffffff" : d > .7 ? "#c8c8d8" : "#f0f0ff"; });
      for (var yy = 0; yy < 9; yy++) for (var xx = -9; xx <= 9; xx++) { var d = (xx / 9.5) * (xx / 9.5) + (yy / 9) * (yy / 9); if (d > 1) continue; aP(c, x + xx, by - 5 - op - yy, 1, 1, d > .82 ? AD : Math.abs(xx) % 3 === 0 ? "#e09a90" : yy > 5 ? "#ffd8d0" : "#f8b8b0"); }
      if (Math.floor(t / 200) % 7 === 0) aP(c, x - 1, by - 5, 1, 1, "#ffffff"); },
    helm: function (c, x, by, t) { aP(c, x - 11, by - 4, 22, 4, AD); aP(c, x - 10, by - 3, 20, 2, "#8a6420"); aP(c, x - 10, by - 3, 20, 1, "#c8963a");
      aqDisc(c, x, by - 14, 10, 10, function (a, b, d) { return d > .86 ? AD : a + b < -8 ? "#fff1b0" : a + b < -2 ? "#e8b84a" : a + b < 6 ? "#c8963a" : "#9a6e1e"; });
      aqDisc(c, x - 2, by - 14, 5, 5, function (a, b, d) { return d > .75 ? "#5a4010" : a + b < -4 ? "#6ab0d0" : "#1e3a4e"; });
      [[-9, -14], [6, -21], [6, -7], [8, -14]].forEach(function (q) { aP(c, x + q[0], by + q[1], 2, 2, "#5a4010"); aP(c, x + q[0], by + q[1], 1, 1, "#fff1b0"); });
      aP(c, x - 4, by - 26, 5, 3, AD); aP(c, x - 3, by - 25, 3, 1, "#c8963a"); if ((t % 3800) < 700 && Math.random() < .35) aqBub(x - 2, by - 28, Math.random() < .5 ? 2 : 1); },
    krug: function (c, x, by, t) { aqDisc(c, x + 2, by - 7, 11, 7, function (a, b, d) { return d > .82 ? AD : b > 3 ? "#8a4a26" : b < -3 ? "#d88a5a" : (a === -2 || a === 1) ? "#e8c8a0" : "#b46a3a"; });
      aP(c, x - 15, by - 11, 7, 7, AD); aP(c, x - 14, by - 10, 5, 5, "#b46a3a"); aP(c, x - 16, by - 12, 3, 9, AD); aP(c, x - 15, by - 11, 1, 7, "#1e2e3e"); aP(c, x + 2, by - 15, 6, 3, AD); aP(c, x + 3, by - 14, 4, 1, "#d88a5a");
      if (Math.sin(t / 2100) > .6) { aP(c, x - 15, by - 9, 1, 1, "#ffffff"); aP(c, x - 14, by - 9, 1, 1, "#3a2414"); } },     /* a tiny face peeks out now and then */
    wurzel: function (c, x, by, t) { var br = [[-16, 0, 16, -1], [-2, -2, 10, -12], [4, -10, 4, -22], [-8, -1, -14, -10], [6, 0, 18, -4]];
      br.forEach(function (b) { var n = Math.max(Math.abs(b[2] - b[0]), Math.abs(b[3] - b[1])); for (var i = 0; i <= n; i++) { var u = i / n, xx = Math.round(x + b[0] + (b[2] - b[0]) * u), yy = Math.round(by + b[1] + (b[3] - b[1]) * u), w = Math.max(1, Math.round(3 - u * 2));
        aP(c, xx - 1, yy - w, 3, w + 1, AD); aP(c, xx, yy - w + 1, 1, w, "#8a5a32"); if (w > 1) aP(c, xx, yy - w + 1, 1, 1, "#b88a5a"); } });
      [[-10, -2], [2, -6], [5, -16], [12, -3]].forEach(function (q) { aP(c, x + q[0], by + q[1] - 1, 3, 1, Al); aP(c, x + q[0], by + q[1], 3, 1, Ag); }); },
    pilz: function (c, x, by, t) { aP(c, x - 6, by - 14, 12, 14, AD); aP(c, x - 5, by - 13, 10, 13, "#f4e8d0"); aP(c, x - 5, by - 13, 2, 13, "#fff8ec"); aP(c, x - 2, by - 8, 4, 8, AD); aP(c, x - 1, by - 7, 2, 7, "#8a5a32"); aP(c, x + 1, by - 4, 1, 1, "#e8b84a");
      aP(c, x + 2, by - 12, 3, 3, AD); aP(c, x + 3, by - 11, 1, 1, Math.floor(t / 900) % 3 ? "#ffe08a" : "#ffffff");
      aqDisc(c, x, by - 17, 12, 7, function (a, b, d) { return b > 2 ? null : d > .8 ? AD : (Math.abs(a + 5) < 2 && Math.abs(b + 2) < 2) || (Math.abs(a - 5) < 2 && Math.abs(b + 3) < 2) || (Math.abs(a) < 2 && Math.abs(b + 5) < 1.5) ? "#fff8ec" : b < -3 ? "#f05a48" : "#d8463c"; });
      aP(c, x - 12, by - 15, 24, 1, AD); aP(c, x - 9, by - 1, 3, 1, Ag); aP(c, x + 6, by - 1, 3, 1, Al); },
    fels: function (c, x, by) { aqDisc(c, x + 2, by - 1, 14, 4, function (a, b, d) { return aqGrav[(by - 1 + b) * AQ_W + x + 2 + a] ? "rgba(40,30,20,.25)" : null; });
      for (var yy = 0; yy < 26; yy++) { var w = Math.round(13 * Math.sqrt(1 - Math.pow(yy / 26, 1.6))), sk = Math.round(yy * .25); for (var xx = -w; xx <= w; xx++) { var e = xx === -w || xx === w || yy === 25; aP(c, x + xx + sk, by - yy, 1, 1, e ? "#4a463c" : xx + sk * .5 < -w * .3 ? "#d8d2c4" : xx > w * .45 ? "#7a756a" : (xx * 3 + yy * 7) % 13 === 0 ? "#8a8478" : "#aaa496"); } }
      for (var m = 0; m < 9; m++) aP(c, x - 8 + m * 2, by - 1 - (m % 3), 2, 1, m % 2 ? "#5aa040" : "#86cc62"); },
    felsk: function (c, x, by) { for (var yy = 0; yy < 12; yy++) { var w = Math.round(8 * Math.sqrt(1 - Math.pow(yy / 12, 1.5))); for (var xx = -w; xx <= w; xx++) aP(c, x + xx, by - yy, 1, 1, xx === -w || xx === w || yy === 11 ? "#4a463c" : xx < -w * .3 ? "#d8d2c4" : xx > w * .4 ? "#7a756a" : "#aaa496"); } },
    teppich: function (c, x, by, t) { for (var xx = -24; xx <= 24; xx++) { var h = 2 + ((xx * 7 + 99) % 4), sw = Math.round(Math.sin(t / 800 + xx * .3) * .6); for (var k = 0; k < h; k++) aP(c, x + xx + (k === h - 1 ? sw : 0), by - k, 1, 1, k === h - 1 ? "#a8e070" : (xx + k) % 2 ? "#4e9a44" : "#68b450"); } },
    wrack: function (c, x, by, t) { var x0 = x - 20;   /* a little sunken boat, tipped over in the gravel */
      for (var yy = 0; yy < 16; yy++) { var l = Math.round(Math.max(0, 6 - yy * .6)), r = 40 - Math.round(Math.max(0, (yy - 4) * .9)); for (var xx = l; xx <= r; xx++) { var e = xx === l || xx === r || yy === 0 || yy === 15; aP(c, x0 + xx, by - 15 + yy + Math.round(xx * .12), 1, 1, e ? AD : yy % 4 === 1 ? "#6a4228" : xx < 14 ? "#9a6a44" : "#8a5a38"); } }
      aP(c, x0 + 22, by - 30, 2, 18, AD); aP(c, x0 + 23, by - 29, 1, 16, "#8a5a38"); aP(c, x0 + 24, by - 28, 9, 6, "#e8e0d0"); aP(c, x0 + 24, by - 28, 9, 1, "#c8c0b0"); aP(c, x0 + 26, by - 25, 3, 2, "#d8463c");
      aP(c, x0 + 10, by - 8, 3, 3, AD); aP(c, x0 + 11, by - 7, 1, 1, "#1e3a4e"); aP(c, x0 + 18, by - 7, 3, 3, AD); aP(c, x0 + 19, by - 6, 1, 1, "#1e3a4e"); if ((t % 3000) < 300 && Math.random() < .3) aqBub(x0 + 11, by - 10, 1);
      [[3, -2], [30, 0], [16, -1]].forEach(function (q) { aP(c, x0 + q[0], by + q[1] - 2, 4, 2, "#5aa040"); aP(c, x0 + q[0] + 1, by + q[1] - 3, 2, 1, "#86cc62"); }); },
    wurzel2: function (c, x, by, t) { var br = [[-26, 0, 22, -2, 4], [-6, -2, 4, -40, 3], [2, -18, 18, -46, 2], [-2, -14, -22, -38, 2], [6, -4, 26, -22, 3], [-14, -1, -28, -16, 2]];
      br.forEach(function (b) { var n = Math.max(Math.abs(b[2] - b[0]), Math.abs(b[3] - b[1])); for (var i = 0; i <= n; i++) { var u = i / n, xx = Math.round(x + b[0] + (b[2] - b[0]) * u + Math.sin(u * 5) * 2), yy = Math.round(by + b[1] + (b[3] - b[1]) * u), w = Math.max(1, Math.round(b[4] * (1 - u * .6)));
        aP(c, xx - 1, yy - w, w + 2, w + 1, AD); aP(c, xx, yy - w + 1, w, w, "#7a4e2c"); aP(c, xx, yy - w + 1, 1, 1, "#a87448"); if (i % 5 === 2) { aP(c, xx - 1, yy - w - 1, 3, 1, "#5aa040"); aP(c, xx, yy - w - 2, 1, 1, "#86cc62"); } } });
      [[-6, -40], [18, -46], [-22, -38], [26, -22]].forEach(function (q, j) { for (var f = 0; f < 6; f++) { var s2 = aqSw(t, f, 6, j, 2); aP(c, x + q[0] - 3 + f + s2, q[1] + by - 2 - Math.round(Math.abs(f - 2.5)), 1, 2, f % 2 ? "#4e9a44" : "#86cc62"); } }); },
    steine: function (c, x, by) { [[-10, 6, 4, "#a8a294"], [0, 8, 6, "#8a8478"], [10, 5, 4, "#b8b2a4"], [-4, 3, 2, "#c8c2b4"], [6, 3, 2, "#9a9284"]].forEach(function (q) { aqDisc(c, x + q[0], by - q[2], q[1], q[2], function (a, b, d) { return d > .75 ? "#4a463c" : a + b < -q[2] ? "#e0dacc" : q[3]; }); }); },
    anker: function (c, x, by, t) { aP(c, x - 2, by - 22, 4, 20, AD); aP(c, x - 1, by - 21, 2, 18, "#8a6a5a"); aP(c, x - 1, by - 21, 1, 18, "#b08a78"); aqDisc(c, x, by - 25, 3, 3, function (a, b, d) { return d > .5 ? AD : null; }); aP(c, x - 7, by - 19, 14, 4, AD); aP(c, x - 6, by - 18, 12, 2, "#8a6a5a");
      for (var i = -9; i <= 9; i++) { var yy = by - 2 - Math.round((i / 9) * (i / 9) * 6); aP(c, x + i, yy - 1, 1, 4, AD); aP(c, x + i, yy, 1, 2, "#8a6a5a"); } aP(c, x - 11, by - 10, 3, 4, AD); aP(c, x + 9, by - 10, 3, 4, AD);
      for (var ch = 0; ch < 6; ch++) { aP(c, x + 4 + ch * 3, by - 27 + ch * 4, 3, 2, ch % 2 ? "#6a5a50" : "#8a7a6a"); } aP(c, x - 5, by - 12, 2, 2, "#a8603a"); },
    figur: function (c, x, by, t) { aP(c, x - 9, by - 4, 18, 4, AD); aP(c, x - 8, by - 3, 16, 2, "#a8a294"); aP(c, x - 8, by - 3, 16, 1, "#c8c2b4");
      aqDisc(c, x, by - 13, 9, 9, function (a, b, d) { return d > .84 ? AD : b > 2 && Math.abs(a) < 5 ? "#fff8e8" : a + b < -7 ? "#ffe08a" : "#e8b84a"; });
      [[-7, -22], [5, -22]].forEach(function (q) { aqDisc(c, x + q[0] + 1, by + q[1] + 1, 2, 2, function (a, b, d) { return d > .6 ? AD : "#f0a0a8"; }); });
      aP(c, x - 4, by - 16, 2, 2, AD); aP(c, x + 2, by - 16, 2, 2, AD); aP(c, x - 4, by - 16, 1, 1, "#ffffff"); aP(c, x + 2, by - 16, 1, 1, "#ffffff"); aP(c, x - 1, by - 13, 2, 1, "#d8463c"); aP(c, x - 7, by - 12, 2, 1, "#ff9aa8"); aP(c, x + 5, by - 12, 2, 1, "#ff9aa8");
      if (Math.floor(t / 250) % 9 === 0) aP(c, x + 6, by - 20, 1, 1, "#ffffff"); },
    // on the rim: a devil's ivy, its roots hanging into the water, the vines draping down outside the glass
    efeu: function (c, x, by, t, front) {
      if (!front) { for (var r = 0; r < 5; r++) { var len = 22 + r * 7; for (var k = 0; k < len; k++) aP(c, x + 2 + r * 3 + Math.round(Math.sin(t / 1100 + k * .2 + r) * 1.2 * k / len), by + 4 + k, 1, 1, k % 4 ? "#e8e0c8" : "#c8bca0"); } return; }
      aqDisc(c, x + 8, by + 1, 9, 3, function (a, b, d) { return d > .7 ? AD : b < 0 ? "#c8946a" : "#a06a40"; });
      [[0, 1, 46], [4, -1, 30], [14, 1, 18]].forEach(function (v, j) { var sx = x + v[0], dir = v[1]; for (var k = 0; k < v[2]; k++) { var xx = sx - Math.round(Math.sqrt(k) * 3.2) * (j === 1 ? -1 : 1) + Math.round(Math.sin(t / 1500 + k * .15 + j) * 1), yy = by - 2 + k; aP(c, xx, yy, 1, 1, "#4a7a2a");
        if (k % 6 === 3) aqLeafH(c, xx + (k % 12 === 3 ? -3 : 3), yy - 1, k % 12 === 3 ? Ag : "#6ab048", AG); } });
      for (var u = 0; u < 4; u++) aqLeafH(c, x + 2 + u * 4, by - 6 - (u % 2) * 2, u % 2 ? Ag : "#78c050", AG); },
    seerose: function (c, x, by, t) { var y = AQ_WL; [[-30, 8], [-8, 10], [22, 7], [36, 5]].forEach(function (p, i) { var px = x + p[0] + Math.round(Math.sin(t / 2200 + i) * 1);
        for (var r = 1; r < 5; r++) aP(c, px + (i % 2 ? 1 : -1), y + r * 3, 1, 2, "#3e7a36");
        aqDisc(c, px, y, p[1], 2, function (a, b, d) { return a > 0 && a < 3 && b > 0 ? null : d > .75 ? AG : b < 0 ? Al : Ag; }); });
      var fx = x - 8, fy = y - 3; aqDisc(c, fx, fy, 5, 3, function (a, b, d) { return d > .8 ? "#c8466a" : b < -1 ? "#ffd0e0" : Math.abs(a) % 2 ? "#ff9ab8" : "#ffb8cc"; }); aP(c, fx - 1, fy - 2, 3, 2, "#ffe08a"); aP(c, fx - 3, fy - 5, 2, 3, "#ffb8cc"); aP(c, fx + 2, fy - 5, 2, 3, "#ff9ab8"); aP(c, fx, fy - 6, 1, 2, "#ffd0e0"); },
    frosch: function (c, x, by, t) { var y = AQ_WL; [[-20, 4], [-12, 5], [-2, 4], [8, 5], [18, 4], [26, 3]].forEach(function (p, i) { var px = x + p[0] + Math.round(Math.sin(t / 1900 + i * 1.7));
        for (var r = 0; r < 12 + (i % 3) * 4; r++) aP(c, px + Math.round(Math.sin(t / 900 + r * .3) * .8), y + 2 + r, 1, 1, r % 3 ? "#e8e0c8" : "#c8bca0");
        aqDisc(c, px, y, p[1], 1.5, function (a, b, d) { return d > .7 ? AG : a < 0 ? Al : Ag; }); if (i === 2) { aP(c, px - 1, y - 3, 3, 2, "#ffffff"); aP(c, px, y - 3, 1, 1, "#ffe08a"); } }); }
  };
  // ---- the living things ----
  var aq = null, aqRaf = 0;
  function aqBub(x, y, r) { if (aq && aq.bub.length < 80) aq.bub.push({ x: x, y: y, r: r || (Math.random() < .3 ? 2 : 1), ph: Math.random() * 6 }); }
  function aqHeart(x, y) { if (aq) aq.hearts.push({ x: x, y: y, l: 1.4, vx: (Math.random() - .5) * 8 }); }
  function aqSay(t) { aqToast.textContent = t; aqToast.hidden = false; aqToast.classList.remove("pop"); void aqToast.offsetWidth; aqToast.classList.add("pop"); clearTimeout(aqSay.t); aqSay.t = setTimeout(function () { aqToast.hidden = true; }, 2000); }
  // the goldfish in five breeds to choose from: fantail, pearlscale, comet, shubunkin (calico), oranda (with its red cap)
  var AQ_KINDS = {
    schleier: { n: "Schleierschwanz", rx: 11, ry: 7, tail: "fan", tl: 13, df: 7, P: ["#f88a2a", "#ffc070", "#ffe0b0", "#b8401a", "#ffa850", "#ffc890", "#e8701a"] },
    perl: { n: "Perlschupper", rx: 9, ry: 8, tail: "fan", tl: 8, df: 5, pearl: 1, P: ["#f8a040", "#ffd090", "#fff0d8", "#b8501a", "#ffc070", "#ffe0b0", "#fff6e6"] },
    komet: { n: "Komet", rx: 12, ry: 5, tail: "fork", tl: 17, df: 6, P: ["#f05a2a", "#ff8a50", "#ffd0b0", "#a0301a", "#ff9a6a", "#ffe8dc", "#d8401a"] },
    shubu: { n: "Shubunkin", rx: 11, ry: 6, tail: "fan", tl: 14, df: 7, spots: 1, P: ["#e4ecf4", "#ffffff", "#ffffff", "#4a5a70", "#c8d8e8", "#e8f0f8", "#b8c8dc"] },
    tancho: { n: "Tancho", rx: 12, ry: 5, tail: "fork", tl: 16, df: 6, dot: 1, P: ["#f8f4ee", "#ffffff", "#ffffff", "#8a8070", "#f0ece4", "#ffffff", "#e8e0d4"] },
    chibi: { n: "Kugelfisch-Goldie", rx: 9, ry: 8, tail: "fan", tl: 8, df: 4, big: 1, P: ["#ff8a3a", "#ffb070", "#fff0dc", "#c0401a", "#ffb070", "#ffd8b0", "#f06a2a"] },
    ryukin: { n: "Ryukin", rx: 10, ry: 8, tail: "fan", tl: 12, df: 9, hump: 1, spots: 0, calico: 1, P: ["#f86a3a", "#ff9a6a", "#fff4ec", "#a8301a", "#ff9a7a", "#fff0e8", "#e0502a"] },
    oranda: { n: "Oranda", rx: 10, ry: 7, tail: "fan", tl: 12, df: 6, cap: 1, P: ["#f6eee2", "#ffffff", "#ffffff", "#8a7a6a", "#fff4e8", "#ffffff", "#e8dcc8"] }
  };
  function aqKind() { return AQ_KINDS[AQ_INT[AQ_INTER].fish] || AQ_KINDS.perl; }
  function aqFish(c, F, t, K) {
    K = K || aqKind(); var P = K.P, rx = K.rx, ry = K.ry, dir = F.dir, X = Math.round(F.x), Y = Math.round(F.y + Math.sin(t / 700) * .6), sw = Math.sin(t / (F.fast ? 80 : 190)), px = function (dx, dy, col) { aP(c, X - dx * dir, Y + dy, 1, 1, col); };
    var hash = function (a, b) { return ((a * 73856093) ^ (b * 19349663)) >>> 0; };
    for (var i = 0; i < K.tl; i++) { var h = Math.round(2 + i * (K.tail === "fork" ? .55 : .7)), off = Math.round(sw * i * .35 + Math.sin(t / 300 + i * .4) * i * .08);   /* the tail */
      for (var dy = -h; dy <= h; dy++) { if (K.tail === "fan" && i > K.tl * .6 && Math.abs(dy) < 2 && i < K.tl - 1) continue; if (K.tail === "fork" && i > 5 && Math.abs(dy) < h - 4) continue;
        var edge = Math.abs(dy) === h || i === K.tl - 1, col = edge ? P[3] : i > K.tl * .65 ? P[5] : Math.abs(dy) > h - 2 ? P[4] : P[0];
        if (K.spots && !edge && hash(i, dy) % 5 === 0) col = hash(i, dy) % 2 ? "#f08a2a" : "#2a2a3a"; px(rx - 1 + i, dy + off, col); } }
    for (var dy2 = -ry; dy2 <= ry; dy2++) for (var dx = -rx; dx <= rx; dx++) { var d = (dx / (rx + .4)) * (dx / (rx + .4)) + (dy2 / (ry + .4)) * (dy2 / (ry + .4)); if (d > 1) continue;
      var col2 = d > .84 ? P[3] : dy2 < -ry * .55 ? P[1] : dy2 > ry * .45 ? P[2] : (dx * 2 + dy2 * 3 + 99) % 7 === 0 && dx > -rx * .5 ? P[6] : P[0];
      if (K.hump && dy2 < 0 && dx > -2 && dx < 6) { /* the high back */ }
      if (K.calico && d <= .84 && ((dx * 5 + dy2 * 3 + 99) % 11 < 3 || dy2 > 2)) col2 = dy2 > 2 ? P[2] : "#ffffff";
      if (K.pearl && d <= .84 && (dx + dy2 * 2 + 99) % 3 === 0 && dy2 % 2 === 0) col2 = P[6];
      if (K.spots && d <= .84) { var hh = hash(Math.floor((dx + 20) / 3), Math.floor((dy2 + 20) / 3)) % 7; if (hh === 0) col2 = "#f08a2a"; else if (hh === 1) col2 = "#2a2a3a"; else if (hh === 2) col2 = "#7a9ac8"; }
      px(dx, dy2, col2); }
    if (K.hump) for (var hy = -ry - 3; hy < -ry + 1; hy++) for (var hx = -3; hx <= 6; hx++) { var hd = (hx - 1.5) / 5, hv = (hy + ry - 1) / 3.6; if (hd * hd + hv * hv <= 1) px(hx, hy, hd * hd + hv * hv > .65 ? P[3] : P[1]); }
    if (K.dot) for (var dy3 = -ry; dy3 <= -ry + 4; dy3++) for (var dx3 = -rx + 1; dx3 <= -rx + 6; dx3++) { var dd3 = ((dx3 + rx - 3.5) / 2.8) * ((dx3 + rx - 3.5) / 2.8) + ((dy3 + ry - 2) / 2.4) * ((dy3 + ry - 2) / 2.4); if (dd3 <= 1) px(dx3, dy3, dd3 > .6 ? "#c82a1e" : "#f0463a"); }
    if (K.cap) for (var cy = -ry - 2; cy <= -ry + 4; cy++) for (var cx = -rx - 1; cx <= -2; cx++) { var cd = ((cx + rx * .55) / (rx * .55)) * ((cx + rx * .55) / (rx * .55)) + ((cy + ry - 1) / 3.6) * ((cy + ry - 1) / 3.6); if (cd > 1) continue; px(cx, cy, cd > .7 ? "#a8281e" : (cx + cy * 2 + 99) % 3 ? "#e8463c" : "#ff7a6a"); }   /* the oranda's red cap */
    for (var k = 0; k < K.df; k++) { var fh = k < K.df / 2 ? 2 + k : K.df + 1 - k; for (var q = 0; q < fh; q++) px(-2 + k, -ry - 1 - q + Math.round(sw * q * .3), q === fh - 1 ? P[3] : P[4]); }   /* the dorsal fin */
    var fl = Math.sin(t / 130) > 0 ? 1 : 0; px(-3, ry - 1 + fl, P[5]); px(-2, ry + fl, P[4]); px(-1, ry + fl, P[3]); px(-3, ry + fl, P[3]);
    var ex = -rx + 3, eyY = K.cap || K.dot ? -1 : -2;
    if (K.big && !F.happy && !F.blink) { for (var by = -5; by <= 0; by++) for (var bx = -rx + 1; bx <= -rx + 6; bx++) { var bd = ((bx + rx - 3.5) / 3) * ((bx + rx - 3.5) / 3) + ((by + 2.5) / 3) * ((by + 2.5) / 3); if (bd <= 1) px(bx, by, bd > .75 ? P[3] : bd < .45 ? "#1e1410" : "#ffffff"); }
      px(-rx + 2, -4, "#ffffff"); px(-rx + 3, -4, "#ffffff"); px(-rx + 2, -3, "#ffffff"); px(-rx + 5, -1, "#ffffff"); px(-rx + 4, 2, "#ff8a9a"); px(-rx + 5, 2, "#ff8a9a"); px(-rx + 6, 2, "#ff8a9a"); }
    else
    if (F.happy || F.blink) { px(ex - 1, eyY + 1, AD); px(ex, eyY, AD); px(ex + 1, eyY, AD); px(ex + 2, eyY + 1, AD); }
    else { for (var ey = eyY - 2; ey <= eyY + 1; ey++) for (var exx = ex - 1; exx <= ex + 2; exx++) px(exx, ey, (ey === eyY - 2 || ey === eyY + 1) && (exx === ex - 1 || exx === ex + 2) ? P[0] : "#ffffff"); px(ex, eyY - 1, "#1e1410"); px(ex + 1, eyY - 1, "#1e1410"); px(ex, eyY, "#1e1410"); px(ex + 1, eyY, "#1e1410"); px(ex, eyY - 1, "#ffffff"); }
    if (F.blush || F.happy) { px(ex + 1, eyY + 3, "#ff8a9a"); px(ex + 2, eyY + 3, "#ff8a9a"); }
    if (F.gulp || F.blub) { px(-rx, 0, "#8a2a14"); px(-rx - 1, 0, "#8a2a14"); px(-rx, 1, "#8a2a14"); px(-rx - 1, 1, "#8a2a14"); } else px(-rx, 1, P[3]);
  }
  // the snail: a round striped shell with a shine, a soft body, eyes on stalks; it pulls in when tapped and peeks out again
  function aqSnail(c, S2, t) { var x = Math.round(S2.x), y = Math.round(S2.y), dir = S2.dir, out = S2.hide > 0 ? Math.max(0, 1 - S2.hide / .4) * (S2.hide < .9 ? 1 : 0) : 1, px = function (dx, dy, col) { aP(c, x + dx * dir, y + dy, 1, 1, col); };
    if (S2.hide > 0 && S2.hide < .9) out = 1 - S2.hide / .9;
    if (out > .05) { var len = Math.round(5 * out);
      for (var bx = -6; bx <= len + 2; bx++) { px(bx, 3, "#c8a878"); px(bx, 2, bx > len ? "#f0dcb4" : "#e8d0a0"); } px(-7, 3, "#c8a878"); px(len + 3, 2, "#c8a878");
      for (var hy = 0; hy < 2; hy++) for (var hx = 0; hx < 3; hx++) px(len + hx, 1 - hy, "#f0dcb4"); px(len + 3, 1, "#c8a878"); px(len + 1, 2, "#a8885a");
      if (out > .6) { var wob = Math.round(Math.sin(t / 400) * .6); px(len, -1, "#e8d0a0"); px(len, -2 + wob, "#e8d0a0"); px(len, -3 + wob, AD); px(len + 2, -1, "#e8d0a0"); px(len + 2, -2 - wob, "#e8d0a0"); px(len + 2, -3 - wob, AD); px(len + 3, 1, "#d8a080"); } }
    aqDisc(c, x - dir, y - 2, 5, 5, function (a, b, d) { var ang = Math.atan2(b, a * dir), sp = (ang + Math.PI) / (2 * Math.PI) + (1 - Math.sqrt(d)) * 1.6; return d > .82 ? "#5a2a14" : (Math.floor(sp * 3) % 2 ? "#c8643a" : "#e8a060"); });
    px(-2, -5, "#ffe0b0"); px(-3, -4, "#ffe0b0"); px(-1, -2, "#7a3a1a"); }
  function aqShrimp(c, P, t) { var x = Math.round(P.x), y = Math.round(P.y), d = P.dir, pk = P.pick > 0 && Math.floor(t / 120) % 2;
    var px = function (dx, dy, col) { aP(c, x + dx * d, y + dy, 1, 1, col); };
    [[-3, -2], [-2, -2], [-1, -3], [0, -3], [1, -3], [2, -2], [3, -2], [-2, -1], [-1, -1], [0, -2], [1, -2], [2, -1], [-4, -1], [-3, -1], [0, -1], [1, -1], [3, -1]].forEach(function (q) { px(q[0], q[1], q[1] === -3 ? "#ff7a6a" : "#e0402a"); });
    px(-5, -2, "#e0402a"); px(-6, -1, "#ff7a6a"); px(-5, 0, "#c02a1a"); px(4, -1, "#e0402a"); px(3, -3, AD);
    px(5, -2 - (pk ? 1 : 0), "#ff9a8a"); px(6, -3 - (pk ? 1 : 0), "#ff9a8a"); px(7, -4, "#ff9a8a"); for (var l = 0; l < 3; l++) px(-1 + l * 2, 0 + ((Math.floor(t / 90) + l) % 2), "#c02a1a"); }
  function aqNeon(c, N2) { var x = Math.round(N2.x), y = Math.round(N2.y), d = N2.dir, px = function (dx, dy, col) { aP(c, x + dx * d, y + dy, 1, 1, col); };
    for (var i = -3; i <= 3; i++) { px(i, -1, i > -3 && i < 3 ? "#b8ccd8" : null || "#b8ccd8"); px(i, 0, "#30c8f0"); px(i, 1, i < 0 ? "#f0503a" : "#e8eef0"); } px(-4, 0, "#b8ccd8"); px(-5, -1, "#d8e4ea"); px(-5, 1, "#d8e4ea"); px(3, 0, AD); px(2, -1, "#b8ccd8"); }
  function aqNewState() { var nn = []; for (var i = 0; i < 5; i++) nn.push({ x: 40 + i * 5, y: 50 + (i % 2) * 4, dir: 1, ox: (i % 3) * 7 - 7, oy: (i % 2) * 6 - 3 });
    return { fish: { x: 96, y: 62, dir: -1, tx: 70, ty: 60, next: 0, happy: 0, blush: 0, gulp: 0, fast: 0, blink: 0 }, snail: { a: .3, dir: 1, hide: 0, x: 0, y: 0 },
      shrimps: [{ x: 60, y: 110, dir: 1, tx: 70, pick: 0, next: 0 }, { x: 120, y: 116, dir: -1, tx: 110, pick: 0, next: 0 }], neons: nn, school: { x: 50, y: 52, tx: 120, ty: 46, next: 0 },
      bub: [], flakes: [], hearts: [], mode: "", ate: 0, plays: 0, pets: 0 }; }
  function aqDraw(t) {
    aqRaf = 0; if (!aq || aqEl.hidden) return; aqRaf = requestAnimationFrame(aqDraw); if (aq.preview) return;
    var dt = Math.min(.05, (t - (aq.last || t)) / 1000); aq.last = t; var S = aqSt();
    aqStep(t, dt);
    aqc.drawImage(aqBg, 0, 0);
    for (var gy = AQ_FB; gy < AQ_H; gy++) for (var gx = (gy % 2); gx < AQ_W; gx += 2) if (aqGrav[gy * AQ_W + gx] && Math.sin(gx * .21 + t / 900) * Math.sin(gy * .5 - gx * .07 - t / 1300) > .72) aP(aqc, gx, gy, 1, 1, "rgba(255,250,220,.5)");   /* light dancing on the gravel */
    for (var r = 0; r < 8; r++) { var bx = ((r * 27 + t / 80) % 230) - 40; for (var k = 0; k < 74; k++) { var x = Math.round(bx + k * .42), y = AQ_WL + 2 + k; if (x >= 0 && x < AQ_W && aqWater[y * AQ_W + x] && (k + r) % 3) aP(aqc, x, y, 1, 1, "rgba(255,255,255,.12)"); } }
    for (var sx = 0; sx < AQ_W; sx++) if (aqEll(sx, AQ_WL) && aqEll(sx + 4, AQ_WL) && aqEll(sx - 4, AQ_WL)) { var wv = Math.sin(sx * .28 + t / 280) > .55 ? -1 : 0; aP(aqc, sx, AQ_WL + wv, 1, 1, (sx + Math.floor(t / 110)) % 6 ? "#d0f0fa" : "#ffffff"); aP(aqc, sx, AQ_WL + 1 + wv, 1, 1, "#a8dcf0"); }
    var sl = S.s, M0 = aqc; aqc = aqLc; aqc.clearRect(0, 0, AQ_W, AQ_H);   /* everything inside goes on its own layer, cut to the glass */
    if (sl[9] === "efeu") AQ_DRAW.efeu(aqc, AQ_SL[9].x, AQ_SL[9].y, t, false);
    var pk = aq.poke && performance.now() - aq.poke.t0 < 1500 ? aq.poke : null, tp = function (i) { return pk && pk.i === i ? t + i * 700 + Math.sin((performance.now() - pk.t0) / 60) * 900 * (1 - (performance.now() - pk.t0) / 1500) + (sl[i] === "kiste" ? 6000 - (t + i * 700) % 8000 : 0) : t + i * 700; };
    for (var i = 0; i < 6; i++) if (sl[i] && AQ_DRAW[sl[i]]) { aqShadow(aqc, AQ_SL[i].x, AQ_SL[i].y, 10); AQ_DRAW[sl[i]](aqc, AQ_SL[i].x, AQ_SL[i].y, tp(i)); }
    aqFog(aqc);
    if (Math.random() < dt * 4) aqBub(152, 104, 1); aqDisc(aqc, 152, 107, 3, 2, function (a, b, d) { return d > .7 ? "#4a463c" : "#8a8478"; });   /* the air stone */
    aq.shrimps.forEach(function (p) { if (p.y < 112) aqShrimp(aqc, p, t); });
    aq.flakes.forEach(function (f) { aP(aqc, f.x, f.y, 2, 1, f.c); });
    aq.neons.forEach(function (n) { aqNeon(aqc, n); });
    var fsy = Math.min(AQ_H - 6, AQ_FB + 8 + (aq.fish.y - AQ_WL) * .2); aqShadow(aqc, Math.round(aq.fish.x), Math.round(fsy), 9 - Math.round((AQ_FB - aq.fish.y) / 14));   /* the fish's shadow on the gravel */
    var Ho = aq.mode === "play" && aq.hoop; if (Ho) aqDisc(aqc, Ho.x, Ho.y, 3, 9, function (a, b, d) { return a > 0 || d < .45 ? null : d > .8 ? "#a8285a" : "#ff6aa0"; });   /* the back half of the ring */
    aqFish(aqc, aq.fish, t);
    if (Ho) aqDisc(aqc, Ho.x, Ho.y, 3, 9, function (a, b, d) { return a <= 0 || d < .45 ? null : d > .8 ? "#a8285a" : b < 0 ? "#ffb0d0" : "#ff6aa0"; });
    for (var j = 6; j < 9; j++) if (sl[j] && AQ_DRAW[sl[j]]) { aqShadow(aqc, AQ_SL[j].x, AQ_SL[j].y, 11); AQ_DRAW[sl[j]](aqc, AQ_SL[j].x, AQ_SL[j].y, tp(j)); }
    aq.shrimps.forEach(function (p) { if (p.y >= 112) aqShrimp(aqc, p, t); });
    if (sl[10] && AQ_DRAW[sl[10]]) AQ_DRAW[sl[10]](aqc, AQ_SL[10].x, AQ_SL[10].y, t);
    aq.bub = aq.bub.filter(function (b) { b.y -= 15 * dt * (1 + b.r * .3); b.x += Math.sin(t / 200 + b.ph) * .15; if (b.y < AQ_WL + 1) return false; if (b.r > 1) { aP(aqc, b.x - 1, b.y, 3, 1, "#e8f8ff"); aP(aqc, b.x, b.y - 1, 1, 3, "#e8f8ff"); aP(aqc, b.x, b.y, 1, 1, "#a8d8f0"); aP(aqc, b.x - 1, b.y - 1, 1, 1, "#ffffff"); } else aP(aqc, b.x, b.y, 1, 1, "#e8f8ff"); return true; });
    aqSnail(aqc, aq.snail, t);
    aqc.globalCompositeOperation = "destination-in"; aqc.drawImage(aqMask, 0, 0); aqc.globalCompositeOperation = "source-over"; aqc = M0; aqc.drawImage(aqL, 0, 0);
    aqc.drawImage(aqFront, 0, 0);
    if (aq.ripple) { var ru = (performance.now() - aq.ripple.t0) / 700; if (ru > 1) aq.ripple = null; else for (var ra = 0; ra < 24; ra++) { var an2 = ra / 24 * Math.PI * 2; aP(aqc, aq.ripple.x + Math.cos(an2) * (2 + ru * 9), aq.ripple.y + Math.sin(an2) * (1 + ru * 5), 1, 1, "rgba(255,255,255," + (1 - ru).toFixed(2) + ")"); } }
    if (sl[9] === "efeu") AQ_DRAW.efeu(aqc, AQ_SL[9].x, AQ_SL[9].y, t, true);
    aq.hearts = aq.hearts.filter(function (h) { h.l -= dt; h.y -= 14 * dt; h.x += h.vx * dt; var x = Math.round(h.x), y = Math.round(h.y); aP(aqc, x - 3, y - 1, 3, 1, AD); aP(aqc, x + 1, y - 1, 3, 1, AD);
      aP(aqc, x - 3, y, 7, 2, "#e8465a"); aP(aqc, x - 2, y + 2, 5, 1, "#e8465a"); aP(aqc, x - 1, y + 3, 3, 1, "#e8465a"); aP(aqc, x, y + 4, 1, 1, "#e8465a"); aP(aqc, x - 2, y, 1, 1, "#ffb0b8"); return h.l > 0; });
    if (false) AQ_SL.forEach(function (p, i) { var y = 0, on = 0; aP(aqc, p.x - 4, y - 4, 9, 9, AD); aP(aqc, p.x - 3, y - 3, 7, 7, on ? "#fff8ec" : "#ffe08a"); aP(aqc, p.x - 2, y, 5, 1, AD); aP(aqc, p.x, y - 2, 1, 5, AD); });
  }
  // ---- how they move ----
  function aqClampT(F) { var G = AQ_G; F.tx = Math.max(G.x0 + 18, Math.min(G.x1 - 18, F.tx)); F.ty = Math.max(AQ_WL + 10, Math.min(AQ_FB - 5, F.ty)); }
  function aqStep(t, dt) {
    var F = aq.fish, now = performance.now();
    if (aq.mode === "feed") { var fl = aq.flakes.filter(function (f) { return !f.gone; }); if (fl.length && !aq.full) { var n = fl.reduce(function (a, f) { return Math.hypot(f.x - F.x, f.y - F.y) < Math.hypot(a.x - F.x, a.y - F.y) ? f : a; }); F.tx = n.x - F.dir * 11; F.ty = n.y - 1; F.fast = 1; } }
    else if (aq.mode === "play") { if (aq.ptr) { F.tx = aq.ptr[0] - F.dir * 6; F.ty = aq.ptr[1]; F.fast = 1; } }
    else if (now > F.next) { F.next = now + 2200 + Math.random() * 3200; F.tx = 30 + Math.random() * 120; F.ty = 40 + Math.random() * 50; F.fast = 0; if (Math.random() < .3) { F.blub = 1; setTimeout(function () { if (aq) { aq.fish.blub = 0; aqBub(aq.fish.x + aq.fish.dir * 13, aq.fish.y, 2); } }, 300); } }
    aqClampT(F);
    var dx = F.tx - F.x, dy = F.ty - F.y, d = Math.hypot(dx, dy), sp = (F.fast ? 50 : 18) * dt;
    if (Math.abs(dx) > 4) F.dir = dx < 0 ? -1 : 1;                                  /* turn first, so it always swims head first */
    if (d > .8) { F.x += dx / d * Math.min(d, sp); F.y += dy / d * Math.min(d, sp * .8); }
    if (!F.blink && Math.random() < dt * .35) { F.blink = 1; setTimeout(function () { if (aq) aq.fish.blink = 0; }, 130); }
    // the snail creeps along the inside of the glass, now and then turning back
    var Sn = aq.snail; if (Sn.hide > 0) Sn.hide -= dt; else if (Math.random() > dt * .05) { Sn.a += Sn.dir * dt * .012; if (Sn.a > 1 || Sn.a < 0) { Sn.dir *= -1; Sn.a = Math.max(0, Math.min(1, Sn.a)); } }
    Sn.x = AQ_G.x0 + 10 + Sn.a * 60; Sn.y = AQ_FB - 8;   /* it creeps along the front glass, just above the gravel */ Sn.dir2 = Sn.dir;
    // the shrimps pick at the gravel, scuttle a bit, pick again
    aq.shrimps.forEach(function (p) { if (p.pick > 0) { p.pick -= dt; return; } if (now > p.next) { p.next = now + 1500 + Math.random() * 3000; p.tx = Math.max(36, Math.min(144, p.x + (Math.random() - .5) * 50)); p.ty = 104 + Math.random() * 16; }
      var ex = p.tx - p.x, ey = (p.ty || p.y) - p.y; if (Math.abs(ex) > 1 || Math.abs(ey) > 1) { p.dir = ex < 0 ? -1 : 1; p.x += Math.sign(ex) * Math.min(Math.abs(ex), 12 * dt); p.y += Math.sign(ey) * Math.min(Math.abs(ey), 5 * dt); } else if (Math.random() < dt * .8) p.pick = 1 + Math.random() * 1.5; });
    // the neons keep together around a point that wanders, and shy away from the goldfish
    var Sc = aq.school; if (now > Sc.next) { Sc.next = now + 3000 + Math.random() * 3000; Sc.tx = 34 + Math.random() * 112; Sc.ty = 36 + Math.random() * 46; }
    if (Math.hypot(Sc.x - F.x, Sc.y - F.y) < 22) { Sc.tx = Sc.x + (Sc.x - F.x) * 2; Sc.ty = Sc.y + (Sc.y - F.y); } var st = { tx: Sc.tx, ty: Sc.ty }; aqClampT(st); Sc.tx = st.tx; Sc.ty = st.ty;
    var sdx = Sc.tx - Sc.x, sdy = Sc.ty - Sc.y, sdd = Math.hypot(sdx, sdy); if (sdd > 1) { Sc.x += sdx / sdd * Math.min(sdd, 22 * dt); Sc.y += sdy / sdd * Math.min(sdd, 16 * dt); }
    aq.neons.forEach(function (n, i) { var gx = Sc.x + n.ox + Math.sin(t / 500 + i * 2) * 3, gy = Sc.y + n.oy + Math.cos(t / 600 + i) * 2, ex = gx - n.x; n.x += ex * Math.min(1, dt * 3); n.y += (gy - n.y) * Math.min(1, dt * 3); if (Math.abs(ex) > .3) n.dir = ex < 0 ? -1 : 1; });
    // flakes sink; the fish snaps up the ones at its mouth
    aq.flakes.forEach(function (f) { if (f.gone) return; f.y = Math.min(AQ_FB, f.y + 7 * dt); f.x += Math.sin(t / 300 + f.ph) * .08;
      var mx = F.x + F.dir * 12; if (!aq.full && Math.hypot(f.x - mx, f.y - (F.y + 1)) < 4) { f.gone = 1; F.gulp = 1; setTimeout(function () { if (aq) aq.fish.gulp = 0; }, 160); beep([[880, .02], [1180, .03]]); aq.ate++; } });
    aq.flakes = aq.flakes.filter(function (f) { if (f.gone) return false; if (f.y >= AQ_FB) { f.rest = (f.rest || 0) + dt; aq.shrimps.forEach(function (p) { if (Math.abs(p.x - f.x) < 20) { p.tx = f.x; p.ty = AQ_FB + 8; } }); return f.rest < 5; } return true; });
    if (aq.mode === "feed" && !aq.flakes.length) aqFeedDone();
    if (F.trick) { var tu = (now - F.trick.t0) / F.trick.dur;   /* a trick: a loop, a wiggle or a little jump */
      if (tu >= 1) { F.trick = null; F.happy = 0; } else { F.happy = 1; if (F.trick.k === "loop") { var an = tu * Math.PI * 2; F.x = F.trick.x + Math.sin(an) * 10 * F.trick.dir; F.y = F.trick.y - (1 - Math.cos(an)) * 8; F.dir = Math.cos(an) > 0 ? F.trick.dir : -F.trick.dir; F.tx = F.x; F.ty = F.y; }
        else if (F.trick.k === "wiggle") { F.x = F.trick.x + Math.round(Math.sin(tu * 40) * 1.5); F.tx = F.x; F.ty = F.y; if (Math.random() < .08) aqHeart(F.x, F.y - 10); }
        else if (F.trick.k === "jump") { var jy = Math.sin(tu * Math.PI); F.y = F.trick.y - jy * (F.trick.y - AQ_WL + 8); F.tx = F.x; F.ty = F.y; if (!F.trick.sp && F.y < AQ_WL + 2) { F.trick.sp = 1; for (var sp2 = 0; sp2 < 10; sp2++) aqBub(F.x - 8 + sp2 * 2, AQ_WL + 3, 1); beep([[520, .05], [780, .06]]); } } } }
    if (aq.mode === "play" && aq.hoop) { var H2 = aq.hoop; if (Math.abs(F.x - H2.x) < 3 && Math.abs(F.y - H2.y) < 6 && now > (H2.cool || 0)) { H2.cool = now + 800; aq.plays++; beep([[660, .04], [880, .04], [1175, .06]]); for (var hb = 0; hb < 6; hb++) aqBub(H2.x, H2.y - 6 + hb * 2, 1); F.happy = 1; setTimeout(function () { if (aq) aq.fish.happy = 0; }, 500);
        if (aq.plays >= 4) { aq.hoop = null; aq.mode = ""; aq.ptr = null; aqSay("Super! Vier Mal durch den Ring!"); F.trick = { k: "loop", t0: now, dur: 900, x: F.x, y: F.y, dir: F.dir }; s.love = clamp(s.love + 2); renderNeeds(); if (window.SudokuSave) window.SudokuSave(); aqBarDraw(); }
        else { aqSay(aq.plays + " von 4"); H2.x = 40 + Math.random() * 100; H2.y = 42 + Math.random() * 44; } } }
  }
  function aqFeedDone() { aq.mode = ""; aq.fish.fast = 0; var L = life();
    if (aq.full) aqSay("Der Goldfisch ist noch satt.");
    else { L.fishFed = Date.now(); aqSay("Lecker!"); aqHeart(aq.fish.x, aq.fish.y - 10); s.love = clamp(s.love + 2); renderNeeds(); if (window.SudokuSave) window.SudokuSave(); }
    aqBarDraw(); }
  // ---- the buttons under the picture ----
  function aqBarDraw() {
    if (!aq) return;
    var busy = !!aq.mode;
    aqBar.innerHTML = [["feed", "Füttern"], ["play", "Spielen"]].map(function (b) { var on = aq.mode === b[0]; return '<button type="button" class="fi-b2' + (on ? " on" : "") + '" data-a="' + b[0] + '"' + (busy && !on ? " disabled" : "") + '>' + (b[0] === "play" && on ? "Fertig" : b[1]) + '</button>'; }).join("");
  }
  aqBar.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b || !aq) return; e.stopPropagation(); var a = b.dataset.a;
    if (a === "feed") { aq.mode = "feed"; aq.ate = 0; aq.full = Date.now() - (life().fishFed || 0) < 3 * 3600e3; var x0 = 60 + Math.random() * 60; for (var k = 0; k < 8; k++) aq.flakes.push({ x: x0 + (k * 7) % 26 - 13, y: AQ_WL + 1 + (k % 3), ph: k, c: k % 2 ? "#e8c060" : "#d8703a" }); beep([[1047, .03], [1175, .03], [1319, .04]]); aqBarDraw(); return; }
    if (a === "play") { if (aq.mode === "play") { aq.mode = ""; aq.ptr = null; aq.hoop = null; aqBarDraw(); return; } aq.mode = "play"; aq.plays = 0; aq.hoop = { x: 50 + Math.random() * 80, y: 50 + Math.random() * 30 }; aqSay("Lotse den Goldfisch durch den Ring!"); aqBarDraw(); return; } });
  function aqPt(e) { var r = aqCv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * AQ_W, (e.clientY - r.top) / r.height * AQ_H]; }
  aqCv.addEventListener("pointerdown", function (e) { if (!aq) return; e.preventDefault(); var p = aqPt(e);
    aq.drag = true; try { aqCv.setPointerCapture(e.pointerId); } catch (er) { }
    if (aq.mode === "play") { aq.ptr = p; return; }
    var F = aq.fish, Sn = aq.snail;
    if (Math.hypot(p[0] - Sn.x, p[1] - Sn.y) < 9) { Sn.hide = 3; beep([[300, .04], [240, .05]]); return; }                                                       /* the snail pulls in */
    for (var i = 0; i < aq.shrimps.length; i++) { var q = aq.shrimps[i]; if (Math.hypot(p[0] - q.x, p[1] - q.y) < 7) { q.tx = q.x - q.dir * 18; q.y -= 3; q.pick = 0; beep([[1200, .02]]); return; } }   /* a shrimp hops back */
    var now2 = performance.now();
    if (Math.hypot(p[0] - F.x, p[1] - F.y) < 14 && !F.trick) { aq.taps = (aq.tapT && now2 - aq.tapT < 1500 ? aq.taps : 0) + 1; aq.tapT = now2;   /* tap the fish: it shows a trick; three quick taps and it jumps */
      var kk = aq.taps >= 3 ? "jump" : ["loop", "wiggle", "loop"][Math.floor(Math.random() * 3)]; F.trick = { k: kk, t0: now2, dur: kk === "jump" ? 1100 : kk === "loop" ? 900 : 1000, x: F.x, y: F.y, dir: F.dir }; if (kk === "jump") aq.taps = 0;
      aqBub(F.x + F.dir * 13, F.y, 2); beep(kk === "wiggle" ? [[1047, .04], [1319, .05]] : [[740, .04], [988, .05]]); if (kk !== "loop") aqHeart(F.x, F.y - 12); F.next = now2 + 2500; return; }
    var sl2 = aqSt().s; for (var k2 = 0; k2 < 9; k2++) { var sp3 = AQ_SL[k2]; if (sl2[k2] && Math.abs(p[0] - sp3.x) < 10 && p[1] < sp3.y + 2 && p[1] > sp3.y - (/seegras|pest|bambus|ludwig/.test(sl2[k2]) ? 60 : 24)) {   /* tap a thing: plants wave and bubble, the chest opens */
      aq.poke = { i: k2, t0: now2 }; for (var b3 = 0; b3 < 5; b3++) aqBub(sp3.x - 4 + Math.random() * 8, sp3.y - 10 - Math.random() * 20, Math.random() < .4 ? 2 : 1); beep([[880, .03], [660, .03]]); return; } }
    aq.ripple = { x: p[0], y: p[1], t0: now2 }; beep([[1400, .015]]); F.tx = p[0] - F.dir * 14; F.ty = p[1]; F.next = now2 + 3000; F.look = now2;   /* a tap on the glass: a ripple, and the fish comes to look */
  });
  aqCv.addEventListener("pointermove", function (e) { if (!aq || !aq.drag) return; var p = aqPt(e); if (aq.mode === "play") aq.ptr = p; });
  aqCv.addEventListener("pointerup", function () { if (aq) aq.drag = false; });
  function aqOpen() { aq = aqNewState(); aqEl.hidden = false; aqBar.style.display = "flex"; aqCard.hidden = true; aqBarDraw(); if (!aqRaf) aqRaf = requestAnimationFrame(aqDraw); beep([[520, .04], [780, .05]]); }
  function aqClose() { aqEl.hidden = true; aqBar.style.display = "none"; aq = null; if (aqRaf) cancelAnimationFrame(aqRaf); aqRaf = 0; renderBowl(); }
  aqEl.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); aqClose(); });
  aqEl.addEventListener("click", function (e) { e.stopPropagation(); });
  var _aq_int = interrupt; interrupt = function () { if (aq && !window.__resume) aqClose(); return _aq_int.apply(this, arguments); };
  // the little bowl in the bedroom shows a hint of what is inside: plant tips, the ivy over the rim, a lily pad
  function renderBowl() { var S = aqSt(), g = bowlBtn.querySelector(".bx-deco"); if (!g) { g = document.createElement("span"); g.className = "bx-deco"; bowlBtn.insertBefore(g, bowlBtn.querySelector(".bx-fish")); }
    var px = "", P = function (x, y, w, h, col) { px += '<path fill="' + col + '" d="M' + x + ' ' + y + 'h' + w + 'v' + h + 'h-' + w + 'z"/>'; };
    S.s.slice(0, 9).forEach(function (id, i) { if (!id) return; var x = i < 6 ? 3 + i * 3 : 5 + (i - 6) * 6, plant = /seegras|pest|ludwig|farn|bambus/.test(id), col = id === "ludwig" ? "#c8463c" : plant || id === "moos" ? "#5aa04e" : id === "kiste" || id === "helm" || id === "figur" ? "#c8963a" : id === "pilz" ? "#d8463c" : "#a8a294";
      if (id === "bambus") { P(x, 0, 1, 17, "#8ab04a"); return; } var h = plant ? (i < 6 ? 6 : 3) : 2; P(x, 17 - h, 1, h, col); });
    if (S.s[9] === "efeu") { P(4, 0, 4, 1, "#5aa04e"); P(3, 1, 1, 4, "#5aa04e"); }
    if (S.s[10]) { P(8, 6, 4, 1, "#5aa04e"); if (S.s[10] === "seerose") P(9, 5, 1, 1, "#ff9ab8"); }
    g.innerHTML = '<svg viewBox="0 0 24 21" shape-rendering="crispEdges">' + px + '</svg>'; }
  renderBowl();
  window.__aq = { style: function (k) { aqBuild(k); }, inter: function (k) { AQ_INTER = k; aqBuild("klassik"); if (aq) { aqSt(); } }, open: aqOpen, close: aqClose, st: function () { return aq && { mode: aq.mode, fish: [Math.round(aq.fish.x), Math.round(aq.fish.y), aq.fish.dir], flakes: aq.flakes.length, slots: aqSt().s.slice() }; }, set: function (i, k) { aqSt().s[i] = k; }, kind: function (k) { life().aq.kind = k; }, variants: function () { aq.preview = true; aqc.drawImage(aqBg, 0, 0); var ks = Object.keys(AQ_KINDS), pos = [[45, 44], [118, 44], [45, 76], [118, 76], [82, 100]]; ks.forEach(function (k, i) { aqFish(aqc, { x: pos[i][0], y: pos[i][1], dir: -1 }, 400, AQ_KINDS[k]); }); return ks.map(function (k) { return AQ_KINDS[k].n; }); }, tap: function (x, y) { aqCv.dispatchEvent(new PointerEvent("pointerdown", { clientX: 0, clientY: 0 })); } };
