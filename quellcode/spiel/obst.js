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
  function osReward(r) {
    if (!r.timeUp) return "";
    s.osRounds = (s.osRounds || 0) + 1; var n = s.osRounds, msg = "";
    if (n % 20 === 0) {
      var f = typeof furnNow === "function" ? furnNow() : null;
      if (f) msg = "Neu: " + f.name + "!"; else { s.treats = (s.treats || 0) + 5; msg = "5 Leckerli!"; }
      try { renderCosy(); } catch (e) { }
    } else if (n % 5 === 0) {
      var g = seedOrFurn(null, 1, true);
      if (g.seed) msg = "Eine Tüte Samen: " + CROPS[g.seed].name + "!"; else { s.treats = (s.treats || 0) + 3; msg = "Samenlager voll: 3 Leckerli!"; }
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
      else if (k === "knock") { tone(n > 1 ? 260 : 220, .08, .14, "triangle", 0, 120); noise(.06, 1400, 600, 2, .08); }
      else if (k === "kokos") { noise(.18, 1800, 500, 1, .14); tone(180, .12, .1, "triangle", 0, 90); [1047, 1319, 1568].forEach(function (f, i) { tone(f, .16, .04, "triangle", .12 + i * .06); }); }
      else if (k === "melone") { noise(.22, 1600, 300, .9, .16); tone(150, .16, .12, "sine", 0, 70); }
      else if (k === "bomb") { noise(.45, 600, 60, .8, .3, 0, "lowpass"); tone(120, .35, .14, "sine", 0, 40); noise(.2, 3000, 1500, 2, .08, .02); }
      else if (k === "tick") { tone(n <= 3 ? 1400 : 1100, .05, .06, "square"); }
      else if (k === "end") { [523, 659, 784].forEach(function (f, i) { tone(f, .2, .05, "square", i * .12); }); }
      else if (k === "full") { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, .2, .06, "square", i * .11); }); tone(1047, .5, .04, "triangle", .5); }
      else if (k === "record") { [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (f, i) { tone(f, i === 6 ? .6 : .14, .06, "square", i * .1); }); [2093, 2637].forEach(function (f, i) { tone(f, .3, .03, "triangle", .7 + i * .08); }); }
    };
  })();
  function osOpen() {
    var e = osEnv(), acc = osAccount();
    osEl.hidden = false; osEl.innerHTML = '<div class="os-in"></div>';
    osGame = mountObstsalat(osEl.firstChild, OSART, { onFinish: osReward, sfx: OS_SFX, season: e.season, time: e.time, weather: e.weather, board: osBoard, hamsterName: N(), onClose: osClose });
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
