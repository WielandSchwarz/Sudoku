"""Landhaus (variant 1), second round: no terrace door, calmer wall, one or two windows.
1A: one window where the door was.  1B: two windows (one above the armchair, one where the door was)."""
import json, os
from PIL import Image
from draw import Layer, P, C, INK, mul, shadow
from scene import Room, WALL, FLOOR, B, H, OLD_END
from objects import *
import variants as VV

NODOOR = Image.open(B + 'room_nodoor_native.png').convert('RGBA')   # old room (x 0..180) captured without the terrace door
BAY = Image.open(B + 'room_native.png').convert('RGBA')


def clean_px(ox, y):
    if y < 97:
        return WALL.getpixel(((ox + 8) % 16, (y + 8) % 16))
    if y < 100:
        return C('fff6e8')
    return FLOOR.getpixel((ox % 48, (y + 12) % 16))


SKIP = {'lampe': lambda x, y: x == 86 and y >= 70}   # where lamp shade and armchair touch, that column belongs to the chair


def cut(box, name=None):
    """an old piece of furniture, cut out of the capture: every pixel that differs from bare wall/floor (its floor shadow included)"""
    x0, y0, x1, y1 = box
    skip = SKIP.get(name)
    L = Layer(x1 - x0, y1 - y0)
    for y in range(y0, y1):
        for x in range(x0, x1):
            c = NODOOR.getpixel((x, y))
            if skip and skip(x, y):
                continue
            if c != clean_px(x, y):
                L.px(x - x0, y - y0, c)
    bb = L.im.getbbox()
    out = Layer(bb[2] - bb[0], bb[3] - bb[1]); out.paste(L.im.crop(bb), 0, 0)
    return out, x0 + bb[0], y0 + bb[1]


OLD = {   # boxes in the old room
    'regal': (0, 48, 38, 110), 'sessel': (38, 62, 86, 114), 'lampe': (86, 56, 104, 106),
    'uhr': (44, 10, 80, 47), 'schiffsbild': (90, 18, 118, 42), 'pinnwand': (126, 14, 166, 44),
    'geranie': (138, 50, 180, 112), 'teppich': (74, 108, 152, 132),
}


def garden(w, h):
    """the garden as it looks through the bay window today (half-size garden layers), glazing bars painted over"""
    g = BAY.crop((264, 29, 336, 72)).copy(); p = g.load()
    for x in (279 - 264, 280 - 264, 281 - 264, 299 - 264, 317 - 264, 318 - 264, 319 - 264):
        for y in range(g.height):
            p[x, y] = p[x - 1 if x - 1 not in (15, 16, 53, 54) else x - 3, y]
    for y in (48 - 29, 47 - 29):
        for x in range(g.width):
            p[x, y] = p[x, y - 2]
    x0 = (g.width - w) // 2 + 6
    return g.crop((x0, 0, x0 + w, h))


def fenster(w=44, h=40, sill_plant=False):
    """window in the style of the room's old window (props.window): white frame, 2x2 panes, white sill.
    w/h is the frame incl. sill, without curtains."""
    L = Layer(w, h)
    fh = h - 3                                   # frame height, sill below
    L.rect(0, 0, w, fh, 'c3')
    L.frame(0, 0, w, fh, INK)
    L.vl(1, 1, fh - 2, 'c4'); L.hl(1, 1, w - 2, 'c4'); L.vl(w - 2, 1, fh - 2, 'c2')
    gx0, gy0, gx1, gy1 = 4, 4, w - 4, fh - 3      # glass area
    gw, gh = gx1 - gx0, gy1 - gy0
    G = garden(gw, gh)
    L.paste(G, gx0, gy0)
    mx = gx0 + gw // 2; my = gy0 + gh // 2 - 2
    # glazing bars: ink, 2 px white, ink (like the old window), panes with a glint in the corner
    L.frame(gx0 - 1, gy0 - 1, gw + 2, gh + 2, INK)
    L.rect(mx - 2, gy0, 4, gh, INK); L.rect(mx - 1, gy0, 2, gh, 'c3')
    L.rect(gx0, my - 2, gw, 4, INK); L.rect(gx0, my - 1, gw, 2, 'c3')
    L.rect(mx - 1, my - 2, 2, 4, 'c3'); L.rect(mx - 2, my - 1, 4, 2, 'c3')
    for (ax, ay) in ((gx0, gy0), (mx + 2, gy0), (gx0, my + 2), (mx + 2, my + 2)):
        L.px(ax, ay, 'c4'); L.px(ax + 1, ay, 'c4'); L.px(ax, ay + 1, 'c4')
    # sill
    L.rect(0, fh, w, 2, 'c3'); L.hl(0, fh, w, 'c4'); L.hl(1, fh + 2, w - 2, 'c2')
    o = L.outline()
    # sill sticks out by one pixel on each side
    S = Layer(o.w + 2, o.h)
    S.paste(o, 1, 0)
    for x in (0, S.w - 1):
        S.px(x, fh, INK); S.px(x, fh + 1, INK); S.px(x, fh + 2, INK)
    S.px(1, fh + 1, 'c3'); S.px(S.w - 2, fh + 1, 'c3'); S.px(1, fh + 2, INK); S.px(S.w - 2, fh + 2, INK)
    return S


