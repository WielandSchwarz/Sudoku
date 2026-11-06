  // ===================== bedroom extras (preview): a goldfish bowl on the chest, the teddy comes along to bed =====================
  var BX = /*BEDX*/;
  Object.keys(BX).forEach(function (k) { A[k] = BX[k].svg; SZ[k] = [BX[k].w, BX[k].h]; FOOD[k] = k; });
  var TEDDY = { x: 131, y: 50 }, BOWL = { x: 145, y: 51 };   // the bowl is a little aquarium now: 24 x 21
  // the chest is drawn without its teddy: the teddy is its own little sprite now
  var _bx_rba = renderBedroomArt;
  renderBedroomArt = function () {
    _bx_rba();
    var b = home.bedroom, art = document.getElementById("b-art");
    if (art) art.innerHTML = svgOf(["bw_" + b.wall + "_" + b.window, "bf_" + b.floor, "b_slope", "bwin_" + b.window, "br_" + b.rug, "b_front_nt"].map(function (k) { return A[k]; }).join(""), 180, 135);
  };
  function bxEl(cls, parent, k, x, y) { var e = document.createElement("div"); e.className = cls; e.style.left = gx(x); e.style.top = gy(y); e.style.width = gx(SZ[k][0]); e.innerHTML = svgOf(A[k], SZ[k][0], SZ[k][1]); parent.appendChild(e); return e; }
  var teddyShelf = bxEl("bx-teddy", bedEl, "b_teddy", TEDDY.x, TEDDY.y);
  var teddyBed = bxEl("bx-teddybed", scene, "b_teddy", 26, 75); teddyBed.hidden = true;
  renderBedroomArt();
  var bowlBtn = document.createElement("button"); bowlBtn.type = "button"; bowlBtn.className = "bx-bowl"; bowlBtn.setAttribute("aria-label", "Goldfisch füttern");
  bowlBtn.style.left = gx(BOWL.x); bowlBtn.style.top = gy(BOWL.y); bowlBtn.style.width = gx(24);
  bowlBtn.innerHTML = svgOf(A.b_bowl, 24, 21) + '<span class="bx-fish">' + svgOf(A.b_fish0, 9, 6) + '</span>';
  bedEl.appendChild(bowlBtn);
  var fishEl = bowlBtn.querySelector(".bx-fish"), fishF = 0;
  setInterval(function () { if (place2 !== "bedroom") return; fishF = 1 - fishF; fishEl.innerHTML = svgOf(A["b_fish" + fishF], 9, 6); }, 380);
  function bL() { var L = life(); return L; }
  // the goldfish swims where it is told: left/top in % of the bowl, face -1 = looking left (the sprite's own way), 1 = right
  function fishGo(l, t, face, ms) { fishEl.style.animation = "none"; fishEl.style.transition = "left " + ms + "ms steps(" + Math.max(2, Math.round(ms / 90)) + "), top " + ms + "ms steps(" + Math.max(2, Math.round(ms / 90)) + ")"; fishEl.style.left = l + "%"; fishEl.style.top = t + "%"; fishEl.style.transform = face > 0 ? "scaleX(-1)" : "scaleX(1)"; return wait(ms); }
  function fishFree() { fishEl.style.cssText = ""; }
  function blub(hi) { beep([[hi ? 880 : 620, .03], [hi ? 1180 : 820, .04]]); }
  function bubbles(n, x) { for (var b = 0; b < n; b++) (function (b) { setTimeout(function () { fx("drop", BOWL.x + x + (b % 2), BOWL.y + 7 - b, "up", 0.6); }, b * 160); })(b); }
  bowlBtn.addEventListener("click", function (e) {
    e.stopPropagation(); if (s.asleep || decor) return; if (busy && !interruptible()) return; if (busy) interrupt();
    act("fish", async function () {
      try {
        await walkTo(140, 118); H.dir = 1; front({ eyes: "wide", mouth: "open", paws: "up", ears: "up" }); await wait(300);
        var L = bL(), full = Date.now() - (L.fishFed || 0) < 3 * 3600e3;
        if (!full) {   // hungry: flakes first
          front({ paws: "hold", eyes: "happy", mouth: "grin" }); beep([[1047, .03], [1175, .03], [1319, .04]]);
          for (var k = 0; k < 6; k++) { var f = document.createElement("i"); f.className = "bx-flake"; f.style.left = gx(BOWL.x + 6 + (k * 3) % 12); f.style.top = gy(BOWL.y + 2); f.style.animationDelay = (k * 90) + "ms"; bedEl.appendChild(f); setTimeout(function (x) { x.remove(); }.bind(null, f), 1500); }
          await wait(400); await fishGo(30, 34, -1, 500); say("Flocken für den Goldfisch! Er schnappt sie sich."); blub(true); await wait(350); blub(true); await fishGo(46, 36, 1, 400); blub(true); await wait(500);
          L.fishFed = Date.now(); fx("heart", BOWL.x + 12, BOWL.y - 4, "up");
          front({ eyes: "happy", mouth: "grin", paws: "up", blush: true }); pulse("hop", 400); s.love = clamp(s.love + 3); renderNeeds(); await wait(700); front({ paws: "down" });
          if (window.SudokuSave) window.SudokuSave(); return;
        }
        // full: the two play. A tap on the glass, the fish comes over, follows the hamster's look from side to side, then jumps and splashes
        front({ eyes: "open", mouth: "smile", paws: "up" }); say(N() + " klopft an die Scheibe."); beep([[1400, .015]]); await wait(160); beep([[1400, .015]]);
        await fishGo(14, 46, -1, 450); blub(); bubbles(2, 6); await wait(350);
        for (var r = 0; r < 3; r++) {
          var right = r % 2 === 0;
          front({ eyes: right ? "look_r" : "look_l", paws: right ? "side_r" : "side_l", mouth: "smile" }); await wait(250);
          await fishGo(right ? 50 : 12, 40 + (r % 2) * 10, right ? 1 : -1, 520); blub(r === 2);
          await wait(200);
        }
        say("Der Goldfisch schwimmt " + N() + " überall hinterher!");
        front({ eyes: "happy", mouth: "grin", paws: "up" }); pulse("hop", 400); await wait(450);
        await fishGo(30, 36, -1, 300); await fishGo(28, -38, -1, 260); bubbles(3, 9); beep([[520, .05], [780, .06]]); await wait(120); await fishGo(26, 36, -1, 300);   // a leap out of the water
        for (var d = 0; d < 6; d++) fx("drop", H.x - 10 + d * 4, BOWL.y + 10 + (d % 2) * 3, "fall");
        beep([[300, .04], [240, .06]]); await wait(350);
        front({ eyes: "sleep", mouth: "open", paws: "cover", ears: "flat" }); pulse("shake", 500); await wait(650);
        front({ eyes: "happy", mouth: "grin", paws: "up", blush: true, ears: "up" }); say("Platsch! " + N() + " ist nass gespritzt und lacht."); fx("heart", BOWL.x + 4, BOWL.y - 6, "up"); fx("heart", H.x, headY() - 4, "up");
        s.love = clamp(s.love + 2); renderNeeds(); pulse("hop", 400); await wait(900); front({ paws: "down" });
        if (window.SudokuSave) window.SudokuSave();
      } finally { fishFree(); }
    });
  });
  // going to bed: first the teddy comes down from the chest, then both snuggle in
  function teddyState() { var inBed = !!(s.asleep && H.where === "bed"); teddyShelf.hidden = inBed || teddyCarry; teddyBed.hidden = !inBed || place2 !== "bedroom"; }
  var teddyCarry = false;
  var _bx_bedSleep = bedSleep;
  bedSleep = async function () {
    await walkTo(146, 118); H.dir = 1; front({ eyes: "happy", mouth: "smile", paws: "up" }); await wait(300);
    teddyCarry = true; teddyShelf.hidden = true; front({ hold: "b_teddy", holdScale: 1, paws: "hold", eyes: "happy", mouth: "smile", blush: true }); pulse("hop", 300);
    say(N() + " holt sich den Teddy."); await wait(700);
    try { await _bx_bedSleep(); } finally { teddyCarry = false; front({ hold: null }); teddyState(); }
  };
  setInterval(teddyState, 600);
  window.__bx = { teddy: function () { return { shelf: !teddyShelf.hidden, bed: !teddyBed.hidden }; } };
