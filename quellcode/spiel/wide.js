  // ===================== the wide living room: to the right of the old room, a music nook with a piano and a bay window seat =====================
  // The room is now 360 wide. A camera (camX, 0..180) slides the room, the hamster and his little effects together;
  // swipe the room to look around, and the camera follows the hamster when he walks out of view.
  // ===================== the living room with the hall (approved layout "tuer-sage") =====================
  // The old room keeps its coordinates; the hall with the front door lies to the left of it (x -96..-4, a wooden post at -4),
  // the wall ends at 246 behind the gramophone corner. The camera runs from -96 to 66.
  var DI = /*DIELE*/;
  var RX0 = -96, RX1 = 246, CAM0 = RX0, CAM1 = RX1 - 180;
  var wRoom = document.getElementById("room");
  scene.classList.add("wide-room");
  var wWain = xEl("img", "wide-wain", wRoom); wWain.src = DI.wain; wWain.alt = ""; place(wWain, RX0, 0, RX1 - RX0); wWain.style.height = gy(135);
  var wDFloor = xEl("div", "floor dfloor", wRoom); wDFloor.dataset.slot = "dfloor"; wDFloor.setAttribute("role", "button"); wDFloor.setAttribute("aria-label", "Dielenboden"); place(wDFloor, RX0, 100, 92); wDFloor.style.height = gy(35);
  var wLay = xEl("div", "wide-lay", wRoom); place(wLay, 0, 0, 180); wLay.style.height = gy(135);
  wLay.innerHTML = '<div class="wide-view"><div class="wb-garden" id="wb-sky"></div></div><img class="wide-art" alt="" src="' + DI.back + '">' +
    '<button type="button" class="wide-hit" data-w="bench" aria-label="Bank"></button><button type="button" class="wide-hit" data-w="coat" aria-label="Mantel"></button><button type="button" class="wide-hit" data-w="hat" aria-label="Strohhut"></button>';
  var wArt = wLay.querySelector(".wide-art"); place(wArt, RX0, 0, RX1 - RX0); wArt.style.height = "100%";
  [["bench", -38, 87, 28, 17], ["coat", -38, 49, 13, 30], ["hat", -31, 46, 15, 9]].forEach(function (q) { var b = wLay.querySelector('[data-w="' + q[0] + '"]'); place(b, q[1], q[2], q[3]); b.style.height = gy(q[4]); });
  var wView = wLay.querySelector(".wide-view"); place(wView, 161, 31, 38); wView.style.height = gy(32);
  var wbSkyEl = wLay.querySelector("#wb-sky"); wbSkyEl.style.cssText = "left:-68.421%;width:236.842%;top:-21.875%;height:210.938%";   /* the garden frame 90x67.5 around the 38x32 glass */
  // the gramophone on its record cabinet is a piece of furniture now (four colours)
  var wGram = xEl("div", "slot slot-gram", wRoom); wGram.dataset.slot = "gram"; wGram.setAttribute("role", "button"); wGram.setAttribute("aria-label", "Grammophon"); place(wGram, 105, 38, 40);
  [wDFloor, wGram].forEach(function (el) { el.addEventListener("click", function () { if (!decor) return; curCat = el.dataset.slot; renderCatalog(); }); });
  wGram.addEventListener("click", function () { if (decor || s.asleep) return; if (busy && !interruptible()) return; if (busy) interrupt(); say(N() + " legt eine Platte auf."); act("gram", playGram); });
  CATS.dfloor = "Dielenboden"; CATS.gram = "Grammophon"; ROOM_CATS.push("dfloor", "gram");
  // the front door used to be the movable terrace door; whatever save we load, it stands in the hall now
  // the view out of the bay window is the real garden at half size, drawn with half as many pixels: the season's trees, hedge and meadow, the sky of the hour and every weather
  var WBH = /*WBHALF*/;   // the garden layers at half size: one pixel = one room pixel, like everything in front of the window
  var wbSky = wView.querySelector("#wb-sky"), wbKey = "";
  function wBayScene() {
    var se = season(), wt = weather.type, bliz = wt === "storm" && se === "winter", i;
    var skyCls = (document.getElementById("sky").className.match(/sky-(eve|night)/) || [""])[0];
    var key = se + wt + skyCls; if (key === wbKey) return; wbKey = key;
    var L = function (src, cls) { return '<img class="map-l ' + (cls || "") + '" src="' + src + '" alt="" style="left:-16.667%;width:133.333%;top:0;height:100%">'; };
    var o = '<div class="map-sky ' + skyCls + ' mw-' + wt + '"></div>';
    if (wt === "rainbow" && A.rainbow) o += '<svg class="map-l" viewBox="0 0 180 135" aria-hidden="true"><g transform="translate(2 -4)" opacity=".85">' + (A.rainbow_big || A.rainbow) + '</g></svg>';
    if (wt === "clouds" || wt === "rain" || wt === "storm") o += '<svg class="map-l map-wx" viewBox="0 0 180 135" aria-hidden="true"><g class="sp-c2"><g transform="translate(0 6)">' + A.sp_cloud2 + '</g><g transform="translate(200 6)">' + A.sp_cloud2 + '</g></g></svg>';
    o += L(WBH["far_" + se]);
    TREES.forEach(function (t, n) { o += '<img class="map-l map-tree" src="' + WBH[t[0] + "_" + se] + '" alt="" style="left:-16.667%;width:133.333%;top:0;height:100%;transform-origin:' + ((t[1] + 30) / 240 * 100) + '% ' + (t[2] / 135 * 100) + '%;--amp:' + t[3] + ';animation-delay:-' + (n * 0.2) + 's">'; });
    // below the picture the meadow goes on (the door window sits lower and sees more ground): the meadow once more, 20 rows further down
    var M = function (src) { return '<img class="map-l" src="' + src + '" alt="" style="left:-16.667%;width:133.333%;top:29.63%;height:100%;clip-path:inset(70% 0 0 0)">'; };
    o += M(WBH["rest_" + se]) + M(WBH["fg_" + se]);
    o += L(WBH["rest_" + se]) + L(WBH["fg_" + se]);
    var w = "", lc = se === "autumn" ? ["#e8822a", "#c8463c", "#f0b040"] : ["#6aa84a", "#9ad070", "#4e8a3a"];
    if (wt === "rain" || (wt === "storm" && !bliz)) {
      for (i = 0; i < (wt === "storm" ? 90 : 45); i++) w += '<rect class="' + (i % 3 ? "rf" : "rn") + '" x="' + Math.round(rnd(-20, 220)) + '" y="' + Math.round(rnd(-135, 135)) + '" width="2" height="' + (i % 3 ? 6 : 10) + '" fill="#c8d6ea" opacity=".75"/>';
      if (wt === "storm") {
        for (i = 0; i < 8; i++) w += '<g class="lf lf' + (i % 3) + '" style="animation-delay:-' + rnd(0, 2).toFixed(2) + 's;animation-duration:' + rnd(1.4, 2.4).toFixed(2) + 's"><g transform="translate(-6 ' + Math.round(rnd(20, 110)) + ')"><rect class="spin" width="4" height="2" fill="' + lc[i % 3] + '"/></g></g>';
        w += '<g class="bolt" transform="translate(40 0)">' + A.sp_bolt + '</g>';
      }
    } else if (wt === "snow" || bliz) {
      for (i = 0; i < (bliz ? 130 : 60); i++) w += '<rect class="' + (bliz ? "sz" + (i % 3) : "msn") + '" x="' + Math.round(rnd(-40, 180)) + '" y="' + Math.round(rnd(-20, 135)) + '" width="2" height="2" fill="#ffffff" style="animation-delay:-' + rnd(0, 4).toFixed(2) + 's"/>';
    }
    if (w) o += '<svg class="map-l map-wx" viewBox="0 0 180 135" preserveAspectRatio="none" aria-hidden="true">' + w + '</svg>';
    o += '<div class="map-tint mt-' + wt + (bliz ? " mt-bliz" : "") + '"></div>';
    if (skyCls) o += '<div class="map-tint ' + skyCls + '" style="background:' + (skyCls === "sky-night" ? "rgba(12,16,48,.45)" : "rgba(80,46,72,.18)") + '"></div>';
    if (wt === "storm" && !bliz) o += '<div class="map-flash"></div>';
    wbSky.className = "wb-garden map-scene" + (wt === "storm" ? " stormy" : "");
    wbSky.innerHTML = o;
    wbHtml = o; wbStormy = wt === "storm";
    // the door window looks onto the same garden: same pixel size, same horizon, and the panorama repeats every 120 room px
    var dsk = document.getElementById("sky");
    if (dsk) { var dg = dsk.querySelector(".door-garden"); if (!dg) { dg = document.createElement("div"); dsk.appendChild(dg); } dg.className = "wb-garden door-garden map-scene" + (wt === "storm" ? " stormy" : ""); dg.innerHTML = o; dsk.classList.add("has-garden"); }
  }
  // the door can be moved: the garden behind its window shifts so it stays one landscape with the bay window's (the picture repeats every 120 px)
  function wDoorPos() {
    var dg = document.querySelector("#sky .door-garden"); if (!dg) return;
    var sx = L.win.x + 7, base = 108 + 120 * Math.floor((sx - 108) / 120);
    if (sx + 34 > base + 120) base += 120 - (sx + 34 - base);   // never across the seam of the picture
    dg.style.left = ((base + 15 - sx) / 34 * 100).toFixed(3) + "%";
  }
  // the kitchen and bedroom windows look onto the same real garden, at the same pixel size
  var wbHtml = "", wbStormy = false, WINSZ = { "k-sky": [36, 36], "b-sky": [36, 36], "bt-sky": [28, 36] };
  function wWinScenes() {
    if (!wbHtml) return;
    Object.keys(WINSZ).forEach(function (id) {
      var h = document.getElementById(id); if (!h) return; var w = WINSZ[id][0], hh = WINSZ[id][1];
      var g = h.querySelector(".win-garden"); if (!g) { g = document.createElement("div"); h.appendChild(g); }
      if (g.dataset.k === wbKey) return; g.dataset.k = wbKey;
      g.className = "wb-garden win-garden map-scene" + (wbStormy ? " stormy" : "");
      g.style.cssText = "width:" + (90 / w * 100).toFixed(3) + "%;height:" + (67.5 / hh * 100).toFixed(3) + "%;left:" + (-(90 - w) / 2 / w * 100).toFixed(3) + "%;top:" + (-16 / hh * 100).toFixed(3) + "%";   /* the tree tops, hedge and a strip of meadow */
      g.innerHTML = wbHtml; h.classList.add("has-garden");
    });
  }
  function wViewSync() { try { wBayScene(); wDoorPos(); wWinScenes(); } catch (e) {} }
  setInterval(wViewSync, 2000); setTimeout(wViewSync, 300);
  // wallpaper and floor are twice as wide now: their tiles are sized in % of the element, so halve the % to keep the pixel size
  function wTiles() {
    ["wallpaper", "floor", "wp-twinkle"].forEach(function (id) {
      var el = document.getElementById(id); if (!el) return; var bs = el.style.backgroundSize;
      if (!bs || el._wfix === bs) return; var m = /^([\d.]+)%(.*)$/.exec(bs); if (!m) return;
      el.style.backgroundSize = (parseFloat(m[1]) / ((RX1 - RX0) / 180)) + "%" + m[2]; el._wfix = el.style.backgroundSize;
    });
  }
  var _w_renderRoom = renderRoom; renderRoom = function () { var r = _w_renderRoom.apply(this, arguments); wTiles(); return r; };
  wTiles(); setInterval(wTiles, 1000);
  // ---- the camera ----
  var camX = 0, camAnim = 0, camUser = 0;
  function camOn() { return place2 === "room"; }   // also while furnishing: the camera then goes to the piece being chosen
  // the camera moves the room and the hamster with a compositor translate (no relayout, no restyling of the whole scene);
  // the CSS variable for the little effects is only refreshed now and then
  var camVarT = 0;
  function camApply() {
    var on = scene.classList.contains("cam-on"), px = on ? -camX / 180 * scene.clientWidth : 0, tr = px ? px.toFixed(2) + "px 0" : "";
    wRoom.style.translate = tr;
    for (var i = 0; i < scene.children.length; i++) { var ch = scene.children[i]; if (ch.classList.contains("hamster") || ch.classList.contains("thought")) ch.style.translate = tr; }
    if (ham.parentNode !== scene && ham.style.translate) ham.style.translate = "";
  }
  function camVar() { camVarT = 0; scene.style.setProperty("--camp", (camX / 180 * 100).toFixed(3) + "%"); }
  function camSet(x) { camX = Math.max(CAM0, Math.min(CAM1, x)); camApply(); if (!camVarT) camVarT = setTimeout(camVar, 300); }
  function camTo(x, ms) {
    cancelAnimationFrame(camAnim); var x0 = camX, x1 = Math.max(CAM0, Math.min(CAM1, x)), t0 = performance.now(); ms = Math.max(350, ms || 500);
    (function step(t) { var u = Math.min(1, (t - t0) / ms); camSet(x0 + (x1 - x0) * u); if (u < 1) camAnim = requestAnimationFrame(step); })(t0);
  }
  function camState() { var on = camOn(); scene.classList.toggle("cam-on", on); if (!on && camX) { cancelAnimationFrame(camAnim); camSet(0); } camApply(); }
  var _w_showPlace = showPlace; showPlace = function (p) { var r = _w_showPlace.apply(this, arguments); camState(); return r; };
  setInterval(camState, 700); camState();
  // the hamster walks with the camera: positions stay in room units, the screen follows him when he leaves the view
  var _w_moveTo = moveTo;
  moveTo = function (x, y, ms) {
    if (place2 === "room" && x === -14) { x = -112; arguments[0] = x; }   // the stairs and the bath lie on the far side of the hall now
    _w_moveTo.apply(this, arguments);
    if (!camOn() || decor || Date.now() - camUser < 2500) return;
    if (x < camX + 26 || x > camX + 154) camTo(x - 90, ms);
  };
  freeze = function () {
    var r = ham.getBoundingClientRect(), sc = scene.getBoundingClientRect(); if (!sc.width) return;
    var off = scene.classList.contains("cam-on") && ham.parentNode === scene ? camX : 0;
    _w_moveTo((r.left + r.width / 2 - sc.left) / sc.width * GW + off, (r.bottom - sc.top) / sc.height * GH, 0);
  };
  var _w_walkTo = walkTo; walkTo = function (x, y, sp) { if (place2 === "room" && x === -14) x = -112; return _w_walkTo(x, y, sp); };
  // ---- swiping the room ----
  var wPan = null, wSwallow = false;
  scene.addEventListener("pointerdown", function (e) {
    if (!camOn() || decor || e.button > 0) return;
    if (!wRoom.contains(e.target) || e.target.closest(".hamster")) return;
    wPan = { x: e.clientX, c: camX, w: scene.getBoundingClientRect().width, on: false, id: e.pointerId };
  }, true);
  scene.addEventListener("pointermove", function (e) {
    if (!wPan || e.pointerId !== wPan.id) return; var dx = e.clientX - wPan.x;
    if (!wPan.on && Math.abs(dx) > 9) { wPan.on = true; cancelAnimationFrame(camAnim); }
    if (wPan.on) { camUser = Date.now(); camSet(wPan.c - dx / wPan.w * 180); }
  }, true);
  function wPanEnd() { if (wPan && wPan.on) wSwallow = true; wPan = null; }
  scene.addEventListener("pointerup", wPanEnd, true); scene.addEventListener("pointercancel", wPanEnd, true);
  scene.addEventListener("click", function (e) { if (wSwallow) { wSwallow = false; e.stopPropagation(); e.preventDefault(); } }, true);
  // ---- what he does over here ----
  IDLE_ACTS.push("gram", "bench", "nook");
  var GRAM_TUNE = [[392, .2], [330, .2], [392, .2], [523, .4], [494, .2], [440, .2], [392, .4], [330, .2], [349, .2], [392, .2], [330, .5]];
  async function playGram() {   // he winds the crank, puts the needle on, and the old record plays
    if (!home.placed.gram) return;
    await walkTo(124, 116); H.dir = 1;
    backFrame(0); await wait(300);
    for (var k = 0; k < 4; k++) { backFrame(k % 2); beep([[180 + k * 20, .05]]); await wait(220); }
    front({ eyes: "happy", mouth: "smile" }); pulse("hop", 300); await wait(300);
    for (var i = 0; i < GRAM_TUNE.length; i++) {
      beep([GRAM_TUNE[i]]);
      if (i % 2 === 0) fx("note", 132 + rnd(-6, 8), 40 + rnd(-6, 2), "up", 1.1);
      if (i % 3 === 0) front({ eyes: "happy", mouth: i % 2 ? "smile" : "open" });
      await wait(GRAM_TUNE[i][1] * 1000 + 120);
    }
    front({ eyes: "happy", mouth: "grin", paws: "up" }); pulse("hop", 300); await wait(700); settle();
  }
  async function sitOnBench() {   // a rest on the bench in the hall, under the coat and the straw hat
    await walkTo(-24, 118); H.dir = 1;
    pulse("hop", 300); _w_moveTo(-24, 101, 300); await wait(340);
    front({ eyes: "happy", mouth: "smile" }); await nibbleNose(4); await wait(1200);
    front({ eyes: "half", mouth: "flat" }); await wait(1400); front(mood()); await wait(500);
    pulse("hop", 300); _w_moveTo(-24, 118, 300); await wait(340); settle();
  }
  async function strollHall() { await walkTo(rnd(-80, -30), rnd(118, 128)); front(mood()); await nibbleNose(5); await wait(600); }
  async function strollRight() { await walkTo(rnd(140, 236), rnd(119, 128)); front(mood()); await nibbleNose(5); await wait(600); }
  var _w_wander = wander;
  wander = async function () {
    if (place2 !== "room") return _w_wander();
    var r = Math.random();
    if (r < .12 && home.placed.gram) return playGram();
    if (r < .22) return sitOnBench();
    if (r < .36) return strollHall();
    if (r < .5) return strollRight();
    return _w_wander();
  };
  wLay.addEventListener("click", function (e) {
    var b = e.target.closest(".wide-hit"); if (!b) return; e.stopPropagation();
    if (decor || s.asleep) return;
    if (b.dataset.w === "coat") { say("Der Mantel riecht ein bisschen nach Sonnenblumenkernen."); return; }
    if (b.dataset.w === "hat") { say("Der Strohhut für sonnige Gartentage."); return; }
    if (busy && !interruptible()) return; if (busy) interrupt();
    say(N() + " setzt sich auf die Bank."); act("bench", sitOnBench);
  });
  // ---- the way to the kitchen is now at the right end of the long room ----
  goKitchenSeq = async function () {
    if (H.where === "chair") await hopOutOfChair();
    if (place2 === "garden") await goInsideSeq();
    await walkTo(RX1 + 16, 120); fadeX(false); await wait(250);
    showPlace("kitchen"); moveTo(-14, 120, 0); fadeX(true);
    say(N() + " ist in der Küche."); await walkTo(KSPOT.home.x, KSPOT.home.y);
    front({ eyes: "happy", mouth: "grin", blush: true }); await nibbleNose(6);
  };
  goRoomFromKitchen = async function () {
    if (place2 !== "kitchen") return;
    await walkTo(-14, 120); fadeX(false); await wait(250);
    showPlace("room"); camSet(CAM1); moveTo(RX1 + 16, 120, 0); fadeX(true); await walkTo(200, 120);
  };
  // (tapping the floor to send the hamster somewhere is switched off again: it got in the way of other taps)
  var WALK_Y = { room: [110, 130], kitchen: [108, 128], garden: [112, 130], bedroom: [112, 128] };
  // ---- the ship model stands on the wall shelf above the piano instead of books, plant and record; picture and pinboard hang a little lower ----
  if (typeof pcModel !== "undefined") {
    place(pcModel, 207, 12, 42); pcModel.classList.add("on-shelf");   // for now on top of the second bookshelf (Wieland still picks its place)
    if (typeof pcBoard !== "undefined") { pcBoardAt = "wide"; place(pcBoard, 103, 10, 36); }
    if (typeof dzPic !== "undefined") place(dzPic, 216, 24, 24);
  }
  // ---- the hall's own floor, the gramophone, and wallpapers in your own colours ----
  /*WALLCOL*/
  var WCG = (DI.farben.grundfarbe || []).map(function (c) { return c.farbe; }), WCM = (DI.farben.musterfarbe || []).map(function (c) { return c.farbe; });
  function wWallTile(wp) { var q = home.pos && home.pos.wc && home.pos.wc[wp.id]; if (!q || (!q[0] && !q[1])) return wp.tile; try { return recolorWallSvg(wp.tile, WCG[q[0]] || null, WCM[q[1]] || null); } catch (e) { return wp.tile; } }
  var _w_rr2 = renderRoom; renderRoom = function () {
    _w_rr2.apply(this, arguments);
    var wp = item("wall", home.placed.wall); if (wp) { document.getElementById("wallpaper").style.backgroundImage = tileURL(wWallTile(wp)); }
    var df = item("dfloor", home.placed.dfloor) || FURN.dfloor[0]; wDFloor.style.backgroundImage = tileURL(df.tile); wDFloor.style.backgroundSize = (df.w / 2 / 92 * 100).toFixed(3) + "% auto";
    var g = home.placed.gram && item("gram", home.placed.gram); wGram.innerHTML = g ? itemSVG("gram", g) : '<div class="empty">+</div>'; wGram.style.top = g ? gy(38) : gy(83); wGram.style.width = gx(g ? 40 : 34);
  };
  var _w_rc2 = renderCatalog; renderCatalog = function () {
    _w_rc2.apply(this, arguments);
    var items = document.getElementById("items"), box = document.getElementById("wcol");
    if (curCat === "dfloor") { items.innerHTML = FURN.dfloor.map(function (it) { var has = home.owned.dfloor.indexOf(it.id) >= 0, on = home.placed.dfloor === it.id;
        return '<button type="button" class="item' + (has ? "" : " locked") + '" data-id="' + it.id + '" aria-pressed="' + on + '"' + (has ? "" : ' aria-disabled="true"') + '><div class="sw" style="background-image:' + tileURL(it.tile).replace(/"/g, "'") + ';background-size:' + (it.w * 0.9) + 'px"></div><span lang="de">' + (has ? it.name : "???") + '</span></button>'; }).join("");
      document.getElementById("cat-clear").hidden = true; }
    if (curCat === "gram") document.getElementById("cat-clear").hidden = true;
    if (!box) { box = document.createElement("div"); box.id = "wcol"; box.className = "wcol"; items.parentNode.insertBefore(box, items.nextSibling);
      box.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; var wp = home.placed.wall, q = (home.pos.wc[wp] || [0, 0]).slice(); q[+b.dataset.r] = +b.dataset.i; home.pos.wc[wp] = q; renderRoom(); renderCatalog(); }); }
    if (decor && place2 === "room") { var ct = { dfloor: CAM0, door: CAM0, gram: 46, plant: 46, chair: 0, clock: 0, shelf: 0 }[curCat]; if (ct != null) camTo(ct, 450); }
    box.hidden = curCat !== "wall" || !decor; if (box.hidden) return;
    var wp = item("wall", home.placed.wall), q = home.pos.wc[home.placed.wall] || [0, 0], orig = tileURL(wp.tile).replace(/"/g, "'"), cur = tileURL(wWallTile(wp)).replace(/"/g, "'");
    var row = function (r, list, title) { return '<p class="wcol-h">' + title + '</p><div class="wcol-r">' + list.map(function (c, i) {
        var st = !c ? "background-image:" + (r ? cur : orig) + ";background-size:18px" : r ? "background:" + (WCG[q[0]] || "#f4ead8") + ";--m:" + c : "background:" + c;
        return '<button type="button" class="wcol-b' + (r && c ? " pat" : "") + (q[r] === i ? " on" : "") + '" data-r="' + r + '" data-i="' + i + '" style="' + st + '" aria-label="' + (DI.farben[r ? "musterfarbe" : "grundfarbe"][i].name) + '"></button>'; }).join("") + '</div>'; };
    box.innerHTML = row(0, WCG, "Grundfarbe") + row(1, WCM, "Musterfarbe");
  };
  window.__wide = { cam: function (x) { if (x == null) return camX; camSet(x); }, gram: function () { act("gram", playGram); }, bench: function () { act("bench", sitOnBench); } };

  // ===================== festival decorations for the wide living room =====================
  // The old room got a new pinboard place and the music nook: things that hung on the pinboard move to free wall,
  // the garlands run on over the whole wall, and the nook gets its own decorations (window sill, piano, shelf).
  function wMove(sel, x, y) { var e = festRoom.querySelector(sel); if (e) { e.style.left = gx(x); e.style.top = gy(y); } return e; }
  function wLights(x0, x1, y, sag) {   // a string of little lights sagging between two points
    var o = "", w = x1 - x0, k = 0;
    for (var x = 0; x <= w; x += 2) { var yy = Math.round(sag * (1 - Math.pow(2 * x / w - 1, 2))); o += '<rect x="' + x + '" y="' + yy + '" width="2" height="1" fill="#3a5a2a"/>'; }
    for (var x2 = 3; x2 < w - 1; x2 += 7, k++) { var y2 = Math.round(sag * (1 - Math.pow(2 * x2 / w - 1, 2))); o += '<rect class="gl' + (k % 3) + '" x="' + x2 + '" y="' + (y2 + 1) + '" width="2" height="2" fill="' + ["#ffd84a", "#ff5a5a", "#6ab0ff", "#9ad070"][k % 4] + '"/>'; }
    var e = xEl("div", "fest fest-wl", festRoom, '<svg viewBox="0 0 ' + (w + 2) + ' ' + (sag + 4) + '">' + o + '</svg>');
    e.style.left = gx(x0); e.style.top = gy(y); e.style.width = gx(w + 2); return e;
  }
  var EASTER_TWIG = (function () {   // a vase with pussy-willow twigs and little painted eggs, 26x30, 1px outlines
    var o = "", R = function (x, y, w, h, c) { o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>'; };
    [[12, 22, 6, 1], [11, 18, 3, 1], [9, 14, 3, 1], [7, 10, 3, 1], [5, 6, 3, 1], [14, 17, 1, 5], [15, 12, 1, 5], [16, 8, 1, 4], [17, 4, 1, 4], [13, 2, 1, 9], [12, 11, 1, 1], [18, 13, 3, 1], [20, 10, 1, 3], [21, 7, 1, 3]].forEach(function (b) { R(b[0], b[1], b[2], b[3], "#6a4428"); });
    [[6, 5], [10, 9], [17, 3], [13, 1], [21, 6], [19, 12], [9, 13]].forEach(function (p) { R(p[0], p[1], 2, 2, "#f2eee6"); R(p[0], p[1] + 1, 2, 1, "#c8c0b4"); });
    [[3, 7, "#f4a0c0"], [10, 4, "#9ad0f0"], [18, 6, "#f6d860"], [15, 13, "#a8d88a"], [6, 12, "#c8a8f0"], [21, 13, "#f4a0c0"]].forEach(function (e) {
      R(e[0] + 1, e[1] - 1, 1, 1, "#6a4428"); R(e[0], e[1], 3, 4, "#3a2414"); R(e[0] + 1, e[1] - 0, 1, 1, e[2]); R(e[0] + 1, e[1] + 1, 1, 2, e[2]); R(e[0], e[1] + 1, 1, 0, e[2]);
      o += '<rect x="' + e[0] + '" y="' + (e[1] + 1) + '" width="3" height="2" fill="' + e[2] + '"/><rect x="' + (e[0] + 1) + '" y="' + (e[1] + 1) + '" width="1" height="1" fill="#ffffff" opacity=".7"/>';
    });
    // the vase: a round clay jug with a stripe
    R(8, 21, 10, 1, "#3a2414"); R(7, 22, 12, 7, "#3a2414"); R(8, 29, 10, 1, "#3a2414");
    R(8, 22, 10, 7, "#e8a070"); R(8, 25, 10, 1, "#f4f0e6"); R(9, 22, 2, 6, "#f4c8a0"); R(16, 23, 2, 6, "#c87850");
    return o;
  })();
  // where the furniture really is now (it can be swapped and the door moved): boxes in room units
  function wShelfBox() { var it = home.placed.shelf && item("shelf", home.placed.shelf); return it ? { x: L.shelf.x, w: it.w, top: L.shelf.bottom - it.h } : null; }
  function wPlantBox() { var it = home.placed.plant && item("plant", home.placed.plant); return it ? { x: L.plant.x - it.w / 2, w: it.w, top: L.plant.bottom - it.h } : null; }
  function wChairBox() { var it = home.placed.chair && item("chair", home.placed.chair); return it ? { x: L.chair.x, w: it.w, top: L.chair.bottom - it.h } : null; }
  // the Advent wreath lies on the window bench: the hanging ribbons are cut off and the candles drawn new, one more lit each week
  function wAdventWreath(week) {
    var o = "";
    [[4, 1], [12, -1], [19, -1], [27, 1]].forEach(function (c, i) {   // candles first: the ring's front hides their feet
      var x = c[0], y = c[1];
      o += '<rect x="' + x + '" y="' + y + '" width="4" height="10" fill="#3a2414"/><rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="2" height="9" fill="#d8463c"/><rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="1" height="8" fill="#f07a6a"/>';
      if (i < week) o += '<g class="wr-flame"><rect x="' + (x + 1) + '" y="' + (y - 3) + '" width="2" height="3" fill="#3a2414"/><rect x="' + (x + 1) + '" y="' + (y - 2) + '" width="2" height="2" fill="#ffb02a"/><rect x="' + (x + 1) + '" y="' + (y - 2) + '" width="1" height="1" fill="#fff4a0"/></g>';
      else o += '<rect x="' + (x + 2) + '" y="' + (y - 1) + '" width="1" height="1" fill="#3a2414"/>';
    });
    return o + '<svg x="0" y="0" width="34" height="13" viewBox="0 15 34 13">' + A.f_wreath0 + '</svg>';
  }
  var _wRenderFest = renderFest;
  renderFest = function () {
    _wRenderFest();
    var f = festival(), night = daylight() !== "day";
    var wx = L.win.x, sh = wShelfBox(), pl = wPlantBox(), jk = festRoom.querySelectorAll(".jack"), cd = festRoom.querySelectorAll(".cand");
    // things that stood next to the plant keep their distance from whatever plant is there now
    if (pl && f === "herbst") { if (jk[1]) jk[1].style.left = gx(pl.x - 19); if (cd[1]) cd[1].style.left = gx(pl.x - 24); }
    if (f === "advent" || f === "weihnachten") { wMove(".star", wx + 14, L.win.y + 2); wMove(".mistle", wx + 8, L.win.y - 16); }
    if (f === "herbst") {
      fp(festRoom, "f_hbunting", 175, 6, "garl"); fp(festRoom, "f_hbunting", -165, 6, "garl");
      wMove(".web.flip", 236, 7);
      wMove(".ghost", -62, 20);
      var a = fp(festRoom, night ? "f_jack0on" : "f_jack0off", 214, 41, "jack clk"), b = fp(festRoom, night ? "jack_on" : "jack_off", 193, 92, "jack clk");
      fp(festRoom, "f_candle", 234, 45, "cand"); fp(festRoom, "f_candle", -14, 80, "cand");
      [a, b].forEach(function (j) { j.classList.toggle("lit", night); j.addEventListener("click", function () { j.classList.remove("wob"); void j.offsetWidth; j.classList.add("wob"); say("Fröhliches Kürbisfest!"); }); });
    } else if (f === "advent" || f === "weihnachten") {
      fp(festRoom, "f_garland", 175, 6, "garl"); fp(festRoom, "f_garland", -165, 6, "garl");
      wMove(".advent", 164, 18);
      [].forEach.call(festRoom.querySelectorAll(".stock"), function (s, i) { s.style.left = gx(-86 + i * 13); s.style.top = gy(24 + (i % 2) * 2); });
      wLights(150, 244, 18, 5); wLights(-92, -22, 18, 5);
      fp(festRoom, "f_candle", 234, 45, "cand");
      if (f === "weihnachten") fp(festRoom, "f_candle", 214, 45, "cand");
      // the gingerbread house stands on top of the shelf, whatever shelf it is
      var gi = festRoom.querySelector(".ginger"); if (gi) { if (sh && sh.top - 17 >= 20) { gi.style.left = gx(sh.x + sh.w / 2 - 10); gi.style.top = gy(sh.top - 17); } else { gi.style.left = gx(218); gi.style.top = gy(37); } }   // a tall shelf reaches the garland: then it stands on the window bench
      // the Advent wreath now lies on the window bench, between the pink and the blue cushion
      var ow = festRoom.querySelector(".wreath"); if (ow) ow.remove();
      if (f === "advent") {
        var wk = adventWeek(), wr = xEl("button", "fest wreath-lie", festRoom, '<svg viewBox="0 -5 34 18" aria-hidden="true">' + wAdventWreath(wk) + '</svg>');
        wr.type = "button"; wr.setAttribute("aria-label", "Adventskranz"); wr.style.left = gx(-35); wr.style.top = gy(84); wr.style.width = gx(34);
        wr.addEventListener("click", function () { say(wk + ". Advent: " + wk + (wk > 1 ? " Kerzen brennen." : " Kerze brennt.")); });
      }
      // in the garden the lights now hang on the new things: over the greenhouse roof, the beehive and the hedge
      var og = festGarden.querySelector(".fest-glights");
      if (og) {
        var gl = "", k = 0, seg = function (x0, y0, x1, y1, sag) { var n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 6)); for (var q = 0; q <= n; q++, k++) { var tt = q / n, x = x0 + (x1 - x0) * tt, y = y0 + (y1 - y0) * tt + sag * 4 * tt * (1 - tt); gl += '<rect class="gl' + (k % 3) + '" x="' + Math.round(x) + '" y="' + Math.round(y) + '" width="2" height="2" fill="' + ["#ffd84a", "#ff5a5a", "#6ab0ff", "#9ad070"][k % 4] + '"/>'; } };
        seg(127, 68, 149, 55, 0); seg(150, 55, 170, 68, 0); seg(58, 68, 86, 68, 1);
        og.innerHTML = '<svg viewBox="0 0 180 135" preserveAspectRatio="none">' + gl + '</svg>'; og.style.zIndex = 112;
        // and along the top of the hedge, behind the hive and the greenhouse
        gl = ""; for (var hx = 2; hx < 178; hx += 7, k++) gl += '<rect class="gl' + (k % 3) + '" x="' + hx + '" y="' + (66 + Math.round(2 * Math.sin(hx / 9))) + '" width="2" height="2" fill="' + ["#ffd84a", "#ff5a5a", "#6ab0ff", "#9ad070"][k % 4] + '"/>';
        var hg = xEl("div", "fest fest-glights", festGarden, '<svg viewBox="0 0 180 135" preserveAspectRatio="none">' + gl + '</svg>'); hg.style.zIndex = 60;
      }
      var t = wMove(".xtree", 204, 37);
      if (t) [[198, 94], [210, 92], [222, 96], [232, 97]].forEach(function (p, i) { var g = festRoom.querySelectorAll(".f-gift")[i]; if (g) { g.style.left = gx(p[0]); g.style.top = gy(p[1]); } });
    } else if (f === "silvester") {
      fp(festRoom, "f_pbunting", 175, 6, "garl"); fp(festRoom, "f_pbunting", -165, 6, "garl");
      var bl = festRoom.querySelectorAll(".balloon"); if (bl[2]) { bl[2].style.left = gx(165); bl[2].style.top = gy(26); } if (bl[3]) { bl[3].style.left = gx(176); bl[3].style.top = gy(32); }
      [["f_balloon1", -70, 24], ["f_balloon3", -58, 30]].forEach(function (q, i) { var e = fp(festRoom, q[0], q[1], q[2], "balloon"); e.style.animationDelay = (-1.3 - i * 0.8) + "s"; });
      wMove(".yearban", 152, 6);
    } else if (f === "ostern") {
      // pastel bunting over the whole wall and an Easter twig on the bookshelf
      var pb = A.f_pbunting ? A.f_pbunting.replace(/#ff5a5a/gi, "#f8c4a8").replace(/#ffd84a/gi, "#f6e49a").replace(/#6ab0ff/gi, "#a8d8f8").replace(/#9ad070/gi, "#bce4a4") : "";
      [-165, 5, 175].forEach(function (x) { var e = xEl("div", "fest garl", festRoom, svgOf(pb, 170, 11)); e.style.left = gx(x); e.style.top = gy(6); e.style.width = gx(170); });
      if (sh && sh.top - 29 >= 18) { var tw = xEl("div", "fest garl", festRoom, svgOf(EASTER_TWIG, 26, 30)); tw.style.left = gx(sh.x + sh.w / 2 - 13); tw.style.top = gy(sh.top - 29); tw.style.width = gx(26); }
      var tw2 = xEl("div", "fest garl", festRoom, svgOf(EASTER_TWIG, 26, 30)); tw2.style.left = gx(215); tw2.style.top = gy(24); tw2.style.width = gx(26);
    }
  };
  // swapping furniture or moving the door rearranges the decorations too
  var _wRenderRoom = renderRoom; renderRoom = function () { _wRenderRoom.apply(this, arguments); try { renderFest(); } catch (e) {} };
  var _wRenderMov = renderMovables; renderMovables = function () { _wRenderMov.apply(this, arguments); try { renderFest(); wDoorPos(); } catch (e) {} };
  window.__furn = { set: function (c, id) { home.placed[c] = id; renderRoom(); }, list: function (c) { return (FURN[c] || []).map(function (x) { return x.id; }); }, door: function (x) { home.pos.door = x; renderMovables(); }, fest: function () { return festival(); } };
  setTimeout(renderFest, 50);
