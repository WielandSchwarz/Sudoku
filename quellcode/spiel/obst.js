  // ===================== Obstsalat: a fruit basket next to the greenhouse opens the cut-the-fruit mini game (osgame.js) =====================
  var OSART = /*OBSTART*/;
  var OS_SYNC = "https://sudoku-sync.wieland-schwarz.workers.dev";
  var OSB = { x: 106, b: 93, w: 18, h: 16 };
  var osBtn = lBtn("l-gobj os-basket", gardenEl, svgOf(OSART.basket, OSB.w, OSB.h), "Obstkorb");
  function osLayout() { pos(osBtn, OSB.x, OSB.b - OSB.h, OSB.w); osBtn.style.zIndex = OSB.b; }
  var _os_layoutGarden = layoutGarden; layoutGarden = function () { _os_layoutGarden(); osLayout(); };
  osLayout();
  var osEl = xEl("div", "bee-pov os-pov", scene); osEl.hidden = true;
  var osGame = null;
  function osEnv() {
    var se = { spring: "fruehling", summer: "sommer", autumn: "herbst", winter: "winter" }[season()] || "sommer";
    var ph = daylight(), w = typeof weather !== "undefined" ? weather.type : "sun";
    return { season: se, time: ph === "night" ? "nacht" : ph === "twilight" ? "abend" : "tag", weather: w === "rain" || w === "storm" ? "regen" : w === "snow" ? "schnee" : w === "clouds" ? "wolken" : "sonne" };
  }
  function osAccount() { try { return window.__sudokuAccount ? window.__sudokuAccount() : null; } catch (e) { return null; } }
  var osBoard = typeof obstsalatBoard === "function" ? obstsalatBoard(OS_SYNC, osAccount, function () { return N(); }) : null;
  /* rewards: every 5th round played to the end = a random bag of seeds, every 20th = a piece of furniture */
  function osFurnPop(f) {
    var cat = f.cat, it = f.it, art, cls = "";
    try {
      art = (cat === "wall" || cat === "floor") ? '<div class="ip-swatch" style="background-image:' + tileURL(it.tile).replace(/"/g, "'") + ';background-size:' + (it.w * 1.6) + 'px"></div>' : itemSVG(cat, it, "", "");
      if (cat === "meadow" && MBIG["mb_" + it.id]) art = '<svg viewBox="0 0 52 52" aria-hidden="true" shape-rendering="crispEdges">' + tint(MBIG["mb_" + it.id].svg) + '</svg>';
      cls = cat === "plant" ? "ip-tall" : cat === "meadow" ? "ip-plant" : "";
    } catch (e) { art = ""; }
    if (osGame && osGame.pause) osGame.pause(true);
    itemPop({ unwrap: true, force: true, art: art, cls: cls, title: "Neu: " + f.name + "!", onClose: function () { if (osGame && osGame.pause) osGame.pause(false); } });
  }
  /* guests: a befriended animal sits beside the hamster and wishes for its favourite fruit (two per animal, the first one in season) */
  var OS_FAV = { igel: ["apfel", "birne"], robin: ["kirschen", "erdbeere"], tit: ["kirschen", "pflaume"], duck: ["erdbeere", "apfel"], chick: ["erdbeere", "moehre"], peng: ["kirschen", "apfel"], beaver: ["birne", "apfel"], otter: ["erdbeere", "pflaume"], owl: ["pflaume", "birne"], frog: ["kirschen", "erdbeere"], ladybug: ["erdbeere", "kirschen"], seal: ["tomate", "apfel"], puffin: ["kirschen", "pflaume"], turtle: ["tomate", "erdbeere"], crab: ["tomate", "kuerbis"], elk: ["apfel", "moehre"], lynx: ["birne", "pflaume"], panda: ["apfel", "birne"], koala: ["birne", "kirschen"], hare: ["moehre", "apfel"], squirrel: ["kuerbis", "birne"], fox: ["kirschen", "pflaume"], mouse: ["erdbeere", "kuerbis"], badger: ["kuerbis", "moehre"] };
  function osGuest(season) {
    var seen = window.HamsterSeen ? window.HamsterSeen() || {} : null;
    var pool = Object.keys(OS_FAV).filter(function (id) { return ALLANI[id] && (!seen || seen[id]); });
    if (!pool.length) pool = ["igel"];
    var id = pool[Math.floor(Math.random() * pool.length)], fr = OSART.fruit;
    var fav = OS_FAV[id].filter(function (k) { return fr[k] && (fr[k].weights || {})[season]; })[0] || OS_FAV[id].filter(function (k) { return fr[k] && Object.keys(fr[k].weights || {}).some(function (q) { return fr[k].weights[q]; }); })[0] || "apfel";
    return { id: id, name: (typeof ANAME !== "undefined" && ANAME[id]) || id, svg: ALLANI[id].svg, vb: ALLANI[id].vb, fav: fav };
  }
  function osReward(r) {
    if (r.cuts) { s.osAlbum = s.osAlbum || {}; Object.keys(r.cuts).forEach(function (k) { s.osAlbum[k] = (s.osAlbum[k] || 0) + r.cuts[k]; }); }
    if (r.score > 0) { s.food = clamp(s.food + Math.min(30, 6 + Math.round(r.score / 5))); try { renderNeeds(); } catch (e) { } }   /* fruit salad fills him up */
    if (!r.timeUp) return "";
    s.osRounds = (s.osRounds || 0) + 1; var n = s.osRounds, msg = "";
    if (n % 5 === 0) {   /* every 5th finished round: a new piece of furniture, shown big while the game waits behind it */
      var f = typeof furnNow === "function" ? furnNow() : null;
      if (f) setTimeout(function () { osFurnPop(f); }, 900); else { s.treats = (s.treats || 0) + 5; msg = "5 Leckerli!"; }
      try { renderCosy(); } catch (e) { }
    }
    try { if (window.SudokuSave) window.SudokuSave(); else if (typeof save === "function") save(); } catch (e) { }
    return msg;
  }
  /* sounds: a soft pop when fruit flies up, a swish for the swipe, a juicy squish for a cut (higher with every hit in one swipe),
     chimes for gold and combos, a magic glissando per special, a thump for the chestnut, ticks in the last seconds, a fanfare at the end */
  var OS_SFX = (function () {
    var noiseBuf = null, lastLaunch = 0;
    function A() { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); return actx; }
    function nb(a) { if (!noiseBuf) { noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate); var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return noiseBuf; }
    function noise(dur, f0, f1, q, g, at, type) { try { var a = A(), t0 = a.currentTime + .01 + (at || 0), n = a.createBufferSource(), fl = a.createBiquadFilter(), gn = a.createGain();
      n.buffer = nb(a); fl.type = type || "bandpass"; fl.frequency.setValueAtTime(f0, t0); fl.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t0 + dur); fl.Q.value = q;
      gn.gain.setValueAtTime(.0001, t0); gn.gain.exponentialRampToValueAtTime(g, t0 + Math.min(.02, dur / 3)); gn.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
      n.connect(fl); fl.connect(gn); gn.connect(a.destination); n.start(t0, Math.random() * .5); n.stop(t0 + dur + .02); } catch (e) { } }
    function tone(f, dur, g, type, at, f2) { try { var a = A(), t0 = a.currentTime + .01 + (at || 0), o = a.createOscillator(), gn = a.createGain(); o.type = type || "sine"; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
      gn.gain.setValueAtTime(.0001, t0); gn.gain.exponentialRampToValueAtTime(g, t0 + .008); gn.gain.exponentialRampToValueAtTime(.0001, t0 + dur); o.connect(gn); gn.connect(a.destination); o.start(t0); o.stop(t0 + dur + .02); } catch (e) { } }
    var NOTES = [523, 587, 659, 784, 880, 1047, 1175, 1319];
    return function (k, n) {
      if (k === "launch" || k === "launchBomb") { var now = Date.now(); if (now - lastLaunch < 90) return; lastLaunch = now; tone(k === "launch" ? 240 + Math.random() * 60 : 140, .09, .05, "sine", 0, k === "launch" ? 520 : 220); noise(.08, 900, 400, 1.2, .03); }
      else if (k === "swish") noise(.11, 900, 3200, 1.6, .045);
      else if (k === "cut") { var p = Math.min(n || 0, 6); noise(.09, 2400, 700, 1.4, .09); tone(330 * Math.pow(1.12, p), .07, .07, "triangle", .01, 160 * Math.pow(1.12, p)); noise(.05, 5000, 3000, 3, .03, .04); }
      else if (k === "gold") { noise(.08, 2400, 700, 1.4, .08); [1319, 1568, 2093].forEach(function (f, i) { tone(f, .22, .05, "triangle", .03 + i * .06); }); }
      else if (k === "combo") { var c = Math.min(n || 3, 8); for (var i = 0; i < c; i++) tone(NOTES[i], .12, .06, "square", i * .055); tone(NOTES[Math.min(c, 7)] * 2, .3, .04, "triangle", c * .055); }
      else if (k === "frostbeere") { for (var j = 0; j < 7; j++) tone(2400 - j * 180, .25, .03, "sine", j * .05); tone(1200, .6, .02, "triangle", .1, 600); }
      else if (k === "sonnenblume") { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, .16, .06, "square", i * .07); }); tone(1047, .35, .04, "triangle", .3); }
      else if (k === "honigwabe") { for (var h = 0; h < 6; h++) tone(300 + h * 60, .08, .05, "triangle", h * .05, 420 + h * 60); noise(.4, 600, 1400, 2, .03, .05); }
      else if (k === "pusteblume") { for (var q = 0; q < 8; q++) tone(900 + q * 90, .3, .02, "sine", q * .06, 1400 + q * 90); noise(.6, 1800, 3000, 1.2, .025); }
      else if (k === "kleeblatt") { tone(220, .5, .05, "triangle", 0, 660); tone(330, .5, .04, "sine", .1, 990); [784, 988, 1175].forEach(function (f, i) { tone(f, .14, .04, "square", .45 + i * .06); }); }
      else if (k === "regenbogenerdbeere") { [523, 587, 659, 698, 784, 880, 988, 1047].forEach(function (f, i) { tone(f, .1, .045, "square", i * .045); }); }
      else if (k === "uhrbluete") { for (var u = 0; u < 4; u++) { tone(1600, .04, .06, "square", u * .12); tone(1200, .04, .05, "square", u * .12 + .06); } tone(1568, .4, .05, "triangle", .5); }
      else if (k === "gluehbeere") { [659, 831, 988, 1319].forEach(function (f, i) { tone(f, .5, .03, "sine", i * .09); }); }
      else if (k === "hamsterkern") { [392, 523, 659, 784, 1047].forEach(function (f, i) { tone(f, .14, .06, "square", i * .07); }); tone(1047, .5, .05, "triangle", .38); tone(1568, .4, .03, "sine", .45); }
      else if (k === "shieldhit") { noise(.12, 2600, 900, 1.4, .1); [1319, 1760].forEach(function (f, i) { tone(f, .14, .05, "triangle", i * .05); }); }
      else if (k === "knock") { tone(n > 1 ? 260 : 220, .08, .14, "triangle", 0, 120); noise(.06, 1400, 600, 2, .08); }
      else if (k === "kokos") { noise(.18, 1800, 500, 1, .14); tone(180, .12, .1, "triangle", 0, 90); [1047, 1319, 1568].forEach(function (f, i) { tone(f, .16, .04, "triangle", .12 + i * .06); }); }
      else if (k === "melone") { noise(.22, 1600, 300, .9, .16); tone(150, .16, .12, "sine", 0, 70); }
      else if (k === "bomb") { noise(.45, 600, 60, .8, .3, 0, "lowpass"); tone(120, .35, .14, "sine", 0, 40); noise(.2, 3000, 1500, 2, .08, .02); }
      else if (k === "pop") { tone(700, .06, .07, "sine", 0, 1600); noise(.05, 4000, 2500, 3, .04); }
      else if (k === "honigglas") { for (var hg = 0; hg < 5; hg++) tone(420 - hg * 40, .16, .05, "sine", hg * .07, 300 - hg * 30); tone(196, .5, .04, "triangle", .3, 150); }
      else if (k === "skewer") { var sn = Math.min(n || 3, 6); for (var sk = 0; sk < sn; sk++) { tone(520 + sk * 70, .05, .07, "triangle", sk * .06); noise(.04, 1800, 900, 2, .05, sk * .06); } [1047, 1319, 1568, 2093].forEach(function (f, i) { tone(f, .2, .045, "square", sn * .06 + i * .07); }); }
      else if (k === "blend") { noise(.9, 300, 900, .8, .08, 0, "lowpass"); tone(90, .9, .05, "sawtooth", 0, 140); noise(.9, 1200, 2000, 1.5, .03); }
      else if (k === "slurp") { for (var sl = 0; sl < 3; sl++) noise(.18, 700 + sl * 200, 1500 + sl * 200, 3, .06, sl * .28); tone(520, .25, .04, "sine", .9, 780); }
      else if (k === "tick") { tone(n <= 3 ? 1400 : 1100, .05, .06, "square"); }
      else if (k === "end") { [523, 659, 784].forEach(function (f, i) { tone(f, .2, .05, "square", i * .12); }); }
      else if (k === "full") { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, .2, .06, "square", i * .11); }); tone(1047, .5, .04, "triangle", .5); }
      else if (k === "record") { [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (f, i) { tone(f, i === 6 ? .6 : .14, .06, "square", i * .1); }); [2093, 2637].forEach(function (f, i) { tone(f, .3, .03, "triangle", .7 + i * .08); }); }
    };
  })();
  function osOpen() {
    var e = osEnv(), acc = osAccount();
    osEl.hidden = false; osEl.innerHTML = '<div class="os-in"></div>';
    osGame = mountObstsalat(osEl.firstChild, OSART, { onFinish: osReward, sfx: OS_SFX, guest: osGuest(e.season), album: function () { return s.osAlbum || {}; }, season: e.season, time: e.time, weather: e.weather, board: osBoard, hamsterName: N(), onClose: osClose });
  }
  function osClose() {
    var st = osGame && osGame.state ? osGame.state() : null;
    if (osGame) osGame.destroy(); osGame = null; osEl.hidden = true; osEl.innerHTML = "";
    var sc = st ? (st.best || st.score || 0) : 0;
    front({ eyes: "happy", mouth: "grin", paws: "down" }); if (sc > 0) say(N() + " ist ganz satt vom Obstsalat.");
  }
  async function osSeq() {
    await walkTo(OSB.x + OSB.w / 2 - 4, 104);
    front({ eyes: "happy", mouth: "teeth", paws: "hold" }); await wait(350); front({ paws: "down" });
    osOpen();
  }
  osBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (decor || s.asleep) return; if (busy && !interruptible()) return; if (busy) interrupt();
    act("obst", osSeq);
  });
  window.__obst = { rounds: function (v) { if (v != null) s.osRounds = v; return s.osRounds || 0; }, open: osOpen, close: osClose, game: function () { return osGame; }, env: osEnv };
  /* the meadow spot right in front of the basket (meadow1) is gone: whatever stood there moves to a free spot, or back into the catalogue */
  function osNoMeadow1() {
    var id = home.placed.meadow1; if (id) { var fr = [0, 2].filter(function (i) { return !home.placed["meadow" + i]; })[0]; if (fr !== undefined) home.placed["meadow" + fr] = id; home.placed.meadow1 = null; }
    var el = document.getElementById("slot-meadow1"); if (el) { el.hidden = true; el.style.display = "none"; }
    var hit = document.getElementById("g-tree-hit1"); if (hit) hit.remove();
  }
  var _os_rgd = renderGardenDecor; renderGardenDecor = function () { osNoMeadow1(); _os_rgd(); osNoMeadow1(); };
  osNoMeadow1();
