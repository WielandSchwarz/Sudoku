  // ===================== after the shipwreck: rowing the lifeboat to the rescue ship =====================
  // We sit at the stern. In front of us two friends in orange life jackets face us and row, one oar each; the bow with its lantern points at the
  // horizon where the rescue ship waits. Our own paws hold the stroke oar at the bottom: pull it towards you (swipe down) = all blades through the water,
  // push it back (swipe up) = the blades come forward over the water. Swipe a little to the side while pulling to steer.
  // Calm, even strokes carry far; frantic jerks only splash. On the way: ice floes to steer around, a hamster in a life ring to fish out, a big wave.
  var rwEl = xEl("div", "bee-pov fi-pov rw-pov", scene); rwEl.hidden = true;
  rwEl.innerHTML = '<canvas width="180" height="135" class="fi-cv"></canvas><div class="cap-toast" hidden></div><div class="fi-card" hidden></div><button type="button" class="bp-x" aria-label="Rudern beenden">×</button>';
  var rwCv = rwEl.querySelector("canvas"), rwc = rwCv.getContext("2d"); rwc.imageSmoothingEnabled = false;
  var rwToast = rwEl.querySelector(".cap-toast"), rwCard = rwEl.querySelector(".fi-card"), rw = null, rwRaf = 0;
  var RW_GOAL = 660, RW_HZ = 26, RW_BOW = 8;          // the length of the row, the horizon, how far ahead of us the bow is
  function rP(x, y, w, h, col) { rwc.fillStyle = col; rwc.fillRect(Math.round(x), Math.round(y), w, h); }
  function rwSay(t) { rwToast.textContent = t; rwToast.hidden = false; rwToast.classList.remove("pop"); void rwToast.offsetWidth; rwToast.classList.add("pop"); clearTimeout(rwSay.t); rwSay.t = setTimeout(function () { rwToast.hidden = true; }, 1900); }
  // ---- the crew: the game's own hamster sprite, in three furs, in life jackets ----
  var RW_FUR = { gold: ["#e9a44c", "#c98232", "#f7c47e"], grey: ["#b4aea6", "#86807a", "#d8d2ca"], choc: ["#c07a4a", "#8a5030", "#dca070"], snow: ["#f2ece2", "#c8beb0", "#ffffff"] };
  var RW_POSE = { idle: ["eyes_open", "mouth_smile", "paws_hold"], pull: ["eyes_grumpy", "mouth_teeth", "paws_hold"], back: ["eyes_happy", "mouth_grin", "paws_hold"], shout: ["eyes_open", "mouth_open", "paws_hold"],
    wet: ["eyes_sleep", "mouth_open", "paws_hold"], cheer: ["eyes_happy", "mouth_open", "paws_up"], wrap: ["eyes_happy", "mouth_smile", "blanket0"] };
  var rwHI = null;
  function rwVest(g) {   // the life jacket over the chest, under the paws: two orange panels with a white stripe, a strap with a buckle
    var P = function (x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); };
    for (var y = 29; y <= 43; y++) { var l = 8 + Math.max(0, y - 37) * .6 | 0, r = 47 - l;
      P(l, y, 17 - l, 1, y === 29 ? "#ff9a40" : y === 37 ? "#fff8ec" : "#f07a1a"); P(l, y, 2, 1, y === 37 ? "#d8d0c4" : "#c85a10"); P(16, y, 1, 1, "#3a2414");
      P(31, y, r - 30, 1, y === 29 ? "#ff9a40" : y === 37 ? "#fff8ec" : "#f07a1a"); P(r - 1, y, 2, 1, y === 37 ? "#d8d0c4" : "#c85a10"); P(31, y, 1, 1, "#3a2414"); }
    P(9, 28, 8, 1, "#3a2414"); P(31, 28, 8, 1, "#3a2414"); P(17, 40, 14, 2, "#3a2414"); P(22, 39, 4, 4, "#3a2414"); P(23, 40, 2, 2, "#c8ccd4"); }
  function rwHamLoad() { rwHI = {}; var A0 = HAM.art, cnt = 0;
    var svg = function (keys, fur) { var s2 = keys.map(function (k) { return A0[k] || ""; }).join(""); if (fur) s2 = s2.replace(/#e9a44c/gi, fur[0]).replace(/#c98232/gi, fur[1]).replace(/#f7c47e/gi, fur[2]);
      return "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="46" viewBox="0 0 48 46" shape-rendering="crispEdges">' + s2 + '</svg>'); };
    Object.keys(RW_FUR).forEach(function (fk) { Object.keys(RW_POSE).forEach(function (pk) {
      var pose = RW_POSE[pk], base = new Image(), top = new Image(), c = document.createElement("canvas"); c.width = 48; c.height = 46; var g = c.getContext("2d"), n = 0; g.imageSmoothingEnabled = false;
      var done = function () { if (++n < 2) return; g.drawImage(base, 0, 0); if (pk !== "wrap") rwVest(g); g.drawImage(top, 0, 0); rwHI[fk + "_" + pk] = c; };
      base.onload = done; top.onload = done; base.src = svg(["body"], RW_FUR[fk]); top.src = svg(["ears_up", pose[0], "nose", pose[1], "whisk0", pose[2]], RW_FUR[fk]); }); }); }
  function rwHam(fur, pose, x, y) { var im = rwHI && rwHI[fur + "_" + pose]; if (im) rwc.drawImage(im, Math.round(x), Math.round(y)); }
  // ---- start and end ----
  function rwStart(sky) {
    if (!rwHI) rwHamLoad();
    rw = { sky: sky || "night", d: 0, v: 0, h: 0, bx: 0, turn: 0, drive: false, strokeT0: 0, good: 0, bad: 0, strokes: 0, beat: performance.now(), shake: 0, splash: [], drops: [], last: 0, done: false,
      ev: [{ k: "floe", d: 130, lx: 0 }, { k: "floe", d: 215, lx: .55 }, { k: "swim", d: 300, lx: -.5 }, { k: "wave", d: 400, lx: 0 }, { k: "floe", d: 480, lx: -.15 }, { k: "floe", d: 540, lx: .5 }],
      hit: 0, gentle: true, picked: false, wet: 0, wetT: 0, pull: 0, cheerT: 0 };
    rwEl.hidden = false; rwCard.hidden = true; rwSay("Zieh das Ruder zu dir!"); if (!rwRaf) rwRaf = requestAnimationFrame(rwDraw);
  }
  function rwEnd() { rwEl.hidden = true; if (rwRaf) cancelAnimationFrame(rwRaf); rwRaf = 0; rw = null; }
  rwEl.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); rwEnd(); if (typeof kpClose === "function") kpClose(); });
  // ---- the oar: drag up and down anywhere; drifting sideways while pulling steers ----
  var rwDrag = null;
  function rwPt(e) { var r = rwCv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 180, (e.clientY - r.top) / r.height * 135]; }
  rwCv.addEventListener("pointerdown", function (e) { if (!rw || rw.done) return; e.preventDefault(); var p = rwPt(e); rwDrag = { x0: p[0], y0: p[1], h0: rw.h }; try { rwCv.setPointerCapture(e.pointerId); } catch (er) { } });
  rwCv.addEventListener("pointermove", function (e) { if (!rw || !rwDrag) return; var p = rwPt(e); rwSetH(Math.max(0, Math.min(1, rwDrag.h0 + (p[1] - rwDrag.y0) / 42))); rw.steer = rw.drive ? Math.max(-1, Math.min(1, (p[0] - rwDrag.x0) / 40)) : 0; });
  function rwUp() { rwDrag = null; if (rw) rw.steer = 0; } rwCv.addEventListener("pointerup", rwUp); rwCv.addEventListener("pointercancel", rwUp);
  function rwSetH(h) {
    var now = performance.now(), dh = h - rw.h;
    if (dh > 0 && rw.h < .25 && !rw.drive) { rw.drive = true; rw.strokeT0 = now; rw.catchBeat = Math.abs(((now - rw.beat) % 1600) - 800) > 540; dzNoise(.12, 900, 1, .12, .005, .08); }   /* the blades catch the water */
    if (rw.drive && dh > 0) { var sp = dh / Math.max(.008, (now - (rw.hT || now)) / 1000 || .016); rw.pull = Math.max(rw.pull, sp); rw.v += dh * (rw.catchBeat ? 30 : 24); rw.turn += (rw.steer || 0) * dh * 1.6; }
    if (rw.drive && h > .85) {                                                                                                                             /* the stroke is through: how was it? */
      rw.drive = false; rw.strokes++; var dur = (now - rw.strokeT0) / 1000, ok = dur > .28 && dur < 1.1;
      if (ok) { rw.good++; rw.v += rw.catchBeat ? 6 : 3; beep(rw.catchBeat ? [[523, .04], [659, .05]] : [[440, .04]]); dzNoise(.25, 700, .8, .1, .01, .2); }
      else { rw.bad++; rw.v *= .75; for (var i = 0; i < 10; i++) rw.splash.push({ x: Math.random() < .5 ? 14 + Math.random() * 20 : 146 + Math.random() * 20, y: 96, vx: (Math.random() - .5) * 30, vy: -25 - Math.random() * 25, l: .7 }); dzNoise(.3, 1600, .7, .16, .01, .2); rwSay("Zu hektisch! Ruhig und gleichmäßig."); }
      if (rw.waveOn && rw.pull > 2.2) rw.waveOk = true; rw.pull = 0;
    }
    if (dh < 0 && h < .2) rw.drive = false;
    rw.hT = now; rw.h = h;
  }
  // ---- the run ----
  function rwStep(t, dt) {
    var now = performance.now();
    rw.v = Math.max(0, rw.v - rw.v * .5 * dt - 1.1 * dt); rw.d += rw.v * dt; if (rw.shake > 0) rw.shake -= dt; if (rw.wetT > 0) rw.wetT -= dt; if (rw.cheerT > 0) rw.cheerT -= dt;
    rw.turn *= Math.pow(.25, dt); rw.bx = Math.max(-1.2, Math.min(1.2, rw.bx + rw.turn * dt * Math.min(1, .3 + rw.v / 25)));
    if (now - rw.beat > 1600) { rw.beat += 1600; if (!rw.done) { dzTone(330, .12, .08, "triangle"); setTimeout(function () { dzTone(262, .16, .08, "triangle"); }, 220); } }   /* "Hau-ruck!" */
    rw.ev.forEach(function (e) {
      var z = e.d - rw.d, off = Math.abs(e.lx - rw.bx);
      if (e.k === "floe" && !e.done && z < 90 && !e.warn) { e.warn = 1; rwSay(off < .4 ? "Eisscholle voraus! Ausweichen!" : "Eisscholle!"); }
      if (e.k === "floe" && !e.done && z < RW_BOW) { e.done = 1; if (off < .38) { if (rw.v > 16) { rw.hit++; rw.v = 0; rw.shake = .5; beep([[110, .12], [80, .18]]); dzBuzz([60, 30, 120]); rwSay("Rumms! Mitten in die Scholle."); } else { rw.v *= .4; rwSay("Sachte weggeschoben. Puh!"); } } else beep([[660, .03]]); }
      if (e.k === "swim" && !e.done && z < 100 && !e.warn) { e.warn = 1; rwSay("Ein Hamster im Wasser! Hinsteuern!"); }
      if (e.k === "swim" && !e.done && z < RW_BOW) { e.done = 1; rw.picked = true; if (off > .45) { rw.gentle = false; rwSay("Vorbei! Er klettert selbst rein."); } else if (rw.v > 18) { rw.gentle = false; rwSay("Zu schnell! Er bekommt gerade noch das Seil."); } else { rwSay("Hochgezogen! Willkommen an Bord."); rw.cheerT = 1.4; } beep([[523, .05], [659, .05], [784, .08]]); rw.v *= .5; }
      if (e.k === "wave" && !e.done && z < 70 && !e.warn) { e.warn = 1; rw.waveOn = true; rw.waveOk = false; rwSay("Eine große Welle! Kräftig durchziehen!"); }
      if (e.k === "wave" && !e.done && z < RW_BOW) { e.done = 1; rw.waveOn = false; if (!rw.waveOk) { rw.wet++; rw.wetT = 2.5; rw.v *= .4; rw.shake = .5; for (var i = 0; i < 40; i++) rw.drops.push({ x: Math.random() * 180, y: 40 + Math.random() * 30, vx: (Math.random() - .5) * 30, vy: 20 + Math.random() * 40, l: 1.2 }); dzNoise(.8, 500, .6, .3, .02, .6); rwSay("Platsch! Alle klatschnass."); } else { rw.v += 10; rw.cheerT = 1; rwSay("Drüber weg!"); } }
    });
    if (rw.d >= RW_GOAL && !rw.done) { rw.done = true; rw.v = 0; rw.cheerT = 99; dzWhistle(1.6); setTimeout(rwFinish, 2200); }
    rw.splash = rw.splash.filter(function (s2) { s2.l -= dt; s2.vy += 90 * dt; s2.x += s2.vx * dt; s2.y += s2.vy * dt; return s2.l > 0; });
    rw.drops = rw.drops.filter(function (s2) { s2.l -= dt; s2.vy += 60 * dt; s2.x += s2.vx * dt; s2.y += s2.vy * dt; return s2.l > 0 && s2.y < 135; });
  }
  function rwFinish() { if (!rw) return; var st = [rw.strokes > 0 && rw.good / rw.strokes >= .7, rw.picked && rw.gentle, rw.hit === 0], n = st.filter(Boolean).length;
    rwCard.innerHTML = '<div class="fi-c dz-intro"><p class="fi-h">Gerettet!</p><p class="dz-route">' + "★".repeat(n) + "☆".repeat(3 - n) + '</p><p class="fi-s">' + (st[0] ? "★" : "☆") + ' Gleichmäßig gerudert<br>' + (st[1] ? "★" : "☆") + ' Schiffbrüchigen sanft geholt<br>' + (st[2] ? "★" : "☆") + ' Keine Scholle gerammt</p>' +
      '<div class="fi-row"><button type="button" class="fi-b2" data-a="menu">Übersicht</button><button type="button" class="fi-b" data-a="again">Nochmal</button></div></div>';
    rwCard.hidden = false; KP_S.cheer(true); }
  rwCard.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; e.stopPropagation(); var a = b.dataset.a; rwEnd(); if (!kp) return; if (a === "menu") { kpSinkReset(); kpMenu(); } else kpStart(kp.li); });
  // ---- drawing ----
  function rwProj(z, lx) { var s = 10 / (z + 10); return { y: RW_HZ + 78 * s, x: 90 + (lx - rw.bx) * 230 * s, s: s }; }
  function rwDisc(x, y, rx, ry, fn) { for (var yy = -Math.ceil(ry); yy <= Math.ceil(ry); yy++) for (var xx = -Math.ceil(rx); xx <= Math.ceil(rx); xx++) { var d = (xx / (rx + .45)) * (xx / (rx + .45)) + (yy / (ry + .45)) * (yy / (ry + .45)); if (d > 1) continue; var c = fn(xx, yy, d); if (c) rP(x + xx, y + yy, 1, 1, c); } }
  function rwDraw(t) {
    rwRaf = 0; if (!rw || rwEl.hidden) return; rwRaf = requestAnimationFrame(rwDraw);
    var dt = Math.min(.05, (t - (rw.last || t)) / 1000); rw.last = t; rwStep(t, dt);
    var dz0 = dzc; dzc = rwc;
    var sh = rw.shake > 0 ? Math.round(Math.sin(t / 30) * 2) : 0, sc = DZ_SKY[rw.sky] || DZ_SKY.day, P = DZ_WP[rw.sky] || DZ_WP.day, night = rw.sky === "night" || rw.sky === "storm";
    rwc.setTransform(1, 0, 0, 1, 0, sh);
    // sky and the far horizon with the rescue ship
    for (var y = 0; y < RW_HZ; y++) { var bnd = y < 9 ? 0 : y < 18 ? 1 : 2; for (var x0 = 0; x0 < 180; x0 += 2) rP(x0 + (y % 2), y, 2, 1, (y % 9) < 2 && y > 2 && (x0 / 2 + y) % 2 ? sc[Math.max(0, bnd - 1)] : sc[bnd]); }
    if (rw.sky === "night") for (var s2 = 0; s2 < 50; s2++) rP((s2 * 53 + s2 * s2) % 180, (s2 * 29) % (RW_HZ - 3), 1, 1, (s2 + Math.floor(t / 500)) % 7 ? "#c8d0f0" : "#ffffff");
    var rem = RW_GOAL - rw.d, shx = 90 - rw.bx * 60;
    if (rem > 160) { rP(shx - 9, RW_HZ - 3, 18, 2, "#2a3040"); rP(shx - 4, RW_HZ - 6, 2, 3, "#2a3040"); rP(shx + 1, RW_HZ - 6, 2, 3, "#2a3040"); if (night && Math.floor(t / 600) % 2) rP(shx - 7, RW_HZ - 3, 1, 1, "#ffe08a"); }   /* the rescue ship, tiny at first */
    else { var u = Math.min(1, (160 - rem) / 160), sx = shx - 70; dzImg("sv_ship", sx, RW_HZ - 33 + Math.round((1 - u) * 6)); if (night) for (var pw = 0; pw < 26; pw++) rP(sx + 8 + pw * 4.5, RW_HZ - 33 + Math.round((1 - u) * 6) + 25, 1, 1, "#ffe08a"); }
    // the sea in perspective: bands that come towards us with the speed, shifted by our course
    for (var wy = RW_HZ; wy < 135; wy++) { var z = 780 / (wy - RW_HZ + .5) - 10, s = 10 / (z + 10), shiftX = rw.bx * 230 * s;
      for (var wx = 0; wx < 180; wx += 2) { var v = Math.sin((wx + shiftX) * .09 / (s + .15) + (z + rw.d) * .35 + t / 700) + Math.sin((wx + shiftX) * .045 / (s + .15) - (z + rw.d) * .2) * .6 + ((wx + wy) % 4 ? 0 : .3);
        rP(wx, wy, 2, 1, v > 1.55 ? P[4] : v > 1 ? P[3] : v > -.7 ? P[2] : P[1]); } }
    if (night) { rwc.globalAlpha = .25; rwDisc(90, 72, 26, 8, function () { return "#ffe8a0"; }); rwc.globalAlpha = 1; }    /* the lantern's light on the water */
    // what floats ahead, far ones first
    rw.ev.slice().sort(function (a, b) { return b.d - a.d; }).forEach(function (e) { var z = e.d - rw.d; if (z < -4 || z > 260) return; var p = rwProj(z, e.lx), s = p.s;
      if (e.k === "floe") { var rx = Math.max(2, 26 * s), ry = Math.max(1, 6 * s), hgt = Math.max(1, Math.round(4 * s));
        rwDisc(p.x, p.y + hgt, rx, ry, function (a, b, d) { return d > .7 ? "#5a8ab0" : "#a8d0e4"; }); rwDisc(p.x, p.y, rx, ry, function (a, b, d) { return d > .8 ? "#3a2414" : b < 0 ? "#ffffff" : "#e0f0f8"; }); if (rx > 8) { rP(p.x - rx * .4, p.y - ry * .3, rx * .5, 1, "#ffffff"); rP(p.x + rx * .2, p.y + 1, rx * .3, 1, "#c8e0ec"); } }
      if (e.k === "swim" && !e.done) { var r2 = Math.max(2, 9 * s), bob = Math.round(Math.sin(t / 300) * 1.5 * s);
        rwDisc(p.x, p.y + bob, r2, r2 * .4, function (a, b, d) { var ang = Math.atan2(b, a); return d < .45 ? null : d > .85 ? "#3a2414" : Math.floor((ang + 3.2) / .8) % 2 ? "#ffffff" : "#e8463c"; });
        rwDisc(p.x, p.y - r2 * .5 + bob, r2 * .55, r2 * .55, function (a, b, d) { return d > .75 ? "#3a2414" : b > r2 * .2 ? "#fff6e4" : "#e9a44c"; });
        if (r2 > 4) { rP(p.x - r2 * .35, p.y - r2 * .7 + bob, 1, 1, "#24160c"); rP(p.x + r2 * .25, p.y - r2 * .7 + bob, 1, 1, "#24160c"); rP(p.x - r2 * .55, p.y - r2 * 1.05 + bob, 2, 2, "#3a2414"); rP(p.x + r2 * .35, p.y - r2 * 1.05 + bob, 2, 2, "#3a2414"); }
        if (Math.floor(t / 350) % 2 && r2 > 3) rP(p.x + r2 * .7, p.y - r2 * 1.4 + bob, 1, Math.max(2, r2 * .5), "#e9a44c"); }        /* he waves */
      if (e.k === "wave" && !e.done) { var hh = Math.max(2, Math.round(16 * s)); for (var xw = 0; xw < 180; xw++) { var cr = Math.round(Math.sin(xw * .08 + t / 300) * hh * .15); rP(xw, p.y - hh + cr, 1, hh, xw % 3 ? P[3] : P[2]); rP(xw, p.y - hh + cr, 1, 1, "#ffffff"); if ((xw + Math.floor(t / 90)) % 5 === 0) rP(xw, p.y - hh - 1 + cr, 1, 1, "#e8f8ff"); } } });
    // the boat from the stern, in depth: the rounded gunwale, the white outside of the hull, the inner walls with strakes and ribs going down to the floor
    var bowY = 62, G = function (y) { var u = Math.max(0, (y - bowY) / (135 - bowY)); return 90 * Math.pow(u, .62); }, F = function (y) { var u = Math.max(0, (y - bowY - 14) / (135 - bowY - 14)); return 60 * Math.pow(u, .7); };
    var L = function (y) { return Math.round(90 - G(y)); }, R = function (y) { return Math.round(90 + G(y)); };
    for (var by = bowY; by < 135; by++) { var g = G(by), f = F(by), u3 = (by - bowY) / (135 - bowY), ow = 1 + Math.round(u3 * 6), gl = Math.round(90 - g), gr = Math.round(90 + g), fl = Math.round(90 - f), fr = Math.round(90 + f);
      if ((by + Math.floor(t / 90)) % 3 === 0) { rP(gl - ow - 4, by, 2, 1, P[4]); rP(gr + ow + 3, by, 2, 1, P[4]); }                                               /* foam where the hull meets the sea */
      rP(gl - ow - 1, by, ow + 1, 1, "#3a2414"); rP(gl - ow, by, ow, 1, "#f4f0e6"); if (ow > 2) rP(gl - ow, by, 1, 1, "#c8c0b4"); if (ow > 4) rP(gl - ow + 1, by, 1, 1, "#d8463c");   /* the white hull outside, a red stripe */
      rP(gr + 1, by, ow + 1, 1, "#3a2414"); rP(gr + 1, by, ow, 1, "#d8d0c4"); if (ow > 2) rP(gr + ow, by, 1, 1, "#a8a094"); if (ow > 4) rP(gr + ow - 1, by, 1, 1, "#b8382e");
      var wallL = Math.max(0, fl - gl), wallR = Math.max(0, gr - fr);
      for (var wx2 = 0; wx2 < wallL; wx2++) { var q = wx2 / Math.max(1, wallL); rP(gl + wx2, by, 1, 1, Math.abs(q - .33) < .5 / wallL || Math.abs(q - .66) < .5 / wallL ? "#6a3e22" : q < .2 ? "#c88a50" : q < .6 ? "#b07040" : "#8a5430"); }   /* the lit left wall */
      for (var wx3 = 0; wx3 < wallR; wx3++) { var q2 = wx3 / Math.max(1, wallR); rP(fr + 1 + wx3, by, 1, 1, Math.abs(q2 - .33) < .5 / wallR || Math.abs(q2 - .66) < .5 / wallR ? "#4a2a16" : q2 > .8 ? "#9a6038" : q2 > .4 ? "#7a4a28" : "#6a3e22"); }   /* the right wall in shade */
      if (f > 0) { rP(fl, by, fr - fl + 1, 1, "#8a5430"); for (var pl = -3; pl <= 3; pl++) rP(90 + pl * f / 3.6, by, 1, 1, "#6a3e22"); }                                  /* the floor boards, lower down */
      rP(gl - 1, by, 4, 1, "#3a2414"); rP(gl, by, 2, 1, "#d8a070"); rP(gl + 2, by, 1, 1, "#a06a3a"); rP(gr - 2, by, 4, 1, "#3a2414"); rP(gr - 1, by, 2, 1, "#b47a46"); rP(gr - 2, by, 1, 1, "#7a4a28"); }   /* the gunwale rail */
    [76, 88, 100, 112, 124].forEach(function (ry) { var g1 = G(ry), f1 = F(ry + 5); for (var k = 0; k <= 6; k++) { var yy = ry + Math.round(k * 5 / 6); rP(90 - g1 + (g1 - f1) * k / 6 + 1, yy, 2, 1, "#5a3420"); rP(90 + g1 - (g1 - f1) * k / 6 - 2, yy, 2, 1, "#3a2010"); } });   /* the ribs */
    rP(88, bowY - 2, 5, 4, "#3a2414"); rP(89, bowY - 1, 3, 2, "#a06a3a"); rP(89, bowY - 12, 2, 10, "#5a3a1e"); rP(86, bowY - 17, 8, 6, "#3a2414"); rP(87, bowY - 16, 6, 4, night ? (Math.floor(t / 200) % 5 ? "#ffe08a" : "#fff6c8") : "#f4ecd8"); rP(87, bowY - 18, 6, 1, "#3a2414");   /* the stem and its lantern */
    if (night) { rwc.globalAlpha = .18; rwDisc(90, bowY - 14, 9, 7, function () { return "#ffe8a0"; }); rwc.globalAlpha = 1; }
    function rwThwart(ty, th) { var l = L(ty) + 2, r = R(ty) - 2; rwc.globalAlpha = .35; rP(Math.round(90 - F(ty + th + 3)), ty + th + 1, Math.round(F(ty + th + 3) * 2), 3, "#2a1608"); rwc.globalAlpha = 1;   /* its shadow on the floor */
      rP(l, ty - 1, r - l, 1, "#3a2414"); rP(l, ty, r - l, 2, "#d8a070"); rP(l, ty + 2, r - l, th - 2, "#b47a46"); rP(l, ty + th, r - l, 1, "#3a2414"); rP(l, ty, r - l, 1, "#e8b880"); }
    rwThwart(84, 4);
    // the rescued one, wrapped in a blanket on the bow seat, between the rowers
    if (rw.picked) rwHam("snow", "wrap", 66, 50 + Math.round(Math.sin(t / 500)));
    // the two rowers on the middle thwart, facing us: they lean back on the stroke and come forward on the recovery
    var lean = rw.drive ? -Math.round(rw.h * 3) : Math.round((1 - rw.h) * 1), wet = rw.wetT > 0, cheer = rw.cheerT > 0, beatOn = ((performance.now() - rw.beat) % 1600) < 380;
    rwThwart(106, 6);
    var pose = function (lead) { return cheer ? "cheer" : wet ? "wet" : rw.drive && rw.h > .2 ? "pull" : lead && beatOn ? "shout" : rw.v > 12 ? "back" : "idle"; };
    [["grey", 34, -1, true], ["choc", 98, 1, false]].forEach(function (cr) { var hx = cr[1], hy = 62 + lean, side = cr[2];
      // the oar: from the paws out over the gunwale, the blade in the water at the side, sweeping as they row
      var pvx = side < 0 ? L(96) - 1 : R(96) + 1, pvy = 96, gx = hx + 24, gy = hy + 30, sw = rw.drive ? (rw.h * 2 - 1) : (1 - rw.h * 2), bxE = pvx + side * 13, byE = pvy + sw * 10 + (rw.drive ? 3 : -2);
      if (!cheer) { var n = 40; for (var i = 0; i <= n; i++) { var u2 = i / n, ox = gx + (bxE - gx) * u2, oy = gy + (byE - gy) * u2; rP(ox, oy, 1, 2, i % 9 ? "#a87448" : "#8a5a32"); rP(ox, oy - 1, 1, 1, "#3a2414"); }
        rP(bxE - 3, byE - 1, 7, 4, "#3a2414"); rP(bxE - 2, byE, 5, 2, "#c8945a"); if (rw.drive && Math.random() < .5) rw.splash.push({ x: bxE, y: byE + 2, vx: -side * 10, vy: -14, l: .45 }); }
      rwHam(cr[0], pose(cr[3]), hx, hy); });
    // our own paws on the stroke oar at the bottom: pull it to you, push it away
    var hy2 = 118 + Math.round(rw.h * 12);
    rP(10, hy2 - 3, 160, 7, "#3a2414"); rP(11, hy2 - 2, 158, 5, "#b87a46"); rP(11, hy2 - 2, 158, 1, "#e0a870"); rP(11, hy2 + 2, 158, 1, "#7a4a28");
    [56, 124].forEach(function (cx) {   /* our own two arms from below: round and furry, with pink toe beans over the bar */
      for (var ay = hy2 + 1; ay < 136; ay++) { var hw = 6 + Math.round(Math.sqrt(ay - hy2) * 1.2); rP(cx - hw - 1, ay, hw * 2 + 2, 1, "#3a2414"); rP(cx - hw, ay, hw * 2, 1, "#e9a44c"); rP(cx - hw, ay, 3, 1, "#f7c47e"); rP(cx + hw - 3, ay, 3, 1, "#c98232"); }
      rwDisc(cx, hy2 - 1, 7, 4, function (a, b, d) { return d > .78 ? "#3a2414" : b < -1 ? "#f7c47e" : "#e9a44c"; });
      for (var tq = -1; tq <= 2; tq++) rwDisc(cx - 5 + (tq + 1) * 3.4, hy2 - 4, 1.5, 1.3, function (a, b, d) { return d > .6 ? "#3a2414" : "#f4a3b4"; }); });
    rw.splash.forEach(function (s3) { rP(s3.x, s3.y, 1, 1, "#e8f8ff"); });
    rw.drops.forEach(function (s3) { rP(s3.x, s3.y, 1, 2, "#c8ecfa"); });
    // the cue, the speed and the way to go
    var cue = rw.done ? "" : !rw.drive && rw.h < .5 ? "down" : rw.drive ? "" : "up", pul = ((performance.now() - rw.beat) % 1600) < 400;
    if (cue) { var col = pul ? "#ffe08a" : "#fff8ec", cy = cue === "down" ? 124 : 104; for (var ar = 0; ar < 5; ar++) rP(90 - ar, cue === "down" ? cy + ar : cy - ar, ar * 2 + 1, 1, col); rP(89, cue === "down" ? cy - 6 : cy + 1, 3, 6, col); }
    var spd = Math.min(1, rw.v / 40); rP(172, 40, 5, 50, "#3a2414"); rP(173, 41 + Math.round((1 - spd) * 48), 3, Math.round(spd * 48), spd > .55 ? "#e8a040" : "#7ae05a");
    rP(24, 3, 132, 4, "#3a2414"); rP(25, 4, 130, 2, "#5a6a7a"); rP(25, 4, Math.round(130 * Math.min(1, rw.d / RW_GOAL)), 2, "#7ae05a"); rw.ev.forEach(function (e) { rP(25 + Math.round(130 * e.d / RW_GOAL), 2, 1, 6, e.k === "swim" ? "#ffd34a" : e.k === "wave" ? "#ffffff" : "#a8d0e4"); });
    rwc.setTransform(1, 0, 0, 1, 0, 0); dzc = dz0;
  }
  window.__rw = { start: rwStart, st: function () { return rw && { d: Math.round(rw.d), v: Math.round(rw.v), h: rw.h, bx: +rw.bx.toFixed(2), good: rw.good, bad: rw.bad, hit: rw.hit, picked: rw.picked, done: rw.done }; }, steer: function (s) { rw.turn += s; },
    pull: function () { rwSetH(0); var i = 0, iv = setInterval(function () { i++; rwSetH(Math.min(1, i / 8)); if (i >= 8) { clearInterval(iv); setTimeout(function () { rwSetH(0); }, 150); } }, 60); } };
