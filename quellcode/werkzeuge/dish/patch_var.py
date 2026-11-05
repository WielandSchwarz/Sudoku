import json,re
P='/tmp/claude-0/-home-claude/c2f4144c-e47f-55b9-ac0f-58d21a2c6cc1/scratchpad/ham2/minis.js'
s=open(P).read()
d=json.load(open('/tmp/claude-0/-home-claude/c2f4144c-e47f-55b9-ac0f-58d21a2c6cc1/scratchpad/dish/dwspr.json'))
s=re.sub(r'var DWSPR = \{.*?\}, DWSC = \{\};', lambda m: 'var DWSPR = '+json.dumps(d,separators=(',',':'))+', DWSC = {};', s, count=1)
def rep(old,new):
    global s
    assert old in s, old[:80]; s=s.replace(old,new,1)
rep('var DW_NAME = { plate: "Kuchenteller", plate2: "Frühstücksteller", cup: "Kaffeetasse", fork: "Kuchengabel", pot: "Teekanne" };',
    'var DW_NAME = { plate: "Kuchenteller", plate2: "Frühstücksteller", cup: "Kaffeetasse", fork: "Kuchengabel", pot: "Teekanne", bowl: "Müslischale", glass: "Saftglas", pan: "Pfanne", spoon: "Marmeladenlöffel", mug: "Kakaobecher" };')
# shapes
rep('    if (k === "pot") { if (dx < -24','''    if (k === "bowl") return d > 25 ? 0 : d > 24 ? 1 : d > 21 ? 3 : d > 20 ? 5 : 4;
    if (k === "glass") return d > 14 ? 0 : d > 13 ? 1 : d > 11 ? 3 : 4;
    if (k === "mug") { if (dx >= 17 && dx <= 27 && Math.abs(dy) <= 6) { var hm = dx >= 20 && dx <= 24 && Math.abs(dy) <= 3; return hm ? 0 : (dx === 27 || Math.abs(dy) === 6 || (dx >= 19 && dx <= 25 && Math.abs(dy) === 4)) ? 1 : 3; } return d > 19 ? 0 : d > 18 ? 1 : d > 15 ? 3 : d > 14 ? 5 : 4; }
    if (k === "pan") { if (dx > 24 && dx <= 36 && Math.abs(dy) <= 3) return dx === 36 || Math.abs(dy) === 3 ? 1 : 6; return d > 26 ? 0 : d > 25 ? 1 : d > 22 ? 2 : 4; }
    if (k === "spoon") { var e = (dx * dx) / 49 + ((dy + 20) * (dy + 20)) / 100; if (e <= 1) return e > .8 ? 1 : 2; var as = Math.abs(dx); if (dy >= -11 && dy <= 30) return as > 2 ? 0 : as === 2 || dy === 30 ? 1 : 2; return 0; }
    if (k === "pot") { if (dx < -24''')
rep('  function dwRack(k) { return k === "plate2" ? "plate" : k; }','  function dwRack(k) { return { plate2: "plate", bowl: "plate", mug: "cup", glass: "cup", spoon: "fork", pan: "pot" }[k] || k; }\n  function dwClean(k) { return { plate: "plate_up", plate2: "plate2_up", bowl: "bowl_up", cup: "cup_c", mug: "mug_c", glass: "glass_c", fork: "fork_up", spoon: "spoon_up", pot: "pot_c", pan: "pan_c" }[k]; }')
# dirt
rep('    if (k === "pot") { add(0, 0, 10, 1.4, 5); add(-4, 3, 4, 1.8, 5); }','''    if (k === "pot") { add(0, 0, 10, 1.4, 5); add(-4, 3, 4, 1.8, 5); }
    if (k === "bowl") { add(0, 2, 9, 1, 8); for (var b2 = 0; b2 < 7; b2++) add(Math.random() * 20 - 10, Math.random() * 20 - 10, 1.6, 1, 3); }
    if (k === "glass") { for (var g2 = 0; g2 < 22; g2++) { var ag = g2 / 22 * Math.PI * 2; add(Math.cos(ag) * 8, Math.sin(ag) * 8, 1.5, 1, 7); } add(-9, -7, 2.4, 1, 6); }
    if (k === "pan") { add(2, -2, 12, 1.6, 5); add(-8, 6, 5, 2, 5); add(8, 8, 3, 1, 3); }
    if (k === "spoon") { add(0, -21, 5, 1, 6); add(1, -8, 1.6, 1, 6); }
    if (k === "mug") { for (var m2 = 0; m2 < 28; m2++) { var am = m2 / 28 * Math.PI * 2; add(Math.cos(am) * 12, Math.sin(am) * 12, 1.8, 1, 4); } add(0, 0, 6, 1.4, 4); }''')
