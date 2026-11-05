  // ===================== seed store: at most 15 packets of a kind; when everything is full, presents become furniture =====================
  var SEED_MAX = 15;
  function seedRoom(k) { return !!CROPS[k] && (garden.seeds[k] || 0) < SEED_MAX; }
  function seedOpen() { return Object.keys(CROPS).filter(seedRoom); }
  function seedAdd(k, n) { var have = garden.seeds[k] || 0, add = Math.max(0, Math.min(n || 1, SEED_MAX - have)); garden.seeds[k] = have + add; return add; }
  // seeds as presents still come out of a shuffled bag, but only kinds that still have room
  seedPick = function (pref) {
    if (pref && seedRoom(pref)) return pref;
    var open = seedOpen(); if (!open.length) return null;
    garden.seedBag = (garden.seedBag || []).filter(seedRoom);
    if (!garden.seedBag.length) { garden.seedBag = open.slice(); for (var i = open.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = garden.seedBag[i]; garden.seedBag[i] = garden.seedBag[j]; garden.seedBag[j] = t; } }
    return garden.seedBag.pop();
  };
  // a piece of furniture you do not have yet, straight into the catalogue (not the one already on its way)
  function furnNow() {
    var pool = [];
    for (var c in FURN) FURN[c].forEach(function (it) { if (home.owned[c] && home.owned[c].indexOf(it.id) < 0 && !(home.pending && home.pending.cat === c && home.pending.id === it.id)) pool.push([c, it]); });
    if (!pool.length) return null;
    var pk = pool[Math.floor(Math.random() * pool.length)]; home.owned[pk[0]].push(pk[1].id);
    if (typeof renderCosy === "function") renderCosy(); if (decor && typeof renderCatalog === "function") renderCatalog();
    return { cat: pk[0], id: pk[1].id, name: pk[1].name, it: pk[1] };
  }
  // one present: seeds if there is room (a favourite kind first), otherwise furniture, otherwise nothing at all
  function seedOrFurn(pref, n, noFurn) {
    var k = seedPick(pref);
    if (k) { var a = seedAdd(k, n || 1); return { seed: k, n: a, text: (a > 1 ? a + " Tütchen " : "ein Tütchen ") + CROPS[k].name + "-Samen" }; }
    if (noFurn) return { none: true, text: "" };
    var f = furnNow(); if (f) return { furn: f, text: f.name + " für dein Zuhause" };
    return { none: true, text: "" };
  }
  function furnIcon(f) { var it = f.it; return '<svg viewBox="0 0 ' + it.w + ' ' + it.h + '" aria-hidden="true" shape-rendering="crispEdges">' + it.svg + '</svg>'; }
  window.__seedcap = { max: SEED_MAX, open: function () { return seedOpen(); }, fill: function () { Object.keys(CROPS).forEach(function (k) { garden.seeds[k] = SEED_MAX; }); }, give: seedOrFurn };
  // ---- the seed list gets two tabs: fruit and vegetables (flowers and herbs go with the vegetables) ----
  var SEED_FRUIT = { strawberry: 1, raspberry: 1, blackberry: 1, blueberry: 1, currant: 1, gooseberry: 1, rhubarb: 1 };
  function seedTabs(grid) {
    if (grid.dataset.tabs) return; grid.dataset.tabs = "1";
    var L = life(), cur = L.seedTab || "fruit", bar = document.createElement("div"); bar.className = "seedtabs";
    bar.innerHTML = '<button type="button" data-t="fruit">Obst</button><button type="button" data-t="veg">Gemüse</button>';
    grid.parentNode.insertBefore(bar, grid);
    function show(t) {
      cur = t; L.seedTab = t;
      bar.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.t === t); });
      grid.querySelectorAll(".seedrow").forEach(function (r) { var f = !!SEED_FRUIT[r.dataset.seed]; r.hidden = (t === "fruit") !== f; });
      grid.scrollTop = 0;
    }
    bar.addEventListener("click", function (e) { e.stopPropagation(); var b = e.target.closest("[data-t]"); if (b) { show(b.dataset.t); beep([[700, .03]]); } });
    show(cur);
  }
  new MutationObserver(function () { document.querySelectorAll("#scene .seedgrid:not([data-tabs])").forEach(seedTabs); }).observe(scene, { childList: true, subtree: true });
