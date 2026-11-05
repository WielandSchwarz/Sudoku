  // ===================== kitchen (preview): more to do while cooking =====================
  // soups: season and taste (the hamster's face says if it is right), jam: skim the foam and test on a cold plate,
  // salad: slice the cucumber on the mandoline and shake the dressing
  (function () {
    var K2 = /*KITCHEN2*/;
    Object.keys(K2).forEach(function (k) { A[k] = '<image href="' + K2[k][0] + '" width="' + K2[k][1] + '" height="' + K2[k][2] + '" style="image-rendering:pixelated"/>'; SZ[k] = [K2[k][1], K2[k][2]]; });
    PLAN.psoup = [["cut"], ["add", "pot"], ["stir", "pot"], ["season"], ["heat"]];
    PLAN.tsoup = [["cut"], ["add", "pot"], ["stir", "pot"], ["season"], ["heat"]];
    PLAN.jam = [["add", "pot"], ["mash"], ["skim"], ["gel"]];
    PLAN.salad = [["planer"], ["cut"], ["add", "bowl"], ["shake"], ["stir", "bowl"]];
    function img(k, x, y, extra) { return '<g transform="translate(' + Math.round(x) + ' ' + Math.round(y) + ')' + (extra || "") + '">' + A[k] + '</g>'; }
    function loop(fn) { var t0 = performance.now(), last = t0, on = true; (function f(now) { if (!on || pov.hidden) return; var dt = Math.min(.05, (now - last) / 1000); last = now; fn(dt, (now - t0) / 1000); requestAnimationFrame(f); })(t0); return function () { on = false; }; }
    function sq(x, y, w, h, c) { return '<rect x="' + Math.round(x) + '" y="' + Math.round(y) + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>'; }

    // ---- soups: three spices, a tasting spoon; each soup wants its own mix
    // ---- soups: three spices on a tray, the hamster tastes with a spoon and his face tells you what is missing
    var SPICE = { salz: { n: "Salz", c: "#ffffff", c2: "#d8d0c4", spr: "sp_salz", how: "tilt" }, pfeffer: { n: "Pfeffer", c: "#3a3036", c2: "#5a5058", spr: "sp_pfeffer", how: "grind" }, kraut: { n: "Kräuter", c: "#5aa04e", c2: "#86c870", spr: "sp_kraut", how: "pinch" } };
    function tip(msg, ms) { var el = $p("pov-step"); if (!el) return; if (!el.dataset.base) el.dataset.base = el.textContent; el.textContent = msg; clearTimeout(tip.t); tip.t = setTimeout(function () { if (el.dataset.base) { el.textContent = el.dataset.base; delete el.dataset.base; } }, ms || 1700); }
    function hamFace(f) { return ["body", "ears_up", "whisk0", f.nose ? "nose_up" : "nose", "eyes_" + (f.eyes || "open"), "mouth_" + (f.mouth || "smile"), f.blush ? "blush" : "", f.cheeks ? "cheeks_s" : "", "paws_" + (f.paws || "hold")].map(function (k) { return A[k] || ""; }).join(""); }
    COOK_EXT.season = function (X) {
      return new Promise(function (res) {
        setView("pot"); X.head(X.i, "Würzen und abschmecken");
        var WANT = X.d === "tsoup" ? { salz: 1, kraut: 2 } : { salz: 1, pfeffer: 2 }, got = { salz: 0, pfeffer: 0, kraut: 0 };
        var JAR = [{ k: "salz", x: 10, y: 92 }, { k: "pfeffer", x: 38, y: 92 }, { k: "kraut", x: 64, y: 92 }], HX = 126, HY = 90;
        var act = null, taste = null, face = { eyes: "open", mouth: "smile" }, think = null, tastes = 0, penalty = false, done = false, specks = [], hearts = [], T0 = 0;
        function render(t) {
          var o = img("tray_wood", 4, 116);
          JAR.forEach(function (j) {
            var key = SPICE[j.k].spr, x = j.x, y = j.y, extra = "";
            if (act && act.k === j.k) {
              // up over the pot, sprinkle, back down
              var u = act.u, go = Math.min(1, u * 3), back = Math.max(0, (u - .78) / .22), tx = 92, ty = 18, px = j.x + (tx - j.x) * go, py = j.y + (ty - j.y) * go;
              if (back > 0) { px = tx + (j.x - tx) * back; py = ty + (j.y - ty) * back; }
              x = px; y = py;
              var on = u > .33 && u < .78, rot = SPICE[j.k].how === "tilt" ? (on ? 135 + Math.sin(t * 30) * 10 : go * 135 * (1 - back)) : SPICE[j.k].how === "pinch" ? (on ? 50 + Math.sin(t * 12) * 8 : go * 50 * (1 - back)) : (on ? Math.sin(t * 25) * 8 : 0);
              extra = " rotate(" + rot.toFixed(0) + " 13 17)";
            }
            o += img(key, x, y, extra);
            for (var d = 0; d < got[j.k]; d++) o += sq(j.x + 6 + d * 5, 128, 3, 3, "#3a2414") + sq(j.x + 7 + d * 5, 129, 1, 1, "#f6c84a");
          });
          specks.forEach(function (p) { o += sq(p.x, p.y, p.w, p.w, p.c); });
          // the hamster pops up at the bottom right with a spoon
          var bob = taste ? Math.round(Math.sin(t * 18) * 1) : 0, sp = taste && taste.u < .45;
          o += '<g transform="translate(' + HX + ' ' + (HY + bob) + ')">' + hamFace(face) + (sp ? '<g transform="translate(18 18) rotate(-30 6 8)">' + A.taste_spoon + '</g>' : '<g transform="translate(30 14) rotate(20 6 8)">' + A.taste_spoon + '</g>') + '</g>';
          hearts.forEach(function (h) { var u = (t - h.t0) / 1.2; if (u < 1) o += '<g opacity="' + (1 - u).toFixed(2) + '" transform="translate(' + h.x + ' ' + (h.y - u * 16).toFixed(1) + ')"><path fill="#3a2414" d="M-4 0h3v1h2v-1h3v1h1v3h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-3h1z"/><path fill="#e8554a" d="M-3 1h2v1h2v-1h2v3h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1z"/></g>'; });
          if (think) {
            // a thought bubble with the spice he would like
            o += '<g transform="translate(' + (HX - 40) + ' ' + (HY - 44) + ')">' + sq(0, 2, 38, 40, "#3a2414") + sq(2, 0, 34, 44, "#3a2414") + sq(1, 3, 36, 38, "#fff8ec") + sq(3, 1, 32, 42, "#fff8ec") + sq(36, 40, 4, 4, "#3a2414") + sq(37, 41, 2, 2, "#fff8ec") + sq(41, 45, 3, 3, "#3a2414") + img(SPICE[think].spr, 6, 5) + '</g>';
          }
          if (!act && !taste && !tastes && !got.salz && !got.pfeffer && !got.kraut) { var on2 = Math.floor(t * 2.5) % 2; o += sq(22, 80 + on2 * 2, 3, 4, "#f6c84a") + sq(20, 84 + on2 * 2, 7, 1, "#f6c84a") + sq(21, 85 + on2 * 2, 5, 1, "#f6c84a"); }
          $p("pov-tool").innerHTML = o;
        }
        var stop = loop(function (dt, t) {
          T0 = t;
          if (act) {
            act.u += dt / 1.5;
            if (act.u > .36 && act.u < .76 && Math.random() < .7) { var S = SPICE[act.k], mx = 98 + (Math.random() - .5) * 8, my = act.k === "pfeffer" ? 40 : 30; specks.push({ x: mx, y: my, vy: 25 + Math.random() * 20, c: Math.random() < .5 ? S.c : S.c2, w: act.k === "kraut" ? 2 : 1 }); }
            if (act.u >= 1) act = null;
          }
          specks.forEach(function (p) { p.y += p.vy * dt; p.vy += 140 * dt; }); specks = specks.filter(function (p) { return p.y < 72; });
          if (taste) {
            taste.u += dt / 1.1;
            if (taste.u < .45) face = { eyes: "happy", mouth: Math.floor(t * 8) % 2 ? "chew" : "teeth", paws: "hold" };
            if (taste.u >= .45 && !taste.r) react();
            if (taste.u >= 1.6) { taste = null; if (!done) { think = null; face = { eyes: "open", mouth: "smile" }; } }
          }
          render(t);
        });
        function react() {
          taste.r = true;
          var over = Object.keys(got).filter(function (k) { return got[k] > (WANT[k] || 0); }), miss = Object.keys(WANT).filter(function (k) { return got[k] < WANT[k]; });
          if (over.length) {
            // too much: a funny face, then a splash of water evens it out (but costs a star)
            var k = over[0]; face = { eyes: "grumpy", mouth: "frown", paws: "cover" }; tip(k === "salz" ? "Zu salzig!" : k === "pfeffer" ? "Hui, scharf!" : "Zu viele Kräuter!"); beep([[300, .08], [220, .1]]);
            penalty = true; setTimeout(function () { got[k]--; tip(N() + " gießt einen Schluck Wasser nach"); puff(102, 64); puff(96, 70); }, 900);
          } else if (miss.length) {
            face = { eyes: "look_l", mouth: "flat", paws: "hold" }; think = miss[0]; tip("Da fehlt noch etwas"); beep([[440, .05], [392, .06]]);
          } else {
            done = true; face = { eyes: "happy", mouth: "grin", blush: true, paws: "up" }; tip("Lecker! Genau richtig"); beep([[784, .06], [988, .06], [1319, .1]]);
            for (var h = 0; h < 4; h++) hearts.push({ x: HX + 10 + h * 8, y: HY + 4, t0: T0 + h * .15 });
            X.grades.push(!penalty && tastes <= 3 ? 3 : 2);
            setTimeout(function () { stop(); $p("pov-tool").innerHTML = ""; res(); }, 1800);
          }
        }
        svgEl.onclick = function (ev) {
          if (act || taste || done) return; var p = svgPt(ev);
          var j = JAR.filter(function (q) { return p.x >= q.x - 2 && p.x <= q.x + 28 && p.y >= q.y - 2 && p.y <= q.y + 36; })[0];
          if (j) { act = { k: j.k, u: 0 }; got[j.k]++; think = null; face = { eyes: "open", mouth: "smile" }; beep(j.k === "pfeffer" ? [[300, .03], [260, .03], [300, .03]] : [[1200, .02], [1000, .02], [1300, .02]]); return; }
          if (p.x >= HX && p.y >= HY - 4) { tastes++; taste = { u: 0 }; think = null; beep([[600, .04], [800, .05]]); }
        };
      });
    };

    // ---- shared bits for the 2.5D steps: crisp pixel shapes, the hamster watching from the corner
    // ellipses as rows of whole pixels (no smooth svg ellipses): the same pixel look as everything else
    function E(cx, cy, rx, ry, f, extra) {
      cx = Math.round(+cx * 2) / 2; cy = Math.round(+cy); rx = +rx; ry = +ry; if (rx <= 0 || ry <= 0) return ""; var o = "";
      for (var y = -Math.ceil(ry); y <= Math.ceil(ry); y++) { var t = 1 - (y * y) / (ry * ry); if (t < 0) continue; var hw = Math.round(rx * Math.sqrt(t)); if (hw <= 0 && Math.abs(y) > 0) continue; o += '<rect x="' + Math.round(cx - hw) + '" y="' + (cy + y) + '" width="' + Math.max(1, 2 * hw) + '" height="1"/>'; }
      return '<g fill="' + f + '"' + (extra || "") + ' shape-rendering="crispEdges">' + o + '</g>';
    }
    function P(pts, f) { return '<polygon points="' + pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '" fill="' + f + '"/>'; }
    function crisp(s) { return '<g shape-rendering="crispEdges">' + s + '</g>'; }
    function watcher(face, t, bob) { return '<g transform="translate(130 ' + (92 + (bob || 0)) + ')">' + hamFace(face) + '</g>'; }
    function heartsSvg(list, t) { var o = ""; list.forEach(function (h) { var u = (t - h.t0) / 1.2; if (u > 0 && u < 1) o += '<g opacity="' + (1 - u).toFixed(2) + '" transform="translate(' + h.x + ' ' + (h.y - u * 16).toFixed(1) + ')"><path fill="#3a2414" d="M-4 0h3v1h2v-1h3v1h1v3h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-3h1z"/><path fill="#e8554a" d="M-3 1h2v1h2v-1h2v3h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1z"/></g>'; }); return o; }
    // ---- jam: skim the foam off with a ladle and tip it into a little bowl
    COOK_EXT.skim = function (X) {
      return new Promise(function (res) {
        setView("pot"); X.head(X.i, "Schaum abschöpfen"); $p("pov-ring").hidden = false; X.bar(0);
        var foams = [], n = 0, N = 8, next = .2, drag = null, done = false, carry = 0, CAP = 3, inBowl = 0, face = null, faceT = 0, hearts = [], now = 0, warned = 0;
        var BOWL = { x: 30, y: 96 };
        window.__k2foams = function () { return foams.map(function (f) { return [f.x, f.y]; }); }; window.__k2skim = function () { return { carry: carry, n: n, bowl: [BOWL.x, BOWL.y - 2] }; };
        function inside(x, y) { return Math.pow((x - 102) / 36, 2) + Math.pow((y - 72) / 16, 2) <= 1; }
        function setFace(f, ms) { face = f; faceT = now + ms / 1000; }
        function foamDome(x, y, r, t, s) {
          // a little pink foam hill with bubbles: shadow on the jam, the hill, a light top
          return E(x + 1, y + r * .45, r * 1.1, r * .45, "rgba(90,20,30,.35)") + E(x, y, r, r * .62, "#e8b0b8") + E(x - r * .15, y - r * .15, r * .8, r * .45, "#fbe4e6") + E(x - r * .35, y - r * .3, r * .3, r * .16, "#ffffff") +
            E(x + r * .45, y - r * .05 + Math.sin(t * 3 + s) * .3, r * .22, r * .18, "none", ' stroke="#ffffff" stroke-width=".8"');
        }
        function ladle(x, y, c) {
          // the skimmer seen from above at an angle: a long handle up to the right, a round perforated head
          var o = '<path d="M' + (x + 6) + ' ' + (y - 2) + 'L' + (x + 34) + ' ' + (y - 24) + '" stroke="#3a2414" stroke-width="3.4"/><path d="M' + (x + 6) + ' ' + (y - 2) + 'L' + (x + 34) + ' ' + (y - 24) + '" stroke="#c4c8d0" stroke-width="1.8"/>';
          o += E(x, y, 8.5, 4.4, "#3a2414") + E(x, y, 7.5, 3.6, "#9aa0aa") + E(x, y - .4, 6.4, 2.8, "#c4c8d0");
          for (var k = 0; k < 7; k++) o += '<rect x="' + Math.round(x - 4 + (k % 4) * 2.6) + '" y="' + Math.round(y - 1 + Math.floor(k / 4) * 1.6) + '" width="1" height="1" fill="#6a707a"/>';
          if (c) o += foamDome(x, y - 1.5, 2.6 + c * 1.1, 0, 0);
          return o;
        }
        function bowl() {
          var o = E(BOWL.x + 1, BOWL.y + 7, 17, 3.2, "rgba(58,36,20,.25)") + E(BOWL.x, BOWL.y, 16, 5, "#3a2414") + E(BOWL.x, BOWL.y, 15, 4.2, "#f2e8d8");
          o += '<path d="M' + (BOWL.x - 15) + ' ' + BOWL.y + 'Q' + BOWL.x + ' ' + (BOWL.y + 16) + ' ' + (BOWL.x + 15) + ' ' + BOWL.y + 'Z" fill="#3a2414"/><path d="M' + (BOWL.x - 14) + ' ' + (BOWL.y + .5) + 'Q' + BOWL.x + ' ' + (BOWL.y + 14) + ' ' + (BOWL.x + 14) + ' ' + (BOWL.y + .5) + 'Z" fill="#e8d4b8"/>';
          o += E(BOWL.x, BOWL.y, 13.5, 3.4, "#c8a890"); for (var k = 0; k < Math.min(6, inBowl); k++) o += foamDome(BOWL.x - 8 + (k % 3) * 7, BOWL.y - 1 + Math.floor(k / 3) * 1.2, 3, 0, k);
          return o;
        }
        var stop = loop(function (dt, t) {
          now = t;
          next -= dt; if (next <= 0 && foams.length < 5 && n + foams.length < N + 2) { next = .6 + Math.random() * .5; for (var g = 0; g < 20; g++) { var x = 102 + (Math.random() - .5) * 64, y = 72 + (Math.random() - .5) * 26; if (inside(x, y)) { foams.push({ x: x, y: y, a: 0, s: Math.random() * 10 }); break; } } }
          var o = "";
          foams.forEach(function (f) { f.a = Math.min(1, f.a + dt * 2); o += foamDome(f.x, f.y + Math.sin(t * 2 + f.s) * .4, 2 + f.a * 3.4, t, f.s); });
          $p("pov-fx").innerHTML = crisp(o);
          var tl = bowl() + (drag ? ladle(drag.x, drag.y, carry) : ladle(126, 106, carry));
          if (!drag && !n && !carry) { var on = Math.floor(t * 2.5) % 2; tl += sq(100, 50 + on * 2, 3, 4, "#f6c84a") + sq(98, 54 + on * 2, 7, 1, "#f6c84a"); }
          if (carry >= CAP && !drag) { var on2 = Math.floor(t * 2.5) % 2; tl += sq(BOWL.x - 1, BOWL.y - 18 + on2 * 2, 3, 4, "#f6c84a") + sq(BOWL.x - 3, BOWL.y - 14 + on2 * 2, 7, 1, "#f6c84a"); }
          var f0 = face && t < faceT ? face : done ? { eyes: "happy", mouth: "grin", blush: true, paws: "up" } : carry >= CAP ? { eyes: "look_l", mouth: "open", paws: "side_l" } : { eyes: "look_l", mouth: "smile", paws: "hold" };
          tl += watcher(f0, t, face && t < faceT ? -Math.abs(Math.round(Math.sin(t * 12))) : 0) + heartsSvg(hearts, t);
          $p("pov-tool").innerHTML = crisp(tl);
        });
        function finish() { done = true; tip("Kein Schaum mehr – schön klar!", 1800); beep([[784, .06], [988, .06], [1319, .1]]); for (var h = 0; h < 4; h++) hearts.push({ x: 140 + h * 8, y: 96, t0: now + h * .15 }); setTimeout(function () { stop(); $p("pov-fx").innerHTML = ""; $p("pov-tool").innerHTML = ""; res(); }, 1400); }
        function touch(p) {
          if (done) return;
          if (Math.hypot(p.x - BOWL.x, (p.y - BOWL.y) * 1.6) < 16) {
            if (carry) { inBowl += carry; carry = 0; beep([[520, .04], [660, .05]]); setFace({ eyes: "happy", mouth: "grin", paws: "up" }, 700); if (n >= N) finish(); else tip("In die Schale – weiter!", 1100); }
            return;
          }
          foams = foams.filter(function (f) {
            if (Math.hypot(f.x - p.x, (f.y - p.y) * 1.5) > 9) return true;
            if (carry >= CAP) { if (now - warned > 1.5) { warned = now; tip("Der Löffel ist voll – ab in die Schale", 1500); beep([[300, .05]]); } return true; }
            carry++; n++; X.bar(n / N); beep([[700 + n * 40, .03]]); setFace({ eyes: "happy", mouth: "smile", paws: "hold" }, 400);
            return false;
          });
          if (n >= N && !carry && !done) finish();
        }
        svgEl.onpointerdown = function (ev) { drag = svgPt(ev); touch(drag); try { svgEl.setPointerCapture(ev.pointerId); } catch (e) {} };
        svgEl.onpointermove = function (ev) { if (!drag) return; drag = svgPt(ev); touch(drag); };
        svgEl.onpointerup = function () { drag = null; };
      });
    };

    // ---- jam: watch it thicken (bubbles, the drips from the spoon, the hamster's face) and test a drop on the cold plate
    COOK_EXT.gel = function (X) {
      return new Promise(function (res) {
        setView("pot"); X.head(X.i, "Gelierprobe"); $p("pov-ring").hidden = true;
        var th = .15, done = false, base = liqCol || X.target, now = 0, mode = "pot", bub = [], rings = [], drop = null, dripT = 0, falling = [], sweat = [], hearts = [], plate = null, lastCol = 0, plopT = 0, tests = 0, phase = 0, face = null;
        window.__k2th = function () { return th; }; window.__k2set = function (v) { th = v; }; window.__k2mode = function () { return mode + (plate ? ":" + (plate.res || plate.st) : ""); };
        var HX = 130, HY = 92, SX = 118, SY = 6, DX = 123, DY = 50, PX = 8, PY = 36, CX = 78, CY = 70;
        function col() { return mix(base, "#6a1420", Math.min(1, th) * .5); }
        function kk() { return Math.max(0, Math.min(1, (th - .15) / .75)); }
        function inPot(x, y) { return Math.pow((x - 102) / 34, 2) + Math.pow((y - 71) / 15, 2) <= 1; }
        function hamster(t) {
          // the hamster beside the pot shows how far it is: calm, sniffing, delighted, then sweating and fidgeting
          var f, bob = 0;
          if (face) { f = face; bob = Math.round(Math.sin(t * 14)); }
          else if (th < .42) f = { eyes: "down", mouth: "smile", paws: "hold" };
          else if (th < .55) { var sn = Math.floor(t * 7) % 2; f = { eyes: "wide", mouth: "open", nose: sn, paws: "hold" }; bob = sn ? -1 : 0; }
          else if (th < .85) { f = { eyes: "happy", mouth: "grin", blush: true, paws: "up" }; bob = -Math.abs(Math.round(Math.sin(t * 9) * 2)); }
          else { var fi = Math.floor(t * 5) % 2; f = { eyes: "wide", mouth: "teeth", paws: fi ? "side_l" : "side_r" }; bob = fi ? -1 : 1; }
          var o = '<g transform="translate(' + (HX + (th >= .85 && !face ? (Math.floor(t * 5) % 2 ? -1 : 1) : 0)) + ' ' + (HY + bob) + ')">' + hamFace(f) + '</g>';
          sweat.forEach(function (s) { o += sq(s.x, s.y, 2, 3, "#3a2414") + sq(s.x, s.y + 1, 2, 1, "#a8d8f0") + sq(s.x + .5, s.y, 1, 1, "#ffffff"); });
          hearts.forEach(function (h) { var u = (t - h.t0) / 1.2; if (u > 0 && u < 1) o += '<g opacity="' + (1 - u).toFixed(2) + '" transform="translate(' + h.x + ' ' + (h.y - u * 16).toFixed(1) + ')"><path fill="#3a2414" d="M-4 0h3v1h2v-1h3v1h1v3h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-3h1z"/><path fill="#e8554a" d="M-3 1h2v1h2v-1h2v3h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1z"/></g>'; });
          return o;
        }
        function arrow(x, y, t) { var on = Math.floor(t * 2.5) % 2; return sq(x, y + on * 2, 3, 4, "#f6c84a") + sq(x - 2, y + 4 + on * 2, 7, 1, "#f6c84a") + sq(x - 1, y + 5 + on * 2, 5, 1, "#f6c84a"); }
        function blobDrop(x, y, rx, ry, c, gloss) {
          var o = '<ellipse cx="' + x.toFixed(1) + '" cy="' + (y + 1).toFixed(1) + '" rx="' + (rx + 1).toFixed(1) + '" ry="' + (ry + 1).toFixed(1) + '" fill="#3a1018"/>';
          o += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) + '" fill="' + c + '"/>';
          if (gloss) o += '<ellipse cx="' + (x - rx * .35).toFixed(1) + '" cy="' + (y - ry * .4).toFixed(1) + '" rx="' + (rx * .38).toFixed(1) + '" ry="' + (ry * .28).toFixed(1) + '" fill="#ffffff" opacity="' + gloss + '"/>' + sq(x - rx * .55, y - ry * .55, 2, 1, "#ffffff");
          return o;
        }
        // ---------- the pot: bubbles, the spoon and its drips
        function potFrame(dt, t) {
          var k = kk(), c = col();
          // bubbles: many small quick ones at first, later few big slow ones that burst with a ring
          var rate = 14 - k * 11.5;
          if (Math.random() < rate * dt) for (var g = 0; g < 8; g++) { var x = 102 + (Math.random() - .5) * 64, y = 71 + (Math.random() - .5) * 28; if (inPot(x, y)) { bub.push({ x: x, y: y, u: 0, life: .35 + k * 1.5, r: 1 + k * 3.6 + Math.random() * k }); break; } }
          var o = "";
          bub = bub.filter(function (b) {
            b.u += dt / b.life;
            if (b.u >= 1) {
              if (k > .45) { rings.push({ x: b.x, y: b.y, u: 0, r: b.r }); if (t - plopT > .45) { plopT = t; beep([[150 + Math.random() * 40, .05], [110, .04]]); } }
              return false;
            }
            var r = b.r * Math.min(1, b.u * 1.6);
            o += '<ellipse cx="' + b.x.toFixed(1) + '" cy="' + b.y.toFixed(1) + '" rx="' + (r + .6).toFixed(1) + '" ry="' + (r * .7 + .6).toFixed(1) + '" fill="' + mix(c, "#2a0a10", .35) + '"/><ellipse cx="' + b.x.toFixed(1) + '" cy="' + (b.y - .3).toFixed(1) + '" rx="' + r.toFixed(1) + '" ry="' + (r * .7).toFixed(1) + '" fill="' + mix(c, "#ffffff", .22) + '"/>';
            if (r > 1.8) o += sq(b.x - r * .5, b.y - r * .45, 1, 1, "#ffffff");
            return true;
          });
          rings = rings.filter(function (q) { q.u += dt / .5; if (q.u >= 1) return false; var r = q.r + q.u * 5; o += '<ellipse cx="' + q.x.toFixed(1) + '" cy="' + q.y.toFixed(1) + '" rx="' + r.toFixed(1) + '" ry="' + (r * .6).toFixed(1) + '" fill="none" stroke="' + mix(c, "#ffffff", .3) + '" stroke-width="1" opacity="' + (1 - q.u).toFixed(2) + '"/>'; return true; });
          $p("pov-fx").innerHTML = o;
          // the spoon held over the pot: a quick thin stream, then slow fat drops, then a thick curtain that hardly moves
          var s = "", dc = mix(c, "#ffffff", .12), dk = "#3a1018";
          if (th < .42) {
            var wob = Math.round(Math.sin(t * 20)) * .5;
            s += sq(DX - 1 + wob, DY, 4, 70 - DY, dk) + sq(DX + wob, DY, 2, 70 - DY, dc) + sq(DX + wob, DY, 1, 70 - DY, mix(dc, "#ffffff", .35));
            if (Math.random() < .5) rings.push({ x: DX + 1, y: 70, u: .3, r: .5 });
          } else if (th < .85) {
            var iv = .3 + (th - .42) * 4.5;
            if (!drop) drop = { u: 0 };
            drop.u += dt / iv;
            var dr = .8 + drop.u * (1 + (th - .42) * 3);
            if (th > .6) s += sq(DX - 1, DY, 4, 2 + drop.u * 3, dk) + sq(DX, DY, 2, 2 + drop.u * 3, dc);
            s += blobDrop(DX + 1, DY + 1 + dr * .6 + (th > .6 ? drop.u * 3 : 0), dr, dr * 1.15, dc, .6);
            if (drop.u >= 1) { falling.push({ y: DY + 3, v: 10, r: dr }); drop = null; }
          } else {
            var L = 9 + Math.sin(t * 1.3) * 1.5 + Math.min(4, (th - .85) * 20);
            s += sq(DX - 5, DY - 2, 12, L, dk) + sq(DX - 4, DY - 2, 10, L - 1, dc) + sq(DX - 3, DY - 1, 1, L - 3, mix(dc, "#ffffff", .4));
            s += blobDrop(DX - 2.5, DY + L - 2, 2.6, 2.2, dc, 0) + blobDrop(DX + 1, DY + L - 1 + Math.round(Math.sin(t * 2)), 2.6, 2.6, dc, 0) + blobDrop(DX + 4.5, DY + L - 2, 2.4, 2.2, dc, 0);
          }
          falling = falling.filter(function (f) { f.v += 260 * dt; f.y += f.v * dt; if (f.y > 70) { rings.push({ x: DX + 1, y: 70, u: 0, r: f.r }); return false; } s += blobDrop(DX + 1, f.y, f.r, f.r * 1.3, dc, .5); return true; });
          s += img("gel_spoon", SX, SY, " rotate(18 6 37)");
          if (!tests && !done) s += arrow(80, 36, t);
          s += hamster(t);
          $p("pov-tool").innerHTML = s;
          if (t - lastCol > .4) { lastCol = t; setLiquid(c); }
          if (Math.random() < .5 * dt + k * .6 * dt) puff(102 + (Math.random() - .5) * 50, 64 + (Math.random() - .5) * 14);
        }
        // ---------- the cold plate up close
        function plateFrame(dt, t) {
          var P = plate, c = P.c, o = img("plate_big", PX, PY), u;
          P.u += dt;
          if (P.st === "pour") {
            u = Math.min(1, P.u / .55);
            o += img("gel_spoon", CX - 6, -26 + u * 22, " rotate(" + (-20 + u * 20).toFixed(0) + " 6 37)");
            if (u < 1) o += blobDrop(CX, 26 + u * (CY - 26), 2.5, 3, c, .5);
            else { P.st = "cool"; P.u = 0; beep([[520, .04], [420, .05]]); }
          } else {
            var sp = P.st === "cool" ? Math.min(1, P.u / .35) : 1, rx = 4 + sp * 13, ry = 3 + sp * 6;
            if (P.st === "cool") { o += img("gel_spoon", CX - 6, -4 - P.u * 30); if (P.u > .5) { P.st = "wait"; P.u = 0; } }
            if (!P.res) {
              o += blobDrop(CX, CY, rx, ry, c, .7);
              if (P.drag) o += '<path d="M' + (P.sx) + ' ' + CY + 'H' + P.drag.x.toFixed(0) + '" stroke="' + mix(c, "#2a0a10", .5) + '" stroke-width="2"/>';
              else if (P.st === "wait" && !tests) o += sq(CX - 20, CY - 16, 40, 1, "rgba(246,200,74,0)") + arrow(CX - 1 + Math.round(Math.sin(t * 3) * 14), CY - 22, t);
            } else {
              // the drop after the swipe: two halves with a groove between them
              var r = P.res, a = Math.min(1, P.u / .9), gap, cl = mix(c, "#2a0a10", r === "stiff" ? .25 : 0);
              gap = r === "run" ? 6 * (1 - a) : r === "wrinkle" ? 6 : 3;
              var spread = r === "run" ? a * 9 : 0, flat = r === "run" ? a * 2.5 : 0;
              o += '<defs><clipPath id="k2gl"><rect x="0" y="0" width="' + CX + '" height="135"/></clipPath><clipPath id="k2gr"><rect x="' + CX + '" y="0" width="180" height="135"/></clipPath></defs>';
              o += '<g clip-path="url(#k2gl)"><g transform="translate(' + (-gap / 2).toFixed(1) + ' 0)">' + blobDrop(CX, CY + flat * .4, rx + spread, ry - flat, cl, r === "stiff" ? .25 : .7) + '</g></g>';
              o += '<g clip-path="url(#k2gr)"><g transform="translate(' + (gap / 2).toFixed(1) + ' 0)">' + blobDrop(CX, CY + flat * .4, rx + spread, ry - flat, cl, r === "stiff" ? .25 : .7) + '</g></g>';
              if (r === "run") for (var k2 = 0; k2 < 3; k2++) o += sq(CX + rx + spread - 2, CY - 2 + k2 * 2, 2 + a * (6 + k2 * 4), 1, c);
              if (r === "wrinkle") for (var w = 0; w < 4; w++) { var wy = CY - 5 + w * 3, wx = CX + gap / 2 + 2 + (w % 2); o += '<path d="M' + wx + ' ' + wy + 'q2 1.5 0 3" stroke="' + mix(c, "#2a0a10", .55) + '" stroke-width="1" fill="none"/><path d="M' + (CX - gap / 2 - 3 - (w % 2)) + ' ' + wy + 'q-2 1.5 0 3" stroke="' + mix(c, "#2a0a10", .55) + '" stroke-width="1" fill="none"/>'; }
              if (r === "stiff") o += sq(CX - gap / 2 - 1, CY - ry + 1, 1, ry * 2 - 2, mix(c, "#2a0a10", .6)) + sq(CX + gap / 2, CY - ry + 1, 1, ry * 2 - 2, mix(c, "#2a0a10", .6));
              if (r === "run" && P.u > 1.7 && !done) backToPot();
            }
          }
          if (P.drag) o += img("taste_spoon", P.drag.x - 6, P.drag.y - 34, " rotate(-25 6 34)");
          o += hamster(t);
          $p("pov-tool").innerHTML = o;
        }
        function backToPot() { mode = "pot"; plate = null; setView("pot"); setLiquid(col()); bind(); }
        function toPlate() {
          mode = "plate"; tests++; setView("board"); bind(); $p("pov-fx").innerHTML = "";
          plate = { st: "pour", u: 0, c: col() }; beep([[500, .04]]);
          if (tests === 1) tip("Mit dem Löffel durch den Tropfen fahren", 2200);
        }
        var stop = loop(function (dt, t) {
          now = t; if (!done) th += dt / 16;
          var ph = th < .42 ? 0 : th < .55 ? 1 : th < .85 ? 2 : 3;
          if (ph !== phase && !done) { phase = ph; if (ph === 1) beep([[660, .04], [700, .04]]); if (ph === 2) beep([[784, .05], [988, .07]]); if (ph === 3) { tip(N() + " wird ganz nervös!", 1800); beep([[300, .06], [260, .06]]); } }
          if (th >= .85 && !face && Math.random() < dt * 3) sweat.push({ x: HX + 8 + Math.random() * 30, y: HY + 2, vx: (Math.random() - .5) * 30, vy: -20 - Math.random() * 15 });
          sweat = sweat.filter(function (s) { s.vy += 90 * dt; s.x += s.vx * dt; s.y += s.vy * dt; return s.y < HY + 30; });
          if (mode === "pot") potFrame(dt, t); else plateFrame(dt, t);
          if (!done && th >= 1.05) { face = { eyes: "sad", mouth: "frown", paws: "cover" }; end(1, "Zu lange gekocht, jetzt ist sie sehr fest"); }
        });
        function end(g, msg) {
          done = true; X.grades.push(g); tip(msg, 2200);
          if (g === 3) for (var h = 0; h < 4; h++) hearts.push({ x: HX + 10 + h * 8, y: HY + 4, t0: now + h * .15 });
          setTimeout(function () { stop(); $p("pov-tool").innerHTML = ""; $p("pov-fx").innerHTML = ""; if (mode !== "pot") { setView("pot"); setLiquid(col()); } res(); }, 1900);
        }
        function judge() {
          var P = plate; P.u = 0;
          if (th < .55) { P.res = "run"; tip("Noch zu flüssig, sie läuft wieder zusammen", 1800); beep([[300, .06], [250, .06]]); face = { eyes: "look_l", mouth: "flat", paws: "hold" }; setTimeout(function () { if (!done) face = null; }, 1600); }
          else if (th <= .85) { P.res = "wrinkle"; face = { eyes: "happy", mouth: "grin", blush: true, paws: "up" }; beep([[784, .06], [988, .06], [1319, .1]]); end(3, "Sie wirft Falten: perfekt!"); }
          else { P.res = "stiff"; face = { eyes: "half", mouth: "flat", paws: "hold" }; beep([[440, .06], [392, .08]]); end(2, "Schon recht fest, aber gut"); }
        }
        function bind() {
          svgEl.onpointerdown = function (ev) {
            if (done) return; var p = svgPt(ev);
            if (mode === "pot") { if (Math.pow((p.x - 102) / 46, 2) + Math.pow((p.y - 70) / 26, 2) <= 1) toPlate(); return; }
            if (plate && plate.st === "wait" && !plate.res && Math.abs(p.x - CX) < 34 && Math.abs(p.y - CY) < 20) { plate.drag = p; plate.sx = Math.round(p.x); try { svgEl.setPointerCapture(ev.pointerId); } catch (e) {} }
          };
          svgEl.onpointermove = function (ev) {
            if (!plate || !plate.drag || plate.res) return; var p = svgPt(ev); plate.drag = p;
            if (Math.abs(p.x - plate.sx) > 14) { plate.drag = null; judge(); }
          };
          svgEl.onpointerup = function () { if (plate) plate.drag = null; };
        }
        bind();
      });
    };

    // ---- salad: slice the cucumber on the mandoline, seen from above: a slice only on each push from left to right over the blade
    COOK_EXT.planer = function (X) {
      if (X.items.indexOf("cucumber") < 0) return Promise.resolve();
      return new Promise(function (res) {
        setView("board"); X.head(X.i, "Gurke hobeln"); $p("pov-ring").hidden = false; X.bar(0);
        var w = SZ.big_cucumber[0], h = SZ.big_cucumber[1], cx = 84 - 14 - SZ.big_cucumber[0] / 2, n = 0, N = 8, drag = null, done = false, pile = [], falling = [], armed = true, face = null, faceT = 0, now = 0, hearts = [], warned = 0;
        var BX = 84;   // the blade
        window.__k2plan = function () { return { n: n, cx: cx, len: len() }; };
        function len() { return Math.round(w * (1 - n / N * .8)); }
        function render(t) {
          var l = len(), x0 = Math.round(cx - l / 2), y0 = 72 - h;
          var o = img("mandoline", 34, 54);
          pile.forEach(function (q) { o += img("chunk_cucumber", q[0], q[1]); });
          falling.forEach(function (f) { o += '<g transform="translate(' + f.x.toFixed(1) + ' ' + f.y.toFixed(1) + ') rotate(' + f.r.toFixed(0) + ' 4 3)">' + A.chunk_cucumber + '</g>'; });
          // the cucumber gets shorter at its right end, where the blade cuts; the pale cut face shows there
          o += '<defs><clipPath id="k2cuc"><rect x="' + x0 + '" y="' + (y0 - 2) + '" width="' + l + '" height="' + (h + 4) + '"/></clipPath></defs><g clip-path="url(#k2cuc)">' + img("big_cucumber", x0, y0) + '</g>';
          if (n) o += E(x0 + l - 1, y0 + h / 2, 2.6, h / 2 - 1, "#3a2414") + E(x0 + l - 1.4, y0 + h / 2, 2, h / 2 - 2, "#d8f0b8") + E(x0 + l - 1.4, y0 + h / 2, 1, h / 2 - 5, "#eef8dc");
          if (!drag && n < N) { var on = Math.floor(t * 2.5) % 2; o += sq(x0 + l / 2 - 8 + on * 4, y0 - 9, 14, 1, "#f6c84a") + sq(x0 + l / 2 + 4 + on * 4, y0 - 11, 1, 5, "#f6c84a") + sq(x0 + l / 2 + 5 + on * 4, y0 - 10, 1, 3, "#f6c84a"); }
          var f0 = face && t < faceT ? face : done ? { eyes: "happy", mouth: "grin", blush: true, paws: "up" } : drag ? { eyes: "wide", mouth: "open", paws: "cover" } : { eyes: "look_l", mouth: "smile", paws: "hold" };
          o += watcher(f0, t, face && t < faceT ? -1 : 0) + heartsSvg(hearts, t);
          $p("pov-float").innerHTML = crisp(o);
        }
        var stop = loop(function (dt, t) {
          now = t;
          falling = falling.filter(function (f) { f.v += 220 * dt; f.y += f.v * dt; f.x += f.vx * dt; f.r += f.vr * dt; if (f.y >= f.ty) { pile.push([f.x, f.ty]); return false; } return true; });
          render(t);
        });
        svgEl.onpointerdown = function (ev) { drag = svgPt(ev).x; try { svgEl.setPointerCapture(ev.pointerId); } catch (e) {} };
        svgEl.onpointermove = function (ev) {
          if (drag == null || done) return; var x = svgPt(ev).x, dx = x - drag; drag = x;
          var l = len(), ncx = Math.max(24 - l / 2, Math.min(172 - l / 2, cx + dx)), endA = cx + l / 2, endB = ncx + l / 2;
          // back to the left of the blade: ready for the next slice
          if (endB < BX - 6) armed = true;
          // pushing right: the right end crosses the blade and one slice comes off
          if (dx > 0 && endA <= BX + 2 && endB > BX + 2) {
            if (armed) {
              armed = false; n++; X.bar(n / N);
              falling.push({ x: BX + 2, y: 66, v: 10, vx: 6 + Math.random() * 10, vr: (Math.random() - .5) * 400, r: 0, ty: 92 + Math.random() * 14 });
              beep([[1300 + Math.random() * 200, .02]]); face = { eyes: "happy", mouth: "smile", paws: "hold" }; faceT = now + .35;
              if (n === 4) tip("Schön dünn!", 1200);
              if (n >= N) { done = true; X.cut.cucumber = 4; tip("Fertig gehobelt!", 1400); beep([[784, .06], [988, .06], [1319, .1]]); for (var k = 0; k < 4; k++) hearts.push({ x: 140 + k * 8, y: 96, t0: now + k * .15 }); setTimeout(function () { stop(); $p("pov-float").innerHTML = ""; res(); }, 1400); }
            }
          }
          cx = ncx;
        };
        svgEl.onpointerup = function () { drag = null; };
      });
    };

    // ---- salad: shake the jar until oil and vinegar are one creamy dressing
    COOK_EXT.shake = function (X) {
      var keepFl = floaters.slice(), keepBowl = bowlK, keepView = view;
      return new Promise(function (res0) {
        // afterwards the salad bowl comes back with everything that was already in it
        function res() { if (keepView === "bowl") { setView("bowl"); setBowl(keepBowl || "greens"); floaters = keepFl; } res0(); }
        setView("board"); X.head(X.i, "Dressing schütteln"); $p("pov-ring").hidden = false; X.bar(0);
        var jy = 0, vy = 0, dir = 0, run = 0, n = 0, N = 12, drag = null, done = false, slosh = 0, rot = 0, drops = [], hearts = [], now = 0, said = 0;
        window.__k2shake = function () { return n; };
        function jar(t, m) {
          // a glass jar seen a little from above: red lid, glass with light, two layers that become one
          var x = 90, top = 30 + Math.round(jy), bot = 88 + Math.round(jy), rx = 17, ry = 4.4, oil = "#f0d060", vin = "#c8805a", emu = "#e8b868";
          var o = E(x + 1, 96, 19 * (1 - Math.abs(jy) / 60), 3.2, "rgba(58,36,20,.25)");
          o += '<g transform="translate(' + Math.round(rot / 6) + ' 0)">';   /* shaking sideways by whole pixels instead of a blurry turn */
          o += E(x, bot, rx + 1, ry + 1, "#3a2414") + '<rect x="' + (x - rx - 1) + '" y="' + (top + 6) + '" width="' + (2 * rx + 2) + '" height="' + (bot - top - 6) + '" fill="#3a2414"/>';
          o += E(x, bot, rx, ry, "#cfe4ec") + '<rect x="' + (x - rx) + '" y="' + (top + 6) + '" width="' + (2 * rx) + '" height="' + (bot - top - 6) + '" fill="#dceef4"/>';
          // the dressing: vinegar below, oil above, the line between them sloshing; it all turns creamy as you shake
          var lt = top + 22, mid = top + 38 + Math.round(slosh);
          o += E(x, bot - 1, rx - 1.5, ry - 1, mix(vin, emu, m)) + '<rect x="' + (x - rx + 1.5) + '" y="' + mid.toFixed(1) + '" width="' + (2 * rx - 3) + '" height="' + (bot - 1 - mid).toFixed(1) + '" fill="' + mix(vin, emu, m) + '"/>';
          o += '<rect x="' + (x - rx + 1.5) + '" y="' + lt + '" width="' + (2 * rx - 3) + '" height="' + (mid - lt).toFixed(1) + '" fill="' + mix(oil, emu, m) + '"/>' + E(x, mid, rx - 1.5, ry - 1.2, mix(mix(oil, vin, .5), emu, m));
          o += E(x, lt, rx - 1.5, ry - 1, mix(mix(oil, "#ffffff", .3), emu, m));
          drops.forEach(function (d) { o += E(x + d.x, d.y + Math.round(jy), Math.max(1, Math.round(d.r)), Math.max(1, Math.round(d.r * .8)), mix("#fff4c0", emu, m), ' opacity=".8"'); });
          for (var k = 0; k < 9; k++) { var hx = x - 12 + (k * 7) % 24, hy = lt + 4 + ((k * 11 + Math.round(t * 8 * (m + .1))) % (bot - lt - 8)); o += '<rect x="' + hx + '" y="' + hy.toFixed(0) + '" width="1" height="1" fill="#5aa04e"/>'; }
          o += '<rect x="' + (x - rx + 2) + '" y="' + (top + 8) + '" width="2" height="' + (bot - top - 14) + '" fill="#ffffff" opacity=".75"/><rect x="' + (x + rx - 4) + '" y="' + (top + 10) + '" width="1" height="' + (bot - top - 20) + '" fill="#ffffff" opacity=".5"/>';
          o += E(x, top + 6, rx + 1, ry + 1, "#3a2414") + E(x, top + 6, rx, ry, "#b8d8e0");
          o += '<rect x="' + (x - rx - 1) + '" y="' + top + '" width="' + (2 * rx + 2) + '" height="6" fill="#3a2414"/><rect x="' + (x - rx) + '" y="' + (top + 1) + '" width="' + (2 * rx) + '" height="4" fill="#d8463c"/>' + E(x, top, rx + 1, ry + 1, "#3a2414") + E(x, top, rx, ry, "#e8554a") + E(x - 4, top - 1, 6, 1.4, "#ff8a7a");
          for (var r2 = 0; r2 < 2 * rx; r2 += 3) o += '<rect x="' + (x - rx + r2) + '" y="' + (top + 2) + '" width="1" height="3" fill="#a8302a"/>';
          return o + '</g>';
        }
        function render(t) {
          var m = n / N, o = jar(t, m);
          if (!drag && !n) { var on = Math.floor(t * 2.5) % 2; o += sq(116, 46 + on * 2, 1, 14, "#f6c84a") + sq(114, 46 + on * 2, 5, 1, "#f6c84a") + sq(114, 59 + on * 2, 5, 1, "#f6c84a"); }
          var bounce = drag ? -Math.abs(Math.round(Math.sin(t * 10) * 2)) : 0;
          var f0 = done ? { eyes: "happy", mouth: "grin", blush: true, paws: "up" } : drag ? { eyes: "happy", mouth: "open", paws: Math.floor(t * 6) % 2 ? "side_l" : "side_r" } : { eyes: "look_l", mouth: "smile", paws: "hold" };
          o += watcher(f0, t, bounce) + heartsSvg(hearts, t);
          $p("pov-float").innerHTML = crisp(o);
        }
        var stop = loop(function (dt, t) {
          now = t;
          if (!drag) { jy *= .85; rot *= .8; }
          slosh = slosh * .9 + vy * .02; vy *= .8;
          drops.forEach(function (d) { d.y += d.v * dt; d.x += d.vx * dt; d.life -= dt; }); drops = drops.filter(function (d) { return d.life > 0; });
          render(t);
        });
        svgEl.onpointerdown = function (ev) { drag = svgPt(ev).y; dir = 0; run = 0; try { svgEl.setPointerCapture(ev.pointerId); } catch (e) {} };
        svgEl.onpointermove = function (ev) {
          if (drag == null || done) return; var y = svgPt(ev).y, dy = y - drag; drag = y;
          jy = Math.max(-22, Math.min(22, jy + dy)); vy = dy * 6; rot = Math.max(-10, Math.min(10, rot + dy * .6)); var sd = dy > 0 ? 1 : dy < 0 ? -1 : 0;
          if (Math.abs(dy) > 1 && Math.random() < .5) drops.push({ x: (Math.random() - .5) * 24, y: 52 + Math.random() * 30, v: -dy * 4, vx: (Math.random() - .5) * 10, r: .8 + Math.random() * 1.2, life: .5 });
          if (sd && sd !== dir) {
            if (run > 10) {
              n++; X.bar(n / N); beep([[400 + n * 30, .03]]);
              if (n === 6 && !said) { said = 1; tip("Es wird cremig!", 1200); }
              if (n >= N) { done = true; tip("Gut vermischt!", 1400); beep([[784, .06], [988, .06], [1319, .1]]); for (var h = 0; h < 4; h++) hearts.push({ x: 140 + h * 8, y: 96, t0: now + h * .15 }); setTimeout(function () { stop(); $p("pov-float").innerHTML = ""; res(); }, 1300); }
            }
            dir = sd; run = 0;
          }
          run += Math.abs(dy);
        };
        svgEl.onpointerup = function () { drag = null; };
      });
    };

    window.__cook = function (d) { return new Promise(function (r) { if (busy) interrupt(); act("cook", function () { return cookGame(d).then(function (v) { r(v); }); }); }); };
  })();
