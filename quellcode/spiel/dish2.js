  // ===================== washing up, new: a big sink full of suds, the right tool for each kind of dirt, little finds under the foam =====================
  // Four pieces per round, one after the other. Each lies big in the soapy water, partly hidden under foam.
  // Wipe the foam away, then clean every spot with the tool it needs: sponge for ketchup, jam and cocoa, brush for burnt and dried-on bits, water for crumbs.
  // Sometimes something is hiding under the foam (a rubber duck, a marble, a toy fish, a button): tap it to keep it. Bubbles drift up and can be popped.
  // When a piece is clean it is rinsed for a moment and hops onto the tea towel at the back. No sorting, no clock.
  var d2V = mPov("mdw-pov d2-pov", "Abwasch beenden"), d2S = null, D2 = { x0: 6, x1: 174, y0: 26, y1: 114, cx: 90, cy: 70 };
  var D2_TOOLS = [{ k: "sponge", x: 30, y: 99 }, { k: "brush", x: 55, y: 99 }];   /* sponge and brush on trays at the left; the Spüli bottle stands on the counter, the tap is turned on by hand */
  var D2_BOT = { x: 16, y: 25 };   /* a column of trays on the left rim */
  var D2_DIRT = {   /* what each kind of dirt looks like and which tool takes it off */
    ketchup: { t: "sponge", c: ["#d8302a", "#a81a1a"], hp: 1.8 }, jam: { t: "sponge", c: ["#9a4ac8", "#6a2a98"], hp: 1.8 }, cocoa: { t: "sponge", c: ["#7a4a28", "#5a3418"], hp: 1.8 },
    sauce: { t: "sponge", c: ["#f08a24", "#c05a10"], hp: 1.95 }, egg: { t: "sponge", c: ["#ffd040", "#e0a010"], hp: 1.65, tough: 1 },
    burnt: { t: "brush", c: ["#6a3e1e", "#2a1606"], hp: 3.3, tough: 1 }, dried: { t: "brush", c: ["#e8b040", "#b88020"], hp: 2.7, tough: 1 }, cheese: { t: "brush", c: ["#ffe070", "#d8a820"], hp: 2.7, tough: 1 },
    crumbs: { t: "sponge", c: ["#c8945a", "#a87448"], hp: 1.2 }, grease: { t: "soap", c: ["#f4e08a", "#d8b850"], hp: 1 } };
  var D2_PIECES = ["plate", "plate2", "bowl", "cup", "mug", "glass", "pan", "pot", "tray", "board"];
  var D2_SC = 1.3;   /* the pieces are drawn bigger: their shapes are worked out again at this size, pixel by pixel, never stretched */
  function d2Sh(k, dx, dy) {   /* the shape at the big size: 0 outside, 1 line, 2 body, 3 rim, 4 inside, 5 band, 6 handle */
    if (k === "tray") { var ax = Math.abs(dx), ay = Math.abs(dy); if (ax > 46 || ay > 30) return 0; var cr = ax > 40 && ay > 24 ? Math.hypot(ax - 40, ay - 24) : 0; if (cr > 6) return 0; if (ax > 42 || ay > 26 || cr > 3.5) return 3; return 4; }
    if (k === "board") { if (dx > 34 && dx <= 46 && Math.abs(dy) <= 6) { return Math.hypot(dx - 41, dy) < 2.5 ? 0 : 6; } var ax2 = Math.abs(dx), ay2 = Math.abs(dy); if (ax2 > 36 || ay2 > 26) return 0; var c2 = ax2 > 30 && ay2 > 20 ? Math.hypot(ax2 - 30, ay2 - 20) : 0; if (c2 > 6) return 0; return 2; }
    return dwShape(k, dx / D2_SC, dy / D2_SC); }
  function d2Inside(k, dx, dy) { var sh = d2Sh(k, dx, dy); return k === "pan" || k === "pot" || k === "bowl" || k === "glass" || k === "cup" || k === "mug" || k === "tray" ? sh === 4 : sh === 2; }
  var D2_FIND = ["duck", "marble", "fish", "button", "boat", "shell", "ring", "star"];
  var D2_FINDART = {"duck":{"w":19,"h":15,"src":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAPCAYAAAAGRPQsAAABIklEQVR4nJXTIU/DQBQH8P81R4JAjswihkGhCFm/QVPFxyAoNGIhSD4BanIhZGofgVUMU9VUVBCCYMmJiqIQD8HuePfaXrp/0uRy7f3uvUtPYY9MJyOSc1lllB0r+TIErfPH/4nPZwBAnG48cBBEzZzo5/3vISIqE6Iyoa/FCdmKo8EiS3x67MZXd43bsFVe17kAgGtx1x4AbPMChx8aAJA81dAS8s6FhyEWknFtBqFdvt+uPSjPa5SFQVkYZJVREYe2q1mwqubgxoMA4PZV43JeKwBQsiIJjs/PWjYH71+0+zW0/HCczrxq7EKLysp4NF/YFYn0QQAQZZVRcbrpxUIQbxFg12k6GdF6ddEJDIE8zILLh6NeIAS1MAu2Vov0XexftAinxQbV0DwAAAAASUVORK5CYII="},"marble":{"w":13,"h":13,"src":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAA80lEQVR4nHWSoW5CMRSGv97cR2jAkxocClE1QYbHkkwtCB5gYiGIhSF4ABSKBEWCZ7kCQciCwoG4WWYvYPYEneho2rL7q56T8/X8PT2CSFpJE+d2+VX4cRoD79uLi5enH3t4VsYHkzLAV2OWBw6SG7CqPVJ/6vJQ/ZeDXubA5AYAVNcLgFLw3ByhlTQpwHFui4+FBYp2lzrA6xSAw/47gBMibQp4+ysuUwrelCINx306rRdr7fDp8kIraRqzvBSK1fn6QICdng/6b1hlkwDY5VfhPkwraehlwa2+pcp+4DYjWA+tpDk3R3eWfOAOch0jxbv3CwlXXVKhSy8jAAAAAElFTkSuQmCC"},"fish":{"w":19,"h":12,"src":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAMCAYAAACA0IaCAAABA0lEQVR4nJWTMWrDMBiFPxkdoIO6d3Ah9AhOKB2DCeQKmXqA0GOEHMBLr6ChZC4hMfQCwRQPGTpqSPaAOrh2ZEVqmweCX3pPn3/ZMkSUpcpmqbIx/9/KUmWtnlmrZ38C3YcK3wDYLia9DcOXt64uayPc/Or5BoC8OCBdw4cAMF6w+tx007zAlrURLqhV0gNNX2Hw1IyIlqMTIRBA4nY0vL/tmUenI4BqZwBoQdXOdGvA+Zjw866q9wuIC/Lr81w2sA+tGTyo6NHczes9PN6Fc0lZGzHfyKDpQ9b7po7lJTSfOy+wy9EpGGohAPpLUtZGzFEX+eA9+03+PWuBsW6vkvsHfAN8q3oLE5keDAAAAABJRU5ErkJggg=="},"button":{"w":14,"h":10,"src":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAKCAYAAACE2W/HAAAAr0lEQVR4nGNkQAJWKiL/GQiAY3feMDIwMDAwIms62rMDp4aPp+4wMDAwMHitymE4ducNIyMpmmDAa1UOAxM2TdkJWSjsB9cewfkPrj1imKZTxsCIyzZ0W2CaGBgYGG7cusDAhK7446k7KDZWTetjeHDtEYomBgYGiI15bG4MHgF+OG2AAZgmBgZoqCJrRleMroGBgYFh0q9dqNGRx+aGoQkdTPq1CxEdyJoJaYQlAADs2VpESltwKQAAAABJRU5ErkJggg=="},"boat":{"w":18,"h":14,"src":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAOCAYAAAAi2ky3AAAAqUlEQVR4nJXTsQ2DQAyF4WdmgA1IQ50KWoqMkJoBMkiKVKmYgpIFoKSPQpM67GCqk8A5bMfd6axPv046wJgyT9naMafMU2ZmvrediSUaMry/7rIoJBEAeHSTih0WxUbDfqBYjQfbQRaiYUkAvIjEAkge4PXR75u6AIWi27N318i5Xs5E4aCVHRU1dYFxXgjYPPY4L1SdMnfFFtlB/2ASAQCKLVrfQSIAsAJHg1mtQCyfjgAAAABJRU5ErkJggg=="},"shell":{"w":16,"h":13,"src":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAANCAYAAACgu+4kAAABM0lEQVR4nHWSsYrCQBCGv4hd2pQH16RcJJ3BJ7CSVBZyXCX3ECISxAfwAa66IoiVpAo+gMROwhYWFh5cuaXWe4XuusQ41czs//87s/t7vIheGOh6b3dSXr331DDEbJg8iY7Wm5dClnyejLU+llpflL6sllofS31ZLW1+noy1O13LJW8XU4KOgLeQ/dcHAPt5CoDMCwCCjmC7mNpJW4acDRP8KL4B/06NE14PJTIv8KOYbJjQCwPtGXLQEfhRbEHdWWpvB2zdnaVWTFWStnuDS3gVBiMGfYCHgB/FiHsu84L9PEUM+vhR3Ej0oxhVSRpXcEXrb2B6ZoVWHeASTX09lJbs5nA3kpni/XMMwO/P9+07nVCVtOcGM1pvHk50zWFWqgsYJ5rYnZTXdgtXSFWSpqjb+B8S6qxX6VUyqwAAAABJRU5ErkJggg=="},"ring":{"w":15,"h":12,"src":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAMCAYAAAC9QufkAAAA+ElEQVR4nI2Rr07DUBTGf4fUzRaeoGSmYrpDI6Z4iDocIdN7ANQy2fAAqKkKgoGwqYorFkLCxPQ2sSZIkoto7tntnwU+dXpyf+c736nQoSQKbbO3XO8FwFprRUQAgi7w0ez0e1qUVZFGdvG1w4EAZ6fAfq8x9fqF4eV5rdVydrp9LbU2Txu2H89cNN6ocxKFdmEemBblcVUPBMizuHYP8UGn4XigtQOLSa69Ubpiud6LtMDB/akk5FnMp9kAcDf77s7sfouvJAqtA9/MAQjq1/6PKrCSZs6zWJujdNWCbq5+tJ6/B1Vmfy03wK3XdPJBdfYH/LW2f49fXaFrtrJfdN0AAAAASUVORK5CYII="},"star":{"w":15,"h":15,"src":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAA6ElEQVR4nJ2TPQqDQBCF33oBU3gED5AuoE3K4AlyAJEQrDxBamsJIh4kZQgoZCsLCwsLD2BhwH5TmJWNq5ufVy0z8808hllAIcs0mCqvBNn1xFQNtL86q2DLNFiW+gCALPUX7UvwW+F6Px9/iUwTfKKoB70CAJykHGN53RIiWpwTB7mqogEABLSHltctsd0IthtJVsW37sWoigYB7RHQfpgsdhVdzE3kEI/NbnvJ6lQSzEHdi0dwc758B49NksO43ftx9xvsJCXyuiUB7QEAt6ZbKh2W1YVbZpmGdM88Flqr5Vv/9Ium+Scblm5gfjL7rAAAAABJRU5ErkJggg=="}};
  Object.keys(D2_FINDART).forEach(function (k) { var im = new Image(); im.src = D2_FINDART[k].src; D2_FINDART[k].im = im; });
  function d2Col(k, sh, dx, dy) {   /* the colour of one pixel of a clean piece, light from the top left */
    var lt = (-dx - dy) / 40;
    if (sh === 1) return "#3a2414";
    if (k === "tray") return sh === 3 ? (lt > .3 ? "#d8dee6" : lt > -.3 ? "#a8b0ba" : "#7a828e") : ((Math.round(dx) + Math.round(dy) * 3) % 11 === 0 ? "#6a727e" : lt > .3 ? "#9aa2ae" : "#868e9a");
    if (k === "board") return sh === 6 ? (lt > 0 ? "#c8945a" : "#a87448") : (Math.round(dy + Math.sin(dx / 7) * 2) % 5 === 0 ? "#c89058" : lt > .4 ? "#f0c890" : lt > -.3 ? "#e0b07a" : "#c8945a");
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
  function d2Sprite(k) {   /* each piece drawn once into its own canvas, at the big size, with a one-pixel outline all round */
    var R = 50, N = R * 2 + 1, cv = document.createElement("canvas"); cv.width = N; cv.height = N; var g = cv.getContext("2d"), m = [];
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) m[y * N + x] = d2Sh(k, x - R, y - R);
    var on = function (x, y) { return x >= 0 && y >= 0 && x < N && y < N && m[y * N + x] > 0; };
    for (var y2 = 0; y2 < N; y2++) for (var x2 = 0; x2 < N; x2++) { var sh = m[y2 * N + x2]; if (!sh) continue; var edge = !on(x2 - 1, y2) || !on(x2 + 1, y2) || !on(x2, y2 - 1) || !on(x2, y2 + 1);
      g.fillStyle = edge ? "#3a2414" : d2Col(k, sh === 1 ? 1 : sh, (x2 - R) / (k === "tray" || k === "board" ? 1 : D2_SC), (y2 - R) / (k === "tray" || k === "board" ? 1 : D2_SC)); g.fillRect(x2, y2, 1, 1); }
    return cv; }
  var d2Spr = {};
  function d2Make(k) {   /* the dirt on one piece: three or four spots of different kinds on the parts that get dirty; greasy things always need Spüli */
    var pool = { plate: ["ketchup", "jam", "sauce", "crumbs", "egg"], plate2: ["egg", "sauce", "crumbs", "cheese"], bowl: ["dried", "jam", "crumbs", "cheese"], cup: ["cocoa", "cocoa", "dried"], mug: ["cocoa", "dried", "jam"], glass: ["jam", "crumbs", "sauce"], pan: ["burnt", "burnt", "egg", "crumbs"], pot: ["cocoa", "dried", "burnt", "sauce"], tray: ["burnt", "cheese", "crumbs", "sauce"], board: ["crumbs", "jam", "cheese", "sauce"] }[k].slice().sort(function () { return Math.random() - .5; });
    var small = k === "cup" || k === "mug" || k === "glass", kinds = pool.slice(0, small ? 2 : 3);
    if (k === "pan" || k === "tray" || k === "plate2" || k === "pot" || Math.random() < .5) kinds.push("grease");
    var spots = [], tries = 0;
    kinds.forEach(function (ty) { var r = ty === "crumbs" ? 8 : small ? 5 : 7 + Math.floor(Math.random() * 4);
      while (tries++ < 600) { var x = Math.round(Math.random() * 76 - 38), y = Math.round(Math.random() * 56 - 28);
        if (!d2Inside(k, x, y) || !d2Inside(k, x + r * .8, y) || !d2Inside(k, x - r * .8, y) || !d2Inside(k, x, y + r * .7) || !d2Inside(k, x, y - r * .7)) continue;
        if (spots.some(function (s) { return Math.hypot(s.x - x, s.y - y) < s.r + r + 2; })) continue;
        var crumbs = []; if (ty === "crumbs") for (var c = 0; c < 10; c++) crumbs.push([Math.round(Math.random() * 14 - 7), Math.round(Math.random() * 10 - 5)]);
        spots.push({ x: x, y: y, r: r, ty: ty, hp: D2_DIRT[ty].hp, max: D2_DIRT[ty].hp, cr: crumbs, tough: false, dry: false, soaked: false }); break; } });
    var foam = []; for (var f = 0; f < 44; f++) { var a = Math.random() * Math.PI * 2, dd = Math.sqrt(Math.random()) * 40; foam.push({ x: Math.round(Math.cos(a) * dd * 1.2), y: Math.round(Math.sin(a) * dd * .85), r: 3 + Math.floor(Math.random() * 3) }); }
    for (var f3 = 0, tr = 0; f3 < 26 && tr < 400; tr++) { var wx = Math.round(Math.random() * 150 - 70), wy = Math.round(Math.random() * 74 - 37); if ((wx / 56) * (wx / 56) + (wy / 44) * (wy / 44) < 1 || (wx > -76 && wx < 22 && wy > 20)) continue; foam.push({ x: wx, y: wy, r: 3 + Math.floor(Math.random() * 3), w: 1 }); f3++; }   /* suds drifting on the water */
    var find = null; if (window.__dishFind || Math.random() < .6) { for (var t2 = 0; t2 < 200; t2++) { var fx = Math.round(Math.random() * 130 - 56), fy = Math.round(Math.random() * 60 - 30); if ((fx / 60) * (fx / 60) + (fy / 46) * (fy / 46) < 1 || (fx > -76 && fx < 22 && fy > 18)) continue;
        find = { k: window.__dishFindK || D2_FIND[Math.floor(Math.random() * D2_FIND.length)], x: fx, y: fy, seen: false, got: false }; break; }
      if (find) for (var f2 = 0; f2 < 3; f2++) foam.push({ x: find.x + Math.round(Math.random() * 6 - 3), y: find.y + Math.round(Math.random() * 4 - 2), r: 5, w: 1 }); }   /* hidden under ordinary-looking suds */
    return { k: k, spots: spots, foam: foam, find: find, done: false, t0: performance.now() };
  }
  function d2Start() {
    var pool = D2_PIECES.slice().sort(function () { return Math.random() - .5; }).slice(0, 4);
    if (window.__dishPool2) pool = window.__dishPool2.slice();   /* preview test hook */
    d2S = { pets: [], deco: [], left: pool, total: pool.length, cur: null, tool: "sponge", towel: [], finds: [], popped: 0, wrong: 0, fx: [], bub: [], rub: null, hint: null, rinse: 0, fly: null, slide: 0, over: false, face: null, faceT: 0, lastFace: "" };
    d2V.card.hidden = true; d2Next();
  }
  function d2Next() { var S = d2S; if (!S.left.length) { d2End(); return; } S.cur = d2Make(S.left.shift()); S.slide = 1; S.rx = 0; S.ready = false; S.water = 0; S.wrun = 0; S.hold = null; mBan(d2V, "Schrubben!"); }
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
  function d2Find(c, k, x, y, sq) {   /* the little things under the foam, floating, with a light ring on the water */
    var F = D2_FINDART[k]; if (!F || !F.im.complete) return; x = Math.round(x); y = Math.round(y);
    for (var a = 0; a < 16; a++) { var an = a / 16 * Math.PI; mR(c, x + Math.cos(an) * (F.w / 2 + 2), y + F.h / 2 - 1 + Math.sin(an) * 2, 1, 1, "#eef8ff"); }
    c.drawImage(F.im, x - Math.floor(F.w / 2), y - Math.floor(F.h / 2) + (sq ? 1 : 0)); }
  function d2Mini(c, k, x, y) {   /* the clean pieces hanging over the tea towel, small */
    var O = "#3a2414"; x = Math.round(x); y = Math.round(y);
    var disc = function (r, a, b2) { for (var yy = -r; yy <= r; yy++) for (var xx = -r; xx <= r; xx++) { var d = Math.hypot(xx, yy); if (d > r + .3) continue; mR(c, x + xx, y + yy, 1, 1, d > r - .7 ? O : d > r - 1.7 ? a : b2); } };
    if (k === "plate") disc(5, "#6a9ad8", "#f8f4ec"); else if (k === "plate2") disc(5, "#e8650c", "#f8f4ec"); else if (k === "bowl") disc(5, "#6aa0e8", "#f4efe6");
    else if (k === "tray") { mR(c, x - 6, y - 4, 13, 9, O); mR(c, x - 5, y - 3, 11, 7, "#a8b0ba"); mR(c, x - 4, y - 2, 9, 5, "#868e9a"); }
    else if (k === "board") { mR(c, x - 5, y - 4, 11, 9, O); mR(c, x - 4, y - 3, 9, 7, "#e0b07a"); mR(c, x - 4, y - 3, 9, 1, "#f0c890"); mR(c, x + 5, y - 1, 3, 3, O); }
    else if (k === "glass") { mR(c, x - 3, y - 4, 7, 9, O); mR(c, x - 2, y - 3, 5, 7, "#e4f4fc"); mR(c, x - 2, y - 3, 1, 7, "#ffffff"); }
    else if (k === "pan") { disc(5, "#7a7a86", "#5a5a64"); mR(c, x - 1, y + 5, 3, 4, O); mR(c, x, y + 6, 1, 2, "#8a5a32"); }
    else { mR(c, x - 4, y - 3, 8, 8, O); mR(c, x - 3, y - 2, 6, 6, k === "mug" ? "#6fae5a" : "#f8f4ec"); mR(c, x + 1, y - 2, 2, 6, k === "mug" ? "#3e8a3a" : "#d8d0c4"); mR(c, x + 4, y - 1, 2, 4, O); if (k === "cup") mR(c, x - 3, y + 1, 6, 1, "#e8650c"); if (k === "pot") mR(c, x - 3, y, 6, 1, "#6fae5a"); }
  }
  var D2_ART = {   /* the tools as little pictures: one pixel is one pixel, outline, three shades lit from the top left */
    sponge: { p: { o: "#3a2414", G: "#a8e878", g: "#6fc04a", d: "#3e8a2a", Y: "#ffe888", y: "#f0c040", b: "#c89020", q: "#d8a830" },
      r: ["..oooooooooooooo..", ".oGGGGGGGGGGGGGGo.", "oGGgGGGGgGGGGGgGgo", "oggggggggggggggggo", "oddddddddddddddddo", "oYYYYYYYYYYYYYYYyo", "oYYqYYYYYYqYYYYYyo", "oYYYYYYqYYYYYYqYyo", "oyYYqYYYYYYYYYYYyo", "oyyyyyyyyyyqyyyybo", "obbbbbbbbbbbbbbbbo", ".oooooooooooooooo."] },
    brush: { p: { o: "#3a2414", W: "#f0c890", w: "#c8945a", b: "#8a5a32", R: "#ff7a6a", r: "#e8463c", D: "#a82a22", F: "#fff0c0", f: "#e0c880" },
      r: ["....oooooooooo....", "...oRRRRRRRRrro...", "...oRrrrrrrrrDo...", "..ooDDDDDDDDDDoo..", ".oWWWWWWWWWWWWWwo.", "oWWwwwwwwwwwwwwwbo", "owwwwwwwwwwwwwwwbo", "obbbbbbbbbbbbbbbbo", "oooooooooooooooooo", ".oFfFfFfFfFfFfFfo.", ".oFfFfFfFfFfFfFfo.", ".ofFfFfFfFfFfFfFo.", "..oooooooooooooo.."] },
    soap: { p: { o: "#3a2414", R: "#ff8a7a", r: "#e8463c", D: "#a82a22", G: "#c8f0a0", g: "#7ad050", d: "#3e9a2a", W: "#ffffff", L: "#fff8ec", l: "#e0d0b4" },
      r: ["....oooo....", "....oRro....", "....oRDo....", "...ooooo....", "..oGGggdo...", ".oGWGgggdo..", ".oGWggggdo..", ".oGGggggdo..", ".oLLLLLlldo.", ".oLrLLLLldo.", ".oLLLrLlldo.", ".oLLLLLlldo.", ".oGgggggddo.", ".oggggggddo.", ".oddddddddo.", "..oooooooo.."] },
    bottle: { p: { o: "#3a2414", R: "#ff8a7a", r: "#e8463c", D: "#a82a22", G: "#c8f0a0", g: "#7ad050", d: "#3e9a2a", W: "#ffffff", L: "#fff8ec", l: "#e0d0b4" },
      r: ["....ooo....", "....oRo....", "...ooRoo...", "...oRRDo...", "..ooooooo..", "..oGGggdo..", ".oGWGgggdo.", ".oGWggggdo.", ".oGWggggdo.", ".oLLLLLldo.", ".oLrLLLldo.", ".oLLrLLldo.", ".oLrLLLldo.", ".oLLLLLldo.", ".oGgggggdo.", ".oGgggggdo.", ".oggggggdo.", ".oggggggdo.", ".odddddddo.", "..ooooooo.."] },
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
    d2Tap(c, S.water > 0);
    var bq = S.squeeze && now - S.squeeze < 180 ? 1 : 0, bw = d2Art("bottle");   /* the Spüli bottle on the counter, squashed for a moment when squeezed */
    mR(c, D2_BOT.x - 6, D2_BOT.y - 1, 13, 2, "rgba(58,36,20,.25)"); c.drawImage(bw, D2_BOT.x - 5, D2_BOT.y - 20 + bq);
    if (S.hint && now < S.hint.t1 && S.hint.k === "soap" && Math.floor(now / 200) % 2) dwArrow(c, D2_BOT.x + 16, D2_BOT.y - 10, t, "r");
    if (S.ready && !S.water && !S.fly) dwArrow(c, 156, 26, t, "d");   /* turn on the tap! */
    // the water: soapy, light ripples drifting
    var X0 = D2.x0 + 3, X1 = D2.x1 - 3, Y0 = D2.y0 + 3, Y1 = D2.y1 - 3;
    for (var y = Y0; y < Y1; y++) for (var x = X0; x < X1; x += 2) { var cx = Math.max(X0 + 5, Math.min(X1 - 6, x)), cy = Math.max(Y0 + 5, Math.min(Y1 - 6, y)); if (Math.hypot(x - cx, y - cy) > 5) continue;
      var w = Math.sin((x + t / 90) / 5) + Math.sin((y * 1.7 + t / 140) / 4); mR(c, x, y, 2, 1, y < Y0 + 3 ? "#7aa8c4" : w > 1.6 ? "#d4ecf8" : w > .4 ? "#b4dcf0" : "#a4d2ea"); }
    var it = S.cur;
    if (it) {
      var ox = D2.cx, oy = D2.cy;
      if (S.slide > 0) { S.slide = Math.max(0, S.slide - .04); oy += Math.round(S.slide * 8); }
      if (S.water > 0 && !S.fly) S.rx = Math.min(1, (S.rx || 0) + .04); else if (!S.fly) S.rx = Math.max(0, (S.rx || 0) - .04); var gx0 = D2.cx + Math.round(28 * (S.rx || 0) * (S.rx || 0) * (3 - 2 * (S.rx || 0))); ox = gx0;   /* the clean piece glides under the tap */
      if (S.fly) { var u = Math.min(1, (now - S.fly.t0) / 650); ox = gx0 + (S.fly.tx - gx0) * u; if (u >= 1) S.rx = 0; oy = D2.cy + (S.fly.ty - D2.cy) * u - Math.sin(u * Math.PI) * 26; }
      // the find lies in the water beside the piece
      if (it.find && !it.got && !S.fly) d2Find(c, it.find.k, D2.cx + it.find.x, D2.cy + it.find.y, it.find.sq > 0 && (it.find.sq -= .05) > 0);
      if (!(S.fly && now - S.fly.t0 > 520)) {
        var spr = d2Spr[it.k] || (d2Spr[it.k] = d2Sprite(it.k)); c.drawImage(spr, Math.round(ox - 50), Math.round(oy - 50));
        it.spots.forEach(function (s) { if (s.hp <= 0 && s.scratch) { for (var z = -3; z <= 3; z++) { mR(c, ox + s.x + z, oy + s.y + z, 1, 1, "rgba(255,255,255,.7)"); mR(c, ox + s.x + z + 3, oy + s.y + z - 1, 1, 1, "rgba(58,36,20,.35)"); } } if (s.hp <= 0) return; var D = D2_DIRT[s.ty], f = s.hp / s.max;
          if (s.ty === "crumbs") { s.cr.forEach(function (q, i) { if (i / s.cr.length < f) { mR(c, ox + s.x + q[0], oy + s.y + q[1], 2, 2, D.c[1]); mR(c, ox + s.x + q[0], oy + s.y + q[1], 1, 1, D.c[0]); } }); return; }
          for (var yy = -s.r; yy <= s.r; yy++) for (var xx = -s.r; xx <= s.r; xx++) { var e = (xx * xx) / (s.r * s.r) + (yy * yy) / (s.r * s.r * .7), wob = (((xx + s.x) * 7 + (yy + s.y) * 13) % 5 - 2) * .06; if (e > 1 + wob) continue;
            if (f < .66 && (xx + yy) % 2) continue; if (f < .33 && (xx * 3 + yy) % 4) continue;   /* thins out, dithered, as it is scrubbed */
            mR(c, ox + s.x + xx, oy + s.y + yy, 1, 1, s.dry && ((xx * 2 + yy * 3) % 7 === 0 || (xx - yy) % 6 === 0) ? "#3a2414" : e > .7 + wob ? D.c[1] : D.c[0]); } });
        if (S.water > 0) { var sx = 117, sy0 = 24, sy1 = S.rx >= 1 ? oy - 4 : 78;   /* water falls straight down from the tip of the tap */
          for (var yy4 = sy0; yy4 < sy1; yy4++) { var fl = (yy4 + Math.floor(t / 40)) % 5; mR(c, sx - 1, yy4, 3, 1, "#a8d8f0"); mR(c, sx, yy4, 1, 1, fl ? "#e8f6ff" : "#ffffff"); if (fl === 0) mR(c, sx + 1, yy4, 1, 1, "#ffffff"); }
          if (Math.random() < .6) S.fx.push({ x: sx, y: sy1, vx: (Math.random() - .5) * 50, vy: -15 - Math.random() * 25, life: .45, c: Math.random() < .5 ? "#bfe8ff" : "#ffffff" }); }
      }
      // foam on top: white puffs with a soft blue edge
      it.foam.forEach(function (f) { if (S.fly && !f.w) return; var bx0 = f.w ? D2.cx : ox, by0 = f.w ? D2.cy : oy; for (var yy = -f.r; yy <= f.r; yy++) for (var xx = -f.r; xx <= f.r; xx++) { var d = Math.hypot(xx, yy * 1.2); if (d > f.r + .3) continue; mR(c, bx0 + f.x + xx, by0 + f.y + yy, 1, 1, d > f.r - .8 ? "#c8dcea" : xx + yy < -1 ? "#ffffff" : "#eef6fa"); } });
      if (it.find && !it.find.seen && now - it.t0 > 12000 && (now % 4000) < 500) { var spx = D2.cx + it.find.x + 3, spy = D2.cy + it.find.y - 8;   /* something glints under the foam */
        mR(c, spx, spy - 2, 1, 5, "#ffe08a"); mR(c, spx - 2, spy, 5, 1, "#ffe08a"); mR(c, spx, spy, 1, 1, "#ffffff"); }
      // a hint over a spot when the wrong tool was used: the tool it needs, in a little bubble
      if (S.hint && now < S.hint.t1) { var hx = Math.round(ox + S.hint.x), hy = Math.round(oy + S.hint.y - 24); mR(c, hx - 11, hy - 10, 22, 20, "#3a2414"); mR(c, hx - 10, hy - 9, 20, 18, "#fff8ec"); mR(c, hx - 2, hy + 10, 4, 2, "#3a2414"); d2ToolIcon(c, S.hint.k, hx, hy); }
      if (S.fly && now - S.fly.t0 >= 650) { S.towel.push(it.k); S.fly = null; S.cur = null; S.face = "happy"; S.faceT = now + 800; beep([[1047, .04], [1319, .04], [1568, .08]]); for (var q = 0; q < 10; q++) S.fx.push({ x: 56 + (S.towel.length - 1) * 13 + 4, y: 10, vx: (Math.random() - .5) * 40, vy: -10 - Math.random() * 20, life: .7, c: "#ffd34a" }); setTimeout(d2Next, 250); }
    }
    if (S.hold && it) { var HD2 = S.hold;   /* holding: the gauge fills; let go inside the golden zone */
      if (HD2.kind !== "water" || S.rx >= 1) HD2.v += .016 * HD2.rate;
      if (HD2.kind === "scrub" && HD2.sp) { var tw2 = d2Art(S.tool), wx2 = ox + HD2.sp.x + Math.round(Math.sin(t / 45) * 5), wy2 = oy + HD2.sp.y + Math.round(Math.cos(t / 60) * 2);
        c.drawImage(tw2, Math.round(wx2 - tw2.width / 2), Math.round(wy2 - tw2.height / 2)); if (Math.random() < .35) S.fx.push({ x: wx2, y: wy2, vx: (Math.random() - .5) * 26, vy: -14, life: .5, c: "#ffffff" });
        if (Math.floor(now / 110) !== Math.floor((now - 16) / 110)) beep([[1200 + Math.random() * 500, .02]]); }
      if (HD2.kind === "soap") { S.squeeze = now; var nx = D2_BOT.x, ny = D2_BOT.y - 20, tx2 = ox + (HD2.sp ? HD2.sp.x : 0), ty2 = oy + (HD2.sp ? HD2.sp.y : 0);
        for (var q2 = 0; q2 < 14; q2++) { var uu = ((q2 / 14) + now / 900) % 1; mR(c, nx + (tx2 - nx) * uu - 1, ny + (ty2 - ny) * uu - Math.sin(uu * Math.PI) * 10 - 1, 2, 2, q2 % 3 ? "#8ae070" : "#c8f0a0"); }
        if (Math.random() < .3 && it.foam.length < 90) it.foam.push({ x: tx2 - D2.cx + Math.round(Math.random() * 10 - 5), y: ty2 - D2.cy + Math.round(Math.random() * 6 - 3), r: 2, soap: 1 }); }
      d2Gauge(c, HD2);
      if (HD2.v >= 1) d2Resolve(); }
    if (S.squirt) { var su = (now - S.squirt.t0) / 450, sq = S.squirt;   /* a squirt of washing-up liquid flies in an arc onto the piece */
      if (su < 1) { for (var q2 = 0; q2 < 6; q2++) { var uu = su - q2 * .06; if (uu < 0) continue; mR(c, sq.x0 + (sq.tx - sq.x0) * uu - 1, sq.y0 + (sq.ty - sq.y0) * uu - Math.sin(uu * Math.PI) * 22 - 1, 3, 2, q2 ? "#8ae070" : "#c8f0a0"); } }
      else { S.squirt = null; if (it) { var tg = sq.spot; if (tg && tg.hp > 0) { tg.hp = 0; beep([[700, .05], [940, .06]]); }
        for (var k3 = 0; k3 < 7; k3++) it.foam.push({ x: sq.tx - D2.cx + Math.round(Math.random() * 12 - 6), y: sq.ty - D2.cy + Math.round(Math.random() * 8 - 4), r: 2 + Math.floor(Math.random() * 2), soap: 1 });
        for (var k4 = 0; k4 < 8; k4++) S.fx.push({ x: sq.tx, y: sq.ty, vx: (Math.random() - .5) * 40, vy: -15 - Math.random() * 20, life: .6, c: "#ffffff" });
        d2Ready(); } } }
    d2Pets(c, t, now);
    // bubbles drifting up, to be popped
    if (it && !S.fly && Math.random() < .025 && S.bub.length < 6) S.bub.push({ x: D2.cx + rnd(-70, 70), y: D2.cy + rnd(10, 36), r: 2 + Math.floor(Math.random() * 3), vy: -.22 - Math.random() * .25, ph: Math.random() * 6 });
    S.bub = S.bub.filter(function (b) { b.y += b.vy; b.x += Math.sin(t / 400 + b.ph) * .2; for (var a = 0; a < 16; a++) { var an = a / 16 * Math.PI * 2; mR(c, b.x + Math.cos(an) * b.r, b.y + Math.sin(an) * b.r, 1, 1, a % 4 === 1 ? "#ffffff" : "#8cc4e8"); } mR(c, b.x - b.r / 2, b.y - b.r / 2, 1, 1, "#ffffff"); return b.y > -6; });
    // the tools on the front rim: the chosen one lifted and yellow
    D2_TOOLS.forEach(function (T) { var pressed = S.press && S.press.k === T.k && now - S.press.t < 250, y0 = d2Tile(c, T.x, T.y + (pressed ? 2 : 0), S.tool === T.k); d2ToolIcon(c, T.k, T.x, y0 + 8);
      if (S.hint && now < S.hint.t1 && S.hint.k === T.k && Math.floor(now / 200) % 2) { mR(c, T.x - 14, y0 - 2, 28, 2, "#ffd34a"); mR(c, T.x - 14, y0 + 21, 28, 2, "#ffd34a"); mR(c, T.x - 14, y0, 2, 21, "#ffd34a"); mR(c, T.x + 12, y0, 2, 21, "#ffd34a"); } });   /* the tool the spot needs blinks */
    // the tool under the finger while scrubbing
    if (S.rub && it) { var tk = S.tool, tw = d2Art(tk); c.drawImage(tw, Math.round(S.rub[0] - tw.width / 2), Math.round(S.rub[1] - tw.height / 2));
      if (tk === "water") for (var dr = 0; dr < 4; dr++) mR(c, S.rub[0] - 5 + dr * 3, S.rub[1] + 9 + ((dr + Math.floor(t / 70)) % 3) * 2, 1, 2, "#6ac0f0"); }
    // what was found, top right beside the tap
    if (S.finds.length) { mR(c, 150, 22, 27, 19, "#3a2414"); mR(c, 151, 23, 25, 17, "#fff8ec"); var lf = S.finds.filter(function (k) { return D2_FINDART[k]; }).pop(); if (lf) d2Find(c, lf, 160, 31, false); if (typeof pcText === "function") pcText(c, 171, 29, String(S.finds.length), "#3a2414"); }
    S.fx = S.fx.filter(function (f) { f.life -= .016; f.x += f.vx * .016; f.y += f.vy * .016; f.vy += 30 * .016; c.globalAlpha = Math.min(1, f.life * 2); mR(c, f.x, f.y, 1, 1, f.c); c.globalAlpha = 1; return f.life > 0; });
    // our real hamster at the bottom left reacts with his own faces
    var fk = S.face && now < (S.faceT || 0) ? S.face : (S.rub ? "work" : "idle");
    if (fk !== S.lastFace && typeof HV_FACES !== "undefined") { S.lastFace = fk; front(HV_FACES[fk] || HV_FACES.idle); if (fk === "happy") pulse("bighop", 620); else if (fk === "oops") pulse("hop", 380); }
    S.raf = requestAnimationFrame(d2Draw);
  }
  // ---- touching ----
  var D2_FNAME = { duck: "Quietscheente!", marble: "Murmel!", fish: "Fischchen!", button: "Knopf!", boat: "Papierboot!", shell: "Muschel!", ring: "Ein Ring!", star: "Seestern!" };
  function d2Burst(x, y, n, col) { for (var i = 0; i < n; i++) d2S.fx.push({ x: x, y: y, vx: (Math.random() - .5) * 50, vy: -20 - Math.random() * 30, life: .7, c: col || "#ffd34a" }); }
  function d2FindGot(k, x, y) {   /* each find does something of its own */
    var S = d2S; S.finds.push(k); S.face = "happy"; S.faceT = performance.now() + 900; mBan(d2V, D2_FNAME[k]); d2Burst(x, y, 10);
    if (k === "duck" || k === "fish" || k === "boat" || k === "marble") { var a = Math.random() * Math.PI * 2, sp = k === "marble" ? 34 : k === "boat" ? 12 : 9;   /* it stays and swims (or rolls) about in the sink */
      S.pets.push({ k: k, x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6, sq: 0, jump: 0 }); beep([[784, .05], [1047, .05], [1319, .08]]); }
    else if (k === "shell") { beep([[523, .06], [659, .06], [988, .1]]); S.pearl = { x: x, y: y, t0: performance.now() }; setTimeout(function () { if (d2S) { d2S.finds.push("pearl"); mBan(d2V, "Mit Perle!"); } }, 900); }
    else if (k === "star") { S.deco.push({ k: "star", x: 48 + Math.floor(Math.random() * 64), y: 3, t0: performance.now(), fx: x, fy: y }); beep([[880, .04], [1175, .04], [1568, .06]]); }
    else if (k === "ring") { S.ringT = performance.now(); S.face = "happy"; S.faceT = performance.now() + 2000; beep([[1319, .05], [1568, .05], [2093, .1]]); }
    else { S.flip = { k: k, x: x, y: y, t0: performance.now() }; beep([[1047, .04], [1568, .06]]); }
  }
  function d2PetTap(pt) {
    var S = d2S; S.face = "happy"; S.faceT = performance.now() + 600;
    if (pt.k === "duck") { pt.sq = 1; beep([[1200, .05], [900, .08]]); mBan(d2V, "Quietsch!"); for (var h = 0; h < 3; h++) S.hearts.push({ x: pt.x - 4 + h * 4, y: pt.y - 10, t0: performance.now() + h * 120 }); }
    else if (pt.k === "fish") { pt.jump = performance.now(); beep([[600, .04], [900, .05]]); mBan(d2V, "Platsch!"); }
    else if (pt.k === "boat") { pt.vx *= 3; pt.vy *= 3; pt.boost = performance.now(); beep([[330, .12], [330, .12]]); mBan(d2V, "Tuut tuut!"); }
    else { var a = Math.random() * Math.PI * 2; pt.vx = Math.cos(a) * 60; pt.vy = Math.sin(a) * 40; beep([[1800, .02]]); }
  }
  function d2Pets(c, t, now) {   /* the finds that stay: swimming, rolling, jumping, and a star stuck to the tiles */
    var S = d2S, X0 = D2.x0 + 12, X1 = D2.x1 - 12, Y0 = D2.y0 + 10, Y1 = D2.y1 - 10;
    S.pets.forEach(function (pt) { var dt = .016; pt.x += pt.vx * dt; pt.y += pt.vy * dt;
      if (pt.boost && now - pt.boost > 900) { pt.vx /= 3; pt.vy /= 3; pt.boost = 0; }
      if (pt.k === "marble") { pt.vx *= .995; pt.vy *= .995; if (Math.hypot(pt.vx, pt.vy) < 14) { pt.vx *= 1.02; pt.vy *= 1.02; } }
      var hit = false; if (pt.x < Math.max(X0, 34) || pt.x > X1) { pt.vx = -pt.vx; pt.x = Math.max(Math.max(X0, 34), Math.min(X1, pt.x)); hit = true; } if (pt.y < Y0 || pt.y > Y1) { pt.vy = -pt.vy; pt.y = Math.max(Y0, Math.min(Y1, pt.y)); hit = true; }
      if (hit && pt.k === "marble") beep([[1500 + Math.random() * 400, .02]]);
      if (Math.random() < .004 && pt.k !== "marble") { var a = Math.random() * Math.PI * 2, sp = Math.hypot(pt.vx, pt.vy); pt.vx = Math.cos(a) * sp; pt.vy = Math.sin(a) * sp * .6; }
      var jy = pt.jump && now - pt.jump < 700 ? -Math.round(Math.sin((now - pt.jump) / 700 * Math.PI) * 18) : 0; if (pt.jump && now - pt.jump >= 700) { pt.jump = 0; d2Burst(pt.x, pt.y, 8, "#bfe8ff"); }
      var F = D2_FINDART[pt.k]; if (!F || !F.im.complete) return; var sq = pt.sq > 0 ? 1 : 0; if (pt.sq > 0) pt.sq -= .05;
      var bob = pt.k === "marble" ? 0 : Math.round(Math.sin(now / 300 + pt.x) * 1);
      for (var r = 0; r < 12; r++) { var an = r / 12 * Math.PI; mR(c, pt.x + Math.cos(an) * (F.w / 2 + 2), pt.y + F.h / 2 - 1 + Math.sin(an) * 2, 1, 1, "#eef8ff"); }
      c.save(); if (pt.vx < 0 && pt.k !== "marble") { c.translate(Math.round(pt.x) * 2, 0); c.scale(-1, 1); }
      c.drawImage(F.im, Math.round(pt.x - F.w / 2), Math.round(pt.y - F.h / 2 + bob + jy + sq)); c.restore();
      if (pt.k === "boat" && Math.random() < .2) S.fx.push({ x: pt.x - (pt.vx > 0 ? 9 : -9), y: pt.y + 5, vx: -pt.vx * .3, vy: -4, life: .4, c: "#ffffff" }); });
    S.deco.forEach(function (d) { var u = Math.min(1, (now - d.t0) / 700), x = d.fx + (d.x - d.fx) * u, y = d.fy + (d.y - d.fy) * u - Math.sin(u * Math.PI) * 20, F = D2_FINDART[d.k]; if (F && F.im.complete) c.drawImage(F.im, Math.round(x - F.w / 2), Math.round(y)); });
    if (S.pearl) { var u2 = (now - S.pearl.t0) / 900; if (u2 < 1.6) { var px = S.pearl.x, py = S.pearl.y - Math.sin(Math.min(1, u2) * Math.PI / 2) * 14; for (var yy = -3; yy <= 3; yy++) for (var xx = -3; xx <= 3; xx++) { var d = Math.hypot(xx, yy); if (d > 3.4) continue; mR(c, px + xx, py + yy, 1, 1, d > 2.6 ? "#3a2414" : xx + yy < -1 ? "#ffffff" : "#f0e8f4"); } if (Math.random() < .3) d2Burst(px, py, 1, "#ffffff"); } else S.pearl = null; }
    if (S.flip) { var u3 = (now - S.flip.t0) / 700; if (u3 < 1) { var F2 = D2_FINDART[S.flip.k]; if (F2 && F2.im.complete) { var hgt = Math.max(1, Math.round(F2.h * Math.abs(Math.cos(u3 * Math.PI * 3)))); c.drawImage(F2.im, Math.round(S.flip.x - F2.w / 2), Math.round(S.flip.y - 20 * Math.sin(u3 * Math.PI) - hgt / 2), F2.w, hgt); } } else S.flip = null; }
    if (S.ringT && now - S.ringT < 1500) for (var k = 0; k < 3; k++) { var a = now / 200 + k * 2.1; mR(c, 92 + Math.cos(a) * 16, 112 + Math.sin(a) * 8, 2, 2, "#ffe08a"); }
    S.hearts = (S.hearts || []).filter(function (h) { var u4 = (now - h.t0) / 1000; if (u4 < 0) return true; if (u4 > 1) return false; var hx = Math.round(h.x), hy = Math.round(h.y - u4 * 12); mR(c, hx - 2, hy, 2, 1, "#e8465a"); mR(c, hx + 1, hy, 2, 1, "#e8465a"); mR(c, hx - 2, hy + 1, 5, 1, "#e8465a"); mR(c, hx - 1, hy + 2, 3, 1, "#e8465a"); mR(c, hx, hy + 3, 1, 1, "#e8465a"); return true; });
  }
  function d2Ready() {   /* every spot is gone: now it only needs rinsing under the tap */
    var S = d2S, it = S.cur; if (!it || S.ready || !d2Clean(it)) return; S.ready = true; S.water = 0; S.rub = null; S.hint = null; it.foam = it.foam.filter(function (f) { return f.w || f.soap; }); mBan(d2V, "Jetzt abspülen!"); }
  function d2Squirt() {   /* Spüli: squeeze the bottle, and a squirt flies onto the greasy spot (or into the middle) */
    var S = d2S, it = S.cur; S.squeeze = performance.now(); if (!it || S.fly || S.squirt) return;
    var g = null; it.spots.forEach(function (sp) { if (!g && sp.ty === "grease" && sp.hp > 0) g = sp; });
    var gx3 = S.water > 0 && S.rx > 0 ? 28 : 0;
    S.squirt = { t0: performance.now(), x0: D2_BOT.x, y0: D2_BOT.y - 20, tx: D2.cx + gx3 + (g ? g.x : 0), ty: D2.cy + (g ? g.y : 0), spot: g }; beep([[500, .05], [300, .08]]); }
  function d2HoldStart(kind, sp) {   /* a hold begins: scrubbing a spot, squeezing the bottle, or holding the tap open */
    var S = d2S, tough = sp && sp.tough, w = kind === "scrub" ? (tough ? .13 : .17) : .18, c0 = .5 + Math.random() * .26;
    S.hold = { kind: kind, sp: sp, v: 0, zone: [c0, c0 + w], rate: kind === "scrub" ? (tough ? 1 / 2.3 : 1 / 1.8) : kind === "soap" ? 1 / 2 : 1 / 2.4 }; S.rub = null;
    if (kind === "water") { S.water = 1; beep([[200, .05], [260, .05]]); } else if (kind === "soap") beep([[500, .05], [300, .08]]); }
  function d2Gauge(c, H2) {   /* the same wooden bar as at the coffee machine, standing at the right: it fills from the bottom */
    var X = 3, Y = 30, Wd = 12, Ht = 66, ih = Ht - 6, f = Math.max(0, Math.min(1, H2.v)), col = H2.kind === "water" ? ["#bfe8ff", "#6ac0f0"] : H2.kind === "soap" ? ["#c8f0a0", "#6fc04a"] : ["#ffe08a", "#d8a040"];
    mR(c, X, Y, Wd, Ht, "#3a2414"); mR(c, X + 1, Y + 1, Wd - 2, Ht - 2, "#a06a38"); mR(c, X + 1, Y + 1, 1, Ht - 2, "#c8925a"); mR(c, X + Wd - 2, Y + 1, 1, Ht - 2, "#7a4e28");
    mR(c, X + 3, Y + 3, Wd - 6, ih, "#3a2414"); mR(c, X + 4, Y + 4, Wd - 8, ih - 2, "#3a2a20");
    var fh = Math.round((ih - 2) * f); mR(c, X + 4, Y + 3 + ih - 1 - fh, Wd - 8, fh, col[1]); mR(c, X + 4, Y + 3 + ih - 1 - fh, 2, fh, col[0]);
    var z0 = Y + 3 + ih - 1 - Math.round((ih - 2) * H2.zone[1]), z1 = Y + 3 + ih - 1 - Math.round((ih - 2) * H2.zone[0]), inz = f >= H2.zone[0] && f <= H2.zone[1];
    mR(c, X + 2, z0 - 1, Wd - 4, 1, "#f6c84a"); mR(c, X + 2, z1, Wd - 4, 1, "#f6c84a"); mR(c, X + 2, z0 - 1, 1, z1 - z0 + 2, "#f6c84a"); mR(c, X + Wd - 3, z0 - 1, 1, z1 - z0 + 2, "#f6c84a");
    if (inz && Math.floor(performance.now() / 120) % 2) { mR(c, X - 1, z0 - 2, 1, z1 - z0 + 4, "#fff0a0"); mR(c, X + Wd, z0 - 2, 1, z1 - z0 + 4, "#fff0a0"); } }
  function d2Resolve() {   /* let go: too early, just right, or too much */
    var S = d2S, H2 = S.hold, it = S.cur; S.hold = null; if (!H2 || !it) return; var v = H2.v, lo = v < H2.zone[0], hi = v > H2.zone[1], now = performance.now(), sp = H2.sp, ox = D2.cx + Math.round(28 * (S.rx || 0)), oy = D2.cy;
    var good = function (t) { mBan(d2V, t); beep([[784, .05], [1047, .06]]); S.face = "happy"; S.faceT = now + 700; }, bad = function (t) { mBan(d2V, t); beep([[220, .07], [170, .09]]); S.face = "oops"; S.faceT = now + 700; };
    if (H2.kind === "scrub") {
      if (lo) { sp.hp = Math.max(sp.max * .2, sp.hp - sp.max * .2); bad("Noch nicht sauber"); }
      else { if (sp.tough && !sp.soaked) { sp.dry = true; sp.hp = sp.max * .5; bad("Eingetrocknet! Einweichen"); S.hint = { x: sp.x, y: sp.y, k: "water", t1: now + 2500 }; }
        else { sp.hp = 0; d2Burst(ox + sp.x, oy + sp.y, 8); if (hi) { sp.scratch = true; S.wrong++; bad("Zu doll geschrubbt!"); } else good("Perfekt!"); } } }
    else if (H2.kind === "soap") {
      if (lo) { if (sp) sp.hp = Math.max(.2, sp.hp - .3); bad("Zu wenig Spüli"); }
      else { if (sp) sp.hp = 0; var n = hi ? 24 : 6; for (var k = 0; k < n; k++) it.foam.push({ x: (sp ? sp.x : 0) + (S.rx >= 1 ? 28 : 0) * 0 + Math.round(Math.random() * (hi ? 60 : 14) - (hi ? 30 : 7)), y: (sp ? sp.y : 0) + Math.round(Math.random() * (hi ? 40 : 10) - (hi ? 20 : 5)), r: 2 + Math.floor(Math.random() * 3), soap: 1 });
        if (hi) { S.wrong++; bad("Zu viel Spüli!"); } else good(sp ? "Fett ist weg!" : "Schön schaumig"); } }
    else {   /* the rinse at the end: let go in the golden zone */
      S.water = 0;
      if (lo) { it.foam = it.foam.filter(function (f, i) { return !f.soap || i % 2; }); bad("Noch Schaum dran"); return; }
      it.foam = it.foam.filter(function (f) { return !f.soap; });
      if (hi) { S.wrong++; for (var k2 = 0; k2 < 20; k2++) S.fx.push({ x: ox + Math.random() * 60 - 30, y: oy, vx: (Math.random() - .5) * 90, vy: -30 - Math.random() * 40, life: .8, c: "#bfe8ff" }); bad("Übergelaufen!"); } else good("Blitzblank!");
      S.fly = { t0: now, tx: 62 + S.towel.length * 13, ty: 10 }; S.rx = 1; beep([[880, .05], [1175, .05]]); return; }
    d2Ready(); }
  function d2Rub(a, b) {
    var S = d2S, it = S.cur; if (!it || S.fly || S.hold) return; var ox = D2.cx, oy = D2.cy, n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]))), moved = 0;
    for (var s = 0; s <= n; s++) { var x = a[0] + (b[0] - a[0]) * s / n - ox, y = a[1] + (b[1] - a[1]) * s / n - oy;
      var nf = it.foam.length; it.foam = it.foam.filter(function (f) { return f.soap || Math.hypot(f.x - x, f.y - y) > f.r + 5; }); if (it.foam.length < nf) { moved++; if (Math.random() < .5) S.fx.push({ x: x + ox, y: y + oy, vx: (Math.random() - .5) * 30, vy: -14, life: .6, c: "#ffffff" }); }
      it.spots.forEach(function (sp) { if (sp.hp <= 0 || Math.hypot(sp.x - x, sp.y - y) > sp.r + 4) return;
        if (it.foam.some(function (f) { return !f.soap && Math.hypot(f.x - sp.x, f.y - sp.y) < f.r + 1; })) return;   /* still under foam */
        if (D2_DIRT[sp.ty].t !== S.tool) { if (sp.dst !== S.strokeId) { sp.dst = S.strokeId; sp.dwell = 0; } sp.dwell++; if (sp.dwell > 40 && !sp.warned) { sp.warned = true; S.wrong++; }   /* only scrubbing on and on with the wrong thing counts, not wiping over it */
          if (!S.strokeWrong) { S.strokeWrong = true; S.hint = { x: sp.x, y: sp.y, k: D2_DIRT[sp.ty].t, t1: performance.now() + 1600 }; S.face = "oops"; S.faceT = performance.now() + 700; beep([[200, .06], [160, .08]]); } return; }
        sp.hp -= .006; if (Math.random() < .3) beep([[1300 + Math.random() * 500, .02]]);
        if (Math.random() < .3) S.fx.push({ x: sp.x + ox, y: sp.y + oy, vx: (Math.random() - .5) * 20, vy: -16, life: .6, c: "#ffffff" });
        if (sp.hp <= 0) { beep([[660, .05], [880, .06]]); for (var k = 0; k < 6; k++) S.fx.push({ x: sp.x + ox, y: sp.y + oy, vx: (Math.random() - .5) * 40, vy: -20 - Math.random() * 20, life: .6, c: "#ffd34a" }); } }); }
    if (moved && Math.random() < .3) beep([[900 + Math.random() * 300, .02]]);
    if (Math.random() < .25) S.fx.push({ x: b[0], y: b[1], vx: (Math.random() - .5) * 24, vy: -12 - Math.random() * 10, life: .4, c: "#e8f6ff" });   /* little splashes wherever the finger goes */
    if (it.find && !it.find.seen && !it.foam.some(function (f) { return !f.soap && Math.hypot(f.x - it.find.x, f.y - it.find.y) < f.r + 3; })) { it.find.seen = true; mBan(d2V, "Da ist was!"); beep([[1175, .05], [1568, .06]]); }
    d2Ready();
  }
  d2V.cv.addEventListener("pointerdown", function (e) {
    if (!d2S || d2S.over) return; var S = d2S, p = mPt(d2V, e);
    for (var i = 0; i < D2_TOOLS.length; i++) { var T = D2_TOOLS[i]; if (Math.abs(p[0] - T.x) <= 12 && p[1] >= T.y - 2 && p[1] <= T.y + 20) { if (S.tool !== T.k) { S.tool = T.k; beep([[520, .04], [700, .04]]); } return; } }   /* the tools first: the hamster's box must not swallow these taps */
    var hr = ham.getBoundingClientRect(); if (e.clientX >= hr.left && e.clientX <= hr.right && e.clientY >= hr.top && e.clientY <= hr.bottom && p[1] > 96) return;
    try { d2V.cv.setPointerCapture(e.pointerId); } catch (er) {}
    var it0 = S.cur; if (S.hold || S.fly || !it0) return;
    if (p[0] >= D2_BOT.x - 8 && p[0] <= D2_BOT.x + 8 && p[1] >= D2_BOT.y - 23 && p[1] <= D2_BOT.y + 2) { d2Squirt(); return; }
    if (p[0] >= 112 && p[0] <= 158 && p[1] >= 0 && p[1] <= 30) { if (S.ready) d2HoldStart("water", null); else { mBan(d2V, "Erst sauber machen"); beep([[220, .06]]); } return; }
    for (var b = 0; b < S.bub.length; b++) { var bb = S.bub[b]; if (Math.hypot(bb.x - p[0], bb.y - p[1]) < bb.r + 3) { S.bub.splice(b, 1); S.popped++; beep([[1400 + rnd(0, 400), .03]]); for (var q = 0; q < 6; q++) S.fx.push({ x: bb.x, y: bb.y, vx: (Math.random() - .5) * 40, vy: (Math.random() - .5) * 40, life: .4, c: "#ffffff" }); return; } }
    var it = S.cur;
    for (var pi = 0; pi < S.pets.length; pi++) { var pt = S.pets[pi]; if (Math.hypot(pt.x - p[0], pt.y - p[1]) < 10) { d2PetTap(pt); return; } }
    if (it && it.find && it.find.seen && !it.got && Math.hypot(p[0] - D2.cx - it.find.x, p[1] - D2.cy - it.find.y) < 10) { it.got = true; d2FindGot(it.find.k, D2.cx + it.find.x, D2.cy + it.find.y); return; }
    if (p[1] > D2.y0 && p[1] < D2.y1 && p[0] > D2.x0 && p[0] < D2.x1) { S.rub = p; S.strokeWrong = false; S.strokeId = (S.strokeId || 0) + 1; d2Rub(p, p); }
  });
  d2V.cv.addEventListener("pointermove", function (e) { if (!d2S || !d2S.rub) return; var p = mPt(d2V, e), last = d2S.rub; d2S.rub = p; d2Rub(last, p); });
  function d2Up() { if (d2S) { d2S.rub = null; d2S.strokeWrong = false; if (d2S.hold) d2Resolve(); } }
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
  window.__dish2 = { open: d2Open, st: function () { return d2S && { hold: d2S.hold && { k: d2S.hold.kind, v: d2S.hold.v, z: d2S.hold.zone }, water: d2S.water, rx: d2S.rx, ready: d2S.ready, dry: d2S.cur && d2S.cur.spots.filter(function (s) { return s.dry; }).length, left: d2S.left.length, cur: d2S.cur && { k: d2S.cur.k, spots: d2S.cur.spots.map(function (s) { return [s.x, s.y, s.ty, s.hp]; }), foam: d2S.cur.foam.length, find: d2S.cur.find }, tool: d2S.tool, towel: d2S.towel.length, finds: d2S.finds.length, wrong: d2S.wrong, over: d2S.over }; }, rub: function (a, b) { d2Rub(a, b); }, tool: function (k) { d2S.tool = k; } };
  if (window.__dish) window.__dish.open = d2Open;
  var _d2_int = interrupt; interrupt = function () { if (!window.__resume && d2S) d2Close(); return _d2_int.apply(this, arguments); };
