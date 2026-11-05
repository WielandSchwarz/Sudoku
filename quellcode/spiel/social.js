  // ===================== friends (preview): one screen at a time, and a new pixel screen for a new friend =====================
  // nothing piles up: the item screen waits while a letter is open, and a letter waits while any screen is open (letterOk already checks .ip)
  var _so_ipNext = ipNext;
  ipNext = function () {
    if (letterOn || document.querySelector(".gift-wrap")) { if (!ipOn && ipQueue.length) { ipOn = true; setTimeout(function () { ipOn = false; ipNext(); }, 700); } return; }
    return _so_ipNext();
  };
  var HEARTPX = '<svg viewBox="0 0 9 8" aria-hidden="true" shape-rendering="crispEdges"><path fill="#3a2414" d="M2 0h2v1H2zM5 0h2v1H5zM1 1h1v1H1zM4 1h1v1H4zM7 1h1v1H7zM0 2h1v2H0zM8 2h1v2H8zM1 4h1v1H1zM7 4h1v1H7zM2 5h1v1H2zM6 5h1v1H6zM3 6h1v1H3zM5 6h1v1H5zM4 7h1v1H4z"/><path fill="#e8554a" d="M2 1h2v1H2zM5 1h2v1H5zM1 2h7v2H1zM2 4h5v1H2zM3 5h3v1H3zM4 6h1v1H4z"/><path fill="#ffb0a8" d="M2 2h1v1H2z"/><path fill="#b83a30" d="M6 3h1v1H6zM5 4h1v1H5z"/></svg>';
  // a new friend (every third heart): the animal hops in the middle, its hearts pop in one by one, the present lies below
  giveFriendGift = function (id) {
    var g = FGIFT[id] || {}, got = [], icons = [];
    if (g.meadow && item("meadow", g.meadow) && home.owned.meadow.indexOf(g.meadow) < 0) { var im = item("meadow", g.meadow); home.owned.meadow.push(g.meadow); got.push(im.name); icons.push(MBIG && MBIG["mb_" + g.meadow] ? '<svg viewBox="0 0 52 52" aria-hidden="true" shape-rendering="crispEdges">' + tint(MBIG["mb_" + g.meadow].svg) + '</svg>' : itemSVG("meadow", im, "", "")); }
    if (g.deco && item("deco", g.deco) && home.owned.deco.indexOf(g.deco) < 0) { var idc = item("deco", g.deco); home.owned.deco.push(g.deco); got.push(idc.name); icons.push(itemSVG("deco", idc, "", "")); }
    if (g.seeds && !got.length && seedRoom(g.seeds[0])) { seedAdd(g.seeds[0], 1); got.push("ein Tütchen " + CROPS[g.seeds[0]].name + "-Samen"); icons.push(ibSvg("seed_" + g.seeds[0]) || ibSvg("packet")); }
    if (g.nut && !got.length) { garden.harvest.nut += 1; got.push("eine Haselnuss"); icons.push(ibSvg("nut")); renderFoods(); }
    if (!got.length) { var rr_ = seedOrFurn(); if (rr_.seed) { got.push(rr_.text); icons.push(ibSvg("seed_" + rr_.seed) || ibSvg("packet")); } else if (rr_.furn) { got.push(rr_.text); icons.push(furnIcon(rr_.furn)); } }
    if (!got.length) { got.push("eine dicke Umarmung, denn dein Samenlager ist schon randvoll"); icons.push(HEARTPX); }
    renderCosy(); if (decor) renderCatalog();
    var h = (garden.friends && garden.friends[id]) || 3, name = (ANIMALS[id] && ANIMALS[id].name) || ANAME[id] || "Ein Tier";
    itemPop({ friend: id, hearts: h, icons: icons, gotText: got.join(" · "), title: h <= 3 ? "Neuer Freund: " + name + "!" : name + " hat dich noch lieber!" });
    say(name + " schenkt " + N() + " " + got.join(", ") + ".");
    if (window.SudokuSave) window.SudokuSave();
  };
  var _so_ipNext2 = ipNext;
  ipNext = function () {
    var o = ipQueue[0];
    if (!o || !o.friend || letterOn || document.querySelector(".gift-wrap")) return _so_ipNext2();
    ipQueue.shift(); ipOn = true;
    var an = ALLANI[o.friend] || ANIMALS[o.friend], el = ipEl = document.createElement("div"); el.className = "ip ipf"; scene.appendChild(el);
    var n = Math.min(o.hearts, 9), hearts = "";
    for (var i = 0; i < n; i++) hearts += '<i class="ipf-h" style="animation-delay:' + (700 + i * 220) + 'ms">' + HEARTPX + '</i>';
    var floaters = ""; for (var k = 0; k < 7; k++) floaters += '<i class="ipf-fl" style="left:' + (8 + k * 13) + '%;animation-delay:-' + (k * 0.55).toFixed(2) + 's">' + HEARTPX + '</i>';
    var gifts = o.icons.map(function (s_) { return '<span class="ipf-gi">' + s_ + '</span>'; }).join("");
    el.innerHTML = '<div class="ip-dim"></div>' + ipRays() + floaters +
      '<div class="ipf-stage"><div class="ipf-ani"><svg viewBox="' + an.vb + '" aria-hidden="true" shape-rendering="crispEdges">' + an.svg + '</svg></div><div class="ipf-hearts">' + hearts + (o.hearts > 9 ? '<b>' + o.hearts + '</b>' : "") + '</div></div>' +
      '<div class="ip-banner ipf-ban"><b>' + o.title + '</b><div class="ipf-gift">' + gifts + '<span>' + o.gotText + '</span></div></div>';
    el.classList.add("ip-ready"); beep([[659, .07], [784, .07], [1047, .12], [0, .05], [1319, .14]]);
    for (var j = 0; j < n; j++) setTimeout(function () { beep([[1175 + Math.random() * 200, .04]]); }, 700 + j * 220);
    var done = false;
    el.addEventListener("click", function () {
      if (done) return; done = true; el.classList.add("ip-bye");
      setTimeout(function () { el.remove(); if (ipEl === el) ipEl = null; ipNext(); }, 260);
    });
  };
  window.__friendPop = function (id, h) { garden.friends[id] = h || 3; giveFriendGift(id); };
