# the bedroom ("Leseecke" layout) as layers: every element on its own, each with colour options; merged into house.json
import json, math, random
_s = open('bed_sets.py').read().replace("if __name__ == '__main__':", "if False:"); exec(_s)
from beds_narrow import NBEDS, W as BW
from ahelp import paths
BL = 57          # left edge of the bed; the hamster lies at x 90
HX = BL + BW // 2
def mkl(fn, w=180, h=135, ol=True):
    g = G(w, h); fn(g)
    if ol: g.outline('K')
    return dict(w=g.w, h=g.h, svg=paths(g))
def hexes(*keys): return [pal[k] for k in keys]
# ---------------- colour palettes (each entry: name, then the colours that replace the item's source colours, in order) ----------------
PAL = {
 'pastell': [['Rosa', '#f9dfe4', '#f0c4cc', '#e8a0ac'], ['Pfirsich', '#f8e4cc', '#eccaa8', '#d8a880'], ['Vanille', '#fbf0cc', '#f0dca0', '#d8b860'], ['Mint', '#e0f4ea', '#bfe4d0', '#86c4a4'],
             ['Salbei', '#e4ecd8', '#c8d8b4', '#94ac80'], ['Himmelblau', '#e0eef8', '#c0dcee', '#8cb8dc'], ['Flieder', '#ece4f6', '#d4c4ec', '#a890c8'], ['Creme', '#fbf6ec', '#ece2cc', '#c8b896']],
 'nacht': [['Nachtblau', '#3e4a7a', '#4e5a8e', '#c8d0f0'], ['Violett', '#4e3e6e', '#62528a', '#d4c8f0'], ['Tannengrün', '#2e4a3e', '#3e5e50', '#bcd8c8'], ['Weinrot', '#5a2e3a', '#704050', '#f0c8d0']],
 'holz': [['Nuss', '#a06a38', '#c08a50', '#7e4e24'], ['Hell', '#e0bc84', '#f0d4a4', '#c49a5e'], ['Dunkel', '#7a4e2a', '#9a6a3e', '#5a3418'], ['Weiß', '#f4ecdc', '#fffaf0', '#e4d6bc'],
          ['Salbei', '#a8c8a0', '#c8e0c0', '#86a87e'], ['Blau', '#9cc0dc', '#c4dcee', '#7aa0c0'], ['Rosa', '#eab4bc', '#f6d4d8', '#c88a96'], ['Mint', '#b4e0cc', '#e6f8f0', '#8ec8b0']],
 'dielen': [['Honig', '#c8945a', '#bc8a50', '#dcae72', '#8a5e32'], ['Hell', '#e0bc84', '#f0d4a4', '#fbf0d8', '#c49a5e'], ['Dunkel', '#7a4e2a', '#8a5a3a', '#9a6a3e', '#5a3418'],
            ['Grau', '#c8c4bc', '#e4e0d8', '#f4f2ec', '#a8a49c'], ['Weiß', '#f4ecdc', '#fffaf0', '#ffffff', '#e4d6bc']],
 'teppichboden': [['Taubenblau', '#9aa6c0', '#8a96b2', '#b0bcd4'], ['Moos', '#7aaa52', '#5a8a3a', '#9ad070'], ['Creme', '#f4ecdc', '#e4d6bc', '#fffaf0'], ['Rosa', '#eab4bc', '#d898a4', '#f6d4d8'],
                  ['Senf', '#d8b04a', '#c09834', '#ecc870'], ['Grau', '#b8b4ac', '#a09c94', '#d0ccc4']],
 'stoff': [['Senf', '#e8b84a', '#f4d27a', '#c8962e'], ['Rosa', '#f0c4cc', '#f9dfe4', '#e8a0ac'], ['Mint', '#a8dcc4', '#d4f0e2', '#7ac0a4'], ['Himmelblau', '#9cc8e8', '#cce4f6', '#6a9ec8'],
           ['Kirschrot', '#d8685a', '#f0907e', '#b04a3e'], ['Flieder', '#c8b4e0', '#e2d6f0', '#a890c8'], ['Orange', '#e8904a', '#f8b478', '#c06a2e'], ['Nachtblau', '#4e5a8e', '#c8d0f0', '#3e4a7a'],
           ['Moosgrün', '#7aaa52', '#9ad070', '#5a8a3a'], ['Creme', '#f4ecdc', '#fffaf0', '#e4d6bc']],
 'bett': [['Rosa', '#f4a3b4', '#fbd4dc', '#e07f95'], ['Himmelblau', '#8cc4ec', '#cce6f8', '#5a9ad0'], ['Mint', '#8fd4b4', '#cdeee0', '#5aae8c'], ['Flieder', '#c4a8ec', '#e6dcf8', '#9a7ac8'],
          ['Orange', '#f29a42', '#fbd4a8', '#c8691e'], ['Sonnengelb', '#f6d36a', '#fbeab4', '#d8a83a'], ['Kirschrot', '#e8706a', '#f8c4c0', '#c0463c'], ['Salbei', '#a8c090', '#dce8cc', '#7a9a60'], ['Creme', '#f0e2c4', '#fbf4e4', '#cdb88e']],
}
TINT = {}   # cat -> list (per item) of [palette name, [source colours]] (None: no colour choice)
# ---------------- walls (each wall comes in three versions: one hole per window shape) ----------------
def wall_fn(i):
    return [lambda g: (w_flowers(g, 'rs1', 'rs3', 'rs2'), wainscot(g, 'wn1', 'wn2', 'wn3')),
            lambda g: w_stripes(g, 'pe1', 'pe3', 'pe2'),
            lambda g: w_stars(g, 'nb1', 'nb3', 'nb2'),
            lambda g: w_boards(g, 'br3', 'br1', 'lb2'),
            lambda g: w_leaves(g, 'mt3', 'ms3', 'ms1'),
            lambda g: (w_plain(g, 'pe1', 'pe2'), wainscot(g, 'wn1', 'wn2', 'wn3', 70))][i]
