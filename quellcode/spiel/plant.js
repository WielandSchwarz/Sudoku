
  // ===================== planting minigame: close-up of the bed, weed it, dig the hole (more steps follow) =====================
  var PZ = /*PLANTZOOM*/;
  // a paw print in UI pixels: four toe beans and a round palm, pink with a dark outline, light top and darker bottom
  function pawPrintSvg() {
    var rows = ["...KKK....KKK...", "..KhppK..KhppK..", "..KpppK..KpppK..", "..KppsK..KppsK..", "...KKK....KKK...", ".KKK........KKK.", "KhppK......KhppK", "KpppK......KpppK", "KppsK.KKKK.KppsK", ".KKK.KhpppK.KKK.", "....KhppppsK....", "....KppppppK....", "....KpppppsK....", ".....KppssK.....", "......KKKK......"];
    var C_ = { K: "#3a2414", p: "#f4a3b4", h: "#ffd4de", s: "#e07f95" }, o = "";
    rows.forEach(function (r, y) { for (var x = 0; x < r.length; x++) { var c = C_[r[x]]; if (c) o += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + c + '"/>'; } });
    return '<svg viewBox="0 0 16 15" aria-hidden="true" shape-rendering="crispEdges">' + o + '</svg>';
  }
  // tapping the hamster counts as "Fertig" while a minigame waits for it
  function pzHamDone(e) {
    if (!PZG || pzUi.hidden) return;
    var d = pzUi.querySelector(".pz-done"); if (!d || d.hidden || d.disabled) return;
    var r = ham.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    e.stopImmediatePropagation(); e.preventDefault(); d.click();
  }
  ham.addEventListener("click", pzHamDone, true);
  // the Fertig button itself stays hidden: when the step can be finished, golden sparkles twinkle around the hamster
  var pzReady = document.createElement("div"); pzReady.className = "pz-ready"; pzReady.hidden = true;
  pzReady.innerHTML = [[-6, 18], [104, 30], [94, -4], [8, -10]].map(function (q, k) { return '<i style="left:' + q[0] + '%;top:' + q[1] + '%;animation-delay:' + (-k * 550) + 'ms"></i>'; }).join("");
  scene.appendChild(pzReady);
  setInterval(function () {
    var d = PZG && !pzUi.hidden ? pzUi.querySelector(".pz-done") : null;
    var on = !!d && !d.hidden && !d.disabled; pzReady.hidden = !on; if (!on) return;
    var r = ham.getBoundingClientRect(), sr = scene.getBoundingClientRect();
    pzReady.style.left = (r.left - sr.left) + "px"; pzReady.style.top = (r.top - sr.top) + "px"; pzReady.style.width = r.width + "px"; pzReady.style.height = r.height + "px";
  }, 150);
  setTimeout(function () { if (typeof pzLay !== "undefined" && pzLay) pzLay.addEventListener("click", pzHamDone, true); }, 0);
  // the closer camera (preview): logic coordinates stay, the layer is shown at 2x and sprites come at double density
  var PZCAM = null;
  function pzOnHam(e) { var r = ham.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; }
  function pzLogic(e) { var r = scene.getBoundingClientRect(), sx = (e.clientX - r.left) / r.width * 180, sy = (e.clientY - r.top) / r.height * 135; return PZCAM ? [PZCAM.x + sx / PZCAM.z, PZCAM.y + sy / PZCAM.z] : [sx - PZOFF.x, sy - PZOFF.y]; }
  /* the spot we work on sits a little right of and above the old place, nearer the middle of the screen: the whole layer of
     sprites is shifted (see .pz-lay in life.css), the backdrop stays */
  var PZOFF = { x: 10, y: -8 };
  function pzPxU() { return scene.getBoundingClientRect().width / 180; }   /* css px per logic unit inside the layer (the camera's scale applies on top) */
  function pzSvg(k, vb) {
    var a = PZ[k];
    if (PZCAM && a.svg2 && !vb) return '<svg viewBox="0 0 ' + a.w * 2 + ' ' + a.h * 2 + '" aria-hidden="true" shape-rendering="crispEdges">' + a.svg2 + '</svg>';
    if (PZCAM && a.svg2 && vb) { var v = vb.split(" ").map(Number); return '<svg viewBox="' + v.map(function (n) { return n * 2; }).join(" ") + '" aria-hidden="true" shape-rendering="crispEdges">' + a.svg2 + '</svg>'; }
    return '<svg viewBox="' + (vb || "0 0 " + a.w + " " + a.h) + '" aria-hidden="true" shape-rendering="crispEdges">' + a.svg + '</svg>';
  }
  var PZSTAR = '<svg viewBox="0 0 9 9" aria-hidden="true" shape-rendering="crispEdges"><path fill="#3a2414" d="M4 0h1v2h1v1h3v1H8v1H7v2h1v2H7V8H6V7H3v1H2v1H1V7h1V5H1V4H0V3h3V2h1z"/><path fill="#ffd34a" d="M4 2h1v2h3v1H7v2H6V6H3v1H2V5H1V4h3z"/><path fill="#fff2a0" d="M4 2h1v2H4z"/></svg>';
  var PZSTAR0 = PZSTAR.replace('#ffd34a', '#e6d4ba').replace('#fff2a0', '#efe2cc');
  var DEPTH = { strawberry: [3, 5], herbs: [3, 5], dandelion: [3, 5], chili: [4, 6], tomato: [5, 7], cucumber: [5, 7], sunflower: [6, 8], pumpkin: [6, 8], gcarrot: [8, 10] };
  var pzEl = lEl("div", "l-place l-pz", scene); pzEl.hidden = true;
  var pzBg = lEl("div", "l-bg", pzEl), pzLay = lEl("div", "pz-lay", pzEl);
  var pzUi = lEl("div", "pz-ui pixtext", scene); pzUi.hidden = true;
  var PZG = null;   // the running game
  function pzEsc(x) { return String(x).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function pzPos(el, x, y, w, h) { el.style.left = gx(x); el.style.top = gy(y); el.style.width = gx(w); if (h) el.style.height = gy(h); }
  function pzBanner(t) { var b = pzUi.querySelector(".pz-ban"); b.innerHTML = t; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
  function pzTip(t) { pzUi.querySelector(".pz-tip").innerHTML = t || ""; }
  function pzRenderBg(where) {
    var skyCls = (document.getElementById("sky").className.match(/sky-(eve|night)/) || [""])[0];
    pzEl.classList.toggle("pz-cam", !!PZCAM);
    if (PZCAM) { var art = '<img class="map-l pz-bgart pz-bg2" alt="" src="' + PZ[where === "gh" ? "ghbg2" : "bg2"].png + '">'; pzBg.innerHTML = where === "gh" ? art + '<div class="map-tint mt-' + weather.type + '"></div>' + (skyCls ? '<div class="l-dark ' + skyCls + '"></div>' : "") : outdoorLake(art, skyCls); return; }
    if (where === "gh") pzBg.innerHTML = '<div class="map-sky ' + skyCls + ' mw-' + weather.type + '"></div><div class="map-l pz-bgart">' + pzSvg("ghbg") + '</div><div class="map-tint mt-' + weather.type + '"></div>' + (skyCls ? '<div class="l-dark ' + skyCls + '"></div>' : "");
    else pzBg.innerHTML = outdoorLake('<div class="map-l pz-bgart">' + pzSvg("bg") + '</div>', skyCls);
  }
  function pzCrumbs(x, y, n) {
    for (var k = 0; k < (n || 5); k++) {
      var c = lEl("i", "pz-crumb", pzLay); pzPos(c, x + rnd(-3, 3), y + rnd(-2, 1), PZCAM ? .5 : 1, PZCAM ? .5 : 1);
      c.style.setProperty("--dx", rnd(-10, 10) + "px"); c.style.setProperty("--dy", -rnd(8, 18) + "px"); c.style.background = pick(["#8a5e3a", "#6a4428", "#4e301c"]);
      setTimeout(function (el) { el.remove(); }.bind(null, c), 700);
    }
  }
  async function pzUntil(f) { while (!f()) await wait(80); }

  // ---------- step 1: weeding ----------
  function pzWeeds(G) {
    var n = 2 + Math.floor(Math.random() * 3), xs = [], tries = 0;
    while (xs.length < n && tries++ < 200) { var x = PZCAM ? rnd(40, 90) : rnd(40, 128); if (xs.every(function (o) { return Math.abs(o - x) > (PZCAM ? 18 : 22); })) xs.push(x); }
    G.weeds = xs.map(function (x, k) {
      var y = rnd(84, 104), kind = k % 3, el = lEl("div", "pz-weed", pzLay);
      pzPos(el, x - 9, y - 15, 18, 15); el.style.zIndex = Math.round(y);
      el.innerHTML = pzSvg("weed" + kind, "0 0 18 15");
      var w = { el: el, kind: kind, x: x, y: y, out: false, broken: false };
      pzDrag(G, w); return w;
    });
  }
  // pulling weeds: one big bar at the bottom shows how hard the hamster pulls; the golden range is the steady pull
  function pzTension(ten) {
    var el = pzUi.querySelector(".pz-gauge"); if (!el) return; el.hidden = false;
    el.innerHTML = woodBarSvg({ w: 60, vertical: true, up: true, frac: Math.min(1, ten), zone: [0.25, 0.8], col: function (t) { return t < 0.55 ? mix("#8ac860", "#f0c040", t / 0.55) : mix("#f0c040", "#d8342a", (t - 0.55) / 0.45); } });
  }
  function pzDrag(G, w) {
    var startY = 0, lastY = 0, lastT = 0, t0 = 0, v = 0, over = 0, pull = 0, active = false, meter = null, fill = null;
    function unitsPerPx() { return 135 / scene.getBoundingClientRect().height / (PZCAM ? PZCAM.z : 1); }
    w.el.addEventListener("pointerdown", function (e) {
      if (w.out || w.broken || G.step !== 1) return;
      active = true; pzTension(0); startY = lastY = e.clientY; lastT = t0 = performance.now(); v = 0; over = 0; pull = 0;
      try { w.el.setPointerCapture(e.pointerId); } catch (x) {}
      front({ paws: "hold", eyes: "down", mouth: "teeth" }); body("squat");
      e.preventDefault();
    });
    w.el.addEventListener("pointermove", function (e) {
      if (!active || w.out || w.broken) { active = false; return; }
      var now = performance.now(), dt = Math.max(8, now - lastT), d = (lastY - e.clientY) * unitsPerPx();
      v = v * 0.6 + (d / dt * 1000) * 0.4; lastY = e.clientY; lastT = now;
      pull = Math.max(0, (startY - e.clientY) * unitsPerPx());
      var ten = Math.max(0, Math.min(1.2, v / 80));
      pzTension(ten);
      w.el.style.transform = "translateY(" + (-Math.min(3, pull / 5)) * 100 / 16 + "%) scaleY(" + (1 + Math.min(0.12, pull / 120)) + ")";
      if (pull > 2 && ten > 1.1) { if ((over += dt) > 180) { active = false; pzSnap(G, w); } } else over = 0;
      if (active && pull >= 12) { active = false; if (ten > 1.1 && performance.now() - t0 < 120) pzSnap(G, w); else pzOut(G, w); }
    });
    function end() { if (!active) return; active = false; pzTension(0); w.el.style.transform = ""; front({ paws: "down", eyes: "open", mouth: "smile" }); body(""); if (pull > 3) pzTip("Gleichmäßig weiter nach oben ziehen, bis die Wurzel rauskommt."); }
    w.el.addEventListener("pointerup", end); w.el.addEventListener("pointercancel", end);
  }
  function pzSnap(G, w) {
    w.broken = true; G.snaps++; w.el.style.transform = "";
    w.el.innerHTML = pzSvg("stub", "0 0 18 15"); w.el.classList.add("snap");
    pzCrumbs(w.x, w.y, 3); beep([[220, .06], [160, .08]]);
    front({ eyes: "sad", mouth: "frown", paws: "down" }); body("");
    pzTip("Ritsch, abgerissen! Die Wurzel steckt noch drin. Langsamer ziehen.");
    setTimeout(function () {
      if (!PZG || PZG !== G || w.out) return;
      w.broken = false; w.el.classList.remove("snap"); w.el.innerHTML = pzSvg("weed" + w.kind, "0 0 18 15");
      w.el.classList.add("regrow"); setTimeout(function () { w.el.classList.remove("regrow"); }, 500);
      front({ eyes: "open", mouth: "smile" });
    }, 1100);
  }
  function pzOut(G, w) {
    w.out = true; var om = w.el.querySelector(".pz-meter"); if (om) om.remove();
    w.el.innerHTML = pzSvg("weed" + w.kind); w.el.style.height = gy(26); w.el.style.transform = "";
    w.el.classList.add("yank"); pzCrumbs(w.x, w.y, 6); beep([[520, .05], [780, .07]]);
    front({ eyes: "happy", mouth: "grin", paws: "up" }); pulse("hop", 400);
    var left = G.weeds.filter(function (o) { return !o.out; }).length;
    pzTip(left ? "Raus mit Wurzel! Noch " + left + "." : "");
    setTimeout(function () {
      w.el.classList.remove("yank"); w.el.classList.add("fly"); w.el.style.left = gx(4); w.el.style.top = gy(64);
      setTimeout(function () { w.el.remove(); G.pile++; pzPile(G); }, 520);
    }, 380);
  }
  function pzPile(G) { var p = pzLay.querySelector(".pz-pile"); if (!p) { p = lEl("div", "pz-pile", pzLay); pzPos(p, PZCAM ? 27 : 2, PZCAM ? 64 : 74, 20, 10); p.innerHTML = pzSvg("wpile"); } p.classList.remove("bump"); void p.offsetWidth; p.classList.add("bump"); }

  function pzWorm(G) {
    if (Math.random() < 0.4) return;
    var x = 0, tries = 0; do { x = PZCAM ? rnd(38, 90) : rnd(30, 120); } while (tries++ < 40 && G.weeds.some(function (w) { return Math.abs(w.x - x) < 16; }));
    var el = lBtn("pz-worm", pzLay, pzSvg("worm0"), "Regenwurm"); pzPos(el, x - 7, 104, 14, 10); el.hidden = true; el.style.zIndex = 104;
    G.worm = { el: el, f: 0, tapped: false, seen: false };
    G.wormT = setInterval(function () {
      if (!PZG || G.worm.tapped) return;
      G.worm.f = (G.worm.f + 1) % 2; el.innerHTML = pzSvg("worm" + (G.step === 1 && Math.random() < 0.25 ? 2 : G.worm.f));
    }, 420);
    setTimeout(function () { if (PZG === G && G.step === 1) { el.hidden = false; G.worm.seen = true; el.classList.add("peek"); } }, 1600);
    el.addEventListener("click", function () {
      if (G.worm.tapped) return; G.worm.tapped = true; el.classList.add("hide"); setTimeout(function () { el.hidden = true; }, 400);
      pzTip("Oh! Den Regenwurm lieber in Ruhe lassen, er lockert die Erde."); front({ eyes: "wide", mouth: "open" });
    });
  }

  // ---------- step 2: digging ----------
  // the pixel gauge, lying flat under the tip: level k (1..12) is block k - 1, filled from the left
  function pzGauge(G, lit) {
    var z = G.gz, el = pzUi.querySelector(".pz-gauge"); if (!z || !el) return;
    var done = z.done || z.a; el.innerHTML = woodBarSvg({ w: 60, vertical: true, up: true, frac: Math.min(1, lit / done), zone: null, col: function () { return z.c; } });   /* just progress, no target zone */
  }
  function pzDigSetup(G) {
    var t = DEPTH[G.c] || [5, 7]; G.target = t; G.depth = 0; G.last = null; G.dug = false;
    var hole = lEl("div", "pz-hole", pzLay); pzPos(hole, 70 - 15, 92, 30, 14); hole.style.zIndex = 99; G.holeEl = hole;
    var mark = lEl("div", "pz-mark", pzLay); pzPos(mark, 70 - 1, 96, 2, 2);
    var gauge = pzUi.querySelector(".pz-gauge"); gauge.hidden = false;
    G.gz = { a: t[0], b: t[1], c: "#8a5e3a" }; pzGauge(G, 0);
    G.pawEls = ["l", "r"].map(function (sd) { var e = lEl("div", "pz-pawmark", pzLay, pawPrintSvg()); if (PZCAM) pzPos(e, sd === "l" ? 45 : 86, 94, 9, 8); else pzPos(e, sd === "l" ? 38 : 88, 92, 14, 13); e.dataset.p = sd; e.style.zIndex = 110; return e; });
    pzUi.querySelector(".pz-done").hidden = false; pzUi.querySelector(".pz-done").disabled = true;
    pzTip("Abwechselnd links und rechts tippen, bis das Loch tief genug ist.");
  }
  function pzDigTap(G, side) {
    if (G.step !== 2 || G.dug) return;
    if (G.last === side) {
      G.slips++; pzTip("Abwechselnd buddeln, links, rechts, links …"); G.holeEl.classList.remove("wob"); void G.holeEl.offsetWidth; G.holeEl.classList.add("wob");
      front({ eyes: "wide", mouth: "open" }); beep([[200, .05]]); return;
    }
    G.last = side; G.depth++;
    (G.pawEls || []).forEach(function (b) { b.classList.toggle("next", b.dataset.p !== side && G.depth < 12); b.classList.toggle("tap", b.dataset.p === side); void b.offsetWidth; });
    front({ paws: side === "l" ? "hold" : "down", eyes: "down", mouth: "teeth" }); body(side === "l" ? "squat" : "");
    pzCrumbs(70 + (side === "l" ? -8 : 8), 96, 4); beep([[300 + G.depth * 30, .04]]);
    G.holeEl.innerHTML = pzSvg("hole" + Math.min(6, Math.ceil(G.depth / 2)));
    pzGauge(G, G.depth);
    /* deep enough: the step finishes by itself, no tap on the hamster */
    if (G.depth >= G.target[0]) { pzTip("Genau richtig!"); setTimeout(function () { if (G.step === 2 && !G.dug) G.dug = true; }, 380); }
    if (false) {
      G.found = pick(["stone", "shell", "stick", "feather"]); addMat(G.found, 1);
      var f = lEl("div", "pz-find", pzLay, matIcon(G.found)); pzPos(f, 66, 88, 8, 8); setTimeout(function () { f.remove(); }, 1500);
      say(N() + " findet beim Buddeln " + { stone: "einen Stein", shell: "eine Muschel", stick: "einen Stock", feather: "eine Feder" }[G.found] + "!");
    }
    if (G.depth >= 12) {
      G.stone = true; G.dug = true; var st = lEl("div", "pz-stonehit", pzLay, pzSvg("pzstone")); pzPos(st, 65, 97, 10, 7);
      beep([[140, .1], [110, .12]]); front({ eyes: "wide", mouth: "open", paws: "up" }); pzTip("Klonk! Ein Stein, tiefer geht es nicht.");
    }
  }

  // ---------- greenhouse step 1: brush the aphids off ----------
  function pzAphids(G) {
    var n = 4 + Math.floor(Math.random() * 3);
    G.aphids = [];
    for (var k = 0; k < n; k++) {
      var a = { x: rnd(22, 128), y: rnd(76, 108), dx: rnd(-1, 1) || 0.5, gone: false, f: 0 };
      a.el = lEl("div", "pz-aphid", pzLay, pzSvg("aphid0")); pzPos(a.el, a.x - 3.5, a.y - 4, 7, 5); a.el.style.zIndex = Math.round(a.y);
      G.aphids.push(a);
    }
    G.aphT = setInterval(function () {
      G.aphids.forEach(function (a) {
        if (a.gone) return; a.f ^= 1; a.x += a.dx * 0.8; if (a.x < 16 || a.x > 134) a.dx = -a.dx;
        a.el.innerHTML = pzSvg("aphid" + a.f); a.el.style.left = gx(a.x - 3.5); a.el.classList.toggle("flip", a.dx < 0);
      });
    }, 260);
    var hit = lEl("div", "pz-brush", pzLay); pzPos(hit, 0, 66, 180, 54);
    function brushAt(e) {
      var lp = pzLogic(e), x = lp[0], y = lp[1];
      G.aphids.forEach(function (a) {
        if (a.gone || Math.abs(a.x - x) > 7 || Math.abs(a.y - y) > 7) return;
        a.gone = true; a.el.classList.add("away"); a.el.style.setProperty("--dx", (a.x < x ? -1 : 1) * rnd(20, 50) + "px");
        beep([[700 + rnd(0, 200), .04]]); front({ eyes: "happy", mouth: "grin" });
        var left = G.aphids.filter(function (o) { return !o.gone; }).length; pzTip(left ? "Weg damit! Noch " + left + "." : "");
        setTimeout(function () { a.el.remove(); }, 600);
      });
    }
    var down = false;
    hit.addEventListener("pointerdown", function (e) { if (pzOnHam(e)) return; down = true; try { hit.setPointerCapture(e.pointerId); } catch (x) {} brushAt(e); front({ paws: "hold", eyes: "down" }); });
    hit.addEventListener("pointermove", function (e) { if (down) brushAt(e); });
    ["pointerup", "pointercancel"].forEach(function (t) { hit.addEventListener(t, function () { down = false; front({ paws: "down" }); }); });
    G.brushEl = hit;
  }

  // ---------- step 3: sowing, drop the swinging seed into the hole ----------
  var NSEED = { strawberry: 2, herbs: 2, dandelion: 2, gcarrot: 2 };
  var SEEDK = { sunflower: "seeds", pumpkin: "seedp", cucumber: "seedp" };
  function pzSowSetup(G) {
    G.need = NSEED[G.c] || 1; G.sown = 0; G.misses = 0; G.dropping = false; G.t0 = performance.now(); G.speed = 1.7;
    var el = lEl("div", "pz-seed", pzLay, pzSvg(SEEDK[G.c] || "seeda")); pzPos(el, 67.5, 60, 5, 6); el.style.zIndex = 120; G.seedEl = el;
    var line = lEl("div", "pz-line", pzLay); pzPos(line, 70, 40, 0.5, 20); G.lineEl = line;
    G.holeR = 3 + Math.min(6, Math.ceil(G.depth / 2)) * 0.9;
    function frame() {
      if (PZG !== G || G.step !== 3) return;
      if (!G.dropping) { G.sx = 70 + Math.sin((performance.now() - G.t0) / 1000 * G.speed) * 34; el.style.left = gx(G.sx - 2.5); el.style.top = gy(60); line.style.left = gx(G.sx); line.hidden = false; }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    pzUi.querySelector(".pz-act").hidden = true;
    pzTip(G.need > 1 ? "Tippe, wenn der Samen über dem Loch ist. " + G.need + " Samen gehören hinein." : "Tippe, wenn der Samen genau über dem Loch ist.");
  }
  function pzDrop(G) {
    if (G.step !== 3 || G.dropping) return;
    G.dropping = true; var x = G.sx, el = G.seedEl, hitIt = Math.abs(x - 70) <= G.holeR;
    G.lineEl.hidden = true; el.classList.add("drop"); el.style.top = gy(hitIt ? 95 : 96 + rnd(-2, 3)); beep([[600, .03], [400, .05]]);
    setTimeout(function () {
      if (PZG !== G) return;
      el.classList.remove("drop");
      if (hitIt) {
        G.sown++; el.classList.add("in"); front({ eyes: "happy", mouth: "grin", paws: "up" }); pulse("hop", 380); beep([[660, .05], [880, .08]]);
        var dot = lEl("div", "pz-sown", pzLay, pzSvg(SEEDK[G.c] || "seeda")); pzPos(dot, 70 - 2.5 + (G.sown - 1) * 3 - (G.need - 1) * 1.5, 97, 5, 6); dot.style.zIndex = 100;
        pzTip(G.sown < G.need ? "Plopp, genau rein! Noch " + (G.need - G.sown) + "." : "Plopp! Alle Samen liegen im Loch.");
      } else {
        G.misses++; el.classList.add("miss"); front({ eyes: "wide", mouth: "open" }); beep([[240, .06]]);
        pzTip("Daneben! " + N() + " holt den Samen zurück. Noch mal.");
      }
      setTimeout(function () {
        if (PZG !== G) return;
        el.classList.remove("in", "miss");
        if (G.sown >= G.need) { el.hidden = true; return; }
        G.t0 = performance.now() - rnd(0, 2000); G.speed += 0.25; G.dropping = false; front({ eyes: "open", mouth: "smile", paws: "down" });
      }, hitIt ? 450 : 900);
    }, 380);
  }

  // ---------- step 4: cover the hole, then pat it down ----------
  function pzCoverSetup(G) {
    G.fill = 0; G.pats = 0; G.covered = false;
    var gauge = pzUi.querySelector(".pz-gauge"), segs = "";
    G.gz = { a: 9, b: 10, done: 8, c: "#8a5e3a" }; pzGauge(G, 0); gauge.hidden = false;
    var hit = lEl("div", "pz-cover", pzLay); pzPos(hit, 30, 74, 80, 40); G.coverEl = hit; hit.style.zIndex = 112;
    var last = null;
    function unitsPerPx() { return 180 / scene.getBoundingClientRect().width / (PZCAM ? PZCAM.z : 1); }
    hit.addEventListener("pointerdown", function (e) { if (G.step !== 4 || G.covered || pzOnHam(e)) return; last = { x: e.clientX, y: e.clientY }; try { hit.setPointerCapture(e.pointerId); } catch (x) {} front({ paws: "hold", eyes: "down", mouth: "teeth" }); });
    hit.addEventListener("pointermove", function (e) {
      if (!last || G.step !== 4 || G.covered) return;
      var d = Math.hypot(e.clientX - last.x, e.clientY - last.y) * unitsPerPx(); last = { x: e.clientX, y: e.clientY };
      if (d < 0.3) return;
      G.fill = Math.min(150, G.fill + d * 0.45); pzCoverDraw(G);   /* half as fast: a good while of wiping back and forth */
      if (Math.random() < 0.35) pzCrumbs(70 + rnd(-10, 10), 92, 2);
    });
    ["pointerup", "pointercancel"].forEach(function (t) { hit.addEventListener(t, function () { last = null; front({ paws: "down", eyes: "open", mouth: "smile" }); }); });
    pzUi.querySelector(".pz-done").hidden = false; pzUi.querySelector(".pz-done").disabled = true; pzUi.querySelector(".pz-done").textContent = "Festklopfen";
    pzTip("Mit dem Finger hin und her über das Loch wischen, bis es zu ist.");
  }
  function pzCoverDraw(G) {
    var f = G.fill;
    if (f < 100) { G.holeEl.innerHTML = pzSvg("hole" + Math.max(0, Math.round(6 * (1 - f / 100)))); G.holeEl.hidden = f > 92; }
    else G.holeEl.hidden = true;
    pzLay.querySelectorAll(".pz-sown").forEach(function (s) { s.hidden = f > 30; });
    var m = pzLay.querySelector(".pz-mound");
    if (f >= 85) { if (!m) { m = lEl("div", "pz-mound", pzLay); pzPos(m, 55, 93, 30, 9); m.style.zIndex = 101; } m.innerHTML = pzSvg("mound" + (f < 110 ? 0 : f < 125 ? 1 : f < 140 ? 2 : 3)); }
    pzGauge(G, Math.max(0, Math.min(12, Math.floor((f + 6) / 12.5))));
    if (f >= 100 && !G.covered && G.step === 4) { pzTip("Genug Erde!"); G.covered = true; pzUi.querySelector(".pz-done").hidden = true; }   /* finishes by itself */
  }
  async function pzPat(G) {
    G.covered = true; pzUi.querySelector(".pz-done").hidden = true;
    for (var k = 0; k < 3; k++) {
      front({ paws: "up", eyes: "happy", mouth: "teeth" }); body("squat"); await wait(160);
      front({ paws: "down" }); body(""); beep([[160, .06]]); pzCrumbs(70 + rnd(-6, 6), 96, 3);
      var m = pzLay.querySelector(".pz-mound"); if (m) { m.classList.remove("pat"); void m.offsetWidth; m.classList.add("pat"); }
      await wait(220);
    }
    var m2 = pzLay.querySelector(".pz-mound");
    if (m2 && G.fill <= 125) m2.innerHTML = pzSvg("mound0");
    G.patted = true;
  }
  // ---------- step 5: pat it down: the player taps the filled hole again and again, the hamster pats once per tap ----------
  function pzTampSetup(G) {
    G.pats = 0; G.patted = false; G.need = G.fill > 125 ? 8 : 5; G.lvl0 = G.fill < 110 ? 0 : G.fill < 125 ? 1 : G.fill < 140 ? 2 : 3;
    G.gz = { a: 12, b: 12, c: "#8a5e3a" }; pzGauge(G, 0); pzUi.querySelector(".pz-gauge").hidden = false;
    H.dir = -1; moveTo(104, 130, 450);                                       // he comes over to the hole to pat it
    var hit = lEl("div", "pz-tamp", pzLay); pzPos(hit, 48, 80, 44, 24); hit.style.zIndex = 112; G.tampEl = hit;
    var paw = lEl("div", "pz-pawmark next", hit, pawPrintSvg()); paw.style.left = "34%"; paw.style.top = "8%"; paw.style.width = "32%"; paw.style.height = "54%";
    hit.addEventListener("pointerdown", async function (e) { if (pzOnHam(e)) return;
      e.preventDefault(); e.stopPropagation();
      if (PZG !== G || G.step !== 45 || G.patted || G.patBusy) return;
      G.patBusy = true; paw.classList.remove("tap"); void paw.offsetWidth; paw.classList.add("tap");
      front({ paws: "up", eyes: "happy", mouth: "teeth" }); body("squat"); await wait(110);
      front({ paws: "down" }); body(""); beep([[150 + G.pats * 14, .06]]); pzCrumbs(70 + rnd(-6, 6), 96, 3);
      G.pats++;
      if (G.holeEl) G.holeEl.hidden = true; pzLay.querySelectorAll(".pz-sown").forEach(function (x) { x.hidden = true; });
      var m = pzLay.querySelector(".pz-mound");
      if (!m) { m = lEl("div", "pz-mound", pzLay); pzPos(m, 55, 93, 30, 9); m.style.zIndex = 101; }
      m.innerHTML = pzSvg("mound" + Math.round(G.lvl0 * (1 - G.pats / G.need)));
      m.classList.remove("pat"); void m.offsetWidth; m.classList.add("pat");
      pzGauge(G, Math.round(12 * G.pats / G.need));
      await wait(90); G.patBusy = false;
      if (G.pats >= G.need) { G.patted = true; paw.remove(); front({ eyes: "happy", mouth: "grin", paws: "up" }); setTimeout(function () { if (PZG === G) moveTo(150, 130, 450); }, 700); }
    });
  }

  // ---------- step 5: watering (can in the garden, spray bottle in the greenhouse) ----------
  function pzWaterSetup(G) {
    G.wet = 0; G.watered = false; G.pouring = false;
    var gauge = pzUi.querySelector(".pz-gauge"), segs = "";
    G.gz = { a: 8, b: 10, done: 9, c: "#5aa0c8", off: "#dbe8f0" }; pzGauge(G, 0); gauge.hidden = false;
    var gh = G.where === "gh", tool = lEl("div", "pz-tool " + (gh ? "spray" : "can"), pzLay, pzSvg(gh ? "spray" : "can"));
    if (gh) pzPos(tool, 80, 66, 12, 20); else if (typeof P2A === "object" && P2A.can2) { var tx = G.fur ? 65 : 70, ty = G.plantEl ? 34 : 54; G.canX = tx; G.canY = ty + 13; tool.innerHTML = P2A.can2; pzPos(tool, tx + 3, ty, 40, 26); }   /* the can hangs where the watering happens: over the plant, or low over the row */ else pzPos(tool, 76, 64, 26, 16);
    tool.style.zIndex = 400; G.toolEl = tool;   /* always in front: nothing ever covers the can */
    pzUi.querySelector(".pz-act").hidden = true; tool.classList.add("pz-hint");
    pzUi.querySelector(".pz-done").hidden = false; pzUi.querySelector(".pz-done").disabled = true; pzUi.querySelector(".pz-done").textContent = "Fertig";
    pzTip(gh ? "Auf <b>Sprühen</b> tippen, bis die Erde feucht ist." : "Gedrückt halten, dann gießt " + N() + ".");
    if (!gh) {
      var lastT = 0;
      G.pourT = setInterval(function () {
        var now = performance.now(), dt = lastT ? (now - lastT) / 1000 : 0; lastT = now;
        if (!G.pouring || G.watered) { tool.classList.remove("tilt"); return; }
        tool.classList.add("tilt"); G.wet = Math.min(130, G.wet + dt * 26);
        for (var k = 0; k < 2; k++) { var d = lEl("i", "pz-drop", pzLay); pzPos(d, (G.canX || 70) + 2 + rnd(-4, 3), G.canY || 47, PZCAM ? .5 : 1, PZCAM ? 1.5 : 2); d.style.zIndex = 125; setTimeout(function (el) { el.remove(); }.bind(null, d), 520); }
        pzWetDraw(G);
      }, 90);
    }
  }
  function pzSprayTap(G) {
    if (G.step !== 5 || G.watered || G.where !== "gh") return;
    G.wet = Math.min(130, G.wet + 8); G.toolEl.classList.remove("puff"); void G.toolEl.offsetWidth; G.toolEl.classList.add("puff");
    for (var k = 0; k < 6; k++) { var d = lEl("i", "pz-mist", pzLay); pzPos(d, 76 + rnd(-8, 0), 70 + rnd(-3, 3), PZCAM ? .5 : 1, PZCAM ? .5 : 1); d.style.setProperty("--dx", -rnd(6, 20) + "px"); d.style.setProperty("--dy", rnd(4, 18) + "px"); d.style.zIndex = 125; setTimeout(function (el) { el.remove(); }.bind(null, d), 600); }
    beep([[900, .02]]); front({ paws: "hold", eyes: "happy", mouth: "smile" }); pzWetDraw(G);
  }
  function pzWetDraw(G) {
    var w = G.wet;
    pzGauge(G, Math.max(0, Math.min(12, Math.floor((w + 4) * 12 / 100))));
    if (w >= 72 && !G.watered && G.step === 5) { G.watered = true; G.pouring = false; }   /* moist enough: finishes by itself */
    var m = pzLay.querySelector(".pz-mound"); if (m) m.classList.toggle("wet", w > 40);
    if (w > 100 && !pzLay.querySelector(".pz-puddle")) { var p = lEl("div", "pz-puddle", pzLay, pzSvg("puddle")); pzPos(p, 52, 99, 36, 7); p.style.zIndex = 102; pzTip("Platsch, eine Pfütze. Das war zu viel Wasser."); front({ eyes: "wide", mouth: "open" }); }
    else if (w >= 66 && w <= 84) pzTip("Genau richtig feucht!");
  }

  // ---------- the whole game ----------
  async function plantGame(i, c, where) {
    where = where || "garden";
    if (where === "garden") await toPlot(i); else await walkTo(GHX[i], 122);
    fadeX(false); await wait(260);
    var G = PZG = { i: i, c: c, where: where, step: 1, snaps: 0, slips: 0, pile: 0, weeds: [], worm: null, misses: 0 };
    pzLay.innerHTML = ""; pzRenderBg(where); pzEl.hidden = false; pzEl.classList.add("in");
    pzUi.innerHTML = '<div class="pz-ban"></div><div class="pz-tip"></div><div class="pz-gauge" hidden></div>' +
      '<div class="pz-row"><div class="pz-paws" hidden><button type="button" data-p="l" aria-label="Linke Pfote">' + pawPrintSvg() + '</button><button type="button" data-p="r" aria-label="Rechte Pfote">' + pawPrintSvg() + '</button></div>' +
      '<button type="button" class="pz-act pbtn" hidden></button>' +
      '<button type="button" class="pz-done pbtn" hidden>Fertig</button></div><button type="button" class="pz-x" aria-label="Abbrechen">×</button><div class="pz-res" hidden></div>';
    pzUi.hidden = false;
    pzUi.onclick = function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.classList.contains("pz-done")) {
        if (G.step === 2 && G.depth > 0) G.dug = true;
        else if (G.step === 4 && G.fill >= 70 && !G.covered) { G.covered = true; pzUi.querySelector(".pz-done").hidden = true; }
        else if (G.step === 5 && G.wet >= 20) G.watered = true;
        return;
      }
      if (b.classList.contains("pz-act")) { if (G.step === 3) pzDrop(G); else if (G.step === 5) pzSprayTap(G); return; }
      if (b.classList.contains("pz-x")) { G.cancel = true; return; }
      if (b.classList.contains("pz-ok")) { G.ok = true; return; }
    };
    pzUi.onpointerdown = function (e) {
      var b = e.target.closest("[data-p]"); if (b) { e.preventDefault(); pzDigTap(G, b.dataset.p); return; }
      if (G.step === 5 && G.where !== "gh" && e.target.closest(".pz-act")) { e.preventDefault(); G.pouring = true; front({ paws: "hold", eyes: "happy", mouth: "smile" }); }
    };
    var stopPour = function () { if (G.pouring) { G.pouring = false; front({ paws: "down" }); } };
    pzUi.addEventListener("pointerup", stopPour); pzUi.addEventListener("pointercancel", stopPour); pzUi.addEventListener("pointerleave", stopPour);
    pzUi.querySelector(".pz-paws").addEventListener("click", function (e) { e.stopPropagation(); }, true);
    pzLay.onclick = function () { if (G.step === 3) pzDrop(G); };
    function onHam(e) { var r = ham.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; }
    pzLay.onpointerdown = function (e) {
      if (PZG !== G || onHam(e)) return;
      var lp0 = pzLogic(e), wx = lp0[0];
      if (G.step === 2 && !G.dug) { if (PZCAM && (Math.abs(wx - 70) > 30 || lp0[1] < 80 || lp0[1] > 112)) return; e.preventDefault(); pzDigTap(G, wx < 70 ? "l" : "r"); }
      else if (G.step === 5 && !G.watered) {
        e.preventDefault(); if (G.toolEl) G.toolEl.classList.remove("pz-hint");
        if (G.where === "gh") pzSprayTap(G); else { G.pouring = true; front({ paws: "hold", eyes: "happy", mouth: "smile" }); }
      }
    };
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (t) { pzLay.addEventListener(t, function () { if (PZG === G && G.pouring) { G.pouring = false; front({ paws: "down" }); } }); });
    var keyH = function (e) {
      if (G.step === 2 && (e.key === "ArrowLeft" || e.key === "ArrowRight")) { e.preventDefault(); pzDigTap(G, e.key === "ArrowLeft" ? "l" : "r"); }
      else if (G.step === 3 && e.key === " ") { e.preventDefault(); pzDrop(G); }
    };
    document.addEventListener("keydown", keyH);
    G.hz = ham.style.zIndex; scene.insertBefore(ham, document.getElementById("thought")); ham.style.zIndex = ""; scene.classList.add("pz-on");
    moveTo(150, 130, 0); H.dir = -1; front({ eyes: "happy", mouth: "smile", paws: "down" }); fadeX(true);
    var gh = where === "gh", rainy = !gh && (weather.type === "rain" || weather.type === "storm");
    function chk() { if (G.cancel) throw "cancel"; }
    try {
      // 1 · weeds in the garden, aphids in the greenhouse
      if (gh) {
        pzBanner("1 · Blattläuse wegwischen"); pzAphids(G);
        pzTip("Mit dem Finger über die Blattläuse wischen, dann krabbeln sie davon.");
        await pzUntil(function () { return G.cancel || G.aphids.every(function (a) { return a.gone; }); }); chk();
        clearInterval(G.aphT); G.brushEl.remove(); await wait(500);
        pzBanner("Keine Läuse mehr!"); front({ eyes: "happy", mouth: "grin", paws: "up" }); await wait(1100);
      } else {
        pzBanner("1 · Unkraut jäten"); pzWeeds(G); pzWorm(G);
        pzTip("Unkraut mit dem Finger langsam nach oben ziehen. Zu schnell, und es reißt ab.");
        await pzUntil(function () { return G.cancel || G.weeds.every(function (w) { return w.out; }); }); chk();
        await wait(700);
        if (G.worm) G.worm.el.classList.add("hide");
        G.wormOk = G.worm && G.worm.seen && !G.worm.tapped;
        pzBanner(G.wormOk ? "Sauber gejätet! Der Regenwurm bleibt im Beet." : "Sauber gejätet!"); front({ eyes: "happy", mouth: "grin", paws: "up" }); await wait(1300);
      }
      // 2 · dig
      G.step = 2; pzBanner("2 · Loch buddeln"); pzDigSetup(G);
      await pzUntil(function () { return G.cancel || G.dug; }); chk();
      pzUi.querySelector(".pz-paws").hidden = true; pzUi.querySelector(".pz-done").hidden = true; pzUi.querySelector(".pz-gauge").hidden = true; (G.pawEls || []).forEach(function (e) { e.remove(); });
      await wait(G.stone ? 1200 : 500);
      var st = pzLay.querySelector(".pz-stonehit"); if (st) st.remove();
      // 3 · sow
      G.step = 3; pzBanner("3 · Samen einpflanzen"); pzSowSetup(G);
      await pzUntil(function () { return G.cancel || (G.sown >= G.need && !G.dropping) || (G.sown >= G.need && G.seedEl.hidden); }); chk();
      await pzUntil(function () { return G.cancel || G.seedEl.hidden; }); chk();
      pzUi.querySelector(".pz-act").hidden = true; G.lineEl.remove(); pzLay.querySelector(".pz-mark") && pzLay.querySelector(".pz-mark").remove();
      await wait(500);
      // 4 · cover
      G.step = 4; pzBanner("4 · Zuschütten"); pzCoverSetup(G);
      await pzUntil(function () { return G.cancel || G.covered; }); chk();
      G.coverEl.remove(); await wait(300);
      // 5 · pat down: tap the hole until it is firm
      G.step = 45; pzBanner("5 · Festklopfen"); pzTampSetup(G);
      await pzUntil(function () { return G.cancel || G.patted; }); chk();
      if (G.tampEl) G.tampEl.remove(); pzUi.querySelector(".pz-gauge").hidden = true;
      pzBanner("Schön festgeklopft!"); await wait(900);
      // 6 · water
      G.step = 5;
      if (rainy) { pzBanner("6 · Gießen? Macht heute der Regen!"); pzTip(""); G.wet = 75; G.rainDid = true; front({ eyes: "happy", mouth: "grin", paws: "up" }); await wait(1800); }
      else {
        pzBanner(gh ? "6 · Einsprühen" : "6 · Gießen"); pzWaterSetup(G);
        await pzUntil(function () { return G.cancel || G.watered; }); chk();
        G.pouring = false; clearInterval(G.pourT); pzUi.querySelector(".pz-act").hidden = true; pzUi.querySelector(".pz-done").hidden = true;
        if (G.toolEl) G.toolEl.classList.remove("tilt"); await wait(500);
      }
      // result
      var off = G.depth < G.target[0] ? G.target[0] - G.depth : G.depth > G.target[1] ? G.depth - G.target[1] : 0, pen = 0, notes = [];
      if (gh) notes.push("Alle Blattläuse verscheucht");
      else {
        if (G.snaps >= 2) { pen++; notes.push("Unkraut " + G.snaps + "× abgerissen"); } else notes.push(G.snaps ? "Fast alles mit Wurzel raus" : "Alles mit Wurzel raus");
        if (G.worm && G.worm.tapped) { pen++; notes.push("Regenwurm gestört"); } else if (G.wormOk) notes.push("Regenwurm geschont");
      }
      if (G.stone || off >= 2) { pen++; notes.push(G.stone ? "Auf einen Stein gestoßen" : "Loch " + (G.depth < G.target[0] ? "zu flach" : "zu tief")); }
      else notes.push(off ? "Loch fast richtig tief" : "Loch genau richtig tief");
      if (G.misses >= 2) { pen++; notes.push("Samen " + G.misses + "× danebengefallen"); } else notes.push(G.misses ? "Samen fast auf Anhieb im Loch" : "Samen sofort im Loch");
      if (G.fill > 125) { pen++; notes.push("Zu viel Erde, ein Maulwurfshügel"); } else if (G.fill < 95) { pen++; notes.push("Loch nicht ganz zu"); } else notes.push("Gut zugeschüttet");
      if (G.rainDid) notes.push("Der Regen hat gegossen");
      else if (G.wet > 100) { pen++; notes.push("Zu viel Wasser, eine Pfütze"); } else if (G.wet < 55) { pen++; notes.push("Zu wenig Wasser"); } else notes.push(G.wet >= 66 && G.wet <= 84 ? "Genau richtig gegossen" : "Gut gegossen");
      var stars = 3 - (pen >= 3 ? 2 : pen >= 1 ? 1 : 0); if (G.wormOk && stars < 3 && pen < 3) stars++;
      stars = Math.max(1, Math.min(3, stars)); G.step = 6;
      var res = pzUi.querySelector(".pz-res");
      res.innerHTML = '<p class="pz-stars">' + [0, 1, 2].map(function (k) { return k < stars ? PZSTAR : PZSTAR0; }).join("") + '</p>' +
        '<ul>' + notes.map(function (n) { return '<li>' + n + '</li>'; }).join("") + '</ul>' +
        '<p class="pz-soon">' + (stars === 3 ? "Drei Sterne: Die Pflanze wächst mit einem guten Vorsprung los." : stars === 2 ? "Zwei Sterne: Die Pflanze bekommt einen kleinen Vorsprung." : "Gepflanzt ist gepflanzt. Beim nächsten Mal klappt es noch besser.") + '</p>' +
        '<button type="button" class="pbtn pz-ok">' + (stars === 3 ? "Super!" : "Weiter") + '</button>';
      res.hidden = false; pzBanner(stars === 3 ? "Perfekt gepflanzt!" : "Gepflanzt!");
      front({ eyes: "happy", mouth: "grin", paws: "up", blush: stars === 3 }); pulse("hop", 420);
      beep(stars === 3 ? [[523, .08], [659, .08], [784, .12]] : [[523, .08], [659, .1]]);
      await pzUntil(function () { return G.ok || G.cancel; });
      // plant it for real; good watering counts as watered
      var plot = { crop: c, prog: (stars - 1) * 0.06, wetUntil: G.wet >= 40 ? Date.now() + 2 * 3600000 : 0, stars: stars };
      garden.seeds[c]--;
      if (gh) life().gh[i] = plot; else garden.plots[i] = plot;
 
      await pzClose(G, i);
      if (gh) renderGH(); else renderBed();
      front({ eyes: "happy", mouth: "grin", paws: "down" });
      say(CROPS[c].name + " ist gepflanzt" + (stars > 1 ? " und hat einen Vorsprung" : "") + "." + (gh ? "" : " Reif in " + fmtH(hoursLeft(garden.plots[i])) + "."));
      await wait(500);
    } catch (e) {
      if (e === "cancel") { await pzClose(G, i); say("Pflanzen abgebrochen. Die Samen sind noch da."); }
      else { pzClose(G, i, true); throw e; }
    } finally { document.removeEventListener("keydown", keyH); }
  }
  async function pzClose(G, i, quick) {
    ["wormT", "aphT", "pourT"].forEach(function (k) { if (G[k]) clearInterval(G[k]); });
    PZG = null; pzUi.hidden = true; pzUi.innerHTML = ""; pzLay.onclick = null; pzLay.onpointerdown = null;
    if (!quick) { fadeX(false); await wait(220); }
    pzEl.hidden = true; pzEl.classList.remove("in"); pzLay.innerHTML = ""; scene.classList.remove("pz-on");
    if (place2 === "garden") { gardenEl.insertBefore(ham, gEl("g-fg")); ham.style.zIndex = G.hz || ""; moveTo(plotX(i) + 1, BR.y0, 0); }
    else moveTo(GHX[i], 122, 0);
    fadeX(true);
  }

  // the seed pickers get a switch: plant it yourself (minigame) or let the hamster do it
  function pzSwitch(host) { return;                 // no switch any more: planting is always the little game
    var L = life(), sw = document.createElement("label"); sw.className = "pz-switch";
    sw.innerHTML = '<input type="checkbox"' + (L.selfPlant !== false ? " checked" : "") + '><span>Selbst pflanzen (Minispiel)</span>';
    sw.querySelector("input").addEventListener("change", function (e) { L.selfPlant = e.target.checked; if (window.SudokuSave) window.SudokuSave(); });
    sw.addEventListener("click", function (e) { e.stopPropagation(); });
    host.insertBefore(sw, host.querySelector(".pn"));
  }
  var _pz_plotTap = plotTap;
  plotTap = function (i) {
    _pz_plotTap(i);
    if (pop && pop.classList.contains("seeds") && place2 === "garden") pzSwitch(pop);
  };
  var _pz_plantSeq = plantSeq;
  plantSeq = function (i, c) {
    if (place2 === "garden" && true) { cur = "plantgame"; return plantGame(i, c, "garden"); }
    return _pz_plantSeq(i, c);
  };
  // greenhouse: the seed popup gets the same switch; a chosen seed starts the game instead of the quick planting
  ghUi.addEventListener("click", function (e) {
    var b = e.target.closest(".l-ghbox"); if (!b || decor) return;
    setTimeout(function () { if (lPop && lPop.classList.contains("seeds")) pzSwitch(lPop); }, 0);
  });
  scene.addEventListener("click", function (e) {
    var r = e.target.closest(".l-pop.seeds .seedrow"); if (!r || r.disabled || place2 !== "greenhouse" || false) return;
    e.stopPropagation(); e.preventDefault();
    var i = +(lPop && lPop.dataset.gi), c = r.dataset.seed; closeLPop();
    if (isNaN(i)) return; if (s.asleep) { say(N() + " schläft gerade."); return; }
    if (busy) interrupt(); act("plant", function () { cur = "plantgame"; return plantGame(i, c, "gh"); });
  }, true);
  ghUi.addEventListener("click", function (e) { var b = e.target.closest(".l-ghbox"); if (b) setTimeout(function () { if (lPop && lPop.classList.contains("seeds")) lPop.dataset.gi = b.dataset.i; }, 0); });
  window.__pz = function () { return PZG; };
