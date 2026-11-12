# ten room sets on the "Leseecke" layout: the existing beds in the middle, night stand + lamp left, chest + fish tank right
import math, random
_s = open('bed_designs2.py').read(); exec(_s[:_s.index('\n# ---------- 1:')])
from beds_lib import BEDS, mkg
from beds_narrow import NBEDS as GAMEBEDS   # Himmelbett, Körbchen-Nest, Kissenkiste, Walnuss, Streichholz, Fliegenpilz, Wolke
C(lb1='#e0bc84', lb2='#c49a5e', lb3='#f0d4a4', dk1='#7a4e2a', dk2='#5a3418', dk3='#9a6a3e',
  sb1='#a8c8a0', sb2='#86a87e', sb3='#c8e0c0', bl1='#9cc0dc', bl2='#7aa0c0', bl3='#c4dcee', rd1='#d8685a', rd2='#b04a3e', rd3='#f0907e',
  ol1='#9aa86a', ol2='#7a8a4e', ol3='#bcc88a', or1='#e8904a', or2='#c06a2e', or3='#f8b478', br1='#8a5a3a', br2='#6a3e24', br3='#aa7a54',
  cy1='#f4ecdc', cy2='#e4d6bc', cy3='#fffaf0', gy1='#c8c4bc', gy2='#a8a49c', gy3='#e4e0d8', mg1='#e8a0c0', mg2='#c87aa0', mg3='#f8c8dc',
  ms1='#7aaa52', ms2='#5a8a3a', ms3='#9ad070', mt1='#cfeee0', mt2='#b4e0cc', mt3='#e6f8f0', mt4='#8ec8b0')
WOODS = {'nuss': {}, 'hell': {'wd': 'lb1', 'wd2': 'lb2', 'wd3': 'lb3'}, 'dunkel': {'wd': 'dk1', 'wd2': 'dk2', 'wd3': 'dk3'},
         'weiss': {'wd': 'cy1', 'wd2': 'cy2', 'wd3': 'cy3'}, 'salbei': {'wd': 'sb1', 'wd2': 'sb2', 'wd3': 'sb3'}, 'blau': {'wd': 'bl1', 'wd2': 'bl2', 'wd3': 'bl3'},
         'rot': {'wd': 'rd1', 'wd2': 'rd2', 'wd3': 'rd3'}, 'mint': {'wd': 'mt2', 'wd2': 'mt4', 'wd3': 'mt3'}}
def remap(g, m):
    if not m: return g
    for y in range(g.h):
        for x in range(g.w):
            c = g.p[y][x]
            if c in m: g.p[y][x] = m[c]
    return g
def blit(dst, src, ox, oy):
    for y in range(src.h):
        for x in range(src.w):
            c = src.p[y][x]
            if c is not None and 0 <= x + ox < dst.w and 0 <= y + oy < dst.h: dst.p[y + oy][x + ox] = c
# ---- walls (y 0..99) ----
def w_stripes(g, a, b, c):
    g.rect(0, 0, 179, 99, a)
    for x in range(0, 180, 12): g.rect(x, 0, x + 5, 99, b)
    for x in range(3, 180, 12):
        for y in range(8, 98, 12): g.put(x, y, c)
