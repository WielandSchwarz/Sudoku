
  // ---------------------------------------------------------------- Morse (lighthouse): a 1912 ship's wireless desk in close-up
  // Send: key the word on the card (short press = dit, long press = dah). Receive: a ship sends a word, pick which one it was.
  var moA = /*MORSEART*/;
  var moI = {}; Object.keys(moA).forEach(function (k) { var im = new Image(); im.src = moA[k]; moI[k] = im; });
  var MC = { A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--.." };
  var MO_LV = [{ w: "E" }, { w: "T" }, { w: "TEE" }, { w: "AN" }, { r: ["AN", "TEE", "NA"] }, { w: "MAI" }, { w: "SOS" }, { r: ["SOS", "MAI", "OMA"] },
    { w: "MEER" }, { w: "HAI" }, { r: ["HAI", "MEER", "SEE"] }, { w: "MOND" }, { w: "STERN" }, { r: ["STERN", "MOND", "NORD"] },
    { w: "HAFEN" }, { w: "ANKER" }, { r: ["ANKER", "HAFEN", "KAHN"] }, { w: "GASTON" }, { w: "HAMSTER" }, { r: ["GASTON", "HAMSTER", "GARTEN"] }];
  var moV = mPov("mo-pov", "Funkraum verlassen"), moS = null, moAC = null, DAH = 220, UNIT = 120;
  var moBar = xEl("div", "mo-bar", moV.el); moBar.hidden = true;
  function moOk(k) { var im = moI[k]; return im && im.complete && im.naturalWidth > 0; }
  function moTone(on, f) {
    try {
      if (!moAC) moAC = new (window.AudioContext || window.webkitAudioContext)();
      if (moAC.state === "suspended") moAC.resume();
      if (on) { if (moS && moS.osc) return; var o = moAC.createOscillator(), g = moAC.createGain(); o.type = "sine"; o.frequency.value = f || 640; g.gain.value = 0; g.gain.setTargetAtTime(.22, moAC.currentTime, .005); o.connect(g); g.connect(moAC.destination); o.start(); if (moS) moS.osc = [o, g]; }
      else if (moS && moS.osc) { var q = moS.osc; moS.osc = null; q[1].gain.setTargetAtTime(0, moAC.currentTime, .008); q[0].stop(moAC.currentTime + .06); }
    } catch (e) { }
  }
  function moBlip(f, ms) { try { if (!moAC) return; var o = moAC.createOscillator(), g = moAC.createGain(), t = moAC.currentTime; o.frequency.value = f; g.gain.setValueAtTime(.15, t); g.gain.exponentialRampToValueAtTime(.001, t + ms / 1000); o.connect(g); g.connect(moAC.destination); o.start(t); o.stop(t + ms / 1000 + .02); } catch (e) { } }
  // pixel text with the 5x7 font of the map signs
  function moTxt(c, s, x, y, col) { c.fillStyle = col; for (var i = 0; i < s.length; i++) { var g = PF[s[i]]; if (!g) { x += 4; continue; } var rows = g.split(","); rows.forEach(function (r, yy) { for (var xx = 0; xx < r.length; xx++) if (r[xx] === "1") c.fillRect(x + xx, y + yy, 1, 1); }); x += rows[0].length + 1; } return x; }
  function moTw(s) { var w = 0; for (var i = 0; i < s.length; i++) w += (PF[s[i]] ? PF[s[i]].split(",")[0].length : 3) + 1; return w - 1; }
  function moCw(code) { var w = 0; for (var i = 0; i < code.length; i++) w += (code[i] === "." ? 2 : 5) + 1; return Math.max(0, w - 1); }
  function moCode(c, code, x, y, n, col, done) {    // dits and dahs; the first n are done (green)
    for (var i = 0; i < code.length; i++) { var w = code[i] === "." ? 2 : 5; c.fillStyle = i < n ? done : col; c.fillRect(x, y, w, 2); x += w + 1; }
  }
  function moStart(lv) {
    var M = mL("morse"); lv = Math.max(0, Math.min(MO_LV.length - 1, lv == null ? (M.lvl || 0) : lv));
    var L = MO_LV[lv];
    moTone(false);
    moS = { lv: lv, send: !!L.w, word: L.w || L.r[0], opts: L.r ? L.r.slice() : null, i: 0, buf: "", err: 0, down: 0, flash: 0, ok: 0, pad: [], play: null, won: false, raf: moS && moS.raf };
    if (!moS.send) { moS.word = L.r[(lv * 7) % L.r.length]; moS.opts = L.r.slice().sort(); }
    moV.card.hidden = true; moBar.hidden = true; moV.el.classList.remove('mo-ch'); mBan(moV, (moS.send ? "Senden " : "Empfangen ") + (lv + 1));
    if (!moS.send) setTimeout(moPlay, 600);
  }
  function moPlay() {      // the ship sends the word: the key moves by itself, the pencil writes along
    if (!moS || moS.send || moS.play) return;
    var S = moS, seq = [], t = 0; moBar.hidden = true; S.pad = [];
    S.word.split("").forEach(function (ch, li) { MC[ch].split("").forEach(function (sym, k) { var d = (sym === "." ? 1 : 3) * UNIT * 1.4; seq.push([t, d, li, sym]); t += d + UNIT * 1.4; }); t += UNIT * 3; });
    S.play = { t0: performance.now(), seq: seq, k: 0, end: t };
  }
  function moPlayStep(now) {
    var P = moS.play, el = now - P.t0, on = false;
    P.seq.forEach(function (q, k) { if (el >= q[0] && el < q[0] + q[1]) on = true; if (el >= q[0] && k >= P.k) { P.k = k + 1; var li = q[2]; moS.pad[li] = (moS.pad[li] || "") + q[3]; } });
    if (on !== !!moS.down) { moS.down = on ? now : 0; moTone(on, 600); }
    if (el > P.end) { moS.play = null; moS.down = 0; moTone(false); moChoices(); }
  }
  function moChoices() {
    moBar.innerHTML = moS.opts.map(function (w) { return '<button type="button" class="fi-b2 mo-opt" data-w="' + w + '">' + w + '</button>'; }).join("") + '<button type="button" class="fi-b2 mo-again" aria-label="Nochmal hören">↻</button>';
    moBar.hidden = false; moV.el.classList.add('mo-ch');
  }
  moBar.addEventListener("click", function (e) {
    e.stopPropagation(); var b = e.target.closest("button"); if (!b || !moS) return;
    if (b.classList.contains("mo-again")) { moPlay(); return; }
    if (b.dataset.w === moS.word) { moBar.hidden = true; moS.i = moS.word.length; moWin(); }
    else { moS.err++; b.disabled = true; moBlip(160, 260); }
  });
  function moKey(down) {
    if (!moS || !moS.send || moS.won) return;
    var now = performance.now();
    if (down) { moS.down = now; moTone(true); return; }
    if (!moS.down) return;
    var d = now - moS.down; moS.down = 0; moTone(false);
    var sym = d < DAH ? "." : "-", want = MC[moS.word[moS.i]];
    moS.buf += sym; moS.pad.push(sym);
    if (want.indexOf(moS.buf) !== 0) { moS.err++; moS.buf = ""; moS.flash = now; moS.pad = []; setTimeout(function () { moBlip(160, 260); }, 40); return; }
    if (moS.buf === want) {
      moS.buf = ""; moS.i++; moS.ok = now; moS.pad = [];
      setTimeout(function () { moBlip(1050, 120); }, 60);
      if (moS.i >= moS.word.length) setTimeout(moWin, 500);
    }
  }
  function moStarsN(err) { return err === 0 ? 3 : err <= 2 ? 2 : 1; }
  function moWin() {
    if (!moS || moS.won) return; moS.won = true;
    var M = mL("morse"), st = moStarsN(moS.err); M.best = M.best || {}; M.best[moS.lv] = Math.max(M.best[moS.lv] || 0, st);
    M.lvl = Math.max(M.lvl || 0, Math.min(MO_LV.length - 1, moS.lv + 1));
    if (typeof s !== "undefined" && s.fun != null) { s.fun = clamp(s.fun + 6); if (typeof renderNeeds === "function") renderNeeds(); }
    if (window.SudokuSave) window.SudokuSave();
    [660, 880, 1100].forEach(function (f, i) { setTimeout(function () { moBlip(f, 140); }, i * 130); });
    var next = moS.lv + 1 < MO_LV.length;
    moV.card.innerHTML = '<div class="fi-c"><p class="fi-h">' + (moS.send ? moS.word + " ist angekommen!" : "Richtig: " + moS.word + "!") + '</p>' + mStars(st) +
      '<div class="fi-row"><button type="button" class="fi-b2" data-a="again">Nochmal</button>' + (next ? '<button type="button" class="fi-b" data-a="next">Weiter</button>' : '<button type="button" class="fi-b" data-a="list">Alle</button>') + '</div></div>';
    moV.card.hidden = false;
  }
  function moPick() {
    var M = mL("morse"), open = Math.min(MO_LV.length - 1, M.lvl || 0);
    moV.card.innerHTML = '<div class="fi-c hb-pick"><p class="fi-h">Welche Nachricht?</p><div class="hb-lvs">' + MO_LV.map(function (q, i) {
      return '<button type="button" class="rp-lv' + (i === open ? " on" : "") + '" data-lv="' + i + '"' + (i > open ? " disabled" : "") + '><b>' + (i + 1) + '</b>' + (i <= open ? mStars((M.best && M.best[i]) || 0) : "") + '</button>'; }).join("") + '</div></div>';
    moV.card.hidden = false; moBar.hidden = true;
  }
  moV.card.addEventListener("click", function (e) {
    e.stopPropagation(); var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.lv != null) { moStart(+b.dataset.lv); return; }
    if (b.dataset.a === "again") moStart(moS.lv); else if (b.dataset.a === "next") moStart(moS.lv + 1); else if (b.dataset.a === "list") moPick(); else moClose();
  });
  moV.cv.addEventListener("pointerdown", function (e) { if (moS && moS.send) { e.preventDefault(); try { moV.cv.setPointerCapture(e.pointerId); } catch (er) { } moKey(true); } });
  moV.cv.addEventListener("pointerup", function () { moKey(false); });
  moV.cv.addEventListener("pointercancel", function () { moKey(false); });
  moV.cv.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  function moDraw(now) {
    var c = moV.c, S = moS; if (!S) return;
    if (S.play) moPlayStep(now);
    c.clearRect(0, 0, 180, 135);
    if (moOk("mo_bg")) c.drawImage(moI.mo_bg, 0, 0);
    var dn = !!S.down; if (moOk(dn ? "mo_dn" : "mo_up")) c.drawImage(moI[dn ? "mo_dn" : "mo_up"], 0, 0);
    var INK = "#3a2414", DONE = "#3e8a4a", RED = "#c8403a", DIM = "#b8a888";
    if (S.send) {      // the card: the word, each letter with its code underneath
      var cols = S.word.split("").map(function (ch) { return Math.max(moTw(ch), moCw(MC[ch])); }), gap = 5, tw = cols.reduce(function (a, b) { return a + b; }, 0) + gap * (cols.length - 1), x = Math.round(90 - tw / 2);
      var fl = S.flash && now - S.flash < 450;
      S.word.split("").forEach(function (ch, i) {
        var w = cols[i], cur = i === S.i, col = i < S.i ? DONE : cur ? (fl ? RED : INK) : DIM;
        moTxt(c, ch, x + Math.round((w - moTw(ch)) / 2), 18, col);
        moCode(c, MC[ch], x + Math.round((w - moCw(MC[ch])) / 2), 30, i < S.i ? 99 : cur ? S.buf.length : 0, i < S.i ? DONE : cur ? INK : DIM, DONE);
        if (cur && !S.won) mR(c, x, 36, w, 1, fl ? RED : "#d8a840");
        x += w + gap;
      });
      if (S.down && now - S.down >= DAH) mR(c, 85, 44, 10, 2, "#d8a840"); else if (S.down) mR(c, 89, 44, 2, 2, "#d8a840");   // what the key is making right now
    } else {           // receive: the code table of every letter in the three words
      var letters = []; S.opts.join("").split("").forEach(function (ch) { if (letters.indexOf(ch) < 0) letters.push(ch); }); letters.sort();
      var per = Math.ceil(letters.length / 2);
      letters.forEach(function (ch, i) { var cx = 36 + Math.floor(i / per) * 58, cy = 13 + (i % per) * 9 * (per > 4 ? .9 : 1); moTxt(c, ch, cx, Math.round(cy), INK); moCode(c, MC[ch], cx + 9, Math.round(cy) + 3, 0, INK, INK); });
    }
    // the notepad: pencil marks of what was keyed (send: current letter; receive: one line per letter)
    var lines = S.send ? [S.pad.join("")] : S.pad, ly = 105;
    lines.forEach(function (code) { if (!code) { ly += 6; return; } moCode(c, code.slice(0, 5), 9, ly, 0, "#4a4a5a", "#4a4a5a"); ly += 6; });
    if (S.send && S.ok && now - S.ok < 500) { c.fillStyle = "#ffe9a0"; c.fillRect(150 - 2, 92, 1, 1); }
    S.raf = requestAnimationFrame(moDraw);
  }
  function moOpen(lv) { moV.el.hidden = false; moStart(lv); cancelAnimationFrame(moS.raf); moS.raf = requestAnimationFrame(moDraw); }
  function moOpenPick() { moOpen(); moPick(); }
  function moClose() { moTone(false); if (moS) cancelAnimationFrame(moS.raf); moS = null; moV.el.hidden = true; moBar.hidden = true; }
  moV.el.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); moClose(); });
  // the lighthouse at the lake: tap it to climb up to the wireless room
  (function () {
    var hot = document.createElement("button"); hot.type = "button"; hot.className = "l-hot mo-lh"; hot.setAttribute("aria-label", "Leuchtturm");
    hot.style.cssText = "left:74%;top:30%;width:10%;height:28%";
    pondUi.insertBefore(hot, pondUi.firstChild);
    hot.addEventListener("click", function (e) { e.stopPropagation(); if (typeof busy !== "undefined" && busy && typeof interruptible === "function" && !interruptible()) return; if (busy && typeof interrupt === "function") interrupt(); moOpenPick(); });
  })();
  window.__morse = { open: moOpen, key: moKey, st: function () { return moS && { lv: moS.lv, word: moS.word, i: moS.i, err: moS.err, won: moS.won, send: moS.send }; } };
