  // ===================== the stoker of the MS Pausbacke (preview, turn based) =====================
  // The voyage is a timetable of legs (harbour, open sea, fog, iceberg ...), each with an order from the bridge: stop, half or full ahead.
  // For every leg the player plans in peace: shovels of coal, the red wheel (closed / half / full), the yellow blow-off lever, pump strokes.
  // A ghost needle on the gauge shows where the pressure will end up. "Los!" runs the leg as a short animation and the ship moves on.
  // Fire: the embers halve every leg, new shovels add to them; the embers make pressure. Half ahead uses 2, full ahead 4 pressure;
  // the lever lets off 3, a pump stroke brings 3 water but costs 1 pressure. Above 10 the safety valve blows.
  var DZ = /*STEAMART*/;
  var DZI = {}; Object.keys(DZ).forEach(function (k) { var im = new Image(); im.src = DZ[k]; DZI[k] = im; });
  var dzEl = xEl("div", "bee-pov fi-pov dz-pov", scene); dzEl.hidden = true;
  dzEl.innerHTML = '<canvas width="180" height="135" class="fi-cv"></canvas><div class="fi-card" hidden></div><button type="button" class="bp-x" aria-label="Maschinenraum verlassen">×</button>';
  var dzCv = dzEl.querySelector(".fi-cv"), dzc = dzCv.getContext("2d"); dzc.imageSmoothingEnabled = false;
  var dzCard = dzEl.querySelector(".fi-card");
  var dzPanel = document.createElement("div"); dzPanel.className = "dz-panel";
  dzPanel.innerHTML = '<div class="dz-plan"></div><div class="dz-row"><p class="dz-msg"></p><button type="button" class="dz-go">Los!</button></div>';
  scene.parentNode.insertBefore(dzPanel, scene.nextSibling);
  var dzMsg = dzPanel.querySelector(".dz-msg"), dzPlanEl = dzPanel.querySelector(".dz-plan"), dzGo = dzPanel.querySelector(".dz-go");
  function dzBanner(t) { if (dzMsg.textContent === t) return; dzMsg.textContent = t; dzMsg.classList.remove("pop"); void dzMsg.offsetWidth; if (t) dzMsg.classList.add("pop"); }
  function dzBuzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }
  function dzShake(s) { if (dz) dz.shk = Math.max(dz.shk || 0, s); }
  function dzPop(txt, x, y, cls, dur) {
    var e = xEl("b", "dz-pop " + (cls || ""), dzEl); e.textContent = txt; e.style.left = (x / 180 * 100) + "%"; e.style.top = (y / 135 * 100) + "%";
    setTimeout(function () { e.remove(); }, dur || 1200);
  }
  function dzSparks(x, y, n, cols) { for (var i = 0; i < n; i++) dz.sparks.push({ x: x, y: y, vx: (Math.random() - .5) * 70, vy: -20 - Math.random() * 50, life: .5 + Math.random() * .5, c: (cols || ["#fff1a8", "#f6a040", "#ffd34a"])[i % 3] }); }
  function dzSparkDraw(dt) { dz.sparks = dz.sparks.filter(function (p) { p.life -= dt; p.vy += 120 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.life > 0) DR(p.x, p.y, 1, 1, p.c); return p.life > 0; }); }
  function DR(x, y, w, h, c) { dzc.fillStyle = c; dzc.fillRect(Math.round(x), Math.round(y), w, h); }
  function dzImg(k, x, y) { var im = DZI[k]; if (im && im.complete) dzc.drawImage(im, Math.round(x), Math.round(y)); }
  function dzLine(x0, y0, x1, y1, c) { var n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); for (var i = 0; i <= n; i++) DR(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 1, 1, c); }
  var DZW = { red: { y: 26, c: "#d8463c" }, yellow: { y: 67 }, blue: { y: 108 } };
  var DZ_WX = 150, DZ_AL = 133, DZ_AR = 168;
  var DZ_FIRE = { x0: 60, y0: 62, x1: 112, y1: 102 }, DZ_COAL = [{ x0: 44, y0: 96, x1: 82, y1: 135 }, { x0: 14, y0: 96, x1: 52, y1: 135 }], DZ_GAUGE = { x: 80, y: 32 }, DZ_GLASS = { x: 106, y0: 22, y1: 54 };
  var DZ_CROW = { x0: 44, y0: 78, x1: 100, y1: 94 }, DZ_DROW = { x0: 128, y0: 124, x1: 180, y1: 135 };   // planned coal above the scuttle, planned strokes under the pump: tap to take back
  var DZ_TGX = 40, DZ_TGY = 28;
  var DZ_ORD = { stopp: { n: "Stopp", l: 0 }, halb: { n: "Halbe Fahrt", l: 1 }, voll: { n: "Volle Fahrt", l: 2 } };
  var DZ_LVN = ["Stopp", "Halbe Fahrt", "Volle Fahrt"], DZ_NEED = [0, 2, 4];
  var DZ_LEG = { hafen: { n: "Hafen", o: "halb" }, see: { n: "See", o: "voll" }, nebel: { n: "Nebel", o: "halb" }, eis: { n: "Eisberg", o: "stopp" } };
  var dz = null, dzRaf = 0, dzOpen = false;
  function dzL() { var L = life(); L.steam = L.steam || { best: 0, trips: 0 }; return L.steam; }
  function dzRoute() {
    var mid = ["see", "see", "see", "nebel", "eis"], r = [];
    if (Math.random() < .5) mid.push(Math.random() < .5 ? "nebel" : "see");
    while (mid.length) r.push(mid.splice(Math.floor(Math.random() * mid.length), 1)[0]);
    for (var i = 1; i < r.length; i++) if (r[i] === "eis" && r[i - 1] === "eis") { r.splice(i, 1); r.push("see"); }
    return ["hafen"].concat(r, ["hafen"]);
  }
  function dzNew() {
    var route = dzRoute(), need = 0; route.forEach(function (k) { need += DZ_NEED[DZ_ORD[DZ_LEG[k].o].l]; });
    return { route: route, leg: 0, res: [], P: 3, G: 2, W: 7, red: 0, coalN: 0, pumpN: 0, lever: false, shovels: 0, blows: 0, budget: Math.ceil((need - 3) / 2) + 3,
      ang: 0, spin: 0, lightA: [0, 0], shovT: 0, pumpT: 0, pending: [], puffs: [], flow: 0, anim: null, sparks: [], shk: 0, streak: 0, done: false, dispP: .3, dispW: .7, dispG: 2, prog: 0, v: 0, ringT: 1.2, seen: {} };
  }
  // what happens if the current plan runs: pure function of the state
  function dzSim(d) {
    var G = Math.floor(d.G / 2) + d.coalN, P = d.P + G - (d.lever ? 3 : 0) - d.pumpN, W = d.W + 3 * d.pumpN, lvl = d.red;
    while (lvl > 0 && (P < DZ_NEED[lvl] || W < lvl)) lvl--;
    P = Math.max(0, P - DZ_NEED[lvl]); W = Math.min(10, W - lvl);
    var blow = P > 10; if (blow) P = 7;
    return { G: G, P: P, W: Math.max(0, W), lvl: lvl, blow: blow, ok: lvl === DZ_ORD[d.leg < d.route.length ? DZ_LEG[d.route[d.leg]].o : "halb"].l };
  }
  function dzOrder() { return dz.leg < dz.route.length ? DZ_LEG[dz.route[dz.leg]].o : "halb"; }
  function dzZone(P) { return P < .25 ? 0 : P < .72 ? 1 : P < .9 ? 2 : 3; }
  // ---- the timetable in the panel ----
  function dzPlanDraw() {
    dzPlanEl.innerHTML = dz.route.map(function (k, i) {
      var L = DZ_LEG[k], st = i < dz.leg ? (dz.res[i] ? " ok" : " bad") : i === dz.leg ? " cur" : "";
      return '<b class="dz-t o-' + L.o + st + '"><img src="' + DZ["ri_" + (k === "hafen" ? "hafen" : k)] + '" alt=""><i>' + DZ_ORD[L.o].n.replace(" Fahrt", "") + '</i></b>';
    }).join("");
  }
  function dzHint() {
    if (dz.anim || dz.done) return;
    var r = dzSim(dz), o = dzOrder(), ol = DZ_ORD[o].l;
    var msg;
    if (r.blow) msg = "So wird der Druck zu hoch: das Sicherheitsventil bläst ab. Weniger Kohle oder gelben Hebel ziehen.";
    else if (dz.red !== ol) msg = "Die Brücke will " + DZ_ORD[o].n + ": rotes Rad auf " + ["zu", "halb", "voll"][ol] + " stellen.";
    else if (r.lvl < dz.red) msg = (dz.W + 3 * dz.pumpN < dz.red ? "Zu wenig Wasser für " : "Zu wenig Druck für ") + DZ_LVN[dz.red] + ": " + (dz.W + 3 * dz.pumpN < dz.red ? "pumpen." : "mehr Kohle.");
    else if (r.W < 3) msg = "Danach wird das Wasser knapp. Die Pumpe hilft.";
    else msg = "Alles bereit für " + DZ_LEG[dz.route[dz.leg]].n + ": Los!";
    dzBanner(msg);
  }
  // ---- drawing ----
  function dzDraw(t) {
    if (!dzOpen) return;
    var dt = Math.min(.05, (t - (dz.last || t)) / 1000); dz.last = t;
    if (dz.anim) dzAnimStep(dt);
    dz.shk = Math.max(0, (dz.shk || 0) - dt); var sk = dz.shk > 0 ? Math.ceil(dz.shk * 8) : 0;
    dzc.save(); if (sk) dzc.translate(Math.round((Math.random() - .5) * 2 * Math.min(3, sk)), Math.round((Math.random() - .5) * 2 * Math.min(2, sk)));
    if (dz.anim && dz.anim.out) { dzSea(t, dt); dzSparkDraw(dt); dzc.restore(); dzRaf = requestAnimationFrame(dzDraw); return; }
    if (dz.zoom) { dzZoomTick(dt); dzZoomDraw(t, dt); dzSparkDraw(dt); dzc.restore(); dzRaf = requestAnimationFrame(dzDraw); return; }
    var sim = dz.anim || dz.done ? null : dzSim(dz);
    dzImg("bg", 0, 0);
    // the fire: from the embers
    var lv = Math.max(dz.dispG > .3 ? 1 : 0, Math.min(5, Math.round(dz.dispG * 1.1))), fl = Math.floor(t / 180) % 2;
    if (lv) { dzImg("fire" + lv + "_" + fl, DZ_FIRE.x0, DZ_FIRE.y0); dzc.fillStyle = "rgba(255,170,90," + (lv * .025) + ")"; dzc.fillRect(40, 50, 100, 85); }
    // the gauge: zone ring, the real needle, and while planning a pale ghost needle where the pressure will end up
    var P = dz.dispP, z = dzZone(P), zc = ["#a8b4c0", "#6fd04a", "#ffd34a", "#ff4a3a"][z];
    if (z > 0) for (var k = 0; k < 64; k++) { var q = k / 64 * Math.PI * 2; DR(DZ_GAUGE.x + Math.cos(q) * 19.5, DZ_GAUGE.y + Math.sin(q) * 19.5, 2, 2, zc); }
    function needle(f, c, r) { var a = (135 + Math.max(0, Math.min(1.08, f)) / 1.08 * 270) * Math.PI / 180; dzLine(DZ_GAUGE.x, DZ_GAUGE.y, DZ_GAUGE.x + Math.cos(a) * r, DZ_GAUGE.y + Math.sin(a) * r, c); dzLine(DZ_GAUGE.x + 1, DZ_GAUGE.y, DZ_GAUGE.x + 1 + Math.cos(a) * (r - 1), DZ_GAUGE.y + Math.sin(a) * (r - 1), c); }
    if (sim) { var gf = sim.blow ? 1.08 : sim.P / 10; if (!(sim.blow && Math.floor(t / 250) % 2)) needle(gf, sim.blow ? "#ff4a3a" : "#7aa0c8", 12); }
    needle(P, "#c8342a", 12); DR(DZ_GAUGE.x - 1, DZ_GAUGE.y - 1, 3, 3, "#3a2414");
    // the water glass, with a marker where it will be after this leg
    var GH = DZ_GLASS.y1 - DZ_GLASS.y0, gy = function (w) { return Math.round(DZ_GLASS.y1 - GH * Math.max(0, Math.min(1, w))); };
    var wy = gy(dz.dispW);
    DR(DZ_GLASS.x, wy, 7, DZ_GLASS.y1 - wy, dz.dispW < .3 && Math.floor(t / 250) % 2 ? "#c8463c" : "#3e7ab8"); DR(DZ_GLASS.x, wy, 7, 1, "#bfe0f4"); DR(DZ_GLASS.x + 1, wy + 1, 1, DZ_GLASS.y1 - wy - 1, "#6aaee0");
    DR(DZ_GLASS.x - 5, DZ_GLASS.y0, 4, GH, "#3a2414"); DR(DZ_GLASS.x - 4, gy(.3), 2, gy(0) - gy(.3), "#e8554a"); DR(DZ_GLASS.x - 4, gy(1), 2, gy(.3) - gy(1), "#6fd04a");
    DR(DZ_GLASS.x - 8, wy, 4, 1, "#3a2414"); DR(DZ_GLASS.x - 9, wy - 1, 1, 3, "#3a2414");
    if (sim) { var gw = gy(sim.W / 10); DR(DZ_GLASS.x - 1, gw, 9, 1, "#7aa0c8"); }
    // pipes: steam to the engine, water in, puffs at the blow-off
    dz.flow += dt;
    var an = dz.anim, sr = an ? an.r.lvl / 2 : 0, sw = dz.pumpT > 0 ? 1 : 0, sy = an && dz.lever ? 1 : 0;
    if (sr > .02) for (var i = 0; i < 4; i++) { var x = 122 + ((dz.flow * (20 + 60 * sr) + i * 15) % 58); if (x < 144 || x > 156) { DR(x, DZW.red.y - 1, 3, 2, "#fff6e4"); DR(x - 2, DZW.red.y, 2, 1, "#ffe0b8"); } }
    if (sw) for (var j = 0; j < 4; j++) { var xb = 180 - ((dz.flow * 56 + j * 15) % 58); if (xb < 144 || xb > 156) { DR(xb, DZW.blue.y - 1, 3, 2, "#cfe8ff"); DR(xb + 3, DZW.blue.y, 2, 1, "#9fd0f4"); } }
    if (sy && Math.random() < dt * 14) dz.puffs.push({ x: 176 + (Math.random() - .5) * 4, y: 2, vx: (Math.random() - .5) * 10, vy: -4, life: 1.6, k: "steam" });
    if (an && an.r.blow && an.t > 1 && an.t < 2 && Math.random() < dt * 20) dz.puffs.push({ x: 60 + Math.random() * 50, y: 4, vx: (Math.random() - .5) * 20, vy: -6, life: 1.2, k: "steam" });
    dz.puffs = dz.puffs.filter(function (p) { p.life -= dt; p.y += (p.vy || -14) * dt; p.x += p.vx * dt; if (p.life > 0) dzImg(p.k, p.x - (p.k === "puff" ? 4 : 8), p.y + (p.k === "steam" ? 4 : 0)); return p.life > 0; });
    // red wheel with its arrows and a three-step bar (closed / half / full)
    if (dz.spin) { var st = Math.sign(dz.spin) * Math.min(Math.abs(dz.spin), dt * 9); dz.ang += st; dz.spin -= st; }
    var f8 = ((Math.round(dz.ang / (Math.PI / 16)) % 8) + 8) % 8, wr = DZW.red;
    dzImg("w_red_" + f8, DZ_WX - 15, wr.y - 15);
    dzImg("ar_close_" + (dz.lightA[0] > 0 ? 1 : 0), DZ_AL - 7, wr.y - 8); dzImg("ar_open_" + (dz.lightA[1] > 0 ? 1 : 0), DZ_AR - 7, wr.y - 8);
    dz.lightA[0] -= dt; dz.lightA[1] -= dt;
    DR(DZ_WX - 12, wr.y + 13, 25, 7, "#3a2414"); DR(DZ_WX - 11, wr.y + 14, 23, 5, "#2a2e32"); DR(DZ_WX - 11, wr.y + 14, [0, 11, 23][dz.red], 5, wr.c); DR(DZ_WX, wr.y + 14, 1, 5, "#3a2414");
    // the lever (pulled while armed) and the pump with the planned strokes as drops underneath
    dzImg(dz.lever ? "lever1" : "lever0", DZ_WX - 14, DZW.yellow.y - 25);
    dz.pumpT -= dt; dzImg(dz.pumpT > 0 ? "pump1" : "pump0", DZ_WX - 14, DZW.blue.y - 22);
    for (var pn = 0; pn < dz.pumpN; pn++) { var dx = 142 + pn * 10; DR(dx + 1, 125, 3, 1, "#3a2414"); DR(dx, 126, 5, 6, "#3a2414"); DR(dx + 1, 126, 3, 5, "#4f8cc0"); DR(dx + 2, 125, 1, 1, "#4f8cc0"); DR(dx + 1, 127, 1, 1, "#bfe0f4"); }
    dzTelegraph(t, dt);
    dz.shovT -= dt; dzImg(dz.shovT > 0 ? "ham_st1" : "ham_st0", 14, 95);
    // planned shovels: lumps waiting above the scuttle
    if (!an) for (var cn = 0; cn < dz.coalN; cn++) dzImg("coal", 48 + (cn % 6) * 8, 86 - Math.floor(cn / 6) * 6 + (cn % 2));
    dz.pending.forEach(function (c) { c.fly = Math.min(1, c.fly + dt * 2.5); if (c.fly < 1) dzImg("coal", 20 + (c.tx - 20) * c.fly - 4, 118 - Math.sin(c.fly * Math.PI) * 26 + (c.ty - 118) * c.fly - 4); });
    dz.pending = dz.pending.filter(function (c) { return c.fly < 1; });
    // the voyage along the left edge
    var SY = 20;
    for (var yy = SY; yy < 135; yy++) DR(0, yy, 15, 1, (yy + Math.floor(dz.flow * 6 * (an ? 1 + sr * 3 : .3))) % 7 === 0 ? "#6aaee0" : "#3a6ea4");
    DR(0, SY - 1, 16, 1, "#3a2414"); DR(0, SY, 15, 9, "#7cb860"); DR(0, SY + 8, 15, 2, "#e8d8a0"); DR(6, SY + 9, 3, 3, "#a87448"); DR(15, SY, 1, 135 - SY, "#3a2414");
    DR(3, SY + 2, 3, 5, "#ffffff"); DR(3, SY + 4, 3, 1, "#d8342a"); DR(3, SY + 1, 3, 1, "#ffd34a"); DR(9, SY + 3, 4, 3, "#c8463c"); DR(9, SY + 6, 4, 2, "#f4f0e6");
    dzImg("ship_up", 1, Math.round(98 - dz.prog * (98 - SY - 11)));
    dzSparkDraw(dt); dzc.restore();
    dzRaf = requestAnimationFrame(dzDraw);
  }
  // ---- outside: the Pausbacke sails through the leg ----
  function dzSea(t, dt) {
    var a = dz.anim, S = a.sea, kind = dz.route[dz.leg], lvl = a.r.lvl, sp = [0, 26, 58][lvl], fog = kind === "nebel";
    var tt = a.t - DZ_OUT; if (tt > DZ_STAMP - DZ_OUT) sp *= Math.max(0, 1 - (tt - (DZ_STAMP - DZ_OUT)) * 2);
    // what stops the ship: the iceberg in front, the pier at the end
    if (kind === "eis") { var stopX = lvl ? 64 : 42; S.ice = Math.min(stopX, S.ice + (lvl ? 40 + sp : 44) * dt); if (lvl && S.ice >= stopX && !S.bump) { S.bump = 1; dzShake(.5); dzBuzz([60, 30, 120]); beep([[110, .12], [80, .16]]); dzPop("Rums!", 62, 44, "r", 900); } if (S.ice >= stopX) sp = 0; }
    var last = dz.leg === dz.route.length - 1;
    if (last) { S.harb = Math.min(4, S.harb + Math.max(sp, 14) * dt); if (S.harb >= 4) sp = 0; } else if (dz.leg === 0) S.harb += sp * dt;
    S.x += sp * dt;
    for (var y = 0; y < 72; y++) DR(0, y, 180, 1, fog ? (y < 40 ? "#b8c4cc" : "#c8d2d8") : y < 24 ? "#8ec8ec" : y < 48 ? "#a8d6f2" : "#c6e6f8");
    for (var hx = -40; hx < 220; hx += 46) { var bx = ((hx + S.x * .25) % 230 + 230) % 230 - 40; for (var k = 0; k < 40; k++) { var hh = 8 * Math.sin(k / 40 * Math.PI); DR(bx + k, 70 - hh, 1, hh + 2, fog ? "#a0acb4" : "#7cb860"); } }
    for (var y2 = 72; y2 < 135; y2++) DR(0, y2, 180, 1, y2 < 80 ? "#4f8cc0" : y2 < 100 ? "#3e7ab8" : "#3a6ea4");
    for (var w = 0; w < 26; w++) { var wx = (((w * 37) + S.x * (1 + (w % 3) * .4)) % 200 + 200) % 200 - 10, wy = 76 + (w * 13) % 56; DR(wx, wy, 3 + w % 3, 1, "#bfe0f4"); }
    if (!fog) S.gulls.forEach(function (g, i) { g[0] = (g[0] + (12 + sp * .5) * dt + 200) % 200; var fx = g[0] - 10, fy = g[1] + Math.sin(t / 300 + i) * 2, up = Math.floor(t / 200 + i) % 2; DR(fx, fy + up, 2, 1, "#ffffff"); DR(fx + 2, fy + 1 - up, 1, 1, "#ffffff"); DR(fx + 3, fy + up, 2, 1, "#ffffff"); });
    if (kind === "hafen") dzImg("sv_harb", last ? S.harb - 4 : S.harb + 40, 34);
    // the ship, bobbing, with smoke from the funnels and a wake behind
    var bob = Math.round(Math.sin(t / 260) * (lvl ? 1 : .6)), SX = 62, SYY = 52 + bob;
    if (lvl && Math.random() < dt * (4 + lvl * 8)) S.puffs.push({ x: SX + 17 + Math.floor(Math.random() * 4) * 7, y: SYY, life: 1.6 });
    S.puffs = S.puffs.filter(function (p) { p.life -= dt; p.x += (14 + sp * .6) * dt; p.y -= 10 * dt; dzc.globalAlpha = Math.min(1, p.life); dzImg("puff", p.x - 4, p.y - 4); dzc.globalAlpha = 1; return p.life > 0; });
    if (sp > 1) for (var k2 = 0; k2 < 6; k2++) { var wk = (S.x * 2 + k2 * 9) % 40; DR(SX + 54 + wk, SYY + 21 + (k2 % 2), 3, 1, "#ffffff"); }
    dzImg("sv_ship", SX, SYY);
    if (kind === "eis") dzImg("sv_ice", S.ice - 36, 46);
    if (fog) { for (var c = 0; c < 6; c++) { dzc.globalAlpha = .75; dzImg("cloud", ((c * 47 + S.x * .8 + t / 60) % 240) - 40, 30 + (c % 3) * 22); } dzc.globalAlpha = .25; DR(0, 0, 180, 135, "#e4ecf2"); dzc.globalAlpha = 1; }
    // the route bar on top: every leg a tick, the ship moving along
    var n = dz.route.length, x0 = 34, x1 = 172, bw = (x1 - x0) / n;
    DR(x0 - 2, 4, x1 - x0 + 4, 9, "#3a2414");
    for (var i = 0; i < n; i++) { var oc = { voll: "#8ad86a", halb: "#ffd34a", stopp: "#ff7a6a" }[DZ_LEG[dz.route[i]].o]; DR(x0 + i * bw, 5, bw - 1, 7, i < dz.leg ? (dz.res[i] ? oc : "#7a6a60") : oc); if (i > dz.leg) { dzc.globalAlpha = .45; DR(x0 + i * bw, 5, bw - 1, 7, "#3a2414"); dzc.globalAlpha = 1; } }
    var mx = x0 + (dz.prog * n) * bw; DR(mx - 3, 2, 6, 13, "#3a2414"); DR(mx - 2, 3, 4, 11, "#fff8ec"); DR(mx - 1, 4, 2, 3, "#e8a040");
  }
  // the historic engine telegraph: black pointer with brass tip = the bridge's order for this leg, red pointer = what the engine is set to
  var DZ_TG = { x: DZ_TGX, y: DZ_TGY, r: 18 };
  var DZ_TGA = { stopp: -159, halb: -90, voll: -21 };
  function dzTelegraph(t, dt) {
    var X = DZ_TG.x, Y = DZ_TG.y, ring = dz.ringT > 0 ? Math.round(Math.sin(t / 30)) : 0;
    dz.ringT = (dz.ringT || 0) - dt;
    dzImg("tg_col", X - 9, Y + 20);
    var aw = DZ_TGA[dzOrder()] * Math.PI / 180;
    dz.tgw = dz.tgw == null ? aw : dz.tgw + (aw - dz.tgw) * Math.min(1, dt * 5);
    var hx = X + ring + Math.cos(dz.tgw) * 25, hy = Y + Math.sin(dz.tgw) * 25;
    dzLine(X + ring + Math.cos(dz.tgw) * 22, Y + Math.sin(dz.tgw) * 22, hx, hy, "#7a5a1a"); dzLine(X + ring + Math.cos(dz.tgw) * 22 + 1, Y + Math.sin(dz.tgw) * 22, hx + 1, hy, "#b88a2a");
    DR(hx - 2, hy - 2, 5, 5, "#3a2414"); DR(hx - 1, hy - 1, 3, 3, "#e8554a");
    dzImg("tg_face", X - 24 + ring, Y - 24);
    var lvl = dz.anim ? dz.anim.r.lvl : dz.red, tv = [-159, -90, -21][lvl] * Math.PI / 180;
    dz.tgr = dz.tgr == null ? tv : dz.tgr + (tv - dz.tgr) * Math.min(1, dt * 6);
    dzLine(X + ring, Y, X + ring + Math.cos(dz.tgr) * 13, Y + Math.sin(dz.tgr) * 13, "#d8342a"); dzLine(X + ring + 1, Y, X + ring + 1 + Math.cos(dz.tgr) * 12, Y + Math.sin(dz.tgr) * 12, "#d8342a");
    dzLine(X + ring, Y, X + ring + Math.cos(dz.tgw) * 17, Y + Math.sin(dz.tgw) * 17, "#3a2414"); dzLine(X + ring, Y + 1, X + ring + Math.cos(dz.tgw) * 16, Y + 1 + Math.sin(dz.tgw) * 16, "#3a2414");
    DR(X + ring + Math.cos(dz.tgw) * 15 - 1, Y + Math.sin(dz.tgw) * 15 - 1, 3, 3, "#e8b84a");
    DR(X + ring - 2, Y - 2, 5, 5, "#3a2414"); DR(X + ring - 1, Y - 1, 3, 3, "#e8b84a");
    var ok = lvl === DZ_ORD[dzOrder()].l;
    DR(X - 6 + ring, Y + 9, 13, 3, ok ? "#6fd04a" : (Math.floor(t / 300) % 2 ? "#e8554a" : "#7a2a20"));
    if (dz.ringT > 0 && Math.floor(t / 90) % 2) { for (var k = 0; k < 3; k++) { DR(X - 30 - k * 2, Y - 10 + k * 6, 3, 1, "#ffd34a"); DR(X + 28 + k * 2, Y - 10 + k * 6, 3, 1, "#ffd34a"); } }
  }
  // ---- running a leg ----
  function dzRun() {
    if (!dz || dz.anim || dz.done) return;
    var r = dzSim(dz);
    dz.anim = { t: 0, r: r, P0: dz.P / 10, W0: dz.W / 10, G0: dz.G, prog0: dz.prog, threw: 0 };
    dzGo.disabled = true; dzBanner(DZ_LEG[dz.route[dz.leg]].n + " …"); beep([[880, .06], [660, .08]]); dzBuzz(20);
    dz.anim.sea = { x: 0, ice: -50, harb: dz.leg === 0 ? 92 : -60, bump: 0, puffs: [], gulls: [[20, 18], [60, 26], [120, 14]] };
  }
  var DZ_AT = 4.6, DZ_OUT = 1.4, DZ_STAMP = 3.9;
  function dzAnimStep(dt) {
    var a = dz.anim; a.t += dt;
    // the hamster throws the planned coal one shovel after the other
    while (a.threw < dz.coalN && a.t > .1 + a.threw * .12) { a.threw++; dz.shovT = .1; dz.pending.push({ fly: 0, tx: 70 + Math.random() * 30, ty: 92 }); beep([[180, .03], [140, .03]]); dzBuzz(10); }
    if (!a.sparked && a.t > .5 && dz.coalN) { a.sparked = 1; dzSparks(86, 80, 10 + dz.coalN * 3); dzShake(.15); }
    if (!a.popP && a.t > 1.1) { a.popP = 1; var dP = (a.r.blow ? 10 : a.r.P) - Math.round(a.P0 * 10); dzPop((dP >= 0 ? "+" : "") + dP + " Druck", DZ_GAUGE.x, DZ_GAUGE.y + 22, dP >= 0 ? "g" : "r"); }
    if (!a.out && a.t > DZ_OUT && !a.left) { a.out = true; a.left = 1; var L = DZ_LEG[dz.route[dz.leg]]; dzPop(L.n + " · " + DZ_ORD[L.o].n, 90, 30, "title", 1500); }
    if (a.out && !a.stamped && a.t > DZ_STAMP) { a.stamped = 1; dzStamp(a.r); }
    if (dz.pumpN && Math.floor(a.t / .35) < dz.pumpN && dz.pumpT <= 0 && a.t > .2) { dz.pumpT = .25; beep([[260, .04], [330, .05]]); }
    var f = Math.max(0, Math.min(1, (a.t - .4) / .9)), e = f * f * (3 - 2 * f);
    var pEnd = a.r.blow ? 1.06 : a.r.P / 10; if (a.r.blow && a.t > 1.6) pEnd = .7;
    dz.dispP = a.P0 + (pEnd - a.P0) * e; dz.dispW = a.W0 + (a.r.W / 10 - a.W0) * e; dz.dispG = a.G0 + (a.r.G - a.G0) * Math.min(1, a.t / .8);
    var fo = Math.max(0, Math.min(1, (a.t - DZ_OUT) / (DZ_STAMP - DZ_OUT))); dz.prog = a.prog0 + fo / dz.route.length;
    if (a.r.blow && !a.blew && a.t > .9) { a.blew = 1; beep([[1200, .08], [1100, .08], [1000, .1]]); dzBanner("Pfffft! Das Sicherheitsventil bläst ab."); dzShake(.6); dzBuzz(250);
      for (var k = 0; k < 10; k++) dz.puffs.push({ x: 60 + Math.random() * 50, y: 4, vx: (Math.random() - .5) * 20, vy: -6, life: 1.2, k: "steam" }); }
    if (a.t >= DZ_AT) dzLegDone();
  }
  function dzStamp(r) {
    var o = DZ_ORD[DZ_LEG[dz.route[dz.leg]].o].l;
    if (r.ok) { dz.streak++; dzPop(r.blow ? "Geschafft" : "Perfekt!", 90, 62, "stamp ok", 1300); beep([[660, .05], [880, .05], [1175, .1]]); dzBuzz([20, 40, 20, 40, 60]); dzSparks(90, 60, 24, ["#ffd34a", "#ffffff", "#8ad86a"]);
      if (dz.streak >= 2) setTimeout(function () { if (dz) dzPop(dz.streak + "er-Serie!", 90, 86, "streak", 1100); }, 350); }
    else { dz.streak = 0; dzPop(r.lvl < o ? "Zu langsam!" : "Zu schnell!", 90, 62, "stamp bad", 1300); beep([[300, .1], [220, .16]]); dzBuzz(140); dzShake(.35); }
  }
  function dzLegDone() {
    var r = dz.anim.r, name = DZ_LEG[dz.route[dz.leg]].n;
    dz.P = r.P; dz.W = r.W; dz.G = r.G; dz.shovels += dz.coalN; if (r.blow) dz.blows++;
    dz.res[dz.leg] = r.ok; dz.leg++; dz.anim = null; dz.coalN = 0; dz.pumpN = 0; dz.lever = false;
    dz.dispP = dz.P / 10; dz.dispW = dz.W / 10; dz.dispG = dz.G; dz.prog = dz.leg / dz.route.length; dzGo.disabled = false;
    dzPlanDraw(); var tl = dzPlanEl.children[dz.leg - 1]; if (tl) tl.classList.add("just");
    if (dz.leg >= dz.route.length) { dzArrive(); return; }
    dz.ringT = 1.2; beep([[880, .06], [880, .06], [660, .08]]);
    var nx = DZ_LEG[dz.route[dz.leg]];
    dzBanner((r.ok ? "✔ " + name + " geschafft. " : "✘ " + name + ": " + (r.lvl < DZ_ORD[DZ_LEG[dz.route[dz.leg - 1]].o].l ? "zu langsam. " : "zu schnell! ")) + "Als Nächstes: " + nx.n + ", " + DZ_ORD[nx.o].n + ".");
  }
  function dzArrive() {
    dz.done = true; var M = dzL(); M.trips++;
    var good = dz.res.filter(Boolean).length;
    var s1 = good === dz.route.length, s2 = dz.blows === 0, s3 = dz.shovels <= dz.budget, n = (s1 ? 1 : 0) + (s2 ? 1 : 0) + (s3 ? 1 : 0); if (n > M.best) M.best = n;
    if (window.SudokuSave) window.SudokuSave();
    beep([[523, .06], [659, .06], [784, .06], [1047, .12]]); dzBanner("");
    var st = function (on, i) { return '<em class="dz-star' + (on ? " on" : "") + '" style="animation-delay:' + (.3 + i * .35) + 's">★</em>'; };
    [s1, s2, s3].forEach(function (on, i) { if (on) setTimeout(function () { beep([[660 + i * 220, .08]]); dzBuzz(30); }, 300 + i * 350); });
    dzCard.innerHTML = '<div class="fi-c"><p class="fi-h">Angelegt im Hafen!</p><span class="fi-st dz-stars">' + st(s1, 0) + st(s2, 1) + st(s3, 2) + '</span>' +
      '<p class="fi-s">' + (s1 ? "★" : "☆") + ' Jeder Abschnitt richtig (' + good + '/' + dz.route.length + ')</p><p class="fi-s">' + (s2 ? "★" : "☆") + ' Kein Abblasen' + (dz.blows ? " (" + dz.blows + "×)" : "") + '</p><p class="fi-s">' + (s3 ? "★" : "☆") + ' Sparsam: ' + dz.shovels + ' von ' + dz.budget + ' Schaufeln</p>' +
      '<div class="fi-row"><button type="button" class="fi-b2" data-a="end">Fertig</button><button type="button" class="fi-b" data-a="again">Noch eine Fahrt</button></div></div>';
    dzCard.hidden = false;
  }
  // ---- close-ups: every action is done by hand in its own scene ----
  var DZ_ZMSG = { coal: "Schaufel vom Kohlehaufen ins Feuer ziehen. Jede Schaufel macht Glut.", valve: "Rad kurbeln: im Uhrzeigersinn auf, dagegen zu. Eine Umdrehung pro Stufe.",
    pump: "Den Pumpenschwengel ganz runter und wieder hoch ziehen. Jeder Stoß bringt Wasser, kühlt aber 1 Druck weg.", lever: "Hebel runterziehen: lässt in diesem Abschnitt 3 Druck ab. Hoch schieben: zu." };
  function dzZoomOpen(k) {
    dz.zoom = k; dz.zd = { drag: false, vAcc: dz.red, la: null, pa: -30, pup: true, la2: dz.lever ? 62 : -62, shov: null, fly: [], flare: 0 };
    dzGo.textContent = "Fertig"; dzBanner(DZ_ZMSG[k]); beep([[660, .04], [880, .05]]);
  }
  function dzZoomClose() { dz.zoom = null; dzGo.textContent = "Los!"; dzHint(); }
  function dzThick(x0, y0, x1, y1, w, c, ck) { for (var o = -w; o <= w; o++) { var nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1; dzLine(x0 + nx / L * o, y0 + ny / L * o, x1 + nx / L * o, y1 + ny / L * o, Math.abs(o) === w ? ck : c); } }
  function dzZoomDraw(t, dt) {
    var z = dz.zoom, d = dz.zd, fl = Math.floor(t / 180) % 2;
    if (z === "coal") {
      dzImg("z_coal", 0, 0);
      var glut = Math.floor(dz.G / 2) + dz.coalN; d.flare = Math.max(0, d.flare - dt);
      var lv = Math.max(1, Math.min(5, Math.round(glut * 1.1 + (d.flare > 0 ? 1 : 0))));
      dzImg("zf" + lv + "_" + fl, 94, 34);
      d.fly = d.fly.filter(function (c) { c.f += dt * 2.2; var x = c.x0 + (130 - c.x0) * c.f, y = c.y0 + (80 - c.y0) * c.f - Math.sin(c.f * Math.PI) * 24; dzImg("coal", x + c.dx, y + c.dy); return c.f < 1; });
      for (var i = 0; i < dz.coalN; i++) dzImg("coal", 30 + i * 9, 6);
      var sh = d.shov; dzImg(sh ? "zsh1" : "zsh0", sh ? sh[0] - 10 : 40, sh ? sh[1] - 10 : 82);
    } else if (z === "valve") {
      dzImg("z_valve", 0, 0);
      var v = d.vAcc, sy = Math.round(58 - v * 18);
      DR(88, 60 - v * 10 - 14, 4, 14 + v * 10, "#7a7f86"); DR(88, 60 - v * 10 - 14, 1, 14 + v * 10, "#a8aeb6");     // the stem rises as it opens
      var f8 = ((Math.round(-v * 2 * Math.PI / (Math.PI / 16)) % 8) + 8) % 8;
      dzImg("zw" + f8, 42, 15);
      DR(120, sy - 3, 6, 7, "#3a2414"); DR(121, sy - 2, 4, 5, "#fff8ec"); DR(118, sy, 2, 1, "#3a2414");
      var lt = Math.round(v); DR(160, [58, 40, 22][lt] - 1, 3, 7, "#fff8ec");
      var fr2 = v - Math.floor(v); if (v < 2 && fr2 > .01) for (var q = 0; q < 48; q++) { if (q / 48 > fr2) break; var qa = -Math.PI / 2 + q / 48 * Math.PI * 2; DR(90 + Math.cos(qa) * 45 - 1, 60 + Math.sin(qa) * 42 - 1, 3, 3, "#ffd34a"); }
    } else if (z === "pump") {
      dzImg("z_pump", 0, 0);
      var W = Math.min(10, dz.W + 3 * dz.pumpN), wy = Math.round(122 - W * 10);
      DR(140, wy, 16, 122 - wy, "#3e7ab8"); DR(140, wy, 16, 1, "#bfe0f4"); DR(142, wy + 1, 2, 121 - wy, "#6aaee0");
      for (var k = 1; k < 10; k++) DR(136, 122 - k * 10, 4, 1, "#7a5a1a");
      DR(136, 122 - 30 - 1, 4, 3, "#c8463c");
      var a = d.pa * Math.PI / 180, px = 80, py = 30, ex = px + Math.cos(a) * 64, ey = py + Math.sin(a) * 64;
      var rod = py + Math.sin(a) * 8; DR(76, rod, 8, 46 - rod, "#7a7f86");
      dzThick(px - Math.cos(a) * 10, py - Math.sin(a) * 10, ex, ey, 2, "#5a6068", "#3a2414");
      DR(ex - 5, ey - 5, 11, 11, "#3a2414"); DR(ex - 4, ey - 4, 9, 9, "#3e7ab8"); DR(ex - 3, ey - 3, 3, 3, "#a8d0f0");
      DR(px - 3, py - 3, 7, 7, "#3a2414"); DR(px - 2, py - 2, 5, 5, "#e8b84a");
      for (var n = 0; n < dz.pumpN; n++) { var dx = 30 + n * 12; DR(dx + 1, 6, 4, 1, "#3a2414"); DR(dx, 7, 6, 8, "#3a2414"); DR(dx + 1, 7, 4, 7, "#4f8cc0"); DR(dx + 1, 8, 1, 2, "#bfe0f4"); }
    } else if (z === "lever") {
      dzImg("z_lever", 0, 0);
      var b = d.la2 * Math.PI / 180, lx = 62 + Math.cos(b) * 56, ly = 66 + Math.sin(b) * 56;
      dzThick(62, 66, lx, ly, 2, "#5a6068", "#3a2414");
      DR(lx - 6, ly - 6, 13, 13, "#3a2414"); DR(lx - 5, ly - 5, 11, 11, "#f6c84a"); DR(lx - 4, ly - 4, 3, 3, "#fff2b0");
      DR(58, 62, 9, 9, "#3a2414"); DR(59, 63, 7, 7, "#e8b84a");
      if (dz.lever && Math.random() < dt * 12) dz.puffs.push({ x: 133 + (Math.random() - .5) * 6, y: -2, vx: (Math.random() - .5) * 16, vy: 10, life: 1.2, k: "steam" });
      dz.puffs = dz.puffs.filter(function (p) { p.life -= dt; p.y += (p.vy || -14) * dt; p.x += p.vx * dt; if (p.life > 0) dzImg(p.k, p.x - 8, p.y); return p.life > 0; });
    }
  }
  function dzZoomDown(p) {
    var z = dz.zoom, d = dz.zd;
    if (z === "coal") {
      if (p[1] < 18 && p[0] > 26 && p[0] < 30 + dz.coalN * 9 + 4 && dz.coalN > 0) { dz.coalN--; beep([[300, .03]]); return; }
      if (p[0] < 84 && p[1] > 70) { d.shov = p; d.drag = true; beep([[150, .04]]); dzBuzz(8); }
    } else if (z === "valve") { d.drag = true; d.la = Math.atan2(p[1] - 60, p[0] - 90); }
    else if (z === "pump") { if (p[1] < 18 && dz.pumpN > 0 && p[0] > 26 && p[0] < 30 + dz.pumpN * 12) { dz.pumpN--; beep([[300, .03]]); return; } d.drag = true; dzZoomMove(p); }
    else if (z === "lever") { d.drag = true; dzZoomMove(p); }
  }
  function dzZoomMove(p) {
    var z = dz.zoom, d = dz.zd; if (!d.drag) return;
    if (z === "coal") d.shov = p;
    else if (z === "valve") {
      var a = Math.atan2(p[1] - 60, p[0] - 90), da = a - d.la; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; d.la = a;
      var nv = Math.max(0, Math.min(2, d.vAcc + da / (2 * Math.PI)));
      if (Math.floor(nv * 8) !== Math.floor(d.vAcc * 8)) { beep([[nv > d.vAcc ? 520 : 440, .015]]); dzBuzz(6); }
      if (Math.round(nv) !== Math.round(d.vAcc) && Math.abs(nv - Math.round(nv)) < .5) { var st2 = Math.round(nv); if (Math.abs(nv - st2) < .02 || Math.floor(nv) !== Math.floor(d.vAcc)) {} }
      if (Math.floor(nv) !== Math.floor(d.vAcc) || (nv === 2 && d.vAcc < 2) || (nv === 0 && d.vAcc > 0)) { var lv2 = nv > d.vAcc ? Math.floor(nv) : Math.ceil(nv); dzBuzz(35); dzShake(.12); beep([[880, .05]]); dzPop(["Zu", "Halb", "Voll"][lv2], 90, 14, lv2 === 2 ? "g" : lv2 === 1 ? "o" : "r", 900); dzSparks(90, 60, 8, ["#ffffff", "#ffd34a", "#fff6e4"]); }
      d.vAcc = nv;
    } else if (z === "pump") {
      var pa = Math.atan2(p[1] - 30, p[0] - 80) * 180 / Math.PI; d.pa = Math.max(-32, Math.min(28, pa));
      if (d.pa < -24) d.pup = true;
      if (d.pa > 22 && d.pup) { d.pup = false; if (dz.pumpN < 3) { dz.pumpN++; beep([[260, .05], [330, .06]]); dzBuzz(35); dzShake(.15); dzSparks(148, Math.round(122 - Math.min(10, dz.W + 3 * dz.pumpN) * 10), 14, ["#bfe0f4", "#ffffff", "#6aaee0"]); dzPop("+3 Wasser", 120, 40, "b"); dzPop("−1 Druck", 120, 54, "r"); } else beep([[200, .03]]); }
    } else if (z === "lever") {
      var la = Math.atan2(p[1] - 66, p[0] - 62) * 180 / Math.PI; d.la2 = Math.max(-62, Math.min(62, la));
    }
  }
  function dzZoomUp(p) {
    var z = dz.zoom, d = dz.zd; if (!d.drag) return; d.drag = false;
    if (z === "coal") {
      if (p && p[0] > 90 && p[0] < 170 && p[1] > 30 && p[1] < 108) {
        if (dz.coalN < 8) { dz.coalN++; d.flare = .6; dzSparks(130, 70, 22); dzShake(.25); dzBuzz([15, 30, 25]); dzPop("+1 Glut", 130, 34, "o"); for (var k = 0; k < 4; k++) d.fly.push({ f: 0, x0: p[0] - 8, y0: p[1] - 6, dx: (Math.random() - .5) * 12, dy: (Math.random() - .5) * 8 }); beep([[180, .05], [120, .06], [90, .08]]); } else beep([[200, .03]]);
      }
      d.shov = null;
    } else if (z === "valve") {
      var nv = Math.round(d.vAcc); d.vAcc = nv; if (nv !== dz.red) { dz.red = nv; beep([[700, .05]]); }
    } else if (z === "lever") {
      var on = d.la2 > 20; d.la2 = on ? 62 : -62; if (on !== dz.lever) { dz.lever = on; beep(on ? [[1400, .05], [1200, .2]] : [[600, .05]]); dzBuzz(on ? [40, 20, 60] : 25); dzShake(on ? .3 : .1); if (on) { dzPop("−3 Druck", 133, 40, "r"); for (var k = 0; k < 8; k++) dz.puffs.push({ x: 133 + (Math.random() - .5) * 10, y: -2, vx: (Math.random() - .5) * 40, vy: 20, life: 1.2, k: "steam" }); } }
    } else if (z === "pump") d.pa = -30;
  }
  function dzZoomTick(dt) { var d = dz.zd; if (dz.zoom === "valve" && !d.drag) d.vAcc += (dz.red - d.vAcc) * Math.min(1, dt * 10); if (dz.zoom === "pump" && !d.drag) d.pa += (-30 - d.pa) * Math.min(1, dt * 6); }
  // ---- touch: planning ----
  function dzPt(e) { var r = dzCv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 180, (e.clientY - r.top) / r.height * 135]; }
  function inR(p, r) { return p[0] >= r.x0 && p[0] <= r.x1 && p[1] >= r.y0 && p[1] <= r.y1; }
  function dzFirst(k, t) { if (!dz.seen[k]) { dz.seen[k] = 1; dzBanner(t); return true; } return false; }
  dzCv.addEventListener("pointerdown", function (e) {
    if (!dz || dz.done || dz.anim || !dzCard.hidden) return; e.preventDefault(); var p = dzPt(e), said = false;
    if (dz.zoom) { try { dzCv.setPointerCapture(e.pointerId); } catch (er) {} dzZoomDown(p); return; }
    if (inR(p, DZ_CROW) && dz.coalN > 0) { dz.coalN--; beep([[300, .03]]); }
    else if (inR(p, DZ_DROW) && dz.pumpN > 0) { dz.pumpN--; beep([[300, .03]]); }
    else if (p[0] > 124 && Math.abs(p[1] - DZW.red.y) < 18) { dzZoomOpen("valve"); return; }
    else if (p[0] > 124 && Math.abs(p[1] - DZW.yellow.y) < 18) { dzZoomOpen("lever"); return; }
    else if (p[0] > 124 && Math.abs(p[1] - DZW.blue.y) < 18) { dzZoomOpen("pump"); return; }
    else if (inR(p, DZ_FIRE) || DZ_COAL.some(function (r) { return inR(p, r); })) { dzZoomOpen("coal"); return; }
    else return;
    if (!said) dzHint();
  });
  dzCv.addEventListener("pointermove", function (e) { if (dz && dz.zoom) { e.preventDefault(); dzZoomMove(dzPt(e)); } });
  dzCv.addEventListener("pointerup", function (e) { if (dz && dz.zoom) dzZoomUp(dzPt(e)); });
  dzCv.addEventListener("pointercancel", function () { if (dz && dz.zoom) dzZoomUp(null); });
  dzGo.addEventListener("click", function (e) { e.stopPropagation(); if (dz && dz.zoom) dzZoomClose(); else dzRun(); });
  dzCard.addEventListener("click", function (e) {
    e.stopPropagation(); var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.a === "again") { dz = dzNew(); dzCard.hidden = true; dzStart(); }
    else steamEnd();
  });
  function dzStart() { dz.zoom = null; dzGo.textContent = "Los!"; dzPlanDraw(); dzGo.disabled = false; dzBanner("Brücke: " + DZ_ORD[dzOrder()].n + " aus dem Hafen. Kohle schaufeln, rotes Rad stellen, dann Los!"); }
  function steamGame() {
    return new Promise(function (resolve) {
      dz = dzNew(); dzEl.hidden = false; dzOpen = true; document.body.classList.add("dz-on"); dzCard.hidden = true; dz.resolve = resolve;
      dzStart(); dzRaf = requestAnimationFrame(dzDraw);
    });
  }
  function steamEnd() { if (!dzOpen) return; dzGo.textContent = "Los!"; dzOpen = false; document.body.classList.remove("dz-on"); dzMsg.textContent = ""; cancelAnimationFrame(dzRaf); dzEl.hidden = true; dzCard.hidden = true; var r = dz && dz.resolve; dz = null; if (r) r(); }
  dzEl.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); steamEnd(); });
  var _dz_interrupt = interrupt; interrupt = function () { if (dzOpen) steamEnd(); return _dz_interrupt.apply(this, arguments); };
  var dzPic = xEl("button", "dz-pic", document.getElementById("room")); dzPic.type = "button"; dzPic.setAttribute("aria-label", "Bild mit Dampfer");
  dzPic.innerHTML = '<img src="' + DZ.pic + '" alt="">'; place(dzPic, 90, 14, 24);
  async function steamSeq() {
    front({ eyes: "happy", mouth: "grin", paws: "up" }); say(N() + " träumt sich in den Maschinenraum der MS Pausbacke."); await wait(700);
    await steamGame(); front({ eyes: "happy", mouth: "smile" }); say(N() + " wischt sich den Ruß von der Nase.");
  }
  dzPic.addEventListener("click", function (e) { e.stopPropagation(); if (decor || s.asleep) return; if (busy && !interruptible()) return; if (busy) interrupt(); act("steam", steamSeq); });
  window.__steam = { open: function () { steamGame(); }, st: function () { return dz && { P: dz.P, W: dz.W, G: dz.G, leg: dz.leg, route: dz.route, res: dz.res, red: dz.red, coalN: dz.coalN, pumpN: dz.pumpN, lever: dz.lever, shovels: dz.shovels, blows: dz.blows, budget: dz.budget, done: dz.done, sim: dzSim(dz) }; }, end: steamEnd, run: dzRun,
    zoom: function (k) { if (k) dzZoomOpen(k); else dzZoomClose(); }, set: function (o) { if (dz) Object.keys(o).forEach(function (k) { dz[k] = o[k]; }); } };
