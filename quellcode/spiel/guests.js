  // ===================== café guests (preview) =====================
  // animals you know come in while the café is open (while you are in it): alone or in pairs, they take a table,
  // order what they like, and pay with a material of their own once they are served. A wish fulfilled earns a heart.
  var GPREF = {
    igel: { d: "tea", ing: "kamille", add: "honig", cake: "kuerbis", mat: "nut", night: 1 },
    hare: { d: "tea", ing: "minze", add: "zitrone", cake: "moehre", mat: "gcarrot" },
    squirrel: { d: "coffee", bean: "nuss", add: "sirup", cake: "nuss", mat: "nut" },
    robin: { d: "tea", ing: "hagebutte", add: "honig", mat: "strawberry" },
    tit: { d: "tea", ing: "zitrone", add: "zitrone", mat: "sunflower" },
    fox: { d: "coffee", bean: "dunkel", add: "sahne", mat: "strawberry", night: 1 },
    mouse: { d: "kakao", add: "keks", cake: "erdbeer+erdbeer", mat: "sunflower" },
    badger: { d: "kakao", add: "sahne", cake: "honig", mat: "honey", night: 1 },
    owl: { d: "tea", ing: "lavendel", add: "honig", mat: "herbs", night: 1, only: 1 },
    otter: { d: "coffee", drink: "L", add: "zimt", mat: "cucumber" },
    frog: { d: "tea", ing: "minze", mat: "dandelion" },
    duck: { d: "tea", ing: "zitrone", cake: "erdbeer+erdbeer", mat: "dandelion" },
    beaver: { d: "coffee", bean: "mittel", cake: "sonne", mat: "pumpkin" },
    turtle: { d: "tea", ing: "kamille", mat: "tomato" },
    hedgehog: { d: "tea", ing: "apfel", mat: "pumpkin" }
  };
  var GMAT_DEF = ["strawberry", "sunflower", "nut", "dandelion", "herbs"];
  // payment: one ingredient from the animal's own garden, two when it got exactly what it wanted; it goes straight into the pantry
  var PAY_N = { strawberry: ["einer Erdbeere", "zwei Erdbeeren"], gcarrot: ["einer Möhre", "zwei Möhren"], pumpkin: ["einem Kürbis", "zwei Kürbissen"], nut: ["einer Haselnuss", "zwei Haselnüssen"], honey: ["einem Glas Honig", "zwei Gläsern Honig"], sunflower: ["einer Sonnenblume", "zwei Sonnenblumen"], dandelion: ["einem Bund Löwenzahn", "zwei Bund Löwenzahn"], herbs: ["einem Bund Kräuter", "zwei Bund Kräutern"], chili: ["einer Chili", "zwei Chilis"], tomato: ["einer Tomate", "zwei Tomaten"], cucumber: ["einer Gurke", "zwei Gurken"] };
  function gPref(id) {
    if (GPREF[id]) return GPREF[id];
    var h = 0; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
    var ings = ["minze", "kamille", "apfel", "hagebutte", "lavendel", "honig", "zitrone", "brombeer"];
    return { d: ["tea", "coffee", "kakao"][h % 3], ing: ings[h % 8], add: ["honig", "zitrone", "milch", "sahne", "zimt"][h % 5], cake: h % 2 ? CK_CLASSIC[h % CK_CLASSIC.length] : 0, mat: GMAT_DEF[h % 5], drink: ["C", "L", "M"][h % 3] };
  }
  var TABLES = [{ seats: [78], top: [92, 92] }, { seats: [126, 170], top: [148, 90] }, { seats: [192, 236], top: [214, 90] }];
  var guests = [], gNext = 0, gRaf = 0, gLast = 0;
  function gTablesFree() { return TABLES.map(function (tb, i) { return guests.some(function (g) { return g.table === i; }) ? -1 : i; }).filter(function (i) { return i >= 0; }); }
  function gKnown() {
    var L = life(), ids = (L.knownSeen || []).concat(Object.keys(garden.friends || {})).filter(function (id, i, a) { return a.indexOf(id) === i && ALLANI[id]; });
    if (!ids.length) ids = ["igel", "hare", "squirrel", "tit"].filter(function (id) { return ALLANI[id]; });
    var sk = document.getElementById("sky").className, night = /sky-night/.test(sk);
    // whoever was here in the last half hour does not come again yet
    var seen = cfL().gseen || {}, now = Date.now();
    return ids.filter(function (id) { var p = gPref(id); return night ? p.night : !p.only; }).filter(function (id) { return !guests.some(function (g) { return g.id === id; }) && now - (seen[id] || 0) > G_COOL; });
  }
  // asked in at the door: someone always comes, even if they were here a moment ago
  function gAnyone() {
    var L = life(), ids = (L.knownSeen || []).concat(Object.keys(garden.friends || {})).filter(function (id, i, a) { return a.indexOf(id) === i && ALLANI[id]; });
    if (!ids.length) ids = Object.keys(GPREF).filter(function (id) { return ALLANI[id]; });
    var free = ids.filter(function (id) { return !guests.some(function (g) { return g.id === id; }); });
    if (!free.length) free = Object.keys(ALLANI).filter(function (id) { return !guests.some(function (g) { return g.id === id; }); });
    return free;
  }
  // ---- what they order
  // what is already on the counter and not yet promised to another guest
  function gFreeItems() {
    var its = gItems(), used = {};
    guests.forEach(function (q) { if (!q.order || (q.state !== "walk" && q.state !== "wait")) return; for (var i = 0; i < its.length; i++) if (!used[i] && gMatch(q.order, its[i])) { used[i] = 1; break; } });
    return its.filter(function (it, i) { return !used[i]; });
  }
  // an order made from a thing that is ready: the guest asks for exactly that
  function gOrderFor(it) {
    if (it.kind === "cake") return { kind: "cake", wish: { t: "cake", v: it.k } };
    if (it.kind === "tea") return { kind: "tea", wish: (it.x || []).length && Math.random() < .4 ? { t: "add", v: it.x[0] } : { t: "ing", v: it.k.split("+")[0] } };
    if (it.kind === "kakao") return { kind: "kakao", wish: (it.x || []).length ? { t: "add", v: it.x[0] } : null };
    var r = Math.random();
    return { kind: "coffee", wish: it.art && r < .35 ? { t: "art", v: it.art } : it.drink && it.drink !== "E" && r < .75 ? { t: "drink", v: it.drink } : { t: "bean", v: (it.beans || "mittel").split("+")[0] } };
  }
  // room on the counter: three teas, three coffees or cocoas, two cakes
  function gRoom() { var C_ = cfL(), o = []; if ((C_.tea || 0) < 3) o.push("tea"); if ((C_.cof || 0) < 3) o.push("coffee", "kakao"); if (ckList().length < CK_MAX) o.push("cake"); return o; }
  function gOrder(id) {
    var ready = gFreeItems();
    if (ready.length) { var pick = ready.filter(function (it) { return it.kind === gPref(id).d; }); pick = pick.length && Math.random() < .7 ? pick : ready; return gOrderFor(pick[Math.floor(Math.random() * pick.length)]); }
    var o = gOrderNew(id), room = gRoom();
    for (var k = 0; k < 6 && room.length && room.indexOf(o.kind) < 0; k++) o = gOrderNew(id);
    return o;
  }
  function gOrderNew(id) {
    var p = gPref(id), r = Math.random(), av = ckAvail(), kind = r < .62 ? p.d : (r < .9 && p.cake && av.length) ? "cake" : ["tea", "coffee", "kakao"][Math.floor(Math.random() * 3)];
    var wish = null;
    if (Math.random() < .55) {
      if (kind === "tea") wish = Math.random() < .6 ? { t: "ing", v: p.ing || "kamille" } : { t: "add", v: ["honig", "zitrone", "milch", "zucker"].indexOf(p.add) >= 0 ? p.add : "honig" };
      if (kind === "coffee") wish = p.bean && Math.random() < .5 ? { t: "bean", v: p.bean } : Math.random() < .5 ? { t: "drink", v: p.drink || "C" } : { t: "art", v: ["Herz", "Blatt", "Stern"][Math.floor(Math.random() * 3)] };
      if (kind === "kakao") wish = { t: "add", v: ["sahne", "zimt", "kakao", "sirup", "keks"].indexOf(p.add) >= 0 ? p.add : "sahne" };
    }
    if (kind === "cake") wish = { t: "cake", v: av.indexOf(p.cake) >= 0 ? p.cake : av[Math.floor(Math.random() * av.length)] };
    return { kind: kind, wish: wish };
  }
  function gOrderText(o) {
    var w = o.wish, base = { tea: "einen Tee", coffee: "einen Kaffee", kakao: "einen Kakao", cake: "ein Stück Kuchen" }[o.kind];
    if (!w) return base;
    if (w.t === "cake") return "ein Stück " + ckName(w.v);
    if (w.t === "ing") return "einen Tee mit " + TEA_ING[teaIdx(w.v)].n;
    if (w.t === "add") return base + " mit " + ({ honig: "Honig", zitrone: "Zitrone", milch: "Milch", zucker: "Zucker", sahne: "Sahne", zimt: "Zimt", kakao: "Kakaopulver", sirup: "Karamell", keks: "einem Keks" }[w.v] || w.v);
    if (w.t === "drink") return { C: "einen Cappuccino", L: "eine Latte", M: "einen Macchiato", E: "einen Espresso" }[w.v];
    if (w.t === "bean") return "einen Kaffee mit " + BEAN[bIdx(w.v)].note;
    if (w.t === "art") return "einen Kaffee mit " + w.v + " im Schaum";
    return base;
  }
  // ---- can the counter serve it? returns { wished } and takes the item out of the stock
  function gTake(o, dry) {
    var C_ = cfL(), w = o.wish;
    if (o.kind === "cake") {
      // from the cabinet first; if it is empty, a cake from the kitchen is brought over
      // one piece from the cabinet; if it is empty, a cake from the kitchen is brought over and cut
      var CL = ckList(), ci = -1; CL.forEach(function (e, i) { if (w && e.k === w.v) ci = i; });
      if (!CL.length) {
        if (!(garden.harvest.cake > 0)) return null;
        if (!dry) { garden.harvest.cake--; CL.push({ k: "moehre", n: 3 }); C_.cakes = CL.length; if (typeof renderFoods === "function") renderFoods(); }
        return { wished: !!(w && w.v === "moehre"), kitchen: true, k: "moehre" };
      }
      var pk = ci >= 0 ? ci : CL.length - 1, kk = CL[pk].k;
      if (!dry) { CL[pk].n--; if (CL[pk].n <= 0) CL.splice(pk, 1); C_.cakes = CL.length; }
      return { wished: ci >= 0, k: kk };
    }
    if (o.kind === "tea") {
      if (!(C_.tea > 0)) return null;
      var list = (C_.teas || []).map(function (e) { return typeof e === "string" ? { k: e, x: [] } : e; }), best = -1;
      list.forEach(function (e, i) { if (w && ((w.t === "ing" && e.k.split("+").indexOf(w.v) >= 0) || (w.t === "add" && (e.x || []).indexOf(w.v) >= 0))) best = i; });
      var pick = best >= 0 ? best : list.length ? list.length - 1 : -1;
      if (!dry) { C_.tea--; if (pick >= 0) { list.splice(pick, 1); C_.teas = list; } }
      return { wished: !w || best >= 0 };
    }
    var cl = (C_.coffees || []), isK = function (e) { return e.k.indexOf("kakao") === 0; };
    if (!(C_.cof > 0)) return null;
    if (o.kind === "kakao") {
      var ki = -1, kb = -1; cl.forEach(function (e, i) { if (isK(e)) { ki = i; if (w && (e.x || []).indexOf(w.v) >= 0) kb = i; } });
      if (ki < 0) return null; var kp = kb >= 0 ? kb : ki;
      if (!dry) { C_.cof--; cl.splice(kp, 1); }
      return { wished: !w || kb >= 0 };
    }
    var ci = -1, cb = -1, nk = 0;
    cl.forEach(function (e, i) {
      if (isK(e)) { nk++; return; } ci = i;
      if (w && ((w.t === "drink" && e.k.split("|")[1] === w.v) || (w.t === "bean" && e.k.split("|")[0].split("+").indexOf(w.v) >= 0) || (w.t === "art" && e.art === w.v) || (w.t === "add" && (e.x || []).indexOf(w.v) >= 0))) cb = i;
    });
    if (ci < 0 && C_.cof <= nk) return null;                         // only cocoa left on the counter
    var cp = cb >= 0 ? cb : ci;
    if (!dry) { C_.cof--; if (cp >= 0) cl.splice(cp, 1); }
    return { wished: !w || cb >= 0 };
  }
  // ---- drawing: each guest is a small group in the room picture
  function gLayerEl() { return document.getElementById("cf-guests"); }
  function gCk(g) { return g.cakeK || (g.order.wish && g.order.wish.t === "cake" ? g.order.wish.v : null); }
  function gIcon(kind, v) { if (kind === "cake" && v) return ckPix(v, false).svg; var k = kind === "cake" ? "cakeA" : kind === "tea" ? "tea" : "cof", p = CF.spr[k]; return '<g>' + p.svg + '</g>'; }
  // like the hamster: the body waddles and the feet take turns. The picture is cut into the body and a left and right foot strip.
  // how each animal gets about: birds and the ladybug fly in, hares, frogs and squirrels hop, ducks and penguins waddle,
  // the seal flops along on its belly, the crab scuttles sideways, the turtle plods; everyone else walks at their own pace
  var GMOVE = { robin: "fly", tit: "fly", owl: "fly", puffin: "fly", ladybug: "buzz", hare: "hop", frog: "hop", squirrel: "hop", duck: "waddle", chick: "waddle", peng: "waddle", seal: "flop", crab: "scuttle", turtle: "plod" };
  var GSTEP = { mouse: 70, igel: 90, elk: 170, panda: 150, koala: 150, badger: 130, beaver: 130 };
  var GSPEED = { fly: 40, buzz: 34, hop: 34, waddle: 20, flop: 17, scuttle: 30, plod: 11, mouse: 40, igel: 30, elk: 26, panda: 21, koala: 21 };
  function gMove(id) { return GMOVE[id] || "walk"; }
  function gFlies(g) { var m = gMove(g.id); return m === "fly" || m === "buzz"; }
  var gUid = 0;
  function gMake(g) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", "g"), an = ALLANI[g.id];
    var vb = an.vb.split(/\s+/).map(Number), sc = 34 / vb[2], bh = vb[3] * sc, band = Math.max(3, Math.round(bh * .2)), id = "gq" + (++gUid);
    var pic = '<g transform="translate(-17 ' + (-bh).toFixed(2) + ') scale(' + sc.toFixed(4) + ')">' + an.svg + '</g>';
    // one whole picture, no cut strips: the animal moves as a whole. Birds get two wings of their own that are either folded (hidden) or spread.
    var wings = "";
    if (gFlies(g)) {
      /* second still picture: the same bird with its wings turned out a tiny bit (made offline from the bird's own wing pixels) */
      if (GWING2[g.id]) wings = '<g transform="translate(-17 ' + (-bh).toFixed(2) + ') scale(' + sc.toFixed(4) + ')">' + GWING2[g.id] + '</g>';
    }
    el.innerHTML = '<g class="gq-item"></g>' + (gFlies(g) ? '<ellipse class="gq-shadow" cx="0" cy="0" rx="9" ry="2" fill="#3a2414" opacity="0"/>' : '') +
      '<g class="gq-body"><g class="gq-tilt"><g class="gq-up"><g class="gq-fa">' + pic + '</g><g class="gq-fb" style="display:none">' + wings + '</g></g></g></g><g class="gq-bub"></g><g class="gq-fx"></g>';
    if (g.id === "duck" || g.id === "chick") {                        // big orange webbed feet to waddle on
      var tilt = el.querySelector(".gq-tilt"), fg = document.createElementNS("http://www.w3.org/2000/svg", "g");
      var foot = function (x) { return '<g><path fill="#3a2414" d="M' + (x - 1) + ' -3h4v1h2v1h1v2h-8v-3z"/><path fill="#f08a2a" d="M' + x + ' -2h3v1h2v1h-5z"/><path fill="#c8661a" d="M' + x + ' -1h5v0z"/></g>'; };
      fg.innerHTML = foot(g.id === "duck" ? -8 : -6) + foot(g.id === "duck" ? 1 : 0); tilt.appendChild(fg); g.feet = [fg.children[0], fg.children[1]];
    }
    gLayerEl().appendChild(el); g.el = el; g.bh = bh; g.parts = [el.querySelector(".gq-tilt"), el.querySelector(".gq-fa"), el.querySelector(".gq-fb"), el.querySelector(".gq-up")]; g.shadow = el.querySelector(".gq-shadow"); gBubble(g);
  }
  var G_EAT = 75000, G_STAY = 300000, G_MAX = 300;   // G_MAX: seconds from coming in to leaving, at most      // eating takes a while, and a visit lasts about five minutes from being served
  // a little speech bubble while they chat: a heart, a note, a star, three dots ...
  function gTalk(g) {
    var b = g.el && g.el.querySelector(".gq-bub"); if (!b) return;
    var mate = guests.filter(function (q) { return q !== g && q.table === g.table && q.state === "chat"; })[0];
    if (mate && mate.lastTalk && performance.now() - mate.lastTalk < 2500) return;
    g.lastTalk = performance.now();
    var pics = ["Herz", "Stern", "Blatt", "note", "dots", "dots", "keks"], k = pics[Math.floor(Math.random() * pics.length)];
    var ic = k === "dots" ? '<path fill="#3a2414" d="M1 4h2v2h-2zM5 4h2v2h-2zM9 4h2v2h-2z"/>' : k === "note" ? '<path fill="#3a2414" d="M5 0h4v1h1v2h-1v-1h-3v5h-1v1h-3v-1h-1v-2h1v-1h3z"/><path fill="#6a9ad8" d="M2 6h3v1h-3z"/>' : gPx(GIC.w[k], gPal());
    var tw = 16, th = 12;
    b.innerHTML = '<g class="gq-talk" transform="translate(' + (-tw / 2) + ' -' + (48 + th) + ')"><path fill="#3a2414" d="M0 1h1v-1h' + (tw - 2) + 'v1h1v' + (th - 2) + 'h-1v1h-' + (tw - 2) + 'v-1h-1z"/><path fill="#fff8ec" d="M1 1h' + (tw - 2) + 'v' + (th - 2) + 'h-' + (tw - 2) + 'z"/><path fill="#3a2414" d="M' + (g.face > 0 ? 9 : 4) + ' ' + th + 'h3v1h-1v1h-1v-1h-1z"/><g transform="translate(' + (k === "dots" ? 2 : 4) + ' 2)">' + ic + '</g></g>';
    setTimeout(function () { if (g.el && g.state === "chat") b.innerHTML = ""; }, 2300);
    if (Math.random() < .5) beep([[700 + Math.random() * 300, .03], [900 + Math.random() * 300, .03]]);
  }
  var G_DOOR = [26, 104], G_LANE = 125, G_SEAT = 110;
  function gStep(g, dt) {
    g.mov = false; if (g.delay > 0) { g.delay -= dt; return false; }
    var p = g.path[0]; if (!p) return true;
    var dx = p[0] - g.x, dy = p[1] - g.y, d = Math.hypot(dx, dy), st = g.sp * dt; g.mov = true;
    if (gMove(g.id) === "flop") { g.lp = (g.lp || 0) + dt * 5.5; st *= .2 + 1.6 * Math.max(0, Math.sin(g.lp)); }
    g.hd = (g.hd || 0) + Math.min(st, d);
    if (Math.abs(dx) > .5) g.dir = dx > 0 ? 1 : -1;
    if (d <= st) { g.x = p[0]; g.y = p[1]; g.path.shift(); return !g.path.length; }
    g.x += dx / d * st; g.y += dy / d * st; return false;
  }
  function gBubble(g) {
    var b = g.el.querySelector(".gq-bub");
    if (g.state !== "wait") { b.innerHTML = ""; return; }
    var pic = g.atTable && !g.ordered ? { w: 11, h: 4, svg: '<path fill="#3a2414" d="M0 1h2v2h-2zM4 1h3v2h-3zM9 1h2v2h-2z"/>' } : gWishPic(g.order), tw = pic.w + 6, th = pic.h + 4, tx = Math.round(-tw / 2), ty = -48 - th;
    b.innerHTML = '<g transform="translate(' + tx + ' ' + ty + ')"><path fill="#3a2414" d="M0 1h1v-1h' + (tw - 2) + 'v1h1v' + (th - 2) + 'h-1v1h-' + (tw - 2) + 'v-1h-1z"/><path fill="#fff8ec" d="M1 1h' + (tw - 2) + 'v' + (th - 2) + 'h-' + (tw - 2) + 'z"/><path fill="#3a2414" d="M' + Math.round(tw / 2 - 2) + ' ' + th + 'h4v1h-1v1h-1v1h-1v-1h-1z"/><path fill="#fff8ec" d="M' + Math.round(tw / 2 - 1) + ' ' + (th - 1) + 'h2v1h-2z"/>' +
      '<g transform="translate(3 2)">' + pic.svg + '</g></g>';
  }
  function gPos(g, t) {
    var mv = gMove(g.id);
    if (mv !== "walk" && mv !== "plod" && mv !== "waddle" && mv !== "scuttle") return gPosSpecial(g, t, mv);
    var per = mv === "plod" ? 240 : mv === "waddle" ? 170 : mv === "scuttle" ? 60 : (GSTEP[g.id] || 120);
    var f = g.mov ? Math.floor((t + g.ph) / per) % 4 : -1, P = g.parts, cy = (-g.bh / 2).toFixed(1), tilt = mv === "waddle" ? 8 : mv === "plod" ? 2 : mv === "scuttle" ? 0 : 4;
    if (f >= 0 && !(f < 0 && g.sip)) {
      var rock = mv === "waddle" ? 7 : mv === "plod" ? 2 : mv === "scuttle" ? 2 : 3;
      P[0].setAttribute("transform", "rotate(" + (f === 0 ? -rock : f === 2 ? rock : 0) + " 0 0)");
      P[1].setAttribute("transform", ""); P[2].setAttribute("transform", "");
      if (g.feet) { g.feet[0].setAttribute("transform", f === 0 ? "translate(0 -1)" : ""); g.feet[1].setAttribute("transform", f === 2 ? "translate(0 -1)" : ""); }
      gPlace(g, mv === "scuttle" ? g.face : null); return;
    }
    // frames as with the hamster: tilt left with a foot up, both down, tilt right with the other foot up, both down
    if (f < 0 && g.sip) { P[0].setAttribute("transform", "translate(0 -1)"); } else
    P[0].setAttribute("transform", "");
    P[1].setAttribute("transform", ""); P[2].setAttribute("transform", "");
    if (g.feet) { g.feet[0].setAttribute("transform", ""); g.feet[1].setAttribute("transform", ""); }
    gPlace(g);
  }
  function gPlace(g, fixedFace) {
    g.el.setAttribute("transform", "translate(" + Math.round(g.x) + " " + Math.round(g.y) + ")");
    var face = fixedFace != null ? fixedFace : g.mov ? g.dir : g.face;
    g.el.querySelector(".gq-body").setAttribute("transform", face > 0 ? "scale(-1 1)" : "");
    var dd = Math.hypot(g.x - G_DOOR[0], g.y - G_DOOR[1]);
    g.el.style.opacity = (g.state === "leave" || g.state === "walk") && dd < 14 ? Math.max(0, dd / 14) : 1;
  }
  function gPosSpecial(g, t, mv) {
    var P = g.parts, bh = g.bh;
    if (mv === "fly" || mv === "buzz") {
      // flying: up off the floor, a gentle bob, wings beating around the shoulders, a shadow on the floor; down again to land
      var air = 0;
      if (g.mov && g.path && g.path.length) {
        var end = g.path[g.path.length - 1], dRem = Math.hypot(end[0] - g.x, end[1] - g.y), dGo = g.hd || 0;
        air = Math.min(mv === "buzz" ? 10 : 15, dRem * .45, dGo * .45 + 2);
      }
      g.air = air;
      // two still pictures only: wings spread, wings folded, calmly taking turns while in the air
      var spread = air > .5 && Math.floor((t + (g.ph || 0)) / (mv === "buzz" ? 200 : 320)) % 2 === 0;
      P[0].setAttribute("transform", "translate(0 " + Math.round(-air - (g.sip ? 1 : 0)) + ")");
      if (P[2].firstChild) { P[1].style.display = spread ? "none" : ""; P[2].style.display = spread ? "" : "none"; }
      if (g.shadow) { var k = Math.max(0, Math.min(1, air / 15)); g.shadow.setAttribute("opacity", air > .5 ? (.25 - k * .12).toFixed(2) : 0); g.shadow.setAttribute("rx", (9 - k * 4).toFixed(1)); }
      return gPlace(g);
    }
    if (mv === "hop") {
      // hopping: a little arc per hop, squashed for a moment when landing, stretched in the air
      var u = g.mov ? ((g.hd || 0) % 13) / 13 : 0, z = g.mov ? Math.sin(u * Math.PI) * 6 : 0, land = g.mov && (u < .14 || u > .9);
      var sx = land ? 1.1 : g.mov ? .95 : 1, sy = land ? .88 : g.mov ? 1.06 : 1;
      P[0].setAttribute("transform", "translate(0 " + (-z - (g.sip ? 1 : 0)).toFixed(1) + ") scale(" + sx + " " + sy + ")");
      P[1].setAttribute("transform", ""); P[2].setAttribute("transform", "");
      return gPlace(g);
    }
    if (mv === "flop") {
      // the seal pushes itself along: stretched while it slides, bunched up while it gathers for the next push
      var s = g.mov ? Math.sin(g.lp || 0) : 0, push = Math.max(0, s), gather = Math.max(0, -s);
      P[0].setAttribute("transform", "translate(0 " + (-(gather * 2) - (g.sip ? 1 : 0)).toFixed(1) + ") scale(" + (1 + push * .1 - gather * .04).toFixed(3) + " " + (1 - push * .08 + gather * .06).toFixed(3) + ")");
      P[1].setAttribute("transform", ""); P[2].setAttribute("transform", "");
      return gPlace(g);
    }
  }
  function gFx(g, html, ms) { var f = g.el.querySelector(".gq-fx"); f.innerHTML = html; setTimeout(function () { if (g.el) f.innerHTML = ""; }, ms); }
  function gHearts() { return '<g class="gq-heart"><path fill="#3a2414" d="M-4 -46h3v1h2v-1h3v1h1v3h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-3h1z"/><path fill="#e8554a" d="M-3 -45h2v1h2v-1h2v3h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1z"/></g>'; }
  function gItemOnTable(g, on) {
    var it = g.el.querySelector(".gq-item"); if (!on) { it.innerHTML = ""; return; }
    // on the table top, a little towards the guest's side
    var sk = g.srv || g.order.kind, tb = TABLES[g.table], cake = sk === "cake", w = cake ? 13 : 8, h = cake ? 11 : 8, side = g.x < tb.top[0] ? -1 : 1;
    var x = Math.round(tb.top[0] - w / 2 + side * 3 - g.x), y = Math.round(96 - h - g.y);
    var st = g.stage || 0, inner = gIcon(sk, gCk(g));
    if (cake) inner = '<clipPath id="gqc' + g.table + '_' + g.seat + '"><rect x="0" y="-2" width="' + [13, 10, 7, 4][st] + '" height="14"/></clipPath><g clip-path="url(#gqc' + g.table + '_' + g.seat + ')">' + inner + '</g>';
    else if (st < 2) inner += '<path class="gq-steam" fill="#ffffff" opacity=".8" d="M2 -3h1v1h-1zM3 -5h1v1h-1zM5 -4h1v1h-1z"/>';
    it.innerHTML = '<g transform="translate(' + x + ' ' + y + ')">' + inner + '</g>';
  }
  // ---- arriving
  // only so many animals come by on their own each day; more can be asked in at the door
  var G_DAY = 9999, G_COOL = 30 * 60 * 1000;
  function gDay() { var C_ = cfL(), d = new Date(), k = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); if (!C_.gday || C_.gday.d !== k) C_.gday = { d: k, n: 0 }; return C_.gday; }
  function gSpawn(manual) {
    var free = gTablesFree(), pool = gKnown(); if (!pool.length) pool = gAnyone();
    if (window.__gForce) pool = window.__gForce.filter(function (id) { return ALLANI[id] && !guests.some(function (q) { return q.id === id; }); });
    if (!free.length || !pool.length) return false;
    if (!manual && gDay().n >= G_DAY) return false;
    var pair = pool.length > 1 && Math.random() < .5, tables = free.filter(function (i) { return pair ? TABLES[i].seats.length === 2 : true; });
    if (!tables.length) { pair = false; tables = free; }
    var ti = tables[Math.floor(Math.random() * tables.length)], tb = TABLES[ti], n = pair ? 2 : 1, names = [];
    for (var k = 0; k < n; k++) {
      var j = Math.floor(Math.random() * pool.length), id = pool.splice(j, 1)[0], seat = tb.seats.length === 1 ? 0 : (n === 1 ? Math.floor(Math.random() * 2) : k);
      var sx = tb.seats[seat], g = { id: id, table: ti, seat: seat, x: G_DOOR[0], y: G_DOOR[1], dir: 1, sp: (GSPEED[gMove(id)] || GSPEED[id] || 27) + Math.random() * 5, ph: Math.random() * 480, delay: k ? .7 + Math.random() * .3 : 0,
        path: [[G_DOOR[0] + 12, G_LANE], [sx, G_LANE + (k ? 2 : 0)], [sx, G_SEAT]], face: sx < tb.top[0] ? 1 : -1, state: "walk", order: gOrder(id), t0: 0, wait: 0 };
      if (gFlies(g)) g.path = [[sx, G_SEAT]];
      guests.push(g); gMake(g); names.push(ALLANI[id].name);
    }
    gDay().n += n; var C2 = cfL(); C2.gseen = C2.gseen || {}; guests.slice(-n).forEach(function (q) { C2.gseen[q.id] = Date.now(); }); if (window.SudokuSave) window.SudokuSave();
    beep([[784, .05], [988, .06]]); say(names.join(" und ") + (n > 1 ? " kommen" : " kommt") + " ins Café.");
    return true;
  }
  function gServe(g) {
    var got = gTake(g.order, true);
    if (!got) { say(ALLANI[g.id].name + " möchte " + gOrderText(g.order) + ". " + (g.order.kind === "cake" ? "Back in der Backstube einen Kuchen." : g.order.kind === "tea" ? "Mach am Wasserkessel einen Tee." : "Mach an der Kaffeemaschine " + (g.order.kind === "kakao" ? "einen Kakao." : "einen Kaffee."))); beep([[392, .05]]); return; }
    got = gTake(g.order, false); g.wished = got.wished; if (g.order.kind === "cake") { g.cakeK = got.k; if (got.kitchen) say(N() + " holt schnell einen Kuchen aus der Küche und schneidet ihn an."); }
    g.state = "bring"; gBubble(g); cfStock();
    var ic = gIcon(g.order.kind, g.order.kind === "cake" ? g.cakeK : null), iw = g.order.kind === "cake" ? 13 : 8;
    cfHamJob(function () {
      var tb = TABLES[g.table], sx = tb.seats[g.seat], to = [tb.top[0] + (sx < tb.top[0] ? -7 : 7), 126];
      return (cfHamAway() ? cfHamHome() : Promise.resolve()).then(function () {   /* first to the counter to fetch it */
        var tr = cfTray(ic, iw, g.order.kind === "cake" ? 11 : 8); cfHold(tr.svg, tr.w, tr.h, true); return cfHamGo(to); }).then(function () {
        if (!cafeOn || g.state !== "bring") return;
        cfHold("");
        if (gClosing()) { gToGo(g); return cfWait(900).then(function () { cfHamSet({}); }); }
        g.state = "eat"; g.t0 = performance.now(); gItemOnTable(g, true);
        cfHamSet({ eyes: "happy", mouth: "grin" }); say(gServeLine(g)); beep([[659, .05], [784, .05], [988, .06]]);
        return cfWait(900).then(function () { cfHamSet({}); });
      });
    });
    if (window.SudokuSave) window.SudokuSave();
    cfHamSet({ paws: "up", eyes: "happy", mouth: "grin" }); setTimeout(function () { cfHamSet({}); }, 900);
    beep([[659, .05], [784, .05]]);
  }
  // what the hamster says when he puts it on the table: personal, and a little different each time
  function gServeLine(g) {
    var nm = ALLANI[g.id].name, o = g.order, w = o.wish, fr = (garden.friends || {})[g.id] || 0;
    var sk = g.srv || o.kind; o = { kind: sk, wish: o.wish }; var what = o.kind === "cake" ? "ein Stück " + ckName(g.cakeK || (w && w.v) || "moehre") : o.kind === "tea" ? "dein Tee" : o.kind === "kakao" ? "dein Kakao" : "dein Kaffee";
    var L = [];
    if (o.kind === "cake") L.push("Bitte schön, " + nm + ": " + what + ". Lass es dir schmecken!", "Guten Appetit, " + nm + "!", "Frisch aus der Backstube, " + nm + ". Guten Appetit!");
    else if (o.kind === "tea") L.push("Dein Tee, " + nm + ". Vorsicht, heiß!", "Lass dir den Tee schmecken, " + nm + "!", "Bitte schön, " + nm + ". Ganz frisch aufgegossen.");
    else L.push("Bitte schön, " + nm + ": " + what + ". Lass ihn dir schmecken!", "Guten Appetit, " + nm + "!", "Frisch gemacht, nur für dich, " + nm + ".");
    if (g.wished && w) L = ["Genau so, wie du es dir gewünscht hast, " + nm + ". Guten Appetit!", "Extra für dich, " + nm + ". Lass es dir schmecken!"];
    if (g.wrong) L = ["Heute gibt es leider etwas anderes, " + nm + ". Probier mal!", "Ich hoffe, das schmeckt dir auch, " + nm + "."];
    else if (!g.wished) L = ["Ich hoffe, das schmeckt dir trotzdem, " + nm + ". Guten Appetit!", "Heute leider etwas anderes, " + nm + ". Lass es dir trotzdem schmecken!"];
    if (fr >= 3 && Math.random() < .4) L.push("Schön, dass du wieder da bist, " + nm + "! Guten Appetit.");
    return N() + ": „" + L[Math.floor(Math.random() * L.length)] + "“";
  }
  function gPay(g) {
    var p = gPref(g.id), C_ = cfL(), n = g.wished ? 2 : 1, h = PAY_N[p.mat] ? p.mat : "sunflower";
    garden.harvest[h] = (garden.harvest[h] || 0) + n; if (typeof renderFoods === "function") renderFoods();
    C_.paid = C_.paid || {}; C_.paid[h] = (C_.paid[h] || 0) + n;
    var nm = ALLANI[g.id].name;
    say(nm + (g.wished ? " freut sich: genau das Richtige! " : " bedankt sich trotzdem. ") + "Bezahlt mit " + PAY_N[h][n - 1] + ".");
    var ic = A[FOOD[h] || h] ? '<g transform="translate(-5 -64)">' + A[FOOD[h] || h] + '</g>' : "";
    gFx(g, (g.wished ? gHearts() : "") + ic, 1600);
    beep(g.wished ? [[784, .06], [988, .06], [1319, .1]] : [[659, .05], [880, .08]]);
    if (g.wished && typeof addHeart === "function") addHeart(g.id, true);
    if (window.SudokuSave) window.SudokuSave();
  }
  function gGo(g) { g.hd = 0; if (gFlies(g)) { g.state = "leave"; g.delay = 0; g.path = [[G_DOOR[0], G_DOOR[1]]]; return; } g.state = "leave"; g.delay = g.seat && guests.some(function (q) { return q !== g && q.table === g.table && q.state === "leave"; }) ? .4 + Math.random() * .3 : 0; g.path = [[g.x, G_LANE + (g.seat ? 2 : 0)], [G_DOOR[0] + 12, G_LANE], [G_DOOR[0], G_DOOR[1]]]; }
  // ---- the loop while the café is open
  function gLoop(t) {
    if (!cafeOn) { gRaf = 0; return; }
    var dt = Math.min(.05, (t - (gLast || t)) / 1000); gLast = t;
    var paused = (typeof cfGameOn !== "undefined" && cfGameOn) || uiBusy();
    if (!paused && !gClosing()) { gNext -= dt; if (gNext <= 0) { if (gTablesFree().length) { gSpawn(); gNext = 20 + Math.random() * 30; } else gNext = 5; } }
    if (paused) guests.forEach(function (g) {                    // while baking or brewing, time stands still at the tables: no paying, no hearts until you are back
      var ms = dt * 1000; if (g.state === "fly" || g.state === "eat" || g.state === "chat") { g.t0 += ms; if (g.ts) g.ts += ms; if (g.talkAt) g.talkAt += ms; }
    });
    guests.forEach(function (g) {   // nobody stays longer than five minutes in all; this clock keeps running while you bake or brew
      if (g.state !== "leave" && g.state !== "gone") { g.life = (g.life || 0) + dt;
        if (g.life > G_MAX && /^(wait|eat|chat|fly)$/.test(g.state)) { if (g.state === "eat" || g.state === "fly") { g.sip = 0; gItemOnTable(g, false); gPay(g); } else if (g.state === "wait") say(ALLANI[g.id].name + " muss leider los. Vielleicht ein andermal."); gGo(g); return; } }
      if (g.state === "walk") { if (gStep(g, dt)) { g.mov = false; g.state = "wait"; g.wait = 0; gBubble(g); if (g === guests.filter(function (q) { return q.table === g.table; })[0]) say(ALLANI[g.id].name + (g.atTable && !g.ordered ? " setzt sich und schaut in die Karte." : " setzt sich und möchte " + gOrderText(g.order) + ".")); } }
      else if (g.state === "wait") { if (!paused && (!g.atTable || g.ordered)) g.wait += dt; if (g.wait > 170) { gGo(g); gBubble(g); say(ALLANI[g.id].name + " konnte nicht länger warten. Vielleicht ein andermal."); } }
      else if (g.state === "fly") { var u = Math.min(1, (t - g.t0) / 650); if (u >= 1) { g.state = "eat"; g.t0 = t; gItemOnTable(g, true); } }
      else if (g.state === "eat") {
        if (!g.ts) g.ts = g.t0;
        var st = Math.min(3, Math.floor((t - g.t0) / G_EAT * 4)); if (st !== g.stage) { g.stage = st; gItemOnTable(g, true); }
        g.sip = ((t - g.t0) % 4200) < 450 ? 1 : 0;
        if (t - g.t0 > G_EAT) { g.sip = 0; gItemOnTable(g, false); gPay(g); g.state = "chat"; g.t0 = t; g.talkAt = t + 2200 + Math.random() * 2500; }
      }
      else if (g.state === "chat") {
        if (t >= g.talkAt) { gTalk(g); g.talkAt = t + 4000 + Math.random() * 4500; }
        if (t - g.ts > G_STAY) gGo(g);
      }
      else if (g.state === "leave") { if (gStep(g, dt)) { g.state = "gone"; if (g.el) g.el.remove(); g.el = null; } }
      if (g.el) gPos(g, t);
    });
    // the flying cup or cake, from the counter to the table
    var fl = document.getElementById("cf-gfly"), fh = "";
    guests.forEach(function (g) { if (g.state !== "fly") return; var u = Math.min(1, (t - g.t0) / 650), tb = TABLES[g.table], x = 288 + (tb.top[0] - 288) * u, y = 70 + (tb.top[1] - 8 - 70) * u - Math.sin(u * Math.PI) * 26; fh += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')">' + gIcon(g.order.kind, gCk(g)) + '</g>'; });
    if (fl && fl._h !== fh) { fl.innerHTML = fh; fl._h = fh; }
    var before = guests.length;
    guests = guests.filter(function (g) { return g.state !== "gone"; });
    if (before && !guests.length && gClosing()) say("Alle Gäste sind gegangen. Das Café ist geschlossen.");
    gDepth();
    gRaf = requestAnimationFrame(gLoop);
  }
  function guestsStart() { guests.forEach(function (g) { if (g.el) g.el.remove(); }); guests = []; gNext = 6 + Math.random() * 6; gLast = 0; if (!gRaf) gRaf = requestAnimationFrame(gLoop); }
  var _gq_open = openCafe; openCafe = function () { _gq_open.apply(this, arguments); var svg = cfTrack.querySelector(".cf-svg"); if (svg && !svg.querySelector("#cf-guests")) { var st = svg.querySelector("#cf-stock"); var gg = document.createElementNS("http://www.w3.org/2000/svg", "g"); gg.id = "cf-guests"; var gf = document.createElementNS("http://www.w3.org/2000/svg", "g"); gf.id = "cf-gfly"; svg.insertBefore(gg, st.nextSibling); svg.insertBefore(gf, gg.nextSibling); } guestsStart(); gSign(); };
  var _gq_close = closeCafe; closeCafe = function () { if (cafeOn && guests.length) say("Die Gäste verabschieden sich."); guests.forEach(function (g) { if (g.el) g.el.remove(); }); guests = []; return _gq_close.apply(this, arguments); };
  // everyone out in the room is drawn by depth: whoever stands lower in the picture is in front
  function gDepth() {
    var L = gLayerEl(); if (!L) return;
    var hw = document.getElementById("cf-hamw"), it = guests.filter(function (g) { return g.el && g.el.parentNode === L; }).map(function (g) { return { el: g.el, y: g.y }; });
    if (hw && hw.parentNode === L) it.push({ el: hw, y: CFH.y + .5 });
    it.sort(function (a, b) { return a.y - b.y; });
    var ch = L.children, same = ch.length === it.length;
    for (var i = 0; same && i < it.length; i++) if (ch[i] !== it[i].el) same = false;
    if (!same) it.forEach(function (q) { L.appendChild(q.el); });
  }
  function gReattach() {
    var svg = cfTrack.querySelector(".cf-svg"); if (!svg) return;
    if (!svg.querySelector("#cf-guests")) { var st = svg.querySelector("#cf-stock"); var gg = document.createElementNS("http://www.w3.org/2000/svg", "g"); gg.id = "cf-guests"; var gf = document.createElementNS("http://www.w3.org/2000/svg", "g"); gf.id = "cf-gfly"; svg.insertBefore(gg, st.nextSibling); svg.insertBefore(gf, gg.nextSibling); }
    var L = gLayerEl(); guests.forEach(function (g) { if (g.el) L.appendChild(g.el); });
    gSign();
  }
  // tapping a guest at a table: serve them, or hear what they would like
  cfTrack.addEventListener("click", function (e) {
    if (e.target.closest(".cf-hit") || cfGameOn) return;
    var r = cfTrack.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * CF.w, y = (e.clientY - r.top) / r.height * CF.h;
    var near = guests.filter(function (q) { return !q.q && q.table >= 0 && q.state !== "gone" && (Math.abs(q.x - x) < 16 || Math.abs(TABLES[q.table].top[0] - x) < 20) && y > 54 && y < 118; });
    var rank = function (q) { return (q.state === "wait" && q.atTable && !q.ordered ? 0 : q.state === "wait" ? 100 : 200) + Math.abs(q.x - x); };
    near.sort(function (a, b) { return rank(a) - rank(b); }); var g = near[0];
    if (!g) return;
    if (g.state === "wait") gAsk(g);
    else if (g.state === "walk") say(ALLANI[g.id].name + " sucht sich gerade einen Platz.");
    else if (g.state === "eat") say(ALLANI[g.id].name + " lässt es sich schmecken.");
    else if (g.state === "chat") say(ALLANI[g.id].name + (guests.some(function (q) { return q !== g && q.table === g.table; }) ? " plaudert gemütlich." : " genießt die Ruhe im Café."));
  });
  // ---- closing soon: served guests leave, whoever is still waiting takes their order along, nobody new comes in
  function gClosing() { return !!cfL().closing; }
  function gToGo(g) {
    gPay(g); g.state = "pay"; gBubble(g);
    var sk = g.srv || g.order.kind, it = document.createElementNS("http://www.w3.org/2000/svg", "g"); it.setAttribute("class", "gq-carry"); g.el.appendChild(it);   // held in front of the body
    it.innerHTML = '<g transform="translate(' + (sk === "cake" ? -6 : -4) + ' -15)">' + gIcon(sk, gCk(g)) + '</g>';
    say(ALLANI[g.id].name + " nimmt " + (sk === "cake" ? "den Kuchen" : sk === "tea" ? "den Tee" : sk === "kakao" ? "den Kakao" : "den Kaffee") + " mit nach Hause.");
    setTimeout(function () { gGo(g); }, 1200);
  }
  function gSign() {
    var svg = cfTrack.querySelector(".cf-svg"); if (!svg) return; var old = svg.querySelector("#cf-sign"); if (old) old.remove();
    if (!gClosing()) return;
    var gg = document.createElementNS("http://www.w3.org/2000/svg", "g"); gg.id = "cf-sign";
    gg.innerHTML = '<path fill="#3a2414" d="M21 66h11v1h-11zM26 61h1v5h-1z"/><path fill="#3a2414" d="M18 67h17v8h-17z"/><path fill="#fff8ec" d="M19 68h15v6h-15z"/><path fill="#c8463c" d="M20 70h13v2h-13z"/>';
    var gl = svg.querySelector("#cf-guests"); svg.insertBefore(gg, gl || svg.querySelector("#cf-stock"));
  }
  function gCloseSoon() {
    cfL().closing = 1; if (window.SudokuSave) window.SudokuSave(); gSign();
    say(N() + " hängt das Schild „Bald geschlossen“ an die Tür."); beep([[523, .05], [392, .08]]);
    guests.forEach(function (g) {
      if (g.state === "eat") { gItemOnTable(g, false); gPay(g); g.state = "pay"; setTimeout(function () { gGo(g); gBubble(g); }, 1500); }
      else if (g.state === "chat") { gGo(g); gBubble(g); }
    });
  }
  function gReopen() {
    cfL().closing = 0; if (window.SudokuSave) window.SudokuSave(); gSign(); gNext = 8 + Math.random() * 8;
    say(N() + " schließt das Café wieder auf."); beep([[523, .05], [659, .05], [784, .08]]);
  }
  function cfDoorAsk() {
    var old = cafeEl.querySelector(".cf-door-ask"); if (old) old.remove();
    var cl = gClosing(), free = gTablesFree().length > 0 && !cl, el = document.createElement("div"); el.className = "gift-ask pixtext cf-door-ask"; cafeEl.appendChild(el);
    el.innerHTML = '<div class="ga-card"><p class="ga-h">Die Café-Tür</p><div class="ga-row" style="margin-bottom:8px"><button type="button" class="ga-no" data-k="' + (cl ? "open" : "close") + '">' + (cl ? "Wieder aufschließen" : "Bald schließen") + '</button></div><div class="ga-row"><button type="button" class="ga-no" data-k="leave">Café verlassen</button><button type="button" class="ga-yes pbtn" data-k="ask"' + (free ? "" : " disabled") + '>' + (cl ? "Geschlossen" : free ? "Gäste hereinbitten" : "Alle Tische besetzt") + '</button></div></div>';
    el.addEventListener("click", function (e) {
      e.stopPropagation(); var b = e.target.closest("button"); if (!b) { if (e.target === el) el.remove(); return; }
      el.remove();
      if (b.dataset.k === "leave") leaveCafe();
      else if (b.dataset.k === "close") gCloseSoon();
      else if (b.dataset.k === "open") gReopen();
      else if (!gSpawn(true)) say("Gerade ist niemand in der Nähe.");
    });
  }
  // the material crate by the pantry: tap to see what the guests have paid with
  // ---- pictures of drinks: a cup or glass in the drink's colours, with little pictures of what is in it
  var GIC = {"cups":{"cup":["...KKKKKKKK.....","..KlLLLLLLLK....",".KwLLLLLLLLwK...",".KwwLLLLLLwwKKK.",".KwwwwwwwwwwK.K.",".KwwwwwwwwwsK.K.","..KwwwwwwwsKKK..","..KswwwwwssK....","KKKKssssssKKKKK.","KwwwKKKKKKwwwsK.",".KKKKKKKKKKKKK.."],"esp":["..KKKKKK...",".KlLLLLLK..","KwLLLLLLwK.","KwwwwwwwwKKK","KwwwwwwwsK.K",".KwwwwwsKKK.","KKKssssKKKK.","KwwKKKKwwsK.",".KKKKKKKKK.."],"glass":["KKKKKKKKK","KGFFFFFhK","KGFFFFFhK","KGFFFFFhK","KGLLLLLhK","KGlLLLLhK","KGLLLLLhK","KGlLLLLhK","KGLLLLLhK","KGLLLLLhK","KgLLLLLhK",".KhhhhhK.","..KKKKK.."],"small":["KKKKKKK","KGFFFhK","KGLLLhK","KGlLLhK","KGLLLhK","KgLLLhK",".KhhhK.","..KKK.."]},"w":{"milch":["..KKK...","..KhK...",".KwwwK..","KwwwwwK.","KwhhhwK.","KwhhhwK.","KwwwwsK.",".KKKKK.."],"zucker":["........",".KKKKKK.","KwwwwwwK","KwwwwwsK","KwwwwwsK","KwwwwwsK","KsssssSK",".KKKKKK."],"sahne":["...KK...","..KwwK..",".KwwwsK.",".KwwwwK.","KwwwwwsK","KwwwwwwK","KsssssSK",".KKKKKK."],"zimt":["......KK",".....KbK","....KbcK","...KbcK.","..KbcK..",".KbcK...","KbcK....","KKK....."],"kakao":["..KKKK..",".KCCcCK.","KCCCcCCK","KCcCcCcK","KCCCcCCK","KCcCcCcK",".KCCcCK.","..KKKK.."],"sirup":["...KK...","...KK...","..KooK..",".KoOooK.",".KoOooK.",".KoOooK.",".KooooK.","..KKKK.."],"keks":[".KKKKK..","KccbccK.","KcbcccbK","KcccbccK","KbcccccK","KccbcbcK",".KccccK.","..KKKK.."],"bean":["..KKK...",".KBBBK..","KBBbBBK.","KBBbBBK.","KBBbBBK.",".KBbBBK.","..KBBK..","...KK..."],"Herz":["........",".KK.KK..","KrrKrrK.","KrrrrrK.",".KrrrK..","..KrK...","...K....","........"],"Blatt":["....KK..","...KgK..","..KggK..",".KgGgK..",".KgGgK..","..KgK...",".KK.....","........"],"Stern":["...K....","..KyK...","KKKyKKK.",".KyyyK..","..KyK...",".KyKyK..",".K...K..","........"]},"pal":{"K":"#3a2414","w":"#fffaf0","s":"#e0d4c0","S":"#c8b89c","L":"#c8463c","l":"#e87a6a","F":"#f6ead8","f":"#e0c8a8","g":"#e8f4f8","G":"#ffffff","h":"#b8d8e4"},"wpal":{"b":"#8a5a30","c":"#c8905a","C":"#7a4a2a","o":"#d88a2a","O":"#f6c060","B":"#8a5a30","r":"#e8554a","y":"#f6c84a","G":"#86c870","g":"#5aa04e"}};
  function gPx(rows, pal) {
    var by = {}; rows.forEach(function (r, y) { for (var x = 0; x < r.length; x++) { var c = pal[r[x]]; if (!c || r[x] === ".") continue; (by[c] = by[c] || []).push("M" + x + " " + y + "h1v1h-1z"); } });
    return Object.keys(by).map(function (c) { return '<path fill="' + c + '" d="' + by[c].join("") + '"/>'; }).join("");
  }
  function gPal(o) { var p = {}; Object.keys(GIC.pal).forEach(function (k) { p[k] = GIC.pal[k]; }); Object.keys(GIC.wpal).forEach(function (k) { p[k] = GIC.wpal[k]; }); Object.keys(o || {}).forEach(function (k) { p[k] = o[k]; }); return p; }
  function gTeaCol(k, x) {
    var ids = (k || "kamille").split("+"), col = null;
    ids.forEach(function (id, i) { var t = TEA_ING[teaIdx(id)], c = t ? t.c : "#e0a048"; col = col ? mix(col, c, 1 / (i + 1)) : c; });
    col = mix(col, "#a8642a", .2); if ((x || []).indexOf("milch") >= 0) col = mix(col, "#fbf2e2", .45); return col;
  }
  // the cup: d = { kind, k, x, drink }
  function gCup(d) {
    var g, pal;
    if (d.kind === "tea") { var tc = gTeaCol(d.k, d.x); g = "cup"; pal = { L: tc, l: mix(tc, "#ffffff", .35) }; }
    else if (d.kind === "kakao") { g = "cup"; pal = (d.x || []).indexOf("sahne") >= 0 ? { L: "#fffaf0", l: "#ffffff" } : { L: "#7a4a2a", l: "#a8704a" }; }
    else {
      var dr = d.drink || "C";
      if (dr === "E") { g = "esp"; pal = { L: "#6a3a1c", l: "#c88a50" }; }
      else if (dr === "M") { g = "small"; pal = { L: "#6a3a1c", l: "#8a5a30" }; }
      else if (dr === "L") { g = "glass"; pal = { L: "#c8925a", l: "#e0b080" }; }
      else { g = "cup"; pal = { L: "#e8cca4", l: "#fff6e8" }; }
    }
    var rows = GIC.cups[g]; return { svg: gPx(rows, gPal(pal)), w: rows[0].length, h: rows.length };
  }
  // an 8x8 picture for one thing in it
  function gMini(id, kind) {
    if (kind === "bean") { var b = BEAN[bIdx(id)] || BEAN[0]; return gPx(GIC.w.bean, gPal({ B: b.c, b: mix(b.c, "#3a2414", .5) })); }
    if (kind === "ing" || ((id === "honig" || id === "zitrone") && kind !== "cof")) { var t = TEA_ING[teaIdx(id)]; if (t) return gPx(t.px, TEA_PX); }
    if (GIC.w[id]) return gPx(GIC.w[id], gPal());
    return "";
  }
  // cup and up to two little pictures beside it, bottoms lined up
  function gCompose(cup, minis) {
    var w = cup.w, h = Math.max(cup.h, 8), o = '<g transform="translate(0 ' + (h - cup.h) + ')">' + cup.svg + '</g>';
    minis.filter(Boolean).slice(0, 2).forEach(function (m, i) { o += '<g transform="translate(' + (w + 1 + i * 9) + ' ' + (h - 8) + ')">' + m + '</g>'; });
    var n = Math.min(2, minis.filter(Boolean).length); return { svg: o, w: w + (n ? n * 9 + 1 : 0), h: h };
  }
  function gCakeImg(k, big) { return ckPix(k, big); }
  // what a guest would like, as a picture
  function gWishPic(o) {
    var w = o.wish;
    if (o.kind === "cake") return gCakeImg(w ? w.v : "moehre", false);
    var d = { kind: o.kind, k: w && w.t === "ing" ? w.v : null, x: w && w.t === "add" ? [w.v] : [], drink: w && w.t === "drink" ? w.v : "C" }, mini = null;
    if (w && w.t === "ing") mini = gMini(w.v, "ing");
    else if (w && w.t === "add") mini = gMini(w.v, o.kind === "tea" ? "tea" : "cof");
    else if (w && w.t === "bean") mini = gMini(w.v, "bean");
    else if (w && w.t === "art") mini = gMini(w.v);
    return gCompose(gCup(d), [mini]);
  }
  // ---- what is on the counter right now
  function gItems() {
    var C_ = cfL(), out = [];
    var tl = (C_.teas || []).map(function (e) { return typeof e === "string" ? { k: e, x: [] } : e; });
    for (var i = 0; i < (C_.tea || 0); i++) { var e = tl[i] || { k: "kamille", x: [], gen: 1 }; out.push({ src: "tea", i: i, kind: "tea", k: e.k, x: e.x || [], name: e.gen ? "Tee" : teaName(e.k.split("+")) + teaAddName(e.x || []) }); }
    var cl = C_.coffees || [];
    for (var j = 0; j < (C_.cof || 0); j++) {
      var f = cl[j] || { k: "mittel|C", x: [], gen: 1 }, isK = f.k.indexOf("kakao") === 0, pp = f.k.split("|");
      out.push({ src: "cof", i: j, kind: isK ? "kakao" : "coffee", k: f.k, beans: pp[0], drink: pp[1], x: f.x || [], art: f.art, name: f.gen ? "Kaffee" : cofName(pp[0].split("+"), pp[1]) + (f.x && f.x.length ? (/ mit /.test(cofName(pp[0].split("+"), pp[1])) ? " und " : " mit ") + f.x.map(function (a) { return COF_ADD[a] || a; }).join(" und ") : "") });
    }
    ckList().forEach(function (e, q) { out.push({ src: "cake", i: q, kind: "cake", k: e.k, n: e.n, name: ckName(e.k) + (e.n < 4 ? " (" + e.n + " Stück)" : "") }); });
    if (!ckList().length && garden.harvest.cake > 0) out.push({ src: "kitchen", kind: "cake", k: "moehre", name: ckName("moehre") });
    return out;
  }
  function gItemPic(it) {
    if (it.kind === "cake") return gCakeImg(it.k, false);
    if (it.kind === "tea") { var ings = it.k.split("+").filter(function (v, i, a) { return a.indexOf(v) === i; }); return gCompose(gCup(it), ings.map(function (v) { return gMini(v, "ing"); }).concat((it.x || []).map(function (v) { return gMini(v, "tea"); }))); }
    if (it.kind === "kakao") return gCompose(gCup(it), (it.x || []).map(function (v) { return gMini(v, "cof"); }));
    var bs = (it.beans || "mittel").split("+"); return gCompose(gCup(it), [gMini(bs[0], "bean")].concat((it.x || []).map(function (v) { return gMini(v, "cof"); })).concat(it.art ? [gMini(it.art)] : []));
  }
  function gMatch(o, it) {
    if (it.kind !== o.kind) return false;
    var w = o.wish; if (!w) return true;
    if (o.kind === "cake") return it.k === w.v;
    if (w.t === "ing") return it.k.split("+").indexOf(w.v) >= 0;
    if (w.t === "add") return (it.x || []).indexOf(w.v) >= 0;
    if (w.t === "drink") return it.drink === w.v;
    if (w.t === "bean") return (it.beans || "").split("+").indexOf(w.v) >= 0;
    if (w.t === "art") return it.art === w.v;
    return true;
  }
  function gRemove(it) {
    var C_ = cfL();
    if (it.src === "tea") { C_.tea--; var tl = C_.teas || []; if (it.i < tl.length) tl.splice(it.i, 1); }
    else if (it.src === "cof") { C_.cof--; var cl = C_.coffees || []; if (it.i < cl.length) cl.splice(it.i, 1); }
    else if (it.src === "cake") { var CL = ckList(), e = CL[it.i]; e.n--; if (e.n <= 0) CL.splice(it.i, 1); C_.cakes = CL.length; }
    else if (it.src === "kitchen") { garden.harvest.cake--; var CL2 = ckList(); CL2.push({ k: "moehre", n: 3 }); C_.cakes = CL2.length; if (typeof renderFoods === "function") renderFoods(); }
    cfStock(); if (window.SudokuSave) window.SudokuSave();
  }
  function gSvg(pic, sc) { return '<svg viewBox="0 0 ' + pic.w + ' ' + pic.h + '" width="' + pic.w * sc + '" height="' + pic.h * sc + '" style="width:' + pic.w * sc + 'px !important;height:' + pic.h * sc + 'px !important" shape-rendering="crispEdges">' + pic.svg + '</svg>'; }
  function gPopup(html, onClick) {
    var old = cafeEl.querySelector(".gq-pop"); if (old) old.remove();
    var el = document.createElement("div"); el.className = "gift-ask pixtext gq-pop"; el.innerHTML = '<div class="ga-card">' + html + '</div>'; cafeEl.appendChild(el);
    el.addEventListener("click", function (e) { e.stopPropagation(); if (e.target === el) { el.remove(); return; } var b = e.target.closest("button"); if (b) onClick(b, el); });
    return el;
  }
  // ---- tapping a waiting guest: a card with the wish and everything on the counter to choose from
  function gAsk(g) {
    var nm = ALLANI[g.id].name, its = gItems(), star = gPx(GIC.w.Stern, gPal());
    var tiles = its.map(function (it, n) { var ok = gMatch(g.order, it); return '<button type="button" data-n="' + n + '" class="gq-tile' + (ok ? " gq-ok" : "") + '">' + gSvg(gItemPic(it), 2) + '<span>' + it.name + '</span>' + (ok ? '<i>' + gSvg({ svg: star, w: 8, h: 8 }, 2) + '</i>' : "") + '</button>'; }).join("");
    var make = { tea: "Tee machen", coffee: "Kaffee machen", kakao: "Kakao machen", cake: "Kuchen backen" }[g.order.kind], has = its.some(function (it) { return it.kind === g.order.kind; });
    var html = '<div class="gq-head">' + gSvg(gWishPic(g.order), 2) + '<p class="ga-h">' + nm + ' möchte ' + gOrderText(g.order) + '</p></div>' +
      (its.length ? '<div class="ga-grid gq-grid">' + tiles + '</div>' : '<p class="gq-none">Auf der Theke steht noch nichts.</p>') +
      '<div class="ga-row"><button type="button" class="ga-no" data-k="later">Später</button><button type="button" class="ga-yes pbtn" data-k="make">' + make + '</button></div>';
    gPopup(html, function (b, el) {
      el.remove();
      if (b.dataset.k === "make") { if (g.order.kind === "cake") cfStartBake(); else if (g.order.kind === "tea") teaGame(); else coffeeGame(); return; }
      if (b.dataset.n != null && g.state === "wait") gServeItem(g, its[+b.dataset.n]);
    });
  }
  function gServeItem(g, it) {
    g.wished = gMatch(g.order, it); g.wrong = it.kind !== g.order.kind; g.srv = it.kind; if (it.kind === "cake") g.cakeK = it.k;
    if (it.src === "kitchen") say(N() + " holt schnell einen Kuchen aus der Küche und schneidet ihn an.");
    gRemove(it); g.state = "bring"; gBubble(g);
    var ic = gIcon(it.kind, it.kind === "cake" ? it.k : null), iw = it.kind === "cake" ? 13 : 8;
    cfHamJob(function () {
      var tb = TABLES[g.table], sx = tb.seats[g.seat], to = [tb.top[0] + (sx < tb.top[0] ? -7 : 7), 126];
      return (cfHamAway() ? cfHamHome() : Promise.resolve()).then(function () {   /* first to the counter to fetch it */
        var tr = cfTray(ic, iw, it.kind === "cake" ? 11 : 8); cfHold(tr.svg, tr.w, tr.h, true); return cfHamGo(to); }).then(function () {
        if (!cafeOn || g.state !== "bring") return;
        cfHold("");
        if (gClosing()) { gToGo(g); return cfWait(900).then(function () { cfHamSet({}); }); }
        g.state = "eat"; g.t0 = performance.now(); gItemOnTable(g, true);
        cfHamSet({ eyes: "happy", mouth: "grin" }); say(gServeLine(g)); beep([[659, .05], [784, .05], [988, .06]]);
        return cfWait(900).then(function () { cfHamSet({}); });
      });
    });
    cfHamSet({ paws: "up", eyes: "happy", mouth: "grin" }); setTimeout(function () { cfHamSet({}); }, 900);
    beep([[659, .05], [784, .05]]);
  }
  // ---- tapping the cups on the counter: see what is there and pour away what nobody wants
  function gCounterAsk(sel) {
    var its = gItems().filter(function (it) { return it.src !== "kitchen"; });
    if (!its.length) { say("Auf der Theke steht noch nichts."); beep([[523, .04]]); return; }
    var tiles = its.map(function (it, n) { return '<button type="button" data-n="' + n + '" class="gq-tile' + (sel === n ? " gq-sel" : "") + '">' + gSvg(gItemPic(it), 2) + '<span>' + it.name + '</span></button>'; }).join("");
    var html = '<p class="ga-h">Auf der Theke</p><div class="ga-grid gq-grid">' + tiles + '</div><div class="ga-row"><button type="button" class="ga-no" data-k="close">Schließen</button>' +
      (sel != null ? '<button type="button" class="ga-yes pbtn" data-k="away">' + (its[sel].kind === "cake" ? "Wegräumen" : "Wegschütten") + '</button>' : "") + '</div>';
    gPopup(html, function (b, el) {
      if (b.dataset.n != null) { gCounterAsk(+b.dataset.n); return; }
      el.remove();
      if (b.dataset.k === "away" && its[sel]) { var it0 = its[sel]; if (it0.kind === "cake") { var CL = ckList(); CL.splice(it0.i, 1); cfL().cakes = CL.length; cfStock(); if (window.SudokuSave) window.SudokuSave(); } else gRemove(it0); say(it0.kind === "cake" ? N() + " räumt " + ckName(it0.k) + " aus der Vitrine." : N() + " schüttet " + (it0.kind === "tea" ? "den Tee" : it0.kind === "kakao" ? "den Kakao" : "den Kaffee") + " weg."); beep([[500, .05], [380, .05], [260, .08]]); cfHamSet({ eyes: "half", mouth: "flat" }); setTimeout(function () { cfHamSet({}); }, 900); }
    });
  }
  window.__guests = { closeSoon: function () { gCloseSoon(); }, reopen: function () { gReopen(); }, list: function () { return guests.map(function (g) { return { id: g.id, state: g.state, order: g.order, x: g.x }; }); }, spawn: function () { return gSpawn(); }, serve: function (i) { if (guests[i]) gServe(guests[i]); }, eatEnd: function (i, ms) { var g = guests[i]; if (g) { g.state = "eat"; g.t0 = performance.now() - G_EAT + ms; g.ts = g.t0; } }, ask: function (i) { if (guests[i]) gAsk(guests[i]); }, items: gItems, counter: gCounterAsk, text: gOrderText, take: gTake, order: gOrder };
