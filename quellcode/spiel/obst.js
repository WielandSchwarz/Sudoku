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
  var osBoard = typeof obstsalatBoard === "function" ? obstsalatBoard(OS_SYNC, osAccount) : null;
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
      if (g.seed) msg = "Eine Tüte " + CROPS[g.seed].name + "-Samen!"; else { s.treats = (s.treats || 0) + 3; msg = "Samenlager voll: 3 Leckerli!"; }
    }
    try { if (window.SudokuSave) window.SudokuSave(); else if (typeof save === "function") save(); } catch (e) { }
    return msg;
  }
  function osOpen() {
    var e = osEnv(), acc = osAccount();
    osEl.hidden = false; osEl.innerHTML = '<div class="os-in"></div>';
    osGame = mountObstsalat(osEl.firstChild, OSART, { onFinish: osReward, season: e.season, time: e.time, weather: e.weather, board: osBoard, playerName: acc ? acc.name : N(), onClose: osClose });
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
