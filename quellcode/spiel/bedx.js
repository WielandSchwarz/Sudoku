  // ===================== bedroom extras (preview): a goldfish bowl on the chest, the teddy comes along to bed =====================
  var BX = /*BEDX*/;
  Object.keys(BX).forEach(function (k) { A[k] = BX[k].svg; SZ[k] = [BX[k].w, BX[k].h]; FOOD[k] = k; });
  var TEDDY = { x: 135, y: 50 }, BOWL = { x: 151, y: 57 };
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
  bowlBtn.style.left = gx(BOWL.x); bowlBtn.style.top = gy(BOWL.y); bowlBtn.style.width = gx(16);
  bowlBtn.innerHTML = svgOf(A.b_bowl, 16, 15) + '<span class="bx-fish">' + svgOf(A.b_fish0, 7, 5) + '</span>';
  bedEl.appendChild(bowlBtn);
  var fishEl = bowlBtn.querySelector(".bx-fish"), fishF = 0;
  setInterval(function () { if (place2 !== "bedroom") return; fishF = 1 - fishF; fishEl.innerHTML = svgOf(A["b_fish" + fishF], 7, 5); }, 380);
  function bL() { var L = life(); return L; }
  bowlBtn.addEventListener("click", function (e) {
    e.stopPropagation(); if (s.asleep || decor) return; if (busy && !interruptible()) return; if (busy) interrupt();
    act("fish", async function () {
      await walkTo(140, 118); H.dir = 1; front({ eyes: "wide", mouth: "open", paws: "up", ears: "up" }); await wait(300);
      var L = bL(), full = Date.now() - (L.fishFed || 0) < 3 * 3600e3;
      if (full) {
        fishEl.classList.add("bx-up"); for (var b = 0; b < 3; b++) { fx("drop", BOWL.x + 6 + b, BOWL.y + 4 - b * 2, "up", 0.6); await wait(220); }
        say("Der Goldfisch ist noch satt und macht Blubberblasen."); front({ eyes: "happy", mouth: "smile", paws: "down" }); await wait(1200); fishEl.classList.remove("bx-up"); return;
      }
      front({ paws: "hold", eyes: "happy", mouth: "grin" }); beep([[1047, .03], [1175, .03], [1319, .04]]);
      for (var k = 0; k < 6; k++) { var f = document.createElement("i"); f.className = "bx-flake"; f.style.left = gx(BOWL.x + 4 + (k * 3) % 9); f.style.top = gy(BOWL.y - 2); f.style.animationDelay = (k * 90) + "ms"; bedEl.appendChild(f); setTimeout(function (x) { x.remove(); }.bind(null, f), 1500); }
      await wait(500); fishEl.classList.add("bx-up"); say("Flocken für den Goldfisch! Er schnappt sie sich."); await wait(1100);
      fishEl.classList.remove("bx-up"); L.fishFed = Date.now(); fx("heart", BOWL.x + 8, BOWL.y - 2, "up");
      front({ eyes: "happy", mouth: "grin", paws: "up", blush: true }); pulse("hop", 400); s.love = clamp(s.love + 3); renderNeeds(); await wait(700); front({ paws: "down" });
      if (window.SudokuSave) window.SudokuSave();
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
