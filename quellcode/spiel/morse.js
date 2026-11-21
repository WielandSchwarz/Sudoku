
  // ---------------------------------------------------------------- Morse (lighthouse): a 1912 ship's wireless desk in close-up
  // Random radio conversations in three levels: a ship sends, you decode, pick a reply, key it in (short = dit, long = dah), the ship answers.
  var moA = /*MORSEART*/, MOC = /*MORSECONV*/;
  var moI = {}; Object.keys(moA).forEach(function (k) { var im = new Image(); im.src = moA[k]; moI[k] = im; });
  var MC = { A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
    "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.", "?": "..--.." };
  var MO_D = { easy: { n: "Easy", u: 130, tbl: true, code: true }, medium: { n: "Normal", u: 100, tbl: false, code: true }, hard: { n: "Hard", u: 85, tbl: false, code: false } };
  var moV = mPov("mo-pov", "Leave the radio room"), moS = null, moAC = null, DAH = 220;
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
  function moCw(code, cp) { var w = 0; for (var i = 0; i < code.length; i++) w += (code[i] === "." ? (cp ? 1 : 2) : (cp ? 3 : 5)) + 1; return Math.max(0, w - 1); }
  function moCode(c, code, x, y, n, col, done, cp) {    // dits and dahs; the first n are done
    for (var i = 0; i < code.length; i++) { var w = code[i] === "." ? (cp ? 1 : 2) : (cp ? 3 : 5); c.fillStyle = i < n ? done : col; c.fillRect(x, y, w, cp ? 1 : 2); x += w + 1; }
  }
  // lay a message out on the wall card (x 34..146, y 9..53): words wrap, every letter with its code underneath when asked
  function moLayout(msg, code) {
    for (var cp = 0; cp < 2; cp++) {
      var lg = cp ? 2 : 3, wg = cp ? 7 : 11, lh = code ? 17 : 10, lines = [[]], lw = [0], items = [], ci = 0;
      msg.split(" ").forEach(function (word) {
        var ls = word.split("").map(function (ch) { var w = Math.max(moTw(ch), code ? moCw(MC[ch], cp) : 0); return { ch: ch, w: w, i: ci++ }; }), ww = ls.reduce(function (a, b) { return a + b.w; }, 0) + lg * (ls.length - 1);
        var L = lines.length - 1; if (lines[L].length && lw[L] + wg + ww > 110) { lines.push([]); lw.push(0); L++; }
        if (lines[L].length) lw[L] += wg; ls.forEach(function (q, k) { q.x = lw[L] + (k ? 0 : 0); lw[L] += q.w + (k < ls.length - 1 ? lg : 0); lines[L].push(q); if (k < ls.length - 1) q.x = lw[L] - q.w - lg; });
      });
      // recompute x per line cleanly
      lines.forEach(function (ln, L) { var x = 0, prev = null; ln.forEach(function (q) { if (prev) x += prev.word !== q.word ? 0 : 0; q.x = x; x += q.w + lg; }); });
      if (lines.length * lh <= 36 || cp) {
        var y0 = Math.round(24 - lines.length * lh / 2) + 1;
        lines.forEach(function (ln, L) { var x = Math.round(90 - lw[L] / 2), xx = x; ln.forEach(function (q) { q.x = xx; q.y = y0 + L * lh; xx += q.w + lg; if (q.gap) xx += q.gap; items.push(q); }); });
        return { items: items, cp: !!cp };
      }
    }
  }
  // word gaps: mark the first letter of every word after the first so the layout leaves room
  function moLayoutMsg(msg, code) {
    var L = moLayout(msg, code), wi = 0, words = msg.split(" "), k = 0;
    // shift letters of later words on the same line by the word gap
    var byLine = {};
    words.forEach(function (w, n) { for (var j = 0; j < w.length; j++) { var q = L.items[k++]; q.wd = n; } });
    L.items.forEach(function (q) { (byLine[q.y] = byLine[q.y] || []).push(q); });
    Object.keys(byLine).forEach(function (y) {
      var ln = byLine[y], wg = L.cp ? 7 : 11, lg = L.cp ? 2 : 3, tot = 0, x;
      ln.forEach(function (q, j) { tot += q.w + (j ? (q.wd !== ln[j - 1].wd ? wg : lg) : 0); });
      x = Math.round(90 - tot / 2);
      ln.forEach(function (q, j) { if (j) x += q.wd !== ln[j - 1].wd ? wg : lg; q.x = x; x += q.w; });
    });
    return L;
  }
  function moGloss(msg) { var seen = {}, o = []; msg.replace(/\?/g, " ").split(" ").forEach(function (w) { if (MOC.gloss[w] && !seen[w]) { seen[w] = 1; o.push("<b>" + w + "</b> " + MOC.gloss[w]); } }); return o.join(" · "); }
  function moLetters(msg) { return msg.replace(/ /g, ""); }
  function moBarSet(gloss, btns) {
    moBar.innerHTML = (gloss ? '<div class="mo-gl">' + gloss + '</div>' : "") + (btns ? '<div class="mo-btns">' + btns + '</div>' : "");
    moBar.hidden = !gloss && !btns; moV.el.classList.toggle("mo-ch", !!(btns || gloss));
  }
  // ---------------- flow
  function moPickDiff() {
    var M = mL("morse"), last = M.diff || "easy";
    moTone(false); if (!moS) moS = {};
    moS.phase = "diff"; moBarSet("", "");
    moV.card.innerHTML = '<div class="fi-c"><p class="fi-h">Radio room</p><div class="fi-row mo-diffs">' + ["easy", "medium", "hard"].map(function (d) {
      return '<button type="button" class="' + (d === last ? "fi-b" : "fi-b2") + '" data-d="' + d + '">' + MO_D[d].n + '</button>'; }).join("") + '</div></div>';
    moV.card.hidden = false;
  }
  function moNewConv(diff) {
    var M = mL("morse"), list = MOC[diff]; M.diff = diff; M.seen = M.seen || {}; var seen = M.seen[diff] = (M.seen[diff] || []).filter(function (i) { return i < list.length; });
    if (seen.length >= list.length) seen.length = 0;
    var free = list.map(function (c, i) { return i; }).filter(function (i) { return seen.indexOf(i) < 0; }), ci = free[Math.floor(Math.random() * free.length)];
    seen.push(ci); if (window.SudokuSave) window.SudokuSave();
    moTone(false);
    moS = { diff: diff, D: MO_D[diff], node: list[ci], ci: ci, err: 0, phase: "", down: 0, raf: moS && moS.raf, pad: [], tx: null, flash: 0 };
    moV.card.hidden = true; mBan(moV, MO_D[diff].n); moBarSet("", "");
    setTimeout(function () { moRx(); }, 700);
  }
  function moRx() {        // the ship sends: the key moves by itself, the pencil writes the codes on the pad
    if (!moS || !moS.node) return;
    var S = moS, msg = S.node.s, u = S.D.u, seq = [], t = 0, li = 0;
    msg.split(" ").forEach(function (word, wi) {
      if (wi) t += u * 4;
      word.split("").forEach(function (ch, k) { if (k) t += u * 2; MC[ch].split("").forEach(function (sym, j) { if (j) t += u; var d = (sym === "." ? 1 : 3) * u; seq.push([t, d, li, sym]); t += d; }); li++; });
    });
    S.phase = "rx"; S.msg = msg; S.lay = moLayoutMsg(msg, true); S.got = []; S.pad = []; S.play = { t0: performance.now() + 250, seq: seq, k: 0, end: t + 400 };
    moBarSet("", "");
  }
  function moReplay() {
    var S = moS, keep = S.di; moRx(); S.phase = "dec"; S.di = keep; moBarSet("", ""); S.replay = true;
  }
  function moPlayStep(now) {
    var S = moS, P = S.play, el = now - P.t0, on = false;
    for (var k = P.k; k < P.seq.length; k++) { var q = P.seq[k]; if (el < q[0]) break; S.got[q[2]] = (S.got[q[2]] || "") + q[3]; P.k = k + 1; }
    P.seq.forEach(function (q) { if (el >= q[0] && el < q[0] + q[1]) on = true; });
    if (on !== !!S.lamp) { S.lamp = on; moTone(on, 600); }
    if (el > P.end) { S.play = null; S.lamp = false; moTone(false); if (S.phase === "rx") moAfterRx(); else moDecOpts(); }
  }
  // decoding: letter by letter, each time a few letters to choose from (no list of whole messages)
  var MO_NOPT = { easy: 3, medium: 5, hard: 7 };
  function moDist(a, b) { var m = [], i, j; for (i = 0; i <= a.length; i++) { m[i] = [i]; for (j = 1; j <= b.length; j++) m[i][j] = i ? Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) : j; } return m[a.length][b.length]; }
  function moAfterRx() { var S = moS; S.phase = "dec"; S.di = 0; moDecOpts(); }
  function moDecOpts() {
    var S = moS, want = moLetters(S.msg)[S.di], digit = /[0-9]/.test(want), n = MO_NOPT[S.diff];
    var pool = Object.keys(MC).filter(function (ch) { return ch !== want && ch !== "?" && /[0-9]/.test(ch) === digit; });
    pool.sort(function (a, b) { return moDist(MC[a], MC[want]) - moDist(MC[b], MC[want]) + (Math.random() - .5) * 1.5; });
    var opts = [want].concat(pool.slice(0, n - 1)).sort();
    S.opts = opts;
    moBarSet("", opts.map(function (ch) { return '<button type="button" class="fi-b2 mo-let" data-c="' + ch + '">' + ch + '</button>'; }).join("") + '<button type="button" class="fi-b2 mo-again" aria-label="Listen again">↻</button>' + (S.D.tbl ? '<button type="button" class="fi-b2 mo-tbl' + (S.tbl ? " on" : "") + '" aria-label="Code table">A ·–</button>' : ""));
  }
  function moShow() {      // the decoded message stands on the card; then the replies, or the end of the conversation
    var S = moS; S.phase = "show"; S.got = moLetters(S.msg).split("").map(function (ch) { return MC[ch]; });
    var g = moGloss(S.msg), rs = S.node.r || [];
    if (!rs.length) { moBarSet(g, ""); setTimeout(function () { if (moS === S) moEnd(); }, 2600); return; }
    moBarSet(g, "");
    setTimeout(function () {
      if (moS !== S) return; S.phase = "pick";
      moBarSet(g, rs.map(function (r, i) { var rg = moGloss(r.m); return '<button type="button" class="fi-b2 mo-rep" data-i="' + i + '">' + r.m + (rg ? '<small>' + rg + '</small>' : "") + '</button>'; }).join(""));
    }, 1100);
  }
  function moTx(i) {
    var S = moS, r = S.node.r[i]; S.reply = r; S.phase = "tx"; S.msg = r.m; S.letters = moLetters(r.m); S.i = 0; S.buf = ""; S.pad = [];
    S.lay = moLayoutMsg(r.m, true); moBarSet(moGloss(r.m), "");
  }
  function moKey(down) {
    var S = moS; if (!S || S.phase !== "tx") return;
    var now = performance.now();
    if (down) { S.down = now; moTone(true); return; }
    if (!S.down) return;
    var d = now - S.down; S.down = 0; moTone(false);
    var sym = d < DAH ? "." : "-", want = MC[S.letters[S.i]];
    S.buf += sym; S.pad.push(sym);
    if (want.indexOf(S.buf) !== 0) { S.err++; S.buf = ""; S.flash = now; S.pad = []; setTimeout(function () { moBlip(160, 260); }, 40); return; }
    if (S.buf === want) {
      S.buf = ""; S.i++; S.pad = [];
      setTimeout(function () { moBlip(1050, 90); }, 50);
      if (S.i >= S.letters.length) { S.phase = "sent"; setTimeout(function () { if (moS !== S) return; S.node = S.reply.n; moRx(); }, 900); }
    }
  }
  function moStarsN(err) { return err === 0 ? 3 : err <= 2 ? 2 : 1; }
  function moEnd() {
    var S = moS; S.phase = "end"; moBarSet("", "");
    var M = mL("morse"), st = moStarsN(S.err); M.done = M.done || {}; M.done[S.diff] = (M.done[S.diff] || 0) + 1;
    if (typeof s !== "undefined" && s.fun != null) { s.fun = clamp(s.fun + 6); if (typeof renderNeeds === "function") renderNeeds(); }
    if (window.SudokuSave) window.SudokuSave();
    [660, 880, 1100].forEach(function (f, i) { setTimeout(function () { moBlip(f, 140); }, i * 130); });
    moV.card.innerHTML = '<div class="fi-c"><p class="fi-h">73! Contact ended</p>' + mStars(st) +
      '<div class="fi-row"><button type="button" class="fi-b2" data-a="diff">Level</button><button type="button" class="fi-b" data-a="next">Next contact</button></div></div>';
    moV.card.hidden = false;
  }
  moBar.addEventListener("click", function (e) {
    e.stopPropagation(); var b = e.target.closest("button"), S = moS; if (!b || !S) return;
    if (b.classList.contains("mo-again")) { if (S.phase === "dec") moReplay(); return; }
    if (b.classList.contains("mo-tbl")) { S.tbl = !S.tbl; b.classList.toggle("on", S.tbl); return; }
    if (S.phase === "dec" && b.dataset.c != null) {
      if (b.dataset.c === moLetters(S.msg)[S.di]) { S.di++; moBlip(1050, 70); if (S.di >= moLetters(S.msg).length) moShow(); else moDecOpts(); }
      else { S.err++; b.disabled = true; moBlip(160, 260); }
      return;
    }
    if (S.phase === "pick" && b.dataset.i != null) moTx(+b.dataset.i);
  });
  moV.card.addEventListener("click", function (e) {
    e.stopPropagation(); var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.d) { moNewConv(b.dataset.d); return; }
    if (b.dataset.a === "next") moNewConv(moS.diff); else if (b.dataset.a === "diff") moPickDiff(); else moClose();
  });
  moV.cv.addEventListener("pointerdown", function (e) { if (moS && moS.phase === "tx") { e.preventDefault(); try { moV.cv.setPointerCapture(e.pointerId); } catch (er) { } moKey(true); } });
  moV.cv.addEventListener("pointerup", function () { moKey(false); });
  moV.cv.addEventListener("pointercancel", function () { moKey(false); });
  moV.cv.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  function moDraw(now) {
    var c = moV.c, S = moS; if (!S) return;
    if (S.play) moPlayStep(now);
    c.clearRect(0, 0, 180, 135);
    if (moOk("mo_bg")) c.drawImage(moI.mo_bg, 0, 0);
    var dn = !!S.down; if (moOk(dn ? "mo_dn" : "mo_up")) c.drawImage(moI[dn ? "mo_dn" : "mo_up"], 0, 0);
    if (S.lamp) { c.fillStyle = "rgba(255,233,160,.3)"; c.fillRect(36, 72, 7, 13); c.fillRect(33, 75, 13, 7); c.fillRect(34, 73, 11, 11); c.fillStyle = "#ffd860"; c.fillRect(37, 76, 5, 5); c.fillRect(38, 75, 3, 7); c.fillRect(36, 77, 7, 3); c.fillStyle = "#fff6c8"; c.fillRect(38, 77, 2, 2); }
    var INK = "#3a2414", DONE = "#3e8a4a", RED = "#c8403a", DIM = "#c4b494", L = S.lay;
    if (L && (S.phase === "rx" || S.phase === "dec" || S.phase === "show" || S.phase === "pick")) {
      var reveal = S.phase === "show" || S.phase === "pick";
      if (!reveal && S.tbl && S.phase === "dec" && !S.play && S.opts) {     // easy: the codes of the letters to choose from
        var letters = S.opts, cols = Math.min(3, Math.max(1, Math.ceil(letters.length / 3))), per = Math.ceil(letters.length / cols), cw = Math.floor(116 / cols);
        letters.forEach(function (ch, i) { var cx = 40 + Math.floor(i / per) * cw, cy = 10 + (i % per) * 10; moTxt(c, ch, cx, cy, INK); moCode(c, MC[ch], cx + 9, cy + 3, 0, INK, INK); });
      } else L.items.forEach(function (q, k) {
        var code = MC[q.ch], got = S.got[k] || "";
        var known = reveal || (S.phase === "dec" && k < S.di), cur = S.phase === "dec" && k === S.di && !S.play;
        if (known) moTxt(c, q.ch, q.x + Math.round((q.w - moTw(q.ch)) / 2), q.y, S.phase === "dec" ? DONE : INK);
        else moTxt(c, "?", q.x + Math.round((q.w - moTw("?")) / 2), q.y, cur ? INK : DIM);
        var showCode = !reveal && got && (S.D.code || cur);
        if (showCode) moCode(c, got, q.x + Math.round((q.w - moCw(code, L.cp)) / 2), q.y + 10, 0, cur || !S.D.code ? INK : "#8a7a5a", INK, L.cp);
        if (cur) mR(c, q.x, q.y + 14, q.w, 1, "#d8a840");
      });
    }
    if (L && (S.phase === "tx" || S.phase === "sent")) {
      var fl = S.flash && now - S.flash < 450;
      L.items.forEach(function (q, k) {
        var code = MC[q.ch], cur = k === S.i && S.phase === "tx", col = k < S.i ? DONE : cur ? (fl ? RED : INK) : DIM;
        moTxt(c, q.ch, q.x + Math.round((q.w - moTw(q.ch)) / 2), q.y, col);
        var showCode = S.D.code || k < S.i;
        if (showCode) moCode(c, code, q.x + Math.round((q.w - moCw(code, L.cp)) / 2), q.y + 10, k < S.i ? 99 : cur ? S.buf.length : 0, k < S.i ? DONE : cur ? INK : DIM, DONE, L.cp);
        else if (cur && S.buf) moCode(c, S.buf, q.x + Math.round((q.w - moCw(S.buf, L.cp)) / 2), q.y + 10, 99, INK, INK, L.cp);
        if (cur) mR(c, q.x, q.y + 14, q.w, 1, fl ? RED : "#d8a840");
      });
      if (S.down && now - S.down >= DAH) mR(c, 85, 41, 10, 1, "#d8a840"); else if (S.down) mR(c, 89, 41, 2, 1, "#d8a840");
    }
    // the notepad: pencil marks (receiving: the last letters as they come in; sending: the current letter)
    var lines = S.phase === "tx" ? [S.pad.join("")] : (S.play && S.phase === "rx") ? S.got.slice(-4) : [], ly = 105;
    lines.forEach(function (code) { if (code) moCode(c, code.slice(0, 6), 9, ly, 0, "#4a4a5a", "#4a4a5a"); ly += 6; });
    S.raf = requestAnimationFrame(moDraw);
  }
  function moNoSel(on) { document.documentElement.classList.toggle("mo-nosel", on); try { var se = window.getSelection(); if (se) se.removeAllRanges(); } catch (e) { } }
  document.addEventListener("selectstart", function (e) { if (document.documentElement.classList.contains("mo-nosel")) e.preventDefault(); }, true);
  moV.cv.addEventListener("touchstart", function (e) { if (moS && moS.phase === "tx") e.preventDefault(); }, { passive: false });
  function moOpen(diff) {
    moNoSel(true); moV.el.hidden = false; moS = { phase: "diff", D: MO_D.easy, raf: 0, pad: [], got: [] };
    cancelAnimationFrame(moS.raf); moS.raf = requestAnimationFrame(moDraw);
    if (diff) moNewConv(diff); else moPickDiff();
  }
  function moClose() { moNoSel(false); moTone(false); if (moS) cancelAnimationFrame(moS.raf); moS = null; moV.el.hidden = true; moBar.hidden = true; moV.card.hidden = true; }
  moV.el.querySelector(".bp-x").addEventListener("click", function (e) { e.stopPropagation(); moClose(); });
  // the lighthouse at the lake: tap it to climb up to the wireless room
  (function () {
    var hot = document.createElement("button"); hot.type = "button"; hot.className = "l-hot mo-lh"; hot.setAttribute("aria-label", "Lighthouse");
    hot.style.cssText = "left:74%;top:30%;width:10%;height:28%";
    pondUi.insertBefore(hot, pondUi.firstChild);
    hot.addEventListener("click", function (e) { e.stopPropagation(); if (typeof busy !== "undefined" && busy && typeof interruptible === "function" && !interruptible()) return; if (busy && typeof interrupt === "function") interrupt(); moOpen(); });
  })();
  window.__morse = { open: moOpen, key: moKey, st: function () { return moS && { diff: moS.diff, phase: moS.phase, msg: moS.msg, i: moS.i, err: moS.err, letters: moS.letters, opts: moS.node && moS.node.r && moS.node.r.map(function (r) { return r.m; }) }; }, MC: MC, C: MOC };
