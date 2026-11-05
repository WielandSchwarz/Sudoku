  // ===================== more fruit: berry bushes, rhubarb and onions for the bed and the greenhouse; fruit trees for the meadow spots =====================
  var FRT = /*FRUIT*/;
  Object.keys(FRT).forEach(function (k) {
    var v = FRT[k];
    if (k.indexOf("ib_") === 0) { IBIG[k.slice(3)] = v; return; }
    A[k] = v.svg; SZ[k] = [v.w, v.h];
  });
  // bed and greenhouse: name, hours to grow, what eating it does
  var NEWFRUIT = [["raspberry", "Himbeere", 6, { food: 12, fun: 10, love: 6, say: "Himbeeren vom eigenen Strauch!" }],
    ["blackberry", "Brombeere", 7, { food: 12, fun: 10, say: "Saftige Brombeeren, die Pfoten werden lila." }],
    ["blueberry", "Heidelbeere", 6, { food: 10, love: 10, say: "Kleine Heidelbeeren, eine nach der anderen." }],
    ["currant", "Johannisbeere", 5, { food: 10, fun: 12, say: "Johannisbeeren, schön säuerlich." }],
    ["gooseberry", "Stachelbeere", 6, { food: 12, fun: 8, say: "Eine Stachelbeere! Er verzieht kurz das Gesicht." }],
    ["rhubarb", "Rhabarber", 5, { food: 14, fun: 6, say: "Ein Stück Rhabarber, ganz schön sauer." }],
    ["onion", "Zwiebel", 4, { food: 8, say: "Eine Zwiebel. Er schnuppert und niest." }]];
  NEWFRUIT.forEach(function (c) {
    CROPS[c[0]] = { name: c[1], hours: c[2] };
    if (garden.seeds[c[0]] == null) garden.seeds[c[0]] = 1;
    if (garden.harvest[c[0]] == null) garden.harvest[c[0]] = 0;
    FOOD[c[0]] = "f_" + c[0]; GFOOD[c[0]] = c[3]; GNAME[c[0]] = c[1];
  });
  // fruit from the trees: not sown, picked
  var FTREES = { apple: { n: "Apfelbaum", k: "gapple", f: "Apfel", pl: "Äpfel" }, pear: { n: "Birnbaum", k: "pear", f: "Birne", pl: "Birnen" },
    cherry: { n: "Kirschbaum", k: "cherry", f: "Kirsche", pl: "Kirschen" }, plum: { n: "Zwetschgenbaum", k: "plum", f: "Zwetschge", pl: "Zwetschgen" } };
  var TFOOD = { gapple: { food: 20, fun: 6, say: "Ein Apfel vom eigenen Baum!" }, pear: { food: 18, love: 6, say: "Eine reife, süße Birne." }, cherry: { food: 10, fun: 12, say: "Kirschen! Er spuckt einen Kern weit weg." }, plum: { food: 14, love: 8, say: "Eine Zwetschge, ganz weich und süß." } };
  Object.keys(FTREES).forEach(function (t) { var k = FTREES[t].k; if (garden.harvest[k] == null) garden.harvest[k] = 0; FOOD[k] = "f_" + k; GFOOD[k] = TFOOD[k]; GNAME[k] = FTREES[t].f; });
  // existing players get a seed of each new plant once
  setTimeout(function () {
    if (garden.fruitSeeds) return; garden.fruitSeeds = 1;
    NEWFRUIT.forEach(function (c) { if (!(garden.seeds[c[0]] > 0)) garden.seeds[c[0]] = 1; if (garden.harvest[c[0]] == null) garden.harvest[c[0]] = 0; });
    Object.keys(FTREES).forEach(function (t) { if (garden.harvest[FTREES[t].k] == null) garden.harvest[FTREES[t].k] = 0; });
    if (window.SudokuSave) window.SudokuSave();
  }, 1500);
  // the trees join the meadow catalogue: they come in parcels like the other furniture
  Object.keys(FTREES).forEach(function (t) { FURN.meadow.push({ id: "tree_" + t, name: FTREES[t].n, w: 36, h: 46, svg: A["tree_" + t + "_summer"] }); });
  var TREE_H = 6;                                    // hours until a tree carries ripe fruit again
  function treeOf(i) { var id = home.placed["meadow" + i]; return id && id.indexOf("tree_") === 0 ? id.slice(5) : null; }
  function treeL() { garden.trees = garden.trees || {}; return garden.trees; }
  function treeLeft(t) { return Math.max(0, TREE_H - (Date.now() - (treeL()[t] || 0)) / 3600000); }
  function treeSeasonOk() { var se = season(); return se === "summer" || se === "autumn"; }
  function treeRipe(t) { return treeSeasonOk() && treeLeft(t) <= 0; }
  var _fr_rgd = renderGardenDecor;
  renderGardenDecor = function () {
    _fr_rgd();
    MSPOT.forEach(function (m, i) {
      var t = treeOf(i), el0 = gEl("slot-meadow" + i), hit = document.getElementById("g-tree-hit" + i);   /* an invisible tap area over the tree, above the walk-on edge, so the tree can be tapped there */
      if (!t) { if (hit) hit.remove(); return; }
      if (!hit && el0) { hit = document.createElement("div"); hit.id = "g-tree-hit" + i; hit.className = "g-tree-hit"; el0.parentNode.appendChild(hit); hit.addEventListener("click", function (e) { e.stopPropagation(); gEl("slot-meadow" + i).click(); }); }
      var el = gEl("slot-meadow" + i), se = season(), art = A["tree_" + t + "_" + se] + (treeRipe(t) ? A["tree_" + t + "_fruit"] : "");
      el.style.left = gx(m.x - 18); el.style.width = gx(36);
      el.innerHTML = snowySVG(art, 36, 46, "meadow" + i, 3) + (treeRipe(t) ? [[4, 30, 0], [80, 22, .7], [40, 4, 1.4]].map(function (q) { return '<i class="g2-spark" style="left:' + q[0] + '%;top:' + q[1] + '%;width:' + (7 / 36 * 100) + '%;animation-delay:' + q[2] + 's"></i>'; }).join("") : "");
      el.setAttribute("aria-label", FTREES[t].n);
      if (hit) { hit.style.left = el.style.left; hit.style.width = el.style.width; var cs = getComputedStyle(el); hit.style.top = cs.top; hit.style.height = cs.height; hit.style.bottom = "auto"; }
    });
  };
  setInterval(function () { if (place2 === "garden" && !decor) renderGardenDecor(); }, 60000);
  MSPOT.forEach(function (m, i) {
    gEl("slot-meadow" + i).addEventListener("click", function (e) {
      var t = treeOf(i); if (!t || decor || (garden.snowLv["meadow" + i] || 0) > 0) return;
      e.stopImmediatePropagation(); e.stopPropagation();
      var T_ = FTREES[t];
      if (!treeRipe(t)) {
        if (!treeSeasonOk()) { openPop('<p class="g2-name">' + svgOf(A["f_" + T_.k], 8, 8) + '<span>' + T_.n + '</span></p><p class="g2-time">' + (season() === "spring" ? "Er blüht. " + T_.pl + " gibt es im Sommer und Herbst." : "Im Winter ruht er.") + '</p>', m.x, m.bottom - 50, "g2-info"); return; }
        var pr = 1 - treeLeft(t) / TREE_H;
        openPop('<p class="g2-name">' + svgOf(A["f_" + T_.k], 8, 8) + '<span>' + T_.n + '</span></p><span class="g2-bar">' + pixBarSvg(pr, 50) + '</span><p class="g2-time">Noch ' + fmtH(treeLeft(t)) + '</p>', m.x, m.bottom - 50, "g2-info");
        return;
      }
      if (s.asleep) { say(N() + " schläft gerade."); return; }
      if (busy && !interruptible()) return; if (busy) interrupt();
      act("garden", async function () {
        var sx = m.x + (m.x > 100 ? -22 : 22); await walkTo(sx, Math.max(106, Math.min(128, m.bottom - 2)));
        H.dir = m.x > H.x ? 1 : -1; front({ paws: "up", eyes: "happy", mouth: "grin" }); pulse("hop", 300);
        var el = gEl("slot-meadow" + i); el.classList.add("tr-shake"); beep([[392, .04], [440, .04], [392, .04]]);
        for (var k = 0; k < 4; k++) { fx("f_" + T_.k, m.x - 10 + k * 7, m.bottom - 40 + (k % 2) * 6, "fall", 1, { "--dx": (k - 1.5) * 4 + "px" }); await wait(140); }
        await wait(300); el.classList.remove("tr-shake");
        var n = t === "cherry" ? 4 : 3; garden.harvest[T_.k] = (garden.harvest[T_.k] || 0) + n; treeL()[t] = Date.now();
        renderGardenDecor(); renderFoods(); front({ eyes: "happy", mouth: "grin", paws: "down", blush: true }); pulse("bighop", 600);
        say(N() + " sammelt " + n + " " + T_.pl + " auf."); if (window.SudokuSave) window.SudokuSave(); await wait(700);
      });
    }, true);
  });
  window.__fruit = { close: function () { closePop(); if (typeof closeLPop === 'function') closeLPop(); }, gh: function (i, c, pg) { life().gh[i] = { crop: c, prog: pg, wetUntil: 0 }; }, tap: function (i) { plotTap(i); }, plant: function (i, c, pg) { garden.plots[i] = { crop: c, prog: pg, wetUntil: 0 }; renderBed(); }, place: function (i, t) { home.owned.meadow = home.owned.meadow || []; if (home.owned.meadow.indexOf('tree_' + t) < 0) home.owned.meadow.push('tree_' + t); home.placed['meadow' + i] = 'tree_' + t; renderGardenDecor(); }, trees: FTREES, ripen: function (t) { treeL()[t] = 0; renderGardenDecor(); } };
