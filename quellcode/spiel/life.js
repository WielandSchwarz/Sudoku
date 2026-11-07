
  // ===================== hamster life: pond, greenhouse, letters, stash, all visitors (the cellar workshop code stays for later, unreachable) =====================
  var LIFEART = /*LIFEART*/, ALLANI = /*ALLANI*/;
  for (var _lk in LIFEART) { A[_lk] = LIFEART[_lk].svg; SZ[_lk] = [LIFEART[_lk].w, LIFEART[_lk].h]; }
  var ANAME = { igel: "Igel", robin: "Rotkehlchen", tit: "Blaumeise", duck: "Ente", chick: "Entenküken", peng: "Pinguin", beaver: "Biber", otter: "Otter", owl: "Eule", frog: "Frosch", ladybug: "Marienkäfer", seal: "Seehund", puffin: "Papageientaucher", turtle: "Schildkröte", crab: "Krabbe", elk: "Elch", lynx: "Luchs", panda: "Panda", koala: "Koala", hare: "Hase", squirrel: "Eichhörnchen", fox: "Fuchs", mouse: "Maus", badger: "Dachs" };
  var WATER = ["duck", "frog", "turtle", "otter", "beaver", "seal", "crab", "puffin", "peng"];
  var MAT = { stick: "Stock", stone: "Stein", feather: "Feder", shell: "Muschel", reed: "Schilf" };
  var MATS = { stick: "Stöcke", stone: "Steine", feather: "Federn", shell: "Muscheln", reed: "Schilf" };
  function life() {
    if (!home.life) home.life = {};
    var L = home.life;
    L.mat = L.mat || { stick: 0, stone: 0, feather: 0, shell: 0, reed: 0 };
    L.crafts = L.crafts || {}; L.stash = L.stash || []; delete L.diary; delete L.letters;
    L.gh = L.gh || [null, null, null]; L.lastLetter = L.lastLetter || 0; L.lastFind = L.lastFind || 0; L.nibbled = 0; if (L.stash.length && !stashBack) { stashBack = true; setTimeout(function () { returnStash(); }, 0); }
    return L;
  }
  life();
  function lEl(tag, cls, parent, html) { var e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; (parent || scene).appendChild(e); return e; }
  function lBtn(cls, parent, html, label) { var b = lEl("button", cls, parent, html); b.type = "button"; if (label) b.setAttribute("aria-label", label); return b; }
  function pos(el, x, y, w) { el.style.left = gx(x); el.style.top = gy(y); if (w) el.style.width = gx(w); }
  function matIcon(k) { return k === "nut" ? svgOf(A.m_nut, 10, 10) : svgOf(A["m_" + k], 10, 10); }
  function addMat(k, n) {
    if (k === "nut") { garden.harvest.nut = (garden.harvest.nut || 0) + n; renderFoods(); } else life().mat[k] = (life().mat[k] || 0) + n;
  }
  function haveMat(k) { return k === "nut" ? (garden.harvest.nut || 0) : (life().mat[k] || 0); }
  function useMat(k, n) { if (k === "nut") { garden.harvest.nut -= n; renderFoods(); } else life().mat[k] -= n; }

  // ---------- generic places: pond, greenhouse, cellar ----------
  function placeEl(id) { var e = lEl("div", "l-place " + id, null); e.id = "l-" + id; e.hidden = true; scene.insertBefore(e, gardenEl.nextSibling); return e; }
  var pondEl = placeEl("pond"), ghEl = placeEl("greenhouse"), cellarEl = placeEl("cellar");
  var NEWP = ["pond", "greenhouse", "cellar"];
  NAMES.pond = "See"; NAMES.greenhouse = "Gewächshaus"; NAMES.cellar = "Keller";
  var _l_showPlace = showPlace;
  showPlace = function (p) {
    _l_showPlace(p); closeLPop();
    pondEl.hidden = p !== "pond"; ghEl.hidden = p !== "greenhouse"; cellarEl.hidden = p !== "cellar";
    if (NEWP.indexOf(p) >= 0) { H.scale = HS; document.getElementById("decor-btn").hidden = true; }
    if (p === "pond") renderPond(); else stopPondVisitor();
    pondFg.hidden = p !== "pond";
    if (p === "greenhouse") renderGH();
    if (p === "cellar") renderCellar();
    if (p === "garden") layoutLifeGarden();
    renderStash();
  };
  // outdoors: sky, the garden's tree line and the weather, like the house map
  // rings in the water around a swimming animal: the front of the ring and little wavelets drifting outwards
  var LRIPPLE = '<b></b>', LRIP = /*RIPPLE*/;
  (function () { var st = document.createElement('style'); st.textContent = '.va-rip b { background-image: url(' + LRIP.png + '); }'; document.head.appendChild(st); })();
  function outdoor(mid) {
    var se = season(), wt = weather.type, bliz = wt === "storm" && se === "winter";
    var skyCls = (document.getElementById("sky").className.match(/sky-(eve|night)/) || [""])[0];
    var o = '<div class="map-sky ' + skyCls + ' mw-' + wt + '"></div>';
    o += '<img class="map-l map-wide" src="' + SBG["far_" + se] + '" alt="" style="left:-16.667%;width:133.333%;top:-14%;height:100%">';
    o += mid;
    var w = "", i;
    if (wt === "rain" || (wt === "storm" && !bliz)) for (i = 0; i < 70; i++) w += '<rect class="' + (i % 3 ? "rf" : "rn") + '" x="' + Math.round(rnd(-20, 220)) + '" y="' + Math.round(rnd(-135, 135)) + '" width="1" height="5" fill="#c8d6ea" opacity=".75"/>';
    else if (wt === "snow" || bliz) for (i = 0; i < 80; i++) w += '<rect class="msn" x="' + Math.round(rnd(-40, 180)) + '" y="' + Math.round(rnd(-20, 135)) + '" width="1" height="1" fill="#fff" style="animation-delay:-' + rnd(0, 4).toFixed(2) + 's"/>';
    o += '<svg class="map-l map-wx" viewBox="0 0 180 135" preserveAspectRatio="none" aria-hidden="true">' + w + '</svg><div class="map-tint mt-' + wt + '"></div>';
    if (skyCls) o += '<div class="l-dark ' + skyCls + '"></div>';
    return o;
  }

  // ---------- the lake: bank and jetty on the left, open water to the horizon ----------
  var POND = /*PONDART*/;
  var PHOR = 66;
  function pShore(y) { var t = (y - PHOR) / (135 - PHOR); return 58 + t * 30 + 7 * Math.sin(y / 6 + 1) + 3 * Math.sin(y / 2.6) + (y > 92 && y < 104 ? 6 : 0); }
  var PSPOT = { enter: { x: -14, y: 126 }, home: { x: 34, y: 127 }, jettyFoot: { x: 56, y: 106 }, jettyEnd: { x: 132, y: 104 }, jettyMid: { x: 100, y: 104 }, iceIn: { x: 70, y: 126 }, reed: { x: 66, y: 122 }, stones: { x: 26, y: 130 } };
  var pondBg = lEl("div", "l-bg", pondEl), pondUi = lEl("div", "l-ui", pondEl), pondFx = lEl("div", "l-fx", pondEl);
  var pondFg = lEl("div", "l-pondfg", scene); pondFg.hidden = true;
  pondUi.innerHTML = '<button type="button" class="l-hot" data-a="water" style="left:52%;top:76%;width:48%;height:24%" aria-label="Wasser"></button>' +
    '<button type="button" class="l-hot" data-a="water" style="left:82%;top:50%;width:18%;height:26%" aria-label="Wasser"></button>' +
    '<button type="button" class="l-hot" data-a="jetty" style="left:34%;top:70%;width:48%;height:8%" aria-label="Steg"></button>' +
    '<button type="button" class="g-exit l-exit" data-a="exit" aria-label="Zurück in den Garten"><span>‹</span></button>';
  function lighthouse(night, cx, cy, vw) {
    // the lamp glows softly like the lamps in the house and pulses brighter and dimmer
    var r = "", rings = [[2, .9], [3, .55], [4, .3], [6, .14]];
    cx = cx == null ? 142 : cx; cy = cy == null ? 53 : cy; vw = vw || 180;
    if (vw !== 180) rings = rings.slice(0, 2);
    rings.forEach(function (q) { var R = q[0];
      for (var y = -R; y <= R; y++) for (var x = -R; x <= R; x++) { var d = Math.sqrt(x * x + y * y); if (d <= R && d > R - 1.2) r += '<rect x="' + (cx + x) + '" y="' + (cy + y) + '" width="1" height="1" fill="#ffe9a0" opacity="' + q[1] + '"/>'; } });
    r += '<rect x="' + (cx - 1) + '" y="' + (cy - 1) + '" width="' + (vw === 180 ? 3 : 2) + '" height="' + (vw === 180 ? 2 : 1) + '" fill="#fff6c8"/>';
    return '<svg class="map-l l-lh' + (night ? " lh-dark" : "") + '" viewBox="0 0 ' + vw + ' 135" aria-hidden="true">' + r + '</svg>';
  }
  function renderPond() {
    var se = season(), skyCls = (document.getElementById("sky").className.match(/sky-(eve|night)/) || [""])[0];
    var mid = '<img class="map-l" src="' + POND["bg_" + se] + '" alt="">' +
      (skyCls === "sky-eve" && se !== "winter" ? '<div class="l-glitter"></div>' : "") + '<img class="map-l" src="' + POND["jt_" + se] + '" alt="">';
    pondBg.innerHTML = outdoorLake(mid, skyCls) + lighthouse(!!skyCls);
    pondFg.innerHTML = '<img src="' + POND["fg_" + se] + '" alt="">'; pondFg.className = "l-pondfg " + skyCls;
  }
  function outdoorLake(mid, skyCls) {
    var se = season(), wt = weather.type, bliz = wt === "storm" && se === "winter";
    var o = '<div class="map-sky ' + skyCls + ' mw-' + wt + '"></div>' + mid, w = "", i;
    if (wt === "rain" || (wt === "storm" && !bliz)) for (i = 0; i < 70; i++) w += '<rect class="' + (i % 3 ? "rf" : "rn") + '" x="' + Math.round(rnd(-20, 220)) + '" y="' + Math.round(rnd(-135, 135)) + '" width="1" height="5" fill="#c8d6ea" opacity=".75"/>';
    else if (wt === "snow" || bliz) for (i = 0; i < 80; i++) w += '<rect class="msn" x="' + Math.round(rnd(-40, 180)) + '" y="' + Math.round(rnd(-20, 135)) + '" width="1" height="1" fill="#fff" style="animation-delay:-' + rnd(0, 4).toFixed(2) + 's"/>';
    o += '<svg class="map-l map-wx" viewBox="0 0 180 135" preserveAspectRatio="none" aria-hidden="true">' + w + '</svg><div class="map-tint mt-' + wt + '"></div>';
    if (skyCls) o += '<div class="l-dark ' + skyCls + '"></div>';
    return o;
  }
  var _p_walkTo = walkTo;
  walkTo = async function (x, y, speed) {
    if (place2 === "pond" && H.where !== "jetty" && H.where !== "ice" && H.where !== "swim" && x > -10 && x < 190) {
      y = Math.max(108, Math.min(134, y)); x = Math.min(x, pShore(y) - 14);
    }
    return _p_walkTo(x, y, speed);
  };
  var gToPond = lBtn("g-exit g-exit-r", gardenEl, "<span>›</span>", "Zum Teich");
  async function goPondSeq() {
    if (place2 !== "garden") { await toRoom(); await goGardenSeq(); }
    await walkTo(196, 122); fadeX(false); await wait(250);
    showPlace("pond"); moveTo(PSPOT.enter.x, PSPOT.enter.y, 0); fadeX(true);
    say(N() + " ist am See."); await walkTo(PSPOT.home.x, PSPOT.home.y);
    front({ eyes: "happy", mouth: "smile" }); await nibbleNose(4);
 
    setTimeout(function () { if (place2 === "pond" && !pondV && Date.now() - lastPondVisit > 60000) spawnPondVisitor(); }, 800);
  }
  async function toBank() {
    if (H.where === "jetty") { await walkTo(PSPOT.jettyFoot.x + 8, PSPOT.jettyMid.y); await walkTo(PSPOT.jettyFoot.x, PSPOT.jettyFoot.y); H.where = null; }
    if (H.where === "jetty") H.where = null;
    if (H.where === "ice") { await walkTo(PSPOT.iceIn.x, PSPOT.iceIn.y); H.where = null; }
  }
  async function toJetty(x) {
    if (H.where !== "jetty") { await walkTo(PSPOT.jettyFoot.x, PSPOT.jettyFoot.y); H.where = "jetty"; await walkTo(PSPOT.jettyFoot.x + 10, PSPOT.jettyMid.y); }
    await walkTo(x, PSPOT.jettyMid.y);
  }
  async function gardenFromPond() {
    await toBank();
    await walkTo(-14, 126); fadeX(false); await wait(250);
    showPlace("garden"); moveTo(196, 122, 0); fadeX(true); await walkTo(150, 122);
  }
  gToPond.addEventListener("click", function () { if (decor || s.asleep) return; if (busy && !interruptible()) return; if (busy) interrupt(); act("pondgo", goPondSeq); });
  function ripple(x, y, big) { var r = lEl("div", "l-ripple" + (big ? " big" : ""), pondFx); r.style.left = gx(x); r.style.top = gy(y); setTimeout(function () { r.remove(); }, 900); }
  function splash(x, y) { for (var i = 0; i < 6; i++) { var d = lEl("div", "l-drop", pondFx); d.style.left = gx(x + rnd(-3, 3)); d.style.top = gy(y - 2); d.style.setProperty("--dx", rnd(-8, 8) + "px"); d.style.setProperty("--dy", -rnd(6, 14) + "px"); setTimeout(function (e) { return function () { e.remove(); }; }(d), 700); } ripple(x, y, true); }

  // ---- stone skipping: time your tap to the moment the stone touches the water ----
  var skipEl = lEl("div", "l-skip", scene); skipEl.hidden = true;
  function skipGame() {
    return new Promise(function (resolve) {
      var hops = 0, n = 0, x = 138, y = 96, sc = 1, stoneT0, dur = 760, start = { x: x, y: y }, target, raf, tapped = false, done = false, perfect = 0;
      skipEl.innerHTML = '<svg viewBox="0 0 180 135" aria-hidden="true"><g id="l-sk-ring"><ellipse id="l-sk-r" fill="none" stroke="#fff" stroke-width="1.2"/><ellipse id="l-sk-t" fill="none" stroke="#ffd36b" stroke-width=".9" stroke-dasharray="1.5 1.5"/></g><g id="l-sk-stone"><rect x="-1.5" y="-1" width="3" height="2" fill="#6a6a74"/><rect x="-1.5" y="-1" width="2" height="1" fill="#b4b4bc"/></g></svg><p class="l-sk-hint">Tippe, wenn der Stein das Wasser berührt!</p><p class="l-sk-count" id="l-sk-c">0</p>';
      skipEl.hidden = false;
      var ring = skipEl.querySelector("#l-sk-r"), tr = skipEl.querySelector("#l-sk-t"), stone = skipEl.querySelector("#l-sk-stone"), cEl = skipEl.querySelector("#l-sk-c");
      function nextTarget() {
        // landing points run out to the right and towards the horizon, closer together each time (perspective)
        var k = n + 1, px = 138 + 40 * (1 - Math.pow(0.8, k)) + k * 0.6, py = 112 - 44 * (1 - Math.pow(0.82, k));
        return { x: px, y: py, s: Math.max(0.35, 1 - k * 0.07) };
      }
      function launch() { start = { x: x, y: y }; target = nextTarget(); stoneT0 = performance.now(); tapped = false; dur = Math.max(300, 760 * Math.pow(0.88, n)); }
      function end(ok, why) {
        if (done) return; done = true; cancelAnimationFrame(raf);
        if (!ok) splash(target.x, target.y);
        setTimeout(function () { skipEl.hidden = true; skipEl.innerHTML = ""; resolve({ hops: hops, perfect: perfect, why: why }); }, ok ? 300 : 700);
      }
      function frame(now) {
        var t = (now - stoneT0) / dur;
        if (t > 1.18 && !tapped) return end(false, "late");
        var tt = Math.min(1, t), arc = Math.sin(tt * Math.PI) * (16 * target.s + 4);
        x = start.x + (target.x - start.x) * tt; y = start.y + (target.y - start.y) * tt - arc;
        stone.setAttribute("transform", "translate(" + x.toFixed(2) + " " + y.toFixed(2) + ") scale(" + (target.s * 1.2).toFixed(2) + ")");
        skipEl.dataset.t = t.toFixed(3);
        var rr = Math.max(0.6, (1 - tt) * 12 * target.s + 1.2 * target.s);
        ring.setAttribute("cx", target.x); ring.setAttribute("cy", target.y); ring.setAttribute("rx", rr * 2); ring.setAttribute("ry", rr * 0.7);
        tr.setAttribute("cx", target.x); tr.setAttribute("cy", target.y); tr.setAttribute("rx", 1.4 * target.s * 2); tr.setAttribute("ry", 1.4 * target.s * 0.7);
        raf = requestAnimationFrame(frame);
      }
      skipEl.onclick = skipEl.onpointerdown = null;
      skipEl.addEventListener("pointerdown", function (e) {
        e.preventDefault(); e.stopPropagation(); if (done || tapped) return;
        var t = (performance.now() - stoneT0) / dur, win = Math.max(0.09, 0.16 - n * 0.008);
        if (Math.abs(t - 1) <= win) {
          tapped = true; hops++; n++; cEl.textContent = hops; if (Math.abs(t - 1) <= win / 3) { perfect++; cEl.classList.add("perf"); setTimeout(function () { cEl.classList.remove("perf"); }, 300); }
          x = target.x; y = target.y; ripple(x, y); beep([[600 + hops * 70, .05]]);
          if (target.s <= 0.36) return end(true, "far");
          launch();
        } else { tapped = true; end(false, t < 1 ? "early" : "late"); }
      });
      launch(); raf = requestAnimationFrame(frame);
    });
  }
  async function skipStone() {
    await toJetty(PSPOT.jettyEnd.x); H.dir = 1;
    front({ paws: "hold", eyes: "open", mouth: "teeth" }); say(N() + " sucht einen flachen Stein …"); await wait(600);
    front({ paws: "up", eyes: "wide", mouth: "open" }); pulse("squat", 250); await wait(250);
    var r = await skipGame(), L = life();
    var best = L.skipBest || 0, rec = r.hops > best; if (rec) L.skipBest = r.hops;
    front({ eyes: r.hops >= 3 ? "happy" : "sad", mouth: r.hops >= 3 ? "grin" : "flat", paws: r.hops >= 3 ? "up" : "down", blush: r.hops >= 5 });
    if (r.hops >= 3) pulse("hop", 420);
    var txt = r.hops === 0 ? "Plumps. Der Stein ist gleich untergegangen." : "Der Stein ist " + r.hops + "-mal gehüpft!";
    if (r.why === "far") txt = "Der Stein ist bis zum Horizont gehüpft! " + r.hops + " Sprünge!";
    if (rec && r.hops >= 2) txt += " Neuer Rekord!";
    if (false) { addMat("shell", 1); txt += " Am Steg glänzt eine Muschel."; }
    say(txt);
    s.fun = clamp(s.fun + 2 + Math.min(10, r.hops * 2)); renderNeeds();
 
    await wait(700); front({ paws: "down" });
  }
  // ---- winter: elegant figure skating on the frozen lake ----
  var trailEl = lEl("div", "l-trail", pondFx);
  async function skate() {
    if (season() !== "winter") return;
    await toBank(); await walkTo(PSPOT.iceIn.x, PSPOT.iceIn.y); H.where = "ice";
    front({ paws: "hold", eyes: "happy", mouth: "smile" }); say(N() + " schnürt seine Schlittschuhe …"); await wait(700);
    ham.classList.add("l-skates"); front({ paws: "side_r", eyes: "happy", mouth: "grin" });
    var pts = [], cx = 124, cy = 124, rx = 34, ry = 7;
    for (var k = 0; k <= 64; k++) { var a = k / 64 * Math.PI * 2; pts.push([cx + Math.sin(a) * rx, cy + Math.sin(2 * a) * ry]); }   // a figure eight
    var path = "M" + PSPOT.iceIn.x + " " + PSPOT.iceIn.y;
    trailEl.innerHTML = '<svg viewBox="0 0 180 135" preserveAspectRatio="none" aria-hidden="true"><path id="l-trailp" fill="none" stroke="#ffffff" stroke-width=".6" opacity=".9"/></svg>';
    var tp = trailEl.querySelector("#l-trailp");
    ham.classList.add("l-glide");
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], prev = i ? pts[i - 1] : [H.x, H.y];
      H.dir = p[0] < prev[0] ? -1 : 1; sideFrame(0);
      ham.style.setProperty("--tilt", (H.dir * (p[1] < prev[1] ? -6 : 6)) + "deg");
      moveTo(p[0], p[1], 70); path += " L" + p[0].toFixed(1) + " " + p[1].toFixed(1); tp.setAttribute("d", path);
      await wait(70);
    }
    // pirouette
    say("Eine Pirouette!"); ham.style.setProperty("--tilt", "0deg");
    for (var j = 0; j < 10; j++) { H.dir = -H.dir; if (j % 2) front({ paws: "up", eyes: "happy", mouth: "grin" }); else sideFrame(1); await wait(Math.max(50, 150 - j * 10)); if (j % 3 === 0) fx("spark", H.x + rnd(-10, 10), H.y - rnd(20, 40), "sparkle"); }
    ham.classList.remove("l-glide");
    front({ paws: "side_r", eyes: "happy", mouth: "smile", blush: true }); pulse("squat", 500); say(N() + " verbeugt sich. Was für eine Kür!"); await wait(900);
    s.fun = clamp(s.fun + 12); s.energy = clamp(s.energy - 4); renderNeeds();
 
    await walkTo(PSPOT.iceIn.x, PSPOT.iceIn.y); ham.classList.remove("l-skates"); H.where = null; await walkTo(PSPOT.iceIn.x - 12, PSPOT.iceIn.y); front({ paws: "down" });
    setTimeout(function () { trailEl.innerHTML = ""; }, 6000);
  }
  var cool = {};
  function ready(k, ms) { var n = Date.now(); if (cool[k] && n - cool[k] < ms) return false; cool[k] = n; return true; }
  async function collectAt(spot, k, txt) {
    await toBank(); await walkTo(spot.x, spot.y); front({ paws: "hold", eyes: "happy", mouth: "teeth" }); body("squat"); await wait(500); body("");
    addMat(k, 1); fx("spark", spot.x, spot.y - 30, "sparkle");
    front({ paws: "up", eyes: "happy", mouth: "grin" }); say(txt); await wait(500); front({ paws: "down" });
  }
  function swimOk() { var se = season(), w = weather.type; if (se === "winter") return "Im Winter ist das Wasser viel zu kalt zum Baden."; if (w === "rain" || w === "storm") return "Bei dem Wetter bleibt " + N() + " lieber an Land."; return ""; }
  function waterChoice() {
    var no = swimOk();
    var pp = openLPop(pondEl, '<p class="ph">Was möchte ' + N() + ' am Wasser machen?</p><div class="l-wchoice"><button type="button" class="pbtn" data-w="skip">Steine flitschen</button><button type="button" class="pbtn" data-w="swim"' + (no ? " disabled" : "") + '>Baden</button><button type="button" class="pbtn" data-w="boat">Bootstour</button></div>' + (no ? '<p class="pn">' + no + '</p>' : ""), 90, 30, "l-wpop");
    pp.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-w]"); if (!b || b.disabled) return; closeLPop(); if (busy) interrupt();
      if (b.dataset.w === "skip") act("skip", skipStone); else if (b.dataset.w === "boat") act("boat", async function () { await toJetty(PSPOT.jettyEnd.x); H.dir = 1; if (window.__lkOpen) window.__lkOpen(); }); else act("swim", swimSeq);
    });
  }
  // a swim in summer: cannonball off the jetty, paddle about, climb out on the bank and dry in the sun
  async function swimSeq() {
    if (swimOk()) { say(swimOk()); return; }
    await toJetty(112); H.dir = 1;
    front({ eyes: "happy", mouth: "grin", paws: "down", blush: true }); say(N() + " nimmt Anlauf …"); pulse("squat", 400); await wait(450);
    front({ eyes: "happy", mouth: "grin", paws: "up" }); H.where = "swim";
    await arc([[118, 88], [124, 96]], 120);
    front({ eyes: "sleep", mouth: "grin", paws: "up", ears: "flat" }); body("squat");
    await arc([[127, 110], [128, 122]], 120);
    say("Arschbombe!"); splashFx(128, 116); splash(128, 124); ham.classList.add("l-swim");
    var cool = season() !== "summer";                                      // spring and autumn: fresh water, a little shiver
    front({ eyes: "wide", mouth: "open", ears: "flat", paws: "down" }); body(""); await wait(600);
    if (cool) { say("Huh, ist das frisch!"); pulse("shake", 400); await wait(900); }
    front({ eyes: "happy", mouth: "grin", ears: "up", blush: true }); say(N() + " planscht im See.");
    var route = [[146, 128], [134, 132], [112, 130], [96, 128]];
    for (var i = 0; i < route.length; i++) { H.dir = route[i][0] < H.x ? -1 : 1; moveTo(route[i][0], route[i][1], 1100); for (var k = 0; k < 3; k++) { ripple(H.x, H.y - 2); await wait(360); } }
    // out onto the bank
    var bx = pShore(126) - 14; H.dir = -1; moveTo(bx + 8, 127, 700); await wait(720);
    ham.classList.remove("l-swim"); pulse("hop", 300); moveTo(bx, 126, 300); await wait(320); H.where = null;
    setWet(true); front({ eyes: "happy", mouth: "smile", paws: "down", ears: "flat" }); say(N() + " ist klatschnass und lässt sich " + (/sky-(eve|night)/.test(document.getElementById("sky").className) ? "an der Luft" : "in der Sonne") + " trocknen.");
    await wait(1600); pulse("shake", 500); for (var j = 0; j < 8; j++) fx("drop", H.x + rnd(-14, 14), H.y - rnd(10, 30), "fall", 1, { "--dx": rnd(-14, 14) + "px" }); await wait(2200);
    setWet(false); front({ eyes: "happy", mouth: "grin", ears: "up", blush: true }); say(cool ? "Brrr! Aber herrlich erfrischend. Wieder trocken und fluffig!" : "Wieder trocken und ganz fluffig!");
    s.fun = clamp(s.fun + 14); s.love = clamp(s.love + 4); renderNeeds(); 
    await wait(600); front({ paws: "down" });
  }
  pondUi.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b || decor || s.asleep) return;
    if (busy && !interruptible()) return; if (busy) interrupt();
    var a = b.dataset.a, winter = season() === "winter";
    if (a === "exit") return act("garden", gardenFromPond);
    if (a === "water") { if (winter) return typeof winterChoice === "function" ? winterChoice() : act("skate", skate); return waterChoice(); }
    if (a === "reed") {
      if (winter || !ready("reed", 45000)) return act("look", async function () { await toBank(); await walkTo(PSPOT.reed.x - 6, PSPOT.reed.y); H.dir = 1; front({ eyes: "open" }); say(winter ? "Das Schilf ist braun und gefroren." : "Hier ist gerade kein gutes Schilf mehr."); });
      return act("collect", function () { return collectAt(PSPOT.reed, "reed", N() + " pflückt einen Halm Schilf."); });
    }
    if (a === "stones") {
      if (!ready("stones", 30000)) return act("look", async function () { await toBank(); await walkTo(PSPOT.stones.x, PSPOT.stones.y); say("Nur Sand. Später nochmal schauen."); });
      var k = Math.random() < 0.55 ? "shell" : "stone";
      return act("collect", function () { return collectAt(PSPOT.stones, k, k === "shell" ? "Eine Muschel! Ganz glatt und rosa." : "Ein schöner flacher Stein."); });
    }
    if (a === "jetty") return act("jetty", async function () {
      await toJetty(PSPOT.jettyMid.x + rnd(-6, 20)); H.dir = 1;
      front({ eyes: "half", mouth: "smile", paws: "down", blush: true }); say(N() + " sitzt auf dem Steg und schaut aufs Wasser.");
      for (var i = 0; i < 3; i++) { if (!winter) ripple(H.x + rnd(4, 20), 118); await wait(900); }
      s.love = clamp(s.love + 4); s.energy = clamp(s.energy + 2); renderNeeds();
    });
  });
  // pond visitors: like in the garden. One comes when you arrive, then at most one every 5 minutes (20 % a minute);
  // they stay until you say goodbye, you can give them a dish, and each visit brings a heart
  var pondV = null, lastPondVisit = 0;
  WATER.forEach(function (id) { if (ALLANI[id] && !ANIMALS[id]) ANIMALS[id] = { name: ANAME[id], vb: ALLANI[id].vb, svg: ALLANI[id].svg }; });
  var PLINES = {
    duck: ["Quak! Schönes Wetter für einen See.", "Quak, quak, ich schwimm mal eine Runde."], frog: ["Quaaak! Willkommen an meinem See.", "Ich sitz hier gern auf den Seerosen."],
    turtle: ["Gaaanz langsam … hallo.", "Ich hab Zeit. Viel Zeit."], otter: ["Platsch! Komm, wir spielen.", "Ich hab eine Muschel für dich!"],
    beaver: ["Ich bau hier bald einen Damm.", "Brauchst du Stöcke? Ich hab genug."], seal: ["Ö-ö-ö! Hallo, kleiner Freund.", "Ich hab mich verschwommen. Hübsch hier!"],
    crab: ["Klick-klack, ich geh seitwärts.", "Pass auf deine Zehen auf. Spaß!"], puffin: ["Ich fliege eigentlich übers Meer, aber hier ist es nett.", "Hast du Fisch? Nein? Auch gut."], peng: ["Watschel, watschel. Ist das Eis schon da?", "Brrr, mir ist das hier fast zu warm."]
  };
  var pCard = lEl("div", "f-card l-pcard", scene); pCard.hidden = true;
  function renderPondCard() {
    if (!pondV || place2 !== "pond") { pCard.hidden = true; return; }
    var id = pondV.id, an = ALLANI[id], h = garden.friends[id] || 0, hearts = heartIcons(h);
    var dishes = simpleGifts();
    pCard.innerHTML = '<span class="fc-pic"><svg viewBox="' + an.vb + '" aria-hidden="true">' + an.svg + '</svg></span><span class="fc-name">' + ANAME[id] + '<span class="fc-h">' + hearts + '</span></span>' +
      (dishes.length && !pondV.fed ? '<button type="button" class="fc-btn" data-a="give">Schenken</button>' : "") + '<button type="button" class="fc-btn bye" data-a="bye">Tschüss</button>';
    pCard.innerHTML += '<button type="button" class="fc-x" data-a="x" aria-label="Schließen">×</button>';
    pCard.hidden = !pondV.cardOpen;
  }
  function nap(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function pvPlace(v, x, y, ms) { v.x = x; v.y = y; v.el.style.transition = ms ? "left " + ms + "ms linear, bottom " + ms + "ms linear" : "none"; v.el.style.left = gx(x - v.w / 2); v.el.style.bottom = gb(y); }
  // whoever stands further forward is drawn in front
  setInterval(function () { if (pondV && place2 === "pond") pondV.el.style.zIndex = pondV.y > H.y + 0.5 ? 6 : 3; }, 80);
  function stopPondVisitor() { if (pondV) { pondV.el.remove(); pondV = null; } pCard.hidden = true; }
  function leavePondVisitor() {
    var v = pondV; if (!v) return; pondV = null; lastPondVisit = Date.now(); garden.lastVisit = Date.now(); pCard.hidden = true;
    v.el.classList.add("moving");
    if (v.swim) { pvPlace(v, 138, 104, 800); setTimeout(function () { v.el.classList.add("swim"); pvPlace(v, 150, 122, 350); setTimeout(function () { pvPlace(v, 200, 124, 1800); }, 380); }, 820); setTimeout(function () { v.el.remove(); }, 3200); }
    else { pvPlace(v, PSPOT.jettyFoot.x, PSPOT.jettyFoot.y + 2, 1100); setTimeout(function () { pvPlace(v, -40, 130, 1800); }, 1120); setTimeout(function () { v.el.remove(); }, 3100); }
  }
  function spawnPondVisitor(force) {
    if (place2 !== "pond" || pondV || s.asleep) return;
    if (!force && Date.now() - (garden.lastVisit || 0) < 300000) return;
    garden.lastVisit = Date.now();
    var winter = season() === "winter";
    var pool = WATER.filter(function (id) { return ALLANI[id] && (!winter || ["peng", "seal", "duck"].indexOf(id) >= 0) && (!window.HamsterSeen || window.HamsterSeen()[id]); });
    if (!pool.length) return;
    var id = pick(pool), an = ALLANI[id], vb = an.vb.split(" ").map(Number), h = 34, w = vb[2] * h / vb[3];
    var swim = ["duck", "otter", "beaver", "seal", "turtle"].indexOf(id) >= 0 && !winter;
    var el = lBtn("l-visitor va v-" + id + (swim ? " swim" : ""), scene, vaSvg(an, id) + (swim ? '<i class="va-rip">' + LRIPPLE + '</i>' : ""), ANAME[id]);
    el.style.width = gx(w);
    if (swim) {                                                            // the rings sit at the waterline, one sprite pixel to one game pixel
      var ins = { duck: .12, seal: .26, turtle: .2 }[id] || .22, rp = el.querySelector(".va-rip"); el.style.setProperty("--ins", ins);
      rp.style.width = (LRIP.w / w * 100) + "%"; rp.style.left = (-(LRIP.w - w) / 2 / w * 100) + "%"; rp.style.height = (LRIP.h / h * 100) + "%"; rp.style.top = (((1 - ins) * h - LRIP.cy) / h * 100) + "%";
    }
    var v = pondV = { el: el, id: id, w: w, swim: swim, x: 0, y: 0, fed: false, done: false };
    pvPlace(v, swim ? 200 : -40, swim ? 130 : 132, 0);
    lastPondVisit = Date.now();
    addHeart(id);
    say("Besuch am See: " + ANAME[id] + " schaut vorbei!");
 
    renderPondCard();
    // everybody ends up on the jetty, out of the way: walkers along the bank, swimmers hop up from the water
    var tx = rnd(78, 86), ty = PSPOT.jettyMid.y;
    (async function () {
      await nap(50); if (pondV !== v) return; el.classList.add("moving");
      if (swim) { pvPlace(v, 150, 122, 1600); await nap(1650); if (pondV !== v) return; el.classList.remove("swim"); pvPlace(v, 138, ty, 350); await nap(400); }
      else { pvPlace(v, PSPOT.jettyFoot.x, PSPOT.jettyFoot.y + 2, 1800); await nap(1850); if (pondV !== v) return; }
      pvPlace(v, tx, ty, 1300); await nap(1350); if (pondV !== v) return;
      el.classList.remove("moving"); fx("spark", tx, 80, "sparkle"); pondMeet(v);
    })();
    el.addEventListener("click", function () { if (pondV !== v) return; v.cardOpen = true; renderPondCard(); if (!v.busy) pondMeet(v); });
  }
  function pondMeet(v) {
    if (v.busy || s.asleep) return; if (busy && !interruptible()) return; if (busy) interrupt();
    v.busy = true;
    act("visit", async function () {
      try {
        if (H.where === "ice") await toBank();
        await toJetty(Math.min(134, v.x + 46)); H.dir = -1;
        front({ eyes: "happy", mouth: "grin", paws: "side_r", blush: true }); fx("heart", (H.x + v.x) / 2, 92, "up");
        say(ANAME[v.id] + ": „" + pick(PLINES[v.id] || ["Hallo!"]) + "“"); await wait(1200);
        if (false) {
          var k = v.id === "otter" || v.id === "crab" ? "shell" : v.id === "beaver" ? "stick" : v.id === "duck" || v.id === "puffin" ? "feather" : "stone";
          addMat(k, 1); fx("spark", v.x, 104, "sparkle");
          say(ANAME[v.id] + " schenkt " + N() + " " + (k === "shell" ? "eine Muschel" : k === "stick" ? "einen Stock" : k === "feather" ? "eine Feder" : "einen Stein") + ".");
          await wait(900);
        }
        front({ paws: "down" }); v.done = true;
      } finally { v.busy = false; renderPondCard(); }
    });
  }
  pCard.addEventListener("click", function (e) {
    var a = e.target.closest("[data-a]"); if (!a || !pondV) return;
    if (a.dataset.a === "x") { pondV.cardOpen = false; pCard.hidden = true; return; }
    if (a.dataset.a === "bye") { var nm = ANAME[pondV.id]; leavePondVisitor(); say(N() + " winkt " + nm + " zum Abschied."); if (!busy && !s.asleep) act("look", async function () { front({ paws: "up", eyes: "happy", mouth: "smile" }); await wait(500); front({ paws: "side_r" }); await wait(400); front({ paws: "down" }); }); }
    else if (a.dataset.a === "give") {
      var p0 = pondV;
      askGift(ANAME[p0.id], function (k, nm) {
        if (pondV !== p0) return; p0.fed = true; addHeart(p0.id, true);
        fx("heart", p0.x, 98, "up"); fx("heart", p0.x + 6, 100, "up");
        say(ANAME[p0.id] + " freut sich über " + (k === "nut" ? "die Haselnuss" : nm) + "."); renderPondCard();
      });
    }
  });
  setInterval(function () {
    if (place2 !== "pond" || pondV || s.asleep) return;
    if (Date.now() - lastPondVisit < 5 * 60000) return;
    if (Math.random() < 0.2) spawnPondVisitor();
  }, 60000);

  // ---------- garden additions: greenhouse, mailbox, findings, all visitors ----------
  var ghBtn = lBtn("l-gobj l-ghouse", gardenEl, svgOf(A.greenhouse, SZ.greenhouse[0], SZ.greenhouse[1]), "Gewächshaus");
  var findBtn = lBtn("l-gobj l-find", gardenEl, "", "Etwas glitzert"); findBtn.hidden = true;
  var FINDSPOTS = [[30, 122], [100, 124], [160, 120], [118, 100], [60, 98], [150, 104]];
  var findAt = null;
  function layoutLifeGarden() {
    pos(ghBtn, 126, 93 - SZ.greenhouse[1], SZ.greenhouse[0]); ghBtn.style.zIndex = 93;
    var L = life();
    if (false) {
      var sp = pick(FINDSPOTS), k = pick(["stick", "stick", "stone", "feather"]);
      findAt = { x: sp[0], y: sp[1], k: k };
    }
    findBtn.hidden = !findAt;
    if (findAt) { pos(findBtn, findAt.x - 5, findAt.y - 10, 10); findBtn.style.zIndex = findAt.y; findBtn.innerHTML = matIcon(findAt.k); }
  }
  var _l_layoutGarden = layoutGarden; layoutGarden = function () { _l_layoutGarden(); layoutLifeGarden(); };
  findBtn.addEventListener("click", function () {
    if (!findAt || decor || s.asleep) return; if (busy && !interruptible()) return; if (busy) interrupt();
    var f = findAt;
    act("find", async function () {
      await walkTo(f.x, f.y + 2); front({ paws: "hold", eyes: "happy", mouth: "teeth" }); body("squat"); await wait(450); body("");
      findAt = null; findBtn.hidden = true; life().lastFind = Date.now(); addMat(f.k, 1);
      front({ paws: "up", eyes: "happy", mouth: "grin" }); say(N() + " hat " + (f.k === "stick" ? "einen Stock" : f.k === "stone" ? "einen Stein" : "eine Feder") + " gefunden. Das kommt in die Werkstatt.");
 
      await wait(600); front({ paws: "down" });
    });
  });
  // winter: the bed outside is frozen, the greenhouse keeps growing
  var _l_plotTap = plotTap;
  plotTap = function (i) { if (season() === "winter" && !garden.plots[i] && !decor) { say("Das Beet ist gefroren. Im Gewächshaus wächst auch im Winter etwas."); return; } _l_plotTap(i); };

  // all album animals visit: land animals in the garden (the water ones go to the pond)
  ["owl", "ladybug", "elk", "lynx", "panda", "koala", "chick"].forEach(function (id) { if (ALLANI[id]) { ANIMALS[id] = { name: ANAME[id], vb: ALLANI[id].vb, svg: ALLANI[id].svg }; if (VISIT.indexOf(id) < 0) VISIT.push(id); if (!VMOVES[id]) VMOVES[id] = id === "owl" || id === "chick" ? ["flutter", "look", "hopv"] : ["look", "sniff", "hopv"]; } });
  var GLINES = {
    owl: ["Huhu! Ich bin eigentlich nachts wach.", "Schuhu, was für ein schöner Garten."], ladybug: ["Ich hab sieben Punkte. Zähl nach!", "Krabbel, krabbel, hallo!"],
    elk: ["Ich hab mich ein bisschen verlaufen.", "Hübsche Möhren hast du da."], lynx: ["Psst. Ich schleiche nur vorbei.", "Meine Ohrpinsel sind frisch gekämmt."],
    panda: ["Hast du Bambus? Nein? Möhren gehen auch.", "Ich mach hier kurz Pause."], koala: ["Ich bin müüüde. Darf ich kurz bleiben?", "Eukalyptus wär schön, aber egal."], chick: ["Piep! Wo ist der Teich?", "Piep piep, hallo!"]
  };
  var _l_startScene = startScene;
  SCENES.__generic = async function (v) {
    var id = v.id;
    say(ANAME[id] + ": „" + pick(GLINES[id] || ["Hallo!", "Schön hier bei dir."]) + "“");
    front({ eyes: "happy", mouth: "grin", paws: "up", blush: true }); pulse("hop", 420); await wait(900);
    if (false) {
      var k = ["owl", "chick"].indexOf(id) >= 0 ? "feather" : id === "ladybug" ? "stone" : "stick";
      addMat(k, 1); fx("spark", GSPOT.meet.x + 19, GSPOT.meet.y - 30, "sparkle");
      say(ANAME[id] + " bringt " + N() + " " + (k === "feather" ? "eine Feder" : k === "stone" ? "einen Stein" : "einen Stock") + " mit.");
    }
    await wait(700); front({ paws: "down" });
  };
  Object.keys(GLINES).forEach(function (id) { if (!SCENES[id]) SCENES[id] = SCENES.__generic; });
  var _l_spawnVisitor = spawnVisitor;
  spawnVisitor = function (force, want) {
    var had = visitor; _l_spawnVisitor(force, want);
 
  };

  // ---------- greenhouse ----------
  var ghBg = lEl("div", "l-bg", ghEl, svgOf(A.gh_in, 180, 135)), ghUi = lEl("div", "l-ui", ghEl);
  var GHX = [34, 90, 146];
  function ghPlantSvg(p) { var st = stage(p), k = "crop_" + p.crop + st; return A[k] ? svgOf(A[k], SZ[k][0], SZ[k][1]) : ""; }
  function renderGH() {
    var L = life();
    ghUi.innerHTML = GHX.map(function (x, i) {
      var p = L.gh[i];
      return '<button type="button" class="l-ghbox" data-i="' + i + '" style="left:' + gx(x - 20) + ';top:' + gy(74) + ';width:' + gx(40) + ';height:' + gy(24) + '" aria-label="Pflanzkasten ' + (i + 1) + '">' +
        (p ? '<span class="l-ghp">' + ghPlantSvg(p) + ghPlantSvg(p) + '</span>' : '<span class="l-ghe">+</span>') + '</button>';
    }).join("") + '<button type="button" class="g-exit l-exit" data-a="exit" aria-label="Zurück in den Garten"><span>‹</span></button>';
  }
  var _l_growGarden = growGarden;
  growGarden = function (h) {
    _l_growGarden(h);
    life().gh.forEach(function (p) { if (p) p.prog = Math.min(1, p.prog + h / (CROPS[p.crop] ? CROPS[p.crop].hours : 6)); });
    if (place2 === "greenhouse") renderGH();
  };
  CROPS.chili = CROPS.chili || { name: "Chili", hours: 5 }; if (garden.seeds.chili == null) garden.seeds.chili = 0; if (garden.harvest.chili == null) garden.harvest.chili = 0;
  async function goGHSeq() {
    if (place2 !== "garden") { await toRoom(); await goGardenSeq(); }
    await walkTo(148, 96); fadeX(false); await wait(250);
    showPlace("greenhouse"); moveTo(90, 132, 0); fadeX(true); await walkTo(90, 124);
    front({ eyes: "happy", mouth: "smile", blush: true }); say("Im Gewächshaus ist es schön warm."); await nibbleNose(4);
  }
  async function gardenFromGH() {
    await walkTo(90, 134); fadeX(false); await wait(250);
    showPlace("garden"); moveTo(148, 98, 0); fadeX(true); await walkTo(140, 112);
  }
  ghBtn.addEventListener("click", function () { if (decor || s.asleep) return; if (busy && !interruptible()) return; if (busy) interrupt(); act("ghgo", goGHSeq); });
  var lPop = null;
  function closeLPop() { if (lPop) { lPop.remove(); lPop = null; } }
  function openLPop(host, html, x, y, cls) {
    closeLPop(); lPop = lEl("div", "gpop l-pop " + (cls || ""), scene, html);
    lPop.style.left = gx(Math.max(4, Math.min(180 - 96, x - 48))); lPop.style.top = gy(y);
    return lPop;
  }
  ghUi.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b || decor) return;
    if (b.dataset.a === "exit") { closeLPop(); if (busy) interrupt(); return act("garden", gardenFromGH); }
    var i = +b.dataset.i, L = life(), p = L.gh[i];
    if (!p) {
      var rows = Object.keys(CROPS).map(function (c) { var sk = "seed_" + c, has = garden.seeds[c] || 0; return '<button type="button" class="seedrow" data-seed="' + c + '"' + (has ? "" : " disabled") + '>' + (A[sk] ? svgOf(A[sk], 8, 10) : svgOf(A.crop_chili3, 12, 20)) + '<span>' + CROPS[c].name + '</span><b>' + has + '</b></button>'; }).join("");
      var pp = openLPop(ghEl, '<p class="ph">Was soll im Kasten wachsen?</p><div class="seedgrid">' + rows + '</div><p class="pn">Hier wächst alles, auch im Winter.</p>', 90, 10, "seeds");
      pp.addEventListener("click", function (ev) {
        var r = ev.target.closest(".seedrow"); if (!r || r.disabled) return; closeLPop();
        var c = r.dataset.seed; if (busy) interrupt();
        act("plant", async function () { await walkTo(GHX[i], 122); front({ paws: "hold", eyes: "happy" }); body("squat"); await wait(500); body(""); garden.seeds[c]--; L.gh[i] = { crop: c, prog: 0, wetUntil: 0 }; renderGH(); say(CROPS[c].name + " wächst jetzt im Gewächshaus."); front({ paws: "down" }); });
      });
      return;
    }
    if (stage(p) === 3) {
      if (busy) interrupt();
      return act("harvest", async function () {
        await walkTo(GHX[i], 122); front({ paws: "up", eyes: "happy", mouth: "grin" }); pulse("hop", 400);
        L.gh[i] = null; garden.harvest[p.crop] = (garden.harvest[p.crop] || 0) + 2; renderGH(); renderFoods();
        say(N() + " erntet 2 × " + CROPS[p.crop].name + " im Gewächshaus.");  await wait(600); front({ paws: "down" });
      });
    }
    openLPop(ghEl, '<p class="ph">' + CROPS[p.crop].name + '</p><p class="pl">Stufe ' + Math.max(1, stage(p)) + ' von 3 · noch ' + fmtH((1 - p.prog) * CROPS[p.crop].hours) + '</p>', GHX[i], 40);
  });

  // ---------- letters: now and then a friend's letter flies right into the screen, opens and unfolds ----------
  var LBODY = [
    "neulich bei dir war es richtig schön. Ich musste den ganzen Heimweg lächeln.",
    "hier ist gerade viel los, aber ich denke oft an unseren Nachmittag zusammen.",
    "heute Morgen lag Tau auf allen Blättern und alles hat geglitzert. Da musste ich an dich denken.",
    "ich habe einen neuen Lieblingsplatz gefunden. Den zeige ich dir beim nächsten Besuch.",
    "bei uns hat es die ganze Nacht geregnet. Jetzt riecht alles nach frischer Erde.",
    "ich wollte dir einfach mal Hallo sagen. Pass gut auf dich auf!",
    "gestern habe ich die Sterne gezählt und bin bei hundertzwölf eingeschlafen."
  ];
  var LGIFT = [
    { t: "seed", k: "chili", n: 1, txt: "Ich lege dir einen Chili-Samen bei. Der mag es warm, am besten im Gewächshaus." },
    { t: "apples", n: 1, txt: "Im Umschlag steckt ein Apfel. Lass ihn dir schmecken!" },
    { t: "seeds", n: 1, txt: "" }, { t: "seeds", n: 1, txt: "" },
    { t: "none", txt: "" }, { t: "none", txt: "" },
    { t: "gift", txt: "Und weil du so ein guter Freund bist, kommt bald ein kleines Paket!" }
  ];
  // pixel envelope, 30 x 20, drawn from rows: K outline, p paper, s shade, f flap edge, r seal, h seal highlight
  var ENV_C = { K: "#3a2414", p: "#fff6e4", s: "#ead8b8", f: "#d8c4a0", r: "#e2483a", h: "#ff8a78", i: "#f4e2c4" };
  function pixRows(rows) {
    var o = "";
    rows.forEach(function (r, y) { var x = 0; while (x < r.length) { var c = r[x]; if (c === ".") { x++; continue; } var n = 1; while (r[x + n] === c) n++; o += '<path fill="' + ENV_C[c] + '" d="M' + x + " " + y + "h" + n + "v1h-" + n + 'z"/>'; x += n; } });
    return o;
  }
  function envRows(open) {
    var W = 30, H = 20, g = [], x, y;
    for (y = 0; y < H; y++) { g.push([]); for (x = 0; x < W; x++) g[y].push(x === 0 || x === W - 1 || y === 0 || y === H - 1 ? "K" : y > 15 ? "s" : "p"); }
    // side folds meeting in the lower middle
    for (x = 1; x < W - 1; x++) { var dy = Math.round(Math.abs(x - 14.5) * 0.55); y = H - 2 - (7 - Math.min(7, dy)); if (y > 0 && y < H - 1) g[y][x] = "f"; }
    if (!open) {
      for (x = 1; x < W - 1; x++) { y = 1 + Math.round((14.5 - Math.abs(x - 14.5)) * 0.62); for (var yy = 1; yy < y; yy++) g[yy][x] = "i"; if (y < H - 1) g[y][x] = "K"; }
      [[13, 9], [14, 9], [15, 9], [16, 9], [13, 10], [14, 10], [15, 10], [16, 10], [14, 11], [15, 11]].forEach(function (p) { g[p[1]][p[0]] = "r"; }); g[9][14] = "h";
    } else {
      for (x = 1; x < W - 1; x++) { y = 1 + Math.round((14.5 - Math.abs(x - 14.5)) * 0.3); g[y][x] = "f"; }
    }
    return g.map(function (r) { return r.join(""); });
  }
  function flapRows() {   // the opened flap standing up above the envelope
    var W = 30, H = 10, g = [];
    for (var y = 0; y < H; y++) { var r = ""; for (var x = 0; x < W; x++) { var top = H - 1 - Math.round((14.5 - Math.abs(x - 14.5)) * 0.62); r += y < top ? "." : y === top ? "K" : x === 0 || x === W - 1 ? "K" : "i"; } g.push(r); }
    return g;
  }
  var ENV0 = pixRows(envRows(false)), ENV1 = pixRows(envRows(true)), FLAP = pixRows(flapRows());
  var letterEl = lEl("div", "l-fly", scene); letterEl.hidden = true;
  var letterOn = false;
  function letterOk() {
    return !letterOn && !s.asleep && !decor && !(window.__pz && window.__pz()) && (!window.Nav || window.Nav.current === "hamster") &&
      document.visibilityState === "visible" && !uiBusy() && !(mapEl && !mapEl.hidden) &&
      !!(document.getElementById("scr-hamster") && document.getElementById("scr-hamster").offsetParent);
  }
  // letters only come from friends: animals with at least three hearts
  function friendIds() { return Object.keys(garden.friends || {}).filter(function (k) { return ALLANI[k] && garden.friends[k] >= 3; }); }
  // ---- letter writing: friends write personal letters with good presents, new animals introduce themselves ----
  var LOPEN = [
    ["ich musste heute an dich denken.", "seit meinem letzten Besuch frage ich mich, was in deinem Garten alles wächst.", "ich hoffe, dir geht es gut."],
    ["es ist schön, dass wir uns so gut verstehen.", "bei dir fühle ich mich jedes Mal wie zu Hause.", "ich erzähle allen hier von unseren Nachmittagen."],
    ["du bist mir richtig ans Herz gewachsen.", "so gute Freunde wie uns gibt es nicht oft.", "ohne unsere Besuche wäre mein Jahr nur halb so schön."]
  ];
  var LSEASON = {
    spring: "Bei mir blüht gerade alles, und morgens singen die Vögel um die Wette.",
    summer: "Es ist so warm, dass ich mittags nur noch im Schatten liege.",
    autumn: "Die Blätter werden bunt, und ich sammle schon fleißig für den Winter.",
    winter: "Draußen liegt Schnee, und ich kuschle mich abends warm ein."
  };
  var LSIGN = ["Bis bald", "Alles Liebe", "Ganz herzliche Grüße", "Ich freu mich auf dich"];
  function cropNow() { var p = (garden.plots || []).filter(function (x) { return x && CROPS[x.crop]; })[0]; return p ? CROPS[p.crop].name : null; }
  function friendGift() {
    var r = Math.random(), crops = Object.keys(CROPS).filter(function (c) { return c !== "chili"; });
    if (r < 0.3) return { t: "gift", txt: "Und weil du mir so viel bedeutest, kommt bald ein Paket mit etwas Schönem für dein Zuhause!" };
    if (r < 0.55) return { t: "apples", n: 1, txt: "Im Umschlag steckt ein besonders saftiger Apfel, extra für dich ausgesucht." };
    if (r < 0.75 && (garden.seeds.chili || 0) < 15) return { t: "seed", k: "chili", n: 1, txt: "Ich lege dir einen Chili-Samen bei. Der ist selten, am besten wächst er im Gewächshaus." };
    var k = typeof seedPick === "function" ? seedPick() : null;
    if (!k) return { t: "gift", txt: "Und weil du mir so viel bedeutest, kommt bald ein Paket mit etwas Schönem für dein Zuhause!" };
    return { t: "seed", k: k, n: 1, txt: "Ich habe dir ein Tütchen " + CROPS[k].name + "-Samen eingepackt, meine liebste Sorte." };
  }
  function makeLetter(from, kind) {
    var lines = (GLINES[from] || PLINES[from] || []);
    if (kind === "hello") {
      return { from: from, hello: "Hallo " + N() + ",", sign: "Viele Grüße",
        body: "ich wohne noch nicht lange hier in der Gegend und habe schon viel von dir gehört. Vielleicht komme ich bald mal im Garten oder am See vorbei. Ich würde mich freuen, dich kennenzulernen!" + (lines.length ? " Übrigens: " + lines[0] : ""),
        gift: { t: "seeds", k: pick(Object.keys(CROPS).filter(function (c) { return c !== "chili"; })), n: 1 } };
    }
    if (!from) { var friends = friendIds(); if (!friends.length) return null; from = pick(friends); lines = (GLINES[from] || PLINES[from] || []); }
    var h = garden.friends[from] || 0, tier = h >= 9 ? 2 : h >= 6 ? 1 : 0, crop = cropNow();
    var parts = [pick(LOPEN[tier])];
    parts.push(pick([LSEASON[season()], crop ? "Wächst " + crop + " in deinem Beet schon gut? Ich bin gespannt auf die Ernte." : "Hast du schon etwas Neues in deinem Beet gepflanzt?", "Ich war jetzt schon " + h + "-mal bei dir zu Besuch, und jedes Mal war es schön."]));
    if (tier >= 1) parts.push(pick(["Pass gut auf dich auf, ja?", "Schreib mir mal, wie es " + N() + " so geht. Ach so, das bist ja du!", "Ich komme bald wieder vorbei, versprochen."]));
    var ps = lines.length ? pick(lines) : "";
    return { from: from, hello: pick(["Hallo ", "Hey ", "Huhu "]) + N() + ",", sign: pick(LSIGN), body: parts.join(" "), ps: ps, gift: friendGift() };
  }
  function grantLetter(l) {
    var r = l.gift || { t: "none" }, got = "", icon = "";
    if (r.t === "apples") { r.n = 1; s.treats += r.n; got = "ein Apfel"; icon = svgOf(A.apple, SZ.apple[0], SZ.apple[1]); }
    else if ((r.t === "seed" || r.t === "seeds") && (garden.seeds[r.k] || 0) >= 15) { var fz_ = furnNow(); got = fz_ ? fz_.name : "viele liebe Grüße"; icon = fz_ ? furnIcon(fz_) : ""; }
    else if (r.t === "seed" || r.t === "seeds") { r.n = 1; garden.seeds[r.k] = (garden.seeds[r.k] || 0) + r.n; got = "ein Tütchen " + CROPS[r.k].name + "-Samen"; icon = A["seed_" + r.k] ? svgOf(A["seed_" + r.k], 8, 10) : ""; }
    else if (r.t === "gift") { pickGift(); got = "ein Paket"; icon = PROPS && PROPS.gift ? svgOf(PROPS.gift.svg, 24, 24) : ""; }
    addHeart(l.from, true); renderNeeds(); renderCosy();
    if (window.SudokuSave) window.SudokuSave();
    return { got: got, icon: icon };
  }
  async function letterArrives(force, from, kind) {
    if (!force && !letterOk()) return false;
    var l = makeLetter(from, kind); if (!l) { if (force) say("Noch keine Freunde, die schreiben könnten. Ab drei Herzen schreibt ein Tier Briefe."); return false; }
    var L = life(); L.lastLetter = Date.now();
    var an = ALLANI[l.from], fromLeft = Math.random() < 0.5;
    if (l.gift && l.gift.t === "seeds" && !l.gift.txt) l.gift.txt = "Als kleine Begrüßung lege ich dir zwei Tütchen " + CROPS[l.gift.k].name + "-Samen bei.";
    letterOn = true; letterEl.hidden = false; letterEl.className = "l-fly " + (fromLeft ? "from-l" : "from-r");
    letterEl.innerHTML = '<div class="lf-dim"></div><div class="lf-env"><div class="lf-flap"><svg viewBox="0 0 30 10" aria-hidden="true" shape-rendering="crispEdges">' + FLAP + '</svg></div>' +
      '<svg class="lf-body" viewBox="0 0 30 20" aria-hidden="true" shape-rendering="crispEdges">' + ENV0 + '</svg></div>' +
      '<div class="lf-paper pixtext"><div class="lf-fold"></div><div class="l-lhead"><span class="l-lpic"><svg viewBox="' + an.vb + '" aria-hidden="true">' + an.svg + '</svg></span><b>Post von ' + ANAME[l.from] + '</b></div>' +
      '<p>' + (l.hello || "Hallo " + N() + ",") + '</p><p>' + l.body + '</p>' + (l.ps ? '<p class="lf-ps">P.S. ' + l.ps + '</p>' : "") + '<div class="lf-gift"></div><p class="l-lsign">' + (l.sign || "Viele Grüße") + '<br>' + ANAME[l.from] + '</p>' +
      '<div class="l-lbtns"><button type="button" class="pbtn" data-a="ok">' + (l.gift.t !== "none" ? "Danke!" : "Schön!") + '</button></div></div>';
    beep([[880, .05], [660, .05]]);
    front({ eyes: "wide", mouth: "open", paws: "up" });
    say("Da kommt ein Brief geflogen!");
    await nap(1500); if (!letterOn) return;
    letterEl.classList.add("landed"); beep([[300, .05]]);
    await nap(450); if (!letterOn) return;
    letterEl.querySelector(".lf-body").innerHTML = ENV1; letterEl.classList.add("open"); beep([[520, .05], [700, .06]]);
    await nap(520); if (!letterOn) return;
    letterEl.classList.add("out");
    await nap(560); if (!letterOn) return;
    letterEl.classList.add("unfold");
    var res = grantLetter(l);
    var gl = letterEl.querySelector(".lf-gift");
    if (l.gift.t !== "none") gl.innerHTML = '<p class="l-lrew">' + l.gift.txt + '</p>' + (res.got ? '<p class="lf-got">' + (res.icon ? '<span>' + res.icon + '</span>' : "") + '+ ' + res.got + '</p>' : "");
    front({ eyes: "happy", mouth: "grin", paws: "up", blush: true }); pulse("hop", 420);
    say(N() + " freut sich über den Brief von " + ANAME[l.from] + (res.got ? " und bekommt " + res.got + "." : "."));
  }
  function closeLetter() {
    if (!letterOn) return; letterOn = false;
    letterEl.classList.add("bye"); setTimeout(function () { letterEl.hidden = true; letterEl.innerHTML = ""; letterEl.className = "l-fly"; }, 380);
    front({ paws: "down" });
  }
  /* safety net: if anything goes wrong while the letter flies in, it still opens fully and can be closed */
  var _lArrive = letterArrives;
  letterArrives = function () { var pr = _lArrive.apply(this, arguments); pr.catch(function () { if (letterOn) { letterEl.classList.add("landed", "open", "out", "unfold"); } }); return pr; };
  letterEl.addEventListener("click", function (e) { if (e.target.closest("[data-a=ok]") || (letterEl.classList.contains("unfold") && e.target.classList.contains("lf-dim"))) closeLetter(); });
  // a letter every few hours of play, only when you are looking at the hamster
  // a new friend writes right away, but only once the hamster screen is open and nothing else is in the way
  function queueHello(id) { var L = life(); L.letterQ = L.letterQ || []; if (L.letterQ.indexOf(id) < 0 && ALLANI[id]) L.letterQ.push(id); if (window.SudokuSave) window.SudokuSave(); }
  // watch the album: every animal that is newly unlocked writes a short hello
  setInterval(function () {
    if (!window.HamsterSeen || !s.name) return;
    var seen = window.HamsterSeen() || {}, L = life();
    if (L.knownSeen && L.knownSeen.some(function (id) { return !ALLANI[id]; })) L.knownSeen = L.knownSeen.filter(function (id) { return !!ALLANI[id]; });   // clean out junk from an old bug
    if (!L.knownSeen) { L.knownSeen = Object.keys(seen).filter(function (id) { return !!ALLANI[id]; }); return; }   // first run: no flood of letters for animals you already had
    Object.keys(seen).forEach(function (id) { if (ALLANI[id] && L.knownSeen.indexOf(id) < 0) { L.knownSeen.push(id); queueHello(id); } });
  }, 1500);
  var okSince = 0;
  setInterval(function () {
    var L = life(); if (!s.name || !L.letterQ || !L.letterQ.length) { okSince = 0; return; }
    if (!letterOk() || busy && cur === "visit") { okSince = 0; return; }
    if (!okSince) { okSince = Date.now(); return; }
    if (Date.now() - okSince < 4000) return;   // the screen has been open for a moment: now it can arrive
    var id = L.letterQ.shift(); okSince = 0; letterArrives(false, id, "hello");
  }, 700);
  setInterval(function () {
    var L = life(); if (!s.name || Date.now() - (L.lastLetter || 0) < 6 * 3600000) return;
    if (L.letterQ && L.letterQ.length) return;
    if (Math.random() < 0.25) letterArrives();
  }, 30000);

  // ---------- cellar workshop ----------
  var cellarBg = lEl("div", "l-bg", cellarEl, svgOf(A.cellar, 180, 135)), cellarUi = lEl("div", "l-ui", cellarEl);
  var CF = /*CRAFTFURN*/;
  // detailed crops (18 x 26, same pixel size as everything else), replacing the small 12 x 20 ones everywhere
  (function () { var C2 = /*CROPS2*/; Object.keys(C2).forEach(function (k) { A[k] = C2[k]; SZ[k] = k === "f_chili" ? [6, 8] : [18, 26]; }); FOOD.chili = FOOD.chili || "f_chili"; ["0", "1", "2", "3"].forEach(function (i) { A["crop_gcarrot" + i] = A["crop_carrot" + i]; SZ["crop_gcarrot" + i] = [18, 26]; }); })();
  var RECIPES = [
    { id: "reed", cat: "chair", name: "Schilf-Sessel", need: { reed: 4, stick: 2, feather: 2 } },
    { id: "nutshell", cat: "lamp", name: "Nussschalen-Lampe", need: { nut: 3, stick: 2 } },
    { id: "driftbed", cat: "bed", name: "Treibholz-Bett", need: { stick: 4, reed: 3, shell: 2, feather: 2 } }
  ];
  // the workshop furniture is always in the catalog (locked until built) and never comes in a parcel
  (function () {
    var ch = JSON.parse(JSON.stringify(CF.chair)); ch.crafted = true; FURN.chair.push(ch);
    var lp = JSON.parse(JSON.stringify(CF.lamp)); lp.crafted = true; FURN.lamp.push(lp);
    ARMS.reed = 18;
    A.bedb_7 = CF.bed.bsvg; A.bedf_7 = CF.bed.fsvg; SZ.bedb_7 = [CF.bed.bw, CF.bed.bh]; SZ.bedf_7 = [CF.bed.fw, CF.bed.fh];
    HD.beds[7] = { name: CF.bed.name, back: CF.bed.back, front: CF.bed.front, ham: CF.bed.ham };
  })();
  function syncBedNames() { var bc = BCATS[0]; if (life().crafts.driftbed && bc.names.length < 8) bc.names.push("Treibholz-Bett"); }
  syncBedNames();
  var _l_pickGift = pickGift;
  pickGift = function () {
    var keep = {}; for (var c in FURN) { keep[c] = FURN[c]; FURN[c] = FURN[c].filter(function (it) { return !it.crafted; }); }
    try { return _l_pickGift(); } finally { for (var c2 in keep) FURN[c2] = keep[c2]; }
  };
  function recipeIcon(r) {
    if (r.cat === "chair") return svgOf(CF.chair.svg, 48, 42);
    if (r.cat === "lamp") return svgOf(CF.lamp.on, 16, 46);
    return '<svg viewBox="0 40 100 64" aria-hidden="true"><g transform="translate(2 40)">' + CF.bed.bsvg + '</g><g transform="translate(2 66)">' + CF.bed.fsvg + '</g></svg>';
  }
  function built(r) { return r.cat === "bed" ? !!life().crafts.driftbed : home.owned[r.cat].indexOf(r.id) >= 0; }
  function renderCellar() {
    cellarUi.innerHTML = '<button type="button" class="l-hot" data-a="bench" style="left:28%;top:52%;width:44%;height:16%" aria-label="Werkbank"></button>' +
      '<button type="button" class="g-exit l-exit" data-a="exit" aria-label="Die Treppe hoch"><span>‹</span></button>';
  }
  async function goCellarSeq() {
    if (place2 !== "room") await toRoom();
    if (H.where === "chair") await hopOutOfChair();
    await walkTo(-14, 120); fadeX(false); await wait(250);
    say(N() + " klettert in den Keller …"); await stairClimb(false);
    showPlace("cellar"); moveTo(20, 124, 0); fadeX(true); await walkTo(60, 124);
    say(N() + " ist in der Werkstatt."); front({ eyes: "happy", mouth: "smile" }); await nibbleNose(4);
  }
  async function roomFromCellar() {
    await walkTo(10, 124); fadeX(false); await wait(250); say(N() + " klettert die Treppe hoch …"); await stairClimb(true);
    showPlace("room"); moveTo(-14, 120, 0); fadeX(true); await walkTo(SPOT.home.x, SPOT.home.y);
  }
  async function craftSeq(r) {
    await walkTo(100, 118); H.dir = 1;
    for (var k in r.need) useMat(k, r.need[k]);
    say(N() + " sägt, bindet und hämmert …");
    for (var i = 0; i < 10; i++) { front({ paws: i % 2 ? "up" : "hold", eyes: "happy", mouth: i % 2 ? "teeth" : "smile" }); fx("spark", 100 + rnd(-12, 12), 80 + rnd(-4, 4), "sparkle"); beep([[300 + (i % 3) * 120, .04]]); await wait(240); }
    if (r.cat === "bed") { life().crafts.driftbed = 1; syncBedNames(); home.bedroom.bed = 7; renderBedroomArt(); }
    else { if (home.owned[r.cat].indexOf(r.id) < 0) home.owned[r.cat].push(r.id); home.placed[r.cat] = r.id; renderRoom(); renderCosy(); }
    front({ paws: "up", eyes: "happy", mouth: "grin", blush: true }); pulse("hop", 420);
    say({ chair: "Der Schilf-Sessel ist fertig und steht schon im Wohnzimmer!", lamp: "Die Nussschalen-Lampe ist fertig und leuchtet jetzt im Wohnzimmer!", bed: "Das Treibholz-Bett ist fertig und steht oben im Schlafzimmer!" }[r.cat]);
    s.fun = clamp(s.fun + 12); renderNeeds(); 
    await wait(700); front({ paws: "down" }); await walkTo(62, 124); H.dir = 1;
  }
  cellarUi.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b || decor) return;
    if (b.dataset.a === "exit") { closeLPop(); if (busy) interrupt(); return act("inside", roomFromCellar); }
    if (b.dataset.a === "bench") {
      var rows = RECIPES.map(function (r) {
        var ok = true, done = built(r), need = Object.keys(r.need).map(function (k) { var hv = haveMat(k), h = hv >= r.need[k]; if (!h) ok = false; return '<span class="need' + (h ? "" : " miss") + '">' + matIcon(k) + hv + '/' + r.need[k] + '</span>'; }).join("");
        return '<div class="l-rec' + (done ? " done" : "") + '"><span class="l-rpic">' + recipeIcon(r) + '</span><span class="l-rn">' + r.name + '<small>' + (done ? "Schon gebaut" : need) + '</small></span>' +
          (done ? '<span class="l-done">✓</span>' : '<button type="button" class="pbtn" data-r="' + r.id + '"' + (ok ? "" : " disabled") + '>Bauen</button>') + '</div>';
      }).join("");
      var pp = openLPop(cellarEl, '<p class="ph">Werkbank: Möbel bauen</p>' + rows + '<p class="pn">Material findest du im Garten, am See und bei Besuchern. Alles steht im Inventar.</p>', 90, 6, "l-recipes pixtext");
      pp.addEventListener("click", function (ev) {
        var rb = ev.target.closest("[data-r]"); if (!rb || rb.disabled) return; closeLPop();
        var r = RECIPES.filter(function (x) { return x.id === rb.dataset.r; })[0]; if (busy) interrupt(); act("craft", function () { return craftSeq(r); });
      });
    }
  });

  // ---------- travel: the new places join the map and the way home ----------
  var _l_toRoom = toRoom;
  toRoom = async function () {
    if (place2 === "pond") await gardenFromPond();
    if (place2 === "greenhouse") await gardenFromGH();
    if (place2 === "cellar") return roomFromCellar();
    return _l_toRoom();
  };
  var _l_travelTo = travelTo;
  travelTo = async function (t) {
    if (t === "cellar") { if (place2 === "cellar") { say(N() + " ist schon hier."); return; } await toRoom(); return goCellarSeq(); }
    if (t === "pond") { if (place2 === "pond") return; return goPondSeq(); }
    return _l_travelTo(t);
  };
  // the house map grows a lake on the right
  var _l_renderMap = renderMap;
  renderMap = function () {
    _l_renderMap();
    var pic = mapEl.querySelector(".map-pic"); if (!pic || pic.querySelector(".map-track")) return;
    // the lake joins the map on the right: drag the map sideways to get there
    var track = document.createElement("div"); track.className = "map-track";
    var house = document.createElement("div"); house.className = "map-house";
    while (pic.firstChild) house.appendChild(pic.firstChild);
    var lake = document.createElement("div"); lake.className = "map-house map-lake";
    var skyCls = (document.getElementById("sky").className.match(/sky-(eve|night)/) || [""])[0], se = season();
    var pt = pixText("See", place2 === "pond" ? { bg: "#e8650c", sh: "#b04a08", hi: "#ff9a4a" } : null);
    lake.innerHTML = '<div class="map-scene map-lakescene">' + outdoorLake('<img class="map-l" src="' + POND["map_" + se] + '" alt="">', skyCls) + lighthouse(!!skyCls, 70, 72, 90) + '</div>' +
      '<button type="button" class="map-room map-lakebtn" data-p="pond" aria-label="See" style="left:20%;top:55%;width:80%;height:45%"></button>' +
      '<div class="map-label" style="left:' + (100 * (52 - pt.w * 0.35) / 90) + '%;top:' + gy(88) + ';width:' + (100 * pt.w * 0.7 / 90) + '%">' + pt.svg + '</div>';
    // the garden on the map: greenhouse and bed in miniature next to the house
    var gmini = document.createElement("div"); gmini.className = "map-gmini";
    gmini.innerHTML = '<svg viewBox="0 0 180 135" aria-hidden="true"><g transform="translate(160 74)">' + A.map_gh + '</g><g transform="translate(158 112)">' + A.map_bed + '</g></svg>';
    var msc = house.querySelector(".map-scene"), fgl;
    // the wide garden layers become backgrounds of plain boxes, so no browser can shrink or clip them inside the scrolling map
    msc.querySelectorAll("img.map-wide").forEach(function (im) {
      var d = document.createElement("div"); d.className = im.className.replace("map-wide", "map-wbg");
      var to = (im.style.transformOrigin || "").split(" ");
      d.style.cssText = "background-image:url(" + im.getAttribute("src") + ")";
      if (to[0] && /%$/.test(to[0])) d.style.transformOrigin = (parseFloat(to[0]) * 4 / 3 - 16.667).toFixed(3) + "% " + (to[1] || "100%");
      if (im.style.animationDelay) d.style.animationDelay = im.style.animationDelay;
      var amp = im.style.getPropertyValue("--amp"); if (amp) d.style.setProperty("--amp", amp);
      if (im.style.animationDuration) d.style.animationDuration = im.style.animationDuration;
      im.parentNode.replaceChild(d, im);
    });
    fgl = msc.querySelector(".map-fg");
    if (fgl) msc.insertBefore(gmini, fgl); else msc.appendChild(gmini);   // under the weather tint and the night
    track.appendChild(house); track.appendChild(lake); pic.appendChild(track);
    pic.classList.add("map-scroll");
    var hint = document.createElement("p"); hint.className = "map-sub map-drag"; hint.textContent = "Zieh die Karte zur Seite, dann siehst du den See.";
    pic.parentNode.insertBefore(hint, pic.nextSibling);
    requestAnimationFrame(function () { pic.scrollLeft = place2 === "pond" ? pic.scrollWidth : 0; });
    // mouse dragging (touch scrolls natively)
    var dx = null, sl = 0, moved = 0;
    pic.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; dx = e.clientX; sl = pic.scrollLeft; moved = 0; delete pic.dataset.dragged; });
    pic.addEventListener("pointermove", function (e) { if (dx == null) return; moved = Math.max(moved, Math.abs(e.clientX - dx)); pic.scrollLeft = sl - (e.clientX - dx); if (moved > 6) pic.dataset.dragged = "1"; });
    window.addEventListener("pointerup", function () { dx = null; setTimeout(function () { delete pic.dataset.dragged; }, 50); }, { once: false });
    pic.addEventListener("click", function (e) { if (pic.dataset.dragged) { e.stopPropagation(); e.preventDefault(); } }, true);
    renderMapMarker();
  };
  var _l_renderMapMarker = renderMapMarker;
  renderMapMarker = function () {
    _l_renderMapMarker();
    var m = document.getElementById("map-ham"); if (!m) return;
    var lake = mapEl.querySelector(".map-lake"), house = mapEl.querySelector(".map-house");
    if (place2 === "pond" && lake) { lake.appendChild(m); m.style.left = (100 * 4 / 90) + "%"; m.style.top = gy(96); m.style.width = (100 * 18 / 90) + "%"; }
    else if (house && m.parentNode !== house) house.appendChild(m);
    if (place2 === "cellar") { m.style.left = gx(48); m.style.top = gy(110); }
    if (place2 === "greenhouse") { var r = HD.rooms[home.houseStyle].garden; m.style.left = gx(r[0] + 6); m.style.top = gy(r[3] - 26); }
  };
  // idle in the new places: just a little wander
  var _l_idle = idle; idle = function () {
    if (NEWP.indexOf(place2) >= 0) {
      later(idle, rnd(4000, 8000)); if (idleBlocked() || H.where === "jetty") return;
      act("hwander", async function () { if (place2 === "pond") { var wy = rnd(112, 132); await walkTo(rnd(10, pShore(wy) - 16), wy); } else await walkTo(rnd(40, 140), rnd(120, 128)); front(mood()); await nibbleNose(5); await wait(600); });
      return;
    }
    _l_idle();
  };
  var _l_feedSeq = feedSeq; feedSeq = async function (k) { if (NEWP.indexOf(place2) >= 0) await toRoom(); return _l_feedSeq(k); };
  var _l_sleepSeq = sleepSeq; sleepSeq = async function () { if (NEWP.indexOf(place2) >= 0) await toRoom(); return _l_sleepSeq(); };

  // ---------- cheek stash: when he is full he hides food by his bed and nibbles at night ----------
  var stashEl = lEl("button", "l-stash", scene); stashEl.type = "button"; stashEl.setAttribute("aria-label", "Vorrat"); stashEl.hidden = true;
  var FNAME = { seed: "Kerne", carrot: "Karotte", apple: "Apfel" };
  function renderStash() {
    stashEl.hidden = true; return;
    var L = life(), n = L.stash.length, inBed = home.sleepAt === "bed";
    var where = inBed ? "bedroom" : "room";
    stashEl.hidden = !n || place2 !== where;
    if (stashEl.hidden) return;
    stashEl.innerHTML = svgOf(A["stash" + Math.min(6, n)], 16, 9);
    if (inBed) pos(stashEl, 84, 112, 16); else pos(stashEl, 40, 122, 16);
  }
  // the bedside stash is gone: whatever was still in it goes back to the pantry (after a saved state has been loaded)
  var stashBack = false;
  function returnStash() {
    stashBack = false; var L = life(); if (!L.stash.length) return;
    L.stash.forEach(function (k) { if (k === "apple") s.treats++; else if (GFOOD[k]) garden.harvest[k] = (garden.harvest[k] || 0) + 1; });
    L.stash = []; L.nibbled = 0; renderFoods(); renderNeeds();
  }

  // preview controls for the new things
  (function () {
    var dh = document.getElementById("d-hours"), box = dh && dh.parentNode;
    if (!box) return;
    [["l-d-letter", "Brief bekommen", function () { letterArrives(true); }],
      ["l-d-hello", "Neues Tier entdeckt", function () { var ids = Object.keys(ALLANI).filter(function (k) { return ANAME[k]; }); queueHello(pick(ids)); say("Ein neues Tier ist entdeckt. Gleich kommt Post."); }],
      ["l-d-pond", "Zum Teich", function () { if (busy) interrupt(); act("travel", function () { return travelTo("pond"); }); }]
    ].forEach(function (d) { var b = document.createElement("button"); b.type = "button"; b.className = "btn"; b.id = d[0]; b.textContent = d[1]; b.addEventListener("click", d[2]); box.appendChild(b); });
  })();
  scene.addEventListener("click", function (e) { if (lPop && !e.target.closest(".l-pop") && !e.target.closest(".l-ghbox") && !e.target.closest(".l-hot")) closeLPop(); });
  // the lake follows season, weather and time of day while you are there
  var _pondKey = "";
  setInterval(function () {
    if (place2 !== "pond") { _pondKey = ""; return; }
    var k = season() + "|" + weather.type + "|" + ((document.getElementById("sky").className.match(/sky-(eve|night)/) || [""])[0]);
    if (k !== _pondKey) { if (_pondKey) renderPond(); _pondKey = k; }
  }, 700);
  // keep the speech box clear of the visitor card in the top left corner
  var _gcard = document.getElementById("f-card"); if (_gcard) scene.appendChild(_gcard);
  setInterval(function () {
    if (_gcard) _gcard.classList.toggle("l-off", place2 !== "garden");
    var on = [document.getElementById("f-card"), pCard].some(function (c) { return c && !c.hidden && c.offsetParent; });
    scene.classList.toggle("has-vcard", on);
  }, 250);
  // night sky: stars scattered at random, each twinkling in its own rhythm
  function starsHTML(n, maxY, seed) {
    var r = seed || 7, o = "";
    function rr() { r = (r * 9301 + 49297) % 233280; return r / 233280; }
    for (var i = 0; i < n; i++) {
      var big = rr() < 0.18, x = (rr() * 98 + 1).toFixed(1), y = (rr() * maxY + 1).toFixed(1);
      o += '<i class="l-star' + (big ? " big" : "") + '" style="left:' + x + '%;top:' + y + '%;animation-duration:' + (1.6 + rr() * 3.4).toFixed(2) + 's;animation-delay:-' + (rr() * 5).toFixed(2) + 's"></i>';
    }
    return o;
  }
  var _gst = document.querySelector(".g-stars");
  if (_gst) { _gst.style.backgroundImage = "none"; _gst.style.animation = "none"; _gst.innerHTML = starsHTML(46, 44, 11); }
  var _l_outdoorLake = outdoorLake;
  outdoorLake = function (mid, skyCls) {
    var h = _l_outdoorLake(mid, skyCls);
    if (skyCls === "sky-night") h += '<div class="l-stars l-stars-lake">' + starsHTML(34, 28, 23) + '</div>';
    return h;
  };
  // garden visitors only start their little scene while the hamster is actually in the garden
  var _l_startScene2 = startScene;
  startScene = function () { if (place2 !== "garden") return; return _l_startScene2(); };

  var _l_renderBCatalog = renderBCatalog; renderBCatalog = function () { syncBedNames(); _l_renderBCatalog(); };

  // ---------- tidier UI: one tray at a time, a short line about the next package ----------
  (function () {
    var fd = document.getElementById("foods"), tr = document.getElementById("tracks");
    var am = document.getElementById("a-music"), af = document.getElementById("a-feed");
    if (am && fd) am.addEventListener("click", function () { fd.hidden = true; });
    function mark() { if (af && fd) af.setAttribute("aria-pressed", String(!fd.hidden)); if (am && tr) am.setAttribute("aria-pressed", String(!tr.hidden)); }
    [af, am].forEach(function (b) { if (b) b.addEventListener("click", function () { setTimeout(mark, 0); }); });
    var dB = document.getElementById("decor-btn"); if (dB) dB.addEventListener("click", function () { setTimeout(mark, 0); });
  })();
  var _l_renderCosy = renderCosy;
  renderCosy = function () {
    _l_renderCosy();
    var t = document.getElementById("cosy-text"); if (!t) return;
    t.textContent = home.pending ? "Ein Paket wartet!" : typeof ownedCount === "function" && ownedCount() >= 60 && /Alle/.test(t.textContent) ? "Alle Möbel gesammelt" : isHappy() ? "Nächstes Sudoku bringt ein Paket" : "Erst glücklich machen, dann Paket";
  };
  setTimeout(function () { try { renderCosy(); } catch (e) {} }, 0);

  // ---------- food in the world: chunky 1:1 pixel food, and the hamster eats at the kitchen table instead of a bowl ----------
  var WF = /*WORLDFOOD*/;
  Object.keys(WF).forEach(function (k) { A[k] = WF[k].svg; SZ[k] = [WF[k].w, WF[k].h]; });
  var _l_heldFood = heldFood;
  heldFood = function () {
    if (!F.hold || F.hold.indexOf("book") === 0 || !A["wf_" + F.hold]) return _l_heldFood();
    var sc = F.holdScale, k = "wf_" + F.hold + (sc >= 0.7 ? "" : sc >= 0.4 ? "_b" : "_c"), sz = SZ[k];
    return '<g transform="translate(' + (24 - Math.round(sz[0] / 2)) + ' ' + (32 - sz[1]) + ')">' + A[k] + '</g>';
  };
  // dishes on the kitchen table at their real pixel size, without counters
  var TBL = { x0: 131.4, w: 36 };
  function tblItem(k, x) { var sz = SZ["wf_" + k]; return '<div class="k-dish2" style="left:' + (100 * x / TBL.w) + '%;width:' + (100 * sz[0] / TBL.w) + '%">' + svgOf(A["wf_" + k], sz[0], sz[1]) + '</div>'; }
  renderTable = function () {
    var t = document.getElementById("k-table"); if (!t) return;
    var keys = Object.keys(DISHES).filter(function (k) { return garden.harvest[k] && A["wf_" + k]; }).slice(0, 3);
    t.innerHTML = keys.map(function (k, i) { return tblItem(k, 1 + i * 11); }).join("") + (mealOnTable ? tblItem(mealOnTable, 25) : "");
  };
  var mealOnTable = null;
  async function toKitchen() {
    if (place2 === "kitchen") return;
    if (NEWP.indexOf(place2) >= 0 || place2 === "garden" || place2 === "bath" || place2 === "bedroom") await toRoom();
    if (H.where === "chair") await hopOutOfChair();
    await walkTo(196, 120); fadeX(false); await wait(250);
    showPlace("kitchen"); moveTo(-14, 120, 0); fadeX(true);
  }
  feedSeq = async function (kind) {
    ham.style.opacity = "1";
    var full = s.food >= 98, wk = A["wf_" + kind] ? kind : null;
    front({ eyes: "wide", ears: "up", mouth: "open", paws: "up" }); pulse("hop", 420);
    say({ seed: "Kerne! " + N() + " flitzt in die Küche.", carrot: "Eine Karotte! " + N() + " ist schon unterwegs.", apple: "Ein Apfel! " + N() + " kann es kaum fassen." }[kind] || (GFOOD[kind] && GFOOD[kind].say) || N() + " freut sich.");
    await wait(400);
    await toKitchen();
    mealOnTable = wk; renderTable();
    await walkTo(KSPOT.table.x, KSPOT.table.y); H.dir = 1;
    for (var t = 0; t < 4; t++) { standFrame(t % 2); await wait(170); }
    mealOnTable = null; renderTable();
    if (full) {
      front({ hold: kind, holdScale: 1, paws: "hold", eyes: "happy", mouth: "teeth" });
      for (var j = 0; j < 8; j++) { F.holdScale = 1 - j / 7; F.cheeks = j < 3 ? null : j < 6 ? "s" : "l"; F.mouth = j % 2 ? "teeth" : "chew"; if (j === 7) F.hold = null; front(); await wait(150); }
      var val = GFOOD[kind] ? GFOOD[kind].food : kind === "apple" ? 20 : kind === "seed" ? 15 : 25;
      if (GFOOD[kind]) { garden.harvest[kind]--; renderFoods(); } else if (kind === "apple") s.treats--;
      front({ hold: null, cheeks: "l", paws: "down", mouth: "smile", eyes: "happy", blush: true }); pulse("hop", 420);
      stashFood = Math.min(60, stashFood + val); stashUntil = Math.max(stashUntil, Date.now()) + 90000; renderNeeds();
      say(N() + " ist eigentlich satt und stopft alles in die Backen. Dicke Backen!"); await wait(900); await walkTo(KSPOT.home.x, KSPOT.home.y); return;
    }
    front({ hold: kind, holdScale: 1, paws: "hold", eyes: "happy", mouth: "chew" }); body("nibble");
    var n = kind === "seed" ? 12 : 16;
    for (var i = 0; i < n; i++) {
      F.mouth = i % 2 ? "teeth" : "chew"; F.nose = i % 3 === 0; F.holdScale = 1 - i / n;
      if (kind === "seed" && i === 5) F.cheeks = "s";
      if (kind === "seed" && i === 9) { F.cheeks = "l"; F.hold = null; }
      if (kind === "apple" && i === 8) { F.blush = true; fx("heart", H.x + rnd(-10, 10), headY(), "up"); }
      front();
      if (i % 3 === 1 && kind !== "seed") fx("crumb", H.x + rnd(-3, 3), H.y - 14 * H.scale - 8, "fall", 1, { "--dx": rnd(-6, 6) + "px" });
      await wait(150);
    }
    F.nose = false;
    if (GFOOD[kind]) { var gf = GFOOD[kind]; garden.harvest[kind]--; s.food = clamp(s.food + gf.food); s.fun = clamp(s.fun + (gf.fun || 0)); s.love = clamp(s.love + (gf.love || 0)); renderFoods(); }
    else if (kind === "apple") { s.treats--; s.food = clamp(s.food + 20); s.fun = clamp(s.fun + 10); s.love = clamp(s.love + 5); }
    else s.food = clamp(s.food + (kind === "seed" ? 15 : 25));
    renderNeeds();
    front({ hold: null, paws: "down", mouth: "smile", eyes: "happy", cheeks: kind === "seed" ? "l" : null }); body(""); pulse("hop", 420);
    say({ seed: "Backen voll! Dicke Backen.", carrot: "Knusper, knusper. Lecker.", apple: N() + " ist rundum glücklich." }[kind] || N() + " schmatzt zufrieden.");
    await wait(900); front({ cheeks: null }); await walkTo(KSPOT.home.x, KSPOT.home.y);
  };
  // tap the bookshelf and the hamster reads
  (function () {
    var sh = document.getElementById("slot-shelf"); if (!sh) return;
    sh.style.cursor = "pointer";
    sh.addEventListener("click", function (e) {
      if (decor || s.asleep || place2 !== "room") return;
      e.stopPropagation();
      if (busy && !interruptible()) return; if (busy) interrupt();
      act("read", readBook);
    });
  })();

  // ---------- visitors: at most one every five minutes, wherever; the goodbye card only on tapping the animal ----------
  var demoVisit = false;
  var _v_spawn = spawnVisitor;
  spawnVisitor = function (force, want) {
    if (!demoVisit && Date.now() - (garden.lastVisit || 0) < 300000) return;
    demoVisit = false; return _v_spawn(force, want);
  };
  (function () { var dv = document.getElementById("d-visit"); if (dv) dv.addEventListener("click", function () { demoVisit = true; }, true); })();
  var _v_rfc = renderFriendCard;
  renderFriendCard = function () {
    _v_rfc();
    var fc = document.getElementById("f-card"); if (!fc) return;
    if (!visitor || !visitor.cardOpen) { fc.hidden = true; return; }
    if (!fc.querySelector(".fc-x")) fc.insertAdjacentHTML("beforeend", '<button type="button" class="fc-x" data-a="x" aria-label="Schließen">×</button>');
  };
  scene.addEventListener("click", function (e) {
    var fc = document.getElementById("f-card");
    if (e.target.closest("#f-card [data-a=x]")) { if (visitor) visitor.cardOpen = false; if (fc) fc.hidden = true; return; }
    if (visitor && visitor.el && visitor.el.contains(e.target) && !decor) { visitor.cardOpen = true; renderFriendCard(); }
  }, true);
  // ---------- signs on the house map: a normal font instead of pixel letters ----------
  pixText = function (txt, opt) {
    opt = opt || {}; var t = String(txt), tw = Math.round(t.length * 5.4 + 2), pad = 3, W = tw + pad * 2, H = 13;
    var bg = opt.bg || "#8a5a30", bd = opt.bd || "#3a2414", sh = opt.sh || "#6a4422", fg = opt.fg || "#fff4dc";
    var esc = t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
      '<path fill="' + bd + '" shape-rendering="crispEdges" d="M1 0h' + (W - 2) + 'v1h1v' + (H - 2) + 'h-1v1h-' + (W - 2) + 'v-1h-1v-' + (H - 2) + 'h1z"/>' +
      '<rect x="1" y="1" width="' + (W - 2) + '" height="' + (H - 2) + '" fill="' + bg + '" shape-rendering="crispEdges"/><rect x="1" y="' + (H - 2) + '" width="' + (W - 2) + '" height="1" fill="' + sh + '" shape-rendering="crispEdges"/>' +
      '<rect x="1" y="1" width="' + (W - 2) + '" height="1" fill="' + (opt.hi || "#b07a44") + '" shape-rendering="crispEdges"/>' +
      '<text x="' + (W / 2) + '" y="9.4" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-weight="700" font-size="8.4" fill="' + fg + '">' + esc + '</text></svg>';
    return { svg: svg, w: W, h: H };
  };

  // ---------- kitchen and bedroom furniture has to be earned too: it comes in packages from the games ----------
  function vOwn() {
    var L = life();
    if (!L.kown) { L.kown = {}; KCATS.forEach(function (q) { var a = [0]; if (home.kitchen[q.id]) a.push(home.kitchen[q.id]); L.kown[q.id] = a; }); }
    if (!L.bown) { L.bown = {}; BCATS.forEach(function (q) { var a = [0]; if (home.bedroom[q.id]) a.push(home.bedroom[q.id]); L.bown[q.id] = a; }); }
    return L;
  }
  function vCats() { return KCATS.map(function (q) { return { cat: "k_" + q.id, q: q, room: "k", n: 3 }; }).concat(BCATS.map(function (q) { return { cat: "b_" + q.id, q: q, room: "b", n: q.id === "bed" ? 7 : q.names.length }; })); }
  function vInfo(cat) { return vCats().filter(function (v) { return v.cat === cat; })[0]; }
  (function () { var ub = document.getElementById("d-unlock"); if (ub) ub.addEventListener("click", function () {   /* preview admin: kitchen and bedroom things (beds too) count as earned */
    var L = vOwn(); vCats().forEach(function (v) { var o = v.room === "k" ? L.kown : L.bown, n = Math.max(v.n, v.q.names.length), a = []; for (var i = 0; i < n; i++) a.push(i); o[v.q.id] = a; });
    try { if (typeof kCatalog !== "undefined" && !kCatalog.hidden) renderKCatalog(); if (typeof bCatalog !== "undefined" && !bCatalog.hidden) renderBCatalog(); renderCosy(); } catch (e) {} }); })();
  function vOwned(cat, i) { var L = vOwn(), v = vInfo(cat); if (!v) return true; var a = (v.room === "k" ? L.kown : L.bown)[v.q.id] || []; return a.indexOf(i) >= 0; }
  var V_TOTAL = vCats().reduce(function (s2, v) { return s2 + v.n; }, 0);
  TOTAL_ITEMS += V_TOTAL;
  var _v_owned = ownedCount;
  ownedCount = function () { var L = vOwn(), n = _v_owned(); [L.kown, L.bown].forEach(function (o) { for (var k in o) n += o[k].length; }); return n; };
  var _v_item = item;
  item = function (cat, id) {
    var v = vInfo(cat); if (!v) return _v_item(cat, id);
    return { id: id, name: v.q.names[id].replace("\\u00ad", ""), virt: true, room: v.room, sub: v.q.id };
  };
  pickGift = function () {
    if (home.pending) return home.pending;
    var pool = [];
    for (var c in FURN) FURN[c].forEach(function (it) { if (!it.crafted && home.owned[c].indexOf(it.id) < 0) pool.push([c, it.id]); });
    vCats().forEach(function (v) { for (var i = 0; i < v.n; i++) if (!vOwned(v.cat, i)) pool.push([v.cat, i]); });
    if (!pool.length) return null;
    var pk = pick(pool); home.pending = { cat: pk[0], id: pk[1] }; home.happyMin = 0;
    renderCosy(); renderPackage(); return home.pending;
  };
  var _v_gift = showGiftModal;
  showGiftModal = function (cat, it) {
    if (!it || !it.virt) return _v_gift(cat, it);
    var L = vOwn(), list = (it.room === "k" ? L.kown : L.bown)[it.sub]; if (list.indexOf(it.id) < 0) list.push(it.id); renderCosy();
    var where = it.room === "k" ? "Küche" : "Schlafzimmer";
    var pic = it.room === "k" ? thumb(it.sub, it.id) : it.sub === "bed" ? bBedOnly(it.id) : bThumb(it.sub, it.id);
    var wrap = document.createElement("div"); wrap.className = "gift-wrap";
    wrap.innerHTML = '<div class="gift" role="dialog" aria-modal="true" aria-label="Neu für die ' + where + '"><h2>Neu für ' + (it.room === "k" ? "die Küche" : "das Schlafzimmer") + '!</h2><div class="stage v-stage">' + pic + '</div><p>' + it.name + '</p>' +
      '<div class="row"><button type="button" class="btn" data-a="later">Später</button><button type="button" class="btn primary" data-a="place">Gleich einrichten</button></div></div>';
    (document.getElementById("ham-root") || document.body).appendChild(wrap);
    wrap.addEventListener("click", function (e) {
      var a = e.target.dataset && e.target.dataset.a; if (!a) return;
      if (a === "place") {
        if (it.room === "k") { home.kitchen[it.sub] = it.id; renderKitchenArt(); } else { home.bedroom[it.sub] = it.id; renderBedroomArt(); }
        say(it.name + " ist jetzt " + (it.room === "k" ? "in der Küche" : "im Schlafzimmer") + ".");
      } else say(it.name + " wartet unter „" + where + " einrichten“.");
      wrap.remove(); if (window.SudokuSave) window.SudokuSave();
    });
  };
  // catalogs: items not earned yet are locked
  function lockItems(box, cat) {
    box.querySelectorAll(".k-item").forEach(function (b) {
      var i = +b.dataset.i, own = vOwned(cat, i);
      b.classList.toggle("locked", !own); b.setAttribute("aria-disabled", String(!own));
      if (!own && !b.querySelector(".lock")) b.insertAdjacentHTML("beforeend", '<span class="lock">Noch nicht verdient</span>');
    });
  }
  var _v_rk = renderKCatalog; renderKCatalog = function () { _v_rk(); lockItems(kCatalog, "k_" + kCat); };
  var _v_rb = renderBCatalog; renderBCatalog = function () { _v_rb(); lockItems(bCatalog, "b_" + bCat); };
  function blockLocked(box) {
    box.addEventListener("click", function (e) {
      var it = e.target.closest(".k-item.locked"); if (!it) return;
      e.stopPropagation(); e.preventDefault();
      say("Das gibt es noch nicht. Möbel kommen als Paket, wenn du Sudoku, Mumpsch oder Farbklecks spielst.");
    }, true);
  }
  blockLocked(kCatalog); blockLocked(bCatalog);
  setTimeout(function () { vOwn(); try { renderCosy(); } catch (e) {} }, 0);

  // ---------- an arrow up in the living room leads to the bedroom ----------
  (function () {
    var room = document.getElementById("room"); if (!room) return;
    var up = document.createElement("button"); up.type = "button"; up.className = "h-up"; up.setAttribute("aria-label", "Treppe hoch ins Schlafzimmer"); up.innerHTML = "<span>›</span>";
    room.appendChild(up);
    up.addEventListener("click", function (e) {
      e.stopPropagation(); if (decor) return;
      if (s.asleep) { say(N() + " schläft gerade."); return; }
      if (busy && !interruptible()) return; if (busy) interrupt();
      act("travel", function () { return travelTo("bedroom"); });
    });
  })();

  // ---------- walking somewhere can always be cut short: tap anywhere else, or on something new ----------
  var userTap = false;
  var MOVE_ACTS = ["travel", "inside", "garden", "kitchen", "pondgo", "ghgo", "bathgo", "feed", "home"];
  MOVE_ACTS.forEach(function (a) { if (IDLE_ACTS.indexOf(a) < 0) IDLE_ACTS.push(a); });
  var _mv_interrupt = interrupt;
  interrupt = function () {
    var wasMove = MOVE_ACTS.indexOf(cur) >= 0;
    if (document.visibilityState === "visible" && typeof bedAt !== "undefined" && cur !== "sleep" && wasMove && bedAt && !s.asleep && userTap) bedAt = 0;
    _mv_interrupt();
    if (!wasMove) return;
    // never leave the hamster faded out or half outside the picture
    ham.style.transition = "opacity .2s"; ham.style.opacity = "1";
    /* in the long living room the picture reaches from the hall to the kitchen door: only pull him back when he is really outside it */
    var wideR = place2 === "room" && typeof RX0 !== "undefined", lo = wideR ? RX0 + 12 : 16, hi = wideR ? RX1 - 12 : 164;
    if (H.x < lo - 6 || H.x > hi + 6) moveTo(Math.max(lo, Math.min(hi, H.x)), Math.max(112, Math.min(130, H.y)), 0);
    if (typeof mealOnTable !== "undefined" && mealOnTable) { mealOnTable = null; try { renderTable(); } catch (e) {} }
    front({ hold: null, paws: "down", eyes: "open", mouth: "smile" }); body("");
  };
  scene.addEventListener("click", function (e) {
    if (!busy || MOVE_ACTS.indexOf(cur) < 0 || decor) return;
    var bgHit = e.target.closest(".floor, .wallpaper, .baseboard, .k-bg, .g-sky, .l-bg, .bed-bg, .b-bg");
    if (!bgHit && e.target.closest("button, a, .slot, .hamster, [class*=visitor], .gpop, .l-pop, .f-card, .lf-paper, .gift-ask, .pz-ui, .sign, [role=button]")) return;
    userTap = true; interrupt(); userTap = false; say(N() + " bleibt stehen.");
  });

  // ===================== the item popup: whenever something is received, it is shown big in the middle =====================
  var IBIG = /*ITEMBIG*/;
  var MBIG = /*MEADOW52*/;                                                  // the meadow plants at double detail, only for the big popup
  var IBKEY = { gcarrot: "carrot", carrot: "carrot", jam: "d_jam", bread: "d_bread", salad: "d_salad", cake: "d_cake", psoup: "d_psoup", tsoup: "d_tsoup" };
  function ibSvg(k) { var a = IBIG[k]; return a ? '<svg viewBox="0 0 ' + a.w + ' ' + a.h + '" aria-hidden="true" shape-rendering="crispEdges">' + a.svg + '</svg>' : ""; }
  function ibFor(kind) { var k = IBKEY[kind] || kind; return IBIG[k] ? k : null; }
  function ipRays() { var o = ""; for (var i = 0; i < 12; i++) { var a1 = i * 30, a2 = a1 + 9, p = function (a) { var t = a * Math.PI / 180; return (50 + Math.cos(t) * 50).toFixed(1) + "," + (50 + Math.sin(t) * 50).toFixed(1); }; o += '<polygon points="50,50 ' + p(a1) + ' ' + p(a2) + '"/>'; } return '<div class="ip-rays"><svg viewBox="0 0 100 100" aria-hidden="true" shape-rendering="crispEdges">' + o + '</svg></div>'; }
  function ipSparks() { return [[22, 14], [76, 12], [14, 38], [84, 36], [30, 4], [66, 30]].map(function (p, i) { return '<i class="ip-spark" style="left:' + p[0] + '%;top:' + p[1] + '%;animation-delay:-' + (i * 0.37).toFixed(2) + 's"></i>'; }).join(""); }
  function ipHam() { return '<svg viewBox="0 0 48 46" aria-hidden="true" shape-rendering="crispEdges">' + ["body", "ears_up", "whisk0", "nose", "eyes_happy", "mouth_grin", "blush", "paws_up"].map(function (k) { return A[k] || ""; }).join("") + '</svg>'; }
  var ipQueue = [], ipOn = false, ipEl = null;
  function itemPop(o) { ipQueue.push(o); if (!ipOn) ipNext(); }
  function ipNext() {
    if (ipQueue.length && uiBusy()) { ipOn = true; setTimeout(function () { ipOn = false; ipNext(); }, 450); return; }   // wait until no other popup is open
    var o = ipQueue.shift(); if (!o) { ipOn = false; return; }
    ipOn = true;
    var el = ipEl = document.createElement("div"); el.className = "ip"; scene.appendChild(el);
    var btns = (o.buttons || []).map(function (b, i) { return '<button type="button" class="pbtn' + (b.primary ? " ip-primary" : " ip-sec") + '" data-i="' + i + '">' + b.label + '</button>'; }).join("");
    var banner = '<div class="ip-banner"><b>' + o.title + '</b>' + (btns ? '<div class="ip-btns">' + btns + '</div>' : "") + '</div>';
    var done = false;
    function close(i) {
      if (done) return; done = true; el.classList.add("ip-bye");
      setTimeout(function () { el.remove(); if (ipEl === el) ipEl = null; if (o.buttons && i != null && o.buttons[i] && o.buttons[i].cb) o.buttons[i].cb(); else if (o.onClose) o.onClose(); ipNext(); }, 260);
    }
    if (o.unwrap) {
      el.innerHTML = '<div class="ip-dim"></div><div class="ip-box">' + ibSvg("box") + '</div>';
      setTimeout(function () { var b = el.querySelector(".ip-box"); if (b) b.classList.add("shake"); beep([[300, .04], [340, .04], [300, .04]]); }, 300);
      setTimeout(function () {
        var b = el.querySelector(".ip-box"); if (!b) return; b.innerHTML = ibSvg("box_open"); b.classList.remove("shake");
        el.insertAdjacentHTML("beforeend", '<div class="ip-lid">' + ibSvg("lid") + '</div><div class="ip-flash"></div>'); beep([[660, .05], [880, .06], [1175, .08]]);
      }, 1300);
      setTimeout(function () {
        var b = el.querySelector(".ip-box"); if (b) b.classList.add("down");
        el.insertAdjacentHTML("afterbegin", ipRays().replace('class="ip-rays"', 'class="ip-rays" style="top:34%"'));
        el.insertAdjacentHTML("beforeend", ipSparks() + '<div class="ip-gift' + (o.cls ? " " + o.cls : "") + '">' + o.art + '</div>' + banner);
        el.classList.add("ip-ready");
      }, 1800);
    } else {
      el.innerHTML = '<div class="ip-dim"></div>' + ipRays() + ipSparks() + '<div class="ip-stage"><div class="ip-ham">' + ipHam() + '</div><div class="ip-item">' + (o.art || ibSvg(o.k)) + '</div></div>' + banner;
      el.classList.add("ip-ready"); beep([[523, .07], [659, .07], [784, .1]]);
    }
    el.addEventListener("click", function (e) {
      if (!el.classList.contains("ip-ready")) return;
      var b = e.target.closest("[data-i]"); if (b) { e.stopPropagation(); return close(+b.dataset.i); }
      if (!o.buttons || !o.buttons.length) close(null);
    });
  }
  window.__itemPop = itemPop;
  function cropPhrase(c) { return { strawberry: "eine Erdbeere", cucumber: "eine Gurke", dandelion: "Löwenzahn", sunflower: "eine Sonnenblume", gcarrot: "eine Möhre", pumpkin: "einen Kürbis", tomato: "eine Tomate", herbs: "frische Kräuter", chili: "eine Chili", nut: "eine Haselnuss" }[c] || CROPS[c] && CROPS[c].name || c; }
  // harvest in the garden
  var _ip_harvest = harvestSeq;
  harvestSeq = async function (i) {
    var p = garden.plots[i], c = p && p.crop;
    await _ip_harvest(i);
    if (c && !garden.plots[i] && ibFor(c)) itemPop({ k: ibFor(c), title: "Du hast " + cropPhrase(c) + " geerntet!", sub: "Liegt jetzt in der Küche bereit." });
  };
  // harvest in the greenhouse
  ghUi.addEventListener("click", function (e) {
    var b = e.target.closest(".l-ghbox"); if (!b) return; var p = life().gh[+b.dataset.i];
    if (p && stage(p) === 3) { var c = p.crop; setTimeout(function () { if (!life().gh[+b.dataset.i] && ibFor(c)) itemPop({ k: ibFor(c), title: "Du hast 2 × " + CROPS[c].name + " geerntet!", sub: "Frisch aus dem Gewächshaus." }); }, 1900); }
  });
  // cooking
  var _ip_cook = cookSeq;
  cookSeq = async function (d) { await _ip_cook(d); if (DISHES[d] && ibFor(d)) itemPop({ k: ibFor(d), title: DISHES[d].name + " ist fertig!", sub: "Steht jetzt auf dem Küchentisch." }); };
  // letters: after "Danke!" the present is shown big
  var _ip_grant = grantLetter;
  grantLetter = function (l) {
    var res = _ip_grant(l), r = l.gift || {};
    var k = r.t === "apples" ? "apple" : (r.t === "seed" || r.t === "seeds") && r.k ? "seed_" + r.k : null;
    if (k && IBIG[k]) letterPopNext = { k: k, title: "Du hast " + res.got + " bekommen!", sub: "Ein Geschenk von " + ANAME[l.from] + "." };
    return res;
  };
  var letterPopNext = null;
  var _ip_closeLetter = closeLetter;
  closeLetter = function () { var lp = letterPopNext; letterPopNext = null; _ip_closeLetter(); if (lp) setTimeout(function () { itemPop(lp); }, 420); };
  // packages: the unwrap animation with the new piece of furniture
  var _ip_gift = showGiftModal;
  showGiftModal = function (cat, it) {
    if (!it) return _ip_gift(cat, it);
    var art, where, place, gcls = "";
    if (it.virt) {
      var L = vOwn(), list = (it.room === "k" ? L.kown : L.bown)[it.sub]; if (list.indexOf(it.id) < 0) list.push(it.id); renderCosy();
      art = it.room === "k" ? thumb(it.sub, it.id) : it.sub === "bed" ? bBedOnly(it.id) : bThumb(it.sub, it.id); where = it.room === "k" ? "Küche einrichten" : "Schlafzimmer einrichten";
      place = function () { if (it.room === "k") { home.kitchen[it.sub] = it.id; renderKitchenArt(); } else { home.bedroom[it.sub] = it.id; renderBedroomArt(); } say(it.name + " ist jetzt " + (it.room === "k" ? "in der Küche." : "im Schlafzimmer.")); if (window.SudokuSave) window.SudokuSave(); };
    } else {
      home.owned[cat].push(it.id); renderCosy();
      art = (cat === "wall" || cat === "floor") ? '<div class="ip-swatch" style="background-image:' + tileURL(it.tile).replace(/"/g, "'") + ';background-size:' + (it.w * 1.6) + 'px"></div>' : itemSVG(cat, it, "", "");
      if (cat === "meadow" && MBIG["mb_" + it.id]) art = '<svg viewBox="0 0 52 52" aria-hidden="true" shape-rendering="crispEdges">' + tint(MBIG["mb_" + it.id].svg) + '</svg>';
      gcls = cat === "plant" ? "ip-tall" : cat === "meadow" ? "ip-plant" : "";
      where = ["meadow", "deco", "bed"].indexOf(cat) >= 0 ? "Garten einrichten" : "Zimmer einrichten";
      place = function () {
        if (cat === "meadow") { var sp = [0, 2].filter(function (i) { return !home.placed["meadow" + i]; })[0]; home.placed["meadow" + (sp === undefined ? 0 : sp)] = it.id; } else home.placed[cat] = it.id;
        renderRoom(); say(it.name + (["meadow", "deco", "bed"].indexOf(cat) >= 0 ? " steht jetzt im Garten." : " steht jetzt im Zimmer."));
        if (window.SudokuSave) window.SudokuSave();
      };
    }
    itemPop({ unwrap: true, art: art, cls: gcls, title: "Neu: " + it.name + "!", sub: "Findest du auch später unter „" + where + "“.",
      buttons: [{ label: "Später", cb: function () { say(it.name + " wartet unter „" + where + "“."); } }, { label: "Gleich aufstellen", primary: true, cb: place }] });
  };

  // ---------- going to bed always counts, even if the app is closed while he is still on his way ----------
  var bedAt = 0;
  var _sl_sleep = sleep; sleep = function () { bedAt = Date.now(); return _sl_sleep.apply(this, arguments); };
  var _sl_wake = wake; wake = function () { bedAt = 0; return _sl_wake.apply(this, arguments); };
  function sleepNow() {
    if (s.asleep || !bedAt || Date.now() - bedAt > 120000) return;
    s.asleep = true; bedAt = 0; try { syncButtons(); } catch (e) {} if (window.SudokuSave) window.SudokuSave();
  }
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") sleepNow(); }, true);
  window.addEventListener("pagehide", sleepNow);
