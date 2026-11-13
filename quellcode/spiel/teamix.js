  // ===================== café: the tea blending room (preview) =====================
  // eight tins on the shelf, up to three go into the pot; every blend has its own colour, water heat, steeping time and a funny name
  var TEA_ING = [
    { id: "minze", n: "Minze", c: "#7cb860", t: .42, s: .42, tin: "#a8d890", px: ["...gg...", "..gGGg..", ".gGGGGg.", ".gGgGGg.", "gGGgGGGg", ".gGgGGg.", "..gGGg..", "...bb..."] },
    { id: "kamille", n: "Kamille", c: "#f0d060", t: .5, s: .55, tin: "#f6e8a0", px: ["..w..w..", ".wwwwww.", "wwwyywww", ".wyyyyw.", ".wyyyyw.", "wwwyywww", ".wwwwww.", "..w..w.."] },
    { id: "apfel", n: "Apfel", c: "#e89a48", t: .75, s: .62, tin: "#f4b0a0", px: ["....bg..", "...bgg..", ".rrbrrr.", "rrRrrrrr", "rRrrrrrr", "rrrrrrrr", ".rrrrrr.", "..rrrr.."] },
    { id: "hagebutte", n: "Hagebutte", c: "#d0483a", t: .82, s: .7, tin: "#f0a0a0", px: ["...bb...", "..gbbg..", "..rrrr..", ".rRrrrr.", ".rRrrrr.", ".rrrrrr.", "..rrrr..", "...rr..."] },
    { id: "lavendel", n: "Lavendel", c: "#9a7ac8", t: .45, s: .38, tin: "#d0c0ec", px: ["...pp...", "..pPpp..", "...pp...", "..pPpp..", "...pp...", "..pPpp..", "...gg...", "...gg..."] },
    { id: "honig", n: "Honig", c: "#e8a828", t: .55, s: .5, tin: "#f6d890", px: ["..bbbb..", ".bbbbbb.", ".hhhhhh.", "hhHhhhhh", "hHhhhhhh", "hhhhhhhh", "hhhhhhhh", ".hhhhhh."] },
    { id: "zitrone", n: "Zitrone", c: "#f0dc60", t: .62, s: .45, tin: "#f8f0b0", px: ["......g.", "....yyg.", "..yyyyy.", ".yYyyyyy", "yYyyyyyy", ".yyyyyy.", "..yyyy..", "........"] },
    { id: "brombeer", n: "Brombeerblatt", c: "#7a3a5a", t: .7, s: .6, tin: "#d8b0c8", px: ["..g..g..", "...gg...", "..mmmm..", ".mMmMmm.", ".mmmmMm.", ".mMmmmm.", "..mMmm..", "...mm..."] }
  ];
  var TEA_PX = { g: "#5aa04e", G: "#86c870", b: "#6a4026", w: "#ffffff", y: "#f0c830", Y: "#fff0a0", r: "#d8463c", R: "#ff8a7a", p: "#8a62c0", P: "#c8a8f0", h: "#e8a020", H: "#fff0a0", m: "#4a1e3a", M: "#a05a88" };
  var TEA_ONE = { minze: "Pfefferminz-Pfötchen", kamille: "Kamillen-Kuschel", apfel: "Apfelbäckchen", hagebutte: "Hagebutten-Laterne", lavendel: "Lavendel-Traum", honig: "Bienchen-Gold", zitrone: "Zitronen-Zwicker", brombeer: "Brombeer-Busch" };
  var TEA_TWO = {
    "minze+kamille": "Schlummer-Brise", "minze+apfel": "Grashüpfer-Tanz", "minze+hagebutte": "Rotkehlchen-Pfiff", "minze+lavendel": "Mondschein-Minze", "minze+honig": "Brummbär-Brise", "minze+zitrone": "Kitzel-Blitz", "minze+brombeer": "Waldgeist-Hauch",
    "kamille+apfel": "Omas Gartenbank", "kamille+hagebutte": "Abendrot", "kamille+lavendel": "Wolkenkissen", "kamille+honig": "Gute-Nacht-Gold", "kamille+zitrone": "Sonnenkringel", "kamille+brombeer": "Igel-Nickerchen",
    "apfel+hagebutte": "Fuchsbau-Feuer", "apfel+lavendel": "Feenwiese", "apfel+honig": "Bratapfel-Glück", "apfel+zitrone": "Sauer-Sonnenschein", "apfel+brombeer": "Eichhörnchen-Schatz",
    "hagebutte+lavendel": "Zauberlaterne", "hagebutte+honig": "Bärchen-Glut", "hagebutte+zitrone": "Vitamin-Vulkan", "hagebutte+brombeer": "Dornröschen",
    "lavendel+honig": "Bienchen-Traum", "lavendel+zitrone": "Morgentau", "lavendel+brombeer": "Eulen-Mitternacht", "honig+zitrone": "Sonnenhonig", "honig+brombeer": "Dachs-Dessert", "zitrone+brombeer": "Beeren-Blitz"
  };
  var TEA_PRE = { minze: "Frostfeder", kamille: "Wolken", apfel: "Bäckchen", hagebutte: "Laternen", lavendel: "Traum", honig: "Brumm", zitrone: "Kitzel", brombeer: "Wichtel" };
  var TEA_NOUN = ["Zauber", "Wirbel", "Traum", "Tanz", "Glück", "Funke", "Wunder", "Flüstern", "Schatz", "Märchen", "Wiese", "Sturm", "Nebel", "Polka", "Glitzer", "Geheimnis", "Kobold", "Schimmer", "Reigen", "Seufzer", "Brise", "Hüpfer", "Kuschel", "Gruß", "Lied", "Leuchten", "Abenteuer", "Mondtanz"];
  var TEA_PAIRS = []; (function () { for (var i = 0; i < 8; i++) for (var j = i + 1; j < 8; j++) TEA_PAIRS.push(TEA_ING[i].id + "+" + TEA_ING[j].id); })();
  var TEA_TOTAL = 8 + 28 + 56 + 8 + 8 + 56;   // plain blends, plus doubled and tripled ingredients
  var TEA_ADJ = { minze: "minzig", kamille: "kamillig", apfel: "apfelig", hagebutte: "hagebuttig", lavendel: "lavendelig", honig: "honigsüß", zitrone: "zitronig", brombeer: "brombeerig" };
  function teaIdx(id) { for (var i = 0; i < TEA_ING.length; i++) if (TEA_ING[i].id === id) return i; return -1; }
  function teaKey(ids) { return ids.slice().sort(function (a, b) { return teaIdx(a) - teaIdx(b); }).join("+"); }
  function teaName(ids) {
    var k = teaKey(ids).split("+"), uniq = k.filter(function (v, i) { return k.indexOf(v) === i; }), base, extra = "";
    if (uniq.length === 1) base = TEA_ONE[uniq[0]];
    else if (uniq.length === 2) base = TEA_TWO[uniq.join("+")];
    else base = TEA_PRE[uniq[0]] + "-" + TEA_NOUN[TEA_PAIRS.indexOf(uniq[1] + "+" + uniq[2])];
    uniq.forEach(function (id) { var n = k.filter(function (v) { return v === id; }).length; if (n === 2) extra = ", extra " + TEA_ADJ[id]; if (n === 3) extra = ", mega " + TEA_ADJ[id]; });
    return base + extra;
  }
  function teaList(ids) {
    var k = teaKey(ids).split("+"), uniq = k.filter(function (v, i) { return k.indexOf(v) === i; });
    return uniq.map(function (id) { var n = k.filter(function (v) { return v === id; }).length; return TEA_ING[teaIdx(id)].n + (n > 1 ? " ×" + n : ""); });
  }
  function hex(c) { var v = parseInt(c.slice(1), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; }
  function rgb(a) { return "#" + a.map(function (x) { return ("0" + Math.round(Math.max(0, Math.min(255, x))).toString(16)).slice(-2); }).join(""); }
  // blends keep their colour lively: average, then push away from grey so no mix turns muddy
  function mixCol(cols) {
    var o = [0, 0, 0]; cols.forEach(function (c) { var h = hex(c); for (var i = 0; i < 3; i++) o[i] += h[i] / cols.length; });
    if (cols.length < 2) return rgb(o);
    var g = (o[0] + o[1] + o[2]) / 3; return rgb(o.map(function (x) { return g + (x - g) * 1.4; }));
  }
  function lerpC(a, b, k) { var A_ = hex(a), B = hex(b); return rgb(A_.map(function (x, i) { return x + (B[i] - x) * k; })); }
  function teaBlend(ids) {
    var ing = ids.map(function (id) { return TEA_ING[teaIdx(id)]; }), n = ing.length;
    var t = ing.reduce(function (a, b) { return a + b.t; }, 0) / n, s = ing.reduce(function (a, b) { return a + b.s; }, 0) / n;
    return { key: teaKey(ids), name: teaName(ids), col: mixCol(ing.map(function (x) { return x.c; })), heat: [t - .1, t + .1], steep: [s - .09, s + .09], ing: ing };
  }
  function teaBook() { var C_ = cfL(); C_.book = C_.book || {}; return C_.book; }
  function teaIcon(c, ing, x, y, sc) {
    sc = sc || 1;
    ing.px.forEach(function (row, yy) { for (var xx = 0; xx < 8; xx++) { var ch = row[xx]; if (ch === ".") continue; c.fillStyle = TEA_PX[ch]; c.fillRect(Math.round(x + xx * sc), Math.round(y + yy * sc), sc, sc); } });
  }
  // the book: every blend found so far, with its colour, ingredients and best stars
  function teaBookEl(host) { return openTeaBook(host); }
  function openTeaBook(host, kind, tabs) {
    kind = kind || "tea";
    var B, keys, newest;
    function load() { B = kind === "coffee" ? cofBook() : kind === "cake" ? ckBook() : teaBook(); keys = Object.keys(B).sort(function (a, b) { return (B[a].t || 0) - (B[b].t || 0); }); newest = keys[keys.length - 1]; }
    load();
    var el = document.createElement("div"); el.className = "bee-pov cf-game cf-bookv";
    el.innerHTML = '<canvas width="180" height="135"></canvas><div class="cf-btext"></div><button type="button" class="bp-x" aria-label="Buch schließen">×</button>';
    host.appendChild(el);
    ["click", "pointerdown"].forEach(function (t) { el.addEventListener(t, function (e) { e.stopPropagation(); }); });
    var cv = el.querySelector("canvas"), c = cv.getContext("2d"), tx = el.querySelector(".cf-btext"), page = 0, flip = null, raf = 0, gone = false;
    c.imageSmoothingEnabled = false;
    // slots: the left page starts with the title, so it holds two teas; every other page holds three
    var SLOTS = [[14, 42], [14, 80], [96, 18], [96, 66]], SLOTS2 = [[14, 18], [14, 66], [96, 18], [96, 66]];
    function pages() { return Math.max(1, Math.ceil(keys.length / 4)); }
    function slotsOf(pg) { if (pg === 0) return SLOTS.map(function (sl, i) { return { sl: sl, k: keys[i] }; }); var off = pg * 4; return SLOTS2.map(function (sl, i) { return { sl: sl, k: keys[off + i] }; }); }
    function sp(k, x, y) { var im = TIMG[k]; if (im && im.complete) c.drawImage(im, Math.round(x), Math.round(y)); }
    function cup(x, y, col, t) {
      R(c, x + 1, y + 3, 13, 12, "#3a2414"); R(c, x + 2, y + 4, 11, 10, "#e8f4f8"); R(c, x + 2, y + 6, 11, 8, col); R(c, x + 2, y + 6, 11, 1, lerpC(col, "#ffffff", .4)); R(c, x + 3, y + 5, 1, 8, "#ffffff");
      R(c, x + 14, y + 6, 3, 1, "#3a2414"); R(c, x + 16, y + 6, 1, 5, "#3a2414"); R(c, x + 14, y + 10, 3, 1, "#3a2414"); R(c, x, y + 15, 15, 1, "#3a2414"); R(c, x + 1, y + 14, 13, 1, "#a8c8d4");
      var on = Math.floor(t / 500) % 2; R(c, x + 5 + on, y, 1, 2, "rgba(58,36,20,.35)"); R(c, x + 9 - on, y - 1, 1, 2, "rgba(58,36,20,.35)");
    }
    function star(x, y, on) { var col = on ? "#f6c84a" : "#d8ccb4"; R(c, x + 2, y, 1, 1, col); R(c, x, y + 1, 5, 2, col); R(c, x + 1, y + 3, 1, 1, col); R(c, x + 3, y + 3, 1, 1, col); if (on) R(c, x + 2, y + 1, 1, 1, "#fff0a0"); }
    function render(t) {
      sp("book_open", 0, 0);
      var list = slotsOf(page), html = "";
      if (page === 0) {
        html += '<b class="cf-bt" style="left:' + (16 / 1.8) + '%;top:' + (14 / 1.35) + '%">' + ({ coffee: "Kaffeebuch", cake: "Kuchenbuch" }[kind] || "Teebuch") + '</b><span class="cf-bc" style="left:' + (16 / 1.8) + '%;top:' + (25 / 1.35) + '%">' + keys.length + ' von ' + ({ coffee: COF_TOTAL, cake: CK_TOTAL }[kind] || TEA_TOTAL) + ' Sorten</span>';
        sp("ic_minze", 70, 118); sp("ic_kamille", 150, 116);
      }
      if (!keys.length) html += '<span class="cf-bn" style="left:' + (16 / 1.8) + '%;top:' + (50 / 1.35) + '%;width:' + (70 / 1.8) + '%">' + (kind === "cake" ? "Noch leer. Back deinen ersten Kuchen!" : kind === "coffee" ? "Noch leer. Mach deinen ersten Kaffee!" : "Noch leer. Misch deinen ersten Tee!") + '</span>';
      list.forEach(function (o, i) {
        if (!o.k) return; var e = B[o.k], x = o.sl[0], y = o.sl[1], ids = o.k.split("|")[0].split("+");
        if (kind === "cake") { sp(ckIcon(o.k, false), x + 1, y + 4); ids.forEach(function (id, j) { sp(BK_ING[id].top, x + 19 + j * 13, y + 2 + (j % 2)); }); }
        else { cup(x, y + 1, e.c, t + i * 300);
        ids.forEach(function (id, j) { sp((kind === "coffee" ? "ib_" : "ic_") + id, x + 19 + j * 13, y + (j % 2)); }); }
        if (kind === "coffee" && e.art) { R(c, x + 6, y + 6, 4, 2, "#fff8ec"); }
        for (var q = 0; q < 3; q++) star(x + 62, y + 1 + q * 5, q < e.s);
        if (o.k === newest) {   // a little red "NEU" tag
          R(c, x + 50, y - 5, 19, 9, "#3a2414"); R(c, x + 51, y - 4, 17, 7, "#e8554a"); R(c, x + 51, y - 4, 17, 1, "#f6827a");
          ["1001", "1101", "1011", "1001", "1001"].forEach(function (row, ry) { for (var rx = 0; rx < 4; rx++) if (row[rx] === "1") R(c, x + 52 + rx, y - 3 + ry, 1, 1, "#fff8ec"); });
          ["111", "100", "110", "100", "111"].forEach(function (row, ry) { for (var rx = 0; rx < 3; rx++) if (row[rx] === "1") R(c, x + 57 + rx, y - 3 + ry, 1, 1, "#fff8ec"); });
          ["1001", "1001", "1001", "1001", "0110"].forEach(function (row, ry) { for (var rx = 0; rx < 4; rx++) if (row[rx] === "1") R(c, x + 61 + rx, y - 3 + ry, 1, 1, "#fff8ec"); });
        }
        // a tiny doodle beside some entries
        if ((i + page) % 3 === 1) { R(c, x + 70, y + 26, 2, 2, "#e8706a"); R(c, x + 72, y + 26, 2, 2, "#e8706a"); R(c, x + 70, y + 28, 4, 1, "#e8706a"); R(c, x + 71, y + 29, 2, 1, "#e8706a"); }
        html += '<span class="cf-bn" style="left:' + (x / 1.8) + '%;top:' + ((y + 18) / 1.35) + '%;width:' + (72 / 1.8) + '%">' + e.n + '</span>';
      });
      var n = pages();
      if (page < n - 1) { var b = Math.floor(t / 400) % 2; R(c, 160 - b, 114, 6, 7, "#3a2414"); R(c, 161 - b, 115, 4, 5, "#f6c84a"); R(c, 166 - b, 116, 2, 3, "#3a2414"); }
      if (page > 0) { var b2 = Math.floor(t / 400) % 2; R(c, 14 + b2, 114, 6, 7, "#3a2414"); R(c, 15 + b2, 115, 4, 5, "#f6c84a"); R(c, 12 + b2, 116, 2, 3, "#3a2414"); }
      if (n > 1) html += '<span class="cf-bp" style="left:' + (82 / 1.8) + '%;top:' + (113 / 1.35) + '%">' + (page + 1) + '/' + n + '</span>';
      if (flip) {
        var k = Math.min(1, (t - flip.t0) / 380), w = Math.round(80 * Math.sin(k * Math.PI));
        var x0 = flip.dir > 0 ? 170 - Math.round(160 * k) : 10 + Math.round(160 * k);
        R(c, x0 - w / 2, 11, w, 115, "#fff8ec"); R(c, x0 - w / 2, 11, 1, 115, "#3a2414"); R(c, x0 + w / 2, 11, 1, 115, "#e8dcc4");
        if (k >= 1) flip = null; else html = "";
      }
      if (tabs) {
        [["tea", 12, "#86c870", "#5aa04e"], ["coffee", 70, "#c8925a", "#8a5a30"], ["cake", 128, "#f6a8b8", "#e8809a"]].forEach(function (tb) {
          var on = tb[0] === kind, y0 = on ? 0 : 3; R(c, tb[1], y0, 40, 12 - y0, "#3a2414"); R(c, tb[1] + 1, y0 + 1, 38, 10 - y0, on ? tb[2] : tb[3]); R(c, tb[1] + 1, y0 + 1, 38, 1, "rgba(255,255,255,.35)");
          html += '<span class="cf-btab" style="left:' + ((tb[1] + 20) / 1.8) + '%;top:' + ((y0 + 1.5) / 1.35) + '%">' + ({ tea: "Tee", coffee: "Kaffee", cake: "Kuchen" }[tb[0]]) + '</span>';
        });
      }
      if (tx._h !== html) { tx.innerHTML = html; tx._h = html; }
      if (!gone) raf = requestAnimationFrame(render);
    }
    cv.addEventListener("pointerdown", function (e) {
      var b = cv.getBoundingClientRect(), x = (e.clientX - b.left) / b.width * 180, y = (e.clientY - b.top) / b.height * 135;
      if (flip) return;
      if (tabs && y < 13) { var ORD = ["tea", "coffee", "cake"], nk = x < 62 ? "tea" : x < 120 ? "coffee" : "cake"; if (nk !== kind) { var dir = ORD.indexOf(nk) > ORD.indexOf(kind) ? 1 : -1; kind = nk; load(); page = 0; flip = { t0: performance.now(), dir: dir }; beep([[700, .03], [900, .04]]); } return; }
      if (x > 120 && page < pages() - 1) { page++; flip = { t0: performance.now(), dir: 1 }; beep([[700, .03], [900, .04]]); }
      else if (x < 60 && page > 0) { page--; flip = { t0: performance.now(), dir: -1 }; beep([[900, .03], [700, .04]]); }
    });
    el.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); gone = true; cancelAnimationFrame(raf); el.remove(); });
    beep([[440, .04], [523, .05], [659, .06]]); raf = requestAnimationFrame(render);
    return el;
  }
  window.__teaBook = openTeaBook;
  var TEA_ADD = [
    { id: "honig", n: "Honig", tint: "#e8a828", k: .1 }, { id: "zitrone", n: "Zitrone", tint: "#f6e890", k: .12 },
    { id: "milch", n: "Milch", tint: "#fbf2e2", k: .38 }, { id: "zucker", n: "Zucker", tint: null, k: 0 }
  ];
  function teaAddName(xs) { if (!xs.length) return ""; var n = xs.map(function (id) { return TEA_ADD.filter(function (a) { return a.id === id; })[0].n; }); return " mit " + n.join(" und "); }
  var TEA_ART = /*TEAART*/, TIMG = {};
  Object.keys(TEA_ART).forEach(function (k) { if (typeof TEA_ART[k] !== "string") return; var im = new Image(); im.src = TEA_ART[k]; TIMG[k] = im; });
  // the wall behind is the café's own wall, and the window is the round one behind the counter, with today's sky in it
  var wallImg = null, wallKey = "";
  function cafeWall() {
    var se = season(), wt = weather.type, sk = document.getElementById("sky").className, night = /sky-night/.test(sk), eve = /sky-eve/.test(sk);
    var key = se + wt + night + eve + (typeof CF_THEME_NOW === "string" ? CF_THEME_NOW : ""); if (key === wallKey && wallImg) return wallImg; wallKey = key;
    var col = night ? "#1e2a54" : eve ? "#f4b88a" : wt === "storm" ? "#46506a" : (wt === "rain" || wt === "snow") ? "#a8b8c8" : wt === "clouds" ? "#bcd0de" : "#a8dcf6";
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="135" viewBox="0 0 180 135" shape-rendering="crispEdges">' +
      '<svg x="0" y="0" width="180" height="135" viewBox="180 0 180 135">' + CF.bg + '</svg>' +
      '</svg>';
    var im = new Image(); im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); wallImg = im; return im;
  }
  // ---- the big window in the close-ups: only a part of it is in the picture, the garden is outside, the weather moves
  var WIN = { cx: 166, cy: 26, r: 44 }, winImgs = {};
  function drawCafeWindow(c, t) {
    var se = season(), wt = weather.type, sk = document.getElementById("sky").className, night = /sky-night/.test(sk), eve = /sky-eve/.test(sk);
    var cx = WIN.cx, cy = WIN.cy, r = WIN.r;
    c.save(); c.beginPath(); c.arc(cx, cy, r, 0, 2 * Math.PI); c.clip();
    c.fillStyle = night ? "#1e2a54" : eve ? "#f4b88a" : wt === "storm" ? "#5a647e" : (wt === "rain" || wt === "snow") ? "#a8b8c8" : wt === "clouds" ? "#bcd0de" : "#a8dcf6"; c.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    if (night) for (var i = 0; i < 9; i++) { if ((Math.floor(t / 700) + i) % 4) R(c, cx - 36 + (i * 17) % 44, cy - 30 + (i * 11) % 18, 1, 1, "#fff6c8"); }
    if (night) { disc(c, cx - 14, cy - 22, 4, "#fff6c8"); disc(c, cx - 12, cy - 23, 3.4, "#1e2a54"); }
    if (wt === "sun" && !night) { disc(c, cx - 30, cy - 26, 5, "#fff0a0"); disc(c, cx - 30, cy - 26, 3.6, "#ffe060"); }
    if (wt === "rainbow" && !night) ["#e8554a", "#f6a030", "#f6d84a", "#7ac860", "#5aa0e8"].forEach(function (col, k) { c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); c.arc(cx - 8, cy + 14, 30 - k, Math.PI, 1.75 * Math.PI); c.stroke(); });
    var im = winImgs[se] || (winImgs[se] = (function () { var x = new Image(); x.src = WBG["bg_" + se]; return x; })());
    if (im.complete && im.naturalWidth) c.drawImage(im, 26, -34);
    // clouds drifting by
    if (wt === "clouds" || wt === "rain" || wt === "storm" || wt === "snow") for (var k = 0; k < 3; k++) {
      var x0 = cx - 60 + ((t / (90 + k * 30) + k * 40) % 110), y0 = cy - 34 + k * 7, col = wt === "storm" ? "#7a8296" : "#eef2f6";
      disc(c, x0, y0, 5, col); disc(c, x0 + 6, y0 - 2, 6, col); disc(c, x0 + 13, y0, 5, col); R(c, x0 - 4, y0 + 1, 22, 4, col);
    }
    if (night) { c.fillStyle = "rgba(14,20,50,.2)"; c.fillRect(cx - r, cy - r, 2 * r, 2 * r); }
    else if (eve) { c.fillStyle = "rgba(160,74,58,.18)"; c.fillRect(cx - r, cy - r, 2 * r, 2 * r); }
    if (wt === "rain" || wt === "storm") for (var q = 0; q < 40; q++) { var rx = cx - r + (q * 13) % (2 * r), ry = (t / (wt === "storm" ? 2.2 : 3.2) + q * 23) % (2 * r) + cy - r; R(c, rx - (ry - cy) * .15, ry, 1, 3, "rgba(216,228,242,.85)"); }
    if (wt === "snow") for (var q2 = 0; q2 < 36; q2++) { var sx = cx - r + (q2 * 13) % (2 * r) + Math.sin(t / 700 + q2) * 2, sy = (t / 26 + q2 * 19) % (2 * r) + cy - r; R(c, sx, sy, q2 % 4 ? 1 : 2, q2 % 4 ? 1 : 2, "#ffffff"); }
    if (wt === "storm" && (t % 6000) < 140) { c.fillStyle = "rgba(255,255,240,.7)"; c.fillRect(cx - r, cy - r, 2 * r, 2 * r); }
    if (wt === "rain" || wt === "storm") [[cx - 20, cy + 6], [cx - 6, cy - 12], [cx - 28, cy - 8], [cx - 12, cy + 18]].forEach(function (d) { R(c, d[0], d[1], 1, 2, "rgba(255,255,255,.7)"); R(c, d[0], d[1] + 2, 1, 1, "rgba(150,180,210,.8)"); });
    c.restore();
    // the frame: a thick wooden ring with a cross, and a sill
    if (typeof CF_THEME_NOW === "string" && CF_THEME_NOW === "firstclass") {
      // a brass porthole ring with rivets, a marble sill
      c.save(); c.lineWidth = 1;
      for (var wb = 0; wb < 8; wb++) { c.strokeStyle = wb === 0 || wb === 7 ? "#3a2414" : wb < 3 ? "#f6e08a" : wb < 5 ? "#d8b050" : "#b08a30"; c.beginPath(); c.arc(cx, cy, r + wb + .5, 0, 2 * Math.PI); c.stroke(); }
      c.restore();
      for (var rv = 0; rv < 16; rv++) { var ra = rv / 16 * Math.PI * 2; R(c, Math.round(cx + Math.cos(ra) * (r + 4)), Math.round(cy + Math.sin(ra) * (r + 4)), 1, 1, "#8a6420"); }
      R(c, cx - 26, cy - 30, 3, 2, "rgba(255,255,255,.6)"); R(c, cx - 28, cy - 27, 2, 3, "rgba(255,255,255,.5)");
      return;
    }
    c.save(); c.lineWidth = 1;
    for (var w = 0; w < 6; w++) { c.strokeStyle = w === 0 || w === 5 ? "#3a2414" : w < 3 ? "#a8744a" : "#6e4428"; c.beginPath(); c.arc(cx, cy, r + w + .5, 0, 2 * Math.PI); c.stroke(); }
    c.restore();
    R(c, cx - 2, cy - r, 4, 2 * r, "#6e4428"); R(c, cx - 2, cy - r, 1, 2 * r, "#a8744a"); R(c, cx - r, cy - 2, 2 * r, 4, "#6e4428"); R(c, cx - r, cy - 2, 2 * r, 1, "#a8744a");
    R(c, cx - r - 10, cy + r + 4, 2 * r + 20, 6, "#3a2414"); R(c, cx - r - 9, cy + r + 5, 2 * r + 18, 2, "#c8905a"); R(c, cx - r - 9, cy + r + 7, 2 * r + 18, 2, "#8a5a30");
  }
  // ---- festival decoration in the close-ups: the same decorations, drawn big as if seen up close, and alive
  var FZ = /*FESTZOOM*/;
  Object.keys(FZ).forEach(function (k) { if (typeof FZ[k] !== "string") return; var im = new Image(); im.src = FZ[k]; TIMG[k] = im; });
  function festSprite(k, x, y, flip) { if (!A[k] || !SZ[k]) return ""; return '<g transform="translate(' + (flip ? x + SZ[k][0] : x) + ' ' + y + ')' + (flip ? ' scale(-1 1)' : '') + '">' + A[k] + '</g>'; }
  function zs(c, k, x, y) { var im = TIMG[k]; if (im && im.complete) c.drawImage(im, Math.round(x), Math.round(y)); }
  function flameAt(c, x, y, t, k) {
    var f = Math.floor(t / 110 + k) % 3, h = 5 + f;
    R(c, x - 1, y - h, 3, h, "#ff9a30"); R(c, x, y - h - 1, 1, 2, "#ff9a30"); R(c, x, y - h + 2, 1, h - 3, "#ffe060"); R(c, x - 1, y - 1, 3, 1, "#ffe060");
    c.fillStyle = "rgba(255,220,120,.12)"; c.fillRect(x - 5, y - h - 4, 11, h + 6);
  }
  function drawFest(c, where, t) {
    var f = typeof festival === "function" ? festival() : ""; if (!f) return;
    t = t || performance.now();
    var night = typeof daylight === "function" && daylight() !== "day", win = where !== "shelf", sx = 126, sy = 74;   // the window sill
    if (f === "herbst") {
      zs(c, "z_web", 0, 0); zs(c, "z_hbunt", 0, 0);
      var bx = 60 + Math.sin(t / 1400) * 30, by = 26 + Math.sin(t / 500) * 4; zs(c, "z_bat" + (Math.floor(t / 160) % 2), bx, by);
      if (win) {
        zs(c, night ? "z_jack1" : "z_jack0", sx, sy - 40); zs(c, "z_candle", sx + 46, sy - 32); flameAt(c, sx + 53, sy - 30, t, 0);
        if (night && Math.floor(t / 180) % 5) { c.fillStyle = "rgba(255,200,80,.12)"; c.fillRect(sx + 6, sy - 30, 32, 22); }
      }
    } else if (f === "advent" || f === "weihnachten") {
      zs(c, "z_garland", 0, 0);
      if (win) {
        zs(c, "z_star", 148, 8 + Math.round(Math.sin(t / 900))); 
        var wk = f === "advent" ? (typeof adventWeek === "function" ? adventWeek() : 1) : 4;
        zs(c, "z_wreath" + wk, sx - 4, sy - 44); FZ.z_wicks.slice(0, wk).forEach(function (w, i) { flameAt(c, sx - 4 + w[0], sy - 44 + w[1], t, i); });
        if (f === "weihnachten") zs(c, "z_mistle", 64, 12);
      }
    } else if (f === "silvester") {
      zs(c, "z_pbunt", 0, 0);
      if (win) [0, 1, 2].forEach(function (i) { zs(c, "z_balloon" + i, sx + 2 + i * 14, sy - 50 + Math.round(Math.sin(t / 700 + i * 1.7) * 2)); });
    } else if (f === "ostern") {
      zs(c, "z_ebunt", 0, 0);
      if (win) [0, 1, 2, 3].forEach(function (i) { zs(c, "z_egg" + i, sx + 2 + i * 13, sy - 19 + (i % 2)); });
    }
  }
  teaGame = function () {
    var G_ = cfGameEl("Zutaten in den Mörser"), c = G_.c, phase = "mix", pick = [], bl = null, raf = 0, last = performance.now(), shake = -1;
    // fire and kettle
    var tilt = 0, tiltT = 0, pourHold = null, sPour = 0, pourIdle = 0, spill = 0, splash = [], fire = 0, lit = false, water = 0, stage = 0, boilT = 0, boiled = false, match = null, fan = null, ketDX = 0, ketDrag = null, mic = null, whistle = null, sHeat = 0, pourT = 0;
    // steeping
    var GW = 14, GH = 9, conc = [], bag = { x: 80, y: 34, held: false, dunked: false, vx: 0, vy: 0 }, sTime = 0, sEven = 0;
    for (var ci = 0; ci < GW * GH; ci++) conc.push(0);
    // extras
    var adds = [], drag = null, stars = 0, isNew = false, finalCol = null;
    var TIN = TEA_ING.map(function (g, i) { return { x: 34 + (i % 4) * 36, y: i < 4 ? 19 : 49, w: 28, h: 29 }; });
    var POT = { x: 64, y: 88, w: 56, h: 42 }, KET = { x: 126, y: 86, w: 50, h: 44 }, BOOK = { x: 2, y: 94, w: 42, h: 38 }, flies = [];
    var MBOX = { x: 134, y: 103, w: 42, h: 30 }, LOGS = { x: 62, y: 96, w: 56, h: 20 }, KETTLE = { x: 60, y: 40, w: 70, h: 56 };
    var ADDPOS = { honig: { x: 2, y: 0 }, zitrone: { x: 2, y: 33 }, milch: { x: 2, y: 62 }, zucker: { x: 2, y: 97 } };   // stacked down the left edge, top to bottom
    function inR(p, r) { return p[0] >= r.x && p[0] <= r.x + r.w && p[1] >= r.y && p[1] <= r.y + r.h; }
    function pt(e) { var b = G_.cv.getBoundingClientRect(); return [(e.clientX - b.left) / b.width * 180, (e.clientY - b.top) / b.height * 135]; }
    function teaCol(k) { var m = (bl.steep[0] + bl.steep[1]) / 2; k = Math.max(0, Math.min(1, k)); return k < m ? lerpC("#bfe0f0", bl.col, k / m) : lerpC(bl.col, lerpC(bl.col, "#2a1408", .7), (k - m) / (1 - m)); }
    function spr(k, x, y) { var im = TIMG[k]; if (im && im.complete) c.drawImage(im, Math.round(x), Math.round(y)); }
    function shadow(x, y, w) { c.fillStyle = "rgba(58,36,20,.22)"; c.fillRect(Math.round(x), Math.round(y), w, 2); c.fillRect(Math.round(x) + 2, Math.round(y) + 2, w - 4, 1); }
    // ---------- the shelf (choose the blend) ----------
    function wall() { if (cfHome) { cfHomeShelf(c, [48, 78]); return; } spr("bg_shelf", 0, 0); drawFest(c, "shelf", performance.now()); }
    function tin(i, t) {
      var r = TIN[i], g = TEA_ING[i], used = pick.filter(function (v) { return v === g.id; }).length, bob = shake === i ? -Math.abs(Math.round(Math.sin(t / 40) * 2)) : 0;
      spr("tin_" + g.id, r.x, r.y + bob);
      for (var u = 0; u < used; u++) { var bx = r.x + r.w - 7 - u * 8; R(c, bx, r.y - 3, 8, 8, "#3a2414"); R(c, bx + 1, r.y - 2, 6, 6, "#f6c84a"); R(c, bx + 1, r.y - 2, 6, 1, "#fff0a0"); R(c, bx + 2, r.y + 1, 1, 1, "#3a2414"); R(c, bx + 3, r.y + 2, 1, 1, "#3a2414"); R(c, bx + 4, r.y, 1, 2, "#3a2414"); }
    }
    function pot(t) {
      shadow(POT.x + 8, POT.y + 39, 42); spr("mortar_b", POT.x, POT.y);
      pick.forEach(function (id, k) { if (flies.some(function (f) { return f.k === k; })) return; spr("ic_" + id, POT.x + 9 + k * 12, POT.y + 2 - (k % 2) * 2); });
      spr("mortar_f", POT.x, POT.y);
      flies = flies.filter(function (f) {
        var u = Math.min(1, (t - f.t0) / 420), x = f.x0 + (POT.x + 18 + f.k * 6 - f.x0) * u, y = f.y0 + (POT.y + 2 - f.y0) * u - Math.sin(u * Math.PI) * 26;
        spr("ic_" + f.id, x - 8, y - 8);
        if (u >= 1) { beep([[300 + f.k * 60, .03], [180, .04]]); for (var q = 0; q < 5; q++) dust.push({ x: POT.x + 27 + rnd(-10, 10), y: POT.y + 10, vx: rnd(-14, 14), vy: rnd(-20, -8), t0: t }); return false; }
        return true;
      });
      dust = dust.filter(function (d) { var a = (t - d.t0) / 500; if (a > 1) return false; R(c, d.x + d.vx * a, d.y + d.vy * a + 20 * a * a, 1, 1, "rgba(200,190,170," + (1 - a).toFixed(2) + ")"); return true; });
    }
    var dust = [];
    function book(t) { shadow(BOOK.x + 3, BOOK.y + 36, 36); spr("book", BOOK.x, BOOK.y); var sw = Math.floor(t / 400) % 2; R(c, BOOK.x + 19 + sw, BOOK.y + 10, 1, 1, "#fff8ec"); }
    function arrow(x, y, t) { var on = Math.floor(t / 300) % 2; R(c, x - 1, y + on * 2, 3, 4, "#f6c84a"); R(c, x - 3, y + 4 + on * 2, 7, 1, "#f6c84a"); R(c, x - 2, y + 5 + on * 2, 5, 1, "#f6c84a"); R(c, x - 1, y + 6 + on * 2, 3, 1, "#f6c84a"); }
    // ---------- fire: strike a match, light the logs, blow (or fan) until the kettle whistles three times ----------
    function micStart() { }   /* blowing into the microphone is switched off: the fire is only fanned by hand, and the app never asks for the microphone */
    function micLevel() {
      if (!mic) return 0; mic.an.getByteTimeDomainData(mic.buf); var s_ = 0;
      for (var i = 0; i < mic.buf.length; i++) { var v = (mic.buf[i] - 128) / 128; s_ += v * v; }
      return Math.max(0, Math.min(1, (Math.sqrt(s_ / mic.buf.length) - .05) / .22));
    }
    function micStop() { if (!mic) return; try { mic.st.getTracks().forEach(function (t) { t.stop(); }); mic.ac.close(); } catch (e) {} mic = null; }
    function whistleSet(lv) {
      try {
        if (!lv) { if (whistle) { var w0 = whistle; whistle = null; w0.g.gain.setTargetAtTime(0, actx.currentTime, .05); setTimeout(function () { try { w0.o.stop(); w0.l.stop(); } catch (e) {} }, 300); } return; }
        actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume();
        if (!whistle) {
          var o = actx.createOscillator(), g = actx.createGain(), l = actx.createOscillator(), lg = actx.createGain();
          o.type = "sine"; l.frequency.value = 7; lg.gain.value = 30; l.connect(lg); lg.connect(o.frequency); g.gain.value = 0; o.connect(g); g.connect(actx.destination); o.start(); l.start(); whistle = { o: o, g: g, l: l };
        }
        whistle.o.frequency.setTargetAtTime([0, 1300, 1650, 2050][lv], actx.currentTime, .08);
        whistle.g.gain.setTargetAtTime([0, .012, .025, .045][lv], actx.currentTime, .08);
      } catch (e) {}
    }
    function flame(x, y, h, t, k) {
      if (h <= 0) return;
      var cols = ["#e8554a", "#f6a030", "#ffe08a"];
      for (var i = 0; i < 3; i++) {
        var hh = h * (1 - i * .3), w = 5 - i * 1.4;
        for (var yy = 0; yy < hh; yy++) { var ww = Math.max(1, w * (1 - yy / hh) + Math.sin(t / 90 + yy * .7 + k) * .8); R(c, x - ww, y - yy, ww * 2, 1, cols[i]); }
      }
    }
    function drawFire(t) {
      spr("bg_hearth", 0, 0); drawFest(c, "shelf", t);
      if (lit) {
        // warm light on the soot and the bricks
        c.fillStyle = "rgba(255,170,80," + (.06 + fire * .16).toFixed(3) + ")"; c.fillRect(36, 18, 108, 82);
        c.fillStyle = "rgba(255,190,110," + (.03 + fire * .07).toFixed(3) + ")"; c.fillRect(0, 0, 180, 135);
        var h = 4 + fire * 24; flame(76, 104, h * .75, t, 0); flame(88, 104, h, t, 1.7); flame(100, 104, h * .9, t, 3.1); flame(94, 104, h * .6, t, 4.4);
        for (var e = 0; e < Math.round(fire * 10); e++) { var ey = (t / 12 + e * 17) % 56; R(c, 78 + ((e * 13) % 26) + Math.sin(t / 150 + e) * 3, 102 - ey, 1, 1, ey > 40 ? "#e8554a" : "#ffd27a"); }
        R(c, 68, 111, 44, 1, fire > .3 ? "#f6a030" : "#a8463c"); R(c, 72, 105, 30, 1, fire > .5 ? "#ffd27a" : "#e8554a");
      }
      var wob = stage >= 3 && !ketDrag ? Math.round(Math.sin(t / 45) * 1.5) : 0, hop = stage >= 3 ? Math.abs(Math.round(Math.sin(t / 60))) : 0;
      spr("kettle_b", 60 + ketDX + wob, 32 - hop);
      var steam = stage * 4 + (stage >= 3 ? 12 : 0);
      for (var s_ = 0; s_ < steam; s_++) { var sy = (t / (stage >= 3 ? 12 : 22) + s_ * 9) % 36; var a_ = (1 - sy / 36); R(c, 128 + ketDX + sy * .55 + Math.sin(t / 120 + s_) * 3, 52 - sy, sy > 20 ? 3 : 2, sy > 20 ? 3 : 2, "rgba(255,255,255," + a_.toFixed(2) + ")"); }
      if (stage >= 2) for (var n = 0; n < stage; n++) { var ny = (t / 18 + n * 20) % 30; R(c, 140 + ketDX + n * 5, 30 - ny, 1, 3, "rgba(255,255,255," + (1 - ny / 30).toFixed(2) + ")"); }
      if (boiled) for (var d = 0; d < 7; d++) R(c, 66 + ketDX + d * 7, 50 + ((t / 8 + d * 11) % 40), 2, 3, "#d8eef6");
      spr("matchbox", MBOX.x, MBOX.y);
      if (match) { spr(match.lit ? "match1" : "match0", match.x - 3, match.y - 2); if (match.lit) flame(match.x, match.y, 9, t, 2); }
      else if (!lit) spr("match0", MBOX.x + 30, MBOX.y - 14);
      if (fan) spr("fan", fan[0] - 12, fan[1] - 16);
      if (!lit && !match) arrow(MBOX.x + 21, MBOX.y - 26, t);
      if (stage >= 3 && !ketDrag) arrow(KETTLE.x + 30, KETTLE.y - 16, t);
    }
    function stepFire(dt, t) {
      if (!lit) return;
      var blow = micLevel(); if (blow > .1) fire = Math.min(1, fire + blow * dt * 1.1);
      if (fan && fan.v) { fire = Math.min(1, fire + Math.min(1, fan.v / 260) * dt * 1.2); fan.v *= .85; }
      fire = Math.max(.08, fire - dt * .13);
      if (ketDX === 0) water = Math.min(1.2, water + fire * dt * .11);
      var ns = water >= .9 ? 3 : water >= .72 ? 2 : water >= .5 ? 1 : 0;
      if (ns !== stage) { stage = ns; whistleSet(ns); G_.banner(["Fächel das Feuer an", "Die Kanne pfeift leise", "Sie pfeift lauter", "Runter vom Feuer!"][ns]); if (ns && !mic) G_.banner(["", "Die Kanne pfeift leise", "Sie pfeift lauter", "Runter vom Feuer!"][ns]); }
      if (stage >= 3) { boilT += dt; if (boilT > 3 && !boiled) { boiled = true; G_.banner("Sie kocht über!"); beep([[160, .1], [120, .14]]); } }
    }
    function pullOff() {
      whistleSet(0); micStop();
      sHeat = stage >= 3 && !boiled ? 1 : 0;
      G_.banner(sHeat ? "Genau richtig heiß" : boiled ? "Übergekocht, etwas zu heiß" : stage === 2 ? "Fast heiß genug" : "Nur lauwarm");
      beep([[523, .05], [392, .07]]); phase = "fireout";
      G_.pause(1000, function () { phase = "pour"; pourT = 0; tilt = 0; tiltT = 0; sPour = 0; setTimeout(function () { if (phase === "pour") G_.banner("Nach unten ziehen zum Eingießen"); }, 1000); }, 90, 60);
    }
    // ---------- steeping: pull the bag evenly through the water, lift it out at the right moment ----------
    var WX = 53, WY = 64, CW = 4, CH = 5;
    function strength() { var s_ = 0; conc.forEach(function (v) { s_ += v; }); return s_ / conc.length; }
    function evenness() { var m = strength(); if (m < .02) return 0; var v = 0; conc.forEach(function (x) { v += (x - m) * (x - m); }); return Math.max(0, 1 - Math.sqrt(v / conc.length) / m * .6); }
    function gaugeSteep() { G_.gauge.innerHTML = woodBarSvg({ w: 60, vertical: true, up: true, frac: Math.min(1, strength()), zone: bl.steep, col: function (k) { return teaCol(k); } }); }
    function gaugeHeat() { G_.gauge.innerHTML = woodBarSvg({ w: 60, vertical: true, up: true, frac: Math.min(1, water), zone: [.9, 1], col: function (k) { return lerpC("#8ac8f0", "#e8554a", k); } }); }
    function stepSteep(dt) {
      if (!bag.held && bag.dunked) { bag.y = Math.min(86, bag.y + dt * 30); }
      var inW = bag.y + 7 > WY;
      if (inW) {
        if (!bag.dunked) { bag.dunked = true; G_.banner("Gleichmäßig durchziehen"); beep([[330, .04]]); }
        var sp = Math.min(1, Math.hypot(bag.vx, bag.vy) / 90), gx0 = Math.floor((bag.x - WX) / CW), gy0 = Math.floor((bag.y + 7 - WY) / CH);
        for (var yy = gy0 - 2; yy <= gy0 + 2; yy++) for (var xx = gx0 - 3; xx <= gx0 + 3; xx++) {
          if (xx < 0 || yy < 0 || xx >= GW || yy >= GH) continue;
          var k = yy * GW + xx; conc[k] = Math.min(1.2, conc[k] + dt * (.1 + sp * 1.1) * (Math.abs(xx - gx0) + Math.abs(yy - gy0) < 3 ? 1 : .5));
        }
      }
      for (var it = 0; it < 2; it++) {
        var nb = conc.slice();
        for (var y = 0; y < GH; y++) for (var x = 0; x < GW; x++) {
          var k2 = y * GW + x, s_ = 0, n = 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var X = x + d[0], Y = y + d[1]; if (X >= 0 && Y >= 0 && X < GW && Y < GH) { s_ += conc[Y * GW + X]; n++; } });
          nb[k2] = conc[k2] + (s_ / n - conc[k2]) * Math.min(.5, dt * 2);
        }
        conc = nb;
      }
      bag.vx *= .8; bag.vy *= .8;
      gaugeSteep();
    }
    function ell(cx, cy, rx, ry, col, half) {
      c.fillStyle = col;
      for (var y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) { if (half === 1 && y > cy) continue; if (half === 2 && y < cy) continue; var h = 1 - ((y + .5 - cy) / ry) * ((y + .5 - cy) / ry); if (h <= 0) continue; var w = rx * Math.sqrt(h); c.fillRect(Math.round(cx - w), y, Math.round(2 * w), 1); }
    }
    function roundness() {
      c.fillStyle = "rgba(255,255,255,.16)"; c.fillRect(53, 60, 6, 48); c.fillStyle = "rgba(255,255,255,.08)"; c.fillRect(59, 60, 4, 48);
      c.fillStyle = "rgba(42,20,8,.10)"; c.fillRect(98, 60, 5, 48); c.fillStyle = "rgba(42,20,8,.18)"; c.fillRect(103, 60, 5, 48);
    }
    function drawGlass(t, colFn, dx) {
      var wi = cafeWall(); if (wi.complete && wi.naturalWidth) c.drawImage(wi, 0, 0); else spr("bg_table", 0, 0);
      drawCafeWindow(c, t); drawFest(c, "win", t);
      spr("bg_counter", 0, 0);
      c.save(); c.translate(dx || 0, 0);
      spr("doily", 31, 104); shadow(48, 110, 76);
      R(c, 53, 56, 55, 52, "#eaf4f8"); ell(80.5, 59, 28, 4.2, "#d8eaf0");      // the empty glass: back wall and the far side of the opening
      colFn();
      roundness();
      spr("glass", 46, 50);
      // the lemon slice stands in the glass: in front of the back edge of the rim, behind the front edge
      if (phase === "adds" || phase === "done") { if (addT.zitrone) { c.save(); c.beginPath(); c.rect(0, 0, 180, 59); c.clip(); spr("slice_in", 64, 46 + Math.round(Math.sin(t / 700) * 1)); c.restore(); } }
      for (var s2 = 0; s2 < (sHeat ? 5 : 3); s2++) { var sy2 = (t / 30 + s2 * 20) % 40; R(c, 62 + s2 * 10 + Math.sin((t / 300) + s2) * 2, 54 - sy2, 1, 2, "rgba(255,255,255," + (1 - sy2 / 40).toFixed(2) + ")"); }
      c.restore();
    }
    var ADX = 16;   // with the extras on the left, the glass moves a little to the right
    function surface(top, col) {
      ell(80.5, top, 27.5, 3.6, lerpC(col, "#ffffff", .22)); ell(80.5, top - .5, 27.5, 3.1, lerpC(col, "#ffffff", .12), 1);
      c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect(62, Math.round(top - 2), 9, 1); c.fillRect(88, Math.round(top + 1), 5, 1);
    }
    function drawWater() {
      var lvl = Math.round(41 * Math.min(1, pourT)), top = 105 - lvl;
      for (var y = 0; y < GH; y++) for (var x = 0; x < GW; x++) {
        var y0 = WY + y * CH, y1 = y0 + CH; if (y1 <= top) continue;
        var x0 = WX + x * CW, w = Math.min(CW, 108 - x0); if (w <= 0) continue;
        var yy = Math.max(y0, top); R(c, x0, yy, w, y1 - yy, teaCol(conc[y * GW + x]));
      }
      if (lvl > 4) { var sc = 0, n = 0; for (var x2 = 0; x2 < GW; x2++) { sc += conc[x2]; n++; } surface(top, teaCol(sc / n)); }
    }
    var TIPS = TEA_ART.tips, KO = [78, -9];
    function gaugePour() { G_.gauge.innerHTML = woodBarSvg({ w: 60, vertical: true, up: true, frac: Math.min(1, pourT), zone: [.8, .95], col: function () { return "#bfe0f0"; } }); }
    function stepPour(dt, t) {
      tilt += (tiltT - tilt) * Math.min(1, dt * 10);
      var i = Math.max(0, Math.min(4, Math.round(tilt * 4))), tip = TIPS[i], tx_ = KO[0] + tip[0], ty_ = KO[1] + tip[1];
      var flow = i >= 2 ? (i - 1) / 3 : 0, top = 105 - 41 * Math.min(1, pourT);
      G_.el.classList.toggle("cf-pouring", !!pourHold);
      if (flow) { pourT += flow * dt * .32; pourIdle = 0; if (Math.random() < .5) splash.push({ x: tx_ + rnd(-4, 4), y: top, vx: rnd(-18, 18), vy: rnd(-26, -10), t0: t }); }
      else if (pourT > .05) pourIdle += dt;
      if (pourT >= 1 && !spill) { spill = t; tiltT = 0; pourHold = null; G_.banner("Übergelaufen!"); beep([[220, .08], [160, .1]]); }
      gaugePour();
      drawGlass(t, drawWater);
      // a little shimmer and bubbles in the clear hot water
      if (pourT > .05) { for (var b = 0; b < 6; b++) { var by = 104 - ((t / 22 + b * 13) % Math.max(4, 104 - top)); R(c, 58 + (b * 11) % 46, by, 1, 1, "rgba(255,255,255,.75)"); } }
      if (spill) { var a = Math.min(1, (t - spill) / 900); for (var d = 0; d < 4; d++) R(c, d % 2 ? 108 : 50, 62 + a * 44 + d * 3, 2, 3, "#bfe0f0"); R(c, 40, 112, 84, 2, "rgba(150,200,230," + (.5 * a).toFixed(2) + ")"); }
      if (flow) {
        var w = i >= 4 ? 3 : 2;
        R(c, tx_ - 1, ty_, w, Math.max(0, top - ty_), "#bfe0f0"); R(c, tx_ - 1, ty_, 1, Math.max(0, top - ty_), "#ffffff");
        for (var q = 0; q < 3; q++) R(c, tx_ - 1, ty_ + ((t / 6 + q * 9) % Math.max(1, top - ty_)), w, 2, "#e8f6fc");
      }
      splash = splash.filter(function (d) { var u = (t - d.t0) / 450; if (u > 1) return false; R(c, d.x + d.vx * u, d.y + d.vy * u + 40 * u * u, 1, 1, "rgba(220,240,250," + (1 - u).toFixed(2) + ")"); return true; });
      spr("kettle_p" + i, KO[0], KO[1]);
      if (!pourHold && pourT < .05) arrow(KO[0] + 44, KO[1] + 72, t);
      // done: the kettle has been set upright for a moment
      if ((spill && t - spill > 1300) || (!spill && pourT >= .5 && pourIdle > .9)) {
        if (!spill && pourT < .8) { if (pourIdle < 1) G_.banner("Noch etwas mehr"); return; }
        G_.el.classList.remove("cf-pouring"); sPour = !spill && pourT <= .95 ? 1 : 0; sHeat = sHeat && sPour ? 1 : 0;
        if (!spill) G_.banner(sPour ? "Genau richtig voll" : "Fast bis zum Rand");
        pourT = Math.min(1, pourT); phase = "pourout"; G_.gauge.innerHTML = "";
        G_.pause(1000, function () { phase = "steep"; setTimeout(function () { if (phase === "steep" && !bag.dunked) G_.banner("Beutel ins Wasser tauchen"); }, 900); }, 70, 70);
      }
    }
    function drawBag(t) {
      var x = Math.round(bag.x), y = Math.round(bag.y);
      R(c, x, 28, 1, Math.max(0, y - 27), "#f6f2ea"); spr("tag", x - 7, 18);
      spr("bag", x - 8, y - 1);
      c.fillStyle = bl.col; c.globalAlpha = Math.min(.55, strength() * .9); c.fillRect(x - 6, y + 4, 13, 12); c.globalAlpha = 1;
    }
    function finishSteep() {
      if (phase !== "steep") return; phase = "steepout"; G_.pause(1000, function () { phase = "adds"; }, 70, 70);
      var st = strength(), d = Math.abs(st - (bl.steep[0] + bl.steep[1]) / 2);
      sTime = st >= bl.steep[0] && st <= bl.steep[1] ? 1 : 0; sEven = evenness() >= .55 ? 1 : 0;
      G_.banner(sTime && sEven ? "Schön gleichmäßig!" : !sTime ? (st < bl.steep[0] ? "Noch etwas dünn" : "Recht kräftig") : "Etwas fleckig gezogen");
      beep([[523, .04], [659, .05]]);
      finalCol = teaCol(st); G_.gauge.innerHTML = "";
      setTimeout(function () { if (phase === "adds") G_.banner("Noch etwas dazu?"); }, 1500);
    }
    // ---------- extras: honey, lemon, milk or sugar go in last; tap the glass to serve ----------
    function addCol() { var col = finalCol; adds.forEach(function (id) { var a = TEA_ADD.filter(function (x) { return x.id === id; })[0]; if (a.tint) col = lerpC(col, a.tint, a.k); }); return col; }
    var addT = {};
    function drawAdds(t) {
      var col = addCol(), top = 64;
      drawGlass(t, function () {
        R(c, 53, top, 55, 105 - top, col);
        for (var k0 = 0; k0 < 6; k0++) R(c, 58 + (k0 * 23) % 46, 70 + (k0 * 13) % 30, 1, 4, lerpC(col, "#2a1408", .1));
        // honey: soft golden veils drifting slowly down through the tea
        if (addT.honig) {
          var ha = Math.min(1, (t - addT.honig) / 1500);
          for (var h = 0; h < 4; h++) for (var q = 0; q < 26; q++) {
            var yy = top + 4 + q * 1.7, xx = 60 + h * 11 + Math.sin(q / 4 + t / 1400 + h * 1.7) * 6 + Math.sin(t / 2300 + h) * 3;
            c.fillStyle = "rgba(240,176,48," + ((.16 + .1 * Math.sin(q / 3 + h)) * ha * (1 - q / 34)).toFixed(3) + ")"; c.fillRect(Math.round(xx), Math.round(yy), 3 + (q % 3 === 0), 2);
          }
          c.fillStyle = "rgba(232,160,32," + (.16 * ha).toFixed(3) + ")"; c.fillRect(55, 100, 51, 5);
        }
        surface(top, col);
        // lemon: a real slice standing in the tea; the far half of the surface lies behind it, the near half in front, below that it shows through the tea
        if (addT.zitrone) {
          var ly = 46 + Math.round(Math.sin(t / 700) * 1);
          spr("slice_in", 64, ly);
          c.fillStyle = col; c.globalAlpha = .45; c.fillRect(64, top, 36, ly + 36 - top); c.globalAlpha = .55; ell(80.5, top, 27.5, 3.6, lerpC(col, "#ffffff", .22), 2); c.globalAlpha = 1;
          c.fillStyle = "rgba(255,255,255,.5)"; c.fillRect(66, top, 32, 1);
        }
        // sugar: the tea sparkles
        if (addT.zucker) for (var b = 0; b < 9; b++) {
          var ph = (t / 900 + b * .37) % 1; if (ph > .45) continue;
          var sx = 58 + ((b * 37) % 46), sy = top + 6 + ((b * 23) % 34), a_ = Math.sin(ph / .45 * Math.PI);
          c.fillStyle = "rgba(255,255,255," + a_.toFixed(2) + ")"; c.fillRect(sx, sy, 1, 1); if (a_ > .5) { c.fillRect(sx - 1, sy, 3, 1); c.fillRect(sx, sy - 1, 1, 3); } if (a_ > .85) { c.fillRect(sx - 2, sy, 1, 1); c.fillRect(sx + 2, sy, 1, 1); c.fillRect(sx, sy - 2, 1, 1); c.fillRect(sx, sy + 2, 1, 1); }
        }
      }, ADX);
      Object.keys(ADDPOS).forEach(function (id) {
        var p = ADDPOS[id], used = adds.indexOf(id) >= 0;
        spr("x_" + id, p.x, p.y);
        if (used) { var bx = p.x + 26, by = p.y + 2; R(c, bx, by, 9, 9, "#3a2414"); R(c, bx + 1, by + 1, 7, 7, "#f6c84a"); R(c, bx + 1, by + 1, 7, 1, "#fff0a0"); R(c, bx + 2, by + 4, 1, 1, "#3a2414"); R(c, bx + 3, by + 5, 1, 1, "#3a2414"); R(c, bx + 4, by + 6, 1, 1, "#3a2414"); R(c, bx + 5, by + 3, 1, 3, "#3a2414"); R(c, bx + 6, by + 2, 1, 1, "#3a2414"); }
      });
      if (drag) { c.globalAlpha = .9; spr("x_" + drag.id, drag.x - 18, drag.y - 18); c.globalAlpha = 1; }
      if (phase === "adds") arrow(80 + ADX, 36, t);
      if (phase === "done") starsAt(c, stars, 80 + ADX, 124);
    }
    function serve() {
      if (phase !== "adds") return; phase = "done";
      var goods = sHeat + sTime + sEven; stars = Math.max(1, goods);
      var B = teaBook(), e = B[bl.key]; isNew = !e;
      B[bl.key] = { n: bl.name, c: bl.col, s: Math.max(stars, e ? e.s : 0), t: e ? e.t : Date.now() };
      var C_ = cfL(); C_.teas = (C_.teas || []).concat([{ k: bl.key, x: adds.slice() }]).slice(-3);
      var nm = bl.name + teaAddName(adds);
      cfFinish(G_, "tea", stars, isNew ? "Neue Sorte: " + nm + "!" : nm);
      if (isNew) { beep([[784, .08], [988, .08], [1175, .08], [1568, .2]]); G_.el.classList.add("cf-newtea"); }
    }
    // ---------- the frame loop ----------
    function draw(t) {
      var dt = Math.min(.05, (t - last) / 1000); last = t;
      if (phase === "mix") { wall(); for (var i = 0; i < 8; i++) tin(i, t); pot(t); shadow(KET.x + 4, KET.y + 42, 40); spr("kettle_s", KET.x - 4, KET.y - 10); book(t); if (pick.length) arrow(KET.x + 22, KET.y - 18, t); }
      else if (phase === "fire") { stepFire(dt, t); if (lit) gaugeHeat(); drawFire(t); }
      else if (phase === "fireout") drawFire(t);
      else if (phase === "pour") stepPour(dt, t);
      else if (phase === "pourout") drawGlass(t, drawWater);
      else if (phase === "steepout") { drawGlass(t, drawWater); drawBag(t); }
      else if (phase === "steep") { stepSteep(dt); drawGlass(t, drawWater); drawBag(t); if (!bag.dunked) arrow(bag.x, 44, t); }
      else { drawAdds(t); }
      if (phase !== "gone") raf = requestAnimationFrame(draw);
    }
    function showPick() { G_.banner(pick.length ? teaList(pick).join(" + ") : "Zutaten in den Mörser"); }
    G_.cv.addEventListener("pointerdown", function (e) {
      e.preventDefault(); var p = pt(e);
      try { G_.cv.setPointerCapture(e.pointerId); } catch (er) {}
      if (phase === "mix") {
        if (inR(p, BOOK)) { beep([[440, .04], [523, .05]]); teaBookEl(G_.el); return; }
        for (var i = 0; i < 8; i++) if (inR(p, TIN[i])) {
          var id = TEA_ING[i].id;
          if (pick.length >= 3) { G_.banner("Der Mörser ist voll"); beep([[220, .06]]); return; }
          else { pick.push(id); flies.push({ id: id, k: pick.length - 1, x0: TIN[i].x + 14, y0: TIN[i].y + 16, t0: performance.now() }); beep([[523 + pick.length * 110, .05]]); }
          shake = i; setTimeout(function () { shake = -1; }, 260); showPick(); return;
        }
        if (inR(p, POT) && pick.length && !flies.length) { pick.pop(); beep([[300, .05], [240, .06]]); showPick(); return; }
        if (inR(p, KET)) {
          if (!pick.length) { G_.banner("Erst Zutaten in den Mörser"); beep([[220, .06]]); return; }
          bl = teaBlend(pick); phase = "fire"; G_.banner("Streichholz anreißen"); beep([[262, .05], [330, .05]]); micStart(); return;
        }
        return;
      }
      if (phase === "fire") {
        if (!lit && inR(p, MBOX)) { match = { x: p[0], y: p[1], lit: false, rub: 0, lx: p[0] }; return; }
        if (lit && stage > 0 && inR(p, { x: KETTLE.x - 4, y: KETTLE.y - 8, w: KETTLE.w + 10, h: 50 })) { ketDrag = { x0: p[0] }; return; }
        if (lit) { fan = [p[0], p[1]]; fan.v = 0; fan.lx = p[0]; fan.ly = p[1]; return; }
        return;
      }
      if (phase === "pour" && !spill) { pourHold = { y0: p[1] }; return; }
      if (phase === "steep") { if (Math.abs(p[0] - bag.x) < 22) { bag.held = true; bag.ox = p[0] - bag.x; bag.oy = p[1] - bag.y; } return; }
      if (phase === "adds") {
        var hit = null; Object.keys(ADDPOS).forEach(function (id) { var a = ADDPOS[id]; if (inR(p, { x: a.x + 2, y: a.y + 2, w: 32, h: 36 })) hit = id; });   // the front row wins, it is checked last
        if (hit) {
          if (adds.indexOf(hit) >= 0) { G_.banner("Ist schon drin"); beep([[330, .04]]); return; }
          if (adds.length >= 2) { G_.banner("Zwei Zusätze reichen"); beep([[220, .06]]); return; }
          drag = { id: hit, x: p[0], y: p[1] }; beep([[440, .03]]); return;
        }
        if (inR(p, { x: 44 + ADX, y: 50, w: 80, h: 62 })) serve();
      }
    });
    G_.cv.addEventListener("pointermove", function (e) {
      var p = pt(e);
      if (phase === "fire") {
        if (match) {
          if (!match.lit && inR(p, MBOX)) { match.rub += Math.abs(p[0] - match.lx); if (match.rub > 26) { match.lit = true; beep([[900, .03], [500, .05]]); G_.banner("Ans Holz halten"); } }
          match.lx = p[0]; match.x = p[0]; match.y = p[1];
          if (match.lit && inR(p, LOGS)) { lit = true; match = null; fire = .25; beep([[200, .08], [260, .1]]); G_.banner(mic ? "Fächel das Feuer an" : "Fächel das Feuer an"); }
        } else if (ketDrag) {
          ketDX = Math.max(-40, Math.min(40, p[0] - ketDrag.x0));
          if (Math.abs(ketDX) > 30) { ketDrag = null; pullOff(); }
        } else if (fan) { fan.v += Math.hypot(p[0] - fan.lx, p[1] - fan.ly) * 6; fan.lx = p[0]; fan.ly = p[1]; fan[0] = p[0]; fan[1] = p[1]; }
        return;
      }
      if (phase === "pour" && pourHold) { tiltT = Math.max(0, Math.min(1, (p[1] - pourHold.y0) / 40)); return; }
      if (phase === "steep" && bag.held) {
        var nx = Math.max(58, Math.min(102, p[0] - bag.ox)), ny = Math.max(28, Math.min(86, p[1] - bag.oy));
        bag.vx = (nx - bag.x) * 30; bag.vy = (ny - bag.y) * 30; bag.x = nx; bag.y = ny;
        if (bag.dunked && bag.y < WY - 18) { bag.held = false; finishSteep(); }
        return;
      }
      if (drag) { drag.x = p[0]; drag.y = p[1]; }
    });
    function up() {
      if (phase === "gone") return;
      if (match && !lit) match = null;
      if (ketDrag) { ketDrag = null; ketDX = 0; }
      if (fan) fan = null;
      if (pourHold) { pourHold = null; tiltT = 0; }
      bag.held = false;
      if (drag) {
        if (drag.x > 44 + ADX && drag.x < 124 + ADX && drag.y > 44 && drag.y < 112) { adds.push(drag.id); addT[drag.id] = performance.now(); beep(drag.id === "zucker" ? [[1319, .04], [1760, .06], [2093, .08]] : [[660, .04], [880, .06]]); G_.banner(bl.name + teaAddName(adds)); }
        drag = null;
      }
    }
    G_.cv.addEventListener("pointerup", up); G_.cv.addEventListener("pointercancel", up);
    var _close = G_.close; G_.close = function () { phase = "gone"; cancelAnimationFrame(raf); whistleSet(0); micStop(); _close(); };
    G_.el.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); G_.close(); });
    G_.gauge.innerHTML = ""; raf = requestAnimationFrame(draw);
    window.__teaG = { st: function () { return { pour: pourT, phase: phase, water: water, stage: stage, fire: fire, str: strength(), even: evenness(), adds: adds.slice() }; } };
  };
  window.__tea = { list: teaList, name: teaName, blend: teaBlend, book: teaBook, total: TEA_TOTAL };
