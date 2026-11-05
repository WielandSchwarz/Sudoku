
  // ===================== Farbklecks: slide all tiles at once, four or more of a colour that touch go "plopp" (after Google's Color Tiles) =====================
  var TilesGame = (function () {
    var COLORS = [null,
      { c: "#e8554a", d: "#b8382e", n: "Rot", p: "dot" }, { c: "#4a8ad8", d: "#2e62a8", n: "Blau", p: "bar" }, { c: "#f2c230", d: "#c8921a", n: "Gelb", p: "plus" },
      { c: "#5aaa4a", d: "#3a7e30", n: "Grün", p: "diag" }, { c: "#a868d0", d: "#7a44a0", n: "Lila", p: "ring" }, { c: "#f08a38", d: "#c0601a", n: "Orange", p: "corner" }];
    var DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }, DK = ["up", "down", "left", "right"];
    var BASE_MOVES = 6, MAX_CARRY = 3, MAX_MOVES = 9, DAYLEVELS = 20;
    function tier(L) {   // board size, colours and blocks by level (1..20)
      var t = [[4, 4, 2, 0], [5, 4, 3, 0], [5, 4, 3, 1], [5, 5, 3, 1], [5, 5, 3, 2], [6, 5, 4, 2], [6, 5, 4, 2], [6, 6, 4, 3], [6, 6, 4, 3], [7, 6, 5, 3],
        [7, 6, 5, 4], [7, 6, 5, 4], [7, 7, 5, 4], [7, 7, 5, 5], [8, 7, 6, 5], [8, 7, 6, 5], [8, 8, 6, 6], [8, 8, 6, 6], [8, 8, 6, 7], [8, 8, 6, 7]][Math.max(0, Math.min(19, L - 1))];
      return { w: t[0], h: t[1], colors: t[2], blocks: t[3], minSol: L < 4 ? 1 : L < 9 ? 2 : L < 15 ? 3 : 4 };
    }
    function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
    function today() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
    function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

    // ---- rules on a plain array: 0 empty, -1 block, 1..6 colours ----
    function slide(b, w, h, dir) {   // every free tile moves one step if the cell in front is (or becomes) empty
      var d = DIRS[dir], out = b.slice(), moved = [], xs = [], ys = [], x, y;
      for (x = 0; x < w; x++) xs.push(x); for (y = 0; y < h; y++) ys.push(y);
      if (d[0] > 0) xs.reverse(); if (d[1] > 0) ys.reverse();
      for (var yi = 0; yi < h; yi++) for (var xi = 0; xi < w; xi++) {
        x = xs[xi]; y = ys[yi]; var i = y * w + x, c = out[i]; if (c <= 0) continue;
        var nx = x + d[0], ny = y + d[1]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        var j = ny * w + nx; if (out[j] !== 0) continue;
        out[j] = c; out[i] = 0; moved.push([i, j]);
      }
      return { b: out, moved: moved };
    }
    function groups(b, w, h) {   // connected same-colour groups of 4 or more
      var seen = new Uint8Array(b.length), res = [];
      for (var i = 0; i < b.length; i++) {
        if (seen[i] || b[i] <= 0) continue;
        var c = b[i], st = [i], g = []; seen[i] = 1;
        while (st.length) { var k = st.pop(); g.push(k); var x = k % w, y = (k / w) | 0;
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var nx = x + d[0], ny = y + d[1]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) return; var n = ny * w + nx; if (!seen[n] && b[n] === c) { seen[n] = 1; st.push(n); } }); }
        if (g.length >= 4) res.push(g);
      }
      return res;
    }
    function step(b, w, h, dir) {
      var r = slide(b, w, h, dir), gs = groups(r.b, w, h), out = r.b;
      if (gs.length) { out = out.slice(); gs.forEach(function (g) { g.forEach(function (k) { out[k] = 0; }); }); }
      return { b: out, moved: r.moved, gs: gs };
    }
    function clear(b) { for (var i = 0; i < b.length; i++) if (b[i] > 0) return false; return true; }
    // shortest solution length up to maxD (iterative deepening with a visited map)
    function solve(b, w, h, maxD) {
      for (var D = 1; D <= maxD; D++) {
        var seen = {};
        var ok = (function dfs(s, d) {
          if (clear(s)) return true; if (d === 0) return false;
          var key = s.join(",") + "|" + d; if (seen[key]) return false; seen[key] = 1;
          for (var k = 0; k < 4; k++) { var r = step(s, w, h, DK[k]); if (r.moved.length || r.gs.length) { if (dfs(r.b, d - 1)) return true; } }
          return false;
        })(b, D);
        if (ok) return D;
      }
      return 0;
    }
    // a level: every colour has exactly four tiles, pulled apart a little. Each candidate is played through:
    // we want one clear intended way (few shortest solutions), little luck (random swiping rarely wins),
    // pops that come one after another, and a little room in the move budget.
    function rawLevel(L, r) {
      var T = tier(L);
      for (var tries = 0; tries < 60; tries++) {
        var w = T.w, h = T.h, b = new Array(w * h).fill(0), ok = true;
        var free = function () { var f = []; for (var i = 0; i < b.length; i++) if (b[i] === 0) f.push(i); return f; };
        for (var g = 0; g < T.colors && ok; g++) {
          var col = g + 1, f = free(), start = f[Math.floor(r() * f.length)], cells = [start], guard = 0;
          b[start] = col;
          while (cells.length < 4 && guard++ < 50) {
            var from = cells[Math.floor(r() * cells.length)], x = from % w, y = (from / w) | 0, d = DIRS[DK[Math.floor(r() * 4)]], nx = x + d[0], ny = y + d[1];
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; var n = ny * w + nx; if (b[n] !== 0) continue; b[n] = col; cells.push(n);
          }
          if (cells.length < 4) ok = false;
        }
        if (!ok) continue;
        var cols = {}; for (var i = 0; i < b.length; i++) if (b[i] > 0) (cols[b[i]] = cols[b[i]] || []).push(i);
        for (var cc in cols) {
          var cl = cols[cc], hops = 1 + (r() < 0.2 ? 1 : 0);
          for (var hh = 0; hh < hops; hh++) {
            for (var att = 0; att < 12; att++) {
              var ti = cl[Math.floor(r() * cl.length)], tx = ti % w, ty = (ti / w) | 0, dd = DIRS[DK[Math.floor(r() * 4)]], dist = 1 + Math.floor(r() * 2), ex = tx + dd[0] * dist, ey = ty + dd[1] * dist;
              if (ex < 0 || ey < 0 || ex >= w || ey >= h) continue; var e = ey * w + ex; if (b[e] !== 0) continue;
              b[e] = b[ti]; b[ti] = 0; cl[cl.indexOf(ti)] = e; break;
            }
          }
        }
        var fr = free();
        for (var k = 0; k < T.blocks && fr.length; k++) { var pi = Math.floor(r() * fr.length); b[fr[pi]] = -1; fr.splice(pi, 1); }
        if (groups(b, w, h).length) continue;
        return { w: w, h: h, b: b };
      }
      return null;
    }
    // breadth-first over all move sequences up to M: shortest length, how many shortest solutions, how spread the pops are,
    // and the chance that random swiping wins
    function analyze(lv, M) {
      var w = lv.w, h = lv.h, layer = [{ s: lv.b, c: 1, pops: 0 }], idx = {}, minD = 0, nMin = 0, pops = 0;
      idx[lv.b.join(",")] = layer[0];
      for (var d = 1; d <= M && !minD; d++) {
        var next = [], nidx = {};
        for (var q = 0; q < layer.length; q++) {
          var st = layer[q];
          for (var k = 0; k < 4; k++) {
            var r = step(st.s, w, h, DK[k]); if (!r.moved.length) continue;
            var pp = st.pops + (r.gs.length ? 1 : 0);
            if (clear(r.b)) { if (!minD || pp > pops) pops = pp; minD = d; nMin += st.c; continue; }
            var key = r.b.join(","), e = nidx[key];
            if (e) { e.c += st.c; if (pp > e.pops) e.pops = pp; } else { e = nidx[key] = { s: r.b, c: st.c, pops: pp }; next.push(e); }
          }
        }
        if (next.length > 6000) return null;
        layer = next;
      }
      if (!minD) return null;
      var memo = {};
      function P(s, dd) {
        if (clear(s)) return 1; if (!dd) return 0; var key = s.join(",") + "|" + dd; if (key in memo) return memo[key];
        var t = 0, n = 0; for (var k = 0; k < 4; k++) { var r = step(s, w, h, DK[k]); if (r.moved.length) { n++; t += P(r.b, dd - 1); } }
        return (memo[key] = n ? t / n : 0);
      }
      var luck = P(lv.b, M), fm = 0, bad = 0;
      for (var k2 = 0; k2 < 4; k2++) { var r2 = step(lv.b, w, h, DK[k2]); if (!r2.moved.length) continue; fm++; if (!clear(r2.b) && !P(r2.b, M - 1)) bad++; }
      return { minD: minD, nMin: nMin, pops: pops, luck: luck, trap: fm ? bad / fm : 1 };
    }
    function goal(L) {   // [shortest solution min, max], max shortest solutions, max luck, min separate pops
      if (L <= 1) return [1, 2, 9, 0.8, 1];
      if (L <= 3) return [2, 2, 4, 0.5, 1];
      if (L <= 8) return [3, 3, 3, 0.2, 2];
      if (L <= 14) return [3, 4, 2, 0.08, 2, 0.5];
      return [4, 5, 2, 0.04, 3, 0.5];
    }
    function makeLevel(L, seed) {
      var r = rng(seed), G = goal(L), best = null, bestScore = -1e9, t0 = Date.now();
      for (var n = 0; n < 400; n++) {
        if (best && Date.now() - t0 > 140) break;
        if (!best && Date.now() - t0 > 220) return L > 1 ? makeLevel(L - 1, seed + 7) : makeLevel(1, seed + 1);
        var lv = rawLevel(L, r); if (!lv) continue;
        var a = analyze(lv, BASE_MOVES - (L > 8 ? 1 : 0)); if (!a) continue;
        var score = 0;
        if (a.minD < G[0]) score -= 40 * (G[0] - a.minD); if (a.minD > G[1]) score -= 40 * (a.minD - G[1]);
        if (a.nMin > G[2]) score -= 6 * Math.min(10, a.nMin - G[2]);
        if (a.luck > G[3]) score -= 100 * (a.luck - G[3]);
        if (a.pops < G[4]) score -= 15 * (G[4] - a.pops);
        if (G[5] !== undefined && a.trap > G[5]) score -= 30 * (a.trap - G[5]);
        if (score > bestScore) { bestScore = score; best = lv; best.sol = a.minD; }
        if (score >= 0) break;
      }
      return best || makeLevel(1, seed + 1);
    }

    // ---- state ----
    var S = { mode: "daily", day: null, endless: { level: 1, cleared: 0, best: 0 }, stats: { days: 0 } };
    function newDay() { return { key: today(), level: 1, carry: 0, score: 0, done: false, cur: null }; }
    function curRun() { return S.mode === "daily" ? S.day : S.endless; }
    function loadLevel() {
      var run = curRun();
      if (run.cur && run.cur.b) return run.cur;
      var L = S.mode === "daily" ? run.level : Math.min(20, 3 + Math.floor((run.level - 1) / 2) + ((run.level - 1) % 3));
      var seed = S.mode === "daily" ? hashStr("klecks-" + run.key + "-" + run.level) : (Math.random() * 4e9) >>> 0;
      var lv = makeLevel(L, seed), moves = Math.min(MAX_MOVES, BASE_MOVES + (S.mode === "daily" ? run.carry : Math.min(MAX_CARRY, run.carry || 0)));
      run.cur = { w: lv.w, h: lv.h, b: lv.b, start: lv.b.slice(), moves: moves, startMoves: moves, ids: null, state: "play", sol: lv.sol };
      return run.cur;
    }

    // ---- markup ----
    var root = document.getElementById("scr-tiles"), $t = function (id) { return document.getElementById(id); };
    var HOME_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5"/><path d="M6.5 10v9.5h11V10"/><path d="M10.5 19.5v-5h3v5"/></svg>';
    var ARR = { up: "M3 0h1v1h1v1h1v1h1v1H5v3H2V4H0V3h1V2h1V1h1z", down: "M2 0h3v3h2v1H6v1H5v1H4v1H3V6H2V5H1V4H0V3h2z", left: "M3 0h1v2h3v3H4v2H3V6H2V5H1V4H0V3h1V2h1V1h1z", right: "M3 0h1v1h1v1h1v1h1v1H6v1H5v1H4v1H3V5H0V2h3z" };
    function arrBtn(d) { return '<button type="button" class="t-arrow" data-d="' + d + '" aria-label="' + { up: "Nach oben", down: "Nach unten", left: "Nach links", right: "Nach rechts" }[d] + '"><svg viewBox="0 0 7 7" shape-rendering="crispEdges"><path fill="currentColor" d="' + ARR[d] + '"/></svg></button>'; }
    root.innerHTML = '<div class="w-top"><button type="button" class="w-iconbtn" id="t-home" aria-label="Zum Spielzimmer">' + HOME_SVG + '</button><h1>Farbklecks</h1><span class="w-score"><b id="t-score">0</b> Pkt</span><button type="button" class="w-iconbtn" id="t-help" aria-label="Spielregeln">?</button></div>' +
      '<div class="w-modes"><div class="w-pill" role="tablist"><button type="button" data-m="daily">Täglich</button><button type="button" data-m="endless">Endlos</button></div><span class="w-sub" id="t-sub"></span></div>' +
      '<div class="t-bar"><div class="t-lvl" id="t-lvl"></div><div class="t-moves" id="t-moves"></div></div>' +
      '<div class="t-boardwrap" id="t-wrap"><div class="t-board" id="t-board"></div><div class="t-over" id="t-over" hidden></div></div>' +
      '<div class="t-pad">' + arrBtn("left") + '<div class="t-pad-mid">' + arrBtn("up") + arrBtn("down") + '</div>' + arrBtn("right") + '</div>' +
      '<div class="w-lane t-lane" id="t-lane"><span class="t-ham" id="t-ham"></span></div>' +
      '<div class="w-tools"><button type="button" class="w-btn w-small" id="t-reset">Level neu</button><button type="button" class="w-btn w-small t-undo" id="tl-undo" aria-label="Letzten Zug zurücknehmen" title="Letzten Zug zurücknehmen"><svg viewBox="0 0 9 8" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M3 0h1v2h3v1h1v1h1v3H8v1H7V5H6V4H4v2H3V5H2V4H1V3H0V2h1V1h2z"/></svg></button><span class="w-hinttxt" id="t-msg"></span><button type="button" class="w-btn w-small" id="t-hint">Tipp</button></div>' +
      '<div class="w-rules" id="t-rules" hidden><div class="w-rules-card" role="dialog"><div class="w-rules-top"><h2>So geht Farbklecks</h2><button type="button" class="w-iconbtn" id="t-rules-x" aria-label="Schließen">×</button></div><ul>' +
      '<li>Wische über das Brett (oder nimm die Pfeile). Dann rutschen <b>alle</b> Kacheln gleichzeitig ein Feld in diese Richtung, wenn davor Platz ist.</li>' +
      '<li>Berühren sich <b>vier oder mehr</b> Kacheln derselben Farbe, machen sie „plopp“ und verschwinden. Die Form ist egal.</li>' +
      '<li>Gestreifte Steine bewegen sich nie.</li>' +
      '<li>Jedes Level hat <b>6 Züge</b>. Bis zu 3 übrige Züge nimmst du ins nächste Level mit, höchstens 9.</li>' +
      '<li>Ein Level ist geschafft, wenn keine bunte Kachel mehr übrig ist. Jedes Level ist lösbar.</li>' +
      '<li><b>Täglich</b>: 20 Level, jeden Tag neu. <b>Endlos</b>: so viele Level, wie du magst. Nach jedem Level kann es eine Belohnung für deinen Hamster geben, je schwerer das Level, desto eher.</li>' +
      '<li>Jede Farbe hat ein kleines Muster, so kann man sie auch ohne Farben unterscheiden.</li></ul></div></div>';
    // detailed 16 x 16 pixel tiles: dark rim, bevel light top-left, shade bottom-right, glossy spot and a little symbol
    function hx(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
    function mix(a, b, t) { var A1 = hx(a), B1 = hx(b); return "#" + A1.map(function (v, i) { return ("0" + Math.round(v + (B1[i] - v) * t).toString(16)).slice(-2); }).join(""); }
    var SYM = {   // 6 x 6 symbols, '#' = light pixel, '+' = soft pixel
      dot: ["..##..", ".####.", "######", "######", ".####.", "..##.."],
      bar: ["......", "######", "#++++#", "#++++#", "######", "......"],
      plus: ["..##..", "..##..", "######", "######", "..##..", "..##.."],
      diag: ["....##", "...##+", "..##+.", ".##+..", "##+...", "#+...."],
      ring: [".####.", "##++##", "#+..+#", "#+..+#", "##++##", ".####."],
      corner: ["######", "##++..", "#+....", "#+....", "#.....", "#....."]
    };
    var tileCache = {};
    function tileSVG(ci) {
      if (tileCache[ci]) return tileCache[ci];
      var o = "", P = function (x, y, w, h, c) { o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>'; };
      if (ci < 0) {   // a mossy cobble stone with stripes that never moves
        P(1, 1, 14, 14, "#8e8070"); P(0, 2, 1, 12, "#5a4c40"); P(15, 2, 1, 12, "#5a4c40"); P(2, 0, 12, 1, "#5a4c40"); P(2, 15, 12, 1, "#5a4c40"); P(1, 1, 1, 1, "#5a4c40"); P(14, 1, 1, 1, "#5a4c40"); P(1, 14, 1, 1, "#5a4c40"); P(14, 14, 1, 1, "#5a4c40");
        for (var k = -14; k < 16; k += 4) for (var t = 0; t < 14; t++) { var x = 1 + t, y = 1 + t + k; if (y >= 1 && y <= 14) P(x, y, 1, 1, "#a69886"); }
        P(1, 13, 14, 2, "#6e6052"); P(2, 2, 3, 1, "#c4b6a2"); P(2, 3, 1, 2, "#c4b6a2"); P(11, 11, 2, 1, "#7a9a4a"); P(12, 10, 1, 1, "#9aba5a");
        return (tileCache[ci] = '<svg viewBox="0 0 16 16" shape-rendering="crispEdges">' + o + '</svg>');
      }
      var C = COLORS[ci], base = C.c, lt = mix(C.c, "#ffffff", .38), sh = C.d, ol = mix(C.d, "#000000", .35), sy = mix(C.c, "#ffffff", .62), sy2 = mix(C.c, "#ffffff", .3);
      P(2, 0, 12, 1, ol); P(2, 15, 12, 1, ol); P(0, 2, 1, 12, ol); P(15, 2, 1, 12, ol); P(1, 1, 1, 1, ol); P(14, 1, 1, 1, ol); P(1, 14, 1, 1, ol); P(14, 14, 1, 1, ol);
      P(1, 2, 14, 12, base); P(2, 1, 12, 14, base);
      P(2, 1, 11, 1, lt); P(1, 2, 1, 10, lt); P(2, 2, 2, 1, "#ffffff"); P(2, 3, 1, 1, "#ffffff");                 // bevel light and gloss
      P(2, 14, 12, 1, sh); P(14, 3, 1, 11, sh); P(3, 13, 11, 1, mix(C.c, C.d, .5)); P(13, 4, 1, 9, mix(C.c, C.d, .5));   // shade
      var g = SYM[C.p] || SYM.dot;
      for (var yy = 0; yy < 6; yy++) for (var xx = 0; xx < 6; xx++) { var ch = g[yy][xx]; if (ch === "#") P(5 + xx, 5 + yy, 1, 1, sy); else if (ch === "+") P(5 + xx, 5 + yy, 1, 1, sy2); }
      return (tileCache[ci] = '<svg viewBox="0 0 16 16" shape-rendering="crispEdges">' + o + '</svg>');
    }
    // tiles are separate elements so they can slide; ids follow each tile across moves
    var tileEls = {}, nextId = 1;
    function buildBoard() {
      var c = loadLevel(), el = $t("t-board"); el.innerHTML = ""; tileEls = {};
      el.style.aspectRatio = c.w + " / " + c.h;
      var bg = ""; for (var i = 0; i < c.w * c.h; i++) bg += '<i style="left:' + (100 * (i % c.w) / c.w) + '%;top:' + (100 * ((i / c.w) | 0) / c.h) + '%;width:' + (100 / c.w) + '%;height:' + (100 / c.h) + '%"></i>';
      el.innerHTML = '<div class="t-cells">' + bg + '</div>';
      c.ids = c.b.map(function (v) { return v !== 0 ? nextId++ : 0; });
      c.b.forEach(function (v, i) { if (v !== 0) addTile(c.ids[i], v, i, c); });
    }
    function addTile(id, v, i, c) {
      var t = document.createElement("div"); t.className = "t-tile" + (v < 0 ? " stone" : ""); t.innerHTML = tileSVG(v);
      t.style.width = (100 / c.w) + "%"; t.style.height = (100 / c.h) + "%"; place(t, i, c);
      $t("t-board").appendChild(t); tileEls[id] = t;
    }
    function place(t, i, c) { t.style.left = (100 * (i % c.w) / c.w) + "%"; t.style.top = (100 * ((i / c.w) | 0) / c.h) + "%"; }
    function render() {
      var run = curRun(), c = loadLevel();
      var ub = $t("tl-undo"); if (ub) ub.disabled = !(c.hist && c.hist.length) || c.state === "won" || (S.mode === "daily" && run.done); if (ub) ub.classList.toggle("warn", !!c.stuck && c.state === "play");
      root.querySelectorAll(".w-pill button").forEach(function (b) { b.classList.toggle("on", b.dataset.m === S.mode); });
      $t("t-score").textContent = S.mode === "daily" ? run.score : run.cleared;
      $t("t-score").nextSibling.textContent = S.mode === "daily" ? " Pkt" : " Level";
      $t("t-sub").textContent = S.mode === "daily" ? (run.done ? "Heute alle 20 geschafft!" : "Tagesrätsel · " + new Date().getDate() + "." + (new Date().getMonth() + 1) + ".") : (run.best ? "Rekord: " + run.best + " Level am Stück" : "So viele Level, wie du magst");
      $t("t-lvl").innerHTML = S.mode === "daily" ? "<span>Level <b>" + run.level + "</b> von " + DAYLEVELS + '</span><span class="t-dots">' + Array.apply(null, Array(DAYLEVELS)).map(function (_, k) { return '<i class="' + (k < run.level - 1 || run.done ? "on" : k === run.level - 1 ? "cur" : "") + '"></i>'; }).join("") + "</span>" : "<span>Level <b>" + run.level + "</b></span>";
      var mv = ""; for (var k = 0; k < MAX_MOVES; k++) mv += '<i class="' + (k < c.moves ? "on" : k < c.startMoves ? "used" : "") + '"></i>';
      $t("t-moves").innerHTML = '<span>Züge <b>' + c.moves + '</b></span><span class="t-mv">' + mv + '</span>';
      $t("t-moves").classList.toggle("low", c.moves <= 1);
      renderOver();
    }
    var msgT = null;
    function msg(t) { $t("t-msg").textContent = t; clearTimeout(msgT); msgT = setTimeout(function () { $t("t-msg").textContent = ""; }, 2600); }

    // ---- a move ----
    var anim = false;
    function move(dir) {
      var run = curRun(), c = loadLevel(); if (anim || c.state !== "play" || (S.mode === "daily" && run.done)) return;
      var r = slide(c.b, c.w, c.h, dir);
      if (!r.moved.length) { var w = $t("t-wrap"); w.classList.remove("bump-" + dir); void w.offsetWidth; w.classList.add("bump-" + dir); beep([[180, .04]]); return; }
      c.hist = c.hist || []; c.hist.push({ b: c.b.slice(), ids: c.ids.slice(), moves: c.moves, score: run.score }); if (c.hist.length > 30) c.hist.shift();
      anim = true; c.moves--;
      var ids = c.ids.slice();
      r.moved.forEach(function (m) { ids[m[1]] = c.ids[m[0]]; ids[m[0]] = 0; });
      r.moved.forEach(function (m) { var t = tileEls[ids[m[1]]]; if (t) { place(t, m[1], c); t.classList.remove("sq-h", "sq-v"); void t.offsetWidth; t.classList.add(dir === "left" || dir === "right" ? "sq-h" : "sq-v"); } });
      c.b = r.b; c.ids = ids; beep([[420, .03]]);
      render();
      setTimeout(function () {
        var gs = groups(c.b, c.w, c.h);
        if (gs.length) {
          var n = 0;
          gs.forEach(function (g, gi) {
            var col = COLORS[c.b[g[0]]], sx = 0, sy = 0;
            g.forEach(function (k, ki) {
              sx += k % c.w; sy += (k / c.w) | 0;
              var t = tileEls[c.ids[k]];
              if (t) { (function (tt, delay) { setTimeout(function () { tt.classList.add("pop"); burst(tt, col); }, delay); setTimeout(function () { tt.remove(); }, delay + 300); })(t, gi * 90 + ki * 35); }
              c.b[k] = 0; c.ids[k] = 0; n++;
            });
            floatTxt("+100", (sx / g.length + .5) / c.w * 100, (sy / g.length + .5) / c.h * 100, gi * 90);
          });
          if (S.mode === "daily") run.score += gs.length * 100;
          beep([[660, .05], [880, .06], [1100, .08]]); hamCheer(gs.length > 1 || n > 4);
          msg(gs.length > 1 ? "Doppel-Plopp!" : "Plopp!");
        }
        setTimeout(function () {
          anim = false;
          if (clear(c.b)) return levelDone();
          if (c.moves <= 0) { c.state = "lost"; save(); render(); hamSet("sad"); beep([[300, .1], [200, .16]]); return; }
          if (!solve(c.b, c.w, c.h, c.moves)) { c.stuck = true; msg("So geht es nicht mehr auf. Nimm den Zug mit dem Pfeil zurück."); hamSet("sad"); } else { c.stuck = false; if (!gs.length) hamSet("think", 700); }
          save(); render();
        }, gs.length ? 280 : 0);
      }, 130);
    }
    function undo() {
      var run = curRun(), c = loadLevel(); if (anim || !c.hist || !c.hist.length || c.state === "won") return;
      var h = c.hist.pop(); c.b = h.b; c.ids = h.ids; c.moves = h.moves; if (S.mode === "daily") run.score = h.score;
      c.state = "play"; c.stuck = false; buildBoard(); render(); save(); hamSet("idle"); beep([[360, .03], [300, .04]]); msg("Zug zurückgenommen.");
    }
    function levelDone() {
      var run = curRun(), c = loadLevel(); c.state = "won";
      var wrap = $t("t-wrap"); wrap.classList.remove("cleared"); void wrap.offsetWidth; wrap.classList.add("cleared"); confetti();
      var left = c.moves, carry = Math.min(MAX_CARRY, left), rw = null;
      if (S.mode === "daily") {
        run.score += 200 + left * 50; run.carry = carry;
        rw = giveRewards("daily", run.level);
        if (run.level >= DAYLEVELS) { run.done = true; S.stats.days++; }
      } else {
        run.cleared++; run.best = Math.max(run.best, run.cleared); run.carry = carry;
        rw = giveRewards("endless", run.level);
      }
      c.reward = rw; hamCheer(true); beep([[784, .08], [988, .08], [1319, .16]]);
      if ((S.mode === "daily" && (run.level % 5 === 0)) || (S.mode === "endless" && run.cleared % 5 === 0)) setTimeout(function () { visit("done"); }, 600);
      save(); render();
    }
    function nextLevel() {
      var run = curRun();
      if (S.mode === "daily") { if (run.done) return; run.level++; } else run.level++;
      run.cur = null; buildBoard(); render(); save();
    }
    function resetLevel() {
      var run = curRun(), c = run.cur; if (!c || anim) return;
      if (S.mode === "daily" && run.done) return;
      c.b = c.start.slice(); c.moves = BASE_MOVES; c.startMoves = BASE_MOVES; c.state = "play"; c.hist = []; run.carry = 0;
      buildBoard(); render(); save(); msg("Level neu, mit 6 Zügen.");
    }
    // little pixel effects
    function burst(t, col) {
      var b = $t("t-board"), cx = parseFloat(t.style.left) + parseFloat(t.style.width) / 2, cy = parseFloat(t.style.top) + parseFloat(t.style.height) / 2;
      for (var i = 0; i < 7; i++) {
        var p = document.createElement("i"), a = (i / 7) * Math.PI * 2 + Math.random() * .5, d = 18 + Math.random() * 22;
        p.className = "t-px"; p.style.left = cx + "%"; p.style.top = cy + "%"; p.style.background = i % 3 ? col.c : "#ffffff";
        p.style.setProperty("--dx", (Math.cos(a) * d).toFixed(1) + "px"); p.style.setProperty("--dy", (Math.sin(a) * d - 8).toFixed(1) + "px");
        b.appendChild(p); setTimeout(function (pp) { return function () { pp.remove(); }; }(p), 600);
      }
    }
    function floatTxt(txt, x, y, delay) {
      setTimeout(function () { var f = document.createElement("span"); f.className = "t-float pixtext"; f.textContent = txt; f.style.left = x + "%"; f.style.top = y + "%"; $t("t-board").appendChild(f); setTimeout(function () { f.remove(); }, 900); }, delay || 0);
    }
    function confetti() {
      var b = $t("t-board"), cols = ["#e8554a", "#4a8ad8", "#f2c230", "#5aaa4a", "#a868d0", "#f08a38", "#ffffff"];
      for (var i = 0; i < 26; i++) {
        var p = document.createElement("i"); p.className = "t-conf"; p.style.left = (Math.random() * 100) + "%"; p.style.background = cols[i % cols.length];
        p.style.animationDelay = (Math.random() * .4).toFixed(2) + "s"; p.style.setProperty("--dx", ((Math.random() - .5) * 40).toFixed(0) + "px");
        b.appendChild(p); setTimeout(function (pp) { return function () { pp.remove(); }; }(p), 1700);
      }
    }
    function hint() {
      var c = loadLevel(); if (anim || c.state !== "play") return;
      var best = null;
      (function dfs(b, d, acc) {
        if (best && acc.length >= best.length) return;
        if (clear(b)) { best = acc.slice(); return; } if (!d) return;
        for (var k = 0; k < 4; k++) { var r = step(b, c.w, c.h, DK[k]); if (r.moved.length) { acc.push(DK[k]); dfs(r.b, d - 1, acc); acc.pop(); } }
      })(c.b, Math.min(c.moves, 6), []);
      if (!best) { msg("Von hier geht es nicht mehr auf. Tippe auf „Level neu“."); return; }
      var nm = { up: "nach oben", down: "nach unten", left: "nach links", right: "nach rechts" }[best[0]];
      msg("Tipp: " + nm + " wischen" + (best.length > 1 ? " (noch " + best.length + " Züge)" : "") + ".");
      var a = root.querySelector('.t-arrow[data-d="' + best[0] + '"]'); if (a) { a.classList.remove("hint"); void a.offsetWidth; a.classList.add("hint"); }
    }
    function giveRewards(mode, n) {
      if (typeof s === "undefined" || !s.name) return { none: true };
      var apples = 0, seeds = [], gift = null, crops = Object.keys(CROPS).filter(function (c) { return c !== "chili"; });
      // after every level a chance for a reward, higher on harder levels: 1-5 10 %, 6-11 20 %, from 12 on 30 %
      var chance = n <= 5 ? 0.1 : n <= 11 ? 0.2 : 0.3;
      if (Math.random() < chance) { if (Math.random() < 0.5) apples = 1; else seeds.push(pick(crops)); }
      if (!apples && !seeds.length && !gift) return null;
      var furns = []; seeds = seeds.map(function () { var r_ = seedOrFurn(); if (r_.furn) furns.push(r_.furn); return r_.seed; }).filter(Boolean);
      renderNeeds(); renderCosy(); if (typeof renderStart === "function") renderStart();
      return { apples: apples, seeds: seeds, furns: furns, gift: !!gift, name: s.name };
    }
    function esc(x) { return String(x).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    function renderOver() {
      var run = curRun(), c = run.cur, el = $t("t-over");
      if (!c || c.state === "play") { el.hidden = true; return; }
      var rows = "", rw = c.reward, head, sub = "", btns;
      if (c.state === "won") {
        head = S.mode === "daily" && run.done ? "Alle 20 geschafft!" : "Level " + run.level + " geschafft!";
        sub = c.moves ? (Math.min(MAX_CARRY, c.moves) + (Math.min(MAX_CARRY, c.moves) === 1 ? " Zug geht" : " Züge gehen") + " mit ins nächste Level.") : "";
        btns = S.mode === "daily" && run.done ? '<p class="w-next">Morgen gibt es 20 neue Level.</p><button type="button" class="w-btn w-go" data-m2="endless">Endlos weiterspielen</button>' : '<button type="button" class="w-btn w-go" data-a="next">Weiter</button>';
      } else { head = "Keine Züge mehr"; sub = "Probier das Level noch einmal."; btns = '<button type="button" class="w-btn w-go" data-a="reset">Level neu</button>'; }
      if (rw && rw.none) rows = '<div class="w-rw dim">Gib deinem Hamster einen Namen, dann bekommt er Belohnungen.</div>';
      else if (rw) {
        if (rw.apples) rows += '<div class="w-rw"><span class="ri">' + svgOf(A.apple, SZ.apple[0], SZ.apple[1]) + '</span><span>+' + rw.apples + (rw.apples === 1 ? " Apfel" : " Äpfel") + ' für ' + esc(rw.name) + '</span></div>';
        rw.seeds.forEach(function (k) { rows += '<div class="w-rw"><span class="ri">' + svgOf(A["seed_" + k], 8, 10) + '</span><span>Ein Tütchen ' + esc(CROPS[k].name) + '-Samen</span></div>'; });
        (rw.furns || []).forEach(function (f) { rows += '<div class="w-rw"><span class="ri">' + svgOf(f.it.svg, f.it.w, f.it.h) + '</span><span>Neu für dein Zuhause: ' + esc(f.name) + '</span></div>'; });
        if (rw.gift && home.pending) rows += '<div class="w-rw w-giftrow"><span class="ri">' + svgOf(PROPS.gift.svg, 24, 24) + '</span><span><b>Ein Paket für ' + esc(rw.name) + '!</b></span><button type="button" id="t-gift">Öffnen</button></div>';
      }
      el.innerHTML = '<div class="t-card"><p class="w-rk">' + head + '</p>' + (sub ? '<p class="w-next">' + sub + '</p>' : "") + (rows ? '<div class="w-rws">' + rows + '</div>' : "") + '<div class="t-btns">' + btns + '</div></div>';
      el.hidden = false;
    }
    // ---- input: swipe, arrows, keys ----
    var sw = null;
    $t("t-wrap").addEventListener("pointerdown", function (e) { if (e.target.closest(".t-over")) return; sw = { x: e.clientX, y: e.clientY }; });
    window.addEventListener("pointerup", function (e) {
      if (!sw) return; var dx = e.clientX - sw.x, dy = e.clientY - sw.y; sw = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
      move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
    });
    $t("t-wrap").addEventListener("touchmove", function (e) { if (sw) e.preventDefault(); }, { passive: false });
    document.addEventListener("keydown", function (e) {
      if (root.hidden || (window.Nav && window.Nav.current !== "tiles")) return;
      var k = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" }[e.key]; if (k) { e.preventDefault(); move(k); }
    });
    // ---- the little hamster at the edge cheers along ----
    var hamMood = "idle", hamT = null, blinkT = null;
    function hamArt(m) {
      var face = { idle: ["eyes_open", "mouth_smile", "paws_down", ""], happy: ["eyes_happy", "mouth_grin", "paws_up", "blush"], wow: ["eyes_wide", "mouth_open", "paws_up", "blush"], sad: ["eyes_sad", "mouth_frown", "paws_down", ""], think: ["eyes_look_r", "mouth_flat", "paws_hold", ""], blink: ["eyes_sleep", "mouth_smile", "paws_down", ""] }[m] || [];
      var keys = ["body", "ears_up", "whisk0", "nose", face[0], face[1]].concat(face[3] ? [face[3]] : []).concat([face[2]]);
      return '<svg viewBox="0 0 48 46" aria-hidden="true" shape-rendering="crispEdges">' + keys.map(function (k) { return A[k] || ""; }).join("") + '</svg>';
    }
    function hamSet(m, ms) {
      var h = $t("t-ham"); if (!h) return; h.innerHTML = hamArt(m); hamMood = m;
      clearTimeout(hamT); if (ms) hamT = setTimeout(function () { hamSet(curRun().cur && curRun().cur.stuck ? "sad" : "idle"); }, ms);
    }
    function hamFrame() { hamSet("idle"); clearInterval(blinkT); blinkT = setInterval(function () { if (hamMood === "idle" && !root.hidden) { var h = $t("t-ham"); h.innerHTML = hamArt("blink"); setTimeout(function () { if (hamMood === "idle") h.innerHTML = hamArt("idle"); }, 160); } }, 3400); }
    function hamCheer(big) { var h = $t("t-ham"); if (!h) return; hamSet(big ? "wow" : "happy", big ? 1400 : 900); h.classList.remove("hop", "hop2"); void h.offsetWidth; h.classList.add(big ? "hop2" : "hop"); }
    // ---- visiting animals, like in Squish ----
    var CHEER = ["Gut geschoben.", "Weiter so.", "Du machst das gut.", "Schöner Zug.", "Lass dir Zeit, du hast genug Züge.", "Bleib dran.", "Gut überlegt."];
    var LINES = {}; ["igel", "hare", "squirrel", "robin", "tit", "fox", "mouse", "badger", "owl", "otter"].forEach(function (k) { LINES[k] = CHEER; });
    var vTimer = null, vBusy = false, lastV = null, vTimers = [];
    function active() { return !root.hidden && (!window.Nav || window.Nav.current === "tiles") && document.visibilityState === "visible"; }
    function schedVisits(ms) { clearTimeout(vTimer); vTimer = setTimeout(function () { visit(); schedVisits(300000 + Math.random() * 60000); }, ms); }
    function visit(kind) {
      var ani = window.WordsGame && window.WordsGame._ani; if (!ani || !active() || vBusy) return;
      if (Date.now() - (window.__laneT || 0) < 300000) return; window.__laneT = Date.now();
      var ids = Object.keys(LINES).filter(function (k) { return ani[k] && k !== lastV; }); if (!ids.length) return;
      vBusy = true; var id = pick(ids), an = ani[id]; lastV = id;
      var line = kind === "done" ? pick(["Gut gemacht.", "Schön gespielt.", "Stark gelöst."]) : pick(LINES[id]);
      var lane = $t("t-lane"), v = document.createElement("div"); v.className = "wv in";
      v.innerHTML = '<span class="wv-sprite"><svg viewBox="' + an.vb + '" aria-hidden="true">' + an.svg + '</svg></span><span class="wv-bubble">' + esc(line) + '</span>';
      lane.querySelectorAll(".wv").forEach(function (x) { x.remove(); }); lane.appendChild(v);
      vTimers.push(setTimeout(function () { v.classList.add("talk"); }, 1500));
      vTimers.push(setTimeout(function () { v.classList.remove("talk"); v.classList.add("out"); }, 7000));
      vTimers.push(setTimeout(function () { v.remove(); vBusy = false; }, 8400));
    }
    function clearLane() { vTimers.forEach(clearTimeout); vTimers = []; vBusy = false; var l = $t("t-lane"); if (l) l.querySelectorAll(".wv").forEach(function (x) { x.remove(); }); }
    // ---- saving ----
    function save() { if (window.SudokuSave) window.SudokuSave(); }
    function exportState() { var o = JSON.parse(JSON.stringify(S)); if (o.day && o.day.cur) delete o.day.cur.ids; if (o.endless && o.endless.cur) delete o.endless.cur.ids; return o; }
    function importState(o) {
      if (!o || typeof o !== "object") return;
      if (o.mode === "daily" || o.mode === "endless") S.mode = o.mode;
      if (o.day && o.day.key) S.day = o.day;
      if (o.endless) S.endless = Object.assign({ level: 1, cleared: 0, best: 0 }, o.endless);
      if (o.stats) S.stats = o.stats;
    }
    function sig() { var r = curRun() || {}; return [S.mode, S.day && S.day.key, S.day && S.day.level, S.day && S.day.score, S.endless.level, r.cur && r.cur.moves, r.cur && r.cur.state].join("|"); }
    // ---- screen ----
    function ensureDay() { if (!S.day || S.day.key !== today()) S.day = newDay(); }
    function enter() { ensureDay(); buildBoard(); render(); hamFrame(); clearLane(); schedVisits(45000 + Math.random() * 30000); }
    function leave() { clearTimeout(vTimer); clearLane(); }
    function setMode(m) { if (S.mode === m || anim) return; S.mode = m; ensureDay(); buildBoard(); render(); save(); }
    function goHome() { leave(); if (window.Nav) window.Nav.show("home"); else show("scr-start"); }
    root.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.d) return move(b.dataset.d);
      if (b.dataset.m) return setMode(b.dataset.m);
      if (b.dataset.m2) return setMode(b.dataset.m2);
      if (b.dataset.a === "next") return nextLevel();
      if (b.dataset.a === "reset") return resetLevel();
      switch (b.id) {
        case "t-home": return goHome();
        case "t-help": $t("t-rules").hidden = false; return;
        case "t-rules-x": $t("t-rules").hidden = true; return;
        case "t-reset": return resetLevel();
        case "t-hint": return hint();
        case "tl-undo": return undo();
        case "t-gift": leave(); if (window.HamsterApp && window.HamsterApp.openPackageSoon) window.HamsterApp.openPackageSoon(); else { show("scr-hamster"); refresh(); if (home.pending) later(openPackage, 800); } return;
      }
    });
    $t("t-rules").addEventListener("click", function (e) { if (e.target.id === "t-rules") e.target.hidden = true; });
    var go = document.getElementById("go-tiles");
    if (go) go.addEventListener("click", function () { if (window.Nav) window.Nav.show("tiles"); else { show("scr-tiles"); enter(); } });
    return { enter: enter, leave: leave, exportState: exportState, importState: importState, sig: sig, _dbg: { S: S, solve: solve, step: step, move: move, makeLevel: makeLevel, cur: function () { return loadLevel(); } } };
  })();
  window.TilesGame = TilesGame;
  var _t_show = show;
  show = function (id) {
    var el = document.getElementById("scr-tiles");
    if (el) el.hidden = id !== "scr-tiles";
    if (id === "scr-tiles") { ["scr-start", "scr-name", "scr-hamster", "scr-words"].forEach(function (x) { var e = document.getElementById(x); if (e) e.hidden = true; }); return; }
    _t_show(id);
  };
