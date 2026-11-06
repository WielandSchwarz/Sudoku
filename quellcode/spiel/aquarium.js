  // ===================== the aquarium up close: a big view of the goldfish bowl to furnish, and the goldfish to feed, play with and love =====================
  var AQ_W = 180, AQ_H = 135, AQ_CX = 90, AQ_CY = 70, AQ_RX = 80, AQ_RY = 56, AQ_WL = 28;   // the bowl as an ellipse, the water line
  var AQ_SLOTS = [28, 50, 72, 108, 130, 152];
  var AQ_ITEMS = [
    ["seegras", "Seegras"], ["pest", "Wasserpest"], ["ludwig", "Ludwigie"], ["farn", "Javafarn"], ["moos", "Mooskugel"],
    ["kiste", "Schatzkiste"], ["burg", "Burgruine"], ["muschel", "Muschel"], ["helm", "Taucherhelm"], ["krug", "Amphore"], ["steine", "Steine"], ["anker", "Anker"], ["figur", "Figur"]
  ];
  var aqEl = xEl("div", "bee-pov fi-pov aq-pov", scene); aqEl.hidden = true;
  aqEl.innerHTML = '<canvas width="180" height="135" class="fi-cv aq-cv"></canvas><div class="aq-toast" hidden></div><div class="fi-card" hidden></div><button type="button" class="bp-x" aria-label="Aquarium schließen">×</button>';
  var aqCv = aqEl.querySelector("canvas"), aqc = aqCv.getContext("2d"); aqc.imageSmoothingEnabled = false;
  var aqBar = document.createElement("div"); aqBar.className = "aq-bar"; aqBar.style.display = "none"; scene.parentNode.insertBefore(aqBar, scene.nextSibling);   // the buttons sit under the picture, like the stoker's panel
  var aqBar0 = aqBar, aqCard = aqEl.querySelector(".fi-card"), aqToast = aqEl.querySelector(".aq-toast");
  function aP(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
  function aqIn(x, y) { var a = (x + .5 - AQ_CX) / AQ_RX, b = (y + .5 - AQ_CY) / AQ_RY; return a * a + b * b <= 1 || (y >= 6 && y < 22 && x >= 48 && x < 132); }
  function aqFloor(x) { var u = (x - AQ_CX) / AQ_RX; return Math.round(108 - 10 * u * u * u * u); }
  function aqSt() { var L = life(); L.aq = L.aq || { s: ["seegras", "", "kiste", "", "moos", ""] }; return L.aq; }
  // ---- the still picture: the wall, the chest, the glass, the water and the gravel, drawn once ----
  var aqBg = document.createElement("canvas"); aqBg.width = AQ_W; aqBg.height = AQ_H; var aqWater = new Uint8Array(AQ_W * AQ_H);
  var AQ_DEEP = ["#a6dcf0", "#8fd0ec", "#7cc4e6", "#6ab6de", "#5aa8d4"];
  (function () {
    var c = aqBg.getContext("2d");
    aP(c, 0, 0, AQ_W, AQ_H, "#f3e7cf"); for (var y = 4; y < 118; y += 10) for (var x = (y / 10 % 2) * 6; x < AQ_W; x += 12) aP(c, x, y, 1, 1, "#e6d4b2");   // calm wallpaper
    aP(c, 0, 118, AQ_W, 17, "#a0683a"); aP(c, 0, 118, AQ_W, 1, "#3a2414"); aP(c, 0, 119, AQ_W, 2, "#c8945a"); aP(c, 0, 126, AQ_W, 1, "#7a4a28");   // the chest top
    for (var sx = 18; sx < 162; sx++) { var su = Math.abs(sx - 90) / 72; if (su < 1) aP(c, sx, 121 + Math.round(su * 2), 1, 1, "#7a4a28"); }        // the bowl's shadow
    for (var y2 = 0; y2 < AQ_H; y2++) for (var x2 = 0; x2 < AQ_W; x2++) {
      if (!aqIn(x2, y2)) continue;
      var edge = !aqIn(x2 + 1, y2) || !aqIn(x2 - 1, y2) || !aqIn(x2, y2 + 1) || !aqIn(x2, y2 - 1), col;
      if (edge || y2 === 6) col = "#3a2414";
      else if (y2 <= 8) col = y2 === 7 ? "#ffffff" : "#b4d8e8";
      else if (!aqIn(x2 + 2, y2) || !aqIn(x2 - 2, y2) || !aqIn(x2, y2 + 2)) col = "#b4d8e8";            // the thickness of the glass
      else if (y2 < AQ_WL) col = (x2 + y2) % 2 ? "#e6f4fa" : "#dcf0f8";
      else if (y2 >= aqFloor(x2)) { var r = (x2 * 7 + y2 * 13 + x2 * y2) % 11; col = y2 === aqFloor(x2) ? "#8a6a48" : ["#c8a878", "#a08058", "#e0c8a0", "#8a8478", "#d8b8a0", "#c8a878", "#b89a70", "#e8d4b0", "#a08058", "#c8a878", "#9a9284"][r]; }
      else { var d = (y2 - AQ_WL) / (aqFloor(x2) - AQ_WL) * 4, i = Math.floor(d), f = d - i; col = AQ_DEEP[Math.min(4, i + (f > .5 + ((x2 + y2) % 2) * .25 ? 1 : 0))]; aqWater[y2 * AQ_W + x2] = 1; }
      aP(c, x2, y2, 1, 1, col);
    }
  })();
  var aqFront = document.createElement("canvas"); aqFront.width = AQ_W; aqFront.height = AQ_H;   // highlights on the glass, drawn over everything
  (function () { var c = aqFront.getContext("2d");
    for (var k = 0; k < 40; k++) { var a = 2.35 + k * .018, x = Math.round(AQ_CX + Math.cos(a) * (AQ_RX - 7)), y = Math.round(AQ_CY - Math.sin(a) * (AQ_RY - 7)); if (aqIn(x, y)) { aP(c, x, y, 2, 1, "rgba(255,255,255,.8)"); } }
    for (var k2 = 0; k2 < 12; k2++) { var a2 = .55 + k2 * .02, x3 = Math.round(AQ_CX + Math.cos(a2) * (AQ_RX - 6)), y3 = Math.round(AQ_CY - Math.sin(a2) * (AQ_RY - 6)); aP(c, x3, y3, 1, 1, "rgba(255,255,255,.7)"); }
    aP(c, 56, 10, 20, 1, "rgba(255,255,255,.6)"); })();
  // ---- the things that can stand on the gravel: drawn from code, bottom centre at (x, by) ----
  var AG = "#3e7a36", Ag = "#5aa04e", Al = "#8ad06a", AD = "#3a2414";
  function aqSway(t, k, h, ph, amp) { return Math.round(Math.sin(t / 850 + ph + k * .13) * (k / h) * (amp || 1.6)); }
  var AQ_DRAW = {
    seegras: function (c, x, by, t) { [[-3, 22, 0], [0, 28, 1.3], [3, 18, 2.6], [5, 24, 3.4]].forEach(function (b) { for (var k = 0; k < b[1]; k++) { var s = aqSway(t, k, b[1], b[2], 2.2); aP(c, x + b[0] + s, by - k, 1, 1, AG); aP(c, x + b[0] + s + 1, by - k, 1, 1, k > b[1] - 3 ? Al : Ag); } }); },
    pest: function (c, x, by, t) { for (var k = 0; k < 24; k++) { var s = aqSway(t, k, 24, .7); aP(c, x + s, by - k, 1, 1, AG);
        if (k % 3 === 1 && k < 23) { var w = k < 18 ? 3 : 2; aP(c, x + s - w, by - k, w, 1, Ag); aP(c, x + s + 1, by - k, w, 1, Al); aP(c, x + s - w - 1, by - k - 1, 1, 1, AG); aP(c, x + s + w + 1, by - k - 1, 1, 1, AG); } }
      aP(c, x + aqSway(t, 24, 24, .7) - 1, by - 25, 3, 2, Al); },
    ludwig: function (c, x, by, t) { [[-2, 16, 0], [2, 20, 1.7]].forEach(function (b) { for (var k = 0; k < b[1]; k++) { var s = aqSway(t, k, b[1], b[2]); aP(c, x + b[0] + s, by - k, 1, 1, "#8a2a28");
        if (k % 3 === 2) { aP(c, x + b[0] + s - 2, by - k - 1, 2, 2, "#c8463c"); aP(c, x + b[0] + s + 1, by - k - 1, 2, 2, "#e06a4a"); aP(c, x + b[0] + s - 2, by - k - 1, 1, 1, "#e88a6a"); } } }); },
    farn: function (c, x, by, t) { [[-.95, 11], [-.35, 15], [.3, 14], [.9, 10]].forEach(function (lf, j) { for (var i = 1; i <= lf[1]; i++) { var s = aqSway(t, i, lf[1], j), dx = Math.round(Math.sin(lf[0]) * i), dy = Math.round(Math.cos(lf[0]) * i), w = i < 3 || i > lf[1] - 2 ? 1 : 3;
        aP(c, x + dx + s - (w > 1 ? 1 : 0), by - dy, w, 1, i % 2 ? Ag : Al); aP(c, x + dx + s, by - dy, 1, 1, AG); } }); },
    moos: function (c, x, by) { for (var yy = -4; yy <= 4; yy++) for (var xx = -5; xx <= 5; xx++) { var d = (xx / 5.4) * (xx / 5.4) + (yy / 4.4) * (yy / 4.4); if (d > 1) continue; aP(c, x + xx, by - 4 + yy, 1, 1, d > .75 ? AG : (xx + yy < -3 ? Al : (xx * 3 + yy * 5) % 4 ? Ag : AG)); } },
    kiste: function (c, x, by, t) { var open = (t % 7000) > 5200, lift = open ? 3 : 0, x0 = x - 7;
      aP(c, x0, by - 7, 14, 7, AD); aP(c, x0 + 1, by - 6, 12, 5, "#8a5a32"); aP(c, x0 + 1, by - 4, 12, 1, "#5a3a1e"); aP(c, x0 + 3, by - 6, 1, 5, "#5a3a1e"); aP(c, x0 + 10, by - 6, 1, 5, "#5a3a1e");
      if (open) { aP(c, x0 + 1, by - 8, 12, 2, "#e8b84a"); aP(c, x0 + 3, by - 9, 2, 1, "#fff1b0"); aP(c, x0 + 8, by - 9, 3, 1, "#e8b84a"); if ((t % 7000) < 5300 && Math.random() < .3) aqBub(x + (Math.random() * 8 - 4), by - 10, 1); }
      aP(c, x0, by - 11 - lift, 14, 4, AD); aP(c, x0 + 1, by - 10 - lift, 12, 2, "#a8703e"); aP(c, x0 + 1, by - 10 - lift, 12, 1, "#c8945a"); aP(c, x0 + 6, by - 8 - lift, 2, 3, "#e8b84a"); aP(c, x0 + 6, by - 6, 2, 1, "#b88a2a"); },
    burg: function (c, x, by) { var x0 = x - 9;
      aP(c, x0, by - 22, 7, 22, AD); aP(c, x0 + 1, by - 21, 5, 21, "#a8a294"); aP(c, x0 - 1, by - 24, 9, 3, AD); aP(c, x0, by - 23, 7, 1, "#a8a294"); aP(c, x0 + 2, by - 24, 1, 1, "rgba(0,0,0,0)");
      aP(c, x0 + 6, by - 14, 13, 14, AD); aP(c, x0 + 7, by - 13, 11, 13, "#b8b2a4"); for (var m = 0; m < 3; m++) { aP(c, x0 + 7 + m * 4, by - 16, 3, 3, AD); aP(c, x0 + 8 + m * 4, by - 15, 1, 2, "#b8b2a4"); }
      aP(c, x0 + 11, by - 7, 5, 7, AD); aP(c, x0 + 12, by - 6, 3, 6, "#2a3a4a"); aP(c, x0 + 3, by - 17, 1, 3, "#2a3a4a");
      [[2, 6], [4, 12], [8, 10], [15, 4], [1, 18], [13, 11]].forEach(function (q) { aP(c, x0 + q[0], by - q[1], 2, 1, "#7a756a"); });
      aP(c, x0 + 1, by - 3, 3, 2, Ag); aP(c, x0 + 16, by - 2, 2, 2, Ag); aP(c, x0 + 8, by - 12, 2, 1, Al); },
    muschel: function (c, x, by) { for (var yy = 0; yy < 7; yy++) for (var xx = -5; xx <= 5; xx++) { var d = (xx / 5.5) * (xx / 5.5) + (yy / 6.5) * (yy / 6.5); if (d > 1) continue; aP(c, x + xx, by - 1 - yy, 1, 1, d > .8 ? AD : Math.abs(xx) % 2 ? "#d8a888" : "#f4dcc4"); }
      aP(c, x - 2, by - 1, 5, 1, AD); aP(c, x - 1, by, 3, 1, AD); aP(c, x - 1, by - 6, 2, 1, "#ffffff"); },
    helm: function (c, x, by, t) { aP(c, x - 7, by - 3, 14, 3, AD); aP(c, x - 6, by - 2, 12, 1, "#8a6420");
      for (var yy = -6; yy <= 6; yy++) for (var xx = -6; xx <= 6; xx++) { var d = Math.hypot(xx, yy); if (d > 6.4) continue; aP(c, x + xx, by - 9 + yy, 1, 1, d > 5.6 ? AD : xx + yy < -4 ? "#e8b84a" : "#c8963a"); }
      for (var y2 = -3; y2 <= 3; y2++) for (var x2 = -3; x2 <= 3; x2++) { var d2 = Math.hypot(x2, y2); if (d2 > 3.3) continue; aP(c, x - 1 + x2, by - 9 + y2, 1, 1, d2 > 2.6 ? "#5a4010" : "#2a4a5a"); }
      aP(c, x - 3, by - 11, 1, 1, "#a8d8f0"); aP(c, x + 4, by - 13, 1, 1, "#8a6420"); aP(c, x + 4, by - 6, 1, 1, "#8a6420"); if ((t % 5200) < 900 && Math.random() < .25) aqBub(x, by - 16, 1); },
    krug: function (c, x, by) { for (var yy = -4; yy <= 3; yy++) for (var xx = -6; xx <= 5; xx++) { var d = (xx / 6.3) * (xx / 6.3) + (yy / 4.2) * (yy / 4.2); if (d > 1) continue; aP(c, x + xx, by - 4 + yy, 1, 1, d > .78 ? AD : yy > 1 ? "#8a4a26" : xx === -1 || xx === 0 ? "#e8c8a0" : "#b06a3a"); }
      aP(c, x - 10, by - 6, 4, 4, AD); aP(c, x - 9, by - 5, 3, 2, "#b06a3a"); aP(c, x - 10, by - 5, 1, 2, "#2a3a4a"); aP(c, x + 2, by - 8, 2, 1, "#d8946a"); },
    steine: function (c, x, by) { [[-5, 4, 3, "#a8a294"], [2, 5, 4, "#8a8478"], [7, 3, 2, "#b8b2a4"]].forEach(function (q) { for (var yy = -q[2]; yy <= 0; yy++) for (var xx = -q[1]; xx <= q[1]; xx++) { var d = (xx / (q[1] + .4)) * (xx / (q[1] + .4)) + (yy / (q[2] + .4)) * (yy / (q[2] + .4)); if (d > 1) continue; aP(c, x + q[0] + xx, by + yy, 1, 1, d > .7 ? "#5a564c" : xx + yy < -2 ? "#d0cabc" : q[3]); } }); },
    anker: function (c, x, by) { aP(c, x - 1, by - 15, 3, 13, AD); aP(c, x, by - 14, 1, 11, "#6a7a8a"); aP(c, x - 2, by - 18, 5, 4, AD); aP(c, x - 1, by - 17, 3, 2, "#4a5866"); aP(c, x, by - 17, 1, 2, AD);
      aP(c, x - 4, by - 13, 9, 3, AD); aP(c, x - 3, by - 12, 7, 1, "#6a7a8a"); aP(c, x - 6, by - 3, 13, 3, AD); aP(c, x - 5, by - 2, 11, 1, "#6a7a8a"); aP(c, x - 7, by - 6, 3, 4, AD); aP(c, x - 6, by - 5, 1, 2, "#6a7a8a"); aP(c, x + 5, by - 6, 3, 4, AD); aP(c, x + 6, by - 5, 1, 2, "#6a7a8a"); },
    figur: function (c, x, by) { aP(c, x - 5, by - 2, 11, 2, AD); aP(c, x - 4, by - 1, 9, 1, "#a8a294");
      for (var yy = -5; yy <= 5; yy++) for (var xx = -5; xx <= 5; xx++) { var d = (xx / 5.4) * (xx / 5.4) + (yy / 5.4) * (yy / 5.4); if (d > 1) continue; aP(c, x + xx, by - 8 + yy, 1, 1, d > .78 ? AD : yy > 0 && Math.abs(xx) < 3 ? "#fff0dc" : "#e8a040"); }
      aP(c, x - 5, by - 14, 3, 3, AD); aP(c, x + 3, by - 14, 3, 3, AD); aP(c, x - 4, by - 13, 1, 1, "#e8a0a0"); aP(c, x + 4, by - 13, 1, 1, "#e8a0a0");
      aP(c, x - 2, by - 10, 1, 1, AD); aP(c, x + 2, by - 10, 1, 1, AD); aP(c, x, by - 8, 1, 1, "#d8463c"); aP(c, x - 4, by - 8, 1, 1, "#ff9aa8"); aP(c, x + 4, by - 8, 1, 1, "#ff9aa8"); }
  };
  // ---- moving things: bubbles, flakes, hearts ----
  var aq = null, aqRaf = 0;
  function aqBub(x, y, r) { if (aq && aq.bub.length < 60) aq.bub.push({ x: x, y: y, r: r || (Math.random() < .3 ? 2 : 1), ph: Math.random() * 6 }); }
  function aqHeart(x, y) { if (aq) aq.hearts.push({ x: x, y: y, l: 1.4 }); }
  function aqSay(t) { aqToast.textContent = t; aqToast.hidden = false; aqToast.classList.remove("pop"); void aqToast.offsetWidth; aqToast.classList.add("pop"); clearTimeout(aqSay.t); aqSay.t = setTimeout(function () { aqToast.hidden = true; }, 2200); }
  // ---- the goldfish, big: a round body, a waving tail, fins, an eye that can smile ----
  function aqFish(c, F, t) {
    var dir = F.dir, X = Math.round(F.x), Y = Math.round(F.y), sw = Math.sin(t / (F.fast ? 90 : 170)), px = function (dx, dy, col) { aP(c, X + dx * dir, Y + dy, 1, 1, col); };
    for (var i = 0; i < 8; i++) { var h = Math.round(1 + i * .75), off = Math.round(sw * i * .35); for (var dy = -h; dy <= h; dy++) px(8 + i, dy + off, Math.abs(dy) === h || i === 7 ? "#a8401a" : Math.abs(dy) > h - 2 ? "#f8b860" : "#f08a24"); }
    for (var dy2 = -5; dy2 <= 5; dy2++) for (var dx = -9; dx <= 9; dx++) { var d = (dx / 9.4) * (dx / 9.4) + (dy2 / 5.4) * (dy2 / 5.4); if (d > 1) continue;
      px(dx, dy2, d > .8 ? "#a8401a" : dy2 < -2 ? "#f8b860" : dy2 > 2 ? "#f8d8a0" : (dx + dy2 * 2) % 4 === 0 && dx > -5 ? "#d8701a" : "#f08a24"); }
    for (var k = 0; k < 4; k++) px(-1 + k, -6 - (k < 3 ? 1 : 0) - (k === 1 ? 1 : 0), "#e86a1a"); px(0, -7, "#a8401a"); px(1, -8, "#a8401a");   // the dorsal fin
    var fl = Math.sin(t / 140) > 0 ? 1 : 0; px(-2, 4 + fl, "#f8b860"); px(-1, 5 + fl, "#e86a1a"); px(-2, 5 + fl, "#a8401a");   // a little side fin, flapping
    if (F.happy) { px(-6, -2, "#3a2414"); px(-5, -3, "#3a2414"); px(-4, -2, "#3a2414"); } else { px(-6, -2, "#ffffff"); px(-5, -2, "#ffffff"); px(-6, -1, "#ffffff"); px(-5, -1, "#3a2414"); px(-6, -3, "#a8401a"); px(-5, -3, "#a8401a"); }
    if (F.blush || F.happy) { px(-4, 1, "#ff9aa8"); px(-3, 1, "#ff9aa8"); }
    px(-9, 1, "#a8401a"); if (F.gulp) px(-10, 1, "#a8401a");
  }
  function aqPaw(c, rise) {   // the hamster's paw pressed against the glass from the front: a round palm and four toe beans
    var cx = 90, cy = 140 - Math.round(rise), disc = function (x, y, r, fill, out) { for (var yy = -r - 1; yy <= r + 1; yy++) for (var xx = -r - 1; xx <= r + 1; xx++) { var d = Math.hypot(xx, yy); if (d <= r + .5) aP(c, x + xx, y + yy, 1, 1, d > r - .5 && out ? out : fill); } };
    [[-9, -9], [-3, -13], [3, -13], [9, -9]].forEach(function (q) { disc(cx + q[0], cy + q[1], 3, "#e8a040", AD); });
    disc(cx, cy, 10, "#e8a040", AD); disc(cx, cy + 1, 7, "#fff0dc");
    [[-9, -9], [-3, -13], [3, -13], [9, -9]].forEach(function (q) { disc(cx + q[0], cy + q[1], 1, "#f0a0a8"); });
    disc(cx, cy, 3, "#f0a0a8"); aP(c, cx - 2, cy - 2, 1, 1, "#ffc8d0"); }
  function aqNewFish() { return { x: 90, y: 70, dir: -1, tx: 70, ty: 66, next: 0, happy: 0, blush: 0, gulp: 0, fast: 0 }; }
  function aqDraw(t) {
    aqRaf = 0; if (!aq || aqEl.hidden) return; aqRaf = requestAnimationFrame(aqDraw);
    var dt = Math.min(.05, (t - (aq.last || t)) / 1000); aq.last = t; var F = aq.fish, S = aqSt();
    aqStep(t, dt);
    aqc.drawImage(aqBg, 0, 0);
    for (var r = 0; r < 7; r++) { var bx = ((r * 29 + t / 90) % 220) - 30; for (var k = 0; k < 60; k++) { var x = Math.round(bx + k * .45), y = AQ_WL + 2 + k; if (x >= 0 && x < AQ_W && aqWater[y * AQ_W + x] && (k + r) % 3) aP(aqc, x, y, 1, 1, "rgba(255,255,255,.13)"); } }   // light falling in
    for (var sx = 0; sx < AQ_W; sx++) if (aqIn(sx, AQ_WL) && aqIn(sx + 3, AQ_WL) && aqIn(sx - 3, AQ_WL)) aP(aqc, sx, AQ_WL + (Math.sin(sx * .3 + t / 300) > .6 ? -1 : 0), 1, 1, (sx + Math.floor(t / 120)) % 5 ? "#c8ecf8" : "#ffffff");
    S.s.forEach(function (id, i) { if (id && AQ_DRAW[id]) AQ_DRAW[id](aqc, AQ_SLOTS[i], aqFloor(AQ_SLOTS[i]) + 2, t + i * 900); });
    if (Math.random() < dt * 3) aqBub(150 + Math.random() * 2, aqFloor(150), 1); aP(aqc, 148, aqFloor(150) - 1, 5, 2, "#5a564c");   // the air stone
    aq.flakes.forEach(function (f) { aP(aqc, f.x, f.y, 2, 1, f.c); });
    aqFish(aqc, F, t);
    aq.bub = aq.bub.filter(function (b) { b.y -= 14 * dt * (1 + b.r * .3); b.x += Math.sin(t / 200 + b.ph) * .15; if (b.y < AQ_WL + 1) return false; if (b.r > 1) { aP(aqc, b.x - 1, b.y, 3, 1, "#e8f8ff"); aP(aqc, b.x, b.y - 1, 1, 3, "#e8f8ff"); aP(aqc, b.x, b.y, 1, 1, "#a8d8f0"); } else aP(aqc, b.x, b.y, 1, 1, "#e8f8ff"); return true; });
    aq.hearts = aq.hearts.filter(function (h) { h.l -= dt; h.y -= 12 * dt; var x = Math.round(h.x), y = Math.round(h.y); aP(aqc, x - 2, y, 2, 1, "#e8465a"); aP(aqc, x + 1, y, 2, 1, "#e8465a"); aP(aqc, x - 2, y + 1, 5, 1, "#e8465a"); aP(aqc, x - 1, y + 2, 3, 1, "#e8465a"); aP(aqc, x, y + 3, 1, 1, "#e8465a"); aP(aqc, x - 2, y, 1, 1, "#ff9aa8"); return h.l > 0; });
    aqc.drawImage(aqFront, 0, 0);
    if (aq.paw > 0) aqPaw(aqc, aq.paw);
    if (aq.edit) AQ_SLOTS.forEach(function (sx, i) { var y = aqFloor(sx) - 6, on = Math.floor(t / 400) % 2; aP(aqc, sx - 4, y - 4, 9, 9, AD); aP(aqc, sx - 3, y - 3, 7, 7, on ? "#fff8ec" : "#ffe08a"); aP(aqc, sx - 2, y, 5, 1, AD); aP(aqc, sx, y - 2, 1, 5, AD); });
  }
  // ---- what the fish does ----
  function aqClampT(F) { F.tx = Math.max(22, Math.min(158, F.tx)); F.ty = Math.max(AQ_WL + 9, Math.min(100, F.ty)); var a = (F.tx - AQ_CX) / (AQ_RX - 20), b = (F.ty - AQ_CY) / (AQ_RY - 12); var d = a * a + b * b; if (d > 1) { F.tx = AQ_CX + (F.tx - AQ_CX) / Math.sqrt(d); F.ty = AQ_CY + (F.ty - AQ_CY) / Math.sqrt(d); } }
  function aqStep(t, dt) {
    var F = aq.fish, now = performance.now();
    if (aq.mode === "feed") { var fl = aq.flakes.filter(function (f) { return !f.gone; }); if (fl.length && !aq.full) { var n = fl.reduce(function (a, f) { return Math.hypot(f.x - F.x, f.y - F.y) < Math.hypot(a.x - F.x, a.y - F.y) ? f : a; }); F.tx = n.x - F.dir * 9; F.ty = n.y; F.fast = 1; } }
    else if (aq.mode === "play") { if (aq.ptr) { F.tx = aq.ptr[0]; F.ty = aq.ptr[1]; F.fast = 1; } }
    else if (aq.mode === "love") { F.tx = 92; F.ty = 78; F.fast = 0; }
    else if (now > F.next) { F.next = now + 2500 + Math.random() * 3500; F.tx = 30 + Math.random() * 120; F.ty = 40 + Math.random() * 55; F.fast = 0; }
    aqClampT(F);
    var dx = F.tx - F.x, dy = F.ty - F.y, d = Math.hypot(dx, dy), sp = (F.fast ? 46 : 16) * dt;
    if (d > .8) { F.x += dx / d * Math.min(d, sp); F.y += dy / d * Math.min(d, sp * .8); if (Math.abs(dx) > 3) F.dir = dx < 0 ? -1 : 1; }
    // flakes sink; the fish catches the ones near its mouth
    aq.flakes.forEach(function (f) { if (f.gone) return; f.y = Math.min(aqFloor(f.x) - 1, f.y + 7 * dt); f.x += Math.sin(t / 300 + f.ph) * .08;
      var mx = F.x + F.dir * 9; if (!aq.full && Math.hypot(f.x - mx, f.y - (F.y + 1)) < 3.5) { f.gone = 1; F.gulp = 1; setTimeout(function () { if (aq) aq.fish.gulp = 0; }, 160); beep([[880, .02], [1180, .03]]); aq.ate++; } });
    aq.flakes = aq.flakes.filter(function (f) { if (f.gone) return false; if (f.y >= aqFloor(f.x) - 1) { f.rest = (f.rest || 0) + dt; return f.rest < 4; } return true; });
    if (aq.mode === "feed" && !aq.flakes.length) aqFeedDone();
    if (aq.mode === "play" && aq.ptr && d < 4 && now > (aq.caught || 0)) { aq.caught = now + 900; aq.plays++; beep([[620, .03], [820, .04]]); aqBub(F.x + F.dir * 10, F.y - 2, 2); if (aq.plays === 4) { aqSay("Der Goldfisch hat Spaß!"); F.happy = 1; setTimeout(function () { if (aq) aq.fish.happy = 0; }, 900); s.love = clamp(s.love + 1); renderNeeds(); } }
    if (aq.mode === "love") { var L2 = aq.love; if (d < 2 && !L2.t0) L2.t0 = now; if (L2.t0) { var u = (now - L2.t0) / 1000; aq.paw = Math.min(30, u * 40); F.dir = 1; F.x += Math.sin(now / 160) * .05;
        if (u > .9 && !L2.kiss) { L2.kiss = 1; F.happy = 1; F.blush = 1; beep([[1047, .04], [1319, .05], [1568, .07]]); for (var h = 0; h < 4; h++) (function (h) { setTimeout(function () { aqHeart(86 + h * 4, 66 - h * 3); }, h * 220); })(h); aqSay("Ihr habt euch gern!"); s.love = clamp(s.love + 2); renderNeeds(); if (window.SudokuSave) window.SudokuSave(); }
        if (u > 3.2) { aq.paw = Math.max(0, 30 - (u - 3.2) * 50); if (aq.paw <= 0) { aq.mode = ""; F.happy = 0; setTimeout(function () { if (aq) aq.fish.blush = 0; }, 2500); aqBarDraw(); } } } }
  }
  function aqFeedDone() { aq.mode = ""; aq.fish.fast = 0; var L = life();
    if (aq.full) aqSay("Der Goldfisch ist noch satt.");
    else { L.fishFed = Date.now(); aqSay("Lecker!"); aqHeart(aq.fish.x, aq.fish.y - 8); s.love = clamp(s.love + 2); renderNeeds(); if (window.SudokuSave) window.SudokuSave(); }
    aqBarDraw(); }
  // ---- the buttons ----
  function aqBarDraw() {
    if (!aq) return;
    if (aq.edit) { aqBar.innerHTML = '<span class="aq-hint">Tippe auf ein Feld am Boden</span><button type="button" class="fi-b" data-a="done">Fertig</button>'; return; }
    var busy = !!aq.mode;
    aqBar.innerHTML = [["feed", "Füttern"], ["play", "Spielen"], ["love", "Gern haben"], ["edit", "Einrichten"]].map(function (b) { return '<button type="button" class="fi-b2' + (aq.mode === b[0] ? " on" : "") + '" data-a="' + b[0] + '"' + (busy && aq.mode !== b[0] ? " disabled" : "") + '>' + (aq.mode === "play" && b[0] === "play" ? "Genug" : b[1]) + '</button>'; }).join("");
  }
  aqBar.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b || !aq) return; e.stopPropagation(); var a = b.dataset.a;
    if (a === "done") { aq.edit = false; aqBarDraw(); beep([[660, .04], [880, .05]]); if (window.SudokuSave) window.SudokuSave(); return; }
    if (a === "edit") { aq.edit = true; aqBarDraw(); beep([[520, .04]]); return; }
    if (a === "feed") { aq.mode = "feed"; aq.ate = 0; aq.full = Date.now() - (life().fishFed || 0) < 3 * 3600e3; var x0 = 60 + Math.random() * 60; for (var k = 0; k < 7; k++) aq.flakes.push({ x: x0 + (k * 7) % 22 - 11, y: AQ_WL + 1 + (k % 3), ph: k, c: k % 2 ? "#e8c060" : "#d8703a" }); beep([[1047, .03], [1175, .03], [1319, .04]]); aqBarDraw(); return; }
    if (a === "play") { if (aq.mode === "play") { aq.mode = ""; aq.ptr = null; aqBarDraw(); return; } aq.mode = "play"; aq.plays = 0; aqSay("Tippe ins Wasser!"); aqBarDraw(); return; }
    if (a === "love") { aq.mode = "love"; aq.love = {}; aq.paw = 0; aqBarDraw(); return; } });
  function aqPt(e) { var r = aqCv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * AQ_W, (e.clientY - r.top) / r.height * AQ_H]; }
  aqCv.addEventListener("pointerdown", function (e) { if (!aq) return; e.preventDefault(); var p = aqPt(e);
    if (aq.edit) { var best = -1, bd = 14; AQ_SLOTS.forEach(function (sx, i) { var d = Math.hypot(p[0] - sx, (p[1] - (aqFloor(sx) - 8)) * .6); if (d < bd) { bd = d; best = i; } }); if (best >= 0) aqPick(best); return; }
    if (aq.mode === "play") { aq.ptr = p; aq.drag = true; try { aqCv.setPointerCapture(e.pointerId); } catch (er) { } return; }
    var F = aq.fish; if (Math.hypot(p[0] - F.x, p[1] - F.y) < 12) { F.tx = F.x + (F.x < 90 ? 30 : -30); F.ty = F.y - 8; F.fast = 1; F.next = performance.now() + 1500; aqBub(F.x + F.dir * 10, F.y, 2); beep([[740, .03]]); }   // a tap on the fish: it darts away
    else { beep([[1400, .015]]); F.tx = p[0]; F.ty = p[1]; F.next = performance.now() + 2500; }      // a tap on the glass: it comes to look
  });
  aqCv.addEventListener("pointermove", function (e) { if (aq && aq.mode === "play" && aq.drag) aq.ptr = aqPt(e); });
  aqCv.addEventListener("pointerup", function () { if (aq) aq.drag = false; });
  // ---- choosing what goes on a spot of gravel: one card with little pictures ----
  function aqPick(i) {
    var S = aqSt(), cur = S.s[i];
    aqCard.innerHTML = '<div class="fi-c aq-pick"><p class="fi-h">Einrichten</p><div class="aq-grid">' + AQ_ITEMS.map(function (it) { return '<button type="button" data-k="' + it[0] + '"' + (cur === it[0] ? ' class="on"' : "") + '><canvas width="28" height="30"></canvas><small>' + it[1] + '</small></button>'; }).join("") +
      '<button type="button" data-k=""' + (!cur ? ' class="on"' : "") + '><canvas width="28" height="30"></canvas><small>Leer</small></button></div></div>';
    aqCard.hidden = false;
    aqCard.querySelectorAll("canvas").forEach(function (cv) { var k = cv.parentNode.dataset.k, c = cv.getContext("2d"); c.imageSmoothingEnabled = false; aP(c, 0, 0, 28, 30, "#7cc4e6"); aP(c, 0, 26, 28, 4, "#c8a878"); if (k && AQ_DRAW[k]) AQ_DRAW[k](c, 14, 27, 0); });
    aqCard.onclick = function (e) { var b = e.target.closest("button"); if (!b) { aqCard.hidden = true; return; } e.stopPropagation(); S.s[i] = b.dataset.k; aqCard.hidden = true; beep(b.dataset.k ? [[660, .04], [880, .05]] : [[440, .04]]); if (window.SudokuSave) window.SudokuSave(); };
  }
  function aqOpen() { aq = { fish: aqNewFish(), bub: [], flakes: [], hearts: [], mode: "", edit: false, paw: 0, ate: 0, plays: 0 }; aqEl.hidden = false; aqBar.style.display = "flex"; aqCard.hidden = true; aqBarDraw(); if (!aqRaf) aqRaf = requestAnimationFrame(aqDraw); beep([[520, .04], [780, .05]]); }
  function aqClose() { aqEl.hidden = true; aqBar.style.display = "none"; aq = null; if (aqRaf) cancelAnimationFrame(aqRaf); aqRaf = 0; renderBowl(); }
  aqEl.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); aqClose(); });
  aqEl.addEventListener("click", function (e) { e.stopPropagation(); });
  var _aq_int = interrupt; interrupt = function () { if (aq && !window.__resume) aqClose(); return _aq_int.apply(this, arguments); };
  // the bowl in the bedroom shows a little of what is inside: a green or red tip for each plant
  function renderBowl() { var S = aqSt(), g = bowlBtn.querySelector(".bx-deco"); if (!g) { g = document.createElement("span"); g.className = "bx-deco"; bowlBtn.insertBefore(g, bowlBtn.querySelector(".bx-fish")); }
    var px = "";
    S.s.forEach(function (id, i) { if (!id) return; var x = 3 + i * 3.3, col = id === "ludwig" ? "#c8463c" : /seegras|pest|farn|moos/.test(id) ? "#5aa04e" : id === "kiste" || id === "helm" ? "#c8963a" : "#a8a294", h = /seegras|pest|ludwig/.test(id) ? 4 : 2;
      px += '<path fill="' + col + '" d="M' + Math.round(x) + ' ' + (17 - h) + 'h1v' + h + 'h-1z"/>'; });
    g.innerHTML = '<svg viewBox="0 0 24 21" shape-rendering="crispEdges">' + px + '</svg>'; }
  renderBowl();
  window.__aq = { open: aqOpen, close: aqClose, st: function () { return aq && { mode: aq.mode, edit: aq.edit, fish: [Math.round(aq.fish.x), Math.round(aq.fish.y)], flakes: aq.flakes.length, slots: aqSt().s.slice() }; }, set: function (i, k) { aqSt().s[i] = k; }, love: function () { s.love = s.love; } };
