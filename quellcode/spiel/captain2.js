
  // ===================== Kapitän, neu gebaut: drei Spuren von Anfang an =====================
  // The world is one straight fairway along +y, cut into rows of 8 units; the three lanes are columns 7 units apart.
  // Every turn the ship sails 1 (Stopp), 2 (Halbe) or 3 (Volle) rows. A lane change takes 0 rows at Stopp, 1 at Halbe and 4 at Volle,
  // so at Volle it only ends in the next turn. While the ship changes lanes it sweeps both lanes.
  // The 3D models, bridge, water, sky, binoculars and sounds of the first captain game are drawn as they are; only the game is new.
  var KP_LW = 7, KP_R = 8, KP_N = [1, 3, 5], KP_CH = [0, 1, 6], KP_DUR = [2600, 3200, 3600];
  var kp = null, kpRaf = 0, kpOpen = false, kpC0 = cpc;
  var kpEl = xEl("div", "bee-pov fi-pov cap-pov kp-pov", scene); kpEl.hidden = true;
  kpEl.innerHTML = '<canvas width="180" height="135" class="fi-cv cap-cv"></canvas><div class="fi-card" hidden></div><div class="cap-toast" hidden></div><button type="button" class="bp-x" aria-label="Brücke verlassen">×</button><button type="button" class="cap-glbtn" aria-label="Fernglas"></button>';
  var kpCv = kpEl.querySelector("canvas"), kpc = kpCv.getContext("2d"); kpc.imageSmoothingEnabled = false;
  var kpCard = kpEl.querySelector(".fi-card"), kpToast = kpEl.querySelector(".cap-toast"), kpGl = kpEl.querySelector(".cap-glbtn"); kpGl.style.backgroundImage = cpGlBtn.style.backgroundImage;
  var kpPanel = document.createElement("div"); kpPanel.className = "cap-panel"; scene.parentNode.insertBefore(kpPanel, cpPanel.nextSibling); kpPanel.style.display = "none";
  function kpCl(L) { return Math.max(-1, Math.min(1, L)); }
  function kpSpan(a, b) { var r = []; for (var L = Math.min(a, b); L <= Math.max(a, b); L++) r.push(L); return r; }
  var KP_HITS = { tug: "Rumms! Wir rammen den Schlepper!", quay: "Rumms an die Kaimauer!", fogb: "Rumms! Ein Fischerboot im Nebel gerammt!" };

  // ---- the three levels: what lies in which lane and row ----
  var KP_LV = [
    { key: "abfahrt", s: "hafen", sky: "day", name: "Ablegen in Southamsterton", rows: 14, start: 1, harbour: 10,
      tx: "Wir liegen rechts am Kai. Voraus warten zwei Schlepper in unserer Spur, links am Kai liegt die Mümmel. Im Hafen nicht zu schnell!",
      star: "Mit Pfiff abgelegt",
      build: function (ob, cell, B) {
        ob("quay", 11, 0, { y0: -30, y1: 80, crowd: 1 }); ob("quay", -15.5, 0, { y0: -30, y1: 82, crowd: 1 });
        ob("m3", 17, 4, { m: "shed", w: 6, l: 20 }); ob("m3", 17.5, 40, { m: "shed", w: 7, l: 18 }); ob("m3", -21.5, 22, { m: "shed", w: 7, l: 16 }); ob("m3", -22, 62, { m: "shed", w: 6, l: 14 });
        ob("m3", 13.2, 24, { m: "crane", side: 1 }); ob("m3", -17.7, 40, { m: "crane", side: -1 }); ob("m3", 13.4, 82, { m: "lhouse", c: "#d8463c" }); ob("m3", -17.4, 84, { m: "lhouse", c: "#4a9a3a" });
        cell(3, 1, "tug", { a: .35 }); cell(4, 1, "tug", { a: -.25, dx: .6 });
        var mum = ob("ship", -11.6, 50, { a: 0 }); kp.mum = { o: mum, trig: 0, px: -11.6, py: 57.4 };
        [[-1, 5, 1], [-1, 6, 1], [0, 5, 2], [0, 6, 2]].forEach(function (m) { cell(m[1], m[0], "mum", { need: m[2], noObj: 1 }); });
        cell(12, 0, "boat", { a: .5 });
        B.push({ k: "land", b0: -1.3, b1: -.45 }, { k: "land", b0: .35, b1: 1.2 });
      } },
    { key: "solent", s: "kanal", sky: "day", name: "Durch den Kernsund", rows: 28, start: 0, harbour: 0,
      tx: "Die Rinne zwischen den Tonnen ist voller Sandbänke und Fischerboote. Bei Volle Fahrt dauert der Spurwechsel lange. Vorn wartet das Lotsenboot.",
      star: "Lotse übergeben",
      build: function (ob, cell, B) {
        [-1, 1].forEach(function (sd) { var ins = [], outs = [], si = [], so = [];
          for (var y = -40; y <= 260; y += 8) { var wv = 1 + Math.sin(y * .09 + sd) * .6; ins.push([sd * (12.5 + wv * .6), y]); outs.push([sd * 26, y]); si.push([sd * (14.5 + wv), y]); so.push([sd * (17.5 + wv * 1.5), y]); }
          ob("shoal", 0, 0, { pts: ins.concat(outs.reverse()), sand: si.concat(so.reverse()) }); });
        for (var r = 1; r < 34; r += 3) { ob("buoyR", -10.6, r * KP_R + 4); ob("buoyG", 10.6, r * KP_R + 4); }
        kp.bank(-1, 5, 7); cell(9, 0, "boat", { net: 1, a: .4 }); cell(9, 1, "boat", { net: 1, a: -.6 });
        kp.bank(1, 13, 16); cell(16, -1, "boat", { net: 1, a: .2 });
        cell(21, 1, "pilot", { task: 1, a: 0 });
        kp.bank(-1, 24, 26);
        ob("tower", -22, 150); B.push({ k: "land", b0: .25, b1: 1.3 }, { k: "land", b0: -1.5, b1: -.7 });
      } },
    { key: "nebel", s: "nebel", sky: "fog", name: "Nebel im Pfotenkanal", rows: 30, start: 0, harbour: 0,
      tx: "Dichter Nebel. Was voraus treibt, zeigt nur das Fernglas. Die Pfeife warnt Fischerboote in unserer Spur, dann weichen sie aus.",
      star: "Zwei Dinge im Nebel erkannt",
      build: function (ob, cell, B) {
        cell(5, 0, "wood", { unk: 1 }); cell(7, 1, "bottle", { unk: 1, find: 1, soft: 1 });
        cell(10, -1, "fogb", { a: .4 }); cell(12, 0, "dolph", { unk: 1, ani: 1, find: 1, soft: 1 });
        cell(15, 1, "wood", { unk: 1 }); cell(15, -1, "bottle", { unk: 1, find: 1, soft: 1 });
        cell(18, 0, "fogb", { a: -.3 }); cell(21, -1, "wood", { unk: 1 }); cell(21, 0, "wood", { unk: 1, dx: .4 });
        cell(24, 1, "bottle", { unk: 1, find: 1, soft: 1 }); cell(26, 0, "fogb", { a: .2 }); cell(28, 1, "wood", { unk: 1 });
      } }
  ];
  function kpLvl() { return KP_LV[kp.li]; }

  // ---- the render state the drawing code of the first game reads ----
  function kpRS() { var d = kpLvl(); return { route: [{ k: d.key, s: d.s }], leg: 0, info: [{}], anc: [{ x: 0, y: 0, h: 0 }], O: [], B: [], px: 0, py: 0, h: 0, lvl: 1, rud: 0, wh: false, glass: null, anim: null,
    shake: 0, fx: [], swim: [], deckIce: null, castOff: 1, intro: false, done: false, found: [], newF: [], d: 0, res: [], hits: 0, tips: 0, route0: 1 }; }
  function kpStart(li) {
    kp = { li: li, row: 0, lane: 0, tr: null, vis: null, v: 0, turns: 0, hits: 0, inc: 0, cells: [], anim: null, pre: "", tips: 3, tip: null, whFirst: false, found0: 0, task: false, taskMiss: false, card: true, moored: li === 0 };
    var d = kpLvl(); kp.lane = d.start; cp = kpRS(); cp.px = kp.lane * KP_LW; cp.lvl = li === 0 ? 1 : 2;
    var ob = function (k, x, y, o) { var r = Object.assign({ k: k, x: x, y: y, leg: 0, seen: false, r: 2.6 }, o || {}); cp.O.push(r); return r; };
    var cell = function (row, lane, k, o) { o = o || {}; var c = { row: row, lane: lane, k: k, live: true, need: o.need, task: o.task, soft: o.soft, fogb: k === "fogb" };
      if (!o.noObj) c.o = ob(k === "fogb" ? "boat" : k, lane * KP_LW + (o.dx || 0), row * KP_R + 2.5, { a: o.a || 0, unk: o.unk, ani: o.ani, find: o.find, net: o.net, cell: c });
      kp.cells.push(c); return c; };
    kp.bank = function (L, a, b) { var top = [], bot = [], sa = [], sb = [], y0 = a * KP_R - 1.5, y1 = b * KP_R + 6.5, c = L * KP_LW;
      for (var y = y0 - 4; y <= y1 + 4; y += 2) { var e = Math.max(0, 1 - Math.pow((y - (y0 + y1) / 2) / ((y1 - y0) / 2 + 4), 2)), es = Math.max(0, 1 - Math.pow((y - (y0 + y1) / 2) / ((y1 - y0) / 2 + .5), 2)), w = 3.6 * Math.sqrt(e), ws = 2.8 * Math.sqrt(es) * (1 + Math.sin(y * 1.3) * .1);
        top.push([c - w, y]); bot.push([c + w, y]); sa.push([c - ws, y]); sb.push([c + ws, y]); }
      ob("shoal", 0, 0, { pts: top.concat(bot.reverse()), sand: sa.concat(sb.reverse()) }); for (var r = a; r <= b; r++) cell(r, L, "zone", { noObj: 1 }); };
    d.build(ob, cell, cp.B); cp.B.forEach(function (b) { b.leg = 0; });
    kp.par = (kpSolve(kpState()) || { d: 12 }).d + 1;
    kpPose(0); kpIntro();
  }
  function kpState() { return { row: kp.row, lane: kp.lane, tr: kp.tr ? { from: kp.tr.from, to: kp.tr.to, left: kp.tr.left, tot: kp.tr.tot } : null, task: kp.task, trig: kp.mum ? kp.mum.trig : 0 }; }

  // ---- the rules, as a pure function: what happens if this turn is sailed like this ----
  function kpHaz(row, L, spd, trig) {
    for (var i = 0; i < kp.cells.length; i++) { var c = kp.cells[i]; if (!c.live || c.soft || c.row !== row || c.lane !== L) continue;
      if (c.k === "mum" && !(spd >= c.need || trig >= c.need)) continue; return c; } return null; }
  function kpSim(st, delta, spd) {
    var row = st.row, lane = st.lane, tr = null, n = KP_N[spd], trig = st.trig || 0;
    if (st.tr) { var nl = Math.min(st.tr.left, KP_CH[spd]); tr = { from: st.tr.from, to: st.tr.to, left: nl, tot: st.tr.tot - st.tr.left + nl }; }   // a faster bell cannot make it slower, a slower one finishes it sooner
    if (!tr && delta) { var to = kpCl(lane + delta); if (to !== lane) tr = { from: lane, to: to, left: KP_CH[spd], tot: KP_CH[spd] }; }
    if (tr && tr.left <= 0) { lane = tr.to; tr = null; }
    if (kp.mum && spd >= 1 && row <= 5 && row + n >= 4) trig = Math.max(trig, spd);   // passing the Mümmel at speed: our suction pulls her stern out
    for (var k = 1; k <= n; k++) { var r = row + k, occ = tr ? [tr.from + Math.round(Math.min(1, (tr.tot - tr.left + .5) / tr.tot) * (tr.to - tr.from))] : [lane];   // while gliding across, the ship counts in the lane it is mostly in
      for (var j = 0; j < occ.length; j++) { var h = kpHaz(r, occ[j], spd, trig); if (h) return { row: r - 1, lane: tr ? (occ[j] === tr.from ? tr.to : tr.from) : lane, tr: null, hit: h, hitRow: r, k: k, trig: trig, task: st.task }; }
      if (tr) { tr.left--; if (tr.left <= 0) { lane = tr.to; tr = null; } } }
    var res = { row: row + n, lane: lane, tr: tr, hit: null, trig: trig, task: st.task }, T = kpTask();
    if (T && !st.task && spd === 0 && !tr && (res.row === T.row || res.row === T.row - 1) && Math.abs(lane - T.lane) === 1) res.task = true;
    return res;
  }
  function kpTask() { for (var i = 0; i < kp.cells.length; i++) if (kp.cells[i].task) return kp.cells[i]; return null; }
  // the shortest clean way to the end of the level (the first officer's advice, and the timetable)
  function kpSolve(from) {
    var d = kpLvl(), T = kpTask(), key = function (s) { return s.row + "|" + s.lane + "|" + (s.tr ? s.tr.from + ":" + s.tr.to + ":" + s.tr.left + ":" + s.tr.tot : "-") + "|" + (s.task ? 1 : 0) + "|" + s.trig; }, Q = [{ s: from, f: null, d: 0 }], seen = {};
    seen[key(from)] = 1;
    for (var qi = 0; qi < Q.length && qi < 20000; qi++) { var cur = Q[qi], s = cur.s;
      for (var spd = 2; spd >= 0; spd--) { var ds = s.tr ? [0] : [0, -1, 1, -2, 2];
        for (var di = 0; di < ds.length; di++) { var dl = ds[di]; if (dl && kpCl(s.lane + dl) === kpCl(s.lane + dl - Math.sign(dl))) continue;
          var r = kpSim(s, dl, spd); if (r.hit || spd === 2 && s.row < d.harbour) continue;
          if (T && !r.task && r.row > T.row) continue;
          var ns = { row: r.row, lane: r.lane, tr: r.tr, task: r.task, trig: r.trig }, f = cur.f || { spd: spd, d: dl };
          if (ns.row >= d.rows) return { d: cur.d + 1, f: f };
          var kk = key(ns); if (seen[kk]) continue; seen[kk] = 1; Q.push({ s: ns, f: f, d: cur.d + 1 }); } } }
    return null;
  }

  // ---- where the ship is: the row it has reached and how far across it has moved ----
  function kpLat(rho) { var v = kp.vis; if (!v) return kp.lane * KP_LW; return v.a + (v.b - v.a) * cpSm1((rho - v.r0) / (v.r1 - v.r0)); }
  function kpPose(rho) { var l = kpLat(rho), sl = (kpLat(rho + .05) - kpLat(rho - .05)) / .1 / KP_R; cp.px = l; cp.py = rho * KP_R; cp.h = 0; cp.d = rho; if (isNaN(l + rho + sl) && window.__kpErr) window.__kpErr('NaN pose ' + JSON.stringify([rho, kp.vis, kp.anim && kp.anim.res && kp.anim.res.hitRow])); }
  function kpPrep(spd, delta) {   // the lane change that this order would start, for the course line and the sailing
    var tr = kp.tr ? { to: kp.tr.to, left: Math.min(kp.tr.left, KP_CH[spd]) } : null, lat = kpLat(kp.row);
    if (!tr && delta) { var to = kpCl(kp.lane + delta); if (to !== kp.lane) tr = { to: to, left: KP_CH[spd] }; }
    return tr ? { a: lat, b: tr.to * KP_LW, r0: kp.row, r1: kp.row + Math.max(1, tr.left) } : kp.vis;
  }

  // ---- one turn ----
  function kpGo() {
    if (!kp || kp.anim || kp.card || cp.glass || kp.done) return;
    var spd = cp.lvl, dl = kp.tr ? 0 : cp.rud, d = kpLvl(), fog = d.sky === "fog";
    if (cp.wh) { dzWhistle(kp.turns === 0 && kp.li === 0 ? 2.2 : 1.2); if (kp.turns === 0) kp.whFirst = true;
      if (fog) { var occ = kpSpan(kp.lane, kp.tr ? kp.tr.to : kpCl(kp.lane + dl)), moved = 0;
        kp.cells.forEach(function (c) { if (!c.fogb || !c.live || c.row <= kp.row || c.row > kp.row + 8 || occ.indexOf(c.lane) < 0) return;
          var fr = [-1, 0, 1].filter(function (L) { return occ.indexOf(L) < 0 && !kpHaz(c.row, L, 0, 0); })[0]; if (fr == null) return; c.lane = fr; c.o.tx = fr * KP_LW; moved++; });
        if (moved) setTimeout(function () { kpSay("Ein Fischerboot hat uns gehört und weicht aus!"); }, 700); } }
    var res = kpSim(kpState(), dl, spd), vis = kpPrep(spd, dl);
    if (kp.mum && res.trig > kp.mum.trig) { kp.mum.go = res.trig; kp.mum.from = kp.mum.trig; }
    var v0 = Math.min(kp.v, 3 * (res.hit ? Math.max(.5, res.hitRow - kp.row - .45) : KP_N[spd])), n = res.hit ? res.hitRow - kp.row - .45 : KP_N[spd], v1 = res.hit ? Math.max(.6, v0) * 1.2 : spd ? KP_N[spd] : 0;
    kp.anim = { t0: 0, dur: KP_DUR[spd], spd: spd, r0: kp.row, n: n, v0: v0, v1: v1, res: res, dl: dl, cast: kp.moored };
    kp.vis = vis; kp.tip = null; kp.moored = false;
    if (kp.anim.cast) { var b1 = shipW(2.4, .7, 1); cpBurst([b1[0] + 1.8, b1[1], .2], 6, ["#ffffff", "#d8eef8"], 1.4, 3); }
    dzBell(spd === 0 ? 1 : spd === 1 ? 2 : 3); cpEngine(spd, kp.anim.dur / 1000, .3, kp.lastSpd == null ? 0 : kp.v > 0 ? kp.lastSpd : 0);
    kpPanelDraw(); kpKick();
  }
  function kpStep(t) {
    var A = kp.anim; if (!A.t0) A.t0 = t; if (cp.shake > 0) cp.shake -= .016;
    if (A.crash) { var C = A.crash, ct = t - C.t0, v = cpSm1((ct - 900) / (C.dur - 900)); kpPose(C.rho + (C.back - C.rho) * v); if (ct >= C.dur) kpEndTurn(); return; }
    var u = Math.min(1, (t - A.t0) / A.dur), n = A.n, a = A.v0, b = A.v1, dd = a * u + (3 * n - 2 * a - b) * u * u + (a + b - 2 * n) * u * u * u, rho = A.r0 + dd; kpPose(rho);
    if (kp.mum && kp.mum.go) { var M = kp.mum, ang = [0, -.42, -.7], tgt = ang[M.go], fr = ang[M.from || 0], e = cpSm1((rho - 3.3) / 2.2); M.o.a = fr + (tgt - fr) * e; M.o.x = M.px - 7.4 * Math.sin(M.o.a); M.o.y = M.py - 7.4 * Math.cos(M.o.a); if (!M.told && e > .2) { M.told = 1; beep([[220, .05], [140, .09]]); dzBuzz([30]); kpSay("Unser Sog reißt die Mümmel los!"); } }
    if (A.spd && Math.random() < (A.spd === 2 ? .9 : .45)) { var sd0 = Math.random() < .5 ? -1 : 1, bp = shipW(sd0 * (1.1 + Math.random() * .5), 2.0, .2); cp.fx.push({ x: bp[0], y: bp[1], z: bp[2], vx: Math.cos(cp.h) * sd0 * (1.5 + Math.random() * 1.5), vy: -Math.sin(cp.h) * sd0 * 2, vz: 2 + Math.random() * 2, l: .6, c: Math.random() < .5 ? "#ffffff" : "#d8eef8" }); }
    if (A.spd === 2 && rho < kpLvl().harbour && !A.wet) { A.wet = 1; setTimeout(function () { var q = [11, cp.py + 6, 1]; cpBurst(q, 14, ["#ffffff", "#d8eef8", "#a8d0e8"], 1.4, 5); }, 600); }
    if (u < 1) return;
    if (A.res.hit) return kpCrash(t);
    kpEndTurn();
  }
  function kpCrash(t) {
    var A = kp.anim, h = A.res.hit, k = h.k, sd = h.lane * KP_LW - cp.px; kp.hits++; cp.shake = 1.1; beep([[110, .14], [80, .2], [60, .25]]); dzNoise(.6, 300, .8, .3, .01, .4); dzBuzz([80, 40, 160]);
    kpSay(KP_HITS[k] || CP_HITS[k === "mum" ? "ship" : k] || "Rumms!");
    var cpt = shipW(Math.max(-1.5, Math.min(1.5, sd * .4)), 2.5, 1.0);
    cpBurst(cpt, 26, k === "zone" ? ["#8a6a4a", "#c8a87a", "#ffffff"] : ["#8a5a32", "#3a2414", "#c8945a", "#ffffff", "#e8e0d0"], 3.5, 4);
    if (k === "zone") cpBurst(cpt, 30, ["#6a5032", "#8a6a44", "#c8a87a"], 2.5, 3);
    if (/boat|fogb|pilot|tug/.test(k)) cpSwimmers(shipW(sd >= 0 ? 2.5 : -2.5, 3.5, 0), 2);
    if (h.o && k !== "zone") { h.o.kT = performance.now(); h.o.kDir = sd >= 0 ? 1 : -1; h.live = false; if (h.task) kp.taskMiss = true; }
    var settle = A.res.lane, rho = cp.d; kp.vis = { a: cp.px, b: settle * KP_LW, r0: rho, r1: A.res.hitRow - 1 };
    A.crash = { t0: t, dur: 2600, rho: rho, back: A.res.hitRow - 1 };
  }
  function kpEndTurn() {
    var A = kp.anim, r = A.res, d = kpLvl(), msg = "", T = kpTask();
    kp.row = r.row; kp.lane = r.lane; kp.tr = r.tr; kp.turns += r.hit ? 2 : 1; kp.lastSpd = A.spd; kp.v = r.hit ? 0 : A.v1;
    if (kp.mum) { kp.mum.trig = Math.max(kp.mum.trig, r.trig); kp.mum.go = 0; }
    if (!kp.tr) kp.vis = { a: kp.lane * KP_LW, b: kp.lane * KP_LW, r0: kp.row, r1: kp.row + 1 };
    if (r.hit) msg = "✘ " + (KP_HITS[r.hit.k] || CP_HITS[r.hit.k === "mum" ? "ship" : r.hit.k] || "Rumms!") + " Ein Zug verloren.";
    else if (A.spd === 2 && A.r0 < d.harbour) { kp.inc++; msg = "✘ Zu schnell im Hafen: Die Bugwelle hat die Zuschauer am Kai nass gemacht."; }
    if (T && r.task && !kp.task) { kp.task = true; msg = "✔ Der Lotse klettert ins Boot. Gute Fahrt!"; T.live = false; T.o.tx = T.o.x + 9; beep([[660, .05], [880, .08]]); }
    if (T && !kp.task && !kp.taskMiss && kp.row > T.row) { kp.taskMiss = true; kp.inc++; msg = "✘ Vorbeigefahren! Der Lotse muss jetzt mit nach Frankreich."; }
    kp.pre = msg; kp.anim = null; cp.wh = false; cp.rud = 0;
    if (kp.row >= d.rows) return kpEnd();
    kpPanelDraw(); kpKick();
  }

  // ---- drawing ----
  function kpDraw(t) {
    cpRaf = 0; if (kpRaf) cancelAnimationFrame(kpRaf); kpRaf = 0; if (!kp || !kpOpen) return;
    if (kp.anim) kpStep(t); if (!kp) return;
    var now = performance.now(), tw = false;
    cp.O.forEach(function (o) { if (o.tx != null) { o.x += (o.tx - o.x) * .05; if (Math.abs(o.tx - o.x) > .05) tw = true; else { o.x = o.tx; o.tx = null; } } });
    if (kp.anim || cp.glass || tw || cp.fx.length || now < (kp.busy || 0)) kpRaf = requestAnimationFrame(kpDraw);
    if (cp.glass) { cpDrawGlass(t); return; }
    try {
      var sky = cpSky(), sea = cpSeaPic(sky), sh = cp.shake > 0 ? Math.round(Math.sin(t / 30) * 2) : 0, off = (((-cp.h * 160) % 180) + 180) % 180, pitch = Math.round(Math.sin(t / 1400) * .6);
      cpc.setTransform(1, 0, 0, 1, 0, sh); cpc.fillStyle = CP_SEA[sky][0][0]; cpc.fillRect(0, 0, 180, 80); cpc.setTransform(1, 0, 0, 1, 0, sh + pitch);
      cpc.drawImage(sea, Math.round(off) - 180, 0); cpc.drawImage(sea, Math.round(off), 0); cpWater(t, sky, 0);
      cp.B.forEach(function (o) { cpc.save(); cpc.beginPath(); cpc.rect(0, -10, 180, CP_HZ + 11); cpc.clip(); cpBack(cpBW(o), sky); cpc.restore(); });
      cpSkyDraw(sky, t);
      if (!kp.card && !kp.done) { kpMarks(sky); kpStopZone(t); if (!kp.anim) kpCourse(); }
      cp.O.forEach(function (o) { if (o.seen || !(o.unk || o.ani || sky === "fog") || o.k === "m3" || o.k === "quay" || o.k === "shoal") return; var f = o.y - cp.py; if (f > 0 && f < 15) { o.seen = true; if (o.cell && !o.cell.soft && o.unk) kpSay(o.k === "wood" ? "Ausguck: Treibholz direkt voraus!" : "Ausguck: Achtung, voraus!"); } });   // close by, the lookout sees it with the naked eye
      if (kp.anim) kpChart();
      cpWorldDraw(t, false); cpGulls(t, sky); cpc.setTransform(1, 0, 0, 1, 0, sh); cpDeck(t); cpDeckIce(); kpRopes();
      if (sky === "fog") for (var fy = 0; fy < 80; fy++) { var al = fy < CP_HZ ? .72 : Math.max(0, .78 - (fy - CP_HZ) / 70); if (al > 0) { cpc.fillStyle = "rgba(226,232,236," + al.toFixed(2) + ")"; cpc.fillRect(0, fy, 180, 1); } }
      if (sky === "night") { cpc.fillStyle = "rgba(8,14,40,.28)"; cpc.fillRect(0, 0, 180, 80); }
      cpBridge(t); kpLamp(t);
      cpc.setTransform(1, 0, 0, 1, 0, 0);
    } catch (err) { if (window.__kpErr) window.__kpErr(err); }
  }
  function kpKick() { kp.busy = performance.now() + 6000; if (!kpRaf) kpRaf = requestAnimationFrame(kpDraw); }
  function kpRedraw() { if (!kpRaf) kpDraw(performance.now()); }
  // faint marks between the lanes, every half row, from the ship to ten rows ahead
  function kpMarks(sky) { var col = sky === "night" ? "rgba(200,220,255,.22)" : sky === "fog" ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.4)", r0 = Math.floor(cp.d);
    for (var r = r0; r < r0 + 11; r++) for (var hh = 0; hh < 2; hh++) [-.5, .5].forEach(function (m) { var p = cpProj(m * KP_LW, (r + hh * .5) * KP_R + 1); if (p && p.y > CAMV.hz + 1 && p.y < 80) { cpc.fillStyle = col; cpc.fillRect(Math.round(p.x) - (p.sz > 2 ? 1 : 0), Math.round(p.y), p.sz > 2 ? 3 : 1, 1); } }); }
  // the course this order would sail: a dotted line on the water, one dot more per row
  function kpCourse() { var spd = cp.lvl, vis = kpPrep(spd, kp.tr ? 0 : cp.rud), n = KP_N[spd], keep = kp.vis; kp.vis = vis;
    for (var i = 1; i <= n * 6; i++) { var rho = kp.row + i / 6, p = cpProj(kpLat(rho), rho * KP_R + 2.4); if (p && p.y < 80) mR(cpc, Math.round(p.x) - (p.sz > 2 ? 1 : 0), Math.round(p.y), p.sz > 2 ? 3 : 1, 1, i % 6 === 0 ? "#ffd34a" : "#fff0b0"); }
    var e = kp.row + n, pe = cpProj(kpLat(e), e * KP_R + 2.4), okS = spd === 0 && kpStopOK(e, Math.round(kpLat(e) / KP_LW)); if (pe) mR(cpc, Math.round(pe.x) - 2, Math.round(pe.y) - 1, 5, 3, okS ? "#7ae05a" : spd ? "#ffd34a" : "#d8463c"); kp.vis = keep; }
  // a green box on the water beside the pilot boat: stop here
  function kpStopZone(t) { var T = kpTask(); if (!T || kp.task || kp.taskMiss) return; var on = Math.floor(t / 400) % 2;
    [T.lane - 1, T.lane + 1].forEach(function (L) { if (L < -1 || L > 1) return; var x0 = L * KP_LW - 2.6, x1 = L * KP_LW + 2.6, y0 = (T.row - 1) * KP_R + 2.5, y1 = T.row * KP_R + 4;
      for (var u = 0; u <= 1.001; u += .08) [[x0 + (x1 - x0) * u, y0], [x0 + (x1 - x0) * u, y1], [x0, y0 + (y1 - y0) * u], [x1, y0 + (y1 - y0) * u]].forEach(function (q) { var p = cpProj(q[0], q[1]); if (p && p.y < 80 && p.y > CAMV.hz) mR(cpc, Math.round(p.x), Math.round(p.y), p.sz > 2 ? 2 : 1, 1, on ? "#7ae05a" : "#c8f8a8"); }); }); }
  function kpRopes() { if (!kp.moored) return; [[[2.2, .7], [11.45, 6.5]], [[2.45, -1.6], [11.45, 1.5]]].forEach(function (r) { var a = shipW(r[0][0], r[0][1], 1.45); cpRope3(a, [r[1][0], cp.py + r[1][1], 1.5], .25, "#e0d0a8"); }); }
  function kpLamp(t) { if (kp.card) return; var x0 = 79, y0 = 72, ln = Math.round(cp.px / KP_LW), tg = kp.tr ? kp.tr.to : kpCl(kp.lane + (kp.anim ? 0 : cp.rud)), blink = Math.floor(t / 280) % 2;
    if (kp.anim && kp.anim.res) tg = kp.anim.res.tr ? kp.anim.res.tr.to : kp.anim.res.lane;
    mR(cpc, x0, y0, 23, 7, "#2a1a10"); mR(cpc, x0 + 1, y0 + 1, 21, 5, "#6a4a2a"); mR(cpc, x0 + 1, y0 + 1, 21, 1, "#c8a040");
    for (var i = -1; i <= 1; i++) { var lx = x0 + 2 + (i + 1) * 7, on = i === ln, nx = i === tg && tg !== ln;
      mR(cpc, lx, y0 + 2, 5, 4, "#1a1008"); mR(cpc, lx + 1, y0 + 3, 3, 2, on ? "#ffd34a" : nx ? (blink ? "#f08a3a" : "#5a3a1a") : "#3a2a1a"); if (on) mR(cpc, lx + 1, y0 + 3, 1, 1, "#fff6c8"); } }

  // ---- the chart beside the message: the three lanes and the next twelve rows, as far as we know them ----
  var kpChartCv = null;
  function kpKnown(o, ahead) { if (!o) return true; if (o.seen) return true; if (o.unk || o.ani) return false; return !(kpLvl().sky === "fog" && ahead > 2.5); }
  function kpStopOK(row, lane) { var T = kpTask(); return T && !kp.task && !kp.taskMiss && (row === T.row || row === T.row - 1) && Math.abs(lane - T.lane) === 1; }
  function kpChart() {
    var cv = kpChartCv; if (!cv || !kp || !cp) return; var g = cv.getContext("2d"), R0 = Math.floor(kp.anim ? cp.d : kp.row), d = kpLvl(), T = kpTask(), fr = (kp.anim ? cp.d : kp.row) - R0;
    var X = function (L) { return 1 + (L + 1) * 8; }, Y = function (r) { return 49 - (r - R0 - fr) * 4; }, F = function (x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
    F(0, 0, 25, 52, "#3a2414"); F(1, 1, 23, 50, "#4a8ac0");
    g.save(); g.beginPath(); g.rect(1, 1, 23, 50); g.clip();
    for (var y = 1; y < 51; y += 2) { F(8, y, 1, 1, "#8ac0e0"); F(16, y, 1, 1, "#8ac0e0"); }
    if (d.rows - R0 < 14) { var fy = Y(d.rows) - 1; for (var xx = 1; xx < 24; xx++) F(xx, fy, 1, 2, (xx + (fy & 1)) % 2 ? "#ffffff" : "#3a2414"); }
    if (T && !kp.task && !kp.taskMiss) [T.lane - 1, T.lane + 1].forEach(function (L) { if (L < -1 || L > 1) return; var y0 = Y(T.row) - 3, x0 = X(L); g.strokeStyle = "#7ae05a"; g.lineWidth = 1; g.strokeRect(x0 + .5, y0 + .5, 6, 7); });
    kp.cells.forEach(function (c) { if (!c.live && !(c.task && !kp.task)) return; var a = c.row - kp.row; if (a < -1 || a > 13) return; var x0 = X(c.lane), y0 = Y(c.row) - 3;
      if (!kpKnown(c.o, a)) { F(x0 + 2, y0, 3, 4, "#a8b4c0"); F(x0 + 3, y0 + 1, 1, 1, "#3a4a5a"); return; }
      if (c.k === "zone") return F(x0, y0, 7, 4, "#d8c898");
      if (c.k === "mum") { if (kp.mum && (kp.mum.trig >= c.need)) return F(x0, y0, 7, 4, "#3a3034"); for (var q = 0; q < 7; q += 2) F(x0 + q, y0 + (q % 4 ? 0 : 2), 1, 2, "#e8a03a"); return; }
      var col = c.k === "pilot" ? "#ffd34a" : c.k === "wood" ? "#8a5a32" : c.soft ? "#5ab04a" : c.k === "tug" ? "#7a2418" : "#e04a3c";
      F(x0 + 1, y0 + 1, 5, 3, "#1a1008"); F(x0 + 2, y0 + 1, 3, 2, col); });
    if (!kp.anim && !kp.card && !kp.done) { var spd = cp.lvl, vis = kpPrep(spd, kp.tr ? 0 : cp.rud), n = KP_N[spd], keep = kp.vis; kp.vis = vis;
      for (var i = 1; i <= n * 4; i++) { var rho = kp.row + i / 4, lx = 1 + (kpLat(rho) / KP_LW + 1) * 8 + 3; F(lx, Y(rho), 1, 1, "#ffd34a"); }
      var er = kp.row + n, el = kpLat(er) / KP_LW, ok = spd === 0 && kpStopOK(er, Math.round(el)); F(1 + (el + 1) * 8 + 2, Y(er) - 1, 3, 3, ok ? "#7ae05a" : spd ? "#ffd34a" : "#d8463c"); kp.vis = keep; }
    var sx = 1 + (cp.px / KP_LW + 1) * 8 + 1.5; F(sx, 47, 4, 3, "#fff8ec"); F(sx + 1, 46, 2, 1, "#fff8ec");
    g.restore();
  }
  // ---- panel and cards ----
  function kpSay(t) { kpToast.textContent = t; kpToast.hidden = false; kpToast.classList.remove("pop"); void kpToast.offsetWidth; kpToast.classList.add("pop"); clearTimeout(kpSay.t); kpSay.t = setTimeout(function () { kpToast.hidden = true; }, 1800); }
  function kpTipTxt(f) { var to = kpCl(kp.lane + f.d), sp = ["Stopp", "Halbe Fahrt", "Volle Fahrt"][f.spd], ln = kp.tr ? "das Ruder liegen lassen" : to === kp.lane ? "die Spur halten" : "in die " + ["linke", "mittlere", "rechte"][to + 1] + " Spur"; return sp + " und " + ln + "."; }
  function kpPanelDraw() {
    if (!kp) return; var d = kpLvl(), busy = !!kp.anim, h = "";
    var st = '<div class="dz-plan kp-lvls">' + KP_LV.map(function (L, i) { return '<b class="kp-lt' + (i === kp.li ? " cur" : "") + '">' + (i + 1) + '</b>'; }).join("") + '<span class="kp-ln">' + d.name + '</span></div>';
    h += st;
    if (cp.glass) h += '<div class="dz-row"><div class="dz-msg">Zum Umsehen ziehen · am Ring des rechten Glases drehen, bis die beiden Hälften in der Mitte zusammenpassen</div><button type="button" class="dz-go cap-glx">Zurück</button></div>';
    else { var tr = kp.tr ? '<span class="kp-tr">Spurwechsel läuft noch ' + kp.tr.left + (kp.tr.left === 1 ? " Reihe" : " Reihen") + ', das Ruder liegt fest.</span>' : "",
        tip = kp.tip ? '<span class="cap-tipsay">Erster Offizier: „' + kp.tip + '“</span>' : "",
        foot = '<span class="cap-foot"><span class="cap-clock">⏱ Zug ' + kp.turns + ' · Plan ' + kp.par + '</span>' + (!busy && !kp.done && !kp.tip ? '<button type="button" class="ch cap-tip"' + (kp.tips > 0 ? "" : " disabled") + '>Offizier fragen ' + "●".repeat(kp.tips) + "○".repeat(3 - kp.tips) + '</button>' : "") + '</span>';
      var T = kpTask(), near = T && !kp.task && !kp.taskMiss && T.row - kp.row <= 7 ? '<span class="kp-tr kp-stop">Lotsenboot voraus! Mit Stopp im grünen Feld daneben anhalten.</span>' : "";
      h += '<div class="dz-row"><canvas class="kp-chart" width="25" height="52" aria-label="Seekarte"></canvas><div class="dz-msg cap-msg2">' + (kp.pre ? '<span class="dz-d">' + kp.pre + '</span> ' : "") + (kp.pre || near ? "" : d.tx) + near + tr + tip + foot + '</div><button type="button" class="dz-go cap-go"' + (busy ? " disabled" : "") + '>Los!</button></div>'; }
    kpPanel.innerHTML = h; kpChartCv = kpPanel.querySelector(".kp-chart"); kpChart(); kpGl.hidden = !!(busy || kp.card || kp.done); kpGl.classList.toggle("on", !!cp.glass);
  }
  function kpStars() { var d = kpLvl(), third = kp.li === 0 ? kp.whFirst : kp.li === 1 ? kp.task && !kp.taskMiss : cp.found.length - kp.found0 >= 2; return [kp.hits + kp.inc === 0, kp.turns <= kp.par, !!third]; }
  function kpMenu() {
    kp = kp || { li: 0 }; kp.card = true; var best = s.kpStars || {};
    kpCard.innerHTML = '<div class="fi-c dz-intro"><p class="fi-h">Kapitän der Pausbacke</p><p class="dz-route">Probefahrt mit drei Spuren</p>' +
      '<p class="fi-s">Steuerrad: Spur. Telegraf: Tempo. Je schneller, desto länger dauert ein Spurwechsel.</p>' +
      '<div class="cap-roles kp-pick">' + KP_LV.map(function (L, i) { var b = best[i] || 0; return '<button type="button" data-lv="' + i + '"><b>' + (i + 1) + ". " + L.name + '</b><small>' + "★".repeat(b) + "☆".repeat(3 - b) + '</small></button>'; }).join("") + '</div></div>';
    kpCard.hidden = false; kpPanel.innerHTML = ""; kpGl.hidden = true;
  }
  function kpIntro() { var d = kpLvl(); kp.card = true; kp.found0 = cp.found.length;
    kpCard.innerHTML = '<div class="fi-c dz-intro"><p class="fi-h">' + d.name + '</p><p class="dz-route">Level ' + (kp.li + 1) + ' · ' + d.rows + ' Reihen · Plan: ' + kp.par + ' Züge</p><p class="fi-s">' + d.tx + '</p>' +
      '<p class="fi-s">★ Keine Unfälle<br>★ Im Plan (' + kp.par + ' Züge)<br>★ ' + d.star + '</p><div class="fi-row"><button type="button" class="fi-b" data-a="go">' + (kp.li === 0 ? "Leinen los!" : "Los geht's") + '</button></div></div>';
    kpCard.hidden = false; kpPanelDraw(); kpRedraw(); }
  function kpEnd() { kp.done = true; var st = kpStars(), n = st.filter(Boolean).length, d = kpLvl(); s.kpStars = s.kpStars || {}; s.kpStars[kp.li] = Math.max(s.kpStars[kp.li] || 0, n); if (window.SudokuSave) window.SudokuSave();
    kpCard.innerHTML = '<div class="fi-c dz-intro"><p class="fi-h">' + (n === 3 ? "Meisterhaft!" : "Geschafft!") + '</p><p class="dz-route">' + "★".repeat(n) + "☆".repeat(3 - n) + '</p>' +
      '<p class="fi-s">' + (st[0] ? "★" : "☆") + " Keine Unfälle" + (kp.hits + kp.inc ? " (" + (kp.hits + kp.inc) + "×)" : "") + '<br>' + (st[1] ? "★" : "☆") + " " + kp.turns + " Züge, Plan " + kp.par + '<br>' + (st[2] ? "★" : "☆") + " " + d.star + '</p>' +
      '<div class="fi-row"><button type="button" class="fi-b2" data-a="menu">Übersicht</button><button type="button" class="fi-b2" data-a="again">Nochmal</button>' + (kp.li + 1 < KP_LV.length ? '<button type="button" class="fi-b" data-a="next">Weiter</button>' : "") + '</div></div>';
    kpCard.hidden = false; kp.card = true; kpPanelDraw(); kpRedraw(); if (n >= 2) dzWhistle(1.6); beep(n === 3 ? [[523, .08], [659, .08], [784, .12]] : [[523, .08], [659, .1]]); }
  kpCard.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b || !kp) return; e.stopPropagation();
    if (b.dataset.lv != null) { kpStart(+b.dataset.lv); return; }
    var a = b.dataset.a; if (a === "go") { kp.card = false; kpCard.hidden = true; kpPanelDraw(); kpRedraw(); return; }
    if (a === "again") return kpStart(kp.li); if (a === "next") return kpStart(kp.li + 1); if (a === "menu") { kpMenu(); return; } });
  kpPanel.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b || !kp || kp.anim || kp.card) return; e.stopPropagation();
    if (b.classList.contains("cap-glx")) { cpGlass(false); return; }
    if (b.classList.contains("cap-tip")) { if (kp.tips > 0) { var sv = kpSolve(kpState()); kp.tips--; kp.tip = sv ? kpTipTxt(sv.f) : "Da kommen wir nicht mehr ohne Rumms durch."; beep([[660, .05], [880, .06]]); kpPanelDraw(); } return; }
    if (b.classList.contains("cap-go")) kpGo(); });
  kpGl.addEventListener("click", function (e) { e.stopPropagation(); if (!kp || kp.anim || kp.card || kp.done) return; cpGlass(!cp.glass, 0); });

  // ---- input on the bridge: telegraph, wheel (drag or tap a side), whistle handle, binoculars ----
  var kpWh = null, kpTel = 0, kpRing = null, kpPanG = null;
  function kpPt(e) { var r0 = kpCv.getBoundingClientRect(); return [(e.clientX - r0.left) / r0.width * 180, (e.clientY - r0.top) / r0.height * 135]; }
  function kpSetRud(r) { var lim0 = -1 - kp.lane, lim1 = 1 - kp.lane; r = Math.max(lim0, Math.min(lim1, r)); if (r !== cp.rud) { cp.rud = r; beep([[300 + r * 40, .02]]); kpPanelDraw(); } kpRedraw(); }
  kpCv.addEventListener("pointerdown", function (e) {
    if (!kp || kp.anim || kp.card || kp.done) return; e.preventDefault(); var pp = kpPt(e);
    if (cp.glass) { var rd = Math.hypot(pp[0] - 114, pp[1] - 64);
      if (rd > 38 && rd < 62 && Math.hypot(pp[0] - 66, pp[1] - 64) > 40) { kpRing = { a0: Math.atan2(pp[1] - 64, pp[0] - 114) }; cp.glass.ring = 1; } else kpPanG = { x: pp[0], y0: cp.glass.yaw };
      try { kpCv.setPointerCapture(e.pointerId); } catch (er) { } return; }
    if (Math.hypot(pp[0] - CP_TELC[0], pp[1] - CP_TELC[1]) < CP_TELR + 8) { kpTel = 1; cpTelSet(pp); try { kpCv.setPointerCapture(e.pointerId); } catch (er) { } return; }
    if (Math.hypot(pp[0] - CP_WHC[0], pp[1] - CP_WHC[1]) < 42) { if (kp.tr) { kpSay("Das Ruder liegt fest, bis der Spurwechsel fertig ist."); return; } kpWh = { a0: Math.atan2(pp[1] - CP_WHC[1], pp[0] - CP_WHC[0]), r0: cp.rud, x0: pp[0], mv: 0 }; try { kpCv.setPointerCapture(e.pointerId); } catch (er) { } return; }
    if (pp[0] > 160 && pp[1] > 84 && pp[1] < 114) { cp.wh = !cp.wh; if (cp.wh) dzWhistle(.8); else beep([[300, .03]]); kpRedraw(); return; }
    var best = null, bd = 99;
    cp.O.forEach(function (o) { if (o.hid || o.seen || o.k === "quay" || o.k === "shoal" || o.k === "m3") return; var p = cpProj(o.x, o.y); if (!p || p.f > 70 || !cpHidden(o, p.f)) return; var dd = Math.hypot(p.x - pp[0], (p.y - 5 - pp[1]) * 1.4); if (dd < bd) { bd = dd; best = o; } });
    if (best && bd < 16) { var rr = cpRel(cp.px, cp.py, cp.h, best.x, best.y); cpGlass(true, Math.atan2(rr[1], rr[0])); }
  });
  kpCv.addEventListener("pointermove", function (e) { if (!kp) return; var pp = kpPt(e);
    if (kpRing && cp.glass) { var an = Math.atan2(pp[1] - 64, pp[0] - 114), da = an - kpRing.a0; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; kpRing.a0 = an; var nf = Math.max(3, Math.min(70, cp.glass.foc + da * 9)); if (Math.floor(nf / 2) !== Math.floor(cp.glass.foc / 2)) beep([[700 + nf * 4, .01]]); cp.glass.foc = nf; return; }
    if (kpPanG && cp.glass) { cp.glass.yaw = Math.max(-1.5, Math.min(1.5, kpPanG.y0 - (pp[0] - kpPanG.x) / 480)); return; }
    if (kpTel) { cpTelSet(pp); return; }
    if (kpWh) { var a = Math.atan2(pp[1] - CP_WHC[1], pp[0] - CP_WHC[0]), d = a - kpWh.a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; if (Math.abs(d) > .12) kpWh.mv = 1;
      if (kpWh.mv) { cp.wheelA = Math.max(-1.1, Math.min(1.1, kpWh.r0 * .45 + d)); kpSetRud(Math.round(cp.wheelA / .5)); } } });
  function kpUp(e) { if (kpWh && !kpWh.mv && kp) kpSetRud(cp.rud + (kpWh.x0 < CP_WHC[0] ? -1 : 1));   // a tap on the left or right half of the wheel: one lane that way
    if (kpRing && cp && cp.glass) cp.glass.ring = 0; kpWh = null; kpTel = 0; kpRing = null; kpPanG = null; if (cp) cp.wheelA = null; if (kp) kpRedraw(); }
  kpCv.addEventListener("pointerup", kpUp); kpCv.addEventListener("pointercancel", kpUp);

  // ---- opening and closing; the first game's drawing hooks hand over while this one runs ----
  var _kpDraw0 = cpDraw, _kpRedraw0 = cpRedraw, _kpPanel0 = cpPanelDraw, _kpSay0 = cpSay, _kpSky0 = cpSky, _kpHid0 = cpHidden;
  cpDraw = function (t) { if (kpOpen) return kpDraw(t); return _kpDraw0(t); };
  cpRedraw = function () { if (kpOpen) return kpRedraw(); return _kpRedraw0(); };
  cpPanelDraw = function () { if (kpOpen) return kpPanelDraw(); return _kpPanel0(); };
  cpSay = function (t) { if (kpOpen) return kpSay(t); return _kpSay0(t); };
  cpSky = function (i) { if (kpOpen && kp && kp.li != null && KP_LV[kp.li]) return KP_LV[kp.li].sky; return _kpSky0(i); };
  cpHidden = function (o, f) { if (!kpOpen) return _kpHid0(o, f); if (o.ani || o.unk) return !o.seen; return !o.seen && cpSky() === "fog" && f > 20; };
  function kpGame() { return new Promise(function (resolve) { kpOpen = true; cpc = kpc; kp = { li: 0, resolve: resolve }; kpEl.hidden = false; kpPanel.style.display = "block"; kpStart(0); kpMenu(); kpRedraw(); }); }
  function kpClose() { if (!kpOpen) return; var r = kp && kp.resolve; kpOpen = false; cancelAnimationFrame(kpRaf); kpRaf = 0; kpEl.hidden = true; kpCard.hidden = true; kpToast.hidden = true; kpPanel.style.display = "none"; cpc = kpC0; kp = null; cp = null; if (r) r(); }
  var _kpStart0 = kpStart; kpStart = function (li) { var r = kp && kp.resolve; _kpStart0(li); kp.resolve = r; };
  kpEl.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); kpClose(); });
  var _kp_int = interrupt; interrupt = function () { if (kpOpen && !window.__resume) kpClose(); return _kp_int.apply(this, arguments); };
  capGame = kpGame;
  window.__cap2 = { lv: function (i) { kpStart(i); kp.card = false; kpCard.hidden = true; kpPanelDraw(); kpRedraw(); }, st: function () { return kp && { li: kp.li, row: kp.row, lane: kp.lane, tr: kp.tr, turns: kp.turns, par: kp.par, hits: kp.hits, inc: kp.inc, task: kp.task, done: !!kp.done, anim: !!kp.anim, card: !!kp.card, found: cp && cp.found.slice(), seen: cp && cp.O.filter(function (o) { return o.unk && o.seen; }).length }; },
    solve: function () { var r = kpSolve(kpState()); return r && r.f; }, set: function (o) { if (o.d != null) cp.rud = o.d; if (o.spd != null) cp.lvl = o.spd; if (o.wh != null) cp.wh = o.wh; kpPanelDraw(); kpRedraw(); }, go: function () { kpGo(); },
    glass: function (yaw, foc) { cpGlass(true, yaw); if (foc != null) cp.glass.foc = foc; }, seeAll: function () { cp.O.forEach(function (o) { o.seen = true; }); kpRedraw(); } };
