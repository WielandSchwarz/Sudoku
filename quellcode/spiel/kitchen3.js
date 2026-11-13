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

    // ---------- frying, seen from the side: swipe up and the whole pan swings, the pancake does a somersault (sprite frames) ----------
    VIEW_BG.fry = "fry_bg";
    var CAKE_SRC = { a: ["#f6e6b1", "#e8d49a", "#fff6d4"], b: ["#e0a851", "#c88a3a", "#f0c070"], e: "#d8b878" };
    function panSvg(i, mid) { return A["panb_" + i] + (mid || "") + A["panf_" + i]; }
    function panFrameAt(t) { return t < .12 ? 1 : t < .3 ? 2 : t < .46 ? 3 : 0; }
    function swipeUp(onUp) {   // any quick upward stroke on the picture counts
      var y0 = null;
      svgEl.onpointerdown = function (ev) { y0 = svgPt(ev).y; try { svgEl.setPointerCapture(ev.pointerId); } catch (e) {} };
      svgEl.onpointermove = function (ev) { if (y0 == null) return; var y = svgPt(ev).y; if (y0 - y > 14) { y0 = null; onUp(); } else if (y > y0) y0 = y; };
      svgEl.onpointerup = svgEl.onpointercancel = function () { y0 = null; };
    }
    function swipeOff() { svgEl.onpointerdown = svgEl.onpointermove = svgEl.onpointerup = svgEl.onpointercancel = null; }
    function hintArrow(now, x) { var on = Math.floor(now / 380) % 2; return '<rect x="' + (x - 1) + '" y="' + (56 + on * 3) + '" width="3" height="14" fill="#3a2414"/><rect x="' + x + '" y="' + (57 + on * 3) + '" width="1" height="12" fill="#f6c84a"/><path d="M' + (x - 5) + ' ' + (60 + on * 3) + 'h11l-5.5 -6z" fill="#f6c84a" stroke="#3a2414" stroke-width="1"/>'; }
    var FRY = {
      pancake: { raw: "#f6e6b4", gold: "#e0a850", dark: "#6a3a1a", txt: "Der Pfannkuchen brät. Ist er unten goldbraun, wisch nach oben: die Pfanne wirft ihn um.", side2: "Jetzt die andere Seite, dann noch einmal wenden." },
      rosti: { raw: "#f4b060", gold: "#c8742a", dark: "#5a2e14", txt: "Das Rösti brät. Ist es unten goldbraun, wisch nach oben: die Pfanne wirft es um.", side2: "Jetzt die andere Seite, dann noch einmal wenden." }
    };
    COOK_EXT.flip = function (X) {
      return new Promise(function (res) {
        var F_ = FRY[X.s[1]] || FRY.pancake, up = 0, flips = 0, b = [0, 0], t0 = performance.now(), fl = null, done = false, T = 9000, hint = true;
        setView("fry"); setLiquid(null); $p("pov-ring").hidden = true; $p("pov-bake").hidden = false;
        X.head(X.i, F_.txt);
        function colAt(p) { return p < .6 ? mix(F_.raw, F_.gold, p / .6) : mix(F_.gold, F_.dark, (p - .6) / .4); }
        function cake(frame, topSide, x, y) {   // the frame's face A is the side that was up when the throw began
          var ca = colAt(b[topSide]), cb = colAt(b[1 - topSide]), svg = A["cakef_" + frame];
          var to = { a: [ca, mix(ca, "#000000", .1), mix(ca, "#ffffff", .2)], b: [cb, mix(cb, "#000000", .1), mix(cb, "#ffffff", .2)] };
          ["a", "b"].forEach(function (f) { CAKE_SRC[f].forEach(function (src, k) { svg = svg.split(src).join(to[f][k] + "_"); }); });
          svg = svg.split(CAKE_SRC.e).join(mix(cb, "#000000", .22) + "_").split('_"').join('"');
          return '<g transform="translate(' + (x - 28) + ' ' + (y - 28) + ')">' + svg + '</g>';
        }
        function draw(now) {
          if (done) return;
          var down = 1 - up, o, pi = 0, cy = 88, frame = 0, top = up;
          if (!fl) b[down] = Math.min(1, b[down] + (now - (draw.last || now)) / T);
          draw.last = now;
          if (fl) {
            var t = (now - fl.t) / 900; if (t >= 1) { t = 1; }
            pi = panFrameAt(t); var u = Math.max(0, Math.min(1, (t - .1) / .8));
            cy = 88 - Math.sin(u * Math.PI) * 58 - (pi ? [0, 3, 6, 3][pi] : 0) * (u < .05 ? 1 : 0);
            frame = Math.min(8, Math.round(u * 8)); top = fl.up;
            if (t >= 1) { fl = null; up = 1 - up; frame = 0; top = up; flips++; beep([[196, .05]]); if (flips >= 2) { done = true; swipeOff(); setTimeout(res, 450); } else X.head(X.i, F_.side2); }
          }
          var sizzle = "";
          if (!fl) for (var q = 0; q < 3; q++) if (Math.random() < .35) sizzle += '<rect x="' + Math.round(64 + Math.random() * 52) + '" y="' + Math.round(84 + Math.random() * 4) + '" width="1" height="1" fill="#fff4e0"/>';
          var mid = cake(frame, top, 90, cy);
          o = fl && cy < 74 ? panSvg(pi) + mid : panSvg(pi, mid + sizzle);
          if (hint && !fl && b[down] > .45) o += hintArrow(now, 30);
          $p("pov-float").innerHTML = o;
          $p("pov-bake").innerHTML = woodBarSvg({ w: 72, col: colAt, zone: [.55, .72], mark: b[1 - up] });
          if (!fl && !done && b[down] >= 1) throwIt();
          requestAnimationFrame(draw);
        }
        function grade(p) { return p >= .55 && p <= .72 ? 3 : p >= .45 && p <= .82 ? 2 : 1; }
        function throwIt() {
          if (fl || done) return; hint = false; var g = grade(b[1 - up]); X.grades.push(g);
          beep(g === 3 ? [[523, .04], [784, .06], [1047, .08]] : [[392, .05], [330, .07]]);
          fl = { t: performance.now(), up: up };
        }
        swipeUp(throwIt);
        requestAnimationFrame(draw);
      });
    };
    // ---------- tossing vegetables, the same pan from the side: swipe up 6 times before the bottom ones catch ----------
    COOK_EXT.toss = function (X) {
      return new Promise(function (res) {
        setView("fry"); setLiquid(null); $p("pov-ring").hidden = false; $p("pov-bake").hidden = true; X.bar(0);
        X.head(X.i, "Schwenke das Gemüse: wisch 6-mal nach oben, bevor es unten anbrennt.");
        var N = 6, n = 0, last = performance.now(), worst = 0, pieces = [], done = false, sw = null;
        X.items.forEach(function (k) { var c = { gcarrot: "#f08a24", pumpkin: "#e8822a", herbs: "#5aa04e", tomato: "#e2483a" }[k] || "#c8945a"; for (var q = 0; q < 6; q++) pieces.push({ x: 54 + Math.random() * 72, h: 0, vy: 0, vx: 0, br: 0, c: c, w: k === "herbs" ? 3 : 5, r: Math.random() < .5 }); });
        function draw(now) {
          if (done) return;
          var dt = Math.min(.05, (now - last) / 1000), pi = 0; last = now;
          if (sw) { var t = (now - sw) / 500; pi = t < 1 ? panFrameAt(t * .9) : 0; if (t >= 1) sw = null; }
          var lift = [0, 3, 6, 3][pi], mid = "";
          pieces.forEach(function (p) {
            if (p.h > 0 || p.vy > 0) { p.vy -= 260 * dt; p.h = Math.max(0, p.h + p.vy * dt); p.x = Math.max(50, Math.min(130, p.x + p.vx * dt)); if (p.h === 0) { p.vy = 0; p.r = Math.random() < .5; } } else p.br = Math.min(1, p.br + dt / 5);
            var c = mix(p.c, "#3a1c0c", p.br * .7), y = Math.round(88 - lift - p.h), w = p.r && p.h > 0 ? 3 : p.w, hh = p.r && p.h > 0 ? 5 : 3;
            mid += '<rect x="' + Math.round(p.x - 1) + '" y="' + (y - hh) + '" width="' + (w + 2) + '" height="' + (hh + 2) + '" fill="#3a2414"/><rect x="' + Math.round(p.x) + '" y="' + (y - hh + 1) + '" width="' + w + '" height="' + hh + '" fill="' + c + '"/><rect x="' + Math.round(p.x) + '" y="' + (y - hh + 1) + '" width="' + w + '" height="1" fill="' + mix(c, "#ffffff", .3) + '"/>';
          });
          worst = Math.max(worst, pieces.reduce(function (m, p) { return Math.max(m, p.br); }, 0));
          var o = panSvg(pi, mid); if (n === 0 && !sw) o += hintArrow(now, 30);
          $p("pov-float").innerHTML = o;
          requestAnimationFrame(draw);
        }
        swipeUp(function () {
          if (done) return; n++; X.bar(n / N); sw = performance.now(); beep([[330 + n * 40, .04], [494 + n * 40, .05]]);
          pieces.forEach(function (p) { p.vy = 90 + Math.random() * 70; p.vx = (Math.random() - .5) * 40; p.h = .1; p.br = Math.max(0, p.br - .25); });
          if (n >= N) { done = true; X.grades.push(worst < .55 ? 3 : worst < .8 ? 2 : 1); swipeOff(); setTimeout(res, 900); }
        });
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