TINT['wall'] = [['pastell', hexes('rs1', 'rs2', 'rs3')], ['pastell', hexes('pe3', 'pe1', 'pe2')], ['nacht', hexes('nb1', 'nb2', 'nb4')], ['holz', hexes('br3', 'lb2', 'br1')],
                ['pastell', hexes('mt3', 'ms3', 'ms1')], ['pastell', hexes('pe1', 'pe2', 'pe4')]]
WC = 34, 34   # window centre
def win_in(k):
    if k == 0: return lambda x, y: ((x + .5 - WC[0]) / 11) ** 2 + ((y + .5 - WC[1]) / 11) ** 2 <= 1
    if k == 1: return lambda x, y: 24 <= x <= 44 and 22 <= y <= 46
    return lambda x, y: (24 <= x <= 44 and 32 <= y <= 47) or (((x + .5 - 34) / 10.5) ** 2 + ((y + .5 - 32) / 10) ** 2 <= 1 and y < 32)
def wall_l(i, k):
    def f(g):
        wall_fn(i)(g); beams(g); inside = win_in(k)
        for y in range(15, 50):
            for x in range(20, 50):
                if inside(x, y): g.p[y][x] = None
    return mkl(f, ol=False)
# ---------------- windows: frame, sill with plants, curtains (the colour choice is the curtains) ----------------
def window_l(k):
    def f(a):
        inside = win_in(k)
        if k == 0:
            for yy in range(19, 50):
                for xx in range(19, 50):
                    d = ((xx + .5 - 34) / 11) ** 2 + ((yy + .5 - 34) / 11) ** 2
                    if 1 < d <= 1.55: a.p[yy][xx] = 'wd' if d < 1.3 else 'wd2'
            a.rect(34, 24, 34, 44, 'wd'); a.rect(24, 34, 44, 34, 'wd')
        elif k == 1:
            a.rect(21, 19, 47, 49, 'wd')
            for yy in range(22, 47):
                for xx in range(24, 45): a.p[yy][xx] = None
            a.rect(34, 22, 34, 46, 'wd'); a.rect(24, 33, 44, 33, 'wd')
        else:
            for yy in range(18, 50):
                for xx in range(20, 49):
                    outer = (21 <= xx <= 47 and 32 <= yy <= 49) or (((xx + .5 - 34) / 13.5) ** 2 + ((yy + .5 - 32) / 13) ** 2 <= 1 and yy < 32)
                    if outer and not inside(xx, yy): a.p[yy][xx] = 'wd'
            a.rect(34, 23, 34, 47, 'wd'); a.rect(24, 36, 44, 36, 'wd')
        a.rect(18, 49, 50, 52, 'wd3'); a.rect(18, 52, 50, 52, 'wd2')
        plant(a, 28, 49); plant(a, 40, 49)
        for x0 in (12, 48):
            a.rect(x0, 16, x0 + 6, 56, 'cur1'); a.rect(x0 + 5, 16, x0 + 6, 56, 'cur3')
            for yy in range(20, 56, 5): a.rect(x0, yy, x0 + 4, yy, 'cur2')
        a.rect(10, 14, 58, 15, 'brs2')
    return mkl(f)
