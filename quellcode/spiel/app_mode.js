  // ===================== app mode: real time, saving, navigation, sudoku bridge =====================
  var hamRoot = document.getElementById("ham-root");
  var APPLES = { easy: 1, medium: 1, hard: 2, expert: 3 };
  // decay without animations (used for the time the app was closed)
  function passHoursQuiet(h) {
    STATS.forEach(function (st) { s[st.id] = clamp(s[st.id] + DECAY[st.id][s.asleep ? 1 : 0] * h); });
  }
  function catchUpQuiet() {
    var now = Date.now(), h = Math.min(Math.max(0, (now - (s.t || now)) / 3600000), 24 * 30);
    while (h > 0) { var step = Math.min(h, 0.25); passHoursQuiet(step); h -= step; }
    s.t = now;
  }
  // put the hamster straight into his sleeping place (after loading a sleeping hamster)
  function placeAsleep() {
    if (home.sleepAt === "bed" && typeof placeAsleepBed === "function") return placeAsleepBed();
    if (typeof leaveBedNow === "function") leaveBedNow("room");
    var it = chairItem();
    if (it) { H.scale = CHAIR_S; var p = seatPos(it); moveTo(p.x, p.y, 0); ham.classList.add("in-chair"); H.where = "chair"; }
    else { H.scale = HS; moveTo(SPOT.home.x, SPOT.home.y - 2, 0); ham.classList.remove("in-chair"); H.where = "floor"; }
    front({ eyes: "sleep", mouth: "flat", ears: "flat", blanket: 2, paws: "down", blush: true }); body("snooze");
    chairCls("rock", !!(it && it.id === "rocking")); chairCls("sway", !!(it && it.id === "egg"));
    startZzz(); syncButtons(); skyTime();
  }
  function placeAwake() {
    if (typeof leaveBedNow === "function" && leaveBedNow(null)) return;
    stopZzz(); ham.classList.remove("in-chair"); H.where = "floor"; H.scale = HS; moveTo(SPOT.home.x, SPOT.home.y, 0); settle(); syncButtons(); skyTime();
  }
  function chairCls(cls, on) { [slotEl("chair"), document.getElementById("slot-chair-front")].forEach(function (el) { el.classList.toggle(cls, on); }); }
  // real time: every 30 seconds the needs move on by the time that has really passed
  setInterval(function () {
    var now = Date.now(), dh = Math.max(0, (now - (s.t || now)) / 3600000); s.t = now;
    if (dh > 0) passHours(dh);
    renderNeeds(); if (!busy) updateThought(); renderCosy();
  }, 30000);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible") return;
    var was = s.asleep; window.__resume = true; try { interrupt(); } finally { window.__resume = false; } catchUpQuiet();
    if (s.asleep) placeAsleep(); else if (was) placeAwake(); else settle();
    renderNeeds(); renderCosy(); renderStart();
  });
  function exportState() {
    catchUpQuiet();
    return { v: 1, name: s.name, born: s.born, t: s.t, food: Math.round(s.food * 10) / 10, energy: Math.round(s.energy * 10) / 10, love: Math.round(s.love * 10) / 10, fun: Math.round(s.fun * 10) / 10,
      asleep: !!s.asleep, treats: s.treats, owned: home.owned, placed: home.placed, pending: home.pending, pos: home.pos, scarf: home.scarf, kitchen: home.kitchen, bedroom: home.bedroom, houseStyle: home.houseStyle, canopy: home.canopy, life: home.life, sleepAt: home.sleepAt === "bed" ? "bed" : "chair",
      garden: { plots: garden.plots, seeds: garden.seeds, harvest: garden.harvest, snow: garden.snow, snowLv: garden.snowLv, snowSeen: !!garden.snowSeen, lastVisit: garden.lastVisit || 0, t: garden.t, friends: garden.friends || {}, advent: garden.advent, easter: garden.easter, xmas: garden.xmas }, words: window.WordsGame ? window.WordsGame.exportState() : undefined, tiles: window.TilesGame ? window.TilesGame.exportState() : undefined };
  }
  function importState(o) {
    if (!o || typeof o !== "object") return;
    ["food", "energy", "love", "fun"].forEach(function (k) { if (typeof o[k] === "number") s[k] = clamp(o[k]); });
    s.name = o.name || null; s.born = o.born || Date.now(); s.t = o.t || Date.now(); s.asleep = !!o.asleep; s.treats = typeof o.treats === "number" ? o.treats : 3; s.music = false;
    if (o.owned) for (var c in home.owned) home.owned[c] = (o.owned[c] || []).filter(function (id) { return item(c, id); });
    for (var c2 in home.owned) if (!home.owned[c2].length && FURN[c2] && FURN[c2][0]) home.owned[c2] = [FURN[c2][0].id];
    if (o.placed) for (var c3 in home.placed) { var own3 = home.owned[c3.replace(/\d+$/, "")] || []; if (o.placed[c3] === null || (o.placed[c3] && own3.indexOf(o.placed[c3]) >= 0)) home.placed[c3] = o.placed[c3]; }
    if (!home.placed.wall) home.placed.wall = home.owned.wall[0];
    if (!home.placed.floor) home.placed.floor = home.owned.floor[0];
    home.pending = o.pending && item(o.pending.cat, o.pending.id) ? o.pending : null;
    if (o.pos && typeof o.pos === "object") home.pos = o.pos;
    if (o.scarf) home.scarf = o.scarf;
    if (o.bedroom && typeof o.bedroom === "object" && home.bedroom) { for (var bk in o.bedroom) if (typeof o.bedroom[bk] === "number") home.bedroom[bk] = o.bedroom[bk]; if (typeof renderBedroomArt === "function") renderBedroomArt(); }
    if (typeof o.houseStyle === "number") home.houseStyle = o.houseStyle;
    home.sleepAt = o.sleepAt === "bed" ? "bed" : "chair";
    if (o.life && typeof o.life === "object") { home.life = o.life; if (Array.isArray(home.life.knownSeen)) home.life.knownSeen = home.life.knownSeen.filter(function (id) { return typeof id === "string" && id.indexOf(",") < 0 && id.length < 20; }); }
    if (typeof o.canopy === "number") { home.canopy = o.canopy; if (typeof renderBedroomArt === "function") renderBedroomArt(); }
    if (o.kitchen && typeof o.kitchen === "object") { for (var kk in o.kitchen) if (typeof o.kitchen[kk] === "number") home.kitchen[kk] = o.kitchen[kk]; if (typeof renderKitchenArt === "function") renderKitchenArt(); }
    if (o.garden && typeof o.garden === "object") {
      ["plots", "seeds", "harvest", "snowLv", "friends", "advent", "easter", "xmas"].forEach(function (k) { if (o.garden[k]) garden[k] = o.garden[k]; });
      ["snow", "lastVisit", "t"].forEach(function (k) { if (typeof o.garden[k] === "number") garden[k] = o.garden[k]; });
      garden.snowSeen = !!o.garden.snowSeen;
      Object.keys(CROPS).concat(typeof DISHES === "object" ? Object.keys(DISHES) : [], ["nut"]).forEach(function (c) {
        if (typeof garden.harvest[c] !== "number") garden.harvest[c] = 0;
        if (CROPS[c] && typeof garden.seeds[c] !== "number") garden.seeds[c] = 0;
      });
      tickGarden(); renderFoods();
    }
    if (o.words && window.WordsGame) window.WordsGame.importState(o.words);
    if (o.tiles && window.TilesGame) window.TilesGame.importState(o.tiles);
    roomDefaults(); renderScarfBtn();
    catchUpQuiet();
    if (s.name) { document.getElementById("ham-name").textContent = s.name; ham.setAttribute("aria-label", "Hamster " + s.name); }
    interrupt(); renderRoom(); renderPackage();
    if (s.asleep) placeAsleep(); else placeAwake();
    renderNeeds(); renderCosy(); renderStart(); lastSig = sig();
  }
  // furniture is never lost between devices: owned items are merged, everything else follows the newer state
  function mergeServer(o, newer) {
    if (!o || typeof o !== "object") return;
    var union = {};
    for (var c in home.owned) {
      var set = {}; (home.owned[c] || []).concat((o.owned && o.owned[c]) || []).forEach(function (id) { if (item(c, id)) set[id] = true; });
      union[c] = Object.keys(set);
    }
    var fr = {}, mine = garden.friends || {}, theirs = (o.garden && o.garden.friends) || {}, frUp = false;   // hearts only ever grow: keep the higher count from both sides
    Object.keys(mine).concat(Object.keys(theirs)).forEach(function (k) { fr[k] = Math.max(mine[k] || 0, theirs[k] || 0); if (fr[k] !== (mine[k] || 0)) frUp = true; });
    if (newer) { var copy = JSON.parse(JSON.stringify(o)); copy.owned = union; copy.garden = copy.garden || {}; copy.garden.friends = fr; if (!copy.pending && home.pending) copy.pending = home.pending; importState(copy); }
    else { var changed = false; for (var c4 in union) if (union[c4].length !== home.owned[c4].length) { home.owned[c4] = union[c4]; changed = true; } if (changed) { renderCosy(); if (decor) renderCatalog(); } if (frUp) garden.friends = fr; }
  }
  function onSolved(diff, kind) {
    catchUpQuiet();
    if (!s.name) return null;
    var n = (APPLES[diff] || 1) + (kind === "killer" ? 1 : 0), happy = isHappy(), gift = null;
    s.treats += n;
    if (happy) gift = pickGift();
    var gr_ = seedOrFurn(), seed = gr_.seed || null;
    renderNeeds(); renderCosy(); persistNow();
    return { apples: n, name: s.name, happy: happy, gift: !!gift, all: happy && !gift, seed: seed, seedName: seed ? CROPS[seed].name : "", furnName: gr_.furn ? gr_.furn.name : "" };
  }
  function openPackageSoon() { window.Nav.show("hamster"); if (home.pending) later(openPackage, 800); }
  // save whenever something that matters changed (needs are compared in steps of 5)
  // things that change by themselves with time (needs, growing plants, snow, sleep) are saved on this device,
  // but they do not count as a newer state for syncing, so a device left open with an old state cannot overwrite the newer one
  function passiveSig() {
    var plots = garden.plots.map(function (p) { return p ? [stage(p), p.wetUntil > Date.now()] : null; });
    return JSON.stringify([s.asleep, Math.round(s.food / 5), Math.round(s.energy / 5), Math.round(s.love / 5), Math.round(s.fun / 5), plots, garden.snow]);
  }
  function sig() {
    var plots = garden.plots.map(function (p) { return p ? [p.crop, p.wetUntil || 0] : null; });
    return JSON.stringify([s.name, s.treats, home.owned, home.placed, home.pending, home.pos, home.scarf, home.kitchen, home.bedroom, home.houseStyle, home.canopy, home.sleepAt, JSON.stringify(home.life || 0), plots, garden.seeds, garden.harvest, garden.snowLv, garden.snow, garden.lastVisit, garden.friends, garden.advent, garden.easter, garden.xmas, window.WordsGame ? window.WordsGame.sig() : "", window.TilesGame ? window.TilesGame.sig() : ""]);
  }
  var lastSig = null, lastPSig = null;
  function persistNow() { lastSig = sig(); lastPSig = passiveSig(); if (window.SudokuSave) window.SudokuSave(); }
  setInterval(function () {
    var g = sig(), ps = passiveSig();
    if (lastSig !== null && g !== lastSig) persistNow();
    else if (lastPSig !== null && ps !== lastPSig) { lastPSig = ps; if (window.SudokuSaveQuiet) window.SudokuSaveQuiet(); else if (window.SudokuSave) window.SudokuSave(); }
  }, 2000);

  window.Nav = {
    current: "home",
    show: function (w) {
      this.current = w;
      document.getElementById("app").hidden = w !== "sudoku";
      hamRoot.hidden = w === "sudoku";
      if (w !== "hamster") { if (s.music) { s.music = false; stopMusic(); } document.getElementById("tracks").hidden = true; if (decor) setDecor(false); }
      if (w !== "words" && window.WordsGame) window.WordsGame.leave();
      if (w !== "tiles" && window.TilesGame) window.TilesGame.leave();
      if (w === "home") show("scr-start");
      else if (w === "words") { show("scr-words"); if (window.WordsGame) window.WordsGame.enter(); }
      else if (w === "tiles") { show("scr-tiles"); if (window.TilesGame) window.TilesGame.enter(); }
      else if (w === "hamster") { if (!s.name) openNaming(); else { show("scr-hamster"); refresh(); if (!statusEl.textContent) say("Tippe " + N() + " an oder streichle mit dem Finger über ihn."); } }
      window.scrollTo(0, 0);
    }
  };
  // the animal album, reachable from the hamster screen, with the hearts of every garden friend
  document.getElementById("ham-album-btn").addEventListener("click", function () { if (window.SudokuAlbum) window.SudokuAlbum(); document.getElementById("ham-album").hidden = false; });
  document.getElementById("ham-album-close").addEventListener("click", function () { document.getElementById("ham-album").hidden = true; });
  document.getElementById("ham-album").addEventListener("click", function (e) { if (e.target.id === "ham-album") e.target.hidden = true; });
  window.HamsterApp = {
    exportState: exportState, importState: importState, mergeServer: mergeServer, onSolved: onSolved,
    friendInfo: function () { return { friends: garden.friends || {}, visitors: VISIT.slice() }; },
    hasPending: function () { return !!home.pending; }, openPackageSoon: openPackageSoon,
    giftSVG: svgOf(PROPS.gift.svg, 24, 24), appleSVG: svgOf(A.apple, SZ.apple[0], SZ.apple[1]), seedSVG: function (id) { return svgOf(A["seed_" + id], 8, 10); },
    name: function () { return s.name; }
  };
