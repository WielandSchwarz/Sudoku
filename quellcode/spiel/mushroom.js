  // ===================== mushroom hunt in the forest (preview) =====================
  // the forest is a level of its own: two clearings; tap leaves, ferns, moss, stumps, logs and grass, the hamster walks there, sniffs and digs.
  // Places with a mushroom glint now and then. A found mushroom is looked at with the loupe: into the basket or leave it?
  // The badger stops you from taking a poisonous one. Every kind goes into the mushroom book. The forest grows new ones after a few hours.
  var MG = /*MUSHGAME*/;
  var MIMG = {}; Object.keys(MG).forEach(function (k) { if (typeof MG[k] === "string" && MG[k].indexOf("data:") === 0) { var im = new Image(); im.src = MG[k]; MIMG[k] = im; } });
  var FUNGI = {}, MORDER = [];
  MG.fungi.forEach(function (q) { FUNGI[q[0]] = { n: q[1], ed: q[2], r: q[3], at: q[4], se: q[5], u: q[6], ft: q[7], hint: q[8] }; MORDER.push(q[0]); });
  // the hiding places along the 360 pixel wide floor: kind, centre x, bottom y
  var MSPOTS = [
    { t: "moos", x: 30, y: 82 }, { t: "laub", x: 62, y: 128 }, { t: "farn", x: 98, y: 86 }, { t: "stumpf", x: 136, y: 124 },
    { t: "gras", x: 170, y: 100 }, { t: "laub", x: 206, y: 84 }, { t: "holz", x: 238, y: 130 }, { t: "moos", x: 272, y: 116 },
    { t: "farn", x: 304, y: 84 }, { t: "gras", x: 334, y: 128 }, { t: "stumpf", x: 342, y: 80 }
  ];
  var FT = { steinpilz: ["Röhren weiß", "Helles Netz am Stiel"], gallen: ["Röhren rosa", "Dunkles Netz am Stiel"], maronen: ["Röhren gelb", "Brauner Hut"],
    pfiff: ["Leisten", "Dottergelb"], parasol: ["Lamellen", "Ring", "Natternmuster"], knolle: ["Weiße Lamellen", "Knolle", "Ring"], fliegen: ["Roter Hut", "Weiße Flocken"],
    tint: ["Zottelig", "Unten schwarz"], halli: ["Büschel am Holz", "Honiggelb", "Ring"], schwefel: ["Büschel am Holz", "Schwefelgelb", "Grünliche Lamellen"],
    auster: ["Wie Muscheln", "Am Holz"], morchel: ["Waben"], glucke: ["Kraus wie ein Schwamm"] };
  Object.keys(FT).forEach(function (k) { if (FUNGI[k]) FUNGI[k].ft = FT[k]; });
  // the mushroom guide: which signs mean what. It can be opened at any time, also while looking at a mushroom.
  var GUIDE = [
    { ks: ["steinpilz", "maronen"], t: "Röhren weiß oder gelb", d: "Röhrlinge wie Steinpilz und Marone sind essbar.", ed: "e" },
    { ks: ["gallen"], t: "Röhren rosa, dunkles Netz", d: "Der Gallenröhrling sieht aus wie ein Steinpilz, ist aber bitter.", ed: "u" },
    { ks: ["knolle"], t: "Weiße Lamellen und Knolle", d: "Finger weg! So sieht der Knollenblätterpilz aus.", ed: "g" },
    { ks: ["fliegen"], t: "Roter Hut, weiße Flocken", d: "Der Fliegenpilz ist giftig.", ed: "g" },
    { ks: ["pfiff"], t: "Leisten, dottergelb", d: "Leisten statt Lamellen: der Pfifferling.", ed: "e" },
    { ks: ["halli"], t: "Büschel am Holz, honiggelb, Ring", d: "Der Hallimasch, nur gut gegart essbar.", ed: "e" },
    { ks: ["schwefel"], t: "Büschel am Holz, schwefelgelb", d: "Grünliche Lamellen: der Schwefelkopf ist giftig.", ed: "g" },
    { ks: ["parasol"], t: "Schirm, Ring, Natternmuster", d: "Der Parasol, groß wie ein Schirm.", ed: "e" },
    { ks: ["tint"], t: "Zottelig, unten schwarz", d: "Der Schopftintling zerfließt zu Tinte. Jung essbar.", ed: "e" },
    { ks: ["auster"], t: "Muscheln am Holz", d: "Austernpilze wachsen sogar im Winter.", ed: "e" },
    { ks: ["morchel"], t: "Waben", d: "Die Speisemorchel, nur im Frühling.", ed: "e" },
    { ks: ["glucke"], t: "Kraus wie ein Schwamm", d: "Die Krause Glucke, selten.", ed: "e" }
  ];
  function guideFor(k) { return GUIDE.filter(function (g) { return g.ks.indexOf(k) >= 0; })[0]; }
  // big bushes in front: they hide part of the floor, so you have to look closely
  var MBUSH = [{ x: 30, y: 136, n: 0 }, { x: 112, y: 112, n: 1 }, { x: 160, y: 137, n: 2 }, { x: 222, y: 104, n: 0 }, { x: 288, y: 137, n: 1 }, { x: 356, y: 116, n: 2 }, { x: 60, y: 100, n: 2 }, { x: 318, y: 98, n: 0 }, { x: 196, y: 128, n: 1 }];
  var MU_FRESH = 3 * 3600000, MU_BAG = 15;
  function muL() { var L = life(); L.mush = L.mush || {}; var M = L.mush; M.book = M.book || {}; M.bag = M.bag || {}; M.total = M.total || 0; return M; }
  function muWet() { var w = typeof weather !== "undefined" ? weather.type : "sun"; return w === "rain" || w === "storm"; }
  function muPick(place, se) {
    var book = muL().book, pool = [];
    MORDER.forEach(function (k) { var f = FUNGI[k]; if (f.at.indexOf(place) < 0 || f.se.indexOf(se) < 0) return; var w = ({ 1: 10, 2: 3, 3: 1 })[f.r]; if (!book[k]) w *= .45; pool.push([k, w]); });
    if (!pool.length) return null;
    pool.push([null, 5]);                                // rare kinds stay rare: sometimes there is just nothing
    var tot = pool.reduce(function (a, q) { return a + q[1]; }, 0), r = Math.random() * tot;
    for (var i = 0; i < pool.length; i++) { r -= pool[i][1]; if (r <= 0) return pool[i][0]; }
    return pool[0][0];
  }
  // a fresh forest: each place has a mushroom or not; after rain and in autumn there are more
  function muScene() {
    var M = muL(), se = season();
    if (M.scene && M.scene.se === se && Date.now() - M.scene.t < MU_FRESH) return M.scene;
    var p = .38 + (muWet() ? .25 : 0) + (se === "autumn" ? .12 : 0) - (se === "winter" ? .1 : 0);
    M.scene = { t: Date.now(), se: se, items: MSPOTS.map(function (sp) { return Math.random() < p ? muPick(sp.t, se) : null; }), st: MSPOTS.map(function () { return 0; }) };   // st: 0 hidden, 1 searched, 2 taken, 3 left standing
    if (!M.scene.items.some(Boolean)) { var i = MSPOTS.findIndex(function (sp) { return muPick(sp.t, se); }); if (i >= 0) M.scene.items[i] = muPick(MSPOTS[i].t, se); }
    return M.scene;
  }
  // ---- the forest as its own level: two clearings side by side, the hamster walks to each place and sniffs ----
  var forEl = placeEl("forest"); NEWP.push("forest"); NAMES.forest = "Wald";
  var foCv = lEl("canvas", "mu-cv", forEl); foCv.width = 180; foCv.height = 135;
  var foDark = lEl("div", "l-dark", forEl);
  var foUi = lEl("div", "l-ui mu-ui", forEl);
  foUi.innerHTML = '<button type="button" class="mu-basket" data-a="basket" aria-label="Pilzvorrat"><img src="' + MG.basket + '" alt=""><span class="mu-n"></span></button>' +
    '<button type="button" class="g-exit l-exit" data-a="west" aria-label="Zurück"><span>‹</span></button><button type="button" class="g-exit g-exit-r l-exit" data-a="east" aria-label="Tiefer in den Wald"><span>›</span></button>';
  var foFg = lEl("canvas", "mu-fg", scene); foFg.width = 180; foFg.height = 135; foFg.hidden = true;     // bushes in front of the hamster
  var muWrap = lEl("div", "mu-wrap", scene); muWrap.hidden = true; muWrap.innerHTML = '<div class="fi-card"></div>';
  var muCard = muWrap.querySelector(".fi-card");
  var muCx = foCv.getContext("2d"), fgCx = foFg.getContext("2d"); muCx.imageSmoothingEnabled = false; fgCx.imageSmoothingEnabled = false;
  var mu = null, muRaf = 0, CX = muCx;
  function MR(x, y, w, h, c) { CX.fillStyle = c; CX.fillRect(Math.round(x), Math.round(y), w, h); }
  function mimg(k, x, y, sx, sw) { var im = MIMG[k]; if (!im || !im.complete) return; if (sw) CX.drawImage(im, sx, 0, sw, im.naturalHeight, Math.round(x), Math.round(y), sw, im.naturalHeight); else CX.drawImage(im, Math.round(x), Math.round(y)); }
  function muSpark(x, y, f) {                             // the little four-point glint, three frames
    var c = "#fffbe0", c2 = "#ffd34a";
    if (f === 0) { MR(x, y, 1, 1, c); return; }
    if (f === 1) { MR(x, y - 1, 1, 3, c2); MR(x - 1, y, 3, 1, c2); MR(x, y, 1, 1, c); return; }
    MR(x, y - 3, 1, 7, c2); MR(x - 3, y, 7, 1, c2); MR(x, y - 1, 1, 3, c); MR(x - 1, y, 3, 1, c);
  }
  function bushShadow(x, y) {                           // a soft dithered shadow under a bush
    for (var yy = y - 4; yy <= y; yy++) for (var xx = x - 26; xx <= x + 26; xx++) { var v = Math.pow((xx - x) / 26, 2) + Math.pow((yy - y + 2) / 3, 2); if (v <= 1 && (v < .5 || (xx + yy) % 2)) MR(xx, yy, 1, 1, "rgba(28,44,20,.32)"); }
  }
  var PG = function (x) { return x - mu.page * 180; };
  function onPage(x) { var lx = PG(x); return lx > -40 && lx < 220; }
  function muAt(i) { var sp = MSPOTS[i]; return { x: sp.x + (sp.t === "stumpf" ? 9 : sp.t === "holz" ? -4 : 0), y: sp.y - (sp.t === "stumpf" ? 4 : sp.t === "holz" ? 10 : 1) }; }
  function muDraw(t) {
    if (place2 !== "forest" || !mu) { muRaf = 0; return; }
    var dt = Math.min(.05, (t - (mu.last || t)) / 1000); mu.last = t; mu.T += dt;
    var se = mu.sc.se, hy = H.y;
    CX = muCx; muCx.clearRect(0, 0, 180, 135); fgCx.clearRect(0, 0, 180, 135);
    mimg("bg_" + se, 0, 0, mu.page * 180, 180);
    var order = MSPOTS.map(function (sp, i) { return i; }).concat(MBUSH.map(function (b, j) { return -1 - j; })).sort(function (a, b) { return (a < 0 ? MBUSH[-1 - a].y : MSPOTS[a].y) - (b < 0 ? MBUSH[-1 - b].y : MSPOTS[b].y); });
    order.forEach(function (i) {
      if (i < 0) {
        var B = MBUSH[-1 - i]; if (!onPage(B.x)) return;
        CX = B.y > hy + 2 ? fgCx : muCx;                // bushes nearer than the hamster go on the front layer
        var bs = mu.bshake && mu.bshake.j === -1 - i && mu.T - mu.bshake.t0 < .4 ? Math.round(Math.sin(mu.T * 45) * 1.5) : 0;
        if (se !== "winter") bushShadow(PG(B.x), B.y);
        var see = CX === fgCx && Math.abs(H.x - PG(B.x)) < 30 && B.y - hy < 34;   // the hamster behind a bush: it turns see-through
        if (see) fgCx.globalAlpha = .5;
        mimg("fb_" + se + "_" + B.n, PG(B.x) - 32 + bs, B.y - 39); fgCx.globalAlpha = 1; CX = muCx; return;
      }
      var sp = MSPOTS[i], st = mu.sc.st[i], k = mu.sc.items[i], x = PG(sp.x);
      if (!onPage(sp.x)) return;
      var shake = mu.rustle && mu.rustle.i === i ? Math.round(Math.sin(mu.T * 40) * 1.5) : 0;
      mimg("h_" + sp.t + "_" + se + "_" + (st ? 1 : 0), x - 21 + shake, sp.y - 27);
      if (k && (st === 1 || st === 3)) {
        var A = muAt(i), pop = mu.pop && mu.pop.i === i ? Math.max(0, 1 - (mu.T - mu.pop.t0) * 4) : 0;
        mimg("m_" + k, PG(A.x) - 11, A.y - 25 - Math.round(pop * 6));
      }
      if (!st && k && !mu.rustle) {                     // the glint: each place in its own rhythm, short and every few seconds
        var ph = (mu.T + i * 1.37) % (4.2 + (i % 3)), f = ph < .12 ? 0 : ph < .24 ? 1 : ph < .4 ? 2 : ph < .52 ? 1 : -1;
        if (f >= 0) muSpark(x - 8 + (i * 5) % 16, sp.y - 14 - (i * 3) % 6, f);
      }
    });
    if (mu.bits) mu.bits = mu.bits.filter(function (b) { b.life -= dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 120 * dt; if (b.life > 0) MR(PG(b.x), b.y, 2, 1, b.c); return b.life > 0; });
    muRaf = requestAnimationFrame(muDraw);
  }
  var LEAFC = { spring: ["#a07848", "#8a6038"], summer: ["#a07848", "#8a6038"], autumn: ["#e0943a", "#c8702a", "#f0b850"], winter: ["#ffffff", "#e8eef4"] };
  function rustle(i) {
    var sp = MSPOTS[i], cols = sp.t === "farn" ? ["#78b058", "#5a9048"] : sp.t === "gras" ? ["#94cc70", "#70ac54"] : sp.t === "moos" ? ["#86b85a", "#689a46"] : sp.t === "laub" ? LEAFC[mu.sc.se] : ["#c89058", "#8a5a34"];
    if (mu.sc.se === "winter") cols = LEAFC.winter;
    mu.bits = mu.bits || [];
    for (var k = 0; k < 14; k++) { var a = -Math.PI * (.15 + Math.random() * .7); mu.bits.push({ x: sp.x + (Math.random() - .5) * 16, y: sp.y - 6, vx: Math.cos(a) * 50, vy: Math.sin(a) * 70, life: .6, c: cols[k % cols.length] }); }
    mu.rustle = { i: i, t0: mu.T }; beep([[300 + Math.random() * 80, .03], [260, .03]]);
  }
  var NOTHING = ["Nur Laub.", "Nichts drunter.", "Ein Käfer krabbelt davon.", "Hier wächst nichts.", "Nur ein paar Eicheln.", "Leer. Vielleicht woanders?"];
  var NOTHING_W = ["Nur Schnee.", "Nichts unter dem Schnee.", "Hier schläft alles."];
  function allDone() { if (mu.sc.st.every(function (q) { return q; })) say("Alles abgesucht. Später wächst im Wald Neues."); }
  function basketN() { foUi.querySelector(".mu-n").textContent = mu && mu.found ? mu.found : ""; }
  // walking to a place, sniffing, digging it out
  function standAt(i) { var sp = MSPOTS[i], lx = PG(sp.x), side = H.x < lx ? -1 : 1, w = sp.t === "holz" ? 20 : sp.t === "stumpf" ? 16 : 13; return { x: Math.max(8, Math.min(172, lx + side * w)), y: Math.max(78, Math.min(132, sp.y + 1)), lx: lx }; }
  async function visitSpot(i) {
    var st = mu.sc.st[i], k = mu.sc.items[i], P = standAt(i);
    await walkTo(P.x, P.y); faceTo(P.lx);
    if (st) { if (k && st !== 2) { front({ eyes: "happy", mouth: "smile" }); showLook(i); } else say("Hier hast du schon gesucht."); return; }
    for (var q = 0; q < 4; q++) { standFrame(q % 2); await wait(170); }
    front({ eyes: "open", mouth: "smile" }); await nibbleNose(4);
    rustle(i); front({ paws: "up", eyes: "happy" }); await wait(480);
    mu.rustle = null; mu.sc.st[i] = 1;
    if (!k) { var Lw = mu.sc.se === "winter" ? NOTHING_W : NOTHING; front({ eyes: "open", mouth: "flat", paws: "down" }); say(Lw[Math.floor(Math.random() * Lw.length)]); beep([[392, .03]]); allDone(); return; }
    mu.pop = { i: i, t0: mu.T }; front({ eyes: "wide", mouth: "grin", paws: "up", blush: true }); say("Da ist etwas!"); beep([[660, .04], [880, .06]]);
    await wait(700); showLook(i);
  }
  async function bushSeq(j) {
    var B = MBUSH[j], lx = PG(B.x); await walkTo(Math.max(8, Math.min(172, lx + (H.x < lx ? -22 : 22))), Math.max(78, Math.min(132, B.y - 2))); faceTo(lx);
    mu.bshake = { j: j, t0: mu.T }; mu.bits = mu.bits || [];
    for (var q = 0; q < 8; q++) { var a = -Math.PI * (.2 + Math.random() * .6); mu.bits.push({ x: B.x + (Math.random() - .5) * 30, y: B.y - 24, vx: Math.cos(a) * 40, vy: Math.sin(a) * 50, life: .5, c: mu.sc.se === "winter" ? "#ffffff" : mu.sc.se === "autumn" ? "#d8b048" : "#6aa64c" }); }
    beep([[280, .03]]); await nibbleNose(3); say("Nur ein Busch.");
  }
  // ---- cards ----
  var MPX = 2.05;
  function mpic(k, sc) { var im = MIMG[k]; var w = im && im.naturalWidth || 22, h = im && im.naturalHeight || 26; return '<img src="' + MG[k] + '" style="width:' + (w * sc) + 'px;height:' + (h * sc) + 'px" alt="">'; }
  function mcard(h) { muCard.innerHTML = '<div class="fi-c">' + h + '</div>'; muWrap.hidden = false; document.body.classList.add("mu-card-on"); }
  function badger() { var an = typeof ALLANI !== "undefined" && ALLANI.badger; return an ? '<svg class="mu-dachs" viewBox="' + an.vb + '" shape-rendering="crispEdges" aria-hidden="true">' + an.svg + '</svg>' : ""; }
  var ED = { e: "Essbar", g: "Giftig", u: "Ungenießbar" };
  function art(k) { return { gallen: "ein", knolle: "ein", parasol: "ein", morchel: "eine", glucke: "eine" }[k] || "ein"; }
  function showLook(i) {
    mu.cur = i; mu.view = "look"; var k = mu.sc.items[i], f = FUNGI[k], again = mu.sc.st[i] === 3;
    mcard('<button type="button" class="mu-q" data-a="guide" aria-label="Pilzführer">?</button><p class="fi-h">' + (again ? f.n : "Was ist das?") + '</p><div class="mu-look"><div class="mu-big">' + mpic("m_" + k, MPX) + '</div><div class="mu-lp">' + mpic("u_" + f.u, MPX) + '</div></div>' +
      '<div class="mu-ft">' + f.ft.map(function (q) { return '<span>' + q + '</span>'; }).join("") + '</div>' +
      '<div class="fi-row"><button type="button" class="fi-b2" data-a="leave">Stehen lassen</button><button type="button" class="fi-b" data-a="take">Ins Körbchen</button></div>');
  }
  function decide(take) {
    var i = mu.cur, k = mu.sc.items[i], f = FUNGI[k], M = muL(), isNew = !M.book[k], good = take ? f.ed === "e" : f.ed !== "e", first = !mu.seen[i];
    mu.seen[i] = true; var G = guideFor(k), extra = "";
    if (first) {
      M.book[k] = M.book[k] || { n: 0, ok: 0 }; M.book[k].n++; if (good) M.book[k].ok++; M.total++;
      M.streak = good ? (M.streak || 0) + 1 : 0; if (M.streak > (M.best || 0)) M.best = M.streak;
      if (good && M.streak >= 2) extra += '<p class="fi-s fi-tip">' + M.streak + ' richtig in Folge!</p>';
    }
    if (isNew && typeof seedOrFurn === "function") { var g = seedOrFurn(); if (g && g.text) extra += '<p class="fi-s">Für den neuen Eintrag: ' + g.text + '</p>'; }
    var head, body, pic = '<div class="fi-pic">' + mpic("m_" + k, MPX) + '</div>', btn = "Weitersuchen";
    if (take && f.ed === "e") {
      mu.sc.st[i] = 2; mu.found++;
      if ((M.bag[k] || 0) < MU_BAG) { M.bag[k] = (M.bag[k] || 0) + 1; body = G.t + ": Lecker! Ab ins Körbchen."; } else body = "Lecker, aber dein Vorrat davon ist schon voll.";
      head = (art(k) === "eine" ? "Eine " : "Ein ") + f.n + "!"; beep([[523, .05], [659, .05], [784, .07]]);
    } else if (take) {
      mu.sc.st[i] = 3; head = "Halt!"; btn = "Danke, Dachs";
      body = G.t + ": das ist " + art(k) + " " + f.n + ". " + (f.ed === "g" ? "Der ist giftig, den lassen wir stehen." : "Der ist bitter wie Galle und verdirbt jedes Essen.");
      pic = '<div class="mu-say">' + badger() + mpic("m_" + k, MPX) + '</div>'; beep([[330, .06], [262, .08]]);
    } else if (f.ed !== "e") {
      mu.sc.st[i] = 3; head = "Gut erkannt!"; body = G.t + ": " + (art(k) === "eine" ? "eine " : "ein ") + f.n + ", " + (f.ed === "g" ? "giftig." : "ungenießbar."); beep([[659, .05], [880, .06]]);
    } else {
      mu.sc.st[i] = 3; head = "Schade!"; body = G.t + ": " + art(k) + " " + f.n + ", der ist essbar. Tipp ihn nochmal an, dann kannst du ihn doch mitnehmen."; beep([[392, .05]]);
    }
    var all = MORDER.every(function (q) { return M.book[q]; });
    if (all && !M.trophy) { M.trophy = true; extra += '<p class="fi-s fi-tip">Das Pilzbuch ist voll!</p>'; }
    if (window.SudokuSave) window.SudokuSave();
    mcard((isNew ? '<b class="fi-new">Neu!</b>' : "") + '<p class="fi-h">' + head + '</p>' + stars(f.r) + pic + '<p class="mu-tx">' + body + '</p>' + extra +
      '<div class="fi-row"><button type="button" class="fi-b" data-a="go">' + btn + '</button></div>');
  }
  function showGuide() {
    var back = mu.view === "look" ? "look" : "basket", book = muL().book;
    mcard('<p class="fi-h">Pilzführer</p><div class="mu-guide">' + GUIDE.map(function (g) {
      return '<div class="mu-gr"><div class="mu-gp">' + mpic("m_" + g.ks[0], MPX) + '</div><div class="mu-gt"><b>' + g.t + '</b> <span class="mu-ed mu-' + g.ed + '">' + ED[g.ed] + '</span><br>' + g.d + '</div></div>';
    }).join("") + '</div><p class="mu-note">Im echten Wald nur essen, was ein Pilzberater geprüft hat.</p><div class="fi-row"><button type="button" class="fi-b2" data-a="' + back + '">Zurück</button></div>');
  }
  function showBasket() {
    mu.view = "basket";
    var M = muL(), have = MORDER.filter(function (k) { return M.bag[k]; });
    mcard('<p class="fi-h">Pilzvorrat</p>' + (have.length ? '<div class="mu-bag">' + have.map(function (k) { return '<span>' + mpic("m_" + k, MPX) + '<b>' + M.bag[k] + '</b></span>'; }).join("") + '</div>' : '<p class="mu-tx">Noch leer.</p>') +
      '<div class="fi-row"><button type="button" class="fi-b2" data-a="book">Pilzbuch</button><button type="button" class="fi-b2" data-a="guide">Pilzführer</button></div><div class="fi-row"><button type="button" class="fi-b" data-a="go">Weitersuchen</button></div>');
  }
  function showMBook(sel) {
    var M = muL(), book = M.book, n = MORDER.filter(function (k) { return book[k]; }).length;
    var tip = sel && book[sel] ? '<p class="fi-hint"><b class="mu-ed mu-' + FUNGI[sel].ed + '">' + ED[FUNGI[sel].ed] + '</b> ' + FUNGI[sel].hint + '</p>' : sel ? '<p class="fi-hint">Noch nicht gefunden.</p>' : '<p class="fi-hint">Tippe auf einen Pilz.</p>';
    mcard('<p class="fi-h fi-hl">Pilzbuch · ' + n + ' von ' + MORDER.length + (M.best ? ' · Rekord: ' + M.best + ' richtig' : "") + '</p>' + tip + '<div class="fi-book">' + MORDER.map(function (k) {
      var has = !!book[k];
      return '<button type="button" class="fi-bt' + (has ? "" : " fi-no") + (sel === k ? " fi-sel" : "") + '" data-k="' + k + '">' + mpic("m_" + k, MPX) + '<span>' + (has ? FUNGI[k].n : "?") + '</span>' + stars(FUNGI[k].r) + '</button>';
    }).join("") + '</div><div class="fi-row"><button type="button" class="fi-b2" data-a="basket">Zurück</button></div>');
  }
  muCard.addEventListener("click", function (e) {
    e.stopPropagation(); var b = e.target.closest("button"); if (!b || !mu) return;
    if (b.dataset.k) { showMBook(b.dataset.k); return; }
    var a = b.dataset.a;
    if (a === "take") decide(true); else if (a === "leave") decide(false);
    else if (a === "guide") showGuide(); else if (a === "look") showLook(mu.cur);
    else if (a === "book") showMBook(); else if (a === "basket") showBasket();
    else if (a === "go") { muClose(); allDone(); }
  });
  function muClose() { muWrap.hidden = true; document.body.classList.remove("mu-card-on"); basketN(); front({ eyes: "happy", mouth: "smile" }); }
  // ---- taps in the forest: a place, a bush, the floor, the exits ----
  function fpt(e) { var r = forEl.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 180, (e.clientY - r.top) / r.height * 135]; }
  foUi.addEventListener("click", function (e) {
    if (!mu || s.asleep || decor || !muWrap.hidden) return;
    var b = e.target.closest("button");
    if (b && b.dataset.a === "basket") { showBasket(); return; }
    if (busy && !interruptible()) return; if (busy) interrupt();
    if (b && b.dataset.a === "west") { act("travel", mu.page ? toPage0 : forestHome); return; }
    if (b && b.dataset.a === "east") { act("travel", toPage1); return; }
    var p = fpt(e), best = -1, bj = -1;
    MSPOTS.forEach(function (sp, i) { var lx = PG(sp.x); if (Math.abs(p[0] - lx) < 20 && p[1] > sp.y - 28 && p[1] < sp.y + 4 && (best < 0 || sp.y > MSPOTS[best].y)) best = i; });
    if (best >= 0) { act("mush", function () { return visitSpot(best); }); return; }
    MBUSH.forEach(function (B, j) { var lx = PG(B.x); if (Math.abs(p[0] - lx) < 28 && p[1] > B.y - 36 && p[1] < B.y) bj = j; });
    if (bj >= 0) { act("mush", function () { return bushSeq(bj); }); return; }
    if (p[1] > 74) act("walk", function () { return walkTo(p[0], p[1]); });
  });
  // ---- coming and going ----
  function muEnter(page) {
    mu = mu && mu.sc === muL().scene && muL().scene && Date.now() - muL().scene.t < MU_FRESH ? mu : { T: 0, sc: null, found: 0, seen: {} };
    mu.sc = muScene(); mu.page = page || 0; basketN();
    if (!muRaf) muRaf = requestAnimationFrame(muDraw);
  }
  var _mu_showPlace = showPlace;
  showPlace = function (p) {
    _mu_showPlace(p); forEl.hidden = p !== "forest"; foFg.hidden = p !== "forest"; if (p !== "forest") { muWrap.hidden = true; document.body.classList.remove("mu-card-on"); }
    if (p === "forest") {
      var sk = (document.getElementById("sky").className.match(/sky-(eve|night)/) || [""])[0];
      foDark.className = "l-dark " + sk; foFg.className = "mu-fg " + sk;
      if (!mu || !mu.sc) muEnter(0); else if (!muRaf) muRaf = requestAnimationFrame(muDraw);
    }
  };
  var _mu_walkTo = walkTo;
  walkTo = async function (x, y, speed) { if (place2 === "forest" && x > -10 && x < 190) y = Math.max(76, Math.min(132, y)); return _mu_walkTo(x, y, speed); };
  async function fadeForest(page, at) { fadeX(false); await wait(250); muEnter(page); showPlace("forest"); moveTo(at.x, at.y, 0); fadeX(true); }
  async function toPage1() { await walkTo(194, 112); await fadeForest(1, { x: -12, y: 112 }); await walkTo(24, 112); say(N() + " geht tiefer in den Wald."); }
  async function toPage0() { await walkTo(-14, 112); await fadeForest(0, { x: 192, y: 112 }); await walkTo(156, 112); }
  async function forestHome() {
    if (mu && mu.page) await toPage0();
    await walkTo(-14, 112); fadeX(false); await wait(250);
    var n = mu ? mu.found : 0; muWrap.hidden = true;
    showPlace("room"); H.scale = HS; H.where = "floor"; moveTo(SPOT.home.x, SPOT.home.y, 0); fadeX(true); front({ eyes: "happy", mouth: "smile" });
    say(n ? N() + " bringt " + n + (n === 1 ? " Pilz" : " Pilze") + " aus dem Wald mit." : N() + " ist zurück aus dem Wald.");
    if (mu) mu.found = 0; if (window.SudokuSave) window.SudokuSave();
  }
  // the world map: the forest is a place to travel to
  var _mu_wmHere = wmHere; wmHere = function () { return place2 === "forest" ? "forest" : _mu_wmHere(); };
  var _mu_warpTo = warpTo;
  warpTo = async function (k) {
    if (place2 === "forest" && k !== "forest") { muWrap.hidden = true; if (mu) mu.found = 0; }
    if (k !== "forest") return _mu_warpTo(k);
    if (typeof cafeOn !== "undefined" && cafeOn) closeCafe();
    if (H.where === "chair") await hopOutOfChair(); else if (H.where === "tub") await hopOutOfTub(); else if (H.where === "bed") await hopOutOfBed(); else H.where = null;
    fadeX(false); await wait(320);
    muEnter(0); showPlace("forest"); H.scale = HS; moveTo(-12, 112, 0); fadeX(true);
    await walkTo(34, 112); front({ eyes: "happy", mouth: "grin", paws: "up" });
    say(N() + " ist im Wald. Wo verstecken sich Pilze?");
  };
  var _mu_toRoom = toRoom; toRoom = async function () { if (place2 === "forest") return forestHome(); return _mu_toRoom(); };
  var _mu_travelTo = travelTo; travelTo = async function (t) { if (place2 === "forest" && t !== "forest") await forestHome(); return _mu_travelTo(t); };
  window.__mush = { open: function () { return window.__world.warp("forest"); }, st: function () { return mu && { page: mu.page, items: mu.sc.items.slice(), st: mu.sc.st.slice(), found: mu.found, card: !muWrap.hidden, hx: H.x, hy: H.y }; }, data: function () { return muL(); },
    fill: function (k) { if (mu) { mu.sc.items = MSPOTS.map(function (sp) { return k || muPick(sp.t, mu.sc.se); }); mu.sc.st = MSPOTS.map(function () { return 0; }); } }, spots: MSPOTS, fresh: function () { delete muL().scene; mu = null; } };
