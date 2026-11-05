  // ===================== the captain of the MS Pausbacke (preview, turn based) =====================
  // The same maiden voyage the stoker makes, the same timetable (dzRoute), seen from the bridge.
  // One leg per turn: the telegraph (Stopp / Halbe / Volle), the wheel and, when it is called for, the whistle.
  // A yellow line on the water shows the curve the ship will sail through the whole leg. "Los!" sails it: the ship turns,
  // the view swings round. Every leg is a little scene: the docks, the drifting Mümmel, the fairways between buoys,
  // the pilot, the fishing fleet, the roads with their tenders, fog, ice, whales, a schooner in distress, the sister ship,
  // the statue and the pier. Far out things only shimmer until the binoculars are put on them (the logbook).
  var CP_K = .02;                                                        // turn rate per rudder step and sea mile unit
  var CP_DIST = [9, 34, 46];                                             // how far a leg carries the ship at Stopp (coasting), Halbe, Volle
  var CP_NAME = { whale: "Finnwal", dolph: "Delfine", seal: "Robbe auf der Scholle", bottle: "Flaschenpost", gull: "Möwenschwarm", orca: "Schwertwal", bear: "Eisbär auf der Scholle" };
  var CP_ANI = ["whale", "dolph", "seal", "bottle", "gull", "orca", "bear"];
  var CP_TX = {
    abfahrt: "Southamsterton, 10. April, Mittag: Leinen los! Drei lange Töne mit der Pfeife (Griff rechts), dann vorsichtig zwischen den Kaimauern hinaus.",
    newyork: "Achtung! Der Sog der Pausbacke reißt die Mümmel von ihren Leinen, ihr Heck schwenkt auf uns zu! Je schneller wir sind, desto stärker zieht der Sog.",
    solent: "Durch den Kernsund an der Isle of Weizen vorbei. Die Fahrrinne biegt nach links: zwischen den Tonnen bleiben.",
    lotse: "Beim Feuerschiff Knabber kommt das Lotsenboot längsseits. Der Lotse geht von Bord.",
    kanal: "Offenes Wasser im Pfotenkanal. Freie Fahrt nach Frankreich!",
    fischer: "Eine Flotte Fischerboote liegt im Weg. Vorsichtig, und auf der freien Seite vorbei.",
    cherbourg: "Schnüffelbourg am Abend: Wir ankern auf der Reede, die Tender bringen neue Gäste.",
    cherAus: "Anker auf! Mit der Pfeife verabschieden und vorsichtig aus der Reede. Die Rinne biegt nach rechts.",
    irisch: "Über die Irische Knuspersee nach Backentown. Weites, freies Wasser.",
    queens: "Backentown, 11. April: Wieder auf der Reede. Die Tender kommen mit Post und Gästen längsseits.",
    queAus: "Vorbei am Leuchtturm Fastnuss hinaus aufs Meer. Pfeife zum Abschied, die Rinne biegt nach links.",
    see1: "Der Hamslantik! Freie See bis zum Horizont, westwärts.", see2: "Ruhige See, alle Kessel arbeiten. Freie Fahrt.", see3: "Weiter westwärts über freie See.",
    nebel1: "Nebel über der Neufutterlandbank! Langsam fahren und mit der Pfeife warnen. Da vorne ist ein Schatten …",
    nebel2: "Noch immer dichter Nebel. Langsam, mit Nebelsignal.",
    klar: "Der Nebel lichtet sich: wieder freie See!",
    eiswarn: "14. April, Funkspruch der Karottonia: Eis voraus! Schollen treiben im Wasser, also langsamer.",
    eis: "23:40 Uhr, der Ausguck läutet dreimal: Eisberg direkt voraus! Maschinen stopp und hart Ruder!",
    morgen: "Geschafft! Im Morgengrauen liegt wieder freie See vor uns.",
    wale: "Finnwale kreuzen den Kurs! Langsam, damit sie Platz haben. Schau sie dir mit dem Fernglas an.",
    sos: "Ein Fischerschoner zeigt Notflaggen! Wir halten an und schicken ein Rettungsboot hinüber.",
    gruss: "Am Horizont die Backentasche, unser Schwesterschiff! Gruß mit der Pfeife, freie See.",
    ambrose: "Das Feuerschiff Ambrösel vor Nuss York. Der Lotse kommt an Bord, ab jetzt langsamer.",
    quar: "Vor Futter Island kommen die Ärzte der Quarantäne längsseits.",
    liberty: "Die Freiheitshamsterin! Ein Gruß mit der Pfeife, langsam in den Hafen. Die Einfahrt biegt nach rechts.",
    pier: "Der Körnerpier 59 liegt vor uns. Pfeife zur Begrüßung, dann an der Pier stoppen."
  };
  var CP_HITS = { ship: "Rumms! Die Mümmel gestreift!", gate: "Auf Grund gelaufen! Zwischen den Tonnen bleiben.", quay: "Rumms an die Kaimauer!", pier: "Rumms an die Pier!", ice: "Rumms! Der Eisberg!", floe: "Rumms! Eine Scholle!", wood: "Rumms! Treibholz!", boat: "Rumms! Ein Fischerboot!", pilot: "Rumms! Das Lotsenboot!", tender: "Rumms! Der Tender!", schooner: "Rumms! Der Schoner!", light: "Rumms! Das Feuerschiff!" };
  var cpEl = xEl("div", "bee-pov fi-pov cap-pov", scene); cpEl.hidden = true;
  cpEl.innerHTML = '<canvas width="180" height="135" class="fi-cv cap-cv"></canvas><div class="fi-card" hidden></div><div class="cap-toast" hidden></div><button type="button" class="bp-x" aria-label="Brücke verlassen">×</button>';
  var cpCv = cpEl.querySelector(".cap-cv"), cpc = cpCv.getContext("2d"); cpc.imageSmoothingEnabled = false;
  var cpCard = cpEl.querySelector(".fi-card"), cpToast = cpEl.querySelector(".cap-toast");
  var cpPanel = document.createElement("div"); cpPanel.className = "cap-panel"; scene.parentNode.insertBefore(cpPanel, scene.nextSibling);
  var cp = null, cpRaf = 0, cpOpen = false;
  function cpLog() { if (!s.capLog) s.capLog = {}; return s.capLog; }
  function cpRnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cpHash(a, b) { var h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
  // the curve of one leg: start at 0,0 heading north, the heading turns evenly with the distance sailed
  function cpPath(rud, d) { var w = CP_K * rud; if (!w) return [0, d, 0]; return [(1 - Math.cos(w * d)) / w, Math.sin(w * d) / w, w * d]; }
  function cpDistU(lvl, S, u) { return lvl ? S * u : S * (1 - (1 - u) * (1 - u)); }
  function cpLeg() { return cp.route[cp.leg]; }
  function cpNeed() { return cp.ev ? 1 : DZ_ORD[cpLeg().o].l; }
  function cpSky(i) { if (i == null) i = cp.leg; i = Math.min(i, cp.route.length - 1); var L = cp.route[i], k = L.s, ev = cp.info[i] && cp.info[i].ev; if (cp.arrNight && (k === "feuerschiff" || k === "quar" || k === "liberty" || k === "ny")) return "night";
    return ev ? "storm" : k === "nebel" ? "fog" : k === "eiswarn" ? "eve" : k === "eis" ? "night" : k === "morgen" ? "dawn" : "day"; }

  // ---- the scene of a leg: what floats on the water (O) and what stands on the horizon (B) ----
  function cpW(A, lx, ly) { return [A.x + lx * Math.cos(A.h) + ly * Math.sin(A.h), A.y - lx * Math.sin(A.h) + ly * Math.cos(A.h)]; }
  function cpBuild(li) {
    var L = cp.route[li], k = L.k, sc = L.s, O = [], B = [], R = Math.random, side = R() < .5 ? 1 : -1, IN = { ev: null, extra: "" };
    if (sc === "see" && li - cp.lastEv > 3 && R() < .3) { IN.ev = "sturm"; cp.lastEv = li; }
    cp.info[li] = IN;
    var ob = function (kk, x, y, o) { var r = Object.assign({ k: kk, x: x, y: y }, o || {}); O.push(r); return r; };
    var gates = function (dir) { [12, 22, 31].forEach(function (d) { var p = cpPath(dir, d), rx = Math.cos(p[2]), ry = -Math.sin(p[2]);
      ob("buoyR", p[0] - rx * 3.6, p[1] - ry * 3.6); ob("buoyG", p[0] + rx * 3.6, p[1] + ry * 3.6); ob("gate", p[0], p[1], { r: 3.5, gate: 1, hid: 1 }); }); };
    var animal = function (pool) { ob(cpRnd(pool), (R() < .5 ? -1 : 1) * (3 + R() * 6), 42 + R() * 10, { ani: 1 }); };
    if (k === "abfahrt") { ob("quay", 4, 0, { y0: -30, y1: 22, crowd: 1 }); ob("quay", -11, 0, { y0: -30, y1: 26, crowd: 1 });
      ob("m3", 10, 1, { m: "shed", w: 6, l: 20 }); ob("m3", -17, 7, { m: "shed", w: 7, l: 16 }); ob("m3", 6.2, 15, { m: "crane", side: 1 }); ob("m3", -13.2, 19, { m: "crane", side: -1 });
      ob("m3", 5.4, 21.2, { m: "lhouse", c: "#d8463c" }); ob("m3", -11.8, 25.2, { m: "lhouse", c: "#4a9a3a" }); ob("m3", -9.6, 3, { m: "ship3" });
      ob("m3", -1.8, 16, { m: "tug", lead: 1, tow: 1 }); ob("m3", 1.8, 19, { m: "tug", lead: 1, tow: 1 }); B.push({ k: "land", b0: -1.3, b1: -.45 }, { k: "land", b0: .35, b1: 1.2 }); }
    else if (k === "newyork") { ob("quay", -9, 0, { y0: -6, y1: 36, crowd: 1 }); ob("m3", -15, 22, { m: "shed", w: 6, l: 14 }); ob("m3", -10.6, 34, { m: "crane", side: -1 });
      ob("ship", 0, 0, { sw: { px: -7.4, py: 28 }, hard: 1, ropes: 1, sqAll: 1, r: 3.2 }); ob("tug", 12, 22, { so: 1, a: -1.3, sq: [[.3, .8, 15.5], [1, -3.6, 15]] }); B.push({ k: "land", b0: .3, b1: 1.3 }); }
    else if (k === "solent") { gates(-1); B.push({ k: "land", b0: .25, b1: 1.3 }, { k: "land", b0: -1.5, b1: -.7 }); }
    else if (k === "cherAus") { gates(1); B.push({ k: "land", b0: -1.4, b1: -.5 }, { k: "town", b: -.9 }); }
    else if (k === "queAus") { gates(-1); ob("tower", -10, 30); B.push({ k: "land", b0: -1.6, b1: -.75 }); }
    else if (k === "liberty") { gates(1); B.push({ k: "statue", b: .42 }, { k: "ny", b: -.25, w: 40 }); }
    else if (k === "lotse") { ob("pilot", 1.8, 12, { hard: 1, sq: [[.3, 1.8, 12], [1, 10, 22]] }); ob("light", -8, 34); B.push({ k: "land", b0: -1.6, b1: -1 }); }
    else if (k === "fischer") { [[-4.5, 18], [.5, 20], [-1.5, 27], [-8, 24]].forEach(function (p) { ob("boat", p[0] * side, p[1], { hard: 1 }); }); }
    else if (sc === "reede") { ob("tender", 2.2, 12, { x0: 8, mv: .5, hard: 1, sq: [[.55, 2.2, 12], [1, 11, 24]] }); ob("tender", -9, 22, { sq: [[.25, -2.4, 11.5], [.6, -2.4, 11.5], [1, -11, 24]] }); cpPax(ob, 2.2, 12, .5); cpPax(ob, -2.4, 11.5, .55); B.push({ k: "town", b: .05 }, { k: "land", b0: -.6, b1: .7 }); }
    else if (k === "nebel1") ob("boat", .4 * side, 24, { hard: 1 });
    else if (k === "nebel2") ob("ship", -13, 40, {});
    else if (k === "eiswarn") { ob("floe", .3 * side, 25, { hard: 1 }); ob("floe", -8, 19); ob("floe", 9, 31); ob("floe", -12, 40); ob("seal", -6 * side, 46, { ani: 1 }); }
    else if (k === "eis") { ob("ice", 0, 15, { r: 3.5, hard: 1, big: 1 }); ob("floe", 7, 27); ob("floe", -8, 31); if (R() < .35) ob("bear", 8 * side, 44, { ani: 1 }); }
    else if (k === "wale") { ob("whale", -4, 34, { ani: 1, x0: -8, mv: 1 }); ob("whale", 5, 44, { ani: 1, x0: 9, mv: 1 }); }
    else if (k === "sos") { ob("schooner", 1.2, 13, { hard: 1, sq: [[.7, 1.2, 13], [1, -7, 24]] }); ob("dinghy", .9, 9.6, { so: 1, sq: [[.3, 1.1, 12.2], [.5, 1.1, 12.2], [.75, .9, 9.6], [1, .9, 9.6]] }); }
    else if (k === "gruss") ob("ship", -13, 6, { y0: 70, mv: 1, big: 1 });
    else if (k === "ambrose") { ob("light", 6, 22, { hard: 1 }); B.push({ k: "ny", b: -.1, w: 14 }); }
    else if (k === "quar") { ob("tender", 2.2, 12, { x0: 8, mv: .5, hard: 1, sq: [[.55, 2.2, 12], [1, 11, 24]] }); cpPax(ob, 2.2, 12, .5); B.push({ k: "isle", b: -.45 }, { k: "ny", b: .1, w: 26 }); }
    else if (k === "pier") { ob("pier", 0, 11, { r: 14, hard: 1 }); ob("tug", -5, 6, { sq: [[.5, -2.6, 8.4], [1, -2.6, 8.4]] }); ob("tug", 5, 7, { sq: [[.5, 2.6, 8.6], [1, 2.6, 8.6]] }); cpPax(ob, 0, 10.6, .6, 1); B.push({ k: "ny", b: 0, w: 120 }); }
    else if (sc === "see" || sc === "morgen") {                          // the open sea: now and then something adrift, now and then an animal far out
      if (!IN.ev && R() < .45) { ob("wood", .5 * side, 24, { hard: 1 }); IN.extra = " Aber da treibt etwas voraus …"; }
      if (R() < .7) animal(k === "kanal" ? ["gull", "dolph", "bottle"] : ["whale", "dolph", "dolph", "bottle", R() < .25 ? "orca" : "whale"]);
    }
    O.forEach(function (o) { o.seen = false; o.leg = li; if (!o.r) o.r = 2.6; cp.O.push(o); });
    var A = cp.anc[li]; B.forEach(function (b) { b.leg = li; if (b.b != null) b.b += A.h; if (b.b0 != null) { b.b0 += A.h; b.b1 += A.h; } cp.B.push(b); });
  }
  // little hamsters walking over a gangway during a sequence: from the boat (or the pier) to the bow and on board
  function cpPax(ob, x, y, v0, off) { for (var i = 0; i < 3; i++) { var a = v0 * .25 + i * .1;
    if (off) ob("pax", .3, 9.4, { so: 1, c: i, w: [a, 1], sq: [[a, .3, 9.4], [a + .3, -1.5 + i * 1.5, 10.8], [1, -1.5 + i * 1.5, 10.8]] });
    else ob("pax", x, y, { so: 1, c: i, w: [a, a + .3], sq: [[a, x, y], [a + .3, .3, 9.4], [1, .3, 9.4]] }); } }
  // where a thing is at time u of the leg (some drift in, some lead the way)
  function cpOP(o, u, d) { var m = o.mv ? Math.min(1, u / o.mv) : 1, e = o.mv >= 1 ? m : m * (2 - m);
    if (o.lead) { var pe = cpSm((u - .6) / .4), tx = o.x > 0 ? 9.5 : 6.5; return [o.x + (tx - o.x) * pe, o.y + d - 9 * pe]; }   // the tugs cast off at the harbour mouth and fall back to starboard
    return [o.x0 != null ? o.x0 + (o.x - o.x0) * e : o.x, (o.y0 != null ? o.y0 + (o.y - o.y0) * e : o.y) + (o.lead ? d : 0)]; }
  function cpSqPos(o, v) { var q = o.sq, p0 = cpOP(o, 1, 0), pv = 0, px = p0[0], py = p0[1];
    for (var i = 0; i < q.length; i++) { if (v <= q[i][0]) { var f = (v - pv) / Math.max(1e-6, q[i][0] - pv); return [px + (q[i][1] - px) * f, py + (q[i][2] - py) * f]; } pv = q[i][0]; px = q[i][1]; py = q[i][2]; } return [px, py]; }
  function cpLP(o) { var A = cp.anim;
    if (o.leg > cp.leg) return cpOP(o, 0, 0);
    if (o.leg < cp.leg) return o.sq && o.seqd ? cpSqPos(o, 1) : cpOP(o, 1, o.dEnd || 0);
    if (A && A.seq) return o.sq ? cpSqPos(o, A.seqV || 0) : cpOP(o, 1, A.S);
    return A && !A.look ? cpOP(o, A.u || 0, cp.d) : cpOP(o, 0, 0); }
  function cpWP(o) { var q; if (o.sw) { o.a = cpSwA(o); q = cpSwPos(o, o.a); } else q = cpLP(o);
    if (o.kT && !o.sw) { var kv = cpSm((performance.now() - o.kT) / 700); q = [q[0] + o.kDir * 3 * kv, q[1] + kv]; }   // knocked aside
    return cpW(cp.anc[o.leg], q[0], q[1]); }
  function cpRel(px, py, h, ox, oy) { var dx = ox - px, dy = oy - py; return [dx * Math.sin(h) + dy * Math.cos(h), dx * Math.cos(h) - dy * Math.sin(h)]; }
  // what happens if the leg is sailed like this: the first bump and when it comes (a pure function)
  function cpSim(rud, lvl) {
    var S = CP_DIST[lvl] + (lvl === 0 && cpLeg().k === "eis" ? 5 : 0), done = {}, N = 90;
    for (var i = 1; i <= N; i++) { var u = i / N, d = cpDistU(lvl, S, u), P = cpPath(rud, d);
      for (var j = 0; j < cp.O.length; j++) { var o = cp.O[j]; if (o.leg !== cp.leg || o.so) continue;
        if (o.k === "quay") { if (P[1] > o.y0 && P[1] < o.y1 && Math.abs(P[0] - o.x) < 1.8) return { k: "quay", u: u }; continue; }
        if (o.sw) { if (done[j]) continue; var sp = cpSwPts(o, cpSwA(o, u, lvl)); for (var m = 0; m < sp.length; m++) { var rs = cpRel(P[0], P[1], P[2], sp[m][0], sp[m][1]); if (rs[0] < 2.4 && rs[0] > -6 && Math.abs(rs[1]) < o.r) return { k: "ship", u: u, sd: rs[1] }; } continue; }
        if (done[j] || !(o.hard || o.gate)) continue; var q = cpOP(o, u, d), r = cpRel(P[0], P[1], P[2], q[0], q[1]);
        if (r[0] < .8) { done[j] = 1; if (o.gate ? Math.abs(r[1]) >= o.r : Math.abs(r[1]) < o.r) return { k: o.k, u: u, j: j, sd: r[1] }; } } }
    var E = cpPath(rud, S);
    for (var jj = 0; jj < cp.O.length; jj++) { var oo = cp.O[jj]; if (oo.leg !== cp.leg || done[jj] || !oo.hard || oo.k === "quay" || oo.sw) continue; var qq = cpOP(oo, 1, S), rr = cpRel(E[0], E[1], E[2], qq[0], qq[1]); if (rr[0] < 1.6 && Math.abs(rr[1]) < oo.r) return { k: oo.k, u: 1 }; }
    return null;
  }
  function cpNew() {
    return { route: dzRoute(), leg: 0, res: [], hits: 0, found: [], newF: [], lvl: 1, rud: 0, wh: false, looks: 2, O: [], B: [], anc: [{ x: 0, y: 0, h: 0 }], info: [], ev: null, extra: "", lastEv: -9, arrNight: Math.random() < .45,
      px: 0, py: 0, h: 0, d: 0, anim: null, done: false, intro: true, look: null, shake: 0, pre: "" };
  }
  function cpStartLeg() {
    if (!cp.info[cp.leg]) cpBuild(cp.leg);
    var IN = cp.info[cp.leg], A = cp.anc[cp.leg]; cp.ev = IN.ev; cp.extra = IN.extra;
    cp.O = cp.O.filter(function (o) { return o.leg >= cp.leg - 1; }); cp.B = cp.B.filter(function (b) { return b.leg >= cp.leg - 1; });
    cp.rud = 0; cp.wh = false; cp.looks = 2; cp.px = A.x; cp.py = A.y; cp.h = A.h; cp.d = 0; cp.glass = null;
    var swo = cp.O.filter(function (o) { return o.leg === cp.leg && o.sw && !o.snapped; })[0]; if (swo) { cp.anim = { lead: 1, dur: 2600, sw: swo }; cpPanelDraw(); if (!cpRaf) cpRaf = requestAnimationFrame(cpDraw); return; }
    cpPanelDraw(); cpRedraw();
  }

  // ---- drawing ----
  var CP_HZ = 18;
  var CAMV = { yaw: 0, Z: 1, hz: CP_HZ }, CP_EYE = 3.375, CP_NEAR = -5.2;      // the eye on the bridge: 3.4 units over the water, 6 behind the ship's point
  function cpProj(ox, oy, oz) { var H = cp.h + CAMV.yaw, dx = ox - cp.px, dy = oy - cp.py, f = dx * Math.sin(H) + dy * Math.cos(H), sd = dx * Math.cos(H) - dy * Math.sin(H);
    if (f < .8) return null; var k = 10 / (f + 6) * CAMV.Z, fe = f / CAMV.Z; return { x: 90 + sd * k * 16, y: CAMV.hz + (CP_EYE - (oz || 0)) * k * 16, k: k, f: f, sd: sd, sz: fe < 9 ? 4 : fe < 16 ? 3 : fe < 30 ? 2 : 1 }; }
  var CP_SEA = { day: [["#8fd0f4", "#b4e0f8", "#d8f0fc"], ["#3a7ab0", "#4a8ac0", "#d8eef8"]], eve: [["#6a7ab8", "#e89a6a", "#f6c88a"], ["#3a5a8a", "#4a6a98", "#f6c88a"]],
    night: [["#0e1430", "#18204a", "#243060"], ["#121e38", "#1a2a48", "#4a5a88"]], dawn: [["#8a9ac8", "#e8b8c0", "#f6dcc0"], ["#4a6a9a", "#5a7aa8", "#f6dcc0"]],
    fog: [["#b8c4cc", "#c8d2d8", "#d4dce0"], ["#6a8a9a", "#7a96a4", "#c8d4dc"]], storm: [["#22282f", "#2e353e", "#3c444e"], ["#2a4050", "#34505e", "#c8d8e0"]] };
  var cpSeas = {};
  function cpSeaPic(sky) {
    if (cpSeas[sky]) return cpSeas[sky];
    var cv = document.createElement("canvas"); cv.width = 180; cv.height = 135; var g = cv.getContext("2d"), y, x, P = CP_SEA[sky], skc = P[0], sea = P[1];
    for (y = 0; y < CP_HZ; y++) { g.fillStyle = skc[y < CP_HZ * .45 ? 0 : y < CP_HZ * .8 ? 1 : 2]; g.fillRect(0, y, 180, 1); }
    if (sky === "night") for (var k = 0; k < 26; k++) { g.fillStyle = k % 5 ? "#c8d4f0" : "#ffffff"; g.fillRect((k * 53) % 180, (k * 29) % (CP_HZ - 6), 1, 1); }
    if (sky === "day") { g.fillStyle = "#fff6c0"; g.fillRect(150, 4, 6, 6); g.fillRect(149, 5, 8, 4); g.fillRect(151, 3, 4, 8); }
    for (y = CP_HZ; y < 135; y++) { var u = (y - CP_HZ) / (135 - CP_HZ), per = 1 + Math.floor(u * 7), row = Math.floor(Math.pow(y - CP_HZ, 1.15) / Math.max(1, per >> 1));
      for (x = 0; x < 180; x += per) { g.fillStyle = cpHash(Math.floor(x / per) + (row & 1) * 7, row) < .55 ? sea[0] : sea[1]; g.fillRect(x, y, per, 1); } }
    g.fillStyle = sea[2]; g.fillRect(0, CP_HZ, 180, 1);
    cpSeas[sky] = cv; return cv;
  }
  function cpBlob(cx, cy, rx, ry, f) {                                  // pixel ellipse: each pixel coloured by f(dx, dy) in -1..1
    for (var y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (var x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      var dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; if (dx * dx + dy * dy <= 1) { var c = f(dx, dy); if (c) mR(cpc, x, y, 1, 1, c); } } }
  function cpBox(x, y, w, h, c, hi) { mR(cpc, x - 1, y - 1, w + 2, h + 2, "#2a1a10"); mR(cpc, x, y, w, h, c); if (hi) mR(cpc, x, y, w, 1, hi); }
  // white caps on the water, fixed in the world: they stream past and swing round with the ship
  function cpFoam(col, t) {
    var g = 3, x0 = Math.floor((cp.px - 40) / g), x1 = Math.ceil((cp.px + 40) / g), y0 = Math.floor((cp.py - 12) / g), y1 = Math.ceil((cp.py + 46) / g);
    for (var j = y0; j <= y1; j++) for (var i = x0; i <= x1; i++) { var hv = cpHash(i * 7 + 3, j * 13 + 5); if (hv > .2) continue;
      var p = cpProj(i * g + cpHash(i, j) * g, j * g + cpHash(j, i) * g); if (!p || p.y > 135 || p.x < 0 || p.x > 180) continue;
      var big = p.f < 10 ? 2 : 1; if ((Math.floor(t / 700) + i + j) % 5 === 0 && big === 1) continue; mR(cpc, Math.round(p.x), Math.round(p.y), big + (p.f < 6 ? 1 : 0), 1, col); }
  }
  function cpHzX(b) { return Math.round(90 + (b - cp.h - CAMV.yaw) * 160 * CAMV.Z); }
  function cpBack(o, sky) {                                              // things on the horizon: coasts, towns, the skyline, the statue
    var dark = sky === "night", hz = CAMV.hz;
    if (o.k === "land") { var xa = cpHzX(o.b0), xb = cpHzX(o.b1); for (var x = xa; x <= xb; x++) { var e = Math.min(x - xa, xb - x), hh = Math.min(e >> 1, 3 + Math.floor(cpHash(Math.floor(x / 5), 9) * 3)); if (hh <= 0) continue;
        mR(cpc, x, hz - hh - 1, 1, 1, "#2a3a2a"); mR(cpc, x, hz - hh, 1, hh, dark ? "#1a2a2a" : (x / 3 | 0) % 2 ? "#5a8a5a" : "#4e7e50"); if (!dark && cpHash(x, 3) < .08) mR(cpc, x, hz - hh - 2, 1, 2, "#e8e0d0"); } return; }
    var X = cpHzX(o.b);
    if (o.k === "town") { for (var i = -14; i < 14; i += 3) { var hh2 = 3 + Math.floor(cpHash(i + 40, 7) * 4); cpBox(X + i, hz - hh2, 3, hh2, ["#c8945a", "#e8d8b0", "#a86a4a", "#d8b07a"][(i + 14) % 4], null); if (dark) mR(cpc, X + i + 1, hz - hh2 + 1, 1, 1, "#ffd34a"); }
      cpBox(X - 2, hz - 11, 2, 11, "#a8a098"); mR(cpc, X - 2, hz - 13, 2, 2, "#5a6a6a");
      mR(cpc, X + 15, hz - 12, 1, 12, "#3a3a3a"); mR(cpc, X + 9, hz - 12, 10, 1, "#3a3a3a"); mR(cpc, X + 9, hz - 11, 1, 3, "#3a3a3a"); return; }
    if (o.k === "ny") { var w = o.w; for (var j = -w / 2; j < w / 2; j += 4) { var th = 4 + Math.floor(cpHash(j + 99, 5) * (w > 30 ? 14 : 7)); cpBox(X + j, hz - th, 3, th, dark ? "#2a3048" : ["#8a94a8", "#a8b0c0", "#7a8498"][(j + 90) % 3], null);
        if (dark) for (var wy = 1; wy < th - 1; wy += 2) if (cpHash(j, wy) < .5) mR(cpc, X + j + 1, hz - th + wy, 1, 1, "#ffd34a"); } return; }
    if (o.k === "statue") { cpBox(X - 3, hz - 4, 7, 4, "#a8a098"); cpBox(X - 1, hz - 12, 3, 8, "#6ab09a"); mR(cpc, X - 1, hz - 13, 3, 1, "#6ab09a"); mR(cpc, X + 2, hz - 16, 1, 5, "#6ab09a"); mR(cpc, X + 2, hz - 17, 1, 1, "#ffd34a"); return; }
    if (o.k === "isle") { for (var q = -12; q <= 12; q++) { var hq = Math.max(0, 3 - Math.abs(q) / 4 | 0); if (hq) mR(cpc, X + q, hz - hq, 1, hq, "#5a7a4a"); } cpBox(X - 5, hz - 7, 4, 4, "#c85a3a"); cpBox(X + 1, hz - 6, 5, 3, "#c85a3a"); mR(cpc, X - 5, hz - 8, 4, 1, "#8a3a2a"); }
  }
  function cpPier(p, t) {
    var hw = Math.round(14 * p.k * 16), hp = Math.max(3, Math.round(p.k * 26)), X = Math.round(p.x), Y = Math.round(p.y);
    mR(cpc, X - hw, Y - hp - 1, hw * 2, hp + 1, "#4a4a46"); mR(cpc, X - hw, Y - hp, hw * 2, hp, "#9a9a92"); mR(cpc, X - hw, Y - hp, hw * 2, 1, "#c8c8be");
    for (var i = -hw + 4; i < hw - 2; i += Math.max(4, Math.round(p.k * 14))) { mR(cpc, X + i, Y - hp, 1, hp, "#7a7a74"); if (cpHash(i, 3) < .55) { var hop = Math.floor(t / 260 + i) % 3 === 0 ? 1 : 0; mR(cpc, X + i + 2, Y - hp - 3 - hop, 2, 3, ["#c8945a", "#e8d8b0", "#f6c88a"][(i + 99) % 3]); mR(cpc, X + i + 2, Y - hp - 4 - hop, 2, 1, "#3a2414"); } }
    var sh = Math.round(p.k * 20); cpBox(X - Math.round(hw * .6), Y - hp - sh, Math.round(hw * 1.2), sh, "#c8a07a", "#e0c09a"); mR(cpc, X - Math.round(hw * .6), Y - hp - sh - 2, Math.round(hw * 1.2), 2, "#8a3a2a");
  }
  // what floats on the sea, drawn at its distance size (more pixels when near, never scaled)
  function cpThing(o, x, y, sz, t) {
    var k = o.k, R = sz === 4 ? 1.4 : sz === 3 ? 1 : sz === 2 ? .62 : .36, r = function (v) { return Math.max(1, Math.round(v * R)); };
    if (k === "ice" || k === "floe") {
      var w = Math.round((o.big ? 22 : 13) * R), h = Math.round((k === "floe" ? 4 : o.big ? 26 : 11) * R) + 1;
      cpBlob(x, y, w + .6, Math.max(1.4, 2.4 * R) + .6, function () { return "#4a6a80"; });
      cpBlob(x, y, w, Math.max(1, 2.4 * R), function (dx) { return dx < -.3 ? "#ffffff" : dx < .4 ? "#d8ecf8" : "#a8c8dc"; });
      if (k === "ice") for (var yy = 0; yy < h; yy++) { var hw = Math.round(w * (1 - yy / h) * (yy < h * .5 ? .8 : .55)); if (hw < 1) continue;
        var xo = Math.round(w * .15 * Math.sin(yy * .7)); mR(cpc, x - hw - 1 + xo, y - yy - 1, hw * 2 + 2, 1, "#4a6a80"); mR(cpc, x - hw + xo, y - yy - 1, hw, 1, "#ffffff"); mR(cpc, x + xo, y - yy - 1, Math.ceil(hw * .6), 1, "#d8ecf8"); mR(cpc, x + xo + Math.ceil(hw * .6), y - yy - 1, hw - Math.ceil(hw * .6), 1, "#a8c8dc"); }
      return;
    }
    if (k === "seal" || k === "bear") { cpThing({ k: "floe" }, x, y, sz, t); var bw = r(3); cpBlob(x, y - bw * .8, bw * 1.4, bw, function (dx, dy) { return k === "bear" ? (dx < 0 ? "#fffaf0" : "#e8e0d0") : (dy < 0 ? "#8a6a4a" : "#6a4a32"); }); if (sz > 1) mR(cpc, x + bw, y - bw * 1.4, 1, 1, "#1e120a"); return; }
    if (k === "boat" || k === "schooner") { var bw2 = r(k === "schooner" ? 13 : 10), bh = r(3), mh = r(k === "schooner" ? 15 : 12);
      cpBox(x - bw2, y - bh, bw2 * 2, bh, k === "schooner" ? "#3a5a7a" : "#a8744a", k === "schooner" ? "#5a7a9a" : "#c8945a");
      (k === "schooner" ? [-.45, .4] : [0]).forEach(function (mx, n) { var X = x + Math.round(mx * bw2); mR(cpc, X, y - bh - mh, 1, mh, "#3a2414"); for (var m = 0; m < mh - 2; m++) mR(cpc, X + 1, y - bh - mh + 2 + m, Math.round(m * (k === "schooner" ? .45 : .7)) + 1, 1, m % 4 ? "#fff8ec" : "#e8dcc8");
        if (k === "schooner" && n === 0) { var fl = Math.floor(t / 250) % 2; mR(cpc, X - r(4), y - bh - mh, r(3), r(2), "#d8463c"); mR(cpc, X - r(4) - fl, y - bh - mh + r(2), r(3), r(2), "#ffd34a"); } });
      return; }
    if (k === "ship") { var L = r(o.big ? 40 : 30), hh = r(5) + 1, sw = Math.round(L * .6), sh2 = r(3) + 1, fn = o.big ? 4 : 2;
      cpBox(x - L, y - hh, L * 2, hh, "#1e1e24", null); mR(cpc, x - L, y - 1, L * 2, 1, "#a8342a");
      cpBox(x - sw, y - hh - sh2, sw * 2, sh2, "#f8f4ec", null); for (var wi = -sw + 1; wi < sw - 1; wi += 3) if (sz > 1) mR(cpc, x + wi, y - hh - sh2 + 1, 1, 1, "#3a4a5a");
      for (var f = 0; f < fn; f++) { var fx = x - sw + Math.round((f + .7) * (sw * 2) / (fn + .4)), fh = r(7); cpBox(fx, y - hh - sh2 - fh, r(2), fh, "#e8a03a", null); mR(cpc, fx, y - hh - sh2 - fh, r(2), Math.max(1, Math.round(fh / 4)), "#1e1e24");
        if (f < fn - (o.big ? 1 : 0)) for (var sm = 1; sm < 4; sm++) mR(cpc, fx + sm * 2 + ((t / 300 | 0) % 2), y - hh - sh2 - fh - sm * 2, 2, 2, "#c8c8d0"); }
      return; }
    if (k === "tug" || k === "pilot" || k === "tender") { var L2 = r(k === "tender" ? 14 : 10), h2 = r(3) + 1;
      cpBox(x - L2, y - h2, L2 * 2, h2, k === "tender" ? "#2a2a30" : "#5a2a1a", k === "tender" ? "#4a4a52" : "#8a3a2a");
      cpBox(x - Math.round(L2 * .4), y - h2 - r(3), Math.round(L2 * .8), r(3), "#f8f4ec", null); var fx2 = x + Math.round(L2 * .1); cpBox(fx2, y - h2 - r(3) - r(4), r(2), r(4), k === "tug" ? "#c8342a" : "#e8a03a", null);
      mR(cpc, fx2 + 1 + ((t / 300 | 0) % 2), y - h2 - r(3) - r(4) - 2, 2, 2, "#c8c8d0");
      if (k === "pilot") { mR(cpc, x - L2 + 1, y - h2 - r(8), 1, r(8) - r(3), "#3a2414"); mR(cpc, x - L2 + 2, y - h2 - r(8), r(3), r(2), "#d8463c"); mR(cpc, x - L2 + 2, y - h2 - r(8) + r(2), r(3), r(1), "#f8f4ec"); }
      return; }
    if (k === "light") { var L3 = r(14), h3 = r(4); cpBox(x - L3, y - h3, L3 * 2, h3, "#c8342a", "#e8584a"); mR(cpc, x, y - h3 - r(12), 1, r(12), "#3a2414"); var on = Math.floor(t / 500) % 2;
      cpBox(x - r(1), y - h3 - r(12) - r(2), r(3), r(2), on ? "#ffd34a" : "#8a6a2a", null); if (sz > 1) for (var lt = 0; lt < L3 * 2 - 2; lt += 4) mR(cpc, x - L3 + 2 + lt, y - h3 + 1, 2, 1, "#f8f4ec"); return; }
    if (k === "buoyR" || k === "buoyG") { var bw3 = r(2), bh3 = r(6), c1 = k === "buoyR" ? "#d8463c" : "#4a9a3a", c2 = k === "buoyR" ? "#9a2a20" : "#2e6a26";
      for (var by = 0; by < bh3; by++) { var ww = k === "buoyG" ? Math.max(1, Math.round(bw3 * (by + 1) / bh3)) : bw3; mR(cpc, x - ww - 1, y - bh3 + by, ww * 2 + 2, 1, "#2a1a10"); mR(cpc, x - ww, y - bh3 + by, ww, 1, c1); mR(cpc, x, y - bh3 + by, ww, 1, c2); }
      mR(cpc, x - bw3 - 1, y - 1, bw3 * 2 + 2, 1, "#2a1a10"); if (Math.floor(t / 450 + x) % 2) mR(cpc, x, y - bh3 - 2, 1, 1, "#ffd34a"); return; }
    if (k === "pax") { var hop = Math.floor(t / 180 + (o.c || 0) * 2) % 2, cc = ["#c8945a", "#e8d8b0", "#f6c88a"][(o.c || 0) % 3], pw = r(2), ph = r(3);
      mR(cpc, x - 1, y - ph - 1 - hop, pw + 2, ph + 2, "#3a2414"); mR(cpc, x, y - ph - hop, pw, ph, cc); mR(cpc, x, y - ph - hop, pw, 1, "#fff8ec"); return; }
    if (k === "dinghy") { var dl = r(6), oar = Math.floor(t / 300) % 2; cpBox(x - dl, y - r(2), dl * 2, r(2), "#a8744a", "#c8945a"); mR(cpc, x - 2, y - r(2) - 3, 2, 3, "#e8d8b0"); mR(cpc, x + 1, y - r(2) - 3, 2, 3, "#c8945a");
      mR(cpc, x - dl - 2, y - 1 - oar, 3, 1, "#3a2414"); mR(cpc, x + dl, y - 1 - oar, 3, 1, "#3a2414"); return; }
    if (k === "wood") { var ww2 = r(9); mR(cpc, x - ww2 - 1, y - 2, ww2 * 2 + 2, Math.max(2, r(3)) + 1, "#3a2414"); mR(cpc, x - ww2, y - 1, ww2 * 2, Math.max(1, r(3) - 1), "#8a5a32"); mR(cpc, x - ww2, y - 1, ww2 * 2, 1, "#b8844c"); return; }
    if (k === "tower") { var th = r(22) + 3, tw = Math.max(2, r(4)); cpBlob(x, y, tw * 2.5, Math.max(1.5, r(2)), function (dx) { return dx < 0 ? "#7a7a74" : "#5a5a54"; }); mR(cpc, x - tw - 1, y - th - 1, tw * 2 + 2, th + 2, "#3a2414"); for (var ty = 0; ty < th; ty++) mR(cpc, x - tw, y - th + ty, tw * 2, 1, Math.floor(ty / Math.max(2, r(4))) % 2 ? "#fff8ec" : "#c83a2a");
      mR(cpc, x - tw, y - th - 2, tw * 2, 2, Math.floor(t / 500) % 2 ? "#ffd34a" : "#fff4b0"); return; }
    if (k === "whale" || k === "orca") { var wl = r(12), wh2 = r(3);
      cpBlob(x, y, wl + .7, wh2 + .7, function (dx, dy) { return dy < 0 ? "#141820" : null; }); cpBlob(x, y, wl, wh2, function (dx, dy) { return dy < 0 ? (k === "orca" && dx > .3 ? "#ffffff" : dx < -.3 ? "#5a6a7a" : "#3a4a5a") : null; });
      if (k === "orca") mR(cpc, x - 1, y - wh2 - r(5), r(2), r(5), "#141820");
      else if (Math.floor(t / 600) % 3 === 0) for (var sp = 0; sp < r(6) + 2; sp++) { mR(cpc, x - wl * .5 - sp * .4, y - wh2 - sp - 1, 1, 1, "#ffffff"); mR(cpc, x - wl * .5 + sp * .4, y - wh2 - sp - 1, 1, 1, "#e8f4fc"); }
      return; }
    if (k === "dolph") { for (var dd = 0; dd < 3; dd++) { var dx2 = x + (dd - 1) * r(8), dy2 = y - Math.round(Math.abs(Math.sin(t / 300 + dd)) * 3 * R); cpBlob(dx2, dy2, Math.max(1.5, 4 * R), Math.max(1, 2 * R), function (a, b) { return b < 0 ? (a < 0 ? "#8a9aaa" : "#6a7a8a") : null; }); mR(cpc, dx2, dy2 - Math.max(1, 2 * R) - 1, 1, r(2), "#5a6a7a"); } return; }
    if (k === "bottle") { var bl = Math.max(2, r(5)); mR(cpc, x - bl - 1, y - 2, bl * 2 + 2, 3, "#1e3a1a"); mR(cpc, x - bl, y - 1, bl * 2, 1, "#5ab04a"); mR(cpc, x + bl, y - 1, 2, 1, "#c8945a"); return; }
    if (k === "gull") { for (var gg = 0; gg < 4; gg++) { var gx = x + (gg - 1.5) * r(7), gy = y - r(10) - (gg % 2) * 2 - Math.round(Math.sin(t / 200 + gg)); mR(cpc, gx - 2, gy, 2, 1, "#3a2414"); mR(cpc, gx + 1, gy, 2, 1, "#3a2414"); mR(cpc, gx, gy + 1, 1, 1, "#fff8ec"); } return; }
  }
  function cpUnknown(x, y, sz, t) {                                     // something far out: a grey smudge with a little "?" sign over it
    var w = sz === 1 ? 3 : 5, bob = Math.floor(t / 400) % 2;
    cpBlob(x, y - 1, w + .6, 1.8, function () { return "#5a6a7a"; }); cpBlob(x, y - 1, w, 1.2, function (dx) { return dx < 0 ? "#c8d4dc" : "#a8b4c0"; });
    var Q = ["111", "001", "010", "000", "010"], qx = x - 2, qy = y - 11 - bob;
    mR(cpc, qx - 1, qy - 1, 5, 7, "#3a2414"); mR(cpc, qx, qy, 3, 5, "#fff8ec"); Q.forEach(function (row, j) { for (var i = 0; i < 3; i++) if (row[i] === "1") mR(cpc, qx + i, qy + j, 1, 1, "#3a2414"); });
  }
  function cpHidden(o, f) { if (o.ani) return !o.seen; return !o.seen && cpSky() === "fog" && f > 12; }

  // ===== a little 3D on the 180x135 pixel grid: flat-shaded prisms, filled row by row so every pixel stays one pixel =====
  function cpC(wx, wy, wz) { var H = cp.h + CAMV.yaw, dx = wx - cp.px, dy = wy - cp.py; return [dx * Math.sin(H) + dy * Math.cos(H), dx * Math.cos(H) - dy * Math.sin(H), wz]; }
  function cpS(c) { var k = 10 / (c[0] + 6) * CAMV.Z; return [90 + c[1] * k * 16, CAMV.hz + (CP_EYE - c[2]) * k * 16]; }
  function cpEye() { return [cp.px - 6 * Math.sin(cp.h), cp.py - 6 * Math.cos(cp.h), CP_EYE]; }
  function shipW(sd, f, z) { return [cp.px + sd * Math.cos(cp.h) + f * Math.sin(cp.h), cp.py - sd * Math.sin(cp.h) + f * Math.cos(cp.h), z || 0]; }
  function cpFill(S, c) {
    var y0 = 1e9, y1 = -1e9, n = S.length, i; for (i = 0; i < n; i++) { if (S[i][1] < y0) y0 = S[i][1]; if (S[i][1] > y1) y1 = S[i][1]; }
    y0 = Math.max(-4, Math.ceil(y0 - .5)); y1 = Math.min(138, Math.floor(y1 - .5)); cpc.fillStyle = c;
    for (var y = y0; y <= y1; y++) { var yc = y + .5, xs = [];
      for (i = 0; i < n; i++) { var a = S[i], b = S[(i + 1) % n]; if ((a[1] <= yc) !== (b[1] <= yc)) xs.push(a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); }
      if (xs.length < 2) continue; xs.sort(function (p, q) { return p - q; });
      for (var j = 0; j + 1 < xs.length; j += 2) { var xa = Math.max(-4, Math.ceil(xs[j] - .5)), xb = Math.min(184, Math.floor(xs[j + 1] - .5)); if (xb >= xa) cpc.fillRect(xa, y, xb - xa + 1, 1); } }
  }
  function cpLineS(x0, y0, x1, y1, c) { if (Math.max(Math.abs(x0), Math.abs(x1), Math.abs(y0), Math.abs(y1)) > 2000) return; var n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); if (n > 600) return; cpc.fillStyle = c;
    for (var i = 0; i <= n; i++) cpc.fillRect(Math.round(x0 + (x1 - x0) * i / n - .5), Math.round(y0 + (y1 - y0) * i / n - .5), 1, 1); }
  function cpPolyC(P, c, oc) {
    var out = [], n = P.length; for (var i = 0; i < n; i++) { var a = P[i], b = P[(i + 1) % n], ia = a[0] >= CP_NEAR, ib = b[0] >= CP_NEAR; if (ia) out.push(a);
      if (ia !== ib) { var tt = (CP_NEAR - a[0]) / (b[0] - a[0]); out.push([CP_NEAR, a[1] + (b[1] - a[1]) * tt, a[2] + (b[2] - a[2]) * tt]); } }
    if (out.length < 3) return; var S = out.map(cpS); cpFill(S, c);
    var bx0 = 1e9, bx1 = -1e9, by0 = 1e9, by1 = -1e9; S.forEach(function (p) { bx0 = Math.min(bx0, p[0]); bx1 = Math.max(bx1, p[0]); by0 = Math.min(by0, p[1]); by1 = Math.max(by1, p[1]); }); if (bx1 - bx0 < 5 || by1 - by0 < 4) oc = null;
    if (oc) for (var j = 0; j < S.length; j++) { var p = S[j], q = S[(j + 1) % S.length]; cpLineS(p[0], p[1], q[0], q[1], oc); }
  }
  function cpPolyW(W, c, oc) { cpPolyC(W.map(function (p) { return cpC(p[0], p[1], p[2]); }), c, oc); }
  function cpLine3(a, b, c) { var A = cpC(a[0], a[1], a[2]), B = cpC(b[0], b[1], b[2]); if (A[0] < CP_NEAR && B[0] < CP_NEAR) return;
    if (A[0] < CP_NEAR) { var t1 = (CP_NEAR - A[0]) / (B[0] - A[0]); A = [CP_NEAR, A[1] + (B[1] - A[1]) * t1, A[2] + (B[2] - A[2]) * t1]; }
    if (B[0] < CP_NEAR) { var t2 = (CP_NEAR - B[0]) / (A[0] - B[0]); B = [CP_NEAR, B[1] + (A[1] - B[1]) * t2, B[2] + (A[2] - B[2]) * t2]; }
    var p = cpS(A), q = cpS(B); cpLineS(p[0], p[1], q[0], q[1], c); }
  function cpRope3(a, b, sag, c) { var pv = a; for (var i = 1; i <= 10; i++) { var u = i / 10, p = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u - sag * 4 * u * (1 - u)]; cpLine3(pv, p, c); pv = p; } }
  function cpSees(W, n) { var E = cpEye(), m = [0, 0, 0]; W.forEach(function (p) { m[0] += p[0]; m[1] += p[1]; m[2] += p[2]; }); var k = W.length; return (E[0] - m[0] / k) * n[0] + (E[1] - m[1] / k) * n[1] + (E[2] - m[2] / k) * n[2] > 0; }
  function cpFace(W, n, c, oc) { if (!cpSees(W, n)) return false; cpPolyW(W, c, oc); return true; }
  function cpShade(n, C) { return n[2] > .7 ? C[0] : (n[0] * .55 - n[1] * .45) > 0 ? C[1] : C[2]; }   /* the sun stands to the right, behind the ship */
  function cpLoc(cx, cy, a) { var ca = Math.cos(a), sa = Math.sin(a); return { P: function (u, v, z) { return [cx + u * ca + v * sa, cy - u * sa + v * ca, z]; }, N: function (u, v, z) { return [u * ca + v * sa, -u * sa + v * ca, z || 0]; } }; }
  function cpPrism(cx, cy, a, poly, z0, z1, C) {                          // poly counter-clockwise in local u (right), v (ahead)
    var T = cpLoc(cx, cy, a);
    for (var i = 0; i < poly.length; i++) { var p = poly[i], q = poly[(i + 1) % poly.length], nu = q[1] - p[1], nv = p[0] - q[0], L = Math.hypot(nu, nv) || 1, n = T.N(nu / L, nv / L);
      cpFace([T.P(p[0], p[1], z0), T.P(q[0], q[1], z0), T.P(q[0], q[1], z1), T.P(p[0], p[1], z1)], n, cpShade(n, C), C[3]); }
    if (z1 < CP_EYE) cpFace(poly.map(function (p) { return T.P(p[0], p[1], z1); }), [0, 0, 1], C[0], C[3]);
  }
  function cpRect(w, l, v0) { v0 = v0 || 0; return [[-w / 2, v0 - l / 2], [w / 2, v0 - l / 2], [w / 2, v0 + l / 2], [-w / 2, v0 + l / 2]]; }
  function cpBox3(cx, cy, a, w, l, z0, z1, C) { cpPrism(cx, cy, a, cpRect(w, l), z0, z1, C); }
  function cpRoof(cx, cy, a, w, l, z, rh, C, G) {                        // a pitched roof, the ridge running along the length; G colours the gables
    var T = cpLoc(cx, cy, a), hw = w / 2, hl = l / 2, s = Math.hypot(rh, hw);
    cpFace([T.P(-hw, -hl, z), T.P(0, -hl, z + rh), T.P(hw, -hl, z)], T.N(0, -1), G[1], C[3]); cpFace([T.P(hw, hl, z), T.P(0, hl, z + rh), T.P(-hw, hl, z)], T.N(0, 1), G[2], C[3]);
    var nl = T.N(-rh / s, 0, hw / s), nr = T.N(rh / s, 0, hw / s);
    cpFace([T.P(-hw, -hl, z), T.P(-hw, hl, z), T.P(0, hl, z + rh), T.P(0, -hl, z + rh)], nl, cpShade([nl[0], nl[1], 0], C), C[3]);
    cpFace([T.P(hw, hl, z), T.P(hw, -hl, z), T.P(0, -hl, z + rh), T.P(0, hl, z + rh)], nr, cpShade([nr[0], nr[1], 0], C), C[3]);
  }
  function cpOct(r) { var o = []; for (var i = 0; i < 8; i++) o.push([r * Math.cos(i * Math.PI / 4 + Math.PI / 8), r * Math.sin(i * Math.PI / 4 + Math.PI / 8)]); return o; }
  // a hamster in the crowd: a little upright figure, more pixels the nearer it stands
  function cpHam(wx, wy, wz, seed, t) {
    var p = cpProj(wx, wy, wz); if (!p || p.f > 50 || p.x < -4 || p.x > 184) return;
    var s = p.k * 16, h = Math.max(3, Math.round(.55 * s)), w = Math.max(2, Math.round(.36 * s)), fast = cp.anim && (cp.anim.pre || cp.anim.crash || cp.anim.splash) ? 2.5 : 1, hop = (Math.floor(t * fast / 260) + seed) % 4 === 0 ? 1 : 0;
    var x = Math.round(p.x - w / 2), y = Math.round(p.y) - h - hop, c = ["#c8945a", "#e8d8b0", "#f6c88a", "#a86a4a", "#9a8a7a", "#f0e8d8"][seed % 6], dr = ["#3a5a8a", "#c8463c", "#4a7a3a", "#e8dcc8", "#6a4a8a"][seed % 5];
    mR(cpc, x - 1, y - 1, w + 2, h + 2, "#2a1a10"); mR(cpc, x, y, w, h, c); mR(cpc, x, y + Math.ceil(h * .55), w, h - Math.ceil(h * .55), dr); if (w >= 3) mR(cpc, x + 1, y + 1, w - 2, 1, "#fff1d8");
    if (s > 9) { mR(cpc, x, y - 2, 1, 1, "#2a1a10"); mR(cpc, x + w - 1, y - 2, 1, 1, "#2a1a10"); }
    if (seed % 4 === 1) { mR(cpc, x - 1, y - 1, w + 2, 1, "#3a2414"); mR(cpc, x, y - 2 - (s > 9 ? 1 : 0), w, s > 9 ? 2 : 1, "#3a2414"); }
    if (seed % 3 === 0) { var up = Math.floor(t * fast / 200 + seed) % 2; mR(cpc, x + w + 1, y - 1 - up, 1, 1, "#ffffff"); if (s > 9) mR(cpc, x + w + 2, y - up, 1, 1, "#e8e0d0"); }   /* a white handkerchief fluttering */
  }
  var CP_STONE = ["#a89c88", "#8a8078", "#6a625c", "#3a3430"], CP_RUST = ["#d8704a", "#c85a3a", "#8a3a24", "#4a1e12"], CP_WHITE = ["#f8f4ec", "#f0ece0", "#c8c4b8", "#4a4a4a"], CP_IRON = ["#5a5a62", "#46464e", "#2e2e34", "#1e1e22"];
  function cpQuay3(o, t, pass) {                                         // the stone quay of a dock as a block: the face to the water, the paved top, kerb, bollards, the crowd
    var AN = cp.anc[o.leg], side = o.x > 0 ? 1 : -1, Z1 = 1.2, T = cpLoc(AN.x, AN.y, AN.h);
    if (!pass) { var c = T.P(o.x + side * 12, (o.y0 + o.y1) / 2, 0); cpBox3(c[0], c[1], AN.h, 24, o.y1 - o.y0, 0, Z1, CP_STONE);
      var xf = o.x - side * .03, n = T.N(-side, 0);
      if (cpSees([T.P(xf, o.y0, 0), T.P(xf, o.y1, Z1)], n)) {
        cpPolyW([T.P(xf, o.y0, 0), T.P(xf, o.y1, 0), T.P(xf, o.y1, .2), T.P(xf, o.y0, .2)], "#4a5a3a");
        cpLine3(T.P(xf, o.y0, .62), T.P(xf, o.y1, .62), "#746a62"); cpLine3(T.P(xf, o.y0, Z1), T.P(xf, o.y1, Z1), "#d8ccb8");
        for (var vy = Math.ceil(o.y0 / 2.5) * 2.5; vy < o.y1; vy += 2.5) { var cc = cpC.apply(null, T.P(xf, vy, 0)); if (cc[0] < -4 || cc[0] > 30) continue; cpLine3(T.P(xf, vy + ((vy / 2.5) % 2 ? 1.2 : 0), .62), T.P(xf, vy + ((vy / 2.5) % 2 ? 1.2 : 0), Z1), "#746a62"); cpLine3(T.P(xf, vy + .6, .2), T.P(xf, vy + .6, .62), "#746a62"); } }
      return; }
    if (o.crowd) for (var y2 = o.y1 - .5; y2 > o.y0; y2 -= .62) { var key = Math.round(y2 * 10), hv = cpHash(key, (o.x * 7) | 0); if (hv > .8) continue; var hw = T.P(o.x + side * (.75 + cpHash(key, 3) * 2.6), y2, 0); cpHam(hw[0], hw[1], Z1, Math.floor(hv * 1000), t); }
    for (var y = o.y1 - 1; y > o.y0; y -= 5) { var b = T.P(o.x + side * .45, y, 0); cpBox3(b[0], b[1], AN.h, .34, .34, Z1, Z1 + .34, CP_IRON); }
  }
  var CP_LAND = { shed: 1, crane: 1, lhouse: 1 };
  // ---- everything that floats, as little 3D models ----
  var CP_3K = { ship: 1, tug: 1, pilot: 1, tender: 1, boat: 1, schooner: 1, light: 1, buoyR: 1, buoyG: 1, wood: 1, floe: 1, ice: 1, tower: 1, dinghy: 1, pier: 1, pax: 1 };
  var CP_STRUCT = { quay: 1, gate: 1, pier: 1, ice: 1 };
  function cpSm(v) { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); }
  function cpBlink(t, w) { return Math.floor(t / 500 + (w || 0)) % 2; }
  function cpBill(w3, wpx, hpx, c) { var p = cpProj(w3[0], w3[1], w3[2]); if (!p) return; mR(cpc, Math.round(p.x), Math.round(p.y) - hpx, wpx, hpx, c); }
  function cpSmoke(w3, t, n) { var p = cpProj(w3[0], w3[1], w3[2]); if (!p) return; for (var k = 0; k < n; k++) mR(cpc, Math.round(p.x) + k * 2 + (Math.floor(t / 400) % 2), Math.round(p.y) - k * 2 - 1, 2, 2, k > 2 ? "#a8a8b0" : "#c8c8d0"); }
  function cpShip3(w, a, t, o) {                                         // a steamer: red bottom, black hull, white decks, buff funnels with black tops
    var T = cpLoc(w[0], w[1], a), big = !!o.big, s = big ? 1.5 : 1, hw = big ? 1.7 : 1.3, fn = big ? [-5.4, -2.2, 1, 4.2] : [-2.6, .2];
    var hull = [[-hw, -7 * s], [hw, -7 * s], [hw, 5 * s], [0, 7.4 * s], [-hw, 5 * s]];
    cpPrism(w[0], w[1], a, hull, -.2, .3, ["#a8342a", "#b8443a", "#8a2a20", "#2a1010"]); cpPrism(w[0], w[1], a, hull, .3, 1.5, ["#c8a07a", "#34343c", "#1e1e24", "#101014"]);
    var sp = T.P(0, -1 * s, 0); cpBox3(sp[0], sp[1], a, hw * 1.5, 7 * s, 1.5, 2.4, CP_WHITE); var s2 = T.P(0, -1.4 * s, 0); cpBox3(s2[0], s2[1], a, hw * 1.2, 4 * s, 2.4, 3.0, CP_WHITE);
    fn.forEach(function (v, i) { var f = T.P(0, v, 0); cpBox3(f[0], f[1], a, .7, .9, 3.0, 4.6, ["#e8a03a", "#f0b04a", "#b8802a", "#4a2a10"]); cpBox3(f[0], f[1], a, .72, .92, 4.6, 5.0, CP_IRON); if (!big || i < 3) cpSmoke(T.P(0, v, 5.2), t, 4); });
    cpLine3(T.P(0, -6 * s, 1.5), T.P(0, -6 * s, 7), "#3a2414"); cpLine3(T.P(0, 5.4 * s, 1.5), T.P(0, 5.4 * s, 7.4), "#3a2414"); cpLine3(T.P(0, -6 * s, 7), T.P(0, 5.4 * s, 7.4), "#c8bca8");
    if (o.ropes && !o.snapped) { var AN = cp.anc[o.leg], b1 = cpW(AN, -8.75, 31), b2 = cpW(AN, -8.75, 12); cpRope3(T.P(-hw, 6.2, 1.45), [b1[0], b1[1], 1.5], .3, "#e0d0a8"); cpRope3(T.P(-hw, -6.4, 1.45), [b2[0], b2[1], 1.5], .3, "#e0d0a8"); }
  }
  function cpTugM(w, a, t, o, kind) {
    var T = cpLoc(w[0], w[1], a), s = kind === "tender" ? 1.45 : 1, hc = kind === "pilot" ? ["#c8a07a", "#2a3a5a", "#1a2a44", "#0a1222"] : kind === "tender" ? ["#c8a07a", "#2e2e34", "#1e1e22", "#0a0a0e"] : ["#c8a07a", "#8a3a2a", "#5a2418", "#2a1008"];
    var th = [[-.8 * s, -2.1 * s], [.8 * s, -2.1 * s], [.8 * s, 1.2 * s], [0, 2.2 * s], [-.8 * s, 1.2 * s]];
    cpPrism(w[0], w[1], a, th, -.1, .75, hc); var tc = T.P(0, -.3 * s, 0); cpBox3(tc[0], tc[1], a, 1 * s, (kind === "tender" ? 2.4 : 1.4) * s, .75, 1.45, CP_WHITE);
    var tf = T.P(0, .05 * s, 0), fc = kind === "tug" ? ["#c8342a", "#d8463c", "#9a2a20", "#3a1008"] : ["#e8a03a", "#f0b04a", "#b8802a", "#4a2a10"]; cpBox3(tf[0], tf[1], a, .45, .45, 1.45, 2.4, fc); cpBox3(tf[0], tf[1], a, .47, .47, 2.15, 2.4, CP_IRON); cpSmoke(T.P(0, .05 * s, 2.6), t, 3);
    if (kind === "pilot") { var m = T.P(0, 1.2, 0); cpLine3([m[0], m[1], .75], [m[0], m[1], 3.2], "#3a2414"); var fp = cpProj(m[0], m[1], 3.2); if (fp) { var fw = Math.floor(t / 250) % 2; mR(cpc, Math.round(fp.x) + 1, Math.round(fp.y), 4 - fw, 2, "#d8463c"); mR(cpc, Math.round(fp.x) + 1, Math.round(fp.y) + 2, 4, 2, "#f8f4ec"); } }
    if (o.tow && o.leg === cp.leg && !(cp.anim && cp.anim.u > .6)) cpRope3(T.P(0, -2.1, .75), shipW(o.x > 0 ? .4 : -.4, 2.1, 1.35), .5, "#d8c8a0");
  }
  function cpKind(o, w, a, t, k) {
    var T = cpLoc(w[0], w[1], a);
    if (k === "ship") return cpShip3(w, a, t, o);
    if (k === "tug" || k === "pilot" || k === "tender") return cpTugM(w, a, t, o, k);
    if (k === "pax") return cpHam(w[0], w[1], .9, (o.c || 0) * 7 + 3, t);
    if (k === "boat" || k === "schooner") { var sc = k === "schooner", L = sc ? 2.8 : 1.7, hw = sc ? .75 : .55;
      cpPrism(w[0], w[1], a, [[-hw, -L], [hw, -L], [hw, L * .55], [0, L], [-hw, L * .55]], -.1, .45, sc ? ["#c8a07a", "#3a5a7a", "#26405a", "#10202e"] : ["#c8a07a", "#a8744a", "#7a5032", "#3a2414"]);
      (sc ? [[-.9, 4.2], [1.1, 4.8]] : [[.2, 3.2]]).forEach(function (m, i) { var mb = T.P(0, m[0], 0); cpLine3([mb[0], mb[1], .45], [mb[0], mb[1], m[1]], "#3a2414");
        var sail = sc ? [T.P(0, m[0] - .15, .8), T.P(0, m[0] - .15, m[1] - .3), T.P(0, m[0] - 1.9, m[1] - .9), T.P(0, m[0] - 1.9, .9)] : [T.P(0, m[0], .7), T.P(0, m[0], m[1] - .2), T.P(0, m[0] - 1.5, .8)];
        cpPolyW(sail, "#fff8ec", "#a8987a");
        if (sc && i === 1) { var fp = cpProj(mb[0], mb[1], m[1]); if (fp) { var fw = Math.floor(t / 250) % 2; mR(cpc, Math.round(fp.x) - 4 - fw, Math.round(fp.y), 3, 2, "#d8463c"); mR(cpc, Math.round(fp.x) - 4, Math.round(fp.y) + 2, 3, 2, "#ffd34a"); mR(cpc, Math.round(fp.x) - 4 - fw, Math.round(fp.y) + 4, 3, 2, "#d8463c"); } } });
      return; }
    if (k === "dinghy") { cpPrism(w[0], w[1], a, [[-.35, -.8], [.35, -.8], [.35, .5], [0, .85], [-.35, .5]], -.05, .3, ["#c8945a", "#a8744a", "#7a5032", "#3a2414"]); cpHam(T.P(0, -.3, 0)[0], T.P(0, -.3, 0)[1], .2, 2, t); cpHam(T.P(0, .3, 0)[0], T.P(0, .3, 0)[1], .2, 9, t);
      var ow = Math.floor(t / 300) % 2 ? .3 : -.3; cpLine3(T.P(-.35, 0, .3), T.P(-1.1, ow, 0), "#3a2414"); cpLine3(T.P(.35, 0, .3), T.P(1.1, ow, 0), "#3a2414"); return; }
    if (k === "light") { cpPrism(w[0], w[1], a, [[-.8, -3], [.8, -3], [.8, 2], [0, 3], [-.8, 2]], -.1, 1.0, ["#c8a07a", "#d8463c", "#a02e26", "#3a1008"]); var dh = T.P(0, -1, 0); cpBox3(dh[0], dh[1], a, 1, 1.4, 1.0, 1.6, CP_WHITE);
      var mt = T.P(0, .6, 0); cpLine3([mt[0], mt[1], 1.0], [mt[0], mt[1], 4.4], "#3a2414"); var on = cpBlink(t); cpPrism(mt[0], mt[1], a, cpOct(.3), 4.2, 4.7, [on ? "#ffe08a" : "#8a7a4a", on ? "#fff4b0" : "#9a8a5a", on ? "#ffd34a" : "#6a5a3a", "#3a2414"]); return; }
    if (k === "buoyR") { cpPrism(w[0], w[1], 0, cpOct(.34), 0, 1.0, ["#e8584a", "#d8463c", "#9a2a20", "#3a1008"]); if (cpBlink(t, w[0])) cpBill([w[0], w[1], 1.2], 1, 1, "#ffd34a"); return; }
    if (k === "buoyG") { var G = ["#5ab04a", "#4a9a3a", "#2e6a26", "#102a0c"]; cpPrism(w[0], w[1], 0, cpOct(.4), 0, .4, G); cpPrism(w[0], w[1], 0, cpOct(.27), .4, .75, G); cpPrism(w[0], w[1], 0, cpOct(.14), .75, 1.05, G); if (cpBlink(t, w[0])) cpBill([w[0], w[1], 1.25], 1, 1, "#ffd34a"); return; }
    if (k === "wood") { cpBox3(w[0], w[1], a + .8, .36, 2.6, -.05, .22, ["#b8844c", "#8a5a32", "#6a4428", "#2a1a10"]); return; }
    if (k === "floe" || k === "ice") { var IC = ["#ffffff", "#d8ecf8", "#a8c8dc", "#4a6a80"], blob = function (r, n, sd) { var p = []; for (var i = 0; i < n; i++) { var an = i / n * Math.PI * 2, rr = r * (.75 + cpHash(i + sd, 5) * .4); p.push([rr * Math.cos(an), rr * Math.sin(an)]); } return p; };
      if (k === "floe") { cpPrism(w[0], w[1], a, blob(1.5, 7, 3), -.05, .25, IC); return; }
      var R0 = o.big ? 3.4 : 1.8; cpPrism(w[0], w[1], a, blob(R0, 8, 1), -.1, R0 * .4, IC); var c2 = T.P(R0 * .15, R0 * .1, 0); cpPrism(c2[0], c2[1], a, blob(R0 * .7, 7, 2), R0 * .4, R0 * 1.0, IC); var c3 = T.P(-R0 * .2, R0 * .15, 0); cpPrism(c3[0], c3[1], a, blob(R0 * .38, 6, 4), R0 * 1.0, R0 * 1.55, IC); return; }
    if (k === "tower") { cpPrism(w[0], w[1], a, cpOct(1.8), -.2, .9, ["#8a8a84", "#7a7a74", "#5a5a54", "#2a2a26"]); var oc = cpOct(.55), C2 = ["#d8463c", "#d8463c", "#a02e26", "#3a2414"];
      cpPrism(w[0], w[1], a, oc, .9, 2.0, CP_WHITE); cpPrism(w[0], w[1], a, oc, 2.0, 3.0, C2); cpPrism(w[0], w[1], a, oc, 3.0, 3.9, CP_WHITE); var on2 = cpBlink(t); cpPrism(w[0], w[1], a, cpOct(.42), 3.9, 4.4, [on2 ? "#ffe08a" : "#8a7a4a", on2 ? "#fff4b0" : "#9a8a5a", on2 ? "#ffd34a" : "#6a5a3a", "#3a2414"]); return; }
    if (k === "pier") { var pf = T.P(0, 1.6, 0); cpBox3(pf[0], pf[1], a, 30, 3.2, 0, 1.2, CP_STONE);
      for (var px = -13; px <= 13; px += .7) { var hv = cpHash(Math.round(px * 10), 77); if (hv > .75) continue; var hp = T.P(px, .5 + cpHash(Math.round(px * 10), 5) * 1.6, 0); cpHam(hp[0], hp[1], 1.2, Math.floor(hv * 1000), t); }
      var sh = T.P(0, 6, 0); cpBox3(sh[0], sh[1], a, 16, 5, 1.2, 4.0, ["#c8a07a", "#d8b08a", "#a8805a", "#4a3020"]); cpRoof(sh[0], sh[1], a, 16.4, 5.4, 4.0, 1.4, ["#8a3a2a", "#9a4a3a", "#6a2a1a", "#3a1008"], [0, "#d8b08a", "#a8805a"]); return; }
  }
  // ---- sparks, splinters and spray: little particles in the world ----
  function cpBurst(p, n, cols, spd, up) { cp.fx = cp.fx || []; for (var i = 0; i < n; i++) { var an = Math.random() * Math.PI * 2, sp = spd * (.4 + Math.random() * .8); cp.fx.push({ x: p[0], y: p[1], z: p[2], vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, vz: up * (.5 + Math.random()), l: .7 + Math.random() * .6, c: cols[i % cols.length] }); } }
  function cpFxDraw(t) { var dt = Math.min(.05, (t - (cp.fxT || t)) / 1000); cp.fxT = t; if (!cp.fx || !cp.fx.length) return;
    cp.fx = cp.fx.filter(function (q) { q.l -= dt; q.vz -= 9 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; if (q.z < 0) q.l = 0; var p = q.l > 0 && cpProj(q.x, q.y, q.z); if (p) mR(cpc, Math.round(p.x), Math.round(p.y), p.f < 6 ? 2 : 1, p.f < 6 ? 2 : 1, q.c); return q.l > 0; }); }
  // the Mümmel: moored parallel, then the suction swings her stern out round her bow; at speed the pull is stronger
  function cpSwA(o, uu, lvl) {
    var S = o.sw; if (uu != null) return -.12 + ([-.42, -.64, -.78][lvl] + .12) * cpSm(uu / .45);
    if (o.leg !== cp.leg) return 0; var A = cp.anim, now = performance.now();
    if (!A) return o.snapped ? -.12 : 0;
    if (A.lead) return -.12 * cpSm(((A.v || 0) - .35) / .65);
    if (A.seq) return (o.aEnd != null ? o.aEnd : -.42) * (1 - cpSm(A.seqV || 0));
    if (o.kT) return o.aK + .42 * cpSm((now - o.kT) / 1100);
    if (A.lvl == null) return o.snapped ? -.12 : 0;
    return cpSwA(o, A.u || 0, A.lvl);
  }
  function cpSwPos(o, a) { var S = o.sw; return [S.px - 7.4 * Math.sin(a), S.py - 7.4 * Math.cos(a)]; }
  function cpSwPts(o, a) { var c = cpSwPos(o, a); return [-7, -4.5, -2].map(function (v) { return [c[0] + v * Math.sin(a), c[1] + v * Math.cos(a)]; }); }
  function cpModel(o, w, t) {
    var a = cp.anc[o.leg].h + (o.a || 0), T = cpLoc(w[0], w[1], a);
    if (o.k !== "m3") return cpKind(o, w, a, t, o.k);
    if (o.m === "shed") { var W = o.w, L = o.l; cpBox3(w[0], w[1], a, W, L, 1.2, 4.2, ["#b8644a", "#c8745a", "#8a4a36", "#4a2418"]);
      [-1, 1].forEach(function (su) { var u = su * (W / 2 + .03), n = T.N(su, 0); if (!cpSees([T.P(u, -L / 2, 1.2), T.P(u, L / 2, 4.2)], n)) return;
        for (var v = -L / 2 + 1.4; v < L / 2 - 1; v += 2.1) { if (Math.abs(v) < 1.6) continue; [[2, 2.8], [3.2, 3.9]].forEach(function (zz) { cpPolyW([T.P(u, v - .45, zz[0]), T.P(u, v + .45, zz[0]), T.P(u, v + .45, zz[1]), T.P(u, v - .45, zz[1])], "#2a3a4a"); cpLine3(T.P(u, v - .45, zz[0]), T.P(u, v + .45, zz[0]), "#e8d8b0"); }); }
        cpPolyW([T.P(u, -1.3, 1.2), T.P(u, 1.3, 1.2), T.P(u, 1.3, 3.1), T.P(u, -1.3, 3.1)], "#5a3a22", "#2a1a10"); cpLine3(T.P(u, 0, 1.2), T.P(u, 0, 3.1), "#3a2414"); });
      cpRoof(w[0], w[1], a, W + .5, L + .5, 4.2, 1.7, ["#6a7a8a", "#7a8a9a", "#4a5a6a", "#2a3440"], [0, "#c8745a", "#8a4a36"]);
      var fl = T.P(0, L / 2 - 1, 5.9); cpLine3(T.P(0, L / 2 - 1, 5.0), fl, "#3a2414"); var fp = cpProj(fl[0], fl[1], fl[2]); if (fp) { var fx = Math.round(fp.x), fy = Math.round(fp.y), fw = Math.floor(t / 300) % 2; mR(cpc, fx + 1, fy, 4, 1, "#d8463c"); mR(cpc, fx + 1, fy + 1, 4 - fw, 1, "#f8f4ec"); mR(cpc, fx + 1, fy + 2, 4, 1, "#3a5a8a"); }
      return; }
    if (o.m === "crane") { var s = o.side;
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (l) { var q = T.P(l[0] * .9, l[1] * .9, 0); cpBox3(q[0], q[1], a, .26, .26, 1.2, 4.4, CP_RUST); });
      cpLine3(T.P(-.9, -.9, 3), T.P(.9, .9, 3), "#8a3a24"); cpLine3(T.P(.9, -.9, 3), T.P(-.9, .9, 3), "#8a3a24");
      var cb = T.P(0, 0, 0); cpBox3(cb[0], cb[1], a, 2.1, 2.5, 4.4, 5.8, ["#e8dcc8", "#f0e8d8", "#c8bca8", "#4a3a2a"]); cpBox3(cb[0], cb[1], a, 2.3, 2.7, 5.8, 6.05, CP_RUST);
      var cw = T.P(s * 1.7, 0, 0); cpBox3(cw[0], cw[1], a, 1, 1.4, 5.0, 5.8, CP_IRON);
      var j0 = T.P(-s * 1.0, -.3, 5.6), j1 = T.P(-s * 1.0, .3, 5.6), tp = T.P(-s * 7.5, 0, 9.6); cpLine3(j0, tp, "#a8442a"); cpLine3(j1, tp, "#a8442a");
      for (var jj = 1; jj < 7; jj++) { var u2 = jj / 7, A = [j0[0] + (tp[0] - j0[0]) * u2, j0[1] + (tp[1] - j0[1]) * u2, j0[2] + (tp[2] - j0[2]) * u2], B = [j1[0] + (tp[0] - j1[0]) * u2, j1[1] + (tp[1] - j1[1]) * u2, j1[2] + (tp[2] - j1[2]) * u2]; cpLine3(A, B, "#8a3a24"); }
      cpLine3(T.P(0, 0, 6.05), tp, "#3a3a3a"); var hk = T.P(-s * 7.5, 0, 4.8); cpLine3(tp, hk, "#3a3a3a"); cpBox3(hk[0], hk[1], a, .3, .3, 4.5, 4.8, CP_IRON);
      return; }
    if (o.m === "lhouse") { var oc = cpOct(.55), C2 = [o.c, o.c, o.c, "#3a2414"];
      cpPrism(w[0], w[1], a, cpOct(.8), 1.2, 1.6, CP_STONE); cpPrism(w[0], w[1], a, oc, 1.6, 2.6, CP_WHITE); cpPrism(w[0], w[1], a, oc, 2.6, 3.4, C2); cpPrism(w[0], w[1], a, oc, 3.4, 4.0, CP_WHITE);
      var on = Math.floor(t / 600) % 2; cpPrism(w[0], w[1], a, cpOct(.42), 4.0, 4.5, [on ? "#ffe08a" : "#8a7a4a", on ? "#fff4b0" : "#9a8a5a", on ? "#ffd34a" : "#6a5a3a", "#3a2414"]); cpPrism(w[0], w[1], a, cpOct(.6), 4.5, 4.7, C2);
      return; }
    if (o.m === "ship3") return cpShip3(w, a, t, o);
    if (o.m === "tug") {
      var th = [[-.8, -2.1], [.8, -2.1], [.8, 1.2], [0, 2.2], [-.8, 1.2]];
      cpPrism(w[0], w[1], a, th, -.1, .75, ["#c8a07a", "#8a3a2a", "#5a2418", "#2a1008"]); var tc = T.P(0, -.3, 0); cpBox3(tc[0], tc[1], a, 1, 1.4, .75, 1.45, CP_WHITE);
      var tf = T.P(0, .05, 0); cpBox3(tf[0], tf[1], a, .45, .45, 1.45, 2.4, ["#c8342a", "#d8463c", "#9a2a20", "#3a1008"]); cpBox3(tf[0], tf[1], a, .47, .47, 2.15, 2.4, CP_IRON);
      var ts = cpProj(tf[0], tf[1], 2.6); if (ts) for (var k2 = 0; k2 < 3; k2++) mR(cpc, Math.round(ts.x) - k2 * 2 - (Math.floor(t / 350) % 2), Math.round(ts.y) - k2 * 2 - 1, 2, 2, "#c8c8d0");
      if (o.tow && o.leg === cp.leg && !(cp.anim && cp.anim.u > .6)) cpRope3(T.P(0, -2.1, .75), shipW(o.x > 0 ? .4 : -.4, 2.1, 1.35), .5, "#d8c8a0");
      return; }
  }
  // the foredeck of the Pausbacke below the windows: planks, hatch, windlass, white bulwarks, the jack staff
  var CP_DECK = [[-2.7, -5.6], [2.7, -5.6], [2.5, -1], [1.6, 1], [0, 2.4], [-1.6, 1], [-2.5, -1]];
  function cpDeck(t) {
    var Wd = function (p, z) { return shipW(p[0], p[1], z); }, zd = 1.0, zb = 1.45;
    cpPolyW(CP_DECK.map(function (p) { return Wd(p, zd); }), "#c8945a");
    for (var sx = -2.1; sx <= 2.1; sx += .6) cpLine3(Wd([sx, -5.6], zd), Wd([sx, 2.4 - Math.abs(sx) * .95], zd), "#b07c48");
    var hc = shipW(0, -3.6); cpBox3(hc[0], hc[1], cp.h, 2.2, 1.5, zd, zd + .3, ["#8a5a32", "#a87448", "#6a4428", "#3a2414"]);
    [-.75, .75].forEach(function (sx) { var d = shipW(sx, .2); cpBox3(d[0], d[1], cp.h, .55, .55, zd, zd + .42, CP_IRON); cpLine3(shipW(sx, .45, zd + .1), shipW(sx * 1.4, 1.2, zd + .05), "#5a5a62"); });
    for (var i = 1; i < CP_DECK.length; i++) { var p = CP_DECK[i], q = CP_DECK[(i + 1) % CP_DECK.length];
      cpPolyW([Wd(p, zd), Wd(q, zd), Wd(q, zb), Wd(p, zb)], "#e0d8c8"); cpLine3(Wd(p, zb), Wd(q, zb), "#8a5a32"); cpLine3(Wd(p, zd + .02), Wd(q, zd + .02), "#a89c88"); }
    var top = shipW(0, 2.2, 2.5); cpLine3(shipW(0, 2.2, zb), top, "#3a2414"); var fp = cpProj(top[0], top[1], top[2]);
    if (fp) { var fx = Math.round(fp.x), fy = Math.round(fp.y), fw = Math.floor(t / 250) % 2; mR(cpc, fx + 1, fy, 5 - fw, 2, "#d8463c"); mR(cpc, fx + 1, fy + 2, 5, 2, "#f8f4ec"); mR(cpc, fx + 1, fy + 4, 5 - fw, 1, "#d8463c"); }
  }
  // the mooring lines at Southamsterton: tight at first, cast off from the bollards, they drop into the water and are hauled in
  function cpRopes() {
    if (cp.leg !== 0 || cp.castOff) return; var v = cp.anim && cp.anim.pre ? cp.anim.preV || 0 : 0;
    [[[2.2, .7], [4.45, 6.5]], [[2.45, -1.6], [4.45, 1.5]]].forEach(function (r, i) {
      var a = shipW(r[0][0], r[0][1], 1.45), q = cpW(cp.anc[0], r[1][0], r[1][1]), bol = [q[0], q[1], 1.5], wat = [q[0] - 1.1, q[1] - .4, 0], e, sag;
      var vv = Math.max(0, v - i * .08);
      if (vv < .25) { e = bol; sag = .25; } else if (vv < .55) { var u = (vv - .25) / .3; e = [bol[0] + (wat[0] - bol[0]) * u, bol[1] + (wat[1] - bol[1]) * u, 1.5 * (1 - u * u)]; sag = .25 + u * .6; }
      else if (vv < 1) { var u2 = (vv - .55) / .45; e = [wat[0] + (a[0] - wat[0]) * u2, wat[1] + (a[1] - wat[1]) * u2, a[2] * u2]; sag = .85 * (1 - u2); } else return;
      cpRope3(a, e, sag, "#e0d0a8"); });
  }
  function cpWorldDraw(t, glass) {
    var A0 = cp.anim, sv = A0 && A0.seq ? A0.seqV || 0 : -1, G0 = [], G1 = [], G3 = [], byf = function (a, b) { return b[1].f - a[1].f; };
    cp.O.forEach(function (o) { if (o.hid) return; if (o.k === "quay") { G0.push(o); return; }
      if (o.so && !(o.leg === cp.leg && sv >= 0 && (!o.w || sv >= o.w[0] && sv <= o.w[1]))) return;   // sequence actors only while their scene plays
      var q = cpWP(o);
      if (o.k === "m3" || CP_3K[o.k]) { var c = cpC(q[0], q[1], 0); if (c[0] < -9 || c[0] > 95) return;
        if (o.k !== "m3" && !glass && cpHidden(o, c[0])) { var pu = cpProj(q[0], q[1]); if (pu) G3.push([o, pu]); return; }
        (CP_LAND[o.m] ? G1 : G3).push([o, { f: c[0], w: q, m: 1 }]); return; }
      var p = cpProj(q[0], q[1]); if (!p || p.f > 70 || p.x < -60 || p.x > 240) return; G3.push([o, p]); });
    G0.forEach(function (o) { cpQuay3(o, t, 0); }); G1.sort(byf).forEach(function (v) { cpModel(v[0], v[1].w, t); }); G0.forEach(function (o) { cpQuay3(o, t, 1); });
    G3.sort(byf).forEach(function (v) { var o = v[0], p = v[1]; if (p.m) return cpModel(o, p.w, t); var X = Math.round(p.x), Y = Math.round(p.y);
      if (o.k === "pier") return cpPier(p, t);
      if (o.ani && p.f < 18) return;                                     // the animals dive before the ship comes close
      if (!glass && cpHidden(o, p.f)) { cpUnknown(X, Y, p.sz, t); return; }
      cpThing(o, X, Y, p.sz, t); });
    cpFxDraw(t);
  }
  // ---- the binoculars: look around by dragging, turn the focus until it is sharp; held sharp on something, it is recognised ----
  function cpDrawGlass(t) {
    var g = cp.glass, sky = cpSky(), P = CP_SEA[sky], skc = P[0], sea = P[1], r = 0;
    CAMV = { yaw: g.yaw, Z: 3, hz: 46 };
    try {
      for (var y = 0; y < 135; y++) { cpc.fillStyle = y < 46 ? skc[y < 18 ? 0 : y < 36 ? 1 : 2] : (cpHash(y, 7) < .6 ? sea[0] : sea[1]); cpc.fillRect(0, y, 180, 1); }
      cp.B.forEach(function (o) { cpBack(o, sky); }); cpFoam(sea[2], t); cpWorldDraw(t, true);
      if (sky === "fog") { cpc.fillStyle = "rgba(226,232,236,.4)"; cpc.fillRect(0, 0, 180, 135); }
      var cand = null, cd = 99, nf = 40, nd = 99;
      cp.O.forEach(function (o) { if (o.hid || o.so || o.k === "quay" || o.k === "pier") return; var q = cpWP(o), p = cpProj(q[0], q[1], o.k === "m3" ? 2 : 0); if (!p || p.f > 70) return; if (o.ani && p.f < 18) return;
        var d = Math.hypot(p.x - 90, p.y - 6 - 64); if (d < nd) { nd = d; nf = p.f; } if (o.k !== "m3" && cpHidden(o, p.f) && d < cd) { cd = d; cand = [o, p]; } });
      var tgt = cand && cd < 18 ? cand[1].f : nd < 26 ? nf : 40; r = Math.min(3, Math.floor(Math.abs(g.foc - tgt) / (tgt * .1 + 1.2)));
      var dt = Math.min(.1, (t - (g.lt || t)) / 1000); g.lt = t;
      if (cand && cd < 18 && r === 0) { g.hold += dt; if (g.hold > .55) { cpFound(cand[0]); g.hold = 0; } } else g.hold = 0;
    } catch (e) { }
    CAMV = { yaw: 0, Z: 1, hz: CP_HZ };
    var im = cpc.getImageData(0, 0, 180, 135), D = im.data;
    if (r > 0) [1, 180].forEach(function (st) { var src = new Uint8ClampedArray(D), lim = st === 1 ? 180 : 135;
      for (var yy = 0; yy < 135; yy++) for (var xx = 0; xx < 180; xx++) { var pos = st === 1 ? xx : yy, sr = 0, sg = 0, sb = 0, n = 0;
        for (var k = -r; k <= r; k++) { var pp = pos + k; if (pp < 0 || pp >= lim) continue; var ii = ((st === 1 ? yy * 180 + pp : pp * 180 + xx)) * 4; sr += src[ii]; sg += src[ii + 1]; sb += src[ii + 2]; n++; }
        var o2 = (yy * 180 + xx) * 4; D[o2] = sr / n; D[o2 + 1] = sg / n; D[o2 + 2] = sb / n; } });
    var tick = g.hold > 0 ? [255, 211, 74] : [32, 32, 40];
    for (var y3 = 0; y3 < 135; y3++) for (var x3 = 0; x3 < 180; x3++) { var d1 = (x3 + .5 - 66) * (x3 + .5 - 66) + (y3 + .5 - 64) * (y3 + .5 - 64), d2 = (x3 + .5 - 114) * (x3 + .5 - 114) + (y3 + .5 - 64) * (y3 + .5 - 64), i3 = (y3 * 180 + x3) * 4, c3 = null;
      if (d1 > 1936 && d2 > 1936) c3 = d1 < 2070 || d2 < 2070 ? [58, 58, 68] : [20, 16, 24];
      else if ((y3 === 64 && (x3 === 83 || x3 === 84 || x3 === 96 || x3 === 97)) || (x3 === 90 && (y3 === 57 || y3 === 58 || y3 === 70 || y3 === 71))) c3 = tick;
      if (c3) { D[i3] = c3[0]; D[i3 + 1] = c3[1]; D[i3 + 2] = c3[2]; } }
    cpc.putImageData(im, 0, 0);
  }
  function cpFound(it) {
    it.seen = true; beep([[1046, .04], [1318, .06]]);
    var msg = it.k === "ice" ? "Ein Eisberg!" : it.k === "floe" ? "Eine Scholle" : it.k === "boat" ? "Ein Fischerboot!" : it.k === "wood" ? "Treibholz!" : it.k === "ship" ? "Ein Dampfer" : CP_NAME[it.k] || "";
    if (it.ani) { var LG = cpLog(), first = !LG[it.k]; LG[it.k] = (LG[it.k] || 0) + 1; if (cp.found.indexOf(it.k) < 0) cp.found.push(it.k); if (first) cp.newF.push(it.k); msg = first ? "Neu im Logbuch: " + CP_NAME[it.k] + "!" : CP_NAME[it.k] + "!"; if (window.SudokuSave) window.SudokuSave(); }
    cpSay(msg);
  }
  function cpGlass(on, yaw) { if (!cp || cp.anim) return; cp.glass = on ? { yaw: yaw || 0, foc: 8, hold: 0 } : null; if (on && !cp.glassTold) { cp.glassTold = 1; cpSay("Ziehen zum Umsehen · Schärfe einstellen"); } cpPanelDraw(); if (on) { if (!cpRaf) cpRaf = requestAnimationFrame(cpDraw); } else cpRedraw(); }
  var cpFrameCv = null;
  function cpFrame() {                                                  // the wheelhouse: wood all round three big windows with brass frames (drawn once)
    if (cpFrameCv) return cpFrameCv; var cv = document.createElement("canvas"); cv.width = 180; cv.height = 135; var g = cv.getContext("2d");
    for (var x = 0; x < 180; x++) { g.fillStyle = (x / 6 | 0) % 2 ? "#8a5a34" : "#7a4e2a"; g.fillRect(x, 0, 1, 80); }
    g.fillStyle = "#5a3a22"; g.fillRect(0, 0, 180, 3);
    [[6, 52], [64, 52], [122, 52]].forEach(function (w) { g.clearRect(w[0], 5, w[1], 70); g.fillStyle = "#3a2414"; g.fillRect(w[0] - 2, 3, w[1] + 4, 2); g.fillRect(w[0] - 2, 75, w[1] + 4, 2); g.fillRect(w[0] - 2, 3, 2, 74); g.fillRect(w[0] + w[1], 3, 2, 74);
      g.fillStyle = "#c8a040"; g.fillRect(w[0] - 1, 4, w[1] + 2, 1); g.fillRect(w[0] - 1, 4, 1, 72); g.fillStyle = "#f0d070"; g.fillRect(w[0], 4, w[1], 1); });
    g.fillStyle = "#3a2414"; g.fillRect(0, 78, 180, 2); g.fillStyle = "#c8945a"; g.fillRect(0, 80, 180, 4); g.fillStyle = "#e0b07a"; g.fillRect(0, 80, 180, 1);
    for (var y = 84; y < 135; y++) { g.fillStyle = (y / 7 | 0) % 2 ? "#6a4428" : "#5a3a22"; g.fillRect(0, y, 180, 1); }
    g.fillStyle = "#3a2414"; g.fillRect(25, 114, 10, 21); g.fillStyle = "#c8a040"; g.fillRect(26, 114, 8, 21); g.fillStyle = "#f0d070"; g.fillRect(26, 114, 2, 21);
    g.fillStyle = "#3a2414"; g.fillRect(139, 112, 16, 23); g.fillStyle = "#3a5a8a"; g.fillRect(140, 112, 14, 23); g.fillStyle = "#4a6a9a"; g.fillRect(140, 112, 3, 23);
    cpFrameCv = cv; return cv;
  }
  var CP_TEL = [-150, -90, -30];                                         // telegraph needle angles: Stopp, Halbe, Volle
  function cpBridge(t) {
    cpc.drawImage(cpFrame(), 0, 0);
    // engine telegraph: Stopp red, Halbe yellow, Volle green
    var tx = 30, ty = 101;
    cpBlob(tx, ty, 14, 14, function (dx, dy) { var d = dx * dx + dy * dy; return d > .8 ? "#c8a040" : d > .72 ? "#3a2414" : dy > .35 ? "#e8dcc8" : "#f8f4ec"; });
    [["#d8463c", 0], ["#e8b03a", 1], ["#4a9a3a", 2]].forEach(function (m) { var a = CP_TEL[m[1]] * Math.PI / 180, on = cp.lvl === m[1]; cpBlob(tx + Math.cos(a) * 8.5, ty + Math.sin(a) * 8.5, on ? 2.6 : 1.8, on ? 2.6 : 1.8, function () { return m[0]; }); });
    var na = CP_TEL[cp.lvl] * Math.PI / 180; for (var k = 0; k < 8; k++) mR(cpc, Math.round(tx + Math.cos(na) * k), Math.round(ty + Math.sin(na) * k), 2, 1, "#3a2414"); mR(cpc, tx - 1, ty - 1, 3, 3, "#3a2414");
    // compass
    cpBlob(147, 109, 11, 6, function (dx, dy) { var d = dx * dx + dy * dy; return d > .72 ? "#c8a040" : "#f8f4ec"; });
    mR(cpc, Math.round(147 - Math.sin(cp.h) * 8), Math.round(109 - Math.cos(cp.h) * 4), 2, 2, "#c83a2a");
    // whistle cord with its wooden handle on the right; pulled down when set
    var pull = cp.wh ? 6 : 0; mR(cpc, 170, 0, 1, 94 + pull, "#e8d8b0"); cpBox(167, 94 + pull, 7, 10, "#c8945a", "#e0b07a"); mR(cpc, 169, 96 + pull, 3, 6, "#8a5a32");
    if (cpLeg().wh && !cp.wh && !cp.anim) { var bl = Math.floor(t / 400) % 2; if (bl) { mR(cpc, 165, 92, 11, 1, "#ffd34a"); mR(cpc, 165, 105, 11, 1, "#ffd34a"); } }
    // the ship's wheel
    var ang = (cp.wheelA != null ? cp.wheelA : cp.rud * .45) + (cp.anim ? Math.sin(t / 500) * .03 : 0), cx = 90, cy = 112;
    for (var a = 0; a < 8; a++) { var aa = ang + a * Math.PI / 4; for (var r = 4; r < 27; r++) { var px = Math.round(cx + Math.cos(aa) * r), py = Math.round(cy + Math.sin(aa) * r); if (py < 135) mR(cpc, px, py, r > 22 ? 2 : 1, r > 22 ? 2 : 1, r > 22 ? "#c8945a" : "#e0b07a"); } }
    for (var q = 0; q < 160; q++) { var b = q / 160 * Math.PI * 2; for (var rr = 17; rr <= 20; rr++) { var qx = Math.round(cx + Math.cos(b) * rr), qy = Math.round(cy + Math.sin(b) * rr); if (qy < 135) mR(cpc, qx, qy, 1, 1, rr === 17 || rr === 20 ? "#5a3a22" : (q % 9 ? "#a87448" : "#8a5a32")); } }
    cpBlob(cx, cy, 4.5, 4.5, function (dx, dy) { return dx + dy < 0 ? "#f0d070" : "#c8a040"; });
  }
  function cpDraw(t) {
    cpRaf = cp && (cp.anim || cp.glass) ? requestAnimationFrame(cpDraw) : 0;
    if (!cp) return;
    if (cp.glass) { cpDrawGlass(t); return; }
    try {
      var A0 = cp.anim, mixU = A0 && !A0.look ? (A0.seq ? 1 : A0.u || 0) : 0, sky2 = cpSky(cp.leg + 1), sky = cpSky(), sea = cpSeaPic(sky), sh = cp.shake > 0 || cp.ev ? Math.round(Math.sin(t / (cp.ev ? 90 : 30)) * (cp.ev && cp.shake <= 0 ? 1 : 2)) : 0, off = (((-cp.h * 160) % 180) + 180) % 180;
      cpc.setTransform(1, 0, 0, 1, 0, sh); cpc.drawImage(sea, Math.round(off) - 180, 0); cpc.drawImage(sea, Math.round(off), 0);
      if (sky2 !== sky && mixU > 0 && cp.leg + 1 < cp.route.length) { var sea2 = cpSeaPic(sky2); cpc.globalAlpha = Math.min(1, mixU * 1.3); cpc.drawImage(sea2, Math.round(off) - 180, 0); cpc.drawImage(sea2, Math.round(off), 0); cpc.globalAlpha = 1; }
      cp.B.forEach(function (o) { var fac = o.leg > cp.leg ? mixU : o.leg < cp.leg ? 1 - mixU : 1; if (fac <= 0) return;   // coasts rise over the horizon as they come, and sink behind
        cpc.save(); cpc.beginPath(); cpc.rect(0, 0, 180, CP_HZ + 1); cpc.clip(); cpc.translate(0, Math.round((1 - fac) * 18)); cpBack(o, sky); cpc.restore(); });
      cpFoam(CP_SEA[sky][1][2], t);
      // the yellow line: the whole leg as it would be sailed now
      if (!cp.anim && !cp.intro) { var S = CP_DIST[cp.lvl], AN = cp.anc[cp.leg]; for (var i = 1; i <= 20; i++) { var a0 = cpPath(cp.rud, S * i / 20), a = cpW(AN, a0[0], a0[1]), p = cpProj(a[0], a[1]); if (p && p.y < 135) mR(cpc, Math.round(p.x) - (p.sz > 2 ? 2 : 1), Math.round(p.y), p.sz > 2 ? 4 : 2, 1, "#ffd34a"); }
        var e0 = cpPath(cp.rud, S), e = cpW(AN, e0[0], e0[1]), pe = cpProj(e[0], e[1]); if (pe) mR(cpc, Math.round(pe.x) - 2, Math.round(pe.y) - 1, 5, 3, cp.lvl ? "#ffd34a" : "#d8463c"); }
      cpWorldDraw(t, false); cpDeck(t); cpRopes();
      var amt = function (k) { return (sky === k ? 1 - mixU : 0) + (sky2 === k ? mixU : 0) * (cp.leg + 1 < cp.route.length ? 1 : 0) + (sky === k && sky2 === k ? 0 : 0); };
      var fogA = sky === "fog" && sky2 === "fog" ? 1 : amt("fog"), nA = sky === "night" && sky2 === "night" ? 1 : amt("night"), stA = sky === "storm" && sky2 === "storm" ? 1 : amt("storm");
      if (fogA > .02) for (var fy = 0; fy < 80; fy++) { var al = (fy < CP_HZ ? .7 : Math.max(0, .75 - (fy - CP_HZ) / 75)) * fogA; if (al > 0) { cpc.fillStyle = "rgba(226,232,236," + al.toFixed(2) + ")"; cpc.fillRect(0, fy, 180, 1); } }
      if (nA > .02) { cpc.fillStyle = "rgba(8,14,40," + (.28 * nA).toFixed(2) + ")"; cpc.fillRect(0, 0, 180, 80); }
      if (stA > .3) { for (var rn = 0; rn < 40; rn++) { var rx = (rn * 47 + t / 4) % 180, ry = (rn * 31 + t / 2) % 78; mR(cpc, Math.round(rx), Math.round(ry), 1, 2, "#a8b8c8"); } }
      cpBridge(t);
      cpc.setTransform(1, 0, 0, 1, 0, 0);
    } catch (err) { }
    if (cp.anim) cpStep(t);
  }
  function cpRedraw() { if (!cpRaf) cpDraw(performance.now()); }
  // ---- sailing one leg ----
  function cpGo() {
    if (!cp || cp.anim || cp.intro || cp.done || cp.glass) return;
    var lvl = cp.lvl, S = CP_DIST[lvl] + (lvl === 0 && cpLeg().k === "eis" ? 5 : 0);
    var hit = cpSim(cp.rud, lvl), safe = cp.rud;
    if (hit && CP_STRUCT[hit.k]) { safe = 0; for (var rr of [0, -1, 1, -2, 2]) { var h2 = cpSim(rr, lvl); if (!h2 || !CP_STRUCT[h2.k]) { safe = rr; break; } } }
    cp.anim = { lvl: lvl, rud: cp.rud, safe: safe, S: S, dur: lvl ? 3200 : 2300, hit: hit, u: 0, pre: cp.leg === 0 && !cp.castOff ? 1 : 0 };
    if (cp.leg + 1 < cp.route.length) { var A = cp.anc[cp.leg], E = cpPath(safe, S), W = cpW(A, E[0], E[1]); cp.anc[cp.leg + 1] = { x: W[0], y: W[1], h: A.h + E[2] }; cp.info[cp.leg + 1] = null; cp.O = cp.O.filter(function (o) { return o.leg <= cp.leg; }); cp.B = cp.B.filter(function (b) { return b.leg <= cp.leg; }); cpBuild(cp.leg + 1); }
    if (cp.wh) { dzWhistle(cpLeg().k === "abfahrt" ? 2.2 : 1.4); }
    dzBell(lvl === 0 ? 1 : lvl === 1 ? 2 : 3); cpPanelDraw(); cpRaf = requestAnimationFrame(cpDraw);
  }
  function cpStep(t) {
    var A = cp.anim; if (!A.t0) A.t0 = t; if (cp.shake > 0) cp.shake -= .016;
    if (A.lead) { if (!A.lt0) A.lt0 = t; A.v = Math.min(1, (t - A.lt0) / A.dur);
      if (A.v > .35 && !A.sw.snapped) { A.sw.snapped = 1; beep([[220, .05], [140, .09]]); dzBuzz([30]); var AN0 = cp.anc[A.sw.leg]; [31, 12].forEach(function (y) { var b = cpW(AN0, -8.75, y); cpBurst([b[0] + .6, b[1], 1.3], 8, ["#e0d0a8", "#fff8ec"], 2.2, 2.5); }); cpSay("Die Leinen der Mümmel reißen!"); }
      if (A.v >= 1) { cp.anim = null; cpPanelDraw(); cpRedraw(); } return; }
    if (A.crash) { var C = A.crash, ct = t - C.t0;
      if (C.rec && ct > C.hold) { var v = cpSm((ct - C.hold) / (C.dur - C.hold)), P0 = cpPath(A.rud, C.d), P1 = cpPath(A.safe, C.d), AN1 = cp.anc[cp.leg], W1 = cpW(AN1, P0[0] + (P1[0] - P0[0]) * v, P0[1] + (P1[1] - P0[1]) * v); cp.px = W1[0]; cp.py = W1[1]; cp.h = AN1.h + P0[2] + (P1[2] - P0[2]) * v; }
      if (ct < C.dur) return; A.t0 += C.dur; if (C.rec) A.useSafe = 1; A.crash = null; }
    if (A.pre) { if (!A.pt0) A.pt0 = t; A.preV = Math.min(1, (t - A.pt0) / 2800); if (A.preV >= 1) { A.pre = 0; cp.castOff = 1; A.t0 = t; } return; }   // "Leinen los!": the lines come off first
    if (A.hold) { if (t > A.hold) cpNext(); return; }
    if (A.seq) { A.seqV = Math.min(1, (t - A.seq) / 3600); if (A.seqV >= 1) A.hold = t + 200; return; }
    var u = Math.min(1, (t - A.t0) / A.dur); A.u = u; cp.d = cpDistU(A.lvl, A.S, u); var P = cpPath(A.useSafe ? A.safe : A.rud, cp.d), AN = cp.anc[cp.leg], W = cpW(AN, P[0], P[1]); cp.px = W[0]; cp.py = W[1]; cp.h = AN.h + P[2];
    if (A.lvl && Math.random() < (A.lvl === 2 ? .9 : .45)) { var sd0 = Math.random() < .5 ? -1 : 1, bp = shipW(sd0 * (1.1 + Math.random() * .5), 2.0, .2); cp.fx = cp.fx || []; cp.fx.push({ x: bp[0], y: bp[1], z: bp[2], vx: Math.cos(cp.h) * sd0 * (1.5 + Math.random() * 1.5), vy: -Math.sin(cp.h) * sd0 * 2, vz: 2 + Math.random() * 2, l: .6, c: Math.random() < .5 ? "#ffffff" : "#d8eef8" }); }   // the bow wave
    if (cpLeg().k === "abfahrt" && A.lvl === 2) { A.splash = 1; if (Math.random() < .8) { var qy = cp.py + 2 + Math.random() * 6; cpBurst([3.9, qy, 1.0], 3, ["#ffffff", "#d8eef8", "#a8d0e8"], 1.2, 5); if (!A.wet) { A.wet = 1; cpSay("Platsch! Die Bugwelle schwappt auf den Kai!"); } } }
    if (A.hit && !A.bumped && u >= A.hit.u) { A.bumped = 1; cp.hits++; cp.shake = 1.1; beep([[110, .14], [80, .2], [60, .25]]); dzNoise(.6, 300, .8, .3, .01, .4); dzBuzz([80, 40, 160]); cpSay(CP_HITS[A.hit.k] || "Rumms!");
      var hk = A.hit.k, sd1 = A.hit.sd || 0, cpt = hk === "quay" ? shipW(cpQuaySide() * 2.4, 1.2, 1.0) : shipW(Math.max(-1.5, Math.min(1.5, sd1 * .5)), 2.5, 1.0);
      cpBurst(cpt, 26, hk === "quay" || hk === "pier" ? ["#a89c88", "#6a625c", "#ffffff", "#d8eef8"] : hk === "ice" ? ["#ffffff", "#d8ecf8", "#a8c8dc"] : hk === "gate" ? ["#8a6a4a", "#c8a87a", "#ffffff"] : ["#8a5a32", "#3a2414", "#c8945a", "#ffffff", "#e8e0d0"], 3.5, 4);
      var ho = A.hit.j != null ? cp.O[A.hit.j] : cp.O.filter(function (o) { return o.leg === cp.leg && o.sw; })[0];
      if (ho && ho.sw) { ho.aK = cpSwA(ho); ho.kT = performance.now(); } else if (ho && !CP_STRUCT[hk]) { ho.kT = performance.now(); ho.kDir = sd1 >= 0 ? 1 : -1; }
      A.crash = { t0: t, d: cp.d, rec: !!CP_STRUCT[hk], hold: 1000, dur: CP_STRUCT[hk] ? 2600 : hk === "ship" ? 2400 : 1200 }; return; }
    if (u >= 1) { cp.O.forEach(function (o) { if (o.leg === cp.leg && o.sw) o.aEnd = cpSwA(o); });
      var hasSq = (!A.hit && A.lvl === 0 && cp.O.some(function (o) { return o.leg === cp.leg && o.sq; })) || cp.O.some(function (o) { return o.leg === cp.leg && o.sqAll; });   // something to watch: boats come alongside, guests come aboard
      if (hasSq) { A.seq = t + 250; A.seqV = 0; cp.O.forEach(function (o) { if (o.leg === cp.leg && o.sq) o.seqd = 1; }); } else A.hold = t + 350; }
  }
  function cpQuaySide() { var q = cp.O.filter(function (o) { return o.leg === cp.leg && o.k === "quay"; }).map(function (o) { return [Math.abs(o.x - cpRel(cp.anc[cp.leg].x, cp.anc[cp.leg].y, cp.anc[cp.leg].h, cp.px, cp.py)[1]), o.x]; }).sort(function (a, b) { return a[0] - b[0]; })[0]; return q && q[1] < 0 ? -1 : 1; }
  function cpNext() {
    var A = cp.anim, L = cpLeg(), need = cpNeed(), why = "";
    if (A.hit) why = CP_HITS[A.hit.k] || "Rumms!";
    else if (A.lvl > need) why = L.k === "abfahrt" && A.lvl === 2 ? "Viel zu schnell im Hafen! Die Bugwelle hat die Zuschauer am Kai nass gemacht." : L.k === "newyork" ? "Zu schnell! Die Mümmel kam uns gefährlich nah." : need === 0 ? "Hier hätten wir stoppen müssen!" : "Zu schnell für diese Stelle!";
    else if (A.lvl < need) why = need === 2 ? "Zu langsam auf freier See, wir verlieren Zeit." : "Gestoppt? Hier sollten wir langsam weiterfahren.";
    else if (L.wh && !cp.wh) why = "Die Pfeife fehlte.";
    cp.O.forEach(function (o) { if (o.leg === cp.leg) o.dEnd = A.S; });
    cp.res[cp.leg] = !why; cp.pre = why ? "✘ " + why : (L.d ? "✔ " + L.d : "✔");
    cp.anim = null; cp.leg++;
    if (cp.leg >= cp.route.length) { cp.leg = cp.route.length - 1; return cpEnd(); }
    cpStartLeg();
  }
  function cpSay(t) { cpToast.textContent = t; cpToast.hidden = false; cpToast.classList.remove("pop"); void cpToast.offsetWidth; cpToast.classList.add("pop"); clearTimeout(cpSay.t); cpSay.t = setTimeout(function () { cpToast.hidden = true; }, 1600); }
  function cpSetLvl(l) { if (cp.lvl === l) return; cp.lvl = l; dzTone(880, .2, .05, "square"); dzBell(1); cpPanelDraw(); cpRedraw(); }
  // ---- input: the wheel (grab and turn), the telegraph (tap a colour), the whistle handle (pull), far things (binoculars) ----
  function cpPt(e) { var r0 = cpCv.getBoundingClientRect(); return [(e.clientX - r0.left) / r0.width * 180, (e.clientY - r0.top) / r0.height * 135]; }
  var cpWheel = null;
  var cpPan = null;
  cpCv.addEventListener("pointermove", function (e) { if (cpPan && cp && cp.glass) { var pq = cpPt(e); cp.glass.yaw = Math.max(-1.5, Math.min(1.5, cpPan.y0 - (pq[0] - cpPan.x) / 480)); return; } if (!cpWheel || !cp) return; var p = cpPt(e), a = Math.atan2(p[1] - 112, p[0] - 90), d = a - cpWheel.a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    cp.wheelA = Math.max(-1.1, Math.min(1.1, cpWheel.r0 * .45 + d)); var r = Math.max(-2, Math.min(2, Math.round(cp.wheelA / .45))); if (r !== cp.rud) { cp.rud = r; beep([[300 + r * 40, .02]]); } cpRedraw(); });
  function cpWheelUp() { cpPan = null; if (!cpWheel || !cp) return; cpWheel = null; cp.wheelA = null; cpRedraw(); }
  cpCv.addEventListener("pointerup", cpWheelUp); cpCv.addEventListener("pointercancel", cpWheelUp);
  cpCv.addEventListener("pointerdown", function (e) {
    if (!cp || cp.anim || cp.intro || cp.done) return; e.preventDefault();
    var pp = cpPt(e);
    if (cp.glass) { cpPan = { x: pp[0], y0: cp.glass.yaw }; try { cpCv.setPointerCapture(e.pointerId); } catch (er) { } return; }
    if (Math.hypot(pp[0] - 90, pp[1] - 112) < 28) { cpWheel = { a0: Math.atan2(pp[1] - 112, pp[0] - 90), r0: cp.rud }; try { cpCv.setPointerCapture(e.pointerId); } catch (er) { } return; }
    if (Math.hypot(pp[0] - 30, pp[1] - 101) < 17) { var ta = Math.atan2(pp[1] - 101, pp[0] - 30) * 180 / Math.PI, best = 1, bd2 = 999; CP_TEL.forEach(function (a, i) { var dd = Math.abs(ta - a); if (dd < bd2) { bd2 = dd; best = i; } }); if (pp[1] > 104) best = pp[0] < 26 ? 0 : pp[0] > 34 ? 2 : 1; cpSetLvl(best); return; }
    if (pp[0] > 160 && pp[1] > 84 && pp[1] < 114) { cp.wh = !cp.wh; if (cp.wh) dzWhistle(.8); else beep([[300, .03]]); cpPanelDraw(); cpRedraw(); return; }
    var x = pp[0], y = pp[1], best2 = null, bd = 99;
    cp.O.forEach(function (o) { if (o.hid || o.seen || o.k === "quay" || o.k === "pier") return; if (o.so || o.leg !== cp.leg) return; var q = cpWP(o), p = cpProj(q[0], q[1]); if (!p || p.f > 70 || !cpHidden(o, p.f)) return; if (o.ani && p.f < 18) return; var d = Math.hypot(p.x - x, (p.y - 5 - y) * 1.4); if (d < bd) { bd = d; best2 = o; } });
    if (!best2 || bd > 16) return;
    var q2 = cpWP(best2), rr = cpRel(cp.px, cp.py, cp.h, q2[0], q2[1]); cpGlass(true, Math.atan2(rr[1], rr[0]));   // tapping a "?" puts the glasses up, pointed at it
  });
  // ---- the panel: the leg, the timetable strip, what is going on, the telegraph buttons, the glasses, "Los!" ----
  function cpPanelDraw() {
    if (!cp) return; var L = cpLeg(), busy = !!cp.anim, n = cp.route.length, a = Math.max(0, Math.min(n - 7, cp.leg - 2)), strip = "";
    for (var i = a; i < a + 7 && i < n; i++) { var Li = cp.route[i], st = i < cp.leg ? (cp.res[i] ? " ok" : " bad") : i === cp.leg ? " cur" : "", ic = i === cp.leg && cp.ev ? "sturm" : DZ_RI[Li.s];
      strip += '<b class="dz-t o-cap' + st + '"><img src="' + DZ["ri_" + ic] + '" alt="">' + (Li.wh ? '<img class="dz-wh" src="' + DZ.ri_wh + '" alt="">' : "") + '</b>'; }
    var tx = cp.ev ? "Funkspruch: Ein Sturm zieht auf! Bei dem Seegang lieber langsamer." : (CP_TX[L.k] || L.i) + cp.extra;
    var h = '<div class="cap-top"><b>' + (cp.ev ? "Sturm!" : L.n) + '</b><span>Etappe ' + (cp.leg + 1) + '/' + n + '</span></div><div class="dz-plan cap-plan">' + strip + '</div>';
    h += '<p class="cap-msg">' + (cp.pre ? '<span class="dz-d">' + cp.pre + '</span> ' : "") + tx + '</p>';
    h += '<div class="cap-row2"><div class="cap-sp">' + ["Stopp", "Halbe", "Volle"].map(function (nm, l) { return '<button type="button" data-l="' + l + '" class="l' + l + (cp.lvl === l ? " on" : "") + '"' + (busy ? " disabled" : "") + '>' + nm + '</button>'; }).join("") + '</div>' +
      '<button type="button" class="cap-glb"' + (busy ? " disabled" : "") + '>Fernglas</button><button type="button" class="dz-go cap-go"' + (busy ? " disabled" : "") + '>Los!</button></div>';
    if (cp.glass) h = h.replace(/<div class="cap-row2">[\s\S]*$/, '<div class="cap-row2 cap-glrow"><span>nah</span><input type="range" class="cap-foc" min="3" max="70" step="0.5" value="' + cp.glass.foc + '" aria-label="Schärfe"><span>fern</span><button type="button" class="cap-glx">Absetzen</button></div>');
    cpPanel.innerHTML = h;
  }
  cpPanel.addEventListener("input", function (e) { if (e.target.classList.contains("cap-foc") && cp && cp.glass) cp.glass.foc = +e.target.value; });
  cpPanel.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b || !cp || cp.anim || cp.intro || cp.done) return; e.stopPropagation();
    if (b.dataset.l != null) { cpSetLvl(+b.dataset.l); return; }
    if (b.classList.contains("cap-glb")) { cpGlass(true, 0); return; }
    if (b.classList.contains("cap-glx")) { cpGlass(false); return; }
    if (b.classList.contains("cap-go")) cpGo();
  });
  // ---- cards: the start, the end ----
  function cpIntro() {
    cp.intro = true;
    cpCard.innerHTML = '<div class="fi-c dz-intro"><p class="fi-h">Kapitän der Pausbacke</p><p class="dz-route">Southamsterton → Nuss York · ' + cp.route.length + ' Etappen</p>' +
      '<p class="fi-s">Jede Etappe: Fahrt am Telegrafen, Kurs am Steuerrad (die gelbe Linie zeigt ihn), Pfeife am Griff rechts. Dann Los!</p>' +
      '<p class="fi-s">Stopp bei Hindernissen direkt voraus · Halbe in Häfen, Engen und Nebel · Volle auf freier See</p>' +
      '<p class="fi-s">★ Nichts rammen<br>★ Jede Etappe richtig<br>★ 4 Tiere und Funde: Fernglas hoch, scharf stellen</p>' +
      '<div class="fi-row"><button type="button" class="fi-b" data-a="go">Leinen los!</button></div></div>';
    cpCard.hidden = false;
  }
  function cpEnd() {
    cp.done = true; var okN = cp.res.filter(Boolean).length, st = [cp.hits === 0, okN === cp.route.length, cp.found.length >= 4], n = st.filter(Boolean).length, LG = cpLog();
    var book = CP_ANI.map(function (k) { return '<span class="' + (LG[k] ? (cp.newF.indexOf(k) >= 0 ? "nw" : "") : "no") + '">' + (LG[k] ? CP_NAME[k] : "?") + '</span>'; }).join("");
    cpCard.innerHTML = '<div class="fi-c dz-intro"><p class="fi-h">' + (n === 3 ? "Triumphale Ankunft!" : "Angekommen in Nuss York") + '</p><p class="dz-route">' + "★".repeat(n) + "☆".repeat(3 - n) + '</p>' +
      '<p class="fi-s">' + (st[0] ? "★" : "☆") + " Nichts gerammt" + (cp.hits ? " (" + cp.hits + "× Rumms)" : "") + '<br>' + (st[1] ? "★" : "☆") + " Etappen richtig: " + okN + "/" + cp.route.length + '<br>' + (st[2] ? "★" : "☆") + " " + cp.found.length + " gesichtet</p>" +
      '<p class="fi-s cap-book-h">Logbuch</p><div class="cap-book">' + book + '</div>' +
      '<div class="fi-row"><button type="button" class="fi-b2" data-a="end">Fertig</button><button type="button" class="fi-b" data-a="again">Nochmal</button></div></div>';
    cpCard.hidden = false; cpPanelDraw(); cpRedraw(); if (n >= 2) dzWhistle(2); beep(n === 3 ? [[523, .08], [659, .08], [784, .12]] : [[523, .08], [659, .1]]);
  }
  cpCard.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return; e.stopPropagation();
    if (b.dataset.a === "go") { cp.intro = false; cpCard.hidden = true; cpPanelDraw(); cpRedraw(); return; }
    if (b.dataset.a === "again") { var rs = cp.resolve; cp = cpNew(); cp.resolve = rs; cpStartLeg(); cpIntro(); return; }
    capEnd();
  });
  function capGame() {
    return new Promise(function (resolve) {
      cp = cpNew(); cp.resolve = resolve; cpEl.hidden = false; cpOpen = true; cpPanel.style.display = "block";
      cpStartLeg(); cpIntro(); cpRedraw();
    });
  }
  function capEnd() { if (!cpOpen) return; cpOpen = false; cancelAnimationFrame(cpRaf); cpRaf = 0; cpEl.hidden = true; cpCard.hidden = true; cpToast.hidden = true; cpPanel.style.display = "none"; var r = cp && cp.resolve; cp = null; if (r) r(); }
  cpEl.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); capEnd(); });
  var _cp_interrupt = interrupt; interrupt = function () { if (cpOpen && !window.__resume) capEnd(); return _cp_interrupt.apply(this, arguments); };
  // the role is chosen on the first card of a new voyage
  var _cp_dzIntro = dzIntro;
  dzIntro = function () {
    dz.intro = true; dzGo.disabled = true; dzBanner("");
    dzCard.innerHTML = '<div class="fi-c dz-intro"><p class="fi-h">Jungfernfahrt der Pausbacke</p><p class="dz-route">Southamsterton → Nuss York</p><p class="fi-s">Wer bist du auf dieser Reise?</p>' +
      '<div class="cap-roles"><button type="button" data-a="stoker"><b>Oberheizer</b><small>unten im Kesselraum: Kohle, Ventile, Pumpe</small></button><button type="button" data-a="captain"><b>Kapitän</b><small>oben auf der Brücke: Telegraf, Steuerrad, Pfeife</small></button></div></div>';
    dzCard.hidden = false;
  };
  dzCard.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.a === "stoker") { e.stopPropagation(); _cp_dzIntro(); }
    if (b.dataset.a === "captain") { e.stopPropagation(); var r = dz && dz.resolve; if (dz) dz.resolve = null; steamEnd(); capGame().then(function () { if (r) r(); }); }
  }, true);
  /* preview test hooks */
  window.__capRoute = function () { return cp && cp.route.map(function (L) { return L.k; }); };
  window.__cap = { open: function () { return capGame(); },
    ani: function () { var r = null; cp.O.forEach(function (o) { if (r || !o.ani || o.seen || o.leg !== cp.leg) return; var q = cpWP(o), rr = cpRel(cp.px, cp.py, cp.h, q[0], q[1]); r = { yaw: Math.atan2(rr[1], rr[0]), f: rr[0], k: o.k }; }); return r; },
    glass: function (y, f) { cpGlass(true, y); cp.glass.foc = f; },
    set: function (o) { if (!cp || cp.anim) return; if (o.rud != null) cp.rud = o.rud; if (o.lvl != null) cp.lvl = o.lvl; if (o.wh != null) cp.wh = o.wh; cpPanelDraw(); cpRedraw(); },
    solve: function () { var need = cpNeed(); for (var r of [0, -1, 1, -2, 2]) if (!cpSim(r, need)) return { rud: r, lvl: need, wh: !!cpLeg().wh }; return { rud: 0, lvl: need, wh: !!cpLeg().wh, fail: 1 }; },
    st: function () { return cp && { leg: cp.leg, n: cp.route.length, key: cpLeg().k, lvl: cp.lvl, rud: cp.rud, wh: cp.wh, hits: cp.hits, res: cp.res.slice(), found: cp.found.slice(), done: cp.done, intro: cp.intro, anim: !!cp.anim, ev: cp.ev }; } };
