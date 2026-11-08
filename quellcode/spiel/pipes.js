  // ===================== pipe puzzle at the workbench (like Pettson's inventions) =====================
  // Drag pieces from the tray onto the grid, tap one to turn it, then "Los!": the water runs until the first leak.
  // All targets full and no leak = solved. Stars: solved, no leaky run before, no more pieces than needed.
  /*PIPELOGIC*/
  var RP_LEVELS = /*RPLEVELS*/;
  var RPG = { x: 18, y: 8, c: 16 }, RP_INK = "#3a2414", RP_CU = ["#e8a070", "#c8794a", "#a85a34", "#7a3e22"], RP_W = ["#cfeefc", "#7cc4ec", "#4a9ad0"];
  var RP_TYPES = ["S1", "S2", "S3", "B", "T"], RP_SLOTW = { S1: 20, S2: 28, S3: 34, B: 20, T: 20 }, RP_LOS = { x: 143, y: 107, w: 34, h: 25 };
  var rpV = mPov("rp-pov", "Werkbank verlassen"), rpS = null, rpCache = {};
  function rpR(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function rpSpr(k, w, h, fn) { if (!rpCache[k]) { var cv = document.createElement("canvas"); cv.width = w; cv.height = h; var c = cv.getContext("2d"); fn(c); rpCache[k] = cv; } return rpCache[k]; }
  function rpH(c, x0, x1, y) { var w = x1 - x0; if (w <= 0) return; rpR(c, x0, y - 3, w, 1, RP_INK); rpR(c, x0, y + 3, w, 1, RP_INK); rpR(c, x0, y - 2, w, 1, RP_CU[0]); rpR(c, x0, y - 1, w, 2, RP_CU[1]); rpR(c, x0, y + 1, w, 1, RP_CU[2]); rpR(c, x0, y + 2, w, 1, RP_CU[3]); }
  function rpVp(c, x, y0, y1) { var h = y1 - y0; if (h <= 0) return; rpR(c, x - 3, y0, 1, h, RP_INK); rpR(c, x + 3, y0, 1, h, RP_INK); rpR(c, x - 2, y0, 1, h, RP_CU[0]); rpR(c, x - 1, y0, 2, h, RP_CU[1]); rpR(c, x + 1, y0, 1, h, RP_CU[2]); rpR(c, x + 2, y0, 1, h, RP_CU[3]); }
  function rpFH(c, x, y) { rpR(c, x - 1, y - 4, 3, 9, RP_INK); rpR(c, x, y - 3, 1, 1, RP_CU[0]); rpR(c, x, y - 2, 1, 4, RP_CU[1]); rpR(c, x, y + 3, 1, 1, RP_CU[3]); }
  function rpFV(c, x, y) { rpR(c, x - 4, y - 1, 9, 3, RP_INK); rpR(c, x - 3, y, 1, 1, RP_CU[0]); rpR(c, x - 2, y, 4, 1, RP_CU[1]); rpR(c, x + 3, y, 1, 1, RP_CU[3]); }
  /* one sprite per piece shape: long straights are one continuous pipe with flanges only at both ends */
  function rpPieceSpr(p) {
    var L = PL.LEN[p.t];
    if (L) {
      var h = p.o === "h", w = h ? L * 16 : 16, hh = h ? 16 : L * 16;
      return rpSpr(p.t + p.o, w, hh, function (c) {
        if (h) { rpH(c, 0, w, 8); rpFH(c, 1, 8); rpFH(c, w - 1, 8); } else { rpVp(c, 8, 0, hh); rpFV(c, 8, 1); rpFV(c, 8, hh - 1); }
      });
    }
    var con = (p.t === "B" ? PL.BEND : PL.TEE)[p.o];
    return rpSpr(p.t + p.o, 16, 16, function (c) { rpJunction(c, 8, 8, con); });
  }
  function rpJunction(c, x, y, con) {
    if (con.indexOf("l") >= 0) rpH(c, x - 8, x - 3, y);
    if (con.indexOf("r") >= 0) rpH(c, x + 4, x + 8, y);
    if (con.indexOf("u") >= 0) rpVp(c, x, y - 8, y - 3);
    if (con.indexOf("d") >= 0) rpVp(c, x, y + 4, y + 8);
    for (var yy = y - 3; yy <= y + 3; yy++) for (var xx = x - 3; xx <= x + 3; xx++) rpR(c, xx, yy, 1, 1, ((xx - yy) % 4 + 4) % 4 ? RP_CU[1] : RP_CU[0]);
    rpR(c, x - 2, y - 2, 1, 1, RP_CU[0]); rpR(c, x + 2, y + 2, 1, 1, RP_CU[3]);
    if (con.indexOf("l") < 0) rpR(c, x - 4, y - 3, 1, 7, RP_INK);
    if (con.indexOf("r") < 0) rpR(c, x + 4, y - 3, 1, 7, RP_INK);
    if (con.indexOf("u") < 0) rpR(c, x - 3, y - 4, 7, 1, RP_INK);
    if (con.indexOf("d") < 0) rpR(c, x - 3, y + 4, 7, 1, RP_INK);
    if (con.indexOf("l") >= 0) rpFH(c, x - 7, y);
    if (con.indexOf("r") >= 0) rpFH(c, x + 7, y);
    if (con.indexOf("u") >= 0) rpFV(c, x, y - 7);
    if (con.indexOf("d") >= 0) rpFV(c, x, y + 7);
  }
  var RP_DIG = ["111101101101111", "010110010010111", "111001111100111", "111001111001111", "101101111001001", "111100111001111", "111100111101111", "111001010010010", "111101111101111", "111101111001111"];
  var RP_LET = { L: "100100100100111", O: "111101101101111", S: "111100111001111", "!": "1110" };
  function rpGlyph(c, pat, x, y, col, w) { w = w || 3; for (var i = 0; i < pat.length; i++) if (pat[i] === "1") rpR(c, x + i % w, y + Math.floor(i / w), 1, 1, col); }
  function rpText(c, s, x, y, col, sh) {   /* tiny 3x5 pixel letters with a 1px dark edge */
    var cx = x;
    for (var i = 0; i < s.length; i++) {
      var ch = s[i], pat = /\d/.test(ch) ? RP_DIG[+ch] : RP_LET[ch], w = ch === "!" ? 1 : 3;
      if (ch === "!") pat = "11101";
      if (pat) { if (sh) for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) rpGlyph(c, pat, cx + dx, y + dy, sh, w); rpGlyph(c, pat, cx, y, col, w); }
      cx += w + 1;
    }
  }
  function rpCC(c, r) { return [RPG.x + c * 16 + 8, RPG.y + r * 16 + 8]; }

  // ---------------------------------------------------------------- the quiet backdrop of one level: the bathroom wall, floor, beams, towel cubbies, boiler, targets
  function rpBg(L) {
    return rpSpr("bg" + RP_LEVELS.indexOf(L), 180, 135, function (c) {
      rpR(c, 0, 0, 180, 52, "#dde9ef");
      for (var x = 0; x < 180; x += 30) rpR(c, x + 14, 3, 1, 46, "#d4e2ea");
      rpR(c, 0, 0, 180, 3, "#8a5a30"); rpR(c, 0, 2, 180, 1, "#6a4020");
      rpR(c, 0, 49, 180, 1, "#6a9ab8"); rpR(c, 0, 50, 180, 2, "#8fbcd4"); rpR(c, 0, 52, 180, 1, "#6a9ab8");
      rpR(c, 0, 53, 180, 47, "#f4f2ec");
      for (var y = 53; y < 100; y += 6) { rpR(c, 0, y + 5, 180, 1, "#d8dde2"); for (x = ((y - 53) / 6) % 2 ? 6 : 0; x < 180; x += 12) rpR(c, x, y, 1, 5, "#d8dde2"); }
      for (y = 100; y < 104; y++) for (x = 0; x < 180; x++) rpR(c, x, y, 1, 1, Math.floor((x + Math.floor(y / 6) * 9) / 26) % 2 ? "#b07a44" : "#c08a50");
      rpR(c, 0, 100, 180, 1, "#7a4a26");
      var bs = PL.blockSet(L), solid = {};
      (L.space || []).forEach(function (q) { solid[q[0] + "," + q[1]] = 1; });
      for (var cc = 0; cc <= 9; cc++) for (var rr = 0; rr <= 5; rr++) rpR(c, RPG.x + cc * 16, RPG.y + rr * 16, 1, 1, RPG.y + rr * 16 < 52 ? "#b8ccd8" : "#c8ccd0");
      function beam(b, fromTop) {
        var x0 = RPG.x + b[0] * 16 + 3, y0 = fromTop ? 0 : RPG.y + b[1] * 16 + 2, y1 = fromTop ? RPG.y + (b[1] + b[2]) * 16 - 2 : 100;
        rpR(c, x0, y0, 10, y1 - y0, RP_INK); rpR(c, x0 + 1, y0 + (fromTop ? 0 : 1), 8, y1 - y0 - 1, "#9a6a3c"); rpR(c, x0 + 1, y0 + (fromTop ? 0 : 1), 2, y1 - y0 - 1, "#b8844c"); rpR(c, x0 + 7, y0 + (fromTop ? 0 : 1), 2, y1 - y0 - 1, "#7a4a26");
        for (var k = y0 + 8; k < y1 - 4; k += 18) rpR(c, x0 + 4, k, 2, 2, "#5a3418");
        for (var i = 0; i < b[2]; i++) solid[(b[0]) + "," + (b[1] + i)] = 1;
      }
      if (L.beam) beam(L.beam, true);
      if (L.post) beam(L.post, false);
      (L.blocks || []).forEach(function (q) {   /* a little wooden cubby with folded towels */
        if (solid[q[0] + "," + q[1]]) return;
        var x0 = RPG.x + q[0] * 16, y0 = RPG.y + q[1] * 16;
        rpR(c, x0, y0, 16, 16, RP_INK); rpR(c, x0 + 1, y0 + 1, 14, 14, "#b8844c"); rpR(c, x0 + 1, y0 + 1, 14, 1, "#d09a5a"); rpR(c, x0 + 2, y0 + 2, 12, 12, "#7a4a26");
        var tw = [["#f4a3b4", "#fbd4dc"], ["#8cc4ec", "#cce6f8"]];
        for (var t = 0; t < 2; t++) { var ty = y0 + 3 + t * 5; rpR(c, x0 + 3, ty, 10, 5, RP_INK); rpR(c, x0 + 4, ty + 1, 8, 3, tw[t][0]); rpR(c, x0 + 4, ty + 1, 8, 1, tw[t][1]); rpR(c, x0 + 7, ty + 1, 1, 3, tw[t][1]); }
        rpR(c, x0 + 2, y0 + 13, 12, 1, "#9a6a3c");
        if (q[1] < 4 && !bs[q[0] + "," + (q[1] + 1)]) { rpR(c, x0 + 1, y0 + 16, 14, 2, RP_INK); rpR(c, x0 + 2, y0 + 16, 12, 1, "#7a4a26"); rpR(c, x0 + 3, y0 + 18, 2, 3, RP_INK); rpR(c, x0 + 11, y0 + 18, 2, 3, RP_INK); }
      });
      var s = L.src, sc = rpCC(s.c, s.r);
      if (s.d === "l") {   /* a copper boiler on the wall, with a gauge */
        var top = Math.max(4, sc[1] - 20), bot = Math.min(90, sc[1] + 16);
        rpR(c, 1, top + 1, 15, bot - top - 2, RP_INK); rpR(c, 2, top, 13, bot - top, RP_INK);
        rpR(c, 2, top + 1, 13, bot - top - 2, RP_CU[1]); rpR(c, 3, top + 1, 2, bot - top - 2, RP_CU[0]); rpR(c, 12, top + 1, 2, bot - top - 2, RP_CU[2]); rpR(c, 14, top + 2, 1, bot - top - 4, RP_CU[3]);
        rpR(c, 2, top + 5, 13, 1, RP_CU[3]); rpR(c, 2, bot - 6, 13, 1, RP_CU[3]);
        var gy = top + 9; rpR(c, 5, gy, 7, 7, RP_INK); rpR(c, 6, gy + 1, 5, 5, "#fff8ec"); rpR(c, 8, gy + 2, 1, 2, "#c8463c"); rpR(c, 9, gy + 2, 1, 1, "#c8463c");
        rpR(c, 7, bot, 3, 100 - bot, RP_INK); rpR(c, 8, bot, 1, 100 - bot, RP_CU[2]);
        rpH(c, 15, 18, sc[1]); rpFH(c, 16, sc[1]); rpR(c, 13, sc[1] - 8, 6, 2, RP_INK); rpR(c, 14, sc[1] - 8, 4, 1, "#c8463c"); rpR(c, 15, sc[1] - 6, 2, 2, RP_INK);
      } else {   /* the water pipe coming out of the ceiling, with a red valve */
        var gx = sc[0];
        rpVp(c, gx, 0, RPG.y); rpFV(c, gx, 3);
        rpR(c, gx + 4, 2, 7, 3, RP_INK); rpR(c, gx + 5, 3, 5, 1, "#c8463c"); rpR(c, gx + 7, 1, 1, 5, RP_INK);
      }
      L.targets.forEach(function (t) {
        var p = rpCC(t.c, t.r);
        if (t.k === "pot") { var x0 = p[0] - 10; rpR(c, x0 + 1, 89, 18, 11, RP_INK); rpR(c, x0 + 2, 90, 16, 10, "#c8643c"); rpR(c, x0 + 2, 90, 3, 10, "#e08454"); rpR(c, x0 + 14, 90, 4, 10, "#a84a2c"); rpR(c, x0, 88, 20, 3, RP_INK); rpR(c, x0 + 1, 89, 18, 1, "#e8946a"); rpR(c, x0 + 3, 89, 14, 1, "#5a3418"); }
        if (t.k === "coffee") {   /* a little espresso machine; the cup stands next to it */
          var cx = p[0]; rpR(c, cx - 8, 88, 16, 12, RP_INK); rpR(c, cx - 7, 89, 14, 10, "#c8463c"); rpR(c, cx - 7, 89, 14, 1, "#e8706a"); rpR(c, cx + 4, 90, 3, 9, "#a03a32"); rpR(c, cx - 7, 96, 14, 3, "#8a8a84"); rpR(c, cx - 7, 96, 14, 1, "#b4b4ac");
          rpR(c, cx - 4, 91, 5, 4, RP_INK); rpR(c, cx - 3, 92, 3, 2, "#fff8ec"); rpR(c, cx - 2, 92, 1, 1, RP_INK);
          rpR(c, cx + 8, 92, 4, 2, RP_INK); rpR(c, cx + 10, 94, 1, 1, RP_INK);
          rpR(c, cx + 9, 95, 6, 5, RP_INK); rpR(c, cx + 10, 96, 4, 3, "#fff8ec"); rpR(c, cx + 15, 96, 2, 3, RP_INK);
        }
        if (t.k === "shower") { var sx = p[0], sy = p[1] + 8; rpR(c, sx - 6, sy, 13, 3, RP_INK); rpR(c, sx - 5, sy + 1, 11, 1, RP_CU[1]); rpR(c, sx - 5, sy, 11, 1, RP_CU[0]); for (var k2 = -4; k2 <= 4; k2 += 2) rpR(c, sx + k2, sy + 3, 1, 1, RP_INK); rpR(c, sx - 9, 98, 19, 2, RP_INK); rpR(c, sx - 8, 98, 17, 1, "#cfe4ee"); }
        if (t.k === "sink") { var y2 = p[1]; rpR(c, 163, y2 + 2, 17, 8, RP_INK); rpR(c, 164, y2 + 3, 16, 6, "#f8f8f4"); rpR(c, 164, y2 + 8, 16, 1, "#d8dde2"); rpR(c, 165, y2 + 3, 14, 2, "#c8d0d4"); rpR(c, 168, y2 + 10, 9, 2, RP_INK); rpR(c, 169, y2 + 10, 7, 1, "#e8e8e4"); rpR(c, 171, y2 + 12, 3, 5, RP_INK); rpR(c, 172, y2 + 12, 1, 5, "#e8e8e4"); }
        if (t.k === "cup") { var y3 = p[1]; rpR(c, 0, y3 + 10, 15, 3, RP_INK); rpR(c, 0, y3 + 10, 14, 1, "#f8f8f4"); rpR(c, 0, y3 + 11, 14, 1, "#d8dde2"); rpR(c, 8, y3 + 13, 3, 3, RP_INK); rpR(c, 3, y3 + 2, 9, 8, RP_INK); rpR(c, 4, y3 + 3, 7, 7, "#8cc4ec"); rpR(c, 4, y3 + 3, 2, 7, "#cce6f8"); rpR(c, 9, y3 + 3, 2, 7, "#5a9ad0"); rpR(c, 1, y3 + 4, 2, 4, RP_INK); rpR(c, 4, y3 + 3, 7, 1, "#3a74a8"); }
      });
    });
  }

  // ---------------------------------------------------------------- live parts: targets filling up, the little mouse, the water
  function rpHit(i) { var S = rpS; return S.f && S.mode !== "build" && S.f.hit[i] != null && S.f.hit[i] <= S.t ? S.t - S.f.hit[i] : -1; }
  function rpTargets(c) {
    var S = rpS, L = S.L, clk = S.clk, win = S.mode === "win", wt = S.wt || 0;
    L.targets.forEach(function (t, i) {
      var p = rpCC(t.c, t.r), h = rpHit(i), on = h >= 0;
      if (t.k === "pot") {
        var x = p[0] + 5, g = win ? 8 : on ? Math.min(8, h * 1.2) : 0, st = Math.round(3 + g);
        rpR(c, x - 1, 88 - st, 2, st, RP_INK); rpR(c, x, 88 - st, 1, st, "#4e8c3c");
        if (st > 5) { rpR(c, x - 4, 88 - st + 4, 4, 2, RP_INK); rpR(c, x - 3, 88 - st + 4, 3, 1, "#6aa84e"); rpR(c, x + 1, 88 - st + 2, 4, 2, RP_INK); rpR(c, x + 1, 88 - st + 2, 3, 1, "#6aa84e"); }
        if (win) { var fy = 88 - st - 2; rpR(c, x - 3, fy - 2, 7, 5, RP_INK); rpR(c, x - 2, fy - 1, 5, 3, "#f08ab0"); rpR(c, x - 1, fy - 3, 3, 7, RP_INK); rpR(c, x - 1, fy - 2, 3, 5, "#f08ab0"); rpR(c, x, fy, 1, 1, "#f8d850");
          if (wt > 1) { var bx = Math.round(x - 14 + Math.sin(wt * 2) * 8), by = Math.round(fy - 10 + Math.cos(wt * 3) * 4), fl = Math.floor(wt * 8) % 2; rpR(c, bx, by, 1, 3, RP_INK); rpR(c, bx - 2, by - fl, 2, 2, "#f6c84a"); rpR(c, bx + 1, by - fl, 2, 2, "#f6c84a"); } }
        if (on && !win) rpStream(c, x - 6, 88, 0, 2);
      }
      if (t.k === "coffee") {
        var cx = p[0];
        if (on || win) { rpR(c, cx + 10, 94, 1, 2, "#6a3a1c"); var lv = win ? 2 : Math.min(2, Math.round(h)); if (lv) rpR(c, cx + 10, 99 - lv, 4, lv, "#6a3a1c"); rpR(c, cx - 3, 92, 1, 1, "#c8463c"); }
        if (on || win) for (var k = 0; k < 3; k++) { var u = (clk * .8 + k / 3) % 1; rpR(c, cx + 11 + Math.round(Math.sin((u + k) * 6) * 1.5), Math.round(94 - u * 12), 1, 2, "#ffffff"); }
        if (on && !win) rpStream(c, cx - 1, 88, 0, 1);
      }
      if (t.k === "shower") {
        var sx = p[0], sy = p[1] + 12;
        if (on || win) { var ph = clk * 30; for (var d = 0; d < 9; d++) { var yy = sy + ((d * 7 + ph) % (98 - sy)); rpR(c, sx - 4 + d, Math.round(yy), 1, 2, d % 2 ? RP_W[1] : RP_W[0]); } }
      }
      if (t.k === "sink") {
        var y = p[1], full = on || win;
        if (full) { rpR(c, 165, y + 3, 14, 2, RP_W[1]); rpR(c, 165, y + 3, 14, 1, RP_W[0]); }
        if (on && !win) { rpR(c, 162, y, 2, 1, RP_W[1]); rpR(c, 164, y + 1, 1, 2, RP_W[1]); }
        if (win) { var dy = y - 2 + (Math.floor(clk * 3) % 2), dx = 170 + Math.round(Math.sin(clk * 1.5) * 3);   /* a rubber duck bobbing */
          rpR(c, dx, dy, 7, 4, RP_INK); rpR(c, dx + 1, dy + 1, 5, 2, "#f6d040"); rpR(c, dx + 4, dy - 3, 4, 4, RP_INK); rpR(c, dx + 5, dy - 2, 2, 2, "#f6d040"); rpR(c, dx + 8, dy - 1, 1, 1, "#e8650c"); rpR(c, dx + 6, dy - 2, 1, 1, RP_INK); }
      }
      if (t.k === "cup") {
        var y2 = p[1];
        if (on || win) { var lv2 = win ? 4 : Math.min(4, Math.round(h * 2)); rpR(c, 4, y2 + 9 - lv2, 7, lv2, RP_W[1]); rpR(c, 4, y2 + 9 - lv2, 7, 1, RP_W[0]); }
        if (on && !win) { rpR(c, 16, y2, 2, 1, RP_W[1]); rpR(c, 15, y2 + 1, 1, 2, RP_W[1]); rpR(c, 13, y2 + 2, 2, 1, RP_W[2]); }
        if (win) { var up = Math.min(5, Math.round(wt * 6)); rpR(c, 6, y2 + 3 - up, 3, up + 4, RP_INK); rpR(c, 7, y2 + 3 - up, 1, up + 4, "#e8706a"); rpR(c, 5, y2 - 3 - up, 5, 4, RP_INK); rpR(c, 6, y2 - 2 - up, 3, 2, "#ffffff");
          for (var b2 = 0; b2 < 3; b2++) { var u2 = (wt * .7 + b2 / 3) % 1; rpR(c, 8 + b2 * 3, Math.round(y2 - 6 - u2 * 10), 2, 2, "#ffffff"); } }
      }
    });
  }
  function rpLine(c, x0, y0, x1, y1, col) { var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (var i = 0; i <= n; i++) rpR(c, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1, col); }
  function rpStream(c, x, y, dx, len) { var ph = Math.floor(rpS.clk * 14); for (var i = 0; i < len; i++) rpR(c, x, y + i, 2, 1, (i + ph) % 3 ? RP_W[1] : RP_W[0]); }
  /* the little bathroom mouse: asleep on the floor, cross when she gets wet, and she joins the fun at the end */
  function rpMouseDraw(c, x, f, pose) {
    function m(xx, yy, w, h, col) { rpR(c, f > 0 ? x + xx : x + 13 - xx - w + 1, yy, w, h, col); }
    var G = "#a8a8b0", GL = "#c4c4cc", P = "#f0a0b0";
    if (pose === "sleep") {
      m(0, 95, 11, 5, RP_INK); m(1, 96, 9, 4, G); m(1, 96, 9, 1, GL); m(8, 94, 5, 5, RP_INK); m(9, 95, 3, 3, G); m(8, 92, 3, 3, RP_INK); m(9, 93, 1, 1, P); m(10, 96, 2, 1, RP_INK); m(12, 97, 1, 1, P);
      m(-1, 98, 1, 1, RP_INK); m(-2, 97, 1, 1, RP_INK); m(-3, 97, 1, 1, RP_INK);
      return;
    }
    var hop = pose === "hop" ? Math.round(Math.abs(Math.sin(rpS.clk * 8)) * 3) : 0, y = -hop;
    m(0, 94 + y, 9, 6, RP_INK); m(1, 95 + y, 7, 4, G); m(1, 95 + y, 7, 1, GL); m(2, 99 + y, 1, 1, RP_INK); m(6, 99 + y, 1, 1, RP_INK);
    m(7, 91 + y, 5, 6, RP_INK); m(8, 92 + y, 3, 4, G); m(7, 89 + y, 3, 3, RP_INK); m(8, 90 + y, 1, 1, P); m(12, 94 + y, 1, 1, P);
    if (pose === "happy" || pose === "hop") { m(9, 93 + y, 1, 1, RP_INK); m(10, 92 + y, 1, 1, RP_INK); } else m(10, 93 + y, 1, 1, RP_INK);
    m(-1, 97 + y, 1, 1, RP_INK); m(-2, 96 + y, 1, 1, RP_INK); m(-3, 96 + y, 1, 1, RP_INK); m(-4, 97 + y, 1, 1, RP_INK);
    if (pose === "wet") { m(1, 93, 1, 1, RP_INK); m(4, 92, 1, 2, RP_INK); m(7, 93, 1, 1, RP_INK); m(11, 85, 1, 3, "#c8463c"); m(11, 89, 1, 1, "#c8463c"); }
  }
  function rpMouse(c) {
    var S = rpS, x0 = S.L.mouse; if (x0 == null) return;
    if (S.catWet) { rpR(c, x0 - 2, 99, 18, 1, RP_W[1]); rpMouseDraw(c, x0, 1, "wet"); return; }
    if (S.mode !== "win") { rpMouseDraw(c, x0, 1, "sleep"); var z = Math.floor(S.clk * 1.2) % 3; for (var k = 0; k <= z; k++) rpR(c, x0 + 10 + k * 3, 89 - k * 3, 2, 1, "#8a8a94"); return; }
    var go = null, wt = S.wt;
    S.L.targets.forEach(function (t) { if (!go && (t.k === "shower" || t.k === "coffee")) go = t; });
    if (!go) { rpMouseDraw(c, x0, 1, wt > .4 ? "hop" : "stand"); return; }
    var p = rpCC(go.c, go.r), tx = go.k === "shower" ? p[0] - 7 : p[0] + 17, f = tx >= x0 ? 1 : -1, u = Math.min(1, Math.max(0, (wt - .3) / 1.2)), x = Math.round(x0 + (tx - x0) * u);
    if (u < 1) { rpMouseDraw(c, x, f, Math.floor(wt * 10) % 2 ? "stand" : "happy"); return; }
    if (go.k === "shower") {   /* a proper shower with soap bubbles */
      rpMouseDraw(c, x, 1, "happy");
      for (var b = 0; b < 4; b++) { var bu = (wt * .9 + b / 4) % 1, bx = x + 3 + b * 3 + Math.round(Math.sin((bu + b) * 7) * 2), by = Math.round(90 - bu * 14); rpR(c, bx, by, 3, 3, RP_INK); rpR(c, bx + 1, by + 1, 1, 1, "#ffffff"); }
    } else {   /* a sip of coffee: the cup up to her nose, and a heart */
      rpMouseDraw(c, x, -1, "happy");
      var hy = Math.round(86 - ((wt * 10) % 10)); rpR(c, x + 2, hy, 2, 1, "#e8506a"); rpR(c, x + 5, hy, 2, 1, "#e8506a"); rpR(c, x + 2, hy + 1, 5, 1, "#e8506a"); rpR(c, x + 3, hy + 2, 3, 1, "#e8506a"); rpR(c, x + 4, hy + 3, 1, 1, "#e8506a");
    }
  }
  function rpWater(c) {
    var S = rpS; if (!S.f || S.mode === "build") return;
    var ph = Math.floor(S.clk * 12), arms = {};
    S.pcs.forEach(function (p) { PL.cellsOf(p).forEach(function (k) { arms[k[0] + "," + k[1]] = k[2]; }); });
    Object.keys(S.f.dist).forEach(function (k) {
      if (S.f.dist[k] > S.t) return;
      var a = arms[k], cr = k.split(","), p = rpCC(+cr[0], +cr[1]), x = p[0], y = p[1];
      for (var j = 0; j < a.length; j++) {
        var d = a[j], dx = PL.DX[d], dy = PL.DY[d];
        for (var i = 0; i < 8; i++) if ((i - ph + 40) % 5 < 3) rpR(c, x + dx * i, y + dy * i, 1, 1, RP_W[1]);
      }
      if (a.length > 2 || a === "rd" || a === "dl" || a === "lu" || a === "ur") rpR(c, x - 1, y - 1, 3, 3, RP_W[1]);
    });
  }
  function rpLeakPt() { var lk = rpS.leak, p = rpCC(lk.c, lk.r); return lk.src ? [p[0] + PL.DX[lk.d] * 8, p[1] + PL.DY[lk.d] * 8] : [p[0] + PL.DX[lk.d] * 8, p[1] + PL.DY[lk.d] * 8]; }
  function rpSpray(c) {
    var S = rpS; if (S.mode !== "leak") return;
    var e = rpLeakPt(), d = S.leak.d, dx = PL.DX[d], dy = PL.DY[d];
    for (var k = 0; k < 16; k++) {
      var u = (S.lt * 1.4 + k / 16) % 1, sp = (k % 4) - 1.5;
      var x = e[0] + dx * u * 12 + sp * u * 3 + (dy ? sp * u * 4 : 0), y = e[1] + dy * u * 10 - (dy < 0 ? 0 : 0) + u * u * (100 - e[1]) * (dy < 0 ? .9 : 1) - (dy < 0 ? u * 14 * (1 - u) : 0);
      if (y < 100) rpR(c, Math.round(x), Math.round(y), 1, k % 3 ? 1 : 2, k % 3 ? RP_W[1] : RP_W[0]);
    }
    var pw = Math.min(14, Math.round(S.lt * 10)); rpR(c, Math.round(e[0] + dx * 6) - pw / 2, 100, pw, 1, RP_W[1]);
  }

  // ---------------------------------------------------------------- tray and the "Los!" button
  function rpSlots() {
    var x = 3, o = []; RP_TYPES.forEach(function (t) { if (rpS.L.tray[t] != null) { o.push({ t: t, x: x, w: RP_SLOTW[t] }); x += RP_SLOTW[t] + 2; } }); return o;
  }
  function rpTray(c) {
    var S = rpS;
    rpR(c, 0, 104, 180, 31, RP_INK); rpR(c, 0, 105, 180, 30, "#b07a46"); rpR(c, 0, 105, 180, 2, "#c8945a");
    rpSlots().forEach(function (sl) {
      var n = S.tray[sl.t], cx = sl.x + sl.w / 2;
      rpR(c, sl.x, 107, sl.w, 26, "#8a5a34"); rpR(c, sl.x + 1, 108, sl.w - 2, 24, "#9a6a3c"); rpR(c, sl.x + 1, 108, sl.w - 2, 1, "#7a4a26");
      c.globalAlpha = n ? 1 : .35;
      var L = PL.LEN[sl.t];
      if (L) { var w = 6 + L * 8, x0 = Math.round(cx - w / 2); rpH(c, x0, x0 + w, 118); rpFH(c, x0 + 1, 118); rpFH(c, x0 + w - 1, 118); }
      else c.drawImage(rpPieceSpr({ t: sl.t, o: 0 }), Math.round(cx - 8), 110);
      c.globalAlpha = 1;
      rpText(c, String(n), sl.x + sl.w - 5, 126, n ? "#fff8ec" : "#c8aa82", RP_INK);
    });
    var b = RP_LOS, on = S.mode === "build";
    rpR(c, b.x, b.y, b.w, b.h, RP_INK);
    rpR(c, b.x + 1, b.y + 1, b.w - 2, b.h - 2, on ? "#5aa84e" : "#8a8a7a"); rpR(c, b.x + 1, b.y + 1, b.w - 2, 2, on ? "#7cc86a" : "#a4a494"); rpR(c, b.x + 1, b.y + b.h - 3, b.w - 2, 2, on ? "#3e8434" : "#6a6a5a");
    rpText(c, "LOS!", b.x + 11, b.y + 10, "#fff8ec", on ? "#2e6a26" : "#5a5a4a");
  }

  // ---------------------------------------------------------------- frame
  function rpDraw(now) {
    var S = rpS; if (!S) return;
    var dt = Math.min(.05, (now - (S.last || now)) / 1000); S.last = now; S.clk += dt;
    rpStep(dt);
    var c = rpV.c; c.clearRect(0, 0, 180, 135);
    c.drawImage(rpBg(S.L), 0, 0);
    rpTargets(c); rpMouse(c);
    S.pcs.forEach(function (p) { if (p.lift) return; c.drawImage(rpPieceSpr(p), RPG.x + p.c * 16, RPG.y + p.r * 16); });
    rpWater(c); rpSpray(c);
    if (S.nope > 0) { S.nope -= dt; var q = S.nopeAt; c.globalAlpha = Math.min(1, S.nope * 3); rpR(c, RPG.x + q[0] * 16, RPG.y + q[1] * 16, 16, 1, "#e8650c"); rpR(c, RPG.x + q[0] * 16, RPG.y + q[1] * 16 + 15, 16, 1, "#e8650c"); rpR(c, RPG.x + q[0] * 16, RPG.y + q[1] * 16, 1, 16, "#e8650c"); rpR(c, RPG.x + q[0] * 16 + 15, RPG.y + q[1] * 16, 1, 16, "#e8650c"); c.globalAlpha = 1; }
    rpTray(c);
    var g = S.drag; if (g && (g.from < 0 || g.moved)) {
      var sp = rpPieceSpr(g.p), sn = rpSnap(g);
      if (sn.ok) { c.globalAlpha = .45; rpR(c, RPG.x + sn.c * 16, RPG.y + sn.r * 16, sp.width, sp.height, "#fff8ec"); c.globalAlpha = 1; c.drawImage(sp, RPG.x + sn.c * 16, RPG.y + sn.r * 16); }
      else { c.globalAlpha = .6; c.drawImage(sp, Math.round(g.x - g.ox), Math.round(g.y - g.oy)); c.globalAlpha = 1; }
    }
    S.raf = requestAnimationFrame(rpDraw);
  }
  var RP_CELL_T = .085;
  function rpStep(dt) {
    var S = rpS;
    if (S.mode === "run") {
      S.t += dt / RP_CELL_T;
      if (S.leak && S.t >= S.leak.t) { S.t = S.leak.t; S.mode = "leak"; S.lt = 0; rpLeakStart(); }
      else if (!S.leak && S.t >= S.endT + 4) {
        if (Object.keys(S.f.hit).length === S.L.targets.length) { S.mode = "win"; S.wt = 0; beep([[523, .12], [659, .12], [784, .12], [1047, .3]]); mBan(rpV, "Geschafft!"); }
        else { S.mode = "build"; S.f = null; S.leaks++; mBan(rpV, "Da kommt noch nicht überall Wasser hin."); }
      }
    } else if (S.mode === "leak") {
      S.lt += dt; if (S.lt > 2) { S.mode = "build"; S.f = null; S.leak = null; S.catWet = false; }
    } else if (S.mode === "win") {
      S.wt += dt; S.t += dt / RP_CELL_T; if (S.wt > 3.6 && rpV.card.hidden) rpWinCard();
    }
  }
  function rpLeakStart() {
    var S = rpS, e = rpLeakPt(), x = S.L.mouse; S.leaks++;
    beep([[220, .08], [180, .12]]);
    if (x != null && e[0] + 8 >= x - 4 && e[0] - 6 <= x + 16) { S.catWet = true; beep([[1320, .04], [1560, .06]]); mBan(rpV, "Piep! Die Maus ist nass geworden."); }
    else mBan(rpV, S.leak.src ? "Das Wasser läuft gleich vorne raus!" : "Leck! Da fehlt noch ein Stück.");
  }
  function rpRun() {
    var S = rpS; if (S.mode !== "build") return;
    S.f = PL.flow(S.L, S.pcs); S.t = 0; mBan(rpV, (S.lv + 1) + ". " + S.L.name); S.leak = S.f.leaks[0] || null; S.mode = "run";
    var e = 0; Object.keys(S.f.dist).forEach(function (k) { e = Math.max(e, S.f.dist[k]); }); Object.keys(S.f.hit).forEach(function (k) { e = Math.max(e, S.f.hit[k]); }); S.endT = e;
    beep([[392, .05], [523, .08]]);
  }

  // ---------------------------------------------------------------- dragging, dropping and turning
  function rpPx(p) { var L = PL.LEN[p.t] || 1; return [p.o === "v" ? 16 : L * 16 - (PL.LEN[p.t] ? 0 : 0), p.o === "v" ? L * 16 : 16]; }
  function rpSnap(g) {
    var gx = g.x - g.ox, gy = g.y - g.oy, c = Math.round((gx - RPG.x) / 16), r = Math.round((gy - RPG.y) / 16);
    var p = Object.assign({}, g.p, { c: c, r: r });
    return { ok: g.y < 104 && PL.fits(rpS.L, rpS.pcs, p, g.from), c: c, r: r, p: p };
  }
  function rpAt(c, r) { for (var i = 0; i < rpS.pcs.length; i++) if (PL.cellsOf(rpS.pcs[i]).some(function (k) { return k[0] === c && k[1] === r; })) return i; return -1; }
  function rpTurn(i, c, r) {
    var S = rpS, p = S.pcs[i];
    if (!PL.LEN[p.t]) { p.o = (p.o + 1) % 4; beep([[440, .03], [560, .04]]); return; }
    var L = PL.LEN[p.t], idx = p.o === "h" ? c - p.c : r - p.r, no = p.o === "h" ? "v" : "h";
    var tries = [idx]; for (var k = 0; k < L; k++) if (k !== idx) tries.push(k);
    for (var j = 0; j < tries.length; j++) {
      var q = { t: p.t, o: no, c: no === "h" ? c - tries[j] : c, r: no === "v" ? r - tries[j] : r };
      if (PL.fits(S.L, S.pcs, q, i)) { p.o = no; p.c = q.c; p.r = q.r; beep([[440, .03], [560, .04]]); return; }
    }
    S.nope = .6; S.nopeAt = [c, r]; beep([[160, .08]]);
  }
  rpV.cv.addEventListener("pointerdown", function (e) {
    var S = rpS; if (!S || S.mode !== "build" || !rpV.card.hidden) return;
    var q = mPt(rpV, e), x = q[0], y = q[1], b = RP_LOS;
    if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) { rpRun(); return; }
    if (y >= 104) {
      var sl = rpSlots().filter(function (s) { return x >= s.x && x < s.x + s.w; })[0];
      if (!sl || !S.tray[sl.t]) return;
      var p = { t: sl.t, o: PL.LEN[sl.t] ? "h" : 0, c: 0, r: 0 }, wh = rpPx(p);
      e.preventDefault(); rpV.cv.setPointerCapture(e.pointerId);
      S.drag = { p: p, from: -1, x: x, y: y, ox: wh[0] / 2, oy: wh[1] / 2 + 10, moved: true }; beep([[520, .03]]);
      return;
    }
    var cc = Math.floor((x - RPG.x) / 16), rr = Math.floor((y - RPG.y) / 16), i = rpAt(cc, rr); if (i < 0) return;
    e.preventDefault(); rpV.cv.setPointerCapture(e.pointerId);
    var pc = S.pcs[i];
    S.drag = { p: Object.assign({}, pc), from: i, x: x, y: y, sx: x, sy: y, ox: x - (RPG.x + pc.c * 16), oy: y - (RPG.y + pc.r * 16), moved: false, cell: [cc, rr] };
  });
  rpV.cv.addEventListener("pointermove", function (e) {
    var S = rpS; if (!S || !S.drag) return; var g = S.drag, q = mPt(rpV, e); g.x = q[0]; g.y = q[1];
    if (g.from >= 0 && !g.moved && Math.abs(g.x - g.sx) + Math.abs(g.y - g.sy) > 4) { g.moved = true; S.pcs[g.from].lift = 1; }
  });
  function rpUp() {
    var S = rpS; if (!S || !S.drag) return; var g = S.drag; S.drag = null;
    if (g.from >= 0) S.pcs[g.from].lift = 0;
    if (g.from >= 0 && !g.moved) { rpTurn(g.from, g.cell[0], g.cell[1]); return; }
    var sn = rpSnap(g);
    if (sn.ok) {
      if (g.from >= 0) { S.pcs[g.from].c = sn.c; S.pcs[g.from].r = sn.r; }
      else { S.pcs.push({ t: g.p.t, o: g.p.o, c: sn.c, r: sn.r }); S.tray[g.p.t]--; }
      beep([[330, .03], [440, .05]]);
    } else if (g.from >= 0) { S.pcs.splice(g.from, 1); S.tray[g.p.t]++; beep([[260, .04]]); }
  }
  rpV.cv.addEventListener("pointerup", rpUp); rpV.cv.addEventListener("pointercancel", rpUp);

  // ---------------------------------------------------------------- levels, stars and cards
  function rpStart(lv) {
    var L = RP_LEVELS[lv];
    rpS = Object.assign(rpS || {}, { lv: lv, L: L, pcs: [], tray: Object.assign({}, L.tray), mode: "build", t: 0, clk: 0, leaks: 0, drag: null, f: null, leak: null, catWet: false, nope: 0 });
    rpV.card.hidden = true; mBan(rpV, (lv + 1) + ". " + L.name);
  }
  function rpWinCard() {
    var S = rpS, M = mL("pipes"), used = S.pcs.length, par = S.L.par, st = 1 + (S.leaks ? 0 : 1) + (used <= par ? 1 : 0);
    M.st = M.st || {}; var first = !M.st[S.lv];
    M.st[S.lv] = Math.max(M.st[S.lv] || 0, st); M.lvl = Math.max(M.lvl || 0, S.lv + 1);
    if (first) s.treats = (s.treats || 0) + 3;
    if (window.SudokuSave) window.SudokuSave();
    var hint = st === 3 ? "" : used > par ? "Es geht auch mit " + par + " Teilen." : "Ohne Leck gibt es einen Stern mehr.";
    var next = S.lv + 1 < RP_LEVELS.length;
    rpV.card.innerHTML = '<div class="fi-c"><p class="fi-h">Alles läuft!</p>' + mStars(st) + '<p class="fi-s">' + (first ? "+3 Leckerli · " : "") + used + " Teile" + (hint ? "<br>" + hint : "") + '</p>' +
      '<div class="fi-row"><button type="button" class="fi-b2" data-a="again">Nochmal</button>' + (next ? '<button type="button" class="fi-b" data-a="next">Weiter</button>' : '<button type="button" class="fi-b" data-a="pick">Rätsel</button>') + '</div></div>';
    rpV.card.hidden = false;
  }
  function rpPick() {
    var M = mL("pipes"), st = M.st || {}, open = Math.min(RP_LEVELS.length - 1, M.lvl || 0);
    rpV.card.innerHTML = '<div class="fi-c"><p class="fi-h">Rohr-Rätsel</p><div class="rp-sel">' + RP_LEVELS.map(function (L, i) {
      var n = st[i] || 0, o = ""; for (var k = 0; k < 3; k++) o += k < n ? "★" : "<i>★</i>";
      return '<button type="button" class="rp-lv' + (i === open ? " on" : "") + '" data-lv="' + i + '"' + (i > open ? " disabled" : "") + '><b>' + (i + 1) + '</b><span class="fi-st">' + o + '</span></button>';
    }).join("") + '</div></div>';
    rpV.card.hidden = false; mBan(rpV, "Rohr-Rätsel");
  }
  rpV.card.addEventListener("click", function (e) {
    e.stopPropagation(); var b = e.target.closest("button"); if (!b || b.disabled) return;
    if (b.dataset.lv != null) return rpStart(+b.dataset.lv);
    if (b.dataset.a === "again") rpStart(rpS.lv); else if (b.dataset.a === "next") rpStart(rpS.lv + 1); else if (b.dataset.a === "pick") rpPick(); else rpClose();
  });
  function rpOpen(lv) {
    rpV.el.hidden = false; var M = mL("pipes");
    rpStart(lv != null ? lv : Math.min(RP_LEVELS.length - 1, M.lvl || 0));
    if (lv == null) rpPick();
    cancelAnimationFrame(rpS.raf); rpS.last = 0; rpS.raf = requestAnimationFrame(rpDraw);
  }
  function rpClose() { if (rpS) cancelAnimationFrame(rpS.raf); rpS = null; rpV.el.hidden = true; front({ eyes: "happy", mouth: "grin", paws: "down" }); }
  rpV.el.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); rpClose(); });

  // ---------------------------------------------------------------- the workbench in the garden, left of the beehive
  var RPB = { x: 30, b: 92, w: 24, h: 17 };
  var rpBtn = lBtn("l-gobj rp-bench", gardenEl, svgOf(/*BENCHART*/, RPB.w, RPB.h), "Werkbank");
  function rpLayout() { pos(rpBtn, RPB.x, RPB.b - RPB.h, RPB.w); rpBtn.style.zIndex = RPB.b; }
  var _rp_layoutGarden = layoutGarden; layoutGarden = function () { _rp_layoutGarden(); rpLayout(); };
  async function rpSeq() {
    await walkTo(RPB.x + RPB.w / 2 - 4, 104);
    front({ eyes: "happy", mouth: "teeth", paws: "hold" }); await wait(350); front({ paws: "down" });
    rpOpen();
  }
  rpBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (decor || s.asleep) return; if (busy && !interruptible()) return; if (busy) interrupt();
    act("rohre", rpSeq);
  });
  window.__pipes = { open: rpOpen, close: rpClose, state: function () { return rpS; }, levels: RP_LEVELS, PL: PL, run: rpRun, place: function (p) { rpS.pcs.push(p); if (rpS.tray[p.t]) rpS.tray[p.t]--; } };
  // ---- and a toolbox in the bathroom, right in front of the towel stool
  var RPT = { x: 144, b: 128, w: 18, h: 12 };
  var rpTool = lBtn("rp-bench rp-tool", bathEl, svgOf(/*TOOLART*/, RPT.w, RPT.h), "Werkzeugkiste");
  pos(rpTool, RPT.x, RPT.b - RPT.h, RPT.w); rpTool.style.zIndex = RPT.b;
  async function rpSeqBath() {
    await walkTo(RPT.x - 6, RPT.b - 2); H.dir = 1;
    front({ eyes: "happy", mouth: "teeth", paws: "hold" }); await wait(350); front({ paws: "down" });
    rpOpen();
  }
  rpTool.addEventListener("click", function (e) {
    e.stopPropagation();
    if (s.asleep) return; if (busy && !interruptible()) return; if (busy) interrupt();
    act("rohre", rpSeqBath);
  });
