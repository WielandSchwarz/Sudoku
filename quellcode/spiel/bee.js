  // ===================== beekeeping (preview): the hive replaces the deco spot, five calm steps, honey as food =====================
  var BK = /*BEEART*/;
  Object.keys(BK).forEach(function (k) { A[k] = BK[k].svg; SZ[k] = [BK[k].w, BK[k].h]; });
  var HIVE_H = 8;   // hours until the honey is ready again
  if (!garden.hive) garden.hive = { t: 0 };
  if (garden.harvest.honey == null) garden.harvest.honey = 0;
  GFOOD.honey = { food: 12, fun: 15, love: 8, say: "Honig aus dem eigenen Bienenstock!" }; GNAME.honey = "Honig"; FOOD.honey = "honey_s";
  // the deco spot belongs to the hive: no deco items in the catalog, no deco gifts
  var _bk_decoN = FURN.deco ? FURN.deco.length : 0; FURN.deco = []; TOTAL_ITEMS -= _bk_decoN;
  var _bk_gc = GARDEN_CATS.indexOf("deco"); if (_bk_gc >= 0) GARDEN_CATS.splice(_bk_gc, 1);
  if (home.pending && home.pending.cat === "deco") home.pending = null;
  var _bk_owned = ownedCount; ownedCount = function () { return _bk_owned() - ((home.owned.deco || []).length); };
  function hiveLeft() { return Math.max(0, HIVE_H - (Date.now() - (garden.hive.t || 0)) / 3600000); }
  function hiveReady() { return hiveLeft() <= 0; }
  var _bk_rgd = renderGardenDecor;
  renderGardenDecor = function () {
    _bk_rgd();
    var d = gEl("slot-deco");
    d.style.left = gx(GL.deco.x - 17); d.style.width = gx(34); d.style.bottom = gb(GL.deco.bottom);
    var h = snowySVG(A.bk_hive, 34, 26, "deco", 2);
    if (hiveReady()) [[2, 30, 0], [80, 10, .5], [88, 55, 1.1], [14, 70, 1.6], [50, -6, .8]].forEach(function (q) { h += '<i class="g2-spark" style="left:' + q[0] + '%;top:' + q[1] + '%;width:' + (7 / 34 * 100) + '%;animation-delay:' + q[2] + 's"></i>'; });
    h += '<i class="bk-fly a"></i><i class="bk-fly b"></i><i class="bk-fly c"></i><i class="bk-fly d"></i><i class="bk-fly e"></i>';
    d.innerHTML = h; d.classList.add("bk-hive"); d.setAttribute("aria-label", "Bienenstock");
  };
  setInterval(function () { if (place2 === "garden" && !decor) { var on = !!gEl("slot-deco").querySelector(".g2-spark"); if (on !== hiveReady()) renderGardenDecor(); } }, 30000);
  gEl("slot-deco").addEventListener("click", function (e) {
    if (decor || (garden.snowLv.deco || 0) > 0) return;
    e.stopPropagation();
    if (!hiveReady()) {
      var pr = 1 - hiveLeft() / HIVE_H;
      openPop('<p class="g2-name">' + svgOf(A.honey_s, 9, 11) + '<span>Honig</span></p><span class="g2-bar">' + pixBarSvg(pr, 50) + '</span><p class="g2-time">Noch ' + fmtH(hiveLeft()) + '</p>', GL.deco.x, GL.deco.bottom - 24, "g2-info");
      return;
    }
    if (s.asleep) { say(N() + " schläft gerade."); return; }
    if (busy && !interruptible()) return; if (busy) interrupt();
    act("bees", beeSeq);
  });
  // beekeeper outfit: worn automatically while working at the hive
  var beeSuit = false;
  var _bk_outfit = outfitPart;
  outfitPart = function (part) {
    if (!beeSuit) return _bk_outfit(part);
    if (part === "scarf") return A.bk_suit;
    if (part === "hat") return '<g opacity=".55">' + A.bk_veil + '</g>' + A.bk_hat + (holdBucket ? A.bk_bucket : "") + (dizzyEyes ? A.bk_spiral : "");
    if (part === "scarf_back") return A.bk_suit_back;
    if (part === "hat_back") return '<g opacity=".55">' + A.bk_veil_back + '</g>' + A.bk_hat_back;
    return "";
  };
  // ---- the close-ups follow the garden: season colours, time of day and weather ----
  var ENV = {
    spring: { "#4e8a3a": "#5a9a42", "#7cb84e": "#8cc858", "#a8d468": "#b8e07a", "#c8e88a": "#f8c8d8", "#b4dc78": "#c8e890", "#9fd7f6": "#bfe3f7", "#b2e0f8": "#e4f4fc", "#8cc458": "#9ad064" },
    autumn: { "#2a4e24": "#5a2e14", "#3a6e2e": "#8a4a1c", "#4e8a3a": "#c86a24", "#7cb84e": "#e8963a", "#a8d468": "#f6c45a", "#c8e88a": "#f6d27a",
      "#2e5e28": "#3e4a20", "#3e7a32": "#5a6a2a", "#5e9a42": "#8a8a3a", "#3e7c3c": "#5a6a2a", "#4e8a32": "#7a7a32", "#6aa83e": "#9a9a46", "#8cc458": "#b8b060", "#b4dc78": "#d8c87a", "#2f5a2c": "#4a4a22",
      "#5aa04e": "#9a9a46", "#8ccc72": "#c8b870", "#7fae8a": "#a8a080", "#6a9a7a": "#8e8a6a", "#95c09c": "#c0b896", "#f4a3b4": "#c86a24", "#6a8ae8": "#a85a1a", "#9fd7f6": "#b8d4e4", "#b2e0f8": "#efe8dc" },
    winter: { "#2a4e24": "#6e7e8a", "#3a6e2e": "#9aa8b4", "#4e8a3a": "#c8d2dc", "#7cb84e": "#e4ecf2", "#a8d468": "#ffffff", "#c8e88a": "#ffffff",
      "#2e5e28": "#4a5a52", "#3e7a32": "#6e7e74", "#5e9a42": "#c8d2dc", "#3e7c3c": "#b8c6d4", "#4e8a32": "#d0dae4", "#6aa83e": "#e4ecf2", "#8cc458": "#f2f6fa", "#b4dc78": "#ffffff", "#2f5a2c": "#9aaab8",
      "#5aa04e": "#e4ecf2", "#8ccc72": "#f2f6fa", "#7fae8a": "#c8d4dc", "#6a9a7a": "#b0bec8", "#95c09c": "#dde6ec", "#e8443a": "#ffffff", "#ffd34e": "#e4ecf2", "#6a8ae8": "#ffffff", "#f4a3b4": "#e4ecf2", "#9fd7f6": "#c8d8e6", "#b2e0f8": "#eef2f6" }
  };
  var WSKY = { clouds: { "#9fd7f6": "#b8c4cc", "#b2e0f8": "#cdd6dc", "#c8d8e6": "#b8c2ca", "#eef2f6": "#d4dade", "#bfe3f7": "#bcc8d0", "#e4f4fc": "#d0d8de", "#b8d4e4": "#bcc4c8", "#efe8dc": "#d8d4cc" } };
  WSKY.rain = WSKY.clouds; WSKY.storm = { "#9fd7f6": "#8a96a2", "#b2e0f8": "#9aa6b0", "#c8d8e6": "#8e98a2", "#eef2f6": "#a4acb4", "#bfe3f7": "#8e9aa4", "#e4f4fc": "#a0aab2", "#b8d4e4": "#8e98a0", "#efe8dc": "#a8a49c" }; WSKY.snow = WSKY.clouds;
  function curWeather() { return typeof weather !== "undefined" ? weather.type : "sun"; }
  function env(svg) {
    var m = ENV[season()] || {}, w = WSKY[curWeather()] || {};
    return svg.replace(/fill="(#[0-9a-fA-F]{6})"/g, function (all, c) { c = c.toLowerCase(); var c2 = m[c] || c; return 'fill="' + (w[c2] || c2) + '"'; });
  }
  function envOverlay() {
    var el = bp.querySelector(".bp-env"); if (!el) { el = document.createElement("div"); el.className = "bp-env"; bp.insertBefore(el, bp.querySelector(".bp-ban")); var h = ""; for (var i = 0; i < 60; i++) h += '<i style="left:' + (Math.random() * 125).toFixed(1) + '%;animation-delay:-' + (Math.random() * 5).toFixed(2) + 's"></i>'; el.innerHTML = h; }
    var w = curWeather(), ph = typeof daylight === "function" ? daylight() : "day";
    el.className = "bp-env w-" + w + " d-" + ph + (season() === "winter" && w === "storm" ? " no-flash" : "");
  }
  // ---- the close-up view ----
  var bp = xEl("div", "bee-pov", scene); bp.hidden = true;
  bp.innerHTML = '<svg class="bp-svg" viewBox="0 0 180 135" shape-rendering="crispEdges" aria-hidden="true"><g id="bp-base"></g><g id="bp-mid"></g><g id="bp-top"></g><g id="bp-fx"></g><g id="bp-hint"></g></svg>' +
    '<b class="bp-ban" id="bp-ban"></b><div class="bp-bar" id="bp-bar" hidden><i id="bp-barfill"></i></div><button type="button" class="bp-x" id="bp-x" aria-label="Imkern abbrechen">×</button>';
  var bpSvg = bp.querySelector(".bp-svg");
  function $b(id) { return document.getElementById(id); }
  function spr(k, x, y, attrs) { return '<g transform="translate(' + Math.round(x) + ' ' + Math.round(y) + ')"' + (attrs || "") + '>' + A[k] + '</g>'; }
  function bpPt(ev) { var r = bpSvg.getBoundingClientRect(); return { x: (ev.clientX - r.left) / r.width * 180, y: (ev.clientY - r.top) / r.height * 135 }; }
  function rectK(x, y, w, h, fill) { return '<rect x="' + (Math.round(x) - 1) + '" y="' + (Math.round(y) - 1) + '" width="' + (w + 2) + '" height="' + (h + 2) + '" fill="#3a2414"/><rect x="' + Math.round(x) + '" y="' + Math.round(y) + '" width="' + w + '" height="' + h + '" fill="' + fill + '"/>'; }
  var bpOpen = false, bpCancel = null;
  function hint(k, x, y, flip) { $b("bp-hint").innerHTML = '<g class="bp-arrow"><g transform="translate(' + Math.round(x) + ' ' + Math.round(y + (flip ? 8 : 0)) + ')' + (flip ? ' scale(1 -1)' : '') + '">' + A[k] + '</g></g>'; }
  function noHint() { $b("bp-hint").innerHTML = ""; }
  function clearHandlers() { bpSvg.onpointerdown = bpSvg.onpointermove = bpSvg.onpointerup = bpSvg.onpointercancel = null; }
  function banner(i, name) { curStep = i; var b = $b("bp-ban"); b.textContent = (i + 1) + " · " + name; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
  function frameLoop(fn) { var on = true, raf; (function lp(t) { if (!on) return; fn(t); raf = requestAnimationFrame(lp); })(performance.now()); return function () { on = false; cancelAnimationFrame(raf); }; }
  // 1 · smoke: tap a buzzing swarm; the bellows squeeze, a cloud drifts over; after two clouds the bees float down onto the hive and fall asleep
  function stepSmoke() {
    return new Promise(function (res) {
      banner(0, "Einräuchern"); $b("bp-base").innerHTML = env(A.bk_s1); $b("bp-top").innerHTML = ""; $b("bp-fx").innerHTML = ""; $b("bp-mid").innerHTML = "";
      var SPOUT = [128, 97], SM = [128, 94];
      var swarms = [[28, 76], [74, 44], [116, 70]].map(function (c, i) { return { x: c[0], y: c[1], calm: 0, asleep: false, bees: [0, 1, 2, 3].map(function (k) { return { ph: k * 1.6 + i, r: 6 + k * 2.2, sp: 1.4 + k * .25, st: "fly", x: c[0], y: c[1] }; }) }; });
      var SPOTS = [[52, 107], [60, 107], [68, 107], [76, 107], [84, 107], [42, 59], [52, 59], [62, 59], [72, 59], [82, 59], [92, 59], [100, 59]], spotI = 0;
      var puffs = [], hazes = [], zs = [], squeezeT = 0, lastTap = 0, fin = false, finT = 0, lastZ = 0;
      function active() { return swarms.filter(function (w) { return !w.asleep; }); }
      function aimHint() { var w = active()[0]; if (w) hint("bk_arrow", w.x - 3, w.y - 22); else noHint(); }
      aimHint();
      var stop = frameLoop(function (t) {
        var h = "", ts = t / 1000;
        hazes.forEach(function (z) { var k = (t - z.t0) / 1800; z.k = k; if (k < 1) h += '<g opacity="' + (0.75 * (1 - k)).toFixed(2) + '">' + spr("bk_cloud2", z.x - 11 + k * 6, z.y - 8 - k * 6) + '</g>'; });
        hazes = hazes.filter(function (z) { return z.k === undefined || z.k < 1; });
        puffs.forEach(function (p) {
          var k = Math.min(1, (t - p.t0) / 800), e = k * (2 - k);
          var x = SPOUT[0] + (p.tx - SPOUT[0]) * e, y = SPOUT[1] + (p.ty - SPOUT[1]) * e - Math.sin(k * Math.PI) * 14;
          h += k < .45 ? spr("bk_cloud1", x - 7, y - 5) : spr("bk_cloud2", x - 11, y - 8);
          if (k >= 1 && !p.done) { p.done = true; hazes.push({ x: p.tx, y: p.ty, t0: t }); if (p.sw) calmDown(p.sw, t); }
        });
        puffs = puffs.filter(function (p) { return !p.done; });
        swarms.forEach(function (w, wi) {
          w.bees.forEach(function (b, i) {
            if (b.st === "fly") {
              var slow = 1 - w.calm * .35, a = b.ph + ts * b.sp * slow;
              b.x = w.x + Math.cos(a) * b.r * 1.4 + Math.sin(ts * 5 + i) * 1.5 * slow; b.y = w.y + Math.sin(a * 1.3) * b.r * .7;
              var fl = Math.floor(t / (w.calm ? 120 : 70) + i) % 2;
              h += '<g transform="translate(' + Math.round(b.x - 4) + ' ' + Math.round(b.y - 4) + ')' + (Math.cos(a) < 0 ? ' scale(-1 1)' : '') + '">' + (fl ? A.bk_bee2 : A.bk_bee) + '</g>';
            } else if (b.st === "land") {
              var k = Math.min(1, (t - b.t0) / 900), e = k * k * (3 - 2 * k), x = b.fx + (b.sx - b.fx) * e, y = b.fy + (b.sy - b.fy) * e - Math.sin(k * Math.PI) * 6;
              h += spr(Math.floor(t / 140) % 2 ? "bk_bee2" : "bk_bee", x - 4, y - 4);
              if (k >= 1) { b.st = "sleep"; b.x = b.sx; b.y = b.sy; }
            } else {
              var breathe = Math.floor(ts * 1.4 + i + wi) % 2;
              h += spr("bk_beesit", b.x - 4, b.y - 2 + breathe);
            }
          });
        });
        [[96, 34, 40, 10, 0], [40, 48, 26, 12, 2.4], [140, 52, 22, 9, 4.1]].forEach(function (c, i) {      // a few bees stay awake and keep buzzing
          var x = c[0] + Math.sin(ts * .9 + c[4]) * c[2] + Math.sin(ts * 3.1 + i) * 2, y = c[1] + Math.sin(ts * 1.3 + c[4]) * c[3];
          h += '<g transform="translate(' + Math.round(x - 4) + ' ' + Math.round(y - 4) + ')' + (Math.cos(ts * .9 + c[4]) < 0 ? ' scale(-1 1)' : '') + '">' + (Math.floor(t / 70 + i) % 2 ? A.bk_bee2 : A.bk_bee) + '</g>';
        });
        var sleepers = []; swarms.forEach(function (w) { w.bees.forEach(function (b) { if (b.st === "sleep") sleepers.push(b); }); });
        if (sleepers.length && t - lastZ > 650) { lastZ = t; var sb = sleepers[Math.floor(Math.random() * sleepers.length)]; zs.push({ x: sb.x + 2, y: sb.y - 6, t0: t }); }
        zs.forEach(function (z) { var k = (t - z.t0) / 1400; z.k = k; if (k < 1) h += '<g opacity="' + (1 - k).toFixed(2) + '">' + spr("bk_zk", z.x + Math.sin(k * 6) * 2, z.y - k * 12) + '</g>'; });
        zs = zs.filter(function (z) { return z.k === undefined || z.k < 1; });
        if (fin) {                                                                            // everyone asleep: a lingering haze and a big Zzz over the entrance
          var fk = Math.min(1, (t - finT) / 600);
          h += '<g opacity="' + (.5 * fk).toFixed(2) + '">' + spr("bk_cloud2", 50, 96) + spr("bk_cloud2", 76, 92) + spr("bk_cloud1", 64, 86) + '</g>';
          [[0, 0], [8, -7], [17, -15]].forEach(function (q, i) { var bob = Math.round(Math.sin(ts * 2 + i) * 1.5); h += '<g transform="translate(' + (82 + q[0]) + ' ' + (84 + q[1] + bob) + ')">' + A.bk_zk + '</g>'; });
        }
        h += spr(t - squeezeT < 220 ? "bk_smoker2" : "bk_smoker", SM[0], SM[1]);
        $b("bp-fx").innerHTML = h;
      });
      function calmDown(w, t) {
        if (w.asleep) return; w.calm++; beep([[300 - w.calm * 40, .08]]);
        if (w.calm >= 2) {
          w.asleep = true;
          w.bees.forEach(function (b, i) { setTimeout(function () { var sp = SPOTS[spotI++ % SPOTS.length]; b.fx = b.x; b.fy = b.y; b.sx = sp[0]; b.sy = sp[1]; b.t0 = performance.now(); b.st = "land"; }, i * 220); });
          setTimeout(function () { beep([[392, .06], [330, .08]]); }, 900);
          if (!active().length) { noHint(); clearHandlers(); setTimeout(function () { fin = true; finT = performance.now(); beep([[262, .12], [220, .16]]); }, 1500); setTimeout(function () { stop(); res(); }, 3600); }
          else aimHint();
        }
      }
      bpSvg.onpointerdown = function (ev) {
        var now = performance.now(); if (now - lastTap < 260 || fin) return; lastTap = now;
        var p = bpPt(ev), best = null, bd = 1e9;
        active().forEach(function (w) { var d = Math.hypot(w.x - p.x, w.y - p.y); if (d < bd) { bd = d; best = w; } });
        var hit = best && bd < 30;
        puffs.push({ t0: now, tx: hit ? best.x : p.x, ty: hit ? best.y : p.y, sw: hit ? best : null });
        squeezeT = now; beep([[180, .05], [140, .06]]);
      };
      bpCancel = stop;
    });
  }
  // 2 · pull a frame: drag it up (or tap to lift it bit by bit)
  function stepFrame() {
    return new Promise(function (res) {
      banner(1, "Wabe rausziehen"); $b("bp-base").innerHTML = env(A.bk_s2); $b("bp-top").innerHTML = env(A.bk_s2front); $b("bp-fx").innerHTML = "";
      var y = 73, Y0 = 33, down = null, moved = false, fin = false;
      function draw() { $b("bp-mid").innerHTML = spr("bk_frame", 44, y); }
      draw(); hint("bk_arrow", 70, 50, true);
      function finish() { if (fin) return; fin = true; y = Y0; draw(); noHint(); clearHandlers(); beep([[660, .06], [880, .08]]); setTimeout(res, 700); }
      bpSvg.onpointerdown = function (ev) { down = { y: bpPt(ev).y, fy: y }; moved = false; try { bpSvg.setPointerCapture(ev.pointerId); } catch (e) {} };
      bpSvg.onpointermove = function (ev) { if (!down) return; var ny = Math.max(Y0, Math.min(73, down.fy + (bpPt(ev).y - down.y))); if (Math.abs(ny - y) > 0) { moved = true; y = Math.round(ny); draw(); } if (y <= Y0 + 4) finish(); };
      bpSvg.onpointerup = function () { if (down && !moved) { y = Math.max(Y0, y - 10); draw(); beep([[440, .03]]); if (y <= Y0 + 4) finish(); } down = null; };
      bpCancel = function () {};
    });
  }
  // 3 · uncap: wipe the fork over the comb in any direction; wax flakes peel off and honey starts to glisten and drip
  function stepUncap() {
    return new Promise(function (res) {
      banner(2, "Entdeckeln"); $b("bp-base").innerHTML = env(A.bk_s3); $b("bp-top").innerHTML = ""; $b("bp-fx").innerHTML = "";
      var X0 = 36, Y0 = 57, BW = 6, NC = 18, NR = 10, open = [], cnt = 0, fx0 = 90, fy0 = 82, down = false, fin = false, drips = [];
      for (var i = 0; i < NC * NR; i++) open.push(false);
      $b("bp-bar").hidden = false; setPixBar($b("bp-bar"), 0);
      function draw(t) {
        var clip = "";
        open.forEach(function (o, i) { if (o) clip += '<rect x="' + (X0 + (i % NC) * BW) + '" y="' + (Y0 + Math.floor(i / NC) * BW) + '" width="' + BW + '" height="' + BW + '"/>'; });
        var h = spr("bk_cap", 28, 52) + '<clipPath id="bp-clip">' + clip + '</clipPath><g clip-path="url(#bp-clip)">' + spr("bk_unc", 28, 52) + '</g>';
        open.forEach(function (o, i) { if (o && ((i * 7 + Math.floor(t / 300)) % 23 === 0)) h += '<rect x="' + (X0 + (i % NC) * BW + 2) + '" y="' + (Y0 + Math.floor(i / NC) * BW + 1) + '" width="1" height="1" fill="#fff3cc"/>'; });
        drips.forEach(function (d) { h += spr("bk_drop", d.x - 2, d.y); });
        h += spr("bk_fork", fx0 - 5, fy0 - 44);
        $b("bp-mid").innerHTML = h;
      }
      var stop = frameLoop(function (t) {
        drips.forEach(function (d) { d.y += d.v; d.v = Math.min(2.2, d.v + .05); });
        drips = drips.filter(function (d) { return d.y < 133; });
        if (cnt > 10 && Math.random() < .02 + cnt / NC / NR * .05) { var col = Math.floor(Math.random() * NC); if (open[(NR - 1) * NC + col]) drips.push({ x: X0 + col * BW + 3, y: 118, v: .2 }); }
        draw(t);
      });
      hint("bk_arrow", 86, 42);
      function flake(x, y) {
        var el = document.createElementNS("http://www.w3.org/2000/svg", "g"); el.setAttribute("class", "bp-flake");
        el.style.setProperty("--fx", ((Math.random() - .5) * 30).toFixed(0) + "px"); el.innerHTML = spr("bk_curl", x - 3, y - 2); $b("bp-fx").appendChild(el); setTimeout(function () { el.remove(); }, 1000);
      }
      function openAt(x, y) {
        var c = Math.floor((x - X0) / BW), r = Math.floor((y - Y0) / BW), got = 0;
        for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) {
          var cc = c + dc, rr = r + dr; if (cc < 0 || rr < 0 || cc >= NC || rr >= NR) continue;
          var k = rr * NC + cc; if (!open[k]) { open[k] = true; cnt++; got++; if (Math.random() < .35) flake(X0 + cc * BW + 3, Y0 + rr * BW + 3); }
        }
        if (got) { noHint(); if (Math.random() < .5) beep([[260 + cnt * 3, .02]]); setPixBar($b("bp-bar"), cnt / (NC * NR)); }
        if (cnt >= NC * NR * .92 && !fin) {
          fin = true; for (var k2 = 0; k2 < NC * NR; k2++) open[k2] = true; cnt = NC * NR; setPixBar($b("bp-bar"), 1); clearHandlers(); beep([[660, .06], [990, .08]]);
          setTimeout(function () { stop(); $b("bp-bar").hidden = true; res(); }, 1300);
        }
      }
      function at(ev) { var p = bpPt(ev); fx0 = Math.max(30, Math.min(150, p.x)); fy0 = Math.max(58, Math.min(122, p.y)); }
      bpSvg.onpointerdown = function (ev) { down = true; at(ev); openAt(fx0, fy0); try { bpSvg.setPointerCapture(ev.pointerId); } catch (e) {} };
      bpSvg.onpointermove = function (ev) { at(ev); if (down) openAt(fx0, fy0); };
      bpSvg.onpointerup = bpSvg.onpointercancel = function () { down = false; };
      bpCancel = function () { stop(); $b("bp-bar").hidden = true; };
    });
  }
  // 4 · catch: honey drips from the uncapped comb; move the bucket under the drops (slow drops, wide bucket, misses just splash)
  function stepCatch() {
    return new Promise(function (res) {
      banner(3, "Honig auffangen"); $b("bp-base").innerHTML = env(A.bk_s4c); $b("bp-top").innerHTML = ""; $b("bp-fx").innerHTML = "";
      var bx = 90, drops = [], splashes = [], caught = 0, NEED = 8, nextT = 0, fin = false, glints = [];
      $b("bp-bar").hidden = false; setPixBar($b("bp-bar"), 0);
      function draw(t) {
        var h = spr("bk_unc", 28, -26);
        drops.forEach(function (d) { h += spr("bk_drop", d.x - 2, d.y); });
        splashes.forEach(function (q) { h += spr("bk_splash", q.x - 5, 117, ' opacity="' + Math.max(0, 1 - q.a / 30).toFixed(2) + '"'); });
        h += spr("bk_pail_up", bx - 30, 74);
        glints.forEach(function (g) { h += '<rect x="' + Math.round(g.x) + '" y="' + Math.round(g.y) + '" width="1" height="1" fill="#fff3cc"/>'; });
        $b("bp-mid").innerHTML = h;
      }
      hint("bk_arrow", bx - 3, 60);
      var stop = frameLoop(function (t) {
        if (!fin && t > nextT && drops.length < 2) { nextT = t + 1300 + Math.random() * 600; var near = Math.random() < .5; drops.push({ x: Math.round(near ? Math.max(40, Math.min(140, bx + (Math.random() - .5) * 50)) : 40 + Math.random() * 100), y: 40, v: 0, hang: 45 }); }
        drops.forEach(function (d) {
          if (d.hang > 0) { d.hang--; return; }
          d.v = Math.min(.45, d.v + .008); d.y += d.v;
          if (!d.done && d.y >= 92 && d.y < 98 && Math.abs(d.x - bx) <= 13) {
            d.done = true; d.gone = true; caught++; beep([[620 + caught * 30, .04]]); setPixBar($b("bp-bar"), caught / NEED);
            for (var q = 0; q < 4; q++) glints.push({ x: d.x + (Math.random() - .5) * 8, y: 96, vy: -.6 - Math.random() * .6, life: 20 });
            if (caught >= NEED && !fin) { fin = true; noHint(); clearHandlers(); beep([[660, .06], [990, .1]]); setTimeout(function () { stop(); $b("bp-bar").hidden = true; res(); }, 900); }
          }
          if (!d.gone && d.y >= 114) { d.gone = true; splashes.push({ x: d.x, a: 0 }); }
        });
        drops = drops.filter(function (d) { return !d.gone; }); window.__beeDrops = drops;
        splashes.forEach(function (q) { q.a++; }); splashes = splashes.filter(function (q) { return q.a < 30; });
        glints.forEach(function (g) { g.y += g.vy; g.life--; }); glints = glints.filter(function (g) { return g.life > 0; });
        draw(t);
      });
      function at(ev) { bx = Math.round(Math.max(30, Math.min(150, bpPt(ev).x))); noHint(); }
      bpSvg.onpointerdown = function (ev) { at(ev); try { bpSvg.setPointerCapture(ev.pointerId); } catch (e) {} };
      bpSvg.onpointermove = function (ev) { if (ev.buttons || ev.pointerType === "touch") at(ev); };
      bpCancel = function () { stop(); $b("bp-bar").hidden = true; };
    });
  }
  // 4 · spin: back in the garden the hamster takes the honey bucket and, on a tap, whirls round so fast that he blurs; then he is dizzy for a moment
  var holdBucket = false, dizzyEyes = false;
  function stepSpin() {
    return new Promise(function (res) {
      banner(4, "Schleudern");
      bp.classList.add("bp-out"); $b("bp-base").innerHTML = ""; $b("bp-mid").innerHTML = ""; $b("bp-top").innerHTML = ""; $b("bp-fx").innerHTML = "";
      holdBucket = true; front({ paws: "hold", eyes: "happy", mouth: "smile" });
      hint("bk_arrow", H.x - 3, H.y - 58);
      var started = false, stopped = false;
      bpSvg.onpointerdown = function () {
        if (started) return; started = true; noHint(); clearHandlers();
        var t0 = performance.now(), k = 0, drops = 0, phase = 0;
        ham.classList.add("bk-spin"); beep([[300, .05], [420, .05], [560, .05]]);
        var iv = setInterval(function () {
          if (stopped) return clearInterval(iv);
          var el = performance.now() - t0; k++;
          if (el < 700) { if (k % 3 === 0) backFrame(0); else if (k % 3 === 1) front({ paws: "hold", eyes: "happy" }); }
          else { if (!phase) { phase = 1; ham.classList.remove("bk-spin"); } H.sprite = "whirl"; setSprite("back0", A["bk_tw" + (k % 8)]); }
          if (el > 600 && el < 2200 && drops < 14 && Math.random() < .5) { drops++; honeyDrop(); }
          if (Math.random() < .25) beep([[240 + Math.random() * 200, .02]]);
          if (el > 2500) { clearInterval(iv); dizzy(); }
        }, 60);
      };
      function honeyDrop() {
        var d = document.createElement("i"); d.className = "bk-drop"; var a = Math.random() * Math.PI * 2;
        d.style.left = gx(H.x); d.style.top = gy(H.y - 22); d.style.setProperty("--dx", (Math.cos(a) * 60).toFixed(0) + "px"); d.style.setProperty("--dy", (Math.sin(a) * 30 - 10).toFixed(0) + "px");
        scene.appendChild(d); setTimeout(function () { d.remove(); }, 700);
      }
      function dizzy() {
        holdBucket = false; dizzyEyes = true; front({ eyes: "open", mouth: "open", paws: "down" }); ham.classList.add("bk-dizzy");
        var st = document.createElement("div"); st.className = "bk-stars"; st.innerHTML = "<i></i><i></i><i></i>"; st.style.left = gx(H.x - 10); st.style.top = gy(H.y - 54); st.style.width = gx(20); scene.appendChild(st);
        beep([[500, .08], [420, .08], [350, .12]]);
        setTimeout(function () { dizzyEyes = false; ham.classList.remove("bk-dizzy"); st.remove(); front({ eyes: "happy", mouth: "smile", paws: "down" }); bp.classList.remove("bp-out"); stopped = true; res(); }, 1900);
      }
      bpCancel = function () { stopped = true; holdBucket = false; dizzyEyes = false; ham.classList.remove("bk-spin", "blur", "bk-dizzy"); bp.classList.remove("bp-out"); [].forEach.call(document.querySelectorAll(".bk-stars"), function (e) { e.remove(); }); };
    });
  }
  // 5 · spin: close-up at the hive; draw circles, the hamster turns the side wheel, honey runs into the bucket
  var BZ = /*BEEZOOM*/; Object.keys(BZ).forEach(function (k) { A[k] = BZ[k].svg; }); var BZM = BZ.bz_meta.meta;
  function px(x, y, w, h, c) { return '<rect x="' + Math.round(x) + '" y="' + Math.round(y) + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>'; }
  var RING = (function () { var o = ""; for (var dy = -7; dy <= 7; dy++) for (var dx = -7; dx <= 7; dx++) { var d = Math.sqrt(dx * dx + dy * dy); if (d <= 7.2) o += px(BZM.wheel[0] + dx, BZM.wheel[1] + dy, 1, 1, d > 6.2 ? "#3a2414" : d > 5 ? "#6e7480" : (dx < 0 && dy < 0 ? "#e8ebf0" : "#c8ccd4")); } return o; })();
  function stepCrank() {
    return new Promise(function (res) {
      banner(4, "Schleudern"); $b("bp-base").innerHTML = env(A.bz_bg); $b("bp-top").innerHTML = ""; $b("bp-fx").innerHTML = "";
      var W = BZM.wheel, ang = Math.PI * .1, tot = 0, NEED = 10 * Math.PI, last = null, fin = false, speed = 0, lastT = 0, moved = false, phase = 0, drips = [], sparks = [], landT = 0;
      function line(x0, y0, x1, y1, wd, c) { var o = "", n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0; for (var i = 0; i <= n; i++) { var t = n ? i / n : 0; o += px(x0 + (x1 - x0) * t - (wd >> 1), y0 + (y1 - y0) * t - (wd >> 1), wd, wd, c); } return o; }
      function draw(t) {
        var pr = Math.min(1, tot / NEED), h = "";
        var wx = BZM.win;                                                                    // honey whizzing past behind the window
        for (var y = wx[1] + 1; y < wx[3]; y++) for (var x = wx[0] + 1; x < wx[2]; x++) {
          var v = ((x * 3 + Math.floor(phase * 6) + y * 7) % 11 + 11) % 11;
          if ((y - wx[1]) % 4 < 2 && v < 6) h += px(x, y, 1, 1, v < 4 ? "#f0a51e" : "#c97a10"); else if (v === 0 && speed > .05) h += px(x, y, 1, 1, "#ffd25a");
        }
        if (pr > .2) for (var k = 0; k < Math.floor(pr * 8); k++) h += px(wx[0] + 2 + (k * 5) % 13, wx[1] + 2 + (k * 3) % 9, 1, 1, "#ffe9a0");
        h += px(wx[0] + 1, wx[1] + 1, 2, 3, "#eaf6fb");
        var fillH = Math.round(pr * 9);                                                      // the translucent bucket fills up
        if (fillH > 0) { var by = BZM.pail[1] + 15 - fillH; h += px(BZM.pail[0] + 3, by, 11, fillH, "#f6c56a") + px(BZM.pail[0] + 11, by, 2, fillH, "#e8a640") + px(BZM.pail[0] + 3, by, 11, 1, "#ffe9a0"); }
        if (!fin && speed > .12 && tot > 2 * Math.PI) h += px(BZM.tap[0], BZM.tap[1], 1, BZM.pail[1] + 15 - fillH - BZM.tap[1], "#f0a51e");
        drips.forEach(function (d) { h += px(d.x, d.y, 1, 2, "#f0a51e"); });
        var hamK, bob = 0;
        if (fin) { hamK = "bz_ham_cheer"; bob = Math.floor(t / 160) % 2 ? -4 : 0; }
        else if (speed > .45) { hamK = "bz_ham_cheer"; bob = Math.floor(t / 200) % 2 ? -2 : 0; }
        else if (speed > .08) { hamK = Math.floor(t / 320) % 2 ? "bz_ham_wave" : "bz_ham_idle"; }
        else hamK = "bz_ham_idle";
        h += spr(hamK, BZM.ham[0] + 6, BZM.ham[1] + bob);
        h += RING;                                                                           // wheel: spokes and handle follow the finger
        for (var q = 0; q < 3; q++) { var aa = ang + q * 2.094; h += line(W[0], W[1], W[0] + Math.cos(aa) * 4.6, W[1] + Math.sin(aa) * 4.6, 1, "#9aa0aa"); }
        h += px(W[0] - 1, W[1] - 1, 2, 2, "#6e7480");
        var hx = W[0] + Math.cos(ang) * 6, hy = W[1] + Math.sin(ang) * 6;
        h += px(hx - 2, hy - 3, 5, 6, "#3a2414") + px(hx - 1, hy - 2, 3, 4, "#a0603a") + px(hx - 1, hy - 2, 1, 3, "#bd8c58");
        sparks.forEach(function (sp) { var R = sp.l > 30 || sp.l < 8 ? 1 : sp.l > 24 || sp.l < 14 ? 2 : 3, X = Math.round(sp.x), Y = Math.round(sp.y); h += px(X - R, Y, 2 * R + 1, 1, "#ffd34a") + px(X, Y - R, 1, 2 * R + 1, "#ffd34a") + (R === 3 ? px(X - 1, Y - 1, 3, 3, "#ffd34a") + px(X - 1, Y, 3, 1, "#ffffff") + px(X, Y - 1, 1, 3, "#ffffff") : px(X, Y, 1, 1, "#ffffff")); });
        var ts = t / 1000;                                                                   // bees: two roam, one circles the bucket, one lands on the hive now and then
        [[60, 60, 30, 14, 0], [130, 40, 26, 12, 2]].forEach(function (c, i) { var x = c[0] + Math.sin(ts * 1.2 + c[4]) * c[2] + Math.sin(ts * 3.3 + i) * 3, y = c[1] + Math.sin(ts * 1.7 + c[4]) * c[3]; h += '<g transform="translate(' + Math.round(x) + ' ' + Math.round(y) + ')' + (Math.cos(ts * 1.2 + c[4]) < 0 ? ' scale(-1 1)' : '') + '">' + (Math.floor(t / 70 + i) % 2 ? A.bk_bee2 : A.bk_bee) + '</g>'; });
        var ba = ts * 1.6; h += '<g transform="translate(' + Math.round(BZM.pail[0] + 8 + Math.cos(ba) * 14) + ' ' + Math.round(BZM.pail[1] - 4 + Math.sin(ba) * 4) + ')' + (Math.sin(ba) > 0 ? ' scale(-1 1)' : '') + '">' + (Math.floor(t / 70) % 2 ? A.bk_bee2 : A.bk_bee) + '</g>';
        var lp = (t % 9000) / 9000, lx, ly;
        if (lp < .25) { lx = 60 - lp / .25 * 44; ly = 40 + lp / .25 * 26; } else if (lp < .7) { lx = 16; ly = 66; } else { var k2 = (lp - .7) / .3; lx = 16 - k2 * 30; ly = 66 - k2 * 40; }
        h += '<g transform="translate(' + Math.round(lx) + ' ' + Math.round(ly) + ')">' + (lp >= .25 && lp < .7 ? A.bk_bee : (Math.floor(t / 70) % 2 ? A.bk_bee2 : A.bk_bee)) + '</g>';
        if (!moved && !fin) { for (var g2 = 0; g2 < 16; g2++) { var ga = g2 * Math.PI / 8; h += px(W[0] + Math.cos(ga) * 11, W[1] + Math.sin(ga) * 11, 1, 1, "#ffffff"); } }
        $b("bp-mid").innerHTML = h;
        if (!moved && !fin) { var ha = t / 450; hint("bk_arrow", W[0] + Math.cos(ha) * 11 - 3, W[1] + Math.sin(ha) * 11 - 12); }
      }
      var stop = frameLoop(function (t) {
        var dt = lastT ? Math.min(.05, (t - lastT) / 1000) : 0; lastT = t;
        speed *= Math.pow(.15, dt); phase += speed * dt * 30;
        if (last === null && speed > .02 && !fin) { ang += speed * dt * 6; }
        if (!fin && tot > 2 * Math.PI && speed <= .12 && Math.random() < dt * 2) drips.push({ x: BZM.tap[0], y: BZM.tap[1] });
        drips.forEach(function (d) { d.y += dt * 40; }); drips = drips.filter(function (d) { return d.y < BZM.pail[1] + 6; });
        sparks.forEach(function (sp) { sp.l--; sp.y -= .3; }); sparks = sparks.filter(function (sp) { return sp.l > 0; });
        draw(t);
      });
      function more(da) {
        if (fin) return; ang += da; tot += Math.abs(da); speed = Math.min(1, speed + Math.abs(da) * .35);
        if (Math.random() < .2) beep([[150 + (tot % 6) * 25, .02]]);
        if (tot >= NEED) {
          fin = true; noHint(); clearHandlers(); beep([[660, .06], [880, .06], [1100, .1]]);
          for (var q = 0; q < 10; q++) sparks.push({ x: BZM.pail[0] + 2 + Math.random() * 14, y: BZM.pail[1] - 2 - Math.random() * 10, l: 20 + Math.random() * 20 });
          setTimeout(function () { stop(); res(); }, 1600);
        }
      }
      function angOf(ev) { var p = bpPt(ev); return Math.atan2(p.y - W[1], p.x - W[0]); }
      bpSvg.onpointerdown = function (ev) { last = angOf(ev); try { bpSvg.setPointerCapture(ev.pointerId); } catch (e) {} };
      bpSvg.onpointermove = function (ev) {
        if (last === null) return; var a2 = angOf(ev), da = a2 - last; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; last = a2;
        if (Math.abs(da) > .005) { if (!moved) { moved = true; noHint(); } more(da); }
      };
      bpSvg.onpointerup = bpSvg.onpointercancel = function () { last = null; };
      bpCancel = function () { stop(); };
    });
  }
  // 5 · bottle from the small bucket: hold, the bucket tips over the jar, honey runs in and stops by itself when the jar is full
  var LIPS = BK.bk_lip.lip;
  function stepFill() {
    return new Promise(function (res) {
      banner(5, "Abfüllen"); $b("bp-base").innerHTML = env(A.bk_s5b); $b("bp-top").innerHTML = ""; $b("bp-fx").innerHTML = "";
      var SHELF = [106, 128, 150], held = false, done = 0, lvl = 0, MAX = 17, pouring = false, busyJar = false, fin = false, lastT = 0, tilt = 0, flying = null;
      var OX = 58 - LIPS.t1[0], OY = 64 - LIPS.t1[1];
      function jarSvg(x, y, l, closed, lidDrop) {
        var h = spr("bk_jar", x, y);
        if (l > 0) h += '<rect x="' + (x + 2) + '" y="' + (y + 22 - l) + '" width="13" height="' + l + '" fill="#f0a51e"/><rect x="' + (x + 2) + '" y="' + (y + 22 - l) + '" width="13" height="1" fill="#ffd25a"/><rect x="' + (x + 12) + '" y="' + (y + 23 - l) + '" width="3" height="' + Math.max(0, l - 1) + '" fill="#c97a10"/>';
        if (closed) h += spr("bk_lid", x, y - 3 - (lidDrop || 0)) + spr("bk_label", x + 4, y + 10);
        return h;
      }
      var cur = { x: 50, y: 77 };
      function draw(t) {
        var h = "";
        for (var i = 0; i < done; i++) h += jarSvg(SHELF[i], 46, MAX, true);
        if (flying) h += jarSvg(flying.x, flying.y, MAX, true);
        h += jarSvg(cur.x, cur.y, Math.round(lvl), lvl >= MAX, cur.lid || 0);
        var pose = tilt < .5 ? "up" : ["t1", "t2", "t3"][Math.min(2, done)];
        h += spr("bk_pail_" + pose, OX, OY);
        if (pouring && lvl < MAX && pose !== "up") {
          var lx = OX + LIPS[pose][0], ly = OY + LIPS[pose][1], top = Math.round(cur.y + 22 - lvl), wob = Math.round(Math.sin(t / 60));
          if (top > ly) h += '<rect x="' + (lx - 1 + wob) + '" y="' + ly + '" width="2" height="' + (top - ly) + '" fill="#f0a51e"/><rect x="' + (lx + wob) + '" y="' + ly + '" width="1" height="' + (top - ly) + '" fill="#ffd25a"/>';
          h += '<rect x="' + (lx - 3) + '" y="' + (top - 1) + '" width="6" height="1" fill="#ffd25a"/>';
        }
        $b("bp-mid").innerHTML = h;
      }
      draw(0); hint("bk_arrow", 55, 34);
      var stop = frameLoop(function (t) {
        var dt = lastT ? (t - lastT) / 1000 : 0; lastT = t;
        tilt += ((held && !busyJar ? 1 : 0) - tilt) * Math.min(1, dt * 10);
        pouring = held && !busyJar && tilt > .8;
        if (pouring && lvl < MAX) { lvl = Math.min(MAX, lvl + dt * 8.5); if (Math.random() < .08) beep([[500 + lvl * 20, .02]]); if (lvl >= MAX) jarFull(); }
        draw(t);
      });
      function jarFull() {
        busyJar = true; pouring = false; beep([[784, .06], [988, .08]]);
        cur.lid = 8; var t0 = performance.now(), sx = cur.x, sy = cur.y, target = SHELF[done];
        var lidIv = setInterval(function () { cur.lid = Math.max(0, cur.lid - 2); if (!cur.lid) clearInterval(lidIv); }, 40);
        setTimeout(function () {
          flying = { x: sx, y: sy }; cur = { x: -40, y: 77 }; lvl = 0;
          var mv = setInterval(function () {
            var k = Math.min(1, (performance.now() - t0 - 450) / 650), e = k * k * (3 - 2 * k);
            flying.x = Math.round(sx + (target - sx) * e); flying.y = Math.round(sy + (46 - sy) * e - Math.sin(k * Math.PI) * 14);
            if (k >= 1) {
              clearInterval(mv); flying = null; done++; beep([[523 + done * 80, .05]]);
              if (done >= 3) { if (!fin) { fin = true; noHint(); clearHandlers(); setTimeout(function () { stop(); res(); }, 900); } return; }
              cur = { x: 50, y: 77 - 30 }; var dropIv = setInterval(function () { cur.y = Math.min(77, cur.y + 6); if (cur.y >= 77) { clearInterval(dropIv); busyJar = false; } }, 30);
            }
          }, 30);
        }, 450);
      }
      bpSvg.onpointerdown = function (ev) { held = true; noHint(); try { bpSvg.setPointerCapture(ev.pointerId); } catch (e) {} };
      bpSvg.onpointerup = bpSvg.onpointercancel = function () { held = false; };
      bpCancel = stop;
    });
  }
  // bees flying round in every close-up, with flapping wings
  var BEECFG = { 0: [], 1: [[73, 44, 34, 20, 4]], 2: [[120, 14, 30, 6, 2]], 3: [[90, 40, 60, 14, 2]], 4: [], 5: [[120, 36, 40, 14, 2], [60, 26, 24, 8, 1]] }, curStep = -1;
  function beeLayer() { var g = $b("bp-bees"); if (!g) { g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.id = "bp-bees"; $b("bp-hint").parentNode.insertBefore(g, $b("bp-hint")); } return g; }
  var beeStop = null;
  function startBees() {
    if (beeStop) return;
    beeStop = frameLoop(function (t) {
      var cfg = BEECFG[curStep] || [], h = "", ts = t / 1000;
      cfg.forEach(function (c, ci) {
        for (var i = 0; i < c[4]; i++) {
          var ph = i * 2.1 + ci * 5, x = c[0] + Math.sin(ts * (1.1 + i * .23) + ph) * c[2] + Math.sin(ts * 3.1 + ph) * 3, y = c[1] + Math.sin(ts * (1.7 + i * .19) + ph * 1.3) * c[3] + Math.cos(ts * 4 + ph) * 2;
          var dir = Math.cos(ts * (1.1 + i * .23) + ph) >= 0 ? 1 : -1, wing = Math.floor(t / 70 + i) % 2;
          h += '<g transform="translate(' + Math.round(x) + ' ' + Math.round(y) + ')' + (dir < 0 ? ' scale(-1 1)' : '') + '">' + (wing ? A.bk_bee2 : A.bk_bee) + '</g>';
        }
      });
      beeLayer().innerHTML = h;
    });
  }
  function stopBees() { if (beeStop) beeStop(); beeStop = null; var g = $b("bp-bees"); if (g) g.innerHTML = ""; }
  function beeGame() {
    return new Promise(function (resolve) {
      bp.hidden = false; bpOpen = true; var cancelled = false; envOverlay(); startBees();
      function end(v) { if (!bpOpen) return; bpOpen = false; stopBees(); clearHandlers(); if (bpCancel) bpCancel(); bpCancel = null; bp.hidden = true; $b("bp-bar").hidden = true; noHint(); resolve(v); }
      $b("bp-x").onclick = function () { cancelled = true; end(false); };
      beeGame.abort = function () { cancelled = true; end(false); };
      [stepSmoke, stepFrame, stepUncap, stepCatch, stepCrank, stepFill].reduce(function (p, fn) { return p.then(function () { if (!cancelled) return fn(); }); }, Promise.resolve()).then(function () { if (!cancelled) end(true); });
    });
  }
  async function beeSeq() {
    await walkTo(112, 102);
    beeSuit = true; fx("spark", 106, 64, "sparkle"); fx("spark", 118, 70, "sparkle");
    front({ eyes: "happy", mouth: "grin", paws: "up" }); pulse("hop", 420); say(N() + " zieht den Imkeranzug an."); await wait(1200);
    var ok = await beeGame();
    if (ok) {
      garden.harvest.honey = (garden.harvest.honey || 0) + 3; garden.hive.t = Date.now(); renderFoods(); renderGardenDecor();
      front({ eyes: "happy", mouth: "grin", paws: "up", blush: true });
      if (typeof itemPop === "function") itemPop({ art: '<svg viewBox="0 0 32 32" aria-hidden="true" shape-rendering="crispEdges">' + A.bk_bigjar + '</svg>', title: "Du hast 3 Gläser Honig abgefüllt!" });
      if (typeof SudokuSave === "function") SudokuSave();
      await wait(900);
    } else say("Imkern abgebrochen.");
    beeSuit = false; front({ paws: "down" });
  }
  var _bk_interrupt = interrupt;
  interrupt = function () { if (bpOpen && beeGame.abort) beeGame.abort(); if (beeSuit) { beeSuit = false; } return _bk_interrupt.apply(this, arguments); };
  if (typeof place2 !== "undefined" && place2 === "garden") renderGardenDecor();
  window.__bee = { envSvg: function (k) { return env(A[k]); }, env: function (se, w) { seasonOverride = se; if (typeof weather !== "undefined") weather.type = w; }, ready: function () { garden.hive.t = 0; renderGardenDecor(); }, state: function () { return { open: bpOpen, suit: beeSuit, honey: garden.harvest.honey, ban: $b("bp-ban").textContent }; } };
  // ---- gifts: honey can be given away too, and every visitor gives something back that you do not have right now ----
  var _bk_sg = simpleGifts;
  simpleGifts = function () { var a = _bk_sg(); if ((garden.harvest.honey || 0) > 0 && a.indexOf("honey") < 0) a.push("honey"); return a; };
  var _bk_gn = giftName;
  giftName = function (k) { return k === "honey" ? "Honig" : _bk_gn(k); };
  function returnGift(who) {
    var opts = [];
    Object.keys(CROPS).forEach(function (c) { if (!(garden.seeds[c] || 0) && seedRoom(c) && IBIG["seed_" + c]) opts.push({ kind: "seed", c: c, k: "seed_" + c, label: CROPS[c].name + "-Samen" }); });
    Object.keys(CROPS).concat(["nut"]).forEach(function (c) { var key = ibFor(c); if (!(garden.harvest[c] || 0) && key) opts.push({ kind: "harvest", c: c, k: key, label: "1 × " + (c === "nut" ? "Haselnuss" : CROPS[c].name) }); });
    if (!s.treats) opts.push({ kind: "apple", k: "apple", label: "einen Apfel" });
    var g = opts.length ? pick(opts) : { kind: "apple", k: "apple", label: "einen Apfel" };
    if (g.kind === "seed") garden.seeds[g.c] = (garden.seeds[g.c] || 0) + 1;
    else if (g.kind === "harvest") garden.harvest[g.c] = (garden.harvest[g.c] || 0) + 1;
    else s.treats++;
    renderFoods(); renderNeeds(); if (typeof renderStart === "function") renderStart();
    if (typeof itemPop === "function") itemPop({ k: g.k, title: who + " schenkt dir " + g.label + "!" });
    else say(who + " schenkt " + N() + " " + g.label + ".");
    if (typeof SudokuSave === "function") SudokuSave();
  }
  var _bk_ask = askGift;
  askGift = function (who, done) { return _bk_ask(who, function (k, nm) { done(k, nm); setTimeout(function () { returnGift(who); }, 1500); }); };
