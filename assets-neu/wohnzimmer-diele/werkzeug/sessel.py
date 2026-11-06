"""Ten cosy armchairs in the format of the selectable chairs (furn2.json "chair": 48x42, 'seat' = y of the seat surface).
Every chair is built from parts (back, arms, seat cushion, base), each part filled with soft 'pillow' shading
(light from the top left) and its own 1px ink outline, so the pieces read as plump volumes."""
import math, os
from PIL import Image
from draw import Layer, P, C, INK, mul

W, H = 48, 42


def hsh(x, y, s=0):
    return ((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) & 0xffff


def shape(w, h, fn):
    """mask layer from a function fn(x, y) -> bool"""
    L = Layer(w, h)
    for y in range(h):
        for x in range(w):
            if fn(x, y):
                L.px(x, y, (255, 0, 255, 255))
    return L


def rrect(x0, y0, x1, y1, r):
    def f(x, y):
        if not (x0 <= x <= x1 and y0 <= y <= y1):
            return False
        cx = min(max(x, x0 + r), x1 - r); cy = min(max(y, y0 + r), y1 - r)
        return (x - cx) ** 2 + (y - cy) ** 2 <= r * r + r * .8
    return f


def shade(L, pal, pattern=None, band=1, soft=True):
    """pillow shading on every opaque pixel: top/left light, bottom/right dark, then an optional pattern"""
    d2, d, m, l, l2 = pal
    src = L.im.copy().load()
    inn = lambda x, y: 0 <= x < L.w and 0 <= y < L.h and src[x, y][3] > 0
    for y in range(L.h):
        for x in range(L.w):
            if not inn(x, y):
                continue
            dt = next((k for k in range(1, 6) if not inn(x, y - k)), 6)
            db = next((k for k in range(1, 6) if not inn(x, y + k)), 6)
            dl = next((k for k in range(1, 6) if not inn(x - k, y)), 6)
            dr = next((k for k in range(1, 6) if not inn(x + k, y)), 6)
            c = m
            if db <= band:
                c = d2 if db == 1 and soft else d
            elif dr <= band:
                c = d
            elif dt <= band:
                c = l2 if dt == 1 else l
            elif dl <= band:
                c = l
            elif soft and (db <= band + 1 or dr <= band + 1):
                c = d
            if pattern:
                c = pattern(x, y, c, dict(dt=dt, db=db, dl=dl, dr=dr)) or c
            L.p[x, y] = c if isinstance(c, tuple) else P[c] if isinstance(c, str) and c in P else C(c)
    return L


def part(w, h, fn, pal, pattern=None, band=1, x=0, y=0):
    L = shape(w, h, fn)
    shade(L, pal, pattern, band)
    return L


def tc(c):
    return c if isinstance(c, tuple) else (P[c] if c in P else C(c))


def pal5(base, k=(.62, .8, 1.0, 1.14, 1.26)):
    b = tc(base)
    return tuple(mul(b, f) for f in k)


class Chair:
    def __init__(self):
        self.L = Layer(W, H)
        self.seat = 30

    def add(self, layer, outline=True, x=0, y=0):
        o = layer.outline() if outline else layer
        self.L.paste(o, x - (1 if outline else 0), y - (1 if outline else 0))

    def done(self):
        return self.L


# ------------------------------------------------------------------ common parts
def legs_turned(ch, xs, top, col=('wd1', 'wd2', 'wd3')):
    for x in xs:
        L = Layer(3, H - top)
        L.rect(0, 0, 3, H - top, col[1]); L.vl(0, 0, H - top, col[2]); L.hl(0, 1, 3, col[0])
        L.px(1, H - top - 1, col[0])
        ch.add(L, x=x, y=top)


def legs_bun(ch, xs, top, col=('wd1', 'wd2', 'wd3')):
    for x in xs:
        L = Layer(4, H - top)
        L.ell(2, (H - top) / 2, 2, (H - top) / 2, col[1]); L.px(1, 1, col[2])
        ch.add(L, x=x, y=top)


def cushion(ch, x0, y0, x1, y1, pal, pattern=None, piping=None):
    """plump seat cushion with a puffy front"""
    w, h = x1 - x0 + 1, y1 - y0 + 1
    L = part(w, h, rrect(0, 0, w - 1, h - 1, 2), pal, pattern, band=1)
    if piping:
        L.hl(1, h - 2, w - 2, piping)
    ch.add(L, x=x0, y=y0)
    ch.seat = y0 + 1


def throw_pillow(ch, x, y, w, h, pal, pattern=None, tilt=0):
    L = part(w, h, rrect(0, 0, w - 1, h - 1, 1), pal, pattern)
    # pinched corners
    for (cx, cy) in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        L.p[cx, cy] = (0, 0, 0, 0)
    L.px(w // 2, h // 2, pal[1])
    ch.add(L, x=x, y=y)


def blanket(ch, x, y, w, h, pal, kind='strick', fringe='c3'):
    """a throw draped over the arm: hangs down with a wavy hem"""
    def fn(xx, yy):
        hem = h - 1 - (1 if (xx // 2) % 2 else 0)
        return 0 <= xx < w and 0 <= yy <= hem
    def pat(xx, yy, c, e):
        if kind == 'strick':                         # cable knit: braided columns
            k = xx % 4
            if k == 0:
                return pal[1]
            if k == 2 and (yy + (xx // 4)) % 3 == 0:
                return pal[3]
        elif kind == 'karo':
            if xx % 4 == 1 or yy % 4 == 1:
                return pal[3] if (xx % 4 == 1 and yy % 4 == 1) else pal[1]
        elif kind == 'patch':
            cols = ['r3', 'y2', 'u3', 'g3', 'pk2', 'o3']
            if e['db'] > 1 and e['dr'] > 1:
                return tc(cols[((xx // 5) + (yy // 5) * 2) % len(cols)])
        return None
    L = part(w, h, fn, pal, pat)
    o = L.outline()
    if fringe:
        for xx in range(1, o.w - 1, 2):
            o.px(xx, o.h - 1, fringe)
    ch.L.paste(o, x - 1, y - 1)


def buttons_diamond(dx, dy, ox=0, oy=0, line=None, btn=None):
    """tufting: diamond seams with buttons in the corners"""
    def pat(x, y, c, e):
        if e['dt'] <= 1 or e['db'] <= 1 or e['dl'] <= 1 or e['dr'] <= 1:
            return None
        u = (x - ox) % dx; v = (y - oy) % dy
        if u == 0 and v == 0 and btn:
            return btn
        if line and (abs(u * dy - v * dx) < dy * .6 or abs((dx - u) * dy - v * dx) < dy * .6):
            return line
        return None
    return pat


def wings(ch, pal, pattern=None, x0=4, x1=36, top=6, h=20):
    """the 'ears' of a wingback: two rounded flaps behind the back, sticking out at the sides"""
    for xa in (x0, x1):
        ch.add(part(9, h, rrect(0, 0, 8, h - 1, 4), pal, pattern, band=2), x=xa, y=top)


# ------------------------------------------------------------------ the ten chairs
def ohrensessel_decke():
    """1 red velvet wingback with a chunky cream knitted throw over the arm"""
    ch = Chair(); pal = pal5('c8463c'); pv = pal5('b8394a')
    wings(ch, pal5('b83c34'), x0=3, x1=36, top=5, h=22)
    back = part(28, 30, rrect(0, 0, 27, 29, 6), pal, buttons_diamond(6, 5, 2, 3, mul(pal[2], .86), pal[0]), band=2)
    ch.add(back, x=10, y=1)
    for xa in (1, 37):
        arm = part(10, 18, rrect(0, 0, 9, 17, 4), pal, band=2)
        arm.ell(5, 3.5, 3, 3, None, lambda x, y, dx, dy: pal[3] if dx * dx + dy * dy < .35 else pal[1])   # rolled scroll at the front
        ch.add(arm, x=xa, y=19)
    cushion(ch, 10, 27, 37, 33, pal5('d85a4a'))
    ch.add(part(46, 5, rrect(0, 0, 45, 4, 1), pal5('a8342c')), x=1, y=34)
    legs_turned(ch, (5, 40), 39)
    blanket(ch, 34, 17, 11, 21, pal5('f0e2c4'), 'strick', fringe=None)
    return ch, 'Ohrensessel mit Strickdecke', 'roter Samt, Knopfheftung, Rollarmlehnen, dicke Strickdecke über der Lehne'


def rundsessel_senf():
    """2 mustard tub chair with deep tufting and a round pillow"""
    ch = Chair(); pal = pal5('e0a830')
    back = part(44, 30, lambda x, y: ((x - 21.5) / 22) ** 2 + ((y - 22) / 22) ** 2 <= 1 and y < 30, pal,
                buttons_diamond(7, 5, 1, 4, mul(pal[2], .84), pal[0]), band=2)
    ch.add(back, x=2, y=2)
    for xa in (2, 37):
        ch.add(part(9, 14, rrect(0, 0, 8, 13, 4), pal, band=2), x=xa, y=22)
    cushion(ch, 10, 27, 37, 34, pal5('eab446'), piping=pal5('e0a830')[1])
    rp = Layer(11, 11); rp.ell(5.5, 5.5, 5.5, 5.5, (255, 0, 255, 255)); shade(rp, pal5('c86848'))
    for k in range(8):
        a = k * math.pi / 4; rp.px(int(5.5 + math.cos(a) * 3.5), int(5.5 + math.sin(a) * 3.5), pal5('c86848')[1])
    rp.px(5, 5, P['br3'])
    ch.add(rp, x=12, y=17)
    ch.add(part(40, 3, rrect(0, 0, 39, 2, 1), pal5('b8862a')), x=4, y=36)
    legs_turned(ch, (8, 36), 39, ('k2', 'k3', 'k4'))
    return ch, 'Gelber Rundsessel', 'Senfgelb, tiefe Knopfheftung, rundes Zierkissen, schwarze Beine'


def chesterfield():
    """3 cognac leather chesterfield: rolled arms at the same height as the back, deep buttons, gloss"""
    ch = Chair(); pal = pal5('a8642c', (.55, .78, 1.0, 1.18, 1.36))
    def gloss(x, y, c, e):
        if e['dt'] > 1 and e['dl'] > 1 and (x + y) % 11 == 0 and e['db'] > 2:
            return pal[3]
        return None
    bt = buttons_diamond(5, 4, 2, 2, mul(pal[2], .82), pal[0])
    back = part(38, 22, rrect(0, 0, 37, 21, 3), pal, lambda x, y, c, e: bt(x, y, c, e) or gloss(x, y, c, e), band=2)
    ch.add(back, x=5, y=6)
    for xa in (1, 37):
        arm = part(10, 26, rrect(0, 0, 9, 25, 4), pal, bt, band=2)
        arm.ell(5, 4, 4, 4, None, lambda x, y, dx, dy: pal[0] if dx * dx + dy * dy < .12 else (pal[1] if dx * dx + dy * dy < .5 else pal[3]))
        ch.add(arm, x=xa, y=10)
    cushion(ch, 10, 25, 37, 32, pal, gloss)
    ch.add(part(46, 6, rrect(0, 0, 45, 5, 1), pal, buttons_diamond(5, 6, 2, 3, None, pal[1])), x=1, y=33)
    legs_bun(ch, (4, 40), 39)
    return ch, 'Chesterfield', 'Cognacfarbenes Leder, Rollarmlehnen, Knöpfe, Glanzlichter, Kugelfüße'


def korbsessel():
    """4 rattan armchair with thick cream cushions, a sheepskin over the back"""
    ch = Chair(); pal = pal5('c8964a')
    def weave(x, y, c, e):
        if e['db'] <= 1 or e['dr'] <= 1:
            return None
        k = ((x // 2) + (y // 2)) % 2
        return pal[3] if (k == 0 and (x + y) % 2 == 0) else (pal[1] if k == 1 and x % 2 == 0 else None)
    back = part(42, 32, lambda x, y: ((x - 20.5) / 21) ** 2 + ((y - 30) / 30) ** 2 <= 1 and y < 32, pal, weave, band=1)
    ch.add(back, x=3, y=1)
    for xa in (2, 38):
        ch.add(part(8, 14, rrect(0, 0, 7, 13, 3), pal, weave), x=xa, y=21)
    # sheepskin over the top of the back: fluffy white, irregular edge
    sk = shape(28, 12, lambda x, y: y <= 8 + (hsh(x, 0, 3) % 3) and ((x - 13.5) / 14) ** 2 + ((y - 9) / 9) ** 2 <= 1)
    shade(sk, pal5('f4ece0'), lambda x, y, c, e: pal5('f4ece0')[1] if hsh(x, y, 5) % 7 == 0 else None)
    ch.add(sk, x=10, y=2)
    throw_pillow(ch, 14, 16, 20, 10, pal5('e8d8bc'), lambda x, y, c, e: P['g3'] if (x % 6 == 3 and y % 4 == 2) else None)
    cushion(ch, 9, 26, 38, 33, pal5('efe2c8'), piping=pal5('efe2c8')[1])
    ch.add(part(40, 3, rrect(0, 0, 39, 2, 1), pal, weave), x=4, y=35)
    for x in (7, 37):
        L = Layer(3, 4); L.rect(0, 0, 3, 4, pal[1]); L.vl(0, 0, 4, pal[3]); ch.add(L, x=x, y=38)
    return ch, 'Korbsessel mit Schaffell', 'Rattan-Geflecht, dicke Leinenkissen, Schaffell über der Lehne'


def bluemchen_volant():
    """5 chintz wingback in cream with little roses and a ruffled skirt to the floor"""
    ch = Chair(); pal = pal5('f2e4cc', (.72, .86, 1.0, 1.05, 1.08))
    def roses(x, y, c, e):
        if e['db'] <= 1 or e['dr'] <= 1:
            return None
        u, v = x % 7, (y + (x // 7) * 3) % 6
        if (u, v) in ((3, 2), (4, 2), (3, 3), (4, 3)):
            return P['pk2'] if (u, v) != (3, 2) else P['pk3']
        if (u, v) in ((2, 3), (5, 2)):
            return P['g3']
        return None
    wings(ch, pal, roses, x0=3, x1=36, top=5, h=21)
    back = part(28, 30, rrect(0, 0, 27, 29, 7), pal, roses, band=2)
    ch.add(back, x=10, y=1)
    for xa in (1, 37):
        arm = part(10, 15, rrect(0, 0, 9, 14, 4), pal, roses, band=2)
        ch.add(arm, x=xa, y=20)
    cushion(ch, 10, 26, 37, 32, pal, roses, piping=P['pk2'])
    # ruffled skirt (Volant): pleats down to the floor
    def frill(x, y, c, e):
        k = x % 3
        return pal[3] if k == 0 else (pal[1] if k == 2 else None)
    sk = part(46, 8, lambda x, y: y < 7 or x % 3 != 2, pal5('f0c8cc'), frill)
    ch.add(sk, x=1, y=33)
    throw_pillow(ch, 26, 19, 9, 8, pal5('e88a9c'))
    return ch, 'Blümchen-Ohrensessel', 'Cremefarben mit kleinen Rosen, rosa Paspel, Rüschenvolant bis zum Boden'


def cordsessel():
    """6 deep moss-green corduroy armchair, very wide and low, oversized arms, round knitted pouf pillow"""
    ch = Chair(); pal = pal5('5a8a4a')
    cord = lambda x, y, c, e: (mul(c, .9) if x % 2 == 0 and e['dt'] > 1 and e['db'] > 1 else None)
    back = part(38, 24, rrect(0, 0, 37, 23, 8), pal, cord, band=2)
    ch.add(back, x=5, y=5)
    for xa in (1, 35):
        ch.add(part(12, 20, rrect(0, 0, 11, 19, 6), pal, cord, band=2), x=xa, y=17)
    cushion(ch, 12, 25, 35, 33, pal5('6a9a58'), lambda x, y, c, e: (mul(c, .9) if x % 2 == 0 and e['dt'] > 1 and e['db'] > 1 else None))
    throw_pillow(ch, 15, 15, 17, 11, pal5('e8955a'), lambda x, y, c, e: (P['o4'] if (x + y) % 4 == 0 and e['dt'] > 1 else None))
    ch.add(part(44, 4, rrect(0, 0, 43, 3, 1), pal5('4a7a3a'), cord), x=2, y=36)
    legs_bun(ch, (6, 38), 40, ('wd2', 'wd3', 'wd4'))
    return ch, 'Cord-Kuschelsessel', 'Moosgrüner Breitcord, extra breite runde Lehnen, oranges Kissen'


def schaukelstuhl():
    """7 wooden rocking chair with patchwork cushions and a blanket"""
    ch = Chair(); wd = ('wd1', 'wd2', 'wd3')
    L = Layer(W, H)
    for x in (9, 36):                                   # posts
        L.rect(x, 2, 3, 34, wd[1]); L.vl(x, 2, 34, wd[2])
    L.rect(9, 1, 30, 3, wd[1]); L.hl(9, 1, 30, wd[2])    # top rail
    for x in range(14, 35, 5):                          # spindles
        L.rect(x, 4, 2, 22, wd[1]); L.vl(x, 4, 22, wd[2])
    L.rect(4, 22, 40, 3, wd[1]); L.hl(4, 22, 40, wd[2])  # arms
    for x in (5, 41):
        L.rect(x, 25, 2, 9, wd[1])
    ch.add(L)
    # rockers
    R = Layer(46, 5)
    for x in range(46):
        y = 4 - int(round(3 * ((x - 22.5) / 22.5) ** 2))
        R.px(x, y, wd[1]); R.px(x, y - 1, wd[2])
    ch.add(R, x=1, y=36)
    for x in (9, 36):
        ch.add(part(3, 4, lambda xx, yy: True, ('wd0', 'wd1', 'wd2', 'wd3', 'wd3')), x=x, y=34)
    patch = lambda x, y, c, e: (tc(['r3', 'y2', 'u4', 'g4', 'pk2', 'o3'][((x // 5) + (y // 4) * 2) % 6]) if e['dt'] > 1 and e['db'] > 1 and e['dl'] > 1 and e['dr'] > 1 else None)
    ch.add(part(20, 16, rrect(0, 0, 19, 15, 3), pal5('e8d8bc'), patch, band=1), x=14, y=8)
    cushion(ch, 11, 27, 36, 32, pal5('e8d8bc'), patch)
    blanket(ch, 34, 21, 10, 14, pal5('7aa6b4'), 'karo', fringe='c3')
    return ch, 'Schaukelstuhl mit Patchwork', 'Holz mit Sprossen und Kufen, Patchwork-Polster, karierte Decke über der Lehne'


def teddysessel():
    """8 cream teddy/bouclé lounge chair, all round, with a little knitted heart pillow"""
    ch = Chair(); pal = pal5('efe4d2', (.74, .87, 1.0, 1.04, 1.07))
    fluff = lambda x, y, c, e: (pal[1] if hsh(x, y, 9) % 6 == 0 and e['dt'] > 1 else (pal[4] if hsh(x, y, 4) % 9 == 0 else None))
    back = part(44, 30, lambda x, y: ((x - 21.5) / 22) ** 2 + ((y - 20) / 20) ** 2 <= 1 and y < 30, pal, fluff, band=2)
    ch.add(back, x=2, y=2)
    for xa in (1, 36):
        ch.add(part(11, 17, rrect(0, 0, 10, 16, 5), pal, fluff, band=2), x=xa, y=21)
    cushion(ch, 11, 27, 36, 34, pal, fluff)
    hp = Layer(11, 9)
    hp.ascii(0, 0, ["..xxx.xxx..", ".xxxxxxxxx.", "xxxxxxxxxxx", "xxxxxxxxxxx", ".xxxxxxxxx.", "..xxxxxxx..", "...xxxxx...", "....xxx....", ".....x....."], {'x': (255, 0, 255, 255)})
    shade(hp, pal5('d07868'))
    ch.add(hp, x=19, y=18)
    ch.add(part(40, 3, rrect(0, 0, 39, 2, 1), pal5('c8b49a')), x=4, y=37)
    legs_bun(ch, (9, 35), 40, ('wd2', 'wd3', 'wd4'))
    return ch, 'Teddy-Sessel', 'Cremefarbener Teddystoff, ganz runde Form, gestricktes Herzkissen'


def grossvatersessel():
    """9 tartan grandfather wingback with a crocheted doily on the back and turned legs"""
    ch = Chair(); pal = pal5('3e7c3c')
    def tartan(x, y, c, e):
        if e['db'] <= 1 or e['dr'] <= 1:
            return None
        a, b = x % 8, y % 8
        if a in (2, 3) and b in (2, 3):
            return P['y2']
        if a in (2, 3) or b in (2, 3):
            return P['r3'] if (a + b) % 2 else P['r2']
        if a == 6 or b == 6:
            return pal[1]
        return None
    wings(ch, pal5('2e6c30'), tartan, x0=3, x1=36, top=4, h=22)
    back = part(28, 31, rrect(0, 0, 27, 30, 5), pal, tartan, band=2)
    ch.add(back, x=10, y=1)
    # doily
    dl = Layer(14, 6)
    for x in range(14):
        for y in range(6 - (1 if x % 3 == 1 else 0)):
            if (x + y) % 2 == 0 or y < 2:
                dl.px(x, y, P['c3'])
    ch.add(dl, x=17, y=1)
    for xa in (1, 37):
        arm = part(10, 17, rrect(0, 0, 9, 16, 3), pal, tartan, band=2)
        arm.ell(5, 3, 3.5, 3, None, lambda x, y, dx, dy: pal[3] if dx * dx + dy * dy < .4 else pal[1])
        ch.add(arm, x=xa, y=19)
    cushion(ch, 10, 26, 37, 33, pal, tartan)
    ch.add(part(46, 4, rrect(0, 0, 45, 3, 1), pal5('2e5c30')), x=1, y=34)
    legs_turned(ch, (5, 40), 38, ('wd1', 'wd2', 'wd4'))
    return ch, 'Karierter Großvatersessel', 'Grüner Schottenkaro-Stoff, Häkeldeckchen auf der Lehne, gedrechselte Beine'


def muschelsessel():
    """10 dusty-rose velvet shell chair with channel tufting and a fringe"""
    ch = Chair(); pal = pal5('d88a94')
    def channels(x, y, c, e):
        if e['db'] <= 1:
            return None
        a = math.atan2(y - 31, (x - 21.5) * 1.4)
        if abs(math.sin(a * 4.5)) < .12 and e['dt'] > 1:
            return pal[0]
        if abs(math.sin(a * 4.5 - .3)) < .14 and e['dt'] > 1:
            return pal[3]
        return None
    def fn(x, y):
        a = math.atan2(y - 31, x - 21.5); r = math.hypot((x - 21.5) / 21, (y - 31) / 30)
        edge = 1 - .06 * (1 - abs(math.cos(a * 4.5)))
        return y < 31 and r <= edge
    back = part(44, 31, fn, pal, channels, band=1)
    ch.add(back, x=2, y=0)
    cushion(ch, 6, 26, 41, 34, pal5('e09aa4'), piping=pal[1])
    throw_pillow(ch, 17, 18, 14, 9, pal5('f4ece0'), lambda x, y, c, e: P['pk2'] if (x + y) % 3 == 0 and e['dt'] > 1 and e['db'] > 1 else None)
    ch.add(part(40, 3, rrect(0, 0, 39, 2, 1), pal5('b86a78')), x=4, y=36)
    fr = Layer(40, 2)
    for x in range(0, 40, 2):
        fr.px(x, 0, P['br3']); fr.px(x, 1, P['br2'])
    ch.L.paste(fr, 4, 39)
    legs_turned(ch, (10, 35), 40, ('br1', 'br2', 'br3'))
    return ch, 'Muschelsessel', 'Altrosa Samt mit Pfeifensteppung, Fransenborte, Messingbeine'


ALL = [ohrensessel_decke, rundsessel_senf, chesterfield, korbsessel, bluemchen_volant,
       cordsessel, schaukelstuhl, teddysessel, grossvatersessel, muschelsessel]


def build():
    out = []
    for f in ALL:
        ch, name, desc = f()
        L = ch.done()
        bb = L.im.getbbox()
        out.append(dict(id=f.__name__, name=name, beschreibung=desc, img=L, seat=ch.seat, bbox=bb))
    return out


if __name__ == '__main__':
    import sys, json
    out = sys.argv[1] if len(sys.argv) > 1 else 'sessel_out'
    os.makedirs(out, exist_ok=True)
    meta = []
    for i, c in enumerate(build(), 1):
        fn = '%02d_%s.png' % (i, c['id'])
        c['img'].im.save(os.path.join(out, fn))
        meta.append(dict(datei=fn, id=c['id'], name=c['name'], beschreibung=c['beschreibung'], w=W, h=H, seat=c['seat']))
    json.dump(meta, open(os.path.join(out, 'sessel.json'), 'w'), ensure_ascii=False, indent=1)
    print(len(meta))
