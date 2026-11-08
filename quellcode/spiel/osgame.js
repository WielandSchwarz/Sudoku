// ===================== Obstsalat (mini game, preview): fruit flies up out of the meadow, swipe to cut it,
// 60 seconds on the clock, every piece is a point and lands in the salad bowl. More and more fruit comes in volleys for big combos.
// Specials: frost berries = slow motion, sunflower = double points, honeycomb = fruit rain.
// The spiky chestnut husk is the bomb: cutting it costs 10 points. Tap the hamster = done. =====================
// mountObstsalat(root, ART, opts) -> { setEnv({season, time, weather}), restart(), destroy(), state() }
// root: an element with position:relative and aspect-ratio 4/3. ART: obstsalat_art.json.
// opts.board (optional): the leaderboard, { submit(score) -> Promise<{ rows: [{ name, score, me }], rank }> }.
// It is called once at the end of every round; the board shows after the result (or on the first tap).
function mountObstsalat(root, ART, opts) {
  opts = opts || {};
  var W = 180, H = 135, G = 150;                       // room pixels, gravity in px/s^2
  var ROUND = 60;                                       // seconds per round
  var FULL = 80;                                        // points for a full bowl
  var HURRY = 10;                                       // last seconds: the clock turns orange
  var INK = "#3a2414";
  var SPECIALS = { frostbeere: { t: 5, ban: "Zeitlupe" }, sonnenblume: { t: 7, ban: "Doppelte Punkte" }, honigwabe: { t: 4, ban: "Obstregen" },
    pusteblume: { t: 4, ban: "Schweben" }, kleeblatt: { t: 5, ban: "Magnet" }, regenbogenerdbeere: { t: 2.5, ban: "Kombi-Zeit" }, uhrbluete: { t: 0, ban: "+5 Sekunden" }, gluehbeere: { t: 6, ban: "Leuchtobst" }, hamsterkern: { t: 10, ban: "Hamster-Mode" } };
  var GLOW = { frostbeere: "#bfe8ff", sonnenblume: "#ffd8a0", honigwabe: "#ffffff", pusteblume: "#ffffff", kleeblatt: "#d0ffd0", regenbogenerdbeere: "#ffd0f0", uhrbluete: "#ffd0f0", gluehbeere: "#fff8a0", hamsterkern: "#ffd8a0" };

  // ---------- DOM
  root.classList.add("os-root");
  root.innerHTML = '<canvas class="os-cv" width="180" height="135"></canvas>' +
    '<b class="os-ban"><span class="os-ban-t"></span><i class="os-ban-time"></i></b><button type="button" class="os-x" aria-label="Obstsalat beenden">×</button>' +
    '<div class="os-hud"><b class="os-hud-s"><img alt=""><span class="os-score">0</span></b><b class="os-hud-t"><img alt=""><span class="os-time">1:00</span></b></div>' +
    '<b class="os-x2" hidden>×2</b><div class="os-pops"></div><div class="os-end" hidden><b class="os-end-n"></b><b class="os-end-t"></b></div>' +
    '<div class="os-board" hidden><div class="os-board-in"><i class="nl tl"></i><i class="nl tr"></i><i class="nl bl"></i><i class="nl br"></i><div class="os-board-h"><img alt=""><b>Bestenliste</b></div><ol class="os-board-l"></ol></div></div>';
  var cv = root.querySelector(".os-cv"), cx = cv.getContext("2d");
  cx.imageSmoothingEnabled = false;
  var ban = root.querySelector(".os-ban"), banT = root.querySelector(".os-ban-t"), banTime = root.querySelector(".os-ban-time");
  var pops = root.querySelector(".os-pops"), endEl = root.querySelector(".os-end"), endT = root.querySelector(".os-end-t"), endN = root.querySelector(".os-end-n"), x2El = root.querySelector(".os-x2");
  var hudS = root.querySelector(".os-hud-s"), hudT = root.querySelector(".os-hud-t"), scoreEl = root.querySelector(".os-score"), timeEl = root.querySelector(".os-time");
  hudS.querySelector("img").src = ART.icon.apfel.img; hudT.querySelector("img").src = ART.icon.uhr.img;
  var hudShown = { s: -1, t: -1 };
  var boardEl = root.querySelector(".os-board"), boardList = root.querySelector(".os-board-l");
  boardEl.querySelector(".os-board-h img").src = ART.icon.pokal.img;
  var MEDAL = [ART.icon.gold.img, ART.icon.silber.img, ART.icon.bronze.img];

  // ---------- images
  function img(src) { var i = new Image(); i.src = src; return i; }
  var BG = {}; Object.keys(ART.bg).forEach(function (k) { BG[k] = img(ART.bg[k]); });
  var HAM = {}, HAMSIL = {}; Object.keys(ART.ham).forEach(function (k) { HAM[k] = img(ART.ham[k]);
    HAM[k].onload = function () { ["#ffd850", "#fff6c0"].forEach(function (col) { var s = document.createElement("canvas"); s.width = HAM[k].width; s.height = HAM[k].height; var sg = s.getContext("2d"); sg.drawImage(HAM[k], 0, 0); sg.globalCompositeOperation = "source-in"; sg.fillStyle = col; sg.fillRect(0, 0, s.width, s.height); (HAMSIL[k] = HAMSIL[k] || {})[col] = s; }); }; });
  var BOWL = ART.bowl.map(function (b) { return { im: img(b.img), w: b.w, h: b.h }; });
  var BIG = { im: img(ART.bowl_big.img), w: ART.bowl_big.w, h: ART.bowl_big.h };
  var FR = {};
  Object.keys(ART.fruit).forEach(function (k) {
    var f = ART.fruit[k], o = { k: k, w: f.w, h: f.h, r: f.r, flesh: f.flesh, seed: f.seed, weights: f.weights, im: img(f.img), data: null, sil: null };
    o.im.onload = function () {
      var c = document.createElement("canvas"); c.width = o.w; c.height = o.h; var g = c.getContext("2d"); g.drawImage(o.im, 0, 0); o.data = g.getImageData(0, 0, o.w, o.h);
      o.sil = {};                                       // silhouettes for the glow of special items, in two colours
      ["#ffffff", "#bfe8ff", "#ffd8a0", "#ff4a3a", "#9a1e14", "#d0ffd0", "#ffd0f0", "#fff8a0"].forEach(function (col) {
        var s = document.createElement("canvas"); s.width = o.w; s.height = o.h; var sg = s.getContext("2d"); sg.drawImage(o.im, 0, 0);
        sg.globalCompositeOperation = "source-in"; sg.fillStyle = col; sg.fillRect(0, 0, o.w, o.h); o.sil[col] = s;
      });
    };
    FR[k] = o;
  });

  // ---------- environment
  var env = { season: opts.season || seasonNow(), time: opts.time || "auto", weather: opts.weather || "sonne" };
  function seasonNow() { var m = new Date().getMonth(); return m < 2 || m === 11 ? "winter" : m < 5 ? "fruehling" : m < 8 ? "sommer" : "herbst"; }
  function timeNow() { if (env.time !== "auto") return env.time; var h = new Date().getHours(); return h >= 21 || h < 6 ? "nacht" : h >= 18 ? "abend" : "tag"; }
  var STARS = []; for (var i = 0; i < 26; i++) STARS.push([Math.floor(Math.random() * 180), Math.floor(Math.random() * 58), Math.random() * 6]);
  var FLIES = []; for (i = 0; i < 9; i++) FLIES.push({ x: 20 + Math.random() * 150, y: 92 + Math.random() * 30, p: Math.random() * 6 });
  var WX = []; for (i = 0; i < 70; i++) WX.push({ x: Math.random() * 200, y: Math.random() * 135, s: .6 + Math.random() * .6 });
  var CLOUDS = [{ x: 20, y: 30, w: 30 }, { x: 110, y: 40, w: 38 }, { x: 70, y: 52, w: 24 }];

  // ---------- game state
  var S, banTimer = 0;
  function reset() {
    S = { items: [], halves: [], drops: [], bits: [], rays: [], trail: [], score: 0, shown: 0, timeLeft: ROUND, best: loadBest(), spawnT: .5, t: 0, wt: 0, done: false, endT: 0, endTitle: "",
      face: "normal", faceT: 0, nib: 0, nibT: 4 + Math.random() * 3, hop: 0, hops: 0, shake: 0, flash: 0, blinkT: 2 + Math.random() * 3,
      stroke: null, strokeHits: 0, strokeCuts: [], cuts: 0, nextSpecial: 4 + Math.random() * 3, bombT: 8 + Math.random() * 3, slowT: 0, doubleT: 0, rainT: 0, rainSpawn: 0, queue: [], floatT: 0, magT: 0, comboT: 0, glowT: 0, chain: 0, strokeId: 0, shieldT: 0 };
    endEl.hidden = true; boardEl.hidden = true; S.board = null; S.boardOn = false; pops.innerHTML = ""; x2El.hidden = true; hudShown = { s: -1, t: -1 }; hudT.classList.remove("hurry", "tick");
    showBanner("Obstsalat", 2.2);
  }
  function loadBest() { try { return +localStorage.getItem("obstsalat-rekord") || 0; } catch (e) { return 0; } }
  function saveBest(v) { try { localStorage.setItem("obstsalat-rekord", String(v)); } catch (e) {} }
  /* every finished round on this device, best first (shown when the server cannot be reached) */
  function loadRuns() { try { var a = JSON.parse(localStorage.getItem("obstsalat-liste") || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function addRun(score) {
    var a = loadRuns(), me = { n: opts.hamsterName || "Hamster", s: score, t: Date.now() };
    if (!a.length && S.best > 0 && S.best !== score) a.push({ n: me.n, s: S.best, t: 0 });   /* the old single record becomes the first entry */
    a.push(me); a.sort(function (x, y) { return y.s - x.s || x.t - y.t; }); a = a.slice(0, 30);
    try { localStorage.setItem("obstsalat-liste", JSON.stringify(a)); } catch (e) {}
    return { rows: a.map(function (r) { return { name: r.n, score: r.s, me: r === me }; }), rank: a.indexOf(me) + 1 || null, offline: true };
  }
  function sfx(k, a) { if (opts.sfx) try { opts.sfx(k, a); } catch (e) {} }
  function addScore(n) { S.score = Math.max(0, S.score + n); }
  function showBanner(text, secs, timed, mid) {         /* specials sit top right next to the timer; the reward (mid) sits in the middle */
    banT.textContent = text; banTime.style.display = timed ? "block" : "none"; banTime.style.transform = "scaleX(1)";
    ban.classList.remove("pop", "away", "rw"); if (mid) ban.classList.add("rw"); void ban.offsetWidth; ban.classList.add("pop");
    clearTimeout(banTimer); banTimer = setTimeout(function () { ban.classList.add("away"); }, secs * 1000);
  }

  // ---------- spawning: volleys that grow with time
  function fruitKey() {
    var keys = [], tot = 0;
    Object.keys(FR).forEach(function (k) { var w = (FR[k].weights || {})[env.season] || 0; if (w) { keys.push([k, w]); tot += w; } });
    var x = Math.random() * tot;
    for (var i = 0; i < keys.length; i++) { x -= keys[i][1]; if (x <= 0) return keys[i][0]; }
    return keys[0][0];
  }
  function launch(k, x, peak, drift) {
    var f = FR[k], y0 = H + f.h / 2 + 2;
    var vy = -Math.sqrt(2 * G * (y0 - peak));
    var vx = drift != null ? drift : (90 - x) / 100 * (20 + Math.random() * 20) + (Math.random() - .5) * 14;
    S.items.push({ k: k, x: x, y: y0, vx: vx, vy: vy, cut: false, born: S.wt }); sfx(k === "kastanie" ? "launchBomb" : "launch");
  }
  /* a chestnut on its own, between the volleys, where the least fruit is */
  /* clover: chestnuts burst by themselves, harmless, for 5 points each */
  function popBomb(it) {
    it.cut = true; sliceItem(it, 1, -.4); addScore(points(5)); popText("+" + points(5), it.x, it.y, "#8ce070"); sfx("shieldhit");
    for (var k = 0; k < 8; k++) S.bits.push({ x: it.x, y: it.y, vx: (Math.random() - .5) * 120, vy: -40 - Math.random() * 60, c: k % 2 ? "#5a3418" : "#8ce070", life: .6 });
  }
  function bombLaunch() {
    var xs = S.items.map(function (it) { return it.x; }).concat(S.queue.map(function (q) { return q.x; })), best = 90, bd = -1;
    for (var c = 0; c < 8; c++) { var x = 20 + Math.random() * 140, d = xs.reduce(function (m, v) { return Math.min(m, Math.abs(v - x)); }, 999); if (d > bd) { bd = d; best = x; } }
    S.queue.push({ at: S.wt + .2, k: "kastanie", x: best, peak: 16 + Math.random() * 36, drift: (90 - best) / 100 * 8 + (Math.random() - .5) * 16 });
  }
  function volley() {
    var t = S.t, n = Math.min(5, 2 + Math.floor(t / 15) + (Math.random() < .5 ? 1 : 0));
    var bombP = 0, bombs = 0;                          /* chestnuts no longer fly with the fruit, they come on their own (bombLaunch) */
    // most of a volley is spread over the whole width with its own height; only a small group of 3 or 4 flies close together for combos
    var group = n >= 3 && Math.random() < Math.min(.5, .2 + t / 120) ? (n >= 5 && Math.random() < .4 ? 4 : 3) : 0;
    var slots = [], rest = n - group, i;
    for (i = 0; i < rest; i++) slots.push(14 + (i + .5) * 152 / rest + (Math.random() - .5) * 152 / rest * .6);
    for (i = slots.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), tmp = slots[i]; slots[i] = slots[j]; slots[j] = tmp; }
    var gx = 34 + Math.random() * 112, gpeak = 16 + Math.random() * 28, at = S.wt;
    for (i = 0; i < n; i++) {
      var rr = Math.random(), k = !bombs && i > 0 && Math.random() < bombP && ++bombs ? "kastanie" : rr < .03 ? "goldapfel" : t > 8 && rr < .055 ? "kokosnuss" : t > 5 && rr < .085 ? "wassermelone" : fruitKey();
      var x, pk, drift;
      if (i < group) {
        x = gx + (i - (group - 1) / 2) * 15 + (Math.random() - .5) * 3; pk = gpeak + Math.random() * 8;
        drift = (90 - gx) / 100 * 16 + (i - (group - 1) / 2) * 5; at = S.wt + i * .07;
      } else {
        x = slots[i - group]; pk = 12 + Math.random() * 46;
        drift = (90 - x) / 100 * 6 + (Math.random() - .5) * 22;
        at = S.wt + (group ? .3 : 0) + (i - group) * (.14 + Math.random() * .14);
      }
      S.queue.push({ at: at, k: k, x: Math.max(16, Math.min(164, x)), peak: pk, drift: drift });
    }
    if (S.t > S.nextSpecial && S.slowT <= 0 && S.doubleT <= 0 && S.rainT <= 0 && S.floatT <= 0 && S.magT <= 0 && S.comboT <= 0 && S.glowT <= 0 && S.shieldT <= 0) {
      var SK = ["frostbeere", "sonnenblume", "honigwabe", "pusteblume", "kleeblatt", "regenbogenerdbeere", "uhrbluete", "hamsterkern"]; if (timeNow() === "nacht") SK.push("gluehbeere", "gluehbeere");
      var sk = SK[Math.floor(Math.random() * SK.length)];
      S.queue.push({ at: S.wt + .3, k: sk, x: 50 + Math.random() * 80, peak: 18 + Math.random() * 16, drift: null });
      S.nextSpecial = S.t + 5 + Math.random() * 3;
    }
  }

  // ---------- slicing
  function hash(x, y) { return ((x * 73856093) ^ (y * 19349663)) >>> 0; }
  function hexRgb(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
  function sampleSkin(f) { var d = f.data.data, o = ((f.h >> 1) * f.w + (f.w >> 1)) * 4; return "rgb(" + d[o] + "," + d[o + 1] + "," + d[o + 2] + ")"; }
  function sliceItem(it, dx, dy) {
    var f = FR[it.k]; if (!f.data) return;
    var l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    var cs = [document.createElement("canvas"), document.createElement("canvas")];
    var ctxs = cs.map(function (c) { c.width = f.w; c.height = f.h; return c.getContext("2d"); });
    var ids = ctxs.map(function (g) { return g.createImageData(f.w, f.h); });
    var src = f.data.data, flesh = hexRgb(f.flesh), seed = hexRgb(f.seed), ink = hexRgb(INK);
    for (var y = 0; y < f.h; y++) for (var x = 0; x < f.w; x++) {
      var o = (y * f.w + x) * 4; if (!src[o + 3]) continue;
      var s = (x + .5 - f.w / 2) * nx + (y + .5 - f.h / 2) * ny, side = s < 0 ? 0 : 1, d = Math.abs(s);
      var c = [src[o], src[o + 1], src[o + 2]];
      if (d < .9) c = ink;
      else if (d < 3.4 && !(src[o] === ink[0] && src[o + 1] === ink[1] && src[o + 2] === ink[2])) c = hash(x, y) % 7 === 0 && d > 1.8 ? seed : flesh;
      var D = ids[side].data; D[o] = c[0]; D[o + 1] = c[1]; D[o + 2] = c[2]; D[o + 3] = 255;
    }
    ctxs.forEach(function (g, i) { g.putImageData(ids[i], 0, 0); });
    var push = 28;
    S.halves.push({ c: cs[0], x: it.x, y: it.y, vx: it.vx * .6 - nx * push, vy: it.vy * .3 - ny * push - 20, w: f.w, h: f.h });
    S.halves.push({ c: cs[1], x: it.x, y: it.y, vx: it.vx * .6 + nx * push, vy: it.vy * .3 + ny * push - 20, w: f.w, h: f.h });
    var skin = sampleSkin(f);
    for (var k = 0; k < 14; k++) {
      var a = Math.random() * Math.PI * 2, sp = 30 + Math.random() * 55;
      S.drops.push({ x: it.x, y: it.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 25, c: k % 3 ? f.flesh : skin, life: .5 + Math.random() * .4 });
    }
    return skin;
  }
  function segDist(px, py, ax, ay, bx, by) {
    var vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy, t = l2 ? Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / l2)) : 0;
    return Math.hypot(px - (ax + vx * t), py - (ay + vy * t));
  }
  function points(n) { return S.doubleT > 0 || S.glowT > 0 ? n * 2 : n; }
  function cutAlong(ax, ay, bx, by) {
    if (S.done) return;
    var len = Math.hypot(bx - ax, by - ay); if (len < 1.2) return;
    S.items.forEach(function (it) {
      if (it.cut || S.done) return;
      var f = FR[it.k];
      if (segDist(it.x, it.y, ax, ay, bx, by) > f.r + 1) return;
      if (it.k === "kokosstueck" && S.wt - it.born < .35) return;   /* the pieces are not cut by the swipe that cracked the nut */
      if (it.k === "kokosnuss") {                      /* three swipes to crack it, then a shower of coconut pieces */
        if (S.wt - (it.hitT || -9) < .16) return; it.hitT = S.wt; it.hits = (it.hits || 0) + 1;   /* a zigzag in one swipe counts too */
        if (it.hits < 3) { it.vy = Math.min(it.vy * .3, 0) - 45; it.vx *= .3; it.knock = .2; sfx("knock", it.hits);
          for (var kc = 0; kc < 6; kc++) S.bits.push({ x: it.x, y: it.y, vx: (Math.random() - .5) * 90, vy: -30 - Math.random() * 50, c: kc % 2 ? "#7a4a26" : "#c8905a", life: .5 }); return; }
      }
      it.cut = true;
      if (it.k === "kastanie" && S.magT > 0) return;   /* during the clover nobody can hit a chestnut */
      if (it.k === "kastanie" && S.shieldT > 0) {    /* Hamster-Mode: the chestnut just breaks, and even gives points */
        sliceItem(it, bx - ax, by - ay); addScore(points(2)); popText("+" + points(2), it.x, it.y, "#f8d850"); sfx("shieldhit"); cheer(1); return; }
      if (it.k === "kastanie") { boom(it); return; }
      if (it.k === "kokosnuss") { sliceItem(it, bx - ax, by - ay); addScore(points(1)); sfx("kokos"); cheer(1);
        for (var kp = 0; kp < 6; kp++) S.items.push({ k: "kokosstueck", x: it.x + (kp - 2.5) * 3, y: it.y, vx: (kp - 2.5) * 22 + (Math.random() - .5) * 10, vy: -95 - Math.random() * 45, cut: false, born: S.wt });
        return; }
      var skin = sliceItem(it, bx - ax, by - ay);
      sfx(it.k === "goldapfel" ? "gold" : "cut", S.strokeHits); S.strokeHits++; S.cuts++; S.strokeCuts.push({ x: it.x, y: it.y, c: skin, f: f.flesh });
      var val = it.k === "goldapfel" ? 4 : it.k === "wassermelone" ? 6 : 1;
      addScore(points(val));
      if (it.k === "wassermelone") { popText("+" + points(6), it.x, it.y, "#f8d850"); sfx("melone"); cheer(1);
        for (var km = 0; km < 4; km++) { var hv = S.halves[S.halves.length - 1 - (km % 2)]; if (hv) S.halves.push({ c: hv.c, x: it.x, y: it.y, vx: (km - 1.5) * 40, vy: -60 - km * 10, w: hv.w, h: hv.h }); } }
      if (it.k === "goldapfel") { cheer(1); popText(S.doubleT > 0 ? "+8" : "+4", it.x, it.y, "#f8d850"); } else if ((S.doubleT > 0 || S.glowT > 0) && it.k !== "wassermelone") popText("+2", it.x, it.y, "#f8d850");
      if (SPECIALS[it.k]) special(it.k);
    });
  }
  function special(k) {
    var sp = SPECIALS[k];
    if (k === "frostbeere") S.slowT = sp.t;
    if (k === "sonnenblume") { S.doubleT = sp.t; x2El.hidden = false; }
    if (k === "honigwabe") { S.rainT = sp.t; S.rainSpawn = 0; }
    if (k === "pusteblume") S.floatT = sp.t;
    if (k === "kleeblatt") { S.magT = sp.t; S.items.forEach(function (it) { if (it.k === "kastanie" && !it.cut) popBomb(it); }); }
    if (k === "regenbogenerdbeere") { S.comboT = sp.t; S.chain = 0; }
    if (k === "gluehbeere") S.glowT = sp.t;
    if (k === "hamsterkern") S.shieldT = sp.t;
    sfx(k);
    if (k === "uhrbluete") { S.timeLeft += 5; showBanner(sp.ban, 1.8, false); cheer(1); return; }
    S.specialMax = sp.t; S.specialKey = k;
    showBanner(sp.ban, sp.t, true);
    cheer(1);
  }
  function boom(it) {                                   // the chestnut husk: white flash, spines fly, minus 10 points
    S.boomed = true; S.flash = .45; S.shake = .45; S.face = "schreck"; S.faceT = 1.4; S.hop = 0; S.hops = 0;
    addScore(-10); S.scoreHit = .6; sfx("bomb"); popText("−10", it.x, it.y, "#f08a7e");
    for (var k = 0; k < 40; k++) {
      var a = k / 40 * Math.PI * 2, sp = 50 + Math.random() * 70;
      S.bits.push({ x: it.x, y: it.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, c: k % 3 ? "#6a9a38" : "#d8f0a0", life: .7 + Math.random() * .4 });
    }
    S.items.forEach(function (o) { if (!o.cut) { var dx = o.x - it.x, dy = o.y - it.y, d = Math.hypot(dx, dy) || 1; o.vx += dx / d * 60; o.vy = Math.max(o.vy, 0) + 20; } });
  }
  function cheer(n) { S.face = "froh"; S.faceT = .6 + n * .35; S.hop = .18; S.hops = n; }

  // ---------- combo: badge, confetti, rays, a double hop
  function combo(n, x, y) {
    var bonus = points(n - 1);
    addScore(bonus); cheer(2); sfx("combo", n);
    // only the bonus number pops up, bigger and in the combo colour (no badge)
    var e = popText("+" + bonus, Math.max(16, Math.min(164, x)), Math.max(18, Math.min(110, y - 6)));
    e.className = "os-pop os-pop-combo c" + Math.min(6, n);
    S.strokeCuts.forEach(function (c) {
      for (var k = 0; k < 10; k++) {
        var a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 60;
        S.bits.push({ x: c.x, y: c.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30, c: k % 2 ? c.c : c.f, life: .8 + Math.random() * .5, big: k % 4 === 0 });
      }
    });
    for (var r = 0; r < 10; r++) S.rays.push({ x: x, y: y, a: r / 10 * Math.PI * 2 + Math.random() * .2, t: 0 });
    if (n >= 5) S.flash = Math.max(S.flash, .18);
  }

  // ---------- input
  var HB = { x: 128, y: 91, w: 48, h: 46 };
  function pt(ev) { var r = cv.getBoundingClientRect(); return { x: (ev.clientX - r.left) / r.width * W, y: (ev.clientY - r.top) / r.height * H }; }
  var down = null;
  cv.addEventListener("pointerdown", function (ev) {
    if (S.done) {
      if (S.endT < 1.4) return;
      if (opts.board && !S.boardOn) showBoard(); else reset();
      return;
    }
    var p = pt(ev); down = { x: p.x, y: p.y, moved: 0, sw: 0 }; S.stroke = p; S.strokeHits = 0; S.strokeId++; if (!(S.comboT > 0)) S.strokeCuts = [];
    try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
    S.trail.push({ x: p.x, y: p.y, t: S.t });
  });
  cv.addEventListener("pointermove", function (ev) {
    if (!down || !S.stroke) return;
    var p = pt(ev), q = S.stroke;
    down.moved += Math.hypot(p.x - q.x, p.y - q.y); if (down.moved - down.sw > 40) { down.sw = down.moved; sfx("swish"); }
    cutAlong(q.x, q.y, p.x, p.y);
    S.stroke = p; S.trail.push({ x: p.x, y: p.y, t: S.t });
  });
  function up(ev) {
    if (!down) return;
    var p = pt(ev);
    if (down.moved < 3 && p.x >= HB.x && p.x < HB.x + HB.w && p.y >= HB.y + 4 && p.y < HB.y + HB.h) finish();
    if (S.comboT > 0 && !S.done) { S.chain += S.strokeHits; down = null; S.stroke = null; S.strokeHits = 0; return; }   /* rainbow: every swipe now counts into one big combo */
    if (S.strokeHits >= 3 && !S.done) {
      var lc = S.strokeCuts[S.strokeCuts.length - 1];
      combo(S.strokeHits, lc.x, lc.y);
    }
    down = null; S.stroke = null; S.strokeHits = 0; S.strokeCuts = [];
  }
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  root.querySelector(".os-x").addEventListener("click", function () { if (opts.onClose) opts.onClose(); else reset(); });

  function popText(t, x, y, col, ms) {
    var e = document.createElement("b"); e.className = "os-pop"; e.textContent = t; if (col) e.style.color = col;
    e.style.left = (x / W * 100) + "%"; e.style.top = (y / H * 100) + "%";
    pops.appendChild(e); setTimeout(function () { e.remove(); }, ms || 1100);
    return e;
  }
  function finish(title) {
    if (S.done) return;
    S.done = true; S.endT = 0; S.endTitle = title || "";
    /* a combo still running when time is up still counts */
    var openN = (S.comboT > 0 ? S.chain : 0) + (S.strokeHits || 0);
    if (openN >= 3 && S.strokeCuts.length) { var lc = S.strokeCuts[S.strokeCuts.length - 1]; combo(openN, lc.x, lc.y); }
    S.chain = 0; S.strokeHits = 0; S.comboT = 0;
    S.slowT = 0; S.rainT = 0; S.doubleT = 0; x2El.hidden = true; S.queue = [];
    /* no chestnut hit in the whole round: +50 */
    if (!S.boomed && S.timeLeft <= 0) { addScore(50); var nb = popText("Ohne Kastanie +50", 90, 72, "#f8d850", 2300); nb.className = "os-pop os-pop-combo os-pop-bonus c6"; cheer(3); }
    S.local = S.score > 0 ? addRun(S.score) : null;
    S.record = S.score > 0 && S.score > S.best; if (S.record) saveBest(S.score);
    sfx(S.record ? "record" : S.score >= FULL ? "full" : "end");
    if (opts.onFinish) { var rw = opts.onFinish({ score: S.score, timeUp: S.timeLeft <= 0 }); if (rw) setTimeout(function () { showBanner(rw, 4, false, true); }, 700); }
    if (opts.board) {
      var mine = S;                                     // a restart before the answer must not mix up rounds
      Promise.resolve().then(function () { return opts.board.submit(mine.score); })
        .then(function (r) { if (S !== mine) return; S.board = r && r.rows ? r : (mine.local || { rows: loadRuns().map(function (x) { return { name: x.n, score: x.s }; }), offline: true }); if (S.boardOn) renderBoard(); },
              function () { if (S !== mine) return; S.board = mine.local || { rows: loadRuns().map(function (x) { return { name: x.n, score: x.s }; }), offline: true }; if (S.boardOn) renderBoard(); });
    }
    hudT.classList.remove("hurry", "tick");
  }
  function showBoard() {
    S.boardOn = true; endEl.hidden = true; boardEl.hidden = false;
    boardEl.classList.remove("in"); void boardEl.offsetWidth; boardEl.classList.add("in");
    renderBoard();
  }
  function renderBoard() {                              // top 5, and your own row below if you are further down
    boardList.innerHTML = "";
    var b = S.board;
    if (!b) { boardList.appendChild(row("…", "", "", "wait")); return; }
    var rows = b.rows.slice(0, 7), meIn = rows.some(function (r) { return r.me; });
    rows.forEach(function (r, i) { boardList.appendChild(row(i + 1, r.name, r.score, (r.me ? "me" : "") + (i < 3 ? " top" : ""))); });
    var mine = b.rows.filter(function (r) { return r.me; })[0];
    if (!meIn && (mine || (b.offline && S.score > 0))) {
      if (rows.length) boardList.appendChild(row("", "", "", "gap"));
      boardList.appendChild(row(b.rank || "–", mine ? mine.name : (opts.hamsterName || "Hamster"), mine ? mine.score : S.score, "me"));
    }
  }
  function row(rank, name, score, cls) {
    var li = document.createElement("li"); li.className = cls || "";
    var r = document.createElement("span"); r.className = "r";
    if (typeof rank === "number" && rank <= 3 && cls.indexOf("top") >= 0) { var im = document.createElement("img"); im.src = MEDAL[rank - 1]; im.alt = rank + "."; r.appendChild(im); }
    else r.textContent = rank === "" ? "" : rank === "…" ? "…" : rank + (typeof rank === "number" ? "." : "");
    var n = document.createElement("span"); n.className = "n"; n.textContent = name;
    var sc = document.createElement("span"); sc.className = "s"; sc.textContent = score;
    li.appendChild(r); li.appendChild(n); li.appendChild(sc);
    return li;
  }
  function drawHud() {                                  // score and clock in the app font (DOM), changed only when the numbers change
    var t = Math.max(0, Math.ceil(S.timeLeft));
    if (S.score !== hudShown.s) {
      scoreEl.textContent = S.score;
      if (hudShown.s >= 0 && S.score < hudShown.s) { hudS.classList.remove("minus"); void hudS.offsetWidth; hudS.classList.add("minus"); }
      hudShown.s = S.score;
    }
    if (t !== hudShown.t) {
      timeEl.textContent = Math.floor(t / 60) + ":" + (t % 60 < 10 ? "0" : "") + (t % 60);
      if (!S.done && t <= HURRY && t > 0) { hudT.classList.add("hurry"); sfx("tick", t); hudT.classList.remove("tick"); void hudT.offsetWidth; hudT.classList.add("tick"); }
      hudShown.t = t;
    }
  }

  // ---------- drawing helpers (whole room pixels)
  function px(x, y, c) { cx.fillStyle = c; cx.fillRect(Math.round(x), Math.round(y), 1, 1); }
  function line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy;
    cx.fillStyle = c;
    for (var n = 0; n < 400; n++) { cx.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; var e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  function sprite(im, x, y) { cx.drawImage(im, Math.round(x), Math.round(y)); }

  function drawEnvBack(tm) {
    if (tm === "nacht") STARS.forEach(function (s) { if (Math.sin(S.t * 2 + s[2]) > -.4) px(s[0], s[1], "#fff8d8"); });
    if (env.weather === "wolken" || env.weather === "regen") CLOUDS.forEach(function (c, i) {
      var x = ((c.x + S.t * (3 + i)) % 230) - 40;
      cx.fillStyle = env.weather === "regen" ? "#c8ccd4" : "#f4f6f8";
      for (var y = 0; y < 5; y++) { var half = Math.round(c.w / 2 * Math.sqrt(1 - Math.pow((y - 2) / 2.8, 2))); cx.fillRect(Math.round(x + c.w / 2 - half), c.y - 10 + y, half * 2, 1); }
    });
  }
  function drawTint(tm, front) {                       /* time of day and weather only tint the background; the front (fruit, hamster, bowl) stays bright */
    var cols = [];
    if (front) { if (S.slowT > 0) cols.push("#d8ecff"); }
    else if (tm === "abend") cols.push("#ffd2a8"); else if (tm === "nacht") cols.push("#6070a8");
    if (!front) { if (env.weather === "regen") cols.push("#d4d8e0"); else if (env.weather === "wolken") cols.push("#eef0f2"); }
    cx.globalCompositeOperation = "multiply";
    cols.forEach(function (c) { cx.fillStyle = c; cx.fillRect(0, 0, W, H); });
    cx.globalCompositeOperation = "source-over";
  }
  function drawEnvFront(tm, dt) {
    if (tm === "nacht" && env.season !== "winter") FLIES.forEach(function (f) {
      var x = f.x + Math.sin(S.t * .7 + f.p) * 8, y = f.y + Math.sin(S.t * 1.3 + f.p * 2) * 4;
      if (Math.sin(S.t * 3 + f.p) > 0) px(x, y, "#e8f890");
    });
    if (env.weather === "regen") WX.forEach(function (d) {
      d.y += 150 * d.s * dt; d.x -= 30 * d.s * dt; if (d.y > H) { d.y = -4; d.x = Math.random() * 200; }
      px(d.x, d.y, "#a8c4e0"); px(d.x - .2, d.y + 1, "#a8c4e0");
    });
    if (env.weather === "schnee") WX.forEach(function (d) {
      d.y += 18 * d.s * dt; d.x += Math.sin(S.t + d.s * 9) * 6 * dt; if (d.y > H) { d.y = -2; d.x = Math.random() * 180; }
      px(d.x, d.y, "#ffffff");
    });
  }
  function drawFrost() {                                // slow motion: frost creeps in from the edges, icicles on top
    var k = Math.min(1, S.slowT / .4, (5 - S.slowT) / .3 + .2);
    var depth = Math.round(4 * k);
    for (var x = 0; x < W; x++) {
      var d = depth + (hash(x, 1) % 3);
      for (var y = 0; y < d; y++) px(x, y, y === d - 1 ? "#bfe0f6" : "#f2faff");
      var ic = hash(x, 7) % 9 === 0 ? 3 + hash(x, 3) % 4 : 0;
      for (y = 0; y < ic * k; y++) px(x, d + y, "#dff0fa");
      var b = depth - 1 + (hash(x, 5) % 2);
      for (y = 0; y < b; y++) px(x, H - 1 - y, "#f2faff");
    }
    for (var yy = 0; yy < H; yy++) {
      var dd = depth - 1 + (hash(2, yy) % 3);
      for (x = 0; x < dd; x++) { px(x, yy, "#f2faff"); px(W - 1 - x, yy, "#f2faff"); }
    }
  }

  // ---------- main loop
  var last = performance.now(), raf = 0;
  function frame(now) {
    if (S.paused) { last = now; raf = requestAnimationFrame(frame); return; }   /* a present is being shown on top: everything waits */
    var dt = Math.min(.05, (now - last) / 1000); last = now; S.t += dt;
    var ts = S.slowT > 0 ? .38 : 1, wdt = dt * ts; S.wt += wdt;
    var tm = timeNow();
    if (!S.done) {
      S.spawnT -= dt;
      S.bombT -= dt;
      if (S.bombT <= 0) { if (S.slowT <= 0 && S.doubleT <= 0 && S.floatT <= 0 && S.magT <= 0 && S.rainT <= 0 && S.spawnT > .5) bombLaunch(); S.bombT = S.bombT <= 0 && S.spawnT <= .5 ? .3 : Math.max(3.5, 7 - S.t / 15) + Math.random() * 2; }
      if (S.spawnT <= 0 && S.rainT <= 0) { volley(); S.spawnT = Math.max(1.1, 1.45 - S.t / 90) + Math.random() * .35; }
      if (S.rainT > 0) {                                // fruit rain from both sides
        S.rainSpawn -= dt;
        if (S.rainSpawn <= 0) {
          S.rainSpawn = .16;
          var left = Math.random() < .5, k = fruitKey(), f = FR[k];
          S.items.push({ k: k, x: left ? -f.w : W + f.w, y: 50 + Math.random() * 60, vx: (left ? 1 : -1) * (85 + Math.random() * 40), vy: -(70 + Math.random() * 50), cut: false, born: S.wt });
        }
      }
      S.queue = S.queue.filter(function (q) { if (S.wt >= q.at) { launch(q.k, q.x, q.peak, q.drift); return false; } return true; });
      S.timeLeft -= wdt;                                // slow motion slows the clock too
      if (S.timeLeft <= 0) { S.timeLeft = 0; finish(); }
    } else S.endT += dt;
    if (S.slowT > 0) S.slowT -= dt;
    if (S.doubleT > 0) { S.doubleT -= dt; if (S.doubleT <= 0) x2El.hidden = true; }
    if (S.rainT > 0) S.rainT -= dt;
    if (S.floatT > 0) S.floatT -= dt;
    if (S.magT > 0) S.magT -= dt;
    if (S.glowT > 0) S.glowT -= dt;
    if (S.shieldT > 0) S.shieldT -= dt;
    if (S.comboT > 0) { S.comboT -= dt; if (S.comboT <= 0) { var ch = S.chain + (S.strokeHits || 0), lc2 = S.strokeCuts[S.strokeCuts.length - 1]; if (ch >= 3 && lc2 && !S.done) combo(ch, lc2.x, lc2.y); S.chain = 0; if (!S.stroke) S.strokeCuts = []; } }
    var spLeft = Math.max(S.slowT, S.doubleT, S.rainT, S.floatT, S.magT, S.comboT, S.glowT, S.shieldT);
    if (S.specialMax && spLeft > 0) banTime.style.transform = "scaleX(" + Math.max(0, spLeft / S.specialMax).toFixed(3) + ")";

    S.items.forEach(function (it) {
      if (S.magT > 0) {                                  /* clover: everything is pulled together in the middle of the picture */
        var damp = Math.exp(-3 * wdt), tx = Math.max(62, Math.min(118, it.x)); it.vx = it.vx * damp + (tx - it.x) * 5 * wdt; it.vy = it.vy * damp + (58 - it.y) * 5 * wdt;   /* into a band in the middle, side by side */
      } else if (S.floatT > 0) {                         /* dandelion: everything floats slowly upwards */
        var fd = Math.exp(-2.5 * wdt); it.vx *= fd; it.vy = it.vy * fd + (-14) * (1 - fd);
      } else it.vy += G * wdt;
      it.x += it.vx * wdt; it.y += it.vy * wdt; if (it.knock) it.knock = Math.max(0, it.knock - dt);
      if (S.magT > 0 && it.k === "kastanie" && !it.cut && it.y < H - 10) popBomb(it);
    });
    S.items = S.items.filter(function (it) { return !it.cut && it.y < H + 30 && it.y > -60 && it.x > -40 && it.x < W + 40; });
    S.halves.forEach(function (h) { h.vy += G * wdt; h.x += h.vx * wdt; h.y += h.vy * wdt; });
    S.halves = S.halves.filter(function (h) { return h.y < H + 30; });
    [S.drops, S.bits].forEach(function (arr) { arr.forEach(function (d) { d.vy += G * wdt * .8; d.x += d.vx * wdt; d.y += d.vy * wdt; d.life -= dt; }); });
    S.drops = S.drops.filter(function (d) { return d.life > 0; }); S.bits = S.bits.filter(function (d) { return d.life > 0; });
    S.rays.forEach(function (r) { r.t += dt; }); S.rays = S.rays.filter(function (r) { return r.t < .3; });
    S.trail = S.trail.filter(function (p) { return S.t - p.t < .14; });
    S.shown += (S.score - S.shown) * Math.min(1, dt * 8);
    S.faceT -= dt; S.shake -= dt; S.blinkT -= dt; S.flash -= dt;
    S.hop -= dt; if (S.hop <= 0 && S.hops > 1) { S.hops--; S.hop = .18; }
    if (S.faceT <= 0) S.face = "normal";
    /* now and then he reaches into the bowl beside him, nibbles and stuffs his cheeks */
    if (!S.done) { S.nibT -= dt; if (S.nibT <= 0) { if (S.face === "normal" && S.shown > 2) S.nib = .001; S.nibT = 6 + Math.random() * 4; } }
    if (S.nib > 0) { S.nib += dt; if (S.face !== "normal" || S.nib > 2.6) S.nib = 0;
      else if (S.nib > .45 && S.nib < 1.4 && Math.random() < dt * 6) S.bits.push({ x: HB.x + 22 + (Math.random() - .5) * 6, y: HB.y + 24, vx: (Math.random() - .5) * 30, vy: -20 - Math.random() * 20, c: ["#f05a4a", "#f8d850", "#8cc86a", "#f8a040"][Math.floor(Math.random() * 4)], life: .5 }); }
    if (S.blinkT < -.12) S.blinkT = 2.5 + Math.random() * 3;

    var ox = S.shake > 0 ? (Math.floor(S.t * 40) % 2 ? 1 : -1) : 0;
    cx.setTransform(1, 0, 0, 1, ox, 0);
    var bg = BG[env.season]; if (bg.complete) cx.drawImage(bg, 0, 0);
    drawEnvBack(tm); drawTint(tm, false);
    var hop = S.hop > 0 ? -3 : 0, face = S.nib > 0 && S.face === "normal" ? (S.nib < .45 ? "greifen" : S.nib < 1.4 ? "kauen" : "backen") : S.face === "normal" && S.blinkT < 0 ? "blinzeln" : S.face;
    if (S.shieldT > 0 && HAMSIL[face] && (S.shieldT > 2 || Math.floor(S.t * 8) % 2)) {   /* Hamster-Mode: golden outline, blinking in the last 2 seconds */
      var hc = HAMSIL[face][Math.floor(S.t * 5) % 2 ? "#ffd850" : "#fff6c0"];
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (o) { sprite(hc, HB.x + o[0], HB.y + hop + o[1]); });
    }
    if (HAM[face].complete) sprite(HAM[face], HB.x, HB.y + hop);
    cx.fillStyle = "rgba(43,29,18,.16)"; cx.fillRect(104, 131, 40, 2);
    var lv = S.shown < FULL * .08 ? 0 : S.shown < FULL * .4 ? 1 : S.shown < FULL * .75 ? 2 : 3, b = BOWL[lv];
    if (b.im.complete) sprite(b.im, 107, 133 - b.h);
    S.items.forEach(function (it) {
      var f = FR[it.k]; if (!f.im.complete) return;
      var jx = it.k === "kastanie" ? (Math.floor(S.t * 20 + it.born * 7) % 3) - 1 : 0;        // the husk trembles a little
      if (it.knock) jx += Math.floor(S.t * 40) % 2 ? 1 : -1;
      var x0 = it.x - f.w / 2 + jx, y0 = it.y - f.h / 2;
      if (it.k === "kastanie" && f.sil) {               // the husk warns with a red pulsing outline
        var rc = Math.floor(S.t * 7) % 2 ? "#ff4a3a" : "#9a1e14";
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (o) { sprite(f.sil[rc], x0 + o[0], y0 + o[1]); });
      }
      if ((SPECIALS[it.k] || (S.glowT > 0 && it.k !== "kastanie")) && f.sil) {   // specials glow along their outline, blinking (with the glow berry: all fruit)
        var gc = GLOW[it.k] || "#fff8a0";
        if (Math.floor(S.t * 5) % 2) gc = "#ffffff";
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (o) { sprite(f.sil[gc], x0 + o[0], y0 + o[1]); });
      }
      sprite(f.im, x0, y0);
      if (it.k === "kokosnuss" && it.hits) {           /* cracks show how close it is to breaking */
        var cr = it.hits === 1 ? [[11, 4], [12, 5], [12, 6], [11, 7], [12, 8]] : [[11, 4], [12, 5], [12, 6], [11, 7], [12, 8], [13, 9], [12, 10], [12, 11], [11, 12], [12, 13], [13, 14], [9, 9], [10, 10], [14, 6], [15, 7]];
        cr.forEach(function (q) { px(x0 + q[0], y0 + q[1], "#2e1a0c"); });
        if (it.hits > 1) [[13, 5], [13, 11], [11, 9]].forEach(function (q) { px(x0 + q[0], y0 + q[1], "#fff8ec"); });
      }
    });
    S.halves.forEach(function (h) { sprite(h.c, h.x - h.w / 2, h.y - h.h / 2); });
    S.drops.forEach(function (d) { px(d.x, d.y, d.c); });
    S.bits.forEach(function (d) { px(d.x, d.y, d.c); if (d.big) { px(d.x + 1, d.y, d.c); px(d.x, d.y + 1, d.c); } });
    S.rays.forEach(function (r) {                        // combo: short bright rays shooting outward
      var a = 6 + r.t * 90, bb = a + 6;
      cx.globalAlpha = Math.max(0, 1 - r.t / .3);
      line(r.x + Math.cos(r.a) * a, r.y + Math.sin(r.a) * a, r.x + Math.cos(r.a) * bb, r.y + Math.sin(r.a) * bb, "#fff8ec");
      cx.globalAlpha = 1;
    });
    for (i = 1; i < S.trail.length; i++) {
      var a = S.trail[i - 1], q = S.trail[i], age = S.t - q.t;
      cx.globalAlpha = Math.max(0, 1 - age / .14);
      line(a.x, a.y, q.x, q.y, S.slowT > 0 ? "#e8f6ff" : "#fff8ec");
      cx.globalAlpha = 1;
    }
    drawTint(tm, true);
    if (S.slowT > 0) drawFrost();
    drawEnvFront(tm, dt);
    cx.setTransform(1, 0, 0, 1, 0, 0);
    if (S.flash > 0) { cx.fillStyle = "rgba(255,252,244," + Math.min(1, S.flash / .35).toFixed(2) + ")"; cx.fillRect(0, 0, W, H); }
    if (S.done && S.endT > .7) {
      var k2 = Math.min(1, (S.endT - .7) / .3);
      cx.fillStyle = "rgba(43,29,18," + (.45 * k2).toFixed(2) + ")"; cx.fillRect(0, 0, W, H);
      if (BIG.im.complete && !S.boardOn) {                            // the big bowl is only as full as what was cut: the heap is cut off from the top
        var heap = 20, frac = Math.min(1, S.score / FULL), sy = Math.round((1 - frac) * heap);
        var bx = Math.round((W - BIG.w) / 2), by = Math.round(58 - BIG.h / 2 + (1 - k2) * 10);
        cx.drawImage(BIG.im, 0, sy, BIG.w, BIG.h - sy, bx, by + sy, BIG.w, BIG.h - sy);
      }
      if (endEl.hidden && !S.boardOn) {
        endT.textContent = S.record ? "Neuer Rekord!" : S.score >= FULL ? "Obstsalat!" : S.score >= FULL / 2 ? "Kleiner Obstsalat" : "Ein paar Stückchen";
        endN.textContent = S.score;
        endEl.hidden = false;
      }
      if (opts.board && !S.boardOn && S.endT > 3.2) showBoard();
    }
    drawHud();
    raf = requestAnimationFrame(frame);
  }
  reset();
  raf = requestAnimationFrame(frame);

  return {
    state: function () { return S; },
    spawn: function (k, x, peak) { launch(k, x || 90, peak || 30, 0); }, special: function (k) { special(k); },
    setEnv: function (e) { Object.keys(e).forEach(function (k) { env[k] = e[k]; }); },
    restart: reset,
    pause: function (b) { S.paused = !!b; },
    destroy: function () { cancelAnimationFrame(raf); root.innerHTML = ""; }
  };
}
