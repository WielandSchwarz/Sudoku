  // ---- garden bed without signs: tap the soil, ripe plants sparkle, a small info card on tap (preview) ----
  var _g2_render = renderBed;
  renderBed = function () {
    _g2_render();
    gEl("g-signs").innerHTML = "";
    var b = bedItem(), el = gEl("slot-bed"), h = "";
    garden.plots.forEach(function (p, i) {
      if (!p || stage(p) !== 3) return;
      var cz = SZ["crop_" + p.crop + "3"] || [12, 20], cx = 12 + i * 21, top = b.soil + 4 - cz[1];
      [[-cz[0] / 2 - 3, top + 1, 0], [cz[0] / 2 - 3, top - 3, 0.55], [cz[0] / 2 - 4, top + cz[1] * 0.5, 1.1], [-cz[0] / 2, top + cz[1] * 0.4, 1.6]].forEach(function (q) {
        h += '<i class="g2-spark" style="left:' + ((cx + q[0]) / b.w * 100) + '%;top:' + (q[1] / b.h * 100) + '%;width:' + (7 / b.w * 100) + '%;animation-delay:' + q[2] + 's"></i>';
      });
    });
    el.insertAdjacentHTML("beforeend", h);
  };
  var _g2_tap = plotTap;
  plotTap = function (i) {
    var p = garden.plots[i];
    if (decor || !p || stage(p) === 3) return _g2_tap(i);
    var wet = p.wetUntil > Date.now(), ic = svgOf(A["f_" + p.crop], SZ["f_" + p.crop][0], SZ["f_" + p.crop][1]);
    openPop('<p class="g2-name">' + ic + '<span>' + CROPS[p.crop].name + '</span></p>' +
      '<span class="g2-bar">' + pixBarSvg(p.prog, 50) + '</span>' +
      '<p class="g2-time">Noch ' + fmtH(hoursLeft(p)) + (wet ? '<i class="g2-drop" title="Gegossen"></i>' : "") + '</p>' +
      (wet ? "" : '<button type="button" class="pbtn" data-a="water">Gießen</button>'), plotX(i), GL.bed.bottom - 20, "g2-info").addEventListener("click", function (e) {
      if (!e.target.closest('[data-a="water"]')) return; closePop();
      if (s.asleep) { say(N() + " schläft gerade."); return; }
      if (busy && !interruptible()) return; if (busy) interrupt();
      act("water", function () { return waterSeq(i); });
    });
  };
  if (typeof place2 !== "undefined" && place2 === "garden") renderBed();
  window.__life = life; window.__renderGH = function () { renderGH(); };
  // ---- greenhouse: planters in the garden-bed style, no "+" marks, sparkles when ripe, info card on tap, spray bottle ----
  var GH2 = /*GH2*/;
  A.gh_in = GH2.gh_in.svg; A.gh_spray = GH2.gh_spray.svg; SZ.gh_spray = [9, 16];
  ghBg.innerHTML = svgOf(A.gh_in, 180, 135);
  var spraying = false;
  var _g2_renderGH = renderGH;
  renderGH = function () {
    _g2_renderGH();
    var L = life();
    [].forEach.call(ghUi.querySelectorAll(".l-ghe"), function (e) { e.remove(); });
    GHX.forEach(function (x, i) {
      var p = L.gh[i]; if (!p || stage(p) !== 3) return;
      [[-17, 78, 0], [-4, 74, .5], [9, 80, 1], [15, 88, 1.5], [-11, 90, .8]].forEach(function (q) {
        ghUi.insertAdjacentHTML("beforeend", '<i class="g2-spark" style="left:' + gx(x + q[0]) + ';top:' + gy(q[1]) + ';width:' + gx(7) + '"></i>');
      });
    });
    ghUi.insertAdjacentHTML("beforeend", '<button type="button" class="g2-spray' + (spraying ? " taken" : "") + '" data-a="spray" style="left:' + gx(166) + ';top:' + gy(73) + ';width:' + gx(9) + ';height:' + gy(16) + '" aria-label="Sprühflasche">' + svgOf(A.gh_spray, 9, 16) + '</button>');
  };
  // growing plants: a small card instead of the old text popup; spray bottle: spray every planted box once
  ghUi.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b || decor) return;
    if (b.dataset.a === "spray") { e.stopImmediatePropagation(); closeLPop(); if (s.asleep) { say(N() + " schläft gerade."); return; } if (busy && !interruptible()) return; if (busy) interrupt(); act("ghspray", sprayAll); return; }
    if (!b.classList.contains("l-ghbox")) return;
    var p = life().gh[+b.dataset.i]; if (!p || stage(p) === 3) return;
    e.stopImmediatePropagation();
    var ic = A["f_" + p.crop] ? svgOf(A["f_" + p.crop], SZ["f_" + p.crop][0], SZ["f_" + p.crop][1]) : "";
    openLPop(ghEl, '<p class="g2-name">' + ic + '<span>' + CROPS[p.crop].name + '</span></p><span class="g2-bar">' + pixBarSvg(p.prog, 50) + '</span><p class="g2-time">Noch ' + fmtH((1 - p.prog) * CROPS[p.crop].hours) + '</p>', GHX[+b.dataset.i], 48, "g2-info");
  }, true);
  async function sprayAll() {
    var L = life(), todo = [];
    L.gh.forEach(function (p, i) { if (p && stage(p) !== 3) todo.push(i); });
    if (!todo.length) { say(L.gh.some(function (p) { return p; }) ? "Alles ist schon reif." : "Im Gewächshaus wächst gerade nichts."); return; }
    spraying = true; renderGH();
    await walkTo(160, 122); front({ paws: "hold", eyes: "happy" }); await wait(300);
    var held = lEl("div", "g2-held", ghEl, svgOf(A.gh_spray, 9, 16)), keep = null;
    try {
      for (var n = 0; n < todo.length; n++) {
        var i = todo[n]; held.style.display = "none"; await walkTo(GHX[i], 122);
        backFrame(0); keep = setInterval(function () { if (H.sprite !== "back") backFrame(0); }, 200);
        held.style.display = ""; held.style.left = gx(GHX[i] + 11); held.style.top = gy(68); held.style.transform = "rotate(-20deg)"; held.style.width = gx(9);
        for (var k = 0; k < 3; k++) {
          held.classList.remove("puff"); void held.offsetWidth; held.classList.add("puff"); beep([[900 + k * 60, .03]]);
          for (var q = 0; q < 7; q++) { var d = lEl("i", "g2-mist", ghEl); d.style.left = gx(GHX[i] - 16 + Math.random() * 32); d.style.top = gy(64 + Math.random() * 16); d.style.animationDelay = (Math.random() * .2).toFixed(2) + "s"; (function (dd) { setTimeout(function () { dd.remove(); }, 900); })(d); }
          backFrame(k % 2); await wait(380);
        }
        clearInterval(keep); keep = null;
        var p = L.gh[i]; if (p) p.prog = Math.min(1, p.prog + 0.25);
        renderGH(); held.style.display = "none";
        await wait(200);
      }
    } finally {
      if (keep) clearInterval(keep);
      held.remove(); spraying = false; renderGH(); front({ eyes: "happy", mouth: "smile", paws: "down" });
    }
    say(N() + " hat alles eingesprüht. Die Pflanzen wachsen ein gutes Stück.");
    if (typeof SudokuSave === "function") SudokuSave();
  }
