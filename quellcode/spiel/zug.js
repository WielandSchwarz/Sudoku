  // ===================== Bimmelbahn: set the switches so every animal reaches its station on time (first playable draft) =====================
  var ZG_A = /*ZUGART*/, ZG_I = {}; Object.keys(ZG_A).forEach(function (k) { var im = new Image(); im.src = ZG_A[k]; ZG_I[k] = im; });
  var ZG_N = { dorf: [22, 22], j1: [70, 22], muehle: [158, 22], j2: [158, 56], see: [158, 84], wald: [22, 84], berg: [96, 56], c1: [70, 56] };
  var ZG_E = [["dorf", "j1"], ["j1", "muehle"], ["j1", "c1"], ["c1", "berg"], ["berg", "j2"], ["muehle", "j2"], ["j2", "see"], ["see", "wald"], ["wald", "dorf"]];
  var ZG_ST = { dorf: "#e9b949", muehle: "#c8463c", see: "#4a9ad0", wald: "#4e8c3c", berg: "#9a9aa6" };
  var ZG_SW = { j1: { opts: ["muehle", "c1", "dorf"], straight: { dorf: "muehle", muehle: "dorf", c1: "dorf" } }, j2: { opts: ["see", "berg", "muehle"], straight: { muehle: "see", see: "muehle", berg: "muehle" } } };
  var ZG_BOX = { dorf: [30, 27], muehle: [152, 27, 1], see: [152, 60, 1], wald: [28, 60], berg: [108, 30] };
  var ZG_DAY = [   /* [time, animal, from, to, patience in seconds of driving] */
    [0, "maus", "dorf", "see", 40], [0, "hase", "dorf", "muehle", 26], [0, "igel", "see", "berg", 48], [0, "fuchs", "muehle", "wald", 50],
    [8, "frosch", "berg", "dorf", 45], [14, "maus", "wald", "muehle", 50], [20, "hase", "see", "dorf", 45], [28, "igel", "muehle", "see", 40]
  ];
  var ZG_SPEED = 26, zgNb = {};
  ZG_E.forEach(function (e) { (zgNb[e[0]] = zgNb[e[0]] || []).push(e[1]); (zgNb[e[1]] = zgNb[e[1]] || []).push(e[0]); });
  var zgV = mPov("zg-pov", "Bahnhof verlassen"), zgS = null; zgV.ban.style.display = "none";
  function zgR(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function zgLen(a, b) { var p = ZG_N[a], q = ZG_N[b]; return Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]); }
  function zgNext(prev, cur) {   /* where the train goes after reaching cur */
    var sw = ZG_SW[cur];   /* the train always goes where the arrow points (unless that is where it came from: then straight on) */
    if (sw) { var t = sw.opts[sw.set]; return t !== prev ? t : sw.straight[prev]; }
    return zgNb[cur].filter(function (n) { return n !== prev; })[0];
  }
  function zgAt(prev, cur, d) { var p = ZG_N[prev], q = ZG_N[cur], L = zgLen(prev, cur), u = L ? d / L : 0; return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]; }
  function zgBehind(s) {   /* a point s pixels behind the engine, walking back along the way it came */
    var S = zgS, a = S.prev, b = S.cur, d = S.d, h = S.hist.length - 1;
    while (s > d && h >= 0) { s -= d; b = a; a = S.hist[h--]; d = zgLen(a, b); if (!a) break; }
    if (!a) return ZG_N[b];
    return zgAt(a, b, Math.max(0, d - s));
  }
  // ---------------------------------------------------------------- the day
  function zgStart() {
    ZG_SW.j1.set = 0; ZG_SW.j2.set = 0;
    zgS = { prev: "wald", cur: "dorf", d: zgLen("wald", "dorf"), hist: ["see"], T: 0, clk: 0, spawn: 0, wait: {}, ride: [null, null, null, null, null, null], done: [], mode: "map", hot: {}, last: 0 };
    Object.keys(ZG_ST).forEach(function (k) { zgS.wait[k] = []; });
    zgSpawn(); zgArrive(); zgS.lastStop = "dorf";
  }
  function zgSpawn() {
    var S = zgS;
    while (S.spawn < ZG_DAY.length && ZG_DAY[S.spawn][0] <= S.T) {
      var q = ZG_DAY[S.spawn++]; S.wait[q[2]].push({ k: q[1], to: q[3], dl: q[0] + q[4], pat: q[4] });
    }
  }
  function zgLeft(a) { return Math.max(0, Math.min(1, (a.dl - zgS.T) / a.pat)); }
  function zgArrive() {   /* the train reaches a node: at a station animals get off and on, with a short look at the platform */
    var S = zgS, st = S.cur; if (!ZG_ST[st]) return false;
    var off = [], on = [];
    S.ride.forEach(function (a, i) { if (a && a.to === st) { off.push({ a: a, seat: i }); S.done.push({ a: a, ok: S.T <= a.dl }); S.ride[i] = null; } });
    while (S.wait[st].length && S.ride.indexOf(null) >= 0) { var a = S.wait[st].shift(), seat = S.ride.indexOf(null); S.ride[seat] = a; on.push({ a: a, seat: seat }); }
    if (!off.length && !on.length) return false;
    S.mode = "stop"; S.stop = { st: st, off: off, on: on, t: 0 };
    beep([[784, .08], [988, .12]]);
    off.forEach(function (o) { if (S.T > o.a.dl) beep([[220, .1]]); });
    return true;
  }
  function zgOver() { var S = zgS; return S.spawn >= ZG_DAY.length && S.ride.every(function (a) { return !a; }) && Object.keys(S.wait).every(function (k) { return !S.wait[k].length; }); }
  function zgStep(dt) {
    var S = zgS;
    if (S.mode === "stop") { S.stop.t += dt; if (S.stop.t > 2.6) { S.mode = "wait"; if (zgOver()) zgEnd(); } return; }
    if (S.mode !== "map") return;
    S.T += dt; zgSpawn();
    var L = zgLen(S.prev, S.cur); S.d += ZG_SPEED * dt;
    while (S.d >= L) {   /* reached S.cur */
      if (ZG_ST[S.cur] && S.lastStop !== S.cur) { S.lastStop = S.cur; S.d = L; if (!zgArrive()) { S.mode = "wait"; beep([[784, .06]]); if (zgOver()) zgEnd(); } return; }   /* every station: stop and wait for "Los" */
      var nx = zgNext(S.prev, S.cur); S.hist.push(S.prev); if (S.hist.length > 6) S.hist.shift();
      S.d -= L; S.prev = S.cur; S.cur = nx; S.lastStop = null; L = zgLen(S.prev, S.cur);
    }
    if (S.T > 240) zgEnd();
  }
  function zgEnd() {
    var S = zgS; if (S.mode === "end") return; S.mode = "end";
    S.ride.forEach(function (a) { if (a) S.done.push({ a: a, ok: false }); });
    Object.keys(S.wait).forEach(function (k) { S.wait[k].forEach(function (a) { S.done.push({ a: a, ok: false }); }); });
    var late = S.done.filter(function (d) { return !d.ok; }).length, st = late === 0 ? 3 : late <= 2 ? 2 : 1;
    var M = mL("zug"); M.best = Math.max(M.best || 0, st); if (window.SudokuSave) window.SudokuSave();
    beep(st === 3 ? [[523, .1], [659, .1], [784, .1], [1047, .25]] : [[523, .12], [440, .2]]);
    zgV.card.innerHTML = '<div class="fi-c"><p class="fi-h">Feierabend!</p>' + mStars(st) + '<div class="zg-list">' + S.done.map(function (d) {
      return '<div class="zg-row"><img src="' + ZG_A["h_" + d.a.k] + '" alt=""><img src="' + ZG_A["p_" + d.a.to] + '" alt=""><span class="' + (d.ok ? "ok" : "late") + '">' + (d.ok ? "✓" : "✗") + "</span></div>";
    }).join("") + '</div><div class="fi-row"><button type="button" class="fi-b2" data-a="again">Nochmal</button><button type="button" class="fi-b" data-a="end">Fertig</button></div></div>';
    zgV.card.hidden = false;
  }
  // ---------------------------------------------------------------- drawing
  function zgClock(c, x, y, f) {
    for (var yy = 0; yy < 7; yy++) for (var xx = 0; xx < 7; xx++) {
      var dx = xx + .5 - 3.5, dy = yy + .5 - 3.5, r = dx * dx + dy * dy; if (r > 12.5) continue;
      if (r > 7.5) { zgR(c, x + xx, y + yy, 1, 1, "#3a2414"); continue; }
      var a = ((Math.atan2(dx, -dy) / (2 * Math.PI)) + 1) % 1;
      zgR(c, x + xx, y + yy, 1, 1, a < f ? (f > .5 ? "#5aa84e" : f > .25 ? "#e9b949" : "#e8604a") : "#fff8ec");
    }
  }
  function zgImg(c, k, x, y) { var im = ZG_I[k]; if (im && im.complete) c.drawImage(im, Math.round(x), Math.round(y)); }
  function zgMap(c) {
    var S = zgS; zgImg(c, "map", 0, 0);
    Object.keys(ZG_SW).forEach(function (j) {   /* switches: the branch not taken is faded, the arrow points the way */
      var sw = ZG_SW[j], p = ZG_N[j];
      sw.opts.forEach(function (b, i) {
        if (i === sw.set) return; var q = ZG_N[b], dx = Math.sign(q[0] - p[0]), dy = Math.sign(q[1] - p[1]);
        c.globalAlpha = .5; for (var k = 9; k < 24; k++) zgR(c, p[0] + dx * k - (dy ? 4 : 0), p[1] + dy * k - (dx ? 4 : 0), dy ? 9 : 1, dx ? 9 : 1, "#9cc87a"); c.globalAlpha = 1;
      });
      var hot = (S.hot[j] || 0) > S.clk; zgImg(c, hot ? "sw1" : "sw0", p[0] - 8, p[1] - 8);
      var q2 = ZG_N[sw.opts[sw.set]], ax = Math.sign(q2[0] - p[0]), ay = Math.sign(q2[1] - p[1]);
      for (var i = -3; i <= 3; i++) zgR(c, p[0] + ax * i, p[1] + ay * i, 1, 1, "#3a2414");
      for (var k2 = 1; k2 <= 2; k2++) { zgR(c, p[0] + ax * (3 - k2) - ay * k2, p[1] + ay * (3 - k2) - ax * k2, 1, 1, "#3a2414"); zgR(c, p[0] + ax * (3 - k2) + ay * k2, p[1] + ay * (3 - k2) + ax * k2, 1, 1, "#3a2414"); }
    });
    Object.keys(S.wait).forEach(function (st) {   /* waiting animals in a little box next to their station */
      var w = S.wait[st].slice(0, 3); if (!w.length) return;
      var b = ZG_BOX[st], bw = w.length * 16 + 4, x = b[2] === 1 ? b[0] - bw : b[2] === 2 ? b[0] - bw / 2 : b[0], y = b[1];
      x = Math.round(x); zgR(c, x, y, bw + 2, 21, "#3a2414"); zgR(c, x + 1, y + 1, bw, 19, "#fff8ec");
      w.forEach(function (a, i) { zgImg(c, "h_" + a.k, x + 3 + i * 16, y + 5); zgImg(c, "p_" + a.to, x + 11 + i * 16, y); zgClock(c, x + 11 + i * 16, y + 12, zgLeft(a)); });
      if (S.wait[st].length > 3) zgR(c, x + bw - 2, y + 9, 2, 2, "#3a2414");
    });
    var pts = [0, 11, 22].map(zgBehind), pts2 = [4, 15, 26].map(zgBehind);   /* the little train: engine in front, two coaches */
    for (var t = 2; t >= 0; t--) {
      var p0 = pts[t], p1 = pts2[t], hz = Math.abs(p0[0] - p1[0]) >= Math.abs(p0[1] - p1[1]), w2 = hz ? 10 : 7, h2 = hz ? 7 : 10, x0 = Math.round(p0[0] - w2 / 2), y0 = Math.round(p0[1] - h2 / 2);
      zgR(c, x0 - 1, y0 - 1, w2 + 2, h2 + 2, "#3a2414"); zgR(c, x0, y0, w2, h2, t ? "#4e8c3c" : "#c8463c"); zgR(c, x0, y0, w2, 1, t ? "#6aa84e" : "#e8706a");
      if (t) { zgR(c, x0 + 2, y0 + 2, 2, 2, "#bfe4f4"); zgR(c, x0 + w2 - 4, y0 + h2 - 4, 2, 2, "#bfe4f4"); } else zgR(c, Math.round(p0[0]) - 1, Math.round(p0[1]) - 1, 3, 3, "#3a3a3a");
    }
  }
  var ZG_LOS = { x: 150, y: 108, w: 27, h: 23 };
  function zgSeats(c) {
    var S = zgS;
    zgR(c, 0, 104, 180, 31, "#3a2414"); zgR(c, 0, 105, 180, 30, "#b07a46"); zgR(c, 0, 105, 180, 2, "#c8945a");
    for (var wv = 0; wv < 2; wv++) {
      var x0 = 2 + wv * 74; zgR(c, x0, 106, 72, 26, "#3a2414"); zgR(c, x0 + 1, 107, 70, 24, "#4e8c3c"); zgR(c, x0 + 1, 107, 70, 2, "#6aa84e");
      for (var s = 0; s < 3; s++) {
        var i = wv * 3 + s, sx = x0 + 3 + s * 22, a = S.ride[i];
        zgR(c, sx, 110, 21, 17, "#3a2414"); zgR(c, sx + 1, 111, 19, 15, "#bfe4f4");
        if (a) { zgImg(c, "h_" + a.k, sx + 1, 112); zgImg(c, "p_" + a.to, sx + 12, 110); zgClock(c, sx + 13, 118, zgLeft(a)); }
      }
    }
    var b = ZG_LOS, on = S.mode === "wait", C3 = on ? ["#5aa84e", "#7cc86a", "#3e8434", "#2e6a26"] : ["#8a8a7a", "#a4a494", "#6a6a5a", "#5a5a4a"];
    zgR(c, b.x, b.y, b.w, b.h, "#3a2414"); zgR(c, b.x + 1, b.y + 1, b.w - 2, b.h - 2, C3[0]); zgR(c, b.x + 1, b.y + 1, b.w - 2, 2, C3[1]); zgR(c, b.x + 1, b.y + b.h - 3, b.w - 2, 2, C3[2]);
    if (typeof rpText === "function") rpText(c, "LOS!", b.x + 7, b.y + 9, "#fff8ec", C3[3]);
    if (on && Math.floor(S.clk * 2) % 2) { zgR(c, b.x - 1, b.y - 1, b.w + 2, 1, "#ffe08a"); zgR(c, b.x - 1, b.y + b.h, b.w + 2, 1, "#ffe08a"); }
  }
  var ZG_WIN = [[7, 66], [23, 66], [39, 66], [63, 66], [79, 66], [95, 66]];   /* the coach windows in the side view */
  function zgSide(c) {
    var S = zgS, P = S.stop, t = P.t, u = Math.min(1, t / 1.6);
    zgImg(c, "side_" + P.st, 0, 0);
    S.ride.forEach(function (a, i) {
      if (!a) return; var boarding = P.on.some(function (o) { return o.seat === i; }); if (boarding && u < 1) return;
      zgImg(c, "h_" + a.k, ZG_WIN[i][0], ZG_WIN[i][1]);
    });
    P.off.forEach(function (o, j) {   /* getting off: out of the door, then off along the platform */
      var w = ZG_WIN[o.seat], x = w[0] + 6 + u * (70 + j * 14), hop = Math.abs(Math.sin(t * 9 + j)) * 2;
      zgImg(c, "b_" + o.a.k, x - 8, 104 - hop); zgImg(c, "h_" + o.a.k, x - 6, 94 - hop);
    });
    P.on.forEach(function (o, j) {   /* getting on: from the platform to the door */
      if (u >= 1) return; var w = ZG_WIN[o.seat], sx = 120 + j * 18, x = sx + (w[0] + 6 - sx) * u, hop = Math.abs(Math.sin(t * 9 + j * 2)) * 2;
      zgImg(c, "b_" + o.a.k, x - 8, 104 - hop); zgImg(c, "h_" + o.a.k, x - 6, 94 - hop); zgImg(c, "p_" + o.a.to, x + 3, 89 - hop);
    });
  }
  function zgDraw(now) {
    var S = zgS; if (!S) return;
    var dt = Math.min(.05, (now - (S.last || now)) / 1000) * (window.__zugFast || 1); S.last = now; S.clk += dt;
    zgStep(dt);
    var c = zgV.c; c.clearRect(0, 0, 180, 135);
    if (S.mode === "stop") zgSide(c); else { zgMap(c); zgSeats(c); }
    S.raf = requestAnimationFrame(zgDraw);
  }
  // ---------------------------------------------------------------- input and cards
  zgV.cv.addEventListener("pointerdown", function (e) {
    var S = zgS; if (!S || !zgV.card.hidden) return;
    if (S.mode === "stop") { S.stop.t = 9; return; }   /* tap skips the platform scene */
    var q = mPt(zgV, e), b = ZG_LOS;
    if (S.mode === "wait" && q[0] >= b.x && q[0] < b.x + b.w && q[1] >= b.y && q[1] < b.y + b.h) { S.mode = "map"; beep([[523, .05], [784, .08]]); return; }
    Object.keys(ZG_SW).forEach(function (j) {
      var p = ZG_N[j]; if (Math.abs(q[0] - p[0]) <= 10 && Math.abs(q[1] - p[1]) <= 10) { ZG_SW[j].set = (ZG_SW[j].set + 1) % 3; S.hot[j] = S.clk + .3; beep([[660, .03], [520, .05]]); }
    });
  });
  zgV.card.addEventListener("click", function (e) {
    e.stopPropagation(); var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.a === "go") { zgV.card.hidden = true; zgS.mode = zgS.stop ? "stop" : "wait"; }
    else if (b.dataset.a === "again") { zgStart(); zgIntro(); } else zgClose();
  });
  function zgIntro() {
    var S = zgS; S.mode0 = S.mode; S.mode = "intro";
    zgV.card.innerHTML = '<div class="fi-c"><p class="fi-h">Bimmelbahn</p><p class="fi-s">Tippe die Weichen an. Bring jedes Tier zu seinem Bahnhof, bevor seine Uhr abläuft.</p><div class="fi-row"><button type="button" class="fi-b" data-a="go">Los!</button></div></div>';
    zgV.card.hidden = false;
  }
  function zgOpen() { zgV.el.hidden = false; zgStart(); zgIntro(); cancelAnimationFrame(zgS.raf); zgS.last = 0; zgS.raf = requestAnimationFrame(zgDraw); }
  function zgClose() { if (zgS) cancelAnimationFrame(zgS.raf); zgS = null; zgV.el.hidden = true; }
  zgV.el.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); zgClose(); });
  (function () { var b = document.getElementById("d-zug"); if (b) b.addEventListener("click", function () { zgOpen(); }); })();   /* preview only for now */
  window.__zug = { open: zgOpen, close: zgClose, state: function () { return zgS; }, sw: ZG_SW };
