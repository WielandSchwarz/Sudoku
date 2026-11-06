  // ===================== after the shipwreck: rowing the lifeboat to the rescue ship (rough first version) =====================
  // Top: the boat from the side with four hamsters in life jackets, the sea scrolling past. Bottom: the oar handle in two paws.
  // Pull the handle towards you (swipe down) = the blades go through the water, the boat surges. Push it back up = the blades come forward over the water.
  // Calm, even strokes carry far; frantic jerks only splash. On the way: a shipwrecked hamster to pick up gently, ice floes to pass slowly, a big wave to pull through.
  var rwEl = xEl("div", "bee-pov fi-pov rw-pov", scene); rwEl.hidden = true;
  rwEl.innerHTML = '<canvas width="180" height="135" class="fi-cv"></canvas><div class="cap-toast" hidden></div><div class="fi-card" hidden></div><button type="button" class="bp-x" aria-label="Rudern beenden">×</button>';
  var rwCv = rwEl.querySelector("canvas"), rwc = rwCv.getContext("2d"); rwc.imageSmoothingEnabled = false;
  var rwToast = rwEl.querySelector(".cap-toast"), rwCard = rwEl.querySelector(".fi-card"), rw = null, rwRaf = 0;
  var RW_GOAL = 640, RW_HZ = 34, RW_WL = 58;
  function rP(x, y, w, h, col) { rwc.fillStyle = col; rwc.fillRect(Math.round(x), Math.round(y), w, h); }
  function rwSay(t) { rwToast.textContent = t; rwToast.hidden = false; rwToast.classList.remove("pop"); void rwToast.offsetWidth; rwToast.classList.add("pop"); clearTimeout(rwSay.t); rwSay.t = setTimeout(function () { rwToast.hidden = true; }, 1800); }
  function rwStart(sky) {
    rw = { sky: sky || "night", d: 0, v: 0, h: 0, drive: false, hPrev: 0, strokeT0: 0, good: 0, bad: 0, strokes: 0, beat: performance.now(), shake: 0, splash: [], last: 0, done: false,
      ev: [{ k: "floe", d: 150 }, { k: "swim", d: 270 }, { k: "wave", d: 380 }, { k: "floe", d: 470 }], hit: 0, gentle: true, picked: false, crew: 4, wet: 0, pull: 0 };
    rwEl.hidden = false; rwCard.hidden = true; rwSay("Zieh das Ruder zu dir!"); if (!rwRaf) rwRaf = requestAnimationFrame(rwDraw);
  }
  function rwEnd() { rwEl.hidden = true; if (rwRaf) cancelAnimationFrame(rwRaf); rwRaf = 0; rw = null; }
  rwEl.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); rwEnd(); if (typeof kpClose === "function") kpClose(); });
  // ---- the handle: drag up and down anywhere in the lower half ----
  var rwDrag = null;
  function rwPt(e) { var r = rwCv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 180, (e.clientY - r.top) / r.height * 135]; }
  rwCv.addEventListener("pointerdown", function (e) { if (!rw || rw.done) return; e.preventDefault(); var p = rwPt(e); rwDrag = { y0: p[1], h0: rw.h }; try { rwCv.setPointerCapture(e.pointerId); } catch (er) { } });
  rwCv.addEventListener("pointermove", function (e) { if (!rw || !rwDrag) return; var p = rwPt(e); rwSetH(Math.max(0, Math.min(1, rwDrag.h0 + (p[1] - rwDrag.y0) / 42))); });
  function rwUp() { rwDrag = null; } rwCv.addEventListener("pointerup", rwUp); rwCv.addEventListener("pointercancel", rwUp);
  function rwSetH(h) {
    var now = performance.now(), dh = h - rw.h;
    if (dh > 0 && rw.h < .25 && !rw.drive) { rw.drive = true; rw.strokeT0 = now; rw.catchBeat = Math.abs(((now - rw.beat) % 1600) - 800) > 560; dzNoise(.12, 900, 1, .12, .005, .08); }   /* the blades catch the water */
    if (rw.drive && dh > 0) { var sp = dh / Math.max(.008, (now - (rw.hT || now)) / 1000 || .016); rw.pull = Math.max(rw.pull, sp); rw.v += dh * (rw.catchBeat ? 30 : 24); }
    if (rw.drive && h > .85) {                                                                                                                             /* the stroke is finished: how was it? */
      rw.drive = false; rw.strokes++; var dur = (now - rw.strokeT0) / 1000, ok = dur > .28 && dur < 1.1;
      if (ok) { rw.good++; rw.v += rw.catchBeat ? 6 : 3; beep(rw.catchBeat ? [[523, .04], [659, .05]] : [[440, .04]]); } else { rw.bad++; rw.v *= .75; for (var i = 0; i < 8; i++) rw.splash.push({ x: 40 + Math.random() * 60, y: RW_WL, vx: (Math.random() - .5) * 30, vy: -20 - Math.random() * 25, l: .7 }); dzNoise(.3, 1600, .7, .16, .01, .2); rwSay("Zu hektisch! Ruhig und gleichmäßig."); }
      if (rw.waveOn && rw.pull > 2.2) { rw.waveOk = true; } rw.pull = 0;
    }
    if (dh < 0 && h < .2) rw.drive = false;
    rw.hT = now; rw.h = h;
  }
  // ---- the run ----
  function rwStep(t, dt) {
    var now = performance.now();
    rw.v = Math.max(0, rw.v - rw.v * .55 * dt - 1.2 * dt); rw.d += rw.v * dt; if (rw.shake > 0) rw.shake -= dt;
    if (now - rw.beat > 1600) { rw.beat += 1600; if (!rw.done) { dzTone(330, .12, .08, "triangle"); setTimeout(function () { dzTone(262, .16, .08, "triangle"); }, 220); } }   /* "Hau-ruck" from the stern */
    rw.ev.forEach(function (e) {
      var dx = e.d - rw.d;
      if (e.k === "floe" && !e.done && dx < 70 && !e.warn) { e.warn = 1; rwSay("Eisscholle! Langsam vorbei."); }
      if (e.k === "floe" && !e.done && dx < 6) { e.done = 1; if (rw.v > 22) { rw.hit++; rw.v = 0; rw.shake = .5; beep([[110, .12], [80, .18]]); dzBuzz([60, 30, 120]); rwSay("Rumms! Zu schnell an die Scholle."); } else { beep([[660, .04]]); rwSay("Sachte vorbei, gut so!"); } }
      if (e.k === "swim" && !e.done && dx < 80 && !e.warn) { e.warn = 1; rwSay("Da treibt ein Hamster! Langsam ranrudern."); }
      if (e.k === "swim" && !e.done && dx < 4) { e.done = 1; rw.picked = true; rw.crew++; if (rw.v > 20) { rw.gentle = false; rwSay("Zu schnell! Er bekommt gerade noch das Seil zu fassen."); } else rwSay("Hochgezogen! Willkommen an Bord."); beep([[523, .05], [659, .05], [784, .08]]); rw.v *= .5; }
      if (e.k === "wave" && !e.done && dx < 60 && !e.warn) { e.warn = 1; rw.waveOn = true; rw.waveOk = false; rwSay("Eine Welle! Kräftig durchziehen!"); }
      if (e.k === "wave" && !e.done && dx < 0) { e.done = 1; rw.waveOn = false; if (!rw.waveOk) { rw.wet++; rw.v *= .4; rw.shake = .4; for (var i = 0; i < 20; i++) rw.splash.push({ x: 50 + Math.random() * 50, y: RW_WL - 8, vx: (Math.random() - .5) * 40, vy: -30 - Math.random() * 30, l: 1 }); dzNoise(.8, 500, .6, .3, .02, .6); rwSay("Platsch! Alle klatschnass."); } else { rw.v += 10; rwSay("Drüber weg!"); } }
    });
    if (rw.d >= RW_GOAL && !rw.done) { rw.done = true; rw.v = 0; dzWhistle(1.6); setTimeout(rwFinish, 1800); }
    rw.splash = rw.splash.filter(function (s2) { s2.l -= dt; s2.vy += 90 * dt; s2.x += s2.vx * dt; s2.y += s2.vy * dt; return s2.l > 0 && s2.y < RW_WL + 4; });
  }
  function rwFinish() { if (!rw) return; var st = [rw.strokes > 0 && rw.good / rw.strokes >= .7, rw.picked && rw.gentle, rw.hit === 0], n = st.filter(Boolean).length;
    rwCard.innerHTML = '<div class="fi-c dz-intro"><p class="fi-h">Gerettet!</p><p class="dz-route">' + "★".repeat(n) + "☆".repeat(3 - n) + '</p><p class="fi-s">' + (st[0] ? "★" : "☆") + ' Gleichmäßig gerudert<br>' + (st[1] ? "★" : "☆") + ' Schiffbrüchigen sanft geholt<br>' + (st[2] ? "★" : "☆") + ' Keine Scholle gerammt</p>' +
      '<div class="fi-row"><button type="button" class="fi-b2" data-a="menu">Übersicht</button><button type="button" class="fi-b" data-a="again">Nochmal</button></div></div>';
    rwCard.hidden = false; KP_S.cheer(true); }
  rwCard.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; e.stopPropagation(); var a = b.dataset.a; rwEnd(); if (!kp) return; if (a === "menu") { kpSinkReset(); kpMenu(); } else kpStart(kp.li); });
  // ---- drawing ----
  function rwDraw(t) {
    rwRaf = 0; if (!rw || rwEl.hidden) return; rwRaf = requestAnimationFrame(rwDraw);
    var dt = Math.min(.05, (t - (rw.last || t)) / 1000); rw.last = t; rwStep(t, dt);
    var dz0 = dzc; dzc = rwc;
    var sh = rw.shake > 0 ? Math.round(Math.sin(t / 30) * 2) : 0, sc = DZ_SKY[rw.sky] || DZ_SKY.day, P = DZ_WP[rw.sky] || DZ_WP.day, night = rw.sky === "night";
    rwc.setTransform(1, 0, 0, 1, 0, sh);
    for (var y = 0; y < RW_HZ; y++) rP(0, y, 180, 1, sc[y < 12 ? 0 : y < 24 ? 1 : 2]);
    if (night) for (var s2 = 0; s2 < 40; s2++) rP((s2 * 53 + s2 * s2) % 180, (s2 * 29) % (RW_HZ - 4), 1, 1, "#c8d0f0");
    var ox = rw.d * .15; dzImg("sv_ice", 10 - ox * .5, RW_HZ - 30);                                                                                        /* the iceberg falls behind */
    if (rw.d > RW_GOAL - 220) { var shx = 180 - (rw.d - (RW_GOAL - 220)) * .5; dzImg("sv_ship", shx, RW_HZ - 30); }                             /* the rescue ship comes into view */
    for (var wy = RW_HZ; wy < 72; wy++) { var dd = (wy - RW_HZ) / 38; for (var wx = 0; wx < 180; wx += 2) { var v = Math.sin((wx + rw.d * (.5 + dd * 2)) * (.12 / (.3 + dd)) + wy * .9 + t / 600) + ((wx + wy) % 4 ? 0 : .4); rP(wx, wy, 2, 1, v > 1 ? P[4] : v > .3 ? P[3] : v > -.4 ? P[2] : P[1]); } }
    // what floats ahead
    rw.ev.forEach(function (e) { var x = 108 + (e.d - rw.d) * 1.2; if (x < -30 || x > 200) return;
      if (e.k === "floe") { var fy = RW_WL - 2; rP(x - 14, fy, 28, 4, "#3a2414"); rP(x - 13, fy - 1, 26, 3, "#ffffff"); rP(x - 13, fy + 2, 26, 2, "#c8e0ec"); rP(x - 8, fy - 3, 12, 2, "#e8f4fa"); }
      if (e.k === "swim" && !e.done) { var by = RW_WL - 4 + Math.round(Math.sin(t / 300) * 1.5); for (var r = 0; r < 12; r++) { var a = r / 12 * Math.PI * 2; rP(x + Math.cos(a) * 6, by + 4 + Math.sin(a) * 2.5, 2, 1, r % 3 ? "#ffffff" : "#e8463c"); } kpSpr(rwc, KP_LH, x - 3, by - 4, 0, 7); if (Math.floor(t / 400) % 2) { rP(x + 5, by - 6, 1, 3, "#e8a040"); } }
      if (e.k === "wave" && !e.done) { for (var q = -20; q <= 20; q++) { var h = Math.round(9 * Math.cos(q / 20 * Math.PI / 2)); rP(x + q, RW_WL - h, 1, h + 2, q > 0 ? P[2] : P[3]); rP(x + q, RW_WL - h, 1, 1, "#ffffff"); } } });
    // the lifeboat from the side: white hull, four rowers in orange life jackets, the helmsman at the stern
    var bx = 40, bob = Math.round(Math.sin(t / 420) * 1 + (rw.v > 15 ? Math.sin(t / 120) * .6 : 0)), by0 = RW_WL - 8 + bob;
    for (var k = 0; k < Math.min(5, rw.crew); k++) { var hx = bx + 6 + k * 11 + (k === 4 ? 4 : 0); rP(hx - 1, by0 - 6, 9, 7, "#3a2414"); rP(hx, by0 - 5, 7, 6, "#f07a1a"); rP(hx, by0 - 3, 7, 1, "#fff8ec"); kpSpr(rwc, KP_LH, hx, by0 - 12, 0, 7); }
    rP(bx, by0, 64, 1, "#3a2414"); rP(bx, by0 + 1, 64, 2, "#8a5a32"); rP(bx + 1, by0 + 3, 62, 4, "#f4f0e6"); rP(bx + 3, by0 + 7, 58, 2, "#f4f0e6"); rP(bx + 6, by0 + 9, 52, 1, "#3a2414"); rP(bx, by0 + 3, 1, 4, "#3a2414"); rP(bx + 63, by0 + 3, 1, 4, "#3a2414"); rP(bx + 1, by0 + 7, 2, 2, "#3a2414"); rP(bx + 61, by0 + 7, 2, 2, "#3a2414"); rP(bx + 3, by0 + 9, 3, 1, "#3a2414"); rP(bx + 58, by0 + 9, 3, 1, "#3a2414");
    rP(bx + 2, by0 + 4, 60, 1, "#d8463c");
    var ang = rw.drive || rw.h > .5 ? -.9 + rw.h * 1.8 : .9 - (1 - rw.h) * 1.8, inW = rw.drive;                                                          /* the oars: through the water on the stroke, over it on the way back */
    for (var o = 0; o < 4; o++) { var px = bx + 9 + o * 11, py = by0 + 1, ex = px + Math.sin(ang) * 16, ey = py + (inW ? 9 : 4) + Math.cos(ang) * 2; var n = 16; for (var i2 = 0; i2 <= n; i2++) rP(px + (ex - px) * i2 / n, py + (ey - py) * i2 / n, 1, 1, "#a87448"); rP(ex - 1, ey, 3, 2, "#c8945a"); if (inW && Math.random() < .2) rw.splash.push({ x: ex, y: RW_WL, vx: -10, vy: -12, l: .4 }); }
    for (var f = 0; f < 70; f++) { var fx = (f * 7 + Math.floor(t / 90)) % 70; rP(bx - 4 + fx, RW_WL + 2 + (f % 3), 1, 1, f % 2 ? P[4] : P[3]); }                 /* foam along the hull */
    if (rw.v > 8) for (var w2 = 0; w2 < 6; w2++) rP(bx - 6 - w2 * 4 - (Math.floor(t / 80) % 4), RW_WL + 1 + (w2 % 2), 3, 1, "#ffffff");                       /* a little wake */
    rw.splash.forEach(function (s3) { rP(s3.x, s3.y, 1, 1, "#e8f8ff"); });
    // the progress line on top
    rP(20, 3, 140, 4, "#3a2414"); rP(21, 4, 138, 2, "#5a6a7a"); rP(21, 4, Math.round(138 * Math.min(1, rw.d / RW_GOAL)), 2, "#7ae05a"); rw.ev.forEach(function (e) { rP(21 + Math.round(138 * e.d / RW_GOAL), 2, 1, 6, e.k === "swim" ? "#ffd34a" : e.k === "wave" ? "#ffffff" : "#c8e0ec"); });
    // the lower half: inside the boat, the oar handle in two paws
    for (var py2 = 72; py2 < 135; py2++) rP(0, py2, 180, 1, py2 % 9 === 0 ? "#6a3e22" : py2 < 76 ? "#3a2414" : "#9a6038");
    rP(0, 72, 180, 3, "#3a2414"); rP(0, 75, 180, 1, "#c8945a");
    var hy = 84 + Math.round(rw.h * 38), beatU = ((performance.now() - rw.beat) % 1600) / 1600;
    rP(14, hy - 3, 152, 8, "#3a2414"); rP(15, hy - 2, 150, 6, "#b87a46"); rP(15, hy - 2, 150, 1, "#e0a870"); rP(15, hy + 3, 150, 1, "#7a4a28");
    [[56, 1], [112, -1]].forEach(function (pw) { var x = pw[0]; rP(x - 1, hy - 8, 16, 18, "#3a2414"); rP(x, hy - 7, 14, 16, "#e8a040"); rP(x + 2, hy - 1, 10, 7, "#fff0dc"); for (var tq = 0; tq < 4; tq++) rP(x + 1 + tq * 3, hy - 8, 1, 3, "#3a2414"); rP(x + 2, hy + 3, 3, 2, "#f0a0a8"); });
    var cue = !rw.drive && rw.h < .5 ? "down" : rw.drive ? "" : "up", cx = 90, cy = cue === "down" ? 108 : 92, pul = beatU < .25;
    if (cue && !rw.done) { var col = pul ? "#ffe08a" : "#fff8ec"; for (var ar = 0; ar < 6; ar++) rP(cx - ar, cue === "down" ? cy + ar : cy - ar, ar * 2 + 1, 1, col); rP(cx - 1, cue === "down" ? cy - 8 : cy + 1, 3, 8, col); }
    var spd = Math.min(1, rw.v / 40); rP(170, 80, 6, 46, "#3a2414"); rP(171, 81 + Math.round((1 - spd) * 44), 4, Math.round(spd * 44), spd > .55 ? "#e8a040" : "#7ae05a");   /* how fast the boat goes */
    rwc.setTransform(1, 0, 0, 1, 0, 0); dzc = dz0;
  }
  window.__rw = { start: rwStart, st: function () { return rw && { d: Math.round(rw.d), v: Math.round(rw.v), h: rw.h, good: rw.good, bad: rw.bad, hit: rw.hit, picked: rw.picked, done: rw.done }; }, pull: function () { rwSetH(0); var i = 0, iv = setInterval(function () { i++; rwSetH(Math.min(1, i / 8)); if (i >= 8) { clearInterval(iv); setTimeout(function () { rwSetH(0); }, 150); } }, 60); } };