rep('if (k === "pot" && sh !== 4) continue;','if ((k === "pot" || k === "pan" || k === "bowl" || k === "glass") && sh !== 4) continue;')
rep('greasy: k === "plate2", soaped: false, tool: k === "pot" ? "brush" : "sponge" };','greasy: k === "plate2" || k === "pan", soaped: false, tool: k === "pot" || k === "pan" || k === "glass" ? "brush" : "sponge" };')
# random round: five pieces out of ten, as many as the rack can hold per kind
rep('    var pool = ["plate", "cup", "fork", "plate2", "pot"];','''    var all = ["plate", "plate2", "bowl", "cup", "mug", "glass", "fork", "spoon", "pot", "pan"].sort(function () { return Math.random() - .5; }), cap = { plate: 3, cup: 2, fork: 1, pot: 1 }, pool = [];
    all.forEach(function (k) { var r = dwRack(k); if (pool.length < 5 && cap[r] > 0) { cap[r]--; pool.push(k); } });''')
rep('var R = { plate: 0, plate2: 0, fork: 1, pot: 2, cup: 3 };','var R = { pan: -1, plate: 0, plate2: 0, bowl: 1, fork: 1.5, spoon: 1.5, pot: 2, cup: 3, mug: 3, glass: 3 };')
rep('  var DWLIFT = { plate: 3, plate2: 3, cup: 12, fork: 2, pot: 14 };','  var DWLIFT = { plate: 3, plate2: 3, cup: 12, fork: 2, pot: 14, bowl: 10, glass: 14, pan: 5, spoon: 2, mug: 14 };')
# sink colours for the new pieces
rep('        else if (it.k === "fork") col = lt > .3 ? "#f4f8fc" : lt > -.2 ? "#c8d0d8" : "#9aa4ae";','''        else if (it.k === "fork" || it.k === "spoon") col = lt > .3 ? "#f4f8fc" : lt > -.2 ? "#c8d0d8" : "#9aa4ae";
        else if (it.k === "pan") col = sh === 6 ? (lt > 0 ? "#8a5a32" : "#6a4226") : sh === 4 ? (lt > .2 ? "#5a5a64" : "#46464e") : (lt > .2 ? "#7a7a86" : "#5a5a64");
        else if (it.k === "glass") col = sh === 3 ? (lt > .3 ? "#ffffff" : "#cfe8f4") : (lt > .35 ? "#ffffff" : lt > -.1 ? "#e4f4fc" : "#cfe6f2");
        else if (sh === 3 && it.k === "bowl") col = lt > .3 ? "#a8c8f8" : lt > -.3 ? "#6aa0e8" : "#3a7ac8";
        else if (sh === 3 && it.k === "mug") col = lt > .3 ? "#a8d890" : lt > -.3 ? "#6fae5a" : "#3e8a3a";''')