C(cur1='#e8b84b', cur2='#f4d27b', cur3='#c8962f')   # unique source colours for the curtains
TINT['window'] = [['stoff', hexes('cur1', 'cur2', 'cur3')]] * 3
# ---------------- floors ----------------
def floor_l(i):
    def f(g):
        if i == 0: f_planks(g)
        elif i == 1: f_herring(g, 'fp1', 'fp3', 'fp4')
        else: f_carpet(g, 'cp1', 'cp2', 'cp3')
    return mkl(f, ol=False)
TINT['floor'] = [['dielen', hexes('fp1', 'fp2', 'fp3', 'fp4')], ['dielen', hexes('fp1', 'fp2', 'fp3', 'fp4')], ['teppichboden', hexes('cp1', 'cp2', 'cp3')]]
# ---------------- rugs (centred under the bed, x 90) ----------------
C(rg1='#e8706b', rg2='#f6efe3', rg3='#c0463d')
def rug_l(i):
    def f(a):
        if i == 0: rug_oval(a, ('rg3', 'rg1', 'rg2', 'rg1', 'pw1'), cx=HX)
        elif i == 1:
            t = G(*S); rug_fur(t, 'rg2', 'pw2', 'rg1'); blit(a, t, BX, 0)
        elif i == 2:   # heart
            for y in range(104, 132):
                for x in range(HX - 24, HX + 25):
                    u, v = (x - HX) / 22, -(y - 115) / 11
                    if (u * u + v * v - 1) ** 3 - u * u * v ** 3 <= 0: a.put(x, y, 'rg1')
            for y in range(104, 132):
                for x in range(HX - 24, HX + 25):
                    u, v = (x - HX) / 15, -(y - 115) / 7.5
                    if (u * u + v * v - 1) ** 3 - u * u * v ** 3 <= 0: a.put(x, y, 'rg2')
            rell(a, HX - 9, 110, 3, 1.6, 0, 'pw1')
        elif i == 3:
            t = G(*S); rug_rect(t, 'rg3', 'rg1', 'rg2'); blit(a, t, BX, 0)
        else:
            t = G(*S); rug_check(t, 'rg1', 'rg2'); blit(a, t, BX, 0)
    return mkl(f)
TINT['rug'] = [['stoff', hexes('rg1', 'rg2', 'rg3')]] * 5
# ---------------- night stand right of... left of the bed, x 36..55, top at y 78 ----------------
def stand_l(i):
    def f(a):
        x0 = 36
        if i == 0:
            a.rect(x0, 80, x0 + 18, 99, 'wd'); a.rect(x0 - 1, 78, x0 + 19, 80, 'wd3'); a.rect(x0 + 18, 81, x0 + 18, 99, 'wd2')
            a.rect(x0 + 2, 84, x0 + 16, 90, 'wd2'); a.rect(x0 + 3, 85, x0 + 15, 89, 'wd'); a.rect(x0 + 8, 87, x0 + 10, 87, 'brs')
            a.rect(x0 + 1, 96, x0 + 2, 99, 'wd2'); a.rect(x0 + 16, 96, x0 + 17, 99, 'wd2')
        elif i == 1:   # a round side table on one leg
            rell(a, x0 + 9, 79, 11, 2.6, 0, 'wd3'); a.rect(x0 - 2, 79, x0 + 20, 81, 'wd'); a.rect(x0 - 2, 81, x0 + 20, 81, 'wd2')
            a.rect(x0 + 8, 82, x0 + 10, 97, 'wd'); a.rect(x0 + 10, 82, x0 + 10, 97, 'wd2'); a.rect(x0 + 2, 97, x0 + 16, 99, 'wd2'); a.rect(x0 + 2, 97, x0 + 16, 97, 'wd')
        else:   # a stack of big books with a wooden board on top
            for k, (y, c, w) in enumerate(((93, 'bk2', 20), (87, 'bk1', 18), (82, 'bk3', 19))):
                xx = x0 + (20 - w) // 2 - 1 + (k % 2)
                a.rect(xx, y, xx + w, y + 5, c); a.rect(xx + 1, y + 1, xx + w - 1, y + 1, 'pw1'); a.rect(xx + w, y, xx + w, y + 5, 'pw2')
            a.rect(x0 - 1, 78, x0 + 19, 81, 'wd'); a.rect(x0 - 1, 78, x0 + 19, 78, 'wd3'); a.rect(x0 - 1, 81, x0 + 19, 81, 'wd2')
    return mkl(f)
