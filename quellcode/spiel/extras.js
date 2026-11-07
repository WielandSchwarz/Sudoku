
  // ===================== mockup extras: kitchen, friendship, weather, more crops, festivals =====================
  var XA = /*EXTRASART*/;
  for (var xk in XA) { A[xk] = XA[xk].svg; SZ[xk] = [XA[xk].w, XA[xk].h]; }
  var weather = { type: "sun", until: 0, override: null };
  function xEl(tag, cls, parent, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }
  // ---- one popup at a time: anything that pops up by itself waits until no other popup, zoom or mini game is open ----
  var UI_POP = ".bee-pov:not([hidden]), .gift-wrap, .gift-ask, .ip, .pc-modal:not([hidden]), .l-fly:not([hidden]), .cf-book:not([hidden])";
  /* battery: setting an SVG attribute to the value it already has still makes the browser redraw, and the café sets dozens every frame */
  (function () { var sa = Element.prototype.setAttribute; if (window.SVGElement && !SVGElement.prototype.__saCache) { SVGElement.prototype.setAttribute = function (k, v) { if (this.getAttribute(k) === String(v)) return; return sa.call(this, k, v); }; SVGElement.prototype.__saCache = 1; } })();
  var uiBusyT = 0, uiBusyV = false;
  function uiBusy(self) {
    if (!self) { var now = performance.now(); if (now - uiBusyT < 250) return uiBusyV; uiBusyT = now; uiBusyV = uiBusyRaw(); return uiBusyV; }   /* asked every frame: look at most four times a second */
    return uiBusyRaw(self);
  }
  function uiBusyRaw(self) {
    var q = document.querySelectorAll(UI_POP);
    for (var i = 0; i < q.length; i++) if (q[i] !== self && !(self && self.contains && self.contains(q[i])) && q[i].getClientRects().length) return true;
    return false;
  }
  var uiQ = [], uiT = 0;
  function uiLater(fn) {
    uiQ.push(fn);
    if (!uiT) uiT = setInterval(function () { if (!uiQ.length) { clearInterval(uiT); uiT = 0; return; } if (uiBusy()) return; uiQ.shift()(); }, 450);
  }
  function xs(k, w) { return svgOf(A[k], SZ[k][0], SZ[k][1]); }

  // ---------- more crops ----------
  ["0", "1", "2", "3"].forEach(function (i) { A["crop_gcarrot" + i] = A["crop_carrot" + i]; SZ["crop_gcarrot" + i] = SZ["crop_carrot" + i]; });
  A.seed_gcarrot = A.seed_carrot; SZ.seed_gcarrot = SZ.seed_carrot;
  var NEWCROPS = [["gcarrot", "Möhre", 3, "f_carrot", { food: 20, fun: 6, say: "Eine knackige Möhre aus dem Beet!" }],
    ["pumpkin", "Kürbis", 8, "f_pumpkin", { food: 30, fun: 8, say: "Ein ganzer Kürbis! Er knabbert ein Loch hinein." }],
    ["tomato", "Tomate", 5, "f_tomato", { food: 16, love: 6, say: "Eine sonnenwarme Tomate." }],
    ["herbs", "Kräuter", 2, "f_herbs", { food: 8, love: 10, say: "Frische Kräuter, er schnuppert begeistert." }]];
  NEWCROPS.forEach(function (c) {
    CROPS[c[0]] = { name: c[1], hours: c[2] }; garden.seeds[c[0]] = 1; garden.harvest[c[0]] = 0;
    FOOD[c[0]] = c[3]; GFOOD[c[0]] = c[4]; GNAME[c[0]] = c[1];
  });
  var PLANTABLE = function () { return Object.keys(CROPS); };
  // the seed picker gets two columns now that there are eight crops
  plotTap = function (i) {
    if (decor) return;
    var p = garden.plots[i];
    if (!p) {
      var rows = PLANTABLE().map(function (c) {
        return '<button type="button" class="seedrow" data-seed="' + c + '"' + (garden.seeds[c] ? "" : " disabled") + '>' + svgOf(A["seed_" + c], 8, 10) + '<span>' + CROPS[c].name + '</span><b>' + (garden.seeds[c] || 0) + '</b></button>';
      }).join("");
      openPop('<p class="ph">Was soll wachsen?</p><div class="seedgrid">' + rows + '</div><p class="pn">Samen gibt es fürs Sudoku-Lösen und von Freunden.</p>', plotX(i), GL.bed.bottom + 2, "seeds").addEventListener("click", function (e) {
        var b = e.target.closest(".seedrow"); if (!b || b.disabled) return; closePop();
        if (s.asleep) { say(N() + " schläft gerade."); return; }
        if (busy && !interruptible()) return; if (busy) interrupt();
        act("plant", function () { return plantSeq(i, b.dataset.seed); });
      });
      return;
    }
    if (stage(p) === 3) { if (s.asleep) { say(N() + " schläft gerade."); return; } if (busy && !interruptible()) return; if (busy) interrupt(); act("harvest", function () { return harvestSeq(i); }); return; }
    var wet = p.wetUntil > Date.now(), fk = FOOD[p.crop] || "f_" + p.crop, stg = Math.max(1, stage(p)), pips = "";
    for (var q = 1; q <= 3; q++) pips += '<i class="' + (q <= stg ? "on" : "") + '"></i>';
    var DROP = '<svg class="pp-ic" viewBox="0 0 7 9" aria-hidden="true" shape-rendering="crispEdges"><path fill="#3a2414" d="M3 0h1v1h1v2h1v2h1v3h-1v1H1V8H0V5h1V3h1V1h1z"/><path fill="#5aa8e8" d="M3 1h1v2h1v2h1v3H1V5h1V3h1z"/><path fill="#bfe2fa" d="M2 5h1v2H2z"/></svg>';
    var CLOCK = '<svg class="pp-ic" viewBox="0 0 9 9" aria-hidden="true" shape-rendering="crispEdges"><path fill="#3a2414" d="M2 0h5v1h1v1h1v5H8v1H7v1H2V8H1V7H0V2h1V1h1z"/><path fill="#fff8ec" d="M2 1h5v1h1v5H7v1H2V7H1V2h1z"/><path fill="#3a2414" d="M4 2h1v3h2v1H4z"/></svg>';
    openPop('<div class="pp-head">' + svgOf(A[fk], SZ[fk][0], SZ[fk][1]) + '<b>' + CROPS[p.crop].name + '</b><span class="pp-pips" aria-label="Stufe ' + stg + ' von 3">' + pips + '</span></div>' +
      '<div class="pp-row">' + CLOCK + '<span>noch ' + fmtH(hoursLeft(p)) + '</span>' + (wet ? '<span class="pp-wet">' + DROP + '2× schneller</span>' : '') + '</div>' +
      (wet ? "" : '<button type="button" class="pbtn pp-water" data-a="water">' + svgOf(A.can, 14, 10) + 'Gießen</button>'), plotX(i), GL.bed.bottom + 2, "plot").addEventListener("click", function (e) {
      if (!e.target.closest('[data-a="water"]')) return; closePop();
      if (s.asleep) { say(N() + " schläft gerade."); return; }
      if (busy && !interruptible()) return; if (busy) interrupt();
      act("water", function () { return waterSeq(i); });
    });
  };
  // harvest icons for the new crops (the bed signs and the basket use f_<id>)
  A.f_gcarrot = A.f_carrot; SZ.f_gcarrot = SZ.f_carrot;

  // ---------- kitchen dishes ----------
  var DISHES = {
    jam: { name: "Erdbeermarmelade", art: "d_jam", need: { strawberry: 2 }, food: 22, love: 12, say: "Erdbeermarmelade! Er schleckt die Pfoten ab." },
    bread: { name: "Sonnenblumenbrot", art: "d_bread", need: { sunflower: 2 }, food: 35, fun: 6, say: "Frisches Sonnenblumenbrot, noch warm." },
    salad: { name: "Gurkensalat", art: "d_salad", need: { cucumber: 1, dandelion: 1 }, food: 22, fun: 10, say: "Knackiger Gurkensalat mit Löwenzahn." },
    cake: { name: "Möhrenkuchen", art: "d_cake", need: { gcarrot: 2, sunflower: 1 }, food: 30, fun: 16, love: 6, say: "Möhrenkuchen! Sein Lieblingskuchen." },
    psoup: { name: "Kürbissuppe", art: "d_pumpkinsoup", need: { pumpkin: 1 }, food: 40, love: 6, say: "Eine Schale Kürbissuppe wärmt den Bauch." },
    tsoup: { name: "Tomatensuppe", art: "d_tomatosoup", need: { tomato: 2, herbs: 1 }, food: 30, love: 10, say: "Tomatensuppe mit Kräutern." }
  };
  for (var dk in DISHES) { FOOD[dk] = DISHES[dk].art; GNAME[dk] = DISHES[dk].name; GFOOD[dk] = DISHES[dk]; garden.harvest[dk] = 0; }
  function isDish(k) { return !!DISHES[k]; }
  // the basket only shows the raw harvest; dishes wait on the kitchen table
  gEl("g-basket").addEventListener("click", function (e) {
    if (decor) return;
    e.stopImmediatePropagation();
    if (trySweep("basket")) return;
    var keys = Object.keys(garden.harvest).filter(function (k) { return garden.harvest[k] && !isDish(k); });
    openPop('<p class="ph">Im Erntekorb</p>' + (keys.length ? keys.map(function (k) { var sk = FOOD[k] || k; return '<p class="pl row">' + svgOf(A[sk], SZ[sk][0], SZ[sk][1]) + '<span>' + (k === "nut" ? "Haselnuss" : CROPS[k].name) + '</span><b>' + garden.harvest[k] + '</b></p>'; }).join("") + '<p class="pn">Verfüttern unter „Füttern“, kochen in der Küche.</p>' : '<p class="pl">Noch leer. Ernte etwas aus dem Beet.</p>'), GL.basket.x + 11, GL.basket.bottom + 2);
  }, true);

  // ---------- the kitchen: a room of its own, through the right edge of the room ----------
  var kitchenEl = xEl("div", "kitchen", null); kitchenEl.id = "kitchen"; kitchenEl.hidden = true;
  scene.insertBefore(kitchenEl, gardenEl.nextSibling);
  kitchenEl.innerHTML = '<div class="sky k-sky" id="k-sky"><i style="left:0;top:22%;width:40%"></i><b class="sun"></b></div>' +
    '<div class="k-bg">' + svgOf(A.kitchen, 180, 135) + '</div>' +
    '<div class="k-fire" id="k-fire">' + xs("fire") + '</div><div class="k-pot" id="k-pot">' + xs("pot") + '</div>' +
    '<button type="button" class="k-stove" id="k-stove" aria-label="Kochen"></button><button type="button" class="k-stove k-oven" id="k-oven" aria-label="Backofen"></button><button type="button" class="k-stove k-board" id="k-board" aria-label="Schneidebrett"></button>' +
    '<div class="k-table" id="k-table"></div><div class="k-fx" id="k-fx"></div>' +
    '<button type="button" class="g-exit k-exit" id="k-exit" aria-label="Zurück ins Zimmer"><span>‹</span></button>';
  var kUI = xEl("div", "k-ui", scene); kUI.id = "k-ui";
  var kEnter = xEl("button", "k-enter", roomEl, "<span>›</span>"); kEnter.type = "button"; kEnter.id = "k-enter"; kEnter.setAttribute("aria-label", "In die Küche");
  var KSPOT = { home: { x: 92, y: 122 }, stove: { x: 40, y: 116 }, oven: { x: 93, y: 112 }, board: { x: 133, y: 120 }, table: { x: 146, y: 120 }, window: { x: 144, y: 108 }, fire: { x: 52, y: 118 } };
  var _showPlace = showPlace;
  showPlace = function (p) {
    _showPlace(p);
    kitchenEl.hidden = p !== "kitchen";
    kEnter.hidden = p !== "room";
    document.getElementById("decor-btn").hidden = p === "kitchen";
    if (p === "kitchen") { renderTable(); } else document.getElementById("k-ui").innerHTML = "";
    renderFest(); applyWeather();
  };
  function fadeX(on) { ham.style.transition = (ham.style.transition ? ham.style.transition + ", " : "") + "opacity .3s"; ham.style.opacity = on ? "1" : "0"; }
  async function goKitchenSeq() {
    if (H.where === "chair") await hopOutOfChair();
    if (place2 === "garden") await goInsideSeq();
    await walkTo(196, 120); fadeX(false); await wait(250);
    showPlace("kitchen"); moveTo(-14, 120, 0); fadeX(true);
    say(N() + " ist in der Küche."); await walkTo(KSPOT.home.x, KSPOT.home.y);
    front({ eyes: "happy", mouth: "grin", blush: true }); await nibbleNose(6);
  }
  async function goRoomFromKitchen() {
    if (place2 !== "kitchen") return;
    await walkTo(-14, 120); fadeX(false); await wait(250);
    showPlace("room"); moveTo(196, 120, 0); fadeX(true); await walkTo(SPOT.home.x, SPOT.home.y);
  }
  kEnter.addEventListener("click", function () { if (decor || s.asleep) return; if (busy) interrupt(); act("kitchen", goKitchenSeq); });
  document.getElementById("k-exit").addEventListener("click", function () { if (busy) interrupt(); document.getElementById("k-ui").innerHTML = ""; act("inside", goRoomFromKitchen); });
  IDLE_ACTS.push("kitchen", "kwander", "kwarm", "ksniff");
  // feeding, sleeping and parcels happen in the room
  var _feedSeq = feedSeq; feedSeq = async function (k) { if (place2 === "kitchen") await goRoomFromKitchen(); return _feedSeq(k); };
  var _sleepSeq = sleepSeq; sleepSeq = async function () { if (place2 === "kitchen") await goRoomFromKitchen(); return _sleepSeq(); };
  var _openPackage = openPackage; openPackage = function () { if (place2 === "kitchen" && home.pending) { if (busy) interrupt(); act("inside", async function () { await goRoomFromKitchen(); setTimeout(_openPackage, 50); }); return; } _openPackage(); };
  function renderTable() {
    var t = document.getElementById("k-table"), keys = Object.keys(DISHES).filter(function (k) { return garden.harvest[k]; }).slice(0, 4);
    t.innerHTML = keys.map(function (k, i) { return '<div class="k-dish" style="left:' + (i * 24) + '%">' + xs(DISHES[k].art) + (garden.harvest[k] > 1 ? '<b>' + garden.harvest[k] + '</b>' : "") + '</div>'; }).join("");
  }
  var _renderFoods = renderFoods; renderFoods = function () { _renderFoods(); if (typeof renderTable === "function" && kitchenEl) renderTable(); };
  // cooking: tap the hearth, choose a recipe, the hamster stirs the pot
  function kPop(html) {
    var ui = document.getElementById("k-ui"); ui.innerHTML = '<div class="gpop kpop">' + html + '</div>';
    var p = ui.firstChild; setTimeout(function () { document.addEventListener("click", function off(e) { if (!e.target.closest(".kpop") && !e.target.closest(".k-stove")) { ui.innerHTML = ""; document.removeEventListener("click", off); } }); }, 0);
    return p;
  }
  function canCook(d) { var n = DISHES[d].need; for (var k in n) if ((garden.harvest[k] || 0) < n[k]) return false; return true; }
  function openRecipes() {
    if (decor) return;
    var rows = Object.keys(DISHES).map(function (d) {
      var R = DISHES[d], need = Object.keys(R.need).map(function (k) { var sk = FOOD[k] || k; return '<span class="need' + ((garden.harvest[k] || 0) >= R.need[k] ? "" : " miss") + '">' + R.need[k] + '×' + svgOf(A[sk], SZ[sk][0], SZ[sk][1]) + '</span>'; }).join("");
      return '<button type="button" class="recipe" data-d="' + d + '"' + (canCook(d) ? "" : " disabled") + '>' + xs(R.art) + '<span class="rn">' + R.name.replace("marmelade", "\u00admarmelade").replace("brot", "\u00adbrot").replace("kuchen", "\u00adkuchen").replace("suppe", "\u00adsuppe") + '<small>' + need + '</small></span></button>';
    }).join("");
    kPop('<p class="ph">Was kochen wir?</p><div class="rgrid">' + rows + '</div><p class="pn">Zutaten kommen aus dem Erntekorb im Garten.</p>').addEventListener("click", function (e) {
      var b = e.target.closest(".recipe"); if (!b || b.disabled) return; document.getElementById("k-ui").innerHTML = "";
      if (s.asleep) return; if (busy) interrupt();
      act("cook", function () { return cookSeq(b.dataset.d); });
    });
  }
  ["k-stove", "k-oven", "k-board"].forEach(function (id) { document.getElementById(id).addEventListener("click", openRecipes); });
  // cooking: the hamster walks to the hearth, then the view switches to his eyes; every dish has its own steps
  var DISH_COLOR = { jam: "#c8343a", bread: "#ecd29c", salad: "#8ac860", cake: "#e8a860", psoup: "#f09030", tsoup: "#d84030" };
  var PANTRY = { flour: ["p_flour", "Mehl"], egg: ["p_egg", "Ei"] };
  for (var pk in PANTRY) { FOOD[pk] = PANTRY[pk][0]; if (!GNAME[pk]) GNAME[pk] = PANTRY[pk][1]; }
  var BIG = { gcarrot: "big_carrot", pumpkin: "big_pumpkin", tomato: "big_tomato", cucumber: "big_cucumber", herbs: "big_herbs", dandelion: "big_dandelion" };
  var CUTS = { gcarrot: 3, pumpkin: 3, tomato: 2, cucumber: 4, herbs: 3, dandelion: 2 };
  var PLAN = {
    psoup: [["cut"], ["add", "pot"], ["stir", "pot"], ["heat"]],
    tsoup: [["cut"], ["add", "pot"], ["stir", "pot"], ["heat"]],
    jam: [["add", "pot"], ["mash"], ["heat"]],
    salad: [["cut"], ["add", "bowl"], ["stir", "bowl"]],
    bread: [["add", "bowl", ["flour"]], ["stir", "bowl"], ["knead"], ["bake", "bread"]],
    cake: [["cut"], ["add", "bowl", ["flour", "egg"]], ["stir", "bowl"], ["bake", "cake"], ["decorate"]]
  };
  var VIEW_BG = { pot: "pov_bg", bowl: "bowl_bg", board: "board_bg", oven: "oven_bg", cake: "cake_top" };
  function mix(a, b, t) { t = Math.max(0, Math.min(1, t)); var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), r = [16, 8, 0].map(function (sh) { var x = (pa >> sh) & 255, y = (pb >> sh) & 255; return Math.round(x + (y - x) * t); }); return "#" + r.map(function (v) { return ("0" + v.toString(16)).slice(-2); }).join(""); }
  var pov = xEl("div", "cook-pov", scene); pov.id = "cook-pov"; pov.hidden = true;
  pov.innerHTML = '<svg class="pov-scene" id="pov-svg" viewBox="0 0 180 135" aria-hidden="true"><g id="pov-base"></g><g id="pov-liquid"></g><g id="pov-float"></g><g id="pov-tool"></g><g id="pov-fx"></g><g id="pov-steam"></g></svg>' +
    '<div class="pov-head"><b id="pov-step"></b><span id="pov-text"></span></div>' +
    '<div class="pov-board" id="pov-board" hidden></div>' +
    '<div class="pov-ring" id="pov-ring" hidden><i id="pov-ringbar"></i></div>' +
    '<div class="pov-gauge pgx" id="pov-gauge" hidden></div>' +
    '<div class="pov-bake pgx" id="pov-bake" hidden></div>' +
    '<button type="button" class="pov-go" id="pov-go" hidden></button>' +
    '<button type="button" class="pov-x" id="pov-x" aria-label="Kochen abbrechen">×</button>' +
    '<div class="pov-done" id="pov-done" hidden></div>';
  function $p(id) { return document.getElementById(id); }
  var POT = { x: 102, y: 69, rx: 27, ry: 13 }, svgEl = $p("pov-svg");
  var liqCol = null, floaters = [], view = "pot";
  var bowlK = null;
  function setBowl(k) { bowlK = k; liqCol = null; var b = "#e8a860"; $p("pov-liquid").innerHTML = k ? A["bowl_" + k].split("#0c0006").join(b).split("#0c0007").join(mix(b, "#000000", 0.15)).split("#0c0008").join(mix(b, "#ffffff", 0.35)) : ""; }
  function geo() { return view === "bowl" ? { x: 102, y: 74, rx: 24, ry: 11, fx: 30, fy: 13 } : { x: POT.x, y: POT.y, rx: POT.rx, ry: POT.ry, fx: 40, fy: 22 }; }
  function setLiquid(col) { bowlK = null; liqCol = col; $p("pov-liquid").innerHTML = col ? A.pov_liquid.split("#0c0001").join(col).split("#0c0002").join(mix(col, "#ffffff", 0.3)).split("#0c0009").join(mix(col, "#000000", 0.22)) : ""; }
  function setView(v) {
    view = v; $p("pov-base").innerHTML = A[VIEW_BG[v]];
    ["pov-float", "pov-tool", "pov-fx", "pov-steam"].forEach(function (id) { $p(id).innerHTML = ""; });
    ["pov-board", "pov-ring", "pov-gauge", "pov-bake", "pov-go"].forEach(function (id) { $p(id).hidden = true; });
    if (v !== "pot" && v !== "bowl") { setLiquid(null); floaters = []; }
    svgEl.onclick = svgEl.onpointerdown = svgEl.onpointermove = svgEl.onpointerup = null;
    svgEl.classList.remove("fade"); void svgEl.offsetWidth; svgEl.classList.add("fade");
  }
  // ---------- one bar for every progress and timing display: a wooden frame with nails, a dark groove, a continuous fill ----------
  // drawn in UI pixels (1 unit = 3 screen pixels), the same chunky edges as the text boxes and buttons.
  // o = { w: width in units, frac: fill 0..1 (null = the whole scale shows), col(t): colour at position t, zone: [t0, t1] (golden, sparkling),
  //       mark: t (pointer), vertical: true for an upright bar, px: screen pixels per unit }
  var WB_U = 3;
  function woodBarSvg(o) {
    var W = o.w || 68, top = (o.mark != null || o.zone) ? 5 : 1, H = 11, TH = top + H + 2, out = "", U = o.px || WB_U;
    function r(x, y, w, h, c, op) { if (w <= 0 || h <= 0) return; out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"' + (op ? ' opacity="' + op + '"' : "") + '/>'; }
    var INK = "#3a2414", CR = "#fff8ec";
    r(1, top + H, W - 2, 1, "#2b1d12", .25); r(2, top + H + 1, W - 4, 1, "#2b1d12", .12);
    r(1, top, W - 2, 1, INK); r(1, top + H - 1, W - 2, 1, INK); r(0, top + 1, 1, H - 2, INK); r(W - 1, top + 1, 1, H - 2, INK);
    r(1, top + 1, W - 2, H - 2, "#a06a38"); r(1, top + 1, W - 2, 1, "#c8925a"); r(1, top + H - 2, W - 2, 1, "#7a4e28");
    for (var gx_ = 6; gx_ < W - 4; gx_ += 9) r(gx_, top + 1, 3, 1, "#946234");
    for (var gx2 = 10; gx2 < W - 6; gx2 += 13) r(gx2, top + H - 2, 2, 1, "#8a5a30");
    [2, W - 3].forEach(function (nx) { r(nx, top + 4, 1, 1, "#e8d0a0"); r(nx, top + 5, 1, 1, "#5e3818"); });
    var ix = 4, iw = W - 8, iy = top + 2, ih = H - 4;
    r(ix - 1, iy, iw + 2, ih, INK); r(ix, iy + 1, iw, ih - 2, "#3a2a20"); r(ix, iy + 1, iw, 1, "#2a1c14");
    var fw = o.frac == null ? iw : Math.round(iw * Math.max(0, Math.min(1, o.frac)));
    for (var x = 0; x < fw; x++) {
      var c = o.col((x + .5) / iw); r(ix + x, iy + 1, 1, ih - 2, c); r(ix + x, iy + 1, 1, 1, mix(c, "#ffffff", 0.45)); r(ix + x, iy + ih - 2, 1, 1, mix(c, "#000000", 0.25));
      if (x % 6 === 2) r(ix + x, iy + 2, 1, 1, mix(c, "#ffffff", 0.25));
    }
    if (o.frac != null && fw > 0 && fw < iw) r(ix + fw - 1, iy + 1, 1, ih - 2, mix(o.col(fw / iw), "#ffffff", 0.35));
    var spark = "";
    if (o.zone) {                                                                       // the good range: a calm golden frame
      var x0 = ix + Math.round(o.zone[0] * iw), x1 = ix + Math.round(o.zone[1] * iw) - 1, G1 = "#f6c84a", G2 = "#fff0a0", G3 = "#c8901c";
      r(x0 - 1, iy - 1, x1 - x0 + 3, 1, G3); r(x0 - 1, iy + ih, x1 - x0 + 3, 1, G3);
      r(x0 - 1, iy, x1 - x0 + 3, 1, G1); r(x0 - 1, iy + ih - 1, x1 - x0 + 3, 1, G1); r(x0 - 1, iy, 1, ih, G1); r(x1 + 1, iy, 1, ih, G1);
      r(x0, iy, Math.ceil((x1 - x0) / 2), 1, G2);
      r(x0, iy + 1, x1 - x0 + 1, ih - 2, G1, .28);                                        // golden glow inside
      var ph = -(Date.now() % 1600), mid = Math.round((x0 + x1) / 2), pts = [[x0 - 1, iy - 1], [x1 + 1, iy + ih], [mid, iy - 2], [x1 + 1, iy - 1], [x0 - 1, iy + ih], [mid - 2, iy + ih + 1]];
      pts.forEach(function (q, k) {
        var cx_ = q[0] + 0.5, cy_ = q[1] + 0.5, t3 = 1 / 3;                               // a fine twinkle: thin arms, a small bright core
        spark += '<g class="wb-sp" style="animation-delay:' + (ph - k * 270) + 'ms" shape-rendering="crispEdges" transform="translate(' + (cx_ - 7 / 6) + ' ' + (cy_ - 7 / 6) + ') scale(' + t3 + ')">' +
          '<path fill="#ffd34a" d="M3 0h1v2h1v1h2v1H5v1H4v2H3V5H2V4H0V3h2V2h1z"/><path fill="#ffffff" d="M3 2h1v3H3zM2 3h3v1H2z"/></g>';
      });
    }
    if (o.mark != null) {
      var mx = Math.round(ix + Math.max(0, Math.min(1, o.mark)) * (iw - 1)), ay = top - 5;
      r(mx - 1, iy, 3, ih, INK); r(mx, iy + 1, 1, ih - 2, CR);
      r(mx - 3, ay, 7, 2, INK); r(mx - 2, ay + 1, 5, 1, CR); r(mx - 2, ay + 2, 5, 1, INK); r(mx - 1, ay + 2, 3, 1, CR); r(mx - 1, ay + 3, 3, 1, INK); r(mx, ay + 3, 1, 1, CR); r(mx, ay + 4, 1, 1, INK);
    }
    // the golden frame stays still: no shine, no twinkles
    var vw = o.vertical ? TH : W, vh = o.vertical ? W : TH;
    return '<svg class="wbar" width="' + vw * U + '" height="' + vh * U + '" viewBox="0 0 ' + vw + ' ' + vh + '" shape-rendering="crispEdges" aria-hidden="true" style="display:block;max-width:100%;height:auto">' +
      (o.vertical ? '<g transform="' + (o.up ? 'matrix(0 -1 1 0 0 ' + W + ')' : 'matrix(0 1 1 0 0 0)') + '">' + out + '</g>' : out) + '</svg>';
  }
  function pixBarSvg(f, w) { return woodBarSvg({ w: w && w < 70 ? 44 : 68, frac: f || 0, col: function () { return "#f0a51e"; } }); }
  function setPixBar(el, f) { if (el) el.innerHTML = pixBarSvg(f, 80); }
  // a proper wooden spoon: one shape that widens from a thick handle into a rounded, hollow bowl; shaded from the top left, 1-pixel outline, soft drop shadow
  function drawSpoon(ang) {
    var G0 = geo(), tx = G0.x + Math.cos(ang) * G0.rx, ty = G0.y + Math.sin(ang) * G0.ry, hx = 100 + (tx - 100) * 0.5, hy = 152;
    var dx = tx - hx, dy = ty - hy, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    var BL = 18, NECK = 13, Fx = tx + ux * 6, Fy = ty + uy * 6, lit = (nx * -1 + ny * -1) > 0 ? 1 : -1, wet = !!liqCol, WL = BL + 1.5;
    if (wet) { var LQ = view === "bowl" ? { x: 102, y: 74, rx: 44, ry: 22 } : { x: 102, y: 72, rx: 45, ry: 24 }; for (var dd = 0; dd < BL + 1.5; dd += 0.5) { var qx = Fx - ux * dd, qy = Fy - uy * dd; if (Math.pow((qx - LQ.x) / LQ.rx, 2) + Math.pow((qy - LQ.y) / LQ.ry, 2) > 1) { WL = Math.max(4, dd); break; } } }
    function hw(d) {
      if (d < 0) return -1;
      if (d <= 8) return 5.6 * Math.sqrt(Math.max(0, 1 - Math.pow((d - 8) / 8.6, 2)));
      if (d <= 8 + NECK) return 2.6 + 3 * (0.5 + 0.5 * Math.cos(Math.PI * (d - 8) / NECK));
      return 2.6 + 1.1 * (d - 8 - NECK) / L;
    }
    var x0 = Math.max(0, Math.floor(Math.min(Fx, hx) - 9)), x1 = Math.min(179, Math.ceil(Math.max(Fx, hx) + 9)), y0 = Math.max(0, Math.floor(Math.min(Fy, hy) - 9)), y1 = Math.min(140, Math.ceil(Math.max(Fy, hy) + 9));
    var W = x1 - x0 + 3, H = y1 - y0 + 3, ins = new Array(W * H), D = new Array(W * H), S = new Array(W * H);
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var px = x0 - 1 + x + .5 - Fx, py = y0 - 1 + y + .5 - Fy, d = -(px * ux + py * uy), s = px * nx + py * ny, w = hw(d), i = y * W + x;
      D[i] = d; S[i] = w > 0 ? s / w : 0; ins[i] = w > 0 && Math.abs(s) <= w;
    }
    var WOOD = ["#7a4e28", "#a87440", "#c8945a", "#e2b276", "#f4d29c"], OUT = "#3a2414", cache = {};
    function sub(c) { if (!wet) return c; return cache[c] || (cache[c] = mix(c, liqCol, 0.68)); }
    function col(i) {
      var d = D[i], q = S[i] * lit, c;
      if (d <= BL - 3 && d >= 1.6 && Math.abs(S[i]) < 0.66) {                                    // the hollow of the bowl: lit on the far side
        c = q > 0.25 ? WOOD[1] : q < -0.3 ? WOOD[3] : WOOD[2];
        if (q < -0.45 && d > 4 && d < 9) c = WOOD[4];
      } else {
        c = q > 0.5 ? WOOD[3] : q > -0.15 ? WOOD[2] : q > -0.65 ? WOOD[1] : WOOD[0];
        if (d > BL && q > 0.42 && q < 0.8 && (Math.floor(d) % 13) < 8) c = WOOD[4];              // a long highlight along the handle
        if (d > BL && Math.abs(q + 0.1) < 0.22 && Math.floor(d) % 10 === 4) c = "#946036";          // wood grain
      }
      return d < WL ? sub(c) : c;
    }
    var rows = {}, shadow = "", rip = "";
    function put(x, y, c) { (rows[y] || (rows[y] = [])).push([x, c]); }
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var i = y * W + x, X = x0 - 1 + x, Y = y0 - 1 + y;
      if (ins[i]) { put(X, Y, col(i)); if (!wet || D[i] > WL) shadow += '<rect x="' + (X + 3) + '" y="' + (Y + 3) + '" width="1" height="1"/>'; }
      else if ((x > 0 && ins[i - 1]) || (x < W - 1 && ins[i + 1]) || (y > 0 && ins[i - W]) || (y < H - 1 && ins[i + W])) {
        var j = (x > 0 && ins[i - 1]) ? i - 1 : (x < W - 1 && ins[i + 1]) ? i + 1 : (y > 0 && ins[i - W]) ? i - W : i + W;
        put(X, Y, D[j] < WL ? sub(OUT) : OUT);
      }
    }
    var o = "";
    for (var yy in rows) {
      var r = rows[yy].sort(function (a, b) { return a[0] - b[0]; }), k = 0;
      while (k < r.length) { var s0 = k; while (k + 1 < r.length && r[k + 1][0] === r[k][0] + 1 && r[k + 1][1] === r[s0][1]) k++; o += '<rect x="' + r[s0][0] + '" y="' + yy + '" width="' + (k - s0 + 1) + '" height="1" fill="' + r[s0][1] + '"/>'; k++; }
    }
    if (wet) {                                                                                     // rings where the handle goes into the soup
      var cx = Fx - ux * WL, cy = Fy - uy * WL, hi = mix(liqCol, "#ffffff", 0.45), lo = mix(liqCol, "#000000", 0.28);
      [[7, 3, hi, 1], [11.5, 4.6, hi, 0]].forEach(function (e) {
        for (var y = Math.floor(cy - e[1] - 1); y <= cy + e[1] + 1; y++) for (var x = Math.floor(cx - e[0] - 1); x <= cx + e[0] + 1; x++) {
          var v = Math.pow((x + .5 - cx) / e[0], 2) + Math.pow((y + .5 - cy) / e[1], 2);
          if (v <= 1 && v > (e[3] ? 0.55 : 0.72) && (e[3] || (x + y) % 2 === 0)) rip += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + e[2] + '"/>';
        }
      });
      rip = '<g>' + rip + '</g>';
      var sh = ""; for (var y = Math.floor(cy - 3); y <= cy + 4; y++) for (var x = Math.floor(cx - 6); x <= cx + 8; x++) { var v = Math.pow((x + .5 - cx - 2) / 6.5, 2) + Math.pow((y + .5 - cy - 1.5) / 3, 2); if (v <= 1) sh += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + lo + '"/>'; }
      rip = sh + rip;
    }
    $p("pov-tool").innerHTML = rip + '<g fill="#2a1206" opacity=".3">' + shadow + '</g>' + o;
  }
  window.__pov = { geo: function () { return geo(); }, view: function () { return view; }, fl: function () { return floaters; }, sz: function (k) { return SZ[k]; } };
  function renderFloat(t) {
    if (view !== "pot" && view !== "bowl") return;
    $p("pov-float").innerHTML = floaters.map(function (f, i) {
      var G0 = geo(), a = f.a + t * f.sp, x = G0.x + Math.cos(a) * f.r * G0.fx, y = G0.y + Math.sin(a) * f.r * G0.fy + (view === "pot" ? Math.sin(t * 3 + i) * 0.8 : 0), k = f.k, sc = f.s;
      return '<g transform="translate(' + Math.round(x - SZ[k][0] * sc / 2) + ' ' + Math.round(y - SZ[k][1] * sc / 2) + ') scale(' + sc + ')">' + A[k] + '</g>';
    }).join("");
  }
  function puff(x, y, col) {
    var id = "pf" + Math.random().toString(36).slice(2, 7);
    $p("pov-steam").insertAdjacentHTML("beforeend", '<circle id="' + id + '" class="pov-puff" cx="' + x + '" cy="' + y + '" r="3" fill="' + (col || "#fff4e0") + '" opacity=".55"/>');
    setTimeout(function () { var e = document.getElementById(id); if (e) e.remove(); }, 1500);
  }
  function svgPt(ev) { var r = svgEl.getBoundingClientRect(); return { x: (ev.clientX - r.left) / r.width * 180, y: (ev.clientY - r.top) / r.height * 135 }; }
  function stationOf(s) { return s[0] === "bake" ? "oven" : (s[0] === "cut" || s[0] === "knead" || s[0] === "decorate" || s[0] === "planer" || s[0] === "shake" || s[1] === "bowl") ? "board" : "stove"; }
  var COOK_EXT = {};   // more kinds of steps can be added from outside (preview)
  function carryFor(prev, next, d) {
    if (prev && prev[0] === "bake") return DISHES[d].art;
    if (next[0] === "bake") return next[1] === "cake" ? "carry_tin" : "carry_dough";
    if (prev && prev[0] === "cut") return "carry_board";
    return "carry_bowl";
  }
  ["carry_board", "carry_bowl", "carry_tin", "carry_dough"].forEach(function (k) { FOOD[k] = k; });
  for (var dk2 in DISHES) FOOD[DISHES[dk2].art] = DISHES[dk2].art;
  var CARRY_SAY = { carry_board: "die geschnittenen Zutaten", carry_bowl: "die Schüssel", carry_tin: "den Kuchen", carry_dough: "das Brot", d_cake: "den Kuchen", d_bread: "das Brot" };
  async function travel(st, carry) {
    front({ hold: carry, holdScale: 2, paws: "hold", eyes: "happy", mouth: "smile" }); var what = CARRY_SAY[carry] || "alles"; say(N() + (st === "oven" ? " schiebt " + what + " in den Ofen." : st === "stove" ? " bringt " + what + " zum Herd." : " trägt " + what + " zum Tisch.")); await wait(350);
    var t = KSPOT[st]; await walkTo(t.x, t.y);
    front({ hold: null, paws: "down", eyes: "happy", mouth: "grin" }); pulse("hop", 300); await wait(450);
  }
  function cookGame(d) {
    return new Promise(function (resolve) {
      var R = DISHES[d], plan = PLAN[d], target = DISH_COLOR[d], items = [], cut = {}, grades = [], cancelled = false, raf, t0 = performance.now(), heatFn = null, bakeFn = null;
      for (var k in R.need) for (var n = 0; n < R.need[k]; n++) items.push(k);
      floaters = []; setLiquid(null); pov.hidden = false; $p("pov-done").hidden = true;
      function head(i, txt) { $p("pov-step").textContent = "Schritt " + (i + 1) + " von " + plan.length; $p("pov-text").textContent = txt; }
      function bar(f) { setPixBar($p("pov-ring"), f); }
      // ---- step: cut every ingredient that needs it on the board, in its own view ----
      function stepCut(i) {
        var list = items.filter(function (k) { return CUTS[k] && !cut[k]; });
        setView("board");
        return list.reduce(function (p, k, idx) { return p.then(function () { return cutOne(i, k, idx, list.length); }); }, Promise.resolve());
      }
      function cutOne(i, k, idx, total) {
        return new Promise(function (res) {
          var sk = BIG[k], w = SZ[sk][0], h = SZ[sk][1], n = CUTS[k], S = 1, gap = 3;
          var W = w, Hh = h, x0 = Math.round(91 - W / 2 - gap * n / 2), y0 = Math.round(84 - Hh / 2), done = 0;
          head(i, (GNAME[k] || k) + " schneiden" + (total > 1 ? " (" + (idx + 1) + "/" + total + ")" : "") + ": tippe auf die Linie.");
          var defs = "", strips = "";
          for (var j = 0; j <= n; j++) {
            var sx = x0 + Math.round(W * j / (n + 1)), id = "cs" + j;
            defs += '<clipPath id="' + id + '"><rect x="' + sx + '" y="' + (y0 - 2) + '" width="' + (Math.round(W * (j + 1) / (n + 1)) - Math.round(W * j / (n + 1))) + '" height="' + (Hh + 4) + '"/></clipPath>';
            strips += '<g class="strip" data-j="' + j + '"><g clip-path="url(#' + id + ')"><g transform="translate(' + x0 + ' ' + y0 + ')">' + A[sk] + '</g></g></g>';
          }
          $p("pov-float").innerHTML = '<defs>' + defs + '</defs>' + strips + '<line id="pov-guide" class="pov-guide" y1="' + (y0 - 8) + '" y2="' + (y0 + Hh + 8) + '" stroke="#fff8ec" stroke-width="1.4" stroke-dasharray="3 2"/>';
          function place() {
            [].forEach.call($p("pov-float").querySelectorAll(".strip"), function (g) { g.style.transform = "translateX(" + gap * Math.min(+g.dataset.j, done) + "px)"; });
            var gx = x0 + Math.round(W * (done + 1) / (n + 1)) + gap * done + 0.5, gl = $p("pov-guide");
            if (done < n) { gl.setAttribute("x1", gx); gl.setAttribute("x2", gx); } else gl.remove();
            return gx;
          }
          var kx = place();
          function knife(x, y) { $p("pov-tool").innerHTML = '<g class="pov-knife" style="transform:translate(' + Math.round(x - 6) + 'px,' + Math.round(y) + 'px)">' + A.knife + '</g>'; }
          knife(kx, y0 - 44);
          var busyCut = false;
          svgEl.onclick = function () {
            if (busyCut || done >= n) return; busyCut = true;
            knife(kx, y0 + Hh - 40); beep([[300 + done * 40, .04]]);
            for (var q = 0; q < 3; q++) $p("pov-fx").insertAdjacentHTML("beforeend", '<rect class="pov-crumb" x="' + (kx + rnd(-4, 4)) + '" y="' + (y0 + Hh + rnd(-2, 4)) + '" width="1.5" height="1.5" fill="#dcae72"/>');
            setTimeout(function () {
              done++; kx = place(); knife(kx, y0 - 44); busyCut = false;
              if (done >= n) { cut[k] = n + 1; setTimeout(function () { $p("pov-fx").innerHTML = ""; res(); }, 650); }
            }, 160);
          };
        });
      }
      // ---- step: drop the ingredients into the pot or bowl ----
      function stepAdd(i, where, extra) {
        return new Promise(function (res) {
          setView(where);
          var list = items.concat(extra || []), added = 0, start = where === "pot" ? (d === "jam" ? "#f2dcc8" : "#7ab0d4") : null;
          var to = where === "bowl" ? null : d === "jam" ? mix(start, target, 0.35) : target;
          setLiquid(start); floaters = [];
          head(i, "Tippe die Zutaten an, dann fallen sie " + (where === "pot" ? "in den Topf." : "in die Schüssel."));
          var board = $p("pov-board"); board.hidden = false;
          board.innerHTML = list.map(function (k, n) { var sk = FOOD[k]; return '<button type="button" class="pov-ing" data-i="' + n + '" aria-label="' + (GNAME[k] || k) + '">' + svgOf(A[sk], SZ[sk][0], SZ[sk][1]) + '</button>'; }).join("");
          board.onclick = function (e) {
            var b = e.target.closest(".pov-ing"); if (!b || b.classList.contains("drop")) return;
            var k = list[+b.dataset.i]; b.classList.add("drop"); setTimeout(function () { b.remove(); }, 400);
            added++;
            var pieces = cut[k] || (PANTRY[k] ? 0 : 1);
            for (var q = 0; q < pieces * (cut[k] ? 2 : 1); q++) floaters.push({ k: cut[k] ? "chunk_" + k : FOOD[k], a: rnd(0, 6.28), r: rnd(0.2, 0.9), sp: rnd(0.25, 0.6) * (Math.random() < 0.5 ? -1 : 1), s: cut[k] ? 1 : 2 });
            if (to) setLiquid(mix(start || "#f6eedc", to, added / list.length));
            if (where === "bowl") {
              if (d === "salad") { if (!bowlK) setBowl("greens"); }
              else if (k === "egg") setBowl("batter");
              else if (k === "flour" && bowlK !== "batter") setBowl("flour");
            }
            beep([[523 + added * 70, .06]]);
            for (var q2 = 0; q2 < 3; q2++) puff(POT.x + rnd(-24, 24), POT.y + rnd(-8, 8), PANTRY[k] === PANTRY.flour ? "#ffffff" : null);
            if (added === list.length) setTimeout(res, 500);
          };
        });
      }
      // ---- step: stir two rounds with the finger ----
      function stepStir(i, where) {
        return new Promise(function (res) {
          $p("pov-board").hidden = true; $p("pov-ring").hidden = false; bar(0);
          head(i, where === "bowl" ? (d === "salad" ? "Mische den Salat: zieh den Finger zwei Runden durch die Schüssel." : d === "bread" ? "Rühre Mehl und Kerne zu einem Teig: zwei Runden mit dem Finger." : "Rühre den Teig: zwei Runden mit dem Finger.") : "Rühre um: zieh den Finger zwei Runden durch den Topf.");
          var ang = Math.PI * 0.55, stir = 0, last = null, fin = false; drawSpoon(ang);
          function more(da) {
            if (fin) return; stir += Math.abs(da); ang += da; drawSpoon(ang); floaters.forEach(function (f) { f.a += da * 0.6; }); bar(stir / (4 * Math.PI));
            if (Math.random() < 0.12 && where === "pot") puff(POT.x + rnd(-26, 26), POT.y + rnd(-6, 6));
            if (where === "bowl" && d === "bread" && bowlK === "flour" && stir > 1.6 * Math.PI) { setBowl("dough"); floaters = []; }
            if (where === "bowl" && d === "cake" && floaters.length && stir > 2.4 * Math.PI) floaters = floaters.filter(function (f, n) { return n % 3 === 0 && stir < 3.2 * Math.PI; });
            if (stir >= 4 * Math.PI) { fin = true; setTimeout(function () { $p("pov-tool").innerHTML = ""; res(); }, 300); }
          }
          function angOf(ev) { var p = svgPt(ev); return Math.atan2((p.y - POT.y) / POT.ry, (p.x - POT.x) / POT.rx); }
          svgEl.onpointerdown = function (ev) { last = angOf(ev); try { svgEl.setPointerCapture(ev.pointerId); } catch (e) {} };
          svgEl.onpointermove = function (ev) { if (last === null) return; var a = angOf(ev), da = a - last; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; last = a; ang = a - da; more(da); };
          svgEl.onpointerup = function () { last = null; };
          svgEl.onclick = function () { more(0.7); };
        });
      }
      // ---- step: bring it to the right heat (a slow pointer and a wide green field) ----
      function stepHeat(i) {
        return new Promise(function (res) {
          $p("pov-ring").hidden = true; $p("pov-gauge").hidden = false; var go = $p("pov-go"); go.hidden = true;
          head(i, "Tippe, wenn der Zeiger im goldenen Feld ist.");
          var h0 = performance.now(); heatFn = function () { return 0.5 + 0.5 * Math.sin((performance.now() - h0) / 950); };
          svgEl.onclick = $p("pov-gauge").onclick = function () { if (!heatFn) return; var v = heatFn(); heatFn = null; svgEl.onclick = $p("pov-gauge").onclick = null; grades.push(Math.abs(v - 0.5) < 0.125 ? 3 : Math.abs(v - 0.5) < 0.26 ? 2 : 1); res(); };
        });
      }
      // ---- step (jam): squash the berries with the masher ----
      function stepMash(i) {
        return new Promise(function (res) {
          $p("pov-board").hidden = true; var n = 0, N = 8;
          head(i, "Zerdrücke die Erdbeeren: tippe 8-mal in den Topf.");
          $p("pov-ring").hidden = false; bar(0);
          var startCol = liqCol;
          svgEl.onclick = function (ev) {
            if (n >= N) return; var p = svgPt(ev);
            if (Math.pow((p.x - POT.x) / 50, 2) + Math.pow((p.y - POT.y) / 30, 2) > 1) return;
            n++; bar(n / N);
            $p("pov-tool").innerHTML = '<g class="pov-press" style="transform:translate(' + Math.round(p.x - 13) + 'px,' + Math.round(p.y - 40) + 'px)">' + A.masher + '</g>';
            if (n % 2 === 0 && floaters.length) { var f0 = floaters.pop(); for (var c = 0; c < 2; c++) floaters.push({ k: "chunk_tomato", a: f0.a + c, r: f0.r, sp: f0.sp, s: 1 }); }
            setLiquid(mix(startCol, target, n / N)); beep([[200 + n * 30, .05]]);
            for (var q = 0; q < 4; q++) $p("pov-fx").insertAdjacentHTML("beforeend", '<circle class="pov-splash" cx="' + (p.x + rnd(-8, 8)) + '" cy="' + (p.y + rnd(-3, 3)) + '" r="1.4" fill="' + target + '"/>');
            setTimeout(function () { $p("pov-fx").innerHTML = ""; }, 500);
            if (n >= N) setTimeout(function () { $p("pov-tool").innerHTML = ""; res(); }, 450);
          };
        });
      }
      // ---- step (bread): knead the dough on the board ----
      function stepKnead(i) {
        return new Promise(function (res) {
          setView("board"); var n = 0, N = 8, lastX = null, dir = 0, run = 0, nAtDown = 0;
          head(i, "Knete den Teig: wische hin und her oder tippe darauf.");
          $p("pov-ring").hidden = false; bar(0);
          function draw(flat) { var k = flat ? "dough_flat" : "dough"; $p("pov-float").innerHTML = '<g transform="translate(' + Math.round(91 - SZ[k][0] / 2) + ' ' + Math.round(76 - SZ[k][1] / 2) + ')">' + A[k] + '</g>'; }
          draw(false);
          function knead() {
            if (n >= N) return; n++; bar(n / N); draw(true); beep([[260 + n * 20, .04]]);
            for (var q = 0; q < 4; q++) puff(91 + rnd(-40, 40), 72 + rnd(-20, 20), "#ffffff");
            setTimeout(function () { draw(false); }, 220);
            if (n >= N) setTimeout(res, 450);
          }
          svgEl.onpointerdown = function (ev) { lastX = svgPt(ev).x; dir = 0; run = 0; nAtDown = n; try { svgEl.setPointerCapture(ev.pointerId); } catch (e) {} };
          svgEl.onpointermove = function (ev) {
            if (lastX === null) return; var x = svgPt(ev).x, dx = x - lastX; lastX = x; var sd = dx > 0 ? 1 : dx < 0 ? -1 : 0;
            if (sd && sd !== dir) { if (run > 18) knead(); dir = sd; run = 0; } run += Math.abs(dx);
          };
          svgEl.onpointerup = function () { svgEl._dragged = run > 18 || n > nAtDown; if (run > 18) knead(); lastX = null; };
          svgEl.onclick = function () { if (svgEl._dragged) { svgEl._dragged = false; return; } knead(); };
        });
      }
      // ---- step: bake in the oven, take it out when it is golden ----
      function stepBake(i, kind) {
        return new Promise(function (res) {
          setView("oven"); $p("pov-ring").hidden = true; $p("pov-bake").hidden = false; var go = $p("pov-go"); go.hidden = true;
          head(i, kind === "cake" ? "Der Kuchen backt. Hol ihn raus, wenn er goldbraun ist." : "Das Brot backt. Hol es raus, wenn es goldbraun ist.");
          var b0 = performance.now(), fin = false, art = A["oven_" + kind];
          function colorAt(p) { return p < 0.5 ? mix("#f6e6bc", "#d89038", p / 0.5) : mix("#d89038", "#5e3018", (p - 0.5) / 0.5); }
          bakeFn = function () {
            var p = Math.min(1, (performance.now() - b0) / 12000), c = colorAt(p);
            $p("pov-float").innerHTML = art.split("#0c0003").join(c).split("#0c0004").join(mix(c, "#000000", 0.25)).split("#0c0005").join(mix(c, "#ffffff", 0.3));
            $p("pov-bake").dataset.p = p; $p("pov-bake").innerHTML = woodBarSvg({ w: 72, col: colorAt, zone: [0.5, 0.667], mark: p });
            if (p >= 1 && !fin) take(p);
          };
          function take(p) { if (fin) return; fin = true; bakeFn = null; svgEl.onclick = $p("pov-bake").onclick = null; grades.push(p >= 0.5 && p <= 0.667 ? 3 : p >= 0.4 && p <= 0.76 ? 2 : 1); res(); }
          svgEl.onclick = $p("pov-bake").onclick = function () { take(Math.min(1, (performance.now() - b0) / 12000)); };
        });
      }
      // ---- step (cake): decorate the top ----
      function stepDecorate(i) {
        return new Promise(function (res) {
          setView("cake"); var n = 0, N = 6, DECO = ["deco_carrot", "deco_seed", "deco_berry"];
          head(i, "Verziere den Kuchen: tippe 6-mal auf die Sahne.");
          $p("pov-ring").hidden = false; bar(0);
          svgEl.onclick = function (ev) {
            if (n >= N) return; var p = svgPt(ev);
            if (Math.pow((p.x - 90) / 40, 2) + Math.pow((p.y - 68) / 24, 2) > 1) return;
            var k = DECO[n % 3]; n++; bar(n / N); beep([[700 + n * 60, .05]]);
            $p("pov-float").insertAdjacentHTML("beforeend", '<g class="pov-pop" transform="translate(' + Math.round(p.x - SZ[k][0] / 2) + ' ' + Math.round(p.y - SZ[k][1] / 2) + ')">' + A[k] + '</g>');
            if (n >= N) setTimeout(res, 600);
          };
        });
      }
      // a short moment after each step: the scene bounces gently and sparkles, then the next one comes
      function stepDone() {
        return new Promise(function (r) {
          if (cancelled) return r();
          svgEl.classList.remove("k-done"); void svgEl.getBoundingClientRect(); svgEl.classList.add("k-done");
          var o = ""; for (var k = 0; k < 8; k++) { var a = k / 8 * 6.283, x = 92 + Math.cos(a) * 34, y = 72 + Math.sin(a) * 20; o += '<g class="k-sp" style="animation-delay:' + (k * 40) + 'ms"><rect x="' + (x - 2).toFixed(0) + '" y="' + y.toFixed(0) + '" width="5" height="1" fill="#f6c84a"/><rect x="' + x.toFixed(0) + '" y="' + (y - 2).toFixed(0) + '" width="1" height="5" fill="#f6c84a"/><rect x="' + x.toFixed(0) + '" y="' + y.toFixed(0) + '" width="1" height="1" fill="#ffffff"/></g>'; }
          $p("pov-steam").insertAdjacentHTML("beforeend", '<g class="k-sps">' + o + '</g>');
          setTimeout(function () { svgEl.classList.remove("k-done"); var g = $p("pov-steam").querySelector(".k-sps"); if (g) g.remove(); r(); }, 850);
        });
      }
      function stepFor(s, i) {
        if (COOK_EXT[s[0]]) return COOK_EXT[s[0]]({ d: d, i: i, s: s, head: head, bar: bar, grades: grades, items: items, cut: cut, target: target });
        if (s[0] === "cut") return stepCut(i);
        if (s[0] === "add") return stepAdd(i, s[1], s[2]);
        if (s[0] === "stir") return stepStir(i, s[1]);
        if (s[0] === "heat") return stepHeat(i);
        if (s[0] === "mash") return stepMash(i);
        if (s[0] === "knead") return stepKnead(i);
        if (s[0] === "bake") return stepBake(i, s[1]);
        return stepDecorate(i);
      }
      var here = stationOf(plan[0]), prev = null;
      plan.reduce(function (p, s, i) { return p.then(function () {
        if (cancelled) return;
        var st = stationOf(s);
        if (st !== here) {
          var c = carryFor(prev, s, d); here = st; pov.hidden = true;
          return travel(st, c).then(function () { pov.hidden = false; prev = s; return stepFor(s, i).then(stepDone); });
        }
        prev = s; return stepFor(s, i).then(stepDone);
      }); }, Promise.resolve()).then(function () {
        if (cancelled) return;
        var stars = grades.length ? Math.min.apply(null, grades) : 3;
        ["pov-gauge", "pov-bake", "pov-go", "pov-ring", "pov-board"].forEach(function (id) { $p(id).hidden = true; });
        var baked = d === "cake" || d === "bread", verb = baked ? "gebacken" : d === "salad" ? "zubereitet" : "gekocht";
        var msg = stars === 3 ? "Perfekt " + verb + "! Es reicht für 2 Portionen." : stars === 2 ? "Gut " + verb + "!" : baked ? "Ein bisschen zu dunkel geraten, schmeckt aber trotzdem." : "Etwas zu heiß geworden, schmeckt aber trotzdem.";
        $p("pov-done").innerHTML = '<div class="pov-card"><div class="pov-dish">' + svgOf(A[R.art], SZ[R.art][0], SZ[R.art][1]) + '</div><b>' + R.name + '</b><span class="pov-stars">' + "★★★".slice(0, stars) + '<s>' + "★★★".slice(stars) + '</s></span><span>' + msg + '</span><button type="button" class="pbtn" id="pov-ok">Fertig</button></div>';
        $p("pov-done").hidden = false; beep(stars === 3 ? [[1047, .1], [1319, .1], [1568, .22]] : [[880, .12], [1047, .2]]);
        $p("pov-ok").onclick = function () { finish(stars); };
      });
      $p("pov-x").onclick = function () { cancelled = true; finish(0); };
      function finish(v) { cancelAnimationFrame(raf); pov.hidden = true; setView("pot"); heatFn = bakeFn = null; resolve(v); }
      (function loop(now) {
        renderFloat((now - t0) / 1000);
        if (heatFn) { var hv = heatFn(); $p("pov-gauge").dataset.v = hv; $p("pov-gauge").innerHTML = woodBarSvg({ w: 44, vertical: true, col: function (t) { t = 1 - t; return t < 0.5 ? mix("#bfe0f0", "#f6c04a", t / 0.5) : mix("#f6c04a", "#d8342a", (t - 0.5) / 0.5); }, zone: [0.375, 0.625], mark: 1 - hv }); }
        if (bakeFn) bakeFn();
        if (view === "pot" && liqCol && Math.random() < 0.05) puff(POT.x + rnd(-30, 30), POT.y + rnd(-6, 8));
        raf = requestAnimationFrame(loop);
      })(t0);
    });
  }
  async function cookSeq(d) {
    var R = DISHES[d], first = KSPOT[stationOf(PLAN[d][0])];
    await walkTo(first.x, first.y);
    front({ eyes: "happy", mouth: "grin", paws: "hold" }); say(N() + (d === "cake" || d === "bread" ? " backt " : d === "salad" ? " macht " : " kocht ") + R.name + "."); await wait(400);
    var stars = await cookGame(d);
    if (!stars) { say("Kochen abgebrochen."); front({ paws: "down" }); return; }
    for (var k in R.need) garden.harvest[k] -= R.need[k];
    var n = stars === 3 ? 2 : 1;
    garden.harvest[d] = (garden.harvest[d] || 0) + n; renderFoods();
    front({ hold: R.art, holdScale: 2, paws: "hold", eyes: "happy", mouth: "grin", blush: true }); pulse("hop", 400); say(N() + " bringt " + R.name + " zum Tisch."); await wait(500);
    await walkTo(KSPOT.table.x - 4, KSPOT.table.y);
    front({ hold: null, paws: "up", eyes: "happy", mouth: "grin", blush: true }); pulse("bighop", 620); renderTable();
    fx("spark", 150, 84, "sparkle"); fx("spark", 158, 80, "sparkle");
    say(R.name + (n > 1 ? " (2 Portionen)" : "") + " steht auf dem Tisch. Du findest es unter „Füttern“."); await wait(700);
    front({ eyes: "happy", mouth: "smile", paws: "down" }); await nibbleNose(6);
  }
  function steam() {
    var e = xEl("div", "k-steam", document.getElementById("k-fx")); e.style.left = (19 + Math.random() * 6) + "%"; e.style.top = "40%";
    setTimeout(function () { e.remove(); }, 1600);
  }
  async function kitchenIdle() {
    var r = Math.random();
    if (r < 0.3) act("kwander", async function () { await walkTo(rnd(70, 130), rnd(114, 126)); front(mood()); await nibbleNose(6); await wait(600); });
    else if (r < 0.55) act("kwarm", async function () { await walkTo(KSPOT.fire.x, KSPOT.fire.y); front({ eyes: "sleep", mouth: "smile", paws: "hold", blush: true }); say(N() + " wärmt sich am Feuer."); for (var i = 0; i < 4; i++) { fx("spark", 40 + rnd(-6, 6), 78 + rnd(-4, 4), "sparkle"); await wait(800); } front({ eyes: "happy", paws: "down" }); });
    else if (r < 0.8) act("ksniff", async function () { await walkTo(KSPOT.stove.x + 6, KSPOT.stove.y); for (var i = 0; i < 6; i++) { standFrame(i % 2); await wait(200); } front({ eyes: "happy", mouth: "grin" }); say(N() + " schnuppert am Topf."); await wait(500); });
    else act("look", lookAround);
  }
  function idleBlocked() { return busy || s.asleep || s.music || decor || document.getElementById("scr-hamster").hidden; }
  var _idle = idle; idle = function () {
    if (place2 === "kitchen") { later(idle, rnd(3500, 7000)); if (!idleBlocked()) kitchenIdle(); return; }
    _idle();
  };
  // light in the kitchen: the hearth glows, the window follows the real sky
  var _skyTime2 = skyTime; skyTime = function () {
    _skyTime2();
    scene.classList.toggle("sleeping", !!s.asleep);   // the spooky purple dusk only while he sleeps; awake, the house stays light
    var ks = document.getElementById("k-sky"); if (ks) ks.className = "sky k-sky " + (document.getElementById("sky").className.replace(/\bsky\b/, "").trim()) + " " + weatherClass();
    if (place2 !== "kitchen") return;
    var n = document.getElementById("night"), ph = daylight(), dark = 0;   // the kitchen stays light too
    n.style.background = dark ? "radial-gradient(ellipse 34% 46% at 21% 62%, rgba(255,170,90,.22) 0%, rgba(24,26,64," + dark * 0.55 + ") 55%, rgba(24,26,64," + dark + ") 100%)" : "radial-gradient(ellipse 34% 46% at 21% 62%, rgba(255,170,90,.12) 0%, rgba(0,0,0,0) 60%)";
    n.classList.add("on");
  };

  // ---------- friendship: visitors stay until sent home, one heart per visit, a present every three ----------
  garden.friends = {};
  var FGIFT = {
    // one present at a time: a single thing, never a whole pile
    igel: { meadow: "toadstools", text: "Fliegenpilze für die Wiese" },
    hare: { seeds: ["gcarrot", 1], text: "ein Tütchen Möhrensamen" },
    squirrel: { deco: "stump", text: "einen Baumstumpf für die Deko" },
    robin: { meadow: "cornflowers", text: "Kornblumen für die Wiese" },
    tit: { meadow: "daisies", text: "Gänseblümchen für die Wiese" },
    fox: { deco: "lantern", text: "eine Laterne für die Deko" },
    mouse: { seeds: ["herbs", 1], text: "ein Tütchen Kräutersamen" },
    badger: { deco: "stones", text: "einen Steinhaufen" }
  };
  // seeds as presents come out of a shuffled bag: every kind turns up equally often
  function seedPick() {
    var ks = Object.keys(CROPS); garden.seedBag = (garden.seedBag || []).filter(function (k) { return CROPS[k]; });
    if (!garden.seedBag.length) { garden.seedBag = ks.slice(); for (var i = ks.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = garden.seedBag[i]; garden.seedBag[i] = garden.seedBag[j]; garden.seedBag[j] = t; } }
    return garden.seedBag.pop();
  }
  function giveFriendGift(id) {
    var g = FGIFT[id] || {}, got = [];
    if (g.meadow && item("meadow", g.meadow) && home.owned.meadow.indexOf(g.meadow) < 0) { home.owned.meadow.push(g.meadow); got.push(item("meadow", g.meadow).name); }
    if (g.deco && item("deco", g.deco) && home.owned.deco.indexOf(g.deco) < 0) { home.owned.deco.push(g.deco); got.push(item("deco", g.deco).name); }
    if (g.seeds && !got.length && seedRoom(g.seeds[0])) { seedAdd(g.seeds[0], 1); got.push("ein Tütchen " + CROPS[g.seeds[0]].name + "-Samen"); }
    if (g.nut && !got.length) { garden.harvest.nut += 1; got.push("eine Haselnuss"); renderFoods(); }
    if (!got.length) { var rr_ = seedOrFurn(); if (!rr_.none) got.push(rr_.text); }
    if (!got.length) got.push("eine dicke Umarmung, denn dein Samenlager ist schon randvoll");
    got = got.slice(0, 1);
    renderCosy(); if (decor) renderCatalog();
    var an = ANIMALS[id];
    var wrap = xEl("div", "gift-wrap", document.getElementById("ham-root") || document.body);
    wrap.innerHTML = '<div class="gift fgift" role="dialog" aria-modal="true" aria-label="Geschenk"><h2>Ein Geschenk!</h2><div class="stage"><svg viewBox="' + an.vb + '" width="132" aria-hidden="true">' + an.svg + '</svg></div><p><b>' + an.name + '</b> ist dein Freund und schenkt dir ' + got.join(", ") + '.</p><div class="row"><button type="button" class="btn primary" data-a="ok">Danke!</button></div></div>';
    wrap.addEventListener("click", function (e) { if (e.target.dataset && e.target.dataset.a) wrap.remove(); });
    say(an.name + " schenkt " + N() + " " + got.join(", ") + ".");
  }
  // ---------- gifts for visitors: only simple things from the garden, and always with a quick "really?" ----------
  function simpleGifts() { return Object.keys(CROPS).concat(["nut"]).filter(function (k) { return (garden.harvest[k] || 0) > 0; }); }
  function giftName(k) { return k === "nut" ? "Haselnuss" : CROPS[k].name; }
  var giftAsk = null;
  function askGift(who, done) {
    if (giftAsk) giftAsk.remove();
    var items = simpleGifts(); if (!items.length) return;
    var el = giftAsk = document.createElement("div"); el.className = "gift-ask pixtext"; scene.appendChild(el);
    function close() { el.remove(); if (giftAsk === el) giftAsk = null; }
    function pickView() {
      el.innerHTML = '<div class="ga-card"><p class="ga-h">Was bekommt ' + who + '?</p><div class="ga-grid">' + items.map(function (k) {
        var fk = FOOD[k] || k; return '<button type="button" data-k="' + k + '">' + svgOf(A[fk], SZ[fk][0], SZ[fk][1]) + '<span>' + giftName(k) + '</span><b>' + garden.harvest[k] + '</b></button>'; }).join("") +
        '</div><button type="button" class="ga-no">Abbrechen</button></div>';
    }
    function confirmView(k) {
      var fk = FOOD[k] || k;
      el.innerHTML = '<div class="ga-card"><p class="ga-ic">' + svgOf(A[fk], SZ[fk][0], SZ[fk][1]) + '</p><p class="ga-h">1 × ' + giftName(k) + ' an ' + who + ' verschenken?</p><p class="ga-s">Danach hast du noch ' + (garden.harvest[k] - 1) + '.</p>' +
        '<div class="ga-row"><button type="button" class="ga-no">Lieber nicht</button><button type="button" class="ga-yes pbtn" data-k="' + k + '">Ja, schenken</button></div></div>';
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) { if (e.target === el) close(); return; }
      if (b.classList.contains("ga-no")) return close();
      if (b.classList.contains("ga-yes")) { var k = b.dataset.k; close(); if ((garden.harvest[k] || 0) > 0) { garden.harvest[k]--; renderFoods(); done(k, giftName(k)); } return; }
      if (b.dataset.k) confirmView(b.dataset.k);
    });
    if (items.length === 1) confirmView(items[0]); else pickView();
  }
  var fcard = xEl("div", "f-card", gEl("g-ui")); fcard.id = "f-card"; fcard.hidden = true;
  function renderFriendCard() {
    if (!visitor) { fcard.hidden = true; return; }
    var id = visitor.id, h = garden.friends[id] || 0, full = Math.min(5, h), an = visitor.an;
    var dishes = simpleGifts();
    var hearts = heartIcons(h);
    fcard.innerHTML = '<span class="fc-pic"><svg viewBox="' + an.vb + '" aria-hidden="true">' + an.svg + '</svg></span><span class="fc-name">' + an.name + '<span class="fc-h" aria-label="' + full + (full === 1 ? ' Herz' : ' Herzen') + '">' + hearts + '</span></span>' +
      (dishes.length && !visitor.fed ? '<button type="button" class="fc-btn" data-a="give">Schenken</button>' : "") + '<button type="button" class="fc-btn bye" data-a="bye">Tschüss</button>';
    fcard.hidden = decor;
  }
  fcard.addEventListener("click", function (e) {
    var a = e.target.closest("[data-a]"); if (!a || !visitor) return;
    if (a.dataset.a === "bye") { var nm = visitor.an.name; leaveVisitor(); say(N() + " winkt " + nm + " zum Abschied."); if (!busy && !s.asleep) act("look", async function () { front({ paws: "up", eyes: "happy", mouth: "smile" }); await wait(500); front({ paws: "side_r" }); await wait(400); front({ paws: "down" }); }); }
    else if (a.dataset.a === "give") {
      var v0 = visitor;
      askGift(v0.an.name, function (k, nm) {
        if (visitor !== v0) return; v0.fed = true; addHeart(v0.id, true);
        fx("heart", v0.x, vHead() - 2, "up"); fx("heart", v0.x + 6, vHead(), "up");
        say(v0.an.name + " freut sich über " + (k === "nut" ? "die Haselnuss" : nm) + "."); renderFriendCard();
      });
    }
  });
  // at most five hearts show; more are still counted behind the scenes
  function heartIcons(h) {
    var o = ""; for (var i = 0; i < 5; i++) o += '<i class="' + (i < h ? "on" : "") + '"></i>';
    return o;
  }
  function addHeart(id, extra) {
    garden.friends[id] = (garden.friends[id] || 0) + 1;
    renderFriendCard();
    if (garden.friends[id] % 3 === 0) setTimeout(function () { uiLater(function () { giveFriendGift(id); renderFriendCard(); }); }, extra ? 900 : 2600);
  }
  leaveVisitor = function () {
    if (!visitor) return; var v = visitor; visitor = null; garden.lastVisit = Date.now(); renderFriendCard();
    var tx = 200, ms = (tx - v.x) / 40 * 1000;
    v.el.classList.add("moving"); v.el.classList.remove("face-l"); v.el.style.transition = "left " + ms + "ms linear, bottom .4s linear"; v.el.style.left = gx(tx);
    setTimeout(function () { v.el.remove(); }, ms + 100);
  };
  spawnVisitor = function (force, want) {
    if (visitor || place2 !== "garden" || weather.type === "storm") return;
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
    say("Besuch: " + an.name + " schaut vorbei!");
    vIdleLoop(visitor);
    el.addEventListener("click", function () { if (!visitor || decor) return; if (visitor.done) greet(); else startScene(); });
    var me = visitor;
    addHeart(id);
    (async function () {
      void el.offsetWidth; el.classList.add("face-l");
      await vWalk(118, 128, 45);                                       // between the bed and the greenhouse, near the front, well away from the exit
      if (visitor !== me) return;
      fx("spark", me.x - 8, vHead() + 4, "sparkle"); fx("spark", me.x + 8, vHead() - 2, "sparkle");
      setTimeout(function () { if (visitor === me && !me.done && !s.asleep) startScene(); }, 2200);
    })();
  };
  startScene = function () {
    if (!visitor || visitor.busy || s.asleep) return;
    if (busy && !interruptible()) return; if (busy) interrupt();
    var v = visitor; v.busy = true;
    act("visit", async function () {
      try {
        await walkTo(GSPOT.meet.x, GSPOT.meet.y); front({ eyes: "look_r", mouth: "open", ears: "up" });
        await vWalk(GSPOT.meet.x + 38, GSPOT.meet.y, 50);
        front({ eyes: "happy", mouth: "grin", paws: "side_r", blush: true }); fx("heart", GSPOT.meet.x + 19, GSPOT.meet.y - 44, "up"); await wait(800);
        front({ paws: "down" });
        await (SCENES[v.id] || SCENES.igel)(v);
        v.done = true;
      } finally { if (visitor === v) v.busy = false; renderFriendCard(); }
    });
  };
  // while a friend stays, the two play together now and then
  var _gardenIdle = gardenIdle; gardenIdle = function () {
    if (visitor && visitor.done && !visitor.busy && (visitor.replays || 0) < 2 && Math.random() < 0.3) { visitor.replays = (visitor.replays || 0) + 1; visitor.done = false; startScene(); return; }   // at most two encores per visit
    if (weather.type === "rain" && Math.random() < 0.35) { act("look", async function () { front({ eyes: "sleep", mouth: "flat", ears: "flat" }); pulse("shake", 500); for (var i = 0; i < 4; i++) fx("drop", H.x + rnd(-10, 10), headY() + 4, "fall", 1, { "--dx": rnd(-6, 6) + "px" }); say(N() + " schüttelt die Regentropfen ab."); await wait(700); front({ eyes: "happy", ears: "up", mouth: "smile" }); }); return; }
    _gardenIdle();
  };

  // ---------- weather ----------
  var WNAME = { sun: "Sonne", clouds: "Wolken", rain: "Regen", storm: "Gewitter", rainbow: "Regenbogen", snow: "Schnee" };
  var gW = xEl("div", "g-weather", gardenEl); gW.id = "g-weather";
  var rbow = xEl("div", "g-rainbow", gEl("g-sky"), xs(A.rainbow_big ? "rainbow_big" : "rainbow")); rbow.id = "g-rainbow";
  function isDay() { var c = document.getElementById("sky").className; return !/sky-(eve|night)/.test(c); }
  function rollWeather() {
    // mostly fine weather; bad weather only now and then, and it passes quickly
    var bad = weather.type === "rain" || weather.type === "storm";
    if (season() === "winter") { var rw = Math.random(); weather.type = bad ? "clouds" : rw < 0.6 ? "snow" : rw < 0.95 ? "clouds" : "storm"; }
    else if (bad) weather.type = isDay() ? "rainbow" : "sun";
    else { var r = Math.random(); weather.type = r < 0.7 ? "sun" : r < 0.88 ? "clouds" : r < 0.97 ? "rain" : "storm"; }
    var DUR = { sun: [10, 16], snow: [8, 14], clouds: [4, 7], rain: [2, 4], storm: [1.5, 2.5] }[weather.type];
    weather.until = Date.now() + (weather.type === "rainbow" ? 45000 : rnd(DUR[0], DUR[1]) * 60000);
    applyWeather();
  }
  function weatherClass() { if (weather.type === "storm" && season() === "winter") return "w-clouds"; return weather.type === "rain" || weather.type === "storm" ? "w-" + weather.type : weather.type === "clouds" ? "w-clouds" : ""; }
  function crownArt(k) {
    var se = season(), c = se === "autumn" ? ["#d8822a", "#a85a1a", "#f0a848"] : se === "spring" ? ["#6aa84a", "#4a8a36", "#9ad070"] : ["#4e8a3a", "#2e6a2a", "#6ea84a"];
    return A[k].split("#0c0003").join(c[0]).split("#0c0004").join(c[1]).split("#0c0005").join(c[2]);
  }
  function stormGlass(host, w, h) {
    if (!host) return;
    var old = host.querySelector(".sky-storm"), on = weather.type === "storm", se = season(), key = se + w;
    if (!on) { if (old) old.remove(); host.classList.remove("w-stormglass", "w-bliz"); return; }
    host.classList.add("w-stormglass"); host.classList.toggle("w-bliz", se === "winter");
    if (old && old.dataset.k === key) return; if (old) old.remove();
    var bliz = se === "winter", o = "", i, lc = se === "autumn" ? ["#e8822a", "#c8463c", "#f0b040"] : ["#6aa84a", "#9ad070", "#4e8a3a"];
    [[0, .3, "#2a3244"], [.3, .55, "#38425a"], [.55, 1, "#46506a"]].forEach(function (b) { o += '<rect x="0" y="' + (b[0] * h) + '" width="' + w + '" height="' + ((b[1] - b[0]) * h + 1) + '" fill="' + (bliz ? ["#9aa6b8", "#b4bfce", "#c8d2de"][b[0] ? b[0] > .5 ? 2 : 1 : 0] : b[2]) + '"/>'; });
    o += '<g class="sp-c2"><g>' + A.sp_cloud2 + '</g><g transform="translate(200 0)">' + A.sp_cloud2 + '</g></g>';
    o += '<g transform="translate(' + Math.round(w * 0.12) + ' ' + Math.round(h - 34) + ')"><g class="sp-bend">' + A.sp_trunk + '<g transform="translate(-3 -9)"><g class="sp-sway b2">' + (bliz ? A.sp_crown2.split("#0c0003").join("#e8eef4").split("#0c0004").join("#c8d2de").split("#0c0005").join("#ffffff") : crownArt("sp_crown2")) + '</g></g></g></g>';
    o += '<rect x="0" y="' + (h - 9) + '" width="' + w + '" height="9" fill="' + (bliz ? "#eef3f8" : "#2e4c2c") + '"/>';
    for (i = 0; i < w; i += 3) o += '<rect class="sp-tuftg" x="' + i + '" y="' + (h - 11) + '" width="2" height="3" fill="' + (bliz ? "#ffffff" : "#3e6a3a") + '"/>';
    if (bliz) {
      for (i = 0; i < 60; i++) o += '<rect class="sz' + (i % 3) + '" x="' + Math.round(rnd(-40, w)) + '" y="' + Math.round(rnd(0, h)) + '" width="1" height="1" fill="#ffffff" style="animation-delay:-' + rnd(0, 1).toFixed(2) + 's"/>';
      o += '<rect class="gl-white" width="' + w + '" height="' + h + '" fill="#f4f8fc"/>';
    } else {
      for (i = 0; i < 40; i++) o += '<rect class="' + (i % 3 ? "rf" : "rn") + '" x="' + Math.round(rnd(-10, w + 40)) + '" y="' + Math.round(rnd(-h, h)) + '" width="1" height="' + (i % 3 ? 4 : 6) + '" fill="#c8d6ea" opacity=".8"/>';
      for (i = 0; i < 6; i++) o += '<g class="lf lf' + (i % 3) + '" style="animation-delay:-' + rnd(0, 2).toFixed(2) + 's;animation-duration:' + rnd(1.2, 2).toFixed(2) + 's"><g transform="translate(-6 ' + Math.round(rnd(6, h - 8)) + ')"><rect class="spin" width="2" height="1" fill="' + lc[i % 3] + '"/></g></g>';
      o += '<g class="bolt bolt1" transform="translate(' + Math.round(w * 0.55) + ' 0) scale(.8)">' + A.sp_bolt + '</g><rect class="gl-flash" width="' + w + '" height="' + h + '" fill="#fffbe8"/>';
    }
    var d = document.createElement("div"); d.className = "sky-storm"; d.dataset.k = key;
    d.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice">' + o + '</svg>';
    host.appendChild(d);
  }
  var roomFlash = xEl("div", "room-flash", scene);
  function applyWeather() {
    stormGlass(document.getElementById("sky"), 34, 43); stormGlass(document.getElementById("k-sky"), 36, 36);
    roomFlash.classList.toggle("on", weather.type === "storm" && season() !== "winter");
    var t = weather.type;
    gardenEl.classList.remove("w-clouds", "w-rain", "w-storm", "w-rainbow");
    if (t !== "sun" && t !== "snow") gardenEl.classList.add("w-" + t);
    var sk = document.getElementById("sky"); ["w-clouds", "w-rain", "w-storm"].forEach(function (c) { sk.classList.toggle(c, weatherClass() === c); });
    var ks = document.getElementById("k-sky"); if (ks) ["w-clouds", "w-rain", "w-storm"].forEach(function (c) { ks.classList.toggle(c, weatherClass() === c); });
    // a storm sends the hamster indoors
    if (t === "storm" && place2 === "garden" && !s.asleep) {
      if (busy) interrupt();
      act("inside", async function () { front({ eyes: "wide", ears: "up", mouth: "open" }); pulse("shake", 400); say("Ein Gewitter! " + N() + " flitzt ins Haus."); await wait(500); if (visitor) leaveVisitor(); await goInsideSeq(); });
    }
  }
  setInterval(function () { if (!weather.override && Date.now() > weather.until) rollWeather(); }, 5000);
  setInterval(function () {
    var t = weather.type; if ((t !== "rain" && t !== "storm") || season() === "winter") return;
    // rain waters the bed
    var now = Date.now(), ch = false;
    garden.plots.forEach(function (p) { if (p && p.wetUntil < now + 1800000) { p.wetUntil = now + 1800000; ch = true; } });
    if (ch && place2 === "garden") renderBed();
    if (place2 !== "garden" || hamHidden()) return;
    var layer = gEl("g-fx"), n = t === "storm" ? 7 : 4;
    for (var i = 0; i < n; i++) {
      var d = document.createElement("i"); d.className = "raindrop"; d.style.left = rnd(0, 100) + "%"; d.style.animationDuration = rnd(0.5, 0.8) + "s";
      layer.appendChild(d); (function (d) { setTimeout(function () { d.remove(); }, 900); })(d);
    }
    if (t === "storm" && Math.random() < 0.04) lightning();
  }, 180);
  function lightning() {
    var f = xEl("div", "flash", scene); setTimeout(function () { f.remove(); }, 450);
    setTimeout(function () { beep([[55, .5]]); }, 300);
  }
  // no going out in a storm: the hamster opens the door a crack and we see what he sees
  var pip = xEl("div", "storm-pip", scene); pip.id = "storm-pip"; pip.hidden = true;
  // the view is the player's own garden (season, meadow, deco, bed and crops), with the trees bending in the wind
  var SBG = /*STORMBG*/;
  var TREES = [["t0", 20, 92, 1.0], ["t1", 68, 88, 0.8], ["t2", 152, 94, 1.1], ["t3", 112, 86, 0.75]];
  var CROP = { x: 20, y: 28, w: 140, h: 105 };
  function buildPip() {
    var se = season(); layoutGarden(); applyWeather();
    var g = gardenEl.cloneNode(true); g.hidden = false; g.removeAttribute("id");
    g.querySelectorAll(".g-ui, .g-exit, .g-visitors, .g-fx, .g-weather, .empty, .flash, .raindrop").forEach(function (e) { e.remove(); });
    g.querySelectorAll("[id]").forEach(function (e) { e.removeAttribute("id"); });
    g.querySelectorAll("button").forEach(function (e) { e.setAttribute("tabindex", "-1"); });
    g.className = "garden season-" + se + " pip-garden";
    g.style.cssText = "position:absolute;inset:auto;left:" + (-CROP.x / CROP.w * 100) + "%;top:" + (-CROP.y / CROP.h * 100) + "%;width:" + (180 / CROP.w * 100) + "%;height:" + (135 / CROP.h * 100) + "%";
    var sky = g.querySelector(".g-sky"), clouds = "";
    if (sky) {
      [[0, 14, "#2e3648"], [14, 28, "#3a4458"], [28, 42, "#4a5468"], [42, 80, "#5a6478"]].forEach(function (b) { clouds += '<rect x="0" y="' + b[0] + '" width="180" height="' + (b[1] - b[0]) + '" fill="' + b[2] + '"/>'; });
      clouds += '<g class="sp-c1"><g>' + A.sp_cloud1 + '</g><g transform="translate(200 0)">' + A.sp_cloud1 + '</g></g><g class="sp-c2"><g transform="translate(0 6)">' + A.sp_cloud2 + '</g><g transform="translate(200 6)">' + A.sp_cloud2 + '</g></g>' +
        '<g class="sp-bolt" transform="translate(96 4)">' + A.sp_bolt + '</g>';
      sky.className = "g-sky pip-sky"; sky.innerHTML = '<svg viewBox="0 0 180 135" preserveAspectRatio="xMidYMin slice">' + clouds + '</svg>';
    }
    var bg = g.querySelector(".g-bg");
    if (bg) {
      var lay = document.createElement("div"); lay.className = "g-bg pip-layers";
      lay.innerHTML = '<img src="' + SBG["far_" + se] + '" alt="" style="left:-16.667%;width:133.333%;top:0;height:100%">' + TREES.map(function (t, n) {
        return '<img class="pip-tree" src="' + SBG[t[0] + "_" + se] + '" alt="" style="left:-16.667%;width:133.333%;top:0;height:100%;transform-origin:' + ((t[1] + 30) / 240 * 100) + '% ' + (t[2] / 135 * 100) + '%;animation-duration:' + (0.7 + n * 0.12).toFixed(2) + 's;animation-delay:-' + (n * 0.21).toFixed(2) + 's;--amp:' + t[3] + '">';
      }).join("") + '<img class="pip-rest" src="' + SBG["rest_" + se] + '" alt="" style="left:-16.667%;width:133.333%;top:0;height:100%">';
      bg.replaceWith(lay);
    }
    var fg = g.querySelector(".g-fg"); if (fg) { fg.src = SBG["fg_" + se]; fg.classList.add("pip-fg"); fg.style.cssText = "left:-16.667%;width:133.333%;top:0;height:100%"; }
    // a real storm: sheets of rain, whirling leaves, lightning; in winter a blizzard
    var bliz = se === "winter", parts = "", i, lc = se === "autumn" ? ["#e8822a", "#c8463c", "#f0b040", "#a8542a"] : ["#6aa84a", "#9ad070", "#4e8a3a", "#c8b45a"];
    if (bliz) {
      for (i = 0; i < 230; i++) { var big = Math.random() < 0.25; parts += '<rect class="sz' + (i % 3) + '" x="' + Math.round(rnd(-40, 180)) + '" y="' + Math.round(rnd(-20, 135)) + '" width="' + (big ? 2 : 1) + '" height="' + (big ? 2 : 1) + '" fill="#ffffff" style="animation-delay:-' + rnd(0, 1.2).toFixed(2) + 's"/>'; }
      for (i = 0; i < 14; i++) parts += '<rect class="drift" x="' + Math.round(rnd(-60, 120)) + '" y="' + Math.round(rnd(95, 132)) + '" width="' + Math.round(rnd(10, 26)) + '" height="1" fill="#ffffff" opacity=".8" style="animation-delay:-' + rnd(0, 1).toFixed(2) + 's"/>';
    } else {
      for (i = 0; i < 170; i++) { var near = i % 3 === 0; parts += '<rect class="' + (near ? "rn" : "rf") + '" x="' + Math.round(rnd(-20, 220)) + '" y="' + Math.round(rnd(-135, 135)) + '" width="1" height="' + (near ? 8 : 5) + '" fill="' + (near ? "#d8e4f4" : "#9fb2cc") + '" opacity="' + (near ? ".85" : ".6") + '"/>'; }
      for (i = 0; i < 34; i++) {
        var w2 = Math.random() < 0.4 ? 4 : 3;
        parts += '<g class="lf lf' + (i % 3) + '" style="animation-delay:-' + rnd(0, 2.4).toFixed(2) + 's;animation-duration:' + rnd(1.3, 2.4).toFixed(2) + 's"><g transform="translate(-10 ' + Math.round(rnd(20, 125)) + ')"><rect class="spin" width="' + w2 + '" height="' + (w2 - 1) + '" fill="' + lc[i % 4] + '" style="animation-duration:' + rnd(.3, .7).toFixed(2) + 's"/></g></g>';
      }
      [[58, 2, 0], [128, 0, 1], [92, 6, 2]].forEach(function (b, n) { parts += '<g class="bolt bolt' + n + '" transform="translate(' + b[0] + ' ' + b[1] + ') scale(' + (n === 1 ? 1.4 : 1) + ')">' + A.sp_bolt + '</g>'; });
    }
    var over = document.createElement("div"); over.className = "pip-over" + (bliz ? " bliz" : "");
    over.innerHTML = '<div class="pip-tint"></div><div class="pip-sheets"></div><svg viewBox="0 0 180 135" preserveAspectRatio="none">' + parts + '</svg>' + (bliz ? '<div class="pip-white"></div>' : '<div class="pip-flash f1"></div><div class="pip-flash f2"></div>');
    g.appendChild(over);
    g.classList.toggle("pip-bliz", bliz);
    pip.innerHTML = '<div class="pip-view"></div><button type="button" class="pip-x" aria-label="Schließen">×</button>';
    pip.firstChild.appendChild(g);
  }
  var pipClose = null;
  async function peekStorm() {
    if (H.where === "chair") await hopOutOfChair();
    await walkTo(SPOT.window.x, SPOT.window.y);
    front({ eyes: "open", mouth: "flat", ears: "up" }); await wait(250);
    backFrame(0); await wait(350);
    say(""); buildPip(); pip.classList.toggle("bliz", season() === "winter"); pip.hidden = false; void pip.offsetWidth; pip.classList.add("on"); beep([[70, .4]]);
    var winter = season() === "winter";
    var flashes = setInterval(function () { if (winter) { beep([[90 + Math.random() * 40, .5]]); return; } setTimeout(function () { beep([[48, .6], [40, .5]]); }, 300); }, winter ? 2600 : 1700);
    var keepBack = setInterval(function () { if (H.sprite !== "back") backFrame(0); }, 250);   // he keeps looking out, whatever happens
    await new Promise(function (res) { pipClose = res; setTimeout(res, 8000); });
    pipClose = null; clearInterval(flashes); clearInterval(keepBack);
    pip.classList.remove("on"); setTimeout(function () { pip.hidden = true; pip.innerHTML = ""; }, 300);
    await wait(250);
    front({ eyes: "wide", mouth: "open", ears: "flat" }); pulse("shake", 500); say(season() === "winter" ? "Brr, ein Schneesturm! Da bleibt " + N() + " lieber drinnen." : "Brr! Da bleibt " + N() + " lieber drinnen."); await wait(900);
    front({ eyes: "happy", mouth: "smile", ears: "up" });
  }
  pip.addEventListener("click", function () { if (pipClose) pipClose(); });
  ["pointerdown", "pointermove", "pointerup", "click"].forEach(function (ev) { ham.addEventListener(ev, function (e) { if (cur === "peek") { e.stopImmediatePropagation(); e.preventDefault(); } }, true); });
  document.getElementById("win").addEventListener("click", function (e) {
    if (decor || weather.type !== "storm") return;
    e.stopImmediatePropagation();
    if (s.asleep) { say("Draußen stürmt es. " + N() + " schläft lieber weiter."); return; }
    if (cur === "peek") return;
    if (busy) interrupt();
    say(N() + " schaut durch die Tür nach draußen …"); act("peek", peekStorm);
  }, true);
  rollWeather();

  // ---------- seasonal festivals ----------
  var festOverride = null;
  function easter(y) { var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return new Date(y, mo - 1, da); }
  function festival() {
    if (festOverride !== null) return festOverride;
    var d = new Date(), v = (d.getMonth() + 1) * 100 + d.getDate();
    if (v >= 1024 && v <= 1031) return "herbst";   // Halloween week, over with the end of October
    if (v >= 1201 && v <= 1223) return "advent";
    if (v >= 1224 && v <= 1226) return "weihnachten";
    if (v >= 1231 || v <= 101) return "silvester";
    var e = easter(d.getFullYear()), diff = (d - e) / 86400000;
    if (diff > -3 && diff < 2) return "ostern";
    return "";
  }
  var FESTNAME = { herbst: "Kürbisfest", advent: "Advent", weihnachten: "Weihnachten", silvester: "Silvester", ostern: "Ostern", "": "kein Fest" };
  var festRoom = xEl("div", "fest-room", roomEl), festGarden = xEl("div", "fest-garden", gardenEl);
  garden.advent = { year: 0, opened: [] }; garden.easter = { year: 0, found: [] }; garden.xmas = 0;
  var EGGS = [[150, 132], [30, 99], [112, 101], [12, 126], [170, 110]];
  function fp(host, k, x, y, cls, extra) {   // place a festival sprite: x/y = top-left in grid units
    if (!SZ[k]) return xEl("div", "fest", null);
    var e = xEl(cls && cls.indexOf("clk") >= 0 ? "button" : "div", "fest " + (cls || ""), host, svgOf(A[k], SZ[k][0], SZ[k][1]) + (extra || ""));
    e.style.left = gx(x); e.style.top = gy(y); e.style.width = gx(SZ[k][0]); return e;
  }
  function batEl(host, n) {
    var b = xEl("div", "fest fest-bat", host, svgOf(A.f_bat0, 15, 8) + svgOf(A.f_bat1, 15, 8));
    b.style.width = gx(15); b.style.top = gy(10 + n * 9); b.style.animationDelay = (-n * 2.7) + "s"; b.style.animationDuration = (7 + n * 1.6) + "s"; return b;
  }
  function adventWeek() { var d = new Date(), day = d.getMonth() === 11 ? d.getDate() : 24; return festOverride ? 3 : day < 7 ? 1 : day < 14 ? 2 : day < 21 ? 3 : 4; }
  function renderFest() {
    var f = festival(), ph = daylight(), night = ph !== "day";
    festRoom.innerHTML = ""; festGarden.innerHTML = "";
    scene.classList.toggle("spooky", f === "herbst" && night);
    var wx = L.win.x;
    if (f === "herbst") {
      fp(festRoom, "f_web", 0, 7, "web"); fp(festRoom, "f_web", 152, 7, "web flip");
      fp(festRoom, "f_hbunting", 5, 6, "garl");
      var jr = fp(festRoom, night ? "jack_on" : "jack_off", wx - 12, 89, "jack  clk");
      var j2 = fp(festRoom, night ? "f_jack1on" : "f_jack1off", L.plant.x - 18, 93, "jack  clk");
      var j3 = fp(festRoom, night ? "f_jack0on" : "f_jack0off", 6, 108, "jack  clk"); j3.style.zIndex = 5;
      fp(festRoom, "f_candle", wx - 18, 96, "cand"); fp(festRoom, "f_candle", L.plant.x - 22, 97, "cand");
      for (var n = 0; n < 3; n++) batEl(festRoom, n);
      var gh = fp(festRoom, "f_ghost", 128, 26, "ghost  clk"); gh.addEventListener("click", function () { gh.classList.add("boo"); setTimeout(function () { gh.classList.remove("boo"); }, 900); say("Huuuh! Das kleine Gespenst sagt: Fröhliches Kürbisfest!"); beep([[220, .2], [180, .3]]); });
      var jg = fp(festGarden, night ? "jack_on" : "jack_off", 88, 85, "jack  clk"); jg.style.zIndex = 102;
      var jg2 = fp(festGarden, night ? "f_jack0on" : "f_jack0off", 20, 96, "jack  clk"); jg2.style.zIndex = 113;
      var jg3 = fp(festGarden, night ? "f_jack1on" : "f_jack1off", 132, 98, "jack  clk"); jg3.style.zIndex = 115;
      for (var m = 0; m < 2; m++) { var bg = batEl(festGarden, m); bg.style.zIndex = 330; }
      [jr, j2, j3, jg, jg2, jg3].forEach(function (j) { j.classList.toggle("lit", night); j.addEventListener("click", function () { j.classList.remove("wob"); void j.offsetWidth; j.classList.add("wob"); say("Fröhliches Kürbisfest!"); }); });
    } else if (f === "advent" || f === "weihnachten") {
      fp(festRoom, "f_garland", 5, 6, "garl");
      fp(festRoom, "f_star", wx + 14, 54, "star");
      if (f === "advent") {
        var cal = xEl("button", "fest advent", festRoom, adventSVG()); cal.style.left = gx(122); cal.style.top = gy(20); cal.style.width = gx(26); cal.setAttribute("aria-label", "Adventskalender");
        cal.addEventListener("click", openAdvent);
        var wr = fp(festRoom, "f_wreath" + adventWeek(), 14, 6, "wreath  clk"); wr.addEventListener("click", function () { say(adventWeek() + ". Advent: " + adventWeek() + (adventWeek() > 1 ? " Kerzen brennen." : " Kerze brennt.")); });
      } else {
        var t = xEl("button", "fest xtree", festRoom, svgOf(A.f_xtree + '<g class="xl">' + A.f_xlights + '</g>', 45, 68)); t.style.left = gx(wx - 46); t.style.top = gy(43); t.style.width = gx(45); t.setAttribute("aria-label", "Weihnachtsbaum");
        t.addEventListener("click", openXmas);
        if (garden.xmas !== new Date().getFullYear()) [["f_gift0", wx - 50, 100], ["f_gift1", wx - 38, 98], ["f_gift2", wx - 22, 102], ["f_gift3", wx - 11, 103]].forEach(function (g) { fp(festRoom, g[0], g[1], g[2], "f-gift"); });
        fp(festRoom, "f_mistle", wx + 16, 13, "mistle");
        [["f_stock0", 128], ["f_stock1", 142], ["f_stock2", 156]].forEach(function (st, i) { fp(festRoom, st[0], st[1], 14 + (i % 2) * 2, "stock"); });
        fp(festRoom, "f_ginger", 18, 89, "ginger"); fp(festRoom, "f_cookies", L.bowl.x + 14, 105, "cookies");
      }
      // twinkling lights along the garden hedge
      var gl = ""; for (var x = 4; x < 178; x += 7) gl += '<rect class="gl' + (x % 3) + '" x="' + x + '" y="' + (93 + Math.round(2 * Math.sin(x / 9))) + '" width="2" height="2" fill="' + ["#ffd84a", "#ff5a5a", "#6ab0ff", "#9ad070"][(x / 7 | 0) % 4] + '"/>';
      var glEl = xEl("div", "fest fest-glights", festGarden, '<svg viewBox="0 0 180 135" preserveAspectRatio="none">' + gl + '</svg>'); glEl.style.zIndex = 98;
    } else if (f === "silvester") {
      fp(festRoom, "f_pbunting", 5, 6, "garl");
      [["f_balloon0", 4, 40], ["f_balloon1", 15, 46], ["f_balloon2", 162, 36], ["f_balloon3", 170, 44]].forEach(function (b, i) { var e = fp(festRoom, b[0], b[1], b[2], "balloon"); e.style.animationDelay = (-i * 0.9) + "s"; });
      var d = new Date(), yr = String(d.getMonth() === 11 ? d.getFullYear() + 1 : d.getFullYear()), dg = "";
      for (var i = 0; i < yr.length; i++) dg += '<g transform="translate(' + (4 + i * 8) + ' 3) scale(2)">' + A["f_dig" + yr[i]] + '</g>';
      var ban = xEl("div", "fest yearban", festRoom, '<svg viewBox="0 0 38 16"><rect x="0.5" y="0.5" width="37" height="15" fill="#3a2e44" stroke="#2b1d12"/>' + dg + '</svg>'); ban.style.left = gx(122); ban.style.top = gy(20); ban.style.width = gx(38);
      startFireworks();
    } else if (f === "ostern") {
      var y = new Date().getFullYear(); if (garden.easter.year !== y) garden.easter = { year: y, found: [] };
      EGGS.forEach(function (e, i) {
        if (garden.easter.found.indexOf(i) >= 0) return;
        var b = xEl("button", "fest egg", festGarden, xs("egg" + i)); b.style.left = gx(e[0] - 4); b.style.bottom = gb(e[1]); b.style.width = gx(8); b.style.zIndex = e[1] + 1; b.setAttribute("aria-label", "Osterei");
        b.addEventListener("click", function () { findEgg(i, e); });
      });
    }
    if (f !== "silvester") stopFireworks();
  }
  function adventSVG() {
    var g = A.advent, y = new Date().getFullYear(); if (garden.advent.year !== y) garden.advent = { year: y, opened: [] };
    var extra = garden.advent.opened.map(function (d) { var i = d - 1, x = 1 + (i % 6) * 4, yy = 5 + Math.floor(i / 6) * 5; return '<rect x="' + x + '" y="' + yy + '" width="3" height="4" fill="#5a3a22"/><rect x="' + (x + 1) + '" y="' + (yy + 1) + '" width="1" height="1" fill="#ffd84a"/>'; }).join("");
    return svgOf(g + extra, 26, 26);
  }
  function openAdvent() {
    var d = new Date(), today = d.getMonth() === 11 ? d.getDate() : garden.advent.opened.length + 1;
    if (today > 24) { say("Alle Türchen sind offen."); return; }
    if (garden.advent.opened.indexOf(today) >= 0) { say("Türchen " + today + " ist schon offen. Morgen kommt das nächste."); return; }
    garden.advent.opened.push(today);
    var r = Math.random(), what;
    if (r < 0.4) { s.treats++; what = "einen Apfel"; } else if (r < 0.75) { var gr_ = seedOrFurn(); what = gr_.none ? "einen Apfel" : gr_.text; if (gr_.none) s.treats++; } else { garden.harvest.nut++; renderFoods(); what = "eine Haselnuss"; }
    renderNeeds(); renderFest();
    say("Türchen " + today + ": " + N() + " findet " + what + ".");
    if (!busy && !s.asleep) act("look", async function () { front({ eyes: "wide", ears: "up", mouth: "open", paws: "up" }); pulse("bighop", 620); await wait(650); front({ eyes: "happy", mouth: "grin", paws: "down", blush: true }); await wait(500); });
  }
  function openXmas() {
    var y = new Date().getFullYear();
    if (garden.xmas === y) { say("Frohe Weihnachten, " + N() + "!"); return; }
    garden.xmas = y; var gr_ = seedOrFurn(); renderNeeds(); renderFest();
    say("Unterm Baum liegt " + (gr_.none ? "ein großer Apfel" : gr_.text) + " für " + N() + ". Frohe Weihnachten!"); if (gr_.none) s.treats++;
    if (!busy && !s.asleep) act("look", async function () { front({ eyes: "happy", mouth: "grin", paws: "up", blush: true }); pulse("bighop", 620); for (var i = 0; i < 3; i++) { fx("heart", H.x + rnd(-12, 12), headY(), "up"); await wait(300); } front({ paws: "down" }); });
  }
  function findEgg(i, e) {
    if (decor) return; if (busy && !interruptible()) return; if (busy) interrupt();
    act("egg", async function () {
      await walkTo(e[0] + (e[0] > 100 ? -14 : 14), Math.max(98, Math.min(128, e[1] - 2)));
      front({ eyes: "wide", ears: "up", mouth: "open" }); await wait(300);
      garden.easter.found.push(i); renderFest();
      front({ hold: null, eyes: "happy", mouth: "grin", paws: "up", blush: true }); pulse("bighop", 620);
      var left = EGGS.length - garden.easter.found.length;
      say(left ? "Ein Osterei! Noch " + left + " versteckt." : "Alle Ostereier gefunden! Dafür gibt es ein Tütchen Möhrensamen.");
      if (!left) { garden.seeds.gcarrot += 1; renderNeeds(); }
      await wait(650); front({ paws: "down" });
    });
  }
  var fwT = null;
  function burst(host, x, y, big) {
    var cols = ["#ff5a5a", "#ffd84a", "#6ab0ff", "#9ad070", "#f4a0c0", "#ffffff"], col = pick(cols), col2 = pick(cols), n = big ? 16 : 10;
    for (var k = 0; k < n * 2; k++) {
      var p = document.createElement("i"); p.className = "fw" + (k >= n ? " fw2" : ""); p.style.left = x + "%"; p.style.top = y + "%";
      p.style.background = k >= n ? col2 : col; p.style.setProperty("--a", (k * 360 / n + (k >= n ? 11 : 0)) + "deg"); p.style.setProperty("--d", (big ? (k >= n ? 18 : 34) : (k >= n ? 12 : 22)) + "px");
      host.appendChild(p); (function (p) { setTimeout(function () { p.remove(); }, 1400); })(p);
    }
  }
  function startFireworks() {
    if (fwT) return;
    fwT = setInterval(function () {
      if (hamHidden()) return;
      var host = place2 === "garden" ? gEl("g-sky") : place2 === "kitchen" ? document.getElementById("k-sky") : place2 === "bedroom" ? document.getElementById("b-sky") : document.getElementById("sky");
      if (!host) return;
      burst(host, rnd(15, 85), rnd(12, 50), place2 === "garden");
      if (Math.random() < 0.5) setTimeout(function () { burst(host, rnd(15, 85), rnd(12, 50), place2 === "garden"); }, 350);
      beep([[90, .05], [1400, .03]]);
      var fl = xEl("div", "fw-glow", scene); fl.style.background = pick(["rgba(255,90,90,.12)", "rgba(255,216,74,.12)", "rgba(106,176,255,.12)"]); setTimeout(function () { fl.remove(); }, 500);
      if (place2 === "room" && Math.random() < 0.3) for (var c = 0; c < 14; c++) fx("crumb", rnd(10, 170), rnd(8, 30), "confetti", 2, { "--dx": rnd(-20, 20) + "px", "background": pick(["#ff5a5a", "#ffd84a", "#6ab0ff", "#9ad070", "#f4a0c0"]) });
    }, 1100);
  }
  function stopFireworks() { clearInterval(fwT); fwT = null; }
  var _skyTime3 = skyTime; skyTime = function () { _skyTime3(); if (festival() === "herbst") renderFest(); };
  setTimeout(renderFest, 0);   // the decorations' art is merged a moment later (house.js)

  // ---------- preview controls for the extras ----------
  $g("d-weather").addEventListener("click", function () {
    var order = ["sun", "clouds", "rain", "storm", "rainbow"]; if (season() === "winter") order = ["snow", "clouds", "storm"];
    var i = order.indexOf(weather.type); weather.type = order[(i + 1) % order.length]; weather.override = weather.type !== "rainbow"; weather.until = Date.now() + (weather.type === "rainbow" ? 45000 : 600000); applyWeather();
    say("Wetter: " + (weather.type === "storm" && season() === "winter" ? "Schneesturm" : WNAME[weather.type]));
  });
  $g("d-fest").addEventListener("click", function () {
    var order = [null, "herbst", "advent", "weihnachten", "silvester", "ostern", ""], i = order.indexOf(festOverride);
    festOverride = order[(i + 1) % order.length]; renderFest();
    say("Fest: " + FESTNAME[festival()] + (festOverride === null ? " (echtes Datum)" : ""));
  });
  $g("d-harvest").addEventListener("click", function () { Object.keys(CROPS).forEach(function (c) { garden.harvest[c] = (garden.harvest[c] || 0) + 2; garden.seeds[c] = (garden.seeds[c] || 0) + 1; }); renderFoods(); say("Je 2 Ernte und 1 Samen von jeder Pflanze dazu."); });
  kEnter.hidden = false;

  // ---------- the hamster's words: a little pixel box at the top of the game window ----------
  statusEl.classList.add("say-box"); scene.appendChild(statusEl);
  var sayTimer = null;
  say = function (t) {
    statusEl.textContent = t || ""; statusEl.classList.toggle("on", !!t);
    clearTimeout(sayTimer); if (t) sayTimer = setTimeout(function () { statusEl.classList.remove("on"); }, Math.max(3500, t.length * 70));
  };
  say(statusEl.textContent);

  // ---------- furnishing the kitchen: three choices each ----------
  var KCATS = [
    { id: "hearth", name: "Kochstelle", names: ["Backsteinkamin", "Feldsteinkamin", "Kachelherd"], vb: "8 5 62 96" },
    { id: "oven", name: "Ofen", names: ["Eisenofen", "Emailleherd", "Kachelofen"], vb: "64 56 56 44" },
    { id: "window", name: "Fenster", names: ["Rundfenster", "Fensterläden", "Bogenfenster"], vb: "112 12 66 50" },
    { id: "rug", name: "Teppich", names: ["Flechtteppich", "Flickenläufer", "Karoteppich"], vb: "4 103 76 27" },
    { id: "wall", name: "Wand", names: ["Lehmputz", "Blümchentapete", "Weißer Stein"], vb: "60 2 62 62" },
    { id: "floor", name: "Boden", names: ["Dielen", "Fischgrät", "Steinplatten"], vb: "0 99 90 36" }
  ];
  if (!home.kitchen) home.kitchen = { hearth: 0, oven: 0, window: 0, rug: 0, wall: 0, floor: 0 };
  function kLayers(k) {
    return ["kw_" + k.wall + "_" + k.window, "kf_" + k.floor, "k_back", "kh_" + k.hearth, "ko_" + k.oven, "kwin_" + k.window, "kr_" + k.rug, "k_front"];
  }
  function renderKitchenArt() {
    var k = home.kitchen; kitchenEl.querySelector(".k-bg").innerHTML = svgOf(kLayers(k).map(function (x) { return A[x]; }).join(""), 180, 135);
  }
  renderKitchenArt();
  var kCat = "hearth";
  var kCatalog = document.createElement("section"); kCatalog.className = "catalog k-catalog"; kCatalog.id = "k-catalog"; kCatalog.hidden = true;
  var decorBtn = document.getElementById("decor-btn"); decorBtn.parentNode.insertBefore(kCatalog, decorBtn.nextSibling);
  var kSel = xEl("div", "k-sel", kitchenEl); kSel.hidden = true;
  var KSEL = { hearth: [8, 5, 62, 96], oven: [64, 58, 56, 42], window: [112, 12, 66, 50], rug: [4, 103, 76, 27], wall: [6, 7, 168, 90], floor: [0, 99, 180, 36] };
  function thumb(cat, i) {
    var k = {}; for (var x in home.kitchen) k[x] = home.kitchen[x]; k[cat] = i;
    var c = KCATS.filter(function (q) { return q.id === cat; })[0];
    var layers = cat === "wall" ? ["kw_" + i + "_" + k.window, "k_back"] : cat === "floor" ? ["kf_" + i] : cat === "window" ? ["kw_" + k.wall + "_" + i, "kwin_" + i] : cat === "rug" ? ["kf_" + k.floor, "kr_" + i] : ["kw_" + k.wall + "_" + k.window, cat === "hearth" ? "kh_" + i : "ko_" + i];
    return '<svg viewBox="' + c.vb + '" aria-hidden="true">' + (cat === "window" ? '<rect x="120" y="14" width="50" height="46" fill="#9cd0f0"/>' : "") + layers.map(function (x) { return A[x]; }).join("") + '</svg>';
  }
  function renderKCatalog() {
    var c = KCATS.filter(function (q) { return q.id === kCat; })[0];
    kCatalog.innerHTML = '<div class="tabs k-tabs">' + KCATS.map(function (q) { return '<button type="button" class="tab" data-k="' + q.id + '" aria-pressed="' + (q.id === kCat) + '">' + q.name + '</button>'; }).join("") + '</div>' +
      '<p class="k-cat-title">' + c.name + ' auswählen</p><div class="k-items">' + [0, 1, 2].map(function (i) {
        return '<button type="button" class="item k-item" data-i="' + i + '" aria-pressed="' + (home.kitchen[kCat] === i) + '"><div class="ic">' + thumb(kCat, i) + '</div><span>' + c.names[i] + '</span></button>';
      }).join("") + '</div>';
    var r = KSEL[kCat]; kSel.hidden = false;
    kSel.style.left = (r[0] / 180 * 100) + "%"; kSel.style.top = (r[1] / 135 * 100) + "%"; kSel.style.width = (r[2] / 180 * 100) + "%"; kSel.style.height = (r[3] / 135 * 100) + "%";
  }
  kCatalog.addEventListener("click", function (e) {
    var t = e.target.closest(".tab"); if (t) { kCat = t.dataset.k; renderKCatalog(); return; }
    var it = e.target.closest(".k-item"); if (!it) return;
    home.kitchen[kCat] = +it.dataset.i; renderKitchenArt(); renderKCatalog(); beep([[880, .04], [1175, .06]]);
  });
  var _setDecor = setDecor;
  function decorLabel() { decorBtn.textContent = decor ? "Fertig eingerichtet" : place2 === "garden" ? "Garten einrichten" : place2 === "kitchen" ? "Küche einrichten" : "Zimmer einrichten"; }
  setDecor = function (on) {
    if (place2 === "kitchen") {
      decor = on; scene.classList.toggle("decor", on); decorBtn.setAttribute("aria-pressed", on);
      kCatalog.hidden = !on; kSel.hidden = !on; document.getElementById("catalog").hidden = true;
      if (on) { document.getElementById("foods").hidden = true; document.getElementById("tracks").hidden = true; document.getElementById("k-ui").innerHTML = ""; if (busy) interrupt(); renderKCatalog(); }
    } else { kCatalog.hidden = true; kSel.hidden = true; _setDecor(on); }
    decorLabel();
  };
  var _showPlace2 = showPlace;
  showPlace = function (p) {
    if (decor) setDecor(false);
    _showPlace2(p); decorBtn.hidden = false; decorLabel();
  };
  decorLabel();