def vorhang(h=44, w=9, side='links', c=('a84858', 'c8586a', 'e07080')):
    """curtain tied back to the side, colours of the old bay window curtains"""
    d, m, l = C(c[0]), C(c[1]), C(c[2])
    L = Layer(w, h)
    tie = int(h * .62)
    for y in range(h):
        if y < tie:
            ww = w - int(round((y / tie) ** 1.4 * 4))
        else:
            ww = w - 4 + int(round(min(1, (y - tie) / (h - tie)) * 3))
        for x in range(ww):
            k = x % 3
            L.px(x, y, l if k == 0 else (m if k == 1 else d))
    L.hl(0, 0, w, m); L.hl(0, 1, w, d)
    L.hl(0, tie, w - 3, C('f6c84a')); L.px(w - 4, tie + 1, C('f6c84a'))
    o = L.outline()
    if side == 'rechts':
        o.im = o.im.transpose(0); o.p = o.im.load()
    return o


def stange(w):
    L = Layer(w, 2)
    L.rect(0, 0, w, 2, 'wd3'); L.hl(0, 0, w, 'wd4')
    L.rect(0, 0, 2, 2, 'br3'); L.rect(w - 2, 0, 2, 2, 'br3')
    return L.outline()


class Land(VV.V):
    def __init__(self, key, title):
        super().__init__(key, title, 76, 8)
        R = self.R
        for y in range(H):                     # wipe the pasted old room: back to bare wall and floor
            for x in range(R.S, R.W):
                R.L.p[x, y] = clean_px(x - R.S, y)

    def old(self, name, dx=0, dy=0, x=None, y=None, ax=None):
        """x/y: new position in old-room coordinates, ax: absolute x in the new room (e.g. in the hallway)"""
        lay, ox, oy = cut(OLD[name], name)
        nx = ax if ax is not None else self.R.o(ox if x is None else x) + dx
        ny = (oy if y is None else y) + dy
        self.R.L.paste(lay, nx, ny)
        self.items.append(dict(name=name, x=nx, y=ny, w=lay.w, h=lay.h, ebene='alt', img=lay,
                               alt_x=ox, alt_y=oy))
        return nx, ny, lay

    def window(self, name, cx, top, w=44, h=40):
        """window with rod and tied curtains; cx/top in old coordinates"""
        f = fenster(w, h)
        x = self.R.o(cx) - f.w // 2
        self.wall(name, f, x, top)
        cl = vorhang(h - 2, 9, 'links'); cr = vorhang(h - 2, 9, 'rechts')
        self.wall(name + '_vorhang_links', cl, x - 4, top - 1)
        self.wall(name + '_vorhang_rechts', cr, x + f.w - cr.w + 4, top - 1)
        st = stange(f.w + 10)
        self.wall(name + '_stange', st, x - 5, top - 4)
        return x, f


