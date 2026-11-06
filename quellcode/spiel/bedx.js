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
  bowlBtn.addEventListener("click", function (e) {   // the hamster goes over and looks in: the aquarium up close
    e.stopPropagation(); if (s.asleep || decor) return; if (busy && !interruptible()) return; if (busy) interrupt();
    act("fish", async function () { await walkTo(140, 118); H.dir = 1; front({ eyes: "wide", mouth: "open", paws: "up", ears: "up" }); await wait(350); aqOpen(); front({ eyes: "happy", mouth: "smile", paws: "down" }); });
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
