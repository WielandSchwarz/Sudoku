  // ===================== battleships at the wooden table (preview mockup) =====================
  // perspective board drawn on a canvas; ships are prerendered sprites for every row/column; the fox plays against you
  var BS = /*BSART*/;
  var BG_ = BS.geo, BN = BG_.N;
  function bsS(v) { return 1 / (BG_.ZF + (BG_.ZN - BG_.ZF) * v); }
  function bsP(u, v) { var s_ = bsS(v); return [BG_.CX + (u - .5) * BG_.WN * s_, BG_.YH + BG_.HK * s_]; }
  function bsInv(x, y) { var s_ = (y + .5 - BG_.YH) / BG_.HK; if (s_ <= 0) return null; var z = 1 / s_, v = (z - BG_.ZF) / (BG_.ZN - BG_.ZF), u = (x + .5 - BG_.CX) / (BG_.WN * s_) + .5; return [u, v]; }
  function bsCellAt(x, y) { var q = bsInv(x, y); if (!q || q[0] < 0 || q[0] >= 1 || q[1] < 0 || q[1] >= 1) return null; return [Math.floor(q[0] * BN), Math.floor(q[1] * BN)]; }
  var bsImg = {};
  function bsLoad(k, src) { var i = new Image(); i.src = src; bsImg[k] = i; }
  bsLoad("board", BS.board); bsLoad("grid", BS.grid); Object.keys(BS.bg).forEach(function (k) { bsLoad("bg_" + k, BS.bg[k]); });
  Object.keys(BS.H).forEach(function (k) { bsLoad("H" + k, BS.H[k].src); });
  Object.keys(BS.V).forEach(function (k) { bsLoad("V" + k, BS.V[k].src); });
  // the opponents: a random animal each game, peeking over the table edge with its paws (or wings, or claws) on the board
  var BSOPP = {"fox":{"dy":-3,"cx":27,"paw":["#d8743a","#b85a26"],"a":"m","n":"Fuchs"},"igel":{"dy":-5,"cx":30,"paw":["#8a6a4a","#6a4e34"],"a":"m","n":"Igel"},"hare":{"dy":-13,"cx":30,"paw":["#b08868","#8a6648"],"a":"m","n":"Hase"},"squirrel":{"dy":-1,"cx":26,"paw":["#d8682a","#b04e1c"],"a":"n","n":"Eichhörnchen"},"mouse":{"dy":-3,"cx":28,"paw":["#a8a8b4","#86869a"],"a":"f","n":"Maus"},"badger":{"dy":-8,"cx":30,"paw":["#5a5a62","#3e3e46"],"a":"m","n":"Dachs"},"beaver":{"dy":-10,"cx":34,"paw":["#8a5a3a","#6a4028"],"a":"m","n":"Biber"},"otter":{"dy":-11,"cx":30,"paw":["#8a6040","#6a4628"],"a":"m","n":"Otter"},"owl":{"dy":-2,"cx":30,"paw":["#a8804a","#86603a"],"a":"f","n":"Eule"},"duck":{"dy":-5,"cx":30,"paw":["#e8dcc8","#c8b8a0"],"a":"f","n":"Ente"},"frog":{"dy":-8,"cx":30,"paw":["#5aa04e","#3e7c3c"],"a":"m","n":"Frosch"},"panda":{"dy":-5,"cx":28,"paw":["#4a4a54","#34343c"],"a":"m","n":"Panda"},"koala":{"dy":-5,"cx":30,"paw":["#a8a8b0","#86868e"],"a":"m","n":"Koala"},"lynx":{"dy":-7,"cx":30,"paw":["#d8b080","#b08a5e"],"a":"m","n":"Luchs"},"peng":{"dy":-6,"cx":30,"paw":["#4a4a5e","#34344a"],"a":"m","n":"Pinguin"},"seal":{"dy":-9,"cx":30,"paw":["#9a9aa6","#7a7a88"],"a":"m","n":"Seehund"},"puffin":{"dy":-6,"cx":30,"paw":["#4a4a5e","#34344a"],"a":"m","n":"Papageientaucher"},"robin":{"dy":-5,"cx":30,"paw":["#a07a50","#7e5a36"],"a":"n","n":"Rotkehlchen"},"tit":{"dy":-5,"cx":30,"paw":["#6a9ad8","#4a7ab8"],"a":"f","n":"Blaumeise"},"crab":{"dy":-8,"cx":30,"paw":["#e8603a","#c04424"],"a":"f","n":"Krabbe"},"turtle":{"dy":-11,"cx":30,"paw":["#6aae52","#4e8e3e"],"a":"f","n":"Schildkröte"},"chick":{"dy":-3,"cx":30,"paw":["#f6d040","#d8a820"],"a":"n","n":"Entenküken"}};
  var bsWho = "fox", bsLast = null, bsAt = null;
  function bsPick() { var ks = Object.keys(BSOPP).filter(function (k) { return k !== bsLast && typeof ALLANI !== "undefined" && ALLANI[k]; }); bsWho = ks.length ? ks[Math.floor(Math.random() * ks.length)] : "fox"; bsLast = bsWho; return bsWho; }
  function oDer(k) { var o = BSOPP[k || bsWho]; return (o.a === "m" ? "Der " : o.a === "f" ? "Die " : "Das ") + o.n; }
  function oDen(k) { var o = BSOPP[k || bsWho]; return (o.a === "m" ? "den " : o.a === "f" ? "die " : "das ") + o.n; }
  function oVom(k) { var o = BSOPP[k || bsWho]; return (o.a === "f" ? "von der " : "vom ") + o.n; }
  Object.keys(BSOPP).forEach(function (k) { var an = typeof ALLANI !== "undefined" && ALLANI[k]; if (!an) return; bsLoad("opp_" + k, "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + an.vb + '" width="48" height="50" shape-rendering="crispEdges">' + an.svg + '</svg>')); });

  var bsEl = xEl("div", "bee-pov bs-pov", scene); bsEl.hidden = true;
  bsEl.innerHTML = '<canvas class="bs-cv" width="180" height="135"></canvas><b class="bp-ban bs-ban"></b><button type="button" class="bp-x bs-x" aria-label="Spiel beenden">×</button>';
  var bsCv = bsEl.querySelector(".bs-cv"), bx = bsCv.getContext("2d"), bsOff = document.createElement("canvas"); bsOff.width = 180; bsOff.height = 135; var ox_ = bsOff.getContext("2d");
  bx.imageSmoothingEnabled = false; ox_.imageSmoothingEnabled = false;
  function bsPt(ev) { var r = bsCv.getBoundingClientRect(); return [(ev.clientX - r.left) / r.width * 180, (ev.clientY - r.top) / r.height * 135]; }
  function bsBanner(t) { var b = bsEl.querySelector(".bs-ban"); if (b.textContent === t) return; b.textContent = t; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }

  // ---- fleets ----
  var FLEET = [5, 4, 3, 2];
  function cellsOf(sh) { var o = []; for (var i = 0; i < sh.L; i++) o.push(sh.h ? [sh.c + i, sh.r] : [sh.c, sh.r + i]); return o; }
  function fits(fleet, sh, skip) {
    var cs = cellsOf(sh);
    if (cs.some(function (q) { return q[0] < 0 || q[1] < 0 || q[0] >= BN || q[1] >= BN; })) return false;
    return !fleet.some(function (o) { return o !== skip && cellsOf(o).some(function (a) { return cs.some(function (b) { return a[0] === b[0] && a[1] === b[1]; }); }); });
  }
  function randomFleet() {
    for (var tries = 0; tries < 200; tries++) {
      var fl = [], ok = true;
      FLEET.forEach(function (L) {
        if (!ok) return; var placed = false;
        for (var t = 0; t < 200 && !placed; t++) { var sh = { L: L, h: Math.random() < .5, c: Math.floor(Math.random() * BN), r: Math.floor(Math.random() * BN), hits: {}, sunk: false }; if (fits(fl, sh)) { fl.push(sh); placed = true; } }
        if (!placed) ok = false;
      });
      if (ok) return fl;
    }
    return [];
  }
  function shipAt(fleet, c, r) { return fleet.filter(function (s_) { return cellsOf(s_).some(function (q) { return q[0] === c && q[1] === r; }); })[0]; }

  // ---- drawing helpers ----
  function spriteOf(sh) {
    if (sh.h) { var k = sh.r + "_" + sh.L, d = BS.H[k], vc = (sh.r + .55) / BN, dx = Math.round(bsP(sh.c / BN, vc)[0]) - Math.round(BS.rowx0[sh.r]); return { img: bsImg["H" + k], x: d.x + dx, y: d.y, w: d.w, h: d.h }; }
    var k2 = sh.c + "_" + sh.r + "_" + sh.L, d2 = BS.V[k2]; return { img: bsImg["V" + k2], x: d2.x, y: d2.y, w: d2.w, h: d2.h };
  }
  function rect(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
  function flame(c, x, y, t) {                                             // a small flickering fire with a wisp of smoke
    var f = Math.floor(t / 140) % 2; x = Math.round(x); y = Math.round(y);
    rect(c, x - 3, y, 7, 2, "#3a2414"); rect(c, x - 2, y - 3 - f, 5, 4 + f, "#e8402a"); rect(c, x - 3, y - 2, 1, 2, "#e8402a"); rect(c, x + 3, y - 2 + f, 1, 2, "#e8402a");
    rect(c, x - 1, y - 2 - f, 3, 3 + f, "#ff9a2a"); rect(c, x, y - 1, 1, 2, "#ffe070"); rect(c, x - (f ? 1 : 0), y - 5 - f, 1, 2, "#e8402a");
    var sm = Math.floor(t / 200) % 3; c.globalAlpha = .7; rect(c, x + sm - 1, y - 8 - sm, 1, 1, "#b8b2bc"); rect(c, x + sm, y - 10 - sm, 2, 1, "#8a8490"); c.globalAlpha = 1;
  }
  function splashMark(c, x, y) { x = Math.round(x); y = Math.round(y); [[-3, 0], [3, 0], [-2, -1], [2, -1], [-2, 1], [2, 1], [0, -2], [0, 2]].forEach(function (q) { rect(c, x + q[0], y + q[1], 1, 1, "#e6f4fc"); }); rect(c, x, y - 3, 1, 1, "#ffffff"); }
  function debris(c, x, y) { x = Math.round(x); y = Math.round(y); rect(c, x - 3, y, 4, 1, "#c08a50"); rect(c, x - 3, y + 1, 4, 1, "#8a5a30"); rect(c, x + 1, y - 2, 3, 1, "#c08a50"); }
  function cellCenter(c, r, dy) { return bsP((c + .5) / BN, (r + (dy == null ? .5 : dy)) / BN); }
  function quad(c, cc, rr, col) {
    var pts = [bsP(cc / BN, rr / BN), bsP((cc + 1) / BN, rr / BN), bsP((cc + 1) / BN, (rr + 1) / BN), bsP(cc / BN, (rr + 1) / BN)];
    for (var i = 0; i < 4; i++) { var a = pts[i], b = pts[(i + 1) % 4], n = Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))); for (var k = 0; k <= n; k++) rect(c, a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n, 1, 1, col); }
  }
  function twinkle(c, x, y, t, ph) { var u = ((t + ph) % 2200) / 2200; if (u > .34) return; var R = u < .08 || u > .26 ? 1 : u < .16 ? 2 : 3;   // the beehive sparkle
    rect(c, x, y - R, 1, 2 * R + 1, "#ffd34a"); rect(c, x - R, y, 2 * R + 1, 1, "#ffd34a"); if (R === 3) { rect(c, x - 1, y - 1, 3, 3, "#ffd34a"); rect(c, x, y - 1, 1, 3, "#ffffff"); rect(c, x - 1, y, 3, 1, "#ffffff"); } else rect(c, x, y, 1, 1, "#ffffff"); }

  // ---- the game ----
  var bsOpen = false, bsAbort = null, bsWhere = "shore", TEDGE = 24;
  function bsPlace() { var w = typeof weather !== "undefined" ? weather.type : "sun", night = typeof daylight === "function" && daylight() === "night"; return (w === "rain" || w === "storm" || w === "snow" || night) ? "kitchen" : "shore"; }
  // ---- the backdrop behind the table: cut straight out of the real lake picture (by season) or the real kitchen (as furnished), then sky, weather and light on top ----
  var bgCv = document.createElement("canvas"); bgCv.width = 180; bgCv.height = TEDGE; var bgc = bgCv.getContext("2d"); bgc.imageSmoothingEnabled = false;
  var bgKey = "", bgReady = false, KDX = -20, KWIN = { x: 126 - 20, y: 18, w: 36, h: 36 }, KCROP = 24;
  function bsWx() { return typeof weather !== "undefined" ? weather.type : "sun"; }
  function bsDay() { return typeof daylight === "function" ? daylight() : "day"; }
  function bgPrepare() {
    var se = season(), key = bsWhere + se + (bsWhere === "kitchen" ? JSON.stringify(home.kitchen) : "");
    if (key === bgKey) return; bgKey = key; bgReady = false;
    var img = new Image();
    img.onload = function () {
      if (bgKey !== key) return; bgc.clearRect(0, 0, 180, TEDGE);
      if (bsWhere === "shore") bgc.drawImage(img, 0, 46, 180, TEDGE, 0, 0, 180, TEDGE);       // hills, birches, the lighthouse and the far water
      else { bgc.drawImage(img, -KDX, KCROP, 180 + KDX, TEDGE, 0, 0, 180 + KDX, TEDGE); bgc.drawImage(img, 170, KCROP, 10, TEDGE, 160, 0, 10, TEDGE); bgc.drawImage(img, 170, KCROP, 10, TEDGE, 170, 0, 10, TEDGE); }                         // the hood, the shelf and the window, just as furnished
      bgReady = true;
    };
    if (bsWhere === "shore") img.src = POND["bg_" + se];
    else img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 135" width="180" height="135" shape-rendering="crispEdges">' + kLayers(home.kitchen).map(function (x) { return A[x] || ""; }).join("") + '</svg>');
  }
  function skyCols(day, w) {
    if (day === "night") return ["#1e2a54", "#2a3a6a"];
    if (w === "storm") return ["#2a3244", "#46506a"];
    if (day === "twilight") return ["#f4b88a", "#f8dcae"];
    if (w === "rain" || w === "snow") return ["#9aaebe", "#b8c8d4"];
    if (w === "clouds") return ["#aac4d6", "#c8dae6"];
    return ["#bfe3f7", "#d6eefa"];
  }
  function skyFill(x, y, w, h, day, wx) { var c = skyCols(day, wx); for (var i = 0; i < h; i++) rect(bx, x, y + i, w, 1, i < h * .55 ? c[0] : c[1]); }
  function cloud(x, y, sc, col, sh) { x = Math.round(x); rect(bx, x + 2, y, 5 * sc, 2, col); rect(bx, x, y + 2, 9 * sc, 2, col); rect(bx, x + 1, y + 4, 8 * sc - 1, 1, sh); }
  function skyLife(x0, y0, w, h, t, day, wx) {                             // what moves in the sky: clouds, the moon and stars, a rainbow
    bx.save(); bx.beginPath(); bx.rect(x0, y0, w, h); bx.clip();
    if (day === "night") { [[6, 3], [19, 7], [27, 2], [33, 9], [12, 12]].forEach(function (q, i) { if (Math.floor((t + i * 700) / 900) % 4) rect(bx, x0 + q[0], y0 + q[1], 1, 1, "#fff6c8"); }); rect(bx, x0 + w - 10, y0 + 3, 4, 4, "#fff2c0"); rect(bx, x0 + w - 9, y0 + 3, 3, 3, "#fffae0"); }
    if (wx === "rainbow") ["#e8554a", "#f0a040", "#f0d860", "#7cc06a", "#5a9ac0", "#8a6ac0"].forEach(function (c, i) { bx.globalAlpha = .55; for (var a = 0; a <= 140; a++) { var an = Math.PI * (1 - a / 140); rect(bx, x0 + w * .6 + Math.cos(an) * (Math.min(w * .42, 30) - i), y0 + h + 6 - Math.sin(an) * (h + 4 - i), 1, 1, c); } bx.globalAlpha = 1; });
    var n = wx === "clouds" || wx === "rain" || wx === "storm" || wx === "snow" ? 4 : wx === "sun" ? 1 : 2, dark = wx === "storm" || wx === "rain";
    for (var i = 0; i < n; i++) { var sp = 260 + i * 90, cx = ((i * 67 + t / sp) % (w + 30)) - 20; cloud(x0 + cx, y0 + 1 + (i * 5) % Math.max(2, h - 6), 1, day === "night" ? "#4a5478" : dark ? "#8a94a6" : "#ffffff", day === "night" ? "#3a4468" : dark ? "#6a7488" : "#e4eef6"); }
    bx.restore();
  }
  function windowWeather(t, wx, oy) {                                      // rain runs down the glass, snow drifts, lightning flashes
    var X = KWIN.x, Y = KWIN.y - oy, W = KWIN.w, Hh = KWIN.h;
    bx.save(); bx.beginPath(); bx.rect(X, Math.max(0, Y), W, Hh); bx.clip();
    if (wx === "rain" || wx === "storm") for (var j = 0; j < 12; j++) { var rx = X + ((j * 11 + Math.floor(t / 45)) % W), ry = Y + ((j * 29 + Math.floor(t / 28)) % Hh); rect(bx, rx, ry, 1, 3, "#c8d6ea"); }
    if (wx === "snow") for (var k = 0; k < 12; k++) rect(bx, X + ((k * 13 + Math.floor(Math.sin(t / 700 + k) * 2) + 40) % W), Y + ((k * 23 + Math.floor(t / 120)) % Hh), 1, 1, "#ffffff");
    if (wx === "storm" && Math.floor(t / 2300) % 3 === 0 && (t % 2300) < 110) { bx.globalAlpha = .7; rect(bx, X, Y, W, Hh, "#ffffff"); bx.globalAlpha = 1; }
    bx.restore();
  }
  function drawBackdrop(t) {
    var wx = bsWx(), day = bsDay(); bgPrepare();
    if (!bgReady) { bx.drawImage(bsImg[bsWhere === "kitchen" ? "bg_kitchen" : "bg_" + season()], 0, TEDGE - 34); rect(bx, 0, TEDGE - 1, 180, 1, "#5e3818"); return; }
    if (bsWhere === "kitchen") {
      skyFill(KWIN.x, 0, KWIN.w, KWIN.y + KWIN.h - KCROP, day, wx); skyLife(KWIN.x, 0, KWIN.w, KWIN.y + KWIN.h - KCROP, t, day, wx);
      bx.drawImage(bgCv, 0, 0); windowWeather(t, wx, KCROP);
    } else {
      skyFill(0, 0, 180, TEDGE, day, wx); skyLife(0, 0, 180, 10, t, day, wx);   // the sky runs all the way down: the lake picture is see-through behind the hills
      bx.drawImage(bgCv, 0, 0);
      if (day === "twilight") { var gl = .5 + .5 * Math.sin(t / 500); bx.globalAlpha = .35 + gl * .5; rect(bx, 141, 6, 3, 2, "#fff6c8"); bx.globalAlpha = .25 * gl; rect(bx, 139, 5, 7, 4, "#ffe9a0"); bx.globalAlpha = 1; }
      if (wx === "sun" || wx === "rainbow") for (var g = 0; g < 4; g++) if (Math.floor((t + g * 517) / 260) % 5 === 0) rect(bx, 60 + (g * 37) % 118, 20 + g % 3, 2, 1, "#ffffff");   // sun glints on the far water
    }
    rect(bx, 0, TEDGE - 1, 180, 1, "#5e3818");                               // the far edge of the table
  }
  // over everything, very quietly: the season drifting through and the light of the hour
  var ATM = [];
  function drawAtmos(t) {
    var se = season(), wx = bsWx(), day = bsDay();
    if (bsWhere === "kitchen") {
      var fl = .045 + .02 * Math.sin(t / 170) + .015 * Math.sin(t / 53); bx.globalAlpha = fl; rect(bx, 0, 0, 180, 135, "#ff9a3a");            // the hearth's flicker
      if (day === "night") { bx.globalAlpha = .1; rect(bx, 0, 0, 180, 135, "#1e2a54"); }
      if (wx === "storm" && Math.floor(t / 2300) % 3 === 0 && (t % 2300) < 110) { bx.globalAlpha = .12; rect(bx, 0, 0, 180, 135, "#ffffff"); }
      bx.globalAlpha = 1; return;
    }
    if (day === "twilight") { bx.globalAlpha = .08; rect(bx, 0, 0, 180, 135, "#ff8a4a"); bx.globalAlpha = 1; }
    if (wx === "clouds") { var cx = ((t / 60) % 320) - 100; bx.globalAlpha = .07; bx.fillStyle = "#1e2a40"; bx.beginPath(); bx.ellipse(cx, 80, 70, 34, 0, 0, Math.PI * 2); bx.fill(); bx.globalAlpha = 1; }   // a cloud's shadow slides over the table
    var kind = se === "autumn" ? "leaf" : se === "spring" ? "petal" : se === "winter" ? "flake" : "fly", N = kind === "fly" ? 2 : 5;
    if (ATM.length !== N || ATM.kind !== kind) { ATM = []; ATM.kind = kind; for (var i = 0; i < N; i++) ATM.push({ ph: Math.random() * 1000, sp: .6 + Math.random() * .6, y0: Math.random() * 60 }); }
    ATM.forEach(function (a, i) {
      var tt = t / 1000 * a.sp + a.ph, x, y;
      if (kind === "fly") { x = 30 + ((tt * 9) % 140); y = 8 + a.y0 * .3 + Math.sin(tt * 2.1) * 5; var up = Math.floor(t / 120 + i) % 2; rect(bx, x - 1, y - up, 1, 1, i ? "#fff6c8" : "#f4a3b4"); rect(bx, x + 1, y - up, 1, 1, i ? "#fff6c8" : "#f4a3b4"); rect(bx, x, y, 1, 1, "#3a2414"); return; }
      x = ((tt * 14) % 220) - 20; y = ((tt * (kind === "flake" ? 9 : 11) + a.y0) % 150) - 10; x += Math.sin(tt * 1.7) * 4;
      if (kind === "leaf") { var f = Math.floor(tt * 3) % 2; rect(bx, x, y, 2, 1, i % 2 ? "#c8582a" : "#e8a038"); rect(bx, x + (f ? 1 : 0), y + 1, 1, 1, i % 2 ? "#9a3a1a" : "#c87a28"); }
      else if (kind === "petal") rect(bx, x, y, 1 + (Math.floor(tt * 3) % 2), 1, i % 2 ? "#ffc0d0" : "#ffffff");
      else rect(bx, x, y, 1, 1, "#ffffff");
    });
  }
  function battleGame() {
    return new Promise(function (resolve) {
      var me = randomFleet(), fox = randomFleet(), shotsMe = {}, shotsFox = {}, phase = "setup", view = "mine", sink = null, splashes = [], aim = null, foxAim = null, drag = null, raf = 0, result = null;
      var foxQueue = [];
      bsWhere = bsAt || bsPlace(); bsEl.hidden = false; bsOpen = true; bsBanner("Schiffe aufstellen");
      function key(c, r) { return c + "," + r; }
      function draw(t) {
        bx.clearRect(0, 0, 180, 135); drawBackdrop(t); bx.drawImage(bsImg.board, 0, TEDGE, 180, 135 - TEDGE, 0, TEDGE, 180, 135 - TEDGE);
        // the fox sits behind the table: drawn first, so ships on the board always cover it
        var oi = bsImg["opp_" + bsWho], oo = BSOPP[bsWho];
        if (oi && oi.complete) { bx.save(); bx.beginPath(); bx.rect(0, 0, 180, TEDGE + 1); bx.clip(); bx.drawImage(oi, 6, oo.dy + (phase === "fox" ? Math.floor(t / 250) % 2 : 0)); bx.restore(); }
        [oo.cx - 13, oo.cx + 12].forEach(function (px) { rect(bx, px, 25, 7, 4, "#3a2414"); rect(bx, px + 1, 25, 5, 3, oo.paw[0]); rect(bx, px + 1, 27, 5, 1, oo.paw[1]); rect(bx, px + 2, 25, 1, 1, "#3a2414"); rect(bx, px + 4, 25, 1, 1, "#3a2414"); });
        var fleet = view === "mine" ? me : fox, shots = view === "mine" ? shotsFox : shotsMe;
        // ships: back to front; the fox's only once sunk (and then only while sinking)
        fleet.forEach(function (s_) { if (s_.gone) drawWreck(s_, t); });       // sunk ships lie on the bottom and shimmer through the water
        if (fleet.some(function (s_) { return s_.gone; })) bx.drawImage(bsImg.grid, 0, 0);
        // what lies on the water comes first: misses, the debris of sunk ships, the flotsam
        Object.keys(shots).forEach(function (k) {
          var q = k.split(","), c = +q[0], r = +q[1], s_ = shipAt(fleet, c, r), p = cellCenter(c, r, .55);
          if (shots[k] === "miss") splashMark(bx, p[0], p[1]);
          else if (s_ && s_.gone) { if ((c + r) % 2 === 0) debris(bx, p[0], p[1] - 2); }
        });
        drawFlots(t);
        // then everything that stands up, strictly from back to front: ships (the sinking one at its own place), and fires
        // (with their ship, or on their own where a hidden ship of the fox burns); the ship being dragged comes last
        var items = [], depth = function (s_) { return (s_.h ? s_.r : s_.r + s_.L - 1) * 4 + (s_.h ? 1 : 0); };
        fleet.forEach(function (s_) {
          if (s_.gone) return;
          if (sink && sink.ship === s_) { items.push({ d: depth(s_), f: function () { drawSink(t); } }); return; }
          var seen = view === "mine" || s_.reveal, dragged = drag && drag.ship === s_;
          items.push({ d: dragged ? 1e6 : depth(s_), f: function () {
            if (seen) { var sp = spriteOf(s_), lift = dragged ? -3 : 0; bx.drawImage(sp.img, sp.x, sp.y + lift); if (lift) twinkle(bx, sp.x - 2, sp.y + 2, t, 0); }
            cellsOf(s_).forEach(function (q) { var k = key(q[0], q[1]); if (shots[k] === "hit") { var p = cellCenter(q[0], q[1], .55); flame(bx, p[0], p[1] - (view === "mine" ? 4 : 0), t + q[0] * 37 + q[1] * 91); } });
          } });
        });
        items.sort(function (a2, b2) { return a2.d - b2.d; }).forEach(function (it) { it.f(); });
        splashes = splashes.filter(function (s_) { return t - s_.t0 < 600; });
        splashes.forEach(function (s_) { var k = (t - s_.t0) / 600, rr = 2 + k * 7; for (var a = 0; a < 16; a++) { var an = a / 16 * Math.PI * 2; bx.globalAlpha = 1 - k; rect(bx, s_.x + Math.cos(an) * rr, s_.y + Math.sin(an) * rr * .4, 1, 1, "#ffffff"); } bx.globalAlpha = 1; if (k < .4) { rect(bx, s_.x, s_.y - 3 - k * 10, 1, 2, "#e6f4fc"); rect(bx, s_.x - 2, s_.y - 2 - k * 6, 1, 1, "#e6f4fc"); rect(bx, s_.x + 2, s_.y - 2 - k * 6, 1, 1, "#e6f4fc"); } });
        if (aim && view === "theirs") quad(bx, aim[0], aim[1], "#f6c84a");
        if (foxAim && view === "mine") quad(bx, foxAim[0], foxAim[1], "#e8802a");
        if (phase === "setup") { twinkle(bx, 8, 8, t, 0); twinkle(bx, 52, 12, t, 300); twinkle(bx, 30, 3, t, 600); }
        drawAtmos(t);
      }
      // the wreck: the ship's own sprite, sunk a little deeper and tinted by the water, with a dark keel shadow and light glints dancing over it
      function drawWreck(s_, t) {
        var sp = spriteOf(s_);
        if (!s_.wreck) {
          var cv = document.createElement("canvas"); cv.width = sp.w; cv.height = sp.h; var c = cv.getContext("2d"); c.imageSmoothingEnabled = false;
          c.drawImage(sp.img, 0, 0); c.globalCompositeOperation = "source-atop";
          c.fillStyle = "rgba(40,84,120,.8)"; c.fillRect(0, 0, sp.w, sp.h);
          c.fillStyle = "rgba(20,40,64,.3)"; c.fillRect(0, Math.floor(sp.h * .6), sp.w, sp.h);
          c.globalCompositeOperation = "destination-in";                     // the higher parts fade out: they are deep under the surface
          var gr = c.createLinearGradient(0, 0, 0, sp.h); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(.45, "rgba(0,0,0,.55)"); gr.addColorStop(1, "rgba(0,0,0,.9)");
          c.fillStyle = gr; c.fillRect(0, 0, sp.w, sp.h);
          s_.wreck = cv;
        }
        // it lies on the bottom: lower down, and only where its own cells are (clipped to them)
        var cs = cellsOf(s_), c0 = cs[0], c1 = cs[cs.length - 1], q = [bsP(c0[0] / BN, c0[1] / BN), bsP((c1[0] + 1) / BN, c0[1] / BN), bsP((c1[0] + 1) / BN, (c1[1] + 1) / BN), bsP(c0[0] / BN, (c1[1] + 1) / BN)];
        bx.save(); bx.beginPath(); bx.moveTo(q[0][0], q[0][1]); for (var qi = 1; qi < 4; qi++) bx.lineTo(q[qi][0], q[qi][1]); bx.closePath(); bx.clip();
        bx.drawImage(s_.wreck, sp.x, sp.y + (s_.h ? 8 : 5));
        bx.restore();
        var ph = Math.floor(t / 260);
        for (var i = 0; i < 6; i++) {                                     // caustic glints wandering over the wreck
          var gx_ = sp.x + ((i * 37 + ph * 5) % Math.max(4, sp.w)), gy_ = sp.y + sp.h * .5 + ((i * 23 + ph * 3) % Math.max(4, Math.floor(sp.h * .5)));
          bx.globalAlpha = .35; rect(bx, gx_, gy_, 2, 1, "#c8e6f4"); bx.globalAlpha = 1;
        }
      }
      // ---- sinking: six ways to go down, portholes that flicker out, and a little flotsam afterwards ----
      // side view (horizontal ships, bow to the right): titanic break, bow first steep, stern first steep, capsizing, toppling funnels, boiler explosion.
      // bow-on view (vertical ships): dipping by bow, stern or middle, capsizing, boiler explosion.
      function sinkInfo(sp) {                                            // looks at the sprite once: where the portholes are, where the funnels stand
        var cv = document.createElement("canvas"); cv.width = sp.w; cv.height = sp.h; var c = cv.getContext("2d"); c.drawImage(sp.img, 0, 0);
        var d = c.getImageData(0, 0, sp.w, sp.h).data, A = function (x, y) { return d[(y * sp.w + x) * 4 + 3]; }, C = function (x, y) { var i = (y * sp.w + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
        var holes = [], fun = [];
        for (var y = 0; y < sp.h; y++) for (var x = 0; x < sp.w; x++) { if (!A(x, y)) continue; var q = C(x, y); if (q[0] > 240 && q[1] > 215 && q[1] < 245 && q[2] > 130 && q[2] < 185) holes.push(x, y); }
        if (sp.w > sp.h) {
          var run = [];
          for (var x2 = 0; x2 <= sp.w; x2++) {
            var on = x2 < sp.w && A(x2, 3) && A(x2, 2);
            if (on) run.push(x2); else { if (run.length >= 3) fun.push([run[0] - 1, run[run.length - 1] + 1]); run = []; }
          }
          fun = fun.map(function (f) {                                   // a funnel reaches down to where the white deckhouse begins
            var cx = Math.round((f[0] + f[1]) / 2), base = 8;
            for (var y2 = 4; y2 < sp.h - 4; y2++) { var q2 = C(cx, y2); if (A(cx, y2) && q2[0] > 238 && q2[1] > 236 && q2[2] > 226) { base = y2 - 1; break; } }
            return { x0: Math.max(0, f[0]), x1: Math.min(sp.w - 1, f[1]), base: base };
          });
        }
        var hull = document.createElement("canvas"); hull.width = sp.w; hull.height = sp.h; var hc = hull.getContext("2d"); hc.drawImage(sp.img, 0, 0);
        fun.forEach(function (f) { hc.clearRect(f.x0, 0, f.x1 - f.x0 + 1, f.base + 1); });
        var rows = [];                                                   // each row's left and right edge, for the hull flank of a ship heeling over
        for (var ry = 0; ry < sp.h; ry++) { var mn = -1, mx = -1; for (var rx = 0; rx < sp.w; rx++) if (A(rx, ry)) { if (mn < 0) mn = rx; mx = rx; } rows.push([mn, mx]); }
        return { holes: holes, fun: fun, hull: hull, rows: rows };
      }
      function pick2(list) { var tot = 0; list.forEach(function (o) { tot += o[1]; }); var r = Math.random() * tot; for (var i = 0; i < list.length; i++) { r -= list[i][1]; if (r <= 0) return list[i][0]; } return list[0][0]; }
      function ease(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
      var flots = [];
      function flotsam(ship) {                                           // crates, a deck chair, a suitcase, a lifebuoy, a barrel bob where she went down
        var cs = cellsOf(ship), n = 3 + Math.floor(Math.random() * 3), kinds = ["crate", "chair", "case", "buoy", "barrel"];
        for (var i = 0; i < n; i++) { var q = cs[Math.floor(Math.random() * cs.length)], p = cellCenter(q[0], q[1], .55); flots.push({ x: p[0] + (Math.random() - .5) * 8, y: p[1] + (Math.random() - .5) * 3, k: kinds[(i + Math.floor(Math.random() * 5)) % 5], t0: performance.now() + i * 180, vx: (Math.random() - .3) * 1.6, view: view }); }
      }
      function drawFlots(t) {
        flots = flots.filter(function (f) { return t - f.t0 < 6500; });
        flots.forEach(function (f) {
          if (f.view !== view || t < f.t0) return; var age = (t - f.t0) / 1000, x = Math.round(f.x + f.vx * age), y = Math.round(f.y + Math.sin(age * 2.4 + f.x) * .8);
          bx.globalAlpha = Math.min(1, age * 3, (6.5 - age) / 1.2);
          if (f.k === "crate") { rect(bx, x - 3, y - 2, 6, 4, "#3a2414"); rect(bx, x - 2, y - 1, 4, 2, "#c08a50"); rect(bx, x - 2, y - 1, 4, 1, "#d8a868"); }
          else if (f.k === "chair") { rect(bx, x - 3, y - 1, 7, 3, "#3a2414"); rect(bx, x - 2, y, 5, 1, "#e8554a"); rect(bx, x - 1, y, 1, 1, "#fff6e4"); rect(bx, x + 1, y, 1, 1, "#fff6e4"); }
          else if (f.k === "case") { rect(bx, x - 2, y - 2, 5, 4, "#3a2414"); rect(bx, x - 1, y - 1, 3, 2, "#a87444"); rect(bx, x, y - 3, 1, 1, "#3a2414"); }
          else if (f.k === "buoy") { rect(bx, x - 2, y - 2, 5, 4, "#3a2414"); rect(bx, x - 1, y - 1, 3, 2, "#fff6e4"); rect(bx, x - 1, y - 1, 1, 1, "#e8402a"); rect(bx, x + 1, y, 1, 1, "#e8402a"); rect(bx, x, y - 1, 1, 1, "#5a9ac0"); }
          else { rect(bx, x - 2, y - 2, 4, 4, "#3a2414"); rect(bx, x - 1, y - 1, 2, 2, "#8a5a30"); }
          if (Math.floor(t / 400 + f.x) % 3 === 0) rect(bx, x - 4, y + 2, 2, 1, "#e6f4fc");
          bx.globalAlpha = 1;
        });
      }
      function drawSink(t) {
        var s_ = sink.ship, sp = spriteOf(s_), K = sink.kind, p = Math.min(1, (t - sink.t0) / sink.dur), e = ease(p);
        if (!sink.info) sink.info = sinkInfo(sp);
        var I = sink.info;
        ox_.clearRect(0, 0, 180, 135);
        var WL, img = sp.img;
        // the portholes: lit, then flickering, then dark
        var lit = p < .25 ? 1 : p < .6 ? ((Math.floor(t / 70) * 7919) % 5 > 1 ? 1 : 0) : 0;
        var src = sink.lc || (sink.lc = (function () { var cv = document.createElement("canvas"); cv.width = sp.w; cv.height = sp.h; return cv; })()), sc = src.getContext("2d");
        sc.clearRect(0, 0, sp.w, sp.h); sc.drawImage(K === "funnels" || K === "boom" ? I.hull : img, 0, 0);
        if (!lit) { sc.fillStyle = "#2e2a36"; for (var hi = 0; hi < I.holes.length; hi += 2) sc.fillRect(I.holes[hi], I.holes[hi + 1], 1, 1); }
        img = src;
        if (s_.h) {
          WL = sp.y + sp.h - 2; var pivY = sp.h - 2;
          var piece = function (sx, sw, pivX, a, dx, dy, extra) {
            ox_.save(); ox_.translate(Math.round(sp.x + pivX + (dx || 0)), Math.round(sp.y + pivY + (dy || 0))); ox_.rotate(a);
            ox_.drawImage(img, sx, 0, sw, sp.h, -(pivX - sx), -pivY, sw, sp.h); if (extra) extra(pivX); ox_.restore();
          };
          var prop = function (x0) { return function (pivX) { var f = Math.floor(t / 90) % 2; rect(ox_, x0 - pivX, -2 - f, 1, 3, "#c89a3a"); rect(ox_, x0 - pivX - 1, -1, 3, 1, f ? "#c89a3a" : "#8a6a20"); }; };
          if (K === "titanic") {
            // in one piece she settles by the bow; slowly the hull cracks in the middle and opens, the bow slips away,
            // the stern sinks back a little, then rises almost upright, stands, and slides slowly under with lots of bubbles
            var m = Math.round(sp.w * sink.f), deg = Math.PI / 180, sm = function (a0, a1) { return ease((p - a0) / (a1 - a0)); };
            var a0 = 10 * sm(0, .35);
            if (p < .35) piece(0, sp.w, m, a0 * deg, 0, 4 * sm(0, .35));
            else {
              var gap = 2 * sm(.35, .55);
              var aBow = (10 + 38 * sm(.38, .72)) * deg, dBow = 4 + 38 * Math.pow(Math.max(0, Math.min(1, (p - .42) / .4)), 1.5);
              var aSt = (10 - 6 * sm(.35, .5) + 61 * sm(.47, .74)) * deg, slide = Math.pow(Math.max(0, Math.min(1, (p - .78) / .22)), 1.6);
              var dSt = 4 + 3 * sm(.47, .74) + 42 * slide;
              piece(m, sp.w - m, m, aBow, Math.round(gap), dBow);
              piece(0, m, m, aSt, -Math.round(gap), dSt, prop(3));
              if (p > .38 && p < .58) for (var dr = 0; dr < 2; dr++) rect(ox_, sp.x + m - 2 + Math.random() * 4, WL - 1 - Math.random() * 5, 1, 1, "#2e2a36");   // bits falling from the crack
              if (p > .76) for (var bb = 0; bb < 4 + Math.floor(slide * 8); bb++) { var bxx = sp.x + m - 10 + Math.random() * 14, byy = WL - Math.random() * 3 - slide * 3; rect(bx, bxx, byy, 1 + (bb % 2), 1 + (bb % 2), Math.random() < .5 ? "#ffffff" : "#d8eef8"); }   // and the bubbles
            }
          } else if (K === "bow" || K === "stern") {
            var dir = K === "bow" ? 1 : -1, ang = (26 * ease(p / .65)) * Math.PI / 180, sd = 3 + 9 * ease(p / .65) + 26 * ease((p - .62) / .38);
            piece(0, sp.w, sp.w * (K === "bow" ? .62 : .38), dir * ang, 0, sd, K === "bow" ? prop(3) : null);
          } else if (K === "capsize") {
            // she rolls over onto her back: the hull flattens, flips, shows the red keel, then the upturned hull sinks
            var rq = ease(p / .5), cy = Math.cos(rq * Math.PI), sd2 = 4 * rq + 24 * ease((p - .55) / .45);
            var pr = sp.h - 7; ox_.save(); ox_.translate(Math.round(sp.x), Math.round(sp.y + pr + sd2)); ox_.scale(1, Math.abs(cy) < .05 ? (cy < 0 ? -.05 : .05) : cy); ox_.drawImage(img, 0, -pr); ox_.restore();   // rolls about the middle of the hull: upside down the black hull and red keel stick out
          } else if (K === "funnels") {
            // a slow list and settling, the funnels toppling one after another towards the stern
            var la = 7 * ease(p / .3) * Math.PI / 180, sd3 = 3 * ease(p / .3) + 32 * Math.pow(Math.max(0, Math.min(1, (p - .35) / .65)), 1.4), pv = sp.w * .5;
            piece(0, sp.w, pv, la, 0, sd3, function (pivX) {
              I.fun.forEach(function (f, i) {
                var st = .42 + i * .09, fa = ease((p - st) / .13), fw = f.x1 - f.x0 + 1, fh = f.base + 1, left = (sink.fdir[i] || 1) < 0, byp = fh - pivY;
                ox_.save(); ox_.translate((left ? f.x0 : f.x1 + 1) - pivX, byp); ox_.rotate((left ? -1 : 1) * fa * Math.PI / 2); ox_.drawImage(sp.img, f.x0, 0, fw, fh, left ? 0 : -fw, -fh, fw, fh); ox_.restore();
                if (fa >= 1 && !f.hiss) { f.hiss = 1; beep([[90, .08]]); }
              });
            });
          } else {
            // the boiler blows: a flash, a steam cloud, a funnel sails off, then she goes down fast
            var sd4 = 2 * ease(p / .3) + 34 * ease((p - .5) / .5), aa = 10 * ease((p - .2) / .5) * Math.PI / 180;
            piece(0, sp.w, sp.w * .5, aa, 0, sd4, function (pivX) {
              I.fun.forEach(function (f, i) { if (i === sink.flyer) return; ox_.drawImage(sp.img, f.x0, 0, f.x1 - f.x0 + 1, f.base + 1, f.x0 - pivX, -pivY, f.x1 - f.x0 + 1, f.base + 1); });
            });
          }
        } else {
          WL = sp.y + sp.h;
          if (K === "list") {
            // seen from the bow or the stern: she heels over to one side, the hull shows on the high side, then she settles and fades under
            var roll = 62 * ease(p / .55) * Math.PI / 180, side = sink.side, sx = Math.cos(roll), shift = Math.sin(roll) * 3 * side, sink2 = 6 * Math.pow(Math.max(0, (p - .5) / .5), 1.3);
            for (var y = 0; y < sp.h; y++) {
              var rw = Math.max(2, Math.round(sp.w * sx)), x0 = Math.round(sp.x + (sp.w - rw) / 2 + shift + side * (1 - sx) * sp.w * .25);
              ox_.drawImage(img, 0, y, sp.w, 1, x0, Math.round(sp.y + y + sink2), rw, 1);
              var R = I.rows[y]; if (R[0] < 0) continue;
              var rl = x0 + Math.round(R[0] * rw / sp.w), rr = x0 + Math.round((R[1] + 1) * rw / sp.w), hw = Math.round((R[1] - R[0] + 1) * Math.sin(roll) * .5), yy = Math.round(sp.y + y + sink2);
              if (hw > 0) {                                                  // the hull's flank on the high side: black, a porthole now and then, the red keel at its edge, an outline
                var fx = side > 0 ? rl - hw : rr;
                rect(ox_, fx, yy, hw, 1, "#2e2a36"); if (y % 4 === 1 && lit && hw > 3) rect(ox_, fx + (hw >> 1), yy, 1, 1, "#ffe9a0");
                rect(ox_, side > 0 ? fx : fx + hw - 1, yy, 1, 1, hw > 2 ? "#a8362a" : "#2e2a36"); rect(ox_, side > 0 ? fx - 1 : fx + hw, yy, 1, 1, "#24160c");
              }
            }
            var wet = Math.max(0, (p - .45) / .55);
            if (wet > 0) { ox_.globalCompositeOperation = "source-atop"; ox_.fillStyle = "rgba(90,154,192," + Math.min(.9, wet * 1.2) + ")"; ox_.fillRect(sp.x - sp.w, sp.y - 2, sp.w * 3, sp.h + 14); ox_.globalCompositeOperation = "source-over"; }
            if (p > .94) ox_.clearRect(sp.x - sp.w, sp.y - 4, sp.w * 3, sp.h + 20);
          } else {
            var vk = K === "boom" ? "mid" : K, lift = 6 * e, lev = 1.2 * e;
            for (var y = 0; y < sp.h; y++) {
              var tt = y / sp.h, ny = y, under = false, deep = false;
              if (vk === "bow") { ny = y - lift * (1 - tt) + lift * .4 * tt; under = tt > 1 - lev; deep = tt > 1 - lev + .12; }
              else if (vk === "stern") { ny = y + lift * .4 * (1 - tt) - lift * tt; under = tt < lev; deep = tt < lev - .12; }
              else { var d = Math.abs(tt - sink.f) * 2; ny = y - lift * d + (tt > sink.f ? lift * .5 : -lift * .2); under = d < lev; deep = d < lev - .15; }
              if (deep || p >= 1) continue;
              ox_.drawImage(img, 0, y, sp.w, 1, sp.x, Math.round(sp.y + ny), sp.w, 1);
              if (under) { ox_.globalCompositeOperation = "source-atop"; ox_.fillStyle = "rgba(90,154,192,.7)"; ox_.fillRect(sp.x, Math.round(sp.y + ny), sp.w, 1); ox_.globalCompositeOperation = "source-over"; }
            }
          }
        }
        if (s_.h) { ox_.globalCompositeOperation = "source-atop"; ox_.fillStyle = "rgba(90,154,192,.7)"; ox_.fillRect(0, WL + 1, 180, 135); ox_.globalCompositeOperation = "source-over"; ox_.clearRect(0, WL + 3, 180, 135); }
        bx.drawImage(bsOff, 0, 0);
        if (K === "boom") {                                              // flash, steam cloud and the flying funnel
          var cx3 = sp.x + sp.w / 2, cy3 = s_.h ? sp.y + 6 : sp.y + sp.h / 2;
          if (p < .12) { bx.globalAlpha = (1 - p / .12) * .8; rect(bx, 0, 0, 180, 135, "#fff8e0"); bx.globalAlpha = 1; }
          if (!sink.boomed) { sink.boomed = 1; beep([[70, .3], [55, .4]]); }
          var cr = 4 + 18 * ease(p / .4);
          for (var k = 0; k < 9; k++) { var an = k / 9 * Math.PI * 2 + p, rr = cr * (.6 + (k % 3) * .2); bx.globalAlpha = Math.max(0, .6 - p * .9); rect(bx, cx3 + Math.cos(an) * rr * .9 - 3, cy3 - 4 + Math.sin(an) * rr * .5 - 3 * ease(p / .5) * 4, 7, 5, k % 2 ? "#f4f2ee" : "#c8ccd4"); }
          bx.globalAlpha = 1;
          var fl = I.fun[sink.flyer];
          if (s_.h && fl && p < .7) {
            var fw = fl.x1 - fl.x0 + 1, fh = fl.base + 1, fx_ = sp.x + fl.x0 + p * 40, fy_ = sp.y - 60 * p + 95 * p * p;
            bx.save(); bx.translate(Math.round(fx_ + fw / 2), Math.round(fy_ + fh / 2)); bx.rotate(p * 9); bx.drawImage(sp.img, fl.x0, 0, fw, fh, -fw / 2, -fh / 2, fw, fh); bx.restore();
          }
        }
        if (p < (K === "boom" ? .6 : .55)) { var fc = cellCenter(sink.last[0], sink.last[1], .55); flame(bx, fc[0], fc[1] - (s_.h ? 6 : 2) + e * 8, t); }
        for (var i = 0; i < 4 + Math.floor(p * 10); i++) { var bxp = sp.x + Math.random() * sp.w, byp = (s_.h ? WL : sp.y + sp.h * (K === "stern" ? .2 : K === "bow" ? .8 : sink.f)) + Math.random() * 3; rect(bx, bxp, byp, 1, 1, Math.random() < .4 ? "#ffffff" : "#e6f4fc"); }
        if (p >= 1) { s_.gone = true; flotsam(s_); var done = sink.done; sink = null; done(); }
      }
      (function lp(t) { if (!bsOpen) return; draw(t); raf = requestAnimationFrame(lp); })(performance.now());
      function startSink(ship, last, done) {
        var cs = cellsOf(ship), idx = cs.findIndex(function (q) { return q[0] === last[0] && q[1] === last[1]; });
        var end = idx === cs.length - 1 ? "bow" : idx === 0 ? "stern" : "mid", kind;
        if (ship.h) {
          var sp = spriteOf(ship), info = sinkInfo(sp);
          kind = pick2([["titanic", ship.L >= 3 ? (end === "mid" ? 5 : 3) : 0], ["bow", end === "bow" ? 3 : 2], ["stern", end === "stern" ? 3 : 2], ["capsize", 2], ["funnels", info.fun.length ? 2 : 0], ["boom", info.fun.length ? 1 : 0]]);
        } else kind = pick2([[end, 4], ["list", 3], ["boom", 1]]);
        if (window.__bsKind) kind = window.__bsKind;
        ship.reveal = true; beep([[180, .12], [140, .14], [110, .2]]);
        var f = kind === "titanic" && end !== "mid" ? (Math.floor(ship.L / 2) + .5) / ship.L : (idx + .5) / ship.L;
        sink = { ship: ship, kind: kind, f: f, last: last, t0: performance.now(), done: done, dur: { titanic: 7000, funnels: 4600, boom: 3600, capsize: 3400, list: 3600 }[kind] || 3200, side: Math.random() < .5 ? -1 : 1 };
        sink.fdir = [0, 1, 2, 3, 4].map(function (i) { return Math.random() < .5 ? -1 : 1; }); if (sink.fdir[0] === sink.fdir[1]) sink.fdir[1] = -sink.fdir[0];
        if (kind === "boom") { var inf = ship.h ? sinkInfo(spriteOf(ship)) : { fun: [] }; sink.flyer = inf.fun.length ? Math.floor(Math.random() * inf.fun.length) : -1; }
      }
      function allSunk(fl) { return fl.every(function (s_) { return s_.sunk; }); }
      function shoot(fleet, shots, c, r, done) {
        var k = key(c, r), s_ = shipAt(fleet, c, r), p = cellCenter(c, r, .55); splashes.push({ x: Math.round(p[0]), y: Math.round(p[1]), t0: performance.now() });
        if (!s_) { shots[k] = "miss"; beep([[260, .05], [200, .06]]); setTimeout(function () { done(false); }, 700); return; }
        shots[k] = "hit"; s_.hits[k] = true; beep([[150, .08], [520, .04]]);
        if (Object.keys(s_.hits).length === s_.L) { s_.sunk = true; setTimeout(function () { startSink(s_, [c, r], function () { done(true); }); }, 450); }
        else setTimeout(function () { done(true); }, 700);
      }
      function myTurn() { if (!bsOpen) return; phase = "me"; view = "theirs"; foxAim = null; bsBanner("Dein Zug"); }
      function foxTurn() {
        if (!bsOpen) return; phase = "fox"; view = "mine"; aim = null; bsBanner(oDer() + " zielt");
        var target = foxPick(), steps = 0, wander = setInterval(function () {
          if (!bsOpen) { clearInterval(wander); return; }
          steps++; foxAim = steps < 4 ? [Math.floor(Math.random() * BN), Math.floor(Math.random() * BN)] : target;
          if (steps >= 5) { clearInterval(wander); setTimeout(function () { foxAim = null; shoot(me, shotsFox, target[0], target[1], function (hit) { if (hit) foxLearn(target); if (allSunk(me)) return finish(false); setTimeout(myTurn, 500); }); }, 250); }
        }, 260);
      }
      function foxLearn(t) { var s_ = shipAt(me, t[0], t[1]); if (s_ && s_.sunk) { foxQueue = []; return; } [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var c = t[0] + d[0], r = t[1] + d[1]; if (c >= 0 && r >= 0 && c < BN && r < BN && !shotsFox[key(c, r)]) foxQueue.unshift([c, r]); }); }
      function foxPick() {
        while (foxQueue.length) { var q = foxQueue.shift(); if (!shotsFox[key(q[0], q[1])]) return q; }
        var free = []; for (var c = 0; c < BN; c++) for (var r = 0; r < BN; r++) if (!shotsFox[key(c, r)] && (c + r) % 2 === 0) free.push([c, r]);
        if (!free.length) for (var c2 = 0; c2 < BN; c2++) for (var r2 = 0; r2 < BN; r2++) if (!shotsFox[key(c2, r2)]) free.push([c2, r2]);
        return free[Math.floor(Math.random() * free.length)];
      }
      function finish(won) {
        phase = "end"; result = won; bsBanner(won ? "Gewonnen!" : oDer() + " gewinnt");
        if (won) fox.forEach(function (s_) { s_.reveal = true; }); else me.forEach(function (s_) { s_.reveal = true; });
        beep(won ? [[660, .08], [880, .08], [990, .14]] : [[300, .1], [220, .14]]);
        if (won) setTimeout(function () { end(won); }, 2600);
        else setTimeout(function () {                                       // lost: once, the fox shows where his ships were; a tap goes on
          if (!bsOpen) return; phase = "reveal"; view = "theirs"; aim = null; foxAim = null; fox.forEach(function (s_) { s_.reveal = true; });
          bsBanner("Hier lagen die Schiffe " + oVom()); beep([[520, .05], [440, .06]]);
        }, 2200);
      }
      bsCv.onpointerdown = function (ev) {
        ev.preventDefault(); var pt = bsPt(ev);
        if (phase === "reveal") { end(false); return; }
        if (phase === "setup") {
          if (pt[1] < 30 && pt[0] < 60) { phase = "start"; bsBanner("Los geht's!"); beep([[520, .05], [780, .08]]); setTimeout(myTurn, 700); return; }
          var cell = bsCellAt(pt[0], pt[1]); if (!cell) return; var s_ = shipAt(me, cell[0], cell[1]); if (!s_) return;
          drag = { ship: s_, dc: cell[0] - s_.c, dr: cell[1] - s_.r, moved: false, start: cell };
          try { bsCv.setPointerCapture(ev.pointerId); } catch (x) {}
          return;
        }
        if (phase === "me") {
          var c2 = bsCellAt(pt[0], pt[1]); if (!c2 || shotsMe[key(c2[0], c2[1])]) return;
          phase = "shooting"; aim = c2;
          shoot(fox, shotsMe, c2[0], c2[1], function (hit) { if (allSunk(fox)) return finish(true); setTimeout(foxTurn, hit ? 400 : 300); });
        }
      };
      bsCv.onpointermove = function (ev) {
        if (!drag) return; var pt = bsPt(ev), cell = bsCellAt(pt[0], pt[1]); if (!cell) return;
        if (cell[0] !== drag.start[0] || cell[1] !== drag.start[1]) drag.moved = true;
        var cand = { L: drag.ship.L, h: drag.ship.h, c: cell[0] - drag.dc, r: cell[1] - drag.dr };
        if (fits(me, cand, drag.ship)) { drag.ship.c = cand.c; drag.ship.r = cand.r; }
      };
      bsCv.onpointerup = function () {
        if (!drag) return; var s_ = drag.ship;
        if (!drag.moved) { var rot = { L: s_.L, h: !s_.h, c: s_.c, r: s_.r }; if (fits(me, rot, s_)) { s_.h = rot.h; beep([[440, .04]]); } else beep([[200, .05]]); }
        drag = null;
      };
      function end(won) {
        if (!bsOpen) return; bsOpen = false; cancelAnimationFrame(raf); bsCv.onpointerdown = bsCv.onpointermove = bsCv.onpointerup = null; bsEl.hidden = true; bsAbort = null;
        resolve({ won: won === true, played: phase === "end" || phase === "reveal", perfect: won === true && !me.some(function (s_) { return s_.sunk; }) });
      }
      bsEl.querySelector(".bs-x").onclick = function () { end(false); };
      bsAbort = function () { end(false); };
      window.__bs.state = function () { return { phase: phase, view: view, me: me, fox: fox, shotsMe: shotsMe, shotsFox: shotsFox }; };
      window.__bs.sinkTest = function (h, kind) {                      // test helper: sink one of my ships with a chosen animation
        var s_ = me.filter(function (q) { return !q.sunk && !!q.h === !!h; }).sort(function (a2, b2) { return b2.L - a2.L; })[0]; if (!s_) return null;
        var cs = cellsOf(s_); cs.forEach(function (q) { var k = key(q[0], q[1]); shotsFox[k] = "hit"; s_.hits[k] = true; }); s_.sunk = true; phase = "fox"; view = "mine";
        window.__bsKind = kind; startSink(s_, cs[Math.floor(cs.length / 2)], function () { window.__bsKind = null; }); var sp = spriteOf(s_); return { L: s_.L, h: s_.h, x: sp.x, y: sp.y, w: sp.w, hh: sp.h };
      };
      window.__bs.lose = function () { me.forEach(function (s_) { s_.sunk = true; }); finish(false); };
    });
  }
  window.__bs = { open: function () { return battleGame(); }, state: function () { return { phase: "closed" }; } };
  // rewards: a heart for playing together; for a win the animal's own present and something you do not have,
  // a ship in a bottle for the shelf (one per funnel colour), a captain's hat after five wins, honey for a perfect game
  var BOTTLES = ["white", "red", "orange", "yellow"], BNAME = { white: "weißen", red: "roten", orange: "orangen", yellow: "gelben" };
  async function battleSeq(who) {
    who = who || bsPick(); bsWho = who;
    say(N() + " spielt Schiffe versenken gegen " + oDen() + ".");
    var r = await battleGame(), L = life();
    L.bs = L.bs || { wins: 0, games: 0, bottles: [], hat: false };
    if (!r.played) { say("Schiffe versenken abgebrochen."); return; }
    L.bs.games++;
    if (typeof addHeart === "function") addHeart(who, true);
    if (r.won) {
      L.bs.wins++;
      if (typeof giveFriendGift === "function") giveFriendGift(who);
      if (typeof returnGift === "function") setTimeout(function () { returnGift(oDer(who)); }, 600);
      var next = BOTTLES.filter(function (b) { return L.bs.bottles.indexOf(b) < 0; })[0];
      if (next) { L.bs.bottles.push(next); if (typeof itemPop === "function") itemPop({ art: BS.bottles[next], title: "Ein Buddelschiff mit " + BNAME[next] + " Schornsteinen fürs Regal!" }); }
      if (L.bs.wins >= 5 && !L.bs.hat) { L.bs.hat = true; if (typeof itemPop === "function") itemPop({ art: '<svg viewBox="0 0 20 14" aria-hidden="true" shape-rendering="crispEdges"><path fill="#3a2414" d="M3 1h14v1h1v4h1v3h-1v2H2V9H1V6h1V2h1z"/><path fill="#f6f2ea" d="M4 2h12v4H4z"/><path fill="#ffffff" d="M4 2h12v1H4z"/><path fill="#2e2a46" d="M2 6h16v3H2z"/><path fill="#4a4670" d="M2 6h16v1H2z"/><path fill="#1e1a30" d="M3 9h14v1H3z"/><path fill="#e8c060" d="M9 3h2v2H9zM3 8h14v1H3z"/></svg>', title: "Fünf Siege: Du bekommst eine Kapitänsmütze!" }); }
      if (r.perfect) { garden.harvest.honey = (garden.harvest.honey || 0) + 1; renderFoods(); if (typeof itemPop === "function") itemPop({ art: svgOf(A.honey_s, SZ.honey_s[0], SZ.honey_s[1]), title: "Kein Schiff verloren: ein Glas Honig extra!" }); }
    } else say(oDer(who) + " hat gewonnen. Ihr hattet trotzdem Spaß zusammen.");
    if (typeof SudokuSave === "function") SudokuSave();
  }
  var _bs_interrupt = interrupt;
  interrupt = function () { if (bsOpen && bsAbort) bsAbort(); return _bs_interrupt.apply(this, arguments); };
  // ---------- starting the game: the game box on the kitchen windowsill ----------
  Object.keys(BS.props).forEach(function (k) { A[k] = BS.props[k].svg; SZ[k] = [BS.props[k].w, BS.props[k].h]; FOOD[k] = k; });
  function propEl(parent, k, x, y, cls) { var e = document.createElement("div"); e.className = "bs-prop " + (cls || ""); e.style.left = gx(x); e.style.top = gy(y); e.style.width = gx(SZ[k][0]); e.innerHTML = svgOf(A[k], SZ[k][0], SZ[k][1]); parent.appendChild(e); return e; }
  var bsBox = document.createElement("button"); bsBox.type = "button"; bsBox.className = "bs-prop bs-boxbtn"; bsBox.setAttribute("aria-label", "Schiffe versenken");
  bsBox.style.left = gx(150); bsBox.style.top = gy(46); bsBox.style.width = gx(SZ.bs_box[0]); bsBox.innerHTML = svgOf(A.bs_box, SZ.bs_box[0], SZ.bs_box[1]);
  kitchenEl.appendChild(bsBox);
  function foxGuest(parent, x, y, who) {                                  // the opponent walks in and waits beside the table
    var an = ALLANI[who || "fox"] || ALLANI.fox, vb = an.vb.split(" ").map(Number), h = 34, w = vb[2] * h / vb[3];
    var e = document.createElement("div"); e.className = "bs-guest va"; e.style.width = gx(w); e.style.bottom = gb(y); e.style.left = gx(x - w / 2);
    e.innerHTML = vaSvg(an, who || "fox"); parent.appendChild(e);
    e.walk = function (tx, ms) { e.style.transition = "left " + ms + "ms linear"; e.classList.add("walking"); e.style.left = gx(tx - w / 2); setTimeout(function () { e.classList.remove("walking"); }, ms); };
    return e;
  }
  var bsActive = false;                                                  // no visitors may drop in while the game is being set up or played
  var _bs_sv = spawnVisitor; spawnVisitor = function () { if (bsActive || bsOpen) return; return _bs_sv.apply(this, arguments); };
  var _bs_spv = spawnPondVisitor; spawnPondVisitor = function () { if (bsActive || bsOpen) return; return _bs_spv.apply(this, arguments); };
  bsBox.addEventListener("click", function (e) {
    e.stopPropagation(); if (bsOpen || s.asleep || decor) return;
    if (busy && !interruptible()) return; if (busy) interrupt();
    act("bsgame", async function () {
      bsAt = "kitchen";
      // he stays in front of the table: the box hops down from the windowsill into his paws
      await walkTo(108, 121); H.dir = 1; front({ paws: "up", eyes: "happy", mouth: "grin" }); pulse("hop", 300); await wait(250);
      bsBox.style.transition = "left .45s steps(5), top .45s steps(5)"; bsBox.style.left = gx(104); bsBox.style.top = gy(98); beep([[660, .04], [520, .05]]); await wait(470);
      bsBox.hidden = true; bsBox.style.transition = ""; bsBox.style.left = gx(150); bsBox.style.top = gy(46);
      front({ hold: "bs_box", holdScale: 1, paws: "hold", eyes: "happy", mouth: "smile" }); pulse("hop", 300);
      var guest = null, extra = [], kt = document.getElementById("k-table"), cleared = false;
      bsActive = true;
      try {
        {
          beep([[200, .05], [0, .08], [200, .05]]); var who = bsPick(); say("Es klopft. " + oDer() + " kommt zum Spielen!");
          guest = foxGuest(kitchenEl, -20, 122, who); guest.walk(74, 2000);
          await walkTo(KSPOT.table.x, KSPOT.table.y); front({ hold: "bs_box", paws: "hold" });
          // clear the table: the board, the candle, the pie and any dishes go over to the counter
          var kbg = kitchenEl.querySelector(".k-bg");
          kbg.innerHTML = svgOf(kLayers(home.kitchen).map(function (x) { return x === "k_front" ? A.k_front_clear : A[x]; }).join(""), 180, 135);
          var tbl = propEl(kitchenEl, "k_tbl", 0, 0, "bs-tbl"); extra.push(tbl); cleared = true;
          front({ hold: null, paws: "up", eyes: "wide" }); await wait(300);
          front({ hold: "carry_bowl", holdScale: 2, paws: "hold", eyes: "happy" }); tbl.classList.add("bs-gone"); if (kt) kt.classList.add("bs-clear");
          say(N() + " räumt den Tisch ab."); pulse("hop", 300); await wait(450);
          await walkTo(KSPOT.board.x - 30, KSPOT.board.y); front({ hold: null, paws: "up" }); beep([[520, .04], [660, .05]]); pulse("hop", 300); await wait(350);
          await walkTo(124, KSPOT.table.y);
          front({ hold: null, paws: "up", eyes: "happy" });
          extra.push(propEl(kitchenEl, "bs_box_open", 142, 81, "bs-open")); fx("spark", 148, 81, "sparkle"); fx("spark", 154, 85, "sparkle"); front({ eyes: "happy", mouth: "grin", paws: "up" });
          say("Das Brett klappt auf. Los geht's!"); await wait(1200);
        }
        await battleSeq(who);
      } finally {
        bsActive = false; bsAt = null;
        extra.forEach(function (x) { x.remove(); }); if (kt) kt.classList.remove("bs-clear"); if (cleared) renderKitchenArt();
        if (guest) { guest.walk(-30, 1600); setTimeout(function () { guest.remove(); }, 1700); }
        bsBox.hidden = false; bsWhereNow(); front({ hold: null, paws: "down" });
      }
    });
  });

  // ---- by the lake: in fine weather the box waits on a little picnic table on the bank; tap it and the fox comes over ----
  var shoreTbl = document.createElement("button"); shoreTbl.type = "button"; shoreTbl.className = "bs-prop bs-boxbtn bs-shore"; shoreTbl.setAttribute("aria-label", "Schiffe versenken");
  shoreTbl.style.left = gx(42); shoreTbl.style.top = gy(115); shoreTbl.style.width = gx(36);
  shoreTbl.innerHTML = '<span class="bs-sh-t">' + svgOf(A.bs_picnic, 36, 16) + '</span><span class="bs-sh-b">' + svgOf(A.bs_box, 16, 10) + '</span>';
  scene.appendChild(shoreTbl);                                           // in the scene itself, so it can stand in front of the hamster or behind him
  setInterval(function () {
    var here = place2 === "pond"; shoreTbl.classList.toggle("bs-away", !here);
    if (here) shoreTbl.style.zIndex = H.y < 129 ? 6 : 3;               // its legs stand at y 131: whoever is further back is drawn behind it
  }, 80);
  shoreTbl.addEventListener("click", function (e) {
    e.stopPropagation(); if (bsOpen || s.asleep || decor || bsActive) return;
    if (busy && !interruptible()) return; if (busy) interrupt();
    act("bsgame", async function () {
      bsAt = "shore"; var guest = null; bsActive = true; var bxEl = shoreTbl.querySelector(".bs-sh-b");
      try {
        await walkTo(26, 125); H.dir = 1; front({ paws: "up", eyes: "happy", mouth: "grin" }); pulse("hop", 300);
        bxEl.innerHTML = svgOf(A.bs_box_open, 16, 10); fx("spark", 56, 113, "sparkle"); fx("spark", 68, 115, "sparkle"); beep([[660, .05], [880, .06]]);
        var who = bsPick(); say(N() + " klappt das Spiel auf. Da kommt schon " + oDer().replace(/^D/, "d") + "!");
        guest = foxGuest(pondEl, -20, 112, who); guest.style.zIndex = 2; guest.walk(64, 2600); await wait(900);   // he sits down behind the table
        front({ paws: "side_r", eyes: "happy", mouth: "grin", blush: true }); await wait(1800);
        say(capOn() ? "Ahoi, " + BSOPP[who].n + "! Kapitän " + N() + " ist bereit." : oDer() + " setzt sich dazu. Los geht's!"); await wait(1300);
        await battleSeq(who);
      } finally {
        bsActive = false; bsAt = null; bxEl.innerHTML = svgOf(A.bs_box, 16, 10);
        if (guest) { guest.walk(-30, 2200); setTimeout(function () { guest.remove(); }, 2300); }
        front({ hold: null, paws: "down" });
      }
    });
  });

  // ---- the trophies: bottle ships on a shelf above the kitchen table, the captain's cap on a hook beside the window ----
  function bsL() { var L = life(); L.bs = L.bs || { wins: 0, games: 0, bottles: [], hat: false }; return L.bs; }
  function capOn() { var L = bsL(); return !!(L.hat && L.wear); }
  var bsShelf = propEl(kitchenEl, "bs_shelf", 117, 76, "bs-shelf"), botEls = {};
  BOTTLES.forEach(function (k, i) {
    var el = document.createElement("button"); el.type = "button"; el.className = "bs-prop bs-boxbtn bs-bot"; el.setAttribute("aria-label", "Buddelschiff");
    el.style.left = gx(118 + i * 15); el.style.top = gy(66); el.style.width = gx(16); el.innerHTML = svgOf(A["bs_bot_" + k], 16, 11); kitchenEl.appendChild(el); botEls[k] = el;
    el.addEventListener("click", function (e) {
      e.stopPropagation(); if (s.asleep || decor || bsOpen) return; if (busy && !interruptible()) return; if (busy) interrupt();
      act("bottle", async function () {
        await walkTo(Math.max(112, 120 + i * 15), 121); front({ eyes: "wide", mouth: "open", paws: "up", ears: "up" }); el.classList.add("bs-wob");
        fx("spark", 124 + i * 15, 62, "sparkle"); beep([[1047, .05], [1319, .08]]);
        var n = bsL().bottles.length;
        say("Das Buddelschiff mit den " + BNAME[k] + " Schornsteinen. " + (n < 4 ? "Noch " + (4 - n) + (4 - n === 1 ? " fehlt" : " fehlen") + " im Regal." : "Das Regal ist voll!"));
        await wait(700); front({ eyes: "happy", mouth: "grin", blush: true }); await wait(1300); el.classList.remove("bs-wob"); front({ paws: "down" });
      });
    });
  });
  var HOOK = '<svg viewBox="0 0 16 15" aria-hidden="true" shape-rendering="crispEdges"><path fill="#3a2414" d="M6 0h4v4h-1v1h-2v-2h-1z"/><path fill="#8a8a96" d="M7 1h2v2h-2z"/></svg>';
  var capHook = document.createElement("button"); capHook.type = "button"; capHook.className = "bs-prop bs-boxbtn bs-cap"; capHook.setAttribute("aria-label", "Kapitänsmütze");
  capHook.style.left = gx(157); capHook.style.top = gy(24); capHook.style.width = gx(16); kitchenEl.appendChild(capHook);
  capHook.addEventListener("click", function (e) {
    e.stopPropagation(); if (s.asleep || decor || bsOpen) return; if (busy && !interruptible()) return; if (busy) interrupt();
    var L = bsL(), on = !L.wear;
    act("cap", async function () {
      await walkTo(150, 121); H.dir = 1; front({ paws: "up", eyes: "happy", mouth: "grin" }); pulse("hop", 300); await wait(250);
      var fly = propEl(kitchenEl, on ? "bs_caphook" : "bs_caphook", on ? 157 : 144, on ? 24 : 76, "bs-fly"); if (on) capHook.innerHTML = HOOK;
      void fly.offsetWidth; fly.style.left = gx(on ? 144 : 157); fly.style.top = gy(on ? 76 : 24); beep(on ? [[523, .05], [659, .05], [784, .08]] : [[784, .05], [523, .08]]);
      if (!on) { L.wear = false; front({ paws: "up" }); }
      await wait(480); fly.remove();
      if (on) { L.wear = true; front({ eyes: "happy", mouth: "grin", paws: "side_r", blush: true }); pulse("bighop", 600); say("Ahoi! Kapitän " + N() + " meldet sich zur Stelle."); }
      else { renderTrophies(); front({ eyes: "happy", mouth: "smile", paws: "down" }); say(N() + " hängt die Kapitänsmütze an den Haken."); }
      if (window.SudokuSave) window.SudokuSave(); await wait(1200); front({ paws: "down" });
    });
  });
  var _bs_outfit = outfitPart;
  outfitPart = function (part) {
    if (!capOn() || s.asleep || (typeof beeSuit !== "undefined" && beeSuit) || (part !== "hat" && part !== "hat_back")) return _bs_outfit(part);
    return part === "hat" ? A.bs_cap : A.bs_capback;
  };
  function renderTrophies() {
    var L = bsL();
    bsShelf.hidden = !L.bottles.length;
    BOTTLES.forEach(function (k) { botEls[k].hidden = L.bottles.indexOf(k) < 0; });
    capHook.hidden = !L.hat; if (L.hat && !(busy && cur === "cap")) capHook.innerHTML = L.wear ? HOOK : svgOf(A.bs_caphook, 16, 15);
  }
  // the box is always where the game will be played: on the windowsill in bad weather or at night, on the bank by the lake otherwise
  function bsWhereNow() {
    renderTrophies();
    if (bsActive || bsOpen) return;
    bsBox.hidden = false; shoreTbl.hidden = bsPlace() !== "shore";
  }
  bsWhereNow(); setInterval(bsWhereNow, 3000);
  var _bs_battleSeq = battleSeq; battleSeq = async function () { var r = await _bs_battleSeq.apply(this, arguments); renderTrophies(); return r; };
  window.__bs.who = function (k) { bsWho = k; }; window.__bs.opp = BSOPP; window.__bs.box = bsBox; window.__bs.shore = shoreTbl; window.__bs.L = bsL; window.__bs.go = function (t) { if (busy) interrupt(); act("travel", function () { return travelTo(t); }); };
  (function () {
    var dh = document.getElementById("d-hours"), box = dh && dh.parentNode; if (!box) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "btn"; b.id = "bs-demo"; b.textContent = "Schiffe versenken"; box.appendChild(b);
    b.addEventListener("click", function () { if (bsOpen) return; if (busy) interrupt(); battleSeq(); });
  })();