def hall(v):
    """the hallway exactly as in variant 1"""
    R = v.R
    R.hall_surface(floor=('checker', 'floor'), x0=0, x1=80, wainscot=(64, 'bw3', 'bw4', 'bw2'))
    v.seam(79, wall=False)
    v.snap()
    door = haustuer('gruen')
    v.wall('haustuer', door, 8, 101 - door.h)
    v.flat('fussmatte', fussmatte(28), 9, 101)
    hb, hooks = hakenleiste(26)
    v.wall('hakenleiste', hb, 46, 44)
    v.wall('mantel', mantel(), 46 + hooks[0] - 5, 49)
    v.wall('strohhut', hut('stroh'), 46 + hooks[1] - 7, 48)
    v.wall('schal', schal(), 46 + hooks[2] - 2, 49)
    v.stand('bank', bank(26), 46, 103)
    post, cx0 = pfosten()
    v.wall('trenner_holzpfosten', post, 80 - 3 - (cx0 + 1), 0)


def music(v):
    R = v.R
    v.old_shelf()
    top = v.stand('musiktruhe', musiktruhe(30, 24), R.o(188), 102)
    v.on_top('grammophon_messing', top, grammophon('messing'), R.o(188) + 2)
    v.stand('gummibaum', zimmerpflanze(), R.o(222), 103)


def v1a():
    v = Land('variante-1a', 'Landhaus mit einem Fenster: Fenster statt Terrassentür, Pinnwand über dem Regal, Schiffsbild neben dem Fenster')
    hall(v)
    v.old('teppich')
    v.old('regal'); v.old('sessel'); v.old('lampe'); v.old('uhr')
    v.old('pinnwand', x=1, y=16)
    v.window('fenster', 126, 26, 46, 42)
    v.old('schiffsbild', x=162, y=24)
    v.old('geranie')
    music(v)
    v.notes['hamster'] = (186, 124)
    v.notes['meta'] = dict(fenster='alt x=126 Mitte, oben y=26 (Rahmen 48x42 inkl. Bank), Vorhänge in den Farben des alten Erkerfensters')
    return v


def v1b():
    v = Land('variante-1b', 'Landhaus mit zwei Fenstern: Fenster über dem Sessel und an Stelle der Terrassentür, Uhr über dem Regal, Pinnwand rechts, Schiffsbild in der Diele')
    hall(v)
    v.old('schiffsbild', ax=49, y=18)
    v.old('teppich')
    v.old('regal'); v.old('lampe')
    v.window('fenster_sessel', 62, 22, 42, 40)
    v.old('sessel')
    v.old('uhr', x=3, y=14)
    v.window('fenster', 125, 26, 42, 42)
    v.old('pinnwand', x=151, y=16)
    v.old('geranie')
    music(v)
    v.notes['hamster'] = (186, 124)
    v.notes['meta'] = dict(fenster='zwei Fenster: alt x=62 und x=125 Mitte, Vorhänge in den Farben des alten Erkerfensters')
    return v


