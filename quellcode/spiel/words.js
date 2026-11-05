
  // ===================== Mumpsch: a German word game (rules after Smush); every board is checked to clear completely =====================
  var WordsGame = (function () {
    var WD = /*WORDSDATA*/, WANI = /*WORDANI*/;
    var VAL = { a: 1, b: 3, c: 4, d: 1, e: 1, f: 4, g: 2, h: 2, i: 1, j: 6, k: 4, l: 2, m: 3, n: 1, o: 2, p: 4, q: 10, r: 1, s: 1, t: 1, u: 1, v: 6, w: 3, x: 8, y: 10, z: 3, "ä": 6, "ö": 8, "ü": 6 };
    var PANS = WD.pans.split(" "), DICT = null, MASK = null, COMMON = null;
    var RANKS = [[0, ""], [60, "Ordentlich"], [120, "Gut"], [180, "Stark"], [260, "Super"], [360, "Genial"], [480, "Meisterhaft"]];
    var MAXHINTS = 3;
    function decode() {
      if (DICT) return;
      DICT = []; COMMON = {}; var prev = "", re = /(\d)([a-zäöü]*)(\.?)/g, m;
      while ((m = re.exec(WD.dict))) { var w = prev.slice(0, +m[1]) + m[2]; DICT.push(w); if (m[3]) COMMON[w] = 1; prev = w; }
      MASK = new Int32Array(DICT.length);
      for (var i = 0; i < DICT.length; i++) MASK[i] = maskOf(DICT[i]);
    }
    function li(c) { return c === "ä" ? 26 : c === "ö" ? 27 : c === "ü" ? 28 : c.charCodeAt(0) - 97; }
    function maskOf(w) { var m = 0; for (var i = 0; i < w.length; i++) m |= 1 << li(w[i]); return m; }
    function bit(l) { return 1 << li(l); }
    function inDict(w) { var lo = 0, hi = DICT.length - 1; while (lo <= hi) { var mid = (lo + hi) >> 1; if (DICT[mid] === w) return true; if (DICT[mid] < w) lo = mid + 1; else hi = mid - 1; } return false; }
    function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
    function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
    function today() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
    function rpick(r, a) { return a[Math.floor(r() * a.length)]; }
    function shuffle(r, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

    // ---- boards ----
    function validFor(letters, center) {
      decode();
      var L = maskOf(letters.join("") + center), cb = bit(center), out = [];
      for (var i = 0; i < DICT.length; i++) if ((MASK[i] & ~L) === 0 && (MASK[i] & cb)) out.push(DICT[i]);
      return out;
    }
    // exact solver: is there a set of new words that uses up every outer letter exactly?
    function solve(outer, center, uses, exclude, cap, onlyCommon) {
      var words = validFor(outer, center), cand = [], idx = {}, n = outer.length;
      outer.forEach(function (c, i) { idx[c] = i; });
      for (var i = 0; i < words.length; i++) {
        var w = words[i]; if (exclude[w] || (onlyCommon && !COMMON[w])) continue;
        var cnt = new Int8Array(n), ok = true;
        for (var j = 0; j < w.length; j++) { var k = idx[w[j]]; if (k !== undefined) { cnt[k]++; if (cnt[k] > uses[outer[k]]) { ok = false; break; } } }
        if (ok) cand.push({ w: w, c: cnt, s: (COMMON[w] ? 100 : 0) + w.length });
      }
      cand.sort(function (a, b) { return b.s - a.s; });
      var byL = outer.map(function (_, k) { return cand.filter(function (x) { return x.c[k] > 0; }); });
      var rem = outer.map(function (c) { return uses[c]; }), dead = {}, used = {}, path = [], nodes = 0;
      function key() { var s = 0; for (var k = 0; k < n; k++) s = s * 6 + rem[k]; return s; }
      function fits(x) { for (var k = 0; k < n; k++) if (x.c[k] > rem[k]) return false; return !used[x.w]; }
      function dfs() {
        var best = -1, bestN = 1e9;
        for (var k = 0; k < n; k++) if (rem[k] > 0) { var m = 0, L = byL[k]; for (var t = 0; t < L.length && m < bestN; t++) if (fits(L[t])) m++; if (m < bestN) { bestN = m; best = k; } }
        if (best < 0) return true;
        if (!bestN) return false;
        var kk = key(); if (dead[kk]) return false;
        if (++nodes > cap) throw "cap";
        var L2 = byL[best];
        for (var t = 0; t < L2.length; t++) { var x = L2[t]; if (!fits(x)) continue;
          for (var k = 0; k < n; k++) rem[k] -= x.c[k]; used[x.w] = 1; path.push(x.w);
          if (dfs()) return true;
          for (k = 0; k < n; k++) rem[k] += x.c[k]; used[x.w] = 0; path.pop(); }
        dead[kk] = 1; return false;
      }
      try { return dfs() ? path.slice() : null; } catch (e) { return undefined; }
    }
    function makeBoard(seed, mode, key) {
      decode(); var r = rng(seed);
      for (var tries = 0; tries < 80; tries++) {
        var p = rpick(r, PANS), letters = [], seen = {};
        for (var i = 0; i < p.length; i++) if (!seen[p[i]]) { seen[p[i]] = 1; letters.push(p[i]); }
        if (letters.length !== 9) continue;
        var L = maskOf(p), sub = [];
        for (var k = 0; k < DICT.length; k++) if ((MASK[k] & ~L) === 0) sub.push(k);
        var ok = letters.filter(function (c) { var cb = bit(c), n = 0; sub.forEach(function (k) { if (MASK[k] & cb) n++; }); return n >= 60 && n <= 3000; });
        if (!ok.length) continue;
        var center = rpick(r, ok), outer = shuffle(r, letters.filter(function (c) { return c !== center; }));
        var uses0 = {}; outer.forEach(function (c) { uses0[c] = 5; });
        var sol = solve(outer, center, uses0, {}, 60000, true); if (!sol) continue;
        var valid = validFor(outer, center), secretPool = valid.filter(function (w) { return COMMON[w] && w.length >= 5 && w.length <= 8 && maskOf(w) !== L; });
        var uses = {}; outer.forEach(function (c) { uses[c] = 5; });
        return { v: 2, sol: sol, mode: mode, key: key, seed: seed, outer: outer, center: center, uses: uses, spicy: rpick(r, outer), played: [], score: 0, hints: [], done: false, pangram: p, secret: secretPool.length ? rpick(r, secretPool) : null };
      }
      return null;
    }

    // ---- state ----
    var W = { mode: "daily", daily: null, endless: null, stats: { games: 0, best: 0, daily: {} } };
    function board() { return W[W.mode]; }
    function ensure() {
      var t = today();
      if (!W.daily || W.daily.key !== t || W.daily.v !== 2) W.daily = makeBoard(hashStr("mumpsch-" + t), "daily", t);
      if (!W.endless || W.endless.v !== 2) W.endless = makeBoard((Math.random() * 4294967296) >>> 0, "endless", "e" + Date.now());
    }
    var cur = [];          // letters typed so far
    var root = document.getElementById("scr-words"), $w = function (id) { return document.getElementById(id); };

    // ---- markup ----
    var HOME_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5"/><path d="M6.5 10v9.5h11V10"/><path d="M10.5 19.5v-5h3v5"/></svg>';
    var CHILI = '<svg class="w-chili" viewBox="0 0 9 10" aria-hidden="true" shape-rendering="crispEdges"><path fill="#3a2414" d="M5 0h1v1h2v1h1v1H8v1H7v2H6v2H5v1H4v1H1V9H0V8h1V7h1V6h1V4h1V2h1z"/><path fill="#e8443a" d="M5 2h2v2H6v2H5v2H4v1H2V8h1V7h1V5h1z"/><path fill="#ff8a70" d="M5 3h1v1H5z"/><path fill="#5aa04a" d="M6 1h2v1H7v1H6z"/></svg>';
    root.innerHTML =
      '<div class="w-top"><button type="button" class="w-iconbtn" id="w-home" aria-label="Zum Spielzimmer">' + HOME_SVG + '</button><h1>Mumpsch</h1>' +
      '<span class="w-score"><b id="w-score">0</b> Pkt</span><button type="button" class="w-iconbtn w-q" id="w-help" aria-label="Spielregeln">?</button></div>' +
      '<div class="w-modes"><div class="w-pill" role="tablist"><button type="button" data-m="daily" role="tab">Täglich</button><button type="button" data-m="endless" role="tab">Endlos</button></div><span class="w-sub" id="w-sub"></span></div>' +
      '<p class="w-info" id="w-info"></p>' +
      '<div class="w-word" id="w-word" aria-live="polite"></div>' +
      '<p class="w-msg" id="w-msg"></p>' +
      '<div class="w-board" id="w-board"></div>' +
      '<div class="w-btns"><button type="button" class="w-btn" id="w-del">Löschen</button><button type="button" class="w-btn" id="w-undo">Zurück</button><button type="button" class="w-btn" id="w-mix">Mischen</button><button type="button" class="w-btn w-go" id="w-go">Mumpsch!</button></div>' +
      '<div class="w-lane" id="w-lane"></div>' +
      '<div class="w-tools"><button type="button" class="w-btn w-small" id="w-hint"></button><span class="w-hinttxt" id="w-hinttxt"></span><button type="button" class="w-btn w-small" id="w-end">Fertig</button></div>' +
      '<div class="w-result" id="w-result" hidden></div>' +
      '<div class="w-pilewrap"><h2>Dein Stapel <span id="w-count"></span></h2><ol class="w-pile" id="w-pile"></ol></div>' +
      '<div class="w-rules" id="w-rules" hidden><div class="w-rules-card" role="dialog" aria-labelledby="w-rules-h"><div class="w-rules-top"><h2 id="w-rules-h">So geht Mumpsch</h2><button type="button" class="w-iconbtn" id="w-rules-x" aria-label="Schließen">×</button></div>' +
      '<ul><li>Bilde deutsche Wörter, auch ganz kurze wie <b>JA</b> oder <b>EIS</b>. Jedes Wort braucht den <b>goldenen</b> Buchstaben in der Mitte, der geht nie aus. Ä, Ö und Ü sind eigene Buchstaben, ß schreibst du als SS.</li>' +
      '<li>Die anderen acht Buchstaben kannst du insgesamt je <b>fünfmal</b> benutzen, über alle Wörter zusammen. Die Punkte darunter zeigen, wie oft noch.</li>' +
      '<li>Punkte: Jeder Buchstabe hat einen Wert wie beim Scrabble. Die Summe wird mit dem Bonus malgenommen, der bei ×1 beginnt:</li>' +
      '<li>' + CHILI + ' +1 für jede Benutzung des <b>scharfen</b> Buchstabens. Er wandert nach jedem Wort weiter.</li>' +
      '<li>+1 für jeden Buchstaben, den du <b>platt</b> machst, also seine letzte Benutzung verbrauchst.</li>' +
      '<li>+2 für das <b>Pangramm</b>, ein Wort mit allen neun Buchstaben. Als erstes Wort sogar +4.</li>' +
      '<li><b>Leerer Teller</b>: Sind alle Buchstaben aufgebraucht, gibt es +20. Hast du mit dem Pangramm angefangen, ist es <b>perfekt</b> und alles zählt doppelt.</li>' +
      '<li>Ein <b>Geheimwort</b> pro Rätsel bringt +15.</li><li>Jedes Rätsel geht <b>garantiert ganz auf</b>. Wenn ein Wort den Weg dorthin verbaut, sagt dir Mumpsch Bescheid und du kannst es mit <b>Zurück</b> wieder rausnehmen.</li>' +
      '<li>Täglich gibt es ein Tagesrätsel mit extra Belohnungen für deinen Hamster, Endlos so viele Rätsel, wie du magst.</li></ul></div></div>';

    // ---- rendering ----
    var POS = [0, 1, 2, 3, 5, 6, 7, 8];
    function pending(l) { var n = 0; cur.forEach(function (x) { if (x === l) n++; }); return n; }
    function tileHTML(l, isCenter, b) {
      var left = isCenter ? 0 : b.uses[l] - pending(l), dots = "";
      if (!isCenter) for (var i = 0; i < 5; i++) dots += '<i class="' + (i < left ? "on" : i < b.uses[l] ? "pend" : "") + '"></i>';
      var flat = !isCenter && b.uses[l] === 0;
      return '<button type="button" class="w-tile' + (isCenter ? " gold" : "") + (flat ? " flat" : "") + (b.spicy === l && !isCenter ? " spicy" : "") + (!isCenter && left <= 0 ? " empty" : "") + '" data-l="' + l + '"' + (b.done || (!isCenter && left <= 0) ? " disabled" : "") + ' aria-label="' + l.toUpperCase() + (isCenter ? ", golden" : ", noch " + left + " mal") + '">' +
        '<span class="w-l">' + l.toUpperCase() + '</span><span class="w-v">' + VAL[l] + '</span>' + (b.spicy === l && !isCenter ? CHILI : "") +
        '<span class="w-dots">' + (isCenter ? '<i class="inf">∞</i>' : dots) + '</span></button>';
    }
    function renderBoard() {
      var b = board(), cells = new Array(9);
      cells[4] = tileHTML(b.center, true, b);
      b.outer.forEach(function (l, i) { cells[POS[i]] = tileHTML(l, false, b); });
      $w("w-board").innerHTML = cells.join("");
    }
    function scoreOf(w, b) {
      var base = 0, cnt = {}, i;
      for (i = 0; i < w.length; i++) { base += VAL[w[i]]; cnt[w[i]] = (cnt[w[i]] || 0) + 1; }
      var spicy = b.spicy ? (cnt[b.spicy] || 0) : 0, flat = [];
      for (var l in cnt) if (l !== b.center && cnt[l] === b.uses[l]) flat.push(l);
      var pan = Object.keys(cnt).length === 9, panB = pan ? (b.played.length ? 2 : 4) : 0;
      var mult = 1 + spicy + flat.length + panB;
      return { base: base, mult: mult, spicy: spicy, flat: flat, pan: pan, panB: panB, pts: base * mult, cnt: cnt };
    }
    function renderWord() {
      if (typeof undoState === "function") undoState();
      var b = board(), el = $w("w-word");
      if (!cur.length) { el.innerHTML = '<span class="w-ph">' + (b.done ? "Rätsel beendet" : "Tippe Buchstaben an") + '</span>'; return; }
      var w = cur.join(""), sc = scoreOf(w, b);
      el.innerHTML = '<span class="w-cur">' + cur.map(function (l) { return '<i class="' + (l === b.center ? "g" : "") + '">' + l.toUpperCase() + '</i>'; }).join("") + '</span>' +
        (w.length >= 2 && w.indexOf(b.center) >= 0 ? '<span class="w-prev">' + sc.base + (sc.mult > 1 ? " × " + sc.mult : "") + '</span>' : "") +
        '<button type="button" class="w-clear" id="w-clear" aria-label="Wort leeren">×</button>';
    }
    function undoState() { var b = board(), u = $w("w-undo"); if (!u) return; u.disabled = b.done || (!cur.length && !b.played.length); u.classList.toggle("warn", !!b.stuck && !b.done); }
    function rankOf(p) { var r = RANKS[0][1]; RANKS.forEach(function (x) { if (p >= x[0]) r = x[1]; }); return r; }
    function renderInfo() {
      var b = board(), pan = b.played.some(function (p) { return p.pan; }), sec = b.played.some(function (p) { return p.sec; });
      $w("w-score").textContent = b.done && b.result ? b.result.final : b.score;
      $w("w-info").innerHTML = '<span>' + b.played.length + (b.played.length === 1 ? " Wort" : " Wörter") + '</span><span class="' + (pan ? "got" : "") + '">Pangramm ' + (pan ? "✓" : "offen") + '</span><span class="' + (sec ? "got" : "") + '">Geheimwort ' + (sec ? "✓" : "offen") + '</span>' + (b.done ? "" : '<span class="w-left">' + (function (n) { return n === 1 ? "Noch 1 Wort möglich" : "Noch " + n + " Wörter möglich"; })(playable(b).length) + '</span>');
      var d = new Date(), days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
      $w("w-sub").textContent = W.mode === "daily" ? days[d.getDay()] + ", " + d.getDate() + "." + (d.getMonth() + 1) + "." + (b.done ? " · erledigt" : "") : (W.stats.games ? W.stats.games + " gespielt · Bestwert " + W.stats.best : "So viele Rätsel, wie du magst");
      root.querySelectorAll(".w-pill button").forEach(function (x) { var on = x.dataset.m === W.mode; x.classList.toggle("on", on); x.setAttribute("aria-selected", on); });
      $w("w-hint").textContent = "Tipp (" + (MAXHINTS - b.hints.length) + ")";
      $w("w-hint").disabled = b.done || b.hints.length >= MAXHINTS;
      $w("w-hinttxt").textContent = b.hints.length && !b.done ? b.hints[b.hints.length - 1] : "";
      $w("w-end").disabled = b.done || !b.played.length;
      ["w-del", "w-mix", "w-go"].forEach(function (id) { $w(id).disabled = b.done; });
      undoState();
    }
    function renderPile() {
      var b = board();
      $w("w-count").textContent = b.played.length ? "· " + b.played.length : "";
      $w("w-pile").innerHTML = b.played.length ? b.played.slice().reverse().map(function (p) {
        var tags = (p.sp ? '<span class="t sp">' + CHILI + (p.sp > 1 ? "×" + p.sp : "") + '</span>' : "") + (p.fl ? '<span class="t fl">platt ' + p.fl + '</span>' : "") + (p.pan ? '<span class="t pan">Pangramm</span>' : "") + (p.sec ? '<span class="t sec">Geheimwort</span>' : "");
        return '<li><span class="pw">' + p.w.toUpperCase() + '</span>' + tags + '<span class="pp">' + p.pts + '</span></li>';
      }).join("") : '<li class="w-empty">Noch keine Wörter.</li>';
    }
    function render() { renderBoard(); renderWord(); renderInfo(); renderPile(); renderResult(); }
    var msgT = null;
    function msg(t, kind) { var el = $w("w-msg"); el.textContent = t; el.className = "w-msg on " + (kind || ""); clearTimeout(msgT); msgT = setTimeout(function () { el.className = "w-msg"; }, 2600); }

    // ---- playing ----
    function tap(l) {
      var b = board(); if (b.done) return;
      if (l !== b.center && b.uses[l] - pending(l) <= 0) return;
      if (cur.length >= 15) return;
      cur.push(l); renderBoard(); renderWord();
    }
    function del() { cur.pop(); renderBoard(); renderWord(); }
    function submit() {
      var b = board(); if (b.done || !cur.length) return;
      var w = cur.join("");
      if (w.length < 2) { msg("Mindestens 2 Buchstaben", "bad"); return shake(); }
      if (w.indexOf(b.center) < 0) { msg("Der goldene Buchstabe muss rein", "bad"); return shake(); }
      if (b.played.some(function (p) { return p.w === w; })) { msg("Schon gefunden", "bad"); return shake(); }
      decode();
      if (!inDict(w)) { msg("„" + w.toUpperCase() + "“ steht nicht in der Wortliste", "bad"); return shake(); }
      var sc = scoreOf(w, b), sec = w === b.secret, pts = sc.pts + (sec ? 15 : 0);
      for (var l in sc.cnt) if (l !== b.center) b.uses[l] -= sc.cnt[l];
      b.played.push({ prevSpicy: b.spicy, w: w, pts: pts, base: sc.base, mult: sc.mult, sp: sc.spicy, fl: sc.flat.length, pan: sc.pan, sec: sec, first: b.played.length === 0 });
      b.score += pts; cur = [];
      var live = b.outer.filter(function (x) { return b.uses[x] > 0 && x !== b.spicy; });
      b.spicy = live.length ? pick(live) : null;
      var parts = [];
      if (sc.spicy) parts.push("scharf");
      if (sc.flat.length) parts.push(sc.flat.length === 1 ? sc.flat[0].toUpperCase() + " platt" : sc.flat.length + " platt");
      if (sc.pan) parts.push(sc.panB === 4 ? "Pangramm zuerst!" : "Pangramm!");
      if (sec) parts.push("Geheimwort +15");
      msg("+" + pts + (parts.length ? " · " + parts.join(" · ") : ""), sc.pan || sec ? "great" : "good");
      render();
      sc.flat.forEach(function (l) { var t = root.querySelector('.w-tile[data-l="' + l + '"]'); if (t) { t.classList.add("squish"); } });
      save();
      if (sc.pan) eventVisit("pangram");
      var clean = b.outer.every(function (x) { return b.uses[x] === 0; });
      if (clean) return setTimeout(function () { finish(true); }, 700);
      var rest = solveNow(b);
      if (rest === null) { b.stuck = true; renderInfo(); setTimeout(function () { msg("Achtung: So geht das Rätsel nicht mehr ganz auf. Mit „Zurück“ nimmst du das Wort wieder raus.", "bad"); }, 1400); }
      else if (rest) { b.stuck = false; b.sol = rest; }
      if (!playable(b).length) { msg("Es passt kein Wort mehr, das Rätsel ist fertig."); setTimeout(function () { finish(false); }, 900); }
    }
    function solveNow(b) { var ex = {}; b.played.forEach(function (p) { ex[p.w] = 1; }); var r = solve(b.outer, b.center, b.uses, ex, 40000, true); return r || solve(b.outer, b.center, b.uses, ex, 60000, false); }
    function undo() {
      var b = board(); if (b.done) return;
      if (cur.length) { cur.pop(); renderBoard(); renderWord(); return; }     // the last step was a letter: take it back
      if (!b.played.length) return;
      var p = b.played.pop(), cnt = {}; for (var i = 0; i < p.w.length; i++) cnt[p.w[i]] = (cnt[p.w[i]] || 0) + 1;
      for (var l in cnt) if (l !== b.center) b.uses[l] += cnt[l];
      b.score -= p.pts; b.spicy = p.prevSpicy !== undefined ? p.prevSpicy : b.spicy; cur = [];
      var rest = solveNow(b); b.stuck = rest === null; if (rest) b.sol = rest;
      msg("„" + p.w.toUpperCase() + "“ ist wieder raus."); render(); save();
    }
    function playable(b) {
      var done = {}; b.played.forEach(function (p) { done[p.w] = 1; });
      return validFor(b.outer, b.center).filter(function (w) {
        if (done[w]) return false;
        var c = {}; for (var i = 0; i < w.length; i++) c[w[i]] = (c[w[i]] || 0) + 1;
        for (var l in c) if (l !== b.center && c[l] > b.uses[l]) return false;
        return true;
      });
    }
    function shake() { var el = $w("w-word"); el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
    function mix() { var b = board(); if (b.done) return; var r = rng((Math.random() * 1e9) >>> 0); shuffle(r, b.outer); renderBoard(); save(); }
    function hint() {
      var b = board(); if (b.done || b.hints.length >= MAXHINTS) return;
      var t, pan = b.played.some(function (p) { return p.pan; });
      var pl = playable(b), pans = pl.filter(function (w) { return maskOf(w) === maskOf(b.outer.join("") + b.center); });
      var target = !pan && pans.length ? (pans.indexOf(b.pangram) >= 0 ? b.pangram : pans[0]) : null;
      if (target) {
        var n = [1, 3, 5][Math.min(2, b.hints.filter(function (h) { return h.indexOf("Pangramm") === 0; }).length)];
        t = "Pangramm: " + target.slice(0, n).toUpperCase() + "… (" + target.length + " Buchstaben)";
      } else if (!b.stuck && (b.sol = solveNow(b) || b.sol) && b.sol.length) {
        var sw = b.sol.slice().sort(function (a, c) { return (COMMON[c] ? 1 : 0) - (COMMON[a] ? 1 : 0); })[0];
        t = "Probier: " + sw.slice(0, Math.min(2, sw.length - 1)).toUpperCase() + "… (" + sw.length + " Buchstaben)";
      } else if (b.stuck) {
        t = "Erst ein Wort zurücknehmen, dann geht es wieder ganz auf.";
      } else if (pl.length) {
        var cm = pl.filter(function (w) { return COMMON[w]; }); if (cm.length) pl = cm;
        pl.sort(function (a, c) { return scoreOf(c, b).pts - scoreOf(a, b).pts; });
        var w = pick(pl.slice(0, Math.min(6, pl.length)));
        t = "Probier: " + w.slice(0, 2).toUpperCase() + "… (" + w.length + " Buchstaben)";
      } else t = "Hier passt kein Wort mehr.";
      b.hints.push(t); renderInfo(); save();
    }

    // ---- end of a round and the hamster's rewards ----
    function finish(clean) {
      var b = board(); if (b.done) return;
      var firstPan = b.played.length && b.played[0].pan, perfect = clean && firstPan;
      var final = b.score + (clean ? 20 : 0); if (perfect) final *= 2;
      b.done = true; cur = [];
      b.result = { final: final, clean: clean, perfect: perfect, rank: rankOf(final), rewards: giveRewards(b.mode, final, clean, perfect) };
      W.stats.games++; W.stats.best = Math.max(W.stats.best, final);
      if (b.mode === "daily") W.stats.daily[b.key] = final;
      save(); render(); stopVisits();
      setTimeout(function () { visit("done", true); }, 900);
      var res = $w("w-result"); if (res.scrollIntoView) res.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    function giveRewards(mode, final, clean, perfect) {
      if (typeof s === "undefined" || !s.name) return { none: true };
      var apples = 0, seeds = [], gift = null, crops = Object.keys(CROPS);
      if (mode === "daily") {
        apples = final >= 60 ? 2 + (final >= 180 ? 1 : 0) + (perfect ? 1 : 0) : 1;
        if (final >= 60) seeds.push(pick(crops)); if (final >= 180) seeds.push(pick(crops));
        if (final >= 120 || clean) gift = pickGift();
      } else {
        apples = final >= 180 ? 2 : final >= 60 ? 1 : 0;
        if (final >= 60) seeds.push(pick(crops));
        if ((final >= 180 || clean) && isHappy()) gift = pickGift();
      }
      var furns = []; seeds = seeds.map(function () { var r_ = seedOrFurn(); if (r_.furn) furns.push(r_.furn); return r_.seed; }).filter(Boolean);
      renderNeeds(); renderCosy(); if (typeof renderStart === "function") renderStart();
      return { apples: apples, seeds: seeds, furns: furns, gift: !!gift, name: s.name };
    }
    function renderResult() {
      var b = board(), el = $w("w-result");
      el.hidden = !(b.done && b.result);
      if (el.hidden) return;
      var r = b.result, rw = r.rewards, rows = "";
      var bon = [];
      if (b.played.some(function (p) { return p.pan; })) bon.push("Pangramm");
      if (b.played.some(function (p) { return p.sec; })) bon.push("Geheimwort");
      if (r.clean) bon.push("Leerer Teller +20");
      if (r.perfect) bon.push("Perfekt ×2");
      if (rw.none) rows = '<div class="w-rw dim">Gib deinem Hamster einen Namen, dann bekommt er für Mumpsch Äpfel, Samen und Möbel.</div>';
      else {
        if (rw.apples) rows += '<div class="w-rw"><span class="ri">' + svgOf(A.apple, SZ.apple[0], SZ.apple[1]) + '</span><span>+' + rw.apples + (rw.apples === 1 ? " Apfel" : " Äpfel") + ' für ' + esc(rw.name) + '</span></div>';
        rw.seeds.forEach(function (c) { rows += '<div class="w-rw"><span class="ri">' + svgOf(A["seed_" + c], 8, 10) + '</span><span>Ein Tütchen ' + esc(CROPS[c].name) + '-Samen für den Garten</span></div>'; });
        (rw.furns || []).forEach(function (f) { rows += '<div class="w-rw"><span class="ri">' + svgOf(f.it.svg, f.it.w, f.it.h) + '</span><span>Neu für dein Zuhause: ' + esc(f.name) + '</span></div>'; });
        if (rw.gift && home.pending) rows += '<div class="w-rw w-giftrow"><span class="ri">' + svgOf(PROPS.gift.svg, 24, 24) + '</span><span><b>Ein Paket für ' + esc(rw.name) + '!</b><br>Es wartet in seinem Zimmer.</span><button type="button" id="w-gift">Öffnen</button></div>';
        if (!rows) rows = '<div class="w-rw dim">Ab 60 Punkten gibt es Äpfel und Samen für ' + esc(rw.name) + '.</div>';
        if (b.mode === "endless" && !rw.gift) rows += '<div class="w-rw dim small">Ab 180 Punkten (oder mit leerem Teller) bringt Mumpsch ein Paket, wenn ' + esc(rw.name) + ' glücklich ist.</div>';
      }
      var next = b.mode === "daily" ? '<p class="w-next">Morgen wartet ein neues Tagesrätsel.</p><button type="button" class="w-btn w-go" data-m2="endless">Endlos weiterspielen</button>' : '<button type="button" class="w-btn w-go" id="w-new">Nächstes Rätsel</button>';
      el.innerHTML = (r.rank && r.rank !== "Aufgewärmt" ? '<p class="w-rk">' + r.rank + '</p>' : '') + '<p class="w-fin"><b>' + r.final + '</b> Punkte</p>' + (bon.length ? '<p class="w-bon">' + bon.join(" · ") + '</p>' : "") +
        (b.pangram ? '<p class="w-pg">Pangramm: <b>' + b.pangram.toUpperCase() + '</b>' + (b.secret ? ' · Geheimwort: <b>' + b.secret.toUpperCase() + '</b>' : "") + '</p>' : "") +
        '<div class="w-rws">' + rows + '</div>' + next;
    }
    function esc(x) { return String(x).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

    // ---- visiting animals: now and then one hops in with a word of encouragement ----
    // plain encouragement; every visitor uses the same calm lines
    var CHEER = {
      start: ["Schöner Start. Lass dir Zeit.", "Fang einfach mit einem kurzen Wort an.", "Du schaffst das.", "Ganz in Ruhe, ein Wort nach dem anderen."],
      mid: ["Läuft gut, bleib dran.", "Du machst das gut.", "Weiter so.", "Gute Wörter bisher.", "Kurze Pause hilft manchmal auch."],
      end: ["Fast geschafft.", "Nur noch ein paar Buchstaben.", "Das Ende ist in Sicht.", "Bleib dran, gleich ist es leer."],
      pangram: ["Alle neun Buchstaben, stark!", "Ein Pangramm, sehr gut."],
      done: ["Gut gemacht.", "Schön gespielt.", "Das war eine gute Runde."]
    };
    var LINES = {}; ["igel", "hare", "squirrel", "robin", "tit", "fox", "mouse", "badger", "owl", "otter"].forEach(function (k) { LINES[k] = CHEER; });
    var IDS = Object.keys(LINES).filter(function (k) { return WANI[k]; }), vTimer = null, vBusy = false, lastV = null, lastVisitAt = 0, vTimers = [];
    function active() { return !root.hidden && (!window.Nav || window.Nav.current === "words") && document.visibilityState === "visible"; }
    function schedVisits(ms) { clearTimeout(vTimer); vTimer = setTimeout(function () { visit(null); schedVisits(300000 + Math.random() * 60000); }, ms); }
    function stopVisits() { clearTimeout(vTimer); }
    function phase(b) {
      var left = 0; b.outer.forEach(function (l) { left += b.uses[l]; });
      return !b.played.length ? "start" : left > 18 ? "mid" : "end";
    }
    function visit(kind, force) {
      var b = board(); if (!active() || vBusy || !IDS.length) return;
      if (Date.now() - (window.__laneT || 0) < 300000) return; window.__laneT = Date.now();
      if (b.done && !force) return;
      vBusy = true; lastVisitAt = Date.now();
      var pool = IDS.filter(function (k) { return k !== lastV; }), id = pick(pool); lastV = id;
      var an = WANI[id], lines = LINES[id][kind || phase(b)] || LINES[id].mid;
      var lane = $w("w-lane"), v = document.createElement("div");
      v.className = "wv in";
      v.innerHTML = '<span class="wv-sprite"><svg viewBox="' + an.vb + '" aria-hidden="true">' + an.svg + '</svg></span><span class="wv-bubble">' + esc(pick(lines)) + '</span>';
      lane.innerHTML = ""; lane.appendChild(v);
      vTimers.push(setTimeout(function () { v.classList.add("talk"); }, 1500));
      vTimers.push(setTimeout(function () { v.classList.remove("talk"); v.classList.add("out"); }, 7000));
      vTimers.push(setTimeout(function () { v.remove(); vBusy = false; }, 8400));
    }
    function eventVisit(kind) { if (Date.now() - lastVisitAt < 300000) return; setTimeout(function () { visit(kind); }, 1300); }
    function clearLane() { vTimers.forEach(clearTimeout); vTimers = []; vBusy = false; var l = $w("w-lane"); if (l) l.innerHTML = ""; }

    // ---- saving ----
    function save() { if (window.SudokuSave) window.SudokuSave(); }
    function exportState() { return JSON.parse(JSON.stringify(W)); }
    function importState(o) {
      if (!o || typeof o !== "object") return;
      if (o.mode === "daily" || o.mode === "endless") W.mode = o.mode;
      if (o.daily && o.daily.outer && o.daily.v === 2) W.daily = o.daily;
      if (o.endless && o.endless.outer && o.endless.v === 2) W.endless = o.endless;
      if (o.stats) W.stats = { games: o.stats.games || 0, best: o.stats.best || 0, daily: o.stats.daily || {} };
      cur = []; if (!root.hidden) { ensure(); render(); }
    }
    function sig() { var b = W[W.mode]; return [W.mode, W.daily && W.daily.key, W.daily && W.daily.played.length, W.daily && W.daily.hints.length, W.endless && W.endless.key, W.endless && W.endless.played.length, W.endless && W.endless.hints.length, W.stats.games, b && b.outer.join("")].join("|"); }

    // ---- screen ----
    function enter() { ensure(); cur = []; render(); clearLane(); if (!board().done) schedVisits(45000 + Math.random() * 30000); }
    function leave() { stopVisits(); clearLane(); }
    function setMode(m) { if (W.mode === m) return; W.mode = m; cur = []; ensure(); render(); clearLane(); save(); if (!board().done) schedVisits(40000 + Math.random() * 30000); else stopVisits(); }
    function newEndless() { W.endless = makeBoard((Math.random() * 4294967296) >>> 0, "endless", "e" + Date.now()); W.mode = "endless"; cur = []; render(); clearLane(); save(); schedVisits(45000 + Math.random() * 30000); window.scrollTo(0, 0); }
    function goHome() { leave(); if (window.Nav) window.Nav.show("home"); else show("scr-start"); }
    function openGift() { leave(); if (window.HamsterApp && window.HamsterApp.openPackageSoon) window.HamsterApp.openPackageSoon(); else { show("scr-hamster"); refresh(); if (home.pending) later(openPackage, 800); } }
    root.addEventListener("click", function (e) {
      var t = e.target.closest("button"); if (!t) return;
      if (t.classList.contains("w-tile")) return tap(t.dataset.l);
      if (t.dataset.m) return setMode(t.dataset.m);
      if (t.dataset.m2) return setMode(t.dataset.m2);
      switch (t.id) {
        case "w-home": return goHome();
        case "w-help": $w("w-rules").hidden = false; return;
        case "w-rules-x": $w("w-rules").hidden = true; return;
        case "w-del": return del();
        case "w-undo": return undo();
        case "w-clear": cur = []; renderBoard(); renderWord(); return;
        case "w-mix": return mix();
        case "w-go": return submit();
        case "w-hint": return hint();
        case "w-end": return finish(false);
        case "w-new": return newEndless();
        case "w-gift": return openGift();
      }
    });
    $w("w-rules").addEventListener("click", function (e) { if (e.target.id === "w-rules") e.target.hidden = true; });
    document.addEventListener("keydown", function (e) {
      if (root.hidden || (window.Nav && window.Nav.current !== "words") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!$w("w-rules").hidden) { if (e.key === "Escape") $w("w-rules").hidden = true; return; }
      var b = board(); if (!b) return;
      var k = e.key.toLowerCase();
      if (k === "enter") { e.preventDefault(); submit(); }
      else if (k === "backspace") { e.preventDefault(); del(); }
      else if (k === "escape") { cur = []; renderBoard(); renderWord(); }
      else if (k === " ") { e.preventDefault(); mix(); }
      else if (/^[a-zäöü]$/.test(k) && (k === b.center || b.outer.indexOf(k) >= 0)) tap(k);
    });
    document.addEventListener("visibilitychange", function () { if (!root.hidden && document.visibilityState === "visible" && W.daily && W.daily.key !== today()) { ensure(); render(); } });
    var goBtn = document.getElementById("go-words");
    if (goBtn) goBtn.addEventListener("click", function () { if (window.Nav) window.Nav.show("words"); else { show("scr-words"); enter(); } });

    return { enter: enter, leave: leave, exportState: exportState, importState: importState, sig: sig, _ani: WANI,
      _dbg: { W: W, makeBoard: makeBoard, scoreOf: scoreOf, inDict: function (w) { decode(); return inDict(w); }, validFor: validFor, playable: function () { return playable(board()); }, board: board, finish: finish, visit: visit } };
  })();
  window.WordsGame = WordsGame;
  var _w_show = show;
  show = function (id) {
    var el = document.getElementById("scr-words");
    if (el) el.hidden = id !== "scr-words";
    if (id === "scr-words") { ["scr-start", "scr-name", "scr-hamster"].forEach(function (x) { document.getElementById(x).hidden = true; }); return; }
    _w_show(id);
  };
