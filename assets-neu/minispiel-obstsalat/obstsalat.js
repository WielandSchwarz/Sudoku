// ===================== Obstsalat (mini game, preview): fruit flies up out of the meadow, swipe to cut it,
// the pieces fill the salad bowl next to the hamster. Pine cones are not for cutting. Tap the hamster = done. =====================
// mountObstsalat(root, ART, opts) -> { setEnv({season, time, weather}), restart(), destroy() }
// root: an element with position:relative and aspect-ratio 4/3. ART: obstsalat_art.json.
function mountObstsalat(root, ART, opts) {
  opts = opts || {};
  var W = 180, H = 135, G = 150;                       // room pixels, gravity in px/s^2
  var GOAL = 40;                                        // bar units for a full bowl
  var INK = "#3a2414";

  // ---------- DOM: canvas, banner, close button, little popups
  root.classList.add("os-root");
  root.innerHTML = '<canvas class="os-cv" width="180" height="135"></canvas>' +
    '<b class="os-ban"></b><button type="button" class="os-x" aria-label="Obstsalat beenden">×</button>' +
    '<div class="os-pops"></div><div class="os-end" hidden><b class="os-end-t"></b></div>';
  var cv = root.querySelector(".os-cv"), cx = cv.getContext("2d");
  cx.imageSmoothingEnabled = false;
  var ban = root.querySelector(".os-ban"), pops = root.querySelector(".os-pops"), endEl = root.querySelector(".os-end"), endT = root.querySelector(".os-end-t");

  // ---------- images
  function img(src) { var i = new Image(); i.src = src; return i; }
  var BG = {}; Object.keys(ART.bg).forEach(function (k) { BG[k] = img(ART.bg[k]); });
  var HAM = {}; Object.keys(ART.ham).forEach(function (k) { HAM[k] = img(ART.ham[k]); });
  var BOWL = ART.bowl.map(function (b) { return { im: img(b.img), w: b.w, h: b.h }; });
  var BIG = { im: img(ART.bowl_big.img), w: ART.bowl_big.w, h: ART.bowl_big.h };
  var FR = {};
  Object.keys(ART.fruit).forEach(function (k) {
    var f = ART.fruit[k], o = { k: k, w: f.w, h: f.h, r: f.r, flesh: f.flesh, seed: f.seed, weights: f.weights, im: img(f.img), data: null };
    o.im.onload = function () { var c = document.createElement("canvas"); c.width = o.w; c.height = o.h; var g = c.getContext("2d"); g.drawImage(o.im, 0, 0); o.data = g.getImageData(0, 0, o.w, o.h); };
    FR[k] = o;
  });

  // ---------- environment
  var env = { season: opts.season || seasonNow(), time: opts.time || "auto", weather: opts.weather || "sonne" };
  function seasonNow() { var m = new Date().getMonth(); return m < 2 || m === 11 ? "winter" : m < 5 ? "fruehling" : m < 8 ? "sommer" : "herbst"; }
  function timeNow() { if (env.time !== "auto") return env.time; var h = new Date().getHours(); return h >= 21 || h < 6 ? "nacht" : h >= 18 ? "abend" : "tag"; }
  var STARS = []; for (var i = 0; i < 26; i++) STARS.push([Math.floor(Math.random() * 180), Math.floor(Math.random() * 58), Math.random() * 6]);
  var FLIES = []; for (i = 0; i < 9; i++) FLIES.push({ x: 20 + Math.random() * 150, y: 92 + Math.random() * 30, p: Math.random() * 6 });
  var WX = []; for (i = 0; i < 70; i++) WX.push({ x: Math.random() * 200, y: Math.random() * 135, s: .6 + Math.random() * .6 });
  var CLOUDS = [{ x: 20, y: 30, w: 30 }, { x: 110, y: 40, w: 38 }, { x: 70, y: 52, w: 24 }];

  // ---------- game state
  var S;
  function reset() {
    S = { items: [], halves: [], drops: [], trail: [], fill: 0, shown: 0, spawnT: .9, t: 0, done: false, endT: 0, face: "normal", faceT: 0, hop: 0, shake: 0, barFlash: 0,
      blinkT: 2 + Math.random() * 3, stroke: null, strokeHits: 0, strokeT: 0, cuts: 0 };
    endEl.hidden = true; pops.innerHTML = "";
    ban.textContent = "Obstsalat"; ban.classList.remove("pop", "away"); void ban.offsetWidth; ban.classList.add("pop");
    setTimeout(function () { ban.classList.add("away"); }, 2200);
  }

  function pick() {
    var r = Math.random(), lvl = Math.min(1, S.fill / GOAL);
    if (S.t > 4 && r < .1 + lvl * .1) return "zapfen";
    if (r > .965) return "goldapfel";
    var keys = [], tot = 0;
    Object.keys(FR).forEach(function (k) { var w = (FR[k].weights || {})[env.season] || 0; if (w) { keys.push([k, w]); tot += w; } });
    var x = Math.random() * tot;
    for (var i = 0; i < keys.length; i++) { x -= keys[i][1]; if (x <= 0) return keys[i][0]; }
    return keys[0][0];
  }
  function launch() {
    var k = pick(), f = FR[k];
    var x = 30 + Math.random() * 110;
    var vx = (90 - x) / 100 * (25 + Math.random() * 20) + (Math.random() - .5) * 14;
    var vy = -(152 + Math.random() * 30);
    S.items.push({ k: k, x: x, y: H + f.h, vx: vx, vy: vy, cut: false });
  }

  // ---------- slicing
  function hash(x, y) { return ((x * 73856093) ^ (y * 19349663)) >>> 0; }
  function sliceItem(it, dx, dy) {
    var f = FR[it.k]; if (!f.data) return;
    var l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    var halves = [document.createElement("canvas"), document.createElement("canvas")];
    var ctxs = halves.map(function (c) { c.width = f.w; c.height = f.h; return c.getContext("2d"); });
    var ids = ctxs.map(function (g) { return g.createImageData(f.w, f.h); });
    var src = f.data.data, flesh = hexRgb(f.flesh), seed = hexRgb(f.seed), ink = hexRgb(INK);
    for (var y = 0; y < f.h; y++) for (var x = 0; x < f.w; x++) {
      var o = (y * f.w + x) * 4; if (!src[o + 3]) continue;
      var s = (x + .5 - f.w / 2) * nx + (y + .5 - f.h / 2) * ny, side = s < 0 ? 0 : 1, d = Math.abs(s);
      var c = [src[o], src[o + 1], src[o + 2]];
      if (d < .9) c = ink;                                                // new outline along the cut
      else if (d < 2.8 && !(src[o] === ink[0] && src[o + 1] === ink[1] && src[o + 2] === ink[2])) c = hash(x, y) % 7 === 0 && d > 1.6 ? seed : flesh;
      var D = ids[side].data; D[o] = c[0]; D[o + 1] = c[1]; D[o + 2] = c[2]; D[o + 3] = 255;
    }
    ctxs.forEach(function (g, i) { g.putImageData(ids[i], 0, 0); });
    var push = 26;
    S.halves.push({ c: halves[0], x: it.x, y: it.y, vx: it.vx * .6 - nx * push, vy: it.vy * .3 - ny * push - 20, w: f.w, h: f.h });
    S.halves.push({ c: halves[1], x: it.x, y: it.y, vx: it.vx * .6 + nx * push, vy: it.vy * .3 + ny * push - 20, w: f.w, h: f.h });
    var skin = sampleSkin(f);
    for (var k = 0; k < 10; k++) {
      var a = Math.random() * Math.PI * 2, sp = 30 + Math.random() * 45;
      S.drops.push({ x: it.x, y: it.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 25, c: k % 3 ? f.flesh : skin, life: .5 + Math.random() * .4 });
    }
  }
  function sampleSkin(f) { var d = f.data.data, o = ((f.h >> 1) * f.w + (f.w >> 1)) * 4; return "rgb(" + d[o] + "," + d[o + 1] + "," + d[o + 2] + ")"; }
  function hexRgb(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }

  function segDist(px, py, ax, ay, bx, by) {
    var vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy, t = l2 ? Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / l2)) : 0;
    return Math.hypot(px - (ax + vx * t), py - (ay + vy * t));
  }
  function cutAlong(ax, ay, bx, by) {
    if (S.done) return;
    var len = Math.hypot(bx - ax, by - ay); if (len < 1.2) return;
    S.items.forEach(function (it) {
      if (it.cut) return;
      var f = FR[it.k];
      if (segDist(it.x, it.y, ax, ay, bx, by) <= f.r + 1) {
        it.cut = true; sliceItem(it, bx - ax, by - ay);
        if (it.k === "zapfen") {
          S.fill = Math.max(0, S.fill - 4); S.face = "schreck"; S.faceT = .9; S.shake = .3; S.barFlash = .5;
        } else {
          S.fill += it.k === "goldapfel" ? 4 : 1; S.strokeHits++; S.cuts++;
          if (it.k === "goldapfel") { S.face = "froh"; S.faceT = .9; S.hop = .3; popText("+4", it.x, it.y); }
        }
      }
    });
  }

  // ---------- input: swipe to cut, tap the hamster to finish
  var HB = { x: 128, y: 91, w: 48, h: 46 };
  function pt(ev) { var r = cv.getBoundingClientRect(); return { x: (ev.clientX - r.left) / r.width * W, y: (ev.clientY - r.top) / r.height * H }; }
  var down = null;
  cv.addEventListener("pointerdown", function (ev) {
    if (S.done) { if (S.endT > 1.2) reset(); return; }
    var p = pt(ev); down = { x: p.x, y: p.y, t: performance.now(), moved: 0 }; S.stroke = p; S.strokeHits = 0;
    cv.setPointerCapture(ev.pointerId); S.trail.push({ x: p.x, y: p.y, t: S.t });
  });
  cv.addEventListener("pointermove", function (ev) {
    if (!down || !S.stroke) return;
    var p = pt(ev), q = S.stroke;
    down.moved += Math.hypot(p.x - q.x, p.y - q.y);
    cutAlong(q.x, q.y, p.x, p.y);
    S.stroke = p; S.trail.push({ x: p.x, y: p.y, t: S.t });
  });
  function up(ev) {
    if (!down) return;
    var p = pt(ev);
    if (down.moved < 3 && p.x >= HB.x && p.x < HB.x + HB.w && p.y >= HB.y + 4 && p.y < HB.y + HB.h) finish();
    if (S.strokeHits >= 3) {
      var bonus = S.strokeHits - 1; S.fill += bonus; S.face = "froh"; S.faceT = 1; S.hop = .35;
      popText("+" + bonus, p.x, p.y);
    }
    down = null; S.stroke = null; S.strokeHits = 0;
  }
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  root.querySelector(".os-x").addEventListener("click", function () { if (opts.onClose) opts.onClose(); else reset(); });

  function popText(t, x, y) {
    var e = document.createElement("b"); e.className = "os-pop"; e.textContent = t;
    e.style.left = (x / W * 100) + "%"; e.style.top = (y / H * 100) + "%";
    pops.appendChild(e); setTimeout(function () { e.remove(); }, 900);
  }
  function finish() {
    if (S.done) return;
    S.done = true; S.endT = 0;
  }

  // ---------- drawing helpers (always on whole room pixels)
  function px(x, y, c) { cx.fillStyle = c; cx.fillRect(Math.round(x), Math.round(y), 1, 1); }
  function line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy;
    cx.fillStyle = c;
    for (var n = 0; n < 400; n++) { cx.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; var e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  function sprite(im, x, y) { cx.drawImage(im, Math.round(x), Math.round(y)); }

  function drawBar() {
    var x = 3, y = 12, w = 9, h = 110;
    cx.fillStyle = INK; cx.fillRect(x - 1, y - 1, w + 2, h + 2);
    cx.fillStyle = "#9a6634"; cx.fillRect(x, y, w, h);                      // wooden frame
    cx.fillStyle = "#ba844a"; cx.fillRect(x, y, 1, h); cx.fillRect(x, y, w, 1);
    cx.fillStyle = "#764a22"; cx.fillRect(x + w - 1, y, 1, h); cx.fillRect(x, y + h - 1, w, 1);
    var ix = x + 2, iy = y + 2, iw = w - 4, ih = h - 4;
    cx.fillStyle = INK; cx.fillRect(ix, iy, iw, ih);
    cx.fillStyle = "#4e3018"; cx.fillRect(ix + 1, iy + 1, iw - 2, ih - 2);
    var gold = Math.round(ih * .15);                                          // golden optimum at the top
    cx.fillStyle = "#c89a3a"; cx.fillRect(ix + 1, iy + 1, iw - 2, gold);
    var fh = Math.round((ih - 2) * Math.min(1, S.shown / GOAL));
    if (fh > 0) {
      var full = S.shown >= GOAL * .85;
      cx.fillStyle = S.barFlash > 0 && Math.floor(S.barFlash * 10) % 2 ? "#f08a7e" : full ? "#f0c040" : "#e8763a";
      cx.fillRect(ix + 1, iy + ih - 1 - fh, iw - 2, fh);
      cx.fillStyle = full ? "#f8de78" : "#f8a060"; cx.fillRect(ix + 1, iy + ih - 1 - fh, 1, fh);
    }
    for (var k = 0; k < 3; k++) {                                             // nails
      var ny = [y + 3, y + (h >> 1), y + h - 4][k];
      px(x + 1, ny, "#d4c8b2"); px(x + w - 2, ny, "#d4c8b2"); px(x + 1, ny + 1, "#7a7066"); px(x + w - 2, ny + 1, "#7a7066");
    }
  }

  function drawEnvBack(tm) {
    if (tm === "nacht") {
      STARS.forEach(function (s) { if (Math.sin(S.t * 2 + s[2]) > -.4) px(s[0], s[1], "#fff8d8"); });
    }
    if (env.weather === "wolken" || env.weather === "regen") {
      CLOUDS.forEach(function (c, i) {
        var x = ((c.x + S.t * (3 + i)) % 230) - 40;
        cx.fillStyle = env.weather === "regen" ? "#c8ccd4" : "#f4f6f8";
        for (var y = 0; y < 5; y++) { var half = Math.round(c.w / 2 * Math.sqrt(1 - Math.pow((y - 2) / 2.8, 2))); cx.fillRect(Math.round(x + c.w / 2 - half), c.y - 10 + y, half * 2, 1); }
      });
    }
  }
  function drawTint(tm) {
    var col = null;
    if (tm === "abend") col = "#ffd2a8"; else if (tm === "nacht") col = "#6070a8";
    if (env.weather === "regen") col = col ? col : "#c8ced8"; else if (env.weather === "wolken" && !col) col = "#e8ecf0";
    if (env.season === "winter" && env.weather === "schnee" && !col) col = "#eef2f8";
    if (!col) return;
    cx.globalCompositeOperation = "multiply"; cx.fillStyle = col; cx.fillRect(0, 0, W, H); cx.globalCompositeOperation = "source-over";
  }
  function drawEnvFront(tm, dt) {
    if (tm === "nacht" && env.season !== "winter") FLIES.forEach(function (f) {
      var x = f.x + Math.sin(S.t * .7 + f.p) * 8, y = f.y + Math.sin(S.t * 1.3 + f.p * 2) * 4;
      if (Math.sin(S.t * 3 + f.p) > 0) px(x, y, "#e8f890");
    });
    if (env.weather === "regen") WX.forEach(function (d) {
      d.y += 150 * d.s * dt; d.x -= 30 * d.s * dt; if (d.y > H) { d.y = -4; d.x = Math.random() * 200; }
      px(d.x, d.y, "#a8c4e0"); px(d.x - .2, d.y + 1, "#a8c4e0");
    });
    if (env.weather === "schnee") WX.forEach(function (d) {
      d.y += 18 * d.s * dt; d.x += Math.sin(S.t + d.s * 9) * 6 * dt; if (d.y > H) { d.y = -2; d.x = Math.random() * 180; }
      px(d.x, d.y, "#ffffff");
    });
  }

  // ---------- main loop
  var last = performance.now(), raf = 0;
  function frame(now) {
    var dt = Math.min(.05, (now - last) / 1000); last = now; S.t += dt;
    var tm = timeNow();
    // spawn waves: faster as the bowl fills
    if (!S.done) {
      S.spawnT -= dt;
      if (S.spawnT <= 0) {
        var lvl = Math.min(1, S.fill / GOAL), n = 1 + (Math.random() < .25 + lvl * .4 ? 1 : 0) + (Math.random() < lvl * .3 ? 1 : 0);
        for (var i = 0; i < n; i++) setTimeout(launch, i * 140);
        S.spawnT = 1.25 - lvl * .45 + Math.random() * .3;
      }
      if (S.fill >= GOAL) finish();
    } else S.endT += dt;
    S.items.forEach(function (it) { it.vy += G * dt; it.x += it.vx * dt; it.y += it.vy * dt; });
    S.items = S.items.filter(function (it) { return !it.cut && it.y < H + 24; });
    S.halves.forEach(function (h) { h.vy += G * dt; h.x += h.vx * dt; h.y += h.vy * dt; });
    S.halves = S.halves.filter(function (h) { return h.y < H + 24; });
    S.drops.forEach(function (d) { d.vy += G * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life -= dt; });
    S.drops = S.drops.filter(function (d) { return d.life > 0; });
    S.trail = S.trail.filter(function (p) { return S.t - p.t < .14; });
    S.shown += (S.fill - S.shown) * Math.min(1, dt * 8);
    S.faceT -= dt; S.hop -= dt; S.shake -= dt; S.barFlash -= dt; S.blinkT -= dt;
    if (S.faceT <= 0) S.face = "normal";
    if (S.blinkT < -.12) S.blinkT = 2.5 + Math.random() * 3;

    var ox = S.shake > 0 ? (Math.floor(S.t * 40) % 2 ? 1 : -1) : 0;
    cx.setTransform(1, 0, 0, 1, ox, 0);
    var bg = BG[env.season]; if (bg.complete) cx.drawImage(bg, 0, 0);
    drawEnvBack(tm);
    // the hamster and his bowl sit in the front right
    var hop = S.hop > 0 ? -2 : 0, face = S.face === "normal" && S.blinkT < 0 ? "blinzeln" : S.face;
    if (HAM[face].complete) sprite(HAM[face], HB.x, HB.y + hop);
    cx.fillStyle = "rgba(43,29,18,.16)"; cx.fillRect(104, 131, 40, 2);
    var lv = S.shown < GOAL * .08 ? 0 : S.shown < GOAL * .4 ? 1 : S.shown < GOAL * .75 ? 2 : 3, b = BOWL[lv];
    if (b.im.complete) sprite(b.im, 107, 133 - b.h);
    // flying things
    S.items.forEach(function (it) { var f = FR[it.k]; if (f.im.complete) sprite(f.im, it.x - f.w / 2, it.y - f.h / 2); });
    S.halves.forEach(function (h) { sprite(h.c, h.x - h.w / 2, h.y - h.h / 2); });
    S.drops.forEach(function (d) { px(d.x, d.y, d.c); });
    // the cut: a short bright line along the swipe
    for (i = 1; i < S.trail.length; i++) {
      var a = S.trail[i - 1], q = S.trail[i], age = S.t - q.t;
      cx.globalAlpha = Math.max(0, 1 - age / .14);
      line(a.x, a.y, q.x, q.y, "#fff8ec");
      cx.globalAlpha = 1;
    }
    drawTint(tm);
    drawEnvFront(tm, dt);
    drawBar();
    cx.setTransform(1, 0, 0, 1, 0, 0);
    // result: dim the scene, the big bowl in the middle, one big title
    if (S.done && S.endT > .6) {
      var k2 = Math.min(1, (S.endT - .6) / .3);
      cx.fillStyle = "rgba(43,29,18," + (.45 * k2).toFixed(2) + ")"; cx.fillRect(0, 0, W, H);
      if (BIG.im.complete) sprite(BIG.im, (W - BIG.w) / 2, 58 - BIG.h / 2 + Math.round((1 - k2) * 10));
      if (endEl.hidden) { endT.textContent = S.fill >= GOAL ? "Obstsalat!" : S.fill >= GOAL / 2 ? "Kleiner Obstsalat" : "Ein paar Stückchen"; endEl.hidden = false; }
    }
    raf = requestAnimationFrame(frame);
  }
  reset();
  raf = requestAnimationFrame(frame);

  return {
    state: function () { return S; },
    setEnv: function (e) { Object.keys(e).forEach(function (k) { env[k] = e[k]; }); },
    restart: reset,
    destroy: function () { cancelAnimationFrame(raf); root.innerHTML = ""; }
  };
}
