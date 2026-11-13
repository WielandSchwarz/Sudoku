  // ===================== café: the coffee bar (preview) =====================
  // beans into the bowl, grind with the crank, tamp, pull the lever, steam the milk, pour, draw in the foam, a little extra on top
  var COF_ART = /*COFFEEART*/;
  Object.keys(COF_ART).forEach(function (k) { if (typeof COF_ART[k] !== "string") return; var im = new Image(); im.src = COF_ART[k]; TIMG[k] = im; });
  var BEAN = [
    { id: "hell", n: "Helle Röstung", c: "#c8925a", g: "#a8784a", pre: "Sonnenaufgangs", note: "Sonnennote", adj: "mild" },
    { id: "mittel", n: "Mittlere Röstung", c: "#8a5a30", g: "#7a5030", pre: "Waldweg", note: "Waldnote", adj: "rund" },
    { id: "dunkel", n: "Dunkle Röstung", c: "#4a2a18", g: "#3e2414", pre: "Mitternachts", note: "Nachtnote", adj: "kräftig" },
    { id: "nuss", n: "Haselnuss-Bohnen", c: "#8a5a30", g: "#8a6038", pre: "Eichhörnchen", note: "Nussnote", adj: "nussig" },
    { id: "schoko", n: "Schoko-Bohnen", c: "#4a2a18", g: "#4a2c1c", pre: "Dachs", note: "Schokonote", adj: "schokoladig" },
    { id: "zimt", n: "Zimt-Bohnen", c: "#c8925a", g: "#9a6a40", pre: "Igel", note: "Zimtnote", adj: "zimtig" }
  ];
  var DRINK = { E: "Espresso", M: "Macchiato", C: "Cappuccino", L: "Latte" };
  var COF_TOTAL = (6 + 21 + 56) * 4 + 2;
  function bIdx(id) { for (var i = 0; i < BEAN.length; i++) if (BEAN[i].id === id) return i; return -1; }
  function cofKey(ids) { return ids.slice().sort(function (a, b) { return bIdx(a) - bIdx(b); }).join("+"); }
  function cofName(ids, d) {
    if (ids[0] === "kakao") return "Hamster-Kakao" + (d === "KS" ? " mit Schaumkrone" : "");
    var k = cofKey(ids).split("+"), uniq = k.filter(function (v, i) { return k.indexOf(v) === i; });
    var cnt = function (id) { return k.filter(function (v) { return v === id; }).length; };
    uniq.sort(function (a, b) { return cnt(b) - cnt(a) || bIdx(a) - bIdx(b); });
    var main = BEAN[bIdx(uniq[0])], name = main.pre + "-" + DRINK[d];
    var notes = uniq.slice(1).map(function (id) { return BEAN[bIdx(id)].note; });
    if (notes.length) name += " mit " + notes.join(" und ");
    var n = cnt(uniq[0]); if (n === 2) name += ", extra " + main.adj; if (n === 3) name += ", mega " + main.adj;
    return name;
  }
  function cofBook() { var C_ = cfL(); C_.cbook = C_.cbook || {}; return C_.cbook; }
  var COF_ADD = { kakao: "Kakao", zimt: "Zimt", sirup: "Karamell", sahne: "Sahne", keks: "Keks" };
  // ---------- the game ----------
  coffeeGame = function () {
    var G_ = cfGameEl("Bohnen in die Schale"), c = G_.c, phase = "beans", raf = 0, last = performance.now(), pick = [], flies = [], cocoa = false;
    var grind = 0, ang = null, spd = 0, inZ = 0, tot = 0, sGrind = 0, crumbs = [];
    var press = 0, pressing = false, sTamp = 0, mound = 1;
    var lever = 0, leverHeld = null, shot = 0, cupLvl = 0, sShot = 0, drops = [];
    var py = 90, temp = 0, foam = 0, steamHold = false, sMilk = 0, hasMilk = false, bub = [];
    var milk = 0, pourAt = null, F = null, crema = null, sArt = null, strokes = [], cur = null, idleT = 0, decided = false;
    var adds = [], drag = null, sten = 0, addT = {}, stars = 0, drink = "E";
    var JAR = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return { x: 31 + (i % 4) * 36, y: i < 4 ? 17 : 47, w: 32, h: 32 }; });
    var BOWL = { x: 70, y: 98, w: 48, h: 26 }, GRS = { x: 132, y: 84, w: 42, h: 50 }, CBK = { x: 2, y: 94, w: 42, h: 38 };
    var CC = [96, 66], CR = 34;                     // the cup from above: centre and inner radius
    function inR(p, r) { return p[0] >= r.x && p[0] <= r.x + r.w && p[1] >= r.y && p[1] <= r.y + r.h; }
    function pt(e) { var b = G_.cv.getBoundingClientRect(); return [(e.clientX - b.left) / b.width * 180, (e.clientY - b.top) / b.height * 135]; }
    function spr(k, x, y) { var im = TIMG[k]; if (im && im.complete) c.drawImage(im, Math.round(x), Math.round(y)); }
    function shadow(x, y, w) { c.fillStyle = "rgba(58,36,20,.22)"; c.fillRect(Math.round(x), Math.round(y), w, 2); }
    function arrow(x, y, t) { var on = Math.floor(t / 300) % 2; R(c, x - 1, y + on * 2, 3, 4, "#f6c84a"); R(c, x - 3, y + 4 + on * 2, 7, 1, "#f6c84a"); R(c, x - 2, y + 5 + on * 2, 5, 1, "#f6c84a"); R(c, x - 1, y + 6 + on * 2, 3, 1, "#f6c84a"); }
    function wall() { if (cfHome && cfHome.bg && cfHome.bg.complete && cfHome.bg.naturalWidth) { c.drawImage(cfHome.bg, 0, 0); R(c, 0, 0, 180, 135, "rgba(58,36,20,.18)"); spr("bg_counter", 0, 0); return; } var wi = cafeWall(); if (wi.complete && wi.naturalWidth) c.drawImage(wi, 0, 0); drawCafeWindow(c, performance.now()); drawFest(c, "win", performance.now()); spr("bg_counter", 0, 0); }
    function gauge(frac, zone, col) { G_.gauge.innerHTML = woodBarSvg({ w: 60, vertical: true, up: true, frac: Math.max(0, Math.min(1, frac)), zone: zone, col: function (k) { return typeof col === "function" ? col(k) : col; } }); }
    function beanCol() { if (cocoa) return "#6a3a20"; var r = 0, g = 0, b = 0; pick.forEach(function (id) { var h = BEAN[bIdx(id)].g; r += parseInt(h.substr(1, 2), 16); g += parseInt(h.substr(3, 2), 16); b += parseInt(h.substr(5, 2), 16); }); var n = pick.length || 1; return "rgb(" + Math.round(r / n) + "," + Math.round(g / n) + "," + Math.round(b / n) + ")"; }
    function showPick() { if (cocoa) { G_.banner("Kakao"); return; } var k = cofKey(pick).split("+").filter(Boolean), u = k.filter(function (v, i) { return k.indexOf(v) === i; }); G_.banner(u.length ? u.map(function (id) { var n = k.filter(function (v) { return v === id; }).length; return BEAN[bIdx(id)].n + (n > 1 ? " ×" + n : ""); }).join(" + ") : "Bohnen in die Schale"); }
    // ---------- 1: beans ----------
    function drawBeans(t) {
      spr("bg_shelf", 0, 0); drawFest(c, "shelf", performance.now());
      JAR.forEach(function (r, i) { var id = i < 6 ? BEAN[i].id : "kakao", n = i < 6 ? pick.filter(function (v) { return v === id; }).length : cocoa ? 1 : 0; spr("jar_" + id, r.x, r.y);
        for (var u = 0; u < n; u++) { var bx = r.x + r.w - 7 - u * 8; R(c, bx, r.y - 3, 8, 8, "#3a2414"); R(c, bx + 1, r.y - 2, 6, 6, "#f6c84a"); R(c, bx + 2, r.y + 1, 1, 1, "#3a2414"); R(c, bx + 3, r.y + 2, 1, 1, "#3a2414"); R(c, bx + 4, r.y, 1, 2, "#3a2414"); } });
      shadow(BOWL.x + 6, BOWL.y + 25, 36); spr("bowl_b", BOWL.x, BOWL.y);
      var shown = pick.length - flies.length;
      if (cocoa) spr("ib_kakao", BOWL.x + 17, BOWL.y - 2);
      for (var k = 0; k < shown; k++) spr("ib_" + pick[k], BOWL.x + 8 + k * 11, BOWL.y - 1 - (k % 2) * 2);
      spr("bowl_f", BOWL.x, BOWL.y);
      flies = flies.filter(function (f) { var u = Math.min(1, (t - f.t0) / 380), x = f.x0 + (BOWL.x + 14 + f.k * 10 - f.x0) * u, y = f.y0 + (BOWL.y - f.y0) * u - Math.sin(u * Math.PI) * 24; spr("ib_" + f.id, x - 7, y - 7); if (u >= 1) { beep([[700 + f.k * 80, .02], [500, .03]]); return false; } return true; });
      shadow(GRS.x + 4, GRS.y + 48, 36); spr("grinder_s", GRS.x, GRS.y);
      shadow(CBK.x + 3, CBK.y + 36, 36); spr("cbook", CBK.x, CBK.y);
      if (pick.length || cocoa) arrow(GRS.x + 21, GRS.y - 12, t);
    }
    // ---------- 2: grinding ----------
    var GX = 58, GY = 40, GC = [GX + 32, GY + 2];
    function drawGrind(t, dt) {
      wall(); shadow(GX + 6, GY + 75, 54); spr("grinder", GX, GY);
      var left = Math.max(0, 1 - grind / (8 * Math.PI)), nb = Math.ceil(pick.length * 4 * left);
      for (var k = 0; k < nb; k++) { var id = pick[k % pick.length]; spr("ib_" + id, GX + 10 + (k * 9) % 38, GY + 7 + Math.floor(k / 5) * 2); }
      // the drawer fills with grounds
      var fill = Math.round(10 * (1 - left)); R(c, GX + 15, GY + 67 - fill, 34, fill, beanCol()); if (fill) R(c, GX + 15, GY + 67 - fill, 34, 1, "rgba(255,255,255,.2)");
      R(c, GX + 28, GY + 61, 8, 3, "#e8b830");
      // crank arm and knob
      var a = (ang == null ? -Math.PI / 4 : ang), ex = GC[0] + Math.cos(a) * 20, ey = GC[1] + Math.sin(a) * 9;
      for (var q = 0; q <= 20; q++) { var u = q / 20; R(c, GC[0] + (ex - GC[0]) * u - 1, GC[1] + (ey - GC[1]) * u - 1, 3, 2, q % 4 ? "#8a909a" : "#6a707a"); }
      disc(c, ex, ey - 4, 4, "#3a2414"); disc(c, ex, ey - 4, 3, "#8a5a30"); R(c, ex - 2, ey - 6, 1, 1, "#d8a868");
      crumbs = crumbs.filter(function (d) { var u = (t - d.t0) / 500; if (u > 1) return false; R(c, d.x, d.y + u * 14, 1, 1, beanCol()); return true; });
      if (ang == null && grind === 0) arrow(ex, ey - 16, t);
      gauge(1 - left, [.97, 1], function () { return beanCol(); });
    }
    // ---------- 3: tamping ----------
    // the basket of the portafilter seen a little from above: grounds heaped in it, the tamper comes down and presses them into a smooth puck
    function ell(cx, cy, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI); c.fill(); }
    function pxEll(cx, cy, rx, ry, fn) { for (var y = Math.floor(cy - ry); y <= cy + ry; y++) for (var x = Math.floor(cx - rx); x <= cx + rx; x++) { var u = (x + .5 - cx) / rx, v = (y + .5 - cy) / ry; if (u * u + v * v <= 1) { var cl = fn(u, v, x, y); if (cl) { c.fillStyle = cl; c.fillRect(x, y, 1, 1); } } } }
    function steel(u) { return u < -.6 ? "#ffffff" : u < -.15 ? "#e2e6ec" : u < .45 ? "#c8ccd4" : u < .8 ? "#9aa0aa" : "#6a707a"; }
    function drawTamp(t, dt) {
      wall();
      if (pressing) press = Math.min(1.1, press + dt / 2.2);
      var p_ = Math.min(1, press), CXB = 86, RY0 = 84, RX = 34, RYY = 10, DEP = 15, gc = lerpC(beanCol(), "#a8703c", .35);   // ground coffee is lighter than the whole bean
      // shadow and the handle reaching out to the front right
      ell(CXB + 10, RY0 + DEP + 12, RX + 26, 7, "rgba(58,36,20,.22)");
      for (var i = 0; i < 46; i++) { var hx = CXB + 28 + i * 1.1, hy = RY0 + 8 + i * .42, w = i < 10 ? 4 : 5; R(c, hx, hy - w - 1, 2, w * 2 + 2, "#3a2414"); R(c, hx, hy - w, 2, w * 2, i < 10 ? steel(-.2) : (i % 9 === 0 ? "#4a2a18" : "#6a4026")); R(c, hx, hy - w, 2, 1, i < 10 ? "#ffffff" : "#8a5a30"); }
      // the outer wall of the basket
      for (var x = -RX - 1; x <= RX + 1; x++) { var u = x / RX, yt = RY0 + RYY * Math.sqrt(Math.max(0, 1 - u * u)); R(c, CXB + x, yt, 1, DEP + 1, Math.abs(x) > RX ? "#3a2414" : steel(u)); R(c, CXB + x, yt + DEP, 1, 1, "#3a2414"); }
      // the inside: dark steel wall at the back
      ell(CXB, RY0, RX + 1, RYY + 1, "#3a2414"); ell(CXB, RY0, RX - 1, RYY - 1, "#4a4650"); ell(CXB, RY0 + 2, RX - 3, RYY - 3, "#3a3640");
      // the grounds: a mound that flattens into a smooth puck
      var surf = RY0 + 3 + Math.round(p_ * 2), hgt = (1 - p_) * 15, N = 12;
      c.save(); c.beginPath(); c.ellipse(CXB, RY0, RX - 2, RYY - 1.5, 0, 0, 2 * Math.PI); c.rect(CXB - RX + 2, 0, 2 * RX - 4, RY0); c.clip();
      for (var k = 0; k <= N; k++) {
        var f = k / N, rx = (RX - 3) * (1 - f * .8), ry = (RYY - 2.5) * (1 - f * .8), cy = surf - hgt * Math.sin(f * Math.PI / 2);
        pxEll(CXB, cy, rx, ry, function (u, v, x, y) {
          var d = -u * .6 - v * .8, cl = d > .5 ? lerpC(gc, "#ffffff", .3) : d > .1 ? lerpC(gc, "#ffffff", .12) : d > -.4 ? gc : lerpC(gc, "#1a0a04", .3);
          var h = (x * 73856093 ^ y * 19349663) & 15;
          if (p_ < .9 && (h === 0 || h === 9)) cl = lerpC(cl, "#ffffff", .3); else if (p_ < .9 && (h === 7 || h === 3)) cl = lerpC(cl, "#1a0a04", .35);
          return cl;
        });
      }
      if (p_ > .55) { c.globalAlpha = Math.min(1, (p_ - .55) * 2.5) * .55; pxEll(CXB - 4, surf - 1, 18, 4, function (u, v) { return u * u + v * v > .55 ? "#ffffff" : null; }); c.globalAlpha = 1; }
      c.restore();
      // the tamper: a steel disc on a wooden knob, coming down into the basket
      var tY = surf - hgt - 6 - (pressing ? 0 : 16), TRX = RX - 4, TRY = RYY - 2.5;
      for (var x2 = -TRX; x2 <= TRX; x2++) { var u2 = x2 / TRX, y2 = tY + TRY * Math.sqrt(Math.max(0, 1 - u2 * u2)); R(c, CXB + x2, y2, 1, 7, steel(u2)); R(c, CXB + x2, y2 + 6, 1, 1, "#3a2414"); }
      ell(CXB, tY, TRX + 1, TRY + 1, "#3a2414"); pxEll(CXB, tY, TRX, TRY, function (u, v) { return u * u + v * v > .7 ? "#9aa0aa" : steel(u * .6 - v * .4); });
      R(c, CXB - 5, tY - 16, 10, 16, "#3a2414"); R(c, CXB - 4, tY - 16, 8, 16, "#6a4026"); R(c, CXB - 4, tY - 16, 3, 16, "#8a5a30"); R(c, CXB + 2, tY - 16, 2, 16, "#4a2a18");
      ell(CXB, tY - 24, 12, 11, "#3a2414"); pxEll(CXB, tY - 24, 11, 10, function (u, v) { var d = -u * .6 - v * .8; return d > .55 ? "#d8a868" : d > .1 ? "#b07a44" : d > -.5 ? "#8a5a30" : "#6a4026"; });
      // the front of the rim over everything inside
      for (var x3 = -RX; x3 <= RX; x3++) { var u3 = x3 / RX, yb = RY0 + RYY * Math.sqrt(Math.max(0, 1 - u3 * u3)); R(c, CXB + x3, yb - 2, 1, 2, steel(u3 * .7)); R(c, CXB + x3, yb, 1, 1, "#3a2414"); }
      if (pressing && p_ > .1 && p_ < 1) for (var q = 0; q < 4; q++) R(c, CXB - 26 + ((t / 30 + q * 17) % 52), surf - 2 + (q % 2), 1, 1, lerpC(gc, "#ffffff", .4));
      if (!pressing && press === 0) arrow(CXB, tY - 46, t);
      gauge(press, [.55, .8], function (k) { return k > .8 ? "#e8554a" : "#c8925a"; });
    }
    // ---------- 4: the shot ----------
    var MX = 50, MY = 8, PV = [MX + 50, MY + 66];
    function crCol(k) { return k < .45 ? lerpC("#e8c088", "#b07a44", k / .45) : lerpC("#b07a44", "#3a1e10", (k - .45) / .55); }
    // the espresso cup and the milk pitcher in 2.5D: inside, the drink, then the outer wall
    function clipEll(cx, cy, rx, ry, fn) { c.save(); c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI); c.clip(); fn(); c.restore(); }
    function fillEll(cx, cy, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI); c.fill(); }
    function cupSurf(y, lvl) { return y + 7 + Math.round((1 - lvl) * 11); }
    function cup25(x, y, lvl, col) {
      spr("ecup25_back", x, y);
      if (lvl > 0) clipEll(x + 16, y + 7, 12, 3.6, function () { var sy = cupSurf(y, lvl); fillEll(x + 16, sy, 12, 3.6, col); fillEll(x + 13, sy - 1, 5, 1.2, lerpC(col, "#fff0d0", .35)); });
      spr("ecup25_front", x, y);
    }
    function pitcher25(x, y, sy, fm, under) {
      spr("pitcher25_back", x, y);
      clipEll(x + 24, y + 12, 14.5, 4.4, function () {
        fillEll(x + 24, sy, 14.5, 4.4, fm > .3 ? "#fffaf0" : "#f6f2ea"); fillEll(x + 20, sy - 1, 6, 1.4, "#ffffff");
        for (var b = 0; b < Math.round(fm * 9); b++) R(c, x + 13 + (b * 5) % 22, sy - 2 + (b % 3), 2, 1, "#ffffff");
      });
      if (under) under();
      spr("pitcher25_front", x, y);
    }
    function drawShot(t, dt) {
      wall();
      if (leverHeld && lever > .85) { shot = Math.min(1.05, shot + dt / 5); cupLvl = Math.min(1, cupLvl + dt / 5); }
      if (!leverHeld) lever = Math.max(0, lever - dt * 3);
      shadow(MX + 6, MY + 106, 90); spr("machine", MX, MY);
      // gauge needle follows the lever
      var na = Math.PI * (1.1 + .78 * lever), gx = MX + 50, gy = MY + 38; for (var q = 1; q < 6; q++) R(c, gx + Math.cos(na) * q, gy + Math.sin(na) * q, 1, 1, "#d8463c");
      // the cup under the spout
      var CX0 = MX + 34, CY0 = MY + 92, lv = Math.round(cupLvl * 12);
      var streamOn = leverHeld && lever > .85 && shot < 1.05;
      spr("ecup25_back", CX0, CY0);
      if (cupLvl > 0) clipEll(CX0 + 16, CY0 + 7, 12, 3.6, function () { var sy = cupSurf(CY0, cupLvl); fillEll(CX0 + 16, sy, 12, 3.6, crCol(shot)); fillEll(CX0 + 13, sy - 1, 5, 1.2, lerpC(crCol(shot), "#fff0d0", .35)); });
      if (streamOn) R(c, MX + 49, MY + 90, 2, cupSurf(CY0, Math.max(.05, cupLvl)) - (MY + 90), crCol(shot));
      spr("ecup25_front", CX0, CY0);
      // the lever: up and back when resting, down when pulled
      var la = -Math.PI * .62 + lever * Math.PI * 1.08, lx = PV[0] + Math.cos(la) * 36, ly = PV[1] + Math.sin(la) * 36;
      for (var s_ = 0; s_ <= 36; s_++) { var u = s_ / 36; R(c, PV[0] + (lx - PV[0]) * u - 1, PV[1] + (ly - PV[1]) * u - 1, 3, 3, s_ % 6 < 3 ? "#b88a20" : "#e8b830"); }
      disc(c, lx, ly, 5, "#3a2414"); disc(c, lx, ly, 4, "#6a4026"); R(c, lx - 2, ly - 2, 2, 1, "#a8703c");
      if (!leverHeld && shot === 0) arrow(lx, ly - 14, t);
      gauge(shot, [.45, .7], crCol);
    }
    // ---------- 5: steaming the milk ----------
    var TIP = [100, 70], PXX = 74;
    function drawSteam(t, dt) {
      wall();
      var surf0 = py + 16 - Math.round(foam * 6);
      spr("pitcher25_back", PXX, py - 2);
      clipEll(PXX + 24, py + 10, 14.5, 4.4, function () { fillEll(PXX + 24, surf0, 14.5, 4.4, foam > .3 ? "#fffaf0" : "#f6f2ea"); fillEll(PXX + 20, surf0 - 1, 6, 1.4, "#ffffff"); for (var b0 = 0; b0 < Math.round(foam * 9); b0++) R(c, PXX + 13 + (b0 * 5) % 22, surf0 - 2 + (b0 % 3), 2, 1, "#ffffff"); });
      // the steam wand: a pipe from the right edge, a valve, bending down to the nozzle
      R(c, 122, 38, 58, 7, "#3a2414"); R(c, 122, 39, 58, 5, "#c8ccd4"); R(c, 122, 39, 58, 1, "#ffffff"); R(c, 122, 43, 58, 1, "#8a909a");
      disc(c, 150, 34, 6, "#3a2414"); disc(c, 150, 34, 5, "#d8463c"); R(c, 148, 31, 2, 1, "#ff8a7a"); R(c, 149, 38, 3, 2, "#3a2414");
      for (var q = 0; q <= 32; q++) { var u = q / 32, a = u * Math.PI / 2, x = 122 - Math.sin(a) * 22 * (u < 1 ? 1 : 1), y = 41 + (1 - Math.cos(a)) * 29; R(c, x - 3, y - 3, 7, 7, "#3a2414"); }
      for (var q2 = 0; q2 <= 32; q2++) { var u2 = q2 / 32, a2 = u2 * Math.PI / 2, x2 = 122 - Math.sin(a2) * 22, y2 = 41 + (1 - Math.cos(a2)) * 29; R(c, x2 - 2, y2 - 2, 5, 5, "#c8ccd4"); R(c, x2 - 2, y2 - 2, 2, 2, "#ffffff"); }
      R(c, TIP[0] - 3, TIP[1] - 1, 7, 5, "#3a2414"); R(c, TIP[0] - 2, TIP[1], 5, 3, "#6a707a");
      var surf = py + 16 - Math.round(foam * 6), depth = TIP[1] + 3 - surf, mode = !steamHold ? 0 : depth < 0 ? 1 : depth <= 8 ? 2 : 3;
      if (mode) { temp = Math.min(1.1, temp + dt * (mode === 1 ? .04 : .1)); if (mode === 2) foam = Math.min(1, foam + dt * .2); }
      var hint = !mode ? null : mode === 1 ? "Zu hoch, die Düse muss in die Milch" : mode === 3 ? "Zu tief: nur heiß, kein Schaum" : cocoa ? "Es schäumt" : foam < .55 ? "Es schäumt … noch mehr für Cappuccino" : "Genug Schaum für Cappuccino";
      if (hint && hint !== drawSteam.hint) { drawSteam.hint = hint; G_.banner(hint); }
      if (mode && Math.random() < .6) bub.push({ x: TIP[0] + rnd(-7, 7), y: TIP[1], t0: t });
      if (mode && Math.floor(t / 120) !== Math.floor((t - dt * 1000) / 120)) beep(mode === 1 ? [[2600, .02]] : mode === 2 ? [[1500 + Math.random() * 300, .015]] : [[220, .03]]);
      // the pitcher (front wall drawn over the milk and the nozzle tip)
      spr("pitcher25_front", PXX, py - 2);
      var ta = Math.PI * (1.2 + Math.min(1, temp) * 1.6); R(c, PXX + 26 + Math.round(Math.cos(ta) * 3), py + 4 + Math.round(Math.sin(ta) * 3), 1, 1, "#d8463c"); R(c, PXX + 26, py + 4, 1, 1, "#3a2414");
      bub = bub.filter(function (d) { var u = (t - d.t0) / 600; if (u > 1) return false; R(c, d.x + Math.sin(u * 6) * 2, d.y - u * 30, u > .5 ? 2 : 1, u > .5 ? 2 : 1, "rgba(255,255,255," + (1 - u).toFixed(2) + ")"); return true; });
      if (!steamHold && temp === 0) arrow(PXX + 24, py - 10, t);
      gauge(temp, [.65, .85], function (k) { return lerpC("#8ac8f0", "#e8554a", k); });
      if (temp >= 1.05 && steamHold) { steamHold = false; endSteam(); }
    }
    function endSteam() {
      if (phase !== "steam") return;
      sMilk = temp >= .65 && temp <= .85 && foam >= .35 ? 1 : 0;
      drawSteam.hint = null;
      G_.banner(temp > .85 ? "Etwas zu heiß" : temp < .65 ? "Noch etwas kühl" : foam < .35 ? "Wenig Schaum" : "Schön cremig!");
      beep([[523, .04], [659, .05]]); phase = "steamout";
      G_.pause(1000, function () { initCup(); phase = "pour"; G_.gauge.innerHTML = ""; hasMilk = true; setTimeout(function () { if (phase === "pour" && !milk) G_.banner("Gedrückt halten zum Eingießen"); }, 1000); }, 80, 80);
    }
    // ---------- 6: pouring and drawing, the cup seen from above ----------
    var FW = 70, img = null;
    function initCup() { F = new Float32Array(FW * FW); crema = cocoa ? "#7a4428" : crCol(Math.min(1, shot)); }
    function inCup(x, y) { return Math.hypot(x - CC[0], y - CC[1]) < CR; }
    function drawCupTop(t) {
      if (!F) initCup();
      wall(); R(c, 0, 0, 180, 135, "rgba(58,36,20,.15)");
      spr("cuptop", CC[0] - 54, CC[1] - 50);
      if (!img) img = c.createImageData(FW, FW);
      var foamC = [255, 248, 236], cr = hexRGB(lerpC(crema.charAt(0) === "#" ? crema : "#a8703c", "#e8cfa8", Math.min(1, milk) * .55)), d = img.data;
      for (var y = 0; y < FW; y++) for (var x = 0; x < FW; x++) {
        var i = y * FW + x, dx = x - 35 + .5, dy = y - 35 + .5, o = i * 4;
        if (dx * dx + dy * dy > CR * CR) { d[o + 3] = 0; continue; }
        var f0 = Math.max(0, Math.min(1, F[i])), f = f0 >= .55 ? 1 : f0 >= .3 ? ((x + y) & 1 ? .6 : 0) : 0, mot = ((x * 7 + y * 13) % 11 === 0) ? -14 : ((x * 5 + y * 3) % 17 === 0 ? 10 : 0);
        d[o] = cr[0] + (foamC[0] - cr[0]) * f + mot * (1 - f); d[o + 1] = cr[1] + (foamC[1] - cr[1]) * f + mot * (1 - f); d[o + 2] = cr[2] + (foamC[2] - cr[2]) * f + mot * (1 - f); d[o + 3] = 255;
      }
      var tmp = drawCupTop.cv || (drawCupTop.cv = document.createElement("canvas")); tmp.width = FW; tmp.height = FW; tmp.getContext("2d").putImageData(img, 0, 0);
      c.drawImage(tmp, CC[0] - 35, CC[1] - 35);
      if (artShown) spr("la_" + artShown, CC[0] - 32, CC[1] - 32);
      spr("cuptop_fg", CC[0] - 54, CC[1] - 50);   // the rim's shadow on the drink
    }
    function hexRGB(h) { if (h[0] === "#") return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; var m = h.match(/\d+/g); return m.map(Number); }
    function pourStep(dt, t) {
      if (pourAt && milk < 1) {
        milk = Math.min(1, milk + dt * .26);
        var px = pourAt[0] - CC[0] + 35, py2 = pourAt[1] - CC[1] + 35, r = 6 + milk * 30 * (.5 + foam);
        for (var y = Math.max(0, Math.floor(py2 - r)); y < Math.min(FW, py2 + r); y++) for (var x = Math.max(0, Math.floor(px - r)); x < Math.min(FW, px + r); x++) { var dd = Math.hypot(x - px, y - py2); if (dd < r) F[y * FW + x] = Math.min(1, F[y * FW + x] + dt * 4 * (1 - dd / r)); }
        if (milk >= 1) { pourAt = null; toArt(); }
      }
    }
    // the milk pitcher lying tilted, drawn pixel by pixel around its spout (sx, sy); ang tilts it
    function tiltPitcher(sx, sy, ang) {
      var ca = Math.cos(ang), sa = Math.sin(ang);
      function inS(u, v, m) {
        if (u >= 2 + m && u <= 16 - m && v >= m && v <= 18 - m) return 1;                                  // body
        if (u >= -2.5 + v * 1.4 + m && u <= 3 && v >= m && v <= 3.2 - m) return 1;                           // spout
        if (u >= 16 - m && u <= 20.5 - m && v >= 4 + m && v <= 13.5 - m && !(u > 16.5 + m * 0 && u < 19 && v > 6 && v < 11.5)) return 2;   // handle
        return 0;
      }
      var S = 1.55;
      for (var y = Math.floor(sy - 42); y <= sy + 12; y++) for (var x = Math.floor(sx - 8); x <= sx + 42; x++) {
        var dx = x + .5 - sx, dy = y + .5 - sy, u = (dx * ca + dy * sa) / S, v = (-dx * sa + dy * ca) / S, a = inS(u, v, 0); if (!a) continue;
        var col = "#3a2414";
        if (inS(u, v, .7)) col = a === 2 ? "#a8aeb8" : v < 1.6 && u < 3.2 ? "#fffaf0" : v < 1.6 ? "#ffffff" : u < 6 ? "#eef2f6" : u > 12.5 ? "#9aa0aa" : "#c4c8d0";
        R(c, x, y, 1, 1, col);
      }
    }
    function drawPour(t, dt) {
      pourStep(dt, t); drawCupTop(t);
      if (pourAt) {
        var sx = Math.round(pourAt[0]), sy = Math.round(pourAt[1]) - 26, wob = Math.floor(t / 90) % 3 - 1;
        // the stream: from the spout straight down to the drink, a little wobble in the middle, two pixels wide
        for (var y = sy + 1; y < pourAt[1]; y++) { var off = (y > sy + 4 && y < pourAt[1] - 3 && ((y - sy + Math.floor(t / 70)) % 7) < 2) ? 1 : 0; R(c, sx - 1 + off, y, 2, 1, "#fffaf0"); R(c, sx - 1 + off, y, 1, 1, "#ffffff"); }
        R(c, sx - 2, pourAt[1] - 2, 4, 2, "#fffaf0");
        // the splash: a ring of pixels that keeps spreading, and a few drops
        var rr = 2 + (Math.floor(t / 80) % 4);
        for (var k = 0; k < 14; k++) { var a = k / 14 * Math.PI * 2; R(c, sx + Math.round(Math.cos(a) * rr), pourAt[1] + Math.round(Math.sin(a) * rr * .45), 1, 1, "#ffffff"); }
        if (Math.floor(t / 110) % 2) { R(c, sx - 4, pourAt[1] - 3, 1, 1, "#fffaf0"); R(c, sx + 3, pourAt[1] - 4, 1, 1, "#fffaf0"); }
        tiltPitcher(sx, sy, -1.05 + (Math.floor(t / 400) % 2) * .05);
        var dn = cocoa ? null : milk < .35 ? "Macchiato" : foam >= .55 && milk < .8 ? "Cappuccino" : "Latte";
        if (dn && dn !== drawPour.dn) { drawPour.dn = dn; G_.banner(dn); }
      } else if (milk === 0) { spr("pitcher", 146, 4); arrow(CC[0], CC[1] - 10, t); }
    }
    function toArt() { if (phase !== "pour") return; phase = "pourout"; G_.pause(1000, function () { phase = "art"; G_.banner("Form wählen"); }, CC[0], CC[1]); drink = cocoa ? (foam >= .55 ? "KS" : "K") : milk < .35 ? "M" : foam >= .55 && milk < .8 ? "C" : "L"; G_.banner("Form wählen"); }
    var ART = { herz: "Herz", blatt: "Blatt", stern: "Stern" }, artSel = null, guide = null, trace = [], tracing = false, artShown = null, tries = 0;
    var CARDS = { herz: { x: 4, y: 26 }, blatt: { x: 4, y: 60 }, stern: { x: 4, y: 94 } };
    function makeGuide(k) { return COF_ART["gl_" + k].map(function (q) { return [CC[0] - 32 + q[0] + .5, CC[1] - 32 + q[1] + .5]; }); }
    function judge() {
      var near = function (p, list, d) { for (var i = 0; i < list.length; i++) if (Math.hypot(p[0] - list[i][0], p[1] - list[i][1]) < d) return true; return false; };
      var cov = guide.filter(function (g) { return near(g, trace, 6); }).length / guide.length, off = trace.length ? trace.filter(function (p) { return !near(p, guide, 7); }).length / trace.length : 1;
      return cov >= .65 && off <= .45;
    }
    function drawArt(t, dt) {
      drawCupTop(t);
      Object.keys(CARDS).forEach(function (k) { var cd = CARDS[k]; spr("gd_" + k, cd.x, cd.y); if (artSel === k) { R(c, cd.x - 1, cd.y + 31, 32, 2, "#f6c84a"); } });
      if (guide && !artShown) {
        var on = Math.floor(t / 400) % 2;
        guide.forEach(function (g, i) { if ((i + on) % 3 === 0) R(c, g[0] - .5, g[1] - .5, 1, 1, "#6a3a1e"); });
        trace.forEach(function (p) { R(c, p[0] - 1, p[1] - 1, 3, 3, "rgba(255,250,240,.85)"); });
      }
      if (!artSel) arrow(19, 16, t);
    }
    function finishArt(ok) {
      if (ok) { artShown = artSel; sArt = ART[artSel]; G_.banner("Ein " + sArt + "!"); beep([[784, .05], [988, .05], [1319, .1]]); G_.pause(1400, function () { if (phase === "art") { phase = "adds"; G_.banner("Noch etwas dazu?"); } }, 1400); }
      else { tries++; trace = []; G_.banner(tries < 3 ? "Fast! Nochmal nachzeichnen" : "Kein Bild diesmal"); beep([[392, .05], [330, .06]]); if (tries >= 3) setTimeout(function () { if (phase === "art") { phase = "adds"; G_.banner("Noch etwas dazu?"); } }, 1200); }
    }
    // ---------- 7: extras on top; tap the cup to serve ----------
    var APOS = { kakao: { x: 1, y: 0 }, zimt: { x: 2, y: 34 }, sirup: { x: 4, y: 64 }, sahne: { x: 2, y: 100 } }, KEKS = { x: 146, y: 102 };
    function drawAdds(t) {
      drawCupTop(t);
      // the extras, big and clear: powder dusted on top, a caramel drizzle, a swirl of cream, a biscuit on the saucer
      if (addT.kakao) spr("on_kakao", CC[0] - 30, CC[1] - 30);
      if (addT.zimt) spr("on_zimt", CC[0] - 30, CC[1] - 30);
      if (addT.sirup) spr("on_sirup", CC[0] - 30, CC[1] - 30);
      if (addT.sahne) spr("on_sahne", CC[0] - 28, CC[1] - 32);
      if (addT.keks) spr("on_keks", CC[0] - 58, CC[1] + 12);
      Object.keys(APOS).forEach(function (id) { var p = APOS[id], used = adds.indexOf(id) >= 0; spr("x_" + id, p.x, p.y); if (used) tick(p.x + 26, p.y + 2); });
      if (adds.indexOf("keks") < 0) spr("x_keks", KEKS.x, KEKS.y); else tick(KEKS.x + 20, KEKS.y);
      if (drag) spr("x_" + drag.id, drag.x - 17, drag.y - 18);
      if (phase === "adds") arrow(CC[0], 18, t);
      if (phase === "done") starsAt(c, stars, CC[0], 126);
    }
    function tick(bx, by) { R(c, bx, by, 9, 9, "#3a2414"); R(c, bx + 1, by + 1, 7, 7, "#f6c84a"); R(c, bx + 2, by + 4, 1, 1, "#3a2414"); R(c, bx + 3, by + 5, 1, 1, "#3a2414"); R(c, bx + 4, by + 6, 1, 1, "#3a2414"); R(c, bx + 5, by + 3, 1, 3, "#3a2414"); R(c, bx + 6, by + 2, 1, 1, "#3a2414"); }
    function serve() {
      if (phase !== "adds") return; phase = "done";
      var f = cocoa ? [sMilk] : hasMilk ? [sTamp, sShot, sMilk] : [sTamp, sShot], good = f.reduce(function (a, b) { return a + b; }, 0);
      stars = good === f.length ? 3 : good >= f.length / 2 ? 2 : 1; if (cocoa && sArt && stars < 3) stars++;
      var ids = cocoa ? ["kakao"] : pick, key = (cocoa ? "kakao" : cofKey(pick)) + "|" + drink, B = cofBook(), e = B[key], isNew = !e;
      var nm = cofName(ids, drink), xs = adds.map(function (a) { return COF_ADD[a]; });
      B[key] = { n: nm, c: hasMilk ? lerpC(crema, "#fff8ec", .6) : crema, s: Math.max(stars, e ? e.s : 0), t: e ? e.t : Date.now(), art: sArt || (e && e.art) || "", d: drink };
      var C_ = cfL(); C_.coffees = (C_.coffees || []).concat([{ k: key, art: sArt, x: adds.slice() }]).slice(-3);
      var full = nm + (xs.length ? " mit " + xs.join(" und ") : "");
      cfFinish(G_, "cof", stars, isNew ? "Neue Sorte: " + full + "!" : full);
      if (isNew) { beep([[784, .08], [988, .08], [1175, .08], [1568, .2]]); G_.el.classList.add("cf-newtea"); }
    }
    // ---------- the frame loop ----------
    function draw(t) {
      var dt = Math.min(.05, (t - last) / 1000); last = t;
      if (phase === "fav") { wall(); }
      else if (phase === "beans") drawBeans(t);
      else if (phase === "grind" || phase === "grindout") drawGrind(t, dt);
      else if (phase === "tamp") drawTamp(t, dt);
      else if (phase === "shot") drawShot(t, dt);
      else if (phase === "choice") drawChoice(t);
      else if (phase === "steam" || phase === "steamout") drawSteam(t, dt);
      else if (phase === "pour" || phase === "pourout") drawPour(t, dt);
      else if (phase === "art") drawArt(t, dt);
      else drawAdds(t);
      if (phase !== "gone") raf = requestAnimationFrame(draw);
    }
    function drawChoice(t) {
      wall(); shadow(36, 128, 40); cup25(34, 96, .9, crema || crCol(shot));
      shadow(104, 128, 44); pitcher25(98, 66, 66 + 16, 0);
      arrow(124, 54, t); arrow(50, 84, t);
    }
    if (cfHome) {   /* at home: pick one of the favourites, then it goes straight to the grinder */
      var B0 = cofBook(), favs = Object.keys(B0).map(function (k) { return { k: k, e: B0[k] }; }).sort(function (a, b) { return (b.e.s - a.e.s) || (b.e.t - a.e.t); }).slice(0, 4).map(function (o) { var ids = o.k.split("|")[0]; return { ids: ids === "kakao" ? [] : ids.split("+"), cocoa: ids === "kakao", n: o.e.n, c: o.e.c || "#8a5a30" }; });
      [{ ids: ["mittel"], n: "Waldweg-Kaffee", c: "#8a5a30" }, { ids: ["hell", "nuss"], n: "Sonnenaufgangs-Kaffee mit Nussnote", c: "#b08050" }, { ids: ["dunkel", "schoko"], n: "Mitternachts-Kaffee mit Schokonote", c: "#4a2a18" }, { ids: [], cocoa: true, n: "Kakao", c: "#7a4428" }]
        .forEach(function (d) { if (favs.length < 4 && !favs.some(function (f) { return f.n === d.n; })) favs.push(d); });
      phase = "fav"; G_.banner("Lieblingskaffee");
      setTimeout(function () { cfFavCard(G_, "Welcher Kaffee?", favs, function (f) { if (f.cocoa) { cocoa = true; phase = "steam"; G_.banner("Milch aufschäumen"); crema = "#7a4428"; return; } pick = f.ids.slice(); showPick(); startGrind(); }); }, 0);
    }
    function startGrind() { G_.pause(500, function () { phase = "grind"; G_.banner("Kurbel drehen"); ang = null; }, 90, 100); }
    G_.cv.addEventListener("pointerdown", function (e) {
      e.preventDefault(); var p = pt(e); try { G_.cv.setPointerCapture(e.pointerId); } catch (er) {}
      if (phase === "beans") {
        if (inR(p, CBK)) { openTeaBook(G_.el, "coffee"); return; }
        for (var i = 0; i < 7; i++) if (inR(p, JAR[i])) {
          if (i === 6) { pick = []; flies = []; cocoa = !cocoa; beep([[523, .05]]); showPick(); return; }
          if (cocoa) cocoa = false;
          if (pick.length >= 3) { G_.banner("Die Schale ist voll"); beep([[220, .06]]); return; }
          pick.push(BEAN[i].id); flies.push({ id: BEAN[i].id, k: pick.length - 1, x0: JAR[i].x + 13, y0: JAR[i].y + 16, t0: performance.now() }); beep([[523 + pick.length * 110, .05]]); showPick(); return;
        }
        if (inR(p, BOWL) && pick.length && !flies.length) { pick.pop(); beep([[300, .05]]); showPick(); return; }
        if (inR(p, GRS)) {
          if (cocoa) { phase = "steam"; G_.banner("Milch aufschäumen"); crema = "#7a4428"; return; }
          if (!pick.length) { G_.banner("Erst Bohnen in die Schale"); beep([[220, .06]]); return; }
          startGrind(); return;
        }
        return;
      }
      if (phase === "grind") { ang = Math.atan2((p[1] - GC[1]) * 2.2, p[0] - GC[0]); tot = tot || 0; return; }
      if (phase === "tamp") { pressing = true; return; }
      if (phase === "shot") { leverHeld = { y0: p[1], l0: lever }; return; }
      if (phase === "choice") { if (p[0] > 90) { phase = "steam"; G_.banner("Kännchen an die Düse halten"); } else { hasMilk = false; drink = "E"; initCup(); phase = "adds"; G_.banner("Espresso pur. Noch etwas dazu?"); } return; }
      if (phase === "steam") { steamHold = true; py = Math.max(48, Math.min(100, p[1] - 30)); return; }
      if (phase === "pour") { if (!F) initCup(); if (inCup(p[0], p[1])) pourAt = p; return; }
      if (phase === "art" && !artShown && tries < 3) {
        var ck = null; Object.keys(CARDS).forEach(function (k) { var cd = CARDS[k]; if (inR(p, { x: cd.x, y: cd.y, w: 30, h: 30 })) ck = k; });
        if (ck) { artSel = ck; guide = makeGuide(ck); trace = []; G_.banner("Nachzeichnen: " + ART[ck]); beep([[660, .04]]); return; }
        if (guide && inCup(p[0], p[1])) { tracing = true; trace.push(p); return; }
        if (!inCup(p[0], p[1])) { phase = "adds"; G_.banner("Noch etwas dazu?"); }
        return;
      }
      if (phase === "adds") {
        var hit = null; Object.keys(APOS).forEach(function (id) { var a = APOS[id]; if (inR(p, { x: a.x, y: a.y + 2, w: 34, h: 32 })) hit = id; });
        if (!hit && inR(p, { x: KEKS.x, y: KEKS.y, w: 30, h: 30 })) hit = "keks";
        if (hit) {
          if (adds.indexOf(hit) >= 0) { G_.banner("Ist schon drauf"); return; }
          if (adds.length >= 2) { G_.banner("Zwei Extras reichen"); beep([[220, .06]]); return; }
          drag = { id: hit, x: p[0], y: p[1], x0: p[0], y0: p[1] }; beep([[440, .03]]); return;
        }
        if (inCup(p[0], p[1])) serve();
      }
    });
    G_.cv.addEventListener("pointermove", function (e) {
      var p = pt(e);
      if (phase === "grind" && ang != null) {
        var a = Math.atan2((p[1] - GC[1]) * 2.2, p[0] - GC[0]), da = a - ang; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI;
        ang = a; var now = performance.now(), d = (now - (this._t || now)) / 1000 || .016; this._t = now;
        var rev = Math.abs(da) / (2 * Math.PI) / Math.max(.008, d); spd = spd * .8 + Math.min(1, rev / 2.4) * .2;
        grind += Math.abs(da); tot += d; if (spd >= .33 && spd <= .67) inZ += d;
        if (Math.random() < .3) { crumbs.push({ x: GX + 18 + Math.random() * 28, y: GY + 52, t0: now }); if (Math.random() < .5) beep([[180 + Math.random() * 80, .015]]); }
        if (grind >= 8 * Math.PI) { ang = null; sGrind = 1; G_.banner("Fertig gemahlen"); beep([[523, .04], [659, .05]]); phase = "grindout"; G_.pause(1000, function () { phase = "tamp"; }, GC[0], GC[1] + 30); setTimeout(function () { if (phase === "tamp" && !pressing) G_.banner("Gedrückt halten zum Andrücken"); }, 1400); }
        return;
      }
      if (phase === "shot" && leverHeld) { lever = Math.max(0, Math.min(1, leverHeld.l0 + (p[1] - leverHeld.y0) / 50)); return; }
      if (phase === "steam" && steamHold) { py = Math.max(48, Math.min(100, p[1] - 30)); return; }
      if (phase === "pour" && pourAt) { if (inCup(p[0], p[1])) pourAt = p; return; }
      if (phase === "art" && tracing) { var l = trace[trace.length - 1], n = Math.ceil(Math.hypot(p[0] - l[0], p[1] - l[1])); for (var k = 1; k <= n; k++) trace.push([l[0] + (p[0] - l[0]) * k / n, l[1] + (p[1] - l[1]) * k / n]); return; }
      if (drag) { drag.x = p[0]; drag.y = p[1]; }
    });
    function up() {
      if (phase === "gone") return;
      if (phase === "grind") ang = null;
      if (phase === "tamp" && pressing) {
        pressing = false; sTamp = press >= .55 && press <= .8 ? 1 : 0;
        G_.banner(sTamp ? "Gut angedrückt" : press > .8 ? "Zu fest gedrückt" : "Etwas locker"); beep([[392, .05], [523, .05]]);
        G_.pause(1100, function () { if (phase === "tamp") { phase = "shot"; G_.banner("Hebel herunterziehen und halten"); } }, 86, 80);
      }
      if (phase === "shot" && leverHeld) {
        var had = shot > .05; leverHeld = null;
        if (had) { sShot = shot >= .45 && shot <= .7 ? 1 : 0; G_.banner(sShot ? "Schöne Crema!" : shot < .45 ? "Etwas dünn" : "Etwas bitter"); crema = crCol(Math.min(1, shot)); G_.pause(1200, function () { if (phase === "shot") { phase = "choice"; G_.gauge.innerHTML = ""; G_.banner("Milch dazu?"); } }, PV[0], PV[1] + 30); }
      }
      if (phase === "steam" && steamHold) { steamHold = false; if (temp >= .4) endSteam(); }
      if (phase === "pour" && pourAt) { pourAt = null; if (milk >= .12) setTimeout(function () { if (phase === "pour" && !pourAt) toArt(); }, 700); }
      if (phase === "art" && tracing) { tracing = false; if (trace.length > 20) finishArt(judge()); }
      if (drag) {
        var moved = Math.hypot(drag.x - drag.x0, drag.y - drag.y0) > 4;
        if (moved && inCup(drag.x, drag.y)) { adds.push(drag.id); addT[drag.id] = true; beep([[660, .04], [880, .06]]); }
        drag = null;
      }
    }
    G_.cv.addEventListener("pointerup", up); G_.cv.addEventListener("pointercancel", up);
    var _close = G_.close; G_.close = function () { phase = "gone"; cancelAnimationFrame(raf); _close(); };
    G_.el.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); G_.close(); });
    G_.gauge.innerHTML = ""; raf = requestAnimationFrame(draw);
    window.__cofPh = function (ph, o) { phase = ph; for (var k in o) { if (k === "shot") shot = o[k]; if (k === "cupLvl") cupLvl = o[k]; if (k === "lever") lever = o[k]; if (k === "foam") foam = o[k]; if (k === "temp") temp = o[k]; if (k === "py") py = o[k]; } };
    window.__cofTamp = function (pv, pr) { phase = "tamp"; press = pv; pressing = pr; };
    window.__cofAdds = function (list, art) { hasMilk = true; initCup(); milk = 1; for (var i = 0; i < F.length; i++) { var x = i % FW - 35, y = Math.floor(i / FW) - 35; F[i] = Math.hypot(x, y) < 20 ? 1 : 0; } artShown = art || null; phase = "adds"; list.forEach(function (a) { adds.push(a); addT[a] = true; }); };
    window.__cofG = { st: function () { return { pourAt: pourAt, F: !!F, phase: phase, grind: grind, spd: spd, press: press, shot: shot, temp: temp, foam: foam, milk: milk, art: sArt, drink: drink, adds: adds.slice(), sG: sGrind, sT: sTamp, sS: sShot, sM: sMilk }; } };
  };
  window.__cof = { name: cofName, book: cofBook, total: COF_TOTAL, guide: function (k) { return COF_ART['gl_' + k]; } };