TINT['stand'] = [['holz', hexes('wd', 'wd3', 'wd2')]] * 3
# ---------------- lamps on the night stand (centre x 43, foot on y 78) ----------------
C(ls1='#e8b84c', ls2='#c8962d', ls3='#f4d27c', ms_a='#d8463d', ms_b='#a8342d', ms_c='#f07a6b', mo_a='#fff2c1', mo_b='#f0d891', st_a='#ffe08b', st_b='#e8b031')
def lamp_l(i):
    def f(a):
        x = 43
        if i == 0:
            a.rect(x - 1, 71, x, 77, 'brs'); a.rect(x - 3, 77, x + 2, 78, 'brs2')
            a.poly([(x - 4, 65), (x + 3, 65), (x + 5, 71), (x - 6, 71)], 'ls1'); a.rect(x - 6, 71, x + 5, 71, 'ls2'); a.rect(x - 4, 65, x + 3, 65, 'ls3'); a.rect(x + 3, 66, x + 4, 70, 'ls2')
        elif i == 1:
            rell(a, x, 77, 5, 1.4, 0, 'brs'); a.rect(x - 2, 69, x + 1, 76, 'cy3'); a.rect(x + 1, 70, x + 1, 76, 'cy2'); a.put(x - 1, 68, 'K'); rell(a, x - 1, 66, 1.4, 2, 0, 'lg')
            a.rect(x + 4, 74, x + 5, 76, 'brs'); a.rect(x + 3, 74, x + 3, 74, 'brs')   # a little handle
        elif i == 2:
            a.rect(x - 1, 70, x, 77, 'stem'); a.rect(x - 1, 70, x - 1, 77, 'stem2'); rell(a, x, 69, 7, 4, 0, 'ms_a'); a.rect(x - 7, 69, x + 7, 70, 'ms_b'); rell(a, x - 2, 67, 3, 1.4, 0, 'ms_c')
            a.put(x - 4, 67, 'stem'); a.put(x + 2, 66, 'stem'); a.put(x + 4, 68, 'stem')
        elif i == 3:
            a.rect(x - 1, 72, x, 77, 'brs2'); a.rect(x - 4, 77, x + 3, 78, 'brs2'); rell(a, x, 65, 6.4, 6.4, 0, 'mo_a'); rell(a, x - 2, 63, 1.6, 1.6, 0, 'mo_b'); rell(a, x + 2, 67, 1.4, 1.4, 0, 'mo_b'); a.put(x + 3, 62, 'mo_b')
        else:
            a.rect(x - 1, 72, x, 77, 'brs2'); a.rect(x - 4, 77, x + 3, 78, 'brs2'); a.poly([(x - 5, 68), (x + 5, 68), (x, 61)], 'st_a'); a.poly([(x - 5, 64), (x + 5, 64), (x, 71)], 'st_a'); a.put(x + 2, 68, 'st_b'); a.put(x + 1, 69, 'st_b')
        a.rect(48, 74, 52, 77, 'bk2'); a.rect(48, 74, 52, 74, 'bk3')   # the book on the night stand
    return mkl(f)
