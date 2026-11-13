  // ===================== the café in the hill (preview, step 1: the place itself) =====================
  // a wide room (two screens) that scrolls sideways; season, weather and time of day show in the windows and in the light
  var CF = /*CAFEART*/;
  if (typeof NAMES === "object") NAMES.cafe = "Café";
  var cafeOn = false, cafeDone = null;
  var cafeEl = xEl("div", "cafe-pov", scene); cafeEl.hidden = true;
  cafeEl.innerHTML = '<div class="cf-scroll"><div class="cf-track"></div></div>';
  var cfScroll = cafeEl.querySelector(".cf-scroll"), cfTrack = cafeEl.querySelector(".cf-track");
  ["click", "pointerdown"].forEach(function (t) { cafeEl.addEventListener(t, function (e) { e.stopPropagation(); }); });
  function cfGlow(cx, cy, r, col, a, rings) {
    var o = "";
    for (var k = 0; k < rings; k++) {
      var rr = r * (1 - k / rings);
      for (var y = Math.floor(cy - rr); y <= Math.ceil(cy + rr); y++) { var h = rr * rr - (y + .5 - cy) * (y + .5 - cy); if (h <= 0) continue; var w = Math.floor(Math.sqrt(h)); o += '<rect x="' + Math.floor(cx - w) + '" y="' + y + '" width="' + (2 * w + 1) + '" height="1" fill="' + col + '" opacity="' + a + '"/>'; }
    }
    return o;
  }
  // a chef's hat in the café (three to choose from, preview)
  var CF_HATS = /*HATS*/, CF_HAT = "3";
  // ---- café themes: the whole room (walls, posts, counter, fireplace, oven, door, windows, decoration) and the close-ups change together
  var CF_THEMES = /*CFTHEMES*/, CF_DEF = null, CF_THEME_NOW = "wood", TIMG_DEF = {};
  function cfTheme() { var t = cfL().theme; return t && CF_THEMES[t] && CF_THEMES[t].bg ? t : "wood"; }
  function cfApplyTheme() {
    if (!CF_DEF) CF_DEF = { bg: CF.bg, ob: CF.ob, cf: CF.cf, wins: CF.wins };
    var t = cfTheme(), T = CF_THEMES[t], src = t === "wood" ? CF_DEF : T;
    var fl = t !== "wood" && T.floors ? (T.floors[cfL().floor] || T.floors[T.floor0]) : null;
    CF.bg = src.bg + (fl ? fl.svg : ""); CF.ob = src.ob; CF.cf = src.cf; CF.wins = src.wins; CF_THEME_NOW = t;
    if (typeof TIMG === "object") ["bg_counter", "bg_shelf", "bg_hearth"].forEach(function (k) {
      if (!(k in TIMG_DEF)) TIMG_DEF[k] = TIMG[k];
      var u = t !== "wood" && T.imgs && T.imgs[k];
      if (u) { var key = "th_" + t + "_" + k; if (!TIMG[key]) { var im = new Image(); im.src = u; TIMG[key] = im; } TIMG[k] = TIMG[key]; } else TIMG[k] = TIMG_DEF[k];
    });
  }
  // the café is furnished in a panel below the scene, like the rooms in the house
  var cfCat = document.createElement("div"); cfCat.className = "gift-ask pixtext gq-pop cf-cat"; cfCat.hidden = true;
  (function () { var db = document.getElementById("decor-btn"); if (db) db.insertAdjacentElement("afterend", cfCat); })();
  function cfCatClose() { cfCat.hidden = true; cfCat.innerHTML = ""; var db = document.getElementById("decor-btn"); db.setAttribute("aria-pressed", "false"); if (cafeOn) db.textContent = "Café einrichten"; }
  function cfPanel(html, onClick) {
    cfCat.innerHTML = '<div class="ga-card">' + html.replace('<div class="ga-row"><button type="button" class="ga-no" data-k="close">Fertig</button></div>', "") + '</div>'; cfCat.hidden = false;
    var db = document.getElementById("decor-btn"); db.textContent = "Fertig eingerichtet"; db.setAttribute("aria-pressed", "true");
    cfCat.onclick = function (e) { var b = e.target.closest("button"); if (b) onClick(b, { remove: cfCatClose }); };
    return cfCat;
  }
  function cfThemeAsk() {
    var cur = cfTheme(), keys = Object.keys(CF_THEMES);
    var tiles = keys.map(function (k) { return '<button type="button" data-t="' + k + '" class="gq-tile' + (k === cur ? " gq-sel" : "") + '"><img src="' + CF_THEMES[k].thumb + '" width="96" height="72" style="image-rendering:pixelated;width:96px;height:72px" alt=""><span>' + CF_THEMES[k].name + '</span></button>'; }).join("");
    var T = CF_THEMES[cur], fsel = T.floors ? (T.floors[cfL().floor] ? cfL().floor : T.floor0) : null;
    var floors = T.floors ? '<p class="ga-h">Boden</p><div class="ga-grid gq-grid" style="flex:none;overflow:visible">' + Object.keys(T.floors).map(function (k) { return '<button type="button" data-f="' + k + '" class="gq-tile' + (k === fsel ? " gq-sel" : "") + '"><img src="' + T.floors[k].thumb + '" width="64" height="40" style="image-rendering:pixelated;width:64px;height:40px" alt=""><span>' + T.floors[k].name + '</span></button>'; }).join("") + '</div>' : "";
    var psel = Object.keys(CF_PLANTS).length ? cfPlantSel() : null;
    var plants = psel ? '<p class="ga-h">Pflanzen</p><div class="ga-grid gq-grid cf-pgrid" style="flex:none;overflow:visible">' + psel.map(function (k, i) { return '<button type="button" data-s="' + i + '" class="gq-tile">' + cfPlantPic(k, 2) + '<span>Platz ' + (i + 1) + '</span></button>'; }).join("") + '</div>' : "";
    cfPanel('<p class="ga-h">Café einrichten</p><div class="ga-grid gq-grid" style="flex:none;overflow:visible">' + tiles + '</div>' + floors + plants + '<div class="ga-row"><button type="button" class="ga-no" data-k="close">Fertig</button></div>', function (b, el) {
      if (b.dataset.s != null) { cfPlantAsk(+b.dataset.s); return; }
      if (b.dataset.f) {
        if (b.dataset.f !== cfL().floor) { cfL().floor = b.dataset.f; if (window.SudokuSave) window.SudokuSave(); cfRebuild(); beep([[659, .05], [784, .06]]); }
        cfThemeAsk(); return;
      }
      if (b.dataset.t) {
        if (b.dataset.t !== cfTheme()) { cfL().theme = b.dataset.t; if (window.SudokuSave) window.SudokuSave(); cfRebuild(); beep([[659, .05], [784, .05], [988, .08]]); cfHamSet({ paws: "up", eyes: "happy", mouth: "grin" }); setTimeout(function () { cfHamSet({}); }, 900); }
        cfThemeAsk(); return;
      }
      el.remove();
    });
  }
  // rebuild the room in place: the guests and the hamster stay where they are
  function cfRebuild() {
    var sl = cfScroll.scrollLeft; cfBuild(); cfKey = ""; cfRender(); cfScroll.scrollLeft = sl;
    if (typeof gReattach === "function") gReattach();
  }
  document.addEventListener("click", function (e) {
    if (!cafeOn || cfGameOn) return; var b = e.target.closest && e.target.closest("#decor-btn"); if (!b) return;
    e.stopImmediatePropagation(); e.preventDefault(); if (!cfCat.hidden) cfCatClose(); else cfThemeAsk();
  }, true);
  var _cf_decorLabel = decorLabel;
  decorLabel = function () { if (cafeOn) { document.getElementById("decor-btn").textContent = "Café einrichten"; return; } _cf_decorLabel(); };
  // ---- café plants: three places on the floor, any plant from the collection in each, chosen per theme like in the living room
  var CF_PLANTS = /*CFPLANTS*/, CF_PSLOT = [[58, 104], [114, 104], [377, 104]], CF_PDEF = { wood: ["monstera", "sunflower", "lavender"], firstclass: ["fern", "fiddle", null] };
  function cfPlantSel() { var C_ = cfL(); C_.plants = C_.plants || {}; if (!C_.plants[CF_THEME_NOW]) C_.plants[CF_THEME_NOW] = (CF_PDEF[CF_THEME_NOW] || [null, null, null]).slice(); return C_.plants[CF_THEME_NOW]; }
  function cfPlantsSvg() {
    if (!Object.keys(CF_PLANTS).length) return "";
    return '<g id="cf-plants">' + cfPlantSel().map(function (k, i) { var q = CF_PLANTS[k]; if (!q) return ""; var s = CF_PSLOT[i], dy = CF_THEME_NOW === "wood" ? (window.__cfPlantDy != null ? window.__cfPlantDy : 7) : 0; return '<g transform="translate(' + Math.round(s[0] - q.w / 2) + ' ' + (s[1] + dy - q.h) + ')">' + q.svg + '</g>'; }).join("") + '</g>';
  }
  function cfPlantPic(k, sc) { var q = CF_PLANTS[k]; if (!q) return '<span class="cf-pnone">–</span>'; return '<svg viewBox="0 0 ' + q.w + ' ' + q.h + '" style="width:' + q.w * sc + 'px;height:' + q.h * sc + 'px" shape-rendering="crispEdges">' + q.svg + '</svg>'; }
  function cfPlantAsk(slot) {
    var sel = cfPlantSel(), keys = [null].concat(Object.keys(CF_PLANTS));
    var tiles = keys.map(function (k) { return '<button type="button" data-p="' + (k || "") + '" class="gq-tile' + (sel[slot] === k ? " gq-sel" : "") + '">' + cfPlantPic(k, 2) + '<span>' + (k ? CF_PLANTS[k].n : "Keine Pflanze") + '</span></button>'; }).join("");
    cfPanel('<p class="ga-h">Pflanze für Platz ' + (slot + 1) + '</p><div class="ga-grid gq-grid" style="flex:none;overflow:visible">' + tiles + '</div><div class="ga-row"><button type="button" class="ga-no" data-k="back">Zurück</button></div>', function (b, el) {
      if (b.dataset.p != null) { sel[slot] = b.dataset.p || null; if (window.SudokuSave) window.SudokuSave(); cfRebuild(); beep([[659, .05], [784, .06]]); }
      cfThemeAsk();
    });
  }
  function cfHam(f) {
    f = f || {};
    var parts = [f.body || "body", "ears_up", "whisk0", "nose", "eyes_" + (f.eyes || "open"), "mouth_" + (f.mouth || "smile"), "blush"];
    var cap = (typeof capOn === "function" && capOn()) ? A.bs_cap : "";
    return parts.map(function (k) { return A[k] || ""; }).join("") + (A["paws_" + (f.paws || "down")] || "") + (cap || CF_HATS[CF_HAT] || "");
  }
  function cfBuild() {
    cfApplyTheme();
    var clip = CF.wins.map(function (w) { return '<circle cx="' + w[0] + '" cy="' + w[1] + '" r="' + (w[2] + 0.5) + '"/>'; }).join("") +
      '<rect x="' + CF.doorwin[0] + '" y="' + CF.doorwin[1] + '" width="' + (CF.doorwin[2] - CF.doorwin[0] + 1) + '" height="' + (CF.doorwin[3] - CF.doorwin[1] + 1) + '"/>';
    var s = 0.78, hx = CF.ham[0] - 24 * s, hy = CF.ham[1] - 46 * s;
    var lamps = CF.lamps.map(function (l) { return cfGlow(l[0], l[1], 16, "#ffe08a", .08, 4); }).join("");
    cfTrack.innerHTML = '<svg class="cf-svg" viewBox="0 0 ' + CF.w + ' ' + CF.h + '" preserveAspectRatio="none" shape-rendering="crispEdges" aria-hidden="true">' +
      '<defs><clipPath id="cf-win">' + clip + '</clipPath></defs>' + CF.bg +
      '<g clip-path="url(#cf-win)"><rect id="cf-sky" x="0" y="0" width="' + CF.w + '" height="70" fill="#a8dcf6"/><g id="cf-stars"></g><g id="cf-view"></g><g id="cf-wx"></g></g>' +
      '<g class="cf-ob">' + CF.ob + '</g>' + cfPlantsSvg() + '<g class="cf-fire cf-f0">' + CF.fire0 + '</g><g class="cf-fire cf-f1">' + CF.fire1 + '</g>' +
      '<g id="cf-hamw"><g id="cf-ham" class="cf-ham" transform="translate(' + hx.toFixed(2) + ' ' + hy.toFixed(2) + ') scale(' + s + ')"></g><g id="cf-hold"></g></g><g id="cf-front">' + CF.cf + '</g>' + '<g id="cf-fest"></g><g id="cf-stock"></g>' +
      '<g id="cf-hamfx"></g><rect id="cf-dim" x="0" y="0" width="' + CF.w + '" height="' + CF.h + '" fill="#1e2a54" opacity="0"/>' +
      '<g class="cf-light cf-hearth">' + cfGlow(CF.hearth[0], CF.hearth[1], 46, "#ffb24a", .06, 6) + '</g><g class="cf-light cf-lamps">' + lamps + '</g></svg>';
    cfHamSet({});
    var HITS = { door: [8, 42, 44, 100], book: [316, 36, 346, 52], crate: [334, 98, 356, 116], cups: [278, 66, 303, 80] }; Object.keys(CF.hit).forEach(function (k) { HITS[k] = CF.hit[k]; });
    Object.keys(HITS).forEach(function (k) {
      var h = HITS[k], b = document.createElement("button"); b.type = "button"; b.className = "cf-hit"; b.dataset.k = k;
      b.setAttribute("aria-label", { door: "Café-Tür", book: "Teebuch", crate: "Materialkiste", bake: "Backstube", vitrine: "Kuchen in die Vitrine", cups: "Getränke auf der Theke", coffee: "Kaffee machen", tea: "Tee machen" }[k]);
      b.style.left = (h[0] / CF.w * 100) + "%"; b.style.top = (h[1] / CF.h * 100) + "%"; b.style.width = ((h[2] - h[0]) / CF.w * 100) + "%"; b.style.height = ((h[3] - h[1]) / CF.h * 100) + "%";
      cfTrack.appendChild(b);
    });
    cfStock();
  }
  function cfHamSet(f) { CFH.f = f || {}; cfHamRender(); }
  // ---------- the hamster in the café can walk: to the oven, to the tables, back behind the counter ----------
  var CFH = { x: CF.ham[0], y: CF.ham[1], f: {}, body: "body", rot: 0, bob: 0, hold: "", hw: 0, hh: 0, busy: false, q: [] };
  function cfHamRender() {
    var g = document.getElementById("cf-ham"); if (!g) return; var sc = .78;
    g.setAttribute("transform", "translate(" + (CFH.x - 24 * sc).toFixed(2) + " " + (CFH.y - 46 * sc + CFH.bob).toFixed(2) + ") scale(" + sc + ")" + (CFH.rot ? " rotate(" + CFH.rot + " 24 30)" : ""));
    var f = {}; for (var k in CFH.f) f[k] = CFH.f[k]; f.body = CFH.body; if (CFH.hold) f.paws = "hold";
    g.innerHTML = cfHam(f);
    // a tray is carried in front with both paws
    var hx_ = CFH.x - CFH.hw / 2, hy_ = CFH.up ? CFH.y - 6 - CFH.hh : CFH.y - 10 - CFH.hh;   // the tray is held in front, at the paws
    var h = document.getElementById("cf-hold"); if (h) h.innerHTML = CFH.hold ? '<g transform="translate(' + Math.round(hx_) + ' ' + Math.round(hy_ + CFH.bob) + ')">' + CFH.hold + '</g>' : "";
    // out in the room he walks in front of the counter (and of the guests), behind it he is half hidden
    var w = document.getElementById("cf-hamw"), svg = w && w.parentNode;
    // out in the room he joins the guests' layer, where everyone is drawn by depth (who is lower in the picture is in front)
    if (svg || (w && w.parentNode)) {
      var root = cfTrack.querySelector(".cf-svg"), gl = root && root.querySelector("#cf-guests");
      if (CFH.y > 92 && gl) { if (w.parentNode !== gl) gl.appendChild(w); }
      else if (root) { var ref = CFH.y > 92 ? root.querySelector("#cf-stock") : root.querySelector("#cf-front"); if (ref && (w.parentNode !== root || w.nextSibling !== ref)) root.insertBefore(w, ref); }
    }
  }
  function cfHamWalk(pts) {
    return new Promise(function (res) {
      var i = 0, last = performance.now(), t0 = last;
      (function step(now) {
        if (!cafeOn) { CFH.x = CF.ham[0]; CFH.y = CF.ham[1]; CFH.body = "body"; CFH.rot = 0; CFH.bob = 0; CFH.hold = ""; res(); return; }
        var dt = Math.min(.05, (now - last) / 1000); last = now; var p = pts[i];
        if (!p) { CFH.body = "body"; CFH.rot = 0; CFH.bob = 0; cfHamRender(); res(); return; }
        if (p[2] === "hop") {
          // a little hop up or down a step
          if (!p.t0) { p.t0 = now; p.sx = CFH.x; p.sy = CFH.y; }
          var u = Math.min(1, (now - p.t0) / 280); CFH.x = p.sx + (p[0] - p.sx) * u; CFH.y = p.sy + (p[1] - p.sy) * u; CFH.bob = -Math.round(Math.sin(u * Math.PI) * 6);
          CFH.body = "body"; CFH.rot = 0; if (u >= 1) { CFH.bob = 0; i++; if (Math.random() < .5) beep([[520, .02]]); }
          cfHamRender(); requestAnimationFrame(step); return;
        }
        var dx = p[0] - CFH.x, dy = p[1] - CFH.y, d = Math.hypot(dx, dy), st = 46 * dt;
        if (d <= st) { CFH.x = p[0]; CFH.y = p[1]; i++; } else { CFH.x += dx / d * st; CFH.y += dy / d * st; }
        var fr = Math.floor((now - t0) / 120) % 4; CFH.body = ["body", "body_l", "body", "body_r"][fr]; CFH.rot = fr === 1 ? -4 : fr === 3 ? 4 : 0; CFH.bob = fr % 2 ? -1 : 0;
        cfHamRender(); requestAnimationFrame(step);
      })(last);
    });
  }
  // behind the counter he stands on a little platform; at each end two steps lead down to the floor.
  // Out in the room he walks along the front, in front of the tables, and only then steps up to where he is going.
  var CF_STEPS = { l: [[256, 85], [245, 95], [232, 104]], r: [[361, 85], [372, 95], [386, 104]] }, CF_LANE = 126;
  function cfSide(x) { return x < 320 ? "l" : "r"; }
  function cfRoute(to) {
    var fb = CFH.y < 92, tb = to[1] < 92, pts = [];
    if (fb && tb) return [to];
    if (fb) {
      var S = CF_STEPS[cfSide(to[0])];
      pts.push([S[0][0], S[0][1]], [S[1][0], S[1][1], "hop"], [S[2][0], S[2][1], "hop"]);
      if (to[1] >= CF_LANE - 2) pts.push([S[2][0], CF_LANE], [to[0], CF_LANE]);
      pts.push(to); return pts;
    }
    if (tb) {
      var S2 = CF_STEPS[cfSide(CFH.x)];
      if (CFH.y >= CF_LANE - 2) pts.push([CFH.x, CF_LANE], [S2[2][0], CF_LANE]);
      pts.push([S2[2][0], S2[2][1]], [S2[1][0], S2[1][1], "hop"], [S2[0][0], S2[0][1], "hop"], to); return pts;
    }
    // from one spot in the room to another: down to the front, along, and up again
    if (Math.abs(CFH.x - to[0]) > 20) pts.push([CFH.x, Math.max(CFH.y, CF_LANE)], [to[0], Math.max(to[1], CF_LANE)]);
    pts.push(to); return pts;
  }
  function cfHamGo(to) { return cfHamWalk(cfRoute(to)); }
  function cfHamHome() { return cfHamGo([CF.ham[0], CF.ham[1]]).then(function () { CFH.hold = ""; cfHamRender(); }); }
  function cfHamAway() { return Math.abs(CFH.x - CF.ham[0]) > 1 || Math.abs(CFH.y - CF.ham[1]) > 1; }
  // jobs one after another; each returns a promise
  function cfHamJob(fn) { return new Promise(function (res) { CFH.q.push(function () { return Promise.resolve().then(fn).catch(function () {}).then(res); }); if (!CFH.busy) cfHamNext(); }); }
  function cfHamNext() { var fn = CFH.q.shift(); if (!fn) { CFH.busy = false; return; } CFH.busy = true; fn().then(cfHamNext); }
  // things for guests and the cabinet go on a little silver tray
  function cfTray(svg, w, h) { var tw = Math.max(18, w + 6); return { svg: '<g transform="translate(' + Math.round((tw - w) / 2) + ' 0)">' + svg + '</g><path fill="#3a2414" d="M1 ' + (h) + 'h' + (tw - 2) + 'v1h1v2h-1v1H1v-1H0v-2h1z"/><path fill="#c8ccd4" d="M1 ' + (h + 1) + 'h' + (tw - 2) + 'v2H1z"/><path fill="#ffffff" d="M3 ' + (h + 1) + 'h' + Math.round(tw / 3) + 'v1H3z"/><path fill="#8a909a" d="M2 ' + (h + 3) + 'h' + (tw - 4) + 'v1H2z"/>', w: tw, h: h + 4 }; }
  function cfHold(svg, w, h, up) { CFH.hold = svg || ""; CFH.hw = w || 0; CFH.hh = h || 0; CFH.up = !!up; cfHamRender(); }
  // petting: tap him in the café; too much and he gets grumpy, like at home
  var cfPetN = 0, cfPetT = null, cfPetEnd = null;
  function cafePet() {
    if (s.asleep || CFH.busy) return;
    cfPetN++; clearTimeout(cfPetT); cfPetT = setTimeout(function () { cfPetN = 0; }, 4000);
    if (cfPetN > 6) { cfPetN = 0; cfHamSet({ eyes: "happy", mouth: "grin", blush: true }); say(N() + " ist ganz glücklich."); var fxh = document.getElementById("cf-hamfx");
      if (fxh) { fxh.insertAdjacentHTML("beforeend", [0, 1, 2].map(function (k) { return '<g class="cf-heart" style="animation-delay:' + k * .16 + 's"><g transform="translate(' + (CFH.x - 9 + k * 9) + ' ' + (CFH.y - 46 - (k % 2) * 3) + ')"><path fill="#3a2414" d="M0 1h1v-1h2v1h1v-1h2v1h1v3h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1z"/><path fill="#e8554a" d="M1 1h2v1h1v-1h2v2h-1v1h-1v1h-1v-1h-1v-1h-1z"/></g></g>'; }).join("")); setTimeout(function () { fxh.querySelectorAll(".cf-heart").forEach(function (h) { h.remove(); }); }, 1600); }
      var wf = 0, wt = setInterval(function () { wf++; cfHamSet({ paws: wf % 2 ? "wash_r" : "wash_l", eyes: "sleep", blush: true }); if (wf >= 6) { clearInterval(wt); cfHamSet({ eyes: "happy", mouth: "smile", blush: true }); clearTimeout(cfPetEnd); cfPetEnd = setTimeout(function () { cfHamSet({}); }, 900); } }, 170);
      beep([[784, .05], [988, .06], [1319, .08]]); return; }
    s.love = clamp(s.love + 8); renderNeeds();
    cfHamSet({ eyes: "happy", mouth: "smile", blush: true }); CFH.rot = cfPetN % 2 ? -4 : 4; cfHamRender();
    var fxg = document.getElementById("cf-hamfx");
    if (fxg) { var hx = Math.round(CFH.x + (Math.random() - .5) * 16), hy = Math.round(CFH.y - 40); var id = "cfh" + Date.now(); fxg.insertAdjacentHTML("beforeend", '<g id="' + id + '" transform="translate(' + hx + ' ' + hy + ')"><g class="cf-heart"><path fill="#3a2414" d="M-4 0h3v1h2v-1h3v1h1v3h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-3h1z"/><path fill="#e8554a" d="M-3 1h2v1h2v-1h2v3h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1z"/></g></g>'); setTimeout(function () { var e = document.getElementById(id); if (e) e.remove(); }, 1200); }
    if (cfPetN === 1) say(N() + " kuschelt sich an deine Hand.");
    beep([[700 + cfPetN * 40, .04]]);
    clearTimeout(cfPetEnd); cfPetEnd = setTimeout(function () { CFH.rot = 0; cfHamSet({}); }, 1100);
  }
  cfTrack.addEventListener("click", function (e) {
    if (e.target.closest(".cf-hit") || cfGameOn) return;
    var r = cfTrack.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * CF.w, y = (e.clientY - r.top) / r.height * CF.h;
    if (Math.abs(x - CFH.x) < 15 && y > CFH.y - 36 && y < CFH.y + 2) cafePet();
  });
  var _cf_pet = pet; pet = function (a, b) { if (place2 === "cafe" && cafeOn) return cafePet(); return _cf_pet(a, b); };
  // music: he dances behind the counter (or wherever he stands) when he is not busy
  var _cf_dance = danceTick; danceTick = function (tr) {
    if (!(place2 === "cafe" && cafeOn)) return _cf_dance(tr);
    if (!s.music || s.asleep || CFH.busy || cfGameOn) return;
    var n = (danceTick.n = (danceTick.n || 0) + 1), slow = tr.bpm < 100;
    CFH.rot = n % 2 ? -5 : 5; CFH.bob = slow ? 0 : (n % 2 ? -1 : 0);
    cfHamSet(slow ? { eyes: "sleep", mouth: "smile", blush: true } : { eyes: "happy", mouth: n % 2 ? "grin" : "smile", paws: n % 2 ? "side_r" : "side_l", blush: true });
  };
  function cfWait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  var cfKey = "";
  function cfRender() {
    var se = season(), wt = weather.type, sk = document.getElementById("sky").className, night = /sky-night/.test(sk), eve = /sky-eve/.test(sk);
    var fe = typeof festival === "function" ? festival() : "";
    var key = se + "|" + wt + "|" + night + "|" + eve + "|" + fe; if (key === cfKey) return; cfKey = key;
    var fg = document.getElementById("cf-fest"); if (fg) fg.innerHTML = cfFest(fe, night || eve);
    var col = night ? "#1e2a54" : eve ? "#f4b88a" : wt === "storm" ? "#46506a" : (wt === "rain" || wt === "snow") ? "#a8b8c8" : wt === "clouds" ? "#bcd0de" : "#a8dcf6";
    document.getElementById("cf-sky").setAttribute("fill", col);
    var gv = typeof WBG === "object" && WBG["bg_" + se] ? CF.wins.map(function (w) { return '<image href="' + WBG["bg_" + se] + '" x="' + (w[0] - 104) + '" y="' + (w[1] - 64) + '" width="180" height="135" style="image-rendering:pixelated"/>'; }).join("") + '<image href="' + WBG["bg_" + se] + '" x="' + (CF.doorwin[0] - 60) + '" y="' + (CF.doorwin[1] - 70) + '" width="180" height="135" style="image-rendering:pixelated"/>' : CF.views[se];
    document.getElementById("cf-view").innerHTML = gv + (night ? '<rect x="0" y="0" width="' + CF.w + '" height="' + CF.h + '" fill="#141a3a" opacity=".55"/>' : eve ? '<rect x="0" y="0" width="' + CF.w + '" height="' + CF.h + '" fill="#a04a3a" opacity=".18"/>' : "");
    var st = ""; if (night) [[86, 42], [97, 40], [324, 27], [335, 30], [21, 53]].forEach(function (p, i) { st += '<rect class="cf-star" x="' + p[0] + '" y="' + p[1] + '" width="1" height="1" fill="#fff6c8" style="animation-delay:-' + i * 0.7 + 's"/>'; });
    document.getElementById("cf-stars").innerHTML = st;
    var wx = "", i;
    if (wt === "rain" || wt === "storm") for (i = 0; i < 26; i++) { var w = CF.wins[i % 2]; wx += '<rect class="cf-rain" x="' + (w[0] - w[2] + (i * 7) % (2 * w[2])) + '" y="' + (w[1] - w[2] + (i * 5) % (2 * w[2])) + '" width="1" height="3" fill="#d8e4f2" style="animation-delay:-' + (i * 0.13).toFixed(2) + 's"/>'; }
    if (wt === "snow") for (i = 0; i < 22; i++) { var w2 = CF.wins[i % 2]; wx += '<rect class="cf-snow" x="' + (w2[0] - w2[2] + (i * 7) % (2 * w2[2])) + '" y="' + (w2[1] - w2[2] + (i * 5) % (2 * w2[2])) + '" width="1" height="1" fill="#ffffff" style="animation-delay:-' + (i * 0.4).toFixed(2) + 's"/>'; }
    for (i = 0; i < 12 && (wt === "rain" || wt === "storm" || wt === "snow"); i++) wx += '<rect class="' + (wt === "snow" ? "cf-snow" : "cf-rain") + '" x="' + (17 + (i * 5) % 19) + '" y="' + (51 + (i * 3) % 13) + '" width="1" height="' + (wt === "snow" ? 1 : 3) + '" fill="#e8f0f8" style="animation-delay:-' + (i * 0.3).toFixed(2) + 's"/>';
    document.getElementById("cf-wx").innerHTML = wx;
    document.getElementById("cf-dim").setAttribute("opacity", "0");   // inside it is always light; only the view outside gets dark
    cafeEl.classList.toggle("cf-dark", night || eve);
  }
  // festival decoration in the café, with the same sprites as in the house
  function cfFest(f, dark) {
    if (!f || typeof festSprite !== "function") return "";
    var o = "", S = festSprite;
    if (f === "herbst") {
      o += S("f_hbunting", 5, 4) + S("f_hbunting", 185, 4) + S("f_web", 0, 6) + S("f_web", 332, 6, true);
      o += S(dark ? "f_jack0on" : "f_jack0off", 83, 81) + S(dark ? "jack_on" : "jack_off", 36, 104) + S(dark ? "f_jack1on" : "f_jack1off", 226, 108);
      o += S("f_candle", 145, 84) + S("f_candle", 211, 84) + S("f_ghost", 112, 26) + S("f_bat0", 250, 18) + S("f_bat1", 66, 22);
    } else if (f === "advent" || f === "weihnachten") {
      o += S("f_garland", 5, 4) + S("f_garland", 185, 4) + S("f_star", 82, 38) + S("f_candle", 145, 84) + S("f_candle", 211, 84);
      if (f === "advent") o += S("f_wreath" + (typeof adventWeek === "function" ? adventWeek() : 1), 9, 66);
      else o += S("f_wreath4", 9, 66) + S("f_mistle", 300, 14) + S("f_stock0", 160, 52) + S("f_stock1", 174, 54) + S("f_stock2", 188, 52) + S("f_cookies", 83, 90) + S("f_gift0", 40, 112) + S("f_gift2", 52, 114);
    } else if (f === "silvester") {
      o += S("f_pbunting", 5, 4) + S("f_pbunting", 185, 4) + S("f_balloon0", 50, 40) + S("f_balloon1", 62, 46) + S("f_balloon2", 240, 36) + S("f_balloon3", 252, 44);
    } else if (f === "ostern") {
      o += S("f_pbunting", 5, 4) + S("f_pbunting", 185, 4) + S("egg0", 88, 89) + S("egg1", 140, 87) + S("egg2", 150, 87) + S("egg3", 206, 87) + S("egg4", 216, 87);
    }
    return o;
  }
  // the hamster behind the counter: blinks, wipes the counter, looks out at the room
  var cfT = 0;
  setInterval(function () {
    if (!cafeOn) return; cfRender(); cfT++;
    if (cfT % 9 === 0) { cfHamSet({ eyes: "sleep" }); setTimeout(function () { cfHamSet({}); }, 160); }
    else if (cfT % 23 === 0) { cfHamSet({ paws: "side_r", eyes: "happy", mouth: "grin" }); setTimeout(function () { cfHamSet({ paws: "side_l", eyes: "happy", mouth: "grin" }); }, 420); setTimeout(function () { cfHamSet({}); }, 900); }
    else if (cfT % 31 === 0) { cfHamSet({ eyes: "look_l" }); setTimeout(function () { cfHamSet({}); }, 1400); }
  }, 450);
  // sideways scrolling: touch scrolls natively, the mouse drags
  (function () {
    var dx = null, sl = 0;
    cfScroll.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; dx = e.clientX; sl = cfScroll.scrollLeft; cfScroll.classList.add("drag"); });
    window.addEventListener("pointermove", function (e) { if (dx == null) return; cfScroll.scrollLeft = sl - (e.clientX - dx); });
    window.addEventListener("pointerup", function () { dx = null; cfScroll.classList.remove("drag"); });
  })();
  function cfGlide(to, ms) {
    var from = cfScroll.scrollLeft, t0 = performance.now();
    (function step(t) { var k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; cfScroll.scrollLeft = from + (to - from) * e; if (k < 1 && cafeOn) requestAnimationFrame(step); })(t0);
  }
  // the café is a place of its own (place2 = "cafe"): he is out of the house while he is here
  function openCafe() {
    cfBuild(); cfKey = ""; CFH.x = CF.ham[0]; CFH.y = CF.ham[1]; CFH.hold = ""; CFH.q = []; CFH.busy = false; CFH.body = "body"; CFH.rot = 0; CFH.bob = 0; cfRender(); cafeEl.hidden = false; cafeOn = true;
    showPlace("cafe");
    cfTrack.style.width = (CF.w / 180 * 100) + "%"; cfScroll.scrollLeft = 0; beep([[523, .05], [659, .05], [784, .08]]);
    say(N() + " schließt das Café auf."); var dbt = document.getElementById("decor-btn"); dbt.hidden = false; decorLabel();
    setTimeout(function () { if (cafeOn) cfGlide(Math.min(cfScroll.scrollWidth - cfScroll.clientWidth, (300 - 90) / CF.w * cfScroll.scrollWidth), 1600); }, 700);
  }
  function closeCafe() {
    cfCatClose();
    if (!cafeOn) return; cafeOn = false; cafeEl.hidden = true; setTimeout(function () { decorLabel(); }, 0);
    var g = cafeEl.querySelector(".cf-game"); if (g) { var x = g.querySelector(".bp-x"); if (x) x.click(); if (g.parentNode) g.remove(); cfGameOn = false; }
  }
  // back through the door: he comes into the kitchen from the right
  async function kitchenFromCafe() {
    closeCafe(); showPlace("kitchen"); moveTo(196, 120, 0); fadeX(true);
    await walkTo(140, 120); front({ eyes: "happy", mouth: "smile" }); say(N() + " ist zurück in der Küche.");
  }
  var cfLeaving = false;
  function leaveCafe() {
    if (cfLeaving || cfGameOn) return; cfLeaving = true;
    say(N() + " schließt das Café ab."); cfGlide(0, 700); beep([[784, .05], [659, .05], [523, .08]]);
    setTimeout(function () { cfLeaving = false; if (busy) interrupt(); act("outside", cafeOutFromCafe); }, 800);
  }
  async function cafeSeq() { openCafe(); }
  var _cf_travelTo = travelTo;
  travelTo = async function (t) {
    if (t === "cafe") {
      if (place2 === "cafe") { say(N() + " ist schon im Café."); return; }
      if (place2 !== "kitchen") await _cf_travelTo("kitchen");
      say(N() + " geht nach nebenan ins Café."); await walkTo(196, 120); fadeX(false); await wait(250);
      openCafe(); return;
    }
    if (place2 === "cafe" && t === "kitchen") return kitchenFromCafe();
    return _cf_travelTo(t);
  };
  // every way home from the café leads through the kitchen
  // ===================== the café's own level: outside, between the garden and the lake =====================
  // garden ›  the path past the café  ›  the lake. The door leads inside; every way home goes back through the garden.
  var COUT = /*CAFEOUT*/;
  var coEl = placeEl("cafeout"); NEWP.push("cafeout"); NAMES.cafeout = "Vor dem Café";
  var coBg = lEl("div", "l-bg", coEl), coUi = lEl("div", "l-ui", coEl);
  var CO = { inL: { x: -14, y: 122 }, inR: { x: 194, y: 122 }, door: { x: 92, y: 110 }, front: { x: 92, y: 120 }, west: { x: 40, y: 122 }, east: { x: 146, y: 122 } };
  coUi.innerHTML = '<button type="button" class="l-hot co-door" data-a="door" style="left:' + (COUT.door[0] / 1.8) + '%;top:' + (COUT.door[1] / 1.35) + '%;width:' + ((COUT.door[2] - COUT.door[0]) / 1.8) + '%;height:' + ((COUT.door[3] - COUT.door[1]) / 1.35) + '%" aria-label="Ins Café"></button>' +
    '<button type="button" class="g-exit l-exit" data-a="west" aria-label="Zum Garten"><span>‹</span></button><button type="button" class="g-exit g-exit-r l-exit" data-a="east" aria-label="Zum See"><span>›</span></button>';
  function renderCafeOut() {
    var se = season(), skyCls = (document.getElementById("sky").className.match(/sky-(eve|night)/) || [""])[0];
    var glow = "";
    if (skyCls) {
      // in the evening and at night the windows and the lanterns glow warm
      COUT.wins.forEach(function (w) { for (var r = 14; r > 6; r -= 3) glow += '<circle cx="' + w[0] + '" cy="' + w[1] + '" r="' + r + '" fill="#ffd27a" opacity=".16"/>'; glow += '<circle cx="' + w[0] + '" cy="' + w[1] + '" r="8" fill="#ffe8a8" opacity=".75"/>'; });
      COUT.lamps.forEach(function (l) { for (var r2 = 8; r2 > 2; r2 -= 2) glow += '<circle cx="' + (l[0] + 1.5) + '" cy="' + (l[1] + 2) + '" r="' + r2 + '" fill="#ffd27a" opacity=".2"/>'; });
      glow = '<svg class="map-l" viewBox="0 0 180 135" aria-hidden="true">' + glow + '</svg>';
    }
    coBg.innerHTML = outdoor('<img class="map-l" src="' + COUT["bg_" + se] + '" alt="">') + glow;
  }
  var _co_showPlace = showPlace;
  showPlace = function (p) { _co_showPlace(p); coEl.hidden = p !== "cafeout"; if (p === "cafeout") renderCafeOut(); };
  var _co_skyTime = skyTime; skyTime = function () { _co_skyTime(); if (place2 === "cafeout") renderCafeOut(); };
  var _co_walkTo = walkTo;
  walkTo = async function (x, y, speed) { if (place2 === "cafeout" && x > -10 && x < 190) y = Math.max(108, Math.min(130, y)); return _co_walkTo(x, y, speed); };
  async function fadeTo(place, at) { fadeX(false); await wait(250); showPlace(place); moveTo(at.x, at.y, 0); fadeX(true); }
  // garden › café
  async function cafeOutFromGarden() {
    await walkTo(196, 122); await fadeTo("cafeout", CO.inL); say(N() + " ist beim Café."); await walkTo(CO.west.x, CO.west.y);
  }
  // café › garden
  async function gardenFromCafeOut() { await walkTo(CO.inL.x, CO.inL.y); await fadeTo("garden", { x: 196, y: 122 }); await walkTo(150, 122); }
  // café › lake
  async function pondFromCafeOut() {
    await walkTo(CO.inR.x, CO.inR.y); await fadeTo("pond", PSPOT.enter); say(N() + " ist am See."); await walkTo(PSPOT.home.x, PSPOT.home.y);
    front({ eyes: "happy", mouth: "smile" });
    setTimeout(function () { if (place2 === "pond" && !pondV && Date.now() - lastPondVisit > 60000) spawnPondVisitor(); }, 800);
  }
  // lake › café
  async function cafeOutFromPond() { await toBank(); await walkTo(-14, 126); await fadeTo("cafeout", CO.inR); say(N() + " ist beim Café."); await walkTo(CO.east.x, CO.east.y); }
  // outside › inside, and back out
  async function cafeInFromOut() { await walkTo(CO.front.x, CO.front.y); await walkTo(CO.door.x, CO.door.y); fadeX(false); await wait(250); openCafe(); }
  async function cafeOutFromCafe() { closeCafe(); showPlace("cafeout"); moveTo(CO.door.x, CO.door.y, 0); fadeX(true); await walkTo(CO.front.x, CO.front.y); front({ eyes: "happy", mouth: "smile" }); say(N() + " ist vor dem Café."); }
  // the garden's right-hand exit now leads to the café; the lake's left-hand exit back to the café
  goPondSeq = async function () { if (place2 === "cafeout") return pondFromCafeOut(); if (place2 !== "garden") { await toRoom(); await goGardenSeq(); } return cafeOutFromGarden(); };
  gardenFromPond = cafeOutFromPond;
  document.querySelectorAll(".g-exit.g-exit-r").forEach(function (b) { if (b.getAttribute("aria-label") === "Zum Teich") b.setAttribute("aria-label", "Zum Café"); });
  coUi.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b || s.asleep || decor) return; if (busy && !interruptible()) return; if (busy) interrupt();
    var a = b.dataset.a;
    if (a === "door") act("travel", cafeInFromOut);
    else if (a === "west") act("garden", gardenFromCafeOut);
    else if (a === "east") act("pondgo", pondFromCafeOut);
  });
  // ways through the world: home is always back through the garden
  var _cf_toRoom = toRoom;
  toRoom = async function () {
    if (place2 === "cafe") await cafeOutFromCafe();
    if (place2 === "pond") await cafeOutFromPond();
    if (place2 === "cafeout") await gardenFromCafeOut();
    return _cf_toRoom();
  };
  var _co_travelTo = travelTo;
  travelTo = async function (t) {
    if (t === "cafeout" || t === "cafe") {
      if (place2 === "cafe") { if (t === "cafeout") return cafeOutFromCafe(); say(N() + " ist schon im Café."); return; }
      if (place2 === "pond") await cafeOutFromPond();
      else if (place2 !== "cafeout") { if (place2 !== "garden") { await toRoom(); await goGardenSeq(); } await cafeOutFromGarden(); }
      if (t === "cafe") return cafeInFromOut();
      return;
    }
    if (t === "pond" && place2 !== "pond") {
      if (place2 === "cafe") await cafeOutFromCafe();
      if (place2 !== "cafeout") { if (place2 !== "garden") { await toRoom(); await goGardenSeq(); } await cafeOutFromGarden(); }
      return pondFromCafeOut();
    }
    if (t === "garden" && (place2 === "cafe" || place2 === "cafeout" || place2 === "pond")) {
      if (place2 === "cafe") await cafeOutFromCafe();
      if (place2 === "pond") await cafeOutFromPond();
      return gardenFromCafeOut();
    }
    if (place2 === "cafe" || place2 === "cafeout" || place2 === "pond") await toRoom();
    return _co_travelTo(t);
  };
  // fed while in the café: he eats right here at the counter (the kitchen is the nearest place from everywhere else)
  var _cf_feed = feedSeq; feedSeq = async function (k) { if (place2 === "cafe" && cafeOn) return cafeFeed(k); if (place2 === "cafe") await toRoom(); return _cf_feed(k); };
  function cafeFeed(kind) {
    var full = s.food >= 98, fk = FOOD[kind] || kind, sz = SZ[fk] || [10, 10];
    say({ seed: "Kerne! " + N() + " macht kurz Pause an der Theke.", carrot: "Eine Karotte! " + N() + " nascht hinter der Theke.", apple: "Ein Apfel! " + N() + " kann es kaum fassen." }[kind] || (GFOOD[kind] && GFOOD[kind].say) || N() + " freut sich.");
    return cfHamJob(async function () {
      cfHold('<g>' + (A[fk] || "") + '</g>', sz[0], sz[1]);
      var n = full ? 8 : kind === "seed" ? 12 : 16;
      for (var i = 0; i < n; i++) { cfHamSet({ eyes: "happy", mouth: i % 2 ? "teeth" : "chew" }); if (i === n - 4) cfHold(""); await cfWait(150); }
      if (full) {
        var val = GFOOD[kind] ? GFOOD[kind].food : kind === "apple" ? 20 : kind === "seed" ? 15 : 25;
        if (GFOOD[kind]) { garden.harvest[kind]--; renderFoods(); } else if (kind === "apple") s.treats--;
        stashFood = Math.min(60, stashFood + val); stashUntil = Math.max(stashUntil, Date.now()) + 90000; renderNeeds();
        say(N() + " ist eigentlich satt und stopft alles in die Backen. Dicke Backen!");
      } else {
        if (GFOOD[kind]) { var gf = GFOOD[kind]; garden.harvest[kind]--; s.food = clamp(s.food + gf.food); s.fun = clamp(s.fun + (gf.fun || 0)); s.love = clamp(s.love + (gf.love || 0)); renderFoods(); }
        else if (kind === "apple") { s.treats--; s.food = clamp(s.food + 20); s.fun = clamp(s.fun + 10); s.love = clamp(s.love + 5); }
        else s.food = clamp(s.food + (kind === "seed" ? 15 : 25));
        renderNeeds();
        say({ seed: "Backen voll! Dicke Backen.", carrot: "Knusper, knusper. Lecker.", apple: N() + " ist rundum glücklich." }[kind] || N() + " schmatzt zufrieden.");
      }
      cfHamSet({ paws: "up", eyes: "happy", mouth: "grin" }); beep([[659, .05], [784, .08]]); await cfWait(800); cfHamSet({});
      if (window.SudokuSave) window.SudokuSave();
    });
  }
  var _cf_sleep = sleepSeq; sleepSeq = async function () { if (place2 === "cafe") await toRoom(); return _cf_sleep(); };
  var _cf_idle = idle; idle = function () { if (place2 === "cafe") { later(idle, rnd(4000, 8000)); return; } _cf_idle(); };
  // on the house map he is not at home while he is in the café
  var _cf_rmm = renderMapMarker; renderMapMarker = function () { _cf_rmm(); var m = document.getElementById("map-ham"); if (m) m.hidden = place2 === "cafe"; };
  var kCafe = xEl("button", "g-exit h-exit right k-cafe", document.getElementById("kitchen"), "<span>›</span>"); kCafe.type = "button"; kCafe.setAttribute("aria-label", "Ins Café"); kCafe.hidden = true; kCafe.style.display = "none";
  kCafe.addEventListener("click", function () { if (s.asleep) return; if (busy && !interruptible()) return; if (busy) interrupt(); document.getElementById("k-ui").innerHTML = ""; act("travel", function () { return travelTo("cafe"); }); });
  // while the café is open nothing else drops in
  var _cf_sv = spawnVisitor; spawnVisitor = function () { if (cafeOn) return; return _cf_sv.apply(this, arguments); };
  if (typeof spawnPondVisitor === "function") { var _cf_spv = spawnPondVisitor; spawnPondVisitor = function () { if (cafeOn) return; return _cf_spv.apply(this, arguments); }; }
  var _cf_lok = letterOk; letterOk = function () { return !cafeOn && _cf_lok(); };

  // ---------- step 2: the counter fills up: cakes from the kitchen into the cabinet, coffee and tea made fresh ----------
  function cfL() { var L = life(); L.cafe = L.cafe || { cakes: 0, cof: 0, tea: 0 }; return L.cafe; }
  function cfSpr(k, x, y) { var p = CF.spr[k]; return '<g transform="translate(' + (x == null ? p.x : x) + ' ' + (y == null ? p.y : y) + ')">' + p.svg + '</g>'; }
  function cfStock() {
    var C_ = cfL(), o = "";
    o += ckStockSvg();
    var cups = []; for (var i = 0; i < C_.cof; i++) cups.push("cof"); for (var j = 0; j < C_.tea; j++) cups.push("tea");
    cups.slice(0, 4).forEach(function (k, n) { o += cfSpr(k, 279 + n * 6, 70); });
    // the tea book lies on a little sill under the round window above the counter
    o += '<g transform="translate(316 46)"><path fill="#3a2414" d="M0 0h29v4H0z"/><path fill="#c8905a" d="M1 1h27v1H1z"/><path fill="#8a5a30" d="M1 2h27v1H1z"/><path fill="#3a2414" d="M4 4h2v2H4zM23 4h2v2h-2z"/></g>';
    o += '<g transform="translate(322 39)"><path fill="#3a2414" d="M0 1h17v6H0z"/><path fill="#b8463c" d="M1 2h15v2H1z"/><path fill="#d86a5a" d="M1 2h15v1H1z"/><path fill="#fff8ec" d="M2 4h14v2H2z"/><path fill="#e8dcc4" d="M2 5h14v1H2z"/><path fill="#e8b830" d="M6 2h5v1H6z"/><path fill="#e8554a" d="M13 6h2v3h-2z"/></g>';
    // the crate where the guests' payment goes
    var nm = 0, M = cfL().paid || {}; Object.keys(M).forEach(function (k) { nm += M[k]; });
    o += '<g transform="translate(336 102)"><path fill="#3a2414" d="M0 0h18v13H0z"/><path fill="#a8703c" d="M1 1h16v11H1z"/><path fill="#c8905a" d="M1 1h16v1H1zM1 6h16v1H1z"/><path fill="#6a4026" d="M3 2h1v10H3zM14 2h1v10h-1z"/>' + (nm ? '<path fill="#f6c84a" d="M6 -2h2v2H6zM10 -3h2v3h-2z"/><path fill="#7ac860" d="M8 -2h2v2H8z"/>' : "") + '</g>';
    var el = document.getElementById("cf-stock"); if (el) el.innerHTML = o;
  }
  cfTrack.addEventListener("click", function (e) {
    var b = e.target.closest(".cf-hit"); if (!b || cfGameOn || cfLeaving) return;
    var k = b.dataset.k, C_ = cfL();
    if (k === "door") { cfDoorAsk(); return; }
    if (k === "cups") { if (typeof gCounterAsk === "function") gCounterAsk(); return; }
    if (k === "crate") { var M2 = cfL().paid || {}, NM = { strawberry: "Erdbeeren", gcarrot: "Möhren", pumpkin: "Kürbisse", nut: "Haselnüsse", honey: "Honig", sunflower: "Sonnenblumen", dandelion: "Löwenzahn", herbs: "Kräuter", chili: "Chilis", tomato: "Tomaten", cucumber: "Gurken" }, ks = Object.keys(M2).filter(function (q) { return M2[q] > 0; }); say(ks.length ? "Von den Gästen bisher: " + ks.map(function (q) { return M2[q] + " " + (NM[q] || q); }).join(", ") + ". Alles liegt im Vorrat." : "Die Gäste bezahlen mit Zutaten aus ihren Gärten. Sie kommen direkt in den Vorrat."); beep([[523, .04]]); return; }
    if (k === "book") { if (window.__teaBook) window.__teaBook(cafeEl, "tea", true); return; }
    if (k === "bake") { cfStartBake(); return; }
    if (k === "vitrine") {
      if (ckList().length && typeof gCounterAsk === "function") { gCounterAsk(); return; }
      var CL = ckList(), have = garden.harvest.cake || 0, room = CK_MAX - CL.length;
      if (room <= 0) { say("Die Vitrine ist voll mit Kuchen."); return; }
      if (!have) { say("Kein Kuchen in der Küche. " + N() + " backt hier in der Backstube einen."); cfStartBake(); return; }
      var n = Math.min(have, room); garden.harvest.cake -= n; for (var q = 0; q < n; q++) CL.push({ k: "moehre", n: 4 }); C_.cakes = CL.length; if (typeof renderFoods === "function") renderFoods();
      cfHamSet({ paws: "up", eyes: "happy", mouth: "grin" }); beep([[659, .05], [784, .05], [988, .08]]); setTimeout(function () { cfHamSet({}); }, 900);
      say(N() + " stellt " + (n === 1 ? "einen Kuchen" : n + " Kuchen") + " in die Vitrine."); cfStock(); if (window.SudokuSave) window.SudokuSave(); return;
    }
    if (C_[k === "coffee" ? "cof" : "tea"] >= 3) { say("Es stehen schon drei " + (k === "coffee" ? "Kaffee" : "Tee") + " bereit." + (k === "tea" ? " Im Teebuch auf dem Tisch kannst du trotzdem blättern." : "")); return; }
    (k === "coffee" ? coffeeGame : teaGame)();
  });
  // baking starts at the work table in the corner: he walks over first
  var cfBakeWalk = false;
  function cfStartBake() {
    if (cfBakeWalk) return; cfBakeWalk = true;
    cfGlide(cfScroll.scrollWidth - cfScroll.clientWidth, 700);
    say(N() + " geht zum Backtisch.");
    cfHamJob(function () { return cfHamGo([452, 114]); }).then(function () { cfBakeWalk = false; if (cafeOn && !cfGameOn) { cfHamSet({ eyes: "happy", mouth: "grin" }); bakeGame(); } });
  }
  var cfGameOn = false;
  var cfHome = null;   // { el, bg, done(kind, stars, title), quit() }: set while Gaston makes a coffee or a tea at home
  // the tap that closes a close-up must not land on the café behind it (the counter, a guest, the door ...)
  // the favourites card at home: a few blends you liked, instead of the whole shelf
  function cfFavCard(G_, title, list, onPick) {
    var card = document.createElement("div"); card.className = "fi-card cf-favs";
    card.innerHTML = '<div class="fi-c"><p class="fi-h">' + title + '</p><div class="cf-favgrid">' + list.map(function (f, i) { return '<button type="button" class="cf-fav" data-i="' + i + '"><i style="background:' + f.c + '"></i><span>' + f.n + '</span></button>'; }).join("") + '</div></div>';
    G_.el.appendChild(card);
    card.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    card.addEventListener("click", function (e) { e.stopPropagation(); var b = e.target.closest(".cf-fav"); if (!b) return; card.remove(); beep([[523, .04], [659, .05]]); onPick(list[+b.dataset.i]); });
  }
  function cfSwallow() {
    var t0 = performance.now();
    function eat(e) { if (performance.now() - t0 < 700) { e.stopPropagation(); e.preventDefault(); } document.removeEventListener("click", eat, true); }
    document.addEventListener("click", eat, true);
    setTimeout(function () { document.removeEventListener("click", eat, true); }, 700);
  }
  function cfGameEl(title) {
    var el = document.createElement("div"); el.className = "bee-pov cf-game";
    el.innerHTML = '<canvas width="180" height="135"></canvas><b class="bp-ban cf-ban"></b><div class="cf-gauge"></div><button type="button" class="bp-x" aria-label="Abbrechen">×</button>';
    (cfHome ? cfHome.el : cafeEl).appendChild(el); cfGameOn = true;
    var cv = el.querySelector("canvas"), c = cv.getContext("2d"); c.imageSmoothingEnabled = false;
    var ban = el.querySelector(".cf-ban"); function banner(t) { if (ban.textContent === t) return; ban.textContent = t; ban.classList.remove("pop"); void ban.offsetWidth; ban.classList.add("pop"); }
    banner(title);
    // a moment after each finished step: input pauses, a few sparkles show what was just done, then the next scene comes
    var fx = document.createElement("canvas"); fx.width = 180; fx.height = 135; fx.className = "cf-fx"; el.insertBefore(fx, el.children[1]);
    var fc = fx.getContext("2d"), sparks = [], fxRaf = 0, lockUntil = 0;
    function cfStar(c, x, y, st) {               // the beehive's sparkle: gold arms, a white core; st 1..3 = small, middle, full
      c.fillStyle = "#ffd34a";
      if (st === 3) { c.fillRect(x, y - 3, 1, 7); c.fillRect(x - 3, y, 7, 1); c.fillRect(x - 1, y - 1, 3, 3); c.fillStyle = "#ffffff"; c.fillRect(x, y - 1, 1, 3); c.fillRect(x - 1, y, 3, 1); }
      else if (st === 2) { c.fillRect(x, y - 2, 1, 5); c.fillRect(x - 2, y, 5, 1); c.fillStyle = "#ffffff"; c.fillRect(x, y, 1, 1); }
      else { c.fillRect(x, y - 1, 1, 3); c.fillRect(x - 1, y, 3, 1); c.fillStyle = "#ffffff"; c.fillRect(x, y, 1, 1); }
    }
    function fxLoop() {
      var now = performance.now(); fc.clearRect(0, 0, 180, 135);
      sparks = sparks.filter(function (s) { return now - s.t0 < s.life; });
      sparks.forEach(function (s) {
        var u = (now - s.t0) / s.life; if (u < 0) return; var x = Math.round(s.x + s.vx * u), y = Math.round(s.y + s.vy * u - Math.sin(u * Math.PI) * 4);
        cfStar(fc, x, y, u < .2 || u > .75 ? 1 : u < .35 || u > .6 ? 2 : 3);
      });
      fc.globalAlpha = 1;
      fxRaf = sparks.length ? requestAnimationFrame(fxLoop) : 0;
    }
    function spark(x, y, n, spread) {
      var now = performance.now(); n = n || 8; spread = spread || 18;
      for (var i = 0; i < n; i++) { var a = i / n * 6.283 + Math.random() * .5; sparks.push({ x: x, y: y, vx: Math.cos(a) * spread * (.6 + Math.random() * .5), vy: Math.sin(a) * spread * .7 * (.6 + Math.random() * .5), t0: now + i * 30, life: 650 + Math.random() * 250, c: i % 2 ? "#f6c84a" : "#fff0a0" }); }
      if (!fxRaf) fxRaf = requestAnimationFrame(fxLoop);
    }
    function hold(ms) { lockUntil = performance.now() + ms; }
    ["pointerdown", "pointermove"].forEach(function (tp) { el.addEventListener(tp, function (e) { if (performance.now() < lockUntil && e.target === cv) { e.stopImmediatePropagation(); } }, true); });
    // pause(ms, fn, x, y): a step is done; show it for a moment, then go on
    function pause(ms, fn, x, y) { hold(ms); if (x != null) spark(x, y); setTimeout(function () { if (el.parentNode) fn(); }, ms); }
    return { el: el, cv: cv, c: c, banner: banner, spark: spark, hold: hold, pause: pause, gauge: el.querySelector(".cf-gauge"), close: function () { cfGameOn = false; cancelAnimationFrame(fxRaf); el.remove(); cfSwallow(); if (cfHome && !cfHome.finished && cfHome.quit) cfHome.quit(); } };
  }
  function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
  function disc(c, cx, cy, r, col) { c.fillStyle = col; for (var y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) { var h = r * r - (y + .5 - cy) * (y + .5 - cy); if (h <= 0) continue; var w = Math.sqrt(h); c.fillRect(Math.round(cx - w), y, Math.round(2 * w) || 1, 1); } }
  function table(c) {
    for (var y = 0; y < 135; y++) R(c, 0, y, 180, 1, y % 9 === 0 ? "#8a5a30" : (Math.floor(y / 9) % 2 ? "#b8804c" : "#c08a50"));
    for (var k = 0; k < 40; k++) R(c, (k * 53) % 180, (k * 37) % 135, 3, 1, "#a06a38");
  }
  function starsAt(c, n, cx, cy) {
    for (var i = 0; i < 3; i++) { var x = cx - 14 + i * 14, col = i < n ? "#f6c84a" : "#8a7a6a";
      [[0, -3], [-1, -2], [0, -2], [1, -2], [-3, -1], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [3, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [-2, 2], [-1, 2], [1, 2], [2, 2]].forEach(function (p) { R(c, x + p[0] * 1.5, cy + p[1] * 1.5, 2, 2, col); }); }
  }
  function cfFinish(G_, kind, stars, title) {
    if (cfHome) {   /* at home: no café counter, the cup goes to the hamster */
      var h = cfHome; G_.banner(title); beep(stars === 3 ? [[1047, .1], [1319, .1], [1568, .22]] : [[880, .12], [1047, .2]]); h.finished = true;
      setTimeout(function () { G_.el.addEventListener("pointerdown", function () { G_.close(); h.done(kind, stars, title); }, { once: true }); }, 500); return;
    }
    G_.banner(title); var C_ = cfL(); C_[kind] = Math.min(3, (C_[kind] || 0) + 1); cfStock(); if (window.SudokuSave) window.SudokuSave();
    beep(stars === 3 ? [[1047, .1], [1319, .1], [1568, .22]] : [[880, .12], [1047, .2]]);
    cfHamSet({ paws: "up", eyes: "happy", mouth: "grin" }); setTimeout(function () { cfHamSet({}); }, 1400);
    setTimeout(function () { G_.el.addEventListener("pointerdown", function () { G_.close(); }, { once: true }); }, 500);
  }
  // coffee: hold to pour the milk until the foam is just right, then pull through it for a heart
  function coffeeGame() {
    var G_ = cfGameEl("Milch eingießen"), c = G_.c, CX = 104, CY = 70, CR = 31, r = 0, pour = false, phase = "pour", swipe = [], heart = null, stars = 0, raf = 0, t0 = performance.now();
    var ZONE = [.55, .78];
    function gauge() { G_.gauge.innerHTML = woodBarSvg({ w: 60, vertical: true, up: true, frac: r / CR, zone: ZONE, col: function () { return "#f6efe2"; } }); }
    function draw(t) {
      table(c);
      disc(c, CX + 3, CY + 4, 52, "rgba(58,36,20,.25)"); disc(c, CX, CY, 51, "#3a2414"); disc(c, CX, CY, 50, "#fffaf0"); disc(c, CX + 6, CY + 6, 44, "#efe6d4"); disc(c, CX, CY, 42, "#fffaf0");
      R(c, CX + 34, CY - 6, 16, 12, "#3a2414"); R(c, CX + 35, CY - 5, 14, 10, "#fffaf0"); R(c, CX + 38, CY - 2, 8, 4, "#e8dcc8");
      disc(c, CX, CY, 37, "#3a2414"); disc(c, CX, CY, 36, "#ffffff"); disc(c, CX, CY, CR + 1, "#3a2414"); disc(c, CX, CY, CR, "#a8683a"); disc(c, CX, CY, CR - 2, "#6a4026");
      for (var k = 0; k < 30; k++) { var a = k * 2.4, d = (k * 7) % (CR - 4); R(c, CX + Math.cos(a) * d, CY + Math.sin(a) * d, 1, 1, "#7a4a2e"); }
      if (heart) {
        var hr = heart.r, hx = heart.x;
        disc(c, hx - hr * .48, CY - hr * .2, hr * .62, "#c89a6a"); disc(c, hx + hr * .48, CY - hr * .2, hr * .62, "#c89a6a");
        disc(c, hx - hr * .48, CY - hr * .22, hr * .56, "#fff6e4"); disc(c, hx + hr * .48, CY - hr * .22, hr * .56, "#fff6e4");
        for (var yy = 0; yy < hr * 1.3; yy++) { var w = (hr * 1.05) * (1 - yy / (hr * 1.3)); R(c, hx - w, CY + yy - hr * .2, Math.max(1, 2 * w), 1, "#fff6e4"); }
        swipe.forEach(function (p) { if (Math.hypot(p[0] - CX, p[1] - CY) < CR - 2) R(c, p[0], p[1], 1, 1, "#c89a6a"); });
      } else if (r > 0) {
        var wob = Math.sin(t / 140) * .6; disc(c, CX, CY, r + 1 + wob, "#c89a6a"); disc(c, CX, CY, r + wob, "#fff6e4"); disc(c, CX - r * .3, CY - r * .3, r * .3, "#ffffff");
      }
      if (pour) { R(c, CX - 1, 6, 2, CY - 6, "#fff6e4"); R(c, CX - 10, 0, 20, 8, "#c4c4cc"); R(c, CX - 10, 7, 20, 1, "#8a8a96"); R(c, CX - 2, 6, 4, 3, "#c4c4cc"); }
      if (phase === "swipe") { var on = Math.floor(t / 300) % 2; R(c, CX - 1, CY - r - 10 - on * 2, 3, 3, "#f6c84a"); R(c, CX - 1, CY + r + 6 + on * 2, 3, 3, "#f6c84a"); }
      if (phase === "done") starsAt(c, stars, 104, 124);
      if (phase !== "gone") raf = requestAnimationFrame(draw);
    }
    var last = performance.now();
    (function grow(t) { if (phase === "gone") return; var dt = (t - last) / 1000; last = t; if (pour && phase === "pour") { r = Math.min(CR + 2, r + dt * 7.5); gauge(); if (r >= CR) { pour = false; release(); } } requestAnimationFrame(grow); })(last);
    function release() {
      if (phase !== "pour") return; pour = false;
      if (r < 5) return;
      phase = "swipe"; G_.banner("Jetzt durchziehen");
    }
    G_.cv.addEventListener("pointerdown", function (e) { e.preventDefault(); if (phase === "pour") { pour = true; beep([[300, .03]]); } else if (phase === "swipe") { swipe = [pt(e)]; } });
    G_.cv.addEventListener("pointermove", function (e) { if (phase === "swipe" && swipe.length) swipe.push(pt(e)); });
    window.addEventListener("pointerup", function up() {
      if (phase === "pour" && pour) { release(); return; }
      if (phase === "swipe" && swipe.length > 3) {
        var ys = swipe.map(function (p) { return p[1]; }), xs = swipe.map(function (p) { return p[0]; });
        var span = Math.max.apply(null, ys) - Math.min.apply(null, ys), avgx = xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
        var size = r / CR, s1 = size >= ZONE[0] && size <= ZONE[1] ? 1 : 0, s2 = Math.abs(avgx - CX) < r * .35 ? 1 : 0, s3 = span > r * 1.6 ? 1 : 0;
        stars = Math.max(1, s1 + s2 + s3); heart = { r: r, x: CX + Math.max(-r * .3, Math.min(r * .3, avgx - CX)) }; phase = "done";
        window.removeEventListener("pointerup", up);
        cfFinish(G_, "cof", stars, stars === 3 ? "Ein perfektes Herz!" : "Cappuccino fertig!");
      } else if (phase === "swipe") swipe = [];
    });
    function pt(e) { var b = G_.cv.getBoundingClientRect(); return [(e.clientX - b.left) / b.width * 180, (e.clientY - b.top) / b.height * 135]; }
    G_.el.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); phase = "gone"; cancelAnimationFrame(raf); G_.close(); });
    gauge(); raf = requestAnimationFrame(draw);
  }
  // tea: the colour deepens while the bag steeps; tap in time to lift it out
  function teaGame() {
    var G_ = cfGameEl("Tee ziehen lassen"), c = G_.c, st = 0, phase = "steep", lift = 0, stars = 0, raf = 0, last = performance.now();
    var ZONE = [.45, .65];
    function lerp(a, b, k) { var A_ = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), o = 0; for (var i = 0; i < 3; i++) { var sh = 16 - i * 8, x = (A_ >> sh) & 255, y = (B >> sh) & 255; o = o * 256 + Math.round(x + (y - x) * k); } return "#" + ("000000" + o.toString(16)).slice(-6); }
    function teaCol(k) { return k < .45 ? lerp("#eef4f6", "#e0a048", k / .45) : lerp("#e0a048", "#5a2a10", (k - .45) / .55); }
    function gauge() { G_.gauge.innerHTML = woodBarSvg({ w: 60, vertical: true, up: true, frac: st, zone: ZONE, col: function (t) { return teaCol(t); } }); }
    function draw(t) {
      var dt = (t - last) / 1000; last = t;
      if (phase === "steep") { st = Math.min(1, st + dt / 9); gauge(); }
      if (phase !== "steep") lift = Math.min(1, lift + dt * 2.5);
      table(c);
      R(c, 52, 108, 104, 6, "rgba(58,36,20,.25)");
      R(c, 60, 46, 72, 64, "#3a2414"); R(c, 61, 47, 70, 62, "#e8f4f8");            // the glass
      R(c, 132, 58, 12, 4, "#3a2414"); R(c, 140, 58, 4, 30, "#3a2414"); R(c, 132, 84, 12, 4, "#3a2414"); R(c, 133, 59, 10, 2, "#e8f4f8"); R(c, 141, 61, 2, 24, "#e8f4f8"); R(c, 133, 85, 10, 2, "#e8f4f8");
      var col = teaCol(st); R(c, 62, 58, 68, 50, col); R(c, 62, 58, 68, 1, lerp(col, "#ffffff", .4));
      R(c, 63, 50, 2, 56, "#ffffff");
      var by = 66 - lift * 46;                                                         // the tea bag on its string, tag over the rim
      R(c, 96, by, 14, 18, "#3a2414"); R(c, 97, by + 1, 12, 16, "#d8b080"); R(c, 97, by + 1, 12, 2, "#e8c898"); R(c, 102, by - 30 + lift * 0, 1, 30, "#f6f2ea");
      R(c, 102, 16 - lift * 10, 34, 1, "#f6f2ea"); R(c, 134, 16 - lift * 10, 10, 9, "#3a2414"); R(c, 135, 17 - lift * 10, 8, 7, "#e8554a"); R(c, 137, 19 - lift * 10, 4, 3, "#f6f2ea");
      if (phase === "steep") for (var k = 0; k < 6; k++) { var a = t / 400 + k; R(c, 103 + Math.cos(a) * (6 + k * 3), by + 18 + k * 4 + Math.sin(a * 1.3) * 2, 2, 1, lerp(col, "#5a2a10", .35)); }
      for (var s_ = 0; s_ < 4; s_++) { var sy = (t / 30 + s_ * 20) % 40; R(c, 74 + s_ * 13 + Math.sin((t / 300) + s_) * 2, 42 - sy, 1, 2, "rgba(255,255,255," + (1 - sy / 40).toFixed(2) + ")"); }
      if (lift > 0 && lift < 1) R(c, 103, by + 19, 1, 3, col);
      if (phase === "done") starsAt(c, stars, 96, 124);
      if (phase !== "gone") raf = requestAnimationFrame(draw);
    }
    G_.cv.addEventListener("pointerdown", function (e) {
      e.preventDefault(); if (phase !== "steep") return; phase = "lifted";
      var d = Math.abs(st - (ZONE[0] + ZONE[1]) / 2); stars = st >= ZONE[0] && st <= ZONE[1] ? (d < .05 ? 3 : 2) : 1; beep([[523, .04], [659, .05]]);
      setTimeout(function () { phase = "done"; cfFinish(G_, "tea", stars, stars === 3 ? "Genau richtig!" : st < ZONE[0] ? "Ein milder Tee" : st > ZONE[1] ? "Ein kräftiger Tee" : "Tee ist fertig!"); }, 450);
    });
    G_.el.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); phase = "gone"; cancelAnimationFrame(raf); G_.close(); });
    gauge(); raf = requestAnimationFrame(draw);
  }
  window.__cfFeed = function (k) { if (busy) interrupt(); act("feed", function () { return feedSeq(k); }); };
  window.__cfHat = function (k) { CF_HAT = k; cfHamRender(); }; window.__cfPet = function () { cafePet(); };
  window.__cfh = function () { return { x: CFH.x, y: CFH.y, busy: CFH.busy, q: CFH.q.length }; }; window.__hamTest = function (to, sl) { cfScroll.scrollLeft = sl / CF.w * cfScroll.scrollWidth; cfHamJob(function () { var tr = cfTray(CF.spr.cof.svg, 8, 8); cfHold(tr.svg, tr.w, tr.h, true); return cfHamGo(to); }); };
  window.__cafe = { where: function () { return place2; }, stock: function () { return cfL(); }, game: function (k) { (k === 'tea' ? teaGame : coffeeGame)(); }, open: function () { if (busy) interrupt(); act("travel", function () { return travelTo("cafe"); }); }, close: function () { act("inside", kitchenFromCafe); }, leave: leaveCafe, seq: cafeSeq, on: function () { return cafeOn; } };
