  // ===================== bedroom extras (preview): a goldfish bowl on the chest, the teddy comes along to bed =====================
  var BX = /*BEDX*/;
  Object.keys(BX).forEach(function (k) { A[k] = BX[k].svg; SZ[k] = [BX[k].w, BX[k].h]; FOOD[k] = k; });
  var TEDDY = { x: 63, y: 62 }, BOWL = { x: 133, y: 53 };   /* the teddy lives on the bed now, the aquarium sits in the middle of the chest */   // the bowl is a little aquarium now: 24 x 21
  // the chest is drawn without its teddy: the teddy is its own little sprite now
  var _bx_rba = renderBedroomArt;
  renderBedroomArt = function () {
    _bx_rba();
    /* the room is drawn in layers by house.js now (night stand, lamp and chest are pieces of their own) */
  };
  function bxEl(cls, parent, k, x, y) { var e = document.createElement("div"); e.className = cls; e.style.left = gx(x); e.style.top = gy(y); e.style.width = gx(SZ[k][0]); e.innerHTML = svgOf(A[k], SZ[k][0], SZ[k][1]); parent.appendChild(e); return e; }
  var teddyShelf = bxEl("bx-teddy", scene, "b_teddy", TEDDY.x, TEDDY.y); teddyShelf.classList.add("bx-onbed");
  var teddyBed = bxEl("bx-teddybed", scene, "b_teddy", 64, 75); teddyBed.hidden = true;
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
    act("fish", async function () { await walkTo(144, 118); H.dir = 1; front({ eyes: "wide", mouth: "open", paws: "up", ears: "up" }); await wait(350); aqOpen(); front({ eyes: "happy", mouth: "smile", paws: "down" }); });
  });
  // going to bed: first the teddy comes down from the chest, then both snuggle in
  var TEDDY_AT = [[63, 62], [60, 66], [60, 62], [60, 64], [60, 69], [62, 65], [60, 63], [60, 66]], teddyBedAt = -1;   /* where the teddy sits on each bed */
  function teddyState() { var inBed = !!(s.asleep && H.where === "bed"), bi = home.bedroom ? home.bedroom.bed : 0, at = TEDDY_AT[bi] || TEDDY_AT[0];
    if (teddyBedAt !== bi) { teddyBedAt = bi; TEDDY.x = at[0]; TEDDY.y = at[1]; teddyShelf.style.left = gx(at[0]); teddyShelf.style.top = gy(at[1]);
      teddyBed.style.left = gx(bi === 0 ? 64 : at[0]); teddyBed.style.top = gy(bi === 0 ? 75 : at[1]);
      var hit = bedEl.querySelector('.ix-hit[aria-label="Teddy"]'); if (hit) { hit.style.left = gx(at[0]); hit.style.top = gy(at[1]); } }
    teddyShelf.hidden = inBed || teddyCarry || place2 !== "bedroom"; teddyBed.hidden = !inBed || place2 !== "bedroom"; }
  var teddyCarry = false;
  var _bx_bedSleep = bedSleep;
  bedSleep = async function () { try { await _bx_bedSleep(); } finally { teddyState(); } };
  setInterval(teddyState, 600);
  window.__bx = { teddy: function () { return { shelf: !teddyShelf.hidden, bed: !teddyBed.hidden }; } };
