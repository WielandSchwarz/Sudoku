  // ---------- furniture: earned through sudokus while the hamster is happy ----------
  var CATS = { chair: "Sessel", clock: "Uhr", shelf: "Regal", plant: "Pflanze", wall: "Tapete", floor: "Boden" };
  var NEED_MIN = 120;
  // width of the armrests (percent of the chair) that are drawn in front of a sitting hamster
  var ARMS = { wing_red: 21, wing_check: 21, velvet: 21, club: 20, beanbag: 16, rocking: 0, egg: 14, strandkorb: 19, peacock: 12, sofa: 15 }, ARM_TOP = 46;
  var home;
  function resetHome() { home = { pending: null, owned: { chair: ["wing_red"], clock: ["round"], shelf: ["small"], wall: ["cream"], floor: ["planks"], plant: ["cactus"] }, placed: { chair: "wing_red", clock: "round", shelf: "small", wall: "cream", floor: "planks", plant: "cactus" }, happyMin: 0 }; }
  resetHome();
  function item(cat, id) { return (FURN[cat] || []).filter(function (x) { return x.id === id; })[0]; }
  function isHappy() { var avg = (s.food + s.energy + s.love + s.fun) / 4; return avg >= 70 && Math.min(s.food, s.energy, s.love, s.fun) >= 25; }
  function tileURL(svgStr) { return 'url("data:image/svg+xml,' + encodeURIComponent(svgStr) + '")'; }
  function ownedCount() { var n = 0; for (var c in home.owned) n += home.owned[c].length; return n; }
  function extras(cat, it) {
    var h = "";
    if (it.leaves) it.leaves.forEach(function (l) { h += '<g class="leaf" style="transform-origin:' + l.ox + 'px ' + l.oy + 'px">' + l.svg + '</g>'; });
    if (cat !== "clock") return h;
    if (it.weights) h += '<path fill="#3a2414" d="M10 36h1v10h-1zM21 36h1v10h-1z"/><path fill="#8a5a30" d="M9 46h3v5h-3zM20 46h3v5h-3z"/><path fill="#b07a44" d="M9 46h1v4h-1zM20 46h1v4h-1z"/>';
    if (it.pendulum) {
      var p = it.pendulum, bob = p.bob === "gl" ? "#e9b949" : "#8a5a30";
      h += '<g class="pend" style="transform-origin:' + p.x + 'px ' + p.y + 'px"><rect x="' + (p.x - 0.5) + '" y="' + p.y + '" width="1" height="' + p.len + '" fill="#3a2414"/><circle cx="' + p.x + '" cy="' + (p.y + p.len + 1) + '" r="2.6" fill="' + bob + '" stroke="#3a2414" stroke-width="1"/></g>';
    }
    if (it.lid) h += '<g class="lid">' + it.lid + '</g>';
    if (it.bird) h += '<g class="bird" style="transform-origin:16px 16px"><g transform="translate(10 12)">' + it.bird + '</g></g>';
    if (it.ring) h += '<g class="ring">' + it.ring + '</g>';
    if (it.twinkle) h += '<g class="twk">' + it.twinkle + '</g>';
    h += '<g class="hands" data-cx="' + it.cx + '" data-cy="' + it.cy + '" data-r="' + it.r + '"' + (it.second ? ' data-sec="1"' : "") + '></g>';
    return h;
  }
  function hand(cx, cy, ang, len, wdt, col) {
    var a = ang * Math.PI / 180, x = cx + Math.sin(a) * len, y = cy - Math.cos(a) * len;
    return '<line x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(2) + '" y2="' + y.toFixed(2) + '" stroke="' + col + '" stroke-width="' + wdt + '" stroke-linecap="round"/>';
  }
  function tickClocks() {
    var d = new Date(), sec = d.getSeconds(), min = d.getMinutes() + sec / 60, hr = (d.getHours() % 12) + min / 60;
    document.querySelectorAll(".hands").forEach(function (g) {
      var cx = +g.dataset.cx, cy = +g.dataset.cy, r = +g.dataset.r;
      var h = hand(cx, cy, hr * 30, r * 0.55, Math.max(1.2, r * 0.16), "#3a2414") + hand(cx, cy, min * 6, r * 0.86, Math.max(0.9, r * 0.1), "#3a2414");
      if (g.dataset.sec) h += hand(cx, cy, sec * 6, r * 0.92, 0.6, "#e8554a") + '<circle cx="' + (cx + Math.sin(sec * 6 * Math.PI / 180) * r * 0.62).toFixed(2) + '" cy="' + (cy - Math.cos(sec * 6 * Math.PI / 180) * r * 0.62).toFixed(2) + '" r="1" fill="#e8554a"/>';
      g.innerHTML = h + '<rect x="' + (cx - 1) + '" y="' + (cy - 1) + '" width="2" height="2" fill="#3a2414"/>';
    });
  }
  setInterval(tickClocks, 1000);
  function itemSVG(cat, it, cls, attrs) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 ' + it.w + ' ' + it.h + '" ' + (attrs || "") + ' aria-hidden="true">' + it.svg + extras(cat, it) + '</svg>';
  }
  function renderRoom() {
    var wp = item("wall", home.placed.wall), wEl = document.getElementById("wallpaper");
    wEl.style.backgroundImage = tileURL(wp.tile);
    wEl.style.backgroundSize = gx(wp.w / 2) + " auto";
    wEl.classList.toggle("drift", !!wp.drift);
    var fl = item("floor", home.placed.floor), fEl = document.getElementById("floor");
    fEl.style.backgroundImage = tileURL(fl.tile); fEl.style.backgroundSize = gx(fl.w / 2) + " auto";
    var tw = document.getElementById("wp-twinkle"); tw.hidden = !wp.twinkle;
    if (wp.twinkle) { tw.style.backgroundImage = tileURL(wp.twinkle); tw.style.backgroundSize = gx(wp.w / 2) + " auto"; }
    ["chair", "clock", "shelf", "plant"].forEach(function (cat) {
      var el = slotEl(cat), id = home.placed[cat];
      document.getElementById("sh-" + cat) && (document.getElementById("sh-" + cat).hidden = !id);
      if (!id) {
        el.innerHTML = '<div class="empty">+</div>';
        if (cat === "clock") { el.style.left = gx(L.clockCx - 12); el.style.top = gy(L.clockTop); el.style.width = gx(24); }
        if (cat === "shelf") { el.style.left = gx(L.shelf.x); el.style.bottom = gb(L.shelf.bottom); el.style.width = gx(L.shelf.w); }
        if (cat === "chair") { el.style.left = gx(L.chair.x); el.style.bottom = gb(L.chair.bottom); el.style.width = gx(L.chair.w); }
        if (cat === "plant") { el.style.left = gx(L.plant.x - 12); el.style.bottom = gb(L.plant.bottom); el.style.width = gx(24); }
        return;
      }
      var it = item(cat, id);
      if (cat === "clock") { el.style.left = gx(L.clockCx - it.w / 2); el.style.top = gy(L.clockTop); el.style.width = gx(it.w); }
      if (cat === "shelf") { el.style.left = gx(L.shelf.x); el.style.bottom = gb(L.shelf.bottom); el.style.width = gx(it.w); }
      if (cat === "chair") { el.style.left = gx(L.chair.x); el.style.bottom = gb(L.chair.bottom); el.style.width = gx(it.w); }
      if (cat === "plant") { el.style.left = gx(L.plant.x - it.w / 2); el.style.bottom = gb(L.plant.bottom); el.style.width = gx(it.w); }
      el.innerHTML = itemSVG(cat, it);
      if (cat === "chair") {
        var fr = document.getElementById("slot-chair-front"), aw = ARMS[it.id] != null ? ARMS[it.id] : 22;
        fr.style.left = el.style.left; fr.style.bottom = el.style.bottom; fr.style.width = el.style.width;
        fr.innerHTML = aw ? itemSVG(cat, it) : "";
        fr.style.clipPath = "polygon(0 " + ARM_TOP + "%, " + aw + "% " + ARM_TOP + "%, " + aw + "% 100%, " + (100 - aw) + "% 100%, " + (100 - aw) + "% " + ARM_TOP + "%, 100% " + ARM_TOP + "%, 100% 100%, 0 100%)";
      }
    });
    if (!home.placed.chair) document.getElementById("slot-chair-front").innerHTML = "";
    tickClocks(); renderPackage();
    // a sleeping hamster moves along when the chair changes
    if (s.asleep && H.where === "chair") {
      var c = chairItem();
      if (c) { var p = seatPos(c); moveTo(p.x, p.y, 0); }
      else { ham.classList.remove("in-chair"); H.where = "floor"; H.scale = HS; moveTo(SPOT.home.x, SPOT.home.y - 2, 0); front(); }
    }
  }
  function renderCosy() {
    var avg = (s.food + s.energy + s.love + s.fun) / 4, happy = isHappy();
    var txt = home.pending ? "Ein Paket wartet auf " + N() : happy ? N() + " ist glücklich: Das nächste Sudoku bringt ein Paket" : "Ist " + N() + " glücklich, bringt das nächste Sudoku ein Paket";
    document.getElementById("cosy-text").textContent = txt;
    document.getElementById("cosy-count").textContent = ownedCount() + " Möbel";
    document.getElementById("cosy-bar").style.width = Math.min(100, avg / 70 * 100) + "%";
    document.getElementById("cosy-meter").setAttribute("aria-valuenow", Math.round(Math.min(100, avg / 70 * 100)));
  }

  var decor = false, curCat = "chair";
  function setDecor(on) {
    decor = on; scene.classList.toggle("decor", on);
    var b = document.getElementById("decor-btn"); b.setAttribute("aria-pressed", on); b.textContent = on ? "Fertig eingerichtet" : "Zimmer einrichten";
    document.getElementById("catalog").hidden = !on;
    if (on) { document.getElementById("foods").hidden = true; document.getElementById("tracks").hidden = true; renderCatalog(); }
    else document.querySelectorAll(".slot, .wallpaper, .floor").forEach(function (x) { x.classList.remove("sel"); });
  }
  function renderCatalog() {
    document.querySelectorAll(".tab").forEach(function (t) { t.setAttribute("aria-pressed", t.dataset.cat === curCat); });
    document.querySelectorAll(".slot, .wallpaper, .floor").forEach(function (x) { x.classList.toggle("sel", x.dataset.slot === curCat); });
    var own = home.owned[curCat];
    document.getElementById("cat-title").textContent = CATS[curCat] + " auswählen";
    document.getElementById("cat-count").textContent = own.length + " von " + FURN[curCat].length;
    document.getElementById("items").innerHTML = FURN[curCat].map(function (it) {
      var has = own.indexOf(it.id) >= 0, on = home.placed[curCat] === it.id;
      var pic = (curCat === "wall" || curCat === "floor") ? '<div class="sw" style="background-image:' + tileURL(it.tile).replace(/"/g, "'") + ';background-size:' + (it.w * 0.9) + 'px"></div>' : '<div class="ic">' + itemSVG(curCat, it) + '</div>';
      return '<button type="button" class="item' + (has ? "" : " locked") + '" data-id="' + it.id + '" aria-pressed="' + on + '"' + (has ? "" : ' aria-disabled="true"') + '>' + pic + '<span lang="de">' + (has ? it.name : "???") + '</span></button>';
    }).join("");
    document.getElementById("cat-clear").hidden = curCat === "wall" || curCat === "floor" || curCat === "bed" || !home.placed[curCat];
    tickClocks();
  }
  document.getElementById("decor-btn").addEventListener("click", function () { setDecor(!decor); });
  document.querySelectorAll(".tab").forEach(function (t) { t.addEventListener("click", function () { curCat = t.dataset.cat; renderCatalog(); }); });
  document.querySelectorAll(".slot, .wallpaper, .floor").forEach(function (el) {
    el.addEventListener("click", function () { if (!decor) return; curCat = el.dataset.slot; renderCatalog(); });
  });
  document.getElementById("items").addEventListener("click", function (e) {
    var b = e.target.closest(".item"); if (!b) return;
    if (b.classList.contains("locked")) { say("Noch nicht freigeschaltet. Halte " + N() + " glücklich und löse Sudokus."); return; }
    home.placed[curCat] = b.dataset.id; renderRoom(); renderCatalog();
    if (s.asleep && H.where === "chair") { var c = chairItem(); slotEl("chair").classList.toggle("rock", c && c.id === "rocking"); slotEl("chair").classList.toggle("sway", c && c.id === "egg"); }
    say(item(curCat, b.dataset.id).name + (["meadow", "deco", "bed"].indexOf(curCat) >= 0 ? " steht jetzt im Garten." : " steht jetzt im Zimmer."));
  });
  document.getElementById("cat-clear").addEventListener("click", function () { home.placed[curCat] = null; renderRoom(); renderCatalog(); });
  function trackHappy(h) { if (isHappy()) home.happyMin += h * 60; else home.happyMin = 0; renderCosy(); }
  var GIFT_BOX = '<svg class="box" viewBox="0 0 16 16" width="120" height="120" shape-rendering="crispEdges"><path fill="#3a2414" d="M1 5h14v4h-14zM2 9h12v7h-12z"/><path fill="#e8650c" d="M2 6h12v2h-12zM3 9h10v6h-10z"/><path fill="#ffd36b" d="M7 5h2v11h-2zM4 2h3v1h-3zM9 2h3v1h-3zM3 3h1v2h-1zM12 3h1v2h-1zM6 3h1v2h-1zM9 3h1v2h-1z"/></svg>';
  // a solved sudoku picks the item; it waits as a package in the room until the hamster unwraps it
  var PKG = { x: 84, y: 127 };
  function pickGift() {
    if (home.pending) return home.pending;
    var pool = [];
    for (var c in FURN) FURN[c].forEach(function (it) { if (home.owned[c].indexOf(it.id) < 0) pool.push([c, it]); });
    if (!pool.length) return null;
    var pk = pick(pool); home.pending = { cat: pk[0], id: pk[1].id }; home.happyMin = 0;
    renderCosy(); renderPackage(); return home.pending;
  }
  function renderPackage(open) {
    var el = document.getElementById("package");
    el.hidden = !(home.pending && home.pending.delivered);
    if (el.hidden) return;
    el.style.left = gx(PKG.x - 12); el.style.top = gy(PKG.y - 24); el.style.width = gx(24);
    el.innerHTML = svgOf(open ? PROPS.gift_open.svg : PROPS.gift.svg, 24, 24);
  }
  async function unwrapSeq() {
    if (!home.pending) return;
    if (place2 === "garden") await goInsideSeq();
    var pkEl = document.getElementById("package");
    if (H.where === "chair") await hopOutOfChair();
    front({ eyes: "wide", ears: "up", mouth: "open", blush: false }); pulse("hop", 420);
    say("Ein Paket! " + N() + " ist ganz aufgeregt.");
    await wait(600);
    await walkTo(PKG.x + 23, PKG.y - 2, 40);
    front({ eyes: "look_l", mouth: "smile" }); await nibbleNose(6);
    for (var i = 0; i < 3; i++) {
      front({ paws: "side_l", eyes: "happy", mouth: "grin" });
      pkEl.classList.remove("shake"); void pkEl.offsetWidth; pkEl.classList.add("shake");
      await wait(380); front({ paws: "hold" }); await wait(220);
    }
    renderPackage(true);
    for (var k = 0; k < 6; k++) fx("spark", PKG.x + rnd(-14, 14), PKG.y - rnd(22, 34), "sparkle", 1);
    front({ paws: "up", eyes: "happy", mouth: "grin", blush: true }); pulse("bighop", 620);
    await wait(800);
    var pk = home.pending; home.pending = null;
    showGiftModal(pk.cat, item(pk.cat, pk.id));
    renderPackage();
  }
  function showGiftModal(cat, it) {
    home.owned[cat].push(it.id); renderCosy();
    var wrap = document.createElement("div"); wrap.className = "gift-wrap";
    var pic = (cat === "wall" || cat === "floor") ? '<div class="sw-big reveal" style="background-image:' + tileURL(it.tile).replace(/"/g, "'") + ';background-size:' + (it.w * 1.6) + 'px"></div>' : itemSVG(cat, it, "reveal", 'width="' + it.w * 3 + '" height="' + it.h * 3 + '"');
    wrap.innerHTML = '<div class="gift" role="dialog" aria-modal="true" aria-label="Neues Möbelstück"><h2>Neues Möbelstück!</h2><div class="stage">' + pic + '</div><p>' + it.name + '</p><div class="row"><button type="button" class="btn" data-a="later">Später</button><button type="button" class="btn primary" data-a="place">Aufstellen</button></div></div>';
    document.body.appendChild(wrap); tickClocks();
    wrap.addEventListener("click", function (e) {
      var a = e.target.dataset && e.target.dataset.a; if (!a) return;
      if (a === "place") {
        if (cat === "meadow") { var sp = [0, 2].filter(function (i) { return !home.placed["meadow" + i]; })[0]; home.placed["meadow" + (sp === undefined ? 0 : sp)] = it.id; } else home.placed[cat] = it.id;
        renderRoom(); say(it.name + (["meadow", "deco", "bed"].indexOf(cat) >= 0 ? " steht jetzt im Garten." : " steht jetzt im Zimmer. " + N() + " schnuppert neugierig daran."));
        if (!busy && !s.asleep) act("look", async function () { front({ eyes: "wide", ears: "up", mouth: "open" }); pulse("hop", 420); await wait(500); await nibbleNose(6); front({ eyes: "happy", mouth: "smile", blush: true }); await wait(500); });
      } else say(it.name + " wartet im Katalog unter „Zimmer einrichten“.");
      wrap.remove(); if (decor) { curCat = cat; renderCatalog(); }
      window.__giftBusy = Date.now() + (a === "place" ? 2600 : 600);   /* the other popups wait until he has sniffed his new furniture */
    });
  }
  function openPackage() {
    if (!home.pending || s.asleep && false) return;
    if (s.asleep) { s.asleep = false; stopZzz(); syncButtons(); skyTime(); front({ blanket: null }); if (H.where === "chair") {} }
    if (busy && !interruptible()) return;
    if (busy) interrupt();
    act("unwrap", unwrapSeq);
  }
  document.getElementById("package").addEventListener("click", function () { if (!decor) openPackage(); });

  // the solved screen of the sudoku app: the animal stays on the board, the reward sits in the result card
  var BOARD_IMG = "/*BOARDIMG*/";
  function openSolved(gift, allDone) {
    var apple = svgOf(A.apple, SZ.apple[0], SZ.apple[1]);
    var left = Math.max(0, NEED_MIN - home.happyMin);
    var rows = '<div class="reward"><span class="ricon">' + apple + '</span><span>+1 Apfel für ' + N() + '</span></div>';
    if (gift) rows += '<div class="reward gift-row"><span class="ricon wob">' + svgOf(PROPS.gift.svg, 24, 24) + '</span><span><b>Ein Paket für ' + N() + '!</b><br>Es wartet in seinem Zimmer.</span><button type="button" class="btn primary" data-a="ham">Öffnen</button></div>';
    else if (!allDone) rows += '<div class="reward dim"><span class="ricon">' + svgOf(PROPS.gift.svg, 24, 24) + '</span><span>Nächstes Paket: noch ' + Math.floor(left / 60) + ':' + String(Math.round(left % 60)).padStart(2, "0") + ' h glücklich</span></div>';
    var wrap = document.createElement("div"); wrap.className = "solved-wrap";
    wrap.innerHTML = '<div class="solved"><p class="solved-note">So sähe es in der Sudoku-App aus</p><img src="' + BOARD_IMG + '" alt="Gelöstes Sudoku mit Feiertier"><div class="result"><h2>Gelöst!</h2><p class="meta">Mittel · 3:20 · ohne Fehler</p>' + rows + '<div class="rbtns"><button type="button" class="btn primary dark" data-a="close">Nächstes Rätsel</button><button type="button" class="btn" data-a="close">Zum Brett</button></div></div></div>';
    document.body.appendChild(wrap);
    wrap.addEventListener("click", function (e) {
      var a = e.target.closest("[data-a]"); if (!a) return;
      wrap.remove();
      if (a.dataset.a === "ham") { show("scr-hamster"); refresh(); window.scrollTo(0, 0); later(openPackage, 700); }
      else renderStart();
    });
  }
  document.getElementById("d-happy").addEventListener("click", function () {
    STATS.forEach(function (st) { s[st.id] = Math.max(s[st.id], 82); });
    home.happyMin += 60; say(N() + " hatte eine richtig schöne Stunde.");
    if (s.asleep) wake(false); else refresh();
    renderCosy();
  });
  document.getElementById("d-unlock").addEventListener("click", function () {
    for (var c in FURN) home.owned[c] = FURN[c].map(function (x) { return x.id; });
    renderCosy(); if (decor) renderCatalog(); say("Alle Möbel freigeschaltet, auch Küche und Schlafzimmer (nur in der Vorschau).");
  });
