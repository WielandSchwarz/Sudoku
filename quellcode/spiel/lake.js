  // ===================== the boat trip on the lake: a trading chain =====================
  // Seen from above. Little islands, an animal on each. Every animal has something and wishes for something else, and only swaps when it gets its wish.
  // The hamster starts at the jetty with one thing from home; the boat carries one thing at a time; the raft by the jetty can hold one more.
  // Tap an island and the boat rows there. Find the order of the swaps so that in the end every animal has what it wished for: then there is a lake party.
  var lkEl = xEl("div", "bee-pov fi-pov lk-pov", scene); lkEl.hidden = true;
  lkEl.innerHTML = '<canvas width="180" height="135" class="fi-cv"></canvas><div class="cap-toast" hidden></div><div class="fi-card" hidden></div><button type="button" class="bp-x" aria-label="Bootstour beenden">×</button><button type="button" class="lk-redo" aria-label="Nochmal von vorn">↺</button>';
  var lkCv = lkEl.querySelector("canvas"), lkc = lkCv.getContext("2d"); lkc.imageSmoothingEnabled = false;
  var lkToast = lkEl.querySelector(".cap-toast"), lkCard = lkEl.querySelector(".fi-card"), lk = null, lkRaf = 0, LD = "#3a2414";
  function lP(x, y, w, h, c) { lkc.fillStyle = c; lkc.fillRect(Math.round(x), Math.round(y), w, h); }
  function lDisc(cx, cy, rx, ry, fn) { for (var yy = -Math.ceil(ry); yy <= Math.ceil(ry); yy++) for (var xx = -Math.ceil(rx); xx <= Math.ceil(rx); xx++) { var d = (xx / (rx + .45)) * (xx / (rx + .45)) + (yy / (ry + .45)) * (yy / (ry + .45)); if (d > 1) continue; var c = fn(xx, yy, d); if (c) lP(cx + xx, cy + yy, 1, 1, c); } }
  function lkSay(t) { lkToast.textContent = t; lkToast.hidden = false; lkToast.classList.remove("pop"); void lkToast.offsetWidth; lkToast.classList.add("pop"); clearTimeout(lkSay.t); lkSay.t = setTimeout(function () { lkToast.hidden = true; }, 2200); }
  // ---- the things to swap: little 9x9 pictures ----
  var LK_ITEM = { N: "Haselnuss", H: "Honig", F: "Blume", I: "Fisch", T: "Stock", B: "Beeren", K: "Klee", S: "Muschel", C: "Möhre" };
  function lkIcon(k, x, y) { x = Math.round(x); y = Math.round(y); var p = function (a, b, w, h, c) { lP(x + a, y + b, w, h, c); };
    if (k === "N") { lDisc(x + 4, y + 5, 3, 3, function (a, b, d) { return d > .7 ? LD : a + b < -1 ? "#d8a070" : "#a8703e"; }); p(1, 1, 7, 2, LD); p(2, 1, 5, 1, "#7a4a28"); p(4, 0, 1, 1, "#5a3a1e"); }
    else if (k === "H") { p(1, 2, 7, 7, LD); p(2, 3, 5, 5, "#f0b030"); p(2, 3, 2, 2, "#ffd870"); p(1, 1, 7, 2, "#c8945a"); p(1, 0, 7, 1, LD); }
    else if (k === "F") { lDisc(x + 4, y + 3, 3, 3, function (a, b, d) { return d > .8 ? "#c8466a" : Math.abs(a) + Math.abs(b) < 2 ? "#ffe08a" : "#ff9ab8"; }); p(4, 6, 1, 3, "#4e9a44"); p(5, 7, 2, 1, "#86cc62"); }
    else if (k === "I") { lDisc(x + 4, y + 4, 3.5, 2, function (a, b, d) { return d > .75 ? "#3a5a7a" : b < 0 ? "#a8d0e8" : "#7aa8c8"; }); p(8, 2, 1, 5, "#7aa8c8"); p(7, 3, 1, 3, "#7aa8c8"); p(2, 3, 1, 1, LD); }
    else if (k === "T") { for (var i = 0; i < 9; i++) { p(i, 7 - Math.round(i * .75), 1, 2, i % 3 ? "#8a5a32" : "#6a3e22"); } p(5, 1, 2, 1, "#86cc62"); }
    else if (k === "B") { lDisc(x + 3, y + 5, 2, 2, function (a, b, d) { return d > .7 ? "#8a1a2a" : a + b < 0 ? "#ff6a7a" : "#d8304a"; }); lDisc(x + 6, y + 6, 2, 2, function (a, b, d) { return d > .7 ? "#8a1a2a" : a + b < 0 ? "#ff6a7a" : "#d8304a"; }); p(4, 0, 1, 3, "#5a3a1e"); p(5, 1, 3, 2, "#4e9a44"); }
    else if (k === "K") { [[2, 2], [6, 2], [4, 5]].forEach(function (q) { lDisc(x + q[0], y + q[1], 2, 2, function (a, b, d) { return d > .7 ? "#2e6a2e" : "#5aa040"; }); }); p(4, 6, 1, 3, "#2e6a2e"); }
    else if (k === "S") { for (var yy = 0; yy < 6; yy++) for (var xx = -4; xx <= 4; xx++) { var d = (xx / 4.5) * (xx / 4.5) + (yy / 6) * (yy / 6); if (d <= 1) p(4 + xx, 7 - yy, 1, 1, d > .75 ? "#a85a6a" : Math.abs(xx) % 2 ? "#f0a0b0" : "#ffd0d8"); } p(3, 7, 3, 2, "#a85a6a"); }
    else if (k === "C") { for (var c2 = 0; c2 < 7; c2++) p(4 - Math.floor((6 - c2) / 2.5), 2 + c2, Math.max(1, Math.round((6 - c2) / 1.3)), 1, c2 % 2 ? "#f08a24" : "#ff9a3a"); p(3, 0, 1, 2, "#4e9a44"); p(5, 0, 1, 2, "#4e9a44"); p(4, 1, 1, 1, "#86cc62"); }
  }
  // ---- the levels: each animal is [id, wants, has]; start = what the hamster brings; par = the fewest trips ----
  var LK_LV = [
    { n: "Erste Tour", start: "N", par: 3, a: [["squirrel", "N", "H"], ["igel", "H", "F"], ["mouse", "F", ""]] },
    { n: "Blumengrüße", start: "N", par: 4, a: [["squirrel", "N", "F"], ["frog", "F", "H"], ["igel", "H", "F"], ["mouse", "F", ""]] },
    { n: "Beerenzeit", start: "C", par: 5, a: [["hare", "C", "B"], ["robin", "B", "K"], ["igel", "K", "B"], ["otter", "B", "I"], ["frog", "I", ""]] },
    { n: "Ein Geschenk", start: "N", par: 5, a: [["squirrel", "N", "H"], ["robin", "", "F"], ["igel", "H", ""], ["mouse", "F", "K"], ["hare", "K", ""]] },
    { n: "Großes Seefest", start: "T", par: 6, a: [["beaver", "T", "I"], ["hare", "", "C"], ["otter", "I", "S"], ["frog", "I", ""], ["turtle", "S", "I"], ["squirrel", "C", ""]] }
  ];
  var LK_POS = { 3: [[40, 44], [140, 44], [90, 86]], 4: [[36, 44], [144, 44], [52, 90], [128, 90]], 5: [[30, 44], [90, 40], [150, 44], [48, 90], [132, 90]], 6: [[30, 44], [90, 40], [150, 44], [30, 90], [150, 90], [90, 84]] };
  var LK_JETTY = [90, 120];
  // ---- the animals drawn at their own size from their own pictures ----
  var lkAni = {};
  function lkAniImg(id) { if (lkAni[id]) return lkAni[id]; var an = ALLANI[id]; if (!an) return null; var vb = an.vb.split(" ").map(Number), im = new Image(), o = { c: null };
    im.onload = function () { var W = vb[2], H = vb[3], c1 = document.createElement("canvas"); c1.width = W; c1.height = H; var x1 = c1.getContext("2d"); x1.drawImage(im, 0, 0, W, H); var d = x1.getImageData(0, 0, W, H).data,
        w = Math.ceil(W / 2), h = Math.ceil(H / 2), c2 = document.createElement("canvas"); c2.width = w; c2.height = h; var x2 = c2.getContext("2d"), od = x2.createImageData(w, h);
      for (var yy = 0; yy < h; yy++) for (var xx = 0; xx < w; xx++) { var cols = [], dark = null, nd = 0;   /* each new pixel takes the outline if the block has much of it, otherwise its most common colour */
        for (var j = 0; j < 2; j++) for (var i = 0; i < 2; i++) { var X = xx * 2 + i, Y = yy * 2 + j; if (X >= W || Y >= H) continue; var q = (Y * W + X) * 4; if (d[q + 3] < 128) continue; var k = d[q] + "," + d[q + 1] + "," + d[q + 2]; cols.push(k); if (d[q] + d[q + 1] + d[q + 2] < 200) { nd++; dark = k; } }
        if (cols.length < 2) continue; var pick = nd >= 2 ? dark : null; if (!pick) { var cnt = {}; cols.forEach(function (k) { if (nd < 2 && dark === k) return; cnt[k] = (cnt[k] || 0) + 1; }); var best = 0; for (var k2 in cnt) if (cnt[k2] > best) { best = cnt[k2]; pick = k2; } if (!pick) pick = cols[0]; }
        var rgb = pick.split(",").map(Number), r = (yy * w + xx) * 4; od.data[r] = rgb[0]; od.data[r + 1] = rgb[1]; od.data[r + 2] = rgb[2]; od.data[r + 3] = 255; }
      x2.putImageData(od, 0, 0); o.c = c2; };
    im.src = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + an.vb + '" width="' + vb[2] + '" height="' + vb[3] + '" shape-rendering="crispEdges">' + an.svg + '</svg>'); lkAni[id] = o; return o; }
  function lkName(id) { return (typeof ANAME !== "undefined" && ANAME[id]) || (ALLANI[id] && ALLANI[id].name) || "Das Tier"; }
  // ---- start, end ----
  function lkSt() { var L = life(); L.lake = L.lake || { lv: 0, stars: [] }; return L.lake; }
  function lkStart(li) {
    var S = lkSt(), D = LK_LV[li]; if (!D) return;
    lk = { li: li, D: D, cargo: D.start, raft: "", trips: 0, isl: D.a.map(function (q, i) { lkAniImg(q[0]); return { id: q[0], want: q[1], has: q[2], happy: false, x: LK_POS[D.a.length][i][0], y: LK_POS[D.a.length][i][1], hop: 0 }; }),
      boat: { x: LK_JETTY[0], y: LK_JETTY[1] - 8, tx: null, ty: null, dir: 0, go: null }, at: "jetty", done: false, last: 0, hearts: [], party: 0 };
    lkCard.hidden = true; lkSay(li === 0 ? "Tippe auf eine Insel." : D.n); if (!lkRaf) lkRaf = requestAnimationFrame(lkDraw);
  }
  function lkOpen() { var S = lkSt(); lkEl.hidden = false; lkStart(Math.min(S.lv, LK_LV.length - 1)); }
  function lkClose() { lkEl.hidden = true; if (lkRaf) cancelAnimationFrame(lkRaf); lkRaf = 0; lk = null; }
  window.__lkOpen = lkOpen; window.__lkLv = function (i) { lkEl.hidden = false; lkStart(i); };
  lkEl.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); lkClose(); });
  lkEl.querySelector(".lk-redo").addEventListener("click", function (e) { e.stopPropagation(); if (lk && !lk.done) { beep([[440, .04], [330, .05]]); lkStart(lk.li); } });
  lkEl.addEventListener("click", function (e) { e.stopPropagation(); });
  // ---- rowing to a place, then what happens there ----
  function lkPt(e) { var r = lkCv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 180, (e.clientY - r.top) / r.height * 135]; }
  lkCv.addEventListener("pointerdown", function (e) { if (!lk || lk.done || lk.boat.go) return; e.preventDefault(); var p = lkPt(e), hit = null;
    lk.isl.forEach(function (I, i) { if (Math.hypot(p[0] - I.x, (p[1] - I.y + 6) * 1.2) < 22) hit = i; });
    if (hit === null && Math.hypot(p[0] - LK_JETTY[0], p[1] - LK_JETTY[1]) < 22) hit = "jetty";
    if (hit === null) return;
    if (hit === lk.at) { lkArrive(hit); return; }
    var tx = hit === "jetty" ? LK_JETTY[0] : lk.isl[hit].x, ty = hit === "jetty" ? LK_JETTY[1] - 8 : lk.isl[hit].y + 19;
    lk.boat.go = { k: hit, x0: lk.boat.x, y0: lk.boat.y, tx: tx, ty: ty, t0: performance.now(), dur: Math.max(500, Math.hypot(tx - lk.boat.x, ty - lk.boat.y) * 16) }; lk.trips++; beep([[300, .04]]); });
  function lkArrive(k) {
    lk.at = k;
    if (k === "jetty") {   // the raft by the jetty keeps one thing for later
      if (lk.cargo && !lk.raft) { lk.raft = lk.cargo; lk.cargo = ""; lkSay("Aufs Floß gelegt."); beep([[520, .04]]); }
      else if (!lk.cargo && lk.raft) { lk.cargo = lk.raft; lk.raft = ""; lkSay("Vom Floß geholt."); beep([[620, .04]]); }
      else if (lk.cargo && lk.raft) { var t = lk.cargo; lk.cargo = lk.raft; lk.raft = t; lkSay("Getauscht mit dem Floß."); beep([[520, .04], [620, .04]]); }
      lkCheck(); return; }
    var I = lk.isl[k], nm = lkName(I.id);
    if (I.happy) { lkSay("Schon glücklich."); return; }
    if (!I.want) {   /* this one wants nothing, it just has a present for you: the boat must be empty to take it */
      if (lk.cargo) { lkSay("Ein Geschenk! Das Boot ist aber voll."); beep([[392, .05]]); return; }
      I.happy = true; I.hop = performance.now(); lk.cargo = I.has; I.has = "";
      for (var h2 = 0; h2 < 4; h2++) lk.hearts.push({ x: I.x - 6 + h2 * 4, y: I.y - 26, t0: performance.now() + h2 * 120 });
      beep([[659, .05], [784, .05], [988, .08]]); lkSay("Für dich: " + LK_ITEM[lk.cargo] + "."); lkCheck(); return; }
    if (lk.cargo === I.want) {
      I.happy = true; I.hop = performance.now(); var got = I.has; lk.cargo = got; I.has = "";
      for (var h = 0; h < 4; h++) lk.hearts.push({ x: I.x - 6 + h * 4, y: I.y - 26, t0: performance.now() + h * 120 });
      beep([[659, .05], [784, .05], [988, .08]]);
      lkSay(got ? "Danke! Hier: " + LK_ITEM[got] + "." : "Danke!");
      lkCheck();
    } else { lkSay("Lieber " + LK_ITEM[I.want] + "."); beep([[392, .05]]); }
  }
  function lkCheck() {
    if (lk.isl.every(function (I) { return I.happy; })) { lk.done = true; lk.party = performance.now(); setTimeout(lkWin, 2400); beep([[523, .06], [659, .06], [784, .06], [1047, .12]]); return; }
    var open = lk.isl.filter(function (I) { return !I.happy; }), useful = function (k) { return k && open.some(function (I) { return I.want === k; }); };
    if (!useful(lk.cargo) && !useful(lk.raft) && !open.some(function (I) { return !I.want; })) setTimeout(function () { if (lk && !lk.done) lkSay("Das möchte keiner mehr. Nochmal? ↺"); }, 1400);
  }
  function lkWin() { if (!lk) return; var S = lkSt(), n = lk.trips <= lk.D.par ? 3 : lk.trips <= lk.D.par + 2 ? 2 : 1, first = !(S.stars[lk.li] > 0);
    S.stars[lk.li] = Math.max(S.stars[lk.li] || 0, n); if (lk.li + 1 > S.lv) S.lv = Math.min(LK_LV.length - 1, lk.li + 1);
    if (first) lk.isl.forEach(function (I) { garden.friends[I.id] = (garden.friends[I.id] || 0) + 1; });   /* every animal you made happy likes you a little more */
    s.love = clamp(s.love + 4); s.fun = clamp(s.fun + 8); if (typeof renderNeeds === "function") renderNeeds(); if (window.SudokuSave) window.SudokuSave();
    var last = lk.li >= LK_LV.length - 1;
    lkCard.innerHTML = '<div class="fi-c dz-intro"><p class="fi-h">Seefest!</p><p class="dz-route">' + "★".repeat(n) + "☆".repeat(3 - n) + '</p><p class="fi-s">Alle sind glücklich. ' + lk.trips + ' Fahrten (am besten ' + lk.D.par + ').' + (first ? '<br>Jedes Tier hat dich jetzt noch lieber.' : '') + '</p>' +
      '<div class="fi-row"><button type="button" class="fi-b2" data-a="again">Nochmal</button>' + (last ? '<button type="button" class="fi-b" data-a="close">Fertig</button>' : '<button type="button" class="fi-b" data-a="next">Nächster See</button>') + '</div></div>';
    lkCard.hidden = false; }
  lkCard.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b || !lk) return; e.stopPropagation(); var a = b.dataset.a; if (a === "close") lkClose(); else if (a === "next") lkStart(lk.li + 1); else lkStart(lk.li); });
  // ---- drawing ----
  function lkBoat(x, y, dir, t, rowing) { x = Math.round(x); y = Math.round(y);
    var ow = rowing ? Math.round(Math.sin(t / 110) * 3) : 0;
    lP(x - 13, y - 1 + ow, 5, 1, "#a87448"); lP(x - 15, y - 2 + ow, 3, 3, "#c8945a"); lP(x + 9, y - 1 - ow, 5, 1, "#a87448"); lP(x + 13, y - 2 - ow, 3, 3, "#c8945a");   /* the oars */
    lDisc(x, y, 9, 5, function (a, b, d) { return d > .8 ? LD : d > .55 ? "#c8945a" : b < 0 ? "#a06a3a" : "#8a5a32"; }); lP(x - 6, y, 13, 1, "#6a3e22");
    lDisc(x - 3, y - 1, 3.5, 3, function (a, b, d) { return d > .7 ? LD : a + b < -1 ? "#f7c47e" : "#e9a44c"; }); lP(x - 6, y - 4, 2, 2, LD); lP(x - 1, y - 4, 2, 2, LD); lP(x - 5, y - 3, 1, 1, "#f4a3b4"); lP(x - 1, y - 3, 1, 1, "#f4a3b4");
    lP(x - 4, y - 2, 1, 1, "#24160c"); lP(x - 2, y - 2, 1, 1, "#24160c");
    if (lk.cargo) lkIcon(lk.cargo, x + 1, y - 5); }
  function lkDraw(t) {
    lkRaf = 0; if (!lk || lkEl.hidden) return; lkRaf = requestAnimationFrame(lkDraw);
    var now = performance.now(), B = lk.boat;
    if (B.go) { var u = Math.min(1, (now - B.go.t0) / B.go.dur), e2 = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; B.x = B.go.x0 + (B.go.tx - B.go.x0) * e2; B.y = B.go.y0 + (B.go.ty - B.go.y0) * e2; if (Math.floor(now / 220) !== Math.floor((now - 16) / 220)) beep([[180 + Math.random() * 40, .02]]); if (u >= 1) { var k = B.go.k; B.go = null; lkArrive(k); } }
    // the lake
    for (var y = 0; y < 135; y++) for (var x = 0; x < 180; x += 2) { var v = Math.sin(x * .19 + y * .62 + t / 900) + Math.sin(x * .07 - y * .21 - t / 1400) * .7; lP(x, y, 2, 1, v > 1.3 ? "#9ad8f0" : v < -1.2 ? "#64b0d8" : "#7cc4e6"); }
    for (var g = 0; g < 180; g++) { lP(g, 0, 1, 3 + ((g * 7) % 3), "#7ab84e"); lP(g, 132 - ((g * 5) % 2), 1, 4, "#7ab84e"); }
    // the jetty and the raft
    var jx = LK_JETTY[0], jy = LK_JETTY[1]; lP(jx - 10, jy - 2, 20, 16, LD); for (var pl = 0; pl < 5; pl++) { lP(jx - 9, jy - 1 + pl * 3, 18, 2, "#c8945a"); lP(jx - 9, jy + 1 + pl * 3, 18, 1, "#8a5a32"); }
    var rx = jx + 22, ry = jy + 4; lP(rx - 9, ry - 6, 18, 12, LD); for (var lg = 0; lg < 4; lg++) { lP(rx - 8 + lg * 4, ry - 5, 3, 10, lg % 2 ? "#a06a3a" : "#b47a46"); }
    if (lk.raft) lkIcon(lk.raft, rx - 4, ry - 4); else { lP(rx - 2, ry - 1, 4, 1, "#7a4a28"); }
    // the islands, the animals, their wishes and what they have to give
    lk.isl.forEach(function (I) {
      lDisc(I.x, I.y + 7, 19, 9, function (a, b, d) { return d > .85 ? "#c8b488" : "#e8d8a8"; });
      lDisc(I.x, I.y + 5, 16, 7, function (a, b, d) { return d > .85 ? "#4e8a34" : (a * 3 + b * 5 + 99) % 7 ? "#7ab84e" : "#5a9a3a"; });
      lP(I.x + 11, I.y - 1, 3, 6, "#6a3e22"); lDisc(I.x + 12, I.y - 4, 5, 4, function (a, b, d) { return d > .8 ? "#2e6a2e" : a + b < -2 ? "#86cc62" : "#4e9a44"; });   /* a little bush */
      var hop = I.hop && now - I.hop < 900 ? -Math.round(Math.abs(Math.sin((now - I.hop) / 900 * Math.PI * 3)) * 4) : 0;
      if (lk.party && now - lk.party < 4000) hop = -Math.round(Math.abs(Math.sin((now - lk.party) / 300 + I.x)) * 4);
      var im = lkAni[I.id]; if (im && im.c) lkc.drawImage(im.c, Math.round(I.x - im.c.width / 2), Math.round(I.y - im.c.height + 4 + hop));
      if (!I.happy) { var bx = I.x > 130 ? I.x - 19 : I.x + 6, by = I.y - 36; lP(bx, by, 13, 12, LD); lP(bx + 1, by + 1, 11, 10, "#fff8ec"); lP(bx + 1, by + 12, 2, 1, LD); lP(bx, by + 13, 1, 1, LD); if (I.want) lkIcon(I.want, bx + 2, by + 2); else { lP(bx + 3, by + 4, 7, 6, "#e8465a"); lP(bx + 6, by + 4, 1, 6, "#ffe08a"); lP(bx + 3, by + 6, 7, 1, "#ffe08a"); lP(bx + 4, by + 2, 2, 2, "#ffe08a"); lP(bx + 7, by + 2, 2, 2, "#ffe08a"); } }
      else { var hx0 = I.x + 10, hy0 = I.y - 30; [[1,0,2],[4,0,2],[0,1,7],[0,2,7],[1,3,5],[2,4,3],[3,5,1]].forEach(function (r) { lP(hx0 + r[0] - 1, hy0 + r[1] - 1, r[2] + 2, 3, LD); }); [[1,0,2],[4,0,2],[0,1,7],[0,2,7],[1,3,5],[2,4,3],[3,5,1]].forEach(function (r) { lP(hx0 + r[0], hy0 + r[1], r[2], 1, "#e8465a"); }); lP(hx0 + 1, hy0 + 1, 1, 1, "#ffb0bc"); }
      if (I.has) { lP(I.x - 22, I.y - 2, 11, 9, LD); lP(I.x - 21, I.y - 1, 9, 7, "#d8a070"); lkIcon(I.has, I.x - 21, I.y - 6); lP(I.x - 21, I.y + 3, 9, 1, "#a8703e"); }   /* what it has, in its basket */
    });
    // the boat
    lkBoat(B.x, B.y, 0, t, !!B.go);
    if (B.go) for (var w = 1; w < 5; w++) lP(B.x - (B.go.tx - B.go.x0 > 0 ? 1 : -1) * (10 + w * 3), B.y + 2 + (w % 2), 2, 1, "#c8ecfa");
    // hearts rising
    lk.hearts = lk.hearts.filter(function (h) { var u2 = (now - h.t0) / 1200; if (u2 < 0) return true; if (u2 > 1) return false; var hx = Math.round(h.x), hy = Math.round(h.y - u2 * 14); lP(hx - 2, hy, 2, 1, "#e8465a"); lP(hx + 1, hy, 2, 1, "#e8465a"); lP(hx - 2, hy + 1, 5, 1, "#e8465a"); lP(hx - 1, hy + 2, 3, 1, "#e8465a"); lP(hx, hy + 3, 1, 1, "#e8465a"); return true; });
    if (lk.party && now - lk.party < 4000) for (var c = 0; c < 20; c++) lP((c * 37 + (now - lk.party) / 6) % 180, ((c * 23) + (now - lk.party) / (8 + c % 5)) % 135, 2, 2, ["#ff9ab8", "#ffe08a", "#7ae05a", "#9ad8f0"][c % 4]);
    // what the boat carries and how many trips so far
    lP(3, 118, 30, 14, LD); lP(4, 119, 28, 12, "#fff8ec"); if (typeof pcText === "function") { var tx2 = pcText(lkc, 8, 123, String(lk.trips), LD); lP(tx2 + 1, 126, 1, 2, LD); lP(tx2 + 2, 124, 1, 2, LD); lP(tx2 + 3, 123, 1, 1, LD); pcText(lkc, tx2 + 5, 123, String(lk.D.par), LD); } else { lkc.fillStyle = LD; lkc.font = "7px sans-serif"; lkc.textBaseline = "top"; lkc.fillText(lk.trips + "/" + lk.D.par, 7, 121); }
  }
  // the way in: from the pond, a boat trip next to skipping stones and swimming
  window.__lkAvailable = function () { return true; };
