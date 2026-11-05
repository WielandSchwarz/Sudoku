import json,re
P='../ham2/plant2.js'
s=open(P).read()
d=json.loads(re.search(r'var HVSPR = (\{.*?\}), HVSPRC = \{\};', s).group(1))
d.update(json.load(open('rest.json')))
s=re.sub(r'var HVSPR = \{.*?\}, HVSPRC = \{\};', lambda m: 'var HVSPR = '+json.dumps(d,separators=(',',':'))+', HVSPRC = {};', s, count=1)
def rep(old,new,cnt=1):
    global s
    assert old in s, old[:80]
    s=s.replace(old,new,cnt)
def repfn(name, body):
    global s
    a=s.index('  function '+name+'(')
    b=s.index('\n  function ',a+5)
    s=s[:a]+body+s[b+1:]
repfn('hvSunHead','''  function hvSunHead(cx, cy, R, seeds, rot) {                          // the big sunflower head: shaded petals, the disc, every seed drawn on it
    var n = R > 35 ? "sunhead_b" : "sunhead", o = HVSPR[n].o, c = hvPB(cx, cy, rot || 0); c.drawImage(hvSprCv(n), -o[0], -o[1]);
    seeds.forEach(function (sd) { if (!sd.on) return; mR(c, sd.x - 1, sd.y - 1, 3, 2, "#2a1a0c"); mR(c, sd.x - 1, sd.y - 1, 2, 1, "#6a4a24"); });
    hvPE();
  }
''')
rep('hR(88, 60, 5, 60, "#3a2414"); hR(89, 60, 3, 60, "#5aa04a"); hR(89, 60, 1, 60, "#7ac860");\n        [[80, 84, -1], [100, 96, 1]].forEach(function (l) { hDisc(l[0] + l[2] * 6, l[1], 10, 5, function (dx, dy, d) { return d > .8 ? "#24502a" : dy < 0 ? "#6ab04a" : "#4a9a3a"; }); });',
    'hvSpr("sunstem", 68, 58);')
rep('hR(140, 104, 34, 18, "#3a2414"); hR(141, 105, 32, 14, "#e8d8b8"); hR(141, 105, 32, 2, "#fff8ec");','hvSpr("seedbowl", 139, 104);')
repfn('hvHerb','  function hvHerb(x, y0, y1, cutY) { hvSprC("herb" + Math.max(0, Math.min(6, Math.round((x - 64) / 8))), x, y0); }   /* one herb stem with leaf pairs */\n')
a=s.index('        // the cut stems lie together in a little fan'); b=s.index('        HV.knots.forEach(function (kn, i) { var x = 84 + i * 6')
s=s[:a]+'        hvSpr("herbbundle", 52, 77);   /* the cut stems lie together in a little fan */\n'+s[b:]
repfn('hvDLeaf','''  function hvDLeaf(cx, cy, ang, len, cut) {                            // a long jagged dandelion leaf lying on the ground
    if (len < 30) hvSprC("dleaf_t", cx, cy); else hvSprC("dleaf" + Math.max(0, Math.min(4, Math.round((ang + Math.PI * .9) / (Math.PI * .45)))), cx, cy);
    if (!cut) for (var m = 0; m < 6; m += 2) hR(cx + Math.cos(ang) * (6 + m) - 1, cy + Math.sin(ang) * (6 + m) * .55 - 3, 1, 1, Math.floor(performance.now() / 300) % 2 ? "#ffd34a" : "#fff8ec"); }
''')
rep('hDisc(90, 104, 4, 3, function (dx, dy, d) { return d > .7 ? "#3a2414" : "#8a6a3a"; });','hvSprC("dcrown", 90, 104);')
rep('hR(140, 108, 34, 6, "#3a2414"); hR(141, 109, 32, 4, "#c8a870");','hvSpr("tray", 139, 107);')
repfn('hvChili','  function hvChili(x, y, red, dropY) { hvSprC(red ? "chili" : "chili_u", x, y + (dropY || 0)); }\n')
a=s.index('      if (c === "chili") { hR(88, 30, 5, 76, "#1e4a1e");'); b=s.index('      HV.items.forEach(function (it) { if (it.off) return; if (c === "tomato") hvTomato(')
s=s[:a]+'      if (c === "chili") hvSprC("chiliplant", 90, 106);\n'+s[b:]
rep('for (var q = 0; q < len; q++) { var x = 90 + (bx - 90) * q / len + Math.sin(it.ang) * q * .4, y = 112 - q; hR(x - 2, y, 4, 1, q % 6 === 0 ? "#f07a8a" : "#d8384a"); hR(x - 2, y, 1, 1, "#ff9aa8"); }',
    'hvSprC("rstalk" + Math.round((bx - 70) / 20), 90, 112);')
rep('hDisc(90, 112, 14, 4, function (dx, dy, d) { return d > .7 ? "#3a2414" : "#8a5a3a"; }); }','hvSprC("rcrown", 90, 112); }')
rep('for (var x = 30; x < 120; x++) hR(x, y, 1, 4, x % 7 === 0 ? "#f07a8a" : "#d8384a"); hR(30, y, 90, 1, "#ff9aa8");','hvSprC("rstalk_h", 30, y - 1);')
a=s.index('  function hxBowl() { var x = HV.bowlX, y = HV.bowlY;'); b=s.index('    var nIn = 0; HV.items.forEach(function (it, i) { if (it.off && !it.worm')
s=s[:a]+'  function hxBowl() { var x = HV.bowlX, y = HV.bowlY; hvSprC("bowl", x, y - 3);\n'+s[b:]
repfn('hvBasket','''  function hvBasket(x, y, n, drawItem) {                              // a woven willow basket: back rim, what is inside, the woven front
    hvSprC("bk_back", x, y); for (var q = 0; q < n; q++) drawItem(x + 7 + (q % 3) * 8, y - 1 - Math.floor(q / 3) * 4); hvSprC("bk_front", x, y);
  }
''')
repfn('hvBushBg','  function hvBushBg(t, kind) { hvBg(t, 108); hvSpr("bush_" + kind, 30, 14); }   /* a berry bush: canes with leaves along them */\n')
for kind, n in (('raspberry','rasp'),('blackberry','blac'),('blueberry','blue'),('currant','curr'),('gooseberry','goos')):
    rep('    if (c === "%s") {' % kind, '    if (c === "%s") return hvSprC(ripe ? "%s" : "%s_u", x, y);\n    if (c === "_old%s") {' % (kind, n, n, kind))
open(P,'w').write(s)
print('ok')
