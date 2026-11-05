  // ===================== fishing from the jetty (preview) =====================
  // swing the rod back and let go to cast to one of four spots; the float twitches a few times before the real bite;
  // reel in at the crank, steer the rod when the fish pulls to the side, land it with the net, measure it, let it go.
  // Nothing is timing-critical. New kinds are special: they need the right spot, bait, time, season or weather and are rare.
  var FG = /*FISHGAME*/;
  var FIMG = {}; Object.keys(FG).forEach(function (k) { if (typeof FG[k] === "string" && FG[k].indexOf("data:") === 0) { var im = new Image(); im.src = FG[k]; FIMG[k] = im; } });
  var FISHNAME = {}; FG.list.forEach(function (q) { FISHNAME[q[0]] = q[1]; });
  // the four spots on the lake (where the float lands)
  var FSPOTS = { seerosen: { n: "Bei den Seerosen", x: 34, y: 84 }, schilf: { n: "Am Schilf", x: 152, y: 92 }, tief: { n: "Im tiefen Wasser", x: 104, y: 62 }, steg: { n: "Im Schatten am Steg", x: 112, y: 104 } };
  // every kind: rarity (1 to 3 stars), spots, baits, and if needed time of day, season, weather or moon; sizes in cm; a hint for the book
  var FISH = {
    rotauge: { r: 1, at: ["seerosen", "steg", "tief"], bait: ["brot", "mais", "teig"], cm: [12, 25], hint: "Beißt fast überall auf Brot und Mais." },
    barsch: { r: 1, at: ["steg", "schilf"], bait: ["beere", "brot", "kaese"], cm: [15, 35], hint: "Lauert am Steg und im Schilf, mag Beeren." },
    stichling: { r: 1, at: ["steg", "seerosen"], bait: ["brot", "mais", "beere", "teig", "kaese"], cm: [4, 8], hint: "Ganz klein, ganz neugierig, am Steg." },
    brasse: { r: 1, at: ["tief"], bait: ["brot", "teig"], cm: [20, 50], hint: "Im tiefen Wasser auf Brot oder Teig." },
    karpfen: { r: 2, at: ["seerosen"], bait: ["mais", "teig"], sun: true, cm: [30, 70], hint: "An sonnigen Tagen bei den Seerosen, mit Mais." },
    schleie: { r: 2, at: ["seerosen", "schilf"], bait: ["mais", "teig"], when: "twilight", cm: [20, 45], hint: "In der Dämmerung zwischen Seerosen und Schilf." },
    doebel: { r: 2, at: ["schilf"], bait: ["beere", "kaese"], when: "day", cm: [20, 45], hint: "Tagsüber am Schilf, auf Beeren." },
    forelle: { r: 2, at: ["tief"], bait: ["beere", "kaese"], notIn: "summer", wet: true, cm: [20, 40], hint: "Bei Regen im tiefen Wasser, aber nicht im Sommer." },
    hecht: { r: 2, at: ["schilf"], bait: ["kaese", "teig", "beere"], when: "twilight", cm: [40, 90], hint: "Jagt in der Dämmerung am Schilf." },
    aal: { r: 3, at: ["tief"], bait: ["teig", "brot"], when: "night", wet: true, cm: [40, 90], hint: "Nachts bei Regen im tiefen Wasser." },
    wels: { r: 3, at: ["tief"], bait: ["kaese", "teig"], when: "night", cm: [60, 150], hint: "Der Riese im Tiefen, nachts mit Käse." },
    goldfisch: { r: 3, at: ["seerosen"], bait: ["mais"], moon: true, cm: [8, 15], hint: "Zeigt sich nur bei Vollmond an den Seerosen." },
    stiefel: { r: 1, at: ["steg"], find: true, hint: "Liegt irgendwo am Steg herum." },
    flasche: { r: 2, at: ["tief"], find: true, hint: "Treibt im tiefen Wasser, mit einem Brief darin?" },
    muschel: { r: 1, at: ["seerosen", "steg"], find: true, hint: "Zwischen Seerosen und Steg im Sand." },
    schluessel: { r: 3, at: ["steg"], find: true, hint: "Ganz selten unter dem Steg." }
  };
  var RW = { 1: 10, 2: 3, 3: 1 };
  // baits: three to begin with, two more come with the angler levels
  var FBAIT = [["brot", "Brot", 0], ["mais", "Mais", 0], ["beere", "Beere", 0], ["teig", "Teig", 2], ["kaese", "Käse", 3]];
  var LEVELS = [0, 5, 12, 25, 40];
  function fishL() { var L = life(); L.fish = L.fish || {}; var F = L.fish; F.book = F.book || {}; F.bait = F.bait || "brot"; F.hints = F.hints || {}; F.spots = F.spots || {}; F.total = F.total || 0; return F; }
  function fishLevel() { var n = fishL().total, lv = 1; LEVELS.forEach(function (q, i) { if (n >= q) lv = i + 1; }); return lv; }
  function baitOk(b) { var q = FBAIT.filter(function (x) { return x[0] === b; })[0]; return q && fishLevel() >= (q[2] || 0); }
  function moonFull() { var syn = 29.530588, d = (Date.now() / 86400000 - 10962.77) % syn; if (d < 0) d += syn; var ph = d / syn; return ph > .45 && ph < .55; }   // days since the new moon of 2000-01-06
  function wetNow() { var w = typeof weather !== "undefined" ? weather.type : "sun"; return w === "rain" || w === "storm"; }
  function sunNow() { var w = typeof weather !== "undefined" ? weather.type : "sun"; return w === "sun" && (typeof daylight !== "function" || daylight() === "day"); }
  var HOLE = [108, 89];
  function fishFits(k, spot, bait) {
    var f = FISH[k], ph = typeof daylight === "function" ? daylight() : "day";
    if (spot !== "eis" && f.at.indexOf(spot) < 0) return false;          // through the ice any kind may come up
    if (!f.find && f.bait.indexOf(bait) < 0) return false;
    if (f.when && f.when !== ph) return false; if (f.notIn && f.notIn === season()) return false;
    if (f.wet && !wetNow()) return false; if (f.sun && !sunNow()) return false; if (f.moon && !moonFull()) return false;
    return true;
  }
  // a spot gets shy after three catches in a little while
  var SHY_N = 3, SHY_MIN = 20;
  function spotShy(spot) { var q = (fishL().spots[spot] || []).filter(function (t) { return Date.now() - t < SHY_MIN * 60000; }); fishL().spots[spot] = q; return q.length >= SHY_N; }
  function fishPick(spot, bait) {
    var book = fishL().book, pool = [];
    Object.keys(FISH).forEach(function (k) {
      if (!fishFits(k, spot, bait)) return;
      var w = RW[FISH[k].r]; if (!book[k]) w *= .45;        // a kind not caught yet is a little harder to come by
      pool.push([k, w]);
    });
    if (!pool.length) return "stiefel";
    var tot = pool.reduce(function (a, q) { return a + q[1]; }, 0), r = Math.random() * tot;
    for (var i = 0; i < pool.length; i++) { r -= pool[i][1]; if (r <= 0) return pool[i][0]; }
    return pool[0][0];
  }
  function stars(n) { return '<span class="fi-st">' + "★★★".slice(0, n) + '<i>' + "★★★".slice(n) + '</i></span>'; }
  // ---- the scene ----
  var fiEl = xEl("div", "bee-pov fi-pov", scene); fiEl.hidden = true;
  fiEl.innerHTML = '<canvas width="180" height="135" class="fi-cv"></canvas><div class="fi-lh"></div><div class="fi-dark"></div><b class="bp-ban fi-ban"></b><div class="fi-card" hidden></div><button type="button" class="bp-x" aria-label="Angeln beenden">×</button>';
  var fiCv = fiEl.querySelector(".fi-cv"), fc = fiCv.getContext("2d"); fc.imageSmoothingEnabled = false;
  var fiBan = fiEl.querySelector(".fi-ban"), fiCard = fiEl.querySelector(".fi-card");
  function fiBanner(t) { if (fiBan.textContent === t) return; fiBan.textContent = t; fiBan.classList.remove("pop"); void fiBan.offsetWidth; if (t) fiBan.classList.add("pop"); }
  var FLOAT = [108, 88], TIP = [78, 50], CRANK = [157, 113], JETTY = [70, 110];
  var fi = null, fiRaf = 0, fiOpen = false, fiDone = null;
  function FR(x, y, w, h, c) { fc.fillStyle = c; fc.fillRect(Math.round(x), Math.round(y), w, h); }
  function img(k, x, y) { var im = FIMG[k]; if (im && im.complete) fc.drawImage(im, Math.round(x), Math.round(y)); }
  function line(x0, y0, x1, y1, c, sag) {
    var n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0)));
    for (var i = 0; i <= n; i++) { var t = i / n; FR(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * (sag || 0), 1, 1, c); }
  }
  function rings(x, y, t, big) {
    for (var i = 0; i < 2; i++) {
      var u = ((t / 900) + i * .5) % 1, r = 4 + u * (big ? 12 : 8), ry = r * .3;
      for (var a = 0; a < 40; a++) { var an = a / 40 * Math.PI * 2, px = x + Math.cos(an) * r, py = y + Math.sin(an) * ry; if (Math.sin(an) < 0 && Math.abs(px - x) < 2) continue; if (u < .5 || (Math.floor(px) >> 1) % 2 === 0) FR(px, py, 1, 1, u < .35 ? "#ffffff" : "#cfe6f4"); }
    }
  }
  function floatAt(x, y, dip) {
    if (dip) { FR(x - 1, y - 4, 3, 2, "#e8554a"); FR(x, y - 5, 1, 1, "#3a2414"); return; }
    FR(x - 1, y - 6, 3, 4, "#e8554a"); FR(x - 1, y - 6, 1, 1, "#ff9a8a"); FR(x + 1, y - 5, 1, 3, "#b8342a"); FR(x - 1, y - 2, 3, 3, "#ffffff"); FR(x + 1, y - 2, 1, 3, "#d8dce4"); FR(x, y - 7, 1, 1, "#3a2414");
    FR(x - 2, y - 7, 5, 1, "rgba(58,36,20,0)");
  }
  function shadowAt(x, y, r) {
    for (var yy = Math.floor(y - r * .4); yy <= y + r * .4; yy++) for (var xx = Math.floor(x - r * 1.5); xx <= x + r * 1.6; xx++) {
      var v = Math.pow((xx + .5 - x) / r, 2) + Math.pow((yy + .5 - y) / (r * .38), 2), vt = Math.pow((xx + .5 - x - r * 1.1) / (r * .4), 2) + Math.pow((yy + .5 - y) / (r * .32), 2);
      if (v <= 1 || vt <= 1) { if ((v > .55 && vt > .5) && (xx + yy) % 2) continue; FR(xx, yy, 1, 1, "rgba(30,70,110,.55)"); }
    }
  }
  function gauge(f, blue) {                           // the bar on the left: green fills while cranking, blue while holding against; pips show the rounds
    var x0 = 6, y0 = 14, w = 13, h = 60;
    FR(x0, y0 - 4, w, h + 8, "#3a2414"); FR(x0 - 1, y0 - 3, w + 2, h + 6, "#3a2414");
    FR(x0 + 1, y0 - 3, w - 2, h + 6, "#8a5a34"); FR(x0, y0 - 2, w, h + 4, "#8a5a34"); FR(x0, y0 - 2, 2, h + 4, "#c89060"); FR(x0 + w - 2, y0 - 2, 2, h + 4, "#6e4428");
    [[x0 + 1, y0 - 2], [x0 + w - 2, y0 - 2], [x0 + 1, y0 + h + 1], [x0 + w - 2, y0 + h + 1]].forEach(function (q) { FR(q[0], q[1], 1, 1, "#e0b040"); });
    var cells = 12, ch = h / cells, col = blue ? "#5aa8e0" : "#6fae4a";
    for (var i = 0; i < cells; i++) {
      var on = i / cells < f - .001, y = y0 + h - (i + 1) * ch;
      FR(x0 + 3, y, w - 6, Math.floor(ch) - 1, on ? col : "#5a3e2a"); if (on) FR(x0 + 3, y, 1, Math.floor(ch) - 1, "rgba(255,255,255,.35)");
    }
    for (var k = 0; k < ROUNDS; k++) {                 // one pip per round, filled when that round is done
      var px = x0 + k * 5, py = y0 + h + 8, done = k < fi.round;
      FR(px - 1, py - 1, 5, 5, "#3a2414"); FR(px, py, 3, 3, done ? "#ffd34a" : "#5a3e2a"); if (done) FR(px, py, 1, 1, "#fff1a8");
    }
  }
  // the big arrow lying on its side: dir -1 points left, 1 points right; (x, y) is its centre
  function bigSideArrow(dir, x, y) { var C = { o: "#3a2414", Y: "#ffd34a", L: "#fff1a8", D: "#e0a020" }, H = ARROW.length, W = ARROW[0].length;
    for (var j = 0; j < H; j++) for (var i = 0; i < W; i++) { var c = C[ARROW[j][i]]; if (!c) continue; var xx = dir > 0 ? j : H - 1 - j, yy = i; if (dir < 0 && (ARROW[j][i] === "L" || ARROW[j][i] === "D")) c = C[ARROW[j][i] === "L" ? "L" : "D"]; FR(x - Math.floor(H / 2) + xx, y - Math.floor(W / 2) + yy, 1, 1, c); } }
  function crank(a) {
    img("crank", CRANK[0] - 17, CRANK[1] - 17);
    var hx = CRANK[0] + Math.cos(a) * 11, hy = CRANK[1] + Math.sin(a) * 11;
    line(CRANK[0], CRANK[1], hx, hy, "#6e4428"); line(CRANK[0] + 1, CRANK[1], hx + 1, hy, "#6e4428");
    FR(hx - 2, hy - 2, 5, 5, "#3a2414"); FR(hx - 1, hy - 1, 3, 3, "#e8554a"); FR(hx - 1, hy - 1, 1, 1, "#f6a090");
  }
  function spotNear(x, y) { var best = null, bd = 1e9; Object.keys(FSPOTS).forEach(function (k) { var s_ = FSPOTS[k], d = Math.hypot((x - s_.x) * .8, y - s_.y); if (d < bd) { bd = d; best = k; } }); return best; }
  function iceNow() { return fi && fi.se === "winter"; }
  function landAt() { return iceNow() ? HOLE : JETTY; }
  function aimMarks() { return iceNow() ? { eis: { x: HOLE[0], y: HOLE[1], n: "Ins Eisloch" } } : FSPOTS; }
  function markAt(x, y) { var m = aimMarks(), best = null, bd = 24; Object.keys(m).forEach(function (k) { var d = Math.hypot((x - m[k].x) * .8, y - m[k].y); if (d < bd) { bd = d; best = k; } }); return best; }
  // a big pixel arrow pointing down, dark outline, yellow body with a light edge; (x, y) is the top centre
  var ARROW = ["    ooooooooo    ", "    oLYYYYYYo    ", "    oLYYYYYYo    ", "    oLYYYYYYo    ", "    oLYYYYYYo    ", "    oLYYYYYYo    ", "    oLYYYYYYo    ", "    oLYYYYYYo    ", "oooooLYYYYYYooooo", "oLLLLYYYYYYYYYYDo", " oLYYYYYYYYYYYDo ", "  oLYYYYYYYYYDo  ", "   oLYYYYYYYDo   ", "    oLYYYYYDo    ", "     oLYYYDo     ", "      oLYDo      ", "       oDo       ", "        o        "];
  function bigArrow(x, y) { var C = { o: "#3a2414", Y: "#ffd34a", L: "#fff1a8", D: "#e0a020" }; ARROW.forEach(function (row, j) { for (var i = 0; i < row.length; i++) { var c = C[row[i]]; if (c) FR(x - 8 + i, y + j, 1, 1, c); } }); }
  function aimTarget(a) { if (iceNow()) return HOLE.slice(); var dx = a.x - a.x0, dy = a.y - a.y0, pw = Math.max(0, Math.min(1, Math.hypot(dx, dy) / 55)); return [Math.max(18, Math.min(166, 92 - dx * 1.7)), Math.max(58, Math.min(108, 110 - pw * 52))]; }
  function draw(t) {
    if (!fiOpen) return;
    var dt = Math.min(.05, (t - (fi.last || t)) / 1000); fi.last = t; fi.T += dt;
    img("bg_" + fi.se, 0, 0);
    var P = fi.phase, tipx = TIP[0] + (P === "reel" ? fi.rs * 10 : 0), tipy = TIP[1];
    if (P === "bite" || (P === "reel" && fi.stage === "pull")) { tipx += 3; tipy += 5; }
    var FL = fi.fl || FLOAT;
    // waiting: a shadow circles near the float
    if ((P === "wait" || P === "bite") && fi.T > fi.shadowAt && !fi.shy) { var an = fi.T * .9; shadowAt(FL[0] - 6 + Math.cos(an) * 12, FL[1] + 8 + Math.sin(an) * 3, 6); }
    var fx = FL[0], fy = FL[1];
    if (P === "reel") {
      if (iceNow()) { fx = HOLE[0]; fy = HOLE[1] - 2; for (var bq = 0; bq < 3; bq++) FR(HOLE[0] - 6 + ((t / 90 + bq * 5) % 12), HOLE[1] - ((t / 60 + bq * 4) % 3), 1, 1, "#ffffff"); }   // under the ice: only bubbles in the hole
      else { fx = FL[0] + (JETTY[0] - FL[0]) * fi.prog + fi.lx * 26; fy = FL[1] + (JETTY[1] - FL[1]) * fi.prog; shadowAt(fx, fy + 3, 6 + fi.prog * 2); }
    }
    if (P === "aim") {
      // aiming: every spot shows a little ring on the water; tap one to choose it (a big arrow floats above it),
      // tap it again to cast there. The rod leans back once a spot is chosen.
      var chosen = fi.sel || null, marks = aimMarks();
      if (chosen) { tipx = TIP[0] - 8; tipy = TIP[1] + 10; }
      Object.keys(marks).forEach(function (k) {
        var m = marks[k], on = k === chosen, pulse = on ? (Math.floor(t / 160) % 3) : 0, rx = 7 + pulse, ry = 2.6 + pulse * .4;
        for (var a3 = 0; a3 < 32; a3++) { var an3 = a3 / 32 * Math.PI * 2; if (!on && a3 % 4 > 1) continue; var qx = m.x + Math.cos(an3) * rx, qy = m.y + Math.sin(an3) * ry; FR(qx, qy + 1, 1, 1, "#2e5a86"); FR(qx, qy, 1, 1, on ? "#ffd34a" : "#fff8ec"); }
        if (!on) { FR(m.x - 1, m.y - 1, 3, 3, "#3a2414"); FR(m.x, m.y, 1, 1, "#fff8ec"); }
        else bigArrow(m.x, m.y - 25 + [0, 1, 2, 1][Math.floor(t / 180) % 4]);
      });
      line(tipx, tipy, tipx + 1, tipy + 10, "#f6f2ea", 0); floatAt(tipx + 1, tipy + 17, false);
    } else if (P === "cast") {
      var u2 = Math.min(1, (fi.T - fi.castT) / .6), cx = tipx + (FL[0] - tipx) * u2, cy = tipy + (FL[1] - tipy) * u2 - Math.sin(u2 * Math.PI) * 24;
      line(tipx, tipy, cx, cy, "#f6f2ea", 3); floatAt(cx, cy, false);
      if (u2 >= 1) startWait();
    } else if (P === "wait" || P === "bite") {
      var nib = fi.nibble && fi.T < fi.nibble ? 2 : 0, bob = P === "wait" ? (Math.floor(t / 600) % 2) + nib : 3 + (Math.floor(t / 180) % 2);
      rings(FL[0], FL[1] + 1, t, P === "bite" || nib > 0); line(tipx, tipy, FL[0], FL[1] - 7 + bob, "#f6f2ea", P === "wait" ? 6 : 0); floatAt(FL[0], FL[1] + bob, P === "bite");
      if (P === "wait") stepWait();
    } else if (P === "reel") {
      line(tipx, tipy, fx, fy, "#f6f2ea", 0);
      if (fi.stage === "pull") for (var s_ = 0; s_ < 4; s_++) FR(fx - 6 + ((t / 40 + s_ * 3) % 12), fy - 2 - ((t / 30 + s_ * 5) % 5), 1, 1, "#ffffff");
    } else if (P === "net") {
      var LA = landAt(), wob = Math.sin(fi.T * 8) * 2; if (!iceNow()) shadowAt(LA[0] + wob, LA[1] + 2, 8); line(tipx, tipy, LA[0] + wob, LA[1], "#f6f2ea", 0);
      for (var s2 = 0; s2 < 5; s2++) FR(LA[0] - 8 + ((t / 35 + s2 * 4) % 16), LA[1] - 3 - ((t / 25 + s2 * 3) % 6), 1, 1, "#ffffff");
    }
    // the rod and the hamster from behind
    if (P !== "bait" && P !== "catch" && P !== "book") {
      line(44, 112, tipx, tipy, "#8a5a30"); line(45, 112, tipx + 1, tipy, "#c89060"); line(44, 113, tipx - 1, tipy + 1, "#8a5a30");
      FR(48, 102, 5, 5, "#3a2414"); FR(49, 103, 3, 3, "#a8a2b4"); FR(49, 103, 1, 1, "#e8e4f0");
    }
    img(P === "reel" || P === "net" || (P === "wait" && Math.floor(t / 700) % 2) ? "ham_back1" : "ham_back0", 8, 87 + (P === "reel" && Math.floor(t / 150) % 2 ? 1 : 0));
    if (P === "reel") stepReel(dt);
    if (P === "net") { var nx = fi.net ? fi.net.x : 140, ny = fi.net ? fi.net.y : 116; img("net", nx - 31, ny - 8); }
    if (fi.splash) { fi.splash.forEach(function (q) { q.vy += 160 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; FR(q.x, q.y, 1, 1, "#ffffff"); }); fi.splash = fi.splash.filter(function (q) { return q.life > 0; }); }
    if (fi.jump) {
      var k = Math.min(1, (fi.T - fi.jump.t0) / .8), jx = fi.jump.x + (90 - fi.jump.x) * k, jy = fi.jump.y + (60 - fi.jump.y) * k - Math.sin(k * Math.PI) * 30, im = FIMG["f_" + fi.catchK];
      if (im && im.complete) fc.drawImage(im, Math.round(jx - im.naturalWidth / 2), Math.round(jy - im.naturalHeight / 2));
      if (k >= 1) { fi.jump = null; showCatch(); }
    }
    fiRaf = requestAnimationFrame(draw);
  }
  // waiting: a few little nibbles first, then the real bite; a shy spot stays quiet
  function startWait() {
    fi.phase = "wait"; fi.shadowAt = fi.T + 1.5; fi.shy = spotShy(fi.spot); fi.nibble = 0; beep([[240, .05], [180, .06]]);
    if (fi.shy) { fiBanner("Geduld …"); fi.shyAt = fi.T + 5; return; }
    fiBanner("Geduld …"); fi.plan = []; var tt = fi.T + 3 + Math.random() * 4, n = 1 + Math.floor(Math.random() * 3);
    for (var i = 0; i < n; i++) { fi.plan.push(tt); tt += 1.4 + Math.random() * 2.4; }
    fi.biteAt = tt + .8 + Math.random() * 1.5;
  }
  function stepWait() {
    if (fi.shy) { if (fi.T > fi.shyAt) { fi.shy = false; fiBanner("Hier sind die Fische gerade scheu"); beep([[300, .05]]); setTimeout(function () { if (fi && fi.phase === "wait") showBait("Probier eine andere Stelle."); }, 1600); fi.shyAt = 1e9; } return; }
    if (fi.plan.length && fi.T > fi.plan[0]) { fi.plan.shift(); fi.nibble = fi.T + .35; beep([[520, .02]]); }
    if (!fi.plan.length && fi.T > fi.biteAt) { fi.phase = "bite"; fi.catchK = fishPick(fi.spot, fi.bait); fiBanner("Biss!"); beep([[660, .05], [880, .07]]); }
  }
  function tooEarly() { fiBanner("Zu früh! Er schwimmt kurz weg"); beep([[300, .04], [240, .05]]); fi.plan = [fi.T + 2.5 + Math.random() * 2]; fi.biteAt = fi.plan[0] + 2 + Math.random() * 2; setTimeout(function () { if (fi && fi.phase === "wait") fiBanner("Geduld …"); }, 1500); }
  // reeling, in three rounds: crank fast until the bar is full (it sinks back on its own if you stop),
  // then the fish pulls to one side and you drag the other way until the blue bar is full; after the third round the net comes.
  // Under the ice there is no side pull, only a short pause between the rounds.
  var ROUNDS = 3;
  function reelStart() { fi.phase = "reel"; fi.round = 0; fi.stage = "crank"; fi.fill = 0; fi.hold = 0; fi.prog = 0; fi.ang = -Math.PI / 2; fi.lx = 0; fi.rs = 0; fiBanner("Schnell kurbeln!"); beep([[784, .05]]); }
  function stepReel(dt) {
    var r = FISH[fi.catchK] ? FISH[fi.catchK].r : 1;
    if (fi.stage === "crank") {
      fi.lx += -fi.lx * 2 * dt;
      if (fi.fill < 1) fi.fill = Math.max(0, fi.fill - dt * (.16 + r * .06));     // rarer fish slip back a little faster
      else {
        fi.round++; fi.fill = 0; fi.hold = 0;
        if (fi.round >= ROUNDS) { fi.prog = 1; fi.phase = "net"; fi.net = null; fiBanner("Kescher drunter!"); beep([[523, .05], [659, .05]]); }
        else { fi.stage = "pull"; fi.pdir = Math.random() < .5 ? -1 : 1; fi.pullT = fi.T; fiBanner(iceNow() ? "Er zieht! Kurz warten" : fi.pdir < 0 ? "Nach rechts ziehen!" : "Nach links ziehen!"); beep([[200, .05], [160, .06]]); }
      }
    } else {                                                      // the fish pulls towards pdir; hold the other way
      if (iceNow()) { fi.hold = Math.min(1, (fi.T - fi.pullT) / 1.4); fi.lx = 0; }
      else {
        var good = fi.rs * fi.pdir < -.35;
        fi.hold = Math.max(0, Math.min(1, fi.hold + (good ? dt / 1.3 : -dt * .4)));
        fi.lx += ((good ? 0 : fi.pdir * .6) - fi.lx * (good ? 2 : .2)) * dt;
        fi.lx = Math.max(-1, Math.min(1, fi.lx));
      }
      if (fi.hold >= 1) { fi.stage = "crank"; fi.hold = 0; fiBanner(iceNow() ? "Schnell kurbeln!" : "Gut gehalten! Schnell kurbeln!"); beep([[660, .04], [880, .05]]); }
    }
    if (fi.phase !== "reel") return;
    fi.prog = Math.min(.95, (fi.round + (fi.stage === "crank" ? fi.fill : 0)) / ROUNDS);
    gauge(fi.stage === "crank" ? fi.fill : fi.hold, fi.stage === "pull"); crank(fi.ang);
    if (fi.stage === "pull" && !iceNow()) bigSideArrow(-fi.pdir, 90, 28 + [0, 1, 2, 1][Math.floor(fi.T * 5.5) % 4]);
  }
  function splashAt(x, y, n) { fi.splash = fi.splash || []; for (var i = 0; i < n; i++) { var a = -Math.PI * Math.random(); fi.splash.push({ x: x, y: y, vx: Math.cos(a) * 30, vy: Math.sin(a) * 50, life: .6 }); } }
  function landFish() { var LA = landAt(); fi.phase = "land"; fiBanner(""); splashAt(LA[0], LA[1], 12); beep([[523, .05], [659, .05], [784, .07]]); fi.jump = { x: LA[0], y: LA[1], t0: fi.T }; }
  // ---- cards: the bait, the catch with the measuring tape, the book ----
  function cardHTML(h) { fiCard.innerHTML = '<div class="fi-c">' + h + '</div>'; fiCard.hidden = false; }
  var PXS = 2.2;                                       // one game pixel on the cards, about the size of the scene's pixels
  function pic(k, sc) { var im = FIMG[k]; var w = im && im.naturalWidth || 16, h = im && im.naturalHeight || 16; return '<img src="' + FG[k] + '" style="width:' + (w * sc) + 'px;height:' + (h * sc) + 'px" alt="">'; }
  function showBait(note) {
    fi.phase = "bait"; fiBanner(""); var F = fishL(); if (!baitOk(F.bait)) F.bait = "brot";
    cardHTML('<p class="fi-h">Welcher Köder?</p>' + (note ? '<p class="fi-s">' + note + '</p>' : "") + '<div class="fi-baits">' + FBAIT.map(function (q) {
      var ok = baitOk(q[0]);
      return '<button type="button" class="fi-t' + (q[0] === F.bait ? " fi-sel" : "") + '" data-b="' + q[0] + '"' + (ok ? "" : " disabled") + '>' + pic("b_" + q[0], PXS) + '<span>' + (ok ? q[1] : "Stufe " + q[2]) + '</span></button>';
    }).join("") + '</div><div class="fi-row"><button type="button" class="fi-b2" data-a="book">Fischbuch</button><button type="button" class="fi-b" data-a="cast">Auswerfen</button></div>');
  }
  function showCatch() {
    fi.phase = "catch"; var k = fi.catchK, F = fishL(), book = F.book, f = FISH[k], cm = 0, isNew = !book[k], lv0 = fishLevel();
    if (!f.find) cm = Math.round(f.cm[0] + Math.pow(Math.random(), 1.6) * (f.cm[1] - f.cm[0]));
    var rec = !f.find && book[k] && cm > (book[k].best || 0), gold = !f.find && cm >= f.cm[0] + (f.cm[1] - f.cm[0]) * .9;
    book[k] = book[k] || { n: 0, best: 0 }; book[k].n++; if (cm > book[k].best) book[k].best = cm; if (gold) book[k].gold = true;
    F.total++; (F.spots[fi.spot] = F.spots[fi.spot] || []).push(Date.now()); F.hints[k] = true;
    var extra = "";
    if (isNew) { var sc = typeof seedPick === "function" ? seedPick() : null; if (sc) { seedAdd(sc, 1); extra += '<p class="fi-s">Für den neuen Eintrag: ein Tütchen ' + CROPS[sc].name + '-Samen</p>'; } }
    var hidden = Object.keys(FISH).filter(function (q) { return !F.hints[q]; });
    if (hidden.length && Math.random() < .35) { var hk = hidden[Math.floor(Math.random() * hidden.length)]; F.hints[hk] = true; extra += '<p class="fi-s fi-tip">Neuer Tipp im Fischbuch!</p>'; }
    if (fishLevel() > lv0) { var nb = FBAIT.filter(function (q) { return q[2] === fishLevel(); })[0]; extra += '<p class="fi-s fi-tip">Angler-Stufe ' + fishLevel() + '!' + (nb ? " Neuer Köder: " + nb[1] + "." : "") + '</p>'; }
    var all = Object.keys(FISH).every(function (q) { return book[q]; });
    if (all && !F.trophy) { F.trophy = true; extra += '<p class="fi-s fi-tip">Das Fischbuch ist voll! Der Angel-Pokal gehört dir.</p>'; }
    if (window.SudokuSave) window.SudokuSave();
    var art = { schleie: "Eine", forelle: "Eine", brasse: "Eine", flasche: "Eine", muschel: "Eine" }[k] || "Ein";
    var tape = cm ? '<div class="fi-tape"><div class="fi-onr">' + pic("f_" + k, PXS) + '</div>' + pic("ruler", PXS) + '</div><p class="fi-cm">' + cm + ' cm' + (gold ? ' <b class="fi-gold">Goldmarke</b>' : rec ? ' <b class="fi-gold">Rekord!</b>' : "") + '</p>' : '<div class="fi-pic">' + pic("f_" + k, PXS) + '</div>';
    cardHTML((isNew ? '<b class="fi-new">Neu!</b>' : "") + '<p class="fi-h">' + art + " " + FISHNAME[k] + '!</p>' + stars(f.r) + tape + extra +
      '<div class="fi-row"><button type="button" class="fi-b" data-a="again">' + (f.find ? "Weiter angeln" : "Freilassen") + '</button></div>');
  }
  function showBook(sel) {
    fi.phase = "book"; var F = fishL(), book = F.book, n = FG.list.filter(function (q) { return book[q[0]]; }).length;
    var tip = sel ? '<p class="fi-hint">' + (book[sel] ? FISHNAME[sel] + ": " : "") + (F.hints[sel] || book[sel] ? FISH[sel].hint : "Noch kein Tipp. Vielleicht verrät ihn ein Fang.") + (book[sel] && book[sel].best ? " Rekord: " + book[sel].best + " cm." : "") + '</p>' : '<p class="fi-hint">Tippe auf einen Eintrag für einen Tipp.</p>';
    cardHTML('<p class="fi-h fi-hl">' + (F.trophy ? pic("trophy", PXS * .7) + " " : "") + 'Fischbuch · ' + n + ' von ' + FG.list.length + ' · Stufe ' + fishLevel() + '</p>' + tip + '<div class="fi-book">' + FG.list.map(function (q) {
      var has = !!book[q[0]];
      return '<button type="button" class="fi-bt' + (has ? "" : " fi-no") + (has && book[q[0]].gold ? " fi-gd" : "") + (sel === q[0] ? " fi-sel" : "") + '" data-k="' + q[0] + '">' + pic("f_" + q[0], PXS) + '<span>' + (has ? q[1] : "?") + '</span>' + stars(FISH[q[0]].r) + '</button>';
    }).join("") + '</div><div class="fi-row"><button type="button" class="fi-b2" data-a="back">Zurück</button></div>');
  }
  fiCard.addEventListener("click", function (e) {
    e.stopPropagation(); var b = e.target.closest("button"); if (!b || !fi || b.disabled) return;
    if (b.dataset.b) { fishL().bait = b.dataset.b; beep([[700, .03]]); showBait(); return; }
    if (b.dataset.k) { showBook(b.dataset.k); return; }
    var a = b.dataset.a;
    if (a === "book") { showBook(); return; }
    if (a === "back") { showBait(); return; }
    if (a === "cast") { fi.bait = fishL().bait; fiCard.hidden = true; fi.phase = "aim"; fi.aim = null; fi.sel = null; fiBanner(iceNow() ? "Eisloch antippen" : "Angelstelle antippen"); return; }
    if (a === "again") { fiCard.hidden = true; if (!FISH[fi.catchK].find) { splashAt(90, 112, 8); beep([[392, .05], [262, .07]]); } showBait(); }
  });
  // ---- touch ----
  function pt(e) { var r = fiCv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 180, (e.clientY - r.top) / r.height * 135]; }
  fiCv.addEventListener("pointerdown", function (e) {
    if (!fi) return; e.preventDefault(); var p = pt(e); try { fiCv.setPointerCapture(e.pointerId); } catch (x) {}
    if (fi.phase === "aim") {
      var k = markAt(p[0], p[1]);
      if (!k) return;
      if (k !== fi.sel) { fi.sel = k; fiBanner(aimMarks()[k].n); beep([[660, .03]]); return; }   // first tap chooses the spot
      var M = aimMarks()[k]; fi.sel = null; fi.spot = k; fi.fl = [M.x, M.y]; fi.phase = "cast"; fi.castT = fi.T; fiBanner(M.n); beep([[520, .04], [780, .05]]); return;   // second tap casts
    }
    if (fi.phase === "wait") { if (!fi.shy) tooEarly(); return; }
    if (fi.phase === "bite") { reelStart(); return; }
    if (fi.phase === "reel") { if (Math.hypot(p[0] - CRANK[0], p[1] - CRANK[1]) < 30) fi.grab = Math.atan2(p[1] - CRANK[1], p[0] - CRANK[0]); else { fi.steer = true; fi.sx = p[0]; fi.rs = 0; } return; }
    if (fi.phase === "net") { var nx = fi.net ? fi.net.x : 140, ny = fi.net ? fi.net.y : 116; if (Math.hypot(p[0] - nx, p[1] - ny) < 22 || true) fi.net = { x: p[0], y: p[1], drag: true }; }
  });
  fiCv.addEventListener("pointermove", function (e) {
    if (!fi) return; var p = pt(e);
    if (fi.phase === "net" && fi.net && fi.net.drag) { fi.net.x = p[0]; fi.net.y = p[1]; return; }
    if (fi.phase !== "reel") return;
    if (fi.steer) { fi.rs = Math.max(-1, Math.min(1, (p[0] - fi.sx) / 30)); return; }   // drag sideways from where the finger went down
    if (fi.grab == null) return; var a = Math.atan2(p[1] - CRANK[1], p[0] - CRANK[0]), da = a - fi.grab;
    if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI;
    fi.grab = a; fi.ang += da; var d = Math.abs(da);
    if (fi.stage === "crank") fi.fill = Math.min(1, fi.fill + d / (Math.PI * 4.4));   // a bit more than two turns fill the bar
    if (Math.random() < .12) beep([[900 + Math.random() * 200, .01]]);
  });
  function up() {
    if (!fi) return;
    if (fi.phase === "net" && fi.net) { fi.net.drag = false; var LA = landAt(); if (Math.hypot(fi.net.x - LA[0], fi.net.y - LA[1] - 2) < 14) landFish(); else fiBanner("Unter den Fisch schieben"); return; }
    fi.grab = null; if (fi.steer) { fi.steer = false; fi.rs = 0; }
  }
  fiCv.addEventListener("pointerup", up); fiCv.addEventListener("pointercancel", up);
  function fishingGame() {
    return new Promise(function (resolve) {
      var sky = document.getElementById("sky").className, night = /sky-night/.test(sky), eve = /sky-eve/.test(sky);
      fi = { T: 0, phase: "bait", se: season(), bait: fishL().bait, rs: 0, lx: 0 };
      fiEl.querySelector(".fi-lh").innerHTML = lighthouse(night || eve, 150, 28);
      fiEl.querySelector(".fi-dark").className = "fi-dark" + (night ? " n" : eve ? " e" : "");
      fiEl.hidden = false; fiOpen = true; fiDone = resolve; showBait(); fiRaf = requestAnimationFrame(draw);
    });
  }
  function fishingEnd() { if (!fiOpen) return; fiOpen = false; cancelAnimationFrame(fiRaf); fiEl.hidden = true; fiCard.hidden = true; var d = fiDone; fiDone = null; fi = null; if (d) d(); }
  fiEl.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); fishingEnd(); });
  var _fi_interrupt = interrupt; interrupt = function () { if (fiOpen) fishingEnd(); return _fi_interrupt.apply(this, arguments); };
  async function fishSeq() {
    await walkTo(PSPOT.jettyMid.x, PSPOT.jettyMid.y); H.where = "jetty"; front({ paws: "up", eyes: "happy", mouth: "grin" }); say(N() + " packt die Angel aus."); await wait(600);
    await fishingGame(); H.where = null; front({ paws: "down", eyes: "happy", mouth: "smile" });
    var n = Object.keys(fishL().book).length; say(N() + " packt die Angel ein." + (n ? " Im Fischbuch: " + n + " von " + FG.list.length + "." : ""));
  }
  waterChoice = function () {
    var no = swimOk();
    var pp = openLPop(pondEl, '<p class="ph">Was möchte ' + N() + ' am Wasser machen?</p><div class="l-wchoice"><button type="button" class="pbtn" data-w="fish">Angeln</button><button type="button" class="pbtn" data-w="swim"' + (no ? " disabled" : "") + '>Baden</button></div>' + (no ? '<p class="pn">' + no + '</p>' : ""), 90, 30, "l-wpop");
    pp.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-w]"); if (!b || b.disabled) return; closeLPop(); if (busy) interrupt();
      if (b.dataset.w === "fish") act("fish", fishSeq); else act("swim", swimSeq);
    });
  };
  // winter at the lake: skating or fishing through the ice
  function winterChoice() {
    var pp = openLPop(pondEl, '<p class="ph">Was möchte ' + N() + ' auf dem Eis machen?</p><div class="l-wchoice"><button type="button" class="pbtn" data-w="skate">Schlittschuh laufen</button><button type="button" class="pbtn" data-w="fish">Eisangeln</button></div>', 90, 30, "l-wpop");
    pp.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-w]"); if (!b) return; closeLPop(); if (busy) interrupt();
      if (b.dataset.w === "fish") act("fish", iceFishSeq); else act("skate", skate);
    });
  }
  async function iceFishSeq() {
    await walkTo(PSPOT.iceIn.x, PSPOT.iceIn.y); front({ paws: "up", eyes: "happy", mouth: "grin" }); say(N() + " bohrt ein Loch ins Eis."); await wait(700);
    await fishingGame(); front({ paws: "down", eyes: "happy", mouth: "smile" });
    var n = Object.keys(fishL().book).length; say(N() + " packt die Angel ein." + (n ? " Im Fischbuch: " + n + " von " + FG.list.length + "." : ""));
  }
  window.__fish = { open: function () { return fishingGame(); }, st: function () { return fi && { phase: fi.phase, prog: fi.prog, fill: fi.fill, hold: fi.hold, stage: fi.stage, round: fi.round, k: fi.catchK, spot: fi.spot, lx: fi.lx }; },
    bite: function () { if (fi) { fi.plan = []; fi.biteAt = 0; fi.shy = false; } }, end: fishingEnd, winter: function () { winterChoice(); }, book: function () { return fishL(); }, pick: fishPick, fishFits: fishFits };