rep('        else if (sh === 5) col = it.k === "plate" ? "#6a9ad8" : it.k === "plate2" ? "#e8650c" : "#d8d0c4";','        else if (sh === 5) col = it.k === "plate" ? "#6a9ad8" : it.k === "plate2" ? "#e8650c" : it.k === "bowl" ? "#2a5a9a" : it.k === "mug" ? "#f8f4ec" : "#d8d0c4";')
rep('kd === 4 ? (dv > 1.1 ? "#5a3418" : "#8a5a32") : (dv > 1.2 ? "#3a2010" : "#6a4020");','kd === 4 ? (dv > 1.1 ? "#5a3418" : "#8a5a32") : kd === 6 ? ((x2 + y2) % 3 ? "#c8283a" : "#e84a5a") : kd === 7 ? ((x2 * 3 + y2) % 4 ? "#f0a030" : "#f8c060") : kd === 8 ? ((x2 * 5 + y2 * 3) % 7 === 0 ? "#e8b84a" : "#f8f0dc") : (dv > 1.2 ? "#3a2010" : "#6a4020");')
# the clean piece in the hand: its 2.5d picture
rep('      if (rk === "plate") dwMini(c, it.k, hp[0] - 3, hp[1] - 12, true); else if (rk === "cup") dwMini(c, it.k, hp[0] - 5, hp[1] - 4, true); else if (rk === "fork") dwMini(c, it.k, hp[0] - 2, hp[1] - 7, false); else dwMini(c, it.k, hp[0] - 7, hp[1] - 6, false);',
    '      var cs = DWSPR[dwClean(it.k)]; dwSpr(c, dwClean(it.k), hp[0] - cs.r[0].length / 2, hp[1] - cs.r.length / 2);')
rep('mBan(dwV, rk === "plate" ? "Teller gehören in die Schlitze" : rk === "cup" ? "Tassen kommen auf die Haken" : rk === "fork" ? "Besteck kommt in den Becher" : "Die Kanne gehört aufs Brett"); }',
    'mBan(dwV, rk === "plate" ? "Teller und Schalen gehören in die Schlitze" : rk === "cup" ? "Tassen und Gläser kommen aufs obere Brett" : rk === "fork" ? "Besteck kommt in den Becher" : "Kanne und Pfanne gehören aufs Brett"); }')
# rack: 2.5d sprite, the pieces in their places, the cutlery pot in front
a=s.index('  function dwRackDraw(c, S, t) {'); b=s.index('  function dwWater(c, S, it, t) {')
s=s[:a]+'''  function dwRackDraw(c, S, t) {                                     // the plate rack in 2.5d: posts, an upper shelf for cups and glasses, a tray with dowels, a cutlery pot
    dwSpr(c, "rack_bg", 133, 34);
    var cut = null;
    DW_RACK.forEach(function (r, i) {
      var it = S.rack[i], hl = S.drag && !it && S.step === "put" && r.t === dwRack(S.cur ? S.cur.k : "");
      if (hl) { c.globalAlpha = .3 + .2 * Math.sin(t / 200); mR(c, r.x - 1, r.y - 1, r.w + 2, r.h + 2, "#fff4b0"); c.globalAlpha = 1; }
      if (r.t === "fork") cut = r;
      if (!it) return; var wob = S.wob && S.wob.i === i ? Math.round(Math.sin(S.wob.t * 30) * S.wob.t * 4) : 0, n = dwClean(it), sp = DWSPR[n], w = sp.r[0].length, h = sp.r.length;
      if (r.t === "plate") dwSpr(c, n, r.x + 3.5 - w / 2 + wob, 86 - h);
      else if (r.t === "cup") dwSpr(c, n, r.x + 5.5 - w / 2 + (n === "glass_c" ? 0 : -2), 58 - h + Math.abs(wob));
      else if (r.t === "fork") dwSpr(c, n, r.x + 2, 38 + wob);
      else dwSpr(c, n, r.x + 6.5 - w / 2 + wob, 86 - h + 2);
    });
    if (cut) dwSpr(c, "rack_cut", cut.x - 1, 47);
    if (S.wob) { S.wob.t -= .016; if (S.wob.t <= 0) S.wob = null; }
  }
'''+s[b:]
open(P,'w').write(s); print('ok')