TINT['lamp'] = [['stoff', hexes('ls1', 'ls3', 'ls2')], ['stoff', hexes('cy3', 'cy3', 'cy2')], ['stoff', hexes('ms_a', 'ms_c', 'ms_b')], None, ['stoff', hexes('st_a', 'st_a', 'st_b')]]
TINT['lamp'][1] = ['stoff', [pal['cy3'], '#fffff1', pal['cy2']]]
# ---------------- chest under the slope with the fish tank on top (x 131..159, top y 74; the tank is the game's own sprite) ----------------
def chest_l(i):
    def f(a):
        x0 = 132
        a.rect(x0 - 1, 74, x0 + 27, 76, 'wd3'); a.rect(x0 - 1, 76, x0 + 27, 76, 'wd2')
        if i == 0:
            a.rect(x0, 77, x0 + 26, 99, 'wd'); a.rect(x0 + 26, 77, x0 + 26, 99, 'wd2')
            for y in (79, 86, 93): a.rect(x0 + 2, y, x0 + 24, y + 5, 'wd2'); a.rect(x0 + 3, y + 1, x0 + 23, y + 4, 'wd'); a.rect(x0 + 12, y + 2, x0 + 14, y + 2, 'brs')
        elif i == 1:   # open shelf with books and a basket
            a.rect(x0, 77, x0 + 26, 99, 'wd'); a.rect(x0 + 2, 78, x0 + 24, 87, 'wd2'); a.rect(x0 + 2, 90, x0 + 24, 98, 'wd2'); a.rect(x0 + 26, 77, x0 + 26, 99, 'wd2')
            books(a, x0 + 3, x0 + 23, 87, random.Random(8))
            a.poly([(x0 + 4, 91), (x0 + 22, 91), (x0 + 21, 98), (x0 + 5, 98)], 'wv');
            for yy in range(92, 98, 2): a.rect(x0 + 5, yy, x0 + 21, yy, 'wv2')
        else:   # a painted cupboard with two doors and little flowers
            a.rect(x0, 77, x0 + 26, 99, 'wd'); a.rect(x0 + 26, 77, x0 + 26, 99, 'wd2')
            for xx in (x0 + 2, x0 + 14):
                a.rect(xx, 79, xx + 10, 96, 'wd2'); a.rect(xx + 1, 80, xx + 9, 95, 'wd3')
                rell(a, xx + 5, 87, 2.4, 2.4, 0, 'fl1'); a.put(xx + 5, 87, 'fl3'); a.put(xx + 3, 90, 'lf1'); a.put(xx + 7, 90, 'lf1')
            a.put(x0 + 12, 88, 'brs'); a.put(x0 + 14, 88, 'brs'); a.rect(x0 + 1, 97, x0 + 3, 99, 'wd2'); a.rect(x0 + 23, 97, x0 + 25, 99, 'wd2')
    return mkl(f)
TINT['chest'] = [['holz', hexes('wd', 'wd3', 'wd2')]] * 3
# ---------------- decoration: nothing, hanging plant, pot plant, fairy lights, bunting ----------------
C(dp1='#d07a45', dp2='#a85a2d', dp3='#f0a071', lb_1='#ffcf6b', lb_2='#ff9a4b', lb_3='#fff2c2', bn1='#e8706c', bn2='#f0c041', bn3='#7ab0d5')
def deco_l(i):
    def f(a):
        if i == 1:
            x = 150; line(a, x, 7, x, 26, 'wd2'); a.poly([(x - 6, 26), (x + 6, 26), (x + 4, 33), (x - 4, 33)], 'dp1'); a.rect(x - 6, 26, x + 6, 26, 'dp3'); a.rect(x + 2, 27, x + 4, 32, 'dp2')
            for k in range(6): line(a, x - 5 + k * 2, 28, x - 8 + k * 3, 38 + (k % 3) * 4, 'hb'); rell(a, x - 8 + k * 3, 38 + (k % 3) * 4, 1.6, 1.2, 0, 'hb2')
        elif i == 2:
            x = 168; a.poly([(x - 6, 86), (x + 6, 86), (x + 5, 99), (x - 5, 99)], 'dp1'); a.rect(x - 6, 86, x + 6, 87, 'dp3'); a.rect(x + 3, 88, x + 5, 98, 'dp2')
            for k in range(9):
                ang = math.radians(-170 + k * 20); L = 12 + (k % 3) * 3
                line(a, x, 85, x + math.cos(ang) * L, 85 + math.sin(ang) * L, 'hb2'); rell(a, x + math.cos(ang) * L, 85 + math.sin(ang) * L, 2.6, 1.6, 0, 'hb' if k % 2 else 'hb2')
        elif i == 3:
            for k, x in enumerate(range(58, 140, 5)):
                y = 9 + int(4 * math.sin((x - 58) / 82 * math.pi)); a.put(x, y, 'wd2'); rell(a, x, y + 2, 1.4, 1.6, 0, ('lb_1', 'lb_2', 'lb_3')[k % 3])
        elif i == 4:
            line(a, 60, 10, 128, 10, 'wd2')
            for k, x in enumerate(range(62, 124, 7)): yy = 10 + int(2 * math.sin((x - 60) / 68 * math.pi)); a.poly([(x, yy), (x + 5, yy), (x + 2.5, yy + 5)], ('bn1', 'bn2', 'bn3')[k % 3])
    return mkl(f)
