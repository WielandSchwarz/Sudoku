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
  var CP_TX = {   // what the lookout and the radio report; the decision is the captain's
    abfahrt: "Southamsterton, 10. April, Mittag. Tausende Hamster winken am Kai, die Schlepper warten. Die Kaimauern stehen eng.",
    newyork: "Achtung, Ausguck: Die Mümmel reißt sich los! Ihr Heck schwenkt in unseren Weg, und unser Sog zieht sie mit.",
    solent: "Kernsund an der Isle of Weizen. Zwischen den Tonnen liegen Sandbänke in der Rinne. Rechtzeitig die Spur wählen!",
    lotse: "Feuerschiff Knabber. Das Lotsenboot liegt voraus und wartet, dass unser Lotse von Bord geht.",
    kanal: "Pfotenkanal, offenes Wasser. Bis Frankreich ist kaum Verkehr gemeldet.",
    fischer: "Eine Fischerflotte mit ausgelegten Netzen liegt im Weg. Nur eine Spur ist frei.",
    cherbourg: "Schnüffelbourg am Abend. Auf der Reede warten die Tender mit neuen Gästen auf uns.",
    cherAus: "Alle Gäste an Bord. Die Ausfahrt führt durch eine Rinne zwischen Tonnen, mit Sandbänken darin.",
    irisch: "Irische Knuspersee. Weites Wasser bis Backentown.",
    queens: "Backentown, 11. April. Die Tender mit Post und Gästen kommen uns entgegen.",
    queAus: "Vorbei am Leuchtturm Fastnuss geht es hinaus. In der Rinne liegen Sandbänke, die Felsen sind nah.",
    see1: "Der Hamslantik. Bis zum Horizont nur Wasser.", see2: "Ruhige See, alle Kessel unter Dampf.", see3: "Westwärts über den Hamslantik.",
    nebel1: "Dichter Nebel über der Neufutterlandbank! Hier fischen oft kleine Boote, man sieht keine 100 Meter weit.",
    nebel2: "Immer noch Nebel. Irgendwo tutet ein anderes Schiff.",
    klar: "Der Nebel lichtet sich. Freie Sicht voraus.",
    eiswarn: "14. April, Funkspruch der Karottonia: Eisfelder auf unserem Kurs gemeldet. Schollen treiben in den Spuren.",
    eis: "23:40 Uhr, der Ausguck läutet dreimal: Eisberg direkt voraus! Er ist schon sehr nah!",
    morgen: "Morgengrauen. Das Eis liegt hinter uns, vor uns offenes Wasser.",
    wale: "Fontänen voraus! Eine Gruppe Finnwale kreuzt unseren Kurs.",
    sos: "Notflaggen voraus! Ein Fischerschoner braucht Hilfe.",
    gruss: "Am Horizont die Backentasche, unser Schwesterschiff, auf Gegenkurs.",
    ambrose: "Feuerschiff Ambrösel vor Nuss York. Ein Lotse will an Bord kommen.",
    quar: "Futter Island. Die Ärzte der Quarantäne kommen mit ihrem Boot.",
    liberty: "Die Freiheitshamsterin grüßt! Die Hafeneinfahrt ist voller kleiner Boote und Fähren.",
    pier: "Der Körnerpier 59, voller jubelnder Hamster. Wir müssen genau davor zum Stehen kommen."
  };
  var CP_HITS = { ship: "Rumms! Die Mümmel gestreift!", gate: "Auf Grund gelaufen! Zwischen den Tonnen bleiben.", zone: "Auf die Sandbank gelaufen! Schlamm und Sand spritzen hoch.", quay: "Rumms an die Kaimauer!", pier: "Rumms an die Pier!", ice: "Rumms! Der Eisberg schrammt am Rumpf, Eis poltert aufs Vorschiff!", floe: "Rumms! Eine Scholle!", wood: "Rumms! Treibholz!", boat: "Rumms! Ein Fischerboot gerammt, die Fischer fallen ins Wasser!", pilot: "Rumms! Der Lotse landet im Wasser!", tender: "Rumms! Der Tender schaukelt, Gäste fallen ins Wasser!", schooner: "Rumms! Die Fischer vom Schoner treiben im Wasser!", light: "Rumms! Das Feuerschiff!" };
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
  // three lanes, like a running game: the course follows the fairway's bend, the wheel picks the lane. Changing lanes takes a while at speed: at Volle it is only done in the next leg
  var CP_LW = 5, CP_LD = [5, 14, 72], CP_BEND = { solent: -1, cherAus: 1, queAus: -1, liberty: 1 };
  function cpBendOf(i) { return CP_BEND[cp.route[i].k] || 0; }
  function cpSm1(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function cpLaneNow() { return Math.max(-1, Math.min(1, Math.round((cp.tr ? cp.tr.b : cp.lat || 0) / CP_LW))); }
  function cpTarget(rud) { return Math.max(-1, Math.min(1, cpLaneNow() + rud)); }
  function cpPlan(rud, lvl) { var bend = cpBendOf(cp.leg), D = CP_LD[lvl]; if (cp.tr) return { bend: bend, a: cp.tr.a, b: cp.tr.b, D: D, s0: cp.tr.f * D };
    var b = cpTarget(rud) * CP_LW, nL = Math.abs(b - (cp.lat || 0)) / CP_LW; return { bend: bend, a: cp.lat || 0, b: b, D: D * (nL > 1.2 ? 1.4 : 1), s0: 0 }; }
  function cpLatAt(pl, d) { return pl.a + (pl.b - pl.a) * cpSm1((pl.s0 + d) / pl.D); }
  function cpPP(pl, d) { var c = cpPath(pl.bend, d), x = (pl.s0 + d) / pl.D, sl = x > 0 && x < 1 ? (pl.b - pl.a) * 6 * x * (1 - x) / pl.D : 0, lat = cpLatAt(pl, d);
    return [c[0] + Math.cos(c[2]) * lat, c[1] - Math.sin(c[2]) * lat, c[2] + Math.atan(sl) * .8]; }
  function cpLegS(lvl, i) { return CP_DIST[lvl] + (lvl === 0 && cp.route[i == null ? cp.leg : i].k === "eis" ? 5 : 0); }
  // the ship gathers way gently from the speed it had, and slows gently to a stop
  function cpV0(lvl) { return (cp && cp.vps || 0) * (lvl ? 5.2 : 3.8); }
  function cpV1(lvl, S) { var v0 = cpV0(lvl); return (S - v0 * .2) / .8; }
  function cpDistU(lvl, S, u) { if (!lvl) return S * (1 - (1 - u) * (1 - u)); var v0 = cpV0(lvl), v1 = cpV1(lvl, S), ua = .4;
    if (u < ua) { var q = u / ua; return v0 * u + (v1 - v0) * ua * (q * q * q - q * q * q * q / 2); } return v0 * ua + (v1 - v0) * ua * .5 + v1 * (u - ua); }
  // the engines below, heard through the deck: the same beat as in the stoker's room, only muffled
  var cpMuf = null;
  function cpMufN() { var A = dzAC(); if (!cpMuf || cpMuf.context !== A) { var lp = A.createBiquadFilter(), g = A.createGain(); lp.type = "lowpass"; lp.frequency.value = 600; lp.Q.value = .7; g.gain.value = .6; lp.connect(g); g.connect(A.destination); cpMuf = lp; } return cpMuf; }
  function cpTone(f, dur, g, type, at, f2) { try { var A = dzAC(), t0 = A.currentTime + .02 + (at || 0), o = A.createOscillator(), gn = A.createGain(); o.type = type || "sine"; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
      gn.gain.setValueAtTime(g, t0); gn.gain.exponentialRampToValueAtTime(.001, t0 + dur); o.connect(gn); gn.connect(cpMufN()); o.start(t0); o.stop(t0 + dur + .02); } catch (e) { } }
  function cpNoise(dur, f, q, g, att, rel, at) { try { var A = dzAC(), t0 = A.currentTime + .02 + (at || 0), n = A.createBufferSource(), buf = A.createBuffer(1, Math.max(1, A.sampleRate * dur), A.sampleRate), d = buf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      var bp = A.createBiquadFilter(), gn = A.createGain(); bp.type = "bandpass"; bp.frequency.value = f; bp.Q.value = q; n.buffer = buf; gn.gain.setValueAtTime(0, t0); gn.gain.linearRampToValueAtTime(g, t0 + (att || .02)); gn.gain.setValueAtTime(g, t0 + Math.max(att || .02, dur - (rel || .1))); gn.gain.linearRampToValueAtTime(0, t0 + dur);
      n.connect(bp); bp.connect(gn); gn.connect(cpMufN()); n.start(t0); n.stop(t0 + dur + .05); } catch (e) { } }
  function cpEngine(lvl, dur, at, from) {
    if (!lvl) { cpNoise(1.4, 700, .7, .14, .02, .9, at); cpTone(70, 1.3, .2, "triangle", at, 40); cpNoise(2.4, 2800, .6, .22, .2, 1.0, (at || 0) + .5); cpNoise(2.4, 5200, .9, .11, .2, 1.0, (at || 0) + .5); return; }   // winding down, then the boilers blow off steam
    var st = lvl === 2 ? .23 : .42, s0 = from === 0 ? .8 : from === 1 ? .42 : from === 2 ? .23 : st;
    for (var k = 0, tt = 0; tt < dur; k++) { var ramp = Math.max(0, 1 - tt / (dur * .4)), step = st + (s0 - st) * ramp; cpTone(58, .16, .3, "triangle", (at || 0) + tt, 44); cpNoise(.07, k % 2 ? 1300 : 1000, 2, .1, .005, .05, (at || 0) + tt + .04); tt += step; }
    if (lvl === 2) cpTone(420, dur, .02, "sawtooth", at, 460);
  }
  function cpLeg() { return cp.route[cp.leg]; }
  function cpNeed() { return cp.ev ? 1 : DZ_ORD[cpLeg().o].l; }
  function cpSky(i) { if (i == null) i = cp.leg; i = Math.min(i, cp.route.length - 1); var L = cp.route[i], k = L.s, ev = cp.info[i] && cp.info[i].ev; if (cp.arrNight && (k === "feuerschiff" || k === "quar" || k === "liberty" || k === "ny")) return "night";
    return ev ? "storm" : k === "nebel" ? "fog" : k === "eiswarn" ? "eve" : k === "eis" ? "night" : k === "morgen" ? "dawn" : "day"; }

  // ---- the scene of a leg: what floats on the water (O) and what stands on the horizon (B) ----
  function cpW(A, lx, ly) { return [A.x + lx * Math.cos(A.h) + ly * Math.sin(A.h), A.y - lx * Math.sin(A.h) + ly * Math.cos(A.h)]; }
  function cpLaneFree(L, pref, sh) { return sh ? Math.max(-1, Math.min(1, L + pref)) === L ? L - pref : L + pref : L === 0 ? pref : 0; }   // a lane next to (or away from) the given one
  function cpLaneSet(o, L) { var ln = Math.max(-1, Math.min(1, o.lf(L))); o.lane = ln; o.x = o.dx + ln * CP_LW; }
  function cpBuild(li) {
    var L = cp.route[li], k = L.k, sc = L.s, O = [], B = [], R = Math.random, side = R() < .5 ? 1 : -1, IN = { ev: null, extra: "" };
    if (sc === "see" && li - cp.lastEv > 3 && R() < .3) { IN.ev = "sturm"; cp.lastEv = li; }
    cp.info[li] = IN; IN.bend = cpBendOf(li);
    var ob = function (kk, x, y, o) { var r = Object.assign({ k: kk, x: x, y: y }, o || {}); O.push(r); return r; };
    var lane0 = cpLaneNow();
    // an object that sits in a lane chosen relative to the lane the ship will be in when the leg starts (settled when the leg before is sailed)
    var inLane = function (kk, f, dx, y, o) { var r = ob(kk, 0, y, Object.assign({ lf: f, dx: dx }, o || {})); cpLaneSet(r, lane0); return r; };
    var bank = function (dir, ln, d0, d1) { var sh = [], sa = [], top = [], bot = [];
      for (var d = d0 - 4; d <= d1 + 4; d += 2) { var p = cpPath(dir, d), rx = Math.cos(p[2]), ry = -Math.sin(p[2]), e = Math.max(0, 1 - Math.pow((d - (d0 + d1) / 2) / ((d1 - d0) / 2 + 4), 2)), es = Math.max(0, 1 - Math.pow((d - (d0 + d1) / 2) / ((d1 - d0) / 2 + 1), 2)), c = ln * CP_LW, w = 3.2 * Math.sqrt(e), ws = 2.3 * Math.sqrt(es) * (1 + Math.sin(d * 1.3) * .12);
        top.push([p[0] + rx * (c - w), p[1] + ry * (c - w)]); bot.push([p[0] + rx * (c + w), p[1] + ry * (c + w)]); sh.push([p[0] + rx * (c - ws), p[1] + ry * (c - ws)]); sa.push([p[0] + rx * (c + ws), p[1] + ry * (c + ws)]); }
      ob("shoal", 0, 0, { pts: top.concat(bot.reverse()), sand: sh.concat(sa.reverse()) }); ob("zone", 0, 0, { lane: ln, d0: d0, d1: d1, hard: 1, hid: 1 }); };
    var gates = function (dir) {
      [-1, 1].forEach(function (sd) { var pts = [], sand = [], ins = [], outs = [], si = [], so = [];
        for (var d = 4; d <= 50; d += 3) { var p = cpPath(dir, d), rx = Math.cos(p[2]), ry = -Math.sin(p[2]), wv = 1 + Math.sin(d * .7 + sd) * .6;
          ins.push([p[0] + rx * sd * (8.6 + wv * .5), p[1] + ry * sd * (8.6 + wv * .5)]); outs.push([p[0] + rx * sd * 19, p[1] + ry * sd * 19]);
          if (d > 10 && d < 44) { si.push([p[0] + rx * sd * (10.5 + wv), p[1] + ry * sd * (10.5 + wv)]); so.push([p[0] + rx * sd * (13 + wv * 1.5), p[1] + ry * sd * (13 + wv * 1.5)]); } }
        ob("shoal", 0, 0, { pts: ins.concat(outs.reverse()), sand: si.concat(so.reverse()) }); });
      [10, 24, 38].forEach(function (d) { var p = cpPath(dir, d), rx = Math.cos(p[2]), ry = -Math.sin(p[2]);
      ob("buoyR", p[0] - rx * 7.8, p[1] - ry * 7.8); ob("buoyG", p[0] + rx * 7.8, p[1] + ry * 7.8); });
      var bl = R() < .5 ? -1 : 1, d0 = 12 + R() * 8; bank(dir, bl, d0, d0 + 12); if (R() < .5) bank(dir, -bl, d0 + 20, d0 + 30); };
    var animal = function (pool) { ob(cpRnd(pool), (R() < .5 ? -1 : 1) * (3 + R() * 6), 42 + R() * 10, { ani: 1 }); };
    if (k === "abfahrt") { ob("quay", 4, 0, { y0: -30, y1: 22, crowd: 1 }); ob("quay", -11, 0, { y0: -30, y1: 26, crowd: 1 });
      ob("m3", 10, 1, { m: "shed", w: 6, l: 20 }); ob("m3", -17, 7, { m: "shed", w: 7, l: 16 }); ob("m3", 6.2, 15, { m: "crane", side: 1 }); ob("m3", -13.2, 19, { m: "crane", side: -1 });
      ob("m3", 5.4, 21.2, { m: "lhouse", c: "#d8463c" }); ob("m3", -11.8, 25.2, { m: "lhouse", c: "#4a9a3a" }); ob("m3", -9.6, 3, { m: "ship3" });
      ob("m3", -1.8, 16, { m: "tug", lead: 1, tow: 1 }); ob("m3", 1.8, 19, { m: "tug", lead: 1, tow: 1 }); B.push({ k: "land", b0: -1.3, b1: -.45 }, { k: "land", b0: .35, b1: 1.2 }); }
    else if (k === "newyork") { ob("quay", -9, 0, { y0: -6, y1: 36, crowd: 1 }); ob("m3", -15, 22, { m: "shed", w: 6, l: 14 }); ob("m3", -10.6, 34, { m: "crane", side: -1 });
      ob("ship", 0, 0, { sw: { px: -7.4, py: 28 }, hard: 1, ropes: 1, sqAll: 1, r: 3.2 }); ob("tug", 12, 22, { so: 1, a: -1.3, sq: [[.3, .8, 15.5], [1, -3.6, 15]] }); B.push({ k: "land", b0: .3, b1: 1.3 }); }
    else if (k === "solent") { gates(-1); B.push({ k: "land", b0: .25, b1: 1.3 }, { k: "land", b0: -1.5, b1: -.7 }); }
    else if (k === "cherAus") { gates(1); B.push({ k: "land", b0: -1.4, b1: -.5 }, { k: "town", b: -.9 }); }
    else if (k === "queAus") { gates(-1); var lp0 = cpPath(-1, 21); ob("tower", lp0[0] - Math.cos(lp0[2]) * 12, lp0[1] + Math.sin(lp0[2]) * 12); B.push({ k: "land", b0: -1.6, b1: -.75 }); }
    else if (k === "liberty") { gates(1); ob("statue", -24, 70); B.push({ k: "ny", b: .15, w: 50 }); }
    else if (k === "lotse") { ob("pilot", 1.8, 12, { hard: 1, sq: [[.55, 1.8, 12], [1, 10, 22]] }); ob("pax", .3, 9.4, { so: 1, c: 3, w: [0, .52], sq: [[.05, .3, 9.4], [.45, 1.7, 11.7], [1, 1.7, 11.7]] }); ob("light", -8, 34); B.push({ k: "land", b0: -1.6, b1: -1 }); }
    else if (k === "fischer") { var fr = R() < .5 ? -1 : 1, fsh = R() < .5;   // one lane stays free of nets
      [[0, -.4, 19], [1, .5, 23], [0, .6, 30]].forEach(function (p, i) { inLane("boat", function (L) { var ls = [-1, 0, 1].filter(function (v) { return v !== cpLaneFree(L, fr, fsh); }); return ls[p[0]]; }, p[1], p[2], { hard: 1, net: 1, a: (cpHash(i * 7, 3) - .5) * 1.4 }); });
      ob("boat", -12 * side, 26, { net: 1, a: .5 }); ob("boat", 13 * side, 38, { net: 1, a: -.4 }); }
    else if (sc === "reede") { ob("tender", 2.2, 12, { x0: 8, mv: .5, hard: 1, sq: [[.55, 2.2, 12], [1, 11, 24]] }); ob("tender", -9, 22, { sq: [[.25, -2.4, 11.5], [.6, -2.4, 11.5], [1, -11, 24]] }); cpPax(ob, 2.2, 12, .5); cpPax(ob, -2.4, 11.5, .55); B.push({ k: "town", b: .05 }, { k: "land", b0: -.6, b1: .7 }); }
    else if (k === "nebel1") inLane("boat", function (L) { return L; }, .3 * side, 24, { hard: 1, fogA: 1 });
    else if (k === "nebel2") ob("ship", -13, 40, {});
    else if (k === "eiswarn") { var ef = R() < .5 ? -1 : 1, esh = R() < .5; inLane("floe", function (L) { return L; }, .2, 22, { hard: 1 }); inLane("floe", function (L) { return [-1, 0, 1].filter(function (v) { return v !== L && v !== cpLaneFree(L, ef, esh); })[0]; }, -.3, 27, { hard: 1 });
      ob("floe", -13, 19); ob("floe", 13, 33); ob("floe", -15, 42); ob("seal", -9 * side, 46, { ani: 1 }); }
    else if (k === "eis") { inLane("ice", function (L) { return L; }, 0, 8.5, { r: 4.2, hard: 1, big: 1 }); ob("floe", 7, 27); ob("floe", -8, 31); if (R() < .35) ob("bear", 8 * side, 44, { ani: 1 }); }
    else if (k === "wale") { ob("whale", -4, 34, { ani: 1, x0: -8, mv: 1 }); ob("whale", 5, 44, { ani: 1, x0: 9, mv: 1 }); }
    else if (k === "sos") { ob("schooner", 1.2, 13, { hard: 1, sq: [[.7, 1.2, 13], [1, -7, 24]] }); ob("dinghy", .9, 9.6, { so: 1, sq: [[.3, 1.1, 12.2], [.5, 1.1, 12.2], [.75, .9, 9.6], [1, .9, 9.6]] }); }
    else if (k === "gruss") ob("ship", -14, 6, { y0: 70, mv: 1, big: 1 });
    else if (k === "ambrose") { inLane("light", function (L) { return L; }, 0, 22, { hard: 1 }); B.push({ k: "ny", b: -.1, w: 14 }); }
    else if (k === "quar") { ob("tender", 2.2, 12, { x0: 8, mv: .5, hard: 1, sq: [[.55, 2.2, 12], [1, 11, 24]] }); cpPax(ob, 2.2, 12, .5); ob("qisle", -18, 28); B.push({ k: "ny", b: .1, w: 34 }); }
    else if (k === "pier") { ob("nyb", -16, 34, { sd: 1, wd: 16, hmax: 16 }); ob("nyb", 2, 40, { sd: 2, wd: 18, hmax: 22, n: 9 }); ob("nyb", 20, 33, { sd: 3, wd: 14, hmax: 14 }); ob("nyb", 6, 60, { sd: 4, wd: 30, hmax: 26, n: 10 });
      ob("pier", 0, 12.4, { r: 14, hard: 1, fz: 2.7 }); ob("tug", -5, 6, { sq: [[.5, -2.6, 9.2], [1, -2.6, 9.2]] }); ob("tug", 5, 7, { sq: [[.5, 2.6, 9.4], [1, 2.6, 9.4]] }); cpPax(ob, 0, 12, .6, 1); B.push({ k: "ny", b: 0, w: 80 }); }
    else if (sc === "see" || sc === "morgen") {                          // the open sea: now and then something adrift, now and then an animal far out
      if (!IN.ev && R() < .7) { var pick = R(); var wl = R() < .7 ? function (L) { return L; } : function (L) { return cpLaneFree(L, side, 1); }; if (pick < .5) inLane("wood", wl, .2 * side, 42, { hard: 1, unk: 1 }); else inLane("bottle", wl, .2 * side, 42, { unk: 1, ani: 0, find: 1 }); IN.extra = " Ausguck: Etwas treibt voraus!"; }
      if (R() < .7) animal(k === "kanal" ? ["gull", "dolph", "bottle"] : ["whale", "dolph", "dolph", "bottle", R() < .25 ? "orca" : "whale"]);
      if (R() < .55) ob("ship", -side * (16 + R() * 6), 70, { y0: 115, mv: 1, big: R() < .3 });   // a steamer far off, going the other way
    }
    O.forEach(function (o) { o.seen = false; o.leg = li; if (!o.r) o.r = 2.6; cp.O.push(o); });
    B.forEach(function (b) { b.leg = li; cp.B.push(b); });
  }
  // little hamsters walking over a gangway during a sequence: from the boat (or the pier) to the bow and on board
  function cpPax(ob, x, y, v0, off) { for (var i = 0; i < 3; i++) { var a = v0 * .25 + i * .1;
    if (off) ob("pax", .3, 9.4, { so: 1, c: i, w: [a, 1], sq: [[a, .3, 9.4], [a + .3, -1.5 + i * 1.5, 12.2], [1, -1.5 + i * 1.5, 12.2]] });
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
  function cpSim(rud, lvl) { return cpSimP(cpPlan(rud, lvl), lvl); }
  function cpSimP(pl, lvl) {
    var S = cpLegS(lvl), done = {}, N = 90;
    for (var i = 1; i <= N; i++) { var u = i / N, d = cpDistU(lvl, S, u), P = cpPP(pl, d), lat = cpLatAt(pl, d);
      for (var j = 0; j < cp.O.length; j++) { var o = cp.O[j]; if (o.leg !== cp.leg || o.so) continue;
        if (o.k === "zone") { if (d > o.d0 && d < o.d1 && Math.abs(lat - o.lane * CP_LW) < 2.7) return { k: "zone", u: u, sd: o.lane }; continue; }
        if (o.k === "quay") { if (P[1] > o.y0 && P[1] < o.y1 && Math.abs(P[0] - o.x) < 1.8) return { k: "quay", u: u }; continue; }
        if (o.sw) { if (done[j]) continue; var sp = cpSwPts(o, cpSwA(o, u, lvl)); for (var m = 0; m < sp.length; m++) { var rs = cpRel(P[0], P[1], P[2], sp[m][0], sp[m][1]); if (rs[0] < 2.4 && rs[0] > -6 && Math.abs(rs[1]) < o.r) return { k: "ship", u: u, sd: rs[1] }; } continue; }
        if (done[j] || !(o.hard || o.gate)) continue; var q = cpOP(o, u, d), r = cpRel(P[0], P[1], P[2], q[0], q[1]);
        if (r[0] < (o.fz || .8)) { done[j] = 1; if (o.fogA && lvl < 2) continue; if (o.gate ? Math.abs(r[1]) >= (lvl === 2 ? o.r - 1 : o.r) : Math.abs(r[1]) < o.r) return { k: o.k, u: u, j: j, sd: r[1] }; } } }
    var E = cpPP(pl, S);
    for (var jj = 0; jj < cp.O.length; jj++) { var oo = cp.O[jj]; if (oo.leg !== cp.leg || done[jj] || !oo.hard || oo.k === "quay" || oo.k === "zone" || oo.sw) continue; var qq = cpOP(oo, 1, S), rr = cpRel(E[0], E[1], E[2], qq[0], qq[1]); if (rr[0] < 1.6 && Math.abs(rr[1]) < oo.r) return { k: oo.k, u: 1 }; }
    return null;
  }
  function cpNew() {
    return { route: dzRoute(), leg: 0, res: [], hits: 0, found: [], newF: [], lvl: 1, rud: 0, lat: 0, tr: null, wh: false, looks: 2, O: [], B: [], anc: [{ x: 0, y: 0, h: 0 }], info: [], ev: null, extra: "", lastEv: -9, arrNight: Math.random() < .45,
      px: 0, py: 0, h: 0, d: 0, anim: null, done: false, intro: true, tips: 3, tipLeg: -1, tUsed: 0, inc: 0, look: null, shake: 0, pre: "" };
  }
  function cpStartLeg() {
    if (!cp.info[cp.leg]) cpBuild(cp.leg); cpAhead();
    var IN = cp.info[cp.leg], A = cp.anc[cp.leg]; cp.ev = IN.ev; cp.extra = IN.extra;
    cp.O = cp.O.filter(function (o) { return o.leg >= cp.leg - 1; }); cp.B = cp.B.filter(function (b) { return b.leg >= cp.leg - 1; }); cp.swim = (cp.swim || []).filter(function (s) { return s.leg >= cp.leg - 1; });
    cp.rud = 0; cp.wh = false; cp.looks = 2; cp.px = A.x; cp.py = A.y; cp.h = A.h; cp.d = 0; cp.glass = null;
    var swo = cp.O.filter(function (o) { return o.leg === cp.leg && o.sw && !o.snapped; })[0]; if (swo) { cp.anim = { lead: 1, dur: 2600, sw: swo }; cpPanelDraw(); if (!cpRaf) cpRaf = requestAnimationFrame(cpDraw); return; }
    cpPanelDraw(); cpRedraw();
  }

  // ---- drawing ----
  var CP_HZ = 24;
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
    if (false) for (var k = 0; k < 26; k++) { g.fillStyle = k % 5 ? "#c8d4f0" : "#ffffff"; g.fillRect((k * 53) % 180, (k * 29) % (CP_HZ - 6), 1, 1); }

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
  // waves on the water: crests that roll towards the ship, long and white-capped in a storm
  function cpWaves(t, storm, sky) {
    var st = storm > .3, step = st ? 3.2 : 5, sp = st ? 2.2 : .7, ph = (t / 1000 * sp) % step, col = sky === "night" ? ["#3a4a78", "#0e162e"] : st ? ["#e8f0f4", "#1e2e38"] : ["#d8eef8", "#2e6a9a"], j0 = Math.floor((cp.py - 4) / step), j1 = j0 + Math.round(60 / step);
    for (var j = j1; j >= j0; j--) { var y0 = j * step - ph;
      for (var x = cp.px - 34; x < cp.px + 34; x += .7) { var crest = Math.sin(x * .45 + j * 1.7 + t / (st ? 400 : 900)); if (crest < (st ? .3 : .7)) continue;
        var yy = y0 + Math.sin(x * .3 + j) * .7, p = cpProj(x, yy, 0); if (!p || p.y > 135 || p.x < -4 || p.x > 184) continue; var X = Math.round(p.x), Y = Math.round(p.y), wp = Math.max(1, Math.ceil(.7 * p.k * 16)), th = st && p.f < 14 ? 2 : 1;
        mR(cpc, X, Y - th, wp, th, crest > .8 && st ? "#ffffff" : col[0]); mR(cpc, X, Y, wp, 1, col[1]); if (st && p.f < 20) mR(cpc, X, Y + 1, wp, 1, col[1]); } }
  }
  // ===== the sea as in the stoker's scenes: five water tones, dithered, waves that belong to the world and drift with time =====
  var cpWC = document.createElement("canvas"); cpWC.width = 180; cpWC.height = 135; var cpWX = cpWC.getContext("2d"), cpWD = cpWX.createImageData(180, 135);
  var CP_BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(function (v) { return (v + .5) / 16; });
  function cpWater(t, sky, storm) {
    var P = DZ_WRGB[sky] || DZ_WRGB.day, d = cpWD.data, hz = CAMV.hz, Z = CAMV.Z, H = cp.h + CAMV.yaw, cH = Math.cos(H), sH = Math.sin(H), amp = sky === "night" && cpLeg().s === "eis" ? .35 : 1 + storm * .8, tt = t * (storm > .3 ? 1.6 : 1);
    d.fill(0);
    for (var y = Math.max(0, Math.floor(hz)); y < 135; y++) {
      var k = (y + .5 - hz) / (CP_EYE * 16), f = 10 * Z / Math.max(.02, k) - 6, kk = k / Z * Z, det = Math.max(0, Math.min(1, 1 - (f - 18) / 70)), det2 = Math.max(0, Math.min(1, 1 - (f - 8) / 30));
      var X0 = cp.px + f * sH, Y0 = cp.py + f * cH, step = 1 / (k * 16), band = Math.sin((Y0 * cH + X0 * sH) * .55 - tt * .003) * .45;
      for (var x = 0; x < 180; x++) { var sd = (x + .5 - 90) * step, X = X0 + sd * cH, Y = Y0 - sd * sH, o = (y * 180 + x) * 4;
        var v = band * .55 + (Math.sin(X * .62 + Y * .21 - tt * .0016) * .3 + Math.sin(X * .23 - Y * .5 + tt * .0011) * .2) * det + Math.sin(Y * 1.3 + X * .37 - tt * .0023) * .14 * det2;
        v *= amp;   // calmer: the tones blend through a fine ordered dither instead of hard bands, and flatten out towards the horizon
        var cf = 1.75 + v * (storm > .3 ? 1.5 : 1.05), fl = Math.min(1, Math.max(0, (f - 30) / 90)); cf = cf + (2.3 - cf) * fl;
        var ci = Math.floor(cf + .5 + (CP_BAY[(y & 3) * 4 + (x & 3)] - .5) * (det2 > .3 ? .6 : .35)); ci = ci < 0 ? 0 : ci > 3 ? 3 : ci; if (v > .62 && det2 > .35 && ((x * 7 + y * 3) & 3) === 0 || storm > .3 && v > .8) ci = 4; if (y === Math.floor(hz)) ci = 3;
        var c = P[ci]; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255; } }
    cpWX.putImageData(cpWD, 0, 0); cpc.drawImage(cpWC, 0, 0);
  }
  // ---- what lies ahead: the next two legs are laid out in advance on the course a good captain would sail, and move into place when the real course is set ----
  function cpNeedOf(i) { return cp.info[i] && cp.info[i].ev ? 1 : DZ_ORD[cp.route[i].o].l; }
  function cpCompose(A, E) { var W = cpW(A, E[0], E[1]); return { x: W[0], y: W[1], h: A.h + E[2] }; }
  function cpPredict(i) { return cpPath(cpBendOf(i), cpLegS(cpNeedOf(i), i)); }   // the fairway's centre line: where the next leg begins does not depend on the lane
  function cpAhead() { cp.rel = cp.rel || [];
    for (var j = cp.leg + 1; j <= cp.leg + 2 && j < cp.route.length; j++) { if (cp.info[j]) continue; cp.rel[j] = cpPredict(j - 1); cp.anc[j] = cpCompose(cp.anc[j - 1], cp.rel[j]); cpBuild(j); } }
  function cpReanchor(from) { for (var j = from; j < cp.route.length && cp.rel && cp.rel[j]; j++) cp.anc[j] = cpCompose(cp.anc[j - 1], cp.rel[j]); }
  function cpBW(o) { var h = cp.anc[o.leg] ? cp.anc[o.leg].h : 0, c = {}; for (var k in o) c[k] = o[k]; if (o.b != null) c.b = o.b + h; if (o.b0 != null) { c.b0 = o.b0 + h; c.b1 = o.b1 + h; } return c; }
  // Manhattan in 3D behind the pier: clusters of towers with setbacks, lit windows at night
  function cpNYB(o, w, a, t) { var T = cpLoc(w[0], w[1], a), dark = cpSky() === "night";
    var C = dark ? [["#3a4060", "#4a5070", "#262c44", "#141828"]] : [["#e0d4bc", "#e8dcc4", "#b0a48c", "#5a5040"], ["#c8ccd4", "#d8dce4", "#9aa0ac", "#4a5058"], ["#d8c0a0", "#e8d0b0", "#a8906c", "#584830"]];
    for (var i = 0; i < (o.n || 7); i++) { var bx = (cpHash(i, o.sd) - .5) * (o.wd || 14), by = (cpHash(i + 9, o.sd) - .5) * 6, bw = 1.6 + cpHash(i, 3 + o.sd) * 1.8, bh = 3 + Math.pow(cpHash(i + 4, o.sd), 1.5) * (o.hmax || 14), cc = C[i % C.length], c = T.P(bx, by, 0);
      cpBox3(c[0], c[1], a, bw, bw, 0, bh, cc); if (bh > 8) { cpBox3(c[0], c[1], a, bw * .7, bw * .7, bh, bh + bh * .18, cc); if (i % 2) cpLine3([c[0], c[1], bh * 1.18], [c[0], c[1], bh * 1.18 + 1.5], "#3a3a40"); }
      var n = T.N(0, -1); if (cpSees([T.P(bx - bw / 2, by - bw / 2, 0), T.P(bx + bw / 2, by - bw / 2, bh)], n)) for (var z = .6; z < bh - .3; z += .7) for (var u = -bw / 2 + .3; u < bw / 2 - .2; u += .5) { if (cpHash(Math.round(u * 10) + i * 7, Math.round(z * 10)) > (dark ? .55 : .8)) continue; var p = cpProj.apply(null, T.P(bx + u, by - bw / 2 - .02, z)); if (p) mR(cpc, Math.round(p.x), Math.round(p.y), 1, 1, dark ? "#ffd34a" : "#5a6a7a"); } }
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
  function cpHidden(o, f) { if (o.ani || o.unk) return !o.seen; return !o.seen && cpSky() === "fog" && f > 12; }

  // ===== a little 3D on the 180x135 pixel grid: flat-shaded prisms, filled row by row so every pixel stays one pixel =====
  function cpC(wx, wy, wz) { var H = cp.h + CAMV.yaw, dx = wx - cp.px, dy = wy - cp.py; return [dx * Math.sin(H) + dy * Math.cos(H), dx * Math.cos(H) - dy * Math.sin(H), wz]; }
  function cpS(c) { var k = 10 / (c[0] + 6) * CAMV.Z; return [90 + c[1] * k * 16, CAMV.hz + (CP_EYE - c[2]) * k * 16]; }
  function cpEye() { return [cp.px - 6 * Math.sin(cp.h), cp.py - 6 * Math.cos(cp.h), CP_EYE]; }
  function shipW(sd, f, z) { return [cp.px + sd * Math.cos(cp.h) + f * Math.sin(cp.h), cp.py - sd * Math.sin(cp.h) + f * Math.cos(cp.h), z || 0]; }
  var cpHazeC = null, cpGradOn = 0;
  function cpFill(S, c, G) {
    var y0 = 1e9, y1 = -1e9, n = S.length, i; for (i = 0; i < n; i++) { if (S[i][1] < y0) y0 = S[i][1]; if (S[i][1] > y1) y1 = S[i][1]; }
    var Y0 = y0, Hh = Math.max(1, y1 - y0); y0 = Math.max(-4, Math.ceil(y0 - .5)); y1 = Math.min(138, Math.floor(y1 - .5)); cpc.fillStyle = c;
    for (var y = y0; y <= y1; y++) { var yc = y + .5, xs = [];
      if (G) { var tq = (yc - Y0) / Hh; cpc.fillStyle = tq < .14 ? G[0] : tq > .78 ? G[2] : tq > .55 ? G[3] : c; }   // a soft light at the top of a wall, darker towards the waterline
      for (i = 0; i < n; i++) { var a = S[i], b = S[(i + 1) % n]; if ((a[1] <= yc) !== (b[1] <= yc)) xs.push(a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); }
      if (xs.length < 2) continue; xs.sort(function (p, q) { return p - q; });
      for (var j = 0; j + 1 < xs.length; j += 2) { var xa = Math.max(-4, Math.ceil(xs[j] - .5)), xb = Math.min(184, Math.floor(xs[j + 1] - .5)); if (xb >= xa) cpc.fillRect(xa, y, xb - xa + 1, 1); } }
  }
  function cpLineS(x0, y0, x1, y1, c) { if (Math.max(Math.abs(x0), Math.abs(x1), Math.abs(y0), Math.abs(y1)) > 2000) return; var n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); if (n > 600) return; cpc.fillStyle = c;
    for (var i = 0; i <= n; i++) cpc.fillRect(Math.round(x0 + (x1 - x0) * i / n - .5), Math.round(y0 + (y1 - y0) * i / n - .5), 1, 1); }
  function cpPolyC(P, c, oc) {
    var out = [], n = P.length; for (var i = 0; i < n; i++) { var a = P[i], b = P[(i + 1) % n], ia = a[0] >= CP_NEAR, ib = b[0] >= CP_NEAR; if (ia) out.push(a);
      if (ia !== ib) { var tt = (CP_NEAR - a[0]) / (b[0] - a[0]); out.push([CP_NEAR, a[1] + (b[1] - a[1]) * tt, a[2] + (b[2] - a[2]) * tt]); } }
    if (out.length < 3) return; var S = out.map(cpS);
    var fm = 0, z0 = 1e9, z1 = -1e9; out.forEach(function (p) { fm += p[0]; z0 = Math.min(z0, p[2]); z1 = Math.max(z1, p[2]); }); fm /= out.length;
    if (cpHazeC) { var ha = Math.min(.55, Math.max(0, (fm - 28) / 160)); if (ha > .04) { ha = Math.round(ha * 10) / 10; c = cpMix(c, cpHazeC, ha); if (oc) oc = cpMix(oc, cpHazeC, ha); } }   // far things fade into the air
    var G = null; if (cpGradOn && z1 - z0 > .25 && c.charAt(0) === "#" && c.length === 7) { var sy0 = 1e9, sy1 = -1e9; S.forEach(function (p) { sy0 = Math.min(sy0, p[1]); sy1 = Math.max(sy1, p[1]); }); if (sy1 - sy0 >= 6) G = [cpMix(c, "#ffffff", .1), 0, cpMix(c, "#101828", .2), cpMix(c, "#101828", .1)]; }
    cpFill(S, c, G);
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
  var CP_STRUCT = { quay: 1, gate: 1, zone: 1, pier: 1, ice: 1 };
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
    if (k === "pier") { var pf = T.P(0, 5, 0); cpBox3(pf[0], pf[1], a, 30, 10, 0, 1.2, CP_STONE);
      for (var px = -13; px <= 13; px += .7) { var hv = cpHash(Math.round(px * 10), 77); if (hv > .75) continue; var hp = T.P(px, .5 + cpHash(Math.round(px * 10), 5) * 1.6, 0); cpHam(hp[0], hp[1], 1.2, Math.floor(hv * 1000), t); }
      var sh = T.P(0, 8.5, 0); cpBox3(sh[0], sh[1], a, 18, 5, 1.2, 2.5, ["#c8a07a", "#d8b08a", "#a8805a", "#4a3020"]); for (var dv = -7; dv <= 7; dv += 2.5) { var dp = T.P(dv, 5.96, 0); cpPolyW([[dp[0] - .5, dp[1], 1.2], [dp[0] + .5, dp[1], 1.2], [dp[0] + .5, dp[1], 2.1], [dp[0] - .5, dp[1], 2.1]], "#5a3a22"); } cpRoof(sh[0], sh[1], a, 18.4, 5.4, 2.5, .9, ["#8a3a2a", "#9a4a3a", "#6a2a1a", "#3a1008"], [0, "#d8b08a", "#a8805a"]); return; }
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
  // ===== ship style v2: curved hulls with sheer and flare, portholes, gold stripe, raked funnels, lifeboats, rigging =====
  var CPH = { blk: ["#1e1e26", "#34343e", "#26262e", "#14141a"], red: ["#b8342a", "#c8443a", "#9a2a22"], gold: "#e8b03a", wht: ["#fff8ec", "#f4ecdc", "#d8d0c0", "#b8b0a0"], out: "#2a1a10" };
  function cpTone(n, P) { var d = n[0] * .55 - n[1] * .45 + n[2] * .35; return d > .45 ? P[1] : d > .05 ? P[0] : d > -.3 ? P[2] : P[3] || P[2]; }
  // the outline of a hull at a station v: half width, from a rounded stern to a sharp bow
  function cpHW(H, v) { var sr = H.ls * .22, bl = H.lb * .45, w = H.hw;
    if (v < -H.ls + sr) { var q = (v - (-H.ls + sr)) / sr; return w * (.45 + .55 * Math.sqrt(Math.max(0, 1 - q * q))); }
    if (v > H.lb - bl) { var p = (H.lb - v) / bl; return w * Math.pow(Math.max(0, p), .75); } return w; }
  function cpZD(H, v) { var e = v > 0 ? v / H.lb : -v / H.ls; return H.zd + (v > 0 ? H.sb : H.ss) * e * e; }   // the deck edge sweeps up towards bow and stern
  function cpHull(T, H, t) {
    var N = H.n || 14, st = []; for (var i = 0; i <= N; i++) { var v = -H.ls + (H.ls + H.lb) * i / N; st.push(v); }
    var fx = H.flare == null ? .82 : H.flare, quads = [];
    [-1, 1].forEach(function (s) { for (var i = 0; i < N; i++) { var v0 = st[i], v1 = st[i + 1], w0 = cpHW(H, v0), w1 = cpHW(H, v1);
      var A = T.P(s * w0 * fx, v0, H.zw), B = T.P(s * w1 * fx, v1, H.zw), C = T.P(s * w1, v1, cpZD(H, v1)), D = T.P(s * w0, v0, cpZD(H, v0));
      var ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], wx = D[0] - A[0], wy = D[1] - A[1], wz = D[2] - A[2], nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx, L = Math.hypot(nx, ny, nz) || 1;
      var n = [s * nx / L, s * ny / L, s * nz / L]; if (s < 0) n = [-n[0], -n[1], -n[2]]; n = [n[0] * -1, n[1] * -1, n[2] * -1];
      quads.push({ q: [A, B, C, D], n: n, s: s, v0: v0, v1: v1, w0: w0, w1: w1 }); } });
    // pick the outward normal: it must point away from the hull's centre line
    quads.forEach(function (Q) { if (Q.tr) return; var m = T.P(0, (Q.v0 + Q.v1) / 2, 0), c = [(Q.q[0][0] + Q.q[2][0]) / 2, (Q.q[0][1] + Q.q[2][1]) / 2]; if ((c[0] - m[0]) * Q.n[0] + (c[1] - m[1]) * Q.n[1] < 0) Q.n = [-Q.n[0], -Q.n[1], -Q.n[2]]; });
    var ws = cpHW(H, -H.ls), zs = cpZD(H, -H.ls); quads.push({ q: [T.P(-ws * fx, -H.ls, H.zw), T.P(ws * fx, -H.ls, H.zw), T.P(ws, -H.ls, zs), T.P(-ws, -H.ls, zs)], n: T.N(0, -1), tr: 1 });   // the transom closes the stern
    var E = cpEye(); quads = quads.filter(function (Q) { return cpSees(Q.q, Q.n); });
    quads.sort(function (a, b) { var da = Math.hypot(a.q[0][0] - E[0], a.q[0][1] - E[1]), db = Math.hypot(b.q[0][0] - E[0], b.q[0][1] - E[1]); return db - da; });
    var shadow = []; for (var j = 0; j <= N; j++) shadow.push(T.P(cpHW(H, st[j]) * 1.15 + .25, st[j] + (j === N ? .4 : 0), 0)); for (var j2 = N; j2 >= 0; j2--) shadow.push(T.P(-cpHW(H, st[j2]) * 1.15 - .25, st[j2], 0));
    cpPolyW(shadow, H.sh || "#2a5a88");                                  // the dark water round the hull
    quads.forEach(function (Q) { var s = Q.s, A = Q.q[0], B = Q.q[1];
      cpPolyW(Q.q, cpTone(Q.n, H.col || CPH.blk)); if (Q.tr) { if (H.boot) cpPolyW([Q.q[0], Q.q[1], T.P(ws * (fx + (1 - fx) * .2), -H.ls, H.boot), T.P(-ws * (fx + (1 - fx) * .2), -H.ls, H.boot)], cpTone(Q.n, CPH.red)); return; }
      if (H.boot) { var zb = H.boot, a0 = T.P(s * Q.w0 * (fx + (1 - fx) * .2), Q.v0, zb), b0 = T.P(s * Q.w1 * (fx + (1 - fx) * .2), Q.v1, zb); cpPolyW([A, B, b0, a0], cpTone(Q.n, CPH.red)); }
      if (H.band) { var zz0 = cpZD(H, Q.v0), zz1 = cpZD(H, Q.v1), h = H.band[0]; cpPolyW([T.P(s * Q.w0, Q.v0, zz0 - h), T.P(s * Q.w1, Q.v1, zz1 - h), T.P(s * Q.w1, Q.v1, zz1), T.P(s * Q.w0, Q.v0, zz0)], cpTone(Q.n, H.band[1])); }
      if (H.gold) cpLine3(T.P(s * Q.w0, Q.v0, cpZD(H, Q.v0) - H.gold), T.P(s * Q.w1, Q.v1, cpZD(H, Q.v1) - H.gold), CPH.gold);
      cpLine3(T.P(s * Q.w0, Q.v0, cpZD(H, Q.v0)), T.P(s * Q.w1, Q.v1, cpZD(H, Q.v1)), H.rail || "#c8c0b0");
      if (H.port) for (var pv = Math.ceil(Q.v0 / H.port[0]) * H.port[0]; pv < Q.v1; pv += H.port[0]) { var pw = cpHW(H, pv); if (pw < H.hw * .6) continue; H.port[1].forEach(function (pz) { var pp = T.P(s * (pw * (1 - (1 - fx) * (1 - pz / cpZD(H, pv)))), pv, pz), pr = cpProj(pp[0], pp[1], pp[2]); if (pr) mR(cpc, Math.round(pr.x), Math.round(pr.y), 1, 1, H.portc || "#e8d8a8"); }); }
      if (H.fend) for (var fv = Math.ceil(Q.v0 / 1.1) * 1.1; fv < Q.v1; fv += 1.1) { var fw = cpHW(H, fv); if (fw < H.hw * .7) continue; var fp = cpProj.apply(null, T.P(s * fw * 1.02, fv, cpZD(H, fv) - .35)); if (fp) mR(cpc, Math.round(fp.x), Math.round(fp.y), Math.max(1, Math.round(fp.k * 3)), Math.max(1, Math.round(fp.k * 5)), "#3a2a20"); }
    });
    var deck = []; for (var d = 0; d <= N; d++) deck.push(T.P(cpHW(H, st[d]), st[d], cpZD(H, st[d]))); for (var d2 = N; d2 >= 0; d2--) deck.push(T.P(-cpHW(H, st[d2]), st[d2], cpZD(H, st[d2])));
    if (cpSees(deck, [0, 0, 1])) cpPolyW(deck, H.deck || "#c8a07a");
  }
  // a superstructure deck with rounded front, windows and a dark promenade band
  function cpHouse(T, a, v0, v1, hw, z0, z1, win, col) {
    var r = Math.min(hw, (v1 - v0) * .25), poly = [[-hw, v0], [hw, v0], [hw, v1 - r], [hw * .7, v1 - r * .3], [0, v1], [-hw * .7, v1 - r * .3], [-hw, v1 - r]];
    var c = T.P(0, 0, 0); cpPrism(c[0], c[1], a, poly, z0, z1, col || [CPH.wht[0], CPH.wht[1], CPH.wht[2], "#8a8478"]);
    if (win) [-1, 1].forEach(function (s) { var n = T.N(s, 0); if (!cpSees([T.P(s * hw, v0, z0), T.P(s * hw, v1 - r, z1)], n)) return; var zm = z0 + (z1 - z0) * .55;
      for (var v = v0 + .35; v < v1 - r; v += win) { var p = cpProj.apply(null, T.P(s * hw * 1.01, v, zm)); if (p) mR(cpc, Math.round(p.x), Math.round(p.y) - (p.k > 1.2 ? 1 : 0), p.k > 1.6 ? 2 : 1, p.k > 1.2 ? 2 : 1, "#3a4a5a"); } });
  }
  function cpFunnel(T, a, v, zb, zt, r, rake, col, top, t) {             // a raked oval funnel with a black top
    var oc = []; for (var i = 0; i < 12; i++) oc.push([Math.cos(i / 12 * Math.PI * 2) * r * .8, Math.sin(i / 12 * Math.PI * 2) * r]);
    var c0 = T.P(0, v, 0), c1 = T.P(0, v - rake * .8, 0), c2 = T.P(0, v - rake, 0), zm = zt - (zt - zb) * .22;
    cpPrism(c0[0], c0[1], a, oc, zb, zb + (zm - zb) * .5, col); cpPrism(c1[0], c1[1], a, oc, zb + (zm - zb) * .5, zm, col); cpPrism(c2[0], c2[1], a, oc, zm, zt, top || CP_IRON);
    if (t != null) cpSmoke(T.P(0, v - rake, zt + .2), t, 4);
  }
  function cpBoat(T, a, s, v, z) { var c = T.P(s, v, 0); cpPrism(c[0], c[1], a, [[-.22, -.55], [.22, -.55], [.22, .35], [0, .6], [-.22, .35]], z, z + .22, [CPH.wht[0], CPH.wht[1], CPH.wht[2], "#8a8478"]); cpLine3(T.P(s * 1.15, v - .4, z + .45), T.P(s, v - .4, z + .2), "#3a3a3a"); cpLine3(T.P(s * 1.15, v + .4, z + .45), T.P(s, v + .4, z + .2), "#3a3a3a"); }
  // the liner type: the Mümmel (black funnels with a white band) or the Backentasche (four buff funnels)
  cpShip3 = function (w, a, t, o) {
    var T = cpLoc(w[0], w[1], a), big = !!o.big, s = big ? 1.5 : 1, H = { ls: 7 * s, lb: 7.4 * s, hw: big ? 1.7 : 1.35, zd: 1.5, sb: .55, ss: .25, zw: -.15, boot: .28, gold: .18, port: [.42, [.98, .68]], n: 30, rail: "#d8d0c0" };
    cpHull(T, H, t);
    cpHouse(T, a, -4.6 * s, 3.2 * s, H.hw * .78, 1.5, 2.2, .5); cpHouse(T, a, -3.8 * s, 2.0 * s, H.hw * .7, 2.2, 2.8, .45); cpHouse(T, a, 1.0 * s, 2.3 * s, H.hw * .45, 2.8, 3.25, .35);   // bridge house
    [-1, 1].forEach(function (sd) { for (var bv = -3.4 * s; bv < 1.2 * s; bv += 1.25) cpBoat(T, a, sd * H.hw * .66, bv, 2.8); });
    var fn = big ? [-3.6, -1.4, .8, 3.0] : [-2.2, .4], mum = !big;
    fn.forEach(function (v, i) { cpFunnel(T, a, v * s * (big ? .75 : 1), 2.8, big ? 5.4 : 5.0, .42, .35, mum ? ["#26262e", "#3a3a44", "#1a1a20", "#0a0a0e"] : ["#e8a03a", "#f0b04a", "#c8862a", "#5a3a10"], mum ? ["#f8f4ec", "#ffffff", "#d8d0c0", "#6a6a6a"] : null, !big || i < 3 ? t : null);
      if (mum) { var c = T.P(0, v - .35, 0); cpPrism(c[0], c[1], a, cpOct(1).map(function (p) { return [p[0] * .34, p[1] * .42]; }), 4.62, 5.0, ["#26262e", "#3a3a44", "#1a1a20", "#0a0a0e"]); } });
    var m1 = T.P(0, 6.0 * s, 1.9), m1t = T.P(0, 5.6 * s, 7.6), m2 = T.P(0, -5.8 * s, 1.7), m2t = T.P(0, -6.2 * s, 7.2);
    cpLine3(m1, m1t, "#5a3a22"); cpLine3(m2, m2t, "#5a3a22"); cpLine3(T.P(-.7, 5.65 * s, 6.6), T.P(.7, 5.65 * s, 6.6), "#5a3a22"); cpLine3(T.P(-.7, -6.15 * s, 6.2), T.P(.7, -6.15 * s, 6.2), "#5a3a22");
    cpLine3(m1t, m2t, "#b8b0a0"); cpLine3(m1t, T.P(0, 7.4 * s, cpZD(H, 7.4 * s)), "#b8b0a0"); cpLine3(m2t, T.P(0, -7 * s, cpZD(H, -7 * s)), "#b8b0a0");
    var fl = cpProj.apply(null, m2t); if (fl) { var fw = Math.floor(t / 300) % 2; mR(cpc, Math.round(fl.x) + 1, Math.round(fl.y), 4 - fw, 3, "#2a4a8a"); mR(cpc, Math.round(fl.x) + 1, Math.round(fl.y), 2, 1, "#d8463c"); }
    if (o.ropes && !o.snapped) { var AN = cp.anc[o.leg], b1 = cpW(AN, -8.75, 31), b2 = cpW(AN, -8.75, 12); cpRope3(T.P(-H.hw, 6.2, 1.9), [b1[0], b1[1], 1.5], .3, "#e0d0a8"); cpRope3(T.P(-H.hw, -6.4, 1.7), [b2[0], b2[1], 1.5], .3, "#e0d0a8"); }
  };
  // tug, pilot cutter and tender in the shapes of the stoker's sprites
  cpTugM = function (w, a, t, o, kind) {
    var T = cpLoc(w[0], w[1], a), tend = kind === "tender", pil = kind === "pilot", s = tend ? 1.45 : 1;
    var H = { ls: 2.0 * s, lb: 2.2 * s, hw: .8 * s, zd: .7, sb: .45, ss: .1, zw: -.1, n: 10, boot: .18, fend: !tend && !pil, rail: "#c8c0b0",
      col: pil ? [CPH.wht[1], CPH.wht[0], CPH.wht[2], CPH.wht[3]] : CPH.blk, band: pil ? [.22, ["#2a3a6a", "#3a4a7a", "#1e2a4e", "#101830"]] : null, port: tend ? [.5, [.42]] : null };
    cpHull(T, H, t);
    if (tend) { cpHouse(T, a, -1.9, 1.6, .9, .7, 1.3, .4); cpHouse(T, a, -.6, .9, .55, 1.3, 1.75, .3); cpFunnel(T, a, -.1, 1.75, 2.9, .3, .25, ["#e8a03a", "#f0b04a", "#c8862a", "#5a3a10"], null, t); }
    else { cpHouse(T, a, -.9, .6, .5, .7, 1.35, .3); cpHouse(T, a, .1, .75, .42, 1.35, 1.75, .28); cpFunnel(T, a, -.45, 1.35, 2.6, .27, .25, pil ? ["#e8a03a", "#f0b04a", "#c8862a", "#5a3a10"] : ["#c8342a", "#d8463c", "#9a2a20", "#3a1008"], null, t);
      var mt = T.P(0, 1.2, .8); cpLine3(mt, T.P(0, 1.1, 2.9), "#5a3a22"); }
    if (pil) { var fp = cpProj.apply(null, T.P(0, 1.1, 2.9)); if (fp) { var fw = Math.floor(t / 250) % 2; mR(cpc, Math.round(fp.x) + 1, Math.round(fp.y), 4 - fw, 2, "#d8463c"); mR(cpc, Math.round(fp.x) + 1, Math.round(fp.y) + 2, 4, 2, "#f8f4ec"); } }
    if (o.tow && o.leg === cp.leg && !(cp.anim && cp.anim.u > .6)) cpRope3(T.P(0, -2.0, .7), shipW(o.x > 0 ? .4 : -.4, 2.1, 1.35), .5, "#d8c8a0");
  };
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
    if (o.m === "tug") return cpTugM(w, a, t, o, "tug");
    if (o.m === "tug_old") {
      var th = [[-.8, -2.1], [.8, -2.1], [.8, 1.2], [0, 2.2], [-.8, 1.2]];
      cpPrism(w[0], w[1], a, th, -.1, .75, ["#c8a07a", "#8a3a2a", "#5a2418", "#2a1008"]); var tc = T.P(0, -.3, 0); cpBox3(tc[0], tc[1], a, 1, 1.4, .75, 1.45, CP_WHITE);
      var tf = T.P(0, .05, 0); cpBox3(tf[0], tf[1], a, .45, .45, 1.45, 2.4, ["#c8342a", "#d8463c", "#9a2a20", "#3a1008"]); cpBox3(tf[0], tf[1], a, .47, .47, 2.15, 2.4, CP_IRON);
      var ts = cpProj(tf[0], tf[1], 2.6); if (ts) for (var k2 = 0; k2 < 3; k2++) mR(cpc, Math.round(ts.x) - k2 * 2 - (Math.floor(t / 350) % 2), Math.round(ts.y) - k2 * 2 - 1, 2, 2, "#c8c8d0");
      if (o.tow && o.leg === cp.leg && !(cp.anim && cp.anim.u > .6)) cpRope3(T.P(0, -2.1, .75), shipW(o.x > 0 ? .4 : -.4, 2.1, 1.35), .5, "#d8c8a0");
      return; }
  }
  // the foredeck of the Pausbacke below the windows: planks, hatch, windlass, white bulwarks, the jack staff
  var CP_DECK = [[-2.7, -5.6], [2.7, -5.6], [2.5, -1], [1.6, 1], [0, 2.4], [-1.6, 1], [-2.5, -1]];
  function cpDeckIce() { (cp.deckIce || []).forEach(function (c, i) { var p = shipW(c[0], c[1], 0); cpPrism(p[0], p[1], cp.h + i, cpBlobPoly(c[2] + .1, 6, i), 1.0, 1.0 + c[2], ["#ffffff", "#e8f4fc", "#a8c8dc", "#4a6a80"]); }); }
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
    cp.O.forEach(function (o) { if (o.k === "shoal") { cpShoalDraw(o); return; } if (o.hid || o.scared && performance.now() - o.scared > 500) return; if (o.k === "quay") { G0.push(o); return; }
      if (o.so && !(o.leg === cp.leg && sv >= 0 && (!o.w || sv >= o.w[0] && sv <= o.w[1]))) return;   // sequence actors only while their scene plays
      var q = cpWP(o);
      if (o.k === "m3" || CP_3K[o.k]) { var c = cpC(q[0], q[1], 0); if (c[0] < -9 || c[0] > (o.k === "statue" || o.k === "nyb" ? 240 : 125)) return;
        if (o.k !== "m3" && !glass && cpHidden(o, c[0])) { var pu = cpProj(q[0], q[1]); if (pu) G3.push([o, pu]); return; }
        (CP_LAND[o.m] ? G1 : G3).push([o, { f: c[0], w: q, m: 1 }]); return; }
      var p = cpProj(q[0], q[1]); if (!p || p.f > 110 || p.x < -60 || p.x > 240) return; G3.push([o, p]); });
    G0.forEach(function (o) { cpQuay3(o, t, 0); }); G1.sort(byf).forEach(function (v) { cpModel(v[0], v[1].w, t); }); G0.forEach(function (o) { cpQuay3(o, t, 1); });
    G3.sort(byf).forEach(function (v) { var o = v[0], p = v[1]; if (p.m) return cpModel(o, p.w, t); var X = Math.round(p.x), Y = Math.round(p.y);
      if (o.k === "pier") return cpPier(p, t);
      if (o.ani && p.f < 18) return;                                     // the animals dive before the ship comes close
      if (!glass && cpHidden(o, p.f)) { cpUnknown(X, Y, p.sz, t); return; }
      cpThing(o, X, Y, p.sz, t); });
    cpSwimDraw(t); cpFxDraw(t);
  }
  // ---- the binoculars: look around by dragging, turn the focus until it is sharp; held sharp on something, it is recognised ----
  function cpDrawGlass(t) {
    var g = cp.glass, sky = cpSky(), P = CP_SEA[sky], skc = P[0], sea = P[1], r = 0;
    CAMV = { yaw: g.yaw, Z: 3, hz: 46 };
    try {
      for (var y = 0; y < 135; y++) { cpc.fillStyle = y < 46 ? skc[y < 18 ? 0 : y < 36 ? 1 : 2] : (cpHash(y, 7) < .6 ? sea[0] : sea[1]); cpc.fillRect(0, y, 180, 1); }
      cpSkyDraw(sky, t); cp.B.forEach(function (o) { if (o.leg <= cp.leg + 1) cpBack(cpBW(o), sky); }); cpWater(t, sky, sky === "storm" ? 1 : 0); cpWorldDraw(t, true);
      if (sky === "fog") { cpc.fillStyle = "rgba(226,232,236,.4)"; cpc.fillRect(0, 0, 180, 135); }
      var cand = null, cd = 99, nf = 40, nd = 99;
      cp.O.forEach(function (o) { if (o.hid || o.so || o.k === "quay" || o.k === "pier") return; var q = cpWP(o), p = cpProj(q[0], q[1], o.k === "m3" ? 2 : 0); if (!p || p.f > 70) return; if (o.ani && p.f < 18) return;
        var d = Math.hypot(p.x - 90, p.y - 6 - 64); if (d < nd) { nd = d; nf = p.f; } if (o.k !== "m3" && cpHidden(o, p.f) && d < cd) { cd = d; cand = [o, p]; } });
      var tgt = cand && cd < 18 ? cand[1].f : nd < 26 ? nf : 40; r = Math.min(3, Math.floor(Math.abs(g.foc - tgt) / (tgt * .1 + 1.2)));
      var dt = Math.min(.1, (t - (g.lt || t)) / 1000); g.lt = t;
      if (cand && cd < 18 && r === 0) { g.hold += dt; if (g.hold > .55) { cpFound(cand[0]); g.hold = 0; } } else g.hold = 0;
    } catch (e) { }
    CAMV = { yaw: 0, Z: 1, hz: CP_HZ };
    var im = cpc.getImageData(0, 0, 180, 135), D = im.data, SH = new Uint8ClampedArray(D), err = typeof tgt === "number" ? (g.foc - tgt) / (tgt * .1 + 1.2) : 0;
    if (r > 0) [1, 180].forEach(function (st) { var src = new Uint8ClampedArray(D), lim = st === 1 ? 180 : 135;
      for (var yy = 0; yy < 135; yy++) for (var xx = 0; xx < 180; xx++) { var pos = st === 1 ? xx : yy, sr = 0, sg = 0, sb = 0, n = 0;
        for (var k = -r; k <= r; k++) { var pp = pos + k; if (pp < 0 || pp >= lim) continue; var ii = ((st === 1 ? yy * 180 + pp : pp * 180 + xx)) * 4; sr += src[ii]; sg += src[ii + 1]; sb += src[ii + 2]; n++; }
        var o2 = (yy * 180 + xx) * 4; D[o2] = sr / n; D[o2 + 1] = sg / n; D[o2 + 2] = sb / n; } });
    // focus aid in the middle: a split-image circle, the upper half slides one way and the lower half the other until both line up
    var shift = Math.max(-12, Math.min(12, Math.round(err * 3))), sharp = r === 0 && Math.abs(err) < 1;
    for (var ys = 52; ys <= 76; ys++) for (var xs = 78; xs <= 102; xs++) { var dd = (xs + .5 - 90) * (xs + .5 - 90) + (ys + .5 - 64) * (ys + .5 - 64); if (dd > 121) continue; var sx = Math.max(0, Math.min(179, xs + (ys < 64 ? shift : -shift))), si = (ys * 180 + sx) * 4, di = (ys * 180 + xs) * 4;
      if (dd > 100) { var rc = sharp ? [255, 211, 74] : [40, 36, 44]; D[di] = rc[0]; D[di + 1] = rc[1]; D[di + 2] = rc[2]; continue; } D[di] = SH[si]; D[di + 1] = SH[si + 1]; D[di + 2] = SH[si + 2]; if (ys === 64) { D[di] = D[di] * .55; D[di + 1] = D[di + 1] * .55; D[di + 2] = D[di + 2] * .55; } }
    // the knurled focus ring round the right eyepiece turns with the focus
    var phase = g.foc * .9, glow = g.ring ? 1 : 0;
    for (var y3 = 0; y3 < 135; y3++) for (var x3 = 0; x3 < 180; x3++) { var d1 = (x3 + .5 - 66) * (x3 + .5 - 66) + (y3 + .5 - 64) * (y3 + .5 - 64), d2 = (x3 + .5 - 114) * (x3 + .5 - 114) + (y3 + .5 - 64) * (y3 + .5 - 64), i3 = (y3 * 180 + x3) * 4, c3 = null;
      if (d1 > 1936 && d2 > 1936) { if (d2 < 2601 && d1 > 1980) { var an = Math.atan2(y3 + .5 - 64, x3 + .5 - 114), rid = Math.floor(an * 18 / Math.PI + phase) & 1, edge = d2 < 2025 || d2 > 2500; c3 = edge ? [30, 26, 30] : rid ? (glow ? [200, 160, 64] : [168, 132, 52]) : (glow ? [120, 92, 40] : [92, 70, 34]); if (!edge && y3 < 64 && !rid) c3 = [c3[0] + 26, c3[1] + 22, c3[2] + 10]; }
        else c3 = d1 < 2070 || d2 < 2070 ? [58, 58, 68] : [20, 16, 24]; }
      if (c3) { D[i3] = c3[0]; D[i3 + 1] = c3[1]; D[i3 + 2] = c3[2]; } }
    cpc.putImageData(im, 0, 0);
    // which way to turn: a little arrow on the ring (clockwise = farther)
    if (!sharp && typeof tgt === "number") { var cw = err < 0, a0 = -1.05, pts = []; for (var k3 = 0; k3 < 7; k3++) { var aa = a0 + (cw ? k3 : -k3) * .07; pts.push([114 + Math.cos(aa) * 53.5, 64 + Math.sin(aa) * 53.5]); }
      var bl = Math.floor(t / 300) % 2; pts.forEach(function (p) { mR(cpc, Math.round(p[0]), Math.round(p[1]), 2, 2, bl ? "#ffd34a" : "#e8a03a"); }); var tip = pts[6], tp2 = pts[5], dx = tip[0] - tp2[0], dy = tip[1] - tp2[1];
      for (var w = 1; w <= 3; w++) { mR(cpc, Math.round(tip[0] - dx * w * .6 - dy * w * .9), Math.round(tip[1] - dy * w * .6 + dx * w * .9), 2, 2, bl ? "#ffd34a" : "#e8a03a"); mR(cpc, Math.round(tip[0] - dx * w * .6 + dy * w * .9), Math.round(tip[1] - dy * w * .6 - dx * w * .9), 2, 2, bl ? "#ffd34a" : "#e8a03a"); } }
  }
  function cpFound(it) {
    it.seen = true; beep([[1046, .04], [1318, .06]]);
    var msg = it.k === "ice" ? "Ein Eisberg!" : it.k === "floe" ? "Eine Scholle" : it.k === "boat" ? "Ein Fischerboot!" : it.k === "wood" ? "Treibholz!" : it.k === "ship" ? "Ein Dampfer" : CP_NAME[it.k] || "";
    if (it.ani || it.find) { var LG = cpLog(), first = !LG[it.k]; LG[it.k] = (LG[it.k] || 0) + 1; if (cp.found.indexOf(it.k) < 0) cp.found.push(it.k); if (first) cp.newF.push(it.k); msg = first ? "Neu im Logbuch: " + CP_NAME[it.k] + "!" : CP_NAME[it.k] + "!"; if (window.SudokuSave) window.SudokuSave(); }
    cpSay(msg);
  }
  function cpGlass(on, yaw) { if (!cp || cp.anim) return; cp.glass = on ? { yaw: yaw || 0, foc: 8, hold: 0 } : null; if (on && !cp.glassTold) { cp.glassTold = 1; cpSay("Ring am rechten Glas drehen"); } cpPanelDraw(); if (on) { if (!cpRaf) cpRaf = requestAnimationFrame(cpDraw); } else cpRedraw(); }
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
  // ===== refined small craft, buoys, quays and sheds in the style of the liners =====
  var CP_BOATC = [[["#3a6a9a", "#4a7aaa", "#2a5280", "#162a44"], "#f8f4ec"], [["#3a7a4a", "#4a8a5a", "#2a5a36", "#14301c"], "#f6e8c8"], [["#a8442a", "#b8543a", "#86321e", "#40160c"], "#f8f4ec"], [["#8a6a44", "#9a7a52", "#6a5034", "#342414"], "#e8d8b0"]];
  function cpSail(T, pts, c, oc) { cpPolyW(pts.map(function (p) { return T.P(p[0], p[1], p[2]); }), c, oc); }
  var _cpKind0 = cpKind;
  cpKind = function (o, w, a, t, k) {
    var T = cpLoc(w[0], w[1], a);
    if (k === "boat") { var C = CP_BOATC[(Math.abs(Math.round(o.x * 7 + o.y * 3))) % 4];
      cpHull(T, { ls: 1.6, lb: 1.9, hw: .58, zd: .45, sb: .32, ss: .12, zw: -.08, n: 10, col: C[0], band: [.08, [C[1], C[1], "#c8c0b0", "#8a8478"]], rail: "#5a3a22", deck: "#c8a07a", sh: "#2a5a88" }, t);
      var cb = T.P(0, -.5, 0); cpBox3(cb[0], cb[1], a, .5, .7, .45, .8, ["#e8dcc8", "#f0e8d8", "#c8bca8", "#5a4a3a"]);
      var mb = T.P(0, .35, .5), mt = T.P(0, .3, 3.2); cpLine3(mb, mt, "#5a3a22"); cpLine3(T.P(0, .3, .85), T.P(0, -1.5, .9), "#5a3a22");
      var flap = Math.sin(t / 700 + o.x) * .06;
      cpSail(T, [[flap, .28, .9], [flap * 2, .28, 3.0], [flap * 1.5, -1.0, 2.5], [flap, -1.45, .95]], C[1], "#a8987a");
      cpSail(T, [[0, .4, 3.0], [0, 1.85, .62], [0, .42, .9]], "#f0e8d8", "#a8987a"); cpLine3(T.P(0, .3, 3.2), T.P(0, 1.9, .6), "#8a7a64");
      var fp = cpProj.apply(null, mt); if (fp) mR(cpc, Math.round(fp.x), Math.round(fp.y) - 1, 2, 1, "#d8463c"); return; }
    if (k === "schooner") {
      cpHull(T, { ls: 2.6, lb: 3.0, hw: .8, zd: .55, sb: .4, ss: .15, zw: -.1, n: 14, col: ["#2a4a5a", "#3a5a6a", "#1e3644", "#0e1c24"], band: [.1, ["#f4ecdc", "#fff8ec", "#d8d0c0", "#a8a090"]], boot: .12, rail: "#8a6a44", deck: "#d8b08a" }, t);
      var dh = T.P(0, -1.3, 0); cpBox3(dh[0], dh[1], a, .7, 1.0, .55, .95, ["#c8a07a", "#d8b08a", "#a8805a", "#4a3020"]);
      [[-1.0, 4.4], [1.1, 4.9]].forEach(function (m, i) { var b0 = T.P(0, m[0], .6), b1 = T.P(0, m[0] - .15, m[1]); cpLine3(b0, b1, "#5a3a22");
        var fl = Math.sin(t / 650 + i) * .05; cpSail(T, [[fl, m[0] - .1, 1.0], [fl * 2, m[0] - .15, m[1] - .4], [fl * 2, m[0] - 1.9, m[1] - 1.0], [fl, m[0] - 2.0, 1.05]], "#fff4e0", "#a8987a"); });
      cpSail(T, [[0, 1.0, 4.5], [0, 3.0, .7], [0, 1.1, 1.0]], "#f4ecdc", "#a8987a"); cpLine3(T.P(0, .95, 4.9), T.P(0, 3.4, .8), "#8a7a64");
      var ft = cpProj.apply(null, T.P(0, .95, 4.9)); if (ft) { var fw = Math.floor(t / 250) % 2; [["#d8463c", 0], ["#ffd34a", 2], ["#d8463c", 4]].forEach(function (f) { mR(cpc, Math.round(ft.x) - 4 - fw, Math.round(ft.y) + f[1], 3, 2, f[0]); }); }
      return; }
    if (k === "light") {
      cpHull(T, { ls: 2.8, lb: 3.0, hw: .9, zd: 1.0, sb: .35, ss: .15, zw: -.12, n: 14, col: ["#c8342a", "#d8463c", "#a02a22", "#4a100c"], port: [.5, [.62]], portc: "#f8f4ec", rail: "#f0e8d8", deck: "#c8a07a" }, t);
      cpHouse(T, a, -1.6, .2, .55, 1.0, 1.55, .35);
      var mt2 = T.P(0, .7, 0); cpLine3([mt2[0], mt2[1], 1.0], [mt2[0], mt2[1], 4.2], "#5a3a22"); var on = cpBlink(t), oc = []; for (var i = 0; i < 10; i++) oc.push([Math.cos(i / 10 * 6.283) * .32, Math.sin(i / 10 * 6.283) * .32]);
      cpPrism(mt2[0], mt2[1], a, oc, 3.9, 4.45, [on ? "#ffe08a" : "#8a7a4a", on ? "#fff4b0" : "#9a8a5a", on ? "#ffd34a" : "#6a5a3a", "#3a2414"]); cpPrism(mt2[0], mt2[1], a, oc.map(function (p) { return [p[0] * 1.3, p[1] * 1.3]; }), 4.45, 4.6, CP_IRON);
      if (on) { var lp = cpProj(mt2[0], mt2[1], 4.2); if (lp) { mR(cpc, Math.round(lp.x) - 4, Math.round(lp.y), 3, 1, "#fff4b0"); mR(cpc, Math.round(lp.x) + 2, Math.round(lp.y), 3, 1, "#fff4b0"); } } return; }
    if (k === "buoyR" || k === "buoyG") { var red = k === "buoyR", P = red ? ["#e8584a", "#f06a5a", "#b8362a", "#4a100c"] : ["#5ab04a", "#6ac05a", "#3a8a2e", "#123a0c"], ring = function (r) { var q = []; for (var i = 0; i < 12; i++) q.push([Math.cos(i / 12 * 6.283) * r, Math.sin(i / 12 * 6.283) * r]); return q; };
      cpPolyW(ring(.62).map(function (p) { return [w[0] + p[0], w[1] + p[1] * .8, 0]; }), "#2a5a88");
      cpPrism(w[0], w[1], 0, ring(.5), -.05, .22, CP_IRON);
      if (red) { cpPrism(w[0], w[1], 0, ring(.34), .22, .95, P); cpPrism(w[0], w[1], 0, ring(.35), .62, .72, CP_WHITE); }
      else { cpPrism(w[0], w[1], 0, ring(.4), .22, .45, P); cpPrism(w[0], w[1], 0, ring(.29), .45, .7, P); cpPrism(w[0], w[1], 0, ring(.17), .7, .95, P); cpPrism(w[0], w[1], 0, ring(.07), .95, 1.08, P); }
      cpLine3([w[0] - .15, w[1], .95], [w[0] - .15, w[1], 1.35], "#3a3a3a"); cpLine3([w[0] + .15, w[1], .95], [w[0] + .15, w[1], 1.35], "#3a3a3a"); if (cpBlink(t, w[0])) cpBill([w[0], w[1], 1.42], 2, 2, "#ffe08a"); return; }
    return _cpKind0(o, w, a, t, k);
  };
  // the quay: dressed stone courses, coping, iron ladders, hanging fenders, cobbles near by
  var _cpQuay0 = cpQuay3;
  cpQuay3 = function (o, t, pass) {
    _cpQuay0(o, t, pass); if (pass) return;
    var AN = cp.anc[o.leg], side = o.x > 0 ? 1 : -1, Z1 = 1.2, T = cpLoc(AN.x, AN.y, AN.h), xf = o.x - side * .04;
    if (!cpSees([T.P(xf, o.y0, 0), T.P(xf, o.y1, Z1)], T.N(-side, 0))) return;
    var near = function (y) { var c = cpC.apply(null, T.P(xf, y, 0)); return c[0] > -5 && c[0] < 34; };
    [.38, .82].forEach(function (z) { cpLine3(T.P(xf, o.y0, z), T.P(xf, o.y1, z), "#7e746a"); });
    var cop = T.P(o.x + side * .25, (o.y0 + o.y1) / 2, 0); cpBox3(cop[0], cop[1], AN.h, .5, o.y1 - o.y0, Z1, Z1 + .1, ["#d8ccb8", "#c8bca8", "#a89c88", "#5a524c"]);
    for (var y = Math.ceil(o.y0 / 1.6) * 1.6; y < o.y1; y += 1.6) { if (!near(y)) continue; var off = (Math.round(y / 1.6) % 2) * .8;
      cpLine3(T.P(xf, y + off, .38), T.P(xf, y + off, .82), "#7e746a"); cpLine3(T.P(xf, y + .4, .82), T.P(xf, y + .4, Z1), "#7e746a"); cpLine3(T.P(xf, y + 1.2 - off * .5, .2), T.P(xf, y + 1.2 - off * .5, .38), "#7e746a");
      var tp = T.P(o.x + side * 1.6, y, Z1), tq = T.P(o.x + side * 9, y, Z1); if (Math.round(y / 1.6) % 3 === 0) cpLine3(tp, tq, "#968a78"); }
    for (var ly = Math.ceil(o.y0 / 11) * 11 + 3; ly < o.y1; ly += 11) { if (!near(ly)) continue; [-.25, .25].forEach(function (d) { cpLine3(T.P(xf - side * .03, ly + d, .05), T.P(xf - side * .03, ly + d, Z1 + .25), "#2e2e34"); });
      for (var rz = .2; rz < Z1; rz += .22) cpLine3(T.P(xf - side * .03, ly - .25, rz), T.P(xf - side * .03, ly + .25, rz), "#46464e"); }
    for (var fy = Math.ceil(o.y0 / 4.3) * 4.3 + 1.5; fy < o.y1; fy += 4.3) { if (!near(fy)) continue; var fp = cpProj.apply(null, T.P(xf - side * .05, fy, .75)); if (!fp) continue; var r = Math.max(1, Math.round(fp.k * 3.5));
      cpBlob(fp.x, fp.y, r, r * 1.2, function (dx, dy) { var d = dx * dx + dy * dy; return d > .75 ? "#141418" : d < .2 ? "#7e746a" : dx < 0 ? "#3a3a40" : "#26262c"; }); }
  };
  // the warehouse: brick courses, white-framed arched windows, a green name board, skylights and a chimney on the roof
  var _cpModel0 = cpModel;
  cpModel = function (o, w, t) {
    _cpModel0(o, w, t);
    if (o.m !== "shed") return; var a = cp.anc[o.leg].h + (o.a || 0), T = cpLoc(w[0], w[1], a), Wd = o.w, L = o.l;
    [-1, 1].forEach(function (su) { var u = su * (Wd / 2 + .04), n = T.N(su, 0); if (!cpSees([T.P(u, -L / 2, 1.2), T.P(u, L / 2, 4.2)], n)) return;
      for (var z = 1.5; z < 4.2; z += .32) cpLine3(T.P(u, -L / 2, z), T.P(u, L / 2, z), su * (n[0] * .55 - n[1] * .45) > 0 ? "#b0604a" : "#7a3e2e");
      cpPolyW([T.P(u, -L / 2, 3.95), T.P(u, L / 2, 3.95), T.P(u, L / 2, 4.2), T.P(u, -L / 2, 4.2)], "#2e5a3a"); for (var gv = -L / 2 + .6; gv < L / 2; gv += .8) { var gp = cpProj.apply(null, T.P(u, gv, 4.07)); if (gp && Math.abs(gv) < L * .3) mR(cpc, Math.round(gp.x), Math.round(gp.y), 1, 1, "#e8c050"); }
      for (var v = -L / 2 + 1.4; v < L / 2 - 1; v += 2.1) { if (Math.abs(v) < 1.6) continue; [[2, 2.8], [3.2, 3.9]].forEach(function (zz) { var c = cpProj.apply(null, T.P(u, v, zz[1])); if (!c) return; var r = c.k * 16 * .45;
          if (r >= 2) cpBlob(c.x, c.y, r, r * .55, function (dx, dy) { return dy < 0 ? "#2a3a4a" : null; });
          cpLine3(T.P(u, v - .45, zz[0]), T.P(u, v - .45, zz[1]), "#f0e8d8"); cpLine3(T.P(u, v + .45, zz[0]), T.P(u, v + .45, zz[1]), "#f0e8d8"); cpLine3(T.P(u, v, zz[0]), T.P(u, v, zz[1]), "#d8d0c0"); cpLine3(T.P(u, v - .45, (zz[0] + zz[1]) / 2), T.P(u, v + .45, (zz[0] + zz[1]) / 2), "#d8d0c0"); }); } });
    [-L / 3, 0, L / 3].forEach(function (v, i) { var s = T.P(.9, v, 0); cpBox3(s[0], s[1], a, .7, 1.4, 4.75, 5.05, ["#a8c8dc", "#c8e0f0", "#7a98ac", "#2a3a4a"]); });
    var ch = T.P(-Wd * .25, L / 2 - 2, 0); cpBox3(ch[0], ch[1], a, .5, .5, 4.6, 6.3, ["#a8543a", "#b8644a", "#7a3a26", "#3a1a10"]); cpSmoke(T.P(-Wd * .25, L / 2 - 2, 6.5), t, 3);
  };
  // ===== the whole voyage in detail: hamster crowds, a sky that turns with the ship, scenery, and what goes wrong =====
  var CP_FUR = [["#e8a85a", "#f6c88a", "#b87a3a"], ["#f4e8d4", "#fffaf0", "#c8b8a0"], ["#a8a0a0", "#c8c0c0", "#787070"], ["#8a5a3a", "#a87450", "#5a3a22"], ["#f0d8b0", "#fff1d8", "#c8a87a"], ["#3a3034", "#5a4a50", "#1e181a"]];
  cpHam = function (wx, wy, wz, seed, t) {                               // a hamster: round, ears, light belly, eyes and pink cheeks when near
    var p = cpProj(wx, wy, wz); if (!p || p.f > 50 || p.x < -6 || p.x > 186) return;
    var s = p.k * 16, F = CP_FUR[seed % 6], fast = cp.anim && (cp.anim.pre || cp.anim.crash || cp.anim.splash) ? 2.5 : 1, hop = (Math.floor(t * fast / 260) + seed) % 4 === 0 ? 1 : 0;
    var w = Math.max(3, Math.round(.5 * s)), h = Math.max(3, Math.round(.56 * s)), x = Math.round(p.x - w / 2), y = Math.round(p.y) - h - hop, cx = x + w / 2, cy = y + h / 2;
    if (w <= 3) { mR(cpc, x - 1, y, w + 2, h, "#2a1a10"); mR(cpc, x, y - 1, w, h + 1, "#2a1a10"); mR(cpc, x, y, w, h - 1, F[0]); mR(cpc, x + 1, y + 1, 1, h - 2, F[1]); mR(cpc, x - 1, y - 1, 1, 1, "#2a1a10"); mR(cpc, x + w, y - 1, 1, 1, "#2a1a10"); }
    else { var er = Math.max(1, Math.round(w * .2));
      [[x + er * .8, y + 1], [x + w - er * .8, y + 1]].forEach(function (e) { cpBlob(e[0], e[1], er + .7, er + .7, function () { return "#2a1a10"; }); cpBlob(e[0], e[1], er, er, function () { return w >= 7 ? "#f0a0a0" : F[2]; }); });
      cpBlob(cx, cy, w / 2 + .8, h / 2 + .8, function () { return "#2a1a10"; });
      cpBlob(cx, cy, w / 2, h / 2, function (dx, dy) { return dy > .05 && Math.abs(dx) < .55 ? F[1] : dx < -.45 && dy < .2 ? F[1] : dx > .55 ? F[2] : F[0]; });
      if (w >= 5) { var ey = Math.round(y + h * .32); mR(cpc, Math.round(cx - w * .22), ey, 1, 1, "#1e120a"); mR(cpc, Math.round(cx + w * .22) - 1, ey, 1, 1, "#1e120a"); mR(cpc, Math.round(cx) - 1 + (w % 2 ? 1 : 0), ey + 1, w % 2 ? 1 : 2, 1, "#c86a6a"); }
      if (w >= 7) { mR(cpc, Math.round(cx - w * .36), Math.round(y + h * .45), 2, 1, "#f0a0a0"); mR(cpc, Math.round(cx + w * .36) - 1, Math.round(y + h * .45), 2, 1, "#f0a0a0"); } }
    if (seed % 5 === 1) { mR(cpc, x, y - 1, w, 1, "#3a2414"); mR(cpc, x + 1, y - 2 - (w > 5 ? 1 : 0), w - 2, w > 5 ? 2 : 1, "#3a2414"); if (w > 5) mR(cpc, x + 1, y - 1, w - 2, 1, "#c8463c"); }      // top hat
    else if (seed % 5 === 3) { mR(cpc, x - 1, y - 1, w + 2, 1, "#e8c87a"); mR(cpc, x + 1, y - 2, w - 2, 1, "#f0d890"); }                                                                            // straw boater
    if (seed % 3 === 0) { var up = Math.floor(t * fast / 200 + seed) % 2, fx = x + w + 1; mR(cpc, fx, y - 3, 1, h + 2, "#5a3a22"); mR(cpc, fx + 1, y - 3 + up, 3, 2, seed % 2 ? "#ffffff" : "#d8463c"); if (!(seed % 2)) mR(cpc, fx + 1, y - 2 + up, 3, 1, "#3a5a9a"); }   /* a little flag or handkerchief on a stick */
  };
  // ---- the sky turns with the ship: sun, moon, clouds and stars stand at fixed compass bearings ----
  function cpAng(b) { var d = b - cp.h - CAMV.yaw; return ((d + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; }
  function cpSkyX(b) { return 90 + cpAng(b) * 160 * CAMV.Z; }
  function cpSkyDraw(sky, t) {
    var hz = CAMV.hz, z = CAMV.Z;
    if (sky === "night") { for (var i = 0; i < 70; i++) { var sx = cpSkyX(i * .0898 + cpHash(i, 2) * .08), sy = 1 + cpHash(i, 3) * (hz - 4); if (sx < 0 || sx > 180) continue; mR(cpc, Math.round(sx), Math.round(sy), 1, 1, (i + Math.floor(t / 500)) % 11 ? "#c8d4f0" : "#ffffff"); }
      var mx = cpSkyX(.7); cpBlob(mx, hz - 11, 3.5, 3.5, function (dx, dy) { return dx > .35 ? null : dx * dx + dy * dy > .7 ? "#e8e4c8" : "#fffaf0"; }); return; }
    if (sky === "fog") return;
    if (sky === "day" || sky === "eve" || sky === "dawn") { var sb = sky === "eve" ? -.4 : sky === "dawn" ? 2.75 : .85, sxx = cpSkyX(sb), syy = sky === "day" ? hz - 12 : hz - 3, rr = sky === "day" ? 3 : 4.5;
      cpBlob(sxx, syy, rr + 1.5, rr + 1.5, function () { return sky === "day" ? "#fffae0" : "#ffd8a0"; }); cpBlob(sxx, syy, rr, rr, function () { return sky === "day" ? "#fff6c0" : "#ffb870"; }); }
    var storm = sky === "storm", n = storm ? 16 : 9;
    for (var c = 0; c < n; c++) { var b = c * (6.283 / n) + cpHash(c, 7) * .5 + t * 4e-6, x = cpSkyX(b), y = Math.round((storm ? 2 : 3) + cpHash(c, 8) * (hz - (storm ? 8 : 10))), cw = Math.round((10 + cpHash(c, 9) * 16) * (storm ? 1.6 : 1));
      if (x < -cw * 2 || x > 180 + cw * 2) continue; var lit = storm ? ["#3a424c", "#2e353e", "#262c33"] : sky === "eve" ? ["#fbe0c8", "#f0c0a0", "#d89a80"] : sky === "dawn" ? ["#fbe8e8", "#f0d0d0", "#d8b0b8"] : ["#ffffff", "#f0f6fa", "#c8d8e4"];
      [[-.45, .55, .5], [0, 1, .8], [.42, .6, .55]].forEach(function (q) { var bx = x + q[0] * cw, bw = cw * q[1] * .5, bh = cw * q[2] * .22 + 1.5;
        cpBlob(bx, y, bw, bh, function (dx, dy) { return dy > .45 ? lit[2] : dy > -.1 ? lit[1] : lit[0]; }); }); }
  }
  // ---- people in the water after a ramming: hamsters bobbing in orange life rings ----
  function cpSwimmers(p, n) { cp.swim = cp.swim || []; for (var i = 0; i < n; i++) cp.swim.push({ x: p[0] + (Math.random() - .5) * 3, y: p[1] + (Math.random() - .5) * 2, t0: performance.now() + i * 300, c: Math.floor(Math.random() * 6), leg: cp.leg }); }
  function cpSwimDraw(t) { (cp.swim || []).forEach(function (s) { if (t < s.t0) return; var p = cpProj(s.x, s.y + Math.sin(t / 900 + s.c) * .2, 0); if (!p) return; var r = Math.max(2, p.k * 16 * .32), bob = Math.round(Math.sin(t / 300 + s.c) * Math.max(1, r * .15));
      cpBlob(p.x, p.y + bob, r + .8, r * .5 + .8, function () { return "#2a1a10"; }); cpBlob(p.x, p.y + bob, r, r * .5, function (dx, dy) { var d = dx * dx + dy * dy, an = Math.atan2(dy, dx); return d < .3 ? "#3a7ab0" : Math.floor((an + 3.2) / .8) % 2 ? "#ff8a3a" : "#fff8ec"; });
      var F = CP_FUR[s.c], hr = Math.max(1.5, r * .55); cpBlob(p.x, p.y + bob - hr * .8, hr + .7, hr + .7, function () { return "#2a1a10"; }); cpBlob(p.x, p.y + bob - hr * .8, hr, hr, function (dx, dy) { return dy > .2 ? F[1] : F[0]; });
      if (hr >= 2.5) { mR(cpc, Math.round(p.x - hr * .4), Math.round(p.y + bob - hr), 1, 1, "#1e120a"); mR(cpc, Math.round(p.x + hr * .4), Math.round(p.y + bob - hr), 1, 1, "#1e120a"); }
      if ((Math.floor(t / 400) + s.c) % 3 === 0) mR(cpc, Math.round(p.x + r), Math.round(p.y + bob - 1), 1, 1, "#ffffff"); }); }
  // ---- gulls that follow the ship ----
  function cpGulls(t, sky) { if (sky === "night" || sky === "fog" || sky === "storm") return; var n = cpLeg().s === "see" ? 3 : 6;
    for (var i = 0; i < n; i++) { var g = shipW(Math.sin(t / 2600 + i * 1.7) * (4 + i), 6 + i * 2.2 + Math.cos(t / 3100 + i) * 2, 4.2 + Math.sin(t / 900 + i) * .8), p = cpProj(g[0], g[1], g[2]); if (!p) continue;
      var x = Math.round(p.x), y = Math.round(p.y), f = Math.floor(t / 180 + i) % 2, wd = p.k > .9 ? 3 : 2; mR(cpc, x - wd, y - f, wd, 1, "#3a3a44"); mR(cpc, x + 1, y - f, wd, 1, "#3a3a44"); mR(cpc, x, y + (f ? 0 : -1), 1, 1, "#fff8ec"); if (p.k > .9) { mR(cpc, x - 1, y - 1 + (f ? 0 : 0), 1, 1, "#fff8ec"); } } }
  // ---- scenery models: the statue, the quarantine island ----
  function cpRing(r, n, sx) { var q = []; n = n || 12; for (var i = 0; i < n; i++) q.push([Math.cos(i / n * 6.283) * r * (sx || 1), Math.sin(i / n * 6.283) * r]); return q; }
  function cpBlobPoly(r, n, sd) { var p = []; for (var i = 0; i < n; i++) { var an = i / n * 6.283, rr = r * (.8 + cpHash(i + sd, 5) * .35); p.push([rr * Math.cos(an), rr * Math.sin(an)]); } return p; }
  function cpScenery(o, w, a, t, k) {
    var T = cpLoc(w[0], w[1], a);
    if (k === "statue") { var G = ["#7ac0a8", "#8ad0b8", "#5a9a84", "#2a4a40"], ST = ["#d8ccb0", "#e8dcc0", "#b0a488", "#5a5040"];
      cpPrism(w[0], w[1], a, cpBlobPoly(7, 12, 3), -.2, .8, ["#7a9a6a", "#8aaa7a", "#5a7a4a", "#2a3a20"]); cpPrism(w[0], w[1], a, cpRing(3.6, 11), .8, 2.0, CP_STONE);
      cpBox3(w[0], w[1], a, 2.6, 2.6, 2.0, 6.4, ST); cpBox3(w[0], w[1], a, 3.0, 3.0, 6.4, 6.8, ST);
      cpPrism(w[0], w[1], a, cpRing(1.0), 6.8, 10.6, G); cpPrism(w[0], w[1], a, cpRing(.8), 10.6, 11.3, G); cpPrism(w[0], w[1], a, cpRing(.5), 11.3, 12.2, G);
      for (var sp = 0; sp < 7; sp++) { var an = sp / 7 * 3.14 - 1.57 + 3.14; cpLine3(T.P(0, 0, 12.2), T.P(Math.cos(an) * .9, Math.sin(an) * .6, 12.9), "#5a9a84"); }
      cpLine3(T.P(.75, 0, 10.8), T.P(1.0, 0, 13.8), "#5a9a84"); cpLine3(T.P(.95, 0, 10.8), T.P(1.2, 0, 13.8), "#7ac0a8"); var tc = T.P(1.1, 0, 0); cpPrism(tc[0], tc[1], a, cpRing(.3, 8), 13.8, 14.3, G);
      var fl = cpProj.apply(null, T.P(1.1, 0, 14.5)); if (fl) { var fk = Math.floor(t / 150) % 2; mR(cpc, Math.round(fl.x) - 1, Math.round(fl.y) - 2 - fk, 3, 3, "#ffd34a"); mR(cpc, Math.round(fl.x), Math.round(fl.y) - 3 - fk, 1, 1, "#fff4b0"); }
      var tb = T.P(-.9, .3, 0); cpBox3(tb[0], tb[1], a, .35, .8, 9.0, 10.2, G); return; }
    if (k === "qisle") { cpPrism(w[0], w[1], a, cpBlobPoly(8, 12, 7), -.2, .7, ["#7a9a5a", "#8aaa6a", "#5a7a3a", "#2a3a1a"]);
      [[-2.5, -1, 4, 3], [2, 1.5, 3, 5], [-1, 3.5, 5, 2.5]].forEach(function (b, i) { var c = T.P(b[0], b[1], 0); cpBox3(c[0], c[1], a, b[2], b[3], .7, 2.2 + i * .3, ["#f0e8d8", "#f8f0e0", "#c8c0b0", "#5a5040"]); cpRoof(c[0], c[1], a, b[2] + .3, b[3] + .3, 2.2 + i * .3, 1.0, ["#a8442a", "#b8543a", "#86321e", "#40160c"], [0, "#f8f0e0", "#c8c0b0"]); });
      var fp = T.P(4, -3, 0); cpLine3([fp[0], fp[1], .7], [fp[0], fp[1], 4.2], "#5a3a22"); var fq = cpProj(fp[0], fp[1], 4.2); if (fq) { var fw = Math.floor(t / 300) % 2; mR(cpc, Math.round(fq.x) + 1, Math.round(fq.y), 4 - fw, 3, "#ffd34a"); }   /* the yellow quarantine flag */
      var pj = T.P(5.5, 0, 0); cpBox3(pj[0], pj[1], a, 3, .8, 0, .5, ["#8a6a44", "#9a7a52", "#6a5034", "#342414"]); return; }
    if (k === "shoal") return;
  }
  var _cpKind1 = cpKind; cpKind = function (o, w, a, t, k) { if (k === "statue" || k === "qisle") return cpScenery(o, w, a, t, k);
    if (k === "boat" && o.net) { var T = cpLoc(w[0], w[1], a), A = T.P(.1, -1.6, .4), B = T.P(-.8, -5.5, 0); cpLine3(A, B, "#6a5a44"); for (var i = 1; i < 7; i++) { var u = i / 7, p = cpProj(A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, 0); if (p) mR(cpc, Math.round(p.x), Math.round(p.y), 1, 1, "#ff8a3a"); } }
    return _cpKind1(o, w, a, t, k); };
  CP_3K.statue = 1; CP_3K.qisle = 1;
  // shallow water and sandbanks outside a buoyed channel
  function cpShoalDraw(o) { var AN = cp.anc[o.leg]; [[o.pts, "#5a9ac0"], [o.sand, "#d8c898"]].forEach(function (q) { if (q[0]) cpPolyW(q[0].map(function (p) { var w = cpW(AN, p[0], p[1]); return [w[0], w[1], .01]; }), q[1]); }); }
  // a ship's horizon backdrop drawn with more care: a harbour town on its hill, a skyline with setbacks
  var _cpBack0 = cpBack;
  cpBack = function (o, sky) {
    var dark = sky === "night", hz = CAMV.hz;
    if (o.k === "town") { var X = cpHzX(o.b);
      for (var hx = -26; hx <= 26; hx++) { var hh = Math.round(6 - Math.abs(hx) / 5 + Math.sin(hx * .4) * .8); if (hh > 0) mR(cpc, X + hx, hz - hh, 1, hh, dark ? "#1a2a2a" : (hx & 2) ? "#6a9a5a" : "#5e8e50"); }
      for (var i = -16; i < 16; i += 4) { var bh = 3 + Math.floor(cpHash(i + 40, 7) * 3), bx = X + i, c = ["#e8d8b0", "#f0e8d8", "#d8b88a", "#c8a07a"][(i + 16) / 4 % 4];
        mR(cpc, bx - 1, hz - bh - 1, 5, bh + 1, "#3a2414"); mR(cpc, bx, hz - bh, 3, bh, c); mR(cpc, bx, hz - bh - 2, 3, 1, "#a8442a"); mR(cpc, bx + 1, hz - bh - 3, 1, 1, "#a8442a"); mR(cpc, bx - 1, hz - bh - 1, 5, 1, "#8a3a22");
        if (bh > 3) mR(cpc, bx + 1, hz - bh + 1, 1, 1, dark ? "#ffd34a" : "#4a5a6a"); }
      mR(cpc, X + 1, hz - 12, 3, 12, "#3a2414"); mR(cpc, X + 2, hz - 11, 1, 11, "#e8e0d0"); mR(cpc, X + 2, hz - 15, 1, 3, "#5a6a6a"); mR(cpc, X + 2, hz - 16, 1, 1, "#ffd34a");   // the church
      mR(cpc, X - 30, hz - 1, 60, 1, "#8a8478"); return; }
    if (o.k === "ny") { var X2 = cpHzX(o.b), wd = o.w;
      for (var j = -wd / 2; j < wd / 2; j += 5) { var th = 5 + Math.floor(cpHash(j + 99, 5) * (wd > 30 ? 18 : 8)), bw = 4, cc = dark ? "#2a3048" : ["#a8a094", "#c8bca8", "#8a8a94", "#b0a898"][(j + 300) % 4];
        mR(cpc, X2 + j - 1, hz - th - 1, bw + 2, th + 1, "#2a2a30"); mR(cpc, X2 + j, hz - th, bw, th, cc); if (th > 12) { mR(cpc, X2 + j, hz - th - 3, bw, 3, "#2a2a30"); mR(cpc, X2 + j + 1, hz - th - 3, bw - 2, 3, cc); mR(cpc, X2 + j + 1, hz - th - 6, 2, 3, "#2a2a30"); mR(cpc, X2 + j + 2, hz - th - 8, 1, 2, "#2a2a30"); }
        for (var wy = 2; wy < th - 1; wy += 2) for (var wx = 1; wx < bw - 1; wx += 2) if (cpHash(j * 7 + wx, wy) < (dark ? .45 : .7)) mR(cpc, X2 + j + wx, hz - th + wy, 1, 1, dark ? "#ffd34a" : "#5a6a7a"); }
      mR(cpc, X2 - wd / 2 - 4, hz - 1, wd + 8, 1, "#5a5a54"); return; }
    if (o.k === "statue") return;
    return _cpBack0(o, sky);
  };
  var _cpKind2 = cpKind; cpKind = function (o, w, a, t, k) {
    if (k === "ice" || k === "floe") { var T = cpLoc(w[0], w[1], a), IC = ["#ffffff", "#eef8ff", "#b0cce0", "#5a7a92"], R0 = k === "floe" ? 1.5 : o.big ? 3.8 : 1.9;
      cpPolyW(cpBlobPoly(R0 * 1.35, 10, 9).map(function (p) { var q = T.P(p[0], p[1], 0); return [q[0], q[1], .01]; }), "#6ab0c8");
      if (k === "floe") { cpPrism(w[0], w[1], a, cpBlobPoly(R0, 9, 3), -.05, .28, IC); return; }
      [[1, 0, 0, -.1, .4], [.82, .2, .15, .4, .9], [.6, -.25, .25, .9, 1.45], [.36, .35, -.1, 1.45, 2.1], [.17, .42, -.05, 2.1, 2.7]].forEach(function (L, i) { var c = T.P(L[1] * R0, L[2] * R0, 0); cpPrism(c[0], c[1], a + i * .4, cpBlobPoly(R0 * L[0], 9, i * 5 + 1), R0 * L[3], R0 * L[4], IC); });
      for (var cr = 0; cr < 4; cr++) { var an = cr * 1.4 + .3, p0 = T.P(Math.cos(an) * R0 * .95, Math.sin(an) * R0 * .95, R0 * .05), p1 = T.P(Math.cos(an) * R0 * .7, Math.sin(an) * R0 * .7, R0 * .85); if (cpSees([p0, p1, T.P(0, 0, R0 * .4)], [Math.cos(an), Math.sin(an), 0].map(function (v, j) { return j < 2 ? v : 0; }))) cpLine3(p0, p1, "#8ab0c8"); }
      return; }
    return _cpKind2(o, w, a, t, k); };
  var _cpKind4 = cpKind; cpKind = function (o, w, a, t, k) { if (k === "nyb") return cpNYB(o, w, a, t); return _cpKind4(o, w, a, t, k); };
  CP_3K.nyb = 1;
  // ===== superstructures with promenades, rails, wheelhouse windows, bridge wings, ventilators =====
  function cpHouse2(T, a, v0, v1, hw, z0, z1, o) {
    cpHouse(T, a, v0, v1, hw, z0, z1, o.prom ? 0 : o.win); var r = Math.min(hw, (v1 - v0) * .25);
    [-1, 1].forEach(function (s) { var n = T.N(s, 0), u = s * hw * 1.012; if (!cpSees([T.P(s * hw, v0, z0), T.P(s * hw, v1 - r, z1)], n)) return;
      if (o.prom) { cpPolyW([T.P(u, v0 + .25, z0 + .12), T.P(u, v1 - r - .1, z0 + .12), T.P(u, v1 - r - .1, z1 - .14), T.P(u, v0 + .25, z1 - .14)], "#3e4048");
        for (var v = v0 + .25; v <= v1 - r - .1; v += .42) cpLine3(T.P(u, v, z0 + .12), T.P(u, v, z1 - .14), "#f0ece0"); cpLine3(T.P(u, v0 + .25, z0 + .42), T.P(u, v1 - r - .1, z0 + .42), "#f0ece0"); }
      cpLine3(T.P(s * hw * 1.03, v0, z1 + .14), T.P(s * hw * 1.03, v1 - r, z1 + .14), "#f8f4ec"); });
    var sl = T.P(0, (v0 + v1) / 2 - .05, 0); cpPrism(sl[0], sl[1], a, cpRect(hw * 2.08, v1 - v0 + .1), z1, z1 + .05, ["#fbf8f0", "#f4f0e6", "#9a968c", "#6a665c"]);
    if (o.wh) { var n2 = T.N(0, 1); if (cpSees([T.P(-hw, v1, z0), T.P(hw, v1, z1)], n2)) { cpPolyW([T.P(-hw * .62, v1 - r * .3 + .01, z1 - .34), T.P(hw * .62, v1 - r * .3 + .01, z1 - .34), T.P(hw * .62, v1 - r * .3 + .01, z1 - .12), T.P(-hw * .62, v1 - r * .3 + .01, z1 - .12)], "#2a3a4a"); }
      var wg = T.P(0, v1 - r - .1, 0); cpPrism(wg[0], wg[1], a, cpRect(hw * 2 + 1.2, .35), z1 - .06, z1, CP_WHITE); }
  }
  function cpVent(T, a, u, v, z) { var b = T.P(u, v, 0); cpPrism(b[0], b[1], a, cpRing(.11, 8), z, z + .38, CP_WHITE); var h = T.P(u, v + .07, 0); cpPrism(h[0], h[1], a, cpRing(.17, 8), z + .38, z + .55, ["#d8463c", "#e8584a", "#9a2a22", "#3a1008"]); }
  var _cpShip3b = cpShip3;
  cpShip3 = function (w, a, t, o) {
    var T = cpLoc(w[0], w[1], a), big = !!o.big, s = big ? 1.5 : 1, H = { ls: 7 * s, lb: 7.4 * s, hw: big ? 1.7 : 1.35, zd: 1.5, sb: .55, ss: .25, zw: -.15, boot: .28, gold: .18, port: [.42, [.98, .68]], n: 30, rail: "#d8d0c0" };
    cpHull(T, H, t);
    cpHouse2(T, a, -4.6 * s, 3.2 * s, H.hw * .8, 1.5, 2.2, { prom: 1 }); cpHouse2(T, a, -3.8 * s, 2.0 * s, H.hw * .7, 2.2, 2.8, { win: .45 }); cpHouse2(T, a, .9 * s, 2.3 * s, H.hw * .5, 2.8, 3.3, { win: .32, wh: 1 });
    [-1, 1].forEach(function (sd) { for (var bv = -3.4 * s; bv < 1.0 * s; bv += 1.25) cpBoat(T, a, sd * H.hw * .68, bv, 2.85); });
    [[-.35, -3.0], [.35, -3.0], [-.4, -1.0], [.4, -1.0], [0, -4.2]].forEach(function (p) { cpVent(T, a, p[0], p[1] * s, 2.85); });
    var fn = big ? [-3.6, -1.4, .8, 3.0] : [-2.2, .4], mum = !big;
    fn.forEach(function (v, i) { var vv = v * s * (big ? .75 : 1); cpFunnel(T, a, vv, 2.85, big ? 5.4 : 5.0, .42, .35, mum ? ["#26262e", "#3a3a44", "#1a1a20", "#0a0a0e"] : ["#e8a03a", "#f0b04a", "#c8862a", "#5a3a10"], mum ? ["#f8f4ec", "#ffffff", "#d8d0c0", "#6a6a6a"] : null, !big || i < 3 ? t : null);
      if (mum) { var c = T.P(0, vv - .35, 0); cpPrism(c[0], c[1], a, cpOct(1).map(function (p) { return [p[0] * .34, p[1] * .42]; }), 4.62, 5.0, ["#26262e", "#3a3a44", "#1a1a20", "#0a0a0e"]); }
      cpLine3(T.P(0, vv + .5, 2.85), T.P(0, vv + .2, (big ? 5.4 : 5.0) - .1), "#8a8478"); var wp = cpProj.apply(null, T.P(0, vv + .22, (big ? 5.4 : 5.0) - .3)); if (wp && wp.k > .4) mR(cpc, Math.round(wp.x), Math.round(wp.y), 1, 1, "#e8c050"); });
    var m1 = T.P(0, 6.0 * s, 1.9), m1t = T.P(0, 5.6 * s, 7.6), m2 = T.P(0, -5.8 * s, 1.7), m2t = T.P(0, -6.2 * s, 7.2);
    cpLine3(m1, m1t, "#5a3a22"); cpLine3(m2, m2t, "#5a3a22"); cpLine3(T.P(-.7, 5.65 * s, 6.6), T.P(.7, 5.65 * s, 6.6), "#5a3a22"); cpLine3(T.P(-.7, -6.15 * s, 6.2), T.P(.7, -6.15 * s, 6.2), "#5a3a22");
    var nest = T.P(0, 5.75 * s, 0); cpPrism(nest[0], nest[1], a, cpRing(.22, 8), 5.6, 5.95, ["#8a5a32", "#a87448", "#5a3a22", "#2a1a10"]);
    cpLine3(m1t, m2t, "#b8b0a0"); cpLine3(m1t, T.P(0, 7.4 * s, cpZD(H, 7.4 * s)), "#b8b0a0"); cpLine3(m2t, T.P(0, -7 * s, cpZD(H, -7 * s)), "#b8b0a0");
    [-1, 1].forEach(function (sd) { cpLine3(m1t, T.P(sd * H.hw, 5.0 * s, cpZD(H, 5 * s)), "#a8a090"); cpLine3(m2t, T.P(sd * H.hw, -5.2 * s, cpZD(H, -5.2 * s)), "#a8a090"); });
    var fl = cpProj.apply(null, m2t); if (fl) { var fw = Math.floor(t / 300) % 2; mR(cpc, Math.round(fl.x) + 1, Math.round(fl.y), 4 - fw, 3, "#2a4a8a"); mR(cpc, Math.round(fl.x) + 1, Math.round(fl.y), 2, 1, "#d8463c"); }
    if (o.ropes && !o.snapped) { var AN = cp.anc[o.leg], b1 = cpW(AN, -8.75, 31), b2 = cpW(AN, -8.75, 12); cpRope3(T.P(-H.hw, 6.2, 1.9), [b1[0], b1[1], 1.5], .3, "#e0d0a8"); cpRope3(T.P(-H.hw, -6.4, 1.7), [b2[0], b2[1], 1.5], .3, "#e0d0a8"); }
  };
  // ===== Pier 59 in detail: deck on pilings, granite headhouse with arches and flags, a long shed with a clerestory, lamps, rail, gangway =====
  var _cpKind5 = cpKind;
  cpKind = function (o, w, a, t, k) {
    if (k !== "pier") return _cpKind5(o, w, a, t, k);
    var T = cpLoc(w[0], w[1], a), dark = cpSky() === "night", GR = ["#e0b4a0", "#e8c4b0", "#b08470", "#5a3a30"], ST = CP_STONE;
    cpPolyW([T.P(-15, -.3, .01), T.P(15, -.3, .01), T.P(15, 10, .01), T.P(-15, 10, .01)], "#1e3a52");                     // the shade under the deck
    for (var px = -14.5; px <= 14.5; px += 1.2) { var pp = T.P(px, .1, 0); cpBox3(pp[0], pp[1], a, .22, .22, -.1, .85, ["#4a3424", "#5a4030", "#2a1c12", "#140a04"]); }   // pilings
    var dk = T.P(0, 5, 0); cpBox3(dk[0], dk[1], a, 30, 10, .85, 1.2, ["#9a8a74", "#a89880", "#6a5a48", "#2a2018"]);
    for (var fx = -14; fx <= 14; fx += 2.4) { var fp = cpProj.apply(null, T.P(fx, -.03, .7)); if (fp) { var r = Math.max(1, Math.round(fp.k * 3)); cpBlob(fp.x, fp.y, r, r * 1.2, function (dx) { return dx < 0 ? "#3a3a40" : "#1e1e24"; }); } }
    for (var rx = -14.6; rx <= 14.6; rx += .6) cpLine3(T.P(rx, .2, 1.2), T.P(rx, .2, 1.55), "#f0ece0"); cpLine3(T.P(-14.6, .2, 1.55), T.P(14.6, .2, 1.55), "#f8f4ec");   // rail along the edge
    for (var cx2 = -13; cx2 <= 13; cx2 += .7) { var hv = cpHash(Math.round(cx2 * 10), 77); if (hv > .78) continue; var hp = T.P(cx2, .8 + cpHash(Math.round(cx2 * 10), 5) * 1.8, 0); cpHam(hp[0], hp[1], 1.2, Math.floor(hv * 1000), t); }
    [-11, -5, 5, 11].forEach(function (lx) { var lb = T.P(lx, .6, 0); cpLine3([lb[0], lb[1], 1.2], [lb[0], lb[1], 2.6], "#2e2e34"); var lp = cpProj(lb[0], lb[1], 2.65); if (lp) { mR(cpc, Math.round(lp.x) - 1, Math.round(lp.y) - 1, 3, 2, dark ? "#ffe08a" : "#f0e8c8"); if (dark) { mR(cpc, Math.round(lp.x) - 2, Math.round(lp.y) - 2, 5, 1, "#a88a40"); } } });
    var gw = T.P(1.5, -.8, 0); cpPrism(gw[0], gw[1], a + .05, [[-.5, -1.4], [.5, -1.4], [.5, .8], [-.5, .8]], 1.15, 1.25, ["#c8a07a", "#d8b08a", "#8a6a44", "#3a2a1a"]); cpLine3(T.P(1.0, -2.2, 1.4), T.P(1.0, 0, 1.55), "#f0ece0"); cpLine3(T.P(2.0, -2.2, 1.4), T.P(2.0, 0, 1.55), "#f0ece0");   // gangway
    // the long shed behind with a raised clerestory
    var sh = T.P(0, 12, 0); cpBox3(sh[0], sh[1], a, 22, 10, 1.2, 3.0, ["#b8a888", "#c8b898", "#8a7a60", "#3a3020"]); var cl = T.P(0, 12, 0); cpBox3(cl[0], cl[1], a, 6, 10, 3.0, 3.6, ["#c8b898", "#d8c8a8", "#9a8a70", "#3a3020"]);
    for (var cw = -2.6; cw <= 2.6; cw += .65) { var cp2 = cpProj.apply(null, T.P(cw, 6.98, 3.3)); if (cp2) mR(cpc, Math.round(cp2.x), Math.round(cp2.y), 1, 1, dark ? "#ffd34a" : "#3a4a5a"); }
    // the granite headhouse facing the river: arched bays, a cornice, a green name board, flags on top
    var hh = T.P(0, 7.5, 0); cpBox3(hh[0], hh[1], a, 20, 3, 1.2, 4.0, GR); cpBox3(hh[0], hh[1], a, 20.6, 3.4, 4.0, 4.25, ["#f0d8c8", "#f8e4d4", "#c8a898", "#6a4a40"]);
    var n3 = T.N(0, -1), fv = 7.5 - 1.52; if (cpSees([T.P(-10, fv, 1.2), T.P(10, fv, 4)], n3)) {
      for (var bxa = -8.5; bxa <= 8.5; bxa += 1.9) { if (Math.abs(bxa) < 1) continue; var ap = cpProj.apply(null, T.P(bxa, fv - .02, 2.6)); if (!ap) continue; var aw = ap.k * 16 * .55, ah = ap.k * 16 * 1.0;
        cpBlob(ap.x, ap.y - ah * .35, aw, aw, function (dx, dy) { return dy < 0 ? (dark ? "#ffd34a" : "#3a3440") : null; }); mR(cpc, Math.round(ap.x - aw), Math.round(ap.y - ah * .35), Math.round(aw * 2), Math.round(ah * .9), dark ? "#e8b040" : "#3a3440"); if (ap.k > .5) mR(cpc, Math.round(ap.x), Math.round(ap.y - ah * .9), 1, Math.round(ah * 1.4), "#c8a898"); }
      var dp = cpProj.apply(null, T.P(0, fv - .02, 2.0)); if (dp) { var dw = dp.k * 16 * 1.0, dh = dp.k * 16 * 1.6; cpBlob(dp.x, dp.y - dh * .55, dw, dw, function (dx, dy) { return dy < 0 ? "#2a1e1a" : null; }); mR(cpc, Math.round(dp.x - dw), Math.round(dp.y - dh * .55), Math.round(dw * 2), Math.round(dh * .95), "#2a1e1a"); }
      cpPolyW([T.P(-3.5, fv - .03, 3.4), T.P(3.5, fv - .03, 3.4), T.P(3.5, fv - .03, 3.9), T.P(-3.5, fv - .03, 3.9)], "#2e5a3a"); for (var gl = -3.1; gl <= 3.1; gl += .5) { var gp = cpProj.apply(null, T.P(gl, fv - .04, 3.65)); if (gp) mR(cpc, Math.round(gp.x), Math.round(gp.y), 1, 1, "#e8c050"); } }
    [-9, 0, 9].forEach(function (fx2, i) { var fb = T.P(fx2, 7, 0); cpLine3([fb[0], fb[1], 4.25], [fb[0], fb[1], 6.2], "#3a3a3a"); var fq = cpProj(fb[0], fb[1], 6.2); if (fq) { var fw2 = Math.floor(t / 300 + i) % 2, wd = Math.max(4, Math.round(fq.k * 16 * .9));
        for (var st = 0; st < 5; st++) mR(cpc, Math.round(fq.x) + 1, Math.round(fq.y) + st, wd - (st % 2) * fw2, 1, st % 2 ? "#f8f4ec" : "#c8342a"); mR(cpc, Math.round(fq.x) + 1, Math.round(fq.y), Math.ceil(wd / 2), 3, "#2a3a7a"); } });
  };
  // ===== wheelhouse variants (style study): 1 Teak & Messing, 2 Weiße Brücke, 3 Hamster-Kajüte, 4 Mahagoni =====
  var CP_BV = 4, cpFrames = {};
  var CP_BVP = {
    1: { w: ["#b07a44", "#94643a", "#74482a", "#4a2e1a"], br: ["#f6dc84", "#d8aa48", "#a87a2a", "#5a3a12"], wh: ["#e0b07a", "#c8945a", "#8a5a32"], ol: "#2a1a10" },
    2: { w: ["#c08a52", "#a87444", "#7a5030", "#4a2e1a"], br: ["#f6dc84", "#d8aa48", "#a87a2a", "#5a3a12"], wh: ["#d8a46a", "#b8844c", "#7a5030"], ol: "#2a1a10", paint: ["#fbf6ea", "#ece4d2", "#d4c8b0"] },
    3: { w: ["#e0aa62", "#c88c4a", "#a06a34", "#6a4422"], br: ["#fbe08a", "#e0b450", "#b0822e", "#6a4416"], wh: ["#f0c080", "#d8a060", "#a06a34"], ol: "#3a2210" },
    4: { w: ["#9a4a32", "#7a3424", "#5a2418", "#341208"], br: ["#f6dc84", "#d8aa48", "#a87a2a", "#5a3a12"], wh: ["#b0603e", "#8a4430", "#5a2418"], ol: "#1e0c06" } };
  var CP_WIN = [[6, 52], [64, 52], [122, 52]];
  function cpFrameV(v) {
    if (cpFrames[v]) return cpFrames[v]; var cv = document.createElement("canvas"); cv.width = 180; cv.height = 135; var g = cv.getContext("2d"), P = CP_BVP[v], W = P.w, B = P.br;
    var R = function (x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); };
    var panel = function (x, y, w, h, c) { R(x, y, w, h, c[2]); R(x + 1, y + 1, w - 2, h - 2, c[1]); R(x + 1, y + 1, w - 2, 1, c[0]); R(x + 1, y + 1, 1, h - 2, c[0]); R(x + 2, y + h - 2, w - 3, 1, c[3] || c[2]); R(x + w - 2, y + 2, 1, h - 3, c[3] || c[2]); };
    var boards = function (x0, y0, x1, y1, bw, c) { for (var x = x0; x < x1; x++) { var k = Math.floor((x - x0) / bw), e = (x - x0) % bw; R(x, y0, 1, y1 - y0, e === 0 ? c[3] : e === 1 ? c[0] : (k % 3 === 1 ? c[2] : c[1])); } for (var y = y0 + 3; y < y1; y += 9) for (var xx = x0; xx < x1; xx += bw) if (((y + xx) / bw | 0) % 4 === 0) R(xx + 2, y, 1, 1, c[2]); };
    var rivets = function (x0, x1, y) { for (var x = x0; x < x1; x += 5) { R(x, y, 1, 1, B[0]); R(x + 1, y + 1, 1, 1, B[3]); } };
    var bell = function (x, y) { R(x + 3, y, 2, 2, P.ol); R(x + 2, y + 2, 4, 1, B[2]); R(x + 1, y + 3, 6, 4, B[1]); R(x + 1, y + 3, 2, 4, B[0]); R(x, y + 7, 8, 2, B[2]); R(x, y + 7, 8, 1, B[1]); R(x + 3, y + 9, 2, 1, P.ol); };
    var cap = function (x, y) { R(x, y + 3, 14, 3, "#1e2440"); R(x + 2, y, 10, 4, "#262e52"); R(x + 2, y, 10, 1, "#3a4470"); R(x - 1, y + 5, 16, 2, "#141830"); R(x + 5, y + 2, 4, 2, B[0]); R(x + 6, y + 2, 2, 1, "#ffffff"); };
    var seeds = function (x, y) { R(x, y + 2, 12, 6, P.ol); R(x + 1, y + 3, 10, 4, "#e8e0d0"); R(x + 1, y + 3, 10, 1, "#ffffff"); for (var i = 0; i < 6; i++) { R(x + 1 + i * 2, y + 1 + (i % 2), 2, 2, i % 2 ? "#4a3a2a" : "#6a5a44"); R(x + 1 + i * 2, y + 1 + (i % 2), 1, 1, "#d8c8a8"); } };
    var flower = function (x, y) { R(x + 5, y + 10, 1, 9, "#4a8a3a"); R(x + 2, y + 13, 3, 2, "#5aa04a"); R(x + 6, y + 15, 3, 2, "#5aa04a"); for (var a = 0; a < 8; a++) { var dx = Math.round(Math.cos(a * .785) * 4), dy = Math.round(Math.sin(a * .785) * 4); R(x + 4 + dx, y + 4 + dy, 3, 3, a % 2 ? "#ffd34a" : "#f6b82a"); } R(x + 3, y + 3, 5, 5, "#6a3a1a"); R(x + 4, y + 4, 2, 2, "#8a5a2a"); R(x + 1, y + 19, 10, 6, "#b85a3a"); R(x + 1, y + 19, 10, 1, "#d8744a"); R(x + 2, y + 25, 8, 1, "#8a3a22"); };
    // ---- the wall around the windows ----
    if (v === 2) { R(0, 0, 180, 80, P.paint[0]); for (var x = 0; x < 180; x += 29) R(x, 0, 1, 80, P.paint[2]); R(0, 0, 180, 3, P.paint[2]); R(0, 3, 180, 1, P.paint[1]); }
    else boards(0, 0, 180, 80, v === 3 ? 5 : 6, W);
    R(0, 0, 180, 4, v === 2 ? P.paint[1] : W[3]); if (v !== 2) for (var bx = 2; bx < 180; bx += 30) { R(bx, 0, 6, 4, "#f0ece0"); R(bx, 3, 6, 1, "#c8c0b0"); }   // ceiling beams, painted white
    CP_WIN.forEach(function (w, i) { var x = w[0], ww = w[1];
      if (v === 3) { g.save(); g.beginPath(); g.rect(x, 12, ww, 64); g.rect(x + 6, 5, ww - 12, 8); g.rect(x + 2, 7, ww - 4, 6); g.clip(); g.clearRect(0, 0, 180, 135); g.restore();   // a softly rounded top
        R(x - 2, 10, 2, 67, P.ol); R(x + ww, 10, 2, 67, P.ol); R(x, 4, ww, 1, P.ol); R(x + 2, 5, 4, 2, P.ol); R(x + ww - 6, 5, 4, 2, P.ol); R(x, 7, 2, 3, P.ol); R(x + ww - 2, 7, 2, 3, P.ol); R(x - 2, 75, ww + 4, 2, P.ol);
        R(x - 1, 11, 1, 64, B[1]); R(x + 6, 5, ww - 12, 1, B[0]); R(x + 2, 7, 4, 1, B[0]); R(x + ww - 6, 7, 4, 1, B[0]);
        R(x + ww / 2 - 1, 5, 2, 70, W[2]); R(x + ww / 2 - 1, 5, 1, 70, W[0]); R(x, 30, ww, 2, W[2]); R(x, 30, ww, 1, W[0]); return; }
      g.clearRect(x, 5, ww, 70); R(x - 2, 3, ww + 4, 2, P.ol); R(x - 2, 75, ww + 4, 2, P.ol); R(x - 2, 3, 2, 74, P.ol); R(x + ww, 3, 2, 74, P.ol);
      R(x - 1, 4, ww + 2, 1, B[1]); R(x - 1, 4, 1, 72, B[1]); R(x, 4, ww, 1, B[0]); R(x + ww, 4, 1, 72, B[2]);
      if (v === 1) { R(x, 20, ww, 2, W[2]); R(x, 20, ww, 1, W[0]); for (var m = 1; m < 3; m++) { var mx = x + Math.round(ww * m / 3); R(mx - 1, 5, 2, 15, W[2]); R(mx - 1, 5, 1, 15, W[0]); } R(x + ww / 2 - 1, 22, 2, 53, W[2]); R(x + ww / 2 - 1, 22, 1, 53, W[0]); }
      if (v === 2) { R(x + ww / 2 - 1, 5, 2, 70, P.paint[2]); R(x + ww / 2 - 1, 5, 1, 70, "#ffffff"); R(x, 40, ww, 1, P.paint[2]); }
      if (v === 4) { R(x, 5, 2, 2, P.ol); R(x + ww - 2, 5, 2, 2, P.ol); R(x, 73, 2, 2, P.ol); R(x + ww - 2, 73, 2, 2, P.ol); rivets(x + 3, x + ww - 2, 2); rivets(x + 3, x + ww - 2, 78); }
    });
    // pillars between the windows: a brass plate or a lamp
    [[58, 64], [116, 122]].forEach(function (p) { var x = p[0], w = p[1] - p[0];
      if (v === 1) { R(x + 1, 24, w - 2, 30, W[2]); R(x + 2, 25, w - 4, 28, W[0]); R(x + 2, 36, w - 4, 4, B[1]); R(x + 2, 36, w - 4, 1, B[0]); }
      if (v === 2) { R(x + 1, 30, w - 2, 10, B[2]); R(x + 2, 31, w - 4, 7, B[1]); R(x + 2, 31, w - 4, 2, "#fff4b0"); }
      if (v === 3) { R(x + 1, 40, w - 2, 9, "#3a5a8a"); R(x + 2, 41, w - 4, 3, "#c8463c"); R(x + 2, 44, w - 4, 3, "#f8f4ec"); }
      if (v === 4) { R(x, 20, w, 3, B[2]); R(x + 1, 23, w - 2, 7, "#3a6a3a"); R(x + 1, 23, w - 2, 2, "#6aa05a"); R(x + 2, 30, w - 4, 2, "#fff0a0"); } });
    // the sill and the console below
    R(0, 76, 180, 2, P.ol); R(0, 78, 180, 6, v === 2 ? W[1] : W[1]); R(0, 78, 180, 1, W[0]); R(0, 83, 180, 1, W[3]); if (v !== 3) { R(0, 79, 180, 1, B[1]); }
    if (v === 2) { R(0, 84, 180, 51, P.paint[1]); for (var px2 = 2; px2 < 180; px2 += 30) panel(px2, 88, 26, 24, [P.paint[0], P.paint[1], P.paint[2], P.paint[2]]); R(0, 116, 180, 3, W[2]); R(0, 116, 180, 1, W[0]); for (var cy = 119; cy < 135; cy++) for (var cx = 0; cx < 180; cx += 4) R(cx + ((cy >> 2) % 2) * 2, cy, 2, 1, (cy >> 2) % 2 ? "#2a2a30" : "#e8e4dc"); }
    else { R(0, 84, 180, 51, W[2]); for (var px3 = 1; px3 < 180; px3 += 30) panel(px3, 87, 28, 21, W); for (var px4 = 1; px4 < 180; px4 += 30) panel(px4, 111, 28, 24, W); }
    // pedestals: telegraph column, binnacle
    R(24, 112, 12, 23, P.ol); R(25, 112, 10, 23, B[1]); R(25, 112, 3, 23, B[0]); R(32, 112, 2, 23, B[2]); R(22, 131, 16, 4, B[2]); R(22, 131, 16, 1, B[1]);
    R(138, 114, 18, 21, P.ol); R(139, 114, 16, 21, v === 4 ? W[1] : v === 2 ? P.paint[0] : W[1]); R(139, 114, 3, 21, W[0]); R(136, 131, 22, 4, B[2]); R(136, 131, 22, 1, B[1]);
    [133, 158].forEach(function (bx2) { g.fillStyle = P.ol; g.beginPath(); g.arc(bx2, 108, 4, 0, 7); g.fill(); R(bx2 - 3, 106, 6, 5, v === 3 ? "#c8463c" : "#3a5a3a"); R(bx2 - 2, 106, 2, 2, v === 3 ? "#e8745a" : "#5a8a5a"); });   // the iron correcting balls
    // decoration per style
    if (v === 1) { bell(6, 5); cap(122, 70); seeds(44, 70); for (var vp = 0; vp < 2; vp++) { var vx = 6 + vp * 7; R(vx, 88, 3, 22, B[2]); R(vx, 88, 1, 22, B[0]); R(vx - 1, 86, 5, 3, B[1]); R(vx - 1, 86, 5, 1, B[0]); } }
    if (v === 2) { bell(6, 5); cap(122, 70); R(155, 86, 22, 10, W[1]); R(155, 86, 22, 1, W[0]); R(157, 88, 18, 6, "#e8dcb8"); R(160, 90, 8, 1, "#6a8aa8"); R(162, 91, 1, 2, "#c8463c"); }
    if (v === 3) { for (var fx = 0; fx < 180; fx += 8) { var fy = 6 + Math.round(Math.sin(fx / 180 * Math.PI) * 4); R(fx, fy, 8, 1, "#5a3a22"); R(fx + 2, fy + 1, 4, 4, ["#d8463c", "#ffd34a", "#3a7ac8", "#4a9a3a", "#f8f4ec"][(fx / 8) % 5]); R(fx + 3, fy + 5, 2, 1, ["#d8463c", "#ffd34a", "#3a7ac8", "#4a9a3a", "#f8f4ec"][(fx / 8) % 5]); }
      flower(146, 52); seeds(40, 70); cap(120, 70); R(64, 86, 52, 1, B[2]); R(70, 88, 40, 7, B[1]); R(70, 88, 40, 1, B[0]); for (var lx = 0; lx < 9; lx++) R(73 + lx * 4, 90, 2, 3, B[3]); }
    if (v === 4) { R(80, 0, 1, 7, P.ol); R(76, 7, 9, 2, B[2]); R(77, 9, 7, 5, "#fff0a0"); R(77, 9, 2, 5, "#ffffff"); R(76, 14, 9, 2, B[2]);   // the hanging oil lamp
      R(150, 84, 28, 2, W[3]); R(151, 86, 26, 9, "#e8dcb8"); R(151, 86, 26, 1, "#fff4d8"); R(155, 88, 10, 1, "#6a8aa8"); R(158, 89, 1, 4, "#6a8aa8"); R(168, 90, 4, 1, "#c8463c"); cap(122, 70); bell(6, 5); }
    cpFrames[v] = cv; return cv;
  }
  // ---- interior variants on the Mahagoni theme: 5 fein schattiert, 6 mit Tiefe, 7 Rundbrücke ----
  CP_BVP[5] = CP_BVP[4]; CP_BVP[6] = CP_BVP[4]; CP_BVP[7] = CP_BVP[4];
  var _cpFrameV0 = cpFrameV;
  cpFrameV = function (v) {
    if (v < 5) return _cpFrameV0(v); if (cpFrames[v]) return cpFrames[v];
    var base = _cpFrameV0(4), cv = document.createElement("canvas"); cv.width = 180; cv.height = 135; var g = cv.getContext("2d"), P = CP_BVP[4], W = P.w, B = P.br; g.drawImage(base, 0, 0);
    var R = function (x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }, M = cpMix;
    var bevel = function (x, y, w, h) { R(x, y, w, h, W[1]); for (var i = 0; i < 2; i++) { R(x + i, y + i, w - i * 2, 1, M(W[0], "#ffffff", .15 - i * .08)); R(x + i, y + i, 1, h - i * 2, M(W[0], W[1], i * .5)); R(x + i, y + h - 1 - i, w - i * 2, 1, M(W[3], W[2], i * .5)); R(x + w - 1 - i, y + i, 1, h - i * 2, M(W[3], W[2], i * .5)); }
      R(x + 3, y + 3, w - 6, h - 6, M(W[1], W[2], .35)); for (var gx = x + 4; gx < x + w - 4; gx += 3) R(gx, y + 3, 1, h - 6, M(W[1], W[2], .55 + ((gx * 7) % 3) * .08)); R(x + 3, y + 3, w - 6, 1, M(W[2], W[3], .5)); R(x + 3, y + 3, 1, h - 6, M(W[2], W[3], .5)); };
    var reveal = function (x, ww, y0, y1) { for (var i = 0; i < 3; i++) { R(x + i, y0, 1, y1 - y0, M(W[0], W[1], i * .35)); R(x + ww - 1 - i, y0, 1, y1 - y0, M(W[3], W[2], i * .35)); R(x, y0 + i, ww, 1, M(W[3], W[2], i * .3)); } R(x, y1 - 1, ww, 1, M(W[0], "#ffffff", .2)); };
    if (v === 5) {                                                        // finely shaded: bevelled panels, window reveals, coffered ceiling, glowing sconces
      for (var px = 1; px < 180; px += 30) { bevel(px, 87, 28, 21); bevel(px, 111, 28, 24); }
      CP_WIN.forEach(function (w) { reveal(w[0], w[1], 5, 75); });
      for (var bx = 0; bx < 180; bx += 15) { R(bx, 0, 15, 4, M(W[3], W[2], .3)); R(bx + 1, 1, 13, 2, M(W[2], W[1], .4)); R(bx + 1, 1, 13, 1, M(W[1], W[0], .5)); }
      [[61, 18], [119, 18]].forEach(function (s) { R(s[0] - 2, s[1] + 6, 4, 2, B[2]); R(s[0] - 1, s[1], 2, 6, "#fff4b0"); R(s[0] - 1, s[1], 1, 6, "#ffffff"); R(s[0] - 2, s[1] - 1, 4, 1, B[1]); for (var r = 1; r < 6; r++) { g.fillStyle = "rgba(255,230,150," + (0.12 - r * .02) + ")"; g.fillRect(s[0] - 2 - r, s[1] - r, 4 + r * 2, 8 + r * 2); } });
      R(0, 78, 180, 1, B[0]); R(0, 82, 180, 1, B[2]); }
    if (v === 6) {                                                        // with depth: the console top recedes, beams and floor run to the horizon
      var VX = 90, VY = -60;
      for (var y = 78; y < 92; y++) { var f = (y - 78) / 14, inset = Math.round((1 - f) * 6); R(0, y, 180, 1, M(W[0], W[1], f * .8)); R(0, y, inset, 1, W[3]); R(180 - inset, y, inset, 1, W[3]); }
      for (var lx = -40; lx <= 220; lx += 18) { for (var yy = 78; yy < 92; yy++) { var tt = (yy - VY) / (92 - VY), xx = Math.round(VX + (lx - VX) * tt); if (xx >= 0 && xx < 180) R(xx, yy, 1, 1, M(W[1], W[2], .5)); } }
      R(0, 92, 180, 2, W[3]); R(0, 91, 180, 1, B[1]);
      for (var px2 = 1; px2 < 180; px2 += 30) bevel(px2, 95, 28, 18);
      for (var fy = 116; fy < 135; fy++) { var ff = (fy - 116) / 19; R(0, fy, 180, 1, M("#3a2214", "#5a3a22", ff)); for (var k = -6; k <= 6; k++) { var x0 = Math.round(90 + k * (14 + ff * 22)); R(x0, fy, 1, 1, "#2a160c"); } }
      R(0, 115, 180, 1, B[2]);
      for (var bx2 = -60; bx2 <= 240; bx2 += 26) { var x1 = Math.round(VX + (bx2 - VX) * .55); g.fillStyle = W[3]; g.beginPath(); g.moveTo(bx2, 0); g.lineTo(bx2 + 4, 0); g.lineTo(x1 + 2, 4); g.lineTo(x1, 4); g.fill(); }
      CP_WIN.forEach(function (w) { reveal(w[0], w[1], 5, 75); }); }
    if (v === 7) {                                                        // a rounded bridge front: the side windows turn away, a brass handrail runs in front
      var cutRows = function (fn) { for (var y = 3; y < 78; y++) { var r = fn(y); if (r) g.clearRect(r[0], y, r[1] - r[0], 1); } };
      [[0, 60], [120, 180]].forEach(function (s) { R(s[0], 3, s[1] - s[0], 75, W[2]); for (var x = s[0]; x < s[1]; x++) if ((x - s[0]) % 6 === 0) R(x, 3, 1, 75, W[3]); });
      cutRows(function (y) { var a = 6 + Math.round((75 - y) * 0), t0 = 5 + (58 - 6) * 0; var top = function (x) { return 10 - (x - 6) / 52 * 5; }, bot = function (x) { return 70 + (x - 6) / 52 * 5; }; var xa = 6, xb = 58; for (; xa < xb && !(y >= top(xa) && y < bot(xa)); xa++); return xa < xb ? [xa, xb] : null; });
      cutRows(function (y) { var top = function (x) { return 5 + (x - 122) / 52 * 5; }, bot = function (x) { return 75 - (x - 122) / 52 * 5; }; var xb = 174, xa = 122; for (; xb > xa && !(y >= top(xb - 1) && y < bot(xb - 1)); xb--); return xb > xa ? [xa, xb] : null; });
      g.fillStyle = P.ol; for (var x2 = 4; x2 < 60; x2++) { var tY = Math.round(10 - (x2 - 6) / 52 * 5), bY = Math.round(70 + (x2 - 6) / 52 * 5); g.fillRect(x2, tY - 2, 1, 2); g.fillRect(x2, bY, 1, 2); g.fillStyle = B[1]; g.fillRect(x2, tY - 1, 1, 1); g.fillStyle = P.ol; }
      for (var x3 = 120; x3 < 176; x3++) { var tY2 = Math.round(5 + (x3 - 122) / 52 * 5), bY2 = Math.round(75 - (x3 - 122) / 52 * 5); g.fillStyle = P.ol; g.fillRect(x3, tY2 - 2, 1, 2); g.fillRect(x3, bY2, 1, 2); g.fillStyle = B[1]; g.fillRect(x3, tY2 - 1, 1, 1); }
      R(4, 9, 2, 64, P.ol); R(174, 9, 2, 64, P.ol); R(58, 3, 2, 74, P.ol); R(120, 3, 2, 74, P.ol);
      R(0, 66, 180, 2, B[1]); R(0, 66, 180, 1, B[0]); R(0, 68, 180, 1, B[3]); [20, 60, 90, 120, 160].forEach(function (bx3) { R(bx3, 68, 2, 9, B[2]); R(bx3, 68, 1, 9, B[0]); });
      for (var px3 = 1; px3 < 180; px3 += 30) { bevel(px3, 87, 28, 21); bevel(px3, 111, 28, 24); } }
    R(24, 112, 12, 23, P.ol); R(25, 112, 10, 23, B[1]); R(25, 112, 3, 23, B[0]); R(32, 112, 2, 23, B[2]); R(22, 131, 16, 4, B[2]); R(22, 131, 16, 1, B[1]);   /* the pedestals stand in front */
    R(138, 114, 18, 21, P.ol); R(139, 114, 16, 21, W[1]); R(139, 114, 3, 21, W[0]); R(153, 114, 2, 21, W[2]); R(136, 131, 22, 4, B[2]); R(136, 131, 22, 1, B[1]);
    [133, 158].forEach(function (bx2) { g.fillStyle = P.ol; g.beginPath(); g.arc(bx2, 108, 4, 0, 7); g.fill(); R(bx2 - 3, 106, 6, 5, "#3a5a3a"); R(bx2 - 2, 106, 2, 2, "#5a8a5a"); });
    R(150, 84, 28, 2, W[3]); R(151, 86, 26, 9, "#e8dcb8"); R(151, 86, 26, 1, "#fff4d8"); R(155, 88, 10, 1, "#6a8aa8"); R(158, 89, 1, 4, "#6a8aa8"); R(168, 90, 4, 1, "#c8463c");
    cpFrames[v] = cv; return cv;
  };
  // ===== polish: smoother shading, an iceberg of facets, round logs, a 2.5D skyline, the Freiheitshamsterin, a detailed foredeck =====
  var cpMixC = {};
  function cpMix(a, b, t) { var k = a + b + t; if (cpMixC[k]) return cpMixC[k]; var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t), g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t), bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
    return (cpMixC[k] = "#" + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)); }
  cpShade = function (n, C) { if (n[2] > .7) return C[0]; var d = n[0] * .55 - n[1] * .45 + n[2] * .3, q = Math.max(0, Math.min(4, Math.round((d + .75) / 1.5 * 4))); return cpMix(C[2], C[1], q / 4); };   /* five steps from shade to light */
  var CP_ICE = ["#4a7a9a", "#7aa8c8", "#a8cce0", "#d4eaf6", "#eef8ff", "#ffffff"];
  function cpIceTone(n) { var d = n[0] * .5 - n[1] * .4 + n[2] * .75; return CP_ICE[Math.max(0, Math.min(5, Math.round((d + .3) / 1.4 * 5)))]; }
  function cpTriMesh(tris, toneFn) { var E = cpEye(); tris = tris.filter(function (q) { var a = q[0], b = q[1], c = q[2], ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2]; var n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx], L = Math.hypot(n[0], n[1], n[2]) || 1; q.n = [n[0] / L, n[1] / L, n[2] / L]; q.d = Math.hypot((a[0] + b[0] + c[0]) / 3 - E[0], (a[1] + b[1] + c[1]) / 3 - E[1], (a[2] + b[2] + c[2]) / 3 - E[2]); return cpSees(q, q.n); });
    tris.sort(function (p, q) { return q.d - p.d; }).forEach(function (q) { cpPolyW(q, toneFn(q.n)); }); }
  function cpIceberg(T, R0, H, sd, t, rock) {                                  // a dome of facets with jagged peaks; triangles counter-clockwise seen from outside
    var NR = 4, NS = 15, V = [];
    for (var i = 0; i <= NR; i++) { V.push([]); for (var j = 0; j < NS; j++) { var th = j / NS * 6.283, fr = i / NR, nz = cpHash(i * 31 + sd, j * 17 + sd), rr = R0 * fr * (.82 + .32 * cpHash(j + sd, 4)), zz = i === NR ? -.05 : H * Math.pow(1 - fr, .7) * (.5 + .9 * nz) * ((j + sd) % 6 === 2 && i <= 2 ? 1.6 : (j + sd) % 7 === 4 && i === 2 ? 1.4 : 1) * (i === 0 ? .9 : 1);
        V[i].push(T.P(rr * Math.cos(th) + (i === 1 ? R0 * .12 * Math.cos(sd) : 0), rr * Math.sin(th), Math.max(-.05, zz))); } }
    var tris = [];
    for (var a = 0; a < NR; a++) for (var b = 0; b < NS; b++) { var b1 = (b + 1) % NS, p = V[a][b], q = V[a][b1], r = V[a + 1][b], s = V[a + 1][b1]; tris.push([p, s, q]); tris.push([p, r, s]); }
    cpPolyW(V[NR].map(function (p) { return [p[0] + (p[0] - T.P(0, 0, 0)[0]) * .25, p[1] + (p[1] - T.P(0, 0, 0)[1]) * .25, .01]; }), rock ? "#4a8ab0" : "#6ab0c8");
    cpTriMesh(tris, rock ? function (n) { var d = n[0] * .5 - n[1] * .4 + n[2] * .75, R = ["#3a3a36", "#5a5a52", "#7a786c", "#98968a", "#b0ae9e", "#c8c4b0"]; return R[Math.max(0, Math.min(5, Math.round((d + .3) / 1.4 * 5)))]; } : cpIceTone);
    var ring = V[NR].map(function (p) { return [p[0], p[1], .06]; }); for (var k = 0; k < NS; k++) if ((k + Math.floor(t / 600)) % 3) cpLine3(ring[k], ring[(k + 1) % NS], "#ffffff");
  }
  function cpLogM(T, len, r, t) {                                         // a round log lying in the water, bark and a pale cut end
    var N = 8, Q = [], B = ["#8a5a32", "#6a4428", "#4a2e1a"];
    for (var i = 0; i < N; i++) { var a0 = i / N * 6.283, a1 = (i + 1) / N * 6.283, P = function (an, v) { return T.P(Math.cos(an) * r, v, .05 + Math.sin(an) * r); }; Q.push([P(a0, -len / 2), P(a1, -len / 2), P(a1, len / 2), P(a0, len / 2)]); }
    var E = cpEye(); Q.map(function (q, i) { var an = (i + .5) / N * 6.283, n = T.N(Math.cos(an), 0, Math.sin(an)); return { q: q, n: n }; }).filter(function (o) { return cpSees(o.q, o.n); }).forEach(function (o) { cpPolyW(o.q, cpShade(o.n, ["#b8844c", "#a87448", "#5a3a22"])); cpLine3(o.q[0], o.q[3], "#4a2e1a"); });
    [-1, 1].forEach(function (sg) { var cap = []; for (var i = 0; i < N; i++) { var an = i / N * 6.283; cap.push(T.P(Math.cos(an) * r, sg * len / 2, .05 + Math.sin(an) * r)); } if (cpSees(cap, T.N(0, sg))) { cpPolyW(cap, "#e0c088"); var c = cpProj.apply(null, T.P(0, sg * len / 2, .05)); if (c) mR(cpc, Math.round(c.x), Math.round(c.y), 1, 1, "#a8844c"); } });
    var st = T.P(r * .6, len * .15, .25); cpLine3(st, [st[0] + .3, st[1] + .4, .55], "#6a4428");
  }
  // the Freiheitshamsterin: a hamster in a long copper-green robe, torch high, on her star fort and pedestal
  function cpStatueH(o, w, a, t) {
    var T = cpLoc(w[0], w[1], a), G = ["#8ad0b8", "#7ac0a8", "#4a8a74", "#1e3a30"], ST = ["#e8dcc0", "#e0d4b8", "#a89c80", "#4a4434"], ring = function (r, n) { return cpRing(r, n || 14); };
    cpPrism(w[0], w[1], a, cpBlobPoly(7.5, 14, 3), -.2, .9, ["#7a9a6a", "#8aaa7a", "#4a6a3a", "#1e2a14"]);
    var star = []; for (var i = 0; i < 22; i++) { var rr = i % 2 ? 2.9 : 4.2; star.push([Math.cos(i / 22 * 6.283) * rr, Math.sin(i / 22 * 6.283) * rr]); } cpPrism(w[0], w[1], a, star, .9, 2.0, CP_STONE);
    cpBox3(w[0], w[1], a, 2.8, 2.8, 2.0, 5.6, ST); cpBox3(w[0], w[1], a, 3.2, 3.2, 5.6, 6.0, ST); cpBox3(w[0], w[1], a, 2.4, 2.4, 6.0, 6.9, ST);
    [[1.25, 6.9, 7.6], [1.1, 7.6, 8.6], [.95, 8.6, 9.6], [.85, 9.6, 10.4], [.95, 10.4, 10.9]].forEach(function (L) { cpPrism(w[0], w[1], a, ring(L[0]), L[1], L[2], G); });   /* the robe in folds */
    [[.7, 10.9, 11.3], [.95, 11.3, 11.9], [1.0, 11.9, 12.5], [.85, 12.5, 13.0], [.5, 13.0, 13.3]].forEach(function (L) { cpPrism(w[0], w[1], a, ring(L[0]), L[1], L[2], G); });     /* a round hamster head */
    [[-.6, .1], [.6, .1]].forEach(function (e) { var c = T.P(e[0], e[1], 0); cpPrism(c[0], c[1], a, ring(.3, 8), 13.0, 13.6, G); });                                              /* ears */
    for (var sp = 0; sp < 7; sp++) { var an = Math.PI + sp / 6 * Math.PI; cpLine3(T.P(Math.cos(an) * .7, Math.sin(an) * .5 - .2, 12.9), T.P(Math.cos(an) * 1.4, Math.sin(an) * 1.0 - .2, 13.9), "#4a8a74"); }
    var ep = cpProj.apply(null, T.P(.35, -.95, 12.3)), ep2 = cpProj.apply(null, T.P(-.35, -.95, 12.3)); [ep, ep2].forEach(function (e) { if (e && e.k * 16 > 1.2) mR(cpc, Math.round(e.x), Math.round(e.y), 1, 1, "#1e3a30"); });
    var sh = T.P(1.0, 0, 0); cpPrism(sh[0], sh[1], a, ring(.32, 8), 10.4, 12.6, G); cpPrism(sh[0] + .05, sh[1], a, ring(.28, 8), 12.6, 14.6, G);
    var tc = T.P(1.05, 0, 0); cpPrism(tc[0], tc[1], a, ring(.42, 10), 14.6, 14.9, ["#e8c050", "#f0d070", "#b08a2a", "#4a3410"]);
    var fl = cpProj.apply(null, T.P(1.05, 0, 15.2)); if (fl) { var fk = Math.floor(t / 150) % 3, s = Math.max(2, Math.round(fl.k * 16 * .5)); mR(cpc, Math.round(fl.x) - s, Math.round(fl.y) - s * 2 + fk % 2, s * 2, s * 2, "#ffb030"); mR(cpc, Math.round(fl.x) - Math.ceil(s / 2), Math.round(fl.y) - s * 3 + fk % 2, s, s * 2, "#ffd34a"); mR(cpc, Math.round(fl.x), Math.round(fl.y) - s * 3, 1, s, "#fff4b0"); }
    var tb = T.P(-.95, .35, 0); cpBox3(tb[0], tb[1], a + .3, .4, 1.0, 8.8, 10.4, G);
  }
  var _cpKind3 = cpKind; cpKind = function (o, w, a, t, k) { var T = cpLoc(w[0], w[1], a);
    if (k === "ice") return cpIceberg(T, o.big ? 3.9 : 2.0, o.big ? 7.5 : 3.2, Math.round(o.x * 13 + o.y * 7) & 255, t);
    if (k === "wood") return cpLogM(cpLoc(w[0], w[1], a + .8), 2.6, .22, t);
    if (k === "statue") return cpStatueH(o, w, a, t);
    if (k === "tower") { cpIceberg(T, 2.6, 1.3, 11, t, 1); var W12 = function (r) { return cpRing(r, 12); }, RD = ["#e8584a", "#d8463c", "#a02e26", "#3a1008"], WH = ["#fffaf0", "#f8f0e0", "#c8c0b0", "#5a5040"];
      var hs = T.P(-1.1, -.6, 0); cpBox3(hs[0], hs[1], a, 1.2, 1.6, .9, 1.7, WH); cpRoof(hs[0], hs[1], a, 1.4, 1.8, 1.7, .5, ["#a8442a", "#b8543a", "#86321e", "#40160c"], [0, WH[1], WH[2]]);
      [[.62, .9, 1.7, WH], [.56, 1.7, 2.5, RD], [.5, 2.5, 3.3, WH], [.44, 3.3, 4.1, RD]].forEach(function (L) { cpPrism(w[0], w[1], a, W12(L[0]), L[1], L[2], L[3]); });
      cpPrism(w[0], w[1], a, W12(.62), 4.1, 4.2, CP_IRON); for (var rl = 0; rl < 12; rl += 2) { var an = rl / 12 * 6.283; cpLine3(T.P(Math.cos(an) * .6, Math.sin(an) * .6, 4.2), T.P(Math.cos(an) * .6, Math.sin(an) * .6, 4.45), "#2e2e34"); }
      var on = cpBlink(t); cpPrism(w[0], w[1], a, W12(.36), 4.2, 4.75, [on ? "#ffe08a" : "#a8b8c8", on ? "#fff4b0" : "#c8d8e8", on ? "#ffd34a" : "#7a8a9a", "#2e2e34"]);
      cpPrism(w[0], w[1], a, W12(.42), 4.75, 4.85, CP_IRON); cpPrism(w[0], w[1], a, W12(.28), 4.85, 5.0, CP_IRON); cpPrism(w[0], w[1], a, W12(.12), 5.0, 5.15, CP_IRON);
      if (on) { var lp = cpProj(w[0], w[1], 4.5); if (lp) { mR(cpc, Math.round(lp.x) - 6, Math.round(lp.y), 4, 1, "#fff4b0"); mR(cpc, Math.round(lp.x) + 3, Math.round(lp.y), 4, 1, "#fff4b0"); } } return; }
    return _cpKind3(o, w, a, t, k); };
  // ---- the skyline in 2.5D: each tower with a lit front, a shaded side, setbacks, spires, domes and water tanks ----
  var _cpBack1 = cpBack;
  cpBack = function (o, sky) {
    if (o.k !== "ny") return _cpBack1(o, sky);
    var dark = sky === "night", hz = CAMV.hz, X = cpHzX(o.b), wd = o.w, PAL = dark ? [["#3a4060", "#262c44"], ["#343a58", "#20263c"]] : [["#d8ccb4", "#a89c88"], ["#c0c4cc", "#8a909c"], ["#e0d0b0", "#b0a080"], ["#b8a898", "#887868"]];
    var B = []; for (var j = -wd / 2; j < wd / 2; j += 4 + Math.floor(cpHash(j + 7, 2) * 3)) B.push({ x: j, w: 3 + Math.floor(cpHash(j, 3) * 3), h: 4 + Math.floor(Math.pow(cpHash(j + 99, 5), 1.6) * (wd > 30 ? 26 : 12)), k: Math.floor(cpHash(j, 9) * 5) });
    B.sort(function (p, q) { return q.h - p.h; }).reverse();
    B.sort(function (p, q) { return cpHash(p.x, 1) - cpHash(q.x, 1); }).forEach(function (b) { var x = X + b.x, P = PAL[(b.x + 99) % PAL.length], top = hz - b.h, sw = Math.max(1, Math.round(b.w * .4));
      mR(cpc, x - 1, top - 1, b.w + sw + 2, b.h + 1, "#2a2a30"); mR(cpc, x, top, b.w, b.h, P[0]); mR(cpc, x + b.w, top + 1, sw, b.h - 1, P[1]); mR(cpc, x, top, b.w, 1, dark ? "#4a5070" : "#f0e8d8");
      for (var wy = 2; wy < b.h - 1; wy += 2) for (var wx = 1; wx < b.w; wx += 2) if (cpHash(b.x * 7 + wx, wy) < (dark ? .5 : .8)) mR(cpc, x + wx, top + wy, 1, 1, dark ? (cpHash(wx, wy + b.x) < .7 ? "#ffd34a" : "#ffb030") : "#5a6a7a");
      if (b.k === 0 && b.h > 10) { mR(cpc, x, top - 3, b.w - 1, 3, P[0]); mR(cpc, x + b.w - 1, top - 3, 1, 3, P[1]); mR(cpc, x + 1, top - 6, b.w - 3 > 0 ? b.w - 3 : 1, 3, P[0]); mR(cpc, x + Math.floor(b.w / 2), top - 9, 1, 3, "#2a2a30"); }
      else if (b.k === 1 && b.h > 8) { mR(cpc, x, top - 2, b.w, 2, "#7a9a8a"); mR(cpc, x + 1, top - 3, Math.max(1, b.w - 2), 1, "#7a9a8a"); mR(cpc, x + Math.floor(b.w / 2), top - 5, 1, 2, "#2a2a30"); }
      else if (b.k === 2) { mR(cpc, x + 1, top - 2, 2, 2, "#6a4a32"); mR(cpc, x + 1, top - 3, 2, 1, "#4a3a2a"); } });
    mR(cpc, X - wd / 2 - 6, hz - 1, wd + 12, 1, "#4a4a44"); for (var px = -wd / 2 - 4; px < wd / 2 + 4; px += 7) { mR(cpc, X + px, hz - 2, 3, 1, "#3a3a3a"); }
  };
  // ---- the foredeck in more detail: shaded planks, thick bulwarks with stanchions, anchor chains, ventilators, a bell, the hatch under its tarpaulin ----
  cpDeck = function (t) {
    var Wd = function (p, z) { return shipW(p[0], p[1], z); }, zd = 1.0, zb = 1.45;
    cpPolyW(CP_DECK.map(function (p) { return Wd(p, zd); }), "#c8945a");
    for (var sx = -2.4, k = 0; sx <= 2.4; sx += .3, k++) { if (k % 3 === 1) cpPolyW([Wd([sx, -5.6], zd), Wd([sx + .3, -5.6], zd), Wd([sx + .3, 2.4 - Math.abs(sx + .3) * .95], zd), Wd([sx, 2.4 - Math.abs(sx) * .95], zd)], "#d0a066"); cpLine3(Wd([sx, -5.6], zd), Wd([sx, 2.4 - Math.abs(sx) * .95], zd), "#a8743e"); }
    for (var i = 1; i < CP_DECK.length; i++) { var p = CP_DECK[i], q = CP_DECK[(i + 1) % CP_DECK.length], cx = (p[0] + q[0]) / 2, cy = (p[1] + q[1]) / 2, ix = -cx * .12, iy = -(cy + 1.5) * .06;   /* a shadow strip along the bulwark */
      cpPolyW([Wd(p, zd + .005), Wd(q, zd + .005), Wd([q[0] - q[0] * .1, q[1] - (q[1] + 1.5) * .05], zd + .005), Wd([p[0] - p[0] * .1, p[1] - (p[1] + 1.5) * .05], zd + .005)], "#9a6a3a"); }
    var hc = shipW(0, -3.6); cpBox3(hc[0], hc[1], cp.h, 2.3, 1.6, zd, zd + .32, ["#5a6a5a", "#6a7a6a", "#3a4a3a", "#1e2a1e"]); for (var bt = -.9; bt <= .9; bt += .45) cpLine3(shipW(bt, -4.4, zd + .33), shipW(bt, -2.8, zd + .33), "#3a4a3a");
    [-.8, .8].forEach(function (s2) { var d = shipW(s2, .1); cpPrism(d[0], d[1], cp.h, cpRing(.3, 10), zd, zd + .45, ["#5a5a62", "#6a6a72", "#2e2e34", "#141418"]); cpPrism(d[0], d[1], cp.h, cpRing(.36, 10), zd + .45, zd + .52, CP_IRON);
      var a0 = shipW(s2, .4, zd + .05), a1 = shipW(s2 * 1.35, 1.25, zd + .05); for (var c = 0; c <= 6; c++) { var u = c / 6, cp3 = [a0[0] + (a1[0] - a0[0]) * u, a0[1] + (a1[1] - a0[1]) * u, zd + .05], pr = cpProj(cp3[0], cp3[1], cp3[2]); if (pr) mR(cpc, Math.round(pr.x), Math.round(pr.y) - (c % 2), c % 2 ? 1 : 2, 1, "#3a3a40"); } });
    [[-1.9, -4.3], [1.9, -4.3]].forEach(function (v) { var b = shipW(v[0], v[1]); cpPrism(b[0], b[1], cp.h, cpRing(.18, 8), zd, zd + .8, ["#f0e8d8", "#f8f0e0", "#c8c0b0", "#5a5040"]); var hd = shipW(v[0], v[1] + .12); cpPrism(hd[0], hd[1], cp.h, cpRing(.3, 8), zd + .8, zd + 1.1, ["#d8463c", "#e8584a", "#9a2a22", "#3a1008"]); });   /* ventilators with red cowls */
    [[-1.2, -.8], [1.2, -.8], [-1.0, 1.0], [1.0, 1.0]].forEach(function (v) { var b = shipW(v[0], v[1]); cpPrism(b[0], b[1], cp.h, cpRing(.11, 8), zd, zd + .25, CP_IRON); });
    for (var j = 1; j < CP_DECK.length; j++) { var P0 = CP_DECK[j], Q0 = CP_DECK[(j + 1) % CP_DECK.length], L = Math.hypot(Q0[0] - P0[0], Q0[1] - P0[1]), n = Math.max(1, Math.round(L / .5));
      cpPolyW([Wd(P0, zd), Wd(Q0, zd), Wd(Q0, zb), Wd(P0, zb)], "#e8e0d0");
      for (var s3 = 0; s3 <= n; s3++) { var u2 = s3 / n, sp = [P0[0] + (Q0[0] - P0[0]) * u2, P0[1] + (Q0[1] - P0[1]) * u2]; cpLine3(Wd(sp, zd + .02), Wd(sp, zb), "#c8c0b0"); }
      var ox = (P0[0] + Q0[0]) * -.04, oy = -.06; cpPolyW([Wd(P0, zb), Wd(Q0, zb), Wd([Q0[0] + ox, Q0[1] + oy], zb + .02), Wd([P0[0] + ox, P0[1] + oy], zb + .02)], "#a8743e"); cpLine3(Wd(P0, zb), Wd(Q0, zb), "#6a4428"); cpLine3(Wd(P0, zd + .02), Wd(Q0, zd + .02), "#8a7a64"); }
    var bl = shipW(0, -1.0); cpLine3(shipW(-.25, -1.0, zd), shipW(-.25, -1.0, zd + .7), "#5a3a22"); cpLine3(shipW(.25, -1.0, zd), shipW(.25, -1.0, zd + .7), "#5a3a22"); cpLine3(shipW(-.25, -1.0, zd + .7), shipW(.25, -1.0, zd + .7), "#5a3a22");
    var bp = cpProj(bl[0], bl[1], zd + .62); if (bp) { var r = Math.max(2, Math.round(bp.k * 16 * .14)); cpBlob(bp.x, bp.y + r, r + .6, r + .6, function (dx, dy) { return dy < -.6 ? null : "#2a1a10"; }); cpBlob(bp.x, bp.y + r, r, r, function (dx, dy) { return dy < -.6 ? null : dx < -.2 ? "#f6dc84" : dx < .4 ? "#d8aa48" : "#a87a2a"; }); }
    var top = shipW(0, 2.2, 2.5); cpLine3(shipW(0, 2.2, zb), top, "#3a2414"); var fp = cpProj(top[0], top[1], top[2]);
    if (fp) { var fx = Math.round(fp.x), fy = Math.round(fp.y), fw = Math.floor(t / 250) % 2; mR(cpc, fx + 1, fy, 5 - fw, 2, "#d8463c"); mR(cpc, fx + 1, fy + 2, 5, 2, "#f8f4ec"); mR(cpc, fx + 1, fy + 4, 5 - fw, 1, "#d8463c"); }
  };
  // ===== v8 "Mahagoni plastisch": bevelled panels, deep window reveals, coffered ceiling, a console top that recedes, a floor in perspective =====
  CP_BVP[8] = CP_BVP[4]; CP_BV = 8;
  var CP_TELC = [32, 103], CP_TELR = 21, CP_WHC = [90, 117];
  var _cpFrameV1 = cpFrameV;
  cpFrameV = function (v) {
    if (v !== 8) return _cpFrameV1(v); if (cpFrames[8]) return cpFrames[8];
    var cv = document.createElement("canvas"); cv.width = 180; cv.height = 135; var g = cv.getContext("2d"), P = CP_BVP[4], W = P.w, B = P.br, M = cpMix; g.drawImage(_cpFrameV1(4), 0, 0);
    var R = function (x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); };
    var bevel = function (x, y, w, h) { R(x, y, w, h, W[1]); for (var i = 0; i < 2; i++) { R(x + i, y + i, w - i * 2, 1, M(W[0], "#ffffff", .18 - i * .08)); R(x + i, y + i, 1, h - i * 2, M(W[0], W[1], i * .5)); R(x + i, y + h - 1 - i, w - i * 2, 1, M(W[3], W[2], i * .5)); R(x + w - 1 - i, y + i, 1, h - i * 2, M(W[3], W[2], i * .5)); }
      R(x + 3, y + 3, w - 6, h - 6, M(W[1], W[2], .35)); for (var gx = x + 4; gx < x + w - 4; gx += 3) R(gx, y + 3, 1, h - 6, M(W[1], W[2], .5 + ((gx * 7) % 3) * .08)); R(x + 3, y + 3, w - 6, 1, M(W[2], W[3], .5)); R(x + 3, y + 3, 1, h - 6, M(W[2], W[3], .5)); };
    // window reveals: the wall has thickness, lit on the left, in shade on the right and above
    CP_WIN.forEach(function (w) { var x = w[0], ww = w[1]; for (var i = 0; i < 4; i++) { R(x + i, 5 + i, 1, 70 - i, M(W[0], W[1], i * .3)); R(x + ww - 1 - i, 5 + i, 1, 70 - i, M(W[3], W[2], i * .3)); R(x + i, 5 + i, ww - i * 2, 1, M(W[3], W[2], i * .25)); } R(x, 74, ww, 1, M(W[0], "#ffffff", .25)); });
    // coffered ceiling
    for (var bx = 0; bx < 180; bx += 15) { R(bx, 0, 15, 4, M(W[3], W[2], .3)); R(bx + 1, 1, 13, 2, M(W[2], W[1], .45)); R(bx + 1, 1, 13, 1, M(W[1], W[0], .5)); }
    // sconces with a warm glow on the pillars
    [[61, 16], [119, 16]].forEach(function (s) { for (var r = 6; r > 0; r--) { g.fillStyle = "rgba(255,226,150," + (.05 + (6 - r) * .02) + ")"; g.fillRect(s[0] - 3 - r, s[1] - r, 6 + r * 2, 10 + r * 2); } R(s[0] - 2, s[1] + 7, 4, 2, B[2]); R(s[0] - 1, s[1], 2, 7, "#fff4b0"); R(s[0] - 1, s[1], 1, 7, "#ffffff"); R(s[0] - 2, s[1] - 1, 4, 1, B[1]); });
    // the console top recedes to a vanishing point far ahead
    var VX = 90, VY = -70;
    for (var y = 77; y < 93; y++) { var f = (y - 77) / 16; R(0, y, 180, 1, M(W[0], W[1], .25 + f * .6)); }
    for (var lx = -60; lx <= 240; lx += 15) for (var yy = 77; yy < 93; yy++) { var tt = (yy - VY) / (93 - VY), xx = Math.round(VX + (lx - VX) * tt); if (xx >= 0 && xx < 180) R(xx, yy, 1, 1, M(W[1], W[2], .55)); }
    R(0, 76, 180, 1, P.ol); R(0, 77, 180, 1, B[1]); R(0, 92, 180, 1, B[0]); R(0, 93, 180, 2, W[3]); R(0, 95, 180, 1, M(W[3], "#000000", .3));
    for (var px = 1; px < 180; px += 30) bevel(px, 97, 28, 18);
    // a polished floor running away from us
    for (var fy = 117; fy < 135; fy++) { var ff = (fy - 117) / 18; R(0, fy, 180, 1, M("#3a2214", "#6a4428", ff * .9)); for (var k = -7; k <= 7; k++) R(Math.round(90 + k * (13 + ff * 20)), fy, 1, 1, "#24140a"); if (fy % 6 === 0) R(0, fy, 180, 1, M("#24140a", "#3a2214", ff)); }
    R(0, 116, 180, 1, B[2]); R(0, 115, 180, 1, W[3]);
    // soft shadows on the floor under the pedestals and the wheel
    [[CP_TELC[0], 133, 12], [147, 133, 13], [CP_WHC[0], 134, 22]].forEach(function (s) { for (var dx = -s[2]; dx <= s[2]; dx++) { var hh = Math.round(2.2 * Math.sqrt(1 - (dx / s[2]) * (dx / s[2]))); g.fillStyle = "rgba(20,8,4,.35)"; g.fillRect(s[0] + dx, s[1] - hh, 1, hh * 2 + 1); } });
    // the telegraph column and the binnacle stand on the floor
    var tc = CP_TELC[0]; R(tc - 7, 118, 14, 17, P.ol); R(tc - 6, 118, 12, 17, B[1]); R(tc - 6, 118, 3, 17, B[0]); R(tc + 3, 118, 2, 17, B[2]); R(tc - 9, 131, 18, 4, B[2]); R(tc - 9, 131, 18, 1, B[1]);
    R(138, 114, 18, 21, P.ol); R(139, 114, 16, 21, W[1]); R(139, 114, 3, 21, W[0]); R(153, 114, 2, 21, W[2]); R(136, 131, 22, 4, B[2]); R(136, 131, 22, 1, B[1]);
    [133, 158].forEach(function (bx2) { g.fillStyle = P.ol; g.beginPath(); g.arc(bx2, 108, 4, 0, 7); g.fill(); R(bx2 - 3, 106, 6, 5, "#3a5a3a"); R(bx2 - 2, 106, 2, 2, "#6a9a6a"); R(bx2 - 2, 106, 1, 1, "#ffffff"); });
    R(150, 80, 28, 2, W[3]); R(151, 82, 26, 9, "#e8dcb8"); R(151, 82, 26, 1, "#fff4d8"); R(155, 84, 10, 1, "#6a8aa8"); R(158, 85, 1, 4, "#6a8aa8"); R(168, 86, 4, 1, "#c8463c"); R(151, 91, 26, 1, M(W[3], "#000000", .3));
    cpFrames[8] = cv; return cv;
  };
  // a bigger telegraph with three wide coloured fields and a lever, a bigger wheel
  var _cpBridgeV = null;
  function cpBridge8(t) {
    if (!CP_BV) return _cpBridgeV(t);
    var P = CP_BVP[CP_BV], B = P.br, H = P.wh, tx = CP_TELC[0], ty = CP_TELC[1], TR = CP_TELR;
    cpc.drawImage(cpFrame(), 0, 0);
    cpBlob(tx, ty, TR, TR, function (dx, dy) { var d = dx * dx + dy * dy; return d > .9 ? P.ol : d > .76 ? (dx + dy < -.2 ? B[0] : dx + dy < .7 ? B[1] : B[2]) : d > .7 ? B[3] : dy > .3 ? "#ece0c8" : "#fbf6ea"; });
    var cols = ["#d8463c", "#e8b03a", "#4a9a3a"];
    for (var s3 = 0; s3 < 3; s3++) { var on = cp.lvl === s3; for (var an = CP_TEL[s3] - 27; an <= CP_TEL[s3] + 27; an += 3) { var ar = an * Math.PI / 180; for (var r = 9; r <= TR - 5; r++) mR(cpc, Math.round(tx + Math.cos(ar) * r), Math.round(ty + Math.sin(ar) * r), 1, 1, on ? cols[s3] : cpMix(cols[s3], "#fbf6ea", .55)); }
      if (on) { var ar2 = CP_TEL[s3] * Math.PI / 180; cpBlob(tx + Math.cos(ar2) * (TR - 9), ty + Math.sin(ar2) * (TR - 9), 2.2, 2.2, function () { return "#ffffff"; }); } }
    var na = CP_TEL[cp.lvl] * Math.PI / 180; for (var k = 0; k < TR - 4; k++) mR(cpc, Math.round(tx + Math.cos(na) * k), Math.round(ty + Math.sin(na) * k), 2, 2, P.ol);
    for (var k2 = TR - 4; k2 < TR + 6; k2++) mR(cpc, Math.round(tx + Math.cos(na) * k2), Math.round(ty + Math.sin(na) * k2), 2, 2, B[1]);
    cpBlob(tx + Math.cos(na) * (TR + 7), ty + Math.sin(na) * (TR + 7), 3, 3, function (dx) { return dx < 0 ? B[0] : B[2]; });
    cpBlob(tx, ty, 3.5, 3.5, function (dx, dy) { return dx + dy < 0 ? B[0] : B[2]; });
    // binnacle
    cpBlob(147, 106, 12, 9, function (dx, dy) { var d = dx * dx + dy * dy; return d > .82 ? P.ol : dy < -.2 ? (dx < -.2 ? B[0] : B[1]) : d > .5 ? B[2] : null; });
    cpBlob(147, 108, 7, 4, function () { return "#fbf6ea"; }); mR(cpc, Math.round(147 - Math.sin(cp.h) * 5), Math.round(108 - Math.cos(cp.h) * 2.5), 2, 2, "#c83a2a"); mR(cpc, 146, 97, 3, 2, B[0]);
    // whistle cord
    var pull = cp.wh ? 6 : 0; mR(cpc, 170, 0, 1, 94 + pull, "#e8d8b0"); cpBox(167, 94 + pull, 7, 10, H[1], H[0]); mR(cpc, 169, 96 + pull, 3, 6, H[2]); mR(cpc, 167, 94 + pull, 7, 1, B[0]);
    if (cpLeg().wh && !cp.wh && !cp.anim) { if (Math.floor(t / 400) % 2) { mR(cpc, 165, 92, 11, 1, "#ffd34a"); mR(cpc, 165, 105, 11, 1, "#ffd34a"); } }
    // the wheel, bigger: turned spokes with handles, a thick rim, a brass hub
    var ang = (cp.wheelA != null ? cp.wheelA : cp.rud * .45) + (cp.anim ? Math.sin(t / 500) * .03 : 0), cx = CP_WHC[0], cy = CP_WHC[1];
    for (var a = 0; a < 8; a++) { var aa = ang + a * Math.PI / 4, ca = Math.cos(aa), sa = Math.sin(aa); for (var r2 = 7; r2 < 37; r2++) { var px = Math.round(cx + ca * r2), py = Math.round(cy + sa * r2); if (py >= 135) continue; var hd = r2 > 29;
        mR(cpc, px - 1, py, hd ? 3 : 2, hd ? 3 : 2, P.ol); mR(cpc, px, py, hd ? 2 : 1, hd ? 2 : 1, hd ? (r2 % 3 === 0 ? H[2] : H[0]) : (r2 < 12 ? H[1] : H[0])); } }
    for (var q = 0; q < 260; q++) { var b = q / 260 * Math.PI * 2; for (var rr = 21; rr <= 27; rr++) { var qx = Math.round(cx + Math.cos(b) * rr), qy = Math.round(cy + Math.sin(b) * rr); if (qy >= 135) continue;
        var lit = Math.cos(b + 2.3) > .3, sh = Math.cos(b + 2.3) < -.4; mR(cpc, qx, qy, 1, 1, rr === 21 || rr === 27 ? P.ol : rr === 22 ? (lit ? "#f0c890" : H[0]) : rr === 26 ? (sh ? cpMix(H[2], "#000000", .3) : H[2]) : (q % 16 < 2 ? B[1] : sh ? H[2] : lit ? H[0] : H[1])); } }
    cpBlob(cx, cy, 8.5, 8.5, function (dx, dy) { var d = dx * dx + dy * dy; return d > .82 ? P.ol : dx + dy < -.5 ? "#fff4c0" : dx + dy < -.1 ? B[0] : dx + dy < .5 ? B[1] : B[2]; }); cpBlob(cx, cy, 3, 3, function (dx, dy) { return dx + dy < 0 ? B[1] : B[3]; });
  }
  var _cpFrame0 = cpFrame; cpFrame = function () { return CP_BV ? cpFrameV(CP_BV) : _cpFrame0(); };
  var _cpBridge0 = cpBridge;
  cpBridge = function (t) {
    if (!CP_BV) return _cpBridge0(t);
    var P = CP_BVP[CP_BV], B = P.br, H = P.wh;
    cpc.drawImage(cpFrame(), 0, 0);
    // engine telegraph: a brass drum with the dial, Stopp red, Halbe yellow, Volle green, and the handle on top
    var tx = 30, ty = 101;
    cpBlob(tx, ty, 15, 15, function (dx, dy) { var d = dx * dx + dy * dy; return d > .86 ? P.ol : d > .7 ? (dx + dy < 0 ? B[0] : dx + dy < .6 ? B[1] : B[2]) : d > .64 ? B[3] : dy > .4 ? "#ece0c8" : "#fbf6ea"; });
    [["#d8463c", 0], ["#e8b03a", 1], ["#4a9a3a", 2]].forEach(function (m) { var a = CP_TEL[m[1]] * Math.PI / 180, on = cp.lvl === m[1]; for (var r = 5; r <= 10; r++) mR(cpc, Math.round(tx + Math.cos(a) * r), Math.round(ty + Math.sin(a) * r), on ? 3 : 2, on ? 3 : 2, m[0]); });
    var na = CP_TEL[cp.lvl] * Math.PI / 180; for (var k = 0; k < 9; k++) mR(cpc, Math.round(tx + Math.cos(na) * k), Math.round(ty + Math.sin(na) * k), 2, 2, P.ol);
    for (var k2 = 9; k2 < 19; k2++) mR(cpc, Math.round(tx + Math.cos(na) * k2), Math.round(ty + Math.sin(na) * k2), 2, 2, B[1]); mR(cpc, Math.round(tx + Math.cos(na) * 19) - 1, Math.round(ty + Math.sin(na) * 19) - 1, 4, 4, B[0]);
    cpBlob(tx, ty, 2.5, 2.5, function () { return B[0]; });
    // binnacle: a brass hood with the compass card behind its window
    cpBlob(147, 106, 12, 9, function (dx, dy) { var d = dx * dx + dy * dy; return d > .82 ? P.ol : dy < -.2 ? (dx < -.2 ? B[0] : B[1]) : d > .5 ? B[2] : null; });
    cpBlob(147, 108, 7, 4, function () { return "#fbf6ea"; }); mR(cpc, Math.round(147 - Math.sin(cp.h) * 5), Math.round(108 - Math.cos(cp.h) * 2.5), 2, 2, "#c83a2a"); mR(cpc, 146, 97, 3, 2, B[0]);
    // whistle cord
    var pull = cp.wh ? 6 : 0; mR(cpc, 170, 0, 1, 94 + pull, "#e8d8b0"); cpBox(167, 94 + pull, 7, 10, H[1], H[0]); mR(cpc, 169, 96 + pull, 3, 6, H[2]); mR(cpc, 167, 94 + pull, 7, 1, B[0]);
    if (cpLeg().wh && !cp.wh && !cp.anim) { var bl = Math.floor(t / 400) % 2; if (bl) { mR(cpc, 165, 92, 11, 1, "#ffd34a"); mR(cpc, 165, 105, 11, 1, "#ffd34a"); } }
    // the wheel: turned spokes with handles, a rim of wood, a brass hub
    var ang = (cp.wheelA != null ? cp.wheelA : cp.rud * .45) + (cp.anim ? Math.sin(t / 500) * .03 : 0), cx = 90, cy = 112;
    for (var a = 0; a < 8; a++) { var aa = ang + a * Math.PI / 4, ca = Math.cos(aa), sa = Math.sin(aa); for (var r = 5; r < 28; r++) { var px = Math.round(cx + ca * r), py = Math.round(cy + sa * r); if (py >= 135) continue; var hd = r > 21;
        mR(cpc, px, py, hd ? 2 : 1, hd ? 2 : 1, hd ? (r % 3 === 0 ? H[2] : H[0]) : (r < 10 ? H[1] : H[0])); if (!hd && r % 2) mR(cpc, px + 1, py, 1, 1, H[2]); } }
    for (var q = 0; q < 180; q++) { var b = q / 180 * Math.PI * 2; for (var rr = 16; rr <= 20; rr++) { var qx = Math.round(cx + Math.cos(b) * rr), qy = Math.round(cy + Math.sin(b) * rr); if (qy >= 135) continue;
        mR(cpc, qx, qy, 1, 1, rr === 16 || rr === 20 ? P.ol : rr === 17 ? H[0] : rr === 19 ? H[2] : (q % 12 < 2 ? B[1] : H[1])); } }
    cpBlob(cx, cy, 6, 6, function (dx, dy) { var d = dx * dx + dy * dy; return d > .8 ? P.ol : dx + dy < -.3 ? B[0] : dx + dy < .4 ? B[1] : B[2]; }); cpBlob(cx, cy, 2, 2, function () { return B[3]; });
  };
  _cpBridgeV = cpBridge; cpBridge = cpBridge8;
  function cpDraw(t) {
    cpRaf = cp && (cp.anim || cp.glass || cpSky() === "storm" && !cp.intro && !cp.done) ? requestAnimationFrame(cpDraw) : 0;
    if (!cp) return;
    if (cp.glass) { cpDrawGlass(t); return; }
    try {
      var A0 = cp.anim, mixU = A0 && !A0.look ? (A0.seq ? 1 : A0.u || 0) : 0, sky2 = cpSky(cp.leg + 1), sky = cpSky(), sea = cpSeaPic(sky), sh = cp.shake > 0 || cp.ev ? Math.round(Math.sin(t / (cp.ev ? 90 : 30)) * (cp.ev && cp.shake <= 0 ? 1 : 2)) : 0, off = (((-cp.h * 160) % 180) + 180) % 180;
      var storm = (sky === "storm" ? 1 - mixU : 0) + (sky2 === "storm" && cp.leg + 1 < cp.route.length ? mixU : 0), pitch = Math.round((Math.sin(t / 650) * 3 + Math.sin(t / 1700) * 2) * storm + Math.sin(t / 1400) * .6);   // the bow rises and falls
      cpc.setTransform(1, 0, 0, 1, 0, sh); cpc.fillStyle = CP_SEA[sky][0][0]; cpc.fillRect(0, 0, 180, 80); cpc.setTransform(1, 0, 0, 1, 0, sh + pitch);
      cpc.drawImage(sea, Math.round(off) - 180, 0); cpc.drawImage(sea, Math.round(off), 0); cpWater(t, mixU > .5 && cp.leg + 1 < cp.route.length ? sky2 : sky, storm);
      if (sky2 !== sky && mixU > 0 && cp.leg + 1 < cp.route.length) { var sea2 = cpSeaPic(sky2); cpc.globalAlpha = Math.min(1, mixU * 1.3); cpc.drawImage(sea2, Math.round(off) - 180, 0); cpc.drawImage(sea2, Math.round(off), 0); cpc.globalAlpha = 1; }
      cp.B.forEach(function (o) { var fac = o.leg === cp.leg + 1 ? mixU : o.leg > cp.leg + 1 ? 0 : o.leg < cp.leg ? 1 - mixU : 1; if (fac <= 0) return;   // coasts rise over the horizon as they come, and sink behind
        cpc.save(); cpc.beginPath(); cpc.rect(0, -10, 180, CP_HZ + 11); cpc.clip(); cpc.translate(0, Math.round((1 - fac) * 18)); cpBack(cpBW(o), sky); cpc.restore(); });
      cpSkyDraw(mixU > .5 && cp.leg + 1 < cp.route.length ? sky2 : sky, t); if (storm > .3) cpWaves(t, storm, sky);
      // the yellow line: the whole leg as it would be sailed now
      if (!cp.anim && !cp.intro) { var S = cpLegS(cp.lvl), AN = cp.anc[cp.leg], GP = cpPlan(cp.rud, cp.lvl); for (var i = 1; i <= 20; i++) { var a0 = cpPP(GP, S * i / 20), a = cpW(AN, a0[0], a0[1]), p = cpProj(a[0], a[1]); if (p && p.y < 135) mR(cpc, Math.round(p.x) - (p.sz > 2 ? 2 : 1), Math.round(p.y), p.sz > 2 ? 4 : 2, 1, "#ffd34a"); }
        var e0 = cpPP(GP, S), e = cpW(AN, e0[0], e0[1]), pe = cpProj(e[0], e[1]); if (pe) mR(cpc, Math.round(pe.x) - 2, Math.round(pe.y) - 1, 5, 3, cp.lvl ? "#ffd34a" : "#d8463c"); }
      if (!cp.intro) cpLaneMarks(sky);
      cpWorldDraw(t, false); cpGulls(t, sky); cpc.setTransform(1, 0, 0, 1, 0, sh); cpDeck(t); cpDeckIce(); cpRopes();
      var amt = function (k) { return (sky === k ? 1 - mixU : 0) + (sky2 === k ? mixU : 0) * (cp.leg + 1 < cp.route.length ? 1 : 0) + (sky === k && sky2 === k ? 0 : 0); };
      var fogA = sky === "fog" && sky2 === "fog" ? 1 : amt("fog"), nA = sky === "night" && sky2 === "night" ? 1 : amt("night"), stA = sky === "storm" && sky2 === "storm" ? 1 : amt("storm");
      if (fogA > .02) for (var fy = 0; fy < 80; fy++) { var al = (fy < CP_HZ ? .7 : Math.max(0, .75 - (fy - CP_HZ) / 75)) * fogA; if (al > 0) { cpc.fillStyle = "rgba(226,232,236," + al.toFixed(2) + ")"; cpc.fillRect(0, fy, 180, 1); } }
      if (nA > .02) { cpc.fillStyle = "rgba(8,14,40," + (.28 * nA).toFixed(2) + ")"; cpc.fillRect(0, 0, 180, 80); }
      if (stA > .3) { for (var rn = 0; rn < 40; rn++) { var rx = (rn * 47 + t / 4) % 180, ry = (rn * 31 + t / 2) % 78; mR(cpc, Math.round(rx), Math.round(ry), 1, 2, "#a8b8c8"); } }
      cpBridge(t); cpLaneLamp(t);
      cpc.setTransform(1, 0, 0, 1, 0, 0);
    } catch (err) { }
    if (cp.anim) cpStep(t);
  }
  // the three lanes: faint marks on the water between them, and a small lamp plate on the console showing ours
  function cpLaneMarks(sky) { var dark = sky === "night" || sky === "storm", col = dark ? "rgba(200,220,255,.22)" : "rgba(255,255,255,.38)";
    for (var j = cp.leg; j <= cp.leg + 1 && j < cp.route.length; j++) { var AN = cp.anc[j], bd = cpBendOf(j), dmax = j === cp.leg ? 60 : 30;
      if (cp.route[j].k === "pier" || cp.route[j].k === "abfahrt" && !cp.castOff) continue;
      for (var d = 1; d < dmax; d += 2.4) { if (Math.floor(d / 2.4) % 2) continue; var c = cpPath(bd, d), rx = Math.cos(c[2]), ry = -Math.sin(c[2]);
        [-.5, .5].forEach(function (m) { var o = m * CP_LW, w = cpW(AN, c[0] + rx * o, c[1] + ry * o), p = cpProj(w[0], w[1]); if (p && p.y > CAMV.hz + 1 && p.y < 80) { cpc.fillStyle = col; cpc.fillRect(Math.round(p.x) - (p.sz > 2 ? 1 : 0), Math.round(p.y), p.sz > 2 ? 3 : 1, 1); } }); } } }
  function cpLaneLamp(t) { if (cp.intro || cp.glass) return; var x0 = 79, y0 = 72, ln = Math.round((cp.anim ? cpLatAt(cp.anim.useSafe ? cp.anim.safe : cp.anim.plan, cp.d || 0) : cp.tr ? cp.tr.a + (cp.tr.b - cp.tr.a) * cpSm1(cp.tr.f) : cp.lat || 0) / CP_LW),
      tg = cp.anim ? Math.round((cp.anim.useSafe ? cp.anim.safe : cp.anim.plan).b / CP_LW) : cp.tr ? Math.round(cp.tr.b / CP_LW) : cpTarget(cp.rud), blink = Math.floor(t / 280) % 2;
    mR(cpc, x0, y0, 23, 7, "#2a1a10"); mR(cpc, x0 + 1, y0 + 1, 21, 5, "#6a4a2a"); mR(cpc, x0 + 1, y0 + 1, 21, 1, "#c8a040");
    for (var i = -1; i <= 1; i++) { var lx = x0 + 2 + (i + 1) * 7, on = i === ln, nx = i === tg && tg !== ln;
      mR(cpc, lx, y0 + 2, 5, 4, "#1a1008"); mR(cpc, lx + 1, y0 + 3, 3, 2, on ? "#ffd34a" : nx ? (blink ? "#f08a3a" : "#5a3a1a") : "#3a2a1a"); if (on) mR(cpc, lx + 1, y0 + 3, 1, 1, "#fff6c8"); } }
  function cpRedraw() { if (!cpRaf) cpDraw(performance.now()); }
  // ---- sailing one leg ----
  function cpGo() {
    if (!cp || cp.anim || cp.intro || cp.done || cp.glass) return;
    var lvl = cp.lvl, S = cpLegS(lvl), plan = cpPlan(cp.rud, lvl);
    var hit = cpSimP(plan, lvl), safe = plan, halt = false; if (cpLeg().k === "eiswarn") cp.iceLuck = Math.random() < .4;
    if (hit && CP_STRUCT[hit.k]) { var dh = cpDistU(lvl, S, hit.u), cur = Math.round(cpLatAt(plan, dh) / CP_LW), aw = Math.max(-1, Math.min(1, cur - (hit.sd > 0 ? 1 : -1))), ord = hit.k === "zone" || hit.k === "quay" ? [0, aw, -aw] : [aw, 0, -1, 1]; halt = true;
      for (var oi = 0; oi < ord.length; oi++) { var sp = { bend: plan.bend, a: plan.a, b: ord[oi] * CP_LW, D: 8, s0: 0 }, h2 = cpSimP(sp, lvl); if (!h2 || !CP_STRUCT[h2.k]) { safe = sp; halt = false; break; } } }
    cp.anim = { lvl: lvl, rud: cp.rud, plan: plan, safe: safe, S: S, dur: lvl ? 5200 : 3800, hit: hit, u: 0, halt: halt, pre: cp.leg === 0 && !cp.castOff ? 1 : 0 };
    if (cpLeg().k === "wale" && lvl === 2) cp.O.forEach(function (o) { if (o.leg === cp.leg && o.ani) o.scared = performance.now() + 900; });
    if (cp.leg + 1 < cp.route.length) { cp.rel = cp.rel || []; cp.rel[cp.leg + 1] = cpPath(plan.bend, halt ? Math.max(0, cpDistU(lvl, S, hit.u) - .5) : S); cpReanchor(cp.leg + 1); if (!cp.info[cp.leg + 1]) cpBuild(cp.leg + 1); }
    var Lend = Math.max(-1, Math.min(1, Math.round((halt ? cpLatAt(plan, cpDistU(lvl, S, hit.u)) : safe.b) / CP_LW)));
    var carry = !halt && safe === plan && plan.b !== plan.a && (plan.s0 + S) / plan.D < 1;   // still changing lanes when the next leg starts: the wheel is fast then, so nothing hard waits in the new lane
    cp.O.forEach(function (o) { if (o.leg === cp.leg + 1 && o.lf && !o.lfDone) { o.lfDone = 1; cpLaneSet(o, Lend); if (carry && o.hard && o.lane === Lend) { var f0 = o.lf; o.lf = function () { return cpLaneFree(Lend, Lend >= 0 ? -1 : 1, 1); }; cpLaneSet(o, Lend); o.lf = f0; } } });
    if (cp.wh) { dzWhistle(cpLeg().k === "abfahrt" ? 2.2 : 1.4); }
    dzBell(lvl === 0 ? 1 : lvl === 1 ? 2 : 3); cpEngine(lvl, cp.anim.dur / 1000, (cp.anim.pre ? 2.8 : 0) + .5, cp.lastLvl == null ? 0 : cp.vps > 0 ? cp.lastLvl : 0); cpPanelDraw(); cpRaf = requestAnimationFrame(cpDraw);
  }
  function cpStep(t) {
    var A = cp.anim; if (!A.t0) A.t0 = t; if (cp.shake > 0) cp.shake -= .016;
    if (A.lead) { if (!A.lt0) A.lt0 = t; A.v = Math.min(1, (t - A.lt0) / A.dur);
      if (A.v > .35 && !A.sw.snapped) { A.sw.snapped = 1; beep([[220, .05], [140, .09]]); dzBuzz([30]); var AN0 = cp.anc[A.sw.leg]; [31, 12].forEach(function (y) { var b = cpW(AN0, -8.75, y); cpBurst([b[0] + .6, b[1], 1.3], 8, ["#e0d0a8", "#fff8ec"], 2.2, 2.5); }); cpSay("Die Leinen der Mümmel reißen!"); }
      if (A.v >= 1) { cp.anim = null; cpPanelDraw(); cpRedraw(); } return; }
    if (A.crash) { var C = A.crash, ct = t - C.t0;
      if (C.rec && ct > C.hold) { var v = cpSm((ct - C.hold) / (C.dur - C.hold)), P0 = cpPP(A.plan, C.d), P1 = cpPP(A.safe, C.d), AN1 = cp.anc[cp.leg], W1 = cpW(AN1, P0[0] + (P1[0] - P0[0]) * v, P0[1] + (P1[1] - P0[1]) * v); cp.px = W1[0]; cp.py = W1[1]; cp.h = AN1.h + P0[2] + (P1[2] - P0[2]) * v; }
      if (C.rec && A.halt) { var Pq = cpPP(A.plan, Math.max(0, C.d - .5 * cpSm((ct - C.hold) / 900))), ANq = cp.anc[cp.leg], Wq = cpW(ANq, Pq[0], Pq[1]); if (ct > C.hold) { cp.px = Wq[0]; cp.py = Wq[1]; cp.h = ANq.h + Pq[2]; } }
      if (ct < C.dur) return; A.t0 += C.dur; A.crash = null; if (A.halt) { A.hold = t + 300; return; } if (C.rec) A.useSafe = 1; }
    if (A.pre) { if (!A.pt0) A.pt0 = t; A.preV = Math.min(1, (t - A.pt0) / 2800); if (A.preV >= 1) { A.pre = 0; cp.castOff = 1; A.t0 = t; } return; }   // "Leinen los!": the lines come off first
    if (A.hold) { if (t > A.hold) cpNext(); return; }
    if (A.seq) { A.seqV = Math.min(1, (t - A.seq) / 3600); if (A.seqV >= 1) A.hold = t + 200; return; }
    var u = Math.min(1, (t - A.t0) / A.dur); A.u = u; cp.d = cpDistU(A.lvl, A.S, u); var P = cpPP(A.useSafe ? A.safe : A.plan, cp.d), AN = cp.anc[cp.leg], W = cpW(AN, P[0], P[1]); cp.px = W[0]; cp.py = W[1]; cp.h = AN.h + P[2];
    if (A.lvl && Math.random() < (A.lvl === 2 ? .9 : .45)) { var sd0 = Math.random() < .5 ? -1 : 1, bp = shipW(sd0 * (1.1 + Math.random() * .5), 2.0, .2); cp.fx = cp.fx || []; cp.fx.push({ x: bp[0], y: bp[1], z: bp[2], vx: Math.cos(cp.h) * sd0 * (1.5 + Math.random() * 1.5), vy: -Math.sin(cp.h) * sd0 * 2, vz: 2 + Math.random() * 2, l: .6, c: Math.random() < .5 ? "#ffffff" : "#d8eef8" }); }   // the bow wave
    if (cp.ev && A.lvl === 2 && u > .45 && !A.brecher) { A.brecher = 1; cp.shake = 1.2; cpBurst(shipW(0, 2.6, 1.6), 70, ["#ffffff", "#d8eef8", "#a8d0e8", "#6aa0c8"], 3, 9); dzNoise(1.2, 500, .6, .35, .02, .8); dzBuzz([100, 50, 100]); cpSay("Ein Brecher geht über das Vorschiff!"); }
    if (cp.ev && Math.random() < .3) { var sp2 = shipW((Math.random() - .5) * 3, 2.4, 1.2); cpBurst(sp2, 2, ["#ffffff", "#d8eef8"], 1.5, 4); }
    if (cpLeg().k === "abfahrt" && A.lvl === 2) { A.splash = 1; if (Math.random() < .8) { var qy = cp.py + 2 + Math.random() * 6; cpBurst([3.9, qy, 1.0], 3, ["#ffffff", "#d8eef8", "#a8d0e8"], 1.2, 5); if (!A.wet) { A.wet = 1; cpSay("Platsch! Die Bugwelle schwappt auf den Kai!"); } } }
    if (A.hit && !A.bumped && u >= A.hit.u) { A.bumped = 1; cp.hits++; cp.shake = 1.1; beep([[110, .14], [80, .2], [60, .25]]); dzNoise(.6, 300, .8, .3, .01, .4); dzBuzz([80, 40, 160]); cpSay(CP_HITS[A.hit.k] || "Rumms!");
      var hk = A.hit.k, sd1 = A.hit.sd || 0, cpt = hk === "quay" ? shipW(cpQuaySide() * 2.4, 1.2, 1.0) : shipW(Math.max(-1.5, Math.min(1.5, sd1 * .5)), 2.5, 1.0);
      cpBurst(cpt, 26, hk === "quay" || hk === "pier" ? ["#a89c88", "#6a625c", "#ffffff", "#d8eef8"] : hk === "ice" ? ["#ffffff", "#d8ecf8", "#a8c8dc"] : hk === "gate" || hk === "zone" ? ["#8a6a4a", "#c8a87a", "#ffffff"] : ["#8a5a32", "#3a2414", "#c8945a", "#ffffff", "#e8e0d0"], 3.5, 4);
      if (hk === "ice") { cp.deckIce = []; for (var di = 0; di < 9; di++) cp.deckIce.push([(Math.random() - .5) * 3, -1.2 + Math.random() * 3.2, .15 + Math.random() * .25]); cpBurst(shipW(0, 2.4, 3), 30, ["#ffffff", "#d8ecf8", "#a8c8dc"], 2.5, 5); setTimeout(function () { dzBell(3); }, 600); }
      if (hk === "gate" || hk === "zone") { cpBurst(cpt, 30, ["#6a5032", "#8a6a44", "#c8a87a"], 2.5, 3); var gl = shipW(0, 9, 1); cpBurst([gl[0], gl[1], 1.5], 10, ["#ffffff", "#fff8ec"], 2, 6); }
      if (/boat|pilot|tender|schooner/.test(hk)) { var sw = shipW(sd1 >= 0 ? 2.5 : -2.5, 3.5, 0); cpSwimmers(sw, hk === "tender" ? 3 : 2); }
      var ho = A.hit.j != null ? cp.O[A.hit.j] : cp.O.filter(function (o) { return o.leg === cp.leg && o.sw; })[0];
      if (ho && ho.sw) { ho.aK = cpSwA(ho); ho.kT = performance.now(); } else if (ho && !CP_STRUCT[hk]) { ho.kT = performance.now(); ho.kDir = sd1 >= 0 ? 1 : -1; }
      A.crash = { t0: t, d: cp.d, rec: !!CP_STRUCT[hk], hold: 1300, dur: CP_STRUCT[hk] ? 3200 : hk === "ship" ? 3000 : 1800 }; return; }
    if (u >= 1) { cp.O.forEach(function (o) { if (o.leg === cp.leg && o.sw) o.aEnd = cpSwA(o); });
      var hasSq = (!A.hit && A.lvl === 0 && cp.O.some(function (o) { return o.leg === cp.leg && o.sq; })) || cp.O.some(function (o) { return o.leg === cp.leg && o.sqAll; });   // something to watch: boats come alongside, guests come aboard
      if (hasSq) { A.seq = t + 250; A.seqV = 0; cp.O.forEach(function (o) { if (o.leg === cp.leg && o.sq) o.seqd = 1; }); } else A.hold = t + 900; }
  }
  function cpQuaySide() { var q = cp.O.filter(function (o) { return o.leg === cp.leg && o.k === "quay"; }).map(function (o) { return [Math.abs(o.x - cpRel(cp.anc[cp.leg].x, cp.anc[cp.leg].y, cp.anc[cp.leg].h, cp.px, cp.py)[1]), o.x]; }).sort(function (a, b) { return a[0] - b[0]; })[0]; return q && q[1] < 0 ? -1 : 1; }
  var CP_T = [2.2, 1.6, 1.0];   // hours a leg takes at Stopp, Halbe, Volle
  function cpSched() { var s0 = 0; for (var i = 0; i < cp.route.length; i++) s0 += CP_T[DZ_ORD[cp.route[i].o].l]; return s0 - 2.5; }
  function cpPlanSoFar(n) { var s0 = 0; for (var i = 0; i < n; i++) s0 += CP_T[cpNeedOf(i)]; return s0 - 2.5 * n / cp.route.length; }
  function cpClock() { var d = cpPlanSoFar(cp.leg) - (cp.tUsed || 0), v = Math.abs(d).toFixed(1).replace(".", ","); return Math.abs(d) < .05 ? "im Plan" : d > 0 ? v + " h vor dem Plan" : v + " h hinter dem Plan"; }
  function cpNext() {
    var A = cp.anim, L = cpLeg(), need = cpNeed(), why = "", inc = "", tt = CP_T[A.lvl], k = L.k, straight = [-2, -1, 0, 1, 2].filter(function (r) { return !cpSim(r, A.lvl); }).indexOf(0) >= 0 && !cp.O.some(function (o) { return o.leg === cp.leg && o.unk && o.hard; });
    if (A.hit) { why = CP_HITS[A.hit.k] || "Rumms!"; tt += 1; }
    else if (need === 0 && A.lvl > 0) { inc = k === "sos" ? "Wir sind vorbeigefahren, der Schoner bekam keine Hilfe." : k === "lotse" || k === "ambrose" ? "Ohne Halt konnte der Lotse nicht übersteigen." : k === "quar" ? "Die Ärzte kamen nicht an Bord, wir müssen später nochmal warten." : k === "cherbourg" || k === "queens" ? "Die Tender konnten nicht anlegen, die Gäste blieben an Land." : "Hier hätten wir halten müssen."; tt += .8; }
    else if (A.lvl === 2 && need === 1) {
      inc = cp.ev ? "Ein Brecher ging über das Vorschiff. Im Sturm war das zu schnell." : k === "abfahrt" ? "Die Bugwelle hat die Zuschauer am Kai nass gemacht." : k === "fischer" ? "Unsere Bugwelle hat die Fischerboote durchgeschüttelt, die Netze sind zerrissen." :
        k === "eiswarn" ? (cp.iceLuck ? "" : "Eine Scholle schrammt am Rumpf, das war knapp.") : k === "wale" ? "" : k === "liberty" ? "Unsere Wellen haben die kleinen Fähren tanzen lassen." : k === "ambrose" ? "Der Lotse kam bei der Fahrt kaum an Bord." : k.indexOf("nebel") === 0 ? "" : k === "solent" || k === "cherAus" || k === "queAus" ? "" : "";
      if (inc) tt += .3; }
    if (!A.hit && L.k.indexOf("nebel") === 0 && !cp.wh) { inc = inc || "Ohne Nebelsignal hat uns ein Fischerboot fast gerammt."; tt += .3; }
    if (!A.hit && A.rud !== 0 && straight) tt += .2;
    cp.tUsed = (cp.tUsed || 0) + tt; if (inc) cp.inc = (cp.inc || 0) + 1;
    if (!why && inc) why = inc;
    if (!why && A.lvl === 2 && k === "wale") cp.extraMsg = "Die Wale sind abgetaucht.";
    if (false) {
    } else if (false && A.lvl > need) why = cp.ev ? "Zu schnell im Sturm! Ein Brecher ging über das Vorschiff." : L.k === "wale" ? "Zu schnell! Die Wale sind erschrocken abgetaucht." : L.k === "abfahrt" && A.lvl === 2 ? "Viel zu schnell im Hafen! Die Bugwelle hat die Zuschauer am Kai nass gemacht." : L.k === "newyork" ? "Zu schnell! Die Mümmel kam uns gefährlich nah." : need === 0 ? "Hier hätten wir stoppen müssen!" : "Zu schnell für diese Stelle!";
    if (!why && L.wh && cp.wh && k.indexOf("nebel") !== 0) cpSay("Die Hamster an Land jubeln!");
    cp.O.forEach(function (o) { if (o.leg === cp.leg) o.dEnd = A.S; });
    var PL = A.useSafe ? A.safe : A.plan, dE = A.halt ? Math.max(0, cpDistU(A.lvl, A.S, A.hit.u) - .5) : A.S, fE = (PL.s0 + dE) / PL.D;
    if (fE < 1 && !A.halt && PL.b !== PL.a) cp.tr = { a: PL.a, b: PL.b, f: fE }; else cp.tr = null; cp.lat = A.halt || fE < 1 ? cpLatAt(PL, dE) : PL.b; if (!cp.tr && !A.halt) cp.lat = Math.round(cp.lat / CP_LW) * CP_LW;
    cp.vps = A.halt ? 0 : A.lvl ? cpV1(A.lvl, A.S) / (A.dur / 1000) : 0; cp.lastLvl = A.lvl;
    cp.res[cp.leg] = !why; cp.pre = (why ? "✘ " + why : (L.d ? "✔ " + L.d : "✔")) + " (" + String(tt.toFixed(1)).replace(".", ",") + " h)";
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
  var cpRingD = null;
  cpCv.addEventListener("pointermove", function (e) { if (cpRingD && cp && cp.glass) { var pr = cpPt(e), an = Math.atan2(pr[1] - 64, pr[0] - 114), da = an - cpRingD.a0; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; cpRingD.a0 = an;
      var nf = Math.max(3, Math.min(70, cp.glass.foc + da * 9)); if (Math.floor(nf / 2) !== Math.floor(cp.glass.foc / 2)) beep([[700 + nf * 4, .01]]); cp.glass.foc = nf; return; }
    if (cpPan && cp && cp.glass) { var pq = cpPt(e); cp.glass.yaw = Math.max(-1.5, Math.min(1.5, cpPan.y0 - (pq[0] - cpPan.x) / 480)); return; } if (cpTelD && cp) { cpTelSet(cpPt(e)); return; } if (!cpWheel || !cp) return; var p = cpPt(e), a = Math.atan2(p[1] - CP_WHC[1], p[0] - CP_WHC[0]), d = a - cpWheel.a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    cp.wheelA = Math.max(-1.1, Math.min(1.1, cpWheel.r0 * .45 + d)); var ln = cpLaneNow(), r = Math.max(-1 - ln, Math.min(1 - ln, Math.round(cp.wheelA / .45))); if (cp.tr) r = 0; if (r !== cp.rud) { cp.rud = r; beep([[300 + r * 40, .02]]); cpPanelDraw(); } cpRedraw(); });
  var cpTelD = 0; function cpTelSet(pp) { var ta = Math.atan2(pp[1] - CP_TELC[1], pp[0] - CP_TELC[0]) * 180 / Math.PI, best = 1, bd2 = 999; CP_TEL.forEach(function (a, i) { var dd = Math.abs(ta - a); if (dd < bd2) { bd2 = dd; best = i; } }); if (pp[1] > CP_TELC[1] + 3) best = pp[0] < CP_TELC[0] - 5 ? 0 : pp[0] > CP_TELC[0] + 5 ? 2 : 1; cpSetLvl(best); }
  function cpWheelUp() { cpTelD = 0; cpPan = null; if (cpRingD && cp && cp.glass) cp.glass.ring = 0; cpRingD = null; if (!cpWheel || !cp) return; cpWheel = null; cp.wheelA = null; cpRedraw(); }
  cpCv.addEventListener("pointerup", cpWheelUp); cpCv.addEventListener("pointercancel", cpWheelUp);
  cpCv.addEventListener("pointerdown", function (e) {
    if (!cp || cp.anim || cp.intro || cp.done) return; e.preventDefault();
    var pp = cpPt(e);
    if (cp.glass) { var rd = Math.hypot(pp[0] - 114, pp[1] - 64);
      if (rd > 38 && rd < 62 && Math.hypot(pp[0] - 66, pp[1] - 64) > 40) { cpRingD = { a0: Math.atan2(pp[1] - 64, pp[0] - 114), f0: cp.glass.foc }; cp.glass.ring = 1; } else cpPan = { x: pp[0], y0: cp.glass.yaw };
      try { cpCv.setPointerCapture(e.pointerId); } catch (er) { } return; }
    if (Math.hypot(pp[0] - CP_TELC[0], pp[1] - CP_TELC[1]) < CP_TELR + 8) { cpTelD = 1; cpTelSet(pp); try { cpCv.setPointerCapture(e.pointerId); } catch (er) { } return; }
    if (Math.hypot(pp[0] - CP_WHC[0], pp[1] - CP_WHC[1]) < 42) { cpWheel = { a0: Math.atan2(pp[1] - CP_WHC[1], pp[0] - CP_WHC[0]), r0: cp.rud }; try { cpCv.setPointerCapture(e.pointerId); } catch (er) { } return; }
    if (false) { var ta = Math.atan2(pp[1] - 101, pp[0] - 30) * 180 / Math.PI, best = 1, bd2 = 999; CP_TEL.forEach(function (a, i) { var dd = Math.abs(ta - a); if (dd < bd2) { bd2 = dd; best = i; } }); if (pp[1] > 104) best = pp[0] < 26 ? 0 : pp[0] > 34 ? 2 : 1; cpSetLvl(best); return; }
    if (pp[0] > 160 && pp[1] > 84 && pp[1] < 114) { cp.wh = !cp.wh; if (cp.wh) dzWhistle(.8); else beep([[300, .03]]); cpPanelDraw(); cpRedraw(); return; }
    var x = pp[0], y = pp[1], best2 = null, bd = 99;
    cp.O.forEach(function (o) { if (o.hid || o.seen || o.k === "quay" || o.k === "pier") return; if (o.so || o.leg !== cp.leg) return; var q = cpWP(o), p = cpProj(q[0], q[1]); if (!p || p.f > 70 || !cpHidden(o, p.f)) return; if (o.ani && p.f < 18) return; var d = Math.hypot(p.x - x, (p.y - 5 - y) * 1.4); if (d < bd) { bd = d; best2 = o; } });
    if (!best2 || bd > 16) return;
    var q2 = cpWP(best2), rr = cpRel(cp.px, cp.py, cp.h, q2[0], q2[1]); cpGlass(true, Math.atan2(rr[1], rr[0]));   // tapping a "?" puts the glasses up, pointed at it
  });
  // ---- the panel: the leg, the timetable strip, what is going on, the telegraph buttons, the glasses, "Los!" ----
  // ---- the panel, laid out like the stoker's: the timetable strip, one message box with today's orders, and "Los!" ----
  var cpGlBtn = document.createElement("button"); cpGlBtn.type = "button"; cpGlBtn.className = "cap-glbtn"; cpGlBtn.setAttribute("aria-label", "Fernglas"); cpEl.appendChild(cpGlBtn);
  (function () { var c = document.createElement("canvas"); c.width = 16; c.height = 11; var g = c.getContext("2d"), R = function (x, y, w, h, k) { g.fillStyle = k; g.fillRect(x, y, w, h); };
    [1, 9].forEach(function (x) { R(x, 2, 6, 8, "#2a1a10"); R(x + 1, 3, 4, 6, "#4a3a3a"); R(x + 1, 3, 2, 5, "#6a5a5a"); R(x, 9, 6, 2, "#2a1a10"); R(x + 1, 9, 4, 1, "#a8c8e0"); R(x + 1, 0, 4, 3, "#2a1a10"); R(x + 2, 1, 2, 1, "#c8a040"); });
    R(7, 4, 2, 3, "#2a1a10"); R(7, 5, 2, 1, "#c8a040"); cpGlBtn.style.backgroundImage = "url(" + c.toDataURL() + ")"; })();
  cpGlBtn.addEventListener("click", function (e) { e.stopPropagation(); if (!cp || cp.anim || cp.intro || cp.done) return; cpGlass(!cp.glass, 0); });
  function cpPanelDraw() {
    if (!cp) return; var L = cpLeg(), busy = !!cp.anim, n = cp.route.length, a = Math.max(0, Math.min(n - 7, cp.leg - 2)), strip = "";
    for (var i = a; i < a + 7 && i < n; i++) { var Li = cp.route[i], evi = cp.info[i] && cp.info[i].ev, o = evi ? "halb" : Li.o, st = i < cp.leg ? (cp.res[i] ? " ok" : " bad") : i === cp.leg ? " cur" : "", ic = evi ? "sturm" : DZ_RI[Li.s];
      strip += '<b class="dz-t o-cap' + st + (evi ? " ev" : "") + '"><img src="' + DZ["ri_" + ic] + '" alt=""></b>'; }
    var tx = cp.ev ? '<span class="dz-ev">Funkspruch: Ein Sturm zieht auf! Bei dem Seegang lieber langsamer.</span>' : (CP_TX[L.k] || L.i) + cp.extra, ord = "";
    var tipNow = cp.tipLeg === cp.leg;
    if (!busy && !cp.intro && !cp.done && tipNow) { var need = cpNeed(), oks = [-2, -1, 0, 1, 2].filter(function (r) { return !cpSim(r, need); }), ln0 = cpLaneNow(), lanes = oks.map(function (r) { return cpTarget(r); }).filter(function (v, i, a) { return a.indexOf(v) === i; }), rudTxt = cp.tr ? "Spur wechselt noch" : lanes.indexOf(ln0) >= 0 ? "Spur halten" : lanes.length ? "→ " + ["linke", "mittlere", "rechte"][lanes.sort(function (a, b) { return Math.abs(a - ln0) - Math.abs(b - ln0); })[0] + 1] + " Spur" : "Spur wechseln";
      var okSp = cp.lvl === need, okR = !cpSim(cp.rud, cp.lvl), okW = !L.wh || cp.wh;
      ord = '<span class="cap-order"><button type="button" data-l="' + need + '" class="ch l' + need + (okSp ? " ok" : "") + '">' + ["Stopp", "Halbe", "Volle"][need] + '</button><span class="ch rd' + (okR ? " ok" : "") + '">' + rudTxt + '</span>' + (L.wh ? '<button type="button" class="ch wh' + (okW ? " ok" : "") + '">Pfeife</button>' : "") + '</span>'; }
    var h = '<div class="dz-plan">' + strip + '</div>';
    if (cp.glass) h += '<div class="dz-row"><div class="dz-msg">Zum Umsehen ziehen · am Ring des rechten Glases drehen, bis die beiden Hälften in der Mitte zusammenpassen</div><button type="button" class="dz-go cap-glx">Zurück</button></div>';
    var foot = '<span class="cap-foot"><span class="cap-clock">⏱ ' + cpClock() + '</span>' + (!busy && !cp.intro && !cp.done && !tipNow ? '<button type="button" class="ch cap-tip"' + (cp.tips > 0 ? "" : " disabled") + '>Offizier fragen ' + "●".repeat(cp.tips) + "○".repeat(3 - cp.tips) + '</button>' : "") + '</span>';
    if (!cp.glass) h += '<div class="dz-row"><div class="dz-msg cap-msg2">' + (cp.pre ? '<span class="dz-d">' + cp.pre + '</span> ' : "") + tx + (tipNow ? '<span class="cap-tipsay">Erster Offizier: „Ich würde so fahren:“</span>' : "") + ord + foot + '</div><button type="button" class="dz-go cap-go"' + (busy ? " disabled" : "") + '>Los!</button></div>';
    cpPanel.innerHTML = h; cpGlBtn.hidden = !!(busy || cp.intro || cp.done); cpGlBtn.classList.toggle("on", !!cp.glass);
  }
  cpPanel.addEventListener("input", function (e) { if (e.target.classList.contains("cap-foc") && cp && cp.glass) cp.glass.foc = +e.target.value; });
  cpPanel.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b || !cp || cp.anim || cp.intro || cp.done) return; e.stopPropagation();
    if (b.dataset.l != null) { cpSetLvl(+b.dataset.l); return; }
    if (b.classList.contains("cap-tip")) { if (cp.tips > 0) { cp.tips--; cp.tipLeg = cp.leg; beep([[660, .05], [880, .06]]); cpPanelDraw(); } return; }
    if (b.classList.contains("wh")) { cp.wh = !cp.wh; if (cp.wh) dzWhistle(.8); cpPanelDraw(); cpRedraw(); return; }
    if (b.classList.contains("cap-glx")) { cpGlass(false); return; }
    if (b.classList.contains("cap-go")) cpGo();
  });
  // ---- cards: the start, the end ----
  function cpIntro() {
    cp.intro = true;
    cpCard.innerHTML = '<div class="fi-c dz-intro"><p class="fi-h">Kapitän der Pausbacke</p><p class="dz-route">Southamsterton → Nuss York · ' + cp.route.length + ' Etappen</p>' +
      '<p class="fi-s">Du bist der Kapitän: Fahrt am Telegrafen, Spur am Steuerrad (links, Mitte, rechts), Pfeife am Griff. Bei Volle Fahrt dauert ein Spurwechsel bis in den nächsten Abschnitt. Der Fahrplan ist knapp: Volle Fahrt spart Zeit, aber nicht überall ist das klug. Was voraus treibt, zeigt dir das Fernglas. Dreimal darfst du den Ersten Offizier fragen.</p>' +
      '<p class="fi-s">★ Keine Unfälle<br>★ Pünktlich in Nuss York<br>★ 4 Tiere und Funde im Fernglas</p>' +
      '<div class="fi-row"><button type="button" class="fi-b" data-a="go">Leinen los!</button></div></div>';
    cpCard.hidden = false;
  }
  function cpEnd() {
    cp.done = true; var okN = cp.res.filter(Boolean).length, late = (cp.tUsed || 0) - cpPlanSoFar(cp.route.length), st = [cp.hits === 0 && !cp.inc, late <= .05, cp.found.length >= 4], n = st.filter(Boolean).length, LG = cpLog();
    var book = CP_ANI.map(function (k) { return '<span class="' + (LG[k] ? (cp.newF.indexOf(k) >= 0 ? "nw" : "") : "no") + '">' + (LG[k] ? CP_NAME[k] : "?") + '</span>'; }).join("");
    cpCard.innerHTML = '<div class="fi-c dz-intro"><p class="fi-h">' + (n === 3 ? "Triumphale Ankunft!" : "Angekommen in Nuss York") + '</p><p class="dz-route">' + "★".repeat(n) + "☆".repeat(3 - n) + '</p>' +
      '<p class="fi-s">' + (st[0] ? "★" : "☆") + " Keine Unfälle" + (cp.hits || cp.inc ? " (" + (cp.hits + (cp.inc || 0)) + "×)" : "") + '<br>' + (st[1] ? "★" : "☆") + (late <= .05 ? " Pünktlich" + (late < -1.95 ? ", sogar " + String((-late).toFixed(1)).replace(".", ",") + " h zu früh! Das Blaue Band!" : "") : " " + String(late.toFixed(1)).replace(".", ",") + " h Verspätung") + '<br>' + (st[2] ? "★" : "☆") + " " + cp.found.length + " gesichtet</p>" +
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
  var _cpWD = cpWorldDraw; cpWorldDraw = function (t, g) { var sk = cpSky(), C = CP_SEA[sk] || CP_SEA.day; cpHazeC = C[0][1]; cpGradOn = 1; try { _cpWD(t, g); } finally { cpHazeC = null; cpGradOn = 0; } };
  window.__capRoute = function () { return cp && cp.route.map(function (L) { return L.k; }); };
  window.__capFoc = function () { return cp && cp.glass ? cp.glass.foc : null; };
  window.__cap = { open: function () { return capGame(); },
    mat: function () { var m = {}; [0, 1, 2].forEach(function (l) { m[l] = [-1, 0, 1].map(function (L) { var r = L - cpLaneNow(), h = cpSim(r, l); return h ? h.k : (cp.tr ? 'tr' : '.'); }).join(' '); }); m.lane = cpLaneNow(); m.tr = !!cp.tr; m.k = cpLeg().k; return m; },
    gallery2: function (ks) { cp.O = cp.O.filter(function (o) { return !o.gal; }); var H = cp.h; ks.forEach(function (k, i) { var lx = (i - 1) * 6.5, ly = 15, W = [cp.px + lx * Math.cos(H) + ly * Math.sin(H), cp.py - lx * Math.sin(H) + ly * Math.cos(H)], A = cp.anc[cp.leg], r = cpRel(A.x, A.y, A.h, W[0], W[1]); cp.O.push({ k: k, x: r[1], y: r[0], leg: cp.leg, seen: true, r: 2.6, gal: 1, a: .9 }); }); cpRedraw(); },
    gallery: function (ks, y0) { (ks || ["ship", "tug", "pilot", "tender", "boat", "schooner", "light", "dinghy", "wood", "floe", "tower", "buoyR", "buoyG"]).forEach(function (k, i) { var o = { k: k, x: (i - 6) * 4.2, y: (y0 || 20) + (i % 3) * 3, leg: cp.leg, seen: true, r: 2.6 }; if (k === "ship") o.big = 0; cp.O.push(o); }); cpRedraw(); },
    storm: function () { cp.info[cp.leg].ev = "sturm"; cp.ev = "sturm"; cpPanelDraw(); cpRedraw(); },
    bv: function (v) { CP_BV = v; cpRedraw(); },
    pose: function (x, y, h) { cp.px = x; cp.py = y; cp.h = h; cpRedraw(); },
    ani: function () { var r = null; cp.O.forEach(function (o) { if (r || !o.ani || o.seen || o.leg !== cp.leg) return; var q = cpWP(o), rr = cpRel(cp.px, cp.py, cp.h, q[0], q[1]); r = { yaw: Math.atan2(rr[1], rr[0]), f: rr[0], k: o.k }; }); return r; },
    glass: function (y, f) { cpGlass(true, y); cp.glass.foc = f; },
    set: function (o) { if (!cp || cp.anim) return; if (o.rud != null) cp.rud = o.rud; if (o.lvl != null) cp.lvl = o.lvl; if (o.wh != null) cp.wh = o.wh; cpPanelDraw(); cpRedraw(); },
    solve: function () { var need = cpNeed(); for (var r of [0, -1, 1, -2, 2]) if (!cpSim(r, need)) return { rud: r, lvl: need, wh: !!cpLeg().wh }; return { rud: 0, lvl: need, wh: !!cpLeg().wh, fail: 1 }; },
    st: function () { return cp && { leg: cp.leg, n: cp.route.length, key: cpLeg().k, lvl: cp.lvl, rud: cp.rud, wh: cp.wh, hits: cp.hits, res: cp.res.slice(), found: cp.found.slice(), done: cp.done, intro: cp.intro, anim: !!cp.anim, ev: cp.ev, sky: cpSky(), sky2: cpSky(cp.leg + 1), s: cpLeg().s }; } };
