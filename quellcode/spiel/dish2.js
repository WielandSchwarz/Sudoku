  // ===================== washing up, new: a big sink full of suds, the right tool for each kind of dirt, little finds under the foam =====================
  // Four pieces per round, one after the other. Each lies big in the soapy water, partly hidden under foam.
  // Wipe the foam away, then clean every spot with the tool it needs: sponge for ketchup, jam and cocoa, brush for burnt and dried-on bits, water for crumbs.
  // Sometimes something is hiding under the foam (a rubber duck, a marble, a toy fish, a button): tap it to keep it. Bubbles drift up and can be popped.
  // When a piece is clean it is rinsed for a moment and hops onto the tea towel at the back. No sorting, no clock.
  var d2V = mPov("mdw-pov d2-pov", "Abwasch beenden"), d2S = null, D2 = { x0: 6, x1: 174, y0: 26, y1: 114, cx: 90, cy: 70 };
  var D2_TOOLS = [{ k: "sponge", x: 14 }, { k: "brush", x: 39 }, { k: "water", x: 64 }];
  var D2_DIRT = {   /* what each kind of dirt looks like and which tool takes it off */
    ketchup: { t: "sponge", c: ["#d8302a", "#a81a1a"], hp: 1 }, jam: { t: "sponge", c: ["#9a4ac8", "#6a2a98"], hp: 1 }, cocoa: { t: "sponge", c: ["#7a4a28", "#5a3418"], hp: 1 },
    burnt: { t: "brush", c: ["#6a3e1e", "#2a1606"], hp: 1.8 }, dried: { t: "brush", c: ["#e8b040", "#b88020"], hp: 1.5 },
    crumbs: { t: "water", c: ["#c8945a", "#a87448"], hp: .7 } };
  var D2_PIECES = ["plate", "plate2", "bowl", "cup", "mug", "glass", "pan", "pot"];
  var D2_FIND = ["duck", "marble", "fish", "button", "boat"];
  function d2Col(k, sh, dx, dy) {   /* the colour of one pixel of a clean piece, light from the top left */
    var lt = (-dx - dy) / 40;
    if (sh === 1) return "#3a2414";
    if (k === "pan") return sh === 6 ? (lt > 0 ? "#8a5a32" : "#6a4226") : sh === 4 ? (lt > .2 ? "#5a5a64" : "#46464e") : (lt > .2 ? "#7a7a86" : "#5a5a64");
    if (k === "glass") return sh === 3 ? (lt > .3 ? "#ffffff" : "#cfe8f4") : (lt > .35 ? "#ffffff" : lt > -.1 ? "#e4f4fc" : "#cfe6f2");
    if (sh === 3 && k === "bowl") return lt > .3 ? "#a8c8f8" : lt > -.3 ? "#6aa0e8" : "#3a7ac8";
    if (sh === 3 && k === "mug") return lt > .3 ? "#a8d890" : lt > -.3 ? "#6fae5a" : "#3e8a3a";
    if (k === "cup" && sh === 3 && Math.hypot(dx, dy) > 15 && Math.hypot(dx, dy) < 16.5) return "#e8650c";
    if (k === "pot" && sh === 2 && Math.abs(Math.hypot(dx, dy) - 19) < 1) return "#6fae5a";
    if (sh === 4) return k === "pot" ? (Math.hypot(dx, dy) > 8 ? "#5a4434" : "#4a3628") : (lt > .1 ? "#f4efe6" : "#e4dcd0");
    if (sh === 5) return k === "plate" ? "#6a9ad8" : k === "plate2" ? "#e8650c" : k === "bowl" ? "#2a5a9a" : k === "mug" ? "#f8f4ec" : "#d8d0c4";
    if (sh === 3) return lt > .35 ? "#ffffff" : lt > -.3 ? "#f4efe6" : "#d8d0c4";
    return lt > .4 ? "#ffffff" : lt > -.25 ? "#f8f4ec" : "#e0d8cc";
  }
  function d2Sprite(k) {   /* each piece drawn once into its own little canvas */
    var R = 37, N = R * 2 + 1, cv = document.createElement("canvas"); cv.width = N; cv.height = N; var g = cv.getContext("2d");
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) { var dx = x - R, dy = y - R, sh = dwShape(k, dx, dy); if (!sh) continue; g.fillStyle = d2Col(k, sh, dx, dy); g.fillRect(x, y, 1, 1); }
    return cv; }
  var d2Spr = {};
  function d2Make(k) {   /* the dirt on one piece: a few spots of different kinds, on the parts that can get dirty */
    var kinds = { plate: ["ketchup", "crumbs", "jam"], plate2: ["dried", "crumbs", "ketchup"], bowl: ["dried", "jam", "crumbs"], cup: ["cocoa", "cocoa"], mug: ["cocoa", "dried"], glass: ["jam", "crumbs"], pan: ["burnt", "burnt", "crumbs"], pot: ["cocoa", "dried"] }[k];
    var inside = function (dx, dy) { var sh = dwShape(k, dx, dy); return k === "pan" || k === "pot" || k === "bowl" || k === "glass" || k === "cup" || k === "mug" ? sh === 4 : sh === 2; };
    var spots = [], tries = 0;
    kinds.forEach(function (ty) { var r = ty === "crumbs" ? 6 : k === "cup" || k === "mug" || k === "glass" ? 4 : 6 + Math.floor(Math.random() * 3);
      while (tries++ < 400) { var x = Math.round(Math.random() * 50 - 25), y = Math.round(Math.random() * 40 - 20);
        if (!inside(x, y) || !inside(x + r * .7, y) || !inside(x - r * .7, y) || !inside(x, y + r * .6) || !inside(x, y - r * .6)) continue;
        if (spots.some(function (s) { return Math.hypot(s.x - x, s.y - y) < s.r + r + 2; })) continue;
        var crumbs = []; if (ty === "crumbs") for (var c = 0; c < 7; c++) crumbs.push([Math.round(Math.random() * 10 - 5), Math.round(Math.random() * 8 - 4)]);
        spots.push({ x: x, y: y, r: r, ty: ty, hp: D2_DIRT[ty].hp, max: D2_DIRT[ty].hp, cr: crumbs }); break; } });
    var foam = []; for (var f = 0; f < 34; f++) { var a = Math.random() * Math.PI * 2, dd = Math.sqrt(Math.random()) * 30; foam.push({ x: Math.round(Math.cos(a) * dd * 1.2), y: Math.round(Math.sin(a) * dd * .9), r: 3 + Math.floor(Math.random() * 3) }); }
    var find = null; if (window.__dishFind || Math.random() < .55) { var fa = Math.random() * Math.PI * 2; find = { k: D2_FIND[Math.floor(Math.random() * D2_FIND.length)], x: (fa < Math.PI ? -1 : 1) * (48 + Math.round(Math.random() * 14)), y: Math.round(Math.random() * 40 - 22), seen: false, got: false };
      for (var f2 = 0; f2 < 7; f2++) foam.push({ x: find.x + Math.round(Math.random() * 10 - 5), y: find.y + Math.round(Math.random() * 8 - 4), r: 4 }); }   /* a little heap of foam over the find */
    return { k: k, spots: spots, foam: foam, find: find, done: false };
  }
  function d2Start() {
    var pool = D2_PIECES.slice().sort(function () { return Math.random() - .5; }).slice(0, 4);
    if (window.__dishPool2) pool = window.__dishPool2.slice();   /* preview test hook */
    d2S = { left: pool, total: pool.length, cur: null, tool: "sponge", towel: [], finds: [], popped: 0, wrong: 0, fx: [], bub: [], rub: null, hint: null, rinse: 0, fly: null, slide: 0, over: false, face: null, faceT: 0, lastFace: "" };
    d2V.card.hidden = true; d2Next();
  }
  function d2Next() { var S = d2S; if (!S.left.length) { d2End(); return; } S.cur = d2Make(S.left.shift()); S.slide = 1; mBan(d2V, "Schrubben!"); }
  function d2Clean(it) { return it.spots.every(function (s) { return s.hp <= 0; }); }
  // ---- the kitchen behind: tiles, the tea towel on its rail, the tap; the counter with a sink nearly as wide as the screen ----
  var D2K = null;
  function d2Kitchen() {
    if (D2K) return D2K; var cv = document.createElement("canvas"); cv.width = 180; cv.height = 135; var c = cv.getContext("2d"), P = function (x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); };
    for (var ty = 0; ty < 22; ty += 8) for (var tx = (ty / 8) % 2 ? -4 : 0; tx < 180; tx += 8) { P(tx, ty, 8, 8, "#d8c8a8"); P(tx + 1, ty + 1, 7, 7, ((tx + ty) / 8) % 2 ? "#f4ead4" : "#efe2c8"); P(tx + 1, ty + 1, 7, 1, "#fbf4e4"); }
    P(0, 20, 180, 2, "#7a5030"); var y = 22, k = 0;
    while (y < 118) { var h = 4 + Math.floor(k / 2); P(0, y, 180, h, k % 2 ? "#d8a870" : "#e0b07a"); P(0, y, 180, 1, k % 2 ? "#e8bc88" : "#f0c894"); P(0, y + h - 1, 180, 1, "#b88450"); y += h; k++; }
    P(0, 118, 180, 17, "#8a5a32"); P(0, 118, 180, 2, "#3a2414"); P(0, 120, 180, 1, "#c8945a");
    for (var dx = 0; dx < 180; dx += 45) { P(dx + 2, 122, 41, 13, "#3a2414"); P(dx + 3, 123, 39, 12, "#a87448"); P(dx + (dx % 90 ? 7 : 36), 127, 3, 3, "#3a2414"); }
    var X0 = D2.x0, X1 = D2.x1, Y0 = D2.y0, Y1 = D2.y1;   /* the steel basin: a broad rim with light on the top and left */
    for (var yy = Y0; yy < Y1; yy++) for (var xx = X0; xx < X1; xx++) { var cx = Math.max(X0 + 6, Math.min(X1 - 7, xx)), cy = Math.max(Y0 + 6, Math.min(Y1 - 7, yy)), d = Math.hypot(xx - cx, yy - cy); if (d > 6.5) continue;
      P(xx, yy, 1, 1, d > 5.6 ? "#3a2414" : d > 3.6 ? (yy < Y0 + 4 || xx < X0 + 4 ? "#e8eef4" : "#b8c0c8") : "#5a646e"); }
    P(48, 7, 64, 2, "#3a2414"); P(49, 7, 62, 1, "#b8c0c8"); P(47, 6, 3, 4, "#3a2414"); P(110, 6, 3, 4, "#3a2414");   /* the towel rail */
    P(52, 8, 56, 11, "#3a2414"); for (var s = 0; s < 54; s++) P(53 + s, 9, 1, 9, Math.floor(s / 6) % 2 ? "#fff8ec" : "#e8465a"); P(53, 17, 54, 1, "#c83a4a");
    D2K = cv; return cv; }
  var D2_CH = ["#3a2414", "#5a646e", "#8a949e", "#c8d0d8", "#f4f8fc"];   /* chrome: outline, darkest .. light */
  function d2Tube(c, pts, r) {   /* a round chrome tube along a path: outline first, then the body lit from the top left */
    pts.forEach(function (q) { for (var yy = -r - 1; yy <= r + 1; yy++) for (var xx = -r - 1; xx <= r + 1; xx++) if (xx * xx + yy * yy <= (r + 1) * (r + 1) + .5) mR(c, q[0] + xx, q[1] + yy, 1, 1, D2_CH[0]); });
    pts.forEach(function (q) { for (var yy = -r; yy <= r; yy++) for (var xx = -r; xx <= r; xx++) { if (xx * xx + yy * yy > r * r + .5) continue; var l = -(xx * q[2] + yy * q[3]) / r; mR(c, q[0] + xx, q[1] + yy, 1, 1, l > .45 ? D2_CH[4] : l > -.2 ? D2_CH[3] : l > -.7 ? D2_CH[2] : D2_CH[1]); } }); }
  function d2Tap(c, on) {   /* a chrome mixer tap at the back right: a round base, a tall gooseneck spout over the basin, a lever with a red dot */
    c.save(); c.translate(0, 4); d2TapIn(c, on); c.restore(); }
  function d2TapIn(c, on) {
    var X = 140, i, pts = [];
    for (i = 0; i <= 8; i++) pts.push([X, 20 - i * 2, -1, 0]);                       /* up out of the base */
    for (i = 0; i <= 24; i++) { var a = i / 24 * Math.PI, x = X - 11 + Math.cos(a) * 11, y = 4 - Math.sin(a) * 4; pts.push([Math.round(x), Math.round(y), -Math.cos(a), -Math.sin(a) * .6 - .4]); }   /* the arch */
    for (i = 1; i <= 6; i++) pts.push([X - 22, 4 + i * 2, -1, 0]);                     /* down towards the water */
    d2Tube(c, pts, 2);
    mR(c, X - 25, 15, 7, 4, D2_CH[0]); mR(c, X - 24, 16, 5, 2, D2_CH[2]); mR(c, X - 24, 16, 2, 2, D2_CH[3]); mR(c, X - 24, 18, 5, 1, D2_CH[1]);   /* the aerator at the tip */
    for (var yy = 12; yy <= 23; yy++) for (var xx = -6; xx <= 6; xx++) { var e = Math.abs(xx) === 6 || yy === 23; mR(c, X + xx, yy, 1, 1, e ? D2_CH[0] : xx < -3 ? D2_CH[4] : xx < 1 ? D2_CH[3] : xx < 4 ? D2_CH[2] : D2_CH[1]); }   /* the base, a short cylinder */
    for (var x2 = -5; x2 <= 5; x2++) mR(c, X + x2, 12, 1, 1, Math.abs(x2) > 3 ? D2_CH[2] : D2_CH[4]);
    mR(c, X - 9, 22, 19, 3, D2_CH[0]); mR(c, X - 8, 22, 17, 1, D2_CH[3]); mR(c, X - 8, 23, 17, 1, D2_CH[2]);   /* its flange on the rim */
    var lv = on ? -3 : 0, lp = []; for (i = 0; i <= 10; i++) lp.push([X + 3 + i, 12 - Math.round(i * (on ? .7 : .35)) + (i ? 0 : 0), 0, -1]);
    d2Tube(c, lp, 1); var tx = X + 13, ty = 12 - Math.round(10 * (on ? .7 : .35));
    for (var y3 = -2; y3 <= 2; y3++) for (var x3 = -2; x3 <= 2; x3++) { var d = x3 * x3 + y3 * y3; if (d > 5) continue; mR(c, tx + x3, ty + y3, 1, 1, d > 2 ? D2_CH[0] : x3 + y3 < 0 ? "#ff8a7a" : "#e8463c"); }   /* the red dot on the lever */
  }
  function d2Find(c, k, x, y, sq) {   /* the little things under the foam */
    x = Math.round(x); y = Math.round(y);
    if (k === "duck") { dwSpr(c, sq ? "duck_sq" : "duck", x - 10, y - 9); return; }
    if (k === "marble") { for (var yy = -4; yy <= 4; yy++) for (var xx = -4; xx <= 4; xx++) { var d = Math.hypot(xx, yy); if (d > 4.4) continue; mR(c, x + xx, y + yy, 1, 1, d > 3.6 ? "#3a2414" : xx + yy < -3 ? "#ffffff" : (xx * 2 + yy) % 5 === 0 ? "#e8465a" : "#6ac8e8"); } return; }
    if (k === "fish") { mR(c, x - 6, y - 3, 10, 7, "#3a2414"); mR(c, x - 5, y - 2, 8, 5, "#f08a24"); mR(c, x - 5, y - 2, 8, 1, "#ffb060"); mR(c, x + 3, y - 4, 4, 9, "#3a2414"); mR(c, x + 4, y - 3, 2, 7, "#f08a24"); mR(c, x - 3, y - 1, 1, 1, "#3a2414"); mR(c, x - 1, y + 1, 3, 1, "#ffe08a"); return; }
    if (k === "button") { for (var y2 = -3; y2 <= 3; y2++) for (var x2 = -3; x2 <= 3; x2++) { var d2 = Math.hypot(x2, y2); if (d2 > 3.5) continue; mR(c, x + x2, y + y2, 1, 1, d2 > 2.7 ? "#3a2414" : (Math.abs(x2) === 1 && Math.abs(y2) === 1) ? "#8a1a3a" : "#e85a8a"); } return; }
    if (k === "boat") { mR(c, x - 7, y, 14, 4, "#3a2414"); mR(c, x - 6, y + 1, 12, 2, "#e8465a"); mR(c, x - 5, y + 3, 10, 1, "#3a2414"); mR(c, x, y - 8, 1, 8, "#3a2414"); mR(c, x + 1, y - 7, 5, 6, "#3a2414"); mR(c, x + 1, y - 6, 4, 4, "#fff8ec"); return; }
  }
  function d2Mini(c, k, x, y) {   /* the clean pieces hanging over the tea towel, small */
    var O = "#3a2414"; x = Math.round(x); y = Math.round(y);
    var disc = function (r, a, b2) { for (var yy = -r; yy <= r; yy++) for (var xx = -r; xx <= r; xx++) { var d = Math.hypot(xx, yy); if (d > r + .3) continue; mR(c, x + xx, y + yy, 1, 1, d > r - .7 ? O : d > r - 1.7 ? a : b2); } };
    if (k === "plate") disc(5, "#6a9ad8", "#f8f4ec"); else if (k === "plate2") disc(5, "#e8650c", "#f8f4ec"); else if (k === "bowl") disc(5, "#6aa0e8", "#f4efe6");
    else if (k === "glass") { mR(c, x - 3, y - 4, 7, 9, O); mR(c, x - 2, y - 3, 5, 7, "#e4f4fc"); mR(c, x - 2, y - 3, 1, 7, "#ffffff"); }
    else if (k === "pan") { disc(5, "#7a7a86", "#5a5a64"); mR(c, x - 1, y + 5, 3, 4, O); mR(c, x, y + 6, 1, 2, "#8a5a32"); }
    else { mR(c, x - 4, y - 3, 8, 8, O); mR(c, x - 3, y - 2, 6, 6, k === "mug" ? "#6fae5a" : "#f8f4ec"); mR(c, x + 1, y - 2, 2, 6, k === "mug" ? "#3e8a3a" : "#d8d0c4"); mR(c, x + 4, y - 1, 2, 4, O); if (k === "cup") mR(c, x - 3, y + 1, 6, 1, "#e8650c"); if (k === "pot") mR(c, x - 3, y, 6, 1, "#6fae5a"); }
  }
  var D2_ART = {   /* the tools as little pictures: one pixel is one pixel, outline, three shades lit from the top left */
    sponge: { p: { o: "#3a2414", G: "#a8e878", g: "#6fc04a", d: "#3e8a2a", Y: "#ffe888", y: "#f0c040", b: "#c89020", q: "#d8a830" },
      r: ["..oooooooooooooo..", ".oGGGGGGGGGGGGGGo.", "oGGgGGGGgGGGGGgGgo", "oggggggggggggggggo", "oddddddddddddddddo", "oYYYYYYYYYYYYYYYyo", "oYYqYYYYYYqYYYYYyo", "oYYYYYYqYYYYYYqYyo", "oyYYqYYYYYYYYYYYyo", "oyyyyyyyyyyqyyyybo", "obbbbbbbbbbbbbbbbo", ".oooooooooooooooo."] },
    brush: { p: { o: "#3a2414", W: "#f0c890", w: "#c8945a", b: "#8a5a32", R: "#ff7a6a", r: "#e8463c", D: "#a82a22", F: "#fff0c0", f: "#e0c880" },
      r: ["....oooooooooo....", "...oRRRRRRRRrro...", "...oRrrrrrrrrDo...", "..ooDDDDDDDDDDoo..", ".oWWWWWWWWWWWWWwo.", "oWWwwwwwwwwwwwwwbo", "owwwwwwwwwwwwwwwbo", "obbbbbbbbbbbbbbbbo", "oooooooooooooooooo", ".oFfFfFfFfFfFfFfo.", ".oFfFfFfFfFfFfFfo.", ".ofFfFfFfFfFfFfFo.", "..oooooooooooooo.."] },
    water: { p: { o: "#3a2414", B: "#c8ecff", b: "#6ac0f0", d: "#3a8ad0", W: "#ffffff" },
      r: ["......oo......", ".....oBBo.....", ".....oBbo.....", "....oBBbbo....", "....oBbbbo....", "...oBWbbbbo...", "..oBWWbbbbbo..", "..oBWbbbbbbo..", ".oBWbbbbbbbdo.", ".oBbbbbbbbbdo.", ".oBbbbbbbbbdo.", ".oBbbbbbbbddo.", "..obbbbbbbddo.", "..obbbbbbddo..", "...oddddddo...", "....oooooo...."] } };
  var D2_AC = {};
  function d2Art(k) { if (D2_AC[k]) return D2_AC[k]; var d = D2_ART[k], cv = document.createElement("canvas"); cv.width = d.r[0].length; cv.height = d.r.length; var g = cv.getContext("2d");
    d.r.forEach(function (row, y) { for (var x = 0; x < row.length; x++) { var col = d.p[row[x]]; if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); } } }); return (D2_AC[k] = cv); }
  function d2ToolIcon(c, k, x, y) { var cv = d2Art(k); c.drawImage(cv, Math.round(x - cv.width / 2), Math.round(y - cv.height / 2)); }
  function d2Tile(c, x, y, on) {   /* a little wooden tray for each tool: a top face and a front edge, raised and golden when chosen */
    var y0 = on ? y - 2 : y, top = on ? ["#fff4c0", "#ffe08a", "#f0c050"] : ["#fff8ec", "#f4ead8", "#e0d0b4"];
    if (on) { mR(c, x - 11, y + 18, 23, 2, "rgba(58,36,20,.25)"); }
    mR(c, x - 12, y0, 24, 21, "#3a2414"); mR(c, x - 11, y0 + 1, 22, 15, top[1]); mR(c, x - 11, y0 + 1, 22, 1, top[0]); mR(c, x - 11, y0 + 1, 1, 15, top[0]);
    mR(c, x - 11, y0 + 16, 22, 4, on ? "#d8a040" : "#c8b490"); mR(c, x - 11, y0 + 16, 22, 1, on ? "#b88020" : "#a8946c"); return y0; }
  // ---- drawing ----
  function d2Draw(t) {
    if (!d2S) return; var c = d2V.c, S = d2S, now = performance.now(); c.clearRect(0, 0, 180, 135); c.drawImage(d2Kitchen(), 0, 0);
    // pegs on the towel rail, one for each piece; the clean ones hang below their peg
    for (var pg = 0; pg < S.total; pg++) { var gx2 = 62 + pg * 13; mR(c, gx2 - 1, 5, 3, 6, "#3a2414"); mR(c, gx2, 6, 1, 4, "#e0b07a"); }
    S.towel.forEach(function (k, i) { d2Mini(c, k, 62 + i * 13, 15); });
    d2Tap(c, S.rinse > 0);
    // the water: soapy, light ripples drifting
    var X0 = D2.x0 + 3, X1 = D2.x1 - 3, Y0 = D2.y0 + 3, Y1 = D2.y1 - 3;
    for (var y = Y0; y < Y1; y++) for (var x = X0; x < X1; x += 2) { var cx = Math.max(X0 + 5, Math.min(X1 - 6, x)), cy = Math.max(Y0 + 5, Math.min(Y1 - 6, y)); if (Math.hypot(x - cx, y - cy) > 5) continue;
      var w = Math.sin((x + t / 90) / 5) + Math.sin((y * 1.7 + t / 140) / 4); mR(c, x, y, 2, 1, y < Y0 + 3 ? "#7aa8c4" : w > 1.6 ? "#d4ecf8" : w > .4 ? "#b4dcf0" : "#a4d2ea"); }
    var it = S.cur;
    if (it) {
      var ox = D2.cx, oy = D2.cy;
      if (S.slide > 0) { S.slide = Math.max(0, S.slide - .04); oy += Math.round(S.slide * 8); }
      if (S.fly) { var u = Math.min(1, (now - S.fly.t0) / 650); ox = D2.cx + (S.fly.tx - D2.cx) * u; oy = D2.cy + (S.fly.ty - D2.cy) * u - Math.sin(u * Math.PI) * 26; }
      // the find lies in the water beside the piece
      if (it.find && !it.got && !S.fly) d2Find(c, it.find.k, ox + it.find.x, oy + it.find.y, it.find.sq > 0 && (it.find.sq -= .05) > 0);
      if (!(S.fly && now - S.fly.t0 > 520)) {
        var spr = d2Spr[it.k] || (d2Spr[it.k] = d2Sprite(it.k)); c.drawImage(spr, Math.round(ox - 37), Math.round(oy - 37));
        it.spots.forEach(function (s) { if (s.hp <= 0) return; var D = D2_DIRT[s.ty], f = s.hp / s.max;
          if (s.ty === "crumbs") { s.cr.forEach(function (q, i) { if (i / s.cr.length < f) { mR(c, ox + s.x + q[0], oy + s.y + q[1], 2, 2, D.c[1]); mR(c, ox + s.x + q[0], oy + s.y + q[1], 1, 1, D.c[0]); } }); return; }
          for (var yy = -s.r; yy <= s.r; yy++) for (var xx = -s.r; xx <= s.r; xx++) { var e = (xx * xx) / (s.r * s.r) + (yy * yy) / (s.r * s.r * .7), wob = (((xx + s.x) * 7 + (yy + s.y) * 13) % 5 - 2) * .06; if (e > 1 + wob) continue;
            if (f < .66 && (xx + yy) % 2) continue; if (f < .33 && (xx * 3 + yy) % 4) continue;   /* thins out, dithered, as it is scrubbed */
            mR(c, ox + s.x + xx, oy + s.y + yy, 1, 1, e > .7 + wob ? D.c[1] : D.c[0]); } });
        if (S.rinse > 0) { var sx = 118, sy0 = 23; for (var r = 0; r < 30; r++) { var u3 = r / 30, xx3 = sx + (ox - sx) * u3, yy3 = sy0 + (oy - 6 - sy0) * u3; mR(c, xx3 - 1, yy3, 3, 2, (r + Math.floor(t / 40)) % 4 ? "#a8d8f0" : "#ffffff"); }
          if (Math.random() < .5) S.fx.push({ x: ox, y: oy - 4, vx: (Math.random() - .5) * 50, vy: -20 - Math.random() * 25, life: .5, c: Math.random() < .5 ? "#bfe8ff" : "#ffffff" }); }
      }
      // foam on top: white puffs with a soft blue edge
      if (!S.fly) it.foam.forEach(function (f) { for (var yy = -f.r; yy <= f.r; yy++) for (var xx = -f.r; xx <= f.r; xx++) { var d = Math.hypot(xx, yy * 1.2); if (d > f.r + .3) continue; mR(c, ox + f.x + xx, oy + f.y + yy, 1, 1, d > f.r - .8 ? "#c8dcea" : xx + yy < -1 ? "#ffffff" : "#eef6fa"); } });
      // a hint over a spot when the wrong tool was used: the tool it needs, in a little bubble
      if (S.hint && now < S.hint.t1) { var hx = Math.round(ox + S.hint.x), hy = Math.round(oy + S.hint.y - 24); mR(c, hx - 11, hy - 10, 22, 20, "#3a2414"); mR(c, hx - 10, hy - 9, 20, 18, "#fff8ec"); mR(c, hx - 2, hy + 10, 4, 2, "#3a2414"); d2ToolIcon(c, S.hint.k, hx, hy); }
      if (S.fly && now - S.fly.t0 >= 650) { S.towel.push(it.k); S.fly = null; S.cur = null; S.face = "happy"; S.faceT = now + 800; beep([[1047, .04], [1319, .04], [1568, .08]]); for (var q = 0; q < 10; q++) S.fx.push({ x: 56 + (S.towel.length - 1) * 13 + 4, y: 10, vx: (Math.random() - .5) * 40, vy: -10 - Math.random() * 20, life: .7, c: "#ffd34a" }); setTimeout(d2Next, 250); }
    }
    if (S.rinse > 0) { S.rinse -= .016; if (S.rinse <= 0) { S.rinse = 0; S.fly = { t0: now, tx: 62 + S.towel.length * 13, ty: 10 }; beep([[880, .05], [1175, .05]]); } }
    // bubbles drifting up, to be popped
    if (it && !S.fly && Math.random() < .025 && S.bub.length < 6) S.bub.push({ x: D2.cx + rnd(-70, 70), y: D2.cy + rnd(10, 36), r: 2 + Math.floor(Math.random() * 3), vy: -.22 - Math.random() * .25, ph: Math.random() * 6 });
    S.bub = S.bub.filter(function (b) { b.y += b.vy; b.x += Math.sin(t / 400 + b.ph) * .2; for (var a = 0; a < 16; a++) { var an = a / 16 * Math.PI * 2; mR(c, b.x + Math.cos(an) * b.r, b.y + Math.sin(an) * b.r, 1, 1, a % 4 === 1 ? "#ffffff" : "#8cc4e8"); } mR(c, b.x - b.r / 2, b.y - b.r / 2, 1, 1, "#ffffff"); return b.y > -6; });
    // the tools on the front rim: the chosen one lifted and yellow
    D2_TOOLS.forEach(function (T) { var y0 = d2Tile(c, T.x, 100, S.tool === T.k); d2ToolIcon(c, T.k, T.x, y0 + 8); });
    // the tool under the finger while scrubbing
    if (S.rub && it) { var tk = S.tool, tw = d2Art(tk); c.drawImage(tw, Math.round(S.rub[0] - tw.width / 2), Math.round(S.rub[1] - tw.height / 2));
      if (tk === "water") for (var dr = 0; dr < 4; dr++) mR(c, S.rub[0] - 5 + dr * 3, S.rub[1] + 9 + ((dr + Math.floor(t / 70)) % 3) * 2, 1, 2, "#6ac0f0"); }
    // what was found, top right beside the tap
    if (S.finds.length) { mR(c, 158, 24, 17, 11, "#3a2414"); mR(c, 159, 25, 15, 9, "#fff8ec"); d2Find(c, S.finds[S.finds.length - 1], 163, 29, false); if (typeof pcText === "function") pcText(c, 169, 27, String(S.finds.length), "#3a2414"); }
    S.fx = S.fx.filter(function (f) { f.life -= .016; f.x += f.vx * .016; f.y += f.vy * .016; f.vy += 30 * .016; c.globalAlpha = Math.min(1, f.life * 2); mR(c, f.x, f.y, 1, 1, f.c); c.globalAlpha = 1; return f.life > 0; });
    // our real hamster at the bottom left reacts with his own faces
    var fk = S.face && now < (S.faceT || 0) ? S.face : (S.rub ? "work" : "idle");
    if (fk !== S.lastFace && typeof HV_FACES !== "undefined") { S.lastFace = fk; front(HV_FACES[fk] || HV_FACES.idle); if (fk === "happy") pulse("bighop", 620); else if (fk === "oops") pulse("hop", 380); }
    S.raf = requestAnimationFrame(d2Draw);
  }
  // ---- touching ----
  function d2Rub(a, b) {
    var S = d2S, it = S.cur; if (!it || S.fly || S.rinse) return; var ox = D2.cx, oy = D2.cy, n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]))), moved = 0;
    for (var s = 0; s <= n; s++) { var x = a[0] + (b[0] - a[0]) * s / n - ox, y = a[1] + (b[1] - a[1]) * s / n - oy;
      var nf = it.foam.length; it.foam = it.foam.filter(function (f) { return Math.hypot(f.x - x, f.y - y) > f.r + 5; }); if (it.foam.length < nf) { moved++; if (Math.random() < .5) S.fx.push({ x: x + ox, y: y + oy, vx: (Math.random() - .5) * 30, vy: -14, life: .6, c: "#ffffff" }); }
      it.spots.forEach(function (sp) { if (sp.hp <= 0 || Math.hypot(sp.x - x, sp.y - y) > sp.r + 4) return;
        if (it.foam.some(function (f) { return Math.hypot(f.x - sp.x, f.y - sp.y) < f.r + 1; })) return;   /* still under foam */
        if (D2_DIRT[sp.ty].t !== S.tool) { if (!S.strokeWrong) { S.strokeWrong = true; if (!sp.warned) { sp.warned = true; S.wrong++; } S.hint = { x: sp.x, y: sp.y, k: D2_DIRT[sp.ty].t, t1: performance.now() + 1600 }; S.face = "oops"; S.faceT = performance.now() + 700; beep([[200, .06], [160, .08]]); } return; }
        sp.hp -= .045; if (Math.random() < .3) beep([[1300 + Math.random() * 500, .02]]);
        if (Math.random() < .3) S.fx.push({ x: sp.x + ox, y: sp.y + oy, vx: (Math.random() - .5) * 20, vy: -16, life: .6, c: S.tool === "water" ? "#bfe8ff" : "#ffffff" });
        if (sp.hp <= 0) { beep([[660, .05], [880, .06]]); for (var k = 0; k < 6; k++) S.fx.push({ x: sp.x + ox, y: sp.y + oy, vx: (Math.random() - .5) * 40, vy: -20 - Math.random() * 20, life: .6, c: "#ffd34a" }); } }); }
    if (moved && Math.random() < .3) beep([[900 + Math.random() * 300, .02]]);
    if (it.find && !it.find.seen && !it.foam.some(function (f) { return Math.hypot(f.x - it.find.x, f.y - it.find.y) < f.r + 3; })) { it.find.seen = true; mBan(d2V, "Da ist was!"); beep([[1175, .05], [1568, .06]]); }
    if (d2Clean(it)) { S.rub = null; it.foam = []; S.rinse = .7; mBan(d2V, "Blitzblank!"); }
  }
  d2V.cv.addEventListener("pointerdown", function (e) {
    if (!d2S || d2S.over) return; var hr = ham.getBoundingClientRect(); if (e.clientX >= hr.left && e.clientX <= hr.right && e.clientY >= hr.top && e.clientY <= hr.bottom) return;
    var S = d2S, p = mPt(d2V, e); try { d2V.cv.setPointerCapture(e.pointerId); } catch (er) {}
    for (var i = 0; i < D2_TOOLS.length; i++) { var T = D2_TOOLS[i]; if (Math.abs(p[0] - T.x) <= 12 && p[1] >= 98 && p[1] <= 122) { if (S.tool !== T.k) { S.tool = T.k; beep([[520, .04], [700, .04]]); } return; } }
    for (var b = 0; b < S.bub.length; b++) { var bb = S.bub[b]; if (Math.hypot(bb.x - p[0], bb.y - p[1]) < bb.r + 3) { S.bub.splice(b, 1); S.popped++; beep([[1400 + rnd(0, 400), .03]]); for (var q = 0; q < 6; q++) S.fx.push({ x: bb.x, y: bb.y, vx: (Math.random() - .5) * 40, vy: (Math.random() - .5) * 40, life: .4, c: "#ffffff" }); return; } }
    var it = S.cur;
    if (it && it.find && it.find.seen && !it.got && Math.hypot(p[0] - D2.cx - it.find.x, p[1] - D2.cy - it.find.y) < 9) {   /* a find: tap it and it is ours */
      it.got = true; S.finds.push(it.find.k); S.face = "happy"; S.faceT = performance.now() + 900; beep([[784, .05], [1047, .05], [1319, .08]]);
      mBan(d2V, { duck: "Eine Quietscheente!", marble: "Eine Murmel!", fish: "Ein Spielzeugfisch!", button: "Ein Knopf!", boat: "Ein Papierboot!" }[it.find.k]);
      for (var s2 = 0; s2 < 10; s2++) S.fx.push({ x: D2.cx + it.find.x, y: D2.cy + it.find.y, vx: (Math.random() - .5) * 50, vy: -20 - Math.random() * 30, life: .7, c: "#ffd34a" }); return; }
    if (p[1] > D2.y0 && p[1] < D2.y1 && p[0] > D2.x0 && p[0] < D2.x1) { S.rub = p; S.strokeWrong = false; d2Rub(p, p); }
  });
  d2V.cv.addEventListener("pointermove", function (e) { if (!d2S || !d2S.rub) return; var p = mPt(d2V, e), last = d2S.rub; d2S.rub = p; d2Rub(last, p); });
  function d2Up() { if (d2S) { d2S.rub = null; d2S.strokeWrong = false; } }
  d2V.cv.addEventListener("pointerup", d2Up); d2V.cv.addEventListener("pointercancel", d2Up);
  function d2End() {
    var S = d2S; S.over = true; var st = S.wrong <= 1 ? 3 : S.wrong <= 3 ? 2 : 1, M = mL("dishes"); M.best = Math.max(M.best || 0, st); M.finds = (M.finds || 0) + S.finds.length;
    for (var k = 0; k < 30; k++) S.fx.push({ x: 80, y: 12, vx: (Math.random() - .5) * 90, vy: -10 - Math.random() * 30, life: 1.1, c: ["#ffd34a", "#ffffff", "#8ad86a"][k % 3] });
    setTimeout(function () { if (!d2S) return;
      d2V.card.innerHTML = '<div class="fi-c"><p class="fi-h">Alles blitzblank!</p>' + mStars(st) + (S.finds.length ? '<p class="fi-s">' + S.finds.length + (S.finds.length === 1 ? " Fundstück" : " Fundstücke") + '</p>' : "") + '<div class="fi-row"><button type="button" class="fi-b2" data-a="end">Fertig</button><button type="button" class="fi-b" data-a="again">Nochmal</button></div></div>';
      d2V.card.hidden = false; }, 1100);
  }
  d2V.card.addEventListener("click", function (e) { e.stopPropagation(); var b = e.target.closest("button"); if (!b) return; if (b.dataset.a === "again") d2Start(); else d2Close(); });
  var d2HamP = null, d2Cafe = false;
  function d2Open(fromCafe) {
    d2Cafe = fromCafe === true;
    if (d2Cafe) { if (typeof cfGameOn !== "undefined") cfGameOn = true; }
    else if (busy && cur !== "dish") interrupt();
    d2V.el.hidden = false; d2Start(); cancelAnimationFrame(d2S.raf); d2S.raf = requestAnimationFrame(d2Draw);
    if (!d2Cafe && cur !== "dish") act("dish", async function () { while (d2S) await wait(250); });
    if (!d2HamP) { d2HamP = { par: ham.parentNode, nxt: ham.nextSibling, z: ham.style.zIndex, x: H.x, y: H.y, dir: H.dir }; scene.appendChild(ham); scene.classList.add("pz-on", "hv-on"); moveTo(24, 132, 0); H.dir = 1; } }
  function d2Close() { if (d2S) cancelAnimationFrame(d2S.raf); d2S = null; d2V.el.hidden = true; if (d2Cafe) { d2Cafe = false; if (typeof cfGameOn !== "undefined") cfGameOn = false; }
    if (d2HamP) { var hp = d2HamP; d2HamP = null; hp.par.insertBefore(ham, hp.nxt && hp.nxt.parentNode === hp.par ? hp.nxt : null); ham.style.zIndex = hp.z; H.dir = hp.dir; moveTo(hp.x, hp.y, 0); scene.classList.remove("pz-on", "hv-on"); settle(); } }
  d2V.el.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); d2Close(); });
  dwOpen = d2Open;   /* the café sink and the kitchen now open the new washing-up */
  window.__dish2 = { open: d2Open, st: function () { return d2S && { left: d2S.left.length, cur: d2S.cur && { k: d2S.cur.k, spots: d2S.cur.spots.map(function (s) { return [s.x, s.y, s.ty, s.hp]; }), foam: d2S.cur.foam.length, find: d2S.cur.find }, tool: d2S.tool, towel: d2S.towel.length, finds: d2S.finds.length, wrong: d2S.wrong, over: d2S.over }; }, rub: function (a, b) { d2Rub(a, b); }, tool: function (k) { d2S.tool = k; } };
  if (window.__dish) window.__dish.open = d2Open;
  var _d2_int = interrupt; interrupt = function () { if (!window.__resume && d2S) d2Close(); return _d2_int.apply(this, arguments); };