TINT['deco'] = [None, ['stoff', hexes('dp1', 'dp3', 'dp2')], ['stoff', hexes('dp1', 'dp3', 'dp2')], ['stoff', hexes('lb_1', 'lb_3', 'lb_2')], ['stoff', hexes('bn1', 'bn2', 'bn3')]]
# ---------------- two book shelves on the wall above the bed (hidden behind the canopy and the toadstool) ----------------
def shelf_l(g):
    rnd = random.Random(11)
    for (y, x0, x1) in ((36, 66, 112), (51, 70, 116)):
        g.rect(x0, y, x1, y + 2, 'wd'); g.rect(x0, y, x1, y, 'wd3'); g.rect(x0, y + 2, x1, y + 2, 'wd2')
        for bx in (x0 + 4, x1 - 6): g.rect(bx, y + 3, bx + 1, y + 6, 'wd2'); g.put(bx + 2, y + 3, 'wd2')
    books(g, 68, 92, 35, rnd); plant(g, 104, 35)
    books(g, 86, 112, 50, random.Random(12))
    rell(g, 76, 47, 4, 3.6, 0, 'aqw'); g.rect(73, 43, 79, 44, 'brs'); g.put(75, 46, 'wh'); g.put(77, 48, 'fish')   # a little jar with a shell... a marble jar
    rell(g, 76, 50, 4.4, 1, 0, 'aqw')
# ---------------- beds ----------------
from beds_narrow import NBEDS
DRIFT_SRC = None
TINT['bed'] = [['bett', hexes('gp', 'gp2', 'gp3')], ['bett', hexes('kn', 'kn3', 'kn2')], ['bett', hexes('mint', 'qe', 'mint2')], ['bett', hexes('lf1', 'lf3', 'lf2')],
               ['bett', hexes('mbl', 'fl3', 'fl1')], ['bett', hexes('mush', 'mush3', 'mush2')], ['bett', hexes('q3', 'cl2', 'cl3')], ['bett', ['#7aaa52', '#9ac86a', '#5a8a3a']]]
def fixed_l(g):   # roof slope and the stair railing
    slope(g); comp(g, railing(g))

if __name__ == '__main__':
    H = json.load(open('house.json')); A = H['art']
    import re
    for k in list(A):
        if re.match(r'^(bw_\d_\d|bf_\d|bwin_\d|br_\d|b_front|bw2_\d_\d)$', k): del A[k]
    for i in range(6): A['bw2_%d' % i] = mkl(lambda g, i=i: (wall_fn(i)(g), beams(g)), ol=False)
    holes = []
    for k in range(3):
        hg = G(*S); inside = win_in(k)
        for y in range(15, 50):
            for x in range(20, 50):
                if inside(x, y): hg.p[y][x] = 'K'
        holes.append(re.search(r'd="([^"]*)"', paths(hg)).group(1))
    H['bhole'] = holes
    for k in range(3): A['bwin2_%d' % k] = window_l(k)
    for i in range(3): A['bf2_%d' % i] = floor_l(i); A['bns_%d' % i] = stand_l(i); A['bch_%d' % i] = chest_l(i)
    for i in range(5): A['br2_%d' % i] = rug_l(i); A['blp_%d' % i] = lamp_l(i); A['bdc_%d' % i] = deco_l(i)
    A['b_fix2'] = mkl(fixed_l, ol=False); A['bsh'] = mkl(shelf_l)
    beds = []
    for i, (name, bf, bsz, ff, fsz, bpos, fpos, hpos) in enumerate(NBEDS):
        A['bedb_%d' % i] = dict(w=bsz[0], h=bsz[1], svg=paths(mkg(bf, *bsz))); A['bedf_%d' % i] = dict(w=fsz[0], h=fsz[1], svg=paths(mkg(ff, *fsz)))
        beds.append(dict(name=name, back=[BL + bpos[0], bpos[1]], front=[BL + fpos[0], fpos[1]], ham=[HX, hpos[1]]))
    # the driftwood bed from the workshop, narrow as well
    exec(open('drift_narrow.py').read())
    A['bedb_7'] = dict(w=BW, h=56, svg=paths(DB)); A['bedf_7'] = dict(w=BW, h=24, svg=paths(DF))
    beds.append(dict(name='Treibholz-Bett', back=[BL, 66], front=[BL, 92], ham=[HX, 100]))
    H['beds'] = beds
    H['btint'] = TINT; H['bpal'] = PAL
    json.dump(H, open('house.json', 'w')); print('bedroom layers ok', len(json.dumps(H)) // 1024, 'KB')
