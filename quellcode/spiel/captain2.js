
  // ===================== Kapitän, neu gebaut: drei Spuren von Anfang an =====================
  // The world is one straight fairway along +y, cut into rows of 8 units; the three lanes are columns 7 units apart.
  // Every order sails 1 (Stopp), 3 (Halbe) or 5 (Volle) rows. A lane change takes 0 rows at Stopp, 1 at Halbe and 6 at Volle,
  // so at Volle it only ends in the next order; while gliding across, the ship counts in the lane it is mostly in. One lane per order.
  // The 3D models, bridge, water, sky, binoculars and sounds of the first captain game are drawn as they are; only the game is new.
  var KP_LW = 7, KP_R = 8, KP_N = [1, 3, 5], KP_CH = [0, 1, 6], KP_DUR = [2600, 3200, 3600];
  var kp = null, kpRaf = 0, kpOpen = false, kpC0 = cpc;
  var kpEl = xEl("div", "bee-pov fi-pov cap-pov kp-pov", scene); kpEl.hidden = true;
  kpEl.innerHTML = '<canvas width="180" height="135" class="fi-cv cap-cv"></canvas><div class="fi-card" hidden></div><div class="cap-toast" hidden></div><button type="button" class="bp-x" aria-label="Brücke verlassen">×</button><button type="button" class="cap-glbtn" aria-label="Fernglas"></button>';
  var kpCv = kpEl.querySelector("canvas"), kpc = kpCv.getContext("2d"); kpc.imageSmoothingEnabled = false;
  var kpCard = kpEl.querySelector(".fi-card"), kpToast = kpEl.querySelector(".cap-toast"), kpGl = kpEl.querySelector(".cap-glbtn"); kpGl.style.backgroundImage = cpGlBtn.style.backgroundImage;
  var kpPanel = document.createElement("div"); kpPanel.className = "cap-panel"; scene.parentNode.insertBefore(kpPanel, cpPanel.nextSibling); kpPanel.style.display = "none";
  function kpCl(L) { return Math.max(-1, Math.min(1, L)); }
  function kpSpan(a, b) { var r = []; for (var L = Math.min(a, b); L <= Math.max(a, b); L++) r.push(L); return r; }
  var KP_HITS = { tug: "Rumms! Wir rammen den Schlepper!", launch: "Rumms! Die Barkasse schaukelt, Hamster fallen ins Wasser!", ferry: "Rumms! Die Fähre gerammt!", quay: "Rumms an die Kaimauer!", fogb: "Rumms! Ein Fischerboot im Nebel gerammt!",
    rock: "Krach! Auf die Felsen gelaufen!", post: "Rumms! Das Postboot gerammt, Briefe flattern übers Wasser!", ship: "Rumms! Einen Dampfer gestreift!", mum: "Rumms! Die Mümmel gestreift!" };
  var KP_NAME = { zone: "Sandbank", boat: "Fischerboot", fogb: "Fischerboot", tug: "Schlepper", wood: "Treibholz", ice: "Eisberg", floe: "Eisscholle", rock: "Felsen", ferry: "Fähre", launch: "Barkasse", whale: "Wale", mum: "die lose Mümmel",
    pilot: "Lotsenboot", tender: "Tender", post: "Postboot", schooner: "Schoner in Not", light: "Feuerschiff", pier: "Pier", ship: "Dampfer", bottle: "Flaschenpost", dolph: "Delfine" };
  var KP_MODEL = { fogb: "boat", ferry: "tender", launch: "tug", post: "tender" };
  var KP_LANEW = ["links", "in der Mitte", "rechts"], KP_LANEA = ["linken", "mittleren", "rechten"];
  // the stops: who waits, what they say over the radio, what happens
  var KP_TASK = {
    pilot: { from: "Lotsenboot", now: "Lotse bereit zum Übersteigen.", done: "Der Lotse klettert ins Boot. Gute Fahrt!", miss: "Vorbeigefahren! Der Lotse muss jetzt mit nach Frankreich." },
    tender: { from: "Tender", now: "Die Gäste stehen an der Reling bereit.", done: "Die neuen Gäste klettern an Bord!", miss: "Vorbeigefahren! Die Gäste bleiben auf dem Tender." },
    post: { from: "Postboot Backentown", now: "Postsäcke liegen bereit.", done: "Die Postsäcke sind an Bord. Briefe für ganz Nuss York!", miss: "Vorbeigefahren! Die Post bleibt in Backentown." },
    schooner: { from: "Schoner Seehund", now: "Wir lassen unser Beiboot zu Wasser!", done: "Die Fischer sind gerettet und an Bord!", miss: "Vorbeigefahren! Der Schoner muss auf das nächste Schiff warten." },
    light: { from: "Feuerschiff Ambrösel", now: "Der Lotse für Nuss York ist bereit.", done: "Der Nuss-Yorker Lotse ist an Bord.", miss: "Vorbeigefahren! Ohne Lotsen dürfen wir nicht in den Hafen." },
    pier: { from: "Hafenmeister Körnerpier", now: "Die Leinen liegen bereit.", done: "Festgemacht am Körnerpier 59! Die Hamster jubeln.", miss: "" } };

  // ---- the fifteen levels ----
  function kpTown(H, B, side) { B.push({ k: "land", b0: -1.3, b1: -.45 }, { k: "land", b0: .35, b1: 1.2 }, { k: "town", b: side * .7 }); }
  function kpRinne(H, len) { [-1, 1].forEach(function (sd) { var ins = [], outs = [], si = [], so = [];
      for (var y = -40; y <= len * KP_R + 60; y += 8) { var wv = 1 + Math.sin(y * .09 + sd) * .6; ins.push([sd * (12.5 + wv * .6), y]); outs.push([sd * 26, y]); si.push([sd * (14.5 + wv), y]); so.push([sd * (17.5 + wv * 1.5), y]); }
      H.ob("shoal", 0, 0, { pts: ins.concat(outs.reverse()), sand: si.concat(so.reverse()) }); });
    for (var r = 1; r < len + 6; r += 3) { H.ob("buoyR", -10.6, r * KP_R + 4); H.ob("buoyG", 10.6, r * KP_R + 4); } }
  var KP_LV = [
    { name: "Ablegen in Southamsterton", s: "hafen", sky: "day", rows: 14, start: 1, harbour: 10, star: "Mit Pfiff abgelegt", ok: function () { return kp.whFirst; },
      tx: "Wir liegen rechts am Kai, Tausende Hamster winken. Im Hafen nicht zu schnell! Ein Pfiff zum Abschied gehört dazu.",
      build: function (H, B) {
        H.ob("quay", 11, 0, { y0: -30, y1: 80, crowd: 1 }); H.ob("quay", -15.5, 0, { y0: -30, y1: 82, crowd: 1 });
        H.ob("m3", 17, 4, { m: "shed", w: 6, l: 20 }); H.ob("m3", 17.5, 40, { m: "shed", w: 7, l: 18 }); H.ob("m3", -21.5, 22, { m: "shed", w: 7, l: 16 }); H.ob("m3", -22, 62, { m: "shed", w: 6, l: 14 });
        H.ob("m3", 13.2, 24, { m: "crane", side: 1 }); H.ob("m3", -17.7, 40, { m: "crane", side: -1 }); H.ob("m3", 13.4, 82, { m: "lhouse", c: "#d8463c" }); H.ob("m3", -17.4, 84, { m: "lhouse", c: "#4a9a3a" });
        H.cell(3, 1, "tug", { a: .35 }); H.cell(4, 1, "tug", { a: -.25, dx: .6 });
        var mum = H.ob("ship", -11.6, 50, { a: 0 }); kp.mum = { o: mum, trig: 0, px: -11.6, py: 57.4 };
        [[-1, 5, 1], [-1, 6, 1], [0, 5, 2], [0, 6, 2]].forEach(function (m) { H.cell(m[1], m[0], "mum", { need: m[2], noObj: 1 }); });
        H.cell(11 + Math.floor(H.R() * 2), H.pick([-1, 0, 1]), "boat", { a: .5 }); H.free(9, 13, "bottle", { soft: 1, find: 1 });
        B.push({ k: "land", b0: -1.3, b1: -.45 }, { k: "land", b0: .35, b1: 1.2 }); } },
    { name: "Durch den Kernsund", s: "kanal", sky: "day", rows: 28, start: 0, star: "Lotse übergeben",
      tx: "Die Rinne zwischen den Tonnen ist voller Sandbänke und Fischerboote. Vorn wartet das Lotsenboot, unser Lotse geht dort von Bord.",
      build: function (H, B) { var m = H.m; kpRinne(H, 28);
        H.bank(-m, 3, 5); H.cell(10, 0, "boat", { net: 1, a: .4 }); H.cell(10, m, "boat", { net: 1, a: -.6 });
        H.bank(m, 13, 16); H.cell(15, -m, "boat", { net: 1, a: .2 });
        H.task(21, m, "pilot"); H.bank(-m, 24, 26); H.free(17, 19, "bottle", { soft: 1, find: 1 });
        H.ob("tower", -22 * m, 150); B.push({ k: "land", b0: .25, b1: 1.3 }, { k: "land", b0: -1.5, b1: -.7 }); } },
    { name: "Nebel im Pfotenkanal", s: "nebel", sky: "fog", rows: 30, start: 0, star: "Zwei Dinge im Nebel erkannt", ok: function () { return cp.found.length >= 2; },
      tx: "Dichter Nebel. Was voraus treibt, zeigt nur das Fernglas: Treibholz oder Flaschenpost? Die Pfeife warnt Fischerboote.",
      build: function (H) {
        [[3, 8], [10, 14], [16, 20], [22, 27]].forEach(function (b) { H.free(b[0], b[1], "wood", { unk: 1 }); });
        H.free(5, 9, "bottle", { unk: 1, find: 1, soft: 1 }); H.free(14, 18, "bottle", { unk: 1, find: 1, soft: 1 }); H.free(22, 26, "bottle", { unk: 1, find: 1, soft: 1 });
        H.free(10, 13, "dolph", { unk: 1, ani: 1, find: 1, soft: 1 });
        [[8, 11], [16, 19], [24, 27]].forEach(function (b) { H.free(b[0], b[1], "fogb", { a: H.R() - .5 }); }); } },
    { name: "Reede von Schnüffelbourg", s: "reede", sky: "eve", rows: 24, start: 0, star: "Alle Gäste an Bord",
      tx: "Abends auf der Reede. Zwei Tender bringen neue Gäste, wir müssen bei beiden anhalten. Dazwischen kreuzt die Hafenfähre.",
      build: function (H, B) { var m = H.m; H.task(7, m, "tender"); H.task(17, -m, "tender");
        H.mover(12, H.pick([[-1, 0, 1, 0], [1, 0, -1, 0]]), "ferry", { a: 1.57 });
        H.free(2, 5, "boat", { a: .8 }); H.free(19, 22, "boat", { a: -.6 }); H.free(9, 15, "bottle", { soft: 1, find: 1 });
        kpTown(H, B, -m); } },
    { name: "Ausfahrt Schnüffelbourg", s: "kanal", sky: "eve", rows: 26, start: 0, star: "Flaschenpost aufgefischt",
      tx: "Hinaus aus der Reede durch eine Rinne mit Sandbänken. Wer früh plant, kann hier Volle Fahrt laufen.",
      build: function (H, B) { kpRinne(H, 26); var L = H.pick([-1, 0, 1]);
        [[3, 5], [10, 12], [17, 19]].forEach(function (b) { var nl = H.pick([-1, 0, 1].filter(function (x) { return x !== L; })); L = nl; H.bank(L, b[0], b[1]); });
        H.free(7, 9, "wood", {}); H.free(14, 16, "wood", {}); H.free(20, 24, "bottle", { soft: 1, find: 1 }); B.push({ k: "land", b0: -1.4, b1: -.5 }, { k: "town", b: -.9 }); } },
    { name: "Backentown", s: "reede", sky: "day", rows: 22, start: 0, star: "Post an Bord",
      tx: "Backentown! Das Postboot kommt mit Säcken voller Briefe. Im Hafen flitzen Barkassen hin und her.",
      build: function (H, B) { var m = H.m; H.mover(5, H.pick([[-1, 0, 1, 0], [1, 0, -1, 0]]), "launch", { a: 1.57 }); H.task(12, m, "post");
        H.mover(17, H.pick([[0, 1, 0, -1], [0, -1, 0, 1]]), "launch", { a: -1.57 }); H.free(2, 4, "boat", {}); H.free(14, 20, "bottle", { soft: 1, find: 1 }); kpTown(H, B, m); } },
    { name: "Leuchtturm Fastnuss", s: "kanal", sky: "day", rows: 26, start: 0, star: "Flaschenpost aufgefischt",
      tx: "Am Leuchtturm Fastnuss zieht eine starke Strömung zu den Felsen. Wer das Ruder nicht legt, treibt ab!",
      build: function (H, B) { var m = H.m; H.cur(6, 18, m);
        [9, 12, 16].forEach(function (r) { H.cell(r, m, "rock", {}); }); H.cell(14, 0, "rock", { dx: .5 }); H.cell(20, -m, "rock", {});
        H.ob("m3", 13 * m, 104, { m: "lhouse", c: "#d8463c" }); H.ob("rock", 13 * m, 104, { a: .3 }); H.ob("rock", 15 * m, 60, {}); H.ob("rock", 14 * m, 140, { a: 1 });
        H.free(3, 5, "bottle", { soft: 1, find: 1 }); H.free(21, 24, "wood", {}); B.push({ k: "land", b0: m * .4, b1: m * 1.3 }); } },
    { name: "Hamslantik: Erster Tag", s: "see", sky: "day", rows: 30, start: 0, atl: 1, star: "Flaschenpost aufgefischt",
      tx: "Offener Ozean bis zum Horizont. Volle Fahrt voraus! Aber auf dem Hamslantik weiß man nie, was als Nächstes kommt.",
      build: function (H) { H.events({ storm: .45, ice: .35, whale: .3 }); [[3, 9], [11, 17], [19, 27]].forEach(function (b) { H.free(b[0], b[1], "wood", { unk: H.R() < .5 }); });
        H.free(4, 14, "bottle", { unk: 1, soft: 1, find: 1 }); H.free(16, 28, "bottle", { unk: 1, soft: 1, find: 1 }); H.free(6, 26, "dolph", { unk: 1, ani: 1, find: 1, soft: 1 }); } },
    { name: "Hamslantik: Zweiter Tag", s: "see", sky: "dawn", rows: 30, start: 0, atl: 1, star: "Flaschenpost aufgefischt",
      tx: "Morgengrauen über dem Hamslantik. Die See ist ruhig, noch.",
      build: function (H) { H.events({ storm: .5, ice: .4, whale: .35 }); [[3, 10], [12, 19], [21, 27]].forEach(function (b) { H.free(b[0], b[1], "wood", { unk: H.R() < .6 }); });
        H.free(5, 16, "bottle", { unk: 1, soft: 1, find: 1 }); H.free(18, 28, "bottle", { unk: 1, soft: 1, find: 1 }); H.mover(8 + Math.floor(H.R() * 14), H.pick([[1, 0, -1], [-1, 0, 1]]), "ship", { once: 1, a: 1.57 }); } },
    { name: "Eisfeld am Abend", s: "eiswarn", sky: "eve", rows: 28, start: 0, star: "Flaschenpost aufgefischt",
      tx: "Funkspruch der Karottonia: Eisfelder auf unserem Kurs. Die Schollen treiben mit dem Wind quer durch die Spuren.",
      build: function (H) { [6, 11, 16, 21].forEach(function (r) { var dir = H.R() < .5 ? 1 : -1; H.mover(r, dir > 0 ? [-1, 0, 1] : [1, 0, -1], "floe", { once: 1 }); });
        H.free(3, 5, "floe", {}); H.free(13, 14, "floe", {}); H.free(23, 26, "floe", {}); H.events({ ice: .4 }); H.free(8, 24, "bottle", { soft: 1, find: 1 }); } },
    { name: "Hamslantik: Die vierte Nacht", s: "eis", sky: "night", rows: 26, start: 0, atl: 1, star: "Flaschenpost aufgefischt",
      tx: "Sternklare Nacht, die See ist spiegelglatt. Im Dunkeln sieht der Ausguck nicht weit.",
      build: function (H) { H.events({ storm: .35, ice: .85 }); H.free(3, 9, "wood", { unk: 1 }); H.free(15, 22, "wood", { unk: 1 }); H.free(5, 22, "bottle", { unk: 1, soft: 1, find: 1 }); } },
    { name: "Wale und ein Schoner in Not", s: "see", sky: "day", rows: 28, start: 0, star: "Fischer gerettet",
      tx: "Fontänen voraus! Eine Walherde kreuzt unseren Kurs. Und am Horizont weht eine Notflagge.",
      build: function (H) { H.mover(6, H.pick([[-1, 0, 1, 0], [1, 0, -1, 0]]), "whale", { inc: 1, ani: 1, find: 1 }); H.mover(12, H.pick([[0, 1, 0, -1], [0, -1, 0, 1]]), "whale", { inc: 1, ani: 1, find: 1 });
        H.task(20, H.m, "schooner"); H.free(15, 18, "wood", {}); H.free(2, 26, "bottle", { soft: 1, find: 1 }); } },
    { name: "Nebel vor Nuss York", s: "nebel", sky: "fog", rows: 26, start: 0, star: "Lotse an Bord",
      tx: "Wieder Nebel, so kurz vor dem Ziel. Am Feuerschiff Ambrösel kommt der Lotse für Nuss York an Bord.",
      build: function (H) { H.task(15, H.m, "light"); [[5, 9], [18, 22]].forEach(function (b) { H.free(b[0], b[1], "fogb", { a: H.R() - .5 }); });
        H.free(3, 7, "wood", { unk: 1 }); H.free(10, 13, "wood", { unk: 1 }); H.free(20, 24, "wood", { unk: 1 }); H.free(3, 24, "bottle", { unk: 1, soft: 1, find: 1 }); } },
    { name: "Hafeneinfahrt Nuss York", s: "ny", sky: "day", rows: 26, start: 0, harbour: 12, star: "Flaschenpost aufgefischt",
      tx: "Die Freiheitshamsterin grüßt! Die Hafeneinfahrt ist voller Fähren, die quer über das Wasser fahren.",
      build: function (H, B) { [5, 11, 17].forEach(function (r, i) { H.mover(r, i % 2 ? [1, 0, -1, 0] : [-1, 0, 1, 0], "ferry", { a: 1.57, ph: Math.floor(H.R() * 4) }); });
        H.free(2, 4, "tug", {}); H.free(14, 16, "tug", {}); H.free(19, 24, "boat", {}); H.free(6, 22, "bottle", { soft: 1, find: 1 });
        H.ob("statue", -26, 120); H.ob("nyb", -16, 300, { sd: 1, wd: 16, hmax: 16 }); H.ob("nyb", 6, 330, { sd: 2, wd: 22, hmax: 24, n: 9 }); B.push({ k: "ny", b: .05, w: 60 }); } },
    { name: "Am Körnerpier 59", s: "ny", sky: "day", rows: 13, start: 0, harbour: 13, endTask: 1, star: "Ohne Rempler festgemacht", ok: function () { return kp.hits === 0; },
      tx: "Ganz Nuss York jubelt am Pier. Jetzt genau davor zum Stehen kommen: mit Stopp in der mittleren Spur direkt vor dem Pier.",
      build: function (H, B) { H.free(3, 5, "tug", {}); H.free(7, 9, "tug", {}); H.ob("pier", 0, 12 * KP_R + 1, { r: 14 }); [-1, 0, 1].forEach(function (L) { H.cell(12, L, "pier", { noObj: 1 }); });
        kp.tasks.push({ row: 12, lane: 0, kind: "pier", stop: [0], rows: [11] });
        H.ob("nyb", -16, 140, { sd: 1, wd: 16, hmax: 16 }); H.ob("nyb", 4, 150, { sd: 2, wd: 18, hmax: 22, n: 9 }); H.ob("nyb", 22, 140, { sd: 3, wd: 14, hmax: 14 }); B.push({ k: "ny", b: 0, w: 80 }); } }
  ];
  function kpLvl() { return KP_LV[kp.li]; }

  // ---- the render state the drawing code of the first game reads ----
  function kpRS() { var d = kpLvl(); return { route: [{ k: "kp", s: d.s }], leg: 0, info: [{}], anc: [{ x: 0, y: 0, h: 0 }], O: [], B: [], px: 0, py: 0, h: 0, lvl: 1, rud: 0, wh: false, glass: null, anim: null,
    shake: 0, fx: [], swim: [], deckIce: null, castOff: 1, intro: false, done: false, found: [], newF: [], d: 0, res: [], hits: 0, tips: 0 }; }
  function kpLaneAt(c, t) { if (!c.seq) return c.lane; var i = t + (c.ph || 0); if (c.once) return i < c.seq.length ? c.seq[i] : null; return c.seq[i % c.seq.length]; }
  function kpBuild(li) {
    var d = KP_LV[li], R = Math.random; kp.cells = []; kp.tasks = []; kp.cur = []; kp.skyR = []; kp.mum = null; cp.O = []; cp.B = [];
    var ob = function (k, x, y, o) { var r = Object.assign({ k: k, x: x, y: y, leg: 0, seen: false, r: 2.6 }, o || {}); cp.O.push(r); return r; };
    var cell = function (row, lane, k, o) { o = o || {}; var c = { row: row, lane: lane, k: k, live: true, need: o.need, soft: o.soft, inc: o.inc, seq: o.seq, once: o.once, ph: o.ph, fogb: k === "fogb", task: o.task };
      var L0 = kpLaneAt(c, 0); if (!o.noObj) c.o = ob(o.model || KP_MODEL[k] || k, (L0 == null ? 3 : L0) * KP_LW + (o.dx || 0), row * KP_R + 2.5, { a: o.a || 0, unk: o.unk, ani: o.ani, find: o.find, net: o.net, big: o.big, cell: c });
      kp.cells.push(c); return c; };
    var H = { R: R, m: R() < .5 ? -1 : 1, ob: ob, cell: cell, pick: function (a) { return a[Math.floor(R() * a.length)]; },
      busyRow: function (row) { return kp.cells.filter(function (c) { return !c.soft && (c.row === row) && (c.seq || true); }).length; },
      taken: function (row, lane) { return kp.cells.some(function (c) { return Math.abs(c.row - row) <= (c.seq ? 1 : 0) && (c.seq || c.lane === lane); }) || kp.tasks.some(function (t) { return Math.abs(t.row - row) <= 2; }); },
      free: function (r0, r1, k, o) { for (var i = 0; i < 60; i++) { var row = r0 + Math.floor(R() * (r1 - r0 + 1)), lane = Math.floor(R() * 3) - 1;
          if (row < 2 || H.taken(row, lane) || (!(o && o.soft) && H.busyRow(row) >= 1)) continue; return cell(row, lane, k, o); } return null; },
      bank: function (L, a, b) { var top = [], bot = [], sa = [], sb = [], y0 = a * KP_R - 1.5, y1 = b * KP_R + 6.5, c = L * KP_LW;
        for (var y = y0 - 4; y <= y1 + 4; y += 2) { var e = Math.max(0, 1 - Math.pow((y - (y0 + y1) / 2) / ((y1 - y0) / 2 + 4), 2)), es = Math.max(0, 1 - Math.pow((y - (y0 + y1) / 2) / ((y1 - y0) / 2 + .5), 2)), w = 3.6 * Math.sqrt(e), ws = 2.8 * Math.sqrt(es) * (1 + Math.sin(y * 1.3) * .1);
          top.push([c - w, y]); bot.push([c + w, y]); sa.push([c - ws, y]); sb.push([c + ws, y]); }
        ob("shoal", 0, 0, { pts: top.concat(bot.reverse()), sand: sa.concat(sb.reverse()) }); for (var r = a; r <= b; r++) cell(r, L, "zone", { noObj: 1 }); },
      task: function (row, lane, kind) { var c = cell(row, lane, kind === "light" ? "light" : kind === "post" ? "post" : kind, { task: 1, a: 0 }); kp.tasks.push({ row: row, lane: lane, kind: kind, cell: c, stop: [lane - 1, lane + 1].filter(function (x) { return x >= -1 && x <= 1; }), rows: [row - 1, row] }); return c; },
      mover: function (row, seq, k, o) { return cell(row, seq[0], k, Object.assign({ seq: seq }, o || {})); },
      cur: function (r0, r1, dir) { kp.cur.push({ r0: r0, r1: r1, dir: dir }); },
      sky: function (row, sk) { kp.skyR.push([row, sk]); },
      events: function (p) { var ev = [];   // the open sea mixes in what it likes: a storm front, an iceberg, a pod of whales
        if (p.storm && R() < p.storm) ev.push("storm"); if (p.ice && R() < p.ice) ev.push("ice"); if (p.whale && R() < p.whale) ev.push("whale");
        if (!ev.length && d.atl) ev.push(H.pick(["storm", "ice", "whale"].filter(function (e) { return p[e]; })));
        ev.forEach(function (e) {
          if (e === "storm") { var s0 = 5 + Math.floor(R() * (d.rows - 16)); H.sky(s0, "storm"); H.sky(s0 + 9, d.sky); }
          if (e === "ice") { for (var i = 0; i < 30; i++) { var row = 8 + Math.floor(R() * (d.rows - 12)), lane = Math.floor(R() * 3) - 1; if (H.taken(row, lane) || H.taken(row + 1, lane) || H.busyRow(row) || H.busyRow(row + 1)) continue; cell(row, lane, "ice", { big: 1 }); cell(row + 1, lane, "ice", { noObj: 1 }); break; } }
          if (e === "whale") { for (var j = 0; j < 30; j++) { var rw = 6 + Math.floor(R() * (d.rows - 10)); if (H.busyRow(rw) || H.taken(rw, 0)) continue; H.mover(rw, H.pick([[-1, 0, 1, 0], [1, 0, -1, 0]]), "whale", { inc: 1, ani: 1, find: 1 }); break; } } }); } };
    d.build(H, cp.B); cp.B.forEach(function (b) { b.leg = 0; }); kp.tasks.sort(function (a, b) { return a.row - b.row; }); kp.skyR.sort(function (a, b) { return a[0] - b[0]; });
  }
  function kpStart(li) {
    kpRadio.hidden = true; var d = KP_LV[li];
    kp = { li: li, row: 0, lane: d.start, tr: null, vis: null, v: 0, t: 0, turns: 0, hits: 0, inc: 0, cells: [], tasks: [], ti: 0, anim: null, pre: "", tips: 3, tip: null, got: [], log: [], gotN: 0, whFirst: false, card: true, moored: li === 0, told: {} };
    cp = kpRS(); cp.px = kp.lane * KP_LW; cp.lvl = 1;
    for (var tries = 0; tries < 40; tries++) { kpBuild(li); var sv = kpSolve(kpState()); if (sv) { kp.par = sv.d + 1; break; } }
    if (!kp.par) kp.par = 12;
    kpPose(0); kpIntro();
  }
  function kpState() { return { row: kp.row, lane: kp.lane, tr: kp.tr ? { from: kp.tr.from, to: kp.tr.to, left: kp.tr.left, tot: kp.tr.tot } : null, ti: kp.ti, trig: kp.mum ? kp.mum.trig : 0, t: kp.t }; }
  function kpSkyAt(r) { var d = kpLvl(), s0 = d.sky; (kp.skyR || []).forEach(function (q) { if (r >= q[0] - .5) s0 = q[1]; }); return s0; }
  function kpSlow(r) { var d = kpLvl(); return r < (d.harbour || 0) ? "harbour" : kpSkyAt(r) === "storm" ? "storm" : ""; }
  function kpCurAt(r) { for (var i = 0; i < (kp.cur || []).length; i++) { var c = kp.cur[i]; if (r >= c.r0 && r < c.r1) return c.dir; } return 0; }

  // ---- the rules, as a pure function: what happens if this order is sailed ----
  function kpHaz(row, L, spd, trig, t) {
    for (var i = 0; i < kp.cells.length; i++) { var c = kp.cells[i]; if (!c.live || c.soft || c.inc || c.row !== row || kpLaneAt(c, t) !== L) continue;
      if (c.k === "mum" && !(spd >= c.need || trig >= c.need)) continue; return c; } return null; }
  function kpSim(st, delta, spd) {
    var T0 = kp.tasks[st.ti || 0], row = st.row, lane = st.lane, tr = null, n = spd === 0 && T0 && T0.kind === "pier" && st.row + 1 >= T0.row ? 0 : KP_N[spd], trig = st.trig || 0, t = st.t || 0, picks = [], miss = [], incs = [], ti = st.ti || 0, drift = 0;
    if (st.tr) { var nl = Math.min(st.tr.left, KP_CH[spd]); tr = { from: st.tr.from, to: st.tr.to, left: nl, tot: st.tr.tot - st.tr.left + nl }; }   // a faster bell cannot make it slower, a slower one finishes it sooner
    var cd = kpCurAt(row); if (cd && !tr && !delta) { drift = cd; delta = cd; }   // in the current: without the rudder laid, the ship drifts one lane
    if (!tr && delta) { var to = kpCl(lane + delta); if (to !== lane) tr = { from: lane, to: to, left: KP_CH[spd], tot: KP_CH[spd] }; }
    if (tr && tr.left <= 0) { lane = tr.to; tr = null; }
    if (kp.mum && spd >= 1 && row <= 5 && row + n >= 4) trig = Math.max(trig, spd);   // passing the Mümmel at speed: our suction pulls her stern out
    for (var k = 1; k <= n; k++) { var r = row + k, occ = tr ? tr.from + Math.round(Math.min(1, (tr.tot - tr.left + .5) / tr.tot) * (tr.to - tr.from)) : lane;   // while gliding across, the ship counts in the lane it is mostly in
      kp.cells.forEach(function (c) { if (!c.live || c.row !== r || kpLaneAt(c, t) !== occ) return; if (c.k === "bottle") (spd < 2 ? picks : miss).push(c); if (c.inc && incs.indexOf(c) < 0) incs.push(c); });
      var h = kpHaz(r, occ, spd, trig, t); if (h) return { picks: picks, miss: miss, incs: incs, row: r - 1, lane: tr ? (occ === tr.from ? tr.to : tr.from) : lane, tr: null, hit: h, hitRow: r, k: k, trig: trig, ti: ti, drift: drift };
      if (tr) { tr.left--; if (tr.left <= 0) { lane = tr.to; tr = null; } } }
    var res = { picks: picks, miss: miss, incs: incs, row: row + n, lane: lane, tr: tr, hit: null, trig: trig, ti: ti, drift: drift }, T = kp.tasks[ti];
    if (T && spd === 0 && !tr && T.rows.indexOf(res.row) >= 0 && T.stop.indexOf(lane) >= 0) res.ti = ti + 1, res.done = T;
    return res;
  }
  function kpTask() { return kp.tasks[kp.ti] || null; }
  function kpGoal(s) { var d = kpLvl(); return d.endTask ? s.ti >= kp.tasks.length : s.row >= d.rows; }
  // the shortest clean way to the end of the level (the first officer's advice, and the timetable)
  function kpSolve(from) {
    var key = function (s) { return s.row + "|" + s.lane + "|" + (s.tr ? s.tr.from + ":" + s.tr.to + ":" + s.tr.left + ":" + s.tr.tot : "-") + "|" + s.ti + "|" + s.trig + "|" + (s.t % 12); }, Q = [{ s: from, f: null, d: 0 }], seen = {};
    seen[key(from)] = 1;
    for (var qi = 0; qi < Q.length && qi < 30000; qi++) { var cur = Q[qi], s = cur.s; if (cur.d > 24) break;
      for (var spd = 2; spd >= 0; spd--) { if (spd === 2 && kpSlow(s.row)) continue; var ds = s.tr ? [0] : [0, -1, 1];
        for (var di = 0; di < ds.length; di++) { var dl = ds[di]; if (dl && kpCl(s.lane + dl) === s.lane && !kpCurAt(s.row)) continue;
          var r = kpSim(s, dl, spd); if (r.hit || r.incs.length) continue;
          var T = kp.tasks[r.ti]; if (T && r.row > T.row) continue;
          var ns = { row: r.row, lane: r.lane, tr: r.tr, ti: r.ti, trig: r.trig, t: s.t + 1 }, f = cur.f || { spd: spd, d: dl };
          if (kpGoal(ns)) return { d: cur.d + 1, f: f };
          var kk = key(ns); if (seen[kk]) continue; seen[kk] = 1; Q.push({ s: ns, f: f, d: cur.d + 1 }); } } }
    return null;
  }

  // ---- where the ship is: the row it has reached and how far across it has moved ----
  function kpLat(rho) { var v = kp.vis; if (!v) return kp.lane * KP_LW; return v.a + (v.b - v.a) * cpSm1((rho - v.r0) / (v.r1 - v.r0)); }
  function kpPose(rho) { cp.px = kpLat(rho); cp.py = rho * KP_R; cp.h = 0; cp.d = rho; }
  function kpPrep(spd, delta) {   // the lane change that this order would start, for the course line and the sailing
    var r = kpSim(kpState(), delta, spd), lat = kpLat(kp.row), to = r.hit ? r.lane : r.tr ? r.tr.to : r.lane, left = r.tr ? r.tr.left + (r.row - kp.row) : 1;
    if (to * KP_LW === lat && !kp.tr) return { a: lat, b: lat, r0: kp.row, r1: kp.row + 1 };
    return { a: lat, b: to * KP_LW, r0: kp.row, r1: kp.row + Math.max(1, r.tr ? left : kp.tr ? Math.min(kp.tr.left, KP_CH[spd]) || 1 : KP_CH[spd] || 1) };
  }

  // ---- one order ----
  function kpGo() {
    if (!kp || kp.anim || kp.card || cp.glass || kp.done) return;
    var spd = cp.lvl, dl = kp.tr ? 0 : cp.rud, fog = kpSkyAt(kp.row) === "fog";
    if (cp.wh) { dzWhistle(kp.t === 0 && kp.li === 0 ? 2.2 : 1.2); if (kp.t === 0) kp.whFirst = true;
      if (fog) { var occ = kpSpan(kp.lane, kp.tr ? kp.tr.to : kpCl(kp.lane + dl)), moved = 0;
        kp.cells.forEach(function (c) { if (!c.fogb || !c.live || c.row <= kp.row || c.row > kp.row + 8 || occ.indexOf(c.lane) < 0) return;
          var fr = [-1, 0, 1].filter(function (L) { return occ.indexOf(L) < 0 && !kpHaz(c.row, L, 0, 0, kp.t); })[0]; if (fr == null) return; c.lane = fr; c.o.tx = fr * KP_LW; moved++; });
        if (moved) setTimeout(function () { kpSay("Ein Fischerboot hat uns gehört und weicht aus!"); }, 700); } }
    var res = kpSim(kpState(), dl, spd), vis = kpPrep(spd, dl);
    if (kp.mum && res.trig > kp.mum.trig) { kp.mum.go = res.trig; kp.mum.from = kp.mum.trig; }
    var n = res.hit ? res.hitRow - kp.row - .45 : res.row - kp.row, v0 = n < .5 ? 0 : Math.min(kp.v, 3 * Math.max(.5, n)), v1 = res.hit ? Math.max(.6, v0) * 1.2 : spd ? n : 0;
    kp.anim = { t0: 0, dur: KP_DUR[spd], spd: spd, r0: kp.row, n: n, v0: v0, v1: v1, res: res, dl: dl, cast: kp.moored, slow: spd === 2 ? kpSlow(kp.row) : "" };
    kp.vis = vis; kp.tip = null; kp.moored = false; kpRadio.hidden = true;
    if (kp.anim.cast) { var b1 = shipW(2.4, .7, 1); cpBurst([b1[0] + 1.8, b1[1], .2], 6, ["#ffffff", "#d8eef8"], 1.4, 3); KP_S.splash(); KP_S.cheer(true); }
    if (res.drift && !dl) setTimeout(function () { kpSay("Die Strömung versetzt uns!"); }, 600);
    dzBell(spd === 0 ? 1 : spd === 1 ? 2 : 3); cpEngine(spd, kp.anim.dur / 1000, .3, kp.lastSpd == null ? 0 : kp.v > 0 ? kp.lastSpd : 0);
    kpPanelDraw(); kpKick();
  }
  function kpStep(t) {
    var A = kp.anim; if (!A.t0) A.t0 = t; if (cp.shake > 0) cp.shake -= .016;
    if (A.crash) { var C = A.crash, ct = t - C.t0, v = cpSm1((ct - 900) / (C.dur - 900)); kpPose(C.rho + (C.back - C.rho) * v); if (ct >= C.dur) kpEndTurn(); return; }
    var u = Math.min(1, (t - A.t0) / A.dur), n = A.n, a = A.v0, b = A.v1, dd = a * u + (3 * n - 2 * a - b) * u * u + (a + b - 2 * n) * u * u * u, rho = A.r0 + dd; kpPose(rho);
    if (kp.mum && kp.mum.go) { var M = kp.mum, ang = [0, -.42, -.7], tgt = ang[M.go], fr = ang[M.from || 0], e = cpSm1((rho - 3.3) / 2.2); M.o.a = fr + (tgt - fr) * e; M.o.x = M.px - 7.4 * Math.sin(M.o.a); M.o.y = M.py - 7.4 * Math.cos(M.o.a); if (!M.told && e > .2) { M.told = 1; beep([[220, .05], [140, .09]]); dzBuzz([30]); kpSay("Unser Sog reißt die Mümmel los!"); } }
    if (A.spd && Math.random() < (A.spd === 2 ? .9 : .45)) { var sd0 = Math.random() < .5 ? -1 : 1, bp = shipW(sd0 * (1.1 + Math.random() * .5), 2.0, .2); cp.fx.push({ x: bp[0], y: bp[1], z: bp[2], vx: sd0 * (1.5 + Math.random() * 1.5), vy: 0, vz: 2 + Math.random() * 2, l: .6, c: Math.random() < .5 ? "#ffffff" : "#d8eef8" }); }
    if (A.slow === "harbour" && !A.wet && u > .3) { A.wet = 1; KP_S.splash(true); setTimeout(function () { noiseShriek(); }, 300); cpBurst([11, cp.py + 6, 1], 14, ["#ffffff", "#d8eef8", "#a8d0e8"], 1.4, 5); }
    if (A.slow === "storm" && !A.wet && u > .45) { A.wet = 1; cp.shake = 1.2; cpBurst(shipW(0, 2.6, 1.6), 70, ["#ffffff", "#d8eef8", "#a8d0e8", "#6aa0c8"], 3, 9); dzNoise(1.2, 500, .6, .35, .02, .8); dzBuzz([100, 50, 100]); kpSay("Ein Brecher geht über das Vorschiff!"); }
    (A.res.picks || []).forEach(function (c) { if (c.live && rho > c.row - .35) { c.live = false; c.o.hid = true; cpBurst([c.o.x, c.o.y, .2], 10, ["#ffffff", "#d8eef8", "#5ab04a"], 1.2, 3); KP_S.splash(); kp.got.push(c); } });
    (A.res.miss || []).forEach(function (c) { if (!c.missed && rho > c.row - .35) { c.missed = 1; kpSay("Zu schnell! Die Flaschenpost treibt vorbei."); } });
    (A.res.incs || []).forEach(function (c) { if (c.live && rho > c.row - .6) { c.live = false; if (c.o) { c.o.scared = performance.now(); } KP_S.splash(true); KP_S.whale(); kpSay("Zu nah! Die Wale tauchen erschrocken ab."); } });
    if (u < 1) return;
    if (A.res.hit) return kpCrash(t);
    kpEndTurn();
  }
  function kpCrash(t) {
    var A = kp.anim, h = A.res.hit, k = h.k, sd = kpLaneAt(h, kp.t) * KP_LW - cp.px; kp.hits++; cp.shake = 1.1; beep([[110, .14], [80, .2], [60, .25]]); dzNoise(.6, 300, .8, .3, .01, .4); dzBuzz([80, 40, 160]);
    kpSay(KP_HITS[k] || CP_HITS[k] || "Rumms!"); KP_S.hit(k);
    var cpt = shipW(Math.max(-1.5, Math.min(1.5, sd * .4)), 2.5, 1.0);
    cpBurst(cpt, 26, k === "zone" ? ["#8a6a4a", "#c8a87a", "#ffffff"] : k === "ice" || k === "floe" ? ["#ffffff", "#d8ecf8", "#a8c8dc"] : k === "rock" || k === "pier" ? ["#8a8478", "#5a544a", "#ffffff"] : ["#8a5a32", "#3a2414", "#c8945a", "#ffffff", "#e8e0d0"], 3.5, 4);
    if (k === "zone") cpBurst(cpt, 30, ["#6a5032", "#8a6a44", "#c8a87a"], 2.5, 3);
    if (k === "ice") { cp.deckIce = []; for (var di = 0; di < 9; di++) cp.deckIce.push([(Math.random() - .5) * 3, -1.2 + Math.random() * 3.2, .15 + Math.random() * .25]); setTimeout(function () { dzBell(3); }, 600); }
    if (/boat|fogb|pilot|tug|launch|ferry|post|tender|schooner/.test(k)) cpSwimmers(shipW(sd >= 0 ? 2.5 : -2.5, 3.5, 0), 2);
    if (h.o && !/zone|rock|ice|pier|mum/.test(k)) { h.o.kT = performance.now(); h.o.kDir = sd >= 0 ? 1 : -1; h.live = false; }
    var settle = A.res.lane, rho = cp.d; kp.vis = { a: cp.px, b: settle * KP_LW, r0: rho, r1: A.res.hitRow - 1 };
    A.crash = { t0: t, dur: 2600, rho: rho, back: A.res.hitRow - 1 };
  }
  function kpEndTurn() {
    var A = kp.anim, r = A.res, d = kpLvl(), msg = "";
    kp.row = r.row; kp.lane = r.lane; kp.tr = r.tr; kp.turns += r.hit ? 2 : 1; kp.t++; kp.lastSpd = A.spd; kp.v = r.hit ? 0 : A.v1;
    if (kp.mum) { kp.mum.trig = Math.max(kp.mum.trig, r.trig); kp.mum.go = 0; }
    if (!kp.tr) kp.vis = { a: kp.lane * KP_LW, b: kp.lane * KP_LW, r0: kp.row, r1: kp.row + 1 };
    var toast = "", acc = function (short, long, say) { kp.log.push(short); msgs.push("✘ " + long); toast = toast || say; }, msgs = [];
    var hn = r.hit && ({ zone: "Auf eine Sandbank gelaufen", rock: "Auf die Felsen gelaufen", ice: "Den Eisberg gestreift", mum: "Die Mümmel gestreift", pier: "Gegen den Pier gerumst" }[r.hit.k] || (KP_NAME[r.hit.k] || "Etwas") + " gerammt");
    if (r.hit) acc(hn, "Unfall: " + (KP_HITS[r.hit.k] || CP_HITS[r.hit.k] || "Rumms!") + " Ein Zug verloren.", "Unfall: " + hn + "!");
    if (A.slow === "harbour") { kp.inc++; acc("Zuschauer nass gespritzt", "Im Hafen zu schnell: Die Bugwelle hat alle Zuschauer am Kai nass gespritzt!", "Platsch! Alle Zuschauer nass gespritzt!"); }
    if (A.slow === "storm") { kp.inc++; acc("Brecher im Sturm", "Im Sturm zu schnell: Ein Brecher ging über das Vorschiff, die Passagiere an Deck sind klatschnass.", "Brecher! Die Passagiere sind klatschnass."); }
    if (r.incs.length) { kp.inc++; acc("Wale verscheucht", "Zu nah an den Walen: Sie sind erschrocken abgetaucht, die Passagiere an der Reling sind enttäuscht.", "Die Wale sind verscheucht!"); }
    if (r.done && kp.ti === r.ti - 1) { var T = r.done, K = KP_TASK[T.kind]; kp.ti = r.ti; msgs.push("✔ " + K.done); KP_S.cheer(); if (T.cell) { T.cell.live = false; T.cell.o.tx = T.cell.o.x + (T.lane >= 0 ? 10 : -10); } beep([[660, .05], [880, .08]]); }
    while (kp.tasks[kp.ti] && kp.row > kp.tasks[kp.ti].row) { var M = kp.tasks[kp.ti]; kp.inc++; kp.miss = (kp.miss || 0) + 1; acc({ pilot: "Lotse verpasst", tender: "Gäste verpasst", post: "Post verpasst", schooner: "Schoner nicht gerettet", light: "Lotse verpasst" }[M.kind] || "Haltepunkt verpasst", KP_TASK[M.kind].miss, KP_TASK[M.kind].miss); kp.ti++; }
    // things that cross the fairway move on to where they will be during the next order
    var hornD = 0; kp.cells.forEach(function (c) { if (c.seq && c.live && (c.k === "ferry" || c.k === "launch" || c.k === "ship") && c.row > kp.row && c.row - kp.row <= 8) hornD = 1; }); if (hornD) setTimeout(KP_S.ferryHorn, 500);
    kp.cells.forEach(function (c) { if (!c.seq || !c.o) return; var L = kpLaneAt(c, kp.t); if (L == null) { if (c.live) { c.live = false; c.o.tx = c.o.x + (c.o.x >= 0 ? 16 : -16); } return; } c.o.tx = L * KP_LW; });
    kp.pre = msgs.join(" "); if (toast) setTimeout(function () { kpSay(toast); }, 100);
    kp.anim = null; cp.wh = false; cp.rud = 0; var gb = kp.got.splice(0);
    if (kpGoal({ row: kp.row, ti: kp.ti })) return kpEnd();
    setTimeout(function () { if (!kp || kp.anim || kp.card) return; if (gb.length) kpBottle(gb[0]); else kpRadioMsg(); }, 350);
    kpPanelDraw(); kpKick();
  }

  // ---- drawing ----
  function kpDraw(t) {
    cpRaf = 0; if (kpRaf) cancelAnimationFrame(kpRaf); kpRaf = 0; if (!kp || !kpOpen || !cp) return;
    if (kp.anim) kpStep(t); if (!kp) return;
    var now = performance.now(), tw = false, sky = cpSky(), storm = sky === "storm" ? 1 : 0;
    cp.O.forEach(function (o) { if (o.tx != null) { o.x += (o.tx - o.x) * .05; if (Math.abs(o.tx - o.x) > .05) tw = true; else { o.x = o.tx; o.tx = null; } } });
    if (kp.anim || cp.glass || tw || cp.fx.length || storm || now < (kp.busy || 0)) kpRaf = requestAnimationFrame(kpDraw);
    if (cp.glass) { cpDrawGlass(t); return; }
    try {
      var sea = cpSeaPic(sky), sh = cp.shake > 0 ? Math.round(Math.sin(t / 30) * 2) : 0, off = (((-cp.h * 160) % 180) + 180) % 180, pitch = Math.round((Math.sin(t / 650) * 3 + Math.sin(t / 1700) * 2) * storm + Math.sin(t / 1400) * .6);
      cpc.setTransform(1, 0, 0, 1, 0, sh); cpc.fillStyle = CP_SEA[sky][0][0]; cpc.fillRect(0, 0, 180, 80); cpc.setTransform(1, 0, 0, 1, 0, sh + pitch);
      cpc.drawImage(sea, Math.round(off) - 180, 0); cpc.drawImage(sea, Math.round(off), 0); cpWater(t, sky, storm);
      cp.B.forEach(function (o) { cpc.save(); cpc.beginPath(); cpc.rect(0, -10, 180, CP_HZ + 11); cpc.clip(); cpBack(cpBW(o), sky); cpc.restore(); });
      cpSkyDraw(sky, t); if (storm) cpWaves(t, 1, sky);
      if (!kp.card && !kp.done) { kpMarks(sky, t); if (!kp.anim) kpCourse(); }
      cp.O.forEach(function (o) { if (o.seen || o.k === "m3" || o.k === "quay" || o.k === "shoal" || o.k === "pier") return; var f = o.y - cp.py; if (f > 0 && f < 15) { var wasHidden = cpHidden(o, f + 30); o.seen = true;   // close by, the lookout sees it with the naked eye
          if (wasHidden && o.cell && !o.cell.soft && !o.cell.inc) KP_S.lookBell(o.k === "ice" ? 3 : 1); if (wasHidden && o.cell && !o.cell.soft && !o.cell.inc) kpSay(o.k === "ice" ? "Ausguck: EISBERG direkt voraus!" : o.k === "wood" ? "Ausguck: Treibholz direkt voraus!" : "Ausguck: Achtung, voraus!"); } });
      if (kp.anim) kpChart();
      cpWorldDraw(t, false); cpGulls(t, sky); cpc.setTransform(1, 0, 0, 1, 0, sh); cpDeck(t); cpDeckIce(); kpRopes();
      if (sky === "fog") for (var fy = 0; fy < 80; fy++) { var al = fy < CP_HZ ? .72 : Math.max(0, .78 - (fy - CP_HZ) / 70); if (al > 0) { cpc.fillStyle = "rgba(226,232,236," + al.toFixed(2) + ")"; cpc.fillRect(0, fy, 180, 1); } }
      if (sky === "night") { cpc.fillStyle = "rgba(8,14,40,.28)"; cpc.fillRect(0, 0, 180, 80); }
      if (storm) { cpc.fillStyle = "rgba(40,50,64,.18)"; cpc.fillRect(0, 0, 180, 80); for (var rn = 0; rn < 40; rn++) { var rx = (rn * 47 + t / 4) % 180, ry = (rn * 31 + t / 2) % 78; mR(cpc, Math.round(rx), Math.round(ry), 1, 2, "#a8b8c8"); } }
      cpBridge(t); kpLamp(t); if (!kp.card) kpHamDraw(t);
      cpc.setTransform(1, 0, 0, 1, 0, 0);
    } catch (err) { if (window.__kpErr) window.__kpErr(err); }
  }
  function kpKick() { kp.busy = performance.now() + 6000; if (!kpRaf) kpRaf = requestAnimationFrame(kpDraw); }
  function kpRedraw() { if (!kpRaf) kpDraw(performance.now()); }
  // faint marks between the lanes, and white streaks where a current runs across
  function kpMarks(sky, t) { var col = sky === "night" ? "rgba(200,220,255,.22)" : sky === "fog" ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.4)", r0 = Math.floor(cp.d);
    for (var r = r0; r < r0 + 11; r++) { for (var hh = 0; hh < 2; hh++) [-.5, .5].forEach(function (m) { var p = cpProj(m * KP_LW, (r + hh * .5) * KP_R + 1); if (p && p.y > CAMV.hz + 1 && p.y < 80) { cpc.fillStyle = col; cpc.fillRect(Math.round(p.x) - (p.sz > 2 ? 1 : 0), Math.round(p.y), p.sz > 2 ? 3 : 1, 1); } });
      var cd = kpCurAt(r); if (cd) for (var j = 0; j < 4; j++) { var x0 = ((j * 6.3 + cd * t / 260) % 24 + 24) % 24 - 12, p2 = cpProj(x0, r * KP_R + 2 + j * 1.7), p3 = cpProj(x0 + cd * 1.6, r * KP_R + 2 + j * 1.7); if (p2 && p3 && p2.y > CAMV.hz && p2.y < 80) for (var xx = Math.min(p2.x, p3.x); xx <= Math.max(p2.x, p3.x); xx++) mR(cpc, Math.round(xx), Math.round(p2.y), 1, 1, "rgba(255,255,255,.55)"); } } }
  // the course this order would sail: a dotted line on the water, one dot more per row
  function kpCourse() { var spd = cp.lvl, vis = kpPrep(spd, kp.tr ? 0 : cp.rud), n = KP_N[spd], keep = kp.vis; kp.vis = vis;
    for (var i = 1; i <= n * 6; i++) { var rho = kp.row + i / 6, p = cpProj(kpLat(rho), rho * KP_R + 2.4); if (p && p.y < 80) mR(cpc, Math.round(p.x) - (p.sz > 2 ? 1 : 0), Math.round(p.y), p.sz > 2 ? 3 : 1, 1, i % 6 === 0 ? "#ffd34a" : "#fff0b0"); }
    var e = kp.row + n, pe = cpProj(kpLat(e), e * KP_R + 2.4), okS = spd === 0 && kpStopOK(e, Math.round(kpLat(e) / KP_LW)); if (pe) mR(cpc, Math.round(pe.x) - 2, Math.round(pe.y) - 1, 5, 3, okS ? "#7ae05a" : spd ? "#ffd34a" : "#d8463c"); kp.vis = keep; }
  function kpRopes() { if (!kp.moored) return; [[[2.2, .7], [11.45, 6.5]], [[2.45, -1.6], [11.45, 1.5]]].forEach(function (r) { var a = shipW(r[0][0], r[0][1], 1.45); cpRope3(a, [r[1][0], cp.py + r[1][1], 1.5], .25, "#e0d0a8"); }); }
  function kpLamp(t) { if (kp.card) return; var x0 = 79, y0 = 72, ln = Math.round(cp.px / KP_LW), tg = kp.tr ? kp.tr.to : kpCl(kp.lane + (kp.anim ? 0 : cp.rud)), blink = Math.floor(t / 280) % 2;
    if (kp.anim && kp.anim.res) tg = kp.anim.res.tr ? kp.anim.res.tr.to : kp.anim.res.lane;
    mR(cpc, x0, y0, 23, 7, "#2a1a10"); mR(cpc, x0 + 1, y0 + 1, 21, 5, "#6a4a2a"); mR(cpc, x0 + 1, y0 + 1, 21, 1, "#c8a040");
    for (var i = -1; i <= 1; i++) { var lx = x0 + 2 + (i + 1) * 7, on = i === ln, nx = i === tg && tg !== ln;
      mR(cpc, lx, y0 + 2, 5, 4, "#1a1008"); mR(cpc, lx + 1, y0 + 3, 3, 2, on ? "#ffd34a" : nx ? (blink ? "#f08a3a" : "#5a3a1a") : "#3a2a1a"); if (on) mR(cpc, lx + 1, y0 + 3, 1, 1, "#fff6c8"); } }
  // rocks: a few stacked, uneven stones with a little surf
  CP_3K.rock = 1;
  var _kpKind = cpKind; cpKind = function (o, w, a, t, k) { if (k !== "rock") return _kpKind(o, w, a, t, k);
    cpPrism(w[0], w[1], a, [[-1.8, -1.3], [.4, -1.9], [2, -.6], [1.7, 1.2], [-.2, 2], [-1.9, .8]], -.1, .5, ["#8a8478", "#a8a090", "#5a544a", "#2a2620"]);
    cpPrism(w[0], w[1], a, [[-1, -.7], [.6, -1.1], [1.2, .2], [.3, 1.1], [-.9, .6]], .5, 1.6, ["#9a9488", "#bab2a2", "#6a6458", "#2a2620"]);
    cpPrism(w[0], w[1], a + .8, [[-.4, -.3], [.4, -.4], [.5, .3], [-.3, .4]], 1.6, 2.1, ["#a8a296", "#c8c0b0", "#7a7468", "#2a2620"]);
    if (Math.floor(t / 500 + w[1]) % 2) { var p = cpProj(w[0] - 1.9, w[1], 0); if (p) mR(cpc, Math.round(p.x) - 1, Math.round(p.y), 3, 1, "#ffffff"); } };


  // ===== sounds of the voyage: the sea all around, gulls, bells, horns, weather, and what each bump sounds like =====
  var KP_S = (function () {
    function A() { return dzAC(); }
    function noise(dur, f0, f1, q, g, att, rel, at, type) { try { var a = A(), t0 = a.currentTime + .02 + (at || 0), n = a.createBufferSource(), buf = a.createBuffer(1, Math.max(1, a.sampleRate * dur), a.sampleRate), d = buf.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; var fl = a.createBiquadFilter(), gn = a.createGain(); fl.type = type || "bandpass"; fl.frequency.setValueAtTime(f0, t0); fl.frequency.exponentialRampToValueAtTime(Math.max(30, f1 || f0), t0 + dur); fl.Q.value = q;
        n.buffer = buf; gn.gain.setValueAtTime(0, t0); gn.gain.linearRampToValueAtTime(g, t0 + (att || .02)); gn.gain.setValueAtTime(g, t0 + Math.max(att || .02, dur - (rel || .1))); gn.gain.linearRampToValueAtTime(0, t0 + dur);
        n.connect(fl); fl.connect(gn); gn.connect(a.destination); n.start(t0); n.stop(t0 + dur + .05); } catch (e) { } }
    function tone(f, dur, g, type, at, f2, att) { try { var a = A(), t0 = a.currentTime + .02 + (at || 0), o = a.createOscillator(), gn = a.createGain(); o.type = type || "sine"; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
        gn.gain.setValueAtTime(.0001, t0); gn.gain.exponentialRampToValueAtTime(g, t0 + (att || .01)); gn.gain.exponentialRampToValueAtTime(.0001, t0 + dur); o.connect(gn); gn.connect(a.destination); o.start(t0); o.stop(t0 + dur + .02); } catch (e) { } }
    function horn(fs, dur, g, at) { try { var a = A(), t0 = a.currentTime + .02 + (at || 0), lp = a.createBiquadFilter(), out = a.createGain(); lp.type = "lowpass"; lp.frequency.value = 700; out.gain.setValueAtTime(0, t0); out.gain.linearRampToValueAtTime(g, t0 + .15); out.gain.setValueAtTime(g, t0 + dur - .25); out.gain.linearRampToValueAtTime(0, t0 + dur);
        lp.connect(out); out.connect(a.destination); fs.forEach(function (f) { var o = a.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; o.connect(lp); o.start(t0); o.stop(t0 + dur + .05); }); } catch (e) { } }
    var S = {
      gull: function (at) { at = at || 0; for (var i = 0; i < 2 + Math.floor(Math.random() * 2); i++) { var b = 1500 + Math.random() * 500; tone(b, .22, .03, "triangle", at + i * .26, b * .72, .03); tone(b * 2, .18, .008, "sine", at + i * .26, b * 1.4); } },
      buoyBell: function () { var f = 880 + Math.random() * 60; tone(f, 1.4, .05, "sine", 0); tone(f * 2.76, .6, .015, "sine", 0); },
      foghorn: function () { horn([98, 147], 2.4, .05); },
      thunder: function () { noise(3.2, 160, 40, .7, .22, .05, 2.4, 0, "lowpass"); noise(.4, 900, 200, .6, .08, .01, .3, .05); },
      whale: function () { tone(220, 1.6, .05, "sine", 0, 330, .4); tone(330, 1.4, .04, "sine", 1.4, 170, .3); noise(.7, 1200, 600, .6, .05, .1, .5, .2); },
      motor: function () { for (var i = 0; i < 8; i++) { tone(62, .09, .07, "triangle", i * .16, 48); noise(.05, 700, 500, 2, .02, .005, .04, i * .16 + .03); } },
      ferryHorn: function () { horn([233, 294], .7, .045); },
      wheel: function () { noise(.18, 380, 260, 3, .07, .01, .12); tone(95, .14, .04, "triangle", 0, 70); },
      splash: function (big) { noise(big ? .9 : .45, 1800, 300, .6, big ? .2 : .1, .01, big ? .7 : .35); },
      clink: function () { tone(2640, .35, .05, "sine", .05); tone(3320, .3, .03, "sine", .12); tone(4400, .2, .015, "sine", .18); },
      radio: function () { noise(.25, 3000, 2600, 1, .05, .01, .2); [0, .12, .24, .48, .6].forEach(function (t, i) { tone(1100, i === 3 ? .2 : .07, .045, "sine", .28 + t); }); },
      cheer: function (big) { var d = big ? 2.6 : 1.6; noise(d, 1100, 900, .7, big ? .14 : .09, .25, .9); noise(d, 2300, 2000, 1.2, big ? .06 : .04, .3, .8); for (var i = 0; i < (big ? 9 : 5); i++) tone(700 + Math.random() * 600, .25, .015, "triangle", .2 + Math.random() * (d - .6), 900 + Math.random() * 500); },
      lookBell: function (n) { for (var i = 0; i < n; i++) { tone(1240, .9, .09, "triangle", i * .38); tone(2480, .4, .03, "sine", i * .38); } },
      lever: function () { noise(.08, 240, 160, 2, .1, .005, .06); tone(160, .08, .05, "square", 0, 110); },
      hit: function (k) {
        if (k === "zone") { noise(1.5, 420, 120, .8, .22, .05, 1, 0, "lowpass"); noise(1.2, 1600, 500, .8, .06, .1, .8, .1); return; }
        if (k === "rock" || k === "pier") { noise(.6, 180, 60, .7, .3, .005, .5, 0, "lowpass"); for (var i = 0; i < 6; i++) noise(.06, 900 + Math.random() * 900, 400, 2, .12, .002, .05, .05 + i * .07); return; }
        if (k === "ice" || k === "floe") { noise(2, 2600, 900, 1.5, .1, .05, 1.4); tone(180, 1.6, .06, "sawtooth", 0, 120, .1); for (var j = 0; j < 7; j++) tone(2000 + Math.random() * 2000, .25, .02, "sine", .3 + j * .2); return; }
        if (k === "wood") { for (var w = 0; w < 5; w++) noise(.05, 2200, 1200, 3, .16, .002, .04, w * .05 + Math.random() * .03); noise(.5, 300, 120, .8, .12, .005, .4, 0, "lowpass"); return; }
        noise(.5, 160, 70, .8, .25, .005, .4, 0, "lowpass"); noise(.35, 700, 300, 1, .08, .005, .3); S.splash(true); }
    };
    // the sea all around: a slow swell of brown noise, and wind on top when it blows
    var amb = null;
    S.ambOn = function () { try { if (amb) return; var a = A(), len = a.sampleRate * 4, b1 = a.createBuffer(1, len, a.sampleRate), b2 = a.createBuffer(1, len, a.sampleRate), d1 = b1.getChannelData(0), d2 = b2.getChannelData(0), last = 0;
        for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; d1[i] = last * 3.5; d2[i] = w; }
        var s1 = a.createBufferSource(), s2 = a.createBufferSource(), lp = a.createBiquadFilter(), g1 = a.createGain(), bp = a.createBiquadFilter(), g2 = a.createGain(), lfo = a.createOscillator(), lg = a.createGain();
        s1.buffer = b1; s2.buffer = b2; s1.loop = s2.loop = true; lp.type = "lowpass"; lp.frequency.value = 520; bp.type = "bandpass"; bp.frequency.value = 1100; bp.Q.value = .5; g1.gain.value = 0; g2.gain.value = 0;
        lfo.frequency.value = .13; lg.gain.value = .025; lfo.connect(lg); lg.connect(g1.gain);
        s1.connect(lp); lp.connect(g1); g1.connect(a.destination); s2.connect(bp); bp.connect(g2); g2.connect(a.destination); s1.start(); s2.start(); lfo.start();
        amb = { s1: s1, s2: s2, g1: g1, g2: g2, lfo: lfo, bp: bp }; } catch (e) { amb = null; } };
    S.ambSet = function (sky, cur) { if (!amb) return; try { var a = A(), t = a.currentTime, st = sky === "storm";
        amb.g1.gain.setTargetAtTime(st ? .16 : cur ? .1 : .06, t, .8); amb.g2.gain.setTargetAtTime(st ? .07 : sky === "fog" ? .012 : cur ? .02 : .004, t, .8); amb.bp.frequency.setTargetAtTime(st ? 900 : 1300, t, .8); } catch (e) { } };
    S.ambOff = function () { if (!amb) return; try { var a = A(); amb.g1.gain.setTargetAtTime(0, a.currentTime, .2); amb.g2.gain.setTargetAtTime(0, a.currentTime, .2); var x = amb; setTimeout(function () { try { x.s1.stop(); x.s2.stop(); x.lfo.stop(); } catch (e) { } }, 900); } catch (e) { } amb = null; };
    return S;
  })();
  // now and then something to hear, depending on where we are
  var kpSfxT = 0;
  function noiseShriek() { for (var i = 0; i < 6; i++) { var f = 900 + Math.random() * 700; dzTone(f, .3, .02, "triangle", i * .07, f * 1.5); } }
  function kpSfxTick() {
    if (!kpOpen || !kp || !cp || kp.card) return; var d = kpLvl(), sky = cpSky(), R = Math.random();
    KP_S.ambSet(sky, kpCurAt(kp.row));
    if (/hafen|reede|ny/.test(d.s) && R < .16) KP_S.gull(); else if (d.s === "kanal" && R < .1) KP_S.buoyBell(); else if (d.s === "kanal" && R < .16) KP_S.gull();
    if (sky === "fog" && Math.random() < .09) KP_S.foghorn();
    if (sky === "storm" && Math.random() < .12) KP_S.thunder();
    kp.cells.forEach(function (c) { if (!c.live || c.row <= kp.row || c.row - kp.row > 7) return; if (c.k === "whale" && Math.random() < .12) KP_S.whale(); if (c.fogb && sky === "fog" && Math.random() < .08) KP_S.motor(); });
  }
  // ---- the chart beside the message: the three lanes and the next twelve rows, as far as we know them ----
  var kpChartCv = null;
  function kpVisRows(sk) { return sk === "fog" ? 2.5 : sk === "storm" ? 3.7 : sk === "night" ? 4.2 : 99; }
  function kpKnown(c, ahead) { var o = c.o; if (!o) return true; if (o.seen) return true; if (o.unk || o.ani) return false; if (c.k === "light") return true; return ahead <= kpVisRows(kpSkyAt(kp.row)); }
  function kpStopOK(row, lane) { var T = kpTask(); return T && T.rows.indexOf(row) >= 0 && T.stop.indexOf(lane) >= 0; }
  function kpChart() {
    var cv = kpChartCv; if (!cv || !kp || !cp) return; var g = cv.getContext("2d"), pos = kp.anim ? cp.d : kp.row, R0 = Math.floor(pos), d = kpLvl(), fr = pos - R0, tt = kp.anim ? kp.t : kp.t;
    var X = function (L) { return 1 + (L + 1) * 8; }, Y = function (r) { return 49 - (r - R0 - fr) * 4; }, F = function (x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
    F(0, 0, 25, 52, "#3a2414"); F(1, 1, 23, 50, "#4a8ac0");
    g.save(); g.beginPath(); g.rect(1, 1, 23, 50); g.clip();
    for (var rr = R0 - 1; rr < R0 + 14; rr++) { var sk = kpSkyAt(rr); if (sk === "storm") F(1, Y(rr) - 3, 23, 4, "#3a5a7a"); if (rr < (d.harbour || 0)) { F(1, Y(rr) - 3, 1, 4, "#e8a03a"); F(23, Y(rr) - 3, 1, 4, "#e8a03a"); } var cd = kpCurAt(rr); if (cd) for (var q = 0; q < 3; q++) F(3 + q * 8 + (cd > 0 ? 2 : 0), Y(rr) - 2, 2, 1, "#c8e8f8"); }
    for (var y = 1; y < 51; y += 2) { F(8, y, 1, 1, "#8ac0e0"); F(16, y, 1, 1, "#8ac0e0"); }
    if (!d.endTask && d.rows - R0 < 14) { var fy = Y(d.rows) - 1; for (var xx = 1; xx < 24; xx++) F(xx, fy, 1, 2, (xx + (fy & 1)) % 2 ? "#ffffff" : "#3a2414"); }
    kp.cells.forEach(function (c) { if (!c.live) return; var a = c.row - kp.row, L = kpLaneAt(c, tt); if (a < -1 || a > 13 || L == null) return; var x0 = X(L), y0 = Y(c.row) - 3;
      if (!kpKnown(c, a)) { F(x0 + 2, y0, 3, 4, "#a8b4c0"); F(x0 + 3, y0 + 1, 1, 1, "#3a4a5a"); return; }
      if (c.k === "zone") return F(x0, y0, 7, 4, "#d8c898");
      if (c.k === "pier") return F(x0 - 1, y0, 9, 4, "#8a6a4a");
      if (c.k === "mum") { if (kp.mum && (kp.mum.trig >= c.need)) return F(x0, y0, 7, 4, "#3a3034"); for (var q2 = 0; q2 < 7; q2 += 2) F(x0 + q2, y0 + (q2 % 4 ? 0 : 2), 1, 2, "#e8a03a"); return; }
      var col = c.task ? "#ffd34a" : c.k === "wood" ? "#8a5a32" : c.k === "rock" ? "#8a8478" : c.k === "ice" || c.k === "floe" ? "#ffffff" : c.k === "whale" ? "#2a3a5a" : c.soft ? "#5ab04a" : c.k === "tug" ? "#7a2418" : "#e04a3c";
      F(x0 + 1, y0 + 1, 5, 3, "#1a1008"); F(x0 + 2, y0 + 1, 3, 2, col);
      if (c.seq) { var nL = kpLaneAt(c, tt + 1); if (nL != null && nL !== L) F(x0 + (nL > L ? 6 : 0), y0 + 2, 1, 1, "#ffd34a"); } });
    var T = kpTask(); if (T && T.kind === "pier") F(X(0) + 1, Y(11) - 2, 5, 3, "#7ae05a");
    if (!kp.anim && !kp.card && !kp.done) { var spd = cp.lvl, vis = kpPrep(spd, kp.tr ? 0 : cp.rud), n = KP_N[spd], keep = kp.vis; kp.vis = vis;
      for (var i = 1; i <= n * 4; i++) { var rho = kp.row + i / 4, lx = 1 + (kpLat(rho) / KP_LW + 1) * 8 + 3; F(lx, Y(rho), 1, 1, "#ffd34a"); }
      var er = kp.row + n, el = kpLat(er) / KP_LW, ok = spd === 0 && kpStopOK(er, Math.round(el)); F(1 + (el + 1) * 8 + 2, Y(er) - 1, 3, 3, ok ? "#7ae05a" : spd ? "#ffd34a" : "#d8463c"); kp.vis = keep; }
    var sx = 1 + (cp.px / KP_LW + 1) * 8 + 1.5; F(sx, 47, 4, 3, "#fff8ec"); F(sx + 1, 46, 2, 1, "#fff8ec");
    g.restore();
  }
  function kpWarn() {
    if (kp.anim || kp.card || kp.done) return ""; var spd = cp.lvl, dl = kp.tr ? 0 : cp.rud, r = kpSim(kpState(), dl, spd), w = [], sl = spd === 2 ? kpSlow(kp.row) : "", T = kpTask();
    if (sl === "harbour") w.push("Volle Fahrt im Hafen: Die Bugwelle spritzt alle Zuschauer nass.");
    if (sl === "storm") w.push("Volle Fahrt im Sturm: Ein Brecher geht über das Vorschiff.");
    if (r.hit && kpKnown(r.hit, r.hitRow - kp.row)) w.push("So rammen wir " + ({ zone: "die Sandbank", mum: "die Mümmel", pier: "den Pier", tug: "den Schlepper", boat: "das Fischerboot", fogb: "das Fischerboot", wood: "das Treibholz", ice: "den Eisberg", floe: "die Eisscholle", rock: "die Felsen", ferry: "die Fähre", launch: "die Barkasse", ship: "den Dampfer", tender: "den Tender", post: "das Postboot", pilot: "das Lotsenboot", schooner: "den Schoner", light: "das Feuerschiff" }[r.hit.k] || "ein Hindernis") + " in " + (r.hitRow - kp.row === 1 ? "der nächsten Reihe" : r.hitRow - kp.row + " Reihen") + "!");
    if (r.incs.length) w.push("So kommen wir den Walen zu nah und verscheuchen sie.");
    if (T && !r.hit && r.row > T.row && !r.done) w.push("So fahren wir am Haltepunkt vorbei.");
    return w.length ? '<span class="kp-warn">⚠ ' + w.join(" ") + '</span>' : ""; }
  // what the lookout reports about the next rows, always true to what lies there now
  function kpReport() {
    var d = kpLvl(), out = [], sky = kpSkyAt(kp.row), seenZ = {};
    if (kp.t === 0 && kp.row === 0) return d.tx;
    if (sky === "storm") out.push("Sturm! Volle Fahrt ist jetzt zu gefährlich.");
    else if (kp.skyR.some(function (q) { return q[1] === "storm" && q[0] > kp.row && q[0] - kp.row <= 6; })) out.push("Eine Sturmfront zieht auf.");
    var cd = kpCurAt(kp.row); if (cd) out.push("Strömung nach " + (cd > 0 ? "rechts" : "links") + "! Ohne Ruder treiben wir eine Spur ab.");
    if (kp.row < (d.harbour || 0)) out.push("Im Hafen langsam fahren.");
    kp.cells.filter(function (c) { return c.live && c.row > kp.row && c.row - kp.row <= 9; }).sort(function (a, b) { return a.row - b.row; }).forEach(function (c) {
      if (out.length >= 3 || c.task) return; var L = kpLaneAt(c, kp.t), a = c.row - kp.row; if (L == null) return;
      if (c.k === "zone") { if (seenZ[L]) return; seenZ[L] = 1; }
      if (c.k === "mum" || c.k === "pier" || (c.k === "ice" && !c.o)) return;
      var nm = kpKnown(c, a) ? (KP_NAME[c.k] || "Etwas") : "Etwas Unbekanntes", wh = c.seq ? "kreuzt gerade " + KP_LANEW[L + 1] : KP_LANEW[L + 1];
      out.push(nm + " " + wh + (a === 1 ? ", direkt voraus." : ", in " + a + " Reihen.")); });
    var T = kpTask(); if (T && T.row - kp.row <= 9 && out.length < 4) out.push((T.kind === "pier" ? "Der Pier" : KP_NAME[T.kind === "light" ? "light" : T.kind]) + (T.kind === "pier" ? "" : " " + KP_LANEW[T.lane + 1]) + (T.row - kp.row <= 1 ? ", direkt voraus." : ", in " + (T.row - kp.row) + " Reihen."));
    return out.length ? out.join(" ") : "Freies Wasser voraus.";
  }
  // ---- a radio message, written down by the radio operator on a little card, when something has to be done next ----
  var kpRadio = document.createElement("div"); kpRadio.className = "kp-radio"; kpRadio.hidden = true; kpEl.appendChild(kpRadio);
  kpRadio.addEventListener("click", function (e) { e.stopPropagation(); kpRadio.hidden = true; });
  function kpRadioShow(head, from, tx, foot, cls) {
    var h = Math.floor(10 + kp.li * 1.3 + kp.t * .3) % 24, mm = (kp.t * 17 + kp.li * 11 + 7) % 60;
    kpRadio.innerHTML = '<div class="kp-r-h ' + (cls || "") + '"><b>' + head + '</b><span>' + (cls ? "aufgefischt" : h + ":" + (mm < 10 ? "0" : "") + mm + ' Uhr') + '</span></div><div class="kp-r-f">von: ' + from + '</div><div class="kp-r-t">' + tx + '</div>' + foot;
    kpRadio.hidden = false; kpRadio.classList.remove("pop"); void kpRadio.offsetWidth; kpRadio.classList.add("pop");
  }
  function kpRadioMsg() {
    var T = kpTask(), d = kpLvl(), m = null, tld = kp.told;
    if (T && T.row - kp.row <= 4 && T.row - kp.row >= 0) { var K = KP_TASK[T.kind], la = KP_LANEA[(T.kind === "pier" ? 0 : T.stop[0]) + 1];
      if (T.kind === "pier") m = { k: "t" + kp.ti + (kp.row + 1 >= 11 ? "b" : "a"), from: K.from, tx: kp.row + 1 >= 11 ? "JETZT STOPP in der mittleren Spur, direkt vor dem Pier!" : "Noch " + (11 - kp.row) + " Reihen bis vor den Pier. Langsam heran, dann STOPP in der mittleren Spur." };
      else { var both = T.stop.length > 1 ? "rechts oder links" : "in der " + la + " Spur"; m = kp.row + 1 >= T.row - 1 ? { k: "t" + kp.ti + "b", from: K.from, tx: K.now + " JETZT STOPP " + (T.stop.length > 1 ? "neben uns" : "in der " + la + " Spur") + ", längsseits." }
        : { k: "t" + kp.ti + "a", from: K.from, tx: "Wir liegen " + (T.row - kp.row) + " Reihen voraus " + KP_LANEW[T.lane + 1] + ". Bitte langsam heran und " + (T.stop.length > 1 ? "neben uns" : "in der " + la + " Spur") + " STOPP." }; } }
    if (!m && kpSkyAt(kp.row) === "fog") kp.cells.forEach(function (c) { if (m || !c.fogb || !c.live || c.told) return; var a = c.row - kp.row; if (a > 0 && a <= 7) { c.told = 1; m = { k: "fog" + c.row, from: "Fischkutter Möwe", tx: "Wir liegen im Nebel vor euch und sehen nichts! Bitte Nebelsignal geben, dann machen wir Platz." }; } });
    if (!m) kp.skyR.forEach(function (q) { if (m || q[1] !== "storm" || tld["s" + q[0]]) return; var a = q[0] - kp.row; if (a > 0 && a <= 6) { tld["s" + q[0]] = 1; m = { k: "s" + q[0], from: "Seewetterwarte", tx: "Sturmwarnung! Die Front erreicht euch in etwa " + a + " Reihen. Im Sturm keine Volle Fahrt." }; } });
    if (!m) kp.cur.forEach(function (c) { if (m || tld["c" + c.r0]) return; var a = c.r0 - kp.row; if (a > 0 && a <= 4) { tld["c" + c.r0] = 1; m = { k: "c" + c.r0, from: "Leuchtturm Fastnuss", tx: "Starke Strömung nach " + (c.dir > 0 ? "Steuerbord" : "Backbord") + "! Wer das Ruder nicht legt, treibt jedes Mal eine Spur Richtung Felsen." }; } });
    if (!m) kp.cells.forEach(function (c) { if (m || c.k !== "whale" || !c.live || tld["w" + c.row]) return; var a = c.row - kp.row; if (a > 0 && a <= 6) { tld["w" + c.row] = 1; m = { k: "w" + c.row, from: "Walfänger Harpune", tx: "Eine Walherde zieht quer über euren Kurs. Abstand halten, sie wechseln ständig die Spur!" }; } });
    if (!m && kp.mum && !kp.mum.trig && kp.row <= 3 && kp.t > 0 && !tld.mum) { tld.mum = 1; m = { k: "mum", from: "Hafenmeister", tx: "Die Mümmel liegt nur lose vertäut. Langsam an ihr vorbei!" }; }
    if (!m) { kpRadio.hidden = true; return; } if (kp.radioK === m.k && !kpRadio.hidden) return; kp.radioK = m.k;
    kpRadioShow("FUNKSPRUCH", m.from, m.tx, '<div class="kp-r-s">notiert: Funker Pieps</div>'); KP_S.radio();
  }
  // ---- a message in a bottle: a little letter and a question for the first officer; ten bottles bring a piece of furniture ----
  var KP_LETTERS = [
    ["Leuchtturmwärter Knabber", "Hier ist es einsam, aber die Möwen sind nett. Grüße an alle, die das lesen!"],
    ["Eine Hamsterdame aus Backentown", "Wenn du das liest, iss etwas Feines auf mein Wohl."],
    ["Kapitän a. D. Schnurrbart", "Ein alter Trick: Frag ruhig deinen Ersten Offizier, er weiß mehr, als er zugibt."],
    ["Die Schiffsjungen der Karottonia", "Uns war langweilig. Wer das findet, schuldet uns eine Sonnenblumenkern-Torte!"],
    ["Ein Fischer vom Kernsund", "Danke, dass ihr nicht durch unsere Netze gefahren seid."],
    ["Oma Knusper", "Zieh dir warme Socken an, auf See ist es zugig."],
    ["Ein Möwenküken", "Pieps! (Wir verstehen es auch nicht, aber es klingt freundlich.)"],
    ["Professor Backenfutter", "Ich messe die Strömung mit Flaschen. Bitte notieren: gefunden!"]];
  function kpBottle(c) {
    var L = KP_LETTERS[Math.floor(Math.random() * KP_LETTERS.length)], gift; kp.tips++; kp.gotN++; s.kpBottles = (s.kpBottles || 0) + 1;
    var LG = cpLog(); LG.bottle = (LG.bottle || 0) + 1; if (cp.found.indexOf("bottle") < 0) cp.found.push("bottle");
    var n10 = s.kpBottles % 10;
    if (n10 === 0) { var g = null; try { if (typeof pickGift === "function") g = pickGift(); } catch (e) { } if (!g) { s.treats = (s.treats || 0) + 5; }
      gift = g ? "Die zehnte Flasche! Darin ein Gutschein: Ein Paket mit einem Möbelstück ist zu " + (typeof N === "function" ? N() : "deinem Hamster") + " unterwegs!" : "Die zehnte Flasche! Darin lagen 5 Leckerli.";
      if (typeof renderNeeds === "function") try { renderNeeds(); } catch (e2) { } }
    else gift = "+1 Frage an den Ersten Offizier · Flaschenpost " + n10 + "/10";
    if (window.SudokuSave) window.SudokuSave();
    kpRadioShow("FLASCHENPOST", L[0], L[1], '<div class="kp-r-g">' + gift + '</div>', "kp-r-bottle"); kp.radioK = "bottle"; KP_S.clink(); if (n10 === 0) KP_S.cheer(true);
  }

  // ---- the captain himself: our own hamster (the game's sprites, one art pixel = one pixel) with a captain's cap;
  //      seen from behind at the wheel, walking on two legs to the telegraph and to the whistle ----
  var kpHm = { x: 90, tx: 90, act: "home", arr: 0, lt: 0, dir: 1 }, kpHI = null;
  function kpHamTo(where) { kpHm.tx = where === "tel" ? Math.round(CP_TELC[0] + 22 * Math.cos(CP_TEL[cp ? cp.lvl : 1] * Math.PI / 180)) + 21 : where === "wh" ? 150 : 90;   /* he stands right beside the lever's knob */ kpHm.act = where; kpHm.arr = 0; if (kp) kpKick(); }
  function kpHamBusy() { return kpHm.x !== 90 || kpHm.tx !== 90 || kpHm.arr || performance.now() - (kpHm.turnT || -9999) < 800; }
  function kpCap(g, side) {   // the cap drawn on top of a sprite canvas (the sprite sits 3 rows down)
    var O = "#2a1a10", W = "#f6f2ea", L = "#ffffff", Sh = "#d6d0c4", B = "#1e1a24", Bh = "#3e3848", Gd = "#e8c040", P = function (x, y, w, c) { g.fillStyle = c; g.fillRect(x, y + 3, w, 1); };
    if (!side) { var rows = [[18, 29], [16, 31], [15, 32], [14, 33], [14, 33], [14, 33], [14, 33]];
      rows.forEach(function (r, k) { var y = k - 3; if (k === 0) return P(r[0], y, r[1] - r[0] + 1, O); P(r[0], y, 1, O); P(r[1], y, 1, O); P(r[0] + 1, y, r[1] - r[0] - 1, k < 3 ? L : W); P(r[1] - 4, y, 3, Sh); });
      P(14, 4, 20, O); P(14, 5, 1, O); P(33, 5, 1, O); P(15, 5, 18, Bh); P(14, 6, 1, O); P(33, 6, 1, O); P(15, 6, 18, B); P(14, 7, 20, O); return; }
    var sr = [[15, 24], [13, 26], [12, 27], [12, 27], [12, 27]];
    sr.forEach(function (r, k) { var y = k - 2; if (k === 0) return P(r[0], y, r[1] - r[0] + 1, O); P(r[0], y, 1, O); P(r[1], y, 1, O); P(r[0] + 1, y, r[1] - r[0] - 1, k < 2 ? L : W); P(r[0] + 1, y, 2, Sh); });
    P(12, 3, 16, O); P(12, 4, 1, O); P(13, 4, 14, Bh); P(12, 5, 1, O); P(13, 5, 14, B); P(24, 4, 2, Gd); P(27, 4, 1, O); P(27, 5, 1, O);
    P(25, 6, 7, O); P(26, 7, 6, B); P(31, 6, 1, O); P(26, 8, 7, O); P(32, 7, 1, O); P(12, 6, 14, O);
  }
  var KP_HAMX = /*KPHAM*/;
  function kpHamLoad() { kpHI = {}; var A0 = Object.assign({}, HAM.art, KP_HAMX.art), Z0 = Object.assign({}, HAM.size, KP_HAMX.size);
    ["back0", "back1"].forEach(function (k) { var w = Z0[k][0], h = Z0[k][1], im = new Image();
      im.onload = function () { [1, -1].forEach(function (dir) { var c = document.createElement("canvas"); c.width = w; c.height = h + 3; var g = c.getContext("2d"); g.imageSmoothingEnabled = false;
          var c0 = document.createElement("canvas"); c0.width = w; c0.height = h + 3; var g0 = c0.getContext("2d"); g0.drawImage(im, 0, 3); kpCap(g0, false);
          [[31, 9, 38], [32, 9, 38], [33, 9, 39], [34, 9, 39]].forEach(function (r) { var y = r[0] + 3; g0.clearRect(0, y, r[1], 1); g0.clearRect(r[2] + 1, y, w - r[2] - 1, 1);   // no paws: the flanks run smoothly down
            g0.fillStyle = "#3a2414"; g0.fillRect(r[1], y, 1, 1); g0.fillRect(r[2], y, 1, 1); g0.fillStyle = "#e9a44c"; g0.fillRect(r[1] + 1, y, 4, 1); g0.fillRect(r[2] - 4, y, 4, 1); });
          if (dir < 0) { g.translate(w, 0); g.scale(-1, 1); } g.drawImage(c0, 0, 0); kpHI[k + (dir < 0 ? "L" : "")] = c; }); if (kp) kpRedraw(); };
      im.src = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" shape-rendering="crispEdges">' + A0[k] + '</svg>'); }); }
  function kpArms(arms) {   // each arm a round furry stroke with a pink paw at the end, 1px outline, drawn outline first so they join cleanly
    arms = arms.map(function (A) { var dx = A[1][0] - A[0][0], dy = A[1][1] - A[0][1], l = Math.hypot(dx, dy), m = 13; return l > m ? [A[0], [A[0][0] + dx / l * m, A[0][1] + dy / l * m]] : A; });   // short hamster arms
    var pts = arms.map(function (A) { var n = Math.max(2, Math.ceil(Math.hypot(A[1][0] - A[0][0], A[1][1] - A[0][1]) / 1.5)), q = []; for (var i = 0; i <= n; i++) q.push([A[0][0] + (A[1][0] - A[0][0]) * i / n, A[0][1] + (A[1][1] - A[0][1]) * i / n]); return q; });
    pts.forEach(function (q) { q.forEach(function (p) { cpBlob(p[0], p[1], 3.1, 3.1, function () { return "#3a2414"; }); }); var e = q[q.length - 1]; cpBlob(e[0], e[1], 3.3, 3.1, function () { return "#3a2414"; }); });
    pts.forEach(function (q) { q.forEach(function (p, i) { cpBlob(p[0], p[1], 2.3, 2.3, function (dx, dy) { return dy < -.3 ? "#f6c88a" : dy > .5 ? "#c88a44" : "#e9a44c"; }); }); var e = q[q.length - 1]; cpBlob(e[0], e[1], 2.4, 2.2, function (dx, dy) { return dy < -.2 ? "#f8c0cc" : "#f4a3b4"; }); });
  }
  function kpHamDraw(t) {
    if (!kpHI) kpHamLoad(); var dt = Math.min(50, t - (kpHm.lt || t)); kpHm.lt = t; var d = kpHm.tx - kpHm.x, walk = Math.abs(d) > .5;
    if (walk) { kpHm.x += Math.sign(d) * Math.min(Math.abs(d), dt * .09); kpHm.dir = d > 0 ? 1 : -1; }
    else { kpHm.x = kpHm.tx; if (kpHm.act !== "home" && !kpHm.arr) kpHm.arr = t; if (kpHm.arr && t - kpHm.arr > 800) { kpHm.arr = 0; kpHm.act = "home"; kpHm.tx = 90; } }
    var home = kpHm.act === "home" && !walk, hop = kpHm.arr && t - kpHm.arr < 400 ? Math.round(Math.sin((t - kpHm.arr) / 400 * Math.PI) * 3) : 0, key;
    var bob = walk ? Math.floor(t / 130) % 2 : 0; key = walk && bob ? "back1" : "back0";   // always seen from behind, a little waddle when he walks
    var im = kpHI[key]; if (im) { var lean = home ? Math.round(cp.wheelA != null ? cp.wheelA * 2 : cp.rud * 1.5) : 0, x = Math.round(kpHm.x - im.width / 2) + lean, y = 140 - im.height - hop - bob;
      // arms only when he works something: both hands on the rim while the wheel turns, one hand out to the lever or the cord
      var hi = home ? 0 : 6, sL = [x + 9, y + 29 - hi], sR = [x + 39, y + 29 - hi], arms = [];
      if (home && (cp.wheelA != null || t - (kpHm.turnT || -9999) < 700)) { var a = cp.wheelA != null ? cp.wheelA : cp.rud * .45, k = Math.max(-3, Math.min(3, Math.round(a * 5))), wg = Math.floor(t / 160) % 2;   // both paws on the rim beside him, a little up and down with the turn, a tiny wiggle
        arms.push([sL, [sL[0] - 9, sL[1] - 3 - k + wg]], [sR, [sR[0] + 9, sR[1] - 3 + k + wg]]); }
      if (!walk && kpHm.arr && kpHm.act === "tel") { var ta = CP_TEL[cp.lvl] * Math.PI / 180; arms.push([sL, [CP_TELC[0] + 22 * Math.cos(ta), CP_TELC[1] + 22 * Math.sin(ta) + (hop ? 1 : 0)]]); }   // to the lever's knob
      if (!walk && kpHm.arr && kpHm.act === "wh") arms.push([sR, [168, 98 + (hop ? 3 : 0)]]);
      if (arms.length) kpArms(arms); cpc.drawImage(im, x, y); }   // the arms first, the body in front of them
    if (kpHamBusy()) kpKick();
  }
  // ---- panel and cards ----
  function kpSay(t) { kpToast.textContent = t; kpToast.hidden = false; kpToast.classList.remove("pop"); void kpToast.offsetWidth; kpToast.classList.add("pop"); clearTimeout(kpSay.t); kpSay.t = setTimeout(function () { kpToast.hidden = true; }, 1800); }
  function kpTipTxt(f) { var to = kpCl(kp.lane + f.d), sp = ["Stopp", "Halbe Fahrt", "Volle Fahrt"][f.spd], cd = kpCurAt(kp.row), ln = kp.tr ? "das Ruder liegen lassen" : cd && f.d === -cd && to === kp.lane ? "gegen die Strömung halten" : cd && !f.d ? "mit der Strömung treiben lassen" : to === kp.lane ? "die Spur halten" : "in die " + KP_LANEA[to + 1] + " Spur"; return sp + " und " + ln + "."; }
  function kpPanelDraw() {
    if (!kp || !cp) return; var d = kpLvl(), busy = !!kp.anim, h = "";
    h += '<div class="dz-plan kp-lvls"><b class="kp-lt cur">' + (kp.li + 1) + '</b><span class="kp-ln">' + d.name + '</span></div>';
    if (cp.glass) h += '<div class="dz-row"><div class="dz-msg">Zum Umsehen ziehen · am Ring des rechten Glases drehen, bis die beiden Hälften in der Mitte zusammenpassen</div><button type="button" class="dz-go cap-glx">Zurück</button></div>';
    else { var tr = kp.tr ? '<span class="kp-tr">Spurwechsel läuft noch ' + kp.tr.left + (kp.tr.left === 1 ? " Reihe" : " Reihen") + ', das Ruder liegt fest.</span>' : "",
        tip = kp.tip ? '<span class="cap-tipsay">Erster Offizier: „' + kp.tip + '“</span>' : "",
        foot = '<span class="cap-foot"><span class="cap-clock">⏱ Zug ' + kp.turns + ' · Plan ' + kp.par + '</span>' + (!busy && !kp.done && !kp.tip ? '<button type="button" class="ch cap-tip"' + (kp.tips > 0 ? "" : " disabled") + '>Offizier fragen ' + (kp.tips <= 3 ? "●".repeat(kp.tips) + "○".repeat(3 - kp.tips) : "●×" + kp.tips) + '</button>' : "") + '</span>';
      h += '<div class="dz-row"><canvas class="kp-chart" width="25" height="52" aria-label="Seekarte"></canvas><div class="dz-msg cap-msg2">' + (kp.pre ? '<span class="dz-d">' + kp.pre + '</span> ' : "") + '<span class="kp-note">' + kpReport() + '</span>' + kpWarn() + tr + tip + foot + '</div><button type="button" class="dz-go cap-go"' + (busy ? " disabled" : "") + '>Los!</button></div>'; }
    if (cp.glass) kpRadio.hidden = true; kpPanel.innerHTML = h; kpChartCv = kpPanel.querySelector(".kp-chart"); kpChart(); kpGl.hidden = !!(busy || kp.card || kp.done); kpGl.classList.toggle("on", !!cp.glass);
  }
  function kpStars() { var d = kpLvl(), third = d.ok ? d.ok() : kp.tasks.length ? !kp.miss : kp.gotN > 0; return [kp.hits + kp.inc === 0, kp.turns <= kp.par, !!third]; }
  function kpMenu() {
    kp.card = true; var best = s.kpStars || {};
    kpCard.innerHTML = '<div class="fi-c dz-intro"><p class="fi-h">Kapitän der Pausbacke</p><p class="dz-route">Southamsterton → Nuss York</p>' +
      '<div class="kp-grid">' + KP_LV.map(function (L, i) { var b = best[i] || 0; return '<button type="button" data-lv="' + i + '" title="' + L.name + '"><b>' + (i + 1) + '</b><small>' + "★".repeat(b) + "☆".repeat(3 - b) + '</small></button>'; }).join("") + '</div>' +
      '<p class="fi-s kp-bot">Flaschenpost: ' + ((s.kpBottles || 0) % 10) + '/10 bis zum nächsten Möbelstück</p></div>';
    kpCard.hidden = false; kpPanel.innerHTML = ""; kpGl.hidden = true;
  }
  function kpIntro() { var d = kpLvl(); kp.card = true;
    kpCard.innerHTML = '<div class="fi-c dz-intro"><p class="fi-h">' + d.name + '</p><p class="dz-route">Etappe ' + (kp.li + 1) + ' von 15 · Plan: ' + kp.par + ' Züge</p><p class="fi-s">' + d.tx + '</p>' +
      '<p class="fi-s">★ Sauber gefahren<br>★ Im Plan (' + kp.par + ' Züge)<br>★ ' + d.star + '</p><div class="fi-row"><button type="button" class="fi-b2" data-a="menu">Übersicht</button><button type="button" class="fi-b" data-a="go">' + (kp.li === 0 ? "Leinen los!" : "Los geht's") + '</button></div></div>';
    kpCard.hidden = false; kpPanelDraw(); kpRedraw(); }
  function kpEnd() { kp.done = true; var st = kpStars(), n = st.filter(Boolean).length, d = kpLvl(), last = kp.li + 1 >= KP_LV.length; s.kpStars = s.kpStars || {}; s.kpStars[kp.li] = Math.max(s.kpStars[kp.li] || 0, n); if (window.SudokuSave) window.SudokuSave();
    kpCard.innerHTML = '<div class="fi-c dz-intro"><p class="fi-h">' + (last ? "Angekommen in Nuss York!" : n === 3 ? "Meisterhaft!" : "Geschafft!") + '</p><p class="dz-route">' + "★".repeat(n) + "☆".repeat(3 - n) + '</p>' +
      '<p class="fi-s">' + (st[0] ? "★" : "☆") + " Sauber gefahren" + (kp.log.length ? ": " + kp.log.join(", ") : "") + '<br>' + (st[1] ? "★" : "☆") + " " + kp.turns + " Züge, Plan " + kp.par + '<br>' + (st[2] ? "★" : "☆") + " " + d.star + '</p>' +
      '<div class="fi-row"><button type="button" class="fi-b2" data-a="menu">Übersicht</button><button type="button" class="fi-b2" data-a="again">Nochmal</button>' + (!last ? '<button type="button" class="fi-b" data-a="next">Weiter</button>' : "") + '</div></div>';
    kpCard.hidden = false; kp.card = true; kpPanelDraw(); kpRedraw(); if (n >= 2 || last) dzWhistle(last ? 2.4 : 1.6); if (last || d.endTask) KP_S.cheer(true); beep(n === 3 ? [[523, .08], [659, .08], [784, .12]] : [[523, .08], [659, .1]]); }
  kpCard.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b || !kp) return; e.stopPropagation();
    if (b.dataset.lv != null) { kpStart(+b.dataset.lv); return; }
    var a = b.dataset.a; if (a === "go") { kp.card = false; kpCard.hidden = true; kpPanelDraw(); kpRedraw(); setTimeout(kpRadioMsg, 500); KP_S.ambOn(); KP_S.ambSet(cpSky(), 0); if (/hafen|reede|ny/.test(kpLvl().s)) KP_S.gull(.4); if (!kpSfxT) kpSfxT = setInterval(kpSfxTick, 1600); return; }
    if (a === "again") return kpStart(kp.li); if (a === "next") return kpStart(kp.li + 1); if (a === "menu") { kpMenu(); return; } });
  kpPanel.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b || !kp || kp.anim || kp.card) return; e.stopPropagation();
    if (b.classList.contains("cap-glx")) { cpGlass(false); return; }
    if (b.classList.contains("cap-tip")) { if (kp.tips > 0) { var sv = kpSolve(kpState()); kp.tips--; kp.tip = sv ? kpTipTxt(sv.f) : "Da kommen wir nicht mehr ohne Rumms durch."; beep([[660, .05], [880, .06]]); kpPanelDraw(); } return; }
    if (b.classList.contains("cap-go")) kpGo(); });
  kpGl.addEventListener("click", function (e) { e.stopPropagation(); if (!kp || kp.anim || kp.card || kp.done) return; cpGlass(!cp.glass, 0); });

  // ---- input on the bridge: telegraph, wheel (drag or tap a side), whistle handle, binoculars ----
  var kpWh = null, kpTel = 0, kpRing = null, kpPanG = null;
  function kpPt(e) { var r0 = kpCv.getBoundingClientRect(); return [(e.clientX - r0.left) / r0.width * 180, (e.clientY - r0.top) / r0.height * 135]; }
  function kpSetRud(r) { var lim0 = Math.max(-1, -1 - kp.lane), lim1 = Math.min(1, 1 - kp.lane); if (kpCurAt(kp.row)) { lim0 = -1; lim1 = 1; } r = Math.max(lim0, Math.min(lim1, r)); if (r !== cp.rud) { cp.rud = r; KP_S.wheel(); kpHm.turnT = performance.now(); kpPanelDraw(); kpKick(); } kpRedraw(); }
  kpCv.addEventListener("pointerdown", function (e) {
    if (!kp || kp.anim || kp.card || kp.done) return; e.preventDefault(); var pp = kpPt(e);
    if (cp.glass) { var rd = Math.hypot(pp[0] - 114, pp[1] - 64);
      if (rd > 38 && rd < 62 && Math.hypot(pp[0] - 66, pp[1] - 64) > 40) { kpRing = { a0: Math.atan2(pp[1] - 64, pp[0] - 114) }; cp.glass.ring = 1; } else kpPanG = { x: pp[0], y0: cp.glass.yaw };
      try { kpCv.setPointerCapture(e.pointerId); } catch (er) { } return; }
    if (Math.hypot(pp[0] - CP_TELC[0], pp[1] - CP_TELC[1]) < CP_TELR + 8) { kpTel = 1; var lv0 = cp.lvl; cpTelSet(pp); if (cp.lvl !== lv0) { KP_S.lever(); kpHamTo("tel"); } try { kpCv.setPointerCapture(e.pointerId); } catch (er) { } return; }
    if (Math.hypot(pp[0] - CP_WHC[0], pp[1] - CP_WHC[1]) < 42) { if (kp.tr) { kpSay("Das Ruder liegt fest, bis der Spurwechsel fertig ist."); return; } kpWh = { a0: Math.atan2(pp[1] - CP_WHC[1], pp[0] - CP_WHC[0]), r0: cp.rud, x0: pp[0], mv: 0 }; try { kpCv.setPointerCapture(e.pointerId); } catch (er) { } return; }
    if (pp[0] > 160 && pp[1] > 84 && pp[1] < 114) { cp.wh = !cp.wh; kpHamTo("wh"); if (cp.wh) setTimeout(function () { dzWhistle(.8); }, 450); else beep([[300, .03]]); kpRedraw(); return; }
    var best = null, bd = 99;
    cp.O.forEach(function (o) { if (o.hid || o.seen || o.k === "quay" || o.k === "shoal" || o.k === "m3") return; var p = cpProj(o.x, o.y); if (!p || p.f > 70 || !cpHidden(o, p.f)) return; var dd = Math.hypot(p.x - pp[0], (p.y - 5 - pp[1]) * 1.4); if (dd < bd) { bd = dd; best = o; } });
    if (best && bd < 16) { var rr = cpRel(cp.px, cp.py, cp.h, best.x, best.y); cpGlass(true, Math.atan2(rr[1], rr[0])); }
  });
  kpCv.addEventListener("pointermove", function (e) { if (!kp) return; var pp = kpPt(e);
    if (kpRing && cp.glass) { var an = Math.atan2(pp[1] - 64, pp[0] - 114), da = an - kpRing.a0; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; kpRing.a0 = an; var nf = Math.max(3, Math.min(70, cp.glass.foc + da * 9)); if (Math.floor(nf / 2) !== Math.floor(cp.glass.foc / 2)) beep([[700 + nf * 4, .01]]); cp.glass.foc = nf; return; }
    if (kpPanG && cp.glass) { cp.glass.yaw = Math.max(-1.5, Math.min(1.5, kpPanG.y0 - (pp[0] - kpPanG.x) / 480)); return; }
    if (kpTel) { var lv1 = cp.lvl; cpTelSet(pp); if (cp.lvl !== lv1) kpHamTo("tel"); return; }
    if (kpWh) { var a = Math.atan2(pp[1] - CP_WHC[1], pp[0] - CP_WHC[0]), d = a - kpWh.a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; if (Math.abs(d) > .12) kpWh.mv = 1;
      if (kpWh.mv) { cp.wheelA = Math.max(-1.1, Math.min(1.1, kpWh.r0 * .45 + d)); kpSetRud(Math.round(cp.wheelA / .5)); } } });
  function kpUp(e) { if (kpWh && !kpWh.mv && kp) kpSetRud(cp.rud + (kpWh.x0 < CP_WHC[0] ? -1 : 1));   // a tap on the left or right half of the wheel: one lane that way
    if (kpRing && cp && cp.glass) cp.glass.ring = 0; kpWh = null; kpTel = 0; kpRing = null; kpPanG = null; if (cp) cp.wheelA = null; if (kp) kpRedraw(); }
  kpCv.addEventListener("pointerup", kpUp); kpCv.addEventListener("pointercancel", kpUp);

  // ---- opening and closing; the first game's drawing hooks hand over while this one runs ----
  var _kpDraw0 = cpDraw, _kpRedraw0 = cpRedraw, _kpPanel0 = cpPanelDraw, _kpSay0 = cpSay, _kpSky0 = cpSky, _kpHid0 = cpHidden;
  cpDraw = function (t) { if (kpOpen) return kpDraw(t); return _kpDraw0(t); };
  cpRedraw = function () { if (kpOpen) return kpRedraw(); return _kpRedraw0(); };
  cpPanelDraw = function () { if (kpOpen) return kpPanelDraw(); return _kpPanel0(); };
  cpSay = function (t) { if (kpOpen) return kpSay(t); return _kpSay0(t); };
  cpSky = function (i) { if (kpOpen && kp && kp.skyR && cp) return kpSkyAt(cp.d || 0); if (kpOpen && kp && kp.li != null) return KP_LV[kp.li].sky; return _kpSky0(i); };
  cpHidden = function (o, f) { if (!kpOpen) return _kpHid0(o, f); if (o.ani || o.unk) return !o.seen; if (o.k === "light" || o.seen) return false; var sk = cpSky(); return sk === "fog" ? f > 20 : sk === "storm" ? f > 30 : sk === "night" ? f > 34 : false; };
  function kpGame() { return new Promise(function (resolve) { kpOpen = true; cpc = kpc; kpEl.hidden = false; kpPanel.style.display = "block"; kpStart(0); kp.resolve = resolve; kpMenu(); kpRedraw(); }); }
  function kpClose() { if (!kpOpen) return; var r = kp && kp.resolve; kpOpen = false; cancelAnimationFrame(kpRaf); kpRaf = 0; kpEl.hidden = true; kpCard.hidden = true; kpToast.hidden = true; kpRadio.hidden = true; kpPanel.style.display = "none"; cpc = kpC0; KP_S.ambOff(); clearInterval(kpSfxT); kpSfxT = 0; kp = null; cp = null; if (r) r(); }
  var _kpStart0 = kpStart; kpStart = function (li) { var r = kp && kp.resolve; _kpStart0(li); kp.resolve = r; };
  kpEl.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); kpClose(); });
  var _kp_int = interrupt; interrupt = function () { if (kpOpen && !window.__resume) kpClose(); return _kp_int.apply(this, arguments); };
  capGame = kpGame;
  window.__cap2 = { lv: function (i) { kpStart(i); kp.card = false; kpCard.hidden = true; kpPanelDraw(); kpRedraw(); }, st: function () { return kp && { li: kp.li, row: kp.row, lane: kp.lane, tr: kp.tr, t: kp.t, turns: kp.turns, par: kp.par, hits: kp.hits, inc: kp.inc, ti: kp.ti, tasks: kp.tasks.length, done: !!kp.done, anim: !!kp.anim, card: !!kp.card, got: kp.gotN, sky: cpSky(), found: cp && cp.found.slice(), seen: cp && cp.O.filter(function (o) { return o.unk && o.seen; }).length, rep: kpReport() }; },
    solve: function () { var r = kpSolve(kpState()); return r && r.f; }, ham: function (w) { kpHamTo(w); }, hamDbg: function () { return { keys: kpHI && Object.keys(kpHI), hm: kpHm }; }, set: function (o) { if (o.d != null) cp.rud = o.d; if (o.spd != null) cp.lvl = o.spd; if (o.wh != null) cp.wh = o.wh; kpPanelDraw(); kpRedraw(); }, go: function () { kpGo(); },
    glass: function (yaw, foc) { cpGlass(true, yaw); if (foc != null) cp.glass.foc = foc; }, seeAll: function () { cp.O.forEach(function (o) { o.seen = true; }); kpRedraw(); },
    lvls: function () { return KP_LV.length; }, layout: function () { return kp.cells.map(function (c) { return [c.row, c.lane, c.k, c.seq ? 1 : 0]; }).concat([["sky", kp.skyR], ["cur", kp.cur]]); } };
