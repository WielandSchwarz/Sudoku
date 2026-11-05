  // ===================== the world map (preview): home, garden, lake, café, forest, and room for more =====================
  var WM = /*WORLDMAP*/;
  var wmEl = hEl("div", "house-map world-map", document.getElementById("ham-root") || document.body); wmEl.id = "world-map"; wmEl.hidden = true;
  var WM_NAMES = { home: "Zuhause", garden: "Garten", pond: "See", cafe: "Café", forest: "Wald" };
  function wmHere() { if (place2 === "cafe" || place2 === "cafeout") return "cafe"; if (place2 === "garden" || place2 === "greenhouse") return "garden"; if (place2 === "pond") return "pond"; return "home"; }
  function wmPct(x, y) { return "left:" + (x / WM.w * 100).toFixed(3) + "%;top:" + (y / WM.h * 100).toFixed(3) + "%;"; }
  function renderWorld() {
    var se = season(), wt = weather.type, sk = document.getElementById("sky").className, night = /sky-night/.test(sk), eve = /sky-eve/.test(sk), here = wmHere();
    var o = '<svg class="wm-svg" viewBox="0 0 ' + WM.w + ' ' + WM.h + '" shape-rendering="crispEdges" aria-hidden="true">' + WM.maps[se];
    if (night || eve) {
      o += '<rect width="' + WM.w + '" height="' + WM.h + '" fill="' + (night ? "#0c1030" : "#4a2e48") + '" opacity="' + (night ? .5 : .25) + '"/>';
      WM.lamps.forEach(function (l) { for (var r = 6; r > 0; r -= 2) o += '<circle cx="' + l[0] + '" cy="' + l[1] + '" r="' + r + '" fill="#ffd27a" opacity="' + (night ? .22 : .12) + '"/>'; });
    }
    var w = "", i;
    if (wt === "rain" || wt === "storm") for (i = 0; i < 80; i++) w += '<rect class="' + (i % 3 ? "rf" : "rn") + '" x="' + Math.round(rnd(-20, 220)) + '" y="' + Math.round(rnd(-150, 150)) + '" width="1" height="4" fill="#c8d6ea" opacity=".7"/>';
    if (wt === "snow") for (i = 0; i < 90; i++) w += '<rect class="msn" x="' + Math.round(rnd(-20, 200)) + '" y="' + Math.round(rnd(-20, 150)) + '" width="1" height="1" fill="#ffffff" style="animation-delay:-' + rnd(0, 4).toFixed(2) + 's"/>';
    o += '<g class="map-wx">' + w + '</g>' + (WM.frame || "") + '</svg>';
    var spots = Object.keys(WM.spots).map(function (k) {
      var r = WM.spots[k]; return '<button type="button" class="map-room wm-spot' + (k === here ? " here" : "") + '" data-w="' + k + '" aria-label="' + (WM_NAMES[k] || "Freier Platz") + '" style="' + wmPct(r[0], r[1]) + 'width:' + ((r[2] - r[0]) / WM.w * 100).toFixed(3) + '%;height:' + ((r[3] - r[1]) / WM.h * 100).toFixed(3) + '%"></button>';
    }).join("");
    var labels = Object.keys(WM.labels).map(function (k) {
      var L = WM.labels[k], pt = pixText(L[0], k === here ? { bg: "#e8650c", sh: "#b04a08", hi: "#ff9a4a" } : null), lw = pt.w * 0.95;
      return '<div class="map-label wm-label" style="' + wmPct(L[1] - lw / 2, L[2] - 7) + 'width:' + (lw / WM.w * 100).toFixed(3) + '%">' + pt.svg + '</div>';
    }).join("");
    var mk = (WM.marks && WM.marks[here]) || [40, 70], mx = mk[0], my = mk[1];
    var ham = '<div class="map-ham wm-ham" style="' + wmPct(mx - 7, my - 14) + 'width:' + (14 / WM.w * 100).toFixed(3) + '%">' + svgOf(A.mini_ham0, 18, 18) + svgOf(A.mini_ham1, 18, 18) + '</div>';
    wmEl.innerHTML = '<div class="map-card" role="dialog" aria-labelledby="wm-title"><div class="map-top"><h2 id="wm-title">Karte</h2><button type="button" class="close" id="wm-close" aria-label="Karte schließen">×</button></div>' +
      '<p class="map-sub">Tippe auf einen Ort, dann flitzt ' + N() + ' direkt dorthin. Tippe aufs Haus für die Räume.</p>' +
      '<div class="map-pic wm-pic"><div class="map-scene wm-scene">' + o + '</div>' + spots + labels + ham + '</div></div>';
  }
  mapBtn.addEventListener("click", function (e) { e.stopImmediatePropagation(); renderWorld(); wmEl.hidden = false; }, true);
  wmEl.addEventListener("click", function (e) {
    if (e.target === wmEl || e.target.closest("#wm-close")) { wmEl.hidden = true; return; }
    if (wmBusy) return;
    var b = e.target.closest("[data-w]"); if (!b) return;
    var k = b.dataset.w;
    if (k === "home") { wmEl.hidden = true; renderMap(); mapEl.hidden = false; return; }
    if (k === "forest" && !window.__mush) { say("Im Wald wachsen Pilze. Dort gibt es bald etwas zu entdecken."); beep([[523, .04], [659, .05]]); return; }
    if (/^free/.test(k)) { say("Hier ist noch Platz für etwas Neues."); beep([[440, .04]]); return; }
    if (s.asleep) { wmEl.hidden = true; say(N() + " schläft gerade. Weck ihn erst auf."); return; }
    if (k === wmHere()) { wmEl.hidden = true; say(N() + " ist schon " + (k === "cafe" ? "beim Café." : k === "pond" ? "am See." : k === "forest" ? "im Wald." : "im Garten.")); return; }
    if (busy) interrupt();
    var from = wmHere(); wmBusy = true; wmEl.classList.add("wm-going");
    wmRun(from, k).then(function () { wmBusy = false; wmEl.classList.remove("wm-going"); wmEl.hidden = true; act("travel", function () { return warpTo(k); }); });
  });
  // ---- fast travel: on the map the hamster scurries along the paths, then he is simply there ----
  // routes are in map pixels, from each place to the junction by the front door, measured at his feet
  // every place has its way to the garden gate by the house; places further along share the same path
  var WM_ROUTE = WM.routes || {
    home: [[34, 80], [40, 86]],
    garden: [[36, 112], [38, 98], [40, 86]],
    cafe: [[103, 118], [96, 112], [86, 108], [74, 104], [56, 96], [40, 86]],
    pond: [[136, 118], [124, 115], [110, 116], [103, 118], [96, 112], [86, 108], [74, 104], [56, 96], [40, 86]]
  };
  var wmBusy = false;
  function wmRoute(a, b) {
    var ra = WM_ROUTE[a].slice(), rb = WM_ROUTE[b].slice(), j = null;
    while (ra.length && rb.length && ra[ra.length - 1][0] === rb[rb.length - 1][0] && ra[ra.length - 1][1] === rb[rb.length - 1][1]) { j = ra.pop(); rb.pop(); }
    return ra.concat(j ? [j] : []).concat(rb.reverse());
  }
  function wmRun(from, to) {
    return new Promise(function (resolve) {
      var pic = wmEl.querySelector(".wm-pic"), mk = wmEl.querySelector(".wm-ham"); if (!pic || !mk) { resolve(); return; }
      var pts = wmRoute(from, to), seg = [], len = 0, i;
      for (i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); len += d; }
      var dur = Math.max(1100, Math.min(2400, len * 15)), t0 = performance.now(), lastDot = -9, lastHop = 0;
      var trail = document.createElement("div"); trail.className = "wm-trail"; pic.appendChild(trail);
      wmEl.querySelectorAll(".wm-label").forEach(function (l) { l.classList.remove("here"); });
      say(N() + " flitzt los: " + WM_NAMES[to] + ".");
      function at(dist) { var k = 0; while (k < seg.length - 1 && dist > seg[k]) { dist -= seg[k]; k++; } var f = seg[k] ? Math.min(1, dist / seg[k]) : 1, a = pts[k], b = pts[k + 1]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, b[0] - a[0]]; }
      (function step(t) {
        var k = Math.min(1, (t - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, dist = e * len, p = at(dist);
        var hop = Math.abs(Math.sin(dist / 3.2)) * 2.2;
        mk.style.left = ((p[0] - 7) / WM.w * 100).toFixed(3) + "%"; mk.style.top = ((p[1] - 14 - hop) / WM.h * 100).toFixed(3) + "%";
        mk.classList.toggle("flip", p[2] < 0);
        if (dist - lastDot > 4.5) { lastDot = dist; var dot = document.createElement("i"); dot.style.left = (p[0] / WM.w * 100).toFixed(3) + "%"; dot.style.top = (p[1] / WM.h * 100).toFixed(3) + "%"; trail.appendChild(dot); }
        if (t - lastHop > 170 && k < 1) { lastHop = t; beep([[520 + Math.round(Math.sin(dist) * 60), .02]]); }
        if (k < 1) { requestAnimationFrame(step); return; }
        mk.classList.add("land"); beep([[659, .05], [784, .05], [1047, .09]]);
        setTimeout(resolve, 520);
      })(t0);
    });
  }
  // arriving: no walking through the rooms in between, just a quick fade and he is there
  async function warpTo(k) {
    if (typeof cafeOn !== "undefined" && cafeOn) closeCafe();
    if (H.where === "chair") await hopOutOfChair();
    else if (H.where === "tub") await hopOutOfTub();
    else if (H.where === "bed") await hopOutOfBed();
    else if (H.where === "jetty" || H.where === "ice" || H.where === "swim") H.where = null;
    fadeX(false); await wait(320);
    if (k === "garden") {
      showPlace("garden"); H.scale = HS; moveTo(GSPOT.home.x, GSPOT.home.y, 0); front({ eyes: "happy", mouth: "grin", paws: "up", blush: true }); fadeX(true);
      say(N() + " ist im Garten."); pulse("bighop", 620); await wait(650);
      setTimeout(function () { if (place2 === "garden" && !s.asleep) spawnVisitor(true); }, 800);
    } else if (k === "pond") {
      showPlace("pond"); moveTo(PSPOT.home.x, PSPOT.home.y, 0); front({ eyes: "happy", mouth: "smile" }); fadeX(true);
      say(N() + " ist am See."); await nibbleNose(4);
    } else if (k === "cafe") {
      showPlace("cafeout"); H.scale = HS; moveTo(92, 120, 0); front({ eyes: "happy", mouth: "grin" }); fadeX(true);
      say(N() + " ist beim Café.");
    }
  }
  window.__world = { where: function () { return place2; }, open: function () { mapBtn.click(); }, warp: function (k) { if (busy) interrupt(); return act("travel", function () { return warpTo(k); }); } };