def w_flowers(g, bg, f1, f2, leaf='hb', step=14):
    g.rect(0, 0, 179, 99, bg)
    for y in range(8, 99, step - 4):
        for x in range((y // (step - 4)) % 2 * (step // 2), 180, step):
            g.put(x, y, f1); g.put(x - 1, y, f2); g.put(x + 1, y, f2); g.put(x, y - 1, f2); g.put(x, y + 1, leaf)
def w_boards(g, a, b, c):
    g.rect(0, 0, 179, 99, a)
    for x in range(0, 180, 9): g.rect(x, 0, x, 99, b); g.rect(x + 1, 0, x + 1, 99, c)
    rnd = random.Random(9)
    for k in range(50): x = rnd.randint(0, 179); y = rnd.randint(0, 96); g.rect(x, y, x, y + 2, b)
def w_leaves(g, bg, l1, l2):
    g.rect(0, 0, 179, 99, bg)
    for y in range(8, 99, 13):
        for x in range((y // 13) % 2 * 9, 180, 18):
            g.put(x, y, l1); g.put(x + 1, y - 1, l1); g.put(x + 1, y, l2); g.put(x + 2, y - 2, l1); g.put(x - 1, y + 1, l2)
def w_clouds(g, bg, c1, c2):
    g.rect(0, 0, 179, 99, bg)
    for (cx, cy) in ((20, 18), (70, 12), (130, 24), (40, 56), (110, 62), (160, 50), (80, 86), (14, 88)):
        for (dx, rx) in ((0, 6), (6, 4), (-5, 4)): rell(g, cx + dx, cy, rx, 2.6, 0, c1)
        g.rect(cx - 8, cy + 2, cx + 9, cy + 2, c2)
def w_stars(g, bg, s1, s2, seed=5):
    rnd = random.Random(seed); g.rect(0, 0, 179, 99, bg)
    for k in range(110): g.put(rnd.randint(0, 179), rnd.randint(4, 98), s2)
    for k in range(24):
        x, y = rnd.randint(2, 177), rnd.randint(8, 92)
        for (dx, dy) in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)): g.put(x + dx, y + dy, s1)
def w_gingham(g, a, b, c):
    for y in range(100):
        for x in range(180):
            u, v = (x // 5) % 2, (y // 5) % 2
            g.put(x, y, c if u and v else (b if u or v else a))
def w_retro(g, bg, c1, c2):
    g.rect(0, 0, 179, 99, bg)
    for y in range(10, 99, 16):
        for x in range((y // 16) % 2 * 10, 180, 20):
            rell(g, x, y, 5, 5, 0, c1); rell(g, x, y, 3, 3, 0, bg); rell(g, x, y, 1.4, 1.4, 0, c2)
def w_plain(g, a, b, seed=4):
    rnd = random.Random(seed); g.rect(0, 0, 179, 99, a)
    for k in range(180): g.put(rnd.randint(0, 179), rnd.randint(4, 98), b)
def wainscot(g, a, b, c, y0=64):
    g.rect(0, y0, 179, 99, a)
    for x in range(0, 180, 10): g.rect(x, y0 + 2, x, 97, b)
    g.rect(0, y0 - 2, 179, y0 + 1, b); g.rect(0, y0 - 2, 179, y0 - 2, a); g.rect(0, y0 + 1, 179, y0 + 1, c)
# ---- floors (y 97..134) ----
def f_planks(g, m=None, seed=2):
    t = G(*S); planks(t, 100, random.Random(seed)); remap(t, m); blit(g, t, 0, 0)
PL = {'hell': {'fp1': 'lb1', 'fp2': 'lb3', 'fp3': 'cy1', 'fp4': 'lb2', 'nail': 'dk2'}, 'dunkel': {'fp1': 'dk1', 'fp2': 'br1', 'fp3': 'dk3', 'fp4': 'dk2', 'nail': 'K'},
      'grau': {'fp1': 'gy1', 'fp2': 'gy3', 'fp3': 'cy3', 'fp4': 'gy2', 'nail': 'gy2'}, 'weiss': {'fp1': 'cy1', 'fp2': 'cy3', 'fp3': 'wh', 'fp4': 'cy2', 'nail': 'cy2'}}
def f_carpet(g, a, b, c, seed=6):
    rnd = random.Random(seed)
    for y in range(100, 135):
        for x in range(180): g.put(x, y, a if (x + y * 3) % 7 else b)
    for k in range(160): g.put(rnd.randint(0, 179), rnd.randint(101, 134), c)
    g.rect(0, 97, 179, 100, 'wd2'); g.rect(0, 97, 179, 97, 'wd3')
def f_herring(g, a, b, c):
    for y in range(100, 135):
        for x in range(180):
            yy = y - 100; dd = (x % 12) + (yy if (x // 12) % 2 else -yy)
            g.put(x, y, c if dd % 4 == 0 or x % 12 == 0 else (a if (dd // 4) % 2 else b))
    g.rect(0, 97, 179, 100, 'wd2'); g.rect(0, 97, 179, 97, 'wd3')
def f_check(g, a, b, a2=None):
    rows = [(100, 6), (106, 7), (113, 8), (121, 9), (130, 5)]
    for r, (yy, h) in enumerate(rows):
        for x in range(0, 180, 12):
            c = a if ((x // 12) + r) % 2 else b
            g.rect(x, yy, min(179, x + 11), min(134, yy + h - 1), c)
            if a2 and c == a: g.rect(x, yy, min(179, x + 11), yy, a2)
    g.rect(0, 97, 179, 100, 'wd2'); g.rect(0, 97, 179, 97, 'wd3')
# ---- the furniture around the bed ----
def window(a, cur, sill=True, night=False, lace=False):
    a.rect(13, 19, 39, 49, 'wd')
    for yy in range(22, 47):
        for xx in range(16, 37): a.p[yy][xx] = None
    a.rect(26, 22, 26, 46, 'wd'); a.rect(16, 33, 36, 33, 'wd'); a.rect(10, 49, 42, 52, 'wd3'); a.rect(10, 52, 42, 52, 'wd2')
    if lace:
        for x in range(16, 37):
            for y in range(22, 27):
                if (x + y) % 3 == 0: a.put(x, y, 'lace')
            if x % 2: a.put(x, 27, 'lace')
    if cur:
        for x0 in (4, 40):
            a.rect(x0, 16, x0 + 6, 54, cur[0]); a.rect(x0 + 5, 16, x0 + 6, 54, cur[1])
            for yy in range(20, 54, 5): a.rect(x0, yy, x0 + 4, yy, cur[2])
        a.rect(2, 14, 50, 15, 'brs2')
    if sill: plant(a, 20, 49); plant(a, 32, 49)
def nightstand(a, lampk, shade=('mu1', 'mu2')):
    x0 = 12; a.rect(x0, 80, x0 + 18, 99, 'wd'); a.rect(x0 - 1, 78, x0 + 19, 80, 'wd3'); a.rect(x0 + 18, 81, x0 + 18, 99, 'wd2')
    a.rect(x0 + 2, 84, x0 + 16, 90, 'wd2'); a.rect(x0 + 3, 85, x0 + 15, 89, 'wd'); a.rect(x0 + 8, 87, x0 + 10, 87, 'brs')
    x = 19
    if lampk == 'shade': lamp(a, x, 78, *shade)
    elif lampk == 'mush':
        a.rect(x - 1, 70, x, 77, 'stem'); rell(a, x, 69, 7, 4, 0, 'mush'); a.rect(x - 7, 69, x + 7, 70, 'mush2'); a.put(x - 3, 67, 'stem'); a.put(x + 2, 66, 'stem'); a.put(x + 4, 68, 'stem')
    elif lampk == 'candle':
        rell(a, x, 77, 5, 1.4, 0, 'brs'); a.rect(x - 2, 69, x + 1, 76, 'cy3'); a.rect(x + 1, 70, x + 1, 76, 'cy2'); a.put(x - 1, 68, 'K'); rell(a, x - 1, 66, 1.4, 2, 0, 'lg')
    elif lampk == 'star':
        a.rect(x - 1, 72, x, 77, 'brs2'); a.poly([(x - 5, 68), (x + 5, 68), (x, 61)], 'star'); a.poly([(x - 5, 64), (x + 5, 64), (x, 71)], 'star')
    elif lampk == 'moon':
        a.rect(x - 1, 72, x, 77, 'brs2'); rell(a, x, 66, 6, 6, 0, 'mn'); rell(a, x - 2, 64, 1.6, 1.6, 0, 'mn2'); rell(a, x + 2, 68, 1.2, 1.2, 0, 'mn2')
    a.rect(24, 74, 28, 77, 'bk2'); a.rect(24, 74, 28, 74, 'bk3')
def chest(a, top=None):
    x0 = 132; a.rect(x0, 76, x0 + 26, 99, 'wd'); a.rect(x0 - 1, 74, x0 + 27, 76, 'wd3'); a.rect(x0 + 26, 77, x0 + 26, 99, 'wd2')
    for y in (79, 86, 93): a.rect(x0 + 2, y, x0 + 24, y + 5, 'wd2'); a.rect(x0 + 3, y + 1, x0 + 23, y + 4, 'wd'); a.rect(x0 + 12, y + 2, x0 + 14, y + 2, 'brs')
    tank(a, 132, 73)
def frames(a, cols):
    for (x0, y0, w, h), c in zip(((54, 22, 12, 16), (70, 18, 14, 20), (88, 24, 10, 12)), cols):
        a.rect(x0, y0, x0 + w, y0 + h, 'wd'); a.rect(x0 + 2, y0 + 2, x0 + w - 2, y0 + h - 2, c); a.rect(x0, y0, x0 + w, y0, 'wd3')
def rug_oval(a, cols, cx=82, rx=46, ry=10):
    for j, c in enumerate(cols): rell(a, cx, 118, rx - j * (rx / len(cols) * .8), ry - j * (ry / len(cols) * .8), 0, c)
def rug_rect(a, c1, c2, c3):
    a.rect(40, 108, 124, 127, c1); a.rect(43, 110, 121, 125, c2)
    for x in range(46, 119, 8): a.rect(x, 115, x + 3, 120, c3)
    for x in range(40, 125, 3): a.put(x, 107, c2); a.put(x, 128, c2)
def rug_check(a, c1, c2):
    for y in range(107, 129):
        for x in range(40, 126):
            if ((x - 83) / 43) ** 2 + ((y - 118) / 11) ** 2 <= 1: a.put(x, y, c1 if ((x // 4) + (y // 3)) % 2 else c2)
def rug_fur(a, c1, c2, c3):
    rnd = random.Random(3); rell(a, 82, 118, 34, 9, 0, c1)
    for ang in range(0, 360, 14):
        r = math.radians(ang); rell(a, 82 + math.cos(r) * 33, 118 + math.sin(r) * 8.6, 3, 2, 0, c1)
    for k in range(70): a.put(82 + rnd.uniform(-30, 30), 118 + rnd.uniform(-7, 7), rnd.choice([c2, c3]))
def bunting(a, cols, y=10, x0=56, x1=128):
    line(a, x0, y, x1, y, 'wd2')
    for k, x in enumerate(range(x0 + 2, x1 - 4, 7)): yy = y + int(2 * math.sin((x - x0) / (x1 - x0) * math.pi)); a.poly([(x, yy), (x + 5, yy), (x + 2.5, yy + 5)], cols[k % len(cols)])
def lights(a, x0=50, x1=136):
    for k, x in enumerate(range(x0, x1, 5)):
        y = 9 + int(4 * math.sin((x - x0) / (x1 - x0) * math.pi)); a.put(x, y, 'wd2'); rell(a, x, y + 2, 1.4, 1.6, 0, ('lg', 'lg2', 'mn')[k % 3])
def hang_plant(a, x=150, y=8):
    line(a, x, 7, x, 28, 'wd2'); a.poly([(x - 6, 28), (x + 6, 28), (x + 4, 35), (x - 4, 35)], 'cu'); a.rect(x - 6, 28, x + 6, 28, 'cu3')
    for k in range(6): line(a, x - 5 + k * 2, 30, x - 8 + k * 3, 40 + (k % 3) * 4, 'hb'); rell(a, x - 8 + k * 3, 40 + (k % 3) * 4, 1.6, 1.2, 0, 'hb2')
def floor_plant(a, x=168):
    a.poly([(x - 6, 86), (x + 6, 86), (x + 5, 99), (x - 5, 99)], 'cu'); a.rect(x - 6, 86, x + 6, 87, 'cu3'); a.rect(x + 3, 88, x + 5, 98, 'cu2')
    for k in range(9):
        ang = math.radians(-170 + k * 20); L = 12 + (k % 3) * 3
        line(a, x, 85, x + math.cos(ang) * L, 85 + math.sin(ang) * L, 'hb2'); rell(a, x + math.cos(ang) * L, 85 + math.sin(ang) * L, 2.6, 1.6, 0, 'hb' if k % 2 else 'hb2')

BX = 8   # bed, rug and window move right so the window clears the left beam
def shifted(l, dx):
    t = G(*S); blit(t, l, dx, 0); return t
def scene(st, ham=True):
    g = G(*S)
    st['wall'](g); st['floor'](g); beams(g)
    win = lambda x, y: 16 + BX <= x <= 36 + BX and 22 <= y <= 46
    hole(g, win, 14 + BX, 20, 38 + BX, 48, night=st.get('night', False))
    slope(g, skylight=st.get('skylight', False))
    W = WOODS[st['wood']]
    furn = shifted(lay(lambda a: window(a, st.get('cur'), st.get('sill', True), lace=st.get('lace', False))), BX)
    stand = shifted(lay(lambda a: nightstand(a, st.get('lamp', 'shade'), st.get('shade', ('mu1', 'mu2')))), 24)   # right next to the bed
    furn2 = lay(lambda a: chest(a))
    for l in (furn, stand, furn2): remap(l, W)
    name, bf, bsz, ff, fsz, bpos, fpos, hpos = GAMEBEDS[st['bed']]
    bb = remap(mkg(bf, *bsz), st.get('bedmap')); fb = remap(mkg(ff, *fsz), st.get('bedmap'))
    HX = 82 + BX; dx = HX - hpos[0]
    extra = lay(st['extra']) if st.get('extra') else None
    rug = shifted(lay(st['rug']), BX)
    L = [furn, stand, furn2, rug] + ([extra] if extra else [])
    comp(g, *L); blit(g, bb, bpos[0] + dx, bpos[1])
    if ham: comp(g, hamlay(HX, hpos[1]))
    blit(g, fb, fpos[0] + dx, fpos[1])
    comp(g, railing(g))
    return g

SETS = [
 dict(name='Landhaus Rosé', bed=0, wood='weiss', cur=('rs2', 'rs3', 'rs1'), lace=True, lamp='shade', shade=('rs2', 'rs3'), frames=('rs1', 'sg1', 'sk1'),
      wall=lambda g: (w_flowers(g, 'rs1', 'rs3', 'rs2'), wainscot(g, 'wn1', 'wn2', 'wn3')), floor=lambda g: f_planks(g, PL['hell']),
      rug=lambda a: rug_oval(a, ('rs3', 'pw1', 'rs2', 'pw1', 'sg1'))),
 dict(name='Waldhütte', bed=3, wood='dunkel', cur=('rd1', 'rd2', 'rd3'), lamp='candle', frames=('ol3', 'sb1', 'cy1'),
      wall=lambda g: w_boards(g, 'br3', 'br1', 'lb2'), floor=lambda g: f_planks(g, PL['dunkel']),
      rug=lambda a: rug_rect(a, 'rd2', 'rd1', 'cy1'), extra=lambda a: floor_plant(a)),
 dict(name='Märchenwald', bed=5, wood='salbei', cur=('ms1', 'ms2', 'ms3'), lamp='mush', frames=('mt1', 'rs1', 'mu3'),
      wall=lambda g: w_leaves(g, 'mt3', 'ms3', 'ms1'), floor=lambda g: f_carpet(g, 'ms1', 'ms2', 'ms3'),
      rug=lambda a: rug_oval(a, ('mush2', 'mush', 'stem', 'mush')), extra=lambda a: hang_plant(a)),
 dict(name='Wolkentraum', bed=6, wood='weiss', cur=('bl3', 'bl1', 'cy3'), lamp='star', frames=('bl3', 'mu3', 'lv3'),
      wall=lambda g: w_clouds(g, 'sk1', 'sk3', 'sk2'), floor=lambda g: f_carpet(g, 'cy3', 'cy1', 'bl3'),
      rug=lambda a: rug_fur(a, 'wh', 'cy1', 'bl3'), extra=lambda a: bunting(a, ('bl1', 'mu3', 'lv1', 'wh'))),
 dict(name='Boho', bed=1, wood='hell', cur=('or3', 'or1', 'cy1'), lamp='shade', shade=('or3', 'or1'), frames=('or3', 'ol3', 'cy1'),
      wall=lambda g: w_plain(g, 'pe1', 'pe2'), floor=lambda g: f_planks(g, PL['hell']),
      rug=lambda a: rug_oval(a, ('or2', 'cy1', 'or1', 'cy1', 'ol1')), extra=lambda a: (hang_plant(a), floor_plant(a))),
 dict(name='Spielzimmer', bed=2, wood='blau', cur=('rd1', 'rd2', 'rd3'), lamp='shade', shade=('mu1', 'mu2'), frames=('qa', 'qe', 'qd'),
      wall=lambda g: w_stripes(g, 'sk3', 'sk1', 'bl1'), floor=lambda g: f_check(g, 'qe', 'pw1', 'mu3'),
      rug=lambda a: rug_oval(a, ('qa', 'qe', 'qc', 'qd', 'pw1')), extra=lambda a: bunting(a, ('qa', 'qe', 'qc', 'qd'))),
 dict(name='Retro 70er', bed=4, wood='nuss', cur=('or1', 'or2', 'or3'), lamp='shade', shade=('te1', 'te2'), frames=('mu3', 'te3', 'or3'),
      wall=lambda g: w_retro(g, 'cy1', 'or1', 'te1'), floor=lambda g: f_herring(g, 'fp1', 'fp3', 'fp4'),
      rug=lambda a: rug_oval(a, ('br1', 'or1', 'mu1', 'te1', 'cy1'))),
 dict(name='Sternennacht', bed=0, wood='nuss', cur=('nb2', 'nb5', 'nb4'), lamp='moon', frames=('nb5', 'nb2', 'nb4'), night=True, skylight=True, sill=False,
      bedmap={'gp': 'nb2', 'gp2': 'nb4', 'gp3': 'nb5', 'qa': 'nb2', 'qb': 'nb4'},
      wall=lambda g: w_stars(g, 'nb1', 'nb3', 'nb2'), floor=lambda g: f_planks(g),
      rug=lambda a: rug_oval(a, ('nb2', 'nb1', 'nb4')), extra=lambda a: lights(a)),
 dict(name='Skandi hell', bed=2, wood='hell', cur=('gy1', 'gy2', 'gy3'), lamp='shade', shade=('cy3', 'cy2'), frames=('gy3', 'sb3', 'cy1'), sill=True,
      bedmap={'qa': 'gy1', 'qc': 'sb1', 'qd': 'cy1', 'qe': 'gy3'},
      wall=lambda g: w_plain(g, 'cy3', 'cy1'), floor=lambda g: f_planks(g, PL['weiss']),
      rug=lambda a: rug_check(a, 'gy1', 'cy3'), extra=lambda a: floor_plant(a)),
 dict(name='Herbstabend', bed=3, wood='nuss', cur=('or2', 'br1', 'or1'), lamp='candle', frames=('or3', 'mu3', 'ol3'),
      wall=lambda g: (w_gingham(g, 'cy1', 'pe2', 'or3')), floor=lambda g: f_planks(g),
      rug=lambda a: rug_oval(a, ('br2', 'or1', 'mu1', 'or3')), extra=lambda a: bunting(a, ('or1', 'mu1', 'rd1', 'br1'))),
]
if __name__ == '__main__':
    from PIL import Image, ImageDraw
    def img(g, s=2):
        im = Image.new('RGB', (g.w, g.h), (255, 255, 255)); P = im.load()
        for y in range(g.h):
            for x in range(g.w):
                c = g.p[y][x]
                if c is not None:
                    h = pal[c] if c in pal else '#3a2414'; P[x, y] = tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
        return im.resize((g.w * s, g.h * s), Image.NEAREST)
    sheet = Image.new('RGB', (4 * 370 + 10, 3 * 300 + 10), (255, 255, 255)); d = ImageDraw.Draw(sheet)
    from PIL import ImageFont
    FT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
    for i, st in enumerate(SETS):
        g = scene(st); im = img(g); im.save('../bad/n2set_%02d.png' % (i + 1)); img(g, 3).save('../bad/n2set3_%02d.png' % (i + 1))
        c, r = i % 4, i // 4
        sheet.paste(im, (10 + c * 370, 20 + r * 300)); d.text((10 + c * 370, 2 + r * 300), '%d: %s  (%s)' % (i + 1, st['name'], GAMEBEDS[st['bed']][0]), fill=(0, 0, 0), font=FT)
    sheet = sheet.crop((0, 0, 4 * 370 + 10, 3 * 300 + 10)); sheet.save('../bad/n2sets_sheet.png'); print('ok')
