  // ===================== little things to do around the house and in the café =====================
  // Living room: three records on the gramophone, winding the wall clock. Hall: trying on the straw hat and the scarf.
  // Bedroom: cuddling the teddy, blowing at the candle, a bedtime story. Bath: drawing on the misted mirror, washing paws at the tap.
  // Kitchen: sniffing the herb garland. Café: watering the plants, wiping a free table, stoking the fire, a stamp card for regulars.
  var IX_D = "#3a2414";
  function ixBtn(parent, x, y, w, h, label) { var b = document.createElement("button"); b.type = "button"; b.className = "ix-hit"; b.setAttribute("aria-label", label); place(b, x, y, w); b.style.height = gy(h); parent.appendChild(b); return b; }
  function ixAct(fn) { return function (e) { e.stopPropagation(); if (decor || s.asleep) return; if (busy && !interruptible()) return; if (busy) interrupt(); act("ix", fn); }; }
  function ixOver(parent, x, y, w, h, svg, cls) { var d = document.createElement("div"); d.className = "ix-over " + (cls || ""); place(d, x, y, w); d.style.height = gy(h); d.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" shape-rendering="crispEdges" style="display:block;width:100%;height:100%">' + svg + '</svg>'; parent.appendChild(d); return d; }
  /* fun: each of these little things lifts the fun bar, each one at most once in 10 minutes, so variety pays more than tapping the same thing */
  function ixFun(k, n) { s.ixFun = s.ixFun || {}; var now = Date.now(); if (now - (s.ixFun[k] || 0) < 600000) return; s.ixFun[k] = now; s.fun = clamp(s.fun + n); if (typeof renderNeeds === "function") renderNeeds(); if (window.SudokuSave) window.SudokuSave(); }
  function ixR(x, y, w, h, c) { return '<path fill="' + c + '" d="M' + x + ' ' + y + 'h' + w + 'v' + h + 'h-' + w + 'z"/>'; }

  // ---- living room: the gramophone has three records now, each with its own little dance ----
  if (typeof playGram === "function" && typeof wGram !== "undefined") {
    var IX_RECS = [
      { n: "Walzer", d: "sway", t: [[392, .3], [494, .15], [587, .15], [587, .3], [494, .3], [440, .3], [523, .15], [659, .15], [659, .3], [523, .3], [392, .3], [494, .15], [587, .15], [784, .45]] },
      { n: "Polka", d: "hop", t: [[523, .12], [659, .12], [784, .12], [659, .12], [523, .12], [392, .24], [440, .12], [523, .12], [659, .24], [523, .24], [587, .12], [698, .12], [784, .36]] },
      { n: "Schlaflied", d: "sleepy", t: [[330, .45], [392, .45], [440, .7], [392, .45], [330, .7], [294, .45], [330, .9], [262, .45], [294, .45], [330, 1]] }];
    var ixRec = 0;
    playGram = async function () {
      if (!home.placed.gram) return; var R = IX_RECS[ixRec % IX_RECS.length]; ixRec++;
      await walkTo(124, 116); H.dir = 1; backFrame(0); await wait(300);
      say(N() + " legt „" + R.n + "“ auf.");
      for (var k = 0; k < 4; k++) { backFrame(k % 2); beep([[180 + k * 20, .05]]); await wait(220); }
      front({ eyes: "happy", mouth: "smile" }); pulse("hop", 300); await wait(300);
      for (var i = 0; i < R.t.length; i++) {
        beep([R.t[i]]); if (i % 2 === 0) fx("note", 132 + rnd(-6, 8), 40 + rnd(-6, 2), "up", 1.1);
        if (R.d === "sway") front({ eyes: "happy", mouth: "smile", paws: i % 2 ? "side_l" : "side_r" });
        else if (R.d === "hop") { front({ eyes: "happy", mouth: i % 2 ? "grin" : "open", paws: "up" }); if (i % 2 === 0) pulse("hop", 240); }
        else { front({ eyes: i > R.t.length / 2 ? "half" : "happy", mouth: "smile", paws: "down" }); }
        await wait(R.t[i][1] * 1000 + 110);
      }
      if (R.d === "sleepy") { front({ eyes: "sleep", mouth: "yawn" }); await wait(900); }
      front({ eyes: "happy", mouth: "grin", paws: "up" }); pulse("hop", 300); ixFun("gram", 6); await wait(700); settle();
    };
  }
  // ---- living room: winding the plain wall clock (the cuckoo clock and the alarm clock keep their own tricks) ----
  async function ixWindClock() {
    await walkTo(L.clockCx, 118); H.dir = 1; say(N() + " zieht die Uhr auf.");
    for (var i = 0; i < 8; i++) { standFrame(i % 2); beep([[260 + (i % 2) * 70, .03]]); await wait(180); }
    slotAnim("clock", "wobble", 1000); front({ eyes: "happy", mouth: "grin", paws: "up" }); pulse("hop", 300);
    for (var k = 0; k < 4; k++) { beep([[1900, .02]]); await wait(320); beep([[1500, .02]]); await wait(320); }
    say("Tick, tack! Die Uhr läuft wieder."); ixFun("clock", 4); settle();
  }
  var _ix_tapF = tapFurniture;
  tapFurniture = function (cat) { var id = home.placed[cat];
    if (cat === "clock" && id && id !== "cuckoo" && id !== "alarm" && !s.asleep) { if (busy && !interruptible()) return; if (busy) interrupt(); act("ix", ixWindClock); return; }
    return _ix_tapF(cat); };

  // ---- the hall: trying on the straw hat or the scarf from the coat rack, a twirl, then back on the hook ----
  var ixWear = null;
  function ixStraw() { var o = ""; o += ixR(15, 2, 18, 1, IX_D) + ixR(14, 3, 1, 6, IX_D) + ixR(33, 3, 1, 6, IX_D) + ixR(15, 3, 18, 4, "#f2d48a") + ixR(16, 3, 5, 1, "#fff0c0") + ixR(15, 7, 18, 2, "#e8463c") + ixR(15, 7, 18, 1, "#ff7a6a");
    o += ixR(7, 9, 34, 1, IX_D) + ixR(6, 10, 1, 2, IX_D) + ixR(41, 10, 1, 2, IX_D) + ixR(7, 10, 34, 1, "#f2d48a") + ixR(7, 11, 34, 1, "#d8b060") + ixR(7, 12, 34, 1, IX_D);
    for (var x = 16; x < 33; x += 3) o += ixR(x, 4, 1, 1, "#d8b060"); for (var x2 = 9; x2 < 40; x2 += 4) o += ixR(x2, 10, 1, 1, "#d8b060"); return o; }
  var _ix_op = outfitPart;
  outfitPart = function (part) {
    if (ixWear === "hat") { if (part === "hat") return ixStraw(); if (part === "hat_back") return ""; }
    if (ixWear === "scarf" && (part === "scarf" || part === "scarf_back") && OUTFIT && OUTFIT[part]) { var c = scarfCol(); return OUTFIT[part].split("#0b0001").join(c[2]).split("#0b0002").join(c[3]); }
    return _ix_op(part); };
  function ixTry(which) { return async function () {
    await walkTo(-28, 119); H.dir = -1;
    for (var i = 0; i < 4; i++) { standFrame(i % 2); await wait(200); }
    ixWear = which; front({ eyes: "happy", mouth: "grin", paws: "up", blush: true }); pulse("bighop", 500); beep([[659, .05], [880, .06]]);
    say(which === "hat" ? "Mit Strohhut! Steht " + N() + " das?" : "Kuschelig, der Schal!");
    for (var k = 0; k < 4; k++) { H.dir = k % 2 ? 1 : -1; front({ eyes: k % 2 ? "look_r" : "look_l", mouth: "smile", paws: k % 2 ? "side_r" : "side_l" }); await wait(420); }
    fx("heart", H.x, headY() - 6, "up"); front({ eyes: "happy", mouth: "grin", paws: "up", blush: true }); pulse("hop", 300); await wait(1400);
    for (var j = 0; j < 4; j++) { standFrame(j % 2); await wait(200); }
    ixWear = null; ixFun(which, 5); front(mood()); say(which === "hat" ? "Der Hut hängt wieder am Haken." : "Der Schal hängt wieder an der Garderobe."); settle(); }; }
  if (typeof wLay !== "undefined") wLay.addEventListener("click", function (e) {
    var b = e.target.closest(".wide-hit"); if (!b || (b.dataset.w !== "hat" && b.dataset.w !== "coat")) return; e.stopPropagation();
    ixAct(ixTry(b.dataset.w === "hat" ? "hat" : "scarf"))(e); }, true);

  // ---- bedroom: the teddy, the candle, a bedtime story ----
  if (typeof bedEl !== "undefined" && typeof TEDDY !== "undefined") {
    ixBtn(bedEl, TEDDY.x, TEDDY.y, 16, 22, "Teddy").addEventListener("click", ixAct(async function () {
      await walkTo(TEDDY.x + 24, 119); H.dir = -1; for (var i = 0; i < 4; i++) { standFrame(i % 2); await wait(190); }
      teddyCarry = true; teddyShelf.hidden = true; front({ hold: "b_teddy", holdScale: 1, paws: "hold", eyes: "happy", mouth: "smile", blush: true }); pulse("hop", 300); say(N() + " kuschelt mit dem Teddy.");
      for (var k = 0; k < 5; k++) { await wait(380); fx("heart", H.x + rnd(-8, 8), headY() - 4, "up"); front({ eyes: k % 2 ? "happy" : "sleep", mouth: "smile" }); }
      await wait(500); for (var j = 0; j < 4; j++) { standFrame(j % 2); await wait(190); }
      teddyCarry = false; front({ hold: null }); teddyState(); ixFun("teddy", 6); settle(); }));
    var ixCandleSmoke = function () { var o = ""; [[2, 6], [3, 5], [2, 4], [1, 3], [2, 2], [3, 1], [2, 0]].forEach(function (q, i) { o += ixR(q[0], q[1], 1, 1, i < 3 ? "#9a9a9a" : "#c8c8c8"); }); return o; };
    ixBtn(bedEl, 108, 63, 13, 17, "Kerze").addEventListener("click", ixAct(async function () {
      await walkTo(114, 120); H.dir = 1; front({ eyes: "wide", mouth: "open" }); await wait(300);
      say("Pfff! " + N() + " pustet die Kerze an."); beep([[220, .15]]); var sm = ixOver(bedEl, 112, 58, 5, 8, ixCandleSmoke(), "ix-smoke"); pulse("hop", 300);
      await wait(1300); sm.remove(); front({ eyes: "happy", mouth: "grin" }); fx("spark", 115, 66, "sparkle", 1); beep([[1047, .04], [1319, .05]]);
      say("Und schwupp, sie flackert wieder."); ixFun("candle", 3); await wait(700); settle(); }));
    ixBtn(bedEl, 103, 80, 22, 15, "Gute-Nacht-Buch").addEventListener("click", ixAct(async function () {
      await walkTo(100, 120); H.dir = 1; for (var i = 0; i < 3; i++) { standFrame(i % 2); await wait(200); }
      bookColor = pick(BOOK_COLORS); front({ hold: "book", eyes: "happy", mouth: "smile", paws: "hold" }); pulse("hop", 300); say(N() + " liest eine Gute-Nacht-Geschichte."); await wait(600);
      front({ hold: "book_open", eyes: "down", mouth: "flat" }); await wait(1200);
      for (var p = 0; p < 4; p++) { await wait(1300); front({ hold: "book_flip" }); beep([[900, .02]]); await wait(200); front({ hold: "book_open", eyes: p > 1 ? "half" : "down" }); }
      front({ hold: "book_open", eyes: "sleep", mouth: "yawn" }); fx("zz", H.x + 8, headY() - 4, "up"); await wait(1100);
      front({ hold: null, eyes: "happy", mouth: "smile" }); say(daylight() === "day" ? "Schön war die Geschichte." : "Gähn, jetzt wird " + N() + " müde."); ixFun("book", 4); await wait(700); settle(); }));
  }

  // ---- bath: drawing a heart on the misted mirror, washing paws at the tap ----
  if (typeof bathEl !== "undefined") {
    ixBtn(bathEl, 95, 20, 19, 27, "Spiegel").addEventListener("click", ixAct(async function () {
      await walkTo(104, 120); H.dir = 1; for (var i = 0; i < 3; i++) { standFrame(i % 2); await wait(200); }
      front({ eyes: "happy", mouth: "open" }); say(N() + " haucht den Spiegel an."); beep([[200, .2]]);
      var fog = ""; for (var y = 0; y < 19; y++) for (var x = 0; x < 13; x++) { var d = ((x - 6) / 6.4) * ((x - 6) / 6.4) + ((y - 9) / 9.4) * ((y - 9) / 9.4); if (d < 1) fog += ixR(x, y, 1, 1, "rgba(255,255,255," + ((x + y) % 2 ? .62 : .5) + ")"); }
      var fogEl = ixOver(bathEl, 97, 24, 13, 19, fog, "ix-fog"); await wait(700);
      var heart = [[4, 6], [5, 5], [6, 6], [7, 5], [8, 6], [9, 7], [9, 8], [8, 9], [7, 10], [6, 11], [5, 10], [4, 9], [3, 8], [3, 7]], svg = fogEl.querySelector("svg");
      for (var k = 0; k < heart.length; k++) { standFrame(k % 2); svg.insertAdjacentHTML("beforeend", ixR(heart[k][0], heart[k][1], 1, 1, "#a8d4e8")); beep([[1400 + k * 30, .015]]); await wait(120); }
      front({ eyes: "happy", mouth: "grin", paws: "up", blush: true }); pulse("hop", 300); say("Ein Herz im Spiegel!"); await wait(1600);
      ixFun("mirror", 5); fogEl.classList.add("ix-fade"); await wait(900); fogEl.remove(); settle(); }));
    ixBtn(bathEl, 96, 58, 18, 18, "Wasserhahn").addEventListener("click", ixAct(async function () {
      await walkTo(104, 120); H.dir = 1; for (var i = 0; i < 2; i++) { standFrame(i % 2); await wait(200); }
      var w = ""; for (var y = 0; y < 8; y++) w += ixR(1, y, 1, 1, y % 2 ? "#8cc8ec" : "#c8ecfa"); var stream = ixOver(bathEl, 104, 66, 3, 8, w, "ix-stream"); beep([[600, .05]]);
      say(N() + " wäscht sich die Pfötchen.");
      for (var k = 0; k < 8; k++) { front({ paws: k % 2 ? "wash_l" : "wash_r", eyes: "happy", mouth: "smile" }); if (k % 2) fx("drop", H.x + rnd(-6, 6), headY() + 18, "fall", 0.6); else fx("bubble", H.x + rnd(-10, 10), headY() + 12, "up", 0.8); await wait(260); }
      stream.remove(); fx("spark", H.x, headY() + 10, "sparkle", 1); front({ paws: "up", eyes: "happy", mouth: "grin" }); say("Blitzsauber!"); ixFun("tap", 3); await wait(700); settle(); }));
  }

  // ---- kitchen: the herb garland under the ceiling ----
  if (typeof kitchenEl !== "undefined") {
    ixBtn(kitchenEl, 66, 0, 50, 17, "Kräuter").addEventListener("click", ixAct(async function () {
      await walkTo(90, 120); H.dir = 1; say(N() + " schnuppert an den Kräutern.");
      for (var i = 0; i < 8; i++) { standFrame(i % 2); await wait(170); }
      front({ eyes: "sleep", mouth: "open" }); await wait(350); pulse("shake", 400); beep([[880, .05], [330, .12]]); say("Hatschi!");
      for (var k = 0; k < 4; k++) fx("spark", 90 + rnd(-16, 16), rnd(8, 18), "fall", 1);
      await wait(600); front({ eyes: "happy", mouth: "grin", blush: true }); ixFun("herbs", 3); await wait(600); settle(); }));
  }

  // ---- café: watering the plants, wiping a free table, stoking the fire ----
  if (typeof cfTrack !== "undefined" && typeof TABLES !== "undefined") {
    var ixCfFx = function (x, y, col, n) { var svg = cfTrack.querySelector(".cf-svg"); if (!svg) return; var g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("class", "ix-cffx");
      for (var i = 0; i < (n || 8); i++) { var r = document.createElementNS("http://www.w3.org/2000/svg", "rect"); r.setAttribute("x", Math.round(x + (Math.random() - .5) * 16)); r.setAttribute("y", Math.round(y - Math.random() * 14)); r.setAttribute("width", 1); r.setAttribute("height", 1 + (i % 2)); r.setAttribute("fill", col); r.style.animationDelay = (i * 60) + "ms"; g.appendChild(r); }
      svg.appendChild(g); setTimeout(function () { g.remove(); }, 1400); };
    cfTrack.addEventListener("click", function (e) {
      if (e.target.closest(".cf-hit") || (typeof cfGameOn !== "undefined" && cfGameOn) || !cafeOn) return;
      var r = cfTrack.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * CF.w, y = (e.clientY - r.top) / r.height * CF.h;
      if (guests.some(function (q) { return q.state !== "gone" && Math.abs(q.x - x) < 16 && y > 54 && y < 135; })) return;
      if (Math.abs(x - CFH.x) < 15 && y > CFH.y - 36) return;
      var pl = (CF_PDEF[CF_THEME_NOW] || CF_PDEF.wood || []), hitP = -1; CF_PSLOT.forEach(function (p, i) { if (pl[i] !== null && Math.abs(x - p[0]) < 13 && y > p[1] - 36 && y < p[1] + 3) hitP = i; });
      if (hitP >= 0) { var P = CF_PSLOT[hitP]; say(N() + " gießt die Pflanze."); ixFun("cfplant", 3); cfHamJob(function () { return cfHamGo([P[0] + 14, 114]).then(function () { cfHamSet({ paws: "up", eyes: "happy", mouth: "smile" }); beep([[523, .04], [659, .05]]); ixCfFx(P[0], P[1] - 18, "#8cc8ec", 10); setTimeout(function () { ixCfFx(P[0], P[1] - 26, "#7ae05a", 6); cfHamSet({}); say("Die Pflanze reckt sich zufrieden."); }, 900); return new Promise(function (res) { setTimeout(res, 1200); }); }); }); return; }
      for (var ti = 0; ti < TABLES.length; ti++) { var T = TABLES[ti]; if (Math.abs(x - T.top[0]) < 14 && Math.abs(y - T.top[1]) < 10) {
        if (guests.some(function (q) { return q.table === ti && q.state !== "gone"; })) return;
        say(N() + " wischt den Tisch ab."); ixFun("cftable", 3); (function (T) { cfHamJob(function () { return cfHamGo([T.top[0] + 10, 114]).then(function () { var n = 0; return new Promise(function (res) { var iv = setInterval(function () { n++; cfHamSet({ paws: n % 2 ? "side_l" : "side_r", eyes: "happy", mouth: "smile" }); beep([[1200 + (n % 2) * 200, .02]]); if (n >= 6) { clearInterval(iv); ixCfFx(T.top[0], T.top[1] - 2, "#ffffff", 8); cfHamSet({}); say("Blitzblank!"); res(); } }, 220); }); }); }); })(T); return; } }
      if (x > 160 && x < 192 && y > 48 && y < 104) { say(N() + " legt Holz nach. Das Feuer prasselt."); ixFun("cffire", 4); cfHamJob(function () { return cfHamGo([176, 116]).then(function () { cfHamSet({ paws: "up", eyes: "happy", mouth: "grin" }); for (var k = 0; k < 3; k++) setTimeout(function () { ixCfFx(176, 84, "#ffb030", 8); beep([[200 + Math.random() * 80, .05]]); }, k * 260); return new Promise(function (res) { setTimeout(function () { cfHamSet({}); say("Wie gemütlich es jetzt ist."); res(); }, 1100); }); }); }); return; }
    });
    // ---- the stamp card: every visit after a meal is a stamp; the tenth brings a little present ----
    var _ix_gPay = gPay;
    gPay = function (g) { var r = _ix_gPay.apply(this, arguments); try { var C = cfL(); C.visits = C.visits || {}; var n = (C.visits[g.id] || 0) + 1; C.visits[g.id] = n;
      if (n % 10 === 0) { s.treats += 3; if (typeof renderNeeds === "function") renderNeeds(); setTimeout(function () { say(ALLANI[g.id].name + ": Stempelkarte voll! Als Dank gibt es 3 Leckerli."); beep([[659, .05], [784, .05], [1047, .08]]); }, 1200); }
      else if (n > 1) setTimeout(function () { say(ALLANI[g.id].name + " bekommt einen Stempel (" + (n % 10) + "/10)."); }, 1200);
      if (window.SudokuSave) window.SudokuSave(); } catch (er) { } return r; };
  }
  window.__ixFunSt = function (v) { if (v != null) { s.fun = v; s.food = v; } return { fun: Math.round(s.fun), food: Math.round(s.food), ixFun: s.ixFun }; };

  /* every mini game is fun for him: an overlay game that stayed open for at least 20 seconds lifts the fun bar when it closes (each game at most every 3 minutes) */
  (function () {
    var open = new Map(), last = {}, SKIP = /pc-pov|cf-bookv|cafe-pov/;
    function isGame(el) { return el.nodeType === 1 && /(^|\s)([a-z0-9]+-pov|cf-game)(\s|$)/.test(el.className || "") && !SKIP.test(el.className); }
    function key(el) { return String(el.className).replace(/\b(bee-pov|fi-pov|pixtext)\b/g, "").trim() || "game"; }
    function closed(el) {
      var t0 = open.get(el); open.delete(el); if (!t0 || Date.now() - t0 < 20000) return;
      var k = key(el), now = Date.now(); if (now - (last[k] || 0) < 180000) return; last[k] = now;
      s.fun = clamp(s.fun + 10); if (typeof renderNeeds === "function") renderNeeds(); if (window.SudokuSave) window.SudokuSave();
    }
    function check(el) { if (!isGame(el)) return; var vis = !el.hidden && el.isConnected; if (vis && !open.has(el)) open.set(el, Date.now()); else if (!vis && open.has(el)) closed(el); }
    var mo = new MutationObserver(function (list) {
      list.forEach(function (m) {
        if (m.type === "attributes") check(m.target);
        m.addedNodes && m.addedNodes.forEach(function (n) { if (n.nodeType === 1) check(n); });
        m.removedNodes && m.removedNodes.forEach(function (n) { if (n.nodeType === 1 && open.has(n)) closed(n); });
      });
    });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden"] });
    window.__gameFun = { open: function () { return Array.from(open.keys()).map(key); } };
  })();
