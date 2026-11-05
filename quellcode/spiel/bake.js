  // ===================== café: the bakehouse (preview) =====================
  // put together your own cake from the pantry (Sonnenblume is the flour), prepare each ingredient, crack the eggs, stir,
  // pour the batter into the tin, bake, decorate and cut it into four pieces for the cabinet. New mixes go into the cake book.
  var BK_ART = /*BAKEART*/;
  Object.keys(BK_ART).forEach(function (k) { var im = new Image(); im.src = BK_ART[k]; TIMG[k] = im; });
  var BK_ING = {
    erdbeer: { h: "strawberry", n: "Erdbeere", pre: "Erdbeer", top: "t_erdbeer", sp: "#f6dca8", cr: "#f6a8b8", dc: "#e8463c", prep: "slice", fr: "f_erdbeer", v: "schneiden" },
    moehre: { h: "gcarrot", n: "Möhre", pre: "Möhren", top: "t_moehre", sp: "#d8a060", cr: "#fff6e4", dc: "#f08a2a", prep: "grate", v: "raspeln" },
    kuerbis: { h: "pumpkin", n: "Kürbis", pre: "Kürbis", top: "t_kuerbis", sp: "#f0a040", cr: "#fff6e4", dc: "#c8661a", prep: "scoop", v: "aushöhlen" },
    nuss: { h: "nut", n: "Haselnuss", pre: "Nuss", top: "t_nuss", sp: "#b07a44", cr: "#5a3420", dc: "#d8a868", prep: "crack", v: "knacken" },
    honig: { h: "honey", n: "Honig", pre: "Honig", top: "t_honig", sp: "#e8c088", cr: "#e8b830", dc: "#f6d860", prep: null },
    sonne: { h: "sunflower", n: "Sonnenblume", pre: "Sonnenblumen", top: "t_kern", sp: "#e8c088", cr: "#f6e0a0", dc: "#5a3420", prep: "pluck", v: "Kerne zupfen" },
    loewe: { h: "dandelion", n: "Löwenzahn", pre: "Löwenzahn", top: "t_loewe", sp: "#f0d890", cr: "#fff070", dc: "#f6c830", prep: "pluck2", v: "Blüten zupfen" },
    kraut: { h: "herbs", n: "Kräuter", pre: "Kräuter", top: "t_kraut", sp: "#d8c890", cr: "#c8e8a8", dc: "#5aa04e", prep: "chop", v: "hacken" },
    chili: { h: "chili", n: "Chili", pre: "Chili", top: "t_chili", sp: "#e8b070", cr: "#f6a890", dc: "#d8302a", prep: "slice", fr: "f_chili", long: 1, v: "schneiden" },
    tomate: { h: "tomato", n: "Tomate", pre: "Tomaten", top: "t_tomate", sp: "#f0c890", cr: "#ff9a8a", dc: "#e8463c", prep: "slice", fr: "f_tomate", v: "schneiden" },
    gurke: { h: "cucumber", n: "Gurke", pre: "Gurken", top: "t_gurke", sp: "#e0d8a0", cr: "#d8f0b8", dc: "#5aa04e", prep: "slice", fr: "f_gurke", long: 1, v: "schneiden" },
    // berries from the bushes, fruit from the trees, rhubarb and onions from the bed
    himbeer: { h: "raspberry", n: "Himbeere", pre: "Himbeer", top: "t_himbeer", sp: "#f6d0c0", cr: "#f6889a", dc: "#e8465a", prep: "stem", v: "verlesen" },
    brombeer: { h: "blackberry", n: "Brombeere", pre: "Brombeer", top: "t_brombeer", sp: "#e8c8b8", cr: "#8a6aa8", dc: "#4a3060", prep: "stem", v: "verlesen" },
    heidel: { h: "blueberry", n: "Heidelbeere", pre: "Heidelbeer", top: "t_heidel", sp: "#e8d8c8", cr: "#8aa0e0", dc: "#3a548e", prep: "stem", v: "verlesen" },
    johannis: { h: "currant", n: "Johannisbeere", pre: "Johannisbeer", top: "t_johannis", sp: "#f6d8c0", cr: "#ff8a8a", dc: "#e8303a", prep: "stem", v: "abzupfen" },
    stachel: { h: "gooseberry", n: "Stachelbeere", pre: "Stachelbeer", top: "t_stachel", sp: "#ece8b8", cr: "#d0e890", dc: "#78a03a", prep: "stem", v: "verlesen" },
    kirsche: { h: "cherry", n: "Kirsche", pre: "Kirsch", top: "t_kirsche", sp: "#f0d0b8", cr: "#e8506a", dc: "#8a1028", prep: "stem", v: "entsteinen" },
    apfel: { h: "gapple", n: "Apfel", pre: "Apfel", top: "t_apfel", sp: "#f0d8a8", cr: "#fff0c8", dc: "#e84a3a", prep: "slice", fr: "f_apfel", v: "schneiden" },
    birne: { h: "pear", n: "Birne", pre: "Birnen", top: "t_birne", sp: "#f0dca8", cr: "#f6f4c8", dc: "#98a038", prep: "slice", fr: "f_birne", v: "schneiden" },
    zwetschge: { h: "plum", n: "Zwetschge", pre: "Zwetschgen", top: "t_zwetschge", sp: "#e8c8a8", cr: "#a87ac8", dc: "#4a2468", prep: "slice", fr: "f_zwetschge", v: "schneiden" },
    rhabarber: { h: "rhubarb", n: "Rhabarber", pre: "Rhabarber", top: "t_rhabarber", sp: "#f0d0b8", cr: "#f08a9a", dc: "#d8445a", prep: "slice", fr: "f_rhabarber", long: 1, v: "schneiden" },
    zwiebel: { h: "onion", n: "Zwiebel", pre: "Zwiebel", top: "t_zwiebel", sp: "#ecd8a8", cr: "#f8ecd0", dc: "#c8a060", prep: "slice", fr: "f_zwiebel", v: "schneiden" }
  };
  // the pantry: fruit and sweet things on the top shelf, vegetables, herbs and flowers below; both shelves can be swiped
  var BK_ROWS = [["erdbeer", "himbeer", "brombeer", "heidel", "johannis", "stachel", "kirsche", "apfel", "birne", "zwetschge", "rhabarber", "honig", "nuss"],
                 ["moehre", "kuerbis", "tomate", "gurke", "chili", "zwiebel", "kraut", "sonne", "loewe"]];
  var BK_IDS = Object.keys(BK_ING), CK_TOTAL = 2 * (function (n) { return n + n * (n + 1) / 2 + n * (n + 1) * (n + 2) / 6; })(BK_IDS.length);
  // without a sunflower there is no flour: then it becomes a cream cake, "creme" rides along at the end of the key
  BK_ING.creme = { h: null, n: "Creme", pre: "Creme", top: "t_honig", sp: "#fff2dc", cr: "#fffaf0", dc: "#f6e8d0", prep: null };
  // a cake is one or two ingredients (sorted, joined with +); the classics are just mixes with a name of their own
  var CK_CLASSIC = ["moehre", "erdbeer+erdbeer", "kuerbis", "nuss", "honig", "sonne"];
  var CK_ICON = { moehre: "moehre", "erdbeer+erdbeer": "erdbeer", kuerbis: "kuerbis", nuss: "nuss", honig: "honig", sonne: "sonne" };
  // sweet fillings make a cake or a torte, savoury ones a quiche
  var CK_SPEC = { honig: "Honiggugelhupf", sonne: "Sonnenblumenkuchen", "erdbeer+erdbeer": "Erdbeertorte", "moehre+nuss": "Rüeblitorte", "kuerbis+nuss": "Herbstkuchen", "erdbeer+honig": "Sommerwolke",
    "honig+loewe": "Wiesenhonig-Traum", "kraut+tomate": "Tomaten-Kräuter-Quiche", "chili+nuss": "Feuerknusper", "erdbeer+gurke": "Gartenparty-Torte", "chili+chili": "Drachen-Quiche", "honig+honig": "Bienenkönigin-Gugel",
    "loewe+loewe": "Pusteblumen-Torte", "gurke+kraut": "Picknick-Quiche", "chili+honig": "Feuerhonig-Gugel", "kuerbis+kuerbis": "Kürbiskönig", "nuss+nuss": "Doppelnusstorte", "kraut+kraut": "Waldwiesen-Quiche",
    "erdbeer+rhabarber": "Erdbeer-Rhabarber-Torte", "apfel+nuss": "Apfel-Nuss-Kuchen", apfel: "Apfelkuchen", "apfel+apfel": "Apfeltorte", "brombeer+himbeer": "Waldbeerenkuchen", "heidel+heidel": "Blaubeertorte",
    kirsche: "Kirschkuchen", "kirsche+kirsche": "Kirschtorte", zwetschge: "Zwetschgenkuchen", "zwetschge+zwetschge": "Zwetschgendatschi", "birne+honig": "Birnen-Honig-Kuchen", zwiebel: "Zwiebelquiche",
    "johannis+johannis": "Johannisbeer-Baiser-Torte", "stachel+stachel": "Stachelbeer-Schnitte", "kraut+zwiebel": "Zwiebel-Kräuter-Quiche", "tomate+zwiebel": "Tomaten-Zwiebel-Quiche" };
  var CK_SAVORY = { kraut: 1, tomate: 1, gurke: 1, chili: 1, zwiebel: 1 };
  var CK_NOUN = ["Kuchen", "Torte", "Schnitte", "Gugel", "Traum"], CK_NOUN_S = ["Quiche", "Quiche", "Tarte"];
  function ckKey(a) { var cr = a.indexOf("creme") >= 0; return a.filter(function (q) { return q !== "creme"; }).sort().concat(cr ? ["creme"] : []).join("+"); }
  function ckName(k) {
    if (/\+creme$/.test(k)) { var rest = k.replace(/\+creme$/, ""); return rest.indexOf("+") < 0 && BK_ING[rest] ? BK_ING[rest].pre + "-Cremetorte" : "Creme-" + ckName(rest); }
    if (CK_SPEC[k]) return CK_SPEC[k];
    var p = k.split("+"), A_ = BK_ING[p[0]], B_ = BK_ING[p[1]];
    if (!A_) return k;
    var h = 0; for (var i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) % 997;
    var sav = p.some(function (q) { return CK_SAVORY[q]; }), one = function (I) { return sav ? I.pre + "-Quiche" : I.pre + "kuchen"; }, noun = sav ? CK_NOUN_S[h % CK_NOUN_S.length] : CK_NOUN[h % CK_NOUN.length];
    if (p.length === 1) return one(A_);
    if (p.length === 2) return p[0] === p[1] ? (sav ? "Große " + one(A_) : A_.pre + "torte") : A_.pre + "-" + B_.pre + "-" + noun;
    // three: a triple, a double with one more, or three different
    if (p[0] === p[1] && p[1] === p[2]) return "Dreifach-" + (sav ? one(A_) : A_.pre + "-Torte");
    var dbl = p[0] === p[1] ? p[0] : p[1] === p[2] ? p[1] : null;
    if (dbl) { var o1 = p.filter(function (q) { return q !== dbl; })[0]; return "Doppel-" + BK_ING[dbl].pre + "-" + BK_ING[o1].pre + "-" + noun; }
    return (sav ? ["Gartenwunder", "Gemüsegarten-Quiche", "Hamsterglück", "Erntefest-Quiche", "Bunte Wiese", "Sommerfest-Quiche", "Waldfee-Quiche", "Regenbogen-Quiche"] : ["Gartenwunder", "Kunterbunt-Gugel", "Hamsterglück", "Erntefest-Torte", "Bunte Wiese", "Sommerfest-Kuchen", "Waldfee-Schnitte", "Regenbogen-Torte"])[h % 8];
  }
  function ckNeed(k) { var nd = /\+creme$/.test(k) ? {} : { sunflower: 1 }; k.split("+").forEach(function (id) { var h = BK_ING[id].h; if (h) nd[h] = (nd[h] || 0) + 1; }); return nd; }
  // the key a pick turns into: with flour if a sunflower is left over for it, otherwise a cream cake
  function ckFinal(pick) { var sun = pick.filter(function (q) { return q === "sonne"; }).length; return ckKey(ckHave("sunflower") > sun ? pick : pick.concat(["creme"])); }
  function ckHave(h) { return garden.harvest[h] || 0; }
  function ckCan(k) { var nd = ckNeed(k); return Object.keys(nd).every(function (h) { return ckHave(h) >= nd[h]; }); }
  function ckUse(k) { var nd = ckNeed(k); Object.keys(nd).forEach(function (h) { garden.harvest[h] -= nd[h]; }); if (typeof renderFoods === "function") renderFoods(); }
  function ckBook() { var C_ = cfL(); C_.kbook = C_.kbook || {}; return C_.kbook; }
  // cake pictures: the classics are drawn, everything else is put together from the ingredient colours
  var CK_URL = {};
  function ckIcon(k, big) {
    var id = (big ? "ckb_" : "cks_") + k;
    if (CK_ICON[k]) return (big ? "ck_" : "cs_") + CK_ICON[k];
    if (TIMG[id]) return id;
    var p = k.split("+"), cr = p[p.length - 1] === "creme", A_ = BK_ING[p[0]] || BK_ING.sonne, B_ = cr ? BK_ING.creme : BK_ING[p[1] || p[0]] || A_, W_ = big ? 32 : 13, H_ = big ? 26 : 11;
    var cv = document.createElement("canvas"); cv.width = W_; cv.height = H_; var x = cv.getContext("2d");
    function r(a, b, w, h, col) { x.fillStyle = col; x.fillRect(a, b, w, h); }
    if (big) {
      r(2, 8, 28, 17, "#3a2414"); r(3, 9, 26, 15, A_.sp); r(3, 9, 26, 3, B_.cr); r(3, 9, 26, 1, lerpC(B_.cr, "#ffffff", .35)); r(3, 16, 26, 2, A_.cr); r(3, 22, 26, 1, lerpC(A_.sp, "#3a2414", .25)); r(0, 25, 32, 1, "#ece6da");
      for (var i = 0; i < 4; i++) { var dx = 5 + i * 6; r(dx, 4, 5, 5, "#3a2414"); r(dx + 1, 5, 3, 3, i % 2 ? A_.dc : B_.dc); r(dx + 1, 5, 1, 1, "#ffffff"); }
    } else {
      r(1, 3, 11, 7, "#3a2414"); r(2, 4, 9, 5, A_.sp); r(2, 4, 9, 1, B_.cr); r(2, 6, 9, 1, A_.cr); r(2, 8, 9, 1, lerpC(A_.sp, "#3a2414", .25));
      [3, 6, 9].forEach(function (dx, i) { r(dx - 1, 1, 3, 3, "#3a2414"); r(dx, 2, 1, 1, i % 2 ? A_.dc : B_.dc); });
    }
    var u = cv.toDataURL(); CK_URL[id] = u; var im = new Image(); im.src = u; TIMG[id] = im; return id;
  }
  function ckIconUrl(k, big) { var id = ckIcon(k, big); return BK_ART[id] || CK_URL[id]; }
  // the same picture as square pixels (svg paths), so it stays crisp at any size; falls back to the image until it has loaded
  var CK_PIX = {}, CK_MAX = 2;
  function ckPix(k, big) {
    var id = ckIcon(k, big), w = big ? 32 : 13, h = big ? 26 : 11;
    if (CK_PIX[id]) return CK_PIX[id];
    var im = TIMG[id];
    if (!im || !im.complete || !im.naturalWidth) return { svg: '<image href="' + ckIconUrl(k, big) + '" width="' + w + '" height="' + h + '" style="image-rendering:pixelated"/>', w: w, h: h };
    var cv = document.createElement("canvas"); cv.width = im.naturalWidth; cv.height = im.naturalHeight; var x = cv.getContext("2d"); x.drawImage(im, 0, 0);
    var d = x.getImageData(0, 0, cv.width, cv.height).data, by = {};
    for (var yy = 0; yy < cv.height; yy++) for (var xx = 0; xx < cv.width; xx++) { var o = (yy * cv.width + xx) * 4; if (d[o + 3] < 128) continue; var col = "#" + [d[o], d[o + 1], d[o + 2]].map(function (v) { return ("0" + v.toString(16)).slice(-2); }).join(""); (by[col] = by[col] || []).push("M" + xx + " " + yy + "h1v1h-1z"); }
    var svg = Object.keys(by).map(function (col) { return '<path fill="' + col + '" d="' + by[col].join("") + '"/>'; }).join("");
    return (CK_PIX[id] = { svg: svg, w: cv.width, h: cv.height });
  }
  // the cabinet: up to four cakes, each cut into four pieces
  function ckList() {
    var C_ = cfL();
    if (!C_.cakeList) { C_.cakeList = []; for (var i = 0; i < (C_.cakes || 0); i++) C_.cakeList.push("moehre"); }
    var OLD = { erdbeer: "erdbeer+erdbeer", mamor: "honig", apfel: "moehre" };
    C_.cakeList = C_.cakeList.map(function (e) { if (typeof e === "string") e = { k: OLD[e] || e, n: 4 }; if (OLD[e.k]) e.k = OLD[e.k]; return e; }).filter(function (e) { return e.n > 0 && e.k.split("+").every(function (id) { return BK_ING[id]; }); });
    C_.cakes = C_.cakeList.length; return C_.cakeList;
  }
  function ckAvail() { var o = {}; ckList().forEach(function (e) { o[e.k] = 1; }); if (garden.harvest.cake > 0) o.moehre = 1; CK_CLASSIC.forEach(function (k) { if (ckCan(k)) o[k] = 1; }); return Object.keys(o); }
  var CK_POS = [[306, 67], [321, 67], [309, 64], [324, 64]];
  function ckStockSvg() {
    var L_ = ckList().slice(0, 4), o = "";
    [2, 3, 0, 1].forEach(function (i) {
      var e = L_[i]; if (!e) return; var p = CK_POS[i], w = Math.ceil(13 * e.n / 4) + (e.n < 4 ? 0 : 0);
      o += '<clipPath id="ckc' + i + '"><rect x="' + p[0] + '" y="' + p[1] + '" width="' + w + '" height="11"/></clipPath><g clip-path="url(#ckc' + i + ')"><g transform="translate(' + p[0] + ' ' + p[1] + ')">' + ckPix(e.k, false).svg + '</g></g>' +
        (e.n < 4 ? '<path fill="#3a2414" d="M' + (p[0] + w - 1) + ' ' + (p[1] + 3) + 'h1v7h-1z"/>' : "");
    });
    return o;
  }
  // 3x5 pixel digits for the crate labels
  var DIG = ["111101101101111", "010110010010111", "111001111100111", "111001111001111", "101101111001001", "111100111001111", "111100111101111", "111001010010010", "111101111101111", "111101111001111"];
  function digits(c, n, x, y, col) { String(n).split("").forEach(function (d, j) { var m = DIG[+d]; for (var i = 0; i < 15; i++) if (m[i] === "1") R(c, x + j * 4 + i % 3, y + Math.floor(i / 3), 1, 1, col); }); }

  function bakeGame() {
    var G_ = cfGameEl(""), c = G_.c, phase = "pick", raf = 0, last = performance.now(), T = 0;
    var pick = [], pend = [], key = null, items = [], it = null, pr = null, parts = [], flies = [];
    var eggN = 0, egg = null, shards = [], yolks = [], sEgg = 1;
    var stir = 0, ang = null, sAng = 0, spA = -0.6, mill = 0, mAng = null, mTurn = 0, tilt = 0, tilt0 = null, fill = 0, spill = false, sFill = 0, fillEnd = 0;
    var oven = 0, ovenIn = 0, sBake = 0, tops = [], drag = null, cuts = [], swipe = null, sCut = 0, stars = 0;
    var BC = [90, 70], PC = [104, 68], CRK = 30, BOARD = [15, 74];
    var SHY = [22, 48], shScroll = [0, 0], shDrag = null;
    var CRATE = []; BK_ROWS.forEach(function (row, r) { row.forEach(function (id, i) { if (BK_ING[id]) CRATE.push({ id: id, r: r, i: i, y: SHY[r], x: 4 + i * 29 }); }); });
    function shMax(r) { var n = CRATE.filter(function (q) { return q.r === r; }).length; return Math.max(0, 4 + n * 29 + 1 - 180); }
    function crateX(cr) { return cr.x - Math.round(shScroll[cr.r]); }
    var BOWLP = [90, 100], BOOK = [136, 94], CNT = document.createElement("div"); CNT.className = "bk-cnt"; G_.el.appendChild(CNT);
    function pt(e) { var b = G_.cv.getBoundingClientRect(); return [(e.clientX - b.left) / b.width * 180, (e.clientY - b.top) / b.height * 135]; }
    function spr(k, x, y) { var im = TIMG[k]; if (im && im.complete) c.drawImage(im, Math.round(x), Math.round(y)); }
    function wall() { var wi = cafeWall(); if (wi.complete && wi.naturalWidth) c.drawImage(wi, 0, 0); drawCafeWindow(c, performance.now()); drawFest(c, "win", performance.now()); spr("bg_counter", 0, 0); }
    function arrow(x, y, t) { var on = Math.floor(t / 300) % 2; R(c, x - 1, y + on * 2, 3, 4, "#f6c84a"); R(c, x - 3, y + 4 + on * 2, 7, 1, "#f6c84a"); R(c, x - 2, y + 5 + on * 2, 5, 1, "#f6c84a"); R(c, x - 1, y + 6 + on * 2, 3, 1, "#f6c84a"); }
    function gauge(frac, zone, col) { G_.gauge.innerHTML = woodBarSvg({ w: 60, vertical: true, up: true, frac: Math.max(0, Math.min(1, frac)), zone: zone, col: function (k) { return typeof col === "function" ? col(k) : col; } }); }
    function noGauge() { G_.gauge.innerHTML = ""; }
    function units() { return key.split("+"); }
    function A0() { return BK_ING[units()[0]]; }
    function A1() { var u = units(); return u[u.length - 1] === "creme" ? BK_ING.creme : BK_ING[u[1] || u[0]]; }
    function shadow(x, y, w) { R(c, x, y, w, 2, "rgba(58,36,20,.22)"); }
    function burst(x, y, col, n, sp) { for (var i = 0; i < n; i++) { var a = -Math.PI * Math.random(), v = (sp || 40) * (.5 + Math.random()); parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, col: col, w: 1 + (Math.random() < .5 ? 1 : 0), h: 1 + (Math.random() < .4 ? 1 : 0), life: .9 + Math.random() * .5, floor: 128 }); } }
    function fly(img, x, y, tx, ty, done) { flies.push({ img: img, x: x, y: y, tx: tx, ty: ty, t0: T, done: done }); }
    function stepParts(dt) {
      parts.forEach(function (q) { q.vy += 160 * dt; q.x += q.vx * dt; q.y += q.vy * dt; if (q.y > q.floor) { q.y = q.floor; q.vx *= .5; q.vy = 0; } q.life -= dt; });
      parts = parts.filter(function (q) { return q.life > 0; });
      parts.forEach(function (q) { R(c, q.x, q.y, q.w, q.h, q.col); });
      flies = flies.filter(function (f) {
        var u = Math.min(1, (T - f.t0) / .45), x = f.x + (f.tx - f.x) * u, y = f.y + (f.ty - f.y) * u - Math.sin(u * Math.PI) * 18;
        spr(f.img, x - 5, y - 5); if (u >= 1) { if (f.done) f.done(); return false; } return true;
      });
    }
    // ================= 1: the pantry
    function drawPick(t) {
      wall();
      R(c, 0, 43, 180, 4, "#3a2414"); R(c, 0, 43, 180, 1, "#c8905a"); R(c, 0, 69, 180, 4, "#3a2414"); R(c, 0, 69, 180, 1, "#c8905a");
      var html = "";
      CRATE.forEach(function (cr) {
        var I = BK_ING[cr.id], n = ckHave(I.h), x = crateX(cr), y = cr.y;
        if (x < -28 || x > 182) return;
        if (!n) c.globalAlpha = .4; spr("crate", x, y); spr("ig_" + cr.id, x + 5, y + 1); c.globalAlpha = 1;
        html += '<span style="left:' + ((x + 20) / 1.8) + '%;top:' + ((y + 17) / 1.35) + '%"' + (n ? "" : ' class="no"') + '>' + n + '</span>';
      });
      [0, 1].forEach(function (r) {                                         // more crates hidden at the side: a little chevron
        var y = SHY[r] + 9, on = Math.floor(t / 400) % 2;
        if (shScroll[r] < shMax(r) - 1) { R(c, 175 + on, y, 1, 5, "#3a2414"); R(c, 176 + on, y + 1, 1, 3, "#fff8ec"); R(c, 177 + on, y + 2, 1, 1, "#fff8ec"); }
        if (shScroll[r] > 1) { R(c, 4 - on, y, 1, 5, "#3a2414"); R(c, 3 - on, y + 1, 1, 3, "#fff8ec"); R(c, 2 - on, y + 2, 1, 1, "#fff8ec"); }
      });
      if (CNT._h !== html) { CNT.innerHTML = html; CNT._h = html; }
      // the cake book: the tea book's binding with a cake on the cover
      spr("book", BOOK[0], BOOK[1]); R(c, BOOK[0] + 12, BOOK[1] + 9, 19, 16, "#3a2414"); R(c, BOOK[0] + 13, BOOK[1] + 10, 17, 14, "#fff8ec"); spr("cs_erdbeer", BOOK[0] + 15, BOOK[1] + 12);
      // the bowl, seen a little from above: flour in it, then what you picked
      R(c, BOWLP[0] - 30, BOWLP[1] + 31, 62, 2, "rgba(58,36,20,.22)");
      spr("bowl25_back", BOWLP[0] - 38, BOWLP[1] - 10);
      c.fillStyle = "#fff6e4"; c.beginPath(); c.ellipse(BOWLP[0] + 2, BOWLP[1] + 4, 18, 4, 0, 0, 2 * Math.PI); c.fill(); R(c, BOWLP[0] - 6, BOWLP[1] + 1, 10, 1, "#ffffff");
      pick.forEach(function (id, i) { var q = pickPos(i); spr("ig_" + id, q[0] - 8, q[1] - 10); });
      spr("bowl25_front", BOWLP[0] - 38, BOWLP[1] - 10);
      if (pick.length) arrow(BOWLP[0] + 42, BOWLP[1] - 8, t);
    }
    function pickPos(i) { return [BOWLP[0] + [-18, 0, 18][i], BOWLP[1] + [2, 0, 3][i]]; }
    function startBake() {
      key = ckFinal(pick); CNT.remove(); if (/\+creme$/.test(key)) G_.banner("Ohne Mehl wird es eine Cremetorte");
      items = units().filter(function (id) { return BK_ING[id].prep; }).map(function (id) { return { id: id }; });   // honey comes ready from the hive
      nextItem();
    }
    // ================= 2: preparing each ingredient
    function nextItem() {
      it = items.shift();
      if (!it) { phase = "egg"; eggN = 0; newEgg(); G_.banner("Eier aufschlagen"); beep([[523, .05], [659, .05]]); return; }
      var I = BK_ING[it.id]; phase = "prep"; pr = { p: 0, t: 0 };
      G_.banner(I.n + " " + I.v); beep([[523, .05], [659, .05]]);
      if (I.prep === "grate") { pr.cy = -6; pr.pile = []; }
      if (I.prep === "crack") { pr.stage = 0; pr.hit = 0; }
      if (I.prep === "slice") { pr.cuts = []; pr.need = I.fr === "f_erdbeer" || I.fr === "f_tomate" ? 4 : 5; }
      if (I.prep === "scoop") { pr.seeds = []; for (var i = 0; i < 20; i++) { var a = i * 2.4, r = 3 + (i * 7 % 16); pr.seeds.push({ x: 90 + Math.cos(a) * r * 1.3, y: 88 + Math.sin(a) * r * .8 }); } }
      if (I.prep === "drip") { pr.level = 0; pr.hold = false; }
      if (I.prep === "pluck") { pr.seeds = []; for (var j = 0; j < 15; j++) { var a2 = j * 2.39996, r2 = 4 + Math.sqrt(j) * 4.4; pr.seeds.push({ x: 90 + Math.cos(a2) * r2, y: 62 + Math.sin(a2) * r2 }); } }
      if (I.prep === "pluck2") { pr.seeds = []; for (var q = 0; q < 7; q++) { var a3 = q * 2.39996, r3 = q ? 7 + (q % 3) * 3 : 0; pr.seeds.push({ x: 90 + Math.cos(a3) * r3, y: 70 + Math.sin(a3) * r3 }); } }
      if (I.prep === "chop") { pr.taps = 0; pr.bits = []; pr.knife = 0; }
      if (I.prep === "stem") { pr.seeds = []; for (var sq = 0; sq < 7; sq++) { var a4 = sq * 2.39996, r4 = sq ? 9 + (sq % 3) * 6 : 0; pr.seeds.push({ x: 82 + Math.cos(a4) * r4 * 1.5, y: 100 + Math.sin(a4) * r4 * .5 }); } }
    }
    // the knife held sideways: the blade points the way it moves
    function knifeH(x, y, dir) { var im = TIMG.knife_h; if (!im || !im.complete) return; c.save(); c.translate(Math.round(x), Math.round(y)); if (dir < 0) c.scale(-1, 1); c.drawImage(im, -40, -5); c.restore(); }
    function itemDone() { beep([[784, .05], [988, .08]]); pr.done = T; G_.pause(1100, function () { if (phase === "prep") nextItem(); }, 90, 96); }
    function drawPrep(t, dt) {
      var I = BK_ING[it.id];
      wall(); if (I.prep !== "grate") spr("board", BOARD[0], BOARD[1]);
      if (I.prep === "grate") {
        R(c, 60, 131, 62, 2, "rgba(58,36,20,.22)");
        spr("bowl25_back", 52, 90);
        (pr.pile || []).forEach(function (b) { R(c, b[0], b[1], 1, 2, b[2]); });
        spr("grater", 69, 18);
        var len = Math.max(0, Math.round(42 * (1 - pr.p))), top = pr.cy;
        if (len > 0 || pr.p < 1) { var im = TIMG.carrot; if (im && im.complete) c.drawImage(im, 0, 0, 16, 12 + len, 82, top, 16, 12 + len); }
        spr("bowl25_front", 52, 90);
        if (!pr.drag && pr.p === 0) arrow(90, top + 58, t);
        gauge(pr.p, [.97, 1], "#f08a2a");
      }
      if (I.prep === "crack") {
        shadow(80, 106, 24);
        if (pr.stage < 3) {
          spr("nut", 80, 86);
          if (pr.stage >= 1) { R(c, 88, 90, 1, 4, "#3a2414"); R(c, 89, 94, 1, 3, "#3a2414"); }
          if (pr.stage >= 2) { R(c, 92, 95, 1, 5, "#3a2414"); R(c, 85, 96, 3, 1, "#3a2414"); R(c, 93, 92, 3, 1, "#3a2414"); }
        } else spr("kernel", 84, 94);
        spr(T - pr.hit < .14 ? "mallet_d" : "mallet_u", T - pr.hit < .14 ? 82 : 92, T - pr.hit < .14 ? 62 : 48);
        if (pr.stage === 0) arrow(110, 40, t);
      }
      if (I.prep === "slice") {
        var im2 = TIMG[I.fr], w = im2.naturalWidth || 30, h = im2.naturalHeight || 30, x0 = Math.round(90 - w / 2), y0 = Math.round(102 - h / 2);
        shadow(x0 + 2, y0 + h - 1, w - 2);
        var cs = pr.cuts.slice().sort(function (a, b) { return a - b; }), sep = pr.done ? Math.min(3, (T - pr.done) * 10) : 1;
        if (I.long) {
          var ex_ = [0].concat(cs.map(function (q) { return q - x0; })).concat([w]);
          if (im2.complete) for (var v_ = 0; v_ < ex_.length - 1; v_++) { var a2_ = ex_[v_], b2_ = ex_[v_ + 1]; if (b2_ - a2_ < 1) continue; var o2 = Math.round((v_ - (ex_.length - 2) / 2) * (cs.length ? sep : 0)); c.drawImage(im2, a2_, 0, b2_ - a2_, h, x0 + a2_ + o2, y0, b2_ - a2_, h); if (v_ > 0) R(c, x0 + a2_ + o2, y0 + 3, 1, h - 6, lerpC(I.cr, "#ffffff", .4)); }
          if (pr.cuts.length < pr.need && !pr.done) { var nx = sliceNext(); for (var gy_ = y0 - 6; gy_ < y0 + h + 6; gy_ += 3) R(c, nx, gy_, 1, 2, "#fff8ec"); var down = pr.cutT && T - pr.cutT < .16; spr("knife_v", nx - 6, (down ? y0 + h - 50 : y0 - 54) + (down ? 0 : Math.round(Math.sin(t / 250) * 2))); if (!pr.cuts.length) arrow(nx + 12, y0 - 16, t); }
          else if (pr.cutT && T - pr.cutT < .16) spr("knife_v", pr.cutAt - 6, y0 + h - 50);
          gauge(pr.cuts.length / pr.need, [.97, 1], I.dc);
        } else {
        var edges = [0].concat(cs.map(function (q) { return q - y0; })).concat([h]);
        if (im2.complete) for (var s_ = 0; s_ < edges.length - 1; s_++) { var a_ = edges[s_], b_ = edges[s_ + 1]; if (b_ - a_ < 1) continue; var off = Math.round((s_ - (edges.length - 2) / 2) * (cs.length ? sep : 0)); c.drawImage(im2, 0, a_, w, b_ - a_, x0, y0 + a_ + off, w, b_ - a_); if (s_ > 0 && cs.length) R(c, x0 + Math.round(w * .22), y0 + a_ + off, Math.round(w * .56), 1, lerpC(I.cr, "#ffffff", .4)); }
        if (pr.cuts.length < pr.need && !pr.done) { var ny = sliceNext(); for (var gx_ = x0 - 6; gx_ < x0 + w + 6; gx_ += 3) R(c, gx_, ny, 2, 1, "#fff8ec"); var dn = pr.cutT && T - pr.cutT < .16; knifeH(dn ? x0 + w / 2 : x0 - 30 + Math.round(Math.sin(t / 250) * 3), ny, 1); if (!pr.cuts.length) arrow(x0 - 30, ny - 14, t); }
        gauge(pr.cuts.length / pr.need, [.97, 1], I.dc);
        }
      }
      if (I.prep === "scoop") {
        disc(c, 160, 112, 13, "#3a2414"); disc(c, 160, 112, 12, "#fffdf6"); disc(c, 160, 112, 9, "#ece6da");
        for (var k2 = 0; k2 < (pr.got || 0); k2++) spr("pkseed", 154 + (k2 * 5) % 10, 106 + Math.floor(k2 / 2) % 3 * 3);
        shadow(50, 122, 80); spr("pumpkin_half", 47, 56);
        pr.seeds.forEach(function (sd, i) { if (sd.gone) return; R(c, sd.x - 4, sd.y + 1, 8, 1, "#e8a040"); spr("pkseed", sd.x - 3, sd.y - 2); });
        if (pr.drag) spr("spoon", pr.drag[0] - 15, pr.drag[1] - 15); else if (!pr.got) { spr("spoon", 128, 60); arrow(143, 50, t); }
        gauge((pr.got || 0) / pr.seeds.length, [.97, 1], "#f6b040");
      }
      if (I.prep === "drip") {
        if (pr.hold) pr.level += dt * .32;
        var jx = 76, jy = 82, lv = Math.min(1, pr.level);
        R(c, jx - 1, jy - 1, 30, 38, "#3a2414"); R(c, jx, jy, 28, 36, "#e8f4f8"); R(c, jx, jy + 36 - Math.round(lv * 32), 28, Math.round(lv * 32), "#e8b830");
        if (lv > 0) R(c, jx, jy + 36 - Math.round(lv * 32), 28, 1, "#f6d860");
        R(c, jx + 2, jy + 2, 2, 30, "rgba(255,255,255,.7)"); R(c, jx - 2, jy - 3, 32, 3, "#3a2414"); R(c, jx - 1, jy - 2, 30, 1, "#c8ccd4");
        if (pr.spill) { R(c, jx + 27, jy, 2, 14 + Math.min(20, (T - pr.spill) * 30), "#e8b830"); R(c, jx + 24, jy + 36, 12, 2, "#e8b830"); }
        spr("comb", 61, 18 + (pr.hold ? 1 : 0));
        if (pr.hold) { for (var d = 0; d < 4; d++) { var dy = ((t / 6 + d * 7) % 26); R(c, 89, 60 + dy, 2, 3, "#e8b830"); R(c, 89, 60 + dy, 1, 1, "#fff0a0"); } R(c, 89, 58, 2, 4, "#e8b830"); }
        else if (!pr.level) arrow(90, 6, t);
        gauge(pr.level, [.75, .92], "#e8b830");
      }
      if (I.prep === "pluck" || I.prep === "pluck2") {
        disc(c, 160, 112, 13, "#3a2414"); disc(c, 160, 112, 12, "#fffdf6"); disc(c, 160, 112, 9, "#ece6da");
        for (var k3 = 0; k3 < (pr.got || 0); k3++) R(c, 154 + (k3 * 3) % 12, 108 + Math.floor(k3 / 4) * 2, 2, 2, I.prep === "pluck" ? "#5a3420" : "#f6d830");
        if (I.prep === "pluck") { R(c, 89, 100, 3, 28, "#3e7a38"); spr("sunflower_head", 52, 24); pr.seeds.forEach(function (sd) { if (!sd.gone) spr("sseed", sd.x - 3, sd.y - 3); }); }
        else { R(c, 89, 92, 2, 34, "#3e7a38"); spr("dandelion_head", 64, 44); pr.seeds.forEach(function (sd) { if (!sd.gone) spr("tuft", sd.x - 6, sd.y - 6); }); }
        if (!pr.got) { var s0 = pr.seeds.filter(function (q) { return !q.gone; })[0]; if (s0) arrow(s0.x, s0.y - 14, t); }
        gauge((pr.got || 0) / pr.seeds.length, [.97, 1], I.dc);
      }
      if (I.prep === "stem") {                                            // berries and cherries: one tap each, the stalk pops off, into the dish
        disc(c, 160, 112, 13, "#3a2414"); disc(c, 160, 112, 12, "#fffdf6"); disc(c, 160, 112, 9, "#ece6da");
        for (var k5 = 0; k5 < (pr.got || 0); k5++) spr("b_" + it.id, 152 + (k5 * 5) % 12, 103 + Math.floor(k5 / 3) * 4);
        pr.seeds.forEach(function (sd) { if (sd.gone) return; shadow(sd.x - 3, sd.y + 4, 7); spr("b_" + it.id, sd.x - 4, sd.y - 4); R(c, sd.x, sd.y - 6, 1, 2, "#5aa04e"); R(c, sd.x + 1, sd.y - 7, 2, 1, "#7cc06a"); });
        if (!pr.got) { var s1 = pr.seeds.filter(function (q) { return !q.gone; })[0]; if (s1) arrow(s1.x, s1.y - 16, t); }
        gauge((pr.got || 0) / pr.seeds.length, [.97, 1], I.dc);
      }
      if (I.prep === "chop") {
        var k4 = pr.taps / 14;
        shadow(64, 108, 52);
        if (k4 < 1) { c.globalAlpha = 1 - k4 * .85; spr("herbs", 62, 72); c.globalAlpha = 1; }
        pr.bits.forEach(function (b) { R(c, b[0], b[1], 2, 1, b[2]); });
        if (T - pr.knife < .12) spr("knife_v", pr.kx - 6, 64); else spr("knife_v", (pr.kx || 120) - 6, 44);
        if (!pr.taps) arrow(90, 50, t);
        gauge(k4, [.97, 1], "#5aa04e");
      }
      stepParts(dt);
    }
    function prepDown(p) {
      var I = BK_ING[it.id]; if (pr.done) return;
      if (I.prep === "grate") { pr.drag = p[1]; return; }
      if (I.prep === "crack") {
        pr.hit = T; pr.stage++; beep([[200 + pr.stage * 60, .05]]);
        if (pr.stage === 3) { for (var i = 0; i < 10; i++) parts.push({ x: 90, y: 96, vx: (Math.random() - .5) * 120, vy: -60 - Math.random() * 60, col: i % 2 ? "#b07a44" : "#8a5a30", w: 3, h: 2, life: 1.2, floor: 120 }); itemDone(); }
        return;
      }
      if (I.prep === "slice") { sliceTap(); return; }
      if (I.prep === "scoop") { pr.drag = p; scoopAt(p); return; }
      if (I.prep === "drip") { if (pr.level < 1) { pr.hold = true; } return; }
      if (I.prep === "pluck" || I.prep === "pluck2") {
        var sd = pr.seeds.filter(function (q) { return !q.gone && Math.hypot(q.x - p[0], q.y - p[1]) < 7; })[0]; if (!sd) return;
        sd.gone = true; beep([[900 + Math.random() * 200, .03]]);
        fly(I.prep === "pluck" ? "sseed" : "tuft", sd.x, sd.y, 160, 110, function () { pr.got = (pr.got || 0) + 1; if (pr.got >= pr.seeds.length) itemDone(); });
        return;
      }
      if (I.prep === "stem") {
        var sd2 = pr.seeds.filter(function (q) { return !q.gone && Math.hypot(q.x - p[0], q.y - p[1]) < 8; })[0]; if (!sd2) return;
        sd2.gone = true; beep([[820 + Math.random() * 200, .03]]); burst(sd2.x, sd2.y - 6, "#5aa04e", 3, 30);
        fly("b_" + it.id, sd2.x, sd2.y, 160, 110, function () { pr.got = (pr.got || 0) + 1; if (pr.got >= pr.seeds.length && !pr.done) itemDone(); });
        return;
      }
      if (I.prep === "chop") {
        pr.knife = T; pr.kx = Math.max(64, Math.min(116, p[0])); pr.taps++; beep([[500 + Math.random() * 80, .025]]);
        for (var b = 0; b < 5; b++) pr.bits.push([pr.kx - 8 + Math.random() * 18, 96 + Math.random() * 14, ["#5aa04e", "#86c870", "#3e7a38"][b % 3]]);
        if (pr.taps >= 14) itemDone();
      }
    }
    function scoopAt(p) {
      pr.seeds.forEach(function (sd) {
        if (sd.gone || Math.hypot(sd.x - p[0], sd.y - p[1]) > 8) return; sd.gone = true; beep([[600 + Math.random() * 200, .02]]);
        fly("pkseed", sd.x, sd.y, 160, 110, function () { pr.got = (pr.got || 0) + 1; if (pr.got >= pr.seeds.length && !pr.done) itemDone(); });
      });
    }
    function prepMove(p) {
      var I = BK_ING[it.id]; if (pr.done) return;
      if (I.prep === "grate" && pr.drag != null) {
        var ny = Math.max(-10, Math.min(56, pr.cy + (p[1] - pr.drag))), dy = Math.abs(ny - pr.cy); pr.drag = p[1]; pr.cy = ny;
        var tip = ny + 12 + Math.round(42 * (1 - pr.p));
        if (tip > 28 && tip < 96 && dy > 0) {
          pr.p = Math.min(1, pr.p + dy / 300);
          if (Math.random() < .6) { for (var g_ = 0; g_ < 8; g_++) { var bx = 90 + (Math.random() - .5) * 52, by = 99 + (Math.random() - .5) * 10 - pr.p * 3; if (Math.pow((bx - 90) / 30, 2) + Math.pow((by - 100) / 6, 2) <= 1) { pr.pile.push([bx, by, Math.random() < .5 ? "#f08a2a" : "#ffb060"]); break; } } if (Math.random() < .2) beep([[1400 + Math.random() * 300, .01]]); }
          if (pr.p >= 1) { pr.drag = null; itemDone(); }
        }
        return;
      }

      if (I.prep === "scoop" && pr.drag) { pr.drag = p; scoopAt(p); }
    }
    function prepUp(p) {
      var I = BK_ING[it.id];
      if (I.prep === "grate") pr.drag = null;
      if (I.prep === "scoop") pr.drag = null;
      if (I.prep === "drip" && pr.hold) {
        pr.hold = false;
        if (pr.level >= .75) { pr.good = pr.level <= .92; if (pr.level > 1) pr.spill = pr.spill || T; itemDone(); }
      }
      if (I.prep === "slice" && pr.sw) {
        var im2 = TIMG[I.fr], w = im2.naturalWidth || 30, h = im2.naturalHeight || 30, x0 = Math.round(90 - w / 2), y0 = Math.round(102 - h / 2), s0 = pr.sw, cy = Math.round((s0[1] + p[1]) / 2);
        pr.sw = null; pr.knife = 0;
        if (I.long) {
          var cx = Math.round((s0[0] + p[0]) / 2);
          if (p[1] - s0[1] >= h * .7 && s0[1] < y0 + h * .4 && p[1] > y0 + h * .6 && Math.abs(p[0] - s0[0]) < 14 && cx > x0 + 3 && cx < x0 + w - 3 && pr.cuts.every(function (q) { return Math.abs(q - cx) > 3; })) {
            pr.cuts.push(cx); beep([[1200, .02], [800, .03]]); burst(cx, y0 + h / 2, I.cr, 3, 20); if (pr.cuts.length >= pr.need) itemDone();
          }
          return;
        }
        var lo = Math.min(s0[0], p[0]), hi = Math.max(s0[0], p[0]);
        if (lo < x0 + w * .25 && hi > x0 + w * .75 && Math.abs(p[1] - s0[1]) < 14 && cy > y0 + 3 && cy < y0 + h - 3 && pr.cuts.every(function (q) { return Math.abs(q - cy) > 3; })) {
          pr.cuts.push(cy); beep([[1200, .02], [800, .03]]); burst(x0 + w / 2, cy, I.cr, 3, 20);
          if (pr.cuts.length >= pr.need) itemDone();
        }
      }
    }
    // slicing like in the house kitchen: a dashed line shows where the next cut goes, a tap anywhere cuts there
    function sliceGeo() { var I = BK_ING[it.id], im2 = TIMG[I.fr], w = im2.naturalWidth || 30, h = im2.naturalHeight || 30; return { w: w, h: h, x0: Math.round(90 - w / 2), y0: Math.round(102 - h / 2) }; }
    function sliceNext() { var I = BK_ING[it.id], g = sliceGeo(), n = pr.need, k = pr.cuts.length + 1; return I.long ? g.x0 + Math.round(g.w * k / (n + 1)) : g.y0 + Math.round(g.h * k / (n + 1)); }
    function sliceTap() {
      if (pr.done || pr.cutT && T - pr.cutT < .18 || pr.cuts.length >= pr.need) return;
      var I = BK_ING[it.id], g = sliceGeo(), q = sliceNext(); pr.cutT = T; pr.cutAt = q;
      pr.cuts.push(q); beep([[1200, .02], [800, .03]]); burst(I.long ? q : g.x0 + g.w / 2, I.long ? g.y0 + g.h / 2 : q, I.cr, 3, 20);
      if (pr.cuts.length >= pr.need) setTimeout(function () { if (pr && !pr.done) itemDone(); }, 220);
    }
    // ================= 2b: grinding sunflower kernels to flour on the hand mill (turn the peg in circles)
    var MC = [90, 70];
    function drawMill(t, dt) {
      wall(); spr("board", BOARD[0], BOARD[1]);
      var k = Math.min(1, mill / (6 * Math.PI)), pa = mTurn;
      // the flour heap in front of the spout
      var hr = 2 + k * 11; R(c, 128, 113, Math.round(hr * 2) + 2, 2, "rgba(58,36,20,.2)");
      c.fillStyle = "#fffaf0"; c.beginPath(); c.ellipse(130 + hr, 110, hr + 1, 3 + k * 3, 0, 0, 2 * Math.PI); c.fill();
      c.fillStyle = "#ffffff"; c.beginPath(); c.ellipse(128 + hr, 108 - k * 2, hr * .5, 1.5 + k, 0, 0, 2 * Math.PI); c.fill();
      spr("quern_bottom", MC[0] - 38, MC[1] + 2);
      if (k > 0 && k < 1 && mAng != null) for (var q = 0; q < 3; q++) R(c, 126 + (q * 3 + Math.floor(t / 60)) % 6, 94 + ((q * 5 + Math.floor(t / 40)) % 12), 1, 1, "#ffffff");
      spr("quern_top", MC[0] - 31, MC[1] - 7);
      // kernels around the hole that disappear while grinding, grooves that turn with the stone
      for (var g_ = 0; g_ < 6; g_++) { var ga = pa + g_ * Math.PI / 3; R(c, MC[0] + Math.cos(ga) * 15, MC[1] + 1 + Math.sin(ga) * 3.6, 2, 1, "#7a7266"); }
      for (var s_ = 0; s_ < 12; s_++) { if (s_ / 12 < k) continue; var sa = s_ * 2.4, sr = 7 + (s_ % 3) * 2; spr("sseed", MC[0] + Math.cos(sa) * sr - 3, MC[1] + 1 + Math.sin(sa) * sr * .3 - 4); }
      // the wooden peg handle
      var px = MC[0] + Math.cos(pa) * 22, py = MC[1] + 1 + Math.sin(pa) * 5.5;
      R(c, px - 2, py - 14, 5, 15, "#3a2414"); R(c, px - 1, py - 13, 3, 14, "#c8905a"); R(c, px - 1, py - 13, 1, 14, "#e2b276"); disc(c, px, py - 15, 3, "#3a2414"); disc(c, px, py - 15, 2, "#a8703c"); R(c, px - 1, py - 16, 1, 1, "#e2b276");
      if (!mill && mAng == null) arrow(px, py - 30, t);
      gauge(k, [.97, 1], "#fffaf0");
    }
    // ================= 3: eggs over the bowl
    function newEgg() { egg = { f: 0, hold: false, crack: false, open: 0 }; }
    function drawEgg(t, dt) {
      wall();
      shadow(24, 120, 96); disc(c, 70, 72, 37, "#f6ead0");
      yolks.forEach(function (y) { spr("yolk", y[0] - 6, y[1] - 6); });
      shards.forEach(function (s) { R(c, s.x - 1, s.y - 1, 5, 4, "#3a2414"); R(c, s.x, s.y, 3, 2, "#fff6e8"); R(c, s.x, s.y, 1, 1, "#ffffff"); });
      spr("bowl", 20, 22);
      if (egg) {
        if (egg.hold) egg.f = Math.min(1.05, egg.f + dt * .85);
        var shake = egg.hold ? Math.round(Math.sin(t / 30) * egg.f * 2) : 0;
        if (!egg.open) {
          spr("egg", 122 + shake, 40);
          if (egg.crack) { R(c, 128 + shake, 52, 3, 1, "#8a7a64"); R(c, 131 + shake, 51, 2, 1, "#8a7a64"); R(c, 133 + shake, 52, 2, 1, "#8a7a64"); }
          if (!egg.hold && !egg.f && !egg.crack) arrow(131, 28, t);
        } else {
          var u = Math.min(1, (T - egg.open) / .5);
          spr("egg_top", 122 - u * 6, 38 - u * 10); spr("egg_bot", 122 + u * 6, 52 + u * 4);
        }
        gauge(egg.f, [.45, .75], "#f6b830");
      } else noGauge();
      stepParts(dt);
    }
    function eggUp() {
      if (!egg || !egg.hold) return; egg.hold = false; var f = egg.f;
      if (f < .45 && !egg.crack) { egg.crack = true; egg.f = 0; beep([[300, .04]]); return; }
      egg.open = T; beep([[260, .04], [180, .05]]);
      var yx = 56 + Math.random() * 28, yy = 60 + Math.random() * 22;
      setTimeout(function () { yolks.push([yx, yy]); burst(yx, yy, "#fff6e8", 4, 20); }, 260);
      if (f > .75) { sEgg = 0; for (var i = 0; i < 3; i++) shards.push({ x: 50 + Math.random() * 40, y: 52 + Math.random() * 36 }); setTimeout(function () { G_.banner("Schalen rausfischen"); }, 400); }
      setTimeout(function () { eggN++; if (eggN < 2) { newEgg(); } else { egg = null; checkEggsDone(); } }, 700);
    }
    function checkEggsDone() { if (egg || shards.length || phase !== "egg") return; G_.pause(1000, function () { if (phase === "egg") { phase = "stir"; G_.banner("Teig rühren"); noGauge(); } }, 70, 72); }
    // ================= 4: stirring
    function batterCol(k) { return lerpC("#f2e6cc", lerpC(A0().sp, "#fff0d0", .12), Math.min(1, k)); }
    // the wooden spoon from the kitchen, drawn into the canvas: a thick handle widening into a hollow bowl, shaded from the top left
    function spoonC(ang, wet) {
      var G0 = { x: BC[0], y: BC[1], rx: 24, ry: 24 }, tx = G0.x + Math.cos(ang) * G0.rx, ty = G0.y + Math.sin(ang) * G0.ry, hx = 100 + (tx - 100) * 0.5, hy = 152;
      var dx = tx - hx, dy = ty - hy, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
      var BL = 18, NECK = 13, Fx = tx + ux * 6, Fy = ty + uy * 6, lit = (nx * -1 + ny * -1) > 0 ? 1 : -1, WL = BL + 1.5;
      if (wet) { for (var dd = 0; dd < BL + 1.5; dd += 0.5) { var qx = Fx - ux * dd, qy = Fy - uy * dd; if (Math.pow((qx - BC[0]) / 36, 2) + Math.pow((qy - BC[1]) / 36, 2) > 1) { WL = Math.max(4, dd); break; } } }
      function hw(d) { if (d < 0) return -1; if (d <= 8) return 5.6 * Math.sqrt(Math.max(0, 1 - Math.pow((d - 8) / 8.6, 2))); if (d <= 8 + NECK) return 2.6 + 3 * (0.5 + 0.5 * Math.cos(Math.PI * (d - 8) / NECK)); return 2.6 + 1.1 * (d - 8 - NECK) / L; }
      var x0 = Math.max(0, Math.floor(Math.min(Fx, hx) - 9)), x1 = Math.min(179, Math.ceil(Math.max(Fx, hx) + 9)), y0 = Math.max(0, Math.floor(Math.min(Fy, hy) - 9)), y1 = Math.min(140, Math.ceil(Math.max(Fy, hy) + 9));
      var W = x1 - x0 + 3, H = y1 - y0 + 3, ins = new Array(W * H), D = new Array(W * H), S = new Array(W * H);
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) { var px = x0 - 1 + x + .5 - Fx, py = y0 - 1 + y + .5 - Fy, d = -(px * ux + py * uy), sd = px * nx + py * ny, w = hw(d), i = y * W + x; D[i] = d; S[i] = w > 0 ? sd / w : 0; ins[i] = w > 0 && Math.abs(sd) <= w; }
      var WOOD = ["#7a4e28", "#a87440", "#c8945a", "#e2b276", "#f4d29c"], cache = {};
      function sub(cl) { if (!wet) return cl; return cache[cl] || (cache[cl] = lerpC(cl, wet, 0.68)); }
      function col(i) {
        var d = D[i], q = S[i] * lit, cl;
        if (d <= BL - 3 && d >= 1.6 && Math.abs(S[i]) < 0.66) { cl = q > 0.25 ? WOOD[1] : q < -0.3 ? WOOD[3] : WOOD[2]; if (q < -0.45 && d > 4 && d < 9) cl = WOOD[4]; }
        else { cl = q > 0.5 ? WOOD[3] : q > -0.15 ? WOOD[2] : q > -0.65 ? WOOD[1] : WOOD[0]; if (d > BL && q > 0.42 && q < 0.8 && (Math.floor(d) % 13) < 8) cl = WOOD[4]; if (d > BL && Math.abs(q + 0.1) < 0.22 && Math.floor(d) % 10 === 4) cl = "#946036"; }
        return d < WL ? sub(cl) : cl;
      }
      c.fillStyle = "rgba(42,18,6,.3)";
      for (var y2 = 0; y2 < H; y2++) for (var x2 = 0; x2 < W; x2++) { var j = y2 * W + x2; if (ins[j] && (!wet || D[j] > WL)) c.fillRect(x0 - 1 + x2 + 3, y0 - 1 + y2 + 3, 1, 1); }
      for (var y3 = 0; y3 < H; y3++) for (var x3 = 0; x3 < W; x3++) {
        var i3 = y3 * W + x3, X = x0 - 1 + x3, Y = y0 - 1 + y3;
        if (ins[i3]) { c.fillStyle = col(i3); c.fillRect(X, Y, 1, 1); }
        else if ((x3 > 0 && ins[i3 - 1]) || (x3 < W - 1 && ins[i3 + 1]) || (y3 > 0 && ins[i3 - W]) || (y3 < H - 1 && ins[i3 + W])) { var n3 = (x3 > 0 && ins[i3 - 1]) ? i3 - 1 : (x3 < W - 1 && ins[i3 + 1]) ? i3 + 1 : (y3 > 0 && ins[i3 - W]) ? i3 - W : i3 + W; c.fillStyle = D[n3] < WL ? sub("#3a2414") : "#3a2414"; c.fillRect(X, Y, 1, 1); }
      }
      if (wet) { var cx = Fx - ux * WL, cy = Fy - uy * WL, hi = lerpC(wet, "#ffffff", 0.45); for (var yy = Math.floor(cy - 4); yy <= cy + 4; yy++) for (var xx = Math.floor(cx - 8); xx <= cx + 8; xx++) { var v = Math.pow((xx + .5 - cx) / 7, 2) + Math.pow((yy + .5 - cy) / 3, 2); if (v <= 1 && v > .55) { c.fillStyle = hi; c.fillRect(xx, yy, 1, 1); } } }
    }
    // stirring: flour, yolks and the prepared ingredients turn into one smooth, shiny batter
    var LUMPS = null;
    function drawStir(t) {
      wall();
      // smooth: the spoon eases towards the finger, everything in the bowl turns with the total amount stirred
      var k = Math.min(1, stir / (10 * Math.PI)), col = batterCol(k), ids = units();
      if (ang != null) { var dd = ang - spA; while (dd > Math.PI) dd -= 2 * Math.PI; while (dd < -Math.PI) dd += 2 * Math.PI; spA += dd * .35; }
      var A_ = spA;
      if (!LUMPS) { LUMPS = []; for (var i = 0; i < 26; i++) { var r = 5 + (i * 11) % 28, a = i * 2.39; LUMPS.push({ r: r, a: a, id: ids[i % ids.length], fl: i % 3 === 0 }); } }
      R(c, BC[0] - 44, BC[1] + 47, 90, 3, "rgba(58,36,20,.22)");
      // the batter with depth: the rim shades the top-left edge, the far side catches the light
      for (var y = -37; y <= 37; y++) for (var x = -37; x <= 37; x++) {
        var d = Math.hypot(x + .5, y + .5); if (d > 37) continue;
        var nxy = (x + y) / (d || 1), cl = col;
        if (d > 29 && nxy < -.2) cl = lerpC(col, "#5a3a20", .22 * (d - 29) / 8);
        else if (d > 31 && nxy > .6) cl = lerpC(col, "#ffffff", .14);
        else if (d < 26 && d > 22 && nxy < -.5) cl = lerpC(col, "#ffffff", .1 + .15 * k);
        c.fillStyle = cl; c.fillRect(BC[0] + x, BC[1] + y, 1, 1);
      }
      // unmixed flour and yolk streaks fade as it gets stirred
      if (k < .85) { c.globalAlpha = 1 - k / .85; yolks.forEach(function (yk, j) { var a = j * 2 + sAng * .6, r = 12 + j * 6; c.fillStyle = "#f6c850"; c.beginPath(); c.ellipse(BC[0] + Math.cos(a) * r, BC[1] + Math.sin(a) * r, 6 - k * 3, 4, a, 0, 2 * Math.PI); c.fill(); c.fillStyle = "#ffe080"; c.fillRect(BC[0] + Math.cos(a) * r - 2, BC[1] + Math.sin(a) * r - 2, 2, 1); }); c.globalAlpha = 1; }
      LUMPS.forEach(function (L_, j) {
        var a = L_.a + sAng * (1.05 - L_.r / 40), r = L_.r * (1 - k * .25), x = Math.round(BC[0] + Math.cos(a) * r), y = Math.round(BC[1] + Math.sin(a) * r);
        if (L_.fl) { if (k < .7) { c.globalAlpha = 1 - k / .7; R(c, x - 2, y - 1, 5, 3, "#fffaf0"); R(c, x - 1, y - 2, 3, 1, "#ffffff"); c.globalAlpha = 1; } return; }
        var I = BK_ING[L_.id], sz = k < .5 ? 3 : 2;
        if (k < .9 || j % 3 === 1) { R(c, x - 1, y - 1, sz + 1, sz + 1, lerpC(I.dc, "#3a2414", .45)); R(c, x - 1, y - 1, sz, sz, I.dc); R(c, x - 1, y - 1, 1, 1, lerpC(I.dc, "#ffffff", .5)); }
      });
      // each ingredient leaves a coloured streak that winds in and fades as it mixes
      if (k < .95) { c.globalAlpha = .55 * (1 - k); ids.forEach(function (id, j) { var dc = BK_ING[id].dc; for (var q2 = 0; q2 < 40; q2++) { var a3 = sAng * .8 + j * 2.1 + q2 * .12, r3 = 6 + q2 * .62; R(c, BC[0] + Math.cos(a3) * r3, BC[1] + Math.sin(a3) * r3, 2, 2, dc); } }); c.globalAlpha = 1; }
      // the swirl behind the spoon: a light and a dark band
      for (var q = 0; q < 60; q++) { var a2 = A_ - q * .09, r2 = 6 + q * .45; R(c, BC[0] + Math.cos(a2) * r2, BC[1] + Math.sin(a2) * r2, 2, 1, lerpC(col, "#ffffff", .3)); R(c, BC[0] + Math.cos(a2 + .25) * (r2 + 2), BC[1] + Math.sin(a2 + .25) * (r2 + 2), 2, 1, lerpC(col, "#5a3a20", .18)); }
      if (k > .5) { c.globalAlpha = (k - .5) * 1.2; c.fillStyle = "#ffffff"; c.beginPath(); c.ellipse(BC[0] - 12, BC[1] - 14, 9, 3, -.5, 0, 2 * Math.PI); c.fill(); c.globalAlpha = 1; }
      spr("bowl", BC[0] - 50, BC[1] - 50);
      spoonC(A_, col);
      if (ang == null && stir === 0) arrow(BC[0] + Math.cos(A_) * 24, BC[1] + Math.sin(A_) * 24 - 16, t);
      gauge(k, [.97, 1], col);
    }
    // ================= 5: pouring into the tin
    var BWC = [58, 48], FR = [0, 0, .2, .38];
    function lip(i) { var a = [0, 18, 36, 54][i] * Math.PI / 180; return [BWC[0] + 26 * Math.cos(a) + 12 * Math.sin(a), BWC[1] + 26 * Math.sin(a) - 12 * Math.cos(a)]; }
    function drawFill(t, dt) {
      wall(); spr("board", BOARD[0], BOARD[1]);
      var fi = Math.min(3, Math.round(tilt * 3)), L = lip(fi), col = batterCol(1);
      if (phase === "fill" && FR[fi] > 0) { fill += FR[fi] * dt; if (fill > 1 && !spill) { spill = T; sFill = 0; } }
      // the round tin, seen a little from above: inside first, then the batter rising in it, then the front wall
      var TX = 62, TY = 78, CXT = TX + 43, lvf = Math.min(1, fill), sy = Math.round(TY + 29 - lvf * 16);
      R(c, TX + 6, TY + 39, 76, 2, "rgba(58,36,20,.22)");
      spr("tin_back", TX, TY);
      if (lvf > 0) {
        c.save(); c.beginPath(); c.ellipse(CXT, TY + 11, 37, 7.5, 0, 0, 2 * Math.PI); c.rect(TX - 4, TY + 11, 94, 30); c.clip();
        c.fillStyle = col; c.beginPath(); c.ellipse(CXT, sy, 36, 7.5, 0, 0, 2 * Math.PI); c.fill();
        c.fillStyle = lerpC(col, "#ffffff", .3); c.beginPath(); c.ellipse(CXT - 8, sy - 2, 14, 2.5, 0, 0, 2 * Math.PI); c.fill();
        c.fillStyle = lerpC(col, "#3a2414", .15); c.fillRect(CXT - 36, sy, 72, Math.max(0, TY + 37 - sy));
        c.restore();
      }
      if (FR[fi] > 0 && phase === "fill") { var top = Math.round(L[1]), bot = sy - 2; for (var y = top; y < bot; y++) R(c, Math.round(L[0] + Math.sin((y + t / 20) / 4) * .6), y, 3, 1, y % 3 ? col : lerpC(col, "#ffffff", .25)); var hit = L[0] + 1; R(c, hit - 3, bot, 8, 2, lerpC(col, "#ffffff", .2)); }
      spr("tin_front", TX, TY);
      if (spill) { var sl = Math.min(16, (T - spill) * 24); R(c, TX + 12, TY + 17, 3, sl, col); R(c, TX + 70, TY + 18, 3, sl * .8, col); }
      spr("bowl_t" + fi, BWC[0] - 35, BWC[1] - 35);
      if (!tilt && !fill) arrow(BWC[0], BWC[1] - 32, t);
      gauge(fill, [.8, .95], col);
      if (phase === "fill" && fill >= 1.05) endFill();
    }
    function endFill() {
      if (phase !== "fill") return; phase = "filled"; tilt = 0;
      sFill = !spill && fill >= .8 && fill <= .95 ? 1 : 0;
      G_.banner(sFill ? "Genau richtig!" : spill ? "Etwas übergeschwappt" : "Passt schon"); beep([[523, .05], [659, .05]]); G_.spark(105, 92); G_.hold(900);
      // the hamster carries the tin over to the oven and pushes it in; then back to the close-up
      setTimeout(function () {
        if (phase !== "filled") return; phase = "carry"; G_.el.style.visibility = "hidden";
        cfGlide(cfScroll.scrollWidth - cfScroll.clientWidth, 700);
        cfHamJob(function () {
          cfHold('<image href="' + BK_ART.tin_s + '" width="18" height="9" style="image-rendering:pixelated"/>', 18, 9);
          return cfHamGo([408, 114]).then(function () { if (phase !== "carry") return; say(N() + " schiebt den Teig in den Ofen."); return cfWait(350); }).then(function () { cfHold(""); cfHamSet({ paws: "up", eyes: "happy", mouth: "grin" }); beep([[392, .06], [523, .06]]); return cfWait(500); }).then(function () { cfHamSet({}); });
        }).then(function () { if (phase !== "carry") return; G_.el.style.visibility = ""; phase = "bake"; oven = 0; ovenIn = 0; G_.banner("Ab in den Ofen!"); });
      }, 900);
    }
    // ================= 6: the oven
    function cakeCol(k) { var b = A0().sp; return k < .55 ? lerpC(lerpC(b, "#ffffff", .4), b, k / .55) : lerpC(b, "#5a3018", (k - .55) / .45); }
    function drawOven(t, dt) {
      wall();
      if (phase === "bake") oven = Math.min(1.05, oven + dt / 8);
      ovenIn = phase === "bake" ? Math.min(1, ovenIn + dt * 2.5) : phase === "out" ? Math.max(0, ovenIn - dt * 2.5) : ovenIn;
      var OX = 24, OY = 22;
      var fcOven = typeof CF_THEME_NOW !== "undefined" && CF_THEME_NOW === "firstclass" && TIMG.oven_fc;
      c.save(); c.beginPath(); if (fcOven) c.rect(OX + 28, OY + 44, 77, 47); else c.ellipse(OX + 66, OY + 92, 36, 52, 0, Math.PI, 2 * Math.PI); c.closePath(); c.clip();
      R(c, OX + 26, OY + 38, 80, 56, "#24180f");
      c.fillStyle = "rgba(255,150,50,.25)"; c.fillRect(OX + 26, OY + 60, 80, 34);
      for (var f = 0; f < 6; f++) { var fx = OX + 36 + f * 12, h = 8 + ((Math.floor(t / 120) + f) % 3) * 3; R(c, fx, OY + 76 - h, 5, h, "#e8554a"); R(c, fx + 1, OY + 78 - h + 3, 3, h - 3, "#f6a030"); R(c, fx + 2, OY + 78 - h + 6, 1, h - 6, "#ffe060"); }
      var tx = OX + 38, ty = OY + 80 + Math.round((1 - ovenIn) * 24), rise = Math.round(4 + Math.min(1, oven) * 12), cc = cakeCol(oven);
      R(c, tx - 1, ty - 1, 58, 13, "#3a2414"); R(c, tx, ty, 56, 11, "#8a909a"); R(c, tx, ty, 56, 2, "#c8ccd4"); R(c, tx, ty + 9, 56, 2, "#5a606a");
      for (var cx_ = 0; cx_ < 52; cx_++) { var u = (cx_ - 26) / 26, hh = Math.round(rise * Math.sqrt(Math.max(0, 1 - u * u * .7))); R(c, tx + 2 + cx_, ty - hh - 1, 1, hh + 2, "#3a2414"); R(c, tx + 2 + cx_, ty - hh, 1, hh + 1, cc); R(c, tx + 2 + cx_, ty - hh, 1, 1, lerpC(cc, "#ffffff", .35)); if (cx_ % 9 === 4 && oven > .3) R(c, tx + 2 + cx_, ty - hh + 3, 2, 1, lerpC(cc, "#3a2414", .3)); }
      c.fillStyle = "rgba(255,140,40," + (.12 + .06 * Math.sin(t / 200)) + ")"; c.fillRect(OX + 26, OY + 40, 80, 56);
      c.restore();
      spr(fcOven ? "oven_fc" : "oven", OX, OY);
      if (phase === "bake" && oven > .2) arrow(OX + 66, OY + 28, t);
      gauge(oven, [.55, .75], cakeCol);
      if (phase === "bake" && oven >= 1.05) takeOut();
    }
    function takeOut() {
      if (phase !== "bake") return; phase = "out";
      sBake = oven >= .55 && oven <= .75 ? 1 : 0;
      G_.banner(sBake ? "Goldbraun!" : oven < .55 ? "Noch etwas hell" : "Etwas dunkel geworden"); beep([[523, .05], [659, .05]]); G_.spark(90, 100); G_.hold(1300);
      setTimeout(function () { if (phase === "out") { phase = "deco"; noGauge(); G_.banner("Verzieren"); } }, 1300);
    }
    // ================= 7: decorating, 8: cutting
    var TRAY = [{ x: 3, y: 16 }, { x: 3, y: 54 }, { x: 3, y: 92 }];
    function topList() { var o = []; units().forEach(function (id) { if (id !== "creme" && o.indexOf(BK_ING[id].top) < 0) o.push(BK_ING[id].top); }); o.push("t_sahne"); return o.slice(0, 3); }
    function cakeTop(ox, oy) {
      var X = PC[0] + ox, Y = PC[1] + oy, f = A1().cr;
      disc(c, X, Y, CRK + 1, "#3a2414"); disc(c, X, Y, CRK, cakeCol(Math.max(.4, Math.min(.9, oven))));
      disc(c, X, Y, CRK - 3, f); disc(c, X - 6, Y - 7, 8, lerpC(f, "#ffffff", .25));
      for (var k = 0; k < 24; k++) { var a = k * Math.PI / 12; R(c, X + Math.cos(a) * (CRK - 2), Y + Math.sin(a) * (CRK - 2), 2, 2, lerpC(f, "#ffffff", .4)); }
      tops.forEach(function (tp) { spr(tp.k, tp.x - 5 + ox, tp.y - 5 + oy); });
    }
    function drawDeco(t) {
      wall(); R(c, 0, 0, 180, 135, "rgba(58,36,20,.12)");
      spr("plate", PC[0] - 55, PC[1] - 52);
      disc(c, PC[0] + 1, PC[1] + 2, CRK + 1, "rgba(58,36,20,.25)");
      var sep = cuts.length >= 2 ? Math.min(3, (T - cuts.t2) * 8) : 0;
      if (cuts.length >= 2) {
        // four pieces, pulled a little apart
        var a1 = cuts[0], a2 = cuts[1], ang4 = [a1, a2, a1 + Math.PI, a2 + Math.PI].sort(function (p, q) { return ((p % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) - ((q % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); });
        ang4 = ang4.map(function (a) { return ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); });
        for (var i = 0; i < 4; i++) {
          var s0 = ang4[i], s1 = i < 3 ? ang4[i + 1] : ang4[0] + 2 * Math.PI, mid = (s0 + s1) / 2, ox = Math.round(Math.cos(mid) * sep), oy = Math.round(Math.sin(mid) * sep);
          c.save(); c.beginPath(); c.moveTo(PC[0] + ox, PC[1] + oy); for (var q = 0; q <= 8; q++) { var aa = s0 + (s1 - s0) * q / 8; c.lineTo(PC[0] + ox + Math.cos(aa) * 50, PC[1] + oy + Math.sin(aa) * 50); } c.closePath(); c.clip();
          cakeTop(ox, oy); c.restore();
        }
      } else {
        cakeTop(0, 0);
        cuts.forEach(function (a) { for (var r = -CRK; r <= CRK; r++) R(c, PC[0] + Math.cos(a) * r, PC[1] + Math.sin(a) * r, 1, 1, "#3a2414"); });
      }
      if (phase === "deco") {
        topList().forEach(function (k, i) { var d = TRAY[i]; disc(c, d.x + 18, d.y + 18, 17, "#3a2414"); disc(c, d.x + 18, d.y + 18, 16, "#fffdf6"); disc(c, d.x + 18, d.y + 18, 13, "#ece6da"); for (var q = 0; q < 4; q++) spr(k, d.x + 8 + (q % 2) * 10, d.y + 8 + Math.floor(q / 2) * 9); });
        if (drag) spr(drag.k, drag.x - 5, drag.y - 5);
        if (!tops.length) arrow(22, 6, t);
        if (tops.length >= 3) { var on = Math.floor(t / 400) % 2; R(c, PC[0] + 44, PC[1] + 30 + on, 3, 3, "#f6c84a"); }
      }
      if (phase === "cut") {
        if (swipe && swipe.p) { var dx = swipe.p[0] - swipe.s[0], dy = swipe.p[1] - swipe.s[1], n = Math.max(1, Math.hypot(dx, dy)); for (var k2 = 0; k2 < n; k2 += 2) R(c, swipe.s[0] + dx * k2 / n, swipe.s[1] + dy * k2 / n, 1, 1, "#ffffff"); spr("knife_v", swipe.p[0] - 6, swipe.p[1] - 50); }
        else if (!cuts.length) { var ww = Math.round((t / 20) % 70); R(c, PC[0] - 35 + ww, PC[1] - 36, 2, 2, "#f6c84a"); arrow(PC[0], PC[1] - 48, t); }
        gauge(cuts.length / 2, [.97, 1], "#e8c088");
      }
      if (phase === "done") starsAt(c, stars, PC[0], 126);
      stepParts(0);
    }
    function cutUp(p) {
      if (!swipe) return; var s0 = swipe.s; swipe = null;
      var dx = p[0] - s0[0], dy = p[1] - s0[1], L = Math.hypot(dx, dy); if (L < CRK * 1.3) return;
      var off = Math.abs((PC[0] - s0[0]) * dy - (PC[1] - s0[1]) * dx) / L; if (off > 12) return;
      var a = Math.atan2(dy, dx); if (a < 0) a += Math.PI; if (a >= Math.PI) a -= Math.PI;
      if (cuts.length && Math.abs(Math.sin(a - cuts[0])) < .5) { G_.banner("Quer dazu schneiden"); return; }
      cuts.push(a); cuts["o" + cuts.length] = off; beep([[1100, .02], [700, .04]]);
      if (cuts.length === 2) { cuts.t2 = T; G_.spark(PC[0], PC[1], 10, 26); G_.hold(1000); sCut = Math.abs(Math.cos(cuts[0] - cuts[1])) < .3 && cuts.o1 < 6 && cuts.o2 < 6 ? 1 : 0; G_.banner(sCut ? "Vier gleiche Stücke!" : "Vier Stücke"); setTimeout(finish, 900); }
    }
    function finish() {
      if (phase !== "cut") return; phase = "done"; noGauge();
      var goods = sEgg + sFill + sBake + sCut; stars = goods >= 4 ? 3 : goods >= 2 ? 2 : 1;
      ckUse(key); deliver = key;
      var B = ckBook(), isNew = !B[key]; B[key] = { n: ckName(key), c: A0().sp, s: Math.max(stars, (B[key] || {}).s || 0), t: isNew ? Date.now() : B[key].t };
      if (window.SudokuSave) window.SudokuSave();
      G_.banner(isNew ? "Neu im Kuchenbuch: " + ckName(key) + "!" : ckName(key) + " ist fertig!");
      beep(stars === 3 ? [[1047, .1], [1319, .1], [1568, .22]] : [[880, .12], [1047, .2]]);
      cfHamSet({ paws: "up", eyes: "happy", mouth: "grin" }); setTimeout(function () { cfHamSet({}); }, 1400);
      setTimeout(function () { G_.el.addEventListener("pointerdown", function () { G_.close(); }, { once: true }); }, 700);
    }
    function draw(t) {
      var dt = Math.min(.05, (t - last) / 1000); last = t; T += dt;
      if (phase === "pick") { drawPick(t); stepParts(dt); }
      else if (phase === "prep") drawPrep(t, dt);
      else if (phase === "egg") drawEgg(t, dt);
      else if (phase === "mill") drawMill(t, dt);
      else if (phase === "stir") drawStir(t);
      else if (phase === "fill" || phase === "filled") drawFill(t, dt);
      else if (phase === "bake" || phase === "out") drawOven(t, dt);
      else drawDeco(t);
      if (phase !== "gone") raf = requestAnimationFrame(draw);
    }
    G_.cv.addEventListener("pointerdown", function (e) {
      e.preventDefault(); var p = pt(e); try { G_.cv.setPointerCapture(e.pointerId); } catch (er) {}
      if (phase === "pick") {
        if (p[0] >= BOOK[0] && p[0] <= BOOK[0] + 42 && p[1] >= BOOK[1] && p[1] <= BOOK[1] + 38) { openTeaBook(cafeEl, "cake", true); return; }
        var row = p[1] >= SHY[0] - 2 && p[1] <= SHY[0] + 24 ? 0 : p[1] >= SHY[1] - 2 && p[1] <= SHY[1] + 24 ? 1 : -1;
        if (row >= 0) { shDrag = { r: row, x0: p[0], s0: shScroll[row], moved: false, p: p }; return; }
        return pickRest(p);
      }
      pickOther(e, p);
    });
    function crateTap(p) {
        var cr = CRATE.filter(function (q) { var x = crateX(q); return p[0] >= x && p[0] <= x + 26 && p[1] >= q.y && p[1] <= q.y + 22; })[0];
        if (cr) {
          if (pick.length + pend.length >= 3) { G_.banner("Höchstens drei Zutaten"); beep([[220, .06]]); return; }
          var trial = pick.concat(pend).concat([cr.id]), nd = ckNeed(ckKey(trial.concat(["creme"]))), I = BK_ING[cr.id];
          if (ckHave(I.h) < nd[I.h]) { G_.banner(ckHave(I.h) ? "Nicht genug " + I.n : "Keine " + I.n + " da"); beep([[220, .06]]); return; }
          beep([[700 + pick.length * 120, .04]]);
          var tq = pickPos(pick.length + pend.length), cid = cr.id; pend.push(cid);
          fly("ig_" + cid, cr.x + 16, cr.y + 11, tq[0] + 2, tq[1] - 3, function () {
            pend.splice(pend.indexOf(cid), 1); if (phase !== "pick") return; pick.push(cid); beep([[520, .03]]);
            var nowKey = ckKey(pick); G_.banner(I.n + " dazu"); setTimeout(function () { if (phase === "pick" && ckKey(pick) === nowKey) G_.banner(ckName(ckFinal(pick))); }, 900);
          }); return;
        }
    }
    function pickRest(p) {
        var ch = -1; pick.forEach(function (id, i) { var q = pickPos(i); if (Math.abs(p[0] - q[0]) < 9 && Math.abs(p[1] - q[1] + 2) < 9) ch = i; });
        if (ch >= 0) { pick.splice(ch, 1); beep([[400, .04]]); G_.banner(pick.length ? ckName(ckFinal(pick)) : ""); return; }
        if (pick.length && !pend.length && Math.abs(p[0] - BOWLP[0]) < 38 && p[1] > BOWLP[1] - 12 && p[1] < BOWLP[1] + 34) {
          if (ckList().length >= CK_MAX) { G_.banner("Die Vitrine ist schon voll"); beep([[220, .06]]); return; }
          beep([[523, .05], [659, .05], [784, .06]]); G_.pause(600, startBake, BOWLP[0], BOWLP[1]); return;
        }
    }
    function pickOther(e, p) {
      if (phase === "prep") { prepDown(p); return; }
      if (phase === "egg") {
        var sh = shards.filter(function (s) { return Math.hypot(s.x + 1 - p[0], s.y + 1 - p[1]) < 7; })[0];
        if (sh) { shards.splice(shards.indexOf(sh), 1); burst(sh.x, sh.y, "#fff6e8", 3, 30); beep([[900, .03]]); if (!shards.length && !egg) checkEggsDone(); return; }
        if (egg && !egg.open && !shards.length && p[0] > 108 && p[1] < 80) { egg.hold = true; egg.f = 0; }
        return;
      }
      if (phase === "stir") { ang = Math.atan2(p[1] - BC[1], p[0] - BC[0]); return; }
      if (phase === "mill") { mAng = Math.atan2((p[1] - MC[1]) / .3, p[0] - MC[0]); return; }
      if (phase === "fill") { tilt0 = p[1]; return; }
      if (phase === "bake") { if (oven > .1) takeOut(); return; }
      if (phase === "deco") {
        var hit = -1; topList().forEach(function (k, i) { var d = TRAY[i]; if (Math.hypot(p[0] - d.x - 18, p[1] - d.y - 18) < 18) hit = i; });
        if (hit >= 0) { if (tops.length >= 14) { G_.banner("Genug verziert"); return; } drag = { k: topList()[hit], x: p[0], y: p[1] }; return; }
        var dPlate = Math.hypot(p[0] - PC[0], p[1] - PC[1]);
        if (dPlate > CRK + 2 && dPlate < 56) { if (tops.length) { beep([[523, .05], [659, .05]]); G_.pause(700, function () { phase = "cut"; G_.banner("In vier Stücke schneiden"); }, PC[0], PC[1]); } else G_.banner("Erst etwas drauflegen"); }
        return;
      }
      if (phase === "cut") { swipe = { s: p, p: null }; }
    }
    G_.cv.addEventListener("pointermove", function (e) {
      var p = pt(e);
      if (phase === "pick" && shDrag) {                                   // swiping a shelf sideways
        var dx = p[0] - shDrag.x0; if (Math.abs(dx) > 3) shDrag.moved = true;
        if (shDrag.moved) shScroll[shDrag.r] = Math.max(0, Math.min(shMax(shDrag.r), shDrag.s0 - dx));
        return;
      }
      if (phase === "prep") { prepMove(p); return; }
      if (phase === "mill" && mAng != null) {
        var ma = Math.atan2((p[1] - MC[1]) / .3, p[0] - MC[0]), md = ma - mAng; if (md > Math.PI) md -= 2 * Math.PI; if (md < -Math.PI) md += 2 * Math.PI;
        mAng = ma; mill += Math.abs(md); mTurn += md; if (Math.random() < .1) beep([[120 + Math.random() * 40, .03]]);
        if (mill >= 6 * Math.PI) { mAng = null; beep([[784, .05], [988, .08]]); G_.pause(1100, function () { phase = "egg"; eggN = 0; newEgg(); G_.banner("Eier aufschlagen"); }, 142, 108); }
        return;
      }
      if (phase === "stir" && ang != null) {
        var a = Math.atan2(p[1] - BC[1], p[0] - BC[0]), da = a - ang; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI;
        ang = a; stir += Math.abs(da); sAng += da; if (Math.random() < .08) beep([[300 + Math.random() * 100, .02]]);
        if (stir >= 10 * Math.PI) { ang = null; beep([[392, .06], [523, .06]]); G_.pause(1100, function () { phase = "fill"; fill = 0; tilt = 0; G_.banner("In die Form füllen"); }, BC[0], BC[1]); }
        return;
      }
      if (phase === "fill" && tilt0 != null) { tilt = Math.max(0, Math.min(1, (p[1] - tilt0) / 45)); return; }
      if (phase === "cut" && swipe) { swipe.p = p; return; }
      if (drag) { drag.x = p[0]; drag.y = p[1]; }
    });
    function up(e) {
      if (phase === "gone") return; var p = e && e.clientX != null ? pt(e) : [0, 0];
      if (phase === "pick" && shDrag) { var sd_ = shDrag; shDrag = null; if (!sd_.moved && e && e.type === "pointerup") crateTap(sd_.p); return; }
      if (phase === "prep") prepUp(p);
      if (phase === "egg") eggUp();
      if (phase === "stir") ang = null;
      if (phase === "mill") mAng = null;
      if (phase === "fill") { tilt0 = null; tilt = 0; if (fill >= .8) endFill(); }
      if (phase === "cut") cutUp(p);
      if (drag) { if (Math.hypot(drag.x - PC[0], drag.y - PC[1]) < CRK - 4) { tops.push({ k: drag.k, x: drag.x, y: drag.y }); beep([[660 + tops.length * 30, .03]]); } drag = null; }
    }
    G_.cv.addEventListener("pointerup", up); G_.cv.addEventListener("pointercancel", up);
    var deliver = null;
    var _close = G_.close; G_.close = function () {
      var was = phase; phase = "gone"; cancelAnimationFrame(raf); _close();
      // the finished cake goes from the bakehouse into a glass dome on the counter
      if (deliver) {
        var k = deliver; deliver = null;
        cfGlide(Math.min(cfScroll.scrollWidth - cfScroll.clientWidth, (300 - 90) / CF.w * cfScroll.scrollWidth), 900);
        cfHamJob(function () {
          var tr = cfTray(ckPix(k, false).svg, 13, 11); cfHold(tr.svg, tr.w, tr.h, true);
          return cfHamHome().then(function () {
            var L_ = ckList(); L_.push({ k: k, n: 4 }); cfL().cakes = L_.length; cfStock(); if (window.SudokuSave) window.SudokuSave();
            if (cafeOn) { say(N() + " stellt " + ckName(k) + " unter die Glasglocke."); cfHamSet({ paws: "up", eyes: "happy", mouth: "grin" }); beep([[659, .05], [784, .05], [988, .08]]); setTimeout(function () { cfHamSet({}); }, 900); }
          });
        });
      } else if (cfHamAway()) cfHamJob(cfHamHome);
    };
    G_.el.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); G_.close(); });
    noGauge(); raf = requestAnimationFrame(draw);
    window.__bakeG = { add: function (id) { pick.push(id); }, st: function () { return { phase: phase, key: key, item: it && it.id, pr: pr && { p: pr.p, stage: pr.stage, cuts: pr.cuts && pr.cuts.length, got: pr.got, level: pr.level, taps: pr.taps }, eggN: eggN, shards: shards.length, sh: shards.map(function (q) { return [q.x + 1, q.y + 1]; }), stir: stir, fill: fill, oven: oven, tops: tops.length, cuts: cuts.length, stars: stars }; } };
  }
  window.__bake = { list: ckList, avail: ckAvail, name: ckName, can: ckCan, give: function (k, n) { garden.harvest[k] = n; }, stock: function () { cfStock(); } };
