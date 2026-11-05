  // ===================== frog tower at the lake (preview): bring all frogs from the left stone to the right one, never a big frog on a small one =====================
  var FRG = /*FROGART*/;
  Object.keys(FRG).forEach(function (k) { if (FRG[k].svg) { A[k] = FRG[k].svg; SZ[k] = [FRG[k].w, FRG[k].h]; } });
  var FG_PADX = [34, 90, 146], FG_PADY = 113;
  var fg = xEl("div", "bee-pov fg-pov", scene); fg.hidden = true;
  fg.innerHTML = '<img class="fg-bg" alt=""><svg class="bp-svg fg-svg" viewBox="0 0 180 135" shape-rendering="crispEdges" aria-hidden="true"><g class="fg-frogs"></g><g class="fg-fx"></g></svg>' +
    '<b class="bp-ban fg-ban"></b><button type="button" class="bp-x fg-x" aria-label="Froschspiel beenden">×</button>';
  var fgSvg = fg.querySelector(".fg-svg"), fgFrogs = fg.querySelector(".fg-frogs"), fgFx = fg.querySelector(".fg-fx"), fgOpen = false, fgAbort = null;
  function fgEnv() {
    var el = fg.querySelector(".bp-env"); if (!el) { el = document.createElement("div"); el.className = "bp-env"; fg.insertBefore(el, fg.querySelector(".fg-ban")); var h = ""; for (var i = 0; i < 60; i++) h += '<i style="left:' + (Math.random() * 125).toFixed(1) + '%;animation-delay:-' + (Math.random() * 5).toFixed(2) + 's"></i>'; el.innerHTML = h; }
    var w = typeof weather !== "undefined" ? weather.type : "sun", ph = typeof daylight === "function" ? daylight() : "day";
    el.className = "bp-env w-" + w + " d-" + ph;
  }
  function fgPt(ev) { var r = fgSvg.getBoundingClientRect(); return { x: (ev.clientX - r.left) / r.width * 180, y: (ev.clientY - r.top) / r.height * 135 }; }
  function fgCol(x) { return x < 62 ? 0 : x < 118 ? 1 : 2; }
  function frogGame(n) {
    return new Promise(function (resolve) {
      var se = season(); fg.querySelector(".fg-bg").src = FRG["fr_bg_" + (se === "winter" ? "autumn" : se)].png;
      fg.hidden = false; fgOpen = true; fgEnv();
      var ban = fg.querySelector(".fg-ban"); ban.textContent = "Froschturm"; ban.classList.remove("pop"); void ban.offsetWidth; ban.classList.add("pop");
      var sizes = { 3: [5, 3, 1], 4: [5, 4, 2, 1], 5: [5, 4, 3, 2, 1] }[n] || [5, 3, 1];   // clearly different sizes, the biggest at the bottom
      var stacks = [sizes.slice(), [], []], sel = null, fly = null, shake = null, blink = {}, croak = {}, moves = 0, done = false, ripples = [], downCol = null, downSel = false, t0 = performance.now();
      function spot(col, idx) {                                                  // where frog number idx (from the bottom) sits on a rest
        var y = FG_PADY + 2;
        for (var i = 0; i < idx; i++) { var s = stacks[col][i], h = SZ["fr_" + s + "_sit"][1]; y -= h - Math.round(h * 0.42); }
        return y;
      }
      function sprite(s, pose, x, yBottom, extra) {
        var k = "fr_" + s + "_" + pose, w = SZ[k][0], h = SZ[k][1];
        return '<g transform="translate(' + Math.round(x - w / 2) + ' ' + Math.round(yBottom - h) + ')"' + (extra || "") + '>' + A[k] + '</g>';
      }
      function render(t) {
        var o = "";
        stacks.forEach(function (st, c) {
          st.forEach(function (s, i) {
            if (fly && fly.s === s) return;
            var yb = spot(c, i), x = FG_PADX[c], pose = blink[s] > t ? "blink" : croak[s] > t ? "croak" : "sit";
            if (sel && sel.col === c && i === st.length - 1) { yb -= 7 + (Math.floor(t / 220) % 2); pose = "croak"; }
            if (shake && shake.s === s && t < shake.until) x += (Math.floor(t / 50) % 2 ? 2 : -2);
            o += sprite(s, pose, x, yb);
          });
        });
        if (sel && !fly) {                                                       // a fine golden twinkle over the frog that is picked up
          var st2 = stacks[sel.col], yb2 = spot(sel.col, st2.length - 1) - 7, hh = SZ["fr_" + sel.s + "_sit"][1];
          [[-1, 0], [1, 300], [0, 600]].forEach(function (q) { var on = Math.floor((t + q[1]) / 300) % 3 === 0; if (on) { var sx = FG_PADX[sel.col] + q[0] * (SZ["fr_" + sel.s + "_sit"][0] / 2 + 2), sy = yb2 - hh - 2 + Math.abs(q[0]) * 6; var u = ((t + q[1]) % 900) / 300, R = u < .33 || u > .66 ? 2 : 3; o += '<rect x="' + sx + '" y="' + (sy - R) + '" width="1" height="' + (2 * R + 1) + '" fill="#ffd34a"/><rect x="' + (sx - R) + '" y="' + sy + '" width="' + (2 * R + 1) + '" height="1" fill="#ffd34a"/>' + (R === 3 ? '<rect x="' + (sx - 1) + '" y="' + (sy - 1) + '" width="3" height="3" fill="#ffd34a"/><rect x="' + sx + '" y="' + (sy - 1) + '" width="1" height="3" fill="#fff"/><rect x="' + (sx - 1) + '" y="' + sy + '" width="3" height="1" fill="#fff"/>' : '<rect x="' + sx + '" y="' + sy + '" width="1" height="1" fill="#fff"/>'); } });
        }
        if (fly) {
          var k2 = Math.min(1, (t - fly.t0) / fly.dur), e = k2, x2 = fly.x0 + (fly.x1 - fly.x0) * e, y2 = fly.y0 + (fly.y1 - fly.y0) * e - Math.sin(k2 * Math.PI) * fly.hgt;
          o += sprite(fly.s, k2 < 0.85 ? "jump" : "sit", x2, y2, fly.x1 < fly.x0 ? ' transform-origin="center"' : "");
          if (k2 >= 1) { var f = fly; fly = null; f.done(); }
        }
        fgFrogs.innerHTML = o;
        var fx = "";
        ripples = ripples.filter(function (r) { return t - r.t0 < 900; });
        ripples.forEach(function (r) { var k3 = (t - r.t0) / 900, rx = 4 + k3 * 14, ry = rx * 0.3, op = (1 - k3).toFixed(2);
          for (var a = 0; a < 24; a++) { var an = a / 24 * Math.PI * 2; fx += '<rect x="' + Math.round(r.x + Math.cos(an) * rx) + '" y="' + Math.round(r.y + Math.sin(an) * ry) + '" width="1" height="1" fill="#e6f4fc" opacity="' + op + '"/>'; } });
        // a dragonfly darts about above the water, now and then a fish rises and leaves rings
        var dq = t / 1000, dx = 90 + Math.sin(dq * .7) * 70 + Math.sin(dq * 2.3) * 8, dy = 70 + Math.sin(dq * 1.1) * 10 + Math.sin(dq * 3.7) * 3, dfx = Math.round(dx), dfy = Math.round(dy), dir = Math.cos(dq * .7) >= 0 ? 1 : -1, wing = Math.floor(t / 40) % 2;
        fx += '<g transform="translate(' + dfx + ' ' + dfy + ') scale(' + dir + ' 1)"><rect x="-6" y="0" width="8" height="1" fill="#2e6ab0"/><rect x="2" y="-1" width="2" height="2" fill="#2e6ab0"/><rect x="3" y="-1" width="1" height="1" fill="#3a2414"/>' +
          (wing ? '<rect x="-2" y="-3" width="2" height="3" fill="#e6f4fc" opacity=".8"/><rect x="0" y="-3" width="2" height="3" fill="#e6f4fc" opacity=".8"/>' : '<rect x="-4" y="-1" width="3" height="1" fill="#e6f4fc" opacity=".8"/><rect x="1" y="1" width="3" height="1" fill="#e6f4fc" opacity=".8"/>') + '</g>';
        if (Math.random() < 0.004) ripples.push({ x: 10 + Math.random() * 160, y: 96 + Math.random() * 34, t0: t });
        fgFx.innerHTML = fx;
        // idle life: blinking and croaking now and then
        if (Math.random() < 0.012) { var any = stacks[Math.floor(Math.random() * 3)]; if (any.length) blink[any[Math.floor(Math.random() * any.length)]] = t + 160; }
        if (Math.random() < 0.004) { var any2 = stacks[Math.floor(Math.random() * 3)]; if (any2.length) { croak[any2[any2.length - 1]] = t + 500; beep([[140, .05], [110, .07]]); } }
      }
      var raf = 0; (function lp(t) { if (!fgOpen) return; render(t); raf = requestAnimationFrame(lp); })(performance.now());
      function jump(s, c0, c1, cb) {
        var i0 = stacks[c0].length, y0 = spot(c0, i0 - 1) - 7;
        stacks[c0].pop(); var y1 = spot(c1, stacks[c1].length);
        fly = { s: s, x0: FG_PADX[c0], y0: y0, x1: FG_PADX[c1], y1: y1, t0: performance.now(), dur: 420 + Math.abs(c1 - c0) * 120, hgt: 26 + Math.abs(c1 - c0) * 8, done: function () { stacks[c1].push(s); ripples.push({ x: FG_PADX[c1], y: FG_PADY + 6, t0: performance.now() }); beep([[520, .03], [780, .05]]); cb && cb(); } };
        beep([[300, .03], [460, .04]]);
      }
      function tryMove(c1) {
        var c0 = sel.col, s = sel.s, top = stacks[c1][stacks[c1].length - 1]; sel = null;
        if (c1 === c0) return;
        if (top != null && top < s) { shake = { s: s, until: performance.now() + 450 }; croak[top] = performance.now() + 600; beep([[180, .06], [140, .08]]); return; }
        moves++; jump(s, c0, c1, function () { if (stacks[2].length === sizes.length) win(); });
      }
      function win() {
        if (done) return; done = true; var order = stacks[2].slice().reverse(), k = 0;
        ban.textContent = "Geschafft!"; ban.classList.remove("pop"); void ban.offsetWidth; ban.classList.add("pop");
        beep([[660, .06], [880, .06], [990, .1]]);
        (function next() {                                                         // one after another, each frog leaps happily into the water
          if (!fgOpen) return;
          if (k >= order.length) { setTimeout(function () { end(true, moves === Math.pow(2, n) - 1); }, 700); return; }
          var s = order[k++], tx = 20 + Math.random() * 140, ty = 124 + Math.random() * 6, c = 2;
          var i0 = stacks[2].length; stacks[2].pop();
          fly = { s: s, x0: FG_PADX[2], y0: spot(2, i0 - 1), x1: tx, y1: ty + 8, t0: performance.now(), dur: 520, hgt: 30, done: function () { ripples.push({ x: tx, y: ty, t0: performance.now() }); beep([[240, .05], [180, .06]]); setTimeout(next, 220); } };
        })();
      }
      fgSvg.onpointerdown = function (ev) {
        if (fly || done) return; ev.preventDefault();
        var c = fgCol(fgPt(ev).x); downCol = c; downSel = false;
        if (!sel) { if (stacks[c].length) { sel = { col: c, s: stacks[c][stacks[c].length - 1] }; downSel = true; croak[sel.s] = 0; beep([[420, .03]]); } }
        try { fgSvg.setPointerCapture(ev.pointerId); } catch (x) {}
      };
      fgSvg.onpointerup = function (ev) {
        if (fly || done || downCol == null) return;
        var c = fgCol(fgPt(ev).x);
        if (sel && (!downSel || c !== downCol)) tryMove(c);                      // tap the target, or drag the frog over and let go
        downCol = null;
      };
      function end(ok, perfect) {
        if (!fgOpen) return; fgOpen = false; cancelAnimationFrame(raf); fgSvg.onpointerdown = fgSvg.onpointerup = null; fg.hidden = true; fgAbort = null; resolve({ ok: ok, perfect: perfect, n: n });
      }
      fg.querySelector(".fg-x").onclick = function () { end(false); };
      fgAbort = function () { end(false); };
    });
  }
  // ---- the frog on its lily pad at the lake: tap it to play ----
  var fgLake = lBtn("l-frog", pondUi, '<svg class="f0" viewBox="0 0 16 9" aria-hidden="true" shape-rendering="crispEdges">' + A.fr_lake0 + '</svg><svg class="f1" viewBox="0 0 16 9" aria-hidden="true" shape-rendering="crispEdges">' + A.fr_lake1 + '</svg>', "Frosch");
  function fgLakeShow() { fgLake.hidden = season() === "winter"; }
  fgLakeShow(); setInterval(fgLakeShow, 60000);
  fgLake.addEventListener("click", function (e) {
    e.stopPropagation(); if (s.asleep || season() === "winter") return;
    if (busy && !interruptible()) return; if (busy) interrupt();
    act("frog", async function () {
      await walkTo(PSPOT.reed.x - 6, PSPOT.reed.y); front({ eyes: "happy", mouth: "grin", paws: "up" }); pulse("hop", 400);
      var L = life(), n = await fgAskLevel(); if (!n) { front({ paws: "down" }); return; }
      say(N() + " spielt Froschturm mit " + n + " Fröschen."); await wait(700);
      var r = await frogGame(n);
      if (r.ok) {
        var gr_ = seedOrFurn(null, r.perfect ? 3 : 2), c = gr_.seed, got = gr_.n;
        L.frogBest = Math.max(L.frogBest || 0, n);
        front({ eyes: "happy", mouth: "grin", paws: "up", blush: true }); pulse("bighop", 600);
        if (typeof itemPop === "function") { if (c) itemPop({ k: "seed_" + c, title: "Die Frösche schenken dir " + got + " × " + CROPS[c].name + "-Samen!" }); else if (gr_.furn) itemPop({ art: furnIcon(gr_.furn), title: "Die Frösche schenken dir: " + gr_.furn.name + "!" }); else say("Die Frösche quaken zufrieden. Dein Samenlager ist schon voll."); }
        if (typeof SudokuSave === "function") SudokuSave();
      } else say("Die Frösche hüpfen davon.");
      front({ paws: "down" });
    });
  });
  // three levels: 3, 4 or 5 frogs
  function fgAskLevel() {
    return new Promise(function (res) {
      var L = life(), best = L.frogBest || 0;
      var pp = openLPop(pondEl, '<p class="ph">Wie viele Frösche?</p><div class="l-wchoice fg-lv">' + [3, 4, 5].map(function (k) { return '<button type="button" class="pbtn" data-n="' + k + '">' + k + ' Frösche' + (best >= k ? " ✓" : "") + '</button>'; }).join("") + '</div>', 90, 26, "l-wpop");
      var done = false;
      pp.addEventListener("click", function (ev) { var b = ev.target.closest("[data-n]"); if (!b || done) return; done = true; closeLPop(); res(+b.dataset.n); });
      var iv = setInterval(function () { if (!pp.parentNode && !done) { done = true; clearInterval(iv); res(0); } else if (done) clearInterval(iv); }, 300);
    });
  }
  var _fg_interrupt = interrupt;
  interrupt = function () { if (fgOpen && fgAbort) fgAbort(); return _fg_interrupt.apply(this, arguments); };
  window.__frog = { open: function (n) { return frogGame(n || 3); }, state: function () { return { open: fgOpen }; } };
