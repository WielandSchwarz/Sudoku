(function () {
  "use strict";
  var HAM = /*HAM*/;
  var FURN = /*FURN*/;
  var PROPS = /*PROPS*/;
  var A = HAM.art, SZ = HAM.size;
  var GW = 180, GH = 135;
  function gx(x) { return (x / GW * 100) + "%"; }
  function gy(y) { return (y / GH * 100) + "%"; }
  function gb(y) { return ((GH - y) / GH * 100) + "%"; }
  function svgOf(art, w, h, extra) { return '<svg viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true">' + art + (extra || "") + '</svg>'; }

  var STATS = [
    { id: "food", label: "Satt", icon: "seed" },
    { id: "energy", label: "Energie", icon: "zz" },
    { id: "love", label: "Zuneigung", icon: "heart" },
    { id: "fun", label: "Spaß", icon: "note" }
  ];
  // asleep he recharges about 120 % energy per hour (full in under an hour), awake he loses 3 %
  var DECAY = { food: [-8, -3], energy: [-3, 120], love: [-5, -2], fun: [-7, -2] };
  var s, busy = false, cur = null;
  var scene = document.getElementById("scene"), ham = document.getElementById("hamster"), flipEl = document.getElementById("ham-flip"), bodyEl = document.getElementById("ham-body"), svg = document.getElementById("ham-svg");
  var thought = document.getElementById("thought"), statusEl = document.getElementById("status");
  var timers = [];
  function reset() { var name = s && s.name; s = { food: 70, energy: 80, love: 60, fun: 55, asleep: false, music: false, treats: 5, name: name || null }; }
  function N() { return s.name || "Dein Hamster"; }
  reset();
  function clamp(v) { return Math.max(0, Math.min(100, v)); }
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function say(t) { statusEl.textContent = t; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  // ---------- room layout (grid units) ----------
  var L = {
    win: { x: 104, y: 52, w: 48, h: 48 },
    clockCx: 62, clockTop: 12,
    shelf: { x: 2, bottom: 106, w: 36 },
    chair: { x: 38, bottom: 111, w: 48, h: 42 },
    rug: { x: 77, y: 110 },
    bowl: { x: 132, y: 113 },
    lamp: { x: 94, y: 58 },
    plant: { x: 159, bottom: 109 }
  };
  var SPOT = {
    home: { x: 112, y: 124 },
    bowl: { x: 146, y: 117 },
    shelf: { x: 26, y: 113 },
    chairFront: { x: 62, y: 118 },
    window: { x: 128, y: 102 },
    plant: { x: 134, y: 114 }
  };
  var HS = 0.85, CHAIR_S = 0.85;
  function place(el, x, y, w) { el.style.left = gx(x); el.style.top = gy(y); if (w) el.style.width = gx(w); }
  function layoutRoom() {
    var w = L.win, wEl = document.getElementById("win"); place(wEl, w.x, w.y, w.w);
    wEl.style.height = gy(w.h);
    document.getElementById("win-frame").outerHTML = '<svg id="win-frame" viewBox="0 0 48 48" style="position:absolute;inset:0">' + GA.door_frame.svg + '</svg>';
    document.getElementById("door-leaf").outerHTML = '<svg id="door-leaf" viewBox="0 0 48 48" style="position:absolute;inset:0">' + GA.door_leaf.svg + '</svg>';
    document.getElementById("cur-l").outerHTML = '<svg id="cur-l" viewBox="0 0 48 46">' + PROPS.curtainL.svg + '</svg>';
    document.getElementById("cur-r").outerHTML = '<svg id="cur-r" viewBox="0 0 48 46">' + PROPS.curtainR.svg + '</svg>';
    document.getElementById("win-rod").outerHTML = '<svg id="win-rod" viewBox="0 0 48 4" style="position:absolute;left:0;top:0;width:100%;z-index:2">' + PROPS.rod.svg + '</svg>';
    var sky = document.getElementById("sky"); sky.style.left = (7 / 48 * 100) + "%"; sky.style.top = (4 / 48 * 100) + "%"; sky.style.width = (34 / 48 * 100) + "%"; sky.style.height = (43 / 48 * 100) + "%";
    var moon = document.getElementById("moon"); moon.style.left = gx(w.x + 28); moon.style.top = gy(w.y + 11);
    var lampEl = document.getElementById("lamp"); place(lampEl, L.lamp.x - 8, L.lamp.y, 16);
    lampEl.addEventListener("click", function () { if (decor) return; lampOverride = !lampOn(daylight()); skyTime(); beep([[1200, .03]]); });
    var rug = document.getElementById("rug"); place(rug, L.rug.x, L.rug.y, 70); rug.innerHTML = svgOf(PROPS.rug.svg, 70, 20);
    var bowl = document.getElementById("bowl"); place(bowl, L.bowl.x, L.bowl.y, 28); bowl.innerHTML = svgOf(PROPS.bowl.svg + '<g id="pile">' + PROPS.pile.svg + '</g>', 28, 14);
    var sh = document.getElementById("sh-shelf"); sh.style.left = gx(L.shelf.x - 1); sh.style.width = gx(L.shelf.w + 2); sh.style.top = gy(L.shelf.bottom - 3); sh.style.height = gy(5);
    var sc = document.getElementById("sh-chair"); sc.style.left = gx(L.chair.x); sc.style.width = gx(L.chair.w); sc.style.top = gy(L.chair.bottom - 3); sc.style.height = gy(5);
    skyTime();
  }
  // daylight follows the real clock: sunrise and sunset for Kaiserslautern, by season
  function sunTimes(d) {
    var start = new Date(d.getFullYear(), 0, 0), doy = Math.floor((d - start) / 86400000);
    var lat = 49.44 * Math.PI / 180, decl = 23.44 * Math.PI / 180 * Math.sin(2 * Math.PI * (284 + doy) / 365);
    var cosH = (Math.sin(-0.83 * Math.PI / 180) - Math.sin(lat) * Math.sin(decl)) / (Math.cos(lat) * Math.cos(decl));
    var half = Math.acos(Math.max(-1, Math.min(1, cosH))) * 180 / Math.PI / 15;
    var noon = 12 - 7.77 / 15 - d.getTimezoneOffset() / 60;
    return { rise: noon - half, set: noon + half };
  }
  function daylight() {
    var d = new Date(), h = d.getHours() + d.getMinutes() / 60, t = sunTimes(d);
    if (h < t.rise - 0.5 || h > t.set + 0.6) return "night";
    if (h < t.rise + 0.6 || h > t.set - 0.6) return "twilight";
    return "day";
  }
  var lampOverride = null, lastPhase = null;
  function lampOn(phase) { var auto = phase !== "day" && !s.asleep; return lampOverride === null ? auto : lampOverride; }
  function skyTime() {
    var phase = daylight(), sky = document.getElementById("sky");
    if (phase !== lastPhase) { lastPhase = phase; lampOverride = null; }
    sky.classList.toggle("sky-night", phase === "night");
    sky.classList.toggle("sky-eve", phase === "twilight");
    document.getElementById("moon").classList.remove("on");
    var on = lampOn(phase), lamp = document.getElementById("lamp");
    if (lamp && PROPS.lamp_on) { lamp.innerHTML = svgOf(on ? PROPS.lamp_on.svg : PROPS.lamp_off.svg, 16, 46); lamp.classList.toggle("lit", on); }
    // light in the room: daylight, lamp light or darkness
    // inside the house it is always light; only the view through the windows gets dark
    var n = document.getElementById("night"), dark = s.asleep ? 0.22 : 0;
    if (on && dark) {
      n.style.background = "radial-gradient(ellipse 42% 58% at " + (L.lamp.x / GW * 100) + "% " + ((L.lamp.y + 8) / GH * 100) + "%, rgba(255, 196, 110, " + (0.16) + ") 0%, rgba(24, 26, 64, " + (dark * 0.35) + ") 50%, rgba(24, 26, 64, " + (dark * 0.85) + ") 100%)";
    } else n.style.background = "rgba(24, 26, 64, " + dark + ")";
    n.classList.toggle("on", dark > 0);
  }
  setInterval(skyTime, 60000);

  // ---------- hamster rendering ----------
  var H = { x: SPOT.home.x, y: SPOT.home.y, scale: HS, dir: 1, sprite: "front", where: "floor" };
  var F = { ears: "up", eyes: "open", mouth: "smile", paws: "down", blush: false, cheeks: null, hold: null, holdScale: 1, nose: false, whisk: 0, blink: null, twitch: false, blanket: null };
  function setSprite(key, html) {
    var sz = SZ[key];
    svg.setAttribute("viewBox", "0 0 " + sz[0] + " " + sz[1]);
    ham.style.width = gx(sz[0] * H.scale);
    svg.innerHTML = html;
  }
  var FOOD = { seed: "seed", carrot: "carrot", apple: "apple" };
  var bookColor = "#c8463c";
  function heldFood() {
    if (!F.hold) return "";
    if (F.hold.indexOf("book") === 0) {
      var bz = SZ[F.hold], bx = 24 - bz[0] / 2, by = (F.hold === "book" ? 37 : 39) - bz[1];
      return '<g transform="translate(' + bx + ' ' + by + ')">' + A[F.hold].split("#c8463c").join(bookColor) + '</g>';
    }
    var k = FOOD[F.hold], sz = SZ[k], sc = F.holdScale;
    var x = 24 - sz[0] * sc / 2, y = 31.5 - sz[1] * sc;
    return '<g transform="translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') scale(' + sc.toFixed(2) + ')">' + A[k] + '</g>';
  }
  function renderFront(bodyKey, opt) {
    opt = opt || {};
    var ears = F.twitch && F.ears === "up" ? "twitch" : F.ears;
    var l = [bodyKey, "ears_" + ears];
    var chk = F.cheeks || (Date.now() < stashUntil ? "l" : null);
    if (chk) l.push("cheeks_" + chk);
    l.push("whisk" + F.whisk, (opt.nose != null ? opt.nose : F.nose) ? "nose_up" : "nose", "eyes_" + (F.blink || opt.eyes || F.eyes), "mouth_" + (opt.mouth || F.mouth));
    if (F.blush) l.push("blush");
    var html = l.map(function (x) { return A[x]; }).join("") + outfitPart("scarf");
    if (F.blanket != null && !opt.paws) html += A["blanket" + F.blanket];
    else if (F.hold && F.hold.indexOf("book") === 0) html += A["paws_" + (F.hold === "book" ? "hold" : "down")] + heldFood();
    else html += (opt.paws ? "" : heldFood()) + A["paws_" + (opt.paws || F.paws)];
    flipEl.classList.remove("left");
    setSprite(bodyKey === "body_tall" ? "body_tall" : "body", html + outfitPart("hat"));
  }
  function front(over) {
    if (over) for (var k in over) F[k] = over[k];
    H.sprite = "front"; renderFront("body");
  }
  function lookDir() { return H.dir < 0 ? "look_l" : "look_r"; }
  // walking from the front: the feet take turns, the body waddles, the eyes look where he goes
  function sideFrame(i) { H.sprite = "walk"; renderFront(["body", "body_l", "body", "body_r"][i], { eyes: F.eyes === "open" || F.eyes === "look_l" || F.eyes === "look_r" || F.eyes === "happy" ? lookDir() : null, paws: F.hold ? null : "down" }); }
  // standing up on the hind legs, from the front, sniffing
  function backFrame(i) { H.sprite = "back"; flipEl.classList.remove("left"); setSprite("back0", A["back" + i] + outfitPart("scarf_back") + outfitPart("hat_back")); }
  function standFrame(i) { H.sprite = "stand"; renderFront("body_tall", { eyes: lookDir(), paws: "hold", nose: i % 2 === 1, mouth: i % 2 ? "teeth" : "smile" }); }
  function moveTo(x, y, ms) {
    H.x = x; H.y = y;
    ham.style.transition = ms ? "left " + ms + "ms linear, bottom " + ms + "ms linear" : "none";
    ham.style.left = gx(x); ham.style.bottom = gb(y);
    if (!ms) void ham.offsetWidth;   // jump now, so the next walk starts from here
  }
  function body(cls) { bodyEl.className = "ham-body" + (cls ? " " + cls : ""); }
  function pulse(cls, ms) { body(""); void bodyEl.offsetWidth; body(cls); later(function () { if (bodyEl.classList.contains(cls)) body(busy ? "" : "breathe"); }, ms || 500); }
  function freeze() {
    var r = ham.getBoundingClientRect(), sc = scene.getBoundingClientRect();
    if (!sc.width) return;
    moveTo((r.left + r.width / 2 - sc.left) / sc.width * GW, (r.bottom - sc.top) / sc.height * GH, 0);
  }

  // ambient micro animations: blinking, nose wiggle, whiskers, ear twitch
  function canFace() { return H.sprite === "front" && ["open", "look_l", "look_r", "sad", "tired", "wide"].indexOf(F.eyes) >= 0; }
  (function blinkLoop() {
    setTimeout(blinkLoop, rnd(2200, 5200));
    if (!canFace()) return;
    var seq = [["half", 50], ["sleep", 80], ["half", 50], [null, 0]];
    if (Math.random() < 0.2) seq = seq.concat([["half", 50], ["sleep", 70], ["half", 40], [null, 0]]);
    var t = 0; seq.forEach(function (st) { setTimeout(function () { if (H.sprite === "front") { F.blink = st[0]; front(); } }, t); t += st[1]; });
  })();
  (function noseLoop() {
    setTimeout(noseLoop, rnd(1400, 3800));
    if (H.sprite !== "front" || s.asleep) return;
    var n = Math.random() < 0.5 ? 4 : 2;
    for (var i = 0; i < n; i++) (function (i) { setTimeout(function () { if (H.sprite === "front") { F.nose = i % 2 === 0; F.whisk = i % 2 === 0 ? 1 : 0; front(); } }, i * 95); })(i);
    setTimeout(function () { if (H.sprite === "front") { F.nose = false; F.whisk = 0; front(); } }, n * 95);
  })();
  (function earLoop() {
    setTimeout(earLoop, rnd(5000, 11000));
    if (H.sprite !== "front" || F.ears !== "up" || s.asleep) return;
    F.twitch = true; front(); setTimeout(function () { F.twitch = false; if (H.sprite === "front") front(); }, 170);
  })();

  // ---------- effects ----------
  function fx(name, x, y, cls, scale, style) {
    var sz = SZ[name], el = document.createElement("div");
    if (name === "spark") sz = [7, 7];
    el.className = "fx " + cls; el.style.left = gx(x - sz[0] * (scale || 1) / 2); el.style.top = gy(y); el.style.width = gx(sz[0] * (scale || 1));
    if (style) for (var k in style) el.style.setProperty(k, style[k]);
    el.innerHTML = svgOf(A[name], sz[0], sz[1]);
    scene.appendChild(el); setTimeout(function () { el.remove(); }, 2000);
  }
  function headY() { return H.y - (H.sprite === "stand" ? 52 : 46) * H.scale; }
  function slotEl(cat) { return document.getElementById("slot-" + cat); }
  function slotAnim(cat, cls, ms) { var el = slotEl(cat); el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); if (ms) later(function () { el.classList.remove(cls); }, ms); }

  // ---------- action runner ----------
  var STOP = {}, token = 0;
  function wait(ms) { var t = token; return new Promise(function (res, rej) { later(function () { t === token ? res() : rej(STOP); }, ms); }); }
  function act(name, fn) {
    token++; var my = token; busy = true; cur = name; thought.classList.remove("on");
    return fn().catch(function (e) { if (e !== STOP) console.error(e); }).then(function () { if (my === token) { busy = false; cur = null; settle(); } });
  }
  function interrupt() { token++; busy = false; cur = null; freeze(); }
  var IDLE_ACTS = ["blissful", "plant", "read", "groom", "look", "wander", "shelf", "chair", "yawn", "binky", "sigh", "window", "sniff", "home"];
  function interruptible() { return !busy || IDLE_ACTS.indexOf(cur) >= 0; }

  function mood() {
    var low = lowest(), avg = (s.food + s.energy + s.love + s.fun) / 4;
    if (s[low.id] < 25) return low.id === "energy" ? { eyes: "tired", mouth: "flat", ears: "up", blush: false } : { eyes: "sad", mouth: "frown", ears: "flat", blush: false };
    if (s.music || avg > 72) return { eyes: "open", mouth: "smile", ears: "up", blush: true };
    if (avg > 45) return { eyes: "open", mouth: "smile", ears: "up", blush: false };
    return { eyes: "open", mouth: "flat", ears: "up", blush: false };
  }
  function lowest() { return STATS.slice().sort(function (a, b) { return s[a.id] - s[b.id]; })[0]; }
  function settle() {
    if (s.asleep) return;
    var m = mood(); m.paws = "down"; m.hold = null; m.blanket = null; if (cheeksTimer == null) m.cheeks = null;
    front(m); body(s.music ? "" : "breathe");
    updateThought();
  }

  // walking with a four-frame cycle; speed in grid units per second
  async function walkTo(x, y, speed) {
    speed = speed || (s.energy < 30 ? 26 : 38);   /* a little slower when he is tired, but not crawling */
    var dx = x - H.x, dy = y - H.y, d = Math.hypot(dx, dy);
    if (d < 1.5) return;
    if (Math.abs(dx) > 1) H.dir = dx < 0 ? -1 : 1;
    body("waddle"); var ms = d / speed * 1000, f = 0;
    sideFrame(0); moveTo(x, y, ms);
    var iv = setInterval(function () { f = (f + 1) % 4; sideFrame(f); }, speed > 35 ? 80 : 120);
    try { await wait(ms); } finally { clearInterval(iv); }
  }
  function faceTo(x) { H.dir = x < H.x ? -1 : 1; }
  async function nibbleNose(n) { for (var i = 0; i < n; i++) { F.nose = !F.nose; F.whisk = F.nose ? 1 : 0; front(); await wait(85); } F.nose = false; F.whisk = 0; front(); }

  // ---------- behaviours ----------
  async function groom() {
    front({ eyes: "happy", mouth: "flat", ears: "up" });
    for (var i = 0; i < 6; i++) { front({ paws: i % 2 ? "wash_r" : "wash_l" }); await wait(170); }
    front({ paws: "cover", eyes: "sleep" }); await wait(350);
    front({ paws: "up", ears: "flat" }); await wait(260); front({ paws: "down", ears: "up", eyes: "happy" });
    pulse("fluff", 520); fx("spark", H.x - 12, headY() + 4, "sparkle", 1); fx("spark", H.x + 13, headY() + 10, "sparkle", 1);
    await wait(600);
  }
  async function lookAround() {
    front({ eyes: "look_l", mouth: "flat" }); await wait(700);
    front({ eyes: "look_r" }); await wait(700);
    front({ eyes: "open", mouth: "smile" }); await nibbleNose(4);
  }
  async function wander() {
    var x = rnd(86, 132), y = rnd(119, 128);
    await walkTo(x, y); front(mood()); await nibbleNose(6); await wait(500);
  }
  async function goHome() { await walkTo(SPOT.home.x, SPOT.home.y); }
  async function visitShelf() {
    await walkTo(SPOT.shelf.x, SPOT.shelf.y); H.dir = -1;
    for (var i = 0; i < 7; i++) { standFrame(i % 2); await wait(200); }
    slotAnim("shelf", "rustle", 2200);
    standFrame(0); await wait(500);
    front({ eyes: "happy", mouth: "smile" }); await wait(400);
    await walkTo(SPOT.home.x, SPOT.home.y);
  }
  async function lookOutside() {
    await walkTo(SPOT.window.x, SPOT.window.y); H.dir = 1;
    front({ eyes: "open", mouth: "smile" }); await wait(250);
    backFrame(0); pulse("hop", 300); await wait(1200);
    document.getElementById("win").classList.add("breeze"); later(function () { document.getElementById("win").classList.remove("breeze"); }, 2900);
    for (var i = 0; i < 6; i++) { backFrame(i % 2); await wait(i % 2 ? 900 : 500); }
    backFrame(0); await wait(600);
    front({ eyes: "happy", mouth: "smile" }); pulse("hop", 300); await wait(400);
    await walkTo(SPOT.home.x, SPOT.home.y);
  }
  var BOOK_COLORS = ["#c8463c", "#4f86c6", "#5e9a5a", "#8a5aa8", "#e0a020"];
  async function readBook() {
    var it = chairItem(); if (!it || !home.placed.shelf) return;
    await walkTo(SPOT.shelf.x, SPOT.shelf.y); H.dir = -1;
    for (var i = 0; i < 4; i++) { standFrame(i % 2); await wait(200); }
    slotAnim("shelf", "rustle", 1500);
    bookColor = pick(BOOK_COLORS);
    front({ hold: "book", eyes: "happy", mouth: "smile", paws: "hold" }); pulse("hop", 300); await wait(600);
    await walkTo(SPOT.chairFront.x, SPOT.chairFront.y);
    await hopIntoChair(it);
    front({ hold: "book", eyes: "open", mouth: "smile" }); await wait(400);
    front({ hold: "book_open", eyes: "down", mouth: "flat" }); await wait(1400);
    var pages = 3 + Math.floor(Math.random() * 3);
    for (var p = 0; p < pages; p++) {
      await wait(rnd(1800, 2800));
      front({ hold: "book_flip" }); await wait(220); front({ hold: "book_open" });
      if (Math.random() < 0.3) { front({ eyes: "wide", mouth: "open" }); await wait(700); front({ eyes: "down", mouth: "flat" }); }
      else if (Math.random() < 0.3) { front({ mouth: "smile", blush: true }); await nibbleNose(4); front({ mouth: "flat" }); }
    }
    await wait(1200);
    front({ hold: "book", eyes: "happy", mouth: "smile" }); await wait(700);
    await hopOutOfChair();
    await walkTo(SPOT.shelf.x, SPOT.shelf.y); H.dir = -1;
    standFrame(0); await wait(300); slotAnim("shelf", "rustle", 1200);
    F.hold = null; standFrame(1); await wait(400);
    front({ eyes: "happy" }); await wait(300);
    await walkTo(SPOT.home.x, SPOT.home.y);
  }
  async function sniffPlant() {
    if (!home.placed.plant) return;
    await walkTo(SPOT.plant.x, SPOT.plant.y); H.dir = 1;
    for (var i = 0; i < 6; i++) { standFrame(i % 2); await wait(200); }
    slotAnim("plant", "rustle", 1800);
    front({ eyes: "happy", mouth: "smile", blush: true }); await nibbleNose(6); await wait(400);
    await walkTo(SPOT.home.x, SPOT.home.y);
  }
  async function sniffFloor() {
    faceTo(H.x + (Math.random() < 0.5 ? -1 : 1));
    for (var i = 0; i < 6; i++) { standFrame(i % 2); await wait(170); }
    standFrame(0); await wait(300);
    front(); await nibbleNose(4);
  }
  async function yawn() {
    front({ eyes: "tired", mouth: "yawn", paws: "up" }); pulse("stretch", 1000); await wait(1000);
    front({ eyes: "half", mouth: "flat", paws: "down" }); await wait(400);
    front({ eyes: "tired" }); await wait(300);
  }
  async function binky() {
    front({ eyes: "happy", mouth: "grin", blush: true, paws: "up" }); pulse("bighop", 620);
    fx("spark", H.x - 14, headY(), "sparkle"); fx("spark", H.x + 14, headY() + 6, "sparkle");
    await wait(650); front({ paws: "down", mouth: "smile" }); await wait(400);
  }
  async function sigh() {
    var low = lowest();
    front({ eyes: "sad", mouth: "frown", ears: "flat" });
    if (low.id === "food") { await wait(300); front({ eyes: "look_r" }); await wait(900); front({ eyes: "sad" }); }
    pulse("squat", 400); showThought(true); await wait(1400);
  }
  async function chairVisit() {
    var it = chairItem(); if (!it) return;
    await walkTo(SPOT.chairFront.x, SPOT.chairFront.y);
    await hopIntoChair(it);
    front({ eyes: "happy", mouth: "smile", blush: true, paws: "down" }); await wait(1600);
    await nibbleNose(4); front({ eyes: "look_l" }); await wait(600); front({ eyes: "happy" }); await wait(1200);
    await hopOutOfChair();
  }
  function chairItem() { return home && home.placed.chair ? item("chair", home.placed.chair) : null; }
  function seatPos(it) { return { x: L.chair.x + L.chair.w / 2, y: L.chair.bottom - L.chair.h + it.seat + 2 }; }
  async function hopIntoChair(it) {
    front({ eyes: "open", mouth: "smile", paws: "up" }); pulse("squat", 200); await wait(180);
    var p = seatPos(it); H.scale = CHAIR_S; body("jump"); moveTo(p.x, p.y, 520); front();
    await wait(540); ham.classList.add("in-chair"); H.where = "chair";
    slotAnim("chair", it.id === "beanbag" ? "squish" : "squash", 700);
    body("");
  }
  async function hopOutOfChair() {
    front({ paws: "up", eyes: "open" }); await wait(150);
    H.scale = HS; body("jump"); moveTo(SPOT.chairFront.x, SPOT.chairFront.y, 520); front();
    await wait(540); ham.classList.remove("in-chair"); H.where = "floor";
    slotAnim("chair", "squash", 500); pulse("hop", 420); await wait(300);
  }

  // feeding: the food drops into the bowl, the hamster runs over, nibbles and stuffs his cheeks
  var cheeksTimer = null, stashUntil = 0, stashFood = 0;
  // a full hamster still takes every treat: it goes into his cheeks, which stay chubby for a while
  setInterval(function () {
    if (!stashFood || Date.now() < stashUntil) return;
    s.food = clamp(s.food + stashFood); stashFood = 0; renderNeeds();
    if (!busy && !s.asleep) act("swallow", async function () {
      front({ paws: "hold", eyes: "happy", mouth: "chew" }); body("nibble"); await wait(900);
      body(""); front({ paws: "down", mouth: "smile" }); pulse("squat", 250); say(N() + " hat seinen Backenvorrat aufgefuttert."); await wait(400);
    }); else if (H.sprite === "front") front();
  }, 2000);
  function dropIntoBowl(kind) {
    var k2 = FOOD[kind] || kind, sz = SZ[k2], el = document.createElement("div");
    el.className = "bowl-food"; el.id = "bowl-food";
    el.style.left = gx(L.bowl.x + 14 - sz[0] / 2); el.style.top = gy(L.bowl.y + 5 - sz[1]); el.style.width = gx(sz[0]);
    el.innerHTML = svgOf(A[k2], sz[0], sz[1]);
    var old = document.getElementById("bowl-food"); if (old) old.remove();
    document.getElementById("room").appendChild(el); return el;
  }
  async function feedSeq(kind) {
    ham.style.opacity = "1";
    var full = s.food > 85;
    if (place2 === "garden") await goInsideSeq();
    var food = dropIntoBowl(kind);
    front({ eyes: "wide", ears: "up", mouth: "open", paws: "up" }); pulse("hop", 420);
    say({ seed: "Kerne! " + N() + " flitzt zum Napf.", carrot: "Eine Karotte! " + N() + " ist schon unterwegs.", apple: "Ein Apfel! " + N() + " kann es kaum fassen." }[kind] || GFOOD[kind].say);
    await wait(500);
    if (H.where === "chair") await hopOutOfChair();
    await walkTo(SPOT.bowl.x, SPOT.bowl.y, 46);
    front({ eyes: "open", mouth: "smile", paws: "down" }); await nibbleNose(6);
    food.remove();
    if (full) {
      // too full to eat: stuff it all into the cheeks
      front({ hold: kind, holdScale: 1, paws: "hold", eyes: "happy", mouth: "teeth" });
      for (var j = 0; j < 8; j++) { F.holdScale = Math.max(0.2, 1 - j / 8); F.cheeks = j < 3 ? null : j < 6 ? "s" : "l"; F.mouth = j % 2 ? "teeth" : "chew"; front(); await wait(140); }
      var val = GFOOD[kind] ? GFOOD[kind].food : kind === "apple" ? 20 : kind === "seed" ? 15 : 25;
      if (GFOOD[kind]) { garden.harvest[kind]--; renderFoods(); } else if (kind === "apple") s.treats--;
      stashFood = Math.min(60, stashFood + val); stashUntil = Math.max(stashUntil, Date.now()) + 90000; renderNeeds();
      front({ hold: null, cheeks: null, paws: "down", mouth: "smile", eyes: "happy", blush: true }); pulse("hop", 420);
      say(N() + " ist eigentlich satt und stopft alles in die Backen. Dicke Backen!");
      await wait(600); await walkTo(SPOT.home.x, SPOT.home.y); return;
    }
    front({ hold: kind, holdScale: 1, paws: "hold", eyes: "happy", mouth: "chew" }); body("nibble");
    var n = kind === "seed" ? 12 : 16;
    for (var i = 0; i < n; i++) {
      F.mouth = i % 2 ? "teeth" : "chew"; F.nose = i % 3 === 0; F.holdScale = Math.max(0.25, 1 - i / n * 0.8);
      if (kind === "seed" && i === 5) F.cheeks = "s";
      if (kind === "seed" && i === 9) { F.cheeks = "l"; F.hold = null; }
      if (kind === "apple" && i === 8) { F.blush = true; fx("heart", H.x + rnd(-10, 10), headY(), "up"); }
      front();
      if (i % 3 === 1 && kind !== "seed") fx("crumb", H.x + rnd(-3, 3), H.y - 14 * H.scale - 8, "fall", 1, { "--dx": rnd(-6, 6) + "px" });
      await wait(150);
    }
    F.nose = false;
    if (GFOOD[kind]) { var gf = GFOOD[kind]; garden.harvest[kind]--; s.food = clamp(s.food + gf.food); s.fun = clamp(s.fun + (gf.fun || 0)); s.love = clamp(s.love + (gf.love || 0)); renderFoods(); renderGardenPanel(); }
    else if (kind === "apple") { s.treats--; s.food = clamp(s.food + 20); s.fun = clamp(s.fun + 10); s.love = clamp(s.love + 5); }
    else s.food = clamp(s.food + (kind === "seed" ? 15 : 25));
    renderNeeds();
    front({ hold: null, paws: "down", mouth: "smile", eyes: "happy", cheeks: kind === "seed" ? "l" : null }); body(""); pulse("hop", 420);
    say({ seed: "Backen voll! Dicke Backen.", carrot: "Knusper, knusper. Lecker.", apple: N() + " ist rundum glücklich." }[kind] || N() + " schmatzt zufrieden.");
    await wait(500);
    await walkTo(SPOT.home.x, SPOT.home.y);
    if (F.cheeks) {
      front({ cheeks: "l", paws: "hold", eyes: "happy", mouth: "flat" }); await wait(500);
      front({ cheeks: "s" }); pulse("squat", 250); await wait(400);
      front({ cheeks: null, paws: "down", mouth: "smile" }); await wait(300);
    }
  }

  // petting: leaning into the finger, ears relaxed; too much and he gets grumpy
  var petCount = 0, petReset = null, petEnd = null;
  function pet(fromRub, side) {
    if (s.asleep) return;
    if (!interruptible()) return;
    if (busy) interrupt();
    if (H.where === "chair") { /* fine, he can be petted in the chair */ }
    petCount++; clearTimeout(petReset); petReset = setTimeout(function () { petCount = 0; }, 4000);
    if (petCount > 6) { petCount = 0; act("blissful", blissful); return; }
    s.love = clamp(s.love + 8); renderNeeds();
    front({ eyes: "happy", mouth: "smile", ears: "flat", blush: true, paws: "down" });
    body(side < 0 ? "lean-l" : side > 0 ? "lean-r" : "squat");
    fx("heart", H.x + rnd(-12, 12), headY() + 2, "up", 1);
    if (petCount === 1) say(fromRub ? N() + " schließt die Augen und genießt es." : N() + " kuschelt sich an deine Hand.");
    clearTimeout(petEnd); petEnd = later(function () { if (!busy) settle(); }, 1100);
  }
  // lots of cuddles make him blissfully happy: a little wash and three hearts over his head
  async function blissful() {
    front({ eyes: "happy", mouth: "grin", ears: "up", blush: true, paws: "up" }); pulse("hop", 400);
    say(N() + " ist ganz glücklich.");
    for (var k = 0; k < 3; k++) later(function (k) { fx("heart", H.x - 8 + k * 8, headY() - 4 - (k % 2) * 3, "up", 1.2); }.bind(null, k), k * 160);
    await wait(500);
    for (var i = 0; i < 6; i++) { front({ paws: i % 2 ? "wash_r" : "wash_l", eyes: "sleep", mouth: "flat", blush: true }); await wait(170); }
    front({ paws: "down", eyes: "happy", mouth: "smile", blush: true }); pulse("fluff", 520); await wait(600);
  }
  async function grumpy() {
    front({ ears: "flat", eyes: "grumpy", mouth: "frown", blush: false }); pulse("tremble", 1000);
    say("Genug gekuschelt, findet " + N() + ".");
    await wait(1000);
    if (H.where === "floor") {
      var tx = H.x > 100 ? H.x - 22 : H.x + 22; await walkTo(tx, H.y, 34);
      front({ eyes: "grumpy", mouth: "flat" }); await wait(1200);
      front({ eyes: "look_l" }); await wait(500);
    }
  }
  var HOP_SAY = ["Huhu!", "Knusper, knusper!", "Hihi!", "Hallo du!", "Da bin ich!", "Juhu!", "Pieps!", "Schön, dass du da bist!", "Hast du ein Leckerli?", "Hopsa!", "Na, was machen wir heute?", "Ich hab dich lieb!"], hopLast = -1;
  async function startle() {                                          // tapped: a happy little jump and a word or two, no fright
    var i; do { i = Math.floor(Math.random() * HOP_SAY.length); } while (i === hopLast && HOP_SAY.length > 1); hopLast = i;
    front({ eyes: "happy", ears: "up", mouth: "grin", paws: "up", blush: true }); pulse("bighop", 620);
    say(HOP_SAY[i]); beep([[784, .04], [988, .05], [1175, .06]]);
    s.love = clamp(s.love + 2);
    await wait(650); front({ eyes: "happy", mouth: "smile", paws: "down", blush: true }); await wait(700);
  }
  function poke() {
    if (s.asleep) { if (!busy) act("wake", function () { return wakeSeq(true); }); return; }
    if (!interruptible()) return;
    act("startle", startle);
  }

  // sleeping: yawn, stretch, walk to the armchair (or the rug) and curl up
  var zzzT = null, dreamT = null;
  async function sleepSeq() {
    if (place2 === "garden") await goInsideSeq();
    front({ eyes: "tired", mouth: "yawn", paws: "up" }); pulse("stretch", 1000); await wait(1000);
    front({ eyes: "half", mouth: "flat", paws: "down" }); await wait(350);
    s.asleep = true; sleepH = 0; syncButtons(); skyTime();
    var it = chairItem();
    if (it) {
      if (H.where !== "chair") { await walkTo(SPOT.chairFront.x, SPOT.chairFront.y, 18); await hopIntoChair(it); }
      say(N() + " kuschelt sich in den Sessel. Gute Nacht.");
    } else {
      await walkTo(SPOT.home.x, SPOT.home.y - 2, 18);
      say("Gute Nacht, " + N() + ".");
    }
    // pull the blanket up to the chin
    front({ eyes: "half", mouth: "smile", paws: "down", ears: "up", blush: true }); body(""); await wait(300);
    front({ blanket: 0 }); await wait(260);
    front({ blanket: 1 }); pulse("squat", 200); await wait(260);
    front({ blanket: 2, eyes: "half" }); await wait(450);
    front({ eyes: "sleep", mouth: "flat", ears: "flat" }); body("snooze");
    if (it && it.id === "rocking") slotEl("chair").classList.add("rock");
    if (it && it.id === "egg") slotEl("chair").classList.add("sway");
    startZzz();
  }
  function startZzz() {
    clearInterval(zzzT); clearInterval(dreamT);
    zzzT = setInterval(function () { if (s.asleep && F.blanket != null) fx("zz", H.x + 6 * H.dir + rnd(-2, 4), headY() - 2, "up", H.scale); }, 1300);
    dreamT = setInterval(function () {
      if (!s.asleep || busy) return;
      front({ mouth: "chew" }); setTimeout(function () { if (s.asleep) front({ mouth: "smile" }); }, 500); setTimeout(function () { if (s.asleep) front({ mouth: "flat" }); }, 1600);
      if (Math.random() < 0.5) {
        var d = pick(["seed", "apple", "heart"]);
        thought.className = "thought dream on";
        thought.innerHTML = svgOf(A[d], SZ[d][0], SZ[d][1]) + "<span>…</span>";
        posThought();
        setTimeout(function () { thought.className = "thought"; }, 2200);
      }
    }, 7000);
  }
  function stopZzz() { clearInterval(zzzT); clearInterval(dreamT); slotEl("chair").classList.remove("rock", "sway"); thought.className = "thought"; }
  async function wakeSeq(byPoke) {
    s.asleep = false; stopZzz(); syncButtons(); skyTime();
    front({ eyes: "sleep", mouth: "flat", ears: "flat", blanket: 2 }); body(""); await wait(400);
    front({ eyes: "half", ears: "up" }); await wait(500);
    front({ blanket: 1 }); await wait(260); front({ blanket: 0 }); pulse("squat", 200); await wait(260);
    front({ blanket: null, paws: "down" }); await wait(200);
    if (s.energy < 50) {
      front({ eyes: "tired", mouth: "yawn", paws: "up" }); pulse("stretch", 1000);
      say(byPoke ? N() + " blinzelt verschlafen. Noch fünf Minuten …" : N() + " gähnt. Er ist noch ziemlich müde.");
      await wait(1100); front({ eyes: "tired", mouth: "flat", paws: "down" }); await wait(600);
    } else {
      front({ eyes: "happy", mouth: "yawn", paws: "up" }); pulse("stretch", 1000); await wait(1000);
      say("Ausgeschlafen! " + N() + " ist wach.");
    }
    for (var i = 0; i < 4; i++) { front({ paws: i % 2 ? "wash_r" : "wash_l", eyes: "sleep", mouth: "flat" }); await wait(160); }
    front({ paws: "down", eyes: "open", mouth: "smile" }); pulse("fluff", 520); await wait(500);
    if (H.where === "chair") await hopOutOfChair();
    await walkTo(SPOT.home.x, SPOT.home.y);
  }
  function sleep() { if (busy) interrupt(); ham.style.opacity = "1"; front({ hold: null }); var dl = document.getElementById("door-leaf"); if (dl) dl.classList.remove("open"); s.music = false; stopMusic(); document.getElementById("tracks").hidden = true; act("sleep", sleepSeq); }
  function wake(byPoke) { if (busy) interrupt(); act("wake", function () { return wakeSeq(byPoke); }); }

  // dancing to the music: one pose per beat, the style depends on the tempo
  var beatT = null, beatN = 0;
  function startDance(tr) {
    clearInterval(beatT); beatN = 0;
    var beat = 60000 / tr.bpm;
    beatT = setInterval(function () { danceTick(tr); }, beat);
  }
  function danceTick(tr) {
    if (!s.music || busy || s.asleep) return;
    var n = beatN++;
    if (tr.bpm >= 125) {
      var step = n % 8;
      if (step === 0) { front({ eyes: "happy", mouth: "grin", paws: "side_l", blush: true }); body("lean-l"); }
      else if (step === 1) { front({ paws: "side_r" }); body("lean-r"); }
      else if (step === 2) { front({ paws: "side_l", mouth: "smile" }); body("lean-l"); }
      else if (step === 3) { front({ paws: "side_r", mouth: "grin" }); body("lean-r"); }
      else if (step === 4) { front({ paws: "hold", mouth: "grin" }); pulse("hop", 300); }
      else if (step === 5) { front({ paws: "hold", mouth: "smile" }); pulse("hop", 300); }
      else if (step === 6) { H.dir = -1; sideFrame(1); body("waddle"); }
      else { H.dir = 1; sideFrame(3); body("waddle"); }
    } else if (tr.bpm >= 100) {
      var st = n % 4;
      front({ eyes: "happy", mouth: st % 2 ? "smile" : "grin", paws: st % 2 ? "side_r" : "side_l", blush: true });
      body(st % 2 ? "lean-r" : "lean-l");
    } else {
      front({ eyes: "sleep", mouth: "smile", paws: "hold", blush: true });
      body(n % 2 ? "lean-r" : "lean-l");
    }
    if (n % 2 === 0) fx("note", H.x + rnd(-20, 20), headY() + rnd(-4, 6), "up", 1.2);
  }

  // idle life
  function idle() {
    later(idle, rnd(3500, 7000));
    if (busy || s.asleep || s.music || decor || document.getElementById("scr-hamster").hidden) return;
    var low = lowest(), avg = (s.food + s.energy + s.love + s.fun) / 4, r = Math.random();
    if (s.energy < 12) { sleep(); say(N() + " ist einfach eingeschlafen."); return; }
    if (place2 === "garden") { gardenIdle(); return; }
    if (H.where === "chair") { act("home", async function () { await hopOutOfChair(); await goHome(); }); return; }
    if (s.energy < 35 && r < 0.4) { act("yawn", yawn); return; }
    if (s[low.id] < 25 && r < 0.5) { act("sigh", sigh); return; }
    var far = Math.hypot(H.x - SPOT.home.x, H.y - SPOT.home.y) > 24;
    var opts = [["groom", 16, groom], ["look", 13, lookAround], ["wander", 14, wander], ["sniff", 10, sniffFloor], ["shelf", 6, visitShelf], ["window", 10, lookOutside]];
    if (chairItem() && home.placed.shelf) opts.push(["read", 12, readBook]);
    if (home.placed.plant) opts.push(["plant", 7, sniffPlant]);
    if (chairItem()) opts.push(["chair", 8, chairVisit]);
    if (avg > 70) opts.push(["binky", 9, binky]);
    if (far) opts.push(["home", 18, goHome]);
    var tot = opts.reduce(function (a, o) { return a + o[1]; }, 0), x = Math.random() * tot;
    for (var i = 0; i < opts.length; i++) { x -= opts[i][1]; if (x <= 0) { act(opts[i][0], opts[i][2]); return; } }
  }

  // thought bubble with the most urgent need
  var NEED_TEXT = { food: "Hunger!", energy: "So müde …", love: "Kuscheln?", fun: "Langweilig …" };
  function posThought() {
    var x = Math.min(H.x + 10, GW - 52), y = Math.max(2, headY() - 16);
    thought.style.left = gx(x); thought.style.top = gy(y);
  }
  function showThought(force) {
    var low = lowest();
    if ((s[low.id] < 40 || force) && !s.asleep) {
      thought.className = "thought on";
      thought.innerHTML = svgOf(A[low.icon], SZ[low.icon][0], SZ[low.icon][1]) + NEED_TEXT[low.id];
      posThought();
    } else thought.className = "thought";
  }
  function updateThought() { if (busy && cur !== "sigh") { if (!thought.classList.contains("dream")) thought.classList.remove("on"); return; } showThought(false); }

  // ---------- needs / ui ----------
  function renderNeeds() {
    document.getElementById("needs").innerHTML = STATS.map(function (st) {
      var v = Math.round(s[st.id]);
      var col = v > 60 ? "var(--good)" : v > 30 ? "var(--warn)" : "var(--bad)";
      return '<div class="need"><div class="need-head"><span>' + st.label + '</span><span>' + v + ' %</span></div>' +
        '<div class="bar" role="meter" aria-label="' + st.label + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + v + '"><i style="width:' + v + '%; background:' + col + '"></i></div></div>';
    }).join("");
    document.getElementById("ham-age").textContent = "3 Tage alt · " + s.treats + " Leckerli";
  }
  function syncButtons() {
    var sl = document.getElementById("a-sleep");
    sl.setAttribute("aria-pressed", s.asleep); sl.querySelector("span").textContent = s.asleep ? "Aufwecken" : "Schlafen";
    document.getElementById("a-music").setAttribute("aria-pressed", s.music);
    ["a-pet", "a-music"].forEach(function (id) { document.getElementById(id).disabled = s.asleep; });
    skyTime();
  }
  function refresh() { renderNeeds(); syncButtons(); if (!busy && !s.asleep && !s.music) settle(); renderCosy(); }

  /*MUSIC*/

  // ---------- input: tap = poke, rub = pet ----------
  var down = null, moved = 0, lastPetAt = 0;
  ham.addEventListener("pointerdown", function (e) { down = { x: e.clientX, y: e.clientY }; moved = 0; ham.setPointerCapture(e.pointerId); });
  ham.addEventListener("pointermove", function (e) {
    if (!down) return;
    var dx = e.clientX - down.x;
    moved += Math.abs(dx) + Math.abs(e.clientY - down.y); down = { x: e.clientX, y: e.clientY };
    if (moved > 40 && Date.now() - lastPetAt > 450) { lastPetAt = Date.now(); moved = 0; var r = ham.getBoundingClientRect(); pet(true, e.clientX < r.left + r.width / 2 ? -1 : 1); }
  });
  ham.addEventListener("pointerup", function () { if (down && moved < 12 && Date.now() - lastPetAt > 450) poke(); down = null; });

  function feed(kind) {
    document.getElementById("foods").hidden = true;
    if (kind === "apple" && s.treats < 1) { say("Keine Leckerli mehr. Löse ein Sudoku, dann gibt es neue."); return; }
    if (GFOOD[kind] && !garden.harvest[kind]) return;
    if (busy) interrupt();
    // food wakes him up: he crawls out from under the blanket and comes anyway
    if (s.asleep) { s.asleep = false; stopZzz(); syncButtons(); skyTime(); front({ blanket: null, eyes: "wide", ears: "up", mouth: "open" }); body(""); }
    act("feed", function () { return feedSeq(kind); });
  }
  document.getElementById("a-feed").addEventListener("click", function () { var f = document.getElementById("foods"); f.hidden = !f.hidden; document.getElementById("tracks").hidden = true; });
  document.querySelectorAll(".food-btn").forEach(function (b) { b.addEventListener("click", function () { feed(b.dataset.food); }); });
  document.getElementById("a-pet").addEventListener("click", function () { pet(false, 0); });
  document.getElementById("a-sleep").addEventListener("click", function () { s.asleep ? wake(false) : sleep(); });
  document.getElementById("a-music").addEventListener("click", music);

  // tapping furniture (outside the decorate mode)
  function tapFurniture(cat) {
    var id = home.placed[cat]; if (!id) return;
    if (cat === "clock") {
      if (id === "cuckoo") cuckoo(true);
      else if (id === "alarm") { slotAnim("clock", "ringing", 1500); beep([[1568, .07], [0, .05], [1568, .07], [0, .05], [1568, .07], [0, .05], [1568, .07]]); reactToNoise(); }
      else slotAnim("clock", "wobble", 1000);
    } else if (cat === "chair") {
      if (id === "rocking") { slotAnim("chair", "rock", 3200); }
      else if (id === "egg") slotAnim("chair", "sway", 2400);
      else slotAnim("chair", id === "beanbag" ? "squish" : "squash", 700);
    } else if (cat === "shelf" || cat === "plant") slotAnim(cat, "rustle", 2100);
  }
  ["chair", "clock", "shelf", "plant"].forEach(function (cat) { slotEl(cat).addEventListener("click", function () { if (!decor) tapFurniture(cat); }); });
  function beep(seq) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      var t = actx.currentTime + 0.02, out = actx.createGain(); out.gain.value = 0.5; out.connect(actx.destination);
      seq.forEach(function (n) {
        if (n[0]) { var o = actx.createOscillator(), g = actx.createGain(); o.type = "square"; o.frequency.value = n[0]; g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + n[1]); o.connect(g); g.connect(out); o.start(t); o.stop(t + n[1] + 0.02); }
        t += n[1];
      });
    } catch (e) {}
  }
  function cuckoo(sound) {
    slotAnim("clock", "cuckoo", 1900);
    if (sound) beep([[659, .22], [0, .08], [523, .3], [0, .25], [659, .22], [0, .08], [523, .3]]);
    reactToNoise();
  }
  function reactToNoise() {
    if (busy || s.asleep || s.music) return;
    act("look", async function () { front({ eyes: "wide", ears: "up", mouth: "open" }); pulse("hop", 420); await wait(700); front({ eyes: "look_l", mouth: "flat" }); await wait(800); front({ eyes: "open", mouth: "smile" }); await wait(300); });
  }
  // the cuckoo calls on every full minute, the alarm clock rattles on every full hour
  setInterval(function () {
    var d = new Date(); if (d.getSeconds() !== 0 || !home) return;
    if (home.placed.clock === "cuckoo") cuckoo(actx && actx.state === "running");
    if (home.placed.clock === "alarm" && d.getMinutes() === 0) slotAnim("clock", "ringing", 1500);
  }, 1000);

  // ---------- time ----------
  var sleepH = 0;
  function passHours(h) {
    STATS.forEach(function (st) { s[st.id] = clamp(s[st.id] + DECAY[st.id][s.asleep ? 1 : 0] * h); });
    if (home) trackHappy(h);
    if (s.asleep) sleepH += h;
    // he sleeps until you wake him up
  }
  setInterval(function () { passHours(1 / 120); renderNeeds(); if (!busy) updateThought(); }, 30000);
  setInterval(function () { if (s.asleep) { passHours(0.25); renderNeeds(); } }, 1500);
  document.getElementById("d-hours").addEventListener("click", function () { passHours(3); say("Drei Stunden später …"); refresh(); });
  document.getElementById("d-solve").addEventListener("click", function () {
    s.treats++; renderNeeds();
    var ready = isHappy(), gift = ready ? pickGift() : null;
    openSolved(gift, ready && !gift);
  });
  document.getElementById("d-reset").addEventListener("click", function () {
    timers.forEach(clearTimeout); interrupt(); reset(); resetHome(); setDecor(false); stopMusic(); stopZzz();
    ham.classList.remove("in-chair"); H.where = "floor"; H.scale = HS; moveTo(SPOT.home.x, SPOT.home.y, 0);
    say("Zurückgesetzt."); renderRoom(); refresh(); later(idle, 3000);
  });

  // ---------- screens ----------
  function show(id) { ["scr-start", "scr-name", "scr-hamster"].forEach(function (x) { document.getElementById(x).hidden = x !== id; }); if (id === "scr-start") renderStart(); }
  function faceHTML(f) { var l = ["body", "ears_" + (f.ears || "up"), "whisk0", "nose", "eyes_" + f.eyes, "mouth_" + f.mouth]; if (f.blush) l.push("blush"); l.push("paws_down"); return l.map(function (k) { return A[k]; }).join(""); }
  function renderStart() {
    document.getElementById("start-ham").innerHTML = faceHTML(s.name ? (s.asleep ? { eyes: "sleep", mouth: "flat" } : mood()) : { eyes: "open", mouth: "smile" });
    document.getElementById("start-ham-name").textContent = s.name || "Dein Hamster";
    if (!window.__welcome) window.__welcome = function (k, v) { var el = document.getElementById("wel-h"); if (!el) return; if (k) el.dataset[k] = v || ""; var n = [el.dataset.user, el.dataset.ham].filter(Boolean); el.textContent = "Willkommen" + (n.length ? " " + n.join(" und ") : ""); };
    window.__welcome("ham", s.name);
    var low = lowest(), need = s.name && !s.asleep && s[low.id] < 40;
    document.getElementById("start-dot").hidden = !need || !!(home && home.pending);
    var pb = document.getElementById("start-pkg"); pb.hidden = !(s.name && home && home.pending);
    if (!pb.hidden && !pb.innerHTML) pb.innerHTML = svgOf(PROPS.gift.svg, 24, 24);

  }
  function toast(t) { var el = document.createElement("div"); el.className = "toast"; el.textContent = t; document.body.appendChild(el); setTimeout(function () { el.remove(); }, 2600); }
  document.getElementById("go-sudoku").addEventListener("click", function () { toast("In der App öffnet sich hier dein Sudoku."); });
  document.getElementById("go-hamster").addEventListener("click", function () { if (!s.name) openNaming(); else { show("scr-hamster"); refresh(); if (home.pending) later(openPackage, 900); } });
  function openNaming() { document.getElementById("name-ham").innerHTML = faceHTML({ eyes: "happy", mouth: "smile", blush: true }); document.getElementById("name-input").value = s.name || ""; show("scr-name"); }
  document.getElementById("name-go").addEventListener("click", function () {
    var v = document.getElementById("name-input").value.trim().slice(0, 16);
    if (!v) { var inp = document.getElementById("name-input"); inp.focus(); inp.classList.remove("nudge"); void inp.offsetWidth; inp.classList.add("nudge"); return; }
    var first = !s.name; s.name = v;
    document.getElementById("ham-name").textContent = v; ham.setAttribute("aria-label", "Hamster " + v);
    show("scr-hamster"); refresh();
    say(first ? "Hallo " + v + "! Tippe " + v + " an oder streichle mit dem Finger über ihn." : "Ab jetzt heißt dein Hamster " + v + ".");
    if (first) act("binky", binky);
  });
  document.getElementById("ham-name").addEventListener("click", openNaming);
  document.getElementById("ham-close").addEventListener("click", function () { s.music = false; stopMusic(); document.getElementById("tracks").hidden = true; show("scr-start"); });
  document.getElementById("d-new").addEventListener("click", function () { s.name = null; s.music = false; stopMusic(); show("scr-start"); });

  /*FURNJS*/
  /*GARDEN*/

  /*TESTHOOK*/
  layoutRoom(); renderRoom(); moveTo(SPOT.home.x, SPOT.home.y, 0); front(mood()); renderCosy(); refresh(); show("scr-start"); later(idle, 2500);
})();
