  // ===================== the stoker of the MS Pausbacke (preview, turn based) =====================
  // The maiden voyage after the real route of 1912: Southamsterton, Schnüffelbourg, Backentown, across the Atlantic to Nuss York.
  // Every leg has an order from the bridge (stop, half or full ahead), some need the steam whistle. The player plans each leg in peace:
  // shovels of coal, the red wheel (closed / half / full), the blow-off lever, pump strokes, the whistle cord, the low-pressure turbine.
  // A ghost needle shows where the pressure will end up. "Los!" runs the leg: first the engine room, then the ship outside.
  // Embers halve every leg, shovels add to them, the embers make pressure. Half ahead uses 2, full ahead 4 (3 with the turbine);
  // the turbine may only run at full ahead. The lever lets off 3, a pump stroke brings 3 water and costs 1, the whistle costs 1.
  // Above 10 the safety valve blows. Feedback is the camera: a little nudge whenever something clicks into place.
  var DZ = /*STEAMART*/;
  var DZI = {}; Object.keys(DZ).forEach(function (k) { var im = new Image(); im.src = DZ[k]; DZI[k] = im; });
  var dzEl = xEl("div", "bee-pov fi-pov dz-pov", scene); dzEl.hidden = true;
  dzEl.innerHTML = '<canvas width="240" height="175" class="fi-cv dz-main"></canvas><div class="fi-card" hidden></div><button type="button" class="bp-x" aria-label="Maschinenraum verlassen">×</button>';
  var dzCv = dzEl.querySelector(".fi-cv"), dzc = dzCv.getContext("2d"); dzc.imageSmoothingEnabled = false;
  var dzCard = dzEl.querySelector(".fi-card");
  // two transparent layers over the scene for the storm: the ship on its own canvas, rolled by CSS at screen resolution, and what lies in front of it
  function dzLayer() { var c = document.createElement("canvas"); c.width = 180; c.height = 135; c.className = "fi-cv dz-layer"; dzCv.parentNode.insertBefore(c, dzCv.nextSibling); var x = c.getContext("2d"); x.imageSmoothingEnabled = false; return x; }
  var dzFrontC = dzLayer(), dzShipC = dzLayer(), dzShipCv = dzShipC.canvas, dzFrontCv = dzFrontC.canvas;
  var dzPanel = document.createElement("div"); dzPanel.className = "dz-panel";
  dzPanel.innerHTML = '<div class="dz-plan"></div><div class="dz-row"><p class="dz-msg"></p><button type="button" class="dz-go">Los!</button></div>';
  scene.parentNode.insertBefore(dzPanel, scene.nextSibling);
  var dzMsg = dzPanel.querySelector(".dz-msg"), dzPlanEl = dzPanel.querySelector(".dz-plan"), dzGo = dzPanel.querySelector(".dz-go");
  function dzBanner(t) { if (dzMsg.textContent === t) return; dzMsg.textContent = t; dzMsg.classList.remove("pop"); void dzMsg.offsetWidth; if (t) dzMsg.classList.add("pop"); }
  // the ship's steam whistle: a three-chime chord with a breathy attack, through the game's audio context
  function dzWhistle(dur) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume();
      var t0 = actx.currentTime + .02, out = actx.createGain(), lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1400; lp.connect(out); out.connect(actx.destination);
      out.gain.setValueAtTime(0, t0); out.gain.linearRampToValueAtTime(.22, t0 + .12); out.gain.setValueAtTime(.22, t0 + dur - .2); out.gain.linearRampToValueAtTime(0, t0 + dur);
      [155.6, 196, 233.1].forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain(), vib = actx.createOscillator(), vg = actx.createGain(); o.type = i ? "triangle" : "sawtooth";
        o.frequency.setValueAtTime(f * .94, t0); o.frequency.linearRampToValueAtTime(f, t0 + .15); vib.frequency.value = 5 + i; vg.gain.value = 1.5; vib.connect(vg); vg.connect(o.frequency);
        g.gain.value = i ? .5 : .25; o.connect(g); g.connect(lp); o.start(t0); vib.start(t0); o.stop(t0 + dur + .05); vib.stop(t0 + dur + .05);
      });
      var n = actx.createBufferSource(), buf = actx.createBuffer(1, actx.sampleRate * dur, actx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * .25;
      var bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 900; bp.Q.value = .8; n.buffer = buf; n.connect(bp); bp.connect(out); n.start(t0);
    } catch (e) {}
  }
  // more sounds: filtered noise for hiss and steam, the telegraph bell, the engine's beat
  function dzAC() { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); return actx; }
  function dzNoise(dur, f, q, g, att, rel, at) {
    try { var A = dzAC(), t0 = A.currentTime + .02 + (at || 0), n = A.createBufferSource(), buf = A.createBuffer(1, Math.max(1, A.sampleRate * dur), A.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      var bp = A.createBiquadFilter(), gn = A.createGain(); bp.type = "bandpass"; bp.frequency.value = f; bp.Q.value = q; n.buffer = buf;
      gn.gain.setValueAtTime(0, t0); gn.gain.linearRampToValueAtTime(g, t0 + (att || .02)); gn.gain.setValueAtTime(g, t0 + Math.max(att || .02, dur - (rel || .1))); gn.gain.linearRampToValueAtTime(0, t0 + dur);
      n.connect(bp); bp.connect(gn); gn.connect(A.destination); n.start(t0); n.stop(t0 + dur + .05); } catch (e) {}
  }
  function dzTone(f, dur, g, type, at, f2) {
    try { var A = dzAC(), t0 = A.currentTime + .02 + (at || 0), o = A.createOscillator(), gn = A.createGain(); o.type = type || "sine"; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
      gn.gain.setValueAtTime(g, t0); gn.gain.exponentialRampToValueAtTime(.001, t0 + dur); o.connect(gn); gn.connect(A.destination); o.start(t0); o.stop(t0 + dur + .02); } catch (e) {}
  }
  function dzBell(n) { for (var i = 0; i < n; i++) { dzTone(1650, .5, .12, "sine", i * .26); dzTone(2470, .3, .05, "sine", i * .26); dzTone(4120, .12, .03, "sine", i * .26); } }   // engine telegraph bell
  function dzClunk() { dzTone(90, .18, .25, "triangle", 0, 50); dzNoise(.08, 900, 1.5, .12, .005, .05); }
  function dzHiss(dur, loud) { dzNoise(dur, 2800, .6, loud || .14, .05, .3); dzNoise(dur, 5200, .9, (loud || .14) * .5, .05, .3); }
  function dzEngine(lvl, dur, at) {                                                             // the reciprocating engines' beat: slow at half, fast at full, a winding-down sigh at stop
    if (!lvl) { dzNoise(.9, 700, .7, .08, .02, .6, at); dzTone(70, .8, .12, "triangle", at, 40); return; }
    var step = lvl === 2 ? .23 : .42;
    for (var k = 0, tt = 0; tt < dur; k++, tt += step) { dzTone(58, .16, .22, "triangle", (at || 0) + tt, 44); dzNoise(.07, k % 2 ? 1300 : 1000, 2, .07, .005, .05, (at || 0) + tt + .04); }
    if (lvl === 2) dzTone(420, dur, .015, "sawtooth", at, 460);                                  // the turbine's whine at full ahead
  }
  function dzToot(hi) { dzTone(hi ? 520 : 330, .5, .08, "sawtooth"); dzTone(hi ? 780 : 494, .5, .05, "triangle"); dzNoise(.5, 1200, .8, .05, .05, .2); }   // a small steamer's whistle
  function dzBuzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }
  function dzShake(s) { if (dz) dz.shk = Math.max(dz.shk || 0, s); }
  function dzNudge(x, y) { if (dz) { dz.cam.x += x; dz.cam.y += y; } }                         // the camera bumps and springs back
  function dzSparks(x, y, n, cols) { for (var i = 0; i < n; i++) dz.sparks.push({ x: x, y: y, vx: (Math.random() - .5) * 70, vy: -20 - Math.random() * 50, life: .5 + Math.random() * .5, c: (cols || ["#fff1a8", "#f6a040", "#ffd34a"])[i % 3] }); }
  function dzSparkDraw(dt) { dz.sparks = dz.sparks.filter(function (p) { p.life -= dt; p.vy += 120 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.life > 0) DR(p.x, p.y, 1, 1, p.c); return p.life > 0; }); }
  function DR(x, y, w, h, c) { dzc.fillStyle = c; dzc.fillRect(Math.round(x), Math.round(y), w, h); }
  // an image the phone dropped (complete but no pixels) is loaded again instead of breaking the drawing
  var dzReload = {};
  function dzOk(im, k) {
    if (!im || !im.complete) return false;
    if (im.naturalWidth > 0) return true;
    if (k && (!dzReload[k] || Date.now() - dzReload[k] > 2000)) { dzReload[k] = Date.now(); im.src = DZ[k]; }
    return false;
  }
  function dzImg(k, x, y) { var im = DZI[k]; if (dzOk(im, k)) try { dzc.drawImage(im, Math.round(x), Math.round(y)); } catch (e) {} }
  function dzLine(x0, y0, x1, y1, c) { var n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); for (var i = 0; i <= n; i++) DR(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 1, 1, c); }
  var DZW = { red: { y: 26, c: "#d8463c" }, yellow: { y: 67 }, blue: { y: 108 } };
  var DZ_WX = 150, DZ_AL = 133, DZ_AR = 168;
  var DZ_FIRE = { x0: 60, y0: 62, x1: 110, y1: 102 }, DZ_COAL = [{ x0: 44, y0: 96, x1: 82, y1: 135 }, { x0: 14, y0: 96, x1: 52, y1: 135 }], DZ_GAUGE = { x: 80, y: 32 }, DZ_GLASS = { x: 106, y0: 22, y1: 54 };
  var DZ_CROW = { x0: 82, y0: 104, x1: 128, y1: 122 }, DZ_DMPR = { x0: 60, y0: 50, x1: 108, y1: 61 }, DZ_DROW = { x0: 128, y0: 122, x1: 180, y1: 135 };
  var DZ_CORD = { x0: 110, y0: 0, x1: 125, y1: 22 }, DZ_TURB = { x0: 110, y0: 58, x1: 125, y1: 100 };
  var DZ_TGX = 40, DZ_TGY = 28;
  var DZ_ORD = { stopp: { n: "Stopp", l: 0 }, halb: { n: "Halbe Fahrt", l: 1 }, voll: { n: "Volle Fahrt", l: 2 } };
  var DZ_LVN = ["Stopp", "Halbe Fahrt", "Volle Fahrt"];
  // the route of April 1912; s = what is outside, i = the bridge's note when the leg comes up
  // every voyage is rolled anew from three pools: in and out of the harbours, the open Atlantic, the arrival at Nuss York.
  // n name, s what is outside, o the bridge's order, wh steam whistle needed, i the bridge's note, d what the story says afterwards
  var DZ_P = {
    abfahrt: { n: "Southamsterton", s: "abfahrt", o: "halb", wh: 1, i: "Southamsterton, 10. April, Mittag: Leinen los! Drei lange Töne mit der Dampfpfeife, dann Halbe Fahrt.", d: "Schlepper ziehen die Pausbacke aus dem Nussdock, Hunderte winken am Kai." },
    newyork: { n: "Die Mümmel", s: "newyork", o: "stopp", i: "Der Sog der Pausbacke reißt die Mümmel von ihren Leinen! Sie treibt heran: Stopp!", d: "Knapp! Nur gut ein Meter fehlte. Schlepper fangen die Mümmel ein, eine Stunde Verspätung." },
    solent: { n: "Kernsund", s: "kueste", o: "halb", i: "Durch den Kernsund an der Isle of Weizen vorbei. Halbe Fahrt.", d: "Die Isle of Weizen zieht vorbei, die Gäste erkunden das Schiff." },
    lotse: { n: "Lotse von Bord", s: "lotse", o: "stopp", i: "Beim Feuerschiff Knabber geht der Lotse aus Southamsterton von Bord. Kurz Stopp.", d: "Das Lotsenboot dreht ab, jetzt führt Kapitän Schmatz allein." },
    kanal: { n: "Pfotenkanal", s: "see", o: "voll", i: "Offenes Wasser im Pfotenkanal: Volle Fahrt. Bei voller Fahrt spart die Turbine Dampf.", d: "Mit voller Kraft über den Kanal nach Frankreich." },
    fischer: { n: "Fischerboote", s: "fischer", o: "halb", i: "Eine Flotte knabberbretonischer Fischerboote liegt im Weg. Halbe Fahrt und vorsichtig vorbei.", d: "Die Fischer winken mit ihren Mützen." },
    cherbourg: { n: "Schnüffelbourg", s: "reede", o: "stopp", i: "Schnüffelbourg am Abend: Die Pausbacke ankert auf der Reede, die Tender Nagadic und Trappel bringen Gäste. Stopp.", d: "Die Tender legen an. Unter den neuen Gästen: Margaret Braunpfote und John Jacob Astnuss." },
    cherAus: { n: "Ausfahrt", s: "kueste", o: "halb", wh: 1, i: "Anker auf! Mit der Pfeife verabschieden und Halbe Fahrt aus der Reede.", d: "Die Lichter von Schnüffelbourg werden kleiner." },
    irisch: { n: "Irische Knuspersee", s: "see", o: "voll", i: "Nachts über die Irische Knuspersee nach Backentown: Volle Fahrt.", d: "Eine ruhige Nacht. Unten schaufeln die Heizer in Wachen von vier Stunden." },
    queens: { n: "Backentown", s: "reede", o: "stopp", i: "Backentown, 11. April: Wieder auf der Reede, die Tender Amerikorn und Irischkorn kommen längsseits. Stopp.", d: "Postsäcke und knusperländische Auswanderer kommen an Bord." },
    queAus: { n: "Ausfahrt", s: "fastnet", o: "halb", wh: 1, i: "Vorbei am Leuchtturm Fastnuss hinaus aufs Meer. Pfeife und Halbe Fahrt.", d: "Ein letzter Blick auf Knusperland, dann nur noch Wasser." },
    see1: { n: "Hamslantik", s: "see", o: "voll", i: "Der Hamslantik! Jetzt geht es westwärts: Volle Fahrt.", d: "Die Kessel fressen jeden Tag Hunderte Tonnen Kohle." },
    see2: { n: "Hamslantik", s: "see", o: "voll", i: "Ruhige See, alle Kessel arbeiten. Volle Fahrt.", d: "Oben wird im Speisesaal diniert, unten ist es heiß wie im Backofen." },
    see3: { n: "Hamslantik", s: "see", o: "voll", i: "Weiter westwärts mit Volldampf.", d: "Im Rauchsalon spielt man Karten, im Heizraum fliegt die Kohle." },
    nebel1: { n: "Nebelbank", s: "nebel", o: "halb", wh: 1, i: "Nebel über der Neufutterlandbank! Halbe Fahrt, und die Pfeife warnt andere Schiffe.", d: "Das Nebelhorn hallt über das Wasser." },
    nebel2: { n: "Im Nebel", s: "nebel", o: "halb", wh: 1, i: "Noch immer Nebel. Weiter Halbe Fahrt mit Nebelsignal.", d: "Vorsichtig tastet sich die Pausbacke voran." },
    klar: { n: "Klare Sicht", s: "see", o: "voll", i: "Der Nebel lichtet sich: wieder Volle Fahrt.", d: "Die Sonne kommt durch, die See glitzert." },
    eiswarn: { n: "Eiswarnung", s: "eiswarn", o: "halb", i: "14. April, Funkspruch der Karottonia: Eis voraus! Die Brücke lässt langsamer fahren: Halbe Fahrt.", d: "Im Funkraum stapeln sich die Eiswarnungen." },
    eis: { n: "Eisberg!", s: "eis", o: "stopp", i: "23:40 Uhr, der Ausguck läutet dreimal: Eisberg voraus! Stopp, Maschinen stopp!", d: "Der Eisberg gleitet nur wenige Meter vorbei. Alle atmen auf!" },
    morgen: { n: "Morgengrauen", s: "morgen", o: "voll", i: "Geschafft, der Eisberg zieht vorbei. Im Morgengrauen wieder Volle Fahrt.", d: "Ein neuer Tag. An Deck erzählt man sich vom Eisberg." },
    wale: { n: "Wale!", s: "wale", o: "halb", i: "Finnwale kreuzen den Kurs! Halbe Fahrt, damit sie Platz haben.", d: "Die Gäste drängen sich an der Reling und zählen die Fontänen." },
    sos: { n: "Notsignal", s: "sos", o: "stopp", i: "Ein Fischerschoner von der Neufutterlandbank zeigt Notflaggen! Stopp, ein Rettungsboot fährt hinüber.", d: "Zwei durchnässte Fischer werden an Bord geholt und bekommen heißen Tee." },
    gruss: { n: "Die Backentasche", s: "gruss", o: "voll", wh: 1, i: "Am Horizont die Backentasche, das Schwesterschiff, auf dem Weg nach Europa! Gruß mit der Dampfpfeife, Volle Fahrt.", d: "Die Backentasche antwortet mit drei tiefen Tönen." },
    ambrose: { n: "Feuerschiff", s: "feuerschiff", o: "halb", i: "Das Feuerschiff Ambrösel vor Nuss York: Der Lotse kommt an Bord. Halbe Fahrt.", d: "Der Lotse steht auf der Brücke, Nuss York ist nah." },
    quar: { n: "Quarantäne", s: "quar", o: "stopp", i: "Vor Futter Island: Die Ärzte der Quarantänestation kommen an Bord. Stopp.", d: "Alle gesund! Die Ärzte geben den Weg frei." },
    liberty: { n: "Freiheitshamsterin", s: "liberty", o: "halb", wh: 1, i: "Die Freiheitshamsterin! Die Auswanderer jubeln an Deck. Ein Gruß mit der Pfeife, Halbe Fahrt.", d: "Viele sehen Amerika zum ersten Mal." },
    pier: { n: "Körnerpier 59", s: "ny", o: "stopp", wh: 1, i: "Schlepper drücken die Pausbacke an den Körnerpier 59. Pfeife zur Begrüßung, dann Stopp.", d: "" }
  };
  function dzShuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function dzRoute() {
    var R = function (k) { return Object.assign({ k: k }, DZ_P[k]); }, r = [R("abfahrt")], rnd = Math.random;
    // leaving: Southamsterton, maybe the near miss, the Kernsund or the pilot, the Channel (maybe fishing boats), Schnüffelbourg, Backentown
    if (rnd() < .6) r.push(R("newyork"));
    r.push(R(rnd() < .5 ? "solent" : "lotse")); r.push(R("kanal")); if (rnd() < .4) r.push(R("fischer"));
    r.push(R("cherbourg"), R("cherAus"));
    if (rnd() < .5) r.push(R("irisch")); r.push(R("queens"), R("queAus"));
    // the open Atlantic: shuffled blocks, the iceberg always in the second half
    var seas = dzShuffle(["see1", "see2", "see3"]), blocks = [[seas[0]], [seas[1]], ["nebel1"].concat(rnd() < .5 ? ["nebel2"] : [], ["klar"])];
    dzShuffle(["wale", "sos", "gruss"]).slice(0, 2).forEach(function (k) { blocks.push([k]); });
    if (rnd() < .5) blocks.push([seas[2]]);
    dzShuffle(blocks); blocks.splice(Math.min(blocks.length, Math.ceil(blocks.length / 2) + Math.floor(rnd() * 2)), 0, ["eiswarn", "eis", "morgen"]);
    blocks.forEach(function (b) { b.forEach(function (k) { r.push(R(k)); }); });
    // arriving: Ambrösel, maybe quarantine, maybe the statue, the pier
    r.push(R("ambrose")); if (rnd() < .5) r.push(R("quar")); if (rnd() < .6) r.push(R("liberty")); r.push(R("pier"));
    return r;
  }
  var dz = null, dzRaf = 0, dzOpen = false;
  function dzL() { var L = life(); L.steam = L.steam || { best: 0, trips: 0 }; return L.steam; }
  // spontaneous weather on the open sea: not in the timetable, the plan has to change
  var DZ_EVS = [
    { k: "sturm", o: "halb", t: "Funkspruch: Ein Sturm zieht auf! Bei dem Seegang lässt die Brücke nur Halbe Fahrt fahren.", d: "Die Pausbacke stampft durch die Wellen, aber alles hält." },
    { k: "wind", x: 1, t: "Steifer Westwind von vorn! Die Maschine braucht 1 Druck mehr als sonst.", d: "Gegen den Wind, aber pünktlich." }
  ];
  var DZ_SURGE = { "21": 2, "20": 4, "10": 2 }, DZ_GLUT = [0, 2, 4], DZ_DMP = [.4, .65, 1];
  function dzNeed(lvl, turb) { return [0, 2, turb ? 3 : 4][lvl]; }
  function dzNew() {
    var route = dzRoute(), n = 0; route.forEach(function (L) { if (L.o !== "stopp") n++; });
    return { route: route, leg: 0, res: [], P: 3, G: 3, W: 7, red: 0, dmp: 2, coalN: 0, pumpN: 0, lever: false, whistle: false, turb: false, lastLvl: 0, shovels: 0, blows: 0, budget: n + 4,
      ev: null, evs: {}, lastEv: -9,
      ang: 0, spin: 0, lightA: [0, 0], shovT: 0, pumpT: 0, pending: [], puffs: [], flow: 0, anim: null, sparks: [], shk: 0, cam: { x: 0, y: 0 }, done: false, intro: true,
      dispP: .3, dispW: .7, dispG: 3, prog: 0, ringT: 1.2, arrNight: Math.random() < .45, ham: { m: "front", f: 0, t: 0 }, drag: null, doorY: 0, flood: 0, floodB: 0, soot: 0, sootBlow: false, mini: null };
  }
  function dzLegO(d, i) { var e = d.evs[i]; return e && e.o || d.route[i].o; }
  // what happens if the current plan runs: pure function of the state.
  // Embers burn down by one each leg, every shovel adds one; the damper decides how much of the fire's heat becomes steam.
  function dzSim(d) {
    var li = Math.min(d.leg, d.route.length - 1), L = d.route[li], o = dzLegO(d, li), ol = DZ_ORD[o].l, ex = d.evs[li] && d.evs[li].x || 0;
    var G = Math.max(0, d.G - 1) + d.coalN, out = Math.max(0, Math.round(G * DZ_DMP[d.dmp]) - (d.flood || 0) - dzSootPen(d));
    var P = d.P + out - (d.lever ? 3 : 0) - d.pumpN - (d.whistle ? 1 : 0), W = d.W + 3 * d.pumpN, lvl = d.red;
    var nd = function (l) { return l ? dzNeed(l, d.turb) + ex : 0; };
    while (lvl > 0 && (P < nd(lvl) || W < lvl || G < DZ_GLUT[lvl])) lvl--;                    // full ahead needs a big fire
    var surge = DZ_SURGE[(d.lastLvl || 0) + '' + lvl] || 0;                                    // throttling down: steam backs up in the boiler
    P = Math.max(0, P - nd(lvl)) + surge; W = Math.min(10, W - lvl);
    var blow = P > 10; if (blow) P = 7;
    var why = lvl < ol ? "slow" : lvl > ol ? "fast" : L.wh && !d.whistle ? "wh" : d.turb && lvl < 2 ? "turb" : "";
    return { G: G, out: out, P: P, W: Math.max(0, W), lvl: lvl, blow: blow, ok: !why, why: why, surge: surge };
  }
  function dzOrder() { return dzLegO(dz, Math.min(dz.leg, dz.route.length - 1)); }
  function dzZone(P) { return P < .25 ? 0 : P < .72 ? 1 : P < .9 ? 2 : 3; }
  // ---- the timetable in the panel: a window of seven legs around the current one ----
  var DZ_RI = { abfahrt: "hafen", newyork: "boot", kueste: "see", fastnet: "see", lotse: "boot", fischer: "boot", see: "see", reede: "hafen", nebel: "nebel", eiswarn: "eis", eis: "eis", morgen: "see", wale: "see", sos: "boot", gruss: "boot", feuerschiff: "boot", quar: "hafen", liberty: "ny", ny: "ny" };
  function dzPlanDraw() {
    var a = Math.max(0, Math.min(dz.route.length - 7, dz.leg - 2)), h = "";
    for (var i = a; i < a + 7; i++) {
      var L = dz.route[i], o = dzLegO(dz, i), e = dz.evs[i], st = i < dz.leg ? (dz.res[i] ? " ok" : " bad") : i === dz.leg ? " cur" : "";
      h += '<b class="dz-t o-' + o + st + (e ? " ev" : "") + '"><img src="' + DZ["ri_" + (e ? e.k : DZ_RI[L.s])] + '" alt="">' + (L.wh ? '<img class="dz-wh" src="' + DZ.ri_wh + '" alt="">' : "") + '<i>' + DZ_ORD[o].n.replace(" Fahrt", "") + '</i></b>';
    }
    dzPlanEl.innerHTML = h;
  }
  // everything still to do for this leg, in one line
  function dzHint() {
    if (dz.anim || dz.done || dz.intro) return;
    var r = dzSim(dz), L = dz.route[dz.leg], o = dzLegO(dz, dz.leg), ol = DZ_ORD[o].l, todo = [];
    if (dz.red !== ol) todo.push("rotes Rad auf " + ["zu", "halb", "voll"][ol]);
    if (L.wh && !dz.whistle) todo.push("Dampfpfeife ziehen");
    if (dz.turb && ol < 2) todo.push("Turbine aus");
    if (dz.flood > 0) todo.push("Wasser im Heizraum: Lenzpumpe links");
    if (dzSootPen(dz)) todo.push("Kessel verrußt: auf den qualmenden Kessel tippen");
    if (dz.red === ol && r.lvl < dz.red) todo.push(dz.W + 3 * dz.pumpN < dz.red ? "pumpen" : dz.dmp === 0 ? "Feuertür wieder hoch" : r.G < DZ_GLUT[dz.red] ? "Kohle schaufeln, die Glut muss bis zur Marke" : "Kohle schaufeln");
    var msg;
    if (r.blow) msg = (r.surge ? "Beim Drosseln staut sich der Dampf! " : "Zu viel Druck! ") + "Feuertür runterziehen oder gelben Hebel ziehen, sonst bläst das Sicherheitsventil ab." + (todo.length ? " Außerdem: " + todo.join(", ") + "." : "");
    else if (todo.length) msg = "Noch zu tun: " + todo.join(", ") + ".";
    else if (ol === 2 && !dz.turb) msg = "Bereit. Tipp: Mit der Turbine braucht volle Fahrt weniger Dampf.";
    else if (r.W < 3) msg = "Bereit, aber danach wird das Wasser knapp. Die Pumpe hilft.";
    else msg = "Alles bereit: Los!";
    dzBanner(msg);
  }
  function dzLegIntro(pre) {
    var i = dz.leg, L = dz.route[i];
    if (dz.arrNight && L.k === "ambrose" && !dz.nightSaid) { dz.nightSaid = 1; pre = (pre ? pre + " " : "") + "Es ist schon dunkel, als die Lichter von Nuss York auftauchen."; }
    if (!dz.evs[i] && (L.s === "see") && i - dz.lastEv > 3 && Math.random() < .4) { var E = DZ_EVS[Math.floor(Math.random() * DZ_EVS.length)]; if (!(E.k === "wind" && L.o !== "voll")) { dz.evs[i] = E; dz.lastEv = i; dzPlanDraw(); dzShake(.3); beep([[440, .08], [330, .1]]); } }
    var e = dz.evs[i];
    if (e && e.k === "sturm" && !dz.leaked) { dz.leaked = i; dz.flood = Math.min(2, dz.flood + 1); }
    if (e && e.k === "sturm" && dz.leaked !== i) { dz.leaked = i; dz.flood = Math.min(2, dz.flood + 1); }
    dzMsg.innerHTML = (pre ? '<span class="dz-d">' + pre + '</span> ' : "") + (e ? '<span class="dz-ev">' + e.t + (e.k === "sturm" ? " Eine Naht leckt, Wasser dringt in den Heizraum!" : "") + '</span>' : L.i);
  }

  // ===== two incidents with their own little scenes =====
  // Water ingress: in a storm a seam leaks and sea water rises in the stokehold. In the ash pit it dampens the fire.
  //   The bilge pump on the left wall opens a close-up: pump the handle until the bucket is full, carry it to the scupper and tip it out.
  //   Two buckets per level of water.
  // Soot: every leg at full ahead sets more soot in the boiler tubes; from three it costs steam. The soot blower's chain opens
  //   a close-up of the tube plate: rub the three tubes clean with a finger. Next leg the funnels blow out black clouds.
  var DZ_PUMP = { x0: 16, y0: 44, x1: 36, y1: 95 }, DZ_BOILER = { x0: 52, y0: 6, x1: 104, y1: 58 };
  var DZ_TR = 18, DZ_TD = DZ_TR * 2 + 1;                                                        // tube radius and mask size in the soot scene
  function dzSootPen(d) { return d.soot >= 6 ? 2 : d.soot >= 3 ? 1 : 0; }
  function dzMiniOpen(k) {
    if (k === "pump") { var need = dz.flood * 2 - (dz.floodB || 0); dz.mini = { k: "pump", hy: 0, stroke: 0, down: false, fill: 0, carry: null, tip: 0, need: need, left: need, done: 0, back: 0, wl: need, spill: [] }; }
    else { var tubes = []; for (var i = 0; i < 3; i++) { var m = []; for (var j = 0; j < DZ_TD * DZ_TD; j++) m.push(1); tubes.push({ x: 44 + i * 46, y: 70, m: m, left: 1 }); } dz.mini = { k: "soot", tubes: tubes, rub: null, dust: [], fin: 0, touched: false }; }
    dzGo.textContent = "Zurück"; dzGo.disabled = false; beep([[440, .05], [660, .06]]); dzNudge(0, 2);
    dzBanner(k === "pump" ? "Lenzen: Den roten Schwengel ganz runter und wieder hoch ziehen. Ist der Eimer voll, trag ihn zum Speigatt rechts." : "Rußblasen: Rubbel die drei Kesselrohre mit dem Finger frei, bis das Feuer durchscheint.");
  }
  function dzMiniClose() { dz.mini = null; dzGo.textContent = "Los!"; dzHint(); }
  // shared pieces: the riveted wall, a hanging lamp, a big bouncing arrow, the brass medallion for success
  function dzMiniWall(t) {
    for (var y = 0; y < 135; y += 20) for (var x = 0; x < 180; x += 30) { DR(x, y, 30, 20, ((x / 30 + y / 20) % 2) ? "#4e5e62" : "#4a585c"); DR(x, y, 30, 1, "#36444a"); DR(x, y, 1, 20, "#36444a"); DR(x + 1, y + 1, 29, 1, "#62727a"); DR(x + 4, y + 5, 2, 2, "#86969c"); DR(x + 25, y + 14, 2, 2, "#86969c"); }
    DR(0, 6, 180, 8, "#3a2414"); DR(0, 7, 180, 6, "#b8743a"); DR(0, 7, 180, 2, "#e0985a"); DR(0, 12, 180, 1, "#7a4420");             // a copper pipe along the ceiling
    for (var f = 20; f < 180; f += 50) { DR(f - 2, 4, 6, 12, "#3a2414"); DR(f - 1, 5, 4, 10, "#e8b84a"); }
    var sw = Math.sin(t / 900) * 4, lx = 122 + sw;                                             // the lamp swings with the ship
    dzLine(122, 14, lx, 26, "#3a2414"); DR(lx - 5, 26, 11, 6, "#3a2414"); DR(lx - 4, 27, 9, 4, "#5a6068"); DR(lx - 3, 31, 7, 4, "#fff1a8"); DR(lx - 2, 35, 5, 1, "#3a2414");
    dzc.globalAlpha = .08; for (var r = 0; r < 4; r++) { dzc.fillStyle = "#fff1a8"; dzc.beginPath(); dzc.moveTo(lx - 3, 34); dzc.lineTo(lx - 22 - r * 8, 135); dzc.lineTo(lx + 22 + r * 8, 135); dzc.closePath(); dzc.fill(); } dzc.globalAlpha = 1;
  }
  function dzArrow(x, y, dir, t) {                                                              // a big pixel arrow pointing up/down/right, bouncing
    var b = Math.round(Math.sin(t / 140) * 2), c = "#ffd34a", k = "#3a2414";
    dzc.save(); dzc.translate(x, y + (dir === "r" ? 0 : b)); if (dir === "r") dzc.translate(b, 0);
    var R = dir === "d" ? Math.PI : dir === "r" ? Math.PI / 2 : 0; dzc.rotate(R);
    DR(-3, -2, 7, 11, k); DR(-2, -1, 5, 10, c); for (var i = 0; i < 6; i++) { DR(-6 + i, -2 - i, 13 - i * 2, 1, k); DR(-5 + i, -2 - i + (i ? 0 : 1), 11 - i * 2, 1, c); }
    dzc.restore();
  }
  function dzMedal(cx, cy, ok, e) {
    var R = 14; dzc.globalAlpha = Math.min(1, e);
    for (var yy = -R - 1; yy <= R + 1; yy++) for (var xx = -R - 1; xx <= R + 1; xx++) { var d = Math.hypot(xx, yy); if (d <= R + 1) DR(cx + xx, cy + yy, 1, 1, d > R ? "#3a2414" : d > R - 3 ? (xx + yy < -4 ? "#ffe08a" : xx + yy > 4 ? "#b88a2a" : "#e8b84a") : d > R - 4 ? "#7a5a1a" : "#1e2a4a"); }
    if (ok) { DR(cx - 7, cy, 3, 3, "#fff8ec"); DR(cx - 5, cy + 2, 3, 3, "#fff8ec"); DR(cx - 3, cy + 4, 3, 3, "#fff8ec"); for (var q = 0; q < 5; q++) DR(cx + q * 1.8 - 1, cy + 3 - q * 2, 3, 3, "#fff8ec"); }
    else for (var q3 = -3; q3 <= 3; q3++) { DR(cx + q3 * 1.6 - 1, cy + q3 * 1.6 - 1, 3, 3, "#ff7a6a"); DR(cx + q3 * 1.6 - 1, cy - q3 * 1.6 - 1, 3, 3, "#ff7a6a"); }
    dzc.globalAlpha = 1;
  }
  function dzMiniDraw(t, dt) {
    var m = dz.mini; dzMiniWall(t);
    if (m.k === "pump") dzPumpDraw(t, dt, m); else dzSootDraw(t, dt, m);
  }
  // ---- the bilge pump scene ----
  // Hull ribs and a wooden grating; the cast-iron pump sucks the bilge water up through a pipe and pours it from its spout
  // straight into the pail standing under it; the full pail is dragged to the scupper on the right and tipped out.
  var DZP = { bx: 58, by: 92, mx: 72, my: 76 };                                                    // the pail's home under the spout, the spout's mouth
  function dzShadeCol(u, pal) { var i = Math.max(0, Math.min(pal.length - 1, Math.floor(u * pal.length))); return pal[i]; }
  function dzPumpDraw(t, dt, m) {
    m.wl += (m.left - m.wl) * Math.min(1, dt * 3);                                              // the water level sinks smoothly after each bucket
    var wy = 135 - 10 - m.wl * 4;
    // hull ribs: deep brown frames with a lit edge, darker towards the bilge
    [[2, 14], [96, 12], [170, 10]].forEach(function (r) { DR(r[0] - 1, 14, r[1] + 2, 121, "#24160c"); DR(r[0], 14, r[1], 121, "#4a3424"); DR(r[0], 14, 2, 121, "#6a4c34"); DR(r[0] + r[1] - 2, 14, 2, 121, "#36261a"); for (var ry = 22; ry < 135; ry += 12) DR(r[0] + Math.floor(r[1] / 2) - 1, ry, 2, 2, "#8a6a4a"); });
    dzc.globalAlpha = .35; for (var gy2 = 0; gy2 < 40; gy2++) DR(0, 95 + gy2, 180, 1, "#0e1a22"); dzc.globalAlpha = 1;   // shadow down in the bilge
    // the leaking seam: a sprung plate on the rib, sea water spurting through the gap
    DR(4, 40, 12, 44, "#24160c"); DR(5, 41, 10, 42, "#5a6670"); DR(5, 41, 2, 42, "#7a8690"); DR(13, 41, 2, 42, "#3e4850"); for (var rv = 44; rv < 82; rv += 7) { DR(9, rv, 2, 2, "#3a2414"); DR(9, rv, 1, 1, "#b8c4cc"); }
    DR(14, 56, 2, 8, "#0e1a22");
    if (m.left > 0) { for (var j = 0; j < 18; j++) { var u = ((t / 380) + j / 18) % 1, jx = 16 + u * 18 + (j % 3 - 1) * u * 3, jy = 58 + (j % 4 - 1.5) * .8 + u * u * (wy - 58); DR(jx, jy, j % 4 ? 2 : 1, 2, j % 3 ? "#a8d0e8" : "#e8f4fc"); }
      if (Math.floor(t / 90) % 2) { DR(32 + Math.sin(t / 70) * 3, wy - 2, 1, 1, "#e8f4fc"); DR(36 + Math.cos(t / 80) * 3, wy - 3, 1, 1, "#e8f4fc"); } }
    // the scupper: a brass porthole in the hull with the sea outside
    var sx = 152, sy = 66;
    for (var yy = -17; yy <= 17; yy++) for (var xx = -17; xx <= 17; xx++) { var d = Math.hypot(xx, yy); if (d > 17) continue;
      var c;
      if (d > 16) c = "#3a2414";
      else if (d > 12) { var lt = (-xx - yy) / 17; c = lt > .55 ? "#fff1b0" : lt > .2 ? "#ffd86a" : lt > -.2 ? "#e8b84a" : lt > -.55 ? "#c8962e" : "#9a6e1e"; }
      else if (d > 11) c = "#3a2414";
      else { var sea = yy < -2 + Math.sin(xx * .5 + t / 300) * 1.5; c = sea ? (yy < -7 ? "#b8e0f4" : "#8ec8ec") : ((xx + yy + Math.floor(t / 200)) % 5 ? (yy > 6 ? "#2e5e98" : "#3e7ab8") : "#8cc0e6"); if (xx + yy < -10 && xx + yy > -13) c = "#e8f8ff"; }
      DR(sx + xx, sy + yy, 1, 1, c); }
    for (var bo = 0; bo < 8; bo++) { var ba = bo / 8 * Math.PI * 2 + .39, rx2 = sx + Math.cos(ba) * 14.5, ry2 = sy + Math.sin(ba) * 14.5; DR(rx2 - 1, ry2 - 1, 2, 2, "#6a4a14"); DR(rx2 - 1, ry2 - 1, 1, 1, "#fff1b0"); }
    // the wooden grating the pump and the pail stand on
    var gtY = 122; DR(18, gtY, 82, 4, "#24160c"); for (var gx3 = 19; gx3 < 99; gx3 += 6) { DR(gx3, gtY + 1, 5, 2, "#a87448"); DR(gx3, gtY + 1, 5, 1, "#c8945a"); } DR(22, gtY + 4, 3, 10, "#3a2414"); DR(94, gtY + 4, 3, 10, "#3a2414");
    // the suction pipe from the pump's foot down into the bilge water
    DR(24, 112, 6, 23, "#24160c"); DR(25, 112, 4, 23, "#6a7078"); DR(25, 112, 1, 23, "#9aa0a8"); DR(23, 116, 8, 3, "#24160c"); DR(24, 117, 6, 1, "#b8743a");
    // the pump: a cast-iron barrel, round-shaded, with brass bands, a foot and a curved spout
    var px0 = 30, pw = 22, RED = ["#5a1a14", "#7a2420", "#9a2e26", "#b83a2e", "#d4503f", "#e8705c", "#f49480", "#d4503f", "#b83a2e", "#9a2e26", "#7a2420", "#5a1a14"];
    DR(px0 - 1, 47, pw + 2, 70, "#24160c");
    for (var cx2 = 0; cx2 < pw; cx2++) { var uu = cx2 / (pw - 1), sh = Math.round((1 - Math.cos(uu * Math.PI)) / 2 * (RED.length - 1)); DR(px0 + cx2, 48, 1, 68, RED[Math.min(RED.length - 1, Math.max(0, uu < .35 ? Math.round(uu / .35 * 6) : Math.round(6 + (uu - .35) / .65 * 5)))]); }
    DR(px0 + 5, 52, 1, 60, "#ffc0a8");                                                                       // a glint on the iron
    for (var bd = 0; bd < 3; bd++) { var byy = 54 + bd * 22; DR(px0 - 3, byy, pw + 6, 6, "#24160c"); for (var bx3 = 0; bx3 < pw + 4; bx3++) { var u3 = bx3 / (pw + 3); DR(px0 - 2 + bx3, byy + 1, 1, 4, u3 < .2 ? "#ffe08a" : u3 < .45 ? "#f2c860" : u3 < .75 ? "#d8a23e" : "#a8781e"); } DR(px0 - 2, byy + 1, pw + 4, 1, "#fff1b0"); DR(px0 + 2, byy + 2, 1, 2, "#7a5a1a"); DR(px0 + pw - 3, byy + 2, 1, 2, "#7a5a1a"); }
    DR(px0 - 5, 114, pw + 10, 8, "#24160c"); DR(px0 - 4, 115, pw + 8, 6, "#5a6068"); DR(px0 - 4, 115, pw + 8, 1, "#8a9098"); DR(px0 - 4, 120, pw + 8, 1, "#3a4048"); DR(px0 - 2, 117, 2, 2, "#b8c0c8"); DR(px0 + pw, 117, 2, 2, "#b8c0c8");
    DR(px0 + 3, 42, pw - 6, 6, "#24160c"); DR(px0 + 4, 43, pw - 8, 4, "#e8b84a"); DR(px0 + 4, 43, pw - 8, 1, "#ffe08a");   // the cap
    // the spout: out of the barrel, then bending down over the pail
    DR(px0 + pw - 1, 64, 18, 8, "#24160c"); DR(px0 + pw, 65, 16, 6, "#6a7078"); DR(px0 + pw, 65, 16, 2, "#9aa0a8"); DR(px0 + pw, 70, 16, 1, "#4a5058");
    DR(DZP.mx - 4, 64, 8, 13, "#24160c"); DR(DZP.mx - 3, 65, 6, 11, "#6a7078"); DR(DZP.mx - 3, 65, 2, 11, "#9aa0a8"); DR(DZP.mx + 2, 65, 1, 11, "#4a5058"); DR(DZP.mx - 4, 75, 8, 2, "#24160c"); DR(DZP.mx - 2, 76, 4, 1, "#0e1a22");
    // the handle: an iron bar on a brass pivot with a turned wooden grip
    var ha = (-30 + m.hy * 55) * Math.PI / 180, pvx = px0 + 11, pvy = 40, kx = pvx + Math.cos(ha) * 58, ky = pvy + Math.sin(ha) * 58;
    for (var w = -2; w <= 2; w++) dzLine(pvx, pvy + w, kx, ky + w, Math.abs(w) === 2 ? "#24160c" : w < 0 ? "#a8aeb6" : w === 0 ? "#7a8088" : "#4a5058");
    var gx = pvx + Math.cos(ha) * 44, gy = pvy + Math.sin(ha) * 44;
    for (var w2 = -4; w2 <= 4; w2++) dzLine(gx, gy + w2, kx + 2, ky + w2, Math.abs(w2) === 4 ? "#24160c" : w2 === -3 ? "#e8a868" : w2 < 0 ? "#c8884a" : w2 < 3 ? "#a86a2c" : "#7a4a1c");
    DR(pvx - 5, pvy - 5, 11, 11, "#24160c"); DR(pvx - 4, pvy - 4, 9, 9, "#c8962e"); DR(pvx - 4, pvy - 4, 8, 8, "#e8b84a"); DR(pvx - 3, pvy - 3, 3, 3, "#fff1b0"); DR(pvx, pvy, 2, 2, "#7a5a1a");
    // the bilge water: deeper is darker, glints, bits of coal and a plank bobbing
    var WB = ["#5a8aaa", "#4a7a9a", "#3e6a8a", "#335c7a", "#2a4e6a"];
    for (var x2 = 0; x2 < 180; x2++) { var top = Math.round(wy + Math.sin(x2 * .09 + t / 380) * 2 + Math.sin(x2 * .23 - t / 260)); for (var yb = top; yb < 135; yb += 4) DR(x2, yb, 1, 4, WB[Math.min(4, Math.floor((yb - top) / 4))]); DR(x2, top, 1, 1, "#b8e0f4"); if ((x2 + Math.floor(t / 120)) % 9 === 0) DR(x2, top + 3, 2, 1, "#8cc0e6"); if ((x2 * 7 + Math.floor(t / 160)) % 23 === 0) DR(x2, top + 8, 3, 1, "#6a9aba"); }
    for (var cb = 0; cb < 3; cb++) dzImg("coal", 108 + cb * 22 + Math.sin(t / 700 + cb) * 3, wy - 2 + Math.sin(t / 380 + cb) * 1.5);
    var plx = 120 + Math.sin(t / 900) * 6, ply = wy - 1 + Math.sin(t / 420) * 1.2; DR(plx - 1, ply - 1, 18, 4, "#3a2414"); DR(plx, ply, 16, 2, "#a87448"); DR(plx, ply, 16, 1, "#c8945a"); DR(plx + 3, ply, 1, 2, "#7a5030");
    // the pail: staves shaded round, iron hoops, a wire bail; at home under the spout, carried, tipping or sliding back
    var bx = DZP.bx, by = DZP.by;
    if (m.carry) { bx = m.carry[0] - 14; by = m.carry[1] - 16; } else if (m.tip > 0) { bx = sx - 30; by = sy - 10; } else if (m.back > 0) { m.back -= dt; var bu = m.back / .4; bx = DZP.bx + (m.bx0 - DZP.bx) * bu; by = DZP.by + (m.by0 - DZP.by) * bu; }
    var home = !m.carry && m.tip <= 0 && m.back <= 0;
    if (home) { dzc.globalAlpha = .35; DR(bx - 1, by + 30, 30, 2, "#0e1a22"); dzc.globalAlpha = 1; }
    var tilt = m.tip > 0 ? Math.min(1, (1 - m.tip) * 3) * 1.7 : (m.carry ? Math.sin(t / 120) * .06 : 0);
    dzc.save(); dzc.translate(bx + 14, by + 16); dzc.rotate(tilt); dzc.translate(-(bx + 14), -(by + 16));
    var bail = m.fill >= 1 || m.carry ? -10 : -5;
    dzLine(bx + 1, by + 3, bx + 14, by + bail, "#24160c"); dzLine(bx + 14, by + bail, bx + 27, by + 3, "#24160c"); dzLine(bx + 2, by + 3, bx + 14, by + bail + 1, "#a8aeb6"); dzLine(bx + 14, by + bail + 1, bx + 26, by + 3, "#a8aeb6");
    var WOOD = ["#7a4a24", "#9a6034", "#b87a44", "#d0965a", "#e0aa6a", "#d0965a", "#b87a44", "#9a6034", "#7a4a24", "#5e3818"];
    DR(bx - 1, by, 30, 30, "#24160c");
    for (var cx3 = 0; cx3 < 28; cx3++) { var u4 = cx3 / 27, si = u4 < .3 ? Math.round(u4 / .3 * 4) : Math.round(4 + (u4 - .3) / .7 * 5); DR(bx + cx3, by + 1, 1, 28, WOOD[si]); if (cx3 % 5 === 4) DR(bx + cx3, by + 1, 1, 28, "#5e3818"); }
    DR(bx, by + 1, 28, 2, "#3a2414"); DR(bx + 1, by + 1, 26, 1, "#5e3818");                                      // the rim's inside
    var fh = Math.round(24 * m.fill); if (fh) { var wt2 = by + 27 - fh; DR(bx + 1, wt2, 26, Math.min(fh, 3), "#3e7ab8"); DR(bx + 1, wt2, 26, 1, "#8cc0e6"); DR(bx + 4 + Math.round(Math.sin(t / 150) * 2), wt2, 6, 1, "#e8f4fc"); }
    for (var hp = 0; hp < 2; hp++) { var hy2 = by + 6 + hp * 16; DR(bx - 1, hy2, 30, 3, "#24160c"); for (var cx4 = 0; cx4 < 28; cx4++) DR(bx + cx4, hy2 + 1, 1, 1, cx4 < 8 ? "#c8d0d8" : cx4 < 18 ? "#8a929a" : "#5a6068"); DR(bx + 3, hy2 + 1, 1, 1, "#ffffff"); }
    dzc.restore();
    // the stream: from the spout's mouth right into the pail, splashing where it lands
    if (m.pour > 0) { m.pour -= dt; var land = home ? by + 27 - Math.round(24 * m.fill) : wy;
      for (var k = 0; DZP.my + k * 2 < land; k++) { var wob = (Math.floor(t / 40) + k) % 3 === 0 ? 1 : 0; DR(DZP.mx - 1 + wob, DZP.my + k * 2, 3, 2, k % 2 ? "#a8d0e8" : "#e8f4fc"); DR(DZP.mx - 1 + wob, DZP.my + k * 2, 1, 2, "#ffffff"); }
      for (var sp = 0; sp < 5; sp++) { var sa = (t / 60 + sp * 1.3) % 1; DR(DZP.mx + (sp - 2) * (2 + sa * 4), land - 1 - Math.sin(sa * Math.PI) * 4, 1, 1, "#e8f4fc"); } }
    else if (home && m.fill > 0 && Math.floor(t / 700) % 3 === 0) DR(DZP.mx, DZP.my + 1 + (t / 30) % 12, 1, 2, "#a8d0e8");   // a last drip
    if (m.tip > 0) { m.tip -= dt; for (var k2 = 0; k2 < 18; k2++) { var u2 = (1 - m.tip) * 2.2 - k2 * .05; if (u2 > 0 && u2 < 1) DR(sx - 8 + u2 * 22, sy - 6 + u2 * u2 * 16 + (k2 % 3), 3, 2, k2 % 2 ? "#a8d0e8" : "#e8f4fc"); }
      if (m.tip <= 0) { m.left--; dz.floodB = (dz.floodB || 0) + 1; m.fill = 0; dzNudge(-2, 0); beep([[523, .05], [659, .08]]); dzBuzz(30);
        if (m.left <= 0) { dz.flood = 0; dz.floodB = 0; m.done = 1.6; beep([[523, .06], [659, .06], [784, .06], [1047, .12]]); dzBuzz([20, 40, 20, 40, 60]); for (var s2 = 0; s2 < 24; s2++) dz.sparks.push({ x: 90, y: 60, vx: (Math.random() - .5) * 80, vy: -30 - Math.random() * 40, life: .9, c: ["#ffd34a", "#ffffff", "#8ad86a"][s2 % 3] }); } } }
    m.spill = m.spill.filter(function (s) { s.life -= dt; s.vy += 160 * dt; s.x += s.vx * dt; s.y += s.vy * dt; DR(s.x, s.y, 2, 2, "#a8d0e8"); return s.life > 0 && s.y < wy + 4; });
    // what to do next: an arrow at the grip while pumping, a dotted path to the scupper when the pail is full
    if (m.done <= 0 && m.tip <= 0) {
      if (m.fill < 1 && !m.carry) dzArrow(kx + 12, ky + (m.stroke ? -16 : 14), m.stroke ? "u" : "d", t);
      else if (m.fill >= 1 && !m.carry) { for (var dp = 0; dp < 12; dp++) { var v = dp / 12; if ((dp + Math.floor(t / 120)) % 3) DR(bx + 30 + (sx - 22 - bx - 30) * v, by + 4 - Math.sin(v * Math.PI) * 22, 2, 2, "#ffd34a"); } dzArrow(sx - 24, sy - 2, "r", t); var ph = (t / 600) % 1; if (ph < .5) dzSpark(bx + 22, by - 8, ph < .12 || ph > .38 ? 1 : 2); }
      else if (m.carry) { var near = Math.hypot(m.carry[0] - sx, m.carry[1] - sy) < 30; for (var gr = 0; gr < 32; gr++) { var ga = gr / 32 * Math.PI * 2; if ((gr + Math.floor(t / 80)) % 2) DR(sx + Math.cos(ga) * 20, sy + Math.sin(ga) * 20, 2, 2, near ? "#6fd04a" : "#ffd34a"); } }
    }
    // how many pails: little pail icons, ticked off one by one
    for (var b2 = 0; b2 < m.need; b2++) { var ix = 178 - (m.need - b2) * 11, done = b2 < m.need - m.left; DR(ix, 19, 10, 10, "#24160c"); DR(ix + 1, 20, 8, 8, done ? "#6fd04a" : "#b87a44"); DR(ix + 1, 20, 2, 8, done ? "#9ae87a" : "#d0965a"); DR(ix + 1, 22, 8, 1, "#24160c"); DR(ix + 1, 26, 8, 1, "#24160c");
      if (done) { DR(ix + 2, 24, 2, 1, "#fff8ec"); DR(ix + 3, 25, 2, 1, "#fff8ec"); for (var q = 0; q < 3; q++) DR(ix + 5 + q, 24 - q, 1, 1, "#fff8ec"); } }
    if (m.done > 0) { dzMedal(90, 64, true, (1.6 - m.done) * 4); m.done -= dt; if (m.done <= 0) dzMiniClose(); }
  }
  // ---- the soot scene ----
  function dzSootDraw(t, dt, m) {
    // the boiler's front: green riveted iron with a brass rim, a hinge, a little gauge and a pipe
    DR(8, 30, 164, 84, "#3a2414"); DR(9, 31, 162, 82, "#3e6a52"); DR(9, 31, 162, 4, "#5a8a6a"); DR(9, 109, 162, 4, "#2a4a3a"); DR(9, 31, 4, 82, "#4a7a5e");
    DR(6, 28, 168, 3, "#e8b84a"); DR(6, 113, 168, 3, "#b88a2a");
    for (var rv = 0; rv < 20; rv++) { DR(14 + rv * 8, 38, 2, 2, "#e8b84a"); DR(14 + rv * 8, 104, 2, 2, "#e8b84a"); }
    DR(160, 44, 8, 16, "#3a2414"); DR(161, 45, 6, 14, "#7a7f86");
    // soot smudges on the plate, fewer as the tubes get clean
    var dirty = m.tubes.reduce(function (s, tb) { return s + tb.left; }, 0) / 3;
    for (var sm = 0; sm < Math.round(30 * dirty); sm++) DR(16 + (sm * 37) % 150, 42 + (sm * 23) % 58, 2, 1, "#24302a");
    var all = 0;
    m.tubes.forEach(function (tb, i) {
      var R = DZ_TR;
      for (var yy = -R - 3; yy <= R + 3; yy++) for (var xx = -R - 3; xx <= R + 3; xx++) { var d = Math.hypot(xx, yy); if (d > R + 3) continue;
        var c;
        if (d > R + 2) c = "#3a2414"; else if (d > R) c = tb.left < .06 ? (xx + yy < -8 ? "#fff6c0" : "#ffe08a") : (xx + yy < -8 ? "#ffe08a" : xx + yy > 8 ? "#b88a2a" : "#e8b84a");
        else { var f = Math.floor(t / 130) % 2; c = d < 6 ? (f ? "#fff1a8" : "#ffe08a") : d < 11 ? (f ? "#f6a040" : "#f68a30") : d < 15 ? "#d8463c" : "#7a2a18";      // the fire seen through a clean tube
          if (tb.m[(yy + R) * DZ_TD + xx + R]) c = ((xx * 3 + yy * 5 + i) & 7) === 0 ? "#3a3a40" : ((xx + yy * 2) % 5 === 0 ? "#2a2a2e" : "#1a1a1e"); }
        DR(tb.x + xx, tb.y + yy, 1, 1, c); }
      // a gold ring around each tube fills up as it gets cleaner
      var prog = Math.min(1, (1 - tb.left) / .94);
      for (var a = 0; a < 48; a++) { if (a / 48 > prog) break; var an = -Math.PI / 2 + a / 48 * Math.PI * 2; DR(tb.x + Math.cos(an) * (R + 6) - 1, tb.y + Math.sin(an) * (R + 6) - 1, 3, 3, prog >= 1 ? "#6fd04a" : "#ffd34a"); }
      if (tb.left > .06) all++;
      else if (!tb.done) { tb.done = 1; beep([[660 + i * 130, .06], [880 + i * 130, .1]]); dzBuzz([20, 30, 40]); dzNudge(0, -2); for (var s = 0; s < 16; s++) dz.sparks.push({ x: tb.x, y: tb.y, vx: (Math.random() - .5) * 90, vy: -40 - Math.random() * 40, life: .8, c: s % 2 ? "#ffd34a" : "#ffffff" }); }
      if (tb.done) { var bx2 = tb.x - 5, by2 = tb.y + R + 9; DR(bx2, by2, 11, 9, "#3a2414"); DR(bx2 + 1, by2 + 1, 9, 7, "#6fd04a"); DR(bx2 + 2, by2 + 4, 2, 2, "#fff8ec"); DR(bx2 + 4, by2 + 5, 2, 2, "#fff8ec"); for (var q = 0; q < 3; q++) DR(bx2 + 6 + q, by2 + 4 - q, 2, 2, "#fff8ec"); }
    });
    // soot dust flying off the brush
    m.dust = m.dust.filter(function (p) { p.life -= dt; p.vy += 60 * dt; p.x += p.vx * dt; p.y += p.vy * dt; DR(p.x, p.y, 2, 2, p.life > .3 ? "#2a2a2e" : "#5a5a62"); return p.life > 0; });
    // the brush: under the finger while rubbing; before the first rub it shows the motion over the first dirty tube
    var first = m.tubes.filter(function (tb) { return tb.left > .06; })[0], br = m.rub || (!m.touched && first ? [first.x + Math.sin(t / 220) * 12, first.y + Math.cos(t / 330) * 4] : null);
    if (br) { dzc.globalAlpha = m.rub ? 1 : .85; var bx = br[0] - 8, by = br[1] - 6; DR(bx + 4, by - 10, 4, 12, "#3a2414"); DR(bx + 5, by - 9, 2, 10, "#c8884a"); DR(bx - 1, by + 1, 18, 7, "#3a2414"); DR(bx, by + 2, 16, 5, "#a86a2c"); DR(bx, by + 2, 16, 1, "#c8884a");
      for (var bb = 0; bb < 8; bb++) DR(bx + 1 + bb * 2, by + 7, 1, 3, "#24242a"); dzc.globalAlpha = 1; }
    if (all === 0 && !m.fin) { m.fin = 1.6; dz.soot = 0; dz.sootBlow = true; beep([[523, .06], [659, .06], [784, .06], [1047, .12]]); dzBuzz([20, 40, 20, 40, 60]); }
    if (m.fin) { dzMedal(90, 72, true, (1.6 - m.fin) * 4); m.fin -= dt; if (m.fin <= 0) dzMiniClose(); }
  }
  function dzMiniDown(p) {
    var m = dz.mini;
    if (m.k === "pump") {
      if (m.fill >= 1 && m.tip <= 0 && p[0] > DZP.bx - 6 && p[0] < DZP.bx + 34 && p[1] > DZP.by - 14 && p[1] < DZP.by + 32) { m.carry = p; beep([[200, .04], [260, .04]]); dzBuzz(15); return; }
      if (m.fill >= 1) { dzNo(); dzBanner("Der Eimer ist voll! Zieh ihn zum Speigatt rechts."); return; }
      m.down = true; dzMiniMove(p);
    } else { m.rub = p; m.touched = true; dzMiniMove(p); }
  }
  function dzMiniMove(p) {
    var m = dz.mini;
    if (m.k === "pump") {
      if (m.carry) { m.carry = p; return; }
      if (!m.down || m.fill >= 1) return;
      m.hy = Math.max(0, Math.min(1, (p[1] - 16) / 56));
      if (m.hy > .85 && m.stroke === 0) { m.stroke = 1; dzClunk(); }                                  // down…
      if (m.hy < .2 && m.stroke === 1) { m.stroke = 0; m.fill = Math.min(1, m.fill + .25); m.pour = .45; beep([[240, .05], [180, .07]]); dzNoise(.3, 1200, .7, .08, .02, .2); dzBuzz(25); dzNudge(0, 2);   // …and up: one stroke
        if (m.fill >= 1) { beep([[880, .06], [1175, .1]]); dzBanner("Der Eimer ist voll! Jetzt zum Speigatt rechts ziehen und ausschütten."); } }
    } else if (m.rub) {
      var last = m.rub; m.rub = p; var n = Math.max(1, Math.round(Math.hypot(p[0] - last[0], p[1] - last[1]))), hit = false;
      for (var s = 0; s <= n; s++) { var x = last[0] + (p[0] - last[0]) * s / n, y = last[1] + (p[1] - last[1]) * s / n;
        m.tubes.forEach(function (tb) { if (Math.hypot(x - tb.x, y - tb.y) > DZ_TR + 3) return; hit = true;
          for (var yy = -5; yy <= 5; yy++) for (var xx = -5; xx <= 5; xx++) { if (xx * xx + yy * yy > 25) continue; var ix = Math.round(x - tb.x + xx) + DZ_TR, iy = Math.round(y - tb.y + yy) + DZ_TR; if (ix >= 0 && ix < DZ_TD && iy >= 0 && iy < DZ_TD && tb.m[iy * DZ_TD + ix]) { tb.m[iy * DZ_TD + ix] = 0; if (Math.random() < .05) m.dust.push({ x: x + xx, y: y + yy, vx: (Math.random() - .5) * 50, vy: -20 - Math.random() * 30, life: .7 }); } } }); }
      m.tubes.forEach(function (tb) { var cnt = 0, tot = 0, R2 = DZ_TR * DZ_TR; for (var i = 0; i < tb.m.length; i++) { var cx = i % DZ_TD - DZ_TR, cy = Math.floor(i / DZ_TD) - DZ_TR; if (cx * cx + cy * cy <= R2) { tot++; cnt += tb.m[i]; } } tb.left = cnt / tot; });
      if (hit && Math.random() < .35) { dzNoise(.07, 2600 + Math.random() * 800, 1, .06, .005, .04); if (Math.random() < .3) dzBuzz(6); }
    }
  }
  function dzMiniUp(p) {
    var m = dz.mini; if (!m) return;
    if (m.k === "pump") {
      m.down = false;
      if (m.carry) { var c = m.carry; m.carry = null;
        if (Math.hypot(c[0] - 152, c[1] - 66) < 30) { m.tip = 1; beep([[300, .05], [200, .3]]); dzNoise(.7, 900, .7, .14, .02, .4); dzBuzz([30, 40, 30]); }
        else { m.back = .4; m.bx0 = c[0] - 14; m.by0 = c[1] - 16; for (var k = 0; k < 10; k++) m.spill.push({ x: c[0], y: c[1] - 10, vx: (Math.random() - .5) * 60, vy: -30 - Math.random() * 20, life: .8 }); m.fill = Math.max(.5, m.fill - .25); dzNo(); dzBuzz(80); dzBanner("Daneben! Etwas Wasser ist übergeschwappt. Den Eimer bis ans Speigatt ziehen."); } }
    } else m.rub = null;
  }
  // ---- drawing: the engine room ----
  // a drawing error must never stop the game: the frame is dropped, the next one comes
  function dzDraw(t) {
    try { dzDraw0(t); }
    catch (e) { try { dzc.setTransform(1, 0, 0, 1, 0, 0); dzc.globalAlpha = 1; } catch (e2) {} if (dzOpen) { cancelAnimationFrame(dzRaf); dzRaf = requestAnimationFrame(dzDraw); } }
  }
  function dzDraw0(t) {
    if (!dzOpen) return;
    var dt = Math.min(.05, (t - (dz.last || t)) / 1000); dz.last = t;
    if (dz.anim) dzAnimStep(dt);
    dz.shk = Math.max(0, (dz.shk || 0) - dt); var sk = dz.shk > 0 ? Math.ceil(dz.shk * 8) : 0;
    dz.cam.x += -dz.cam.x * Math.min(1, dt * 14); dz.cam.y += -dz.cam.y * Math.min(1, dt * 14);
    dzc.save(); dzc.translate(30, 20); dzc.translate(Math.round(dz.cam.x + (sk ? (Math.random() - .5) * 2 * Math.min(3, sk) : 0)), Math.round(dz.cam.y + (sk ? (Math.random() - .5) * 2 * Math.min(2, sk) : 0)));
    var stormy = !dz.done && !dz.intro && dz.evs[dz.leg] && dz.evs[dz.leg].k === "sturm";
    var rock = stormy && !(dz.anim && dz.anim.out);                                            // the engine room rocks: a CSS turn of the whole canvas, smooth at screen resolution
    dzCv.style.transform = rock ? "rotate(" + (Math.sin(t / 700) * 3.2 + Math.sin(t / 1900) * 1).toFixed(3) + "deg) translate(" + (Math.sin(t / 900) * 1.2).toFixed(2) + "%," + (Math.sin(t / 520) * 1.8).toFixed(2) + "%)" : "";
    if (rock && Math.random() < dt * .4) beep([[70 + Math.random() * 20, .25]]);
    if (dz.layered) { dzShipC.clearRect(0, 0, 180, 135); dzFrontC.clearRect(0, 0, 180, 135); dzShipCv.style.transform = ""; dz.layered = false; }
    if (dz.mini) { dzMiniDraw(t, dt); dzSparkDraw(dt); dzc.restore(); dzRaf = requestAnimationFrame(dzDraw); return; }
    if (dz.ending) { dzEndDraw(t, dt); dzc.restore(); dzRaf = requestAnimationFrame(dzDraw); return; }
    if (dz.anim && dz.anim.out) { dzSea(t, dt); dzSparkDraw(dt); dzc.restore(); dzRaf = requestAnimationFrame(dzDraw); return; }
    var sim = dz.anim || dz.done || dz.intro ? null : dzSim(dz);
    dzImg("bgx", -30, -20);
    dz.flare = Math.max(0, (dz.flare || 0) - dt);
    var lv = Math.max(dz.dispG > .3 ? 1 : 0, Math.min(5, Math.round(dz.dispG * 1.1) + (dz.flare > 0 ? 1 : 0))), fl = Math.floor(t / 180) % 2;
    if (lv) { dzImg("fire" + lv + "_" + fl, DZ_FIRE.x0, DZ_FIRE.y0); dzc.fillStyle = "rgba(255,170,90," + (lv * .025) + ")"; dzc.fillRect(40, 50, 100, 85); }
    // the ember gauge on the furnace face: how hot the fire is now, with a pale mark for after this leg
    DR(51, 63, 7, 39, "#3a2414"); DR(52, 64, 5, 37, "#2a1c18");
    var gh = Math.min(37, Math.round(dz.dispG * 3.4)); for (var gk = 0; gk < gh; gk++) DR(52, 100 - gk, 5, 1, gk > 26 ? "#fff1a8" : gk > 14 ? "#f6a040" : "#d8463c");
    if (gh > 0 && fl) DR(53, 101 - gh, 3, 1, "#fff8d0");
    for (var gt = 1; gt < 10; gt++) DR(52, Math.round(100 - gt * 3.4), 1, 1, "#7a5a3a");
    DR(48, Math.round(100 - 2 * 3.4), 4, 1, "#ffd34a"); DR(48, Math.round(100 - 4 * 3.4), 4, 1, "#6fd04a");          // marks: enough fire for half and for full ahead
    if (sim) { var gs = Math.min(37, Math.round(sim.G * 3.4)); DR(50, 100 - gs, 9, 1, "#7aa0c8"); }
    // the gauge: zone ring, the real needle, and while planning a pale ghost needle where the pressure will end up
    var P = dz.dispP, z = dzZone(P), zc = ["#a8b4c0", "#6fd04a", "#ffd34a", "#ff4a3a"][z];
    if (z > 0) for (var k = 0; k < 64; k++) { var q = k / 64 * Math.PI * 2; DR(DZ_GAUGE.x + Math.cos(q) * 19.5, DZ_GAUGE.y + Math.sin(q) * 19.5, 2, 2, zc); }
    function needle(f, c, r) { var a = (135 + Math.max(0, Math.min(1.08, f)) / 1.08 * 270) * Math.PI / 180; dzLine(DZ_GAUGE.x, DZ_GAUGE.y, DZ_GAUGE.x + Math.cos(a) * r, DZ_GAUGE.y + Math.sin(a) * r, c); dzLine(DZ_GAUGE.x + 1, DZ_GAUGE.y, DZ_GAUGE.x + 1 + Math.cos(a) * (r - 1), DZ_GAUGE.y + Math.sin(a) * (r - 1), c); }
    if (sim) { var gf = sim.blow ? 1.08 : sim.P / 10; if (!(sim.blow && Math.floor(t / 250) % 2)) needle(gf, sim.blow ? "#ff4a3a" : "#7aa0c8", 12); }
    needle(P, "#c8342a", 12); DR(DZ_GAUGE.x - 1, DZ_GAUGE.y - 1, 3, 3, "#3a2414");
    // the water glass, with a marker where it will be after this leg
    var GH = DZ_GLASS.y1 - DZ_GLASS.y0, gy = function (w) { return Math.round(DZ_GLASS.y1 - GH * Math.max(0, Math.min(1, w))); };
    var wy = gy(dz.dispW);
    DR(DZ_GLASS.x, wy, 7, DZ_GLASS.y1 - wy, dz.dispW < .3 && Math.floor(t / 250) % 2 ? "#c8463c" : "#3e7ab8"); DR(DZ_GLASS.x, wy, 7, 1, "#bfe0f4"); DR(DZ_GLASS.x + 1, wy + 1, 1, DZ_GLASS.y1 - wy - 1, "#6aaee0");
    DR(DZ_GLASS.x - 5, DZ_GLASS.y0, 4, GH, "#3a2414"); DR(DZ_GLASS.x - 4, gy(.3), 2, gy(0) - gy(.3), "#e8554a"); DR(DZ_GLASS.x - 4, gy(1), 2, gy(.3) - gy(1), "#6fd04a");
    DR(DZ_GLASS.x - 8, wy, 4, 1, "#3a2414"); DR(DZ_GLASS.x - 9, wy - 1, 1, 3, "#3a2414");
    if (sim) DR(DZ_GLASS.x - 1, gy(sim.W / 10), 9, 1, "#7aa0c8");
    // pipes and puffs
    dz.flow += dt;
    var an = dz.anim, sr = an ? an.r.lvl / 2 : 0, sw = dz.pumpT > 0 ? 1 : 0, sy = an && dz.lever ? 1 : 0;
    if (sr > .02) for (var i = 0; i < 4; i++) { var x = 122 + ((dz.flow * (20 + 60 * sr) + i * 15) % 58); if (x < 144 || x > 156) { DR(x, DZW.red.y - 1, 3, 2, "#fff6e4"); DR(x - 2, DZW.red.y, 2, 1, "#ffe0b8"); } }
    if (sw) for (var j = 0; j < 4; j++) { var xb = 180 - ((dz.flow * 56 + j * 15) % 58); if (xb < 144 || xb > 156) { DR(xb, DZW.blue.y - 1, 3, 2, "#cfe8ff"); DR(xb + 3, DZW.blue.y, 2, 1, "#9fd0f4"); } }
    if (an && an.r.surge && an.t > .35 && an.t < 1.05 && Math.random() < dt * 30) dz.puffs.push({ x: Math.random() < .5 ? 50 : 122, y: 20 + Math.random() * 70, vx: (Math.random() < .5 ? -1 : 1) * 12, vy: -10, life: .6, k: "puff" });
    if (sy && an.t > .3 && an.t < 1.1 && Math.random() < dt * 40) dz.puffs.push({ x: 176 + (Math.random() - .5) * 6, y: 0, vx: -10 - Math.random() * 25, vy: 10 + Math.random() * 8, life: 1.1, k: "steam" });
    if (sy && Math.random() < dt * 14) dz.puffs.push({ x: 176 + (Math.random() - .5) * 4, y: 2, vx: (Math.random() - .5) * 10, vy: -4, life: 1.6, k: "steam" });
    if (an && dz.whistle && an.t > .3 && an.t < 1 && Math.random() < dt * 16) dz.puffs.push({ x: 118, y: -4, vx: (Math.random() - .5) * 8, vy: -2, life: .8, k: "puff" });
    if (an && an.r.blow && an.t > .8 && an.t < 1.4 && Math.random() < dt * 20) dz.puffs.push({ x: 60 + Math.random() * 50, y: 4, vx: (Math.random() - .5) * 20, vy: -6, life: 1.2, k: "steam" });
    dz.puffs = dz.puffs.filter(function (p) { p.life -= dt; p.y += (p.vy || -14) * dt; p.x += p.vx * dt; if (p.life > 0) dzImg(p.k, p.x - (p.k === "puff" ? 4 : 8), p.y + (p.k === "steam" ? 4 : 0)); return p.life > 0; });
    // red wheel with its arrows and a three-step bar
    if (dz.spin) { var st = Math.sign(dz.spin) * Math.min(Math.abs(dz.spin), dt * 9); dz.ang += st; dz.spin -= st; }
    var f8 = ((Math.round(dz.ang / (Math.PI / 16)) % 8) + 8) % 8, wr = DZW.red;
    dzImg("w_red_" + f8, DZ_WX - 15, wr.y - 15);
    dzImg("ar_close_" + (dz.lightA[0] > 0 ? 1 : 0), DZ_AL - 7, wr.y - 8); dzImg("ar_open_" + (dz.lightA[1] > 0 ? 1 : 0), DZ_AR - 7, wr.y - 8);
    dz.lightA[0] -= dt; dz.lightA[1] -= dt;
    DR(DZ_WX - 12, wr.y + 13, 25, 7, "#3a2414"); DR(DZ_WX - 11, wr.y + 14, 23, 5, "#2a2e32"); DR(DZ_WX - 11, wr.y + 14, [0, 11, 23][dz.red], 5, wr.c); DR(DZ_WX, wr.y + 14, 1, 5, "#3a2414");
    // lever, pump with planned strokes, whistle cord, turbine switch
    dzImg(dz.lever ? "lever1" : "lever0", DZ_WX - 14, DZW.yellow.y - 25);
    dz.pumpT -= dt; dzImg(dz.pumpT > 0 ? "pump1" : "pump0", DZ_WX - 14, DZW.blue.y - 22);
    for (var pn = 0; pn < dz.pumpN; pn++) { var dx = 142 + pn * 10; DR(dx + 1, 125, 3, 1, "#3a2414"); DR(dx, 126, 5, 6, "#3a2414"); DR(dx + 1, 126, 3, 5, "#4f8cc0"); DR(dx + 2, 125, 1, 1, "#4f8cc0"); DR(dx + 1, 127, 1, 1, "#bfe0f4"); }
    dzImg(dz.whistle ? "cord1" : "cord0", 113, 0);
    if (!an && !dz.intro && !dz.done && dz.route[dz.leg].wh && !dz.whistle) {                    // the game's sparkle, only for the whistle: pull me!
      for (var sp2 = 0; sp2 < 2; sp2++) { var ph = (t / 800 + sp2 * .5) % 1, sxp = 112 + (sp2 ? 11 : -1), syp = 4 + sp2 * 9; if (ph < .5) dzSpark(sxp, syp, ph < .12 || ph > .38 ? 1 : 2); } }
    // the fire door: pulled down it chokes the fire (only for emergencies); it sparkles when it should come down
    dz.doorY += ((dz.dmp === 0 ? 1 : 0) - dz.doorY) * Math.min(1, dt * 10);
    if (dz.doorY > .02) { var dh = Math.round(40 * dz.doorY), dx0 = DZ_FIRE.x0, dw = DZ_FIRE.x1 - DZ_FIRE.x0 + 2;
      DR(dx0, DZ_FIRE.y0, dw, dh, "#3a2414"); DR(dx0 + 1, DZ_FIRE.y0, dw - 2, dh - 1, "#5a6670"); DR(dx0 + 1, DZ_FIRE.y0, dw - 2, 1, "#7a8692");
      for (var rvt = 4; rvt < dw - 3; rvt += 8) { DR(dx0 + rvt, DZ_FIRE.y0 + 3, 1, 1, "#9aa6b0"); if (dh > 30) DR(dx0 + rvt, DZ_FIRE.y0 + dh - 4, 1, 1, "#9aa6b0"); }
      if (dh > 20) for (var sl = 0; sl < 5; sl++) DR(dx0 + 8 + sl * 9, DZ_FIRE.y0 + dh - 10, 5, 1, lv ? (fl ? "#f6a040" : "#d8463c") : "#2a1c18");     // the fire glows through the slits
      DR(dx0 + dw / 2 - 5, DZ_FIRE.y0 + dh - 3, 10, 2, "#e8b84a"); }
    if (sim && sim.blow && dz.dmp !== 0) { for (var ds = 0; ds < 3; ds++) { var ph2 = (t / 700 + ds / 3) % 1; if (ph2 < .5) dzSpark(DZ_FIRE.x0 + 6 + ds * 18, DZ_FIRE.y0 + 4 + (ds % 2) * 6, ph2 < .12 || ph2 > .38 ? 1 : 2); } }
    dzImg(dz.turb ? "turb1" : "turb0", 111, 62);
    if (dz.turb && an && an.r.lvl === 2) { var ta = dz.flow * 20; DR(117 + Math.round(Math.cos(ta) * 2), 79 + Math.round(Math.sin(ta) * 2), 1, 1, "#ffd34a"); }
    dzTelegraph(t, dt);
    // the bilge pump on the left wall (sparkles while there is water), the soot blower's chain (sparkles when the tubes are sooted)
    DR(19, 62, 9, 34, "#3a2414"); DR(20, 63, 7, 32, "#a8322a"); DR(21, 63, 2, 32, "#c8463c"); DR(18, 60, 11, 3, "#e8b84a"); DR(18, 94, 11, 3, "#e8b84a");
    dzLine(24, 60, 34, 50, "#3a2414"); dzLine(24, 61, 34, 51, "#5a6068"); DR(33, 48, 4, 4, "#c8342a");
    if (!an && !dz.intro && !dz.done) {
      var phs = (t / 700) % 1, big = phs < .12 || phs > .38 ? 1 : 2;
      if (dz.flood > 0 && phs < .5) dzSpark(32, 42, big);
    }
    if (dz.soot >= 3) {                                                                         // a sooted boiler: black smoke billows from its seams and the door; tap it
      var sootN = dz.soot >= 6 ? 2 : 1;
      if (Math.random() < dt * 9 * sootN) dz.soot2 = (dz.soot2 || []).concat([{ x: 56 + Math.random() * 60, y: Math.random() < .5 ? 12 : 60, r: 1.5, life: 1.6 + Math.random() }]);
      dz.soot2 = (dz.soot2 || []).filter(function (s) { s.life -= dt; s.y -= 10 * dt; s.x += Math.sin(s.life * 3) * 4 * dt; s.r += dt * 2.2; dzc.globalAlpha = Math.min(.9, s.life * .7);
        for (var yy = -s.r; yy <= s.r; yy++) { var ww = Math.round(Math.sqrt(Math.max(0, s.r * s.r - yy * yy))); DR(s.x - ww, s.y + yy, ww * 2, 1, yy < -s.r * .4 ? "#4a4a52" : "#1e1e24"); } dzc.globalAlpha = 1; return s.life > 0; });
      for (var smg = 0; smg < 14 * sootN; smg++) DR(56 + (smg * 37) % 60, 14 + (smg * 23) % 44, 2, 1, smg % 3 ? "#2a2a2e" : "#3a3a40");
    }
    if (sp2) { for (var sm = 0; sm < 10 * sp2; sm++) DR(56 + (sm * 37) % 60, 14 + (sm * 23) % 44, 1, 1, sm % 3 ? "#2a2a2e" : "#3a3a40"); if (Math.random() < dt * sp2 * 2) dz.puffs.push({ x: 70 + Math.random() * 30, y: 60, vx: (Math.random() - .5) * 6, vy: -6, life: 1.2, k: "puff" }); }
    dzHamDraw(dt);
    if (dz.flood > 0) {                                                                         // the leaking seam and water sloshing on the floor
      if (dz.evs[dz.leg] && dz.evs[dz.leg].k === "sturm") for (var jt = 0; jt < 9; jt++) DR(18 + jt * 1.5, 30 + jt * jt * .35 + (Math.floor(t / 80) % 2), 2, 1, jt % 2 ? "#e8f4fc" : "#a8d0e8");
      var fy0 = 135 - 5 - dz.flood * 5 + (dz.floodB ? 2 : 0);
      dzc.globalAlpha = .85; for (var wx = -30; wx < 210; wx++) { var wt = Math.round(fy0 + Math.sin(wx * .12 + t / 350) * 1.5); DR(wx, wt, 1, 155 - wt, (wx % 3) ? "#3e6a8a" : "#4a7a9a"); DR(wx, wt, 1, 1, "#a8d0e8"); } dzc.globalAlpha = 1;
    }
    if (!an) for (var cn = 0; cn < dz.coalN; cn++) dzImg("coal", 84 + (cn % 5) * 8, 114 - Math.floor(cn / 5) * 6 + (cn % 2));
    dz.pending.forEach(function (c) { c.fly = Math.min(1, c.fly + dt * 3.2); var x0 = c.x0 || 20, y0 = c.y0 || 118; if (c.fly < 1) dzImg("coal", x0 + (c.tx - x0) * c.fly - 4, y0 - Math.sin(c.fly * Math.PI) * 18 + (c.ty - y0) * c.fly - 4); });
    dz.pending = dz.pending.filter(function (c) { return c.fly < 1; });
    dzSparkDraw(dt); dzc.restore();
    dzRaf = requestAnimationFrame(dzDraw);
  }
  // the stoker: front view while idle; for a shovelful he turns round and works from behind (scoop, lift, throw, rest)
  function dzHamDraw(dt) {
    var h = dz.ham; h.t += dt;
    if (h.m === "throw") { h.f = h.t < .1 ? 1 : h.t < .32 ? 2 : 3; if (h.t > .12 && !h.thrown) { h.thrown = 1; for (var k = 0; k < 3; k++) dz.pending.push({ fly: 0, x0: 60 + k * 2, y0: 104, tx: 72 + Math.random() * 28, ty: 92 }); }
      if (h.t > .35 && !h.sparked) { h.sparked = 1; dzSparks(88, 86, 12); dz.flare = .5; dzShake(.12); } if (h.t > 1.4) { h.m = "front"; h.t = 0; } }
    if (h.m === "front") dzImg(dz.shovT > 0 ? "ham_st1" : "ham_st0", 14, 95 - (h.t < .12 ? 2 : 0));
    else dzImg("ham_b" + h.f, 14, 91);
    // while dragging a shovelful: a dotted arc from the scuttle to the finger
    var g = dz.drag; if (g && g.coal) { for (var q = 0; q <= 10; q++) { var u = q / 10, ax = 60 + (g.x - 60) * u, ay = 104 + (g.y - 104) * u - Math.sin(u * Math.PI) * 14; if (q % 2 === 0) DR(ax, ay, 1, 1, "#ffe08a"); } dzImg("coal", g.x - 4, g.y - 4); }
  }
  function dzSpark(x, y, s) {                                                                  // the 7x7 sparkle star of the game, small or full
    if (s === 1) { DR(x + 2, y + 3, 3, 1, "#ffd34a"); DR(x + 3, y + 2, 1, 3, "#ffd34a"); DR(x + 3, y + 3, 1, 1, "#fff"); return; }
    DR(x + 3, y, 1, 7, "#ffd34a"); DR(x, y + 3, 7, 1, "#ffd34a"); DR(x + 2, y + 2, 3, 3, "#ffd34a"); DR(x + 3, y + 2, 1, 3, "#fff"); DR(x + 2, y + 3, 3, 1, "#fff");
  }
  // ---- the sea: a small height field rendered per pixel into an offscreen canvas, five tones per sky, perspective towards the horizon ----
  var DZ_WC = document.createElement("canvas"); DZ_WC.width = 180; DZ_WC.height = 63; var dzWx = DZ_WC.getContext("2d"), dzWd = dzWx.createImageData(180, 63);
  var DZ_WP = { day: ["#2e5e92", "#3e7ab8", "#5a96cc", "#8cc0e6", "#e8f4fc"], storm: ["#1a2e40", "#26425a", "#3a6078", "#6a92aa", "#eef4f8"], night: ["#0a1224", "#101c34", "#182846", "#283a60", "#7a8ab8"],
    eve: ["#2a3460", "#3a4874", "#56659a", "#d8906a", "#ffd38a"], dawn: ["#3a5888", "#4a6898", "#6a88b6", "#d8a8b8", "#fff0d0"], fog: ["#587890", "#6888a0", "#88a0b4", "#a8bacb", "#dde6ec"] };
  var DZ_WRGB = {}; Object.keys(DZ_WP).forEach(function (k) { DZ_WRGB[k] = DZ_WP[k].map(function (h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }); });
  function dzSwell(x, t, sx) { return 2.2 + 2.2 * Math.sin(x * .045 - t * .0016 - sx * .03) + 1.2 * Math.sin(x * .11 - t * .0023); }
  function dzWater(t, sx, sky, storm, calm) {
    var P = DZ_WRGB[sky] || DZ_WRGB.day, d = dzWd.data, amp = calm ? .35 : storm ? 1.7 : 1;
    for (var r = 0; r < 63; r++) {
      var dd = r / 62, sc = .25 + dd * 1.75, off = sx * (.35 + dd * 1.2), band = Math.sin(r * (2.4 / sc) - t * (storm ? .005 : .003));
      for (var x = 0; x < 180; x++) {
        var o = (r * 180 + x) * 4;
        if (storm && r < dzSwell(x, t, sx)) { d[o + 3] = 0; continue; }                         // the horizon heaves in a storm
        var xs = x - off, v = Math.sin(xs * .11 / sc - t * .0016) * .45 + Math.sin(xs * .045 / sc - t * .0011 + r * .31) * .3 + Math.sin(xs * .23 / sc + r * 1.7 - t * .0023) * .2 + band * .45;
        v = v * amp + ((x + r) % 2 ? .07 : -.07);
        var ci = v < -.6 ? 0 : v < 0 ? 1 : v < .5 ? 2 : v < .95 ? 3 : (!calm && (storm || dd > .45) ? 4 : 3);
        if (r === 0 && !storm) ci = 3;
        var c = P[ci]; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
      }
    }
    dzWx.putImageData(dzWd, 0, 0); dzc.drawImage(DZ_WC, 0, 72);
  }
  // in a storm the near swell rolls past in front of the hull, with foam on its crest
  function dzFrontSwell(t, sx) {
    var P = DZ_WP.storm;
    for (var x = 0; x < 180; x++) {
      var h = 6 + 4 * Math.sin(x * .05 - t * .0021 - sx * .06) + 1.8 * Math.sin(x * .13 - t * .003), top = Math.round(82 - h), slope = Math.cos(x * .05 - t * .0021 - sx * .06);
      for (var y = top; y < 92; y++) { var k = y - top; if (k > 6 && (x + y) % 2) continue; if (k > 9) break;
        DR(x, y, 1, 1, k === 0 ? P[4] : k === 1 ? (slope > 0 ? P[4] : P[3]) : k < 3 ? P[3] : (slope > 0 ? P[2] : P[1])); }
      if (slope > .6 && (x + Math.floor(t / 70)) % 3 === 0) DR(x, top - 1 - ((x * 7) % 2), 1, 1, P[4]);     // spray blown off the crest
    }
  }
  // Nuss York's skyline across the whole horizon, behind a veil of haze: blocks with water towers, lit windows at night,
  // the tall towers standing out (after the Singer Building, the Park Row Building and the Metropolitan Life tower)
  function dzSkyline(x0, sky, night, haze) {
    var far = night ? "#161c34" : sky === "fog" ? "#8a949e" : sky === "dawn" ? "#8a7a98" : "#8a9cb4", near = night ? "#1e2440" : sky === "fog" ? "#6a7480" : sky === "dawn" ? "#6a5a78" : "#6a7c98";
    for (var b = 0; b < 60; b++) { var bh = 5 + (b * 13) % 8, bx = x0 + b * 4; DR(bx, 70 - bh - 4, 4, bh + 4, far); }
    for (var q = 0; q < 46; q++) { var w = 4 + (q * 7) % 4, h = 7 + (q * 11) % 11, x = x0 + q * 5;
      DR(x, 70 - h, w, h, near);
      if (q % 3 === 0) { DR(x + 1, 70 - h - 3, 2, 2, near); DR(x + 1, 70 - h - 1, 1, 1, near); DR(x + 2, 70 - h - 1, 1, 1, near); }      // a water tower on its legs
      for (var wy = 70 - h + 2; wy < 69; wy += 3) for (var wx = x + 1; wx < x + w - 1; wx += 2) if (((wx * 7 + wy * 3 + q) % 5) < (night ? 3 : 1)) DR(wx, wy, 1, 1, night ? "#ffe08a" : "#a8b8cc"); }
    var tw = function (cx, top, w) { DR(cx - w, top, w * 2 + 1, 70 - top, near); };
    tw(x0 + 70, 40, 2); DR(x0 + 68, 37, 5, 3, near); DR(x0 + 69, 34, 3, 3, near); DR(x0 + 70, 30, 1, 4, near);                        // Singer
    tw(x0 + 104, 46, 3); DR(x0 + 101, 44, 2, 2, near); DR(x0 + 106, 44, 2, 2, near);                                                     // Park Row
    tw(x0 + 140, 36, 3); DR(x0 + 138, 33, 5, 3, near); DR(x0 + 139, 30, 3, 3, near); DR(x0 + 140, 27, 1, 3, near); DR(x0 + 140, 26, 1, 1, night ? "#ffd34a" : near);   // Met Life with its lantern
    if (night) { DR(x0 + 70, 38, 1, 1, "#ffe08a"); DR(x0 + 140, 34, 1, 1, "#ffe08a"); }
    dzc.globalAlpha = night ? .22 : .38; DR(0, 26, 180, 46, haze); dzc.globalAlpha = night ? .1 : .22; DR(0, 52, 180, 20, haze); dzc.globalAlpha = 1;     // the haze lying over the city
  }
  // ---- the arrival: a celebration (90 % and more right), an ordinary arrival (70-90 %), a dreary one (below) ----
  function dzEndDraw(t, dt) {
    var E = dz.ending, g = E.g; E.t += dt; var S = E.S;
    var night = dz.arrNight, sky = night ? "night" : g === 2 ? "day" : g === 1 ? "dawn" : "fog", sc = DZ_SKY[sky];
    for (var y = 0; y < 72; y++) DR(0, y, 180, 1, y < 24 ? sc[0] : y < 48 ? sc[1] : sc[2]);
    if (g === 2 && !night) { DR(150, 10, 8, 8, "#fff6c0"); DR(151, 9, 6, 10, "#fff6c0"); }
    if (night) for (var st = 0; st < 50; st++) DR((st * 53 + st * st) % 180, (st * 29) % 60, 1, 1, (st + Math.floor(t / 400)) % 7 ? "#c8d0f0" : "#ffffff");
    for (var cl = 0; cl < (night ? 0 : g === 0 ? 7 : 3); cl++) { dzc.globalAlpha = g === 0 ? .95 : .8; dzImg("cloud", ((cl * 47 + t / 300) % 240) - 40, 8 + (cl % 3) * 12); dzc.globalAlpha = 1; }
    dzSkyline(-10, sky, night, sc[2]);
    if (night && g === 2) {                                                                        // fireworks over the harbour
      if (Math.random() < dt * 1.6) { var fx0 = 40 + Math.random() * 120, fy0 = 10 + Math.random() * 30, fc0 = ["#ffd34a", "#e8554a", "#6fd04a", "#4a9ae8", "#e87ab0"][Math.floor(Math.random() * 5)]; for (var fw = 0; fw < 24; fw++) { var fa = fw / 24 * Math.PI * 2; S.fw.push({ x: fx0, y: fy0, vx: Math.cos(fa) * 26, vy: Math.sin(fa) * 26, life: 1.1, c: fc0 }); } dzTone(90, .4, .2, "triangle", .3, 50); dzNoise(.5, 600, .6, .12, .01, .4, .3); }
      S.fw = S.fw.filter(function (f) { f.life -= dt; f.vy += 18 * dt; f.vx *= .985; f.x += f.vx * dt; f.y += f.vy * dt; DR(f.x, f.y, 1, 1, f.life > .4 ? f.c : "#ffffff"); return f.life > 0; });
    }
    dzWater(t, 0, sky, false, false);
    var SX = 64, SYY = 42, shipIm = DZI.sv_ship;
    if (dzOk(shipIm, "sv_ship")) { dzc.save(); dzc.globalAlpha = .16; dzc.translate(0, 144); dzc.scale(1, -1); dzc.drawImage(shipIm, 0, 0, 140, 30, SX, SYY, 140, 30); dzc.restore(); }
    if (Math.random() < dt * (g === 0 ? 2 : 6)) S.puffs.push({ x: SX + 49 + Math.floor(Math.random() * 3) * 15, y: SYY + 2, life: 1.8 });
    S.puffs = S.puffs.filter(function (p) { p.life -= dt; p.x += 8 * dt; p.y -= 8 * dt; dzc.globalAlpha = Math.min(1, p.life); dzImg("puff", p.x - 4, p.y - 4); dzc.globalAlpha = 1; return p.life > 0; });
    dzImg("sv_ship", SX, SYY);
    if (night) for (var pw = 0; pw < 28; pw++) DR(SX + 8 + pw * 4.3, SYY + 25 + (pw % 2) * 2, 1, 1, "#ffe8a0");
    if (g === 2) {                                                                                 // dressed overall: signal flags from bow over the mastheads to the stern
      var pts = [[SX + 3, SYY + 17], [SX + 24, SYY], [SX + 116, SYY + 1], [SX + 135, SYY + 18]], fc = ["#c8342a", "#f4f0e6", "#2e3a8a", "#ffd34a", "#5a9a48"];
      for (var sgm = 0; sgm < 3; sgm++) { var A = pts[sgm], Bp = pts[sgm + 1], nn = Math.round(Math.hypot(Bp[0] - A[0], Bp[1] - A[1]) / 4); for (var k = 0; k < nn; k++) { var u = k / nn; DR(A[0] + (Bp[0] - A[0]) * u, A[1] + (Bp[1] - A[1]) * u + 1, 2, 2, fc[(k + sgm) % 5]); } } }
    dzImg("sv_pier", -16, 56);
    var crowd = g === 2 ? 34 : g === 1 ? 16 : 5;
    for (var cw = 0; cw < crowd; cw++) { var cx = 2 + cw * (60 / crowd), wave = g > 0 && (Math.floor(t / 180) + cw) % 3 === 0;
      DR(cx, 88, 1, 3, g === 0 ? "#2a2a30" : ["#3a3028", "#5a4a8a", "#8a3a3a", "#2e3a5a", "#5a7a3a"][cw % 5]); DR(cx, 87 - (wave ? 1 : 0), 1, 1, "#e8c8a8");
      if (g === 0) { DR(cx - 1, 85, 3, 1, "#1e1e24"); DR(cx, 86, 1, 1, "#1e1e24"); } }                    // umbrellas in the drizzle
    var tugX = g === 2 ? [58, 150] : g === 1 ? [58, 128] : [92];
    for (var tu = 0; tu < tugX.length; tu++) { var tux = tugX[tu] + Math.sin(t / 500 + tu) * 2, tuy = 59 + tu * 2 + Math.round(Math.sin(t / 380 + tu)); dzImg("sv_tug", tux, tuy); if (Math.random() < dt * 4) S.smk.push({ x: tux + 19, y: tuy + 1, vx: 3, life: 1.3, c: "#5a5e66" }); }
    if (g === 2) {                                                                                 // fireboats spraying arcs of water, confetti, streamers
      for (var fbt = 0; fbt < 2; fbt++) { var fx = fbt ? 122 : 90, fy = 66 - fbt * 2 + Math.round(Math.sin(t / 420 + fbt)); dzImg("sv_tug", fx, fy);                 // fireboats escorting alongside, spraying
        for (var dr = 0; dr < 3; dr++) { if (Math.random() < dt * 30) S.drops.push({ x: fx + 12 + dr * 6, y: fy + 2, vx: (fbt ? 18 : 14) + dr * 4 - 10 * (dr - 1), vy: -60 - Math.random() * 10, life: 1.6 }); } }
      if (Math.random() < dt * 30) S.conf.push({ x: SX + 30 + Math.random() * 90, y: SYY + 6, vx: (Math.random() - .5) * 10, vy: -10 - Math.random() * 10, c: ["#c8342a", "#ffd34a", "#5a9a48", "#2e3a8a", "#f4f0e6"][Math.floor(Math.random() * 5)], life: 3 });
    }
    S.drops = S.drops.filter(function (d) { d.life -= dt; d.vy += 70 * dt; d.x += d.vx * dt; d.y += d.vy * dt; DR(d.x, d.y, 1, 1, d.life > 1 ? "#e8f4fc" : "#a8d0e8"); return d.life > 0 && d.y < 90; });
    S.conf = S.conf.filter(function (c) { c.life -= dt; c.vy += 14 * dt; c.x += c.vx * dt + Math.sin(c.life * 6) * .3; c.y += c.vy * dt; DR(c.x, c.y, 1, 1, c.c); return c.life > 0 && c.y < 135; });
    S.smk = S.smk.filter(function (m) { m.life -= dt; m.x += m.vx * dt; m.y -= 7 * dt; dzc.globalAlpha = Math.min(1, m.life) * .8; DR(m.x, m.y, m.life > .7 ? 1 : 2, m.life > .7 ? 1 : 2, m.c); dzc.globalAlpha = 1; return m.life > 0; });
    if (g === 0) { dzc.globalAlpha = .45; for (var rn = 0; rn < 30; rn++) { var rx = ((rn * 23 + t / 6) % 200) - 10, ry = ((rn * 37 + t / 4) % 140) - 5; DR(rx, ry, 1, 2, "#c8d4e0"); } dzc.globalAlpha = 1;
      var gx = ((t / 40) % 220) - 20; DR(gx, 30 + Math.sin(t / 300) * 3, 2, 1, "#f4f0e6"); DR(gx + 2, 31 + Math.sin(t / 300) * 3, 1, 1, "#f4f0e6"); }      // one lone gull
    if (!E.sounded) { E.sounded = 1; if (g === 2) { dzWhistle(2); setTimeout(function () { dzBell(3); dzNoise(2.4, 900, .4, .12, .3, 1.2); }, 900); setTimeout(function () { dzToot(1); }, 1600); setTimeout(function () { dzToot(0); }, 2300); }
      else if (g === 1) { dzWhistle(1.4); setTimeout(function () { dzNoise(1.4, 900, .4, .06, .3, .8); }, 800); } else { dzTone(392, .5, .08, "triangle", .2); dzTone(370, .5, .08, "triangle", .7); dzTone(349, .5, .08, "triangle", 1.2); dzTone(330, 1.2, .08, "triangle", 1.7); } }
    if (g === 2 && E.t > 3) dzJubel(t, dt, E);
    if (E.t > (g === 2 ? 9 : 6.5) && !E.carded) { E.carded = 1; dzArriveCard(); }
  }
  // ---- the water the ship moves: a bow wave climbing the stem, a hump along the forefoot, churned water astern,
  //      and the Kelvin wake, crests running out from bow and stern towards the viewer. Everything scales with the speed. ----
  function dzWake(t, dt, S, SX, WL, sp, sky) {
    var k = Math.min(1, sp / 52); if (k < .03) return;
    var night = sky === "night", F = night ? "#8a9ac8" : "#ffffff", F2 = night ? "#5a6a98" : "#d8ecf8", fl = Math.floor(t / 90);
    dzc.globalAlpha = Math.min(1, .35 + k);
    // Kelvin wake: the bow wave's arm spreading out towards the viewer as a dashed foam line with a trough,
    // transverse crests inside it, and the same smaller from the stern
    var TR = night ? "#0a1224" : sky === "storm" ? "#1a2e40" : "#2a5488";
    [[SX + 4, 1], [SX + 125, .7]].forEach(function (o) {
      var n = Math.round(46 * o[1]);
      for (var i2 = 0; i2 < n; i2++) { var s2 = i2 / n, ax = o[0] + s2 * (70 + 40 * k) * o[1], ay = Math.round(WL + 2 + s2 * (26 + 16 * k) * o[1]); if (ay > 133) break;
        var on = ((i2 + Math.floor(t / 70)) % 4) < 3, al = (1 - s2) * (.35 + .65 * k);
        dzc.globalAlpha = al; if (on) DR(ax, ay, 2, 1, s2 < .4 ? F : F2); dzc.globalAlpha = al * .6; DR(ax + 1, ay + 1, 2, 1, TR); }
      for (var c = 0; c < 4; c++) { var u = ((t / (1400 - 600 * k)) + c / 4) % 1, cx = o[0] + 10 + u * 60 * o[1], cy = Math.round(WL + 3 + u * 6), ln = Math.round((3 + u * 7) * o[1]);
        dzc.globalAlpha = (1 - u) * (.3 + .6 * k); DR(cx, cy, ln, 1, F2); DR(cx, cy + 1, ln, 1, TR); } });
    dzc.globalAlpha = Math.min(1, .35 + k);
    // the bow wave climbing the stem, with spray ahead
    var bh = Math.round(1 + k * 5); for (var i = 0; i < bh; i++) { var w = Math.max(1, Math.round((bh - i) * .8 + ((fl + i) % 2))); DR(SX + 4 - w + i * .3, WL - i, w + 1, 1, i === bh - 1 ? F2 : F); }
    for (var s = 0; s < Math.round(k * 5); s++) { var ph = ((t / 300) + s * .37) % 1; DR(SX - 2 - ph * 6 - s, WL - 2 - Math.sin(ph * Math.PI) * (2 + k * 3), 1, 1, F); }
    // the hump of water along the forefoot, curling back along the hull
    for (var x = 0; x < 18 + 14 * k; x++) { var hh = Math.round(Math.max(0, (k * 2.5) * Math.sin(x / (18 + 14 * k) * Math.PI) + Math.sin(x * .7 + t / 120) * .5)); DR(SX + 5 + x, WL - hh, 1, 1, (x + fl) % 3 ? F : F2); }
    // churned water astern: the propellers' wash, a foamy trail that widens towards the viewer and thins out
    var wl2 = 40 + 60 * k;
    for (var q = 0; q < wl2; q++) { var den = 1 - q / wl2, wid = 2 + Math.round(q * (.12 + .1 * k));
      for (var r = 0; r < wid; r++) { var jit = (q * 7 + r * 13 + fl * 5) % 11; if (jit / 11 > den * (r < 2 ? 1.2 : .8)) continue;
        dzc.globalAlpha = Math.min(1, (.4 + .6 * k) * (den + .2)); DR(SX + 127 + q, WL - 1 + r, 1, 1, r === 0 || jit % 3 === 0 ? F : (night ? "#3a4a70" : "#a8d8f0")); } }
    dzc.globalAlpha = 1;
  }
  // the celebration from the rail: the drawn crowd, confetti falling, the press photographer's flash going off every so often
  function dzJubel(t, dt, E) {
    var J = E.J || (E.J = { conf: [], flashT: .6, smoke: [], hats: [], hatT: .3 }), nd = dz.arrNight ? "n" : "d";
    DR(-30, -20, 240, 175, "#000000"); dzImg("jubel_" + nd + [0, 1, 0, 2][Math.floor(E.t / .22) % 4], 0, 17);
    J.hatT -= dt; if (J.hatT <= 0) { J.hatT = .25 + Math.random() * .5; J.hats.push({ k: ["top", "bowler", "boater", "picture", "cap", "newsboy"][Math.floor(Math.random() * 6)], x: 30 + Math.random() * 140, y: 70 + Math.random() * 14, vy: -70 - Math.random() * 30, vx: (Math.random() - .5) * 16, life: 2.4 }); }
    J.hats = J.hats.filter(function (h) { h.life -= dt; h.vy += 75 * dt; h.x += h.vx * dt; h.y += h.vy * dt; dzImg("jh_" + h.k, h.x - 11, h.y - 9); return h.life > 0 && h.y < 120; });
    if (Math.random() < dt * 40) J.conf.push({ x: Math.random() * 180, y: 10, vy: 6 + Math.random() * 8, ph: Math.random() * 6, c: ["#ffd34a", "#c8342a", "#5a9a48", "#2e8ad8", "#e87ab0", "#ffffff"][Math.floor(Math.random() * 6)] });
    J.conf = J.conf.filter(function (c) { c.y += c.vy * dt; c.ph += dt * 5; DR(c.x + Math.sin(c.ph) * 1.5, c.y, 1, 1, c.c); return c.y < 112; });
    J.flashT -= dt;
    if (J.flashT <= 0 && nd === "d") J.flashT = 99;
    if (J.flashT <= 0) { J.flashT = 1.6 + Math.random() * 1.4; J.fl = 1; beep([[2400, .03], [1800, .06]]); dzNoise(.25, 3000, .8, .1, .005, .2); for (var k = 0; k < 3; k++) J.smoke.push({ x: 171 + k * 2, y: 79 - k * 3, r: 2 + k * .6, life: 1.6 }); }
    if (J.fl > 0) { var f = J.fl; J.fl -= dt * 2.6;
      for (var r = 6; r > 0; r--) { dzc.globalAlpha = Math.max(0, f) * .12; var R = (40 + 80 * f) * r / 6; dzc.fillStyle = "#fffae6"; dzc.beginPath(); dzc.arc(168, 79, R, 0, Math.PI * 2); dzc.fill(); }
      dzc.globalAlpha = 1; if (f > .3) { DR(166, 77, 7, 4, "#ffffff"); DR(168, 76, 3, 6, "#fff6a0"); } }
    J.smoke = J.smoke.filter(function (s) { s.life -= dt; s.y -= 7 * dt; s.r += dt * 1.5; dzc.globalAlpha = Math.min(1, s.life) * .8; for (var yy = -s.r; yy <= s.r; yy++) { var ww = Math.round(Math.sqrt(Math.max(0, s.r * s.r - yy * yy))); DR(s.x - ww, s.y + yy, ww * 2, 1, "#c8c8d0"); } dzc.globalAlpha = 1; return s.life > 0; });
    if (!J.cheered) { J.cheered = 1; dzNoise(3, 800, .35, .14, .3, 1.5); dzNoise(3, 1600, .5, .06, .3, 1.5); }   // the crowd's roar
  }
  // ---- outside: the Pausbacke sails through the leg ----
  var DZ_SKY = { day: ["#8ec8ec", "#a8d6f2", "#c6e6f8"], eve: ["#6a7ab8", "#e89a6a", "#f6c88a"], night: ["#0e1430", "#18204a", "#243060"], dawn: ["#8a9ac8", "#e8b8c0", "#f6dcc0"], fog: ["#b8c4cc", "#c8d2d8", "#d4dce0"], storm: ["#22282f", "#2e353e", "#3c444e"] };
  function dzSea(t, dt) {
    var a = dz.anim, S = a.sea, L = dz.route[dz.leg], kind = L.s, lvl = a.r.lvl, sp0 = [0, 24, 52][a.prevLvl], sp1 = [0, 24, 52][lvl];
    var fd = Math.min(1, (a.t - DZ_OUT) / 1.2), sp = sp0 + (sp1 - sp0) * (fd * (2 - fd));
    var ev = dz.evs[dz.leg] && dz.evs[dz.leg].k, storm = ev === "sturm";
    var arrN = dz.arrNight && (kind === "feuerschiff" || kind === "quar" || kind === "liberty" || kind === "ny");
    var sky = arrN ? "night" : storm ? "storm" : kind === "nebel" ? "fog" : kind === "eiswarn" ? "eve" : kind === "eis" ? "night" : kind === "morgen" ? "dawn" : "day";
    var tt = a.t - DZ_OUT, run = DZ_STAMP - DZ_OUT; if (a.toot) { a.toot = null; } if (tt > run) sp *= Math.max(0, 1 - (tt - run) * 2);
    var SX = kind === "eis" || kind === "newyork" ? 44 : kind === "ny" ? 64 : 22, BOW = SX + 2;
    // something ahead that the ship must stop for (the drifting New York, the iceberg) or the pier at the end
    if (kind === "eis" || kind === "newyork") {
      var w = kind === "eis" ? 44 : 84, stopX = lvl ? BOW + 3 : BOW - 4;
      S.ob = Math.min(stopX, S.ob + (lvl ? 34 + sp : 36) * dt);
      if (lvl && S.ob >= stopX && !S.bump) { S.bump = 1; dzShake(.5); dzBuzz([60, 30, 120]); beep([[110, .12], [80, .16]]); }
      if (S.ob >= stopX) sp = 0;
    }
    if (kind === "ny") { S.pier = Math.min(BOW - 4, S.pier + Math.max(sp, 16) * dt); if (S.pier >= BOW - 4) sp = 0; }
    if (kind === "reede" && lvl === 0) S.tend = Math.min(1, S.tend + dt * .5);
    S.x += sp * dt;
    var sc = DZ_SKY[sky], calm = sky === "night";
    // the sky: three bands with dithered seams. The ship steams west (bow left): the evening sun sets ahead, the dawn rises astern
    for (var y = 0; y < 72; y++) { var bnd = y < 24 ? 0 : y < 48 ? 1 : 2, seam = (y % 24) < 3 && y > 3; for (var dx0 = 0; dx0 < 180; dx0 += 2) DR(dx0 + (y % 2), y, 2, 1, seam && ((dx0 / 2 + y) % 2) ? sc[Math.max(0, bnd - 1)] : sc[bnd]); }
    if (sky === "night") { for (var s = 0; s < 70; s++) { var stx = (s * 53 + s * s) % 180, sty = (s * 29) % 66; DR(stx, sty, 1, 1, (s + Math.floor(t / 400)) % 9 ? "#c8d0f0" : "#ffffff"); } dzc.globalAlpha = .12; for (var mw = 0; mw < 180; mw += 2) DR(mw, 10 + mw * .25 + Math.sin(mw * .2) * 3, 2, 6, "#c8d0f0"); dzc.globalAlpha = 1; }
    if (sky === "day") { DR(150, 10, 8, 8, "#fff6c0"); DR(151, 9, 6, 10, "#fff6c0"); DR(149, 11, 10, 6, "#fff6c0"); }
    if (sky === "eve") { for (var sr2 = 0; sr2 < 7; sr2++) DR(26 - sr2 + (sr2 > 3 ? 2 * (sr2 - 3) : 0), 58 + sr2, 14 + 2 * Math.min(sr2, 6 - sr2), 1, "#ffd38a"); }
    if (sky === "dawn") { for (var dr2 = 0; dr2 < 6; dr2++) DR(150 - Math.min(dr2, 5 - dr2), 64 + dr2, 12 + 2 * Math.min(dr2, 5 - dr2), 1, "#fff0b0"); }
    if (sky === "storm") {                                                                       // low, heavy storm clouds racing past, and now and then lightning
      for (var sc2 = 0; sc2 < 9; sc2++) { var cxs = ((sc2 * 37 + t / 30) % 260) - 40, cys = 6 + (sc2 % 3) * 14, rw = 22 + (sc2 % 4) * 6;
        for (var ry2 = -6; ry2 <= 6; ry2++) { var ww = Math.round(rw * Math.sqrt(1 - (ry2 / 6.5) * (ry2 / 6.5))); DR(cxs - ww, cys + ry2, ww * 2, 1, ry2 < -2 ? "#4a525c" : ry2 < 3 ? "#363d46" : "#262c33"); } }
      if (!S.flashT && Math.random() < dt * .25) { S.flashT = .25; S.boltX = 20 + Math.random() * 140; setTimeout(function () { dzNoise(1.6, 120, .6, .3, .02, 1.2); dzTone(48, 1.4, .25, "triangle", 0, 30); }, 400); }
      if (S.flashT > 0) { S.flashT -= dt; var bx2 = S.boltX, by2 = 4; for (var bs = 0; bs < 8; bs++) { var nx2 = bx2 + (Math.random() - .5) * 8; dzLine(bx2, by2, nx2, by2 + 8, "#fff8d0"); bx2 = nx2; by2 += 8; } dzc.globalAlpha = S.flashT * 1.6; DR(0, 0, 180, 135, "#e8eef8"); dzc.globalAlpha = 1; } else S.flashT = 0;
    }
    if (sky === "day" || sky === "dawn" || sky === "eve") for (var cl = 0; cl < 4; cl++) { dzc.globalAlpha = sky === "storm" ? .9 : .8; dzImg("cloud", ((cl * 61 + S.x * .08 + t / 400) % 240) - 40, 14 + (cl % 2) * 14); dzc.globalAlpha = 1; }
    var hillC = sky === "night" ? "#1a2a3a" : sky === "fog" ? "#a0acb4" : sky === "eve" ? "#7a6a6a" : sky === "storm" ? "#4a6050" : "#7cb860", hillD = sky === "day" || sky === "dawn" ? "#5a9848" : hillC;
    var coast = kind === "kueste" || kind === "abfahrt" || kind === "reede" || kind === "ny" || kind === "newyork" || kind === "fastnet" || kind === "quar" || kind === "liberty" || kind === "lotse";
    if (kind === "ny" || kind === "liberty") dzSkyline(-20 + S.pier * .1 + S.x * .05, sky, sky === "night", sc[2]);
    if (coast || kind === "feuerschiff") for (var hx = -40; hx < 220; hx += 46) { var bx = ((hx + S.x * .3) % 230 + 230) % 230 - 40, hh0 = coast ? 12 : 5;
      for (var k = 0; k < 40; k++) { var hh = hh0 * Math.sin(k / 40 * Math.PI); DR(bx + k, 70 - hh, 1, hh + 2, k > 24 ? hillD : hillC); }
      if (coast && sky !== "fog") for (var hs = 0; hs < 3; hs++) { var hxx = bx + 10 + hs * 8, hyy = 70 - hh0 * Math.sin((10 + hs * 8) / 40 * Math.PI); DR(hxx, hyy - 2, 3, 2, "#f4f0e6"); DR(hxx, hyy - 3, 3, 1, "#c8463c"); if (sky === "night" || sky === "eve") DR(hxx + 1, hyy - 1, 1, 1, "#ffe8a0"); } }
    // the sea: three bands, dithered seams, wave crests that drift with the speed; flat calm on the night of the iceberg
    dzWater(t, S.x, sky, storm, calm);
    if (sky === "eve") for (var gl = 0; gl < 12; gl++) DR(24 + ((gl * 7 + Math.floor(t / 120)) % 18), 74 + gl * 2, 2 + gl % 2, 1, "#ffd38a");        // the low sun glitters on the water
    if (sky === "night") for (var sg = 0; sg < 10; sg++) DR((sg * 47) % 180, 76 + (sg * 11) % 50, 1, 1, (sg + Math.floor(t / 300)) % 3 ? "#5a6a98" : "#c8d0f0");
    if (kind === "eiswarn") for (var f = 0; f < 5; f++) dzImg("sv_floe", (((f * 47) + S.x * 1.2) % 220 + 220) % 220 - 20, 84 + (f * 17) % 40);
    // far props
    if (kind === "abfahrt") { dzImg("sv_shed", 104 + S.x, 42); dzImg("sv_crane", 118 + S.x, 20); dzImg("sv_crane", 150 + S.x, 20);
      for (var cw = 0; cw < 30; cw++) { var cx2 = 106 + S.x + cw * 2.3, wave = (Math.floor(t / 200) + cw) % 3 === 0; DR(cx2, 68, 1, 2, ["#3a3028", "#5a4a8a", "#8a3a3a", "#2e3a5a"][cw % 4]); DR(cx2, 67 - (wave ? 1 : 0), 1, 1, "#e8c8a8"); } }   // the crowd waving on the quay
    if (kind === "fastnet") dzImg("sv_harb", ((S.x * .6 + 20) % 260) - 60, 16);
    if (kind === "quar") { var qx = 30 + S.x * .3; DR(qx, 58, 22, 10, "#d8c8a8"); DR(qx, 56, 22, 2, "#8a3a3a"); for (var qw = 0; qw < 4; qw++) DR(qx + 3 + qw * 5, 61, 2, 3, "#3a3028"); DR(qx + 9, 50, 3, 6, "#d8c8a8"); DR(qx + 9, 48, 3, 2, "#8a3a3a"); DR(qx + 10, 44, 1, 4, "#5a4a40"); DR(qx + 11, 44, 3, 2, "#e8e8f0"); }   // the quarantine station with its flag
    if (kind === "lotse") { var nb = 10 + S.x * .5; dzImg("sv_lightship", nb, 38); }
    if (kind === "gruss") { var oim = DZI.sv_ship; if (dzOk(oim, "sv_ship")) { var ox = -10 + Math.min(1, tt / 5) * 200; dzc.save(); dzc.translate(Math.round(ox), 52); dzc.scale(-.6, .6); dzc.drawImage(oim, 0, 0); dzc.restore();
      if (Math.random() < dt * 6) S.smk.push({ x: ox - 33 - Math.floor(Math.random() * 3) * 9, y: 54, vx: -8, life: 1.6, c: "#8a8e96" });
      if (dz.whistle && !S.answered && tt > 2.5) { S.answered = 1; dzWhistle(1.2); } } }   // her sister Olympic far off, steaming east
    if (kind === "kueste") for (var sb = 0; sb < 2; sb++) { var sbx = ((sb * 90 + S.x * .4) % 220) - 20, sby = 66 + sb * 2; DR(sbx, sby + 3, 7, 2, "#5a3a28"); DR(sbx + 3, sby - 4, 1, 7, "#5a3a28"); DR(sbx + 4, sby - 3, 3, 5, "#f4f0e6"); }   // little sailing boats
    if (kind === "see" && !storm) { var stx2 = ((S.x * .15 + 40) % 240) - 30; DR(stx2, 69, 9, 2, "#3a4a5a"); DR(stx2 + 3, 66, 2, 3, "#3a4a5a"); dzc.globalAlpha = .5; DR(stx2 + 5, 62, 3, 2, "#c8d0d8"); DR(stx2 + 8, 60, 3, 2, "#c8d0d8"); dzc.globalAlpha = 1; }   // another steamer on the horizon
    if (kind === "see" && !storm) { var pp = (t / 1400) % 1, ppx = 30 + ((Math.floor(t / 1400) * 47) % 100); if (pp < .35) { var arc = Math.sin(pp / .35 * Math.PI); DR(ppx + pp * 30, 96 - arc * 6, 4, 2, "#4a5a6a"); DR(ppx + pp * 30 + 2, 95 - arc * 6, 1, 1, "#4a5a6a"); DR(ppx + pp * 30, 98, 5, 1, "#ffffff"); } }   // porpoises
    if (kind === "feuerschiff") { var lsx = -6 + S.x * .45; dzImg("sv_lightship", lsx, 38); if (Math.floor(t / 500) % 3 === 0) { dzc.globalAlpha = .5; DR(lsx + 9, 39, 7, 3, "#fff6a0"); DR(lsx + 37, 39, 7, 3, "#fff6a0"); dzc.globalAlpha = 1; } }
    if (arrN && kind === "liberty") { var lx2 = 2 + Math.min(1, tt / 5.5) * 54; dzc.globalAlpha = .35 + Math.sin(t / 200) * .1; DR(lx2 + 15, 3, 6, 5, "#fff1a8"); dzc.globalAlpha = 1; }
    if (kind === "liberty") dzImg("sv_liberty", 2 + Math.min(1, tt / 5.5) * 54, 6);
    // the ship, bobbing, smoke from the three working funnels (the fourth was a dummy), a wake behind
    var bob = Math.round(Math.sin(t / (storm ? 180 : 300)) * (storm ? 2 : .6)), SYY = 72 - 30 + bob;
    if (lvl && Math.random() < dt * (5 + lvl * 9)) { var fi = Math.floor(Math.random() * 3); S.puffs.push({ x: SX + 49 + fi * 15, y: SYY + 2, life: 1.8 }); }
    S.puffs = S.puffs.filter(function (p) { p.life -= dt; p.x += (10 + sp * .7) * dt; p.y -= 8 * dt; dzc.globalAlpha = Math.min(1, p.life) * (sky === "night" ? .6 : 1); dzImg("puff", p.x - 4, p.y - 4); dzc.globalAlpha = 1; return p.life > 0; });
    if (a.sootBlow && tt < 3) { if (Math.random() < dt * 30) S.blk.push({ x: SX + 49 + Math.floor(Math.random() * 3) * 15, y: SYY, r: 2, life: 2.2 }); }
    S.blk = (S.blk || []).filter(function (b) { b.life -= dt; b.y -= 9 * dt; b.x += (6 + sp * .6) * dt; b.r += dt * 2.5; for (var yy = -b.r; yy <= b.r; yy++) { var ww = Math.round(Math.sqrt(Math.max(0, b.r * b.r - yy * yy))); DR(b.x - ww, b.y + yy, ww * 2, 1, yy < -b.r * .4 ? "#4a4a52" : "#1e1e24"); } return b.life > 0; });
    var vent = (dz.lever || a.r.blow) && a.t < DZ_STAMP + .2;
    if (vent && Math.random() < dt * 40) { var fv = Math.floor(Math.random() * 3); S.vent.push({ x: SX + 46 + fv * 15 + Math.random() * 2, y: SYY - 1, vy: -30 - Math.random() * 20, life: .9 }); }
    if (vent && !S.roared && a.t > DZ_OUT + .4) { S.roared = 1; beep([[150, .5], [140, .5]]); dzShake(.4); dzBuzz([80, 40, 160]); }
    var pitch = a.prevLvl > lvl ? Math.round(Math.max(0, 1 - Math.abs(fd - .4) * 3) * (a.prevLvl - lvl)) : 0;            // the bow dips a little as she slows
    var shipIm = DZI.sv_ship; if (dzOk(shipIm, "sv_ship") && !storm) { dzc.save(); dzc.globalAlpha = calm ? .3 : .16; dzc.translate(Math.round(Math.sin(t / 400)), 2 * (72 + bob)); dzc.scale(1, -1); dzc.drawImage(shipIm, 0, 0, 140, 30, SX, SYY, 140, 30); dzc.restore(); }   // her reflection
    var mainC = null;
    if (storm) {                                                                                 // roll and heave on the ship's own layer, turned by CSS so it stays crisp
      var roll = Math.sin(t / 620) * 2.9 + Math.sin(t / 1300) * 1.1; mainC = dzc; dz.layered = true;
      dzc = dzShipC; dzImg("sv_ship", SX, SYY + pitch);
      dzShipCv.style.transformOrigin = ((SX + 70) / 1.8).toFixed(1) + "% " + ((SYY + 28) / 1.35).toFixed(1) + "%";
      dzShipCv.style.transform = "translateY(" + (Math.sin(t / 480) * 1.4).toFixed(2) + "%) rotate(" + roll.toFixed(2) + "deg)";
      dzc = dzFrontC;                                                                            // everything after the ship lies in front of it
    }
    else dzImg("sv_ship", SX, SYY + pitch);
    dzWake(t, dt, S, SX, SYY + 33 + pitch, sp, sky);                                         // 33: the row where the hull meets the water in the sprite
    S.vent = S.vent.filter(function (p) { p.life -= dt; p.y += p.vy * dt; p.x += (sp * .5 + 6) * dt; dzc.globalAlpha = Math.min(1, p.life * 1.5); dzImg("steam", p.x - 8, p.y - 6); dzc.globalAlpha = 1; return p.life > 0; });
    if (sky === "night") { for (var pw = 0; pw < 28; pw++) DR(SX + 8 + pw * 4.3, SYY + 25 + (pw % 2) * 2, 1, 1, "#ffe8a0"); }   // lit portholes at night
    S.hits = [];
    if (kind === "fischer") for (var fb = 0; fb < 4; fb++) { var fbx = ((fb * 53 + S.x * .9) % 230) - 30, fby = 82 + (fb % 2) * 16 + Math.round(Math.sin(t / 400 + fb)); DR(fbx, fby + 5, 12, 3, "#5a3a28"); DR(fbx + 1, fby + 8, 10, 1, "#3a2414"); DR(fbx + 5, fby - 7, 1, 12, "#5a3a28"); DR(fbx + 6, fby - 6, 4, 9, ["#c8642a", "#d8c098", "#8a3a3a", "#c8a050"][fb]); DR(fbx + 1, fby - 4, 4, 7, ["#c8642a", "#d8c098", "#8a3a3a", "#c8a050"][fb]); if ((Math.floor(t / 300) + fb) % 4 === 0) DR(fbx + 3, fby + 3, 1, 1, "#e8c8a8"); S.hits.push({ x: fbx, y: fby - 7, w: 12, h: 16, k: "fisch" }); }   // Breton fishing boats with tan sails
    if (kind === "wale") for (var wl = 0; wl < 3; wl++) { var ph3 = ((t / 2200) + wl * .37) % 1, wx2 = 20 + wl * 55 + ph3 * 20, wy2 = 88 + wl * 8;
      if (ph3 < .5) { var arc2 = Math.sin(ph3 / .5 * Math.PI); DR(wx2, wy2 - arc2 * 3, 14, 2, "#3a4a58"); DR(wx2 + 2, wy2 - arc2 * 3 - 1, 9, 1, "#4a5a68"); DR(wx2 + 8, wy2 - arc2 * 3 - 2, 2, 1, "#3a4a58"); }
      if (ph3 > .05 && ph3 < .3) { var sh2 = Math.sin((ph3 - .05) / .25 * Math.PI) * 9; for (var sp3 = 0; sp3 < sh2; sp3++) DR(wx2 + 3 + (sp3 % 2), wy2 - 3 - sp3, 1, 1, "#e8f4fc"); DR(wx2 + 1, wy2 - 3 - sh2, 5, 2, "#e8f4fc"); }
      if (ph3 > .55 && ph3 < .75) { var fh = Math.sin((ph3 - .55) / .2 * Math.PI) * 6; DR(wx2 + 10, wy2 - fh, 2, fh, "#3a4a58"); DR(wx2 + 7, wy2 - fh - 2, 8, 2, "#3a4a58"); } }   // fin whales: spout, back, fluke
    if (kind === "sos") { var scx = 2 + Math.sin(t / 900) * 2, scy = 88 + Math.round(Math.sin(t / 380) * 1.5); DR(scx, scy + 6, 20, 4, "#5a4a3a"); DR(scx + 1, scy + 10, 18, 1, "#3a2414"); DR(scx + 7, scy - 12, 1, 18, "#5a3a28"); DR(scx + 14, scy - 10, 1, 16, "#5a3a28"); DR(scx + 8, scy - 10, 5, 9, "#c8c0a8"); DR(scx + 15, scy - 8, 4, 7, "#c8c0a8");
      DR(scx + 4, scy - 12, 3, 2, "#2e3a8a"); DR(scx + 4, scy - 10, 3, 2, "#f4f0e6"); DR(scx + 4, scy - 8, 3, 2, "#c8342a");   // flags N over C: distress
      var lbu = lvl === 0 ? Math.min(1, tt / 4) : 0; if (lbu > 0) { var lbx = 90 - lbu * 50 + (lbu > .5 ? 0 : 0), lby = 100 - lbu * 14; DR(lbx, lby, 12, 3, "#f4f0e6"); DR(lbx + 1, lby + 3, 10, 1, "#3a2414"); for (var oa = 0; oa < 4; oa++) DR(lbx + 2 + oa * 2, lby - 2, 1, 2, "#e8c8a8"); var ro = Math.floor(t / 250) % 2; DR(lbx - 2, lby + 1 + ro, 3, 1, "#a87448"); DR(lbx + 11, lby + 1 + ro, 3, 1, "#a87448"); }   // the lifeboat rowing over
      S.hits.push({ x: scx, y: scy - 12, w: 20, h: 22, k: "fisch" }); }
    if (kind === "quar") { var qlx = 130 - Math.min(1, tt / 3) * 50, qly = 92 + Math.round(Math.sin(t / 400)); dzImg("sv_pilot", qlx, qly); S.hits.push({ x: qlx, y: qly, w: 34, h: 24, k: "pilot" }); }
    if (kind === "reede") { var tx = 120 - S.tend * 60, ty = 98 - S.tend * 20 + Math.round(Math.sin(t / 420)); dzImg("sv_tender", tx, ty); S.hits.push({ x: tx, y: ty, w: 46, h: 26, k: "tender" });
      if (S.tend >= 1) for (var pg = 0; pg < 4; pg++) { var pu = ((t / 1600) + pg / 4) % 1; DR(tx + 20 + pu * 4, ty + 8 - pu * (ty + 8 - (SYY + 20)), 1, 2, ["#3a3028", "#8a3a3a", "#2e3a5a", "#5a4a8a"][pg]); } }   // passengers climbing the gangway
    if (kind === "feuerschiff") { var plx = 150 - Math.min(1, tt / 2.5) * 80, ply = 92 + Math.round(Math.sin(t / 380)); dzImg("sv_pilot", plx, ply); S.hits.push({ x: plx, y: ply, w: 34, h: 24, k: "pilot" });
      if (tt > 2.6) { var cl2 = Math.min(1, (tt - 2.6) / 1.2); DR(plx + 8, ply + 6 - cl2 * (ply + 6 - (SYY + 22)), 1, 2, "#2e3a5a"); DR(plx + 8, ply + 5 - cl2 * (ply + 6 - (SYY + 22)), 1, 1, "#e8c8a8"); } }   // the pilot climbs the ladder
    if (kind === "eis") dzImg("sv_ice", S.ob - 44, 46);
    if (kind === "newyork") dzImg("sv_newyork", S.ob - 96, 52);                                  // she drifts in on our side, in front of us
    if (kind === "ny") dzImg("sv_pier", S.pier - 80, 56);
    if (kind === "abfahrt" || kind === "newyork" || kind === "ny") for (var tu = 0; tu < 2; tu++) {
      var tux = (kind === "abfahrt" ? 12 + tu * 90 : kind === "ny" ? 110 + tu * 34 : 150 - tu * 40) + Math.sin(t / 500 + tu) * 2, tuy = 84 + tu * 14 + Math.round(Math.sin(t / 350 + tu) * (storm ? 2 : 1));
      if (kind !== "newyork") { var bowX = tu ? SX + 120 : SX + 6, bowY = SYY + 24; for (var ln = 0; ln <= 12; ln++) { var lu = ln / 12; DR(tux + (tu ? 4 : 32) + (bowX - tux - (tu ? 4 : 32)) * lu, tuy + 15 + (bowY - tuy - 15) * lu + Math.sin(lu * Math.PI) * 3, 1, 1, "#c8b088"); } }   // tow lines to bow and stern
      dzImg("sv_tug", tux, tuy); S.hits.push({ x: tux, y: tuy, w: 38, h: 26, k: "tug" + tu });
      if (Math.random() < dt * 5) S.smk.push({ x: tux + 19 + Math.random() * 2, y: tuy + 1, vx: 3 + sp * .4, life: 1.3, c: "#5a5e66" });
      if (!S["tooted" + tu] && tt > 1 + tu * 1.4) { S["tooted" + tu] = 1; dzToot(tu); for (var tp = 0; tp < 6; tp++) S.smk.push({ x: tux + 19, y: tuy, vx: (tp - 3) * 2, vy: -14, life: .6, c: "#f4f8fc" }); }
    }   // tugs nosing along                                          // the pier lies between us and the camera
    S.smk = S.smk.filter(function (m) { m.life -= dt; m.x += (m.vx || 3) * dt; m.y += (m.vy || -7) * dt; var r2 = m.life > 1 ? 1 : m.life > .5 ? 2 : 3; dzc.globalAlpha = Math.min(1, m.life * 1.2) * .85; DR(m.x - r2 / 2, m.y - r2 / 2, r2, r2, m.c); if (r2 > 1) DR(m.x - r2 / 2 + 1, m.y - r2 / 2 - 1, r2 - 1, 1, m.c); dzc.globalAlpha = 1; return m.life > 0; });
    if (storm) dzFrontSwell(t, S.x);
    if (storm) { dzc.globalAlpha = .55; for (var rn = 0; rn < 40; rn++) { var rx = ((rn * 23 + t / 4) % 200) - 10, ry = ((rn * 37 + t / 3) % 140) - 5; DR(rx, ry, 1, 3, "#c8d4e0"); DR(rx - 1, ry + 3, 1, 2, "#c8d4e0"); } dzc.globalAlpha = 1; }
    if (kind === "nebel") { for (var c = 0; c < 6; c++) { dzc.globalAlpha = .75; dzImg("cloud", ((c * 47 + S.x * .8 + t / 60) % 240) - 40, 30 + (c % 3) * 22); } dzc.globalAlpha = .3; DR(0, 0, 180, 135, "#e4ecf2"); dzc.globalAlpha = 1; }
    // the route bar on top
    var n = dz.route.length, x0 = 30, x1 = 174, bw = (x1 - x0) / n;
    DR(x0 - 2, 4, x1 - x0 + 4, 9, "#3a2414");
    for (var i = 0; i < n; i++) { var oc = { voll: "#8ad86a", halb: "#ffd34a", stopp: "#ff7a6a" }[dz.route[i].o]; DR(x0 + i * bw, 5, Math.max(1, bw - 1), 7, i < dz.leg ? (dz.res[i] ? oc : "#7a6a60") : oc); if (i > dz.leg) { dzc.globalAlpha = .45; DR(x0 + i * bw, 5, Math.max(1, bw - 1), 7, "#3a2414"); dzc.globalAlpha = 1; } }
    var mx = x0 + (dz.prog * n) * bw; DR(mx - 3, 2, 6, 13, "#3a2414"); DR(mx - 2, 3, 4, 11, "#fff8ec"); DR(mx - 1, 4, 2, 3, "#e8a040");
    // the verdict: a brass medallion floating in the water under the ship, navy enamel with a white tick or a red cross
    if (a.stamped) { var e = Math.min(1, (a.t - DZ_STAMP) * 4), cx = 90, cy = 106 + Math.round((1 - e) * 10), R = 13, ok = a.r.ok;
      dzc.globalAlpha = e;
      for (var yy2 = -R - 1; yy2 <= R + 1; yy2++) for (var xx2 = -R - 1; xx2 <= R + 1; xx2++) { var dd2 = Math.hypot(xx2, yy2);
        if (dd2 <= R + 1) DR(cx + xx2, cy + yy2, 1, 1, dd2 > R ? "#3a2414" : dd2 > R - 3 ? (xx2 + yy2 < -4 ? "#ffe08a" : xx2 + yy2 > 4 ? "#b88a2a" : "#e8b84a") : dd2 > R - 4 ? "#7a5a1a" : "#1e2a4a"); }
      for (var rv = 0; rv < 8; rv++) { var ra = rv / 8 * Math.PI * 2; DR(cx + Math.round(Math.cos(ra) * (R - 1.5)), cy + Math.round(Math.sin(ra) * (R - 1.5)), 1, 1, "#7a5a1a"); }
      if (ok) { DR(cx - 6, cy, 2, 2, "#fff8ec"); DR(cx - 4, cy + 2, 2, 2, "#fff8ec"); DR(cx - 2, cy + 3, 2, 2, "#fff8ec"); for (var q2 = 0; q2 < 5; q2++) DR(cx + q2 * 1.5, cy + 2 - q2 * 1.7, 2, 2, "#fff8ec"); }
      else for (var q3 = -3; q3 <= 3; q3++) { DR(cx + q3 * 1.4 - 1, cy + q3 * 1.4 - 1, 2, 2, "#ff7a6a"); DR(cx + q3 * 1.4 - 1, cy - q3 * 1.4 - 1, 2, 2, "#ff7a6a"); }
      dzc.globalAlpha = 1; }
    if (mainC) dzc = mainC;
  }
  // the historic engine telegraph: black pointer with brass tip = the bridge's order for this leg, red pointer = what the engine is set to
  var DZ_TG = { x: DZ_TGX, y: DZ_TGY, r: 18 };
  var DZ_TGA = { stopp: -159, halb: -90, voll: -21 };
  function dzTelegraph(t, dt) {
    var X = DZ_TG.x, Y = DZ_TG.y, ring = dz.ringT > 0 ? Math.round(Math.sin(t / 30)) : 0;
    dz.ringT = (dz.ringT || 0) - dt;
    dzImg("tg_col", X - 9, Y + 20);
    var aw = DZ_TGA[dzOrder()] * Math.PI / 180;
    dz.tgw = dz.tgw == null ? aw : dz.tgw + (aw - dz.tgw) * Math.min(1, dt * 5);
    var hx = X + ring + Math.cos(dz.tgw) * 25, hy = Y + Math.sin(dz.tgw) * 25;
    dzLine(X + ring + Math.cos(dz.tgw) * 22, Y + Math.sin(dz.tgw) * 22, hx, hy, "#7a5a1a"); dzLine(X + ring + Math.cos(dz.tgw) * 22 + 1, Y + Math.sin(dz.tgw) * 22, hx + 1, hy, "#b88a2a");
    DR(hx - 2, hy - 2, 5, 5, "#3a2414"); DR(hx - 1, hy - 1, 3, 3, "#e8554a");
    dzImg("tg_face", X - 24 + ring, Y - 24);
    var lvl = dz.anim ? dz.anim.r.lvl : dz.red, tv = [-159, -90, -21][lvl] * Math.PI / 180;
    dz.tgr = dz.tgr == null ? tv : dz.tgr + (tv - dz.tgr) * Math.min(1, dt * 6);
    dzLine(X + ring, Y, X + ring + Math.cos(dz.tgr) * 13, Y + Math.sin(dz.tgr) * 13, "#d8342a"); dzLine(X + ring + 1, Y, X + ring + 1 + Math.cos(dz.tgr) * 12, Y + Math.sin(dz.tgr) * 12, "#d8342a");
    dzLine(X + ring, Y, X + ring + Math.cos(dz.tgw) * 17, Y + Math.sin(dz.tgw) * 17, "#3a2414"); dzLine(X + ring, Y + 1, X + ring + Math.cos(dz.tgw) * 16, Y + 1 + Math.sin(dz.tgw) * 16, "#3a2414");
    DR(X + ring + Math.cos(dz.tgw) * 15 - 1, Y + Math.sin(dz.tgw) * 15 - 1, 3, 3, "#e8b84a");
    DR(X + ring - 2, Y - 2, 5, 5, "#3a2414"); DR(X + ring - 1, Y - 1, 3, 3, "#e8b84a");
    var ok = lvl === DZ_ORD[dzOrder()].l;
    DR(X - 6 + ring, Y + 9, 13, 3, ok ? "#6fd04a" : (Math.floor(t / 300) % 2 ? "#e8554a" : "#7a2a20"));
    if (dz.ringT > 0 && Math.floor(t / 90) % 2) { for (var k = 0; k < 3; k++) { DR(X - 30 - k * 2, Y - 10 + k * 6, 3, 1, "#ffd34a"); DR(X + 28 + k * 2, Y - 10 + k * 6, 3, 1, "#ffd34a"); } }
  }
  // ---- running a leg ----
  var DZ_AT = 7.7, DZ_OUT = 1.1, DZ_STAMP = 7.1;                                            // the outside scene runs about six seconds
  function dzRun() {
    if (!dz || dz.anim || dz.done || dz.intro || dz.mini) return;
    var r = dzSim(dz);
    dz.anim = { t: 0, r: r, sootBlow: dz.sootBlow, prevLvl: dz.lastLvl, P0: dz.P / 10, W0: dz.W / 10, G0: dz.G, prog0: dz.prog, threw: 0, sea: { smk: [], x: 0, ob: -24, pier: 10, tend: 0, bump: 0, puffs: [], vent: [] } };
    dzGo.disabled = true; beep([[880, .06], [660, .08]]); dzBuzz(20); dzNudge(0, 2);
    dzEngine(r.lvl, DZ_STAMP - .4, .2); if (dz.lever) dzHiss(2.2, .16);
  }
  function dzAnimStep(dt) {
    var a = dz.anim; a.t += dt;
    if (!a.sparked && a.t > .5 && dz.coalN) { a.sparked = 1; dzSparks(86, 80, 10 + dz.coalN * 3); dzShake(.15); }
    if (dz.pumpN && Math.floor(a.t / .3) < dz.pumpN && dz.pumpT <= 0 && a.t > .2) { dz.pumpT = .2; beep([[260, .04], [330, .05]]); }
    if (dz.whistle && !a.tooted && a.t > .3) { a.tooted = 1; dzWhistle(1.6); dzBuzz([200, 80, 200]); }
    var f = Math.max(0, Math.min(1, (a.t - .3) / .7)), e = f * f * (3 - 2 * f);
    var pEnd = a.r.blow ? 1.06 : a.r.P / 10; if (a.r.blow && a.t > .95) pEnd = .7;
    if (a.r.surge && !a.r.blow) pEnd += Math.max(0, Math.sin(Math.min(1, (a.t - .35) / .6) * Math.PI)) * .12;   // the needle overshoots when the steam backs up
    dz.dispP = a.P0 + (pEnd - a.P0) * e; dz.dispW = a.W0 + (a.r.W / 10 - a.W0) * e; dz.dispG = a.G0 + (a.r.G - a.G0) * Math.min(1, a.t / .7);
    if (a.r.surge && !a.surged && a.t > .35) { a.surged = 1; dzShake(.4); dzBuzz([40, 30, 40]); beep([[90, .1], [70, .14], [1400, .2]]); }
    if (a.r.blow && !a.blew && a.t > .8) { a.blew = 1; beep([[1200, .08], [1100, .08], [1000, .1]]); dzShake(.6); dzBuzz(250); }
    if (!a.out && a.t > DZ_OUT) a.out = true;
    var fo = Math.max(0, Math.min(1, (a.t - DZ_OUT) / (DZ_STAMP - DZ_OUT))); dz.prog = a.prog0 + fo / dz.route.length;
    if (a.out && !a.stamped && a.t > DZ_STAMP) { a.stamped = 1;
      if (a.r.ok) { beep([[660, .05], [880, .05], [1175, .1]]); dzBuzz([20, 40, 20, 40, 60]); dzNudge(0, -3); dzSparks(90, 40, 24, ["#ffd34a", "#ffffff", "#8ad86a"]); }
      else { beep([[300, .1], [220, .16]]); dzBuzz(140); dzShake(.35); } }
    if (a.t >= DZ_AT) dzLegDone();
  }
  var DZ_WHY = { slow: "zu langsam", fast: "zu schnell", wh: "ohne Dampfpfeife", turb: "Turbine bei kleiner Fahrt" };
  function dzLegDone() {
    var r = dz.anim.r;
    dz.P = r.P; dz.W = r.W; dz.G = r.G; dz.shovels += dz.coalN; if (r.blow) dz.blows++;
    dz.res[dz.leg] = r.ok; dz.lastLvl = r.lvl; dz.sootBlow = false; if (r.lvl === 2) { dz.soot++; if (dz.soot === 3) setTimeout(function () { if (dz && !dz.done) { dzShake(.3); beep([[180, .1], [140, .14]]); } }, 300); } dz.leg++; dz.anim = null; dz.coalN = 0; dz.pumpN = 0; dz.lever = false; dz.whistle = false;
    dz.dispP = dz.P / 10; dz.dispW = dz.W / 10; dz.dispG = dz.G; dz.prog = dz.leg / dz.route.length; dzGo.disabled = false;
    dzPlanDraw(); var tl = dzPlanEl.querySelector(".dz-t.cur"); if (tl && tl.previousElementSibling) tl.previousElementSibling.classList.add("just");
    if (dz.leg >= dz.route.length) { dzDrop(); dzArrive(); return; }
    dzSave();
    dz.ringT = 1.2; dzBell(DZ_ORD[dzOrder()].l + 1);
    var li = dz.leg - 1, pe = dz.evs[li];
    dzLegIntro(r.ok ? (pe ? pe.d : dz.route[li].d) : "✘ " + DZ_WHY[r.why] + ".");
  }
  function dzStars() {
    var good = dz.res.filter(Boolean).length;
    return [good === dz.route.length, dz.blows === 0, dz.shovels <= dz.budget, good];
  }
  function dzArrive() {
    var gd = dz.res.filter(Boolean).length / dz.route.length; dz.done = true; dz.ending = { t: 0, g: gd >= .9 ? 2 : gd >= .7 ? 1 : 0, S: { puffs: [], smk: [], drops: [], conf: [], fw: [] } }; var gn = dz.res.filter(Boolean).length; dzBanner(gn + ' von ' + dz.route.length + ' Abschnitten richtig (' + Math.round(gd * 100) + ' %). ' + ['Spät und im Nieselregen legt die Pausbacke an. Kaum jemand wartet noch. Ab 70 % gibt es Familien am Pier, ab 90 % den großen Jubel.', 'Die Pausbacke legt am Körnerpier 59 an. Freunde und Familien winken. Ab 90 % gibt es den großen Jubel!', 'Nuss York empfängt die Pausbacke wie eine Königin: Löschboote, Fahnen, Jubel!'][dz.ending.g]);
  }
  function dzArriveCard() {
    dz.done = true; var M = dzL(); M.trips++;
    var AW = typeof pcAward === "function" && !dz.awarded ? pcAward(dz) : {}; dz.awarded = 1; dz.pcNew = AW.card;
    var gift = (AW.model ? '<p class="fi-s dz-gift">Das <b>Schiffsmodell der Pausbacke</b> steht jetzt über deiner Zimmertür!</p>' : '') + (AW.card ? '<p class="fi-s dz-gift">' + (AW.glitter ? 'Glitzerkarte' : 'Neue Postkarte') + ': <b>' + pcItem(AW.card).n + '</b> <button type="button" class="fi-b2 dz-pcb" data-a="pc">Ansehen</button></p>' : (typeof pcAward === "function" && AW.gd >= .7 ? '<p class="fi-s">Diesmal keine neue Postkarte.</p>' : ''));
    var S = dzStars(), n = (S[0] ? 1 : 0) + (S[1] ? 1 : 0) + (S[2] ? 1 : 0); if (n > M.best) M.best = n;
    if (window.SudokuSave) window.SudokuSave();
    dzBanner("");
    var st = function (on, i) { return '<em class="dz-star' + (on ? " on" : "") + '" style="animation-delay:' + (.3 + i * .35) + 's">★</em>'; };
    [S[0], S[1], S[2]].forEach(function (on, i) { if (on) setTimeout(function () { beep([[660 + i * 220, .08]]); dzBuzz(30); }, 300 + i * 350); });
    dzCard.innerHTML = '<div class="fi-c"><p class="fi-h">' + ["Endlich angekommen …", "Angekommen in Nuss York!", "Triumphale Ankunft!"][dz.ending ? dz.ending.g : 1] + '</p><span class="fi-st dz-stars">' + st(S[0], 0) + st(S[1], 1) + st(S[2], 2) + '</span>' +
      '<p class="fi-s">' + (S[0] ? "★" : "☆") + ' Jeder Befehl befolgt (' + S[3] + '/' + dz.route.length + ')</p><p class="fi-s">' + (S[1] ? "★" : "☆") + ' Kein Abblasen' + (dz.blows ? " (" + dz.blows + "×)" : "") + '</p><p class="fi-s">' + (S[2] ? "★" : "☆") + ' Sparsam: ' + dz.shovels + ' von ' + dz.budget + ' Schaufeln</p>' +
      gift + '<div class="fi-row"><button type="button" class="fi-b2" data-a="end">Fertig</button><button type="button" class="fi-b" data-a="again">Noch eine Fahrt</button></div></div>';
    dzCard.hidden = false;
  }
  // a voyage that was interrupted (app closed, game left) waits in the save: carry on or start a new one
  var DZ_KEEP = ["route", "leg", "res", "P", "G", "W", "shovels", "blows", "budget", "evs", "lastEv", "lastLvl", "arrNight", "soot", "flood", "floodB", "nightSaid"];
  function dzSave() {
    if (!dz || dz.done || dz.intro) return; var o = {}; DZ_KEEP.forEach(function (k) { if (dz[k] !== undefined) o[k] = dz[k]; });
    dzL().cur = JSON.parse(JSON.stringify(o)); if (window.SudokuSave) window.SudokuSave();
  }
  function dzDrop() { var M = dzL(); if (M.cur) { delete M.cur; if (window.SudokuSave) window.SudokuSave(); } }
  function dzResumeCard() {
    dz.intro = true; dzGo.disabled = true; dzBanner("");
    dzCard.innerHTML = '<div class="fi-c dz-intro"><p class="fi-h">Die Pausbacke ist noch unterwegs</p>' +
      '<p class="dz-route">Abschnitt ' + (dz.leg + 1) + ' von ' + dz.route.length + '</p>' +
      '<div class="fi-row"><button type="button" class="fi-b2" data-a="new">Neue Fahrt</button><button type="button" class="fi-b" data-a="resume">Weiterfahren</button></div></div>';
    dzCard.hidden = false;
  }
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden" && dzOpen) dzSave(); });
  function dzIntro() {
    dz.intro = true; dzGo.disabled = true; dzBanner("");
    dzCard.innerHTML = '<div class="fi-c dz-intro"><p class="fi-h">Jungfernfahrt der Pausbacke</p>' +
      '<p class="dz-route">Southamsterton → Schnüffelbourg → Backentown → Nuss York · ' + dz.route.length + ' Abschnitte</p>' +
      '<p class="fi-s">Du bist Oberheizer. Bring das Schiff sicher über den Hamslantik und führe jeden Befehl der Brücke aus.</p>' +
      '<p class="fi-s">★ Jeden Befehl befolgen<br>★ Nie das Sicherheitsventil abblasen<br>★ Höchstens ' + dz.budget + ' Schaufeln Kohle</p>' +
      '<div class="fi-row"><button type="button" class="fi-b" data-a="go">Leinen los!</button></div></div>';
    dzCard.hidden = false;
  }
  // ---- touch: planning in the engine room ----
  function dzPt(e) { var r = dzCv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 240 - 30, (e.clientY - r.top) / r.height * 175 - 20]; }
  function inR(p, r) { return p[0] >= r.x0 && p[0] <= r.x1 && p[1] >= r.y0 && p[1] <= r.y1; }
  function dzNo() { beep([[200, .03]]); dzNudge(1, 0); }
  function dzToDoor(p) { return inR(p, { x0: DZ_FIRE.x0 - 4, y0: DZ_FIRE.y0 - 6, x1: DZ_FIRE.x1 + 4, y1: DZ_FIRE.y1 }); }
  dzCv.addEventListener("pointerdown", function (e) {
    if (dz && dz.anim && dz.anim.out) { var q = dzPt(e), hs = dz.anim.sea.hits || [];                   // during the voyage: tap the little ships and they answer
      for (var hi = 0; hi < hs.length; hi++) { var hh = hs[hi]; if (q[0] >= hh.x && q[0] <= hh.x + hh.w && q[1] >= hh.y && q[1] <= hh.y + hh.h) { if (hh.k === "fisch") { dzTone(880, .15, .05, "square"); dzTone(988, .2, .05, "square", .15); } else dzToot(hh.k === "tug1" || hh.k === "pilot"); dzBuzz(20); for (var vp = 0; vp < 6; vp++) dz.anim.sea.smk.push({ x: hh.x + hh.w / 2, y: hh.y + 1, vx: (vp - 3) * 2, vy: -14, life: .6, c: "#f4f8fc" }); return; } }
      if (q[1] > 30 && q[1] < 80) { dzWhistle(.9); dzBuzz(40); } return; }                      // tap the Pausbacke herself: her big whistle
    if (!dz || dz.done || dz.anim || dz.intro || !dzCard.hidden) return; e.preventDefault(); var p = dzPt(e);
    try { dzCv.setPointerCapture(e.pointerId); } catch (er) {}
    if (dz.mini) { dzMiniDown(p); return; }
    if (inR(p, DZ_PUMP)) { if (dz.flood > 0) dzMiniOpen("pump"); else { dzNo(); dzBanner("Kein Wasser im Heizraum, die Lenzpumpe hat Pause."); } return; }
    if (dz.soot >= 3 && inR(p, DZ_BOILER)) { dzClunk(); dzMiniOpen("soot"); return; }
    if (inR(p, DZ_CROW) && dz.coalN > 0) { dz.coalN--; beep([[300, .03]]); dzNudge(0, -1); dzHint(); return; }
    if (inR(p, DZ_DROW) && dz.pumpN > 0) { dz.pumpN--; beep([[300, .03]]); dzNudge(0, -1); dzHint(); return; }
    if (DZ_COAL.some(function (r) { return inR(p, r); })) {                                     // grab a shovelful from the scuttle
      if (dz.coalN >= 10) { dzNo(); return; }
      dz.drag = { coal: true, x: p[0], y: p[1], sx: p[0], sy: p[1] }; dz.ham = { m: "back", f: 0, t: 0 }; beep([[150, .04], [120, .03]]); dzBuzz(10); dzNudge(0, 1); return;
    }
    if (dzToDoor(p)) { dz.drag = { door: true, x: p[0], y: p[1], sx: p[0], sy: p[1] }; return; }
    if (inR(p, DZ_CORD)) { dz.whistle = !dz.whistle; if (dz.whistle) dzWhistle(.7); else beep([[200, .04]]); dzBuzz(dz.whistle ? 60 : 15); dzNudge(0, dz.whistle ? 2 : -1); }
    else if (inR(p, DZ_TURB)) { dz.turb = !dz.turb; beep(dz.turb ? [[400, .04], [600, .06]] : [[600, .04], [400, .06]]); dzBuzz(35); dzNudge(0, dz.turb ? -2 : 2); }
    else if (p[0] > 124 && Math.abs(p[1] - DZW.red.y) < 18) {
      var d = p[0] < DZ_WX ? -1 : 1, nv = Math.max(0, Math.min(2, dz.red + d));
      if (nv === dz.red) dzNo(); else { dz.red = nv; dz.spin += d * Math.PI / 2; dz.lightA[d > 0 ? 1 : 0] = .5; dzClunk(); dzBell(nv + 1); dzBuzz(30); dzNudge(d * 2, 0); }
    }
    else if (p[0] > 124 && Math.abs(p[1] - DZW.yellow.y) < 18) { dz.lever = !dz.lever; dzClunk(); if (dz.lever) dzHiss(.7, .12); dzBuzz(dz.lever ? [30, 20, 40] : 20); dzNudge(0, dz.lever ? 2 : -2); }
    else if (p[0] > 124 && Math.abs(p[1] - DZW.blue.y) < 18) { if (dz.pumpN < 3) { dz.pumpN++; dz.pumpT = .2; beep([[260, .05], [330, .06]]); dzBuzz(25); dzNudge(0, 2); } else dzNo(); }
    else return;
    dzHint();
  });
  dzCv.addEventListener("pointermove", function (e) {
    if (dz && dz.mini) { dzMiniMove(dzPt(e)); return; }
    if (!dz || !dz.drag) return; var p = dzPt(e); dz.drag.x = p[0]; dz.drag.y = p[1];
    if (dz.drag.coal) dz.ham.f = p[0] > 72 || p[1] < 90 ? 1 : 0;                                // he lifts the shovel as the finger heads for the fire
  });
  function dzDragEnd(e) {
    if (dz && dz.mini) { dzMiniUp(e ? dzPt(e) : null); return; }
    if (!dz || !dz.drag) return; var g = dz.drag, p = e ? dzPt(e) : [g.x, g.y]; dz.drag = null;
    if (g.coal) {
      if (dzToDoor(p)) {
        if (dz.dmp === 0) { dzNo(); dz.ham = { m: "front", f: 0, t: 0 }; dzBanner("Die Feuertür ist unten. Erst wieder hochziehen."); return; }
        dz.coalN++; dz.shovels; dz.ham = { m: "throw", f: 1, t: 0 }; beep([[180, .04], [120, .05], [90, .07]]); dzBuzz([15, 30, 25]); dzNudge(1, 1); dzHint();
      } else { dz.ham = { m: "front", f: 0, t: 0 }; if (Math.hypot(p[0] - g.sx, p[1] - g.sy) < 6) dzBanner("Mit dem Finger vom Kohleneimer in den Ofen wischen: eine Schaufel Kohle."); }
    } else if (g.door && Math.hypot(p[0] - g.sx, p[1] - g.sy) < 8 && dzToDoor(p)) {
      dz.dmp = dz.dmp === 0 ? 2 : 0; dzClunk(); dzNoise(.3, 400, .8, .1, .01, .2); dzBuzz(dz.dmp ? 25 : [40, 20, 60]); dzNudge(0, dz.dmp ? -2 : 3); dzHint();
    }
  }
  dzCv.addEventListener("pointerup", dzDragEnd);
  dzCv.addEventListener("pointercancel", function () { if (dz) { dz.drag = null; dz.ham = { m: "front", f: 0, t: 0 }; } });
  dzGo.addEventListener("click", function (e) { e.stopPropagation(); if (dz && dz.mini) dzMiniClose(); else dzRun(); });
  dzCard.addEventListener("click", function (e) {
    e.stopPropagation(); var b = e.target.closest("button"); if (!b) return; var dzResolveKeep = dz && dz.resolve;
    if (b.dataset.a === "pc") { if (dz && dz.pcNew) pcBig(dz.pcNew); return; }
    if (b.dataset.a === "resume") { dz.intro = false; dzCard.hidden = true; dzGo.disabled = false; dz.ringT = 1.2; beep([[880, .06], [660, .08]]); dzLegIntro(); return; }
    if (b.dataset.a === "new") { dzDrop(); dz = dzNew(); dz.resolve = dzResolveKeep; dzPlanDraw(); dzIntro(); return; }
    if (b.dataset.a === "go") { dz.intro = false; dzCard.hidden = true; dzGo.disabled = false; dz.ringT = 1.2; beep([[880, .06], [880, .06], [660, .08]]); dzLegIntro(); }
    else if (b.dataset.a === "again") { var rs = dz.resolve; dzDrop(); dz = dzNew(); dz.resolve = rs; dz.ending = null; dzPlanDraw(); dzIntro(); }
    else steamEnd();
  });
  function steamGame() {
    return new Promise(function (resolve) {
      dz = dzNew(); dzEl.hidden = false; dzOpen = true; document.body.classList.add("dz-on"); dzPanel.style.display = "block"; dz.resolve = resolve;   // panel set directly: the app scopes CSS under its root, so a body.dz-on rule would not reach
      var sv = dzL().cur;
      if (sv && sv.route && sv.leg < sv.route.length) { Object.keys(sv).forEach(function (k) { dz[k] = sv[k]; }); dzPlanDraw(); dzResumeCard(); }
      else { dzPlanDraw(); dzIntro(); }
      dzRaf = requestAnimationFrame(dzDraw);
    });
  }
  function steamEnd() { if (!dzOpen) return; dzOpen = false; document.body.classList.remove("dz-on"); dzPanel.style.display = "none"; dzMsg.textContent = ""; cancelAnimationFrame(dzRaf); dzEl.hidden = true; dzCard.hidden = true; var r = dz && dz.resolve; dz = null; if (r) r(); }
  dzEl.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); dzSave(); steamEnd(); });
  var _dz_interrupt = interrupt; interrupt = function () { if (dzOpen && !window.__resume) { dzSave(); steamEnd(); } return _dz_interrupt.apply(this, arguments); };
  var dzPic = xEl("button", "dz-pic", document.getElementById("room")); dzPic.type = "button"; dzPic.setAttribute("aria-label", "Bild mit Dampfer");
  dzPic.innerHTML = '<img src="' + DZ.pic + '" alt="">'; place(dzPic, 90, 14, 24);
  async function steamSeq() {
    front({ eyes: "happy", mouth: "grin", paws: "up" }); say(N() + " träumt sich in den Maschinenraum der MS Pausbacke."); await wait(700);
    await steamGame(); front({ eyes: "happy", mouth: "smile" }); say(N() + " wischt sich den Ruß von der Nase.");
  }
  dzPic.addEventListener("click", function (e) { e.stopPropagation(); if (decor || s.asleep) return; if (busy && !interruptible()) return; if (busy) interrupt(); act("steam", steamSeq); });
  window.__steam = { open: function () { steamGame(); }, st: function () { return dz && { P: dz.P, W: dz.W, G: dz.G, leg: dz.leg, res: dz.res, red: dz.red, coalN: dz.coalN, pumpN: dz.pumpN, lever: dz.lever, whistle: dz.whistle, turb: dz.turb, dmp: dz.dmp, evs: dz.evs, shovels: dz.shovels, blows: dz.blows, budget: dz.budget, done: dz.done, intro: dz.intro, n: dz.route.length, o: dz.leg < dz.route.length ? dzOrder() : 'stopp', wh: !!(dz.route[dz.leg] && dz.route[dz.leg].wh), kind: dz.route[dz.leg] && dz.route[dz.leg].s, ending: dz.ending && dz.ending.g, flood: dz.flood, soot: dz.soot, mini: dz.mini && dz.mini.k, sim: dzSim(dz) }; }, end: steamEnd, run: dzRun, mini: function (k) { dzMiniOpen(k); }, mm: function () { return dz && dz.mini; },
    set: function (o) { if (dz) Object.keys(o).forEach(function (k) { dz[k] = o[k]; }); } };
  // ===================== souvenirs of the voyages: the ship model over the door, postcards on the pinboard =====================
  // At most one postcard per voyage. 70 % and more: one of the common cards. 90 % and more: any card whose condition the voyage met.
  // 100 % with nothing new left: the glitter version of a card you own. The first voyage with 90 % brings the ship model.
  var PCA = /*PCART*/;
  var PCI = {}; Object.keys(PCA).forEach(function (k) { if (k.indexOf("pc_") === 0) { var im = new Image(); im.src = PCA[k]; PCI[k] = im; } });
  var PCF = PCA.font3;
  var PC_LIST = [
    { k: "suedham", n: "Gruß aus Southamsterton", f: [80, 56], m: ["HEUTE GEHT ES", "LOS! DER GANZE", "HAFEN WINKT."] },
    { k: "schnueff", n: "Gruß aus Schnüffelbourg", f: [44, 44], m: ["ABENDS KAMEN", "NEUE GÄSTE", "MIT DEM TENDER."] },
    { k: "backen", n: "Leb wohl, Backentown", f: [56, 50], m: ["LETZTER HALT.", "NUN NUR NOCH", "WASSER BIS", "NUSS YORK!"] },
    { k: "saal", n: "Speisesaal 1. Klasse", f: [60, 44], m: ["ES GAB KÖRNER", "IN SILBER-", "SCHÜSSELN!"] },
    { k: "treppe", n: "Große Treppe", f: [62, 42], m: ["DIE TREPPE IST", "SO SCHÖN, ICH", "BIN DREIMAL", "HOCH UND RUNTER."], c: function (v) { return v.gd >= .9; }, h: "AB 90 %" },
    { k: "deck", n: "Deckspiele", f: [62, 54], m: ["SONNE, WIND", "UND SHUFFLE-", "BOARD AN DECK."], c: function (v) { return !v.storm; }, h: "OHNE STURM" },
    { k: "funk", n: "Funkraum", f: [54, 44], m: ["DER FUNKER", "HAT HEUTE", "EINEN NOTRUF", "GEHÖRT!"], c: function (v) { return v.kinds.sos; }, h: "NOTSIGNAL" },
    { k: "nest", n: "Im Krähennest", f: [52, 34], m: ["EISBERG", "VORAUS! ICH", "HABE IHN ZU-", "ERST GESEHEN."], c: function (v) { return v.ice; }, h: "EISBERG" },
    { k: "wale", n: "Wale!", f: [48, 40], m: ["WALE! SO", "GROSS WIE", "UNSER SCHIFF.", "FAST."], c: function (v) { return v.kinds.wale; }, h: "WALE" },
    { k: "freiheit", n: "Willkommen in Nuss York", f: [34, 42], m: ["DIE FREIHEITS-", "HAMSTERIN", "IST RIESIG!"], c: function (v) { return v.kinds.liberty; }, h: "STATUE" },
    { k: "nacht", n: "Nuss York bei Nacht", f: [40, 42], m: ["NUSS YORK", "LEUCHTET WIE", "TAUSEND", "GLÜHWÜRMCHEN."], c: function (v) { return v.night; }, h: "NACHT", light: true },
    { k: "heiz", n: "Ehrenkarte Heizraum", f: [66, 46], m: ["OBERHEIZER", "MIT EHREN!", "KEIN EINZIGER", "FEHLER."], c: function (v) { return v.gd >= 1; }, h: "100 %" }
  ];
  function pcSt() { var M = dzL(); M.pc = M.pc || {}; return M; }
  function pcItem(k) { for (var i = 0; i < PC_LIST.length; i++) if (PC_LIST[i].k === k) return PC_LIST[i]; return null; }
  // called once when the ship has arrived: what this voyage earns
  function pcAward(d) {
    var M = pcSt(), gd = d.res.filter(Boolean).length / d.route.length, out = { gd: gd };
    var kinds = {}; d.route.forEach(function (L) { kinds[L.k] = 1; });
    var storm = Object.keys(d.evs).some(function (i) { return d.evs[i] && d.evs[i].k === "sturm"; });
    var ice = d.route.some(function (L, i) { return L.k === "eis" && d.res[i]; });
    var v = { gd: gd, kinds: kinds, storm: storm, ice: ice, night: !!d.arrNight };
    if (gd >= .9 && !M.model) { M.model = Date.now(); out.model = true; }
    if (gd < .7) return out;
    var pool = PC_LIST.filter(function (o) { return gd >= .9 ? (!o.c || o.c(v)) : !o.c; });
    var fresh = pool.filter(function (o) { return !M.pc[o.k]; });
    var pct = Math.round(gd * 100);
    if (fresh.length) { var o = fresh[Math.floor(Math.random() * fresh.length)]; M.pc[o.k] = { t: Date.now(), p: pct, g: 0 }; out.card = o.k; }
    else if (gd >= 1) {
      var shiny = pool.filter(function (o) { return M.pc[o.k] && !M.pc[o.k].g; });
      if (shiny.length) { var o2 = shiny[Math.floor(Math.random() * shiny.length)]; M.pc[o2.k].g = 1; M.pc[o2.k].gt = Date.now(); out.card = o2.k; out.glitter = true; }
    }
    if (window.SudokuSave) window.SudokuSave();
    pcRoom();
    return out;
  }
  // ---- in the room: the model centred over the door, the pinboard over the bookshelf ----
  var pcRoomEl = document.getElementById("room");
  place(dzPic, 92, 12, 24);                                         // the steamer picture moves up a little to make room for the model's masts
  var pcModel = xEl("button", "pc-model", pcRoomEl); pcModel.type = "button"; pcModel.setAttribute("aria-label", "Schiffsmodell der Pausbacke"); pcModel.hidden = true;
  pcModel.innerHTML = '<img src="' + PCA.pc_model + '" alt="">'; place(pcModel, 107, 31, 42);
  var pcBoard = xEl("button", "pc-board", pcRoomEl); pcBoard.type = "button"; pcBoard.setAttribute("aria-label", "Pinnwand mit Postkarten"); pcBoard.hidden = true;
  pcBoard.innerHTML = '<canvas width="36" height="26"></canvas>'; place(pcBoard, 3, 22, 36);
  var pcBoardC = pcBoard.querySelector("canvas").getContext("2d"); pcBoardC.imageSmoothingEnabled = false;
  var pcSig = "";
  function pcOwned() { var M = pcSt(); return PC_LIST.filter(function (o) { return M.pc[o.k]; }); }
  var pcBoardAt = "";
  function pcPlaceBoard() {                                       // always on the wall right above the door, a little behind the model
    if (pcBoardAt) return; pcBoardAt = "128,8"; place(pcBoard, 128, 8, 36);
  }
  function pcRoom() {
    pcPlaceBoard();
    var M = pcSt(), own = pcOwned(), sig = (M.model ? 1 : 0) + ":" + own.map(function (o) { return o.k + (M.pc[o.k].g ? "*" : ""); }).join(",");
    if (sig === pcSig && PCI.pc_board.complete) return; pcSig = sig;
    pcModel.hidden = !M.model; pcBoard.hidden = false;           // the empty board hangs there from the start: something is still to come
    var c = pcBoardC; c.clearRect(0, 0, 36, 26); if (PCI.pc_board.complete) c.drawImage(PCI.pc_board, 0, 0); else PCI.pc_board.onload = function () { pcSig = ""; pcRoom(); };
    var last = own.slice().sort(function (a, b) { return M.pc[b.k].t - M.pc[a.k].t; }).slice(0, 4), slots = [[5, 5], [17, 4], [8, 14], [21, 13]];
    last.forEach(function (o, i) {
      var x = slots[i][0], y = slots[i][1], im = PCI["pc_" + o.k];
      c.fillStyle = "#3a2414"; c.fillRect(x - 1, y - 1, 12, 9); c.fillStyle = M.pc[o.k].g ? "#e8c050" : "#faf4e4"; c.fillRect(x, y, 10, 7);
      if (im.complete) c.drawImage(im, 8 + o.f[0] - 4, 8 + o.f[1] - 2, 8, 5, x + 1, y + 1, 8, 5); else im.onload = function () { pcSig = ""; pcRoom(); };
      c.fillStyle = "#d63c32"; c.fillRect(x + 4, y - 1, 2, 2);
    });
  }
  setInterval(pcRoom, 1500); setTimeout(pcRoom, 50);
  pcModel.addEventListener("click", function (e) {
    e.stopPropagation(); if (decor || s.asleep) return;
    pcModel.classList.remove("toot"); void pcModel.offsetWidth; pcModel.classList.add("toot");
    beep([[196, .25], [247, .25], [294, .3]]);
    say(N() + " bestaunt das Modell der Pausbacke. Tuuut!");
  });
  pcBoard.addEventListener("click", function (e) { e.stopPropagation(); if (decor) return; pcOpen(); });
  // ---- the close-up of the pinboard: cork, six cards a page, two pages ----
  var pcEl = xEl("div", "bee-pov fi-pov pc-pov", scene); pcEl.hidden = true;
  pcEl.innerHTML = '<canvas width="180" height="135" class="fi-cv"></canvas><button type="button" class="bp-x" aria-label="Pinnwand schließen">×</button>' +
    '<button type="button" class="pc-pg l" aria-label="Vorige Seite">‹</button><button type="button" class="pc-pg r" aria-label="Nächste Seite">›</button><p class="pc-cnt"></p>';
  var pcCv = pcEl.querySelector("canvas"), pcc = pcCv.getContext("2d"); pcc.imageSmoothingEnabled = false;
  var pcPage = 0, pcSlots = [];
  function pcText(c, x, y, t, col) {                               // the little 3 x 5 caps font
    c.fillStyle = col;
    for (var i = 0; i < t.length; i++) { var g = PCF[t[i]] || PCF[" "]; for (var r = 0; r < g.length; r++) for (var k = 0; k < g[r].length; k++) if (g[r][k] === "1") c.fillRect(x + k, y + r, 1, 1); x += g[0].length + 1; }
    return x;
  }
  function pcTW(t) { var w = 0; for (var i = 0; i < t.length; i++) w += (PCF[t[i]] || PCF[" "])[0].length + 1; return w - 1; }
  function pcDrawWall() {
    var M = pcSt(), c = pcc; c.clearRect(0, 0, 180, 135); if (PCI.pc_cork.complete) c.drawImage(PCI.pc_cork, 0, 0);
    pcSlots = [];
    for (var j = 0; j < 6; j++) {
      var o = PC_LIST[pcPage * 6 + j]; if (!o) continue;
      var col = j % 3, row = (j / 3) | 0, jit = [[0, 1], [1, -1], [-1, 0], [1, 0], [0, -1], [-1, 1]][j], x = 6 + col * 57 + jit[0], y = 12 + row * 52 + jit[1], st = M.pc[o.k];
      if (st) {
        var im = PCI["pc_" + o.k];
        c.fillStyle = "#3a2414"; c.fillRect(x, y, 56, 40); c.fillStyle = st.g ? "#e8c050" : "#faf4e4"; c.fillRect(x + 1, y + 1, 54, 38);
        if (st.g) { c.fillStyle = "#fff4b0"; c.fillRect(x + 1, y + 1, 54, 1); c.fillRect(x + 1, y + 1, 1, 38); }
        if (im.complete) c.drawImage(im, 8 + o.f[0] - 25, 8 + o.f[1] - 17, 50, 34, x + 3, y + 3, 50, 34);
        c.fillStyle = "#3a2414"; c.fillRect(x + 27, y - 1, 3, 4); c.fillStyle = "#d63c32"; c.fillRect(x + 27, y - 1, 2, 3); c.fillStyle = "#fa8c78"; c.fillRect(x + 27, y - 1, 1, 1);
        pcSlots.push({ x: x, y: y, k: o.k });
      } else {
        c.fillStyle = "#96683c";
        for (var xx = x + 2; xx < x + 54; xx += 3) { c.fillRect(xx, y + 2, 1, 1); c.fillRect(xx, y + 37, 1, 1); }
        for (var yy = y + 2; yy < y + 38; yy += 3) { c.fillRect(x + 2, yy, 1, 1); c.fillRect(x + 53, yy, 1, 1); }
        pcText(c, x + 26, y + 12, "?", "#96683c");
        var h = (o.h || "").toUpperCase().replace(/ß/g, "SS"); if (h) pcText(c, x + 28 - (pcTW(h) >> 1), y + 24, h, "#96683c");
      }
    }
    var n = pcOwned().length; pcEl.querySelector(".pc-cnt").textContent = n + " von " + PC_LIST.length + " Postkarten";
    pcEl.querySelector(".pc-pg.l").hidden = pcPage === 0; pcEl.querySelector(".pc-pg.r").hidden = pcPage === 1;
  }
  function pcOpen() { pcPage = 0; pcEl.hidden = false; pcDrawWall(); beep([[520, .04], [660, .05]]); }
  function pcClose() { pcEl.hidden = true; }
  pcEl.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); pcClose(); });
  pcEl.querySelector(".pc-pg.l").addEventListener("click", function (e) { e.stopPropagation(); pcPage = 0; pcDrawWall(); beep([[440, .03]]); });
  pcEl.querySelector(".pc-pg.r").addEventListener("click", function (e) { e.stopPropagation(); pcPage = 1; pcDrawWall(); beep([[440, .03]]); });
  var pcSw = null;
  pcCv.addEventListener("pointerdown", function (e) { pcSw = { x: e.clientX, y: e.clientY }; });
  pcCv.addEventListener("pointerup", function (e) {
    if (!pcSw) return; var dx = e.clientX - pcSw.x; pcSw = null;
    if (Math.abs(dx) > 40) { var np = dx < 0 ? 1 : 0; if (np !== pcPage) { pcPage = np; pcDrawWall(); beep([[440, .03]]); } return; }
    var r = pcCv.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * 180, py = (e.clientY - r.top) / r.height * 135;
    pcSlots.forEach(function (sl) { if (px >= sl.x && px < sl.x + 56 && py >= sl.y && py < sl.y + 40) pcBig(sl.k); });
  });
  // ---- one card up close: tilt it with the finger, turn it over, hold the light card against the light, the glitter follows the tilt ----
  var pcHost = scene.parentNode;
  var pcM = document.createElement("div"); pcM.className = "pc-modal"; pcM.hidden = true;
  pcM.style.cssText = "position:fixed;inset:0;z-index:2000;background:rgba(30,18,10,.82);display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none";
  pcM.innerHTML = '<div class="pc-stage" style="perspective:900px;width:min(92vw,520px)"><div class="pc-card" style="position:relative;width:100%;aspect-ratio:136/106;transform-style:preserve-3d;transition:transform .45s cubic-bezier(.3,1.4,.5,1);cursor:grab">' +
    '<canvas class="pc-f" width="136" height="106" style="position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;backface-visibility:hidden;-webkit-backface-visibility:hidden;filter:drop-shadow(0 6px 8px rgba(0,0,0,.45))"></canvas>' +
    '<canvas class="pc-g" width="136" height="106" style="position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;backface-visibility:hidden;-webkit-backface-visibility:hidden;pointer-events:none"></canvas>' +
    '<canvas class="pc-b" width="136" height="106" style="position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(180deg);filter:drop-shadow(0 6px 8px rgba(0,0,0,.45))"></canvas></div></div>' +
    '<p class="pc-t" style="margin:14px 16px 12px;color:#fff6e4;font-weight:700;text-align:center"></p>' +
    '<div style="display:flex;gap:10px"><button type="button" class="pc-flip" style="font:inherit;font-weight:700;padding:8px 16px;border:0;background:#fff8ec;color:#3a2414;box-shadow:inset 0 0 0 2px #3a2414;cursor:pointer">Umdrehen</button>' +
    '<button type="button" class="pc-close" style="font:inherit;font-weight:700;padding:8px 16px;border:0;background:#c4500a;color:#fff;box-shadow:inset 0 0 0 2px #3a2414;cursor:pointer">Zurück</button></div>';
  pcHost.appendChild(pcM);
  var pcCard = pcM.querySelector(".pc-card"), pcFC = pcM.querySelector(".pc-f").getContext("2d"), pcGC = pcM.querySelector(".pc-g").getContext("2d"), pcBC = pcM.querySelector(".pc-b").getContext("2d");
  [pcFC, pcGC, pcBC].forEach(function (c) { c.imageSmoothingEnabled = false; });
  var pcV = null;                                                   // the card being looked at
  function pcFront() {
    var o = pcV.o, im = PCI["pc_" + o.k], c = pcFC; c.clearRect(0, 0, 136, 106);
    if (o.light) { var day = PCI.pc_nacht_d; c.globalAlpha = 1; c.drawImage(day, 0, 0); c.globalAlpha = pcV.lit; c.drawImage(im, 0, 0); c.globalAlpha = 1; }
    else c.drawImage(im, 0, 0);
    if (pcV.gl) {                                                   // a glitter card has a gold rim instead of the cream one
      var d = c.getImageData(0, 0, 136, 106), px = d.data;
      for (var i = 0; i < px.length; i += 4) if (px[i] === 250 && px[i + 1] === 242 && px[i + 2] === 222) { px[i] = 246; px[i + 1] = 222; px[i + 2] = 150; }
      c.putImageData(d, 0, 0);
    }
  }
  function pcBack() {
    var o = pcV.o, st = pcSt().pc[o.k], c = pcBC; c.clearRect(0, 0, 136, 106);
    c.fillStyle = "#24160c"; c.fillRect(0, 1, 136, 104); c.fillRect(1, 0, 134, 106); c.fillStyle = "#faf2de"; c.fillRect(1, 1, 134, 104); c.fillStyle = "#e4d6ba"; c.fillRect(1, 104, 134, 1); c.fillRect(134, 1, 1, 104);
    pcText(c, 68 - (pcTW("POSTKARTE") >> 1), 6, "POSTKARTE", "#962e24");
    c.fillStyle = "#c8b48c"; c.fillRect(72, 16, 1, 80);
    var y = 22; o.m.forEach(function (l) { pcText(c, 8, y, l, "#3a3a6a"); y += 9; });
    var nm = (N() || "DEIN HAMSTER").toUpperCase().replace(/ß/g, "SS").replace(/[^A-ZÄÖÜ0-9 .!?,-]/g, "").slice(0, 10);
    pcText(c, 8, y + 4, "DEIN " + nm, "#3a3a6a");
    pcText(c, 8, 92, (st.p || 0) + "%", "#a8784a");
    if (st.g) pcText(c, 30, 92, "GLITZER", "#c8962a");
    if (PCI.pc_stamp.complete) c.drawImage(PCI.pc_stamp, 114, 6);
    c.strokeStyle = "rgba(60,60,80,.75)"; c.lineWidth = 1;
    c.fillStyle = "rgba(60,60,80,.75)";
    for (var a = 0; a < 40; a++) { var an = a / 40 * Math.PI * 2; c.fillRect(Math.round(102 + Math.cos(an) * 12), Math.round(17 + Math.sin(an) * 11), 1, 1); }
    var dt = new Date(st.gt || st.t || Date.now()), ds = dt.getDate() + "." + (dt.getMonth() + 1) + ".";
    pcText(c, 102 - (pcTW(ds) >> 1), 10, ds, "rgba(60,60,80,.85)"); pcText(c, 102 - (pcTW("1912") >> 1), 18, "1912", "rgba(60,60,80,.85)");
    for (var x = 114; x < 132; x++) { c.fillRect(x, 24 + ((x >> 1) % 2), 1, 1); c.fillRect(x, 27 + ((x >> 1) % 2), 1, 1); }
    pcText(c, 80, 44, "AN DIE LIEBEN", "#3a3a6a"); pcText(c, 80, 60, "ZU HAUSE", "#3a3a6a");
    c.fillStyle = "#b8a684"; [52, 68, 84].forEach(function (yy) { for (var x2 = 78; x2 < 130; x2 += 2) c.fillRect(x2, yy, 1, 1); });
  }
  // pixels that may sparkle on a glitter card: the bright ones and the gold of the lettering
  function pcMask(o) {
    var cv = document.createElement("canvas"); cv.width = 136; cv.height = 106; var c = cv.getContext("2d"); c.drawImage(PCI["pc_" + o.k], 0, 0);
    var d = c.getImageData(0, 0, 136, 106).data, out = [];
    for (var y = 0; y < 106; y++) for (var x = 0; x < 136; x++) { var i = (y * 136 + x) * 4, l = d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11; if (d[i + 3] && (l > 165 || (d[i] > 190 && d[i + 1] > 140 && d[i + 2] < 90))) out.push(x, y); }
    return out;
  }
  function pcGlit(t) {
    var c = pcGC; c.clearRect(0, 0, 136, 106); if (!pcV || !pcV.gl) return;
    var m = pcV.mask, band = ((pcV.ry + pcV.rx * .6) / 60 + .5) * 190 - 30 + Math.sin(t / 900) * 8;
    for (var i = 0; i < m.length; i += 2) {
      var x = m[i], y = m[i + 1], d = Math.abs(x + y * .5 - band);
      if (d < 20) { c.globalAlpha = (1 - d / 20) * .95; c.fillStyle = ((x * 7 + y * 13) % 5) ? "#fff8d0" : "#ffe070"; c.fillRect(x, y, 1, 1); }
      else if (((x * 31 + y * 17 + (t / 160 | 0)) % 97) === 0) { c.globalAlpha = .9; c.fillStyle = "#ffffff"; c.fillRect(x, y, 1, 1); }
    }
    for (var yy = 0; yy < 106; yy++) { var x0 = Math.round(band - yy * .5) - 10; c.globalAlpha = .16; c.fillStyle = "#fffbe8"; c.fillRect(Math.max(0, x0), yy, 20, 1); }
    c.globalAlpha = .55; c.fillStyle = "#ffe070";                     // a gold frame that catches the light
    var gs = 6 + ((band / 4) | 0) % 124;
    for (var k = 0; k < 6; k++) { c.fillRect(Math.min(129, gs + k), 5, 1, 1); c.fillRect(Math.min(129, gs + k), 86, 1, 1); }
    c.globalAlpha = 1;
  }
  function pcApply(anim) {
    pcCard.style.transition = anim ? "transform .45s cubic-bezier(.3,1.4,.5,1)" : "none";
    pcCard.style.transform = "rotateX(" + pcV.rx.toFixed(1) + "deg) rotateY(" + (pcV.ry + (pcV.flip ? 180 : 0)).toFixed(1) + "deg)";
  }
  function pcLoop(t) { if (!pcV) return; if (pcV.light) { var tg = pcV.hold ? 1 : 0; if (Math.abs(pcV.lit - tg) > .01) { pcV.lit += (tg - pcV.lit) * .18; pcFront(); } } pcGlit(t); pcV.raf = requestAnimationFrame(pcLoop); }
  function pcBig(k) {
    var o = pcItem(k), st = pcSt().pc[k]; if (!o || !st) return;
    pcV = { o: o, rx: 0, ry: 0, flip: false, lit: o.light ? 0 : 1, hold: false, light: !!o.light, gl: !!st.g, mask: st.g ? pcMask(o) : null };
    pcFront(); pcBack(); pcApply(false);
    pcM.querySelector(".pc-t").textContent = o.n + (st.g ? " ✦ Glitzer" : "");
    pcM.hidden = false; beep([[660, .05], [880, .06]]); pcV.raf = requestAnimationFrame(pcLoop);
  }
  function pcBigEnd() { if (pcV) cancelAnimationFrame(pcV.raf); pcV = null; pcM.hidden = true; }
  var pcDrag = null;
  pcCard.addEventListener("pointerdown", function (e) {
    if (!pcV) return; e.preventDefault(); pcCard.setPointerCapture(e.pointerId);
    pcDrag = { x: e.clientX, y: e.clientY, ry: pcV.ry, rx: pcV.rx, moved: false, t: Date.now() };
    if (pcV.light && !pcV.flip) pcDrag.holdT = setTimeout(function () { if (pcDrag && !pcDrag.moved) { pcV.hold = true; beep([[330, .08], [494, .1]]); } }, 280);
  });
  pcCard.addEventListener("pointermove", function (e) {
    if (!pcDrag || !pcV) return; var dx = e.clientX - pcDrag.x, dy = e.clientY - pcDrag.y;
    if (Math.abs(dx) + Math.abs(dy) > 6) { pcDrag.moved = true; clearTimeout(pcDrag.holdT); }
    if (!pcDrag.moved || pcV.hold) return;
    pcV.ry = pcDrag.ry + dx * .55; pcV.rx = Math.max(-25, Math.min(25, pcDrag.rx - dy * .3)); pcApply(false);
  });
  function pcUp() {
    if (!pcDrag || !pcV) return; clearTimeout(pcDrag.holdT);
    if (pcV.hold) { pcV.hold = false; pcDrag = null; return; }
    if (!pcDrag.moved) { pcV.flip = !pcV.flip; beep([[520, .04], [392, .05]]); }
    else if (Math.abs(pcV.ry) > 70) { pcV.flip = !pcV.flip; beep([[520, .04], [392, .05]]); }
    pcV.ry = 0; pcV.rx = 0; pcApply(true); pcDrag = null;
  }
  pcCard.addEventListener("pointerup", pcUp); pcCard.addEventListener("pointercancel", pcUp);
  pcM.querySelector(".pc-flip").addEventListener("click", function () { if (!pcV) return; pcV.flip = !pcV.flip; pcApply(true); beep([[520, .04], [392, .05]]); });
  pcM.querySelector(".pc-close").addEventListener("click", pcBigEnd);
  pcM.addEventListener("click", function (e) { if (e.target === pcM) pcBigEnd(); });
  var _pc_interrupt = interrupt; interrupt = function () { if (!pcEl.hidden && !window.__resume) pcClose(); return _pc_interrupt.apply(this, arguments); };
  window.__pc = { award: function (d) { return pcAward(d); }, open: pcOpen, big: pcBig, room: pcRoom, st: pcSt,
    give: function (k, g) { var M = pcSt(); M.pc[k] = { t: Date.now(), p: 100, g: g ? 1 : 0 }; pcRoom(); }, model: function () { pcSt().model = Date.now(); pcRoom(); },
    reset: function () { var M = pcSt(); M.pc = {}; M.model = 0; pcSig = ""; pcRoom(); },
    shelf: function (id) { if (home.owned.shelf.indexOf(id) < 0) home.owned.shelf.push(id); home.placed.shelf = id; renderRoom(); renderCosy(); pcRoom(); } };
