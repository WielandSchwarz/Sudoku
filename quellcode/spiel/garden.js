  // ===================== wild garden =====================
  var GD = /*GARDENDATA*/;
  var WBG = /*WILDBG*/;
  var WD = /*WILDDECOR*/;
  var ANIMALS = /*ANIMALSDATA*/;
  var SNAIL = '/*SNAILSVG*/';
  var GA = GD.art;
  for (var gk in GA) if (GA[gk].svg) { A[gk] = GA[gk].svg; SZ[gk] = [GA[gk].w, GA[gk].h]; }
  for (var wk in WD.art) { A[wk] = WD.art[wk].svg; SZ[wk] = [WD.art[wk].w, WD.art[wk].h]; }
  var gardenEl = document.getElementById("garden"), roomEl = document.getElementById("room");
  var place2 = "room";
  function hamHidden() { var r = document.getElementById("ham-root"); return document.getElementById("scr-hamster").hidden || !!(r && r.hidden); }
  function gEl(id) { return document.getElementById(id); }
  function $g(i) { return document.getElementById(i) || document.createElement("div"); }

  // ---- layout (grid units) ----
  var GL = { bed: { x: 42, bottom: 116 }, basket: { x: 14, bottom: 126 }, deco: { x: 72, bottom: 93 }, pile: { x: 134, bottom: 107 } };
  var MSPOT = [{ x: 164, bottom: 133 }, { x: 118, bottom: 98 }, { x: 22, bottom: 97 }];
  var GSPOT = { home: { x: 140, y: 122 }, door: { x: -24, y: 103 }, pile: { x: 124, y: 114 }, meet: { x: 80, y: 128 } };
  var BED_W = 66;
  // the bed's footprint on the ground: nobody walks across it, only around it
  var BR = { x0: GL.bed.x - 6, x1: GL.bed.x + BED_W + 6, y0: GL.bed.bottom - 20, y1: GL.bed.bottom + 5 };
  function inBed(x, y) { return x > BR.x0 + 0.5 && x < BR.x1 - 0.5 && y > BR.y0 + 0.5 && y < BR.y1 - 0.5; }
  function outside(x, y) {
    if (!inBed(x, y)) return { x: x, y: y };
    var d = [[x - BR.x0, BR.x0, y], [BR.x1 - x, BR.x1, y], [y - BR.y0, x, BR.y0], [BR.y1 - y, x, BR.y1]].sort(function (a, b) { return a[0] - b[0]; })[0];
    return { x: d[1], y: d[2] };
  }
  function segOk(a, b) { for (var i = 1; i < 40; i++) { var t = i / 40; if (inBed(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)) return false; } return true; }
  function route(a, b) {
    if (segOk(a, b)) return [b];
    var C = [{ x: BR.x0, y: BR.y0 }, { x: BR.x1, y: BR.y0 }, { x: BR.x1, y: BR.y1 }, { x: BR.x0, y: BR.y1 }], best = null, bl = 1e9;
    function len(p) { var l = 0, q = a; p.forEach(function (r) { l += Math.hypot(r.x - q.x, r.y - q.y); q = r; }); return l; }
    function tryP(p) { var q = a; for (var i = 0; i < p.length; i++) { if (!segOk(q, p[i])) return; q = p[i]; } var l = len(p); if (l < bl) { bl = l; best = p; } }
    C.forEach(function (c, i) { tryP([c, b]); tryP([c, C[(i + 1) % 4], b]); tryP([c, C[(i + 3) % 4], b]); });
    return best || [b];
  }
  var _walkTo = walkTo;
  walkTo = async function (x, y, speed) {
    if (place2 !== "garden") return _walkTo(x, y, speed);
    var pts = route({ x: H.x, y: H.y }, outside(x, y));
    for (var i = 0; i < pts.length; i++) await _walkTo(pts[i].x, pts[i].y, speed);
  };
  // whoever stands further forward is drawn in front: z-index follows the feet
  function depthOf(el) { var b = parseFloat(getComputedStyle(el).bottom), h = gardenEl.clientHeight || 1; return Math.round(GH - b / h * GH); }
  setInterval(function () {
    if (place2 !== "garden") return;
    ham.style.zIndex = depthOf(ham);
    if (visitor) visitor.el.style.zIndex = depthOf(visitor.el);
  }, 60);
  var curSpot = 0;

  // ---- seasons ----
  var seasonOverride = null;
  function season() {
    if (seasonOverride) return seasonOverride;
    var d = new Date(), v = (d.getMonth() + 1) * 100 + d.getDate();
    if (v >= 321 && v < 621) return "spring";
    if (v >= 621 && v < 923) return "summer";
    if (v >= 923 && v < 1221) return "autumn";
    return "winter";
  }
  var SEASON = {
    spring: { L1: "#6fbf5a", L2: "#4e9a3e", L3: "#a8e08a", L4: "#ffc0d0", SN: "none", sky: ["#bfe3f7", "#e4f4fc"] },
    summer: { L1: "#4e9a3e", L2: "#3a7a30", L3: "#7cc06a", L4: "#e8554a", SN: "none", sky: ["#8fd0f4", "#d8f0fc"] },
    autumn: { L1: "#c8a03a", L2: "#9a7a2c", L3: "#e8c060", L4: "#a83a28", SN: "none", sky: ["#b8d4e4", "#efe8dc"] },
    winter: { L1: "#8a9a86", L2: "#6e7e6a", L3: "#c8d2c4", L4: "#c8d4e0", SN: "none", sky: ["#c8d8e6", "#eef2f6"] }
  };
  var PH = { L1: "#0a0001", L2: "#0a0002", L3: "#0a0003", L4: "#0a0004", SN: "#0a0031" };
  function tint(str) { var p = SEASON[season()]; for (var k in PH) str = str.split(PH[k]).join(p[k]); return str; }

  // ---- garden decor joins the catalog: three meadow spots, one deco spot, the bed ----
  var GCATS = { meadow: "Wiese", deco: "Deko", bed: "Beet" };
  function buildGardenFurn() {
    FURN.meadow = WD.meadow.map(function (x) { var a = WD.art["m_" + x[0]]; return { id: x[0], name: x[1], w: a.w, h: a.h, svg: tint(a.svg) }; });
    FURN.deco = WD.deco.map(function (x) { var a = WD.art["d_" + x[0]]; return { id: x[0], name: x[1], w: a.w, h: a.h, svg: tint(a.svg) }; });
    FURN.bed = GD.beds.map(function (x) { var a = GA["bed_" + x[0]]; return { id: x[0], name: x[1], w: a.w, h: a.h, svg: a.svg, soil: x[2] }; });
  }
  buildGardenFurn();
  for (var gc in GCATS) CATS[gc] = GCATS[gc];
  var ROOM_CATS = ["chair", "clock", "shelf", "plant", "wall", "floor"], GARDEN_CATS = ["meadow", "deco", "bed"];
  var TOTAL_ITEMS = 0; for (var fc in FURN) TOTAL_ITEMS += FURN[fc].length;
  function gardenDefaults() {
    home.owned.meadow = ["poppies"]; home.owned.deco = ["log"]; home.owned.bed = ["wood"];
    home.placed.meadow0 = "poppies"; home.placed.meadow1 = null; home.placed.meadow2 = null; home.placed.meadow = "poppies";
    home.placed.deco = "log"; home.placed.bed = "wood";
  }
  gardenDefaults();
  var _resetHome = resetHome; resetHome = function () { _resetHome(); gardenDefaults(); };

  // ---- bed state ----
  var CROPS = {}; GD.crops.forEach(function (c) { CROPS[c[0]] = { name: c[1], hours: c[2] }; });
  var garden = { plots: [null, null, null], seeds: { strawberry: 2, cucumber: 1, dandelion: 2, sunflower: 1 }, harvest: { strawberry: 0, cucumber: 0, dandelion: 0, sunflower: 0, nut: 0 }, snow: 0, t: Date.now() };
  function stage(p) { return p.prog >= 1 ? 3 : p.prog >= 0.5 ? 2 : p.prog >= 0.12 ? 1 : 0; }
  function growGarden(h) {
    garden.plots.forEach(function (p) {
      if (!p) return;
      var wet = Math.max(0, Math.min(h, (p.wetUntil - garden.t) / 3600000));
      p.prog = Math.min(1, p.prog + (h + wet) / CROPS[p.crop].hours);
    });
  }
  function tickGarden() {
    var now = Date.now(), h = Math.max(0, (now - garden.t) / 3600000); growGarden(h); garden.t = now;
    if (growSnow(h) && place2 === "garden") renderGardenDecor();
    if (place2 === "garden") renderBed();
  }
  setInterval(tickGarden, 20000);
  // hours left, counting the faster growth while the soil is wet
  function hoursLeft(p) {
    var need = (1 - p.prog) * CROPS[p.crop].hours, wet = Math.max(0, (p.wetUntil - Date.now()) / 3600000);
    return need <= 2 * wet ? need / 2 : wet + (need - 2 * wet);
  }
  function fmtH(h) { var m = Math.max(1, Math.round(h * 60)); return m < 60 ? m + "\u00a0min" : Math.floor(m / 60) + "\u00a0h\u00a0" + String(m % 60).padStart(2, "0"); }

  // ---- snow settles on plants and objects in winter; tap them and the hamster sweeps it off ----
  var SNOW_KEYS = ["meadow0", "meadow1", "meadow2", "deco", "bed", "basket"];
  garden.snowLv = {}; garden.snowAcc = 0;
  function growSnow(h) {
    if (season() !== "winter") { var had = SNOW_KEYS.some(function (k) { return garden.snowLv[k]; }); garden.snowLv = {}; garden.snowAcc = 0; return had; }
    garden.snowAcc += h; var steps = Math.floor(garden.snowAcc / 0.33); if (!steps) return false;
    garden.snowAcc -= steps * 0.33;
    SNOW_KEYS.forEach(function (k) { garden.snowLv[k] = Math.min(3, (garden.snowLv[k] || 0) + steps); });
    return true;
  }
  function snowInit() { if (season() === "winter" && !garden.snowSeen) { garden.snowSeen = true; SNOW_KEYS.forEach(function (k) { garden.snowLv[k] = 2; }); } if (season() !== "winter") garden.snowSeen = false; }
  var snowCache = {};
  // read the art's top edge column by column and pile snow on it
  function snowArt(art, w, h, lv, unit) {
    if (!lv) return "";
    var key = lv + "|" + unit + "|" + art.length + "|" + art.slice(-40); if (snowCache[key]) return snowCache[key];
    var top = new Array(w).fill(99), re = /fill="([^"]+)" d="([^"]+)"/g, m;
    while ((m = re.exec(art))) {
      if (m[1] === "none" || m[1] === PH.SN) continue;
      var r2 = /M(\d+) (\d+)h(\d+)/g, q;
      while ((q = r2.exec(m[2]))) { var x0 = +q[1], y = +q[2], n = +q[3]; for (var x = x0; x < x0 + n && x < w; x++) if (y < top[x]) top[x] = y; }
    }
    var th = top.map(function (t, x) { return t === 99 ? 0 : lv * unit + ((x * 7 + lv * 3) % 5 === 0 ? 1 : 0) - ((x * 3) % 7 === 0 ? 1 : 0); });
    var sm = th.map(function (t, x) {
      if (!t) return 0;
      var a = [t]; [-1, 1].forEach(function (d) { if (th[x + d] && Math.abs(top[x + d] - top[x]) <= 2) a.push(th[x + d]); });
      return Math.max(1, Math.round(a.reduce(function (p, c) { return p + c; }, 0) / a.length));
    });
    var wh = "", sh = "", hi = "", ed = "";
    sm.forEach(function (t, x) {
      if (!t) return;
      var y0 = top[x] - t;
      ed += "M" + x + " " + (y0 - 1) + "h1v1h-1z";
      if (sm[x - 1] !== undefined && sm[x - 1] && top[x - 1] - sm[x - 1] > y0) ed += "M" + (x - 1) + " " + y0 + "h1v" + Math.min(t, top[x - 1] - sm[x - 1] - y0) + "h-1z";
      if (sm[x + 1] !== undefined && sm[x + 1] && top[x + 1] - sm[x + 1] > y0) ed += "M" + (x + 1) + " " + y0 + "h1v" + Math.min(t, top[x + 1] - sm[x + 1] - y0) + "h-1z";
      if (!sm[x - 1]) ed += "M" + (x - 1) + " " + y0 + "h1v" + t + "h-1z";
      if (!sm[x + 1]) ed += "M" + (x + 1) + " " + y0 + "h1v" + t + "h-1z";
      if (t > 1) wh += "M" + x + " " + y0 + "h1v" + (t - 1) + "h-1z";
      sh += "M" + x + " " + (top[x] - 1) + "h1v1h-1z";
      if (t > 2 && x % 4 === 1) hi += "M" + x + " " + y0 + "h1v1h-1z";
    });
    var out = '<path fill="#8ea4be" d="' + ed + '"/><path fill="#ffffff" d="' + wh + '"/><path fill="#d6e2ee" d="' + sh + '"/><path fill="#c3d3e6" d="' + hi + '"/>';
    snowCache[key] = out; return out;
  }
  var SNOW_PAD = 8;
  function snowySVG(art, w, h, k, unit) {
    var lv = garden.snowLv[k] || 0;
    return '<svg viewBox="0 -' + SNOW_PAD + ' ' + w + ' ' + (h + SNOW_PAD) + '" aria-hidden="true">' + art + snowArt(art, w, h, lv, unit) + '</svg>';
  }
  var SNOW_SPOT = function (k) {
    if (k.indexOf("meadow") === 0) { var m = MSPOT[+k.slice(6)]; return { x: m.x > 100 ? m.x - 24 : m.x + 24, y: m.bottom + 2, fx: m.x, fy: m.bottom - 20 }; }
    if (k === "deco") return { x: GL.deco.x + 24, y: GL.deco.bottom + 3, fx: GL.deco.x, fy: GL.deco.bottom - 16 };
    if (k === "bed") return { x: GL.bed.x + 33, y: BR.y0, fx: GL.bed.x + 33, fy: GL.bed.bottom - 22 };
    return { x: GL.basket.x + 34, y: GL.basket.bottom + 1, fx: GL.basket.x + 11, fy: GL.basket.bottom - 18 };
  };
  var SNOW_NAME = { deco: "von der Deko", bed: "vom Beet", basket: "vom Erntekorb" };
  function trySweep(k) {
    if (decor || season() !== "winter" || !(garden.snowLv[k] > 0)) return false;
    if (s.asleep) { say(N() + " schläft gerade."); return true; }
    if (busy && !interruptible()) return true; if (busy) interrupt();
    act("sweep", async function () {
      var sp = SNOW_SPOT(k); await walkTo(sp.x, sp.y); H.dir = sp.fx < H.x ? -1 : 1;
      var nm = k.indexOf("meadow") === 0 ? "von den " + (item("meadow", home.placed[k]) || { name: "Pflanzen" }).name : SNOW_NAME[k];
      say(N() + " fegt den Schnee " + nm + ".");
      for (var i = 0; i < 6; i++) {
        front({ paws: i % 2 ? "wash_r" : "wash_l", eyes: "happy", mouth: i % 2 ? "teeth" : "grin" }); body(i % 2 ? "lean-r" : "lean-l");
        for (var j = 0; j < 2; j++) fx("snowflake", sp.fx + rnd(-10, 10), sp.fy + rnd(-6, 4), "pop", 1.6);
        if (i % 2) { garden.snowLv[k] = Math.max(0, garden.snowLv[k] - 1); k === "bed" ? renderBed() : renderGardenDecor(); }
        await wait(230);
      }
      garden.snowLv[k] = 0; k === "bed" ? renderBed() : renderGardenDecor();
      body(""); front({ paws: "up", eyes: "happy", mouth: "grin", blush: true }); pulse("hop", 420); await wait(500); front({ paws: "down" });
    });
    return true;
  }

  // ---- building the garden ----
  function layoutGarden() {
    var se = season();
    gardenEl.className = "garden season-" + se;
    gEl("g-bg").src = WBG["bg_" + se]; gEl("g-fg").src = WBG["fg_" + se];
    var pile = gEl("g-pile"); place(pile, GL.pile.x, GL.pile.bottom - 12, 34); pile.innerHTML = svgOf(A.leafpile, 34, 12); pile.hidden = se !== "autumn";
    var sh = gEl("g-snowham"); place(sh, GL.pile.x + 8, GL.pile.bottom - 24, 18); sh.hidden = se !== "winter" || !garden.snow;
    if (!sh.hidden) sh.innerHTML = svgOf(A["snowham" + (garden.snow - 1)], 18, 24);
    pile.style.zIndex = GL.pile.bottom; sh.style.zIndex = GL.pile.bottom + 1;
    snowInit(); renderGardenDecor(); renderBed(); gardenSky();
  }
  function renderGardenDecor() {
    MSPOT.forEach(function (m, i) {
      var el = gEl("slot-meadow" + i), id = home.placed["meadow" + i], it = id && item("meadow", id);
      el.style.left = gx(m.x - 13); el.style.bottom = gb(m.bottom); el.style.width = gx(26);
      el.innerHTML = it ? snowySVG(it.svg, it.w, it.h, "meadow" + i, 3) : '<div class="empty">+</div>';
      el.style.zIndex = m.bottom;
    });
    var d = gEl("slot-deco"), did = home.placed.deco, dit = did && item("deco", did);
    d.style.left = gx(GL.deco.x - (dit ? dit.w : 30) / 2); d.style.bottom = gb(GL.deco.bottom); d.style.width = gx(dit ? dit.w : 30);
    d.innerHTML = dit ? snowySVG(dit.svg, dit.w, dit.h, "deco", 2) : '<div class="empty">+</div>';
    d.classList.toggle("lantern", did === "lantern"); d.style.zIndex = GL.deco.bottom;
    var b = gEl("g-basket"); place(b, GL.basket.x, GL.basket.bottom - 18, 22); b.style.zIndex = GL.basket.bottom;
    var tot = Object.keys(garden.harvest).reduce(function (a, k) { return a + garden.harvest[k]; }, 0);
    b.innerHTML = snowySVG(A["basket" + (tot === 0 ? 0 : tot < 4 ? 1 : 2)], 22, 18, "basket", 2) + (tot ? '<span class="bcount">' + tot + '</span>' : "");
    b.style.top = ""; b.style.bottom = gb(GL.basket.bottom);
  }
  function bedItem() { return item("bed", home.placed.bed) || FURN.bed[0]; }
  function plotX(i) { return GL.bed.x + 12 + i * 21; }
  function renderBed() {
    var b = bedItem(), el = gEl("slot-bed");
    el.style.left = gx(GL.bed.x); el.style.bottom = gb(GL.bed.bottom); el.style.width = gx(b.w); el.style.zIndex = GL.bed.bottom;
    var h = svgOf(b.svg + snowArt(b.svg, b.w, b.h, garden.snowLv.bed || 0, 2), b.w, b.h);
    garden.plots.forEach(function (p, i) {
      var cz = p && SZ["crop_" + p.crop + stage(p)] || [12, 20], x = 12 + i * 21 - cz[0] / 2, y = b.soil + 4 - cz[1];
      var wet = p && p.wetUntil > Date.now();
      if (wet) h += '<i class="wetsoil" style="left:' + ((12 + i * 21 - 8) / b.w * 100) + '%;top:' + ((b.soil - 1) / b.h * 100) + '%;width:' + (16 / b.w * 100) + '%"></i>';
      h += '<div class="plot' + (p && stage(p) === 3 ? " ripe" : "") + '" style="left:' + (x / b.w * 100) + '%;top:' + (y / b.h * 100) + '%;width:' + (cz[0] / b.w * 100) + '%">' + (p ? svgOf(A["crop_" + p.crop + stage(p)], cz[0], cz[1]) : "") + '</div>';
    });
    el.innerHTML = h;
    // signs with picture, progress and time on the front of the bed
    gEl("g-signs").innerHTML = garden.plots.map(function (p, i) {
      var left = gx(plotX(i) - 9.5), top = gy(GL.bed.bottom + 2), w = gx(19);
      if (!p) return '<button type="button" class="sign empty" data-plot="' + i + '" style="left:' + left + ';top:' + top + ';width:' + w + '" aria-label="Beet ' + (i + 1) + ' bepflanzen"><span class="t">+ Samen</span></button>';
      var st = stage(p), ripe = st === 3, wet = p.wetUntil > Date.now();
      var icon = svgOf(A["f_" + p.crop], SZ["f_" + p.crop][0], SZ["f_" + p.crop][1]);
      return '<button type="button" class="sign' + (ripe ? " ripe" : "") + (wet ? " wet" : "") + '" data-plot="' + i + '" style="left:' + left + ';top:' + top + ';width:' + w + '" aria-label="' + CROPS[p.crop].name + (ripe ? ", reif" : ", noch " + fmtH(hoursLeft(p))) + '">' +
        '<span class="ic">' + icon + (wet ? '<i class="dropi"></i>' : "") + '</span><span class="t">' + (ripe ? "Reif!" : fmtH(hoursLeft(p))) + '</span><span class="bar"><i style="width:' + Math.round(p.prog * 100) + '%"></i></span></button>';
    }).join("");
  }
  function gardenSky() {
    var phase = daylight(), p = SEASON[season()], sky = gEl("g-sky");
    var top = phase === "night" ? "#1e2a52" : phase === "twilight" ? "#f4a878" : p.sky[0];
    var bot = phase === "night" ? "#34407a" : phase === "twilight" ? "#f8d8a8" : p.sky[1];
    sky.style.background = "linear-gradient(" + top + ", " + bot + ")";
    sky.classList.toggle("g-night", phase === "night"); sky.classList.toggle("g-eve", phase === "twilight");
    gardenEl.classList.toggle("is-night", phase !== "day");
  }
  var _skyTime = skyTime; skyTime = function () {
    _skyTime();
    if (place2 !== "garden") return;
    gardenSky(); document.getElementById("moon").classList.remove("on");
    var n = document.getElementById("night"), ph = daylight(), dark = ph === "night" ? 0.18 : ph === "twilight" ? 0.08 : 0;   // outside at night only a little darker
    var lantern = home.placed.deco === "lantern" && dark;
    n.style.background = lantern ? "radial-gradient(ellipse 30% 38% at " + (GL.deco.x / GW * 100) + "% " + ((GL.deco.bottom - 14) / GH * 100) + "%, rgba(255,210,130,.16) 0%, rgba(24,26,64," + dark * 0.8 + ") 55%, rgba(24,26,64," + dark + ") 100%)" : "rgba(24,26,64," + dark + ")";
    n.classList.toggle("on", dark > 0);
  };

  // ---- weather and small critters ----
  setInterval(function () {
    if (place2 !== "garden" || hamHidden()) return;
    var se = season(), ph = daylight(), layer = gEl("g-fx");
    if (se === "autumn" && Math.random() < 0.7) drop(pick(["leaf_a", "leaf_b", "leaf_c"]), "leaf");
    if (se === "winter") { drop("snowflake", "snow"); if (Math.random() < 0.6) drop("snowflake", "snow"); }
    if (se === "spring" && Math.random() < 0.3) drop("petal", "leaf");
    if ((se === "summer" || se === "spring") && ph === "day" && Math.random() < 0.08 && !layer.querySelector(".bfly")) butterfly();
    if (se === "summer" && ph === "night" && layer.querySelectorAll(".ffly").length < 6) firefly();
    function drop(k, cls) {
      var el = document.createElement("div"); el.className = "gfx " + cls;
      el.style.left = gx(rnd(0, 180)); el.style.top = gy(-4); el.style.width = gx(SZ[k][0] * 1.4);
      el.style.setProperty("--dx", rnd(-30, 30) + "px"); el.style.animationDuration = rnd(4, 7) + "s";
      el.innerHTML = svgOf(A[k], SZ[k][0], SZ[k][1]); layer.appendChild(el); setTimeout(function () { el.remove(); }, 7200);
    }
  }, 700);
  function butterfly() {
    var el = document.createElement("div"); el.className = "gfx bfly";
    el.style.left = gx(rnd(60, 150)); el.style.top = gy(rnd(70, 100)); el.style.width = gx(9);
    el.innerHTML = '<div class="bf">' + svgOf(A.butterfly0, 9, 7) + '</div>';
    gEl("g-fx").appendChild(el); setTimeout(function () { el.remove(); }, 14000);
    var moves = 0, mv = setInterval(function () { if (!el.isConnected || ++moves > 9) { clearInterval(mv); return; } el.style.left = gx(rnd(40, 170)); el.style.top = gy(rnd(64, 108)); }, 1400);
    return el;
  }
  function firefly() {
    var el = document.createElement("i"); el.className = "ffly"; el.style.left = rnd(5, 95) + "%"; el.style.top = rnd(45, 85) + "%"; el.style.animationDelay = rnd(0, 3) + "s";
    gEl("g-fx").appendChild(el); setTimeout(function () { el.remove(); }, 15000);
  }

  // ---- going outside and back in (left edge) ----
  function showPlace(p) {
    place2 = p;
    roomEl.hidden = p !== "room"; gardenEl.hidden = p !== "garden";
    if (p === "garden") gardenEl.insertBefore(ham, gEl("g-fg")); else { scene.insertBefore(ham, document.getElementById("thought")); ham.style.zIndex = ""; }
    document.getElementById("moon").hidden = p !== "room";
    closePop();
    if (p === "garden") layoutGarden(); else { if (visitor && !window.__EXTRAS) { visitor.el.remove(); visitor = null; } gEl("g-fx").innerHTML = ""; }
    if (decor) { curCat = p === "garden" ? "meadow" : "chair"; renderCatalog(); }
    renderScarfBtn(); if (H.sprite === "front") front();
    skyTime();
  }
  function fade(on) { ham.style.transition = (ham.style.transition ? ham.style.transition + ", " : "") + "opacity .35s"; ham.style.opacity = on ? "1" : "0"; }
  async function goGardenSeq() {
    if (H.where === "chair") await hopOutOfChair();
    await walkTo(SPOT.window.x, SPOT.window.y);
    var leaf = document.getElementById("door-leaf"); leaf.classList.add("open");
    front({ eyes: "happy", mouth: "smile" }); await wait(350);
    backFrame(0); await wait(300); fade(false); await wait(380);
    showPlace("garden"); leaf.classList.remove("open");
    H.scale = HS; moveTo(GSPOT.door.x, GSPOT.door.y, 0); fade(true);
    say(N() + " ist im Garten.");
    await walkTo(GSPOT.home.x, GSPOT.home.y);
    front({ eyes: "happy", mouth: "grin", paws: "up", blush: true }); pulse("bighop", 620); await wait(650);
    // every trip outside starts with a visitor; after that the normal timer runs
    setTimeout(function () { if (place2 === "garden" && !s.asleep) spawnVisitor(true); }, 800);
  }
  async function goInsideSeq() {
    if (place2 !== "garden") return;
    if (visitor && !window.__EXTRAS) leaveVisitor();
    await walkTo(GSPOT.door.x, GSPOT.door.y); fade(false); await wait(200);
    showPlace("room"); moveTo(SPOT.window.x, SPOT.window.y, 0);
    var leaf = document.getElementById("door-leaf"); leaf.classList.add("open"); front({ eyes: "open", mouth: "smile" }); fade(true); await wait(400);
    leaf.classList.remove("open"); await walkTo(SPOT.home.x, SPOT.home.y);
  }
  document.getElementById("win").addEventListener("click", function () { if (decor || s.asleep) return; if (busy && !interruptible()) return; if (busy) interrupt(); act("garden", goGardenSeq); });
  gEl("g-exit").addEventListener("click", function () { if (decor) return; if (busy && !interruptible()) return; if (busy) interrupt(); act("inside", goInsideSeq); });

  // ---- bed: signs, seed picker, info, water, harvest ----
  var pop = null;
  function closePop() { if (pop) { pop.remove(); pop = null; } }
  function openPop(html, x, y, cls) {
    closePop();
    pop = document.createElement("div"); pop.className = "gpop " + (cls || "");
    pop.innerHTML = html; gEl("g-ui").appendChild(pop);
    var left = Math.max(2, Math.min(GW - 66, x - 32));
    pop.style.left = gx(left); pop.style.bottom = gb(y);
    var me = pop; setTimeout(function () { if (pop === me) closePop(); }, 9000);
    return pop;
  }
  function plotTap(i) {
    if (decor) return;
    var p = garden.plots[i];
    if (!p) {
      var rows = Object.keys(CROPS).map(function (c) {
        return '<button type="button" class="seedrow" data-seed="' + c + '"' + (garden.seeds[c] ? "" : " disabled") + '>' + svgOf(A["seed_" + c], 8, 10) + '<span>' + CROPS[c].name + '</span><b>' + garden.seeds[c] + '</b></button>';
      }).join("");
      openPop('<p class="ph">Was soll wachsen?</p>' + rows + '<p class="pn">Samen gibt es fürs Sudoku-Lösen.</p>', plotX(i), GL.bed.bottom + 2).addEventListener("click", function (e) {
        var b = e.target.closest(".seedrow"); if (!b || b.disabled) return; closePop();
        if (s.asleep) { say(N() + " schläft gerade."); return; }
        if (busy && !interruptible()) return; if (busy) interrupt();
        act("plant", function () { return plantSeq(i, b.dataset.seed); });
      });
      return;
    }
    if (stage(p) === 3) { if (s.asleep) { say(N() + " schläft gerade."); return; } if (busy && !interruptible()) return; if (busy) interrupt(); act("harvest", function () { return harvestSeq(i); }); return; }
    var wet = p.wetUntil > Date.now();
    openPop('<p class="ph">' + svgOf(A["f_" + p.crop], SZ["f_" + p.crop][0], SZ["f_" + p.crop][1]) + CROPS[p.crop].name + '</p>' +
      '<p class="pl">Stufe ' + Math.max(1, stage(p)) + ' von 3 · noch ' + fmtH(hoursLeft(p)) + '</p>' +
      '<p class="pl">' + (wet ? "Gegossen: wächst noch " + fmtH((p.wetUntil - Date.now()) / 3600000) + " doppelt so schnell." : "Gießen lässt es 2\u00a0h doppelt so schnell wachsen.") + '</p>' +
      (wet ? "" : '<button type="button" class="pbtn" data-a="water">Gießen</button>'), plotX(i), GL.bed.bottom + 2).addEventListener("click", function (e) {
      if (!e.target.closest('[data-a="water"]')) return; closePop();
      if (s.asleep) { say(N() + " schläft gerade."); return; }
      if (busy && !interruptible()) return; if (busy) interrupt();
      act("water", function () { return waterSeq(i); });
    });
  }
  gEl("g-signs").addEventListener("click", function (e) { var b = e.target.closest(".sign"); if (b) plotTap(+b.dataset.plot); });
  gEl("slot-bed").addEventListener("click", function (e) {
    if (decor) return;
    if (trySweep("bed")) return;
    var r = this.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * BED_W;
    plotTap(Math.max(0, Math.min(2, Math.floor((x - 2) / 21))));
  });
  scene.addEventListener("click", function (e) { if (pop && !e.target.closest(".gpop") && !e.target.closest(".sign") && !e.target.closest("#slot-bed") && !e.target.closest("#g-basket")) closePop(); });
  gEl("g-basket").addEventListener("click", function () {
    if (decor) return;
    if (trySweep("basket")) return;
    var names = { nut: "Haselnuss" }, keys = Object.keys(garden.harvest).filter(function (k) { return garden.harvest[k]; });
    openPop('<p class="ph">Im Erntekorb</p>' + (keys.length ? keys.map(function (k) { var sk = k === "nut" ? "nut" : "f_" + k; return '<p class="pl row">' + svgOf(A[sk], SZ[sk][0], SZ[sk][1]) + '<span>' + (names[k] || CROPS[k].name) + '</span><b>' + garden.harvest[k] + '</b></p>'; }).join("") + '<p class="pn">Verfüttern kannst du alles unter „Füttern“.</p>' : '<p class="pl">Noch leer. Ernte etwas aus dem Beet.</p>'), GL.basket.x + 11, GL.basket.bottom + 2);
  });
  async function toPlot(i) { await walkTo(plotX(i) + 1, BR.y0); front({ eyes: "down", mouth: "smile" }); }
  function dirt(i) { for (var k = 0; k < 3; k++) fx("dirt", plotX(i) + rnd(-6, 6), GL.bed.bottom - 22, "fall", 1.4, { "--dx": rnd(-10, 10) + "px" }); }
  async function plantSeq(i, c) {
    await toPlot(i);
    for (var k = 0; k < 5; k++) { front({ paws: k % 2 ? "hold" : "down", eyes: "down", mouth: "teeth" }); body("squat"); dirt(i); await wait(200); body(""); await wait(120); }
    garden.seeds[c]--; garden.plots[i] = { crop: c, prog: 0, wetUntil: 0 };
    renderBed(); front({ eyes: "happy", mouth: "grin", paws: "down" }); pulse("hop", 420); say(CROPS[c].name + " ist gepflanzt. Reif in " + fmtH(hoursLeft(garden.plots[i])) + ".");
    await wait(600);
  }
  async function waterSeq(i) {
    await toPlot(i);
    var can = document.createElement("div"); can.className = "gfx can"; can.style.left = gx(plotX(i) + 8); can.style.top = gy(GL.bed.bottom - 34); can.style.width = gx(14);
    can.innerHTML = svgOf(A.can, 14, 10); gEl("g-fx").appendChild(can);
    front({ paws: "hold", eyes: "happy", mouth: "smile" });
    for (var k = 0; k < 8; k++) { fx("drop", plotX(i) + rnd(-4, 3), GL.bed.bottom - 26, "fall", 1, { "--dx": rnd(-3, 3) + "px" }); await wait(160); }
    can.remove();
    garden.plots[i].wetUntil = Date.now() + 2 * 3600000; renderBed();
    front({ paws: "down", mouth: "grin" }); say("Gegossen. " + CROPS[garden.plots[i].crop].name + " ist jetzt in " + fmtH(hoursLeft(garden.plots[i])) + " reif."); await wait(500);
  }
  async function harvestSeq(i) {
    await toPlot(i); var p = garden.plots[i];
    for (var k = 0; k < 3; k++) { front({ paws: "hold", eyes: "sleep", mouth: "teeth" }); body("squat"); await wait(220); body(""); await wait(120); }
    garden.plots[i] = null; garden.harvest[p.crop]++; renderBed();
    var item_ = document.createElement("div"); item_.className = "gfx tobasket"; item_.style.left = gx(plotX(i) - 4); item_.style.top = gy(GL.bed.bottom - 34); item_.style.width = gx(9);
    item_.innerHTML = svgOf(A["f_" + p.crop], SZ["f_" + p.crop][0], SZ["f_" + p.crop][1]); gEl("g-fx").appendChild(item_);
    void item_.offsetWidth; item_.style.left = gx(GL.basket.x + 7); item_.style.top = gy(GL.basket.bottom - 20);
    setTimeout(function () { item_.remove(); renderGardenDecor(); }, 700);
    fx("spark", plotX(i) - 6, GL.bed.bottom - 30, "sparkle"); fx("spark", plotX(i) + 6, GL.bed.bottom - 36, "sparkle");
    front({ eyes: "happy", mouth: "grin", paws: "up", blush: true }); pulse("bighop", 620);
    say(CROPS[p.crop].name + " geerntet."); renderFoods(); await wait(700);
  }
  // harvested food shows up in the food menu
  var GFOOD = { strawberry: { food: 15, fun: 12, love: 6, say: "Eine Erdbeere aus dem eigenen Garten!" }, cucumber: { food: 18, fun: 5, say: "Knackige Gurke." },
    dandelion: { food: 12, love: 10, say: "Löwenzahn, sein Lieblingsgrün." }, sunflower: { food: 22, fun: 14, say: "Frische Sonnenblumenkerne!" }, nut: { food: 14, fun: 8, love: 4, say: "Eine Haselnuss vom Eichhörnchen." } };
  var GNAME = { strawberry: "Erdbeere", cucumber: "Gurke", dandelion: "Löwenzahn", sunflower: "Sonnenblume", nut: "Haselnuss" };
  FOOD.strawberry = "f_strawberry"; FOOD.cucumber = "f_cucumber"; FOOD.dandelion = "f_dandelion"; FOOD.sunflower = "f_sunflower"; FOOD.nut = "nut";
  function renderFoods() {
    var box = document.getElementById("foods");
    box.querySelectorAll(".food-btn.extra").forEach(function (b) { b.remove(); });
    Object.keys(GFOOD).forEach(function (c) {
      if (!garden.harvest[c]) return;
      var k = FOOD[c], b = document.createElement("button"); b.type = "button"; b.className = "food-btn extra"; b.dataset.food = c;
      b.innerHTML = svgOf(A[k], SZ[k][0], SZ[k][1]) + '<span class="fn">' + GNAME[c] + '</span><small>' + garden.harvest[c] + '×</small>';
      box.appendChild(b);
    });
    if (place2 === "garden") renderGardenDecor();
  }
  function renderGardenPanel() {}
  document.getElementById("foods").addEventListener("click", function (e) { var b = e.target.closest(".food-btn.extra"); if (b) feed(b.dataset.food); });

  // ---- visitors from the album, as big as the hamster, each with its own scene ----
  var VISIT = ["igel", "hare", "squirrel", "robin", "tit", "fox", "mouse", "badger"];
  var visitor = null;
  function canVisit(id) {
    if (window.HamsterSeen && !window.HamsterSeen()[id]) return false;
    if (season() === "winter") return ["fox", "hare", "robin", "tit", "squirrel"].indexOf(id) >= 0;
    return !!ANIMALS[id];
  }
  function vPlace(x, y, ms) {
    var v = visitor; if (!v) return;
    v.x = x; v.y = y; v.el.style.transition = ms ? "left " + ms + "ms linear, bottom " + ms + "ms linear" : "none";
    v.el.style.left = gx(x - v.w / 2); v.el.style.bottom = gb(y);
  }
  function vCls(cls, on) { if (visitor) visitor.el.classList.toggle(cls, on); }
  function vSleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  async function vWalk(x, y, speed) {
    var v = visitor; if (!v) return;
    var pts = route({ x: v.x, y: v.y }, outside(x, y));
    vCls("moving", true);
    for (var i = 0; i < pts.length; i++) {
      if (visitor !== v) return;
      var ms = Math.hypot(pts[i].x - v.x, pts[i].y - v.y) / (speed || 40) * 1000;
      v.el.classList.toggle("face-l", pts[i].x < v.x - 1); vPlace(pts[i].x, pts[i].y, ms); await vSleep(ms);
    }
    if (visitor === v) { vCls("moving", false); v.el.classList.remove("face-l"); }
  }
  // little life of its own while it is in the garden: blinking, tail, ears, wings, sniffing, looking around
  var VMOVES = {
    igel: ["sniff", "bristle", "look", "sniff"], hare: ["ears", "hopv", "look", "sniff"], squirrel: ["wag", "nibblev", "hopv", "look"],
    robin: ["peck", "flutter", "look", "peck"], tit: ["peck", "flutter", "look", "hopv"], fox: ["wag", "look", "sniff", "ears"],
    mouse: ["sniff", "wag", "look", "nibblev"], badger: ["sniff", "look", "scratch", "sniff"]
  };
  function vIdleLoop(v) {
    setTimeout(function () {
      if (visitor !== v) return;
      if (!v.busyAnim && !v.el.classList.contains("moving")) {
        var m = pick(VMOVES[v.id]); v.el.classList.add("m-" + m);
        setTimeout(function () { v.el.classList.remove("m-" + m); }, m === "look" ? 1300 : 1100);
      }
      vIdleLoop(v);
    }, rnd(1400, 3200));
  }
  function vHead() { return visitor ? visitor.y - visitor.h : 60; }
  function spawnVisitor(force, want) {
    if (visitor || place2 !== "garden") return;
    var pool = VISIT.filter(canVisit); if (!pool.length) return;
    var id = want || pick(pool), an = ANIMALS[id], vb = an.vb.split(" ").map(Number);
    var h = 39, w = vb[2] * h / vb[3];
    var el = document.createElement("button"); el.type = "button"; el.className = "visitor-g va v-" + id; el.setAttribute("aria-label", an.name);
    el.style.width = gx(w);
    el.innerHTML = '<div class="vb">' + vaSvg(an, id) + '</div>';
    gEl("g-visitors").appendChild(el);
    visitor = { el: el, id: id, an: an, w: w, h: h, x: 200, y: 121, done: false };
    vPlace(200, 121, 0);
    garden.lastVisit = Date.now();
    say("Besonderer Besuch: " + an.name + " schaut vorbei!");
    vIdleLoop(visitor);
    el.addEventListener("click", function () { if (!visitor || decor) return; if (visitor.done) greet(); else startScene(); });
    var me = visitor;
    (async function () {
      void el.offsetWidth; el.classList.add("face-l");
      await vWalk(118, 128, 45);                                       // between the bed and the greenhouse, near the front, well away from the exit
      if (visitor !== me) return;
      fx("spark", me.x - 8, vHead() + 4, "sparkle"); fx("spark", me.x + 8, vHead() - 2, "sparkle");
      setTimeout(function () { if (visitor === me && !me.done && !s.asleep) startScene(); }, 2200);
    })();
    setTimeout(function () { if (visitor === me && !me.busy) leaveVisitor(); }, force ? 45000 : 40000);
  }
  function greet() {
    if (!visitor) return;
    fx("heart", visitor.x, vHead() - 2, "up"); say(visitor.an.name + " freut sich.");
    if (!busy && !s.asleep) act("look", async function () { front({ eyes: "happy", mouth: "grin", paws: "side_r", blush: true }); await wait(900); front({ paws: "down" }); });
  }
  function leaveVisitor() {
    if (!visitor) return; var v = visitor; visitor = null;
    var tx = 200, ms = (tx - v.x) / 40 * 1000;
    if (inBed(v.x, v.y) || !segOk({ x: v.x, y: v.y }, { x: tx, y: v.y })) { v.y = BR.y1 + 2; }
    v.el.classList.add("moving"); v.el.classList.remove("face-l"); v.el.style.transition = "left " + ms + "ms linear, bottom .4s linear"; v.el.style.left = gx(tx); v.el.style.bottom = gb(v.y);
    setTimeout(function () { v.el.remove(); }, ms + 100);
  }
  function startScene() {
    if (!visitor || visitor.busy || s.asleep) return;
    if (busy && !interruptible()) return; if (busy) interrupt();
    var v = visitor; v.busy = true;
    act("visit", async function () {
      try {
        // meet side by side
        await walkTo(GSPOT.meet.x, GSPOT.meet.y); front({ eyes: "look_r", mouth: "open", ears: "up" });
        await vWalk(GSPOT.meet.x + 38, GSPOT.meet.y, 50);
        front({ eyes: "happy", mouth: "grin", paws: "side_r", blush: true }); fx("heart", GSPOT.meet.x + 19, GSPOT.meet.y - 44, "up"); await wait(800);
        front({ paws: "down" });
        await (SCENES[v.id] || SCENES.igel)(v);
        v.done = true;
      } finally { if (visitor === v) v.busy = false; }
      later(function () { if (visitor === v) leaveVisitor(); }, 5000);
    });
  }
  function giveSeed(fromX) {
    var r = seedOrFurn(); if (r.seed) fx("seed_" + r.seed, fromX, vHead() + 6, "up", 1.4); else fx("heart", fromX, vHead() + 6, "up"); return r;
  }
  var SCENES = {
    igel: async function (v) {
      body("lean-r"); vCls("lean-l", true); front({ eyes: "sleep", mouth: "smile", blush: true }); await nibbleNose(6);
      fx("heart", v.x - 19, vHead() + 2, "up"); await wait(700);
      body(""); vCls("lean-l", false); vCls("curl", true); front({ eyes: "wide", mouth: "open" }); say("Der Igel rollt sich zur Kugel. " + N() + " staunt."); await wait(1400);
      vCls("curl", false); front({ eyes: "happy", mouth: "grin" }); pulse("hop", 420); await wait(700);
    },
    hare: async function (v) {
      say("Fangen! Der Hase hüpft davon.");
      for (var k = 0; k < 3; k++) { var tx = rnd(104, 146), ty = rnd(108, 128); var hw = vWalk(tx, ty, 80); await wait(300); await walkTo(tx - 30 * (tx > H.x ? 1 : -1), ty, 46); await hw; front({ eyes: "happy", mouth: "grin", paws: "up" }); pulse("hop", 300); await wait(250); }
      say("Jetzt ist " + N() + " dran.");
      for (var j = 0; j < 2; j++) { var x2 = rnd(70, 108), y2 = rnd(110, 128); var hamRun = walkTo(x2, y2, 46); await wait(250); await vWalk(x2 + 32, y2, 70); await hamRun; }
      front({ eyes: "happy", mouth: "grin", blush: true }); fx("heart", H.x, headY(), "up"); await wait(600);
    },
    squirrel: async function (v) {
      vCls("m-wag", true); vCls("hopv", true); await wait(500); vCls("hopv", false); vCls("m-wag", false);
      var nut = document.createElement("div"); nut.className = "gfx tobasket"; nut.style.left = gx(v.x - 4); nut.style.top = gy(vHead() + 14); nut.style.width = gx(7);
      nut.innerHTML = svgOf(A.nut, 7, 8); gEl("g-fx").appendChild(nut); void nut.offsetWidth; nut.style.left = gx(H.x - 3); nut.style.top = gy(H.y - 22);
      await wait(700); nut.remove();
      front({ hold: "nut", holdScale: 1, paws: "hold", eyes: "happy", mouth: "grin", blush: true });
      if (!v.gifted) { v.gifted = true; garden.harvest.nut++; renderFoods(); say("Das Eichhörnchen schenkt " + N() + " eine Haselnuss. Sie liegt jetzt im Korb."); }
      else say("Das Eichhörnchen zeigt " + N() + " seine Haselnuss."); await wait(1400);
      front({ hold: null, paws: "down" });
    },
    robin: async function (v) { await singScene(v); },
    tit: async function (v) { await singScene(v); },
    fox: async function (v) {
      vCls("lie", true); vCls("m-wag", true); setTimeout(function () { vCls("m-wag", false); }, 1500); say("Der Fuchs legt sich in die Wiese. " + N() + " kuschelt sich an.");
      await walkTo(v.x - 30, v.y, 24); front({ eyes: "sleep", mouth: "smile", paws: "hold", blush: true }); body("snooze");
      for (var k = 0; k < 5; k++) { fx("zz", H.x + 8, headY() - 2, "up", H.scale); fx("zz", v.x + 6, vHead() + 10, "up", H.scale); await wait(900); }
      body(""); vCls("lie", false); front({ eyes: "tired", mouth: "yawn", paws: "up" }); pulse("stretch", 1000); await wait(1000); front({ eyes: "happy", mouth: "smile", paws: "down" });
    },
    mouse: async function (v) {
      say("Die Maus teilt ihre Kerne.");
      for (var k = 0; k < 3; k++) { fx("seed", v.x - 10, vHead() + 16, "up", 1); await wait(350); }
      front({ cheeks: "s", eyes: "happy", mouth: "chew", paws: "hold" }); vCls("chew", true); vCls("m-wag", true); await wait(700);
      front({ cheeks: "l" }); fx("heart", (H.x + v.x) / 2, headY(), "up"); await wait(1200);
      vCls("chew", false); vCls("m-wag", false); front({ cheeks: null, paws: "down", mouth: "smile" }); await wait(300);
    },
    badger: async function (v) {
      say("Wer buddelt schneller?");
      for (var k = 0; k < 7; k++) {
        front({ paws: k % 2 ? "hold" : "down", eyes: "down", mouth: "teeth" }); body("squat"); vCls("dig", k % 2 === 0);
        fx("dirt", H.x + rnd(-8, 8), H.y - 6, "fall", 1.4, { "--dx": rnd(-12, 12) + "px" }); fx("dirt", v.x + rnd(-8, 8), v.y - 6, "fall", 1.4, { "--dx": rnd(-12, 12) + "px" });
        await wait(220); body(""); await wait(80);
      }
      vCls("dig", false); front({ eyes: "happy", mouth: "grin", paws: "up" }); pulse("bighop", 620); say("Unentschieden!"); await wait(700);
    }
  };
  async function singScene(v) {
    vCls("sing", true); vCls("m-flutter", true); say(v.an.name + " singt, " + N() + " tanzt dazu.");
    beep([[1319, .12], [1568, .12], [1760, .2], [0, .08], [1568, .12], [1319, .2], [0, .1], [1175, .12], [1319, .28]]);
    for (var k = 0; k < 8; k++) {
      fx("note", v.x + rnd(-6, 6), vHead() + rnd(-2, 4), "up", 1.1);
      front({ eyes: "happy", mouth: k % 2 ? "smile" : "grin", paws: k % 2 ? "side_r" : "side_l", blush: true }); body(k % 2 ? "lean-r" : "lean-l");
      await wait(300);
    }
    body(""); vCls("sing", false); vCls("m-flutter", false); front({ paws: "down" });
    if (!v.gifted && Math.random() < 0.6) { v.gifted = true; var gr_ = giveSeed(v.x); say(gr_.none ? v.an.name + " schaut in dein Samenlager: alles randvoll! Dafür gibt es ein Küsschen." : v.an.name + " lässt " + gr_.text + " da."); await wait(900); }   // a present only once per visit
  }
  // visits: at most one every 5 minutes, after that a 20 % chance each minute
  garden.lastVisit = 0;
  setInterval(function () {
    if (place2 !== "garden" || hamHidden() || s.asleep) return;
    if (Date.now() - (garden.lastVisit || 0) < 5 * 60000) return;
    if (Math.random() < 0.2) spawnVisitor();
  }, 60000);

  // ---- garden life ----
  async function gWander() { await walkTo(rnd(110, 160), rnd(112, 128)); front(mood()); await nibbleNose(6); await wait(500); }
  async function gDig() {
    await walkTo(rnd(118, 160), rnd(118, 128));
    for (var k = 0; k < 6; k++) { front({ paws: k % 2 ? "hold" : "down", eyes: "down", mouth: "teeth" }); body("squat"); fx("dirt", H.x + rnd(-8, 8), H.y - 6, "fall", 1.4, { "--dx": rnd(-12, 12) + "px" }); await wait(170); body(""); await wait(90); }
    front({ eyes: "happy", mouth: "grin" }); pulse("fluff", 520); await wait(500);
  }
  async function gChase() {
    var bf = butterfly(); front({ eyes: "wide", ears: "up", mouth: "open" }); await wait(500);
    for (var k = 0; k < 3; k++) { var r = bf.getBoundingClientRect(), sc = scene.getBoundingClientRect(); var x = Math.max(40, Math.min(170, (r.left - sc.left) / sc.width * GW)); await walkTo(x, rnd(112, 128), 44); front({ paws: "up", eyes: "happy", mouth: "grin" }); pulse("hop", 420); await wait(500); }
    front({ paws: "down", mouth: "smile" }); await wait(300);
  }
  async function gSun() {
    if (daylight() !== "day") return gWander();
    front({ eyes: "sleep", mouth: "smile", blush: true, paws: "hold" }); say(N() + " genießt die Sonne.");
    for (var k = 0; k < 4; k++) { fx("spark", H.x + rnd(-16, 16), headY() + rnd(-4, 8), "sparkle"); await wait(900); }
    front({ eyes: "happy", paws: "down" }); await wait(300);
  }
  async function gMeadow() {
    var spots = MSPOT.map(function (m, i) { return home.placed["meadow" + i] ? i : -1; }).filter(function (i) { return i >= 0; });
    if (!spots.length) return gWander();
    var i = pick(spots), m = MSPOT[i];
    await walkTo(Math.max(24, Math.min(165, m.x + (m.x > 100 ? -26 : 26))), m.bottom + 3); H.dir = m.x > H.x ? 1 : -1;
    for (var k = 0; k < 6; k++) { standFrame(k % 2); await wait(200); }
    var el = gEl("slot-meadow" + i); el.classList.remove("rustle"); void el.offsetWidth; el.classList.add("rustle"); setTimeout(function () { el.classList.remove("rustle"); }, 1500);
    front({ eyes: "happy", mouth: "smile", blush: true }); await nibbleNose(6);
  }
  async function gLeafPile() {
    await walkTo(GSPOT.pile.x, GSPOT.pile.y); front({ eyes: "wide", mouth: "grin", paws: "up" }); await wait(400);
    var pile = gEl("g-pile"); body("jump"); moveTo(GL.pile.x + 17, GL.pile.bottom - 2, 500); await wait(520);
    pile.classList.add("burst"); for (var k = 0; k < 14; k++) fx(pick(["leaf_a", "leaf_b", "leaf_c"]), GL.pile.x + rnd(2, 32), GL.pile.bottom - rnd(10, 26), "pop", 1.8);
    front({ eyes: "happy", mouth: "grin", blush: true }); say("Hui! Mitten in den Blätterhaufen."); await wait(900);
    pile.classList.remove("burst"); await walkTo(GSPOT.home.x, GSPOT.home.y);
  }
  async function gSnowman() {
    await walkTo(GSPOT.pile.x, GSPOT.pile.y + 4);
    for (var k = 0; k < 6; k++) { front({ paws: k % 2 ? "hold" : "side_l", eyes: "happy", mouth: "teeth" }); body("squat"); await wait(200); body(""); await wait(100); }
    garden.snow = Math.min(3, garden.snow + 1); layoutGarden();
    front({ eyes: "happy", mouth: "grin", paws: "up" }); pulse("hop", 420); say(garden.snow < 3 ? N() + " baut weiter am Schneehamster." : "Der Schneehamster ist fertig!"); await wait(700);
  }
  async function gSnowflake() {
    front({ eyes: "wide", ears: "up", mouth: "open" }); await wait(500);
    fx("snowflake", H.x, headY() - 10, "fall", 2, { "--dx": "0px" }); await wait(700);
    front({ eyes: "sleep", mouth: "grin" }); pulse("shake", 400); await wait(500); front({ eyes: "happy" });
  }
  async function gCheckBed() { var i = Math.floor(rnd(0, 3)); await toPlot(i); await wait(700); front({ eyes: "happy", mouth: "smile" }); await nibbleNose(4); }
  function gardenIdle() {
    if (visitor && !visitor.done && !visitor.busy) { startScene(); return; }
    var se = season(), opts = [["wander", 14, gWander], ["dig", 10, gDig], ["sniff", 8, gCheckBed], ["look", 8, lookAround], ["groom", 8, groom], ["plant", 10, gMeadow]];
    if (se === "spring" || se === "summer") opts.push(["chase", 9, gChase], ["sun", 8, gSun]);
    if (se === "autumn") opts.push(["pile", 14, gLeafPile]);
    if (se === "winter") opts.push(["snow", garden.snow < 3 ? 14 : 4, gSnowman], ["look", 8, gSnowflake]);
    var tot = opts.reduce(function (a, o) { return a + o[1]; }, 0), x = Math.random() * tot;
    for (var i = 0; i < opts.length; i++) { x -= opts[i][1]; if (x <= 0) { act(opts[i][0], opts[i][2]); return; } }
  }

  // ---- the snail brings new furniture ----
  var snailBusy = false;
  function snailDelivery(then) {
    if (snailBusy) return; snailBusy = true;
    var el = document.createElement("div"); el.className = "snail-del"; el.style.left = gx(-34); el.style.top = gy(PKG.y - 22); el.style.width = gx(30);
    el.innerHTML = '<div class="sn-box">' + svgOf(PROPS.gift.svg, 24, 24) + '</div><svg viewBox="0 0 30 22" aria-hidden="true">' + SNAIL + '</svg><div class="sn-say">Hallo, hier sind alle deine Möööbel.</div>';
    (place2 === "room" ? roomEl : gardenEl).appendChild(el);
    void el.offsetWidth; el.classList.add("crawl"); el.style.left = gx(PKG.x - 30);
    setTimeout(function () { el.classList.add("talk"); }, 4200);
    setTimeout(function () { el.classList.remove("talk"); el.querySelector(".sn-box").remove(); if (home.pending) home.pending.delivered = true; renderPackage(); el.classList.add("back"); el.style.left = gx(-40); }, 7600);
    setTimeout(function () { el.remove(); snailBusy = false; if (then) then(); }, 11800);
  }

  // ---- hooks into the room code ----
  var _renderRoom = renderRoom; renderRoom = function () { if (decor && curCat === "meadow") home.placed["meadow" + curSpot] = home.placed.meadow; _renderRoom(); if (place2 === "garden") { renderGardenDecor(); renderBed(); } };
  var _renderCatalog = renderCatalog; renderCatalog = function () {
    var list = place2 === "garden" ? GARDEN_CATS : ROOM_CATS;
    if (list.indexOf(curCat) < 0) curCat = list[0];
    document.querySelectorAll(".tab").forEach(function (t) { t.hidden = list.indexOf(t.dataset.cat) < 0; });
    if (curCat === "meadow") home.placed.meadow = home.placed["meadow" + curSpot];
    _renderCatalog();
    if (curCat === "meadow") document.getElementById("cat-title").textContent = "Wiese, Platz " + (curSpot + 1);
    document.querySelectorAll(".slot-meadow").forEach(function (el) { el.classList.toggle("sel", curCat === "meadow" && +el.dataset.spot === curSpot); });
  };
  gEl("slot-deco").addEventListener("click", function () { if (!decor) trySweep("deco"); });
  document.querySelectorAll(".slot-meadow").forEach(function (el) { el.addEventListener("click", function () { if (!decor) { trySweep("meadow" + el.dataset.spot); return; } curSpot = +el.dataset.spot; curCat = "meadow"; renderCatalog(); }); });
  var _renderCosy = renderCosy; renderCosy = function () { _renderCosy(); document.getElementById("cosy-count").textContent = ownedCount() + "/" + TOTAL_ITEMS + " Möbel"; if (ownedCount() >= TOTAL_ITEMS) document.getElementById("cosy-text").textContent = "Alle Möbel gesammelt"; };
  var _moveTo = moveTo; moveTo = function (x, y, ms) {
    _moveTo(x, y, ms);
    ham.style.zIndex = place2 === "garden" ? Math.round(y) : "";
  };
  openPackage = function () {
    if (!home.pending) return;
    if (s.asleep) { s.asleep = false; stopZzz(); syncButtons(); skyTime(); front({ blanket: null }); }
    if (busy && !interruptible()) return;
    if (busy) interrupt();
    window.__giftBusy = Date.now();
    act("unwrap", async function () {
      if (place2 === "garden") await goInsideSeq();
      if (!home.pending.delivered) {
        front({ eyes: "look_l", ears: "up", mouth: "open" });
        await new Promise(function (res) { snailDelivery(res); });
        front({ eyes: "wide", mouth: "grin" }); pulse("hop", 420); await wait(400);
      }
      await unwrapSeq();
    });
  };
  var IDLE_EXTRA = ["visit"]; IDLE_ACTS.push("visit", "pile", "snow", "chase", "sun", "dig", "wander", "garden", "inside");
  // preview controls
  $g("d-hours").addEventListener("click", function () { garden.t -= 3 * 3600000; tickGarden(); });

  // ---- winter outfit: hat and scarf, colour picked from the scarf button in the corner ----
  var OUTFIT = /*OUTFIT*/;
  var SCARF = [["red", "Rot", "#d8433a", "#a02a24"], ["blue", "Blau", "#4a7ad8", "#2e52a8"], ["green", "Grün", "#4aa05a", "#2e7440"], ["yellow", "Gelb", "#f0b830", "#c48a14"],
    ["pink", "Rosa", "#f08ab0", "#c45a84"], ["purple", "Lila", "#9a62c8", "#6e3e9a"], ["orange", "Orange", "#f5a032", "#c8741a"], ["teal", "Türkis", "#2aa8a8", "#1a7a7a"]];
  if (!home.scarf) home.scarf = "red";
  function scarfCol() { return SCARF.filter(function (c) { return c[0] === home.scarf; })[0] || SCARF[0]; }
  function renderScarfBtn() {
    var btn = document.getElementById("scarf-btn"); if (!btn) return;
    btn.hidden = !outfitOn(); if (btn.hidden) document.getElementById("scarf-pop").hidden = true;
    var c = scarfCol();
    btn.innerHTML = '<svg viewBox="0 0 12 10" aria-hidden="true"><path fill="#3a2414" d="M1 1h10v1h1v3h-1v1h-3v4h-4v-4h-3v-1h-1v-3h1z"/><path fill="' + c[2] + '" d="M2 2h8v3h-3v4h-2v-4h-3z"/><path fill="' + c[3] + '" d="M2 4h8v1h-3v1h-2v-1h-3zM5 8h2v1h-2z"/><path fill="#fff4e6" d="M3 2h1v1h-1zM7 2h1v1h-1z"/></svg>';
    btn.setAttribute("aria-label", "Schalfarbe: " + c[1]);
    document.getElementById("scarf-pop").innerHTML = SCARF.map(function (x) { return '<button type="button" class="sw' + (x[0] === home.scarf ? " on" : "") + '" data-c="' + x[0] + '" style="background:' + x[2] + ';box-shadow:inset 0 -4px 0 ' + x[3] + '" aria-label="' + x[1] + '"></button>'; }).join("");
  }
  document.getElementById("scarf-btn").addEventListener("click", function (e) { e.stopPropagation(); var p = document.getElementById("scarf-pop"); p.hidden = !p.hidden; });
  document.getElementById("scarf-pop").addEventListener("click", function (e) {
    e.stopPropagation(); var b = e.target.closest(".sw"); if (!b) return;
    home.scarf = b.dataset.c; renderScarfBtn(); document.getElementById("scarf-pop").hidden = true;
    if (H.sprite === "front" || H.sprite === "back") { H.sprite === "back" ? backFrame(0) : front(); }
    if (!busy && !s.asleep) act("look", async function () { front({ eyes: "happy", mouth: "grin", paws: "up", blush: true }); pulse("hop", 420); await wait(600); front({ paws: "down" }); });
    say(N() + " trägt jetzt Mütze und Schal in " + scarfCol()[1] + ".");
  });
  document.addEventListener("click", function (e) { var p = document.getElementById("scarf-pop"); if (p && !p.hidden && !e.target.closest("#scarf-pop")) p.hidden = true; });
  renderScarfBtn();
  if (H.sprite === "front") front();
  $g("d-solve").addEventListener("click", function () { var gr_ = seedOrFurn(); setTimeout(function () { say("Sudoku gelöst: +1 Apfel" + (gr_.none ? "." : " und " + gr_.text + ".")); }, 1500); });
  var SEASONS = [null, "spring", "summer", "autumn", "winter"], SEASON_NAME = { spring: "Frühling", summer: "Sommer", autumn: "Herbst", winter: "Winter" };
  $g("d-season").addEventListener("click", function () {
    seasonOverride = SEASONS[(SEASONS.indexOf(seasonOverride) + 1) % SEASONS.length]; gEl("g-fx").innerHTML = "";   /* no leaves or petals of the last season still falling */
    buildGardenFurn(); if (place2 === "garden") layoutGarden(); renderScarfBtn(); if (H.sprite === "front") front();
    say("Jahreszeit: " + (seasonOverride ? SEASON_NAME[seasonOverride] : SEASON_NAME[season()] + " (echtes Datum)"));
    if (decor) renderCatalog();
  });
  $g("d-visit").addEventListener("click", function () { if (place2 !== "garden") { say("Geh erst mit " + N() + " in den Garten: Tippe auf die Terrassentür."); return; } if (visitor) leaveVisitor(); setTimeout(function () { spawnVisitor(true); }, visitor ? 2800 : 0); });
  renderFoods();

  // ---- door, lamp and rug: each has its own catalog and can be dragged to a new spot while decorating ----
  var MOVE_NAMES = { door: "Tür", lamp: "Lampe", rug: "Teppich" };
  for (var mc in MOVE_NAMES) CATS[mc] = MOVE_NAMES[mc];
  ROOM_CATS.push("door", "lamp", "rug");
  TOTAL_ITEMS = 0; for (var fc2 in FURN) TOTAL_ITEMS += FURN[fc2].length;
  function roomDefaults() {
    var d = { door: "sage", lamp: "classic", rug: "braid" };
    for (var c in d) { if (!home.owned[c]) home.owned[c] = [d[c]]; if (home.placed[c] === undefined) home.placed[c] = d[c]; }
    if (!home.pos) home.pos = { door: -92, lamp: 47, rug: { x: 62, y: 110 }, v: 2 };
    if (home.pos.v !== 2) { home.pos.door = -92; home.pos.lamp = 47; home.pos.rug = { x: 62, y: 110 }; home.pos.v = 2; if (home.owned.door && home.owned.door.indexOf("sage") < 0) home.owned.door.push("sage"); home.placed.door = "sage"; }   // the new living room with the hall: the door is the front door now, lamp and rug go to their new places once
    home.pos.door = -92;
    // items that left the catalog (e.g. the dropped tile floors) fall back to a default
    for (var cat in home.owned) if (FURN[cat]) home.owned[cat] = home.owned[cat].filter(function (id) { return item(cat, id); });
    [["floor"], ["dfloor"], ["gram"]].forEach(function (q) { var c = q[0], d0 = FURN[c] && FURN[c][0] && FURN[c][0].id; if (!d0) return; if (!home.owned[c]) home.owned[c] = []; if (!item(c, home.placed[c])) home.placed[c] = d0; if (home.owned[c].indexOf(d0) < 0) home.owned[c].push(d0); });
    if (!home.pos.wc) home.pos.wc = {};
  }
  roomDefaults();
  var _resetHome2 = resetHome; resetHome = function () { _resetHome2(); roomDefaults(); };
  function cl(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function renderMovables() {
    roomDefaults();
    var d = item("door", home.placed.door) || FURN.door[0], x = home.pos.door;
    L.win.x = x; SPOT.window.x = x + 24;
    document.getElementById("win").style.left = gx(x);
    document.getElementById("win-frame").innerHTML = d.frame; document.getElementById("door-leaf").innerHTML = d.leaf;
    var lp = item("lamp", home.placed.lamp) || FURN.lamp[0];
    PROPS.lamp_on.svg = lp.on; PROPS.lamp_off.svg = lp.off; L.lamp.x = home.pos.lamp;
    document.getElementById("lamp").style.left = gx(L.lamp.x - 8);
    var rg = home.placed.rug && item("rug", home.placed.rug), r = document.getElementById("rug");
    r.hidden = !rg;
    if (rg) { r.style.left = gx(home.pos.rug.x); r.style.top = gy(home.pos.rug.y); r.style.width = gx(rg.w); r.innerHTML = svgOf(rg.svg, rg.w, rg.h); }
    skyTime();
  }
  function dragify(el, cat, apply) {
    el.addEventListener("pointerdown", function (e) {
      if (!decor || place2 !== "room") return;
      e.preventDefault(); e.stopPropagation();
      var r = scene.getBoundingClientRect(), sx = e.clientX, sy = e.clientY, moved = false, p0 = JSON.parse(JSON.stringify(home.pos));
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
      el.classList.add("dragging");
      function mv(ev) {
        if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 5) moved = true;
        if (!moved) return;
        apply(p0, (ev.clientX - sx) / r.width * GW, (ev.clientY - sy) / r.height * GH); renderMovables();
      }
      function up() {
        el.removeEventListener("pointermove", mv); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
        el.classList.remove("dragging");
        curCat = cat; renderCatalog();
        if (moved) say(MOVE_NAMES[cat] + " verschoben.");
      }
      el.addEventListener("pointermove", mv); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    });
  }
  dragify(document.getElementById("win"), "door", function () { home.pos.door = -92; });   /* the front door stays in the hall */
  dragify(document.getElementById("lamp"), "lamp", function (p0, dx) { home.pos.lamp = Math.round(cl(p0.lamp + dx, -80, 238)); });
  dragify(document.getElementById("rug"), "rug", function (p0, dx, dy) { home.pos.rug = { x: Math.round(cl(p0.rug.x + dx, -92, 175)), y: Math.round(cl(p0.rug.y + dy, 100, 120)) }; });
  var _renderRoom3 = renderRoom; renderRoom = function () { _renderRoom3(); renderMovables(); };
  var _renderCatalog3 = renderCatalog; renderCatalog = function () {
    _renderCatalog3();
    var mv = { door: "win", lamp: "lamp", rug: "rug" };
    for (var c in mv) document.getElementById(mv[c]).classList.toggle("sel", decor && curCat === c);
    if (mv[curCat]) {
      document.getElementById("cat-title").textContent = CATS[curCat] + " auswählen · zum Verschieben ziehen";
      if (curCat !== "rug") document.getElementById("cat-clear").hidden = true;
    }
  };
  /*GTEST*/

  // hat and scarf only outside in the garden
  function outfitOn() { return season() === "winter" && place2 === "garden"; }
  function outfitPart(part) {
    if (!OUTFIT || !home || !outfitOn()) return "";
    var c = scarfCol(); return OUTFIT[part].split("#0b0001").join(c[2]).split("#0b0002").join(c[3]);
  }
