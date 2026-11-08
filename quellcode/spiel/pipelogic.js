  /*PL-BEGIN*/
  var PL = (function () {
    var COLS = 9, ROWS = 5, DX = { l: -1, r: 1, u: 0, d: 0 }, DY = { l: 0, r: 0, u: -1, d: 1 }, OPP = { l: "r", r: "l", u: "d", d: "u" };
    var BEND = ["rd", "dl", "lu", "ur"], TEE = ["lrd", "lud", "lru", "rud"];
    var LEN = { S1: 1, S2: 2, S3: 3 };
    function cellsOf(p) {
      if (LEN[p.t]) { var o = []; for (var i = 0; i < LEN[p.t]; i++) o.push(p.o === "h" ? [p.c + i, p.r, "lr"] : [p.c, p.r + i, "ud"]); return o; }
      if (p.t === "X") return [[p.c, p.r, "lr|ud"]];   /* the crossing: two separate channels, the pipes do not connect */
      return [[p.c, p.r, (p.t === "B" ? BEND : TEE)[p.o]]];
    }
    function key(c, r) { return c + "," + r; }
    function blockSet(L) { var b = {}; (L.blocks || []).forEach(function (q) { b[key(q[0], q[1])] = 1; }); return b; }
    function fits(L, pieces, p, skip) {
      var b = blockSet(L), occ = {};
      pieces.forEach(function (q, i) { if (i !== skip) cellsOf(q).forEach(function (k) { occ[key(k[0], k[1])] = 1; }); });
      return cellsOf(p).every(function (k) { return k[0] >= 0 && k[1] >= 0 && k[0] < COLS && k[1] < ROWS && !b[key(k[0], k[1])] && !occ[key(k[0], k[1])]; });
    }
    function tgtAt(L, c, r, d) { for (var i = 0; i < L.targets.length; i++) { var t = L.targets[i]; if (t.c === c && t.r === r && t.d === d) return i; } return -1; }
    function chan(a, d) { if (!a) return -1; var cs = a.split("|"); for (var i = 0; i < cs.length; i++) if (cs[i].indexOf(d) >= 0) return i; return -1; }
    /* water flow from every source (warm boiler, cold tap): distance per channel, which source reached it (warm, cold or mixed),
       the targets reached with their temperature, and every open end (a leak) */
    function flow(L, pieces) {
      var arms = {}, owner = {};
      pieces.forEach(function (p, i) { cellsOf(p).forEach(function (k) { arms[key(k[0], k[1])] = k[2]; owner[key(k[0], k[1])] = i; }); });
      var srcs = [L.src].concat(L.src2 ? [L.src2] : []), dist = {}, node = {}, temp = {}, leaks = [], seenLeak = {}, hit = {}, hitT = {};
      srcs.forEach(function (s, si) {
        var tp = s.temp || (si ? "c" : "w"), nd = {}, q = [], ch0 = chan(arms[key(s.c, s.r)], s.d);
        if (ch0 < 0) { var lk0 = s.c + "," + s.r + "," + s.d; if (!seenLeak[lk0]) { seenLeak[lk0] = 1; leaks.push({ c: s.c, r: s.r, d: s.d, t: 0, src: true }); } return; }
        var n0 = key(s.c, s.r) + "," + ch0; nd[n0] = 0; q.push([s.c, s.r, ch0]);
        while (q.length) {
          var cur = q.shift(), c = cur[0], r = cur[1], ch = cur[2], nk0 = key(c, r) + "," + ch, dd = nd[nk0], a = arms[key(c, r)].split("|")[ch];
          for (var j = 0; j < a.length; j++) {
            var d = a[j]; if (srcs.some(function (z) { return c === z.c && r === z.r && d === z.d; })) continue;   /* that is where a tap feeds in, not an open end */
            var ti = tgtAt(L, c, r, d); if (ti >= 0) { if (hit[ti] == null || hit[ti] > dd + 1) hit[ti] = dd + 1; hitT[ti] = hitT[ti] && hitT[ti] !== tp ? "m" : tp; continue; }
            var nc = c + DX[d], nr = r + DY[d], nch = chan(arms[key(nc, nr)], OPP[d]);
            if (nch < 0) { var lk = c + "," + r + "," + d; if (!seenLeak[lk]) { seenLeak[lk] = 1; leaks.push({ c: c, r: r, d: d, t: dd + 1 }); } continue; }
            var nn = key(nc, nr) + "," + nch; if (nd[nn] == null) { nd[nn] = dd + 1; q.push([nc, nr, nch]); }
          }
        }
        Object.keys(nd).forEach(function (n) {
          node[n] = node[n] == null ? nd[n] : Math.min(node[n], nd[n]); temp[n] = temp[n] && temp[n] !== tp ? "m" : tp;
          var ck = n.split(",").slice(0, 2).join(","); dist[ck] = dist[ck] == null ? nd[n] : Math.min(dist[ck], nd[n]);
        });
      });
      Object.keys(hitT).forEach(function (ti) { if (hitT[ti] !== "m") { /* a target fed by a mixed network is lukewarm */
        var t = L.targets[ti], n = key(t.c, t.r) + "," + chan(arms[key(t.c, t.r)], t.d); if (temp[n] === "m") hitT[ti] = "m"; } });
      var ok = {}; Object.keys(hit).forEach(function (ti) { var need = L.targets[ti].need; ok[ti] = !need || need === hitT[ti]; });
      var wet = {}; Object.keys(dist).forEach(function (k) { wet[owner[k]] = 1; });
      leaks.sort(function (x, y) { return x.t - y.t; });
      return { dist: dist, node: node, temp: temp, leaks: leaks, hit: hit, hitT: hitT, ok: ok, wet: wet };
    }
    function goodCount(L, f) { var n = 0; Object.keys(f.hit).forEach(function (ti) { if (f.ok[ti]) n++; }); return n; }
    function solved(L, pieces) { var f = flow(L, pieces); return !f.leaks.length && goodCount(L, f) === L.targets.length; }
    /* every way a tray piece can cover cell (c,r) with an arm pointing back to side d */
    function options(t, c, r, d) {
      var o = [];
      if (LEN[t]) {
        var h = d === "l" || d === "r";
        for (var i = 0; i < LEN[t]; i++) o.push(h ? { t: t, c: c - i, r: r, o: "h" } : { t: t, c: c, r: r - i, o: "v" });
      } else if (t === "X") o.push({ t: t, c: c, r: r, o: 0 });
      else {
        var R = t === "B" ? BEND : TEE;
        for (var j = 0; j < 4; j++) if (R[j].indexOf(d) >= 0) o.push({ t: t, c: c, r: r, o: j });
      }
      return o;
    }
    /* depth-first solver that grows the network from the source; returns the fewest pieces and one solution */
    function solve(L, limit) {
      var best = null, bestN = limit || 99, b = blockSet(L), nodes = 0;
      var base = (L.fixed || []).map(function (p) { return Object.assign({ fixed: 1 }, p); });
      function occ(pcs) { var o = {}; pcs.forEach(function (p) { cellsOf(p).forEach(function (k) { o[key(k[0], k[1])] = k[2]; }); }); return o; }
      function rec(pcs, tray, used) {
        if (++nodes > (L.nodeLimit || 4e6)) return;
        if (used >= bestN) return;
        var f = flow(L, pcs);
        var need = L.targets.length - goodCount(L, f);
        if (!f.leaks.length) { if (!need) { bestN = used; best = pcs.slice(); } return; }
        if (used + Math.max(1, f.leaks.length) > bestN - (need ? 0 : 0) && used + 1 >= bestN) return;
        var lk = f.leaks[0], tc = lk.src ? lk.c : lk.c + DX[lk.d], tr = lk.src ? lk.r : lk.r + DY[lk.d], back = lk.src ? lk.d : OPP[lk.d];
        var o = occ(pcs); if (Object.keys(f.ok).some(function (ti) { return !f.ok[ti]; })) return;   /* wrong temperature somewhere: dead end */
        if (o[key(tc, tr)] || b[key(tc, tr)] || tc < 0 || tr < 0 || tc >= COLS || tr >= ROWS) return;
        var types = ["S3", "S2", "B", "T", "X", "S1"];
        for (var i = 0; i < types.length; i++) {
          var t = types[i]; if (!tray[t]) continue;
          var opts = options(t, tc, tr, back);
          for (var j = 0; j < opts.length; j++) {
            if (!fits(L, pcs, opts[j], -1)) continue;
            tray[t]--; pcs.push(opts[j]); rec(pcs, tray, used + 1); pcs.pop(); tray[t]++;
          }
        }
      }
      rec(base.slice(), Object.assign({}, L.tray), 0);
      return { n: best ? bestN : -1, sol: best, nodes: nodes };
    }
    return { chan: chan, goodCount: goodCount, COLS: COLS, ROWS: ROWS, DX: DX, DY: DY, OPP: OPP, BEND: BEND, TEE: TEE, LEN: LEN, cellsOf: cellsOf, fits: fits, flow: flow, solved: solved, solve: solve, key: key, blockSet: blockSet };
  })();
  /*PL-END*/
