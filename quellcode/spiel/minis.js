  // ===================== two nautical mini games (preview demos): harbour shunting and wreck diving =====================
  var miA = /*MINISART*/;
  var miI = {}; Object.keys(miA).forEach(function (k) { if (typeof miA[k] === "string" && miA[k].indexOf("data:") === 0) { var im = new Image(); im.src = miA[k]; miI[k] = im; } });
  function mOk(k) { var im = miI[k]; return im && im.complete && im.naturalWidth > 0; }
  function mPov(cls, label) {
    var el = xEl("div", "bee-pov fi-pov " + cls, scene); el.hidden = true;
    el.innerHTML = '<canvas width="180" height="135" class="fi-cv"></canvas><b class="bp-ban"></b><div class="fi-card" hidden></div><button type="button" class="bp-x" aria-label="' + label + '">×</button>';
    var cv = el.querySelector("canvas"), c = cv.getContext("2d"); c.imageSmoothingEnabled = false;
    return { el: el, cv: cv, c: c, card: el.querySelector(".fi-card"), ban: el.querySelector(".bp-ban") };
  }
  function mBan(V, t) { if (V.ban.textContent === t) return; V.ban.textContent = t; V.ban.classList.remove("pop"); void V.ban.offsetWidth; V.ban.classList.add("pop"); }
  function mPt(V, e) { var r = V.cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 180, (e.clientY - r.top) / r.height * 135]; }
  function mR(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
  function mStars(n) { var o = ""; for (var i = 0; i < 3; i++) o += i < n ? "★" : "<i>★</i>"; return '<span class="fi-st">' + o + '</span>'; }
  function mL(k) { var L = life(); L[k] = L[k] || {}; return L[k]; }

  // ---------------------------------------------------------------- harbour shunting
  // A sliding puzzle seen from above: boats only go forwards and backwards; bring the Pausbacke out through the gap on the right to her pier.
  var hbV = mPov("mh-pov", "Hafen verlassen"), hbG = { x: 40, y: 20, c: 16 }, hbS = null;
  function hSprite(p, i) {
    if (i === 0) return "h_liner_h3";
    var n = p.L === 3 ? (i % 2 ? "barge3b" : "barge3") : ["tug2", "ferry2", "barge2"][i % 3];
    return "h_" + n + "_" + p.o;
  }
  function hStart(lv) {
    var L = miA.h_levels, M = mL("harbour"); lv = Math.max(0, Math.min(L.length - 1, lv == null ? (M.lvl || 0) : lv));
    hbS = { lv: lv, moves: 0, best: L[lv].best, p: L[lv].p.map(function (q, i) { return { o: q[0], L: q[1], c: q[2], r: q[3], off: 0 }; }), sel: -1, drag: null, out: 0, won: false, gulls: [[20, 8, .7], [110, 12, -.5], [70, 4, .4]] };
    hbS.p.forEach(function (p, i) { p.spr = hSprite(p, i); });
    hbV.card.hidden = true; mBan(hbV, "Hafen " + (lv + 1));
  }
  function hGrid(skip) {
    var g = []; for (var r = 0; r < 6; r++) g.push([-1, -1, -1, -1, -1, -1]);
    hbS.p.forEach(function (p, i) { if (i === skip) return; for (var k = 0; k < p.L; k++) g[p.r + (p.o === "v" ? k : 0)][p.c + (p.o === "h" ? k : 0)] = i; });
    return g;
  }
  function hRange(i) {                                              // how far a boat can slide each way
    var p = hbS.p[i], g = hGrid(i), lo = 0, hi = 0;
    if (p.o === "h") { while (p.c - lo - 1 >= 0 && g[p.r][p.c - lo - 1] < 0) lo++; while (p.c + p.L + hi < 6 && g[p.r][p.c + p.L + hi] < 0) hi++; }
    else { while (p.r - lo - 1 >= 0 && g[p.r - lo - 1][p.c] < 0) lo++; while (p.r + p.L + hi < 6 && g[p.r + p.L + hi][p.c] < 0) hi++; }
    return [-lo, hi];
  }
  function hDraw(t) {
    if (!hbS) return; var c = hbV.c; c.clearRect(0, 0, 180, 135);
    if (mOk("h_bg")) c.drawImage(miI.h_bg, 0, 0);
    for (var k = 0; k < 14; k++) {                                   // the water glitters
      var wx = hbG.x + ((k * 37 + Math.floor(t / 90) * (k % 3 + 1)) % 94), wy = hbG.y + ((k * 53) % 94);
      if ((Math.floor(t / 400) + k) % 4 === 0) mR(c, wx, wy, 2, 1, "#9ad0f0");
    }
    hbS.p.forEach(function (p, i) {
      if (!mOk(p.spr)) return; var x = hbG.x + p.c * hbG.c, y = hbG.y + p.r * hbG.c;
      if (p.o === "h") x += p.off; else y += p.off;
      if (i === 0 && hbS.out) x += hbS.out;
      var bob = (i === hbS.sel) ? -1 : 0;
      c.drawImage(miI[p.spr], Math.round(x), Math.round(y) + bob);
      if (i === hbS.sel) {                                             // the boat in your hand: a golden frame that blinks gently
        var w = p.o === "h" ? p.L * hbG.c : hbG.c, h = p.o === "h" ? hbG.c : p.L * hbG.c, on = Math.floor(t / 250) % 2;
        c.globalAlpha = on ? .9 : .6;
        for (var q = 0; q < w; q += 2) { mR(c, x + q, y - 1 + bob, 1, 1, "#ffd34a"); mR(c, x + q, y + h - 1 + bob, 1, 1, "#ffd34a"); }
        for (var q2 = 0; q2 < h; q2 += 2) { mR(c, x - 1, y + q2 + bob, 1, 1, "#ffd34a"); mR(c, x + w - 1, y + q2 + bob, 1, 1, "#ffd34a"); }
        c.globalAlpha = 1;
      }
    });
    if (hbS.out) {                                                     // the wake behind the leaving liner
      var lx = hbG.x + hbS.p[0].c * hbG.c + hbS.out, ly = hbG.y + 2 * hbG.c;
      for (var w2 = 0; w2 < 6; w2++) mR(c, lx - 4 - w2 * 4, ly + 3 + (w2 % 2) * 7, 3, 1, "#e6f4fc");
    }
    hbS.gulls.forEach(function (g2) {                                  // gulls circling over the harbour
      g2[0] += g2[2] * .35; if (g2[0] > 190) g2[0] = -10; if (g2[0] < -10) g2[0] = 190;
      var f = Math.floor(t / 220 + g2[1]) % 2, gx2 = Math.round(g2[0]), gy2 = Math.round(g2[1] + Math.sin(t / 700 + g2[1]) * 2);
      mR(c, gx2 - 3, gy2 + (f ? 0 : -1), 3, 1, "#fff6e4"); mR(c, gx2 + 1, gy2 + (f ? 0 : -1), 3, 1, "#fff6e4"); mR(c, gx2, gy2 + 1, 1, 1, "#fff6e4");
    });
    if (hbS.won && hbS.out < 120) { hbS.out += 1.4; if (hbS.out >= 120 && !hbS.carded) { hbS.carded = 1; hWinCard(); } }
    hbS.raf = requestAnimationFrame(hDraw);
  }
  function hWinCard() {
    var M = mL("harbour"), L = miA.h_levels, st = hbS.moves <= hbS.best ? 3 : hbS.moves <= Math.ceil(hbS.best * 1.5) ? 2 : 1;
    M.best = M.best || {}; if (!M.best[hbS.lv] || hbS.moves < M.best[hbS.lv]) M.best[hbS.lv] = hbS.moves;
    M.lvl = Math.max(M.lvl || 0, Math.min(L.length - 1, hbS.lv + 1)); if (window.SudokuSave) window.SudokuSave();
    var next = hbS.lv + 1 < L.length;
    hbV.card.innerHTML = '<div class="fi-c"><p class="fi-h">Die Pausbacke liegt am Pier!</p>' + mStars(st) + '<p class="fi-s">' + hbS.moves + ' Züge</p>' +
      '<div class="fi-row"><button type="button" class="fi-b2" data-a="again">Nochmal</button>' + (next ? '<button type="button" class="fi-b" data-a="next">Nächster Hafen</button>' : '<button type="button" class="fi-b" data-a="end">Fertig</button>') + '</div></div>';
    hbV.card.hidden = false;
  }
  hbV.card.addEventListener("click", function (e) {
    e.stopPropagation(); var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.a === "again") hStart(hbS.lv); else if (b.dataset.a === "next") hStart(hbS.lv + 1); else hClose();
  });
  hbV.cv.addEventListener("pointerdown", function (e) {
    if (!hbS || hbS.won) return; var q = mPt(hbV, e), cc = Math.floor((q[0] - hbG.x) / hbG.c), rr = Math.floor((q[1] - hbG.y) / hbG.c);
    if (cc < 0 || rr < 0 || cc > 5 || rr > 5) return;
    var g = hGrid(-1), i = g[rr][cc]; if (i < 0) return;
    e.preventDefault(); hbV.cv.setPointerCapture(e.pointerId);
    hbS.sel = i; var rg = hRange(i); hbS.drag = { i: i, x: e.clientX, y: e.clientY, lo: rg[0], hi: rg[1] };
    beep([[520, .03]]);
  });
  hbV.cv.addEventListener("pointermove", function (e) {
    if (!hbS || !hbS.drag) return; var d = hbS.drag, p = hbS.p[d.i], r = hbV.cv.getBoundingClientRect(), sc = 180 / r.width;
    var px = (p.o === "h" ? e.clientX - d.x : e.clientY - d.y) * sc;
    p.off = Math.max(d.lo * hbG.c, Math.min(d.hi * hbG.c, px));
  });
  function hUp() {
    if (!hbS || !hbS.drag) return; var d = hbS.drag, p = hbS.p[d.i], n = Math.round(p.off / hbG.c); hbS.drag = null; p.off = 0;
    if (n) { if (p.o === "h") p.c += n; else p.r += n; hbS.moves++; beep([[330, .04], [392, .05]]); mBan(hbV, hbS.moves + (hbS.moves === 1 ? " Zug" : " Züge")); }
    if (d.i === 0 && p.c === 3) { hbS.won = true; hbS.sel = -1; beep([[392, .3], [494, .3], [587, .5]]); mBan(hbV, "Tuuut!"); }
  }
  hbV.cv.addEventListener("pointerup", hUp); hbV.cv.addEventListener("pointercancel", hUp);
  function hOpen(lv) { hbV.el.hidden = false; hStart(lv); cancelAnimationFrame(hbS.raf); hbS.raf = requestAnimationFrame(hDraw); }
  function hClose() { if (hbS) cancelAnimationFrame(hbS.raf); hbS = null; hbV.el.hidden = true; }
  hbV.el.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); hClose(); });

  // ---------------------------------------------------------------- wreck diving
  // Tap a patch of sand: the bell goes down and our hamster digs. Nothing there? The echo sounder shows rings: three when a treasure is right next to it.
  var dvV = mPov("md-pov", "Tauchgang beenden"), dvG = { x: 13, y: 100, c: 11, n: 14, m: 3 }, dvS = null;
  var dvFINDS = ["chest", "bell", "porthole", "compass", "bottle", "anchor"];
  function dStart() {
    var cells = [], rr = Math.random;
    while (cells.length < 3) {
      var c = Math.floor(rr() * dvG.n), r = Math.floor(rr() * dvG.m);
      if (cells.every(function (q) { return Math.max(Math.abs(q[0] - c), Math.abs(q[1] - r)) >= 3; })) cells.push([c, r]);
    }
    var kinds = dvFINDS.slice().sort(function () { return rr() - .5; }).slice(0, 3);
    dvS = { tr: cells.map(function (q, i) { return { c: q[0], r: q[1], k: kinds[i], found: false }; }), tiles: {}, air: 12, bx: 98, by: 40, busy: false, fx: [], pops: [], fish: [[20, 50, .25, "#f6a040"], [140, 38, -.18, "#e86a5a"], [60, 70, .15, "#f6c84a"]], over: false };
    dvV.card.hidden = true; mBan(dvV, "Schätze suchen");
  }
  function dNear(c, r) { var d = 9; dvS.tr.forEach(function (q) { if (!q.found) d = Math.min(d, Math.max(Math.abs(q.c - c), Math.abs(q.r - r))); }); return d; }
  function dTween(o, k, to, ms) { return new Promise(function (res) { var f = o[k], t0 = performance.now(); (function st(t) { var u = Math.min(1, (t - t0) / ms), e = u * u * (3 - 2 * u); o[k] = f + (to - f) * e; if (u < 1) requestAnimationFrame(st); else res(); })(t0); }); }
  async function dDig(c, r) {
    var key = c + "," + r; if (!dvS || dvS.busy || dvS.over || dvS.tiles[key] != null) return;
    dvS.busy = true; var tx = dvG.x + c * dvG.c + dvG.c / 2, ty = dvG.y + r * dvG.c - 30;
    beep([[300, .05]]);
    await dTween(dvS, "by", 34, 260); await dTween(dvS, "bx", tx, 420 + Math.abs(dvS.bx - tx) * 4); await dTween(dvS, "by", ty, 520);
    if (!dvS) return;
    for (var k = 0; k < 14; k++) dvS.fx.push({ x: tx + (Math.random() - .5) * 10, y: dvG.y + r * dvG.c + 4, vx: (Math.random() - .5) * 18, vy: -10 - Math.random() * 16, life: .9 });   // sand puffs
    beep([[160, .06], [130, .06], [160, .06]]); await new Promise(function (res) { setTimeout(res, 550); }); if (!dvS) return;
    dvS.air--;
    var hit = dvS.tr.filter(function (q) { return q.c === c && q.r === r && !q.found; })[0];
    if (hit) { hit.found = true; dvS.tiles[key] = -1; dvS.pops.push({ k: hit.k, x: tx, y: ty + 10, t0: performance.now() }); beep([[659, .08], [784, .08], [1047, .16]]); var F = mL("dive"); F.finds = F.finds || {}; F.finds[hit.k] = (F.finds[hit.k] || 0) + 1; if (window.SudokuSave) window.SudokuSave(); }
    else { var d = dNear(c, r); dvS.tiles[key] = d <= 3 ? 4 - d : 0; dvS.ping = { x: tx, y: dvG.y + r * dvG.c + dvG.c / 2, t0: performance.now(), n: dvS.tiles[key] }; beep(dvS.tiles[key] ? [[880, .05], [880, .05]].slice(0, Math.max(1, dvS.tiles[key] - 1)) : [[220, .05]]); }
    await dTween(dvS, "by", Math.max(34, ty - 18), 400); if (!dvS) return;
    dvS.busy = false;
    var all = dvS.tr.every(function (q) { return q.found; });
    if (all || dvS.air <= 0) { dvS.over = true; setTimeout(function () { if (dvS) dEndCard(all); }, 900); }
  }
  function dEndCard(all) {
    var n = dvS.tr.filter(function (q) { return q.found; }).length;
    dvV.card.innerHTML = '<div class="fi-c"><p class="fi-h">' + (all ? "Alle Schätze gehoben!" : "Die Luft ist aus") + '</p>' + mStars(all ? (dvS.air >= 4 ? 3 : 2) : n ? 1 : 0) +
      '<div class="md-finds">' + dvS.tr.map(function (q) { return '<img src="' + miA["d_f_" + q.k] + '" alt=""' + (q.found ? "" : ' class="no"') + '>'; }).join("") + '</div>' +
      '<div class="fi-row"><button type="button" class="fi-b2" data-a="end">Fertig</button><button type="button" class="fi-b" data-a="again">Noch ein Tauchgang</button></div></div>';
    dvV.card.hidden = false;
  }
  dvV.card.addEventListener("click", function (e) { e.stopPropagation(); var b = e.target.closest("button"); if (!b) return; if (b.dataset.a === "again") dStart(); else dClose(); });
  dvV.cv.addEventListener("pointerdown", function (e) {
    if (!dvS) return; var q = mPt(dvV, e), c = Math.floor((q[0] - dvG.x) / dvG.c), r = Math.floor((q[1] - dvG.y) / dvG.c);
    if (c < 0 || r < 0 || c >= dvG.n || r >= dvG.m) return; dDig(c, r);
  });
  function dDraw(t) {
    if (!dvS) return; var c = dvV.c; c.clearRect(0, 0, 180, 135);
    if (mOk("d_bg")) c.drawImage(miI.d_bg, 0, 0);
    dvS.fish.forEach(function (f) {                                   // a few fish going about their business
      f[0] += f[2]; if (f[0] > 190) f[0] = -10; if (f[0] < -10) f[0] = 190; var y = Math.round(f[1] + Math.sin(t / 600 + f[1]) * 2), x = Math.round(f[0]), d = f[2] > 0 ? 1 : -1;
      mR(c, x - 2, y - 1, 5, 3, f[3]); mR(c, x - 3, y, 7, 1, f[3]); mR(c, x - 3 * d - (d < 0 ? 0 : 1), y - 1, 1, 3, f[3]); mR(c, x + 2 * d - (d < 0 ? 0 : 0), y - 1, 1, 1, "#24242a");
    });
    // the sand field: untouched patches, dug holes with the echo rings, found treasure spots
    for (var r = 0; r < dvG.m; r++) for (var cc = 0; cc < dvG.n; cc++) {
      var x = dvG.x + cc * dvG.c, y = dvG.y + r * dvG.c, v = dvS.tiles[cc + "," + r];
      if (v == null) { mR(c, x + 1, y + dvG.c - 1, dvG.c - 1, 1, "#c8ac78"); mR(c, x + dvG.c - 1, y + 1, 1, dvG.c - 1, "#c8ac78"); mR(c, x + 1, y + 1, dvG.c - 2, 1, "#ecd8ac"); }
      else {
        mR(c, x + 1, y + 1, dvG.c - 2, dvG.c - 2, "#a88a5a"); mR(c, x + 2, y + 2, dvG.c - 4, dvG.c - 4, "#8a7048");
        if (v === -1) { if (Math.floor(t / 300 + cc) % 3 === 0) mR(c, x + 5, y + 3, 1, 1, "#fff8c0"); }
        else for (var k = 0; k < v; k++) {
          var rad = 1.5 + k * 1.6, col = v === 3 ? "#ffe070" : v === 2 ? "#f6c84a" : "#f0e4c8";
          for (var a = 0; a < 16; a++) { var an = a / 16 * Math.PI * 2; mR(c, x + dvG.c / 2 + Math.cos(an) * rad - .5, y + dvG.c / 2 + Math.sin(an) * rad - .5, 1, 1, col); }
        }
      }
    }
    if (dvS.ping) {                                                   // the echo going out
      var u = (t - dvS.ping.t0) / 700; if (u > 1) dvS.ping = null;
      else { c.globalAlpha = 1 - u; for (var a2 = 0; a2 < 24; a2++) { var an2 = a2 / 24 * Math.PI * 2, rr2 = 3 + u * 16; mR(c, dvS.ping.x + Math.cos(an2) * rr2, dvS.ping.y + Math.sin(an2) * rr2 * .6, 1, 1, "#e6f4fc"); } c.globalAlpha = 1; }
    }
    // the cable and the bell
    var bx = Math.round(dvS.bx), by = Math.round(dvS.by), n = Math.max(1, Math.abs(by - 1));
    for (var i = 0; i <= n; i++) { var u2 = i / n; mR(c, 100 + (bx - 100) * u2 + Math.sin(u2 * Math.PI) * 2, 1 + (by - 1) * u2, 1, 1, "#2a2a30"); }
    if (mOk("d_bell")) c.drawImage(miI.d_bell, bx - 15, by);
    if (Math.random() < .2) dvS.fx.push({ x: bx + (Math.random() - .5) * 12, y: by + 4, vx: 0, vy: -12, life: 1.6, bub: 1 });
    dvS.fx = dvS.fx.filter(function (f) { f.life -= .016; f.x += f.vx * .016; f.y += f.vy * .016; if (!f.bub) f.vy += 30 * .016; c.globalAlpha = Math.min(1, f.life * 2); mR(c, f.x, f.y, 1, 1, f.bub ? "#d8f4fc" : "#e8d4a8"); c.globalAlpha = 1; return f.life > 0 && f.y > 15; });
    // treasures rising to the tray at the top right
    dvS.pops = dvS.pops.filter(function (p) {
      var u3 = Math.min(1, (t - p.t0) / 1400), slot = dvS.tr.filter(function (q) { return q.found; }).map(function (q) { return q.k; }).indexOf(p.k);
      var tx = 132 + slot * 16, ty = 19, x = p.x + (tx - p.x) * u3 * u3, y = p.y + (ty - p.y) * u3 - Math.sin(u3 * Math.PI) * 14;
      if (mOk("d_f_" + p.k)) c.drawImage(miI["d_f_" + p.k], Math.round(x - 7), Math.round(y));
      return u3 < 1;
    });
    // the tray with what has been found, and the air left
    for (var s2 = 0; s2 < 3; s2++) { var sx2 = 131 + s2 * 16; c.globalAlpha = .45; mR(c, sx2 + 1, 18, 14, 1, "#fff8ec"); mR(c, sx2 + 1, 33, 14, 1, "#fff8ec"); mR(c, sx2, 19, 1, 14, "#fff8ec"); mR(c, sx2 + 15, 19, 1, 14, "#fff8ec"); c.globalAlpha = 1; }   // three empty frames for the finds
    var got = dvS.tr.filter(function (q) { return q.found; });
    got.forEach(function (q, j) { if (dvS.pops.some(function (p) { return p.k === q.k; })) return; if (mOk("d_f_" + q.k)) c.drawImage(miI["d_f_" + q.k], 132 + j * 16, 19); });
    for (var a3 = 0; a3 < 12; a3++) { var ax = 5 + (a3 % 6) * 7, ay = 20 + Math.floor(a3 / 6) * 7, on = a3 < dvS.air; var rc = on ? "#e6f8fc" : "rgba(216,244,252,.3)"; mR(c, ax + 1, ay, 3, 1, rc); mR(c, ax + 1, ay + 4, 3, 1, rc); mR(c, ax, ay + 1, 1, 3, rc); mR(c, ax + 4, ay + 1, 1, 3, rc); if (on) { mR(c, ax + 1, ay + 1, 3, 3, "rgba(200,236,248,.45)"); mR(c, ax + 1, ay + 1, 1, 1, "#ffffff"); } }   // air bubbles
    dvS.raf = requestAnimationFrame(dDraw);
  }
  function dOpen() { dvV.el.hidden = false; dStart(); cancelAnimationFrame(dvS.raf); dvS.raf = requestAnimationFrame(dDraw); }
  function dClose() { if (dvS) cancelAnimationFrame(dvS.raf); dvS = null; dvV.el.hidden = true; }
  dvV.el.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); dClose(); });
  // ---------------------------------------------------------------- wreck exploration
  // A sunken ship cut open, rolled anew on every dive: a liner, a freighter, a sailing ship or a fishing cutter.
  // Every move costs a bubble of air. Keys open locked doors, an air pocket gives a breath, currents carry you one way
  // and hold you back the other, a stuck door needs a second shove, a rotten frame may collapse behind you, dark holds hide what is inside.
  var wkV = mPov("mw-pov", "Wrack verlassen"), WK = { x: 12, y: 34, w: 37, h: 26, sx: 39, sy: 28 }, wkS = null;
  var WK_NAMES = { dampfer: "Ozeandampfer", frachter: "Frachter", segler: "Segelschiff", kutter: "Fischkutter" };
  function wkBox(d, c) { return [WK.x + c * WK.sx, WK.y + d * WK.sy]; }
  function wkRnd(n) { return Math.floor(Math.random() * n); }
  function wkShuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = wkRnd(i + 1), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function wkEk(a, b) { return a[0] === b[0] ? "h" + a[0] + "," + Math.min(a[1], b[1]) : "v" + Math.min(a[0], b[0]) + "," + a[1]; }
  function wkGen(type) { for (var i = 0; i < 40; i++) { var L = wkGen1(type); if (L) return L; } return wkGen1(type, true); }
  function wkGen1(type, force) {
    var T = miA.w_types[type], R = T.R, C = T.C, all = [], tree = {}, extra = [];
    for (var d = 0; d < R; d++) for (var c = 0; c < C; c++) { if (c < C - 1) all.push([[d, c], [d, c + 1]]); if (d < R - 1) all.push([[d, c], [d + 1, c]]); }
    var start = [0, wkRnd(C)], seen = {}, stack = [start]; seen[start.join(",")] = 1;
    while (stack.length) {                                           // a random spanning tree: every room can be reached
      var cur = stack[stack.length - 1], nb = wkShuffle([[cur[0], cur[1] - 1], [cur[0], cur[1] + 1], [cur[0] - 1, cur[1]], [cur[0] + 1, cur[1]]]).filter(function (q) { return q[0] >= 0 && q[1] >= 0 && q[0] < R && q[1] < C && !seen[q.join(",")]; });
      if (!nb.length) { stack.pop(); continue; }
      var nx = nb[0]; if (nx[0] !== cur[0] && Math.random() < .35 && nb.length > 1) nx = nb[1];
      seen[nx.join(",")] = 1; tree[wkEk(cur, nx)] = 1; stack.push(nx);
    }
    var adj = function (useExtra, closed) {
      var m = {}; all.forEach(function (e) { var k = wkEk(e[0], e[1]); if (!(tree[k] || (useExtra && useExtra[k])) || (closed && closed[k])) return; var a = e[0].join(","), b = e[1].join(","); (m[a] = m[a] || []).push(b); (m[b] = m[b] || []).push(a); }); return m;
    };
    var bfs = function (m, from) { var dist = {}, q = [from]; dist[from] = 0; while (q.length) { var x = q.shift(); (m[x] || []).forEach(function (y) { if (dist[y] == null) { dist[y] = dist[x] + 1; q.push(y); } }); } return dist; };
    var dist = bfs(adj(), start.join(",")), far = Object.keys(dist).sort(function (a, b) { return (dist[b] + (+b.split(",")[0]) * .6) - (dist[a] + (+a.split(",")[0]) * .6); })[0], chest = far;
    // the path from the entry to the chest; locks go on horizontal doors along it
    var par = {}, q2 = [start.join(",")], m0 = adj(); par[start.join(",")] = null;
    while (q2.length) { var x = q2.shift(); (m0[x] || []).forEach(function (y) { if (par[y] === undefined) { par[y] = x; q2.push(y); } }); }
    var path = []; for (var p = chest; p; p = par[p]) path.unshift(p);
    var pe = []; for (var i = 1; i < path.length; i++) { var A = path[i - 1].split(",").map(Number), B = path[i].split(",").map(Number); if (A[0] === B[0]) pe.push({ k: wkEk(A, B), i: i }); }
    var locks = [], cols = ["r", "b"];
    if (pe.length >= 1) locks.push(pe[pe.length - 1]);
    if (pe.length >= 3 && Math.random() < .8) locks.unshift(pe[Math.floor(pe.length / 3)]);
    var lockT = {}; locks.forEach(function (l, j) { lockT[l.k] = cols[j]; });
    // extra doors and ladders, but only inside the same locked-off part, so no lock can be walked around
    var closedAll = {}; locks.forEach(function (l) { closedAll[l.k] = 1; });
    var compOf = {}, comps = 0; Object.keys(dist).forEach(function (r) { if (compOf[r] != null) return; var dd = bfs(adj(null, closedAll), r); Object.keys(dd).forEach(function (z) { compOf[z] = comps; }); comps++; });
    var ext = {};
    wkShuffle(all.slice()).forEach(function (e) { var k = wkEk(e[0], e[1]); if (tree[k]) return; if (compOf[e[0].join(",")] !== compOf[e[1].join(",")]) return; if (Math.random() < (k[0] === "h" ? .4 : .18)) ext[k] = 1; });
    var h = [], v = [];
    for (var d2 = 0; d2 < R; d2++) { h.push([]); v.push([]); for (var c2 = 0; c2 < C; c2++) { var kh = "h" + d2 + "," + c2, kv = "v" + d2 + "," + c2; h[d2].push(c2 < C - 1 ? (lockT[kh] || ((tree[kh] || ext[kh]) ? "o" : "w")) : "w"); v[d2].push(d2 < R - 1 && (tree[kv] || ext[kv]) ? 1 : 0); } }
    // keys: the first in the part around the entry, the second in the part behind the first lock
    var startComp = compOf[start.join(",")], items = {}, used = {}; used[start.join(",")] = 1; used[chest] = 1;
    var pickIn = function (cond) { var c3 = Object.keys(dist).filter(function (r) { return !used[r] && cond(r); }); if (!c3.length) return null; var r = c3[wkRnd(c3.length)]; used[r] = 1; return r; };
    var c1 = locks.length ? compOf[path[locks[0].i - 1]] : startComp, behind1 = locks.length ? compOf[path[locks[0].i]] : startComp;
    if (locks[0]) { var r1 = pickIn(function (r) { return compOf[r] === startComp; }) || start.join(","); items[r1] = "key_" + cols[0]; }
    if (locks[1]) { var r2 = pickIn(function (r) { return compOf[r] === behind1; }) || pickIn(function (r) { return compOf[r] === startComp; }); if (r2) items[r2] = "key_" + cols[1]; }
    items[chest] = "chest";
    for (var cn = 0; cn < 3; cn++) { var rc = pickIn(function () { return true; }); if (rc) items[rc] = "coins"; }
    var ra = pickIn(function () { return true; }); if (ra) items[ra] = "air";
    // the rooms' quirks
    var quirk = {}, free = Object.keys(dist).filter(function (r) { return r !== start.join(",") && r !== chest; });
    wkShuffle(free);
    if (free[0]) quirk[free[0]] = { pocket: 1 };
    var curRoom = free.filter(function (r) { var q = r.split(",").map(Number); return C > 2 && !quirk[r] && (h[q[0]][q[1]] !== "w" || (q[1] > 0 && h[q[0]][q[1] - 1] !== "w")); })[0];
    if (curRoom) quirk[curRoom] = { cur: Math.random() < .5 ? 1 : -1 };
    free.filter(function (r) { return !quirk[r]; }).slice(0, R * C > 8 ? 2 : 1).forEach(function (r) { quirk[r] = { dark: 1 }; });
    var jam = {}, frag = {};
    var openH = Object.keys(tree).filter(function (k) { return k[0] === "h" && !lockT[k]; }); if (openH.length) jam[wkShuffle(openH)[0]] = 1;
    var exk = Object.keys(ext); if (exk.length) frag[wkShuffle(exk)[0]] = 1;
    var L = { type: type, R: R, C: C, start: start, h: h, v: v, items: items, quirk: quirk, jam: jam, frag: frag };
    var nd = wkNeed(L); if (nd < 0 && !force) return null;
    Object.keys(frag).forEach(function (k) {                        // a collapse must never strand you: count the way without that frame too
      var q = k.slice(1).split(",").map(Number), L2 = JSON.parse(JSON.stringify(L));
      if (k[0] === "h") L2.h[q[0]][q[1]] = "w"; else L2.v[q[0]][q[1]] = 0;
      nd = Math.max(nd, wkNeed(L2) + 2);
    });
    if (nd < 4 && !force) return null;                              // too easy: the chest right next door
    L.air = Math.max(nd, 4) + 3;
    return L;
  }
  function wkCost(S, a, b) {                                       // currents: with the flow it is free, against it costs double
    if (a[0] !== b[0]) return 1;
    var qa = S.L.quirk[a.join(",")], qb = S.L.quirk[b.join(",")], cu = (qa && qa.cur) || (qb && qb.cur);
    if (!cu) return 1; return (b[1] - a[1]) === cu ? 0 : 2;
  }
  function wkNeed(L) {                                             // the cheapest way to the chest, keys included (Dijkstra over room + keys)
    var S = { L: L, open: {} }, best = {}, q = [[0, L.start[0], L.start[1], ""]];
    while (q.length) {
      q.sort(function (a, b) { return a[0] - b[0]; }); var cur = q.shift(), key = cur[1] + "," + cur[2] + "|" + cur[3];
      if (best[key] != null) continue; best[key] = cur[0];
      var it = L.items[cur[1] + "," + cur[2]]; if (it === "chest") return cur[0];
      var ks = cur[3]; if (it === "key_r" && ks.indexOf("r") < 0) ks += "r"; if (it === "key_b" && ks.indexOf("b") < 0) ks += "b";
      [[cur[1], cur[2] - 1], [cur[1], cur[2] + 1], [cur[1] - 1, cur[2]], [cur[1] + 1, cur[2]]].forEach(function (n) {
        if (n[0] < 0 || n[1] < 0 || n[0] >= L.R || n[1] >= L.C) return;
        var t = n[0] === cur[1] ? L.h[n[0]][Math.min(n[1], cur[2])] : (L.v[Math.min(n[0], cur[1])][n[1]] ? "v" : null);
        if (!t || t === "w") return; if ((t === "r" || t === "b") && ks.indexOf(t) < 0) return;
        var cst = wkCost(S, [cur[1], cur[2]], n) + (L.jam[wkEk([cur[1], cur[2]], n)] ? 1 : 0);
        q.push([cur[0] + cst, n[0], n[1], ks]);
      });
    }
    return -1;
  }
  function wkLink(a, b) {
    var L = wkS.L, d1 = a[0], c1 = a[1], d2 = b[0], c2 = b[1];
    if (d1 === d2 && Math.abs(c1 - c2) === 1) { var t = L.h[d1][Math.min(c1, c2)]; return t === "w" ? null : (t === "r" || t === "b") && wkS.open[d1 + "," + Math.min(c1, c2)] ? "o" : t; }
    if (c1 === c2 && Math.abs(d1 - d2) === 1) return L.v[Math.min(d1, d2)][c1] ? "v" : null;
    return null;
  }
  function wkStart() {
    var types = Object.keys(miA.w_types), M = mL("wreck"), type = types[wkRnd(types.length)];
    if (M.last === type) type = types[(types.indexOf(type) + 1) % types.length]; M.last = type;
    var L = wkGen(type), T = miA.w_types[type]; WK.x = T.x; WK.y = T.y;
    wkS = { L: L, R: L.R, C: L.C, pos: L.start.slice(), air: L.air, keys: {}, items: JSON.parse(JSON.stringify(L.items)), seen: {}, open: {}, coins: 0, x: 0, y: 0, busy: false, over: false, fx: [], flash: 0, chestOpen: false, pocketUsed: {}, jam: JSON.parse(JSON.stringify(L.jam)), frag: JSON.parse(JSON.stringify(L.frag)), falls: [] };
    wkS.seen[L.start.join(",")] = 1; var b = wkBox(L.start[0], L.start[1]); wkS.x = b[0] + 10; wkS.y = 4; wkS.busy = true;
    wkV.card.hidden = true; mBan(wkV, WK_NAMES[type]);
    dTween(wkS, "y", b[1] + WK.h - 20, 900).then(function () { if (wkS) { wkS.busy = false; wkArrive(L.start[0], L.start[1]); } });
  }
  function wkKnown(d, c) {
    if (wkS.seen[d + "," + c]) return 2;
    var n = [[d, c - 1], [d, c + 1], [d - 1, c], [d + 1, c]];
    for (var i = 0; i < 4; i++) { var q = n[i]; if (q[0] < 0 || q[1] < 0 || q[0] >= wkS.R || q[1] >= wkS.C) continue; if (wkS.seen[q[0] + "," + q[1]] && wkLink([d, c], q)) return 1; }
    return 0;
  }
  function wkSpark(x, y, col, n) { for (var i = 0; i < (n || 10); i++) { var a = Math.random() * Math.PI * 2, v = 10 + Math.random() * 18; wkS.fx.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 8, life: .8, c: col }); } }
  function wkArrive(d, c) {
    var k = d + "," + c, q = wkS.L.quirk[k], tb = wkBox(d, c), bx = tb[0] + WK.w / 2, by = tb[1] + WK.h - 8;
    if (q && q.pocket && !wkS.pocketUsed[k]) { wkS.pocketUsed[k] = 1; wkS.air += 2; wkS.flash = 1; beep([[523, .05], [659, .08]]); for (var i = 0; i < 12; i++) wkS.fx.push({ x: bx + (Math.random() - .5) * 20, y: tb[1] + 4, vx: (Math.random() - .5) * 4, vy: -4, life: .9, c: "#e6f8fc" }); mBan(wkV, "Luftblase! +2"); }
    var it = wkS.items[k];
    if (it === "key_r" || it === "key_b") { wkS.keys[it === "key_r" ? "r" : "b"] = 1; delete wkS.items[k]; beep([[880, .05], [1175, .08]]); wkSpark(bx, by, "#ffe070"); mBan(wkV, it === "key_r" ? "Roter Schlüssel!" : "Blauer Schlüssel!"); }
    else if (it === "air") { wkS.air += 4; delete wkS.items[k]; wkS.flash = 1; beep([[392, .05], [523, .05], [659, .08]]); for (var j = 0; j < 16; j++) wkS.fx.push({ x: bx + (Math.random() - .5) * 10, y: by, vx: (Math.random() - .5) * 6, vy: -20 - Math.random() * 20, life: 1.2, c: "#d8f4fc" }); mBan(wkV, "+4 Luft"); }
    else if (it === "coins") { wkS.coins++; delete wkS.items[k]; beep([[1047, .05], [1319, .05], [1568, .08]]); wkSpark(bx, by, "#ffd34a", 16); mBan(wkV, "Goldmünzen!"); }
    else if (it === "chest") { wkS.chestOpen = true; wkS.over = true; beep([[523, .1], [659, .1], [784, .1], [1047, .3]]); for (var m = 0; m < 4; m++) setTimeout(function () { if (wkS) wkSpark(bx, by - 4, "#ffd34a", 18); }, m * 250); setTimeout(function () { if (wkS) wkEnd(true); }, 1600); }
  }
  async function wkGo(d, c) {
    if (!wkS || wkS.busy || wkS.over) return;
    var from = wkS.pos, k = wkLink(from, [d, c]), ek = wkEk(from, [d, c]);
    if (!k) { beep([[120, .06]]); wkS.nudge = 6; return; }
    if (k === "r" || k === "b") {
      if (!wkS.keys[k]) { beep([[180, .05], [150, .08]]); wkS.lockShake = { k: from[0] + "," + Math.min(from[1], c), t: 8 }; mBan(wkV, k === "r" ? "Der rote Schlüssel fehlt" : "Der blaue Schlüssel fehlt"); return; }
      wkS.open[from[0] + "," + Math.min(from[1], c)] = 1; beep([[523, .06], [659, .06], [784, .1]]); var db = wkBox(from[0], Math.min(from[1], c)); wkSpark(db[0] + WK.w + 1, db[1] + WK.h - 10, k === "r" ? "#ff8a6a" : "#8ac8ff", 12);
    }
    if (wkS.jam[ek]) {                                             // a stuck door: the first shove only loosens it
      delete wkS.jam[ek]; wkS.air--; wkS.busy = true; beep([[140, .06], [120, .06], [160, .05]]); wkS.jamShake = { k: ek, t: 10 }; mBan(wkV, "Die Tür klemmt");
      var jx = wkS.x; await dTween(wkS, "x", jx + (c > from[1] ? 4 : -4), 150); await dTween(wkS, "x", jx, 200); if (!wkS) return; wkS.busy = false;
      if (wkS.air <= 0) { wkS.over = true; setTimeout(function () { if (wkS) wkEnd(false); }, 900); } return;
    }
    var cost = wkCost(wkS, from, [d, c]);
    wkS.busy = true; wkS.air -= cost; beep(cost === 0 ? [[440, .04], [523, .04]] : cost === 2 ? [[220, .06], [200, .06]] : [[300, .04]]);
    if (cost === 0) mBan(wkV, "Mit der Strömung"); else if (cost === 2) mBan(wkV, "Gegen die Strömung");
    var tb = wkBox(d, c), tx = tb[0] + (c > from[1] ? 6 : c < from[1] ? WK.w - 22 : 10), ty = tb[1] + WK.h - 20;
    if (k === "v") { var lx = wkBox(from[0], from[1])[0] + 26; await dTween(wkS, "x", lx, 300); await dTween(wkS, "y", ty, 600); await dTween(wkS, "x", tb[0] + 10, 300); }
    else await dTween(wkS, "x", tx, (cost === 0 ? 300 : cost === 2 ? 900 : 520) + Math.abs(wkS.x - tx) * 6);
    if (!wkS) return;
    if (wkS.frag[ek]) {                                             // the rotten frame gives way behind you
      delete wkS.frag[ek]; var A = from, B = [d, c];
      if (A[0] === B[0]) wkS.L.h[A[0]][Math.min(A[1], B[1])] = "w"; else wkS.L.v[Math.min(A[0], B[0])][A[1]] = 0;
      var fb = A[0] === B[0] ? wkBox(A[0], Math.min(A[1], B[1])) : wkBox(Math.min(A[0], B[0]), A[1]);
      wkS.falls.push({ x: A[0] === B[0] ? fb[0] + WK.w : fb[0] + 28, y: A[0] === B[0] ? fb[1] + WK.h - 16 : fb[1] + WK.h - 4, t0: performance.now() });
      beep([[90, .2], [70, .25]]); mBan(wkV, "Hinter dir stürzt es ein!");
    }
    wkS.pos = [d, c]; wkS.seen[d + "," + c] = 1;
    wkArrive(d, c);
    wkS.busy = false;
    if (!wkS.over && wkS.air <= 0) { wkS.over = true; beep([[300, .2], [200, .3]]); setTimeout(function () { if (wkS) wkEnd(false); }, 900); }
  }
  function wkEnd(won) {
    var st = won ? 1 + (wkS.coins >= 1 ? 1 : 0) + (wkS.coins >= 3 ? 1 : 0) : 0;
    wkV.card.innerHTML = '<div class="fi-c"><p class="fi-h">' + (won ? "Die Kapitänstruhe ist geborgen!" : "Die Luft ist knapp, zurück zum Boot!") + '</p>' + (won ? mStars(st) : "") +
      '<div class="md-finds"><img src="' + miA.w_coins + '" alt=""' + (wkS.coins ? "" : ' class="no"') + '><b class="mw-n">× ' + wkS.coins + '</b></div>' +
      '<div class="fi-row"><button type="button" class="fi-b2" data-a="end">Fertig</button><button type="button" class="fi-b" data-a="again">Nächstes Wrack</button></div></div>';
    wkV.card.hidden = false;
  }
  wkV.card.addEventListener("click", function (e) { e.stopPropagation(); var b = e.target.closest("button"); if (!b) return; if (b.dataset.a === "again") { cancelAnimationFrame(wkS.raf); wkStart(); wkS.raf = requestAnimationFrame(wkDraw); } else wkClose(); });
  wkV.cv.addEventListener("pointerdown", function (e) {
    if (!wkS) return; var q = mPt(wkV, e), c = Math.floor((q[0] - WK.x) / WK.sx), d = Math.floor((q[1] - WK.y) / WK.sy);
    if (c < 0 || d < 0 || c >= wkS.C || d >= wkS.R) return; if (d === wkS.pos[0] && c === wkS.pos[1]) return; wkGo(d, c);
  });
  function wkDraw(t) {
    if (!wkS) return; var c = wkV.c, L = wkS.L; c.clearRect(0, 0, 180, 135);
    var bgk = "w_bg_" + L.type; if (mOk(bgk)) c.drawImage(miI[bgk], 0, 0);
    var sb = wkBox(0, L.start[1]); mR(c, sb[0] + 10, sb[1] - 8, 16, 8, "#0e3456"); for (var hx = sb[0] + 10; hx < sb[0] + 26; hx += 2) mR(c, hx, sb[1] - 8 + (hx % 3), 1, 1, "#4a4e58");   // the hole you came in by
    // doors and ladders
    for (var d = 0; d < wkS.R; d++) for (var cc = 0; cc < wkS.C - 1; cc++) {
      var tp = L.h[d][cc], b = wkBox(d, cc), wx = b[0] + WK.w - 1, wy = b[1] + WK.h - 17; if (tp === "w") continue;
      var open = tp === "o" || wkS.open[d + "," + cc], ek = "h" + d + "," + cc;
      var sh2 = wkS.jamShake && wkS.jamShake.k === ek && wkS.jamShake.t > 0 ? (wkS.jamShake.t % 2 ? 1 : -1) : 0;
      mR(c, wx - 1, wy - 1, 6, 15, wkS.frag[ek] ? "#5a4a3a" : "#6a4a30"); mR(c, wx, wy, 4, 14, open ? "#0e2232" : "#7a5434");
      if (wkS.frag[ek]) { mR(c, wx - 1, wy + 3, 1, 1, "#0e2232"); mR(c, wx + 4, wy + 8, 1, 1, "#0e2232"); mR(c, wx, wy - 1, 2, 1, "#3a2a1c"); }   // a cracked, rotten frame
      if (wkS.jam[ek] && open) { mR(c, wx + sh2, wy + 2, 4, 10, "#8a6040"); mR(c, wx + sh2, wy + 2, 4, 1, "#a87850"); mR(c, wx + 3 + sh2, wy + 7, 1, 1, "#c8a060"); }   // the stuck door, ajar
      if (!open) { var sh = wkS.lockShake && wkS.lockShake.k === d + "," + cc && wkS.lockShake.t > 0 ? (wkS.lockShake.t % 2 ? 1 : -1) : 0; mR(c, wx + sh, wy + 5, 4, 4, tp === "r" ? "#e8402a" : "#4a9ae8"); mR(c, wx + 1 + sh, wy + 6, 2, 1, "#ffe070"); mR(c, wx, wy + 1, 4, 1, "#9a7050"); }
    }
    if (wkS.lockShake && wkS.lockShake.t > 0) wkS.lockShake.t -= .5; if (wkS.jamShake && wkS.jamShake.t > 0) wkS.jamShake.t -= .5;
    for (var d2 = 0; d2 < wkS.R - 1; d2++) for (var c2 = 0; c2 < wkS.C; c2++) if (L.v[d2][c2]) {
      var b2 = wkBox(d2, c2), lx = b2[0] + 26, y0 = b2[1] + WK.h - 12, y1 = b2[1] + WK.sy + WK.h - 3, rot = wkS.frag["v" + d2 + "," + c2];
      mR(c, lx - 1, b2[1] + WK.h - 3, 9, 4, "#0e2232");
      for (var y = y0; y < y1; y++) { mR(c, lx, y, 1, 1, rot ? "#7a6a4a" : "#a8884a"); mR(c, lx + 6, y, 1, 1, rot ? "#7a6a4a" : "#a8884a"); if ((y - y0) % 3 === 0 && !(rot && (y - y0) % 9 === 3)) mR(c, lx, y, 7, 1, rot ? "#8a7a5a" : "#c8a060"); }
    }
    // room quirks you can see: the current's streaks, the shimmering air pocket under the ceiling
    for (var d4 = 0; d4 < wkS.R; d4++) for (var c4 = 0; c4 < wkS.C; c4++) {
      var qk = L.quirk[d4 + "," + c4], b5 = wkBox(d4, c4); if (!qk || !wkKnown(d4, c4)) continue;
      if (qk.cur) for (var s = 0; s < 5; s++) { var u = ((t / 900 + s / 5) % 1), sx = qk.cur > 0 ? b5[0] + 2 + u * (WK.w - 8) : b5[0] + WK.w - 6 - u * (WK.w - 8), sy = b5[1] + 4 + s * 4; c.globalAlpha = .7 * Math.sin(u * Math.PI); mR(c, sx, sy, 4, 1, "#a8e0f4"); mR(c, sx + (qk.cur > 0 ? 3 : 0), sy - 1, 1, 1, "#a8e0f4"); c.globalAlpha = 1; }
      if (qk.pocket && !wkS.pocketUsed[d4 + "," + c4]) { var pw = 14 + Math.round(Math.sin(t / 500) * 1); mR(c, b5[0] + WK.w / 2 - pw / 2, b5[1], pw, 3, "rgba(216,244,252,.55)"); mR(c, b5[0] + WK.w / 2 - pw / 2 + 2, b5[1] + 3, pw - 4, 1, "rgba(216,244,252,.4)"); if (Math.floor(t / 300) % 4 === 0) mR(c, b5[0] + WK.w / 2 - 3, b5[1] + 1, 2, 1, "#ffffff"); }
    }
    // items, the chest
    Object.keys(wkS.items).forEach(function (k) {
      var q = k.split(","), kn = wkKnown(+q[0], +q[1]), qk2 = L.quirk[k]; if (!kn) return; if (qk2 && qk2.dark && kn < 2) return;
      var b3 = wkBox(+q[0], +q[1]), it = wkS.items[k], s2 = it === "chest" ? (wkS.chestOpen ? "w_chest_o" : "w_chest") : "w_" + it;
      if (!mOk(s2)) return; var im = miI[s2], bob = it === "chest" ? 0 : Math.round(Math.sin(t / 400 + +q[1]) * 1);
      c.drawImage(im, Math.round(b3[0] + WK.w / 2 - im.width / 2 + (it === "chest" ? 6 : 4)), b3[1] + WK.h - 3 - im.height + bob);
      if (it !== "chest" && Math.floor(t / 300 + +q[0] * 3) % 5 === 0) mR(c, b3[0] + WK.w / 2 + 6, b3[1] + WK.h - 12, 1, 1, "#ffffff");
    });
    // the dark
    for (var d3 = 0; d3 < wkS.R; d3++) for (var c3 = 0; c3 < wkS.C; c3++) {
      var kn2 = wkKnown(d3, c3), b4 = wkBox(d3, c3), qk3 = L.quirk[d3 + "," + c3]; if (kn2 === 2) continue;
      c.globalAlpha = kn2 === 1 ? (qk3 && qk3.dark ? .85 : .55) : .92; mR(c, b4[0], b4[1], WK.w, WK.h, "#06121e"); c.globalAlpha = 1;
      if (kn2 === 1 && qk3 && qk3.dark) { mR(c, b4[0] + WK.w / 2 - 1, b4[1] + 8, 3, 1, "#8aa0b4"); mR(c, b4[0] + WK.w / 2 + 1, b4[1] + 9, 1, 2, "#8aa0b4"); mR(c, b4[0] + WK.w / 2, b4[1] + 11, 1, 1, "#8aa0b4"); mR(c, b4[0] + WK.w / 2, b4[1] + 13, 1, 1, "#8aa0b4"); }   // a question mark: who knows what is in there
    }
    // collapsing frames
    wkS.falls = wkS.falls.filter(function (f) { var u2 = (t - f.t0) / 1200; if (u2 > 1) return false; for (var i = 0; i < 6; i++) mR(c, f.x - 3 + i * 1.3, f.y - 6 + u2 * 14 + (i % 3) * 2, 2, 1, "#5a4a3a"); c.globalAlpha = 1 - u2; for (var j = 0; j < 8; j++) mR(c, f.x + Math.sin(j * 7) * 6 * u2, f.y - 4 - u2 * 8 + j, 1, 1, "#a8987a"); c.globalAlpha = 1; return true; });
    // the diver
    var dx = Math.round(wkS.x + (wkS.nudge ? (wkS.nudge % 2 ? 1 : -1) : 0)), dy = Math.round(wkS.y + Math.sin(t / 300) * 1); if (wkS.nudge) wkS.nudge--;
    c.globalAlpha = .18; c.fillStyle = "#fff4c0"; c.beginPath(); c.arc(dx + 9, dy + 8, 14, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    var df = Math.floor(t / 220) % 2; if (mOk("w_diver" + df)) c.drawImage(miI["w_diver" + df], dx, dy);
    if (Math.random() < .08) wkS.fx.push({ x: dx + 9, y: dy, vx: 0, vy: -14, life: 1.4, c: "#d8f4fc", bub: 1 });
    wkS.fx = wkS.fx.filter(function (f) { f.life -= .016; f.x += f.vx * .016; f.y += f.vy * .016; if (!f.bub) f.vy += 20 * .016; c.globalAlpha = Math.min(1, f.life * 2); mR(c, f.x, f.y, 1, 1, f.c); c.globalAlpha = 1; return f.life > 0; });
    // air, keys, coins
    for (var a = 0; a < Math.max(wkS.air, 0); a++) { var ax = 4 + (a % 10) * 6, ay = 4 + Math.floor(a / 10) * 6, rc = wkS.flash > 0 ? "#ffffff" : "#e6f8fc"; mR(c, ax + 1, ay, 3, 1, rc); mR(c, ax + 1, ay + 4, 3, 1, rc); mR(c, ax, ay + 1, 1, 3, rc); mR(c, ax + 4, ay + 1, 1, 3, rc); mR(c, ax + 1, ay + 1, 1, 1, "#ffffff"); }
    if (wkS.flash > 0) wkS.flash -= .02;
    var iy = 6 + Math.ceil(Math.max(wkS.air, 1) / 10) * 6, kx = 4;   // keys and coins in a row under the air
    ["r", "b"].forEach(function (k) { if (wkS.keys[k] && mOk("w_key_" + k)) { c.drawImage(miI["w_key_" + k], kx, iy); kx += 12; } });
    for (var co = 0; co < wkS.coins; co++) if (mOk("w_coins")) { c.drawImage(miI.w_coins, kx, iy); kx += 9; }
    wkS.raf = requestAnimationFrame(wkDraw);
  }
  function wkOpen() { wkV.el.hidden = false; wkStart(); cancelAnimationFrame(wkS.raf); wkS.raf = requestAnimationFrame(wkDraw); }
  function wkClose() { if (wkS) cancelAnimationFrame(wkS.raf); wkS = null; wkV.el.hidden = true; }
  wkV.el.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); wkClose(); });
  window.__wreck = { open: wkOpen, go: function (d, c) { return wkGo(d, c); }, st: function () { return wkS && { L: wkS.L, pos: wkS.pos, air: wkS.air, keys: wkS.keys, coins: wkS.coins, over: wkS.over, busy: wkS.busy, items: wkS.items }; }, gen: wkGen, need: wkNeed };
  // ---------------------------------------------------------------- café: washing up
  // One piece at a time, one step at a time: into the sink, a squirt of washing-up liquid where it is greasy, scrub it clean,
  // rinse it under the tap, then put it in its place on the drying rack (plates in the slots, cups on the pegs,
  // cutlery in the cup, the teapot on the shelf). No clock anywhere.
  var dwV = mPov("mdw-pov", "Abwasch beenden"), dwS = null, DW = { cx: 86, cy: 64, R: 36 };
  var DW_RACK = [{ t: "plate", x: 139, y: 62, w: 7, h: 26 }, { t: "plate", x: 148, y: 62, w: 7, h: 26 }, { t: "plate", x: 157, y: 62, w: 7, h: 26 },
    { t: "cup", x: 139, y: 42, w: 11, h: 16 }, { t: "cup", x: 152, y: 42, w: 11, h: 16 }, { t: "fork", x: 165, y: 42, w: 11, h: 16 }, { t: "pot", x: 165, y: 66, w: 13, h: 22 }];
  var DW_NAME = { plate: "Kuchenteller", plate2: "Frühstücksteller", cup: "Kaffeetasse", fork: "Kuchengabel", pot: "Teekanne", bowl: "Müslischale", glass: "Saftglas", pan: "Pfanne", spoon: "Marmeladenlöffel", mug: "Kakaobecher" };
  function dwShape(k, dx, dy) {                                     // top view of each piece in the sink: 0 outside, 1 outline, 2 body, 3 rim/edge, 4 inside
    var d = Math.hypot(dx, dy);
    if (k === "plate" || k === "plate2") return d > 29 ? 0 : d > 28 ? 1 : d > 21 ? 3 : d > 20 ? 5 : 2;
    if (k === "cup") { if (dx >= 16 && dx <= 25 && Math.abs(dy) <= 5) { var hole = dx >= 19 && dx <= 22 && Math.abs(dy) <= 2; return hole ? 0 : (dx === 25 || Math.abs(dy) === 5 || (dx >= 18 && dx <= 23 && Math.abs(dy) === 3)) ? 1 : 3; } return d > 18 ? 0 : d > 17 ? 1 : d > 14 ? 3 : d > 13 ? 5 : 4; }
    if (k === "fork") { var ax = Math.abs(dx);
      if (dy >= -2 && dy <= 30) return ax > 3 ? 0 : ax === 3 ? 1 : 2;
      if (dy >= -10 && dy < -2) return ax > 7 ? 0 : ax === 7 ? 1 : 2;
      if (dy >= -30 && dy < -10) { if (ax > 7) return 0; var m = (dx + 7) % 4; return m === 3 ? 0 : (m === 0 || m === 2 || dy === -30) ? 1 : 2; }
      return 0; }
    if (k === "bowl") return d > 25 ? 0 : d > 24 ? 1 : d > 21 ? 3 : d > 20 ? 5 : 4;
    if (k === "glass") return d > 14 ? 0 : d > 13 ? 1 : d > 11 ? 3 : 4;
    if (k === "mug") { if (dx >= 17 && dx <= 27 && Math.abs(dy) <= 6) { var hm = dx >= 20 && dx <= 24 && Math.abs(dy) <= 3; return hm ? 0 : (dx === 27 || Math.abs(dy) === 6 || (dx >= 19 && dx <= 25 && Math.abs(dy) === 4)) ? 1 : 3; } return d > 19 ? 0 : d > 18 ? 1 : d > 15 ? 3 : d > 14 ? 5 : 4; }
    if (k === "pan") { if (dx > 24 && dx <= 36 && Math.abs(dy) <= 3) return dx === 36 || Math.abs(dy) === 3 ? 1 : 6; return d > 26 ? 0 : d > 25 ? 1 : d > 22 ? 2 : 4; }
    if (k === "spoon") { var e = (dx * dx) / 49 + ((dy + 20) * (dy + 20)) / 100; if (e <= 1) return e > .8 ? 1 : 2; var as = Math.abs(dx); if (dy >= -11 && dy <= 30) return as > 2 ? 0 : as === 2 || dy === 30 ? 1 : 2; return 0; }
    if (k === "pot") { if (dx < -24 && dx >= -36 && Math.abs(dy) <= 4 - (dx + 24) / -6) return Math.abs(dy) >= 3 - (dx + 24) / -6 || dx === -36 ? 1 : 3;
      if (dx > 24 && dx <= 34 && Math.abs(dy) <= 7) { var h2 = dx > 27 && dx < 32 && Math.abs(dy) < 5; return h2 ? 0 : (dx === 34 || Math.abs(dy) === 7 || (dx >= 27 && dx <= 32 && Math.abs(dy) === 5)) ? 1 : 3; }
      return d > 27 ? 0 : d > 26 ? 1 : d > 12 ? 2 : d > 11 ? 1 : 4; }
    return 0;
  }
  function dwRack(k) { return { plate2: "plate", bowl: "plate", mug: "cup", glass: "cup", spoon: "fork", pan: "pot" }[k] || k; }
  function dwClean(k) { return { plate: "plate_up", plate2: "plate2_up", bowl: "bowl_up", cup: "cup_c", mug: "mug_c", glass: "glass_c", fork: "fork_up", spoon: "spoon_up", pot: "pot_c", pan: "pan_c" }[k]; }
  function dwMake(k) {                                              // the dirt on one piece: a wear value per pixel, higher means stubborn
    var R = DW.R, N = R * 2, dirt = new Float32Array(N * N), kind = new Uint8Array(N * N), blobs = [];
    var add = function (x, y, r, hp, ty) { blobs.push([x, y, r, hp, ty]); };
    if (k === "plate") { for (var i = 0; i < 5; i++) add(Math.random() * 30 - 15, Math.random() * 30 - 15, 2 + Math.random() * 2, 1, 1); add(Math.random() * 16 - 8, Math.random() * 16 - 8, 6, 1, 2); }
    if (k === "plate2") { add(-6 + Math.random() * 6, -4 + Math.random() * 8, 9, 1, 3); add(8, 6, 5, 1, 3); add(-10, 10, 2, 1, 1); }
    if (k === "cup") { for (var a = 0; a < 26; a++) { var an = a / 26 * Math.PI * 2; add(Math.cos(an) * 11, Math.sin(an) * 11, 1.6, 1, 4); } add(0, 0, 5, 1.5, 4); }
    if (k === "fork") { add(0, -18, 7, 1, 2); add(0, -6, 4, 1, 1); add(1, 8, 2, 1, 2); }
    if (k === "pot") { add(0, 0, 10, 1.4, 5); add(-4, 3, 4, 1.8, 5); }
    if (k === "bowl") { add(0, 2, 9, 1, 8); for (var b2 = 0; b2 < 7; b2++) add(Math.random() * 20 - 10, Math.random() * 20 - 10, 1.6, 1, 3); }
    if (k === "glass") { for (var g2 = 0; g2 < 22; g2++) { var ag = g2 / 22 * Math.PI * 2; add(Math.cos(ag) * 8, Math.sin(ag) * 8, 1.5, 1, 7); } add(-9, -7, 2.4, 1, 6); }
    if (k === "pan") { add(2, -2, 12, 1.6, 5); add(-8, 6, 5, 2, 5); add(8, 8, 3, 1, 3); }
    if (k === "spoon") { add(0, -21, 5, 1, 6); add(1, -8, 1.6, 1, 6); }
    if (k === "mug") { for (var m2 = 0; m2 < 28; m2++) { var am = m2 / 28 * Math.PI * 2; add(Math.cos(am) * 12, Math.sin(am) * 12, 1.8, 1, 4); } add(0, 0, 6, 1.4, 4); }
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var dx = x - R, dy = y - R, sh = dwShape(k, dx, dy); if (!sh || sh === 1) continue; if ((k === "pot" || k === "pan" || k === "bowl" || k === "glass") && sh !== 4) continue;
      blobs.forEach(function (b) { var dd = Math.hypot(dx - b[0], dy - b[1]); if (dd <= b[2] + (((x * 7 + y * 13) % 5) - 2) * .25) { dirt[y * N + x] = Math.max(dirt[y * N + x], b[3]); kind[y * N + x] = b[4]; } });
    }
    var tot = 0; for (var j = 0; j < dirt.length; j++) if (dirt[j] > 0) tot++;
    return { k: k, dirt: dirt, kind: kind, tot: tot, foam: [], greasy: k === "plate2" || k === "pan", soaped: false, tool: k === "pot" || k === "pan" || k === "glass" ? "brush" : "sponge" };
  }
  function dwStart() {
    var all = ["plate", "plate2", "bowl", "cup", "mug", "glass", "fork", "spoon", "pot", "pan"].sort(function () { return Math.random() - .5; }), cap = { plate: 3, cup: 2, fork: 1, pot: 1 }, pool = [];
    all.forEach(function (k) { var r = dwRack(k); if (pool.length < 5 && cap[r] > 0) { cap[r]--; pool.push(k); } });
    if (window.__dishPool) pool = window.__dishPool.slice();   /* preview test hook */
    dwS = { stack: pool.slice().sort(function (a, b) { var R = { pan: -1, plate: 0, plate2: 0, bowl: 1, fork: 1.5, spoon: 1.5, pot: 2, cup: 3, mug: 3, glass: 3 }; return (R[a] - R[b]) || (Math.random() - .5); }),   /* a sensible pile: plates at the bottom, the cup on top */ cur: null, step: "take", rack: DW_RACK.map(function () { return null; }), wrong: 0, fx: [], drag: null, rub: null, rinse: 0, squirt: 0, done: 0, over: false, raf: 0, shake: 0, bub: [], popped: 0, foam: 0, duck: Math.random() < .6 ? { a: 0, sq: 0 } : null };
    dwV.card.hidden = true; dwStep("take");
  }
  function dwStep(st) {
    dwS.step = st;
    mBan(dwV, { take: "Ins Becken", splash: "Planschen", soap: "Spüli", scrub: "Schrubben", rinse: "Abspülen", dry: "Abtrocknen", put: "Einräumen" }[st]);
    if (st !== "take") { dwS.face = "happy"; dwS.faceT = performance.now() + 700; }
  }
  function dwLeft(it) { var n = 0; for (var i = 0; i < it.dirt.length; i++) if (it.dirt[i] > 0) n++; return n; }
  // tiny side views for the tray and the rack
  var DWSPR = {"plate":{"r":["................................","..........aaaaaaaaaaaa..........",".......aaaffffffffffffaaa.......",".....aaffbbiihhhhhhhhbbffaa.....","...aafbiihiiiiiiihhhhhhhhbfaa...","..affbihiiiiiiihhhhhhhhhhhbffa..",".affbihiiiddddhheehhhhhhhhhbffa.",".afiiiiiiddddddhhhhhhhhhhhhhhfa.",".afhhhiihhddddhhhhgggghhhhhhhfa.",".acfbhhhhhhhhhhhhhhgghhhhhhbfca.",".acffbhhhhhhhhhhhhhhhhhhhhbffca.","..accffbhhhhhhhhhhhhhhhhbffcca..","..accccfffbbhhhhhhhhbbfffcccca..","...aacccccccffffffffcccccccaa...",".....aaccccccccccccccccccaa.....",".......aaaaaccccccccaaaaa.......","............aaaaaaaa............"],"p":{"a":"#3a2414","b":"#6a9ad8","c":"#b8b0a4","d":"#c8283a","e":"#c8945a","f":"#d8d0c4","g":"#f8f0d0","h":"#f8f4ec","i":"#ffffff"}},"plate2":{"r":["................................","..........aaaaaaaaaaaa..........",".......aaaddddddddddddaaa.......",".....aaddeeggffffffffeeddaa.....","...aadeggfgggggggffffffffedaa...","..addegfggggccccffffffffffedda..",".addegfgggccccccccfffffffffedda.",".adggggggccccccccccffffffffffda.",".adfffggfccccccccccffccffffffda.",".abdefffffccccccccffccccfffedba.",".abddeffffffffffffffffffffeddba.","..abbddeffffffffffffffffeddbba..","..abbbbdddeeffffffffeedddbbbba..","...aabbbbbbbddddddddbbbbbbbaa...",".....aabbbbbbbbbbbbbbbbbbaa.....",".......aaaaabbbbbbbbaaaaa.......","............aaaaaaaa............"],"p":{"a":"#3a2414","b":"#b8b0a4","c":"#d8a030","d":"#d8d0c4","e":"#e8650c","f":"#f8f4ec","g":"#ffffff"}},"cup":{"r":["...................","....aaaaaa.........","..aaccccccaa.......",".accbbbbbbcca......",".acbbbbbbbbcda.....",".afcbbbbbbcdddaa...",".afffeeeeddddadda..",".afffeeeeddddadda..",".afffeeeeddddadda..",".afffeeeedddddaa...",".afffeeeedddda.....",".afffeeeedddda.....",".afffeeeedddda.....",".adddddddddda......","..adddddddda.......","...aaaaaaaa........","..................."],"p":{"a":"#3a2414","b":"#6a3a1a","c":"#b8b0a4","d":"#d8d0c4","e":"#f8f4ec","f":"#ffffff"}},"fork":{"r":["....................a...","...............aaaaada..","..aaaaaaaaaaaaaddddaada.",".adccccccccccccccccaca..",".abbbbbbbbbbbbbccccaaca.","..aaaaaaaaaaaaaaaaa..a.."],"p":{"a":"#3a2414","b":"#8a929c","c":"#c8d0d8","d":"#eef2f6"}},"pot":{"r":["..........................","..........................",".............a............","...........aaea...........",".........aaffefaa.........","........affffffffa........",".......afddddddddca.......","a.....affffddddeecca..a...","ea...afffffeeeeeecccaaca..","ceaa.affffeeeeeeecccaaca..","aceeaffffeeeeeeeeccccaaca.",".acceffffeeeeeeeeccccaaca.","..aacbbbbbbbbbbbbbbbbaaca.","....afeeeeeeeeeeeccccaca..",".....aeeeeeeeeeeecccaaca..",".....aeeeeeeeeeeeccca.a...","......aeeeeeeeeeecca......",".......aeeeeeeeeeca.......","........aaeeeeeeaa........","..........aaaaaa.........."],"p":{"a":"#3a2414","b":"#6fae5a","c":"#d8d0c4","d":"#e8e0d4","e":"#f8f4ec","f":"#ffffff"}},"pot_c":{"r":["..........................","..........................",".............a............","...........aaea...........",".........aaffefaa.........","........affffffffa........",".......afddddddddca.......","a.....affffddddeecca..a...","ea...afffffeeeeeecccaaca..","ceaa.affffeeeeeeecccaaca..","aceeaffffeeeeeeeeccccaaca.",".acceffffeeeeeeeeccccaaca.","..aacbbbbbbbbbbbbbbbbaaca.","....afeeeeeeeeeeeccccaca..",".....aeeeeeeeeeeecccaaca..",".....aeeeeeeeeeeeccca.a...","......aeeeeeeeeeecca......",".......aeeeeeeeeeca.......","........aaeeeeeeaa........","..........aaaaaa.........."],"p":{"a":"#3a2414","b":"#6fae5a","c":"#d8d0c4","d":"#e8e0d4","e":"#f8f4ec","f":"#ffffff"}},"plate_up":{"r":["...aa...","..acca..",".acccca.",".acbbca.",".abeeba.",".abeeba.","aceeeeca","aceeeeca","abeeeeba","abeeeeba","abeeeeba","abddddba","abddddba","abddddba","abddddba","abddddba","abddddba","abddddba","acddddca","acddddca",".abddba.",".abddba.",".acbbca.",".acccca.","..acca..","...aa..."],"p":{"a":"#3a2414","b":"#6a9ad8","c":"#d8d0c4","d":"#f8f4ec","e":"#ffffff"}},"plate2_up":{"r":["...aa...","..abba..",".abbbba.",".abccba.",".aceeca.",".aceeca.","abeeeeba","abeeeeba","aceeeeca","aceeeeca","aceeeeca","acddddca","acddddca","acddddca","acddddca","acddddca","acddddca","acddddca","abddddba","abddddba",".acddca.",".acddca.",".abccba.",".abbbba.","..abba..","...aa..."],"p":{"a":"#3a2414","b":"#d8d0c4","c":"#e8650c","d":"#f8f4ec","e":"#ffffff"}},"cup_c":{"r":["...................","....aaaaaa.........","..aabbbbbbaa.......",".abbddddddbba......",".abddddddddbca.....",".afbddddddbcccaa...",".afffeeeeccccacca..",".afffeeeeccccacca..",".afffeeeeccccacca..",".afffeeeecccccaa...",".afffeeeecccca.....",".afffeeeecccca.....",".afffeeeecccca.....",".acccccccccca......","..acccccccca.......","...aaaaaaaa........","..................."],"p":{"a":"#3a2414","b":"#b8b0a4","c":"#d8d0c4","d":"#d8dce4","e":"#f8f4ec","f":"#ffffff"}},"bottle":{"r":[".....aea....",".....aea....","....aaea....","...ahfffa...","...ahfffa...","...ahfffa...","...ahfffa...","...ahfffa...","..adcccbba..",".addccccbba.",".addccccbba.","adddccccbbba","addcccccbbba","addcccccbbba","addhhhhhhbba","addggggggbba","addggggggbba","addgeeeggbba","addggggggbba","addgeegggbba","addggggggbba","addggggggbba","addcccccbbba","addcccccbbba","addcccccbbba","addcccccbbba",".addccccbba.",".addccccbba."],"p":{"a":"#3a2414","b":"#3e8a3a","c":"#5ab04a","d":"#a8e890","e":"#e8650c","f":"#f4f0e6","g":"#fff8ec","h":"#ffffff"}},"bowl":{"r":["........................",".......bbbbbbbbbb.......","....bbbddddggddddbbb....","...bddggggggggggggddb...","..bdggggggggggggggggdb..",".bdggggggggggggggggggdb.","bedgggghhhhhhggggggggdab",".bddiiihffhhhffiiiiiddb.",".beediiiihhiiiiiiiidaab.",".beeeeddiiiiiiiiddaaaab.","..beeeedddddddccccaaab..","..beeeedddddddccccaaab..","..beeeeeddddddccccaaab..","...bbeeeddddddcccaabb...",".....beeddddddcccab.....","......beddddddcccb......",".......bbbbbbbbbb.......","........................","........................"],"p":{"a":"#2a5a9a","b":"#3a2414","c":"#3a7ac8","d":"#6aa0e8","e":"#a8c8f8","f":"#e8b84a","g":"#f4ead8","h":"#f8f0d0","i":"#fffaf0"}},"glass":{"r":["............","...aaaaaa...","..aeeeeeeaa.",".aecccccceba",".aeecccceeba",".adhheedbbba",".adhhdddbbba",".adhhdddbbba",".agggffffbba",".agggffffbba",".agggffffbba",".agggffffbba",".agggffffbba",".agggffffbba",".adhhdddbbba",".adhhdddbbba","..aaaaaaaaa.",".abbbbbbbba.","..aaabbaaa..",".....aa....."],"p":{"a":"#4a6a80","b":"#a8cce0","c":"#bcdcec","d":"#cfe8f4","e":"#e4f4fc","f":"#e8963a","g":"#f8b048","h":"#ffffff"}},"glass_c":{"r":["............","...aaaaaa...","..aeeeeeeaa.",".aecccccceba",".aeecccceeba",".adffeedbbba",".adffdddbbba",".adffdddbbba",".adffdddbbba",".adffdddbbba",".adffdddbbba",".adffdddbbba",".adffdddbbba",".adffdddbbba",".adffdddbbba",".adffdddbbba","..aaaaaaaaa.",".abbbbbbbba.","..aaabbaaa..",".....aa....."],"p":{"a":"#4a6a80","b":"#a8cce0","c":"#bcdcec","d":"#cfe8f4","e":"#e4f4fc","f":"#ffffff"}},"pan":{"r":["......................................",".........bbbbbbbbbb...................","......bbbggggggggggbbb................","....bbgghhhhhhhhhheeggbb..............","...bghhhhhhhhhhheeeeeeegb.............","..bghhhhhhhhhcccccceeeeegb............",".bghhhhhhhhcccccccccceeeegb......bbb..",".bghhhhhheecccccccccceeeegbbbbbbbfffb.",".bgghhheeeecccccccccceeeggffffffddddb.",".bagheeeeeeeecccccceeeeegaddddddbbbb..",".baaggeeeeeeeeeeeeeeeeggaabbbbbb......",".baaaaggeeeeeeeeeeeeggaaaab...........","..baaaaaaaggggggggaaaaaaab............","...baaaaaaaaaaaaaaaaaaaab.............","....bbaaaaaaaaaaaaaaaabb..............","......bbbbaaaaaaaabbbb................"],"p":{"a":"#2a2a30","b":"#3a2414","c":"#3a2a20","d":"#3e2816","e":"#46464e","f":"#5a3a22","g":"#5a5a64","h":"#6a6a76"}},"pan_c":{"r":["......................................",".........bbbbbbbbbb...................","......bbbggggggggggbbb................","....bbgghhhhhhhhhheeggbb..............","...bghhhhhhhhhhheeeeeeegb.............","..bghhhhhhhhhcccccceeeeegb............",".bghhhhhhhhcccccccccceeeegb......bbb..",".bghhhhhheecccccccccceeeegbbbbbbbfffb.",".bgghhheeeecccccccccceeeggffffffddddb.",".bagheeeeeeeecccccceeeeegaddddddbbbb..",".baaggeeeeeeeeeeeeeeeeggaabbbbbb......",".baaaaggeeeeeeeeeeeeggaaaab...........","..baaaaaaaggggggggaaaaaaab............","...baaaaaaaaaaaaaaaaaaaab.............","....bbaaaaaaaaaaaaaaaabb..............","......bbbbaaaaaaaabbbb................"],"p":{"a":"#2a2a30","b":"#3a2414","c":"#46464e","d":"#3e2816","e":"#46464e","f":"#5a3a22","g":"#5a5a64","h":"#6a6a76"}},"spoon":{"r":["......................","...............aaaa...","..............aeeeea..","..aaaaaaaaaaaaeeeddda.",".adddddddddddeeccccdda",".abbbbbbbbbbbbdddddda.","..aaaaaaaaaaaaadddda..","...............aaaa..."],"p":{"a":"#3a2414","b":"#8a929c","c":"#c8283a","d":"#c8d0d8","e":"#ffffff"}},"spoon_up":{"r":["..aaa..",".adcca.","addccca","addccca","addccca","addccca",".adcca.","..acba.","..acba.","..acba.","..acba.","..acba.","..acba.","..acba.","..acba.","..acba.","..acba.","..acba.","..acba.","..acba."],"p":{"a":"#3a2414","b":"#8a929c","c":"#c8d0d8","d":"#ffffff"}},"fork_up":{"r":["adadada","adadada","adadada","adadada","addccca","addccca","addccca","addccca",".aacba.","..acba.","..acba.","..acba.","..acba.","..acba.","..acba.","..acba.","..acba.","..acba.","..acba.","..acba."],"p":{"a":"#3a2414","b":"#8a929c","c":"#c8d0d8","d":"#eef2f6"}},"mug":{"r":[".....................",".....bbbbbb..........","...bbaaaaaabb........","..baddddddddabb......",".baddddddddddacb.....",".baaddddddddaacb.....",".bffaaddddaaccccbb...",".bffffeeeecccccbccb..",".bffffeeeecccccbccb..",".bffffeeeecccccbccb..",".bffffeeeeccccccbb...",".bffffeeeecccccb.....",".bffffeeeecccccb.....",".bffffeeeecccccb.....",".bffffeeeecccccb.....","..bbbbbbbbbbbbb......",".bccccccccccccb......","..bbccccccccbb.......","....bbbbbbbb.........","....................."],"p":{"a":"#2e6a2a","b":"#3a2414","c":"#3e8a3a","d":"#5a3418","e":"#6fae5a","f":"#a8d890"}},"mug_c":{"r":[".....................",".....bbbbbb..........","...bbaaaaaabb........","..baffffffffabb......",".baffffffffffacb.....",".baaffffffffaacb.....",".beeaaffffaaccccbb...",".beeeeddddcccccbccb..",".beeeeddddcccccbccb..",".beeeeddddcccccbccb..",".beeeeddddccccccbb...",".beeeeddddcccccb.....",".beeeeddddcccccb.....",".beeeeddddcccccb.....",".beeeeddddcccccb.....","..bbbbbbbbbbbbb......",".bccccccccccccb......","..bbccccccccbb.......","....bbbbbbbb.........","....................."],"p":{"a":"#2e6a2a","b":"#3a2414","c":"#3e8a3a","d":"#6fae5a","e":"#a8d890","f":"#d8dce4"}},"bowl_up":{"r":[".....bb.....","...bbaabb...","..baaccaab..","..baccccab..",".badccffcab.",".badcfffeab.",".bddcfffecb.","baddffffeeab","baddffffeeab","baddffffeeab","baddffffeeab","bdddffffeecb","bdddffffeecb","baddffffeeab","baddffffeeab","baddffffeeab","baddffffeeab",".bddcfffecb.",".badcfffeab.",".badccffcab.","..baccccab..","..baaccaab..","...bbaabb...",".....bb....."],"p":{"a":"#2a5a9a","b":"#3a2414","c":"#3a7ac8","d":"#6aa0e8","e":"#e4dcd0","f":"#f8f4ec"}},"rack_bg":{"r":["...............................................","..aaa.....................................aaa..",".acdba...................................acdba.",".acdba...................................acdba.",".acdba...................................acdba.",".acdba...................................acdba.",".acdba...................................acdba.",".acdba...................................acdba.",".acdba...................................acdba.",".acdba...................................acdba.",".acdba...................................acdba.",".acdba...................................acdba.",".acdba...................................acdba.",".acdba...................................acdba.",".acdba...................................acdba.",".acdba...................................acdba.",".acdba...................................acdba.",".acdba...................................acdba.",".acdba...................................acdba.",".acdbaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaacdba.",".aeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeea.",".addddddddddddddddddddddddddddddddddddddddddda.",".addddddddddddddddddddddddddddddddddddddddddda.",".addddddddddddddddddddddddddddddddddddddddddda.",".addddddddddddddddddddddddddddddddddddddddddda.",".accccccccccccccccccccccccccccccccccccccccccca.",".accccccccccccccccccccccccccccccccccccccccccca.",".abbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbba.",".acdbaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaacdba.",".acdba...................................acdba.",".acdba.......aa.......aa.......aa........acdba.",".acdfea.....afea.....afea.....afea.......acdba.",".acdeca.....aeca.....aeca.....aeca.......acdba.",".acdeca.....aeca.....aeca.....aeca.......acdba.",".acdeca.....aeca.....aeca.....aeca.......acdba.",".acdeca.....aeca.....aeca.....aeca.......acdba.",".acdeca.....aeca.....aeca.....aeca.......acdba.",".acdeca.....aeca.....aeca.....aeca.......acdba.",".acdeca.....aeca.....aeca.....aeca.......acdba.",".acdeca.....aeca.....aeca.....aeca.......acdba.",".acdeca.....aeca.....aeca.....aeca.......acdba.",".acdeca.....aeca.....aeca.....aeca.......acdba.",".acdeca.....aeca.....aeca.....aeca.......acdba.",".acdeca.....aeca.....aeca.....aeca.......acdba.",".acdeca.....aeca.....aeca.....aeca.......acdba.",".acdeca.....aeca.....aeca.....aeca.......acdba.",".acdeca.....aeca.....aeca.....aeca.......acdba.",".acdecaaaaaaaecaaaaaaaecaaaaaaaecaaaaaaaaacdba.","aeeeeceeeeeeeeceeeeeeeeceeeeeeeeceeeeeeeeeeeeea","adddecdddddddecdddddddecdddddddecddddddddddddda","addddddddddddddddddddddddddddddddddddddddddddda","addddddddddddddddddddddddddddddddddddddddddddda","addddddddddddddddddddddddddddddddddddddddddddda","addddddddddddddddddddddddddddddddddddddddddddda","accccccccccccccccccccccccccccccccccccccccccccca","accccccccccccccccccccccccccccccccccccccccccccca","accccccccccccccccccccccccccccccccccccccccccccca","accccccccccccccccccccccccccccccccccccccccccccca","abbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbba",".aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.","...............................................","..............................................."],"p":{"a":"#3a2414","b":"#7a4e2a","c":"#a87448","d":"#c8945a","e":"#e0b07a","f":"#f0c890"}},"rack_cut":{"r":["...aaaaaaa...",".aaeebbbeeaa.","aebbbbbbbbbea","aebbbbbbbbbea","affeebbbeecca","afffdddddccca","afffdddddccca","afffdddddccca","afffdddddccca","afffdddddccca","afffdddddccca","afffdddddccca"],"p":{"a":"#3a2414","b":"#5a6470","c":"#7a8692","d":"#a8b4c0","e":"#c8d0d8","f":"#e0e8f0"}},"cup_r":{"r":[".................","...aaaaaa........","..abbddbbaa......",".abddddddbca.....",".abddddddbca.....",".affebbeccccaa...",".affeeeecccacca..",".affeeeecccacca..",".affeeeecccacca..",".affeeeeccccaa...",".affeeeeccca.....","..aaaaaaaaa......",".acccccccca......","..aaaccaaa.......",".....aa.........."],"p":{"a":"#3a2414","b":"#b8b0a4","c":"#d8d0c4","d":"#d8dce4","e":"#f8f4ec","f":"#ffffff"}},"mug_r":{"r":["..................","....bbbbb.........","..bbaafaabb.......",".bafffffffab......",".bafffffffacb.....",".beaafffaacccbb...",".beeedddccccbccb..",".beeedddccccbccb..",".beeedddccccbccb..",".beeedddcccccbb...",".beeedddccccb.....",".beeedddccccb.....",".beeedddccccb.....",".bcccccccccb......","..bcccccccb.......","...bbbbbbb........",".................."],"p":{"a":"#2e6a2a","b":"#3a2414","c":"#3e8a3a","d":"#6fae5a","e":"#a8d890","f":"#d8dce4"}},"glass_r":{"r":["..........","...aaaa...","..aecceaa.",".aecccceba",".adeeeebba",".adfddbbba",".adfddbbba",".adfddbbba",".adfddbbba",".adfddbbba",".adfddbbba",".adfddbbba",".adfddbbba",".abbbbbba.","..abbbba..","...aaaa..."],"p":{"a":"#4a6a80","b":"#a8cce0","c":"#bcdcec","d":"#cfe8f4","e":"#e4f4fc","f":"#ffffff"}},"pot_r":{"r":["....................","....................","........aaaa........",".......aeedea.......","......aeeeeeea......","a....aeeeeeedca.....","daa.aeeeeddddcca.a..","addaeeeddddddcccaca.",".aadeeeddddddcccaca.","...abbbbbbbbbbbbaca.","...aeddddddddcccaca.","....addddddddcca.a..",".....adddddddca.....","......adddddda......",".......aaaaaa......."],"p":{"a":"#3a2414","b":"#6fae5a","c":"#d8d0c4","d":"#f8f4ec","e":"#ffffff"}},"pan_r":{"r":["......baab......","......bgdb......","......bgdb......","......bgdb......","......bgdb......","......bgdb......","......bgdb......","......bgdb......","......bgdb......","......bgdb......","......bgdb......","....bbbadbb.....","...baaeeeaab....","..bafeeeeecab...",".baffeeeeeccab..",".bfffeeccccccb..","bafffeeccccccab.","baffeeeccccccab.","bfffeeecccccccb.","bfffeeecccccccb.","bfffeeecccccccb.","bffeeeecccccccb.","bfffeeecccccccb.","bfffeeecccccccb.","baffeeeccccccab.","baffeeeccccccab.",".bfffeeccccccb..",".baffeecccccab..","..bafeeeeecab...","...baaeeeaab....","....bbbabbb.....",".......b........"],"p":{"a":"#2a2a30","b":"#3a2414","c":"#46464e","d":"#5a3a22","e":"#5a5a64","f":"#6a6a76","g":"#8a5a32"}},"duck":{"r":["..........bbjjbb....",".........bjjjjihb...",".........bjjjjjhb...","..b.....bjjjiiaafb..",".bhb...bbiiiihhfdbb.",".bhbbbbjjjihhhfdbeeb",".bhbjjjjjjhhffddccgb","bhjjjjjjjjjiddhhbbb.","bjjjjjjjjiiiihhhfb..","bjjjjjjdddiihhhffb..","bijjiidiiidhhhffdb..","biiiiiihhhhhfffddb..",".bhhhhhhhffffdddb...","..bbffffffddddbb....","....bbbddddbbb......",".......bbbb........."],"p":{"a":"#2a1a10","b":"#5a3a08","c":"#c84a08","d":"#c87a10","e":"#e8650c","f":"#e8a818","g":"#f08030","h":"#f8c828","i":"#ffe060","j":"#fff4b0"}},"duck_sq":{"r":["....................","............bb......","..........bbjjbb....",".........bjjjjihb...","..b......bjjjjjhb...",".bhb....bjjjiiaafb..",".bhb...bbiiiihhfdbb.",".bhbbbbjjjihhhfdbeeb","bhbjjjjjjjhhffddccgb",".bjjjjjjjjiiddhhbbb.","bjjjjjjdddiihhhffb..","biiiiidiihdhhfffdb..",".biiihhhhhhfffddb...","..bhhhfffffddddb....","...bbbbddddbbbb.....",".......bbbb........."],"p":{"a":"#2a1a10","b":"#5a3a08","c":"#c84a08","d":"#c87a10","e":"#e8650c","f":"#e8a818","g":"#f08030","h":"#f8c828","i":"#ffe060","j":"#fff4b0"}},"t_sponge":{"r":["..aaaaaaaaaaaaaaaa..",".agggggggggggggggga.",".aggiigggggggggggga.",".affhffdffffffdeeea.",".afffffdfffddfeeeea.",".affffffffffddeeeea.",".affffffffffffeeeea.",".afffdfffffdffdeeda.",".affffffdfffffeedea.",".accccccccccccbbbba.",".accccccccccccbbbba.",".accccccccccccbbbba.","..aaaaaaaaaaaaaaaa..","...................."],"p":{"a":"#3a2414","b":"#4e9a3a","c":"#6fc05a","d":"#d89a20","e":"#e8b030","f":"#ffd34a","g":"#fff1a8","h":"#fffbe0","i":"#ffffff"}},"t_brush":{"r":[".....agea.....",".....aeca.....",".....aeca.....",".....aaca.....",".....aeca.....",".....aeca.....",".....aeca.....",".....aeca.....",".....aeca.....",".....aeca.....",".....aeca.....",".....aeca.....",".....aeca.....",".....aeca.....",".....aeca.....",".....aeca.....",".....aeca.....",".....aeca.....",".....adba.....",".....adba.....","....aadbaa....","...aiidhffa...","..aiihhhfffa..",".aiiihhhffffa.","..aiihdhfffa..",".aiiihhhffffa.","..aiihhhfffa..",".aiiihdhffffa.","..aiihhhfffa..",".aiiihhhffffa.","..aaiidhffaa..","....aaaaaa...."],"p":{"a":"#3a2414","b":"#7a8692","c":"#8a5a32","d":"#a8b0bc","e":"#c8945a","f":"#d0c4ac","g":"#e0b07a","h":"#f0ead8","i":"#ffffff"}},"t_towel":{"r":[".aaa.........aaaaaaajijijijijaaaaaa.","ajijaaaaaaaaajijijijijijijijijihfhfa","aijijijijijijijijijijijijijijijfhfha","ajijijijijijijijijijijijijijijihfhfa","aijijijijijijijijijijijijijijijfhfha","ajijijijijijijijijijegegegegejihfhfa","aegejijijijijegegegegegegegegegegega","agegegegegegegegegegegegegegegegegea","aegegegegegegegegegegegegegegegegega","agegegegegegegegegegijijijijigegegea","aijigegegegegijijijicbcbcbcbcijfhfha","acbcijijijijicbcbcbcbcbcbcbcbcbcbcba","abcbcbcbcbcbcbcbcbcbjijijijijbcbcbca","ajijbcbcbcbcbjijijijijijijijijihfhfa","aijijijijijijijijijijijijijijijfhfha","adddddddddddddddddddddddddddddddddda","afhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfha","ahfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfa","afhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfha","ahfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfa","afhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfha","afafafafafafafafafafafafafafafafafa.","adadadadadadadadadadadadadadadadada.",".a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.."],"p":{"a":"#3a2414","b":"#5a8ad8","c":"#6a9ae8","d":"#d8ccb8","e":"#e8554a","f":"#e8dccc","g":"#f06a5a","h":"#f0e6d6","i":"#f8f2e6","j":"#fffaf0"}}}, DWSC = {};   /* 2.5d pieces: the dirty stack, the clean rack, the washing-up liquid */
  function dwSpr(c, n, x, y) { var cv = DWSC[n]; if (!cv) { var d = DWSPR[n]; cv = document.createElement("canvas"); cv.width = d.r[0].length; cv.height = d.r.length; var g = cv.getContext("2d");
      d.r.forEach(function (row, yy) { for (var xx = 0; xx < row.length; xx++) { var col = d.p[row[xx]]; if (col) { g.fillStyle = col; g.fillRect(xx, yy, 1, 1); } } }); DWSC[n] = cv; }
    c.drawImage(cv, Math.round(x), Math.round(y)); return cv; }
  var DWLIFT = { plate: 3, plate2: 3, cup: 12, fork: 2, pot: 14, bowl: 10, glass: 14, pan: 5, spoon: 2, mug: 14 };
  // the window above the sink looks onto the real garden (the same half-size pictures as the living-room bay window)
  var DWWIN = { key: "", cv: null, imgs: {} };
  function dwWindow(c) {
    var X = 54, Y = 2, Wd = 48, Ht = 17;
    mR(c, X - 2, Y - 1, Wd + 4, Ht + 3, "#3a2414"); mR(c, X - 1, Y, Wd + 2, Ht + 1, "#f4ead8");
    var se = typeof season === "function" ? season() : "summer", ph = typeof daylight === "function" ? daylight() : "day", key = se + ph;
    if (typeof WBH === "object" && WBH["far_" + se]) {
      if (DWWIN.key !== key) { DWWIN.key = key; var cv = document.createElement("canvas"); cv.width = Wd; cv.height = Ht; DWWIN.cv = cv; var g = cv.getContext("2d"), grd = g.createLinearGradient(0, 0, 0, Ht);
        grd.addColorStop(0, ph === "night" ? "#1e2a52" : ph === "twilight" ? "#f4a878" : "#8fd0f4"); grd.addColorStop(1, ph === "night" ? "#34407a" : ph === "twilight" ? "#f8d8a8" : "#d8f0fc"); g.fillStyle = grd; g.fillRect(0, 0, Wd, Ht);
        ["far", "t0", "t1", "t2", "t3", "rest"].forEach(function (k) { var src = WBH[k + "_" + se], im = DWWIN.imgs[src]; if (!im) { im = new Image(); im.src = src; DWWIN.imgs[src] = im; im.onload = function () { DWWIN.key = ""; }; }
          if (im.complete && im.naturalWidth) g.drawImage(im, -34, -14); });
        if (ph === "night") { g.fillStyle = "rgba(12,16,48,.45)"; g.fillRect(0, 0, Wd, Ht); } }
      c.drawImage(DWWIN.cv, X, Y);
    } else mR(c, X, Y, Wd, Ht, "#8fd0f4");
    mR(c, X + Wd / 2 - 1, Y, 2, Ht, "#f4ead8"); mR(c, X, Y + 8, Wd, 1, "#f4ead8"); mR(c, X - 3, Y + Ht + 1, Wd + 6, 2, "#c8b490"); mR(c, X - 3, Y + Ht + 3, Wd + 6, 1, "#3a2414");
  }
  function dwMini(c, k, x, y, upright) {
    var O = "#3a2414", W = "#f8f4ec", S = "#d8d0c4";
    if (k === "plate" || k === "plate2") { if (upright) { mR(c, x, y, 5, 24, O); mR(c, x + 1, y + 1, 3, 22, W); mR(c, x + 3, y + 1, 1, 22, S); mR(c, x + 1, y + 3, 3, 1, k === "plate" ? "#6a9ad8" : "#e8650c"); mR(c, x + 1, y + 20, 3, 1, k === "plate" ? "#6a9ad8" : "#e8650c"); } else { mR(c, x, y, 26, 4, O); mR(c, x + 1, y + 1, 24, 2, W); mR(c, x + 1, y + 2, 24, 1, S); mR(c, x + 3, y + 1, 20, 1, k === "plate" ? "#6a9ad8" : "#e8650c"); } return; }
    if (k === "cup") { if (upright) { mR(c, x, y, 9, 9, O); mR(c, x + 1, y + 1, 7, 7, W); mR(c, x + 6, y + 1, 2, 7, S); mR(c, x + 1, y + 6, 7, 1, "#e8650c"); mR(c, x + 3, y - 2, 3, 2, O); } else { mR(c, x, y, 9, 8, O); mR(c, x + 1, y + 1, 7, 6, W); mR(c, x + 6, y + 1, 2, 6, S); mR(c, x + 1, y + 2, 7, 1, "#e8650c"); mR(c, x + 9, y + 2, 3, 4, O); mR(c, x + 9, y + 3, 2, 2, W); } return; }
    if (k === "fork") { mR(c, x, y, 4, 14, O); mR(c, x + 1, y + 1, 2, 12, "#c8d0d8"); mR(c, x + 1, y + 1, 1, 12, "#eef2f6"); return; }
    if (k === "pot") { mR(c, x + 1, y + 2, 12, 10, O); mR(c, x + 2, y + 3, 10, 8, W); mR(c, x + 9, y + 3, 3, 8, S); mR(c, x + 2, y + 6, 10, 1, "#6fae5a"); mR(c, x + 5, y, 4, 3, O); mR(c, x + 6, y + 1, 2, 1, W); mR(c, x - 2, y + 4, 3, 3, O); mR(c, x - 1, y + 5, 2, 1, W); mR(c, x + 13, y + 4, 2, 5, O); return; }
  }
  // ---------- the kitchen in 2.5D: wall tiles at the back, the counter seen a little from above, the sink let into it ----------
  var DWK = null;
  function dwKitchen() {
    if (DWK) return DWK; var cv = document.createElement("canvas"); cv.width = 180; cv.height = 135; var c = cv.getContext("2d");
    var P = function (x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); };
    // wall: cream tiles with grout and a light top edge, a little shelf with jars
    for (var ty = 0; ty < 22; ty += 8) for (var tx = (ty / 8) % 2 ? -4 : 0; tx < 180; tx += 8) { P(tx, ty, 8, 8, "#d8c8a8"); P(tx + 1, ty + 1, 7, 7, ((tx + ty) / 8) % 2 ? "#f4ead4" : "#efe2c8"); P(tx + 1, ty + 1, 7, 1, "#fbf4e4"); }
    P(0, 0, 180, 1, "#b88a5a");
    P(132, 6, 44, 3, "#3a2414"); P(133, 6, 42, 2, "#c8945a"); P(133, 6, 42, 1, "#e0b07a");
    [[136, "#e8650c"], [146, "#6fae5a"], [156, "#e8c060"], [166, "#8ac8e8"]].forEach(function (j) { P(j[0], -1, 8, 7, "#3a2414"); P(j[0] + 1, 0, 6, 6, j[1]); P(j[0] + 1, 0, 2, 6, "#ffffff33"); P(j[0] + 1, 1, 6, 1, "#fff8ec"); });
    // counter top: light wood, planks getting a little wider towards the front (perspective), a back edge against the wall
    P(0, 22, 180, 2, "#7a5030"); var y = 24, k = 0;
    while (y < 100) { var h = 4 + Math.floor(k / 2); P(0, y, 180, h, k % 2 ? "#d8a870" : "#e0b07a"); P(0, y, 180, 1, k % 2 ? "#e8bc88" : "#f0c894"); P(0, y + h - 1, 180, 1, "#b88450");
      for (var g = (k * 37) % 23; g < 180; g += 31 + (k * 7) % 13) P(g, y + 1 + (k % 2), 6 + (g % 5), 1, "#c8945a"); y += h; k++; }
    P(0, 100, 180, 4, "#3a2414"); P(0, 100, 180, 3, "#a87448"); P(0, 100, 180, 1, "#c8945a");
    // cabinet below: doors with frames and round knobs
    P(0, 104, 180, 31, "#8a5a32");
    for (var dx = 0; dx < 180; dx += 45) { P(dx + 2, 106, 41, 29, "#3a2414"); P(dx + 3, 107, 39, 28, "#a87448"); P(dx + 6, 110, 33, 22, "#9a6638"); P(dx + 6, 110, 33, 1, "#7a4c28"); P(dx + 6, 110, 1, 22, "#7a4c28"); P(dx + 7, 131, 32, 1, "#c8945a");
      P(dx + (dx % 90 ? 7 : 36), 118, 3, 3, "#3a2414"); P(dx + (dx % 90 ? 8 : 37), 119, 1, 1, "#e8d8b0"); }
    // the sink: a steel basin let into the counter, a broad rim with light on top, the back wall seen inside, a drain
    var X0 = 48, X1 = 124, Y0 = 26, Y1 = 102;
    for (var yy = Y0; yy < Y1; yy++) for (var xx = X0; xx < X1; xx++) { var cx = Math.max(X0 + 6, Math.min(X1 - 7, xx)), cy = Math.max(Y0 + 6, Math.min(Y1 - 7, yy)), d = Math.hypot(xx - cx, yy - cy); if (d > 6.5) continue;
      P(xx, yy, 1, 1, d > 5.6 ? "#3a2414" : d > 3.6 ? (yy < Y0 + 4 || xx < X0 + 4 ? "#e8eef4" : "#b8c0c8") : "#5a646e"); }
    for (var yy2 = Y0 + 3; yy2 < Y1 - 3; yy2++) for (var xx2 = X0 + 3; xx2 < X1 - 3; xx2++) { var cx2 = Math.max(X0 + 8, Math.min(X1 - 9, xx2)), cy2 = Math.max(Y0 + 8, Math.min(Y1 - 9, yy2)); if (Math.hypot(xx2 - cx2, yy2 - cy2) > 5) continue;
      P(xx2, yy2, 1, 1, yy2 < Y0 + 12 ? (yy2 < Y0 + 5 ? "#3a2414" : yy2 % 3 ? "#8a949e" : "#7a848e") : "#6a747e"); }
    P(X0 + 4, Y0 + 3, X1 - X0 - 8, 1, "#3a2414");
    DWK = cv; return cv;
  }
  function dwStackPiece(c, k, cx, y, h, t) {                         // dirty pieces on the board, seen from above-front: ellipse tops, a side, a crumb or two
    var O = "#3a2414";
    if (k === "plate" || k === "plate2") { mR(c, cx - 14, y + 1, 28, 3, O); mR(c, cx - 15, y + 2, 30, 1, O); mR(c, cx - 13, y + 1, 26, 2, "#f8f4ec"); mR(c, cx - 14, y + 2, 28, 1, "#d8d0c4"); mR(c, cx - 10, y + 1, 20, 1, k === "plate" ? "#6a9ad8" : "#e8650c"); mR(c, cx - 3, y, 6, 1, O); mR(c, cx - 2, y + 1, 2, 1, k === "plate" ? "#c8945a" : "#f0d870"); return; }
    if (k === "cup") { mR(c, cx - 5, y, 10, 8, O); mR(c, cx - 4, y + 1, 8, 6, "#f8f4ec"); mR(c, cx + 1, y + 1, 3, 6, "#d8d0c4"); mR(c, cx - 4, y + 1, 8, 1, "#5a3418"); mR(c, cx - 4, y + 5, 8, 1, "#e8650c"); mR(c, cx + 5, y + 2, 3, 4, O); mR(c, cx + 5, y + 3, 2, 2, "#f8f4ec"); return; }
    if (k === "fork") { mR(c, cx - 10, y, 20, 3, O); mR(c, cx - 9, y + 1, 18, 1, "#c8d0d8"); mR(c, cx - 9, y + 1, 6, 1, "#eef2f6"); mR(c, cx + 4, y + 1, 3, 1, "#c8945a"); return; }
    if (k === "pot") { mR(c, cx - 7, y + 2, 14, 10, O); mR(c, cx - 6, y + 3, 12, 8, "#f8f4ec"); mR(c, cx + 2, y + 3, 4, 8, "#d8d0c4"); mR(c, cx - 6, y + 6, 12, 1, "#6fae5a"); mR(c, cx - 2, y, 4, 3, O); mR(c, cx - 1, y + 1, 2, 1, "#f8f4ec"); mR(c, cx - 11, y + 4, 5, 3, O); mR(c, cx - 10, y + 5, 3, 1, "#f8f4ec"); mR(c, cx + 7, y + 4, 2, 6, O); }
  }
  function dwTap(c, S, t) {                                          // base on the back right of the sink, an arched spout, a red lever
    var on = S.rinse > 0, lv = on ? 3 : 0;
    mR(c, 112, 16, 12, 12, "#3a2414"); mR(c, 113, 17, 10, 10, "#b8c0c8"); mR(c, 113, 17, 3, 10, "#e8eef4"); mR(c, 120, 17, 2, 10, "#8a949e"); mR(c, 110, 26, 16, 3, "#3a2414"); mR(c, 111, 26, 14, 2, "#a8b0b8");
    for (var a = 0; a <= 20; a++) { var u = a / 20, x = Math.round(117 - u * 23), y = Math.round(16 - Math.sin(u * Math.PI) * 9 + (u > .8 ? (u - .8) * 30 : 0)); mR(c, x - 2, y - 2, 5, 5, "#3a2414"); }
    for (var a2 = 0; a2 <= 20; a2++) { var u2 = a2 / 20, x2 = Math.round(117 - u2 * 23), y2 = Math.round(16 - Math.sin(u2 * Math.PI) * 9 + (u2 > .8 ? (u2 - .8) * 30 : 0)); mR(c, x2 - 1, y2 - 1, 3, 3, "#b8c0c8"); mR(c, x2 - 1, y2 - 1, 3, 1, "#e8eef4"); }
    mR(c, 92, 20, 5, 3, "#3a2414"); mR(c, 93, 21, 3, 1, "#5a646e");
    mR(c, 124, 14 - lv, 12, 4, "#3a2414"); mR(c, 125, 15 - lv, 10, 2, "#d8463c"); mR(c, 125, 15 - lv, 10, 1, "#f06a5a"); mR(c, 133, 11 - lv, 4, 8, "#3a2414"); mR(c, 134, 12 - lv, 2, 6, "#f06a5a");
  }
  function dwRackDraw(c, S, t) {                                     // the plate rack in 2.5d: posts, an upper shelf for cups and glasses, a tray with dowels, a cutlery pot
    dwSpr(c, "rack_bg", 133, 34);
    var cut = null;
    DW_RACK.forEach(function (r, i) {
      var it = S.rack[i], hl = S.drag && !it && S.step === "put" && r.t === dwRack(S.cur ? S.cur.k : "");
      if (r.t === "fork") cut = r;
      if (!it) return; var wob = S.wob && S.wob.i === i ? Math.round(Math.sin(S.wob.t * 30) * S.wob.t * 4) : 0, n = { cup: "cup_r", mug: "mug_r", glass: "glass_r", pot: "pot_r", pan: "pan_r" }[it] || dwClean(it), sp = DWSPR[n], w = sp.r[0].length, h = sp.r.length;
      if (r.t === "plate") dwSpr(c, n, r.x + 3.5 - w / 2 + wob, 86 - h);
      else if (r.t === "cup") dwSpr(c, n, r.x + 5.5 - w / 2 + (n === "glass_r" ? 0 : -2), 58 - h + Math.abs(wob));
      else if (r.t === "fork") dwSpr(c, n, r.x + 2, 38 + wob);
      else if (n === "pan_r") dwSpr(c, n, r.x + wob, 56); else dwSpr(c, n, Math.min(178 - w, r.x + 6.5 - w / 2) + wob, 86 - h + 2);
    });
    if (cut) dwSpr(c, "rack_cut", cut.x - 1, 47);
    if (S.wob) { S.wob.t -= .016; if (S.wob.t <= 0) S.wob = null; }
  }
  function dwWater(c, S, it, t) {                                     // the water in the basin: blue or soapy, light ripples drifting, rings where something touched it
    var soapy = it.soaped || S.squirt || S.foam > 30, X0 = 52, X1 = 120, Y0 = 34, Y1 = 98;
    for (var y = Y0; y < Y1; y++) for (var x = X0; x < X1; x++) { var cx = Math.max(X0 + 6, Math.min(X1 - 7, x)), cy = Math.max(Y0 + 6, Math.min(Y1 - 7, y)); if (Math.hypot(x - cx, y - cy) > 6) continue;
      var w = Math.sin((x + t / 90) / 5) + Math.sin((y * 1.7 + t / 140) / 4), col = soapy ? (w > 1.2 ? "#ffffff" : w > .2 ? "#e4f2fa" : "#cfe6f2") : (w > 1.3 ? "#cfeaf8" : w > .1 ? "#9ac6e2" : "#7aaed0");
      if (y === Y0 || y === Y0 + 1) col = soapy ? "#b8d4e2" : "#6a9ac0"; mR(c, x, y, 1, 1, col); }
    S.rip = (S.rip || []).filter(function (r) { r.t += .016; var R = r.t * 26, a = 1 - r.t / .9; if (a <= 0) return false; c.globalAlpha = a;
      for (var k = 0; k < 24; k++) { var an = k / 24 * Math.PI * 2, px = r.x + Math.cos(an) * R, py = r.y + Math.sin(an) * R * .55; if (px > X0 + 2 && px < X1 - 2 && py > Y0 + 2 && py < Y1 - 2) mR(c, px, py, 1, 1, "#ffffff"); } c.globalAlpha = 1; return true; });
  }
  function dwRipple(x, y) { if (dwS) (dwS.rip = dwS.rip || []).push({ x: x, y: y, t: 0 }); }
  function dwArrow(c, x, y, t, dir) {                                   // a small bouncing arrow pointing at the next thing to touch
    var b = Math.round(Math.sin(t / 150) * 2), K = "#3a2414", Y = "#ffd34a";
    if (dir === "d") { y += b; mR(c, x - 2, y - 8, 5, 6, K); mR(c, x - 1, y - 7, 3, 5, Y); for (var i = 0; i < 4; i++) { mR(c, x - 4 + i, y - 2 + i, 9 - i * 2, 1, K); if (i < 3) mR(c, x - 3 + i, y - 2 + i, 7 - i * 2, 1, Y); } }
    else { x += b; mR(c, x - 8, y - 2, 6, 5, K); mR(c, x - 7, y - 1, 5, 3, Y); for (var j = 0; j < 4; j++) { mR(c, x - 2 + j, y - 4 + j, 1, 9 - j * 2, K); if (j < 3) mR(c, x - 2 + j, y - 3 + j, 1, 7 - j * 2, Y); } }
  }
  function dwDraw(t) {
    if (!dwS) return; var c = dwV.c, S = dwS; c.clearRect(0, 0, 180, 135);
    c.drawImage(dwKitchen(), 0, 0);   // the kitchen, drawn once: tiles, a shelf, the counter seen a little from above, the sink let into it
    // washing-up liquid: a round green bottle with a label, light on the left
    var sq = S.step === "soap", bz = S.squirt > .6 ? 1 : 0;
    dwSpr(c, "bottle", 30, 24 + bz);   /* it stands at the back of the counter, a little above the stack */
    // the board with the dirty pieces, a little stack seen from above-front
    mR(c, 2, 88, 36, 6, "#3a2414"); mR(c, 3, 89, 34, 3, "#c8945a"); mR(c, 3, 89, 34, 1, "#e0b07a"); mR(c, 3, 92, 34, 1, "#8a5a32");
    var sy = 92, held = S.step === "take" && S.drag ? S.stack.length - 1 : -1; S.stack.forEach(function (k, i) { if (i === held) return; var d = DWSPR[k], w = d.r[0].length, h = d.r.length; dwSpr(c, k, 20 - w / 2 + (i % 2 ? 1 : 0), sy - h + 2); sy -= DWLIFT[k] || 3; });
    S.heldK = held >= 0 ? S.stack[held] : null;
    // the tap behind the sink: a round base, an arched spout over the middle, a red lever that tips while water runs
    dwWindow(c); dwTap(c, S, t);
    // the drying rack on the right, wire and wood, seen from above-front
    dwRackDraw(c, S, t);
    // the piece in the sink, big, in a round of soapy water
    var it = S.cur;
    if (!it || S.step === "put") dwWater(c, S, { soaped: false }, t);   // the basin is always full of water
    if (it && S.step !== "put") {
      dwWater(c, S, it, t);
      var N = DW.R * 2;
      for (var y2 = 0; y2 < N; y2++) for (var x2 = 0; x2 < N; x2++) {
        var dx = x2 - DW.R, dy = y2 - DW.R, sh = dwShape(it.k, dx, dy); if (!sh) continue;
        var lt = (-dx - dy) / 40, col;
        if (sh === 1) col = "#3a2414";
        else if (it.k === "fork" || it.k === "spoon") col = lt > .3 ? "#f4f8fc" : lt > -.2 ? "#c8d0d8" : "#9aa4ae";
        else if (it.k === "pan") col = sh === 6 ? (lt > 0 ? "#8a5a32" : "#6a4226") : sh === 4 ? (lt > .2 ? "#5a5a64" : "#46464e") : (lt > .2 ? "#7a7a86" : "#5a5a64");
        else if (it.k === "glass") col = sh === 3 ? (lt > .3 ? "#ffffff" : "#cfe8f4") : (lt > .35 ? "#ffffff" : lt > -.1 ? "#e4f4fc" : "#cfe6f2");
        else if (sh === 3 && it.k === "bowl") col = lt > .3 ? "#a8c8f8" : lt > -.3 ? "#6aa0e8" : "#3a7ac8";
        else if (sh === 3 && it.k === "mug") col = lt > .3 ? "#a8d890" : lt > -.3 ? "#6fae5a" : "#3e8a3a";
        else if (sh === 4) col = it.k === "pot" ? (Math.hypot(dx, dy) > 8 ? "#5a4434" : "#4a3628") : (lt > .1 ? "#f4efe6" : "#e4dcd0");
        else if (sh === 5) col = it.k === "plate" ? "#6a9ad8" : it.k === "plate2" ? "#e8650c" : it.k === "bowl" ? "#2a5a9a" : it.k === "mug" ? "#f8f4ec" : "#d8d0c4";
        else if (sh === 3) col = lt > .35 ? "#ffffff" : lt > -.3 ? "#f4efe6" : "#d8d0c4";
        else col = lt > .4 ? "#ffffff" : lt > -.25 ? "#f8f4ec" : "#e0d8cc";
        if (it.k === "cup" && sh === 3 && Math.hypot(dx, dy) > 15 && Math.hypot(dx, dy) < 16.5) col = "#e8650c";
        if (it.k === "pot" && sh === 2 && Math.abs(Math.hypot(dx, dy) - 19) < 1) col = "#6fae5a";
        var dv = it.dirt[y2 * N + x2];
        if (dv > 0 && !(dv < .4 && (x2 + y2) % 2) && !(dv < .2 && (x2 * 3 + y2) % 4)) { var kd = it.kind[y2 * N + x2];   /* dirt thins out (dithered) as it is scrubbed */ col = kd === 1 ? ((x2 + y2) % 2 ? "#c8945a" : "#a87448") : kd === 2 ? (dv > .5 ? "#fff8f0" : "#f4e8dc") : kd === 3 ? ((x2 * 3 + y2) % 4 ? "#f0d870" : "#fff0a0") : kd === 4 ? (dv > 1.1 ? "#5a3418" : "#8a5a32") : kd === 6 ? ((x2 + y2) % 3 ? "#c8283a" : "#e84a5a") : kd === 7 ? ((x2 * 3 + y2) % 4 ? "#f0a030" : "#f8c060") : kd === 8 ? ((x2 * 5 + y2 * 3) % 7 === 0 ? "#e8b84a" : "#f8f0dc") : (dv > 1.2 ? "#3a2010" : "#6a4020");
          if (kd === 2 && (x2 + y2) % 5 === 0) col = "#e8c0c8"; }
        mR(c, DW.cx + dx, DW.cy + dy, 1, 1, col);
      }
      it.foam.forEach(function (f) { mR(c, f[0] - 1, f[1], 3, 1, "#ffffff"); mR(c, f[0], f[1] - 1, 1, 3, "#ffffff"); mR(c, f[0], f[1], 1, 1, "#d8eef8"); });
      if (S.step === "scrub") {                                         // sponge or bottle brush under the finger; before the first rub it shows the motion
        var p = S.rub;   /* the tool only while the finger is on it */
        if (p) { c.globalAlpha = S.rub ? 1 : .8;
          if (it.tool === "sponge") dwSpr(c, "t_sponge", p[0] - 10, p[1] - 7); else dwSpr(c, "t_brush", p[0] - 7, p[1] - 26);
          c.globalAlpha = 1; }
        var pct = 1 - dwLeft(it) / Math.max(1, it.tot);                   // a ring of gold dots round the basin fills as it gets clean
        for (var a = 0; a < 40; a++) { if (a / 40 > pct) break; var an = -Math.PI / 2 + a / 40 * Math.PI * 2; mR(c, DW.cx + Math.cos(an) * (DW.R + 3) - 1, DW.cy + Math.sin(an) * (DW.R + 3) - 1, 2, 2, pct >= .97 ? "#6fd04a" : "#ffd34a"); }
      }
      if (S.step === "soap" && S.squirt > 0) { S.squirt -= .016; for (var q = 0; q < 8; q++) { var u = 1 - S.squirt / .9 - q * .05; if (u > 0 && u < 1) mR(c, 36 + (DW.cx - 36) * u, 24 - Math.sin(u * Math.PI) * 14 + (DW.cy - 24) * u, 2, 2, "#8ae070"); } if (S.squirt <= 0) { S.squirt = 0; it.soaped = true; for (var f2 = 0; f2 < 10; f2++) it.foam.push([DW.cx + Math.random() * 30 - 15, DW.cy + Math.random() * 30 - 15]); dwStep("scrub"); } }
      if (S.rinse > 0) { S.rinse -= .016;
        // a clear stream from the spout down onto the piece, wobbling a little, splashes and rings where it lands
        var sx0 = 94, sy0 = 23, ex = DW.cx + Math.sin(t / 160) * 4, ey = DW.cy - 4;
        for (var r2 = 0; r2 < 40; r2++) { var u = r2 / 40, xx3 = sx0 + (ex - sx0) * u, yy3 = sy0 + (ey - sy0) * u; mR(c, xx3 - 1, yy3, 3, 2, (r2 + Math.floor(t / 40)) % 4 ? "#a8d8f0" : "#ffffff"); mR(c, xx3 - 1, yy3, 1, 2, "#e8f6ff"); }
        if (Math.random() < .5) S.fx.push({ x: ex, y: ey, vx: (Math.random() - .5) * 50, vy: -20 - Math.random() * 25, life: .5, c: Math.random() < .5 ? "#bfe8ff" : "#ffffff" });
        if (Math.random() < .12) dwRipple(ex, ey + 4);
        if (it.foam.length && Math.random() < .25) it.foam.shift();
        if (S.rinse <= 0) { S.rinse = 0; it.foam = []; beep([[880, .05], [1175, .05]]);
          // drops stay on the clean piece: dry them off with the towel
          S.drops = []; var N3 = DW.R * 2, tries = 0; while (S.drops.length < 12 && tries++ < 600) { var qx = Math.floor(Math.random() * N3) - DW.R, qy = Math.floor(Math.random() * N3) - DW.R, sh3 = dwShape(it.k, qx, qy); if (sh3 >= 2 && S.drops.every(function (d) { return Math.hypot(d.x - qx, d.y - qy) > 6; })) S.drops.push({ x: qx, y: qy }); }
          dwStep("dry"); } }
      if (S.step === "dry") {
        (S.drops || []).forEach(function (d) { var x = DW.cx + d.x, y = DW.cy + d.y; mR(c, x - 1, y - 2, 3, 5, "#3a5a78"); mR(c, x, y - 3, 1, 1, "#3a5a78"); mR(c, x, y - 1, 1, 3, "#a8d8f0"); mR(c, x, y - 1, 1, 1, "#ffffff"); });
        if (S.towel) dwSpr(c, "t_towel", S.towel[0] - 18, S.towel[1] - 12);   /* a big striped terry towel, under the finger */
      }
    }
    // the clean piece in the hand on its way to the rack
    if (it && S.step === "put") {
      var hp = S.drag ? S.drag : S.slipPos ? [S.slipPos[0], S.slipPos[1] + Math.sin(t / 200) * 1] : [DW.cx, DW.cy - 4 + Math.sin(t / 300) * 2];
      if (S.back > 0) { S.back = Math.max(0, S.back - .05); hp = [S.bx + (DW.cx - S.bx) * (1 - S.back), S.by + (DW.cy - 4 - S.by) * (1 - S.back)]; }
      var rk = dwRack(it.k);
      var cs = DWSPR[dwClean(it.k)]; dwSpr(c, dwClean(it.k), hp[0] - cs.r[0].length / 2, hp[1] - cs.r.length / 2);
    }
    if (S.heldK && S.drag) { var hd = DWSPR[S.heldK]; dwSpr(c, S.heldK, S.drag[0] - hd.r[0].length / 2, S.drag[1] - hd.r.length / 2); }   /* the piece under the finger */
    S.fx = S.fx.filter(function (f) { f.life -= .016; f.x += f.vx * .016; f.y += f.vy * .016; f.vy += 30 * .016; c.globalAlpha = Math.min(1, f.life * 2); mR(c, f.x, f.y, f.b ? 2 : 1, f.b ? 2 : 1, f.c); c.globalAlpha = 1; return f.life > 0; });
    // the rubber duck bobbing in the suds, soap bubbles drifting up, foam rising while you splash
    if (it && (S.step === "splash" || S.step === "scrub" || S.step === "soap") && S.duck) { var dk = S.duck; dk.a += .01; dk.x = DW.cx + Math.cos(dk.a) * 26; dk.y = DW.cy + Math.sin(dk.a) * 26; var sq = dk.sq > 0 ? 1 : 0; if (dk.sq > 0) dk.sq -= .04;
      dwSpr(c, sq ? "duck_sq" : "duck", dk.x - 10, dk.y - 11); }   /* a round rubber duck, squashed for a moment when it squeaks */
    if (it && S.step !== "put" && S.step !== "take" && Math.random() < (S.step === "splash" ? .02 + S.foam / 2500 : .03)) S.bub.push({ x: DW.cx + rnd(-28, 28), y: DW.cy + rnd(0, 20), r: 2 + Math.floor(Math.random() * 3), vy: -.25 - Math.random() * .3, ph: Math.random() * 6 });
    S.bub = S.bub.filter(function (b) { b.y += b.vy; b.x += Math.sin(t / 400 + b.ph) * .2; var r = b.r; c.globalAlpha = .9; for (var a2 = 0; a2 < 16; a2++) { var an = a2 / 16 * Math.PI * 2; mR(c, b.x + Math.cos(an) * r, b.y + Math.sin(an) * r, 1, 1, a2 % 4 === 1 ? "#ffffff" : "#9ad8f4"); } mR(c, b.x - r / 2, b.y - r / 2, 1, 1, "#ffffff"); c.globalAlpha = 1; return b.y > -6; });
    if (S.step === "splash") { var fl = Math.round(S.foam / 100 * 30); for (var fb = 0; fb < fl; fb++) { var fa = fb * 2.4, fr = 8 + (fb * 7) % 26; mR(c, DW.cx + Math.cos(fa) * fr - 2, DW.cy + Math.sin(fa) * fr - 1, 4, 3, "#ffffff"); mR(c, DW.cx + Math.cos(fa) * fr - 1, DW.cy + Math.sin(fa) * fr - 2, 2, 1, "#ffffff"); }
      for (var fm = 0; fm < 40; fm++) { if (fm / 40 > S.foam / 100) break; var am = -Math.PI / 2 + fm / 40 * Math.PI * 2; mR(c, DW.cx + Math.cos(am) * (DW.R + 3) - 1, DW.cy + Math.sin(am) * (DW.R + 3) - 1, 2, 2, "#bfe8ff"); }
      if (!S.splashing) { var bw = Math.sin(t / 150) * 6; mR(c, DW.cx - 10 + bw, DW.cy + 30, 6, 2, "#ffd34a"); mR(c, DW.cx + 4 + bw, DW.cy + 30, 6, 2, "#ffd34a"); } }
    // how many are left: little dish icons, top left
    var all = 5, clean = S.rack.filter(Boolean).length; for (var n = 0; n < all; n++) { var ix = 4 + n * 9; mR(c, ix, 6, 8, 8, "#3a2414"); mR(c, ix + 1, 7, 6, 6, n < clean ? "#6fd04a" : "#f8f4ec"); if (n < clean) { mR(c, ix + 2, 9, 1, 1, "#fff8ec"); mR(c, ix + 3, 10, 1, 1, "#fff8ec"); mR(c, ix + 4, 9, 1, 1, "#fff8ec"); mR(c, ix + 5, 8, 1, 1, "#fff8ec"); } }
    // our real hamster at the bottom left reacts with his own faces; little paws under the finger while working
    var fk = S.face && performance.now() < (S.faceT || 0) ? S.face : (S.rub || S.splashing || S.towel || S.drag ? "work" : "idle");
    if (fk !== S.lastFace && typeof HV_FACES !== "undefined") { S.lastFace = fk; front(HV_FACES[fk] || HV_FACES.idle); if (fk === "happy") pulse("bighop", 620); else if (fk === "oops") pulse("hop", 380); }
    dwS.raf = requestAnimationFrame(dwDraw);
  }
  function dwHit(p, r) { return p[0] >= r.x - 3 && p[0] <= r.x + r.w + 3 && p[1] >= r.y - 3 && p[1] <= r.y + r.h + 3; }
  dwV.cv.addEventListener("pointerdown", function (e) {
    if (!dwS || dwS.over) return; var hr = ham.getBoundingClientRect(); if (e.clientX >= hr.left && e.clientX <= hr.right && e.clientY >= hr.top && e.clientY <= hr.bottom) return; var S = dwS, p = mPt(dwV, e); try { dwV.cv.setPointerCapture(e.pointerId); } catch (x) {}
    if (S.step === "take") { if (p[0] < 40 && p[1] > 34 && p[1] < 96 && S.stack.length) { S.drag = p; S.dragK = S.stack[S.stack.length - 1]; beep([[300, .04]]); } return; }
    if (S.step === "soap") { if (p[0] > 26 && p[0] < 46 && p[1] > 18 && p[1] < 58 && !S.squirt) { S.squirt = .9; beep([[500, .05], [300, .08]]); } return; }
    S.paw = p;
    for (var bI = 0; bI < S.bub.length; bI++) { var bb = S.bub[bI]; if (Math.hypot(bb.x - p[0], bb.y - p[1]) < bb.r + 3) { S.bub.splice(bI, 1); S.popped++; beep([[1400 + rnd(0, 400), .03]]); for (var q = 0; q < 6; q++) S.fx.push({ x: bb.x, y: bb.y, vx: (Math.random() - .5) * 40, vy: (Math.random() - .5) * 40, life: .4, c: q % 2 ? "#ffffff" : "#bfe8ff" }); return; } }
    if (S.duck && Math.hypot(S.duck.x - p[0], S.duck.y - p[1]) < 7 && (S.step === "splash" || S.step === "scrub")) { S.duck.sq = 1; beep([[1200, .05], [900, .08]]); mBan(dwV, "Quietsch!"); S.face = "happy"; S.faceT = performance.now() + 700; return; }
    if (S.step === "splash") { if (Math.hypot(p[0] - DW.cx, p[1] - DW.cy) < DW.R) S.splashing = p; return; }
    if (S.step === "scrub") { S.rub = p; S.rubbed = true; dwRub(p, p); return; }
    if (S.step === "dry") { S.towel = p; dwDry(p); return; }
    if (S.step === "rinse") { if (p[0] > 106 && p[0] < 142 && p[1] > 4 && p[1] < 32 && !S.rinse) { S.rinse = 2.6; beep([[200, .05], [260, .05]]); } return; }
    if (S.step === "put") { var hp0 = S.slipPos || [DW.cx, DW.cy]; if (Math.hypot(p[0] - hp0[0], p[1] - hp0[1]) < 26) { S.drag = p; S.dragD = 0; } return; }
  });
  dwV.cv.addEventListener("pointermove", function (e) {
    if (!dwS) return; var S = dwS, p = mPt(dwV, e);
    if (S.rub || S.drag || S.splashing) S.paw = p;
    if (S.drag) {
      if (false && S.step === "put" && S.cur && !S.cur.slipped) { S.dragD += Math.hypot(p[0] - S.drag[0], p[1] - S.drag[1]); if (S.dragD > 22) {        // soapy: it shoots out of the paws once
        S.cur.slipped = true; S.drag = null; S.paw = null; var a = Math.random() * Math.PI * 2; S.slipPos = [Math.max(60, Math.min(118, p[0] + Math.cos(a) * 22)), Math.max(40, Math.min(90, p[1] + Math.sin(a) * 16))];
        beep([[700, .04], [400, .06], [900, .05]]); mBan(dwV, "Hupps, rutschig!"); S.face = "oops"; S.faceT = performance.now() + 900; for (var q = 0; q < 8; q++) S.fx.push({ x: p[0], y: p[1], vx: (Math.random() - .5) * 50, vy: -20 - Math.random() * 20, life: .6, c: "#ffffff" }); return; } }
      S.drag = p; return; }
    if (S.splashing) { var dx = Math.abs(p[0] - S.splashing[0]) + Math.abs(p[1] - S.splashing[1]); S.splashing = p;
      if (Math.hypot(p[0] - DW.cx, p[1] - DW.cy) < DW.R) { S.foam = Math.min(100, S.foam + dx * .25); if (Math.random() < .18) dwRipple(p[0], p[1]); if (Math.random() < .5) { S.fx.push({ x: p[0], y: p[1], vx: (Math.random() - .5) * 60, vy: -40 - Math.random() * 40, life: .7, c: Math.random() < .5 ? "#bfe8ff" : "#ffffff", b: 1 }); } if (Math.random() < .3) beep([[200 + rnd(0, 200), .03]]);
        if (Math.random() < .25 && S.cur.foam.length < 60) S.cur.foam.push([p[0] + rnd(-6, 6), p[1] + rnd(-6, 6)]);
        if (S.foam >= 100) { S.splashing = null; S.paw = null; dwStep(S.cur.greasy ? "soap" : "scrub"); } } return; }
    if (S.rub) { var last = S.rub; S.rub = p; dwRub(last, p); }
    if (S.towel) { S.towel = p; dwDry(p); }
  });
  function dwDry(p) {
    var S = dwS; if (!S || S.step !== "dry") return; var n0 = S.drops.length;
    S.drops = S.drops.filter(function (d) { if (Math.hypot(DW.cx + d.x - p[0], DW.cy + d.y - p[1]) > 13) return true; S.fx.push({ x: DW.cx + d.x, y: DW.cy + d.y, vx: (Math.random() - .5) * 20, vy: -10, life: .4, c: "#bfe8ff" }); return false; });
    if (S.drops.length < n0) beep([[700 + rnd(0, 300), .02]]);
    if (!S.drops.length) { S.towel = null; S.paw = null; for (var s3 = 0; s3 < 14; s3++) S.fx.push({ x: DW.cx + Math.random() * 40 - 20, y: DW.cy + Math.random() * 30 - 15, vx: (Math.random() - .5) * 20, vy: -20 - Math.random() * 20, life: .8, c: s3 % 2 ? "#ffffff" : "#ffd34a" }); beep([[880, .05], [1175, .05], [1568, .1]]); dwStep("put"); }
  }
  function dwUp(e) {
    if (!dwS) return; var S = dwS, p = e ? mPt(dwV, e) : S.drag; S.splashing = null; if (S.step !== "put" || !S.drag) S.paw = null;
    if (S.step === "take" && S.drag) { var inSink = Math.hypot(p[0] - DW.cx, p[1] - DW.cy) < DW.R + 6; S.drag = null;
      if (inSink) { S.stack.pop(); S.cur = dwMake(S.dragK); beep([[260, .05], [180, .1]]); for (var k = 0; k < 10; k++) S.fx.push({ x: DW.cx + Math.random() * 40 - 20, y: DW.cy + 20, vx: (Math.random() - .5) * 40, vy: -30 - Math.random() * 20, life: .7, c: "#cfe6f2", b: 1 }); S.foam = 0; dwRipple(DW.cx, DW.cy); dwRipple(DW.cx - 10, DW.cy + 6); dwStep("splash"); S.rubbed = false; } }
    else if (S.step === "scrub") S.rub = null;
    else if (S.step === "dry") S.towel = null;
    else if (S.step === "put" && S.drag) {
      var rk = dwRack(S.cur.k), idx = -1; DW_RACK.forEach(function (r, i) { if (idx < 0 && dwHit(p, r)) idx = i; }); S.drag = null;
      S.paw = null;
      if (idx >= 0 && DW_RACK[idx].t === rk && !S.rack[idx]) {
        S.rack[idx] = S.cur.k; S.cur = null; S.slipPos = null; S.wob = { i: idx, t: .5 }; S.face = "happy"; S.faceT = performance.now() + 900; beep([[1047, .04], [1319, .04], [1568, .08]]); var r = DW_RACK[idx];
        for (var s2 = 0; s2 < 10; s2++) S.fx.push({ x: r.x + r.w / 2, y: r.y + r.h / 2, vx: (Math.random() - .5) * 40, vy: -20 - Math.random() * 20, life: .7, c: "#ffd34a" });
        if (S.stack.length) dwStep("take"); else dwEnd();
      } else if (idx >= 0 || p[0] > 132) { S.face = "oops"; S.faceT = performance.now() + 900; S.wrong++; S.back = 1; S.bx = p[0]; S.by = p[1]; beep([[160, .08], [130, .1]]); mBan(dwV, rk === "plate" ? "Teller und Schalen gehören in die Schlitze" : rk === "cup" ? "Tassen und Gläser kommen aufs obere Brett" : rk === "fork" ? "Besteck kommt in den Becher" : "Kanne und Pfanne gehören aufs Brett"); }
    }
  }
  dwV.cv.addEventListener("pointerup", dwUp); dwV.cv.addEventListener("pointercancel", function () { if (dwS) { dwS.rub = null; dwS.drag = null; } });
  function dwRub(a, b) {
    var S = dwS, it = S.cur, N = DW.R * 2, n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]))), rr = it.tool === "brush" ? 4 : 5, hit = false;
    for (var s = 0; s <= n; s++) { var x = a[0] + (b[0] - a[0]) * s / n - DW.cx + DW.R, y = a[1] + (b[1] - a[1]) * s / n - DW.cy + DW.R;
      for (var yy = -rr; yy <= rr; yy++) for (var xx = -rr; xx <= rr; xx++) { if (xx * xx + yy * yy > rr * rr) continue; var ix = Math.round(x + xx), iy = Math.round(y + yy); if (ix < 0 || iy < 0 || ix >= N || iy >= N) continue; var j = iy * N + ix; if (it.dirt[j] > 0) { it.dirt[j] = Math.max(0, it.dirt[j] - .03); hit = true; } } }
    if (hit && Math.random() < .3) { it.foam.push([b[0] + Math.random() * 8 - 4, b[1] + Math.random() * 8 - 4]); if (it.foam.length > 40) it.foam.shift(); S.fx.push({ x: b[0], y: b[1], vx: (Math.random() - .5) * 10, vy: -16, life: .9, c: "#ffffff" }); }
    if (hit && Math.random() < .25) beep([[1400 + Math.random() * 400, .02]]);
    if (dwLeft(it) <= it.tot * .05) { for (var j2 = 0; j2 < it.dirt.length; j2++) it.dirt[j2] = 0; S.rub = null; beep([[660, .05], [880, .08]]); dwStep("rinse"); }
  }
  function dwEnd() {
    var S = dwS; S.over = true; var st = S.wrong === 0 ? 3 : S.wrong <= 2 ? 2 : 1, M = mL("dishes"); M.best = Math.max(M.best || 0, st);
    for (var k = 0; k < 30; k++) S.fx.push({ x: 157, y: 64, vx: (Math.random() - .5) * 90, vy: -30 - Math.random() * 40, life: 1.1, c: ["#ffd34a", "#ffffff", "#8ad86a"][k % 3] });
    setTimeout(function () { if (!dwS) return;
      dwV.card.innerHTML = '<div class="fi-c"><p class="fi-h">Alles blitzblank!</p>' + mStars(st) + (S.popped ? '<p class="fi-s">' + S.popped + ' Seifenblasen zerplatzt</p>' : "") + '<div class="fi-row"><button type="button" class="fi-b2" data-a="end">Fertig</button><button type="button" class="fi-b" data-a="again">Noch ein Tablett</button></div></div>';
      dwV.card.hidden = false; }, 1100);
  }
  dwV.card.addEventListener("click", function (e) { e.stopPropagation(); var b = e.target.closest("button"); if (!b) return; if (b.dataset.a === "again") { dwStart(); } else dwClose(); });
  var dwHamP = null;
  var dwCafe = false;
  function dwOpen(fromCafe) {
    dwCafe = fromCafe === true;   /* from the sink icon in the café: the café keeps running underneath */
    if (dwCafe) { if (typeof cfGameOn !== "undefined") cfGameOn = true; }
    else if (busy && cur !== "dish") interrupt();
    dwV.el.hidden = false; dwStart();
    cancelAnimationFrame(dwS.raf); dwS.raf = requestAnimationFrame(dwDraw);
    if (!dwCafe && cur !== "dish") act("dish", async function () { while (dwS) await wait(250); });   /* no idle animations while washing up */
    if (!dwHamP) { dwHamP = { par: ham.parentNode, nxt: ham.nextSibling, z: ham.style.zIndex, x: H.x, y: H.y, dir: H.dir }; scene.appendChild(ham); scene.classList.add("pz-on", "hv-on"); moveTo(24, 132, 0); H.dir = 1; } }
  function dwClose() { if (dwS) cancelAnimationFrame(dwS.raf); dwS = null; dwV.el.hidden = true; if (dwCafe) { dwCafe = false; if (typeof cfGameOn !== "undefined") cfGameOn = false; }
    if (dwHamP) { var hp = dwHamP; dwHamP = null; hp.par.insertBefore(ham, hp.nxt && hp.nxt.parentNode === hp.par ? hp.nxt : null); ham.style.zIndex = hp.z; H.dir = hp.dir; moveTo(hp.x, hp.y, 0); scene.classList.remove("pz-on", "hv-on"); settle(); } }
  dwV.el.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); dwClose(); });
  window.__dishRack = function (a) { if (dwS) dwS.rack = a.slice(); };   /* preview test hook */
  window.__dishSlip = function () { return dwS && (dwS.slipPos || [DW.cx, DW.cy]); };
  window.__dish = { open: dwOpen, foam: function () { return dwS && dwS.foam; }, rub: function (a, b) { dwRub(a, b); }, map: function () { var it = dwS.cur, N = DW.R * 2, o = []; for (var j = 0; j < it.dirt.length; j++) if (it.dirt[j] > 0) o.push([j % N - DW.R, Math.floor(j / N) - DW.R, it.dirt[j]]); return o; }, st: function () { return dwS && { rubS: !!dwS.rub, drag: !!dwS.drag, step: dwS.step, stack: dwS.stack.slice(), cur: dwS.cur && dwS.cur.k, rack: dwS.rack.slice(), wrong: dwS.wrong, left: dwS.cur ? dwLeft(dwS.cur) : 0, over: dwS.over }; } };
  var _mi_interrupt = interrupt; interrupt = function () { if (!window.__resume) { if (hbS) hClose(); if (dvS) dClose(); if (wkS) wkClose(); if (dwS) dwClose(); } return _mi_interrupt.apply(this, arguments); };
  window.__harbor = { open: hOpen, st: function () { return hbS && { lv: hbS.lv, moves: hbS.moves, won: hbS.won, p: hbS.p.map(function (p) { return [p.o, p.L, p.c, p.r]; }) }; }, move: function (i, n) { var p = hbS.p[i], rg = hRange(i); n = Math.max(rg[0], Math.min(rg[1], n)); if (n) { if (p.o === "h") p.c += n; else p.r += n; hbS.moves++; } if (i === 0 && p.c === 3) hbS.won = true; return n; } };
  window.__dive = { open: dOpen, st: function () { return dvS && { air: dvS.air, tr: dvS.tr, tiles: dvS.tiles, busy: dvS.busy, over: dvS.over }; }, dig: function (c, r) { return dDig(c, r); } };
  // in the preview: two buttons to try them
  (function () {
    var row = document.querySelector(".demo .row"); if (!row) return;
    [["Hafen-Rangieren testen", function () { hOpen(); }], ["Wrack erkunden testen", function () { wkOpen(); }], ["Abwasch testen", function () { dwOpen(); }]].forEach(function (b) {
      var el = document.createElement("button"); el.type = "button"; el.className = "btn"; el.textContent = b[0];
      el.addEventListener("click", function () { if (window.Nav && window.Nav.current !== "hamster" && window.Nav.go) window.Nav.go("hamster"); b[1](); window.scrollTo({ top: 0, behavior: "smooth" }); });
      row.insertBefore(el, row.firstChild);
    });
  })();
