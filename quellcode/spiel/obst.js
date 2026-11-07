  // ===================== Obstsalat: a fruit basket next to the greenhouse opens the cut-the-fruit mini game (osgame.js) =====================
  var OSART = /*OBSTART*/;
  var OS_SYNC = "https://sudoku-sync.wieland-schwarz.workers.dev";
  var OSB = { x: 100, b: 97, w: 24, h: 21 };
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
  function osOpen() {
    var e = osEnv(), acc = osAccount();
    osEl.hidden = false; osEl.innerHTML = '<div class="os-in"></div>';
    osGame = mountObstsalat(osEl.firstChild, OSART, { season: e.season, time: e.time, weather: e.weather, board: osBoard, playerName: acc ? acc.name : N(), onClose: osClose });
  }
  function osClose() {
    var st = osGame && osGame.state ? osGame.state() : null;
    if (osGame) osGame.destroy(); osGame = null; osEl.hidden = true; osEl.innerHTML = "";
    var sc = st ? (st.best || st.score || 0) : 0;
    front({ eyes: "happy", mouth: "grin", paws: "down" }); if (sc > 0) say(N() + " ist ganz satt vom Obstsalat.");
  }
  async function osSeq() {
    await walkTo(OSB.x + OSB.w / 2, OSB.b + 3);
    front({ eyes: "happy", mouth: "teeth", paws: "hold" }); await wait(350); front({ paws: "down" });
    osOpen();
  }
  osBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (decor || s.asleep) return; if (busy && !interruptible()) return; if (busy) interrupt();
    act("obst", osSeq);
  });
  window.__obst = { open: osOpen, close: osClose, game: function () { return osGame; }, env: osEnv };
