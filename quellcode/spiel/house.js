  // ===================== the house: bathroom, attic bedroom and a house map =====================
  var HD = /*HOUSEART*/;
  for (var hk in HD.art) { A[hk] = HD.art[hk].svg; SZ[hk] = [HD.art[hk].w, HD.art[hk].h]; }
  if (home.houseStyle == null) home.houseStyle = 0;
  function hEl(tag, cls, parent, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }
  function lay(k, x, y, cls) { return '<div class="hl ' + (cls || "") + '" style="left:' + gx(x) + ';top:' + gy(y) + ';width:' + gx(SZ[k][0]) + '">' + svgOf(A[k], SZ[k][0], SZ[k][1]) + '</div>'; }
  // ---- bathroom (left of the living room) ----
  var bathEl = hEl("div", "hroom bath", null); bathEl.id = "bath"; bathEl.hidden = true; scene.insertBefore(bathEl, roomEl.nextSibling);
  bathEl.innerHTML = '<div class="sky bt-sky" id="bt-sky"><i style="left:0;top:22%;width:40%"></i><b class="sun"></b></div><div class="h-bg" id="ba-art"></div>' +
    '<button type="button" class="h-hot" id="h-tub" aria-label="Baden" style="left:' + gx(12) + ';top:' + gy(66) + ';width:' + gx(82) + ';height:' + gy(42) + '"></button>' +
    '<button type="button" class="g-exit h-exit right" id="bath-exit" aria-label="Ins Schlafzimmer"><span>›</span></button>';
  var tubFront = hEl("div", "h-front tubfront", scene, ""); tubFront.hidden = true;
  if (!home.bath) home.bath = { wall: 0, floor: 0, tub: 0, sink: 0 };
  function bathLayers(b) { return ["ba_wall_" + b.wall, "ba_floor_" + b.floor, "ba_fix", "ba_tubb_" + b.tub, "ba_sink_" + b.sink, "bath_slope"]; }
  function renderBathArt() {   /* the bath is furnished in layers: wall, floor, tub, sink */
    var b = home.bath;
    document.getElementById("ba-art").innerHTML = svgOf(bathLayers(b).map(function (k) { return A[k] || ""; }).join(""), 180, 135);
    var foamy = tubFront.classList.contains("foamy");
    tubFront.innerHTML = lay("bath_foam", 16, 72, "foam") + lay("ba_tub_" + b.tub, 14, 74);
    tubFront.classList.toggle("foamy", foamy);
  }
  renderBathArt();
  // ---- attic bedroom ----
  var bedEl = hEl("div", "hroom bedroom", null); bedEl.id = "bedroom"; bedEl.hidden = true; scene.insertBefore(bedEl, roomEl.nextSibling);
  bedEl.innerHTML = '<div class="sky b-sky" id="b-sky"><i style="left:0;top:22%;width:40%"></i><b class="sun"></b></div>' +
    '<div class="h-bg" id="b-art"></div><div id="b-bedback"></div>' +
    '<button type="button" class="h-hot" id="h-bed" aria-label="Ins Bett" style="left:' + gx(57) + ';top:' + gy(60) + ';width:' + gx(66) + ';height:' + gy(56) + '"></button>' +
    '<button type="button" class="h-stairs" id="bed-exit" aria-label="Treppe runter ins Wohnzimmer"><span>›</span></button>' +
    '<button type="button" class="g-exit h-exit" id="bed-bath" aria-label="Ins Bad"><span>‹</span></button>';   /* the bath is upstairs now, left of the bedroom */
  var bedFront = hEl("div", "h-front bedfront", scene, ""); bedFront.hidden = true;
  if (!home.bedroom) home.bedroom = { bed: 0, wall: 0, window: 0, floor: 0, rug: 0 };
  // the bedroom is furnished piece by piece now (night stand, lamp, chest, decoration too), each piece with a colour; -1 = its own colours
  ["stand", "lamp", "chest", "deco"].forEach(function (k) { if (home.bedroom[k] == null) home.bedroom[k] = 0; });
  ["bed", "wall", "window", "floor", "rug", "stand", "lamp", "chest", "deco"].forEach(function (k) { if (home.bedroom[k + "C"] == null) home.bedroom[k + "C"] = -1; });
  if (home.bedroom.bedC === -1 && home.canopy) home.bedroom.bedC = home.canopy;   /* the old canopy colour carries over */
  function bTintOf(cat, item) { var t = HD.btint[cat] && HD.btint[cat][item]; return t || null; }
  function bOpts(cat, item) {   // the colour choices for one piece: its own colours first, then the palette without the one equal to it
    var t = bTintOf(cat, item); if (!t) return [];
    var own = ["Original"].concat(t[1]), list = [{ i: -1, c: own }];
    HD.bpal[t[0]].forEach(function (e, i) { if (e[1].toLowerCase() !== t[1][0].toLowerCase()) list.push({ i: i, c: e }); });
    return list;
  }
  function bTint(svg, cat, item, ci) {
    var t = bTintOf(cat, item); if (!t || ci == null || ci < 0) return svg;
    var e = HD.bpal[t[0]][ci]; if (!e) return svg;
    t[1].forEach(function (src, k) { if (e[k + 1]) svg = svg.split(src).join(e[k + 1] + "_"); });
    return svg.split("_\"").join("\"");
  }
  var bMaskN = 0;
  function bArt(b, only) {   // the whole room (or, for a catalog picture, just some layers) as svg content
    var L = only || ["wall", "floor", "rug", "window", "stand", "lamp", "chest", "fix", "deco"], o = "";
    L.forEach(function (k) {
      if (k === "wall") { var id = "bwm" + (++bMaskN); o += '<mask id="' + id + '"><rect width="180" height="135" fill="#fff"/><path fill="#000" d="' + HD.bhole[b.window] + '"/></mask><g mask="url(#' + id + ')">' + bTint(A["bw2_" + b.wall], "wall", b.wall, b.wallC) + '</g>'; }
      else if (k === "floor") o += bTint(A["bf2_" + b.floor], "floor", b.floor, b.floorC);
      else if (k === "rug") o += bTint(A["br2_" + b.rug], "rug", b.rug, b.rugC);
      else if (k === "window") o += bTint(A["bwin2_" + b.window], "window", b.window, b.windowC);
      else if (k === "stand") o += bTint(A["bns_" + b.stand], "stand", b.stand, b.standC);
      else if (k === "lamp") o += bTint(A["blp_" + b.lamp], "lamp", b.lamp, b.lampC);
      else if (k === "chest") o += bTint(A["bch_" + b.chest], "chest", b.chest, b.chestC);
      else if (k === "fix") o += A.b_fix2;
      else if (k === "deco") o += bTint(A["bdc_" + b.deco], "deco", b.deco, b.decoC);
      else if (k === "bed") { var bi = HD.beds[b.bed]; o += bTint('<g transform="translate(' + bi.back[0] + ' ' + bi.back[1] + ')">' + A["bedb_" + b.bed] + '</g><g transform="translate(' + bi.front[0] + ' ' + bi.front[1] + ')">' + A["bedf_" + b.bed] + '</g>', "bed", b.bed, b.bedC); }
    });
    return o;
  }
  // the canopy bed can be dressed in a colour of your choice, like scarf and hat
  var CANOPY = [["Rosa", "#f4a3b4", "#fbd4dc", "#e07f95"], ["Himmelblau", "#8cc4ec", "#cce6f8", "#5a9ad0"], ["Mint", "#8fd4b4", "#cdeee0", "#5aae8c"], ["Flieder", "#c4a8ec", "#e6dcf8", "#9a7ac8"],
    ["Orange", "#f29a42", "#fbd4a8", "#c8691e"], ["Sonnengelb", "#f6d36a", "#fbeab4", "#d8a83a"], ["Kirschrot", "#e8706a", "#f8c4c0", "#c0463c"], ["Salbei", "#a8c090", "#dce8cc", "#7a9a60"], ["Creme", "#f0e2c4", "#fbf4e4", "#cdb88e"]];
  if (home.canopy == null) home.canopy = 0;
  function tintSvg(svg) { return bTint(svg, "bed", home.bedroom.bed, home.bedroom.bedC); }
  function tintSvgOld(svg) { var c = CANOPY[home.canopy]; return svg.split("#f4a3b4").join(c[1] + "_").split("#fbd4dc").join(c[2] + "_").split("#e07f95").join(c[3] + "_").split("_\"").join("\""); }
  function tintCanopy() { ["b-bedback"].forEach(function (id) { var e = document.getElementById(id); e.innerHTML = tintSvg(e.innerHTML); }); bedFront.innerHTML = tintSvg(bedFront.innerHTML); }
  var canBtn = hEl("button", "scarf-btn canopy-btn", scene, ""); canBtn.type = "button"; canBtn.setAttribute("aria-label", "Farbe des Himmelbetts"); canBtn.hidden = true;
  var canPop = hEl("div", "scarf-pop canopy-pop", scene, ""); canPop.hidden = true;
  function renderCanopyBtn() {
    var show = false;   /* the colour is chosen in the bedroom catalog now, below the beds */
    canBtn.hidden = !show; if (!show) canPop.hidden = true;
    var c = CANOPY[home.canopy];
    canBtn.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1" y="1" width="2" height="14" fill="#a06a38"/><rect x="13" y="1" width="2" height="14" fill="#a06a38"/><rect x="1" y="1" width="14" height="3" fill="' + c[1] + '"/><path d="M3 4h3l-2 7H3z M13 4h-3l2 7h1z" fill="' + c[1] + '"/><rect x="3" y="10" width="10" height="3" fill="' + c[2] + '"/></svg>';
  }
  canBtn.addEventListener("click", function (e) {
    e.stopPropagation(); canPop.hidden = !canPop.hidden;
    canPop.innerHTML = CANOPY.map(function (c, i) { return '<button type="button" class="sw' + (i === home.canopy ? " on" : "") + '" data-i="' + i + '" style="background:' + c[1] + '" aria-label="' + c[0] + '"></button>'; }).join("");
  });
  canPop.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return; e.stopPropagation();
    home.canopy = +b.dataset.i; renderBedroomArt(); canPop.hidden = true; beep([[880, .04], [1175, .06]]);
    say("Das Himmelbett ist jetzt " + CANOPY[home.canopy][0].toLowerCase().replace("rosa", "rosa") + ".");
  });
  document.addEventListener("click", function (e) { if (!canPop.hidden && !e.target.closest(".canopy-pop")) canPop.hidden = true; });
  function renderBedroomArt() {
    var b = home.bedroom, bi = HD.beds[b.bed];
    document.getElementById("b-art").innerHTML = svgOf(bArt(b), 180, 135);
    document.getElementById("b-bedback").innerHTML = lay("bedb_" + b.bed, bi.back[0], bi.back[1]);
    bedFront.innerHTML = lay("bedf_" + b.bed, bi.front[0], bi.front[1]);
    tintCanopy();
    renderCanopyBtn();
    RSPOT.bed = { x: bi.ham[0], y: bi.ham[1] };
  }
  var bEnter = hEl("button", "k-enter b-enter", roomEl, "<span>‹</span>"); bEnter.type = "button"; bEnter.setAttribute("aria-label", "Ins Bad");
  var NAMES = { room: "Wohnzimmer", kitchen: "Küche", bath: "Bad", bedroom: "Schlafzimmer", garden: "Garten" };
  var _h_showPlace3 = showPlace;
  showPlace = function (p) {
    _h_showPlace3(p);
    bathEl.hidden = p !== "bath"; bedEl.hidden = p !== "bedroom";
    tubFront.hidden = p !== "bath"; bedFront.hidden = p !== "bedroom";
    bEnter.hidden = true;   /* the bath moved upstairs: no door to it from the living room any more */
    if (p === "bath" || p === "bedroom") H.scale = 1;
    document.getElementById("decor-btn").hidden = false;
    if (typeof decorLabel === "function") decorLabel();
    renderMapMarker(); renderCanopyBtn();
  };
  function inFront(el, on) { el.classList.toggle("over", on); }
  var BSPOT = { home: { x: 104, y: 122 }, tubSide: { x: 98, y: 118 }, tub: { x: 52, y: 101 } };
  var RSPOT = { home: { x: 140, y: 122 }, bedSide: { x: 128, y: 120 }, bed: { x: 90, y: 100 }, stairs: { x: 160, y: 116 } };
  var BED_CLEAR = 126;   // in the bedroom the hamster stays right of the bed's front, so he never half-disappears behind it
  renderBedroomArt();
  async function goBathSeq() {   /* up the stairs, through the bedroom, into the bath on the left */
    if (place2 !== "bedroom") await goBedroomSeq();
    await bedToBath();
  }
  async function bedToBath() {
    if (H.where === "bed") await hopOutOfBed();
    await walkTo(BED_CLEAR, 120); H.dir = -1; fadeX(false); await wait(300);
    showPlace("bath"); moveTo(196, 120, 0); fadeX(true);
    say(N() + " ist im Bad."); await walkTo(BSPOT.home.x, BSPOT.home.y);
    front({ eyes: "happy", mouth: "smile" }); await nibbleNose(4);
  }
  async function bathToBed() {
    if (H.where === "tub") await hopOutOfTub();
    await walkTo(196, 120); fadeX(false); await wait(250);
    showPlace("bedroom"); moveTo(BED_CLEAR, 120, 0); fadeX(true); await walkTo(RSPOT.home.x, RSPOT.home.y);
  }
  async function roomFromBath() { await bathToBed(); await roomFromBedroom(); }
  // the stairs: a little pop-up of the stairwell, the hamster hops up (or down) step by step
  var stairPip = hEl("div", "storm-pip stair-pip", scene); stairPip.hidden = true;
  async function stairClimb(up) {
    var ST = HD.steps, n = ST.length, hamSvg = '<g id="st-frame"></g>';
    function miniFrame(f) { return A["mini_ham" + (f % 2)]; }
    stairPip.innerHTML = '<div class="pip-view st"><svg viewBox="0 0 100 64" aria-hidden="true">' + A.stairs_view + '<g id="st-ham">' + hamSvg + '</g></svg></div>';
    stairPip.hidden = false; void stairPip.offsetWidth; stairPip.classList.add("on");
    var g = document.getElementById("st-ham");
    var fr = document.getElementById("st-frame"), f = 0;
    function at(i, lift) { var p = ST[Math.max(0, Math.min(n - 1, i))]; g.setAttribute("transform", "translate(" + (p[0] - 2) + " " + (p[1] - 17 - lift) + ")"); }
    for (var k = 0; k < n; k++) {
      var i = up ? k : n - 1 - k; f = (f + 1) % 4; fr.innerHTML = miniFrame(f);
      at(i, 0); await wait(130); at(i, 4); beep([[up ? 500 + k * 60 : 900 - k * 60, .03]]); await wait(130);
    }
    at(up ? n - 1 : 0, 0); await wait(300);
    stairPip.classList.remove("on"); await wait(300); stairPip.hidden = true; stairPip.innerHTML = "";
  }
  async function goBedroomSeq() {
    if (H.where === "chair") await hopOutOfChair();
    await walkTo(-14, 120); fadeX(false); await wait(250);
    say(N() + " klettert die Treppe hoch …"); await stairClimb(true);
    showPlace("bedroom"); moveTo(RSPOT.stairs.x, RSPOT.stairs.y, 0); front({ eyes: "happy", mouth: "smile" }); fadeX(true);
    say(N() + " ist oben im Schlafzimmer."); await walkTo(RSPOT.home.x, RSPOT.home.y); await nibbleNose(4);
  }
  async function roomFromBedroom() {
    if (H.where === "bed") await hopOutOfBed();
    await walkTo(RSPOT.stairs.x, RSPOT.stairs.y); backFrame(0); await wait(250); fadeX(false); await wait(300);
    say(N() + " hüpft die Treppe runter …"); await stairClimb(false);
    showPlace("room"); moveTo(-14, 120, 0); front({ eyes: "open", mouth: "smile" }); fadeX(true); await walkTo(SPOT.home.x, SPOT.home.y);
  }
  // back to the living room from wherever he is, then on to the target
  async function toRoom() {
    if (place2 === "garden") await goInsideSeq();
    else if (place2 === "kitchen") await goRoomFromKitchen();
    else if (place2 === "bath") await roomFromBath();
    else if (place2 === "bedroom") await roomFromBedroom();
  }
  async function travelTo(t) {
    if (t === place2) { say(N() + " ist schon hier."); return; }
    if (place2 === "bath" && t === "bedroom") return bathToBed();   /* the two rooms upstairs are next to each other */
    if (place2 === "bedroom" && t === "bath") return bedToBath();
    await toRoom();
    if (t === "kitchen") await goKitchenSeq();
    else if (t === "garden") await goGardenSeq();
    else if (t === "bath") await goBathSeq();
    else if (t === "bedroom") await goBedroomSeq();
  }
  bEnter.addEventListener("click", function () { if (decor || s.asleep) return; if (busy) interrupt(); act("bathgo", goBathSeq); });
  document.getElementById("bath-exit").addEventListener("click", function () { if (busy) interrupt(); act("inside", bathToBed); });
  document.getElementById("bed-bath").addEventListener("click", function () { if (s.asleep) { say(N() + " schläft. Weck ihn erst auf."); return; } if (decor) return; if (busy) interrupt(); act("bathgo", bedToBath); });
  document.getElementById("bed-exit").addEventListener("click", function () { if (s.asleep) { say(N() + " schläft. Weck ihn erst auf."); return; } if (busy) interrupt(); act("inside", roomFromBedroom); });
  IDLE_ACTS.push("bathgo", "hwander");
  var _h_walkBed = walkTo;
  walkTo = function (x, y, speed) { if (place2 === "bedroom" && H.where !== "bed") x = Math.max(BED_CLEAR, x); return _h_walkBed.call(this, x, y, speed); };
  // feeding and parcels still happen downstairs
  var _h_feedSeq2 = feedSeq; feedSeq = async function (k) { if (place2 === "bath" || place2 === "bedroom") await toRoom(); return _h_feedSeq2(k); };
  var _h_idle3 = idle; idle = function () {
    if (place2 === "bath" || place2 === "bedroom") {
      later(idle, rnd(3500, 7000)); if (idleBlocked()) return;
      act("hwander", async function () { await walkTo(place2 === "bedroom" ? rnd(BED_CLEAR, 152) : rnd(70, 140), rnd(116, 126)); front(mood()); await nibbleNose(6); await wait(700); });
      return;
    }
    _h_idle3();
  };
  // ---- bathing: a cannonball over the rim, then dripping wet until you dry him with the towel ----
  var towelBtn = hEl("button", "h-towelhook", bathEl, svgOf(A.towel_hang, 25, 34)); towelBtn.type = "button"; towelBtn.setAttribute("aria-label", "Handtuch");
  towelBtn.style.left = gx(88); towelBtn.style.top = gy(40); towelBtn.style.width = gx(25);   /* between the window over the tub and the mirror */
  var wet = false, wetT = null, wetEnd = null, puddleEl = null;
  function setWet(on) {
    wet = on; ham.classList.toggle("wet", on); clearInterval(wetT); clearTimeout(wetEnd);
    if (puddleEl) { var pe = puddleEl; puddleEl = null; pe.classList.add("gone"); setTimeout(function () { pe.remove(); }, 600); }
    if (!on) return;
    wetT = setInterval(function () { if (!busy || cur === "hwander" || cur === "dry") fx("drip", H.x + rnd(-11, 11), H.y - rnd(8, 34), "fall", 1, { "--dx": "0px" }); }, 380);
    wetEnd = setTimeout(function () { if (wet) { setWet(false); say(N() + " ist von allein wieder trocken."); } }, 120000);
  }
  function dropPuddle() {
    if (puddleEl) puddleEl.remove();
    puddleEl = hEl("div", "h-puddle", place2 === "bath" ? bathEl : scene, svgOf(A.puddle, 21, 5));
    puddleEl.style.left = gx(H.x - 10.5); puddleEl.style.top = gy(H.y - 3); puddleEl.style.width = gx(21);
  }
  function splashFx(x, y) {
    var sp = hEl("div", "h-splash", scene, svgOf(A.splash, 41, 22)); sp.style.left = gx(x - 20.5); sp.style.top = gy(y); sp.style.width = gx(41);
    setTimeout(function () { sp.remove(); }, 650);
    for (var i = 0; i < 12; i++) fx("drop", x + rnd(-26, 26), y + rnd(-6, 8), "fall", 1, { "--dx": rnd(-22, 22) + "px" });
    beep([[140, .08], [90, .12], [60, .16]]);
  }
  async function arc(pts, ms) { for (var i = 0; i < pts.length; i++) { moveTo(pts[i][0], pts[i][1], ms); await wait(ms); } }
  async function hopOutOfTub() {
    front({ eyes: "happy", mouth: "smile", paws: "up" }); pulse("squat", 200); await wait(200);
    await arc([[58, 82], [66, 62], [78, 60]], 120);
    inFront(tubFront, false); tubFront.classList.remove("foamy"); H.where = null;
    await arc([[90, 84], [BSPOT.tubSide.x, BSPOT.tubSide.y]], 130);
    pulse("squat", 250);
  }
  async function bathSeq() {
    if (H.where === "tub") return;
    if (wet) setWet(false);
    await walkTo(BSPOT.tubSide.x + 6, BSPOT.tubSide.y); H.dir = -1;
    front({ eyes: "happy", mouth: "grin", paws: "down", blush: true }); say(N() + " nimmt Anlauf …"); pulse("squat", 400); await wait(450);
    // up and over the rim, curled up for a cannonball
    front({ eyes: "happy", mouth: "grin", paws: "up" });
    await arc([[94, 96], [86, 74]], 110);
    inFront(tubFront, true); H.where = "tub";
    front({ eyes: "sleep", mouth: "grin", paws: "up", ears: "flat" }); body("squat");
    await arc([[74, 58], [62, 54], [55, 62]], 110);
    moveTo(BSPOT.tub.x, BSPOT.tub.y, 110); await wait(110);
    say("Arschbombe!"); splashFx(BSPOT.tub.x, 60); tubFront.classList.add("foamy"); pulse("shake", 400);
    front({ eyes: "wide", mouth: "open", ears: "flat" }); await wait(500);
    front({ eyes: "happy", mouth: "grin", paws: "up", ears: "up", blush: true }); bubbleFx(8); await wait(700);
    say(N() + " planscht im Schaumbad.");
    for (var k = 0; k < 4; k++) {
      front({ eyes: k % 2 ? "happy" : "sleep", mouth: k % 2 ? "grin" : "smile", paws: k % 2 ? "up" : "down", blush: true }); pulse(k % 2 ? "hop" : "squat", 300);
      for (var j = 0; j < 3; j++) fx("drop", H.x + rnd(-16, 16), 76, "fall", 1, { "--dx": rnd(-8, 8) + "px" });
      bubbleFx(4); if (k === 2) beep([[1200, .05], [900, .05]]); await wait(750);
    }
    await hopOutOfTub();
    // dripping wet now: flat fur, drops falling, a puddle at his feet
    setWet(true); dropPuddle();
    front({ eyes: "sad", mouth: "flat", ears: "flat", paws: "down" }); body("");
    say(N() + " ist klitschnass! Tippe auf das Handtuch an der Wand."); await wait(600);
    front({ eyes: "open", mouth: "smile", ears: "flat" });
  }
  async function drySeq() {
    if (!wet) { say("Das Handtuch ist frisch und flauschig."); return; }
    say(N() + " wird abgetrocknet …");
    // the towel flies from the hook to the hamster and wraps him up
    var fly = hEl("div", "h-towelfly", scene, svgOf(A.towel_hang, 25, 34));
    fly.style.left = gx(88); fly.style.top = gy(40); fly.style.width = gx(25); towelBtn.classList.add("away");
    void fly.offsetWidth; fly.style.left = gx(H.x - 12.5); fly.style.top = gy(H.y - 54); await wait(450);
    fly.remove();
    front({ eyes: "happy", mouth: "grin", ears: "flat", paws: "down", blush: true });
    var wrap = hEl("div", "h-wrap", scene, svgOf(A.towel_wrap, 48, 52));
    wrap.style.left = gx(H.x); wrap.style.bottom = gb(H.y); wrap.style.width = gx(48 * H.scale);
    setWet(false); clearInterval(wetT);
    for (var k = 0; k < 6; k++) {
      wrap.className = "h-wrap rub" + (k % 2); F.eyes = k % 2 ? "happy" : "sleep"; front();
      if (k % 2) for (var j = 0; j < 2; j++) fx("spark", H.x + rnd(-16, 16), H.y - rnd(20, 44), "sparkle");
      beep([[600 + k * 60, .03]]); await wait(260);
    }
    wrap.remove(); towelBtn.classList.remove("away");
    s.fun = clamp(s.fun + 15); s.love = clamp(s.love + 5); renderNeeds();
    front({ eyes: "happy", mouth: "grin", ears: "up", paws: "up", blush: true }); pulse("bighop", 620);
    fx("spark", H.x - 10, H.y - 40, "sparkle"); fx("spark", H.x + 10, H.y - 44, "sparkle");
    say("Trocken und flauschig! Das Bad hat " + N() + " richtig Spaß gemacht."); await wait(800);
    front({ eyes: "happy", mouth: "smile", paws: "down" });
  }
  function bubbleFx(n) {
    for (var i = 0; i < n; i++) (function (i) { setTimeout(function () { fx("bubble", BSPOT.tub.x + rnd(-24, 24), 72 + rnd(-4, 4), "up", 1); }, i * 160); })(i);
  }
  document.getElementById("h-tub").addEventListener("click", function () { if (decor || s.asleep) return; if (busy) interrupt(); act("bath", bathSeq); });
  towelBtn.addEventListener("click", function () { if (decor || s.asleep) return; if (busy) interrupt(); act("dry", drySeq); });
  // ---- sleeping in the bed upstairs ----
  async function hopOutOfBed() {
    pulse("hop", 300); inFront(bedFront, false); H.where = null; moveTo(RSPOT.bedSide.x, RSPOT.bedSide.y, 260); await wait(300);
  }
  async function bedSleep() {
    await walkTo(RSPOT.bedSide.x, RSPOT.bedSide.y); H.dir = -1;
    front({ eyes: "tired", mouth: "yawn", paws: "up" }); pulse("stretch", 1000); await wait(1000);
    front({ eyes: "half", mouth: "flat", paws: "down" }); pulse("hop", 300);
    inFront(bedFront, true); H.where = "bed"; moveTo(RSPOT.bed.x, RSPOT.bed.y, 300); await wait(350);
    s.asleep = true; syncButtons(); skyTime();
    say(N() + " kuschelt sich ins Bett. Gute Nacht.");
    front({ eyes: "half", mouth: "smile", paws: "down", ears: "up", blush: true }); body(""); await wait(300);
    front({ blanket: 0 }); await wait(260); front({ blanket: 1 }); pulse("squat", 200); await wait(260);
    front({ blanket: 2, eyes: "half" }); await wait(450);
    front({ eyes: "sleep", mouth: "flat", ears: "flat" }); body("snooze"); startZzz();
  }
  var _h_sleepSeq3 = sleepSeq, sleepSpot = null;
  sleepSeq = async function () {
    var spot = sleepSpot || (place2 === "bedroom" ? "bed" : "chair"); sleepSpot = null; home.sleepAt = spot;
    if (spot === "chair") { if (place2 === "bath" || place2 === "bedroom") await toRoom(); return _h_sleepSeq3(); }
    if (place2 !== "bedroom") { say(N() + " geht nach oben ins Schlafzimmer."); await toRoom(); await goBedroomSeq(); }
    await bedSleep();
  };
  // tapping "Schlafen" asks where: in the armchair or in the bed upstairs
  var sleepPop = hEl("div", "sleep-pop", scene, ""); sleepPop.hidden = true;
  function bedIcon() {
    var b = home.bedroom.bed, bi = HD.beds[b], o = '<g transform="translate(' + bi.back[0] + ' ' + bi.back[1] + ')">' + A["bedb_" + b] + '</g><g transform="translate(' + bi.front[0] + ' ' + bi.front[1] + ')">' + A["bedf_" + b] + '</g>';
    return '<svg viewBox="50 24 80 96" aria-hidden="true">' + tintSvg(o) + '</svg>';
  }
  document.getElementById("a-sleep").addEventListener("click", function (e) {
    if (s.asleep || decor) return;
    e.stopImmediatePropagation();
    var it = chairItem();
    sleepPop.innerHTML = '<p class="ph">Wo soll ' + N() + ' schlafen?</p><div class="sp-row' + (it ? " sp-3" : "") + '">' +
      (it ? '<button type="button" class="sp-opt" data-s="chair"><span class="ic">' + svgOf(it.svg, it.w, it.h) + '</span><span>Im Sessel</span></button>' : "") +
      '<button type="button" class="sp-opt" data-s="bed"><span class="ic">' + bedIcon() + '</span><span>Im Bett</span></button>' +
      '<button type="button" class="sp-opt" data-s="nap"><span class="ic">' + napIcon() + '</span><span>Hamster-Nap</span></button></div>';
    sleepPop.hidden = false;
  }, true);
  sleepPop.addEventListener("click", function (e) {
    var b = e.target.closest(".sp-opt"); if (!b) return;
    e.stopPropagation(); sleepPop.hidden = true;
    if (b.dataset.s === "nap") { if (busy) interrupt(); act("nap", napSeq); return; }
    sleepSpot = b.dataset.s; sleep();
  });
  // ---- the hamster nap: curls up right where he is; in 10 seconds he gets half his energy back, then wakes by himself ----
  var NAP_MS = 10000, hNapSt = null;
  function napIcon() {
    var z = function (x, y, n, c) { var o = ""; for (var i = 0; i < n; i++) o += '<rect x="' + (x + i) + '" y="' + y + '" width="1" height="1" fill="' + c + '"/><rect x="' + (x + n - 1 - i) + '" y="' + (y + i) + '" width="1" height="1" fill="' + c + '"/><rect x="' + (x + i) + '" y="' + (y + n - 1) + '" width="1" height="1" fill="' + c + '"/>'; return o; };
    return '<svg viewBox="0 0 30 22" aria-hidden="true"><g transform="translate(0 4)">' + A.mini_ham0 + '</g>' + z(19, 1, 5, "#3a2414") + z(25, 7, 3, "#3a2414") + '</svg>';
  }
  async function napSeq() {
    front({ eyes: "tired", mouth: "yawn", paws: "up" }); pulse("stretch", 800); await wait(800);
    front({ eyes: "half", mouth: "smile", paws: "down", blush: true }); await wait(250);
    s.asleep = true; syncButtons(); skyTime();
    hNapSt = { t0: Date.now(), e0: s.energy };
    say(N() + " macht ein kurzes Nickerchen.");
    front({ blanket: 0 }); await wait(220); front({ blanket: 1 }); pulse("squat", 200); await wait(220);
    front({ blanket: 2, eyes: "sleep", mouth: "flat", ears: "flat" }); body("snooze"); startZzz();
  }
  function napTick() {
    if (!hNapSt) return;
    if (!s.asleep) { hNapSt = null; return; }
    var u = Math.min(1, (Date.now() - hNapSt.t0) / NAP_MS);
    s.energy = Math.max(s.energy, clamp(hNapSt.e0 + 50 * u)); renderNeeds();
    if (u >= 1 && !busy) { hNapSt.done = true; wake(); }
  }
  setInterval(napTick, 250);
  document.addEventListener("visibilitychange", function () {             // leaving the app mid-nap: the nap counts in full, he is awake on return
    if (document.visibilityState !== "hidden" || !hNapSt) return;
    s.energy = Math.max(s.energy, clamp(hNapSt.e0 + 50)); hNapSt = null; s.asleep = false;
    try { stopZzz(); front({ blanket: null, eyes: "open", mouth: "smile", paws: "down", ears: "up" }); body(""); syncButtons(); skyTime(); renderNeeds(); } catch (e) {}
    if (window.SudokuSave) window.SudokuSave();
  }, true);
  var _h_wakeSeqNap = wakeSeq;
  wakeSeq = async function (byPoke) {
    if (!hNapSt) return _h_wakeSeqNap(byPoke);
    hNapSt = null; s.asleep = false; stopZzz(); syncButtons(); skyTime();
    front({ eyes: "half", ears: "up", blanket: 2 }); body(""); await wait(350);
    front({ blanket: 1 }); await wait(220); front({ blanket: 0 }); pulse("squat", 200); await wait(220);
    front({ blanket: null, eyes: "happy", mouth: "yawn", paws: "up" }); pulse("stretch", 900); await wait(900);
    say(N() + " ist wieder fit!");
    for (var i = 0; i < 4; i++) { front({ paws: i % 2 ? "wash_r" : "wash_l", eyes: "sleep", mouth: "flat" }); await wait(160); }
    front({ paws: "down", eyes: "open", mouth: "smile" }); pulse("fluff", 520); await wait(500);
  };
  document.addEventListener("click", function (e) { if (!sleepPop.hidden && !e.target.closest(".sleep-pop") && !e.target.closest("#a-sleep")) sleepPop.hidden = true; });
  var _h_wakeSeq3 = wakeSeq;
  wakeSeq = async function (byPoke) { await _h_wakeSeq3(byPoke); if (H.where === "bed") await hopOutOfBed(); };
  document.getElementById("h-bed").addEventListener("click", function () { if (decor || s.asleep) return; if (busy) interrupt(); act("sleep", sleepSeq); });
  // bedroom window follows the real sky and the weather
  var _h_skyTime3 = skyTime; skyTime = function () {
    _h_skyTime3();
    ["b-sky", "bt-sky"].forEach(function (id) { var bs = document.getElementById(id); if (bs) { var keep = bs.querySelector(".sky-storm"); bs.className = "sky " + (id === "b-sky" ? "b-sky " : "bt-sky ") + (document.getElementById("sky").className.replace(/\bsky\b/, "").replace(/w-stormglass|w-bliz|b-sky|bt-sky|k-sky/g, "").trim()); if (keep) bs.classList.add("w-stormglass"); } });
    winViews();
  };
  var _h_applyWeather3 = applyWeather; applyWeather = function () { _h_applyWeather3(); stormGlass(document.getElementById("b-sky"), 36, 36); stormGlass(document.getElementById("bt-sky"), 28, 36); };
  // through every window you see the garden's tree line, in the colours of the season
  function winViews() {
    var se = season(), src = SBG["far_" + se], hedge = SBG["rest_" + se];
    ["sky", "k-sky", "b-sky", "bt-sky"].forEach(function (id) {
      var h = document.getElementById(id); if (!h) return;
      var v = h.querySelector(".win-view"); if (!v) { v = document.createElement("div"); v.className = "win-view"; h.appendChild(v); }
      if (v.dataset.se === se) return; v.dataset.se = se;
      v.innerHTML = '<img src="' + src + '" alt="" style="left:-16.667%;width:133.333%;top:0;height:100%"><img src="' + hedge + '" alt="" style="left:-16.667%;width:133.333%;top:0;height:100%">';
    });
  }
  winViews();

  // ---- the house map ----
  var mapBtn = hEl("button", "close mapbtn", null, '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11 12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/><path d="M15.5 6V3.8h2V7.6"/></svg>');
  mapBtn.type = "button"; mapBtn.id = "map-btn"; mapBtn.setAttribute("aria-label", "Haus-Karte");
  var closeBtn = document.getElementById("ham-close"); closeBtn.parentNode.insertBefore(mapBtn, closeBtn);
  var mapEl = hEl("div", "house-map", document.getElementById("ham-root") || document.body); mapEl.id = "house-map"; mapEl.hidden = true;
  function renderMap() {
    var st = home.houseStyle, R = HD.rooms[st];
    var spots = Object.keys(R).map(function (k) {
      var r = R[k], here = k === place2, pt = pixText(NAMES[k], here ? { bg: "#e8650c", sh: "#b04a08", hi: "#ff9a4a" } : null), LS = 0.7, lw = pt.w * LS, lx = Math.max(1, Math.min(179 - lw, (r[0] + r[2]) / 2 - lw / 2)), ly = r[1] + (k === "garden" ? 4 : 1);
      return '<button type="button" class="map-room' + (here ? " here" : "") + '" data-p="' + k + '" aria-label="' + NAMES[k] + '" style="left:' + gx(r[0]) + ';top:' + gy(r[1]) + ';width:' + gx(r[2] - r[0]) + ';height:' + gy(r[3] - r[1]) + '"></button>' +
        '<div class="map-label" style="left:' + gx(lx) + ';top:' + gy(ly) + ';width:' + gx(lw) + '">' + pt.svg + '</div>';
    }).join("");
    mapEl.innerHTML = '<div class="map-card" role="dialog" aria-labelledby="map-title"><div class="map-top"><h2 id="map-title">' + ownerTitle() + '</h2><button type="button" class="close" id="map-close" aria-label="Karte schließen">×</button></div>' +
      '<p class="map-sub">Tippe auf einen Raum, dann läuft ' + N() + ' dorthin.</p>' +
      '<div class="map-pic">' + mapScene(st) + spots + '<div class="map-ham" id="map-ham">' + svgOf(A.mini_ham0, 18, 18) + svgOf(A.mini_ham1, 18, 18) + '</div></div>' +
      '<p class="map-h3">Haus-Stil</p><div class="map-styles">' + HD.styles.map(function (n, i) {
        return '<button type="button" class="map-style" data-s="' + i + '" aria-pressed="' + (i === st) + '"><span class="ms-pic"><svg viewBox="-2 0 158 116" aria-hidden="true">' + A["house_" + i] + '</svg></span><span>' + n.replace("haus", "\u00adhaus").replace("hütte", "\u00adhütte") + '</span></button>';
      }).join("") + '</div></div>';
    renderMapMarker();
  }
  // the house sits in the real garden: its trees, hedge and meadow for the current season, with the current weather and time of day
  function mapScene(st) {
    var se = season(), wt = weather.type, bliz = wt === "storm" && se === "winter";
    var skyCls = (document.getElementById("sky").className.match(/sky-(eve|night)/) || [""])[0];
    var o = '<div class="map-sky ' + skyCls + ' mw-' + wt + '"></div>';
    if (wt === "rainbow" && A.rainbow) o += '<svg class="map-l" viewBox="0 0 180 135" aria-hidden="true"><g transform="translate(2 -4)" opacity=".85">' + (A.rainbow_big || A.rainbow) + '</g></svg>';
    o += '<img class="map-l map-wide" src="' + SBG["far_" + se] + '" alt="" style="left:-16.667%;width:133.333%;top:0;height:100%">';
    TREES.forEach(function (t, n) { o += '<img class="map-l map-wide map-tree" src="' + SBG[t[0] + "_" + se] + '" alt="" style="left:-16.667%;width:133.333%;top:0;height:100%;transform-origin:' + ((t[1] + 30) / 240 * 100) + '% ' + (t[2] / 135 * 100) + '%;--amp:' + t[3] + ';animation-delay:-' + (n * 0.2) + 's">'; });
    o += '<img class="map-l map-wide" src="' + SBG["rest_" + se] + '" alt="" style="left:-16.667%;width:133.333%;top:0;height:100%">';
    o += '<svg class="map-l map-shadow" viewBox="0 0 180 135" aria-hidden="true">' + A["house_shadow_" + st] + '</svg>';
    if (se === "winter" && garden.snow) o += '<svg class="map-l" viewBox="0 0 180 135" aria-hidden="true"><g transform="translate(154 92)">' + A["snowham" + (garden.snow - 1)] + '</g></svg>';
    o += '<svg class="map-l" viewBox="0 0 180 135" aria-hidden="true">' + A["house_" + st] + (se === "winter" ? A["house_snow_" + st] : "") + '</svg>';
    o += '<img class="map-l map-wide map-fg" src="' + SBG["fg_" + se] + '" alt="" style="left:-16.667%;width:133.333%;top:0;height:100%">';
    // weather on top
    var w = "", i, lc = se === "autumn" ? ["#e8822a", "#c8463c", "#f0b040"] : ["#6aa84a", "#9ad070", "#4e8a3a"];
    if (wt === "rain" || (wt === "storm" && !bliz)) {
      for (i = 0; i < (wt === "storm" ? 140 : 70); i++) w += '<rect class="' + (i % 3 ? "rf" : "rn") + '" x="' + Math.round(rnd(-20, 220)) + '" y="' + Math.round(rnd(-135, 135)) + '" width="1" height="' + (i % 3 ? 4 : 6) + '" fill="#c8d6ea" opacity=".75"/>';
      if (wt === "storm") {
        for (i = 0; i < 14; i++) w += '<g class="lf lf' + (i % 3) + '" style="animation-delay:-' + rnd(0, 2).toFixed(2) + 's;animation-duration:' + rnd(1.4, 2.4).toFixed(2) + 's"><g transform="translate(-6 ' + Math.round(rnd(20, 120)) + ')"><rect class="spin" width="2" height="1" fill="' + lc[i % 3] + '"/></g></g>';
        w += '<g class="bolt" transform="translate(30 0)">' + A.sp_bolt + '</g><g class="bolt bolt1" transform="translate(150 2)">' + A.sp_bolt + '</g>';
      }
    } else if (wt === "snow" || bliz) {
      for (i = 0; i < (bliz ? 200 : 80); i++) w += '<rect class="' + (bliz ? "sz" + (i % 3) : "msn") + '" x="' + Math.round(rnd(-40, 180)) + '" y="' + Math.round(rnd(-20, 135)) + '" width="1" height="1" fill="#ffffff" style="animation-delay:-' + rnd(0, 4).toFixed(2) + 's"/>';
    } else if (wt === "clouds") {
      w += '<g class="sp-c2"><g transform="translate(0 4)">' + A.sp_cloud2 + '</g><g transform="translate(200 4)">' + A.sp_cloud2 + '</g></g>';
    }
    o += '<svg class="map-l map-wx" viewBox="0 0 180 135" preserveAspectRatio="none" aria-hidden="true">' + w + '</svg>';
    o += '<div class="map-tint mt-' + wt + (bliz ? " mt-bliz" : "") + '"></div>';
    // evening and night: dark outside, the rooms glow with warm light from inside
    if (skyCls) {
      var R = HD.rooms[st], holes = "", glow = "", dark = skyCls === "sky-night" ? 0.35 : 0.15;
      ["room", "kitchen"].forEach(function (k) { var r = R[k]; holes += "M" + r[0] + " " + r[1] + "H" + (r[2] + 1) + "V" + (r[3] + 1) + "H" + r[0] + "Z"; });
      holes += (HD.attic && HD.attic[st]) || (function (r) { return "M" + r[0] + " " + r[1] + "H" + (r[2] + 1) + "V" + (r[3] + 1) + "H" + r[0] + "Z"; })(R.bedroom);
      var night = skyCls === "sky-night";
      o += '<svg class="map-l" viewBox="0 0 180 135" aria-hidden="true"><defs><mask id="map-night-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="135"><rect width="180" height="135" fill="#fff"/><path d="' + holes + '" fill="#000"/></mask></defs>' +
        '<rect width="180" height="135" fill="' + (night ? "#0c1030" : "#4a2e48") + '" opacity="' + dark + '" mask="url(#map-night-mask)"/>' +
        '<path d="' + holes + '" fill="#ffc870" opacity="' + (night ? 0.2 : 0.1) + '"/>' +
        '<ellipse cx="142" cy="112" rx="10" ry="3" fill="#ffd88a" opacity="' + (skyCls === "sky-night" ? 0.35 : 0.15) + '"/></svg>';
    }
    if (wt === "storm" && !bliz) o += '<div class="map-flash"></div>';
    var sg = pixText(ownerTitle(), { bg: "#a06a38", hi: "#c08a50" });
    o += '<div class="map-sign" style="width:' + gx(sg.w * 0.7) + '">' + sg.svg + '<i></i></div>';
    return '<div class="map-scene' + (wt === "storm" ? " stormy" : "") + '">' + o + '</div>';
  }
  function ownerTitle() { var n = N(); return /[sßxz]$/i.test(n) ? n + "’ Haus" : n + "s Haus"; }
  function renderMapMarker() {
    var m = document.getElementById("map-ham"); if (!m) return;
    var RR = HD.rooms[home.houseStyle], r = RR[place2] || RR.room;
    m.style.left = gx((r[0] + r[2]) / 2 - 9 + (place2 === "garden" ? 0 : 6)); m.style.top = gy(r[3] - (place2 === "garden" ? 26 : 19)); m.style.width = gx(18);
    mapEl.querySelectorAll(".map-room").forEach(function (b) { b.classList.toggle("here", b.dataset.p === place2); });
  }
  mapBtn.addEventListener("click", function () { renderMap(); mapEl.hidden = false; });
  mapEl.addEventListener("click", function (e) {
    if (e.target === mapEl || e.target.closest("#map-close")) { mapEl.hidden = true; return; }
    var sb = e.target.closest(".map-style"); if (sb) { home.houseStyle = +sb.dataset.s; renderMap(); beep([[880, .04], [1175, .06]]); return; }
    var rb = e.target.closest(".map-room"); if (!rb) return;
    var t = rb.dataset.p; mapEl.hidden = true;
    if (decor) setDecor(false);
    if (s.asleep) { say(N() + " schläft gerade. Weck ihn erst auf."); return; }
    if (t === place2) { say(N() + " ist schon im " + (t === "kitchen" ? "der Küche" : t === "bath" ? "Bad" : t === "garden" ? "Garten" : NAMES[t]) + "."); return; }
    if (busy) interrupt(); say(N() + " macht sich auf den Weg: " + NAMES[t] + ".");
    act("travel", function () { return travelTo(t); });
  });

  // ---- furnishing the bedroom: every piece on its own, each with colours ----
  var BCATS = [
    { id: "bed", name: "Bett", names: ["Himmelbett", "Körbchen-Nest", "Kissenkiste", "Walnuss-Bett", "Streichholz­schachtel", "Fliegenpilz-Bett", "Wolkenbett"] },
    { id: "wall", name: "Tapete", names: ["Blümchen", "Streifen", "Sternenhimmel", "Holzwand", "Blätter", "Uni"] },
    { id: "window", name: "Fenster", names: ["Rundfenster", "Sprossenfenster", "Bogenfenster"] },
    { id: "floor", name: "Boden", names: ["Dielen", "Fischgrät", "Teppichboden"] },
    { id: "rug", name: "Teppich", names: ["Flechtteppich", "Fellteppich", "Herzteppich", "Webteppich", "Karoteppich"] },
    { id: "stand", name: "Nachttisch", names: ["Nachttisch", "Beistelltisch", "Bücherstapel"] },
    { id: "lamp", name: "Lampe", names: ["Schirmlampe", "Kerze", "Pilzlampe", "Mondlampe", "Sternlampe"] },
    { id: "chest", name: "Kommode", names: ["Kommode", "Bücherregal", "Bauernschrank"] },
    { id: "deco", name: "Deko", names: ["Nichts", "Hängepflanze", "Topfpflanze", "Lichterkette", "Wimpelkette"] }
  ];
  var BSEL = { bed: [54, 26, 72, 96], wall: [6, 8, 168, 88], window: [10, 14, 50, 44], floor: [0, 98, 180, 37], rug: [36, 102, 108, 30], stand: [33, 76, 26, 25], lamp: [34, 58, 20, 22], chest: [129, 72, 32, 29], deco: [56, 4, 122, 96] };
  var BVB = { bed: "48 22 84 100", wall: "0 0 180 100", window: "6 10 58 50", floor: "0 96 120 39", rug: "34 100 112 34", stand: "28 56 36 46", lamp: "31 55 24 26", chest: "124 46 42 56", deco: "0 0 180 100" };
  var BTHUMB = { bed: ["wall", "floor", "bed"], wall: ["wall"], window: ["wall", "window"], floor: ["floor"], rug: ["floor", "rug"], stand: ["wall", "floor", "stand", "lamp"], lamp: ["wall", "stand", "lamp"], chest: ["wall", "floor", "chest"], deco: ["wall", "floor", "chest", "fix", "deco"] };
  var bCat = "bed", bCatalog = document.createElement("section"); bCatalog.className = "catalog k-catalog"; bCatalog.hidden = true;
  var dBtn = document.getElementById("decor-btn"); dBtn.parentNode.insertBefore(bCatalog, dBtn.nextSibling);
  var bSel = hEl("div", "k-sel", bedEl); bSel.hidden = true;
  function bThumb(cat, i) {
    var b = {}; for (var x in home.bedroom) b[x] = home.bedroom[x]; b[cat] = i;
    return '<svg viewBox="' + BVB[cat] + '" aria-hidden="true"><rect x="0" y="0" width="180" height="135" fill="#bfe3f7"/>' + bArt(b, BTHUMB[cat]) + '</svg>';
  }
  function bBedOnly(i) {   // just the bed, without wall and floor: for the present card
    var b = {}; for (var x in home.bedroom) b[x] = home.bedroom[x]; b.bed = i; b.bedC = -1; if (!HD.beds[i]) return bThumb("bed", i);
    return '<svg viewBox="' + BVB.bed + '" aria-hidden="true">' + bArt(b, ["bed"]) + '</svg>'; }
  function renderBCatalog() {
    var c = BCATS.filter(function (q) { return q.id === bCat; })[0], cur = home.bedroom[bCat], opts = bOpts(bCat, cur), cc = home.bedroom[bCat + "C"];
    bCatalog.innerHTML = '<div class="tabs k-tabs">' + BCATS.map(function (q) { return '<button type="button" class="tab" data-k="' + q.id + '" aria-pressed="' + (q.id === bCat) + '">' + q.name + '</button>'; }).join("") + '</div>' +
      '<p class="k-cat-title">' + c.name + ' auswählen</p><div class="k-items">' + c.names.map(function (nm, i) {
        return '<button type="button" class="item k-item" data-i="' + i + '" aria-pressed="' + (cur === i) + '"><div class="ic">' + bThumb(bCat, i) + '</div><span>' + c.names[i] + '</span></button>';
      }).join("") + '</div>' +
      (opts.length ? '<div class="wcol"><p class="wcol-h">Farbe</p><div class="wcol-r">' + opts.map(function (o) { var on = o.i === cc || (o.i === -1 && !HD.bpal[bTintOf(bCat, cur)[0]][cc]); return '<button type="button" class="wcol-b' + (on ? " on" : "") + '" data-cv="' + o.i + '" style="background:' + o.c[1] + '" aria-label="' + o.c[0] + '"></button>'; }).join("") + '</div></div>' : "");
    var r = BSEL[bCat]; bSel.hidden = false;
    bSel.style.left = (r[0] / 180 * 100) + "%"; bSel.style.top = (r[1] / 135 * 100) + "%"; bSel.style.width = (r[2] / 180 * 100) + "%"; bSel.style.height = (r[3] / 135 * 100) + "%";
  }
  bCatalog.addEventListener("click", function (e) {
    var t = e.target.closest(".tab"); if (t) { bCat = t.dataset.k; renderBCatalog(); return; }
    var cv = e.target.closest("[data-cv]"); if (cv) { home.bedroom[bCat + "C"] = +cv.dataset.cv; if (bCat === "bed") home.canopy = Math.max(0, +cv.dataset.cv); renderBedroomArt(); renderBCatalog(); beep([[880, .04], [1175, .06]]); if (window.SudokuSave) window.SudokuSave(); return; }
    var it = e.target.closest(".k-item"); if (!it) return;
    home.bedroom[bCat] = +it.dataset.i; renderBedroomArt(); renderBCatalog(); beep([[880, .04], [1175, .06]]); if (window.SudokuSave) window.SudokuSave();
  });
  // ---- furnishing the bath ----
  var BACATS = [
    { id: "tub", name: "Wanne", names: ["Löwenfuß-Wanne", "Pantoffelwanne", "Salbeigrüne Wanne"] },
    { id: "sink", name: "Waschbecken", names: ["Säulen-Waschbecken", "Holz-Waschtisch", "Becken mit Vorhang"] },
    { id: "wall", name: "Wand", names: ["Hellblau", "Mint-Mosaik", "Rosa Vertäfelung", "Terrakotta"] },
    { id: "floor", name: "Boden", names: ["Holzdielen", "Schachbrett", "Mint-Fliesen", "Terrakotta"] }
  ];
  var BASEL = { tub: [12, 64, 82, 46], sink: [122, 58, 38, 42], wall: [0, 8, 180, 90], floor: [0, 98, 180, 37] };
  var BAVB = { tub: "8 60 92 52", sink: "118 54 46 48", wall: "0 4 180 96", floor: "0 96 120 39" };
  var baCat = "tub", baCatalog = document.createElement("section"); baCatalog.className = "catalog k-catalog"; baCatalog.hidden = true;
  dBtn.parentNode.insertBefore(baCatalog, dBtn.nextSibling);
  var baSel = hEl("div", "k-sel", bathEl); baSel.hidden = true;
  function baThumb(cat, i) {
    var b = {}; for (var x in home.bath) b[x] = home.bath[x]; b[cat] = i;
    var o = '<rect x="0" y="0" width="180" height="135" fill="#bfe3f7"/>' + bathLayers(b).map(function (k) { return A[k] || ""; }).join("");
    if (cat === "tub") o += '<g transform="translate(14 74)">' + A["ba_tub_" + i] + '</g>';
    return '<svg viewBox="' + BAVB[cat] + '" aria-hidden="true">' + o + '</svg>';
  }
  function renderBaCatalog() {
    var c = BACATS.filter(function (q) { return q.id === baCat; })[0];
    baCatalog.innerHTML = '<div class="tabs k-tabs">' + BACATS.map(function (q) { return '<button type="button" class="tab" data-k="' + q.id + '" aria-pressed="' + (q.id === baCat) + '">' + q.name + '</button>'; }).join("") + '</div>' +
      '<p class="k-cat-title">' + c.name + ' auswählen</p><div class="k-items">' + c.names.map(function (nm, i) {
        return '<button type="button" class="item k-item" data-i="' + i + '" aria-pressed="' + (home.bath[baCat] === i) + '"><div class="ic">' + baThumb(baCat, i) + '</div><span>' + nm + '</span></button>';
      }).join("") + '</div>';
    var r = BASEL[baCat]; baSel.hidden = false;
    baSel.style.left = (r[0] / 180 * 100) + "%"; baSel.style.top = (r[1] / 135 * 100) + "%"; baSel.style.width = (r[2] / 180 * 100) + "%"; baSel.style.height = (r[3] / 135 * 100) + "%";
  }
  baCatalog.addEventListener("click", function (e) {
    var t = e.target.closest(".tab"); if (t) { baCat = t.dataset.k; renderBaCatalog(); return; }
    var it = e.target.closest(".k-item"); if (!it) return;
    home.bath[baCat] = +it.dataset.i; renderBathArt(); renderBaCatalog(); beep([[880, .04], [1175, .06]]); if (window.SudokuSave) window.SudokuSave();
  });
  var _h_setDecor = setDecor;
  setDecor = function (on) {
    if (place2 === "bath") {
      decor = on; scene.classList.toggle("decor", on); dBtn.setAttribute("aria-pressed", on);
      baCatalog.hidden = !on; baSel.hidden = !on; bCatalog.hidden = true; bSel.hidden = true; document.getElementById("catalog").hidden = true;
      if (on) { document.getElementById("foods").hidden = true; document.getElementById("tracks").hidden = true; if (busy) interrupt(); renderBaCatalog(); }
      decorLabel(); return;
    }
    baCatalog.hidden = true; baSel.hidden = true;
    if (place2 === "bedroom") {
      if (on && s.asleep) { say(N() + " schläft gerade. Weck ihn erst auf."); return; }
      decor = on; scene.classList.toggle("decor", on); dBtn.setAttribute("aria-pressed", on);
      bCatalog.hidden = !on; bSel.hidden = !on; document.getElementById("catalog").hidden = true;
      if (on) { document.getElementById("foods").hidden = true; document.getElementById("tracks").hidden = true; if (busy) interrupt(); renderBCatalog(); }
      decorLabel(); return;
    }
    bCatalog.hidden = true; bSel.hidden = true; _h_setDecor(on);
  };
  var _h_decorLabel = decorLabel;
  decorLabel = function () { if (place2 === "bedroom" || place2 === "bath") { dBtn.textContent = decor ? "Fertig eingerichtet" : (place2 === "bath" ? "Bad einrichten" : "Schlafzimmer einrichten"); return; } _h_decorLabel(); };

  // ---- winter: build a snow hamster by tapping the snow heap in the garden ----
  var snowSpot = hEl("button", "g-snowspot", gardenEl, '<svg viewBox="0 0 24 8" aria-hidden="true" shape-rendering="crispEdges"><path fill="#3a2414" d="M4 2h16v1h2v1h1v3h1v1H0V7h1V4h1V3h2z"/><path fill="#ffffff" d="M4 3h16v1h2v3H2V4h2z"/><path fill="#dce4ee" d="M2 6h20v1H2z"/><path fill="#eef3f8" d="M6 4h3v1H6zM14 4h2v1h-2z"/></svg>');
  snowSpot.type = "button"; snowSpot.setAttribute("aria-label", "Schneehamster bauen");
  function layoutSnowSpot() {
    var on = season() === "winter" && place2 === "garden"; snowSpot.hidden = !on; if (!on) return;
    snowSpot.style.left = gx(GL.pile.x + 3); snowSpot.style.top = gy(GL.pile.bottom - 4); snowSpot.style.width = gx(24);
    snowSpot.classList.toggle("done", garden.snow >= 3); snowSpot.style.zIndex = GL.pile.bottom + 2;
  }
  async function buildSnowham() {
    if (garden.snow >= 3) {
      await walkTo(GSPOT.pile.x, GSPOT.pile.y + 4); H.dir = 1;
      front({ eyes: "happy", mouth: "grin", paws: "up", blush: true }); pulse("hop", 400);
      fx("heart", GL.pile.x + 17, GL.pile.bottom - 28, "up"); say(N() + " umarmt seinen Schneehamster."); await wait(800); return;
    }
    await walkTo(GSPOT.pile.x, GSPOT.pile.y + 4); H.dir = 1;
    for (var k = 0; k < 6; k++) {
      front({ paws: k % 2 ? "hold" : "side_l", eyes: "happy", mouth: "teeth" }); body("squat");
      for (var j = 0; j < 2; j++) fx("snowflake", GL.pile.x + rnd(6, 26), GL.pile.bottom - rnd(6, 20), "pop", 1);
      await wait(200); body(""); await wait(110);
    }
    garden.snow = Math.min(3, garden.snow + 1); layoutGarden(); layoutSnowSpot();
    var st = ["Die erste dicke Schneekugel liegt!", "Der Kopf ist drauf!", "Ohren, Augen, Nase: der Schneehamster ist fertig!"][garden.snow - 1];
    front({ eyes: "happy", mouth: "grin", paws: "up", blush: true }); pulse("hop", 420); say(st);
    if (garden.snow === 3) { s.fun = clamp(s.fun + 12); renderNeeds(); for (var q = 0; q < 3; q++) fx("spark", GL.pile.x + rnd(6, 26), GL.pile.bottom - rnd(10, 28), "sparkle"); beep([[784, .08], [988, .08], [1175, .16]]); }
    else say(st + " Tippe nochmal auf den Schnee.");
    await wait(700);
  }
  snowSpot.addEventListener("click", function () { if (decor || s.asleep) return; if (busy) interrupt(); act("snow", buildSnowham); });
  var _h_layoutGarden = layoutGarden; layoutGarden = function () { _h_layoutGarden(); layoutSnowSpot(); };
  var _h_showPlace4 = showPlace; showPlace = function (p) { _h_showPlace4(p); layoutSnowSpot(); };
  layoutSnowSpot();

  // ---- sleeping: a classic white nightcap instead of any hat ----
  var _h_outfitPart = outfitPart;
  outfitPart = function (part) {
    if (s.asleep || (F.blanket != null && (cur === "wake" || cur === "sleep"))) {
      if (part === "hat" && OUTFIT && OUTFIT.nightcap) return OUTFIT.nightcap;
      if (part === "hat" || part === "hat_back" || part === "scarf" || part === "scarf_back") return "";
    }
    return _h_outfitPart(part);
  };
  // a menu opening in the garden hides the speech box so it never covers the menu's title
  var _h_openPop = openPop;
  openPop = function () { var sb = document.querySelector(".say-box.on"); if (sb) sb.classList.remove("on"); return _h_openPop.apply(this, arguments); };

  // ---- reopening the app: the hamster sleeps where he was put to bed ----
  function placeAsleepBed() {
    stopZzz(); if (place2 !== "bedroom") showPlace("bedroom");
    ham.classList.remove("in-chair"); fadeX(true); H.scale = 1; H.dir = -1;
    inFront(bedFront, true); H.where = "bed"; moveTo(RSPOT.bed.x, RSPOT.bed.y, 0);
    front({ eyes: "sleep", mouth: "flat", ears: "flat", blanket: 2, paws: "down", blush: true }); body("snooze");
    startZzz(); syncButtons(); skyTime();
  }
  // leaves the bed without animation; with a target place it also goes there (returns true if it handled the placement)
  function leaveBedNow(target) {
    if (H.where !== "bed" && place2 !== "bedroom") { if (target && place2 !== target) showPlace(target); return false; }
    inFront(bedFront, false);
    if (target) { showPlace(target); H.where = "floor"; return false; }
    stopZzz(); H.where = "floor"; H.scale = 1; moveTo(RSPOT.home.x, RSPOT.home.y, 0); front({ blanket: null }); settle(); syncButtons(); skyTime(); return true;
  }