# ---------------------------------------------------------------- round 3: one window, cosier arrangement
def regal2():
    """second bookcase: the same carcass as the old one, new contents (books, ivy, records, wool basket)"""
    lay, ox, oy = cut(OLD['regal'])
    R = Layer(lay.w, lay.h); R.paste(lay.im, 0, 0)
    E, F = C('4e3018'), C('3e2410')
    comps = [(3, 16), (20, 31), (35, 47)]
    for y0, y1 in comps:                          # empty the compartments: bare back boards
        for y in range(y0, y1 + 1):
            for x in range(4, 32):
                R.px(x, y, F if (x - 5) % 6 == 0 else E)
    gold = C('c8a03a')

    def book(x, bottom, w, h, col, dark):
        R.rect(x, bottom - h + 1, w, h, col); R.vl(x + w - 1, bottom - h + 1, h, dark)
        R.hl(x, bottom - h + 3, w - 1, gold); R.hl(x, bottom - 2, w - 1, gold)
    # top: upright books, then a little ivy pot with tendrils
    x = 5
    for w, h, c, d in ((3, 12, 'g2', 'g1'), (2, 10, 'r3', 'r1'), (3, 11, 'u3', 'u2'), (2, 12, 'y1', 'wd2'), (3, 9, 'lav2', 'lav1')):
        book(x, 16, w, h, P[c], P[d]); x += w
    R.rect(21, 12, 7, 5, P['o2']); R.hl(20, 12, 9, P['o3']); R.vl(27, 13, 4, P['o1'])
    for px_, py_ in ((21, 10), (23, 9), (25, 10), (27, 9), (22, 11), (26, 11)):
        R.px(px_, py_, P['g3']); R.px(px_ + 1, py_, P['g4'])
    for py_ in range(13, 19):
        R.px(20 if py_ % 2 else 19, py_, P['g2'])
    for py_ in range(13, 21):
        R.px(29 if py_ % 2 else 30, py_, P['g2'])
    # middle: three books lying flat, records standing
    for i, (c, d) in enumerate((('r3', 'r1'), ('c2', 'c1'), ('u3', 'u2'))):
        y = 31 - i * 2
        R.rect(5 + i % 2, y - 1, 10 - i, 2, P[c]); R.hl(5 + i % 2, y, 10 - i, P[d])
    R.rect(7, 23, 4, 3, P['c3']); R.hl(7, 23, 4, P['c4']); R.px(10, 25, P['c1'])    # a little candle-cup on the books
    for i, c in enumerate(('pk2', 'k2', 'y2', 'k2', 'mint1', 'r4', 'k2', 'u4', 'o3')):
        R.vl(18 + i, 22 + (i % 3 == 1), 10 - (i % 3 == 1), P[c])
    # bottom: wicker basket with wool, books leaning
    R.rect(5, 41, 12, 7, P['y1']); R.hl(5, 41, 12, P['y3'])
    for xx in range(5, 17, 2):
        R.vl(xx, 42, 6, P['bw3'])
    R.rect(7, 38, 4, 3, P['pk2']); R.px(7, 38, P['pk3']); R.rect(11, 39, 4, 2, P['mint2']); R.px(11, 39, P['mint3'])
    x = 19
    for w, h, c, d in ((3, 11, 'o2', 'o1'), (3, 12, 'g3', 'g2'), (2, 10, 'c2', 'c1'), (3, 12, 'r2', 'r1')):
        book(x, 47, w, h, P[c], P[d]); x += w
    return R


def v1c():
    v = Land('variante-1c', 'Landhaus gemütlich: ein Fenster rechts, Leselampe zwischen Regal und Sessel, Grammophon neben dem Sessel, zweites Bücherregal')
    hall(v)
    S = v.R.S
    # floor and wall pieces, back to front
    v.old('teppich', x=62)
    v.old('pinnwand', x=1, y=16)
    v.old('uhr', x=63)
    v.old_shelf(dy=-6, x=99)                  # the wall shelf (and the ship model) moves along with the gramophone
    v.window('fenster', 180, 26, 46, 42)
    v.old('schiffsbild', x=216, y=24)
    v.old('regal')
    v.old('lampe', x=39)
    v.old('sessel', x=55)
    top = v.stand('musiktruhe', musiktruhe(30, 24), v.R.o(106), 102)
    v.on_top('grammophon_messing', top, grammophon('messing'), v.R.o(106) + 2)
    v.old('geranie', x=160)
    r2 = regal2()
    v.R.L.paste(r2, v.R.o(210), 54)
    v.items.append(dict(name='regal_zwei', x=v.R.o(210), y=54, w=r2.w, h=r2.h, ebene='boden', img=r2))
    v.notes['hamster'] = (S + 128, 124)
    v.notes['meta'] = dict(fenster='alt x=180 Mitte, oben y=26')
    return v


if __name__ == '__main__':
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else 'out2'
    lay = {}
    for f in (v1a, v1b, v1c):
        v = f(); lay[v.key] = v.export(out); print(v.key, v.R.W, len(v.items))
    json.dump(dict(einheit='1 Bildpixel = 1 Raumpixel; y=0 oben, Fußleiste y=97..99, Boden ab y=100',
                   reihenfolge='Teile in der Liste von oben nach unten zeichnen (später = weiter vorne). ebene "alt" = Möbel aus dem bisherigen Zimmer, alt_x/alt_y = bisherige Position',
                   varianten=lay), open(out + '/layout.json', 'w'), ensure_ascii=False, indent=1)
