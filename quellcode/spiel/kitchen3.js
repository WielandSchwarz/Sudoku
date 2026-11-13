  // ===================== kitchen, round 3 (preview): a menu in tabs, more dishes, the frying pan, coffee and tea at home =====================
  (function () {
    var K3 = /*KITCHEN3*/;
    Object.keys(K3).forEach(function (k) { A[k] = K3[k].svg; SZ[k] = [K3[k].w, K3[k].h]; });
    VIEW_BG.pan = "pan_bg";

    // ---------- the tabs: sorted by how a dish is made, each way has its own place and little game ----------
    var KTABS = [{ id: "bake", n: "Backen" }, { id: "cook", n: "Kochen" }, { id: "fry", n: "Braten" }, { id: "fresh", n: "Frisch" }, { id: "jar", n: "Einmachen" }, { id: "drink", n: "Getränke" }];
    var OLD_CAT = { bread: "bake", cake: "bake", psoup: "cook", tsoup: "cook", salad: "fresh", jam: "jar" };
    for (var od in OLD_CAT) DISHES[od].cat = OLD_CAT[od];

    // ---------- the new dishes: only things from the garden, the beehive and the hazel tree ----------
    var NEW = {
      rolls: { name: "Kräuterbrötchen", cat: "bake", verb: "bake", dough: true, need: { sunflower: 1, herbs: 1 }, food: 26, fun: 8, say: "Kräuterbrötchen, außen knusprig.", col: "#e4b06a",
        plan: [["add", "bowl", ["flour"]], ["stir", "bowl"], ["knead"], ["bake", "bread"]], bakeTxt: "Die Brötchen backen. Hol sie raus, wenn sie goldbraun sind.", stirTxt: "Rühre Mehl, Kerne und Kräuter zu einem Teig: zwei Runden mit dem Finger." },
      nutroll: { name: "Honig-Nuss-Schnecken", cat: "bake", verb: "bake", dough: true, need: { nut: 2, honey: 1 }, food: 28, fun: 12, love: 6, say: "Honig-Nuss-Schnecken, noch klebrig vom Honig.", col: "#d8a050",
        plan: [["add", "bowl", ["flour"]], ["stir", "bowl"], ["knead"], ["bake", "bread"]], bakeTxt: "Die Schnecken backen. Hol sie raus, wenn sie goldbraun sind.", stirTxt: "Rühre Mehl, Honig und Nüsse zu einem Teig: zwei Runden mit dem Finger." },
      muffin: { name: "Kürbis-Muffins", cat: "bake", verb: "bake", batter: true, need: { pumpkin: 1, sunflower: 1 }, food: 26, fun: 14, say: "Kürbis-Muffins, warm und weich.", col: "#e89a48",
        plan: [["cut"], ["add", "bowl", ["flour", "egg"]], ["stir", "bowl"], ["bake", "cake"]], bakeTxt: "Die Muffins backen. Hol sie raus, wenn sie goldbraun sind." },
      tart: { name: "Erdbeertörtchen", cat: "bake", verb: "bake", batter: true, need: { strawberry: 2, honey: 1 }, food: 26, fun: 16, love: 8, say: "Erdbeertörtchen! Er schaut es erst lange an.", col: "#f0c88a",
        plan: [["add", "bowl", ["flour", "egg"]], ["stir", "bowl"], ["bake", "cake"], ["decorate"]], bakeTxt: "Der Tortenboden backt. Hol ihn raus, wenn er goldbraun ist." },
      csoup: { name: "Möhrensuppe", cat: "cook", verb: "cook", need: { gcarrot: 2, herbs: 1 }, food: 34, love: 6, say: "Möhrensuppe, schön sämig.", col: "#f08a24",
        plan: [["cut"], ["add", "pot"], ["stir", "pot"], ["season"], ["heat"]] },
      chili: { name: "Chili-Eintopf", cat: "cook", verb: "cook", need: { tomato: 1, chili: 1, pumpkin: 1 }, food: 42, fun: 8, say: "Chili-Eintopf! Seine Backen glühen.", col: "#b8302a",
        plan: [["cut"], ["add", "pot"], ["stir", "pot"], ["season"], ["heat"]] },
      pancake: { name: "Pfannkuchen mit Erdbeeren", cat: "fry", verb: "fry", batter: true, need: { strawberry: 1, sunflower: 1 }, food: 30, fun: 14, love: 6, say: "Pfannkuchen mit Erdbeeren!", col: "#f4d48a",
        plan: [["add", "bowl", ["flour", "egg"]], ["stir", "bowl"], ["flip", "pancake"]] },
      veg: { name: "Gemüsepfanne", cat: "fry", verb: "fry", need: { gcarrot: 1, pumpkin: 1, herbs: 1 }, food: 34, fun: 6, say: "Bunte Gemüsepfanne.", col: "#e8822a",
        plan: [["cut"], ["toss"]] },
      rosti: { name: "Kürbis-Rösti", cat: "fry", verb: "fry", need: { pumpkin: 1, herbs: 1 }, food: 30, fun: 8, say: "Kürbis-Rösti, schön knusprig.", col: "#e8822a",
        plan: [["cut"], ["flip", "rosti"]] },
      dsalad: { name: "Löwenzahnsalat mit Nüssen", cat: "fresh", verb: "fresh", greens: true, need: { dandelion: 2, nut: 1 }, food: 20, fun: 10, say: "Löwenzahnsalat mit gerösteten Nüssen.", col: "#8ac860",
        plan: [["cut"], ["add", "bowl"], ["shake"], ["stir", "bowl"]] },
      tsalad: { name: "Tomatensalat", cat: "fresh", verb: "fresh", greens: true, need: { tomato: 2, herbs: 1 }, food: 22, fun: 8, say: "Tomatensalat mit frischen Kräutern.", col: "#e2483a",
        plan: [["cut"], ["add", "bowl"], ["shake"], ["stir", "bowl"]] },
      nutcream: { name: "Honig-Nuss-Creme", cat: "jar", verb: "jar", jamlike: true, need: { nut: 2, honey: 1 }, food: 24, fun: 12, love: 8, say: "Honig-Nuss-Creme, direkt aus dem Glas.", col: "#a06a3a",
        plan: [["add", "pot"], ["mash"], ["heat"]] },
      csauce: { name: "Chilisoße", cat: "jar", verb: "jar", need: { chili: 2, tomato: 1 }, food: 14, fun: 16, say: "Chilisoße! Nur ein Tröpfchen.", col: "#d83a2a",
        plan: [["cut"], ["add", "pot"], ["mash"], ["season"], ["heat"]] },
      pickles: { name: "Gewürzgurken", cat: "jar", verb: "jar", need: { cucumber: 2, herbs: 1 }, food: 16, fun: 10, say: "Gewürzgurken, knackig und sauer.", col: "#5aa04a",
        plan: [["planer"], ["add", "bowl"], ["shake"]] }
    };
    Object.keys(NEW).forEach(function (k) {
      var R = NEW[k], art = "d_" + k; R.art = art;
      DISHES[k] = R; PLAN[k] = R.plan; DISH_COLOR[k] = R.col;
      FOOD[k] = art; FOOD[art] = art; GNAME[k] = R.name; GFOOD[k] = R; if (garden.harvest[k] == null) garden.harvest[k] = 0;
      CARRY_SAY[art] = R.name;
    });
    ["d_coffee", "d_tea", "d_cocoa"].forEach(function (k) { FOOD[k] = k; });

    // ---------- the menu ----------
    var kTab = "bake";
    function needHtml(R) { return Object.keys(R.need).map(function (k) { var sk = FOOD[k] || k; return '<span class="need' + ((garden.harvest[k] || 0) >= R.need[k] ? "" : " miss") + '">' + R.need[k] + '×' + (A[sk] ? svgOf(A[sk], SZ[sk][0], SZ[sk][1]) : "") + '</span>'; }).join(""); }
    function soft(n) { return n.replace("marmelade", "­marmelade").replace("brot", "­brot").replace("kuchen", "­kuchen").replace("suppe", "­suppe").replace("brötchen", "­brötchen").replace("salat", "­salat").replace("Schnecken", "­Schnecken"); }
    function openMenu(tab) {
      if (decor) return; if (tab) kTab = tab;
      var tabs = '<div class="ktabs">' + KTABS.map(function (t) { return '<button type="button" class="ktab" data-t="' + t.id + '" aria-pressed="' + (t.id === kTab) + '">' + svgOf(A["ti_" + t.id], 10, 10) + '<span>' + t.n + '</span></button>'; }).join("") + '</div>';
      var body;
      if (kTab === "drink") {
        body = '<div class="rgrid">' +
          '<button type="button" class="recipe" data-drink="coffee">' + xs("d_coffee") + '<span class="rn">Kaffee</span></button>' +
          '<button type="button" class="recipe" data-drink="tea">' + xs("d_tea") + '<span class="rn">Tee</span></button></div>';
      } else {
        var ds = Object.keys(DISHES).filter(function (d) { return DISHES[d].cat === kTab; });
        ds.sort(function (a, b) { return (canCook(b) ? 1 : 0) - (canCook(a) ? 1 : 0); });
        body = '<div class="rgrid">' + ds.map(function (d) { var R = DISHES[d]; return '<button type="button" class="recipe" data-d="' + d + '"' + (canCook(d) ? "" : " disabled") + '>' + xs(R.art) + '<span class="rn">' + soft(R.name) + '<small>' + needHtml(R) + '</small></span></button>'; }).join("") + '</div>';
      }
      var p = kPop('<button type="button" class="kp-x" aria-label="Schließen">×</button><p class="ph">Was machen wir?</p>' + tabs + body + (kTab === "drink" ? "" : '<p class="pn">Zutaten kommen aus dem Erntekorb im Garten.</p>'));
      p.classList.add("kpop3");
      p.addEventListener("click", function (e) {
        e.stopPropagation();
        if (e.target.closest(".kp-x")) { document.getElementById("k-ui").innerHTML = ""; return; }
        var t = e.target.closest(".ktab"); if (t) { openMenu(t.dataset.t); return; }
        var dr = e.target.closest("[data-drink]"); if (dr) { document.getElementById("k-ui").innerHTML = ""; if (s.asleep) return; if (busy) interrupt(); act("drink", function () { return homeDrink(dr.dataset.drink); }); return; }
        var b = e.target.closest(".recipe"); if (!b || b.disabled) return; document.getElementById("k-ui").innerHTML = "";
        if (s.asleep) return; if (busy) interrupt();
        act("cook", function () { return cookSeq(b.dataset.d); });
      });
    }
    ["k-stove", "k-oven", "k-board"].forEach(function (id) {
      var el = document.getElementById(id); if (!el) return;
      el.addEventListener("click", function (e) { e.stopImmediatePropagation(); openMenu(id === "k-oven" ? "bake" : id === "k-board" ? "fresh" : null); }, true);
    });

    // ---------- step: the frying pan. The underside browns; tap to flip when it is golden, twice ----------
    function pxDisc(cx, cy, rx, ry, colFn) {
      var o = "", y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
      for (var y = y0; y <= y1; y++) {
        var v = (y + .5 - cy) / ry; if (Math.abs(v) > 1) continue; var w = rx * Math.sqrt(1 - v * v), xa = Math.round(cx - w), xb = Math.round(cx + w);
        var x = xa; while (x < xb) { var c = colFn(x, y, (x + .5 - cx) / rx, v), x2 = x + 1; while (x2 < xb && colFn(x2, y, (x2 + .5 - cx) / rx, v) === c) x2++; if (c) o += '<rect x="' + x + '" y="' + y + '" width="' + (x2 - x) + '" height="1" fill="' + c + '"/>'; x = x2; }
      }
      return o;
    }
    var FRY = {
      pancake: { raw: "#f6e6b4", gold: "#e0a850", dark: "#6a3a1a", rx: 30, ry: 18, txt: "Der Pfannkuchen brät. Wenden, wenn die Unterseite goldbraun ist: tippe auf die Pfanne.", side2: "Jetzt die andere Seite." },
      rosti: { raw: "#f4b060", gold: "#c8742a", dark: "#5a2e14", rx: 28, ry: 17, txt: "Das Rösti brät. Wenden, wenn es unten goldbraun ist: tippe auf die Pfanne.", side2: "Jetzt die andere Seite." }
    };
    COOK_EXT.flip = function (X) {
      return new Promise(function (res) {
        var F_ = FRY[X.s[1]] || FRY.pancake, side = 0, b = [0, 0], t0 = performance.now(), fly = 0, flying = false, done = false, specks = [], T = 9000;
        setView("pan"); setLiquid(null); $p("pov-ring").hidden = true; $p("pov-bake").hidden = false;
        X.head(X.i, F_.txt);
        for (var k = 0; k < 26; k++) specks.push([Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random()]);
        function colAt(p) { return p < .6 ? mix(F_.raw, F_.gold, p / .6) : mix(F_.gold, F_.dark, (p - .6) / .4); }
        function draw(now) {
          if (done) return;
          var dt = 0;
          if (!flying) { b[side] = Math.min(1, (now - t0) / T); }
          var top = colAt(b[1 - side] * (side ? 1 : 0) + (side ? 0 : 0)), under = colAt(b[side]);
          var topCol = side === 0 ? F_.raw : colAt(b[0]);                                  // the side facing up: raw at first, then the browned first side
          var lift = flying ? Math.sin(fly * Math.PI) * 18 : 0, sq = flying ? Math.max(.25, Math.abs(Math.cos(fly * Math.PI))) : 1;
          var cx = 96, cy = 70 - lift, rx = F_.rx, ry = Math.max(2, F_.ry * sq);
          var o = '<ellipse cx="' + cx + '" cy="73" rx="' + (rx * (1 - lift / 60)) + '" ry="' + (F_.ry * .6) + '" fill="rgba(0,0,0,.25)"/>';
          var showUnder = flying && fly > .5;
          var face = showUnder ? under : topCol;
          o += pxDisc(cx, cy + 1, rx + 1, ry + 1, function () { return "#3a2414"; });
          o += pxDisc(cx, cy, rx, ry, function (x, y, u, v) {
            var edge = u * u + v * v > .78, c = face;
            if (edge) c = mix(face, "#000000", .14);
            if (!edge && u < -.2 && v < -.2 && u * u + v * v < .4) c = mix(face, "#ffffff", .14);
            return c;
          });
          if (X.s[1] === "pancake" && side === 0 && !flying && b[0] > .45) {             // bubbles on top tell you it is nearly time
            for (var j = 0; j < Math.min(12, Math.floor((b[0] - .45) * 40)); j++) { var sp = specks[j]; o += '<rect x="' + Math.round(cx + sp[0] * rx * .7) + '" y="' + Math.round(cy + sp[1] * ry * .6) + '" width="1" height="1" fill="' + mix(F_.raw, "#ffffff", .5) + '"/>'; }
          }
          if (X.s[1] === "rosti") for (var j2 = 0; j2 < 26; j2++) { var s2 = specks[j2]; o += '<rect x="' + Math.round(cx + s2[0] * rx * .75) + '" y="' + Math.round(cy + s2[1] * ry * .65) + '" width="2" height="1" fill="' + mix(face, s2[2] > .5 ? "#ffffff" : "#000000", .18) + '"/>'; }
          if (!flying && Math.random() < .25) { var a = Math.random() * 6.28; o += '<rect x="' + Math.round(cx + Math.cos(a) * (rx + 3)) + '" y="' + Math.round(cy + Math.sin(a) * (ry + 2)) + '" width="1" height="1" fill="#fff4e0"/>'; }   // it sizzles at the edge
          $p("pov-float").innerHTML = o;
          $p("pov-bake").innerHTML = woodBarSvg({ w: 72, col: colAt, zone: [.55, .72], mark: b[side] });
          if (!flying && b[side] >= 1) flip();
          requestAnimationFrame(draw);
        }
        function grade(p) { return p >= .55 && p <= .72 ? 3 : p >= .45 && p <= .82 ? 2 : 1; }
        function flip() {
          if (flying || done) return; flying = true; var g = grade(b[side]); X.grades.push(g); beep(g === 3 ? [[660, .05], [880, .07]] : [[440, .05], [330, .07]]);
          var f0 = performance.now();
          (function up(now) { fly = Math.min(1, (now - f0) / 650); if (fly < 1) return requestAnimationFrame(up);
            flying = false; fly = 0; beep([[220, .04]]);
            if (side === 0) { side = 1; t0 = performance.now(); X.head(X.i, F_.side2); }
            else { done = true; svgEl.onclick = $p("pov-bake").onclick = null; setTimeout(res, 300); }
          })(f0);
        }
        svgEl.onclick = $p("pov-bake").onclick = function () { flip(); };
        requestAnimationFrame(draw);
      });
    };
    // ---------- step: tossing vegetables in the pan. Swipe up to toss; wait too long and the bottom ones catch ----------
    COOK_EXT.toss = function (X) {
      return new Promise(function (res) {
        setView("pan"); setLiquid(null); $p("pov-ring").hidden = false; X.bar(0);
        X.head(X.i, "Schwenke das Gemüse: wisch 6-mal nach oben, bevor es unten anbrennt.");
        var cols = [], N = 6, n = 0, last = performance.now(), worst = 0, pieces = [], drag = null, done = false;
        X.items.forEach(function (k) { var c = { gcarrot: "#f08a24", pumpkin: "#e8822a", herbs: "#5aa04e", tomato: "#e2483a" }[k] || "#c8945a"; for (var q = 0; q < 6; q++) pieces.push({ x: 66 + Math.random() * 58, y: 56 + Math.random() * 26, c: c, h: 0, vy: 0, br: 0, w: k === "herbs" ? 3 : 6 }); });
        function draw(now) {
          if (done) return;
          var dt = Math.min(.05, (now - last) / 1000); last = now;
          var o = "";
          pieces.forEach(function (p) {
            if (p.h > 0 || p.vy) { p.vy -= 220 * dt; p.h = Math.max(0, p.h + p.vy * dt); if (p.h === 0) p.vy = 0; } else p.br = Math.min(1, p.br + dt / 5);
            var c = mix(p.c, "#3a1c0c", p.br * .7), y = Math.round(p.y - p.h);
            o += '<rect x="' + Math.round(p.x - 1) + '" y="' + (y - 1) + '" width="' + (p.w + 2) + '" height="' + (p.w > 3 ? 6 : 4) + '" fill="#3a2414"/><rect x="' + Math.round(p.x) + '" y="' + y + '" width="' + p.w + '" height="' + (p.w > 3 ? 4 : 2) + '" fill="' + c + '"/><rect x="' + Math.round(p.x) + '" y="' + (y + (p.w > 3 ? 3 : 1)) + '" width="' + p.w + '" height="1" fill="' + mix(c, "#000000", .2) + '"/><rect x="' + Math.round(p.x) + '" y="' + y + '" width="' + Math.max(1, p.w - 2) + '" height="1" fill="' + mix(c, "#ffffff", .3) + '"/>';
          });
          worst = Math.max(worst, pieces.reduce(function (m, p) { return Math.max(m, p.br); }, 0));
          if (!drag && n === 0) { var on = Math.floor(now / 400) % 2; o += '<rect x="150" y="' + (60 + on * 2) + '" width="3" height="14" fill="#f6c84a"/><rect x="147" y="' + (60 + on * 2) + '" width="9" height="2" fill="#f6c84a"/>'; }
          $p("pov-float").innerHTML = o;
          requestAnimationFrame(draw);
        }
        function toss() {
          n++; X.bar(n / N); beep([[330 + n * 40, .04], [494 + n * 40, .05]]);
          pieces.forEach(function (p) { p.vy = 70 + Math.random() * 60; p.h = .1; p.br = Math.max(0, p.br - .25); p.x = Math.max(56, Math.min(136, p.x + (Math.random() - .5) * 20)); p.y = Math.max(52, Math.min(86, p.y + (Math.random() - .5) * 10)); });
          if (n >= N) { done = true; X.grades.push(worst < .55 ? 3 : worst < .8 ? 2 : 1); svgEl.onpointerdown = svgEl.onpointermove = svgEl.onpointerup = null; setTimeout(res, 500); }
        }
        svgEl.onpointerdown = function (ev) { drag = svgPt(ev).y; try { svgEl.setPointerCapture(ev.pointerId); } catch (e) {} };
        svgEl.onpointermove = function (ev) { if (drag == null || done) return; var y = svgPt(ev).y; if (drag - y > 16) { drag = y; toss(); } else if (y > drag) drag = y; };
        svgEl.onpointerup = function () { drag = null; };
        requestAnimationFrame(draw);
      });
    };
    var _stationOf = stationOf; stationOf = function (s) { return s[0] === "flip" || s[0] === "toss" ? "stove" : _stationOf(s); };

    // ---------- coffee and tea at home: the café's games, with a few favourites, then Gaston drinks at the window ----------
    var corner = document.createElement("button"); corner.type = "button"; corner.className = "bs-prop bs-boxbtn k-coffee"; corner.setAttribute("aria-label", "Kaffeeecke");
    corner.style.left = gx(122); corner.style.top = gy(69); corner.style.width = gx(31); corner.innerHTML = svgOf(A.k_coffee, 31, 18);
    kitchenEl.appendChild(corner);
    corner.addEventListener("click", function (e) { e.stopPropagation(); if (s.asleep || decor) return; openMenu("drink"); });
    function kitchenImg() {
      var im = new Image(), k = home.kitchen;
      im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="180" height="135" viewBox="0 0 180 135" shape-rendering="crispEdges"><rect width="180" height="135" fill="#bfe3f7"/>' + kLayers(k).map(function (x) { return A[x]; }).join("") + '</svg>');
      return im;
    }
    var KC = /*KCLOSEUP*/, kcImg = {};
    Object.keys(KC).forEach(function (k) { var im = new Image(); im.src = KC[k]; kcImg[k] = im; });
    function kcSwap(on) {   /* the close-ups at home: the kitchen's own wall, worktop and shelf instead of the café's */
      if (typeof TIMG !== "object") return;
      if (on) { kcSwap.saved = { c: TIMG.bg_counter, s: TIMG.bg_shelf }; TIMG.bg_counter = kcImg.kc_counter; TIMG.bg_shelf = kcImg.kc_shelf; }
      else if (kcSwap.saved) { TIMG.bg_counter = kcSwap.saved.c; TIMG.bg_shelf = kcSwap.saved.s; kcSwap.saved = null; }
    }
    var DRINK = { coffee: { n: "Kaffee", art: "d_coffee", energy: 14, fun: 6 }, tea: { n: "Tee", art: "d_tea", energy: 6, fun: 8, love: 4 } };
    async function homeDrink(kind) {
      await walkTo(KSPOT.board.x - 4, KSPOT.board.y); H.dir = 1; front({ eyes: "happy", mouth: "grin", paws: "up" }); pulse("hop", 300);
      say(kind === "coffee" ? N() + " mahlt sich einen Kaffee." : N() + " setzt Teewasser auf."); await wait(500);
      var res = await new Promise(function (resolve) {
        kcSwap(true);
        cfHome = { el: scene, wall: kcImg.kc_wall, finished: false, done: function (k2, stars, title) { cfHome = null; kcSwap(false); resolve({ stars: stars, title: title }); }, quit: function () { cfHome = null; kcSwap(false); resolve(null); } };
        try { (kind === "coffee" ? coffeeGame : teaGame)(); } catch (er) { cfHome = null; kcSwap(false); resolve(null); }
      });
      if (!res) { say(kind === "coffee" ? "Doch kein Kaffee." : "Doch kein Tee."); front({ paws: "down" }); return; }
      var D = DRINK[kind], art = res.title && /Kakao/.test(res.title) ? "d_cocoa" : D.art;
      front({ hold: art, holdScale: 2, paws: "hold", eyes: "happy", mouth: "smile", blush: true }); await wait(300);
      await walkTo(KSPOT.window.x, KSPOT.window.y + 10); H.dir = -1;
      say(N() + " trinkt " + (res.title || D.n) + " am Fenster."); await wait(400);
      for (var q = 0; q < 4; q++) { F.mouth = q % 2 ? "smile" : "open"; F.eyes = q % 2 ? "happy" : "sleep"; front(); fx("spark", KSPOT.window.x + 4, 84 - q * 3, "sparkle"); await wait(450); }
      var hour = new Date().getHours(), morning = hour >= 5 && hour < 11 && kind === "coffee";
      s.energy = clamp(s.energy + D.energy + (morning ? 10 : 0)) ; s.fun = clamp(s.fun + D.fun); if (D.love) s.love = clamp(s.love + D.love); renderNeeds();
      front({ hold: null, eyes: "happy", mouth: "grin", paws: "up", blush: true }); pulse("hop", 400);
      say(morning ? "Der Morgenkaffee macht " + N() + " richtig wach." : res.stars === 3 ? "Genau so mag " + N() + " das." : N() + " ist zufrieden.");
      if (window.SudokuSave) window.SudokuSave(); await wait(900); front({ paws: "down" });
    }
    window.__k3 = { plan: function (d, pl) { var o = PLAN[d]; PLAN[d] = pl; return o; }, miss: function () { var o = []; for (var d in DISHES) Object.keys(DISHES[d].need).concat(['flour','egg']).forEach(function (k) { var sk = FOOD[k]; if (!sk || !SZ[sk]) o.push(d + ':' + k + '=' + sk); }); return o; }, fill: function () { for (var d in DISHES) for (var k in DISHES[d].need) garden.harvest[k] = 9; renderFoods(); }, menu: openMenu, drink: function (k) { act("drink", function () { return homeDrink(k); }); }, NEW: NEW };
  })();
