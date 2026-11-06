  // ===================== café, calmer and in order (preview) =====================
  // Guests come in on their own and sit down at the tables, until only one seat is left: that seat is kept for the guest
  // you call with the little bell. Tap a table: the hamster walks over and the guest tells you what they would like.
  // The bell guest steps up to the counter instead and tells you there. Then they queue in front of the counter (you see up to four), you make it,
  // hand it over, and they carry it to a table. Animals share tables, and at the tables they chat: little bubbles with
  // pictures and words float over whoever is talking.
  var CQ_X = [294, 318, 342, 366], CQ_Y = 131, CQ_MAX = 4;
  function cqList() { return guests.filter(function (g) { return g.q && (g.state === "qwalk" || g.state === "queue"); }).sort(function (a, b) { return a.qi - b.qi; }); }
  // no more guests on their own: the old timer is pushed far away whenever it is set
  var _cq_start = guestsStart; guestsStart = function () { _cq_start.apply(this, arguments); gNext = 1e12; cqTalkLayer(); cqBellShow(); };
  var _cq_reopen = gReopen; gReopen = function () { _cq_reopen.apply(this, arguments); gNext = 1e12; };
  setInterval(function () { if (gNext < 1e11) gNext = 1e12; }, 500);
  var _cq_spawn = gSpawn; gSpawn = function (manual) { if (manual) { cqRing(); return true; } return false; };
  // ---- the bell ----
  var cqBell = document.createElement("button"); cqBell.type = "button"; cqBell.className = "cq-bell"; cqBell.setAttribute("aria-label", "Nächster Gast");
  cqBell.innerHTML = '<svg viewBox="0 0 16 14" aria-hidden="true" shape-rendering="crispEdges"><path fill="#3a2414" d="M7 0h2v1h1v1h1v1h1v1h1v4h1v2h1v2H0v-2h1V8h1V4h1V3h1V2h1V1h1z"/><path fill="#f2c860" d="M7 1h2v1h1v1h1v1h1v4h1v2H2V8h1V4h1V3h1V2h2z"/><path fill="#fff1b0" d="M6 3h1v1H6zM5 4h1v3H5z"/><path fill="#b8862a" d="M11 4h1v4h1v2h-2zM1 11h14v1H1z"/><path fill="#3a2414" d="M7 12h2v2H7z"/></svg><b class="cq-n"></b>';
  cafeEl.appendChild(cqBell);
  function cqBellShow() { if (!cqBell.isConnected) cafeEl.appendChild(cqBell);   /* the café picture may have been rebuilt: put the bell back */
    var n = cqList().length; cqBell.hidden = !cafeOn || gClosing(); cqBell.classList.toggle("full", n >= CQ_MAX); cqBell.querySelector(".cq-n").textContent = n ? n : ""; }
  setInterval(cqBellShow, 600);
  // ---- the sink: bottom right, like the bell on the left: washing up the café's dishes ----
  var cqSink = document.createElement("button"); cqSink.type = "button"; cqSink.className = "cq-bell cq-dish"; cqSink.setAttribute("aria-label", "Abwaschen");
  cqSink.innerHTML = '<svg viewBox="0 0 16 14" aria-hidden="true" shape-rendering="crispEdges">' +
    '<path fill="#3a2414" d="M9 0h4v1h1v3h-1V2h-1v1H9V1h0zM0 6h16v2h-1v5H1V8H0z"/>' +                       /* tap outline, basin outline */
    '<path fill="#a8b4c0" d="M10 1h2v1h-2zM12 2h1v1h-1z"/><path fill="#e0e8f0" d="M10 1h1v1h-1z"/>' +    /* the tap */
    '<path fill="#e8eef4" d="M1 7h14v1H1z"/><path fill="#8ac8ec" d="M2 8h12v1H2z"/><path fill="#c8ccd4" d="M2 9h12v3H2z"/><path fill="#a8b0bc" d="M2 12h12v0z"/>' +
    '<path fill="#3a2414" d="M3 3h5v1h1v2H2V4h1z"/><path fill="#ffffff" d="M3 4h5v1H3z"/><path fill="#6a9ad8" d="M3 5h6v1H3z"/>' +   /* a dirty plate on the edge */
    '<path fill="#c8283a" d="M5 4h2v1H5z"/><path fill="#ffffff" d="M3 9h3v1H3z"/></svg>';
  cafeEl.appendChild(cqSink);
  setInterval(function () { if (!cqSink.isConnected) cafeEl.appendChild(cqSink); cqSink.hidden = !cafeOn || typeof dwOpen !== "function"; }, 600);
  cqSink.addEventListener("click", function (e) { e.stopPropagation(); if (!cafeOn || (typeof cfGameOn !== "undefined" && cfGameOn)) return; beep([[523, .04], [659, .05]]); dwOpen(true); });
  cqBell.addEventListener("click", function (e) { e.stopPropagation(); cqRing(); });
  function cqRing() {
    if (!cafeOn || (typeof cfGameOn !== "undefined" && cfGameOn)) return;
    cqBell.classList.remove("cq-ringing"); void cqBell.offsetWidth; cqBell.classList.add("cq-ringing");
    beep([[1568, .08], [1319, .12]]);
    if (gClosing()) { say("Das Café schließt bald, heute kommt niemand mehr."); return; }
    if (cqList().length >= CQ_MAX) { say("Die Schlange ist schon lang genug. Erst einmal die Wartenden bedienen."); return; }
    var pool = gKnown(); if (!pool.length) pool = gAnyone(); pool = pool.filter(function (id) { return ALLANI[id] && !guests.some(function (g) { return g.id === id; }); });
    if (!pool.length) { say("Gerade ist niemand in der Nähe."); return; }
    var id = pool[Math.floor(Math.random() * pool.length)];
    // half the time they want something that is already on the counter, half the time something new
    var free = gFreeItems(), o, fromCounter = false;
    if (free.length && Math.random() < .5) { o = gOrderFor(free[Math.floor(Math.random() * free.length)]); fromCounter = true; }
    else { o = gOrderNew(id); var room = gRoom(); for (var k = 0; k < 6 && room.length && room.indexOf(o.kind) < 0; k++) o = gOrderNew(id); }
    cqJoin(id, o, fromCounter);
  }
  // ---- the view over the counter, drawn in the room's pixel style: back wall with shelf, window, lamp and menu board; the counter in front ----
  function cqR(o, x, y, w, h, c) { o.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>'); }
  function cqSvg(o) { return '<svg viewBox="0 0 180 135" preserveAspectRatio="none" shape-rendering="crispEdges" aria-hidden="true">' + o.join("") + '</svg>'; }
  var CQ_BG = 5;   // which backdrop the order view uses (drafts 1 to 4)
  function cqBack() { if (CQ_BG === 2) return cqBack2(); if (CQ_BG === 3) return cqBack3(); if (CQ_BG === 4) return cqBack4(); return cqBack1(); }
  function cqBack1() {
    var o = [], K = "#3a2414", R = function (x, y, w, h, c) { cqR(o, x, y, w, h, c); };
    R(0, 0, 180, 135, "#f4e8cc"); for (var x = 0; x < 180; x += 12) { R(x, 0, 1, 70, "#ecdcb8"); R(x + 6, 0, 1, 70, "#f8eed8"); }
    for (var x2 = 3; x2 < 180; x2 += 9) for (var y2 = 6; y2 < 64; y2 += 10) R(x2 + ((y2 / 10) % 2) * 4, y2, 1, 1, "#e8d4b0");          // a little dotted wallpaper
    R(0, 66, 180, 2, K); R(0, 68, 180, 2, "#c8945a"); R(0, 70, 180, 30, "#8a5a30"); for (var px = 2; px < 180; px += 22) { R(px, 74, 18, 22, "#7a4c26"); R(px, 74, 18, 1, "#a8743e"); R(px + 17, 74, 1, 22, "#5e3a1c"); }
    // round window with the garden outside
    var cx = 146, cy = 30; for (var yy = -17; yy <= 17; yy++) for (var xx = -17; xx <= 17; xx++) { var d = Math.hypot(xx, yy); if (d > 17) continue; R(cx + xx, cy + yy, 1, 1, d > 16 ? K : d > 13 ? (xx + yy < -4 ? "#c8945a" : "#8a5a30") : d > 12.2 ? K : yy > 4 ? (xx % 5 === 0 ? "#4a9a3a" : "#6ab04a") : yy > 0 ? "#8ac860" : (yy < -8 ? "#a8dcf6" : "#c8ecfa")); }
    R(cx - 13, cy - 1, 26, 2, "#8a5a30"); R(cx - 1, cy - 13, 2, 26, "#8a5a30"); R(cx - 6, cy - 9, 3, 2, "#ffffff");
    R(128, 48, 36, 3, K); R(129, 48, 34, 2, "#c8945a"); R(134, 42, 6, 6, K); R(135, 43, 4, 5, "#e8554a"); R(150, 40, 8, 8, K); R(151, 41, 6, 7, "#86c060"); R(152, 38, 4, 3, "#5a9a48");
    // the shelf on the left with jars and cups
    R(6, 34, 52, 3, K); R(7, 34, 50, 2, "#c8945a"); R(10, 37, 2, 4, "#5e3a1c"); R(52, 37, 2, 4, "#5e3a1c");
    [[9, "#e8554a"], [19, "#f6c84a"], [29, "#86c060"]].forEach(function (j) { R(j[0], 22, 8, 12, K); R(j[0] + 1, 25, 6, 9, j[1]); R(j[0] + 1, 23, 6, 2, "#d8d0c4"); R(j[0] + 2, 26, 1, 6, "#ffffff"); });
    [[40, "#f4f1ea"], [48, "#86b2e2"]].forEach(function (c) { R(c[0], 27, 7, 7, K); R(c[0] + 1, 28, 5, 5, c[1]); R(c[0] + 7, 29, 2, 3, K); });
    R(6, 12, 52, 3, K); R(7, 12, 50, 2, "#c8945a"); for (var b = 0; b < 6; b++) { R(10 + b * 4, 2, 3, 10, ["#e8554a", "#3e7ab8", "#f6c84a", "#5a9a48", "#c8586a", "#8a5a9a"][b]); R(10 + b * 4, 2, 3, 1, K); }
    R(38, 4, 14, 8, K); R(39, 5, 12, 6, "#5a9a48"); R(41, 2, 4, 3, "#86c060");
    // the menu board
    R(8, 44, 40, 20, K); R(9, 45, 38, 18, "#3a4a42"); R(9, 45, 38, 1, "#4a5a52");
    [[12, 49, 18], [12, 53, 26], [12, 57, 14], [34, 57, 9]].forEach(function (l) { for (var q = 0; q < l[2]; q += 2) R(l[0] + q, l[1], 1, 1, "#e8eee8"); }); R(40, 49, 3, 3, "#f6c84a");
    // a hanging lamp, warm light
    R(90, 0, 1, 10, K); R(84, 10, 13, 6, K); R(85, 11, 11, 4, "#e8b830"); R(86, 11, 6, 1, "#f6dc78"); R(87, 16, 7, 2, "#fff1a8");
    o.push('<path d="M87 18 L60 70 L120 70 L94 18Z" fill="#fff1a8" opacity=".14"/>');
    return cqSvg(o);
  }
  // the real café room behind the guest, as the hamster sees it from behind the counter: the guest room of the current café
  // (fireplace, tables, rug, lamps, in its own style) at the same pixel size, a little darker and warmer far back, with soft light
  function cqRoomBg() {
    var src = cafeEl.querySelector(".cf-svg") || document.querySelector(".cf-svg"); if (!src) return cqBack1();
    var vb = (src.getAttribute("viewBox") || "0 0 470 135").split(/\s+/).map(Number), W = vb[2], H = vb[3];
    var cl = src.cloneNode(true); cl.removeAttribute("class"); cl.setAttribute("class", "cq-room");
    // only the back wall: no counter, no hamster, no goods, no guests, no fire glow
    ["#cf-hamw", "#cf-front", "#cf-stock", "#cf-guests", "#cf-gfly", "#cf-hamfx", "#cf-fest", "#cf-dim", ".cf-fire", ".cf-hearth", ".cq-talk"].forEach(function (q) { [].forEach.call(cl.querySelectorAll(q), function (e) { e.remove(); }); });
    // the oven at the left edge goes: the room's objects are cut off left of it, the wall stays
    var ob = cl.querySelector(".cf-ob"); if (ob) { ob.insertAdjacentHTML("beforebegin", '<clipPath id="cq-noven"><rect x="0" y="0" width="470" height="22"/><rect x="' + CQ_OVENX + '" y="0" width="470" height="135"/></clipPath>'); ob.setAttribute("clip-path", "url(#cq-noven)"); }
    [].forEach.call(cl.querySelectorAll("[id]"), function (e) { if (e.id !== "cq-noven") e.id = "cqr-" + e.id; });   /* no clashing ids with the real café */
    var cp = cl.querySelector("clipPath"); if (cp) { cl.querySelector("[clip-path]") && cl.querySelector("[clip-path]").setAttribute("clip-path", "url(#cqr-" + cp.id.replace(/^cqr-/, "") + ")"); }
    // two round windows of this style, drawn for this view: one over the window above the counter, one more on the left
    var w = CF.wins[CF.wins.length - 1], wy = w[1], fc = CF_THEME_NOW === "firstclass";
    // the room's own window above the counter, drawn new, and half of a second one cut off by the left edge of the picture
    cl.insertAdjacentHTML("beforeend", '<g shape-rendering="crispEdges">' + cqWindow(CQ_ROOMX, wy, fc) + cqWindow(w[0], wy, fc) + '</g>');
    cl.style.width = (W / 180 * 100) + "%"; cl.style.height = (H / 135 * 100) + "%"; cl.style.left = (-CQ_ROOMX / 180 * 100) + "%"; cl.style.top = (-CQ_ROOMY / 135 * 100) + "%";
    return cl.outerHTML + '<div class="cq-haze"></div>';
  }
  /* the order view at a table: the café's fireplace corner behind the guest, with the fire burning and its warm glow.
     It is the room's own picture, so every café style brings its own fireplace (First Class: the marble one) */
  var CQ_FIREDX = 136, CQ_FIREX = 180, CQ_FIREY = -14;   /* the room sits a little higher so the flames show above the table */
  function cqFireBg() {
    var src = cafeEl.querySelector(".cf-svg"); if (!src) return cqRoomBg();
    var vb = (src.getAttribute("viewBox") || "0 0 470 135").split(/\s+/).map(Number), W = vb[2], H = vb[3];
    var cl = src.cloneNode(true); cl.removeAttribute("class"); cl.setAttribute("class", "cq-room");
    ["#cf-hamw", "#cf-front", "#cf-stock", "#cf-guests", "#cf-gfly", "#cf-hamfx", "#cf-fest", "#cf-dim", ".cq-talk"].forEach(function (q) { [].forEach.call(cl.querySelectorAll(q), function (e) { e.remove(); }); });
    [].forEach.call(cl.querySelectorAll("[id]"), function (e) { e.id = "cqf-" + e.id; });
    [].forEach.call(cl.querySelectorAll("[clip-path]"), function (e) { e.setAttribute("clip-path", e.getAttribute("clip-path").replace("url(#", "url(#cqf-")); });
    var rx = Math.max(0, Math.min(W - 180, CQ_FIREX - CQ_FIREDX));   /* the fireplace stands at x 180 in every café style */
    cl.style.width = (W / 180 * 100) + "%"; cl.style.height = (H / 135 * 100) + "%"; cl.style.left = (-rx / 180 * 100) + "%"; cl.style.top = (CQ_FIREY / 135 * 100) + "%";
    return cl.outerHTML + '<div class="cq-haze cq-warm"></div>';
  }
  function cqWindow(cx, cy, brass) {   // a round window with a little garden view: wood frame and sill, or a brass porthole with rivets
    var o = [], R = function (x, y, w, h, c) { cqR(o, x, y, w, h, c); }, night = typeof daylight === "function" && daylight() !== "day";
    var Ro = brass ? 15 : 17, Ri = brass ? 9 : 12;
    if (!brass) { R(cx - 19, cy + Ro - 1, 38, 4, "#3a2414"); R(cx - 18, cy + Ro - 1, 36, 2, "#c8945a"); R(cx - 18, cy + Ro - 1, 36, 1, "#e0b07a"); }
    for (var y = -Ro; y <= Ro; y++) for (var x = -Ro; x <= Ro; x++) { var d = Math.hypot(x, y); if (d > Ro + .3) continue; var c;
      if (d > Ro - .7) c = "#3a2414";
      else if (d > Ri + 1) c = brass ? (x + y < -Ro * .5 ? "#f6d878" : x + y > Ro * .5 ? "#a8782a" : "#d8a83a") : (x + y < -Ro * .4 ? "#c8945a" : x + y > Ro * .4 ? "#6a4424" : "#8a5a30");
      else if (d > Ri) c = "#3a2414";
      else { var u = (y + Ri) / (2 * Ri); c = night ? (u < .62 ? ((x * 7 + y * 13) % 23 === 0 ? "#fff8d0" : "#1e2a54") : u < .78 ? "#24461a" : "#2e5a22") : (u < .55 ? (u < .3 ? "#a8d8f0" : "#c4e6f6") : u < .72 ? ((x + y) % 3 ? "#4e8a32" : "#6fae4a") : "#7ac860"); }
      R(cx + x, cy + y, 1, 1, c); }
    if (brass) { for (var k = 0; k < 8; k++) { var an = k / 8 * Math.PI * 2; R(Math.round(cx + Math.cos(an) * (Ro - 2.5)), Math.round(cy + Math.sin(an) * (Ro - 2.5)), 1, 1, "#7a5418"); } }
    else { R(cx - Ri, cy - 1, 2 * Ri + 1, 2, "#8a5a30"); R(cx - 1, cy - Ri, 2, 2 * Ri + 1, "#8a5a30"); R(cx - Ri, cy - 1, 2 * Ri + 1, 1, "#c8945a"); }
    if (!night) { R(cx - Ri + 3, cy - Ri + 4, 2, 1, "#ffffff"); R(cx - Ri + 2, cy - Ri + 5, 1, 2, "#ffffff"); }
    return o.join("");
  }
  var CQ_ROOMX = 200, CQ_ROOMY = -12, CQ_WIN2 = -126, CQ_OVENX = 226;
  function cqDisc(R, cx, cy, rx, ry, f) { for (var y = -ry; y <= ry; y++) for (var x = -rx; x <= rx; x++) { var d = x * x / (rx * rx) + y * y / (ry * ry); if (d <= 1) { var c = f(x, y, d); if (c) R(cx + x, cy + y, 1, 1, c); } } }
  // draft 2: the café counter seen from the guest: an espresso machine, a glass case with cakes, a menu board on the wall, two lamps
  function cqBack2() {
    var o = [], K = "#3a2414", R = function (x, y, w, h, c) { cqR(o, x, y, w, h, c); };
    R(0, 0, 180, 30, "#e8d8b8"); o.push('<g transform="translate(0 14)">');   /* drawn a little lower: the order view shows the picture moved up */
    R(0, 0, 180, 135, "#e8d8b8"); for (var y = 0; y < 66; y += 6) for (var x = (y / 6) % 2 ? 0 : 6; x < 180; x += 12) { R(x, y, 11, 5, "#f4ead4"); R(x, y, 11, 1, "#fbf4e4"); }   // brick tiles
    R(0, 64, 180, 2, K); R(0, 66, 180, 34, "#6a4428"); for (var px = 0; px < 180; px += 6) R(px, 66, 1, 34, "#5a3820");
    R(36, 4, 108, 26, K); R(37, 5, 106, 24, "#2e3a34"); R(37, 5, 106, 1, "#3e4a44");   // the big menu board
    [[42, 10, "#f6c84a"], [42, 17, "#e8eee8"], [42, 24, "#e8eee8"], [96, 10, "#f6c84a"], [96, 17, "#e8eee8"], [96, 24, "#e8eee8"]].forEach(function (l) { for (var q = 0; q < 34; q += 2) R(l[0] + q, l[1], 1, 1, l[2]); });
    R(78, 8, 6, 6, "#e8554a"); R(79, 9, 4, 1, "#ff8a7a");
    // espresso machine on the left
    R(4, 34, 34, 32, K); R(5, 35, 32, 30, "#c8d0d8"); R(5, 35, 32, 2, "#eef2f6"); R(30, 37, 6, 26, "#9aa4ae"); R(10, 44, 20, 3, K); R(12, 47, 3, 6, K); R(25, 47, 3, 6, K); R(11, 54, 6, 5, "#f4f1ea"); R(23, 54, 6, 5, "#f4f1ea"); R(9, 38, 4, 3, "#e8554a"); R(15, 38, 4, 3, "#6fae5a");
    R(4, 30, 34, 4, K); R(5, 31, 32, 2, "#a8b0b8"); for (var cu = 0; cu < 4; cu++) { R(7 + cu * 8, 25, 6, 5, K); R(8 + cu * 8, 26, 4, 3, "#fff8ec"); }
    // glass case with cakes on the right
    R(138, 34, 40, 32, K); R(139, 35, 38, 30, "#d8eef8"); R(139, 35, 38, 1, "#ffffff"); R(140, 49, 36, 2, "#a8b0b8");
    [[142, 43, "#f0a8c0"], [154, 43, "#8a5a32"], [166, 43, "#f6dc78"], [146, 58, "#e8554a"], [160, 58, "#c8a060"]].forEach(function (c) { R(c[0], c[1], 9, 6, K); R(c[0] + 1, c[1] + 1, 7, 2, "#fff8ec"); R(c[0] + 1, c[1] + 3, 7, 2, c[2]); });
    R(142, 37, 2, 10, "#ffffff"); R(158, 52, 2, 10, "#ffffff");
    // two hanging lamps with warm light
    [52, 128].forEach(function (lx) { R(lx, 30, 1, 6, K); R(lx - 6, 36, 13, 5, K); R(lx - 5, 37, 11, 3, "#e8b830"); R(lx - 3, 41, 7, 2, "#fff1a8"); o.push('<path d="M' + (lx - 3) + ' 43 L' + (lx - 18) + ' 64 L' + (lx + 18) + ' 64 L' + (lx + 3) + ' 43Z" fill="#fff1a8" opacity=".16"/>'); });
    o.push('</g>');
    return cqSvg(o);
  }
  // draft 3: cosy wood and plants: plank wall, a big window with the garden and curtains, hanging plants, a string of lights
  function cqBack3() {
    var o = [], K = "#3a2414", R = function (x, y, w, h, c) { cqR(o, x, y, w, h, c); };
    R(0, 0, 180, 30, "#b88450"); o.push('<g transform="translate(0 14)">');   /* drawn a little lower: the order view shows the picture moved up */
    R(0, 0, 180, 135, "#b88450"); for (var y = 0; y < 70; y += 7) { R(0, y, 180, 1, "#8a5a32"); for (var x = (y * 7) % 23; x < 180; x += 37) R(x, y + 3, 9, 1, "#a87448"); }
    R(0, 66, 180, 34, "#6a4428"); R(0, 66, 180, 2, K);
    // the window: sky, hedge, meadow, a frame and curtains
    R(52, 6, 76, 50, K); R(54, 8, 72, 46, "#b4dff4"); R(54, 34, 72, 10, "#4e8a32"); for (var hx = 54; hx < 126; hx += 3) R(hx, 33 + (hx % 2), 2, 2, "#6fae4a"); R(54, 44, 72, 10, "#7ac860"); R(89, 8, 2, 46, "#c8945a"); R(54, 30, 72, 2, "#c8945a");
    R(60, 12, 10, 3, "#ffffff"); R(58, 13, 14, 2, "#ffffff"); R(104, 16, 8, 2, "#ffffff");
    R(44, 2, 92, 4, K); R(45, 3, 90, 2, "#c8945a");
    [[46, 1], [124, -1]].forEach(function (c) { R(c[0], 6, 10, 54, K); R(c[0] + 1, 6, 8, 53, "#e8554a"); for (var cy = 8; cy < 58; cy += 4) R(c[0] + 2 + (c[1] > 0 ? 0 : 5), cy, 1, 2, "#c8403a"); });
    R(50, 56, 80, 3, K); R(51, 56, 78, 2, "#d8a468"); R(64, 50, 7, 6, K); R(65, 51, 5, 5, "#e88a5a"); R(63, 46, 9, 5, "#5ab04a"); R(110, 50, 7, 6, K); R(111, 51, 5, 5, "#e88a5a"); R(108, 45, 11, 6, "#6fae4a");
    // hanging plants left and right, with trailing leaves
    [[18, 20], [160, 24]].forEach(function (pl) { R(pl[0], 0, 1, pl[1] - 6, K); R(pl[0] - 7, pl[1] - 6, 15, 8, K); R(pl[0] - 6, pl[1] - 5, 13, 6, "#d8784a"); cqDisc(R, pl[0], pl[1] - 7, 9, 4, function (x, y, d) { return d > .8 ? "#24461a" : y < 0 ? "#8ad86a" : "#5ab04a"; });
      for (var t = 0; t < 22; t++) { R(pl[0] - 6 + (t % 3) * 6 + Math.round(Math.sin(t) * 2), pl[1] + 2 + t, 2, 2, t % 2 ? "#5ab04a" : "#3e8a3a"); } });
    // string of lights over the wall
    for (var lx = 0; lx < 180; lx++) { var ly = Math.round(4 + 5 * Math.sin(lx / 180 * Math.PI * 3) ** 2); R(lx, ly, 1, 1, "#3a2414"); if (lx % 12 === 6) { R(lx - 1, ly + 1, 3, 3, ["#ffd34a", "#ff8a7a", "#9ad8f4"][(lx / 12 | 0) % 3]); R(lx, ly + 1, 1, 1, "#ffffff"); } }
    o.push('</g>');
    return cqSvg(o);
  }
  // draft 4: the terrace: a striped awning, the garden behind, flower boxes on the counter
  function cqBack4() {
    var o = [], K = "#3a2414", R = function (x, y, w, h, c) { cqR(o, x, y, w, h, c); };
    R(0, 0, 180, 30, "#b4dff4"); o.push('<g transform="translate(0 14)">');   /* drawn a little lower: the order view shows the picture moved up */
    for (var y = 0; y < 70; y++) R(0, y, 180, 1, y < 30 ? (y % 2 ? "#b4dff4" : "#c4e6f6") : "#c4e6f6");
    cqDisc(R, 30, 22, 12, 5, function (x, y) { return y > 1 ? "#e4f2fa" : "#ffffff"; }); cqDisc(R, 140, 16, 14, 5, function (x, y) { return y > 1 ? "#e4f2fa" : "#ffffff"; });
    for (var hx = 0; hx < 180; hx++) { var top = 36 + Math.round(Math.sin(hx / 7) * 2 + Math.sin(hx / 3) * 1); R(hx, top, 1, 70 - top, "#4e8a32"); R(hx, top, 1, 1, "#24461a"); R(hx, top + 1, 1, 1, "#6fae4a"); }
    for (var k = 0; k < 240; k++) { var x2 = (k * 47) % 180, y2 = 40 + (k * 29) % 26; R(x2, y2, 2, 1, k % 3 ? "#6fae4a" : "#2e5a22"); }
    // trees peeking over the hedge
    cqDisc(R, 18, 30, 16, 12, function (x, y, d) { return d > .85 ? "#24461a" : y < -2 ? "#6fae4a" : "#4e8a32"; }); cqDisc(R, 166, 28, 18, 13, function (x, y, d) { return d > .85 ? "#24461a" : y < -2 ? "#6fae4a" : "#4e8a32"; });
    // the awning: red and cream stripes with a scalloped edge
    for (var ax = 0; ax < 180; ax++) { var st = Math.floor(ax / 12) % 2; R(ax, 0, 1, 14, st ? "#e8554a" : "#fff8ec"); var sc = 14 + Math.round(2 * Math.sin((ax % 12) / 12 * Math.PI)); R(ax, 14, 1, sc - 14, st ? "#e8554a" : "#fff8ec"); R(ax, sc, 1, 1, K); }
    R(0, 0, 180, 1, K); R(4, 15, 3, 55, K); R(5, 15, 1, 55, "#c8945a"); R(173, 15, 3, 55, K); R(174, 15, 1, 55, "#c8945a");
    R(0, 66, 180, 34, "#8a5a30"); R(0, 66, 180, 2, K);
    // flower boxes at both ends
    [[10, "#e8554a"], [146, "#f6c84a"]].forEach(function (fb) { R(fb[0], 56, 26, 10, K); R(fb[0] + 1, 57, 24, 8, "#c8603a"); R(fb[0] + 1, 57, 24, 1, "#e88a5a"); for (var f = 0; f < 5; f++) { R(fb[0] + 3 + f * 5, 50, 1, 7, "#3e8a3a"); R(fb[0] + 2 + f * 5, 48, 3, 3, fb[1]); R(fb[0] + 3 + f * 5, 49, 1, 1, "#fff8ec"); } });
    o.push('</g>');
    return cqSvg(o);
  }
  function cqFront() {
    var o = [], K = "#3a2414", R = function (x, y, w, h, c) { cqR(o, x, y, w, h, c); };
    R(0, 96, 180, 3, K); R(0, 97, 180, 3, "#d8a468"); R(0, 97, 180, 1, "#f0c890"); R(0, 100, 180, 2, K);
    R(0, 102, 180, 33, "#9a6638"); for (var x = 0; x < 180; x += 30) { R(x + 3, 106, 24, 26, "#8a5a30"); R(x + 3, 106, 24, 1, "#b8844e"); R(x + 26, 106, 1, 26, "#6a4424"); }
    // on the counter: a cup with steam, a cake under a glass dome, a little vase
    R(20, 88, 10, 9, K); R(21, 89, 8, 7, "#f4f1ea"); R(21, 89, 8, 1, "#ffffff"); R(29, 90, 3, 4, K); R(23, 84, 1, 2, "#ffffff"); R(26, 82, 1, 3, "#ffffff");
    R(17, 96, 16, 1, K);
    for (var yy = -16; yy <= 0; yy++) for (var xx = -15; xx <= 15; xx++) { var d = Math.hypot(xx, yy * 15 / 16); if (d > 15 || d < 13.6) continue; R(152 + xx, 96 + yy, 1, 1, xx + yy < -12 ? "#ffffff" : "#bfe0f0"); }
    R(141, 89, 22, 7, K); R(142, 90, 20, 2, "#fff6e4"); R(142, 92, 20, 3, "#c89a60"); R(145, 88, 3, 2, "#e8463c"); R(152, 88, 3, 2, "#e8463c"); R(138, 95, 28, 2, "#d8d0c4");
    R(112, 86, 6, 11, K); R(113, 87, 4, 9, "#86b2e2"); R(114, 80, 1, 7, "#3e8a3a"); R(112, 77, 5, 4, K); R(113, 78, 3, 2, "#f29aa8");
    return cqSvg(o);
  }
  function cqFrontTable() {                                          // the guest's own café table up close: a round wooden top on one leg, the floor around it
    var o = [], K = "#3a2414", R = function (x, y, w, h, c) { cqR(o, x, y, w, h, c); };
    var cx = 90, cy = 94, rx = 64, ry = 10;
    R(cx - 5, cy + 8, 10, 40, K); R(cx - 4, cy + 8, 8, 40, "#7a4e2c"); R(cx - 4, cy + 8, 2, 40, "#9a6a3e"); R(cx + 2, cy + 8, 2, 40, "#5a3820");   // the leg
    for (var y = -ry - 1; y <= ry + 5; y++) for (var x = -rx - 1; x <= rx + 1; x++) {
      var top = x * x / ((rx + 1) * (rx + 1)) + y * y / ((ry + 1) * (ry + 1)), side = y > 0 && y <= ry + 4 && x * x / ((rx + 1) * (rx + 1)) + (y - 4) * (y - 4) / ((ry + 1) * (ry + 1)) <= 1;
      if (top > 1 && !side) continue;
      var inner = x * x / (rx * rx) + y * y / (ry * ry), c;
      if (top <= 1 && inner <= 1) c = inner > .82 && y < 0 ? "#f0c890" : (x + y * 3) % 23 === 0 ? "#b07a44" : x < -rx * .3 && y < 2 ? "#d8a468" : "#c8945a";
      else if (top <= 1) c = K;
      else { var sd = x * x / (rx * rx) + (y - 4) * (y - 4) / (ry * ry); c = sd > 1 || y === ry + 4 ? K : y > ry + 1 ? "#6a4226" : "#8a5a34"; }
      R(cx + x, cy + y, 1, 1, c);
    }
    // on the table: the menu card standing up, a little vase with a flower
    R(52, 82, 18, 17, K); R(53, 83, 16, 15, "#fff6e4"); R(53, 83, 16, 2, "#e8463c"); for (var l = 0; l < 4; l++) R(55, 87 + l * 3, l % 2 ? 9 : 12, 1, "#b8a080"); R(52, 99, 18, 1, "#8a5a34");
    R(120, 88, 6, 11, K); R(121, 89, 4, 9, "#86b2e2"); R(121, 89, 1, 9, "#c8e0f4"); R(122, 82, 1, 7, "#3e8a3a"); R(120, 79, 5, 4, K); R(121, 80, 3, 2, "#f29aa8"); R(119, 99, 8, 1, "#8a5a34");
    return cqSvg(o);
  }
  // ---- over the counter: the guest tells you what they would like ----
  var CQ_HI = ["Hallo {h}!", "Guten Tag, {h}!", "Huhu, {h}!", "Hallöchen!", "Ach, ist das gemütlich hier!", "Hmm, wie es hier duftet!"];
  var CQ_ASK = ["Ich hätte gern {o}, bitte.", "Für mich bitte {o}.", "Heute nehme ich {o}.", "Kann ich {o} haben?", "Ich hätte so richtig Lust auf {o}."];
  var CQ_READY = ["Oh, ist das da {o}? Genau das nehme ich!", "Ich sehe, da steht schon {o}. Das wäre perfekt!"];
  var CQ_FRIEND = ["Schön, dich wiederzusehen, {h}!", "Wie immer bei dir, {h}: Ich freu mich schon!", "Ich hab dir aus meinem Garten etwas mitgebracht, als Bezahlung."];
  var CQ_OK = ["Kommt sofort!", "Gern!", "Wird gemacht!"];
  function cqPick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cqFill(s, id, o) { var t = gOrderText(o); return s.replace("{h}", N()).replace("{o}", t).replace("{O}", t.charAt(0).toUpperCase() + t.slice(1)).replace("{n}", ALLANI[id].name); }
  function cqTalkTo(id, o, fromCounter, g, atTable) {
    var an = ALLANI[id], fr = (garden.friends || {})[id] || 0, lines = [cqPick(CQ_HI)];
    if (fr >= 2 && Math.random() < .6) lines.push(cqPick(CQ_FRIEND));
    lines.push(fromCounter ? cqPick(CQ_READY) : cqPick(CQ_ASK));
    lines = lines.map(function (s) { return cqFill(s, id, o); });
    var old = cafeEl.querySelector(".cq-pov"); if (old) old.remove();
    var el = document.createElement("div"); el.className = "cq-pov pixtext";
    var pic = gWishPic(o);
    el.innerHTML = '<div class="cq-bg">' + (atTable ? cqFireBg() : CQ_BG === 5 ? cqRoomBg() : cqBack()) + '</div><div class="cq-ani"><svg viewBox="' + an.vb + '" aria-hidden="true" shape-rendering="crispEdges">' + an.svg + '</svg></div>' +
      '<div class="cq-front">' + (atTable ? cqFrontTable() : cqFront()) + '</div>' +
      '<div class="cq-box"><p class="cq-name">' + an.name + '</p><p class="cq-text"></p><div class="cq-wish" hidden>' + gSvg(pic, 3) + '</div>' +
      '<div class="cq-row" hidden><button type="button" class="pbtn cq-ok">' + cqPick(CQ_OK) + '</button></div></div>';
    cafeEl.appendChild(el);
    var tx = el.querySelector(".cq-text"), li = 0, ci = 0, done = false, timer = 0;
    beep([[880, .04], [1175, .06]]);
    function type() {                                                 // the words appear letter by letter, a little blip per word
      var s = lines[li]; ci++; tx.textContent = s.slice(0, ci);
      if (s[ci - 1] === " " && Math.random() < .6) beep([[600 + Math.random() * 400, .02]]);
      el.querySelector(".cq-ani").classList.toggle("talk", ci % 6 < 3);
      if (ci < s.length) { timer = setTimeout(type, 26); return; }
      el.querySelector(".cq-ani").classList.remove("talk");
      if (li < lines.length - 1) { timer = setTimeout(function () { li++; ci = 0; type(); }, 650); return; }
      done = true; el.querySelector(".cq-wish").hidden = false; el.querySelector(".cq-row").hidden = false;
    }
    type();
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!done) { clearTimeout(timer); li = lines.length - 1; tx.textContent = lines[li]; done = true; el.querySelector(".cq-ani").classList.remove("talk"); el.querySelector(".cq-wish").hidden = false; el.querySelector(".cq-row").hidden = false; return; }
      if (e.target.closest(".cq-ok")) { el.classList.add("out"); setTimeout(function () { el.remove(); }, 260);
        if (g) { g.ordered = true; if (atTable) { g.wait = 0; gBubble(g); say(ALLANI[id].name + " freut sich schon auf " + gOrderText(o) + "."); } else say(ALLANI[id].name + " wartet an der Theke."); }
        if (g && g._talkDone) { var d = g._talkDone; g._talkDone = null; d(); } }
    });
  }
  // ---- the queue in front of the counter ----
  function cqJoin(id, o, fromCounter) {
    var n = cqList().length, g = { id: id, q: true, qi: Date.now(), x: G_DOOR[0], y: G_DOOR[1], dir: 1, sp: (GSPEED[gMove(id)] || GSPEED[id] || 27) + Math.random() * 5, ph: Math.random() * 480, delay: 0, face: -1, state: "qwalk", order: o, t0: 0, wait: 0, table: -1, seat: -1, ordered: false, fromCounter: fromCounter };
    g.path = gFlies(g) ? [[CQ_X[n], CQ_Y]] : [[G_DOOR[0] + 12, G_LANE], [CQ_X[n], G_LANE + 2], [CQ_X[n], CQ_Y]];
    guests.push(g); gMake(g);
    var C2 = cfL(); C2.gseen = C2.gseen || {}; C2.gseen[id] = Date.now(); if (window.SudokuSave) window.SudokuSave();
    say(ALLANI[id].name + " kommt herein."); cqBellShow();
  }
  function cqBubble(g) { var s0 = g.state; g.state = "wait"; gBubble(g); g.state = s0; }
  function cqShift() { cqList().forEach(function (g, i) { var tx = CQ_X[i]; if (Math.abs(g.x - tx) > .5 || g.state === "qwalk") { g.state = "qwalk"; g.path = [[tx, CQ_Y]]; } }); }
  // ---- serving at the counter: hand it over, the guest carries it to a seat ----
  function cqSeat() {
    var free = [];
    TABLES.forEach(function (tb, ti) { tb.seats.forEach(function (sx, si) { if (!guests.some(function (g) { return g.table === ti && g.seat === si && g.state !== "gone"; })) free.push({ t: ti, s: si, shared: guests.some(function (g) { return g.table === ti && g.state !== "gone"; }) }); }); });
    if (!free.length) return null;
    var sh = free.filter(function (f) { return f.shared; });
    return sh.length && Math.random() < .6 ? sh[Math.floor(Math.random() * sh.length)] : free[Math.floor(Math.random() * free.length)];
  }
  var _cq_serveItem = gServeItem;
  gServeItem = function (g, it) {
    if (!g.q) return _cq_serveItem(g, it);
    if (cfHamAway()) cfHamJob(function () { return cfHamHome(); });   /* back behind the counter to hand it over */
    g.wished = gMatch(g.order, it); g.wrong = it.kind !== g.order.kind; g.srv = it.kind; if (it.kind === "cake") g.cakeK = it.k;
    if (it.src === "kitchen") say(N() + " holt schnell einen Kuchen aus der Küche und schneidet ihn an.");
    gRemove(it); g.q = false; var b = g.el.querySelector(".gq-bub"); if (b) b.innerHTML = "";
    var sk = it.kind, carry = document.createElementNS("http://www.w3.org/2000/svg", "g"); carry.setAttribute("class", "gq-carry"); g.el.appendChild(carry);
    carry.innerHTML = '<g transform="translate(' + (sk === "cake" ? -6 : -4) + ' -15)">' + gIcon(sk, gCk(g)) + '</g>'; g.carry = carry;
    cfHamSet({ paws: "up", eyes: "happy", mouth: "grin" }); setTimeout(function () { cfHamSet({}); }, 900);
    say(gServeLine(g)); beep([[659, .05], [784, .05], [988, .06]]);
    var seat = cqSeat();
    if (!seat) { setTimeout(function () { gToGo(g); g.carry && g.carry.remove(); }, 600); cqShift(); return; }
    g.table = seat.t; g.seat = seat.s; var tb = TABLES[seat.t], sx = tb.seats[seat.s]; g.face = sx < tb.top[0] ? 1 : -1;
    g.state = "qgo"; g.delay = .5; g.hd = 0;
    g.path = gFlies(g) ? [[sx, G_SEAT]] : [[g.x, G_LANE], [sx, G_LANE + (seat.s ? 2 : 0)], [sx, G_SEAT]];
    cqShift(); cqBellShow(); if (window.SudokuSave) window.SudokuSave();
  };
  // tapping someone in the queue: the usual card with the wish and the counter
  cfTrack.addEventListener("click", function (e) {
    if (e.target.closest(".cf-hit") || (typeof cfGameOn !== "undefined" && cfGameOn)) return;
    var r = cfTrack.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * CF.w, y = (e.clientY - r.top) / r.height * CF.h;
    var g = cqList().filter(function (q) { return Math.abs(q.x - x) < 11 && y > 94 && y < 135; })[0]; if (!g) return;
    e.stopPropagation();
    if (g.state === "qwalk") { say(ALLANI[g.id].name + " kommt gerade zur Theke."); return; }
    if (!g.ordered) { cqTalkTo(g.id, g.order, g.fromCounter, g); return; }
    cqAsk(g);
  }, true);
  function cqAsk(g) {                                                 // like the old card at the table: the wish, and everything on the counter
    var nm = ALLANI[g.id].name, its = gItems(), star = gPx(GIC.w.Stern, gPal());
    var tiles = its.map(function (it, n) { var ok = gMatch(g.order, it); return '<button type="button" data-n="' + n + '" class="gq-tile' + (ok ? " gq-ok" : "") + '">' + gSvg(gItemPic(it), 2) + '<span>' + it.name + '</span>' + (ok ? '<i>' + gSvg({ svg: star, w: 8, h: 8 }, 2) + '</i>' : "") + '</button>'; }).join("");
    var make = { tea: "Tee machen", coffee: "Kaffee machen", kakao: "Kakao machen", cake: "Kuchen backen" }[g.order.kind];
    var html = '<div class="gq-head">' + gSvg(gWishPic(g.order), 2) + '<p class="ga-h">' + nm + ' möchte ' + gOrderText(g.order) + '</p></div>' +
      (its.length ? '<div class="ga-grid gq-grid">' + tiles + '</div>' : '<p class="gq-none">Auf der Theke steht noch nichts.</p>') +
      '<div class="ga-row"><button type="button" class="ga-no" data-k="later">Später</button><button type="button" class="ga-yes pbtn" data-k="make">' + make + '</button></div>';
    gPopup(html, function (b, el) {
      el.remove();
      if (b.dataset.k === "make") { if (g.order.kind === "cake") cfStartBake(); else if (g.order.kind === "tea") teaGame(); else coffeeGame(); return; }
      if (b.dataset.n != null && g.q && g.state === "queue" && g.ordered) gServeItem(g, its[+b.dataset.n]);
    });
  }
  // what is on the counter and not yet promised: queued guests count as promised too
  gFreeItems = function () {
    var its = gItems(), used = {};
    guests.forEach(function (q) { if (!q.order || (q.state !== "walk" && q.state !== "wait" && q.state !== "qwalk" && q.state !== "queue")) return; for (var i = 0; i < its.length; i++) if (!used[i] && gMatch(q.order, its[i])) { used[i] = 1; break; } });
    return its.filter(function (it, i) { return !used[i]; });
  };
  // ---- moving: the queue and the walk to the table ----
  var cqLast = 0;
  function cqTick(t) {
    if (!cafeOn || document.hidden) { cqLast = 0; setTimeout(function () { requestAnimationFrame(cqTick); }, 500); return; }   /* battery: no frame loop while the café is closed */
    requestAnimationFrame(cqTick);
    var dt = Math.min(.05, (t - (cqLast || t)) / 1000); cqLast = t;
    guests.forEach(function (g) {
      if (g.state === "qwalk") { if (gStep(g, dt)) { g.mov = false; g.state = "queue"; g.face = -1; } }
      else if (g.state === "queue") { g.face = -1;
        if (!g.ordered && !g.talking && !cafeEl.querySelector(".cq-pov") && !cafeEl.querySelector(".gq-pop") && !(typeof cfGameOn !== "undefined" && cfGameOn) && !uiBusy()) { g.talking = true; cqTalkTo(g.id, g.order, g.fromCounter, g); setTimeout(function () { g.talking = false; }, 1500); } }
      else if (g.state === "qgo") { if (gStep(g, dt)) { g.mov = false; g.face = TABLES[g.table].seats[g.seat] < TABLES[g.table].top[0] ? 1 : -1; if (g.carry) { g.carry.remove(); g.carry = null; } g.state = "eat"; g.t0 = performance.now(); g.ts = 0; gItemOnTable(g, true); beep([[523, .04], [659, .05]]); } }
    });
    cqTalk(t);
  }
  requestAnimationFrame(cqTick);
  // closing soon: whoever still queues is sent home kindly
  var _cq_close = gCloseSoon; gCloseSoon = function () { cqList().forEach(function (g) { g.q = false; var b = g.el && g.el.querySelector(".gq-bub"); if (b) b.innerHTML = ""; gGo(g); }); _cq_close.apply(this, arguments); cqBellShow(); };

  // ---- conversations at the tables: little scenes with pictures and words over whoever is talking ----
  // lines: [speaker 0/1, text or "", icon]; icons: dish (what they got), crop names, Herz, Stern, Blatt, keks, note, dots, sun, rain
  var CQ_TALKS = [
    [[0, "Wie schmeckt's?", ""], [1, "", "dish"], [1, "Himmlisch!", ""], [0, "", "Herz"]],
    [[0, "Meine Erdbeeren sind reif!", "strawberry"], [1, "Oh, toll!", ""], [1, "Bringst du mir welche?", ""], [0, "Na klar!", "Herz"]],
    [[0, "Hast du den Regen gehört?", "rain"], [1, "Gut für den Garten!", "Blatt"], [0, "Stimmt!", ""]],
    [[0, "", "note"], [1, "Summst du?", ""], [0, "Hihi, ertappt!", ""], [1, "", "note"]],
    [[0, "Ich übe Kuchen backen.", "keks"], [1, "Und?", ""], [0, "Er ist ... flach.", ""], [1, "Hihi!", "Herz"]],
    [[0, "Sonne morgen?", "sun"], [1, "Hoffentlich!", ""], [1, "Dann gehen wir zum See.", ""], [0, "Au ja!", "Stern"]],
    [[0, "Kennst du den Hamster?", ""], [1, "{h}? Der ist super!", "Herz"], [0, "Finde ich auch.", ""]],
    [[0, "Meine Sonnenblume ist riesig!", "sunflower"], [1, "Größer als du?", ""], [0, "Viel größer!", "Stern"]],
    [[0, "", "dots"], [1, "Woran denkst du?", ""], [0, "An Kürbissuppe.", "pumpkin"], [1, "Mmmh!", ""]],
    [[0, "Probier mal!", "dish"], [1, "Oh!", ""], [1, "Das will ich morgen wieder.", "Herz"]],
    [[0, "Ich hab eine Feder gefunden.", ""], [1, "Zeig mal!", ""], [0, "Ganz weich!", "Stern"]],
    [[0, "Gestern hab ich Sterne gezählt.", "Stern"], [1, "Wie viele?", ""], [0, "Bei zwölf eingeschlafen.", ""], [1, "Hihi!", ""]],
    [[0, "Meine Möhren wollen nicht wachsen.", "gcarrot"], [1, "Mehr gießen!", ""], [0, "Gute Idee!", "Blatt"]],
    [[0, "Wollen wir Freunde sein?", ""], [1, "Sind wir doch schon!", "Herz"], [0, "", "Herz"]],
    [[0, "Das Café ist so gemütlich.", ""], [1, "Wie ein warmes Nest.", ""], [0, "", "Herz"]],
    [[0, "Hast du Tomaten?", "tomato"], [1, "Ganz viele!", ""], [0, "Tauschen gegen Beeren?", "raspberry"], [1, "Abgemacht!", "Stern"]]
  ];
  var CQ_SOLO = [["", "dish"], ["Mmh!", ""], ["", "Herz"], ["Lecker.", ""], ["", "note"], ["Schön warm hier.", ""], ["", "dots"]];
  var cqLayer = null, cqConv = {};
  function cqTalkLayer() { if (!cqLayer || !cqLayer.isConnected) { cqLayer = document.createElement("div"); cqLayer.className = "cq-talk"; cfTrack.appendChild(cqLayer); } return cqLayer; }
  function cqIcon(g, k) {
    if (!k) return "";
    var px = function (inner, w, h) { return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w * 2 + '" height="' + h * 2 + '" shape-rendering="crispEdges" aria-hidden="true">' + inner + '</svg>'; };
    if (k === "dish") { var sk = g.srv || (g.order && g.order.kind) || "tea", cake = sk === "cake"; return px(gIcon(sk, gCk(g)), cake ? 13 : 8, cake ? 11 : 8); }
    if (GIC.w[k]) return px(gPx(GIC.w[k], gPal()), 8, 8);
    if (k === "dots") return px('<path fill="#3a2414" d="M1 4h2v2h-2zM5 4h2v2h-2zM9 4h2v2h-2z"/>', 12, 8);
    if (k === "note") return px('<path fill="#3a2414" d="M5 0h4v1h1v2h-1v-1h-3v5h-1v1h-3v-1h-1v-2h1v-1h3z"/><path fill="#6a9ad8" d="M2 6h3v1h-3z"/>', 10, 8);
    if (k === "sun") return px('<path fill="#3a2414" d="M3 1h4v1h1v1h1v4h-1v1h-1v1h-4v-1h-1v-1h-1v-4h1v-1h1z"/><path fill="#ffd34a" d="M3 2h4v1h1v4h-1v1h-4v-1h-1v-4h1z"/><path fill="#fff1a8" d="M3 3h2v1h-2z"/>', 10, 10);
    if (k === "rain") return px('<path fill="#3a2414" d="M3 0h4v1h2v1h1v3h-10v-3h1v-1h2z"/><path fill="#d8e0e8" d="M3 1h4v1h2v2h-8v-2h2z"/><path fill="#6aaee0" d="M2 6h1v2h-1zM5 7h1v2h-1zM8 6h1v2h-1z"/>', 10, 10);
    var f = FOOD[k] || ("f_" + k); if (A[f] && SZ[f]) return px(A[f], SZ[f][0], SZ[f][1]);
    return "";
  }
  function cqSay(g, text, icon) {
    var L = cqTalkLayer(); if (g.say) g.say.remove();
    var el = document.createElement("div"); el.className = "cq-say" + (text ? "" : " ico");
    el.innerHTML = (icon ? '<span class="cq-ic">' + cqIcon(g, icon) + '</span>' : "") + (text ? '<span>' + text.replace("{h}", N()) + '</span>' : "");
    L.appendChild(el); g.say = el; g.sayUntil = performance.now() + 2600; cqPlace(g);
    beep([[700 + Math.random() * 400, .025], [900 + Math.random() * 300, .025]]);
  }
  function cqPlace(g) { if (!g.say) return; g.say.style.left = (g.x / CF.w * 100).toFixed(2) + "%"; g.say.style.top = ((g.y - (g.bh || 30) - 8) / CF.h * 100).toFixed(2) + "%"; }
  function cqTalk(t) {
    var now = performance.now(), paused = (typeof cfGameOn !== "undefined" && cfGameOn) || uiBusy();
    guests.forEach(function (g) { if (g.say && (now > g.sayUntil || !g.el)) { g.say.remove(); g.say = null; } else cqPlace(g); });
    if (paused) return;
    TABLES.forEach(function (tb, ti) {
      var at = guests.filter(function (g) { return g.table === ti && (g.state === "eat" || g.state === "chat") && g.el; });
      var cv = cqConv[ti];
      if (at.length < 2) { if (cv) delete cqConv[ti]; if (at.length === 1 && (!at[0].soloAt || now > at[0].soloAt)) { if (at[0].soloAt) { var s1 = cqPick(CQ_SOLO); cqSay(at[0], s1[0], s1[1]); } at[0].soloAt = now + 7000 + Math.random() * 7000; } return; }
      if (!cv || (cv.i >= cv.lines.length && now > cv.next)) { if (cv && now < cv.next) return; cqConv[ti] = cv = { lines: cqPick(CQ_TALKS), i: 0, next: now + (cv ? 6000 + Math.random() * 6000 : 1500), who: [at[0], at[1]] }; return; }
      if (now < cv.next || cv.i >= cv.lines.length) return;
      var ln = cv.lines[cv.i++], sp = cv.who[ln[0]]; if (!sp || !sp.el || guests.indexOf(sp) < 0) { delete cqConv[ti]; return; }
      cqSay(sp, ln[1], ln[2]); cv.next = now + 2500 + Math.random() * 600;
      if (cv.i >= cv.lines.length) cv.next = now + 9000 + Math.random() * 8000;
    });
  }
  // ---- guests at the tables again: they come in on their own until one seat is left, which is kept for the bell guest ----
  var cqAuto = 6;
  function cqFreeSeats() { var f = []; TABLES.forEach(function (tb, ti) { tb.seats.forEach(function (sx, si) { if (!guests.some(function (g) { return g.table === ti && g.seat === si && g.state !== "gone"; })) f.push({ t: ti, s: si }); }); }); return f; }
  function cqAutoSpawn() {
    var free = cqFreeSeats(), reserve = 1 + cqList().length;            // one seat for the bell, and one for everybody already queuing at the counter
    if (free.length <= reserve) return false;
    var here = function (id) { return ALLANI[id] && !guests.some(function (g) { return g.id === id; }); };
    var pool = gKnown().filter(here); if (pool.length < 2) pool = pool.concat(gAnyone().filter(here));   /* friends first, otherwise any animal from around */
    if (!pool.length) return false;
    var sh = free.filter(function (f) { return guests.some(function (g) { return g.table === f.t && g.state !== "gone"; }); });   // now and then they join someone
    var f = sh.length && Math.random() < .5 ? sh[Math.floor(Math.random() * sh.length)] : free[Math.floor(Math.random() * free.length)];
    var id = pool[Math.floor(Math.random() * pool.length)], tb = TABLES[f.t], sx = tb.seats[f.s];
    var g = { id: id, table: f.t, seat: f.s, x: G_DOOR[0], y: G_DOOR[1], dir: 1, sp: (GSPEED[gMove(id)] || GSPEED[id] || 27) + Math.random() * 5, ph: Math.random() * 480, delay: 0,
      path: [[G_DOOR[0] + 12, G_LANE], [sx, G_LANE + (f.s ? 2 : 0)], [sx, G_SEAT]], face: sx < tb.top[0] ? 1 : -1, state: "walk", order: gOrder(id), t0: 0, wait: 0, atTable: true, ordered: false };
    if (gFlies(g)) g.path = [[sx, G_SEAT]];
    guests.push(g); gMake(g);
    var C2 = cfL(); C2.gseen = C2.gseen || {}; C2.gseen[id] = Date.now(); if (window.SudokuSave) window.SudokuSave();
    beep([[784, .05], [988, .06]]); say(ALLANI[id].name + " kommt ins Café.");
    return true;
  }
  setInterval(function () {
    if (!cafeOn || gClosing() || (typeof cfGameOn !== "undefined" && cfGameOn) || uiBusy()) return;
    cqAuto -= 1; if (cqAuto > 0) return;
    cqAutoSpawn(); cqAuto = cqFreeSeats().length > 3 ? 3 + Math.floor(Math.random() * 4) : 7 + Math.floor(Math.random() * 7);   /* an empty café fills quickly */
  }, 1000);
  // when a guest has left, the next one comes within a minute (20 to 60 seconds)
  var cqAfterLeave = false, _cq_go = gGo; gGo = function (g) { var r = _cq_go.apply(this, arguments); var d = 20 + Math.floor(Math.random() * 41); cqAuto = cqAfterLeave ? Math.min(cqAuto, d) : d; cqAfterLeave = true; return r; };
  var _cq_auto0 = cqAutoSpawn; cqAutoSpawn = function () { var ok = _cq_auto0.apply(this, arguments); if (ok) cqAfterLeave = false; return ok; };
  var _cq_start2 = guestsStart; guestsStart = function () { _cq_start2.apply(this, arguments); cqAuto = 2; };
  // tapping a table where someone has not ordered yet: the hamster walks over, and the guest tells you what they would like
  function cqTableOrder(g) {
    if (g.taking) return; g.taking = true;
    cfHamJob(function () {
      var tb = TABLES[g.table], sx = tb.seats[g.seat], to = [tb.top[0] + (sx < tb.top[0] ? -7 : 7), 126];
      return cfHamGo(to).then(function () {
        g.taking = false;
        if (!cafeOn || g.state !== "wait" || g.ordered) return;
        cfHamSet({ eyes: "happy", mouth: "smile" });
        return new Promise(function (res) { g._talkDone = res; cqTalkTo(g.id, g.order, false, g, true); var w = setInterval(function () { if (!cafeEl.querySelector(".cq-pov") || !cafeOn) { clearInterval(w); if (g._talkDone) { g._talkDone = null; res(); } } }, 400); });
      }).then(function () { cfHamSet({}); });   /* he stays at the table until you bring something */
    });
  }
  var _cq_gAsk = gAsk; gAsk = function (g) { if (g.atTable && !g.ordered && g.state === "wait") return cqTableOrder(g); return _cq_gAsk(g); };
  // closing soon: whoever has not even ordered yet just goes home
  var _cq_close2 = gCloseSoon; gCloseSoon = function () { guests.forEach(function (g) { if (g.atTable && !g.ordered && g.state === "wait") { gGo(g); gBubble(g); } }); _cq_close2.apply(this, arguments); };
  // ---- the hamster has a treat himself: "Füttern" in the café offers what stands on the counter ----
  var CQ_SNACK = { coffee: { energy: 25, fun: 4, t: "trinkt einen Kaffee und ist hellwach" }, kakao: { energy: 10, fun: 12, food: 6, t: "schlürft einen Kakao" },
    tea: { energy: 12, love: 6, t: "trinkt in Ruhe einen Tee" }, cake: { food: 30, fun: 10, t: "nascht ein Stück Kuchen" } };
  function cqSnack() {
    var its = gItems();
    var tiles = its.map(function (it, n) { return '<button type="button" data-n="' + n + '" class="gq-tile">' + gSvg(gItemPic(it), 2) + '<span>' + it.name + '</span></button>'; }).join("");
    gPopup('<p class="ga-h">Was gönnt sich ' + N() + '?</p>' + (its.length ? '<div class="ga-grid gq-grid">' + tiles + '</div>' : '<p class="gq-none">Auf der Theke steht noch nichts.</p>') +
      '<div class="ga-row"><button type="button" class="ga-no" data-k="food">Anderes Futter</button></div>', function (b, el) {
      el.remove();
      if (b.dataset.k === "food") { var f = document.getElementById("foods"); f.hidden = false; return; }
      if (b.dataset.n == null) return; var it = its[+b.dataset.n]; if (!it) return;
      gRemove(it); var sn = CQ_SNACK[it.kind] || CQ_SNACK.tea;
      ["food", "energy", "love", "fun"].forEach(function (k) { if (sn[k]) s[k] = clamp(s[k] + sn[k]); }); renderNeeds();
      say(N() + " " + sn.t + "."); beep([[660, .05], [880, .06]]);
      cfHamJob(function () {
        CFH.hold = '<g>' + gIcon(it.kind, it.kind === "cake" ? it.k : null) + '</g>'; CFH.hw = it.kind === "cake" ? 13 : 8; CFH.hh = it.kind === "cake" ? 11 : 8;
        var n = 0;
        return new Promise(function (res) { var t = setInterval(function () { n++; cfHamSet({ eyes: "happy", mouth: n % 2 ? "open" : "smile", blush: true });
          if (n >= 8) { clearInterval(t); CFH.hold = ""; cfHamSet({ eyes: "happy", mouth: "grin", paws: "up", blush: true }); setTimeout(function () { cfHamSet({}); res(); }, 900); } }, 380); });
      });
    });
  }
  var cqFeedBtn = document.getElementById("a-feed");
  if (cqFeedBtn) cqFeedBtn.addEventListener("click", function (e) {
    if (!(place2 === "cafe" && cafeOn) || (typeof cfGameOn !== "undefined" && cfGameOn)) return;
    e.stopImmediatePropagation(); document.getElementById("foods").hidden = true; cqSnack();
  }, true);
  // the old random chat bubbles make way for the conversations
  gTalk = function () {};
  var _cq_leave = closeCafe; closeCafe = function () { guests.forEach(function (g) { if (g.say) { g.say.remove(); g.say = null; } }); cqConv = {}; return _cq_leave.apply(this, arguments); };
  window.__cq = { ring: cqRing, list: function () { return cqList().map(function (g) { return { id: g.id, state: g.state, x: g.x, order: g.order }; }); }, all: function () { return guests.map(function (g) { return { id: g.id, state: g.state, table: g.table, seat: g.seat, x: g.x, y: g.y }; }); },
    serveFront: function () { var g = cqList()[0]; if (!g) return false; var its = gItems(); if (!its.length) return "empty"; gServeItem(g, its[0]); return true; }, conv: function () { return cqConv; } };
  window.__cq.bg = function (n, x, y, w2) { CQ_BG = n; if (x != null) CQ_ROOMX = x; if (y != null) CQ_ROOMY = y; if (w2 != null) CQ_WIN2 = w2; };
  window.__cq.ringAs = function (id) { var orig = gKnown; gKnown = function () { return [id]; }; try { cqRing(); } finally { gKnown = orig; } };   // preview test: call a given guest
  window.__cq.tableTalk = function (id) { cqTalkTo(id, gOrderNew(id), false, null, true); };   // preview test: the order view at a table
  window.__cq.fireDx = function (d, y) { CQ_FIREDX = d; if (y != null) CQ_FIREY = y; };
  window.__cq.theme = function (t) { cfL().theme = t; cfRebuild(); };   // preview test: switch the café style

  // he only goes back behind the counter when you want to make something: tea, coffee or a cake
  (function () {
    var home = function () { if (cafeOn && typeof cfHamAway === "function" && cfHamAway()) cfHamJob(function () { return cfHamHome(); }); };
    var _t = teaGame; teaGame = function () { home(); return _t.apply(this, arguments); };
    var _c = coffeeGame; coffeeGame = function () { home(); return _c.apply(this, arguments); };
    var _b = cfStartBake; cfStartBake = function () { home(); return _b.apply(this, arguments); };
  })();
  window.__cq.age = function (sec) { guests.forEach(function (g) { g.life = (g.life || 0) + sec; }); };   // preview test: let time pass for the guests
