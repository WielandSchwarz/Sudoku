  // ===================== the stoker of the MS Pausbacke (preview) =====================
  // Light the fire, tap the coal scuttle to throw in a shovelful, turn three wheels: red sends steam to the engine (speed),
  // yellow blows steam off, blue lets water into the boiler. Every wheel shows what it does: steam or water running through
  // its pipe, puffs at the blow-off, the speed bar against the bridge's order. Too much pressure: the safety valve blows by itself.
  var DZ = /*STEAMART*/;
  var DZI = {}; Object.keys(DZ).forEach(function (k) { var im = new Image(); im.src = DZ[k]; DZI[k] = im; });
  var dzEl = xEl("div", "bee-pov fi-pov dz-pov", scene); dzEl.hidden = true;
  dzEl.innerHTML = '<canvas width="180" height="135" class="fi-cv"></canvas><b class="bp-ban fi-ban"></b>' +
    '<b class="dz-p"></b><div class="fi-card" hidden></div><button type="button" class="bp-x" aria-label="Maschinenraum verlassen">×</button>';
  var dzCv = dzEl.querySelector(".fi-cv"), dzc = dzCv.getContext("2d"); dzc.imageSmoothingEnabled = false;
  var dzBan = dzEl.querySelector(".fi-ban"),
    dzPl = dzEl.querySelector(".dz-p"), dzCard = dzEl.querySelector(".fi-card");
  var dzPanel = document.createElement("div"); dzPanel.className = "dz-panel"; dzPanel.innerHTML = '<div class="dz-chips"><b class="dz-c dz-cp"></b><b class="dz-c dz-cw"></b></div><p class="dz-msg"></p>';
  scene.parentNode.insertBefore(dzPanel, scene.nextSibling);
  var dzMsg = dzPanel.querySelector(".dz-msg"), dzCP = dzPanel.querySelector(".dz-cp"), dzCW = dzPanel.querySelector(".dz-cw");
  function dzWZone(W) { return W < .25 ? 0 : W < .35 ? 1 : W <= .85 ? 2 : 3; }            // too little, low, good, too full
  function dzBanner(t, hold) { if (dz) dz.banT = hold || 4; if (dzMsg.textContent === t) return; dzMsg.textContent = t; dzMsg.classList.remove("pop"); void dzMsg.offsetWidth; if (t) dzMsg.classList.add("pop"); }
  function DR(x, y, w, h, c) { dzc.fillStyle = c; dzc.fillRect(Math.round(x), Math.round(y), w, h); }
  function dzImg(k, x, y) { var im = DZI[k]; if (im && im.complete) dzc.drawImage(im, Math.round(x), Math.round(y)); }
  function dzLine(x0, y0, x1, y1, c) { var n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); for (var i = 0; i <= n; i++) DR(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 1, 1, c); }
  // the three stations: wheel at x 140, close arrow left, open arrow right
  var DZW = { red: { y: 26, c: "#d8463c", n: "Dampf zur Maschine" }, yellow: { y: 67, c: "#f6c84a", n: "Dampf ablassen" }, blue: { y: 108, c: "#3e7ab8", n: "Wasser in den Kessel" } };
  var DZ_WX = 150, DZ_AL = 133, DZ_AR = 168;
  var DZ_FIRE = { x0: 60, y0: 62, x1: 112, y1: 102 }, DZ_COAL = [{ x0: 44, y0: 96, x1: 82, y1: 135 }, { x0: 14, y0: 96, x1: 52, y1: 135 }], DZ_GAUGE = { x: 80, y: 32 }, DZ_GLASS = { x: 106, y0: 22, y1: 54 };
  var DZ_TGX = 40, DZ_TGY = 28;
  var DZ_ORD = { stopp: { n: "Stopp", v: 0 }, halb: { n: "Halbe Fahrt", v: .45 }, voll: { n: "Volle Fahrt!", v: .9 } };
  var DZ_TIME = 120;
  var dz = null, dzRaf = 0, dzOpen = false;
  function dzL() { var L = life(); L.steam = L.steam || { best: 0, trips: 0 }; return L.steam; }
  function dzNew() {
    return { T: 0, lit: false, fire: 0, coal: 0, pending: [], P: 0, W: .8, open: { red: 0, blue: 0, yellow: 0 }, ang: { red: 0, blue: 0, yellow: 0 }, spin: { red: 0, blue: 0, yellow: 0 },
      lightA: { red: [0, 0], blue: [0, 0], yellow: [0, 0] }, leverT: 0, pumpT: 0, shovT: 0, prog: 0, order: "stopp", nextOrder: 8, blows: 0, slowUntil: 0, shovels: 0, puffs: [], flow: 0, done: false, warnT: 2, banT: 0, seen: {}, v: 0 };
  }
  function dzZone(P) { return P < .25 ? 0 : P < .72 ? 1 : P < .9 ? 2 : 3; }            // too little, good, high, too high
  function dzDraw(t) {
    if (!dzOpen) return;
    var dt = Math.min(.05, (t - (dz.last || t)) / 1000); dz.last = t; if (!dz.done && dzCard.hidden) dzStep(dt);
    var shake = dz.P > .86 ? (Math.random() < .5 ? -1 : 1) * (dz.P > .95 ? 1 : Math.random() < .5 ? 1 : 0) : 0;
    dzc.save(); dzc.translate(shake, 0);
    dzImg("bg", 0, 0);
    // the fire
    var lv = dz.lit ? Math.max(1, Math.min(5, Math.round(dz.fire * 5))) : 0, fl = Math.floor(t / 180) % 2;
    if (lv) { dzImg("fire" + lv + "_" + fl, DZ_FIRE.x0, DZ_FIRE.y0); dzc.fillStyle = "rgba(255,170,90," + (dz.fire * .12) + ")"; dzc.fillRect(40, 50, 100, 85); }
    // the gauge: needle, and a glowing ring in the colour of the zone
    var z = dzZone(dz.P), zc = ["#a8b4c0", "#6fd04a", "#ffd34a", "#ff4a3a"][z];
    if (z > 0 && !(z === 3 && Math.floor(t / 180) % 2)) for (var k = 0; k < 64; k++) { var q = k / 64 * Math.PI * 2; DR(DZ_GAUGE.x + Math.cos(q) * 19.5, DZ_GAUGE.y + Math.sin(q) * 19.5, 2, 2, zc); }
    var fr = Math.max(0, Math.min(1.08, dz.P)), a = (135 + fr / 1.08 * 270) * Math.PI / 180;
    dzLine(DZ_GAUGE.x, DZ_GAUGE.y, DZ_GAUGE.x + Math.cos(a) * 12, DZ_GAUGE.y + Math.sin(a) * 12, "#c8342a"); dzLine(DZ_GAUGE.x + 1, DZ_GAUGE.y, DZ_GAUGE.x + 1 + Math.cos(a) * 11, DZ_GAUGE.y + Math.sin(a) * 11, "#c8342a"); DR(DZ_GAUGE.x - 1, DZ_GAUGE.y - 1, 3, 3, "#3a2414");
    // the water glass
    var wy = Math.round(DZ_GLASS.y1 - (DZ_GLASS.y1 - DZ_GLASS.y0) * Math.max(0, Math.min(1, dz.W)));
    DR(DZ_GLASS.x, wy, 7, DZ_GLASS.y1 - wy, dz.W < .3 && Math.floor(t / 250) % 2 ? "#c8463c" : "#3e7ab8"); DR(DZ_GLASS.x, wy, 7, 1, "#bfe0f4"); DR(DZ_GLASS.x + 1, wy + 1, 1, DZ_GLASS.y1 - wy - 1, "#6aaee0");
    var GH = DZ_GLASS.y1 - DZ_GLASS.y0, gy = function (w) { return Math.round(DZ_GLASS.y1 - GH * w); };
    DR(DZ_GLASS.x - 5, DZ_GLASS.y0, 4, GH, "#3a2414");
    DR(DZ_GLASS.x - 4, gy(.3), 2, gy(0) - gy(.3), "#e8554a"); DR(DZ_GLASS.x - 4, gy(1), 2, gy(.3) - gy(1), "#6fd04a");
    DR(DZ_GLASS.x - 8, wy, 4, 1, "#3a2414"); DR(DZ_GLASS.x - 9, wy - 1, 1, 3, "#3a2414");                       // a little pointer at the water line
    // what runs through the pipes: steam to the engine (red), water in (blue), and puffs at the blow-off (yellow)
    dz.flow += dt;
    var sr = dz.open.red * Math.min(1, dz.P / .3), sw = dz.pumpT > 0 ? 1 : 0, sy = dz.leverT > 0 ? Math.min(1, dz.P / .2) : 0;
    if (sr > .02) for (var i = 0; i < 4; i++) { var x = 122 + ((dz.flow * (20 + 60 * sr) + i * 15) % 58); if (x < 144 || x > 156) { DR(x, DZW.red.y - 1, 3, 2, "#fff6e4"); DR(x - 2, DZW.red.y, 2, 1, "#ffe0b8"); } }
    if (sw > .02) for (var j = 0; j < 4; j++) { var xb = 180 - ((dz.flow * (16 + 40 * sw) + j * 15) % 58); if (xb < 144 || xb > 156) { DR(xb, DZW.blue.y - 1, 3, 2, "#cfe8ff"); DR(xb + 3, DZW.blue.y, 2, 1, "#9fd0f4"); } }
    if (sy > .05 && Math.random() < dt * (3 + 14 * sy)) dz.puffs.push({ x: 176 + (Math.random() - .5) * 4, y: 2, vx: (Math.random() - .5) * 10, vy: -4, life: .9 + sy, k: "steam" });

    if (dz.P > .8 && Math.random() < dt * (dz.P - .7) * 12) dz.puffs.push({ x: Math.random() < .5 ? 50 : 122, y: 30 + Math.random() * 60, vx: 0, vy: -8, life: .6, k: "puff" });   // steam hissing out at the rivets
    dz.puffs = dz.puffs.filter(function (p) { p.life -= dt; p.y += (p.vy || -14) * dt; p.x += p.vx * dt; if (p.life > 0) dzImg(p.k, p.x - (p.k === "puff" ? 4 : 8), p.y + (p.k === "steam" ? 4 : 0)); return p.life > 0; });
    // the wheels, the arrows beside them, how far open
    Object.keys(DZW).forEach(function (k) {
      var w = DZW[k];
      if (k === "yellow") { dzImg(dz.leverT > 0 ? "lever1" : "lever0", DZ_WX - 14, w.y - 25); return; }
      if (k === "blue") { dzImg(dz.pumpT > 0 ? "pump1" : "pump0", DZ_WX - 14, w.y - 22); return; }
      if (dz.spin[k]) { var st = Math.sign(dz.spin[k]) * Math.min(Math.abs(dz.spin[k]), dt * 9); dz.ang[k] += st; dz.spin[k] -= st; }
      var f8 = ((Math.round(dz.ang[k] / (Math.PI / 16)) % 8) + 8) % 8;
      dzImg("w_" + k + "_" + f8, DZ_WX - 15, w.y - 15);
      dzImg("ar_close_" + (dz.lightA[k][0] > 0 ? 1 : 0), DZ_AL - 7, w.y - 8); dzImg("ar_open_" + (dz.lightA[k][1] > 0 ? 1 : 0), DZ_AR - 7, w.y - 8);
      dz.lightA[k][0] -= dt; dz.lightA[k][1] -= dt;
      DR(DZ_WX - 12, w.y + 13, 25, 7, "#3a2414"); DR(DZ_WX - 11, w.y + 14, 23, 5, "#2a2e32"); DR(DZ_WX - 11, w.y + 14, Math.round(23 * dz.open[k]), 5, w.c);
      for (var s = 1; s < 4; s++) DR(DZ_WX - 11 + s * 5.75, w.y + 14, 1, 5, "#3a2414");
    });
    dzTelegraph(t, dt);
    dz.shovT -= dt; dzImg(dz.shovT > 0 ? "ham_st1" : "ham_st0", 14, 95);
    // coal on its way
    dz.pending.forEach(function (c) { if (c.fly < 1) { dzImg("coal", 20 + (c.tx - 20) * c.fly - 4, 118 - Math.sin(c.fly * Math.PI) * 26 + (c.ty - 118) * c.fly - 4); dzImg("coal", 24 + (c.tx - 16) * c.fly - 4, 120 - Math.sin(c.fly * Math.PI) * 22 + (c.ty - 120) * c.fly - 4); } });
    // the voyage along the left edge: from the bottom up to the harbour (the close button sits above it)
    var SY = 20;
    for (var yy = SY; yy < 135; yy++) DR(0, yy, 15, 1, (yy + Math.floor(dz.flow * 6)) % 7 === 0 ? "#6aaee0" : "#3a6ea4");
    for (var w2 = 0; w2 < 6; w2++) DR(1 + (w2 * 4) % 12, ((w2 * 23 + Math.floor(dz.flow * 10)) % 100) + SY + 12, 2, 1, "#bfe0f4");
    DR(0, SY - 1, 16, 1, "#3a2414"); DR(0, SY, 15, 9, "#7cb860"); DR(0, SY + 8, 15, 2, "#e8d8a0"); DR(6, SY + 9, 3, 3, "#a87448"); DR(15, SY, 1, 135 - SY, "#3a2414");
    DR(3, SY + 2, 3, 5, "#ffffff"); DR(3, SY + 4, 3, 1, "#d8342a"); DR(3, SY + 1, 3, 1, "#ffd34a"); DR(9, SY + 3, 4, 3, "#c8463c"); DR(9, SY + 6, 4, 2, "#f4f0e6");
    dzImg("ship_up", 1, Math.round(98 - dz.prog * (98 - SY - 11)));
    dzc.restore();
    // the readouts in the corner and by the gauge
    if (dz.banT <= -6 && dzMsg.textContent) dzMsg.textContent = "";
    var pt = ["Druck: zu wenig", "Druck: gut", "Druck: hoch!", "Druck: zu hoch!"][z]; if (dzCP.textContent !== pt) { dzCP.textContent = pt; dzCP.className = "dz-c dz-cp z" + z; }
    var wz = dz.W < .3 ? 0 : 2, wt = wz ? "Wasser: gut" : "Wasser pumpen!"; if (dzCW.textContent !== wt) { dzCW.textContent = wt; dzCW.className = "dz-c dz-cw w" + wz; }
    dzRaf = requestAnimationFrame(dzDraw);
  }
  // the historic engine telegraph: a brass column with a round dial; the bridge's order is the black pointer with the brass tip,
  // what the engine really does is the red pointer. Grey: stop, yellow: half ahead, green: full ahead. When the bridge rings, the bell shakes.
  var DZ_TG = { x: DZ_TGX, y: DZ_TGY, r: 18 };
  function dzTgAng(v) { return Math.PI * (-1 + Math.min(1, v) / .95 * .95); }
  var DZ_TGA = { stopp: -159, halb: -90, voll: -21 };
  function dzTelegraph(t, dt) {
    var X = DZ_TG.x, Y = DZ_TG.y, ring = dz.ringT > 0 ? Math.round(Math.sin(t / 30)) : 0;
    dz.ringT = (dz.ringT || 0) - dt;
    dzImg("tg_col", X - 9, Y + 20);
    var aw = DZ_TGA[dz.order] * Math.PI / 180;
    dz.tgw = dz.tgw == null ? aw : dz.tgw + (aw - dz.tgw) * Math.min(1, dt * 5);
    // the handle on top swings with the order
    var hx = X + ring + Math.cos(dz.tgw) * 25, hy = Y + Math.sin(dz.tgw) * 25;
    dzLine(X + ring + Math.cos(dz.tgw) * 22, Y + Math.sin(dz.tgw) * 22, hx, hy, "#7a5a1a"); dzLine(X + ring + Math.cos(dz.tgw) * 22 + 1, Y + Math.sin(dz.tgw) * 22, hx + 1, hy, "#b88a2a");
    DR(hx - 2, hy - 2, 5, 5, "#3a2414"); DR(hx - 1, hy - 1, 3, 3, "#e8554a");
    dzImg("tg_face", X - 24 + ring, Y - 24);
    var av = (-159 + Math.min(1, dz.v / .9) * 138) * Math.PI / 180;
    dzLine(X + ring, Y, X + ring + Math.cos(av) * 13, Y + Math.sin(av) * 13, "#d8342a"); dzLine(X + ring + 1, Y, X + ring + 1 + Math.cos(av) * 12, Y + Math.sin(av) * 12, "#d8342a");
    dzLine(X + ring, Y, X + ring + Math.cos(dz.tgw) * 17, Y + Math.sin(dz.tgw) * 17, "#3a2414"); dzLine(X + ring, Y + 1, X + ring + Math.cos(dz.tgw) * 16, Y + 1 + Math.sin(dz.tgw) * 16, "#3a2414");
    DR(X + ring + Math.cos(dz.tgw) * 15 - 1, Y + Math.sin(dz.tgw) * 15 - 1, 3, 3, "#e8b84a");
    DR(X + ring - 2, Y - 2, 5, 5, "#3a2414"); DR(X + ring - 1, Y - 1, 3, 3, "#e8b84a");
    var ok = Math.abs(dz.v - DZ_ORD[dz.order].v) <= .15;
    DR(X - 6 + ring, Y + 9, 13, 3, ok ? "#6fd04a" : (Math.floor(t / 300) % 2 ? "#e8554a" : "#7a2a20"));          // the name plate lights up: green when the engine does what the bridge wants
    if (dz.ringT > 0 && Math.floor(t / 90) % 2) { for (var k = 0; k < 3; k++) { DR(X - 30 - k * 2, Y - 10 + k * 6, 3, 1, "#ffd34a"); DR(X + 28 + k * 2, Y - 10 + k * 6, 3, 1, "#ffd34a"); } }
  }
  function dzStep(dt) {
    dz.T += dt; dz.banT -= dt;
    dz.pending = dz.pending.filter(function (c) { c.fly = Math.min(1, c.fly + dt * 2.5); c.t -= dt; if (c.t <= 0) { dz.coal = Math.min(30, dz.coal + 1); return false; } return true; });
    if (dz.lit) {
      dz.coal = Math.max(0, dz.coal - dt * (.045 + dz.fire * .06));
      dz.fire += (Math.min(1.1, dz.coal / 5) - dz.fire) * dt * .35;
      if (dz.coal <= 0 && dz.fire < .05) { dz.lit = false; dz.fire = 0; dzBanner("Das Feuer ist aus! Klappe antippen."); }
    }
    var dry = dz.W < .12, gen = dz.fire * .085 * (dry ? .35 : 1), use = dz.open.red * .075 * Math.min(1, dz.P / .2), blow = dz.leverT > 0 ? .2 : 0; dz.leverT -= dt; dz.pumpT -= dt;
    dz.P = Math.max(0, dz.P + (gen - use - blow - .004) * dt);
    dz.W = Math.max(0, dz.W - (gen * .12 + use * .06) * dt);                 // the boiler slowly drinks; a few pump strokes now and then
    if (dz.P >= 1.05) {
      dz.P = .82; dz.blows++; dz.slowUntil = dz.T + 3;
      for (var k = 0; k < 8; k++) dz.puffs.push({ x: 30 + Math.random() * 50, y: 2 + Math.random() * 6, vx: (Math.random() - .5) * 20, vy: -6, life: 1.4, k: "steam" });
      dzBanner("Pfffft! Das Sicherheitsventil bläst ab. Die Pausbacke wird langsamer.", 4); beep([[1200, .08], [1100, .08], [1000, .1]]);
    }
    if (dz.P > .86 && Math.random() < dt * 2) beep([[90 + Math.random() * 30, .05]]);                     // the boiler rumbles
    var power = Math.min(1, dz.P / .45) * (dz.W < .12 ? .5 : 1), v = dz.open.red * power * (dz.T < dz.slowUntil ? .4 : 1), want = DZ_ORD[dz.order].v;
    dz.v = v;
    var good = Math.abs(v - want) <= .15;                                                                   // only progress when the engine does what the bridge wants
    dz.prog = Math.min(1, dz.prog + (want === 0 ? 0 : v * (good ? 1 : .55)) * dt / 75);
    if (dz.T > dz.nextOrder) {
      var ks = ["halb", "voll", "halb", "voll", "stopp"], nk = dz.order;
      while (nk === dz.order) nk = ks[Math.floor(Math.random() * ks.length)];
      if (dz.order === "stopp" && dz.T < 12) nk = "halb";
      dz.ringT = 1.2; dz.order = nk; dz.nextOrder = dz.T + (nk === "stopp" ? 8 : 18 + Math.random() * 10);
      dzBanner("Brücke: " + DZ_ORD[nk].n + (nk === "stopp" ? " Rotes Rad zu." : nk === "voll" ? " Rotes Rad weit auf." : " Rotes Rad halb auf."), 4); beep([[880, .06], [880, .06], [660, .08]]);
    }
    dz.warnT -= dt;
    if (dz.warnT <= 0 && dz.banT <= 0) {
      var msg = "";
      if (!dz.lit) msg = "Feuerklappe antippen!";
      else if (dz.W < .3) msg = "Wasser pumpen: auf die blaue Pumpe tippen.";
      else if (dz.P > .9) msg = "Zu viel Druck! Gelben Hebel ziehen.";
      else if (dz.coal < .6 && dz.pending.length === 0) msg = "Das Feuer braucht Kohle: auf den Eimer tippen.";
      else if (dz.P < .25 && dz.open.red > .3) msg = "Zu wenig Druck. Mehr Kohle, Rotes Rad etwas zu.";
      else if (want > 0 && v < want - .15) msg = "Zu langsam für die Brücke: rotes Rad weiter auf.";
      else if (v > want + .15) msg = want === 0 ? "Stopp! Rotes Rad zu." : "Zu schnell: rotes Rad etwas zu.";
      if (msg) { dzBanner(msg); dz.warnT = 3; } else dz.warnT = 1;
    }
    if (dz.prog >= 1 && !dz.done) dzArrive();
  }
  function dzArrive() {
    dz.done = true; dzBanner(""); var M = dzL(); M.trips++;
    var s1 = dz.T <= DZ_TIME, s2 = dz.blows === 0, s3 = dz.shovels <= 26, n = (s1 ? 1 : 0) + (s2 ? 1 : 0) + (s3 ? 1 : 0); if (n > M.best) M.best = n;
    if (window.SudokuSave) window.SudokuSave();
    beep([[523, .06], [659, .06], [784, .06], [1047, .12]]);
    var st = function (on) { return on ? "★" : '<i>★</i>'; };
    dzCard.innerHTML = '<div class="fi-c"><p class="fi-h">Angelegt im Hafen!</p><span class="fi-st">' + st(s1) + st(s2) + st(s3) + '</span>' +
      '<p class="fi-s">' + (s1 ? "★" : "☆") + ' Pünktlich (' + Math.round(dz.T) + ' s)</p><p class="fi-s">' + (s2 ? "★" : "☆") + ' Kein Abblasen' + (dz.blows ? " (" + dz.blows + "×)" : "") + '</p><p class="fi-s">' + (s3 ? "★" : "☆") + ' Sparsam: ' + dz.shovels + ' Schaufeln</p>' +
      '<div class="fi-row"><button type="button" class="fi-b2" data-a="end">Fertig</button><button type="button" class="fi-b" data-a="again">Noch eine Fahrt</button></div></div>';
    dzCard.hidden = false;
  }
  // ---- touch: the firebox, the coal scuttle, the wheels and their arrows ----
  function dzPt(e) { var r = dzCv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 180, (e.clientY - r.top) / r.height * 135]; }
  function inR(p, r) { return p[0] >= r.x0 && p[0] <= r.x1 && p[1] >= r.y0 && p[1] <= r.y1; }
  function dzStation(p) { var hit = null; Object.keys(DZW).forEach(function (k) { if (Math.abs(p[1] - DZW[k].y) < 18 && p[0] > 124 && p[0] < 180) hit = k; }); return hit; }
  function dzLever() {
    if (dz.leverT > 0) return;
    dz.leverT = 1.4; beep([[1400, .05], [1200, .2]]);
    if (!dz.seen.yellow) { dz.seen.yellow = 1; dzBanner("Gelber Hebel: lässt Überdruck ab.", 4); }
  }
  function dzPump() {
    if (dz.pumpT > .1) return;
    dz.pumpT = .35; dz.W = Math.min(1, dz.W + .12); beep([[260, .05], [330, .06]]);
    if (!dz.seen.blue) { dz.seen.blue = 1; dzBanner("Pumpe: jeder Stoß bringt Wasser in den Kessel.", 4); }
  }
  function dzTurn(k, d) {
    var before = dz.open[k]; dz.open[k] = Math.max(0, Math.min(1, Math.round((dz.open[k] + d * .25) * 4) / 4));
    if (dz.open[k] === before) { beep([[200, .03]]); return; }
    dz.spin[k] += d * Math.PI / 2; dz.lightA[k][d > 0 ? 1 : 0] = .5;
    beep(d > 0 ? [[520, .03], [700, .04]] : [[700, .03], [520, .04]]);
    if (!dz.seen[k]) { dz.seen[k] = 1; dzBanner(DZW[k].n + ": " + (k === "red" ? "mehr Tempo, aber der Druck sinkt." : k === "yellow" ? "der Druck sinkt, kostet aber Dampf." : "der Wasserstand steigt, das Feuer kühlt etwas."), 4.5); }
  }
  function dzShovel() {
    if (!dz.lit) { dzBanner("Erst das Feuer anzünden: Klappe antippen."); return; }
    dz.shovels++; dz.shovT = .4; dz.pending.push({ t: 2.2, fly: 0, tx: 70 + Math.random() * 30, ty: 92 }); beep([[180, .05], [140, .05]]);
  }
  dzCv.addEventListener("pointerdown", function (e) {
    if (!dz || dz.done || !dzCard.hidden) return; e.preventDefault(); var p = dzPt(e);
    var k = dzStation(p);
    if (k === "yellow") { dzLever(); return; }
    if (k === "blue") { dzPump(); return; }
    if (k) { var d = p[0] < DZ_WX ? -1 : 1; dzTurn(k, d); return; }                         // left of the wheel closes, right of it opens
    if (inR(p, DZ_FIRE) && !dz.lit) { dz.lit = true; dz.coal = Math.max(dz.coal, 1.2); dz.fire = .15; dzBanner("Das Feuer brennt! Jetzt auf den Kohleneimer tippen."); beep([[300, .05], [500, .08]]); return; }
    if (inR(p, DZ_FIRE) || DZ_COAL.some(function (r) { return inR(p, r); })) dzShovel();
  });
  dzCard.addEventListener("click", function (e) {
    e.stopPropagation(); var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.a === "again") { dz = dzNew(); dzCard.hidden = true; dzBanner("Der Kessel ist kalt. Klappe antippen."); }
    else steamEnd();
  });
  function steamGame() {
    return new Promise(function (resolve) {
      dz = dzNew(); dzEl.hidden = false; dzOpen = true; document.body.classList.add("dz-on"); dzCard.hidden = true; dz.resolve = resolve;
      dzBanner("Der Kessel ist kalt. Klappe antippen."); dzRaf = requestAnimationFrame(dzDraw);
    });
  }
  function steamEnd() { if (!dzOpen) return; dzOpen = false; document.body.classList.remove("dz-on"); dzMsg.textContent = ""; cancelAnimationFrame(dzRaf); dzEl.hidden = true; dzCard.hidden = true; var r = dz && dz.resolve; dz = null; if (r) r(); }
  dzEl.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); steamEnd(); });
  var _dz_interrupt = interrupt; interrupt = function () { if (dzOpen) steamEnd(); return _dz_interrupt.apply(this, arguments); };
  var dzPic = xEl("button", "dz-pic", document.getElementById("room")); dzPic.type = "button"; dzPic.setAttribute("aria-label", "Bild mit Dampfer");
  dzPic.innerHTML = '<img src="' + DZ.pic + '" alt="">'; place(dzPic, 90, 14, 24);
  async function steamSeq() {
    front({ eyes: "happy", mouth: "grin", paws: "up" }); say(N() + " träumt sich in den Maschinenraum der MS Pausbacke."); await wait(700);
    await steamGame(); front({ eyes: "happy", mouth: "smile" }); say(N() + " wischt sich den Ruß von der Nase.");
  }
  dzPic.addEventListener("click", function (e) { e.stopPropagation(); if (decor || s.asleep) return; if (busy && !interruptible()) return; if (busy) interrupt(); act("steam", steamSeq); });
  window.__steam = { open: function () { steamGame(); }, st: function () { return dz && { P: dz.P, W: dz.W, fire: dz.fire, coal: dz.coal, prog: dz.prog, order: dz.order, open: dz.open, lit: dz.lit, blows: dz.blows, done: dz.done, v: dz.v }; }, end: steamEnd,
    set: function (o) { if (dz) Object.keys(o).forEach(function (k) { dz[k] = o[k]; }); } };
